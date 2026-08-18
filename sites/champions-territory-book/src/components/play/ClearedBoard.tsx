import type { ReactNode } from "react";
import styles from "./ClearedBoard.module.css";

/**
 * AN EMPTY QUEUE IS A RESULT, SO IT IS DRAWN AS ONE.
 *
 * ── WHAT THIS REPLACES ────────────────────────────────────────────
 * A hollow square glyph and a sentence in the dimmest ink in the ramp,
 * on every surface in this application that can run out of rows. That is
 * how an interface renders an absence, and an absence is the wrong
 * reading. No unworked lead left at four in the afternoon is the best
 * outcome the whole product has; the screen was reporting it in the
 * typography of a missing record.
 *
 * ── THE MARK IS A STRUCK BOX, AND IT IS NOT DECORATION ────────────
 * A dispatcher working a paper call sheet puts a cross through the box
 * when the last row has been rung, quoted or handed to a truck. It is
 * the plainest mark in the domain that already means "all of these are
 * done", and it needs no key. So the mark is that box, drawn at forty
 * four units with the same two unit stroke language every other mark in
 * this set uses, and lit in the section's own colour.
 *
 * We are claiming nothing about any real dispatch desk here. The mark is
 * chosen because it is legible at a glance and survives greyscale, not
 * because a specific brand draws it this way.
 *
 * ── SHORT, BECAUSE A REWARD THAT TALKS IS A LECTURE ───────────────
 * A mark, two or three words, and at most one figure. No paragraph, no
 * congratulation, no character saying well done. The contract on this
 * codebase is labels, verbs and numbers, and a cleared board is exactly
 * the place where a designer starts writing prose.
 *
 * COLOUR IS THE THIRD SIGNAL. The struck box, the word and the figure
 * all say the same thing. Take the colour out and every reading
 * survives.
 */
export function ClearedBoard({
  /** Two or three words. "Queue cleared". "Nothing waiting". */
  headline,
  /** One figure and its word, at most. Optional and usually right. */
  figure,
  /** A single short clause, where the figure needs a referent. */
  note,
  size = "md",
}: {
  headline: string;
  figure?: ReactNode;
  note?: string;
  size?: "sm" | "md";
}) {
  return (
    <div className={styles.cleared} data-size={size}>
      <StrikeMark size={size === "sm" ? 30 : 42} />
      <p className={styles.words}>
        <span className={styles.headline}>{headline}</span>
        {figure ? <span className={styles.figure}>{figure}</span> : null}
        {note ? <span className={styles.note}>{note}</span> : null}
      </p>
    </div>
  );
}

/**
 * The struck box. A square with its corners eased and a heavy cross
 * through it, drawn on a twenty four unit field so it sits in the same
 * family as every section mark.
 *
 * The box is the row's ink and the cross is the section colour, which is
 * the same two colour rule the section marks follow. The cross is drawn
 * as a stroke rather than as a fill because a stroked cross at this
 * weight reads as something somebody wrote on the sheet, which is what
 * it is.
 */
export function StrikeMark({ size = 42 }: { size?: number }) {
  return (
    <svg
      className={styles.strike}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <rect
        className={styles.strikeBox}
        x="2.6"
        y="2.6"
        width="18.8"
        height="18.8"
        rx="4.4"
      />
      <path className={styles.strikeCross} d="M7.4 7.4 16.6 16.6M16.6 7.4 7.4 16.6" />
    </svg>
  );
}
