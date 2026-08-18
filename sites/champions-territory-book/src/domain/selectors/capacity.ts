import { groupProfile } from "@/domain/booking";
import type { BookLine, Prospect } from "@/domain/types";
import { VENUE } from "@/data/venue";
import { PACKAGE_BY_ID } from "@/data/packages";
import { crewSlotsForDoors, DOORS_PER_CREW_SLOT } from "@/domain/lanes";

/**
 * CAMPAIGN CAPACITY. The arithmetic that stops a marketing desk selling
 * a week the crew cannot run.
 *
 * The console this was adapted from counted rooms. A demand console
 * counts CREW DAYS, and the shape of the sum is identical: a fixed
 * number of slots in a day, a modelled number of properties one slot can
 * serve, and a campaign that lands on a date whether or not anybody is
 * free to run it.
 *
 * ── THE TWO NUMBERS, AND NEITHER OF THEM IS PUBLISHED ──────────────
 * Twenty six daily crew slots for the Brea branch, and twenty properties
 * to a slot. Champions Group publishes "over 1,800 field technicians"
 * across twenty two brands and no per-branch count anywhere, so both
 * figures are assumptions, they live in data/venue.ts and
 * domain/lanes.ts, and they are badged modeled on every screen that
 * divides by them. They are set low deliberately: a demand plan that
 * overstates the field generates work the trucks cannot run, which is
 * the one mistake a marketing manager cannot apologise their way out of.
 *
 * ── WHY THE SUM MATTERS IN AUGUST ──────────────────────────────────
 * Mid-August is the tail of peak cooling. July is the apex, AC repair
 * runs 266 per cent above baseline, and the mix skews to emergency full
 * system replacement, which swings 393 per cent. A replacement takes a
 * crew for a day; a tune-up takes an hour. So the constraint is never
 * the number of leads, it is the hours behind them, and a campaign that
 * fills the tail of the season with cheap tune-up demand while the crew
 * is buried on emergency replacements costs the company money twice.
 *
 * What this cannot know is the real crew count, the real job durations
 * or how many of the trucks are already committed. It is arithmetic on
 * stated assumptions, and every screen that reads it says so.
 */

export interface DayLoad {
  date: string;
  lanesHeld: number;
  lanesFree: number;
  utilisation: number;
  lines: BookLine[];
  /** True once a further job of typical size would not fit. */
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
      const lanesFree = VENUE.crewSlotsModelledFloor - lanesHeld;
      return {
        date,
        lanesHeld,
        lanesFree,
        utilisation: lanesHeld / VENUE.crewSlotsModelledFloor,
        lines,
        /* Below three free crew slots the only thing that still fits is
           a single small job, and most of what this pipeline carries is
           bigger than that. */
        effectivelyFull: lanesFree < 3,
      };
    });
}

/**
 * Can the field actually run this much work on this day?
 *
 * Returns a sentence rather than a boolean, because "no" without a
 * reason is the least useful answer a tool can give somebody who is
 * about to be on the phone to a property manager.
 */
export function fitCheck(
  book: BookLine[],
  date: string,
  guests: number,
): { fits: boolean; message: string } {
  const needed = crewSlotsForDoors(guests);
  const held = book
    .filter((l) => l.eventDate === date)
    .reduce((n, l) => n + l.lanesHeld, 0);
  const free = VENUE.crewSlotsModelledFloor - held;

  if (needed <= free) {
    return {
      fits: true,
      message: `${guests} properties needs ${needed} of the ${VENUE.crewSlotsModelledFloor} modelled crew slots. ${free - needed} would still be free on ${date}.`,
    };
  }
  return {
    fits: false,
    message: `${guests} properties needs ${needed} crew slots at the modelled one slot per twenty properties, and only ${free} are free on ${date}. Either move the date, split the work across two days, or lead with an offer that generates a lead without committing a crew visit.`,
  };
}

/**
 * The most properties the branch could serve in a single day with every
 * crew slot free.
 *
 * Worth stating plainly on the capacity screen because it is the figure
 * a marketing manager is asked for in the first thirty seconds of every
 * portfolio conversation, and it is not the same figure as the number of
 * doors a campaign can REACH. One is a field number and one is a media
 * number; quote either as the other and the answer is wrong by an order
 * of magnitude. Both are modelled here and neither is published.
 */
export const MAX_SIMULTANEOUS_BOWLERS =
  VENUE.crewSlotsModelledFloor * DOORS_PER_CREW_SLOT;

export interface PackagePressure {
  packageId: string;
  name: string;
  maxGuests: number | null;
  lanesAtMax: number | null;
  shareOfVenue: number | null;
  note: string;
}

/**
 * How much of a day's field capacity each campaign eats at its own
 * published ceiling. This is the table that makes the point in one read.
 */
export function packagePressure(): PackagePressure[] {
  return Object.values(PACKAGE_BY_ID)
    .filter((p) => p.lanesPerTwentyGuests)
    .map((p) => {
      const lanesAtMax = p.maxGuests ? crewSlotsForDoors(p.maxGuests) : null;
      const share = lanesAtMax
        ? lanesAtMax / VENUE.crewSlotsModelledFloor
        : null;
      return {
        packageId: p.id,
        name: p.name,
        maxGuests: p.maxGuests,
        lanesAtMax,
        shareOfVenue: share,
        note:
          share === null
            ? "No published ceiling, so there is nothing to compute a share against."
            : share > 0.5
              ? `At its published ceiling this one campaign takes ${Math.round(share * 100)}% of a day's crew slots. Two of them landing on one day is the whole branch.`
              : `At its published ceiling this campaign takes ${Math.round(share * 100)}% of a day's crew slots.`,
      };
    })
    .sort((a, b) => (b.shareOfVenue ?? 0) - (a.shareOfVenue ?? 0));
}

/**
 * What the live pipeline would do to the field if every open conversation
 * converted at its modeled midpoint number of properties.
 *
 * Not a forecast. A stress test, and labelled as one everywhere it is
 * printed. The useful reading is never the total; it is finding out that
 * the demand is pointed at a fortnight the crew is already committed
 * through, which is a scheduling answer rather than a hiring one.
 */
export function pipelinePressure(
  prospects: Prospect[],
): { lanes: number; guests: number; note: string } {
  /* A row with no property profile contributes nothing to pressure
     rather than contributing a zero. See domain/booking.ts: not
     applicable and none are different findings, and only one of them is
     true of a competitor row or a sister brand. */
  const guests = prospects.reduce((n, p) => n + (groupProfile(p)?.mid ?? 0), 0);
  const lanes = prospects.reduce((n, p) => {
    const g = groupProfile(p);
    return g ? n + crewSlotsForDoors(g.mid) : n;
  }, 0);
  return {
    lanes,
    guests,
    note: `If all ${prospects.length} converted at their modeled midpoints, that is ${guests} properties and ${lanes} crew slots. The branch is modelled at ${VENUE.crewSlotsModelledFloor} slots a day, so this is ${Math.round((lanes / VENUE.crewSlotsModelledFloor) * 10) / 10} full days of field work spread across the season rather than a problem on one date.`,
  };
}
