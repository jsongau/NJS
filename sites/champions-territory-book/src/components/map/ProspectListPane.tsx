import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import type { OccasionClass, Prospect } from "@/domain/types";
import type { DeskLine } from "@/domain/selectors/desk";
import {
  LANE_META,
  LANE_ORDER,
  OCCASION_CLASS_META,
  occasionClassOf,
} from "@/domain/lanes";
import { PROSPECTS } from "@/data/prospects";
import { usePipeline, usePipelineDispatch } from "@/state/PipelineProvider";
import { Button } from "@/components/primitives/Button";
import { ProspectSearch } from "@/components/search/ProspectSearch";
import {
  OCCASION_SEGMENT_ORDER,
  lanesOfClass,
  segmentValue,
  setLaneFilter,
} from "./OccasionSegment";
import {
  ProspectListCard,
  type CardComposeIntent,
} from "./ProspectListCard";
import styles from "./ProspectListPane.module.css";

/**
 * The left pane: every organisation in the trade area, filtered, counted
 * and ranked, in the order the desk would work them.
 *
 * The pane owns the controls and the scroll. It owns nothing about a
 * card, and it owns none of the filtering LOGIC either: the occasion
 * segment, the map legend's lane marks, the search box and the written
 * door switch all write to `PipelineProvider`, and the rows come in as a prop
 * already narrowed by `deskLines`. Narrow the board here and the desk is
 * narrowed too. That is the property the whole application is arguing
 * for, and it is worth more than the small amount of local state it costs
 * to give up.
 *
 * ---------------------------------------------------------------
 * THE HEAD IS A BUDGET, AND IT WAS SPENT BADLY
 * ---------------------------------------------------------------
 *
 * This pane shipped with a head five hundred pixels tall above a list
 * three hundred and sixty pixels tall. At 1440 by 900, on the screen
 * this tool is actually used on, exactly ONE organisation was fully
 * visible. A ranked list of three hundred and twenty nine that shows one row is a
 * ranking nobody can read; the whole argument of the left column is the
 * comparison down the page, and there was nothing to compare against.
 *
 * Three things came out of the head and each was paying for itself
 * twice.
 *
 * THE NINE LANE PILLS WENT. The legend on the map filters by lane, with
 * the custom lane marks and a count against each one, and it does the
 * job better than a row of pills with no counts on them. Two controls
 * writing to one piece of shared state is not redundancy, it is a
 * reader wondering which of them is the real one.
 *
 * THE SENTENCE UNDER THE SEGMENT WENT. "Calendar buys, not the buyer"
 * is the best line in this domain model and it is now on `/method`,
 * where an argument belongs. Above a list somebody reads fifty times a
 * day it is a paragraph they finished reading in week one.
 *
 * THE SEGMENT ITSELF IS ONE ROW NOW. Calendar, Chosen and Both with
 * their counts is the question the head exists to ask, so it stays, but
 * a heading row, two stacked positions, a full width reset and a
 * two-line note is four rows of chrome around three numbers.
 *
 * ---------------------------------------------------------------
 * WHY THE SEGMENT IS DRAWN HERE RATHER THAN BY `OccasionSegment`
 * ---------------------------------------------------------------
 *
 * The component in `OccasionSegment.tsx` owns a shape this head can no
 * longer afford: its own heading, its two-across-plus-reset layout, and
 * the explanatory note wired to the group with `aria-describedby`. It is
 * still the right control for a screen with room for it, so it has not
 * been changed and it has not been deleted.
 *
 * What this pane borrows from it is the part that matters, which is the
 * LOGIC, not the layout: `OCCASION_SEGMENT_ORDER`, `lanesOfClass`,
 * `segmentValue` and `setLaneFilter` are all imported. A second copy of
 * "which lanes are in a class" is how two controls start disagreeing
 * about what the reader is looking at, and that is the one failure this
 * whole shared-filter design exists to prevent. Only the markup is
 * local, and the markup is the only part that was too tall.
 *
 * ---------------------------------------------------------------
 * WHAT THE CONTROLS ARE FOR, IN THE ORDER THEY APPEAR
 * ---------------------------------------------------------------
 *
 * The segment first, because the biggest question a reader has in front
 * of a hundred organisations is which kind of buyer they are looking at.
 * Then the search, for the reader who already knows the name. Then
 * whatever is currently narrowing the board, each named with its own way
 * out. Then the count, which is the only honest way to tell somebody how
 * much of the board they have just hidden. Lanes are narrowed from the
 * legend on the map, and anything the legend sets still appears in the
 * filter bar here with its own way out.
 *
 * ---------------------------------------------------------------
 * THE SEARCH BOX OFFERS, IT DOES NOT SILENTLY SUBTRACT
 * ---------------------------------------------------------------
 *
 * It used to be a filter on the keystroke. Two letters went in, the
 * board fell from three hundred and twenty nine rows to two, and the two survivors
 * showed no sign of the letters anywhere on their faces, because the
 * predicate also read the city and the decision maker's job title. The
 * owner typed "sa", watched the board empty, and stopped trusting the
 * control. He was right to.
 *
 * So the box is a combobox now, and it lives in `components/search` so
 * the desk can have the same one. Typing offers organisations, each
 * naming the field the letters were found in; choosing one SELECTS that
 * organisation on the board, which is a jump rather than a filter, and
 * the board stays whole around it. Narrowing is still available and it
 * is still one press, but it is now a named row with a count on it under
 * a heading that says what it will do.
 *
 * THE FILTER BAR IS THE OTHER HALF OF THAT FIX. Whatever is narrowing
 * the board is printed above the list at all times, not only once the
 * list has gone empty, with a control per filter that drops it and one
 * that drops the lot. A reader should never have to work out why they
 * are looking at eleven rows.
 *
 * THE COUNT IS A LIVE REGION. A filter that changes a list silently has
 * changed nothing at all for a reader using a screen reader: they press
 * a chip, the page says nothing, and the next thing they hear is a list
 * that is a different length for no stated reason. "12 of 211
 * organisations" read out on every change costs one element and fixes it.
 *
 * THE EMPTY STATE IS A DESIGN PROBLEM, NOT A FALLBACK. When the filters
 * exclude everything, the pane names each filter that is on, offers a
 * control that drops that one, and offers a control that drops all of
 * them. Nothing in this application is allowed to be a dead end, and the
 * most common dead end in any filtered list is the blank rectangle that
 * does not say which of five controls caused it.
 *
 * THE ROWS NO LONGER CARRY COMPOSE BUTTONS, and `onCompose` is kept on
 * the props only so the board can go on passing the handler it passes
 * to three other surfaces. Writing to an organisation now happens in
 * the detail pane, in the record modal and in the map popup, which is
 * where it happened before a build put a pair of buttons under all two
 * hundred and eleven rows. Those buttons were a real fix for a real defect,
 * the defect being that no compose control was visible anywhere at first
 * paint, and they are not the fix any more because the detail pane and
 * the record now carry one. What they cost was a hundred pixels of every
 * row in a list whose only job is to be read down at speed.
 *
 * NOT VIRTUALISED, DELIBERATELY. There are roughly a hundred rows. A
 * windowing library would add a dependency, break Find on Page, break
 * the scroll anchoring that keeps a reader's place, and complicate the
 * scroll into view below, in order to solve a frame budget problem that
 * does not exist at this size. The filtered list is memoised instead,
 * which is where the actual cost is.
 */

/** Matches the month the desk and the map score against. August. */
const DEFAULT_NOW_MONTH = 7;

const OCCASION_CLASSES = Object.keys(OCCASION_CLASS_META) as OccasionClass[];

function emptyCounts(): Record<OccasionClass, number> {
  return Object.fromEntries(
    OCCASION_CLASSES.map((c) => [c, 0]),
  ) as Record<OccasionClass, number>;
}

export interface ProspectListPaneProps {
  /** The pane's own id, so the board's hide control can point at it. */
  id: string;
  rows: DeskLine[];
  totalInTradeArea: number;
  selectedId: string | null;
  onSelect: (prospectId: string) => void;
  /**
   * ACCEPTED AND NOT USED, DELIBERATELY.
   *
   * The board hands the same compose handler to the detail pane, the
   * map popup and the record modal, and it hands it here too. The list
   * rows stopped carrying compose buttons in the density pass, so
   * nothing in this pane calls it; the prop stays on the interface so
   * the board keeps one call site for all four surfaces and so putting
   * an action back on a row is a change in this file alone.
   */
  onCompose?: (prospect: Prospect, intent: CardComposeIntent) => void;
  /**
   * The three occasion props are OPTIONAL and derived from the shared
   * lane filter when they are absent, so the pane is correct on its own
   * and still accepts the board passing them down.
   */
  occasion?: OccasionClass | null;
  onOccasionChange?: (value: OccasionClass | null) => void;
  occasionCounts?: Record<OccasionClass, number>;
  /** Decides whether a new selection scrolls the list. */
  selectionSource?: "list" | "map" | "none";
  /** "sheet" is the phone and tablet presentation. See the CSS module. */
  variant?: "column" | "sheet";
  nowMonth?: number;
  /**
   * Narrowings the BOARD owns rather than the pipeline, listed in this
   * pane's own filter bar so a reader has one place that says why the
   * board is short and one kind of chip that drops it.
   *
   * The go-see run is the first of them. It is page local state living in
   * `MapBoard`, so this pane cannot read it and must not try to; it is
   * handed the label and the way to undo it and nothing else.
   */
  extraFilters?: { key: string; label: string; clear: () => void }[];
}

export function ProspectListPane({
  id,
  rows,
  totalInTradeArea,
  selectedId,
  onSelect,
  occasion,
  onOccasionChange,
  occasionCounts,
  selectionSource = "none",
  variant = "column",
  nowMonth = DEFAULT_NOW_MONTH,
  extraFilters,
}: ProspectListPaneProps) {
  const pipeline = usePipeline();
  const dispatch = usePipelineDispatch();

  const listRef = useRef<HTMLOListElement>(null);
  /** The id this pane selected itself, so it does not chase its own click. */
  const selfSelected = useRef<string | null>(null);

  /*
    THE LETTERS IN THE BOX ARE HELD HERE, NOT INSIDE THE COMBOBOX.

    They have to be, because two other controls can empty the box: the
    filter bar's own cross once a search has been applied to the board,
    and the clear-everything button in the empty state. A combobox
    keeping a private copy of its string would keep showing letters that
    no longer filter anything, which is a smaller version of exactly the
    defect this pass was opened to fix.
  */
  const [draft, setDraft] = useState(pipeline.query);

  /* Somewhere else cleared the shared query, so the box follows it. */
  useEffect(() => {
    if (pipeline.query === "") setDraft("");
  }, [pipeline.query]);

  const committed = pipeline.query.trim().toLowerCase();

  /*
    The rows arrive already narrowed by `deskLines`, and the pane no
    longer narrows them a second time. The old local pass existed to
    keep the list in step with a filter that was being written on every
    keystroke; nothing is written on a keystroke any more, so a second
    predicate here would only be a way for the list and the map to
    disagree.
  */
  const visible = rows;

  /** Every organisation the board is currently drawing, for the search. */
  const onBoardIds = useMemo(
    () => new Set(rows.map((line) => line.prospect.id)),
    [rows],
  );

  /*
    The counts on the segment ignore the lane filter on purpose.

    They answer "how many are there of each kind", not "how many are
    showing", and a count that collapsed to zero because of the very
    control the reader is about to press would be useless at the moment
    they need it. The search and the written door switch DO apply,
    because those narrow the board rather than the class.
  */
  const derivedCounts = useMemo(() => {
    const counts = emptyCounts();
    for (const p of PROSPECTS) {
      if (pipeline.emailableOnly && p.emailConfidence !== "verified_public")
        continue;
      if (
        committed &&
        !`${p.name} ${p.city} ${p.decisionMakerTitle}`
          .toLowerCase()
          .includes(committed)
      )
        continue;
      counts[occasionClassOf(p.lane)] += 1;
    }
    return counts;
  }, [pipeline.emailableOnly, committed]);

  const counts = occasionCounts ?? derivedCounts;
  const segment = occasion !== undefined ? occasion : segmentValue(pipeline.laneFilter);
  const occasionTotal = OCCASION_CLASSES.reduce(
    (n, c) => n + (counts[c] ?? 0),
    0,
  );

  function changeOccasion(value: OccasionClass | null) {
    if (onOccasionChange) {
      onOccasionChange(value);
      return;
    }
    setLaneFilter(dispatch, value ? lanesOfClass(value) : []);
  }

  /*
    REAL RADIO SEMANTICS ON THREE BUTTONS, AND THE ARROW KEYS THAT COME
    WITH THEM. Three positions and one of them true is a radiogroup, and
    a radiogroup that cannot be driven from the arrow keys is a set of
    divs wearing a role. The behaviour is the same as the taller control
    in `OccasionSegment`; only the box it is drawn in changed.
  */
  const segmentButtons = useRef<(HTMLButtonElement | null)[]>([]);

  function onSegmentKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const keys = [
      "ArrowRight",
      "ArrowDown",
      "ArrowLeft",
      "ArrowUp",
      "Home",
      "End",
    ];
    if (!keys.includes(event.key)) return;

    const last = OCCASION_SEGMENT_ORDER.length - 1;
    const at = OCCASION_SEGMENT_ORDER.findIndex((p) => p === segment);
    const from = at === -1 ? last : at;

    let next = from;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = from === last ? 0 : from + 1;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = from === 0 ? last : from - 1;
    } else if (event.key === "Home") {
      next = 0;
    } else {
      next = last;
    }

    event.preventDefault();
    changeOccasion(OCCASION_SEGMENT_ORDER[next]);
    segmentButtons.current[next]?.focus();
  }

  /* ---------------------------------------------------------------
     What is currently narrowing the board, named so it can be undone
     --------------------------------------------------------------- */

  const activeFilters: { key: string; label: string; clear: () => void }[] = [
    ...(extraFilters ?? []),
  ];

  if (pipeline.laneFilter.length > 0) {
    activeFilters.push({
      key: "lanes",
      label:
        pipeline.laneFilter.length === 1
          ? `Lane: ${LANE_META[pipeline.laneFilter[0]].short}`
          : `${pipeline.laneFilter.length} of ${LANE_ORDER.length} lanes`,
      clear: () => dispatch({ type: "CLEAR_LANES" }),
    });
  }
  if (committed !== "") {
    activeFilters.push({
      key: "query",
      label: `Search: ${pipeline.query.trim()}`,
      clear: clearSearch,
    });
  }
  if (pipeline.emailableOnly) {
    activeFilters.push({
      key: "emailable",
      label: "Written door only",
      clear: () => dispatch({ type: "TOGGLE_EMAILABLE_ONLY" }),
    });
  }

  function clearSearch() {
    setDraft("");
    dispatch({ type: "SET_QUERY", query: "" });
  }

  function clearEverything() {
    setDraft("");
    dispatch({ type: "CLEAR_LANES" });
    dispatch({ type: "SET_QUERY", query: "" });
    if (pipeline.emailableOnly) dispatch({ type: "TOGGLE_EMAILABLE_ONLY" });
    /* Everything means everything, including the narrowings the board
       owns. A "clear every filter" that left the run on would be the
       control lying about what it did. */
    for (const filter of extraFilters ?? []) filter.clear();
  }

  /* ---------------------------------------------------------------
     Selection: find the row when it was chosen somewhere else
     --------------------------------------------------------------- */

  useEffect(() => {
    if (!selectedId) return;
    if (selfSelected.current === selectedId) {
      selfSelected.current = null;
      return;
    }
    if (selectionSource === "list") return;
    const node = listRef.current?.querySelector<HTMLElement>(
      `[data-prospect-id="${selectedId}"]`,
    );
    node?.scrollIntoView({ block: "nearest" });
    /*
      Deliberately keyed on the SELECTION only. Adding the filtered rows
      here would drag the list back to the selected card every time an
      unrelated chip was ticked, which is the fastest way to lose a
      reader's place in a hundred rows.
    */
  }, [selectedId, selectionSource]);

  function select(prospectId: string) {
    selfSelected.current = prospectId;
    onSelect(prospectId);
  }

  /*
    A JUMP HAS TO LAND SOMEWHERE THE READER CAN SEE.

    Selecting from the list is the one case that must NOT scroll, since
    the row was already under the pointer. Selecting from the search is
    the opposite: the row could be sixty down, and a selection nobody
    can see is a control that appears to have done nothing. So the
    search records what it picked and the list walks to it once the rows
    have settled around the new selection.
  */
  const [jumpTo, setJumpTo] = useState<string | null>(null);

  useEffect(() => {
    if (!jumpTo) return;
    const node = listRef.current?.querySelector<HTMLElement>(
      `[data-prospect-id="${jumpTo}"]`,
    );
    node?.scrollIntoView({ block: "center" });
    setJumpTo(null);
  }, [jumpTo, visible]);

  function selectFromSearch(prospectId: string) {
    select(prospectId);
    setJumpTo(prospectId);
  }

  /*
    Up and Down move between cards, Home and End jump the ends, Enter and
    Space select, because each card is a real button. Tab enters the list
    once and leaves it once: the tab order runs through the controls and
    on to the next pane rather than through a hundred cards.
  */
  function onListKeyDown(event: KeyboardEvent<HTMLOListElement>) {
    const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key)) return;

    const cards = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>(
        "button[data-prospect-id]",
      ) ?? [],
    );
    if (cards.length === 0) return;

    const at = cards.indexOf(document.activeElement as HTMLButtonElement);
    if (at === -1) return;

    event.preventDefault();
    const last = cards.length - 1;
    const next =
      event.key === "ArrowDown"
        ? Math.min(at + 1, last)
        : event.key === "ArrowUp"
          ? Math.max(at - 1, 0)
          : event.key === "Home"
            ? 0
            : last;
    cards[next].focus();
  }

  /*
    THE ROVING TAB STOP FOLLOWS THE READER, AND IT HAS TO NOW.

    Each row used to be a single button, so one tab stop somewhere in the
    list was enough: arrow down to a card, press Enter, done. Each row is
    now two controls, the card itself and the organisation's name, and
    that changes what Tab has to mean. A reader who arrows down to the
    fortieth organisation and presses Tab expects to land on that
    organisation's name and open its record. If the tab stop stayed
    pinned to the selected row, Tab from row forty would skip every
    remaining row and leave the list entirely, and the record on thirty
    nine rows out of forty would be unreachable from the keyboard.

    So the row that most recently held focus is remembered, and it owns
    the tab stop. It is stored as an ID rather than an index because the
    list is filtered underneath it; an index would silently come to mean
    a different organisation the moment the legend narrowed a lane.
    Until anything in the list has been focused it falls back to the
    selected row, and then to the top of the list.
  */
  const [rovingId, setRovingId] = useState<string | null>(null);

  function onListFocus(event: FocusEvent<HTMLOListElement>) {
    const row = (event.target as HTMLElement).closest<HTMLElement>(
      "li[data-prospect-row]",
    );
    const id = row?.dataset.prospectRow;
    if (id) setRovingId(id);
  }

  const selectedIndex = visible.findIndex((l) => l.prospect.id === selectedId);
  const rovingIndex = rovingId
    ? visible.findIndex((l) => l.prospect.id === rovingId)
    : -1;
  const tabbableIndex =
    rovingIndex !== -1 ? rovingIndex : selectedIndex === -1 ? 0 : selectedIndex;

  const filtered = activeFilters.length > 0;
  const searchId = `${id}-search`;
  const segmentLabelId = `${id}-occasion-label`;

  return (
    <section
      id={id}
      className={[styles.pane, variant === "sheet" ? styles.sheet : ""]
        .filter(Boolean)
        .join(" ")}
      aria-label="Organisations in the trade area"
    >
      {/*
        Sticky, so the segment, the search and the count stay reachable
        while a hundred cards go past underneath them. A control a reader
        has to scroll back up to find is a control they stop using.
      */}
      <div className={styles.head}>
        {/*
          ONE ROW. Three positions, each a glyph, a word and a figure.

          The group's heading is in the accessibility tree and not on the
          screen, which is the one thing here worth defending. "Why they
          buy" set on a line of its own cost a whole row of a head that
          had already eaten the list, and the three words underneath it
          are "Calendar", "Chosen" and "Both", which is the question
          asked and answered in the same breath. A screen reader gets
          the heading through `aria-labelledby`, and every position
          carries the full class name in its `title` and its
          `aria-label`, so nothing has been shortened away, only moved
          off a surface that had no room for it.
        */}
        <p className="visually-hidden" id={segmentLabelId}>
          Why they buy
        </p>

        <div
          className={styles.occasion}
          role="radiogroup"
          aria-labelledby={segmentLabelId}
          onKeyDown={onSegmentKeyDown}
        >
          {OCCASION_SEGMENT_ORDER.map((position, i) => {
            const meta = position ? OCCASION_CLASS_META[position] : null;
            const checked = position === segment;
            const count = position ? (counts[position] ?? 0) : occasionTotal;

            /*
              "Both" carries the two class glyphs together rather than an
              invented third mark, because that is literally what the
              position means, and it keeps the shape vocabulary on this
              screen at two marks instead of three.
            */
            const glyph = meta
              ? meta.glyph
              : OCCASION_CLASSES.map(
                  (c) => OCCASION_CLASS_META[c].glyph,
                ).join("");
            const word = meta ? meta.short : "Both";
            const full = meta ? meta.label : "Both classes of buyer";

            return (
              <button
                key={position ?? "both"}
                type="button"
                role="radio"
                aria-checked={checked}
                tabIndex={checked ? 0 : -1}
                ref={(node) => {
                  segmentButtons.current[i] = node;
                }}
                className={styles.occasionPosition}
                data-checked={checked || undefined}
                title={full}
                aria-label={`${full}, ${count} organisations`}
                onClick={() => changeOccasion(position)}
              >
                <span className={styles.occasionGlyph} aria-hidden="true">
                  {glyph}
                </span>
                <span className={styles.occasionWord}>{word}</span>
                <span
                  className={`${styles.occasionCount} num`}
                  aria-hidden="true"
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <ProspectSearch
          id={searchId}
          value={draft}
          onValueChange={setDraft}
          onBoardIds={onBoardIds}
          total={totalInTradeArea}
          /* A jump, not a filter. The board keeps its hundred rows. */
          onSelectProspect={selectFromSearch}
          onSelectLane={(lane) => setLaneFilter(dispatch, [lane])}
          onFilterByText={(query) => dispatch({ type: "SET_QUERY", query })}
          onClearAll={clearSearch}
        />

        {/*
          THE BOARD SAYS WHY IT IS SHORT, WHILE IT IS SHORT.

          The same list of active filters used to appear only once
          everything had been excluded, which is the one moment it is too
          late to be useful. Eleven rows out of three hundred and twenty nine is
          just as confusing as none of them, so it is printed here whenever
          anything is on, each filter carrying the control that drops it.
        */}
        {filtered ? (
          <div className={styles.filterBar}>
            <p className={styles.filterLabel}>Narrowing the board</p>
            <ul className={styles.filterList}>
              {activeFilters.map((f) => (
                <li key={f.key}>
                  <button
                    type="button"
                    className={styles.filterChip}
                    onClick={f.clear}
                    title={`Drop this filter. ${f.label}`}
                  >
                    <span className={styles.filterChipText}>{f.label}</span>
                    <span aria-hidden="true">✕</span>
                    <span className="visually-hidden">Drop this filter</span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  className={`${styles.filterChip} ${styles.filterClearAll}`}
                  onClick={clearEverything}
                >
                  Clear every filter
                </button>
              </li>
            </ul>
          </div>
        ) : null}

        <div className={styles.countRow}>
          <p className={styles.count} aria-live="polite">
            <span className={`${styles.countFigure} num`}>{visible.length}</span>{" "}
            of{" "}
            <span className={`${styles.countFigure} num`}>
              {totalInTradeArea}
            </span>{" "}
            organisations
            {filtered ? " that match the filter" : ""}
          </p>
          {/* The caption for the right hand column of the list below, printed
              once here instead of once a row. */}
          <span className={styles.columnLabel} aria-hidden="true">
            Desk score
          </span>
        </div>
      </div>

      {visible.length > 0 ? (
        <ol
          className={styles.list}
          ref={listRef}
          onKeyDown={onListKeyDown}
          onFocus={onListFocus}
          aria-label="Organisations, ranked by desk score"
        >
          {visible.map((line, i) => (
            <ProspectListCard
              key={line.prospect.id}
              line={line}
              rank={i + 1}
              selected={line.prospect.id === selectedId}
              onSelect={() => select(line.prospect.id)}
              nowMonth={nowMonth}
              tabIndex={i === tabbableIndex ? 0 : -1}
            />
          ))}
        </ol>
      ) : (
        <div className={styles.empty}>
          <p className={styles.emptyLead}>
            Nothing on the board matches that.
          </p>
          <p className={styles.emptyBody}>
            The filter is doing its job. Widen it, or clear it and start
            again from all {totalInTradeArea} organisations.
          </p>

          {activeFilters.length > 0 ? (
            <>
              <p className={styles.emptyLabel}>What is narrowing the board</p>
              <ul className={styles.emptyList}>
                {activeFilters.map((f) => (
                  <li key={f.key}>
                    <button
                      type="button"
                      className={styles.dropFilter}
                      onClick={f.clear}
                    >
                      <span aria-hidden="true">✕</span>
                      <span>{f.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          <Button variant="primary" onClick={clearEverything}>
            Clear every filter
          </Button>
        </div>
      )}
    </section>
  );
}
