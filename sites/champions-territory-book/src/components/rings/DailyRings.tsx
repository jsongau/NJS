import { useEffect, useMemo, useRef, useState } from "react";
import {
  RING_META,
  RING_STATE_META,
  dailyReading,
  type DailyReading,
  type RingId,
  type RingReading,
} from "@/domain/selectors/daily";
import {
  DailyProvider,
  TARGET_MAX,
  TARGET_MIN,
  useDaily,
  useDailyDispatch,
} from "@/state/DailyProvider";
import { usePipeline } from "@/state/PipelineProvider";
import { useOutbox } from "@/state/OutboxProvider";
import { useBook } from "@/state/BookProvider";
import { RecordName } from "@/components/record/RecordName";
import { LaneChip } from "@/components/primitives/LaneChip";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { Button } from "@/components/primitives/Button";
import { ClearedBoard, StrikeMark } from "@/components/play/ClearedBoard";
import styles from "./DailyRings.module.css";

/**
 * THREE RINGS. THE DAY'S WORK, AND A WAY INTO IT.
 *
 * WHAT WAS ASKED FOR AND WHAT WAS BUILT. The owner asked for the tool to
 * be "fun to use like u want to use it with daily quests". The literal
 * reading of that produces points, levels and a badge, and every one of
 * those would embarrass him the first time he opened this in front of a
 * general manager. The useful reading is the one underneath it: give the
 * morning a shape, make progress visible, and give him a reason to open
 * the thing at nine o'clock.
 *
 * So there are three rings and no score. Touches made, replies handled,
 * stale cleared. Each is a count of real work in the unit the job is
 * already thought about in, each resets at midnight so today is winnable
 * whatever yesterday looked like, and each is inside his control on any
 * given morning. A ring on contracts signed would punish him for a
 * school district's budget cycle. A ring on touches rewards the only
 * thing he actually decides.
 *
 * ── PRESSING A RING IS THE WHOLE MECHANIC ─────────────────────────
 * A ring you cannot act on is a scoreboard sitting beside the work. This
 * one hands back exactly the organisations that would close it, in the
 * order they should be worked, and every name in that list opens its own
 * record. Engaging with the mechanic IS doing the work, which is the
 * only defensible form of this idea and the line between a product and
 * exploitationware.
 *
 * ── COLOUR IS NEVER THE ONLY SIGNAL, AND NEITHER IS THE ARC ───────
 * The owner is colourblind, and a progress ring is the classic offender:
 * it encodes everything in a sweep and a hue. So every ring here is
 * readable as a number and a word before it is readable as a shape. The
 * figures are set in tabular mono at the size of a headline, the state
 * is one of three words, the arc is drawn as COUNTABLE SEGMENTS, one per
 * unit of the target, and the centre carries a glyph that differs by
 * state. Put the strip through a greyscale filter and every reading
 * survives, because done segments are dark ink and undone segments are a
 * hairline.
 *
 * ── A CLOSED RING LANDS, AND IT STILL DOES NOT SHOUT ──────────────
 * No modal, no confetti, no sound, no character. What a closed ring gets
 * is three things at once: a MARK, the boxed cross somebody puts on a
 * paper day sheet when the last job on it is done, stamped on the ring;
 * a CHANGE OF
 * STATE, a heavier edge in the ring's own tone; and a WORD, "Closed",
 * set in the display face so it is legible from across a desk. The strip
 * announces it once through a single polite live region and never
 * mentions it again.
 *
 * The segments are the other half of it. A segment that has just been
 * earned arrives by growing in WEIGHT rather than by fading in, one
 * after the next, over duration tokens that are zero under reduced
 * motion. Weight is the right channel because weight is what the reading
 * is made of: a done segment is thick ink and an undone one is a
 * hairline, so the animation is the value arriving rather than a
 * decoration laid over it.
 *
 * Superhuman's Inbox Zero image is still the model: the reward occupies
 * the space the work vacated and it costs the user nothing, least of all
 * a click to dismiss something.
 *
 * ── AND IT CAN BE SWITCHED OFF ────────────────────────────────────
 * Off removes the strip from the document rather than hiding it. What
 * remains is one plain control to bring it back, because a mechanic that
 * cannot be told to stop reads as manipulation the first time it asks
 * for something at a bad moment.
 */

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * A calendar day, split rather than parsed.
 *
 * `new Date("2026-09-23")` is midnight UTC, and rendering that through a
 * locale formatter in California prints the twenty second. The same
 * decision the Book, Replies and Today pages already made, for the same
 * reason.
 */
function formatDay(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  return `${d} ${MONTHS[m - 1]}`;
}

export interface DailyRingsProps {
  /**
   * The moment the day is read from. Defaults to the same constant the
   * record selector and the inbound queue read from, so the strip agrees
   * with every other figure on the page it sits on.
   */
  now?: string;
  /**
   * The reader's own clock, injected only by tests. Work done in a
   * session is stamped with it, and both dates mean today.
   */
  systemNow?: string;
  className?: string;
}

/**
 * The strip, with its own state mounted underneath it.
 *
 * A page adopts this with one line and no plumbing. Mounting
 * `DailyProvider` higher up as well is safe and is what a second surface
 * reading the same targets would do; the provider notices and steps
 * aside rather than opening a second copy of the state.
 */
export function DailyRings(props: DailyRingsProps) {
  return (
    <DailyProvider>
      <Rings {...props} />
    </DailyProvider>
  );
}

function Rings({ now, systemNow, className }: DailyRingsProps) {
  const pipeline = usePipeline();
  const outbox = useOutbox();
  const book = useBook();
  const daily = useDaily();
  const dispatch = useDailyDispatch();

  const [open, setOpen] = useState<RingId | null>(null);
  const [targetsOpen, setTargetsOpen] = useState(false);

  const reading = useMemo(
    () =>
      dailyReading({
        pipeline,
        outbox: outbox.sent,
        book: book.book,
        targets: daily.targets,
        now,
        systemNow,
      }),
    [pipeline, outbox.sent, book.book, daily.targets, now, systemNow],
  );

  const announcement = useAnnouncement(reading);

  if (!daily.enabled) {
    /*
      OFF MEANS GONE. Not hidden, not collapsed to a strip of grey, not
      still counting quietly behind a display property. The rings, the
      figures, the live region and the panel are all out of the document,
      and what is left is one control that says what it does.
    */
    return (
      <p className={[styles.reinstate, className].filter(Boolean).join(" ")}>
        <Button
          size="sm"
          onClick={() => dispatch({ type: "SET_ENABLED", enabled: true })}
        >
          Turn the daily rings on
        </Button>
      </p>
    );
  }

  const openRing = open === null ? null : reading.byId[open];

  return (
    <section
      className={[styles.strip, className].filter(Boolean).join(" ")}
      aria-labelledby="daily-rings-heading"
      data-all-closed={reading.allClosed ? "yes" : "no"}
    >
      <header className={styles.head}>
        <h2 className={styles.heading} id="daily-rings-heading">
          Today
        </h2>
        <p className={styles.date}>
          {reading.weekday} {formatDay(reading.day)}
          {reading.working ? "" : ", not a working day"}
        </p>
        <ProvenanceBadge provenance="illustrative" compact />
        <button
          type="button"
          className={styles.settings}
          aria-expanded={targetsOpen}
          aria-controls="daily-rings-targets"
          onClick={() => setTargetsOpen((v) => !v)}
        >
          Targets
        </button>
      </header>

      <div className={styles.rings} role="group" aria-label="The day's three rings">
        {reading.rings.map((ring) => (
          <RingButton
            key={ring.id}
            ring={ring}
            pressed={open === ring.id}
            onPress={() => setOpen((v) => (v === ring.id ? null : ring.id))}
          />
        ))}
      </div>

      {/*
        ONE POLITE LIVE REGION, NOT THREE.

        The three figures each change independently, and three live
        regions would interrupt each other and read their fragments in
        whatever order they happened to settle. So a single status line
        carries the whole sentence, the visible figures are left out of
        it, and the closing of a ring is announced exactly once. The
        buttons carry their own accessible names, so nothing here is the
        only way to hear a figure.
      */}
      <p className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </p>

      <p className={styles.week}>
        <span className={styles.weekLabel}>This week</span>
        <span className={`${styles.weekFigure} num`}>{reading.week.touches}</span>
        <span className={styles.weekUnit}>
          {reading.week.touches === 1 ? "touch" : "touches"} over{" "}
          {reading.week.workingDaysSoFar}{" "}
          {reading.week.workingDaysSoFar === 1 ? "working day" : "working days"}
        </span>
        <span className={styles.weekLabel}>Weeks closed</span>
        <span className={`${styles.weekFigure} num`} title={reading.week.note}>
          {reading.week.streak}
        </span>
      </p>

      {reading.fresh ? (
        /* THE HONEST FIRST RUN. There is no trailing average on a board
           nobody has worked yet, so the strip says what the figure is
           instead of letting a default look earned. */
        <p className={styles.basis}>{reading.suggested.touches.basis}</p>
      ) : null}

      {targetsOpen ? (
        <TargetsPanel reading={reading} onOff={() => setOpen(null)} />
      ) : null}

      {reading.allClosed ? (
        /* THE DAY, CLEARED. The boxed cross, two words and the three
           figures that earned it. The panel occupies the space the list
           of things to do was standing in, which is the whole idea: the
           reward is the work being gone. */
        <ClearedBoard
          headline="Day cleared"
          figure={reading.rings
            .map((r) => `${r.done} ${r.label.toLowerCase()}`)
            .join(", ")}
        />
      ) : openRing ? (
        <RingList ring={openRing} />
      ) : null}
    </section>
  );
}

// ---------------------------------------------------------------
// One ring
// ---------------------------------------------------------------

function RingButton({
  ring,
  pressed,
  onPress,
}: {
  ring: RingReading;
  pressed: boolean;
  onPress: () => void;
}) {
  const meta = RING_META[ring.id];
  const state = RING_STATE_META[ring.state];

  const name = ring.closed
    ? `${ring.label}, closed, ${ring.done} of ${ring.target} ${ring.unit}`
    : `${ring.label}, ${ring.done} of ${ring.target} ${ring.unit}, ${ring.remaining} to go. Shows the ${ring.closers.length} that would close it.`;

  return (
    <button
      type="button"
      className={styles.ring}
      /* A real toggle. The press changes what is on screen below it, so
         the control has to say whether it is currently the one doing
         that, and aria-pressed is how a button says so. */
      aria-pressed={pressed}
      data-state={ring.state}
      data-ring={ring.id}
      aria-label={name}
      title={`${meta.what} ${ring.basis}`}
      style={{ ["--tone" as string]: meta.cssVar }}
      onClick={onPress}
    >
      <span className={styles.ringLabel}>{ring.label}</span>

      {/*
        THE STAMP. A closed ring gets the boxed cross a day sheet is
        marked off with, laid over the top right of the arc. It is the
        MARK half of the completion: the state change is the edge, the
        word is underneath, and this is the thing the eye catches. It is
        drawn rather than typed, at the size it is used, and it is out of
        the accessibility tree because the button's own name already
        contains the word "closed".
      */}
      <span className={styles.arcWrap}>
        <Arc done={ring.done} target={ring.target} glyph={state.glyph} />
        {ring.closed ? (
          <span className={styles.stamp} aria-hidden="true">
            <StrikeMark size={24} />
          </span>
        ) : null}
      </span>

      {/* The figures, in tabular mono in a slot wide enough for the
          largest they can become, so nothing on the strip moves as a
          count changes. */}
      <span className={styles.figures} aria-hidden="true">
        <span className={`${styles.done} num`}>{ring.done}</span>
        <span className={styles.of}>of</span>
        <span className={`${styles.target} num`}>{ring.target}</span>
      </span>

      <span className={styles.state} aria-hidden="true">
        <span className={styles.stateGlyph}>{state.glyph}</span>
        <span className={styles.stateWord}>{state.label}</span>
      </span>
    </button>
  );
}

/** Circumference of the drawn ring, at r = 20 in a 48 unit box. */
const R = 20;
const C = 2 * Math.PI * R;
/** Above this many units the segments stop being countable. */
const MAX_SEGMENTS = 12;
/** The gap between two segments, in user units. */
const GAP = 2.4;

/**
 * The arc, drawn as countable segments rather than as a sweep.
 *
 * One segment per unit of the target, so "three of eight" is legible as
 * three filled marks out of eight before any colour is read, and stays
 * legible in greyscale because a filled segment is dark ink against a
 * hairline. Above twelve units the marks are too fine to count and the
 * ring falls back to a single arc; the figures beside it carry the
 * reading either way, which is why the fallback is safe.
 *
 * Decorative in the accessibility tree. Every value it draws is in the
 * button's accessible name already.
 */
function Arc({
  done,
  target,
  glyph,
}: {
  done: number;
  target: number;
  glyph: string;
}) {
  const segments: { key: number; filled: boolean; dash: string; offset: number }[] =
    [];

  if (target > 0 && target <= MAX_SEGMENTS) {
    const step = C / target;
    const length = Math.max(1, step - GAP);
    for (let i = 0; i < target; i += 1) {
      segments.push({
        key: i,
        filled: i < done,
        dash: `${length} ${C - length}`,
        offset: -i * step,
      });
    }
  }

  const ratio = target > 0 ? Math.min(1, done / target) : 1;

  return (
    <svg
      className={styles.arc}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <g transform="rotate(-90 24 24)">
        {segments.length > 0 ? (
          segments.map((s) => (
            <circle
              key={s.key}
              className={s.filled ? styles.segOn : styles.segOff}
              cx="24"
              cy="24"
              r={R}
              fill="none"
              strokeDasharray={s.dash}
              strokeDashoffset={s.offset}
              /*
                The segment's place in the ring, so the landing
                staggers round it rather than all twelve arriving at
                once. The stagger is computed in the stylesheet from a
                DURATION TOKEN multiplied by this index, which is what
                makes it collapse to zero under reduced motion along
                with the animation it delays. A delay written in
                milliseconds here would survive that query and leave a
                segment sitting at its start weight.
              */
              style={{ ["--i" as string]: s.key }}
            />
          ))
        ) : (
          <>
            <circle
              className={styles.segOff}
              cx="24"
              cy="24"
              r={R}
              fill="none"
            />
            <circle
              className={styles.segOn}
              cx="24"
              cy="24"
              r={R}
              fill="none"
              strokeDasharray={`${C * ratio} ${C}`}
            />
          </>
        )}
      </g>
      {/* The state glyph inside the ring, so the shape is redundant with
          itself and not only with the word underneath it. */}
      <text className={styles.arcGlyph} x="24" y="24" textAnchor="middle">
        {glyph}
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------
// What a press reveals
// ---------------------------------------------------------------

function RingList({ ring }: { ring: RingReading }) {
  const meta = RING_META[ring.id];

  if (ring.closed) {
    return (
      <div className={styles.list}>
        <ClearedBoard
          size="sm"
          headline={`${ring.label} closed`}
          figure={`${ring.done} of ${ring.target}`}
          note={ring.poolNote}
        />
      </div>
    );
  }

  return (
    <div className={styles.list}>
      <p className={styles.listHead}>
        <span className={styles.listHeading}>{meta.listHeading}</span>
        <span className={styles.listCount}>
          <span className="num">{ring.closers.length}</span> of{" "}
          <span className="num">{ring.poolCount}</span>
        </span>
      </p>
      <ul className={styles.rows}>
        {ring.closers.map((record) => (
          <li className={styles.row} key={record.prospect.id}>
            <span className={styles.rowName}>
              <RecordName prospectId={record.prospect.id} />
            </span>
            <LaneChip lane={record.prospect.lane} size="sm" />
            <span className={styles.rowWhy}>{whyFor(ring.id, record)}</span>
          </li>
        ))}
      </ul>
      <p className={styles.listNote}>{ring.poolNote}</p>
    </div>
  );
}

/** One line saying why this organisation is on this ring's list. */
function whyFor(id: RingId, record: RingReading["closers"][number]): string {
  if (id === "replies") {
    const days = record.daysSinceInbound;
    const when =
      days === null
        ? "They wrote last"
        : days === 0
          ? "They wrote today"
          : `They wrote ${days} ${days === 1 ? "day" : "days"} ago`;
    return `${when}. ${record.nextAction.label}.`;
  }
  if (id === "stale") return record.staleness.note;
  return `${record.prospect.city}. ${record.nextAction.label}.`;
}

// ---------------------------------------------------------------
// Targets
// ---------------------------------------------------------------

/**
 * The two adjustable targets, the suggestion beside each, and the off
 * switch.
 *
 * The reply target is not here because it is not a preference: it is
 * however many organisations are actually waiting on an answer, and a
 * setting that let somebody decide to owe four people instead of seven
 * would be a setting for lying to themselves.
 */
function TargetsPanel({
  reading,
  onOff,
}: {
  reading: DailyReading;
  onOff: () => void;
}) {
  const daily = useDaily();
  const dispatch = useDailyDispatch();

  const rows: { ring: "touches" | "stale"; label: string }[] = [
    { ring: "touches", label: "Touches a day" },
    { ring: "stale", label: "Stale cleared a day" },
  ];

  return (
    <div className={styles.targets} id="daily-rings-targets">
      {rows.map(({ ring, label }) => {
        const current = reading.byId[ring];
        const suggestion = reading.suggested[ring];
        const chosen = daily.targets[ring];
        return (
          <div className={styles.targetRow} key={ring}>
            <label className={styles.targetLabel} htmlFor={`daily-target-${ring}`}>
              {label}
            </label>
            <input
              id={`daily-target-${ring}`}
              className={`${styles.targetInput} num`}
              type="number"
              inputMode="numeric"
              min={TARGET_MIN}
              max={TARGET_MAX}
              value={current.target}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (!Number.isFinite(value)) return;
                dispatch({
                  type: "SET_TARGET",
                  ring,
                  value,
                  day: reading.day,
                });
              }}
            />
            {chosen !== null && chosen !== suggestion.value ? (
              <Button
                size="sm"
                onClick={() => dispatch({ type: "CLEAR_TARGET", ring })}
              >
                Use the suggested {suggestion.value}
              </Button>
            ) : null}
            <p className={styles.targetBasis}>{suggestion.basis}</p>
          </div>
        );
      })}

      <div className={styles.targetRow}>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            onOff();
            dispatch({ type: "SET_ENABLED", enabled: false });
          }}
        >
          Turn the daily rings off
        </Button>
        <p className={styles.targetBasis}>
          Off removes the strip. Nothing keeps counting behind it.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// The announcement
// ---------------------------------------------------------------

/**
 * What the live region says, and the rule that stops it nagging.
 *
 * A ring that is already closed when the page loads is not news, so the
 * first pass records which rings are closed without announcing any of
 * them. After that, a ring that closes while somebody is working
 * announces once, in words, and then the region falls back to the plain
 * figures. Nothing re-announces a state that has not changed, which is
 * the difference between a status line and a nag.
 */
function useAnnouncement(reading: DailyReading): string {
  const seen = useRef<Set<RingId> | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const figures = reading.rings
      .map((r) => `${r.label} ${r.done} of ${r.target}.`)
      .join(" ");

    if (seen.current === null) {
      seen.current = new Set(
        reading.rings.filter((r) => r.closed).map((r) => r.id),
      );
      setMessage(figures);
      return;
    }

    const newly = reading.rings.filter(
      (r) => r.closed && !seen.current?.has(r.id),
    );
    for (const r of reading.rings) {
      if (r.closed) seen.current.add(r.id);
      else seen.current.delete(r.id);
    }

    setMessage(
      newly.length > 0
        ? `${newly
            .map((r) => `${r.label} closed, ${r.done} of ${r.target}.`)
            .join(" ")} ${figures}`
        : figures,
    );
  }, [reading]);

  return message;
}
