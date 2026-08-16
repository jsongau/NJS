import type { BookLine } from "@/domain/types";
import { venueDate } from "@/domain/requests";
import { CONVERSATIONS } from "@/data/conversations";
import { SEED_BOOK } from "@/data/book";
import type { PipelineState } from "@/state/PipelineProvider";
import type { SentMessage } from "@/state/OutboxProvider";
import {
  RECORD_AS_OF,
  prospectRecords,
  stalenessOf,
  type ProspectRecord,
} from "@/domain/selectors/record";
import { deskLines } from "@/domain/selectors/desk";

/**
 * THE DAY'S WORK, MEASURED IN THE THREE THINGS THIS DESK ACTUALLY
 * CONTROLS.
 *
 * WHY THIS FILE EXISTS. The owner asked for a reason to open the tool in
 * the morning. The obvious way to build that is a score, and a score is
 * the one thing this file refuses to produce. A currency with no unit
 * behind it counts sessions rather than work, and the moment a number
 * has no referent a person games it without meaning to: they add
 * prospects to inflate a board, they log notes nobody will read, they
 * mark a record closed because an open one costs them points. Every
 * figure below is a count of a thing that was really done to a real
 * organisation, in the unit the job is already thought about in.
 *
 * THREE RINGS, AND WHY THESE THREE. Touches made, replies handled, stale
 * cleared. Each one is entirely inside this desk's control on any given
 * morning, which is the whole test a daily target has to pass. A ring on
 * contracts signed would read zero on almost every day of a pre-opening
 * quarter and would be measuring a school district's budget cycle rather
 * than anything a person decided at nine o'clock. The ledger measures
 * results. These measure the work, and per the contract the two are
 * never added together.
 *
 * NOTHING HERE IS STORED. Every count is derived from the threads, the
 * status table and the outbox at the moment it is asked for. There is no
 * "touches today" counter anywhere in this codebase and there must never
 * be one, because a stored counter is a number with no owner responsible
 * for correcting it, and the first time it disagrees with the thread it
 * is describing, both stop being believable. The only things written to
 * storage are the two targets a person accepted or overrode and whether
 * the whole feature is switched off, all of which live in
 * `state/DailyProvider.tsx`.
 *
 * THE TARGETS ADAPT, BECAUSE A FIXED TARGET IS AN INSULT IN BOTH
 * DIRECTIONS. Eight touches is wrong on the week he is running a tabling
 * event and wrong on a quiet Tuesday. So the touch target is the mean of
 * his own recent working days, floored so a first run is not zero and
 * capped so one heavy Thursday cannot set a bar he will miss all of the
 * following week. The reply target is not an average at all: it is the
 * inbox, and an inbox of nothing is a ring that is already closed rather
 * than a ring at zero.
 */

// ---------------------------------------------------------------
// The clock
// ---------------------------------------------------------------

/**
 * The day the rings are read from.
 *
 * The same constant the record selector and the inbound queue read from,
 * deliberately, so a screenshot of the rings agrees with a screenshot of
 * the queue taken on a different afternoon.
 */
export const DAILY_AS_OF = RECORD_AS_OF;

const MS_PER_DAY = 86_400_000;

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** Day of the week for a venue-local calendar date, 0 for Sunday. */
export function weekdayOf(isoDate: string): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return 0;
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function weekdayName(isoDate: string): string {
  return WEEKDAY_NAMES[weekdayOf(isoDate)];
}

/**
 * Whether a day is one this desk is expected to be working.
 *
 * The territory is schools, employers and independents around Brea, and
 * none of them reads a cold email on a Sunday. A target that counted
 * Saturday would manufacture two failures a week out of nothing, which
 * is exactly the mechanic that teaches somebody to ignore the strip. So
 * weekends are excluded from the average, excluded from the week's
 * denominator and excluded from the streak. Work done on a Saturday
 * still counts on the day it was done; it simply never sets a bar.
 */
export function isWorkingDay(isoDate: string): boolean {
  const day = weekdayOf(isoDate);
  return day >= 1 && day <= 5;
}

/** The Monday on or before a calendar date. */
export function mondayOf(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const at = Date.UTC(y, m - 1, d);
  const back = (new Date(at).getUTCDay() + 6) % 7;
  return isoOf(at - back * MS_PER_DAY);
}

function isoOf(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function addDays(isoDate: string, n: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return isoOf(Date.UTC(y, m - 1, d) + n * MS_PER_DAY);
}

// ---------------------------------------------------------------
// The vocabulary
// ---------------------------------------------------------------

export type RingId = "touches" | "replies" | "stale";

/** Reading order. Outbound first, because that is what a morning is for. */
export const RING_ORDER: RingId[] = ["touches", "replies", "stale"];

export interface RingMeta {
  id: RingId;
  /** The word on the ring. One word, in the register of the job. */
  label: string;
  /** One unit, singular and plural, so a sentence can be built honestly. */
  unit: [string, string];
  /** Reinforcement only. Never the sole carrier of anything. */
  cssVar: string;
  /** What the ring counts, in one sentence. */
  what: string;
  /** The heading over the list a press reveals. */
  listHeading: string;
}

export const RING_META: Record<RingId, RingMeta> = {
  touches: {
    id: "touches",
    label: "Touches",
    unit: ["organisation contacted", "organisations contacted"],
    cssVar: "var(--lane-schools)",
    what: "Organisations this desk contacted today, in writing or at the door. Two emails to the same school is one organisation, because the organisation is the thing being worked.",
    listHeading: "Next by desk rank, and untouched today",
  },
  replies: {
    id: "replies",
    label: "Replies",
    unit: ["reply owed", "replies owed"],
    cssVar: "var(--info)",
    what: "Organisations that wrote and have had nothing back. The target is not an average; it is whatever is actually sitting there.",
    listHeading: "Wrote, and still waiting",
  },
  stale: {
    id: "stale",
    label: "Stale cleared",
    unit: ["record past its threshold", "records past their threshold"],
    cssVar: "var(--warn)",
    what: "Records that were past the decay threshold for their status this morning and have been worked since. Surfaced, never penalised.",
    listHeading: "Quiet longest, worst first",
  },
};

/**
 * The three states a ring can be in, as a glyph AND a word.
 *
 * The owner is colourblind, and a ring is the classic offender: the
 * whole convention encodes progress in a sweep and a hue, both of which
 * are exactly the two channels he cannot rely on. So every ring carries
 * its figures as text, its state as one of these three words, and its
 * arc is drawn as countable segments rather than as a smooth sweep. Put
 * the whole strip through a greyscale filter and nothing is lost.
 */
export type RingState = "empty" | "under-way" | "closed";

export const RING_STATE_META: Record<
  RingState,
  { glyph: string; label: string }
> = {
  empty: { glyph: "○", label: "Not started" },
  "under-way": { glyph: "◑", label: "Under way" },
  closed: { glyph: "●", label: "Closed" },
};

// ---------------------------------------------------------------
// How a target is arrived at
// ---------------------------------------------------------------

/**
 * WHERE A TARGET CAME FROM, WHICH IS SHOWN AND NOT HIDDEN.
 *
 * A number handed to somebody with no account of itself is a number they
 * are entitled to ignore. On a fresh install there is no trailing
 * average to compute one from, and the honest thing then is to say the
 * figure is a starting point rather than to dress a default up as
 * something earned.
 */
export type TargetSource =
  /** The mean of his own recent working days. */
  | "average"
  /** Not enough history yet, so a stated starting figure. */
  | "starting-figure"
  /** Whatever is actually in the inbox. Not an average at all. */
  | "inbox"
  /** He typed it. Nothing may override this except him. */
  | "chosen";

/**
 * THE TOUCH TARGET, AND EVERY CONSTANT IN IT.
 *
 * The window is ten working days, which is a fortnight of work: long
 * enough that one blank Monday does not move it, short enough that a
 * change in how he is working shows up inside a week. Apple recalculates
 * the Move goal weekly from actual behaviour for the same reason.
 *
 * The floor exists so the first run is not a target of zero, which is
 * both meaningless and instantly closed. The ceiling exists because the
 * bar is set from a heavy day as readily as from a normal one, and a
 * target nobody can hit twice is a target that gets switched off. Four
 * and twelve are this desk's own figures, not anybody's research.
 */
export const TOUCH_TARGET = {
  floor: 4,
  ceiling: 12,
  /** Used only until there are `minDays` working days to average. */
  start: 6,
  windowDays: 10,
  minDays: 3,
} as const;

/**
 * THE STALE TARGET IS A SHARE OF THE BACKLOG, NOT A FIXED THREE.
 *
 * A backlog of forty and a backlog of four are different mornings, and
 * one number cannot be right for both. One in eight, floored at two so
 * the ring is worth having and capped at five so a bad month does not
 * hand him an afternoon of nothing else, and never more than the backlog
 * itself. Nothing is ever subtracted for a record going stale: a
 * prospecting tool that penalises an honest backlog is a tool that
 * teaches its owner to delete records that are not moving, which
 * corrupts the only dataset he has.
 */
export const STALE_TARGET = {
  floor: 2,
  ceiling: 5,
  /** One in this many of the backlog. */
  share: 8,
} as const;

function clamp(n: number, low: number, high: number): number {
  return Math.max(low, Math.min(high, n));
}

// ---------------------------------------------------------------
// The touch history, indexed once
// ---------------------------------------------------------------

/**
 * Which organisations were contacted on which day, out of the threads.
 *
 * Built at module load rather than filtered per render: the strip asks
 * for a trailing average on every render of the page it sits on, and a
 * hundred and fifty-six messages walked ten times a second to answer a
 * question whose answer cannot change is work nobody asked for.
 *
 * A SET RATHER THAN A COUNT, because the unit is the ORGANISATION. Three
 * emails to one school in an afternoon is one organisation contacted,
 * and counting it as three would reward volume against a single address,
 * which is how a prospecting tool talks its owner into a spam complaint.
 */
const TOUCHED_BY_DAY: Map<string, Set<string>> = (() => {
  const out = new Map<string, Set<string>>();
  for (const m of CONVERSATIONS) {
    if (m.direction !== "outbound") continue;
    const day = venueDate(m.at);
    const set = out.get(day) ?? new Set<string>();
    set.add(m.prospectId);
    out.set(day, set);
  }
  return out;
})();

/** Organisations contacted on a given day, from the threads alone. */
export function touchesOn(day: string): string[] {
  return [...(TOUCHED_BY_DAY.get(day) ?? [])].sort();
}

/**
 * The working days before `day` that have any history at all, newest
 * first, capped at the window.
 *
 * Days with nothing recorded are skipped rather than counted as zero.
 * This board starts on 31 August 2026 and a reader opening it for the
 * first time has no history whatsoever; averaging in a run of empty days
 * before the work started would hand them a target of one.
 */
function trailingWorkedDays(day: string, windowDays: number): string[] {
  const out: string[] = [];
  for (let back = 1; back <= 90 && out.length < windowDays; back += 1) {
    const candidate = addDays(day, -back);
    if (!isWorkingDay(candidate)) continue;
    const touched = TOUCHED_BY_DAY.get(candidate);
    if (!touched || touched.size === 0) continue;
    out.push(candidate);
  }
  return out;
}

export interface TargetSuggestion {
  value: number;
  source: TargetSource;
  /** One sentence saying what the figure is made of. Always shown. */
  basis: string;
}

/**
 * The touch target for a day, suggested from his own recent behaviour.
 *
 * Exported so the component can offer the suggestion beside whatever he
 * has chosen, and so a test can check the arithmetic without rendering
 * anything.
 */
export function suggestTouchTarget(day: string = venueDate(DAILY_AS_OF)): TargetSuggestion {
  const days = trailingWorkedDays(day, TOUCH_TARGET.windowDays);
  if (days.length < TOUCH_TARGET.minDays) {
    return {
      value: TOUCH_TARGET.start,
      source: "starting-figure",
      basis:
        days.length === 0
          ? `A starting figure of ${TOUCH_TARGET.start}, not an average. There is no history to average yet.`
          : `A starting figure of ${TOUCH_TARGET.start}, not an average. ${days.length} working ${days.length === 1 ? "day" : "days"} of history is not enough to set a bar from.`,
    };
  }
  const total = days.reduce(
    (n, d) => n + (TOUCHED_BY_DAY.get(d)?.size ?? 0),
    0,
  );
  const mean = total / days.length;
  const value = clamp(Math.round(mean), TOUCH_TARGET.floor, TOUCH_TARGET.ceiling);
  const capped =
    value !== Math.round(mean)
      ? ` Held at the ${value === TOUCH_TARGET.floor ? "floor" : "ceiling"} of ${value}.`
      : "";
  return {
    value,
    source: "average",
    basis: `The mean of your last ${days.length} working days, which is ${mean.toFixed(1)} organisations a day.${capped}`,
  };
}

/** The stale target for a backlog of a given size. */
export function suggestStaleTarget(backlog: number): TargetSuggestion {
  if (backlog === 0) {
    return {
      value: 0,
      source: "inbox",
      basis: "Nothing was past its threshold this morning, so there is nothing to clear.",
    };
  }
  const share = Math.round(backlog / STALE_TARGET.share);
  const value = Math.min(
    backlog,
    clamp(share, STALE_TARGET.floor, STALE_TARGET.ceiling),
  );
  return {
    value,
    source: "average",
    basis: `One in ${STALE_TARGET.share} of the ${backlog} records that were past their threshold this morning, floored at ${STALE_TARGET.floor} and capped at ${STALE_TARGET.ceiling}.`,
  };
}

// ---------------------------------------------------------------
// What counts as today
// ---------------------------------------------------------------

/**
 * THE TWO CLOCKS, AND WHY BOTH OF THEM ARE TODAY.
 *
 * The board is frozen at 23 September 2026 so that every figure in a
 * screenshot survives the six months between it being written and a
 * hiring manager opening it. Work done in a session, though, is stamped
 * by the reader's own machine, because the send path calls the real
 * clock. Two honest dates, and both of them mean the same thing to a
 * person sitting in front of the tool: this happened today.
 *
 * So a stamp counts as today when it falls on the day being read, on the
 * reader's own day, or after the last day the seeded history covers,
 * that last case being work which can only have been done in a session
 * because nothing seeded is dated past it. The alternative, counting
 * only the board's day, would mean pressing Send moved nothing on the
 * strip, which would make the rings a decoration beside the work rather
 * than a reading of it.
 *
 * The third clause is anchored to the END OF THE HISTORY rather than to
 * the day being read, and the difference is not academic: anchored to
 * the day, asking these rings about a Monday three weeks ago would count
 * every touch made since as though it had happened that morning.
 */
const HISTORY_ENDS = venueDate(DAILY_AS_OF);

function todayTest(day: string, systemDay: string): (stamp: string) => boolean {
  return (stamp: string) => {
    const at = venueDate(stamp);
    return at === day || at === systemDay || at > HISTORY_ENDS;
  };
}

// ---------------------------------------------------------------
// The reading
// ---------------------------------------------------------------

export interface RingReading {
  id: RingId;
  label: string;
  /** Work done today, in whole units. Never a percentage. */
  done: number;
  /** What closing it takes today. Zero means there was nothing to do. */
  target: number;
  closed: boolean;
  state: RingState;
  /** Units still needed. Zero once closed. */
  remaining: number;
  source: TargetSource;
  /** Where the target came from, in one sentence. */
  basis: string;
  /**
   * The organisations that would close this ring, in the order they
   * should be worked, and exactly as many as it takes.
   *
   * This is the point of the whole mechanic. A ring that cannot be acted
   * on is a scoreboard beside the work; a ring that hands back the rows
   * that close it IS the work, and pressing it is a filter rather than a
   * flourish.
   */
  closers: ProspectRecord[];
  /** Everything the closers were drawn from, for an honest denominator. */
  poolCount: number;
  /** One line for the list, whether it is full or empty. */
  poolNote: string;
  /** What one unit of this ring is, said correctly for the number. */
  unit: string;
}

export interface WeekReading {
  /** The Monday this week commenced. */
  weekOf: string;
  /** Working days from Monday up to and including the day being read. */
  workingDaysSoFar: number;
  /** Organisations contacted this week, counted once each per day. */
  touches: number;
  /** The daily target multiplied by the working days so far. */
  target: number;
  /**
   * Completed weeks in a row before this one where the touch target was
   * met, with one working day forgiven automatically.
   */
  streak: number;
  /** The repair rule, stated rather than hidden. */
  note: string;
}

export interface DailyReading {
  /** The venue-local day these figures describe. */
  day: string;
  weekday: string;
  working: boolean;
  rings: RingReading[];
  byId: Record<RingId, RingReading>;
  allClosed: boolean;
  week: WeekReading;
  /** The suggestion for each adjustable target, whatever is in force. */
  suggested: Record<"touches" | "stale", TargetSuggestion>;
  /** True where nothing at all has been recorded against this board yet. */
  fresh: boolean;
}

/** The two targets a person is allowed to set. Null means take the suggestion. */
export interface DailyTargets {
  touches: number | null;
  stale: number | null;
  /** The Monday the choice was made in, so a new week can suggest again. */
  week: string | null;
}

export const NO_TARGETS: DailyTargets = { touches: null, stale: null, week: null };

export interface DailyOptions {
  pipeline: PipelineState;
  /** Everything sent, from the outbox. Session work lands on the rings. */
  outbox: SentMessage[];
  /** Defaults to the same instant the record selector reads from. */
  now?: string;
  /**
   * The reader's own clock. Injected so a test is deterministic and so
   * the two clocks above are visible at the call site rather than buried.
   */
  systemNow?: string;
  targets?: DailyTargets;
  book?: BookLine[];
}

/**
 * The day, in three figures and the rows behind each of them.
 *
 * One pass over the two hundred and eleven records, because the three
 * rings ask three questions of the same population and building the
 * records three times to answer them separately is how two counts on one
 * screen end up disagreeing.
 */
export function dailyReading({
  pipeline,
  outbox,
  now = DAILY_AS_OF,
  systemNow,
  targets = NO_TARGETS,
  book = SEED_BOOK,
}: DailyOptions): DailyReading {
  const day = venueDate(now);
  const systemDay = venueDate(
    systemNow ?? new Date().toISOString().slice(0, 10),
  );
  const isToday = todayTest(day, systemDay);

  const records = prospectRecords({ pipeline, book, now });
  const byId = new Map(records.map((r) => [r.prospect.id, r]));

  /* Everything this desk did today, from all three places it can be
     recorded: a message in a thread, a row in the outbox, a touch logged
     against the status table without a message behind it. A go-see is
     the third of those and it is the one most easily lost. */
  const touchedToday = new Set<string>(touchesOn(day));
  for (const m of outbox) if (isToday(m.sentAt)) touchedToday.add(m.prospectId);
  for (const s of pipeline.statuses) {
    if (s.lastTouchAt && isToday(s.lastTouchAt)) touchedToday.add(s.prospectId);
  }

  // ----- Touches -------------------------------------------------

  const touchSuggestion = suggestTouchTarget(day);
  const touchTarget =
    targets.touches !== null ? targets.touches : touchSuggestion.value;
  const touchesDone = touchedToday.size;
  const touchesShort = Math.max(0, touchTarget - touchesDone);

  /*
     The rows that would close the touch ring are the desk's own top
     ranked organisations that have not been contacted today, which means
     the ring hands back the same order the desk does rather than
     inventing a second opinion about who to write to. The lane filter
     and the search box are deliberately cleared first: the strip is a
     reading of the whole territory, and a ring that quietly described
     whatever was ticked in the rail four clicks ago would be the most
     dangerous kind of wrong.
  */
  const unfiltered: PipelineState = {
    ...pipeline,
    laneFilter: [],
    query: "",
    emailableOnly: false,
  };
  const nowMonth = Number(day.slice(5, 7)) - 1;
  const candidates = deskLines(unfiltered, { nowMonth })
    .filter((line) => {
      if (touchedToday.has(line.prospect.id)) return false;
      /* Signed and lost are not touch work. A booked event is worked
         backwards from its own date on the run sheet, and a loss is a
         diary entry rather than another email. */
      return line.status !== "booked" && line.status !== "lost";
    })
    .map((line) => byId.get(line.prospect.id))
    .filter((r): r is ProspectRecord => r !== undefined);

  // ----- Replies -------------------------------------------------

  /*
     The day's inbox is every organisation that wrote last and has had
     nothing back, which is the same test the record modal and the queue
     use, so the ring and the record can never disagree about whether
     somebody is owed an answer. An automatic absence reply is not
     somebody waiting, and the record selector already excludes it.
  */
  const owed = records.filter((r) => r.awaitingReply);
  const repliesTarget = owed.length;
  const handled = owed.filter((r) => touchedToday.has(r.prospect.id));
  const stillOwed = owed.filter((r) => !touchedToday.has(r.prospect.id));

  // ----- Stale cleared -------------------------------------------

  /*
     The backlog is measured AS IT STOOD THIS MORNING rather than as it
     stands now, and the difference is the whole ring. Measured now, a
     record cleared at half past nine would simply vanish from the count,
     the denominator would shrink by one, and the ring would sit at zero
     all day however much work went into it.
  */
  const morning = `${day}T00:00:00-07:00`;
  const staleThisMorning = records.filter(
    (r) => stalenessOf(r.status, r.lastActivityAt, morning).stale,
  );
  const staleSuggestion = suggestStaleTarget(staleThisMorning.length);
  const staleTarget =
    targets.stale !== null
      ? Math.min(targets.stale, Math.max(staleThisMorning.length, 0))
      : staleSuggestion.value;
  const cleared = staleThisMorning.filter((r) => touchedToday.has(r.prospect.id));
  const uncleared = [...staleThisMorning]
    .filter((r) => !touchedToday.has(r.prospect.id))
    .sort((a, b) => {
      const gap = b.staleness.overdueBy - a.staleness.overdueBy;
      return gap !== 0 ? gap : a.prospect.name.localeCompare(b.prospect.name);
    });

  // ----- The three readings --------------------------------------

  const rings: RingReading[] = [
    reading({
      id: "touches",
      done: touchesDone,
      target: touchTarget,
      source: targets.touches !== null ? "chosen" : touchSuggestion.source,
      basis:
        targets.touches !== null
          ? `Your own figure. The suggestion for this week is ${touchSuggestion.value}.`
          : touchSuggestion.basis,
      closers: candidates.slice(0, touchesShort),
      poolCount: candidates.length,
      poolNote:
        candidates.length === 0
          ? "Every organisation on the board has been contacted today."
          : `${candidates.length} organisations on the board are untouched today. These are the ${Math.min(touchesShort, candidates.length)} the desk ranks highest.`,
    }),
    reading({
      id: "replies",
      done: handled.length,
      target: repliesTarget,
      source: "inbox",
      basis:
        repliesTarget === 0
          ? "Nobody is waiting on an answer, so this one is closed rather than empty."
          : `Everyone who wrote and has had nothing back. It is the inbox rather than an average, and a quiet inbox closes this ring instead of failing it.`,
      closers: stillOwed,
      poolCount: owed.length,
      poolNote:
        owed.length === 0
          ? "Nothing arrived that has not been answered."
          : `${owed.length} organisations wrote last. An unanswered inbound outranks every piece of outbound work on the board.`,
    }),
    reading({
      id: "stale",
      done: cleared.length,
      target: staleTarget,
      source: targets.stale !== null ? "chosen" : staleSuggestion.source,
      basis:
        targets.stale !== null
          ? `Your own figure. The suggestion for this backlog is ${staleSuggestion.value}.`
          : staleSuggestion.basis,
      closers: uncleared.slice(0, Math.max(0, staleTarget - cleared.length)),
      poolCount: staleThisMorning.length,
      poolNote:
        staleThisMorning.length === 0
          ? "Nothing was past its threshold this morning."
          : `${staleThisMorning.length} records were past the threshold for their status this morning. Worst first, and nothing is ever deducted for one sitting there.`,
    }),
  ];

  const map = Object.fromEntries(rings.map((r) => [r.id, r])) as Record<
    RingId,
    RingReading
  >;

  return {
    day,
    weekday: weekdayName(day),
    working: isWorkingDay(day),
    rings,
    byId: map,
    allClosed: rings.every((r) => r.closed),
    week: weekReading(day, touchTarget, touchesDone),
    suggested: { touches: touchSuggestion, stale: staleSuggestion },
    fresh: touchSuggestion.source === "starting-figure",
  };
}

function reading(input: {
  id: RingId;
  done: number;
  target: number;
  source: TargetSource;
  basis: string;
  closers: ProspectRecord[];
  poolCount: number;
  poolNote: string;
}): RingReading {
  const meta = RING_META[input.id];
  const closed = input.done >= input.target;
  const remaining = Math.max(0, input.target - input.done);
  return {
    id: input.id,
    label: meta.label,
    done: input.done,
    target: input.target,
    closed,
    state: closed ? "closed" : input.done === 0 ? "empty" : "under-way",
    remaining,
    source: input.source,
    basis: input.basis,
    closers: closed ? [] : input.closers,
    poolCount: input.poolCount,
    poolNote: input.poolNote,
    unit: input.target === 1 ? meta.unit[0] : meta.unit[1],
  };
}

// ---------------------------------------------------------------
// The week
// ---------------------------------------------------------------

/**
 * THE WEEK, AND THE ONE PLACE A STREAK IS ALLOWED TO APPEAR.
 *
 * A streak of days is a hostage situation: it converts a working tool
 * into something a person protects rather than uses, and the day it
 * breaks is very often the last day they open it. A streak of WEEKS with
 * a day forgiven inside each one is the mercy version. It cannot be
 * broken by a dentist's appointment, it cannot be broken by a Saturday,
 * and it is a small secondary figure under three rings rather than the
 * headline over them.
 *
 * It counts touches only, and that is deliberate rather than lazy: it is
 * the one ring with a full history behind it, and a streak assembled out
 * of figures that only exist for the current session would be a number
 * nobody could check.
 */
export function weekReading(
  day: string,
  dailyTarget: number,
  /**
   * Today's own figure, which the history cannot know.
   *
   * Passed in rather than read from `TOUCHED_BY_DAY`, because the day's
   * count includes work done in this session and the week is the sum of
   * its days. A week total that disagreed with the ring above it by the
   * exact number of messages somebody had just sent would be the first
   * thing a reader noticed and the last figure on the strip they
   * believed.
   */
  touchesToday: number,
): WeekReading {
  const weekOf = mondayOf(day);

  let workingDaysSoFar = 0;
  let touches = 0;
  for (let i = 0; i < 7; i += 1) {
    const d = addDays(weekOf, i);
    if (d > day) break;
    touches += d === day ? touchesToday : (TOUCHED_BY_DAY.get(d)?.size ?? 0);
    if (isWorkingDay(d)) workingDaysSoFar += 1;
  }

  let streak = 0;
  for (let back = 1; back <= 52; back += 1) {
    const monday = addDays(weekOf, -7 * back);
    /* A week with no history at all is the start of the record rather
       than a failure, so the walk stops instead of counting a miss. */
    const days = [0, 1, 2, 3, 4].map((i) => addDays(monday, i));
    const worked = days.filter((d) => (TOUCHED_BY_DAY.get(d)?.size ?? 0) > 0);
    if (worked.length === 0) break;
    const met = days.filter(
      (d) => (TOUCHED_BY_DAY.get(d)?.size ?? 0) >= dailyTarget,
    ).length;
    /* Five working days, one forgiven automatically. Chou's mercy
       infrastructure, applied to a week rather than sold as a token. */
    if (met < 4) break;
    streak += 1;
  }

  return {
    weekOf,
    workingDaysSoFar,
    touches,
    target: dailyTarget * workingDaysSoFar,
    streak,
    note: "A week counts when the touch target was met on four of its five working days. One day a week is forgiven automatically.",
  };
}
