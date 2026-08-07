import type { PlanTotals } from "@/domain/types";
import type { PlanState } from "@/state/PlanProvider";
import { SKU_BY_ID } from "@/data/skus";
import { PACKAGE_BY_ID } from "@/data/packageFormats";
import { PROMOTION_BY_ID } from "@/data/trade";
import { roundCases } from "@/domain/rate";
import { statusFor } from "@/data/accountSkuStatus";
import { caseTerms } from "@/data/tradeTerms";

/**
 * Plan totals.
 *
 * A pure function of plan state, memoized by the caller. Nothing here is
 * ever stored: a stored total is a total that goes stale the moment
 * someone edits a line, and two numbers that disagree is worse than no
 * number at all.
 *
 * Note the ledger discipline. Money is computed from the SELL-IN ledger
 * only, because that is the supplier-to-wholesaler transaction. The
 * retail ledger contributes cases, PODs, and execution counts, and
 * contributes nothing to the dollar figures.
 *
 * THE REQUIRED SELL-IN. Once the order desk became store-only, every plan
 * line was a retail commitment and the sell-in ledger stayed empty, so
 * every dollar figure on the plan page read zero. That is arithmetically
 * correct and commercially useless: cases promised at retail are cases
 * Southern Glazer's has to buy, whether or not anyone has written the sell-in line
 * yet. So the totals now also carry what the sell-in WOULD have to be to
 * cover the retail promises, priced at list.
 *
 * It is kept as a separate set of fields rather than folded into
 * `illustrativeGross`, because a requirement is not a purchase. Booking a
 * requirement as revenue is precisely the accounting error this two-ledger
 * model exists to prevent.
 */
export function computeTotals(plan: PlanState): PlanTotals {
  const accounts = new Set(plan.retail.map((l) => l.accountId));
  const skus = new Set([
    ...plan.retail.map((l) => l.skuId),
    ...plan.sellIn.map((l) => l.skuId),
  ]);

  // --- Sell-in ledger: the only place money lives ------------------
  let illustrativeGross = 0;
  let allowanceTotal = 0;
  let sellInCases = 0;
  let sellInPallets = 0;

  for (const line of plan.sellIn) {
    illustrativeGross += line.cases * line.illustrativePricePerCase;
    sellInCases += line.cases;
    sellInPallets += line.pallets;
    const promo = line.promotionId ? PROMOTION_BY_ID[line.promotionId] : undefined;
    if (promo) allowanceTotal += line.cases * promo.distributorAllowancePerCase;
  }

  // --- Retail ledger: cases, distribution, execution ----------------
  let retailCases = 0;
  let voidsClosed = 0;
  let baseWeeklyCases = 0;
  let incrementalWeeklyCases = 0;
  let displayCount = 0;
  let coldBoxCount = 0;
  let endcapCount = 0;

  for (const line of plan.retail) {
    retailCases += line.cases;
    if (line.closesVoid) voidsClosed += 1;

    const row = statusFor(line.accountId, line.skuId);
    const base = row?.baseWeeklyCases ?? 0;
    baseWeeklyCases += base;

    const promo = line.promotionId ? PROMOTION_BY_ID[line.promotionId] : undefined;
    if (promo) {
      incrementalWeeklyCases += base * (promo.expectedLiftPercent / 100);
    }

    switch (line.commitment.placement) {
      case "back-shelf":
        coldBoxCount += 1;
        break;
      case "endcap":
        endcapCount += 1;
        displayCount += 1;
        break;
      case "secondary-display":
      case "floor-stack":
        displayCount += 1;
        break;
      default:
        break;
    }
  }

  /**
   * What Southern Glazer's has to buy to cover what has been promised at retail,
   * priced at list. The ask, not the sale.
   */
  let requiredValue = 0;
  let requiredAllowance = 0;
  for (const line of plan.retail) {
    requiredValue += line.cases * (caseTerms(line.skuId)?.listPerCase ?? 0);
    const promo = line.promotionId ? PROMOTION_BY_ID[line.promotionId] : undefined;
    if (promo) requiredAllowance += line.cases * promo.distributorAllowancePerCase;
  }

  const illustrativeNet = illustrativeGross - allowanceTotal;

  /**
   * ROI here is deliberately narrow: incremental gross over the period
   * divided by the allowance spent to get it. It does not pretend to be
   * a margin calculation, because margin is not knowable from public
   * information and inventing it would be the kind of precision that
   * gets a candidate caught.
   */
  const periodWeeks = 4;
  /**
   * Average price falls back to the required sell-in when nothing has been
   * booked yet, so the return figure is available while a plan is still
   * being built rather than only after it closes.
   */
  const avgPrice =
    sellInCases > 0
      ? illustrativeGross / sellInCases
      : retailCases > 0
        ? requiredValue / retailCases
        : 0;
  const incrementalValue = incrementalWeeklyCases * periodWeeks * avgPrice;
  const spendBase = allowanceTotal > 0 ? allowanceTotal : requiredAllowance;
  const modeledROI =
    spendBase > 0 ? Math.round((incrementalValue / spendBase) * 100) / 100 : 0;

  return {
    accounts: accounts.size,
    uniqueSkus: skus.size,
    totalCases: retailCases || sellInCases,
    totalPallets: Math.round(sellInPallets * 100) / 100,
    podsAdded: plan.retail.length,
    voidsClosed,
    illustrativeGross: Math.round(illustrativeGross * 100) / 100,
    allowanceTotal: Math.round(allowanceTotal * 100) / 100,
    illustrativeNet: Math.round(illustrativeNet * 100) / 100,
    requiredSellInValue: Math.round(requiredValue * 100) / 100,
    requiredAllowance: Math.round(requiredAllowance * 100) / 100,
    requiredNet: Math.round((requiredValue - requiredAllowance) * 100) / 100,
    baseWeeklyCases: roundCases(baseWeeklyCases),
    incrementalWeeklyCases: roundCases(incrementalWeeklyCases),
    modeledROI,
    displayCount,
    coldBoxCount,
    endcapCount,
  };
}

/** Sell-in cases implied by the retail plan, used to flag a mismatch. */
export function ledgerBalance(plan: PlanState): {
  retailCases: number;
  sellInCases: number;
  balanced: boolean;
  bySku: Array<{ skuId: string; retail: number; sellIn: number; delta: number }>;
} {
  const retailBySku = new Map<string, number>();
  for (const l of plan.retail) {
    retailBySku.set(l.skuId, (retailBySku.get(l.skuId) ?? 0) + l.cases);
  }
  const sellInBySku = new Map<string, number>();
  for (const l of plan.sellIn) {
    sellInBySku.set(l.skuId, (sellInBySku.get(l.skuId) ?? 0) + l.cases);
  }

  const skuIds = new Set([...retailBySku.keys(), ...sellInBySku.keys()]);
  const bySku = [...skuIds].map((skuId) => {
    const retail = retailBySku.get(skuId) ?? 0;
    const sellIn = sellInBySku.get(skuId) ?? 0;
    return { skuId, retail, sellIn, delta: sellIn - retail };
  });

  const retailCases = plan.retail.reduce((s, l) => s + l.cases, 0);
  const sellInCases = plan.sellIn.reduce((s, l) => s + l.cases, 0);

  return {
    retailCases,
    sellInCases,
    balanced: bySku.every((r) => r.delta === 0),
    bySku: bySku.filter((r) => r.delta !== 0),
  };
}

export function skuLabel(skuId: string): string {
  return SKU_BY_ID[skuId]?.label ?? skuId;
}

export function packageLabel(skuId: string): string {
  const sku = SKU_BY_ID[skuId];
  return sku ? PACKAGE_BY_ID[sku.packageFormatId]?.shortLabel ?? "" : "";
}
