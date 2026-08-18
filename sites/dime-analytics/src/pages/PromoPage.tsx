import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { PromoCategory } from "@/domain/licensing";
import {
  PROMO_CATEGORY,
  PROMO_CATEGORY_ORDER,
  formatDate,
  formatMoney,
} from "@/domain/licensing";
import { LICENCE_BY_ID } from "@/data/partners";
import {
  DEFAULT_PROMO_PERIOD_ID,
  PROMO_AS_OF,
  PROMO_PERIODS,
  PROMO_PERIOD_BY_ID,
} from "@/data/promo";
import {
  COVER_READ_META,
  licensorReport,
  priorPeriodRow,
  promoRows,
  promoTotals,
  reportableLicenceIds,
} from "@/domain/selectors/promo";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import {
  Bar,
  FilterChip,
  SectionHead,
  Stat,
  StatStrip,
  TokenMark,
} from "@/components/licensing/Panels";
import styles from "./PromoPage.module.css";

/**
 * SELL-THROUGH, AND THE REPORT THAT LEAVES THE BUILDING.
 *
 * The second posting says this in one bullet: "Track sales performance of
 * promotional products and create detailed internal and external sales
 * reports for licensors."
 *
 * ── THE SECOND HALF OF THAT SENTENCE IS THE WHOLE PAGE ────────────
 * Tracking sell-through is a table, and any inventory tool has one. What
 * a licensed programme actually requires is different and harder: a
 * document that goes to somebody outside your company, states what sold
 * of their property, and states what you owe them for it. That document
 * is the thing a licensor relationship is audited on.
 *
 * So the report is BUILT ON THE PAGE, generated from the same selectors
 * as the table above it, per property and per period, with the
 * royalty-relevant figures called out. It is not a button labelled
 * "export" over a function nobody wrote. A work sample whose central
 * artefact is a button is a work sample about buttons.
 *
 * ── THE THIRD LEDGER ──────────────────────────────────────────────
 * The money on this screen is neither of the two ledgers on /book. Booked
 * revenue is signed event contracts. Outbound activity is hours and has
 * no money on it at all. Promotional revenue is a THIRD thing and it is
 * the dangerous one, because it is in dollars and will therefore add up
 * if anybody lets it.
 *
 * It must not. An eighty dollar plush sell-through and a four thousand
 * dollar grad night are not comparable quantities, and a total of the two
 * would inflate the single number a hiring manager reads first. The
 * separation is kept structurally: `selectors/promo.ts` imports nothing
 * from `BookProvider`, this page shows no booked revenue anywhere, and
 * the strip below says which ledger it is in its own words.
 *
 * ── WHERE THE ROYALTY GAP IS, AND WHY IT IS LEFT OPEN ─────────────
 * Only one agreement in the seed schedules any property, and it is a
 * draft. Every property outside it reports NO RATE ON RECORD rather than
 * borrowing the rate from the one that exists. Applying somebody else's
 * twelve per cent to a property nobody has agreed twelve per cent for
 * would be a fabricated royalty statement, which is the worst thing this
 * page could produce and the easiest one to produce by accident.
 */

const NOW = PROMO_AS_OF;

type CategoryFilter = PromoCategory | "all";

export function PromoPage() {
  const [periodId, setPeriodId] = useState(DEFAULT_PROMO_PERIOD_ID);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [reportLicenceId, setReportLicenceId] = useState("disney");

  const period = PROMO_PERIOD_BY_ID[periodId];
  const rows = useMemo(() => promoRows(periodId), [periodId]);
  const totals = useMemo(() => promoTotals(rows), [rows]);

  /* The period before the one on screen, so a report can show a
     direction. Falls back to the same period at the start of the list,
     where the prior period is simply not in the seed. */
  const priorPeriodId = useMemo(() => {
    const i = PROMO_PERIODS.findIndex((p) => p.id === periodId);
    return i > 0 ? PROMO_PERIODS[i - 1].id : null;
  }, [periodId]);

  const byCategory = useMemo(() => {
    const out = {
      plush: 0,
      collectible: 0,
      apparel: 0,
      novelty: 0,
      print: 0,
      "food-novelty": 0,
    } satisfies Record<PromoCategory, number>;
    for (const r of rows) out[r.line.category] += 1;
    return out;
  }, [rows]);

  const visible = useMemo(
    () =>
      category === "all"
        ? rows
        : rows.filter((r) => r.line.category === category),
    [rows, category],
  );

  const licenceIds = useMemo(
    () => reportableLicenceIds(periodId),
    [periodId],
  );

  const report = useMemo(
    () => licensorReport(reportLicenceId, periodId),
    [reportLicenceId, periodId],
  );

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Supply side, as at {formatDate(NOW)}</p>
          <h1 className={styles.h1}>Promo stock</h1>

          <blockquote className={styles.posting}>
            <p>
              "Track sales performance of promotional products and create
              detailed internal and external sales reports for licensors."
            </p>
            <cite>
              DIME Industries, Irvine. Sales Performance Analyst
            </cite>
          </blockquote>

          <p className={styles.framing}>
            <span aria-hidden="true" className={styles.framingGlyph}>
              ◇
            </span>
            <span>
              Illustrative programme, seeded end to end. Nothing here has been
              ordered and no licensor agreement exists.
            </span>
          </p>

          {/* THE THIRD LEDGER, said out loud rather than left to be
              inferred from the absence of a link. */}
          <p className={styles.ledgerNote}>
            <span aria-hidden="true" className={styles.ledgerGlyph}>
              ◈
            </span>
            <span>
              Merchandise money. Never added to booked event revenue or to
              outbound hours on <Link to="/book">the book</Link>.
            </span>
          </p>
        </header>

        <div className={styles.periodBar}>
          {/* The period control is this page's own rather than the shared
              chrome select, for one reason worth writing down: the shared
              one is 37px tall and this application holds itself to 44px
              tap targets. Raising it in the shared file would have moved
              the control on four other screens in a session where another
              agent is working in that area. */}
          <span className={styles.periodPick}>
            <label className={styles.periodLabel} htmlFor="promo-period">
              Trading period
            </label>
            <select
              id="promo-period"
              className={styles.periodSelect}
              value={periodId}
              onChange={(e) => setPeriodId(e.target.value)}
            >
              {PROMO_PERIODS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </span>
          <span className={styles.periodDates}>
            {formatDate(period.startsOn)} to {formatDate(period.endsOn)},{" "}
            <span className="num">{period.weeks}</span> weeks
          </span>
        </div>

        <StatStrip label="The period at a glance">
          <Stat
            value={totals.lines}
            label="Product lines"
            note="Distinct promotional lines counted in this period."
            provenance="illustrative"
          />
          <Stat
            value={totals.unitsOut.toLocaleString("en-US")}
            label="Units out"
            note="Sold at the counter or redeemed against tickets in the period."
            provenance="illustrative"
            live
          />
          <Stat
            value={`${Math.round(totals.sellThroughPct)}%`}
            label="Sell-through"
            note="Units out over units in plus units on hand. Derived at render from the counts, never stored."
            provenance="modeled"
            live
          />
          <Stat
            value={formatMoney(totals.revenueCents)}
            label="Merchandise revenue"
            note="Units out times retail. This is the third ledger and is never added to booked event revenue."
            provenance="illustrative"
          />
          <Stat
            value={
              totals.marginPct === null
                ? "n/a"
                : `${Math.round(totals.marginPct)}%`
            }
            label="Margin on sales"
            note="Revenue less landed cost of everything that went out, including the lines given away for nothing."
            provenance="modeled"
          />
          <Stat
            value={totals.reorderNow}
            label="Lines to reorder now"
            note="Weeks of cover shorter than the lead time behind the line. Ordering today still leaves a gap."
            provenance="modeled"
            tone="var(--risk)"
            live
          />
        </StatStrip>

        {/* ===========================================================
            1. SELL-THROUGH BY LINE
            =========================================================== */}
        <section className={styles.section} aria-labelledby="lines-h">
          <SectionHead
            eyebrow="One"
            id="lines-h"
            title="Sell-through by line"
            lede="Best moving first. Cover is judged against the lead time behind each line, not against a fixed threshold."
            meta={
              <>
                <ProvenanceBadge provenance="illustrative" compact />
                <span>
                  Units, costs and prices are invented for this prototype.
                </span>
                <ProvenanceBadge provenance="modeled" compact />
                <span>
                  Sell-through, margin and cover are derived from them at
                  render.
                </span>
              </>
            }
          />

          <div className={styles.filterRow} role="group" aria-label="Category">
            <FilterChip
              token={{
                glyph: "▣",
                label: "All lines",
                cssVar: "var(--text-2)",
                note: "Every product line in the period.",
              }}
              count={rows.length}
              pressed={category === "all"}
              onClick={() => setCategory("all")}
            />
            {PROMO_CATEGORY_ORDER.map((c) => (
              <FilterChip
                key={c}
                token={PROMO_CATEGORY[c]}
                count={byCategory[c]}
                pressed={category === c}
                onClick={() => setCategory(category === c ? "all" : c)}
              />
            ))}
          </div>

          <p className={styles.shown} aria-live="polite">
            <strong className="num">{visible.length}</strong> of{" "}
            <span className="num">{rows.length}</span> lines shown
          </p>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className="visually-hidden">
                Every promotional product line in the period with its units,
                sell-through, revenue, margin and weeks of cover.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Line</th>
                  <th scope="col" className={styles.numCol}>
                    In
                  </th>
                  <th scope="col" className={styles.numCol}>
                    Out
                  </th>
                  <th scope="col" className={styles.numCol}>
                    On hand
                  </th>
                  <th scope="col" className={styles.wideCol}>
                    Sell-through
                  </th>
                  <th scope="col" className={styles.numCol}>
                    Revenue
                  </th>
                  <th scope="col" className={styles.numCol}>
                    Margin
                  </th>
                  <th scope="col" className={styles.numCol}>
                    Cover
                  </th>
                  <th scope="col">Read</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.line.id}>
                    <th scope="row" className={styles.lineCell}>
                      <span className={styles.lineName}>{r.line.name}</span>
                      <span className={styles.lineMeta}>
                        <TokenMark
                          token={PROMO_CATEGORY[r.line.category]}
                          small
                        />
                        {r.licence ? (
                          <span className={styles.lineLicence}>
                            {r.licence.name}
                          </span>
                        ) : (
                          <span className={styles.lineUnlicensed}>
                            Unlicensed
                          </span>
                        )}
                      </span>
                    </th>
                    <td className={styles.numCol} data-label="Units in">
                      <span className="num">
                        {r.line.unitsIn.toLocaleString("en-US")}
                      </span>
                    </td>
                    <td className={styles.numCol} data-label="Units out">
                      <span className="num">
                        {r.line.unitsOut.toLocaleString("en-US")}
                      </span>
                    </td>
                    <td className={styles.numCol} data-label="On hand">
                      <span className="num">
                        {r.line.unitsOnHand.toLocaleString("en-US")}
                      </span>
                    </td>
                    <td className={styles.wideCol} data-label="Sell-through">
                      <Bar
                        pct={r.sellThroughPct}
                        value={`${Math.round(r.sellThroughPct)}%`}
                        label={`Sell-through on ${r.line.name}`}
                        tone={
                          r.sellThroughPct >= 70
                            ? "var(--ok)"
                            : r.sellThroughPct >= 35
                              ? "var(--warn)"
                              : "var(--risk)"
                        }
                      />
                    </td>
                    <td className={styles.numCol} data-label="Revenue">
                      {r.sellsForMoney ? (
                        <span className="num">
                          {formatMoney(r.revenueCents)}
                        </span>
                      ) : (
                        <span className={styles.given}>
                          <span aria-hidden="true">○</span> Given, not sold
                        </span>
                      )}
                    </td>
                    <td className={styles.numCol} data-label="Margin">
                      {r.marginCents === null || r.marginPct === null ? (
                        <span className={styles.given}>
                          <span aria-hidden="true">○</span> Cost only,{" "}
                          <span className="num">
                            {formatMoney(r.cogsCents)}
                          </span>
                        </span>
                      ) : (
                        <>
                          <span className="num">
                            {formatMoney(r.marginCents)}
                          </span>
                          <span className={styles.sub}>
                            <span className="num">
                              {Math.round(r.marginPct)}%
                            </span>
                          </span>
                        </>
                      )}
                    </td>
                    <td className={styles.numCol} data-label="Weeks of cover">
                      {r.weeksOfCover === null ? (
                        <span className={styles.given}>None</span>
                      ) : (
                        <>
                          <span className="num">{r.weeksOfCover}w</span>
                          {r.leadTimeWeeks !== null ? (
                            <span className={styles.sub}>
                              lead <span className="num">{r.leadTimeWeeks}w</span>
                            </span>
                          ) : null}
                        </>
                      )}
                    </td>
                    <td data-label="Read">
                      <TokenMark token={COVER_READ_META[r.read]} small />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ===========================================================
            2. THE LICENSOR REPORT
            =========================================================== */}
        <section className={styles.section} aria-labelledby="report-h">
          <SectionHead
            eyebrow="Two"
            id="report-h"
            title="The report a licensor receives"
            lede="One property, one period, generated from the same counts as the table above."
          />

          <div
            className={styles.filterRow}
            role="group"
            aria-label="Property to report on"
          >
            {licenceIds.map((id) => {
              const licence = LICENCE_BY_ID[id];
              if (!licence) return null;
              const count = rows.filter(
                (r) => r.line.licenceId === id,
              ).length;
              return (
                <FilterChip
                  key={id}
                  token={{
                    glyph: "◆",
                    label: licence.name,
                    cssVar: "var(--prov-public)",
                    note: `Named on ${licence.source}. Lines in this period.`,
                  }}
                  count={count}
                  pressed={reportLicenceId === id}
                  onClick={() => setReportLicenceId(id)}
                />
              );
            })}
          </div>

          {report ? (
            <article className={styles.report} aria-live="polite">
              <header className={styles.reportHead}>
                <div>
                  <p className={styles.reportKicker}>
                    Licensed product sales statement
                  </p>
                  <h3 className={styles.reportTitle}>
                    {report.licence.name}, {report.period.label}
                  </h3>
                  <p className={styles.reportDates}>
                    Period {formatDate(report.period.startsOn)} to{" "}
                    {formatDate(report.period.endsOn)}. Prepared{" "}
                    {formatDate(NOW)}. Prepared by the promotion planner,
                    DIME Industries.
                  </p>
                </div>
                <div className={styles.reportStamp}>
                  <ProvenanceBadge provenance="illustrative" />
                  <span className={styles.reportStampNote}>
                    Prototype statement. Not issued to any licensor.
                  </span>
                </div>
              </header>

              <div className={styles.reportGrid}>
                <div className={styles.reportFig}>
                  <span className={styles.reportFigLabel}>Units received</span>
                  <span className={`${styles.reportFigValue} num`}>
                    {report.unitsIn.toLocaleString("en-US")}
                  </span>
                </div>
                <div className={styles.reportFig}>
                  <span className={styles.reportFigLabel}>Units sold</span>
                  <span className={`${styles.reportFigValue} num`}>
                    {report.unitsOut.toLocaleString("en-US")}
                  </span>
                </div>
                <div className={styles.reportFig}>
                  <span className={styles.reportFigLabel}>Closing stock</span>
                  <span className={`${styles.reportFigValue} num`}>
                    {report.unitsOnHand.toLocaleString("en-US")}
                  </span>
                </div>
                <div className={styles.reportFig}>
                  <span className={styles.reportFigLabel}>Sell-through</span>
                  <span className={`${styles.reportFigValue} num`}>
                    {Math.round(report.sellThroughPct)}%
                  </span>
                </div>
              </div>

              {/* THE ROYALTY BLOCK. The only part of this artefact a
                  licensor reads twice, so it is set apart. */}
              <div className={styles.royalty}>
                <h4 className={styles.royaltyTitle}>Royalty position</h4>
                <dl className={styles.royaltyList}>
                  <div className={styles.royaltyRow}>
                    <dt>Net sales in period</dt>
                    <dd>
                      <span className="num">
                        {formatMoney(report.netSalesCents)}
                      </span>
                      <ProvenanceBadge provenance="illustrative" compact />
                    </dd>
                  </div>
                  <div className={styles.royaltyRow}>
                    <dt>Royalty rate</dt>
                    <dd>
                      {report.royaltyRatePct === null ? (
                        <span className={styles.noRate}>
                          <span aria-hidden="true">○</span> No rate on record.
                          No agreement schedules this property.
                        </span>
                      ) : (
                        <>
                          <span className="num">
                            {report.royaltyRatePct}%
                          </span>
                          <span className={styles.royaltySub}>
                            of net sales, per{" "}
                            {report.contract?.title ?? "the agreement"}
                          </span>
                        </>
                      )}
                    </dd>
                  </div>
                  <div className={styles.royaltyRow}>
                    <dt>Royalty earned this period</dt>
                    <dd>
                      {report.royaltyDueCents === null ? (
                        <span className={styles.noRate}>
                          <span aria-hidden="true">○</span> Not computable
                          without a rate. Not estimated.
                        </span>
                      ) : (
                        <>
                          <strong className={`${styles.royaltyBig} num`}>
                            {formatMoney(report.royaltyDueCents)}
                          </strong>
                          <ProvenanceBadge provenance="modeled" compact />
                          <span className={styles.royaltySub}>
                            Modeled on retail net sales, which is this app's
                            stated assumption about the royalty base.
                          </span>
                        </>
                      )}
                    </dd>
                  </div>
                  <div className={styles.royaltyRow}>
                    <dt>Minimum guarantee</dt>
                    <dd>
                      {report.minimumGuaranteeCents === null ? (
                        <span className={styles.noRate}>
                          <span aria-hidden="true">○</span> None on record
                        </span>
                      ) : (
                        <>
                          <span className="num">
                            {formatMoney(report.minimumGuaranteeCents)}
                          </span>
                          {report.belowGuarantee ? (
                            <span className={styles.below}>
                              <span aria-hidden="true">✕</span> Earned royalty
                              is below the guarantee. The guarantee is the
                              payable figure.
                            </span>
                          ) : (
                            <span className={styles.royaltySub}>
                              Earned royalty has cleared the guarantee.
                            </span>
                          )}
                        </>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              <h4 className={styles.reportSubhead}>Line detail</h4>
              <div className={styles.tableWrap}>
                <table className={styles.reportTable}>
                  <caption className="visually-hidden">
                    Every line carrying this property in this period, with the
                    prior period beside it.
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Line</th>
                      <th scope="col" className={styles.numCol}>
                        Received
                      </th>
                      <th scope="col" className={styles.numCol}>
                        Sold
                      </th>
                      <th scope="col" className={styles.numCol}>
                        Closing
                      </th>
                      <th scope="col" className={styles.numCol}>
                        Net sales
                      </th>
                      <th scope="col" className={styles.numCol}>
                        Sell-through
                      </th>
                      <th scope="col" className={styles.numCol}>
                        Prior period
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.rows.map((r) => {
                      const prior = priorPeriodId
                        ? priorPeriodRow(r, priorPeriodId)
                        : null;
                      const delta =
                        prior === null
                          ? null
                          : Math.round(
                              r.sellThroughPct - prior.sellThroughPct,
                            );
                      return (
                        <tr key={r.line.id}>
                          <th scope="row" className={styles.lineCell}>
                            {r.line.name}
                          </th>
                          <td className={styles.numCol} data-label="Received">
                            <span className="num">
                              {r.line.unitsIn.toLocaleString("en-US")}
                            </span>
                          </td>
                          <td className={styles.numCol} data-label="Sold">
                            <span className="num">
                              {r.line.unitsOut.toLocaleString("en-US")}
                            </span>
                          </td>
                          <td className={styles.numCol} data-label="Closing">
                            <span className="num">
                              {r.line.unitsOnHand.toLocaleString("en-US")}
                            </span>
                          </td>
                          <td className={styles.numCol} data-label="Net sales">
                            <span className="num">
                              {formatMoney(r.revenueCents)}
                            </span>
                          </td>
                          <td
                            className={styles.numCol}
                            data-label="Sell-through"
                          >
                            <span className="num">
                              {Math.round(r.sellThroughPct)}%
                            </span>
                          </td>
                          <td
                            className={styles.numCol}
                            data-label="Against prior period"
                          >
                            {delta === null ? (
                              <span className={styles.given}>
                                No prior period
                              </span>
                            ) : (
                              <span
                                className={
                                  delta >= 0 ? styles.deltaUp : styles.deltaDown
                                }
                              >
                                <span aria-hidden="true">
                                  {delta >= 0 ? "▲" : "▼"}
                                </span>{" "}
                                <span className="num">
                                  {delta >= 0 ? "+" : ""}
                                  {delta}
                                </span>{" "}
                                pts
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
                        <span className="num">
                          {report.unitsIn.toLocaleString("en-US")}
                        </span>
                      </td>
                      <td className={styles.numCol}>
                        <span className="num">
                          {report.unitsOut.toLocaleString("en-US")}
                        </span>
                      </td>
                      <td className={styles.numCol}>
                        <span className="num">
                          {report.unitsOnHand.toLocaleString("en-US")}
                        </span>
                      </td>
                      <td className={styles.numCol}>
                        <span className="num">
                          {formatMoney(report.netSalesCents)}
                        </span>
                      </td>
                      <td className={styles.numCol}>
                        <span className="num">
                          {Math.round(report.sellThroughPct)}%
                        </span>
                      </td>
                      <td className={styles.numCol} />
                    </tr>
                  </tfoot>
                </table>
              </div>

              <footer className={styles.reportFoot}>
                <p>
                  Property named on{" "}
                  <a
                    className={styles.link}
                    href={report.licence.source}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {report.licence.source}
                  </a>
                  , read 13 August 2026{" "}
                  <ProvenanceBadge provenance="public" compact />. Every unit
                  and dollar figure on this statement is invented for the
                  prototype{" "}
                  <ProvenanceBadge provenance="illustrative" compact />.
                </p>
                <p>
                  Formulas on <Link to="/method">method</Link>. Terms and
                  guarantees on <Link to="/spend">budget</Link>.
                </p>
              </footer>
            </article>
          ) : (
            <p className={styles.empty} role="status">
              <span aria-hidden="true">○</span> No product carries this
              property in this period.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
