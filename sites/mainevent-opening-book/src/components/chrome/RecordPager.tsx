import { useEffect, useRef } from "react";
import styles from "./RecordPager.module.css";

/**
 * PREVIOUS AND NEXT, ACROSS THE SET THE FILTERS LEFT BEHIND.
 *
 * ── WHAT A QUEUE IS FOR ───────────────────────────────────────────
 * A list screen invites one behaviour: read the list, pick a row, deal
 * with it, go back to the list, find your place again, pick the next
 * row. The going back is the whole cost, and it is paid once per record.
 * On a queue of nineteen that is eighteen trips back to a page whose
 * scroll position, filter and sort all have to be right, and the reliable
 * consequence is that a person works the rows they can see and the tail
 * of the queue quietly never gets worked at all.
 *
 * A pager removes the trip. Previous, Next, and the size of the set
 * between them, so the queue can be walked from one end to the other
 * without the list ever being the thing you navigate. It is the oldest
 * control in customer software and it is the one that makes a queue feel
 * like work rather than like a report.
 *
 * ── WHAT IT STEPS, AND WHY IT IS NOT THE DRAWER ───────────────────
 * It steps the CURRENT RECORD ON THE PAGE: the row is marked, scrolled
 * to and given focus, and opening it is then one keystroke.
 *
 * The obvious alternative was to have Next open the next record's drawer
 * directly, which is what most CRMs do. It cannot be done from here and
 * it is worth saying why rather than leaving it looking like an
 * oversight. Both drawers in this application are `aria-modal="true"`,
 * which is correct for what they are, and it means everything outside
 * them is hidden from assistive technology while one is open. A pager
 * living in the page header would therefore be unreachable at exactly
 * the moment it was meant to be used, and a Next button that a screen
 * reader user cannot get to is a Next button that only works for people
 * who were already fine. Stepping the row and handing it focus works for
 * everybody, and the drawers stay honest about being modal.
 *
 * ── DISABLED, WITH A REASON, AND STILL REACHABLE ──────────────────
 * The ends of a queue are where a pager usually lies. A Next that is
 * greyed out and says nothing leaves a reader wondering whether they
 * reached the end or whether the control is broken, and a `disabled`
 * attribute makes it worse by removing the control from the tab order
 * entirely, so the explanation attached to it can never be read.
 *
 * So the boundary controls carry `aria-disabled` rather than `disabled`.
 * They stay focusable, they announce that they are unavailable, they do
 * nothing when pressed, and the sentence saying why is both on screen
 * and wired to them by aria-describedby. The reason line holds its
 * height whether or not there is a reason in it, so nothing below the
 * pager moves as the queue is walked.
 */

export interface RecordPagerProps {
  /**
   * The filtered set, in the order it is drawn on screen. The pager
   * walks exactly this, which is what makes "N in this queue" a figure a
   * reader can check against the rows in front of them.
   */
  ids: string[];
  /** The record being stood on, or null before anything has been picked. */
  currentId: string | null;
  onChange: (id: string) => void;
  /** One record and many, so the sentences read properly at every count. */
  noun: readonly [one: string, many: string];
  /** Read after the figure. "in this queue", "on this board". */
  setLabel: string;
}

export function RecordPager({
  ids,
  currentId,
  onChange,
  noun,
  setLabel,
}: RecordPagerProps) {
  const [one, many] = noun;
  const total = ids.length;
  const at = currentId === null ? -1 : ids.indexOf(currentId);

  /*
    An id that has fallen out of the filtered set is treated as no
    position at all rather than as position zero. A pager that silently
    jumps to the top of the queue when a filter changes moves a reader
    without telling them, and the next thing they do is act on the wrong
    record.
  */
  const hasPlace = at >= 0;
  const atFirst = hasPlace && at === 0;
  const atLast = hasPlace && at === total - 1;

  const empty = total === 0;
  const previousOff = empty || !hasPlace || atFirst;
  const nextOff = empty || (hasPlace && atLast);

  const word = total === 1 ? one : many;

  let reason = "";
  if (empty) {
    reason = `No ${many} match the filters that are on, so there is nothing to step through.`;
  } else if (!hasPlace) {
    reason = `Nothing is open yet. Next opens the first of ${total}.`;
  } else if (atFirst && atLast) {
    reason = `One ${one} in this set, so there is nothing either side of it.`;
  } else if (atFirst) {
    reason = `This is the first of ${total}. Nothing sits before it in this order.`;
  } else if (atLast) {
    reason = `This is the last of ${total}. Nothing sits after it in this order.`;
  }

  const reasonId = "record-pager-reason";

  const step = (delta: number) => {
    if (empty) return;
    const target = hasPlace ? at + delta : 0;
    if (target < 0 || target >= total) return;
    const id = ids[target];
    if (id) onChange(id);
  };

  return (
    <nav
      className={styles.pager}
      aria-label={`Step through the ${many} one at a time`}
    >
      <button
        type="button"
        className={styles.step}
        aria-disabled={previousOff}
        aria-describedby={previousOff && reason ? reasonId : undefined}
        onClick={() => {
          if (previousOff) return;
          step(-1);
        }}
      >
        <span aria-hidden="true" className={styles.arrowGlyph}>
          ◂
        </span>
        <span>Previous</span>
      </button>

      <p className={styles.place}>
        {/*
          THE POSITION IS THE LIVE REGION AND THE COUNT IS NOT. The count
          is a property of the filter and it is announced by the count
          line on the page itself; the position is a property of the
          press that just happened, and it is the only thing a person
          stepping a queue with their eyes elsewhere needs read back.
        */}
        <span className={styles.position} aria-live="polite">
          {hasPlace ? (
            <>
              <span className="num">{at + 1}</span>
              <span className={styles.of}>of</span>
              <span className="num">{total}</span>
            </>
          ) : (
            <span className={styles.none}>None open</span>
          )}
        </span>
        <span className={styles.setLine}>
          <span className="num">{total}</span> {word} {setLabel}
        </span>
      </p>

      <button
        type="button"
        className={styles.step}
        aria-disabled={nextOff}
        aria-describedby={nextOff && reason ? reasonId : undefined}
        onClick={() => {
          if (nextOff) return;
          step(1);
        }}
      >
        <span>Next</span>
        <span aria-hidden="true" className={styles.arrowGlyph}>
          ▸
        </span>
      </button>

      <p className={styles.reason} id={reasonId}>
        {reason}
      </p>
    </nav>
  );
}

/**
 * Puts the reader on the record the pager just chose.
 *
 * Scroll it to the middle of the viewport and give it focus, which is
 * two separate obligations and both of them matter. The scroll is for
 * the person watching; the focus is for the person listening, and for
 * the person on a keyboard whose next key press should act on the record
 * rather than on wherever the button left them. Centring rather than
 * aligning to the top keeps the record clear of the sticky band above
 * it without anybody having to know how tall that band is.
 *
 * The first render is deliberately not honoured. Every screen here opens
 * with no record chosen, and a page that scrolled itself somewhere on
 * arrival because a query string mentioned a row would be taking the
 * reader's place away before they had one.
 */
export function useRecordFocus(currentId: string | null): void {
  const seen = useRef<string | null>(null);

  useEffect(() => {
    if (currentId === null) {
      seen.current = null;
      return;
    }
    if (seen.current === currentId) return;
    seen.current = currentId;

    const escaped =
      typeof CSS !== "undefined" && typeof CSS.escape === "function"
        ? CSS.escape(currentId)
        : currentId.replace(/["\\]/g, "\\$&");
    const el = document.querySelector<HTMLElement>(
      `[data-record-id="${escaped}"]`,
    );
    if (!el) return;
    el.scrollIntoView({ block: "center" });
    el.focus({ preventScroll: true });
  }, [currentId]);
}
