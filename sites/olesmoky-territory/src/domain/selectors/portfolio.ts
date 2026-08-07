import { BRANDS } from "@/data/brands";
import { roundCases } from "@/domain/rate";
import { ACTIVE_SKUS, SKU_BY_ID } from "@/data/skus";
import { PACKAGE_BY_ID } from "@/data/packageFormats";
import { ACCOUNTS } from "@/data/accounts";
import { STATUS_BY_SKU } from "@/data/accountSkuStatus";
import type { AccountSkuStatus, BrandFamily } from "@/domain/types";

/**
 * The portfolio view: the same fact table, read down the brand axis
 * instead of the account axis.
 *
 * The territory board answers "what is missing at this store." This
 * answers the other half of the job: "where is this brand under-
 * distributed across my whole territory." A Distributor Sales Executive
 * is measured on both, and a brand with a national push behind it and
 * four PODs in twenty seven accounts is the clearest possible sell-in story.
 */

export interface SkuDistribution {
  skuId: string;
  label: string;
  packageLabel: string;
  innovation2026: boolean;
  pods: number;
  voids: number;
  authorized: number;
  voidCases: number;
  outOfStock: number;
}

export interface BrandDistribution {
  brandId: string;
  name: string;
  family: BrandFamily;
  strategicRole: string;
  strategicRoleSource?: string;
  assetPath?: string;
  active: boolean;
  pods: number;
  voids: number;
  authorized: number;
  /** PODs as a share of what the territory could carry for this brand. */
  distributionRate: number;
  voidCases: number;
  accountsCarrying: number;
  accountsPossible: number;
  skus: SkuDistribution[];
}

function summarize(rows: AccountSkuStatus[]) {
  let pods = 0;
  let voids = 0;
  let voidCases = 0;
  let outOfStock = 0;
  for (const r of rows) {
    if (r.status === "distributed") {
      pods += 1;
      if (r.inventoryState === "out-of-stock") outOfStock += 1;
    } else if (r.status === "void") {
      voids += 1;
      voidCases += r.baseWeeklyCases;
    }
  }
  return {
    pods,
    voids,
    // Rounded here, at the one place the sum is produced. See roundCases.
    voidCases: roundCases(voidCases),
    outOfStock,
    authorized: pods + voids,
  };
}

export function brandDistribution(): BrandDistribution[] {
  const totalAccounts = ACCOUNTS.length;

  return BRANDS.map((brand): BrandDistribution => {
    const skus = ACTIVE_SKUS.filter((s) => s.brandId === brand.id);

    const skuRows: SkuDistribution[] = skus.map((s) => {
      const rows = STATUS_BY_SKU[s.id] ?? [];
      const sum = summarize(rows);
      return {
        skuId: s.id,
        label: s.label,
        packageLabel: PACKAGE_BY_ID[s.packageFormatId]?.shortLabel ?? "",
        innovation2026: Boolean(s.innovation2026),
        pods: sum.pods,
        voids: sum.voids,
        authorized: sum.authorized,
        voidCases: sum.voidCases,
        outOfStock: sum.outOfStock,
      };
    });

    const pods = skuRows.reduce((n, r) => n + r.pods, 0);
    const voids = skuRows.reduce((n, r) => n + r.voids, 0);
    const voidCases = skuRows.reduce((n, r) => n + r.voidCases, 0);
    const authorized = pods + voids;

    // How many distinct accounts carry at least one SKU of this brand.
    const carrying = new Set<string>();
    const possible = new Set<string>();
    for (const s of skus) {
      for (const r of STATUS_BY_SKU[s.id] ?? []) {
        if (r.status === "distributed") carrying.add(r.accountId);
        if (r.status === "distributed" || r.status === "void") possible.add(r.accountId);
      }
    }

    return {
      brandId: brand.id,
      name: brand.name,
      family: brand.family,
      strategicRole: brand.strategicRole,
      strategicRoleSource: brand.strategicRoleSource,
      assetPath: brand.assetPath,
      active: skus.length > 0,
      pods,
      voids,
      authorized,
      distributionRate: authorized > 0 ? pods / authorized : 0,
      voidCases,
      accountsCarrying: carrying.size,
      accountsPossible: possible.size || totalAccounts,
      skus: skuRows.sort((a, b) => b.voidCases - a.voidCases),
    };
  });
}

/** Every open void for a brand, ranked by modeled weekly cases. */
export function voidsForBrand(brandId: string): AccountSkuStatus[] {
  const skuIds = new Set(
    ACTIVE_SKUS.filter((s) => s.brandId === brandId).map((s) => s.id),
  );
  return Object.values(STATUS_BY_SKU)
    .flat()
    .filter((r) => skuIds.has(r.skuId) && r.status === "void")
    .sort((a, b) => b.baseWeeklyCases - a.baseWeeklyCases);
}

export function skuOf(skuId: string) {
  return SKU_BY_ID[skuId];
}
