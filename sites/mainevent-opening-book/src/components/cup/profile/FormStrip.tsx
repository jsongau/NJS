import type { FormLetter } from "@/domain/selectors/cup";
import styles from "./FormStrip.module.css";

/**
 * THE LAST FIVE, AS LETTERS.
 *
 * The convention every scoreboard on earth uses is a strip of the last
 * five or six results as letters WITH a colour, and the order of those
 * two matters: the letter is the primary signal and the colour is
 * redundant reinforcement. That is why the pattern has survived, and it
 * is why this one prints W and L rather than painting two kinds of dot.
 * It survives greyscale, a printout on a general manager's desk and a
 * reader with the wrong sort of eyes.
 *
 * The direction is stated and it never changes. Both orders exist in the
 * wild and no source settles it, so this one is oldest on the left,
 * reading into tonight, which is the way a bracket reads.
 */
export function FormStrip({
  form,
  label,
  note,
}: {
  form: FormLetter[];
  label: string;
  note?: string;
}) {
  if (form.length === 0) {
    return (
      <p className={styles.blank}>
        <span className={styles.label}>{label}</span>
        <span className={styles.none}>
          <span aria-hidden="true">○</span> No matches bowled yet
        </span>
      </p>
    );
  }

  return (
    <div className={styles.wrap}>
      <span className={styles.label}>{label}</span>
      <ol
        className={styles.strip}
        aria-label={`${label}. ${form.map((f) => (f === "W" ? "won" : "lost")).join(", ")}.`}
      >
        {form.map((letter, i) => (
          <li
            key={`${i}-${letter}`}
            className={
              letter === "W" ? `${styles.cell} ${styles.won}` : `${styles.cell} ${styles.lost}`
            }
            title={letter === "W" ? "Won" : "Lost"}
          >
            <span aria-hidden="true">{letter}</span>
            <span className="visually-hidden">
              {letter === "W" ? "won" : "lost"}
            </span>
          </li>
        ))}
      </ol>
      {note ? <span className={styles.note}>{note}</span> : null}
    </div>
  );
}
