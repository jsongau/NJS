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
 * away the single most useful thing the research found.
 *
 * Round1 publishes what a walk-in buys off a shelf and almost nothing a
 * group buys off a conversation. It itemises the contents of one party
 * package and prints no price for it, it publishes a booking notice
 * period and no minimum spend, and it publishes no bowling lane count
 * for any location in the country. Those pages say to contact the
 * venue. The company has drawn a line through its own range, and below
 * that line the website sells while above it a person does.
 *
 * A withheld figure is therefore not missing data. It is the job
 * description. So it renders as a SENTENCE rather than a number, and
 * `WithheldFigure` below is the only correct way to display one.
 *
 * ── WHY THE LEAD SENTENCE IS NO LONGER HARD CODED ─────────────────
 * It used to read "Main Event does not publish this" in the component
 * body, which was true of the fork and is a false attribution now. The
 * operator's name belongs to the data, not to a primitive, so the lead
 * defaults to Round1 and any caller can pass its own. A withheld
 * sentence that names the wrong company is worse than no sentence at
 * all, because it invites the reader to check a page that never made
 * the claim.
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
      "Round1 deliberately does not publish this figure. Their page says to contact the venue, which is why this app exists.",
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
 * "POA", "$--", and a dash. Every one of those reads as a number the
 * app failed to fetch. What is true is stronger and shorter: Round1
 * does not publish this, and the figure comes from a person.
 *
 * `reason` is where a screen can add the useful half. The default says
 * what is true of every gated package; a caller with something more
 * specific, such as a lane count that is unpublished at every location
 * in the chain, passes it in.
 *
 * `lead` is the first sentence, and it is a prop rather than a constant
 * because the operator can change under this app. It did. Naming the
 * wrong company in a sentence about what a company withholds is the one
 * mistake this component must never make, so the name lives in the
 * default and in the caller's hands, never buried in the markup.
 */
export function WithheldFigure({
  lead,
  reason,
  compact = false,
}: {
  /** Replaces the first sentence. Defaults to the current operator. */
  lead?: ReactNode;
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
          {lead ?? "Round1 does not publish this"}
        </strong>
        {compact ? null : (
          <span className={styles.withheldReason}>
            {reason ??
              "The page says to contact the venue, so the figure comes from a person. That person is the role this app was built for."}
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
  withheldLead,
  withheldReason,
  compact = false,
}: {
  /** null means there is no figure, which for "withheld" is the point. */
  value: ReactNode;
  provenance: Provenance;
  withheldLead?: ReactNode;
  withheldReason?: ReactNode;
  compact?: boolean;
}) {
  if (provenance === "withheld" || value === null || value === undefined) {
    return (
      <WithheldFigure
        lead={withheldLead}
        reason={withheldReason}
        compact={compact}
      />
    );
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
