import type { Lane, PitchStatus } from "@/domain/types";
import type { StatusToken } from "@/domain/vocabulary";

/**
 * A REP WITH NO NAME IS A SEAT.
 *
 * ── WHY THERE IS NO PERSON IN HERE ────────────────────────────────
 * This application has never invented a human being. Every buyer is a
 * published job title, every counterparty in a thread is a role on a
 * reserved address, and every rival is an organisation rather than a
 * named operator. A team screen is the one place where the temptation to
 * invent three people is almost irresistible, because three names with
 * three photographs would look like a product and would cost nothing to
 * type.
 *
 * It would also be the only fact on the site a reader cannot check, and
 * it would be sitting on the screen that argues the desk is run
 * honestly. So a seat holder is a SEAT: an id, a published job title, an
 * ordinal, filled or open, a start date, the lanes it carries, and the
 * ramp steps somebody has signed off. Everything else about a seat is
 * DERIVED, which is the rule the rest of the codebase already follows:
 * the slice of the board comes from the lanes, the coverage comes from
 * `PROSPECTS` and the touch table, the hours come from the activity
 * ledger. Nothing about a person is stored, because nothing about a
 * person is known.
 *
 * ── TWO OF THE THREE SEATS ARE OPEN, AND THAT IS THE ANSWER ───────
 * The division is hiring. Champions Group Holdings has one Marketing
 * Manager posting and one Digital Marketing Specialist posting open in
 * Brea, and there is no marketing team behind them that anybody
 * publishes. A screen showing three staffed desks would be a mock-up. A
 * screen showing which seats are empty, what each empty seat was going
 * to carry, and what is not being worked while it stays empty is the job
 * the posting describes: partner with the operators, own the assigned
 * brand, and drive incremental phone calls and web leads. That work
 * starts before anybody else is hired.
 *
 * ── TITLES COME FROM PUBLISHED LISTINGS, LIKE EVERY OTHER TITLE ───
 * `Prospect.decisionMakerTitle` carries only titles found on published
 * staff directories. A seat carries only titles found on the Champions
 * Group Holdings Greenhouse board, with the source on the row.
 * "Marketing Manager" and "Digital Marketing Specialist" are both posted
 * for Brea today. Two seats share the second title, which is exactly why
 * a seat has an ordinal: two identical titles have to be distinguishable
 * without anybody being given a name.
 */

// ---------------------------------------------------------------
// Ids
// ---------------------------------------------------------------

/**
 * A union rather than a string, so a `Record<SeatId, T>` cannot be
 * partially filled and a fourth seat breaks the build everywhere
 * something has an opinion about seats. Same argument as `Lane`.
 */
export type SeatId = "seat-1" | "seat-2" | "seat-3";

/**
 * Filled or open, and nothing else is stored.
 *
 * "Ramping" is deliberately not a third value. Whether a seat is ramping
 * is a fact about the clock and the signoff ledger, not a flag somebody
 * has to remember to change, and a stored flag that disagrees with the
 * dates is worse than no flag at all. See `rampStateOf`.
 */
export type SeatState = "filled" | "open";

export const SEAT_STATE_META: Record<SeatState, StatusToken> = {
  filled: {
    glyph: "●",
    label: "Filled",
    cssVar: "var(--ok)",
    note: "Somebody sits here. The seat has a start date, a ramp with dates on it, and work in the ledgers against it.",
  },
  open: {
    glyph: "○",
    label: "Open",
    cssVar: "var(--neutral)",
    note: "Nobody sits here. The lanes are assigned, the ramp is written, and none of the work is being done by the person it was written for.",
  },
};

// ---------------------------------------------------------------
// The ramp, as ids and dates
// ---------------------------------------------------------------

/**
 * THE SEVEN STEPS ARE ARGUED ON /coaching AND THEY ARE NOT REPEATED
 * HERE.
 *
 * That page owns the order, the reason each step sits where it does and
 * the prose. This file owns the three things that page has no way to
 * carry: an id, a clock, and a signature. A ramp with no clock is a
 * curriculum, and a gate stated in prose and enforced nowhere is a
 * paragraph.
 *
 * The titles below are the short forms a manager would say out loud,
 * the same relationship `PITCH_STATUS_SHORT` has to `PITCH_STATUS`,
 * rather than truncations of the headings on /coaching.
 */
export type RampStepId =
  | "price-line"
  | "two-ledgers"
  | "buyer-class"
  | "eight-doors"
  | "lane-arithmetic"
  | "objections"
  | "go-see";

export interface RampStep {
  id: RampStepId;
  /** Its number on /coaching. The order is the argument over there. */
  n: number;
  title: string;
  /** When in the ramp it lands, in the ramp's own words. */
  when: string;
  /**
   * The status this step gates, where it gates one.
   *
   * Exactly one step does. Step five is the lane arithmetic, and
   * /coaching already states the gate in its own `when` field: "before
   * anybody is allowed to hold a date". A held date that cannot
   * physically be delivered becomes a refund and an apology from a
   * general manager, which is the one mistake on that list that costs a
   * customer rather than a call.
   */
  gates?: PitchStatus;
}

export const RAMP_STEPS: RampStep[] = [
  {
    id: "price-line",
    n: 1,
    title: "The line through the price list",
    when: "Day one, before a single offer is opened",
  },
  {
    id: "two-ledgers",
    n: 2,
    title: "The two ledgers",
    when: "Day one, in the same sitting",
  },
  {
    id: "buyer-class",
    n: 3,
    title: "Which kind of buyer is on the other end",
    when: "Week one, before the first outbound call",
  },
  {
    id: "eight-doors",
    n: 4,
    title: "The doors, and what each door is called",
    when: "Week one",
  },
  {
    id: "lane-arithmetic",
    n: 5,
    title: "The arithmetic that limits every promise",
    when: "Week one, and before anybody may hold a date",
    gates: "soft-hold",
  },
  {
    id: "objections",
    n: 6,
    title: "The objections, all of them, in advance",
    when: "Week two, before the first difficult conversation",
  },
  {
    id: "go-see",
    n: 7,
    title: "The go-see",
    when: "Week two, and last on purpose",
  },
];

export const RAMP_STEP_BY_ID: Record<RampStepId, RampStep> = Object.fromEntries(
  RAMP_STEPS.map((s) => [s.id, s]),
) as Record<RampStepId, RampStep>;

/** The one step that holds a permission. Read, never typed twice. */
export const HOLD_GATE_STEP: RampStep =
  RAMP_STEPS.find((s) => s.gates === "soft-hold") ?? RAMP_STEPS[4];

/**
 * Ten working days, because /coaching's ramp is two weeks.
 *
 * It is a COMPETENCE ramp for a territory of 329 organisations and 18
 * published offers, not the ninety day productivity ramp the onboarding
 * literature describes. The two are different objects and a person
 * signed off as competent on day ten is not expected to be productive on
 * day ten.
 */
export const RAMP_WORKING_DAYS = 10;

// ---------------------------------------------------------------
// The seat
// ---------------------------------------------------------------

export interface RampSignoff {
  stepId: RampStepId;
  /** The day it was signed off, ISO. A signoff with no date is a claim. */
  on: string;
  /** Who signed it. A role, never a person, as everywhere else. */
  byRole: string;
}

export interface Seat {
  id: SeatId;
  /** An ordinal, so two identical titles are distinguishable. */
  seatNumber: number;
  /** Published on the brand's own careers listing. Nothing else. */
  title: string;
  titleSource: string;
  state: SeatState;
  /** Null while the seat is open. This is what drives the ramp clock. */
  startedOn: string | null;
  /**
   * Territory by service line, not by geography.
   *
   * The brand publishes one phone number across Brea, Colton and
   * Murrieta and one offer page for all four counties, so splitting the
   * desk by postcode would hand two seats the same published line and
   * two halves of the same conversation. The whole model is service
   * lines: a line decides the motion, the door, the buyer class and the
   * month, so a line is the only unit of territory that carries a way of
   * working with it.
   */
  lanes: Lane[];
  /** Why these lanes are one seat's work rather than an arbitrary third. */
  lanesBecause: string;
  rampSignoffs: RampSignoff[];
  /** What this seat is for, in one line a general manager would accept. */
  brief: string;
}

// ---------------------------------------------------------------
// Predicates over a seat
// ---------------------------------------------------------------

/**
 * Was this step signed off, and had it been by `asOf`?
 *
 * The clock is optional and that is deliberate rather than lazy. A page
 * reading the scenario clock asks the dated question: on 19 August, a
 * signoff dated 20 August had not happened. The pipeline reducer has no
 * clock and does not need one, because by the time somebody presses a
 * control the signoff either exists or it does not. One predicate, two
 * honest questions, no second copy of the rule.
 */
export function signedOffOn(
  seat: Seat,
  stepId: RampStepId,
  asOf?: string,
): RampSignoff | null {
  const row = seat.rampSignoffs.find((s) => s.stepId === stepId);
  if (!row) return null;
  if (asOf && row.on > asOf) return null;
  return row;
}

/** Steps with a signoff against them, in ramp order. */
export function signedSteps(seat: Seat, asOf?: string): RampStep[] {
  return RAMP_STEPS.filter((step) => signedOffOn(seat, step.id, asOf) !== null);
}

/** Steps still outstanding, in ramp order. The set that can empty. */
export function outstandingSteps(seat: Seat, asOf?: string): RampStep[] {
  return RAMP_STEPS.filter((step) => signedOffOn(seat, step.id, asOf) === null);
}

/**
 * THE ONE PERMISSION IN THIS APPLICATION, AND IT IS ENFORCED.
 *
 * A seat may put a date on hold when somebody is sitting in it and step
 * five has been signed off. Nothing else grants it, and it is checked in
 * `PipelineProvider` where the status table is written rather than on
 * the control that offers it, because a rule enforced at the one place
 * state changes holds and a rule enforced on three buttons does not.
 *
 * This is the difference between a manager who wrote a training page and
 * a manager who wired it into the tool.
 */
export function mayHoldADate(seat: Seat | null, asOf?: string): boolean {
  if (!seat) return false;
  if (seat.state !== "filled") return false;
  return signedOffOn(seat, HOLD_GATE_STEP.id, asOf) !== null;
}

/** Why the permission is withheld, in one line, or null when it is not. */
export function holdWithheldBecause(seat: Seat | null, asOf?: string): string | null {
  if (!seat) return "No seat carries this lane, so nobody may hold a date in it.";
  if (seat.state !== "filled") {
    return `Seat ${seat.seatNumber} is open. A date held by nobody is a date nobody delivers.`;
  }
  if (signedOffOn(seat, HOLD_GATE_STEP.id, asOf) === null) {
    return `Step ${HOLD_GATE_STEP.n} is not signed off, so this seat may not hold a date.`;
  }
  return null;
}

// ---------------------------------------------------------------
// The ramp against a clock
// ---------------------------------------------------------------

export type RampState =
  /** Nobody has started, so the ramp is a plan rather than a state. */
  | "not-started"
  /** Started, steps outstanding. */
  | "under-way"
  /** Every step signed off. A real closure, and the only one on this screen. */
  | "closed";

export const RAMP_STATE_META: Record<RampState, StatusToken> = {
  "not-started": {
    glyph: "○",
    label: "Not started",
    cssVar: "var(--neutral)",
    note: "The ramp is written and dated from a first day nobody has been given yet.",
  },
  "under-way": {
    glyph: "◑",
    label: "Under way",
    cssVar: "var(--info)",
    note: "Started, and steps are outstanding. Anything a step gates is withheld until it is signed off.",
  },
  closed: {
    glyph: "●",
    label: "Closed",
    cssVar: "var(--ok)",
    note: "Every step signed off, each with a date and a role against it.",
  },
};

export function rampStateOf(seat: Seat, asOf: string): RampState {
  if (seat.state !== "filled" || !seat.startedOn) return "not-started";
  /* A clock set before the start date reads "not started" rather than
     "under way with seven steps outstanding". The second is arithmetically
     true and describes a person who has not turned up yet. */
  if (asOf < seat.startedOn) return "not-started";
  return outstandingSteps(seat, asOf).length === 0 ? "closed" : "under-way";
}

/*
  THE RAMP DAY IS COUNTED IN `selectors/seats.ts` AND NOT HERE, ON
  PURPOSE.

  It needs `isWorkingDay`, which lives in `selectors/daily.ts`, which
  reaches the pipeline through the desk. This file is imported by the
  pipeline reducer so it can enforce the one permission below, so it is
  kept free of every runtime import: a module cycle through a reducer is
  the kind of defect that shows up as one undefined constant on one
  route, months later.
*/
