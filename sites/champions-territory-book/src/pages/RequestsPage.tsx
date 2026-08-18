import { useCallback, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Lane } from "@/domain/types";
import type {
  DerivedTask,
  GroupRequest,
  PlanInterest,
  RequestChannel,
  RequestStatus,
} from "@/domain/requests";
import {
  REQUEST_CHANNEL_META,
  REQUEST_CHANNEL_ORDER,
  REQUEST_STATUS_META,
  REQUEST_STATUS_ORDER,
  RESPONSE_COMMITMENT,
  TASK_KIND_META,
  missingQualifiers,
  unaskedQualifiers,
} from "@/domain/requests";
import {
  REQUESTS_AS_OF,
  SEED_LEAGUE_INTEREST,
  SEED_REQUESTS,
} from "@/data/requests";
import {
  derivedTasks,
  qualifyingGap,
  queueBuckets,
  requestsByChannel,
  requestsByLane,
  requestsByStatus,
  responseRecord,
  type BucketId,
  type QueueBuckets,
} from "@/domain/selectors/queue";
import { LANE_META, LANE_ORDER } from "@/domain/lanes";
import { PROSPECT_BY_ID } from "@/data/prospects";
import { usePipeline } from "@/state/PipelineProvider";
import { useBook } from "@/state/BookProvider";
import { EmailComposeModal } from "@/components/email/EmailComposeModal";
import { LaneChip } from "@/components/primitives/LaneChip";
import { TokenChip } from "@/components/primitives/StatusChip";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { Button } from "@/components/primitives/Button";
import { ClearedBoard } from "@/components/play/ClearedBoard";
import {
  ContextSelect,
  PageHeader,
} from "@/components/chrome/PageHeader";
import {
  RecordPager,
  useRecordFocus,
} from "@/components/chrome/RecordPager";
import { downloadCsv, toCsv } from "@/lib/export/csv";
import {
  RequestDrawer,
  callListLine,
  formatDay,
  formatWhen,
  type ComposePlan,
  type RequestSubject,
} from "@/components/requests/RequestDrawer";
import { RecordName } from "@/components/record/RecordName";
import { SegmentedFilter } from "@/components/queue/SegmentedFilter";
import { WorkingSetLead } from "@/components/queue/WorkingSetLead";
import styles from "./RequestsPage.module.css";

/**
 * THE INBOUND QUEUE. Everything that has arrived on its own, the clock
 * on each one, and the next move in plain words.
 *
 * Every other screen in this console is outbound. Three hundred and twenty nine
 * organisations, nine lanes, a desk that decides who to write to on a
 * Tuesday. That half of the job only produces work when somebody goes
 * looking for it, which makes it easy to measure and easy to feel busy
 * inside.
 *
 * Inbound is the half that loses money without leaving a mark. A lead
 * arrives with a clock already running and the only way to fail it is to
 * do nothing at all. Nobody writes down "did not ring the homeowner in
 * La Habra for four days". There is no report with that line on it. The
 * enquiry simply stops mattering to the person who sent it, and by the
 * time anyone looks the job has gone to whoever answered.
 *
 * AND ALMOST EVERY ROW HERE WAS PAID FOR ON ARRIVAL. A Local Services
 * Ad lead and a marketplace lead are billed the moment they land, and
 * the marketplaces sell the same lead to two or three contractors at
 * once. That is why this screen exists and why the group's own Digital
 * Marketing Specialist posting is written around speed to lead across
 * LSA, Yelp and HomeAdvisor with call answer rates as the metric. A row
 * that sits here for nineteen days is not untidy. It is a receipt for
 * money that bought nothing.
 *
 * So this screen has one job, and the brief for it was one sentence:
 * easily attend to everyone. Two things follow from that and they are
 * the only two things this page is really doing.
 *
 * ── ONE: NOTHING FALLS OUT OF THE ARITHMETIC ───────────────────────
 * The four buckets partition every piece of derived work: past the
 * commitment, due today, due this week, later. The counts are printed
 * with their sum beside them, so a reader can check in about two
 * seconds that the four add up to the total. A bucket set that does not
 * account for every task is exactly how work goes missing: the header
 * says twenty two, the three buckets somebody looked at say nineteen,
 * and nobody ever finds out which three fell off the end.
 *
 * Every bucket button lands on precisely the rows it counted. A button
 * that says "show these six" and produces four rows because the table
 * deduplicated something is a small lie that costs the whole screen its
 * credibility, and it is a very easy one to ship by accident.
 *
 * ── TWO: THE CLOCK TELLS THE TRUTH ABOUT WHOSE CLOCK IT IS ─────────
 * NO CHAMPIONS BRAND PUBLISHES A RESPONSE TIME ANYWHERE. Not Service
 * Champions, not ASI, not Adeedo, not Powell, not Timo's. There is no
 * service level to quote and this screen does not invent one on their
 * behalf. The four working hour commitment is the console's own,
 * written for this work sample, and it says so on screen in the same
 * block as the number rather than in a footnote nobody scrolls to. A
 * countdown that implied a published service level would be exactly the
 * kind of invented figure this whole console exists to avoid.
 *
 * ── THE FINDING THIS SCREEN IS BUILT AROUND ────────────────────────
 * A Google Local Services Ad hands over a name, a phone number and one
 * of Google's own broad categories. It hands over no property address,
 * no preferred window and no job a technician could be dispatched
 * against. The brand's own web form asks for all three, because the
 * brand wrote the questions instead of renting them.
 *
 * That difference is not a design quibble; it is a commercial hole.
 * Nobody can price what the route did not collect, and every lead
 * through the busiest and most expensive route on the board arrives
 * missing all three of the answers somebody needs before they can quote
 * anything. The gap panel below counts what that costs across a live
 * queue, and it keeps "they left it blank" and "the route never asked"
 * in separate columns, because only the second is fixable by changing a
 * form or a bid.
 *
 * ── WHY THE STANDING FACTS SIT UNDER THE QUEUE AND NOT OVER IT ─────
 * This screen used to open with the response commitment: a heading, the
 * four hour figure, the disclosure and four record figures, roughly a
 * third of the first screenful. It is a true and necessary block and it
 * is the same on every bucket. So a reader pressed "Due this week" and
 * the top nine hundred pixels changed by one breadcrumb word and one
 * number inside a select. Measured pair by pair, three tenths of one per
 * cent of the pixels above the fold moved. The filter had been told, in
 * the plainest possible way, that it did not matter.
 *
 * The commitment did not stop being true, so it was not deleted; it was
 * moved to where it is asked for. A reader wants the definition of the
 * clock AFTER they have met a clock, which is under the queue, beside
 * the legend that reads a clock cell. Its provenance badge, its
 * disclosure and the four record figures travelled with it intact. The
 * qualifying gap moved for the same reason: it is a standing fact about
 * how the routes behave rather than about the bucket on screen.
 *
 * What took the space is the working set lead, which says what is in
 * THIS bucket, how much, and the first rows by name with a verb against
 * each. Between any two buckets it now differs in glyph, word, figure,
 * clock line and three named organisations.
 *
 * ── WHAT IS NOT ON THIS PAGE ───────────────────────────────────────
 * A membership price. Service Champions names CHAMP-Rewards and
 * publishes no figure for it, and neither does a single one of the
 * thirteen rivals profiled for this console. Printing an invented
 * monthly number beside real published offer prices is how a reader
 * stops believing the real ones. The membership asks ARE here, because
 * three organisations asking the recurring-revenue question unprompted
 * is itself the finding, and what is shown about the plan is exactly
 * what is published plus an explicit record of what is not.
 */

// ---------------------------------------------------------------
// The moment the queue is read from
// ---------------------------------------------------------------

/**
 * Injected rather than read off the clock, exactly as the desk does it.
 *
 * A queue whose overdue count depends on when a hiring manager happens
 * to open it is a queue nobody can check. The seed and every figure
 * derived from it are pinned to one moment, that moment is printed at
 * the top of the page, and the arithmetic is therefore reproducible in a
 * screenshot, in a test, and in a browser three timezones away.
 */
const NOW = REQUESTS_AS_OF;

const BUCKET_ORDER: BucketId[] = ["overdue", "today", "thisWeek", "later"];

/**
 * Tone, word and glyph per bucket.
 *
 * The glyph and the word come first and the tone is third, which is the
 * rule everywhere in this application. The bucket labels themselves come
 * off the selector so the card, the row and the filter chip can never
 * disagree about what a bucket is called.
 */
const BUCKET_TONE: Record<BucketId, string> = {
  overdue: "var(--risk)",
  today: "var(--warn)",
  thisWeek: "var(--info)",
  later: "var(--neutral)",
};

const BUCKET_SHORT: Record<BucketId, string> = {
  overdue: "Past due",
  today: "Due today",
  thisWeek: "This week",
  later: "Later",
};

/** The whole queue, as a fifth reading of the same control. */
type ReadingId = BucketId | "all";

const READING_ORDER: ReadingId[] = ["all", ...BUCKET_ORDER];

const READING_TONE: Record<ReadingId, string> = {
  all: "var(--brand-gold)",
  ...BUCKET_TONE,
};

/**
 * The figures that are true of ONE reading and of no other.
 *
 * This is the part that stops the fix being cosmetic. A lead block that
 * printed the same three labels for every bucket would be the panel it
 * replaced in a smaller box: past the commitment answers "how bad has it
 * got", due today answers "how soon", and later answers "how far out",
 * and those are three different questions with three different figures.
 */
interface ReadingFact {
  label: string;
  value: string;
}

function factsFor(
  id: ReadingId,
  tasks: DerivedTask[],
  buckets: QueueBuckets,
): ReadingFact[] {
  if (id === "all") {
    return BUCKET_ORDER.map((b) => ({
      label: buckets[b].label,
      value: `${buckets[b].tasks.length}`,
    }));
  }

  if (tasks.length === 0) return [];

  const out: ReadingFact[] = [];

  if (id === "overdue") {
    const worst = tasks.reduce(
      (best, t) => ((t.hoursLate ?? 0) > (best.hoursLate ?? 0) ? t : best),
      tasks[0],
    );
    out.push({
      label: "Worst",
      value: `${worst.hoursLate} working hours past due, ${worst.organisationName}`,
    });
    const unanswered = tasks.filter((t) => t.kind === "answer-overdue").length;
    out.push({
      label: "Never answered at all",
      value: `${unanswered} of ${tasks.length}`,
    });
  } else {
    const soonest = tasks.reduce(
      (best, t) => (Date.parse(t.dueAt) < Date.parse(best.dueAt) ? t : best),
      tasks[0],
    );
    const furthest = tasks.reduce(
      (best, t) => (Date.parse(t.dueAt) > Date.parse(best.dueAt) ? t : best),
      tasks[0],
    );
    out.push({
      label: "Soonest",
      value:
        id === "today"
          ? `${formatWhen(soonest.dueAt)}, ${soonest.organisationName}`
          : `${formatDay(soonest.dueAt)}, ${soonest.organisationName}`,
    });
    if (furthest.id !== soonest.id) {
      out.push({
        label: "Last of them",
        value: `${formatDay(furthest.dueAt)}, ${furthest.organisationName}`,
      });
    }
  }

  /* What the reading actually consists of, in the vocabulary the rows
     use. A bucket of eight estimates to chase and a bucket of eight
     unanswered leads are the same digit and not the same morning.
     A tie is reported as a tie: naming one of three equal kinds "most of
     it" would be the page inventing a shape its own data does not have. */
  const byKind = new Map<string, number>();
  for (const t of tasks) byKind.set(t.kind, (byKind.get(t.kind) ?? 0) + 1);
  const ranked = [...byKind.entries()].sort((a, b) => b[1] - a[1]);
  const top = ranked[0];
  if (top) {
    const tied = ranked.filter((r) => r[1] === top[1]).length > 1;
    out.push({
      label: "What it is",
      value: tied
        ? `${byKind.size} kinds of work, none more than ${top[1]}`
        : `${TASK_KIND_META[top[0] as DerivedTask["kind"]].label}, ${top[1]} of ${tasks.length}`,
    });
  }

  return out;
}

/** The short line a bucket prints when it holds nothing. */
const READING_EMPTY: Record<ReadingId, string> = {
  all: "No lead is generating work.",
  overdue: "Nothing is past its due moment.",
  today: "Nothing falls due before the end of today.",
  thisWeek: "Nothing falls due in the next seven days.",
  later: "Nothing sits beyond the next seven days.",
};

// ---------------------------------------------------------------
// The filters, and where they live
// ---------------------------------------------------------------

/**
 * EVERY FILTER ON THIS SCREEN READS OFF THE URL, AND THAT IS A FIX.
 *
 * The bucket used to live in component state. The rail's second level
 * links to `/requests?bucket=overdue`, so the parameter arrived, nothing
 * read it, and the page rendered all twenty seven rows under a rail item
 * that had just promised six. A filter that appears to narrow a screen
 * and does not is worse than no filter at all: the first time a reader
 * notices, they stop believing every other count in the application, and
 * they are right to.
 *
 * The URL is the source of truth for the same three reasons it always
 * is. A link somebody sends lands on the same screen they were looking
 * at. A reload does not throw the reading away. The back button undoes
 * the last narrowing instead of leaving the page entirely, which is what
 * a reader who has just filtered themselves into a corner actually
 * presses.
 *
 * A value the page does not recognise is treated as no filter rather
 * than as an error. `?bucket=yesterday` shows the whole queue, which is
 * the honest reading of a parameter this screen has no partition for,
 * and it means an old link cannot produce an empty table with no
 * explanation on it.
 */
function readParam<T extends string>(
  params: URLSearchParams,
  key: string,
  allowed: readonly T[],
): T | "all" {
  const raw = params.get(key);
  if (!raw) return "all";
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : "all";
}

type SortKey = "rank" | "organisation" | "lane" | "channel" | "clock" | "status";

const SORT_LABEL: Record<SortKey, string> = {
  rank: "Queue order",
  organisation: "Organisation",
  lane: "Lane",
  channel: "Route",
  clock: "Clock",
  status: "Status",
};

// ---------------------------------------------------------------
// One row of the queue
// ---------------------------------------------------------------

/**
 * A queue row, which is either a lead or a membership ask.
 *
 * The membership asks are on this table rather than in a sidebar for one
 * reason: they generate derived tasks, those tasks are counted in the
 * buckets, and a bucket button that promised six rows and delivered five
 * because one of them was a membership ask filed somewhere else would
 * break the only promise this page makes. They carry no channel and no
 * pipeline status, because they genuinely have neither, and the filters
 * say so out loud rather than quietly dropping them.
 */
interface QueueRow {
  id: string;
  kind: "request" | "plan";
  request: GroupRequest | null;
  interest: PlanInterest | null;
  task: DerivedTask | null;
  bucket: BucketId | null;
  prospectId: string | null;
  organisation: string;
  role: string;
  lane: Lane;
  channel: RequestChannel | null;
  status: RequestStatus | null;
  ask: string;
  /** Everything the search box reads. Built once, lowercased once. */
  haystack: string;
}

function organisationOf(
  item: { prospectId: string | null; organisationName: string | null },
): string {
  if (item.prospectId) {
    return PROSPECT_BY_ID[item.prospectId]?.name ?? item.prospectId;
  }
  return item.organisationName ?? "Organisation not recorded";
}

// ---------------------------------------------------------------
// The page
// ---------------------------------------------------------------

export function RequestsPage() {
  const pipeline = usePipeline();
  const book = useBook();

  const [params, setParams] = useSearchParams();

  const lane = readParam<Lane>(params, "lane", LANE_ORDER);
  const status = readParam<RequestStatus>(
    params,
    "status",
    REQUEST_STATUS_ORDER,
  );
  const channel = readParam<RequestChannel>(
    params,
    "channel",
    REQUEST_CHANNEL_ORDER,
  );
  const bucket = readParam<BucketId>(params, "bucket", BUCKET_ORDER);
  const query = params.get("q") ?? "";

  /**
   * One writer for all five, so the URL can never end up holding four of
   * them and dropping the fifth.
   *
   * A filter set to "all" or to an empty string is REMOVED rather than
   * written, which keeps the address bar showing only what is actually
   * narrowing the screen. `/requests?bucket=all&lane=all&q=` and
   * `/requests` are the same reading, and only one of them is a link
   * worth sending somebody.
   *
   * THE HISTORY ENTRY IS THE INTERESTING ARGUMENT. Choosing a bucket or
   * a lane pushes, because that is a decision a person makes once and
   * may well want to take back, and taking it back is what the back
   * button is for. Typing in the search box replaces, because pushing
   * per keystroke would bury the previous screen under eleven entries
   * and turn one press of back into eleven. The search text is still in
   * the URL, so a link carrying a search still works; it simply does not
   * leave a trail behind every letter.
   */
  const setFilters = useCallback(
    (patch: Record<string, string | null>, replace = false) => {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          for (const [key, value] of Object.entries(patch)) {
            if (value === null || value === "all" || value === "") {
              next.delete(key);
            } else {
              next.set(key, value);
            }
          }
          return next;
        },
        { replace },
      );
    },
    [setParams],
  );

  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "rank",
    dir: "desc",
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  /**
   * The compose run.
   *
   * A list rather than a single plan, because the bulk verb on this page
   * is "answer these in turn": the modal opens on the first, and closing
   * it opens the next until the run is done. That is the whole reason
   * the checkboxes exist. A queue that renders a checkbox and then
   * offers nothing to do with a selection is a dead end, and an
   * independent audit of the owner's other prototype called exactly that
   * out, so it is not repeated here.
   */
  const [run, setRun] = useState<{ plans: ComposePlan[]; at: number } | null>(
    null,
  );

  const tableRef = useRef<HTMLDivElement>(null);

  const tasks = useMemo(
    () =>
      derivedTasks(SEED_REQUESTS, SEED_LEAGUE_INTEREST, pipeline, book, {
        now: NOW,
      }),
    [pipeline, book],
  );

  const buckets = useMemo(() => queueBuckets(tasks, { now: NOW }), [tasks]);
  const record = useMemo(() => responseRecord(SEED_REQUESTS, { now: NOW }), []);
  const gap = useMemo(() => qualifyingGap(SEED_REQUESTS), []);

  const laneCounts = useMemo(() => requestsByLane(SEED_REQUESTS), []);
  const statusCounts = useMemo(() => requestsByStatus(SEED_REQUESTS), []);
  const channelCounts = useMemo(() => requestsByChannel(SEED_REQUESTS), []);

  /** Which bucket each task landed in. One map, so nothing can disagree. */
  const bucketOfTask = useMemo(() => {
    const m = new Map<string, BucketId>();
    for (const id of BUCKET_ORDER) {
      for (const t of buckets[id].tasks) m.set(t.id, id);
    }
    return m;
  }, [buckets]);

  const taskByItem = useMemo(() => {
    const m = new Map<string, DerivedTask>();
    for (const t of tasks) m.set(t.requestId, t);
    return m;
  }, [tasks]);

  /** Every row on the board, before any filter touches it. */
  const rows = useMemo<QueueRow[]>(() => {
    const out: QueueRow[] = [];

    for (const r of SEED_REQUESTS) {
      const task = taskByItem.get(r.id) ?? null;
      const organisation = organisationOf(r);
      out.push({
        id: r.id,
        kind: "request",
        request: r,
        interest: null,
        task,
        bucket: task ? (bucketOfTask.get(task.id) ?? null) : null,
        prospectId: r.prospectId,
        organisation,
        role: r.contactRole,
        lane: r.lane,
        channel: r.channel,
        status: r.status,
        ask: r.askSummary,
        haystack: [
          organisation,
          r.contactRole,
          r.askSummary,
          r.note,
          LANE_META[r.lane].label,
          REQUEST_CHANNEL_META[r.channel].label,
          REQUEST_STATUS_META[r.status].label,
          r.eventType ?? "",
        ]
          .join(" ")
          .toLowerCase(),
      });
    }

    for (const l of SEED_LEAGUE_INTEREST) {
      const task = taskByItem.get(l.id) ?? null;
      const organisation = organisationOf(l);
      out.push({
        id: l.id,
        kind: "plan",
        request: null,
        interest: l,
        task,
        bucket: task ? (bucketOfTask.get(task.id) ?? null) : null,
        prospectId: l.prospectId,
        organisation,
        role: l.contactRole,
        lane: l.lane,
        channel: null,
        status: null,
        ask: `Membership ask, ${l.preferredNights.join(" and ")}`,
        haystack: [
          organisation,
          l.contactRole,
          l.note,
          "membership programme",
          LANE_META[l.lane].label,
        ]
          .join(" ")
          .toLowerCase(),
      });
    }

    return out;
  }, [taskByItem, bucketOfTask]);

  /**
   * The rows a channel or status filter cannot describe.
   *
   * Counted rather than silently dropped. A filter that hides three
   * membership asks without saying so is the same bug as a bucket that
   * does not add up, only quieter.
   */
  const excludedLeague = useMemo(() => {
    if (channel === "all" && status === "all") return 0;
    return rows.filter((r) => r.kind === "plan").length;
  }, [rows, channel, status]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = rows.filter((r) => {
      if (lane !== "all" && r.lane !== lane) return false;
      if (status !== "all" && r.status !== status) return false;
      if (channel !== "all" && r.channel !== channel) return false;
      if (bucket !== "all" && r.bucket !== bucket) return false;
      if (q && !r.haystack.includes(q)) return false;
      return true;
    });

    const dir = sort.dir === "asc" ? 1 : -1;
    const rank = (r: QueueRow) => (r.task ? r.task.score : -1);
    const clock = (r: QueueRow) =>
      r.task ? Date.parse(r.task.dueAt) : Number.MAX_SAFE_INTEGER;

    return [...out].sort((a, b) => {
      let cmp = 0;
      switch (sort.key) {
        case "rank":
          cmp = rank(a) - rank(b);
          break;
        case "organisation":
          cmp = a.organisation.localeCompare(b.organisation);
          break;
        case "lane":
          cmp = LANE_ORDER.indexOf(a.lane) - LANE_ORDER.indexOf(b.lane);
          break;
        case "channel":
          cmp =
            (a.channel ? REQUEST_CHANNEL_ORDER.indexOf(a.channel) : 99) -
            (b.channel ? REQUEST_CHANNEL_ORDER.indexOf(b.channel) : 99);
          break;
        case "clock":
          /* Ascending on the clock means soonest first, which is the
             reading a person wants, so this one comparison is flipped
             against the others rather than making every caller remember
             that "ascending time" is "descending urgency". */
          cmp = clock(b) - clock(a);
          break;
        case "status":
          cmp =
            (a.status ? REQUEST_STATUS_ORDER.indexOf(a.status) : 99) -
            (b.status ? REQUEST_STATUS_ORDER.indexOf(b.status) : 99);
          break;
      }
      if (cmp !== 0) return cmp * dir;
      /* A stable third comparison so equal rows never reshuffle between
         renders. A list that wobbles makes a reader doubt the rows that
         did not move. */
      return a.id.localeCompare(b.id);
    });
  }, [rows, lane, status, channel, bucket, query, sort]);

  const visibleIds = useMemo(() => filtered.map((r) => r.id), [filtered]);
  const selectedInView = useMemo(
    () => selected.filter((id) => visibleIds.includes(id)),
    [selected, visibleIds],
  );
  const selectedRows = useMemo(
    () => rows.filter((r) => selected.includes(r.id)),
    [rows, selected],
  );
  const composable = useMemo(
    () => selectedRows.filter((r) => r.prospectId !== null),
    [selectedRows],
  );

  /**
   * The row the pager is standing on.
   *
   * Held here rather than in the URL, and the reasoning is the same one
   * the map board writes down about its selection: a position in a queue
   * changes on every press of Next, and putting each of those in the
   * address bar would put nineteen entries behind one pass through the
   * queue and turn the back button into an undo nobody asked for. The
   * FILTER is the shareable thing and it is in the URL; the place inside
   * the filtered set is a thing you are doing right now.
   *
   * It is read back through the visible ids on every render, so a row
   * that a filter has just removed stops being the current record
   * instead of staying marked somewhere off screen.
   */
  const [pickedId, setPickedId] = useState<string | null>(null);
  const currentId =
    pickedId !== null && visibleIds.includes(pickedId) ? pickedId : null;
  useRecordFocus(currentId);

  /**
   * The export, over exactly what is on screen.
   *
   * Not over the whole queue. A person who has filtered to eleven
   * overdue rows and presses an export that hands them twenty seven has
   * been given a file that disagrees with the screen they were looking
   * at, and they will not find out until somebody else opens it. The
   * filename carries the filter for the same reason.
   */
  const exportCsv = useCallback(() => {
    const csv = toCsv(
      [
        "Organisation",
        "Role",
        "Lane",
        "Arrived through",
        "Status",
        "Clock",
        "Due",
        "Working hours late",
        "What they asked for",
        "Next action",
      ],
      filtered.map((r) => [
        r.organisation,
        r.role,
        LANE_META[r.lane].label,
        r.channel ? REQUEST_CHANNEL_META[r.channel].label : "Membership ask",
        r.status ? REQUEST_STATUS_META[r.status].label : "Not a pipeline row",
        r.bucket ? BUCKET_SHORT[r.bucket] : "No clock",
        r.task ? r.task.dueAt : "",
        r.task && r.task.hoursLate !== null ? r.task.hoursLate : "",
        r.ask,
        r.task ? r.task.action : "",
      ]),
    );
    downloadCsv(
      bucket === "all" ? "inbound-queue" : `inbound-queue-${bucket}`,
      csv,
    );
  }, [filtered, bucket]);

  const filtersOn =
    lane !== "all" ||
    status !== "all" ||
    channel !== "all" ||
    bucket !== "all" ||
    query.trim() !== "";

  const clearAll = useCallback(() => {
    setFilters({
      lane: null,
      status: null,
      channel: null,
      bucket: null,
      q: null,
    });
  }, [setFilters]);

  /** The clipboard, with one live region reporting what happened. */
  const copy = useCallback(async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setNotice(`Copied ${what}.`);
    } catch {
      setNotice(
        `This browser did not grant clipboard access, so ${what} was not copied. Nothing else changed.`,
      );
    }
  }, []);

  const openRow = useMemo(
    () => rows.find((r) => r.id === openId) ?? null,
    [rows, openId],
  );

  const subject: RequestSubject | null = openRow
    ? openRow.kind === "request" && openRow.request
      ? { kind: "request", request: openRow.request, task: openRow.task }
      : openRow.interest
        ? { kind: "plan", interest: openRow.interest, task: openRow.task }
        : null
    : null;

  const startRun = useCallback((plans: ComposePlan[]) => {
    if (plans.length === 0) return;
    setRun({ plans, at: 0 });
  }, []);

  const advanceRun = useCallback(() => {
    setRun((current) => {
      if (!current) return null;
      const next = current.at + 1;
      if (next >= current.plans.length) return null;
      return { plans: current.plans, at: next };
    });
  }, []);

  const active = run ? run.plans[run.at] : null;
  const activeProspect = active ? (PROSPECT_BY_ID[active.prospectId] ?? null) : null;

  const total = buckets.all.length;
  const bucketSum = BUCKET_ORDER.reduce(
    (n, id) => n + buckets[id].tasks.length,
    0,
  );

  /**
   * The reading currently on screen, as the lead block needs it.
   *
   * Derived from the same `bucket` the URL holds and the same `buckets`
   * the table filters on, so the block at the top of the page and the
   * rows at the bottom of it cannot describe different sets. That was
   * the failure mode worth designing out: a summary computed on its own
   * is a summary that eventually disagrees with the list under it.
   */
  const readingTasks = bucket === "all" ? buckets.all : buckets[bucket].tasks;
  const readingFacts = useMemo(
    () => factsFor(bucket, readingTasks, buckets),
    [bucket, readingTasks, buckets],
  );

  /**
   * What the live region says when the reading changes.
   *
   * Written the way a person would read it out rather than as a label
   * dump: the set, the size, the one figure that characterises it and
   * the first organisation by name. A screen reader user gets the same
   * four facts a sighted reader gets from the block, in the same order.
   */
  const announcement = useMemo(() => {
    const label = bucket === "all" ? "The whole queue" : buckets[bucket].label;
    const parts = [
      `${label}.`,
      bucket === "all"
        ? `${rows.length} rows, ${total} of them generating work.`
        : `${readingTasks.length} of ${rows.length} rows.`,
    ];
    if (readingFacts[0]) {
      parts.push(`${readingFacts[0].label}: ${readingFacts[0].value}.`);
    }
    if (readingTasks[0]) {
      parts.push(`First is ${readingTasks[0].organisationName}.`);
    } else {
      parts.push(READING_EMPTY[bucket]);
    }
    return parts.join(" ");
  }, [bucket, buckets, readingTasks, readingFacts, total, rows]);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/*
          THE BAND, AND WHAT EACH SLOT IS DOING HERE.

          The breadcrumb carries the bucket as its last crumb, so a
          reader who arrived from the rail's second level can see which
          promise the rail made before they count a single row.

          The context control is the bucket, because the bucket is the
          one filter on this screen that the rail also sets. A reader who
          landed here from a rail link and wants a different bucket
          should not have to go back to the rail to get one.

          The pager walks the rows the filters left behind, and the
          export hands over the same set.
        */}
        <PageHeader
          filterCrumb={bucket === "all" ? undefined : buckets[bucket].label}
          context={
            <ContextSelect
              id="requests-bucket"
              label="Bucket"
              value={bucket}
              options={[
                /*
                  "Everything" counts ROWS and the four buckets count
                  PIECES OF WORK, and the two figures are different on
                  purpose: a closed lead is still a row on this table
                  and it has no clock, so it belongs in no bucket. The
                  control counts what selecting it will actually put on
                  screen, which is the only figure a reader can check.
                */
                { value: "all", label: "Everything", count: rows.length },
                ...BUCKET_ORDER.map((id) => ({
                  value: id,
                  label: buckets[id].label,
                  count: buckets[id].tasks.length,
                })),
              ]}
              onChange={(value) => setFilters({ bucket: value })}
            />
          }
          pager={
            <RecordPager
              ids={visibleIds}
              currentId={currentId}
              onChange={setPickedId}
              noun={["row", "rows"]}
              setLabel="in this queue"
            />
          }
          actions={
            <Button size="sm" glyph="▤" onClick={exportCsv}>
              Export {filtered.length} as CSV
            </Button>
          }
        />

        {/*
          THE HEAD IS THREE LINES NOW AND IT USED TO BE SIX.

          The page identity is invariant by definition and it is allowed
          to be, so it is allowed to be SMALL. The reading moment and the
          provenance badge are both facts about every row here, so they
          share one line instead of holding a panel each. What that buys
          is roughly a hundred and twenty pixels of the first screenful,
          spent on the block underneath that actually changes.
        */}
        <header className={styles.head}>
          <p className={styles.eyebrow}>The inbound half</p>
          <h1 className={styles.h1}>Requests</h1>
          <p className={styles.subLede}>
            <span
              title="The reading moment is fixed rather than taken off the machine, so the overdue count is the same figure in any month and any timezone."
            >
              <span className="num">{SEED_REQUESTS.length}</span> leads,{" "}
              <span className="num">{SEED_LEAGUE_INTEREST.length}</span>{" "}
              membership asks, read at{" "}
              <span className="num">{formatWhen(NOW)}</span> local time
            </span>
            <span
              className={styles.provenanceInline}
              title="Leads written for this work sample. Each row carries the field set of the route it arrived through, which is this console's own reading of how LSA, web forms, calls, marketplaces and referrals behave rather than a schema quoted off a page. Contact addresses sit on the .invalid domain, which RFC 2606 reserves so it can never resolve."
            >
              <ProvenanceBadge provenance="illustrative" />
              <span>Written for this work sample, route by route</span>
            </span>
          </p>
        </header>

        {/* ---------------------------------------------------------
            THE CONTROL, AND DIRECTLY UNDER IT THE ANSWER.

            The press and its consequence are within a hundred pixels of
            each other, which is the whole repair. The select in the band
            above sets the same parameter and so does the rail; all three
            write the URL and read it back, so none of them can disagree
            about which bucket is on.
            --------------------------------------------------------- */}
        <SegmentedFilter
          label="Bucket"
          value={bucket}
          countLabel="rows"
          segments={READING_ORDER.map((id) => ({
            value: id,
            label: id === "all" ? "Everything" : buckets[id].label,
            glyph: id === "all" ? "Σ" : buckets[id].glyph,
            /*
              EVERY SEGMENT COUNTS THE ROWS IT WILL PUT ON THE TABLE, and
              that is why "Everything" is the larger figure. A closed
              lead is still a row here and it has no clock, so it
              belongs to no bucket; the four bucket counts are therefore
              pieces of work and they are also, exactly, the rows each
              button lands on. The select in the band counts the same way,
              so two controls setting the same parameter cannot show two
              different numbers. The sum line below states the difference
              in figures rather than leaving it to be noticed.
            */
            count: id === "all" ? rows.length : buckets[id].tasks.length,
            tone: READING_TONE[id],
          }))}
          onChange={(value) => setFilters({ bucket: value })}
        />

        <WorkingSetLead
          headingId="working-set-h"
          changeKey={bucket}
          kicker="On screen now"
          glyph={bucket === "all" ? "Σ" : buckets[bucket].glyph}
          label={bucket === "all" ? "The whole queue" : buckets[bucket].label}
          tone={READING_TONE[bucket]}
          count={bucket === "all" ? rows.length : readingTasks.length}
          total={rows.length}
          noun={["row", "rows"]}
          facts={readingFacts.map((f, i) => ({
            label: f.label,
            value: f.value,
            /* The clock figures are derived from leads written for
               this work sample, so the first of them carries the badge
               that says so. The commitment those clocks are measured
               against keeps its own badge in the record below. */
            qualifier:
              i === 0 && bucket !== "all" ? (
                <ProvenanceBadge provenance="illustrative" compact />
              ) : undefined,
          }))}
          rows={readingTasks.slice(0, 3).map((t) => ({
            id: t.id,
            name: t.organisationName,
            kind: TASK_KIND_META[t.kind].label,
            when:
              t.hoursLate !== null ? (
                <>
                  <span className="num">{t.hoursLate}</span> working hours past{" "}
                  <span className="num">{formatDay(t.dueAt)}</span>
                </>
              ) : (
                <>
                  due <span className="num">{formatWhen(t.dueAt)}</span>
                </>
              ),
            onOpen: () => setOpenId(t.requestId),
            openLabel: "Open",
          }))}
          emptyLine={READING_EMPTY[bucket]}
          announcement={announcement}
          actions={
            readingTasks.length > 0 && bucket !== "all" ? (
              <Button
                size="sm"
                glyph="✕"
                onClick={() => setFilters({ bucket: null })}
              >
                Show the whole queue, all {total}
              </Button>
            ) : undefined
          }
        />

        {/* The partition check, kept from the bucket cards it outlived.
            Four counts, their sum and the total, on one line: a reader
            can hold this page to its arithmetic in about two seconds,
            and a bucket set that does not add up is exactly how work
            goes missing. */}
        <p className={styles.sum}>
          <span aria-hidden="true">Σ</span>
          <span>
            <span className="num">
              {BUCKET_ORDER.map((id) => buckets[id].tasks.length).join(
                " plus ",
              )}
            </span>{" "}
            makes <span className="num">{bucketSum}</span> of{" "}
            <span className="num">{total}</span> pieces of work
            {bucketSum === total
              ? ""
              : ". These disagree, which means a task has fallen out of the partition."}
            {rows.length > total ? (
              <>
                . <span className="num">{rows.length - total}</span> further
                rows are closed and carry no clock, which is why Everything
                counts <span className="num">{rows.length}</span>
              </>
            ) : null}
          </span>
        </p>

        {total === 0 ? (
          /* THE INBOUND QUEUE, WORKED TO NOTHING. Every lead with a
             clock on it has an answer against it, which is the single
             outcome this screen exists to produce. The figure beside the
             strike is the count that earned it. */
          <ClearedBoard
            headline="Nothing waiting"
            figure={`${record.answered} answered`}
          />
        ) : null}


        {/* ---------------------------------------------------------
            THE QUEUE ITSELF.
            --------------------------------------------------------- */}
        <section className={styles.queue} aria-labelledby="queue-h" ref={tableRef}>
          <div className={styles.sectionHead}>
            <h2 className={styles.h2} id="queue-h">
              The queue
            </h2>

          </div>

          {/* --- Filters ------------------------------------------- */}
          <div className={styles.filters}>
            <label className={styles.filter}>
              <span className={styles.filterLabel}>Search</span>
              <input
                className={styles.search}
                type="search"
                value={query}
                placeholder="Organisation, role, what they asked for"
                onChange={(e) => setFilters({ q: e.target.value }, true)}
              />
            </label>

            <label className={styles.filter}>
              <span className={styles.filterLabel}>Lane</span>
              <select
                className={styles.select}
                value={lane}
                onChange={(e) => setFilters({ lane: e.target.value })}
              >
                <option value="all">
                  Every lane ({SEED_REQUESTS.length})
                </option>
                {LANE_ORDER.filter((l) => laneCounts[l] > 0).map((l) => (
                  <option key={l} value={l}>
                    {LANE_META[l].label} ({laneCounts[l]})
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.filter}>
              <span className={styles.filterLabel}>Status</span>
              <select
                className={styles.select}
                value={status}
                onChange={(e) => setFilters({ status: e.target.value })}
              >
                <option value="all">
                  Every status ({SEED_REQUESTS.length})
                </option>
                {REQUEST_STATUS_ORDER.filter((s) => statusCounts[s] > 0).map(
                  (s) => (
                    <option key={s} value={s}>
                      {REQUEST_STATUS_META[s].glyph} {REQUEST_STATUS_META[s].label}{" "}
                      ({statusCounts[s]})
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className={styles.filter}>
              <span className={styles.filterLabel}>Arrived through</span>
              <select
                className={styles.select}
                value={channel}
                onChange={(e) => setFilters({ channel: e.target.value })}
              >
                <option value="all">
                  Every route ({SEED_REQUESTS.length})
                </option>
                {REQUEST_CHANNEL_ORDER.filter((c) => channelCounts[c] > 0).map(
                  (c) => (
                    <option key={c} value={c}>
                      {REQUEST_CHANNEL_META[c].glyph}{" "}
                      {REQUEST_CHANNEL_META[c].label} ({channelCounts[c]})
                    </option>
                  ),
                )}
              </select>
            </label>

            <div className={styles.filter}>
              <span className={styles.filterLabel}>
                Sorted by {SORT_LABEL[sort.key].toLowerCase()},{" "}
                {sort.dir === "desc" ? "highest first" : "lowest first"}
              </span>
              <Button
                size="sm"
                glyph={sort.key === "rank" ? "●" : "○"}
                aria-pressed={sort.key === "rank"}
                onClick={() => setSort({ key: "rank", dir: "desc" })}
              >
                Back to queue order
              </Button>
            </div>
          </div>

          <p className={styles.counts} aria-live="polite">
            Showing <span className="num">{filtered.length}</span> of{" "}
            <span className="num">{rows.length}</span> rows.{" "}
            {bucket !== "all" ? (
              <>
                Bucket filter on: <strong>{buckets[bucket].label}</strong>,
                which counted{" "}
                <span className="num">{buckets[bucket].tasks.length}</span>.{" "}
              </>
            ) : null}
            {excludedLeague > 0 ? (
              <>
                <span className="num">{excludedLeague}</span> membership asks
                out of view.{" "}
              </>
            ) : null}
            {selected.length > 0 ? (
              <>
                <span className="num">{selected.length}</span> selected,{" "}
                <span className="num">{selectedInView.length}</span> of them in
                view.
              </>
            ) : null}
          </p>

          {/* The control that undoes every narrowing sits with the count
              it explains, and not only inside the empty state, because a
              filter that has hidden eighteen of twenty seven rows is
              worth being able to drop before it hides all of them. */}
          {filtersOn ? (
            <p className={styles.clearRow}>
              <Button size="sm" glyph="✕" onClick={clearAll}>
                Clear every filter and show all {rows.length}
              </Button>
            </p>
          ) : null}

          {/* --- Bulk verbs ---------------------------------------- */}
          {selected.length > 0 ? (
            <div className={styles.bulk}>
              <p className={styles.bulkCount}>
                <span className={`${styles.bulkValue} num`}>
                  {selected.length}
                </span>
                <span>selected</span>
              </p>
              <div className={styles.bulkActions}>
                <Button
                  variant="primary"
                  size="sm"
                  glyph="✉"
                  disabled={composable.length === 0}
                  onClick={() =>
                    startRun(
                      composable.map((r) => ({
                        prospectId: r.prospectId as string,
                        intent:
                          r.request?.status === "held"
                            ? "reserve-party"
                            : "free",
                        packageId: r.request?.suggestedPackageId ?? undefined,
                      })),
                    )
                  }
                >
                  {composable.length === 0
                    ? "None of these has a prospect record"
                    : `Answer ${composable.length} of ${selected.length} in turn`}
                </Button>
                <Button
                  size="sm"
                  glyph="▤"
                  onClick={() =>
                    copy(
                      selectedRows
                        .map((r) =>
                          r.request
                            ? callListLine(r.request)
                            : `${r.organisation}\n${r.role}\nMembership ask: ${r.interest?.preferredNights.join(" and ")}`,
                        )
                        .join("\n\n"),
                      `${selected.length} rows as a call list`,
                    )
                  }
                >
                  Copy {selected.length} as a call list
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  glyph="✕"
                  onClick={() => setSelected([])}
                >
                  Clear the selection
                </Button>
              </div>
            </div>
          ) : null}

          {/* --- The table ----------------------------------------- */}
          {filtered.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyHead}>
                <span aria-hidden="true">○</span> No row matches the filters
                that are on.
              </p>
              <p className={styles.emptyBody}>
                Filters currently narrowing the board:
              </p>
              <div className={styles.emptyChips}>
                {lane !== "all" ? (
                  <Button
                    size="sm"
                    glyph="✕"
                    onClick={() => setFilters({ lane: null })}
                  >
                    Lane: {LANE_META[lane].label}
                  </Button>
                ) : null}
                {status !== "all" ? (
                  <Button
                    size="sm"
                    glyph="✕"
                    onClick={() => setFilters({ status: null })}
                  >
                    Status: {REQUEST_STATUS_META[status].label}
                  </Button>
                ) : null}
                {channel !== "all" ? (
                  <Button
                    size="sm"
                    glyph="✕"
                    onClick={() => setFilters({ channel: null })}
                  >
                    Route: {REQUEST_CHANNEL_META[channel].label}
                  </Button>
                ) : null}
                {bucket !== "all" ? (
                  <Button
                    size="sm"
                    glyph="✕"
                    onClick={() => setFilters({ bucket: null })}
                  >
                    Bucket: {buckets[bucket].label}
                  </Button>
                ) : null}
                {query.trim() !== "" ? (
                  <Button
                    size="sm"
                    glyph="✕"
                    onClick={() => setFilters({ q: null })}
                  >
                    Search: {query.trim()}
                  </Button>
                ) : null}
                <Button variant="primary" size="sm" glyph="◆" onClick={clearAll}>
                  Clear everything and show all {rows.length}
                </Button>
              </div>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <caption className="visually-hidden">
                  Inbound leads and membership asks, {filtered.length} of{" "}
                  {rows.length} shown, sorted by {SORT_LABEL[sort.key]}.
                </caption>
                <thead>
                  <tr>
                    <th scope="col" className={styles.checkCell}>
                      <label className={styles.checkLabel}>
                        <input
                          type="checkbox"
                          className={styles.check}
                          checked={
                            selectedInView.length === filtered.length &&
                            filtered.length > 0
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelected((prev) => [
                                ...prev.filter((id) => !visibleIds.includes(id)),
                                ...visibleIds,
                              ]);
                            } else {
                              setSelected((prev) =>
                                prev.filter((id) => !visibleIds.includes(id)),
                              );
                            }
                          }}
                        />
                        <span className="visually-hidden">
                          Select all {filtered.length} rows in view
                        </span>
                      </label>
                    </th>
                    {(
                      [
                        ["organisation", "Organisation"],
                        ["lane", "Lane"],
                        ["channel", "Arrived through"],
                      ] as [SortKey, string][]
                    ).map(([key, label]) => (
                      <th
                        key={key}
                        scope="col"
                        aria-sort={
                          sort.key === key
                            ? sort.dir === "asc"
                              ? "ascending"
                              : "descending"
                            : "none"
                        }
                      >
                        <button
                          type="button"
                          className={styles.sortBtn}
                          onClick={() =>
                            setSort((s) =>
                              s.key === key
                                ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
                                : { key, dir: key === "rank" ? "desc" : "asc" },
                            )
                          }
                        >
                          <span>{label}</span>
                          <span className={styles.sortMark} aria-hidden="true">
                            {sort.key === key
                              ? sort.dir === "asc"
                                ? "▲"
                                : "▼"
                              : "▫"}
                          </span>
                        </button>
                      </th>
                    ))}
                    <th scope="col">What they asked for</th>
                    {(
                      [
                        ["clock", "Clock"],
                        ["status", "Status"],
                      ] as [SortKey, string][]
                    ).map(([key, label]) => (
                      <th
                        key={key}
                        scope="col"
                        aria-sort={
                          sort.key === key
                            ? sort.dir === "asc"
                              ? "ascending"
                              : "descending"
                            : "none"
                        }
                      >
                        <button
                          type="button"
                          className={styles.sortBtn}
                          onClick={() =>
                            setSort((s) =>
                              s.key === key
                                ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
                                : { key, dir: "asc" },
                            )
                          }
                        >
                          <span>{label}</span>
                          <span className={styles.sortMark} aria-hidden="true">
                            {sort.key === key
                              ? sort.dir === "asc"
                                ? "▲"
                                : "▼"
                              : "▫"}
                          </span>
                        </button>
                      </th>
                    ))}
                    <th scope="col">Next action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <QueueTableRow
                      key={row.id}
                      row={row}
                      current={row.id === currentId}
                      selected={selected.includes(row.id)}
                      onToggle={() =>
                        setSelected((prev) =>
                          prev.includes(row.id)
                            ? prev.filter((id) => id !== row.id)
                            : [...prev, row.id],
                        )
                      }
                      onOpen={() => setOpenId(row.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className={styles.legend}>
            <span className={styles.legendTitle}>Reading a clock cell</span>
            {BUCKET_ORDER.map((id) => (
              <span key={id} className={styles.legendItem}>
                <span
                  className={styles.legendGlyph}
                  aria-hidden="true"
                  style={{ ["--tone" as string]: BUCKET_TONE[id] }}
                >
                  {buckets[id].glyph}
                </span>
                {BUCKET_SHORT[id]}
              </span>
            ))}
            <span className={styles.legendItem}>
              <span className={styles.legendGlyph} aria-hidden="true">
                ✓
              </span>
              Closed, no clock
            </span>
          </p>
        </section>

        {/* ---------------------------------------------------------
            THE COMMITMENT, AND WHOSE IT IS.

            It sits here rather than above the buckets, and the move is
            the point of this screen's last revision. The block is a
            standing fact about the desk: four working hours, the same
            four on every bucket, so holding the top of the screen it
            made every filter look inert. Under the queue it lands where
            it is asked for, one line below the legend that reads a clock
            cell, which is the moment a reader actually wants to know
            whose clock they have just been shown.

            NOTHING WAS DROPPED IN THE MOVE. The provenance badge, the
            disclosure and all four record figures came with it, and the
            disclosure still sits in the same block as the number rather
            than in a footnote.
            --------------------------------------------------------- */}
        <section
          className={styles.commitment}
          id="response-record"
          aria-labelledby="commitment-h"
        >
          <div className={styles.commitmentHead}>
            <h2 className={styles.h2} id="commitment-h">
              The response commitment
            </h2>
            <ProvenanceBadge provenance={RESPONSE_COMMITMENT.provenance} />
          </div>

          <div className={styles.commitmentGrid}>
            <p className={styles.commitmentFigure}>
              <span className={`${styles.commitmentValue} num`}>
                {RESPONSE_COMMITMENT.hours}
              </span>
              <span className={styles.commitmentUnit}>
                working hours, 9am to 6pm in the territory, weekends
                included
              </span>
            </p>
            <div className={styles.commitmentText}>
              <p className={styles.commitmentDisclosure}>
                <span aria-hidden="true">◇</span>
                <span>{RESPONSE_COMMITMENT.disclosure}</span>
              </p>
            </div>
          </div>

          <div className={styles.recordRow}>
            <div className={styles.recordFigure}>
              <span className={`${styles.recordValue} num`}>
                {record.met} of {record.answered}
              </span>
              <span className={styles.recordLabel}>
                answered inside the commitment
                <ProvenanceBadge provenance="illustrative" compact />
              </span>
            </div>
            <div className={styles.recordFigure}>
              <span className={`${styles.recordValue} num`}>
                {record.medianWorkingHours === null
                  ? "No figure"
                  : `${record.medianWorkingHours} h`}
              </span>
              <span className={styles.recordLabel}>
                median working hours to a first reply
                <ProvenanceBadge provenance="modeled" compact />
              </span>
            </div>
            <div className={styles.recordFigure}>
              <span className={`${styles.recordValue} num`}>
                {record.slowestWorkingHours === null
                  ? "No figure"
                  : `${record.slowestWorkingHours} h`}
              </span>
              <span className={styles.recordLabel}>
                slowest reply
                <ProvenanceBadge provenance="modeled" compact />
              </span>
            </div>
            <div className={styles.recordFigure}>
              <span className={`${styles.recordValue} num`}>{record.lapsed}</span>
              <span
                className={styles.recordLabel}
                title="Never answered, and counted in neither figure to the left. Every one of these was billed for on the day it arrived."
              >
                never answered
                <ProvenanceBadge provenance="illustrative" compact />
              </span>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------
            THE QUALIFYING GAP. The strongest finding in the research
            and the commercial argument for this screen.
            --------------------------------------------------------- */}
        <section className={styles.gap} aria-labelledby="gap-h">
          <div className={styles.sectionHead}>
            <h2 className={styles.h2} id="gap-h">
              What the route did not ask for
            </h2>
            {/* How each route behaves is this console's own reading rather
                than a schema quoted off a page, so the badge here says
                illustrative and the sentence says which routes it means. */}
            <p
              className={styles.sectionNote}
              title="A Google Local Services Ad hands over a name, a phone number and one of Google's broad categories. It hands over no property address, no preferred window and no job a technician could be dispatched against. The brand's own web form asks for all three, because the brand wrote the questions. No brand or platform publishes its intake schema, so these field sets are this console's reading of how the routes behave."
            >
              A Local Services Ad carries no window, no property detail and no
              job type. The brand's own web form asks for all three.
              <ProvenanceBadge provenance="illustrative" compact />
            </p>
          </div>

          <ul className={styles.gapRows}>
            {gap.rows.map((row) => {
              const asked = row.missing - row.neverAsked;
              const pct = gap.open === 0 ? 0 : (row.missing / gap.open) * 100;
              return (
                <li key={row.field} className={styles.gapRow}>
                  <p className={styles.gapRowHead}>
                    <span className={styles.gapField}>{row.label}</span>
                    <span className={`${styles.gapMissing} num`}>
                      {row.missing} of {gap.open}
                    </span>
                  </p>
                  {/* The bar is a second reading of the number beside it and
                      never the only one. Every bar in this application
                      carries its own figure. */}
                  <span
                    className={styles.gapBar}
                    role="img"
                    aria-label={`${row.missing} of ${gap.open} open leads are missing the ${row.label.toLowerCase()}`}
                  >
                    <span
                      className={styles.gapBarNeverAsked}
                      style={{
                        width: `${gap.open === 0 ? 0 : (row.neverAsked / gap.open) * 100}%`,
                      }}
                    />
                    <span
                      className={styles.gapBarBlank}
                      style={{
                        width: `${gap.open === 0 ? 0 : (asked / gap.open) * 100}%`,
                      }}
                    />
                  </span>
                  <p className={styles.gapSplit}>
                    <span className={styles.gapKey}>
                      <span
                        className={styles.gapSwatchNeverAsked}
                        aria-hidden="true"
                      >
                        ⊘
                      </span>
                      <span className="num">{row.neverAsked}</span> never
                      asked for by the route
                    </span>
                    <span className={styles.gapKey}>
                      <span className={styles.gapSwatchBlank} aria-hidden="true">
                        ○
                      </span>
                      <span className="num">{asked}</span> asked for, left
                      empty
                    </span>
                    <span className={styles.gapKey}>
                      <span aria-hidden="true">▪</span>{" "}
                      <span className="num">{Math.round(pct)}%</span> of open
                      leads
                    </span>
                  </p>
                  <p className={styles.gapNote}>{row.note}</p>
                </li>
              );
            })}
          </ul>

          <p className={styles.gapHeadline} aria-live="polite">
            <strong>
              <span className="num">{gap.qualified}</span> of{" "}
              <span className="num">{gap.open}</span> open leads can be priced
              without a phone call first.
            </strong>{" "}
            {gap.headline}
          </p>
        </section>

        {/* The one live region for anything this page does that is not a
            navigation. Counts that move carry their own aria-live where
            they sit; this reports the clipboard and the compose run. */}
        <p className={styles.notice} role="status" aria-live="polite">
          {run
            ? `Answering ${run.at + 1} of ${run.plans.length}. Closing the compose window opens the next.`
            : notice}
        </p>
      </div>

      {subject ? (
        <RequestDrawer
          subject={subject}
          onClose={() => setOpenId(null)}
          onCompose={(plan) => startRun([plan])}
          onCopy={copy}
        />
      ) : null}

      {/*
        ONE MODAL, ONE INSTANCE, ONE OWNER, exactly as the map board does
        it. The drawer raises an intent and never imports this component:
        a modal rendered from inside the drawer would be unmounted the
        moment the drawer closed underneath it, and two copies would trap
        focus in whichever one the browser reached first.
      */}
      <EmailComposeModal
        prospect={activeProspect}
        intent={active?.intent}
        packageId={active?.packageId}
        onClose={advanceRun}
      />
    </div>
  );
}

// ---------------------------------------------------------------
// One row
// ---------------------------------------------------------------

function QueueTableRow({
  row,
  current,
  selected,
  onToggle,
  onOpen,
}: {
  row: QueueRow;
  /** The row the pager is standing on. Marked, never merely tinted. */
  current: boolean;
  selected: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const status = row.status ? REQUEST_STATUS_META[row.status] : null;
  const channel = row.channel ? REQUEST_CHANNEL_META[row.channel] : null;
  const missing = row.request ? missingQualifiers(row.request) : [];
  const unasked = row.request ? unaskedQualifiers(row.request) : [];

  return (
    /*
      THE CURRENT ROW CARRIES A MARK, A WORD AND ONLY THEN A TINT. The
      rule bars colour from being the only signal, and a highlighted row
      is the classic place it gets broken. So the row gains a rule down
      its leading edge, the organisation cell gains the words "you are
      here", and aria-current says the same thing to a screen reader. It
      also takes tabindex -1 so the pager can hand it focus, which is
      what makes the queue walkable from the keyboard.
    */
    <tr
      data-request-id={row.id}
      data-record-id={row.id}
      data-bucket={row.bucket ?? "none"}
      className={current ? styles.currentRow : undefined}
      aria-current={current ? "true" : undefined}
      tabIndex={-1}
    >
      <td className={styles.checkCell}>
        <label className={styles.checkLabel}>
          <input
            type="checkbox"
            className={styles.check}
            checked={selected}
            onChange={onToggle}
          />
          <span className="visually-hidden">Select {row.organisation}</span>
        </label>
      </td>

      <td data-label="Organisation">
        {/*
          ── TWO THINGS TO OPEN, SO TWO CONTROLS ──────────────────

          This cell used to be a single button whose words were the
          organisation and whose action was to open the REQUEST. Those
          are not the same object: a request is one enquiry with a clock
          on it, and the organisation behind it has a history, a status
          and an offer extended that outlive this row entirely.

          So the name opens the record, which is what the owner asked
          for and what pressing a business name means everywhere else in
          this application, and the request keeps its own named control
          underneath. Neither is inside the other. The row itself is
          still not clickable: a click handler on a table row gives a
          keyboard reader nothing to focus and a screen reader nothing
          to announce, and it steals the checkbox press as well.

          A household with no row in the trade area file has no record
          to open, so its name stays as words.
        */}
        <span className={styles.orgName}>
          {row.prospectId ? (
            <RecordName
              prospectId={row.prospectId}
              name={row.organisation}
            />
          ) : (
            row.organisation
          )}
        </span>
        {current ? (
          <span className={styles.hereMark}>
            <span aria-hidden="true">▸</span> You are here
          </span>
        ) : null}
        <span className={styles.role}>{row.role}</span>
        <button type="button" className={styles.openBtn} onClick={onOpen}>
          <span aria-hidden="true">▸</span>
          <span>Open the request</span>
          <span className="visually-hidden"> from {row.organisation}</span>
        </button>
        {row.prospectId ? null : (
          <span className={styles.walkIn}>
            <span aria-hidden="true">○</span> No prospect record behind it
          </span>
        )}
      </td>

      <td data-label="Lane">
        <LaneChip lane={row.lane} size="sm" />
      </td>

      <td data-label="Arrived through">
        {channel ? (
          <span className={styles.channel} title={channel.note}>
            <span aria-hidden="true">{channel.glyph}</span>
            <span>{channel.short}</span>
          </span>
        ) : (
          <span className={styles.channel}>
            <span aria-hidden="true">◇</span>
            <span>Membership ask</span>
          </span>
        )}
      </td>

      <td data-label="What they asked for">
        <span className={styles.ask} title={row.ask}>
          {row.ask}
        </span>
        {row.request ? (
          missing.length > 0 ? (
            <span className={styles.missing}>
              <span aria-hidden="true">
                {unasked.length > 0 ? "⊘" : "○"}
              </span>{" "}
              <span className="num">{missing.length}</span> of{" "}
              <span className="num">3</span> qualifying answers missing
              {unasked.length > 0 ? (
                <>
                  , <span className="num">{unasked.length}</span> never asked
                  for
                </>
              ) : null}
            </span>
          ) : (
            <span className={styles.qualified}>
              <span aria-hidden="true">●</span> Qualified
            </span>
          )
        ) : null}
      </td>

      <td data-label="Clock">
        <ClockCell row={row} />
      </td>

      <td data-label="Status">
        {status ? (
          <TokenChip token={status} size="sm" />
        ) : (
          <TokenChip
            token={{
              glyph: row.interest?.answeredAt ? "●" : "○",
              label: row.interest?.answeredAt ? "Answered" : "Unanswered",
              cssVar: row.interest?.answeredAt ? "var(--ok)" : "var(--info)",
              note: "A membership ask is not a pipeline row.",
            }}
            size="sm"
          />
        )}
      </td>

      <td data-label="Next action">
        {row.task ? (
          <>
            <span className={styles.actionKind}>
              <span
                className={styles.actionGlyph}
                aria-hidden="true"
                style={{
                  ["--tone" as string]: TASK_KIND_META[row.task.kind].cssVar,
                }}
              >
                {TASK_KIND_META[row.task.kind].glyph}
              </span>
              {TASK_KIND_META[row.task.kind].label}
            </span>
            <span className={styles.actionText} title={row.task.action}>
              {row.task.action}
            </span>
          </>
        ) : (
          <span className={styles.actionText}>
            {row.request?.status === "lost"
              ? "Nothing to send. The reason is on the record and it outlives the job."
              : row.request?.status === "won"
                ? "Sold and reconciled with the book."
                : "Answered. Nothing outstanding."}
          </span>
        )}
      </td>
    </tr>
  );
}

/**
 * The clock, in a glyph, a word and a figure.
 *
 * The word comes from the same bucket the card counted, so a row can
 * never say "due today" while sitting inside the overdue bucket. Closed
 * rows say they have no clock rather than showing an empty cell, because
 * an empty cell in a clock column reads as data the page failed to load.
 */
function ClockCell({ row }: { row: QueueRow }) {
  if (!row.task || !row.bucket) {
    return (
      <span className={styles.clock} data-tone="none">
        <span aria-hidden="true">✓</span>
        <span className={styles.clockWord}>No clock</span>
        <span className={styles.clockWhen}>Closed</span>
      </span>
    );
  }
  const id = row.bucket;
  const t = row.task;
  return (
    <span
      className={styles.clock}
      style={{ ["--tone" as string]: BUCKET_TONE[id] }}
    >
      <span aria-hidden="true">
        {id === "overdue"
          ? "◉"
          : id === "today"
            ? "◑"
            : id === "thisWeek"
              ? "◔"
              : "○"}
      </span>
      <span className={styles.clockWord}>{BUCKET_SHORT[id]}</span>
      <span className={styles.clockWhen}>
        {t.hoursLate !== null ? (
          <>
            <span className="num">{t.hoursLate}</span> working hours past{" "}
            <span className="num">{formatDay(t.dueAt)}</span>
          </>
        ) : (
          <>
            due <span className="num">{formatWhen(t.dueAt)}</span>
          </>
        )}
      </span>
    </span>
  );
}

