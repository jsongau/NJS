import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./WorkingSetLead.module.css";

/**
 * THE ANSWER TO "WHAT DID I JUST DO", AND IT SITS WHERE THE ANSWER
 * BELONGS.
 *
 * ── THE DEFECT THIS COMPONENT EXISTS TO CLOSE ─────────────────────
 * The requests queue used to open with a standing explanation: the
 * response commitment, four figures wide, identical on every bucket. A
 * reader pressed "Due this week" and the top nine hundred pixels of the
 * screen changed by a breadcrumb word and a number inside a select.
 * Measured, that is a third of one per cent of the pixels above the
 * fold. A screen that says the same thing on every filter has told the
 * reader the filter does not matter.
 *
 * The fault was never the absence of an animation. It was information
 * architecture: standing explanation was sitting in the position the
 * working set should occupy. So the standing facts moved below the rows
 * they qualify, and this block took the space they left.
 *
 * ── WHAT IT SAYS, IN ORDER ────────────────────────────────────────
 * Which set is on screen, how much is in it, the two or three figures
 * that are true of THIS set and no other, and the first rows by name
 * with a verb against each. Labels, verbs and numbers. No sentence here
 * explains the queue; every line is a fact about the current reading.
 *
 * The figures are passed in per reading rather than computed here, which
 * is the point: twelve past the commitment and three due this week are
 * different situations, so they carry different figures. A block that
 * showed the same three labels for every reading would be the original
 * defect wearing a smaller box.
 *
 * ── HOW THE CHANGE IS MADE PERCEPTIBLE ────────────────────────────
 * Three things, and only the third is decoration.
 *
 * One, the count rolls to its new value rather than swapping. A figure
 * that moves is seen to move.
 *
 * Two, the block re-keys on the reading, so React tears down the old one
 * and mounts the new. That is what restarts the rule sweeping across the
 * top edge: a CSS animation only runs on a fresh element, so there are
 * no timers to clear and nothing to reset when a reader presses two
 * buckets in the same second.
 *
 * Three, the live region below announces the new reading in words. It is
 * OUTSIDE the keyed element on purpose. A live region that is removed
 * and re-added in the same commit is a region assistive technology has
 * no reason to read, so the announcement would be exactly the thing lost
 * to the mechanism that makes the change visible.
 *
 * Under prefers-reduced-motion the roll lands on the first frame and the
 * sweep is switched off. The count still changes, the rows still change
 * and the announcement still fires. Nothing is lost except the movement,
 * which was only ever pointing at the change.
 *
 * COLOUR IS NEVER THE ONLY SIGNAL HERE. Each reading brings its own
 * glyph and its own word before its own tone, the count is a different
 * number, and the named rows underneath are different organisations. The
 * sweep is a rule drawn across an edge, which is a shape.
 */

export interface LeadFact {
  label: string;
  value: ReactNode;
  /** A provenance badge or any other qualifier that must travel with it. */
  qualifier?: ReactNode;
}

export interface LeadRow {
  id: string;
  name: string;
  /** What kind of work this row is, in a word. */
  kind: string;
  /** The clock on it, or whatever else answers "when". */
  when: ReactNode;
  onOpen?: () => void;
  openLabel?: string;
}

export interface WorkingSetLeadProps {
  /** The id the heading takes, so a caller can point a skip link at it. */
  headingId: string;
  /** The reading currently on screen. Changing this re-keys the block. */
  changeKey: string;
  /** A short label above the title, naming the axis rather than the value. */
  kicker: string;
  glyph: string;
  label: string;
  /** The reading's own tone, as a token reference. Never the only signal. */
  tone: string;
  count: number;
  total: number;
  /** Singular and plural of what is being counted. */
  noun: [string, string];
  facts: LeadFact[];
  rows: LeadRow[];
  /** Printed in place of the rows when the reading is empty. */
  emptyLine: string;
  /** Verbs over the whole reading. */
  actions?: ReactNode;
  /** What the live region says. Written as a person would read it out. */
  announcement: string;
}

export function WorkingSetLead({
  headingId,
  changeKey,
  kicker,
  glyph,
  label,
  tone,
  count,
  total,
  noun,
  facts,
  rows,
  emptyLine,
  actions,
  announcement,
}: WorkingSetLeadProps) {
  const generation = useChangeCount(changeKey);
  const rolled = useRollingNumber(count);

  return (
    <div className={styles.wrap}>
      <section
        key={changeKey}
        className={styles.lead}
        data-tick={generation > 0 ? "yes" : "no"}
        /*
          A STABLE HOOK FOR THE FIGURE, SO A PROOF DOES NOT HAVE TO READ
          PROSE.

          The suite used to find the desk's working set by matching the
          sentence "N of M on the board". The day this component replaced
          that sentence the assertion went red while the filter it guards
          carried on working, which cost an investigation and is the
          fastest way to teach somebody that the checks are noise. Wording
          is allowed to change. A named number is a contract, and it costs
          one attribute.
        */
        data-working-set-count={count}
        data-working-set-total={total}
        style={{ ["--tone" as string]: tone }}
        aria-labelledby={headingId}
      >
        <p className={styles.kicker}>{kicker}</p>

        <div className={styles.headline}>
          <h2 className={styles.title} id={headingId}>
            <span className={styles.glyph} aria-hidden="true">
              {glyph}
            </span>
            <span>{label}</span>
          </h2>
          <p className={styles.count}>
            {/*
              The rolled figure is aria-hidden and the settled one is read
              out, because a number counting up in a live tree is a number
              announced eleven times.
            */}
            <span className={`${styles.value} num`} aria-hidden="true">
              {rolled}
            </span>
            <span className="visually-hidden">{count}</span>
            {/* "27 of 27" is a figure a reader has to read twice to learn
                nothing, so the denominator appears only when it is
                actually narrowing something. */}
            <span className={styles.of}>
              {count === total ? null : (
                <>
                  of <span className="num">{total}</span>{" "}
                </>
              )}
              {(count === total ? count : total) === 1 ? noun[0] : noun[1]}
            </span>
          </p>
        </div>

        {facts.length > 0 ? (
          <ul className={styles.facts}>
            {facts.map((f) => (
              <li key={f.label} className={styles.fact}>
                <span className={styles.factLabel}>{f.label}</span>
                <span className={styles.factValue}>
                  {f.value}
                  {f.qualifier}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {rows.length > 0 ? (
          <ol className={styles.rows}>
            {rows.map((r) => (
              <li key={r.id} className={styles.row}>
                <span className={styles.rowName}>{r.name}</span>
                <span className={styles.rowKind}>{r.kind}</span>
                <span className={styles.rowWhen}>{r.when}</span>
                {r.onOpen ? (
                  <button
                    type="button"
                    className={styles.rowOpen}
                    onClick={r.onOpen}
                  >
                    <span aria-hidden="true">▸</span>
                    <span>{r.openLabel ?? "Open"}</span>
                    <span className="visually-hidden"> {r.name}</span>
                  </button>
                ) : null}
              </li>
            ))}
          </ol>
        ) : (
          <p className={styles.empty}>
            <span aria-hidden="true">○</span> {emptyLine}
          </p>
        )}

        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </section>

      {/* Stable across every reading, for the reason written up above. */}
      <p className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}

/**
 * How many times a value has moved since mount. Zero is the load, and
 * the load must never animate: a page that flashes its own arrival is a
 * page apologising for existing rather than a screen reporting a change.
 */
function useChangeCount(value: string): number {
  const previous = useRef(value);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (previous.current === value) return;
    previous.current = value;
    setCount((n) => n + 1);
  }, [value]);

  return count;
}

/**
 * A count that travels to its new value instead of teleporting.
 *
 * Two hundred milliseconds, which is the same order as --dur-2 and short
 * enough that nobody waits for it. The reduced motion query is read here
 * in script rather than left to CSS, because this is arithmetic and not
 * a transition: there is no duration token for a browser to zero, so the
 * hook has to decline to animate on its own.
 *
 * The listener is live rather than read once. A reader who turns the
 * system setting on mid-session gets the new behaviour without reloading,
 * and a screenshot pass that sets the preference through the browser is
 * measuring what a person with that preference would actually get.
 */
function useRollingNumber(target: number): number {
  const [shown, setShown] = useState(target);
  const from = useRef(target);

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (media?.matches) {
      from.current = target;
      setShown(target);
      return;
    }

    const start = performance.now();
    const origin = from.current;
    const span = target - origin;
    if (span === 0) return;

    let frame = 0;
    const step = (at: number) => {
      const t = Math.min(1, (at - start) / 200);
      /* Ease out, so the figure decelerates onto its value rather than
         stopping dead on a number somebody is trying to read. */
      const eased = 1 - (1 - t) * (1 - t);
      const next = Math.round(origin + span * eased);
      /* Held on every frame rather than only at the end, so a reader who
         presses a second reading mid-roll starts from the figure that was
         on screen instead of from wherever the last roll began. */
      from.current = next;
      setShown(next);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return shown;
}
