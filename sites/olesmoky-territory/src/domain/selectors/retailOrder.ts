import { STATUS_BY_ACCOUNT } from "@/data/accountSkuStatus";
import { SKU_BY_ID } from "@/data/skus";
import { PACKAGE_BY_ID } from "@/data/packageFormats";
import { ACCOUNT_BY_ID } from "@/data/accounts";
import { rankVoids } from "./distribution";
import { suggestedCasesForVoid, suggestedReplenishment } from "./volume";
import type { InventorySource } from "@/domain/types";
import { CHANNEL_META } from "@/domain/channels";
import { weeklyRate } from "@/domain/rate";

/** Sentence case for a fragment that has to start a sentence. */
const cap = (v: string) => (v ? v[0].toUpperCase() + v.slice(1) : v);

const pkgFor = (skuId: string) =>
  PACKAGE_BY_ID[SKU_BY_ID[skuId]?.packageFormatId ?? ""];

/**
 * The reorder a single store should be cutting.
 *
 * This is the retail end of the supply loop, and it is a different
 * question from the one the supply desk answers. The supply desk asks
 * what Southern Glazer's is about to run short of across the whole territory. This
 * asks what one store's shelf is missing this week.
 *
 * Worth being exact about what this is NOT. Ole Smoky does not sell
 * beer to a retailer in California, so nothing produced here is an order
 * a supplier can fill. It is a recommendation that routes to Southern Glazer's
 * Distributing, who holds the license to deliver it. The page built on
 * top of this says so in the first paragraph, because a store buyer who
 * thinks they just bought beer from a distillery has been misled about how
 * the state works.
 */

export type RetailLineKind = "out" | "low" | "new" | "steady";

export interface RetailOrderLine {
  skuId: string;
  label: string;
  brandId: string;
  packageLabel: string;
  unitsPerCase: number;
  kind: RetailLineKind;
  /** Modeled weekly depletion for this SKU at this store. */
  weeklyCases: number;
  suggestedCases: number;
  weeksOfCover: number;
  reason: string;
  inventorySource: InventorySource;
  observedAt?: string;
}

/**
 * Weeks of cover by line kind. An empty facing has to refill the shelf
 * AND cover the cycle; a low one only has to cover the cycle.
 */
const COVER: Record<RetailLineKind, number> = {
  out: 2,
  low: 1,
  new: 2,
  steady: 1,
};

/**
 * One place that answers "how many cases". The store portal quoting 54
 * while the plan said 48 was a real bug once; same function, same
 * rounding, same answer everywhere.
 */
export function casesFor(
  accountId: string,
  skuId: string,
  kind: RetailLineKind,
): number {
  if (kind === "out") return suggestedReplenishment(accountId, skuId).cases;
  return suggestedCasesForVoid(accountId, skuId, COVER[kind]).cases;
}

export function retailOrderLines(accountId: string): RetailOrderLine[] {
  const account = ACCOUNT_BY_ID[accountId];
  if (!account) return [];

  const lines: RetailOrderLine[] = [];

  for (const row of STATUS_BY_ACCOUNT[accountId] ?? []) {
    if (row.status !== "distributed") continue;

    const kind: RetailLineKind =
      row.inventoryState === "out-of-stock"
        ? "out"
        : row.inventoryState === "low"
          ? "low"
          : "steady";

    const weekly = row.baseWeeklyCases;
    const cover = COVER[kind];
    const suggested = casesFor(accountId, row.skuId, kind);

    /**
     * Retailer-facing wording, and it is a TREND claim rather than a
     * claim about their shelf.
     *
     * These used to read "Shelf is empty, seen on a store walk." Two
     * problems with that. It reads like surveillance — a supplier
     * announcing it has been counting a manager's inventory — and it is
     * a claim the manager can walk over and disprove in thirty seconds,
     * at which point every other number here is suspect too.
     *
     * What a supplier can honestly say is how fast the item moves AT
     * THIS ACCOUNT — which the model holds per account and per SKU, so
     * there is no need to hedge it into "stores like yours."
     *
     * THAT HEDGE WAS THE PROBLEM. "Moving about six cases a week in
     * stores like yours" tells a manager two things, and the second one
     * is the one they hear: here is a number, and you are an example of
     * a category rather than a business I know anything about. Nobody
     * wants to be told they are a comparable. The number is the same
     * either way, so the hedge bought nothing and cost the relationship
     * the whole message is trying to build.
     *
     * So the store is the subject of the sentence. "Six cases a week
     * move through here" says exactly as much as the old line and says
     * it to somebody rather than about a segment.
     *
     * AND THE PHRASING VARIES BY ITEM. Two lines that both read
     * "Moving about N cases a week in stores like yours, so you may be
     * getting low" are obviously generated, and a manager who spots the
     * template stops reading the numbers. The variant is picked from
     * the SKU id, so it is stable across renders — the same item always
     * reads the same way — but adjacent lines rarely match.
     *
     * The internal screens keep the inventory language. A rep planning a
     * route SHOULD see what is out where. These strings are the ones a
     * retailer reads.
     */
    const variant = [...row.skuId].reduce((n, c) => n + c.charCodeAt(0), 0) % 3;

    /*
      THE RATE IS FORMATTED, NEVER INTERPOLATED RAW, and this is where
      the roster change would otherwise have shown up worst.

      "About 0.31 cases a week move through here" is a sentence sent to
      a bar manager, and it is the sort of thing that ends a
      relationship with a laugh. weeklyRate() renders the same stored
      number as "about 4 bottles a week, near 60 pours" behind a bar and
      as "about 4 cases a week" in a shop — one fact, and the unit the
      reader actually uses. See domain/rate.ts.

      The set noun moves with it. A bar has no shelf and a shop has no
      back bar, and using the wrong word is the tell that the model does
      not really know the difference.
    */
    const rate = weeklyRate(account, weekly, pkgFor(row.skuId)?.unitsPerCase ?? 12);
    const set = CHANNEL_META[account.channel].spaceNoun;
    /*
      Verb agreement is computed, not guessed. "About 1 case a week move
      through here" is the sentence a template produces when somebody
      assumes the subject is always plural, and it is exactly the sort of
      seam that tells a reader a machine wrote this.
    */
    const countedThing = rate.pours === null ? Math.round(rate.cases) : rate.units;
    const moveVerb = countedThing === 1 ? "moves" : "move";
    const moves = rate.belowUnit
      ? "it moves slowly"
      : `${rate.text} ${moveVerb} through here`;

    const reason =
      kind === "out"
        ? [
            `Your ${set} has been empty on this. ${cap(moves)}, so it has been costing you every one of them — this refills it and carries roughly two weeks.`,
            `Nothing on the ${set}, and ${rate.text} of demand behind it. This puts it back and covers about a fortnight.`,
            `This one is out. At the rate it turns here — ${rate.text} — the gap is real money, and the quantity below closes it for two weeks.`,
          ][variant]
        : kind === "low"
          ? [
              `${cap(moves)}, which leaves you thin by the weekend. This covers it.`,
              `At ${rate.text}, what you are holding runs out before the next delivery. This tops it up.`,
              `Turning ${rate.text} here, so the ${set} gets light before Friday. This keeps it full.`,
            ][variant]
          : [
              `Holding steady at ${rate.text} here.`,
              `A reliable ${rate.text} for you. Nothing to fix, worth keeping stocked.`,
              `Steady seller here, ${rate.text}.`,
            ][variant];

    lines.push({
      skuId: row.skuId,
      label: SKU_BY_ID[row.skuId]?.label ?? row.skuId,
      brandId: SKU_BY_ID[row.skuId]?.brandId ?? "",
      packageLabel: PACKAGE_BY_ID[SKU_BY_ID[row.skuId]?.packageFormatId ?? ""]?.shortLabel ?? "",
      unitsPerCase: PACKAGE_BY_ID[SKU_BY_ID[row.skuId]?.packageFormatId ?? ""]?.unitsPerCase ?? 0,
      kind,
      weeklyCases: weekly,
      suggestedCases: suggested,
      weeksOfCover: cover,
      reason,
      inventorySource: row.inventorySource,
      observedAt: row.inventoryObservedAt,
    });
  }

  // Voids are the growth half of the same conversation. Four of them,
  // ranked, because a reorder sheet with fourteen new items on it stops
  // being a reorder sheet and starts being a pitch a buyer skims past.
  for (const row of rankVoids(accountId).slice(0, 4)) {
    const sku = SKU_BY_ID[row.skuId];
    const pkg = PACKAGE_BY_ID[sku?.packageFormatId ?? ""];
    const weekly = row.baseWeeklyCases;

    lines.push({
      skuId: row.skuId,
      label: sku?.label ?? row.skuId,
      brandId: sku?.brandId ?? "",
      packageLabel: pkg?.shortLabel ?? "",
      unitsPerCase: pkg?.unitsPerCase ?? 0,
      kind: "new",
      weeklyCases: weekly,
      // Exactly what the plan would commit if this void were closed from
      // the SKUs tab. Same function, same rounding, same answer.
      suggestedCases: casesFor(accountId, row.skuId, "new"),
      weeksOfCover: COVER.new,
      reason: (() => {
        const r = weeklyRate(account, weekly, pkg?.unitsPerCase ?? 12);
        const where = CHANNEL_META[account.channel].setName.toLowerCase();
        return sku?.innovation2026
          ? `New for 2026 and not on your ${where} yet. Modelled at ${r.text} for this account, which would make it worth the space.`
          : `Already available to you and not stocked. Modelled at ${r.text} here — the easiest volume on this list.`;
      })(),
      inventorySource: "modeled",
    });
  }

  /*
    Genuine trouble first, then the SIZE OF THE LINE.

    The old rule was urgency all the way down, which buried the biggest
    thing on the truck. At a convenience store the canned line moves five
    cases a week and has to be reordered every visit; a speculative new
    item might do half a case. Ranking "not carried yet, 0.7 a week"
    above "your best seller, 5 a week" is not caution, it is bad
    prioritisation — a rep cutting this order wants the big lines in
    front of them.

    So `out` and `low` keep their place at the top, because an empty
    facing is a problem rather than a preference. Everything below them
    is ranked by how fast it turns.

    NOT by suggested cases, which was the first attempt and was wrong in
    an instructive way: the order increment is coarser for small formats,
    so a 50ml mini rounds up to six cases and a 4-pack of cans does not.
    Ranking on that put minis at the top of every c-store order — the
    model faithfully reporting which item has the clumsiest rounding
    rule, dressed up as a commercial priority. Rate is the honest
    measure of how much business a line is.
  */
  const TROUBLE: Record<RetailLineKind, number> = { out: 0, low: 1, new: 2, steady: 2 };
  return lines.sort(
    (a, b) => TROUBLE[a.kind] - TROUBLE[b.kind] || b.weeklyCases - a.weeklyCases,
  );
}

/** What goes in the email without being asked: the short and the empty. */
export function retailPriorityLines(accountId: string): RetailOrderLine[] {
  return retailOrderLines(accountId).filter((l) => l.kind !== "steady");
}
