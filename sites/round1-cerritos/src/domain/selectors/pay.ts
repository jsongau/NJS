import type { ActivityLine, BookLine, ProspectPackageStatus } from "@/domain/types";
import { PROSPECTS } from "@/data/prospects";
import { LANE_META } from "@/domain/lanes";
import { windowOpensWithin } from "@/domain/selectors/desk";
import { RECORD_AS_OF } from "@/domain/selectors/record";
import {
  PLAN,
  bonusPctOfBase,
  commissionPctOfBase,
  daysApart,
  impliedQuarterlyQuota,
  quarterFor,
  quarterMonthSpan,
  type Quarter,
} from "@/domain/pay";

/**
 * WHAT THE PLAN READS AGAINST THE TWO LEDGERS.
 *
 * ── COMMISSION COMES OFF THE REVENUE LEDGER, AND ONLY THAT ONE ────
 * `BookLine` carries money. `ActivityLine` carries hours and has no
 * revenue field at all, which is the point of there being two of them.
 * Nothing in this file adds across the divider. Activity appears here in
 * exactly one place, as a GATE, where the unit stays hours and never
 * becomes dollars.
 *
 * ── COLLECTED, NOT SIGNED ─────────────────────────────────────────
 * Commission pays on the deposit landing rather than on the signature.
 * Three reasons: `revenueTotals` already distinguishes revenue from
 * deposits at each line's own percentage, so the mechanic costs nothing;
 * a signature with no deposit is not cash, and paying on it pays somebody
 * for a soft hold; and a venue that has not opened cannot afford a plan
 * that rewards paper.
 *
 * So a contract collects twice, and this file is explicit about when,
 * because the seed carries no signature date:
 *
 *   THE DEPOSIT is treated as collected on the date the book was read,
 *   23 September 2026. Both seeded contracts already exist on that date,
 *   so it is the earliest date at which this application can honestly say
 *   the money was in.
 *
 *   THE BALANCE is treated as collected on the event date, because that
 *   is when the group turns up and settles.
 *
 * Both are stated on screen beside the figure. Neither is a claim about
 * anybody's published terms, because none are published.
 */

/** The day the seeded book was read, as a plain date. */
export const BOOK_READ_ON = RECORD_AS_OF.slice(0, 10);

export interface CollectionEvent {
  lineId: string;
  prospectId: string;
  kind: "deposit" | "balance";
  on: string;
  amount: number;
}

/** Every dollar this book collects, and the day each one lands. */
export function collectionSchedule(book: BookLine[]): CollectionEvent[] {
  const out: CollectionEvent[] = [];
  for (const line of book) {
    const value = line.guests * line.pricePerGuest;
    const deposit = (value * line.depositPercent) / 100;
    const balance = value - deposit;
    if (deposit > 0) {
      out.push({
        lineId: line.id,
        prospectId: line.prospectId,
        kind: "deposit",
        on: BOOK_READ_ON,
        amount: deposit,
      });
    }
    if (balance > 0) {
      out.push({
        lineId: line.id,
        prospectId: line.prospectId,
        kind: "balance",
        on: line.eventDate,
        amount: balance,
      });
    }
  }
  return out.sort((a, b) => a.on.localeCompare(b.on));
}

export interface CollectedReading {
  /** Collected inside this quarter, up to and including the as of date. */
  inQuarter: number;
  /** Collected since the book was read, whatever the quarter. */
  toDate: number;
  /** Contracts with money collected inside this quarter. */
  contractsInQuarter: number;
  /** The events themselves, for the working. */
  events: CollectionEvent[];
}

export function collectedReading(
  book: BookLine[],
  quarter: Quarter,
  asOf: string,
): CollectedReading {
  const schedule = collectionSchedule(book);
  const inQuarter = schedule.filter(
    (e) => e.on >= quarter.startDate && e.on <= quarter.endDate && e.on <= asOf,
  );
  const lines = new Set(inQuarter.map((e) => e.lineId));
  return {
    inQuarter: inQuarter.reduce((n, e) => n + e.amount, 0),
    toDate: schedule
      .filter((e) => e.on <= asOf)
      .reduce((n, e) => n + e.amount, 0),
    contractsInQuarter: lines.size,
    events: inQuarter,
  };
}

// ---------------------------------------------------------------
// Gate one: window coverage
// ---------------------------------------------------------------

export interface CoverageReading {
  /** Calendar locked organisations whose window opens inside the quarter. */
  inWindow: number;
  /** How many of them were touched inside the quarter. */
  worked: number;
  /** Share of them, or null where the quarter opens no windows at all. */
  share: number | null;
  /** How many more would clear the gate. Zero once it is cleared. */
  shortBy: number;
  met: boolean;
}

/**
 * THE ONE ACTIVITY FIGURE WORTH GATING A BONUS ON.
 *
 * This is the figure `/coaching` computes, on the same rule, moved from
 * one period to the quarter the bonus is actually paid over. Calendar
 * locked organisations whose buying window opens inside the quarter, over
 * how many of them anybody spoke to inside it.
 *
 * Its denominator is set by other organisations' calendars rather than by
 * anybody's effort, which is the property that makes it worth money: a
 * hundred touches on the easiest names on the board move it not at all.
 * That is why it is the ENTRY gate rather than a scored metric. Miss it
 * and the bonus is zero whatever the revenue did, because a quarter that
 * books one large party while forty schools go untouched through their
 * only buying window has burned the list for a year.
 *
 * A touch counts as inside the quarter when the last touch recorded
 * against the organisation falls inside it, or, where a row carries
 * touches and no date, when the row belongs to a period this quarter
 * groups. The second clause exists because the seed carries a few rows
 * of that shape and dropping them silently would understate the work.
 */
export function windowCoverage(
  statuses: ProspectPackageStatus[],
  quarter: Quarter,
): CoverageReading {
  const { fromMonth, horizonMonths } = quarterMonthSpan(quarter);
  const periodIds = new Set(quarter.periodIds);

  const touchedInQuarter = new Set<string>();
  for (const row of statuses) {
    if (row.touches <= 0) continue;
    const dated = row.lastTouchAt;
    if (dated) {
      if (dated >= quarter.startDate && dated <= quarter.endDate) {
        touchedInQuarter.add(row.prospectId);
      }
      continue;
    }
    if (periodIds.has(row.periodId)) touchedInQuarter.add(row.prospectId);
  }

  let inWindow = 0;
  let worked = 0;
  for (const p of PROSPECTS) {
    if (LANE_META[p.lane].occasionClass !== "calendar-locked") continue;
    if (!windowOpensWithin(p.buyingWindow, fromMonth, horizonMonths)) continue;
    inWindow += 1;
    if (touchedInQuarter.has(p.id)) worked += 1;
  }

  const share = inWindow > 0 ? worked / inWindow : null;
  const needed = Math.ceil(inWindow * PLAN.coverageGate);
  return {
    inWindow,
    worked,
    share,
    shortBy: Math.max(0, needed - worked),
    met: share !== null && share >= PLAN.coverageGate,
  };
}

// ---------------------------------------------------------------
// Gate two: hours outside the building
// ---------------------------------------------------------------

/** The activity types the posting means by "outside the building". */
const OUTSIDE_TYPES = ["tabling", "networking-event", "go-see"];

export interface OutsideReading {
  plannedHours: number;
  completedHours: number;
  /** Completed against planned. Null where nothing is planned. */
  share: number | null;
  /** Hours still on the plan and not yet ticked off. */
  outstandingHours: number;
  met: boolean;
}

/**
 * THE SECOND LEADING GATE, AND IT IS DELIBERATELY THE HARDER READING.
 *
 * "Hours outside the building at or above the planned share" can be read
 * two ways. The share of completed hours that were spent outside, which
 * a single ticked go see satisfies at a hundred per cent, or the outside
 * hours completed against the outside hours planned, which cannot be
 * satisfied by doing almost nothing. This takes the second, because a
 * gate a person clears by completing one shift out of ten is not a gate.
 *
 * Planning is attributed by the shift's week, delivery by the date it was
 * ticked off, so a shift planned in the quarter and completed after it
 * counts as planned here and delivered there.
 */
export function outsideHours(
  activity: ActivityLine[],
  quarter: Quarter,
  asOf: string,
): OutsideReading {
  let plannedHours = 0;
  let completedHours = 0;
  for (const line of activity) {
    if (!OUTSIDE_TYPES.includes(line.type)) continue;
    if (line.week >= quarter.startDate && line.week <= quarter.endDate) {
      plannedHours += line.hours;
    }
    const done = line.completedAt;
    if (
      done &&
      done >= quarter.startDate &&
      done <= quarter.endDate &&
      done <= asOf
    ) {
      completedHours += line.hours;
    }
  }
  const share = plannedHours > 0 ? completedHours / plannedHours : null;
  return {
    plannedHours,
    completedHours,
    share,
    outstandingHours: Math.max(0, plannedHours - completedHours),
    met: share !== null && share >= 1,
  };
}

// ---------------------------------------------------------------
// The whole reading
// ---------------------------------------------------------------

export type BonusState =
  | { kind: "ramp"; gatesMet: number; gatesTotal: number }
  | { kind: "gate-missed" }
  | { kind: "below-threshold" }
  | { kind: "paying" };

export interface PayReading {
  asOf: string;
  quarter: Quarter;
  base: number;
  /** Days of the quarter gone, and how long it is. */
  elapsedDays: number;
  quarterDays: number;
  quota: number;
  collected: CollectedReading;
  /** Collected over quota. Null in the ramp quarter, which has none. */
  attainment: number | null;
  coverage: CoverageReading;
  outside: OutsideReading;
  /** Contracts gate, which is a floor rather than a scored metric. */
  contractFloorMet: boolean;
  commission: {
    /** Earned on what the quarter has collected so far. */
    inQuarter: number;
    /** Earned on everything collected since the book was read. */
    toDate: number;
    /** The same figure as a percentage of base. */
    pctOfBase: number;
  };
  bonus: {
    state: BonusState;
    /** Payable on today's reading, in dollars. */
    payable: number;
    /** The bonus target for one quarter, in dollars. */
    target: number;
    pctOfBase: number;
  };
  /** What the whole quarter pays on today's reading. */
  quarterPay: number;
  /** What a missed entry gate costs, in dollars. Always worth printing. */
  gateCost: number;
}

export function payReading(input: {
  book: BookLine[];
  activity: ActivityLine[];
  statuses: ProspectPackageStatus[];
  asOf: string;
  base: number;
}): PayReading {
  const { book, activity, statuses, asOf, base } = input;
  const quarter = quarterFor(asOf);
  const collected = collectedReading(book, quarter, asOf);
  const coverage = windowCoverage(statuses, quarter);
  const outside = outsideHours(activity, quarter, asOf);

  const quota = impliedQuarterlyQuota(base);
  const attainment = quarter.rampQuarter ? null : collected.inQuarter / quota;

  const commissionInQuarter = collected.inQuarter * PLAN.commissionRate;
  const commissionToDate = collected.toDate * PLAN.commissionRate;

  /* The bonus target for ONE quarter. The plan's 10% of base is annual,
     so a quarter carries a quarter of it. Getting this wrong by leaving
     the division out would quadruple every bonus figure on the screen,
     which is the sort of error that reads as generous rather than as
     broken, and is therefore the one worth writing down. */
  const bonusTarget = (base * PLAN.bonusPct) / 100 / 4;
  const contractFloorMet = collected.contractsInQuarter >= PLAN.contractFloor;

  let state: BonusState;
  let payable = 0;

  if (quarter.rampQuarter) {
    /* No book to measure attainment against in the first quarter, so it
       pays on the two leading gates, half each, all or nothing. */
    const gatesMet = (coverage.met ? 1 : 0) + (outside.met ? 1 : 0);
    state = { kind: "ramp", gatesMet, gatesTotal: 2 };
    payable = bonusTarget * (gatesMet / 2);
  } else if (!coverage.met || !contractFloorMet) {
    state = { kind: "gate-missed" };
  } else if ((attainment ?? 0) < PLAN.threshold) {
    state = { kind: "below-threshold" };
  } else {
    state = { kind: "paying" };
    payable = (base * bonusPctOfBase(attainment ?? 0)) / 100 / 4;
  }

  return {
    asOf,
    quarter,
    base,
    elapsedDays: Math.min(
      daysApart(quarter.startDate, asOf) + 1,
      daysApart(quarter.startDate, quarter.endDate) + 1,
    ),
    quarterDays: daysApart(quarter.startDate, quarter.endDate) + 1,
    quota,
    collected,
    attainment,
    coverage,
    outside,
    contractFloorMet,
    commission: {
      inQuarter: commissionInQuarter,
      toDate: commissionToDate,
      pctOfBase: base > 0 ? (commissionInQuarter / base) * 100 : 0,
    },
    bonus: {
      state,
      payable,
      target: bonusTarget,
      pctOfBase: base > 0 ? (payable / base) * 100 : 0,
    },
    quarterPay: commissionInQuarter + payable,
    gateCost: bonusTarget,
  };
}

/**
 * What the threshold costs, in the units a person actually works in.
 *
 * A gap expressed as "you are at 0.5% of quota" tells a reader they have
 * failed. The same gap expressed as "the threshold is another $91,000
 * collected, which is another eighty contracts at the size this book
 * currently averages" tells them what the plan is asking for, and lets
 * them argue with it. That second sentence is the one this returns.
 */
export function thresholdGap(
  reading: PayReading,
  book: BookLine[],
): { dollars: number; contracts: number | null; averageContract: number | null } {
  const needed = reading.quota * PLAN.threshold - reading.collected.inQuarter;
  const values = book.map((l) => l.guests * l.pricePerGuest);
  const average =
    values.length > 0 ? values.reduce((n, v) => n + v, 0) / values.length : null;
  return {
    dollars: Math.max(0, needed),
    contracts: average && average > 0 ? Math.ceil(Math.max(0, needed) / average) : null,
    averageContract: average,
  };
}

/** What one more collected dollar is worth, printed rather than implied. */
export function marginalCommission(): number {
  return PLAN.commissionRate;
}

/** The plan's own check: percentages of base at a given attainment. */
export function curvePoint(attainment: number): {
  commission: number;
  bonus: number;
  total: number;
} {
  const commission = commissionPctOfBase(attainment);
  const bonus = bonusPctOfBase(attainment);
  return { commission, bonus, total: commission + bonus };
}
