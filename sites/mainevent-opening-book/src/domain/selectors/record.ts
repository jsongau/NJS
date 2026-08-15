import type {
  BookLine,
  ConversationMessage,
  IntentSignal,
  Offer,
  OfferExtension,
  OrgType,
  PitchStatus,
  Prospect,
  ProspectPackageStatus,
} from "@/domain/types";
import type { GroupRequest } from "@/domain/requests";
import type { StatusToken } from "@/domain/vocabulary";
import { PROSPECTS, PROSPECT_BY_ID } from "@/data/prospects";
import { OFFER_BY_ID } from "@/data/venue";
import { SEED_BOOK } from "@/data/book";
import { SEED_REQUESTS } from "@/data/requests";
import { REQUESTS_AS_OF } from "@/data/requests";
import { venueDate } from "@/domain/requests";
import {
  MESSAGES_BY_PROSPECT,
  OFFER_EXTENSIONS_BY_PROSPECT,
} from "@/data/conversations";
import { furthestStatus, type PipelineState } from "@/state/PipelineProvider";

/**
 * ONE ORGANISATION, EVERYTHING KNOWN ABOUT IT, IN ONE CALL.
 *
 * WHY THIS FILE EXISTS. Four surfaces in this application need the same
 * answer about the same organisation: the profile modal that opens when
 * somebody clicks a business name, the inbox that threads messages by
 * organisation, the daily rings that count what was touched and what has
 * gone stale, and the queue that decides who to work next. Left to
 * themselves, four consumers write four versions of "days since last
 * contact", three of them agree, and the fourth quietly disagrees on
 * whether an inbound counts. Then a reader sees "4 days" on one screen
 * and "6 days" on another and stops believing both.
 *
 * So the derivation happens exactly once, here, and returns one object.
 * A caller that wants the last inbound message does not filter a thread;
 * it reads `lastInbound`. A caller that wants to know whether a record
 * is rotting does not compare a date to a constant; it reads
 * `staleness.stale` and, if it wants to justify itself on screen, it
 * reads `staleness.note`.
 *
 * NOTHING IS STORED. Every field below is computed from the status
 * table, the threads, the offers and the book at the moment it is asked
 * for. There is no "stale" flag on any row anywhere in this codebase and
 * there never will be, because a stored flag is a fact with an expiry
 * date that nothing is responsible for renewing.
 *
 * THE CLOCK IS INJECTED. `now` defaults to the same instant the request
 * queue reads from, so a screenshot of the modal agrees with a
 * screenshot of the queue taken on a different afternoon. A record whose
 * numbers move when nobody has touched it is a record nobody can check.
 */

/**
 * The moment every derivation here is made from.
 *
 * Deliberately the same constant the inbound queue uses rather than a
 * second one that happens to hold the same value today.
 */
export const RECORD_AS_OF = REQUESTS_AS_OF;

const MS_PER_DAY = 86_400_000;

/**
 * "1 day" and "2 days".
 *
 * A trivial helper with a real reason: every sentence in this file is
 * rendered straight onto a working screen, and "1 days quiet" is the
 * kind of detail that makes a reader stop trusting the arithmetic
 * beside it.
 */
function days(n: number): string {
  return n === 1 ? "1 day" : `${n} days`;
}

/**
 * Whole days between two instants, counted in venue-local calendar days.
 *
 * Counting in calendar days rather than in elapsed hours is the whole
 * point. A rep who wrote at 5pm on Monday and is looking at the record
 * at 9am on Tuesday has waited one day, not zero, and every follow-up
 * rule in this app is stated in days because that is how the work is
 * actually thought about.
 */
export function daysBetween(fromIso: string, toIso: string): number {
  const a = Date.parse(`${venueDate(fromIso)}T00:00:00-07:00`);
  const b = Date.parse(`${venueDate(toIso)}T00:00:00-07:00`);
  return Math.round((b - a) / MS_PER_DAY);
}

// ---------------------------------------------------------------
// Organisation type
// ---------------------------------------------------------------

/**
 * The organisation type vocabulary.
 *
 * IT BELONGS IN domain/vocabulary.ts AND IT IS NOT THERE YET. That file
 * is the single place every enumerable value in this domain is named,
 * and this map should eventually move into it. It sits here because
 * this pass does not own that file, and a duplicate token map is a worse
 * outcome than a temporarily misplaced one. When it moves, delete it
 * from here rather than leaving a copy.
 *
 * THE GLYPHS ARE A FAMILY OF SQUARES, and they are squares on purpose.
 * Pitch status is drawn as a filling circle, package family as a
 * patterned square, prospecting lane as a pointed or solid mark. A
 * reader scanning a dense row can tell which system a glyph belongs to
 * before working out which value it is. Within this family the fill
 * pattern carries the meaning: nothing known, a divided box for a
 * decision split between a store and a region, a half box for an
 * institution that buys half on a calendar and half on a purchase
 * order, a solid box for one site with the decision inside it.
 */
export const ORG_TYPE_META: Record<OrgType, StatusToken> = {
  school: {
    glyph: "◧",
    label: "School",
    cssVar: "var(--lane-schools)",
    note: "Buys on a published calendar and a purchase order. The date is set by the term and the money moves through procurement, so the work is lead time rather than persuasion.",
  },
  independent: {
    glyph: "◼",
    label: "Independent",
    cssVar: "var(--ok)",
    note: "One site, and the person who can say yes works in it. An owner behind the till, a practice manager, a headquarters whose approval chain tops out on the premises.",
  },
  chain: {
    glyph: "◫",
    label: "Chain or franchise",
    cssVar: "var(--info)",
    note: "A branch, store, franchised unit or flagged property. The person in the building can want it and still not approve it, so the useful outcome of a visit is often the role above them.",
  },
  unknown: {
    glyph: "◻",
    label: "Type not recorded",
    cssVar: "var(--neutral)",
    note: "The research on this row does not say where the approval sits. Two organisations on the board are honestly in this state rather than guessed into one of the other three.",
  },
};

/** Reading order. School first because it is the most different. */
export const ORG_TYPE_ORDER: OrgType[] = [
  "school",
  "independent",
  "chain",
  "unknown",
];

/**
 * The type of an organisation, with the absent case resolved.
 *
 * `orgType` is optional on the interface so a prospect added from a
 * pavement is not rejected for a field nobody has decided yet. Every
 * caller should come through here rather than reading the field, so
 * that "not decided" and "decided to be unknown" render identically and
 * nothing has to handle undefined.
 */
export function orgTypeOf(p: Prospect): OrgType {
  return p.orgType ?? "unknown";
}

export function orgTypeCounts(prospects: Prospect[] = PROSPECTS): Record<
  OrgType,
  number
> {
  const out = Object.fromEntries(
    ORG_TYPE_ORDER.map((t) => [t, 0]),
  ) as Record<OrgType, number>;
  for (const p of prospects) out[orgTypeOf(p)] += 1;
  return out;
}

// ---------------------------------------------------------------
// Stage decay
// ---------------------------------------------------------------

/**
 * HOW LONG A RECORD IS ALLOWED TO SIT IN EACH STATUS.
 *
 * Pipedrive calls this Rotting and configures it per stage in days,
 * resetting the clock on any real activity: an activity completed, a
 * note added, an email sent or received. It is the highest leverage
 * mechanic available to a hundred and two record territory worked by one
 * person, because the failure mode of a solo rep is not losing deals, it
 * is forgetting them.
 *
 * THE THRESHOLDS ARE DIFFERENT PER STATUS BECAUSE THE COST OF SILENCE
 * IS DIFFERENT PER STATUS. A held date is the urgent one: it blocks an
 * evening nobody else can be offered, so three days without contact is
 * already expensive to the venue and not merely impolite to the group.
 * A live conversation goes cold fastest, so five. A first touch with
 * nothing back gets seven, which is the point at which a second email is
 * still reasonable and an eighth day of hope is not.
 *
 * TWO STATUSES HAVE NO CLOCK AT ALL AND BOTH ARE DELIBERATE. "unworked"
 * has none because nothing has happened yet; there is no silence to
 * measure, only a queue position, and painting a hundred untouched rows
 * red would make the signal worthless everywhere else. "booked" has none
 * because a signed event is worked backwards from its own date on the
 * run sheet, not forwards from the last email. "lost" has none because
 * a loss is not work; the next window is diarised instead, which is a
 * date rather than a decay.
 *
 * THESE ARE THIS DESK'S OWN INTERVALS AND THEY ARE ILLUSTRATIVE. Main
 * Event publishes no service level of any kind, so nothing here is a
 * claim about how Main Event operates.
 */
export const STALE_AFTER_DAYS: Record<PitchStatus, number | null> = {
  unworked: null,
  "reached-out": 7,
  conversation: 5,
  "soft-hold": 3,
  booked: null,
  lost: null,
};

export interface Staleness {
  /** The threshold in force for this status, or null where there is none. */
  threshold: number | null;
  /** Days since anything at all happened, in either direction. */
  daysSinceActivity: number | null;
  stale: boolean;
  /** Days past the threshold. Zero unless stale. */
  overdueBy: number;
  /** One sentence a reader can act on or argue with. */
  note: string;
}

/**
 * Is this record going stale, and by how much?
 *
 * Exported separately from the record so it can be tested against
 * synthetic inputs without building a whole organisation, and so the
 * daily rings can ask the same question of a record as it stood this
 * morning.
 */
export function stalenessOf(
  status: PitchStatus,
  lastActivityAt: string | null,
  now: string = RECORD_AS_OF,
): Staleness {
  const threshold = STALE_AFTER_DAYS[status];
  if (lastActivityAt === null) {
    return {
      threshold,
      daysSinceActivity: null,
      stale: false,
      overdueBy: 0,
      note:
        threshold === null
          ? "Never touched, so there is no clock running on it yet."
          : "No activity recorded against this status, so there is nothing to measure silence from.",
    };
  }
  const elapsed = daysBetween(lastActivityAt, now);
  if (threshold === null) {
    return {
      threshold,
      daysSinceActivity: elapsed,
      stale: false,
      overdueBy: 0,
      note:
        status === "booked"
          ? `Booked. Worked backwards from the event date rather than forwards from the last contact, which was ${days(elapsed)} ago.`
          : status === "lost"
            ? `Lost, ${days(elapsed)} ago. The next buying window is a diary entry rather than a decay timer.`
            : `Untouched, and no threshold applies at this status.`,
    };
  }
  const overdue = elapsed - threshold;
  return {
    threshold,
    daysSinceActivity: elapsed,
    stale: overdue > 0,
    overdueBy: Math.max(0, overdue),
    note:
      overdue > 0
        ? `${days(elapsed)} quiet against a ${threshold} day threshold for this status. ${days(overdue)} past.`
        : `${days(elapsed)} quiet, inside the ${threshold} day threshold for this status.`,
  };
}

// ---------------------------------------------------------------
// Intent to commit
// ---------------------------------------------------------------

/**
 * WHAT EACH SIGNAL IS WORTH, AND WHY.
 *
 * A confidence score a reader cannot interrogate is worth nothing, so
 * every weight below is attached to an observable act with a message
 * behind it, and the record carries the quote that produced it. A reader
 * who disagrees with a reading can point at the line they disagree with,
 * which is the entire difference between a judgement and a number.
 *
 * THE ORDERING IS DELIBERATE AND ARGUABLE. Asking for a date and asking
 * for a price sit level, because both are buyers' questions rather than
 * browsers'. Naming a headcount sits just under them, because it costs
 * nothing to say and is still the number every quote is built from.
 * Asking who else has booked is worth more than it looks: it is a
 * late-stage question, and organisations that ask it are usually
 * deciding rather than browsing. Asking for something in writing is
 * worth the least of the positives, because it is the polite way to end
 * a conversation as often as it is the start of a procurement.
 *
 * THE NEGATIVES ARE HEAVIER THAN THE POSITIVES ON PURPOSE. One "we
 * already booked elsewhere" outweighs three enthusiastic questions,
 * because it is the only kind of statement in this list that is about a
 * decision already made.
 */
export const SIGNAL_META: Record<
  IntentSignal,
  { label: string; weight: number; note: string }
> = {
  "asked-for-a-date": {
    label: "Asked for a date",
    weight: 25,
    note: "A date question is a buyer's question. Nobody asks when who has not decided whether.",
  },
  "asked-for-a-price": {
    label: "Asked for a price",
    weight: 25,
    note: "The most common opening question in this territory and the hardest to answer, because Main Event publishes no group price at all.",
  },
  "named-a-headcount": {
    label: "Named a headcount",
    weight: 20,
    note: "Costs them nothing to say and is the number every quote is built from. Worth having in writing.",
  },
  "asked-who-else-has-booked": {
    label: "Asked who else has booked",
    weight: 15,
    note: "A late-stage question wearing an early-stage sentence. They are deciding, and they do not want to be first.",
  },
  "asked-for-it-in-writing": {
    label: "Asked for it in writing",
    weight: 10,
    note: "Real, and weaker than it sounds. It is the polite end of a conversation about as often as it is the start of a procurement.",
  },
  "agreed-to-meet": {
    label: "Agreed to meet",
    weight: 30,
    note: "A time in a diary with a role in it. The only signal here that costs them something before anything is signed.",
  },
  "held-a-date": {
    label: "Held a date",
    weight: 45,
    note: "A date blocked against no deposit. Worth nothing in the ledger and a great deal as a reading of intent.",
  },
  signed: {
    label: "Signed",
    weight: 60,
    note: "A contract with a deposit against it. There is a line in the book and this is no longer a reading.",
  },
  "went-quiet-after-a-quote": {
    label: "Went quiet after a quote",
    weight: -20,
    note: "Derived from silence rather than read off a message. A quote out and a thread past its threshold is the most common way a live conversation dies.",
  },
  "booked-elsewhere": {
    label: "Booked elsewhere",
    weight: -60,
    note: "The only statement in this list about a decision already made. It outweighs any amount of earlier enthusiasm.",
  },
  "said-no": {
    label: "Said no",
    weight: -60,
    note: "Recorded rather than hidden. A no to this occasion is rarely a no to the organisation, which is why the record stays on the board.",
  },
};

/**
 * The reading, in four steps plus a refusal.
 *
 * Deliberately not a percentage. A percentage invites a reader to
 * average it with other percentages and forecast a quarter off the
 * result, which is exactly what a one person pre-opening board must not
 * be used for.
 */
export type IntentLevel =
  /** Nothing recorded that points at a commitment. */
  | "none"
  /** They have asked for something that costs them to ask. */
  | "signalled"
  /** A date is held, or it is signed. */
  | "committed"
  /** They signalled, then went quiet past the threshold. */
  | "cooling"
  /** They said no, or they told us they went elsewhere. */
  | "declined";

export const INTENT_META: Record<IntentLevel, StatusToken> = {
  none: {
    glyph: "○",
    label: "No intent recorded",
    cssVar: "var(--neutral)",
    note: "Nothing has been said that points at a commitment. For most of this trade area that is simply because nothing has been said at all.",
  },
  signalled: {
    glyph: "◑",
    label: "Signalled",
    cssVar: "var(--info)",
    note: "They asked for a date, a price, a headcount or a meeting. Interest with evidence behind it and nothing held.",
  },
  cooling: {
    glyph: "◌",
    label: "Cooling",
    cssVar: "var(--warn)",
    note: "They signalled and then stopped. The evidence has not changed; the silence has, and it is now longer than this status allows.",
  },
  committed: {
    glyph: "●",
    label: "Committed",
    cssVar: "var(--ok)",
    note: "A date is held or a contract is signed. A hold is a commitment of theirs and of the venue's calendar, and it is still not revenue.",
  },
  declined: {
    glyph: "✕",
    label: "Declined",
    cssVar: "var(--risk)",
    note: "They said no or they went elsewhere, in their own words. Kept on the board because a lane full of quiet losses is a finding.",
  },
};

export const INTENT_ORDER: IntentLevel[] = [
  "committed",
  "signalled",
  "cooling",
  "none",
  "declined",
];

export interface IntentEvidence {
  signal: IntentSignal;
  /**
   * The message this was read off.
   *
   * Absent only for signals derived from an absence, of which there is
   * exactly one: going quiet after a quote. Everything else points at a
   * row a reader can open.
   */
  messageId?: string;
  at: string;
  /** The words behind it, or the derivation in one line. */
  quote: string;
  weight: number;
  label: string;
}

export interface IntentReading {
  level: IntentLevel;
  /** The sum of the evidence weights. Shown beside the evidence, never alone. */
  score: number;
  evidence: IntentEvidence[];
  /** One sentence naming the strongest reason for the level. */
  headline: string;
}

function truncate(body: string, max = 140): string {
  if (body.length <= max) return body;
  return `${body.slice(0, max - 1).trimEnd()}...`;
}

function readIntent(
  thread: ConversationMessage[],
  status: PitchStatus,
  staleness: Staleness,
  hasOpenQuote: boolean,
): IntentReading {
  const evidence: IntentEvidence[] = [];

  for (const m of thread) {
    for (const signal of m.effect.signals ?? []) {
      const meta = SIGNAL_META[signal];
      evidence.push({
        signal,
        messageId: m.id,
        at: m.at,
        quote: truncate(m.body),
        weight: meta.weight,
        label: meta.label,
      });
    }
  }

  /* The one derived signal. It is added rather than inferred at read
     time so that the evidence list and the level can never disagree
     about why the level is what it is. */
  const positives = evidence.filter((e) => e.weight > 0);
  if (hasOpenQuote && staleness.stale && positives.length > 0) {
    const meta = SIGNAL_META["went-quiet-after-a-quote"];
    evidence.push({
      signal: "went-quiet-after-a-quote",
      at: RECORD_AS_OF,
      quote: `A quote or an offer is out and the thread has been quiet for ${days(staleness.daysSinceActivity ?? 0)}, which is past the ${staleness.threshold} day threshold for this status.`,
      weight: meta.weight,
      label: meta.label,
    });
  }

  const score = evidence.reduce((n, e) => n + e.weight, 0);
  const has = (s: IntentSignal) => evidence.some((e) => e.signal === s);

  let level: IntentLevel;
  let headline: string;

  if (status === "booked" || has("signed")) {
    level = "committed";
    headline = "Signed, with a line in the book against it.";
  } else if (status === "lost" || has("said-no") || has("booked-elsewhere")) {
    level = "declined";
    headline = has("booked-elsewhere")
      ? "They told us they had already booked elsewhere."
      : "They said no, and the reason is in the thread.";
  } else if (status === "soft-hold" || has("held-a-date")) {
    level = "committed";
    headline = "A date is held against no deposit, which commits the calendar and not the money.";
  } else if (positives.length === 0) {
    level = "none";
    headline =
      thread.length === 0
        ? "No history at all, so there is nothing to read."
        : "Contact made and nothing said that points at a commitment.";
  } else if (has("went-quiet-after-a-quote")) {
    level = "cooling";
    headline = `Asked real questions and then stopped. Quiet ${days(staleness.daysSinceActivity ?? 0)} with something on the table.`;
  } else {
    level = "signalled";
    const strongest = positives.reduce((best, e) =>
      e.weight > best.weight ? e : best,
    );
    headline = `${strongest.label}, and nothing held yet.`;
  }

  /* Newest first, because a reader is checking whether the recent
     evidence still supports the reading rather than reading a history. */
  evidence.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

  return { level, score, evidence, headline };
}

// ---------------------------------------------------------------
// Offers, joined
// ---------------------------------------------------------------

/**
 * An extension joined to the offer it points at.
 *
 * The cost to the venue lives on the offer and is read through here
 * rather than copied onto the extension, so an offer whose cost note
 * changes cannot leave sixteen stale copies behind it.
 */
export interface ExtendedOffer {
  extension: OfferExtension;
  offer: Offer;
}

// ---------------------------------------------------------------
// The next action
// ---------------------------------------------------------------

export type NextActionKind =
  | "answer"
  | "chase"
  | "visit"
  | "call"
  | "convert"
  | "diary"
  | "open"
  | "route";

export interface NextAction {
  /** Short enough for a button. */
  label: string;
  /** Why this one and not another, in a sentence. */
  why: string;
  kind: NextActionKind;
}

/**
 * What to do next with this organisation.
 *
 * ORDER IS THE WHOLE ALGORITHM. Somebody waiting on an answer outranks
 * everything, because the only unforgivable thing on a board like this
 * is an inbound message that nobody replied to. A held date outranks a
 * cold follow-up because it is costing the venue an evening. A requeue
 * reason, where the last inbound carried one, outranks a generic chase
 * because the record has already told you what the next move is and
 * ignoring it is how a rep ends up writing a fourth email to somebody
 * who told them they were the wrong person.
 */
function nextActionFor(
  p: Prospect,
  status: PitchStatus,
  thread: ConversationMessage[],
  staleness: Staleness,
  openOffers: number,
): NextAction {
  const last = thread[thread.length - 1];
  const lastInboundIdx = [...thread]
    .reverse()
    .findIndex((m) => m.direction === "inbound");
  const awaitingReply =
    last !== undefined &&
    last.direction === "inbound" &&
    last.effect.requeue === undefined &&
    status !== "lost" &&
    status !== "booked";

  if (awaitingReply) {
    return {
      kind: "answer",
      label: "Answer them",
      why: `They wrote ${days(daysBetween(last.at, RECORD_AS_OF))} ago and nothing has gone back. An unanswered inbound outranks every piece of outbound work on the board.`,
    };
  }

  if (status === "booked") {
    return {
      kind: "convert",
      label: "Confirm the run sheet",
      why: "Signed with a deposit taken. The remaining work is operational, four weeks out from the date rather than now.",
    };
  }

  if (status === "lost") {
    return {
      kind: "diary",
      label: "Diary the next window",
      why: `Lost this occasion. They buy in ${p.buyingWindow || "a window not recorded"}, so the next move is a date in the diary rather than another email.`,
    };
  }

  if (status === "soft-hold") {
    return {
      kind: "convert",
      label: staleness.stale ? "Convert or release the hold" : "Keep the hold moving",
      why: staleness.stale
        ? `A date is held against no deposit and the thread has been quiet ${days(staleness.daysSinceActivity ?? 0)}. It blocks an evening nobody else can be offered.`
        : "A date is held and nothing is signed. The hold is only worth something while somebody is working it.",
    };
  }

  const lastInbound =
    lastInboundIdx === -1
      ? undefined
      : thread[thread.length - 1 - lastInboundIdx];

  if (lastInbound?.effect.requeue) {
    switch (lastInbound.effect.requeue) {
      case "out-of-office":
        return {
          kind: "diary",
          label: "Requeue for their return",
          why: "An automatic absence reply is not an answer. Nobody has read the message yet, so this is a diary entry rather than a follow-up.",
        };
      case "wrong-person":
        return {
          kind: "route",
          label: "Write to the role they named",
          why: "A wrong person reply cost one touch and bought the name of the door that actually opens. Use it rather than writing to the same address again.",
        };
      case "decision-off-site":
        return {
          kind: "route",
          label: "Ask for the region",
          why: "Somebody in the building wants it and cannot approve it. The next useful thing here is a name above the site, not another conversation inside it.",
        };
      case "come-back-later":
        return {
          kind: "diary",
          label: "Diary the window they named",
          why: "They gave a real answer with a date attached. Chasing before it arrives teaches them to ignore this desk.",
        };
    }
  }

  if (staleness.stale && p.emailConfidence !== "none" && thread.length >= 2) {
    return {
      kind: "visit",
      label: "Go and see them",
      why: `${days(staleness.daysSinceActivity ?? 0)} quiet after ${thread.filter((m) => m.direction === "outbound").length} written touches. Two emails and a visit is the sequence; four emails is a spam folder.`,
    };
  }

  if (thread.length === 0) {
    if (p.emailConfidence === "verified_public") {
      return {
        kind: "open",
        label: "Open the thread",
        why: `They publish an address for the ${p.decisionMakerTitle.toLowerCase()}, so a first touch costs two minutes.`,
      };
    }
    if (p.emailConfidence === "form_only") {
      return {
        kind: "open",
        label: "Submit the form",
        why: "No published address. The contact form is the only written door and it lands in a queue somebody may or may not read.",
      };
    }
    return {
      kind: "visit",
      label: "Add to the go-see run",
      why: `No written door at all. The only route in is the door, and the ask is for the ${p.decisionMakerTitle.toLowerCase()}.`,
    };
  }

  if (openOffers > 0) {
    return {
      kind: "chase",
      label: "Chase the offer",
      why: `${openOffers === 1 ? "An offer is" : `${openOffers} offers are`} on the table and unanswered. An offer nobody replied to is not a soft yes; it is something given away that has not bought a reply.`,
    };
  }

  return {
    kind: "chase",
    label: "Follow up",
    why: staleness.stale
      ? `${days(staleness.daysSinceActivity ?? 0)} quiet against a ${staleness.threshold} day threshold.`
      : "Contact made and the next move is still this desk's.",
  };
}

// ---------------------------------------------------------------
// The record
// ---------------------------------------------------------------

export interface ProspectRecord {
  prospect: Prospect;
  orgType: OrgType;
  /** Why the row carries that type. Empty only where nothing was recorded. */
  orgTypeBasis: string;

  /** The furthest this organisation has got on any package this period. */
  status: PitchStatus;
  /** Every status row for this organisation in the current period. */
  statusRows: ProspectPackageStatus[];
  /** Touches recorded against the fact table, which is the desk's own count. */
  touches: number;

  /** The whole thread, oldest first. Empty for most of the trade area. */
  thread: ConversationMessage[];
  messageCount: number;
  inboundCount: number;
  outboundCount: number;
  lastMessage?: ConversationMessage;
  lastInbound?: ConversationMessage;
  lastOutbound?: ConversationMessage;
  daysSinceInbound: number | null;
  daysSinceOutbound: number | null;
  /** The most recent thing that happened in either direction. */
  lastActivityAt: string | null;
  daysSinceActivity: number | null;
  /** Set where the last inbound was a requeue rather than an answer. */
  requeue?: ConversationMessage["effect"]["requeue"];
  /** True where they wrote last and nothing has gone back. */
  awaitingReply: boolean;

  intent: IntentReading;

  offers: ExtendedOffer[];
  openOffers: ExtendedOffer[];

  /** Inbound enquiries, which carry their own response clock. */
  requests: GroupRequest[];
  /** Signed lines. The only place a dollar figure lives. */
  bookLines: BookLine[];

  staleness: Staleness;
  nextAction: NextAction;
}

export interface RecordOptions {
  pipeline: PipelineState;
  /** Defaults to the seeded book. Pass `book` from BookProvider to see edits. */
  book?: BookLine[];
  /** Defaults to the same instant the inbound queue reads from. */
  now?: string;
}

/**
 * Everything known about one organisation.
 *
 * Returns null for an id that is not on the board, and a complete object
 * for every id that is, including the forty-two with no history at all.
 * An organisation with nothing recorded against it is not an error case
 * to be guarded against by four different callers; it is the majority of
 * this trade area, and it gets the same shape as the rest.
 */
export function prospectRecord(
  prospectId: string,
  { pipeline, book = SEED_BOOK, now = RECORD_AS_OF }: RecordOptions,
): ProspectRecord | null {
  const prospect = PROSPECT_BY_ID[prospectId];
  if (!prospect) return null;

  const thread = MESSAGES_BY_PROSPECT[prospectId] ?? [];
  const inbound = thread.filter((m) => m.direction === "inbound");
  const outbound = thread.filter((m) => m.direction === "outbound");
  const lastMessage = thread[thread.length - 1];
  const lastInbound = inbound[inbound.length - 1];
  const lastOutbound = outbound[outbound.length - 1];

  const statusRows = pipeline.statuses.filter(
    (s) => s.prospectId === prospectId && s.periodId === pipeline.periodId,
  );
  const status = furthestStatus(pipeline, prospectId);
  const touches = statusRows.reduce((n, s) => n + s.touches, 0);

  /* Last activity is the latest of the thread and the fact table, not
     the thread alone. A touch recorded on the board without a message
     behind it, a call logged as a touch, still resets the decay clock,
     exactly as Pipedrive resets on a note or a completed activity. */
  const stamps: string[] = [];
  if (lastMessage) stamps.push(lastMessage.at);
  for (const s of statusRows) if (s.lastTouchAt) stamps.push(s.lastTouchAt);
  const lastActivityAt =
    stamps.length === 0
      ? null
      : stamps.reduce((best, s) => (Date.parse(s) > Date.parse(best) ? s : best));

  const staleness = stalenessOf(status, lastActivityAt, now);

  const extensions = OFFER_EXTENSIONS_BY_PROSPECT[prospectId] ?? [];
  const offers: ExtendedOffer[] = extensions
    .map((extension) => {
      const offer = OFFER_BY_ID[extension.offerId];
      return offer ? { extension, offer } : null;
    })
    .filter((x): x is ExtendedOffer => x !== null);
  const openOffers = offers.filter((o) => o.extension.state === "open");

  const intent = readIntent(thread, status, staleness, offers.length > 0);

  const awaitingReply =
    lastMessage !== undefined &&
    lastMessage.direction === "inbound" &&
    lastMessage.effect.requeue === undefined &&
    status !== "lost" &&
    status !== "booked";

  return {
    prospect,
    orgType: orgTypeOf(prospect),
    orgTypeBasis: prospect.orgTypeBasis ?? "",

    status,
    statusRows,
    touches,

    thread,
    messageCount: thread.length,
    inboundCount: inbound.length,
    outboundCount: outbound.length,
    lastMessage,
    lastInbound,
    lastOutbound,
    daysSinceInbound: lastInbound ? daysBetween(lastInbound.at, now) : null,
    daysSinceOutbound: lastOutbound ? daysBetween(lastOutbound.at, now) : null,
    lastActivityAt,
    daysSinceActivity: staleness.daysSinceActivity,
    requeue: lastInbound?.effect.requeue,
    awaitingReply,

    intent,

    offers,
    openOffers,

    requests: SEED_REQUESTS.filter((r) => r.prospectId === prospectId),
    bookLines: book.filter((l) => l.prospectId === prospectId),

    staleness,
    nextAction: nextActionFor(
      prospect,
      status,
      thread,
      staleness,
      openOffers.length,
    ),
  };
}

/**
 * Every organisation, as a record.
 *
 * Built in one pass for the surfaces that need to rank or count across
 * the whole board: the stale count on the daily rings, the organisation
 * type filter's live counts, the queue. Callers that want one record
 * should call `prospectRecord` rather than building all hundred and two
 * and picking one out.
 */
export function prospectRecords(options: RecordOptions): ProspectRecord[] {
  return PROSPECTS.map((p) => prospectRecord(p.id, options)).filter(
    (r): r is ProspectRecord => r !== null,
  );
}

/** How many records are past their stage threshold right now. */
export function staleCount(options: RecordOptions): number {
  return prospectRecords(options).filter((r) => r.staleness.stale).length;
}

/** How many organisations wrote last and have had nothing back. */
export function awaitingReplyCount(options: RecordOptions): number {
  return prospectRecords(options).filter((r) => r.awaitingReply).length;
}
