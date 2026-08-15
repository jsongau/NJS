import type { PackageFamily } from "@/domain/types";
import { PACKAGE_FAMILY } from "@/domain/vocabulary";
import styles from "./FamilyChip.module.css";

/**
 * Package family, as a glyph plus a swatch plus the word.
 *
 * The swatch is a separate filled square rather than a coloured label, so
 * the colour is an object beside the text instead of being the text.
 * That matters for the one reader who cannot separate two of the hues:
 * they lose the swatch and keep the whole meaning, because the glyph and
 * the word are both still there.
 *
 * FAMILY IS THE ONE PIECE OF COLOUR IN THIS APP THAT ENCODES DATA rather
 * than status, and it earns that because family drives the commercial
 * argument. Main Event publishes a price for the self-serve family and
 * gates every corporate package behind a local sales manager. A week's
 * book that is entirely youth group at a glance is a real read: the rooms
 * are full and the revenue is not.
 */
export function FamilyChip({
  family,
  size = "md",
  showNote = false,
}: {
  family: PackageFamily;
  size?: "sm" | "md";
  /** Adds the one-sentence commercial meaning. For legends and drawers. */
  showNote?: boolean;
}) {
  const f = PACKAGE_FAMILY[family];
  return (
    <span
      className={[styles.chip, styles[size], showNote ? styles.withNote : ""]
        .filter(Boolean)
        .join(" ")}
      style={{
        ["--fam" as string]: f.cssVar,
        ["--famTint" as string]: f.tintVar,
      }}
      title={showNote ? undefined : `${f.label}. ${f.note}`}
    >
      <span className={styles.glyph} aria-hidden="true">
        {f.glyph}
      </span>
      <span className={styles.label}>{f.label}</span>
      {showNote ? <span className={styles.note}>{f.note}</span> : null}
    </span>
  );
}
