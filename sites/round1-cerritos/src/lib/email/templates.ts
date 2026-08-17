import type { EventPackage, OpeningStatus, Prospect } from "@/domain/types";
import { LANE_META, lanesForGuests, GUESTS_PER_BOWLING_LANE } from "@/domain/lanes";
import { PACKAGES, PACKAGE_BY_ID } from "@/data/packages";
import { VENUE, NEAREST_STORE, INBOUND_ROUTES } from "@/data/venue";
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
 * It is now "open". Round One Entertainment, Inc. has traded in the US
 * since 2010 and this application is centred on its corporate office in
 * Cerritos, so there is no opening to count towards and nothing left to
 * trade on but what is true today. What a letter can offer instead is a
 * store that exists now, Lakewood Center, and the two things Round1 publishes
 * about a party: what is in the package, and three days notice to change
 * a booking.
 *
 * ── WHAT THE LETTERS NO LONGER CLAIM ──────────────────────────────
 * They used to trade on an empty opening calendar and on a published
 * lane count. Neither belonged to this operator and neither survives the
 * repoint. Round1 publishes no lane count for any location and no price
 * for any party package, so a letter that needs either one to work does
 * not get written.
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
 * wrote it. No exclamation marks. No lane count, in any branch, because
 * Round1 publishes none. No manufactured urgency: no countdown, no number
 * of slots left, no offer that expires. No price for a party package,
 * because Round1 publishes none and inventing one is the single fastest
 * way to lose the room. And no invented human name anywhere: the messages
 * are addressed to a ROLE, and signed with one.
 *
 * ── WHAT IS QUOTED, AND WHAT IS STILL BORROWED ────────────────────
 * Every fact about Round1 in these bodies comes from round1usa.com by way
 * of data/venue.ts: the Cerritos address, the support number and its
 * label, the chain-wide attraction list, the All Inclusive Party contents,
 * the three day change notice, and Lakewood Center's address and hours.
 *
 * THE PACKAGE CATALOGUE IN data/packages.ts IS NOW ROUND1'S, AND IT IS
 * ONE ROW. It holds the All Inclusive Party, its published contents, a
 * withheld price and the three day change notice, and it holds nothing
 * else. So a draft that names a package names the only one there is, and
 * a reader who checks it against round1usa.com will find exactly what
 * this file says.
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
  /** The standing offer this draft leans on, from data/venue.ts. */
  offerId?: string;
}

/**
 * The sign-off. A ROLE and a published phone number, never a name.
 *
 * THE NUMBER IS LABELLED FOR WHAT IT IS. 855-772-6636 is Round1's
 * published customer support line and not an office line, so it is
 * written into the signature with that description attached. Putting it
 * there unlabelled would invite a buyer to believe they had reached the
 * desk of the person who wrote to them, and they would not have.
 *
 * Round1 publishes no email address and no named role on any of the pages
 * read for this document, which is itself the finding: a chain whose only
 * itemised party package carries no price publishes no written door to
 * the person who prices it.
 */
const SIGN_OFF = `Sales Manager
${VENUE.name}, ${VENUE.address}, ${VENUE.suite}, ${VENUE.city}, ${VENUE.state} ${VENUE.postalCode}
${INBOUND_ROUTES.supportPhone} (${VENUE.phoneLabel})`;

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
 * The sentence about where a group would actually go, written once.
 *
 * It appears in every template and it is the one paragraph that must
 * never drift, because it is the only place the app says anything about a
 * building. Writing it once means there is exactly one sentence to check.
 *
 * THE PRE-OPENING BRANCHES ARE DEAD AND THE FORK STAYS. Round1 has traded
 * in the US since 2010 and Cerritos is a corporate office rather than a
 * store, so `openingStatus` is "open" and the other two branches never
 * run today. They are kept because the switch is what makes the compiler
 * refuse a fourth state written without a sentence to go with it, and
 * they now say the only thing that is true of a chain that is already
 * open.
 */
function openingSentence(status: OpeningStatus): string {
  switch (status) {
    case "announced":
    case "date-set":
    case "open":
      return `The nearest Round1 to my desk is ${NEAREST_STORE.name} at ${NEAREST_STORE.address} in ${NEAREST_STORE.city}, open ${NEAREST_STORE.hours}, so this is a building you can walk into this week rather than a plan.`;
  }
}

export interface TemplateContext {
  /** From VENUE. Passed rather than read so a page can preview a branch. */
  openingStatus?: OpeningStatus;
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
          ? `${windowShort(prospect)}: holding a date at ${NEAREST_STORE.name}`
          : `${windowShort(prospect)}, and first pick of an empty calendar`,
      body:
        status === "date-set"
          ? `Your window is fixed: ${prospect.buyingWindow}. The venue is the only open question left in it.

I work out of Round1's US office at ${VENUE.address}, ${VENUE.suite}, in ${VENUE.city}, ${distance(prospect)} from you. ${openingSentence(status)} For a group your size the opener is usually ${leadPackageName(prospect)}.

Give me a day and I will hold it, or tell me who owns that calendar.

${SIGN_OFF}`
          : `The date is already decided for you: ${prospect.buyingWindow}. It happens whether or not anybody writes to you about it, and the venue gets picked well before the date arrives.

Round1 publishes what is in its All Inclusive Party: arcade time-play, bowling with shoe rental, karaoke or a party room, billiards and ping pong, pizza and soda, and a group photo. ${openingSentence(status)}

Two things I will not put in this letter because Round1 does not publish them: a price, and a lane count. Both come from the store, and getting them for you is my half of this.

Give me a day and I will start on both this week.

${SIGN_OFF}`,
      guardrail:
        "No price and no lane count, in any branch. Round1 publishes neither, for any location, and a number invented to fill the gap is the one mistake there is no recovering from.",
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

Round1 publishes bowling, arcade games, karaoke, billiards, darts, ping pong and a Japanese food hall across its stores, and spo-cha at some of them. ${openingSentence(status)}

Which means we can put a night and a headcount in writing this week, and I can come back with the number from the store.

Worth fifteen minutes with the ${role(prospect)}?

${SIGN_OFF}`,
      guardrail:
        "No price. Round1 publishes no price for any party package and its booking page says to contact the venue, so a number in this email would be invented.",
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
      subject: `A walk of ${NEAREST_STORE.name}, before you recommend it`,
      body: `You get asked where to send groups, and you will not recommend somewhere you have not seen. Fair. So this is not a booking ask.

${openingSentence(status)} Its published amenities are bowling, a VIP Immersive Lane option, arcade, billiards and ping pong, karaoke, party rooms, Victory Zone and the YUU food hall.

The offer is twenty minutes walking it with me, so that the next time somebody asks you where to send forty people, you are answering from the room rather than from a page.

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
   * and the hardest to sell once it is open. Round1 publishes ten in the
   * morning as its opening hour seven days a week, so a weekday sitting
   * is an ordinary published option rather than a favour. And the
   * organisations that can move to a Tuesday morning, a
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

Two smaller weekday sittings work better: half the group each time, nobody left uncovered, and a quieter building. ${openingSentence(status)} It opens at ten in the morning every day of the week, so a weekday sitting is a real option rather than a favour.

Tell me your headcount and I will put two options in writing this week.

${SIGN_OFF}`,
    });
  }

  // ---------------------------------------------------------------
  // 5. THE FUNDRAISER DRAFT IS GONE, AND THE HOLE IS THE FINDING.
  // ---------------------------------------------------------------

  /**
   * This slot held the strongest message in the file, and every word of
   * its substance was somebody else's. A twenty per cent fundraiser share
   * and a priced voucher block are another operator's published
   * programmes, recorded as theirs in data/rivals.ts. Round1 publishes no
   * fundraising programme, no donation share and no voucher, on any page
   * read for this document.
   *
   * So the draft is deleted rather than rewritten. Rewriting it would
   * have meant either inventing a Round1 fundraising rate or leaving a
   * competitor's figures in a letter signed by Round1, and both of those
   * are the same mistake wearing different clothes. The schools, colleges,
   * youth sports and faith lanes lose their cheapest opener and the
   * honest answer is that there is nothing published to replace it with.
   */

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

"I am from Round1. Our US office is in ${VENUE.city} and the nearest store is ${NEAREST_STORE.name} in ${NEAREST_STORE.city}, about ${distance(prospect)} from here. I am not selling you anything at the desk today. ${prospect.name} is on my list because ${prospect.whyTheyFit.charAt(0).toLowerCase()}${prospect.whyTheyFit.slice(1)}"

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
      subject: `Following up: ${windowShort(prospect)} at Round1`,
      body: `Following up on my note about ${windowShort(prospect)}.

One thing I left out: Round1 publishes that a booked party can be changed with three or more days notice, so a night put down now is not a night you are stuck with.

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
 * Every package row carries the lanes it is the right opener for, so the
 * fit is read off the data rather than decided by a chain of ternaries in
 * a component. That matters more than it looks: a picker that offers a
 * school an after-close buyout is not a long list, it is a list that
 * tells the reader the tool does not know what a school is.
 *
 * `matchedLane` is false where nothing in the catalogue is tagged for
 * this kind of organisation. With one published package tagged for every
 * lane that case does not arise today, and the flag is kept because the
 * honest answer to a future gap is not to pretend a match and not to
 * show an empty picker either. It is to show everything and say plainly
 * why the list was not narrowed.
 */
export interface PackageFit {
  packages: EventPackage[];
  /** False where nothing is tagged for this lane and the list is unfiltered. */
  matchedLane: boolean;
}

export function packagesForProspect(prospect: Prospect): PackageFit {
  const fitted = PACKAGES.filter((p) => p.laneFit.includes(prospect.lane));

  /*
    THE LEAD PACKAGE IS ALWAYS IN THE LIST, even where the catalogue's
    own laneFit tags disagree with the research pass. A prospect can be
    marked to lead with a package whose tags do not name their lane,
    usually because the organisation buys like a corporate account while
    sitting in another lane. Dropping it here would leave
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

/*
  `fits` and `inclusionClause` were deleted with the promos that used
  them. Both branched on a catalogue of a dozen packages with prices and
  minimums on them. Round1 publishes one package and no price, so there
  is nothing left for either helper to branch on and the drafts say the
  itemisation in plain words instead.
*/

/** A published price, or null where the company withholds one. */
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
function priceSentence(): string {
  return "Round1 publishes no price for it. The booking page says to contact the venue, which is me, so the number comes from a conversation rather than from a web page.";
}

// =================================================================
// FEATURED PROMOS
// =================================================================

/**
 * The pre-written sends.
 *
 * ── WHAT THIS SECTION USED TO BE, AND WHY IT IS A THIRD OF THE SIZE ─
 * It held six promos, and five of them were built on a competitor's
 * published catalogue: a priced grad pack, a large lock-in minimum, a
 * pass restricted to Monday before four, a food floor, an all day
 * meeting room. Every one of those numbers is real and none of them is
 * Round1's. Quoting a competitor's price list in a letter signed Round1
 * is not a smaller error than inventing one, it is a stranger one.
 *
 * WHAT ROUND1 PUBLISHES ABOUT PARTIES IS ONE PACKAGE AND ONE TERM. The
 * All Inclusive Party is itemised in public: arcade time-play, bowling
 * with shoe rental, karaoke or a party room, billiards and ping pong,
 * pizza and soda, a group photo, and a VIP Immersive Lane available as an
 * add-on at a separate fee. No price is published for any of it, the page
 * says to contact the venue, and changes need three or more days notice.
 * Spo-cha parties and parties including other amenities are sold
 * separately, with no further detail published, so no letter here
 * describes one.
 *
 * That is the whole raw material, and two drafts is what it honestly
 * supports. A third would be padding, and padding in outreach reads as
 * exactly what it is.
 *
 * ── THE BRANCH IS STILL READ OFF DATA ─────────────────────────────
 * Occasion class comes from LANE_META rather than from a list of lane
 * keys, so a tenth lane sorts itself into the right draft on the day it
 * lands. Both drafts carry the one `packageId` there is, so the compose
 * panel shows the same withheld price beside the words that the body
 * describes in prose.
 */
export function promoTemplatesFor(
  prospect: Prospect,
  ctx: TemplateContext = {},
): EmailTemplate[] {
  const status = ctx.openingStatus ?? VENUE.openingStatus;
  const lane = LANE_META[prospect.lane];
  const cls = lane.occasionClass;
  const drafts: EmailTemplate[] = [];

  /** Round1's own itemisation, written once so two drafts cannot drift. */
  const contents =
    "arcade time-play, bowling with shoe rental, karaoke or a party room, billiards and ping pong, pizza and soda, and a group photo";

  // ---------------------------------------------------------------
  // 1. The date exists. The package is the only open question.
  // ---------------------------------------------------------------

  if (cls === "calendar-locked") {
    drafts.push({
      id: "promo-all-inclusive-party-dated",
      label: "All Inclusive Party, against their fixed date",
      blurb: "The one package Round1 itemises in public. No price on it.",
      why: "A calendar-locked buyer already has the date. What they are choosing is the room, and this is the only Round1 package published in enough detail to choose from.",
      packageId: "all-inclusive-party",
      subject: `${windowShort(prospect)}: what is actually in a Round1 party`,
      body: `Your date is fixed: ${prospect.buyingWindow}. So this is about what your group would get rather than about when.

Round1 publishes the All Inclusive Party in full: ${contents}. A VIP Immersive Lane can be added at a separate fee. ${openingSentence(status)}

What Round1 does not publish is the price, for this or any package, and its own booking page says to contact the venue. I am the contact, so getting you a real number for ${prospect.headcountLow} to ${prospect.headcountHigh} people is the job rather than the obstacle.

Send me your headcount and the date and I will come back with the number and the room.

${SIGN_OFF}`,
      guardrail:
        "Never estimate the price, and never quote a lane count. Round1 publishes neither. If the reader pushes for a figure in writing, the honest answer is the date you will have one by.",
    });
  }

  // ---------------------------------------------------------------
  // 2. No occasion yet, so the letter has to make one out of a weekday.
  // ---------------------------------------------------------------

  /**
   * The published hours are doing the persuading here, and they are the
   * only Round1 figure in the letter. Lakewood Center opens at ten in the
   * morning seven days a week, which makes a weekday sitting an ordinary
   * request rather than a favour asked of a manager.
   */
  if (cls === "discretionary" || drafts.length === 0) {
    drafts.push({
      id: "promo-weekday-party-owner-operator",
      label: "A weekday night, and what is in it",
      blurb: "For a team with no occasion in the diary yet. Published hours.",
      why: `${prospect.name} has nothing scheduled, so the message has to earn the occasion before it earns the venue. The published opening hours are the only lever, and they are checkable.`,
      packageId: "all-inclusive-party",
      offerId: "change-notice-three-days",
      subject: `A weeknight out for the ${prospect.name} team`,
      body: `${prospect.whyTheyFit}

${openingSentence(status)} A weekday works for a team like yours precisely because it is quieter, and Round1 publishes the All Inclusive Party as ${contents}.

Two things worth knowing before you decide. Round1 publishes no price for it, so the number comes from the store and I will fetch it. And a booked party can be changed with three or more days notice, which is published, so a night put in now is not a night you are stuck with.

One line back with a rough headcount is enough to start.

${SIGN_OFF}`,
      guardrail:
        "The three day change notice is Round1's own published term. Do not soften it into a vague few days, and do not attach a price to anything in this message.",
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
 * THE REP'S SIDE OF THE HOLD.
 *
 * The group quote page already sends this request from the buyer's side.
 * This is the same agreement written back to them, and writing it down
 * is the entire point: a hold that exists only in a phone call is a hold
 * both parties remember differently a month later.
 *
 * THREE THINGS HAVE TO BE IN IT AND ALL THREE ARE HERE. The date. The
 * headcount. And the one booking term Round1 publishes, which is that a
 * change needs three or more days notice.
 *
 * A FOURTH USED TO BE HERE AND IT HAS BEEN TAKEN OUT. The letter used to
 * say what the headcount consumed, so many lanes of a published floor.
 * Round1 publishes no lane count for any location,
 * so the sentence has nothing to stand on and the letter says that
 * instead. A rep who wants the number asks the store, and it goes in the
 * record rather than into a letter that a buyer will hold the venue to.
 */
export function reservePartyTemplate(
  prospect: Prospect,
  ctx: ReserveContext = {},
): EmailTemplate {
  const guests = ctx.guests ?? Math.round((prospect.headcountLow + prospect.headcountHigh) / 2);
  const lanes = lanesForGuests(guests);
  const pack = ctx.packageId ? PACKAGE_BY_ID[ctx.packageId] : undefined;
  const dated = ctx.date ? longDate(ctx.date) : "";

  const dateLine = dated
    ? `The date I am holding is ${dated}.`
    : "The date is the one thing still open. Give me a day and I will hold it in writing the same afternoon.";

  const packLine = pack
    ? `\n\nThe format we discussed is ${pack.name}. ${priceSentence()}`
    : "";

  const sizeLine = `At ${guests} guests we would be planning around ${lanes} ${
    lanes === 1 ? "lane" : "lanes"
  }, at one lane per ${GUESTS_PER_BOWLING_LANE} guests, which is my own planning rate rather than a Round1 rule. How many lanes the store has is not published, so whether that is comfortable on your date is a question I will put to the store rather than answer here.`;

  return {
    id: "reserve-party-hold",
    label: "Hold a date, in writing",
    blurb: "The date, the headcount and the published change notice.",
    why: "A hold agreed on a phone call is a hold both people remember differently later. This is the same agreement, written down on the day it was made.",
    packageId: ctx.packageId,
    offerId: "change-notice-three-days",
    subject: dated
      ? `Holding ${dated} for ${prospect.name}`
      : `A date held for ${prospect.name}`,
    body: `This is the hold in writing, so we are both looking at the same thing.

${dateLine} ${sizeLine}${packLine}

Round1 publishes that a booked party can be changed with three or more days notice, so this is not a decision you are locked into. What I have not put in this letter is a price, because Round1 publishes none and its booking page says to contact the venue. That is my half of the work and you will have the number from me rather than from a page.

If the date or the number is wrong, say so and I will change it today.

${SIGN_OFF}`,
    guardrail:
      "No price and no lane count. Round1 publishes neither. The three day change notice is published and can be quoted exactly as it stands.",
  };
}

// =================================================================
// THE BOWLING LEAGUES
// =================================================================

/**
 * WHAT ROUND1 PUBLISHES ABOUT LEAGUES, WHICH IS NOTHING AT ALL, AND WHY
 * THIS SECTION STILL EXISTS.
 *
 * The fork could lean on a competitor's named league programme, with
 * published nights and a published discount off the following season.
 * None of that transfers. Across the corporate
 * profile, the booking page, the party room page and the Lakewood Center
 * store page, Round1 publishes bowling and publishes no league: no
 * programme name, no night, no season length, no team size, no price and
 * no invitation to start one.
 *
 * So every draft below is an expression of interest and says so in its
 * first paragraph. Nothing here promises a season, and there is no
 * published sentence to soften that with. An organisation asking about a
 * league is still worth answering, because the ask itself is a bowling
 * group with names attached, but the answer has to be honest about the
 * fact that it is a request rather than a registration.
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
 * Round1 has published nothing about a league anywhere. A rep who
 * writes "our Thursday league" as though it were a running programme has
 * sold a season that does not exist.
 */
const LEAGUE_GUARDRAIL =
  "Round1 publishes no league programme of any kind, at any location. No name, night, season length, team size or price. This is an expression of interest and there is no published programme behind it, so nothing in the message may be phrased as a season that already runs.";

/** The published position, in one clause, so four drafts cannot drift apart. */
const LEAGUE_PUBLISHED =
  "Round1 publishes bowling at its stores and publishes nothing at all about leagues: no programme, no night, no season length and no price. I would rather say that first than let you find it out later.";

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
      why: "The first league message has to separate what Round1 publishes from what this board has drawn up, because the two are not the same and the gap is where trust goes.",
      subject: `${ctx.leagueName}: what is published and what is not`,
      body: `You asked about a bowling league, so here is the honest version.

${LEAGUE_PUBLISHED}

What that means for ${prospect.name} is that I can register interest rather than a place. ${ctx.leagueName} is ${when} on our own board, which is this team's working plan and not a Round1 programme. There is no price, no season length and no team size to give you, so there are three numbers I will not invent.

The upside of asking this early is that there is no queue. Tell me roughly how many bowlers you would put in and yours is the first name on the list the day there is a season to put them in.

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

So this is a request for a place rather than a booking. Send me names and I will hold the place with no deposit, because there is nothing to deposit against until there is a published season, and the places go in the order they are asked for. If a season never runs, you owe nothing and I will say so on the day rather than let it go quiet.

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

That is why this is a registration of interest rather than a registration. Nothing is charged and nothing is committed. The day Round1 publishes a season, this converts on whatever terms it publishes then, or it releases and you owe nothing.

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

The useful part is what a group your size already is. You are closer to being the league than to filling a slot in somebody else's, and that is true whether or not a programme ever exists to join. ${ctx.leagueName} is what it would look like on our board: ${when}, your people, your name on it.

None of it is priced, so there is no number to give you. What I can do is put the format, the night and your name on it in writing now, so it is ready the day there is a season to run it in, with nobody ahead of you.

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
