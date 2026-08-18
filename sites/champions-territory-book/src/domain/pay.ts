import type { Provenance } from "@/domain/types";
import { PERIODS } from "@/data/venue";

/**
 * THE PLAN, AS ARITHMETIC.
 *
 * ── WHAT CHAMPIONS ACTUALLY PUBLISHES ─────────────────────────────
 * Two phrases and a band. Service Champions' careers page offers
 * "Excellent Earnings Potential" and a "Highly Competitive Pay
 * Structure", Timo's offers "performance-based bonuses", and the
 * corporate Greenhouse board posts Marketing Manager, West Division,
 * Brea, temp to hire, at $120,000 to $125,000 a year. That is the
 * complete set. No commission rate, no quota, no threshold, no
 * accelerator and no bonus mechanic is published by Champions Group
 * Holdings or by any of the five West Division brands anywhere the
 * research could reach, the posting does not itemise benefits either,
 * and no brand publishes a marketing budget figure of any kind. So
 * nothing below is quoted as a Champions plan.
 *
 * ── SO EVERYTHING BELOW IS A PERCENTAGE OF THE BAND ────────────────
 * Every figure in this file is either the published band or a percentage
 * of it. That is not a presentation choice, it is the whole honesty
 * mechanism: a percentage of a published number invents nothing, and the
 * arithmetic holds at any base a reader picks inside the band. The
 * percentages themselves are this application's own proposal, they carry
 * the `illustrative` badge everywhere they are drawn, and each one is
 * printed beside the HSMAI benchmark it was shaped against.
 *
 * ── WHY THESE PARTICULAR NUMBERS, AND WHAT IS WRONG WITH THEM ─────
 * HSMAI's special report on hotel management company sales incentive
 * plans is the only source the research reached with real
 * distributional data on incentive design, and it is OUT OF TRADE: it
 * describes hotel sales desks, not a home services marketing desk in
 * Southern California. It is cited anyway, in full, because a benchmark
 * a reader can check and reject is worth more than a round number with
 * nothing behind it. What it gives is a shape rather than a rate:
 * quarterly payment for 79% of Sales Managers, thresholds
 * clustered at 95% to 100% of goal, caps between 100% and 140% of
 * attainment on 84% of plans, and a maximum incentive that has converged
 * at 30% of base. The plan here lands on 30% at the cap deliberately, and
 * the accelerator is 1.5 rather than 2 because 1.5 is the multiplier that
 * puts it there.
 *
 * ── THE QUOTA IS NEVER ASSERTED ───────────────────────────────────
 * Fix the rate and fix the commission at plan, and the quarterly quota
 * falls out of them by division. `impliedQuarterlyQuota` is that
 * division. The application never states a quota, it states a rate and
 * shows what quota the rate implies, so a Director of Marketing can
 * argue with the rate rather than with a number that arrived from
 * nowhere.
 */

// ---------------------------------------------------------------
// The one published figure
// ---------------------------------------------------------------

export const BASE_BAND = {
  low: 120000,
  high: 125000,
  /**
   * The midpoint, computed at definition rather than at display, so the
   * implied quota further down is reproducible on a calculator from the
   * two published ends of the band. A base displayed rounded and
   * computed unrounded produces a quota nobody can check.
   */
  mid: Math.round(((120000 + 125000) / 2) * 100) / 100,
  source:
    "Marketing Manager, Temp to Hire, Brea CA, on the Champions Group Holdings Greenhouse board, read 18 August 2026",
  provenance: "public" as Provenance,
};

/** The three points on the band a reader can stand at. */
export type BandPoint = "low" | "mid" | "high";

export const BAND_POINTS: { id: BandPoint; label: string; value: number }[] = [
  { id: "low", label: "Bottom of the band", value: BASE_BAND.low },
  { id: "mid", label: "Midpoint", value: BASE_BAND.mid },
  { id: "high", label: "Top of the band", value: BASE_BAND.high },
];

// ---------------------------------------------------------------
// The plan
// ---------------------------------------------------------------

export const PLAN = {
  /** Target variable at 100% attainment, as a percentage of base. */
  targetVariablePct: 20,
  /** The commission half of it. */
  commissionPct: 10,
  /** The bonus half of it. */
  bonusPct: 10,
  /** Commission rate on collected contract value, from the first dollar. */
  commissionRate: 0.02,
  /** Nothing below this share of quota pays a bonus. */
  threshold: 0.9,
  /** What the threshold itself pays, as a share of bonus target. */
  thresholdPayout: 0.5,
  /** Each point of attainment above plan pays this multiple of target. */
  accelerator: 1.5,
  /** Attainment above which nothing further is paid. */
  cap: 1.4,
  /** The entry gate on the leading indicator. */
  coverageGate: 0.8,
  /** No bonus in a quarter with fewer contracts than this, at any revenue. */
  contractFloor: 8,
  provenance: "illustrative" as Provenance,
};

/** The benchmark each number above was shaped against, for printing. */
export const HSMAI = {
  source:
    "HSMAI, Hotel Management Company Sales Incentive Plans, special report, read 14 August 2026",
  url: "https://global.hsmai.org/wp-content/uploads/2019/09/HSMAI-Special-Report_HMC-Sales-Incentive-Plans.pdf",
  quarterlyShare: "79% of Sales Managers are paid quarterly",
  thresholdBand: "thresholds cluster at 95% to 100% of goal",
  capBand: "caps run from 100% to 140% of attainment, on 84% of Sales Manager plans",
  maximum: "maximum incentive has converged at 30% of base",
  metrics: "Three or fewer metrics in the majority of plans",
  provenance: "public" as Provenance,
};

export const ATTAINMENT_EVIDENCE = {
  median: 0.743,
  mean: 0.815,
  ninetieth: 1.39,
  belowHalf: 0.313,
  atOrAbovePlan: 0.287,
  source:
    "Sales Cookie, quota attainment from more than 1000 commission plans, December 2025, read 14 August 2026",
  url: "https://blog.salescookie.com/2026/06/08/quota-attainment-real-data-from-1000-commission-plans/",
  provenance: "public" as Provenance,
};

// ---------------------------------------------------------------
// The curve
// ---------------------------------------------------------------

/**
 * Commission, as a percentage of base, at a given attainment.
 *
 * Commission is 2% of collected contract value from the first dollar and
 * it has no threshold, so as a share of base it is simply linear in
 * attainment. It is written as a function anyway, because the curve chart
 * draws both components through the same interface and a reader comparing
 * the two rows should be looking at two answers from the same question.
 *
 * It is NOT capped. The cap on the plan is a cap on the bonus; commission
 * on a dollar the branch has actually collected is money the business has
 * actually got, and refusing to pay it is how a plan teaches somebody to
 * park a signed job in the next quarter.
 */
export function commissionPctOfBase(attainment: number): number {
  return PLAN.commissionPct * Math.max(0, attainment);
}

/**
 * The bonus, as a percentage of base, at a given attainment.
 *
 * Zero below 90%. Half of target at 90%. Straight to full target at 100%.
 * Then 1.5 times target for every point above plan, and nothing above
 * 140%.
 */
export function bonusPctOfBase(attainment: number): number {
  return PLAN.bonusPct * bonusFactor(attainment);
}

/** The same curve expressed as a multiple of bonus target. */
export function bonusFactor(attainment: number): number {
  if (attainment < PLAN.threshold) return 0;
  if (attainment <= 1) {
    const through = (attainment - PLAN.threshold) / (1 - PLAN.threshold);
    return PLAN.thresholdPayout + through * (1 - PLAN.thresholdPayout);
  }
  const capped = Math.min(attainment, PLAN.cap);
  return 1 + (capped - 1) * PLAN.accelerator;
}

/** Commission plus bonus, as a percentage of base. */
export function totalVariablePctOfBase(attainment: number): number {
  return commissionPctOfBase(attainment) + bonusPctOfBase(attainment);
}

/**
 * The quota nobody asserted.
 *
 *   quarterly quota = (10% of base / 4) / 2%
 *
 * Ten per cent of base is the commission at plan. Divided by four it is
 * the commission at plan in one quarter. Divided by the rate it is the
 * collected contract value that pays it, which is the quota, arrived at
 * by division rather than by assertion.
 */
export function impliedQuarterlyQuota(base: number): number {
  return base * (PLAN.commissionPct / 100) / 4 / PLAN.commissionRate;
}

/** The five rows the curve is printed at, and the reason for each. */
export const CURVE_ROWS: { attainment: number; note: string }[] = [
  { attainment: 0.5, note: "Below threshold. Commission still pays; the bonus does not." },
  { attainment: 0.9, note: "Threshold. The bonus opens at half of target." },
  { attainment: 1.0, note: "Plan. Target variable, twenty per cent of base." },
  { attainment: 1.2, note: "Accelerated. Each point above plan pays 1.5 times target." },
  { attainment: 1.4, note: "Cap. Thirty per cent of base, and nothing above it." },
];

// ---------------------------------------------------------------
// The quarter, as a grouping and never as a period type
// ---------------------------------------------------------------

/**
 * THE QUARTER IS DERIVED, NOT DECLARED.
 *
 * `PERIODS` in data/venue.ts is four four week campaign bands and
 * there is no quarter anywhere in the model. The cheap way to get one is
 * a fifth period type. That way is wrong, and it is wrong in a way that
 * only shows up later: two enumerations of time in one application
 * eventually disagree, and the disagreement surfaces as a bonus that
 * pays on a quarter the period selector has never heard of.
 *
 * So a quarter here is a GROUPING of four consecutive periods. Four
 * periods of four weeks is sixteen weeks, the four seeded periods span 17
 * August to 6 December 2026, which carries the plan from the tail of peak
 * cooling through the September and October heating launch, and that is
 * one whole bonus quarter whose boundaries already exist in the data. A
 * grouping cannot disagree with the thing it groups.
 *
 * ── AND WHAT HAPPENS AFTER THE PERIODS RUN OUT ────────────────────
 * The seeded calendar stops on 6 December, because no Champions brand
 * publishes a marketing calendar at all. What the brands publish is an
 * offer and an expiry date, and the two live ones expire on 31 August
 * 2026 with no successor campaign published behind them. A reader moving
 * the scenario clock past 6 December is standing in a quarter with no
 * periods in it. Rather than invent periods, the
 * continuation keeps the SAME sixteen week rhythm the four periods
 * establish and says out loud that it holds no periods. The rhythm is
 * read off the data; only its continuation is assumed.
 */

export const PERIODS_PER_QUARTER = 4;

/** Sixteen weeks, in days. Derived from the periods rather than typed. */
export const QUARTER_DAYS = 112;

export interface Quarter {
  id: string;
  label: string;
  /** First day, inclusive, "YYYY-MM-DD". */
  startDate: string;
  /** Last day, inclusive. */
  endDate: string;
  /** The periods this quarter groups. Empty past the seeded calendar. */
  periodIds: string[];
  /** True where the whole quarter falls before the modelled horizon. */
  preOpening: boolean;
  /** Ordinal from the first planned quarter, which is one. */
  ordinal: number;
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const t = Date.UTC(y ?? 1970, (m ?? 1) - 1, (d ?? 1) + days);
  return new Date(t).toISOString().slice(0, 10);
}

export function daysApart(from: string, to: string): number {
  const [ay, am, ad] = from.split("-").map(Number);
  const [by, bm, bd] = to.split("-").map(Number);
  const a = Date.UTC(ay ?? 1970, (am ?? 1) - 1, ad ?? 1);
  const b = Date.UTC(by ?? 1970, (bm ?? 1) - 1, bd ?? 1);
  return Math.round((b - a) / 86400000);
}

/** The month index a date falls in, 0 for January. */
export function monthOf(iso: string): number {
  return Number(iso.slice(5, 7)) - 1;
}

/**
 * The quarters the period model itself contains.
 *
 * One, today. The grouping is written for any number of periods so that
 * adding a fifth and a sixth period to venue.ts produces a partial second
 * quarter rather than a crash, and the partial one says so in its label.
 */
export const MODEL_QUARTERS: Quarter[] = (() => {
  const sorted = [...PERIODS].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const out: Quarter[] = [];
  for (let i = 0; i < sorted.length; i += PERIODS_PER_QUARTER) {
    const group = sorted.slice(i, i + PERIODS_PER_QUARTER);
    const first = group[0];
    const last = group[group.length - 1];
    if (!first || !last) continue;
    const whole = group.length === PERIODS_PER_QUARTER;
    out.push({
      id: `quarter-${out.length + 1}`,
      label: whole
        ? "The planned campaign quarter"
        : `Part quarter, ${group.length} of ${PERIODS_PER_QUARTER} periods`,
      startDate: first.startDate,
      endDate: last.endDate,
      periodIds: group.map((p) => p.id),
      preOpening: true,
      ordinal: out.length + 1,
    });
  }
  return out;
})();

/**
 * The modelled campaign horizon.
 *
 * No Champions brand publishes a marketing calendar, so this application
 * does not print one as fact. What IS published is an offer expiry: the
 * Service Champions and Adeedo summer promotions both carry fine print
 * reading 31 August 2026, and nothing is published for what comes after
 * it. The last period in the model ends on 6 December 2026 and the day
 * after that is the horizon this file carries. It is used for exactly
 * one decision, whether a quarter falls inside the planned window, and
 * it is not a claim about anybody's campaign calendar.
 */
export const MODELLED_OPENING = addDays(
  MODEL_QUARTERS[MODEL_QUARTERS.length - 1]?.endDate ?? "2026-12-06",
  1,
);

/**
 * The quarter a date falls in, grouped where the periods reach and
 * continued at the same length where they do not.
 */
export function quarterFor(asOf: string): Quarter {
  const grouped = MODEL_QUARTERS.find(
    (q) => asOf >= q.startDate && asOf <= q.endDate,
  );
  if (grouped) return grouped;

  const first = MODEL_QUARTERS[0];
  const last = MODEL_QUARTERS[MODEL_QUARTERS.length - 1];
  if (!first || !last) {
    throw new Error("The period model contains no periods to group into a quarter.");
  }

  /* Before the calendar starts. Step backwards at the same length. */
  if (asOf < first.startDate) {
    const back = Math.ceil(daysApart(asOf, first.startDate) / QUARTER_DAYS);
    const startDate = addDays(first.startDate, -back * QUARTER_DAYS);
    return {
      id: `quarter-before-${back}`,
      label: back === 1 ? "The quarter before the calendar" : "Before the calendar",
      startDate,
      endDate: addDays(startDate, QUARTER_DAYS - 1),
      periodIds: [],
      preOpening: true,
      ordinal: first.ordinal - back,
    };
  }

  /* After it. Same rhythm, no periods, and the label says which. */
  const forward =
    Math.floor((daysApart(last.endDate, asOf) - 1) / QUARTER_DAYS) + 1;
  const startDate = addDays(last.endDate, (forward - 1) * QUARTER_DAYS + 1);
  const ordinal = last.ordinal + forward;
  return {
    id: `quarter-${ordinal}`,
    label:
      forward === 1
        ? "The first quarter past the campaign calendar"
        : `Quarter ${forward} past the campaign calendar`,
    startDate,
    endDate: addDays(startDate, QUARTER_DAYS - 1),
    periodIds: [],
    preOpening: false,
    ordinal,
  };
}

/**
 * The months a quarter touches, as a start month and a span, in the shape
 * `windowOpensWithin` already takes.
 *
 * Buying windows in this application are named in months, so a window
 * that opens inside a quarter is a window whose month is one of the
 * months the quarter runs through. Sixteen weeks touches four or five
 * calendar months depending on where it starts, and the span is measured
 * rather than assumed.
 */
export function quarterMonthSpan(quarter: Quarter): {
  fromMonth: number;
  horizonMonths: number;
} {
  const fromMonth = monthOf(quarter.startDate);
  const toMonth = monthOf(quarter.endDate);
  return { fromMonth, horizonMonths: (toMonth - fromMonth + 12) % 12 };
}
