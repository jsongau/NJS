import type { BookLine, Prospect } from "@/domain/types";
import { VENUE } from "@/data/venue";
import { PACKAGE_BY_ID } from "@/data/packages";
import { lanesForGuests, GUESTS_PER_BOWLING_LANE } from "@/domain/lanes";

/**
 * CAPACITY. The screen that stops a sales manager promising the same
 * Friday to three people.
 *
 * All of this arithmetic is Main Event's own. They publish "1 lane per
 * 20 guests" on the All Access Pass, the MVP package and Level Up. Brea
 * publishes "more than 26 lanes". The only judgement made here is to
 * compute against the published FLOOR of 26 rather than a guess at the
 * true count, so every figure understates the building and none of them
 * can oversell it.
 *
 * The consequence is not obvious until you do the multiplication, which
 * is exactly why it belongs on a screen: a 300-guest corporate All
 * Access Pass, the published maximum for that package, consumes
 * FIFTEEN LANES. That is 58% of the floor. Two of them on one evening is
 * the whole venue, and the second one has to be told no.
 *
 * A venue that has not opened has no history to warn anybody about this.
 * It has arithmetic, and this is the arithmetic.
 */

export interface DayLoad {
  date: string;
  lanesHeld: number;
  lanesFree: number;
  utilisation: number;
  lines: BookLine[];
  /** True once a further booking of typical size would not fit. */
  effectivelyFull: boolean;
}

export function dayLoads(book: BookLine[]): DayLoad[] {
  const byDate = new Map<string, BookLine[]>();
  for (const l of book) {
    const bucket = byDate.get(l.eventDate) ?? [];
    bucket.push(l);
    byDate.set(l.eventDate, bucket);
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, lines]) => {
      const lanesHeld = lines.reduce((n, l) => n + l.lanesHeld, 0);
      const lanesFree = VENUE.bowlingLanesPublishedFloor - lanesHeld;
      return {
        date,
        lanesHeld,
        lanesFree,
        utilisation: lanesHeld / VENUE.bowlingLanesPublishedFloor,
        lines,
        /* Below three free lanes, the only thing that still fits is a
           group of sixty, and most of the pipeline is bigger than that. */
        effectivelyFull: lanesFree < 3,
      };
    });
}

/**
 * Can this venue physically take this booking on this date?
 *
 * Returns a sentence rather than a boolean, because "no" without a
 * reason is the least useful answer a tool can give somebody who is
 * about to be on the phone.
 */
export function fitCheck(
  book: BookLine[],
  date: string,
  guests: number,
): { fits: boolean; message: string } {
  const needed = lanesForGuests(guests);
  const held = book
    .filter((l) => l.eventDate === date)
    .reduce((n, l) => n + l.lanesHeld, 0);
  const free = VENUE.bowlingLanesPublishedFloor - held;

  if (needed <= free) {
    return {
      fits: true,
      message: `${guests} guests needs ${needed} of the ${VENUE.bowlingLanesPublishedFloor} published lanes. ${free - needed} would still be free on ${date}.`,
    };
  }
  return {
    fits: false,
    message: `${guests} guests needs ${needed} lanes at Main Event's own 1-per-20 rule, and only ${free} are free on ${date}. Either move the date, split the group across two sittings, or sell it as a package that does not hold lanes.`,
  };
}

/**
 * The largest single group the venue could take on an empty day.
 *
 * Worth stating plainly on the capacity screen because it is the number
 * a sales manager gets asked in the first thirty seconds of every
 * buyout conversation, and it is not the number on the package page.
 * Main Event publishes a maximum of 800+ for a full facility buyout;
 * the published lane floor supports 520 guests bowling at once. Both are
 * true, and they describe different things, which is precisely the sort
 * of distinction that gets lost when nobody has written it down.
 */
export const MAX_SIMULTANEOUS_BOWLERS =
  VENUE.bowlingLanesPublishedFloor * GUESTS_PER_BOWLING_LANE;

export interface PackagePressure {
  packageId: string;
  name: string;
  maxGuests: number | null;
  lanesAtMax: number | null;
  shareOfVenue: number | null;
  note: string;
}

/**
 * How much of the building each package eats at its own published
 * maximum. This is the table that makes the point in one read.
 */
export function packagePressure(): PackagePressure[] {
  return Object.values(PACKAGE_BY_ID)
    .filter((p) => p.lanesPerTwentyGuests)
    .map((p) => {
      const lanesAtMax = p.maxGuests ? lanesForGuests(p.maxGuests) : null;
      const share = lanesAtMax
        ? lanesAtMax / VENUE.bowlingLanesPublishedFloor
        : null;
      return {
        packageId: p.id,
        name: p.name,
        maxGuests: p.maxGuests,
        lanesAtMax,
        shareOfVenue: share,
        note:
          share === null
            ? "No published maximum, so there is no ceiling to compute against."
            : share > 0.5
              ? `At its published maximum this one package takes ${Math.round(share * 100)}% of the lane floor. Two of them on a night is the building.`
              : `At its published maximum this package takes ${Math.round(share * 100)}% of the lane floor.`,
      };
    })
    .sort((a, b) => (b.shareOfVenue ?? 0) - (a.shareOfVenue ?? 0));
}

/**
 * What the current pipeline would do to the calendar if every live
 * conversation converted at its modeled midpoint headcount.
 *
 * Not a forecast. A stress test, and labelled as one. The useful reading
 * is not the total; it is finding out that the pipeline is already
 * pointed at three dates in December and one of them cannot hold it.
 */
export function pipelinePressure(
  prospects: Prospect[],
): { lanes: number; guests: number; note: string } {
  const guests = prospects.reduce(
    (n, p) => n + Math.round((p.headcountLow + p.headcountHigh) / 2),
    0,
  );
  const lanes = prospects.reduce(
    (n, p) => n + lanesForGuests(Math.round((p.headcountLow + p.headcountHigh) / 2)),
    0,
  );
  return {
    lanes,
    guests,
    note: `If all ${prospects.length} converted at their modeled midpoints, that is ${guests} guests and ${lanes} lane-holds. The venue has ${VENUE.bowlingLanesPublishedFloor} lanes, so this is ${Math.round((lanes / VENUE.bowlingLanesPublishedFloor) * 10) / 10} full evenings of bowling, not a scheduling problem on one night.`,
  };
}
