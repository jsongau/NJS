import type { ReactNode } from "react";
import type { BowlerAverage } from "@/domain/cup";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import styles from "./NotEstablished.module.css";

/**
 * A FIGURE NOBODY HAS EARNED YET, DRAWN AS A BEGINNING.
 *
 * ── WHY THIS IS A COMPONENT AND NOT A DASH ────────────────────────
 * `domain/cup.ts` models an average as a discriminated union so that a
 * caller has to narrow on `kind` before it can reach a number. That is
 * the guarantee that stops a screen inventing an average, and this file
 * does not defeat it: it narrows, and the not established arm is the arm
 * that gets the design work.
 *
 * ── AND WHY IT READS AS ANTICIPATION ──────────────────────────────
 * "Not yet established" is the single most honest thing on a bowler
 * profile and it is very easy to draw as a failure: a dash, a greyed
 * row, an empty cell that looks like data that did not load. Every one
 * of those tells a reader something is missing.
 *
 * Nothing is missing. Nobody has bowled a competitive frame in this
 * building, and the counter reading zero of twenty one is the reason
 * enrolling means anything at all: the first person to put their name
 * down gets to be the first person on the sheet. So the figure is drawn
 * as a COUNTER WITH A DESTINATION. A count, a threshold, an empty track
 * with the distance printed on it, and a sentence saying what starts it
 * moving. It is a starting line rather than a gap.
 *
 * It is also exactly how the sport does it. The United States Bowling
 * Congress does not invent an entering average for a bowler with no
 * record: it establishes one over the first sessions and re-rates, and
 * its own guidance calls assigned flat averages inaccurate. The rule
 * that will produce the figure is printed here so a reader can see what
 * is going to happen rather than only that nothing has happened.
 *
 * The empty track carries no colour signal at all. The count is a
 * number, the distance is a number, and the state is a word.
 */

export function EstablishedFigure({
  label,
  figure,
  /** The rule that will produce the figure, printed under the counter. */
  rule,
  /** What starts the counter moving, in one line. */
  starts,
}: {
  label: string;
  figure: BowlerAverage;
  rule?: ReactNode;
  starts?: ReactNode;
}) {
  /* The narrowing. A number is reachable on one arm only, and the day
     the leagues bowl a night the other arm starts appearing in the seed
     with nothing here needing to be found and changed. */
  if (figure.kind === "established") {
    return (
      <div className={styles.wrap}>
        <p className={styles.head}>
          <span className={styles.label}>{label}</span>
          <span className={`${styles.value} num`}>{figure.average}</span>
        </p>
        <p className={styles.note}>
          Established over <span className="num">{figure.gamesBowled}</span>{" "}
          games.
        </p>
      </div>
    );
  }

  const { gamesBowled, gamesRequired, because } = figure;
  const toGo = Math.max(0, gamesRequired - gamesBowled);
  const pct =
    gamesRequired === 0
      ? 0
      : Math.max(0, Math.min(100, (gamesBowled / gamesRequired) * 100));

  return (
    <div className={styles.wrap}>
      <p className={styles.head}>
        <span className={styles.label}>{label}</span>
        <span className={styles.state}>
          <span aria-hidden="true">◇</span> Not yet established
        </span>
      </p>

      <p className={styles.counter}>
        <span className="num">{gamesBowled}</span> of{" "}
        <span className="num">{gamesRequired}</span> games bowled towards it
      </p>

      {/* The track carries the count in words beside it, so its meaning
          survives greyscale, a printout and a reader who cannot see the
          fill at all. At zero there is nothing to see and the sentence
          is doing the whole job, which is the point. */}
      <div
        className={styles.track}
        role="img"
        aria-label={`${gamesBowled} of ${gamesRequired} games bowled. ${toGo} to go.`}
      >
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>

      <p className={styles.toGo}>
        <span className="num">{toGo}</span> games to go
      </p>

      <p className={styles.because}>{because}</p>

      {starts ? <p className={styles.starts}>{starts}</p> : null}

      {rule ? (
        <p className={styles.rule}>
          <span aria-hidden="true">◆</span> <span>{rule}</span>{" "}
          <ProvenanceBadge provenance="illustrative" compact />
        </p>
      ) : null}
    </div>
  );
}

/**
 * The same state where there is no counter to draw, for a record rather
 * than an average. One line, one word, and the reason.
 */
export function NotEstablishedLine({
  label,
  because,
}: {
  label: string;
  because: ReactNode;
}) {
  return (
    <div className={styles.line}>
      <p className={styles.head}>
        <span className={styles.label}>{label}</span>
        <span className={styles.state}>
          <span aria-hidden="true">◇</span> Not yet established
        </span>
      </p>
      <p className={styles.because}>{because}</p>
    </div>
  );
}
