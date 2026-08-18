import { useCallback, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { Lane } from "@/domain/types";
import type { DerivedTask } from "@/domain/requests";
import {
  REQUEST_CHANNEL_META,
  REQUEST_STATUS_META,
  RESPONSE_COMMITMENT,
  TASK_KIND_META,
  missingQualifiers,
  venueDate,
} from "@/domain/requests";
import {
  LEAGUE_INTEREST_BY_ID,
  REQUEST_BY_ID,
  REQUESTS_AS_OF,
  SEED_LEAGUE_INTEREST,
  SEED_REQUESTS,
} from "@/data/requests";
import {
  derivedTasks,
  nextUp,
  qualifyingGap,
  queueBuckets,
  rankTasks,
  responseRecord,
  type BucketId,
} from "@/domain/selectors/queue";
import { LANE_META } from "@/domain/lanes";
import { PROSPECTS, PROSPECT_BY_ID } from "@/data/prospects";
import { deskLines, windowMonths } from "@/domain/selectors/desk";
import { furthestStatus, usePipeline } from "@/state/PipelineProvider";
import {
  activityByWeek,
  activityTotals,
  revenueTotals,
  useBook,
} from "@/state/BookProvider";
import { LEDGER, PITCH_STATUS } from "@/domain/vocabulary";
import {
  Figure,
  ProvenanceBadge,
} from "@/components/primitives/ProvenanceBadge";
import { ContextSelect, PageHeader } from "@/components/chrome/PageHeader";
import { RecordPager, useRecordFocus } from "@/components/chrome/RecordPager";
import { Button } from "@/components/primitives/Button";
import { downloadCsv, toCsv } from "@/lib/export/csv";
import { LaneChip } from "@/components/primitives/LaneChip";
import { DailyRings } from "@/components/rings/DailyRings";
import { TokenChip } from "@/components/primitives/StatusChip";
import styles from "./TodayPage.module.css";

/**
 * TODAY. The one screen that answers "what do I do next", across both
 * halves of a local marketing job.
 *
 * Every other page in this console is a place you go when you already
 * know what you are looking for. The desk is for choosing which
 * organisation to approach, the queue is for working the leads that
 * arrived, the book is for checking what has actually been sold. Each of
 * them is honest and each of them is a decision the reader has to make
 * before the screen can help. This one makes the first decision for them
 * and then shows its working.
 *
 * ----- WHAT IS ACTUALLY URGENT TODAY ---------------------------------
 *
 * The single most urgent published fact in this territory is a date. The
 * Service Champions summer offers, 47 dollars for an AC tune-up and 47
 * dollars for a drain clearing with a free camera inspection, carry fine
 * print that expires on 31 August 2026, and as at the 18 August 2026
 * scrape NO SUCCESSOR CAMPAIGN IS PUBLISHED ANYWHERE. Adeedo's seasonal
 * page expires on the same date. So on 1 September two of the five West
 * Division brands go dark at once, and every dollar of paid search
 * currently pointing at those coupons points at a page with nothing on
 * it. That is on this screen because it is the one thing here that gets
 * worse while nobody looks at it.
 *
 * ----- THE DISCIPLINE THIS PAGE IS MOST LIKELY TO BREAK ---------------
 *
 * This console has two ledgers that are never added together: signed
 * work, which carries money, and hours in the field, which carry none. A
 * "today" screen is exactly where somebody adds them, because a single
 * number is easier to put in a heading than two.
 *
 * The temptation here is slightly different and just as bad. Inbound work
 * is counted in PIECES OF WORK, each with a clock on it. Outbound work is
 * counted in HOURS and in ORGANISATIONS, and it has no clock at all
 * because nobody is waiting. "Nine things today" made from four leads and
 * five go-sees is a number that means nothing: the four have somebody on
 * the other end of them and the five do not. So the two halves sit side
 * by side, each with its own unit named in its own heading, and there is
 * no total of the two anywhere on this page.
 *
 * ----- WHAT THIS PAGE REFUSES TO SAY ---------------------------------
 *
 * The four working hour response commitment is THIS DESK'S OWN and it
 * renders with that stated every time it appears. No Champions Group
 * brand publishes a response time anywhere. Service Champions advertises
 * "24/7 Live Answering" on its contact page and publishes one phone
 * number across all three offices, and neither of those is a promise
 * about what happens to a web lead.
 *
 * The membership programme is the same shape of gap. CHAMP-Rewards has
 * every inclusion published and NO PRICE, so somebody asking what it
 * costs gets an honest answer and a note carried upward rather than a
 * sale. Fourteen of the fourteen brands profiled in this market do the
 * same thing, which is why the ask keeps arriving.
 *
 * Every figure is derived at render from the seeds and the two providers.
 * Nothing on this screen is stored, which is why a status changed on
 * another page moves this one.
 */

// ---------------------------------------------------------------
// The moment this page is read from
// ---------------------------------------------------------------

/**
 * The clock is injected, not read off the machine.
 *
 * Same decision as the queue and the desk, for the same reason: a work
 * sample opened on a hiring manager's computer six months after it was
 * written must show the same overdue count it showed the day it was
 * built. A "today" page is the one screen where that is most tempting to
 * get wrong and most obvious when it is wrong.
 */
const NOW = REQUESTS_AS_OF;
const TODAY = venueDate(NOW);
const NOW_MS = Date.parse(NOW);
const NOW_MONTH = Number(TODAY.slice(5, 7)) - 1;
const MS_PER_DAY = 86_400_000;

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday",
];

/**
 * Dates are split rather than parsed, exactly as they are on the Book and
 * Replies pages. `new Date("2026-09-23")` is midnight UTC, and rendering
 * that through a locale formatter in California prints the twenty second.
 * A held install date shown one day early is not a rounding error on a
 * screen somebody is working a phone call from.
 */
function formatDay(iso: string): string {
  const [y, m, d] = venueDate(iso).split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

function weekdayOf(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return "";
  return DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

/**
 * The wall clock as written, never converted.
 *
 * Every timestamp in the lead seeds and everything the queue derives from
 * them carries the territory's own offset, so the hour in the string IS
 * the local hour in Brea. Reading it off the string keeps the page free
 * of a second timezone conversion that could disagree with the first.
 */
function wallClock(iso: string): string {
  const m = iso.match(/T(\d{2}):(\d{2})/);
  if (!m) return "";
  const raw = Number(m[1]);
  const suffix = raw >= 12 ? "pm" : "am";
  const h = raw % 12 === 0 ? 12 : raw % 12;
  return `${h}:${m[2]} ${suffix}`;
}

/** The Monday on or before a date. Field activity is planned by week. */
function weekCommencing(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const at = Date.UTC(y, m - 1, d);
  const back = (new Date(at).getUTCDay() + 6) % 7;
  const start = new Date(at - back * MS_PER_DAY);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${start.getUTCFullYear()}-${pad(start.getUTCMonth() + 1)}-${pad(
    start.getUTCDate(),
  )}`;
}

const WEEK_START = weekCommencing(TODAY);

// ---------------------------------------------------------------
// The bucket, which arrives in the URL
// ---------------------------------------------------------------

/**
 * THE RAIL LINKS INTO THIS SCREEN WITH A BUCKET ON THE END OF IT, and
 * before this the parameter landed and did nothing.
 *
 * The four buckets are the queue's own partition, so a bucket is the one
 * filter that means the same thing on this page, on the queue page and
 * in the rail's second level. Reading it off the URL is what makes those
 * three agree, and it is what makes a link somebody sends open on the
 * queue they were talking about rather than on the whole board.
 *
 * What it narrows is deliberately ONE SECTION and not the page. The
 * halves, the risk panel and the response record are readings of the
 * whole week, and a "today" screen whose weekly figures silently
 * described a quarter of the queue would be the most dangerous kind of
 * wrong: quietly plausible. So the bucket scopes the ranked queue at the
 * top, which is the part a person works through, and everything below it
 * keeps counting everything and says so.
 */
const BUCKET_ORDER: BucketId[] = ["overdue", "today", "thisWeek", "later"];

function readBucket(params: URLSearchParams): BucketId | "all" {
  const raw = params.get("bucket");
  if (!raw) return "all";
  return (BUCKET_ORDER as string[]).includes(raw) ? (raw as BucketId) : "all";
}

const count = (n: number) => n.toLocaleString("en-US");
const hoursText = (n: number) => (n % 1 === 0 ? String(n) : n.toFixed(1));

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}

/**
 * A due moment, said the way a person would say it.
 *
 * Late is stated in WORKING hours rather than elapsed ones, because the
 * commitment is counted in working hours and a clock that measures one
 * thing while the target measures another is how a service level quietly
 * becomes decorative.
 */
function dueSentence(task: DerivedTask): string {
  const day = venueDate(task.dueAt);
  const when = wallClock(task.dueAt);
  if (task.hoursLate !== null) {
    return task.hoursLate <= 0
      ? `Due at ${when} on ${formatDay(task.dueAt)}, which has just passed.`
      : `${hoursText(task.hoursLate)} working ${plural(
          task.hoursLate,
          "hour",
          "hours",
        )} past its due moment of ${when} on ${formatDay(task.dueAt)}.`;
  }
  if (day === TODAY) return `Due at ${when} today.`;
  const days = Math.round((Date.parse(task.dueAt) - NOW_MS) / MS_PER_DAY);
  return `Due ${formatDay(task.dueAt)} at ${when}, which is ${
    days <= 0 ? "later today" : `${days} ${plural(days, "day", "days")} out`
  }.`;
}

/** The role and the route an inbound lead came in through, where there is one. */
function contextOf(task: DerivedTask): { role: string; via: string; ask: string } | null {
  const request = REQUEST_BY_ID[task.requestId];
  if (request) {
    return {
      role: request.contactRole,
      via: REQUEST_CHANNEL_META[request.channel].label,
      ask: request.askSummary,
    };
  }
  const league = LEAGUE_INTEREST_BY_ID[task.requestId];
  if (league) {
    return {
      role: league.contactRole,
      via: "Membership ask",
      ask: `Asked what the maintenance plan costs, against ${league.preferredNights.join(" and ")}. Service Champions publishes every CHAMP-Rewards inclusion and no price at all, so this is answered honestly and carried upward rather than quoted.`,
    };
  }
  return null;
}

// ---------------------------------------------------------------
// The things at risk of being dropped
// ---------------------------------------------------------------

/**
 * One thing that is quietly rotting, and where to go and deal with it.
 *
 * Every item carries a route to the thing itself rather than to a page
 * that merely contains it. A count that links to a screen where the
 * reader has to find the row again is a count that gets ignored twice.
 */
interface RiskItem {
  key: string;
  name: string;
  lane: Lane;
  detail: string;
  clock: string;
  to: string;
  toLabel: string;
}

interface RiskGroup {
  id: string;
  label: string;
  glyph: string;
  cssVar: string;
  /** The population this group is counted out of. Always shown beside it. */
  denominator: number;
  denominatorLabel: string;
  /** A sentence for the full case, and a different one for the empty case. */
  full: string;
  empty: string;
  route: string;
  routeLabel: string;
  items: RiskItem[];
}

// ---------------------------------------------------------------
// The page
// ---------------------------------------------------------------

export function TodayPage() {
  const pipeline = usePipeline();
  const book = useBook();
  const [params, setParams] = useSearchParams();

  /** Open by default. The reasoning is the page, not a disclosure. */
  const [whyOpen, setWhyOpen] = useState(true);
  /* Collapsed by default. The argument for the tool is not the tool, and
     a marketing manager opening this at nine in the morning wants the
     queue rather than an essay. */
  const [builtOpen, setBuiltOpen] = useState(false);

  const tasks = useMemo(
    () =>
      derivedTasks(SEED_REQUESTS, SEED_LEAGUE_INTEREST, pipeline, book, {
        now: NOW,
      }),
    [pipeline, book],
  );

  const buckets = useMemo(() => queueBuckets(tasks, { now: NOW }), [tasks]);
  const top = useMemo(() => nextUp(tasks, 5), [tasks]);
  const record = useMemo(() => responseRecord(SEED_REQUESTS, { now: NOW }), []);
  const gap = useMemo(() => qualifyingGap(SEED_REQUESTS), []);

  const bucket = readBucket(params);

  /**
   * The queue this section stands in, ranked, whole or narrowed.
   *
   * `queueBuckets` ranks before it partitions, so a bucket's tasks come
   * out in the same order the whole queue would have put them in. That
   * matters more than it looks: it means the pager below walks the four
   * buckets in the same sequence it walks the board, and a reader who
   * narrows to the overdue rows does not find them reshuffled.
   */
  const queue = useMemo(
    () => (bucket === "all" ? rankTasks(tasks) : buckets[bucket].tasks),
    [bucket, buckets, tasks],
  );
  const queueIds = useMemo(() => queue.map((t) => t.id), [queue]);

  /**
   * Which piece of work the card is showing.
   *
   * Null means the top of the queue, which is what this screen opens on
   * and what its heading promises. Stepping the pager moves it and
   * nothing else on the page, so a person can work down the queue
   * without the screen ever becoming a list they have to find their
   * place in again.
   */
  const [pickedId, setPickedId] = useState<string | null>(null);
  const picked =
    pickedId !== null && queueIds.includes(pickedId) ? pickedId : null;

  /* Only a deliberate step moves the reader. The card is on record one
     from the moment the page loads, and a page that scrolled itself to
     its own first card on arrival would be taking the reader's place
     away before they had one. */
  useRecordFocus(picked);

  const at = picked === null ? 0 : queueIds.indexOf(picked);
  const first = queue[at] ?? null;
  const runnersUp = queue.slice(at + 1, at + 5);

  /**
   * The queue as a spreadsheet, over exactly what the filter left.
   *
   * The reason for it is the one in the job posting, which asks for
   * advanced Excel and for weekly reporting: the person running this desk
   * is out in the territory for half the week, and a queue that can only
   * be read on a screen behind a rail cannot be worked from a car park.
   * The rank is exported with it, because a list handed over without its
   * order is a list somebody else will reorder by name.
   */
  const exportCsv = useCallback(() => {
    const csv = toCsv(
      [
        "Rank",
        "Organisation",
        "Service line",
        "Kind of work",
        "Due",
        "Working hours late",
        "Score",
        "Why it exists",
        "Do this",
      ],
      queue.map((t, i) => [
        i + 1,
        t.organisationName,
        LANE_META[t.lane].label,
        TASK_KIND_META[t.kind].label,
        t.dueAt,
        t.hoursLate === null ? "" : t.hoursLate,
        t.score,
        t.because,
        t.action,
      ]),
    );
    downloadCsv(bucket === "all" ? "today-queue" : `today-${bucket}`, csv);
  }, [queue, bucket]);

  const revenue = useMemo(() => revenueTotals(book.book), [book.book]);
  const plan = useMemo(() => activityTotals(book.activity), [book.activity]);
  const weeks = useMemo(() => activityByWeek(book.activity), [book.activity]);

  const thisWeek = useMemo(
    () => weeks.find((w) => w.week === WEEK_START) ?? null,
    [weeks],
  );
  const thisWeekTotals = useMemo(
    () => (thisWeek ? activityTotals(thisWeek.lines) : null),
    [thisWeek],
  );

  /**
   * The three organisations the desk would have this person go and find
   * today, if the inbound queue were empty.
   *
   * Deliberately three rather than ten. This is the outbound HALF of a
   * morning, not the outbound board, and a list long enough to plan a
   * week from would quietly turn this page into a second desk.
   */
  const outbound = useMemo(
    () => deskLines(pipeline, { nowMonth: NOW_MONTH, limit: 3 }),
    [pipeline],
  );

  // -------------------------------------------------------------
  // The five ways work gets dropped
  // -------------------------------------------------------------

  const risks = useMemo<RiskGroup[]>(() => {
    const taskByItem = new Map<string, DerivedTask>();
    for (const t of tasks) taskByItem.set(t.requestId, t);

    /* ONE. Never answered, and the commitment has already passed. The
       only failure on this page that belongs entirely to this desk: no
       homeowner said no, nobody chose a rival, the clock simply ran. An
       LSA lead is billed on arrival and sold to more than one
       contractor, so this is money already spent and then wasted. */
    const unansweredRequests = SEED_REQUESTS.filter(
      (r) =>
        r.firstRespondedAt === null && Date.parse(r.responseDueAt) <= NOW_MS,
    );
    const unansweredLeague = SEED_LEAGUE_INTEREST.filter((l) => {
      const t = taskByItem.get(l.id);
      return l.answeredAt === null && t !== undefined && t.hoursLate !== null;
    });

    const unansweredItems: RiskItem[] = [
      ...rankTasks(
        unansweredRequests
          .map((r) => taskByItem.get(r.id))
          .filter((t): t is DerivedTask => t !== undefined),
      ).map((t) => {
        const r = REQUEST_BY_ID[t.requestId];
        return {
          key: t.id,
          name: t.organisationName,
          lane: t.lane,
          /* The route is named with its own capitalisation rather than
             lowercased into the sentence. "the brea form" reads as a
             typo to anybody who knows the page it refers to. */
          detail: `${r.contactRole}. Arrived through the ${
            REQUEST_CHANNEL_META[r.channel].short
          }. ${r.askSummary}`,
          clock:
            t.hoursLate !== null
              ? `${hoursText(t.hoursLate)} working ${plural(
                  t.hoursLate,
                  "hour",
                  "hours",
                )} past the commitment`
              : `Arrived ${formatDay(r.receivedAt)}`,
          to: "/requests",
          toLabel: "Answer it in the queue",
        };
      }),
      ...unansweredLeague.map((l) => ({
        key: `league-${l.id}`,
        name:
          l.prospectId
            ? (PROSPECT_BY_ID[l.prospectId]?.name ?? l.prospectId)
            : (l.organisationName ?? "Organisation not recorded"),
        lane: l.lane,
        detail: `${l.contactRole}. Asked what the maintenance plan costs, against ${l.preferredNights.join(
          " and ",
        )}, on a plan with no published price. The honest answer is still an answer.`,
        clock: `Arrived ${formatDay(l.receivedAt)}`,
        to: "/requests",
        toLabel: "Answer it in the queue",
      })),
    ];

    /* TWO. Live conversations with nothing agreed next. The status says
       the conversation is alive; the record says nobody decided what
       happens after the last message. That gap is where a warm reply
       goes cold without anybody choosing to let it. */
    const withNextStep = new Set(
      book.replies.filter((r) => r.nextStep).map((r) => r.prospectId),
    );
    const liveProspects = PROSPECTS.filter((p) => {
      const s = furthestStatus(pipeline, p.id);
      return s === "conversation" || s === "soft-hold";
    });
    const noNextStep: RiskItem[] = liveProspects
      .filter((p) => !withNextStep.has(p.id))
      .map((p) => ({
        key: `live-${p.id}`,
        name: p.name,
        lane: p.lane,
        detail: `${p.decisionMakerTitle}. ${
          PITCH_STATUS[furthestStatus(pipeline, p.id)].label
        } on the outbound board with no next step written against it.`,
        clock: `Buys in ${p.buyingWindow}`,
        to: `/map?prospect=${p.id}`,
        toLabel: "Open the organisation",
      }));

    /* THREE. An install date held against nothing agreed is a slot no
       other customer can be given, so a hold that is not converting
       costs the next caller rather than the person holding it. Both
       halves of the console can create one, so both are counted here. */
    const bookedProspectIds = new Set(book.book.map((l) => l.prospectId));
    const heldRequests: RiskItem[] = SEED_REQUESTS.filter(
      (r) => r.status === "held",
    ).map((r) => {
      const t = taskByItem.get(r.id);
      return {
        key: `held-${r.id}`,
        name: t?.organisationName ?? r.organisationName ?? r.id,
        lane: r.lane,
        detail: `${r.contactRole}. ${r.askSummary}`,
        clock: r.desiredDate
          ? `${formatDay(r.desiredDate)} held, nothing agreed`
          : "Slot held, nothing agreed",
        to: "/requests",
        toLabel: "Open it in the queue",
      };
    });
    const heldProspects: RiskItem[] = PROSPECTS.filter(
      (p) =>
        furthestStatus(pipeline, p.id) === "soft-hold" &&
        !bookedProspectIds.has(p.id),
    ).map((p) => ({
      key: `hold-${p.id}`,
      name: p.name,
      lane: p.lane,
      detail: `${p.decisionMakerTitle}. Install date held on the outbound board with no line in the book against it.`,
      clock: "Held, nothing agreed",
      to: `/map?prospect=${p.id}`,
      toLabel: "Open the organisation",
    }));

    /* FOUR. The buying window is open now and nobody has ever contacted
       them. A season-locked buyer whose window closes unanswered is not
       a slower deal, it is a year gone: a heating system gets replaced
       once, and whoever is in front of them in October wins it. */
    const untouched: RiskItem[] = PROSPECTS.filter(
      (p) =>
        windowMonths(p.buyingWindow).includes(NOW_MONTH) &&
        furthestStatus(pipeline, p.id) === "unworked",
    ).map((p) => ({
      key: `window-${p.id}`,
      name: p.name,
      lane: p.lane,
      detail: `${p.decisionMakerTitle}. ${
        LANE_META[p.lane].occasionClass === "calendar-locked"
          ? "Season-locked, so the work comes round whether or not anybody calls."
          : "Discretionary, so somebody there has to decide the work is worth doing at all."
      }`,
      clock: `Buys in ${p.buyingWindow}`,
      to: `/map?prospect=${p.id}`,
      toLabel: "Open the organisation",
    }));

    /* FIVE. The two ledgers disagreeing about whether something was
       sold. It is one row today and it is on this list because a win
       that exists on only one of the two is not a win anybody can take
       into a weekly division report. */
    const disagreements: RiskItem[] = tasks
      .filter((t) => t.kind === "reconcile-book")
      .map((t) => ({
        key: t.id,
        name: t.organisationName,
        lane: t.lane,
        detail: t.because,
        clock: `Marked won, no line in the book`,
        to: "/book",
        toLabel: "Open the book",
      }));

    const openRequests = SEED_REQUESTS.filter(
      (r) => REQUEST_STATUS_META[r.status].open,
    ).length;

    return [
      {
        id: "unanswered",
        label: "Never answered, past the commitment",
        glyph: "◉",
        cssVar: "var(--risk)",
        denominator: SEED_REQUESTS.length + SEED_LEAGUE_INTEREST.length,
        denominatorLabel: "leads and membership asks on the board",
        full: `${unansweredItems.length} ${plural(
          unansweredItems.length,
          "lead has",
          "leads have",
        )} sat past the four working hour commitment with nobody having replied. Nobody has said no to any of them. Local Services Ads bill on arrival and sell the same lead to more than one contractor, so this is money already spent and then given away, which is why it is first.`,
        empty:
          "Every lead that has arrived has had a human reply inside the four working hour commitment. That is the state to hold rather than a state to celebrate, because it lasts exactly until the next form is submitted.",
        route: "/requests",
        routeLabel: "The inbound queue",
        items: unansweredItems,
      },
      {
        id: "no-next-step",
        label: "Live conversations with no next step",
        glyph: "◑",
        cssVar: "var(--warn)",
        denominator: PROSPECTS.length,
        denominatorLabel: "organisations in the territory",
        full: `${noNextStep.length} ${plural(
          noNextStep.length,
          "organisation is",
          "organisations are",
        )} live on the outbound board with nothing written down about what happens next. A conversation with no next step is not a conversation, it is a memory, and it lasts about a fortnight.`,
        empty:
          "Every live conversation has a next step written against it. A conversation without one is a memory rather than a plan, so an empty group here is a real result.",
        route: "/replies",
        routeLabel: "What came back",
        items: noNextStep,
      },
      {
        id: "held",
        label: "Slots held against nothing",
        glyph: "◕",
        cssVar: "var(--accent)",
        denominator: openRequests + liveProspects.length,
        denominatorLabel: "open leads and live conversations",
        full: `${
          heldRequests.length + heldProspects.length
        } held ${plural(
          heldRequests.length + heldProspects.length,
          "slot has",
          "slots have",
        )} nothing agreed against them. No published page at any of the five brands sets out a deposit or a hold policy, so a hold that is not converting is a crew slot nobody else can be given rather than a job in waiting.`,
        empty:
          "No slot is being held against nothing. Every hold on the board has either converted or been released, which are the only two things a hold is allowed to do.",
        route: "/calendar",
        routeLabel: "Seasonal demand and capacity",
        items: [...heldRequests, ...heldProspects],
      },
      {
        id: "window-open",
        label: "Buying window open, never touched",
        glyph: "○",
        cssVar: "var(--info)",
        denominator: PROSPECTS.length,
        denominatorLabel: "organisations in the territory",
        full: `${untouched.length} ${plural(
          untouched.length,
          "organisation buys",
          "organisations buy",
        )} in a window that is open this month and ${plural(
          untouched.length,
          "has",
          "have",
        )} never been contacted. Nothing is late here yet, which is exactly why it goes unnoticed until the window shuts and the heating season starts without them.`,
        empty:
          "Every organisation whose buying window is open this month has been contacted at least once. That is the outbound half of the job doing what it exists for.",
        route: "/",
        routeLabel: "The desk",
        items: untouched,
      },
      {
        id: "ledger-disagreement",
        label: "Won on one ledger, missing on the other",
        glyph: "●",
        cssVar: "var(--ok)",
        denominator: SEED_REQUESTS.length,
        denominatorLabel: "leads on the board",
        full: `${disagreements.length} ${plural(
          disagreements.length,
          "lead is",
          "leads are",
        )} marked won with no matching line in the book. One of the two records is wrong, and a win that exists on only one of them is not a win anybody can put in a weekly division report.`,
        empty:
          "The queue and the book agree about everything that has been sold. They are separate ledgers on purpose, so agreement between them is a check that passed rather than a foregone conclusion.",
        route: "/book",
        routeLabel: "The two ledgers",
        items: disagreements,
      },
    ];
  }, [tasks, pipeline, book.book, book.replies]);

  const atRiskTotal = risks.reduce((n, g) => n + g.items.length, 0);

  /**
   * Which risk group the panel is showing.
   *
   * It lives in the URL rather than in component state so the reading is
   * linkable, survives a reload and gives the back button something
   * sensible to do. Falling back to the first group that actually has
   * something in it means the panel opens on work rather than on a
   * congratulation.
   */
  const requested = params.get("risk");
  const activeRisk =
    risks.find((g) => g.id === requested) ??
    risks.find((g) => g.items.length > 0) ??
    risks[0];

  const openRequests = SEED_REQUESTS.filter(
    (r) => REQUEST_STATUS_META[r.status].open,
  );

  // -------------------------------------------------------------
  // The week
  // -------------------------------------------------------------

  const week = useMemo(() => {
    const since = NOW_MS - 7 * MS_PER_DAY;
    const inWindow = (iso: string | null) =>
      iso !== null && Date.parse(iso) >= since && Date.parse(iso) <= NOW_MS;

    const closed = SEED_REQUESTS.filter((r) => inWindow(r.closedAt));
    const won = closed.filter((r) => r.status === "won");
    const lost = closed.filter((r) => r.status === "lost");
    const arrived = SEED_REQUESTS.filter((r) => inWindow(r.receivedAt));
    const leagueArrived = SEED_LEAGUE_INTEREST.filter((l) =>
      inWindow(l.receivedAt),
    );

    return { won, lost, arrived, leagueArrived };
  }, []);

  const outsideThisWeek = thisWeekTotals?.outsideHours ?? 0;
  const hoursThisWeek = thisWeekTotals?.hours ?? 0;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/*
          The band. The bucket in the crumb and in the control are the
          same value read from the same place, so the trail cannot claim
          a filter the page is not applying.
        */}
        <PageHeader
          filterCrumb={bucket === "all" ? undefined : buckets[bucket].label}
          context={
            <ContextSelect
              id="today-bucket"
              label="Queue"
              value={bucket}
              options={[
                {
                  value: "all",
                  label: "Everything",
                  count: buckets.all.length,
                },
                ...BUCKET_ORDER.map((id) => ({
                  value: id,
                  label: buckets[id].label,
                  count: buckets[id].tasks.length,
                })),
              ]}
              onChange={(value) => {
                setParams(
                  (previous) => {
                    const next = new URLSearchParams(previous);
                    if (value === "all") next.delete("bucket");
                    else next.set("bucket", value);
                    return next;
                  },
                  { replace: false },
                );
                /* A new queue starts at its own top. Carrying a position
                   across a filter change would leave a reader standing
                   on record nine of a queue that now holds four. */
                setPickedId(null);
              }}
            />
          }
          pager={
            <RecordPager
              ids={queueIds}
              currentId={first ? first.id : null}
              onChange={setPickedId}
              noun={["piece of work", "pieces of work"]}
              setLabel="in this queue"
            />
          }
          actions={
            <Button size="sm" glyph="▤" onClick={exportCsv}>
              Export {count(queue.length)} as CSV
            </Button>
          }
        />

        <header className={styles.head}>
          <div className={styles.headTop}>
            <h1 className={styles.h1}>Today</h1>
            {/* The fixed clock is a fact about the figures, so it stays. The
                paragraph explaining why it is fixed went to /method. */}
            <p
              className={styles.deskDate}
              title="The clock is fixed rather than read from the machine, so this board shows the same queue and the same overdue count on any day."
            >
              <span aria-hidden="true">◷</span>
              <span className="num">
                {weekdayOf(TODAY)} {formatDay(TODAY)}, {wallClock(NOW)}
              </span>
              <span className="visually-hidden">
                Fixed reading time, not the clock on this machine.
              </span>
            </p>
          </div>

          {/*
            WHY I BUILT THIS. The only standing argument left on a working
            screen, and it is shut until somebody asks for it.
          */}
          <div className={styles.built}>
            <button
              type="button"
              className={styles.builtToggle}
              aria-expanded={builtOpen}
              aria-controls="built-body"
              onClick={() => setBuiltOpen((v) => !v)}
            >
              <span aria-hidden="true" className={styles.builtGlyph}>
                ◈
              </span>
              <span>Why I built this</span>
              <span aria-hidden="true" className={styles.builtCaret}>
                {builtOpen ? "▴" : "▾"}
              </span>
            </button>
            {builtOpen ? (
              <div id="built-body" className={styles.builtBody}>
                <p>
                  The West Division sells through five brands that never
                  mention each other, in a market where eight of the fourteen
                  rival contractors profiled name a membership plan and hide
                  what it costs, five publish no plan at all, and not one of
                  the fourteen publishes a price.
                  Demand generation here is not a funnel diagram, it is knowing
                  which doors are in the territory, what each of them is worth
                  and when they buy. So I built the list first: 329 real
                  organisations across the territory, what each one said, and
                  when to go back.
                </p>
                <p>
                  It runs one loop. Rank what is closest to being lost, work
                  it, write down what came back, and set the next date. Every
                  figure carries where it came from, and the ones I could not
                  source are marked withheld rather than filled in, because a
                  work sample that prints invented numbers about the company it
                  is applying to has answered the wrong question.
                </p>
              </div>
            ) : null}
          </div>

          {/*
            THE ONE STANDING FACT ON THIS SCREEN THAT IS NOT DERIVED.

            Everything else here is read off the seeds at render. This is a
            published date with a countdown attached to it, it is the most
            urgent thing in the territory, and it is written out rather than
            computed because the console's clock is fixed and a hard-coded
            "thirteen days" would go stale the moment anybody moved it. The
            observation is dated to the scrape instead, which stays true.
          */}
          <p className={styles.recordDisclosure}>
            <span aria-hidden="true">▲</span>
            <span>
              Expiring, and unanswered. The fine print on the 47 dollar AC
              tune-up and the 47 dollar drain clearing reads &ldquo;offers
              expire 8/31/2026&rdquo;, and as at the 18 August 2026 scrape no
              successor campaign is published anywhere on the site. Adeedo
              carries the same expiry date, so two of the five West Division
              brands go dark together and every paid click still pointing at
              those coupons lands on an offer that has run out. ASI, by
              contrast, runs a standing price menu with no expiry printed on
              any of its nine offers and therefore never needs a successor
              built in a hurry. Building the September and October heating
              campaign is this fortnight&apos;s work rather than next
              month&apos;s.
            </span>
          </p>
        </header>

        <DailyRings />

        {/* =========================================================
            ONE. The next thing, given real room.
            ========================================================= */}
        <section className={styles.nextSection} aria-labelledby="next-h">
          <div className={styles.sectionHead}>
            <h2 className={styles.h2} id="next-h">
              Next up
            </h2>
            {/*
              THE POSITION AND THE SCOPE, IN ONE LINE. It answers the two
              questions a pager raises the moment it appears: where in
              the queue am I, and which queue is this. The bucket is
              named in words rather than left to the crumb, because this
              line sits directly above the card and a reader checking a
              count should not have to look back up to the band to find
              out what the count is over.
            */}
            <p className={styles.sectionCount} aria-live="polite">
              <span className="num">
                {first ? at + 1 : 0} of {count(queue.length)}
              </span>{" "}
              {bucket === "all"
                ? "pieces of inbound work, ranked"
                : `in ${buckets[bucket].label.toLowerCase()}, of ${count(
                    buckets.all.length,
                  )} on the whole board`}
            </p>
          </div>

          {first === null ? (
            <p className={styles.emptyBig}>
              <span aria-hidden="true">○</span>
              {/*
                An empty bucket and an empty board are opposite readings
                and they must not share a sentence. "Nothing is waiting"
                under a filter that is hiding twenty two live pieces of
                work is the most flattering wrong answer this screen
                could give.
              */}
              <span>
                {bucket === "all" ? (
                  top.headline
                ) : (
                  <>
                    Nothing sits in {buckets[bucket].label.toLowerCase()}. That
                    is a statement about the filter and not about the week:{" "}
                    <Link to="/today">
                      all {count(buckets.all.length)} pieces of inbound work
                    </Link>{" "}
                    are still on the board.
                  </>
                )}
              </span>
            </p>
          ) : (
            <article
              className={styles.nextCard}
              data-record-id={first.id}
              tabIndex={-1}
            >
              <div className={styles.nextMain}>
                <div className={styles.nextChips}>
                  <TokenChip token={TASK_KIND_META[first.kind]} size="sm" />
                  <LaneChip lane={first.lane} size="sm" />
                  {first.status ? (
                    <span className={styles.statusWord}>
                      <span aria-hidden="true">
                        {REQUEST_STATUS_META[first.status].glyph}
                      </span>
                      <span>{REQUEST_STATUS_META[first.status].label}</span>
                    </span>
                  ) : null}
                </div>

                <h3 className={styles.nextName}>{first.organisationName}</h3>

                {(() => {
                  const ctx = contextOf(first);
                  return ctx ? (
                    <p className={styles.nextWho}>
                      <span>{ctx.role}</span>
                      <span aria-hidden="true" className={styles.dot}>
                        ·
                      </span>
                      <span>{ctx.via}</span>
                    </p>
                  ) : null;
                })()}

                {(() => {
                  const ctx = contextOf(first);
                  return ctx ? <p className={styles.nextAsk}>{ctx.ask}</p> : null;
                })()}

                <p className={styles.nextBecause}>{first.because}</p>

                <div className={styles.nextAction}>
                  <p className={styles.nextActionLabel}>Do this</p>
                  <p className={styles.nextActionText}>{first.action}</p>
                </div>

                <div className={styles.nextButtons}>
                  <Link className={styles.primaryLink} to="/requests">
                    <span aria-hidden="true">◑</span>
                    <span>Answer {first.organisationName}</span>
                  </Link>
                  {first.prospectId ? (
                    <Link
                      className={styles.secondaryLink}
                      to={`/map?prospect=${first.prospectId}`}
                    >
                      <span aria-hidden="true">◎</span>
                      <span>Everything known about them</span>
                    </Link>
                  ) : null}
                  <Link className={styles.secondaryLink} to="/requests">
                    <span aria-hidden="true">▤</span>
                    <span>
                      All {count(buckets.all.length)} pieces of inbound work
                    </span>
                  </Link>
                </div>
              </div>

              {/* The clock gets its own panel because it is the only thing
                  on this card that is getting worse while it is read. */}
              <aside
                className={styles.clock}
                data-late={first.hoursLate !== null}
                aria-label="The clock on this piece of work"
              >
                <p className={styles.clockState}>
                  <span aria-hidden="true">
                    {first.hoursLate !== null ? "◉" : "◔"}
                  </span>
                  <span>{first.hoursLate !== null ? "Past due" : "In date"}</span>
                </p>
                <p className={`${styles.clockFigure} num`}>
                  {first.hoursLate !== null
                    ? `${hoursText(first.hoursLate)} h late`
                    : wallClock(first.dueAt)}
                </p>
                <p className={styles.clockWhen}>{dueSentence(first)}</p>
                {/* The disclosure is a fact about the figure, so it stays in
                    the accessibility tree and in the tooltip. It is no longer
                    three lines of standing text next to a clock. */}
                <p
                  className={styles.clockCommitment}
                  title={RESPONSE_COMMITMENT.disclosure}
                >
                  <ProvenanceBadge provenance={RESPONSE_COMMITMENT.provenance} />
                  <span>{RESPONSE_COMMITMENT.label}, this desk's own target</span>
                  <span className="visually-hidden">
                    {RESPONSE_COMMITMENT.disclosure}
                  </span>
                </p>
              </aside>

              {/* ---------------------------------------------------
                  WHY THIS ONE. A ranking a reader cannot argue with is
                  a ranking they are being asked to take on faith, and
                  the whole argument of this prototype is that they
                  should not have to. Same table as the desk's score
                  breakdown, so a reader who has opened one has opened
                  both.
                  --------------------------------------------------- */}
              <div className={styles.why}>
                <button
                  type="button"
                  className={styles.whyToggle}
                  aria-expanded={whyOpen}
                  aria-controls="why-first"
                  onClick={() => setWhyOpen((v) => !v)}
                >
                  <span className={`${styles.whyScore} num`}>{first.score}</span>
                  {/*
                    The label is rank-neutral rather than saying "first",
                    because the pager can put any record in this card and
                    a button that insists it is explaining the top of the
                    queue while showing number nine is a small lie that
                    costs the score table its credibility.
                  */}
                  <span className={styles.whyWord}>
                    {whyOpen
                      ? "Hide why this one ranks here"
                      : "Why this one ranks here"}
                  </span>
                  <span aria-hidden="true" className={styles.whyCaret}>
                    {whyOpen ? "▴" : "▾"}
                  </span>
                </button>

                {whyOpen ? (
                  <div id="why-first" className={styles.whyBody}>
                    <p className={styles.whyLede}>
                      {at === 0 && bucket === "all"
                        ? top.headline
                        : `${first.organisationName}, ${at + 1} of ${count(
                            queue.length,
                          )} in this queue.`}
                    </p>
                    <table className={styles.whyTable}>
                      <caption className="visually-hidden">
                        How {first.organisationName} scored {first.score}
                      </caption>
                      <thead>
                        <tr>
                          <th scope="col">Component</th>
                          <th scope="col" className={styles.pointsCol}>
                            Points
                          </th>
                          <th scope="col">What it is measuring</th>
                        </tr>
                      </thead>
                      <tbody>
                        {first.reasons.map((r) => (
                          <tr key={r.label}>
                            <th scope="row" className={styles.whyLabel}>
                              {r.label}
                            </th>
                            <td className={styles.whyPoints}>
                              <span className="num">
                                {r.points > 0 ? `+${r.points}` : r.points}
                              </span>
                            </td>
                            <td className={styles.whyText}>{r.why}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <th scope="row">Total</th>
                          <td className={styles.whyPoints}>
                            <span className={`${styles.whyTotal} num`}>
                              {first.score}
                            </span>
                          </td>
                          <td className={styles.whyText}>
                            Derived at render. No part of this order is stored.
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : null}
              </div>
            </article>
          )}

          {runnersUp.length > 0 ? (
            <div className={styles.runners}>
              <h3 className={styles.h3}>
                Behind it, in order
                <span className={`${styles.runnerCount} num`}>
                  {at + runnersUp.length + 1} of {count(queue.length)} shown
                </span>
              </h3>
              <ol className={styles.runnerList}>
                {runnersUp.map((t) => (
                  <li key={t.id} className={styles.runner}>
                    <span className={`${styles.runnerScore} num`}>{t.score}</span>
                    <span className={styles.runnerBody}>
                      <span className={styles.runnerName}>
                        {t.organisationName}
                      </span>
                      <span className={styles.runnerChips}>
                        <TokenChip token={TASK_KIND_META[t.kind]} size="sm" />
                        <LaneChip lane={t.lane} size="sm" />
                      </span>
                      <span className={styles.runnerWhen}>
                        {dueSentence(t)}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
              <p className={styles.runnerFoot}>
                <Link className="tap" to="/requests">
                  Every piece of inbound work, with its own score
                </Link>
              </p>
            </div>
          ) : null}
        </section>

        {/* =========================================================
            TWO. Today, in two halves, which are never added together.
            ========================================================= */}
        <section className={styles.halvesSection} aria-labelledby="halves-h">
          <div className={styles.sectionHead}>
            <h2 className={styles.h2} id="halves-h">
              Two ledgers, never added
            </h2>
          </div>

          <div className={styles.halves}>
            <section className={styles.inbound} aria-labelledby="inbound-h">
              <header className={styles.halfHead}>
                <h3 className={styles.halfTitle} id="inbound-h">
                  <span aria-hidden="true" className={styles.halfGlyph}>
                    ◑
                  </span>
                  Inbound, work due
                </h3>
                <p className={styles.halfUnit}>Counted in pieces of work</p>
              </header>

              <div className={styles.figures}>
                <div className={styles.figure}>
                  <span className={`${styles.figureValue} num`}>
                    {count(buckets.overdue.tasks.length)}
                  </span>
                  <span className={styles.figureLabel}>
                    Past the commitment
                    <ProvenanceBadge provenance="illustrative" compact />
                  </span>
                </div>
                <div className={styles.figure}>
                  <span className={`${styles.figureValue} num`}>
                    {count(buckets.today.tasks.length)}
                  </span>
                  <span className={styles.figureLabel}>
                    Falling due today
                    <ProvenanceBadge provenance="illustrative" compact />
                  </span>
                </div>
                <div className={styles.figure}>
                  <span className={`${styles.figureValue} num`}>
                    {count(buckets.thisWeek.tasks.length)}
                  </span>
                  <span className={styles.figureLabel}>
                    Due inside seven days
                    <ProvenanceBadge provenance="illustrative" compact />
                  </span>
                </div>
                <div className={styles.figure}>
                  <span className={`${styles.figureValue} num`}>
                    {count(openRequests.length)}
                  </span>
                  <span className={styles.figureLabel}>
                    Leads still open
                    <ProvenanceBadge provenance="illustrative" compact />
                  </span>
                </div>
              </div>

              <p className={styles.halfFoot}>
                <Link className="tap" to="/requests">
                  The inbound queue, all {count(SEED_REQUESTS.length)} leads
                </Link>
              </p>
            </section>

            <section className={styles.outbound} aria-labelledby="outbound-h">
              <header className={styles.halfHead}>
                <h3 className={styles.halfTitle} id="outbound-h">
                  <span aria-hidden="true" className={styles.halfGlyph}>
                    {LEDGER["outbound-activity"].glyph}
                  </span>
                  Outbound, work planned
                </h3>
                <p className={styles.halfUnit}>
                  Counted in hours and organisations
                </p>
              </header>

              <div className={styles.figures}>
                <div className={styles.figure}>
                  <span className={`${styles.figureValue} num`}>
                    {hoursText(outsideThisWeek)}
                  </span>
                  <span className={styles.figureLabel}>
                    Hours in the field, this week
                    <ProvenanceBadge provenance="modeled" compact />
                  </span>
                </div>
                <div className={styles.figure}>
                  <span className={`${styles.figureValue} num`}>
                    {hoursText(hoursThisWeek)}
                  </span>
                  <span className={styles.figureLabel}>
                    Hours planned, all work
                    <ProvenanceBadge provenance="illustrative" compact />
                  </span>
                </div>
                <div className={styles.figure}>
                  <span className={`${styles.figureValue} num`}>
                    {count(thisWeek?.lines.length ?? 0)}
                  </span>
                  <span className={styles.figureLabel}>
                    Shifts this week
                    <ProvenanceBadge provenance="illustrative" compact />
                  </span>
                </div>
                <div className={styles.figure}>
                  <span className={`${styles.figureValue} num`}>
                    {count(outbound.length)}
                  </span>
                  <span className={styles.figureLabel}>
                    Ranked for a first touch
                    <ProvenanceBadge provenance="modeled" compact />
                  </span>
                </div>
              </div>

              {thisWeek === null ? (
                <p className={styles.halfText}>
                  No shift planned, week commencing{" "}
                  <span className="num">{formatDay(WEEK_START)}</span>.
                </p>
              ) : (
                <>
                  <p
                    className={styles.halfText}
                    title="A call block from a desk counts as outbound work but not as hours in the field."
                  >
                    Week commencing{" "}
                    <span className="num">{formatDay(WEEK_START)}</span>:{" "}
                    {hoursText(outsideThisWeek)} of {hoursText(hoursThisWeek)}{" "}
                    planned hours out in the territory.
                  </p>
                  <ul className={styles.shifts}>
                    {thisWeek.lines.map((line) => (
                      <li key={line.id} className={styles.shift}>
                        <span className={styles.shiftWhere}>
                          {line.locationLabel}
                        </span>
                        <span className={`${styles.shiftHours} num`}>
                          {hoursText(line.hours)} h
                        </span>
                        <span className={styles.shiftState}>
                          <span aria-hidden="true">
                            {line.completedAt ? "●" : "○"}
                          </span>
                          <span>
                            {line.completedAt
                              ? `Completed ${formatDay(line.completedAt)}`
                              : "Planned"}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <h4 className={styles.halfSubhead}>
                Next to approach
                <span className={`${styles.runnerCount} num`}>
                  {outbound.length} of {count(PROSPECTS.length)}
                </span>
              </h4>
              {outbound.length === 0 ? (
                <p className={styles.halfText}>
                  Nothing left to rank under the current filter.
                </p>
              ) : (
                <ul className={styles.deskList}>
                  {outbound.map((line) => (
                    <li key={line.prospect.id} className={styles.deskRow}>
                      <span className={`${styles.deskScore} num`}>
                        {line.score}
                      </span>
                      <span className={styles.deskBody}>
                        <Link
                          className={`${styles.deskName} tap`}
                          to={`/map?prospect=${line.prospect.id}`}
                        >
                          {line.prospect.name}
                        </Link>
                        <span className={styles.runnerChips}>
                          <LaneChip lane={line.prospect.lane} size="sm" />
                          <span className={styles.deskMiles}>
                            <span className="num">
                              {line.miles.toFixed(1)}
                            </span>{" "}
                            straight-line miles
                          </span>
                        </span>
                        <span className={styles.deskNext}>
                          {line.nextAction}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <p className={styles.halfFoot}>
                <Link className="tap" to="/">
                  The desk, all {count(PROSPECTS.length)} organisations
                </Link>
              </p>
            </section>
          </div>
        </section>

        {/* =========================================================
            THREE. Everything at risk of being dropped.
            ========================================================= */}
        <section className={styles.riskSection} aria-labelledby="risk-h">
          <div className={styles.sectionHead}>
            <h2 className={styles.h2} id="risk-h">
              At risk of being dropped
            </h2>
            <p className={styles.sectionCount}>
              <span className="num">{count(atRiskTotal)}</span> across{" "}
              <span className="num">{risks.length}</span> ways work goes
              missing
              <ProvenanceBadge provenance="illustrative" compact />
            </p>
          </div>

          <nav className={styles.riskTiles} aria-label="Ways work goes missing">
            {risks.map((g) => {
              const active = g.id === activeRisk.id;
              return (
                <Link
                  key={g.id}
                  to={`?risk=${g.id}`}
                  className={styles.riskTile}
                  data-active={active}
                  data-empty={g.items.length === 0}
                  aria-current={active ? "true" : undefined}
                  style={{ ["--tone" as string]: g.cssVar }}
                >
                  <span className={styles.riskTileTop}>
                    <span className={styles.riskGlyph} aria-hidden="true">
                      {g.glyph}
                    </span>
                    <span className={`${styles.riskCount} num`}>
                      {count(g.items.length)}
                    </span>
                    <span className={styles.riskState}>
                      {g.items.length === 0 ? "Clear" : "At risk"}
                    </span>
                  </span>
                  <span className={styles.riskLabel}>{g.label}</span>
                  <span className={styles.riskOf}>
                    of <span className="num">{count(g.denominator)}</span>{" "}
                    {g.denominatorLabel}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/*
            THE PANEL IS A LIVE REGION.

            Choosing a tile rewrites the sentence, the count and the whole
            list underneath without navigating anywhere a screen reader
            would announce. Polite, and scoped to the panel rather than to
            the count alone, because a number read out with no label
            attached to it is a number nobody can use.
          */}
          <div
            className={styles.riskPanel}
            role="region"
            aria-live="polite"
            aria-labelledby="risk-panel-h"
          >
            <div className={styles.riskPanelHead}>
              <h3 className={styles.h3} id="risk-panel-h">
                <span
                  aria-hidden="true"
                  className={styles.riskGlyph}
                  style={{ ["--tone" as string]: activeRisk.cssVar }}
                >
                  {activeRisk.glyph}
                </span>
                {activeRisk.label}
              </h3>
              <p className={styles.riskPanelCount}>
                <span className="num">
                  {count(activeRisk.items.length)} of{" "}
                  {count(activeRisk.denominator)}
                </span>{" "}
                {activeRisk.denominatorLabel}
              </p>
            </div>

            <p className={styles.riskSentence}>
              {activeRisk.items.length === 0
                ? activeRisk.empty
                : activeRisk.full}
            </p>

            {activeRisk.items.length === 0 ? (
              <p className={styles.riskFoot}>
                <Link className="tap" to={activeRisk.route}>
                  {activeRisk.routeLabel}
                </Link>
              </p>
            ) : (
              <>
                <ul className={styles.riskList}>
                  {activeRisk.items.map((item) => (
                    <li key={item.key} className={styles.riskItem}>
                      <span className={styles.riskItemHead}>
                        <Link
                          className={`${styles.riskItemName} tap`}
                          to={item.to}
                        >
                          {item.name}
                        </Link>
                        <LaneChip lane={item.lane} size="sm" />
                      </span>
                      <span className={styles.riskItemClock}>
                        <span aria-hidden="true">◷</span>
                        <span>{item.clock}</span>
                      </span>
                      <span className={styles.riskItemDetail}>
                        {item.detail}
                      </span>
                      <span className={styles.riskItemLink}>
                        <Link className="tap" to={item.to}>
                          {item.toLabel}
                        </Link>
                      </span>
                    </li>
                  ))}
                </ul>
                <p className={styles.riskFoot}>
                  <Link className="tap" to={activeRisk.route}>
                    {activeRisk.routeLabel}
                  </Link>
                </p>
              </>
            )}
          </div>
        </section>

        {/* =========================================================
            FOUR. A real sense of the week.
            ========================================================= */}
        <section className={styles.weekSection} aria-labelledby="week-h">
          <div className={styles.sectionHead}>
            <h2 className={styles.h2} id="week-h">
              Last seven days
            </h2>
            <p className={styles.sectionCount}>
              <span className="num">
                {formatDay(new Date(NOW_MS - 7 * MS_PER_DAY).toISOString())}
              </span>{" "}
              to <span className="num">{formatDay(TODAY)}</span>
            </p>
          </div>

          <div className={styles.weekGrid}>
            <div className={styles.weekCard}>
              <h3 className={styles.weekCardTitle}>What closed</h3>
              <p className={`${styles.weekFigure} num`}>
                {count(week.won.length + week.lost.length)}
              </p>
              <p className={styles.weekUnit}>
                leads closed
                <ProvenanceBadge provenance="illustrative" compact />
              </p>
              <p className={styles.weekText}>
                {week.won.length + week.lost.length === 0
                  ? "Nothing closed either way."
                  : `${week.won.length} sold, ${week.lost.length} lost${
                      week.lost.length === 0
                        ? ""
                        : ", each with a reason recorded"
                    }.`}
              </p>
              <p className={styles.weekText}>
                The book carries{" "}
                <Figure
                  value={`${count(revenue.contracts)} ${plural(
                    revenue.contracts,
                    "contract",
                    "contracts",
                  )}`}
                  provenance="illustrative"
                  compact
                />{" "}
                worth{" "}
                <Figure
                  value={usd.format(revenue.revenue)}
                  provenance="modeled"
                  compact
                />
                , of which{" "}
                <Figure
                  value={usd.format(revenue.userPricedRevenue)}
                  provenance="user_input"
                  compact
                />{" "}
                rests on a price somebody typed rather than one the brand
                publishes. Service Champions publishes two coupon prices and
                no rate card at all.
              </p>
            </div>

            <div className={styles.weekCard}>
              <h3 className={styles.weekCardTitle}>What came in</h3>
              <p className={`${styles.weekFigure} num`}>
                {count(week.arrived.length + week.leagueArrived.length)}
              </p>
              <p className={styles.weekUnit}>
                leads and membership asks
                <ProvenanceBadge provenance="illustrative" compact />
              </p>
              {/* The unpublished membership price is a real, checkable gap and
                  it is the reason a membership ask is logged rather than
                  quoted, so it keeps a home in the tooltip and in the
                  accessibility tree. */}
              <p
                className={styles.weekText}
                title={
                  week.leagueArrived.length === 0
                    ? undefined
                    : "Service Champions publishes every CHAMP-Rewards inclusion and no price. Not one of the fourteen rival brands profiled in this market publishes a membership price either, and only two brands in the Champions family do, so the ask is recorded as recurring-revenue demand rather than quoted."
                }
              >
                {week.arrived.length + week.leagueArrived.length === 0
                  ? "Nothing arrived."
                  : `${week.arrived.length} ${plural(
                      week.arrived.length,
                      "lead",
                      "leads",
                    )}, ${week.leagueArrived.length} membership ${plural(
                      week.leagueArrived.length,
                      "ask",
                      "asks",
                    )}.`}
                {week.leagueArrived.length === 0 ? null : (
                  <span className="visually-hidden">
                    {" "}
                    Service Champions publishes every CHAMP-Rewards inclusion
                    and no price. Not one of the fourteen rival brands profiled
                    in this market publishes a membership price either, and
                    only two brands in the Champions family do, so the ask is
                    recorded as recurring-revenue demand rather than quoted.
                  </span>
                )}
              </p>
            </div>

            <div className={styles.weekCard}>
              <h3 className={styles.weekCardTitle}>What is still open</h3>
              <p className={`${styles.weekFigure} num`}>
                {count(openRequests.length)}
              </p>
              <p className={styles.weekUnit}>
                of {count(SEED_REQUESTS.length)} leads
                <ProvenanceBadge provenance="illustrative" compact />
              </p>
              {/* A Local Services Ad hands over a name, a phone number and one
                  of Google's own broad categories. No property address, no
                  window, no description of what has failed. That is why this
                  count exists, so it stays as the tooltip on the count. */}
              <p
                className={styles.weekText}
                title="A Google Local Services Ad hands over a name, a phone number and one of Google's own service categories, and bills on arrival. It carries no property address, no preferred window and no description of the fault, so every lead on that route arrives unqualified by design."
              >
                {openRequests.length === 0
                  ? "All closed."
                  : `${gap.qualified} of ${gap.open} carry all three qualifying answers.`}
                {(() => {
                  const unqualified = openRequests.filter(
                    (r) => missingQualifiers(r).length > 0,
                  ).length;
                  return unqualified === 0 ? null : (
                    <>
                      {` ${unqualified} ${plural(
                        unqualified,
                        "call",
                        "calls",
                      )} to an estimate.`}
                      <span className="visually-hidden">
                        {" "}
                        A Google Local Services Ad hands over a name, a phone
                        number and one of Google&apos;s own service categories,
                        and bills on arrival. It carries no property address, no
                        preferred window and no description of the fault, so
                        every lead on that route arrives unqualified by design.
                      </span>
                    </>
                  );
                })()}
              </p>
            </div>

            <div className={styles.weekCard}>
              <h3 className={styles.weekCardTitle}>
                Hours out in the territory
              </h3>
              <p className={`${styles.weekFigure} num`}>
                {hoursText(outsideThisWeek)}
              </p>
              <p className={styles.weekUnit}>
                of {hoursText(plan.outsideHours)} planned this period
                <ProvenanceBadge provenance="modeled" compact />
              </p>
              <p className={styles.weekText}>
                {plan.outsideHours === 0
                  ? "No field hours planned this period."
                  : `${hoursText(plan.hours)} h planned in total. ${
                      plan.completed
                    } of ${plan.shifts} shifts completed.`}
              </p>
            </div>
          </div>

          {/* -----------------------------------------------------
              THE RESPONSE RECORD. The one figure on this page that
              measures the desk rather than the territory, and the
              lapsed count sits inside it so it cannot flatter.
              ----------------------------------------------------- */}
          <section className={styles.record} aria-labelledby="record-h">
            <div className={styles.recordHead}>
              <h3 className={styles.h3} id="record-h">
                Response record
              </h3>
              <ProvenanceBadge provenance={RESPONSE_COMMITMENT.provenance} />
            </div>

            <div className={styles.recordFigures}>
              <div className={styles.figure}>
                <span className={`${styles.figureValue} num`}>
                  {count(record.met)} of {count(record.answered)}
                </span>
                <span className={styles.figureLabel}>
                  Answered inside four working hours
                </span>
              </div>
              <div className={styles.figure}>
                <span className={`${styles.figureValue} num`}>
                  {record.medianWorkingHours === null
                    ? "No median"
                    : `${hoursText(record.medianWorkingHours)} h`}
                </span>
                <span className={styles.figureLabel}>
                  Median time to a first reply
                </span>
              </div>
              <div className={styles.figure}>
                <span className={`${styles.figureValue} num`}>
                  {record.slowestWorkingHours === null
                    ? "None yet"
                    : `${hoursText(record.slowestWorkingHours)} h`}
                </span>
                <span className={styles.figureLabel}>
                  The worst-treated sender
                </span>
              </div>
              <div className={styles.figure}>
                <span className={`${styles.figureValue} num`}>
                  {count(record.lapsed)}
                </span>
                <span className={styles.figureLabel}>
                  Never answered at all
                </span>
              </div>
            </div>

            {/* The disclosure is the honest label on the whole panel: no
                brand in the group publishes a response time anywhere, so
                the target is this console's own. It never leaves. */}
            <p className={styles.recordDisclosure}>
              <span aria-hidden="true">▲</span>
              <span>{record.disclosure}</span>
            </p>
            <p className={styles.recordFoot}>
              <Link className="tap" to="/method">
                Formulas and sources
              </Link>
            </p>
          </section>
        </section>

        <p className={styles.pageFoot}>
          <button
            type="button"
            className={styles.resetRisk}
            /*
              THIS CLEARS THE RISK PANEL AND NOTHING ELSE. It used to
              write an empty parameter set, which also threw away the
              bucket the reader had arrived on from the rail. A control
              named for one thing that quietly resets another is the
              cheapest way to make a reader stop trusting the rest of the
              buttons on a page.
            */
            onClick={() =>
              setParams(
                (previous) => {
                  const next = new URLSearchParams(previous);
                  next.delete("risk");
                  return next;
                },
                { replace: true },
              )
            }
          >
            Reset risk panel
          </button>
        </p>
      </div>
    </div>
  );
}
