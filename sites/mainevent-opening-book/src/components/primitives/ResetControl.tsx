import { useEffect, useRef, useState } from "react";
import { usePipeline, usePipelineDispatch } from "@/state/PipelineProvider";
import { useBook, useBookDispatch } from "@/state/BookProvider";
import { useOutbox, useOutboxDispatch } from "@/state/OutboxProvider";
import { useObjections, useObjectionDispatch } from "@/state/ObjectionProvider";
import { clearPersisted, diffRows, usePersistenceStatus } from "@/state/persist";
import { SEED_ACTIVITY, SEED_BOOK } from "@/data/book";
import styles from "./ResetControl.module.css";

const idOf = (row: { id: string }) => row.id;

/**
 * Put the pipeline back to its opening state, and mean it.
 *
 * ── WHY THIS CONTROL GOT SERIOUS ──────────────────────────────────
 * This app now keeps the reader's work in local storage, which changes
 * what a reset IS. It used to drop four reducers back to their seeds and
 * a refresh would have done the same thing by accident. Now it is the
 * only way to throw away work that would otherwise still be here next
 * week, so it clears the storage key as well, and it says out loud what
 * is about to go before it goes.
 *
 * A destructive control that fires on one click, in the chrome, next to
 * the navigation, is a control somebody will hit on the way to something
 * else. So the trigger only ARMS: the sentence naming the losses appears,
 * announced to a screen reader, and the confirm is a second, separate,
 * deliberate press. Nothing is destroyed until then and looking away
 * abandons it.
 *
 * TWO CLICKS RATHER THAN A BROWSER CONFIRM. A native confirm blocks the
 * page, cannot be styled, cannot carry the breakdown, and looks like a
 * 2009 web app.
 *
 * ── THE COUNT ON THE BUTTON IS THE INTERESTING PART ───────────────
 * It counts what the READER has changed, not how much data exists. The
 * seeded pipeline has two hundred and eleven organisations, two contracts
 * and six replies in it before anybody touches anything, so a badge showing
 * the size of the data set would read "219" on a screen where nothing has
 * happened, which tells nobody anything and makes the reset look
 * dangerous.
 *
 * What is countable and honest is the edits: a status row whose
 * provenance is "user_input" was moved by a person, a book or activity
 * line that no longer matches the seed was added or edited by one, an
 * objection that is no longer open was dispositioned by one, and a sent
 * message beyond the seeded five was sent by one. Four sources, one
 * number, and it reads zero on a fresh load.
 *
 * ── AND IT SAYS WHERE THE WORK LIVES ──────────────────────────────
 * Under the button, permanently, quietly: kept in this browser. Somebody
 * tracking real group bookings deserves to know that their pipeline is
 * sitting in one browser profile on one machine, that nothing is synced,
 * and that clearing site data takes it with them. It is also the only
 * place the app can tell them when storage has failed and today's work is
 * living in memory until the tab closes.
 */

/** Drawn rather than imported. One glyph, no icon dependency, and it can
 *  carry state: the ring completes on hover and the arrowhead rides it. */
function ResetGlyph() {
  return (
    <svg
      className={styles.glyph}
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      aria-hidden="true"
    >
      {/* The open ring. A gap at the top right is where the arrow enters,
          which is what makes it read as a cycle rather than a circle. */}
      <path
        className={styles.ring}
        d="M20.5 12a8.5 8.5 0 1 1-2.9-6.4"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path
        className={styles.head}
        d="M20.6 3.6v5.1h-5.1"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* A dot at the centre so the mark has weight at 15px, where a thin
          ring on its own reads as a smudge. */}
      <circle className={styles.core} cx="12" cy="12" r="2.4" fill="currentColor" />
    </svg>
  );
}

/**
 * Every edit a reader has made, itemised.
 *
 * Itemised rather than summed, because the confirmation has to name what
 * it is about to destroy and "4 changes" names nothing. A person who has
 * spent twenty minutes moving statuses and one minute sending a quote
 * should see both in the sentence and be able to decide.
 */
export interface EditLedger {
  statuses: number;
  bookings: number;
  activity: number;
  sent: number;
  objections: number;
  total: number;
}

export function useEditLedger(): EditLedger {
  const pipeline = usePipeline();
  const book = useBook();
  const outbox = useOutbox();
  const objections = useObjections();

  const statuses = pipeline.statuses.filter(
    (s) => s.provenance === "user_input",
  ).length;

  /*
    THE BOOK IS COUNTED BY DIFFING IT AGAINST THE SEED, not by looking for
    lines that lack a seed id.

    The id test was here first and it counted additions only, which was
    survivable while nothing survived a reload: a guest count typed onto a
    seeded contract was gone at the next refresh whether the badge
    mentioned it or not. It is not survivable now. That edit is kept, it
    is the single most likely thing a reader changes on the Book page, and
    a confirmation that offers to throw away "nothing" and then throws
    away a corrected headcount has lied to somebody at the worst possible
    moment.

    Diffing against the seed also makes the badge agree with storage by
    construction: this is the same comparison the persistence layer runs
    to decide what to write, so the number on the button is exactly the
    number of things that would be lost.
  */
  const bookDelta = diffRows(SEED_BOOK, book.book, idOf);
  const activityDelta = diffRows(SEED_ACTIVITY, book.activity, idOf);
  const bookings = bookDelta
    ? bookDelta.changed.length + bookDelta.removed.length
    : 0;
  const activity = activityDelta
    ? activityDelta.changed.length + activityDelta.removed.length
    : 0;
  /* Seeded outbox ids are "sent-0001" through "sent-0005". Live ones are
     stamped with Date.now(), so they are thirteen digits rather than
     four, and one regular expression separates them for good. */
  const sent = outbox.sent.filter((m) => !/^sent-\d{4}$/.test(m.id)).length;
  const objectionEdits = objections.entries.filter(
    (e) => e.disposition !== "open" || e.note,
  ).length;

  return {
    statuses,
    bookings,
    activity,
    sent,
    objections: objectionEdits,
    total: statuses + bookings + activity + sent + objectionEdits,
  };
}

/** The single number, for the badge. Kept for every existing caller. */
export function useEditCount(): number {
  return useEditLedger().total;
}

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

/**
 * What is about to be lost, in a sentence a person can act on.
 *
 * A confirmation that says "are you sure" has told the reader nothing
 * they did not already know and puts the whole decision on a word they
 * cannot check. This one names the pieces and where they are stored, so
 * the answer is informed rather than brave.
 */
export function lostSentence(ledger: EditLedger, storedHere: boolean): string {
  /* The two settings live in the same storage key as the work, so a
     reset takes them with it. That was true before this sentence said so,
     which is the part worth fixing: a reader who has chosen the light
     ground and armed the sound gets both silently undone by a control
     they pressed to throw away a pipeline. Naming them costs six words
     and makes the confirmation honest about its own blast radius. */
  const where = storedHere
    ? " It also clears what this browser has saved, including the ground you are on and whether sound is armed."
    : "";
  if (ledger.total === 0) {
    return `Nothing has been changed yet. Reset puts every screen back to the seeded pipeline.${where}`;
  }
  const parts: string[] = [];
  if (ledger.statuses) parts.push(plural(ledger.statuses, "status move", "status moves"));
  if (ledger.bookings) parts.push(plural(ledger.bookings, "book edit", "book edits"));
  if (ledger.activity) parts.push(plural(ledger.activity, "planned shift", "planned shifts"));
  if (ledger.sent) parts.push(plural(ledger.sent, "sent message", "sent messages"));
  if (ledger.objections)
    parts.push(plural(ledger.objections, "objection entry", "objection entries"));
  const list =
    parts.length === 1
      ? parts[0]
      : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
  return `This throws away ${list}.${where} The seeded pipeline comes back.`;
}

/**
 * One reset, four providers and the storage key, in that order.
 *
 * Storage is cleared FIRST. If it were cleared last, a dispatch could
 * schedule a write of the old state in between and land it after the
 * clear, which would leave a reader who reset their board looking at a
 * clean screen and holding a saved copy of everything they meant to
 * throw away. Both reset controls share this function for that reason:
 * an ordering rule written down twice is a rule that will disagree with
 * itself.
 */
export function useResetEverything(): () => void {
  const pipelineDispatch = usePipelineDispatch();
  const bookDispatch = useBookDispatch();
  const outboxDispatch = useOutboxDispatch();
  const objectionDispatch = useObjectionDispatch();

  return () => {
    clearPersisted();
    pipelineDispatch({ type: "RESET" });
    bookDispatch({ type: "RESET" });
    outboxDispatch({ type: "RESET" });
    objectionDispatch({ type: "RESET" });
  };
}

/**
 * Where the work is kept, said plainly.
 *
 * Rendered in both reset controls rather than in the chrome on its own,
 * because the place a person asks "wait, where is this saved" is the
 * moment they are looking at a button that can delete it.
 *
 * Colour is never the only signal here: each state carries a glyph and a
 * word, and the failed state is a different word rather than a red
 * version of the same one.
 */
export function StorageNote({ compact = false }: { compact?: boolean }) {
  const status = usePersistenceStatus();
  if (status.mode === "memory") {
    return (
      <p className={`${styles.storage} ${styles.storageWarn}`} role="status">
        <span aria-hidden="true">△</span>
        <span>
          Not being saved. {status.reason}
        </span>
      </p>
    );
  }
  return (
    <p
      className={`${styles.storage} ${compact ? styles.storageCompact : ""}`}
      title="Saved in this browser's local storage under one key. Clearing site data clears it."
    >
      <span aria-hidden="true">▣</span>
      <span>
        {compact
          ? "Kept in this browser only"
          : "Your work is kept in this browser only. Nothing is uploaded, nothing is synced, and it will not follow you to another device."}
      </span>
    </p>
  );
}

export function ResetControl() {
  const ledger = useEditLedger();
  const resetEverything = useResetEverything();
  const status = usePersistenceStatus();

  const [arming, setArming] = useState(false);
  const [done, setDone] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  /* Focus lands on KEEP IT, not on the destructive button. A reader who
     arms this by accident and hits the space bar should keep their
     week. */
  useEffect(() => {
    if (arming) cancelRef.current?.focus();
  }, [arming]);

  const reset = () => {
    resetEverything();
    setArming(false);
    setDone(true);
    window.setTimeout(() => setDone(false), 2400);
  };

  if (done) {
    return (
      <div className={styles.root}>
        <span className={styles.done} role="status">
          <ResetGlyph />
          Back to the start
        </span>
        <StorageNote compact />
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setArming(true)}
        aria-expanded={arming}
        title="Put the pipeline, the book, the outbox and the objection register back to their opening state, and clear what this browser has saved"
      >
        <ResetGlyph />
        Reset
        {ledger.total > 0 ? (
          <span className={`${styles.count} num`}>
            {ledger.total}
            <span className="visually-hidden">
              {ledger.total === 1 ? " change" : " changes"} to throw away
            </span>
          </span>
        ) : null}
      </button>

      {arming ? (
        <div
          className={styles.armed}
          role="group"
          aria-label="Confirm reset"
          /* Escape abandons it. A destructive panel a keyboard reader can
             only leave by tabbing to the right button is a panel that
             gets confirmed by mistake. */
          onKeyDown={(e) => {
            if (e.key === "Escape") setArming(false);
          }}
        >
          {/* Assertive, because it is describing something about to be
              destroyed and a polite queue can leave it behind the label
              of whatever the reader tabs to next. */}
          <p className={styles.armedText} aria-live="assertive">
            {lostSentence(ledger, status.mode === "browser")}
          </p>
          <div className={styles.armedActions}>
            <button
              type="button"
              ref={cancelRef}
              className={styles.cancel}
              onClick={() => setArming(false)}
            >
              Keep it
            </button>
            <button type="button" className={styles.confirm} onClick={reset}>
              Yes, reset
            </button>
          </div>
        </div>
      ) : null}

      <StorageNote compact />
    </div>
  );
}
