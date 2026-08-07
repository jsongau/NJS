import { useState } from "react";
import { useTerritoryDispatch } from "@/state/TerritoryProvider";
import { usePlan, usePlanDispatch } from "@/state/PlanProvider";
import styles from "./ResetControl.module.css";

/**
 * Reset everything.
 *
 * Lives where the Demo Mode badge used to. That badge was doing real work
 * and its job did not disappear with it: the demo guarantee now sits on
 * the compose window, on both order portals, and in the footer of every
 * generated email, which is where a person actually needs to read it.
 * A permanent banner in the chrome had become wallpaper.
 *
 * The plan persists to local storage, which is right for a rep who closes
 * a laptop mid-week and wrong for a demo. Two clicks rather than a
 * browser confirm: a native confirm blocks the page and looks like a 2009
 * web app, and a second click in place is faster and abandonable by
 * looking away.
 */

/** Drawn rather than imported. One glyph, no icon dependency, and it can
 *  carry state: the ring completes, and the arrowhead sits on the path. */
function ResetGlyph({ armed }: { armed: boolean }) {
  return (
    <svg
      className={[styles.glyph, armed ? styles.glyphArmed : ""].join(" ")}
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
      {/* Arrowhead, sitting on the end of the path rather than beside it. */}
      <path
        className={styles.head}
        d="M20.6 3.6v5.1h-5.1"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* A dot at the centre so the mark has weight at 15px, where a thin
          ring alone reads as a smudge. */}
      <circle className={styles.core} cx="12" cy="12" r="2.4" fill="currentColor" />
    </svg>
  );
}

export function ResetControl() {
  const territoryDispatch = useTerritoryDispatch();
  const planDispatch = usePlanDispatch();
  const plan = usePlan();
  const [arming, setArming] = useState(false);
  const [done, setDone] = useState(false);

  const lineCount = plan.retail.length + plan.sellIn.length;

  const reset = () => {
    planDispatch({ type: "CLEAR" });
    territoryDispatch({ type: "RESET_ALL" });
    setArming(false);
    setDone(true);
    window.setTimeout(() => setDone(false), 2400);
  };

  if (done) {
    return (
      <span className={styles.done} role="status">
        <ResetGlyph armed={false} />
        Back to the start
      </span>
    );
  }

  if (arming) {
    return (
      <span className={styles.armed}>
        <span className={styles.armedText}>
          {lineCount > 0
            ? `Clear ${lineCount} plan line${lineCount === 1 ? "" : "s"}?`
            : "Reset everything?"}
        </span>
        <button type="button" className={styles.confirm} onClick={reset}>
          Reset
        </button>
        <button
          type="button"
          className={styles.cancel}
          onClick={() => setArming(false)}
        >
          Keep it
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      className={styles.trigger}
      onClick={() => setArming(true)}
      title="Clear the plan and put every screen back to its opening state"
    >
      <ResetGlyph armed={false} />
      Reset
      {lineCount > 0 ? (
        <span className={`${styles.count} num`}>{lineCount}</span>
      ) : null}
    </button>
  );
}
