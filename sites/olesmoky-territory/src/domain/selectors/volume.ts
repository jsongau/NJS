import { CHANNEL_META } from "@/domain/channels";
import { weeklyRate, orderIncrementFor } from "@/domain/rate";
import type { VolumeEstimate, AccountSkuStatus, Promotion } from "@/domain/types";
import { SKU_BY_ID } from "@/data/skus";
import { PACKAGE_BY_ID } from "@/data/packageFormats";
import { BRAND_BY_ID } from "@/data/brands";
import { ACCOUNT_BY_ID } from "@/data/accounts";
import { statusFor } from "@/data/accountSkuStatus";

/** Two decimals, and no trailing ".00" — a rate is not money. */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}


/**
 * Volume estimates, with the arithmetic carried alongside the number.
 *
 * Every estimate returns a `calculation` array that the UI renders under
 * the figure. This is the difference between an app that asserts 36 and
 * an app that shows how it got to 36; only the second one is evidence of
 * how someone thinks. It also means a wrong assumption is arguable rather
 * than invisible.
 */

/**
 * Suggested opening quantity for closing a void.
 *
 * Anchored to a delivery cycle rather than to a week, because that is how
 * an order is actually cut: enough to fill the shelf and cover the
 * interval until the next drop, rounded to something a rep would say out
 * loud rather than a decimal.
 */
export function suggestedCasesForVoid(
  accountId: string,
  skuId: string,
  weeksOfCover = 2,
): { cases: number; calculation: string[] } {
  const row = statusFor(accountId, skuId);
  const sku = SKU_BY_ID[skuId];
  const pkg = sku ? PACKAGE_BY_ID[sku.packageFormatId] : undefined;
  const account = ACCOUNT_BY_ID[accountId];
  const weekly = row?.baseWeeklyCases ?? 0;

  const raw = weekly * weeksOfCover;
  /*
    The increment is a LANE fact, not a package fact, and it used to be
    hardcoded to four.

    Four cases is an ordinary minimum at a bottle shop. At a pub it is
    forty-eight bottles of one flavour into a back bar that holds four:
    a year of stock, and a manager who stops taking the call. Since this
    roster added fifteen bars, the rounding rule that produced good
    numbers for twenty supermarkets became the single worst number in
    the app.
  */
  const increment = orderIncrementFor(account, pkg?.casesPerPallet ?? 60);
  const cases = Math.max(increment, Math.round(raw / increment) * increment);
  const rate = weeklyRate(account, weekly, pkg?.unitsPerCase ?? 12);

  return {
    cases,
    calculation: [
      `${rate.text} at this account`,
      `${weeksOfCover} ${weeksOfCover === 1 ? "week" : "weeks"} of cover is ${round2(raw)} cases`,
      `Rounded to the nearest ${increment} for a clean order line: ${cases}`,
    ],
  };
}

/** Replenishment for an account that is out of stock on a distributed SKU. */
export function suggestedReplenishment(
  accountId: string,
  skuId: string,
): { cases: number; weekly: number; calculation: string[] } {
  const row = statusFor(accountId, skuId);
  const account = ACCOUNT_BY_ID[accountId];
  const sku = SKU_BY_ID[skuId];
  const pkg = sku ? PACKAGE_BY_ID[sku.packageFormatId] : undefined;
  const weekly = row?.baseWeeklyCases ?? 0;
  // Out of stock means the set is empty, so the order has to refill it
  // as well as cover the cycle. Two weeks of cover plus the refill.
  const increment = orderIncrementFor(account, pkg?.casesPerPallet ?? 60);
  const cases = Math.max(increment, Math.round((weekly * 2) / increment) * increment);
  const rate = weeklyRate(account, weekly, pkg?.unitsPerCase ?? 12);
  return {
    cases,
    weekly,
    calculation: [
      `${rate.text} before it ran out`,
      `Refill plus two weeks of cover is ${round2(weekly * 2)} cases`,
      `Rounded to ${cases} for the order line`,
    ],
  };
}

/**
 * What a placement is worth over a promotional window.
 *
 * Lift is applied to the base rate, not invented on top of it, and the
 * promotional figure is deliberately NOT presented as incremental on its
 * own: incremental is the difference, and conflating the two is the most
 * common way a plan overstates itself.
 */
export function volumeEstimate(
  row: AccountSkuStatus,
  promotion?: Promotion,
): VolumeEstimate {
  const base = row.baseWeeklyCases;
  const lift = promotion ? promotion.expectedLiftPercent / 100 : 0;
  const promotional = Math.round(base * (1 + lift));
  const incremental = promotional - base;

  const calculation = [
    `Base is ${base} modeled weekly cases`,
    promotion
      ? `${promotion.name} models a ${promotion.expectedLiftPercent}% lift`
      : "No promotion applied, so promotional equals base",
    `Promotional weekly is ${base} x ${(1 + lift).toFixed(2)} = ${promotional}`,
    `Incremental is ${promotional} minus ${base} = ${incremental}`,
  ];

  return {
    baseWeeklyCases: base,
    promotionalWeeklyCases: promotional,
    incrementalCases: incremental,
    confidence: row.confidence,
    calculation,
    provenance: "modeled",
  };
}

/**
 * Recommended placement for a SKU at an account.
 *
 * PLACEMENT IS THE ASK, so this function is the sentence the rep says
 * out loud. Package fit does most of the work — a 50ml belongs at a
 * till and a 1.75L handle does not — but the venue class decides what
 * kind of thing is even being asked for. Off-premise, the ask is a
 * position in a set. On-premise it is a position behind a bar, and the
 * two are not interchangeable words for the same negotiation.
 *
 * The on-premise branch is where a beer-era model would have failed
 * silently: it would have recommended a cooler door at a steakhouse and
 * been confidently, uselessly wrong.
 */
export function recommendedPlacement(
  accountId: string,
  skuId: string,
): { placement: string; location: string; rationale: string } {
  const account = ACCOUNT_BY_ID[accountId];
  const sku = SKU_BY_ID[skuId];
  const pkg = sku ? PACKAGE_BY_ID[sku.packageFormatId] : undefined;
  const brand = sku ? BRAND_BY_ID[sku.brandId] : undefined;

  if (!account || !pkg) {
    return { placement: "shelf", location: "Main set", rationale: "Default placement." };
  }

  // --- On-premise ---------------------------------------------------
  if (CHANNEL_META[account.channel].venueClass === "on-premise") {
    /*
      Ready-to-drink behind a bar is not a back-bar item, it is a
      SERVICE item — the point of a can is that it reaches a guest
      without a bartender making anything. At a bowling alley that is
      most of the beverage business, because nobody is walking to the
      bar between frames.
    */
    if (brand?.family === "rtd") {
      return {
        placement: "menu-feature",
        location:
          account.channel === "bowling-entertainment"
            ? "Lane service list and the cooler behind the bar"
            : "Canned cocktail list and the speed cooler",
        rationale:
          "A can needs no bartender, which is the entire argument for it. Its placement is wherever an order is taken away from the bar.",
      };
    }

    /*
      The 1.75L handle is a WELL bottle. Nobody displays a handle, and
      putting one on a lit back bar reads as a value brand rather than a
      premium one — the format itself makes the argument. The well is
      the higher-volume position and the lower-visibility one, which is
      the trade every bar makes on a house pour.
    */
    if (pkg.unitSizeOz >= 50) {
      return {
        placement: "well",
        location: "Speed rail, house call position",
        rationale:
          "A handle earns its place on pour cost, not on visibility. The well is where the volume is and where a house pour is decided by the bartender rather than by the guest.",
      };
    }

    /*
      The jar. This is the one placement recommendation in the app that
      is specific to THIS brand rather than to the category: a mason jar
      is identifiable from across a room in a way a bottle is not, so
      the back bar is worth more to Ole Smoky than it is to a
      competitor with a conventional bottle. Asking for the lit shelf is
      asking for the thing the packaging was designed to exploit.
    */
    if (pkg.id === "jar-750") {
      return {
        placement: "back-bar",
        location: "Back bar, lit tier, eye level",
        rationale:
          "The jar is legible from a table, which no other bottle back here is. That visibility is worth more than the shelf itself — a guest who can read it from their seat can order it without asking what it is.",
      };
    }

    if (brand?.family === "above-premium") {
      return {
        placement: "back-bar",
        location: "Back bar, whiskey tier",
        rationale:
          "A straight bourbon is ordered by name or not at all, so it has to be visible in the set a guest scans when they are deciding to trade up.",
      };
    }

    return {
      placement: "menu-feature",
      location: "Signature cocktail line on the drinks menu",
      rationale:
        "A flavoured whiskey behind a bar sells as a drink rather than as a brand. A printed cocktail line is the only placement here a guest actually reads.",
    };
  }

  // --- Off-premise --------------------------------------------------
  /*
    A forecourt or a counter store is a two-metre set at a till. The
    50ml is not a trial device here, it is the whole business: it is the
    only spirits format that survives an impulse decision made while
    somebody is paying for fuel.
  */
  if (
    account.channel === "fuel-convenience" ||
    account.channel === "convenience"
  ) {
    if (pkg.unitSizeOz <= 3) {
      return {
        placement: "checkout",
        location: "Counter unit, at the till",
        rationale:
          "A mini is an impulse decision made while paying. Six feet away in a locked case is the difference between selling it and not.",
      };
    }
    return {
      placement: "shelf",
      location: "Licensed set, eye level",
      rationale:
        "The set here is small enough that eye level is the only position worth negotiating for.",
    };
  }

  if (account.channel === "beverage-specialty" && brand?.family === "above-premium") {
    return {
      placement: "endcap",
      location: "American whiskey endcap",
      rationale:
        "Above-premium earns its margin from discovery, and the endcap is where discovery happens in this channel.",
    };
  }

  if (pkg.unitsPerCase >= 24) {
    return {
      placement: "secondary-display",
      location: "Front-of-store secondary display",
      rationale: "Large packs sell on display volume, not on shelf position.",
    };
  }

  return {
    placement: "shelf",
    location: "Moonshine and flavoured whiskey set, brand block",
    rationale: "Standard set placement holds the brand block together.",
  };
}
