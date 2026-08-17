import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/chrome/PageHeader";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { LaneChip } from "@/components/primitives/LaneChip";
import { SEGMENT_CODE_DISPLAY, type SegmentId } from "@/domain/segments";
import { LANE_META } from "@/domain/lanes";
import {
  SEGMENT_WEIGHTS,
  segmentBoard,
  segmentTotals,
  type SegmentRow,
} from "@/domain/selectors/segments";
import { usePipeline } from "@/state/PipelineProvider";
import styles from "./SegmentsPage.module.css";

/**
 * THE INDUSTRY CUT, RANKED, WITH THE RANKING'S OWN THUMB ON THE SCALE
 * HANDED TO THE READER.
 *
 * ── WHAT ONE LINE OF THE POSTING ASKS FOR ─────────────────────────
 *   "Develop and execute a local and outbound sales strategy to identify
 *    high-potential target customer segments and industries that would
 *    benefit from our services."
 *
 * Lanes already answers HOW you reach somebody. This screen answers
 * WHICH INDUSTRIES ARE WORTH REACHING FIRST, which is a different
 * document written in a different month, and the only version of that
 * answer worth anything is one a reader can argue with.
 *
 * ── THE SCREEN THIS DELIBERATELY IS NOT ───────────────────────────
 * The expected build is a donut of the board by industry with the
 * biggest wedge called the opportunity. That chart answers "what did I
 * collect", which nobody asked, and it is unfalsifiable in the way a
 * picture is: there is no rule in it to disagree with. The alternative
 * cost of the donut is the whole reason this page exists. A segmentation
 * with no stated rule is an opinion with a number typed next to it.
 *
 * So the ranking is a stated rule, its three inputs are counts off rows
 * a reader can click, and the rule's one judgement, the weighting, is
 * a CONTROL rather than a constant. Four presets re-rank the board live
 * and print their own numbers next to the answer they produce. A reader
 * who thinks certainty matters more than volume before a venue opens
 * does not have to take my word for the consequence; they press
 * "Pre-opening" and watch thirteen sectors move.
 *
 * ── WHY THE RE-RANK IS COMPUTED HERE AND NOT IN THE SELECTOR ──────
 * `segmentBoard()` already returns the three normalised components, so
 * re-scoring is one multiply-add over sixteen rows. Pushing a weights
 * argument into the selector would have been the tidier-looking move and
 * it would have cost the thing that makes the selector trustworthy:
 * every other surface that reads that table would inherit an argument it
 * has no opinion about, and the published SEGMENT_WEIGHTS would stop
 * being the answer the rest of the application agrees on. The selector
 * stays the single source of the components; this file owns the opinion.
 *
 * ── A CONTROL THAT SILENTLY REORDERS A LONG LIST READS AS BROKEN ──
 * This build has been burned once already by tabs that changed nothing
 * above the fold. Sixteen rows are taller than a viewport, so pressing
 * "Reach" can move twelve sectors and a reader watching the top three sees
 * a page that did nothing. Every row therefore carries how far it moved
 * against the default weighting, as an arrow AND a word AND a number,
 * and the status line under the presets says how many rows changed place
 * and names the biggest mover before anybody has to scroll to find it.
 *
 * The movement marker is deliberately NOT green-up and red-down. A
 * sector rising under a different weighting is not good news, it is a
 * consequence of a judgement the reader just made, and painting it as a
 * win would be the page arguing for its own control.
 *
 * ── THE STATE LIVES IN THE ADDRESS ────────────────────────────────
 * Eleven other files in this build keep their reading in the URL for one
 * reason: the proof scripts cannot press a control, and a state that can
 * only be reached by pressing is a state nobody ever screenshots. So the
 * weighting is `?weights=certainty` and the open row is `?open=61`,
 * both narrowed to values this board actually has, because the address
 * bar is an input like any other.
 *
 * ── THE ABSENT SECTOR IS PART OF THE ANSWER ───────────────────────
 * NAICS 51 has nothing in it. Three candidates were researched and every
 * one rested on a single directory line with a generic switchboard
 * number, so none of them shipped. It is rendered as a finding with its
 * own friction text rather than dropped, because a segmentation that
 * only lists what was found cannot tell you where to look next.
 */

// ---------------------------------------------------------------
// The weighting, as four readings of the same board
// ---------------------------------------------------------------

type WeightsKey = "balanced" | "certainty" | "volume" | "reach";

interface WeightPreset {
  key: WeightsKey;
  label: string;
  /** Shape before hue. The pressed preset is legible in greyscale. */
  glyph: string;
  volume: number;
  certainty: number;
  reach: number;
  /** Who would choose this, and what they are giving up to choose it. */
  note: string;
}

/**
 * The default is READ FROM THE SELECTOR rather than retyped as 0.5/0.3/
 * 0.2. If the published weighting ever changes, the page that prints it
 * must change with it, and a second copy of three numbers in a component
 * is exactly how a screen ends up disagreeing with its own data layer.
 */
const PRESETS: Record<WeightsKey, WeightPreset> = {
  balanced: {
    key: "balanced",
    label: "Balanced",
    glyph: "◎",
    volume: SEGMENT_WEIGHTS.volume,
    certainty: SEGMENT_WEIGHTS.certainty,
    reach: SEGMENT_WEIGHTS.reach,
    note: "The board's published weighting. Volume leads because guests are the closest thing to revenue that can be computed without inventing a price, and Round1 does not publish group prices.",
  },
  certainty: {
    key: "certainty",
    label: "Certainty",
    glyph: "◷",
    volume: 0.2,
    certainty: 0.6,
    reach: 0.2,
    note: "From a standing start the only prospects worth anything are the ones whose event happens whether or not you call them. A graduating class graduates. A holiday party is a decision somebody can simply not make.",
  },
  volume: {
    key: "volume",
    label: "Volume",
    glyph: "▦",
    volume: 0.8,
    certainty: 0.1,
    reach: 0.1,
    note: "Fill the building. Everything is seats, and a hard sector with four hundred guests in it beats an easy one with forty.",
  },
  reach: {
    key: "reach",
    label: "Reach",
    glyph: "▤",
    volume: 0.2,
    certainty: 0.2,
    reach: 0.6,
    note: "One rep, and an hour out of the office is the scarce resource. Sectors you can write to win; sectors that have to be walked lose.",
  },
};

const PRESET_ORDER: WeightsKey[] = ["balanced", "certainty", "volume", "reach"];

const WEIGHTS_PARAM = "weights";
const OPEN_PARAM = "open";

/**
 * The three components, declared once so the bar, the legend and the
 * weight print cannot drift apart.
 *
 * Each carries a glyph and a word before it carries a tone, which is the
 * house rule and not a preference: the owner of this build is
 * colourblind, and three tracks distinguished only by hue would be one
 * track with a wide fill to him.
 */
interface ComponentSpec {
  key: "volume" | "certainty" | "reach";
  label: string;
  glyph: string;
  cssVar: string;
  /** What the index is a share OF. Printed in the legend, not guessed at. */
  basis: string;
  read: (row: SegmentRow) => number;
}

const COMPONENTS: ComponentSpec[] = [
  {
    key: "volume",
    label: "Volume",
    glyph: "▦",
    cssVar: "var(--info)",
    basis: "Seats in play as a share of the largest sector on the board.",
    read: (row) => row.volumeIndex,
  },
  {
    key: "certainty",
    label: "Certainty",
    glyph: "◷",
    cssVar: "var(--ok)",
    basis: "The share of the sector whose occasion happens whether or not anybody calls them.",
    read: (row) => row.certaintyIndex,
  },
  {
    key: "reach",
    label: "Reach",
    glyph: "▤",
    cssVar: "var(--sec-ink, var(--sec-lanes-ink))",
    basis: "The share with any written door at all: a published address or a contact form.",
    read: (row) => row.reachIndex,
  },
];

/**
 * The reach split, as a shape ramp rather than three colours.
 *
 * Filled, half, empty. It reads as "how open is the door" at a glance,
 * it survives greyscale, and it is the same distinction the desk sorts
 * on, so a reader arriving from there recognises it without a legend.
 */
const REACH_SPLIT: {
  key: "emailable" | "formOnly" | "doorOnly";
  glyph: string;
  label: string;
  note: string;
}[] = [
  {
    key: "emailable",
    glyph: "●",
    label: "Published address",
    note: "Read off their own page. A letter reaches the building.",
  },
  {
    key: "formOnly",
    glyph: "◐",
    label: "Contact form only",
    note: "There is a written door and nobody's name behind it.",
  },
  {
    key: "doorOnly",
    glyph: "○",
    label: "Go-see only",
    note: "No written door at all. This one costs an hour out of the building.",
  },
];

const count = (n: number) => n.toLocaleString("en-US");
const pct = (index: number) => Math.round(index * 100);

// ---------------------------------------------------------------
// The re-rank
// ---------------------------------------------------------------

interface RankedSegment {
  row: SegmentRow;
  /** Recomputed here from the components. Modeled, like the published one. */
  score: number;
  rank: number;
  /** Places moved against the default weighting. Positive is up the board. */
  moved: number;
}

/**
 * Score and sort under one weighting.
 *
 * The tiebreak is copied from the selector on purpose, score, then
 * seats, then label, because two orderings of the same board that
 * disagree only when two scores tie is the worst kind of bug: it looks
 * like the control did something and it did nothing.
 */
function rankUnder(board: SegmentRow[], preset: WeightPreset): SegmentRow[] {
  return board
    .filter((row) => row.count > 0)
    .map((row) => ({
      row,
      score:
        100 *
        (preset.volume * row.volumeIndex +
          preset.certainty * row.certaintyIndex +
          preset.reach * row.reachIndex),
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.row.seatsInPlay - a.row.seatsInPlay ||
        a.row.label.localeCompare(b.row.label),
    )
    .map((entry) => entry.row);
}

// ---------------------------------------------------------------
// The page
// ---------------------------------------------------------------

export function SegmentsPage() {
  const pipeline = usePipeline();
  const [params, setParams] = useSearchParams();

  /* The untouched count is the one figure on this screen that moves when
     somebody works the desk, so the board is built against live pipeline
     state rather than the stateless call the other three surfaces make. */
  const board = useMemo(() => segmentBoard(pipeline), [pipeline]);
  const totals = useMemo(() => segmentTotals(board), [board]);

  /* Narrowed to a preset this page actually has. A pasted
     `?weights=aggressive` falls back to the default rather than drawing
     an unranked board with no explanation of why it is unranked. */
  const askedWeights = params.get(WEIGHTS_PARAM) ?? "";
  const activeKey: WeightsKey = PRESET_ORDER.includes(askedWeights as WeightsKey)
    ? (askedWeights as WeightsKey)
    : "balanced";
  const preset = PRESETS[activeKey];

  const ranked = useMemo<RankedSegment[]>(() => {
    const baseline = rankUnder(board, PRESETS.balanced);
    const baselineRank = new Map<SegmentId, number>();
    baseline.forEach((row, i) => baselineRank.set(row.id, i + 1));

    return rankUnder(board, preset).map((row, i) => ({
      row,
      score: Math.round(
        100 *
          (preset.volume * row.volumeIndex +
            preset.certainty * row.certaintyIndex +
            preset.reach * row.reachIndex),
      ),
      rank: i + 1,
      moved: (baselineRank.get(row.id) ?? i + 1) - (i + 1),
    }));
  }, [board, preset]);

  /* The two figures the status line needs, computed with the ranking
     rather than counted again in the JSX where they would go stale. */
  const movedCount = ranked.filter((r) => r.moved !== 0).length;
  const biggestMover = ranked.reduce<RankedSegment | null>(
    (best, r) =>
      Math.abs(r.moved) > Math.abs(best?.moved ?? 0) ? r : best,
    null,
  );

  /* NAICS 51 and anything else that ever empties. Read off the totals
     rather than hard-coded, so a sector that empties later lands in the
     gap section instead of silently vanishing from a ranking. */
  const gaps = board.filter((row) => totals.emptySectors.includes(row.id));

  const halfRows = totals.halfOfTheRoom
    .map((id) => board.find((row) => row.id === id))
    .filter((row): row is SegmentRow => row !== undefined);
  const halfSeats = halfRows.reduce((sum, row) => sum + row.seatsInPlay, 0);
  const halfShare = totals.seatsInPlay
    ? Math.round((halfSeats / totals.seatsInPlay) * 100)
    : 0;

  const openId = params.get(OPEN_PARAM) ?? "";
  const openRow = board.some((row) => row.id === openId && row.count > 0)
    ? (openId as SegmentId)
    : null;

  /* Replaced rather than pushed. Changing a weighting is re-reading the
     same board, not going somewhere, and a back button that had to walk
     back through four presets to leave the screen would be a control
     stealing the browser's own verb. */
  const setReading = (key: string, value: string, fallback: string) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === fallback) next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true },
    );
  };

  /* The top three under whatever weighting is on, which is the whole
     point of the last section: the first move changes when the judgement
     changes, and a "what a rep does on Monday" block that ignored the
     control would be the page contradicting itself two screens down. */
  const firstMoves = ranked.slice(0, 3);

  return (
    <div
      className={styles.page}
      data-active-weights={activeKey}
      data-segment-count={ranked.length}
    >
      <PageHeader />

      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>The board cut by industry</p>
          <h1 className={styles.h1}>
            Which sectors to work first, and the rule that says so
          </h1>
          <blockquote className={styles.posting}>
            <p className={styles.postingText}>
              "Maintain strong relationships with suppliers and licensors
              while scouting new vendor opportunities."
            </p>
            <footer className={styles.postingFoot}>
              One line of the Round1 posting. This screen is the answer to it.
            </footer>
          </blockquote>
          <p className={styles.lede}>
            <span className="num">{count(totals.organisations)}</span>{" "}
            organisations across{" "}
            <span className="num">{totals.sectors}</span> NAICS sectors, ranked
            by a rule with three inputs and one judgement. The inputs are counts
            off rows you can open. The judgement is the weighting, and it is a
            control on this page rather than a constant, because a ranking
            nobody can argue with is a ranking nobody should trust.
          </p>
          <p className={styles.provNote}>
            <ProvenanceBadge provenance="modeled" />
            <span>
              Every score and every seat figure on this screen is computed from
              counts. Organisation counts are counts. Nothing here is a number
              somebody typed into a template.
            </span>
          </p>
        </header>

        {/* =========================================================
            ONE. THE ANSWER, BEFORE THE EVIDENCE.

            A reader who closes this tab after eight seconds should
            leave with the half-the-room sentence and nothing else, so
            it sits above the ranking rather than under it as a
            conclusion. The three tiles are the scale of the thing; the
            block under them is the only figure that decides a quarter.
            ========================================================= */}
        <section className={styles.answer} aria-labelledby="answer-h">
          <p className={styles.sectionEyebrow}>Read this first</p>
          <h2 className={styles.h2} id="answer-h">
            Three sectors hold half the guests on the board
          </h2>

          <div className={styles.tiles}>
            <div className={styles.tile}>
              <span className={`${styles.tileValue} num`}>
                {count(totals.organisations)}
              </span>
              <span className={styles.tileLabel}>
                organisations, each one a row on the desk. Counted, not
                estimated.
              </span>
            </div>
            <div className={styles.tile}>
              <span className={`${styles.tileValue} num`}>
                {totals.sectors}
              </span>
              <span className={styles.tileLabel}>
                sectors with anything in them, of{" "}
                <span className="num">{board.length}</span> carried. Counted.
              </span>
            </div>
            <div className={styles.tile}>
              <span className={`${styles.tileValue} num`}>
                {count(totals.seatsInPlay)}
              </span>
              <span className={styles.tileLabel}>
                seats in play, summed from headcount midpoints
                <ProvenanceBadge provenance="modeled" compact />
              </span>
            </div>
          </div>

          {/* ---------------------------------------------------------
              THE SENTENCE THE WHOLE SCREEN IS FOR.

              It is deliberately a paragraph and not a fourth tile. A
              tile reading "3" would have been the same fact in a
              quarter of the space and it would have said nothing: the
              useful part is WHICH three, and a number with no names
              beside it cannot be acted on before Monday.
              --------------------------------------------------------- */}
          <div className={styles.headline}>
            <p className={styles.headlineLabel}>
              What you would keep if you only had a quarter
            </p>
            <p className={styles.headlineText}>
              {halfRows.map((row, i) => (
                <span key={row.id}>
                  {i > 0 ? (i === halfRows.length - 1 ? " and " : ", ") : ""}
                  <strong className={styles.headlineName}>{row.label}</strong>
                  <span className={`${styles.headlineCode} num`}>
                    {SEGMENT_CODE_DISPLAY[row.id]}
                  </span>
                </span>
              ))}{" "}
              hold <span className="num">{halfShare}%</span> of the{" "}
              <span className="num">{count(totals.seatsInPlay)}</span> seats on
              this board between them:{" "}
              <span className="num">{count(halfSeats)}</span> guests, in{" "}
              <span className="num">{halfRows.length}</span> sectors of{" "}
              <span className="num">{totals.sectors}</span>.
              <ProvenanceBadge provenance="modeled" compact />
            </p>
            <p className={styles.headlineNote}>
              That is the short list. It is computed by walking the board
              largest-first and stopping at half, so it is not a judgement and
              it does not move when the weighting below does. Everything under
              it is the argument for the order to work them in.
            </p>
          </div>
        </section>

        {/* =========================================================
            TWO AND THREE. THE RANKING AND ITS THUMB ON THE SCALE.

            The control is above the list rather than beside it,
            because a preset that re-orders sixteen rows is a re-reading
            of the whole section and not a filter on part of it.
            ========================================================= */}
        <section className={styles.ranking} aria-labelledby="ranking-h">
          <div className={styles.sectionHead}>
            <p className={styles.sectionEyebrow}>The main event</p>
            <h2 className={styles.h2} id="ranking-h">
              The ranking, and the weighting that produced it
            </h2>
            <p className={styles.sectionLede}>
              Each sector scores out of one hundred on three measured
              components. Press a weighting and the board re-ranks; rows that
              change place say how far they moved and in which direction. The
              components do not move, because they are counts.
            </p>
          </div>

          <div className={styles.weightsBar}>
            <div
              className={styles.presetButtons}
              role="group"
              aria-label="How to weight the ranking"
            >
              {PRESET_ORDER.map((key) => {
                const p = PRESETS[key];
                const on = key === activeKey;
                return (
                  <button
                    key={key}
                    type="button"
                    className={styles.presetBtn}
                    data-on={on}
                    aria-pressed={on}
                    title={p.note}
                    onClick={() => setReading(WEIGHTS_PARAM, key, "balanced")}
                  >
                    <span aria-hidden="true" className={styles.presetGlyph}>
                      {p.glyph}
                    </span>
                    <span className={styles.presetLabel}>{p.label}</span>
                    <span className={`${styles.presetNums} num`}>
                      {pct(p.volume)}/{pct(p.certainty)}/{pct(p.reach)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* The active weights printed as numbers, next to the ranking
                they produced, because a screen that ranks without saying
                what it ranked on is asking to be believed. */}
            <dl className={styles.activeWeights}>
              {COMPONENTS.map((c) => (
                <div
                  className={styles.activeWeight}
                  key={c.key}
                  style={{ ["--tone" as string]: c.cssVar }}
                >
                  <dt className={styles.activeWeightLabel}>
                    <span aria-hidden="true" className={styles.activeGlyph}>
                      {c.glyph}
                    </span>
                    {c.label}
                  </dt>
                  <dd className={`${styles.activeWeightValue} num`}>
                    {pct(preset[c.key])}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <p className={styles.presetNote}>{preset.note}</p>

          {/* The polite region. It is what makes the control honest on a
              list taller than the viewport: pressing "Reach" can move twelve
              sectors below the fold and a reader watching the top three
              would otherwise see a page that did nothing. */}
          <p className={styles.rerankState} role="status" aria-live="polite">
            <span className={styles.rerankLabel}>
              {preset.label} weighting
            </span>
            <span>
              <span className="num">{pct(preset.volume)}</span> volume /{" "}
              <span className="num">{pct(preset.certainty)}</span> certainty /{" "}
              <span className="num">{pct(preset.reach)}</span> reach.{" "}
              {movedCount === 0 ? (
                <>
                  No sector changes place against the default weighting. This is
                  the order the board publishes.
                </>
              ) : (
                <>
                  <span className="num">{movedCount}</span> of{" "}
                  <span className="num">{ranked.length}</span> sectors change
                  place against the default weighting
                  {biggestMover && biggestMover.moved !== 0 ? (
                    <>
                      , furthest{" "}
                      <strong>{biggestMover.row.label}</strong>,{" "}
                      {biggestMover.moved > 0 ? "up" : "down"}{" "}
                      <span className="num">{Math.abs(biggestMover.moved)}</span>{" "}
                      to <span className="num">{biggestMover.rank}</span>
                    </>
                  ) : null}
                  .
                </>
              )}
            </span>
          </p>

          {/* The legend for the three tracks. It is above the list rather
              than inside every row, because sixteen copies of the same
              three sentences is the fastest way to make a reader stop
              reading any of them. */}
          <ul className={styles.legend}>
            {COMPONENTS.map((c) => (
              <li
                className={styles.legendRow}
                key={c.key}
                style={{ ["--tone" as string]: c.cssVar }}
              >
                <span className={styles.legendGlyph} aria-hidden="true">
                  {c.glyph}
                </span>
                <span className={styles.legendLabel}>{c.label}</span>
                <span className={styles.legendNote}>{c.basis}</span>
              </li>
            ))}
          </ul>

          <ol
            className={styles.rankList}
            data-active-weights={activeKey}
            data-segment-count={ranked.length}
          >
            {ranked.map((entry) => {
              const row = entry.row;
              const open = openRow === row.id;
              const panelId = `segment-panel-${row.id}`;
              const buttonId = `segment-button-${row.id}`;
              return (
                <li
                  className={styles.rankRow}
                  key={row.id}
                  data-segment-rank={entry.rank}
                  data-segment-id={row.id}
                  data-moved={entry.moved}
                >
                  <h3 className={styles.rankHeading}>
                    <button
                      type="button"
                      id={buttonId}
                      className={styles.rankHead}
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() =>
                        setReading(OPEN_PARAM, open ? "" : row.id, "")
                      }
                    >
                      <span className={`${styles.rankNum} num`}>
                        {entry.rank}
                      </span>
                      <span className={`${styles.rankCode} num`}>
                        {SEGMENT_CODE_DISPLAY[row.id]}
                      </span>
                      <span className={styles.rankLabel}>{row.label}</span>

                      {/* Glyph, word and number. Any two of the three can
                          fail, whether that is greyscale, a screen reader or
                          a glyph the font does not carry, and the row still
                          says what happened to it. */}
                      <span
                        className={styles.move}
                        data-direction={
                          entry.moved > 0 ? "up" : entry.moved < 0 ? "down" : "held"
                        }
                      >
                        <span aria-hidden="true" className={styles.moveArrow}>
                          {entry.moved > 0 ? "▲" : entry.moved < 0 ? "▼" : "="}
                        </span>
                        {entry.moved === 0 ? (
                          <span className={styles.moveWord}>held</span>
                        ) : (
                          <span className={styles.moveWord}>
                            {entry.moved > 0 ? "up" : "down"}{" "}
                            <span className="num">{Math.abs(entry.moved)}</span>
                          </span>
                        )}
                      </span>

                      <span className={styles.rankStat}>
                        <span className={`${styles.rankStatValue} num`}>
                          {count(row.count)}
                        </span>
                        <span className={styles.rankStatWord}>orgs</span>
                      </span>
                      <span className={styles.rankStat}>
                        <span className={`${styles.rankStatValue} num`}>
                          {count(row.seatsInPlay)}
                        </span>
                        <span className={styles.rankStatWord}>seats</span>
                      </span>
                      <span className={styles.rankScore}>
                        <span className={`${styles.rankScoreValue} num`}>
                          {entry.score}
                        </span>
                        <ProvenanceBadge provenance="modeled" compact />
                      </span>
                      <span className={styles.rankToggle} aria-hidden="true">
                        {open ? "▾" : "▸"}
                      </span>
                    </button>
                  </h3>

                  {/* THE THREE-PART BAR, OUTSIDE THE BUTTON AND ALWAYS
                      OPEN. It is the argument for the row's position, so
                      hiding it behind the same press that hides the prose
                      would leave the list asserting an order with the
                      evidence one click away. */}
                  <ul className={styles.parts}>
                    {COMPONENTS.map((c) => {
                      const index = c.read(row);
                      return (
                        <li
                          className={styles.part}
                          key={c.key}
                          style={{ ["--tone" as string]: c.cssVar }}
                        >
                          <span className={styles.partGlyph} aria-hidden="true">
                            {c.glyph}
                          </span>
                          <span className={styles.partLabel}>{c.label}</span>
                          <span className={styles.partTrack} aria-hidden="true">
                            <span
                              className={styles.partFill}
                              style={{ width: `${pct(index)}%` }}
                            />
                          </span>
                          <span className={`${styles.partValue} num`}>
                            {pct(index)}
                          </span>
                          <span className={styles.partWeight}>
                            <span className="num">
                              ×{preset[c.key].toFixed(2)}
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {open ? (
                    <div
                      className={styles.panel}
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                    >
                      <div className={styles.panelProse}>
                        <div className={styles.prose}>
                          <p className={styles.proseLabel}>
                            Why they buy a group night
                          </p>
                          <p className={styles.proseBody}>{row.occasion}</p>
                        </div>
                        <div className={styles.prose}>
                          <p className={styles.proseLabel}>
                            What outbound into this sector looks like
                          </p>
                          <p className={styles.proseBody}>{row.motion}</p>
                        </div>
                        <div className={styles.prose} data-friction="true">
                          <p className={styles.proseLabel}>
                            <span aria-hidden="true" className={styles.frictionGlyph}>
                              ▲
                            </span>
                            The hardest thing about it
                          </p>
                          <p className={styles.proseBody}>{row.friction}</p>
                        </div>
                      </div>

                      <div className={styles.panelFacts}>
                        <div className={styles.factBlock}>
                          <p className={styles.factLabel}>
                            Lanes this sector occupies on this board
                          </p>
                          <p className={styles.laneRow}>
                            {row.lanes.map((lane) => (
                              <LaneChip key={lane} lane={lane} size="sm" />
                            ))}
                          </p>
                          <p className={styles.factNote}>
                            {row.lanes.length === 1
                              ? `Every organisation here is worked through the ${LANE_META[row.lanes[0]].doorNoun}.`
                              : `${row.lanes.length} lanes, most common first. The way in changes inside the sector, which is why an industry is not a lane.`}
                          </p>
                        </div>

                        <div className={styles.factBlock}>
                          <p className={styles.factLabel}>The reach split</p>
                          <ul className={styles.reachList}>
                            {REACH_SPLIT.map((split) => (
                              <li className={styles.reachRow} key={split.key}>
                                <span
                                  className={styles.reachGlyph}
                                  aria-hidden="true"
                                >
                                  {split.glyph}
                                </span>
                                <span className={`${styles.reachValue} num`}>
                                  {row[split.key]}
                                </span>
                                <span className={styles.reachLabel}>
                                  {split.label}
                                </span>
                                <span className={styles.reachNote}>
                                  {split.note}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className={styles.factBlock}>
                          <p className={styles.factLabel}>Distance and work left</p>
                          <p className={styles.factPair}>
                            <span className={`${styles.factValue} num`}>
                              {row.medianMiles.toFixed(1)}
                            </span>
                            <span className={styles.factWord}>
                              median miles from the venue, straight line
                              <ProvenanceBadge provenance="modeled" compact />
                            </span>
                          </p>
                          <p className={styles.factPair}>
                            <span className={`${styles.factValue} num`}>
                              {count(row.untouched)}
                            </span>
                            <span className={styles.factWord}>
                              of <span className="num">{count(row.count)}</span>{" "}
                              untouched. Nothing sent, nothing heard.
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className={styles.entries}>
                        <p className={styles.factLabel}>
                          The three largest rooms in the sector
                        </p>
                        <ul className={styles.entryList}>
                          {row.entryPoints.map((entryPoint) => (
                            <li className={styles.entry} key={entryPoint.id}>
                              <Link
                                className={`tap ${styles.entryLink}`}
                                to={`/quote/${entryPoint.id}`}
                              >
                                {entryPoint.name}
                              </Link>
                              <span className={styles.entryMeta}>
                                <LaneChip lane={entryPoint.lane} size="sm" />
                                <span className={`${styles.entryNum} num`}>
                                  {count(entryPoint.guests)}
                                </span>
                                <span className={styles.entryWord}>
                                  guests at the midpoint
                                  <ProvenanceBadge provenance="modeled" compact />
                                </span>
                                <span className={`${styles.entryNum} num`}>
                                  {entryPoint.miles.toFixed(1)}
                                </span>
                                <span className={styles.entryWord}>miles</span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </section>

        {/* =========================================================
            FOUR. THE GAP.

            A finding, not an error. The visual language is the one this
            build already uses for a fact somebody withheld, which is the
            same withheld glyph, a dashed edge, no rank and no score, so a
            reader who has seen a withheld price on /packages recognises
            what this is before reading a word of it.
            ========================================================= */}
        <section className={styles.gapSection} aria-labelledby="gap-h">
          <div className={styles.sectionHead}>
            <p className={styles.sectionEyebrow}>Named rather than dropped</p>
            <h2 className={styles.h2} id="gap-h">
              The sector with nothing in it
            </h2>
            <p className={styles.sectionLede}>
              <span className="num">{board.length}</span> sectors are carried on
              this board and{" "}
              <span className="num">{totals.sectors}</span> of them have an
              organisation in them. The remaining one is rendered here rather
              than deleted, because a segmentation that only lists what was
              found cannot tell you where to look next.
            </p>
          </div>

          {gaps.map((row) => (
            <div className={styles.gap} key={row.id}>
              <p className={styles.gapHead}>
                <span aria-hidden="true" className={styles.gapGlyph}>
                  ▩
                </span>
                <span className={`${styles.gapCode} num`}>
                  NAICS {SEGMENT_CODE_DISPLAY[row.id]}
                </span>
                <span className={styles.gapName}>{row.label}</span>
                <span className={styles.gapStanding}>
                  Unranked, nothing to rank
                </span>
              </p>
              <p className={styles.gapBody}>{row.friction}</p>
              <p className={styles.gapOccasion}>
                <span className={styles.gapOccasionLabel}>
                  What would make one buy, when one is found
                </span>
                {row.occasion}
              </p>
              <p className={styles.gapNote}>
                This is a research instruction and not a hole in the data. Every
                other row on this screen was verified against a page somebody
                can open; three candidates in this sector rested on a single
                directory line with a generic switchboard number, and a row that
                cannot be checked is worth less than an empty sector that says
                so.{" "}
                <Link className="tap" to="/method">
                  Every formula, every source, and every row that was thrown away
                </Link>
              </p>
            </div>
          ))}
        </section>

        {/* =========================================================
            FIVE. AND EXECUTE.

            Everything above this is the "identify" half of the posting
            line. This is the other half, and it moves when the
            weighting moves, because a first move that ignored the
            reader's own judgement would be a plan for somebody else.
            ========================================================= */}
        <section className={styles.execute} aria-labelledby="execute-h">
          <div className={styles.sectionHead}>
            <p className={styles.sectionEyebrow}>And execute</p>
            <h2 className={styles.h2} id="execute-h">
              The first move in the top three, under the{" "}
              {preset.label.toLowerCase()} weighting
            </h2>
            <p className={styles.sectionLede}>
              What a rep does on Monday morning in each of them. Change the
              weighting above and these three change with it, which is the
              point: identifying a segment is worth nothing until somebody can
              say what the first hour in it looks like.
            </p>
          </div>

          <ol className={styles.moves}>
            {firstMoves.map((entry) => {
              const row = entry.row;
              return (
                <li className={styles.moveCard} key={row.id}>
                  <p className={styles.moveHead}>
                    <span className={`${styles.moveRank} num`}>
                      {entry.rank}
                    </span>
                    <span className={styles.moveName}>{row.label}</span>
                    <span className={`${styles.moveCode} num`}>
                      {SEGMENT_CODE_DISPLAY[row.id]}
                    </span>
                  </p>
                  <p className={styles.moveBody}>{row.motion}</p>

                  <p className={styles.moveReach}>
                    {REACH_SPLIT.map((split) => (
                      <span className={styles.moveReachItem} key={split.key}>
                        <span aria-hidden="true">{split.glyph}</span>
                        <span className="num">{row[split.key]}</span>
                        <span>{split.label.toLowerCase()}</span>
                      </span>
                    ))}
                  </p>
                  <p className={styles.moveReachNote}>
                    {row.doorOnly > row.emailable
                      ? `More of this sector has to be walked than written to, so Monday is a route sheet and not an inbox. Median ${row.medianMiles.toFixed(1)} miles out.`
                      : `Most of this sector has a written door, so Monday starts at a desk. Median ${row.medianMiles.toFixed(1)} miles out when it does not.`}{" "}
                    <ProvenanceBadge provenance="modeled" compact />
                  </p>

                  <p className={styles.moveEntryLabel}>Start with the largest rooms</p>
                  <ul className={styles.moveEntries}>
                    {row.entryPoints.map((entryPoint) => (
                      <li key={entryPoint.id}>
                        <Link
                          className={`tap ${styles.entryLink}`}
                          to={`/quote/${entryPoint.id}`}
                        >
                          {entryPoint.name}
                        </Link>{" "}
                        <span className={`${styles.entryNum} num`}>
                          {count(entryPoint.guests)}
                        </span>{" "}
                        <span className={styles.entryWord}>guests</span>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>

          <p className={styles.executeFoot}>
            The sector says which industries and why. The lane says how you
            reach the people in one.{" "}
            <Link className="tap" to="/lanes">
              The nine lanes and what sells into each
            </Link>
          </p>
        </section>

        <p className={styles.pageFoot}>
          Every count on this screen is counted off the prospect rows. Every
          score and every seat figure is computed from those counts by the
          formula printed above the ranking, with the weights printed beside
          the answer they produced. Nothing here is projected revenue and
          nothing here is a price.{" "}
          <Link className="tap" to="/method">
            Every formula and source
          </Link>
        </p>
      </div>
    </div>
  );
}
