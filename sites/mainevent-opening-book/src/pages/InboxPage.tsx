import { useCallback, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type {
  ConversationMessage,
  OrgType,
  PitchStatus,
  Prospect,
} from "@/domain/types";
import type { StatusToken } from "@/domain/vocabulary";
import { PITCH_STATUS, PITCH_STATUS_ORDER } from "@/domain/vocabulary";
import { LANE_META } from "@/domain/lanes";
import { DEMO_RECIPIENT } from "@/data/venue";
import {
  ORG_TYPE_META,
  ORG_TYPE_ORDER,
  RECORD_AS_OF,
  daysBetween,
  prospectRecords,
  type ProspectRecord,
} from "@/domain/selectors/record";
import { usePipeline } from "@/state/PipelineProvider";
import { useBook } from "@/state/BookProvider";
import { useOutbox, type SentMessage } from "@/state/OutboxProvider";
import { EmailComposeModal } from "@/components/email/EmailComposeModal";
import { RecordName } from "@/components/record/RecordName";
import { StatusChip } from "@/components/primitives/StatusChip";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { Button } from "@/components/primitives/Button";
import {
  AddProspectButton,
  useAddedProspects,
  type AddedProspect,
} from "@/components/prospect/AddProspect";
import styles from "./InboxPage.module.css";

/**
 * THE INBOX. BOTH DIRECTIONS, THREADED PER ORGANISATION, SORTED BY WHAT
 * IS WAITING ON THIS DESK.
 *
 * ── WHY THIS SCREEN EXISTS ────────────────────────────────────────
 * The application could already say where a hundred and two
 * organisations stood and what had gone out of the outbox. What it could
 * not do was show a message that came back next to the message that
 * caused it. An outbox is a record of effort. An inbox is a record of the
 * conversation, and a prospecting tool with only the first half is a tool
 * that can tell you how hard you worked and not who is waiting on you.
 *
 * ── THE CATEGORIES ARE READ OFF THE MESSAGES, NOT TYPED ────────────
 * Every thread lands in exactly one of seven categories, computed from
 * the last message and the requeue reason it carries. Nothing is stored,
 * nothing is set by hand, and the same thread cannot be in two places.
 *
 * The two that matter most are the two that most tools get wrong.
 * Instantly ships OUT OF OFFICE and WRONG PERSON as first class lead
 * statuses precisely because they are not rejections: one means nobody
 * has read the message yet, the other means the message reached a real
 * person who does not own the decision. Filing either as a no would
 * delete live records, and in this territory it would delete a lot of
 * them, because a school front office goes dark for a fortnight at a
 * time and at a chain the person you can reach very often cannot sign.
 *
 * DECISION OFF SITE earns its own category for the same reason a chain
 * is a different organisation type from an independent: somebody in the
 * building wants it and cannot approve it, and the useful next move is a
 * role above the site rather than another conversation inside it.
 *
 * NO REPLY YET is a category rather than a status, following the honest
 * structural answer: silence is not a stage, it is the absence of an
 * event plus elapsed time. It sits beside the stale filter in the rail,
 * which measures the same silence against a per stage threshold.
 *
 * ── THE WORKING SET IS AN ARGUMENT IN THE URL ──────────────────────
 * Every filter on this screen lives in the query string, so a filtered
 * view survives a reload, can be pasted to somebody, and can be reached
 * cold from the rail. The rail's status, type, stale and awaiting
 * filters all land here, and they land here because this is the surface
 * that can show a hundred and two organisations and the last thing said
 * to each of them in the same list.
 *
 * ── WHAT THIS SCREEN CANNOT DO, SAID ONCE ──────────────────────────
 * It cannot send anything, and it says so in the one place a reader is
 * about to press a button that looks like it might: beside Reply. There
 * is no mail transport in this build's dependency tree and the outbox
 * reducer rewrites every recipient to a reserved address that can never
 * resolve. That sentence belongs there and nowhere else. A banner on
 * every screen would be an apology; a line beside the control is a fact
 * about the control.
 */

export const INBOX_PATH = "/inbox";

// ---------------------------------------------------------------
// The categories
// ---------------------------------------------------------------

export type InboxCategory =
  /** They wrote last and nothing has gone back. */
  | "needs-reply"
  /** The ball is theirs, with a reason to expect it back. */
  | "waiting"
  /** An automatic absence reply. Nobody has read it yet. */
  | "out-of-office"
  /** A real person who does not own this decision. */
  | "wrong-person"
  /** The site wants it and the region approves it. */
  | "decision-off-site"
  /** Written to, never answered. */
  | "no-reply"
  /** Booked or lost. Filed rather than deleted. */
  | "closed";

export const CATEGORY_META: Record<InboxCategory, StatusToken> = {
  "needs-reply": {
    glyph: "◉",
    label: "Needs a reply",
    cssVar: "var(--risk)",
    note: "They wrote last and nothing has gone back. The only unforgivable state on a board like this.",
  },
  waiting: {
    glyph: "◑",
    label: "Waiting on them",
    cssVar: "var(--info)",
    note: "A live exchange where the next move is theirs, including the ones who named the month to come back in.",
  },
  "out-of-office": {
    glyph: "◔",
    label: "Out of office",
    cssVar: "var(--warn)",
    note: "An automatic absence reply. Requeue for their return; it is not an answer and it is not a no.",
  },
  "wrong-person": {
    glyph: "◈",
    label: "Wrong person",
    cssVar: "var(--warn)",
    note: "The touch cost one message and bought the name of the door that actually opens.",
  },
  "decision-off-site": {
    glyph: "◫",
    label: "Decision off site",
    cssVar: "var(--warn)",
    note: "Somebody in the building wants it and cannot approve it. The next useful thing is a role above the site.",
  },
  "no-reply": {
    glyph: "○",
    label: "No reply yet",
    cssVar: "var(--neutral)",
    note: "Written to, nothing back in either direction. The most common outcome of any cold outreach anywhere.",
  },
  closed: {
    glyph: "●",
    label: "Closed",
    cssVar: "var(--text-3)",
    note: "Booked or lost. Kept in the thread list because a lane full of quiet losses is a finding.",
  },
};

export const CATEGORY_ORDER: InboxCategory[] = [
  "needs-reply",
  "waiting",
  "out-of-office",
  "wrong-person",
  "decision-off-site",
  "no-reply",
  "closed",
];

/**
 * One thread, one category, decided in this order.
 *
 * Booked and lost win first because a signed event and a recorded no are
 * both finished, whatever the last message happened to be. After that the
 * last message decides, because the last message is what the state of a
 * conversation actually is: who spoke last, and what they said.
 *
 * A come back later reply lands in "waiting on them" rather than in a
 * category of its own. It is the one requeue reason that is a real answer
 * with a date attached, so the ball genuinely is theirs; the reason is
 * still drawn on the row, so nothing is lost by not giving it a bucket.
 *
 * Returns null for an organisation that has never exchanged a message,
 * which is forty-two of the hundred and two and is not a thread.
 */
export function categoriseThread(record: ProspectRecord): InboxCategory | null {
  const last = record.lastMessage;
  if (!last) return null;
  if (record.status === "booked" || record.status === "lost") return "closed";

  /* THE REQUEUE IS READ IN BOTH DIRECTIONS, and that is not an oversight
     in the other direction either. Ten of the hundred and fifty-six
     messages carry a requeue reason on an OUTBOUND row, because a go-see
     and a phone call are written up afterwards by the person who made
     them: the general manager who said the region decides put that on the
     visit summary, not in an email. Reading the reason only off inbound
     rows would file every one of those under no reply yet, which is the
     one reading that is definitely wrong. */
  switch (last.effect.requeue) {
    case "out-of-office":
      return "out-of-office";
    case "wrong-person":
      return "wrong-person";
    case "decision-off-site":
      return "decision-off-site";
    case "come-back-later":
      return "waiting";
    default:
      break;
  }

  if (last.direction === "inbound") return "needs-reply";
  return record.inboundCount === 0 ? "no-reply" : "waiting";
}

// ---------------------------------------------------------------
// The filters, which live in the URL
// ---------------------------------------------------------------

export const PARAM = {
  status: "status",
  type: "type",
  stale: "stale",
  awaiting: "awaiting",
  box: "box",
  added: "added",
  thread: "thread",
  query: "q",
} as const;

export interface WorkingSetFilters {
  status: PitchStatus[];
  type: OrgType[];
  stale: boolean;
  awaiting: boolean;
  box: InboxCategory[];
  added: boolean;
  query: string;
}

function readList<T extends string>(
  params: URLSearchParams,
  key: string,
  allowed: readonly T[],
): T[] {
  const raw = params.get(key);
  if (!raw) return [];
  const set = new Set(allowed);
  /* An unrecognised value is dropped rather than shown as an empty
     result. A pasted link with a stale filter name in it should narrow to
     what it can and say what it narrowed to, not render a blank screen. */
  return raw
    .split(",")
    .map((v) => v.trim() as T)
    .filter((v) => set.has(v));
}

export function readFilters(params: URLSearchParams): WorkingSetFilters {
  return {
    status: readList(params, PARAM.status, PITCH_STATUS_ORDER),
    type: readList(params, PARAM.type, ORG_TYPE_ORDER),
    stale: params.get(PARAM.stale) === "1",
    awaiting: params.get(PARAM.awaiting) === "1",
    box: readList(params, PARAM.box, CATEGORY_ORDER),
    added: params.get(PARAM.added) === "1",
    query: (params.get(PARAM.query) ?? "").trim(),
  };
}

export function anyFilterOn(f: WorkingSetFilters): boolean {
  return (
    f.status.length > 0 ||
    f.type.length > 0 ||
    f.stale ||
    f.awaiting ||
    f.box.length > 0 ||
    f.added ||
    f.query !== ""
  );
}

/**
 * A link to this screen with one facet set.
 *
 * The rail calls this, which is why it takes a plain facet and value
 * rather than a URLSearchParams: a filter chosen from the rail replaces
 * the working set rather than adding to whatever was left on twenty
 * minutes ago on another screen. Choosing the filter that is already on
 * returns the bare path, so the same row turns it off again.
 */
export function workingSetHref(
  facet: "status" | "type" | "stale" | "awaiting" | "added",
  value: string,
  active: boolean,
): string {
  if (active) return INBOX_PATH;
  if (facet === "stale" || facet === "awaiting" || facet === "added") {
    return `${INBOX_PATH}?${PARAM[facet]}=1`;
  }
  return `${INBOX_PATH}?${PARAM[facet]}=${encodeURIComponent(value)}`;
}

// ---------------------------------------------------------------
// The counts, derived once and read by two surfaces
// ---------------------------------------------------------------

export interface WorkingSetCounts {
  status: Record<PitchStatus, number>;
  type: Record<OrgType, number>;
  stale: number;
  awaiting: number;
  added: number;
  /** Threads per category, and the messages inside them. */
  box: Record<InboxCategory, { threads: number; messages: number }>;
  /** Organisations with at least one message in either direction. */
  threads: number;
  messages: number;
}

/**
 * Every figure this screen and the rail draw, computed in one pass.
 *
 * The rail and the inbox call the same function with the same arguments,
 * which is the only arrangement under which the number on a rail row and
 * the number of rows it produces cannot disagree. A rail keeping its own
 * tally would be right on one screen and wrong on the other with no way
 * for a reader to tell which.
 *
 * ADDED ROWS COUNT. An organisation the reader typed in this morning is
 * never touched and has a type, so it is inside the never touched figure
 * and inside its type's figure. It is outside every figure that measures
 * a conversation, because it has not had one.
 */
export function workingSetCounts(
  records: ProspectRecord[],
  added: AddedProspect[],
): WorkingSetCounts {
  const status = Object.fromEntries(
    PITCH_STATUS_ORDER.map((s) => [s, 0]),
  ) as Record<PitchStatus, number>;
  const type = Object.fromEntries(ORG_TYPE_ORDER.map((t) => [t, 0])) as Record<
    OrgType,
    number
  >;
  const box = Object.fromEntries(
    CATEGORY_ORDER.map((c) => [c, { threads: 0, messages: 0 }]),
  ) as Record<InboxCategory, { threads: number; messages: number }>;

  let stale = 0;
  let awaiting = 0;
  let threads = 0;
  let messages = 0;

  for (const r of records) {
    status[r.status] += 1;
    type[r.orgType] += 1;
    if (r.staleness.stale) stale += 1;
    if (r.awaitingReply) awaiting += 1;
    const category = categoriseThread(r);
    if (category === null) continue;
    threads += 1;
    messages += r.messageCount;
    box[category].threads += 1;
    box[category].messages += r.messageCount;
  }

  for (const row of added) {
    status.unworked += 1;
    type[row.orgType] += 1;
  }

  return { status, type, stale, awaiting, added: added.length, box, threads, messages };
}

// ---------------------------------------------------------------
// Matching
// ---------------------------------------------------------------

function matchesQuery(text: string, query: string): boolean {
  if (query === "") return true;
  return text.toLowerCase().includes(query.toLowerCase());
}

function recordMatches(
  record: ProspectRecord,
  category: InboxCategory | null,
  f: WorkingSetFilters,
): boolean {
  /* The added filter is exclusive by construction: it asks for the rows
     the reader typed, and a researched row is not one of them. */
  if (f.added) return false;
  if (f.status.length > 0 && !f.status.includes(record.status)) return false;
  if (f.type.length > 0 && !f.type.includes(record.orgType)) return false;
  if (f.stale && !record.staleness.stale) return false;
  if (f.awaiting && !record.awaitingReply) return false;
  if (f.box.length > 0 && (category === null || !f.box.includes(category))) {
    return false;
  }
  if (
    !matchesQuery(
      `${record.prospect.name} ${record.prospect.city} ${record.prospect.decisionMakerTitle}`,
      f.query,
    )
  ) {
    return false;
  }
  /* WITH NOTHING ASKED FOR, THIS IS AN INBOX AND NOT A DIRECTORY. The
     resting state is the sixty organisations that have said or been said
     something, newest first. The other forty-two are one rail filter
     away and the filter says how many there are before it is pressed. */
  if (!anyFilterOn(f) && category === null) return false;
  return true;
}

function addedMatches(row: AddedProspect, f: WorkingSetFilters): boolean {
  /* A row typed on a pavement has no thread, so it cannot be stale, it
     cannot be awaiting a reply and it cannot be in a message category.
     Answering one of those filters with it would be inventing history. */
  if (f.stale || f.awaiting || f.box.length > 0) return false;
  if (f.status.length > 0 && !f.status.includes("unworked")) return false;
  if (f.type.length > 0 && !f.type.includes(row.orgType)) return false;
  if (!matchesQuery(`${row.name} ${row.decisionMakerTitle} ${row.note}`, f.query)) {
    return false;
  }
  return true;
}

// ---------------------------------------------------------------
// Dates
// ---------------------------------------------------------------

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * A calendar day off the front of the ISO string, never through a locale
 * formatter.
 *
 * Every stamp in this data carries the venue's own offset. Parsing it to
 * a Date and printing it in whatever zone the reader's laptop is set to
 * moves half of these messages to the previous evening, which on a screen
 * somebody is working from is a wrong answer rather than a rounding one.
 */
function dayLabel(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return iso.slice(0, 10);
  return `${d} ${MONTHS[m - 1]}`;
}

function agoLabel(iso: string): string {
  const n = daysBetween(iso, RECORD_AS_OF);
  if (n <= 0) return "today";
  if (n === 1) return "1 day ago";
  return `${n} days ago`;
}

// ---------------------------------------------------------------
// The thread, including anything sent in this session
// ---------------------------------------------------------------

/** The id shape SentPage uses to tell a seeded row from a live one. */
const SEEDED_SENT = /^sent-\d{4}$/;

interface ThreadRow {
  key: string;
  at: string;
  direction: "inbound" | "outbound";
  channelLabel: string;
  role: string;
  subject?: string;
  body: string;
  /** One clause on what the message changed. Absent on a live send. */
  effectNote?: string;
  requeue?: ConversationMessage["effect"]["requeue"];
  summarised: boolean;
  live: boolean;
}

const CHANNEL_LABEL: Record<ConversationMessage["channel"], string> = {
  email: "Email",
  phone: "Phone",
  "in-person": "In person",
  "contact-form": "Contact form",
};

function threadRows(
  record: ProspectRecord,
  live: SentMessage[],
): ThreadRow[] {
  const rows: ThreadRow[] = record.thread.map((m) => ({
    key: m.id,
    at: m.at,
    direction: m.direction,
    channelLabel: CHANNEL_LABEL[m.channel],
    role: m.counterpartyRole,
    subject: m.subject,
    body: m.body,
    effectNote: m.effect.note,
    requeue: m.effect.requeue,
    summarised: m.summarised,
    live: false,
  }));

  /* Anything sent from this build in this session joins the thread it
     belongs to. The five seeded outbox rows do not: they are already the
     correspondence log on /sent, and threading them here as well would
     show one message twice under one organisation. */
  for (const m of live) {
    if (SEEDED_SENT.test(m.id)) continue;
    rows.push({
      key: m.id,
      at: m.sentAt,
      direction: "outbound",
      channelLabel: "Email",
      role: m.recipientRole,
      subject: m.subject,
      body: m.body,
      summarised: false,
      live: true,
    });
  }

  /* Newest first, matching the thread list beside it. A queue is read
     from the top and the top is where the unanswered thing is. */
  return rows.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
}

// ---------------------------------------------------------------
// The screen
// ---------------------------------------------------------------

interface Row {
  id: string;
  name: string;
  record: ProspectRecord;
  category: InboxCategory | null;
  sortAt: number;
}

export function InboxPage() {
  const [params, setParams] = useSearchParams();
  const pipeline = usePipeline();
  const book = useBook();
  const outbox = useOutbox();
  const added = useAddedProspects();

  const [composing, setComposing] = useState<Prospect | null>(null);
  const [composeIntent, setComposeIntent] = useState<"outreach" | "free">("free");

  const filters = useMemo(() => readFilters(params), [params]);

  const records = useMemo(
    () => prospectRecords({ pipeline, book: book.book }),
    [pipeline, book.book],
  );

  /**
   * THE CATEGORY TALLIES, COUNTED INSIDE WHATEVER ELSE IS NARROWING THE
   * BOARD.
   *
   * `counts.box` is computed over every record, because the rail draws
   * the same figures and the rail is drawn for all screens at once. On
   * this screen that made the tiles lie in a quiet way: with "In
   * conversation" on, the working set read twenty eight and the seven
   * tiles above the list still added up to sixty, so a tile promising
   * nine threads produced two when it was pressed. A facet count that
   * does not respect the other facets is the same class of defect as a
   * summary panel that does not respect the filter under it.
   *
   * Counted with the box facet itself removed, which is what makes the
   * tiles usable as a set: each one says what selecting it WOULD show,
   * and selecting a second one adds rather than subtracts.
   */
  const boxCounts = useMemo(() => {
    const out = Object.fromEntries(
      CATEGORY_ORDER.map((c) => [c, { threads: 0, messages: 0 }]),
    ) as WorkingSetCounts["box"];
    const withoutBox: WorkingSetFilters = { ...filters, box: [] };
    for (const record of records) {
      const category = categoriseThread(record);
      if (category === null) continue;
      if (!recordMatches(record, category, withoutBox)) continue;
      out[category].threads += 1;
      out[category].messages += record.messageCount;
    }
    return out;
  }, [records, filters]);

  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    for (const record of records) {
      const category = categoriseThread(record);
      if (!recordMatches(record, category, filters)) continue;
      out.push({
        id: record.prospect.id,
        name: record.prospect.name,
        record,
        category,
        sortAt: record.lastActivityAt ? Date.parse(record.lastActivityAt) : 0,
      });
    }
    /* Newest first, and the organisations with nothing recorded fall to
       the bottom in the order the data file lists them rather than in a
       random one. */
    return out.sort((a, b) => b.sortAt - a.sortAt);
  }, [records, filters]);

  const addedRows = useMemo(
    () => added.filter((row) => addedMatches(row, filters)),
    [added, filters],
  );

  const total = rows.length + addedRows.length;

  const selectedId = params.get(PARAM.thread) ?? rows[0]?.id ?? null;
  const selected = rows.find((r) => r.id === selectedId) ?? rows[0] ?? null;

  const liveSent = useMemo(
    () =>
      selected
        ? outbox.sent.filter((m) => m.prospectId === selected.record.prospect.id)
        : [],
    [outbox.sent, selected],
  );

  const messages = useMemo(
    () => (selected ? threadRows(selected.record, liveSent) : []),
    [selected, liveSent],
  );

  /** A filter changed, so the open thread is dropped with it. */
  const setFilterParams = useCallback(
    (next: URLSearchParams) => {
      next.delete(PARAM.thread);
      setParams(next, { replace: false });
    },
    [setParams],
  );

  const toggleBox = useCallback(
    (category: InboxCategory) => {
      const next = new URLSearchParams(params);
      const current = readList(params, PARAM.box, CATEGORY_ORDER);
      const after = current.includes(category)
        ? current.filter((c) => c !== category)
        : [...current, category];
      if (after.length === 0) next.delete(PARAM.box);
      else next.set(PARAM.box, after.join(","));
      setFilterParams(next);
    },
    [params, setFilterParams],
  );

  const dropFacet = useCallback(
    (key: string, value?: string) => {
      const next = new URLSearchParams(params);
      if (value === undefined) {
        next.delete(key);
      } else {
        const kept = (next.get(key) ?? "")
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v !== "" && v !== value);
        if (kept.length === 0) next.delete(key);
        else next.set(key, kept.join(","));
      }
      setFilterParams(next);
    },
    [params, setFilterParams],
  );

  const threadHref = useCallback(
    (id: string) => {
      const next = new URLSearchParams(params);
      next.set(PARAM.thread, id);
      return `${INBOX_PATH}?${next.toString()}`;
    },
    [params],
  );

  const listHref = useMemo(() => {
    const next = new URLSearchParams(params);
    next.delete(PARAM.thread);
    const q = next.toString();
    return q ? `${INBOX_PATH}?${q}` : INBOX_PATH;
  }, [params]);

  const chips = useMemo(() => {
    const out: { key: string; value?: string; label: string }[] = [];
    for (const s of filters.status) {
      out.push({ key: PARAM.status, value: s, label: PITCH_STATUS[s].label });
    }
    for (const t of filters.type) {
      out.push({ key: PARAM.type, value: t, label: ORG_TYPE_META[t].label });
    }
    if (filters.stale) out.push({ key: PARAM.stale, label: "Going stale" });
    if (filters.awaiting) {
      out.push({ key: PARAM.awaiting, label: "Awaiting a reply" });
    }
    for (const b of filters.box) {
      out.push({ key: PARAM.box, value: b, label: CATEGORY_META[b].label });
    }
    if (filters.added) out.push({ key: PARAM.added, label: "Added by hand" });
    if (filters.query !== "") {
      out.push({ key: PARAM.query, label: `Name contains ${filters.query}` });
    }
    return out;
  }, [filters]);

  const viewingThread = params.get(PARAM.thread) !== null;

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div className={styles.headText}>
          <p className={styles.eyebrow}>Both directions</p>
          <h1 className={styles.h1}>Inbox</h1>
        </div>
        <div className={styles.headActions}>
          <AddProspectButton label="Add a prospect" />
        </div>
      </header>

      {/*
        THE FILTER BAR. At a hundred and two records the common failure is
        not an empty result, it is not noticing a filter is on, so every
        active facet is a chip that removes itself and the figure beside
        them is live.
      */}
      <div className={styles.bar}>
        <div className={styles.search}>
          <label className={styles.searchLabel} htmlFor="inbox-q">
            Search
          </label>
          <input
            id="inbox-q"
            className={styles.searchInput}
            type="search"
            value={filters.query}
            placeholder="Organisation, city or role"
            onChange={(e) => {
              const next = new URLSearchParams(params);
              if (e.target.value.trim() === "") next.delete(PARAM.query);
              else next.set(PARAM.query, e.target.value);
              next.delete(PARAM.thread);
              /* Replaced rather than pushed. Typing eight letters should
                 not put eight entries in the back button. */
              setParams(next, { replace: true });
            }}
          />
        </div>

        <p className={styles.count} aria-live="polite">
          <span className={`${styles.countValue} num`}>{total}</span>
          <span className={styles.countUnit}>
            {/* The leading space is for a screen reader, which reads the
                two spans as one string and would otherwise say
                "42organisations". The gap between them is drawn by the
                flex gap either way. */}
            {" "}
            {total === 1 ? "organisation" : "organisations"}
            {anyFilterOn(filters) ? " in this working set" : " with a thread"}
          </span>
        </p>

        {chips.length > 0 ? (
          <ul className={styles.chips}>
            {chips.map((chip) => (
              <li key={`${chip.key}-${chip.value ?? ""}`}>
                <button
                  type="button"
                  className={styles.chip}
                  onClick={() => dropFacet(chip.key, chip.value)}
                >
                  {chip.label}
                  <span className={styles.chipX} aria-hidden="true">
                    ✕
                  </span>
                  <span className="visually-hidden">, remove this filter</span>
                </button>
              </li>
            ))}
            <li>
              <Link className={styles.clear} to={INBOX_PATH}>
                Clear all
              </Link>
            </li>
          </ul>
        ) : null}
      </div>

      <div className={styles.split} data-view={viewingThread ? "thread" : "list"}>
        <section className={styles.listPane} aria-label="Threads">
          {/*
            THE CATEGORY FACET. Multi select, because two categories are a
            union and a reader who wants out of office and wrong person
            together is asking one question about requeues.
          */}
          <ul className={styles.boxes}>
            {CATEGORY_ORDER.map((category) => {
              const meta = CATEGORY_META[category];
              const figure = boxCounts[category];
              const on = filters.box.includes(category);
              return (
                <li key={category}>
                  <button
                    type="button"
                    className={styles.box}
                    aria-pressed={on}
                    data-messages={figure.messages}
                    data-category={category}
                    title={meta.note}
                    onClick={() => toggleBox(category)}
                  >
                    <span
                      className={styles.boxGlyph}
                      style={{ color: meta.cssVar }}
                      aria-hidden="true"
                    >
                      {meta.glyph}
                    </span>
                    <span className={styles.boxLabel}>{meta.label}</span>
                    <span className={`${styles.boxCount} num`}>
                      {figure.threads}
                      <span className="visually-hidden">
                        {" "}
                        threads, {figure.messages} messages
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {addedRows.length > 0 ? (
            <section className={styles.addedBlock} aria-label="Added by hand">
              <h2 className={styles.blockHeading}>
                Added by hand
                <ProvenanceBadge provenance="user_input" compact />
              </h2>
              <ul className={styles.addedList}>
                {addedRows.map((row) => (
                  <li
                    key={row.id}
                    className={styles.addedRow}
                    data-added-row={row.id}
                  >
                    <p className={styles.addedName}>{row.name}</p>
                    <p className={styles.addedMeta}>
                      <span
                        className={styles.addedGlyph}
                        style={{ color: ORG_TYPE_META[row.orgType].cssVar }}
                        aria-hidden="true"
                      >
                        {ORG_TYPE_META[row.orgType].glyph}
                      </span>
                      {ORG_TYPE_META[row.orgType].label}
                      <span className={styles.dot} aria-hidden="true">
                        ·
                      </span>
                      {LANE_META[row.lane].label}
                      {row.decisionMakerTitle ? (
                        <>
                          <span className={styles.dot} aria-hidden="true">
                            ·
                          </span>
                          {row.decisionMakerTitle}
                        </>
                      ) : null}
                    </p>
                    {row.address ? (
                      <p className={styles.addedLine}>{row.address}</p>
                    ) : null}
                    {row.note ? (
                      <p className={styles.addedLine}>{row.note}</p>
                    ) : null}
                    <p className={styles.addedDoors}>
                      {row.phone ? (
                        <a className={styles.door} href={`tel:${row.phone}`}>
                          {row.phone}
                        </a>
                      ) : null}
                      {row.website ? (
                        <a
                          className={styles.door}
                          href={row.website}
                          rel="noreferrer noopener"
                          target="_blank"
                        >
                          Website
                        </a>
                      ) : null}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {rows.length === 0 && addedRows.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyLine}>
                No organisations match these filters.
              </p>
              <Link className={styles.emptyAction} to={INBOX_PATH}>
                Clear filters
              </Link>
            </div>
          ) : (
            <ul className={styles.threads}>
              {rows.map((row) => {
                const meta = row.category ? CATEGORY_META[row.category] : null;
                const last = row.record.lastMessage;
                const on = selected?.id === row.id;
                return (
                  <li
                    key={row.id}
                    className={styles.threadRow}
                    data-on={on ? "yes" : undefined}
                    data-thread-row={row.id}
                  >
                    {/*
                      ── THE ROW OPENS THE THREAD, THE NAME OPENS THE
                         RECORD, AND NEITHER IS INSIDE THE OTHER ────

                      The whole row used to be one link with the
                      organisation's name printed inside it. The name is
                      a control of its own now, and an interactive
                      element inside an anchor is markup a browser
                      rearranges without telling anybody.

                      So the link is stretched across the row behind the
                      content, carrying its own spoken name, and the
                      organisation sits above it. Pressing anywhere on
                      the row still opens the conversation, which is what
                      it did before; pressing the words opens the
                      profile, which is what the owner asked for.
                    */}
                    <Link
                      to={threadHref(row.id)}
                      className={styles.threadOpen}
                      /* On the link rather than on the row. The thing
                         that is the current page is the destination, and
                         the row draws itself off `data-on` instead. */
                      aria-current={on ? "true" : undefined}
                    >
                      <span className="visually-hidden">
                        Open the conversation with {row.name}
                      </span>
                    </Link>
                    <span className={styles.threadTop}>
                      <span className={styles.threadName}>
                        <RecordName prospectId={row.id} name={row.name} />
                      </span>
                      <span className={`${styles.threadWhen} num`}>
                        {row.record.lastActivityAt
                          ? dayLabel(row.record.lastActivityAt)
                          : "no history"}
                      </span>
                    </span>
                    <span className={styles.threadTags}>
                      {meta ? (
                        <span className={styles.tag}>
                          <span
                            className={styles.tagGlyph}
                            style={{ color: meta.cssVar }}
                            aria-hidden="true"
                          >
                            {meta.glyph}
                          </span>
                          {meta.label}
                        </span>
                      ) : (
                        <span className={styles.tag}>
                          <span className={styles.tagGlyph} aria-hidden="true">
                            ▢
                          </span>
                          Never touched
                        </span>
                      )}
                      {row.record.staleness.stale ? (
                        <span className={styles.tagStale}>
                          <span className={styles.tagGlyph} aria-hidden="true">
                            ⌛
                          </span>
                          Stale
                        </span>
                      ) : null}
                    </span>
                    <span className={styles.threadSnip}>
                      {last
                        ? `${last.direction === "inbound" ? "In" : "Out"}. ${last.subject ?? last.body}`
                        : row.record.prospect.decisionMakerTitle}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className={styles.threadPane} aria-label="Conversation">
          {selected ? (
            <>
              <Link className={styles.back} to={listHref}>
                Threads
              </Link>

              <header className={styles.threadHead}>
                <div className={styles.threadHeadTop}>
                  <RecordName
                    prospectId={selected.record.prospect.id}
                    className={styles.threadTitle}
                  />
                  {selected.record.messageCount > 0 ? (
                    /* The threads are written to be representative rather
                       than reported, and the badge says so once at the top
                       of the conversation instead of on every message in
                       it. */
                    <ProvenanceBadge provenance="illustrative" compact />
                  ) : null}
                </div>
                <div className={styles.threadFacts}>
                  <StatusChip status={selected.record.status} />
                  <span className={styles.fact}>
                    <span
                      className={styles.tagGlyph}
                      style={{
                        color: ORG_TYPE_META[selected.record.orgType].cssVar,
                      }}
                      aria-hidden="true"
                    >
                      {ORG_TYPE_META[selected.record.orgType].glyph}
                    </span>
                    {ORG_TYPE_META[selected.record.orgType].label}
                  </span>
                  <span className={styles.fact}>
                    {selected.record.prospect.decisionMakerTitle}
                  </span>
                  <span className={styles.fact}>
                    {selected.record.messageCount} sent and received
                  </span>
                </div>
                <p className={styles.next}>
                  <span className={styles.nextLabel}>Next</span>
                  <span className={styles.nextText}>
                    <strong>{selected.record.nextAction.label}.</strong>{" "}
                    {selected.record.nextAction.why}
                  </span>
                </p>
              </header>

              <div className={styles.reply}>
                <Button
                  variant="primary"
                  onClick={() => {
                    setComposeIntent(
                      selected.record.messageCount > 0 ? "free" : "outreach",
                    );
                    setComposing(selected.record.prospect);
                  }}
                >
                  {selected.record.messageCount > 0
                    ? "Reply"
                    : "Write the first message"}
                </Button>
                {/*
                  THE ONE PLACE THIS IS SAID. Beside the control it is
                  about, once, and never as a banner on a screen where
                  nobody is about to press anything.
                */}
                <p className={styles.replyTruth}>
                  Nothing leaves this build. The outbox rewrites every
                  recipient to {DEMO_RECIPIENT}, which RFC 2606 reserves so it
                  can never resolve. A live desk would put one transport
                  adapter behind that reducer and unlock the recipient field.
                </p>
              </div>

              {messages.length === 0 ? (
                <div className={styles.empty}>
                  <p className={styles.emptyLine}>No messages yet.</p>
                </div>
              ) : (
                <ol className={styles.messages}>
                  {messages.map((m) => (
                    <li
                      key={m.key}
                      className={styles.message}
                      data-direction={m.direction}
                    >
                      <p className={styles.messageHead}>
                        <span className={styles.messageDir}>
                          <span className={styles.tagGlyph} aria-hidden="true">
                            {m.direction === "inbound" ? "◤" : "◥"}
                          </span>
                          {m.direction === "inbound" ? "Received" : "Sent"}
                        </span>
                        <span className={styles.messageChannel}>
                          {m.channelLabel}
                        </span>
                        <span className={styles.messageRole}>{m.role}</span>
                        <span className={`${styles.messageWhen} num`}>
                          {dayLabel(m.at)}, {agoLabel(m.at)}
                        </span>
                        {m.live ? (
                          <ProvenanceBadge provenance="user_input" compact />
                        ) : null}
                      </p>
                      {m.subject ? (
                        <p className={styles.messageSubject}>{m.subject}</p>
                      ) : null}
                      <p className={styles.messageBody}>{m.body}</p>
                      <p className={styles.messageFoot}>
                        {m.summarised ? (
                          <span className={styles.summarised}>
                            Written up afterwards, not a quote
                          </span>
                        ) : null}
                        {m.requeue ? (
                          <span className={styles.requeue}>
                            Requeue: {m.requeue.split("-").join(" ")}
                          </span>
                        ) : null}
                        {m.effectNote ? (
                          <span className={styles.effect}>{m.effectNote}</span>
                        ) : null}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </>
          ) : (
            <div className={styles.empty}>
              <p className={styles.emptyLine}>No thread selected.</p>
              <Link className={styles.emptyAction} to={INBOX_PATH}>
                Clear filters
              </Link>
            </div>
          )}
        </section>
      </div>

      <EmailComposeModal
        prospect={composing}
        intent={composeIntent}
        onClose={() => setComposing(null)}
      />
    </div>
  );
}
