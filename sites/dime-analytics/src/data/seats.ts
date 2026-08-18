import type { Lane } from "@/domain/types";
import type { Seat, SeatId } from "@/domain/seats";

/**
 * THE FLOOR, SEEDED. THREE SEATS, ONE OF THEM FILLED.
 *
 * ── WHERE THE TITLES COME FROM ────────────────────────────────────
 * Both titles are published in the posting this work sample was written
 * for, whose heading is "New Business Development Promotion Planner
 * Manager / Senior Manager". The two grades in that heading are the two
 * titles on this floor. No title here was invented, exactly as no buyer
 * title anywhere in `prospects.ts` was invented.
 *
 * ── WHY SEAT ONE IS THE DISCRETIONARY SEAT ────────────────────────
 * The split is not three equal thirds. Each seat is one WAY OF WORKING,
 * because a lane carries a motion with it and mixing motions inside one
 * seat produces a week nobody can plan:
 *
 *   Seat 1  40 organisations, every one of them discretionary. Corporate,
 *           auto and finance, hospitality and civic. No price is
 *           published for any of it, so the number comes from a person
 *           and that person is the senior seat. It is also the seat that
 *           carries the referral lane, which converts on a visit rather
 *           than on a call and cannot be handed to somebody in week one.
 *
 *   Seat 2  26 organisations, every one of them calendar-locked. Schools,
 *           colleges, youth sports. One buyer class, one call frame, one
 *           set of windows that shut whether or not anybody rang. It is
 *           also the most reachable seat on the floor: 14 of its 26
 *           publish an address that was read off their own site.
 *
 *   Seat 3  36 organisations and the doors. Faith and nonprofit,
 *           healthcare, local retail and food. 21 of its 36 publish no
 *           email anywhere, which makes it a walking route rather than a
 *           list of accounts, and a route is a full seat's work.
 *
 * Those three counts are derived from `PROSPECTS` at render rather than
 * typed here, so a lane moving between seats moves every figure on the
 * floor screen with it.
 *
 * ── EVERYTHING BELOW EXCEPT THE TITLES IS ILLUSTRATIVE ────────────
 * The start date, the signoff dates and the signing role are this
 * application's own, invented for the prototype, and they are badged as
 * such wherever they are shown. They are not a claim about how DIME
 * staffs anything.
 */

const POSTING =
  "The DIME posting headed \"New Business Development Promotion Planner Manager / Senior Manager\", quoted in the brief this application was built against";

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
    title: "Promotion Planner Senior Manager",
    titleSource: POSTING,
    state: "filled",
    /*
      The first day of the first period in `venue.ts`. Everything on the
      board is worked forward from it, so a reader can see how far a
      single seat gets in a quarter rather than having to take a claim
      about it on trust.
    */
    startedOn: "2026-08-17",
    lanes: ["corporate", "auto-finance", "hospitality-civic"],
    lanesBecause:
      "Every lane here is discretionary, which means there is no event until somebody decides there is one, and no price is published for the one package they can buy. Both halves of that are the senior seat's job rather than a new starter's.",
    brief:
      "Carry the unpriced end of the range and the referral lane, and cover the two open seats until they are filled.",
    rampSignoffs: [
      { stepId: "price-line", on: "2026-08-17", byRole: "General Manager" },
      { stepId: "two-ledgers", on: "2026-08-17", byRole: "General Manager" },
      { stepId: "buyer-class", on: "2026-08-18", byRole: "General Manager" },
      { stepId: "eight-doors", on: "2026-08-19", byRole: "General Manager" },
      { stepId: "lane-arithmetic", on: "2026-08-20", byRole: "General Manager" },
      { stepId: "objections", on: "2026-08-25", byRole: "General Manager" },
      { stepId: "go-see", on: "2026-08-27", byRole: "General Manager" },
    ],
  },
  {
    id: "seat-2",
    seatNumber: 2,
    title: "Promotion Planner Manager",
    titleSource: POSTING,
    state: "open",
    startedOn: null,
    lanes: ["schools", "colleges", "fitness-youth-sports"],
    lanesBecause:
      "All three lanes are calendar-locked, so this seat runs one call frame against buyers whose event happens whether or not anybody rings. It is the seat whose windows shut on somebody else's calendar, which is why it is the expensive one to leave open.",
    brief:
      "Work the buyers whose date is already fixed, from the published directories, in the months their windows are open.",
    rampSignoffs: [],
  },
  {
    id: "seat-3",
    seatNumber: 3,
    title: "Promotion Planner Manager",
    titleSource: POSTING,
    state: "open",
    startedOn: null,
    lanes: ["faith-nonprofit", "healthcare", "local-retail-food"],
    lanesBecause:
      "The doors. Most of these organisations publish no email at all, the buyer is standing at a counter or a reception desk, and the work is a route driven in an afternoon rather than a list worked from a chair.",
    brief:
      "Walk the trade area. Turn the organisations with no written door into conversations, and the conversations into dates.",
    rampSignoffs: [],
  },
];

export const SEAT_ORDER: SeatId[] = SEATS.map((s) => s.id);

export const SEAT_BY_ID: Record<SeatId, Seat> = Object.fromEntries(
  SEATS.map((s) => [s.id, s]),
) as Record<SeatId, Seat>;

/** The seat a lane is assigned to. Every lane belongs to exactly one. */
export function seatOwningLane(lane: Lane): Seat | null {
  return SEATS.find((s) => s.lanes.includes(lane)) ?? null;
}

/**
 * THE SEAT ACTUALLY WORKING A LANE TODAY, WHICH IS NOT ALWAYS THE SEAT
 * IT IS ASSIGNED TO.
 *
 * Two of the three seats are open, and the work in their lanes does not
 * stop because nobody has been hired. It falls to the filled seat, which
 * is what "covering" means on any floor and what every seeded activity
 * line already says: all ten of them belong to seat 1.
 *
 * The permission follows the seat doing the work rather than the lane,
 * and that is the correct way round. Whether a person may hold a date is
 * a fact about what they have been signed off on, not about which lane
 * the organisation happens to sit in. A signed-off manager covering
 * schools may hold a school date.
 */
export function workingSeatForLane(lane: Lane): Seat | null {
  const owner = seatOwningLane(lane);
  if (owner && owner.state === "filled") return owner;
  return SEATS.find((s) => s.state === "filled") ?? null;
}

/** "Sales Manager, seat 1". A title and an ordinal, never a name. */
export function seatLabel(seatId: SeatId): string {
  const seat = SEAT_BY_ID[seatId];
  return seat ? `${seat.title}, seat ${seat.seatNumber}` : seatId;
}
