import type { Lane } from "@/domain/types";
import { LANE_META } from "@/domain/lanes";
import styles from "./LaneChip.module.css";

/**
 * A prospecting lane, as a chip.
 *
 * Three signals, and the chip is still readable if any two of them fail.
 * The lane GLYPH carries the identity, the SHORT LABEL spells it out, and
 * the colour is third. That ordering is not a preference: eight lanes is
 * exactly the count at which hand-picked hues produce a green and an
 * orange that are the same colour to eight percent of men, which in this
 * case would be the owner of the site. The palette in tokens.css is
 * Okabe-Ito for that reason, and this component still refuses to let
 * colour carry anything alone.
 *
 * ── THE CAP IS THE PART WORTH READING ─────────────────────────────
 * Every chip carries a small mark at its left edge, and its SHAPE
 * encodes the biggest single distinction in this application:
 *
 *   POINTED  calendar-locked. The date buys, not the buyer. A graduating
 *            class graduates whether or not anybody calls it, a season
 *            ends on its own, a term finishes. Certain, and pointed at a
 *            date on a calendar.
 *
 *   SQUARE   discretionary. Somebody has to decide there will be an event
 *            at all. A holiday party, an offsite, a client night. Real
 *            budget, no date until a person picks one, and cancellable
 *            right up until it happens.
 *
 * Those are different sales calls made at different times of year, and a
 * reader flicking between two boards should be able to feel which class
 * they are looking at before they read a single word. The colour system
 * already runs calendar-locked lanes cool and discretionary lanes warm;
 * the cap is the same distinction printed in shape, so it survives
 * greyscale, a photocopier and a colourblind reader.
 */
export function LaneChip({
  lane,
  size = "md",
  /** Drops the word and keeps the mark, for a map legend or a dense cell. */
  glyphOnly = false,
}: {
  lane: Lane;
  size?: "sm" | "md";
  glyphOnly?: boolean;
}) {
  const meta = LANE_META[lane];
  const locked = meta.occasionClass === "calendar-locked";

  return (
    <span
      className={[
        styles.chip,
        styles[size],
        locked ? styles.locked : styles.discretionary,
      ].join(" ")}
      style={{
        ["--lane" as string]: meta.cssVar,
        ["--laneTint" as string]: meta.tintVar,
      }}
      title={`${meta.label}. ${
        locked
          ? "Calendar-locked: their event happens whether or not anybody calls."
          : "Discretionary: somebody has to decide there will be an event at all."
      }`}
    >
      <span className={styles.cap} aria-hidden="true" />
      <span className={styles.glyph} aria-hidden="true">
        {meta.glyph}
      </span>
      {glyphOnly ? (
        <span className="visually-hidden">{meta.label}</span>
      ) : (
        <span className={styles.label}>{meta.short}</span>
      )}
    </span>
  );
}

/**
 * The two occasion classes as a standalone chip, for a legend or a filter
 * bar where the lane itself is not the subject.
 *
 * It reuses the same two cap shapes rather than inventing a third
 * vocabulary, so a reader who learns the pointed cap once on the lane
 * board reads it everywhere else for free.
 */
export function OccasionClassChip({
  lane,
  size = "sm",
}: {
  lane: Lane;
  size?: "sm" | "md";
}) {
  const locked = LANE_META[lane].occasionClass === "calendar-locked";
  return (
    <span
      className={[
        styles.chip,
        styles[size],
        styles.neutralChip,
        locked ? styles.locked : styles.discretionary,
      ].join(" ")}
    >
      <span className={styles.cap} aria-hidden="true" />
      <span className={styles.label}>
        {locked ? "Calendar-locked" : "Discretionary"}
      </span>
    </span>
  );
}
