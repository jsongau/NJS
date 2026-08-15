import { useCallback, useMemo, useState } from "react";
import type { Lane, PitchStatus, Provenance } from "@/domain/types";
import { PROSPECTS } from "@/data/prospects";
import { PERIODS, PERIOD_BY_ID } from "@/data/venue";
import { LANE_META, LANE_ORDER, OCCASION_CLASS_META } from "@/domain/lanes";
import { PITCH_STATUS, PITCH_STATUS_ORDER } from "@/domain/vocabulary";
import { usePipeline, usePipelineDispatch } from "@/state/PipelineProvider";
import { useBook, revenueTotals } from "@/state/BookProvider";
import {
  deskLines,
  emailableCount,
  liveConversationCount,
  unworkedCount,
  type DeskLine,
} from "@/domain/selectors/desk";
import { LaneChip } from "@/components/primitives/LaneChip";
import {
  EmailConfidenceChip,
  StatusChip,
} from "@/components/primitives/StatusChip";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { ProspectPlate } from "@/components/primitives/Wordmark";
import { Button } from "@/components/primitives/Button";
import { ProspectDrawer } from "@/components/prospect/ProspectDrawer";
import { RecordName } from "@/components/record/RecordName";
import { ContextSelect, PageHeader } from "@/components/chrome/PageHeader";
import { WorkingSetLead } from "@/components/queue/WorkingSetLead";
import { RecordPager, useRecordFocus } from "@/components/chrome/RecordPager";
import { downloadCsv, toCsv } from "@/lib/export/csv";
import styles from "./DeskPage.module.css";

/**
 * THE DESK. The front door of the application.
 *
 * One question, answered every morning: who do I contact today, and why
 * that one. Everything else in this app is evidence for the answer.
 *
 * ── WHY THE ORDER IS THE PRODUCT ───────────────────────────────────
 * A pre-opening trade area has a hundred-odd organisations in it and one
 * person working them. Alphabetical, by distance, or by Google rating all
 * produce a list that looks organised and wastes the week. The ranking in
 * domain/selectors/desk.ts weights reachability heaviest, then whether
 * the buyer's event exists without us, then whether the window is open,
 * and only then size, because size is the softest figure on every row.
 *
 * ── EVERY ROW OPENS ITS OWN SCORE ──────────────────────────────────
 * A ranking a reader cannot interrogate is a ranking they are being asked
 * to take on faith, and asking a hiring manager to take a sort order on
 * faith is asking the wrong person the wrong thing. So each row expands
 * into its components, its points and a sentence per component saying
 * what that component is actually measuring. It is the most persuasive
 * thing on the page and it is also the part that would be embarrassing to
 * show if the ranking were arbitrary, which is exactly why it is here.
 *
 * ── THE MONTH COMES FROM THE PERIOD, NOT FROM THE CLOCK ────────────
 * Whether a buying window is open is the third heaviest criterion, and it
 * needs a "now". Reading the system clock would mean this page ranks
 * differently depending on the month somebody happens to open the
 * portfolio, and a screenshot taken in March would not match the screen a
 * reader sees in September. The period selector in the chrome is a real
 * control with a real meaning, so the desk answers to that instead, which
 * makes the ranking reproducible and makes the selector do something
 * visible.
 */

/**
 * The date stamped on a touch recorded here.
 *
 * Read once at module load rather than per click, so a page left open for
 * an afternoon does not stamp two touches in two different ways. Touches
 * are user actions in real time, which is the one thing on this screen
 * that legitimately belongs to the clock rather than to the period.
 */
const TODAY = new Date().toISOString().slice(0, 10);

/**
 * The largest single component the scorer can award, which is the forty
 * points for a published email address.
 *
 * The bars in the breakdown are drawn against this fixed ceiling rather
 * than normalised to the biggest component on the row. A bar that
 * rescales per row looks tidier and makes two rows impossible to compare,
 * which defeats the entire purpose of showing the bars.
 */
const MAX_COMPONENT_POINTS = 40;

/** A day's work, not a database. See the note on the control below. */
const DESK_PAGE_SIZE = 20;

/**
 * The next status a row can be advanced to from the desk.
 *
 * IT STOPS AT "DATE HELD" ON PURPOSE. The step from a held date to a
 * booking is a signature and a deposit, and the money lives in
 * BookProvider where a booking cannot exist without a line to carry it.
 * Letting the desk mark something "Booked" would put a contract in the
 * pipeline with no revenue attached to it, which is the single failure
 * this app's two-ledger model exists to prevent.
 */
function nextStatus(status: PitchStatus): PitchStatus | null {
  if (status === "lost") return null;
  const i = PITCH_STATUS_ORDER.indexOf(status);
  const next = PITCH_STATUS_ORDER[i + 1];
  if (!next || next === "booked" || next === "lost") return null;
  return next;
}

/** The domain on its own, for a cell where a full URL would not fit. */
function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** A figure on the strip, with the origin it is obliged to carry. */
function Kpi({
  value,
  label,
  note,
  provenance,
}: {
  value: number;
  label: string;
  note: string;
  provenance: Provenance;
}) {
  /* The note is what stops the figure being misread, so it survives. It
     survives as a tooltip and in the accessibility tree rather than as a
     third line of standing text under every tile. */
  return (
    <div className={styles.kpi} title={note}>
      <span className={`${styles.kpiValue} num`}>{value}</span>
      <span className={styles.kpiLabel}>{label}</span>
      <span className="visually-hidden">{note}</span>
      <ProvenanceBadge provenance={provenance} />
    </div>
  );
}

// ---------------------------------------------------------------
// The occasion classes, which are the filter the rail sets
// ---------------------------------------------------------------

/**
 * THE RAIL'S SECOND LEVEL ON THIS SCREEN SETS THESE, AND IT WORKS.
 *
 * It is worth stating plainly, because the same class of bug that broke
 * the queue's bucket link could easily have broken this one and it did
 * not. The rail's lane-class items are BUTTONS rather than links: they
 * dispatch into PipelineProvider, which sits above the router, and
 * `deskLines` reads `state.laneFilter` on every render. So choosing
 * "Calendar-locked" in the rail narrows this board in the same render,
 * and it narrows the map and the packages board too, which is the
 * behaviour the trade area page already promises in prose.
 *
 * The honest limitation, written down rather than left to be discovered:
 * because that filter is state and not a URL, it does not survive a
 * reload and it cannot be shared in a link. That is a defensible trade
 * for a filter three screens read at once, and it is a different thing
 * from the queue's bucket, which claimed to be a link and was not.
 *
 * These two lists are derived from LANE_META rather than typed out, for
 * the reason the rail gives for doing the same: a tenth lane added to
 * the union has to land in one of the two classes, and a hand-written
 * list would quietly leave it out of both.
 */
const LOCKED_LANES: Lane[] = LANE_ORDER.filter(
  (lane) => LANE_META[lane].occasionClass === "calendar-locked",
);
const DISCRETIONARY_LANES: Lane[] = LANE_ORDER.filter(
  (lane) => LANE_META[lane].occasionClass === "discretionary",
);

/** Same lane set, in any order. The rail, the desk and the map must agree. */
function sameLanes(a: Lane[], b: Lane[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((lane) => set.has(lane));
}

type LaneClass = "every" | "locked" | "discretionary" | "other";

/**
 * Which of the rail's three choices the current filter corresponds to.
 *
 * "Other" is a real answer and it is why this returns four values rather
 * than three. A reader who has toggled two lane chips by hand is in a
 * state none of the three named choices describes, and a control that
 * snapped back to "Every organisation" in that case would be showing a
 * value that disagrees with the board behind it.
 */
function laneClassOf(filter: Lane[]): LaneClass {
  if (filter.length === 0) return "every";
  if (sameLanes(filter, LOCKED_LANES)) return "locked";
  if (sameLanes(filter, DISCRETIONARY_LANES)) return "discretionary";
  return "other";
}

function DeskRow({
  line,
  rank,
  current,
  expanded,
  onToggleScore,
  onOpen,
  onTouch,
  onAdvance,
}: {
  line: DeskLine;
  rank: number;
  /** The row the pager is standing on. Marked, never merely tinted. */
  current: boolean;
  expanded: boolean;
  onToggleScore: () => void;
  onOpen: () => void;
  onTouch: () => void;
  onAdvance: () => void;
}) {
  const p = line.prospect;
  const advance = nextStatus(line.status);
  const whyId = `why-${p.id}`;

  return (
    <li
      className={styles.row}
      data-parked={line.status === "booked" || line.status === "lost"}
      data-record-id={p.id}
      data-current={current ? "true" : undefined}
      aria-current={current ? "true" : undefined}
      tabIndex={-1}
    >
      <div className={styles.rowGrid}>
        <span className={`${styles.rank} num`} aria-hidden="true">
          {String(rank).padStart(2, "0")}
        </span>

        {/* Wrapped rather than styled directly, because the plate's own
            class is generated by CSS Modules and reaching into it from
            here would couple this page to that file's internals. */}
        <span className={styles.plateWrap}>
          <ProspectPlate name={p.name} lane={p.lane} />
        </span>

        <div className={styles.identity}>
          {/*
            ── TWO AFFORDANCES, SIDE BY SIDE, NEITHER INSIDE THE OTHER ──

            The whole row opens the desk drawer and the NAME opens the
            record, which is what the owner asked for: press the words
            and the profile comes up. Those are two different
            destinations, so they are two different controls.

            The row's own control is a stretched button drawn behind
            everything, which is what it always was; the only change is
            that it no longer has the organisation's name inside it. A
            button inside a button is invalid markup that browsers
            repair by moving the inner one somewhere the author did not
            put it, and the name has to be a real button or it is not
            reachable from a keyboard at all.

            Its accessible name is spoken rather than drawn, because the
            words it would otherwise print are already the line beside
            it and printing them twice would give a screen reader the
            organisation twice in a row.
          */}
          <button
            type="button"
            className={styles.rowOpen}
            onClick={onOpen}
            aria-label={`Open everything known about ${p.name}`}
          />
          <span className={styles.name}>
            <RecordName prospectId={p.id} name={p.name} />
          </span>
          {/* The pager's position, in words as well as in the rule down
              the edge of the row and the tint behind it. Three signals,
              because one of them being colour is not allowed to matter. */}
          {current ? (
            <span className={styles.hereMark}>
              <span aria-hidden="true">▸</span> You are here
            </span>
          ) : null}
          <div className={styles.chips}>
            <LaneChip lane={p.lane} size="sm" />
            <StatusChip status={line.status} size="sm" short />
            <EmailConfidenceChip confidence={p.emailConfidence} size="sm" />
          </div>
          <p className={styles.title}>{p.decisionMakerTitle}</p>
        </div>

        <div className={styles.contact}>
          <span className={styles.colLabel}>Written door</span>
          {/*
            The chip above already names the route, so this cell carries
            the thing the chip cannot: the actual address, the actual
            form, the actual phone number. Repeating "form only" twice on
            one row would be two signals saying one thing.
          */}
          {p.emailConfidence === "verified_public" && p.email ? (
            <span className={`${styles.email} num`}>{p.email}</span>
          ) : p.emailConfidence === "form_only" ? (
            <span className={styles.noEmail}>
              Contact form{p.contactFormUrl ? ` at ${hostOf(p.contactFormUrl)}` : ""}
            </span>
          ) : (
            <span className={styles.noEmail}>
              {p.phone ? `Phone only, ${p.phone}` : "Phone or a visit"}
            </span>
          )}
        </div>

        <div className={`${styles.metric} ${styles.metricDistance}`}>
          <span className={styles.colLabel}>Distance</span>
          <span className={`${styles.metricValue} num`}>
            {line.miles.toFixed(1)}
          </span>
          <span className={styles.metricUnit}>straight-line miles</span>
        </div>

        <div className={`${styles.metric} ${styles.metricSize}`}>
          <span className={styles.colLabel}>Likely size</span>
          <span className={`${styles.metricValue} num`}>
            {p.headcountLow} to {p.headcountHigh}
          </span>
          <span className={styles.metricUnit}>
            guests, modeled
            <ProvenanceBadge provenance="modeled" compact />
          </span>
        </div>

        <button
          type="button"
          className={styles.scoreToggle}
          onClick={onToggleScore}
          aria-expanded={expanded}
          aria-controls={whyId}
        >
          <span className={`${styles.scoreValue} num`}>{line.score}</span>
          <span className={styles.scoreWord}>
            {expanded ? "Hide the score" : "Why this rank"}
          </span>
          <span className={styles.scoreCaret} aria-hidden="true">
            {expanded ? "▴" : "▾"}
          </span>
        </button>
      </div>

      <p className={styles.next}>
        <span className={styles.nextLabel}>Next</span>
        <span className={styles.nextText}>{line.nextAction}</span>
      </p>

      <div className={styles.actions}>
        <Button size="sm" glyph="◔" onClick={onTouch}>
          Record touch
        </Button>
        <Button
          size="sm"
          variant="primary"
          glyph="◑"
          onClick={onAdvance}
          disabled={advance === null}
          title={
            advance === null
              ? "The step from a held date to a booking is a signature and a deposit, so it happens on the Book page where the money lives."
              : `Move to ${PITCH_STATUS[advance].label.toLowerCase()}`
          }
        >
          {advance === null
            ? "Advance on the Book"
            : `Advance to ${PITCH_STATUS[advance].label.toLowerCase()}`}
        </Button>
        <span className={styles.touchCount}>
          <span className="num">{line.touches}</span>{" "}
          {line.touches === 1 ? "touch" : "touches"} this period
        </span>
      </div>

      {expanded ? (
        <div className={styles.breakdown} id={whyId}>
          <h3 className={styles.breakdownTitle}>
            How {p.name} scored {line.score}
          </h3>

          <table className={styles.scoreTable}>
            <thead>
              <tr>
                <th scope="col">Component</th>
                <th scope="col" className={styles.pointsCol}>
                  Points
                </th>
                <th scope="col">What it is measuring</th>
              </tr>
            </thead>
            <tbody>
              {line.components.map((c) => (
                <tr key={c.label} data-sign={c.points < 0 ? "minus" : "plus"}>
                  <th scope="row" className={styles.componentLabel}>
                    {c.label}
                  </th>
                  <td className={styles.pointsCell}>
                    <span className={`${styles.points} num`}>
                      {c.points > 0 ? `+${c.points}` : c.points}
                    </span>
                    {/* Decorative. The signed number beside it carries the
                        value, and the sign carries the direction, so the
                        bar can be lost entirely without losing meaning. */}
                    <span className={styles.bar} aria-hidden="true">
                      <span
                        className={styles.barFill}
                        style={{
                          width: `${Math.min(
                            100,
                            (Math.abs(c.points) / MAX_COMPONENT_POINTS) * 100,
                          )}%`,
                        }}
                      />
                    </span>
                  </td>
                  <td className={styles.why}>{c.why}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total</th>
                <td className={styles.pointsCell}>
                  <span className={`${styles.points} ${styles.totalPoints} num`}>
                    {line.score}
                  </span>
                </td>
                <td className={styles.why}>
                  {line.status === "booked" || line.status === "lost"
                    ? "Booked and lost rows sort to the bottom whatever they score."
                    : "Derived at render. No part of this order is stored."}
                </td>
              </tr>
            </tfoot>
          </table>

          <p className={styles.breakdownFoot}>
            <code className={styles.code}>domain/selectors/desk.ts</code>.
            Lanes at the midpoint headcount, at Main Event's published rate of
            one lane per twenty guests:{" "}
            <strong className="num">{line.lanesAtMidpoint}</strong>.
          </p>
        </div>
      ) : null}
    </li>
  );
}

export function DeskPage() {
  const pipeline = usePipeline();
  const dispatch = usePipelineDispatch();
  const book = useBook();

  const [openId, setOpenId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const period = PERIOD_BY_ID[pipeline.periodId] ?? PERIODS[0];
  /* "2026-09-14" gives 8, which is September. Parsed off the ISO string
     rather than through Date, because new Date("2026-09-14") is parsed as
     UTC midnight and shifts a day backwards west of Greenwich, which is
     where Brea is. */
  const nowMonth = Number(period.startDate.slice(5, 7)) - 1;

  const lines = useMemo(
    () => deskLines(pipeline, { nowMonth }),
    [pipeline, nowMonth],
  );

  const visible = showAll ? lines : lines.slice(0, DESK_PAGE_SIZE);
  const openProspect = openId
    ? PROSPECTS.find((p) => p.id === openId) ?? null
    : null;

  // -------------------------------------------------------------
  // The band above the board
  // -------------------------------------------------------------

  const laneClass = laneClassOf(pipeline.laneFilter);
  const boardIds = useMemo(() => lines.map((l) => l.prospect.id), [lines]);

  const [pickedId, setPickedId] = useState<string | null>(null);
  const currentId =
    pickedId !== null && boardIds.includes(pickedId) ? pickedId : null;
  useRecordFocus(currentId);

  /**
   * Stepping past the twentieth row opens the rest of the board first.
   *
   * The desk deliberately draws twenty rows and hides the tail behind a
   * control, for the reason written further down: twenty is about what
   * one person moves in a week. A pager that walked into the hidden tail
   * would step to a row that is not in the document, focus nothing, and
   * look broken. So the tail opens itself the moment the pager needs it,
   * which is the one case where "show all" is not a decision the reader
   * has to make.
   */
  const stepTo = useCallback(
    (id: string) => {
      const index = boardIds.indexOf(id);
      if (index >= DESK_PAGE_SIZE) setShowAll(true);
      setPickedId(id);
    },
    [boardIds],
  );

  const laneCrumb =
    laneClass === "locked"
      ? "Calendar-locked"
      : laneClass === "discretionary"
        ? "Discretionary"
        : laneClass === "other"
          ? pipeline.laneFilter.length === 1
            ? LANE_META[pipeline.laneFilter[0]].label
            : `${pipeline.laneFilter.length} lanes`
          : undefined;

  /**
   * The board as a spreadsheet, in the order the board ranks it.
   *
   * The score and its rank travel with each row, because the argument
   * this screen makes is about the ORDER, and a list exported without it
   * is a list the recipient will sort by name and then work the wrong
   * way round.
   */
  const exportCsv = useCallback(() => {
    const csv = toCsv(
      [
        "Rank",
        "Organisation",
        "Lane",
        "City",
        "Straight-line miles",
        "Status",
        "Touches",
        "Score",
        "Lanes at midpoint",
        "Next action",
      ],
      lines.map((l, i) => [
        i + 1,
        l.prospect.name,
        LANE_META[l.prospect.lane].label,
        l.prospect.city,
        l.miles.toFixed(1),
        PITCH_STATUS[l.status].label,
        l.touches,
        l.score,
        l.lanesAtMidpoint,
        l.nextAction,
      ]),
    );
    downloadCsv(
      laneClass === "every" ? "desk-board" : `desk-board-${laneClass}`,
      csv,
    );
  }, [lines, laneClass]);

  const filtersOn =
    pipeline.laneFilter.length > 0 ||
    pipeline.query.trim().length > 0 ||
    pipeline.emailableOnly;

  /**
   * The cut currently on screen, in a word, a glyph and a tone.
   *
   * Named off the same lane filter the chips write, so the block above
   * the board and the chips above it cannot describe different sets. A
   * hand-picked pair of lanes is named as the two lanes rather than as
   * "filtered", because "filtered" tells a reader that something was
   * removed and not what is left.
   */
  const cut = useMemo(() => {
    if (laneClass === "locked") {
      return {
        label: OCCASION_CLASS_META["calendar-locked"].label,
        glyph: OCCASION_CLASS_META["calendar-locked"].glyph,
        tone: "var(--info)",
      };
    }
    if (laneClass === "discretionary") {
      return {
        label: OCCASION_CLASS_META.discretionary.label,
        glyph: OCCASION_CLASS_META.discretionary.glyph,
        tone: "var(--warn)",
      };
    }
    if (laneClass === "other") {
      return {
        label:
          pipeline.laneFilter.length === 1
            ? LANE_META[pipeline.laneFilter[0]].label
            : `${pipeline.laneFilter.length} lanes, hand-picked`,
        glyph: "◆",
        tone: "var(--accent)",
      };
    }
    return {
      label: "Every organisation",
      glyph: "Σ",
      tone: "var(--brand-gold)",
    };
  }, [laneClass, pipeline.laneFilter]);

  /**
   * The key that re-keys the lead, and it carries every filter rather
   * than only the lane. Searching "high school" narrows the board just as
   * hard as pressing Schools does, and a block that only redrew for one
   * of the two would be telling the reader that the other did nothing.
   */
  const cutKey = [
    laneClass,
    pipeline.laneFilter.join("+"),
    pipeline.query.trim().toLowerCase(),
    pipeline.emailableOnly ? "emailable" : "any",
  ].join("|");

  /**
   * Three figures over the FILTERED board.
   *
   * This is the repair, stated as arithmetic: the strip that used to hold
   * this position counted the whole trade area, so it said 42 never
   * touched while the rows underneath were twenty six schools. These are
   * computed off `lines`, which is the same array the board draws, so
   * they cannot disagree with what is on screen.
   */
  const cutFacts = useMemo(
    () => [
      {
        label: "Never touched",
        value: `${lines.filter((l) => l.status === "unworked").length} of ${lines.length}`,
        qualifier: <ProvenanceBadge provenance="illustrative" compact />,
      },
      {
        label: "Publishing an email we read",
        value: `${
          lines.filter((l) => l.prospect.emailConfidence === "verified_public")
            .length
        } of ${lines.length}`,
        qualifier: <ProvenanceBadge provenance="public" compact />,
      },
      {
        label: "Live conversations",
        value: `${
          lines.filter(
            (l) => l.status === "conversation" || l.status === "soft-hold",
          ).length
        } of ${lines.length}`,
        qualifier: <ProvenanceBadge provenance="illustrative" compact />,
      },
      /* Kept from the result bar this block replaced. It is the figure
         that says how much of this cut can only be worked by driving
         there, which is the whole argument for the go-see runs. */
      {
        label: "No written door",
        value: `${
          lines.filter((l) => l.prospect.emailConfidence === "none").length
        } of ${lines.length}`,
        qualifier: <ProvenanceBadge provenance="public" compact />,
      },
    ],
    [lines],
  );

  /** What the live region says when the cut changes. */
  const announcement = useMemo(() => {
    const parts = [
      `${cut.label}.`,
      `${lines.length} of ${PROSPECTS.length} organisations on the board.`,
      `Never touched: ${lines.filter((l) => l.status === "unworked").length}.`,
    ];
    if (lines[0]) parts.push(`First is ${lines[0].prospect.name}.`);
    return parts.join(" ");
  }, [cut, lines]);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/*
          The band. The context control is the occasion class, which is
          the same filter the rail's second level sets and the same one
          the map and the packages board read, so choosing it here moves
          all three. It is offered again in the band because a reader
          standing on this screen should not have to travel to the rail
          to change the one filter the rail advertises for it.
        */}
        <PageHeader
          filterCrumb={laneCrumb}
          context={
            <ContextSelect
              id="desk-occasion"
              label="Occasion"
              value={laneClass}
              options={[
                {
                  value: "every",
                  label: "Every organisation",
                  count: PROSPECTS.length,
                },
                {
                  value: "locked",
                  label: "Calendar-locked",
                  count: PROSPECTS.filter((p) =>
                    LOCKED_LANES.includes(p.lane),
                  ).length,
                },
                {
                  value: "discretionary",
                  label: "Discretionary",
                  count: PROSPECTS.filter((p) =>
                    DISCRETIONARY_LANES.includes(p.lane),
                  ).length,
                },
                /* The hand-picked state is offered as a reading and
                   never as a choice, because there is nothing for the
                   control to set it to. Selecting it is a no-op and the
                   lane chips below are where that state is made. */
                ...(laneClass === "other"
                  ? [
                      {
                        value: "other",
                        label: `Hand-picked lanes (${pipeline.laneFilter.length})`,
                      },
                    ]
                  : []),
              ]}
              onChange={(value) => {
                if (value === "locked") {
                  dispatch({ type: "SET_LANES", lanes: LOCKED_LANES });
                } else if (value === "discretionary") {
                  dispatch({ type: "SET_LANES", lanes: DISCRETIONARY_LANES });
                } else if (value === "every") {
                  dispatch({ type: "CLEAR_LANES" });
                }
                setPickedId(null);
              }}
            />
          }
          pager={
            <RecordPager
              ids={boardIds}
              currentId={currentId}
              onChange={stepTo}
              noun={["organisation", "organisations"]}
              setLabel="on this board"
            />
          }
          actions={
            <Button size="sm" glyph="▤" onClick={exportCsv}>
              Export {lines.length} as CSV
            </Button>
          }
        />

        <header className={styles.head}>
          <p className={styles.eyebrow}>Stage one, {period.label}</p>
          <h1 className={styles.h1}>The desk</h1>
          {/*
            EVERY COUNT IN THIS HEADER IS DERIVED, AND THAT IS A FIX
            RATHER THAN A FLOURISH. These sentences carried the totals as
            words: "sixty-nine" in the lede, "All eight lanes" on the
            first filter, "of the sixty-nine" in the result line. A ninth
            lane landed and a third research pass took the board to 102,
            and the prose stayed where it was, so the first sentence on
            the front door disagreed with the stat card directly beneath
            it. On an application whose whole argument is that its numbers
            are derived rather than asserted, that is the cheapest
            possible reason to doubt every other figure on the site.
            Reading the length of the array removes the class of bug, not
            just this instance of it.
          */}
        </header>

        {/* -----------------------------------------------------------
            THE STRIP. Five figures, and the last three move the moment a
            reader changes anything, because they are selectors over the
            fact table rather than stored totals.
            ----------------------------------------------------------- */}
        {/*
          THE FOUR BLOCKS BELOW CARRY REAL HEADINGS, VISUALLY HIDDEN.

          This page used to render exactly one heading, the h1, while
          comparable pages render ten to fifty. Heading navigation is how
          a screen reader user skims, so the busiest screen in the
          application offered one landmark to jump to and everything else
          had to be reached by tabbing through it in a line. The blocks
          are visually self evident, so the headings are hidden rather
          than drawn; they name the sections through aria-labelledby as
          well, which is one string doing both jobs instead of an
          aria-label that duplicates a heading and can drift from it.
        */}
        {/* -----------------------------------------------------------
            FILTERS. Lane chips are toggles rather than a multi-select,
            because the lane is the thing a rep actually plans a day
            around and a dropdown hides which ones are on.
            ----------------------------------------------------------- */}
        <section className={styles.filters} aria-labelledby="desk-filter-heading">
          <h2 className="visually-hidden" id="desk-filter-heading">
            Filter the board
          </h2>
          <div className={styles.laneFilter} role="group" aria-label="Lanes">
            <button
              type="button"
              className={styles.laneBtn}
              aria-pressed={pipeline.laneFilter.length === 0}
              onClick={() => dispatch({ type: "CLEAR_LANES" })}
            >
              <span className={styles.allLanes}>
                All {LANE_ORDER.length} lanes
              </span>
            </button>
            {LANE_ORDER.map((lane) => (
              <button
                key={lane}
                type="button"
                className={styles.laneBtn}
                aria-pressed={pipeline.laneFilter.includes(lane)}
                onClick={() => dispatch({ type: "TOGGLE_LANE", lane })}
              >
                <LaneChip lane={lane} size="sm" />
              </button>
            ))}
          </div>

          <div className={styles.filterRight}>
            <div className={styles.searchWrap}>
              <label className={styles.searchLabel} htmlFor="desk-search">
                Search
              </label>
              <input
                id="desk-search"
                type="search"
                className={styles.search}
                placeholder="Name, city or job title"
                value={pipeline.query}
                onChange={(e) =>
                  dispatch({ type: "SET_QUERY", query: e.target.value })
                }
              />
            </div>

            <button
              type="button"
              className={styles.emailToggle}
              aria-pressed={pipeline.emailableOnly}
              onClick={() => dispatch({ type: "TOGGLE_EMAILABLE_ONLY" })}
              title="Show only the organisations that publish an address on their own site."
            >
              <span aria-hidden="true" className={styles.emailToggleGlyph}>
                {pipeline.emailableOnly ? "◆" : "◇"}
              </span>
              <span>Publishes an email</span>
            </button>
          </div>
        </section>

        {/*
          THE COUNT IS A LIVE REGION, BECAUSE NOTHING NAVIGATES.

          Typing in the search box or toggling a lane changes this
          sentence and nothing else on the screen announces it, so a
          screen reader user filtering the board got no confirmation that
          anything had happened at all. Polite rather than assertive, so
          it is read once the typing settles instead of interrupting
          every keystroke. /map already does this and this is the same
          pattern, not a new one.
        */}
        <h2 className="visually-hidden" id="desk-board-heading">
          The ranked board
        </h2>

        {/* -----------------------------------------------------------
            THE CUT ON SCREEN, AND WHAT IS IN IT.

            This replaces a one line result count, and it is doing the
            same job the requests queue's lead does: naming the set a
            reader has just chosen, sizing it, and giving the three
            figures that are true of THIS cut rather than of the trade
            area. The strip of standing figures moved under the board to
            make room, because a filter whose consequences are all below
            the fold is a filter that looks broken.

            The count keeps its live region, which it had before and
            which is the only reason a screen reader user knew a lane
            chip had done anything.
            ----------------------------------------------------------- */}
        <WorkingSetLead
          headingId="desk-working-set-h"
          changeKey={cutKey}
          kicker="On screen now"
          glyph={cut.glyph}
          label={cut.label}
          tone={cut.tone}
          count={lines.length}
          total={PROSPECTS.length}
          noun={["organisation", "organisations"]}
          facts={cutFacts}
          rows={visible.slice(0, 3).map((l) => ({
            id: l.prospect.id,
            name: l.prospect.name,
            kind: PITCH_STATUS[l.status].label,
            when: (
              <>
                score <span className="num">{l.score}</span>,{" "}
                <span className="num">{l.miles.toFixed(1)}</span> straight-line
                miles
              </>
            ),
            onOpen: () => setOpenId(l.prospect.id),
            openLabel: "Open",
          }))}
          emptyLine={`No match on the board. All ${PROSPECTS.length} organisations are still there behind the filter.`}
          announcement={announcement}
          actions={
            filtersOn ? (
              <Button
                size="sm"
                glyph="✕"
                onClick={() => {
                  dispatch({ type: "CLEAR_LANES" });
                  dispatch({ type: "SET_QUERY", query: "" });
                  if (pipeline.emailableOnly)
                    dispatch({ type: "TOGGLE_EMAILABLE_ONLY" });
                }}
              >
                Clear every filter, show all {PROSPECTS.length}
              </Button>
            ) : undefined
          }
        />

        {lines.length === 0 ? null : (
          <ol className={styles.list} aria-labelledby="desk-board-heading">
            {visible.map((line, i) => (
              <DeskRow
                key={line.prospect.id}
                line={line}
                rank={i + 1}
                current={line.prospect.id === currentId}
                expanded={expandedId === line.prospect.id}
                onToggleScore={() =>
                  setExpandedId(
                    expandedId === line.prospect.id ? null : line.prospect.id,
                  )
                }
                onOpen={() => setOpenId(line.prospect.id)}
                onTouch={() =>
                  dispatch({
                    type: "RECORD_TOUCH",
                    prospectId: line.prospect.id,
                    packageId: line.packageId,
                    at: TODAY,
                  })
                }
                onAdvance={() => {
                  const next = nextStatus(line.status);
                  if (!next) return;
                  dispatch({
                    type: "SET_STATUS",
                    prospectId: line.prospect.id,
                    packageId: line.packageId,
                    status: next,
                    at: TODAY,
                  });
                }}
              />
            ))}
          </ol>
        )}

        {/*
          A DESK IS A DAY'S WORK, NOT A DATABASE. Twenty rows is about what
          one person can actually move in a week, and a screen that opens
          with the whole board on it teaches a reader that the list is the
          point rather than the order. The rest is one click away and the
          count is on the button, so nothing is hidden.
        */}
        {lines.length > DESK_PAGE_SIZE ? (
          <div className={styles.moreWrap}>
            <Button onClick={() => setShowAll(!showAll)}>
              {showAll
                ? `Back to the top ${DESK_PAGE_SIZE}`
                : `Show all ${lines.length} on the board`}
            </Button>
          </div>
        ) : null}

        {/* -----------------------------------------------------------
            WHAT THE TRADE AREA HOLDS.

            THIS STRIP USED TO SIT ABOVE THE FILTERS AND IT DID NOT MOVE
            WHEN THEY DID. Five figures over the whole trade area, drawn
            in the position a reader looks to for the answer to the thing
            they just pressed, and three of the five do not narrow with a
            lane at all. So choosing Schools left the top of the screen
            reading 102, 35 and 42 while the board underneath showed
            twenty six rows.

            Standing facts belong under the rows they describe. The
            figures, the notes and the provenance badges are exactly as
            they were; what changed is that the position above the board
            now belongs to the working set, which does narrow.
            ----------------------------------------------------------- */}
        <section className={styles.kpis} aria-labelledby="desk-strip-heading">
          <h2 className="visually-hidden" id="desk-strip-heading">
            What the board holds
          </h2>
          <Kpi
            value={PROSPECTS.length}
            label="Organisations on the board"
            note="Real, inside 6.6 miles of 245 W Birch Street, each carrying the Google place id it came from."
            provenance="public"
          />
          <Kpi
            value={emailableCount()}
            label="Publishing an email we read"
            note="Read off their own page. Every one carries the URL it was read from, and none were guessed from a domain."
            provenance="public"
          />
          <Kpi
            value={unworkedCount(pipeline)}
            label="Never touched"
            note="What a pre-opening trade area actually looks like on day one. Softening this would have been the dishonest move."
            provenance="illustrative"
          />
          <Kpi
            value={liveConversationCount(pipeline)}
            label="Live conversations"
            note="Replied and want to talk, or holding a date. A hold is worth nothing until it converts."
            provenance="illustrative"
          />
          <Kpi
            value={revenueTotals(book.book).contracts}
            label="Contracts signed"
            note="The only figure on this strip that is revenue. Everything else here is work."
            provenance="illustrative"
          />
        </section>
      </div>

      {openProspect ? (
        <ProspectDrawer
          prospect={openProspect}
          onClose={() => setOpenId(null)}
        />
      ) : null}
    </div>
  );
}
