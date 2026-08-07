import { useState } from "react";
import { useTerritoryDispatch } from "@/state/TerritoryProvider";
import { usePlan, usePlanDispatch } from "@/state/PlanProvider";
import styles from "./StartOver.module.css";

/**
 * Start over.
 *
 * The plan persists to local storage, which is right for a rep who closes
 * a laptop mid-week and wrong for a demo: the second person to see this
 * app would otherwise inherit whatever the first person built. This puts
 * it back to the opening screen.
 *
 * Two clicks rather than a browser confirm dialog. A native confirm blocks
 * the page and looks like a 2009 web app; a second click in place is
 * faster, undoable by looking away, and does not leave the document.
 */
export function StartOver() {
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
    window.setTimeout(() => setDone(false), 2600);
  };

  if (done) {
    return (
      <span className={styles.done} role="status">
        <span aria-hidden="true">✓</span> Back to the opening state
      </span>
    );
  }

  if (arming) {
    return (
      <span className={styles.armed}>
        <span className={styles.armedText}>
          {lineCount > 0
            ? `Throw away ${lineCount} plan line${lineCount === 1 ? "" : "s"}?`
            : "Put everything back?"}
        </span>
        <button type="button" className={styles.confirm} onClick={reset}>
          Yes, start over
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
    >
      Start over
      {lineCount > 0 ? (
        <span className={`${styles.count} num`}>{lineCount}</span>
      ) : null}
    </button>
  );
}
