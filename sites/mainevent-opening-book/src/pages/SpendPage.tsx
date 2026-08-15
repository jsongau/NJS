import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { InvoiceState, PoState } from "@/domain/licensing";
import {
  INVOICE_STATE,
  INVOICE_STATE_ORDER,
  PO_STATE,
  PO_STATE_ORDER,
  RENEWAL_KIND,
  formatDate,
  formatMoney,
} from "@/domain/licensing";
import { SPEND_AS_OF, SPEND_PERIOD } from "@/data/spend";
import {
  AGE_BUCKET_META,
  AGE_BUCKET_ORDER,
  ageingTotals,
  budgetRows,
  budgetTotals,
  contractRows,
  invoiceRows,
  nextRenewal,
  poRows,
  type AgeBucket,
} from "@/domain/selectors/spend";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import {
  Bar,
  FilterChip,
  SectionHead,
  Stat,
  StatStrip,
  TokenMark,
} from "@/components/licensing/Panels";
import styles from "./SpendPage.module.css";

/**
 * BUDGET, COMMITTED, ACTUAL, AND THE THREE EXCEPTIONS.
 *
 * The third sentence under "Vendor, Licensor & Budget Management" on the
 * Round1 posting: "Manage budgets, purchase orders, and invoices to
 * ensure cost control and compliance with contract terms."
 *
 * ── THE SCREEN ANSWERS THREE QUESTIONS AND OPENS WITH THEM ────────
 * A manager does not open a spend screen to read a ledger. They open it
 * to find out three things, and they are the three things at the top:
 *
 *   WHAT IS OVER BUDGET. Not what has been spent. Over, including money
 *   promised on a purchase order that nobody has been invoiced for yet,
 *   because that is the money that is still recoverable.
 *
 *   WHAT IS PAST DUE. Aged from the DUE date rather than the issue date,
 *   because terms are the entire reason a due date exists and an invoice
 *   on sixty day terms is not late on day thirty one.
 *
 *   WHAT RENEWS NEXT. And specifically, the date notice has to be served
 *   by, which appears on no contract as a field and is the only date that
 *   matters on an auto-renewing agreement.
 *
 * Everything below those three is the evidence for them, in the order the
 * money hardens: budget, then orders, then invoices, then the terms all
 * of it was agreed under.
 *
 * ── ONE THING THIS PAGE DELIBERATELY DOES NOT DO ──────────────────
 * It does not total the promotional spend with anything on /book. Booked
 * event revenue and outbound hours are two ledgers that are never summed,
 * and merchandise money is a third. This page shows costs; /promo shows
 * the merchandise revenue those costs produced; /book shows event revenue
 * and touches neither.
 */

const NOW = SPEND_AS_OF;

type PoFilter = PoState | "all";
type InvoiceFilter = InvoiceState | "all";
type AgeFilter = AgeBucket | "all";

export function SpendPage() {
  const [poFilter, setPoFilter] = useState<PoFilter>("all");
  const [invFilter, setInvFilter] = useState<InvoiceFilter>("all");
  const [ageFilter, setAgeFilter] = useState<AgeFilter>("all");

  const budgets = useMemo(() => budgetRows(), []);
  const bTotals = useMemo(() => budgetTotals(budgets), [budgets]);
  const orders = useMemo(() => poRows(NOW), []);
  const invoices = useMemo(() => invoiceRows(NOW), []);
  const ageing = useMemo(() => ageingTotals(invoices), [invoices]);
  const contracts = useMemo(() => contractRows(NOW), []);
  const next = useMemo(() => nextRenewal(contracts), [contracts]);

  const poCounts = useMemo(() => {
    const out = {
      draft: 0,
      approved: 0,
      issued: 0,
      "part-received": 0,
      received: 0,
      cancelled: 0,
    } satisfies Record<PoState, number>;
    for (const r of orders) out[r.po.state] += 1;
    return out;
  }, [orders]);

  const invCounts = useMemo(() => {
    const out = {
      received: 0,
      approved: 0,
      paid: 0,
      disputed: 0,
    } satisfies Record<InvoiceState, number>;
    for (const r of invoices) out[r.invoice.state] += 1;
    return out;
  }, [invoices]);

  const lateOrders = orders.filter((r) => r.late).length;

  const visibleOrders = useMemo(
    () =>
      poFilter === "all" ? orders : orders.filter((r) => r.po.state === poFilter),
    [orders, poFilter],
  );

  const visibleInvoices = useMemo(
    () =>
      invoices.filter((r) => {
        if (invFilter !== "all" && r.invoice.state !== invFilter) return false;
        if (ageFilter !== "all" && r.bucket !== ageFilter) return false;
        return true;
      }),
    [invoices, invFilter, ageFilter],
  );

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>
            {SPEND_PERIOD.label}, as at {formatDate(NOW)}
          </p>
          <h1 className={styles.h1}>Budget</h1>

          <blockquote className={styles.posting}>
            <p>
              "Manage budgets, purchase orders, and invoices to ensure cost
              control and compliance with contract terms."
            </p>
            <cite>
              Round1, Cerritos. New Business Development Promotion Planner
              Manager
            </cite>
          </blockquote>

          <p className={styles.framing}>
            <span aria-hidden="true" className={styles.framingGlyph}>
              ◇
            </span>
            <span>
              Every figure on this screen is invented for the prototype. No
              budget, rate or term here comes from any published source.
            </span>
          </p>
        </header>

        {/* ===========================================================
            THE THREE EXCEPTIONS
            =========================================================== */}
        <section className={styles.exceptions} aria-label="What needs attention">
          <div className={styles.exception}>
            <p className={styles.exLabel}>Over budget</p>
            <p className={styles.exValue} aria-live="polite">
              <span aria-hidden="true" className={styles.exGlyphRisk}>
                {bTotals.linesOver > 0 ? "✕" : "●"}
              </span>
              <span className="num">{bTotals.linesOver}</span>
              <span className={styles.exUnit}>
                {bTotals.linesOver === 1 ? "line" : "lines"}
              </span>
            </p>
            <p className={styles.exNote}>
              {bTotals.linesOver > 0
                ? budgets
                    .filter((b) => b.overByCents > 0)
                    .map(
                      (b) => `${b.line.label}, over by ${formatMoney(b.overByCents)}`,
                    )
                    .join(". ")
                : "Every line inside its ceiling, committed money included."}
            </p>
          </div>

          <div className={styles.exception}>
            <p className={styles.exLabel}>Past due</p>
            <p className={styles.exValue} aria-live="polite">
              <span aria-hidden="true" className={styles.exGlyphWarn}>
                {ageing.pastDueCount > 0 ? "◑" : "●"}
              </span>
              <span className="num">{ageing.pastDueCount}</span>
              <span className={styles.exUnit}>
                {ageing.pastDueCount === 1 ? "invoice" : "invoices"}
              </span>
            </p>
            <p className={styles.exNote}>
              <span className="num">{formatMoney(ageing.pastDueCents)}</span>{" "}
              owed past its terms.{" "}
              {ageing.disputedCount > 0
                ? `${ageing.disputedCount} of these is disputed and ages anyway.`
                : "None disputed."}
            </p>
          </div>

          <div className={styles.exception}>
            <p className={styles.exLabel}>Renews next</p>
            {next ? (
              <>
                <p className={styles.exValue}>
                  <span
                    aria-hidden="true"
                    className={
                      next.noticeUrgent ? styles.exGlyphRisk : styles.exGlyphOk
                    }
                  >
                    {next.noticeUrgent ? "✕" : "◇"}
                  </span>
                  <span className="num">{next.daysToEnd}</span>
                  <span className={styles.exUnit}>days</span>
                </p>
                <p className={styles.exNote}>
                  {next.contract.title}. Ends{" "}
                  {formatDate(next.contract.endsOn)}. Notice by{" "}
                  <strong>{formatDate(next.noticeByIso)}</strong>, which is{" "}
                  <span className="num">{next.daysToNotice}</span> days away.
                </p>
              </>
            ) : (
              <p className={styles.exNote}>No live agreement on the register.</p>
            )}
          </div>
        </section>

        <StatStrip label="The programme at a glance">
          <Stat
            value={formatMoney(bTotals.budgetCents)}
            label="Budget"
            note="The ceiling across all eight lines for the 2026 promotional programme."
            provenance="illustrative"
          />
          <Stat
            value={formatMoney(bTotals.committedCents)}
            label="Committed"
            note="Promised and not yet paid. Unpaid invoices plus the uninvoiced part of every open purchase order."
            provenance="modeled"
            tone="var(--warn)"
          />
          <Stat
            value={formatMoney(bTotals.actualCents)}
            label="Actual"
            note="Invoices actually paid. The only figure here that has left the bank."
            provenance="modeled"
            tone="var(--ok)"
          />
          <Stat
            value={formatMoney(bTotals.remainingCents)}
            label="Remaining"
            note="Budget less committed less actual. Negative on a line means it is over before anything else is ordered."
            provenance="modeled"
          />
          <Stat
            value={lateOrders}
            label="Orders past their date"
            note="Issued or part received, and past the date the goods were expected."
            provenance="modeled"
            tone="var(--risk)"
            live
          />
          <Stat
            value={ageing.unmatchedCount}
            label="Invoices with no order"
            note="Arrived with no purchase order behind them. Visible only because the budget line is coded on the invoice."
            provenance="illustrative"
            tone="var(--warn)"
          />
        </StatStrip>

        {/* ===========================================================
            1. BUDGET
            =========================================================== */}
        <section className={styles.section} aria-labelledby="budget-h">
          <SectionHead
            eyebrow="One"
            id="budget-h"
            title="Budget against committed against actual"
            lede="Tightest line first. Committed is money a manager can still act on; actual is money that has gone."
            meta={
              <>
                <ProvenanceBadge provenance="modeled" compact />
                <span>
                  Actual is paid invoices. Committed is unpaid invoices plus
                  the uninvoiced part of open orders. Draft and cancelled
                  orders commit nothing.
                </span>
              </>
            }
          />

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className="visually-hidden">
                Each budget line with its ceiling, committed money, actual
                spend and what is left.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Line</th>
                  <th scope="col" className={styles.numCol}>
                    Budget
                  </th>
                  <th scope="col" className={styles.numCol}>
                    Committed
                  </th>
                  <th scope="col" className={styles.numCol}>
                    Actual
                  </th>
                  <th scope="col" className={styles.numCol}>
                    Remaining
                  </th>
                  <th scope="col" className={styles.wideCol}>
                    Used
                  </th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((b) => (
                  <tr
                    key={b.line.id}
                    className={b.overByCents > 0 ? styles.overRow : undefined}
                  >
                    <th scope="row" className={styles.lineCell}>
                      <span className={styles.lineName}>{b.line.label}</span>
                      <span className={styles.lineMeta}>
                        {b.line.category}
                        {" · "}
                        <span className="num">{b.poCount}</span> orders
                        {" · "}
                        <span className="num">{b.invoiceCount}</span> invoices
                      </span>
                    </th>
                    <td className={styles.numCol} data-label="Budget">
                      <span className="num">
                        {formatMoney(b.budgetCents)}
                      </span>
                    </td>
                    <td className={styles.numCol} data-label="Committed">
                      <span className="num">
                        {formatMoney(b.committedCents)}
                      </span>
                    </td>
                    <td className={styles.numCol} data-label="Actual">
                      <span className="num">
                        {formatMoney(b.actualCents)}
                      </span>
                    </td>
                    <td className={styles.numCol} data-label="Remaining">
                      {b.overByCents > 0 ? (
                        <span className={styles.over}>
                          <span aria-hidden="true">✕</span> Over by{" "}
                          <span className="num">
                            {formatMoney(b.overByCents)}
                          </span>
                        </span>
                      ) : (
                        <span className="num">
                          {formatMoney(b.remainingCents)}
                        </span>
                      )}
                    </td>
                    <td className={styles.wideCol} data-label="Used">
                      <Bar
                        pct={b.usedPct}
                        value={`${Math.round(b.usedPct)}%`}
                        label={`${b.line.label} used against budget`}
                        over={b.overByCents > 0}
                        tone={
                          b.overByCents > 0
                            ? "var(--risk)"
                            : b.usedPct >= 85
                              ? "var(--warn)"
                              : "var(--ok)"
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row">All lines</th>
                  <td className={styles.numCol}>
                    <span className="num">
                      {formatMoney(bTotals.budgetCents)}
                    </span>
                  </td>
                  <td className={styles.numCol}>
                    <span className="num">
                      {formatMoney(bTotals.committedCents)}
                    </span>
                  </td>
                  <td className={styles.numCol}>
                    <span className="num">
                      {formatMoney(bTotals.actualCents)}
                    </span>
                  </td>
                  <td className={styles.numCol}>
                    <span className="num">
                      {formatMoney(bTotals.remainingCents)}
                    </span>
                  </td>
                  <td className={styles.wideCol} />
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* ===========================================================
            2. PURCHASE ORDERS
            =========================================================== */}
        <section className={styles.section} aria-labelledby="po-h">
          <SectionHead
            eyebrow="Two"
            id="po-h"
            title="Purchase orders"
            lede="Late first, then by how soon the goods are due."
          />

          <div className={styles.filterRow} role="group" aria-label="Order state">
            <FilterChip
              token={{
                glyph: "▣",
                label: "All orders",
                cssVar: "var(--text-2)",
                note: "Every purchase order on the programme.",
              }}
              count={orders.length}
              pressed={poFilter === "all"}
              onClick={() => setPoFilter("all")}
            />
            {PO_STATE_ORDER.map((s) => (
              <FilterChip
                key={s}
                token={PO_STATE[s]}
                count={poCounts[s]}
                pressed={poFilter === s}
                onClick={() => setPoFilter(poFilter === s ? "all" : s)}
              />
            ))}
          </div>

          <p className={styles.shown} aria-live="polite">
            <strong className="num">{visibleOrders.length}</strong> of{" "}
            <span className="num">{orders.length}</span> orders shown
          </p>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className="visually-hidden">
                Every purchase order with its supplier, budget line, state,
                value and expected date.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Reference</th>
                  <th scope="col">Supplier</th>
                  <th scope="col">For</th>
                  <th scope="col">State</th>
                  <th scope="col" className={styles.numCol}>
                    Value
                  </th>
                  <th scope="col" className={styles.numCol}>
                    Uninvoiced
                  </th>
                  <th scope="col">Expected</th>
                </tr>
              </thead>
              <tbody>
                {visibleOrders.map((r) => (
                  <tr key={r.po.id} className={r.late ? styles.overRow : undefined}>
                    <th scope="row" className={styles.refCell}>
                      {r.po.reference}
                    </th>
                    <td data-label="Supplier">{r.partner?.name ?? "Unknown"}</td>
                    <td data-label="For">
                      <span className={styles.forText}>{r.po.description}</span>
                      <span className={styles.lineMeta}>
                        {r.budgetLine?.label ?? "No budget line"}
                      </span>
                    </td>
                    <td data-label="State">
                      <TokenMark token={PO_STATE[r.po.state]} small />
                    </td>
                    <td className={styles.numCol} data-label="Value">
                      <span className="num">
                        {formatMoney(r.po.amountCents)}
                      </span>
                    </td>
                    <td className={styles.numCol} data-label="Uninvoiced">
                      <span className="num">
                        {formatMoney(r.uninvoicedCents)}
                      </span>
                    </td>
                    <td data-label="Expected">
                      <span className={styles.dateText}>
                        {formatDate(r.po.expectedOn)}
                      </span>
                      {r.late ? (
                        <span className={styles.over}>
                          <span aria-hidden="true">✕</span>{" "}
                          <span className="num">
                            {Math.abs(r.daysToExpected)}
                          </span>{" "}
                          days late
                        </span>
                      ) : (
                        <span className={styles.lineMeta}>
                          <span className="num">{r.daysToExpected}</span> days
                          away
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ===========================================================
            3. INVOICES AND AGEING
            =========================================================== */}
        <section className={styles.section} aria-labelledby="inv-h">
          <SectionHead
            eyebrow="Three"
            id="inv-h"
            title="Invoices and ageing"
            lede="Aged from the due date, not the issue date, because terms are the reason a due date exists."
          />

          <div className={styles.ageStrip}>
            {AGE_BUCKET_ORDER.map((b) => {
              const cell = ageing.byBucket[b];
              const meta = AGE_BUCKET_META[b];
              return (
                <button
                  key={b}
                  type="button"
                  className={
                    ageFilter === b
                      ? `${styles.ageCell} ${styles.ageCellOn}`
                      : styles.ageCell
                  }
                  style={{ ["--tone" as string]: meta.cssVar }}
                  aria-pressed={ageFilter === b}
                  title={meta.note}
                  onClick={() => setAgeFilter(ageFilter === b ? "all" : b)}
                >
                  <span className={styles.ageHead}>
                    <span aria-hidden="true" className={styles.ageGlyph}>
                      {meta.glyph}
                    </span>
                    <span className={styles.ageLabel}>{meta.label}</span>
                  </span>
                  <span className={`${styles.ageCount} num`}>{cell.count}</span>
                  <span className={`${styles.ageMoney} num`}>
                    {formatMoney(cell.cents)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className={styles.filterRow} role="group" aria-label="Invoice state">
            <FilterChip
              token={{
                glyph: "▣",
                label: "All invoices",
                cssVar: "var(--text-2)",
                note: "Every invoice on the programme.",
              }}
              count={invoices.length}
              pressed={invFilter === "all"}
              onClick={() => setInvFilter("all")}
            />
            {INVOICE_STATE_ORDER.map((s) => (
              <FilterChip
                key={s}
                token={INVOICE_STATE[s]}
                count={invCounts[s]}
                pressed={invFilter === s}
                onClick={() => setInvFilter(invFilter === s ? "all" : s)}
              />
            ))}
          </div>

          <p className={styles.shown} aria-live="polite">
            <strong className="num">{visibleInvoices.length}</strong> of{" "}
            <span className="num">{invoices.length}</span> invoices shown
          </p>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className="visually-hidden">
                Every invoice with its supplier, order, value, state and how
                far past its due date it is.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Reference</th>
                  <th scope="col">Supplier</th>
                  <th scope="col">Order</th>
                  <th scope="col" className={styles.numCol}>
                    Value
                  </th>
                  <th scope="col">State</th>
                  <th scope="col">Due</th>
                  <th scope="col">Ageing</th>
                </tr>
              </thead>
              <tbody>
                {visibleInvoices.map((r) => (
                  <tr
                    key={r.invoice.id}
                    className={
                      r.bucket === "d60-plus" || r.invoice.state === "disputed"
                        ? styles.overRow
                        : undefined
                    }
                  >
                    <th scope="row" className={styles.refCell}>
                      {r.invoice.reference}
                      <span className={styles.lineMeta}>
                        {r.budgetLine?.label ?? "No budget line"}
                      </span>
                    </th>
                    <td data-label="Supplier">{r.partner?.name ?? "Unknown"}</td>
                    <td data-label="Order">
                      {r.po ? (
                        r.po.reference
                      ) : (
                        <span className={styles.unmatched}>
                          <span aria-hidden="true">◘</span> No order
                        </span>
                      )}
                      {r.mismatch ? (
                        <span className={styles.over}>
                          <span aria-hidden="true">✕</span> Value differs from
                          the order
                        </span>
                      ) : null}
                    </td>
                    <td className={styles.numCol} data-label="Value">
                      <span className="num">
                        {formatMoney(r.invoice.amountCents)}
                      </span>
                    </td>
                    <td data-label="State">
                      <TokenMark token={INVOICE_STATE[r.invoice.state]} small />
                    </td>
                    <td data-label="Due">
                      <span className={styles.dateText}>
                        {formatDate(r.invoice.dueOn)}
                      </span>
                      {r.invoice.paidOn ? (
                        <span className={styles.lineMeta}>
                          paid {formatDate(r.invoice.paidOn)}
                        </span>
                      ) : null}
                    </td>
                    <td data-label="Ageing">
                      <TokenMark token={AGE_BUCKET_META[r.bucket]} small />
                      {r.bucket !== "settled" && r.bucket !== "not-due" ? (
                        <span className={styles.over}>
                          <span className="num">{r.daysPastDue}</span> days past
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {visibleInvoices.length === 0 ? (
            <p className={styles.empty} role="status">
              <span aria-hidden="true">○</span> No invoice matches these
              filters.
            </p>
          ) : null}
        </section>

        {/* ===========================================================
            4. CONTRACT TERMS
            =========================================================== */}
        <section className={styles.section} aria-labelledby="terms-h">
          <SectionHead
            eyebrow="Four"
            id="terms-h"
            title="Contract terms"
            lede="Soonest to fall due first. The notice date is derived from the end date and the notice period, and it is the date that actually decides anything."
          />

          <ul className={styles.contracts}>
            {contracts.map((c) => (
              <li
                key={c.contract.id}
                className={
                  c.noticeUrgent
                    ? `${styles.contract} ${styles.contractUrgent}`
                    : styles.contract
                }
              >
                <div className={styles.contractHead}>
                  <h3 className={styles.contractTitle}>{c.contract.title}</h3>
                  <TokenMark token={RENEWAL_KIND[c.contract.renewal]} />
                  <ProvenanceBadge
                    provenance={c.contract.provenance}
                    compact
                  />
                </div>

                <p className={styles.contractParty}>
                  {c.partner?.name ?? "Unknown counterparty"}
                  {c.contract.licenceIds.length > 0
                    ? `. Schedules ${c.contract.licenceIds.length} properties.`
                    : ". Supply only, no licensed property."}
                </p>

                <dl className={styles.terms}>
                  <div className={styles.term}>
                    <dt>Term</dt>
                    <dd>
                      {formatDate(c.contract.startsOn)} to{" "}
                      {formatDate(c.contract.endsOn)}
                      <span className={styles.termSub}>
                        <span className="num">{c.daysToEnd}</span> days left
                      </span>
                    </dd>
                  </div>
                  <div className={styles.term}>
                    <dt>Minimum guarantee</dt>
                    <dd>
                      {c.contract.minimumGuaranteeCents > 0 ? (
                        <span className="num">
                          {formatMoney(c.contract.minimumGuaranteeCents)}
                        </span>
                      ) : (
                        <span className={styles.termNone}>None</span>
                      )}
                    </dd>
                  </div>
                  <div className={styles.term}>
                    <dt>Royalty rate</dt>
                    <dd>
                      {c.contract.royaltyRatePct > 0 ? (
                        <>
                          <span className="num">
                            {c.contract.royaltyRatePct}%
                          </span>
                          <span className={styles.termSub}>of net sales</span>
                        </>
                      ) : (
                        <span className={styles.termNone}>None</span>
                      )}
                    </dd>
                  </div>
                  <div className={styles.term}>
                    <dt>Payment terms</dt>
                    <dd>
                      <span className="num">
                        {c.contract.paymentTermsDays}
                      </span>{" "}
                      days
                    </dd>
                  </div>
                  <div className={styles.term}>
                    <dt>Notice period</dt>
                    <dd>
                      {c.contract.noticePeriodDays > 0 ? (
                        <>
                          <span className="num">
                            {c.contract.noticePeriodDays}
                          </span>{" "}
                          days
                        </>
                      ) : (
                        <span className={styles.termNone}>None</span>
                      )}
                    </dd>
                  </div>
                  <div className={styles.term}>
                    <dt>Notice by</dt>
                    <dd>
                      <strong>{formatDate(c.noticeByIso)}</strong>
                      <span
                        className={
                          c.noticeUrgent ? styles.termUrgent : styles.termSub
                        }
                      >
                        {c.noticeUrgent ? (
                          <>
                            <span aria-hidden="true">✕</span>{" "}
                          </>
                        ) : null}
                        <span className="num">{c.daysToNotice}</span> days away
                      </span>
                    </dd>
                  </div>
                </dl>

                {c.contract.note ? (
                  <p className={styles.contractNote}>
                    <span aria-hidden="true">◆</span> {c.contract.note}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>

          <p className={styles.sectionFoot}>
            Relationships behind these agreements are on{" "}
            <Link to="/partners">partners</Link>. What the money bought is on{" "}
            <Link to="/promo">promo stock</Link>. Formulas are on{" "}
            <Link to="/method">method</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
