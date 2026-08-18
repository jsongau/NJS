import { useEffect, useRef, useState } from "react";
import {
  StorageNote,
  lostSentence,
  useEditLedger,
  useResetEverything,
} from "./ResetControl";
import { usePersistenceStatus } from "@/state/persist";
import styles from "./StartOver.module.css";

/**
 * Start over, in the body of a page rather than in the chrome.
 *
 * The same action as ResetControl and deliberately a different control.
 * ResetControl lives in the nav, where it has to be small and permanently
 * present without ever pulling the eye. This one appears at the bottom of
 * the method page and in the empty state of the outbox, where a reader
 * has just finished reading something and the useful next sentence is
 * "put it back and try it yourself".
 *
 * Sharing the counting, the reset order, the sentence and the storage
 * note rather than the component is the right split: what "a change"
 * means, what gets destroyed and what a person is told about where their
 * work lives must be identical in both places. How loud the button is
 * should not be.
 *
 * This one has the room the nav does not, so it says the whole thing:
 * the storage line is a sentence rather than four words, and the
 * confirmation sits inline where the reader is already looking instead of
 * dropping as a panel.
 */
export function StartOver({
  label = "Start over",
}: {
  /** The page can name the action in its own words. */
  label?: string;
}) {
  const ledger = useEditLedger();
  const resetEverything = useResetEverything();
  const status = usePersistenceStatus();

  const [arming, setArming] = useState(false);
  const [done, setDone] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  /* Focus lands on the safe button, never on the destructive one. */
  useEffect(() => {
    if (arming) cancelRef.current?.focus();
  }, [arming]);

  const reset = () => {
    resetEverything();
    setArming(false);
    setDone(true);
    window.setTimeout(() => setDone(false), 2600);
  };

  if (done) {
    return (
      <div className={styles.root}>
        <span className={styles.done} role="status">
          <span aria-hidden="true">✓</span> Back to the opening state. Nothing
          is saved in this browser now.
        </span>
      </div>
    );
  }

  if (arming) {
    return (
      <div
        className={styles.root}
        onKeyDown={(e) => {
          if (e.key === "Escape") setArming(false);
        }}
      >
        <div className={styles.armed} role="group" aria-label="Confirm start over">
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
              Yes, start over
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setArming(true)}
        aria-expanded={false}
      >
        {label}
        {ledger.total > 0 ? (
          <span className={`${styles.count} num`}>
            {ledger.total}
            <span className="visually-hidden">
              {ledger.total === 1 ? " change" : " changes"} to throw away
            </span>
          </span>
        ) : null}
      </button>
      <StorageNote />
    </div>
  );
}
