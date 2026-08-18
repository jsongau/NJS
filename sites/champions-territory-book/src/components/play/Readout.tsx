import { useEffect, useRef, useState } from "react";
import styles from "./Readout.module.css";

/**
 * A FIGURE IN THE CHROME, AS A READOUT RATHER THAN AS A NUMBER IN
 * BRACKETS.
 *
 * ── WHAT A READOUT IS ─────────────────────────────────────────────
 * A recessed well, a hairline, and the figure in the mono face on a
 * fixed character width. It is the shape a scoreboard uses and the shape
 * a nav does not, and the difference is the whole point: these figures
 * are the live state of the week, not a parenthetical count of how many
 * things a menu leads to. Twenty of them down a rail read as an
 * instrument panel.
 *
 * ── THE TICK, AND WHERE IT IS ALLOWED TO HAPPEN ───────────────────
 * A count that changes while somebody is looking at it should be seen to
 * change. So a figure that moves scales up once and settles, in the
 * section's own ink, over one duration token. It never runs on mount,
 * because twenty figures popping as a page loads is a page apologising
 * for existing rather than a screen reporting a change.
 *
 * The animation is TRANSFORM AND COLOUR ONLY, and it is confined to the
 * chrome. Nothing on a data surface does this: three hundred and twenty nine rows
 * that shimmered as a filter landed would be unreadable at exactly the
 * moment somebody was reading them.
 *
 * Under prefers-reduced-motion the duration token is zero, so the figure
 * changes and nothing moves. That is the correct behaviour rather than a
 * degraded one: the number is the signal and the motion was only ever
 * pointing at it.
 *
 * ── THE UNIT IS SAID, NEVER SHOWN ─────────────────────────────────
 * "18" beside the word Today means nothing on its own to somebody
 * listening rather than looking, so the caller passes what the figure
 * counts and it is read out after it. Same contract the rail already
 * had; this component just stops every caller writing it by hand.
 */
export function Readout({
  value,
  unit,
  /** Marks the biggest figure in a group, which gets the section ink. */
  lead = false,
}: {
  /** Null renders an empty well of the same width, so nothing shuffles. */
  value: number | null;
  unit?: string;
  lead?: boolean;
}) {
  const generation = useChangeCount(value);

  return (
    <span className={styles.readout} data-lead={lead ? "yes" : "no"}>
      {/*
        The key is the mechanism. A CSS animation only restarts on a
        fresh element, and React gives one for free when the key moves,
        so the tick fires exactly once per change with no timers to
        clear and no state to reset if a figure changes twice in a
        frame.
      */}
      <span
        key={generation}
        className={`${styles.digits} num`}
        data-tick={generation > 0 ? "yes" : "no"}
      >
        {value === null ? "" : value}
      </span>
      {value !== null && unit ? (
        <span className="visually-hidden"> {unit}</span>
      ) : null}
    </span>
  );
}

/**
 * How many times this figure has moved since the component mounted.
 *
 * Zero is the load, and the load must not animate. Everything after it
 * is a real change made by something a person did.
 */
function useChangeCount(value: number | null): number {
  const previous = useRef(value);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (previous.current === value) return;
    previous.current = value;
    setCount((n) => n + 1);
  }, [value]);

  return count;
}
