import type { AccountSkuStatus, LatLng } from "@/domain/types";
import { STATUS_BY_ACCOUNT, STATUS_BY_SKU } from "@/data/accountSkuStatus";
import { SKU_BY_ID } from "@/data/skus";
import { PACKAGE_BY_ID } from "@/data/packageFormats";
import { BRAND_BY_ID } from "@/data/brands";
import { roundCases } from "@/domain/rate";
import { ACCOUNT_BY_ID } from "@/data/accounts";

/**
 * Distribution selectors.
 *
 * These define the vocabulary the whole app runs on, so the definitions
 * matter as much as the arithmetic:
 *
 *   POD  — a Point of Distribution. One SKU, authorized and physically
 *          present, in one store. Fourteen SKUs present in one account is
 *          14 PODs; one SKU present in fourteen accounts is also 14 PODs.
 *   Void — authorized but not on the shelf. This is the addressable gap
 *          and the reason the map exists.
 *
 * A "not-authorized" row is neither. It is not a gap a DSE can close by
 * selling harder, because the chain has not listed the item. Counting it
 * as a void would inflate the opportunity, which is the most common way
 * a territory plan lies to itself.
 */

export function podsForAccount(accountId: string): number {
  return (STATUS_BY_ACCOUNT[accountId] ?? []).filter(
    (r) => r.status === "distributed",
  ).length;
}

export function voidsForAccount(accountId: string): AccountSkuStatus[] {
  return (STATUS_BY_ACCOUNT[accountId] ?? []).filter((r) => r.status === "void");
}

export function authorizedForAccount(accountId: string): AccountSkuStatus[] {
  return (STATUS_BY_ACCOUNT[accountId] ?? []).filter(
    (r) => r.status === "distributed" || r.status === "void",
  );
}

/** Distribution rate: PODs as a share of what the account could carry. */
export function distributionRate(accountId: string): number {
  const authorized = authorizedForAccount(accountId).length;
  if (authorized === 0) return 0;
  return podsForAccount(accountId) / authorized;
}

export function podsForSku(skuId: string): number {
  return (STATUS_BY_SKU[skuId] ?? []).filter((r) => r.status === "distributed")
    .length;
}

export function voidsForSku(skuId: string): AccountSkuStatus[] {
  return (STATUS_BY_SKU[skuId] ?? []).filter((r) => r.status === "void");
}

/**
 * Modeled weekly cases sitting in an account's voids. This is the number
 * that answers "what is this account worth if we close the gaps," and it
 * is the largest single input to the opportunity score.
 */
export function voidCasesForAccount(accountId: string): number {
  return roundCases(
    voidsForAccount(accountId).reduce((sum, r) => sum + r.baseWeeklyCases, 0),
  );
}

export function baseWeeklyCasesForAccount(accountId: string): number {
  return roundCases(
    (STATUS_BY_ACCOUNT[accountId] ?? [])
      .filter((r) => r.status === "distributed")
      .reduce((sum, r) => sum + r.baseWeeklyCases, 0),
  );
}

/**
 * Back-shelf share against fair share.
 *
 * A door is not a SKU. One back-shelf door holds many facings, so summing
 * a per-SKU door count double-counts badly and makes every account look
 * like it already has more than its fair share. The model here counts
 * FACINGS, which is the unit a rep actually negotiates, and converts to
 * doors once at the end.
 *
 * Fair share is a stated assumption, not a measurement. Real fair share
 * would be indexed to category volume from a syndicated source, which
 * this prototype does not have and does not pretend to have. The
 * shortfall is expressed in doors because doors are what a rep can go
 * and win.
 */
export const FACINGS_PER_COLD_BOX_DOOR = 12;
export const MODELED_FAIR_SHARE = 0.33;

export function coldBoxPosition(accountId: string): {
  totalDoors: number;
  ourFacings: number;
  ourDoors: number;
  fairShareDoors: number;
  gapDoors: number;
  explain: string;
} {
  const account = ACCOUNT_BY_ID[accountId];
  const totalDoors = account?.shelfSectionsTotal ?? 0;

  const ourFacings = (STATUS_BY_ACCOUNT[accountId] ?? [])
    .filter((r) => {
      if (r.status !== "distributed") return false;
      const sku = SKU_BY_ID[r.skuId];
      return PACKAGE_BY_ID[sku.packageFormatId].placementFit.includes("back-shelf");
    })
    .reduce((sum, r) => sum + (r.facings ?? 0), 0);

  const ourDoors = ourFacings / FACINGS_PER_COLD_BOX_DOOR;
  const fairShareDoors = totalDoors * MODELED_FAIR_SHARE;
  const gapDoors = Math.max(0, fairShareDoors - ourDoors);

  return {
    totalDoors,
    ourFacings,
    ourDoors: Math.round(ourDoors * 10) / 10,
    fairShareDoors: Math.round(fairShareDoors * 10) / 10,
    gapDoors: Math.round(gapDoors * 10) / 10,
    explain:
      `${ourFacings} back-shelf facings at ${FACINGS_PER_COLD_BOX_DOOR} per door is ` +
      `${(Math.round(ourDoors * 10) / 10).toFixed(1)} doors of ${totalDoors}. ` +
      `Modeled fair share at ${Math.round(MODELED_FAIR_SHARE * 100)}% is ` +
      `${(Math.round(fairShareDoors * 10) / 10).toFixed(1)} accounts.`,
  };
}

/** Straight-line distance. Labeled as such everywhere it is shown. */
export function haversineMiles(a: LatLng, b: LatLng): number {
  const R = 3958.8;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Which SKUs a void should be closed with, ranked.
 *
 * Package fit does the work here: the top recommendation for a
 * convenience account is a single-serve, not a 24-pack, because that is
 * what sells in a cooler. Innovation SKUs get a deliberate lift, since
 * new-item distribution is the part of the job that does not happen by
 * itself.
 */
export function rankVoids(accountId: string): AccountSkuStatus[] {
  const account = ACCOUNT_BY_ID[accountId];
  if (!account) return [];

  return voidsForAccount(accountId)
    .map((row) => {
      const sku = SKU_BY_ID[row.skuId];
      const brand = BRAND_BY_ID[sku.brandId];
      let score = row.baseWeeklyCases;
      if (sku.innovation2026) score *= 1.35;
      if (brand.family === "above-premium") score *= 1.2;
      if (account.priority === "high") score *= 1.15;
      return { row, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.row);
}
