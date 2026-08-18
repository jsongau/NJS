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
 * away the single most useful finding in the whole scrape.
 *
 * Every brand in this market publishes a price for the thing a household
 * buys once, at two in the afternoon, while something is broken: a 47
 * dollar tune-up, a 47 dollar drain clearing, 50 dollars off a repair.
 * NOT ONE OF THE FOURTEEN RIVAL BRANDS PROFILED PUBLISHES A MEMBERSHIP
 * PRICE. They name the programme, itemise the benefits and route the
 * figure to a phone number. The market has drawn a line through its own
 * range: below it the website sells a job, above it a call sells a
 * relationship.
 *
 * The value carries a second job that matters more, because it points at
 * us rather than at them. Champions Group publishes no marketing budget,
 * no cost per lead, no close rate and no agency fee anywhere. Those
 * figures are withheld here and none of them is estimated, because a work
 * sample that invented the numbers of the company it is applying to would
 * be wrong in public about the one thing it was asked to be careful with.
 *
 * A withheld figure is therefore not missing data. It is a decision
 * somebody else made, and it is where the work is. So it renders as a
 * SENTENCE rather than a number, and `WithheldFigure` below is the only
 * correct way to display one.
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
      "Read off a published page on 18 August 2026 and carrying the URL it was read from. Checkable at source in about fifteen seconds.",
    cls: "public",
  },
  illustrative: {
    label: "Illustrative",
    glyph: "◇",
    title:
      "Written for this work sample to be representative of the shape of a week. Not a claim that any real organisation said or did this.",
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
    title: "Seen on a live page and never published as a fact by anybody. A campaign page still up past its own printed expiry date is the type case.",
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
      "Nobody publishes this figure. Where it is a rival's price, the page routes it to a phone number; where it is ours, it is a number the company holds and does not print. Either way it is not estimated here.",
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
 * app failed to fetch. What is true is stronger and shorter: nobody
 * publishes this, and the figure comes from a person on a call.
 *
 * `reason` is where a screen can add the useful half. The default says
 * what is true of every plan in the market that names itself and hides
 * its price; a caller with something more specific, such as a published
 * financing term, passes it in.
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
          Nobody publishes this
        </strong>
        {compact ? null : (
          <span className={styles.withheldReason}>
            {reason ??
              "The page names the plan and routes the figure to a phone number, so it comes from a person on a call. Working out what it should be is the role this console was built for."}
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
