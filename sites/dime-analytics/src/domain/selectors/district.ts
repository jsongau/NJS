import type {
  ActivityLine,
  BookLine,
  Lane,
  PitchStatus,
  ProspectPackageStatus,
  Provenance,
  Reply,
} from "@/domain/types";
import type { GroupRequest, RequestStatus } from "@/domain/requests";
import { PERIODS, OFFERS, OFFER_BY_ID, VENUE } from "@/data/venue";
import { STANDARD_TERMS } from "@/data/packages";
import { PROSPECT_BY_ID } from "@/data/prospects";
import { CONVERSATIONS } from "@/data/conversations";
import { SEATS } from "@/data/seats";
import { lanesForGuests } from "@/domain/lanes";
import {
  RESPONSE_COMMITMENT,
  workingHoursBetween,
  venueDate,
} from "@/domain/requests";
import { daysApart } from "@/domain/pay";
import { collectionSchedule, type CollectionEvent } from "@/domain/selectors/pay";
import { isWorkingDay } from "@/domain/selectors/daily";
import { activityTotals, revenueTotals } from "@/state/BookProvider";

/**
 * The house lane count, which is null, typed as `number | null` so that
 * every use of it has to go through the branch rather than through a
 * silent literal.
 */
const HOUSE_LANES: number | null = VENUE.bowlingLanesPublished;

/**
 * THE PERIOD, ROLLED UP FOR THE PERSON ABOVE THE BUILDING.
 *
 * This file derives one document and adds no facts. Every figure it
 * returns is already somewhere else in the application: the two ledgers
 * come out of `BookProvider`, the collection dates out of `pay.ts`, the
 * working day rule out of `daily.ts`, the lane arithmetic out of
 * `lanes.ts`, the response commitment out of `requests.ts` and the held
 * dates out of the same status table the desk ranks on. The gap this
 * closes is a SHAPE and an ADDRESSEE, not a data model, and a selector
 * that invented a metric here would have missed the point of the
 * requirement it was written for.
 *
 * ── THE PERIOD IS THE UNIT, AND IT IS DERIVED ─────────────────────
 * `PERIODS` in data/venue.ts is four ordinary forward quarters. A reader
 * moving the scenario clock past the last of them is standing outside
 * all four, and the fix is the one `domain/pay.ts` already made
 * for the quarter: keep the rhythm the data establishes, continue it,
 * and say out loud that the continuation holds no seeded period. A
 * second enumeration of time would eventually disagree with the first.
 *
 * ── PRO RATA THE LEADING LEDGER, PACE THE LAGGING ONE ─────────────
 * Hours outside the building are meant to be uniform across working
 * days, so a straight line across ELAPSED WORKING DAYS is an honest
 * expectation and a shortfall against it is something a person can act
 * on this afternoon. Contract value is not uniform and never will be: a
 * December book and a June book are lumpy by construction, and drawing a
 * straight line through a revenue target produces a red number in week
 * one of every period, forever. So money is paced against the previous
 * period at the same elapsed working day, and where there is no previous
 * period this file declines rather than estimating.
 *
 * A CONTRACT FIGURE IS NEVER PRO RATA. A signature is an event, not a
 * rate, and nothing in this file multiplies one by a fraction of a
 * period.
 *
 * ── AND NOTHING IS PROJECTED ──────────────────────────────────────
 * No projected finish is computed anywhere here, at any elapsed day. The
 * gap is expressed as a REQUIRED RUN RATE over the remaining working
 * days, which is a fact about what is left rather than a prediction
 * wearing the clothes of one. Even that is suppressed until the period
 * has enough of itself behind it, on the principle `TOUCH_TARGET.minDays`
 * already establishes one level down: a tool that says "too early to
 * say" on the second of the month earns more trust than any figure it
 * could have printed instead.
 */

// ---------------------------------------------------------------
// Dates. Split, never parsed, exactly as everywhere else.
// ---------------------------------------------------------------

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const at = Date.UTC(y ?? 1970, (m ?? 1) - 1, (d ?? 1) + days);
  return new Date(at).toISOString().slice(0, 10);
}

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * A date for a sentence rather than for a column.
 *
 * The pages format their own dates and this file does not do their
 * formatting for them. The one exception is the basis clause, which is
 * prose carried on the period itself, and a raw ISO string sitting in
 * the middle of an English sentence on a printed document reads as a
 * leak from the database.
 */
function prettyDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

/** Working days in a closed range, weekends excluded by `isWorkingDay`. */
export function workingDaysIn(from: string, to: string): number {
  if (to < from) return 0;
  let n = 0;
  for (let d = from; d <= to; d = addDays(d, 1)) {
    if (isWorkingDay(d)) n += 1;
  }
  return n;
}

/**
 * The date of the nth working day of a range, counting from one.
 *
 * Used for the pace comparison and for nothing else. Comparing this
 * period's money against the whole of the last one would flatter or
 * damn a period purely for being unfinished, so the comparison is drawn
 * at the same elapsed working day of each.
 */
export function nthWorkingDay(from: string, n: number): string | null {
  if (n < 1) return null;
  let seen = 0;
  for (let d = from, guard = 0; guard < 400; d = addDays(d, 1), guard += 1) {
    if (isWorkingDay(d)) {
      seen += 1;
      if (seen === n) return d;
    }
  }
  return null;
}

// ---------------------------------------------------------------
// The period the report covers
// ---------------------------------------------------------------

export interface ReportPeriod {
  id: string;
  label: string;
  startDate: string;
  /** Last day, inclusive. */
  endDate: string;
  /** Weeks before the modelled opening. Zero once the calendar runs out. */
  weeksToOpen: number;
  /** True where this band is one of the four seeded periods. */
  seeded: boolean;
  /** One clause a reader can check the band against. */
  basis: string;
}

const SORTED_PERIODS = [...PERIODS].sort((a, b) =>
  a.startDate.localeCompare(b.startDate),
);

/**
 * The length of a band, measured off the data rather than typed.
 *
 * Four weeks is what venue.ts holds today. Measuring it means a period
 * model that changes length moves this file with it instead of quietly
 * disagreeing with it.
 */
const PERIOD_DAYS = (() => {
  const first = SORTED_PERIODS[0];
  return first ? daysApart(first.startDate, first.endDate) + 1 : 28;
})();

const PERIOD_WEEKS = Math.round(PERIOD_DAYS / 7);

/** The band a date falls in, continued at the same length past the calendar. */
export function reportPeriodFor(asOf: string): ReportPeriod {
  const seeded = SORTED_PERIODS.find(
    (p) => asOf >= p.startDate && asOf <= p.endDate,
  );
  if (seeded) {
    return {
      id: seeded.id,
      label: seeded.label,
      startDate: seeded.startDate,
      endDate: seeded.endDate,
      weeksToOpen: seeded.weeksToOpen,
      seeded: true,
      basis:
        "This band is one of the four seeded periods in data/venue.ts.",
    };
  }

  const first = SORTED_PERIODS[0];
  const last = SORTED_PERIODS[SORTED_PERIODS.length - 1];
  if (!first || !last) {
    throw new Error("The period model holds no periods to report on.");
  }

  if (asOf < first.startDate) {
    const back = Math.ceil(daysApart(asOf, first.startDate) / PERIOD_DAYS);
    const startDate = addDays(first.startDate, -back * PERIOD_DAYS);
    return {
      id: `before-${back}`,
      label:
        back === 1
          ? "The four weeks before the plan starts"
          : `${back * PERIOD_WEEKS} weeks before the plan starts`,
      startDate,
      endDate: addDays(startDate, PERIOD_DAYS - 1),
      weeksToOpen: first.weeksToOpen + back * PERIOD_WEEKS,
      seeded: false,
      basis:
        "Before the seeded calendar. The band keeps the four week rhythm the four seeded periods establish and holds no planned work at all.",
    };
  }

  const forward = Math.floor((daysApart(last.endDate, asOf) - 1) / PERIOD_DAYS) + 1;
  const startDate = addDays(last.endDate, (forward - 1) * PERIOD_DAYS + 1);
  return {
    id: `after-${forward}`,
    label:
      forward === 1
        ? `The first ${PERIOD_WEEKS} weeks after the modelled opening`
        : `Trading period ${forward}`,
    startDate,
    endDate: addDays(startDate, PERIOD_DAYS - 1),
    weeksToOpen: 0,
    seeded: false,
    basis: `Past the seeded calendar, which ends on ${prettyDate(last.endDate)}. The band keeps the same rhythm as the four seeded periods and holds none of them, so nothing is planned into it until somebody plans it.`,
  };
}

/**
 * The band before this one, or null where there is nothing before it.
 *
 * Null is the honest answer at the start of the seeded calendar, and it
 * is the answer the pace block prints rather than a comparison against
 * a period nobody worked.
 */
export function previousPeriodOf(period: ReportPeriod): ReportPeriod | null {
  const first = SORTED_PERIODS[0];
  if (!first) return null;
  const start = addDays(period.startDate, -PERIOD_DAYS);
  if (start < first.startDate) return null;
  return reportPeriodFor(start);
}

// ---------------------------------------------------------------
// How much of the period has actually happened
// ---------------------------------------------------------------

/**
 * THE GUARD ON EVERY RATE THIS FILE PRINTS.
 *
 * `TOUCH_TARGET.minDays` refuses to average a person's own touches until
 * three working days of history exist. This is the same idea one level
 * up, at the number of days a period needs before a rate over it means
 * anything, and it is the later of five working days or a quarter of the
 * band. On a twenty working day period those two coincide, which is the
 * check that five is the right number here rather than a borrowed one.
 */
export const RATE_GUARD = {
  minWorkingDays: 5,
  shareOfPeriod: 0.25,
} as const;

export interface Elapsed {
  workingDays: number;
  elapsed: number;
  remaining: number;
  /** The working days a rate needs before it is printed at all. */
  needed: number;
  /** True once a rate over the remaining days is worth stating. */
  rateReadable: boolean;
  /** True where the whole band is behind the reader. */
  complete: boolean;
}

export function elapsedIn(period: ReportPeriod, asOf: string): Elapsed {
  const workingDays = workingDaysIn(period.startDate, period.endDate);
  const upTo = asOf < period.startDate ? null : asOf > period.endDate ? period.endDate : asOf;
  const elapsed = upTo ? workingDaysIn(period.startDate, upTo) : 0;
  const needed = Math.max(
    RATE_GUARD.minWorkingDays,
    Math.ceil(workingDays * RATE_GUARD.shareOfPeriod),
  );
  return {
    workingDays,
    elapsed,
    remaining: Math.max(0, workingDays - elapsed),
    needed,
    rateReadable: elapsed >= needed,
    complete: asOf > period.endDate,
  };
}

// ---------------------------------------------------------------
// The leading ledger, pro rata
// ---------------------------------------------------------------

const OUTSIDE_TYPES = ["tabling", "networking-event", "go-see"];

export interface ActivityReading {
  shifts: number;
  hours: number;
  outsideHours: number;
  /** Outside hours ticked off inside the band and on or before the date. */
  outsideDone: number;
  completedShifts: number;
  targetConversations: number;
  /** Where a straight line across elapsed working days would put it. */
  straightLine: number;
  /** Outside hours planned and not yet ticked off. */
  outstanding: number;
  /**
   * Hours a working day for the rest of the band, or null.
   *
   * Null while the band is too young to carry a rate, null once there
   * are no working days left to spread anything over, and null where
   * nothing is planned. Each of those cases prints a sentence instead.
   */
  runRate: number | null;
  /** Why the rate is absent, where it is. */
  runRateNote: string | null;
}

export function activityReading(
  activity: ActivityLine[],
  period: ReportPeriod,
  asOf: string,
  elapsed: Elapsed,
): ActivityReading {
  const inBand = activity.filter(
    (l) => l.week >= period.startDate && l.week <= period.endDate,
  );
  const totals = activityTotals(inBand);

  let outsideDone = 0;
  for (const line of inBand) {
    const done = line.completedAt;
    if (!done || !OUTSIDE_TYPES.includes(line.type)) continue;
    if (done <= asOf) outsideDone += line.hours;
  }

  const share = elapsed.workingDays > 0 ? elapsed.elapsed / elapsed.workingDays : 0;
  const straightLine = Math.round(totals.outsideHours * share * 10) / 10;
  const outstanding = Math.max(0, totals.outsideHours - outsideDone);

  let runRate: number | null = null;
  let runRateNote: string | null = null;
  if (totals.outsideHours === 0) {
    runRateNote =
      "No outbound hours are planned into this period, so there is no rate to require. That is a fact about the plan rather than about the work.";
  } else if (!elapsed.rateReadable) {
    runRateNote = `Suppressed. ${elapsed.elapsed} of the ${elapsed.needed} working days a rate needs have gone, so anything computed over the rest of this period would be arithmetic on a period that has barely started.`;
  } else if (elapsed.remaining === 0) {
    runRateNote =
      "The period is behind us, so there is nothing left to spread the outstanding hours over. What is outstanding is simply outstanding.";
  } else if (outstanding === 0) {
    runRateNote =
      "Every planned hour outside the building has been ticked off, so nothing is required over the days that are left.";
  } else {
    runRate = Math.round((outstanding / elapsed.remaining) * 10) / 10;
  }

  return {
    shifts: totals.shifts,
    hours: totals.hours,
    outsideHours: totals.outsideHours,
    outsideDone,
    completedShifts: totals.completed,
    targetConversations: totals.targetConversations,
    straightLine,
    outstanding,
    runRate,
    runRateNote,
  };
}

// ---------------------------------------------------------------
// The lagging ledger, paced
// ---------------------------------------------------------------

export interface PaceReading {
  previousLabel: string;
  /** The previous band, up to its own equivalent elapsed working day. */
  previousToSamePoint: number;
  /** The date that equivalent day fell on, for printing. */
  comparableOn: string;
  /** The whole of the previous band, for context and never as a target. */
  previousWhole: number;
  /** This band's figure less the previous one at the same point. */
  delta: number;
}

export interface RevenueReading {
  /** Money collected inside the band and on or before the date. */
  collected: number;
  collectionEvents: CollectionEvent[];
  /** Contracts with money landing inside the band. */
  contracts: number;
  /** The standing book, which is not a period figure and says so. */
  bookContracts: number;
  bookGuests: number;
  bookValue: number;
  bookDeposits: number;
  /** Share of contract value resting on a price a person typed. */
  typedShare: number | null;
  typedValue: number;
  pace: PaceReading | null;
  /** Why there is no pace, where there is none. */
  paceNote: string | null;
}

export function revenueReading(
  book: BookLine[],
  period: ReportPeriod,
  asOf: string,
  elapsed: Elapsed,
): RevenueReading {
  const schedule = collectionSchedule(book);
  const inBand = schedule.filter(
    (e) => e.on >= period.startDate && e.on <= period.endDate && e.on <= asOf,
  );
  const collected = inBand.reduce((n, e) => n + e.amount, 0);

  const totals = revenueTotals(book);
  const previous = previousPeriodOf(period);

  let pace: PaceReading | null = null;
  let paceNote: string | null = null;

  if (!previous) {
    paceNote =
      "No prior period to pace against. This is the first band in the plan, the venue has no year to compare with, and a straight line drawn through a contract figure would be a manufactured failure rather than a reading.";
  } else if (elapsed.elapsed === 0) {
    paceNote =
      "No working day of this period has gone yet, so there is nothing to compare at the same point of the last one.";
  } else {
    const comparableOn =
      nthWorkingDay(previous.startDate, elapsed.elapsed) ?? previous.endDate;
    const previousToSamePoint = schedule
      .filter((e) => e.on >= previous.startDate && e.on <= comparableOn)
      .reduce((n, e) => n + e.amount, 0);
    const previousWhole = schedule
      .filter((e) => e.on >= previous.startDate && e.on <= previous.endDate)
      .reduce((n, e) => n + e.amount, 0);
    pace = {
      previousLabel: previous.label,
      previousToSamePoint,
      comparableOn,
      previousWhole,
      delta: collected - previousToSamePoint,
    };
    if (previousToSamePoint === 0 && previousWhole === 0) {
      paceNote =
        "The previous period collected nothing at all, so the comparison is against a zero and no percentage is drawn from it.";
    }
  }

  return {
    collected,
    collectionEvents: inBand,
    contracts: new Set(inBand.map((e) => e.lineId)).size,
    bookContracts: totals.contracts,
    bookGuests: totals.guests,
    bookValue: totals.revenue,
    bookDeposits: totals.deposits,
    typedShare:
      totals.revenue > 0 ? totals.userPricedRevenue / totals.revenue : null,
    typedValue: totals.userPricedRevenue,
    pace,
    paceNote,
  };
}

// ---------------------------------------------------------------
// The board
// ---------------------------------------------------------------

export interface BoardReading {
  counts: Record<PitchStatus, number>;
  rows: number;
  /** Rows whose last recorded touch falls inside the band. */
  touchedInPeriod: number;
}

export function boardReading(
  statuses: ProspectPackageStatus[],
  period: ReportPeriod,
  asOf: string,
): BoardReading {
  const counts: Record<PitchStatus, number> = {
    unworked: 0,
    "reached-out": 0,
    conversation: 0,
    "soft-hold": 0,
    booked: 0,
    lost: 0,
  };
  let touchedInPeriod = 0;
  for (const row of statuses) {
    counts[row.status] += 1;
    const at = row.lastTouchAt;
    if (at && at >= period.startDate && at <= period.endDate && at <= asOf) {
      touchedInPeriod += 1;
    }
  }
  return { counts, rows: statuses.length, touchedInPeriod };
}

// ---------------------------------------------------------------
// Held dates, each with its release date
// ---------------------------------------------------------------

/**
 * THE RELEASE DATE IS DERIVED FROM THE ONE TERM THAT IS PUBLISHED.
 *
 * A hold with no release date on it is a date quietly taken off the
 * market by our own side, which is the sentence `/coaching` already puts
 * in the one to one and has nowhere to send the answer to. Nothing in
 * the seed stores a release date, so rather than invent one this takes
 * the published change notice: three days before the event is the last
 * day the party can still be altered on the operator's own published
 * terms, so it is the last honest day to be sitting on the date.
 *
 * NO MINIMUM BOOKING NOTICE IS PUBLISHED, which is why this leans on the
 * change notice instead. Reaching for a competitor's five day rule would
 * put somebody else's terms on our own held dates.
 */
export function releaseDateFor(targetDate: string): string {
  return addDays(targetDate, -STANDARD_TERMS.changeNoticeDays);
}

export interface HeldDate {
  prospectId: string;
  name: string;
  packageId: string;
  targetDate: string;
  releaseOn: string;
  guests: number | null;
  lanes: number | null;
  /**
   * Share of the house this hold would consume, which is null on every
   * row because there is no house figure to take a share of.
   *
   * DIME publishes no bowling lane count for any location. The fork
   * this was built from divided by a lane count read off a competitor's
   * page, and carrying that across would have produced a percentage that
   * is arithmetically clean and factually about somebody else's
   * building.
   * The lane count on the hold survives, because a hold for two hundred
   * guests really is ten lanes at the published ratio; the proportion
   * does not, because a proportion needs a denominator and the operator
   * has withheld it.
   */
  shareOfFloor: number | null;
  /** Working days from the report date to the release date. Negative once past. */
  daysToRelease: number;
  pastRelease: boolean;
  provenance: Provenance;
}

export function heldDates(
  statuses: ProspectPackageStatus[],
  book: BookLine[],
  asOf: string,
): HeldDate[] {
  const signed = new Set(book.map((l) => l.eventDate));
  return statuses
    .filter((s) => s.status === "soft-hold" && s.targetDate && !signed.has(s.targetDate))
    .map((s) => {
      const targetDate = s.targetDate as string;
      const guests = s.discussedHeadcount ?? null;
      const lanes = guests ? lanesForGuests(guests) : null;
      const releaseOn = releaseDateFor(targetDate);
      return {
        prospectId: s.prospectId,
        name: PROSPECT_BY_ID[s.prospectId]?.name ?? s.prospectId,
        packageId: s.packageId,
        targetDate,
        releaseOn,
        guests,
        lanes,
        /* Was `lanes / houseLanes`. The division is right and the house
           lane count is unpublished, so it is guarded rather than
           removed. See the field's own note. */
        shareOfFloor:
          lanes && HOUSE_LANES !== null ? lanes / HOUSE_LANES : null,
        daysToRelease: daysApart(asOf, releaseOn),
        pastRelease: releaseOn < asOf,
        provenance: s.provenance,
      };
    })
    .sort((a, b) => a.targetDate.localeCompare(b.targetDate));
}

// ---------------------------------------------------------------
// Losses, in the buyer's own words
// ---------------------------------------------------------------

export interface LossReading {
  prospectId: string;
  name: string;
  lane: Lane | null;
  /** The message that carried the loss, where the thread holds one. */
  saidOn: string | null;
  /** What the buyer said, or the note written up after a call. */
  words: string | null;
  /**
   * True where that text was written up after a phone call rather than
   * typed by the buyer.
   *
   * The distinction is on the message already and it matters upward: a
   * quotation a district manager reads as the buyer's own sentence, when
   * it is actually our summary of a call, is the smallest possible lie
   * and still a lie.
   */
  wordsAreSummary: boolean;
  /** Whether the buyer told us they had already committed elsewhere. */
  bookedElsewhere: boolean;
  /** The objection id on the reply, where a reply carries one. */
  objectionId: string | null;
  /** A dated next step, where one was diarised rather than assumed. */
  nextStep: string | null;
  nextStepDue: string | null;
}

export function losses(
  statuses: ProspectPackageStatus[],
  replies: Reply[],
): LossReading[] {
  const lost = statuses.filter((s) => s.status === "lost");
  return lost.map((s) => {
    const thread = CONVERSATIONS.filter((m) => m.prospectId === s.prospectId);
    const closing = [...thread]
      .reverse()
      .find((m) => m.effect?.movedStatusTo === "lost");
    /* Their words, which means the inbound message. Where the loss was
       recorded on an outbound line, the sentence belongs to us and is
       not printed as theirs. */
    const inbound = [...thread]
      .reverse()
      .find(
        (m) =>
          m.direction === "inbound" &&
          (m.effect?.signals ?? []).some(
            (sig) => sig === "said-no" || sig === "booked-elsewhere",
          ),
      );
    const reply = replies.find((r) => r.prospectId === s.prospectId);
    const signals = new Set([
      ...(closing?.effect?.signals ?? []),
      ...(inbound?.effect?.signals ?? []),
    ]);
    return {
      prospectId: s.prospectId,
      name: PROSPECT_BY_ID[s.prospectId]?.name ?? s.prospectId,
      lane: PROSPECT_BY_ID[s.prospectId]?.lane ?? null,
      saidOn: inbound ? venueDate(inbound.at) : closing ? venueDate(closing.at) : null,
      words: inbound?.body ?? null,
      wordsAreSummary: inbound?.summarised ?? false,
      bookedElsewhere: signals.has("booked-elsewhere"),
      objectionId: reply?.objectionId ?? null,
      nextStep: reply?.nextStep ?? null,
      nextStepDue: reply?.nextStepDue ?? null,
    };
  });
}

// ---------------------------------------------------------------
// Inbound enquiries still open, against the response commitment
// ---------------------------------------------------------------

export interface OpenEnquiry {
  id: string;
  organisation: string;
  lane: Lane;
  status: RequestStatus;
  receivedOn: string;
  dueOn: string;
  /** Met, missed, or still running. Never a colour on its own. */
  commitment: "met" | "missed" | "waiting";
  workingHours: number | null;
  ask: string;
}

const OPEN_STATUSES = new Set([
  "new",
  "acknowledged",
  "qualifying",
  "quoted",
  "held",
  "gone-quiet",
]);

export function openEnquiries(
  requests: GroupRequest[],
  asOf: string,
): OpenEnquiry[] {
  return requests
    .filter((r) => OPEN_STATUSES.has(r.status) && venueDate(r.receivedAt) <= asOf)
    .map<OpenEnquiry>((r) => {
      const answered = r.firstRespondedAt;
      const workingHours = answered
        ? Math.round(workingHoursBetween(r.receivedAt, answered) * 10) / 10
        : null;
      return {
        id: r.id,
        organisation:
          (r.prospectId ? PROSPECT_BY_ID[r.prospectId]?.name : null) ??
          r.organisationName ??
          "Organisation not recorded",
        lane: r.lane,
        status: r.status,
        receivedOn: venueDate(r.receivedAt),
        dueOn: venueDate(r.responseDueAt),
        commitment:
          workingHours === null
            ? "waiting"
            : workingHours <= RESPONSE_COMMITMENT.hours
              ? "met"
              : "missed",
        workingHours,
        ask: r.askSummary,
      };
    })
    .sort((a, b) => a.receivedOn.localeCompare(b.receivedOn));
}

// ---------------------------------------------------------------
// Commitments the district inherits
// ---------------------------------------------------------------

/**
 * WHAT WAS PUT ON THE TABLE, READ OUT OF THE THREADS.
 *
 * Messages in `data/conversations.ts` carry an `offerExtensionId`, and
 * they are the record of an obligation somebody made on a call. Those
 * outlive whoever made them, and a manager who finds one at handover has
 * been badly served.
 *
 * THE TOKEN LIST IS SHORT BECAUSE THE OFFER LIST IS SHORT. `data/venue.ts`
 * carries the two things this operator actually publishes: the contents
 * of one party package and a three day change notice. The fork's four
 * offers were an opening calendar, a construction site tour, a rate lock
 * and a fundraiser share, and every one of them belonged to a building
 * that had not opened or to another company's programme. They are gone
 * rather than renamed.
 *
 * An extension that matches nothing shows up in `unmatched` and is
 * reported as an unread commitment instead of being dropped quietly,
 * which is exactly the behaviour a shrinking offer list needs.
 */
const OFFER_TOKEN: { token: string; offerId: string }[] = [
  { token: "party", offerId: "all-inclusive-party" },
  { token: "notice", offerId: "change-notice-three-days" },
];

export interface CommitmentRow {
  offerId: string;
  offerName: string;
  what: string;
  costNote: string;
  provenance: Provenance;
  /** One entry per organisation the offer was extended to. */
  extendedTo: { prospectId: string; name: string; on: string }[];
  /** Of those, the ones agreed inside the reporting band. */
  newInPeriod: number;
}

export interface CommitmentReading {
  rows: CommitmentRow[];
  total: number;
  unmatched: string[];
}

export function commitments(period: ReportPeriod, asOf: string): CommitmentReading {
  const byOffer = new Map<string, CommitmentRow>();
  const unmatched: string[] = [];
  let total = 0;

  for (const message of CONVERSATIONS) {
    const extensionId = message.effect?.offerExtensionId;
    if (!extensionId) continue;
    const on = venueDate(message.at);
    if (on > asOf) continue;
    total += 1;

    const match = OFFER_TOKEN.find((t) => extensionId.includes(t.token));
    const offer = match ? OFFER_BY_ID[match.offerId] : undefined;
    if (!match || !offer) {
      unmatched.push(extensionId);
      continue;
    }

    const row = byOffer.get(offer.id) ?? {
      offerId: offer.id,
      offerName: offer.name,
      what: offer.what,
      costNote: offer.costNote,
      provenance: offer.provenance,
      extendedTo: [],
      newInPeriod: 0,
    };
    row.extendedTo.push({
      prospectId: message.prospectId,
      name: PROSPECT_BY_ID[message.prospectId]?.name ?? message.prospectId,
      on,
    });
    if (on >= period.startDate && on <= period.endDate) row.newInPeriod += 1;
    byOffer.set(offer.id, row);
  }

  const order = OFFERS.map((o) => o.id);
  const rows = [...byOffer.values()].sort(
    (a, b) => order.indexOf(a.offerId) - order.indexOf(b.offerId),
  );
  for (const row of rows) row.extendedTo.sort((a, b) => a.on.localeCompare(b.on));
  return { rows, total, unmatched };
}

// ---------------------------------------------------------------
// The exceptions, which are the point of the whole document
// ---------------------------------------------------------------

/**
 * A REPORT WITH NO ASK IN IT IS A STATUS UPDATE.
 *
 * D8 says partner, not report to, and the difference between the two is
 * whether anything on the page needs an answer. So every row here names
 * the thing, the decision being asked for, and the date it is wanted by,
 * and each date comes off the row itself rather than out of the air: a
 * hold's release date, a published booking notice, the modelled opening,
 * the close of the band.
 *
 * Nothing here is a new fact. Each exception is a reading of a row that
 * is already on the board, on the book or in the threads.
 */
export interface ExceptionRow {
  id: string;
  title: string;
  /** What is true, in one sentence. */
  what: string;
  /** The decision being asked for, phrased as a decision. */
  decision: string;
  /** The date the answer is wanted by, and why that date. */
  wantedBy: string;
  wantedByBecause: string;
  provenance: Provenance;
}

export function exceptions(input: {
  book: BookLine[];
  statuses: ProspectPackageStatus[];
  requests: GroupRequest[];
  period: ReportPeriod;
  asOf: string;
}): ExceptionRow[] {
  const { book, statuses, requests, period, asOf } = input;
  const out: ExceptionRow[] = [];
  const held = heldDates(statuses, book, asOf);

  /* 1. Dates sitting past the last day they could convert. */
  const stale = held.filter((h) => h.pastRelease);
  if (stale.length > 0) {
    const names = stale
      .map((h) => `${h.name} on ${h.targetDate}`)
      .join(", ");
    out.push({
      id: "holds-past-release",
      title: `${stale.length} held ${stale.length === 1 ? "date is" : "dates are"} past the last day they could convert`,
      what: `${names}. Each was held against no deposit, and the ${STANDARD_TERMS.changeNoticeDays} day change notice, which is the only timing term published anywhere, has already passed on every one of them.`,
      decision:
        "Release them and put the dates back on the market, or say which are being carried and on whose authority.",
      wantedBy: asOf,
      wantedByBecause:
        "The release date is already behind us, so every further day is an evening held by our own side for nothing.",
      provenance: "modeled",
    });
  }

  /*
    2. A single hold taking more than half the house, WHICH IS A TEST
    THAT NO LONGER RUNS.

    `shareOfFloor` is null on every row, because DIME publishes no
    lane count for any location and a share needs something to be a
    share of. So this filter matches nothing and the escalation never
    fires. The rule is left standing rather than deleted, because it is
    the right rule and the day a store gives us a lane count it starts
    working again on the figures already here.

    A warning that cannot be tested must not be quietly dropped, so the
    absence is reported instead, once, as its own line. It asks for the
    lane count rather than for a decision about a hold, because that is
    the only thing anybody can actually act on.
  */
  const heavy = held.filter(
    (h) => !h.pastRelease && h.shareOfFloor !== null && h.shareOfFloor > 0.5,
  );
  for (const h of heavy) {
    out.push({
      id: `heavy-hold-${h.prospectId}`,
      title: `One hold takes ${Math.round((h.shareOfFloor ?? 0) * 100)}% of the house`,
      what: `${h.name} is holding ${h.targetDate} for ${h.guests} guests, which is ${h.lanes} lanes at one lane per twenty guests. Nothing is signed against it.`,
      decision:
        "Confirm that a group this size may hold most of a building, or set the size above which a hold needs the district.",
      wantedBy: h.releaseOn,
      wantedByBecause:
        "The hold has to convert or release by then, and a decision after that date is a decision about nothing.",
      provenance: "modeled",
    });
  }

  const liveHolds = held.filter((h) => !h.pastRelease);
  if (HOUSE_LANES === null && liveHolds.length > 0) {
    const biggest = liveHolds.reduce((a, b) =>
      (b.lanes ?? 0) > (a.lanes ?? 0) ? b : a,
    );
    out.push({
      id: "lane-count-not-published",
      title: "No hold can be checked against the size of the house",
      what: `DIME publishes no bowling lane count for any location, including Lakewood Center, the nearest store to this office. ${liveHolds.length} live ${liveHolds.length === 1 ? "hold sits" : "holds sit"} on the calendar and the largest of them, ${biggest.name}, wants ${biggest.lanes ?? "an unstated number of"} lanes at one lane per twenty guests. Whether that is a corner of the house or most of it is not answerable off any published page, so the usual escalation for a hold taking more than half the building has nothing to fire on.`,
      decision:
        "Get a lane count from the store and put it in the record, or set the hold ceiling in lanes rather than as a share so it can be tested at all.",
      wantedBy: biggest.releaseOn,
      wantedByBecause:
        "The largest live hold has to convert or release by then, and it would be better to know what it is holding before that day rather than after it.",
      provenance: "withheld",
    });
  }

  /* 3. A signature resting on a price somebody typed. */
  const typed = book.filter(
    (l) => l.pricePerGuestProvenance === "user_input" && l.eventDate >= asOf,
  );
  for (const line of typed) {
    const name = PROSPECT_BY_ID[line.prospectId]?.name ?? line.prospectId;
    out.push({
      id: `typed-price-${line.id}`,
      title: "A signed contract is priced on a number a person typed",
      what: `${name} is signed at $${line.pricePerGuest.toFixed(2)} a guest for ${line.guests} guests. No price is published for this package, so that figure came from this desk rather than from a rate card, and it is now the precedent for every group that asks the same question.`,
      decision:
        "Confirm the rate for this package or set one, so the next quote is a company figure rather than a personal one.",
      wantedBy: addDays(line.eventDate, -STANDARD_TERMS.changeNoticeDays),
      wantedByBecause: `The one published timing term is that changes need ${STANDARD_TERMS.changeNoticeDays} or more days notice, so this is the last day the contract can move before the group arrives.`,
      provenance: "user_input",
    });
  }

  /* 4. Obligations that outlive the reporting band.

     THE TWO BLOCKS THAT USED TO SIT HERE HAVE BEEN DELETED. One read a
     rate honoured for a year and one read a fundraiser share offered in
     the opening months. Neither offer exists any more: the first was a
     promise about a rate card that had not been written for a building
     that had not opened, and the second quoted another operator's
     published programme. Any commitment still on a thread that matches
     neither surviving offer lands in `commitments().unmatched`, which is
     reported rather than swallowed, and that is a better answer than a
     decision card about an offer nobody can make. */

  /* 5. The floor, where an enquiry has already been lost to it. */
  const lapsed = requests.filter(
    (r) => r.status === "lapsed" && venueDate(r.receivedAt) <= asOf,
  );
  const openSeats = SEATS.filter((s) => s.state === "open");
  if (lapsed.length > 0 && openSeats.length > 0) {
    out.push({
      id: "cover",
      title: `${lapsed.length} inbound ${lapsed.length === 1 ? "enquiry has" : "enquiries have"} gone cold with ${openSeats.length} of ${SEATS.length} seats open`,
      what: `Nobody said no on ${lapsed.length === 1 ? "it" : "them"}. ${lapsed.length === 1 ? "It" : "They"} sat past the ${RESPONSE_COMMITMENT.label.toLowerCase()} commitment until the sender stopped waiting, while one filled seat covered all nine lanes.`,
      decision:
        "Cover the open seats, move the commitment to something one seat can actually hold, or accept the lapse rate as the cost of the vacancy.",
      wantedBy: period.endDate,
      wantedByBecause:
        "The answer changes what the next period is planned against, so it is worth having before this one closes.",
      provenance: "illustrative",
    });
  }

  return out;
}
