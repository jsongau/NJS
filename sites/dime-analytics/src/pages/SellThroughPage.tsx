import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Licence, PromoLine } from "@/domain/licensing";
import { formatDate, formatMoney } from "@/domain/licensing";
import { LICENCE_BY_ID } from "@/data/partners";
import { PROMO_LINES } from "@/data/promo";
import type {
  MovementChannel,
  ReorderBand,
  ReportingWindow,
} from "@/data/sellthrough";
import {
  CHANNEL_MOVEMENTS,
  DEFAULT_WINDOW_ID,
  MOVEMENT_CHANNEL,
  MOVEMENT_CHANNEL_ORDER,
  OVERSTOCK_WEEKS,
  REORDER_BANDS,
  REORDER_BAND_BY_ID,
  REORDER_HORIZON_WEEKS,
  REPORTED_LICENCE_IDS,
  REPORTING_WINDOWS,
  REPORTING_WINDOW_BY_ID,
  RETAIL_PARTNERS_CITED,
  SELLTHROUGH_AS_OF,
  SELLTHROUGH_SOURCE,
  SELLTHROUGH_SOURCE_READ_ON,
} from "@/data/sellthrough";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { Button } from "@/components/primitives/Button";
import {
  Bar,
  SectionHead,
  Stat,
  StatStrip,
  TokenMark,
} from "@/components/licensing/Panels";
import styles from "./SellThroughPage.module.css";

/**
 * THE DOCUMENT THAT GOES OUT.
 *
 * Three surfaces already answer the DIME posting from the inside.
 * `/partners` is the register of who can make what. `/promo` is the
 * internal stock table and the royalty position. `/spend` is the money
 * that bought it. All three are read by somebody who works here.
 *
 * This one is read by somebody who does not. It is a sell-through
 * statement addressed to the party who owns the property, and the two
 * bullets it answers are the two that say "external" out loud:
 *
 *   "Provide accurate and timely reports to both internal stakeholders
 *    and external licensors."
 *   "Use sales data to guide purchasing strategies and negotiate future
 *    promotional agreements."
 *
 * ── WHY IT IS A SEPARATE SCREEN AND NOT A SECTION OF /promo ───────
 * /promo already generates a per property report, and this screen is not
 * a second copy of it. Three things are different, and each of them is a
 * different job:
 *
 *   IT IS A DOCUMENT FIRST. Everything below the control strip is set to
 *   print black on white on letter paper, because the artefact is a thing
 *   a licensor receives rather than a thing a manager scrolls. The
 *   ranking above it is internal and is marked to stay off the paper.
 *
 *   IT REPORTS WHERE THE UNITS WENT. A thousand units off the prize wall
 *   and a thousand units over the counter are the same number and a
 *   different read on the property. /promo counts units out. This states
 *   the channel split, because that is the half a licensor asks for and
 *   the half that decides the next order.
 *
 *   IT ENDS ON A DECISION. The last block on the statement is what the
 *   window implies for the next order, produced by a stated rule against
 *   a stated horizon, with the rule printed underneath it.
 *
 * ── THE ONE FIGURE THAT DIFFERS FROM /promo, SAID OUT LOUD ────────
 * Sell-through here divides units moved by units AVAILABLE, meaning
 * opening stock plus units received, which is the same figure as units
 * moved plus closing stock. The line table on /promo divides by units
 * received plus units on hand, which is the reconstruction that table
 * can support from what it stores.
 *
 * The two agree wherever a window opened and closed on the same stock
 * level and differ everywhere else. Neither is hidden: both surfaces
 * print the divisor next to the percentage, which is the standing rule
 * here and the only reason two honest figures can sit in one application
 * without one of them being a bug.
 *
 * ── WHAT IS PUBLIC ON THIS SCREEN ─────────────────────────────────
 * The nine property names and the five retailer names. Nothing else.
 * Every unit, cent, week, rate and recommendation is modelled or
 * illustrative and carries the badge that says so. A screen arguing for
 * sell-through honesty that printed one unbadged invented figure would
 * have argued against itself.
 *
 * ── AND WHAT IS DELIBERATELY ABSENT ───────────────────────────────
 * No factory, no country of manufacture, no minimum order quantity, no
 * lead time, no unit cost attributed to any real company, and no anime
 * or game property. Nature's Mark publishes none of the six. The reorder
 * band is therefore judged against this venue's own declared eight week
 * replanning horizon, which is a fact about the venue, and the horizon is
 * printed everywhere the band is.
 */

const NOW = SELLTHROUGH_AS_OF;

/**
 * A class on the body for the life of this component, the same mechanism
 * the district report uses. The shell's chrome is not this page's to
 * edit, and a print rule that hid every application header would sit in
 * the shared stylesheet and fire on screens that want theirs printed.
 */
const PRINT_BODY_CLASS = "sellthrough-report-print";

// ---------------------------------------------------------------
// The arithmetic
// ---------------------------------------------------------------

/**
 * These functions live in the page rather than in `domain/selectors/`
 * for one reason: nothing else reads them. Every figure below is this
 * document's own arithmetic over counts that already have a selector of
 * their own in `selectors/promo.ts`. The moment a second surface needs
 * one of them they move, and until then a selector file with one caller
 * is a file somebody has to go and read to find out it does nothing
 * surprising.
 *
 * Nothing here is stored anywhere. Every rate is computed at render and
 * printed beside the number it was divided by.
 */

interface ChannelRow {
  channel: MovementChannel;
  units: number;
  /** Units in this channel over units moved in the window. */
  sharePct: number;
}

interface Position {
  licence: Licence;
  window: ReportingWindow;
  lines: PromoLine[];
  /**
   * Stock at the start, RECONSTRUCTED rather than counted: closing plus
   * moved less received. The seed is internally consistent enough that
   * this lands exactly on the prior window's closing figure for all nine
   * properties, and the statement prints that check rather than asserting
   * it.
   */
  openingUnits: number;
  receivedUnits: number;
  movedUnits: number;
  closingUnits: number;
  /** Opening plus received. Identical to moved plus closing. */
  availableUnits: number;
  /** null where nothing was available, which is a real state. */
  sellThroughPct: number | null;
  /** Landed cost of what was received in the window. What was bought. */
  boughtCostCents: number;
  /** Retail value of what moved. */
  grossSalesCents: number;
  /** Landed cost of what moved. */
  costOfMovedCents: number;
  marginCents: number | null;
  marginPct: number | null;
  /** Units moved over the weeks in the window. */
  unitsPerWeek: number;
  /** Closing units over the weekly rate. null where nothing moved. */
  weeksOfCover: number | null;
  band: ReorderBand;
  channels: ChannelRow[];
}

function linesFor(
  licenceId: string,
  reportWindow: ReportingWindow,
): PromoLine[] {
  return PROMO_LINES.filter(
    (l) =>
      l.periodId === reportWindow.promoPeriodId && l.licenceId === licenceId,
  );
}

function bandFor(weeksOfCover: number | null): ReorderBand {
  if (weeksOfCover === null) return REORDER_BAND_BY_ID["nothing-moved"];
  if (weeksOfCover < REORDER_HORIZON_WEEKS) return REORDER_BAND_BY_ID.short;
  if (weeksOfCover > OVERSTOCK_WEEKS) return REORDER_BAND_BY_ID.long;
  return REORDER_BAND_BY_ID.steady;
}

function positionFor(
  licenceId: string,
  windowId: string,
): Position | null {
  const licence = LICENCE_BY_ID[licenceId];
  /* Named rather than called `window`, because a local called `window`
     in a file that also calls window.print() is a trap set for whoever
     edits this next. */
  const reportWindow = REPORTING_WINDOW_BY_ID[windowId];
  if (!licence || !reportWindow) return null;

  const lines = linesFor(licenceId, reportWindow);

  let receivedUnits = 0;
  let movedUnits = 0;
  let closingUnits = 0;
  let boughtCostCents = 0;
  let grossSalesCents = 0;
  let costOfMovedCents = 0;

  for (const l of lines) {
    receivedUnits += l.unitsIn;
    movedUnits += l.unitsOut;
    closingUnits += l.unitsOnHand;
    boughtCostCents += l.unitsIn * l.unitCostCents;
    grossSalesCents += l.unitsOut * l.unitRetailCents;
    costOfMovedCents += l.unitsOut * l.unitCostCents;
  }

  const openingUnits = closingUnits + movedUnits - receivedUnits;
  const availableUnits = openingUnits + receivedUnits;

  const unitsPerWeek = movedUnits / reportWindow.weeks;
  const weeksOfCover =
    unitsPerWeek > 0 ? Math.round((closingUnits / unitsPerWeek) * 10) / 10 : null;

  const channels: ChannelRow[] = MOVEMENT_CHANNEL_ORDER.map((channel) => {
    const units = CHANNEL_MOVEMENTS.filter(
      (m) =>
        m.licenceId === licenceId &&
        m.windowId === windowId &&
        m.channel === channel,
    ).reduce((sum, m) => sum + m.units, 0);
    return {
      channel,
      units,
      sharePct: movedUnits > 0 ? (units / movedUnits) * 100 : 0,
    };
  }).filter((c) => c.units > 0);

  return {
    licence,
    window: reportWindow,
    lines,
    openingUnits,
    receivedUnits,
    movedUnits,
    closingUnits,
    availableUnits,
    sellThroughPct:
      availableUnits > 0 ? (movedUnits / availableUnits) * 100 : null,
    boughtCostCents,
    grossSalesCents,
    costOfMovedCents,
    marginCents: grossSalesCents > 0 ? grossSalesCents - costOfMovedCents : null,
    marginPct:
      grossSalesCents > 0
        ? ((grossSalesCents - costOfMovedCents) / grossSalesCents) * 100
        : null,
    unitsPerWeek: Math.round(unitsPerWeek * 10) / 10,
    weeksOfCover,
    band: bandFor(weeksOfCover),
    channels,
  };
}

/** Every reportable property in a window, best sell-through first. */
function positionsFor(windowId: string): Position[] {
  return REPORTED_LICENCE_IDS.map((id) => positionFor(id, windowId))
    .filter((p): p is Position => p !== null)
    .sort((a, b) => (b.sellThroughPct ?? -1) - (a.sellThroughPct ?? -1));
}

interface Totals {
  properties: number;
  receivedUnits: number;
  movedUnits: number;
  closingUnits: number;
  availableUnits: number;
  sellThroughPct: number | null;
  boughtCostCents: number;
  grossSalesCents: number;
  costOfMovedCents: number;
  marginCents: number;
  marginPct: number | null;
  orderNow: number;
}

function totalsFor(positions: Position[]): Totals {
  const t: Totals = {
    properties: positions.length,
    receivedUnits: 0,
    movedUnits: 0,
    closingUnits: 0,
    availableUnits: 0,
    sellThroughPct: null,
    boughtCostCents: 0,
    grossSalesCents: 0,
    costOfMovedCents: 0,
    marginCents: 0,
    marginPct: null,
    orderNow: 0,
  };

  for (const p of positions) {
    t.receivedUnits += p.receivedUnits;
    t.movedUnits += p.movedUnits;
    t.closingUnits += p.closingUnits;
    t.availableUnits += p.availableUnits;
    t.boughtCostCents += p.boughtCostCents;
    t.grossSalesCents += p.grossSalesCents;
    t.costOfMovedCents += p.costOfMovedCents;
    if (p.band.id === "short") t.orderNow += 1;
  }

  t.marginCents = t.grossSalesCents - t.costOfMovedCents;
  t.marginPct =
    t.grossSalesCents > 0 ? (t.marginCents / t.grossSalesCents) * 100 : null;
  t.sellThroughPct =
    t.availableUnits > 0 ? (t.movedUnits / t.availableUnits) * 100 : null;
  return t;
}

const units = (n: number) => n.toLocaleString("en-US");
const pct = (n: number) => `${Math.round(n)}%`;

/** A statement reference a person can quote back on the phone. */
function referenceFor(position: Position): string {
  const property = position.licence.id.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const window = position.window.id.replace(/^w-/, "").toUpperCase();
  return `ST-${window}-${property}`;
}

// ---------------------------------------------------------------
// The one drawn figure on the page
// ---------------------------------------------------------------

/**
 * THE WINDOW IN ONE MARK, DRAWN RATHER THAN LIBRARIED.
 *
 * Available stock as a single length, split into what moved and what is
 * still here. It is inline SVG written for this page: no icon set, no
 * chart library, nothing that animates, nothing that pulses.
 *
 * The remainder is HATCHED rather than tinted, which is the whole reason
 * the mark survives its own destination. This figure is designed to come
 * out of a mono laser printer on a licensor's desk, and a pair of solid
 * blocks in two hues is one grey block on that sheet. Shape carries the
 * meaning; the colour is the second signal, exactly as the owner of this
 * codebase being colourblind requires everywhere else.
 *
 * The quarter ticks are drawn so a reader can place the split without
 * measuring, and the numbers are printed beside the mark rather than
 * inside it, because text scaled inside a viewBox is text nobody can set
 * a size for.
 */
function MovementMark({
  moved,
  closing,
  available,
  propertyName,
  idSuffix,
}: {
  moved: number;
  closing: number;
  available: number;
  propertyName: string;
  idSuffix: string;
}) {
  const W = 320;
  const H = 34;
  const movedW = available > 0 ? (moved / available) * W : 0;
  const hatchId = `st-hatch-${idSuffix}`;

  return (
    <svg
      className={styles.mark}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`${propertyName}. ${units(moved)} units moved and ${units(
        closing,
      )} left, of ${units(available)} available in the window.`}
    >
      <defs>
        <pattern
          id={hatchId}
          patternUnits="userSpaceOnUse"
          width="6"
          height="6"
        >
          {/* Three strokes rather than one, so the diagonal runs
              unbroken across the tile seams instead of stopping at every
              six pixels. */}
          <path
            d="M -1 1 L 1 -1 M 0 6 L 6 0 M 5 7 L 7 5"
            className={styles.markHatch}
            strokeWidth="1.4"
            fill="none"
          />
        </pattern>
      </defs>

      {/* What is left, hatched, drawn under the whole width so the moved
          block sits on top of it and the two always meet exactly. */}
      <rect
        x="0.5"
        y="0.5"
        width={W - 1}
        height={H - 1}
        fill={`url(#${hatchId})`}
        className={styles.markFrame}
      />
      {/* What moved, solid. */}
      <rect
        x="0.5"
        y="0.5"
        width={Math.max(0, movedW - 1)}
        height={H - 1}
        className={styles.markMoved}
      />
      {/* Quarter ticks, drawn over both so the split can be placed by eye. */}
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={W * t}
          y1={H - 9}
          x2={W * t}
          y2={H - 0.5}
          className={styles.markTick}
        />
      ))}
      <rect
        x="0.5"
        y="0.5"
        width={W - 1}
        height={H - 1}
        fill="none"
        className={styles.markFrame}
      />
    </svg>
  );
}

// ---------------------------------------------------------------
// The page
// ---------------------------------------------------------------

export function SellThroughPage() {
  const [windowId, setWindowId] = useState(DEFAULT_WINDOW_ID);
  const [licenceId, setLicenceId] = useState(REPORTED_LICENCE_IDS[0]);

  useEffect(() => {
    document.body.classList.add(PRINT_BODY_CLASS);
    return () => document.body.classList.remove(PRINT_BODY_CLASS);
  }, []);

  const reportWindow = REPORTING_WINDOW_BY_ID[windowId];
  const positions = useMemo(() => positionsFor(windowId), [windowId]);
  const totals = useMemo(() => totalsFor(positions), [positions]);
  const statement = useMemo(
    () => positionFor(licenceId, windowId),
    [licenceId, windowId],
  );

  /* The same property in the window before, so the statement can show a
     direction rather than a photograph, and so the opening figure can be
     checked against a closing figure somebody already saw. */
  const prior = useMemo(
    () =>
      reportWindow.priorWindowId
        ? positionFor(licenceId, reportWindow.priorWindowId)
        : null,
    [licenceId, reportWindow.priorWindowId],
  );

  const sellThroughDelta =
    statement?.sellThroughPct != null && prior?.sellThroughPct != null
      ? Math.round(statement.sellThroughPct - prior.sellThroughPct)
      : null;

  const openingReconciles =
    prior !== null && statement !== null
      ? prior.closingUnits === statement.openingUnits
      : null;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* ===========================================================
            Screen only. Everything from the statement down is paper.
            =========================================================== */}
        <header className={`${styles.head} no-print`}>
          <p className={styles.eyebrow}>
            Supply side, licensor facing, as at {formatDate(NOW)}
          </p>
          <h1 className={styles.h1}>Sell-through</h1>

          <blockquote className={styles.posting}>
            <p>
              "Provide accurate and timely reports to both internal
              stakeholders and external licensors."
            </p>
            <p>
              "Use sales data to guide purchasing strategies and negotiate
              future promotional agreements."
            </p>
            <cite>
              DIME Industries, Irvine. Sales Performance Analyst
            </cite>
          </blockquote>

          <p className={styles.framing}>
            <span aria-hidden="true" className={styles.framingGlyph}>
              ◆
            </span>
            <span>
              The nine property names are published by Nature's Mark and are
              the only public facts on this screen. DIME holds no
              agreement with any of them, and no statement here has been
              issued to anybody.
            </span>
          </p>
        </header>

        <div className={`${styles.controls} no-print`}>
          <span className={styles.pick}>
            <label className={styles.pickLabel} htmlFor="st-window">
              Reporting window
            </label>
            <select
              id="st-window"
              className={styles.select}
              value={windowId}
              onChange={(e) => setWindowId(e.target.value)}
            >
              {REPORTING_WINDOWS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label}
                </option>
              ))}
            </select>
          </span>

          <span className={styles.pick}>
            <label className={styles.pickLabel} htmlFor="st-property">
              Property
            </label>
            <select
              id="st-property"
              className={styles.select}
              value={licenceId}
              onChange={(e) => setLicenceId(e.target.value)}
            >
              {REPORTED_LICENCE_IDS.map((id) => (
                <option key={id} value={id}>
                  {LICENCE_BY_ID[id]?.name ?? id}
                </option>
              ))}
            </select>
          </span>

          <span className={styles.controlsAction}>
            <Button
              variant="primary"
              glyph="▤"
              onClick={() => window.print()}
              aria-label="Print this sell-through statement"
            >
              Print this statement
            </Button>
            <span className={styles.printNote}>
              The statement prints. The ranking below it does not.
            </span>
          </span>
        </div>

        <div className="no-print">
          <StatStrip label="The window at a glance">
            <Stat
              value={totals.properties}
              label="Properties reported"
              note="Every property named under License Partners on natures-mark.com/partners, whether or not it moved a unit."
              provenance="public"
            />
            <Stat
              value={units(totals.movedUnits)}
              label="Units moved"
              note="Sold at the counter, redeemed against tickets, included in a package or given away at an event."
              provenance="illustrative"
              live
            />
            <Stat
              value={
                totals.sellThroughPct === null
                  ? "n/a"
                  : pct(totals.sellThroughPct)
              }
              label="Sell-through"
              note={`${units(totals.movedUnits)} units moved over ${units(
                totals.availableUnits,
              )} available, which is opening stock plus units received.`}
              provenance="modeled"
              live
            />
            <Stat
              value={formatMoney(totals.boughtCostCents)}
              label="Bought in window"
              note="Landed cost of the units received in the window. What the buying actually cost."
              provenance="illustrative"
            />
            <Stat
              value={
                totals.marginPct === null ? "n/a" : pct(totals.marginPct)
              }
              label="Margin on what moved"
              note="Gross sales less the landed cost of the units that moved, over gross sales."
              provenance="modeled"
            />
            <Stat
              value={totals.orderNow}
              label={`Under ${REORDER_HORIZON_WEEKS} weeks of cover`}
              note="Properties whose closing stock lasts less than the venue's own eight week replanning horizon at this window's rate."
              provenance="modeled"
              tone="var(--risk)"
              live
            />
          </StatStrip>

          {/* The three denominators behind the strip, printed rather than
              left in a tooltip. A rate whose divisor is only visible on
              hover is a rate a reader on a phone never sees the divisor
              of. */}
          <p className={styles.internalNote}>
            <span aria-hidden="true">▲</span> Sell-through is units moved over
            units available, which is opening stock plus units received.
            Margin is gross sales less the landed cost of the units that
            moved, over gross sales. Cover is closing stock over the weekly
            rate, and the weekly rate divides units moved by this window's own{" "}
            <span className="num">{reportWindow.weeks}</span> weeks rather than
            by a full quarter.
          </p>
        </div>

        {/* ===========================================================
            1. THE RANKING. Internal, and it says so.
            =========================================================== */}
        <section
          className={`${styles.section} no-print`}
          aria-labelledby="st-rank-h"
        >
          <SectionHead
            eyebrow="One"
            id="st-rank-h"
            title="The nine properties in this window"
            lede={`${reportWindow.label}. ${formatDate(reportWindow.startsOn)} to ${formatDate(
              reportWindow.endsOn,
            )}, ${reportWindow.weeks} weeks. Best sell-through first.`}
            meta={
              <>
                <ProvenanceBadge provenance="public" compact />
                <span>
                  Property names read off{" "}
                  <a
                    className={styles.link}
                    href={SELLTHROUGH_SOURCE}
                    target="_blank"
                    rel="noreferrer"
                  >
                    natures-mark.com/partners
                  </a>{" "}
                  on {SELLTHROUGH_SOURCE_READ_ON}.
                </span>
                <ProvenanceBadge provenance="illustrative" compact />
                <span>Every unit and price is invented for the prototype.</span>
                <ProvenanceBadge provenance="modeled" compact />
                <span>
                  Every rate is derived from those units at render and prints
                  its divisor.
                </span>
              </>
            }
          />

          <p className={styles.internalNote}>
            <span aria-hidden="true">◇</span> This ranking is internal. The
            statement below it is the document a licensor receives, and it is
            the only part of this screen that prints.
          </p>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className="visually-hidden">
                Every published property in the window with what was bought,
                what moved, what is left, its margin and its cover.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Property</th>
                  <th scope="col" className={styles.numCol}>
                    Bought
                  </th>
                  <th scope="col" className={styles.numCol}>
                    Moved
                  </th>
                  <th scope="col" className={styles.numCol}>
                    Left
                  </th>
                  <th scope="col" className={styles.wideCol}>
                    Sell-through
                  </th>
                  <th scope="col" className={styles.numCol}>
                    Margin
                  </th>
                  <th scope="col" className={styles.numCol}>
                    Cover
                  </th>
                  <th scope="col">Next order</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((p) => (
                  <tr key={p.licence.id}>
                    <th scope="row" className={styles.nameCell}>
                      <button
                        type="button"
                        className={styles.nameButton}
                        aria-pressed={licenceId === p.licence.id}
                        onClick={() => setLicenceId(p.licence.id)}
                      >
                        {p.licence.name}
                      </button>
                      <span className={styles.nameMeta}>
                        <ProvenanceBadge provenance="public" compact />
                        <span className={styles.nameSub}>
                          {p.lines.length}{" "}
                          {p.lines.length === 1 ? "line" : "lines"}
                        </span>
                      </span>
                    </th>
                    <td className={styles.numCol} data-label="Bought">
                      <span className="num">{units(p.receivedUnits)}</span>
                      <span className={styles.sub}>
                        <span className="num">
                          {formatMoney(p.boughtCostCents)}
                        </span>{" "}
                        landed
                      </span>
                    </td>
                    <td className={styles.numCol} data-label="Moved">
                      <span className="num">{units(p.movedUnits)}</span>
                      <span className={styles.sub}>
                        <span className="num">{p.unitsPerWeek}</span> a week
                        over <span className="num">{p.window.weeks}</span>
                      </span>
                    </td>
                    <td className={styles.numCol} data-label="Left">
                      <span className="num">{units(p.closingUnits)}</span>
                    </td>
                    <td className={styles.wideCol} data-label="Sell-through">
                      {p.sellThroughPct === null ? (
                        <span className={styles.quiet}>
                          Nothing available in the window
                        </span>
                      ) : (
                        <>
                          <Bar
                            pct={p.sellThroughPct}
                            value={pct(p.sellThroughPct)}
                            label={`Sell-through on ${p.licence.name}`}
                            tone={
                              p.sellThroughPct >= 70
                                ? "var(--ok)"
                                : p.sellThroughPct >= 35
                                  ? "var(--warn)"
                                  : "var(--risk)"
                            }
                          />
                          <span className={styles.sub}>
                            <span className="num">{units(p.movedUnits)}</span>{" "}
                            of{" "}
                            <span className="num">
                              {units(p.availableUnits)}
                            </span>{" "}
                            available
                          </span>
                        </>
                      )}
                    </td>
                    <td className={styles.numCol} data-label="Margin">
                      {p.marginCents === null || p.marginPct === null ? (
                        <span className={styles.quiet}>
                          No sales, cost only{" "}
                          <span className="num">
                            {formatMoney(p.boughtCostCents)}
                          </span>
                        </span>
                      ) : (
                        <>
                          <span className="num">
                            {formatMoney(p.marginCents)}
                          </span>
                          <span className={styles.sub}>
                            <span className="num">{pct(p.marginPct)}</span> of
                            gross sales
                          </span>
                        </>
                      )}
                    </td>
                    <td className={styles.numCol} data-label="Cover">
                      {p.weeksOfCover === null ? (
                        <span className={styles.quiet}>No rate to divide by</span>
                      ) : (
                        <>
                          <span className="num">{p.weeksOfCover}w</span>
                          <span className={styles.sub}>
                            <span className="num">{units(p.closingUnits)}</span>{" "}
                            left over{" "}
                            <span className="num">{p.unitsPerWeek}</span> a week
                          </span>
                        </>
                      )}
                    </td>
                    <td data-label="Next order">
                      <TokenMark token={p.band.token} small />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row">Nine properties</th>
                  <td className={styles.numCol} data-label="Bought">
                    <span className="num">{units(totals.receivedUnits)}</span>
                  </td>
                  <td className={styles.numCol} data-label="Moved">
                    <span className="num">{units(totals.movedUnits)}</span>
                  </td>
                  <td className={styles.numCol} data-label="Left">
                    <span className="num">{units(totals.closingUnits)}</span>
                  </td>
                  <td className={styles.wideCol} data-label="Sell-through">
                    <span className="num">
                      {totals.sellThroughPct === null
                        ? "n/a"
                        : pct(totals.sellThroughPct)}
                    </span>
                    <span className={styles.sub}>
                      <span className="num">{units(totals.movedUnits)}</span> of{" "}
                      <span className="num">{units(totals.availableUnits)}</span>{" "}
                      available
                    </span>
                  </td>
                  <td className={styles.numCol} data-label="Margin">
                    <span className="num">{formatMoney(totals.marginCents)}</span>
                    <span className={styles.sub}>
                      <span className="num">
                        {totals.marginPct === null
                          ? "n/a"
                          : pct(totals.marginPct)}
                      </span>{" "}
                      of gross sales
                    </span>
                  </td>
                  <td className={styles.numCol} />
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* ===========================================================
            2. THE STATEMENT. This is the document.
            =========================================================== */}
        <section className={styles.section} aria-labelledby="st-doc-h">
          <div className="no-print">
            <SectionHead
              eyebrow="Two"
              id="st-doc-h"
              title="The statement a licensor receives"
              lede="One property, one window, generated from the same counts as the ranking above and as the stock table on promo stock."
            />
          </div>

          {statement === null ? (
            <p className={styles.empty} role="status">
              <span aria-hidden="true">○</span> No property is selected.
            </p>
          ) : (
            <article className={styles.doc} aria-live="polite">
              <header className={styles.docHead}>
                <div className={styles.docHeadMain}>
                  <p className={styles.docKicker}>
                    Licensed product sell-through statement
                  </p>
                  <h3 className={styles.docTitle}>
                    {statement.licence.name}, {statement.window.label}
                  </h3>
                  <p className={styles.docMeta}>
                    Window {formatDate(statement.window.startsOn)} to{" "}
                    {formatDate(statement.window.endsOn)},{" "}
                    <span className="num">{statement.window.weeks}</span> weeks.
                    {statement.window.closed
                      ? " The window is closed."
                      : " The window is still running, so every per week figure is measured over the weeks elapsed rather than a full quarter."}
                  </p>
                  <p className={styles.docMeta}>
                    Reference {referenceFor(statement)}. Prepared{" "}
                    {formatDate(NOW)} by the promotion planner, DIME
                    Irvine. To the licensor of record for{" "}
                    {statement.licence.name}.
                  </p>
                </div>
                <div className={styles.docStamp}>
                  <ProvenanceBadge provenance="illustrative" />
                  <span className={styles.docStampNote}>
                    Prototype statement. Not issued to any licensor, and no
                    agreement exists between DIME and{" "}
                    {statement.licence.name}.
                  </span>
                </div>
              </header>

              {/* ------------------------------------------------
                  Position. What was bought, what moved, what is left.
                  ------------------------------------------------ */}
              <h4 className={styles.docSubhead}>
                Position in the window <span className={styles.docRule} />
              </h4>

              <dl className={`${styles.figures} avoid-break`}>
                <div className={styles.figure}>
                  <dt>Opening stock</dt>
                  <dd>
                    <span className={`${styles.figureValue} num`}>
                      {units(statement.openingUnits)}
                    </span>
                    <span className={styles.figureNote}>
                      Reconstructed as closing plus moved less received.
                    </span>
                    <ProvenanceBadge provenance="modeled" compact />
                  </dd>
                </div>
                <div className={styles.figure}>
                  <dt>Received in window</dt>
                  <dd>
                    <span className={`${styles.figureValue} num`}>
                      {units(statement.receivedUnits)}
                    </span>
                    <span className={styles.figureNote}>
                      Landed cost {formatMoney(statement.boughtCostCents)}.
                    </span>
                    <ProvenanceBadge provenance="illustrative" compact />
                  </dd>
                </div>
                <div className={styles.figure}>
                  <dt>Units moved</dt>
                  <dd>
                    <span className={`${styles.figureValue} num`}>
                      {units(statement.movedUnits)}
                    </span>
                    <span className={styles.figureNote}>
                      Sold, redeemed, included in a package or given away.
                    </span>
                    <ProvenanceBadge provenance="illustrative" compact />
                  </dd>
                </div>
                <div className={styles.figure}>
                  <dt>Closing stock</dt>
                  <dd>
                    <span className={`${styles.figureValue} num`}>
                      {units(statement.closingUnits)}
                    </span>
                    <span className={styles.figureNote}>
                      Held at {formatDate(statement.window.endsOn)}.
                    </span>
                    <ProvenanceBadge provenance="illustrative" compact />
                  </dd>
                </div>
              </dl>

              <div className={`${styles.markBlock} avoid-break`}>
                <MovementMark
                  moved={statement.movedUnits}
                  closing={statement.closingUnits}
                  available={statement.availableUnits}
                  propertyName={statement.licence.name}
                  idSuffix={`${statement.licence.id}-${statement.window.id}`}
                />
                <ul className={styles.markKey}>
                  <li>
                    <span aria-hidden="true" className={styles.keySolid} />
                    <span>
                      Moved <span className="num">{units(statement.movedUnits)}</span>
                    </span>
                  </li>
                  <li>
                    <span aria-hidden="true" className={styles.keyHatch} />
                    <span>
                      Left <span className="num">{units(statement.closingUnits)}</span>
                    </span>
                  </li>
                  <li>
                    <span className={styles.keyTotal}>
                      Available{" "}
                      <span className="num">{units(statement.availableUnits)}</span>,
                      which is opening plus received and is also moved plus left
                    </span>
                  </li>
                </ul>
              </div>

              {/* ------------------------------------------------
                  The rates, each beside its divisor.
                  ------------------------------------------------ */}
              <h4 className={styles.docSubhead}>
                Rates, each over what it was divided by{" "}
                <span className={styles.docRule} />
              </h4>

              <dl className={`${styles.rates} avoid-break`}>
                <div className={styles.rate}>
                  <dt>Sell-through</dt>
                  <dd>
                    <strong className={`${styles.rateValue} num`}>
                      {statement.sellThroughPct === null
                        ? "n/a"
                        : pct(statement.sellThroughPct)}
                    </strong>
                    <span className={styles.rateDiv}>
                      <span className="num">{units(statement.movedUnits)}</span>{" "}
                      units moved over{" "}
                      <span className="num">
                        {units(statement.availableUnits)}
                      </span>{" "}
                      available, which is{" "}
                      <span className="num">{units(statement.openingUnits)}</span>{" "}
                      opening plus{" "}
                      <span className="num">
                        {units(statement.receivedUnits)}
                      </span>{" "}
                      received.
                    </span>
                    <ProvenanceBadge provenance="modeled" compact />
                  </dd>
                </div>

                <div className={styles.rate}>
                  <dt>Rate of movement</dt>
                  <dd>
                    <strong className={`${styles.rateValue} num`}>
                      {statement.unitsPerWeek} a week
                    </strong>
                    <span className={styles.rateDiv}>
                      <span className="num">{units(statement.movedUnits)}</span>{" "}
                      units over{" "}
                      <span className="num">{statement.window.weeks}</span> weeks
                      in the window.
                    </span>
                    <ProvenanceBadge provenance="modeled" compact />
                  </dd>
                </div>

                <div className={styles.rate}>
                  <dt>Weeks of cover</dt>
                  <dd>
                    {statement.weeksOfCover === null ? (
                      <>
                        <strong className={styles.rateValue}>
                          Not computable
                        </strong>
                        <span className={styles.rateDiv}>
                          Nothing moved in the window, so there is no weekly
                          rate to divide closing stock by. Not estimated.
                        </span>
                        <ProvenanceBadge provenance="modeled" compact />
                      </>
                    ) : (
                      <>
                        <strong className={`${styles.rateValue} num`}>
                          {statement.weeksOfCover} weeks
                        </strong>
                        <span className={styles.rateDiv}>
                          <span className="num">
                            {units(statement.closingUnits)}
                          </span>{" "}
                          closing units over{" "}
                          <span className="num">{statement.unitsPerWeek}</span>{" "}
                          units a week.
                        </span>
                        <ProvenanceBadge provenance="modeled" compact />
                      </>
                    )}
                  </dd>
                </div>

                <div className={styles.rate}>
                  <dt>Margin on what moved</dt>
                  <dd>
                    {statement.marginCents === null ||
                    statement.marginPct === null ? (
                      <>
                        <strong className={styles.rateValue}>No sales</strong>
                        <span className={styles.rateDiv}>
                          Nothing sold, so there is no gross sales figure to
                          take a margin over. Landed cost of stock received in
                          the window was{" "}
                          {formatMoney(statement.boughtCostCents)}.
                        </span>
                        <ProvenanceBadge provenance="modeled" compact />
                      </>
                    ) : (
                      <>
                        <strong className={`${styles.rateValue} num`}>
                          {pct(statement.marginPct)}
                        </strong>
                        <span className={styles.rateDiv}>
                          {formatMoney(statement.marginCents)} margin over{" "}
                          {formatMoney(statement.grossSalesCents)} gross sales,
                          after {formatMoney(statement.costOfMovedCents)} landed
                          cost of the units that moved.
                        </span>
                        <ProvenanceBadge provenance="modeled" compact />
                      </>
                    )}
                  </dd>
                </div>

                <div className={styles.rate}>
                  <dt>Against the window before</dt>
                  <dd>
                    {prior === null || sellThroughDelta === null ? (
                      <>
                        <strong className={styles.rateValue}>
                          No prior window
                        </strong>
                        <span className={styles.rateDiv}>
                          {statement.window.priorWindowId === null
                            ? "This is the earliest window on file, so there is nothing to compare against and nothing is implied."
                            : "The property carried no position in the window before."}
                        </span>
                      </>
                    ) : (
                      <>
                        <strong className={`${styles.rateValue} num`}>
                          {sellThroughDelta >= 0 ? "up " : "down "}
                          {Math.abs(sellThroughDelta)} points
                        </strong>
                        <span className={styles.rateDiv}>
                          {pct(statement.sellThroughPct ?? 0)} this window
                          against {pct(prior.sellThroughPct ?? 0)} in{" "}
                          {prior.window.label}. Windows of different lengths,{" "}
                          <span className="num">{statement.window.weeks}</span>{" "}
                          weeks against{" "}
                          <span className="num">{prior.window.weeks}</span>, so
                          the points move and the volumes are not comparable.
                        </span>
                        <ProvenanceBadge provenance="modeled" compact />
                      </>
                    )}
                  </dd>
                </div>
              </dl>

              {openingReconciles !== null ? (
                <p className={styles.check}>
                  <span aria-hidden="true">{openingReconciles ? "✓" : "✕"}</span>{" "}
                  {openingReconciles
                    ? `Opening stock of ${units(
                        statement.openingUnits,
                      )} matches the closing stock reported for ${prior?.window.label} exactly. The reconstruction is arithmetic rather than an estimate.`
                    : `Opening stock of ${units(
                        statement.openingUnits,
                      )} does not match the closing stock reported for ${prior?.window.label}. The difference is stated rather than smoothed.`}
                </p>
              ) : null}

              {/* ------------------------------------------------
                  Where the units went.
                  ------------------------------------------------ */}
              <h4 className={styles.docSubhead}>
                Where the units went <span className={styles.docRule} />
              </h4>

              {statement.channels.length === 0 ? (
                <p className={styles.quietBlock}>
                  <span aria-hidden="true">○</span> No units moved in this
                  window, through any channel. Stock was received and held.
                </p>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.docTable}>
                    <caption className="visually-hidden">
                      Units of this property by the channel they left the
                      building through.
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Channel</th>
                        <th scope="col" className={styles.numCol}>
                          Units
                        </th>
                        <th scope="col" className={styles.wideCol}>
                          Share of units moved
                        </th>
                        <th scope="col">What it is evidence of</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statement.channels.map((c) => (
                        <tr key={c.channel}>
                          <th scope="row">
                            <TokenMark
                              token={MOVEMENT_CHANNEL[c.channel]}
                              small
                            />
                          </th>
                          <td className={styles.numCol} data-label="Units">
                            <span className="num">{units(c.units)}</span>
                          </td>
                          <td className={styles.wideCol} data-label="Share">
                            <Bar
                              pct={c.sharePct}
                              value={pct(c.sharePct)}
                              label={`${MOVEMENT_CHANNEL[c.channel].label} share of units moved`}
                              tone={MOVEMENT_CHANNEL[c.channel].cssVar}
                            />
                            <span className={styles.sub}>
                              <span className="num">{units(c.units)}</span> of{" "}
                              <span className="num">
                                {units(statement.movedUnits)}
                              </span>{" "}
                              units moved
                            </span>
                          </td>
                          <td data-label="Evidence">
                            <span className={styles.evidence}>
                              {MOVEMENT_CHANNEL[c.channel].note}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th scope="row">Total moved</th>
                        <td className={styles.numCol}>
                          <span className="num">{units(statement.movedUnits)}</span>
                        </td>
                        <td className={styles.wideCol}>
                          <span className="num">100%</span>
                          <span className={styles.sub}>
                            The split is held to the unit count on{" "}
                            <Link to="/promo">promo stock</Link> and fails at
                            load if it drifts
                          </span>
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* ------------------------------------------------
                  Line detail.
                  ------------------------------------------------ */}
              <h4 className={styles.docSubhead}>
                Line detail <span className={styles.docRule} />
              </h4>

              <div className={styles.tableWrap}>
                <table className={styles.docTable}>
                  <caption className="visually-hidden">
                    Every product line carrying this property in this window.
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Line</th>
                      <th scope="col" className={styles.numCol}>
                        Received
                      </th>
                      <th scope="col" className={styles.numCol}>
                        Moved
                      </th>
                      <th scope="col" className={styles.numCol}>
                        Left
                      </th>
                      <th scope="col" className={styles.numCol}>
                        Retail each
                      </th>
                      <th scope="col" className={styles.numCol}>
                        Gross sales
                      </th>
                      <th scope="col" className={styles.numCol}>
                        Margin
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {statement.lines.map((l) => {
                      const gross = l.unitsOut * l.unitRetailCents;
                      const cost = l.unitsOut * l.unitCostCents;
                      return (
                        <tr key={l.id}>
                          <th scope="row" className={styles.lineCell}>
                            {l.name}
                          </th>
                          <td className={styles.numCol} data-label="Received">
                            <span className="num">{units(l.unitsIn)}</span>
                          </td>
                          <td className={styles.numCol} data-label="Moved">
                            <span className="num">{units(l.unitsOut)}</span>
                          </td>
                          <td className={styles.numCol} data-label="Left">
                            <span className="num">{units(l.unitsOnHand)}</span>
                          </td>
                          <td className={styles.numCol} data-label="Retail each">
                            <span className="num">
                              {formatMoney(l.unitRetailCents)}
                            </span>
                          </td>
                          <td className={styles.numCol} data-label="Gross sales">
                            <span className="num">{formatMoney(gross)}</span>
                          </td>
                          <td className={styles.numCol} data-label="Margin">
                            {gross > 0 ? (
                              <>
                                <span className="num">
                                  {formatMoney(gross - cost)}
                                </span>
                                <span className={styles.sub}>
                                  <span className="num">
                                    {pct(((gross - cost) / gross) * 100)}
                                  </span>{" "}
                                  of gross
                                </span>
                              </>
                            ) : (
                              <span className={styles.quiet}>
                                No sales, cost only {formatMoney(cost)}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th scope="row">Total</th>
                      <td className={styles.numCol}>
                        <span className="num">{units(statement.receivedUnits)}</span>
                      </td>
                      <td className={styles.numCol}>
                        <span className="num">{units(statement.movedUnits)}</span>
                      </td>
                      <td className={styles.numCol}>
                        <span className="num">{units(statement.closingUnits)}</span>
                      </td>
                      <td className={styles.numCol} />
                      <td className={styles.numCol}>
                        <span className="num">
                          {formatMoney(statement.grossSalesCents)}
                        </span>
                      </td>
                      <td className={styles.numCol}>
                        {statement.marginCents === null ? (
                          <span className={styles.quiet}>
                            No sales in the window
                          </span>
                        ) : (
                          <span className="num">
                            {formatMoney(statement.marginCents)}
                          </span>
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* ------------------------------------------------
                  What it implies for the next order.
                  ------------------------------------------------ */}
              <h4 className={styles.docSubhead}>
                What this window implies for the next order{" "}
                <span className={styles.docRule} />
              </h4>

              <div className={`${styles.band} avoid-break`}>
                <div className={styles.bandHead}>
                  <TokenMark token={statement.band.token} />
                  <ProvenanceBadge provenance="modeled" compact />
                </div>
                <p className={styles.bandTest}>{statement.band.test}</p>
                <p className={styles.bandImplication}>
                  {statement.band.implication}
                </p>
                <p className={styles.bandHorizon}>
                  <span aria-hidden="true">◇</span> The horizon this is judged
                  against is{" "}
                  <span className="num">{REORDER_HORIZON_WEEKS}</span> weeks,
                  which is this venue's own replanning cycle. It is NOT a
                  manufacturing lead time. No source read for this application
                  publishes a lead time, a minimum order quantity or a unit cost
                  for any manufacturer of these properties, so none is used
                  here and none is printed on a document that leaves the
                  building.
                </p>
              </div>

              <table className={styles.ruleTable}>
                <caption className={styles.ruleCaption}>
                  The whole rule, printed, so the recommendation can be checked
                  rather than believed.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Band</th>
                    <th scope="col">Test</th>
                    <th scope="col">What it means for the next order</th>
                  </tr>
                </thead>
                <tbody>
                  {REORDER_BANDS.map((b) => (
                    <tr
                      key={b.id}
                      className={b.id === statement.band.id ? styles.ruleOn : undefined}
                    >
                      <th scope="row">
                        <TokenMark token={b.token} small />
                      </th>
                      <td data-label="Test">{b.test}</td>
                      <td data-label="Means">{b.implication}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* ------------------------------------------------
                  The provenance footer. The point of the document.
                  ------------------------------------------------ */}
              <footer className={styles.docFoot}>
                <h4 className={styles.docSubhead}>
                  What on this statement is published, and what is not{" "}
                  <span className={styles.docRule} />
                </h4>

                <dl className={styles.provList}>
                  <div className={styles.provRow}>
                    <dt>
                      <ProvenanceBadge provenance="public" />
                    </dt>
                    <dd>
                      The property name {statement.licence.name} is named under
                      License Partners on{" "}
                      <a
                        className={styles.link}
                        href={SELLTHROUGH_SOURCE}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {SELLTHROUGH_SOURCE}
                      </a>
                      , read {SELLTHROUGH_SOURCE_READ_ON}. The same page names{" "}
                      {RETAIL_PARTNERS_CITED.join(", ")} among its retail
                      partners.
                    </dd>
                  </div>
                  <div className={styles.provRow}>
                    <dt>
                      <ProvenanceBadge provenance="illustrative" />
                    </dt>
                    <dd>
                      Every unit count, every landed cost and every retail price
                      on this statement is invented for this prototype,
                      including the channel split. None of them is a claim about
                      any real company's trade.
                    </dd>
                  </div>
                  <div className={styles.provRow}>
                    <dt>
                      <ProvenanceBadge provenance="modeled" />
                    </dt>
                    <dd>
                      Sell-through, rate of movement, weeks of cover, margin,
                      the movement against the window before, and the reorder
                      band are all derived from those units at render. Each is
                      printed beside the figure it was divided by, and none is
                      stored anywhere.
                    </dd>
                  </div>
                  <div className={styles.provRow}>
                    <dt className={styles.provAbsent}>
                      <span aria-hidden="true">○</span> Not published
                    </dt>
                    <dd>
                      Nature's Mark publishes no factory, no country of
                      manufacture, no minimum order quantity, no lead time and
                      no unit cost, and names no anime or game property. None of
                      the six appears on this statement in any form. Nature's
                      Mark holding these licences is a fact about Nature's
                      Mark and is not a fact about DIME.
                    </dd>
                  </div>
                </dl>

                <p className={`${styles.docLinks} no-print`}>
                  The internal stock table is on{" "}
                  <Link to="/promo">promo stock</Link>. The relationships behind
                  it are on <Link to="/partners">partners</Link>. What the buying
                  cost is on <Link to="/spend">budget</Link>. Every formula is on{" "}
                  <Link to="/method">method</Link>.
                </p>

                <p className="print-only print-disclaimer">
                  Prototype document, prepared {formatDate(NOW)} for a job
                  application and issued to nobody. The nine property names are
                  read off {SELLTHROUGH_SOURCE} on{" "}
                  {SELLTHROUGH_SOURCE_READ_ON}. Every unit, price, margin and
                  week on this sheet is invented or derived from invented
                  counts. There is no agreement between DIME and any
                  licensor named here.
                </p>
              </footer>
            </article>
          )}
        </section>
      </div>
    </div>
  );
}
