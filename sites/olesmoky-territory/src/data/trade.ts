import type { Distributor, Territory, Period, Promotion, Provenance } from "@/domain/types";

/**
 * Trade structure for the prototype.
 *
 * ONE HOUSE IS SELECTABLE, AND WHICH ONE FLIPPED WHEN THE PORTFOLIO DID.
 * This model was originally built for a spirits portfolio, where Southern Glazer's
 * Distributing — a Reyes BEER house out of Santa Fe Springs — was the
 * wholesaler whose footprint covers these accounts. Southern Glazer's
 * was recorded but NOT selectable, on the grounds that offering a wine
 * and spirits house for spirits planning is a domain error.
 *
 * Moving the portfolio to Ole Smoky inverts that exactly. Moonshine and
 * whiskey do not move through a spirits wholesaler; in California they move
 * through a licensed wine-and-spirits distributor, and Southern Glazer's
 * is the largest of them. So the tier filter that used to exclude
 * Southern Glazer's now selects it, and Southern Glazer's is the one recorded and
 * not offered.
 *
 * That is worth pointing at, because nothing about the filter changed —
 * only the tier the app asks for. Encoding "which houses may carry this
 * portfolio" as a property of the trade structure rather than as a
 * hard-coded id is why swapping an entire product range did not require
 * touching the order desk.
 *
 *   - Southern Glazer's Wine & Spirits is the wine-and-spirits house for
 *     these accounts. Selectable.
 *
 *     HOW FAR THAT IS VERIFIED, precisely, because naming a real company
 *     in a commercial relationship it may not have is the one mistake
 *     here that would cost more than it gains:
 *
 *       VERIFIED. Ole Smoky moved eleven states plus the District of
 *       Columbia to Southern Wine & Spirits in September 2014, and
 *       California was named in that list. Southern merged with Glazer's
 *       in 2016 to become Southern Glazer's. The relationship was still
 *       live in November 2023, on the record, from a named SGWS
 *       executive: "We have had a strong partnership with Ole Smoky for
 *       many years."
 *
 *       NOT VERIFIED. That Southern Glazer's is Ole Smoky's California
 *       wholesaler TODAY. The only source naming California is twelve
 *       years old, and California is the worst market in the country to
 *       assume continuity in — RNDC exited the state entirely in 2025
 *       and brand assignments were re-cut across it. Ole Smoky has also
 *       never been exclusive to one house: the 2023 Tanteo agreement
 *       covered thirty-six of fifty states, which leaves roughly
 *       fourteen running through somebody else.
 *
 *     So the record below is tagged `modeled`, not `public`. It was
 *     `public` until somebody asked what the significance was and the
 *     honest answer turned out to be "I never checked." Every other
 *     number in this app carries a provenance badge, and the badge is
 *     only worth anything if it is right about this one too.
 *
 *     A single email to Ole Smoky's trade desk settles it. Until then
 *     the app names the partner it can evidence and dates the claim.
 *   - Southern Glazer's (Southern Glazer's Wine & Spirits) is a spirits house. Real,
 *     relevant to a different portfolio, recorded and not offered.
 *   - Gate City Beverage is a Reyes house in San Bernardino, which is the
 *     Inland Empire. A different market. Recorded, not offered.
 */
export const DISTRIBUTORS: Distributor[] = [
  {
    id: "harbor-santa-fe-springs",
    name: "Harbor Distributing",
    parent: "Southern Glazer's Wine & Spirits",
    tier: "beer",
    facilityAddress: "11204 Norwalk Blvd",
    city: "Santa Fe Springs",
    state: "CA",
    postalCode: "90670",
    lat: 33.9329,
    lng: -118.0728,
    locationAccuracy: "approximate",
    contactEmail: "orders@demo-harbor.local",
    contactRole: "Order desk",
    territoryDescription:
      "Serves an expansive territory from Malibu in Los Angeles County to San Clemente in Orange County, operating from Los Angeles, Santa Fe Springs, and Huntington Beach.",
    /* Published on Southern Glazer's own site. These are the numbers that put
       Territory 12 in proportion: 27 accounts out of roughly 13,960, so
       this app is modelling a fraction of one percent of one house. Saying
       that out loud is more credible than implying the territory is the
       business. */
    scale: {
      employees: "1,510+ full-time",
      annualCases: "52.2 million",
      retailAccounts: "13,960",
      skus: "4,445",
      joinedRbg: 1989,
      hq: "Huntington Beach, 400,000 sq ft",
    },
    /*
     * Emptied when the portfolio moved to spirits. Harbor is a real beer
     * house covering these streets and is exactly the right partner for
     * a spirits book — it simply cannot carry a moonshine portfolio, so it
     * stays on the record rather than being deleted.
     */
    servesTerritoryIds: [],
    source: "https://harbordistributingllc.com/",
    provenance: "public",
  },
  {
    id: "southern-glazers-cerritos",
    name: "Southern Glazer's Wine & Spirits",
    tier: "wine-spirits",
    facilityAddress: "17101 Valley View Ave",
    city: "Cerritos",
    state: "CA",
    postalCode: "90703",
    lat: 33.8785,
    lng: -118.0276,
    locationAccuracy: "approximate",
    contactEmail: "buyer@demo-chain.local",
    contactRole: "Order desk",
    territoryDescription:
      "Wine and spirits wholesaler serving Los Angeles and Orange County out of Cerritos. The tier-two house for this portfolio: in California, spirits reach retail through a licensed wine-and-spirits distributor, not through a spirits wholesaler.",
    servesTerritoryIds: ["east-la"],
    source: "Build-pack distributor dataset",
    provenance: "public",
  },
  {
    id: "gate-city-san-bernardino",
    name: "Gate City Beverage",
    parent: "Southern Glazer's Wine & Spirits",
    tier: "beer",
    facilityAddress: "",
    city: "San Bernardino",
    state: "CA",
    postalCode: "",
    lat: 34.1083,
    lng: -117.2898,
    locationAccuracy: "city-center",
    contactEmail: "rep@demo-harbor.local",
    contactRole: "Order desk",
    territoryDescription:
      "Reyes beer house serving the Inland Empire. A separate market from this territory; recorded, not offered as an alternative for these accounts.",
    servesTerritoryIds: [],
    source: "https://gatecitybeverage.com/",
    provenance: "public",
  },
];

/**
 * The houses a spirits DSE can actually plan against here.
 *
 * The tier asked for is the ONLY thing that changed when the portfolio
 * moved from beer to spirits. See the note at the top of this file.
 */
export const SELECTABLE_DISTRIBUTORS = DISTRIBUTORS.filter(
  (d) => d.tier === "wine-spirits" && d.servesTerritoryIds.length > 0,
);

export const DISTRIBUTOR_BY_ID = Object.fromEntries(
  DISTRIBUTORS.map((d) => [d.id, d]),
) as Record<string, Distributor>;

export const TERRITORIES: Territory[] = [
  {
    id: "east-la",
    name: "Territory 12, East LA County",
    distributorId: "southern-glazers-cerritos",
    hubCity: "Rowland Heights",
    centroid: { lat: 33.9853, lng: -117.8992 },
    accountIds: [],
  },
];

export const TERRITORY_BY_ID = Object.fromEntries(
  TERRITORIES.map((t) => [t.id, t]),
) as Record<string, Territory>;

/**
 * Ole Smoky's real fiscal period calendar is not public, so this is a
 * conventional 13-period calendar, invented and labeled as such. It
 * exists because "this period" is the unit a DSE plans in, and using
 * calendar months instead would read as an outsider's guess.
 */
export const PERIODS: Period[] = [
  { id: "2026-P8", label: "Period 8, Jul 2026", startDate: "2026-07-06", endDate: "2026-08-02", provenance: "illustrative" },
  { id: "2026-P9", label: "Period 9, Aug 2026", startDate: "2026-08-03", endDate: "2026-08-30", provenance: "illustrative" },
  { id: "2026-P10", label: "Period 10, Sep 2026", startDate: "2026-08-31", endDate: "2026-09-27", provenance: "illustrative" },
];

export const CURRENT_PERIOD_ID = "2026-P9";

/**
 * The number a Distributor Sales Executive actually lives on.
 *
 * A DSE's year is a volume goal, broken into periods, and every
 * conversation with a wholesaler is measured against it. The app had a
 * period selector where a period carried no number, which meant it could
 * describe what was happening and never say whether it was enough.
 *
 * Territory 12 is 25 of Southern Glazer's roughly 13,960 retail accounts, and
 * Southern Glazer's moves about 52.2 million cases a year across the whole book. A
 * goal for 27 accounts is not derivable from that and is not published
 * anywhere, so these are illustrative and labelled as such wherever they
 * appear. What is NOT illustrative is the shape: a period goal, an annual
 * goal, and a prior-year number to index against, because that is how the
 * job is actually scored.
 */
export interface VolumeGoal {
  periodId: string;
  /** Cases the territory is expected to sell in this period. */
  periodCases: number;
  /** Same period last year, so growth reads as a percentage not a wish. */
  priorYearCases: number;
  provenance: Provenance;
}

export const VOLUME_GOALS: VolumeGoal[] = [
  { periodId: "2026-P8", periodCases: 2400, priorYearCases: 2255, provenance: "illustrative" },
  { periodId: "2026-P9", periodCases: 2600, priorYearCases: 2402, provenance: "illustrative" },
  { periodId: "2026-P10", periodCases: 2450, priorYearCases: 2371, provenance: "illustrative" },
];

export const GOAL_BY_PERIOD = Object.fromEntries(
  VOLUME_GOALS.map((g) => [g.periodId, g]),
) as Record<string, VolumeGoal>;

/** Thirteen periods to a year. The annual number is the sum of the plan. */
export const ANNUAL_GOAL_CASES = 31200;

export const PERIOD_BY_ID = Object.fromEntries(
  PERIODS.map((p) => [p.id, p]),
) as Record<string, Period>;

/**
 * Promotions.
 *
 * `distributorAllowancePerCase` is a supplier-to-wholesaler depletion
 * allowance. There is deliberately no field for money paid to a retailer:
 * California ABC has stated there is no exception permitting cash
 * payments from a supplier to a retailer, so a "promotional allowance"
 * attached to a store would describe a tied-house violation rather than a
 * plan. The retail side of a promotion is an execution requirement the
 * distributor's reps pursue.
 */
export const PROMOTIONS: Promotion[] = [
  {
    id: "labor-day-2026",
    name: "Labor Day 2026",
    startDate: "2026-08-17",
    endDate: "2026-09-07",
    distributorAllowancePerCase: 1.75,
    retailExecutionRequirement:
      "Secondary display or floor stack of 750ml jars held for the full window, with shelf facings maintained on the featured expression.",
    expectedLiftPercent: 20,
    investment: 14500,
    modeledROI: 2.4,
    provenance: "illustrative",
  },
  {
    id: "convenience-single-serve-2026",
    name: "Small-Format Trial Reset",
    startDate: "2026-08-10",
    endDate: "2026-09-21",
    distributorAllowancePerCase: 2.25,
    retailExecutionRequirement:
      "Trial-format reset: 50ml minis and 375ml at the counter and at eye level on the spirits shelf, with checkout point-of-sale.",
    expectedLiftPercent: 28,
    investment: 6200,
    modeledROI: 2.1,
    provenance: "illustrative",
  },
  {
    id: "above-premium-shelf-2026",
    name: "Above-Premium Shelf Expansion",
    startDate: "2026-08-03",
    endDate: "2026-09-27",
    distributorAllowancePerCase: 1.25,
    retailExecutionRequirement:
      "Incremental shelf facings for Blue Flame and Tennessee Straight Bourbon in the craft and Tennessee whiskey set.",
    expectedLiftPercent: 15,
    investment: 8900,
    modeledROI: 1.9,
    provenance: "illustrative",
  },
  /**
   * Two further programs so the calendar has a shape rather than a
   * single window. Both are anchored on real Southern California trade
   * seasonality: Hispanic Heritage Month runs September 15 to October 15
   * and is the period Moonshine Cherries earns its display in the banners
   * where it already indexes, and the football window is the largest
   * at-home drinking occasion of the autumn. The dates are real; the
   * allowances and lifts are modeled like every other figure here.
   */
  {
    id: "heritage-cherries-2026",
    name: "Heritage, Cherries Counter Unit",
    startDate: "2026-09-15",
    endDate: "2026-10-15",
    distributorAllowancePerCase: 2.0,
    retailExecutionRequirement:
      "Moonshine Cherries counter unit at the till in the independent and neighbourhood-market accounts, held the full window, with the jar facing the customer.",
    expectedLiftPercent: 24,
    investment: 9800,
    modeledROI: 2.6,
    provenance: "illustrative",
  },
  {
    id: "football-kickoff-2026",
    name: "Football Kickoff, On-Premise",
    startDate: "2026-09-07",
    endDate: "2026-10-05",
    distributorAllowancePerCase: 1.5,
    retailExecutionRequirement:
      "Back-bar riser and table tents in the sports bars, pubs and the bowling house through every home weekend, with a featured serve on the printed drinks list.",
    expectedLiftPercent: 18,
    investment: 11200,
    modeledROI: 2.2,
    provenance: "illustrative",
  },
];

export const PROMOTION_BY_ID = Object.fromEntries(
  PROMOTIONS.map((p) => [p.id, p]),
) as Record<string, Promotion>;
