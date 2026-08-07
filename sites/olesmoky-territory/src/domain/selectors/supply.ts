import { roundCases } from "@/domain/rate";
import { ACTIVE_SKUS, SKU_BY_ID } from "@/data/skus";
import { PACKAGE_BY_ID } from "@/data/packageFormats";
import { BRAND_BY_ID } from "@/data/brands";
import { STATUS_BY_SKU } from "@/data/accountSkuStatus";
import { ACCOUNT_BY_ID } from "@/data/accounts";

/**
 * Supply pressure by SKU.
 *
 * A Distributor Sales Executive cannot see a distributor's warehouse,
 * and this prototype does not pretend to. What a DSE can see is the
 * retail side: how fast a SKU is depleting across the territory, how
 * many accounts are already out or running low, and how many authorized
 * accounts are not carrying it at all. Those three together are the
 * honest basis for telling a distributor they are about to run short.
 *
 * Every figure here is modeled from that retail picture and labeled as
 * such. Nothing claims to be a warehouse inventory reading.
 */

export interface SupplySignal {
  skuId: string;
  label: string;
  brandId: string;
  packageLabel: string;
  casesPerPallet: number;
  /** Modeled territory-wide weekly depletion for this SKU. */
  weeklyDepletion: number;
  accountsOut: number;
  accountsLow: number;
  accountsCarrying: number;
  openVoids: number;
  voidCases: number;
  /** 0..100. Higher means more urgent. */
  pressure: number;
  /** Cases to cover two weeks of depletion plus the open gaps, rounded. */
  recommendedCases: number;
  reasons: string[];
  urgency: "critical" | "high" | "watch";
}

const ROUND_TO = 12;

export function supplySignals(): SupplySignal[] {
  const signals: SupplySignal[] = ACTIVE_SKUS.map((sku) => {
    const rows = STATUS_BY_SKU[sku.id] ?? [];
    const pkg = PACKAGE_BY_ID[sku.packageFormatId];

    let weeklyDepletion = 0;
    let accountsOut = 0;
    let accountsLow = 0;
    let accountsCarrying = 0;
    let openVoids = 0;
    let voidCases = 0;

    for (const r of rows) {
      if (r.status === "distributed") {
        accountsCarrying += 1;
        weeklyDepletion += r.baseWeeklyCases;
        if (r.inventoryState === "out-of-stock") accountsOut += 1;
        if (r.inventoryState === "low") accountsLow += 1;
      } else if (r.status === "void") {
        openVoids += 1;
        voidCases += r.baseWeeklyCases;
      }
    }

    // Cover two weeks of what is already moving, plus one week of what
    // the open voids would add if they were closed this period.
    weeklyDepletion = roundCases(weeklyDepletion);
    voidCases = roundCases(voidCases);
    const raw = weeklyDepletion * 2 + voidCases;
    const recommendedCases = Math.max(
      ROUND_TO,
      Math.round(raw / ROUND_TO) * ROUND_TO,
    );

    const reasons: string[] = [];
    if (accountsOut > 0) {
      reasons.push(
        `${accountsOut} account${accountsOut === 1 ? "" : "s"} already out of stock`,
      );
    }
    if (accountsLow > 0) {
      reasons.push(`${accountsLow} running low`);
    }
    if (weeklyDepletion > 0) {
      reasons.push(`${weeklyDepletion} modeled cases a week depleting`);
    }
    if (openVoids > 0) {
      reasons.push(
        `${openVoids} authorized account${openVoids === 1 ? "" : "s"} not carrying it, worth ${voidCases} cases a week`,
      );
    }
    if (sku.innovation2026) {
      reasons.push("2026 innovation, distribution still building");
    }

    // Out-of-stocks dominate: an empty shelf is lost volume today, while
    // a void is lost volume that was never happening yet.
    const pressure = Math.min(
      100,
      accountsOut * 26 + accountsLow * 9 + Math.min(30, weeklyDepletion / 4) + Math.min(18, openVoids * 3),
    );

    return {
      skuId: sku.id,
      label: sku.label,
      brandId: sku.brandId,
      packageLabel: pkg?.shortLabel ?? "",
      casesPerPallet: pkg?.casesPerPallet ?? 0,
      weeklyDepletion,
      accountsOut,
      accountsLow,
      accountsCarrying,
      openVoids,
      voidCases,
      pressure: Math.round(pressure),
      recommendedCases,
      reasons,
      urgency: accountsOut >= 2 ? "critical" : accountsOut >= 1 || accountsLow >= 3 ? "high" : "watch",
    };
  });

  return signals.sort((a, b) => b.pressure - a.pressure);
}

/** The SKUs actually worth putting in an email. */
export function lowSupplySkus(limit = 8): SupplySignal[] {
  return supplySignals()
    .filter((s) => s.accountsOut > 0 || s.accountsLow >= 2)
    .slice(0, limit);
}

/** Which accounts are dry on a SKU, for the "why" line in the portal. */
export function accountsOutOf(skuId: string): string[] {
  return (STATUS_BY_SKU[skuId] ?? [])
    .filter((r) => r.status === "distributed" && r.inventoryState === "out-of-stock")
    .map((r) => ACCOUNT_BY_ID[r.accountId]?.chainName)
    .filter((n): n is string => Boolean(n));
}

export function accountsLowOn(skuId: string): string[] {
  return (STATUS_BY_SKU[skuId] ?? [])
    .filter((r) => r.status === "distributed" && r.inventoryState === "low")
    .map((r) => ACCOUNT_BY_ID[r.accountId]?.chainName)
    .filter((n): n is string => Boolean(n));
}

export function brandOf(skuId: string) {
  const sku = SKU_BY_ID[skuId];
  return sku ? BRAND_BY_ID[sku.brandId] : undefined;
}
