import { ACTIVATIONS, RECAP_BY_ACTIVATION, type Activation } from "@/data/activations";
import { ACCOUNTS } from "@/data/accounts";
import { STATUS_BY_ACCOUNT } from "@/data/accountSkuStatus";
import { SKU_BY_ID } from "@/data/skus";
import { haversineMiles } from "@/domain/selectors/distribution";
import { casesFor } from "@/domain/selectors/retailOrder";
import type { Account } from "@/domain/types";

/**
 * The activation planner.
 *
 * WHAT THIS COMPUTES AND WHY IT IS THE WHOLE IDEA. Given an event site,
 * find the retail accounts a person leaving that event could actually
 * walk or drive to this week, and check whether those accounts have the
 * product that person just tasted.
 *
 * That last clause is the one that matters. Pouring Blackberry to three
 * thousand people beside a liquor store that does not stock Blackberry
 * is not marketing, it is a donation — and it is the single most common
 * failure in field activation, because the events team books the site
 * and the sales team owns the shelf and the two calendars never meet.
 *
 * A CRM director sits across both. This function is what that job looks
 * like expressed as code: one query that reaches from an event pin into
 * the distribution table and returns a list of calls to make BEFORE the
 * trucks arrive.
 *
 * ATTRIBUTION, HONESTLY. Nothing here claims a sampled person bought a
 * bottle. There is no mechanism in the three-tier system that could
 * prove it — the purchase happens at a retailer the supplier is not a
 * party to. What this measures is EXPOSURE MET BY AVAILABILITY: how many
 * people encountered the brand, and whether the shelf within reach of
 * them was ready. That is a real, defensible operational measure, and it
 * is worth more than an impressions figure precisely because it admits
 * what it cannot see.
 */

export type ReadinessState =
  /** Stocks every brand being poured. Ready for the spillover. */
  | "ready"
  /** Stocks some. Partial exposure, and a call worth making.  */
  | "partial"
  /** Stocks none of what is being poured. The donation case.  */
  | "unstocked";

export interface CatchmentAccount {
  account: Account;
  miles: number;
  state: ReadinessState;
  /** Poured brands this account carries, and the ones it does not. */
  carries: string[];
  missing: string[];
  /**
   * Cases to put in before the doors open. Uses the same function the
   * order desk uses, so a pre-event order and a normal order cannot
   * disagree about what a case is.
   */
  preEventCases: number;
}

export interface ActivationPlan {
  activation: Activation;
  catchment: CatchmentAccount[];
  /** People per ready account. The crude density measure that matters. */
  attendancePerReadyAccount: number | null;
  /** Sum of the pre-event order across the catchment. */
  preEventCases: number;
  /** Share of the catchment that could convert a taste today. */
  readyShare: number;
  /**
   * Contacts a well-run capture would produce. Modeled from ambassador
   * count rather than attendance, because capture is constrained by how
   * many tablets are in how many hands, not by how many people walk past.
   * 34 an hour per ambassador, eight hours, is a busy but real day.
   */
  captureCeiling: number;
  filed: boolean;
}

const CAPTURE_PER_AMBASSADOR_HOUR = 34;
const HOURS_PER_DAY = 8;

function dayCount(a: Activation): number {
  const s = Date.parse(`${a.startDate}T00:00:00Z`);
  const e = Date.parse(`${a.endDate}T00:00:00Z`);
  if (Number.isNaN(s) || Number.isNaN(e)) return 1;
  return Math.max(1, Math.round((e - s) / 86_400_000) + 1);
}

export function planFor(activationId: string): ActivationPlan | null {
  const activation = ACTIVATIONS.find((a) => a.id === activationId);
  if (!activation) return null;

  const poured = new Set(activation.brandIds);

  const catchment: CatchmentAccount[] = [];
  for (const account of ACCOUNTS) {
    const miles = haversineMiles(
      { lat: activation.lat, lng: activation.lng },
      { lat: account.lat, lng: account.lng },
    );
    if (miles > activation.catchmentMiles) continue;

    const rows = STATUS_BY_ACCOUNT[account.id] ?? [];
    const carries: string[] = [];
    const missing: string[] = [];
    for (const brandId of poured) {
      const brandRows = rows.filter(
        (r) => SKU_BY_ID[r.skuId]?.brandId === brandId,
      );
      const stocked = brandRows.some((r) => r.status !== "void");
      (stocked ? carries : missing).push(brandId);
    }

    const state: ReadinessState =
      missing.length === 0 ? "ready" : carries.length > 0 ? "partial" : "unstocked";

    /*
      The pre-event order covers the MISSING brands only. Topping up an
      account that already carries everything is an ordinary order and
      belongs on the order desk; this number is specifically the cost of
      making the activation land, which is what a field budget should be
      charged for.
    */
    let preEventCases = 0;
    for (const brandId of missing) {
      const row = rows.find((r) => SKU_BY_ID[r.skuId]?.brandId === brandId);
      if (row) preEventCases += casesFor(account.id, row.skuId, "new");
    }

    catchment.push({ account, miles, state, carries, missing, preEventCases });
  }

  catchment.sort((a, b) => a.miles - b.miles);

  const ready = catchment.filter((c) => c.state === "ready").length;
  const days = dayCount(activation);

  return {
    activation,
    catchment,
    attendancePerReadyAccount: ready
      ? Math.round(activation.attendance / ready)
      : null,
    preEventCases: catchment.reduce((n, c) => n + c.preEventCases, 0),
    readyShare: catchment.length ? ready / catchment.length : 0,
    captureCeiling:
      activation.ambassadors * CAPTURE_PER_AMBASSADOR_HOUR * HOURS_PER_DAY * days,
    filed: RECAP_BY_ACTIVATION[activation.id]?.filed ?? false,
  };
}

export function allPlans(): ActivationPlan[] {
  return ACTIVATIONS.map((a) => planFor(a.id)).filter(
    (p): p is ActivationPlan => p !== null,
  );
}

/**
 * The programme-level number.
 *
 * RECAP COMPLIANCE IS A KPI, not an admin chore. An activation with no
 * recap filed produced a crowd, a cost, and nothing anybody can act on.
 * Reporting it beside the attendance figure is the fastest way to make
 * the point that field marketing is measurable and mostly is not being
 * measured.
 */
export function fieldSummary() {
  const plans = allPlans();
  const filed = plans.filter((p) => p.filed).length;
  return {
    activations: plans.length,
    attendance: plans.reduce((n, p) => n + p.activation.attendance, 0),
    captureCeiling: plans.reduce((n, p) => n + p.captureCeiling, 0),
    preEventCases: plans.reduce((n, p) => n + p.preEventCases, 0),
    unstockedCalls: plans.reduce(
      (n, p) => n + p.catchment.filter((c) => c.state !== "ready").length,
      0,
    ),
    recapRate: plans.length ? filed / plans.length : 0,
    filed,
  };
}
