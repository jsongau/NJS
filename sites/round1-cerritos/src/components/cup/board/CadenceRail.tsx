import type { Cup } from "@/domain/cup";
import { CUP_STATE, formatCupDate } from "@/domain/cup";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { TokenMark } from "@/components/licensing/Panels";
import styles from "./CadenceRail.module.css";

/**
 * ONE CUP PER QUARTER, AND THE READER CAN SEE ALL FOUR.
 *
 * ── WHY THE CADENCE IS ON THE BOARD AT ALL ────────────────────────
 * A single cup is an event. Four of them on a calendar is a PROGRAMME,
 * and the difference is what a captain is actually being asked to join. A
 * team that misses the January field is not shut out; it is fourteen
 * weeks from the next one, and a board that cannot say so has turned its
 * own deadline into pressure rather than information. That is the whole
 * test for whether a deadline is honest: it has to actually close, and
 * the next opportunity has to actually exist and be visible.
 *
 * Six consecutive nights then a gap, four times a year. The gap is where
 * enrollment for the next one opens, which is why the two facts sit on
 * the same row here.
 *
 * ── AND ROUND1 HAS NOT ANNOUNCED A CUP ────────────────────────────
 * This is a proposed programme and every card carries the badge that says
 * so. The nights, the fee and the quarterly cadence are this
 * application's own, in exactly the voice the rest of the board uses for
 * anything Round1 has not published.
 */

export function CadenceRail({
  cups,
  asOf,
}: {
  cups: Cup[];
  /** The reading instant, so "next" is a fact rather than a guess. */
  asOf: string;
}) {
  return (
    <ol className={styles.rail}>
      {cups.map((cup) => {
        const first = cup.nightDates[0];
        const last = cup.nightDates[cup.nightDates.length - 1];
        const opens = cup.enrollmentOpensAt;
        const closes = cup.enrollmentClosesAt;

        return (
          <li key={cup.id} className={styles.card} data-state={cup.state}>
            <div className={styles.top}>
              <span className={styles.quarter}>
                {cup.quarter} <span className="num">{cup.year}</span>
              </span>
              <TokenMark token={CUP_STATE[cup.state]} small />
            </div>

            <h4 className={styles.name}>{cup.name}</h4>
            <p className={styles.strapline}>{cup.strapline}</p>

            <dl className={styles.facts}>
              <div>
                <dt>Six nights</dt>
                <dd>
                  {formatCupDate(first)} to {formatCupDate(last)}
                  <span className={styles.sub}>
                    {cup.night}, {cup.startTime}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Enrollment</dt>
                <dd>
                  {opens && closes ? (
                    <>
                      {formatCupDate(opens)} to {formatCupDate(closes)}
                    </>
                  ) : cup.state === "exhibition" ? (
                    "Closed"
                  ) : (
                    "Opens when the cup before it finishes"
                  )}
                </dd>
              </div>
            </dl>

            <p className={styles.badge}>
              <ProvenanceBadge provenance={cup.provenance} compact />
              <span>
                A proposed programme. Round1 has not announced a cup.
              </span>
            </p>
          </li>
        );
      })}
      <li className={styles.asOf}>
        <span aria-hidden="true">◇</span> Read as at {formatCupDate(asOf)}. Every
        date on this rail is a fixed calendar date that arrives and passes.
        Nothing here resets.
      </li>
    </ol>
  );
}
