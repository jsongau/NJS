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
 * Six venues, opened on 14 August 2026, one at a time. Every claim in
 * this file carries the URL it came off and the day it was read, and
 * the ones that could not be verified are named at the foot of the
 * file rather than quietly dropped. A register about other people's
 * businesses that cannot be checked is worse than no register, because
 * the reader has no way to tell the sound rows from the invented ones
 * and therefore has to discount all of them.
 *
 * ── NOBODY PUBLISHES A GROUP PRICE. NOT ONE OF THEM ───────────────
 * Lucky Strike Fullerton and Lucky Strike Orange each publish four
 * event package families and no per head figure against any of them,
 * routing to "Contact an Event Planner". Round1 publishes the seven
 * inclusions of its All Inclusive Party Package and no price. Dave and
 * Buster's Orange publishes no event price and routes to "Contact one
 * of our Planners". The Phoenix Club publishes a ballroom and routes
 * to a phone number. La Habra 300 Bowl, which is nobody's chain,
 * routes bookings to a telephone and states no figure at all. Main
 * Event's own group packages are gated behind "contact the local sales
 * manager", which `data/packages.ts` already records, and
 * `data/leagues.ts` records the identical silence for league pricing
 * across the same operators.
 *
 * That is six out of six, three chains and one independent, plus this
 * venue, plus a second product category. It is not a gap in the
 * research. It is how the category sells, and it means rate shopping
 * the group segment is a fantasy.
 * A competitor grid with prices in it would be the single most
 * dishonest object it is possible to build in this application.
 *
 * ── SO THE REGISTER SAYS WHAT IT CANNOT SEE ───────────────────────
 * Each row carries `notPublished` and `routesTo`. Those two fields do
 * the work a price column would have done and they do it truthfully:
 * a rep who knows that every rival routes group enquiries to a form
 * knows something useful about how to sell against them, and a rep
 * holding an invented price knows something false.
 *
 * ── NOTHING HERE IS ABOUT ANYBODY'S CUSTOMERS OR STAFF ────────────
 * Addresses, lane counts, package names, published walk in prices,
 * published promotions, a public filing and a live redirect. Every one
 * of them is on a marketing page or in a press release. There is
 * nothing about a competitor's bookings, occupancy, people or
 * operations in this file, and the types in `domain/rivals.ts` give it
 * nowhere to go.
 */

const READ = "2026-08-14";

const LS_FULLERTON =
  "https://www.luckystrikeent.com/location/lucky-strike-fullerton";
const LS_ORANGE = "https://www.luckystrikeent.com/location/lucky-strike-orange";
const R1_LOCATIONS = "https://www.round1usa.com/locations";
const R1_PARTY = "https://www.round1usa.com/book-a-party";
const DB_ORANGE =
  "https://www.daveandbusters.com/us/en/about/locations/california-orange";
const DB_ACQUISITION =
  "https://ir.daveandbusters.com/news-releases/news-release-details/dave-busters-completes-acquisition-main-event";
const PHOENIX_BANQUETS = "https://www.thephoenixclub.com/banquet-facilities/";
const LUCK_REBRAND =
  "https://www.sec.gov/Archives/edgar/data/1840572/000162828024051278/pressrelease.htm";
const LH_BOWL = "http://www.lhbowl.com/";
const LUCK_REBRAND_WIRE =
  "https://www.businesswire.com/news/home/20241212252122/en/Bowlero-Completes-Rebrand-to-Lucky-Strike-Entertainment-with-NYSE-Ticker-LUCK";

export const RIVALS: Rival[] = [
  {
    id: "lucky-strike-fullerton",
    name: "Lucky Strike Fullerton",
    standing: "trade-area",
    address: "1501 S. Lemon St, Fullerton, CA 92832",
    addressSource: "The operator's own location page.",
    whyHere:
      "The largest bowling house in this register and the one with the most published detail. It states forty lanes against Main Event Brea's published floor of more than twenty six, which is a real difference and belongs on the page rather than out of sight.",
    facts: [
      {
        label: "Lanes",
        value: "40 lanes",
        sourceUrl: LS_FULLERTON,
        readOn: READ,
        provenance: "public",
      },
      {
        label: "Event packages named",
        value:
          "Kids Party, Teen Party, Adult Social Event, Corporate Events and Team Builders",
        sourceUrl: LS_FULLERTON,
        readOn: READ,
        provenance: "public",
        caveat:
          "Four families are named. No per head figure appears against any of them.",
      },
      {
        label: "Walk in bowling",
        value:
          "Endless Summer Nights, $24.99 per person, unlimited games, shoes included, Sunday to Thursday",
        sourceUrl: LS_FULLERTON,
        readOn: READ,
        provenance: "public",
        caveat:
          "The start time differs by night and the page states it per night rather than once.",
      },
      {
        label: "Walk in bowling",
        value:
          "Family Unlimited, $22.99 per person, unlimited bowling, shoes included, Saturday and Sunday, 11am to 3pm",
        sourceUrl: LS_FULLERTON,
        readOn: READ,
        provenance: "public",
      },
      {
        label: "Walk in bowling",
        value:
          "After Party, $32.99 per person, unlimited bowling, Friday and Saturday from 9pm",
        sourceUrl: LS_FULLERTON,
        readOn: READ,
        provenance: "public",
      },
      {
        label: "Standing offer",
        value: "The Special, buy two games and get the third half off, daily",
        sourceUrl: LS_FULLERTON,
        readOn: READ,
        provenance: "public",
      },
    ],
    notPublished: [
      "Any per head group or event price",
      "Room capacities for the event spaces",
      "A minimum spend or a room hire fee",
    ],
    routesTo:
      "A Book an Event control and a Contact an Event Planner link. A person quotes it, the same way a person quotes Brea.",
    sourceUrl: LS_FULLERTON,
    readOn: READ,
  },
  {
    id: "lucky-strike-orange",
    name: "Lucky Strike Orange",
    standing: "trade-area",
    address: "20 City Blvd West Ste G-2, Orange, CA 92868",
    addressSource: "The operator's own location page.",
    whyHere:
      "Half the lane count of the Fullerton house and the same four event families, which makes it the useful comparison for a group of eighty rather than a group of three hundred. It also shares a street address block with the Dave and Buster's below, and a buyer weighing up a night out is weighing up that whole car park.",
    facts: [
      {
        label: "Lanes",
        value: "24 lanes",
        sourceUrl: LS_ORANGE,
        readOn: READ,
        provenance: "public",
      },
      {
        label: "Event packages named",
        value:
          "Kids Party, Teen Party, Adult Social Event, Corporate Events and Team Builders",
        sourceUrl: LS_ORANGE,
        readOn: READ,
        provenance: "public",
        caveat: "The same four families as Fullerton, and the same absent price.",
      },
      {
        label: "Walk in bowling",
        value:
          "Endless Summer Nights, $24.99 per person, shoes included, Thursday from 7pm, Sunday from 6pm, Monday to Wednesday from 7pm",
        sourceUrl: LS_ORANGE,
        readOn: READ,
        provenance: "public",
      },
      {
        label: "Walk in bowling",
        value: "Family Unlimited, $22.99, Saturday and Sunday, 11am to 3pm",
        sourceUrl: LS_ORANGE,
        readOn: READ,
        provenance: "public",
      },
      {
        label: "Walk in bowling",
        value: "After Party, $32.99, unlimited bowling, Friday from 9pm",
        sourceUrl: LS_ORANGE,
        readOn: READ,
        provenance: "public",
      },
      {
        label: "Second promotion",
        value: "Summer Season Pass, 25% off, valid through 9/1",
        sourceUrl: LS_ORANGE,
        readOn: READ,
        provenance: "public",
        caveat:
          "Printed without a year, like the party code below. Read on 14 August 2026, so 2026 is the only reading that makes sense of it.",
      },
    ],
    notPublished: [
      "Any per head group or event price",
      "Room capacities for the event spaces",
      "A minimum spend or a room hire fee",
    ],
    routesTo:
      "Contact an Event Planner. No form on the page returns a figure.",
    sourceUrl: LS_ORANGE,
    readOn: READ,
  },
  {
    id: "round1",
    name: "Round1",
    standing: "category-only",
    address: "No location in Brea and none at Brea Mall.",
    addressSource:
      "The operator's own locations list, read in full rather than searched.",
    whyHere:
      "Because getting the boundary of a competitive set right is the discipline itself, and Round1 is the venue everybody names. It belongs in the category and it does not belong in the trade area, and saying so with the locations list open is worth more than a row that quietly includes it.",
    facts: [
      {
        label: "California locations",
        value:
          "Burbank, City of Industry, Concord, Hayward, Lakewood, Mission Viejo, Moreno Valley, National City, Roseville, Salinas, San Francisco, San Jose, Santa Ana and Temecula",
        sourceUrl: R1_LOCATIONS,
        readOn: READ,
        provenance: "public",
      },
      {
        label: "Named as coming soon",
        value: "Palmdale, Escondido and Ventura",
        sourceUrl: R1_LOCATIONS,
        readOn: READ,
        provenance: "public",
      },
      {
        label: "Nothing in this trade area",
        value: "No Brea location and no Brea Mall location on the list",
        sourceUrl: R1_LOCATIONS,
        readOn: READ,
        provenance: "public",
        caveat:
          "This is the whole reason the row is here. Read the list, do not assume it.",
      },
      {
        label: "Party package inclusions",
        value:
          "Arcade time play, bowling and shoe rental, karaoke or party room, billiards and ping pong, pizza and soda, a group photo, and a VIP immersive lane add on at select locations for an additional fee",
        sourceUrl: R1_PARTY,
        readOn: READ,
        provenance: "public",
      },
    ],
    notPublished: [
      "Any per head or group party price",
      "Which locations carry the VIP immersive lane",
      "Anything at all about Brea, because there is nothing to publish",
    ],
    routesTo:
      "A locate your Round1 control and a party coordinator at the chosen venue.",
    sourceUrl: R1_LOCATIONS,
    readOn: READ,
  },
  {
    id: "dave-and-busters-orange",
    name: "Dave and Buster's Orange",
    standing: "same-parent",
    address: "20 City Blvd. West, Orange, CA 92868",
    addressSource: "The operator's own location page.",
    whyHere:
      "The venue buyers in this trade area actually name, and the one row in this register that is not a competitor at all. Dave and Buster's completed its acquisition of Main Event on 29 June 2022, so a rep told the annual night is already at Dave and Buster's is being told it is already with the same company.",
    facts: [
      {
        label: "Same parent since",
        value:
          "29 June 2022, on which Dave and Buster's announced the completion of its acquisition of Main Event",
        sourceUrl: DB_ACQUISITION,
        readOn: READ,
        provenance: "public",
      },
      {
        label: "Scale at that date",
        value:
          "Dave and Buster's stated 147 venues in North America and Main Event 50 centres in 17 states",
        sourceUrl: DB_ACQUISITION,
        readOn: READ,
        provenance: "public",
        caveat:
          "A June 2022 figure and nothing more recent was published in a form worth quoting. It describes the moment of the acquisition, not today.",
      },
      {
        label: "Event enquiries",
        value:
          "Contact one of our Planners, with a Start Planning control that opens a contact form",
        sourceUrl: DB_ORANGE,
        readOn: READ,
        provenance: "public",
      },
    ],
    notPublished: [
      "Any per head party or event price",
      "Lane, game or room counts for this location",
    ],
    routesTo:
      "A planner contact form. The identical gate Main Event puts on its own group pricing, run by the same parent company.",
    sourceUrl: DB_ORANGE,
    readOn: READ,
  },
  {
    id: "the-phoenix-club",
    name: "The Phoenix Club",
    standing: "banquet-room",
    address: "375 W Central Ave, Brea, CA 92821",
    addressSource:
      "Google Places, retrieved 11 August 2026, carried on the prospect row. The club's own site does not print a street address on its home page or on its banquet page, so the address here is not first party and the register says so.",
    whyHere:
      "The only venue in this register that is also a row on the prospect board, and the only one the record shows this venue losing to. It is in Brea, it owns its own hall, and the refusal on its thread is a refusal to send business anywhere else, which is a reason that does not change. A bowling house in another town is a competitor in theory. A room with its own calendar and its own membership in this one is a competitor in practice.",
    facts: [
      {
        label: "Publishes a hall",
        value: "Banquet facilities, with The Grand Ballroom named",
        sourceUrl: PHOENIX_BANQUETS,
        readOn: READ,
        provenance: "public",
      },
      {
        label: "Enquiries route to",
        value: "A phone number for the office, and an email form",
        sourceUrl: PHOENIX_BANQUETS,
        readOn: READ,
        provenance: "public",
      },
    ],
    notPublished: [
      "Any hall rental price or per head catering figure",
      "Seating or standing capacity for any room",
      "A street address on the pages read",
    ],
    routesTo:
      "The club office by telephone, or an email form. The same gate again, in a building with no lanes in it.",
    sourceUrl: PHOENIX_BANQUETS,
    readOn: READ,
  },

  /*
    THE INDEPENDENT, AND THE THINNEST ROW IN THE FILE ON PURPOSE.

    Three chains agreeing about pricing could be a chain habit. An
    independent single site operator in a bordering city doing the same
    thing is the finding generalising, which is why this row is worth
    having even though almost nothing could be read off it.

    Only the home page would serve to an automated reader. It carries a
    telephone number for bookings and a claim about being cheap, and no
    address, no lane count and no figure of any kind. That is exactly
    what the row says. Nothing was borrowed from a directory to make it
    look fuller, because a register that pads its thin rows cannot be
    trusted on its full ones.
  */
  {
    id: "la-habra-300-bowl",
    name: "La Habra 300 Bowl",
    standing: "trade-area",
    address: "No street address on the page that could be read.",
    addressSource:
      "The operator's own home page publishes a telephone number and no address. Nothing was taken from a directory to fill the gap.",
    whyHere:
      "An independent single site house in a bordering city, in the register because it is not a chain. Three national operators all gating group pricing could be a corporate habit. A local independent doing the same thing means it is how the category sells, and that is the difference between a coincidence and a finding.",
    facts: [
      {
        label: "Bookings route to",
        value:
          "A telephone number, (562) 691-6721, given as the way to book",
        sourceUrl: LH_BOWL,
        readOn: READ,
        provenance: "public",
      },
      {
        label: "What it says about price",
        value:
          "It claims some of the cheapest prices around to bowl and states no figure of any kind",
        sourceUrl: LH_BOWL,
        readOn: READ,
        provenance: "public",
        caveat:
          "A claim about being cheap with no number attached is not a price and is not treated as one here.",
      },
    ],
    notPublished: [
      "Any per head group or party price",
      "Any open bowling or walk in price",
      "A lane count",
      "A street address on the page that could be read",
    ],
    routesTo:
      "A telephone call to the desk. No form, no figure, and no online quote.",
    sourceUrl: LH_BOWL,
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
 * competitive fact available to a venue that cannot shop a rate,
 * because it is published, it is specific, and it has a deadline that
 * a rep can sell against. It is also the fact most likely to be wrong
 * by the time anybody reads it, which is exactly why the register
 * carries its printed wording, the date it was read, and a standing
 * that is recomputed against whatever day the reader is on.
 *
 * THE YEAR IS AN INFERENCE AND IT IS LABELLED ONE. The page prints
 * "8/31" and "9/30" with no year on it. This register reads them as
 * 2026 because that is the year the page was open in. That is a
 * judgement, not a quotation, so it travels with the row.
 */
export const RIVAL_PROMOTIONS: RivalPromotion[] = [
  {
    id: "party15",
    rivalIds: ["lucky-strike-fullerton", "lucky-strike-orange"],
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
 * WHAT ACTUALLY BEATS THIS VENUE, ONE OBJECTION AT A TIME.
 *
 * `data/objections.ts` holds seven sentences a buyer says. This table
 * reads each of them against one question: is somebody else winning
 * this, or is the building losing it on its own?
 *
 * The classification lives here rather than on the objection, because
 * the objection register answers a different question and should not
 * carry a field only this screen reads. Each row states its reasoning
 * so a reader can argue with one line without discarding the lot.
 *
 * The answer, once the seven are laid out, is the argument this whole
 * screen exists to make. Four are the venue's own silence. Two are
 * somebody else's calendar. One names a competitor, and that
 * competitor has shared a parent company with Main Event since 2022,
 * which the objection's own recommended answer says out loud. Nothing
 * in the register is lost to a rival's price, because there is not a
 * published rival price anywhere in the category to lose to.
 */
export const OBJECTION_CAUSES: ObjectionCause[] = [
  {
    objectionId: "no-published-price",
    cause: "our-own-gap",
    because:
      "Main Event publishes no group price on purpose and Brea has no sales manager to quote one. No competitor is involved and none of them publishes a group price either.",
  },
  {
    objectionId: "no-opening-date",
    cause: "our-own-gap",
    because:
      "The building has no published opening date. A rival could vanish overnight and this objection would be exactly as hard.",
  },
  {
    objectionId: "cannot-tour",
    cause: "our-own-gap",
    because:
      "There is nothing finished to walk through yet. This is a fact about a construction site, not about anybody else's room.",
  },
  {
    objectionId: "unproven-venue",
    cause: "our-own-gap",
    because:
      "No reviews, no photographs, nobody who has been. A track record is accumulated rather than won off somebody.",
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
      "The money is not appropriated until the next fiscal year. Nobody is beating this venue on price because nobody is being paid yet.",
  },
  {
    objectionId: "we-use-dave-and-busters",
    cause: "a-named-competitor",
    because:
      "The only one of the seven where a buyer names another venue, and the register's own answer is not to attack it, because the two brands have shared a parent company since June 2022.",
  },
];

export const CAUSE_BY_OBJECTION: Record<string, ObjectionCause> =
  Object.fromEntries(OBJECTION_CAUSES.map((c) => [c.objectionId, c]));

/**
 * THE THREE LOSSES, ANNOTATED WHERE THE THREAD CANNOT SPEAK FOR ITSELF.
 *
 * Everything else on the loss register is derived: the date, the
 * reason, the channel it arrived on and whether the buyer or the seat
 * wrote it down all come straight out of `data/conversations.ts` and
 * move if the record moves. Two things do not derive, and both are
 * judgements, so they sit here with their reasoning attached rather
 * than being computed out of thin air in a selector.
 *
 * WHAT KIND OF LOSS IT IS. Only two of the seeded replies pin an
 * objection id, so a classification read solely off the reply file
 * would put two of the three losses in a default bucket and quietly
 * call that analysis. Each one is classified by hand instead, in one
 * sentence, and a reader can disagree with any single line.
 *
 * WHO THE BUYER NAMED, EXPRESSED AS A CLASS AND NEVER AS A BUSINESS.
 * The Fairway Ford thread says a hotel and names no hotel. Inventing
 * one would drop a real local business into this application as the
 * winner of a deal that never happened, which is precisely the sort of
 * invention this screen exists to refuse.
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
      "The client event was booked and paid for in July, two months before this venue had anybody to ask them. Lost on the calendar, not on the pitch, and the answer is to be in the conversation earlier next year.",
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
    why: "Six operators were opened and read on 14 August 2026, three chains and one independent among them, and not one publishes one. Every enquiry routes to a form, a planner or a telephone. There is no figure to record and there will not be one until somebody rings and asks, which is a first party fact rather than a published one.",
  },
  {
    claim: "Room capacities and floor areas for The Phoenix Club",
    why: "The banquet page names The Grand Ballroom and states no capacity. The individual room pages would not serve to an automated reader, so nothing was read off them and nothing is recorded from them.",
  },
  {
    claim: "A street address for The Phoenix Club from its own site",
    why: "Neither the home page nor the banquet page prints one. The address on the row comes from Google Places by way of the prospect record and is labelled as such rather than presented as first party.",
  },
  {
    claim: "Distances and drive times from Brea to any of these venues",
    why: "The venue coordinate is geocoded and none of these six is. A mileage produced by eye would be the one number on this page nobody could check, on the screen least able to afford it.",
  },
  {
    claim: "Lane counts, game counts or room counts for Round1 and Dave and Buster's",
    why: "Neither operator publishes them for the locations that matter here. Lucky Strike does publish lane counts, which is why only Lucky Strike carries one.",
  },
  {
    claim: "An address or a lane count for La Habra 300 Bowl",
    why: "Only its home page would serve to an automated reader and that page publishes neither. A directory would have supplied both and neither would have been first party, which is the standard that removed Round One Entertainment from the prospecting board in the first place.",
  },
  {
    claim: "Share of local group business, competitor booking pace, competitor win rates",
    why: "No data source exists for family entertainment party bookings in a four mile trade area. The hotel intelligence products cover hotel meetings and there is no equivalent here. A share figure would be invented outright.",
  },
  {
    claim: "A market trend time series",
    why: "The application has no history and neither does the building. What can be shown honestly is movement in the board's own status distribution, which is observed rather than fitted, and it lives on the screens that own it.",
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
 * results a rep will find for the Fullerton house still say Bowlero,
 * and knowing why saves a confused conversation.
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
    "The old bowlero.com address for the Fullerton house returns a 302 to the Lucky Strike location page, checked on 14 August 2026.",
  liveEvidenceFrom: "https://www.bowlero.com/location/bowlero-fullerton",
} as const;
