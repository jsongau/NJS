import type { ReactNode } from "react";
import type { Provenance } from "@/domain/types";
import type { StatusToken } from "@/domain/vocabulary";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import styles from "./Panels.module.css";

/**
 * The three furniture pieces the supply-side screens share.
 *
 * /partners, /promo and /spend were written in one sitting and they each
 * open with a strip of counts, each draw proportion bars, and each carry
 * chip filters over a long table. Three copies of that furniture drift
 * within a week: one strip grows a shadow, one bar loses its number, one
 * filter forgets its pressed state. So the furniture lives here once and
 * the pages carry only what is actually different about them.
 *
 * ── EVERY BAR CARRIES ITS OWN NUMBER ──────────────────────────────
 * `Bar` will not render without a `value` string beside it. The owner of
 * this site is colourblind, and a proportion bar is the single most
 * common place a designer decides the colour is the information. A bar
 * whose meaning is its length and its hue is a bar that says nothing in
 * greyscale, on a printout, or to a reader with the wrong sort of eyes.
 *
 * ── AND EVERY STAT CARRIES ITS PROVENANCE ─────────────────────────
 * `Stat` requires a provenance. There is no way to render a figure on
 * these three screens without stating where it came from, which matters
 * more here than anywhere else in the application: almost every number on
 * the supply side is invented for the prototype, and the badge is the
 * only thing separating an honest model from a fabricated one.
 */

export function StatStrip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.strip} aria-label={label}>
      {children}
    </section>
  );
}

export function Stat({
  value,
  unit,
  label,
  note,
  provenance,
  tone,
  live = false,
}: {
  value: ReactNode;
  unit?: string;
  label: string;
  /** One line, carried in the title so it informs without taking space. */
  note: string;
  provenance: Provenance;
  /** A token name, never a raw colour. Only ever a second signal. */
  tone?: string;
  /**
   * Set on counts that change without a navigation, so a screen reader
   * hears the new number rather than being left on a stale one.
   */
  live?: boolean;
}) {
  return (
    <div className={styles.stat} title={note}>
      <span
        className={styles.statValue}
        style={tone ? { color: tone } : undefined}
        aria-live={live ? "polite" : undefined}
      >
        <span className="num">{value}</span>
        {unit ? <span className={styles.statUnit}>{unit}</span> : null}
      </span>
      <span className={styles.statLabel}>{label}</span>
      <ProvenanceBadge provenance={provenance} compact />
    </div>
  );
}

/**
 * A proportion bar that cannot be drawn without its figure.
 *
 * `over` is a separate flag rather than a computed one, because the
 * screens using this each mean something slightly different by it and a
 * bar that guessed would be wrong on one of them.
 */
export function Bar({
  pct,
  value,
  label,
  tone,
  over = false,
}: {
  pct: number;
  /** The number, printed. Not optional and never will be. */
  value: string;
  label: string;
  tone: string;
  over?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className={styles.bar}>
      <div
        className={styles.barTrack}
        role="img"
        aria-label={`${label}. ${value}.`}
      >
        <div
          className={over ? `${styles.barFill} ${styles.barOver}` : styles.barFill}
          style={{ width: `${clamped}%`, background: tone }}
        />
      </div>
      <span className={`${styles.barValue} num`}>{value}</span>
    </div>
  );
}

/**
 * A filter chip. Glyph, word, count, and a pressed state that is a border
 * and a weight rather than only a tint.
 */
export function FilterChip({
  token,
  count,
  pressed,
  onClick,
}: {
  token: StatusToken;
  count: number;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={pressed ? `${styles.chip} ${styles.chipOn}` : styles.chip}
      style={{ ["--tone" as string]: token.cssVar }}
      aria-pressed={pressed}
      onClick={onClick}
      title={token.note}
    >
      <span className={styles.chipGlyph} aria-hidden="true">
        {token.glyph}
      </span>
      <span>{token.label}</span>
      <span className={`${styles.chipCount} num`}>{count}</span>
    </button>
  );
}

/** A token rendered as a glyph and a word, for a table cell. */
export function TokenMark({
  token,
  small = false,
}: {
  token: StatusToken;
  small?: boolean;
}) {
  return (
    <span
      className={small ? `${styles.mark} ${styles.markSm}` : styles.mark}
      style={{ ["--tone" as string]: token.cssVar }}
      title={token.note}
    >
      <span className={styles.markGlyph} aria-hidden="true">
        {token.glyph}
      </span>
      <span>{token.label}</span>
    </span>
  );
}

/** A section head in the shape the finished pages already use. */
export function SectionHead({
  eyebrow,
  id,
  title,
  lede,
  meta,
}: {
  eyebrow: string;
  id: string;
  title: string;
  lede?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className={styles.sectionHead}>
      <p className={styles.sectionEyebrow}>{eyebrow}</p>
      <h2 id={id} className={styles.sectionTitle}>
        {title}
      </h2>
      {lede ? <p className={styles.sectionLede}>{lede}</p> : null}
      {meta ? <div className={styles.sectionMeta}>{meta}</div> : null}
    </div>
  );
}
