import { useCallback, useId, useMemo, useRef, type KeyboardEvent } from "react";
import type { Lane, OccasionClass } from "@/domain/types";
import { LANE_ORDER, OCCASION_CLASS_META } from "@/domain/lanes";
import {
  laneGlyphManifest,
  SELECTED_TREATMENT,
  STATE_TREATMENTS,
  type LaneGlyphManifestEntry,
} from "@/lib/map/markerIcons";
import { ClusterGlyph, LaneGlyph, VenueGlyph } from "@/components/map/LaneGlyph";
import { deskLines } from "@/domain/selectors/desk";
import { laneCountsOnBoard } from "@/domain/selectors/mapBoard";
import { usePipeline, usePipelineDispatch } from "@/state/PipelineProvider";
import {
  isRecord,
  signatureOf,
  usePersistedReducer,
  type SliceCodec,
} from "@/state/persist";
import { PROSPECTS } from "@/data/prospects";
import { VENUE } from "@/data/venue";
import styles from "./MapLegend.module.css";

/**
 * THE KEY, AND THE FILTER. One card, because they were always one idea.
 *
 * WHY THIS FILE CHANGED. This card used to be an explainer and nothing
 * else. It said, correctly and at length, that a pointed cap means the
 * calendar buys and a square cap means a person decides, and then it
 * ended with a sentence directing the reader somewhere else to actually
 * narrow the board. That is the wrong shape for a key. A reader who has
 * just worked out what a schoolhouse means is, at that exact moment,
 * asking to see only the schoolhouses, and the answer used to be "the
 * lane filter lives in the list pane, above the search box", which is a
 * sentence asking somebody to go and find a second control that does
 * what the one under their cursor obviously ought to do.
 *
 * So every lane row here is now a button. The thing that teaches you what
 * a mark means is the thing you press to see only those, and pressing it
 * narrows the map, the list beside it and the desk on the next screen at
 * once, because the lane filter is shared state and always was.
 *
 * ── WHAT THE FILTER DID NOT COST ──────────────────────────────────
 * The teaching survives in full. The lanes are still GROUPED BY OCCASION
 * CLASS with the class sentence over each group, because that pair of
 * shapes is the sharpest line in this domain model and a filter that ate
 * it would be a downgrade dressed as a feature. Every row still carries
 * its drawing and what the drawing is, in words. The branch, the cluster
 * bubble, the selection halo, the mile rings and the six states are all
 * still explained, underneath, in a part of the card that is visibly not
 * the filter, so nobody presses "Booked" expecting a narrowing that does
 * not exist.
 *
 * ── THE COUNTS ARE LIVE, AND THEY ARE THE BOARD'S OWN ─────────────
 * The old card carried the count in the BOOK, a constant, and said so.
 * That is defensible for a pure key and useless for a filter: a reader
 * about to press "Colleges" wants to know how many colleges they will be
 * left looking at, and a constant answers a different question. So each
 * row now carries the number of organisations that lane would put on the
 * board under everything ELSE currently narrowing it, the search box and
 * the written door switch included, and deliberately not under the lane
 * filter itself. A count that collapsed to zero because of the control it
 * sits on is a count nobody can use at the moment they need it.
 *
 * The arithmetic is therefore exact rather than approximate: press one
 * lane and the number of marks on the map is the number that was printed
 * on the row. That property is asserted rather than hoped for.
 *
 * ZERO IS A REAL ANSWER AND IT IS PRINTED AS ONE. A lane with nothing on
 * the board says "none here" beside its nought, rather than showing an
 * empty cell that reads as missing data. An empty lane is a gap in the
 * week; it is not an absence of information.
 *
 * ── COLOUR IS NEVER THE SIGNAL, HERE LEAST OF ALL ─────────────────
 * A row that is showing carries a TICK in a box, the WORD "Showing", and
 * a heavier label. A row that is hidden carries an empty box, the word
 * "Hidden", a lighter label and a faded mark. Four channels, none of them
 * a hue, and `aria-pressed` under all of it so the state is spoken as
 * well as drawn. Run this card through a greyscale filter and nothing in
 * it stops working. That is the test and it is not a figure of speech.
 *
 * ── NO LANE IS NAMED IN THIS FILE ─────────────────────────────────
 * Everything lane shaped comes from `laneGlyphManifest`, which is built
 * from LANE_ORDER and LANE_META, and the occasion class groups are
 * derived from the manifest in the order it arrives. A tenth lane, or a
 * third occasion class, appears in this key and in this filter on the day
 * it lands in the registry, and nothing here is edited.
 */

// ---------------------------------------------------------------
// The minimise state, and where it is kept
// ---------------------------------------------------------------

interface LegendUiState {
  /**
   * What the reader chose, or null when they have never said.
   *
   * The three-state field is the whole point. A plain boolean cannot tell
   * "shut, because this reader shut it" from "shut, because the board
   * opened on a laptop", and the two deserve different treatment: the
   * first must survive a reload, the second must be recomputed from the
   * viewport every time.
   */
  chosen: boolean | null;
}

type LegendUiAction = { type: "SET_OPEN"; open: boolean };

const LEGEND_SEED: LegendUiState = { chosen: null };

function legendReducer(
  state: LegendUiState,
  action: LegendUiAction,
): LegendUiState {
  switch (action.type) {
    case "SET_OPEN":
      return { chosen: action.open };
    default:
      return state;
  }
}

/**
 * Whether the key is open is a preference, so it is persisted with
 * everything else rather than beside it.
 *
 * `state/persist.ts` already owns one namespaced, versioned, throttled,
 * quota-tolerant storage key for this application, and the side rail
 * keeps its collapsed state in exactly this way. A second mechanism
 * written here would be a second answer to what happens when a browser
 * refuses to write and a second thing for the reset control to have to
 * know about. This slice costs four lines and inherits all of it.
 *
 * `encode` returns null until the reader has actually chosen, so a person
 * who never touched the header leaves no trace of this card in storage.
 */
const LEGEND_CODEC: SliceCodec<LegendUiState> = {
  slice: "map-legend",
  signature: signatureOf("map-legend.open.v1"),
  encode: (state) =>
    state.chosen === null ? null : { open: state.chosen === true },
  decode: (raw, seed) =>
    isRecord(raw) && typeof raw.open === "boolean"
      ? { chosen: raw.open }
      : seed,
};

// ---------------------------------------------------------------
// The card
// ---------------------------------------------------------------

export interface MapLegendProps {
  /**
   * The board's opening preference, used until the reader overrules it.
   *
   * NOT a controlled value, and the difference matters enough to write
   * down. The board sets this from the viewport, because a 320px card
   * over a 680px map column is most of the map, and that is a good
   * default and a bad memory: a reader who opened the key on a laptop and
   * came back to find it shut again would conclude the control does not
   * work. So this prop seeds the card, the reader's own choice is kept in
   * storage, and the choice wins from then on. `onToggle` is still raised
   * on every press so a parent holding a mirror of this state stays in
   * step with it.
   */
  open?: boolean;
  onToggle?: () => void;
  /**
   * The month the desk scores against. Injected for the same reason it is
   * injected everywhere else on this board: a screenshot has to be
   * reproducible. It cannot change which organisations survive a filter,
   * only the order they come back in, and this card counts rather than
   * orders.
   */
  nowMonth?: number;
  /**
   * An exact lane tally, when the caller has one.
   *
   * The board can narrow further than the shared filters do, through its
   * own page local segment, and this card cannot see that. Left out, the
   * counts here are computed from the shared filters alone, which is
   * right for every default view of the board and one segment press away
   * from being a little generous. The seam is here so that the day the
   * board wants to hand down its own figures, it can, without this file
   * learning what a segment is.
   */
  laneCounts?: Partial<Record<Lane, number>>;
  /**
   * How many organisations the board is actually drawing, when that is
   * fewer than the lane tally implies.
   *
   * A lane partitions the whole board, so summing the showing lanes is
   * the right count for every filter this card owns. It is the wrong
   * count for a filter it does not: taking a go-see run narrows the
   * board to a handful of stops, and this card went on printing
   * "211 of 329 organisations on the map" into a polite live region
   * over a map drawing six pins. A card that announces a number the
   * screen contradicts is worse than a card with no number.
   */
  plottedOverride?: number;
}

/** August, matching the board. The research behind this data was done in it. */
const DEFAULT_NOW_MONTH = 7;

export function MapLegend({
  open,
  onToggle,
  nowMonth = DEFAULT_NOW_MONTH,
  laneCounts,
  plottedOverride,
}: MapLegendProps) {
  const uid = useId();
  const bodyId = `${uid}-body`;
  const titleId = `${uid}-title`;
  const lanesLabelId = `${uid}-lanes`;

  const pipeline = usePipeline();
  const dispatch = usePipelineDispatch();

  const [ui, uiDispatch] = usePersistedReducer(
    legendReducer,
    LEGEND_SEED,
    LEGEND_CODEC,
  );

  /*
    Open above 1024px when nobody has said otherwise and the board has no
    opinion either. Read in the initialiser rather than watched: a key
    that reopens itself because a handset was rotated has overridden a
    decision the reader already made.
  */
  const viewportDefault = useRef<boolean>(
    typeof window === "undefined"
      ? true
      : window.matchMedia("(min-width: 1024px)").matches,
  );

  const isOpen = ui.chosen ?? open ?? viewportDefault.current;

  const toggleOpen = useCallback(() => {
    uiDispatch({ type: "SET_OPEN", open: !isOpen });
    onToggle?.();
  }, [isOpen, onToggle, uiDispatch]);

  // --- The counts --------------------------------------------------

  /*
    The board WITHOUT the lane filter, which is what a lane row has to be
    counted against. Everything else narrowing the board stays on, so the
    figure on each row is the honest answer to "how many will I be left
    with if I press this".

    It is the desk's own selector rather than a filter written here.
    Counting the trade area a second way is how two screens end up
    disagreeing about the same week, and this card is one of three places
    on the board that prints a total.
  */
  const laneRows = useMemo(
    () => deskLines({ ...pipeline, laneFilter: [] }, { nowMonth }),
    [pipeline, nowMonth],
  );

  const counts = useMemo(() => {
    const onBoard = laneCountsOnBoard(laneRows);
    if (!laneCounts) return onBoard;
    for (const lane of LANE_ORDER) {
      const given = laneCounts[lane];
      if (given !== undefined) onBoard[lane] = given;
    }
    return onBoard;
  }, [laneRows, laneCounts]);

  const manifest = useMemo(() => laneGlyphManifest(counts), [counts]);

  /**
   * The lanes currently drawn, as a list rather than as a filter.
   *
   * An empty `laneFilter` means every lane, which is the right thing to
   * store and the wrong thing to render: a row cannot decide whether it
   * is ticked from an empty array without doing this expansion first.
   */
  const showing = useMemo<Lane[]>(
    () => (pipeline.laneFilter.length === 0 ? LANE_ORDER : pipeline.laneFilter),
    [pipeline.laneFilter],
  );
  const showingSet = useMemo(() => new Set(showing), [showing]);

  /*
    What the map is plotting, computed from the same tally the rows print
    rather than counted separately, so the sentence under the control and
    the numbers above it cannot drift apart. A lane partitions the board
    exactly, so the sum over the showing lanes is the plotted count.
  */
  const plottedByLane = showing.reduce((n, lane) => n + (counts[lane] ?? 0), 0);
  const plotted = plottedOverride ?? plottedByLane;
  const everyLane = pipeline.laneFilter.length === 0;

  // --- The dispatches ----------------------------------------------

  /**
   * Write a lane set, normalising "all of them" back to the empty filter.
   *
   * `SET_LANES` replaces the whole filter in one dispatch, which is why
   * this card never fires a burst of toggles: a burst renders the board
   * once per lane and walks the reader through intermediate states nobody
   * asked to see.
   */
  const setLanes = useCallback(
    (lanes: Lane[]) => {
      if (lanes.length === 0 || lanes.length === LANE_ORDER.length) {
        dispatch({ type: "CLEAR_LANES" });
        return;
      }
      dispatch({ type: "SET_LANES", lanes });
    },
    [dispatch],
  );

  /**
   * A row press shows or hides that lane.
   *
   * DELIBERATELY NOT A BARE `TOGGLE_LANE`. On an unfiltered board that
   * action turns an empty filter into a filter of one, so pressing a row
   * that is plainly showing would hide the other eight, which is the
   * opposite of what a ticked row with a tick in it promises. Expanding
   * the filter first and writing the difference back means the control
   * does what it says at every starting point.
   *
   * Switching off the last lane that is left returns the board to
   * everything rather than emptying it. There is no way to say "no lanes"
   * in the shared state, and an empty board reached by pressing a filter
   * off is a screen a reader reads as broken.
   */
  const toggleLane = useCallback(
    (lane: Lane) => {
      const next = showingSet.has(lane)
        ? showing.filter((l) => l !== lane)
        : LANE_ORDER.filter((l) => showingSet.has(l) || l === lane);
      setLanes(next);
    },
    [showing, showingSet, setLanes],
  );

  const onlyLane = useCallback((lane: Lane) => setLanes([lane]), [setLanes]);
  const allLanes = useCallback(() => dispatch({ type: "CLEAR_LANES" }), [dispatch]);

  // --- Keyboard ------------------------------------------------------

  /*
    Every button in this card is an ordinary tab stop, so a keyboard
    reader can already reach all of it without knowing anything special.
    The arrows are laid over the top for somebody working the list
    quickly: up and down walk the lanes, left and right cross between a
    lane and its "only" control, Home and End go to the ends. Enter and
    the space bar are left entirely to the browser, which is what a real
    `button` element is for.
  */
  const toggleRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const onlyRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onLaneKeyDown = useCallback(
    (
      event: KeyboardEvent<HTMLButtonElement>,
      index: number,
      column: "toggle" | "only",
    ) => {
      const last = manifest.length - 1;
      const focus = (i: number, col: "toggle" | "only") => {
        const target =
          col === "only" ? onlyRefs.current[i] : toggleRefs.current[i];
        target?.focus();
      };

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          focus(index === last ? 0 : index + 1, column);
          break;
        case "ArrowUp":
          event.preventDefault();
          focus(index === 0 ? last : index - 1, column);
          break;
        case "ArrowRight":
          event.preventDefault();
          focus(index, "only");
          break;
        case "ArrowLeft":
          event.preventDefault();
          focus(index, "toggle");
          break;
        case "Home":
          event.preventDefault();
          focus(0, column);
          break;
        case "End":
          event.preventDefault();
          focus(last, column);
          break;
        default:
          break;
      }
    },
    [manifest.length],
  );

  // --- The occasion class groups ------------------------------------

  /*
    Derived from the manifest in the order the manifest arrives, so the
    grouping is LANE_ORDER's own and no class is written down here.
  */
  const groups = useMemo(() => {
    const out: { occasionClass: OccasionClass; entries: LaneGlyphManifestEntry[] }[] = [];
    for (const entry of manifest) {
      const found = out.find((g) => g.occasionClass === entry.occasionClass);
      if (found) found.entries.push(entry);
      else out.push({ occasionClass: entry.occasionClass, entries: [entry] });
    }
    return out;
  }, [manifest]);

  /** Where each lane sits in the flat list, for the arrow keys. */
  const indexOfLane = useMemo(() => {
    const index = new Map<Lane, number>();
    manifest.forEach((entry, i) => index.set(entry.lane, i));
    return index;
  }, [manifest]);

  return (
    <section
      className={styles.card}
      data-open={isOpen ? "yes" : "no"}
      aria-labelledby={titleId}
    >
      <h2 className={styles.head}>
        <button
          type="button"
          className={styles.headToggle}
          aria-expanded={isOpen}
          aria-controls={bodyId}
          onClick={toggleOpen}
        >
          <span className={styles.headGlyph} aria-hidden="true">
            {isOpen ? "▾" : "▸"}
          </span>
          {/*
            SHUT, ON A PHONE, THE CARD IS THE WORD "KEY" AND NOTHING ELSE.

            It shares the top edge of the map with the hide list control,
            which on a phone reads "Show the list of 211" and is the wider
            and the more important of the two. At 380px the pair did not
            fit across the screen and the count on that button disappeared
            underneath this card, which is how a reader ends up looking at
            a control that says "Show the list of 21". So this card gives
            up two words while it is shut and while the map is narrow, and
            it keeps them everywhere else.

            The words are hidden from the eye and never from the page. The
            accessible name of the button, and of the card it names, stays
            "Key and filter" at every width, because a screen reader has no
            width problem and "Key" alone is a poorer name.
          */}
          <span id={titleId} className={styles.headLabel}>
            Key<span className={styles.headLabelRest}> and filter</span>
          </span>
          {/*
            THE STATE OF THE FILTER SURVIVES THE CARD BEING SHUT.

            A collapsed key with a filter still on is the one way this
            control can mislead: the reader sees a short board and no
            reason for it. So the badge is drawn whenever the filter is
            narrowing, at every width, and it says how many lanes in
            words and figures rather than by going a different colour.
          */}
          {everyLane ? null : (
            <span className={`${styles.headBadge} num`}>
              {pipeline.laneFilter.length}/{LANE_ORDER.length}
              <span className="visually-hidden"> lanes showing</span>
            </span>
          )}
          <span className={styles.headHint}>{isOpen ? "Hide" : "Show"}</span>
        </button>
      </h2>

      <div id={bodyId} className={styles.body} hidden={!isOpen}>
        <p className={styles.lead}>
          Every mark is a shape, then a drawing, then a colour, in that
          order. Press a lane to show it or hide it. The map, the list and
          the desk all narrow together, because they are one board seen
          three ways.
        </p>

        {/* ---------------------------------------------------------
            THE FILTER
            --------------------------------------------------------- */}

        <div className={styles.filterHead}>
          <h3 className={styles.subhead} id={lanesLabelId}>
            The lanes
          </h3>
          <button
            type="button"
            className={styles.allButton}
            aria-pressed={everyLane}
            onClick={allLanes}
            title="Show every lane on the board again"
          >
            <span className={styles.tick} data-on={everyLane ? "yes" : "no"} aria-hidden="true">
              {everyLane ? "✓" : ""}
            </span>
            <span>All lanes</span>
          </button>
        </div>

        {/*
          THE RESULT, SAID OUT LOUD. One polite region, on the figure that
          actually changed, rather than on the whole card. The space it
          takes is reserved in the stylesheet, so a count going from three
          digits to one does not move the nine rows underneath it.
        */}
        <p className={styles.result} role="status" aria-live="polite">
          <span className={`${styles.resultFigure} num`}>{plotted}</span> of{" "}
          <span className={`${styles.resultFigure} num`}>
            {PROSPECTS.length}
          </span>{" "}
          organisations on the map
          {everyLane ? "" : `, in ${pipeline.laneFilter.length} of ${LANE_ORDER.length} lanes`}
        </p>

        <div className={styles.groups} role="group" aria-labelledby={lanesLabelId}>
          {groups.map((group) => {
            const meta = OCCASION_CLASS_META[group.occasionClass];
            const shape = group.entries[0]?.bodyShape === "pointed" ? "Pointed" : "Square";
            return (
              <div key={group.occasionClass} className={styles.group}>
                {/*
                  THE TEACHING THE FILTER WAS NOT ALLOWED TO EAT. The pair
                  of shapes is the sharpest line in this domain model: a
                  pointed cap means the calendar buys, a square cap means a
                  person decides. It is stated over the group it describes
                  rather than in a paragraph somewhere else, so the rule
                  and the marks it explains are read together.
                */}
                <p className={styles.groupHead}>
                  <strong>
                    {shape} cap, {meta.label.toLowerCase()}.
                  </strong>{" "}
                  {meta.what}
                </p>

                <ul className={styles.rows}>
                  {group.entries.map((entry) => {
                    const i = indexOfLane.get(entry.lane) ?? 0;
                    const on = showingSet.has(entry.lane);
                    const only =
                      pipeline.laneFilter.length === 1 &&
                      pipeline.laneFilter[0] === entry.lane;
                    return (
                      <li key={entry.lane} className={styles.row}>
                        <button
                          type="button"
                          ref={(el) => {
                            toggleRefs.current[i] = el;
                          }}
                          className={styles.rowToggle}
                          data-on={on ? "yes" : "no"}
                          data-lane={entry.lane}
                          aria-pressed={on}
                          title={
                            on
                              ? `Hide ${entry.label} on the map, the list and the desk`
                              : `Show ${entry.label} again`
                          }
                          onClick={() => toggleLane(entry.lane)}
                          onKeyDown={(event) => onLaneKeyDown(event, i, "toggle")}
                        >
                          <span
                            className={styles.tick}
                            data-on={on ? "yes" : "no"}
                            aria-hidden="true"
                          >
                            {on ? "✓" : ""}
                          </span>

                          {/*
                            The mark itself, from the same scene the map
                            draws, never a lookalike redrawn here. A key
                            that keeps its own copy of a marker is a key
                            that goes stale the first time somebody nudges
                            a roofline, and a reader believes a key.
                          */}
                          <LaneGlyph
                            lane={entry.lane}
                            variant="mark"
                            size={28}
                            decorative
                            className={styles.rowMark}
                          />

                          <span className={styles.rowLabel}>{entry.label}</span>

                          {/*
                            THE COUNT, ON EVERY ROW, ALWAYS, AND ZERO IS A
                            SENTENCE RATHER THAN A BLANK.

                            Both lines are drawn whether or not there is
                            anything to put in the second one, so the space
                            is reserved and a lane dropping to nought moves
                            nothing underneath it. An empty cell would read
                            as a figure that failed to load; "none here"
                            reads as the answer it actually is.
                          */}
                          <span
                            className={styles.rowCount}
                            data-zero={entry.count === 0 ? "yes" : "no"}
                          >
                            <span className={`${styles.rowCountFigure} num`}>
                              {entry.count}
                            </span>
                            <span className={styles.rowCountWord}>
                              {entry.count === 0 ? "none here" : ""}
                            </span>
                          </span>

                          <span className={styles.rowMeta}>
                            {entry.drawing}. {on ? "Showing" : "Hidden"}.
                          </span>
                        </button>

                        {/*
                          THE WAY TO ISOLATE ONE LANE, AS A CONTROL RATHER
                          THAN AS A MODIFIER KEY.

                          A modifier click is smaller and nobody finds it.
                          This is a real button with a real name, it is in
                          the tab order, the right arrow reaches it from
                          the row beside it, and it is 44 pixels of target
                          on a phone where there is no modifier key to
                          hold down at all.
                        */}
                        <button
                          type="button"
                          ref={(el) => {
                            onlyRefs.current[i] = el;
                          }}
                          className={styles.rowOnly}
                          data-on={only ? "yes" : "no"}
                          aria-pressed={only}
                          title={`Show ${entry.label} and nothing else`}
                          onClick={() => onlyLane(entry.lane)}
                          onKeyDown={(event) => onLaneKeyDown(event, i, "only")}
                        >
                          <span aria-hidden="true">Only</span>
                          <span className="visually-hidden">
                            Show {entry.label} and nothing else
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        {/* ---------------------------------------------------------
            THE MARKS THAT ARE NOT FILTERS
            --------------------------------------------------------- */}

        <h3 className={styles.subhead}>The other marks, which are not filters</h3>
        <p className={styles.note}>
          Nothing below this line is a control. These are the rest of the
          things the map draws, and they are kept apart from the lanes on
          purpose, so that nobody presses "Booked" expecting a narrowing
          that this card does not offer.
        </p>

        <ul className={styles.entries}>
          <li className={`${styles.entry} ${styles.entryStacked}`}>
            <VenueGlyph name={VENUE.name} decorative className={styles.entryWide} />
            <span className={styles.entryText}>
              <strong>Our own branch.</strong> A broken ring, because a solid
              pin at the centre of the board would read as one more prospect.
              Service Champions has traded from 625 Columbia Street in Brea for
              twenty five years, and the plate under the ring reads "Our
              address" so the ring is never read as a state of the business.
            </span>
          </li>

          <li className={styles.entry}>
            <span className={styles.entryMark}>
              <ClusterGlyph count={7} size={30} decorative />
            </span>
            <span className={styles.entryText}>
              <strong>A numeral in a circle, several organisations.</strong>{" "}
              They sit too close together at this zoom to draw separately, and
              the numeral counts what is on the board right now, so it agrees
              with the lane filter above. Press it to zoom in and separate
              them. The bubble is grey on purpose: a cluster spans lanes, and
              colouring it by whichever lane happens to be in the majority
              would be a claim the data does not support.
            </span>
          </li>

          <li className={styles.entry}>
            <span
              className={styles.entryMark}
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: SELECTED_TREATMENT.markSvg }}
            />
            <span className={styles.entryText}>
              <strong>Halo, selected.</strong> {SELECTED_TREATMENT.note}
            </span>
          </li>

          <li className={styles.entry}>
            <span className={styles.entryMark} aria-hidden="true">
              <svg width="30" height="30" viewBox="0 0 34 34">
                <circle className={styles.ringSwatch} cx="17" cy="17" r="6" />
                <circle className={styles.ringSwatch} cx="17" cy="17" r="10" />
                <circle className={styles.ringSwatch} cx="17" cy="17" r="14" />
              </svg>
            </span>
            <span className={styles.entryText}>
              <strong>Broken circles, straight line miles.</strong> One, three
              and five miles as the crow flies from Columbia Street. These are not
              drive times and nothing on this screen should be read as one. A
              mile is walkable. Three miles is a twenty minute round trip. Five
              miles is half a day unless it is run with two or three others.
            </span>
          </li>

          <li className={styles.entry}>
            <span className={styles.entryMark} aria-hidden="true">
              <svg width="30" height="30" viewBox="0 0 34 34">
                <path
                  className={styles.outlineSwatch}
                  d="M6 22 L11 8 L26 10 L28 24 L14 27 Z"
                />
              </svg>
            </span>
            <span className={styles.entryText}>
              <strong>The faint outline, cosmetic.</strong> The convex hull of
              whatever is currently plotted. It is where these organisations
              happen to sit, and it is not a claim about where custom comes
              from.
            </span>
          </li>
        </ul>

        {/* ---------------------------------------------------------
            STATE ON THE MARK
            --------------------------------------------------------- */}

        <h3 className={styles.subhead}>How far each one has got</h3>
        <ul className={styles.states}>
          {STATE_TREATMENTS.map((state) => (
            <li key={state.status} className={styles.state}>
              <span
                className={styles.stateMark}
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: state.markSvg }}
              />
              <span className={styles.entryText}>
                <strong>
                  <span className={styles.stateGlyph} aria-hidden="true">
                    {state.glyph}
                  </span>{" "}
                  {state.label}.
                </strong>{" "}
                {state.treatment}
              </span>
            </li>
          ))}
        </ul>
        <p className={styles.note}>
          State is drawn as a pip on the corner and it is not filtered from
          here. The board's own strip above the map is where a reader asks
          for the untouched ones or the live conversations, because that is
          a way of looking at this one board rather than a permanent fact
          about an organisation, and a lane is the other way round.
        </p>
      </div>
    </section>
  );
}
