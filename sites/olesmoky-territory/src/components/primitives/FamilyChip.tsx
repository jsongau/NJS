import type { BrandFamily } from "@/domain/types";
import { FAMILY } from "@/domain/vocabulary";
import styles from "./FamilyChip.module.css";

/**
 * Brand family, as a swatch plus the word.
 *
 * The swatch is a filled square rather than a coloured label, so the
 * colour is a separate object from the text instead of being the text.
 * That matters for the one reader who cannot separate two of the hues:
 * they lose the swatch and keep the whole meaning.
 */
export function FamilyChip({
  family,
  size = "md",
  showNote = false,
}: {
  family: BrandFamily;
  size?: "sm" | "md";
  showNote?: boolean;
}) {
  const f = FAMILY[family];
  return (
    <span
      className={[styles.chip, styles[size]].join(" ")}
      style={{ ["--fam" as string]: f.cssVar, ["--famTint" as string]: f.tintVar }}
    >
      <span className={styles.swatch} aria-hidden="true" />
      <span className={styles.label}>{f.label}</span>
      {showNote ? <span className={styles.note}>{f.note}</span> : null}
    </span>
  );
}
