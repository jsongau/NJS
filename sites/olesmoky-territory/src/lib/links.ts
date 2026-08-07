import type { RetailOrderLine } from "@/domain/selectors/retailOrder";

/**
 * Where order links are shaped.
 *
 * Three places build a store link: the drawer header button, the Order
 * tab, and the store list on the supply desk. They were drifting apart
 * within a day of each other, which is how a link ends up working from
 * one screen and 404ing from another. One function, one shape.
 *
 * `import.meta.env.BASE_URL` matters here. The app is served from
 * /olesmoky/, so a link built from the route alone would drop the
 * prefix and land on the portfolio site's 404 instead of the portal.
 */
export const DEMO_STORE_REF = "OS-DEMO-STORE-0042";

function origin(): string {
  return typeof window !== "undefined"
    ? `${window.location.origin}${import.meta.env.BASE_URL}`
    : "/";
}

export function storeOrderLink(
  accountId: string,
  lines: RetailOrderLine[] = [],
  ref: string = DEMO_STORE_REF,
): string {
  const base = `${origin()}store-order/${accountId}`;
  if (lines.length === 0) return base;
  const sku = lines.map((l) => l.skuId).join(",");
  const cases = lines.map((l) => l.suggestedCases).join(",");
  return `${base}?sku=${sku}&cases=${cases}&ref=${ref}`;
}

export function distributorOrderLink(
  distributorId: string,
  skuIds: string[] = [],
  cases: number[] = [],
  periodId?: string,
  ref = "OS-DEMO-2026-0042",
): string {
  const base = `${origin()}order/${distributorId}`;
  if (skuIds.length === 0) return base;
  return `${base}?sku=${skuIds.join(",")}&cases=${cases.join(",")}${
    periodId ? `&period=${periodId}` : ""
  }&ref=${ref}`;
}
