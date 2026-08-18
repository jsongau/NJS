import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { InvoiceState, PoState } from "@/domain/licensing";
import {
  INVOICE_STATE,
  INVOICE_STATE_ORDER,
  PO_STATE,
  PO_STATE_ORDER,
  RENEWAL_KIND,
  daysBetween,
  formatDate,
  formatMoney,
} from "@/domain/licensing";
import type {
  MatchGrade,
  OrderControl,
  OrderStage,
  TermCheckId,
} from "@/data/spend";
import {
  CONTRACTS,
  JUDGEMENT_TERMS,
  MATCH_GRADE,
  MATCH_GRADE_ORDER,
  MECHANICAL_TERM_CHECKS,
  ORDER_CONTROL,
  ORDER_STAGE,
  ORDER_STAGE_ORDER,
  SPEND_AS_OF,
  SPEND_PERIOD,
} from "@/data/spend";
import { LICENCE_BY_ID } from "@/data/partners";
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
  type InvoiceRow,
  type PoRow,
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
 * DIME posting: "Manage budgets, purchase orders, and invoices to
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
 *
 * ── AND FOUR SECTIONS THAT ARE NOT ABOUT MONEY AT ALL ─────────────
 * Sections one to four answer the finance question. They cannot answer
 * the buying one, and the same posting asks for that in three more
 * sentences: "Evaluate product quality, pricing, and supplier reliability
 * before purchase", "Negotiate costs, terms, and delivery schedules with
 * vendors and licensors", and the compliance half of the sentence quoted
 * at the top of this page.
 *
 * Five, six, seven and eight are those. Where the goods physically are,
 * as against where the money is. The three-way match, which is the only
 * control that catches a supplier billing for what never arrived. The
 * terms that can be checked by arithmetic and the terms that cannot,
 * listed separately and named. And a supplier record measured rather
 * than asserted, with every rate printing what it was divided by.
 *
 * ── WHY THE DERIVATIONS SIT IN THIS FILE ──────────────────────────
 * Everything below is derived at render from `data/spend.ts`, and none of
 * it is stored. It lives beside its only consumer rather than in
 * `domain/selectors/spend.ts` because exactly one surface reads it; the
 * moment a second one does, it moves there whole. What it does NOT do is
 * duplicate anything that selector already derives: the purchase order
 * rows, the invoice rows and the ageing all come from there, and this
 * file only adds the columns a buyer brings.
 */

const NOW = SPEND_AS_OF;

type PoFilter = PoState | "all";
type InvoiceFilter = InvoiceState | "all";
type AgeFilter = AgeBucket | "all";
type GradeFilter = MatchGrade | "all";

/* ---------------------------------------------------------------
   Where the goods are
   --------------------------------------------------------------- */

/**
 * How far a single milestone got. Three values rather than two, because
 * a delivery of half an order is neither reached nor unreached, and
 * rounding it either way loses the one fact worth knowing about it.
 */
type Reach = "none" | "part" | "full";

interface MatchRow {
  control: OrderControl;
  order: PoRow;
  /** Public. The only published fact on the row and it is only a name. */
  licenceName: string | null;
  reached: Record<OrderStage, Reach>;
  /** The furthest milestone reached, for the word beside the rail. */
  stage: OrderStage;
  orderedValueCents: number;
  billedValueCents: number | null;
  /** Ordered less received, where a receipt exists and fell short. */
  shortUnits: number;
  /** Received less ordered, where more turned up than was asked for. */
  overUnits: number;
  /** Billed less received, treating a missing receipt as nothing received. */
  billedAheadUnits: number;
  noReceipt: boolean;
  priceVarianceCents: number;
  priceVarianceTotalCents: number;
  /** Promised later than the order asked for. Zero where it was not. */
  promiseSlipDays: number;
  /** Raised to promised. Modeled, because nobody here publishes one. */
  leadDays: number | null;
  /** Received later than promised. Null where one of the two is missing. */
  daysLate: number | null;
  /** Past its promise with nothing landed. Null where that is not so. */
  daysPastPromise: number | null;
  closed: boolean;
  grade: MatchGrade;
  reading: string;
}

/**
 * The seven milestones, each judged on its own evidence.
 *
 * THE RAIL IS NOT A PROGRESS BAR AND MUST NOT BECOME ONE. A progress bar
 * fills from the left, so it would draw an order that was invoiced
 * before it shipped as though it had shipped. The whole finding on that
 * row is the hole in the middle, and a monotonic fill is precisely the
 * component that would hide it.
 */
function reachOf(c: OrderControl, order: PoRow): Record<OrderStage, Reach> {
  const invoiced = order.invoices.length > 0;
  const allPaid = invoiced && order.invoices.every((i) => i.state === "paid");
  const received =
    c.receivedQty === null
      ? "none"
      : c.receivedQty >= c.orderedQty
        ? "full"
        : "part";
  return {
    raised: "full",
    acknowledged: c.acknowledgedOn ? "full" : "none",
    "in-production": c.productionFromOn ? "full" : "none",
    shipped: c.shippedOn ? "full" : "none",
    received,
    invoiced: invoiced ? "full" : "none",
    paid: allPaid ? "full" : "none",
  };
}

/**
 * The grade, in the order a buyer would triage the morning.
 *
 * A FAILURE NEEDS TWO THINGS: the documents disagree AND the money is
 * moving, meaning an invoice against the order is approved for payment or
 * already paid. The same disagreement on an invoice still sitting in
 * received is a query, because it is still catchable. Grading on the
 * disagreement alone would have painted the two rows the same colour and
 * lost the difference between a problem and a loss.
 */
function gradeOf(row: {
  control: OrderControl;
  order: PoRow;
  shortUnits: number;
  overUnits: number;
  billedAheadUnits: number;
  noReceipt: boolean;
  priceVarianceCents: number;
  /**
   * A SHORTFALL ON AN OPEN ORDER IS NOT A SHORT DELIVERY. The rest of
   * the plush is due on 30 September and calling it short today would
   * put a supplier on the exception list for a date that has not come.
   * Only an order the buyer has closed can be short, which is why this
   * flag is an argument rather than a comparison inside the function.
   */
  closed: boolean;
}): MatchGrade {
  if (row.control.billedQty === null) return "open";

  const moneyMoving = row.order.invoices.some(
    (i) => i.state === "approved" || i.state === "paid",
  );
  const overBilled = !row.noReceipt && row.billedAheadUnits > 0;
  const priceOff = row.priceVarianceCents !== 0;

  if (overBilled || priceOff) return moneyMoving ? "fail" : "query";
  /* Billed with no goods receipt at all. In transit it is normal and
     unmatchable; not yet shipped it is a person's decision, and this
     register carries no field that records one. */
  if (row.noReceipt) return row.control.shippedOn ? "open" : "query";
  if (row.overUnits > 0 || (row.closed && row.shortUnits > 0)) return "query";
  return "matched";
}

function matchRows(orders: PoRow[], asOf: string): MatchRow[] {
  const byPo = new Map(orders.map((o) => [o.po.id, o]));

  const rows = ORDER_CONTROL.flatMap<MatchRow>((control) => {
    const order = byPo.get(control.poId);
    if (!order) return [];

    const receivedQty = control.receivedQty;
    const noReceipt = receivedQty === null;
    const shortUnits =
      receivedQty !== null && receivedQty < control.orderedQty
        ? control.orderedQty - receivedQty
        : 0;
    const overUnits =
      receivedQty !== null && receivedQty > control.orderedQty
        ? receivedQty - control.orderedQty
        : 0;
    const billedAheadUnits =
      control.billedQty === null
        ? 0
        : Math.max(0, control.billedQty - (receivedQty ?? 0));
    const priceVarianceCents =
      control.billedUnitCents === null
        ? 0
        : control.billedUnitCents - control.orderedUnitCents;

    const promiseSlipDays = control.promisedOn
      ? Math.max(0, daysBetween(order.po.expectedOn, control.promisedOn))
      : 0;
    const leadDays = control.promisedOn
      ? daysBetween(order.po.raisedOn, control.promisedOn)
      : null;
    const daysLate =
      control.promisedOn && control.receivedOn
        ? daysBetween(control.promisedOn, control.receivedOn)
        : null;
    const daysPastPromise =
      control.promisedOn && !control.receivedOn
        ? Math.max(0, daysBetween(control.promisedOn, asOf))
        : null;

    const closed = order.po.state === "received";
    const base = {
      control,
      order,
      shortUnits,
      overUnits,
      billedAheadUnits,
      noReceipt,
      priceVarianceCents,
      closed,
    };

    const findings: string[] = [];
    if (shortUnits > 0) {
      findings.push(
        closed
          ? `${shortUnits.toLocaleString("en-US")} ${control.unit} short of the order`
          : `${shortUnits.toLocaleString("en-US")} ${control.unit} still to come, and the order is still open`,
      );
    }
    if (overUnits > 0) {
      findings.push(
        `${overUnits.toLocaleString("en-US")} ${control.unit} more than ordered`,
      );
    }
    if (billedAheadUnits > 0) {
      findings.push(
        noReceipt
          ? `billed for all ${control.billedQty?.toLocaleString("en-US")} ${control.unit} with no goods receipt`
          : `billed for ${billedAheadUnits.toLocaleString("en-US")} ${control.unit} that did not arrive`,
      );
    }
    if (priceVarianceCents !== 0) {
      findings.push(
        `billed ${formatMoney(Math.abs(priceVarianceCents))} a ${control.unit.replace(/s$/, "")} ${priceVarianceCents > 0 ? "above" : "below"} the order`,
      );
    }
    if (control.billedQty === null) findings.push("nothing billed yet");

    const reached = reachOf(control, order);

    return [
      {
        ...base,
        licenceName: control.licenceId
          ? (LICENCE_BY_ID[control.licenceId]?.name ?? null)
          : null,
        reached,
        stage: furthestStage(reached),
        orderedValueCents: control.orderedQty * control.orderedUnitCents,
        billedValueCents:
          control.billedQty === null || control.billedUnitCents === null
            ? null
            : control.billedQty * control.billedUnitCents,
        priceVarianceTotalCents:
          control.billedQty === null
            ? 0
            : priceVarianceCents * control.billedQty,
        promiseSlipDays,
        leadDays,
        daysLate,
        daysPastPromise,
        grade: gradeOf(base),
        reading:
          findings.length > 0
            ? `${findings[0].charAt(0).toUpperCase()}${findings[0].slice(1)}${findings.length > 1 ? `, and ${findings.slice(1).join(", ")}` : ""}.`
            : "Order, receipt and invoice agree on quantity and on price.",
      },
    ];
  });

  /* Worst first, then the biggest money. A match desk in reference order
     is a filing cabinet; the only useful ordering is the order somebody
     would work it in. */
  rows.sort((a, b) => {
    const g =
      MATCH_GRADE_ORDER.indexOf(a.grade) - MATCH_GRADE_ORDER.indexOf(b.grade);
    if (g !== 0) return g;
    return b.orderedValueCents - a.orderedValueCents;
  });
  return rows;
}

function furthestStage(reached: Record<OrderStage, Reach>): OrderStage {
  let out: OrderStage = "raised";
  for (const s of ORDER_STAGE_ORDER) if (reached[s] === "full") out = s;
  return out;
}

/* ---------------------------------------------------------------
   Compliance with contract terms
   --------------------------------------------------------------- */

/**
 * PASS, FAIL, AND CANNOT CHECK.
 *
 * The third outcome is the one that earns this section. A screen with
 * two outcomes reports a supplier with no agreement on file as compliant,
 * because there was nothing to compare the invoice against and the loop
 * simply did not increment the failure counter. Three suppliers here are
 * in exactly that position and the page names them.
 */
interface CheckResult {
  id: TermCheckId;
  pass: number;
  fail: number;
  skip: number;
  /** Named, because a count with no reference is not actionable. */
  failures: string[];
  skipReason: string | null;
}

function contractFor(partnerId: string) {
  return CONTRACTS.find((c) => c.partnerId === partnerId) ?? null;
}

/**
 * A draft is detected from the title marker, because `Contract` carries
 * no executed flag and this file may not add one. That is a weakness and
 * it is written down rather than hidden: the day the type grows an
 * `executed` field, this reads that instead and the marker goes.
 */
function isDraft(title: string): boolean {
  return title.toUpperCase().includes("DRAFT");
}

function runChecks(rows: MatchRow[], invoices: InvoiceRow[]): CheckResult[] {
  const results: CheckResult[] = [];
  const add = (
    id: TermCheckId,
    pass: number,
    fail: number,
    skip: number,
    failures: string[],
    skipReason: string | null,
  ) => results.push({ id, pass, fail, skip, failures, skipReason });

  const billed = rows.filter((r) => r.control.billedQty !== null);
  const licensed = rows.filter((r) => r.control.licenceId !== null);
  const closed = rows.filter((r) => r.closed);
  const acknowledged = rows.filter((r) => r.control.promisedOn !== null);

  // 1. Order line multiplies out to the order header.
  const lineFails = rows.filter(
    (r) => r.orderedValueCents !== r.order.po.amountCents,
  );
  add(
    "line-vs-header",
    rows.length - lineFails.length,
    lineFails.length,
    0,
    lineFails.map((r) => r.order.po.reference),
    null,
  );

  // 2. Invoice header equals its own billed line.
  const totalFails = billed.filter(
    (r) => r.billedValueCents !== r.order.invoicedCents,
  );
  add(
    "invoice-total-vs-line",
    billed.length - totalFails.length,
    totalFails.length,
    rows.length - billed.length,
    totalFails.map((r) => r.order.po.reference),
    "No invoice has been raised against the order yet.",
  );

  // 3. Received equals ordered, on orders the buyer has closed.
  const qtyFails = closed.filter((r) => r.shortUnits > 0 || r.overUnits > 0);
  add(
    "received-vs-ordered",
    closed.length - qtyFails.length,
    qtyFails.length,
    rows.length - closed.length,
    qtyFails.map(
      (r) =>
        `${r.order.po.reference}, ${r.control.receivedQty?.toLocaleString("en-US")} of ${r.control.orderedQty.toLocaleString("en-US")} ${r.control.unit}`,
    ),
    "The order is still open, so a part delivery is not yet a short one.",
  );

  // 4. Nothing billed that has not arrived.
  const aheadFails = billed.filter((r) => r.billedAheadUnits > 0);
  add(
    "billed-vs-received",
    billed.length - aheadFails.length,
    aheadFails.length,
    rows.length - billed.length,
    aheadFails.map(
      (r) =>
        `${r.order.po.reference}, ${r.billedAheadUnits.toLocaleString("en-US")} ${r.control.unit} billed and not received`,
    ),
    "No invoice has been raised against the order yet.",
  );

  // 5. Billed at the ordered price.
  const priceFails = billed.filter((r) => r.priceVarianceCents !== 0);
  add(
    "price-vs-order",
    billed.length - priceFails.length,
    priceFails.length,
    rows.length - billed.length,
    priceFails.map(
      (r) =>
        `${r.order.po.reference}, ${formatMoney(Math.abs(r.priceVarianceTotalCents))} across the run`,
    ),
    "No invoice has been raised against the order yet.",
  );

  // 6. Due date against the payment terms on the agreement.
  let termsPass = 0;
  let termsSkip = 0;
  const termFails: string[] = [];
  const noAgreement = new Set<string>();
  for (const r of invoices) {
    const contract = contractFor(r.invoice.partnerId);
    if (!contract) {
      termsSkip += 1;
      noAgreement.add(r.partner?.name ?? r.invoice.partnerId);
      continue;
    }
    const days = daysBetween(r.invoice.issuedOn, r.invoice.dueOn);
    if (days === contract.paymentTermsDays) termsPass += 1;
    else {
      termFails.push(
        `${r.invoice.reference}, billed on ${days} days against the ${contract.paymentTermsDays} agreed`,
      );
    }
  }
  add(
    "terms-vs-agreement",
    termsPass,
    termFails.length,
    termsSkip,
    termFails,
    `No agreement is on the register for ${[...noAgreement].join(", ")}. Their invoices are being paid on terms nobody wrote down.`,
  );

  // 7. Promised no later than the date the order asked for.
  const slipFails = acknowledged.filter((r) => r.promiseSlipDays > 0);
  add(
    "promise-vs-request",
    acknowledged.length - slipFails.length,
    slipFails.length,
    rows.length - acknowledged.length,
    slipFails.map(
      (r) =>
        `${r.order.po.reference}, promised ${r.promiseSlipDays} days later than asked`,
    ),
    "The order has not been acknowledged, so no date has been promised.",
  );

  // 8. Supplier registered to carry the property.
  const carryFails = licensed.filter(
    (r) => !(r.order.partner?.licenceIds ?? []).includes(r.control.licenceId!),
  );
  add(
    "supplier-carries-licence",
    licensed.length - carryFails.length,
    carryFails.length,
    rows.length - licensed.length,
    carryFails.map(
      (r) =>
        `${r.order.po.reference}, ${r.order.partner?.name ?? "unknown supplier"} carries no licence on the register`,
    ),
    "The order carries no licensed property.",
  );

  // 9. Property covered by an executed schedule.
  const execFails = licensed.filter(
    (r) =>
      !CONTRACTS.some(
        (c) =>
          c.licenceIds.includes(r.control.licenceId!) && !isDraft(c.title),
      ),
  );
  add(
    "licence-executed",
    licensed.length - execFails.length,
    execFails.length,
    rows.length - licensed.length,
    execFails.map(
      (r) =>
        `${r.order.po.reference}, ${r.licenceName} is scheduled only on a draft`,
    ),
    "The order carries no licensed property.",
  );

  return results;
}

/* ---------------------------------------------------------------
   Supplier reliability
   --------------------------------------------------------------- */

interface SupplierRow {
  id: string;
  name: string;
  ordersOnDesk: number;
  /** Denominator for the delivery rates. Orders the buyer has closed. */
  closed: number;
  onTime: number;
  short: number;
  over: number;
  /** Denominator for the billing rates. Orders carrying an invoice. */
  billedLines: number;
  priceVariances: number;
  billedAhead: number;
  /** Denominator for the dispute rate. Every invoice from them. */
  invoiceCount: number;
  disputed: number;
  /** Open, promised, past the promise and nothing landed. */
  openPastPromise: number;
  concerns: number;
}

/**
 * ON-TIME IS MEASURED OVER CLOSED ORDERS ONLY, and that is the line worth
 * defending. Counting an order that has not arrived as not-yet-late is
 * right; counting it in the denominator as a miss would punish a supplier
 * for a date that has not come, and counting it as a hit would let a
 * supplier improve their score by never delivering at all. So the rate
 * runs over orders that finished, the count of orders sitting past their
 * promise is reported beside it as its own number, and neither is folded
 * into the other.
 *
 * A supplier with no closed order is NOT scored zero. Zero is a claim
 * about performance and the truthful statement is that there is nothing
 * to score yet. Every rate on this page prints its denominator for the
 * same reason: "one of one" and "eighty of eighty" are both a hundred per
 * cent and only one of them is worth anything in a negotiation.
 */
function supplierRows(rows: MatchRow[], invoices: InvoiceRow[]): SupplierRow[] {
  const out = new Map<string, SupplierRow>();

  for (const r of rows) {
    const id = r.order.po.partnerId;
    const seed: SupplierRow = out.get(id) ?? {
      id,
      name: r.order.partner?.name ?? "Unknown supplier",
      ordersOnDesk: 0,
      closed: 0,
      onTime: 0,
      short: 0,
      over: 0,
      billedLines: 0,
      priceVariances: 0,
      billedAhead: 0,
      invoiceCount: 0,
      disputed: 0,
      openPastPromise: 0,
      concerns: 0,
    };

    seed.ordersOnDesk += 1;
    if (r.closed) {
      seed.closed += 1;
      if (r.daysLate !== null && r.daysLate <= 0) seed.onTime += 1;
      if (r.shortUnits > 0) seed.short += 1;
      if (r.overUnits > 0) seed.over += 1;
    }
    if (r.control.billedQty !== null) {
      seed.billedLines += 1;
      if (r.priceVarianceCents !== 0) seed.priceVariances += 1;
      if (r.billedAheadUnits > 0) seed.billedAhead += 1;
    }
    if (!r.closed && r.daysPastPromise !== null && r.daysPastPromise > 0) {
      seed.openPastPromise += 1;
    }
    out.set(id, seed);
  }

  for (const r of invoices) {
    const s = out.get(r.invoice.partnerId);
    if (!s) continue;
    s.invoiceCount += 1;
    if (r.invoice.state === "disputed") s.disputed += 1;
  }

  const rowsOut = [...out.values()];
  for (const s of rowsOut) {
    s.concerns =
      s.short +
      s.over +
      s.priceVariances +
      s.disputed +
      s.openPastPromise +
      (s.closed - s.onTime);
  }

  /* Most to answer for first. A supplier league table sorted
     alphabetically is a directory. */
  rowsOut.sort((a, b) => {
    if (b.concerns !== a.concerns) return b.concerns - a.concerns;
    return b.ordersOnDesk - a.ordersOnDesk;
  });
  return rowsOut;
}

/** A rate that refuses to print a percentage without its denominator. */
function rate(n: number, d: number, noun: string): string {
  if (d === 0) return `Not yet rated, no ${noun}`;
  return `${n} of ${d} (${Math.round((n / d) * 100)}%)`;
}

function qty(n: number): string {
  return n.toLocaleString("en-US");
}

/* ---------------------------------------------------------------
   Two original marks, drawn here rather than fetched
   --------------------------------------------------------------- */

/**
 * The milestone rail. Seven marks, each filled on its own evidence, with
 * a half fill for a part delivery.
 *
 * It carries a full sentence as its accessible name rather than a number,
 * because "stage six of seven" is exactly the summary that hides an
 * order invoiced before it shipped.
 */
function StageRail({
  reached,
  label,
}: {
  reached: Record<OrderStage, Reach>;
  label: string;
}) {
  return (
    <svg
      className={styles.rail}
      viewBox="0 0 118 16"
      role="img"
      aria-label={label}
      focusable="false"
    >
      <line
        x1="6"
        y1="8"
        x2="112"
        y2="8"
        className={styles.railSpine}
      />
      {ORDER_STAGE_ORDER.map((s, i) => {
        const x = 6 + i * 17.6;
        const state = reached[s];
        return (
          <g key={s}>
            <circle
              cx={x}
              cy="8"
              r="5"
              className={
                state === "none" ? styles.railMarkOff : styles.railMarkOn
              }
            />
            {state === "part" ? (
              <path
                d={`M ${x} 3 A 5 5 0 0 0 ${x} 13 Z`}
                className={styles.railMarkPart}
              />
            ) : null}
            {state === "full" ? (
              <circle cx={x} cy="8" r="2.4" className={styles.railMarkCore} />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

/**
 * The match itself, drawn once at the head of the section.
 *
 * Three documents and the three comparisons between them. No arrowheads
 * anywhere: the comparisons are not directional, which is the point of
 * calling it a match rather than a flow.
 */
function MatchMark() {
  return (
    <svg
      className={styles.matchMark}
      viewBox="0 0 300 168"
      role="img"
      aria-label="The three-way match. The order and the goods receipt are compared on quantity. The goods receipt and the invoice are compared on what may be billed. The order and the invoice are compared on unit price."
      focusable="false"
    >
      <g className={styles.markLine}>
        <line x1="62" y1="46" x2="238" y2="46" />
        <line x1="52" y1="62" x2="140" y2="120" />
        <line x1="248" y1="62" x2="160" y2="120" />
      </g>
      <g className={styles.markBox}>
        <rect x="6" y="18" width="92" height="34" rx="4" />
        <rect x="202" y="18" width="92" height="34" rx="4" />
        <rect x="104" y="118" width="92" height="34" rx="4" />
      </g>
      <g className={styles.markLabel}>
        <text x="52" y="40" textAnchor="middle">
          The order
        </text>
        <text x="248" y="40" textAnchor="middle">
          The receipt
        </text>
        <text x="150" y="140" textAnchor="middle">
          The invoice
        </text>
      </g>
      <g className={styles.markNote}>
        <text x="150" y="64" textAnchor="middle">
          quantity
        </text>
        <text x="52" y="100" textAnchor="middle">
          price
        </text>
        <text x="250" y="100" textAnchor="middle">
          billed against
        </text>
        <text x="250" y="112" textAnchor="middle">
          delivered
        </text>
      </g>
    </svg>
  );
}

export function SpendPage() {
  const [poFilter, setPoFilter] = useState<PoFilter>("all");
  const [invFilter, setInvFilter] = useState<InvoiceFilter>("all");
  const [ageFilter, setAgeFilter] = useState<AgeFilter>("all");
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>("all");

  const budgets = useMemo(() => budgetRows(), []);
  const bTotals = useMemo(() => budgetTotals(budgets), [budgets]);
  const orders = useMemo(() => poRows(NOW), []);
  const invoices = useMemo(() => invoiceRows(NOW), []);
  const ageing = useMemo(() => ageingTotals(invoices), [invoices]);
  const contracts = useMemo(() => contractRows(NOW), []);
  const next = useMemo(() => nextRenewal(contracts), [contracts]);

  const matches = useMemo(() => matchRows(orders, NOW), [orders]);
  const checks = useMemo(() => runChecks(matches, invoices), [matches, invoices]);
  const suppliers = useMemo(
    () => supplierRows(matches, invoices),
    [matches, invoices],
  );

  const gradeCounts = useMemo(() => {
    const out = { matched: 0, open: 0, query: 0, fail: 0 } satisfies Record<
      MatchGrade,
      number
    >;
    for (const r of matches) out[r.grade] += 1;
    return out;
  }, [matches]);

  const visibleMatches = useMemo(
    () =>
      gradeFilter === "all"
        ? matches
        : matches.filter((r) => r.grade === gradeFilter),
    [matches, gradeFilter],
  );

  /* Two totals the top strip carries, both counted here rather than
     stored: how many orders the match desk cannot sign off, and how many
     individual term failures sit under the nine checks. */
  const matchExceptions = gradeCounts.fail + gradeCounts.query;
  const checkFailures = checks.reduce((n, c) => n + c.fail, 0);
  const checksWithFailures = checks.filter((c) => c.fail > 0).length;
  const checkSkips = checks.reduce((n, c) => n + c.skip, 0);

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
              DIME Industries, Irvine. Sales Performance Analyst
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

          {/* The buying half of the page needs a second, narrower
              statement, because it prints lead times and quantities
              against the one real company in this application. Saying
              "illustrative" once at the top is not enough when a reader
              is looking at a promised date beside a licence name they
              can check in fifteen seconds. */}
          <p className={styles.framing}>
            <span aria-hidden="true" className={styles.framingGlyph}>
              ◇
            </span>
            <span>
              Nature's Mark publishes nine licence names and nothing else.
              It publishes no factory, no country of manufacture, no minimum
              order quantity, <strong>no lead time</strong>, no unit cost and
              no payment terms. None of those is invented here. Where a lead
              time is printed below it is measured between two dates this
              prototype seeded and badged modeled, and it is a fact about
              this prototype rather than about any supplier.
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
          <Stat
            value={matchExceptions}
            label="Orders the match will not sign off"
            note="Failures where the money is already moving, plus queries a person has to settle. Out of fifteen goods orders on the desk."
            provenance="modeled"
            tone="var(--risk)"
            live
          />
          <Stat
            value={checkFailures}
            label="Term checks failing"
            note={`Individual failures across ${checksWithFailures} of the ${MECHANICAL_TERM_CHECKS.length} terms that can be checked mechanically. A further ${checkSkips} could not be checked at all.`}
            provenance="modeled"
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

        </section>

        {/* ===========================================================
            5. WHERE THE GOODS ARE
            =========================================================== */}
        <section className={styles.section} aria-labelledby="stage-h">
          <SectionHead
            eyebrow="Five"
            id="stage-h"
            title="Where the goods are"
            lede="Sections one to four follow the money. This follows the pallet. An order can be committed money for eleven weeks and be a fax nobody read, and the budget cannot tell the difference. Worst reading first, which is the order the desk below works in."
            meta={
              <>
                <ProvenanceBadge provenance="modeled" compact />
                <span>
                  One badge covers every quantity, date and figure on its
                  row. Where a row names a licensed property, that name
                  carries its own badge, because the name is the only
                  published thing on the row.
                </span>
              </>
            }
          />

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className="visually-hidden">
                Every goods order with the property it carries, how far it
                has physically got, the date the supplier promised and the
                date anything landed.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Order</th>
                  <th scope="col">Property</th>
                  <th scope="col" className={styles.wideCol}>
                    Stage
                  </th>
                  <th scope="col">Against the money</th>
                  <th scope="col">Promised</th>
                  <th scope="col">Landed</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((r) => (
                  <tr
                    key={r.control.poId}
                    className={
                      r.daysPastPromise !== null && r.daysPastPromise > 0
                        ? styles.overRow
                        : undefined
                    }
                  >
                    <th scope="row" className={styles.refCell}>
                      {r.order.po.reference}
                      <span className={styles.lineMeta}>
                        {r.order.partner?.name ?? "Unknown supplier"}
                      </span>
                      <ProvenanceBadge provenance="modeled" compact />
                    </th>
                    <td data-label="Property">
                      {r.licenceName ? (
                        <>
                          <span className={styles.licence}>
                            {r.licenceName}
                            <ProvenanceBadge provenance="public" compact />
                          </span>
                          <span className={styles.lineMeta}>
                            Named on the Nature's Mark partners page. The
                            order under it is not.
                          </span>
                        </>
                      ) : (
                        <span className={styles.termNone}>Unlicensed</span>
                      )}
                    </td>
                    <td className={styles.wideCol} data-label="Stage">
                      <StageRail reached={r.reached} label={railLabel(r)} />
                      <TokenMark token={ORDER_STAGE[r.stage]} small />
                      {r.reached.received === "part" ? (
                        <span className={styles.lineMeta}>
                          <span className="num">
                            {qty(r.control.receivedQty ?? 0)}
                          </span>{" "}
                          of <span className="num">
                            {qty(r.control.orderedQty)}
                          </span>{" "}
                          {r.control.unit} landed, so the received mark is
                          half filled and not filled.
                        </span>
                      ) : null}
                      {r.reached.invoiced === "full" &&
                      r.reached.received === "none" ? (
                        <span className={styles.over}>
                          <span aria-hidden="true">✕</span> Invoiced with the
                          received mark still empty
                        </span>
                      ) : null}
                    </td>
                    <td data-label="Against the money">
                      <TokenMark token={PO_STATE[r.order.po.state]} small />
                    </td>
                    <td data-label="Promised">
                      {r.control.promisedOn ? (
                        <>
                          <span className={styles.dateText}>
                            {formatDate(r.control.promisedOn)}
                          </span>
                          <span className={styles.lineMeta}>
                            <span className="num">{r.leadDays}</span> days from
                            raised to promised. Modeled. No supplier here
                            publishes a lead time.
                          </span>
                          {r.promiseSlipDays > 0 ? (
                            <span className={styles.over}>
                              <span aria-hidden="true">✕</span>{" "}
                              <span className="num">{r.promiseSlipDays}</span>{" "}
                              days later than the order asked for
                            </span>
                          ) : null}
                        </>
                      ) : (
                        <span className={styles.termNone}>
                          Not acknowledged, so nothing promised
                        </span>
                      )}
                    </td>
                    <td data-label="Landed">
                      {r.control.receivedOn ? (
                        <>
                          <span className={styles.dateText}>
                            {formatDate(r.control.receivedOn)}
                          </span>
                          <span
                            className={
                              r.daysLate !== null && r.daysLate > 0
                                ? styles.over
                                : styles.lineMeta
                            }
                          >
                            {r.daysLate !== null && r.daysLate > 0 ? (
                              <>
                                <span className="num">{r.daysLate}</span> days
                                after the promise
                              </>
                            ) : (
                              "On or before the promise"
                            )}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className={styles.termNone}>Nothing yet</span>
                          {r.daysPastPromise !== null &&
                          r.daysPastPromise > 0 ? (
                            <span className={styles.over}>
                              <span aria-hidden="true">✕</span>{" "}
                              <span className="num">{r.daysPastPromise}</span>{" "}
                              days past the promise
                            </span>
                          ) : null}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className={styles.sectionFoot}>
            Six purchase orders are not on this desk and none of them is an
            oversight. Three are freight and customs entries, which nobody
            books in against a goods receipt. Two are the Nature's Mark
            drafts, which have been sent to nobody. One window graphics order
            is still in draft. A draft is an intention, and an intention has
            no supplier waiting on it.
          </p>
        </section>

        {/* ===========================================================
            6. THE THREE-WAY MATCH
            =========================================================== */}
        <section className={styles.section} aria-labelledby="match-h">
          <SectionHead
            eyebrow="Six"
            id="match-h"
            title="The three-way match"
            lede="What the order said, what arrived, what the invoice charged. Two of the three agreeing is the normal case and it is also how a supplier gets paid for goods that never came."
            meta={
              <>
                <ProvenanceBadge provenance="modeled" compact />
                <span>
                  Every quantity and price below multiplies out to the order
                  and invoice totals already on this page, to the cent.
                </span>
              </>
            }
          />

          <div className={styles.matchIntro}>
            <MatchMark />
            <div className={styles.matchIntroBody}>
              <p>
                Three documents make three comparisons, and each one catches
                something the other two cannot.
              </p>
              <ul>
                <li>
                  <strong>Order against receipt</strong> catches a short
                  delivery. Nothing about the invoice will ever reveal one.
                </li>
                <li>
                  <strong>Receipt against invoice</strong> catches billing for
                  goods that did not arrive. This is the comparison that gets
                  skipped, because the invoice usually agrees with the order
                  and agreeing with the order looks like agreement.
                </li>
                <li>
                  <strong>Order against invoice</strong> catches a price that
                  moved after the order was placed. A correct quantity at the
                  wrong price looks right on every total on the page.
                </li>
              </ul>
              <p className={styles.matchIntroNote}>
                One order below passes all three arithmetic tests and is
                disputed anyway, on colourfastness. Section seven is about
                that.
              </p>
            </div>
          </div>

          <div className={styles.filterRow} role="group" aria-label="Match grade">
            <FilterChip
              token={{
                glyph: "▣",
                label: "All orders",
                cssVar: "var(--text-2)",
                note: "Every goods order on the match desk.",
              }}
              count={matches.length}
              pressed={gradeFilter === "all"}
              onClick={() => setGradeFilter("all")}
            />
            {MATCH_GRADE_ORDER.map((g) => (
              <FilterChip
                key={g}
                token={MATCH_GRADE[g]}
                count={gradeCounts[g]}
                pressed={gradeFilter === g}
                onClick={() => setGradeFilter(gradeFilter === g ? "all" : g)}
              />
            ))}
          </div>

          <p className={styles.shown} aria-live="polite">
            <strong className="num">{visibleMatches.length}</strong> of{" "}
            <span className="num">{matches.length}</span> goods orders shown
          </p>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className="visually-hidden">
                Each goods order with what the order said, what the goods
                receipt recorded, what the invoice charged, and the reading.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Order</th>
                  <th scope="col">The order said</th>
                  <th scope="col">What arrived</th>
                  <th scope="col">The invoice charged</th>
                  <th scope="col" className={styles.wideCol}>
                    Reading
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleMatches.map((r) => (
                  <tr
                    key={r.control.poId}
                    className={
                      r.grade === "fail" ? styles.overRow : undefined
                    }
                  >
                    <th scope="row" className={styles.refCell}>
                      {r.order.po.reference}
                      <span className={styles.lineMeta}>
                        {`${r.order.partner?.name ?? "Unknown supplier"}${r.licenceName ? `. ${r.licenceName}.` : ""}`}
                      </span>
                      <ProvenanceBadge provenance="modeled" compact />
                    </th>
                    <td data-label="The order said">
                      <span className="num">{qty(r.control.orderedQty)}</span>{" "}
                      {r.control.unit}
                      <span className={styles.lineMeta}>
                        at{" "}
                        <span className="num">
                          {formatMoney(r.control.orderedUnitCents)}
                        </span>{" "}
                        each, <span className="num">
                          {formatMoney(r.orderedValueCents)}
                        </span>
                      </span>
                    </td>
                    <td data-label="What arrived">
                      {r.control.receivedQty === null ? (
                        <span className={styles.termNone}>No goods receipt</span>
                      ) : (
                        <>
                          <span className="num">
                            {qty(r.control.receivedQty)}
                          </span>{" "}
                          {r.control.unit}
                          <span className={styles.lineMeta}>
                            booked in {formatDate(r.control.receivedOn ?? "")}
                          </span>
                        </>
                      )}
                      {r.shortUnits > 0 ? (
                        <span className={styles.over}>
                          <span aria-hidden="true">✕</span>{" "}
                          <span className="num">{qty(r.shortUnits)}</span> short
                        </span>
                      ) : null}
                      {r.overUnits > 0 ? (
                        <span className={styles.unmatched}>
                          <span aria-hidden="true">◘</span>{" "}
                          <span className="num">{qty(r.overUnits)}</span> over
                        </span>
                      ) : null}
                    </td>
                    <td data-label="The invoice charged">
                      {r.control.billedQty === null ||
                      r.control.billedUnitCents === null ? (
                        <span className={styles.termNone}>Not billed</span>
                      ) : (
                        <>
                          <span className="num">
                            {qty(r.control.billedQty)}
                          </span>{" "}
                          {r.control.unit}
                          <span className={styles.lineMeta}>
                            at{" "}
                            <span className="num">
                              {formatMoney(r.control.billedUnitCents)}
                            </span>{" "}
                            each,{" "}
                            <span className="num">
                              {formatMoney(r.billedValueCents ?? 0)}
                            </span>
                          </span>
                          {r.priceVarianceCents !== 0 ? (
                            <span className={styles.over}>
                              <span aria-hidden="true">✕</span>{" "}
                              <span className="num">
                                {formatMoney(
                                  Math.abs(r.priceVarianceTotalCents),
                                )}
                              </span>{" "}
                              {r.priceVarianceCents > 0 ? "over" : "under"} the
                              order
                            </span>
                          ) : null}
                        </>
                      )}
                    </td>
                    <td className={styles.wideCol} data-label="Reading">
                      <TokenMark token={MATCH_GRADE[r.grade]} small />
                      <span className={styles.reading}>{r.reading}</span>
                      {r.control.note ? (
                        <span className={styles.readingNote}>
                          <span aria-hidden="true">◆</span> {r.control.note}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {visibleMatches.length === 0 ? (
            <p className={styles.empty} role="status">
              <span aria-hidden="true">○</span> No goods order carries that
              reading.
            </p>
          ) : null}
        </section>

        {/* ===========================================================
            7. COMPLIANCE WITH CONTRACT TERMS
            =========================================================== */}
        <section className={styles.section} aria-labelledby="terms-check-h">
          <SectionHead
            eyebrow="Seven"
            id="terms-check-h"
            title="Compliance, and the line through the middle of it"
            lede="Some terms are a number on one document against a number on another, and arithmetic settles them. The rest need a person, a sample or a site visit. Both lists are below and the second one is longer."
            meta={
              <>
                <ProvenanceBadge provenance="modeled" compact />
                <span>
                  Every count below is computed from the rows on this page at
                  render. Nothing is a stored result.
                </span>
              </>
            }
          />

          <h3 className={styles.subHead}>
            Checked by arithmetic, and these are the only ones
          </h3>

          <ul className={styles.checks}>
            {MECHANICAL_TERM_CHECKS.map((def) => {
              const r = checks.find((c) => c.id === def.id);
              if (!r) return null;
              const checked = r.pass + r.fail;
              return (
                <li
                  key={def.id}
                  className={
                    r.fail > 0
                      ? `${styles.check} ${styles.checkFail}`
                      : styles.check
                  }
                >
                  <div className={styles.checkHead}>
                    <span
                      aria-hidden="true"
                      className={
                        r.fail > 0 ? styles.checkGlyphBad : styles.checkGlyphOk
                      }
                    >
                      {r.fail > 0 ? "✕" : "✓"}
                    </span>
                    <h4 className={styles.checkTitle}>{def.label}</h4>
                    <span className={styles.checkScore}>
                      <span className="num">{r.pass}</span> of{" "}
                      <span className="num">{checked}</span> checked pass
                    </span>
                  </div>

                  <p className={styles.checkClause}>
                    <strong>Term.</strong> {def.clause}
                  </p>
                  <p className={styles.checkMethod}>
                    <strong>Test.</strong> {def.method} Run over: {def.population}
                  </p>

                  {r.fail > 0 ? (
                    <p className={styles.checkFails}>
                      <strong>
                        <span className="num">{r.fail}</span>{" "}
                        {r.fail === 1 ? "failure:" : "failures:"}
                      </strong>{" "}
                      {`${r.failures.join(". ")}.`}
                    </p>
                  ) : null}

                  {r.skip > 0 ? (
                    <p className={styles.checkSkips}>
                      <span aria-hidden="true">◘</span>{" "}
                      <strong>
                        <span className="num">{r.skip}</span> could not be
                        checked.
                      </strong>{" "}
                      {r.skipReason}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <h3 className={styles.subHead}>
            Checked by a person, and no tick on this screen will ever say
            otherwise
          </h3>

          <p className={styles.subLede}>
            Each of these is a real clause and none of them is a field. The
            temptation is to model them anyway and let a green tick imply the
            checking happened, which would be the most dishonest thing in this
            application, because failing to notice the difference is the exact
            failure a buyer is hired to prevent.
          </p>

          <ul className={styles.judgements}>
            {JUDGEMENT_TERMS.map((t) => (
              <li key={t.id} className={styles.judgement}>
                <div className={styles.checkHead}>
                  <span aria-hidden="true" className={styles.checkGlyphHand}>
                    ◍
                  </span>
                  <h4 className={styles.checkTitle}>{t.label}</h4>
                </div>
                <p className={styles.checkClause}>
                  <strong>Why arithmetic cannot settle it.</strong> {t.why}
                </p>
                <p className={styles.checkMethod}>
                  <strong>What would.</strong> {t.settles}
                </p>
                {t.live ? (
                  <p className={styles.checkFails}>
                    <span aria-hidden="true">◆</span> {t.live}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        {/* ===========================================================
            8. SUPPLIER RELIABILITY
            =========================================================== */}
        <section className={styles.section} aria-labelledby="reliability-h">
          <SectionHead
            eyebrow="Eight"
            id="reliability-h"
            title="Supplier reliability, measured rather than asserted"
            lede="Every rate here prints what it was divided by. A supplier who is one from one and a supplier who is eighty from eighty are both at a hundred per cent, and only one of those is worth saying out loud in a negotiation."
            meta={
              <>
                <ProvenanceBadge provenance="modeled" compact />
                <span>
                  Counted from the orders and invoices on this page. On-time
                  runs over orders the buyer has closed; open orders past their
                  promise are counted separately and never folded in.
                </span>
              </>
            }
          />

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className="visually-hidden">
                Each supplier with delivery, billing and dispute rates, each
                shown with the number of orders or invoices it was divided by.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Supplier</th>
                  <th scope="col" className={styles.wideCol}>
                    On time against promised
                  </th>
                  <th scope="col">Short or over</th>
                  <th scope="col">Billed ahead of delivery</th>
                  <th scope="col">Price variances</th>
                  <th scope="col">Invoices disputed</th>
                </tr>
              </thead>
              <tbody>
                {/* No row tint in this table, deliberately. Five of the
                    seven suppliers have something against them and a
                    table where five rows are red teaches its reader that
                    red means nothing. The cells that are actually wrong
                    carry the emphasis; the row carries the record. */}
                {suppliers.map((s) => (
                  <tr key={s.id}>
                    <th scope="row" className={styles.lineCell}>
                      <span className={styles.lineName}>{s.name}</span>
                      <span className={styles.lineMeta}>
                        <span className="num">{s.ordersOnDesk}</span>{" "}
                        {s.ordersOnDesk === 1 ? "order" : "orders"} on the desk,{" "}
                        <span className="num">{s.closed}</span> closed
                        {s.openPastPromise > 0 ? (
                          <>
                            {". "}
                            <span className="num">{s.openPastPromise}</span> open
                            and past the promise
                          </>
                        ) : null}
                      </span>
                      <ProvenanceBadge provenance="modeled" compact />
                    </th>
                    <td className={styles.wideCol} data-label="On time against promised">
                      {s.closed === 0 ? (
                        <span className={styles.termNone}>
                          Not yet rated, no order closed
                        </span>
                      ) : (
                        <Bar
                          pct={(s.onTime / s.closed) * 100}
                          value={rate(s.onTime, s.closed, "order closed")}
                          label={`${s.name} delivered on or before the promised date`}
                          over={s.onTime < s.closed}
                          tone={
                            s.onTime === s.closed ? "var(--ok)" : "var(--warn)"
                          }
                        />
                      )}
                    </td>
                    <td data-label="Short or over">
                      <span className={s.short + s.over > 0 ? styles.over : undefined}>
                        {rate(s.short + s.over, s.closed, "order closed")}
                      </span>
                      {s.short > 0 ? (
                        <span className={styles.lineMeta}>
                          <span className="num">{s.short}</span> short,{" "}
                          <span className="num">{s.over}</span> over
                        </span>
                      ) : null}
                    </td>
                    <td data-label="Billed ahead of delivery">
                      <span
                        className={s.billedAhead > 0 ? styles.over : undefined}
                      >
                        {rate(s.billedAhead, s.billedLines, "order invoiced")}
                      </span>
                    </td>
                    <td data-label="Price variances">
                      <span
                        className={
                          s.priceVariances > 0 ? styles.over : undefined
                        }
                      >
                        {rate(s.priceVariances, s.billedLines, "order invoiced")}
                      </span>
                    </td>
                    <td data-label="Invoices disputed">
                      <span className={s.disputed > 0 ? styles.over : undefined}>
                        {rate(s.disputed, s.invoiceCount, "invoice on the ledger")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className={styles.sectionFoot}>
            Freight, catering and the print bureau are invoiced without a goods
            receipt, so they carry no delivery record here and no rate is
            invented for them. What this table is actually for is the next
            conversation: a supplier who is three of four on time and one of
            four on price has given you two specific things to ask for, and
            asking for them is worth more than asking for a discount.{" "}
            <strong>None of it is a judgement about product quality</strong>,
            which is section seven's second list and a sample nobody on this
            page has held.
          </p>

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

/**
 * The rail's accessible name, written as a sentence rather than a
 * position. "Stage six of seven" is precisely the summary that would hide
 * an order invoiced before it shipped, which is the one thing the rail
 * exists to show.
 */
function railLabel(r: MatchRow): string {
  const names = (state: Reach) =>
    ORDER_STAGE_ORDER.filter((s) => r.reached[s] === state)
      .map((s) => ORDER_STAGE[s].label.toLowerCase())
      .join(", ");

  const full = names("full");
  const part = names("part");
  const none = names("none");

  return [
    `Reached: ${full}.`,
    part ? `Part reached: ${part}.` : "",
    none ? `Not reached: ${none}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}
