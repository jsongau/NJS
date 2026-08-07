import type { BrandFamily, PackageFormat, Sku } from "@/domain/types";
import { PACKAGE_BY_ID } from "./packageFormats";
import { BRAND_BY_ID } from "./brands";
import { SKU_BY_ID } from "./skus";

/**
 * Trade terms: what a case costs, how few you can order, how long it takes.
 *
 * None of this is a Ole Smoky price list. Real wholesale pricing is
 * confidential, varies by state, by chain, and by contract, and inventing
 * a number and calling it theirs would be the least defensible thing in
 * the app. So the model works the way a trade buyer would reason about it
 * from the outside: start at an ordinary US shelf price, read it back to a
 * case cost, and show the arithmetic.
 *
 * Every figure below is marked illustrative and the calculation is shown
 * on screen next to the number.
 *
 * THE RULE THAT SHAPES THIS FILE. California is a three-tier state.
 * Bracket pricing and depletion allowances are lawful between a supplier
 * and a wholesaler, and unlawful between a supplier and a retailer, under
 * B&P Code 25500 and 25502. So money exists on the Southern Glazer's lane and does
 * not exist on the store lane. That is not a display preference, it is
 * why `priceForLane` returns null for retail rather than a hidden number.
 */

/*
  Illustrative wholesale cost of one 750ML UNIT, before format sizing.

  THIS WAS A 12OZ BASE, which is a beer unit, and the arithmetic string
  printed on screen said so out loud: "core at $1.05 per 750ml unit",
  "a 1L is 1.29x a 750ml unit". A spirits book priced off a beer unit is
  the kind of residue that tells a reader the reskin was cosmetic — and
  this app's entire pitch is that changing one fact recalculates
  everything downstream, so a stale base unit contradicts the argument
  rather than merely looking untidy.

  750ml is 25.4oz, which is the reference vessel for the whole portfolio.
*/
const UNIT_BASE_BY_FAMILY: Record<BrandFamily, number> = {
  core: 11.4,
  economy: 10.2,
  "above-premium": 14.8,
  flavor: 11.9,
  rtd: 9.4,
};

/** Bigger liquid, more cost, but not linearly. */
function sizeFactor(pkg: PackageFormat): number {
  if (pkg.container === "keg") return 78;
  return Math.pow(pkg.unitSizeOz / 25.4, 0.85);
}

/** Multi-unit packs carry a lower cost per unit. An 8pk is not 8x a single. */
function packFactor(pkg: PackageFormat): number {
  if (pkg.unitsPerCase >= 24) return 0.72;
  if (pkg.unitsPerCase >= 12) return 0.88;
  return 1;
}

export interface CaseTerms {
  /** Illustrative wholesale cost of one case, supplier to wholesaler. */
  listPerCase: number;
  /** Smallest quantity that can go on one order line, by lane. */
  minimumCases: { distributor: number; store: number };
  leadTime: { label: string; tone: "stock" | "short" | "standard" };
  casesPerPallet: number;
  unitsPerCase: number;
  /** The arithmetic, shown rather than asserted. */
  calculation: string[];
}

export function caseTerms(skuId: string): CaseTerms | undefined {
  const sku: Sku | undefined = SKU_BY_ID[skuId];
  if (!sku) return undefined;
  const pkg = PACKAGE_BY_ID[sku.packageFormatId];
  const brand = BRAND_BY_ID[sku.brandId];
  if (!pkg || !brand) return undefined;

  const unit = UNIT_BASE_BY_FAMILY[brand.family];
  const size = sizeFactor(pkg);
  const pack = packFactor(pkg);
  const raw = unit * size * pkg.unitsPerCase * pack;
  const listPerCase = Math.round(raw * 100) / 100;

  /**
   * Lead time tracks how established the item is. A core light beer runs
   * on a standing production schedule; a 2026 innovation is competing for
   * line time and does not.
   */
  const leadTime: CaseTerms["leadTime"] = sku.innovation2026
    ? { label: "Standard lead, 2 to 3 weeks", tone: "standard" }
    : brand.family === "above-premium" || brand.family === "rtd"
      ? { label: "Short lead, about 1 week", tone: "short" }
      : { label: "In stock", tone: "stock" };

  return {
    listPerCase,
    // A wholesaler orders in pallet fractions; a store orders in cases.
    minimumCases: {
      distributor: pkg.container === "keg" ? 4 : 12,
      store: pkg.container === "keg" ? 1 : 2,
    },
    leadTime,
    casesPerPallet: pkg.casesPerPallet,
    unitsPerCase: pkg.unitsPerCase,
    calculation: [
      `${brand.family} at $${unit.toFixed(2)} per 750ml unit`,
      `${pkg.unitSizeOz}oz is ${size.toFixed(2)}x a 750ml unit`,
      `${pkg.unitsPerCase} units a case, ${pack.toFixed(2)}x for pack size`,
      `$${unit.toFixed(2)} x ${size.toFixed(2)} x ${pkg.unitsPerCase} x ${pack.toFixed(2)} = $${listPerCase.toFixed(2)}`,
    ],
  };
}

/**
 * Volume brackets. Supplier to wholesaler only.
 *
 * A wholesaler who takes a full truck costs less to serve than one taking
 * two pallets, and pricing that reflects it is ordinary trade practice at
 * this tier. Offering the same ladder to a retailer would be a thing a
 * compliance officer would want to talk about.
 */
export interface VolumeBracket {
  minCases: number;
  discount: number;
  label: string;
}

/**
 * Scaled to a wholesaler, not a store. Southern Glazer's moves pallets: 250 cases is
 * roughly two and a half pallets of 12-packs, and 1,500 is most of a
 * truck. Brackets that topped out at 200 would be reached by every order
 * on the first click, which tells a buyer nothing.
 */
export const VOLUME_BRACKETS: VolumeBracket[] = [
  { minCases: 0, discount: 0, label: "List price" },
  { minCases: 250, discount: 0.02, label: "250 cases, 2% off" },
  { minCases: 750, discount: 0.04, label: "750 cases, 4% off" },
  { minCases: 1500, discount: 0.06, label: "1,500 cases, 6% off" },
];

export function bracketFor(totalCases: number): VolumeBracket {
  return [...VOLUME_BRACKETS].reverse().find((b) => totalCases >= b.minCases)!;
}

export function nextBracket(totalCases: number): VolumeBracket | undefined {
  return VOLUME_BRACKETS.find((b) => b.minCases > totalCases);
}

export type OrderLane = "distributor" | "store";

/**
 * The price a lane is allowed to see.
 *
 * Returning null rather than hiding a number in the UI is the point. There
 * is no retail price anywhere in the state, so no future screen can leak
 * one by rendering a field it should not have.
 */
export function priceForLane(skuId: string, lane: OrderLane): number | null {
  if (lane === "store") return null;
  return caseTerms(skuId)?.listPerCase ?? null;
}
