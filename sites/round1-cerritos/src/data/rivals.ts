import type {
  LossCause,
  ObjectionCause,
  Rival,
  RivalPromotion,
} from "@/domain/rivals";

/**
 * THE COMPETITIVE REGISTER FOR THE CERRITOS TRADE AREA.
 *
 * ── WHAT A COMPETITIVE REGISTER IS FOR ────────────────────────────
 * Not a scoreboard. A register exists so that a person walking into a
 * conversation knows which other names are already in the buyer's head,
 * what those names publish, and what they do not. Every claim below
 * carries the URL it came off and the day it was read, and the rows that
 * could not be read are marked as unread rather than quietly padded. A
 * register about other people's businesses that cannot be checked is
 * worse than no register, because the reader has no way to tell the
 * sound rows from the invented ones and therefore has to discount all of
 * them.
 *
 * ── ALMOST NOBODY PUBLISHES A GROUP PRICE, INCLUDING THIS OPERATOR ─
 * Round1 publishes one named group offering, the All Inclusive Party,
 * with its contents and no price, and `data/packages.ts` records that as
 * one gated package out of one. Lucky Strike routes event enquiries to a
 * planner. Dave and Buster's routes them to a planner. The one operator
 * in this register that does publish figures for group business is Main
 * Event, and what it publishes is a fundraiser percentage and two guest
 * minimums, not a price per head.
 *
 * That asymmetry is the finding, and it is a finding about a market
 * rather than a claim about anybody. It also means rate shopping the
 * group segment is a fantasy. A competitor grid with a price in every
 * cell would be the single most dishonest object it is possible to build
 * in this application, and there is no field below that could hold one.
 *
 * ── SO THE REGISTER SAYS WHAT IT CANNOT SEE ───────────────────────
 * Each row carries `notPublished` and `routesTo`. Those two fields do
 * the work a price column would have done and they do it truthfully: a
 * rep who knows that every rival routes group enquiries to a form knows
 * something useful about how to sell against them, and a rep holding an
 * invented price knows something false.
 *
 * ── NOTHING HERE IS ABOUT ANYBODY'S CUSTOMERS OR STAFF ────────────
 * Addresses, package names, published promotions, a public filing and a
 * live redirect. Every one of them is on a marketing page or in a press
 * release. There is nothing about a competitor's bookings, occupancy,
 * people or operations in this file, and the types in `domain/rivals.ts`
 * give it nowhere to go.
 */

/** The day the Lucky Strike and Bowlero corporate pages were read. */
const READ = "2026-08-14";

/** The day the Main Event events pages were read. */
const ME_READ = "2026-08-11";

const LS_CERRITOS = "https://www.luckystrikeent.com/";
const LS_FULLERTON =
  "https://www.luckystrikeent.com/location/lucky-strike-fullerton";
const DB_ACQUISITION =
  "https://ir.daveandbusters.com/news-releases/news-release-details/dave-busters-completes-acquisition-main-event";
const LUCK_REBRAND =
  "https://www.sec.gov/Archives/edgar/data/1840572/000162828024051278/pressrelease.htm";
const LUCK_REBRAND_WIRE =
  "https://www.businesswire.com/news/home/20241212252122/en/Bowlero-Completes-Rebrand-to-Lucky-Strike-Entertainment-with-NYSE-Ticker-LUCK";
const ME_SCHOOL = "https://www.mainevent.com/events/school-events/";
const ME_LOCK_IN =
  "https://www.mainevent.com/events/school-events/lock-in-3-or-4-hours-school/";
const ME_BUYOUT =
  "https://www.mainevent.com/events/corporate-events/full-facility-buyout-corporate/";
const CEC = "https://www.chuckecheese.com/";
const SANDBOX = "https://sandboxvr.com/";
const JIP = "https://www.johnsincrediblepizza.com/";

/**
 * The sentence every unread row carries, written once.
 *
 * A row with nothing read off it is still worth having, because knowing
 * which names are in the set is half the value of a set. What it is not
 * worth doing is dressing the row up. This string is the whole of what
 * the register knows about those operators, and it says so in the same
 * words every time so that a reader can spot them at a glance.
 */
const NOT_READ =
  "Not read. No page of this operator was opened in this pass, so this row records the operator and no figure of any kind, and claims none.";

export const RIVALS: Rival[] = [
  {
    id: "lucky-strike-cerritos",
    name: "Lucky Strike Cerritos",
    standing: "trade-area",
    address: "18811 Carmenita Road, Cerritos, CA",
    addressSource:
      "Carried into this register with the trade area brief rather than read off the operator's own location page, so it is recorded as second hand and labelled as such.",
    whyHere:
      "The bowling house in this trade area, on the same side of the freeway as the corporate office, and the venue a group weighing up a bowling night will price against first. It is the nearest thing in the set to a like for like room.",
    facts: [
      {
        label: "Parent brand",
        value:
          "Lucky Strike Entertainment Corporation, the company that traded as Bowlero until December 2024",
        sourceUrl: LUCK_REBRAND_WIRE,
        readOn: READ,
        provenance: "public",
        caveat:
          "The parent is sourced. Nothing about this particular house is, because its own location page was not opened in this pass.",
      },
    ],
    notPublished: [
      "Any per head group or event price, on any Lucky Strike page read",
      "A lane count for this house, because its own page was not read",
      "A room capacity, a minimum spend or a room hire fee",
    ],
    routesTo:
      "The operator's event enquiries route to a planner rather than to a figure, which is the same gate this operator's own party page puts up.",
    sourceUrl: LS_CERRITOS,
    readOn: READ,
  },
  {
    id: "bowlero",
    name: "Bowlero, now Lucky Strike Entertainment",
    standing: "same-parent",
    address: "A national operator. No single address, and none read here.",
    addressSource:
      "A corporate row rather than a venue row. The address field is deliberately empty of a street.",
    whyHere:
      "Because half the search results for the bowling house above still say Bowlero, and a rep who does not know the two names are one company will spend a call being corrected. It is also the only operator in the set whose scale is on a public filing rather than on a marketing page.",
    facts: [
      {
        label: "Rebrand",
        value:
          "Bowlero Corporation completed its rebrand to Lucky Strike Entertainment Corporation, NYSE ticker LUCK",
        sourceUrl: LUCK_REBRAND,
        readOn: READ,
        provenance: "public",
      },
      {
        label: "Scale",
        value: "Stated as over 360 locations across North America",
        sourceUrl: LUCK_REBRAND,
        readOn: READ,
        provenance: "public",
        caveat:
          "A December 2024 figure from the rebrand release. It describes that moment, not today.",
      },
      {
        label: "Published party offer",
        value:
          "PARTY15, 15% off parties and events, printed on a Lucky Strike location page",
        sourceUrl: LS_FULLERTON,
        readOn: READ,
        provenance: "public",
        caveat:
          "Read on the operator's Fullerton location page, which is outside this trade area. It is recorded against the operator for that reason and is not claimed for the Cerritos house.",
      },
    ],
    notPublished: [
      "Any per head group or event price, anywhere on the pages read",
      "Whether the party offer above runs at every location",
    ],
    routesTo:
      "A Book an Event control and a Contact an Event Planner link. A person quotes it.",
    sourceUrl: LUCK_REBRAND,
    readOn: READ,
  },
  {
    id: "main-event",
    name: "Main Event",
    standing: "category-only",
    address: "A regional operator. No address in this trade area was read.",
    addressSource:
      "Its events pages were opened for published terms rather than for a location.",
    whyHere:
      "THE ONE OPERATOR IN THIS SET THAT PUBLISHES FIGURES FOR GROUP BUSINESS, which makes it the useful contrast rather than the nearest threat. Everything below is Main Event's own published number on Main Event's own site. None of it is this operator's, none of it has been relabelled, and a reader who takes one figure off this row and quotes it as ours has misread the row and the register.",
    facts: [
      {
        label: "Fundraiser rate",
        value:
          "Spirit Night, on which the operator donates 20% of all sales on the night to the nonprofit",
        sourceUrl: ME_SCHOOL,
        readOn: ME_READ,
        provenance: "public",
        caveat:
          "Main Event's published figure. A percentage of a night's sales, which is not a price and not a per head rate.",
      },
      {
        label: "School lock-in minimum",
        value: "150 guests",
        sourceUrl: ME_LOCK_IN,
        readOn: ME_READ,
        provenance: "public",
      },
      {
        label: "Buyout minimum",
        value: "200 guests",
        sourceUrl: ME_BUYOUT,
        readOn: ME_READ,
        provenance: "public",
      },
      {
        label: "Same parent as Dave and Buster's",
        value:
          "29 June 2022, on which Dave and Buster's announced the completion of its acquisition of Main Event",
        sourceUrl: DB_ACQUISITION,
        readOn: READ,
        provenance: "public",
        caveat:
          "Useful on a call. A buyer who names both is naming one company twice.",
      },
    ],
    notPublished: [
      "A price for any corporate or group package, all of which route to a local sales manager",
      "A price for the fundraiser, because there is no per head price to publish",
      "Minimums or terms beyond the three figures above",
    ],
    routesTo:
      "Contact the local sales manager, with several pages adding that room rental fees and revenue minimums may apply. The gate again, on the operator that publishes the most.",
    sourceUrl: ME_SCHOOL,
    readOn: ME_READ,
  },
  {
    id: "chuck-e-cheese-cerritos",
    name: "Chuck E. Cheese Cerritos",
    standing: "trade-area",
    address: "Cerritos, CA. No street address was read for this row.",
    addressSource: NOT_READ,
    whyHere:
      "The birthday and youth party incumbent in this trade area, and the venue a parent or a youth group names before anybody names a bowling house. It competes for the small end of the same calendar. " +
      NOT_READ,
    facts: [],
    notPublished: [NOT_READ],
    routesTo: NOT_READ,
    sourceUrl: CEC,
    readOn: READ,
  },
  {
    id: "johns-incredible-pizza-buena-park",
    name: "John's Incredible Pizza Buena Park",
    standing: "trade-area",
    address: "Buena Park, CA. No street address was read for this row.",
    addressSource: NOT_READ,
    whyHere:
      "A buffet and games format one town over, which is the direct competitor for a large youth group on a budget, and the one operator in this set whose whole proposition is a headcount. " +
      NOT_READ,
    facts: [],
    notPublished: [NOT_READ],
    routesTo: NOT_READ,
    sourceUrl: JIP,
    readOn: READ,
  },
  {
    id: "sandbox-vr",
    name: "Sandbox VR",
    standing: "category-only",
    address: "A chain. No location in this trade area was read for this row.",
    addressSource: NOT_READ,
    whyHere:
      "In the register for the same reason the boundary of a competitive set is a discipline rather than a formality. It takes the same corporate team night and the same group of friends on a Friday, and it does it with none of the same equipment, which makes it a competitor for the occasion rather than for the format. " +
      NOT_READ,
    facts: [],
    notPublished: [NOT_READ],
    routesTo: NOT_READ,
    sourceUrl: SANDBOX,
    readOn: READ,
  },
];

export const RIVAL_BY_ID: Record<string, Rival> = Object.fromEntries(
  RIVALS.map((r) => [r.id, r]),
);

/**
 * THE ONE ROW ON THIS SCREEN THAT EXPIRES.
 *
 * A dated promotion aimed at the event segment is the most useful
 * competitive fact available to an operator that cannot shop a rate,
 * because it is published, it is specific, and it has a deadline that a
 * rep can sell against. It is also the fact most likely to be wrong by
 * the time anybody reads it, which is exactly why the register carries
 * its printed wording, the date it was read, and a standing that is
 * recomputed against whatever day the reader is on.
 *
 * IT IS RECORDED AGAINST THE OPERATOR AND NOT AGAINST THE LOCAL HOUSE.
 * The code was printed on a Lucky Strike location page outside this
 * trade area. Moving it onto the Cerritos row would be inventing a
 * promotion at a venue whose page nobody opened, so it sits on the
 * corporate row with the reason attached.
 *
 * THE YEAR IS AN INFERENCE AND IT IS LABELLED ONE. The page prints
 * "8/31" and "9/30" with no year on it. This register reads them as 2026
 * because that is the year the page was open in. That is a judgement,
 * not a quotation, so it travels with the row.
 */
export const RIVAL_PROMOTIONS: RivalPromotion[] = [
  {
    id: "party15",
    rivalIds: ["bowlero"],
    code: "PARTY15",
    offer: "15% off parties and events",
    printedWindow: "Valid through 8/31 for events held by 9/30",
    booksBy: "2026-08-31",
    heldBy: "2026-09-30",
    yearBasis:
      "The page prints no year. It was read on 14 August 2026, so a window closing on 31 August can only be 2026.",
    sourceUrl: LS_FULLERTON,
    readOn: READ,
  },
];

/**
 * WHAT ACTUALLY BEATS THIS OPERATOR, ONE OBJECTION AT A TIME.
 *
 * `data/objections.ts` holds the sentences a buyer says. This table
 * reads each of them against one question: is somebody else winning
 * this, or is the operator losing it on its own?
 *
 * The classification lives here rather than on the objection, because
 * the objection register answers a different question and should not
 * carry a field only this screen reads. Each row states its reasoning so
 * a reader can argue with one line without discarding the lot.
 *
 * The answer, once they are laid out, is the argument this whole screen
 * exists to make. Two are the operator's own silence and geography. Two
 * are somebody else's calendar. Two name another operator, and in one of
 * those the named operator is winning on publishing rather than on
 * price. Nothing in the register is lost to a rival's better rate,
 * because there is not a published rival rate anywhere in the category
 * to lose to.
 */
export const OBJECTION_CAUSES: ObjectionCause[] = [
  {
    objectionId: "no-published-price",
    cause: "our-own-gap",
    because:
      "The price is withheld on purpose and there is nobody in the seat to quote one on the day. No competitor is involved, and all but one of them withholds a group price too.",
  },
  {
    objectionId: "no-local-venue",
    cause: "our-own-gap",
    because:
      "The corporate office is in this trade area and the nearest store is one town over. That is geography, not a rival, and a competitor could vanish overnight and the drive would be exactly as long.",
  },
  {
    objectionId: "competitor-publishes-terms",
    cause: "a-named-competitor",
    because:
      "The buyer names Main Event and holds up figures Main Event actually publishes. It is the only row in the register where another operator is winning something, and what it is winning on is disclosure rather than rate.",
  },
  {
    objectionId: "already-committed",
    cause: "their-calendar",
    because:
      "A multi year hotel contract already holds the date. The incumbent is a supplier relationship with a renewal date on it, and the answer is to find that date rather than to undercut it.",
  },
  {
    objectionId: "budget-next-fiscal",
    cause: "their-calendar",
    because:
      "The money is not appropriated until the next fiscal year. Nobody is being beaten on price because nobody is being paid yet.",
  },
  {
    objectionId: "we-use-dave-and-busters",
    cause: "a-named-competitor",
    because:
      "A buyer names another venue and likes it. The register's own answer is not to attack it, because an incumbent the buyer chose and enjoyed is not an argument that can be won.",
  },
];

export const CAUSE_BY_OBJECTION: Record<string, ObjectionCause> =
  Object.fromEntries(OBJECTION_CAUSES.map((c) => [c.objectionId, c]));

/**
 * THE LOSSES, ANNOTATED WHERE THE THREAD CANNOT SPEAK FOR ITSELF.
 *
 * Everything else on the loss register is derived: the date, the reason,
 * the channel it arrived on and whether the buyer or the seat wrote it
 * down all come straight out of `data/conversations.ts` and move if the
 * record moves. Two things do not derive, and both are judgements, so
 * they sit here with their reasoning attached rather than being computed
 * out of thin air in a selector.
 *
 * WHAT KIND OF LOSS IT IS. Only some of the seeded replies pin an
 * objection id, so a classification read solely off the reply file would
 * put several losses in a default bucket and quietly call that analysis.
 * Each one is classified by hand instead, in one sentence, and a reader
 * can disagree with any single line.
 *
 * WHO THE BUYER NAMED, EXPRESSED AS A CLASS AND NEVER AS A BUSINESS.
 * The dealership thread says a hotel and names no hotel. Inventing one
 * would drop a real local business into this application as the winner
 * of a deal that never happened, which is precisely the sort of
 * invention this screen exists to refuse.
 *
 * THE KEYS ARE PROSPECT IDS. They join to `data/prospects.ts`, so a row
 * whose prospect is retired simply stops being read rather than breaking
 * anything.
 */
export const LOSS_NOTES: Record<
  string,
  { cause: LossCause; because: string; namedCompetitor: string | null }
> = {
  "fairway-ford": {
    cause: "their-calendar",
    because:
      "A three year hotel contract already holds December. That is an incumbent supplier with a renewal date on it, and the useful question is when the contract ends rather than what it costs.",
    namedCompetitor:
      "A hotel, unnamed by the buyer. Three years of an existing contract, not a price",
  },
  "the-phoenix-club": {
    cause: "their-calendar",
    because:
      "They run a banquet hall themselves and members expect events at the club. The date is held in-house, permanently, and no offer changes that.",
    namedCompetitor:
      "Themselves. They own the hall the event would have sat in",
  },
  "sell-my-home-real-estate": {
    cause: "their-calendar",
    because:
      "The client event was booked and paid for in July, two months before anybody here had cause to ask them. Lost on the calendar, not on the pitch, and the answer is to be in the conversation earlier next year.",
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
    claim: "A group or per head price for any venue in this register",
    why: "Not one operator in the set publishes one. Every enquiry routes to a form, a planner or a telephone, and that includes this operator's own party page. There is no figure to record and there will not be one until somebody rings and asks, which is a first party fact rather than a published one.",
  },
  {
    claim:
      "Any figure at all for Chuck E. Cheese Cerritos, John's Incredible Pizza Buena Park or Sandbox VR",
    why: "No page of any of the three was opened in this pass. They are in the register because they take the same occasion and the buyer names them, and their rows say in the same words that nothing was read. A row padded from memory or from a directory would look exactly like a row that was researched, which is why none of them is.",
  },
  {
    claim: "A lane count for any venue, including this operator's own",
    why: "Round1 publishes no lane count for any location, which `data/venue.ts` records as null rather than as a guess, and the Lucky Strike house in this trade area was not read. A count carried across from another operator's building would be a number about somebody else's floor.",
  },
  {
    claim: "A street address for Lucky Strike Cerritos from the operator's own page",
    why: "The address on the row came in with the trade area brief and the operator's own location page was not opened to confirm it. It is labelled second hand on the row rather than presented as first party.",
  },
  {
    claim: "Distances and drive times from the corporate office to these venues",
    why: "The corporate office coordinate is geocoded and none of these venues is. A mileage produced by eye would be the one number on this page nobody could check, on the screen least able to afford it.",
  },
  {
    claim: "Share of local group business, competitor booking pace, competitor win rates",
    why: "No data source exists for family entertainment party bookings in a trade area this size. The hotel intelligence products cover hotel meetings and there is no equivalent here. A share figure would be invented outright.",
  },
  {
    claim: "A market trend time series",
    why: "The application has no history. What can be shown honestly is movement in the board's own status distribution, which is observed rather than fitted, and it lives on the screens that own it.",
  },
  {
    claim: "Anything about a competitor's customers, staff or operations",
    why: "Out of bounds by rule, not by difficulty. Published marketing pages and public filings only.",
  },
];

/**
 * THE REBRAND, WHICH IS THE OTHER KIND OF CHECKABLE COMPETITIVE FACT.
 *
 * Openings, closings and renames come from press releases and public
 * filings, they are dated, and they are the sort of thing a register
 * exists to catch. This one is also directly useful: half the search
 * results a rep will find for the bowling house in this trade area still
 * say Bowlero, and knowing why saves a confused conversation.
 */
export const REBRAND_NOTE = {
  headline:
    "Bowlero Corporation completed its rebrand to Lucky Strike Entertainment Corporation, NYSE ticker LUCK",
  /* The dateline is on the wire release. The filed copy carries the
     names, the ticker and the scale and no date, so the two are cited
     separately rather than one of them being asked to support both. */
  announced: "2024-12-12",
  announcedSourceUrl: LUCK_REBRAND_WIRE,
  scale: "Stated as over 360 locations across North America",
  sourceUrl: LUCK_REBRAND,
  readOn: READ,
  liveEvidence:
    "An old bowlero.com location address returns a 302 to the equivalent Lucky Strike location page, checked on 14 August 2026.",
  liveEvidenceFrom: "https://www.bowlero.com/location/bowlero-fullerton",
} as const;
