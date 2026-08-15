import type { EventPackage, OpeningStatus, Prospect } from "@/domain/types";
import { LANE_META, lanesForGuests, GUESTS_PER_BOWLING_LANE } from "@/domain/lanes";
import {
  PACKAGES,
  PACKAGE_BY_ID,
  BANQUET_FLOOR_PER_GUEST,
  STANDARD_TERMS,
} from "@/data/packages";
import { VENUE, INBOUND_ROUTES, OFFER_BY_ID } from "@/data/venue";
import { milesFromVenue } from "@/domain/selectors/desk";

/**
 * The outreach drafts.
 *
 * ── THE FORK THAT MATTERS ─────────────────────────────────────────
 * These branch on two things, and getting either one wrong produces a
 * message that is worse than sending nothing.
 *
 * THE LANE, because the occasion class decides what the message is even
 * about. A school activities director already knows there will be a grad
 * night. The date is fixed, the budget was approved a season ago, and the
 * only open question is which building. So that email is about a DATE,
 * and it can be direct about it in the first sentence. An HR manager at a
 * manufacturer has not decided to have a party at all. Writing to them
 * about holding a date is answering a question they have not asked, and
 * it reads as a form letter, because functionally it is one. That email
 * has to be about an OCCASION first and a venue second.
 *
 * THE OPENING STATUS, because it decides what can honestly be asked for.
 * Main Event Brea is "announced": there is an address, a phone number and
 * no published date. You cannot ask for a deposit against a date nobody
 * has published. You can absolutely ask for a place in line, and the
 * whole reason that ask works is that it costs the buyer nothing, which
 * the message says out loud. The day a date is published, the same
 * relationships convert and the ask changes to a deposit. Half these
 * templates rewrite themselves on that one value.
 *
 * ── THE MISSING DATE IS THE OFFER, NOT THE APOLOGY ────────────────
 * These bodies used to open by naming what was absent: no published
 * date, and a promise not to pretend otherwise. Honest, and the wrong
 * first sentence, because the first sentence is where a reader decides
 * whether to keep reading and that one reads like a disclaimer.
 *
 * The fact has not changed and it is still in every letter. What changed
 * is where it sits and what it is for. An unpublished date means an empty
 * calendar, and an empty calendar means this reader can have the day they
 * actually want rather than what is left, in a building nobody in the
 * trade area has been inside. That is real scarcity: 26 lanes, a finite
 * number of opening-month dates, and every one that gets held is gone.
 * It needs no invented date to work, which is the whole point.
 *
 * So the no-date line lands mid-letter as a confident aside that turns
 * into an advantage, and the reader's own situation opens instead.
 *
 * ── WHY THEY ARE SHORT, AND WHERE THE ASK SITS ────────────────────
 * Roughly nine in ten emails are opened in Apple Mail or Gmail and the
 * average attention on one is about eleven seconds. Long prose does not
 * get read by an assistant principal between second and third period; it
 * gets deferred to a desk, and deferral is where outreach dies. Every
 * first touch below runs to four short paragraphs, sign-off included,
 * and the promos run longer only because they carry a published
 * inclusion list the reader would otherwise have to go and look up.
 *
 * There is exactly ONE ask in each, it is the last line, and it is
 * small: a day, a headcount, ten or fifteen minutes, a morning for a
 * walk. Three calls to action stacked at the end of a cold email is a
 * reader deciding between them by closing the message.
 *
 * ── WHAT IS DELIBERATELY ABSENT ───────────────────────────────────
 * No "I hope this email finds you well", which announces that a template
 * wrote it. No "excited to announce", for the same reason and because
 * there is nothing to announce yet. No exclamation marks. No invented
 * opening date, month, season or quarter, ever, in any branch, and no
 * manufactured urgency either: no countdown, no number of slots left, no
 * offer that expires. The scarcity in these letters is structural and it
 * is checkable, which is why it does not need dressing. No price for a
 * gated package, because Main Event does not publish one and inventing
 * one is the single fastest way to lose the room. And no invented human
 * name anywhere: the messages are addressed to a ROLE, and signed with
 * one.
 *
 * ── WHAT IS QUOTED ────────────────────────────────────────────────
 * Every fact about the venue in these bodies is published on
 * mainevent.com and is carried in data/venue.ts or data/packages.ts:
 * the street address, the phone number, more than twenty six lanes, the
 * laser tag arena, Gravity Ropes, over a hundred games, the party rooms
 * and meeting space, the twenty percent Spirit Night donation, the
 * $19.95 Play It Forward voucher, the $29.99 All-Access Grad Pack, the
 * fourteen dollar per person food floor. Nothing else is stated as fact.
 */

export interface EmailTemplate {
  id: string;
  /** Shown on the picker. Says what the message is FOR, not what it says. */
  label: string;
  blurb: string;
  subject: string;
  body: string;
  /** Why this draft is the right one for this organisation. One line. */
  why: string;
  /**
   * A rule the sender has to hold while sending this one, rendered beside
   * the draft rather than buried in a comment. A rule a person can read
   * at the moment of sending is a control; a rule in a document is a hope.
   */
  guardrail?: string;
  /**
   * The published package this draft was written against, where it was
   * written against one.
   *
   * Carried so the compose window can show the price, or the sentence
   * that stands in for a price, beside the words that mention it. A
   * promo whose body names the All-Access Grad Pack and whose picker is
   * pointed at Fun 101 is the kind of quiet disagreement that ends up in
   * front of a customer.
   */
  packageId?: string;
  /** The pre-opening offer this draft leans on, from data/venue.ts. */
  offerId?: string;
}

/**
 * The sign-off. A ROLE and a published phone number, never a name.
 *
 * The number is Main Event's own published Brea line. It appears here
 * because a message that gives no way to reach a person is a message that
 * has not really asked for anything, and because it is the one contact
 * route the company actually publishes for this venue. There is exactly
 * one published email address on the entire mainevent.com site and it is
 * for press, which is itself a finding: a company whose largest packages
 * are all gated behind "contact the local sales manager" publishes no way
 * to email a sales manager.
 */
const SIGN_OFF = `Sales Manager
Main Event Brea, ${VENUE.address}
${INBOUND_ROUTES.breaPhone}`;

/**
 * "the assistant principal for activities", lower cased mid-sentence.
 *
 * An all-capital token is left alone, because the alternative is real and
 * it is embarrassing: the published titles include "HR / People Ops
 * Manager" and "Chamber President / CEO", and a blanket lower case turns
 * a letter's last line into "worth fifteen minutes with the hr / people
 * ops manager". A reader does not conclude that the sender is casual.
 * They conclude that a program wrote it, which is the one thing every
 * draft in this file is trying not to be.
 */
function role(p: Prospect): string {
  return p.decisionMakerTitle
    .split(" ")
    .map((w) => (/^[A-Z]{2,}[^a-z]*$/.test(w) ? w : w.toLowerCase()))
    .join(" ");
}

/**
 * The buying window, cut to the part that fits in a subject line.
 *
 * The research pass wrote these as working notes rather than as headings,
 * so several run to a full clause: "Sep-Nov for the mixer calendar, plus
 * Jan for the year's event slate". Dropped whole into a subject that also
 * carries an organisation name, the reader sees a truncated sentence in
 * their inbox list and nothing else. The first segment is the same fact,
 * it is theirs rather than ours, and it survives the fifty characters a
 * phone actually shows.
 */
function windowShort(p: Prospect): string {
  const first = p.buyingWindow.split(/[,;(]/)[0].trim();
  if (!first) return p.buyingWindow;
  if (first.length <= 30) return first;
  return first.split(/\s+/).slice(0, 3).join(" ");
}

/** One decimal mile, which is how anybody in Orange County talks. */
function distance(p: Prospect): string {
  const m = milesFromVenue(p.lat, p.lng);
  if (m < 1) return "under a mile";
  return `${m.toFixed(1)} miles`;
}

function leadPackageName(p: Prospect): string {
  return PACKAGE_BY_ID[p.leadPackageId]?.name ?? "a group package";
}

/**
 * The sentence about the opening, written three ways.
 *
 * It appears in every template and it is the one paragraph that must
 * never drift, because it is the only place the app makes a claim about
 * when the building opens. Writing it once means there is exactly one
 * sentence to check.
 *
 * The "announced" branch states the same fact it always did and reaches
 * the opposite conclusion, which is the correct one. No published date
 * means no bookings, and no bookings means the reader is early rather
 * than late. It never names a date, a month, a season or a quarter, and
 * the sentence after it in every body is what the empty calendar is
 * worth to that particular buyer.
 */
function openingSentence(status: OpeningStatus): string {
  switch (status) {
    case "announced":
      return "Main Event has not made the opening date public yet, which is the part working in your favour: the calendar behind it is empty.";
    case "date-set":
      return "Main Event has now published an opening date for Brea, so a date either side of it can be committed properly.";
    case "open":
      return "The building is open, so the quickest thing is to walk it and pick your date standing in the room.";
  }
}

export interface TemplateContext {
  /** From VENUE. Passed rather than read so a page can preview a branch. */
  openingStatus?: OpeningStatus;
  /** Weeks to open on the selected period. Drives urgency, honestly. */
  weeksToOpen?: number;
  /** How many written touches this organisation has already had. */
  touches?: number;
}

/**
 * Every draft that makes sense for this organisation, best first.
 *
 * Order is the recommendation. A page that renders the first one by
 * default is doing the right thing.
 */
export function templatesFor(
  prospect: Prospect,
  ctx: TemplateContext = {},
): EmailTemplate[] {
  const status = ctx.openingStatus ?? VENUE.openingStatus;
  const touches = ctx.touches ?? 0;
  const lane = LANE_META[prospect.lane];
  const drafts: EmailTemplate[] = [];

  // ---------------------------------------------------------------
  // 1. Calendar-locked. The date is the subject of the first sentence.
  // ---------------------------------------------------------------

  /**
   * THE STRONGEST MESSAGE IN THIS FILE, and it is strong because of one
   * structural fact rather than any turn of phrase: their event is
   * happening whether or not anybody calls them. A graduating class
   * graduates. A season ends. The buyer is not being persuaded to spend
   * money, they are being asked to spend it here, which is a much shorter
   * conversation and deserves a much shorter email.
   *
   * The letter opens on their fixed date and closes on one small ask,
   * and the missing opening date sits between the two as the reason the
   * offer is good rather than as a warning. Naming it inside the letter
   * still does the credibility work; naming it first did the opposite,
   * because a reader who is told what is absent before they are told
   * what is on offer has been given nothing to want.
   */
  if (lane.occasionClass === "calendar-locked") {
    drafts.push({
      id: "calendar-locked-date-first",
      label: "Calendar-locked, date first",
      blurb: "For a buyer whose event already exists. Leads with the date.",
      why: `${lane.label} buy because the calendar says so, not because somebody decided to. The date is the only thing worth writing about.`,
      subject:
        status === "date-set"
          ? `${windowShort(prospect)}: holding a date at Main Event Brea`
          : `${windowShort(prospect)}, and first pick of an empty calendar`,
      body:
        status === "date-set"
          ? `Your window is fixed: ${prospect.buyingWindow}. The venue is the only open question left in it.

Main Event is opening at ${VENUE.address} in Brea, ${distance(prospect)} from you. ${openingSentence(status)} For a group your size the opener is usually ${leadPackageName(prospect)}. Booking runs on Main Event's published terms: five days' notice and a fifty per cent deposit.

Give me a day and I will hold it, or tell me who owns that calendar.

${SIGN_OFF}`
          : `The date is already decided for you: ${prospect.buyingWindow}. It happens whether or not anybody writes to you about it, and the venue gets picked ${ctx.weeksToOpen ? "months" : "well"} before the date arrives.

Main Event is opening at ${VENUE.address} in Brea, ${distance(prospect)} from you: more than twenty six lanes, a multi-level laser tag arena, Gravity Ropes and private party rooms. ${openingSentence(status)} Nothing in the opening months is booked, so you take the day you want rather than what is left, in a building nobody around here has been inside yet.

Holding a date costs nothing. No deposit, and it releases on its own if the timing stops working for you.

Give me a day and I will put it in writing this week.

${SIGN_OFF}`,
      guardrail:
        "Never name an opening date. Main Event has not published one, and a date promised to a school that then moves its grad night is the one mistake there is no recovering from.",
    });
  }

  // ---------------------------------------------------------------
  // 2. Discretionary. The occasion has to be invented before the venue.
  // ---------------------------------------------------------------

  /**
   * The hardest email in the set, because it is doing two jobs at once:
   * persuading somebody that there should be an event, and that it should
   * be here. Most venue outreach only does the second, which is why most
   * of it is deleted.
   *
   * So the first sentence is about THEM. Not about the venue, not about
   * the opening, not about lanes. The prospect row carries a one-line
   * reason this particular organisation books a group night, written by
   * the research pass, and that sentence is the whole opener.
   */
  if (lane.occasionClass === "discretionary") {
    drafts.push({
      id: "discretionary-occasion-first",
      label: "Discretionary, occasion first",
      blurb: "For a buyer who has not decided to have an event at all.",
      why: `Nobody at ${prospect.name} has scheduled anything. The message has to earn the occasion before it earns the venue.`,
      subject: `A night for ${prospect.name}, on a calendar with nothing on it`,
      body: `${prospect.whyTheyFit}

Main Event is opening at ${VENUE.address}, ${distance(prospect)} from you, with more than twenty six bowling lanes, a multi-level laser tag arena, Gravity Ropes, over a hundred games, and private party rooms with dedicated meeting space. ${openingSentence(status)}

${
        status === "announced"
          ? "Nobody has booked anything in the opening months. Your people could be the first group through those doors, on the night you pick rather than the night that was left, and a date costs nothing to hold while there is no deposit to take."
          : "Which means we can put a date and a number in writing this week."
      }

Worth fifteen minutes with the ${role(prospect)}?

${SIGN_OFF}`,
      guardrail:
        "No price. Main Event publishes no price for any corporate or group package, so a number in this email would be invented. The only published F&B figure is a food spend starting at fourteen dollars per person.",
    });
  }

  // ---------------------------------------------------------------
  // 3. The referral partner. Not a booking at all.
  // ---------------------------------------------------------------

  /**
   * The hospitality and civic lane is not a customer, it is a multiplier,
   * and treating a chamber of commerce like a prospect wastes the only
   * thing it is actually good for. A chamber is a room containing every
   * other lane on the board, standing together, once a month. A hotel
   * sales director is asked for group recommendations by people who have
   * already decided to spend money.
   *
   * So this message asks for nothing except a look at the building, which
   * happens to be the only thing that converts this lane anyway.
   */
  if (prospect.lane === "hospitality-civic") {
    drafts.push({
      id: "referral-partner",
      label: "Referral partner, not a booking",
      blurb: "Asks for a walk of the site rather than for a contract.",
      why: "This lane recommends venues to other people's budgets. It converts on the tour and almost nowhere else.",
      subject: `Birch Street, and a walk of it before anybody else has been in`,
      body: `You get asked where to send groups, and you will not recommend somewhere you have not seen. Fair. So this is not a booking ask.

Main Event is building at ${VENUE.address}, ${distance(prospect)} from you. ${openingSentence(status)} Which means the people who see it now are the ones who can answer that question about this building before anybody else in Brea can.

The offer is a walk of the site while it is still in construction, hard hats and all. Twenty minutes, and more memorable than any finished tour.

Tell me a morning that suits and I will arrange it.

${SIGN_OFF}`,
    });
  }

  // ---------------------------------------------------------------
  // 4. Midweek daytime. Selling the hours nobody else wants.
  // ---------------------------------------------------------------

  /**
   * The one template that is genuinely good for both sides, which is rare
   * enough to be worth saying.
   *
   * Weekday daytime is the emptiest inventory an entertainment venue owns
   * and the hardest to sell once it is open. Main Event has already
   * restricted several of its own packages to exactly those hours, so
   * this message is selling the hours the company itself is trying to
   * fill. And the organisations that can move to a Tuesday morning, a
   * clinic that splits across shifts, a school on a minimum day, a senior
   * community that can never be uncovered, are usually the ones for whom
   * a Friday night never worked in the first place.
   */
  if (
    prospect.lane === "healthcare" ||
    prospect.lane === "faith-nonprofit" ||
    prospect.lane === "schools"
  ) {
    drafts.push({
      id: "weekday-daytime",
      label: "Two weekdays, not one Friday",
      blurb: "For a group that cannot all leave the building at once.",
      why: `${prospect.name} is modeled at ${prospect.headcountLow} to ${prospect.headcountHigh}. Two smaller weekday sittings suit them better and suit the venue's empty hours better.`,
      subject: `A weekday option for ${prospect.name}`,
      body: `Every venue will push you at a Friday evening. If your ${prospect.headcountLow} to ${prospect.headcountHigh} people cannot all step out at the same time, that is the wrong shape to start with.

Two smaller weekday sittings work better: half the group each time, nobody left uncovered, and a quieter building. Main Event is opening at ${VENUE.address}, ${distance(prospect)} away, and several of its packages are already restricted to Monday through Thursday and Friday before five, so weekdays are the part of the week I can be most useful on. ${openingSentence(status)} Every weekday in the opening months is still open, which is the only time that will ever be true.

Tell me your headcount and I will put two options in writing this week.

${SIGN_OFF}`,
    });
  }

  // ---------------------------------------------------------------
  // 5. The fundraiser. The only offer with published terms behind it.
  // ---------------------------------------------------------------

  /**
   * THE ONE MESSAGE IN THIS FILE THAT QUOTES A REAL NUMBER, and that is
   * why it converts a cold lane.
   *
   * Every other pre-opening offer is a promise about priority. Spirit
   * Night is Main Event's own published programme at twenty per cent of
   * sales donated back, and Play It Forward is a published $19.95
   * voucher. Both can be quoted to a school or a nonprofit today without
   * anybody's approval, which turns this lane from a sale into an offer
   * and gets the organisation inside the building once before they are
   * ever asked for a contract.
   */
  if (
    prospect.lane === "faith-nonprofit" ||
    prospect.lane === "schools" ||
    prospect.lane === "colleges" ||
    prospect.lane === "fitness-youth-sports"
  ) {
    drafts.push({
      id: "fundraiser-first",
      label: "Fundraiser first",
      blurb: "Published terms, small commitment, gets them in the building.",
      why: "Spirit Night and Play It Forward are the only offers here with a number Main Event publishes itself, so they can be quoted today.",
      subject: `A fundraising night for ${prospect.name}, on published terms`,
      body: `There is one thing I can put in front of you today with the numbers already attached, because Main Event publishes the terms itself.

A Spirit Night donates twenty per cent of sales on the night back to your organisation. Play It Forward is a $19.95 voucher your group resells and keeps the margin on, redeemable Monday to Thursday and Friday before five. No contract, no deposit, no room to fill.

Main Event is opening at ${VENUE.address} in Brea. ${openingSentence(status)} The organisations that get the first nights in that building will be the ones who asked before it opened.

Tell me which of the two suits you and I will start it.

${SIGN_OFF}`,
      guardrail:
        "The twenty per cent and the $19.95 are Main Event's own published figures. Do not adjust either one in a message; a fundraising rate invented by a rep is a promise the venue has to honour.",
    });
  }

  // ---------------------------------------------------------------
  // 6. No written door. This one is a script, not an email.
  // ---------------------------------------------------------------

  /**
   * Twenty-odd organisations in this data set publish no email address at
   * all. The tool's honest answer is not to guess an address, it is to
   * say plainly that this one is a visit, and then be useful about the
   * visit.
   *
   * It sits in the templates file rather than somewhere else because it
   * is the same job: the words you use to open. It is labelled as a
   * script and it is not sendable, and the compose window should refuse
   * to send it, because a message with no address to go to is not a
   * message.
   */
  if (prospect.emailConfidence !== "verified_public") {
    drafts.push({
      id: "go-see-script",
      label: "Reception script, for a go-see",
      blurb: "Not sendable. What to say standing at their front desk.",
      why:
        prospect.emailConfidence === "none"
          ? "This organisation publishes no email address and no contact form. The only written door is the front door."
          : "Only a contact form is published, and forms land in queues. The visit is faster than the queue.",
      subject: "Not for sending. Say this at the desk.",
      body: `Ask for the ${role(prospect)} by title. Do not ask for a name you do not have.

"I am from Main Event, the entertainment venue opening on Birch Street, about ${distance(prospect)} from here. We are not open yet, so I am not selling anything today. I am filling the calendar for the first few months and ${prospect.name} is on my list because ${prospect.whyTheyFit.charAt(0).toLowerCase()}${prospect.whyTheyFit.slice(1)} Nothing on that calendar is taken, so whoever comes to me first picks their own date."

Then ask one question and stop talking: who here would own something like that.

Leave a card. Do not leave a brochure with prices in it, because there are none.`,
      guardrail:
        "Record the visit as an activity line, not as a booking. A go-see is hours out of the building, and hours are not revenue.",
    });
  }

  // ---------------------------------------------------------------
  // 7. The second touch. Shorter than the first, on purpose.
  // ---------------------------------------------------------------

  /**
   * A follow-up that repeats the first email is a first email sent twice,
   * and it teaches the reader that ignoring you works.
   *
   * This one is four sentences, adds one thing that was not in the
   * original, and names the end of the sequence out loud. Saying "if this
   * is not for you, tell me and I will stop" does two things at once: it
   * is the polite version of a close, and it is the only sentence in a
   * cold sequence that reliably produces a real answer.
   */
  if (touches >= 1) {
    drafts.push({
      id: "second-touch",
      label: "Second touch, then stop",
      blurb: "Four sentences. Names the end of the sequence.",
      why: `${touches} written touch${touches === 1 ? "" : "es"} already. Two emails and then a visit is the sequence; a fourth email is a spam complaint.`,
      subject: `Following up: ${windowShort(prospect)} at Main Event Brea`,
      body: `Following up on my note about ${windowShort(prospect)}.

One thing I left out: the opening calendar is still empty, every date on it, so a date held now costs you nothing and releases whenever you like. Once the building is open, first pick is gone and it does not come back at any price.

If this is not for you, or I have the wrong person, tell me and I will stop writing. If it is the wrong person, the right one is usually the ${role(prospect)}.

${SIGN_OFF}`,
    });
  }

  return drafts;
}

/**
 * The subject line, alone.
 *
 * The outbox and the compose window both need it, and a second
 * implementation of "what is this message called" is how a log ends up
 * disagreeing with the message it is logging.
 */
export function subjectFor(template: EmailTemplate): string {
  return template.subject;
}

/** A draft that cannot be sent, because there is nowhere to send it. */
export function isSendable(template: EmailTemplate): boolean {
  return template.id !== "go-see-script";
}

// =================================================================
// THE PACKAGE A DRAFT IS ALLOWED TO NAME
// =================================================================

/**
 * The packages that actually fit one organisation, and an honest flag
 * for when none of them do.
 *
 * Main Event tags every package with the lanes it is sold into, so the
 * fit is read off the data rather than decided by a chain of ternaries in
 * a component. That matters more than it looks: a picker that offers a
 * school an after-close corporate buyout is not a long list, it is a list
 * that tells the reader the tool does not know what a school is.
 *
 * `matchedLane` is false where the published pages simply do not describe
 * this kind of organisation. A small retail or food business is the
 * obvious case: mainevent.com sells to "corporate", to "schools" and to
 * "groups", and an eleven-person boba counter is none of those in the
 * company's own vocabulary. The honest answer there is not to pretend a
 * match, and not to show an empty picker either. It is to show everything
 * and say plainly why the list was not narrowed, which is what the flag
 * is for.
 */
export interface PackageFit {
  packages: EventPackage[];
  /** False where nothing is tagged for this lane and the list is unfiltered. */
  matchedLane: boolean;
}

export function packagesForProspect(prospect: Prospect): PackageFit {
  const fitted = PACKAGES.filter((p) => p.laneFit.includes(prospect.lane));

  /*
    THE LEAD PACKAGE IS ALWAYS IN THE LIST, even where Main Event's own
    laneFit tags disagree with the research pass. Several prospects are
    marked to lead with a package whose published page does not name
    their lane, usually because the organisation buys like a corporate
    account while sitting in another lane. Dropping it here would leave
    the picker showing nothing selected while the rest of the app,
    including the desk and the quote page, is pointed straight at it.
    A picker whose selection is invisible is worse than a slightly
    longer list.
  */
  const lead = PACKAGE_BY_ID[prospect.leadPackageId];
  if (lead && fitted.length > 0 && !fitted.some((p) => p.id === lead.id)) {
    return { packages: [lead, ...fitted], matchedLane: true };
  }
  if (fitted.length > 0) return { packages: fitted, matchedLane: true };
  return { packages: PACKAGES, matchedLane: false };
}

/** Does this package name this lane on its own published page. */
function fits(prospect: Prospect, packageId: string): boolean {
  return PACKAGE_BY_ID[packageId]?.laneFit.includes(prospect.lane) ?? false;
}

/** A published price, or null where Main Event withholds one. */
export function publishedPrice(packageId: string): number | null {
  return PACKAGE_BY_ID[packageId]?.pricePerGuest ?? null;
}

/**
 * The sentence a body uses where a price would go.
 *
 * It exists so that no promo ever interpolates a number into the gap.
 * The temptations are an estimate, a range and a "from", and all three
 * are a rep inventing a figure the company has deliberately not
 * published. What is true is shorter and lands better: the number comes
 * from a person, and that person is the one writing.
 */
function priceSentence(packageId: string): string {
  const pack = PACKAGE_BY_ID[packageId];
  const price = pack?.pricePerGuest ?? null;
  if (price !== null) {
    return `It is published at $${price.toFixed(2)} per guest, before tax and service fees, so you can check the number yourself before you reply.`;
  }
  return "Main Event does not publish a price for it. That page says to contact the local sales manager, which is me, so the number comes from a conversation rather than from a web page.";
}

/** Two or three published inclusions, in one readable clause. */
function inclusionClause(packageId: string, take = 3): string {
  const pack = PACKAGE_BY_ID[packageId];
  if (!pack) return "";
  const items = pack.inclusions.slice(0, take).map((i) => i.toLowerCase());
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

// =================================================================
// FEATURED PROMOS
// =================================================================

/**
 * The pre-written sends, each one anchored to a real package and a real
 * pre-opening offer.
 *
 * ── WHY THESE ARE NOT ONE TEMPLATE WITH A VARIABLE IN IT ──────────
 * The tempting shape is a single promo body with the package name
 * substituted in, and it is wrong for the same reason a mail merge is
 * wrong. A high school buying the All-Access Grad Pack has a published
 * $29.99 in front of it and a date in June that exists whether or not
 * anybody writes to them. The owner of an eleven-person boba counter has
 * no occasion, no committee and no published price to look at, and the
 * only honest number in their message is Main Event's own $14 per person
 * food floor. Those two messages disagree about what the offer even is.
 * Substituting a name into one body would produce a message that reads
 * as assembled, because it would have been.
 *
 * ── THE OFFER IS THE SECOND HALF OF EVERY ONE ─────────────────────
 * A package on its own is a brochure. What makes a pre-opening message
 * worth answering is the thing that costs the buyer nothing: first pick
 * of an empty calendar, a rate agreed before there is a rate card, a
 * fundraiser on terms the company publishes itself. Each promo below
 * carries an offer id from data/venue.ts, and the body says what that
 * offer actually is rather than gesturing at it.
 *
 * ── EVERY BRANCH IS READ OFF DATA, NEVER OFF A LANE KEY ───────────
 * Occasion class comes from LANE_META, package fit comes from each
 * package's own published laneFit, and size comes from the modeled
 * headcount. No list of lane keys appears anywhere in this file, so a
 * ninth or a tenth lane sorts itself into the right branch on the day it
 * lands rather than falling through to nothing.
 */
export function promoTemplatesFor(
  prospect: Prospect,
  ctx: TemplateContext = {},
): EmailTemplate[] {
  const status = ctx.openingStatus ?? VENUE.openingStatus;
  const lane = LANE_META[prospect.lane];
  const cls = lane.occasionClass;
  const high = prospect.headcountHigh;
  const drafts: EmailTemplate[] = [];

  // ---------------------------------------------------------------
  // 1. The one promo with a published price on it.
  // ---------------------------------------------------------------

  /**
   * THE ONLY GROUP PACKAGE ON MAINEVENT.COM WITH A NUMBER BESIDE IT
   * THAT A SCHOOL CAN ACT ON. Everything else a school might buy is
   * gated, so this is the single message in the set where the reader can
   * check the price themselves in fifteen seconds and never has to ask
   * what it costs. That is worth leading with even though it is not the
   * largest sale in the file.
   */
  if (cls === "calendar-locked" && fits(prospect, "all-access-grad-pack")) {
    const price = publishedPrice("all-access-grad-pack");
    drafts.push({
      id: "promo-grad-pack-published",
      label: "All-Access Grad Pack, at the published price",
      blurb: "The one group package with a number on it. $29.99 per guest.",
      why: "A calendar-locked buyer with a published price in front of them does not have to ask anybody what it costs, which removes the slowest step in the whole conversation.",
      packageId: "all-access-grad-pack",
      offerId: "first-fifty",
      subject: `${windowShort(prospect)}: the grad pack at $${price?.toFixed(2)} a head, published`,
      body: `Most of what a venue quotes a school is a number somebody had to ask for. The All-Access Grad Pack is not. Main Event publishes it: ${inclusionClause("all-access-grad-pack")}. ${priceSentence("all-access-grad-pack")} The published minimum is ${PACKAGE_BY_ID["all-access-grad-pack"]?.minGuests} guests.

Main Event is opening at ${VENUE.address} in Brea, ${distance(prospect)} from you. ${openingSentence(status)}

${
        status === "announced"
          ? "So the price is settled and the date is yours to choose. Nothing in the opening months is taken, a hold needs no deposit, and the day Main Event publishes a date that hold converts on the published terms or releases and you owe nothing. Your class would be one of the first through the doors."
          : "Now that there is a published date, we can put your date and your number in writing this week."
      }

Is the ${role(prospect)} the right person for that, or should I be writing to someone else.

${SIGN_OFF}`,
      guardrail: `The $${price?.toFixed(2)} is Main Event's own published figure and it excludes tax and service fees. Quote it exactly, and never quote a per-guest number for anything else in this message.`,
    });
  }

  // ---------------------------------------------------------------
  // 2. The largest youth occasion there is, and the emptiest hours.
  // ---------------------------------------------------------------

  /**
   * A lock-in is sold on hours the building was going to be dark anyway,
   * which is why it can be offered honestly to a group that has no
   * budget for a Friday evening. It is gated at 150 guests, so this
   * branch is size-gated too rather than offered to every school on the
   * board.
   */
  if (cls === "calendar-locked" && high >= 150 && fits(prospect, "school-lock-in")) {
    const pack = PACKAGE_BY_ID["school-lock-in"];
    drafts.push({
      id: "promo-lock-in-after-close",
      label: "School Lock-In, after the building closes",
      blurb: "For 150 guests and up. Hours the venue was going to be dark.",
      why: `${prospect.name} is modeled at ${prospect.headcountLow} to ${prospect.headcountHigh}, which clears the published ${pack?.minGuests} guest minimum on the lock-in.`,
      packageId: "school-lock-in",
      offerId: "first-fifty",
      subject: `The whole building for ${prospect.name}, after it closes`,
      body: `For a group your size there is a published format most venues cannot offer at all: the building to yourselves after it shuts for the night. Main Event publishes the lock-in as ${inclusionClause("school-lock-in", 4)}. It publishes a minimum of ${pack?.minGuests} guests and a maximum of ${pack?.maxGuests}, and it publishes plainly that food is not included.

${priceSentence("school-lock-in")}

Main Event is opening at ${VENUE.address}, ${distance(prospect)} from you. ${openingSentence(status)} A night that size is the one your students talk about for years, and every date in the opening months is still there to be taken. A hold needs no deposit while there is no date to hold it against.

Send me a rough headcount and a night that works, and I will pencil it.

${SIGN_OFF}`,
      guardrail:
        "Food is not in this package and the price is not published. Do not imply either. A lock-in quoted as all-inclusive is a refund conversation on the night.",
    });
  }

  // ---------------------------------------------------------------
  // 3. The fundraiser. Published terms, no contract, no room to fill.
  // ---------------------------------------------------------------

  /**
   * The only offer in data/venue.ts whose provenance is "public" rather
   * than "illustrative", because Main Event publishes the twenty per
   * cent itself. Everything else a rep can put on the table before
   * opening is a promise about priority. This one is a number the buyer
   * can read on the company's own page, which is why it opens a cold
   * lane that nothing else opens.
   */
  if (fits(prospect, "play-it-forward") || fits(prospect, "spirit-night")) {
    const voucher = publishedPrice("play-it-forward");
    const offer = OFFER_BY_ID["spirit-night-first-quarter"];
    drafts.push({
      id: "promo-fundraiser-published-terms",
      label: "Spirit Night and Play It Forward",
      blurb: "Two published numbers, no contract and no room to fill.",
      why: `${offer?.name ?? "The opening-months Spirit Night"} runs on terms Main Event publishes itself, so it can be quoted today without anybody's approval.`,
      packageId: "play-it-forward",
      offerId: "spirit-night-first-quarter",
      subject: `A fundraising night for ${prospect.name}, on published terms`,
      body: `Two things I can quote today, because Main Event publishes both itself. A Spirit Night donates twenty per cent of everything sold on the night back to your organisation, and your people bring themselves. Play It Forward is a voucher block at $${voucher?.toFixed(2)} that you resell at whatever you like and keep the difference on: ${inclusionClause("play-it-forward", 3)}. Minimum ${PACKAGE_BY_ID["play-it-forward"]?.minGuests} vouchers, Monday to Thursday and Friday before five, ages seventeen and under.

No contract, no deposit and no room to fill. Main Event is opening at ${VENUE.address} in Brea, ${distance(prospect)} from you. ${openingSentence(status)}

Take one of the opening dates and your organisation is inside that building, earning from it, before most of Brea has been through the doors.

Tell me which of the two suits you and I will set it up.

${SIGN_OFF}`,
      guardrail: `The twenty per cent and the $${voucher?.toFixed(2)} are Main Event's published figures. A fundraising rate invented by a rep is a promise the venue then has to honour.`,
    });
  }

  // ---------------------------------------------------------------
  // 4. The employer, and the hours the company itself is trying to fill.
  // ---------------------------------------------------------------

  /**
   * Main Event has restricted the Corporate All Access Pass to Monday
   * before four, Tuesday to Thursday, and Friday before five. That is
   * the company excluding its own peak hours from its own package,
   * published on its own page, and it means a midweek daytime ask is not
   * a discount dressed up as an offer. It is the inventory the business
   * is actively trying to sell.
   */
  if (cls === "discretionary" && high > 60 && fits(prospect, "corporate-all-access-pass")) {
    const pack = PACKAGE_BY_ID["corporate-all-access-pass"];
    drafts.push({
      id: "promo-midweek-daytime-lock",
      label: "Corporate All Access Pass, midweek",
      blurb: "A rate agreed now, on the hours the venue most needs to fill.",
      why: "Main Event has excluded this package from its own peak hours, so a midweek ask is the venue's own published preference rather than a concession.",
      packageId: "corporate-all-access-pass",
      offerId: "midweek-daytime-lock",
      subject: `${windowShort(prospect)} for ${prospect.name}, midweek and locked early`,
      body: `${prospect.whyTheyFit}

Main Event is opening at ${VENUE.address}, ${distance(prospect)} from you, with more than twenty six bowling lanes, a multi-level laser tag arena, Gravity Ropes and over a hundred games. ${openingSentence(status)}

The Corporate All Access Pass is ${inclusionClause("corporate-all-access-pass", 3)}, for ${pack?.minGuests} to ${pack?.maxGuests} guests. Main Event publishes it as valid Monday before 4pm, Tuesday to Thursday, and Friday before 5pm, which tells you exactly which hours this building wants filled. ${priceSentence("corporate-all-access-pass")}

So here is the offer: a rate agreed now and honoured for a year if you are willing to sit in those hours. A rate is only cheap to agree while there is no rate card and nothing on the calendar, and both of those are true today.

Fifteen minutes this week and I will put it in writing.

${SIGN_OFF}`,
      guardrail:
        "No number in this message. The package price is withheld, and a rate locked in an email before it has been agreed internally is a rate the venue is stuck with.",
    });
  }

  // ---------------------------------------------------------------
  // 5. The owner-operator, whose whole approval chain is one person.
  // ---------------------------------------------------------------

  /**
   * A boba counter, a tyre shop, a small franchise. Eight to sixty
   * staff, no HR department, no committee and no budget line called
   * "staff appreciation". The owner is the entire approval chain, which
   * means the message can be shorter and the ask can be smaller than
   * anything else in this file.
   *
   * It is also the only promo whose numbers are all floors rather than
   * prices: a ten guest minimum and a fourteen dollar per person food
   * spend, both published. That is the honest shape of this sale. There
   * is no package price to quote, so the message quotes what a person
   * would actually want to know, which is the smallest the thing can be.
   */
  const smallTeam = cls === "discretionary" && high <= 60;
  if (smallTeam || drafts.length === 0) {
    const pack = PACKAGE_BY_ID["fun-101"];
    drafts.push({
      id: "promo-staff-night-owner-operator",
      label: "A weekday staff night, owner to owner",
      blurb: "For a small team whose owner is the whole approval chain.",
      why: `${prospect.name} is modeled at ${prospect.headcountLow} to ${prospect.headcountHigh} people. That is one room, one decision and one evening, so the message should be short enough to answer from a phone behind the counter.`,
      packageId: "fun-101",
      offerId: "midweek-daytime-lock",
      subject: `A weeknight out for the ${prospect.name} team`,
      body: `${prospect.whyTheyFit}

Main Event is opening at ${VENUE.address}, ${distance(prospect)} from you. ${openingSentence(status)}

The smallest thing that works for a team your size is Fun 101: ${inclusionClause("fun-101", 3)}. Main Event publishes a ${pack?.minGuests} guest minimum on it and a food spend starting at $${BANQUET_FLOOR_PER_GUEST} per person, and that floor is the only per-person number the company publishes for a group like yours. ${priceSentence("fun-101")}

Pick a Monday to Thursday and it is the quietest the building will be. Nothing is booked yet, so you are choosing from a clean calendar rather than from what is left, and there is no deposit while there is no opening date.

One line back with a rough headcount is enough to start.

${SIGN_OFF}`,
      guardrail: `The $${BANQUET_FLOOR_PER_GUEST} is a published FLOOR on food, not a price for the evening. Saying "about fourteen dollars a head" turns a floor into a quote and the difference lands on the venue.`,
    });
  }

  // ---------------------------------------------------------------
  // 6. The room, and the walk of the building before it exists.
  // ---------------------------------------------------------------

  /**
   * Brea publishes dedicated meeting space, which almost no competitor
   * in this trade area does, and the All Day Meeting package is the only
   * one built around eight in the morning to five in the afternoon on a
   * weekday. That is the emptiest the building will ever be.
   *
   * The offer attached is the hard hat tour, because both of the buyers
   * this branch reaches, a referral partner and a company choosing a
   * venue for an offsite, decide with their feet.
   */
  if (fits(prospect, "all-day-meeting")) {
    drafts.push({
      id: "promo-meeting-space-hard-hat",
      label: "All Day Meeting, plus a hard hat walk",
      blurb: "Dedicated meeting space, and a walk of it during construction.",
      why: "Brea publishes dedicated meeting space, and this buyer decides with their feet rather than off a page. The construction walk can be given weeks before there is anything to sell.",
      packageId: "all-day-meeting",
      offerId: "founding-partner-tour",
      subject: `A meeting room on Birch Street, and a walk of it in hard hats`,
      body: `Brea publishes something most entertainment venues do not: private party rooms and dedicated meeting space, with catering, AV, free WiFi and free on-site parking. The All Day Meeting package runs Monday to Friday, 8am to 5pm, and is ${inclusionClause("all-day-meeting", 3)}. ${priceSentence("all-day-meeting")}

Main Event is building at ${VENUE.address}, ${distance(prospect)} from you. ${openingSentence(status)} Which means the room you want is still unspoken for, on the day you want it.

Before any of it is bookable, the useful thing is a walk of the site while it is still in construction. Twenty minutes, hard hats, and more memorable than any finished tour.

Tell me a morning and I will arrange it.

${SIGN_OFF}`,
      guardrail:
        "The number of rooms and their capacities are not published for Brea. Describe the space, never size it.",
    });
  }

  return drafts;
}

// =================================================================
// RESERVE A PARTY, OR HOLD A DATE
// =================================================================

export interface ReserveContext extends TemplateContext {
  /** ISO date being held. Empty until the rep types one. */
  date?: string;
  /** Guests actually discussed. Never a hoped-for number. */
  guests?: number;
  /** The package the hold is anchored against, where one is chosen. */
  packageId?: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * An ISO date as a person writes it.
 *
 * Split rather than parsed, for the same reason the outbox and the book
 * split theirs. `new Date("2027-06-12")` is midnight UTC and formatting
 * that in California prints the eleventh, and a hold confirmation that
 * names the wrong day is worse than one that names no day at all.
 */
export function longDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTH_NAMES[m - 1]} ${y}`;
}

/**
 * THE REP'S SIDE OF THE HOLD, WHICH IS THE ONLY ASK THAT WORKS BEFORE A
 * BUILDING OPENS.
 *
 * The group quote page already sends this request from the buyer's side.
 * This is the same agreement written back to them, and writing it down
 * is the entire point: a hold that exists only in a phone call is a hold
 * both parties remember differently a month later.
 *
 * FOUR THINGS HAVE TO BE IN IT AND ALL FOUR ARE HERE. The date. The
 * headcount. What that headcount consumes, at Main Event's own published
 * rule of one lane per twenty guests against a published floor of more
 * than twenty six lanes. And the fact that the hold costs nothing and
 * converts or releases the day an opening date is published.
 *
 * WHAT IS DELIBERATELY NOT IN IT is any suggestion that the building
 * will be open on the date being held. Main Event has published no
 * opening date for Brea. A hold is a queue position, and the message
 * says so in the same sentence that asks for it, because the concession
 * is what makes the ask credible rather than what weakens it.
 */
export function reservePartyTemplate(
  prospect: Prospect,
  ctx: ReserveContext = {},
): EmailTemplate {
  const status = ctx.openingStatus ?? VENUE.openingStatus;
  const guests = ctx.guests ?? Math.round((prospect.headcountLow + prospect.headcountHigh) / 2);
  const lanes = lanesForGuests(guests);
  const floor = VENUE.bowlingLanesPublishedFloor;
  const pack = ctx.packageId ? PACKAGE_BY_ID[ctx.packageId] : undefined;
  const dated = ctx.date ? longDate(ctx.date) : "";

  const overFloor = lanes > floor;

  const dateLine = dated
    ? `The date I am holding is ${dated}.`
    : "The date is the one thing still open. Give me a day and I will hold it in writing the same afternoon.";

  const packLine = pack
    ? `\n\nThe format we discussed is ${pack.name}. ${priceSentence(pack.id)}`
    : "";

  const sizeLine = overFloor
    ? `At ${guests} guests you are past what the published lane count can hold in one sitting. Main Event publishes more than ${floor} lanes for Brea and one lane per ${GUESTS_PER_BOWLING_LANE} guests, so a group this size is either a full facility conversation or two sittings, and I would rather say that now than on the day.`
    : `At ${guests} guests this holds ${lanes} of the more than ${floor} bowling lanes Main Event publishes for Brea, at the company's own rule of one lane per ${GUESTS_PER_BOWLING_LANE} guests.`;

  return {
    id: "reserve-party-hold",
    label: "Hold a date, in writing",
    blurb: "First pick of the opening calendar, in writing, at no cost.",
    why: "A hold agreed on a phone call is a hold both people remember differently later. This is the same agreement, written down on the day it was made.",
    packageId: ctx.packageId,
    offerId: "first-fifty",
    subject: dated
      ? `Holding ${dated} for ${prospect.name}, at no cost`
      : `A date held for ${prospect.name}, at no cost`,
    body: `This is the hold in writing, so we are both looking at the same thing.

${dateLine} ${sizeLine}${packLine}

It costs nothing. No deposit and no contract, because ${
      status === "announced"
        ? "Main Event has not made the opening date public and I will not ask you to commit money against a date that does not exist yet"
        : "the opening date has only just been published and the terms below are the ones that apply"
    }. The day an opening date is published, this either converts to a booking on Main Event's published terms, ${STANDARD_TERMS.bookingNoticeDays} days notice and a ${STANDARD_TERMS.depositPercent} per cent deposit, or it releases and you owe nothing either way.

What it buys you meanwhile is position. The opening calendar is empty, there are only so many dates in it, and each one that gets held is one nobody else can have.

If the date or the number is wrong, say so and I will change it today.

${SIGN_OFF}`,
    guardrail:
      "A hold is a queue position, not a booking, and not a promise that the building will be open on that date. Main Event has published no opening date for Brea. Never write one into this message.",
  };
}

// =================================================================
// THE BOWLING LEAGUES
// =================================================================

/**
 * WHAT MAIN EVENT ACTUALLY PUBLISHES ABOUT LEAGUES, WHICH IS LESS THAN
 * ANYBODY WANTS AND IS THE WHOLE REASON THIS SECTION IS WRITTEN CAREFULLY.
 *
 * Published, brand wide, on mainevent.com/the-leagues/: a programme called
 * Open Lane Socials under the banner Main Event Social Leagues, currently
 * open for registration, played on a Tuesday, a Wednesday or a Thursday at
 * the participant's choice, carrying an exclusive menu, fifteen per cent
 * off the next season and nightly prizes, and running a leaderboard across
 * centres. Registration is handed to leaguepals.com/mainevent.
 *
 * NOT published, anywhere: a price, a season length, a team size, a start
 * date, and any suggestion that Brea is one of the select locations. The
 * page names Colorado Springs, Windsor and Thornton and nowhere else.
 *
 * The one thing that makes a league conversation legitimate for a venue
 * that is not on that list is a sentence in Main Event's own blog post at
 * mainevent.com/stories/bowling-leagues/, which invites a reader to "ask
 * about our leagues, or see if we can host a league that you're starting".
 * That is soft, it is a blog rather than a product page, and it is quotable
 * as an invitation rather than as a commitment. Every draft below sits on
 * that sentence and none of them promises a season Brea has not announced.
 */

export type LeagueIntent =
  /** Open the conversation. What is published, what is not, and the ask. */
  | "league-enquiry"
  /** Put named people into a league that has room in it. */
  | "league-join"
  /** Register a team that already exists under a name it already has. */
  | "league-team"
  /** Form something new around this organisation rather than join it. */
  | "league-new";

/**
 * What the leagues surface hands the compose window.
 *
 * Deliberately plain strings and numbers rather than a league record type.
 * The leagues pages own their own domain model and this file has no
 * business importing it: a template needs a name, a night and a headcount,
 * and coupling the draft writer to somebody else's interface means every
 * change over there is a change in here.
 */
export interface LeagueContext {
  /** Display name, as the leagues board shows it. */
  leagueName: string;
  /** Night of play, in words, e.g. "Thursday". */
  night?: string;
  /** Weeks in the season, where the leagues board has set one. */
  weeks?: number;
  /** Team places still open, where the league is welcoming joiners. */
  spotsOpen?: number;
  /** A named team, on a registration message. */
  teamName?: string;
  /** Bowlers on that team. */
  teamSize?: number;
  /** In-app route back to the league, for the rep rather than the buyer. */
  leaguePath?: string;
}

/**
 * The guardrail every league draft carries, written once.
 *
 * It is the same warning four times because it is the same mistake four
 * times: a league named on this board is this tool's own construct, and
 * Main Event has published nothing about a league at Brea. A rep who
 * writes "our Thursday league" as though it were a running programme has
 * sold a season that does not exist.
 */
const LEAGUE_GUARDRAIL =
  "Main Event publishes Open Lane Socials at select locations only, and Brea is not one of them. No price, season length or team size is published for any of them. This is an expression of interest, and the only published invitation behind it is the company's own line about hosting a league somebody is starting.";

/** The published facts, in one clause, so four drafts cannot drift apart. */
const LEAGUE_PUBLISHED =
  "Main Event runs a league programme called Open Lane Socials, played midweek on a Tuesday, Wednesday or Thursday, with an exclusive menu, fifteen per cent off the following season and nightly prizes. It runs at select locations and Brea is not yet one of them, which I would rather say first than let you find out.";

function leagueWhen(ctx: LeagueContext): string {
  const parts: string[] = [];
  if (ctx.night) parts.push(`${ctx.night} nights`);
  if (ctx.weeks) parts.push(`${ctx.weeks} weeks`);
  return parts.length > 0 ? parts.join(", ") : "midweek";
}

/**
 * The four league drafts, one per intent.
 *
 * They are separate bodies rather than one body with a variable in it for
 * the same reason the promos are. An organisation asking what a league is
 * and an organisation handing over five names and a team called something
 * from a television programme are at opposite ends of the same
 * conversation, and a message that treats them as the same message reads
 * as assembled because it would have been.
 */
export function leagueTemplatesFor(
  prospect: Prospect,
  intent: LeagueIntent,
  ctx: LeagueContext,
): EmailTemplate[] {
  const when = leagueWhen(ctx);
  const team = ctx.teamName ?? `${prospect.name}`;
  const drafts: EmailTemplate[] = [];

  if (intent === "league-enquiry") {
    drafts.push({
      id: "league-enquiry",
      label: "What a league would actually be",
      blurb: "Answers the question with what is published and what is not.",
      why: "The first league message has to separate what Main Event publishes from what this venue has announced, because the two are not the same and the gap is where trust goes.",
      subject: `${ctx.leagueName}: what is published and what is not`,
      body: `You asked about a bowling league at the Birch Street venue, so here is the honest version.

${LEAGUE_PUBLISHED}

What that means for ${prospect.name} is that I can register interest rather than a place. ${ctx.leagueName} is ${when} on our own board, and Main Event's own line is that you can ask about a league or see whether they can host one you are starting. No price, no season length and no team size is published for any of it, so there are three numbers I will not invent for you.

The upside of asking this early is that there is no queue yet. Tell me roughly how many bowlers you would put in and yours is the first name on the list the day a season is announced for Brea.

${SIGN_OFF}`,
      guardrail: LEAGUE_GUARDRAIL,
    });
  }

  if (intent === "league-join") {
    drafts.push({
      id: "league-join",
      label: "Ask for a place in a league with room",
      blurb: "For an organisation putting people into a league that is welcoming.",
      why: `${ctx.leagueName} is marked as welcoming joiners on the board, which is the only reason this message can ask for a place rather than for interest.`,
      subject: `A place in ${ctx.leagueName} for ${prospect.name}`,
      body: `${ctx.leagueName} is ${when}${
        ctx.spotsOpen ? `, and it has ${ctx.spotsOpen} team place${ctx.spotsOpen === 1 ? "" : "s"} still open` : ", and it is welcoming joiners"
      }.

${LEAGUE_PUBLISHED}

So this is a request for a place rather than a booking. Send me names and I will hold the place with no deposit, because there is nothing to deposit against until Brea has a published season, and the places go in the order they are asked for. If the season never runs here, you owe nothing and I will say so on the day rather than let it go quiet.

How many bowlers, and which night suits them.

${SIGN_OFF}`,
      guardrail: LEAGUE_GUARDRAIL,
    });
  }

  if (intent === "league-team") {
    drafts.push({
      id: "league-team",
      label: "Register a named team",
      blurb: "For a team that already exists and already has a name.",
      why: "A team with a name and a headcount is further down the conversation than anything else in this file, so the message is shorter and asks for one thing.",
      subject: `Registering ${team} for ${ctx.leagueName}`,
      body: `Putting ${team}${
        ctx.teamSize ? `, ${ctx.teamSize} bowlers,` : ""
      } down for ${ctx.leagueName}, ${when}.

${LEAGUE_PUBLISHED}

That is why this is a registration of interest rather than a registration. Nothing is charged, nothing is committed, and the place converts on Main Event's published terms the day a season is announced for Brea, or it releases and you owe nothing.

If a name or a number below is wrong, tell me today and I will change it rather than carry it forward.

${SIGN_OFF}`,
      guardrail: LEAGUE_GUARDRAIL,
    });
  }

  if (intent === "league-new") {
    drafts.push({
      id: "league-new",
      label: "Form a league around them",
      blurb: "For an organisation with enough people to be the league itself.",
      why: `${prospect.name} is modeled at ${prospect.headcountLow} to ${prospect.headcountHigh} people, which is enough bodies to be the league rather than to join one.`,
      subject: `A league built around ${prospect.name}`,
      body: `${prospect.whyTheyFit}

${LEAGUE_PUBLISHED}

The useful part is the second half of that. Main Event's own writing invites you to ask whether they can host a league you are starting, and a group your size is closer to being the league than to filling a slot in somebody else's. ${ctx.leagueName} is what that would look like on our board: ${when}, your people, your name on it.

None of it is priced yet, so there is no number to give you. What I can do is put the format, the night and your name on it in writing now, so it is ready to run the day Brea has a season to run it in, with nobody ahead of you.

Worth fifteen minutes with the ${role(prospect)}?

${SIGN_OFF}`,
      guardrail: LEAGUE_GUARDRAIL,
    });
  }

  return drafts;
}

// =================================================================
// THE ORGANISATION'S OWN QUOTE LINK
// =================================================================

/**
 * The line that carries the quote link, written once.
 *
 * It sits after the sign-off as a postscript rather than inside the
 * body, and that is a decision rather than laziness. The bodies above
 * all end on an ask, and dropping a URL between the ask and the
 * signature buries the one sentence the message exists for. A postscript
 * is also the most read line in a short email, which is exactly where a
 * link belongs.
 *
 * One function, because the compose window, the copy control and the
 * outbox row must all agree about what was actually sent. Three places
 * appending their own version of this is how a log ends up disagreeing
 * with the message it is logging.
 */
export function quoteLinkPostscript(url: string): string {
  return `P.S. Everything published about a group booking here, and everything that is not, is on your own page: ${url}`;
}

export function withQuoteLink(body: string, url?: string | null): string {
  if (!url) return body;
  return `${body}\n\n${quoteLinkPostscript(url)}`;
}
