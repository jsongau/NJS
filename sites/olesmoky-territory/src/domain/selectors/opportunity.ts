import { ACCOUNT_BY_ID, ACCOUNTS } from "@/data/accounts";
import { DISTRIBUTOR_BY_ID } from "@/data/trade";
import {
  voidCasesForAccount,
  coldBoxPosition,
  haversineMiles,
  baseWeeklyCasesForAccount,
} from "./distribution";
import { CHANNEL_META } from "@/domain/channels";

/**
 * The opportunity score.
 *
 * IT IS SCORED WITHIN A LANE, not across the territory. See the
 * normalization anchors below — a sports bar and a bottle shop are
 * measured against different ceilings on purpose, because they are not
 * competing for the same visit and a shared case scale would rank every
 * bar below every shop for reasons that are true and useless.
 *
 * This is shown to the user with its weights exposed and adjustable, not
 * hidden behind a number. That is a deliberate product decision: a score
 * you can interrogate is evidence of how someone prioritizes accounts,
 * while a score you cannot is just a number the app asserted. Moving a
 * weight and watching the ranking reorder is the most useful twenty
 * seconds in the whole prototype.
 *
 * Every component is normalized to roughly 0..100 before weighting, so
 * the weights are readable as percentages rather than as magic constants.
 */

export interface OpportunityWeights {
  voidCases: number;
  coldBoxGap: number;
  displayUpside: number;
  trafficTier: number;
  routeEfficiency: number;
}

export const DEFAULT_OPPORTUNITY_WEIGHTS: OpportunityWeights = {
  voidCases: 0.35,
  coldBoxGap: 0.25,
  displayUpside: 0.2,
  trafficTier: 0.1,
  routeEfficiency: 0.1,
};

export interface OpportunityBreakdown {
  accountId: string;
  total: number;
  components: {
    voidCases: number;
    coldBoxGap: number;
    displayUpside: number;
    trafficTier: number;
    routeEfficiency: number;
  };
  raw: {
    voidCases: number;
    coldBoxGapDoors: number;
    baseWeeklyCases: number;
    distanceMiles: number;
  };
  weights: OpportunityWeights;
  /** Human-readable arithmetic, rendered under the score. */
  explain: string[];
}

const clamp100 = (n: number) => Math.max(0, Math.min(100, n));

export function opportunityFor(
  accountId: string,
  distributorId: string,
  weights: OpportunityWeights = DEFAULT_OPPORTUNITY_WEIGHTS,
): OpportunityBreakdown {
  const account = ACCOUNT_BY_ID[accountId];
  const distributor = DISTRIBUTOR_BY_ID[distributorId];

  const voidCases = voidCasesForAccount(accountId);
  const cold = coldBoxPosition(accountId);
  const baseWeekly = baseWeeklyCasesForAccount(accountId);
  const distanceMiles =
    account && distributor
      ? haversineMiles(
          { lat: distributor.lat, lng: distributor.lng },
          { lat: account.lat, lng: account.lng },
        )
      : 0;

  /*
    Normalization anchors, and they are PER VENUE CLASS.

    ── THE BUG THIS FIXES, WHICH WAS NOT A CRASH ─────────────────
    These were single numbers calibrated against a grocery roster: 90
    void cases scores 100, 220 base weekly cases scores 100. Against
    this roster a busy sports bar carries about five cases a week in
    total, so it scored roughly two out of a hundred on both components
    — and so did every other bar. Fifteen accounts, all scored zero,
    ranked in an order that was really just traffic tier and distance.

    Nothing was broken. The score was doing exactly what it was told,
    which is the dangerous kind of wrong: a page full of confident
    numbers that had quietly stopped discriminating between the things
    it was ranking. A rep would have worked the on-premise list top to
    bottom in an order with no information in it.

    ── WHY NOT ONE SHARED SCALE ──────────────────────────────────
    Because the score answers "which account should I work next", and
    that question is only meaningful WITHIN a lane. A bar and a bottle
    shop are not competing for the same visit — they need different
    material, a different ask and, half the time, a different hour of
    the day. Ranking them against each other on case volume would
    correctly conclude that every bar is worth less than every shop,
    which is true of a single week's cases and useless as a plan.

    So each lane is scored against its own ceiling, and the tabs are
    what stop the two rankings being read as one list.
  */
  const onPremise = account
    ? CHANNEL_META[account.channel].venueClass === "on-premise"
    : false;
  const VOID_CASES_AT_100 = onPremise ? 6 : 90;
  const COLD_GAP_AT_100 = onPremise ? 2 : 6;
  const BASE_WEEKLY_AT_100 = onPremise ? 14 : 220;
  const FAR_MILES = 25;

  const components = {
    voidCases: clamp100((voidCases / VOID_CASES_AT_100) * 100),
    coldBoxGap: clamp100((cold.gapDoors / COLD_GAP_AT_100) * 100),
    displayUpside: clamp100((baseWeekly / BASE_WEEKLY_AT_100) * 100),
    trafficTier: account ? (account.trafficTier === 1 ? 100 : account.trafficTier === 2 ? 60 : 30) : 0,
    routeEfficiency: clamp100(100 - (distanceMiles / FAR_MILES) * 100),
  };

  const total =
    components.voidCases * weights.voidCases +
    components.coldBoxGap * weights.coldBoxGap +
    components.displayUpside * weights.displayUpside +
    components.trafficTier * weights.trafficTier +
    components.routeEfficiency * weights.routeEfficiency;

  const explain = [
    `${voidCases} modelled weekly cases sitting in open voids, scored ${components.voidCases.toFixed(0)} of 100 against the ${onPremise ? "on-premise" : "retail"} ceiling of ${VOID_CASES_AT_100}`,
    `${cold.gapDoors} ${account ? CHANNEL_META[account.channel].spaceNoun : "shelf"} sections below modelled fair share (${cold.ourDoors} of ${cold.fairShareDoors} on ${cold.totalDoors} total), scored ${components.coldBoxGap.toFixed(0)}`,
    `${baseWeekly} modelled base weekly cases already moving, scored ${components.displayUpside.toFixed(0)}`,
    `Traffic tier ${account?.trafficTier ?? "n/a"}, scored ${components.trafficTier}`,
    `${distanceMiles.toFixed(1)} mi straight-line from the distributor, scored ${components.routeEfficiency.toFixed(0)}`,
  ];

  return {
    accountId,
    total: Math.round(total),
    components,
    raw: {
      voidCases,
      coldBoxGapDoors: cold.gapDoors,
      baseWeeklyCases: baseWeekly,
      distanceMiles,
    },
    weights,
    explain,
  };
}

export function rankAccountsByOpportunity(
  distributorId: string,
  weights: OpportunityWeights = DEFAULT_OPPORTUNITY_WEIGHTS,
): OpportunityBreakdown[] {
  return ACCOUNTS.map((a) => opportunityFor(a.id, distributorId, weights)).sort(
    (a, b) => b.total - a.total,
  );
}
