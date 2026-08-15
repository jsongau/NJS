import type { ReactNode } from "react";
import type { Provenance } from "@/domain/types";
import styles from "./ProvenanceBadge.module.css";

/**
 * Every commercial figure in this app is required to say where it came
 * from. That constraint is the whole reason the parts that ARE real can
 * be trusted: a reader who can see which numbers are modeled has no cause
 * to doubt the addresses, and a reader who cannot tell has cause to doubt
 * all of it.
 *
 * Each provenance carries a distinct GLYPH as well as a colour, because
 * colour alone is not an accessible signal and the owner of this site is
 * colourblind.
 *
 * ── WHY THIS FILE GREW A SIXTH VALUE ──────────────────────────────
 * The five it was forked with described a spectrum of confidence:
 * published, invented, calculated, seen, typed. "withheld" is not a
 * point on that spectrum at all, and giving it one would have thrown
 * away the single most useful thing the research on Main Event found.
 *
 * Main Event publishes a price for every product a parent buys alone at
 * night on a phone: birthday packages, the $29.99 All-Access Grad Pack,
 * the $19.95 Play It Forward voucher. It publishes NO price for any
 * corporate or group package. Those pages say to contact the local sales
 * manager. The company has drawn a line through its own range, and below
 * that line the website sells while above it a person does.
 *
 * A withheld price is therefore not missing data. It is the job
 * description. So it renders as a SENTENCE rather than a number, and
 * `WithheldFigure` below is the only correct way to display one.
 */

export interface ProvenanceMeta {
  label: string;
  glyph: string;
  title: string;
  cls: string;
}

const META: Record<Provenance, ProvenanceMeta> = {
  public: {
    label: "Public",
    glyph: "◆",
    title:
      "Read off a published page and carrying the URL it was read from. Checkable at source in about fifteen seconds.",
    cls: "public",
  },
  illustrative: {
    label: "Illustrative",
    glyph: "◇",
    title:
      "Plausible and invented for this prototype. Not a claim about the real organisation.",
    cls: "illustrative",
  },
  modeled: {
    label: "Modeled",
    glyph: "▲",
    title:
      "Calculated from stated assumptions. The assumptions are shown wherever the figure is.",
    cls: "modeled",
  },
  observed: {
    label: "Observed",
    glyph: "●",
    title: "Recorded during a simulated go-see inside this prototype.",
    cls: "observed",
  },
  user_input: {
    label: "Entered",
    glyph: "✎",
    title:
      "Typed by you in this session. A number a person typed and a number a company published are not the same kind of fact.",
    cls: "user",
  },
  withheld: {
    label: "Not published",
    glyph: "▩",
    title:
      "Main Event deliberately does not publish this figure. Their page says to contact the local sales manager, which is why this app exists.",
    cls: "withheld",
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

/**
 * A withheld figure, rendered as the sentence it actually is.
 *
 * THIS COMPONENT EXISTS SO THAT NOBODY EVER TYPES A PLACEHOLDER. The
 * temptations, in order of how bad they are, are: an estimate, a range,
 * "POA", "$--", and an em dash. Every one of those reads as a number the
 * app failed to fetch. What is true is stronger and shorter: Main Event
 * does not publish this, and the price comes from a person.
 *
 * `reason` is where a screen can add the useful half. The default says
 * what is true of every gated package; a caller with something more
 * specific, such as a published minimum food spend, passes it in.
 */
export function WithheldFigure({
  reason,
  compact = false,
}: {
  /** Replaces the follow-on sentence. Never replaces the first one. */
  reason?: ReactNode;
  compact?: boolean;
}) {
  return (
    <span
      className={[styles.withheldFigure, compact ? styles.withheldCompact : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <span aria-hidden="true" className={styles.withheldGlyph}>
        {META.withheld.glyph}
      </span>
      <span className={styles.withheldBody}>
        <strong className={styles.withheldLead}>
          Main Event does not publish this
        </strong>
        {compact ? null : (
          <span className={styles.withheldReason}>
            {reason ??
              "The page says to contact the local sales manager, so the price comes from a person. That person is the role this app was built for."}
          </span>
        )}
      </span>
    </span>
  );
}

/**
 * A figure and its provenance in one call, so a screen cannot render the
 * number and forget the badge.
 *
 * A withheld figure short-circuits to the sentence. That branch is here
 * rather than at every call site because a rule enforced in one function
 * holds, and a rule enforced by convention across fourteen pages does
 * not.
 */
export function Figure({
  value,
  provenance,
  withheldReason,
  compact = false,
}: {
  /** null means there is no figure, which for "withheld" is the point. */
  value: ReactNode;
  provenance: Provenance;
  withheldReason?: ReactNode;
  compact?: boolean;
}) {
  if (provenance === "withheld" || value === null || value === undefined) {
    return <WithheldFigure reason={withheldReason} compact={compact} />;
  }
  return (
    <span className={styles.figure}>
      <span className={`${styles.figureValue} num`}>{value}</span>
      <ProvenanceBadge provenance={provenance} compact={compact} />
    </span>
  );
}

export const PROVENANCE_META = META;

/** Reading order for a legend. Strongest claim first, withheld last. */
export const PROVENANCE_ORDER: Provenance[] = [
  "public",
  "observed",
  "modeled",
  "user_input",
  "illustrative",
  "withheld",
];
