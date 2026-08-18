import { PROSPECTS } from "@/data/prospects";
import { SEGMENT_META, SEGMENT_ORDER, type SegmentId } from "@/domain/segments";
import { LANE_META, isCalendarLocked, lanesForGuests } from "@/domain/lanes";
import { milesFromVenue } from "@/domain/selectors/desk";
import { furthestStatus, type PipelineState } from "@/state/PipelineProvider";
import type { Lane, Prospect } from "@/domain/types";

/**
 * THE SEGMENT BOARD.
 *
 * The literal answer to one line of the posting this work sample was
 * written for:
 *
 *   "Maintain strong relationships with suppliers and licensors while
 *    scouting new vendor opportunities."
 *
 * read against the other half of the same job, which is knowing which
 * parts of a trade area are worth the visit in the first place.
 *
 * ── THE THING THIS SCREEN IS TRYING NOT TO BE ─────────────────────
 * The easy version of this is a pie chart of the board by industry. That
 * answers "what did I collect", which nobody asked, and it looks like
 * analysis because it has colours in it.
 *
 * The question is which industries to WORK FIRST, and that is a ranking,
 * and a ranking needs a stated rule or it is just an opinion with a
 * number typed next to it. So every figure below is either counted off
 * the rows or computed from figures that were, the composite is a
 * weighted sum of three normalised components, and the weights are
 * printed on the screen next to the answer they produce.
 *
 * ── WHY THESE THREE COMPONENTS ────────────────────────────────────
 * VOLUME, the guests a sector could plausibly put in the building,
 * summed from the midpoint of every row's headcount range. It is the
 * closest thing to revenue that can be computed without inventing a
 * price, and the price of a group package is the one thing this
 * operator deliberately does not publish.
 *
 * CERTAINTY, the share of the sector whose occasion happens whether or
 * not anybody calls them. A graduating class graduates. A season ends. A
 * holiday party is a decision somebody can simply not make. To a desk
 * with no book behind it, that difference is the whole asset, which is
 * why it is weighted above reach.
 *
 * REACH, the share with any written door at all, a published address or
 * a contact form. A sector nobody can write to has to be walked, and an
 * hour out of the office is the scarcest thing this desk has.
 *
 * ── WHAT IS HONEST ABOUT THE WEIGHTS ──────────────────────────────
 * They are a judgement. 50/30/20 is not derived from anything and it
 * would be a lie to present it as though it were. What is NOT a
 * judgement is the three inputs: every one is a count over rows a reader
 * can click. So the screen shows the components beside the score, and a
 * reader who disagrees with the weighting can read the ranking off the
 * components and get their own answer without trusting mine.
 *
 * ── THE ABSENT SECTOR IS PART OF THE ANSWER ───────────────────────
 * NAICS 51, Information, has no organisation on this board. Three
 * candidates were researched and every one rested on a single directory
 * line with a generic switchboard number, so none of them shipped. A
 * segmentation that only lists what was found is a segmentation that
 * cannot tell you where to look next, so the empty sector is carried,
 * rendered, and labelled as a gap rather than dropped.
 */

/** The three weights, published because the screen prints them. */
export const SEGMENT_WEIGHTS = {
  volume: 0.5,
  certainty: 0.3,
  reach: 0.2,
} as const;

export interface SegmentEntryPoint {
  id: string;
  name: string;
  /** Midpoint of the headcount range. Modeled, like the range. */
  guests: number;
  lane: Lane;
  miles: number;
}

export interface SegmentRow {
  id: SegmentId;
  label: string;
  short: string;
  occasion: string;
  motion: string;
  friction: string;

  /** Organisations on the board in this sector. A count, not an estimate. */
  count: number;
  /** Published address read off their own page. */
  emailable: number;
  /** A contact form and nothing else. */
  formOnly: number;
  /** No written door at all. A go-see, by the nature of the business. */
  doorOnly: number;
  /** Sum of headcount midpoints. Modeled, and it says so on the screen. */
  seatsInPlay: number;
  /** Bowling lanes that many guests would consume, at 1 per 20. */
  lanesAtMidpoint: number;
  /** Organisations whose occasion exists without anybody deciding. */
  calendarLocked: number;
  /** Median straight-line miles from the venue. */
  medianMiles: number;
  /** Lanes this sector actually occupies on this board, most common first. */
  lanes: Lane[];
  /** Nothing sent, nothing heard. The size of the untouched opportunity. */
  untouched: number;

  /* --- the three normalised components, 0 to 1 --- */
  volumeIndex: number;
  certaintyIndex: number;
  reachIndex: number;
  /** The weighted sum, 0 to 100. Modeled. The weights are printed. */
  score: number;
  /** 1 is the sector to work first. */
  rank: number;

  /** The three largest rooms in the sector, as a way in. */
  entryPoints: SegmentEntryPoint[];
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

const midpoint = (p: Prospect) => Math.round((p.headcountLow + p.headcountHigh) / 2);

/**
 * The whole board, cut by industry and ranked.
 *
 * `state` is optional. The untouched count is the only figure that needs
 * it, and three surfaces want this table without holding a pipeline.
 */
export function segmentBoard(state?: PipelineState): SegmentRow[] {
  const byId = new Map<SegmentId, Prospect[]>();
  for (const id of SEGMENT_ORDER) byId.set(id, []);
  for (const p of PROSPECTS) {
    if (!p.segment) continue;
    byId.get(p.segment)?.push(p);
  }

  const raw = SEGMENT_ORDER.map((id) => {
    const meta = SEGMENT_META[id];
    const rows = byId.get(id) ?? [];
    const seatsInPlay = rows.reduce((sum, p) => sum + midpoint(p), 0);
    const written = rows.filter((p) => p.emailConfidence !== "none").length;

    const laneCounts = new Map<Lane, number>();
    for (const p of rows) laneCounts.set(p.lane, (laneCounts.get(p.lane) ?? 0) + 1);

    return {
      id,
      label: meta.label,
      short: meta.short,
      occasion: meta.occasion,
      motion: meta.motion,
      friction: meta.friction,
      count: rows.length,
      emailable: rows.filter((p) => p.emailConfidence === "verified_public").length,
      formOnly: rows.filter((p) => p.emailConfidence === "form_only").length,
      doorOnly: rows.filter((p) => p.emailConfidence === "none").length,
      seatsInPlay,
      lanesAtMidpoint: lanesForGuests(seatsInPlay),
      calendarLocked: rows.filter((p) => isCalendarLocked(p.lane)).length,
      medianMiles: median(rows.map((p) => milesFromVenue(p.lat, p.lng))),
      lanes: [...laneCounts.entries()]
        .sort((a, b) => b[1] - a[1] || LANE_META[a[0]].label.localeCompare(LANE_META[b[0]].label))
        .map(([lane]) => lane),
      untouched: state
        ? rows.filter((p) => furthestStatus(state, p.id) === "unworked").length
        : rows.length,
      /* Held until the maxima are known. A component is a share of the
         biggest sector, not of itself. */
      volumeIndex: 0,
      certaintyIndex: rows.length ? rows.filter((p) => isCalendarLocked(p.lane)).length / rows.length : 0,
      reachIndex: rows.length ? written / rows.length : 0,
      score: 0,
      rank: 0,
      entryPoints: rows
        .map((p) => ({
          id: p.id,
          name: p.name,
          guests: midpoint(p),
          lane: p.lane,
          miles: milesFromVenue(p.lat, p.lng),
        }))
        .sort((a, b) => b.guests - a.guests || a.name.localeCompare(b.name))
        .slice(0, 3),
    } satisfies SegmentRow;
  });

  const maxSeats = Math.max(1, ...raw.map((r) => r.seatsInPlay));
  for (const r of raw) {
    r.volumeIndex = r.seatsInPlay / maxSeats;
    r.score = Math.round(
      100 *
        (SEGMENT_WEIGHTS.volume * r.volumeIndex +
          SEGMENT_WEIGHTS.certainty * r.certaintyIndex +
          SEGMENT_WEIGHTS.reach * r.reachIndex),
    );
  }

  const ranked = [...raw].sort(
    (a, b) => b.score - a.score || b.seatsInPlay - a.seatsInPlay || a.label.localeCompare(b.label),
  );
  ranked.forEach((r, i) => {
    /* An empty sector is not rank 17 out of 17. It is not ranked at all,
       because there is nothing in it to work, and giving it an ordinal
       would put a number where a gap belongs. */
    r.rank = r.count === 0 ? 0 : i + 1;
  });
  /* Re-number so the ranked sectors run 1..n with no hole where an empty
     sector was skipped. */
  let n = 0;
  for (const r of ranked) if (r.count > 0) r.rank = ++n;

  return ranked;
}

export interface SegmentTotals {
  organisations: number;
  sectors: number;
  emptySectors: SegmentId[];
  seatsInPlay: number;
  emailable: number;
  doorOnly: number;
  /** Sectors that together hold half the guests. The short list. */
  halfOfTheRoom: SegmentId[];
}

export function segmentTotals(board: SegmentRow[]): SegmentTotals {
  const organisations = board.reduce((s, r) => s + r.count, 0);
  const seatsInPlay = board.reduce((s, r) => s + r.seatsInPlay, 0);

  /* WHICH SECTORS ARE THE BOARD. Walk the ranking, accumulating guests,
     and stop at half. It is the one figure on this screen that answers
     "what would I drop if I only had a quarter" without anybody having
     to decide anything. */
  const half: SegmentId[] = [];
  let running = 0;
  for (const r of [...board].sort((a, b) => b.seatsInPlay - a.seatsInPlay)) {
    if (running >= seatsInPlay / 2) break;
    running += r.seatsInPlay;
    half.push(r.id);
  }

  return {
    organisations,
    sectors: board.filter((r) => r.count > 0).length,
    emptySectors: board.filter((r) => r.count === 0).map((r) => r.id),
    seatsInPlay,
    emailable: board.reduce((s, r) => s + r.emailable, 0),
    doorOnly: board.reduce((s, r) => s + r.doorOnly, 0),
    halfOfTheRoom: half,
  };
}

/** Every organisation in one sector, largest room first. */
export function prospectsInSegment(id: SegmentId): Prospect[] {
  return PROSPECTS.filter((p) => p.segment === id).sort(
    (a, b) => midpoint(b) - midpoint(a) || a.name.localeCompare(b.name),
  );
}
