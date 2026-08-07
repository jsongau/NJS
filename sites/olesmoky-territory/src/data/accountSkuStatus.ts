import type {
  AccountSkuStatus,
  DistributionStatus,
  InventoryState,
  InventorySource,
  Channel,
} from "@/domain/types";
import { CHANNEL_META } from "@/domain/channels";
import { ACCOUNT_SEED_IDS, ACCOUNT_BY_ID } from "./accounts";
import { ACTIVE_SKUS, SKU_BY_ID } from "./skus";
import { PACKAGE_BY_ID } from "./packageFormats";
import { BRAND_BY_ID } from "./brands";
import { CURRENT_PERIOD_ID } from "./trade";

/**
 * The fact table: one row per (account, SKU, period).
 *
 * This is generated from explicit rules rather than hand-authored, for
 * three reasons. It stays internally consistent across every account
 * and SKU pair. The rules are legible, so the pattern in the data can be
 * explained instead of defended. And it is deterministic, so the app
 * shows the same territory on every load and in every screenshot.
 *
 * Determinism comes from a seeded PRNG, not Math.random. A prototype
 * whose numbers shift between a screenshot and a live demo is worse than
 * one with obviously synthetic numbers.
 *
 * Everything produced here is illustrative. It is a plausible territory,
 * not a claim about what these stores actually carry.
 */

// --- Seeded PRNG (mulberry32) ------------------------------------
function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable per-pair seed so a row never depends on iteration order. */
function pairSeed(accountId: string, skuId: string): number {
  let h = 2166136261;
  const s = accountId + "::" + skuId;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// --- Rules -------------------------------------------------------

/**
 * Rule 1: authorization follows the package, not the brand.
 * A 24oz single is a convenience SKU. A half-barrel keg is not a grocery
 * SKU. PackageFormat.channelFit already encodes this, so authorization
 * is simply channel membership.
 */
function isAuthorized(channel: Channel, skuId: string): boolean {
  const sku = SKU_BY_ID[skuId];
  const pkg = PACKAGE_BY_ID[sku.packageFormatId];
  return pkg.channelFit.includes(channel);
}

const VENUE_FACTOR: Record<Channel, number> = {
  "beverage-specialty": 1.0,
  "liquor-store": 0.52,
  "neighborhood-market": 0.34,
  convenience: 0.3,
  "fuel-convenience": 0.16,
  // On-premise is an order of magnitude smaller per SKU, and it should
  // be. See the comment above this function.
  "sports-bar": 0.085,
  "casual-dining": 0.055,
  "bowling-entertainment": 0.05,
  steakhouse: 0.045,
  pub: 0.038,
};

/**
 * Rule 2: base velocity, and the unit it is measured in.
 *
 * THE HARD PART OF THIS FILE IS THAT A CASE MEANS TWO DIFFERENT THINGS.
 * A bottle shop selling four cases a week of Original Moonshine is
 * selling forty-eight transactions. A neighbourhood pub selling four
 * cases a week of anything would be pouring eight hundred drinks, which
 * is not a pub, it is a stadium.
 *
 * So the rate is stored as a FRACTIONAL case rate rather than being
 * floored at one. An on-premise line that reads 0.31 cases a week is
 * saying "about four bottles" — which is the truth about a back bar, and
 * which the old `Math.max(1, ...)` floor made it structurally impossible
 * to express. Every rate on screen is formatted through weeklyRate() in
 * domain/rate.ts, which turns that same number into cases at a shop and
 * into bottles and pours at a bar.
 *
 * A model that cannot represent a small number will invent a large one.
 */
function baseVelocity(accountId: string, skuId: string, rng: () => number): number {
  const account = ACCOUNT_BY_ID[accountId];
  const sku = SKU_BY_ID[skuId];
  const brand = BRAND_BY_ID[sku.brandId];
  const pkg = PACKAGE_BY_ID[sku.packageFormatId];

  const trafficFactor = account.trafficTier === 1 ? 1.0 : account.trafficTier === 2 ? 0.62 : 0.34;

  /*
    Family weight, and the last number in this file still carrying a
    beer-era assumption.

    THE `rtd` SLOT WAS `non-alc` IN THE ORIGINAL BUILD. 0.2 was right for
    that: non-alcoholic beer is a real but small sliver of a brewer's
    volume, and it belonged at the bottom of every list. When the
    portfolio flipped to spirits the slot was renamed — the id, and later
    the label, which had been sitting on screen calling a 4.5% canned
    cocktail "Non-alc" — but the WEIGHT was never revisited. A rename is
    not a re-model.

    So the app has been contradicting itself in public. vocabulary.ts
    describes this family as the fastest growing segment, in a chip
    rendered next to a number that ranks it dead last, which is the sort
    of thing a category buyer notices in about four seconds.

    0.85 is the honest figure for a spirits portfolio in 2026: ready-to-
    drink is the growth engine of the category, strong enough to beat
    everything except the core jars that built the brand, and not
    pretending to have overtaken them.
  */
  const familyFactor =
    brand.family === "core" ? 1.0
    : brand.family === "rtd" ? 0.85
    : brand.family === "economy" ? 0.55
    : brand.family === "above-premium" ? 0.42
    : 0.38;

  /**
   * How much volume this KIND of account does, relative to the
   * specialist that anchors the scale.
   *
   * BevMo is 1.0 because it is the deepest set in the territory and the
   * only off-premise account a shopper visits intending to discover
   * something. Everything else is a fraction of it. A fuel forecourt at
   * 0.16 is not a slight: it is a counter with room for minis, and
   * modelling it as a small liquor store would have the app recommending
   * handles to a petrol station.
   */


  /**
   * Package fit inside the channel, which is a separate question from
   * how big the channel is.
   *
   * A forecourt that stocks a 50ml turns it hard and a 1L not at all.
   * A bar's workhorse is the 1L and the 750, and a mini behind a bar is
   * dead stock. These are the multipliers that stop the app recommending
   * a technically-authorised package into a set it would rot in.
   */
  const onPremise = CHANNEL_META[account.channel].venueClass === "on-premise";
  const packFactor =
    account.channel === "fuel-convenience"
      ? pkg.unitSizeOz <= 3 ? 2.4 : pkg.unitSizeOz <= 13 ? 1.1 : 0.25
      : account.channel === "convenience"
        ? pkg.unitSizeOz <= 13 ? 1.5 : pkg.unitSizeOz >= 50 ? 0.2 : 0.9
        : onPremise
          ? pkg.unitSizeOz >= 50 ? 1.2 : pkg.unitSizeOz >= 33 ? 1.35 : pkg.unitSizeOz >= 25 ? 1.0 : 0.15
          : pkg.unitSizeOz <= 3 ? 0.3
            : pkg.unitSizeOz >= 50 ? 1.15 : 1.0;

  /**
   * Where a brand over- or under-indexes for the occasion, rather than
   * for a demographic.
   *
   * The old file indexed brands to the shopper base of a banner. That
   * was a beer-era assumption and it does not survive the move to this
   * roster, which is bottle shops and bars rather than supermarkets. The
   * honest driver here is OCCASION: a steakhouse pours the straight
   * bourbon and will not pour a cream liqueur at nine on a Friday; a
   * bowling alley moves ready-to-drink cans by the bucket because lane
   * service cannot make cocktails; a sports bar's flavoured range spikes
   * around a televised card and its bourbon does not.
   */
  let affinity = 1.0;
  /*
    A CAN IS THE MOST NATURAL SPIRITS FORMAT A CONVENIENCE STORE SELLS,
    and this is the clause that says so.

    Everything a c-store is good at, a ready-to-drink can needs: cold,
    single-serve, no glassware, no mixing, decided in the eight seconds
    somebody is standing at a cooler door. Everything it is bad at — a
    considered purchase off a deep shelf — is what a 750ml jar of
    100-proof moonshine wants. The forecourt is the same argument again
    with less room, so the multiplier is the same.

    Before this, a spirits territory app was recommending a jar of
    cherries as the lead item at a 7-Eleven, which is not a modelling
    quirk. It is the model saying something a rep would be laughed at
    for saying out loud.
  */
  if (account.channel === "convenience" || account.channel === "fuel-convenience") {
    if (brand.family === "rtd") affinity *= 1.9;
  } else if (account.channel === "steakhouse") {
    if (brand.family === "above-premium") affinity *= 2.2;
    if (brand.family === "flavor") affinity *= 0.5;
    if (brand.family === "rtd") affinity *= 0.3;
  } else if (account.channel === "sports-bar") {
    if (brand.family === "flavor") affinity *= 1.5;
    if (brand.family === "core") affinity *= 1.3;
  } else if (account.channel === "bowling-entertainment") {
    if (brand.family === "rtd") affinity *= 2.6;
    if (brand.family === "flavor") affinity *= 1.2;
  } else if (account.channel === "casual-dining") {
    if (brand.family === "flavor") affinity *= 1.4;
    if (brand.family === "above-premium") affinity *= 0.7;
  } else if (account.channel === "pub") {
    if (brand.family === "above-premium") affinity *= 1.4;
  } else if (account.channel === "beverage-specialty") {
    if (brand.family === "above-premium") affinity *= 1.45;
  }

  /**
   * The anchor: cases a week for a tier-1 core SKU at the specialist.
   *
   * This was 26 in the beer build, and 26 was wrong by a factor of two.
   * Eleven puts the lead jar at roughly eleven cases a week in the
   * territory's biggest off-premise account, which is the right order of
   * magnitude for a 750ml spirit, and it puts a whole store order in the
   * twenty to fifty case range — a real drop off a real truck.
   *
   * Still illustrative. Nielsen and Circana store-level velocity is
   * licensed data and none of it is in this prototype.
   */
  const raw = 11 * trafficFactor * familyFactor * VENUE_FACTOR[account.channel] * packFactor * affinity;
  const jitter = 0.82 + rng() * 0.36;
  /*
    Two decimal places, and a floor of 0.02 rather than 1.

    The floor exists so a distributed line is never reported as moving
    nothing at all — a bottle that sells once a year is a delisting
    conversation, not a zero — and it is small enough that the rate
    formatter will honestly render it as "under a bottle a week".
  */
  return Math.max(0.02, Math.round(raw * jitter * 100) / 100);
}

/**
 * Rule 3: voids. Roughly a fifth of authorized SKUs are not on the shelf,
 * weighted toward innovation and above-premium, which is where real
 * distribution gaps concentrate. Core light beer is rarely a void in a
 * grocery account, and the data reflects that.
 */
function distributionStatus(
  accountId: string,
  skuId: string,
  rng: () => number,
): DistributionStatus {
  const account = ACCOUNT_BY_ID[accountId];
  const sku = SKU_BY_ID[skuId];
  const brand = BRAND_BY_ID[sku.brandId];
  if (!isAuthorized(account.channel, skuId)) return "not-authorized";

  let voidChance =
    brand.family === "core" ? 0.07
    : brand.family === "economy" ? 0.22
    : brand.family === "above-premium" ? 0.3
    : 0.34;

  /*
    A back bar is a far scarcer piece of real estate than a shelf run.
    A liquor store can carry fourteen Ole Smoky SKUs without anyone
    noticing; a bar carries three or four, and the fourth one has to
    displace something. So on-premise voids are structurally commoner,
    and that is not a failure of execution — it is the shape of the
    opportunity, and it is the reason the on-premise ask is a menu line
    rather than a shelf reset.
  */
  if (CHANNEL_META[account.channel].venueClass === "on-premise") voidChance += 0.22;

  // New items are the distribution gap that does not close by itself.
  // The 2026 single-serve slate is the clearest case in this territory:
  // the packages exist and the accounts exist, but the placements have
  // not been made, which is exactly the work this job is.
  if (sku.innovation2026) {
    voidChance += account.channel === "convenience" ? 0.42 : 0.24;
  }
  if (account.priority === "low") voidChance += 0.1;
  if (account.channel === "fuel-convenience") voidChance += 0.2;

  const r = rng();
  if (r < voidChance) return "void";
  if (r > 0.985) return "discontinued";
  return "distributed";
}

/**
 * Rule 4: inventory state, and how it was learned.
 *
 * This is the honest part. A supplier cannot see a retailer's inventory
 * system, so nothing here is a live feed. A distributed SKU is either
 * observed on the last store visit, reported by the distributor's rep,
 * or inferred from depletion velocity, and the row records which. Rows
 * that were never looked at say "unknown" rather than guessing.
 */
function inventory(
  accountId: string,
  status: DistributionStatus,
  weekly: number,
  rng: () => number,
): { state: InventoryState; source: InventorySource; observedAt?: string } {
  if (status !== "distributed") return { state: "unknown", source: "unknown" };

  const account = ACCOUNT_BY_ID[accountId];
  const r = rng();

  // Higher-velocity SKUs run out more often, which is the whole reason
  // out-of-stock is a priority signal rather than a nuisance.
  /*
    Relative to the account's own top line, not to an absolute case
    figure. An absolute threshold ("18 cases a week runs out often") is a
    supermarket rule, and applied to a bar it would conclude that nothing
    behind any bar ever goes empty — which is the opposite of true. A bar
    runs out of its lead pour constantly; it just does so at four bottles
    a week rather than eighteen cases.
  */
  /*
    SCALED TO THE CHANNEL, because a flat 12 meant the busiest item in a
    convenience store could never be flagged as running short.

    Twelve cases a week is a fast line at the specialist that anchors the
    scale. At a 7-Eleven the fastest thing in the store moves five, so
    under the old flat threshold NOTHING at that account ever qualified —
    and out-of-stock stopped correlating with velocity entirely and
    became pure dice. That is backwards. Fast movers are precisely what
    empties between visits; it is the whole reason velocity is a priority
    signal rather than a statistic.

    Reusing VENUE_FACTOR keeps it honest: the threshold and the velocity
    that has to clear it are derived from the same number, so they cannot
    drift apart the way these two just did.
  */
  const fastForVenue =
    CHANNEL_META[account.channel].venueClass === "on-premise"
      ? 0.28
      : 12 * VENUE_FACTOR[account.channel];
  const fast = weekly >= fastForVenue;
  const veryFast = weekly >= fastForVenue * 1.5;
  const outChance = veryFast ? 0.09 : fast ? 0.05 : 0.025;

  /*
    LOW SCALES WITH VELOCITY TOO. It was a flat 0.14, which gave the
    fastest line in a store and a dormant one identical odds of being
    reported as running short — while the line directly above it went to
    some trouble to make out-of-stock velocity-dependent.

    Half a rule is worse than none, because the half that works makes the
    half that does not look deliberate. A store's top seller is the thing
    that gets thin between visits; that is the entire argument for
    treating velocity as a priority signal, and the model has to actually
    say it.
  */
  const lowChance = veryFast ? 0.34 : fast ? 0.22 : 0.12;

  if (r < outChance) {
    return { state: "out-of-stock", source: "observed", observedAt: account.lastVisitDate };
  }
  if (r < outChance + lowChance) {
    return {
      state: "low",
      source: rng() < 0.5 ? "observed" : "distributor-reported",
      observedAt: account.lastVisitDate,
    };
  }
  if (r < 0.72) {
    return { state: "in-stock", source: "observed", observedAt: account.lastVisitDate };
  }
  if (r < 0.9) return { state: "in-stock", source: "distributor-reported" };
  return { state: "in-stock", source: "modeled" };
}

// --- Build -------------------------------------------------------

function build(): AccountSkuStatus[] {
  const rows: AccountSkuStatus[] = [];

  for (const accountId of ACCOUNT_SEED_IDS) {
    const account = ACCOUNT_BY_ID[accountId];
    // Accounts without a geocoded coordinate are not in ACCOUNT_BY_ID.
    if (!account) continue;

    for (const sku of ACTIVE_SKUS) {
      const rng = makeRng(pairSeed(accountId, sku.id));
      const status = distributionStatus(accountId, sku.id, rng);
      const weekly = baseVelocity(accountId, sku.id, rng);
      const inv = inventory(accountId, status, weekly, rng);
      const pkg = PACKAGE_BY_ID[sku.packageFormatId];

      // Facings are the unit a rep negotiates, and the unit back-shelf
      // share is computed from. Kept deliberately tight: a single SKU
      // holding six facings in a grocery back shelf would be unusual.
      const facings =
        status === "distributed"
          ? Math.max(1, Math.min(4, Math.round((weekly / 6) * (0.7 + rng() * 0.7))))
          : undefined;

      // No per-SKU door count is stored. A door holds many facings, so
      // back-shelf position is derived from facings once at the account
      // level (see coldBoxPosition). Storing doors per SKU here was the
      // original modeling error: it double-counted and made every
      // account look like it already held more than its fair share.

      rows.push({
        accountId,
        skuId: sku.id,
        periodId: CURRENT_PERIOD_ID,
        status,
        facings,
        shelfPricePoint:
          status === "distributed"
            ? Math.round((pkg.unitsPerCase * 1.35 + rng() * 4) * 100) / 100
            : undefined,
        inventoryState: inv.state,
        inventorySource: inv.source,
        inventoryObservedAt: inv.observedAt,
        baseWeeklyCases: status === "distributed" ? weekly : status === "void" ? weekly : 0,
        confidence:
          inv.source === "observed" ? "high" : inv.source === "distributor-reported" ? "medium" : "low",
        provenance: "illustrative",
      });
    }
  }

  return rows;
}

export const ACCOUNT_SKU_STATUS: AccountSkuStatus[] = build();

/** Indexed lookups, built once. The selectors read these, not the array. */
export const STATUS_BY_ACCOUNT = ACCOUNT_SKU_STATUS.reduce<
  Record<string, AccountSkuStatus[]>
>((acc, row) => {
  (acc[row.accountId] ||= []).push(row);
  return acc;
}, {});

export const STATUS_BY_SKU = ACCOUNT_SKU_STATUS.reduce<
  Record<string, AccountSkuStatus[]>
>((acc, row) => {
  (acc[row.skuId] ||= []).push(row);
  return acc;
}, {});

export function statusFor(
  accountId: string,
  skuId: string,
): AccountSkuStatus | undefined {
  return STATUS_BY_ACCOUNT[accountId]?.find((r) => r.skuId === skuId);
}
