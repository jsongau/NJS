import { groupProfile } from "@/domain/booking";
import type { EventPackage, OpeningStatus, Prospect } from "@/domain/types";
import { LANE_META, crewSlotsForDoors, DOORS_PER_CREW_SLOT } from "@/domain/lanes";
import {
  PACKAGES,
  PACKAGE_BY_ID,
  LOWEST_PUBLISHED_PLAN_PRICE,
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
 * WHO THE ROW IS, because it decides what the message is even about. A
 * property manager with four hundred doors is not buying a service, they
 * are buying the absence of a second phone call at eleven at night. The
 * only sentence that opens that conversation is a response commitment. A
 * chamber of commerce has not decided to have a home services partner at
 * all; writing to them about dispatch windows answers a question they
 * have not asked, and it reads as a form letter because functionally it
 * is one. That message has to be about their members first and about us
 * second.
 *
 * WHAT IS ACTUALLY LIVE THIS MONTH, because it decides what can honestly
 * be offered. Two of the hooks in nearly every home services template in
 * circulation are dead: the federal 25C credit is not allowed for
 * property placed in service after 31 December 2025, and TECH Clean
 * California single-family money was fully reserved for Southern
 * California on 7 January 2026. A letter quoting either tells the reader
 * you have not checked since last year. Half these drafts rewrite
 * themselves on that.
 *
 * ── THE GAP IS THE OFFER, NOT THE APOLOGY ─────────────────────────
 * These bodies used to open by naming what was absent. Honest, and the
 * wrong first sentence, because the first sentence is where a reader
 * decides whether to keep reading and that one reads like a disclaimer.
 *
 * The strongest thing this division has to say is a gap in the market
 * rather than a discount: not one of the fourteen competing brands read
 * for this console publishes what its membership plan costs. Two brands
 * in the whole set publish theirs and both are ours. That is checkable
 * in ninety seconds by anybody who doubts it, which is exactly why it
 * does not need dressing up, and it is worth more than another coupon in
 * a market where the drain price has already been driven to 57 dollars.
 *
 * ── WHY THEY ARE SHORT, AND WHERE THE ASK SITS ────────────────────
 * Roughly nine in ten emails are opened in Apple Mail or Gmail and the
 * average attention on one is about eleven seconds. Long prose does not
 * get read by a regional facilities manager between two site visits; it
 * gets deferred to a desk, and deferral is where outreach dies. Every
 * first touch below runs to four short paragraphs, sign-off included,
 * and the promotions run longer only because they carry published
 * figures the reader would otherwise have to go and look up.
 *
 * There is exactly ONE ask in each, it is the last line, and it is
 * small: a list of addresses, ten or fifteen minutes, one out-of-hours
 * call before anything is signed. Three calls to action stacked at the
 * end of a cold email is a reader deciding between them by closing the
 * message.
 *
 * ── WHAT IS DELIBERATELY ABSENT ───────────────────────────────────
 * No "I hope this email finds you well", which announces that a template
 * wrote it. No "excited to announce", for the same reason. No
 * exclamation marks. No rebate, credit or programme that was not
 * verified live on 18 August 2026, ever, in any branch, and no
 * manufactured urgency either: where a deadline appears it is a printed
 * expiry on somebody's published page and the letter says whose. No
 * price for an offer nobody publishes a price for, because inventing one
 * is the fastest way to lose a room. And no invented human name
 * anywhere: the messages are addressed to a ROLE, and signed with one.
 *
 * ── WHAT IS QUOTED ────────────────────────────────────────────────
 * Every commercial fact in these bodies was read off a brand's, a
 * utility's or an agency's own page on 18 August 2026 and is carried in
 * data/venue.ts or data/packages.ts: the 47 dollar tune-up and the 47
 * dollar drain clearing and their 31 August expiry, the 3,500 dollar
 * system offer and its expiry, ASI Rewards at 19.95 a month, the Timo's
 * Advantage Plan at 15 a month or 189 a year, the 19 dollar member
 * diagnostic, the multifamily figure of up to 14,000 dollars a unit and
 * the fact that two agencies disagree about whether its intake is open.
 * Nothing else is stated as fact.
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
   * The published offer this draft was written against, where it was
   * written against one.
   *
   * Carried so the compose window can show the price, or the sentence
   * that stands in for a price, beside the words that mention it. A
   * message whose body quotes the 47 dollar tune-up while the picker is
   * pointed at the membership is the kind of quiet disagreement that ends
   * up in front of a customer.
   */
  packageId?: string;
  /** The standing offer this draft leans on, from data/venue.ts. */
  offerId?: string;
}

/**
 * The sign-off. A ROLE and a published phone number, never a name.
 *
 * The number is the brand's own published line. It appears here because a
 * message that gives no way to reach a person is a message that has not
 * really asked for anything, and because a phone number is the contact
 * route these brands actually publish. Not one of the five West Division
 * sites publishes a named marketing contact or a departmental email
 * address, which is itself a finding: every brand in the division routes
 * a partner enquiry to the same line a homeowner with a blocked drain
 * calls.
 */
const SIGN_OFF = `Marketing Manager, West Division
${VENUE.address}
${INBOUND_ROUTES.breaPhone}`;

/**
 * "the regional facilities manager", lower cased mid-sentence.
 *
 * An all-capital token is left alone, because the alternative is real and
 * it is embarrassing: the published titles include "HR / People Ops
 * Manager" and "Chamber President / CEO", and a blanket lower case turns
 * a letter's last line into "worth fifteen minutes with the hr / people
 * ops manager". A reader does not conclude that the sender is casual.
 * They conclude that a programme wrote it, which is the one thing every
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


/**
 * The sentence about where the campaign period stands, written three
 * ways.
 *
 * It appears in every template and it is the one paragraph that must
 * never drift, because it is the only place the app makes a claim about
 * the state of the published campaign. Writing it once means there is
 * exactly one sentence to check.
 *
 * The first branch is the true one in mid-August 2026: the live campaign
 * carries a printed expiry of 31 August and nothing has been published to
 * follow it. That is stated as a fact about a published page rather than
 * as pressure, because it is checkable in one click and pressure is not.
 */
function openingSentence(status: OpeningStatus): string {
  switch (status) {
    case "announced":
      return "The current campaign carries a printed expiry of 31 August 2026 and no successor is published yet, which is why an arrangement rather than a coupon is the useful thing to agree now.";
    case "date-set":
      return "The next campaign period is published, so the figures below carry its dates rather than the ones that have just lapsed.";
    case "open":
      return "The new campaign is live, so the quickest thing is to look at the numbers on it together before the heating season starts.";
  }
}

export interface TemplateContext {
  /** From VENUE. Passed rather than read so a page can preview a branch. */
  openingStatus?: OpeningStatus;
  /** Weeks left in the campaign period. Drives urgency, honestly. */
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
  const touches = ctx.touches ?? 0;
  const lane = LANE_META[prospect.lane];
  const drafts: EmailTemplate[] = [];

  /*
    ── WHAT A DIVISION MARKETER ACTUALLY SENDS ───────────────────────
    This file used to write letters selling occasions, because the console
    it came from was built for a different trade. A Marketing Manager for a multi-brand home
    services division does not sell anything by email. They build the
    local surfaces that produce calls: preferred-vendor status with the
    people standing next to a homeowner when a system fails, sponsorships
    in the postcodes the brands serve, and the weekly note that tells a
    General Manager what moved.

    So the drafts below are grouped by WHO the row is, which on this board
    is its lane, and every one of them is written to be sent by a
    marketer rather than by a salesperson.

    ── THE ONE FACT THAT SHAPES ALL OF THEM ──────────────────────────
    Two hooks that appear in nearly every home services outreach template
    in circulation are dead as of 2026, and sending either one is worse
    than sending nothing because it tells the reader you have not checked:

      The federal 25C credit, the "up to $2,000 on a heat pump" line, is
      NOT allowed for property placed in service after 31 December 2025.
      Source: the IRS FAQ on the modifications made by Public Law 119-21.

      TECH Clean California single-family incentives were fully reserved
      statewide as of 24 February 2026, with Central and Southern
      California closed on 7 January 2026.

    THE MULTIFAMILY SIDE IS CONTESTED AND THIS FILE REFUSES TO ASSERT IT.
    The California Energy Commission says HEEHRA Phase I is still taking
    multifamily applications at up to $14,000 a unit. TECH Clean
    California says multifamily HEEHRA is paused for new Stage 1
    applications. Two public bodies, two answers, and a marketing manager
    who prints the cheerful one on a flyer has bet a partner
    relationship on which of them is out of date.

    So the property manager draft names the disagreement rather than the
    figure, and asks for the property list so the eligibility can be
    established before anybody is promised anything. That reads as more
    competent than a rebate number, not less, and it is the only version
    of this message that survives the phone call it produces.

    A live example of the risk, found while researching this: Southern
    California Edison's own customer factsheet still advertises TECH
    incentives and tells customers to combine them with "federal tax
    credits under the Inflation Reduction Act". If a utility's own page
    is stale, every co-branded flyer in a partner's drawer is staler.
  */

  // ---------------------------------------------------------------
  // 1. Property, the highest value partner in home services
  // ---------------------------------------------------------------

  if (prospect.lane === "partner-property") {
    drafts.push({
      id: "property-sla-first",
      label: "Property manager, response time first",
      blurb:
        "For a manager with tenants. Leads with the only number they care about.",
      why: "A property manager is not buying a service, they are buying the absence of a callback. The first line is a response commitment rather than a company introduction.",
      guardrail:
        "Do not promise a response time the division has not agreed to. If the number is not signed off, send the draft without it and ask what theirs is instead.",
      subject: `After-hours dispatch for ${prospect.name}`,
      body: `Hello,

I look after local marketing for the ${lane.short.toLowerCase()} side of our West brands, and I am writing about the part of your week we could take off you rather than about adding a vendor to a list.

When a unit loses heating or a line backs up after five, the call you get is from a tenant and the cost you carry is the second call. What I would like to agree is the boring version of that: a direct dispatch number that skips our call centre, a written response window, and a not-to-exceed figure under which we simply fix it and send you the photographs afterwards rather than ringing you for approval.

If that is useful, the fastest way to test it is with one after-hours call before anything is signed.

Tell me who handles your maintenance vendors and I will send the certificate of insurance and the dispatch number the same day.

${SIGN_OFF}`,
    });

    drafts.push({
      id: "property-multifamily-rebate",
      label: "Multifamily, what is dead and what is disputed",
      blurb:
        "For a portfolio with multifamily. Leads with the corrections, not with a figure.",
      why: "Every competitor's template still quotes the single-family rebates and those are gone. This draft wins on being the message that tells them so, and it deliberately does not replace one confident number with another.",
      guardrail:
        "DO NOT PUT A MULTIFAMILY FIGURE IN THIS EMAIL. The CEC and TECH Clean California disagree about whether multifamily intake is open, and a dollar amount in writing is a promise. Establish eligibility first, in a call, and quote nothing until an administrator confirms intake in writing.",
      subject: `Two rebates that ended, and one nobody can answer yet`,
      body: `Hello,

Short note, and it is about a deadline rather than about us.

The federal credit that everybody quoted on heat pumps, the up-to-two-thousand-dollar one, no longer applies to anything placed in service after 31 December 2025. California's TECH single-family incentives were fully reserved statewide in February. If you have a flyer in a drawer that mentions either, it is out of date, and so is most of what you will be sent this year.

The multifamily side is the part worth twenty minutes, and I want to be careful about how I put it. There is a multifamily programme that covers heat pumps, water heaters and the electrical work behind them. Right now the state energy commission describes it as taking applications and the programme's own administrator describes new applications as paused. I am not going to quote you a figure while two public bodies disagree about whether the door is open, because a number in an email is a promise.

What I can do is the useful half. If you send the addresses and the equipment ages, I will put together which of your units would qualify if intake is open, and I will get the intake status confirmed in writing before either of us builds a budget on it.

${SIGN_OFF}`,
    });
  }

  // ---------------------------------------------------------------
  // 2. Community, which is sponsorship rather than sales
  // ---------------------------------------------------------------

  if (prospect.lane === "partner-community") {
    drafts.push({
      id: "community-sponsorship",
      label: "Community sponsorship, specific ask",
      blurb:
        "For a school, church or civic body. Offers a named thing, not a partnership.",
      why: "Community outreach fails when it asks to explore a relationship. It works when it names one event, one amount of help and one date.",
      guardrail:
        "Never offer money for reviews, referrals or lists. It is against Google's and Yelp's policies and it is the fastest way to lose the local pack.",
      subject: `Sponsoring something at ${prospect.name}`,
      body: `Hello,

I handle local marketing for a group of home services brands that work in ${prospect.city}, and I would like to sponsor something specific rather than ask what opportunities exist.

The two we do well are a fundraiser where we cover a real cost you would otherwise carry, and a safety session: a technician walks a group through what a failing water heater or an overloaded panel actually looks like in a house, which is genuinely useful and takes half an hour.

If either is worth a conversation, tell me what you have coming up in the next term and I will tell you plainly whether we can help with it.

${SIGN_OFF}`,
    });
  }

  // ---------------------------------------------------------------
  // 3. Employers, one relationship reaching many households
  // ---------------------------------------------------------------

  if (prospect.lane === "partner-employer") {
    drafts.push({
      id: "employer-benefit",
      label: "Employee programme, no work for them",
      blurb:
        "For an employer or a chamber. Built to be somebody's easy yes.",
      why: "Nobody at an employer owns a home services programme, so the message has to arrive as a finished thing rather than as a project somebody has to start.",
      subject: `A home services benefit for the ${prospect.name} team`,
      body: `Hello,

I run local marketing for a group of home services brands working across ${prospect.city} and the surrounding cities, and I have a small thing that costs you nothing to offer and nothing to administer.

We set up a named line and a standing discount for a company's staff, you put one paragraph in whatever you already send them, and we handle everything after that. No portal, no enrolment, no invoicing on your side.

If that is worth a look I will send the paragraph and the flyer so you can see exactly what your people would receive before you decide.

${SIGN_OFF}`,
    });
  }

  // ---------------------------------------------------------------
  // 4. Competitors and our own brands are not written to
  // ---------------------------------------------------------------

  if (prospect.role === "competitor" || prospect.role === "champions") {
    drafts.push({
      id: "no-outreach",
      label: "Not an outreach row",
      blurb: "This row is on the board to be watched, not written to.",
      why: "A competitor is a source of intelligence. An email to one is at best wasted and at worst the reason they start watching back.",
      guardrail:
        "There is no send path for this row, which is deliberate. If a competitor genuinely becomes a partner, change the role on the row first and the drafts will follow.",
      subject: "",
      body: `${prospect.name} is on this board as a ${prospect.role === "champions" ? "brand the division operates" : "competing operator"}, not as somebody to contact.

What the row is for is the published half of their marketing: the offer on their homepage, the membership plan, whether a household can book a call online, and the cities they claim. All of that is on the detail panel and all of it was read off their own site.`,
    });
  }

  // ---------------------------------------------------------------
  // 5. The weekly note upward, which the posting names by itself
  // ---------------------------------------------------------------

  if (touches > 0 || prospect.role === "partner") {
    drafts.push({
      id: "gm-weekly",
      label: "Weekly note to the General Manager",
      blurb:
        "The internal message. Opportunities and risks, in that order, with numbers.",
      why: "The posting asks for weekly reports and insights on the West brands to identify early opportunities and risks. This is that message, written the way an operator reads one.",
      guardrail:
        "Never send a weekly note without a number that moved. If nothing moved, say that in one line rather than filling the space.",
      subject: `West weekly: what moved and what is at risk`,
      body: `Morning,

Three things, shortest first.

At risk. The summer campaign is live across the brand sites and its fine print expires on 31 August, which is thirteen days out, and nothing has been published to follow it. On 1 September the banner still says the savings are here and the page behind it stops being true.

Opportunity. The federal heat pump credit ended for anything placed in service after 31 December, and California's single family rebates are fully reserved. Every competitor flyer in the market is quoting money that is gone. The multifamily incentives are still open, which points our property manager outreach somewhere the field is empty.

Watching. ${prospect.name} in ${prospect.city} is the row I would keep an eye on this week. What they publish is on the board.

Happy to walk any of it at the Monday call.

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
// THE OFFER A DRAFT IS ALLOWED TO NAME
// =================================================================

/**
 * The offers that actually fit one organisation, and an honest flag for
 * when none of them do.
 *
 * Every row on the shelf carries the service lines and partner types it
 * opens, so the fit is read off the data rather than decided by a chain
 * of ternaries in a component. That matters more than it looks: a picker
 * that offers a chamber of commerce a whole-system replacement incentive
 * is not a long list, it is a list that tells the reader the tool does
 * not know what a chamber is.
 *
 * `matchedLane` is false where nothing on the shelf is tagged for this
 * kind of organisation at all. The honest answer there is not to pretend
 * a match, and not to show an empty picker either. It is to show
 * everything and say plainly why the list was not narrowed, which is
 * what the flag is for.
 */
export interface PackageFit {
  packages: EventPackage[];
  /** False where nothing is tagged for this lane and the list is unfiltered. */
  matchedLane: boolean;
}

export function packagesForProspect(prospect: Prospect): PackageFit {
  const fitted = PACKAGES.filter((p) => p.laneFit.includes(prospect.lane));

  /*
    THE LEAD OFFER IS ALWAYS IN THE LIST, even where the shelf's own lane
    tags disagree with the research pass. Several accounts are marked to
    lead with an offer whose lanes do not name their service line,
    usually because the organisation buys like a portfolio while sitting
    in another lane. Dropping it here would leave the picker showing
    nothing selected while the rest of the app, including the desk and
    the proposal page, is pointed straight at it. A picker whose
    selection is invisible is worse than a slightly longer list.
  */
  const lead = (prospect.leadPackageId ? PACKAGE_BY_ID[prospect.leadPackageId] : undefined);
  if (lead && fitted.length > 0 && !fitted.some((p) => p.id === lead.id)) {
    return { packages: [lead, ...fitted], matchedLane: true };
  }
  if (fitted.length > 0) return { packages: fitted, matchedLane: true };
  return { packages: PACKAGES, matchedLane: false };
}

/** Does this offer name this service line among the ones it opens. */
function fits(prospect: Prospect, packageId: string): boolean {
  return PACKAGE_BY_ID[packageId]?.laneFit.includes(prospect.lane) ?? false;
}

/** A published price, or null where the brand withholds one. */
export function publishedPrice(packageId: string): number | null {
  return PACKAGE_BY_ID[packageId]?.pricePerGuest ?? null;
}

/**
 * The sentence a body uses where a price would go.
 *
 * It exists so that no draft ever interpolates a number into the gap.
 * The temptations are an estimate, a range and a "from", and all three
 * are a marketer inventing a figure the brand has deliberately not
 * published. What is true is shorter and lands better: the number comes
 * from a person, and the fact that it does is the finding.
 */
function priceSentence(packageId: string): string {
  const pack = PACKAGE_BY_ID[packageId];
  const price = pack?.pricePerGuest ?? null;
  if (price !== null) {
    return `It is published at $${price.toFixed(2)}, on the page linked below, so you can check the number yourself before you reply.`;
  }
  return "Nobody publishes a price for this one, ours included. The page carries a phone number where the number should be, which is exactly the thing worth fixing and exactly why this note is short.";
}

/**
 * Two or three published lines from the offer, in one readable clause.
 *
 * They are reproduced as published rather than lower cased into the
 * sentence, because several of them begin with a brand name or a
 * figure, and "powell electric: 49 dollars off" in the middle of a
 * paragraph reads as a programme wrote it. Quoting them as written is also
 * the more honest form: what the reader gets is the published line, not
 * a paraphrase of it.
 */
function inclusionClause(packageId: string, take = 3): string {
  const pack = PACKAGE_BY_ID[packageId];
  if (!pack) return "";
  const items = pack.inclusions.slice(0, take);
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join("; ")}; and ${items[items.length - 1]}`;
}

// =================================================================
// FEATURED CAMPAIGN DRAFTS
// =================================================================

/**
 * The pre-written sends, each one anchored to a real row on the offer
 * shelf and a real standing offer.
 *
 * ── WHY THESE ARE NOT ONE TEMPLATE WITH A VARIABLE IN IT ──────────
 * The tempting shape is a single body with the offer name substituted
 * in, and it is wrong for the same reason a mail merge is wrong. A
 * property manager holding four hundred doors has a published 3,500
 * dollar system offer in front of them and a deadline that exists
 * whether or not anybody writes to them. The owner of an eleven-person
 * shop has no portfolio, no committee and no reason to care about a
 * replacement incentive, and the only honest number in their message is
 * the 15 dollars a month that is the lowest published plan in this
 * market. Those two messages disagree about what the offer even is.
 *
 * ── THE OFFER IS THE SECOND HALF OF EVERY ONE ─────────────────────
 * A price on its own is a coupon, and this market has run out of room
 * underneath its coupons. What makes a message worth answering is the
 * thing that costs the reader nothing to accept: a written response
 * window, a price that survives the campaign it came from, a plan whose
 * number is on the page. Each draft below carries an offer id from
 * data/venue.ts, and the body says what that offer actually is rather
 * than gesturing at it.
 *
 * ── EVERY BRANCH IS READ OFF DATA, NEVER OFF A LANE KEY ───────────
 * Occasion class comes from LANE_META, offer fit comes from each row's
 * own laneFit, and size comes from the modelled door count. No list of
 * lane keys appears anywhere in this file, so a ninth or a tenth service
 * line sorts itself into the right branch on the day it lands rather
 * than falling through to nothing.
 */
export function promoTemplatesFor(
  prospect: Prospect,
  ctx: TemplateContext = {},
): EmailTemplate[] {
  const status = ctx.openingStatus ?? VENUE.openingStatus;
  const lane = LANE_META[prospect.lane];
  const cls = lane.occasionClass;
  /* Zero where the row has no modelled door count, which fails every
     size gate below rather than passing one on a guess. */
  const high = groupProfile(prospect)?.high ?? 0;
  const drafts: EmailTemplate[] = [];

  // ---------------------------------------------------------------
  // 1. The one campaign with a published number and a printed date.
  // ---------------------------------------------------------------

  /**
   * THE ONLY THING ON THE SHELF A READER CAN PRICE WITHOUT PHONING
   * ANYBODY, and it has thirteen days left on it. Everything else in
   * this market is either gated or dated, so this is the single message
   * in the set where the reader can check the figure themselves in
   * fifteen seconds. That is worth leading with even though it is not
   * the largest ticket in the file.
   */
  if (cls === "calendar-locked" && fits(prospect, "sc-summer-tuneup-47")) {
    const price = publishedPrice("sc-summer-tuneup-47");
    drafts.push({
      id: "promo-grad-pack-published",
      label: "The published campaign price, before it lapses",
      blurb: "The one offer with a number and a date on it. $47.",
      why: "An account whose season is already fixed does not have to ask anybody what this costs, which removes the slowest step in the whole conversation.",
      packageId: "sc-summer-tuneup-47",
      offerId: "first-fifty",
      subject: `${windowShort(prospect)}: the $${price?.toFixed(0)} tune-up, published, until 31 August`,
      body: `Most of what a home services company quotes is a number somebody had to ask for. This one is on the page: ${inclusionClause("sc-summer-tuneup-47", 2)}. ${priceSentence("sc-summer-tuneup-47")}

We are ${distance(prospect)} from you. ${openingSentence(status)}

${
        status === "announced"
          ? "So the useful thing is not the coupon, it is the arrangement underneath it. Agree the terms this month and the figure holds for your properties after the campaign page comes down, which is the part a printed expiry cannot take away from you."
          : "The campaign has been renewed, so the figures carry new dates and we can put yours in writing this week."
      }

Is the ${role(prospect)} the right person for that, or should I be writing to someone else.

${SIGN_OFF}`,
      guardrail: `The $${price?.toFixed(2)} is a published figure with a printed expiry of 31 August 2026. Quote it exactly, quote the date with it, and stop quoting it on 1 September.`,
    });
  }

  // ---------------------------------------------------------------
  // 2. The largest ticket there is, and the only money still open.
  // ---------------------------------------------------------------

  /**
   * A replacement incentive is worth writing about to somebody holding
   * enough doors that one hot week produces several of them. It is gated
   * here on modelled size rather than offered to every row on the board,
   * because a landlord with six units does not have a replacement
   * programme, they have a bad Tuesday.
   *
   * The multifamily incentive in this draft is the contested one. The
   * California Energy Commission says the intake is open at up to 14,000
   * dollars a unit; TECH says it is paused for new Stage 1 applications.
   * The body is written to survive both readings, and the guardrail says
   * so in the imperative.
   */
  if (cls === "calendar-locked" && high >= 150 && fits(prospect, "adeedo-3500-system")) {
    drafts.push({
      id: "promo-lock-in-after-close",
      label: "Replacement money, for a portfolio",
      blurb: "For 150 doors and up. The biggest published figure in the market.",
      why: `${prospect.name} is modelled at ${groupProfile(prospect)?.low ?? 0} to ${groupProfile(prospect)?.high ?? 0} doors, which is enough equipment that a July week produces replacements rather than repairs.`,
      packageId: "adeedo-3500-system",
      offerId: "first-fifty",
      subject: `Equipment replacement across ${prospect.name}, and what is left of the incentives`,
      body: `For a portfolio your size the published figure that matters is the system one: ${inclusionClause("adeedo-3500-system", 2)}. ${priceSentence("adeedo-3500-system")} The fine print prints 31 August 2026, which is thirteen days from today.

Two things about incentives, because most of what you will be sent this year is out of date. The federal credit everybody quoted on heat pumps does not apply to anything placed in service after 31 December 2025, and California's single-family rebates were fully reserved for Southern California on 7 January. What has not run out is the multifamily side, at up to fourteen thousand dollars a unit, and even that carries a caveat I would rather give you now: the Energy Commission says the intake is open and the programme administrator says new applications are paused.

${openingSentence(status)}

Send me the addresses and rough equipment ages and I will come back with which buildings are worth doing first and which incentive each one can actually reach.

${SIGN_OFF}`,
      guardrail:
        "Re-check the multifamily intake status on the day you send this. Two primary sources disagree, so the letter says both. Never turn it into a promise of fourteen thousand dollars.",
    });
  }

  // ---------------------------------------------------------------
  // 3. What is given away, and what that is worth.
  // ---------------------------------------------------------------

  /**
   * The free inspection is table stakes: four unaffiliated brands give
   * the same one away, so it moves nothing on its own. What it is still
   * good for is a community room, where a technician showing thirty
   * people what a failing water heater actually looks like is worth
   * more than any coupon and costs an afternoon.
   *
   * The only figure any brand publishes on this side is a cumulative one
   * for a charity partnership. No donation rate, no per-install amount
   * and no sponsorship value is published anywhere, so this draft names
   * none.
   */
  if (fits(prospect, "free-inspection-tier") || fits(prospect, "community-programmes-unpriced")) {
    const offer = OFFER_BY_ID["spirit-night-first-quarter"];
    drafts.push({
      id: "promo-fundraiser-published-terms",
      label: "A safety session and a sponsorship",
      blurb: "Two things that cost the reader nothing and are not coupons.",
      why: `${offer?.name ?? "The community programme"} can be offered today without anybody's approval, because nothing in it is a price.`,
      packageId: "free-inspection-tier",
      offerId: "spirit-night-first-quarter",
      subject: `Something useful for ${prospect.name}, and it is not a coupon`,
      body: `Two things I can offer today. The first is a safety session: a technician walks a group through what a failing water heater, a slab leak or an overloaded panel actually looks like in a house, which takes half an hour and is genuinely useful. The second is sponsorship of one thing you already have coming up, where we cover a real cost you would otherwise carry.

What I am deliberately not leading with is the free inspection. Four brands in these counties give the same one away, so it is the price of being on the page rather than a reason to choose anybody: ${inclusionClause("free-inspection-tier", 2)}.

We are ${distance(prospect)} from you. ${openingSentence(status)}

Tell me what you have in the next term and I will tell you plainly whether we can help with it.

${SIGN_OFF}`,
      guardrail:
        "Never offer money for reviews, referrals or member lists. It breaks Google's and Yelp's policies and it is the fastest way to lose the local pack. Never quote a donation rate: no brand publishes one.",
    });
  }

  // ---------------------------------------------------------------
  // 4. The gap. Fourteen brands, fourteen unpriced plans.
  // ---------------------------------------------------------------

  /**
   * The strongest claim available to this division, and it is a claim
   * about everybody else's page rather than about our own. Every rival
   * read for this console names a maintenance club and hides the price.
   * Two brands in the set publish theirs, at 19.95 a month and at 15 a
   * month, and both are ours. A message that simply states that, with
   * the numbers in it, cannot be answered by printing a smaller coupon.
   */
  if (cls === "discretionary" && high > 60 && fits(prospect, "rival-nexgen-protection")) {
    drafts.push({
      id: "promo-midweek-daytime-lock",
      label: "The membership nobody else will price",
      blurb: "The one claim in this market that cannot be matched with a coupon.",
      why: "Not one competing brand read for this console publishes what its maintenance plan costs. Two of ours do. That is a comparison the reader can check in ninety seconds.",
      packageId: "rival-nexgen-protection",
      offerId: "midweek-daytime-lock",
      subject: `${windowShort(prospect)} for ${prospect.name}: a plan with the price on it`,
      body: `${prospect.whyTheyFit}

Here is the thing worth ten minutes. Every home services company in these counties runs a maintenance club, and almost none of them will tell you what it costs without a phone call: ${inclusionClause("rival-nexgen-protection", 2)}. Two brands in this market publish the figure, at 19.95 a month and at 15 a month, and both of them are ours.

For a group of households, or a set of staff, that is the difference between a benefit somebody can actually compare and one they have to ring up to understand. We can put the number, the tune-ups it covers, the reduced diagnostic fee and the response window on one page with your name on it.

${openingSentence(status)}

Fifteen minutes this week and I will send that page for you to pull apart.

${SIGN_OFF}`,
      guardrail:
        "Quote 19.95 and 15 exactly, and never quote a price for a plan that does not publish one, ours included. If somebody asks what CHAMP-Rewards costs, the honest answer is that it is not published and you are asking for it to be.",
    });
  }

  // ---------------------------------------------------------------
  // 5. The owner-operator, whose whole approval chain is one person.
  // ---------------------------------------------------------------

  /**
   * A tyre shop, a dental practice, a small franchise. Eight to sixty
   * staff, no HR department, no committee and no budget line for
   * anything like this. The owner is the entire approval chain, which
   * means the message can be shorter and the ask can be smaller than
   * anything else in this file.
   *
   * It is also the only draft whose only number is a floor rather than a
   * quote: the lowest published monthly plan in these five counties, at
   * fifteen dollars. That is the honest shape of this conversation. The
   * owner wants to know the smallest the thing can be, and can work that
   * out standing behind a counter.
   */
  const smallTeam = cls === "discretionary" && high <= 60;
  if (smallTeam || drafts.length === 0) {
    drafts.push({
      id: "promo-staff-night-owner-operator",
      label: "A staff benefit, owner to owner",
      blurb: "For a small team whose owner is the whole approval chain.",
      why: `${prospect.name} is modelled at ${groupProfile(prospect)?.low ?? 0} to ${groupProfile(prospect)?.high ?? 0} households. That is one decision and one conversation, so the message should be short enough to answer from a phone behind the counter.`,
      packageId: "rival-mr-rooter-advantage",
      offerId: "midweek-daytime-lock",
      subject: `A home services benefit for the ${prospect.name} team`,
      body: `${prospect.whyTheyFit}

The smallest version of this costs you nothing and takes no administration. Your people get a named line and a standing discount, we handle everything after it, and the entry point is a maintenance plan published at $${LOWEST_PUBLISHED_PLAN_PRICE} a month, which is the lowest published figure anywhere in these five counties.

No portal, no enrolment on your side, no invoicing. One paragraph in whatever you already send your staff.

We are ${distance(prospect)} from you. ${openingSentence(status)}

One line back and I will send the paragraph and the flyer so you can see exactly what they would get before you decide.

${SIGN_OFF}`,
      guardrail: `The $${LOWEST_PUBLISHED_PLAN_PRICE} is a published monthly membership price, not a price for a job. Saying "about fifteen dollars" for a repair turns a plan into a quote and the difference lands on the branch.`,
    });
  }

  // ---------------------------------------------------------------
  // 6. The commitment a partner actually decides on, and the walk.
  // ---------------------------------------------------------------

  /**
   * The only guarantees in this market with a dollar mechanic attached
   * to a named failure belong to two franchises, at five dollars a
   * minute up to three hundred. Neither attaches that mechanic to a
   * published price. A response window in writing, beside a number that
   * is on the page, is unoccupied ground in all five counties.
   *
   * The offer attached is the site walk, because the buyer this branch
   * reaches decides with their feet: half an hour on a live install
   * tells them more about a crew than any page will.
   */
  if (fits(prospect, "rival-authority-club")) {
    drafts.push({
      id: "promo-meeting-space-hard-hat",
      label: "A response window, and a walk of a live install",
      blurb: "For a partner who decides on service commitments, not on price.",
      why: "This buyer is choosing an operator rather than an offer, and the two things that decide it are what we commit to in writing and what a crew looks like on somebody's floor.",
      packageId: "rival-authority-club",
      offerId: "founding-partner-tour",
      subject: `A written response window for ${prospect.name}`,
      body: `The claims in this market are mostly adjectives. The two that are not belong to a pair of franchises and read as five dollars for every minute they are late, up to three hundred: ${inclusionClause("rival-authority-club", 2)}. ${priceSentence("rival-authority-club")}

What I would rather agree with you is the boring version: a direct number that skips the call centre, a written response window for an out-of-hours failure, and a not-to-exceed figure under which we fix it and send you the photographs rather than ringing you for approval.

We are ${distance(prospect)} from you. ${openingSentence(status)}

Before any of that is signed, the useful thing is half an hour on a live install with the crew that would do your work. Tell me a morning and I will arrange it.

${SIGN_OFF}`,
      guardrail:
        "Do not put a response time in writing that the division has not agreed to. If the number is not signed off, send the draft without it and ask what theirs is instead.",
    });
  }

  return drafts;
}

// =================================================================
// THE TERMS, IN WRITING
// =================================================================

export interface ReserveContext extends TemplateContext {
  /** ISO date the arrangement starts from. Empty until somebody types one. */
  date?: string;
  /** Doors actually discussed. Never a hoped-for number. */
  guests?: number;
  /** The shelf row the terms are anchored against, where one is chosen. */
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
 * that in California prints the eleventh, and an agreement that names
 * the wrong day is worse than one that names no day at all.
 */
export function longDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTH_NAMES[m - 1]} ${y}`;
}

/**
 * THE DIVISION'S SIDE OF THE ARRANGEMENT, WHICH IS THE ONLY ASK THAT
 * WORKS BEFORE ANYTHING HAS BEEN SIGNED.
 *
 * The proposal page already sends this request from the customer's side.
 * This is the same agreement written back to them, and writing it down
 * is the entire point: terms that exist only in a phone call are terms
 * both sides remember differently a month later.
 *
 * FOUR THINGS HAVE TO BE IN IT AND ALL FOUR ARE HERE. The date it runs
 * from. The number of doors. What that door count consumes, at this
 * console's own modelled ratio of one crew slot per twenty doors, said
 * to be modelled rather than published. And the fact that it costs
 * nothing and commits nobody until an install is actually scheduled.
 *
 * WHAT IS DELIBERATELY NOT IN IT is any suggestion that a published
 * campaign price will still be printed next month. The live campaign
 * expires on 31 August 2026 and no successor is published, so the letter
 * says which figure is dated and which one is an agreement, because the
 * concession is what makes the ask credible rather than what weakens it.
 */
export function reservePartyTemplate(
  prospect: Prospect,
  ctx: ReserveContext = {},
): EmailTemplate {
  const status = ctx.openingStatus ?? VENUE.openingStatus;
  const guests = ctx.guests ?? groupProfile(prospect)?.mid ?? 0;
  const lanes = crewSlotsForDoors(guests);
  const floor = VENUE.crewSlotsModelledFloor;
  const pack = ctx.packageId ? PACKAGE_BY_ID[ctx.packageId] : undefined;
  const dated = ctx.date ? longDate(ctx.date) : "";

  const overFloor = lanes > floor;

  const dateLine = dated
    ? `The date this runs from is ${dated}.`
    : "The start date is the one thing still open. Give me a day and I will put it in writing the same afternoon.";

  const packLine = pack
    ? `\n\nThe offer we discussed is ${pack.name}. ${priceSentence(pack.id)}`
    : "";

  const sizeLine = overFloor
    ? `At ${guests} doors you are past what a modelled Brea crew capacity of ${floor} slots a day covers in a single season at our own ratio of one crew slot per ${DOORS_PER_CREW_SLOT} doors. That means a phased programme rather than one push, and I would rather say that now than in July.`
    : `At ${guests} doors this works out at ${lanes} crew slots across the season, at our own modelled ratio of one slot per ${DOORS_PER_CREW_SLOT} doors against a modelled Brea capacity of ${floor} slots a day. Both figures are ours and neither is published by anybody, so treat this as a plan rather than as a promise.`;

  return {
    id: "reserve-party-hold",
    label: "The terms, in writing",
    blurb: "A price that outlasts the campaign it came from, at no cost.",
    why: "Terms agreed on a phone call are terms both people remember differently later. This is the same agreement, written down on the day it was made.",
    packageId: ctx.packageId,
    offerId: "first-fifty",
    subject: dated
      ? `Terms for ${prospect.name} from ${dated}, at no cost`
      : `Terms for ${prospect.name}, at no cost`,
    body: `This is the arrangement in writing, so we are both looking at the same thing.

${dateLine} ${sizeLine}${packLine}

It costs nothing. No deposit and no commitment to any work, because ${
      status === "announced"
        ? "the campaign these figures come from carries a printed expiry of 31 August 2026 and I would rather agree terms that outlast it than ask you to rush a decision at a coupon"
        : "the new campaign period is published and the terms below are the ones that apply to it"
    }. When an installation is actually scheduled, our working terms are ${STANDARD_TERMS.bookingNoticeDays} days notice and a ${STANDARD_TERMS.depositPercent} per cent deposit, and those two figures are ours rather than anything published, which is why they are stated here rather than assumed.

What this buys meanwhile is position: a named route in, a response window, and a price that does not move when the offers page does.

If the date or the number is wrong, say so and I will change it today.

${SIGN_OFF}`,
    guardrail:
      "The notice period and the deposit are this console's own working terms, not published ones. Say so if asked. Never write a campaign price into this letter without the expiry printed beside it.",
  };
}

// =================================================================
// THE MEMBERSHIP PROGRAMME
// =================================================================

/**
 * WHAT IS ACTUALLY PUBLISHED ABOUT MEMBERSHIP IN THIS MARKET, WHICH IS
 * ALMOST NOTHING AND IS THE WHOLE REASON THIS SECTION IS WRITTEN
 * CAREFULLY.
 *
 * Published, and checkable in a minute: ASI Rewards at 19.95 a month,
 * with a 9.95 a month furnace-only tier, a 19 dollar member diagnostic,
 * member drain clearing at 27 dollars, and its own terms page. Timo's
 * Advantage Plan at 15 a month or 189 a year, monthly renewing
 * automatically and the annual one not renewing at all.
 *
 * NOT published, anywhere: what CHAMP-Rewards costs, what any of the
 * fourteen competing plans cost, or what any of them charge to join.
 * Service Hero itemises the benefits of two tiers and stops one line
 * short of the number.
 *
 * So every draft below quotes the two published figures and refuses to
 * invent a third. Where a reader asks what our own unpriced plan costs,
 * the honest answer is that it is not published, and that answer is in
 * the guardrail rather than in a footnote.
 */

export type PlanIntent =
  /** Open the conversation. What is published, what is not, and the ask. */
  | "plan-enquiry"
  /** Put a household or a member group into a plan that is open. */
  | "plan-join"
  /** Enrol a portfolio that already exists under a name it already has. */
  | "plan-team"
  /** Build a programme around this organisation rather than join one. */
  | "plan-new";

/**
 * What the membership surface hands the compose window.
 *
 * Deliberately plain strings and numbers rather than a programme record
 * type. The membership pages own their own domain model and this file
 * has no business importing it: a draft needs a name, a cadence and a
 * count, and coupling the draft writer to somebody else's interface
 * means every change over there is a change in here.
 */
export interface PlanContext {
  /** Display name, as the membership board shows it. */
  planName: string;
  /** When the maintenance visit falls, in words, e.g. "Spring". */
  night?: string;
  /** Weeks the enrolment window runs, where the board has set one. */
  weeks?: number;
  /** Places still open on a capped programme. */
  spotsOpen?: number;
  /** A named portfolio, on an enrolment message. */
  teamName?: string;
  /** Doors in that portfolio. */
  teamSize?: number;
  /** In-app route back to the programme, for the desk rather than the buyer. */
  planPath?: string;
}

/**
 * The guardrail every membership draft carries, written once.
 *
 * It is the same warning four times because it is the same mistake four
 * times: a programme named on this board is this console's own construct
 * for planning purposes, and the only membership prices anybody
 * publishes in this market are 19.95 a month at ASI and 15 a month or
 * 189 a year at Timo's. Writing a number for anything else is inventing
 * a price the division would then have to honour.
 */
const PLAN_GUARDRAIL =
  "The only published membership prices in this market are 19.95 a month at ASI and 15 a month or 189 a year at Timo's. Every other plan in these five counties, including CHAMP-Rewards, publishes no price at all. Quote the two that exist, name the ones that do not, and never invent a third.";

/** The published facts, in one clause, so four drafts cannot drift apart. */
const PLAN_PUBLISHED =
  "Two maintenance plans in these five counties publish what they cost: 19.95 a month, and 15 a month or 189 a year. Both are ours. Fourteen competing brands name a club and publish no figure at all, and so does one of ours, which I would rather say first than let you find out.";

function planWhen(ctx: PlanContext): string {
  const parts: string[] = [];
  if (ctx.night) parts.push(`${ctx.night} visits`);
  if (ctx.weeks) parts.push(`a ${ctx.weeks} week enrolment window`);
  return parts.length > 0 ? parts.join(", ") : "twice a year";
}

/**
 * The four membership drafts, one per intent.
 *
 * They are separate bodies rather than one body with a variable in it
 * for the same reason the campaign drafts are. An organisation asking
 * what a plan is and an organisation handing over a list of forty
 * addresses are at opposite ends of the same conversation, and a message
 * that treats them as the same message reads as assembled because it
 * would have been.
 */
export function planTemplatesFor(
  prospect: Prospect,
  intent: PlanIntent,
  ctx: PlanContext,
): EmailTemplate[] {
  const when = planWhen(ctx);
  const team = ctx.teamName ?? `${prospect.name}`;
  const drafts: EmailTemplate[] = [];

  if (intent === "plan-enquiry") {
    drafts.push({
      id: "plan-enquiry",
      label: "What a plan would actually be",
      blurb: "Answers the question with what is published and what is not.",
      why: "The first membership message has to separate what is published from what is not, because in this market that gap is the whole argument and hiding it would put us on the wrong side of it.",
      subject: `${ctx.planName}: what is published and what is not`,
      body: `You asked what a maintenance plan would actually be worth, so here is the honest version.

${PLAN_PUBLISHED}

What that means for ${prospect.name} is that I can quote you a real figure rather than book a call to reveal one. ${ctx.planName} is ${when} on our own board. The published inclusions on the priced plans are two tune-ups a year, a plumbing inspection on request, a diagnostic fee reduced to nineteen dollars and a repair discount, and a plan whose fees come back off a replacement if you ever need one.

The upside of asking now is that the summer campaign expires on 31 August and a plan does not. Tell me roughly how many properties you would put on it and I will come back with what it covers and what it does not.

${SIGN_OFF}`,
      guardrail: PLAN_GUARDRAIL,
    });
  }

  if (intent === "plan-join") {
    drafts.push({
      id: "plan-join",
      label: "Enrol into a programme with room in it",
      blurb: "For an organisation putting households onto a plan that is open.",
      why: `${ctx.planName} is marked as open on the board, which is the only reason this message can ask for enrolment rather than for interest.`,
      subject: `Places on ${ctx.planName} for ${prospect.name}`,
      body: `${ctx.planName} runs ${when}${
        ctx.spotsOpen ? `, and it has ${ctx.spotsOpen} place${ctx.spotsOpen === 1 ? "" : "s"} still open` : ", and it is open for enrolment"
      }.

${PLAN_PUBLISHED}

So this is an enrolment rather than a quote. Send me the addresses and I will confirm each one at the published monthly figure, with nothing to pay until the first visit is scheduled. Where an address turns out to need work before a plan makes sense, I will say so rather than sign it up and find out on the day.

How many properties, and who holds the keys.

${SIGN_OFF}`,
      guardrail: PLAN_GUARDRAIL,
    });
  }

  if (intent === "plan-team") {
    drafts.push({
      id: "plan-team",
      label: "Enrol a named portfolio",
      blurb: "For a portfolio that already exists and already has a name.",
      why: "A portfolio with a name and a door count is further down the conversation than anything else in this file, so the message is shorter and asks for one thing.",
      subject: `Enrolling ${team} on ${ctx.planName}`,
      body: `Putting ${team}${
        ctx.teamSize ? `, ${ctx.teamSize} doors,` : ""
      } onto ${ctx.planName}, ${when}.

${PLAN_PUBLISHED}

Nothing is charged until the first visit is scheduled, the monthly figure is the published one rather than a negotiated one, and the annual option does not auto-renew, which is the brand's own published term rather than a courtesy.

If a name or a number below is wrong, tell me today and I will change it rather than carry it forward.

${SIGN_OFF}`,
      guardrail: PLAN_GUARDRAIL,
    });
  }

  if (intent === "plan-new") {
    drafts.push({
      id: "plan-new",
      label: "Build a programme around them",
      blurb: "For an organisation large enough to be the programme itself.",
      why: `${prospect.name} is modelled at ${groupProfile(prospect)?.low ?? 0} to ${groupProfile(prospect)?.high ?? 0} doors, which is enough to be the programme rather than to join one.`,
      subject: `A maintenance programme built around ${prospect.name}`,
      body: `${prospect.whyTheyFit}

${PLAN_PUBLISHED}

An organisation your size is closer to being the programme than to filling places on somebody else's. ${ctx.planName} is what that would look like on our board: ${when}, your properties, your name on it, and the figure on the page rather than behind a phone call.

What I can put in writing now is the cadence, the inclusions and the monthly number. What I will not put in writing is a discount off a plan nobody else in this market will even price, because a number invented to win a meeting is a number the branch has to live with afterwards.

Worth fifteen minutes with the ${role(prospect)}?

${SIGN_OFF}`,
      guardrail: PLAN_GUARDRAIL,
    });
  }

  return drafts;
}

// =================================================================
// THE ORGANISATION'S OWN PROPOSAL LINK
// =================================================================

/**
 * The line that carries the proposal link, written once.
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
  return `P.S. Everything published about this offer, and everything that is not, is on your own page, with the date each figure was read: ${url}`;
}

export function withQuoteLink(body: string, url?: string | null): string {
  if (!url) return body;
  return `${body}\n\n${quoteLinkPostscript(url)}`;
}
