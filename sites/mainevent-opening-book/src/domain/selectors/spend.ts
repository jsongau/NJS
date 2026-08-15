import type {
  BudgetLine,
  Contract,
  Invoice,
  Partner,
  PurchaseOrder,
} from "@/domain/licensing";
import { daysBetween } from "@/domain/licensing";
import type { StatusToken } from "@/domain/vocabulary";
import { PARTNER_BY_ID } from "@/data/partners";
import {
  BUDGET_LINES,
  CONTRACTS,
  INVOICES,
  PURCHASE_ORDERS,
} from "@/data/spend";

/**
 * BUDGET AGAINST COMMITTED AGAINST ACTUAL, AND THE THREE THINGS THAT GO
 * WRONG BETWEEN THEM.
 *
 * The posting asks for it in one sentence: "Manage budgets, purchase
 * orders, and invoices to ensure cost control and compliance with
 * contract terms." Cost control is the phrase doing the work, and cost
 * control is not the same as cost reporting.
 *
 * ── WHY THERE ARE THREE NUMBERS AND NOT TWO ───────────────────────
 * The obvious model is budget against actual. It is also the model that
 * lets a budget be blown without anybody seeing it coming, because actual
 * only moves when an invoice is PAID, and by the time an invoice exists
 * the money left the building weeks ago at the moment somebody issued a
 * purchase order.
 *
 * So the middle column is COMMITTED: money promised to somebody outside
 * the building and not yet paid. It is the column a manager can still act
 * on. Once it is actual, the conversation is a variance explanation
 * rather than a decision.
 *
 * ── THE ARITHMETIC, IN FULL, BECAUSE IT IS SHOWN ON THE SCREEN ────
 *
 *   ACTUAL     = invoices in state "paid"
 *   COMMITTED  = invoices raised and not paid, meaning received, approved
 *                or disputed
 *              + the part of every open purchase order that has not been
 *                invoiced yet, floored at zero
 *   REMAINING  = budget less committed less actual
 *
 * An open purchase order is one in approved, issued, part-received or
 * received. Draft commits nothing, because a draft can be deleted without
 * a phone call. Cancelled commits nothing, because it has been withdrawn
 * and its money is back.
 *
 * The floor at zero matters. A supplier who over-invoices a purchase
 * order would otherwise produce a NEGATIVE uninvoiced remainder that
 * quietly cancelled out committed money on some other row, and the budget
 * would look healthier because a supplier billed too much. The excess
 * shows up where it belongs, as an invoice, and the over-billing shows up
 * as a dispute.
 *
 * ── DISPUTED INVOICES STILL COUNT AND STILL AGE ───────────────────
 * A disputed invoice is committed money until somebody wins the argument,
 * and it ages from its due date like every other. Parking disputes in
 * their own bucket outside the ageing is how a sixty day argument becomes
 * a supplier who stops shipping.
 */

// ---------------------------------------------------------------
// Budget
// ---------------------------------------------------------------

const OPEN_PO_STATES = ["approved", "issued", "part-received", "received"];

export interface BudgetRow {
  line: BudgetLine;
  budgetCents: number;
  committedCents: number;
  actualCents: number;
  remainingCents: number;
  /** Positive only when the line is over. Zero otherwise, never negative. */
  overByCents: number;
  /** Committed plus actual as a share of budget. Can exceed one hundred. */
  usedPct: number;
  poCount: number;
  invoiceCount: number;
}

function invoicedAgainst(poId: string): number {
  return INVOICES.filter((i) => i.poId === poId).reduce(
    (n, i) => n + i.amountCents,
    0,
  );
}

export function budgetRows(): BudgetRow[] {
  const rows = BUDGET_LINES.map<BudgetRow>((line) => {
    const pos = PURCHASE_ORDERS.filter((p) => p.budgetLineId === line.id);
    const invs = INVOICES.filter((i) => i.budgetLineId === line.id);

    const actualCents = invs
      .filter((i) => i.state === "paid")
      .reduce((n, i) => n + i.amountCents, 0);

    const unpaidInvoiceCents = invs
      .filter((i) => i.state !== "paid")
      .reduce((n, i) => n + i.amountCents, 0);

    const uninvoicedPoCents = pos
      .filter((p) => OPEN_PO_STATES.includes(p.state))
      .reduce(
        (n, p) => n + Math.max(0, p.amountCents - invoicedAgainst(p.id)),
        0,
      );

    const committedCents = unpaidInvoiceCents + uninvoicedPoCents;
    const remainingCents = line.budgetCents - committedCents - actualCents;

    return {
      line,
      budgetCents: line.budgetCents,
      committedCents,
      actualCents,
      remainingCents,
      overByCents: remainingCents < 0 ? -remainingCents : 0,
      usedPct:
        line.budgetCents > 0
          ? ((committedCents + actualCents) / line.budgetCents) * 100
          : 0,
      poCount: pos.length,
      invoiceCount: invs.length,
    };
  });

  /* Over-budget lines first, then the tightest. A budget screen sorted by
     category is a filing cabinet; a budget screen sorted by how close each
     line is to its ceiling is an instrument. */
  rows.sort((a, b) => b.usedPct - a.usedPct);
  return rows;
}

export interface BudgetTotals {
  budgetCents: number;
  committedCents: number;
  actualCents: number;
  remainingCents: number;
  linesOver: number;
}

export function budgetTotals(rows: BudgetRow[]): BudgetTotals {
  return rows.reduce<BudgetTotals>(
    (t, r) => ({
      budgetCents: t.budgetCents + r.budgetCents,
      committedCents: t.committedCents + r.committedCents,
      actualCents: t.actualCents + r.actualCents,
      remainingCents: t.remainingCents + r.remainingCents,
      linesOver: t.linesOver + (r.overByCents > 0 ? 1 : 0),
    }),
    {
      budgetCents: 0,
      committedCents: 0,
      actualCents: 0,
      remainingCents: 0,
      linesOver: 0,
    },
  );
}

// ---------------------------------------------------------------
// Purchase orders
// ---------------------------------------------------------------

export interface PoRow {
  po: PurchaseOrder;
  partner: Partner | null;
  budgetLine: BudgetLine | null;
  invoices: Invoice[];
  invoicedCents: number;
  uninvoicedCents: number;
  /** Days until the goods are expected. Negative where the date has passed. */
  daysToExpected: number;
  /** Open, past its expected date, and not fully received. */
  late: boolean;
}

export function poRows(asOf: string): PoRow[] {
  const rows = PURCHASE_ORDERS.map<PoRow>((po) => {
    const invoices = INVOICES.filter((i) => i.poId === po.id);
    const invoicedCents = invoices.reduce((n, i) => n + i.amountCents, 0);
    const daysToExpected = daysBetween(asOf, po.expectedOn);
    return {
      po,
      partner: PARTNER_BY_ID[po.partnerId] ?? null,
      budgetLine: BUDGET_LINES.find((b) => b.id === po.budgetLineId) ?? null,
      invoices,
      invoicedCents,
      uninvoicedCents: Math.max(0, po.amountCents - invoicedCents),
      daysToExpected,
      late:
        daysToExpected < 0 &&
        (po.state === "issued" || po.state === "part-received"),
    };
  });

  /* Late first, then by how soon the date lands. A purchase order list in
     reference order tells you what was raised; this tells you what is
     about to fail. */
  rows.sort((a, b) => {
    if (a.late !== b.late) return a.late ? -1 : 1;
    return a.daysToExpected - b.daysToExpected;
  });
  return rows;
}

// ---------------------------------------------------------------
// Invoices and ageing
// ---------------------------------------------------------------

/**
 * Ageing buckets, measured from the DUE date rather than the issue date.
 *
 * Measuring from issue is the version that looks stricter and means
 * nothing: an invoice on sixty day terms is not late on day thirty one.
 * Terms are the whole reason a payment date exists, so the ageing has to
 * respect them or the screen is scolding accounts payable for reading the
 * contract.
 */
export type AgeBucket = "not-due" | "d1-30" | "d31-60" | "d60-plus" | "settled";

export const AGE_BUCKET_META: Record<AgeBucket, StatusToken> = {
  settled: {
    glyph: "●",
    label: "Paid",
    cssVar: "var(--ok)",
    note: "Settled. Counts as actual spend against its budget line.",
  },
  "not-due": {
    glyph: "○",
    label: "Not yet due",
    cssVar: "var(--neutral)",
    note: "Inside its terms. Owed and not late.",
  },
  "d1-30": {
    glyph: "◔",
    label: "1 to 30 days past",
    cssVar: "var(--warn)",
    note: "Past due inside a month. Still a payment run problem rather than a relationship problem.",
  },
  "d31-60": {
    glyph: "◑",
    label: "31 to 60 days past",
    cssVar: "var(--warn)",
    note: "Past due over a month. The supplier has now chased at least twice.",
  },
  "d60-plus": {
    glyph: "✕",
    label: "Over 60 days past",
    cssVar: "var(--risk)",
    note: "Past due over two months. This is where a supplier quietly moves you to prepayment.",
  },
};

export const AGE_BUCKET_ORDER: AgeBucket[] = [
  "d60-plus",
  "d31-60",
  "d1-30",
  "not-due",
  "settled",
];

export interface InvoiceRow {
  invoice: Invoice;
  partner: Partner | null;
  budgetLine: BudgetLine | null;
  po: PurchaseOrder | null;
  /** Days past the due date. Negative where it is not due yet. */
  daysPastDue: number;
  bucket: AgeBucket;
  /** True where the invoice has no purchase order behind it at all. */
  unmatched: boolean;
  /** True where the invoice value differs from the order it cites. */
  mismatch: boolean;
}

export function invoiceRows(asOf: string): InvoiceRow[] {
  const rows = INVOICES.map<InvoiceRow>((invoice) => {
    const po = invoice.poId
      ? (PURCHASE_ORDERS.find((p) => p.id === invoice.poId) ?? null)
      : null;
    const daysPastDue = daysBetween(invoice.dueOn, asOf);
    const bucket: AgeBucket =
      invoice.state === "paid"
        ? "settled"
        : daysPastDue <= 0
          ? "not-due"
          : daysPastDue <= 30
            ? "d1-30"
            : daysPastDue <= 60
              ? "d31-60"
              : "d60-plus";

    /* A mismatch is flagged only where the purchase order carries exactly
       one invoice. A part billing against a part delivery is normal and
       flagging it would bury the case that matters under the case that
       does not. */
    const siblings = invoice.poId
      ? INVOICES.filter((i) => i.poId === invoice.poId)
      : [];
    return {
      invoice,
      partner: PARTNER_BY_ID[invoice.partnerId] ?? null,
      budgetLine:
        BUDGET_LINES.find((b) => b.id === invoice.budgetLineId) ?? null,
      po,
      daysPastDue,
      bucket,
      unmatched: invoice.poId === null,
      mismatch:
        po !== null &&
        siblings.length === 1 &&
        siblings[0].amountCents !== po.amountCents,
    };
  });

  /* Oldest debt first. An accounts payable list in date-issued order is a
     diary; in days-past-due order it is a work queue. */
  rows.sort((a, b) => {
    const order = AGE_BUCKET_ORDER.indexOf(a.bucket) - AGE_BUCKET_ORDER.indexOf(b.bucket);
    if (order !== 0) return order;
    return b.daysPastDue - a.daysPastDue;
  });
  return rows;
}

export interface AgeingTotals {
  byBucket: Record<AgeBucket, { count: number; cents: number }>;
  pastDueCount: number;
  pastDueCents: number;
  unmatchedCount: number;
  disputedCount: number;
  disputedCents: number;
}

export function ageingTotals(rows: InvoiceRow[]): AgeingTotals {
  const byBucket = {
    "not-due": { count: 0, cents: 0 },
    "d1-30": { count: 0, cents: 0 },
    "d31-60": { count: 0, cents: 0 },
    "d60-plus": { count: 0, cents: 0 },
    settled: { count: 0, cents: 0 },
  } satisfies Record<AgeBucket, { count: number; cents: number }>;

  let pastDueCount = 0;
  let pastDueCents = 0;
  let unmatchedCount = 0;
  let disputedCount = 0;
  let disputedCents = 0;

  for (const r of rows) {
    const b = byBucket[r.bucket];
    b.count += 1;
    b.cents += r.invoice.amountCents;
    if (r.bucket !== "settled" && r.bucket !== "not-due") {
      pastDueCount += 1;
      pastDueCents += r.invoice.amountCents;
    }
    if (r.unmatched) unmatchedCount += 1;
    if (r.invoice.state === "disputed") {
      disputedCount += 1;
      disputedCents += r.invoice.amountCents;
    }
  }

  return {
    byBucket,
    pastDueCount,
    pastDueCents,
    unmatchedCount,
    disputedCount,
    disputedCents,
  };
}

// ---------------------------------------------------------------
// Contracts
// ---------------------------------------------------------------

export interface ContractRow {
  contract: Contract;
  partner: Partner | null;
  daysToEnd: number;
  /**
   * The last day notice can be served, derived from the end date and the
   * notice period.
   *
   * THIS IS THE DATE THAT ACTUALLY MATTERS on an auto-renewing agreement
   * and it appears on no contract as a field. An agreement that ends in
   * ninety days with ninety days of notice on it has already renewed;
   * a screen that shows only the end date lets that happen every time.
   */
  noticeByIso: string;
  daysToNotice: number;
  /** Auto-renewing, and the notice date is inside thirty days or gone. */
  noticeUrgent: boolean;
  expired: boolean;
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function contractRows(asOf: string): ContractRow[] {
  const rows = CONTRACTS.map<ContractRow>((contract) => {
    const noticeByIso = addDays(contract.endsOn, -contract.noticePeriodDays);
    const daysToNotice = daysBetween(asOf, noticeByIso);
    const daysToEnd = daysBetween(asOf, contract.endsOn);
    return {
      contract,
      partner: PARTNER_BY_ID[contract.partnerId] ?? null,
      daysToEnd,
      noticeByIso,
      daysToNotice,
      noticeUrgent: contract.renewal === "auto" && daysToNotice <= 30,
      expired: daysToEnd < 0,
    };
  });

  /* Soonest end date first, which is the order the question gets asked
     in: what renews next. */
  rows.sort((a, b) => a.daysToEnd - b.daysToEnd);
  return rows;
}

/** The next agreement to fall due, ignoring anything already expired. */
export function nextRenewal(rows: ContractRow[]): ContractRow | null {
  return rows.find((r) => !r.expired) ?? null;
}
