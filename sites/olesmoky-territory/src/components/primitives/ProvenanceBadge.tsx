import type { Provenance } from "@/domain/types";
import styles from "./ProvenanceBadge.module.css";

/**
 * Every commercial figure in this app is required to say where it came
 * from. That is the whole reason the parts that ARE real can be trusted:
 * a viewer who can see which numbers are modeled has no reason to doubt
 * the addresses, and a viewer who cannot tell has reason to doubt
 * everything.
 *
 * Each provenance carries a distinct GLYPH as well as a color, because
 * color alone is not an accessible signal and this app is used by someone
 * who is colorblind.
 */

const META: Record<
  Provenance,
  { label: string; glyph: string; title: string; cls: string }
> = {
  public: {
    label: "Public",
    glyph: "◆",
    title: "From a published address, brand fact, or cited company statement.",
    cls: "public",
  },
  illustrative: {
    label: "Illustrative",
    glyph: "◇",
    title:
      "Plausible and invented for this prototype. Not a claim about the real account.",
    cls: "illustrative",
  },
  modeled: {
    label: "Modeled",
    glyph: "▲",
    title: "Calculated from stated assumptions. The arithmetic is shown.",
    cls: "modeled",
  },
  observed: {
    label: "Observed",
    glyph: "●",
    title: "Recorded during a simulated store visit inside this prototype.",
    cls: "observed",
  },
  user_input: {
    label: "Entered",
    glyph: "✎",
    title: "Typed by you in this session.",
    cls: "user",
  },
};

export function ProvenanceBadge({
  provenance,
  compact = false,
  observedAt,
}: {
  provenance: Provenance;
  compact?: boolean;
  observedAt?: string;
}) {
  const m = META[provenance];
  const title = observedAt ? `${m.title} Recorded ${observedAt}.` : m.title;
  return (
    <span
      className={[styles.badge, styles[m.cls], compact ? styles.compact : ""]
        .filter(Boolean)
        .join(" ")}
      title={title}
    >
      <span aria-hidden="true" className={styles.glyph}>
        {m.glyph}
      </span>
      {compact ? (
        <span className="visually-hidden">{m.label}</span>
      ) : (
        <span>{m.label}</span>
      )}
      {observedAt && !compact ? (
        <span className={styles.when}>{observedAt}</span>
      ) : null}
    </span>
  );
}

export const PROVENANCE_META = META;
