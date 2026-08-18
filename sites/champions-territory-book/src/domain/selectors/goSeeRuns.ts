import type { MapRow } from "@/domain/selectors/mapBoard";
import { headcountMidpoint } from "@/domain/selectors/mapBoard";

/**
 * GO-SEE RUNS. The one thing a map knows that a ranked list cannot.
 *
 * A go-see is the part of local marketing that does not happen at a
 * keyboard: an HOA board meeting, a property management office, a chamber
 * of commerce morning, a community event a brand could sponsor. Those are
 * doors that open to a person standing in front of them and to almost
 * nothing else, and the cost of one is the drive rather than the ask.
 *
 * WHY THIS FILE EXISTS. The desk ranks three hundred and twenty nine
 * organisations by what each one is worth on its own, and it is right to.
 * What it cannot see is that four of the organisations sitting at ranks
 * 31, 47, 58 and 74 are three hundred yards apart on the same road, and
 * that the afternoon which visits one of them can visit all four for the
 * cost of parking once. That is not a refinement of the ranking. It is a
 * different resource being spent: the desk spends attention, and a run
 * spends hours out of the office, which is the only genuinely scarce
 * thing a marketing manager working a territory has.
 *
 * Without this, the board is a prettier list. Two hundred pins scattered
 * over a basemap tell a reader where things are, which they already knew,
 * and the geography does no work at all.
 *
 * ── WHO IS IN A RUN, AND WHY IT IS NOT EVERYBODY ──────────────────
 * Only organisations with no published email address. Ninety three of the
 * three hundred and twenty nine publish one, and those cost two minutes from a
 * desk wherever they happen to sit, so putting them in a driving route
 * spends an hour buying something a keystroke already bought. The other
 * hundred and eighteen are reachable through a form or through a front
 * desk, and for those the trip IS the channel. That rule is the same one
 * the desk scores on, read the other way round, rather than a second
 * opinion about reachability.
 *
 * Anything already booked or already lost is out. Neither is work to be
 * done, and a route sheet that sends somebody to an organisation that has
 * already signed is a route sheet nobody uses twice.
 *
 * ── THE SHAPE OF THE GROUPING, AND WHAT WAS TRIED FIRST ───────────
 * The obvious method is single link agglomerative clustering: join any
 * two organisations within a threshold and let the groups grow. It was
 * tried and it is wrong here, and the failure is instructive. At a
 * quarter of a mile the downtown Brea corridor chains into one group of
 * twenty five, because the mall, the food row and the auto strip each
 * touch the next. Twenty five stops is not an afternoon, it is a week,
 * and a "run" a person cannot finish is worse than no run at all because
 * it looks like a plan.
 *
 * So the grouping is greedy and seeded, which is what an actual route is.
 * Take the highest scoring organisation nobody has routed yet, take the
 * nearest few within a walkable radius of THAT organisation, cap the
 * count at what fits in an afternoon, and start again. A group therefore
 * cannot chain: every stop is within the radius of the seed, so the whole
 * run fits inside a circle of one diameter and the widest gap is stated
 * on it. Runs of three to six stops, all inside about a third of a mile,
 * come out of the real data.
 *
 * ── NO SECOND RANKING FUNCTION, AGAIN ─────────────────────────────
 * Runs are ordered by the sum of the desk scores of their stops, and the
 * seed order is the desk's own order. Nothing here invents a fresh
 * opinion about which organisation matters; it decides only which ones
 * are near each other, which is the one question the desk does not ask.
 *
 * ── EVERY FIGURE OUT OF HERE IS MODELED ───────────────────────────
 * The coordinates are published and the arithmetic is this app's. A run
 * is not a route: there is no routing engine in this dependency tree, so
 * the distances are straight lines and the surfaces that draw them say
 * so, exactly as the rings do.
 *
 * Plain data out. No JSX, no hooks, no React import.
 */

/**
 * How far from the seed a stop may sit, in straight line miles.
 *
 * FOUR TENTHS OF A MILE IS A WALK, and that is the whole argument for the
 * number. It is about eight minutes on foot, which means a run of this
 * radius is parked once rather than driven between, and being able to say
 * that is the difference between a group of pins and a plan for an
 * afternoon. Widening it to a half mile pulls the downtown groups back
 * into one another and the runs stop being distinguishable; tightening it
 * to a quarter leaves forty per cent of the go-see book in no run at all.
 */
export const RUN_RADIUS_MILES = 0.4;

/**
 * The most stops a run may carry.
 *
 * Six is what an afternoon holds when each stop is a cold visit to a
 * front desk: a reception to find, a board secretary or an office manager
 * to ask for, a card to leave, and the walk between. A cap is also what
 * stops the greedy pass turning the densest corridor into a single group
 * nobody can finish.
 */
export const RUN_MAX_STOPS = 6;

/**
 * The fewest stops that make a run worth calling one.
 *
 * Two organisations near each other is a coincidence a reader can see for
 * themselves on the map. Three is the point at which the trip is planned
 * around the group rather than around one of them.
 */
export const RUN_MIN_STOPS = 3;

/**
 * Straight line miles between two published coordinate pairs.
 *
 * The desk owns `milesFromVenue`, which is this same haversine with one
 * end pinned to 625 Columbia Street, and every distance FROM THE BREA
 * BRANCH on this board still comes from there rather than from here. This
 * function answers the question the desk never has to ask, which is how
 * far two organisations are from each other, and it is written once so
 * that a run's widest gap and a run's leg lengths cannot disagree.
 */
export function milesBetween(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 3958.8;
  const p1 = (a.lat * Math.PI) / 180;
  const p2 = (b.lat * Math.PI) / 180;
  const dp = ((b.lat - a.lat) * Math.PI) / 180;
  const dl = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export interface RunStop {
  line: MapRow;
  /**
   * Straight line miles from the previous stop on the walk. Zero on the
   * first stop, which is where the reader arrives.
   */
  legMiles: number;
}

export interface GoSeeRun {
  /**
   * Stable across renders and across a status change, because it is the
   * seed organisation's own id. A run keyed on its position in the list
   * would silently come to mean a different set of stops the moment
   * somebody recorded a touch.
   */
  id: string;
  /** The stops, in the order the walk takes them. */
  stops: RunStop[];
  /** The widest straight line gap between any two stops in the run. */
  spanMiles: number;
  /** The whole walk, end to end, in the order below. */
  walkMiles: number;
  /** How far the first stop is from the Brea branch. */
  fromVenueMiles: number;
  /** Sum of the midpoints of every modeled door count range in the run. */
  guests: number;
  /** Sum of the desk scores of the stops. Ranks runs, and nothing else. */
  score: number;
  /** Stops publishing a contact form. The rest publish no written door. */
  formOnly: number;
}

export interface GoSeeRunOptions {
  radiusMiles?: number;
  maxStops?: number;
  minStops?: number;
}

/** Is a visit the only real way into this organisation? */
function needsAVisit(row: MapRow): boolean {
  if (row.prospect.emailConfidence === "verified_public") return false;
  if (row.status === "booked" || row.status === "lost") return false;
  return true;
}

/**
 * The stops put into the order somebody would actually walk them.
 *
 * Start at whichever stop is closest to the branch, because that is the
 * one a rep reaches first coming out of Columbia Street, then take the
 * nearest unvisited stop each time. It is a nearest neighbour walk rather
 * than a shortest path: six stops has seven hundred and twenty orderings
 * and the optimal one is worth perhaps a hundred yards over the greedy
 * one, which is inside the error of calling any of this a distance in the
 * first place. What the ordering buys is a list that reads as a sequence
 * rather than as a set, and greedy buys that completely.
 */
function walkOrder(rows: MapRow[]): RunStop[] {
  const left = [...rows];
  left.sort((a, b) => a.miles - b.miles);
  const first = left.shift();
  if (!first) return [];

  const out: RunStop[] = [{ line: first, legMiles: 0 }];
  let here = first;
  while (left.length > 0) {
    let bestAt = 0;
    let bestMiles = Infinity;
    for (let i = 0; i < left.length; i += 1) {
      const d = milesBetween(here.prospect, left[i].prospect);
      if (d < bestMiles) {
        bestMiles = d;
        bestAt = i;
      }
    }
    const next = left.splice(bestAt, 1)[0];
    out.push({ line: next, legMiles: bestMiles });
    here = next;
  }
  return out;
}

/**
 * Every run the current board supports, best first.
 *
 * `rows` arrives already narrowed by the shared lane filter, the search
 * box, the written door switch and the board segment, and this reads
 * exactly what it is given. A run built from organisations the board has
 * filtered away would send somebody to a door the list beside the map is
 * refusing to show them.
 *
 * The cost is a hundred rows against a hundred rows, which is ten
 * thousand haversines in the worst case and a fraction of a millisecond.
 * It is memoised at the call site anyway, because it is keyed on rows and
 * rows are rebuilt whenever anybody records a touch.
 */
export function goSeeRuns(
  rows: MapRow[],
  {
    radiusMiles = RUN_RADIUS_MILES,
    maxStops = RUN_MAX_STOPS,
    minStops = RUN_MIN_STOPS,
  }: GoSeeRunOptions = {},
): GoSeeRun[] {
  /* `rows` is already in the desk's order, so taking seeds off the front
     means the best organisation nobody has routed yet always seeds the
     next run. */
  const pool = rows.filter(needsAVisit);
  const routed = new Set<string>();
  const runs: GoSeeRun[] = [];

  for (const seed of pool) {
    if (routed.has(seed.prospect.id)) continue;

    const near = pool
      .filter(
        (row) =>
          !routed.has(row.prospect.id) &&
          milesBetween(seed.prospect, row.prospect) <= radiusMiles,
      )
      .sort(
        (a, b) =>
          milesBetween(seed.prospect, a.prospect) -
          milesBetween(seed.prospect, b.prospect),
      )
      .slice(0, maxStops);

    if (near.length < minStops) continue;
    for (const row of near) routed.add(row.prospect.id);

    let span = 0;
    for (let i = 0; i < near.length; i += 1) {
      for (let j = i + 1; j < near.length; j += 1) {
        const d = milesBetween(near[i].prospect, near[j].prospect);
        if (d > span) span = d;
      }
    }

    const stops = walkOrder(near);
    runs.push({
      id: seed.prospect.id,
      stops,
      spanMiles: span,
      walkMiles: stops.reduce((n, s) => n + s.legMiles, 0),
      fromVenueMiles: stops[0]?.line.miles ?? 0,
      guests: near.reduce((n, row) => n + (headcountMidpoint(row.prospect) ?? 0), 0),
      score: near.reduce((n, row) => n + row.score, 0),
      formOnly: near.filter(
        (row) => row.prospect.emailConfidence === "form_only",
      ).length,
    });
  }

  runs.sort((a, b) => b.score - a.score);
  return runs;
}

/** The run holding this id, or null. */
export function runById(runs: GoSeeRun[], id: string | null): GoSeeRun | null {
  if (!id) return null;
  return runs.find((run) => run.id === id) ?? null;
}

/** Every organisation id in a run, for filtering the board down to it. */
export function runProspectIds(run: GoSeeRun | null): Set<string> {
  return new Set(run ? run.stops.map((s) => s.line.prospect.id) : []);
}

/** How many plotted organisations fall into any run at all. */
export function runnableCount(runs: GoSeeRun[]): number {
  return runs.reduce((n, run) => n + run.stops.length, 0);
}

/**
 * A run's headline, as a sentence for a title and an accessible name.
 *
 * Built here rather than in the components so the card, the map path and
 * the strip figure cannot end up describing the same run three different
 * ways.
 */
export function runSentence(run: GoSeeRun): string {
  return (
    `${run.stops.length} stops, widest gap ${run.spanMiles.toFixed(1)} straight line miles, ` +
    `nearest ${run.fromVenueMiles.toFixed(1)} miles from the Brea branch. ` +
    `None of them publish an email address.`
  );
}
