import type { Lane } from "@/domain/types";
import { LANE_META } from "@/domain/lanes";
import { LaneChip } from "./LaneChip";
import styles from "./Wordmark.module.css";

/**
 * A prospect's identity: its name, set in type, with its lane beside it.
 *
 * THIS IS THE DESIGN, NOT A FALLBACK. There are no rights to the marks of
 * ABC Unified, Irvine College, Lexus of Irvine or any of the
 * other organisations in this data set, and the
 * obvious source for storefront photography prohibits this use. A
 * well-set name on a
 * lane-keyed card looks deliberate; scraped logos at mismatched
 * resolutions look scraped. The legally safe option here is also the
 * better looking one.
 *
 * THE INITIALS PLATE EXISTS FOR SCANNING, not for decoration. A desk with
 * twenty rows on it is read down the left edge, and two letters in a
 * bordered square is the fastest thing there is to fix on while the eye
 * is moving. The lane glyph sits behind them as a watermark so the row is
 * identifiable by class before a single word has been read.
 *
 * Everything a lane means is READ from LANE_META rather than declared
 * here. It used to be declared in components like this one, and the cost
 * showed up the moment a lane was added: the union told me about the map
 * in this file and said nothing about the four other files that also had
 * an opinion about what a lane is called.
 */

/**
 * Two letters, chosen the way a person would choose them.
 *
 * Leading articles are dropped, because "Th" for The Phoenix Club and
 * "Th" for The Cause Church is two rows that look identical in the one
 * place the plate is supposed to be doing work. A single-word name takes
 * its first two letters instead.
 */
const SKIP = new Set(["the", "a", "an", "of", "and"]);

export function initials(name: string): string {
  const words = name
    .replace(/[^A-Za-z0-9 &]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const meaningful = words.filter((w) => !SKIP.has(w.toLowerCase()));
  const use = meaningful.length > 0 ? meaningful : words;
  if (use.length === 0) return "??";
  if (use.length === 1) return use[0].slice(0, 2).toUpperCase();
  return (use[0][0] + use[1][0]).toUpperCase();
}

/**
 * The plate on its own, for a dense list where the name is already the
 * next thing on the row.
 */
export function ProspectPlate({
  name,
  lane,
  size = "md",
}: {
  name: string;
  lane: Lane;
  size?: "sm" | "md" | "lg";
}) {
  const meta = LANE_META[lane];
  return (
    <span
      className={[styles.plate, styles[size]].join(" ")}
      style={{
        ["--lane" as string]: meta.cssVar,
        ["--laneTint" as string]: meta.tintVar,
      }}
      data-occasion={meta.occasionClass}
      aria-hidden="true"
    >
      <span className={styles.initials}>{initials(name)}</span>
      <span className={styles.watermark}>{meta.glyph}</span>
    </span>
  );
}

/**
 * The whole identity block: plate, name, lane chip.
 *
 * `subtitle` is for the one line that qualifies the name, usually the
 * decision maker's TITLE or the city. A title, never a person: there is
 * not one invented human name anywhere in this application.
 */
export function Wordmark({
  name,
  lane,
  subtitle,
  size = "md",
  showLane = true,
}: {
  name: string;
  lane: Lane;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
  showLane?: boolean;
}) {
  return (
    <span className={[styles.mark, styles[`mark-${size}`]].join(" ")}>
      <ProspectPlate name={name} lane={lane} size={size} />
      <span className={styles.text}>
        <span className={styles.name}>{name}</span>
        <span className={styles.meta}>
          {showLane ? <LaneChip lane={lane} size="sm" /> : null}
          {subtitle ? (
            <span className={styles.subtitle}>{subtitle}</span>
          ) : null}
        </span>
      </span>
    </span>
  );
}
