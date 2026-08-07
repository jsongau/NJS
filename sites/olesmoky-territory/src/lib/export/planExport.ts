import type { PlanState } from "@/state/PlanProvider";
import { ACCOUNT_BY_ID } from "@/data/accounts";
import { PROMOTION_BY_ID, DISTRIBUTOR_BY_ID } from "@/data/trade";
import { skuLabel, packageLabel } from "@/domain/selectors/planTotals";
import { toCsv, downloadCsv } from "./csv";

/** Sell-in ledger: supplier to wholesaler. This is where money belongs. */
export function sellInCsv(plan: PlanState): string {
  return toCsv(
    [
      "Brand / SKU",
      "Package",
      "Cases",
      "Pallets",
      "Illustrative price per case",
      "Illustrative extended",
      "Promotion",
      "Distributor allowance per case",
      "Illustrative net",
      "Delivery week",
    ],
    plan.sellIn.map((l) => {
      const promo = l.promotionId ? PROMOTION_BY_ID[l.promotionId] : undefined;
      const extended = l.cases * l.illustrativePricePerCase;
      const allowance = promo ? l.cases * promo.distributorAllowancePerCase : 0;
      return [
        skuLabel(l.skuId),
        packageLabel(l.skuId),
        l.cases,
        l.pallets.toFixed(2),
        l.illustrativePricePerCase.toFixed(2),
        extended.toFixed(2),
        promo?.name ?? "",
        promo ? promo.distributorAllowancePerCase.toFixed(2) : "",
        (extended - allowance).toFixed(2),
        l.deliveryWeek,
      ];
    }),
  );
}

/**
 * Retail execution ledger: wholesaler to retail.
 *
 * Note the absence of any money column. That is the point, not an
 * oversight: California does not permit a supplier to pay a retailer for
 * placement, so the retail side of the plan carries commitments and
 * nothing else. An export that added a "retailer allowance" column would
 * be describing a tied-house violation.
 */
export function retailCsv(plan: PlanState): string {
  return toCsv(
    [
      "Account",
      "Channel",
      "City",
      "Address",
      "Brand / SKU",
      "Package",
      "Cases",
      "Pallets",
      "Closes a void",
      "Placement",
      "Recommended location",
      "POS materials",
      "Owner role",
      "Promotion",
      "Delivery week",
      "Execution notes",
    ],
    plan.retail.map((l) => {
      const a = ACCOUNT_BY_ID[l.accountId];
      const promo = l.promotionId ? PROMOTION_BY_ID[l.promotionId] : undefined;
      return [
        a?.chainName ?? l.accountId,
        a?.channel ?? "",
        a?.city ?? "",
        a?.address ?? "",
        skuLabel(l.skuId),
        packageLabel(l.skuId),
        l.cases,
        l.pallets.toFixed(2),
        l.closesVoid ? "yes" : "no",
        l.commitment.placement,
        l.commitment.recommendedLocation,
        l.commitment.posMaterials.join("; "),
        l.commitment.ownerRole,
        promo?.name ?? "",
        l.deliveryWeek,
        l.commitment.executionNotes ?? "",
      ];
    }),
  );
}

export function exportPlanCsvs(plan: PlanState, scenarioName: string): void {
  const slug = scenarioName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const dist = DISTRIBUTOR_BY_ID[
    Object.keys(DISTRIBUTOR_BY_ID).find((k) => k.startsWith("southern-glazers")) ?? ""
  ];
  const prefix = `${slug || "plan"}-${dist ? "sgws" : "plan"}`;
  downloadCsv(`${prefix}-sell-in.csv`, sellInCsv(plan));
  // Two files rather than one wide sheet, because they are two different
  // documents with two different audiences.
  window.setTimeout(
    () => downloadCsv(`${prefix}-retail-execution.csv`, retailCsv(plan)),
    250,
  );
}

/**
 * Shareable link.
 *
 * The plan is compacted to short keys and base64url'd into a query
 * param, so a pasted link reproduces an exact plan with no backend. If
 * the payload would make an unreasonably long URL the caller is told to
 * use CSV instead rather than silently producing a link that some mail
 * client will truncate.
 */
const URL_LIMIT = 1800;

export function encodePlanLink(plan: PlanState, scenarioName: string): string | null {
  const compact = {
    n: scenarioName,
    s: plan.sellIn.map((l) => [l.skuId, l.cases, l.illustrativePricePerCase, l.promotionId ?? "", l.deliveryWeek]),
    r: plan.retail.map((l) => [
      l.accountId,
      l.skuId,
      l.cases,
      l.commitment.placement,
      l.promotionId ?? "",
      l.deliveryWeek,
      l.closesVoid ? 1 : 0,
    ]),
  };
  const json = JSON.stringify(compact);
  const b64 = btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const url = `${window.location.origin}${window.location.pathname}?plan=${b64}`;
  return url.length > URL_LIMIT ? null : url;
}
