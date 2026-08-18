import type { Lane } from "@/domain/types";
import type { Seat, SeatId } from "@/domain/seats";

/**
 * THE DESK, SEEDED. THREE SEATS, ONE OF THEM FILLED.
 *
 * ── WHERE THE TITLES COME FROM ────────────────────────────────────
 * Both titles are published on Champions Group Holdings' own Greenhouse
 * board. Seat one is "Marketing Manager (Temp to Hire)", Brea CA, posted
 * at 120,000 to 125,000 dollars and reporting to the Director, Marketing
 * for West Division. Seats two and three carry "Digital Marketing
 * Specialist", Brea CA, posted at 70,500 to 72,000, whose published
 * scope is Local Services Ads, Yelp and HomeAdvisor speed-to-lead,
 * Google reporting and call answer rates. No title on this desk was
 * invented, exactly as no buyer title anywhere in `prospects.ts` was
 * invented.
 *
 * ── WHY SEAT ONE IS THE DISCRETIONARY SEAT ────────────────────────
 * The split is not three equal thirds. Each seat is one WAY OF WORKING,
 * because a service line carries a motion with it and mixing motions
 * inside one seat produces a week nobody can plan:
 *
 *   Seat 1  145 organisations: the multi-service operators, the drain
 *           and sewer specialists, and every employer and hospitality
 *           partner in the territory. It holds all seven of the group's
 *           own brands and thirty direct rivals, so it is the seat that
 *           has to know what the division publishes and what the market
 *           publishes back. Forty of its rows publish an email address
 *           and eighty-one publish nothing written at all.
 *
 *   Seat 2  80 organisations, every one of them a competitor, across
 *           heating and air conditioning, plumbing and electrical. Not
 *           one of the eighty publishes an email address, because you
 *           do not write to a rival, you read their coupon page every
 *           fortnight and price against it. One buyer class, one
 *           motion, and the tightest brief on the desk.
 *
 *   Seat 3  104 organisations: property and referral partners, the
 *           schools, faith and civic surfaces, and the water heater
 *           line. Fifty-three of them publish an address, which is the
 *           best written-door ratio of the three seats, because
 *           institutions publish staff directories either because they
 *           are obliged to or because it wins them business.
 *
 * Those three counts are derived from `PROSPECTS` at render rather than
 * typed here, so a service line moving between seats moves every figure
 * on the desk screen with it.
 *
 * ── WHAT THIS ARRANGEMENT GETS WRONG ──────────────────────────────
 * Champions Group publishes no marketing headcount for the West
 * Division and no organisation chart, so three seats is this console's
 * own arithmetic rather than an observation. The published board shows
 * one Marketing Manager opening and one Digital Marketing Specialist
 * opening in Brea; splitting the specialist work into two seats is a
 * planning choice made to show what the territory would need, not a
 * claim about what is budgeted.
 *
 * ── EVERYTHING BELOW EXCEPT THE TITLES IS ILLUSTRATIVE ────────────
 * The start date, the signoff dates and the signing role are this
 * application's own, invented for the prototype, and they are badged as
 * such wherever they are shown. They are not a claim about how the West
 * Division staffs a marketing desk.
 */

const POSTING =
  "Champions Group Holdings' own Greenhouse board, read on 18 August 2026: job-boards.greenhouse.io/championsgroupholdings, postings 5372146008 (Marketing Manager, Temp to Hire) and 5365134008 (Digital Marketing Specialist)";

/**
 * The seat this session is operated from.
 *
 * There is exactly one filled seat, so every touch, every shift and
 * every status change in this prototype is made by it. It is named once
 * here rather than being assumed at five call sites.
 */
export const ACTING_SEAT_ID: SeatId = "seat-1";

export const SEATS: Seat[] = [
  {
    id: "seat-1",
    seatNumber: 1,
    title: "Marketing Manager",
    titleSource: POSTING,
    state: "filled",
    /*
      The first day of the first campaign period in `venue.ts`, which is
      16 weeks out from the autumn heating launch. The book's own header
      says two signed lines twelve weeks out is "roughly where a
      territory gets to once one person has worked it for a few weeks",
      and this is those weeks.
    */
    startedOn: "2026-08-17",
    lanes: ["multi-service", "drain-sewer", "partner-employer"],
    lanesBecause:
      "Every line here is discretionary: nothing forces a household or an employer to act, so demand has to be created rather than caught. It is also the seat holding the group's own seven brands, and the one commercial question the whole console turns on sits inside it, which is that not one brand in this market publishes what its membership costs.",
    brief:
      "Own the brands, own the offer, and cover the two open seats until they are filled.",
    rampSignoffs: [
      { stepId: "price-line", on: "2026-08-17", byRole: "Director of Marketing, West Division" },
      { stepId: "two-ledgers", on: "2026-08-17", byRole: "Director of Marketing, West Division" },
      { stepId: "buyer-class", on: "2026-08-18", byRole: "Director of Marketing, West Division" },
      { stepId: "eight-doors", on: "2026-08-19", byRole: "Director of Marketing, West Division" },
      { stepId: "lane-arithmetic", on: "2026-08-20", byRole: "Director of Marketing, West Division" },
      { stepId: "objections", on: "2026-08-25", byRole: "Director of Marketing, West Division" },
      { stepId: "go-see", on: "2026-08-27", byRole: "Director of Marketing, West Division" },
    ],
  },
  {
    id: "seat-2",
    seatNumber: 2,
    title: "Digital Marketing Specialist",
    titleSource: POSTING,
    state: "open",
    startedOn: null,
    lanes: ["hvac", "plumbing", "electrical"],
    lanesBecause:
      "All three lines are non-discretionary, so the call arrives whether or not anybody markets to it and the only question is whose number is on the screen when it does. Rank, reviews and answer rate are bought in May and spent in August, which is why this is the expensive seat to leave open.",
    brief:
      "Hold the paid and local search position on the three core service lines, and read every rival's published price the week it changes.",
    rampSignoffs: [],
  },
  {
    id: "seat-3",
    seatNumber: 3,
    title: "Digital Marketing Specialist",
    titleSource: POSTING,
    state: "open",
    startedOn: null,
    lanes: ["partner-property", "partner-community", "water-heater"],
    lanesBecause:
      "The partnerships. A property manager standing next to a failing system is worth more than any impression, and a quarter of these organisations publish no email at all, so the work is a route driven in an afternoon rather than a list worked from a chair.",
    brief:
      "Walk the territory. Turn the organisations with no written door into referral relationships, and the relationships into calls.",
    rampSignoffs: [],
  },
];

export const SEAT_ORDER: SeatId[] = SEATS.map((s) => s.id);

export const SEAT_BY_ID: Record<SeatId, Seat> = Object.fromEntries(
  SEATS.map((s) => [s.id, s]),
) as Record<SeatId, Seat>;

/** The seat a service line is assigned to. Every line belongs to one. */
export function seatOwningLane(lane: Lane): Seat | null {
  return SEATS.find((s) => s.lanes.includes(lane)) ?? null;
}

/**
 * THE SEAT ACTUALLY WORKING A SERVICE LINE TODAY, WHICH IS NOT ALWAYS
 * THE SEAT IT IS ASSIGNED TO.
 *
 * Two of the three seats are open, and the work in their service lines
 * does not stop because nobody has been hired. It falls to the filled
 * seat, which is what "covering" means on any desk and what every
 * seeded activity line already says: all ten of them belong to seat 1.
 *
 * The permission follows the seat doing the work rather than the service
 * line, and that is the correct way round. Whether a person may commit
 * crew capacity is a fact about what they have been signed off on, not
 * about which line the organisation happens to sit in. A signed-off
 * manager covering plumbing may commit a plumbing date.
 */
export function workingSeatForLane(lane: Lane): Seat | null {
  const owner = seatOwningLane(lane);
  if (owner && owner.state === "filled") return owner;
  return SEATS.find((s) => s.state === "filled") ?? null;
}

/** "Marketing Manager, seat 1". A title and an ordinal, never a name. */
export function seatLabel(seatId: SeatId): string {
  const seat = SEAT_BY_ID[seatId];
  return seat ? `${seat.title}, seat ${seat.seatNumber}` : seatId;
}
