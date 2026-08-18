import { useEffect, useMemo, useRef, useState } from "react";
import type { EventPackage, Prospect } from "@/domain/types";
import { LANE_META } from "@/domain/lanes";
import { PACKAGE_FAMILY } from "@/domain/vocabulary";
import { Figure, ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { PackageGlyph } from "@/components/primitives/PackageGlyph";
import { FamilyChip } from "@/components/primitives/FamilyChip";
import { LaneChip } from "@/components/primitives/LaneChip";
import { ProspectPlate } from "@/components/primitives/Wordmark";
import { StatusChip } from "@/components/primitives/StatusChip";
import { formatDay } from "@/components/record/Timeline";
import { usePipeline } from "@/state/PipelineProvider";
import { useOutbox } from "@/state/OutboxProvider";
import { PERIODS, PERIOD_BY_ID } from "@/data/venue";
import {
  promoCandidates,
  type MinimumFit,
  type PromoCandidate,
} from "./promoCandidates";
import styles from "./PromoSendModal.module.css";

/**
 * THE PICKER. THE ONE PLACE IN THIS APPLICATION WHERE THE PRODUCT COMES
 * FIRST AND THE ORGANISATION SECOND.
 *
 * Eighteen package cards, every one of them carrying the price, the
 * inclusions, the minimums and the lanes it opens, and until now not one
 * of them could be acted on. The compose window has accepted a
 * `packageId` since it was written. The plumbing was there and the
 * surface was not, and this dialog is the surface.
 *
 * ── WHAT IT PUTS ON SCREEN, IN ORDER ───────────────────────────────
 * The candidates, narrowed to the lanes the package itself publishes,
 * ranked by the desk's own score, and split by the one cut that actually
 * answers the question a promo asks: WHO HAS NOT BEEN TOLD ABOUT THIS
 * ONE YET. An organisation in the right lane, high on the desk, that has
 * never had this package put in front of it, is the row to press. The
 * ones that already have it are kept and ranked below, because a rep who
 * wants to follow up deliberately should not have to remember which.
 *
 * The minimum guest count is stated rather than enforced. Every headcount
 * in this data set is a modelled range with its basis written down, and a
 * range of 12 to 20 against a published minimum of 20 is a question for
 * the call and not a reason to hide a row. So a candidate that does not
 * clear the minimum is shown, is marked, and is still selectable. The rep
 * knows things the model does not.
 *
 * ── ONE ROW AT A TIME, AND THE ARGUMENT FOR IT ─────────────────────
 * There is no multi-select here, and that is a decision rather than an
 * omission. Selecting six organisations and queueing six letters is real
 * sales work and the outbox already models one row per organisation, so
 * it would have been easy to build. It would also have been worse. Every
 * letter this app writes is personalised by lane, by occasion class and
 * by what the last message said, which is the entire reason the compose
 * window is a split screen with the draft visible on open. A bulk send
 * that skips that review sends six letters nobody read, and the first
 * one that lands wrong is the one that costs the relationship. Six
 * unread letters are worth less than one read one.
 *
 * So pressing a row hands off to the compose window with that
 * organisation, the featured promo intent and this package. The picker
 * stays mounted underneath, stands its keyboard down, and is still
 * there when the window closes, with the row it sent from now counted
 * against the told side. That is the loop: work the list down, one read
 * letter at a time, and watch the untold count fall.
 *
 * ── ONE LAYER OWNS THE KEYBOARD ────────────────────────────────────
 * The trap, the Escape handler and the body scroll lock are the quote
 * preview's, deliberately, down to the scrollbar compensation. While the
 * compose window is over this, this dialog stands its own trap down and
 * drops behind that scrim, which is exactly what the record modal
 * already does. Two traps fighting over one Tab press is how a keyboard
 * reader ends up unable to reach a Send button.
 *
 * ── SCENARIO DATES THAT EXERCISE THIS SCREEN ───────────────────────
 * This dialog is addressed rather than clocked, so its states are
 * reached by package rather than by date. The set worth walking:
 * `?send=all-access-grad-pack` for a large untold list with one sent
 * promo below it, `?send=fun-101` for a package whose lanes carry an
 * extended offer, `?send=corporate-buyout` for a high published minimum
 * that most of the trade area does not clear, and
 * `?send=the-main-event-birthday` for the smallest minimum in the range.
 */

export interface PromoSendModalProps {
  pkg: EventPackage;
  /** Raised when a row is pressed. The page owns the compose window. */
  onPick: (prospect: Prospect) => void;
  /** True while the compose window is over this dialog. */
  composeOver: boolean;
  onClose: () => void;
}

const money = (n: number) =>
  n % 1 === 0 ? `$${n.toFixed(0)}` : `$${n.toFixed(2)}`;

/**
 * The minimum, as a glyph, a word and a figure.
 *
 * Four states rather than a pass and a fail, because the middle one is
 * true of a good number of rows and is the one a rep can actually do
 * something about. Nothing here is carried by colour alone.
 */
const MINIMUM: Record<
  MinimumFit,
  { glyph: string; word: string; why: string }
> = {
  clears: {
    glyph: "◆",
    word: "Clears",
    why: "The modelled range sits at or above the published minimum.",
  },
  spans: {
    glyph: "◐",
    word: "Spans",
    why: "The published minimum falls inside the modelled range, so the group clears it at the top of the range and not at the bottom.",
  },
  under: {
    glyph: "◬",
    word: "Under",
    why: "The whole modelled range sits below the published minimum. The row is kept because a headcount here is a model and the rep may know better.",
  },
  unstated: {
    glyph: "▩",
    word: "No minimum",
    why: "DIME publishes no minimum guest count for this package, or for any other.",
  },
};

/** The reading a screen reader gets for the minimum, in whole words. */
function minimumSentence(c: PromoCandidate): string {
  if (c.minimum === "unstated") return "No published minimum.";
  const n = c.minGuests ?? 0;
  if (c.minimum === "clears") return `Clears the published minimum of ${n} guests.`;
  if (c.minimum === "spans")
    return `The published minimum of ${n} guests falls inside the modelled range.`;
  return `Under the published minimum of ${n} guests.`;
}

function CandidateRow({
  candidate,
  rank,
  pkg,
  onPick,
}: {
  candidate: PromoCandidate;
  rank: number;
  pkg: EventPackage;
  onPick: (prospect: Prospect) => void;
}) {
  const p = candidate.prospect;
  const line = candidate.line;
  const lane = LANE_META[p.lane];
  const min = MINIMUM[candidate.minimum];

  /*
    The whole row is the control, so there is one tab stop per candidate
    rather than four, and the accessible name is written out in full
    rather than assembled from a dozen chips. A reader working down this
    list on a keyboard hears the name, the lane, the rank, the modelled
    range and the state of play in one pass, in that order, because that
    is the order the decision is made in.
  */
  const label = [
    `Send the ${pkg.name} to ${p.name}.`,
    `Rank ${rank}.`,
    `${lane.label}.`,
    `Desk score ${line.score}.`,
    /* "Modeled" rather than the British spelling, because that is the
       word on the provenance badge beside the figure and a reader should
       hear what the badge says. */
    `Modeled at ${p.headcountLow} to ${p.headcountHigh} guests.`,
    minimumSentence(candidate),
    candidate.reach.length === 0
      ? "Not told about this package yet."
      : candidate.reach
          .map((r) => `${r.label}, ${r.what}, ${formatDay(r.at)}.`)
          .join(" "),
  ].join(" ");

  return (
    <li className={styles.row}>
      <button
        type="button"
        className={styles.rowButton}
        style={{
          ["--lane" as string]: lane.cssVar,
          ["--laneTint" as string]: lane.tintVar,
        }}
        onClick={() => onPick(p)}
        aria-label={label}
        data-promo-candidate={p.id}
      >
        <span className={`${styles.rank} num`} aria-hidden="true">
          {rank}
        </span>
        <ProspectPlate name={p.name} lane={p.lane} size="sm" />

        <span className={styles.rowMain}>
          <span className={styles.rowName}>{p.name}</span>
          <span className={styles.rowChips}>
            <LaneChip lane={p.lane} size="sm" />
            <StatusChip status={line.status} size="sm" short />
          </span>
        </span>

        <span className={styles.rowFigures}>
          <span className={styles.figureCell}>
            <span className={styles.figureLabel}>Score</span>
            <span className={`${styles.figureValue} num`}>{line.score}</span>
          </span>
          <span className={styles.figureCell}>
            <span className={styles.figureLabel}>Guests</span>
            <span className={styles.figureFig}>
              <Figure
                value={`${p.headcountLow} to ${p.headcountHigh}`}
                provenance={p.provenance.headcount ?? "modeled"}
                compact
              />
            </span>
          </span>
        </span>

        <span className={styles.rowFlags}>
          <span
            className={styles.minimum}
            data-fit={candidate.minimum}
            title={min.why}
          >
            <span aria-hidden="true">{min.glyph}</span>
            {min.word}
            {candidate.minGuests !== null ? (
              <span className="num">{candidate.minGuests}</span>
            ) : null}
          </span>
          {candidate.reach.map((r) => (
            <span
              key={`${r.kind}-${r.at}-${r.what}`}
              className={styles.reach}
              data-kind={r.kind}
              title={`${r.what}, ${formatDay(r.at)}.`}
            >
              <span aria-hidden="true">{r.glyph}</span>
              {r.label}
              <span className="num">{formatDay(r.at)}</span>
            </span>
          ))}
        </span>

        <span className={styles.send}>
          <span aria-hidden="true" className={styles.sendGlyph}>
            ◆
          </span>
          <span className={styles.sendWord}>Write</span>
        </span>
      </button>
    </li>
  );
}

export function PromoSendModal({
  pkg,
  onPick,
  composeOver,
  onClose,
}: PromoSendModalProps) {
  const pipeline = usePipeline();
  const outbox = useOutbox();

  const dialogRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [said, setSaid] = useState("");

  /* Parsed off the ISO string rather than through Date, because
     new Date("2026-09-14") is UTC midnight and shifts a day backwards
     west of Greenwich, which is where Irvine is. */
  const period = PERIOD_BY_ID[pipeline.periodId] ?? PERIODS[0];
  const nowMonth = Number(period.startDate.slice(5, 7)) - 1;

  const set = useMemo(
    () => promoCandidates(pkg, pipeline, outbox, nowMonth),
    [pkg, pipeline, outbox, nowMonth],
  );

  /** Focus lands on the heading. The page takes it back on close. */
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  /**
   * The untold count changes, and says so once.
   *
   * The first pass records what is already true without announcing it,
   * which is the rule this codebase settled on in DailyRings: a state
   * that was already the case when the dialog opened is not news. Only a
   * row moving from the untold side to the told side speaks, and it
   * speaks the fact in work units rather than a percentage or a cheer.
   * Sending one letter is a row completing, so there is no closure
   * treatment here and none is earned.
   */
  const seen = useRef<number | null>(null);
  useEffect(() => {
    const n = set.untold.length;
    if (seen.current === null) {
      seen.current = n;
      return;
    }
    if (seen.current === n) return;
    seen.current = n;
    setSaid(`${n} not told yet, of ${set.untold.length + set.told.length}.`);
  }, [set]);

  /**
   * The page behind does not scroll, and does not jump when it stops.
   *
   * Hiding the body overflow removes the scrollbar, and on a desktop
   * with classic scrollbars that shifts the layout fifteen pixels left
   * and back again. The padding compensates for exactly the width that
   * disappeared, so opening the picker moves nothing behind it.
   */
  useEffect(() => {
    const el = document.body;
    const prevOverflow = el.style.overflow;
    const prevPadding = el.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    el.style.overflow = "hidden";
    if (gap > 0) el.style.paddingRight = `${gap}px`;
    return () => {
      el.style.overflow = prevOverflow;
      el.style.paddingRight = prevPadding;
    };
  }, []);

  /**
   * The trap, and Escape.
   *
   * Bound in the capture phase and stood down entirely while the compose
   * window is over this one. That window is a dialog of its own with its
   * own trap and its own Escape, and the topmost layer owns the keyboard.
   */
  useEffect(() => {
    if (composeOver) return undefined;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const root = dialogRef.current;
      if (!root) return;
      const list = Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null || el === headingRef.current);

      if (list.length === 0) {
        e.preventDefault();
        return;
      }
      const active = document.activeElement as HTMLElement | null;
      if (!active || !root.contains(active)) {
        e.preventDefault();
        list[0].focus();
        return;
      }
      const i = list.indexOf(active);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        list[list.length - 1].focus();
      } else if (!e.shiftKey && i === list.length - 1) {
        e.preventDefault();
        list[0].focus();
      }
    }

    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [composeOver, onClose]);

  const total = set.untold.length + set.told.length;
  const family = PACKAGE_FAMILY[pkg.family];

  return (
    <>
      {/* The scrim takes the press. Nothing underneath can be reached
          while this is open, including the card it was opened from. */}
      <div className={styles.scrim} onClick={onClose} aria-hidden="true" />

      <div
        className={`${styles.sheet} ${composeOver ? styles.behind : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-send-heading promo-send-subject"
        ref={dialogRef}
        data-promo-send={pkg.id}
      >
        <div className={styles.frame}>
          {/* -----------------------------------------------------------
              THE MARQUEE. The one place on this screen with licence to
              look like a cabinet, because it is chrome and carries no
              figure that could be misread. Every commercial number is
              below it, badged.
              ----------------------------------------------------------- */}
          <header
            className={styles.head}
            style={{
              ["--fam" as string]: family.cssVar,
              ["--famTint" as string]: family.tintVar,
            }}
          >
            <PackageGlyph family={pkg.family} size={34} />
            <div className={styles.headText}>
              <h2
                className={styles.title}
                id="promo-send-heading"
                tabIndex={-1}
                ref={headingRef}
              >
                Send this promo
              </h2>
              <p className={styles.subject} id="promo-send-subject">
                {pkg.name}
              </p>
            </div>
            <button
              type="button"
              className={styles.close}
              onClick={onClose}
              aria-label="Close the send picker"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </header>

          {/* -----------------------------------------------------------
              What the reader is sending, in the three published facts
              that decide who it suits.
              ----------------------------------------------------------- */}
          <div className={styles.meta}>
            <div className={styles.metaCell}>
              <span className={styles.metaLabel}>Per guest</span>
              {pkg.pricePerGuest === null ? (
                <Figure value={null} provenance="withheld" compact />
              ) : (
                <Figure
                  value={money(pkg.pricePerGuest)}
                  provenance={pkg.provenance.pricePerGuest ?? "public"}
                  compact
                />
              )}
            </div>
            <div className={styles.metaCell}>
              <span className={styles.metaLabel}>Minimum guests</span>
              {pkg.minGuests === null ? (
                <Figure value={null} provenance="withheld" compact />
              ) : (
                <Figure
                  value={String(pkg.minGuests)}
                  provenance={pkg.provenance.minGuests ?? "public"}
                  compact
                />
              )}
            </div>
            <div className={styles.metaCell} data-wide="yes">
              <span className={styles.metaLabel}>
                Lanes it opens
                <ProvenanceBadge provenance="public" compact />
              </span>
              <span className={styles.metaLanes}>
                <FamilyChip family={pkg.family} size="sm" />
                {pkg.laneFit.map((lane) => (
                  <LaneChip key={lane} lane={lane} size="sm" />
                ))}
              </span>
            </div>
          </div>

          {/* -----------------------------------------------------------
              THE CANDIDATES. Two groups, one order, no hidden set.
              ----------------------------------------------------------- */}
          <div className={styles.list}>
            <section className={styles.group} aria-labelledby="promo-untold">
              <h3 className={styles.groupHead} id="promo-untold">
                <span aria-hidden="true" className={styles.groupGlyph}>
                  ◇
                </span>
                Not told yet
                <span className={`${styles.groupCount} num`}>
                  {set.untold.length}
                </span>
                <span className={styles.groupOf}>of {total}</span>
              </h3>
              {set.untold.length === 0 ? (
                <p className={styles.empty}>
                  {total === 0
                    ? "No organisation on the board sits in the lanes this package opens."
                    : "Every organisation in these lanes has had this package, or an offer covering it, put in front of them."}
                </p>
              ) : (
                <ol className={styles.rows}>
                  {set.untold.map((c, i) => (
                    <CandidateRow
                      key={c.prospect.id}
                      candidate={c}
                      rank={i + 1}
                      pkg={pkg}
                      onPick={onPick}
                    />
                  ))}
                </ol>
              )}
            </section>

            {set.told.length > 0 ? (
              <section className={styles.group} aria-labelledby="promo-told">
                <h3 className={styles.groupHead} id="promo-told">
                  <span aria-hidden="true" className={styles.groupGlyph}>
                    ▤
                  </span>
                  Already told
                  <span className={`${styles.groupCount} num`}>
                    {set.told.length}
                  </span>
                </h3>
                <ol className={styles.rows} data-kind="told">
                  {set.told.map((c, i) => (
                    <CandidateRow
                      key={c.prospect.id}
                      candidate={c}
                      rank={i + 1}
                      pkg={pkg}
                      onPick={onPick}
                    />
                  ))}
                </ol>
              </section>
            ) : null}
          </div>

          <p className={styles.announce} role="status">
            {said}
          </p>
        </div>
      </div>
    </>
  );
}
