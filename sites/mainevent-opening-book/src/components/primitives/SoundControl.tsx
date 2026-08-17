import { useSound } from "@/state/SoundProvider";
import styles from "./SoundControl.module.css";

/**
 * THE CONTROL THAT ARMS THE CABINET.
 *
 * ── IT SAYS WHICH STATE IT IS IN, IN A WORD ───────────────────────
 * A speaker glyph with a stroke through it is the convention and the
 * convention is ambiguous: half the products on a screen use it to mean
 * "you are muted" and the other half to mean "press to mute". The owner
 * is colourblind and this codebase's first rule is that colour is never
 * the only signal, so this control carries three: the word Sound with
 * either "on" or "off" beside it, a glyph that gains or loses its two
 * waves, and aria-pressed for anything listening rather than looking.
 *
 * ── THE GLYPH IS DRAWN HERE AND NOT IMPORTED ──────────────────────
 * SectionMark owns the marks for places. This is not a place, it is a
 * setting, so it belongs to the same small family as the rail's chevron:
 * one shape, one stroke weight, sixteen unit field, no fill. The two
 * waves are the only thing that changes between the states, and they
 * change by being absent rather than by being crossed out, because a
 * cancel stroke over a speaker reads as an error at sixteen pixels.
 *
 * ── AND WHY IT IS NOT A SLIDER ────────────────────────────────────
 * Volume is a decision this application already made, at 0.05 of full
 * scale, quiet enough to sit under a conversation. A control nobody
 * moves is a control that should have been a decision, and a work sample
 * with a volume slider on it is a work sample that spent its reader's
 * attention on the wrong thing.
 */
export function SoundControlButton() {
  const { on, toggle } = useSound();

  return (
    <button
      type="button"
      data-rail-item=""
      /* The delegated press listener would otherwise click on top of the
         arming cue this control plays for itself. */
      data-sound="off"
      className={styles.sound}
      aria-pressed={on}
      title={
        on
          ? "Sound is on. Press to silence the cabinet."
          : "Sound is off. Press to let the cabinet make a noise."
      }
      onClick={toggle}
    >
      <svg
        className={styles.glyph}
        viewBox="0 0 16 16"
        width={16}
        height={16}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        {/* The cabinet's own speaker: a cone, always drawn. */}
        <path d="M3 6.2h2.3L8.4 3.6v8.8L5.3 9.8H3z" />
        {/* The two waves, present only when it is making a noise. */}
        {on ? (
          <>
            <path d="M10.8 5.9a3 3 0 0 1 0 4.2" />
            <path d="M12.7 4a5.6 5.6 0 0 1 0 8" />
          </>
        ) : null}
      </svg>
      <span className={styles.label}>
        Sound <strong className={styles.state}>{on ? "on" : "off"}</strong>
      </span>
    </button>
  );
}
