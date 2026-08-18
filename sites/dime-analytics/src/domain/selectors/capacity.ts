import type { BookLine, Prospect } from "@/domain/types";
import { VENUE } from "@/data/venue";
import { PACKAGE_BY_ID } from "@/data/packages";
import { lanesForGuests, GUESTS_PER_BOWLING_LANE } from "@/domain/lanes";

/**
 * CAPACITY. The screen that stops a sales manager promising the same
 * Friday to three people.
 *
 * HALF OF THIS ARITHMETIC NOW HAS NO SECOND NUMBER, AND SAYING SO IS
 * THE POINT OF THE FILE.
 *
 * The ratio still holds. One lane per twenty guests is a published
 * industry-standard way to size a group, and every lane figure below is
 * still computed from it, so a headcount still turns into a number of
 * lanes and that number is still worth knowing. What has gone is the
 * denominator. DIME publishes no bowling lane count for any location
 * in the country, including Lakewood Center, the nearest store to the
 * office this app is centred on. Without a house total there is no
 * utilisation, no share of the floor, no lanes free and no largest
 * group that still fits.
 *
 * THE OBVIOUS WRONG ANSWER WAS TO CARRY A COMPETITOR'S FLOOR ACROSS.
 * The fork this was built from divided every figure here by a lane count
 * another operator publishes for a building in another city. Dividing a
 * DIME lane-hold by it would produce a percentage that looks
 * calculated, reads as authoritative and is about nothing at all, and a
 * DIME reader would be entitled to assume every other figure in this
 * document was made the same way.
 *
 * So the computations that need the total return null and the screens
 * render the withheld sentence in place of a figure. The arithmetic is
 * left in the file, guarded rather than deleted, because the method is
 * sound and it is the operator that withholds the input. A reader
 * assessing this document can see exactly what would be computed the
 * moment somebody rings the store and gets an answer.
 */

/**
 * The house total, which is null, kept behind a `number | null` type
 * rather than a literal so every consumer is forced through the branch.
 */
const LANES_PUBLISHED: number | null = VENUE.bowlingLanesPublished;

/**
 * The sentence every caller shows where a figure used to be. One string
 * so that fourteen screens cannot drift into fourteen slightly
 * different accounts of the same absence.
 */
export const NO_LANE_COUNT_REASON =
  "DIME publishes no bowling lane count for any location, including Lakewood Center, the nearest store to this office. There is no house total to divide by, so this is a size and not a share. The figure comes from the store, not from a page.";

export interface DayLoad {
  date: string;
  lanesHeld: number;
  /**
   * Lanes still free on the date, which is null because it is the house
   * total minus the lanes held and the house total is unpublished.
   */
  lanesFree: number | null;
  /** Held over the house total, so null for the same reason. */
  utilisation: number | null;
  lines: BookLine[];
  /**
   * True once a further booking of typical size would not fit, and null
   * where that cannot be worked out at all.
   *
   * This is a threshold rather than a figure, and a threshold with no
   * ceiling under it does not fire. Null rather than false, because
   * false is a reading that says there is room and this is the absence
   * of any reading. A screen that printed "room on this date" off an
   * unpublished lane count would be making the promise this whole
   * application exists to stop.
   */
  effectivelyFull: boolean | null;
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
      /* The subtraction and the division are both still right. They are
         guarded rather than removed so the method stays readable, and
         they start working again the day a lane count is published. */
      const lanesFree =
        LANES_PUBLISHED === null ? null : LANES_PUBLISHED - lanesHeld;
      return {
        date,
        lanesHeld,
        lanesFree,
        utilisation:
          LANES_PUBLISHED === null ? null : lanesHeld / LANES_PUBLISHED,
        lines,
        /* Below three free lanes, the only thing that still fits is a
           group of sixty, and most of the pipeline is bigger than that.
           With no house total there are no free lanes to count, so the
           threshold cannot be tested and the warning does not fire. */
        effectivelyFull: lanesFree === null ? null : lanesFree < 3,
      };
    });
}

/**
 * The answer a fit check can give, which is now three-valued.
 *
 * `fits` is null where the question cannot be answered at all. That is
 * a different thing from no, and collapsing the two would be the most
 * expensive shortcut in the file: "does not fit" turns a group away on
 * arithmetic nobody did, and "fits" promises an evening on the same
 * missing number. Null forces the screen to say which of the two
 * questions it is actually failing to answer.
 */
export interface FitVerdict {
  fits: boolean | null;
  message: string;
}

/**
 * Can this venue physically take this booking on this date?
 *
 * Returns a sentence rather than a boolean, because "no" without a
 * reason is the least useful answer a tool can give somebody who is
 * about to be on the phone. It now sometimes returns a sentence and no
 * verdict at all, which is the honest shape of the question here: how
 * many lanes a group needs is arithmetic, how many lanes exist is a
 * fact DIME keeps to itself, and only the first half can be done off
 * a web page.
 */
export function fitCheck(
  book: BookLine[],
  date: string,
  guests: number,
): FitVerdict {
  const needed = lanesForGuests(guests);
  const held = book
    .filter((l) => l.eventDate === date)
    .reduce((n, l) => n + l.lanesHeld, 0);
  /* Free lanes are the house total minus what is held. The house total
     is unpublished, so there is nothing to subtract from and the
     comparison below never runs. */
  const free = LANES_PUBLISHED === null ? null : LANES_PUBLISHED - held;

  if (free === null) {
    return {
      fits: null,
      message: `${guests} guests needs ${needed} lanes at one lane per ${GUESTS_PER_BOWLING_LANE}, and ${held} ${held === 1 ? "lane is" : "lanes are"} already held on ${date}. Whether that fits cannot be checked here, because DIME publishes no lane count for any location and there is no house total to hold it against. Ask the store how many lanes it has and the rest of this answer follows immediately.`,
    };
  }

  if (needed <= free) {
    return {
      fits: true,
      message: `${guests} guests needs ${needed} of the ${LANES_PUBLISHED} published lanes. ${free - needed} would still be free on ${date}.`,
    };
  }
  return {
    fits: false,
    message: `${guests} guests needs ${needed} lanes at one lane per ${GUESTS_PER_BOWLING_LANE}, and only ${free} are free on ${date}. Either move the date, split the group across two sittings, or sell it as a package that does not hold lanes.`,
  };
}

/**
 * The largest group that could bowl at one time, which is null.
 *
 * It is the lane count times the guests per lane, and it is worth
 * stating plainly on the capacity screen because it is the figure a
 * sales manager gets asked in the first thirty seconds of every buyout
 * conversation. The multiplication is left here and guarded rather than
 * deleted, because it is the right multiplication and it is missing one
 * of its two operands.
 *
 * The fork printed a precise number here, being a competitor's
 * published lane count at twenty guests each. Carrying that across would
 * have put an exact capacity for somebody else's building on a DIME
 * screen, which is the worst single error this document could make: it
 * is checkable, it is
 * wrong, and it is exactly the sort of figure a reader repeats down a
 * phone before anybody catches it.
 */
export const MAX_SIMULTANEOUS_BOWLERS: number | null =
  LANES_PUBLISHED === null ? null : LANES_PUBLISHED * GUESTS_PER_BOWLING_LANE;

export interface PackagePressure {
  packageId: string;
  name: string;
  maxGuests: number | null;
  /** Still real. A headcount times the published ratio needs no house total. */
  lanesAtMax: number | null;
  /**
   * The share of the building that package would take, which is null
   * for every row.
   *
   * A share is a fraction and the denominator is unpublished. Rendering
   * it as zero per cent, or quietly dividing by the lane count the fork
   * inherited from a competitor's page, would both produce a confident
   * percentage about a building nobody has measured. The
   * number of lanes stays, because that half is genuinely computed; the
   * proportion goes, because that half was never ours to state.
   */
  shareOfVenue: number | null;
  note: string;
}

/**
 * How many lanes each package eats at its own published maximum, and
 * how much of the building that is, where either half can be said at
 * all. Neither can, today, and the empty table is the finding.
 *
 * The filter below wants a package that publishes a lane ratio and a
 * guest maximum. DIME's one package publishes neither, so this returns
 * an empty list rather than a row of dashes. The screen that reads it
 * has to say why it is empty, which is a better sentence than any table
 * this function could have produced.
 */
export function packagePressure(): PackagePressure[] {
  return Object.values(PACKAGE_BY_ID)
    .filter((p) => p.lanesPerTwentyGuests)
    .map((p) => {
      const lanesAtMax = p.maxGuests ? lanesForGuests(p.maxGuests) : null;
      /* Lanes over the house total. The fork had both operands and this
         one has neither, so the division is kept and guarded rather than
         deleted, ready for the day somebody rings the store and records
         an observed count. */
      const share =
        lanesAtMax && LANES_PUBLISHED !== null
          ? lanesAtMax / LANES_PUBLISHED
          : null;
      return {
        packageId: p.id,
        name: p.name,
        maxGuests: p.maxGuests,
        lanesAtMax,
        shareOfVenue: share,
        note:
          lanesAtMax === null
            ? "No published maximum, so there is no ceiling to compute against."
            : share === null
              ? `At its published maximum this package holds ${lanesAtMax} ${lanesAtMax === 1 ? "lane" : "lanes"}. What share of the house that is cannot be said, because DIME publishes no lane count for any location.`
              : share > 0.5
                ? `At its published maximum this one package takes ${Math.round(share * 100)}% of the lanes. Two of them on a night is the building.`
                : `At its published maximum this package takes ${Math.round(share * 100)}% of the lanes.`,
      };
    })
    /* Sorted on lanes rather than on share. The share was only ever the
       lane count divided by a constant, so this is the same order the
       table always had and it survives the denominator going away. */
    .sort((a, b) => (b.lanesAtMax ?? 0) - (a.lanesAtMax ?? 0));
}

/**
 * What the current pipeline would do to the calendar if every live
 * conversation converted at its modeled midpoint headcount.
 *
 * Not a forecast. A stress test, and labelled as one. The useful reading
 * is not the total; it is finding out that the pipeline is already
 * pointed at three dates in December and one of them cannot hold it.
 */
export interface PipelinePressure {
  lanes: number;
  guests: number;
  /**
   * The lane-holds expressed as whole evenings of the house, which is
   * null because an evening of the house is not a published quantity.
   *
   * This was the reading that mattered: a hundred and twenty lane-holds
   * sounds like a building four times too small until you divide by the
   * house and find it is five evenings, which is a spread problem and
   * not a size one. That reading is gone until somebody publishes a
   * lane count, and inventing a denominator to keep the conclusion
   * would be arguing from a number we made up to a point we wanted.
   */
  eveningsOfBowling: number | null;
  note: string;
}

export function pipelinePressure(prospects: Prospect[]): PipelinePressure {
  const guests = prospects.reduce(
    (n, p) => n + Math.round((p.headcountLow + p.headcountHigh) / 2),
    0,
  );
  const lanes = prospects.reduce(
    (n, p) => n + lanesForGuests(Math.round((p.headcountLow + p.headcountHigh) / 2)),
    0,
  );
  /* Lane-holds over the house total, rounded to one decimal. Kept and
     guarded, because the division is the right one and the denominator
     is the operator's to publish. */
  const evenings =
    LANES_PUBLISHED === null
      ? null
      : Math.round((lanes / LANES_PUBLISHED) * 10) / 10;
  return {
    lanes,
    guests,
    eveningsOfBowling: evenings,
    note:
      evenings === null
        ? `If all ${prospects.length} converted at their modeled midpoints, that is ${guests} guests and ${lanes} lane-holds. How many evenings of bowling that is cannot be worked out, because DIME publishes no lane count for any location and there is no house to divide the holds across. The pressure is real, the denominator is not published, and the two should not be mixed.`
        : `If all ${prospects.length} converted at their modeled midpoints, that is ${guests} guests and ${lanes} lane-holds. The venue has ${LANES_PUBLISHED} lanes, so this is ${evenings} full evenings of bowling, not a scheduling problem on one night.`,
  };
}
