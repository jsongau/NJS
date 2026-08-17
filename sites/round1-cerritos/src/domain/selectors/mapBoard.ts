import type {
  Lane,
  OccasionClass,
  Prospect,
  Provenance,
} from "@/domain/types";
import { PROSPECTS, PROSPECT_BY_ID } from "@/data/prospects";
import { LANE_META, LANE_ORDER, lanesForGuests } from "@/domain/lanes";
import {
  deskLines,
  milesFromVenue,
  type DeskLine,
} from "@/domain/selectors/desk";
import { furthestStatus, type PipelineState } from "@/state/PipelineProvider";

/**
 * THE MAP BOARD'S DERIVED STATE. Every number the three panes show, in
 * one place, computed once.
 *
 * WHY THIS FILE EXISTS. The expanded map draws the same facts three
 * times: as a stat bar across the top, as a scrolling list on the left,
 * and as pins in the middle. In the build this was forked from, each of
 * those computed its own totals, and they disagreed. The bar said sixty
 * nine organisations, the list said sixty two because it had applied the
 * search box a beat earlier, and the map plotted sixty because two rows
 * had no coordinate. Nobody noticed for a month, and when somebody did,
 * the only honest conclusion was that none of the three could be
 * trusted. A screen whose own three numbers disagree is worse than a
 * screen with no numbers on it at all.
 *
 * So the panes compute nothing. They are handed rows and totals from
 * here, and if a figure is wrong it is wrong identically in all three
 * places, which is a bug you can find.
 *
 * THE RANKING IS NOT REDEFINED HERE, AND THAT IS THE POINT. The order of
 * this board is `deskLines` and `scoreProspect` from `desk.ts`,
 * unchanged. Distance is `milesFromVenue` from the same file, not a
 * second haversine. The temptation on a map is to sort by distance,
 * because a map is about space, and it would produce a screen that
 * confidently recommends a different organisation from the one the desk
 * recommends. Two ranking functions that disagree is the exact failure
 * this file was written to prevent: the reader has no way to tell which
 * screen is lying, so they stop believing both.
 *
 * WHAT IS PAGE LOCAL AND WHAT IS SHARED. The lane filter, the search
 * query and the emailable only toggle come from `PipelineProvider` and
 * are shared with the desk on purpose: filter to schools on the map and
 * the desk is filtered to schools when the reader gets back to it,
 * because a lane is a permanent property of an organisation. The board
 * segment ("all", "never touched", "live conversations") is page local,
 * because that is not a fact about the pipeline, it is a way of looking
 * at this one board, and the desk already answers the same question
 * through its own ordering.
 *
 * NO LANE IS NAMED IN THIS FILE. Every lane keyed record is built by
 * iterating LANE_ORDER, so a ninth lane, or a tenth, appears in the
 * counts on the day it is added and nothing here is edited.
 *
 * Plain data out. No JSX, no hooks, no React import, every function
 * taking the state it needs as an argument, so all of it can be unit
 * tested and none of it can be made stateful by accident inside a
 * component.
 */

// ---------------------------------------------------------------
// The board segment
// ---------------------------------------------------------------

/** The three positions of the segmented control on the left of the bar. */
export type BoardSegment = "all" | "untouched" | "live";

export interface BoardSegmentMeta {
  value: BoardSegment;
  label: string;
  /** For a narrow bar where the full label will not fit. */
  short: string;
  /** Shape before hue, always. The control is readable in greyscale. */
  glyph: string;
  /** What the position actually means, for the tooltip and the aria label. */
  what: string;
}

export const BOARD_SEGMENTS: BoardSegmentMeta[] = [
  {
    value: "all",
    label: "All organisations",
    short: "All",
    glyph: "●",
    what: "Every organisation left after the shared lane, search and written door filters.",
  },
  {
    value: "untouched",
    label: "Never touched",
    short: "Untouched",
    glyph: "○",
    what: "Nothing has been sent and nobody has been seen. The whole book started here.",
  },
  {
    value: "live",
    label: "Live conversations",
    short: "Live",
    glyph: "◐",
    what: "A conversation is open or a date is softly held. These are the ones with something to lose.",
  },
];

/**
 * Filter a set of rows to a board segment.
 *
 * Generic in the row type so the map's own `MapRow` survives the filter
 * rather than being widened back to a `DeskLine`, which would force
 * every call site to cast.
 *
 * `DeskLine.status` is already the FURTHEST status the organisation has
 * reached across its packages, so this reads it rather than taking the
 * pipeline state again. One source, one answer.
 */
export function applyBoardSegment<T extends DeskLine>(
  rows: T[],
  segment: BoardSegment,
): T[] {
  if (segment === "untouched")
    return rows.filter((r) => r.status === "unworked");
  if (segment === "live")
    return rows.filter(
      (r) => r.status === "conversation" || r.status === "soft-hold",
    );
  return rows;
}

/** How many rows each segment would leave, for the counts on the control. */
export function segmentCounts(rows: DeskLine[]): Record<BoardSegment, number> {
  return {
    all: rows.length,
    untouched: applyBoardSegment(rows, "untouched").length,
    live: applyBoardSegment(rows, "live").length,
  };
}

// ---------------------------------------------------------------
// The occasion segment, derived from the shared lane filter
// ---------------------------------------------------------------

/**
 * The lanes belonging to one occasion class, in LANE_ORDER.
 *
 * The occasion segment on the left pane is the owner's first ask in his
 * own words, "a way to separate the schools from the employers", and it
 * is implemented as a shortcut over the SHARED lane filter rather than
 * as a second parallel filter of its own. A class segment that filtered
 * locally would let the map show three lanes while the desk showed nine,
 * which is precisely the incoherence the shared filter exists to stop.
 */
export function lanesForOccasionClass(occasionClass: OccasionClass): Lane[] {
  return LANE_ORDER.filter(
    (lane) => LANE_META[lane].occasionClass === occasionClass,
  );
}

/**
 * Which occasion class, if any, the shared lane filter currently equals.
 *
 * Returns null when the filter is empty (both classes showing) or when
 * the reader has narrowed past a whole class by ticking individual lane
 * chips. Null is correct in that second case: the segment should stop
 * claiming to describe a selection it no longer describes.
 */
export function occasionSegmentValue(laneFilter: Lane[]): OccasionClass | null {
  if (laneFilter.length === 0) return null;
  const set = new Set(laneFilter);
  const classes: OccasionClass[] = ["calendar-locked", "discretionary"];
  for (const occasionClass of classes) {
    const lanes = lanesForOccasionClass(occasionClass);
    if (set.size === lanes.length && lanes.every((l) => set.has(l)))
      return occasionClass;
  }
  return null;
}

/**
 * How many organisations sit in each occasion class, across the WHOLE
 * trade area rather than the filtered board.
 *
 * Deliberately unfiltered, and for the same reason `laneCounts` on the
 * desk is: the segment is offering the reader a choice, and a choice
 * whose counts shrink as a result of the choice itself is unreadable.
 * "Calendar 31, Chosen 38" is a description of the territory. Wire it to
 * the filtered rows and it becomes a description of the last click.
 */
export function occasionCounts(): Record<OccasionClass, number> {
  const out: Record<OccasionClass, number> = {
    "calendar-locked": 0,
    discretionary: 0,
  };
  for (const p of PROSPECTS) out[LANE_META[p.lane].occasionClass] += 1;
  return out;
}

/**
 * Lane tally over whatever is currently plotted, every lane present.
 *
 * Built from LANE_ORDER so the legend can render a fixed set of rows and
 * so a lane with nothing on the board still shows its zero, which is
 * itself information: an empty lane is a gap in the week, not an absence
 * of data.
 */
export function laneCountsOnBoard(rows: DeskLine[]): Record<Lane, number> {
  const out = Object.fromEntries(LANE_ORDER.map((l) => [l, 0])) as Record<
    Lane,
    number
  >;
  for (const r of rows) {
    if (r.prospect.lane in out) out[r.prospect.lane] += 1;
  }
  return out;
}

// ---------------------------------------------------------------
// The rows
// ---------------------------------------------------------------

/**
 * Likely group size as one number, for arithmetic only.
 *
 * Every headcount in the data set is a RANGE with a stated basis, and
 * the range is the honest figure. The midpoint exists because you cannot
 * sum a range into a lane count, and it carries "modeled" provenance
 * everywhere it is shown so it can never be mistaken for a measurement.
 */
export function headcountMidpoint(p: Prospect): number {
  return Math.round((p.headcountLow + p.headcountHigh) / 2);
}

/**
 * Bowling lanes that group would hold at this application's own planning
 * rate of one lane per twenty guests.
 *
 * IT IS A SIZE, NEVER A SHARE. No lane count is published for any
 * location, so there is nothing to divide by and no percentage of a
 * house is offered anywhere on this board.
 *
 * Exported for the detail pane, which has to answer this for a prospect
 * that is not currently on the board.
 */
export function lanesAtMidpointFor(p: Prospect): number {
  return lanesForGuests(headcountMidpoint(p));
}

/**
 * A desk row plus the two figures the map board needs and the desk does
 * not bother carrying.
 *
 * Everything else on the row, the score, the components, the miles, the
 * furthest status, the touch count, the next action and the lanes at
 * midpoint, is the desk's own and is not recomputed here.
 */
export interface MapRow extends DeskLine {
  /** Midpoint of the modeled headcount range, rounded. */
  guestsMidpoint: number;
  /** Straight line miles, rounded to one place, for display only. */
  milesLabel: string;
  occasionClass: OccasionClass;
}

export interface MapBoardOptions {
  /** 0 to 11. Injected rather than read from the clock so the board is
   *  reproducible in a screenshot, exactly as the desk is. */
  nowMonth: number;
  /** The page local board segment. Defaults to "all". */
  segment?: BoardSegment;
}

function toMapRow(line: DeskLine): MapRow {
  const p = line.prospect;
  return {
    ...line,
    guestsMidpoint: headcountMidpoint(p),
    milesLabel: `${line.miles.toFixed(1)} mi`,
    occasionClass: LANE_META[p.lane].occasionClass,
  };
}

/**
 * The board's rows: shared filters first, then the page local segment,
 * in the desk's own order.
 *
 * The two filters are applied in that order and not the other way round
 * because the counts read to a person in that order. "Nine of the
 * thirty one schools have never been touched" is a sentence. "Nine of
 * the forty untouched organisations are schools" is a different sentence
 * about a different thing, and the stat bar is asking the first one.
 */
export function boardRows(
  state: PipelineState,
  { nowMonth, segment = "all" }: MapBoardOptions,
): MapRow[] {
  const shared = deskLines(state, { nowMonth }).map(toMapRow);
  return applyBoardSegment(shared, segment);
}

/**
 * One row for one organisation, whether or not it survives the current
 * filters.
 *
 * The detail pane does NOT close when a filter removes the prospect it
 * is showing, because closing a panel a reader is reading, for a reason
 * they did not ask for, loses their place. So it needs a row for a
 * prospect that is not in `boardRows`.
 *
 * This builds it by running the desk over a copy of the state with the
 * filters cleared, rather than by assembling a row field by field.
 * Assembling it by hand would mean writing this file's own version of
 * the score, the next action and the touch count, which is the second
 * ranking function this whole file exists to avoid. Scoring the full
 * trade area to find one row is a hundred rows of arithmetic, which is
 * nothing, and the caller memoises it.
 */
export function rowForProspect(
  prospectId: string,
  state: PipelineState,
  nowMonth: number,
): MapRow | null {
  if (!PROSPECT_BY_ID[prospectId]) return null;
  const unfiltered: PipelineState = {
    ...state,
    laneFilter: [],
    query: "",
    emailableOnly: false,
  };
  const line = deskLines(unfiltered, { nowMonth }).find(
    (r) => r.prospect.id === prospectId,
  );
  return line ? toMapRow(line) : null;
}

/** Is this organisation still in the filtered board? Drives the "Not in
 *  the current filter" line above the detail tabs. */
export function isOnBoard(rows: DeskLine[], prospectId: string | null): boolean {
  if (!prospectId) return false;
  return rows.some((r) => r.prospect.id === prospectId);
}

// ---------------------------------------------------------------
// The totals
// ---------------------------------------------------------------

export interface MapBoardTotals {
  /** Rows currently plotted. */
  plotted: number;
  /** Every organisation in the trade area, filtered or not. */
  inTradeArea: number;
  /**
   * The three written doors, and they are three rather than two.
   *
   * These used to be a pair, "Written door" against "No written door",
   * and the strip showed 93 and 68 over a total of 211. Two figures
   * presented side by side, one named as the negation of the other, read
   * as a partition, so a reader does the arithmetic, gets 161, and spends
   * a minute deciding whether the numbers are wrong or they are. Neither:
   * `EmailConfidence` has a third member, `form_only`, and the fifty
   * organisations reachable only through a contact form were counted
   * nowhere and shown nowhere. A pair that reads as an opposition has to
   * actually be one. These three sum to `plotted`, by construction.
   */
  /** Rows with emailConfidence "verified_public". */
  writtenDoor: number;
  /** Rows with emailConfidence "form_only". */
  formOnly: number;
  /** Rows with emailConfidence "none". */
  noWrittenDoor: number;
  /** Rows inside three straight-line miles. */
  insideThreeMiles: number;
  /** Sum of midpoint headcount across plotted rows. */
  guestsInPlay: number;
  /** Sum of lanesAtMidpoint across plotted rows. */
  lanesAtMidpoint: number;
  /** Plotted rows whose furthest status is unworked. */
  neverTouched: number;
  /** Plotted rows at conversation or soft-hold. */
  liveConversations: number;
  /**
   * Plotted rows that fall into a go-see run.
   *
   * Counted by `goSeeRuns` and passed IN rather than computed here, and
   * the direction of that dependency is deliberate. `selectors/goSeeRuns`
   * imports `MapRow` and `headcountMidpoint` from this file, so this file
   * importing it back would be a cycle. Handing the figure in also keeps
   * the rule this whole module exists for: the runs are built once, at the
   * board, and every surface that shows a run figure is showing that one
   * count rather than a second opinion about it.
   */
  inARun: number;
}

/** Three miles. Named, because it appears in a label, a badge title and
 *  a spoken summary and all three have to move together. */
export const INSIDE_MILES = 3;

export function mapBoardTotals(
  rows: DeskLine[],
  state: PipelineState,
  /** How many of these rows `goSeeRuns` put into a run. See `inARun`. */
  inARun = 0,
): MapBoardTotals {
  const totals: MapBoardTotals = {
    plotted: rows.length,
    inTradeArea: PROSPECTS.length,
    writtenDoor: 0,
    formOnly: 0,
    noWrittenDoor: 0,
    insideThreeMiles: 0,
    guestsInPlay: 0,
    lanesAtMidpoint: 0,
    neverTouched: 0,
    liveConversations: 0,
    inARun,
  };

  for (const r of rows) {
    const p = r.prospect;
    if (p.emailConfidence === "verified_public") totals.writtenDoor += 1;
    if (p.emailConfidence === "form_only") totals.formOnly += 1;
    if (p.emailConfidence === "none") totals.noWrittenDoor += 1;

    /* `DeskLine.miles` is already `milesFromVenue`. The fallback covers
       a row assembled by something other than the desk, and it calls the
       same haversine rather than a second one, because two distance
       functions on one screen is how a map ends up disagreeing with a
       list about which organisation is nearest. */
    const miles = Number.isFinite(r.miles)
      ? r.miles
      : milesFromVenue(p.lat, p.lng);
    if (miles <= INSIDE_MILES) totals.insideThreeMiles += 1;

    totals.guestsInPlay += headcountMidpoint(p);
    totals.lanesAtMidpoint += r.lanesAtMidpoint;

    /* Read from the pipeline rather than from the row, so this function
       is correct even when handed rows built before the reader last
       moved somebody's status. */
    const status = furthestStatus(state, p.id);
    if (status === "unworked") totals.neverTouched += 1;
    if (status === "conversation" || status === "soft-hold")
      totals.liveConversations += 1;
  }

  return totals;
}

// ---------------------------------------------------------------
// The stat bar
// ---------------------------------------------------------------

/**
 * One figure on the stat bar, WITH the origin of its number.
 *
 * The provenance is part of the figure rather than a prop the bar passes
 * separately, and that is the whole design of this type. Every
 * commercial number in this application has to state where it came from,
 * and the reliable way to enforce that is to make it impossible to get
 * the number without it. A component cannot render a value from this
 * list and forget the badge, because the value does not exist on its
 * own.
 */
export interface MapBoardStat {
  key: string;
  /** Small uppercase label. Rendered as written. */
  label: string;
  value: number;
  /** The denominator, where the figure is "n of m". Absent otherwise. */
  outOf?: number;
  provenance: Provenance;
  /** The tooltip and the badge title. Says what the number is and is not. */
  note: string;
}

/**
 * The seven figures, in order, left to right.
 *
 * THERE IS NO PERCENTAGE ON THIS BAR, and its absence is deliberate. The
 * reference screen this board is modelled on carries a distribution
 * share, and there is no honest equivalent here: a share needs a
 * denominator that means something, and no target, capacity plan or
 * budget is published for anywhere. Inventing one would be the
 * single most damaging thing this screen could do, because every other
 * number on it is real.
 *
 * There is no money on it either. The map does not touch revenue.
 */
export function mapBoardStats(totals: MapBoardTotals): MapBoardStat[] {
  return [
    {
      key: "organisations",
      label: "Organisations",
      value: totals.plotted,
      outOf: totals.inTradeArea,
      provenance: "public",
      note: "Organisations currently plotted, out of every one researched inside the trade area. Each row is a real business with a published address.",
    },
    /* The three doors, in the vocabulary's own words. The labels are
       lifted from EMAIL_CONFIDENCE rather than reworded here, so the
       strip, the chips on the list cards and the drawer all call the
       same thing by the same name. They add up to the figure on their
       left, which is the whole reason the middle one exists. */
    {
      key: "written-door",
      label: "Published email",
      value: totals.writtenDoor,
      provenance: "public",
      note: "Publish an email address read off their own site, so a touch costs two minutes rather than a round trip.",
    },
    {
      key: "form-only",
      label: "Form only",
      value: totals.formOnly,
      provenance: "public",
      note: "No address published, but a contact form exists. Reachable in writing, into a queue somebody may or may not read. These three figures sum to the organisations plotted.",
    },
    {
      key: "no-written-door",
      label: "No written door",
      value: totals.noWrittenDoor,
      provenance: "public",
      note: "Publish no email and no form. These are go-sees, which is the activity the job posting names first.",
    },
    {
      key: "inside-three-miles",
      label: `Inside ${INSIDE_MILES} miles`,
      value: totals.insideThreeMiles,
      provenance: "modeled",
      note: "Straight line, not drive time. Measured from 12900 Park Plaza Drive by this app's own haversine, so it is modeled rather than published.",
    },
    /*
      THE ONE FIGURE ON THIS STRIP THAT ONLY A MAP CAN PRODUCE.

      Every other number here is true of a list as well: a count, three
      kinds of door, a distance, two statuses. This one is a fact about
      where the organisations sit in relation to EACH OTHER, which is the
      whole justification for drawing a map at all. It says how much of the
      go-see book has been grouped into trips somebody can actually finish,
      and it moves with the filters like everything else on the strip.
    */
    {
      key: "in-a-run",
      label: "In a go-see run",
      value: totals.inARun,
      provenance: "modeled",
      note: "Organisations with no published email address that sit within four tenths of a straight line mile of a group of three to six others. Grouped by this app's own arithmetic from published coordinates, so it is modeled. Straight lines, not drive times.",
    },
    {
      key: "guests-in-play",
      label: "Guests in play",
      value: totals.guestsInPlay,
      provenance: "modeled",
      note: "Sum of the midpoint of every modeled headcount range on the board. Every headcount here is a range with a stated basis, so this is an order of magnitude and not a forecast.",
    },
    {
      key: "never-touched",
      label: "Never touched",
      value: totals.neverTouched,
      provenance: "illustrative",
      note: "Nothing sent, nobody seen. The seeded status table is invented for the prototype, which is why this is illustrative and not observed.",
    },
    {
      key: "live-conversations",
      label: "Live conversations",
      value: totals.liveConversations,
      provenance: "illustrative",
      note: "A conversation is open or a date is softly held. Seeded for the prototype, and badged the same way the desk badges it.",
    },
  ];
}

/**
 * The visually hidden paragraph that sits inside the map pane.
 *
 * A map is a graphic and a screen reader gets nothing at all from it, so
 * the same facts are said in a sentence. This is not a courtesy; it is
 * the difference between a screen a person can use and a screen they
 * cannot. It lives here rather than in the canvas component so the words
 * and the figures come out of the same place and cannot drift apart.
 */
export function mapSummarySentence(totals: MapBoardTotals): string {
  return (
    `${totals.plotted} organisations plotted around the Cerritos corporate office, which is not a store. ` +
    `${totals.insideThreeMiles} of them are inside ${INSIDE_MILES} straight line miles, ` +
    `${totals.writtenDoor} publish an email address, ${totals.formOnly} publish a contact form and no address, ` +
    `and ${totals.noWrittenDoor} publish no written door at all. ` +
    `The list beside the map carries the same organisations as text.`
  );
}

/**
 * The count line above the list, as a sentence a person can read.
 *
 * "12 of 211" beats "12", every time. A reader who cannot see how much
 * they have filtered away has no way to know whether the board is empty
 * because the territory is thin or because they ticked something four
 * clicks ago.
 */
export function boardCountLine(totals: MapBoardTotals): string {
  if (totals.plotted === totals.inTradeArea)
    return `All ${totals.inTradeArea} organisations`;
  return `${totals.plotted} of ${totals.inTradeArea} organisations`;
}
