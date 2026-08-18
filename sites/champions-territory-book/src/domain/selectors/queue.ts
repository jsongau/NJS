import type { Lane } from "@/domain/types";
import type {
  DerivedTask,
  GroupRequest,
  PlanInterest,
  QualifyingField,
  RequestChannel,
  RequestStatus,
  TaskKind,
  TaskReason,
} from "@/domain/requests";
import {
  REQUEST_CHANNEL_META,
  REQUEST_CHANNEL_ORDER,
  REQUEST_STATUS_META,
  REQUEST_STATUS_ORDER,
  RESPONSE_COMMITMENT,
  QUALIFYING_FIELD_LABEL,
  QUALIFYING_FIELD_ORDER,
  isQualified,
  missingQualifiers,
  responseDueFrom,
  unaskedQualifiers,
  venueDate,
  workingHoursBetween,
} from "@/domain/requests";
import { LANE_META, LANE_ORDER, crewSlotsForDoors } from "@/domain/lanes";
import { PROSPECT_BY_ID } from "@/data/prospects";
import { STANDARD_TERMS } from "@/data/packages";
import { furthestStatus, type PipelineState } from "@/state/PipelineProvider";
import type { BookState } from "@/state/BookProvider";

/**
 * THE QUEUE. What the inbound half of the job is actually asking for
 * right now, and why that one first.
 *
 * This file is the counterpart to selectors/desk.ts and it is
 * deliberately built the same way. The desk decides who to go and find;
 * this decides who has already found you and is waiting. Both of them
 * rank, both of them show their working, and neither stores a single
 * number.
 *
 * WHAT IS BEING RANKED IS PAID-FOR DEMAND. Almost every row on this
 * queue cost money to arrive: a Local Services Ad lead and a
 * marketplace lead are billed the moment they land, whether or not
 * anybody answers. That is why a slow row here is more expensive than a
 * slow row on the outbound desk, and why the ranking below puts an
 * unanswered lead above everything else without apology.
 *
 * THE ONE RULE THAT MAKES THE ARITHMETIC HOLD: one lead produces at
 * most one task. Not one per missing field, not one per stage, not one
 * per offer. A lead that generated three tasks would be counted
 * three times in every bucket, and the first thing anybody does with a
 * queue is add up the buckets and check the total. So the derivation
 * asks a single question of each request, in a fixed order, and returns
 * the first answer it finds. The buckets then partition that list, which
 * means the counts sum to the total by construction rather than by
 * anybody remembering to keep them in step.
 *
 * THERE IS A FOURTH BUCKET AND IT IS THERE ON PURPOSE. The three buckets
 * worth looking at are past the commitment, due today and due this week.
 * A fourth, "later", holds everything the first three do not, and it
 * exists because a bucket set that does not account for every task is
 * exactly how work goes missing: the total says twenty two, the three
 * buckets say nineteen, and nobody notices which three fell off. Every
 * task lands in precisely one of four, and the four add up.
 *
 * EVERY EMPTY CASE RETURNS A SENTENCE. A zero is ambiguous. An empty
 * overdue bucket could mean the desk is on top of its queue or it could
 * mean nothing has arrived, and those are opposite readings of the same
 * digit. So each bucket carries a headline written for both the full and
 * the empty case, and the callers render the sentence rather than the
 * number alone.
 */

// ---------------------------------------------------------------
// The follow-up clocks
// ---------------------------------------------------------------

/**
 * How long a request is allowed to sit in each state before it becomes
 * work again.
 *
 * The response commitment in domain/requests.ts governs the first reply
 * and it is four working hours. These govern everything after it, they
 * are counted in plain days, and they are ALL ILLUSTRATIVE. No Champions
 * brand publishes a service level of any kind, so nothing here is a
 * claim about how any of them operates. They are this console's own
 * intervals.
 *
 * WEEKENDS ARE NOT SKIPPED, here or in the response clock. A trade whose
 * worst hours are a hot Saturday and a burst pipe on a Sunday does not
 * get to treat the weekend as time the phone is not answered, and a
 * queue that quietly paused on Saturday would flatter the desk by
 * exactly the two days a household most wants an answer.
 *
 * The held interval is the longest and the most consequential. An
 * install date held against no deposit is a date no other household can
 * be given, so five days is not politeness towards the person holding
 * it; it is the point at which the cost of the hold starts falling on
 * the next caller.
 */
export const FOLLOW_UP_DAYS: Record<RequestStatus, number | null> = {
  new: null,
  acknowledged: 1,
  qualifying: 2,
  quoted: 3,
  held: 5,
  won: 1,
  lost: null,
  "gone-quiet": 5,
  lapsed: null,
};

const MS_PER_DAY = 86_400_000;

function addDays(iso: string, days: number): string {
  const at = Date.parse(iso) + days * MS_PER_DAY;
  const d = new Date(at);
  const pad = (n: number) => String(n).padStart(2, "0");
  /* Formatted back in the same offset the input carried, so a due date
     derived from a seeded timestamp reads in the same clock the seed was
     written in. */
  const offsetMatch = iso.match(/([+-]\d{2}):(\d{2})$/);
  const offsetHours = offsetMatch ? Number(offsetMatch[1]) : 0;
  const shifted = new Date(d.getTime() + offsetHours * 3_600_000);
  const sign = offsetHours <= 0 ? "-" : "+";
  const abs = Math.abs(offsetHours);
  return (
    `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}` +
    `T${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}:00${sign}${pad(abs)}:00`
  );
}

// ---------------------------------------------------------------
// One request, at most one task
// ---------------------------------------------------------------

function organisationLabel(r: GroupRequest | PlanInterest): string {
  if (r.prospectId) {
    return PROSPECT_BY_ID[r.prospectId]?.name ?? r.prospectId;
  }
  return r.organisationName ?? "Organisation not recorded";
}

/**
 * Does the book already know about this win?
 *
 * The two ledgers in this console are separate on purpose, and the price
 * of that separation is that they can disagree. A lead marked won with
 * no line in the book is either a job nobody wrote down or a status
 * somebody clicked too early, and both are worth a task. This is the one
 * place the inbound queue reaches into the money.
 */
function hasBookLine(book: BookState, prospectId: string | null): boolean {
  if (!prospectId) return false;
  return book.book.some((l) => l.prospectId === prospectId);
}

interface TaskShape {
  kind: TaskKind;
  dueAt: string;
  because: string;
  action: string;
}

/**
 * An agreed callback date pushes a follow-up out and never pulls it in.
 *
 * The asymmetry is the whole rule. A facilities lead who said their
 * procurement runs three to four weeks has told the desk when to come
 * back, and chasing them on day five anyway trains the user to ignore
 * the queue. Allowing the agreed date to pull a follow-up EARLIER would let a
 * casual "call me Thursday" quietly override the interval the desk set
 * itself, so it cannot.
 */
function applyAgreedDate(r: GroupRequest, shape: TaskShape): TaskShape {
  if (!r.agreedNextStepAt) return shape;
  if (Date.parse(r.agreedNextStepAt) <= Date.parse(shape.dueAt)) return shape;
  return {
    ...shape,
    dueAt: r.agreedNextStepAt,
    because: `${shape.because} They asked to be contacted again on ${venueDate(r.agreedNextStepAt)}, which is later than this desk's own interval, so their date stands.`,
  };
}

function shapeFor(r: GroupRequest, book: BookState, now: string): TaskShape | null {
  const missing = missingQualifiers(r);
  const missingLabels = missing.map((f) => QUALIFYING_FIELD_LABEL[f].toLowerCase());
  const unasked = unaskedQualifiers(r);
  const channel = REQUEST_CHANNEL_META[r.channel];
  const last = r.lastContactAt ?? r.firstRespondedAt ?? r.receivedAt;

  switch (r.status) {
    case "new": {
      const overdue = Date.parse(r.responseDueAt) <= Date.parse(now);
      return {
        kind: overdue ? "answer-overdue" : "answer",
        dueAt: r.responseDueAt,
        because: overdue
          ? `Arrived through the ${channel.short.toLowerCase()} and the four working hour commitment has already passed with nobody having replied.`
          : `Arrived through the ${channel.short.toLowerCase()} and nobody has replied yet.`,
        action:
          missing.length > 0
            ? `Reply, and ask for the ${missingLabels.join(", the ")} in the same message.`
            : "Reply. Everything an estimate needs is already on the record.",
      };
    }

    case "acknowledged":
    case "qualifying": {
      const due = addDays(last, FOLLOW_UP_DAYS[r.status] ?? 2);
      if (missing.length > 0) {
        return {
          kind: "recover-qualifiers",
          dueAt: due,
          because:
            unasked.length > 0
              ? `Still without the ${missingLabels.join(", the ")}, and ${unasked.length} of those the ${channel.label.toLowerCase()} never asked for.`
              : `Still without the ${missingLabels.join(", the ")}, which the route did ask for.`,
          action: `Call and get the ${missingLabels.join(", the ")}. Nothing can be priced or dispatched until all three exist.`,
        };
      }
      return {
        kind: "send-quote",
        dueAt: due,
        because:
          "Answered, qualified, and nothing priced has gone out. This is the state where a paid-for lead is most easily left to cool.",
        action: `Send the estimate and name a date. ${r.headcount ? `${r.headcount} units is ${crewSlotsForDoors(r.headcount)} crew days at the console's own planning rate.` : ""}`.trim(),
      };
    }

    case "quoted":
      return {
        kind: "chase-quote",
        dueAt: addDays(last, FOLLOW_UP_DAYS.quoted ?? 3),
        because: `An estimate has been with them since ${venueDate(last)} and nothing has come back.`,
        action:
          "Chase it once, by phone rather than by email. A second copy of the same estimate is not a follow up.",
      };

    case "held":
      return {
        kind: "convert-hold",
        dueAt: addDays(last, FOLLOW_UP_DAYS.held ?? 5),
        because: r.desiredDate
          ? `${venueDate(r.desiredDate)} is held against no deposit, so it is an install date no other household can be given.`
          : "An install date is held against no deposit and it cannot sit there indefinitely.",
        action: `Convert it or release it. The standard terms on this console are a ${STANDARD_TERMS.depositPercent}% deposit and ${STANDARD_TERMS.bookingNoticeDays} days minimum notice, so a hold that is not converted is a crew day lost to everybody.`,
      };

    case "gone-quiet":
      return {
        kind: "revive-quiet",
        dueAt: addDays(last, FOLLOW_UP_DAYS["gone-quiet"] ?? 5),
        because: `Answered on ${venueDate(r.firstRespondedAt ?? r.receivedAt)} and silent since ${venueDate(last)}.`,
        action:
          "One more attempt, on a different channel from the last one. If that draws nothing, diary their buying window and stop.",
      };

    case "won": {
      if (hasBookLine(book, r.prospectId)) return null;
      return {
        kind: "reconcile-book",
        dueAt: addDays(r.closedAt ?? last, FOLLOW_UP_DAYS.won ?? 1),
        because:
          "Marked won and there is no matching line in the book, so the queue and the revenue ledger disagree about whether this job was sold.",
        action:
          "Write the line into the book, or move the request back. A win that exists on only one of the two ledgers is not a win anybody can report.",
      };
    }

    case "lost":
      return null;

    case "lapsed":
      return {
        kind: "record-lapse",
        dueAt: r.responseDueAt,
        because: `Arrived on ${venueDate(r.receivedAt)}, was never answered, and has gone cold without anybody saying no. The lead was paid for on the day it landed.`,
        action:
          "Nothing to sell. Write down which route it came through and how long it sat, because this is the only failure on the board that belongs entirely to the brand.",
      };

    default:
      return null;
  }
}

// ---------------------------------------------------------------
// The ranking, and its reasons
// ---------------------------------------------------------------

/**
 * Base weight by kind.
 *
 * AN UNANSWERED LEAD OUTRANKS EVERYTHING, and past the commitment it
 * outranks everything by a distance. That is the one opinion in this
 * file worth arguing about, so here is the argument: every other task on
 * this board involves somebody who already knows the brand is paying
 * attention. An unanswered lead involves somebody who does not, it was
 * billed for on arrival, and in most cases the same lead is sitting in
 * two rivals' inboxes at the same moment. The cost of being wrong about
 * it is not a slower deal. It is a job that goes to whoever rang back
 * first, and an invoice that arrives either way.
 *
 * A LAPSED LEAD RANKS LOW, and that is not indifference. There is
 * nothing left to sell on a lapsed row; there is only something to
 * learn, and learning it can wait until this morning's live work is
 * done. It stays on the board because deleting it would be the brand
 * marking its own homework.
 */
const KIND_WEIGHT: Record<TaskKind, number> = {
  "answer-overdue": 100,
  answer: 70,
  "reconcile-book": 60,
  "convert-hold": 55,
  "chase-quote": 50,
  "send-quote": 45,
  "recover-qualifiers": 40,
  "answer-plan-interest": 30,
  "revive-quiet": 20,
  "record-lapse": 12,
};

function reasonsFor(
  r: GroupRequest,
  shape: TaskShape,
  hoursLate: number | null,
  pipeline: PipelineState,
): TaskReason[] {
  const out: TaskReason[] = [];

  out.push({
    label: "What kind of work this is",
    points: KIND_WEIGHT[shape.kind],
    why:
      shape.kind === "answer-overdue"
        ? "A lead nobody has answered past the commitment. It was paid for on arrival. Nothing on this board outranks it."
        : shape.kind === "answer"
          ? "A lead nobody has answered yet, still inside the commitment."
          : shape.kind === "record-lapse"
            ? "Nothing left to sell here. Ranked low on purpose, and kept on the board on purpose."
            : REQUEST_STATUS_META[r.status].note,
  });

  if (hoursLate !== null && hoursLate > 0) {
    const points = Math.min(30, Math.round(hoursLate));
    out.push({
      label: "Time past due",
      points,
      why: `${hoursLate} working hours past its due moment. Capped at 30 points, because a row three weeks late should not outrank every live conversation on the board forever.`,
    });
  }

  const locked = LANE_META[r.lane].occasionClass === "calendar-locked";
  out.push({
    label: locked ? "Calendar-locked" : "Discretionary",
    points: locked ? 12 : 4,
    why: locked
      ? "The failure happens whether or not anybody replies, so a slow answer loses the job rather than delaying it."
      : "Somebody still has to decide the work is worth doing at all, so this conversation has more give in it.",
  });

  if (r.headcount !== null) {
    const points = Math.min(15, Math.round(r.headcount / 20));
    out.push({
      label: "Size, as they stated it",
      points,
      why: `${r.headcount} properties or units, which the capacity model turns into ${crewSlotsForDoors(r.headcount)} crew days. This is their own number rather than a modelled range, which makes it firmer than the estimates on the outbound desk and still not a contract.`,
    });
  } else {
    out.push({
      label: "Size unknown",
      points: 0,
      why: `No property or unit count on the record. ${
        r.fieldReasons.headcount === "not-asked-by-route"
          ? `The ${REQUEST_CHANNEL_META[r.channel].label.toLowerCase()} does not ask for one.`
          : "The route asked and it came back empty."
      } Scoring it as zero rather than guessing is the whole point.`,
    });
  }

  if (r.desiredDate) {
    const daysOut = Math.round(
      (Date.parse(r.desiredDate) - Date.parse(r.receivedAt)) / MS_PER_DAY,
    );
    if (daysOut <= STANDARD_TERMS.bookingNoticeDays) {
      out.push({
        label: "Inside the standard notice period",
        points: 18,
        why: `Their window is ${daysOut} days from when they wrote, and the standard terms on this console require ${STANDARD_TERMS.bookingNoticeDays} days minimum notice. Answer slowly and the terms turn the answer into no.`,
      });
    }
  }

  if (r.prospectId) {
    const live = furthestStatus(pipeline, r.prospectId);
    if (live === "conversation" || live === "soft-hold" || live === "booked") {
      out.push({
        label: "Already live on the outbound board",
        points: 10,
        why: `This organisation is at "${live}" on the prospecting desk as well. The same account has arrived from both directions, and two people working it separately is how a brand sends one household two different prices.`,
      });
    }
  }

  const unasked = unaskedQualifiers(r);
  if (unasked.length > 0) {
    out.push({
      label: "Arrived unqualified by design",
      points: 8,
      why: `The ${REQUEST_CHANNEL_META[r.channel].label.toLowerCase()} does not ask for the ${unasked
        .map((f) => QUALIFYING_FIELD_LABEL[f].toLowerCase())
        .join(" or the ")}. That gap belongs to the route rather than to this sender's haste, and it is recovered by a phone call every single time.`,
    });
  }

  return out;
}

// ---------------------------------------------------------------
// The derivation
// ---------------------------------------------------------------

export interface QueueOptions {
  /**
   * The moment the queue is read from, ISO with an offset.
   *
   * Injected rather than read off the clock, exactly as `nowMonth` is on
   * the desk, so a screenshot of this page shows the same overdue count
   * tomorrow, next month and on a reader's machine in another timezone.
   */
  now: string;
}

/**
 * Every task the current state of the leads implies. Nothing stored.
 *
 * Change a lead's status and the task it was generating disappears in
 * the same render, and a different one may take its place. That is the
 * property this whole file exists for: a task cannot go stale, because
 * there is no task until somebody asks for the list.
 */
export function derivedTasks(
  requests: GroupRequest[],
  planInterest: PlanInterest[],
  pipeline: PipelineState,
  book: BookState,
  { now }: QueueOptions,
): DerivedTask[] {
  const tasks: DerivedTask[] = [];

  for (const r of requests) {
    const raw = shapeFor(r, book, now);
    if (!raw) continue;
    const shape = applyAgreedDate(r, raw);

    const late = Date.parse(shape.dueAt) <= Date.parse(now);
    const hoursLate = late ? workingHoursBetween(shape.dueAt, now) : null;
    const reasons = reasonsFor(r, shape, hoursLate, pipeline);

    tasks.push({
      id: `${shape.kind}:${r.id}`,
      kind: shape.kind,
      requestId: r.id,
      prospectId: r.prospectId,
      organisationName: organisationLabel(r),
      lane: r.lane,
      status: r.status,
      because: shape.because,
      action: shape.action,
      dueAt: shape.dueAt,
      hoursLate,
      score: reasons.reduce((n, c) => n + c.points, 0),
      reasons,
    });
  }

  /* Membership asks are on the same clock as any other lead, and they
     produce the same kind of row, because "we do not publish that"
     inside four hours is a decent answer and the same words nine days
     later is a brand that ignored somebody trying to hand it recurring
     revenue. */
  for (const l of planInterest) {
    if (l.answeredAt) continue;
    const dueAt = responseDueFrom(l.receivedAt);
    const late = Date.parse(dueAt) <= Date.parse(now);
    const hoursLate = late ? workingHoursBetween(dueAt, now) : null;

    const reasons: TaskReason[] = [
      {
        label: "What kind of work this is",
        points: KIND_WEIGHT["answer-plan-interest"],
        why: "A membership ask on a plan with no published price. There is nothing to quote and there is still an answer owed.",
      },
      {
        label: "Recurring revenue, asked for unprompted",
        points: 10,
        why: `Asked about ${l.preferredNights.join(" and ")}. Somebody is volunteering to move from one job to a standing agreement, in a market where fourteen brands out of fourteen refuse to publish what one costs.`,
      },
    ];
    if (hoursLate !== null && hoursLate > 0) {
      reasons.push({
        label: "Time past due",
        points: Math.min(30, Math.round(hoursLate)),
        why: `${hoursLate} working hours past its due moment.`,
      });
    }
    if (l.householdsExpected !== null) {
      reasons.push({
        label: "Properties they would enrol",
        points: Math.min(15, Math.round(l.householdsExpected / 20)),
        why: `${l.householdsExpected} properties or units, which is their own figure and not a modelled one.`,
      });
    }

    tasks.push({
      id: `answer-plan-interest:${l.id}`,
      kind: "answer-plan-interest",
      requestId: l.id,
      prospectId: l.prospectId,
      organisationName: organisationLabel(l),
      lane: l.lane,
      status: null,
      because:
        "Asked what the membership costs, on a plan that names every inclusion and publishes no price at all.",
      action:
        "Answer with every published inclusion and the plain fact that no price is published, here or at any rival checked. Record the ask as evidence that the recurring-revenue question is being asked in this territory.",
      dueAt,
      hoursLate,
      score: reasons.reduce((n, c) => n + c.points, 0),
      reasons,
    });
  }

  return rankTasks(tasks);
}

/**
 * A total order over tasks, with no ties left to chance.
 *
 * Score decides, then the earlier due moment, then the id. The third
 * comparison never changes a reading and it is there so the list is
 * IDENTICAL on every render, in every browser and in a screenshot taken
 * six months apart. A ranking that reshuffles equal rows makes a reader
 * doubt the rows that did not move.
 */
export function rankTasks(tasks: DerivedTask[]): DerivedTask[] {
  return [...tasks].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const da = Date.parse(a.dueAt);
    const db = Date.parse(b.dueAt);
    if (da !== db) return da - db;
    return a.id.localeCompare(b.id);
  });
}

// ---------------------------------------------------------------
// The buckets
// ---------------------------------------------------------------

export type BucketId = "overdue" | "today" | "thisWeek" | "later";

export interface QueueBucket {
  id: BucketId;
  label: string;
  /** Shape before hue, always. */
  glyph: string;
  tasks: DerivedTask[];
  /**
   * A sentence, whether the bucket is full or empty. A zero on its own
   * cannot tell a reader whether the desk is on top of its queue or
   * whether nothing has arrived, and those are opposite readings.
   */
  headline: string;
}

export interface QueueBuckets {
  overdue: QueueBucket;
  today: QueueBucket;
  thisWeek: QueueBucket;
  later: QueueBucket;
  /** Every task, ranked. The four buckets partition exactly this list. */
  all: DerivedTask[];
  /** One sentence over the whole queue, for the top of the page. */
  headline: string;
}

/**
 * Partition the tasks by when they are due.
 *
 * The boundaries are the territory's own calendar date and the seven
 * days after it, not rolling hours, because a person planning a morning
 * thinks in days. "Due today" means due on this date, including things
 * that came due at nine this morning and have not yet passed the moment
 * the queue is being read.
 */
export function queueBuckets(
  tasks: DerivedTask[],
  { now }: QueueOptions,
): QueueBuckets {
  const ranked = rankTasks(tasks);
  const nowMs = Date.parse(now);
  const today = venueDate(now);
  const weekEndMs = nowMs + 7 * MS_PER_DAY;

  const overdue: DerivedTask[] = [];
  const dueToday: DerivedTask[] = [];
  const thisWeek: DerivedTask[] = [];
  const later: DerivedTask[] = [];

  for (const t of ranked) {
    const dueMs = Date.parse(t.dueAt);
    if (dueMs <= nowMs) overdue.push(t);
    else if (venueDate(t.dueAt) === today) dueToday.push(t);
    else if (dueMs <= weekEndMs) thisWeek.push(t);
    else later.push(t);
  }

  const total = ranked.length;

  return {
    overdue: {
      id: "overdue",
      label: "Past the commitment",
      glyph: "◉",
      tasks: overdue,
      headline:
        overdue.length === 0
          ? "Nothing on this queue is past its due moment. Every lead that has arrived has been answered inside the four working hour commitment, and every follow-up the desk set itself is still in date."
          : `${overdue.length} of ${total} are past the moment they were due. ${
              overdue.filter((t) => t.kind === "answer-overdue").length
            } of those are leads nobody has answered at all, which is the only kind of late that spends the money and loses the job without anybody ever finding out.`,
    },
    today: {
      id: "today",
      label: "Due today",
      glyph: "◑",
      tasks: dueToday,
      headline:
        dueToday.length === 0
          ? "Nothing falls due for the rest of today. That is a real reading rather than an empty screen, and it means the morning belongs to whatever is already late or to outbound work."
          : `${dueToday.length} fall due before the end of today. They are ordered by what it costs to be wrong about them, not by when they arrived.`,
    },
    thisWeek: {
      id: "thisWeek",
      label: "Due this week",
      glyph: "◔",
      tasks: thisWeek,
      headline:
        thisWeek.length === 0
          ? "Nothing else comes due in the next seven days. Worth reading twice before enjoying it: an empty week ahead on the inbound queue usually means the spend behind it has not put enough into it."
          : `${thisWeek.length} come due in the next seven days. None of them needs doing this morning, and all of them will be late by Friday if the morning takes the whole week.`,
    },
    later: {
      id: "later",
      label: "Later",
      glyph: "○",
      tasks: later,
      headline:
        later.length === 0
          ? "Nothing sits beyond the next seven days. Every open request on the board is asking for something inside the week."
          : `${later.length} sit beyond the next seven days. They are here so the four buckets account for every task on the board; a bucket set that does not add up is how work goes missing.`,
    },
    all: ranked,
    headline:
      total === 0
        ? "No inbound lead is currently generating any work. Either nothing has arrived or everything that arrived has been answered, priced, closed or lost, and the status counts below say which."
        : `${total} pieces of work, derived from ${total} distinct leads. Nothing on this page is stored: change a lead and the task it was generating changes or disappears in the same render.`,
  };
}

/**
 * What is next, and why that one.
 *
 * Returns the ranked list unchanged plus nothing at all, which is the
 * point: the ranking IS the answer, and every row already carries the
 * reasons that put it where it is. This wrapper exists so a caller can
 * ask for the top few without reaching for `.slice` and losing the
 * sentence that explains an empty result.
 */
export interface NextUp {
  tasks: DerivedTask[];
  headline: string;
}

export function nextUp(tasks: DerivedTask[], limit = 5): NextUp {
  const ranked = rankTasks(tasks);
  if (ranked.length === 0) {
    return {
      tasks: [],
      headline:
        "Nothing is waiting on an answer. The inbound queue is a consequence of the spend and the outbound half of the job, so an empty one is a prompt to go and do those rather than a result in itself.",
    };
  }
  const top = ranked.slice(0, limit);
  const first = top[0];
  return {
    tasks: top,
    headline: `${first.organisationName} is first because ${first.reasons[0].why.charAt(0).toLowerCase()}${first.reasons[0].why.slice(1)} Every row below opens its own score.`,
  };
}

// ---------------------------------------------------------------
// Counts
// ---------------------------------------------------------------

/**
 * Leads per lane.
 *
 * Seeded from LANE_ORDER rather than from a literal, for the same reason
 * laneCounts on the desk is: a tenth lane added to the union should turn
 * up here as a zero rather than as an undefined that increments into
 * NaN the first time somebody files a lead against it.
 */
export function requestsByLane(requests: GroupRequest[]): Record<Lane, number> {
  const out = Object.fromEntries(LANE_ORDER.map((l) => [l, 0])) as Record<
    Lane,
    number
  >;
  for (const r of requests) out[r.lane] += 1;
  return out;
}

export function requestsByStatus(
  requests: GroupRequest[],
): Record<RequestStatus, number> {
  const out = Object.fromEntries(
    REQUEST_STATUS_ORDER.map((s) => [s, 0]),
  ) as Record<RequestStatus, number>;
  for (const r of requests) out[r.status] += 1;
  return out;
}

export function requestsByChannel(
  requests: GroupRequest[],
): Record<RequestChannel, number> {
  const out = Object.fromEntries(
    REQUEST_CHANNEL_ORDER.map((c) => [c, 0]),
  ) as Record<RequestChannel, number>;
  for (const r of requests) out[r.channel] += 1;
  return out;
}

// ---------------------------------------------------------------
// The response record
// ---------------------------------------------------------------

export interface ResponseRecord {
  /** Leads that have had a first human reply. */
  answered: number;
  /** Of those, how many landed inside the commitment. */
  met: number;
  missed: number;
  /** Still waiting, right now. */
  outstanding: number;
  /** Never answered and now cold. The failure the rest of the row hides. */
  lapsed: number;
  /** Working hours to first reply. Median, because one bad row skews a mean. */
  medianWorkingHours: number | null;
  slowestWorkingHours: number | null;
  /** A sentence for the full case and a different one for the empty case. */
  headline: string;
  /** Always illustrative. The commitment being measured against is invented. */
  disclosure: string;
}

/**
 * How the desk has actually done against its own commitment.
 *
 * THE MEDIAN RATHER THAN THE MEAN, and the slowest row alongside it. A
 * mean response time is the number every service dashboard shows and it
 * is the one most easily rescued by a run of quick "thanks, we will come
 * back to you" replies. The median says what a typical caller
 * experienced; the slowest says what the worst-treated caller
 * experienced, and in a trade that lives on reviews that person is the
 * one who tells everybody else.
 *
 * THE LAPSED COUNT IS DELIBERATELY ON THIS OBJECT. A response-time
 * statistic computed only over answered leads is the most flattering
 * number in any sales tool, because the leads that were never answered
 * at all simply are not in the denominator, and those are the ones the
 * brand paid for and got nothing from. Carrying the lapsed count on the
 * same record makes that impossible to do quietly.
 */
export function responseRecord(
  requests: GroupRequest[],
  { now }: QueueOptions,
): ResponseRecord {
  const answeredRows = requests.filter((r) => r.firstRespondedAt !== null);
  const hours = answeredRows
    .map((r) => workingHoursBetween(r.receivedAt, r.firstRespondedAt as string))
    .sort((a, b) => a - b);

  const met = hours.filter((h) => h <= RESPONSE_COMMITMENT.hours).length;
  const missed = hours.length - met;
  const lapsed = requests.filter((r) => r.status === "lapsed").length;
  const outstanding = requests.filter(
    (r) => r.status === "new" && Date.parse(r.responseDueAt) > Date.parse(now),
  ).length;

  const median =
    hours.length === 0
      ? null
      : hours.length % 2 === 1
        ? hours[(hours.length - 1) / 2]
        : Math.round(
            ((hours[hours.length / 2 - 1] + hours[hours.length / 2]) / 2) * 10,
          ) / 10;

  const slowest = hours.length === 0 ? null : hours[hours.length - 1];

  const disclosure = RESPONSE_COMMITMENT.disclosure;

  if (answeredRows.length === 0) {
    return {
      answered: 0,
      met: 0,
      missed: 0,
      outstanding,
      lapsed,
      medianWorkingHours: null,
      slowestWorkingHours: null,
      headline:
        lapsed > 0
          ? `Nothing on this board has been answered yet and ${lapsed} lead has already gone cold waiting, so there is no response time to report and that absence is itself the finding.`
          : "No lead has been answered yet, so there is no response time to report. This is a blank record rather than a good one.",
      disclosure,
    };
  }

  return {
    answered: answeredRows.length,
    met,
    missed,
    outstanding,
    lapsed,
    medianWorkingHours: median,
    slowestWorkingHours: slowest,
    headline: `${met} of ${answeredRows.length} answered leads landed inside the four working hour commitment, with a median of ${median} working hours and a slowest of ${slowest}. ${
      lapsed > 0
        ? `${lapsed} more was never answered at all and sits in neither figure, which is exactly how a response time statistic flatters a desk if nobody says so.`
        : "Nothing has been left unanswered, so the median is computed over everything that arrived."
    }`,
    disclosure,
  };
}

// ---------------------------------------------------------------
// The intake gap
// ---------------------------------------------------------------

export interface QualifyingGapRow {
  field: QualifyingField;
  label: string;
  /** How many open leads are missing it. */
  missing: number;
  /** Of those, how many came through a route that never asked. */
  neverAsked: number;
  note: string;
}

export interface QualifyingGap {
  rows: QualifyingGapRow[];
  /** Open leads with all three answers present. */
  qualified: number;
  open: number;
  headline: string;
}

/**
 * The finding, counted.
 *
 * A Local Services Ad hands over a name, a phone number and one of
 * Google's own broad categories. It does not hand over the property
 * address, a preferred window or a job anybody could be dispatched
 * against. The brand's own web form asks for all three, because the
 * brand wrote the questions. This function counts what that difference
 * costs across a live queue, and it separates the answers a sender
 * withheld from the answers nobody was ever asked for, because only the
 * second is fixable by changing a form or a bid.
 */
export function qualifyingGap(requests: GroupRequest[]): QualifyingGap {
  const open = requests.filter((r) => REQUEST_STATUS_META[r.status].open);

  const rows: QualifyingGapRow[] = QUALIFYING_FIELD_ORDER.map((field) => {
    const missing = open.filter((r) => missingQualifiers(r).includes(field));
    const neverAsked = missing.filter(
      (r) => r.fieldReasons[field] === "not-asked-by-route",
    );
    return {
      field,
      label: QUALIFYING_FIELD_LABEL[field],
      missing: missing.length,
      neverAsked: neverAsked.length,
      note:
        missing.length === 0
          ? `Every open lead on the board carries a ${QUALIFYING_FIELD_LABEL[field].toLowerCase()}.`
          : `${missing.length} open leads have no ${QUALIFYING_FIELD_LABEL[field].toLowerCase()}, and ${neverAsked.length} of those arrived through a route that never asked for one.`,
    };
  });

  const qualified = open.filter(isQualified).length;

  return {
    rows,
    qualified,
    open: open.length,
    headline:
      open.length === 0
        ? "There are no open leads to qualify. When there are, this is where the difference between what each route captures turns into a number."
        : `${qualified} of ${open.length} open leads carry all three qualifying answers. The rest need a phone call before anything can be priced, and ${rows.reduce(
            (n, r) => n + r.neverAsked,
            0,
          )} of those missing answers were never requested by the form the sender actually filled in.`,
  };
}
