import type {
  Contract,
  Licence,
  Partner,
  PromoLine,
  PromoPeriod,
} from "@/domain/licensing";
import type { StatusToken } from "@/domain/vocabulary";
import { LICENCE_BY_ID, PARTNER_BY_ID } from "@/data/partners";
import { PROMO_LINES, PROMO_PERIOD_BY_ID } from "@/data/promo";
import { CONTRACTS } from "@/data/spend";

/**
 * SELL-THROUGH, MARGIN, COVER, AND THE REPORT A LICENSOR RECEIVES.
 *
 * Two bullets on the posting land in this file, and the second one is the
 * harder of the two:
 *
 *   "Track sales performance of promotional products and create detailed
 *    internal and external sales reports for licensors."
 *   "Monitor and analyze sales performance of promotional items to assess
 *    success and ROI."
 *
 * ── NOTHING IN HERE IS STORED ─────────────────────────────────────
 * `data/promo.ts` holds five counted numbers per line and not one derived
 * one. Sell-through, revenue, cost of goods, margin and weeks of cover
 * are all computed below, at render, every time. A stored sell-through is
 * a figure that was true once and goes quietly wrong the first time
 * anybody edits a unit count, which is a lie nobody catches for a month
 * because it still looks like arithmetic.
 *
 * ── THE THIRD LEDGER, AND WHY THIS FILE IMPORTS NOTHING FROM THE BOOK ─
 * `BookProvider` carries booked event revenue and outbound activity
 * hours, and they are never summed. Promotional revenue is a THIRD thing
 * and it is the dangerous one, because it is denominated in dollars and
 * will therefore add up if anybody lets it. It must not. An eighty dollar
 * plush sell-through and a four thousand dollar grad night are not
 * comparable quantities and a total of the two answers no question.
 *
 * There is no import from `@/state/BookProvider` in this file and there
 * must never be one. The separation is structural rather than a habit
 * somebody has to keep.
 *
 * ── THE ROYALTY BASE IS AN ASSUMPTION AND IT IS SHOWN AS ONE ──────
 * A royalty is a percentage of something, and which something is a
 * negotiated term. This app models it on retail revenue in the period,
 * because the venue here is the seller rather than a wholesaler. That
 * assumption is printed on the report next to the figure and the figure
 * is badged modeled rather than illustrative, because the assumption is
 * stated and the arithmetic is checkable.
 *
 * Where no agreement covers a property, the report says there is no rate
 * on record rather than applying somebody else's. That gap is a finding.
 */

export interface PromoRow {
  line: PromoLine;
  /** null on unlicensed lines, which is a real state rather than a gap. */
  licence: Licence | null;
  partner: Partner | null;
  /** Units out over units available in the period, as a percentage. */
  sellThroughPct: number;
  /** Units out times retail. Zero on lines that are given rather than sold. */
  revenueCents: number;
  /** Units out times landed cost. Real on every line, including the free ones. */
  cogsCents: number;
  /** Revenue less cost of goods. null where the line is not sold at all. */
  marginCents: number | null;
  marginPct: number | null;
  /** Weeks the stock on hand lasts at the period's own rate. null at zero sales. */
  weeksOfCover: number | null;
  /** Lead time in weeks, which is what cover has to beat. */
  leadTimeWeeks: number | null;
  /** False where retail is zero: bought with money, handed over for nothing. */
  sellsForMoney: boolean;
  read: CoverRead;
}

/**
 * What to do about the cover figure, as a glyph and a word.
 *
 * The comparison that matters is cover against LEAD TIME, not cover
 * against a round number. Four weeks of stock is comfortable on a print
 * line that reorders in six working days and is already too late on a
 * plush line that takes ninety five. A single "low stock" threshold
 * applied across a catalogue is the most common way a prize wall runs out
 * of exactly one thing.
 */
export type CoverRead =
  | "no-sales"
  | "reorder-now"
  | "reorder-soon"
  | "holds"
  | "overstocked";

export const COVER_READ_META: Record<CoverRead, StatusToken> = {
  "no-sales": {
    glyph: "○",
    label: "No sales",
    cssVar: "var(--neutral)",
    note: "Nothing sold in the period, so there is no rate to divide stock by. Cover cannot be computed and is not guessed.",
  },
  "reorder-now": {
    glyph: "✕",
    label: "Reorder now",
    cssVar: "var(--risk)",
    note: "Cover is shorter than the lead time. Ordering today still leaves a gap on the shelf.",
  },
  "reorder-soon": {
    glyph: "◐",
    label: "Reorder soon",
    cssVar: "var(--warn)",
    note: "Cover is inside half again of the lead time. This is the last comfortable week to raise the order.",
  },
  holds: {
    glyph: "●",
    label: "Cover holds",
    cssVar: "var(--ok)",
    note: "Stock outlasts the lead time with room to spare.",
  },
  overstocked: {
    glyph: "◘",
    label: "Overstocked",
    cssVar: "var(--warn)",
    note: "Over twenty six weeks of cover. Money sitting on a shelf, and on a dated line it is money about to be written off.",
  },
};

const OVERSTOCK_WEEKS = 26;

function readCover(
  weeksOfCover: number | null,
  leadTimeWeeks: number | null,
): CoverRead {
  if (weeksOfCover === null) return "no-sales";
  if (weeksOfCover > OVERSTOCK_WEEKS) return "overstocked";
  if (leadTimeWeeks === null) return "holds";
  if (weeksOfCover < leadTimeWeeks) return "reorder-now";
  if (weeksOfCover < leadTimeWeeks * 1.5) return "reorder-soon";
  return "holds";
}

function rowFor(line: PromoLine): PromoRow {
  const partner = PARTNER_BY_ID[line.partnerId] ?? null;
  const licence = line.licenceId ? (LICENCE_BY_ID[line.licenceId] ?? null) : null;

  /* Available is units in plus what was already on hand at the end, which
     is the only reconstruction the seed supports. Dividing purely by
     units in would report over a hundred per cent on any line that ate
     into opening stock, and a sell-through above a hundred is the fastest
     way to lose a reader. */
  const available = line.unitsIn + line.unitsOnHand;
  const sellThroughPct =
    available > 0 ? (line.unitsOut / available) * 100 : 0;

  const sellsForMoney = line.unitRetailCents > 0;
  const revenueCents = line.unitsOut * line.unitRetailCents;
  const cogsCents = line.unitsOut * line.unitCostCents;
  const marginCents = sellsForMoney ? revenueCents - cogsCents : null;
  const marginPct =
    sellsForMoney && revenueCents > 0
      ? ((revenueCents - cogsCents) / revenueCents) * 100
      : null;

  const weeklyRate = line.unitsOut / line.weeksInPeriod;
  const weeksOfCover =
    weeklyRate > 0
      ? Math.round((line.unitsOnHand / weeklyRate) * 10) / 10
      : null;

  const leadTimeWeeks = partner
    ? Math.round((partner.leadTimeDays / 5) * 10) / 10
    : null;

  return {
    line,
    licence,
    partner,
    sellThroughPct,
    revenueCents,
    cogsCents,
    marginCents,
    marginPct,
    weeksOfCover,
    leadTimeWeeks,
    sellsForMoney,
    read: readCover(weeksOfCover, leadTimeWeeks),
  };
}

/** Every line in a period, best sell-through first. */
export function promoRows(periodId: string): PromoRow[] {
  return PROMO_LINES.filter((l) => l.periodId === periodId)
    .map(rowFor)
    .sort((a, b) => b.sellThroughPct - a.sellThroughPct);
}

export interface PromoTotals {
  lines: number;
  unitsIn: number;
  unitsOut: number;
  unitsOnHand: number;
  revenueCents: number;
  cogsCents: number;
  marginCents: number;
  marginPct: number | null;
  sellThroughPct: number;
  /** Lines whose cover is shorter than the lead time behind them. */
  reorderNow: number;
  overstocked: number;
}

export function promoTotals(rows: PromoRow[]): PromoTotals {
  const t: PromoTotals = {
    lines: rows.length,
    unitsIn: 0,
    unitsOut: 0,
    unitsOnHand: 0,
    revenueCents: 0,
    cogsCents: 0,
    marginCents: 0,
    marginPct: null,
    sellThroughPct: 0,
    reorderNow: 0,
    overstocked: 0,
  };

  for (const r of rows) {
    t.unitsIn += r.line.unitsIn;
    t.unitsOut += r.line.unitsOut;
    t.unitsOnHand += r.line.unitsOnHand;
    t.revenueCents += r.revenueCents;
    /* Cost of goods counts the give-away lines too. Leaving them out
       would flatter the margin by hiding the only spend on the page that
       has no revenue against it at all. */
    t.cogsCents += r.cogsCents;
    if (r.read === "reorder-now") t.reorderNow += 1;
    if (r.read === "overstocked") t.overstocked += 1;
  }

  t.marginCents = t.revenueCents - t.cogsCents;
  t.marginPct =
    t.revenueCents > 0 ? (t.marginCents / t.revenueCents) * 100 : null;

  const available = t.unitsIn + t.unitsOnHand;
  t.sellThroughPct = available > 0 ? (t.unitsOut / available) * 100 : 0;
  return t;
}

// ---------------------------------------------------------------
// The licensor report
// ---------------------------------------------------------------

/**
 * The agreement covering a property, or nothing.
 *
 * Returning null rather than a default is the whole point. A report that
 * quietly applied a twelve per cent rate to a property no agreement
 * covers would be a fabricated royalty statement sent to a licensor, and
 * that is the single worst thing this file could produce.
 */
export function contractForLicence(licenceId: string): Contract | null {
  return CONTRACTS.find((c) => c.licenceIds.includes(licenceId)) ?? null;
}

export interface LicensorReport {
  licence: Licence;
  period: PromoPeriod;
  rows: PromoRow[];
  unitsIn: number;
  unitsOut: number;
  unitsOnHand: number;
  sellThroughPct: number;
  /** Retail value of what sold. The royalty base this app models on. */
  netSalesCents: number;
  cogsCents: number;
  contract: Contract | null;
  /** null where no agreement covers the property. Never a default rate. */
  royaltyRatePct: number | null;
  royaltyDueCents: number | null;
  minimumGuaranteeCents: number | null;
  /** True where the period's earned royalty has not cleared the guarantee. */
  belowGuarantee: boolean;
}

/**
 * One property, one period, and the figures a licensor is owed sight of.
 *
 * The shape is what a licensee actually sends: what shipped in, what sold
 * out, what is left, what that came to at retail, and what the royalty on
 * it is under the agreement. Everything else on the promo screen is
 * internal; this is the part that leaves the building.
 */
export function licensorReport(
  licenceId: string,
  periodId: string,
): LicensorReport | null {
  const licence = LICENCE_BY_ID[licenceId];
  const period = PROMO_PERIOD_BY_ID[periodId];
  if (!licence || !period) return null;

  const rows = promoRows(periodId).filter((r) => r.line.licenceId === licenceId);

  let unitsIn = 0;
  let unitsOut = 0;
  let unitsOnHand = 0;
  let netSalesCents = 0;
  let cogsCents = 0;
  for (const r of rows) {
    unitsIn += r.line.unitsIn;
    unitsOut += r.line.unitsOut;
    unitsOnHand += r.line.unitsOnHand;
    netSalesCents += r.revenueCents;
    cogsCents += r.cogsCents;
  }

  const available = unitsIn + unitsOnHand;
  const contract = contractForLicence(licenceId);
  const royaltyRatePct = contract ? contract.royaltyRatePct : null;
  const royaltyDueCents =
    royaltyRatePct === null
      ? null
      : Math.round((netSalesCents * royaltyRatePct) / 100);
  const minimumGuaranteeCents = contract
    ? contract.minimumGuaranteeCents
    : null;

  return {
    licence,
    period,
    rows,
    unitsIn,
    unitsOut,
    unitsOnHand,
    sellThroughPct: available > 0 ? (unitsOut / available) * 100 : 0,
    netSalesCents,
    cogsCents,
    contract,
    royaltyRatePct,
    royaltyDueCents,
    minimumGuaranteeCents,
    belowGuarantee:
      royaltyDueCents !== null &&
      minimumGuaranteeCents !== null &&
      minimumGuaranteeCents > 0 &&
      royaltyDueCents < minimumGuaranteeCents,
  };
}

/** Every property that actually has product against it in a period. */
export function reportableLicenceIds(periodId: string): string[] {
  const seen: string[] = [];
  for (const line of PROMO_LINES) {
    if (line.periodId !== periodId) continue;
    if (!line.licenceId) continue;
    if (!seen.includes(line.licenceId)) seen.push(line.licenceId);
  }
  return seen;
}

/**
 * The same line in the period before, so a report can show a direction.
 *
 * A single period is a photograph. A buyer reading a licensor report
 * wants to know whether the line is going up or down, and a report that
 * cannot say is a report that gets asked the question by email instead.
 */
export function priorPeriodRow(
  row: PromoRow,
  priorPeriodId: string,
): PromoRow | null {
  const prior = PROMO_LINES.find(
    (l) =>
      l.periodId === priorPeriodId &&
      l.name === row.line.name &&
      l.licenceId === row.line.licenceId,
  );
  return prior ? rowFor(prior) : null;
}
