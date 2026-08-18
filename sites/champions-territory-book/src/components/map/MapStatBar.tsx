import { useId, useState } from "react";

import {
  PROVENANCE_ORDER,
  ProvenanceBadge,
} from "@/components/primitives/ProvenanceBadge";
import {
  BOARD_SEGMENTS,
  type BoardSegment,
  type MapBoardStat,
} from "@/domain/selectors/mapBoard";
import type { Provenance } from "@/domain/types";

import styles from "./MapStatBar.module.css";

/**
 * THE STRIP ACROSS THE TOP OF THE BOARD. What the board currently holds,
 * in five figures a person can act on, each one saying where it came from.
 *
 * WHY IT EXISTS AT ALL. The three panes underneath it each show a slice of
 * the trade area: the list shows the rows it can fit, the map shows the
 * pins that survived the filter, and the panel shows one organisation.
 * None of the three can answer "how much am I looking at, and how much did
 * I just filter away", and a reader who cannot answer that has no way to
 * tell whether the board is thin because the territory is thin or because
 * they ticked something four clicks ago. So the bar carries the totals,
 * permanently, above everything.
 *
 * ── WHAT WAS CUT, AND WHY THAT WAS THE ACTUAL WORK ────────────────
 * This bar used to carry eight figures and needed two paging buttons to
 * reach the end of itself. A strip you have to scroll is a strip nobody
 * reads, and the fix was not a narrower cell. It was deciding which of the
 * eight change what a rep does next while they are working a map.
 *
 * KEPT, because each one moves a hand:
 *   Organisations, against the whole trade area. The only figure that says
 *     how much the current filters threw away.
 *   Published email. Who can be written to this afternoon, which is the
 *     difference between a two minute touch and a drive.
 *   No written door. Who cannot be written to at all, which is the same
 *     finding read the other way and is the book the runs are built from.
 *   Inside three miles. Who can be seen in one loop out of the Brea branch.
 *   In a go-see run. How many of those doors have already been grouped
 *     into trips somebody can finish. The lead figure, and the only one
 *     here a list could not have produced.
 *
 * CUT from the strip, and the reasoning matters more than the pixels:
 *   Never touched and Live conversations. Both were on the strip while the
 *     segment control two inches to their left carried the same two
 *     figures, live, as the counts on its own positions: "Untouched 42",
 *     "Live 33". A strip that prints the same number twice in one row is
 *     spending a column on nothing, and the column was wanted for a figure
 *     that is genuinely about this screen rather than about the desk.
 *   Form only. It, Published email and No written door are a three way
 *     split of one research finding, and the finding is told properly once
 *     on `/method`. The per organisation answer is already on every list
 *     card as an email confidence chip, which is where a rep needs it.
 *   Doors in play. A modeled sum of the midpoints of a hundred door count
 *     ranges. It is an order of magnitude for a deck, not a number anybody
 *     acts on while choosing who to go and see, and its size makes it the
 *     loudest thing on a strip that should be led by the smallest figure.
 *
 * None of the three were deleted from `mapBoardStats`. They are still
 * computed, still badged, and they sit one press away under the disclosure
 * at the end of the strip, along with any figure a later selector adds:
 * anything not named in ON_THE_STRIP falls into the disclosure rather than
 * disappearing, so a ninth figure is quietly kept rather than quietly
 * lost.
 *
 * ── IT COMPUTES NOTHING, INCLUDING THE ARITHMETIC IT IS TEMPTED BY ─
 * The figures arrive as `MapBoardStat[]` from `mapBoardStats`, already
 * counted once by the board. In the build this screen was forked from the
 * bar counted its own rows, the list counted its own, and the two
 * disagreed by seven for a month. So this file selects and orders figures
 * and it never makes one.
 *
 * That rule cost something real here. "Reachable in writing" would be a
 * better single figure than "Published email", and it is one addition
 * away: published email plus form only. It is not added, because a total
 * added up inside a view component is exactly the second source of truth
 * that `selectors/mapBoard.ts` exists to prevent, and the next screen that
 * wants the same figure would add it again, differently. If that figure is
 * wanted it belongs in the selector, and the selector is another agent's
 * file today.
 *
 * ── PROVENANCE, MADE LIGHT WITHOUT BEING MADE OPTIONAL ────────────
 * Every figure is a `MapBoardStat` and the provenance is a field on the
 * figure rather than a prop this component picks, so there is no code path
 * that renders a value without its origin.
 *
 * What changed is the weight. A pill reading "PUBLIC" beside every number
 * was costing more width than the number and repeating a word that is true
 * of most of the strip. Each figure now carries the mark alone, sitting
 * with its label rather than under its number, and the word itself is
 * carried three ways: in the badge's own visually hidden span, so a screen
 * reader says "Published email, public"; in the badge's title, for a
 * pointer; and spelled out in full, glyph beside word, in the key inside
 * the disclosure, which is the route for somebody who is sighted, on a
 * keyboard, and cannot hover a tooltip. The marks differ in shape as well
 * as hue, so the strip survives being read in greyscale.
 *
 * ── IT FITS, AT EVERY WIDTH, AND IT DOES NOT MOVE ─────────────────
 * No scroller, no pagers, nothing off the right hand edge. The figures are
 * a grid of equal columns: five across a desk, three on a tablet, two on a
 * phone, where the strip stops being a row and becomes a block of tiles.
 * Equal columns are also what makes the geometry still: a count going from
 * three hundred and twenty nine to two changes no track width, so nothing beside
 * it shifts. Labels reserve two lines whether they need them or not, for
 * the same reason and for the reader who runs their browser at a larger
 * type size.
 */

export interface MapStatBarProps {
  /** The page local board segment. */
  segment: BoardSegment;
  onSegmentChange: (segment: BoardSegment) => void;
  /** How many rows each segment would leave, for the counts on the control. */
  counts: Record<BoardSegment, number>;
  /** Every figure from `mapBoardStats`. This component chooses which of
   *  them lead and which sit under the disclosure. */
  stats: MapBoardStat[];
}

/**
 * The figures that lead, in the order they read left to right.
 *
 * Ordered as a sentence about the board: how much is here, who can be
 * written to, who is close, who is untouched, who is live. Keys rather
 * than labels, because the labels belong to the selector and are allowed
 * to be reworded there without silently emptying this strip.
 */
const ON_THE_STRIP = [
  "organisations",
  "written-door",
  "no-written-door",
  "inside-three-miles",
  "in-a-run",
];

/**
 * The figure the strip is led by, and the only one set larger than its
 * neighbours.
 *
 * A row of five figures at one size has no entry point, so a reader cold
 * on this screen parses five things and takes an answer from none of
 * them. The question this screen exists to answer is where the week goes,
 * and the run count is the only figure on the strip that a list could not
 * have produced. It is the last cell rather than the first because the
 * four before it are what it is made of, so the row reads as a sentence
 * that arrives somewhere: this many organisations, this many writable,
 * this many that have to be visited, this many close in, and this many of
 * those already grouped into trips.
 *
 * The emphasis is size and weight rather than hue, so it survives
 * greyscale and it survives the owner's eyes.
 */
const LEAD_FIGURE = "in-a-run";

export function MapStatBar({
  segment,
  onSegmentChange,
  counts,
  stats,
}: MapStatBarProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const panelId = useId();

  const byKey = new Map(stats.map((s) => [s.key, s]));
  const lead = ON_THE_STRIP.map((key) => byKey.get(key)).filter(
    (s): s is MapBoardStat => s !== undefined,
  );
  const rest = stats.filter((s) => !ON_THE_STRIP.includes(s.key));

  /* The key names only the marks actually on screen, and it names them in
     the shared reading order rather than in the order the strip happens to
     use, so it reads the same here as it does in every other legend in the
     application. */
  const marksInUse: Provenance[] = PROVENANCE_ORDER.filter((p) =>
    stats.some((s) => s.provenance === p),
  );

  return (
    <div className={styles.bar}>
      <div className={styles.top}>
        {/*
          The board segment. Real radio semantics, because this is three
          positions with one of them true, and three buttons with an
          onClick would be unreachable by keyboard and unannounced.
        */}
        <div
          className={styles.segment}
          role="radiogroup"
          aria-label="Which organisations the board shows"
        >
          {BOARD_SEGMENTS.map((position) => {
            const on = position.value === segment;
            return (
              <button
                key={position.value}
                type="button"
                role="radio"
                aria-checked={on}
                className={styles.segmentButton}
                data-on={on ? "yes" : "no"}
                title={`${position.label}. ${position.what}`}
                aria-label={`${position.label}, ${counts[position.value]} on the board`}
                onClick={() => onSegmentChange(position.value)}
              >
                {/* Shape first, word second, colour third. The control is
                    readable with every hue stripped out of it. */}
                <span className={styles.segmentGlyph} aria-hidden="true">
                  {position.glyph}
                </span>
                <span className={styles.segmentLabel}>{position.label}</span>
                <span className={styles.segmentShort}>{position.short}</span>
                <span className={`${styles.segmentCount} num`}>
                  {counts[position.value]}
                </span>
              </button>
            );
          })}
        </div>

        {/*
          A description list, because that is what a strip of KPIs is: a
          term and the value of that term, five times. The live region is
          on the list rather than on each figure so a filter that moves
          four counts is announced once as a group, and `aria-atomic` is
          off so the figures that did not move are not read out again.
        */}
        <dl className={styles.figures} aria-live="polite" aria-atomic="false">
          {lead.map((stat) => (
            <div
              className={styles.kpi}
              key={stat.key}
              data-lead={stat.key === LEAD_FIGURE ? "yes" : undefined}
              title={stat.note}
            >
              <dt className={styles.kpiLabel}>
                <span className={styles.kpiLabelText}>{stat.label}</span>
                <ProvenanceBadge provenance={stat.provenance} compact />
              </dt>
              <dd className={`${styles.kpiValue} num`}>
                {stat.value.toLocaleString("en-GB")}
                {stat.outOf !== undefined ? (
                  <span className={styles.kpiOutOf}>
                    {" of "}
                    {stat.outOf.toLocaleString("en-GB")}
                  </span>
                ) : null}
              </dd>
            </div>
          ))}
        </dl>

        {/*
          A button and a panel rather than a `details` element, and the
          reason is the layout rather than taste. A `details` keeps its
          panel inside itself, which here would open a block of figures
          inside the narrow third column of a flex row; a button lets the
          panel be a full width sibling underneath, where there is room to
          read it. The semantics a `details` would have given for free are
          stated instead.
        */}
        {rest.length > 0 ? (
          <button
            type="button"
            className={styles.more}
            aria-expanded={moreOpen}
            aria-controls={panelId}
            /* The visible word shortens on a narrow bar and the spoken
               name does not, so voice control and a screen reader both
               get the whole thing at every width. */
            aria-label={
              moreOpen
                ? "Hide the other figures"
                : `Show ${rest.length} more figures`
            }
            onClick={() => setMoreOpen((v) => !v)}
          >
            <span className={styles.moreLabel}>
              {moreOpen ? "Fewer figures" : "More figures"}
            </span>
            <span className={styles.moreShort}>
              {moreOpen ? "Fewer" : "More"}
            </span>
            <span className={`${styles.moreCount} num`}>{rest.length}</span>
            <span className={styles.moreGlyph} aria-hidden="true">
              {moreOpen ? "▴" : "▾"}
            </span>
          </button>
        ) : null}
      </div>

      {/*
        THE DISCLOSURE. Two jobs, and both of them are about not losing
        anything: the figures this strip decided not to lead with, and the
        marks spelled out as words for a reader who cannot hover a title.
      */}
      <div id={panelId} className={styles.panel} hidden={!moreOpen}>
        <dl className={styles.panelFigures}>
          {rest.map((stat) => (
            <div className={styles.panelRow} key={stat.key}>
              <dt className={styles.panelTerm}>
                <span>{stat.label}</span>
                <ProvenanceBadge provenance={stat.provenance} />
              </dt>
              <dd className={`${styles.panelValue} num`}>
                {stat.value.toLocaleString("en-GB")}
                {stat.outOf !== undefined ? (
                  <span className={styles.kpiOutOf}>
                    {" of "}
                    {stat.outOf.toLocaleString("en-GB")}
                  </span>
                ) : null}
              </dd>
              <p className={styles.panelNote}>{stat.note}</p>
            </div>
          ))}
        </dl>

        <p className={styles.key}>
          <span className={styles.keyLabel}>Marks</span>
          {marksInUse.map((p) => (
            <ProvenanceBadge key={p} provenance={p} />
          ))}
        </p>
      </div>
    </div>
  );
}
