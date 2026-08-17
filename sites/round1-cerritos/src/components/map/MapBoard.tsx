import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "react-router-dom";
import "leaflet/dist/leaflet.css";

import type { Lane, OccasionClass, Prospect } from "@/domain/types";
import {
  applyBoardSegment,
  boardCountLine,
  boardRows,
  isOnBoard,
  mapBoardStats,
  mapBoardTotals,
  occasionCounts,
  occasionSegmentValue,
  rowForProspect,
  segmentCounts,
  type BoardSegment,
} from "@/domain/selectors/mapBoard";
import {
  goSeeRuns,
  runById,
  runProspectIds,
  runSentence,
  runnableCount,
} from "@/domain/selectors/goSeeRuns";
import { usePipeline, usePipelineDispatch } from "@/state/PipelineProvider";
import {
  EmailComposeModal,
  type ComposeIntent,
} from "@/components/email/EmailComposeModal";
import { MapCanvas } from "./MapCanvas";
import { MapLegend } from "./MapLegend";
import { MapStatBar } from "./MapStatBar";
import { OffersCard } from "./OffersCard";
import { ProspectListPane } from "./ProspectListPane";
import {
  ProspectDetailPane,
  type DetailSubTab,
  type DetailTab,
  type PackageFilter,
} from "./ProspectDetailPane";
import { lanesOfClass, setLaneFilter } from "./OccasionSegment";

import styles from "./MapBoard.module.css";

/**
 * THE BOARD. Three panes, one selection, one modal, and every piece of
 * page state in this one file.
 *
 * WHAT IT IS. The list of organisations on the left, the map in the
 * middle with its floating cards, the detail panel on the right, and the
 * figure strip across the top of all three. Clicking anything anywhere
 * selects the same organisation everywhere, and every write button on
 * the page, on each list row, in the marker popups and in the panel,
 * opens the one compose modal this page owns.
 *
 * ── THE COMPOSE ACTION IS ON THE ROW, NOT BEHIND THE SELECTION ────
 * This board shipped once with the compose modal reachable only from the
 * detail panel, and the detail panel is empty until an organisation has
 * been selected. The arithmetic of that is worth stating plainly: on
 * arrival there were zero controls anywhere on the screen whose name
 * mentioned writing to anybody, and one only after a click nobody had
 * been told to make. The owner opened it, went looking for the way to
 * send an email, did not find one, and concluded the feature had not
 * been built. Nothing was broken. The primary action of the screen was
 * simply invisible, which for a person using it is the same thing.
 *
 * So `openCompose` now goes to every surface that draws an organisation,
 * and every one of them draws its own always-visible control. The state
 * stays exactly where it was and there is still exactly one modal.
 *
 * ── WHY THE STATE LIVES HERE AND NOT IN A PROVIDER ────────────────
 * None of it is a fact about the pipeline. Which organisation a reader
 * is looking at, which tab of the panel is open, whether they collapsed
 * the list: that is a description of one person's afternoon on one
 * screen, and putting it in `PipelineProvider` would make it survive a
 * navigation, which is exactly wrong. Come back to this screen tomorrow
 * and it should be showing the whole board again.
 *
 * The things that ARE facts about the pipeline stay shared and are not
 * duplicated here for a second: the lane filter, the search query, the
 * written door switch and every status. Filter to schools on this map
 * and the desk is filtered to schools when the reader gets back to it.
 * A filter that only applies to the screen you set it on is a filter
 * that makes two screens disagree about what the week contains.
 *
 * The single exception is the board segment, which is page local on
 * purpose and the reason is worth stating. A lane is a permanent
 * property of an organisation and a reader expects it to travel. "Show
 * me only the ones nobody has touched" is a way of looking at this one
 * board, and the desk already answers the same question through its own
 * ordering.
 *
 * ── ONE SELECTION, HELD AS AN ID ──────────────────────────────────
 * Never as a row object. A row frozen at the moment of selection would
 * leave the panel showing a stale touch count while the card beside it
 * showed the new one, seconds after somebody recorded a touch from the
 * panel itself. Holding the id and deriving the row means one status
 * change moves every figure on the screen at once, which is the property
 * this whole application exists to demonstrate.
 *
 * And when a filter removes the selected organisation, the panel does
 * NOT close. It keeps rendering, with a line above the tabs saying it is
 * out of the current filter and a button that clears the filters.
 * Closing a panel somebody is reading, for a reason they did not ask
 * for, loses their place.
 *
 * ── THE MAP IS MOUNTED ONCE AND NEVER UNMOUNTED ───────────────────
 * Across every breakpoint, every collapse and every pane switch. A
 * Leaflet container that is unmounted takes the zoom, the pan and every
 * marker with it, and a reader who rotates a handset should not lose
 * their place as a result. The panes around it appear and disappear; the
 * map only ever changes size, and `MapCanvas` watches its own box with a
 * ResizeObserver and re-measures itself, so nothing here has to chase a
 * transition with a timer.
 *
 * ── THE FIT SIGNATURE IS THE MOST IMPORTANT PROP ON THIS PAGE ─────
 * `MapCanvas` refits the view when, and only when, that string changes.
 * It is built from the shared filters and the board segment, and from
 * nothing else. Rebuilding it from the row array, or from anything that
 * changes identity on every render, is the single defect that makes a
 * Leaflet page unusable: the map yanks itself back to the whole trade
 * area every time somebody records a touch.
 *
 * ── FOUR LAYOUTS, NOT ONE LAYOUT THAT SHRINKS ─────────────────────
 * Above 1024px there are three panes. Below it the panel becomes an
 * overlay. Below 768px the list becomes a sheet that rises from the
 * bottom over a full width map. At 380px and below there is one pane and
 * a switcher, because a 328px list beside a map beside a 432px panel on
 * a 375px screen is three unusable things instead of one usable one.
 *
 * ── THE PHONE VERTICAL BUDGET, WHICH IS THE WHOLE ARGUMENT ────────
 * Measured on a 380 by 820 handset, before this file changed: the app
 * chrome takes 145 pixels of navigation at the top and 72 of footer at
 * the bottom, and neither belongs to this board. The page header band
 * above it takes another 105. The figure strip takes about 150 and the
 * pane switcher about 65. What reached the map was 284 pixels, roughly a
 * third of the screen, and inside that third the cluster bubbles, the
 * ring labels and the venue plate were all drawing on top of each other.
 * A map that small is not a small map, it is a picture of a map.
 *
 * So on a phone the strip moves BELOW the board and the shell becomes the
 * scroll region. The board is then the first thing under the page header
 * and it takes every pixel that is left, and the seven figures are one
 * ordinary downward flick away, in the direction a person already scrolls.
 *
 * The two alternatives were both worse. Leaving the strip above and asking
 * the reader to scroll the chrome away means landing on the same 284 pixel
 * map and having to discover an upward gesture to fix it, and content
 * hidden ABOVE the initial scroll position is content most people never
 * find. Dropping the strip on a phone was the other option, and section
 * 1.3 is explicit that the figures are the point of the strip and it may
 * not collapse into a sentence; they are not dropped, they are moved.
 *
 * What is given up is that a filter control now sits under the thing it
 * filters. That is a real cost and it is the smaller one: the segment is
 * three buttons carrying their own counts, it announces its result through
 * the live region this file already renders, and the lane filter, the
 * search box and the occasion segment a reader reaches for first all live
 * in the list sheet rather than in the strip.
 */

export type BoardMode =
  | "three-pane"
  | "detail-overlay"
  | "list-sheet"
  | "single";

export type SinglePane = "list" | "map" | "detail";

export interface MapBoardProps {
  /**
   * The month the desk scores against, injected rather than read from
   * the clock so a screenshot of this board is reproducible. Seven is
   * August, when the research behind this data set was done.
   */
  nowMonth?: number;
  /**
   * What the chrome band calls this screen. The route supplies it, so a
   * board embedded anywhere else can name itself something else without
   * this file learning a second route's name.
   */
  screenName?: string;
  /** The line under the name. One short sentence, no more. */
  screenNote?: string;
  /**
   * The way out of the takeover, from `useFullBleedExit`. Absent when the
   * board is not the whole viewport, and the Back control is then simply
   * not drawn rather than drawn dead.
   */
  onExit?: () => void;
  /**
   * A route level control that belongs beside Back rather than beside the
   * board's own switches, which in practice means the mode
   * mode switch.
   *
   * WHY THE SLOT EXISTS. Every other screen carries that switch on the
   * mega nav, and this one unmounts the mega nav along with the rail
   * because it is a takeover. Without somewhere to put it, Maps is the
   * single screen in the application from which its own explanation is
   * unreachable, and "every screen has an explanation at its own address"
   * stops being true on exactly the screen a reader is most likely to ask
   * the question. A walk of all twenty seven screens in both modes is
   * what surfaced it.
   *
   * It is a slot rather than a hardcoded link for the same reason `note`
   * is: the board has no business knowing what routes exist.
   */
  modeLink?: ReactNode;
  /**
   * The page's own prose, slotted into the chrome band. The board draws
   * the band because the band carries a live view of board state, the
   * hide list control; the page writes the words because the words are
   * the page's argument and this component has no business holding four
   * hundred words about the difference between a circle and a drive.
   */
  note?: ReactNode;
}

const DEFAULT_NOW_MONTH = 7;

/** The id the hide control's `aria-controls` points at. */
const LIST_ID = "map-board-list";

/**
 * The convex hull around whatever is plotted is drawn permanently.
 *
 * It is a constant rather than a piece of state because there is no
 * control anywhere on this screen that turns it off, and a boolean in
 * `useState` with no writer is a lie about how the screen works. The key
 * already names the shape and says out loud that it is cosmetic, which
 * is the thing that actually mattered: an outline drawn round a set of
 * pins reads as a catchment boundary, and it is not one.
 */
const SHOW_OUTLINE = true;

/**
 * The three positions of the phone switcher, with the words a reader
 * sees. Shape first, so the control survives a greyscale filter.
 */
const SINGLE_PANES: { id: SinglePane; glyph: string; label: string }[] = [
  { id: "list", glyph: "▤", label: "List" },
  { id: "map", glyph: "◎", label: "Map" },
  { id: "detail", glyph: "▥", label: "Detail" },
];

/**
 * Which of the four layouts the viewport is asking for.
 *
 * Read from `matchMedia` rather than from a resize handler with a width
 * comparison, so the browser does the comparing and the component only
 * hears about it when the answer actually changes. The breakpoints are
 * 1024 and 768 rather than this codebase's usual 1000 and 720 because
 * these panes are fixed pixel columns rather than a fluid table, and 328
 * plus 432 plus a usable map does not survive past 1024.
 */
function readMode(): BoardMode {
  if (typeof window === "undefined" || !window.matchMedia) return "three-pane";
  if (window.matchMedia("(max-width: 380px)").matches) return "single";
  if (window.matchMedia("(max-width: 768px)").matches) return "list-sheet";
  if (window.matchMedia("(max-width: 1024px)").matches) return "detail-overlay";
  return "three-pane";
}

function useBoardMode(): BoardMode {
  const [mode, setMode] = useState<BoardMode>(readMode);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const queries = [
      "(max-width: 380px)",
      "(max-width: 768px)",
      "(max-width: 1024px)",
    ].map((q) => window.matchMedia(q));
    const onChange = () => setMode(readMode());
    for (const q of queries) q.addEventListener("change", onChange);
    return () => {
      for (const q of queries) q.removeEventListener("change", onChange);
    };
  }, []);

  return mode;
}

export function MapBoard({
  nowMonth = DEFAULT_NOW_MONTH,
  screenName = "The trade area",
  screenNote,
  onExit,
  modeLink,
  note,
}: MapBoardProps) {
  const pipeline = usePipeline();
  const dispatch = usePipelineDispatch();
  const mode = useBoardMode();

  // --- Page state, all of it --------------------------------------

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectionSource, setSelectionSource] = useState<
    "list" | "map" | "none"
  >("none");
  /** True when the left column is collapsed, or when the sheet is shut. */
  const [listHidden, setListHidden] = useState<boolean>(
    () => readMode() === "list-sheet",
  );
  const [segment, setSegment] = useState<BoardSegment>("all");
  /*
    THE RUN ON THE BOARD, HELD AS THE SEED ORGANISATION'S ID.

    A run is a way of looking at this one board, exactly as the segment is,
    so it is page local and it does not travel to the desk. It is held as
    an id rather than as a copy of the run for the same reason the
    selection is: the run object is rebuilt by the selector every time
    somebody records a touch, and a frozen copy would leave the map drawing
    a path through stops whose figures had already moved on.
  */
  const [runId, setRunId] = useState<string | null>(null);
  /** Which run is being offered while none is on the board. */
  const [runOffer, setRunOffer] = useState(0);
  /*
    A PHONE ARRIVES ON THE LIST, NOT ON THE MAP.

    This used to open on the map, and on a phone that is a screen of
    unlabelled pins with nothing on it a person can act on: no names, no
    ranking, and, before this wave, no way to write to anybody anywhere
    on the page. The list is the actionable pane. It carries the names,
    the order the desk would work them in and, now, a write button on
    every row, and the map is one press away in the switcher directly
    underneath it.

    Read once at mount, so this only decides where a reader LANDS.
    Narrowing a window later leaves whatever they were looking at alone,
    on the same principle as the deliberate collapse below.
  */
  const [singlePane, setSinglePane] = useState<SinglePane>(() =>
    readMode() === "single" ? "list" : "map",
  );
  /*
    THE KEY STARTS OPEN ONLY WHERE THERE IS A MAP LEFT UNDERNEATH IT.

    The key is 320px wide and the offers card is another 320, and they
    are pinned to opposite corners of the map column. With three panes
    the map column is the viewport less 328 for the list and 432 for the
    panel, so on a 1440px screen it is 680 and two 320px cards cover it
    almost entirely. The threshold is that arithmetic run backwards: 328
    plus 432 plus 840 of usable map is 1600, and below that the key waits
    behind its own header, which still names itself in words. Read once
    at mount rather than watched, because a key that reopens itself
    because somebody resized a window has overridden a decision the
    reader already made.
  */
  const [legendOpen, setLegendOpen] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1600px)").matches,
  );
  const [offerIndex, setOfferIndex] = useState(0);
  /*
    Whether a marker popup is open on the map. Held here rather than in
    the canvas because the thing that has to react to it is a card THIS
    component put into the canvas's overlay, and a pane should not be
    given an opinion about children it was handed.
  */
  const [popupOpen, setPopupOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<DetailTab>("packages");
  const [detailSubTab, setDetailSubTab] = useState<DetailSubTab>("fit");
  const [packageFilter, setPackageFilter] = useState<PackageFilter>("best");
  const [compose, setCompose] = useState<{
    prospect: Prospect;
    intent: ComposeIntent;
    packageId?: string;
  } | null>(null);

  const listToggleRef = useRef<HTMLButtonElement>(null);
  /** The switcher's list position, which is the phone's way into the list. */
  const singleListRef = useRef<HTMLButtonElement>(null);
  const sheetCloseRef = useRef<HTMLButtonElement>(null);

  // --- Rows, totals and figures, counted exactly once --------------

  /*
    The shared filters land first and the page local segment second, and
    the order is not arbitrary: the counts read to a person that way
    round. "Nine of the thirty one schools have never been touched" is a
    sentence. "Nine of the forty untouched organisations are schools" is
    a different sentence about a different thing, and the segment control
    is asking the first one.
  */
  const shared = useMemo(
    () => boardRows(pipeline, { nowMonth }),
    [pipeline, nowMonth],
  );
  const segmented = useMemo(
    () => applyBoardSegment(shared, segment),
    [shared, segment],
  );

  /*
    ── THE RUNS, WHICH ARE THE ONE THING ONLY THIS SCREEN CAN SAY ────

    Built from the rows the shared filters and the segment have already
    left, so a run can never send somebody to a door the list beside the
    map is refusing to show them. Built BEFORE the run filter below,
    because a set of runs computed from the stops of one run would collapse
    to that run and the reader could never reach the next one.

    The arithmetic is a hundred rows against a hundred rows of haversine,
    which is a fraction of a millisecond, and it is memoised on `segmented`
    rather than run per render because `segmented` is rebuilt every time
    anybody records a touch.
  */
  const runs = useMemo(() => goSeeRuns(segmented), [segmented]);
  const activeRun = runById(runs, runId);
  /*
    The run being offered when none has been taken. Held as an index into
    the ranked runs rather than as an id, because "the next one" is a
    position in a list and the list is rebuilt whenever the board changes;
    it is clamped at the point of use so a filter that leaves four runs
    where there were nine cannot leave this pointing past the end.
  */
  const shownRun = activeRun ?? runs[runOffer % Math.max(runs.length, 1)] ?? null;

  const rows = useMemo(() => {
    if (!activeRun) return segmented;
    const ids = runProspectIds(activeRun);
    return segmented.filter((row) => ids.has(row.prospect.id));
  }, [segmented, activeRun]);

  const counts = useMemo(() => segmentCounts(shared), [shared]);
  /*
    When a run is on the board the figure is that run's own stops, and
    when it is not it is every organisation any run holds. Both are the
    honest answer to "how many of what I am looking at are in a run", and
    the alternative, printing the whole book's figure over a board showing
    six rows, is the kind of disagreement this selector file exists to
    stop.
  */
  const inARun = activeRun ? activeRun.stops.length : runnableCount(runs);
  const totals = useMemo(
    () => mapBoardTotals(rows, pipeline, inARun),
    [rows, pipeline, inARun],
  );
  const stats = useMemo(() => mapBoardStats(totals), [totals]);
  const occasionTotals = useMemo(() => occasionCounts(), []);

  /*
    The selected row, derived. When the filter has removed it, it is
    rebuilt from the unfiltered trade area rather than looked up in a
    frozen copy, so the panel keeps showing live figures for an
    organisation that is no longer on the board.
  */
  const selectedRow = useMemo(() => {
    if (!selectedId) return null;
    const onBoard = rows.find((r) => r.prospect.id === selectedId);
    if (onBoard) return onBoard;
    return rowForProspect(selectedId, pipeline, nowMonth);
  }, [rows, selectedId, pipeline, nowMonth]);

  const outOfFilter = selectedId !== null && !isOnBoard(rows, selectedId);

  /*
    THE ONLY THING THAT REFITS THE MAP. Filters and the segment, as a
    string. Not the rows, not the selection, not a status change.
  */
  const fitSignature = useMemo(
    () =>
      [
        [...pipeline.laneFilter].sort().join("+") || "all-lanes",
        pipeline.query.trim().toLowerCase(),
        pipeline.emailableOnly ? "written-door" : "every-door",
        segment,
        /* Taking a run narrows the board to six stops a third of a mile
           apart, and a view still framed on a thirteen mile trade area
           would show them as one dot. Clearing it puts the territory
           back. Both are filter changes and this is the string that
           says so. */
        runId ?? "no-run",
      ].join("|"),
    [pipeline.laneFilter, pipeline.query, pipeline.emailableOnly, segment, runId],
  );

  // --- Deep link ---------------------------------------------------

  /*
    `/map?prospect=<id>` selects on mount, which is the link the map
    popup and the desk already write. Read once: keeping the selection in
    the query string afterwards would put a history entry behind every
    click on a list card and turn the back button into an undo nobody
    asked for.
  */
  const [search] = useSearchParams();
  const deepLink = search.get("prospect");
  useEffect(() => {
    if (!deepLink) return;
    setSelectedId(deepLink);
    setSelectionSource("none");
    if (readMode() === "single") setSinglePane("detail");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Layout reactions --------------------------------------------

  /*
    Crossing into the sheet layout shuts the sheet, and crossing back out
    of it reopens the column. Anything else and a reader who narrowed
    their window would find a sheet sitting over the whole map, or a
    collapsed column they never collapsed. Nothing happens on the
    breakpoints either side of that, so a deliberate collapse survives a
    resize.
  */
  const previousMode = useRef(mode);
  useEffect(() => {
    const was = previousMode.current;
    if (was === mode) return;
    previousMode.current = mode;
    if (mode === "list-sheet" && was !== "list-sheet") setListHidden(true);
    if (mode !== "list-sheet" && was === "list-sheet") setListHidden(false);
  }, [mode]);

  /*
    THE LIST IS A SHEET ON A PHONE, AND THE MEASUREMENTS ARE THE ARGUMENT.

    At 380px this application's own chrome takes 145px of navigation and
    72px of footer before this page draws anything, and the header, the
    figure strip and the pane switcher take another 250. What is left for
    a pane is under three hundred pixels, and the list pane's own sticky
    header, which carries the occasion segment, the search box, nine lane
    chips and the count, is three hundred and ten on its own. A list
    column on a phone is therefore a header with no list under it.

    So on a phone the board holds the map, and the list arrives as a
    sheet at 85 per cent of the viewport, where it has seven hundred
    pixels and shows real cards. The switcher still has three positions,
    because the reader still needs one obvious control that names the
    three things; two of the three simply come up over the map rather
    than inside it. That is a design decision about a phone, which is
    what section 1.3 asks for, rather than three columns crushed.
  */
  const sheetOpen =
    mode === "list-sheet"
      ? !listHidden
      : mode === "single"
        ? singlePane === "list"
        : false;

  /*
    Focus goes back to whatever would open the sheet again, and that is
    not the same control in both layouts. Between 380 and 768 it is the
    toggle in the chrome band. At 380 and below the band's toggle is not
    drawn at all, because the switcher immediately under it already names
    the three panes and does the same job with three labelled positions,
    so the way back in is the switcher's own list position.
  */
  const closeSheet = useCallback(() => {
    if (readMode() === "single") {
      setSinglePane("map");
      window.requestAnimationFrame(() => singleListRef.current?.focus());
      return;
    }
    setListHidden(true);
    window.requestAnimationFrame(() => listToggleRef.current?.focus());
  }, []);

  /* Escape shuts the sheet, on the same terms as the detail overlay,
     and the focus goes back to the control that opened it. */
  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      closeSheet();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sheetOpen, closeSheet]);

  /*
    Focus moves into the sheet when it OPENS, because a panel that
    appears behind the reader's focus is a panel they cannot use.

    It deliberately does not fire when the sheet simply STARTS open,
    which is now the case on a phone. Moving focus off the top of the
    document during the first paint drops a screen reader past the
    skip link, the navigation and the page heading, into the middle of a
    page it has not been told anything about yet. Landing on the list is
    a layout decision; it is not a reason to take somebody's place away
    before they have one.
  */
  const sheetWasOpen = useRef(sheetOpen);
  useEffect(() => {
    const was = sheetWasOpen.current;
    sheetWasOpen.current = sheetOpen;
    if (sheetOpen && !was) sheetCloseRef.current?.focus();
  }, [sheetOpen]);

  // --- Handlers ----------------------------------------------------

  const selectFromList = useCallback(
    (prospectId: string) => {
      setSelectedId(prospectId);
      setSelectionSource("list");
      /* A tap that appears to do nothing is worse than a pane change, so
         choosing an organisation on a phone takes the reader to it. */
      if (readMode() === "single") setSinglePane("detail");
      /* Only one overlay at a time. Opening an organisation from the
         sheet shuts the sheet under the panel that is about to cover it. */
      if (readMode() === "list-sheet") setListHidden(true);
    },
    [],
  );

  /*
    The phone switcher. Choosing "Detail" with nothing selected is not
    possible, because the position is disabled until there is something
    to show, which is why the disabled state carries the reason in its
    title rather than just going grey.
  */
  const showPane = useCallback((pane: SinglePane) => {
    setSinglePane(pane);
  }, []);

  const selectFromMap = useCallback((prospectId: string | null) => {
    setSelectedId(prospectId);
    setSelectionSource(prospectId ? "map" : "none");
  }, []);

  const openDetailFromMap = useCallback((prospectId: string) => {
    setSelectedId(prospectId);
    setSelectionSource("map");
    if (readMode() === "single") setSinglePane("detail");
  }, []);

  /*
    Closing the panel clears the selection everywhere, so the marker
    stops looking chosen and the list card stops looking chosen with it.
    On a phone it also puts the reader back where the selection came
    from, which is the list if they chose from the list and the map if
    they chose from a pin. Returning them to a fixed pane instead would
    be a second surprise on top of the panel disappearing.
  */
  const closeDetail = useCallback(() => {
    const cameFrom = selectionSource;
    setSelectedId(null);
    setSelectionSource("none");
    if (readMode() === "single")
      setSinglePane(cameFrom === "list" ? "list" : "map");
  }, [selectionSource]);

  const openCompose = useCallback(
    (prospect: Prospect, intent: ComposeIntent, packageId?: string) => {
      setCompose({ prospect, intent, packageId });
    },
    [],
  );

  /*
    The one place the shared filters are cleared, wired to the panel's
    "out of the current filter" line and to the skip that leads nowhere.
    The board segment goes back to "all" with them, because a reader who
    asks for the filters to be cleared means the board, not four of the
    five things narrowing it.
  */
  const clearFilters = useCallback(() => {
    dispatch({ type: "CLEAR_LANES" });
    dispatch({ type: "SET_QUERY", query: "" });
    if (pipeline.emailableOnly) dispatch({ type: "TOGGLE_EMAILABLE_ONLY" });
    setSegment("all");
    setRunId(null);
  }, [dispatch, pipeline.emailableOnly]);

  /* ---------------------------------------------------------------
     The run
     --------------------------------------------------------------- */

  /*
    Taking a run narrows the board to its stops, so it goes through the
    same door every other filter does: the map refits because the fit
    signature changed, the list shows exactly those rows, the strip
    recounts, and the list's own filter bar prints a chip that drops it
    again. Nothing here is a second mechanism.
  */
  const takeRun = useCallback((id: string) => {
    setRunId(id);
  }, []);

  const clearRun = useCallback(() => {
    setRunId(null);
  }, []);

  /* Round rather than clamp, so the last run leads back to the first
     instead of leaving the control dead at the end of the list. */
  const nextRun = useCallback(() => {
    setRunOffer((at) => at + 1);
  }, []);

  const changeOccasion = useCallback(
    (value: OccasionClass | null) => {
      const lanes: Lane[] = value ? lanesOfClass(value) : [];
      setLaneFilter(dispatch, lanes);
    },
    [dispatch],
  );

  /*
    The stops as a path, memoised on the run rather than rebuilt every
    render. An array with a fresh identity on every pass handed to a
    Leaflet layer is how a vector gets torn down and redrawn for nothing,
    which is the same defect the marker memo one file down exists to stop.
  */
  const runPath = useMemo<[number, number][] | null>(
    () =>
      shownRun
        ? shownRun.stops.map((stop) => [stop.line.prospect.lat, stop.line.prospect.lng])
        : null,
    [shownRun],
  );

  /** The list is a column in two layouts and a sheet in the other two. */
  const listIsColumn = mode === "three-pane" || mode === "detail-overlay";
  const listOnScreen = listIsColumn ? !listHidden : sheetOpen;

  const toggleList = useCallback(() => {
    if (readMode() === "single") {
      setSinglePane((pane) => (pane === "list" ? "map" : "list"));
      return;
    }
    setListHidden((hidden) => !hidden);
  }, []);

  /*
    The skip control. In every layout the list is the route to every row
    the map draws, and in two of the four layouts the list is behind a
    control. So this does whatever it takes to put the reader in it,
    rather than pointing at an element that is not on screen.
  */
  const skipToList = useCallback(() => {
    if (readMode() === "single") setSinglePane("list");
    else setListHidden(false);
    window.requestAnimationFrame(() => {
      document.getElementById(LIST_ID)?.querySelector("input")?.focus();
    });
  }, []);

  // --- The pieces ---------------------------------------------------

  const listNode = (
    <ProspectListPane
      id={LIST_ID}
      rows={rows}
      totalInTradeArea={totals.inTradeArea}
      selectedId={selectedId}
      onSelect={selectFromList}
      /*
        THE COMPOSE ACTION GOES ALL THE WAY DOWN TO THE ROW, and it is
        the same handler the panel and the popup use, so all three open
        the one modal below. Before this, the only route in was the
        panel, and the panel is empty until something has been selected:
        the count of visible write controls on this screen at first paint
        was zero, and a reader looking for the way to send a message
        concluded, correctly on the evidence, that there was not one.
      */
      onCompose={openCompose}
      occasion={occasionSegmentValue(pipeline.laneFilter)}
      onOccasionChange={changeOccasion}
      occasionCounts={occasionTotals}
      selectionSource={selectionSource}
      variant={mode === "list-sheet" ? "sheet" : "column"}
      nowMonth={nowMonth}
      /*
        A run narrows the board, so it says so where every other narrowing
        already says so, in the pane's own "Narrowing the board" bar, and
        it is dropped by the same kind of chip. A filter with no visible
        way off is a board a reader cannot get back.
      */
      extraFilters={
        activeRun
          ? [
              {
                key: "run",
                label: `Go-see run: ${activeRun.stops.length} stops`,
                clear: clearRun,
              },
            ]
          : []
      }
    />
  );

  const detailNode = (
    <ProspectDetailPane
      line={selectedRow}
      onClose={closeDetail}
      onCompose={openCompose}
      tab={detailTab}
      onTabChange={setDetailTab}
      subTab={detailSubTab}
      onSubTabChange={setDetailSubTab}
      packageFilter={packageFilter}
      onPackageFilterChange={setPackageFilter}
      asOverlay={mode !== "three-pane"}
      outOfFilter={outOfFilter}
      onClearFilters={clearFilters}
      /*
        The top of the board, for the empty state alone. It lets the pane
        offer a named organisation to write to before the reader has
        selected anything, which is the difference between a pane that
        explains itself and a pane that is usable. It is `rows`, the
        filtered and segmented list, rather than the whole trade area, so
        the offer is always something the reader can also see beside it.
      */
      topLine={rows[0] ?? null}
      /*
        THE ARRIVAL STATE IS THE RUN, and this is the whole reason these
        five props exist. Nothing is selected when a reader lands here, so
        a third of the widest layout was a heading reading "No organisation
        selected" over a single suggestion. The pane now opens on the best
        go-see run the current board supports, with its stops in walk
        order, which is the one answer this screen can give that the desk
        cannot.
      */
      run={shownRun}
      runIsOnBoard={activeRun !== null}
      runCount={runs.length}
      onTakeRun={takeRun}
      onClearRun={clearRun}
      onNextRun={nextRun}
      onSelect={selectFromList}
    />
  );

  /*
    The panel is a permanent column above 1024px, including when nothing
    is selected, because the pane draws a designed invitation for that
    case and a third of the screen going blank would read as a broken
    page. In every narrower layout it is an overlay, and an overlay over
    nothing is not a thing, so it is only rendered once there is
    something to show.
  */
  /*
    ON A PHONE THE DETAIL POSITION IS LIVE WHEN THERE IS A RUN TO SHOW.

    It used to be dead until an organisation had been selected, which was
    right when the pane's empty state was a heading saying nothing. Now
    that the empty state carries the run, leaving the position disabled
    would put the one thing this screen knows and the desk does not behind
    a selection, on the layout with the least room to discover anything.
  */
  const detailHasSomething = selectedRow !== null || shownRun !== null;
  const showDetail =
    mode === "three-pane"
      ? true
      : mode === "single"
        ? singlePane === "detail" && detailHasSomething
        : selectedRow !== null;

  const listLabel = listOnScreen
    ? "Hide list"
    : listIsColumn
      ? "Show list"
      : `Show the list of ${totals.plotted}`;

  /*
    THE TWO NARROW LAYOUTS SHARE ONE DECISION, so they share one flag.
    Below 768px the board is the page and the figure strip goes underneath
    it. The reasoning is the vertical budget written out at the top of this
    file.
  */
  const phone = mode === "single" || mode === "list-sheet";

  const statBar = (
    <MapStatBar
      segment={segment}
      onSegmentChange={setSegment}
      counts={counts}
      stats={stats}
    />
  );

  return (
    <div className={styles.shell} data-mode={mode}>
      <button type="button" className="skip-link" onClick={skipToList}>
        Skip the map, go to the list of organisations
      </button>

      {/*
        THE CHROME BAND. The way out, the name of the screen, the page's
        own note, and the one control that changes the shape of the board.

        WHY THE BAND IS HERE AND NOT IN THE PAGE. Three of its four parts
        are the page's and are passed in as props, which is where they
        belong. The fourth is a live view of state this component owns:
        the hide list control has to say what pressing it will do, and
        what pressing it will do depends on the layout, on whether the
        list is a column or a sheet, and on how many organisations are
        currently plotted. Lifting that state into the page so the page
        could draw the button would have moved the layout decisions, the
        media queries and the sheet with it, and left this file holding
        panes it no longer decided the shape of.

        WHY IT IS OUTSIDE THE SCROLLING PART OF THE BOARD. Below 768px
        the body under it becomes the scroll region, and a way out that
        scrolls off the top of a takeover is a takeover with no way out
        on the screen. Back, and the control that brings the list back,
        are the two things on this board that must never be somewhere
        else.
      */}
      <header className={styles.chrome}>
        <div className={styles.chromeLeft}>
          {onExit ? (
            /*
              Two labels, and the accessible name is the long one at every
              width. A phone band is 380 pixels holding four controls, so
              the visible word shortens to "Back", which is a substring of
              the spoken name and therefore still the thing a person says
              out loud to a voice control.
            */
            <button
              type="button"
              className={styles.back}
              aria-label="Back to the console"
              onClick={onExit}
            >
              <span aria-hidden="true">‹</span>
              <span className={styles.backLong}>Back to the console</span>
              <span className={styles.backShort} aria-hidden="true">
                Back
              </span>
            </button>
          ) : null}

          {modeLink}

          <div className={styles.chromeTitle}>
            <h1 className={styles.chromeName}>{screenName}</h1>
            {screenNote ? (
              <p className={styles.chromeNote}>{screenNote}</p>
            ) : null}
          </div>
        </div>

        <div className={styles.chromeRight}>
          {note}

          <button
            type="button"
            ref={listToggleRef}
            className={styles.listToggle}
            /*
              The state of the LIST, not of the button, and the two are
              not the same thing on a phone: below 768px the list is a
              sheet and `listHidden` is only half the answer. This says
              whether the reader can currently see the list, which is
              the question `aria-expanded` is asking.
            */
            aria-expanded={listOnScreen}
            aria-controls={LIST_ID}
            onClick={toggleList}
          >
            <span aria-hidden="true">{listOnScreen ? "◧" : "◫"}</span>
            <span>{listLabel}</span>
          </button>

          {/*
            The hint the reference prints beside this control, said in
            full. "Esc closes" on its own, sitting next to a button
            labelled "Hide list", reads as though Escape hides the list.
            It does not. It leaves the screen, which is a much bigger
            thing to do by accident, so the sentence names what closes.
          */}
          <span className={styles.escHint}>Esc closes this screen</span>
        </div>
      </header>

      <div className={styles.body}>
      {phone ? null : statBar}

      {mode === "single" ? (
        <div
          className={styles.switcher}
          role="radiogroup"
          aria-label="Which pane is showing"
        >
          {SINGLE_PANES.map((pane) => {
            const disabled = pane.id === "detail" && !detailHasSomething;
            const on = singlePane === pane.id;
            return (
              <button
                key={pane.id}
                ref={pane.id === "list" ? singleListRef : undefined}
                type="button"
                role="radio"
                aria-checked={on}
                aria-disabled={disabled || undefined}
                disabled={disabled}
                data-on={on ? "yes" : "no"}
                className={styles.switcherButton}
                title={
                  disabled
                    ? "Choose an organisation first"
                    : `Show the ${pane.label.toLowerCase()}`
                }
                onClick={() => showPane(pane.id)}
              >
                <span aria-hidden="true">{pane.glyph}</span>
                <span>{pane.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {/*
        The count is announced here only when the list is not on screen.
        The list pane carries its own polite region over the same figure,
        and two live regions saying the same sentence at the same moment
        is noise rather than access. Selection is announced by the detail
        pane, for the same reason and in the same spirit.
      */}
      {!listOnScreen ? (
        <p className="visually-hidden" role="status" aria-live="polite">
          {boardCountLine(totals)} on the board.
        </p>
      ) : null}

      <div
        className={styles.board}
        data-mode={mode}
        data-list={listHidden ? "off" : "on"}
      >
        {listIsColumn ? (
          <div className={styles.listCol}>{listNode}</div>
        ) : null}

        <div className={styles.mapCol}>
          <MapCanvas
            rows={rows}
            selectedId={selectedId}
            onSelect={selectFromMap}
            fitSignature={fitSignature}
            showOutline={SHOW_OUTLINE}
            /*
              THE RUN, DRAWN ON THE GROUND IT IS AN ARGUMENT ABOUT.

              The card in the right pane can say "six stops, widest gap
              three tenths of a mile" and a reader still has to take that
              on trust. A line through the six pins is the claim itself,
              and it is the picture that makes the point of having a map
              at all: these are not six rows that happen to be near the
              top of a list, they are one corner of one road.

              It is drawn for the run being OFFERED as well as for the one
              taken, so the board arrives with the corridor already on it.
            */
            runPath={runPath}
            runLabel={shownRun ? runSentence(shownRun) : undefined}
            runOnBoard={activeRun !== null}
            onOpenDetail={openDetailFromMap}
            onCompose={openCompose}
            onPopupChange={setPopupOpen}
          >
            {/*
              THE HIDE LIST CONTROL USED TO FLOAT HERE, over the top left
              corner of the tiles, which is where the reference draws it.
              It has moved into the chrome band above, and the reason is
              that this corner is not free on this map: the ring note, the
              one line of words that keeps the straight line claim alive
              when the ring labels cannot fit, lives here on every narrow
              map, and a button parked on top of it covered the sentence
              on exactly the screens that needed it most. The band has
              room, it is where a reader already looks for the screen's
              own controls, and the button is now visible at every width
              instead of being the first thing a narrow map buries.
            */}
            <MapLegend
              open={legendOpen}
              onToggle={() => setLegendOpen((open) => !open)}
              /*
                Only while a run is on the board. Off a run the card's own
                lane arithmetic is the truthful count and handing it a
                second source of the same number is how the two drift.
              */
              plottedOverride={activeRun ? rows.length : undefined}
            />

            {/*
              THE CARD GIVES UP THE CORNER TO ANYTHING THE READER OPENED.

              Two things can want the bottom left of the map column. A
              popup is one: Leaflet pans an opening popup into whatever it
              has been told is free, and on a narrow column there is
              sometimes nowhere left that is, so the two were reported
              overlapping. The detail panel as an OVERLAY is the other,
              because below 1024px it is drawn over the map rather than
              beside it.

              Both are things a person just asked for. The offers card has
              been in the corner since the page loaded and is asking for
              nothing. So it yields, completely, and comes back untouched.
              The long note in `OffersCard` explains why yielding is
              removal rather than a fade.
            */}
            <OffersCard
              index={offerIndex}
              onIndexChange={setOfferIndex}
              laneFilter={pipeline.laneFilter}
              /*
                A run on the board is the third thing that owns this
                corner, and it belongs on the same rule as the other two.
                The reader has just pressed a control that framed six pins
                and a path across the map column, and the run is drawn
                low and wide by the nature of a corridor. The card has
                been sitting there since the page loaded and is asking for
                nothing, so it yields, exactly as it does to a popup.
              */
              yieldToOverlay={
                popupOpen ||
                (showDetail && mode !== "three-pane") ||
                activeRun !== null
              }
            />
          </MapCanvas>
        </div>

        {showDetail ? (
          <div className={styles.detailCol}>{detailNode}</div>
        ) : null}
      </div>

      {/*
        THE STRIP, ON A PHONE, UNDER THE BOARD. Same component, same
        props, same live region; only its place in the column changes,
        and it changes in the DOM rather than with a CSS `order`, so the
        tab order and the reading order still agree with the picture.
      */}
      {phone ? statBar : null}
      </div>

      {/*
        THE SHEET. The list, risen from the bottom over the map. Escape
        closes it, the scrim closes it, focus goes in when it opens and
        comes back to the control that opened it.

        IT IS A DIALOG IN ONE LAYOUT AND A PANE IN THE OTHER, and the
        difference is what is actually behind it. Between 380 and 768 the
        map is a full width pane the reader was just using and the sheet
        has covered it, which is what `aria-modal` describes and what a
        dialog is for. At 380 and below there is only ever one pane on
        screen, the switcher underneath decides which, and the list is
        simply the pane that is showing. Announcing it as a modal dialog
        there would be a lie about the layout, and it would also mean a
        person arriving on this page found a dialog already open over
        nothing, with the compose window then opening as a second dialog
        on top of the first.
      */}
      {sheetOpen ? (
        <>
          {/*
            THE SCRIM BELONGS TO THE LAYOUT WHERE THE SHEET IS A DIALOG,
            AND ONLY THERE.

            Between 380 and 768 the list rises over a full width map the
            reader was just using, and the scrim is what says so. At 380
            and below there is one pane at a time and the switcher
            underneath decides which; the list is simply the pane that is
            showing, and a scrim over the screen there dimmed the chrome
            band along with everything else and swallowed clicks on it.
            That put the takeover's only way out behind a sheet a phone
            arrives with open. A layer that covers the exit is not a
            scrim, it is a trap.
          */}
          {mode === "list-sheet" ? (
            <div
              className={styles.sheetScrim}
              onClick={closeSheet}
              aria-hidden="true"
            />
          ) : null}
          <div
            className={styles.sheet}
            role={mode === "list-sheet" ? "dialog" : undefined}
            aria-modal={mode === "list-sheet" ? true : undefined}
            /* The label belongs to whatever is being named. As a dialog
               that is this box; as a plain pane it is the `section` the
               list pane already labels inside it, and a second label on
               an unroled div would only be read as a stray landmark. */
            aria-label={
              mode === "list-sheet"
                ? "Organisations in the trade area"
                : undefined
            }
          >
            <div className={styles.sheetHead}>
              <span className={styles.sheetTitle}>
                {boardCountLine(totals)}
              </span>
              <button
                type="button"
                ref={sheetCloseRef}
                className={styles.sheetClose}
                onClick={closeSheet}
              >
                <span aria-hidden="true">✕</span>
                <span>Close the list</span>
              </button>
            </div>
            <div className={styles.sheetBody}>{listNode}</div>
          </div>
        </>
      ) : null}

      {/*
        ONE MODAL, ONE INSTANCE, ONE OWNER. The panel, the popup and the
        canvas all raise `onCompose` and none of them imports this
        component. A modal rendered from inside a Leaflet popup would be
        unmounted the moment the popup closed underneath it, and a modal
        rendered once per pane would trap focus in whichever copy the
        browser reached first. It manages its own focus return; nothing
        here fights it for that.
      */}
      <EmailComposeModal
        prospect={compose?.prospect ?? null}
        intent={compose?.intent}
        packageId={compose?.packageId}
        onClose={() => setCompose(null)}
      />
    </div>
  );
}
