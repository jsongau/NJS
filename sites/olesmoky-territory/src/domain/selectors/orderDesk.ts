import type { BrandFamily } from "@/domain/types";
import { caseTerms, priceForLane, type OrderLane } from "@/data/tradeTerms";
import { SKU_BY_ID } from "@/data/skus";
import { BRAND_BY_ID } from "@/data/brands";
import { ACCOUNT_BY_ID } from "@/data/accounts";
import { STATUS_BY_SKU } from "@/data/accountSkuStatus";
import { supplySignals, accountsOutOf, accountsLowOn } from "./supply";
import { retailOrderLines } from "./retailOrder";

/**
 * One order line, whichever lane you are in.
 *
 * The desk shows the same card whether Southern Glazer's is buying for the territory
 * or one store is buying for its own shelf. What changes is where the
 * numbers come from, what the minimum is, and whether there is a price at
 * all. Collapsing both into one shape here means the builder component
 * does not need to know which lane it is rendering, and a new lane later
 * is a selector rather than a second screen.
 */

export type LineUrgency = "critical" | "high" | "watch" | "new";

/**
 * One door, for the shelf strip.
 *
 * Every account authorized to carry a SKU becomes one mark. Read across
 * and you are reading the territory for that item: how many doors it is
 * in, how many are empty, how many never stocked it. It is the same fact
 * table the rest of the app runs on, drawn at the size of a full stop.
 */
export interface ShelfMark {
  accountId: string;
  name: string;
  state: "in" | "low" | "out" | "void";
}

function shelfFor(skuId: string): ShelfMark[] {
  return (STATUS_BY_SKU[skuId] ?? [])
    .filter((r) => r.status === "distributed" || r.status === "void")
    .map((r) => ({
      accountId: r.accountId,
      name: ACCOUNT_BY_ID[r.accountId]?.chainName ?? r.accountId,
      state:
        r.status === "void"
          ? ("void" as const)
          : r.inventoryState === "out-of-stock"
            ? ("out" as const)
            : r.inventoryState === "low"
              ? ("low" as const)
              : ("in" as const),
    }))
    // Trouble first, so the eye lands on the empty facings.
    .sort((a, b) => {
      const rank = { out: 0, low: 1, void: 2, in: 3 };
      return rank[a.state] - rank[b.state];
    });
}

export interface DeskLine {
  skuId: string;
  label: string;
  brandId: string;
  /** Drives the one piece of colour in the app that encodes data. */
  family: BrandFamily;
  packageLabel: string;
  /** Reads like a real trade code. Illustrative, and labeled as such. */
  itemCode: string;
  suggestedCases: number;
  minimumCases: number;
  listPerCase: number | null;
  leadTime: { label: string; tone: "stock" | "short" | "standard" };
  casesPerPallet: number;
  unitsPerCase: number;
  urgency: LineUrgency;
  /** The reason this line exists. Never omitted. */
  why: string;
  /**
   * Modeled cases a week for this line.
   *
   * CARRIED AS DATA BECAUSE IT USED TO BE PARSED BACK OUT OF PROSE.
   * The email templates needed this number and got it by running
   * /moving (\d+) cases a week/ over the `why` string. That worked
   * exactly until somebody rewrote the sentence — which happened the
   * moment the copy stopped saying "stores like yours" — and then the
   * regex silently returned nothing, `weekly` fell to zero, and the
   * email shipped with a hole in the middle of a sentence.
   *
   * A number that matters should never have to be recovered from the
   * English around it.
   */
  weeklyCases: number;
  /** Accounts driving it, so a line can open the map filtered to them. */
  evidenceAccountIds: string[];
  /** Every authorized door for this SKU, in territory order. The strip. */
  shelf: ShelfMark[];
  priceCalculation: string[];
}


function familyOf(skuId: string): BrandFamily {
  const sku = SKU_BY_ID[skuId];
  return sku ? BRAND_BY_ID[sku.brandId].family : "core";
}

/** OS-BLDK style. Deterministic from the id, so it never drifts. */
function itemCodeFor(skuId: string): string {
  const parts = skuId.split("-");
  const brand = (parts[0] ?? "").slice(0, 4).toUpperCase();
  const rest = parts.slice(1).join("").slice(0, 4).toUpperCase();
  return `OS-${brand}-${rest || "STD"}`;
}

export function accountsDrivingSku(skuId: string): string[] {
  return (STATUS_BY_SKU[skuId] ?? [])
    .filter(
      (r) =>
        (r.status === "distributed" &&
          (r.inventoryState === "out-of-stock" || r.inventoryState === "low")) ||
        r.status === "void",
    )
    .map((r) => r.accountId);
}

/** Southern Glazer's buying for the whole territory. Money is lawful on this lane. */
export function distributorLines(): DeskLine[] {
  return supplySignals()
    .map((s): DeskLine | null => {
      const terms = caseTerms(s.skuId);
      if (!terms) return null;
      const out = accountsOutOf(s.skuId);
      const low = accountsLowOn(s.skuId);

      // Joined with commas into one sentence, then a second sentence for
      // the voids. Joining every clause with a full stop produced
      // "Out at Hong Kong Supermarket. thin at Albertsons", which reads
      // as a string-concatenation bug because it was one.
      const shortage: string[] = [];
      if (out.length)
        shortage.push(
          `out at ${out.slice(0, 3).join(", ")}${out.length > 3 ? ` and ${out.length - 3} more` : ""}`,
        );
      if (low.length) shortage.push(`thin at ${low.slice(0, 2).join(", ")}`);
      shortage.push(
        `moving ${s.weeklyDepletion} cases a week across ${s.accountsCarrying} accounts`,
      );

      const bits = [
        shortage.join(", ").replace(/^./, (c) => c.toUpperCase()),
      ];
      if (s.openVoids > 0)
        bits.push(
          `${s.openVoids} authorized ${s.openVoids === 1 ? "account is" : "accounts are"} not stocking it at all, worth another ${s.voidCases} cases a week`,
        );

      return {
        skuId: s.skuId,
        label: s.label,
        brandId: s.brandId,
        family: familyOf(s.skuId),
        packageLabel: s.packageLabel,
        itemCode: itemCodeFor(s.skuId),
        suggestedCases: Math.max(terms.minimumCases.distributor, s.recommendedCases),
        minimumCases: terms.minimumCases.distributor,
        listPerCase: priceForLane(s.skuId, "distributor"),
        leadTime: terms.leadTime,
        casesPerPallet: terms.casesPerPallet,
        unitsPerCase: terms.unitsPerCase,
        urgency: s.urgency,
        why: bits.join(". ") + ".",
        weeklyCases: Math.round(s.weeklyDepletion),
        evidenceAccountIds: accountsDrivingSku(s.skuId),
        shelf: shelfFor(s.skuId),
        priceCalculation: terms.calculation,
      };
    })
    .filter((l): l is DeskLine => l !== null);
}

/** One store buying for its own shelf. No money on this lane, by law. */
export function storeLines(accountId: string): DeskLine[] {
  const account = ACCOUNT_BY_ID[accountId];
  if (!account) return [];

  return retailOrderLines(accountId)
    .map((l): DeskLine | null => {
      const terms = caseTerms(l.skuId);
      if (!terms) return null;
      return {
        skuId: l.skuId,
        label: l.label,
        brandId: l.brandId,
        family: familyOf(l.skuId),
        packageLabel: l.packageLabel,
        itemCode: itemCodeFor(l.skuId),
        suggestedCases: Math.max(terms.minimumCases.store, l.suggestedCases),
        minimumCases: terms.minimumCases.store,
        listPerCase: priceForLane(l.skuId, "store"),
        leadTime: terms.leadTime,
        casesPerPallet: terms.casesPerPallet,
        unitsPerCase: terms.unitsPerCase,
        urgency:
          l.kind === "out"
            ? "critical"
            : l.kind === "low"
              ? "high"
              : l.kind === "new"
                ? "new"
                : "watch",
        why: l.reason,
        weeklyCases: l.weeklyCases,
        evidenceAccountIds: [accountId],
        shelf: shelfFor(l.skuId),
        priceCalculation: terms.calculation,
      };
    })
    .filter((l): l is DeskLine => l !== null);
}

export function linesForLane(lane: OrderLane, accountId?: string): DeskLine[] {
  return lane === "distributor"
    ? distributorLines()
    : accountId
      ? storeLines(accountId)
      : [];
}
