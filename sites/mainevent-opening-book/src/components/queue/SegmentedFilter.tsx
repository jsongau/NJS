import styles from "./SegmentedFilter.module.css";

/**
 * THE PRESS, DIRECTLY ABOVE THE THING IT CHANGES.
 *
 * A filter offered only from a select in the header band, or only from
 * four cards a scroll below the fold, puts distance between the press and
 * the consequence, and distance is what makes a reader believe nothing
 * happened. This row sits immediately above the working set lead, so the
 * press and the answer are within a hundred pixels of each other.
 *
 * It is a group of toggle buttons rather than a tab list on purpose. Tabs
 * carry a contract this is not honouring: arrow keys move between them,
 * one is always selected, and the panel is owned by the tab. Here every
 * segment is an independent press, the whole set can be cleared, and the
 * same filter is also reachable from the header select and from the rail
 * and from a link somebody pasted. aria-pressed states what a toggle is,
 * and a group label says what the row is for.
 *
 * WHAT IS SELECTED IS NOT SIGNALLED BY COLOUR. The pressed segment gains
 * a rule under it, a heavier weight and a filled marker before its label,
 * and it says so in aria-pressed. The tone is the last of the four and
 * carries none of the meaning on its own.
 */

export interface Segment {
  value: string;
  label: string;
  /** Shape before hue, as everywhere else in this application. */
  glyph: string;
  count: number;
  /** A token reference for this segment's own tone. Optional. */
  tone?: string;
}

export function SegmentedFilter({
  label,
  value,
  segments,
  onChange,
  countLabel,
}: {
  /** Names the axis for a screen reader. Not drawn. */
  label: string;
  value: string;
  segments: Segment[];
  onChange: (value: string) => void;
  /** What the counts count, said once for anybody listening. */
  countLabel: string;
}) {
  return (
    <div className={styles.bar} role="group" aria-label={label}>
      {segments.map((s) => {
        const on = s.value === value;
        return (
          <button
            key={s.value}
            type="button"
            className={styles.seg}
            data-on={on ? "yes" : "no"}
            aria-pressed={on}
            style={{ ["--tone" as string]: s.tone ?? "var(--line-strong)" }}
            onClick={() => onChange(s.value)}
          >
            <span className={styles.mark} aria-hidden="true">
              {on ? "●" : "○"}
            </span>
            <span className={styles.glyph} aria-hidden="true">
              {s.glyph}
            </span>
            <span className={styles.label}>{s.label}</span>
            <span className={`${styles.count} num`}>{s.count}</span>
            <span className="visually-hidden"> {countLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
