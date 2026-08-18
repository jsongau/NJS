import { memo, useMemo, useRef, useState, type Ref } from "react";
import type {
  ConversationMessage,
  MessageChannel,
  MessageDirection,
  RequeueReason,
} from "@/domain/types";
import type { StatusToken } from "@/domain/vocabulary";
import { PITCH_STATUS_SHORT } from "@/domain/vocabulary";
import { SIGNAL_META } from "@/domain/selectors/record";
import { venueDate } from "@/domain/requests";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { PROSPECTS } from "@/data/prospects";
import { CONVERSED_PROSPECT_IDS } from "@/data/conversations";
import styles from "./Timeline.module.css";

/**
 * How many organisations have never been written to or heard from.
 *
 * THIS USED TO BE THE WORDS "Forty-two of the hundred and two", typed
 * into the JSX. It was true when it was typed. The board then went to
 * three hundred and twenty nine organisations and the sentence carried on
 * claiming a hundred and two, which is the exact failure this codebase
 * spends most of its comments trying to prevent: a number that stopped
 * deriving from anything and became a decoration.
 *
 * Derived at module load rather than per render. Both seeds are frozen,
 * so the answer cannot change while the tab is open.
 */
const SILENT_COUNT = PROSPECTS.length - CONVERSED_PROSPECT_IDS.length;

/**
 * THE THREAD, WITHOUT THE WALL OF TEXT.
 *
 * Every product in the research that shows a conversation history shows
 * it collapsed and filtered. Attio filters its activity timeline by
 * event type and remembers the choice. Close puts channel tabs across
 * the top. None of them stack full message bodies down a page, because
 * a wall of text is unreadable at exactly the moment it matters, which
 * is the ninety seconds before a phone call.
 *
 * So four rules hold here.
 *
 * NEWEST FIRST. A rep opening a record needs the last thing said, not
 * the first thing said.
 *
 * TWO LINES UNTIL ASKED. Every body clamps. The row still carries the
 * direction, the channel, the role, the date and, most importantly,
 * WHAT THE MESSAGE CHANGED, which is the one line that makes a timeline
 * a record rather than a mailbox.
 *
 * DIRECTION IS CARRIED BY THREE THINGS. A filled triangle pointing into
 * the rail and the word "Received", against a hollow triangle pointing
 * out and the word "Sent", against a solid rule on one side and a
 * dashed rule on the other. Colour is the fourth signal and never the
 * only one; the owner of this application is colourblind.
 *
 * THE FILTER IS A CHIP ROW, NOT A DROPDOWN. Direction and channel are
 * two facets, four and five values, on a surface where the reader is
 * already holding a question. A count sits beside the rows at all times
 * so a filter can never quietly explain away an empty thread.
 */

/**
 * HOW THE MESSAGE TRAVELLED.
 *
 * This map belongs in domain/vocabulary.ts beside the other token maps
 * and it is not there yet, exactly as ORG_TYPE_META sits temporarily in
 * the record selector. This pass does not own that file, and a second
 * copy of a token map is a worse outcome than a temporarily misplaced
 * one. When it moves, delete it here rather than leaving a copy.
 *
 * The glyph family is deliberate. "in-person" borrows the go-see
 * diamond from ACTIVITY_TYPE because it is the same act seen from the
 * other side, and a reader who has learned the diamond on the field
 * screen should not have to learn a second mark for it here.
 */
export const CHANNEL_META: Record<MessageChannel, StatusToken> = {
  email: {
    glyph: "▭",
    label: "Email",
    cssVar: "var(--info)",
    note: "Written, to a published address. Two minutes a touch, which is why the desk weights a published address above everything else.",
  },
  phone: {
    glyph: "◍",
    label: "Phone",
    cssVar: "var(--neutral)",
    note: "A call. The body is a summary written afterwards rather than a quote, and the row says so.",
  },
  "in-person": {
    glyph: "◆",
    label: "In person",
    cssVar: "var(--ledger-activity)",
    note: "A go-see or a tabling shift. For the organisations that publish no address at all, this is not a lesser kind of contact; it is the only kind there is.",
  },
  "contact-form": {
    glyph: "▤",
    label: "Contact form",
    cssVar: "var(--warn)",
    note: "Their published form, which is a queue rather than a person. It lands somewhere somebody may or may not read.",
  },
};

export const CHANNEL_ORDER: MessageChannel[] = [
  "email",
  "phone",
  "in-person",
  "contact-form",
];

/**
 * Which way it went.
 *
 * The words are "Received" and "Sent" rather than "In" and "Out"
 * because a two letter label on a dense row is a code, and a reader
 * should not have to learn a code to read their own thread.
 */
export const DIRECTION_META: Record<MessageDirection, StatusToken> = {
  inbound: {
    glyph: "◀",
    label: "Received",
    cssVar: "var(--ok)",
    note: "They wrote. An unanswered inbound outranks every piece of outbound work on the board.",
  },
  outbound: {
    glyph: "▷",
    label: "Sent",
    cssVar: "var(--accent)",
    note: "This desk wrote. Two written touches and then a visit is the sequence; a fourth email is a spam complaint.",
  },
};

/**
 * A reply that is not an answer.
 *
 * Instantly ships Out of Office and Wrong Person as first class lead
 * statuses because both mean requeue rather than reject, and filing
 * either as a no would delete a live record. Both are common here: a
 * school office is dark for a fortnight at a time and a store manager
 * cannot approve a night out in their own building.
 */
export const REQUEUE_META: Record<RequeueReason, StatusToken> = {
  "out-of-office": {
    glyph: "◌",
    label: "Out of office",
    cssVar: "var(--warn)",
    note: "An automatic absence reply. Nobody has read the message yet, so the next move is a diary entry rather than a follow-up.",
  },
  "wrong-person": {
    glyph: "◑",
    label: "Wrong person",
    cssVar: "var(--info)",
    note: "A real person who does not own this decision. One touch spent, and the name of the door that does open bought with it.",
  },
  "decision-off-site": {
    glyph: "◫",
    label: "Decision off site",
    cssVar: "var(--info)",
    note: "They own the site and not the budget. The useful outcome here is the role above the building.",
  },
  "come-back-later": {
    glyph: "◔",
    label: "Come back later",
    cssVar: "var(--neutral)",
    note: "A real answer with a date on it. Chasing before it arrives teaches them to ignore this desk.",
  },
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Dates are split rather than parsed, exactly as they are on the book
 * and the replies board. `new Date("2026-09-24")` is midnight UTC, and
 * running that through a locale formatter in California prints the
 * twenty third. A date that is one day out on a screen somebody is
 * working from is not a rounding error, it is a wrong answer.
 */
export function formatDay(iso: string): string {
  const [y, m, d] = venueDate(iso).split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** Long enough that the two line clamp is actually hiding something. */
const CLAMP_AT = 150;

type DirectionFilter = "all" | MessageDirection;
type ChannelFilter = "all" | MessageChannel;

/**
 * The filter, remembered between records.
 *
 * Attio remembers the timeline filter per object type and it is the
 * right behaviour: a reader who has decided they only want to see what
 * came back has decided it about the job, not about one organisation.
 * Module scope rather than storage, because it is a view preference and
 * a view preference that outlives the session is a saved search
 * pretending to be one.
 */
let lastDirection: DirectionFilter = "all";
let lastChannel: ChannelFilter = "all";

export interface TimelineProps {
  /** The thread, oldest first, exactly as the record selector returns it. */
  messages: ConversationMessage[];
  /** The heading this list is described by. */
  labelledBy?: string;
}

export const Timeline = memo(function Timeline({
  messages,
  labelledBy,
}: TimelineProps) {
  const [direction, setDirection] = useState<DirectionFilter>(lastDirection);
  const [channel, setChannel] = useState<ChannelFilter>(lastChannel);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  /**
   * Where focus goes when the clear button removes itself.
   *
   * A control that disappears when it is pressed drops a keyboard reader
   * on the document body, which is the most disorienting thing a dialog
   * can do to somebody who cannot see where they landed. Clearing the
   * filter hands focus to the chip that is now pressed.
   */
  const allRef = useRef<HTMLButtonElement>(null);

  /**
   * Reversed once per thread, not once per render.
   *
   * This modal opens twenty times a day and re-renders on every status
   * change, every filter press and every expansion. Reversing and
   * filtering a hundred and fifty-six element array in the render body
   * would be cheap and it would also be the exact habit that makes a
   * surface feel slow at the tenth screen rather than the first.
   */
  const newestFirst = useMemo(() => [...messages].reverse(), [messages]);

  const rows = useMemo(
    () =>
      newestFirst.filter(
        (m) =>
          (direction === "all" || m.direction === direction) &&
          (channel === "all" || m.channel === channel),
      ),
    [newestFirst, direction, channel],
  );

  /** Counts sit on the chips, so a facet with nothing behind it says so. */
  const counts = useMemo(() => {
    const byDirection: Record<string, number> = { inbound: 0, outbound: 0 };
    const byChannel: Record<string, number> = {};
    for (const m of messages) {
      byDirection[m.direction] += 1;
      byChannel[m.channel] = (byChannel[m.channel] ?? 0) + 1;
    }
    return { byDirection, byChannel };
  }, [messages]);

  function setDir(next: DirectionFilter) {
    lastDirection = next;
    setDirection(next);
  }

  function setChan(next: ChannelFilter) {
    lastChannel = next;
    setChannel(next);
  }

  const filtered = direction !== "all" || channel !== "all";

  if (messages.length === 0) {
    return (
      <p className={styles.empty} data-timeline-empty="true">
        <span className={styles.emptyGlyph} aria-hidden="true">◻</span>
        Nothing said either way. {SILENT_COUNT} of the {PROSPECTS.length}{" "}
        organisations on this board are in the same state.
      </p>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.filters}>
        <div className={styles.facet} role="group" aria-label="Filter by direction">
          <span className={styles.facetLabel}>Direction</span>
          <Chip
            pressed={direction === "all"}
            onPress={() => setDir("all")}
            label="All"
            count={messages.length}
            innerRef={allRef}
          />
          <Chip
            pressed={direction === "inbound"}
            onPress={() => setDir("inbound")}
            token={DIRECTION_META.inbound}
            label={DIRECTION_META.inbound.label}
            count={counts.byDirection.inbound}
          />
          <Chip
            pressed={direction === "outbound"}
            onPress={() => setDir("outbound")}
            token={DIRECTION_META.outbound}
            label={DIRECTION_META.outbound.label}
            count={counts.byDirection.outbound}
          />
        </div>

        <div className={styles.facet} role="group" aria-label="Filter by channel">
          <span className={styles.facetLabel}>Channel</span>
          <Chip
            pressed={channel === "all"}
            onPress={() => setChan("all")}
            label="All"
            count={messages.length}
          />
          {CHANNEL_ORDER.filter((c) => (counts.byChannel[c] ?? 0) > 0).map((c) => (
            <Chip
              key={c}
              pressed={channel === c}
              onPress={() => setChan(c)}
              token={CHANNEL_META[c]}
              label={CHANNEL_META[c].label}
              count={counts.byChannel[c] ?? 0}
            />
          ))}
        </div>
      </div>

      {/* The count changes in place when a chip is pressed, so it is a
          live region. Without it a screen reader user presses a filter
          and is told nothing at all. */}
      <p className={styles.count} role="status" data-timeline-count>
        <span className="num">{rows.length}</span> of{" "}
        <span className="num">{messages.length}</span>{" "}
        {messages.length === 1 ? "message" : "messages"}
        {filtered ? (
          <button
            type="button"
            className={styles.clear}
            onClick={() => {
              setDir("all");
              setChan("all");
              allRef.current?.focus();
            }}
          >
            Clear the filter
          </button>
        ) : null}
      </p>

      {rows.length === 0 ? (
        <p className={styles.empty}>
          <span className={styles.emptyGlyph} aria-hidden="true">◻</span>
          Nothing in this thread matches the filter.
        </p>
      ) : (
        <ol className={styles.list} aria-labelledby={labelledBy}>
          {rows.map((m) => (
            <Row
              key={m.id}
              message={m}
              expanded={expanded[m.id] === true}
              onToggle={() =>
                setExpanded((prev) => ({ ...prev, [m.id]: !prev[m.id] }))
              }
            />
          ))}
        </ol>
      )}
    </div>
  );
});

function Chip({
  pressed,
  onPress,
  token,
  label,
  count,
  innerRef,
}: {
  pressed: boolean;
  onPress: () => void;
  token?: StatusToken;
  label: string;
  count: number;
  innerRef?: Ref<HTMLButtonElement>;
}) {
  return (
    <button
      type="button"
      ref={innerRef}
      className={styles.chip}
      aria-pressed={pressed}
      onClick={onPress}
      style={token ? { ["--tone" as string]: token.cssVar } : undefined}
      title={token?.note}
    >
      {token ? (
        <span className={styles.chipGlyph} aria-hidden="true">
          {token.glyph}
        </span>
      ) : null}
      <span>{label}</span>
      <span className={`${styles.chipCount} num`}>{count}</span>
    </button>
  );
}

function Row({
  message: m,
  expanded,
  onToggle,
}: {
  message: ConversationMessage;
  expanded: boolean;
  onToggle: () => void;
}) {
  const dir = DIRECTION_META[m.direction];
  const chan = CHANNEL_META[m.channel];
  const long = m.body.length > CLAMP_AT;
  const moved = m.effect.movedStatusTo;
  const requeue = m.effect.requeue;
  const signals = m.effect.signals ?? [];

  return (
    <li
      className={[styles.row, styles[m.direction]].join(" ")}
      data-timeline-row={m.id}
      data-direction={m.direction}
      data-channel={m.channel}
    >
      <div className={styles.rowHead}>
        <span className={styles.dir} style={{ ["--tone" as string]: dir.cssVar }}>
          <span className={styles.dirGlyph} aria-hidden="true">{dir.glyph}</span>
          {dir.label}
        </span>
        <span className={styles.chan} title={chan.note}>
          <span aria-hidden="true">{chan.glyph}</span> {chan.label}
        </span>
        <span className={`${styles.when} num`}>{formatDay(m.at)}</span>
      </div>

      <p className={styles.role}>
        {m.counterpartyRole}
        {m.subject ? <span className={styles.subject}>{m.subject}</span> : null}
      </p>

      <p
        className={[styles.body, expanded || !long ? "" : styles.clamped]
          .filter(Boolean)
          .join(" ")}
      >
        {m.summarised ? (
          <span className={styles.summarised}>
            Written up afterwards, not quoted.
          </span>
        ) : null}
        {m.body}
      </p>

      {long ? (
        <button type="button" className={styles.more} onClick={onToggle} aria-expanded={expanded}>
          {expanded ? "Collapse" : "Read the whole message"}
        </button>
      ) : null}

      <p className={styles.effect}>
        <span className={styles.effectLabel}>Changed</span>
        {m.effect.note}
      </p>

      {(moved || requeue || signals.length > 0) && (
        <ul className={styles.tags}>
          {moved ? (
            <li className={styles.tag} style={{ ["--tone" as string]: PITCH_STATUS_SHORT[moved].cssVar }}>
              <span aria-hidden="true">{PITCH_STATUS_SHORT[moved].glyph}</span>
              Moved to {PITCH_STATUS_SHORT[moved].label}
            </li>
          ) : null}
          {requeue ? (
            <li
              className={styles.tag}
              style={{ ["--tone" as string]: REQUEUE_META[requeue].cssVar }}
              title={REQUEUE_META[requeue].note}
            >
              <span aria-hidden="true">{REQUEUE_META[requeue].glyph}</span>
              {REQUEUE_META[requeue].label}
            </li>
          ) : null}
          {signals.map((s) => (
            <li
              key={s}
              className={styles.tag}
              style={{ ["--tone" as string]: SIGNAL_META[s].weight >= 0 ? "var(--ok)" : "var(--risk)" }}
              title={SIGNAL_META[s].note}
            >
              <span aria-hidden="true">{SIGNAL_META[s].weight >= 0 ? "▲" : "▼"}</span>
              {SIGNAL_META[s].label}
            </li>
          ))}
        </ul>
      )}

      <div className={styles.prov}>
        <ProvenanceBadge provenance={m.provenance} compact />
      </div>
    </li>
  );
}
