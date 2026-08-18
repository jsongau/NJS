import type {
  LossCause,
  ObjectionCause,
  Rival,
  RivalPromotion,
} from "@/domain/rivals";

/**
 * THE COMPETITIVE REGISTER, AND THE FINDING THAT DECIDED ITS SHAPE.
 *
 * ── EVERY PAGE BELOW WAS OPENED AND READ, NOT RECALLED ────────────
 * Six brands, opened on 18 August 2026, one at a time, out of the
 * thirteen Southern California rivals profiled across Los Angeles,
 * Orange, Riverside, San Bernardino and San Diego counties, plus Sierra
 * Air, which was opened, read and then ruled out as not trading in this
 * territory at all. A fourteenth row that says "checked and not a
 * competitor" is worth more than a fourteenth row that says nothing.
 *
 * Every claim in this file carries the URL it came off and the day it
 * was read, and the ones that could not be verified
 * are named at the foot of the file rather than quietly dropped. A
 * register about other people's businesses that cannot be checked is
 * worse than no register, because the reader has no way to tell the
 * sound rows from the invented ones and therefore has to discount all
 * of them.
 *
 * ── THE COUPONS ARE PUBLISHED. THE PLAN PRICE NEVER IS ────────────
 * Unusually for a competitive file, the prices here are real and
 * printed. Drain clearing is a public price war entirely under a
 * hundred dollars: 57 with a promo code, 77 with an access limit
 * printed beside it, and 99 at Mike Diamond and at all three ARS
 * storefronts, which has hardened into the market's default. Repair
 * discounts converge on 50 off almost everywhere. Replacement splits
 * between a flat 500 at the franchises and an up-to ceiling of 1,500
 * to 2,000 at the independents and the national network. Tune-ups run
 * from 59 to 89.95.
 *
 * And then the silence. Not one of the fourteen brands opened. The
 * thirteen rivals and Sierra Air alike, publishes what its membership
 * costs. The X Protection Plan, three
 * Protection Plans, HERO CLUB and HERO CLUB Plus, the Advantage Plan,
 * two Club Memberships, maintenance agreements, Sierra Rewards: every
 * one names the plan and hides the number. A homeowner can compare six
 * drain prices in ninety seconds and cannot compare a single
 * maintenance plan. `data/venue.ts` records the same silence on our
 * own side, and `data/packages.ts` records which of our offers carry a
 * printed price and which do not.
 *
 * ── SO THE REGISTER SAYS WHAT IT CANNOT SEE ───────────────────────
 * Each row carries `notPublished` and `routesTo`. Those two fields do
 * the work a plan price column would have done and they do it
 * truthfully: a rep who knows that every rival makes a customer ring
 * to learn what its own club costs knows something useful about how to
 * sell against them, and a rep holding an invented figure knows
 * something false.
 *
 * ── NOTHING HERE IS ABOUT ANYBODY'S CUSTOMERS OR STAFF ────────────
 * Addresses, licence numbers, published coupon prices, published
 * guarantees, published review counts and a live 404. Every one of
 * them is on a marketing page. There is nothing about a rival's call
 * volume, close rate, people or operations in this file, and the types
 * in `domain/rivals.ts` give it nowhere to go.
 *
 * ── WHY THE CONSTANT NAMES BELOW LOOK NOTHING LIKE THE BRANDS ─────
 * The row ids and the URL handles are stable keys carried over from an
 * earlier build of this console and are deliberately left alone, so
 * that concurrent work on the files that read them cannot collide. A
 * key is not a label. Every label a reader sees is on the row itself.
 */

const READ = "2026-08-18";

const LS_FULLERTON = "https://www.rooterhero.com/";
const LS_ORANGE = "https://www.mrrooter.com/orange-county/";
/* Sierra Air publishes everything worth reading on one page, so both
   handles point at it rather than at a second page nobody opened. */
const R1_LOCATIONS =
  "https://sierraair.com/areas-we-serve/plumbing-and-hvac-services-california/";
const R1_PARTY =
  "https://sierraair.com/areas-we-serve/plumbing-and-hvac-services-california/";
const NEXGEN_HOME = "https://www.nexgenairandplumbing.com/";
const DB_ACQUISITION = "https://www.nexgenairandplumbing.com/about-us/";
const BEN_FRANKLIN_S_OC =
  "https://www.benjaminfranklinplumbing.com/areas-we-service/southern-orange-county-ca/";
const LUCK_REBRAND = "https://www.ars.com/san-diego/coupons";
const MAGNOLIA_HOME = "https://maghvac.com/";
const LUCK_REBRAND_WIRE = "https://www.ars.com/la-east/coupons";

export const RIVALS: Rival[] = [
  {
    id: "rooter-hero-plumbing",
    name: "Rooter Hero Plumbing",
    standing: "trade-area",
    address:
      "No single street address published. Regionally owned locations across the Inland Empire, Orange County, Riverside, San Diego, the San Fernando Valley, the San Gabriel Valley, the South Bay and Ventura. California licence 1156356.",
    addressSource:
      "The operator's own site. Nothing was taken from a directory to fill the gap.",
    whyHere:
      "The loudest published price in the drain aisle after the floor itself, and the row with the most checkable detail on it. Seventy seven dollars with the access condition printed beside it, fifty off a repair, and a free camera inspection given away as though it were a difference rather than the thing four brands here already give away.",
    facts: [
      {
        label: "Drain clearing",
        value: "$77 Drain Cleaning Special, up to 75 feet, proper access required",
        sourceUrl: LS_FULLERTON,
        readOn: READ,
        provenance: "public",
        caveat:
          "The access and length conditions are printed on the page. What falls outside them is not, so the real range of a seventy seven dollar call cannot be read off this.",
      },
      {
        label: "Repair discount",
        value: "$50 OFF a plumbing repair, on repairs over $500",
        sourceUrl: LS_FULLERTON,
        readOn: READ,
        provenance: "public",
        caveat:
          "Fifty off is where this whole market converges. ARS, One Hour and Service Hero all publish the same figure against different minimums.",
      },
      {
        label: "Free inspection",
        value: "FREE Camera Inspection with a standard drain cleaning",
        sourceUrl: LS_FULLERTON,
        readOn: READ,
        provenance: "public",
        caveat:
          "Four brands in this market give a camera or sewer inspection away. That makes it table stakes rather than a differentiator, and a campaign built on it is buying nothing.",
      },
      {
        label: "Out of hours pricing",
        value:
          "Available 24/7 with never any after hours, weekend or holiday charges",
        sourceUrl: LS_FULLERTON,
        readOn: READ,
        provenance: "public",
        caveat:
          "Roto-Rooter and Mr. Rooter publish the same promise in almost the same words. It is commoditised on the plumbing side.",
      },
      {
        label: "Published review base",
        value: "4.8 out of 5 from more than 8,000 reviews",
        sourceUrl: LS_FULLERTON,
        readOn: READ,
        provenance: "public",
        caveat:
          "The platform is not itemised, so this cannot be compared with a count that names one.",
      },
      {
        label: "Standing discounts",
        value:
          "10% off for seniors and military, and $100 off commercial work over $1,000",
        sourceUrl: LS_FULLERTON,
        readOn: READ,
        provenance: "public",
      },
    ],
    notPublished: [
      "Any membership or maintenance plan price, and no plan is named at all",
      "The name of a financing partner",
      "An APR or a term of any kind",
    ],
    routesTo:
      "A Schedule Online Today control, a contact form and a freephone number. A person quotes anything that is not on the coupon.",
    sourceUrl: LS_FULLERTON,
    readOn: READ,
  },
  {
    id: "mr-rooter-orange-county",
    name: "Mr. Rooter Plumbing of Orange County",
    standing: "trade-area",
    address: "430 N State College Blvd, Anaheim, CA",
    addressSource: "The franchise's own location page.",
    whyHere:
      "The nearest thing in this register to a well kept storefront, and the only brand whose coupons carry a date that has not already passed. It also names Brea in its own service list, which puts it directly across the road from this division's home market.",
    facts: [
      {
        label: "Coupon",
        value: "$25 Off Any Plumbing Services, expires 09/30/2026",
        sourceUrl: LS_ORANGE,
        readOn: READ,
        provenance: "public",
        caveat:
          "Twenty five off a ticket is the smallest plumbing discount in this register. The date on it is the point, not the figure.",
      },
      {
        label: "Coupon",
        value:
          "10% off for seniors, teachers, first responders and military, capped at $1,000 off, expires 09/30/2026",
        sourceUrl: LS_ORANGE,
        readOn: READ,
        provenance: "public",
      },
      {
        label: "Free inspection",
        value: "Free Camera Inspection With Service, expires 09/30/2026",
        sourceUrl: LS_ORANGE,
        readOn: READ,
        provenance: "public",
        caveat:
          "The same giveaway the brand above publishes with no date on it. Two brands, one offer, and only one of them treats it as a campaign.",
      },
      {
        label: "Pricing promise",
        value:
          "Upfront flat rate pricing, with no overtime fees or hidden charges for nights or weekends, backed by the Neighborly Done Right Promise",
        sourceUrl: LS_ORANGE,
        readOn: READ,
        provenance: "public",
      },
      {
        label: "Published review base",
        value: "708 reviews at 4.9 out of 5 on the location page",
        sourceUrl: LS_ORANGE,
        readOn: READ,
        provenance: "public",
        caveat:
          "An honest local count. Two brands in this market display national aggregates of 134,039 and 116,815 on local pages, which is a different kind of number wearing the same clothes.",
      },
      {
        label: "Service area claimed",
        value:
          "More than 40 Orange County cities, Brea and Yorba Linda among them",
        sourceUrl: LS_ORANGE,
        readOn: READ,
        provenance: "public",
        caveat:
          "A claimed city list is a marketing statement about where a van will drive, not evidence of coverage or of staffing.",
      },
    ],
    notPublished: [
      "A price for the Advantage Plan, which is named on the page",
      "The name of the financing partner behind the financing offer",
      "An APR or a term",
    ],
    routesTo:
      "A Book Online scheduler and a 24/7 telephone number. The plan price is behind the call.",
    sourceUrl: LS_ORANGE,
    readOn: READ,
  },
  {
    id: "sierra-air-boundary-row",
    name: "Sierra Air Inc.",
    standing: "category-only",
    address: "520 S Rock Blvd Suite 100, Reno, Nevada",
    addressSource:
      "The operator's own service area page, read in full rather than searched.",
    whyHere:
      "Because getting the boundary of a competitive set right is the discipline itself. Sierra Air comes up in searches for California HVAC operators, was opened and read like the rest, and turns out to work Lake Tahoe, Truckee and Portola out of Reno. It belongs in the category and it does not compete for a single call in these five counties, and saying so with the service area page open is worth more than a row that quietly includes it.",
    facts: [
      {
        label: "Where it actually is",
        value: "Headquartered at 520 S Rock Blvd Suite 100, Reno, Nevada",
        sourceUrl: R1_LOCATIONS,
        readOn: READ,
        provenance: "public",
      },
      {
        label: "California service area",
        value: "Lake Tahoe, Truckee and Portola. Northern California only",
        sourceUrl: R1_LOCATIONS,
        readOn: READ,
        provenance: "public",
        caveat:
          "This is the whole reason the row is here. Read the service area, do not assume it from the state name.",
      },
      {
        label: "Nothing in these five counties",
        value:
          "No Los Angeles, Orange, Riverside, San Bernardino or San Diego location on the page",
        sourceUrl: R1_LOCATIONS,
        readOn: READ,
        provenance: "public",
      },
      {
        label: "The pattern holds anyway",
        value:
          "Sierra Rewards membership named with no price, a 100% satisfaction guarantee, a low price guarantee on comparable systems, and 4.8 stars from 4,249 Google reviews",
        sourceUrl: R1_PARTY,
        readOn: READ,
        provenance: "public",
        caveat:
          "Four hundred miles outside this market and the plan price is still missing. That is the finding generalising past the territory.",
      },
    ],
    notPublished: [
      "A price for Sierra Rewards",
      "Any offer aimed at these five counties, because it does not work in them",
      "Anything at all about Southern California",
    ],
    routesTo:
      "A Reno telephone number and a contact form for a service area this division does not sell into.",
    sourceUrl: R1_LOCATIONS,
    readOn: READ,
  },
  {
    id: "nexgen-air-conditioning-heating",
    name: "NEXGEN Air and Plumbing",
    standing: "same-parent",
    address:
      "Anaheim office in Orange County, with further offices in Fontana and Newbury Park. CSLB 1011173.",
    addressSource: "The operator's own About page.",
    whyHere:
      "The brand a homeowner quotes at you, and the one row in this register that is not the independent rival it looks like. NEXGEN publishes the fifty seven dollar drain that sets the floor of this market, and its own About page describes the company as a Proud Partner of Rooter Hero, the brand at the top of this register publishing seventy seven. The two cheapest numbers in the drain aisle come from partners, which is worth knowing before anybody is asked to match one.",
    facts: [
      {
        label: "The affiliation, in their own words",
        value:
          "The About page describes NEXGEN as a Proud Partner of Rooter Hero",
        sourceUrl: DB_ACQUISITION,
        readOn: READ,
        provenance: "public",
      },
      {
        label: "Scale as the page states it",
        value:
          "About 10 locations across Southern California, started 15 years ago, serving Los Angeles, Orange, San Bernardino, Riverside and Ventura counties",
        sourceUrl: DB_ACQUISITION,
        readOn: READ,
        provenance: "public",
        caveat:
          "The page gives a round number and does not list the ten addresses, so this describes a claim rather than a footprint.",
      },
      {
        label: "Published offers, every one with a promo code",
        value:
          "$57 drain clearing (Drain57), $75 off an AC repair diagnostic (AC75), up to $1,500 off a full system replacement (AC1500), $250 off whole home air purification (Air250), a free electrical safety inspection (COMPELEC) and a free water quality test (Watertest)",
        sourceUrl: NEXGEN_HOME,
        readOn: READ,
        provenance: "public",
        caveat:
          "A promo code on every single offer is the signature of a coupon led paid search programme. It is the only brand in this register running one, and the fifty seven is the floor of the whole market.",
      },
    ],
    notPublished: [
      "A price for the X Protection Plan, which the site names twice",
      "Any aggregate review count, though Google, Facebook and Yelp are all named as sources",
    ],
    routesTo:
      "A promo code box, online scheduling, a telephone number and a text line. The plan behind the codes has no number on it anywhere.",
    sourceUrl: NEXGEN_HOME,
    readOn: READ,
  },
  {
    id: "benjamin-franklin-south-oc",
    name: "Benjamin Franklin Plumbing, Southern Orange County",
    standing: "guarantee-led",
    address:
      "No reliable street address. The franchise location page returned mixed template content, including an address in Southfields, New York that has nothing to do with this market.",
    addressSource:
      "The franchise's own pages, recorded with their data quality problem intact rather than tidied up. Nothing here was taken from a directory to make the row look complete.",
    whyHere:
      "The only brand in this register that publishes no price at all, and therefore the most interesting one. It sells a guarantee with a dollar mechanic attached and a magazine credential, which is what actually wins a job when three quotes are on a kitchen table. A brand fighting on the coupon can be undercut by anybody with a printer. This one cannot.",
    facts: [
      {
        label: "The guarantee, with a number on it",
        value:
          "Always On Time, Or You Don't Pay A Dime: $5.00 for each minute the technician is late, up to 60 minutes, capped at $300",
        sourceUrl: BEN_FRANKLIN_S_OC,
        readOn: READ,
        provenance: "public",
        caveat:
          "The most precisely quantified guarantee found anywhere in this market. Every other guarantee in the register is adjectival: satisfaction, comfort, done right.",
      },
      {
        label: "The hook is a credential, not a price",
        value:
          "Named Forbes' Top Ranked Plumbing Company of 2024, with no dollar value coupon published anywhere on the site",
        sourceUrl: BEN_FRANKLIN_S_OC,
        readOn: READ,
        provenance: "public",
        caveat:
          "The area page also displays 4.82 stars from 116,815 reviews. That is a national brand aggregate on a local page and a sophisticated homeowner discounts it on sight.",
      },
    ],
    notPublished: [
      "Any dollar value coupon or discount",
      "A price for the Club Membership the site names",
      "A lender, described only as several lenders we have built relationships with",
    ],
    routesTo:
      "A Book Now scheduler, a 24/7 telephone number and an SMS consent step at booking. Nothing on the site returns a figure.",
    sourceUrl: BEN_FRANKLIN_S_OC,
    readOn: READ,
  },

  /*
    THE INDEPENDENT, AND THE THINNEST ROW IN THE FILE ON PURPOSE.

    Three franchises and a national network agreeing about plan pricing
    could be a corporate habit. A family owned independent two counties
    inland doing exactly the same thing is the finding generalising,
    which is why this row is worth having even though almost nothing
    could be read off it.

    Only the home page would serve to an automated reader. It carries a
    self serve calendar, a telephone and text number, an award wall and
    no figure of any kind. That is exactly what the row says. Nothing
    was borrowed from a directory to make it look fuller, because a
    register that pads its thin rows cannot be trusted on its full ones.
  */
  {
    id: "magnolia-heating-cooling",
    name: "Magnolia Heating and Cooling",
    standing: "trade-area",
    address: "6990 Jurupa Ave, Riverside, CA",
    addressSource: "The operator's own home page.",
    whyHere:
      "A family owned independent in Riverside, in the register because it is not a franchise and not a network. It competes on local popularity rather than on a number, and it hides the plan price exactly as the national brands do, which is the difference between a coincidence and a finding.",
    facts: [
      {
        label: "Bookings route to",
        value:
          "A self serve Calendly calendar, plus a published telephone and text number, (951) 688-3524",
        sourceUrl: MAGNOLIA_HOME,
        readOn: READ,
        provenance: "public",
        caveat:
          "A genuine self serve calendar is rare here. Most of this register offers a form that a coordinator answers later.",
      },
      {
        label: "What it says about price",
        value:
          "Free estimates on system upgrades, with specials, coupons and rebates behind a click and no figure on the home page",
        sourceUrl: MAGNOLIA_HOME,
        readOn: READ,
        provenance: "public",
        caveat:
          "A free estimate is not a price and is not treated as one here. The trust signal is the award wall instead: five time Press-Enterprise Readers' Choice and three years a Nextdoor Neighbourhood Favourite.",
      },
    ],
    notPublished: [
      "A membership price, and no membership plan is named at all",
      "The name of the financing partner",
      "Any aggregate review count, behind Yelp, Angi, Google and Nextdoor badges",
      "Any dollar figure on the home page",
    ],
    routesTo:
      "A calendar slot or a telephone call. No figure of any kind before somebody speaks to you.",
    sourceUrl: MAGNOLIA_HOME,
    readOn: READ,
  },
];

export const RIVAL_BY_ID: Record<string, Rival> = Object.fromEntries(
  RIVALS.map((r) => [r.id, r]),
);

/**
 * THE ONE ROW ON THIS SCREEN THAT EXPIRES.
 *
 * A dated coupon is the most useful competitive fact available,
 * because it is published, it is specific, and it has a deadline a rep
 * can sell against. It is also the fact most likely to be wrong by the
 * time anybody reads it, which is exactly why the register carries its
 * printed wording, the date it was read, and a standing recomputed
 * against whatever day the reader is on.
 *
 * THE OFFER IS PICKED FOR WHAT IT PROVES RATHER THAN FOR ITS SIZE. A
 * free camera inspection is worth nothing as a differentiator: four
 * brands in this market give one away. What is worth something is that
 * two of them publish the identical giveaway and only one puts a date
 * on it, which is the difference between a campaign and a permanent
 * fixture nobody is measuring.
 *
 * THE DATE IS PRINTED IN FULL AND NEEDS NO INFERENCE, which is rarer
 * here than it should be. What the page does not print is a second
 * deadline for getting the work done, so both fields carry the same
 * date rather than inventing a service window. The middle standing,
 * closed to new bookings, is therefore unreachable for this row, and
 * that is a fact about the coupon rather than a gap in the code.
 */
export const RIVAL_PROMOTIONS: RivalPromotion[] = [
  {
    id: "market-offer-clustering",
    rivalIds: ["rooter-hero-plumbing", "mr-rooter-orange-county"],
    code: "FREE CAMERA INSPECTION",
    offer: "A free camera inspection with service",
    printedWindow: "Expires 09/30/2026",
    booksBy: "2026-09-30",
    heldBy: "2026-09-30",
    yearBasis:
      "The coupon prints the full date, 09/30/2026, so nothing had to be inferred. It prints no separate date by which the work must be done, so this register repeats the one date it has rather than inventing a second.",
    sourceUrl: LS_ORANGE,
    readOn: READ,
  },
];

/**
 * WHAT ACTUALLY BEATS THIS BRAND, ONE OBJECTION AT A TIME.
 *
 * `data/objections.ts` holds seven sentences a customer says. This
 * table reads each of them against one question: is a rival winning
 * this, or is the brand losing it on its own?
 *
 * The classification lives here rather than on the objection, because
 * the objection register answers a different question and should not
 * carry a field only this screen reads. Each row states its reasoning
 * so a reader can argue with one line without discarding the lot.
 *
 * The answer, once the seven are laid out, is the argument this whole
 * screen exists to make. Three are our own gap: a ticket we do not
 * justify with a published plan price, a rebate landscape our own reps
 * have to know better than the utility's website does, and a
 * replacement pitch aimed at somebody who asked for a repair. Three
 * are somebody else's decision cycle: an incumbent tradesman, an
 * absent landlord, a board that wants three bids. One names a rival's
 * price, and that price belongs to a brand that publishes a
 * partnership with the brand holding the next price up.
 */
export const OBJECTION_CAUSES: ObjectionCause[] = [
  {
    objectionId: "no-published-price",
    cause: "our-own-gap",
    because:
      "The smaller outfit wins on the only number anybody has published. Fourteen brands profiled. Eight name a plan and hide the number, five publish no plan at all, and not one of the fourteen prints a price, so the comparison the customer is making is the one this market has left them.",
  },
  {
    objectionId: "no-opening-date",
    cause: "our-own-gap",
    because:
      "Nobody wins this from us. A terminated federal credit and a fully reserved state programme are still advertised on a utility's own factsheet, and the deal is lost by whichever rep answers it worst.",
  },
  {
    objectionId: "cannot-tour",
    cause: "their-calendar",
    because:
      "The board's bidding rule and its meeting date decide this, not a price. Being one of the three in the right format is the whole of the work.",
  },
  {
    objectionId: "unproven-venue",
    cause: "our-own-gap",
    because:
      "The customer asked for a repair and was sold at for a replacement. That is a fault in how we answer the call, and no rival is involved in it.",
  },
  {
    objectionId: "already-committed",
    cause: "their-calendar",
    because:
      "A tradesman who has held the account for years is an incumbent relationship with a retirement date on it, and the answer is the work he does not do rather than an undercut.",
  },
  {
    objectionId: "budget-next-fiscal",
    cause: "their-calendar",
    because:
      "The person in the property cannot authorise the job. This is an approval chain, not a price comparison, and nobody is beating us on a number.",
  },
  {
    objectionId: "we-use-dave-and-busters",
    cause: "a-named-competitor",
    because:
      "The only one of the seven where a customer names a rival's published figure, and the register's own answer is not to match it, because the fifty seven and the seventy seven come from brands that publish a partnership with each other.",
  },
];

export const CAUSE_BY_OBJECTION: Record<string, ObjectionCause> =
  Object.fromEntries(OBJECTION_CAUSES.map((c) => [c.objectionId, c]));

/**
 * THE THREE LOSSES, ANNOTATED WHERE THE THREAD CANNOT SPEAK FOR ITSELF.
 *
 * Everything else on the loss register is derived: the date, the
 * reason, the channel it arrived on and whether the customer or the
 * seat wrote it down all come straight out of `data/conversations.ts`
 * and move if the record moves. Two things do not derive, and both are
 * judgements, so they sit here with their reasoning attached rather
 * than being computed out of thin air in a selector.
 *
 * WHAT KIND OF LOSS IT IS. Only two of the seeded replies pin an
 * objection id, so a classification read solely off the reply file
 * would put two of the three losses in a default bucket and quietly
 * call that analysis. Each one is classified by hand instead, in one
 * sentence, and a reader can disagree with any single line.
 *
 * WHO THE CUSTOMER NAMED, EXPRESSED AS A CLASS AND NEVER AS A
 * BUSINESS. The threads say another contractor and name nobody.
 * Inventing one would drop a real local firm into this application as
 * the winner of a job that never happened, which is precisely the sort
 * of invention this screen exists to refuse.
 */
export const LOSS_NOTES: Record<
  string,
  { cause: LossCause; because: string; namedCompetitor: string | null }
> = {
  "fairway-ford": {
    cause: "their-calendar",
    because:
      "A maintenance agreement with another contractor already covers the site and it renews without going out to bid. That is an incumbent with a date on it, and the useful question is when the agreement ends rather than what it costs.",
    namedCompetitor:
      "Another contractor, unnamed by the account. An agreement already in place, not a price",
  },
  "benjamin-franklin-south-oc": {
    cause: "their-calendar",
    because:
      "They keep maintenance staff of their own and the committee signs off on anything they cannot handle in house. The decision was never put in front of anybody, so there was nothing to win.",
    namedCompetitor:
      "Themselves. Their own maintenance staff handle the small jobs",
  },
  "sell-my-home-real-estate": {
    cause: "their-calendar",
    because:
      "The replacement was quoted and signed in July, at the top of the cooling season, two months before this desk had anybody to ask them. Lost on the calendar rather than on the pitch, and the answer is to be in the conversation before July next year.",
    namedCompetitor: null,
  },
};

/**
 * WHAT WAS LOOKED FOR AND COULD NOT BE VERIFIED.
 *
 * Published for the same reason `EXCLUDED_FROM_BOARD` is published in
 * `data/prospects.ts`: a rule applied once is an anecdote and a rule
 * applied every time it fired is a standard. Every line below is
 * something a competitor grid would happily have contained.
 */
export const REFUSED_FACTS: { claim: string; why: string }[] = [
  {
    claim: "A membership price for any brand in this register",
    why: "Fourteen brands were profiled on 18 August 2026 and not one publishes one. Eight name a plan and refuse the number and the other five publish no plan at all. The X Protection Plan, three Protection Plans, HERO CLUB and HERO CLUB Plus, the Advantage Plan, two Club Memberships, maintenance agreements and Sierra Rewards all name a plan and hide the number. There is no figure to record and there will not be one until somebody rings and asks, which is a first party fact rather than a published one.",
  },
  {
    claim: "An APR or a financing term for anybody in this market",
    why: "Only three of the fourteen brands opened name a lender at all: Synchrony at Mike Diamond and Roto-Rooter, Wells Fargo at Cool Air Technologies. Not one publishes an APR, a term or a monthly payment. On an up to $2,000 replacement offer that silence is the loudest thing on the page and it cannot be quantified.",
  },
  {
    claim: "A ranking of these brands by review count",
    why: "The published counts are not comparable and stacking them would be the most misleading chart on the screen. ARS shows 134,039 and Benjamin Franklin 116,815, both national network aggregates displayed on local pages. Mr. Rooter's 708, Roto-Rooter LA's 260 and One Hour Mission Viejo's 118 are honest local counts. Two of those are the same kind of number and three are not.",
  },
  {
    claim: "Advertising spend, share of local calls, or a rival's cost per lead",
    why: "No data source exists for private home services marketing spend in a five county market, and none of these brands publishes a lead figure. Anything printed here would be invented outright on the one screen whose entire job is accuracy about other people's businesses.",
  },
  {
    claim: "Whether any of these coupons actually converts",
    why: "Redemption is the number that would make this register decisive and no rival publishes one. A promo code architecture implies paid search, a dated coupon implies somebody is measuring it, and neither implication is evidence.",
  },
  {
    claim: "What the fifty seven dollar drain costs once the conditions apply",
    why: "The access and footage conditions are printed on the seventy seven dollar version and the exclusions are not printed anywhere. A quoted range for a real call would be a guess about somebody else's pricing, and this register does not make those.",
  },
  {
    claim: "Paid search and Local Services Ads posture",
    why: "Not one brand in this market publishes a Google Guaranteed badge on its own site and none runs an as seen on media list, so posture here is inferred from page architecture, per city landing pages and promo code structure rather than observed. An inference is labelled as one and is not counted anywhere.",
  },
  {
    claim: "A trend line for any of these prices",
    why: "Every page was opened once, on one day. A price that moved last spring left no trace on the page that would let this register say so, and a chart with one point on it drawn as a line is a lie about the shape of the market.",
  },
  {
    claim: "Anything about a rival's customers, staff or operations",
    why: "Out of bounds by rule, not by difficulty. Published marketing pages only.",
  },
];

/**
 * THE STALE PAGE, WHICH IS THE OTHER KIND OF CHECKABLE FACT.
 *
 * Openings, closings, renames and abandoned campaigns come off the
 * pages themselves, they are dated, and they are exactly what a
 * register exists to catch. This one is also directly useful: it shows
 * what happens when a national coupon set is dropped onto local pages
 * and nobody in the market owns any of them.
 */
export const REBRAND_NOTE = {
  headline:
    "ARS and Rescue Rooter run Southern California as three separate storefronts, and the Los Angeles East coupon page has not been refreshed in about two years",
  /* The date is printed on the coupons themselves. The scale claim
     comes off a different storefront, so the two are cited separately
     rather than one of them being asked to support both. */
  announced: "2024-07-31",
  announcedSourceUrl: LUCK_REBRAND_WIRE,
  scale:
    "Three storefronts under three names, and no single Southern California page at all: ars.com/southern-california returns a 404",
  sourceUrl: LUCK_REBRAND,
  readOn: READ,
  liveEvidence:
    "The San Diego page and the Corona page that markets to Orange County publish the identical coupon block, figure for figure: a $59 tune-up, $50 off any repair, up to $2,000 on a new system and a $99 main drain line with a free camera. That is a national set dropped onto local pages, which is how one of them rots for two years without anybody noticing.",
  liveEvidenceFrom:
    "https://www.ars.com/greenstar-home-services-rescue-rooter/coupons",
} as const;
