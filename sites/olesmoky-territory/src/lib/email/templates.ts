import type { DeskLine } from "@/domain/selectors/orderDesk";
import type { OrderLane } from "@/data/tradeTerms";
import type { Account } from "@/domain/types";
import { CHANNEL_META } from "@/domain/channels";
import { weeklyRate } from "@/domain/rate";
import {
  nextEventForChannel,
  daysUntil,
  formatEventDate,
} from "@/data/events";
import { DELIVERY_WINDOW } from "./deliveryWindow";

/**
 * Drafts. The rep's own line, and nothing else.
 *
 * These used to be whole letters — an opener, the order list, and a close
 * — dropped into an email that ALREADY carried the order list and the
 * close. So a manager opened a message that asked twice and totalled
 * twice. That was a structural mistake, not a wording one.
 *
 * The email owns the structure now: the ask sits at the top, the order
 * sits under it, the safety valve sits under that. All a draft supplies is
 * the sentence a rep would actually type before hitting send — the human
 * bit at the top of an otherwise prepared message.
 *
 * ── THE THING THIS FILE GOT WRONG UNTIL NOW ───────────────────────
 * There was one voice, and it was a CHAIN GROCERY voice: banner
 * authorization, cold box, weekend volume, cases a week. Written for a
 * category buyer at a supermarket group.
 *
 * Ole Smoky in this territory is not in supermarkets. It is in twelve
 * independent bottle shops and fifteen bars, per the brand's own store
 * locator. Sending a chain-buyer email to a man who owns one liquor
 * store is not merely off-key — it is addressed to a decision structure
 * that does not exist there. There is no banner. There is no listing to
 * chase. There is him, and the shelf behind him, and he decides in the
 * time it takes to read two sentences.
 *
 * So there are three voices now, and the account picks which one:
 *
 *   SPECIALTY RETAIL — an owner-operator. Short, concrete, no
 *   institutional language, and the ask is a case count. What persuades
 *   here is margin per facing and the fact that somebody did the count
 *   for him.
 *
 *   ON-PREMISE — a bar manager. The unit is a POUR, not a case, and the
 *   arithmetic is done in the message rather than left to them. What
 *   persuades here is that the ask is small and the staff will pour it.
 *
 *   EVENT — a dated reason to act, for the venues that have one. See
 *   events.ts, and see the compliance line, which is not decoration.
 *
 * ── WHY THEY ARE SHORT ────────────────────────────────────────────
 * Reply behaviour, measured across 16 billion messages: a phone reply
 * runs a median of twenty words, a desktop reply sixty. Roughly nine in
 * ten opens happen in Apple Mail or Gmail, and average attention on a
 * message is about eleven seconds. Long prose does not get read on a
 * phone behind a bar; it gets deferred to a desk, and deferral is how the
 * order dies. Response-rate data puts the plateau around fifty to a
 * hundred and twenty five words for the whole message, so the note gets a
 * few dozen at most.
 *
 * ── WHAT IS DELIBERATELY ABSENT ───────────────────────────────────
 * No invented scarcity, which a manager on a weekly route discovers
 * within one delivery cycle. No assumed opt-out — "I will send it unless
 * I hear otherwise" is unordered merchandise and a negative-option
 * practice. No second ask, no soft "any thoughts", which measured WORSE
 * than asking nothing at all. No manufactured deadline: the cutoff is a
 * load schedule, and it is real.
 *
 * And nothing, anywhere, that offers to pay an account for anything. See
 * the note on the event draft.
 */

export interface EmailTemplate {
  id: string;
  label: string;
  blurb: string;
  note: string;
  /**
   * A rule the rep has to hold while sending this one. Rendered beside
   * the draft rather than buried in a comment, because the drafts that
   * need a compliance line are exactly the drafts somebody will edit.
   */
  guardrail?: string;
}

/** "A, B and C", or "A, B and 4 more" past the limit. */
function list(items: string[], limit = 3): string {
  const uniq = [...new Set(items)];
  if (uniq.length === 0) return "";
  if (uniq.length === 1) return uniq[0];
  const head = uniq.slice(0, limit);
  const rest = uniq.length - head.length;
  if (rest > 0) return `${head.join(", ")} and ${rest} more`;
  return `${head.slice(0, -1).join(", ")} and ${head[head.length - 1]}`;
}

export function templatesFor(
  lines: DeskLine[],
  _lane: OrderLane,
  _quantities: Record<string, number>,
  ctx: {
    territoryName: string;
    storeName?: string;
    totalCases: number;
    account?: Account;
  },
): EmailTemplate[] {
  const empty = lines.filter((l) => l.urgency === "critical");
  const short = lines.filter((l) => l.urgency === "high");
  const fresh = lines.filter((l) => l.urgency === "new");

  const emptyNames = list(empty.map((l) => l.label));
  const shortNames = list(short.map((l) => l.label));
  const freshNames = list(fresh.map((l) => l.label));

  /*
    Read from the line, not from the sentence.

    This used to regex the figure out of `why`, which broke the day the
    copy changed and shipped a message with a hole in the middle of it.
    See the note on DeskLine.weeklyCases.
  */
  const weekly = lines.reduce((n, l) => n + (l.weeklyCases ?? 0), 0);

  const store = ctx.storeName ?? "your store";
  const account = ctx.account;
  const onPremise = account
    ? CHANNEL_META[account.channel].venueClass === "on-premise"
    : false;

  return onPremise
    ? onPremiseDrafts({ account, lines, empty, short, fresh, emptyNames, shortNames, freshNames, store })
    : retailDrafts({ account, empty, short, fresh, emptyNames, shortNames, freshNames, weekly, store });
}

// ------------------------------------------------------------------
// Specialty retail
// ------------------------------------------------------------------

function retailDrafts(a: {
  account?: Account;
  empty: DeskLine[];
  short: DeskLine[];
  fresh: DeskLine[];
  emptyNames: string;
  shortNames: string;
  freshNames: string;
  weekly: number;
  store: string;
}): EmailTemplate[] {
  const { empty, short, fresh, emptyNames, shortNames, freshNames, weekly, store } = a;
  const drafts: EmailTemplate[] = [];

  /**
   * The default, and it is a claim about the CATEGORY rather than about
   * their shelf.
   *
   * Two earlier versions got this wrong in the same way. "I was through
   * your store this week and counted your shelf" reads like a supplier
   * walking an owner's aisles taking notes. "Your run rate has this at
   * zero" is the same surveillance in a spreadsheet.
   *
   * A supplier does not know what is on a given store's shelf today, and
   * claiming otherwise is fragile as well as creepy: the owner walks
   * twenty feet, finds three cases, and now doubts every figure attached.
   * So the note offers a run rate and lands on "you may be low" — a
   * suggestion they are free to check, which is the only form of this
   * claim that survives being checked.
   *
   * WHAT THIS DOES NOT SAY IS "stores like yours." The rate is modelled
   * per account, so the hedge was never buying accuracy — and it was
   * costing something real. Telling an owner they are an example of a
   * category rather than a business anybody knows is the difference
   * between a message from a rep and a mail merge. The store is the
   * subject of the sentence.
   */
  drafts.push({
    id: "trend",
    label: "What is trending",
    blurb: "The default. How fast these turn at this store.",
    note:
      empty.length > 0
        ? weekly
          ? `${store} turns about ${weekly} cases a week on this group. At that rate you are out of ${emptyNames} by now${short.length ? ` and getting low on ${shortNames}` : ""}. I have already cut the order against those numbers, so there is nothing for you to work out.`
          : `You are out of ${emptyNames} at ${store}${short.length ? `, and getting low on ${shortNames}` : ""}. I have already cut the order to what the shelf needs, so there is nothing for you to work out.`
        : weekly
          ? `${store} turns about ${weekly} cases a week on this group, which puts you low on ${shortNames}. I have already cut the order against those numbers, so there is nothing for you to work out.`
          : `You are getting low on ${shortNames} at ${store}. I have already cut the order to what the shelf needs, so there is nothing for you to work out.`,
  });

  /**
   * THE SPECIALTY-RETAIL DRAFT, and the reason this file was rewritten.
   *
   * Ten of the twelve retail accounts on Ole Smoky's own locator listing
   * for this ZIP are independent bottle shops. The person reading this
   * owns the store. That changes three things at once:
   *
   *   The unit of persuasion is the FACING, not the case. He has about
   *   four shelf sections for all of American whiskey and every inch
   *   given to one thing is taken from another, so the honest argument
   *   is per-facing return, not volume.
   *
   *   He can say yes immediately. There is no banner, no listing, no
   *   category review window, which means the message should not talk
   *   like there is. Every institutional word in the chain version —
   *   authorized, banner, planogram — is noise here.
   *
   *   He knows more about his shelf than the supplier does. So the
   *   message offers what he cannot see (what moves across the
   *   territory) and does not pretend to know what he can (what is on
   *   his shelf right now).
   */
  drafts.push({
    id: "specialty-retail",
    label: "Owner to owner",
    blurb: "For an independent. Per-facing argument, no chain language.",
    note: empty.length
      ? `You are likely out of ${emptyNames} — that is the fastest-moving thing we have in this corridor and it does not sit long anywhere. Same shelf space, no new facings, just what has already sold. I have kept the order to what turns so you are not carrying anything slow.`
      : `Quick one on the whiskey set. ${short.length ? `${shortNames} is running down` : "The set is holding"}, and it earns its facings — it is the part of the shelf that pays for itself rather than the part that sits. Nothing new to find room for; this is a top-up on what already works for you.`,
    guardrail:
      "No payment, credit or free goods may be offered for shelf position. California B&P 25500 and 25502.",
  });

  /**
   * Timing. The deadline is a load cutoff and it is real — a fabricated
   * one is discovered inside a single delivery cycle.
   *
   * WHAT WAS WRONG HERE BEFORE: this sentence used to say Friday through
   * Sunday is "most of the week's beer volume". Beer. In an app about
   * whiskey, in a paragraph a hiring manager at a distillery would read.
   * It survived a brand-name grep because it never named a brand — which
   * is the whole lesson about find-and-replace as a migration strategy.
   */
  drafts.push({
    id: "weekend",
    label: "Before the weekend",
    blurb: `For a send before the ${DELIVERY_WINDOW.cutoffLabel} cutoff.`,
    note: `Quick one before the ${DELIVERY_WINDOW.cutoffLabel} cutoff. ${
      empty.length
        ? `${emptyNames} is moving hard right now`
        : `${shortNames} ${short.length === 1 ? "is" : "are"} moving hard right now`
    } and Thursday through Saturday is where the weekend's spirits volume sits. If this rides ${DELIVERY_WINDOW.loadLabel} you are covered straight through it whatever you have left.`,
  });

  /**
   * The growth line. Leads with the absence of paperwork, because the
   * objection to a new item is space and hassle, and this has neither.
   */
  if (fresh.length > 0) {
    drafts.push({
      id: "new-items",
      label: "Space you are not using",
      blurb: "The growth line. Leads with how little it costs to try.",
      note: `One thing worth two minutes. ${freshNames} ${fresh.length === 1 ? "is" : "are"} not on your shelf yet and there is no paperwork on ${fresh.length === 1 ? "it" : "them"} — it is a case, not a listing. Stores your size in this corridor are modelled to turn ${fresh.length === 1 ? "it" : "them"} steadily, and I kept the opening quantity small so you can find out without giving up space you need.`,
    });
  }

  return drafts;
}

// ------------------------------------------------------------------
// On-premise
// ------------------------------------------------------------------

function onPremiseDrafts(a: {
  account?: Account;
  lines: DeskLine[];
  empty: DeskLine[];
  short: DeskLine[];
  fresh: DeskLine[];
  emptyNames: string;
  shortNames: string;
  freshNames: string;
  store: string;
}): EmailTemplate[] {
  const { account, lines, empty, short, fresh, emptyNames, shortNames, freshNames, store } = a;
  const drafts: EmailTemplate[] = [];

  /**
   * THE POUR ARITHMETIC, DONE HERE SO THE BAR DOES NOT HAVE TO.
   *
   * This is the single most useful sentence a supplier can put in front
   * of a bar manager, and almost nobody does. A case is twelve bottles is
   * roughly two hundred drinks. A manager asked for "four cases" has to
   * translate that into their own covers before they can answer, and
   * translating is friction, and friction is a message that gets read
   * later. A manager told "two cases, call it four hundred pours, about
   * six weeks at your rate" can answer in one word.
   *
   * It also protects the relationship in the direction that matters. The
   * arithmetic is what stops a rep asking a forty-cover pub to take the
   * same order as a Buffalo Wild Wings, which is the mistake that ends
   * the call — and it is exactly the mistake the old integer case floor
   * made structurally unavoidable.
   */
  const lead = lines[0];
  const rate = weeklyRate(account, lead?.weeklyCases ?? 0, 12);

  drafts.push({
    id: "pours",
    label: "In pours, not cases",
    blurb: "The default on-premise line. Does the bottle maths for them.",
    note: empty.length
      ? `${emptyNames} is the one your bar goes through fastest and my read is you are dry on it. What I have put down is ${rate.belowUnit ? "a small order" : rate.text} of cover — nothing that sits on you, just enough that nobody gets told you are out of it on a Saturday.`
      : `Short one on the back bar. ${short.length ? shortNames : store} is running down and the order below is sized to your pour rate rather than to a case minimum, so it is a small drop rather than a pallet you have to find room for.`,
  });

  /**
   * The staff draft, and it is the one that actually moves on-premise
   * volume.
   *
   * A bottle on a back bar sells nothing by itself. A bartender who has
   * tasted it and has one sentence about it sells it all night, which is
   * why staff education outperforms every piece of point-of-sale
   * material in this channel by a distance.
   *
   * It is also the cheapest thing a supplier can offer and one of the
   * few things it can offer legally without limit — teaching somebody's
   * staff is not a thing of value furnished to the retailer in the sense
   * 27 CFR 6 is about. That combination, high impact and clean footing,
   * is why it leads rather than sits at the bottom as an afterthought.
   */
  drafts.push({
    id: "staff-training",
    label: "Get the staff behind it",
    blurb: "The highest-return on-premise ask, and it costs nothing.",
    note: `Worth twenty minutes before a shift: I can walk your bar team through the range so they have something to say when somebody asks what it is. That is what moves it here — a bottle nobody can describe does not get recommended, and one your staff have tasted gets poured all night. Happy to do it before doors any day this week.`,
    guardrail:
      "Staff education only. Nothing of value may be furnished to the account's employees as an inducement, and trade employees are excluded from any consumer prize element under 27 CFR 6.96(b).",
  });

  /**
   * THE EVENT DRAFT — a dated reason to act, for the venues that have
   * one.
   *
   * ── WHY IT IS DATA-DRIVEN AND NOT A WRITTEN-OUT PARAGRAPH ─────
   * The date, the card, the venue and both compliance lists come out of
   * events.ts. Nothing about UFC 330 is typed into this sentence. That
   * matters because the lead time is the persuasive part and the lead
   * time changes every day: on the first of the month this note reads
   * "two weeks out, plenty of time", and on the twelfth it reads "three
   * days, this has to be on Thursday's load". A hardcoded paragraph
   * would still be saying "two weeks" on the morning of the fight.
   *
   * ── THE SENTENCE THIS TEMPLATE REFUSES TO WRITE ───────────────
   * "We will fund your fight-night promo." It is the most natural thing
   * in the world for a supplier to offer a bar, every rep is asked for
   * it, and in California it is unlawful — a supplier may FURNISH
   * point-of-sale material (27 CFR 6.84) and may not pay a retailer, buy
   * its advertising, or cover its costs (B&P 25500, 25502).
   *
   * So the draft offers material and hands, and the guardrail states the
   * other half out loud on screen next to it. A rule a rep can read at
   * the moment of sending is a control. A rule in a training deck is a
   * hope.
   */
  const event = account ? nextEventForChannel(account.channel) : null;
  if (event) {
    const days = daysUntil(event.date);
    const when = formatEventDate(event.date);
    const timing =
      days <= 0
        ? "It is on tonight"
        : days === 1
          ? "That is tomorrow"
          : days <= 4
            ? `That is ${days} days out, so this needs to be on the next load`
            : `That is ${days} days out, which is enough time to get it in and get the staff across it`;

    drafts.push({
      id: `event-${event.id}`,
      label: `${event.shortName} — ${when.split(",")[0]} night`,
      blurb: `${event.headline}. ${days >= 0 ? `${days} days out.` : "Tonight."}`,
      note: `${event.shortName} is on ${when} — ${event.headline}. ${timing}. Your bar will be full and the well will get hammered, so the ask is small: make sure you are not thin on ${empty.length ? emptyNames : short.length ? shortNames : freshNames || "the range"} before doors. I can bring table tents and menu inserts for a featured serve, and I can put someone behind the bar with your team to get the pour right. No cost to you either way — I cannot put money into the night, but I can put material and hands into it.`,
      guardrail:
        "27 CFR 6.84 and California B&P 25500 / 25502: point-of-sale material and staff time may be furnished. Payment toward the account's promotion, advertising or costs may not, and nothing may be conditioned on a purchase. Ole Smoky has no relationship with the event; it is referenced only as a date.",
    });
  }

  /**
   * The menu draft. On-premise distribution is not a shelf, it is a
   * LINE ON A MENU, and a bottle behind the bar with no menu presence is
   * a bottle that gets poured when somebody asks for it by name.
   */
  if (fresh.length > 0) {
    drafts.push({
      id: "menu-line",
      label: "One line on the menu",
      blurb: "The on-premise version of closing a void.",
      note: `Small ask: ${freshNames} ${fresh.length === 1 ? "is" : "are"} not on your list yet. One line on the drinks menu does more here than a bottle sitting on the back bar — a guest who cannot see it does not order it, and your staff will not lead with something the menu does not carry. I have kept the opening order to ${fresh.length === 1 ? "a case" : "a case each"} so it is a small thing to try rather than a commitment.`,
    });
  }

  return drafts;
}
