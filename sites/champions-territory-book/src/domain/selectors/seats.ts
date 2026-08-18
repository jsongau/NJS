import type { ActivityLine, Lane, PitchStatus, Prospect } from "@/domain/types";
import type { RampStep, Seat, SeatId } from "@/domain/seats";
import {
  HOLD_GATE_STEP,
  RAMP_STEPS,
  holdWithheldBecause,
  mayHoldADate,
  outstandingSteps,
  rampStateOf,
  signedOffOn,
  signedSteps,
  type RampState,
} from "@/domain/seats";
import { isWorkingDay } from "@/domain/selectors/daily";
import { SEATS, seatOwningLane } from "@/data/seats";
import { PROSPECTS } from "@/data/prospects";
import { LANE_META, LANE_ORDER } from "@/domain/lanes";
import { windowOpensWithin } from "@/domain/selectors/desk";
import {
  furthestStatus,
  touchesFor,
  type PipelineState,
} from "@/state/PipelineProvider";

/**
 * THE CREW SCREEN, DERIVED.
 *
 * Nothing on the team screen is stored except the seven fields on a
 * seat. The slice of the board comes from the lanes, the coverage comes
 * from the same touch table the desk ranks on, the hours come from the
 * activity ledger, and the ramp comes from the signoff dates against the
 * injected clock. Move an organisation on the desk or plan a shift on
 * the field page and every figure here moves.
 *
 * ── THE CLOCK IS AN ARGUMENT, NOT A GLOBAL ────────────────────────
 * Every function in this file that needs a date is handed one.
 * `useAsOf()` supplies it from the `as-of` search parameter, which the
 * accounts board owns the visible control for. Nothing here reads a
 * clock, so a screenshot taken in November still shows the arithmetic
 * that was true when it was taken.
 *
 * ── WHY THERE ARE TWO COVERAGE FIGURES AND NOT ONE ────────────────
 * `/coaching` computes the one activity number worth a target:
 * calendar-locked organisations touched inside their buying window, over
 * the count whose window is open. Its denominator is set by other
 * organisations' calendars rather than by anybody's effort, which is
 * what makes it ungameable and is the reason it is the team's figure.
 *
 * Two of the three seats carry no calendar-locked lane at all, so that
 * figure alone would read 0 of 0 for both of them and say nothing. So a
 * seat carries its own in-window coverage over everything it holds, and
 * the calendar-locked subset is reported beside it where there is one.
 * The two are labelled differently on screen because they are different
 * claims: one denominator can be argued with and the other cannot.
 */

// ---------------------------------------------------------------
// Board slice
// ---------------------------------------------------------------

/** The horizon the desk and the coaching page both use. Four months. */
export const WINDOW_HORIZON_MONTHS = 4;

export interface BoardSlice {
  /** Organisations in these lanes. */
  total: number;
  /** Of those, the ones whose buying window opens inside the horizon. */
  inWindow: number;
  /** Of the in-window ones, the ones touched at all this period. */
  workedInWindow: number;
  /** The calendar-locked subset of the two figures above. */
  lockedInWindow: number;
  lockedWorkedInWindow: number;
  /** Touched at all this period, in-window or not. */
  touched: number;
  /** Publishes no email address anywhere. These are visits. */
  doorOnly: number;
  /** Publishes an address that was read off their own site. */
  emailable: number;
  byStatus: Record<PitchStatus, number>;
  /** In conversation or holding a date. Work with the next move on us. */
  live: number;
  /** Touches recorded against these organisations this period. */
  touches: number;
}

const EMPTY_STATUS: Record<PitchStatus, number> = {
  unworked: 0,
  "reached-out": 0,
  conversation: 0,
  "soft-hold": 0,
  booked: 0,
  lost: 0,
};

export function boardSlice(
  lanes: Lane[],
  state: PipelineState,
  nowMonth: number,
): BoardSlice {
  const rows: Prospect[] = PROSPECTS.filter((p) => lanes.includes(p.lane));
  const byStatus = { ...EMPTY_STATUS };
  const out: BoardSlice = {
    total: rows.length,
    inWindow: 0,
    workedInWindow: 0,
    lockedInWindow: 0,
    lockedWorkedInWindow: 0,
    touched: 0,
    doorOnly: 0,
    emailable: 0,
    byStatus,
    live: 0,
    touches: 0,
  };

  for (const p of rows) {
    const touches = touchesFor(state, p.id);
    const worked = touches > 0;
    const open = windowOpensWithin(p.buyingWindow, nowMonth, WINDOW_HORIZON_MONTHS);
    const locked = LANE_META[p.lane].occasionClass === "calendar-locked";

    if (open) {
      out.inWindow += 1;
      if (worked) out.workedInWindow += 1;
      if (locked) {
        out.lockedInWindow += 1;
        if (worked) out.lockedWorkedInWindow += 1;
      }
    }
    if (worked) out.touched += 1;
    if (p.emailConfidence === "none") out.doorOnly += 1;
    if (p.emailConfidence === "verified_public") out.emailable += 1;
    out.touches += touches;

    const status = furthestStatus(state, p.id);
    byStatus[status] += 1;
    if (status === "conversation" || status === "soft-hold") out.live += 1;
  }

  return out;
}

// ---------------------------------------------------------------
// Hours
// ---------------------------------------------------------------

/** Which kinds of work happen out in the territory. Same list as the book. */
const OUTSIDE = ["tabling", "networking-event", "go-see"];

export interface SeatHours {
  /** Hours planned against this seat, whoever the lanes belong to. */
  planned: number;
  /** Of those, the ones out in the territory rather than at the desk. */
  outside: number;
  /**
   * Hours planned INTO this seat's lanes, by anybody.
   *
   * A shift naming four lanes is split evenly across them rather than
   * counted four times. `laneCoverage` in the book counts the whole
   * shift against each lane it names, which is right for "is this lane
   * being worked at all" and wrong here, because these figures are
   * summed across seats and a chamber mixer would otherwise put twelve
   * hours into a three hour shift.
   */
  intoLanes: number;
}

export function seatHours(seat: Seat, activity: ActivityLine[]): SeatHours {
  let planned = 0;
  let outside = 0;
  let intoLanes = 0;
  for (const line of activity) {
    if (line.seatId === seat.id) {
      planned += line.hours;
      if (OUTSIDE.includes(line.type)) outside += line.hours;
    }
    if (line.laneFocus.length > 0) {
      const mine = line.laneFocus.filter((l) => seat.lanes.includes(l)).length;
      if (mine > 0) intoLanes += (line.hours * mine) / line.laneFocus.length;
    }
  }
  return { planned, outside, intoLanes: Math.round(intoLanes * 10) / 10 };
}

/** Hours planned into each lane, split the same way. */
export function hoursByLane(activity: ActivityLine[]): Record<Lane, number> {
  const out = Object.fromEntries(LANE_ORDER.map((l) => [l, 0])) as Record<
    Lane,
    number
  >;
  for (const line of activity) {
    if (line.laneFocus.length === 0) continue;
    for (const lane of line.laneFocus) {
      out[lane] += line.hours / line.laneFocus.length;
    }
  }
  for (const lane of LANE_ORDER) out[lane] = Math.round(out[lane] * 10) / 10;
  return out;
}

// ---------------------------------------------------------------
// The ramp against the clock
// ---------------------------------------------------------------

/**
 * Which working day of the ramp a seat is on.
 *
 * WORKING DAYS, NEVER CALENDAR DAYS, and `isWorkingDay` carries that
 * argument already rather than having it restated here: schools,
 * employers and clinics do not read a cold email on a Sunday, and a ramp
 * that counted Saturday would report a person two days behind every
 * Monday morning for a reason that has nothing to do with them.
 *
 * Returns null while a seat is open, because there is no clock running,
 * and null before the start date, because a ramp has no day minus three.
 */
export function rampWorkingDay(seat: Seat, asOf: string): number | null {
  if (!seat.startedOn) return null;
  if (asOf < seat.startedOn) return null;
  const cursor = new Date(`${seat.startedOn}T12:00:00Z`);
  const end = new Date(`${asOf}T12:00:00Z`);
  if (Number.isNaN(cursor.getTime()) || Number.isNaN(end.getTime())) return null;
  let day = 0;
  while (cursor.getTime() <= end.getTime()) {
    if (isWorkingDay(cursor.toISOString().slice(0, 10))) day += 1;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    /* A guard rather than a trusting loop. A hand edited as-of parameter
       years out would otherwise walk a thousand iterations to produce a
       figure nobody can use. */
    if (day > 400) break;
  }
  return day;
}

// ---------------------------------------------------------------
// A seat, read
// ---------------------------------------------------------------

export interface SeatReading {
  seat: Seat;
  board: BoardSlice;
  hours: SeatHours;
  rampState: RampState;
  /** Which working day of the ramp, or null while the seat is open. */
  rampDay: number | null;
  signed: RampStep[];
  outstanding: RampStep[];
  /** The date step five was signed off, where it has been. */
  holdSignoffOn: string | null;
  mayHold: boolean;
  holdWithheld: string | null;
  /** Lanes this seat carries that have no hours planned into them at all. */
  unplannedLanes: Lane[];
  /** The last signoff date, so a closed ramp can say when it closed. */
  lastSignoffOn: string | null;
}

export function readSeat(
  seat: Seat,
  state: PipelineState,
  activity: ActivityLine[],
  asOf: string,
  nowMonth: number,
): SeatReading {
  const hoursLane = hoursByLane(activity);
  const gate = signedOffOn(seat, HOLD_GATE_STEP.id, asOf);
  const dates = seat.rampSignoffs
    .filter((row) => row.on <= asOf)
    .map((row) => row.on)
    .sort();
  return {
    seat,
    board: boardSlice(seat.lanes, state, nowMonth),
    hours: seatHours(seat, activity),
    rampState: rampStateOf(seat, asOf),
    rampDay: rampWorkingDay(seat, asOf),
    signed: signedSteps(seat, asOf),
    outstanding: outstandingSteps(seat, asOf),
    holdSignoffOn: gate ? gate.on : null,
    mayHold: mayHoldADate(seat, asOf),
    holdWithheld: holdWithheldBecause(seat, asOf),
    unplannedLanes: seat.lanes.filter((lane) => hoursLane[lane] <= 0),
    lastSignoffOn: dates.length > 0 ? dates[dates.length - 1] : null,
  };
}

// ---------------------------------------------------------------
// The team row
// ---------------------------------------------------------------

/**
 * THE TEAM GOAL IS THE SUM OF THE LEADING INDICATORS AND IS NEVER A SUM
 * OF DOLLARS.
 *
 * That is `/coaching`'s first rule applied upward, and it is a real team
 * goal rather than an arithmetic convenience: coverage of the in-window
 * population has a SHARED DENOMINATOR, set by other organisations'
 * calendars, so two seats covering four fifths of it between them is an
 * outcome neither of them owns alone. Contract value has no such
 * property. Adding two seats' revenue produces a number that says
 * nothing about either of them and invites the one comparison this
 * application refuses to draw.
 */
export interface TeamRow {
  seatsFilled: number;
  seatsOpen: number;
  /** The whole trade area, from the same source every other screen reads. */
  organisations: number;
  inWindow: number;
  workedInWindow: number;
  lockedInWindow: number;
  lockedWorkedInWindow: number;
  touched: number;
  touches: number;
  live: number;
  hoursPlanned: number;
  hoursOutside: number;
  /** Organisations belonging to a seat nobody sits in. */
  carriedForOpenSeats: number;
  /** Of those, the ones with a window open inside the horizon. */
  openSeatInWindow: number;
  openSeatUntouchedInWindow: number;
}

export function teamRow(
  readings: SeatReading[],
  activity: ActivityLine[],
): TeamRow {
  const row: TeamRow = {
    seatsFilled: 0,
    seatsOpen: 0,
    organisations: 0,
    inWindow: 0,
    workedInWindow: 0,
    lockedInWindow: 0,
    lockedWorkedInWindow: 0,
    touched: 0,
    touches: 0,
    live: 0,
    hoursPlanned: 0,
    hoursOutside: 0,
    carriedForOpenSeats: 0,
    openSeatInWindow: 0,
    openSeatUntouchedInWindow: 0,
  };

  for (const r of readings) {
    if (r.seat.state === "filled") row.seatsFilled += 1;
    else row.seatsOpen += 1;
    row.organisations += r.board.total;
    row.inWindow += r.board.inWindow;
    row.workedInWindow += r.board.workedInWindow;
    row.lockedInWindow += r.board.lockedInWindow;
    row.lockedWorkedInWindow += r.board.lockedWorkedInWindow;
    row.touched += r.board.touched;
    row.touches += r.board.touches;
    row.live += r.board.live;
    if (r.seat.state !== "filled") {
      row.carriedForOpenSeats += r.board.total;
      row.openSeatInWindow += r.board.inWindow;
      row.openSeatUntouchedInWindow += r.board.inWindow - r.board.workedInWindow;
    }
  }

  for (const line of activity) {
    row.hoursPlanned += line.hours;
    if (OUTSIDE.includes(line.type)) row.hoursOutside += line.hours;
  }

  return row;
}

// ---------------------------------------------------------------
// What to do on Monday about a person
// ---------------------------------------------------------------

/**
 * THE TEST THIS SCREEN IS HELD TO.
 *
 * A row of percentages is not an action. Each of these names a seat, a
 * count of something real, and a verb, and each one is derived from the
 * same state the rest of the application reads. Where nothing qualifies,
 * nothing is printed: an empty list is a true reading and a
 * manufactured suggestion is not.
 *
 * They are ranked by what goes wrong first if nobody does anything. A
 * withheld permission is first because it stops work outright. A buying
 * window is second because it shuts on somebody else's calendar and
 * cannot be worked later. A lane nobody has planned an hour into is
 * third because it can be fixed on any day of the period. Carrying two
 * seats is last, because it is a standing condition rather than an event.
 */
export type ActionKind =
  | "permission-withheld"
  | "window-shutting"
  | "lane-unplanned"
  | "covering";

export interface FloorAction {
  id: string;
  kind: ActionKind;
  /** The imperative. What a manager does about it. */
  verb: string;
  /** The seat it is about. There is always one. */
  seatId: SeatId;
  /** The figure, and the word for what it counts. */
  figure: number;
  unit: string;
  /** Why it is on this list and not further down it, in one line. */
  because: string;
  /** The screen it is done from. A real route, always. */
  to: string;
  toLabel: string;
}

export function floorActions(readings: SeatReading[]): FloorAction[] {
  const out: FloorAction[] = [];

  for (const r of readings) {
    if (r.seat.state === "filled" && !r.mayHold) {
      out.push({
        id: `permission-${r.seat.id}`,
        kind: "permission-withheld",
        verb: `Run step ${HOLD_GATE_STEP.n} with seat ${r.seat.seatNumber} and sign it off`,
        seatId: r.seat.id,
        figure: r.board.live,
        unit: r.board.live === 1 ? "live conversation" : "live conversations",
        because:
          "Until it is signed off this seat may not put a date on hold, and the application refuses the status rather than warning about it.",
        to: "/coaching",
        toLabel: "The ramp, and why step five sits there",
      });
    }
  }

  for (const r of readings) {
    if (r.seat.state === "filled") continue;
    const untouched = r.board.inWindow - r.board.workedInWindow;
    if (untouched <= 0) continue;
    out.push({
      id: `window-${r.seat.id}`,
      kind: "window-shutting",
      verb: `Work seat ${r.seat.seatNumber}'s open windows yourself this week, or fill the seat`,
      seatId: r.seat.id,
      figure: untouched,
      unit:
        untouched === 1
          ? "organisation with a window open and no touch"
          : "organisations with a window open and no touch",
      because:
        r.board.lockedInWindow > 0
          ? "These windows are set by other organisations' calendars. Miss one and the occasion is next year rather than next month."
          : "A window open now and untouched is the cheapest work on the board and the first thing an empty seat loses.",
      to: "/",
      toLabel: "The desk, ranked",
    });
  }

  for (const r of readings) {
    for (const lane of r.unplannedLanes) {
      const meta = LANE_META[lane];
      out.push({
        id: `unplanned-${lane}`,
        kind: "lane-unplanned",
        verb: `Put a ${meta.doorNoun} route in the diary for ${meta.short.toLowerCase()}`,
        seatId: r.seat.id,
        figure: PROSPECTS.filter((p) => p.lane === lane).length,
        unit: "organisations in this lane, and not one hour planned into it",
        because: `Not one shift in the period names this lane, and the door here is the ${meta.doorNoun}. A lane with no hours in it is not a slow lane, it is a lane nobody has been sent to.`,
        to: "/field",
        toLabel: "Tabling and go-see runs",
      });
    }
  }

  const covering = readings.filter((r) => r.seat.state !== "filled");
  const carried = covering.reduce((n, r) => n + r.board.total, 0);
  const filled = readings.find((r) => r.seat.state === "filled");
  if (filled && carried > 0) {
    out.push({
      id: `covering-${filled.seat.id}`,
      kind: "covering",
      verb: `Decide what seat ${filled.seat.seatNumber} stops doing while it covers ${covering.length} open seats`,
      seatId: filled.seat.id,
      figure: carried,
      unit: "organisations belonging to a seat nobody sits in",
      because:
        "One person cannot work three seats and the honest response is to name what is not being worked rather than to plan as though it is.",
      to: "/lanes",
      toLabel: "The lanes, and what each one costs",
    });
  }

  return out;
}

// ---------------------------------------------------------------
// The whole screen, in one call
// ---------------------------------------------------------------

export interface FloorReading {
  asOf: string;
  nowMonth: number;
  seats: SeatReading[];
  team: TeamRow;
  actions: FloorAction[];
  /** Every ramp step, so a caller does not import two modules to draw one. */
  steps: RampStep[];
}

/**
 * The month the window arithmetic is scored against, taken from the
 * clock rather than from a module constant.
 *
 * `/coaching` takes the same month off the selected period's start date,
 * and on the default board day the two agree, because the board day sits
 * inside the period it belongs to. Reading it off the clock is what lets
 * the same code produce October's coverage when the clock is moved to
 * October, without a second definition of "now" anywhere.
 */
export function monthOf(asOf: string): number {
  return Number(asOf.slice(5, 7)) - 1;
}

export function floorReading(
  state: PipelineState,
  activity: ActivityLine[],
  asOf: string,
): FloorReading {
  const nowMonth = monthOf(asOf);
  const seats = SEATS.map((seat) => readSeat(seat, state, activity, asOf, nowMonth));
  return {
    asOf,
    nowMonth,
    seats,
    team: teamRow(seats, activity),
    actions: floorActions(seats),
    steps: RAMP_STEPS,
  };
}

/**
 * A sanity check the build enforces rather than a comment asking for
 * one: every lane belongs to exactly one seat.
 *
 * A lane assigned twice would double count the board, and a lane
 * assigned to nobody would silently vanish from a screen whose whole
 * argument is that nothing is silently unworked. This runs once at
 * module load and warns rather than throws, on the same principle as the
 * breadcrumb drift check: a mis-assigned lane is a defect worth
 * shouting about and not worth taking the application down over.
 */
const LANE_DRIFT: string[] = LANE_ORDER.flatMap((lane) => {
  const owners = SEATS.filter((s) => s.lanes.includes(lane));
  if (owners.length > 1) {
    return [`${lane} belongs to ${owners.length} seats and will be double counted`];
  }
  if (seatOwningLane(lane) === null) {
    return [`${lane} belongs to no seat and will be undercounted`];
  }
  return [];
});

if (LANE_DRIFT.length > 0) {
  console.warn(`The crew screen and the lanes disagree. ${LANE_DRIFT.join(". ")}.`);
}
