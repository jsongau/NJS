import { useId, useRef, type KeyboardEvent } from "react";
import type { Lane, OccasionClass } from "@/domain/types";
import { LANE_META, LANE_ORDER, OCCASION_CLASS_META } from "@/domain/lanes";
import type { PipelineAction } from "@/state/PipelineProvider";
import styles from "./OccasionSegment.module.css";

/**
 * THE ONE CONTROL THAT ANSWERS THE QUESTION THIS SCREEN WAS ASKED.
 *
 * The ask was to separate the demand that arrives on its own from the
 * demand somebody has to be talked into, and the honest answer is not a
 * category dropdown. It is the OCCASION CLASS split, which is already the
 * sharpest line in the domain model. A household with a dead condenser in
 * August is going to spend the money whatever anybody does: the timing is
 * not negotiable, the season set it, and a brand that is not findable in
 * the hour of the failure has missed the job. A property management
 * company agreeing a vendor list is buying because somebody decided to:
 * real budget, no date until a person picks one, postponable right up
 * until it happens. Those are two different sales calls made in two
 * different months, and they are not two kinds of business at all.
 * Sorting by industry would have put an HOA board and a chamber of
 * commerce in different buckets while hiding the thing that actually
 * decides when you ring them.
 *
 * ---------------------------------------------------------------
 * WHY THIS DRIVES THE SHARED LANE FILTER RATHER THAN A FILTER OF ITS OWN
 * ---------------------------------------------------------------
 *
 * A class is a set of lanes, so pressing "Calendar" writes that set into
 * `laneFilter` on `PipelineProvider` through a single `SET_LANES`
 * dispatch. It does not keep a private copy of what the reader is
 * looking at.
 *
 * The rejected alternative was a local piece of state in the map page,
 * which is less code and reads fine on one screen. It fails the moment
 * the reader leaves: the map would be showing three lines while the desk
 * behind it still showed nine, and two screens disagreeing about what
 * is being looked at is exactly the failure a shared filter exists to
 * prevent. Filter to plumbing here and the desk is filtered to plumbing
 * when the reader gets back to it. That is not a convenience, it
 * is the claim this whole application makes: one data model, not five
 * screens that each remember something different.
 *
 * The pressed state is DERIVED from `laneFilter` rather than stored, by
 * `segmentValue` below. So ticking one lane chip afterwards drops the
 * segment out of its pressed state on its own, which is correct: the
 * reader has narrowed past a whole class and the control should stop
 * claiming to represent them.
 *
 * Three positions rather than the two in the reference screen. Retail
 * and bars are exhaustive there; here a reader who has narrowed to one
 * class needs a signposted way back to everything, and hunting for a
 * clear control is not a way back.
 *
 * ---------------------------------------------------------------
 * WHY TWO ACROSS AND A FULL WIDTH RESET, RATHER THAN THREE ACROSS
 * ---------------------------------------------------------------
 *
 * The first build put all three positions in one row. The list column is
 * 328px and it is not negotiable, so three positions each carrying a
 * glyph, a word and a figure got about ninety pixels apiece and the
 * words collapsed to "C..." and "C..." and "B". Two positions labelled
 * "C..." is not a tight layout, it is a control with no labels on it, on
 * the one screen where the label is the entire point.
 *
 * The fix is not a smaller typeface. Shrinking type until three long
 * things fit in a short row produces something that technically shows
 * the word and that nobody reads, and the reader who most needs this
 * control is the one squinting at a phone in a car park. So the row is
 * given fewer things to hold: the two real classes sit side by side with
 * about a hundred and thirty pixels of usable width each, which is more
 * than "Calendar" needs at its heaviest weight, and the way back to
 * everything takes the full width underneath them.
 *
 * That shape is also more honest than the row it replaces. "Both" is not
 * a third kind of buyer. It is the absence of a narrowing, and giving it
 * a different footprint from the two classes says so before anybody
 * reads a word of it.
 *
 * THE SHORT LABELS COME FROM `OCCASION_CLASS_META.short`, which already
 * carries "Calendar" and "Chosen" and already explains in a comment why
 * the interface copy is allowed to differ from the type literal.
 * `calendar-locked` and `discretionary` are the names the data model
 * uses about itself; they are not what a rep says out loud, and this
 * file does not get to invent a second pair of words for the same two
 * ideas. The full names stay on the tooltip and on the accessible name
 * of every position, so nothing is lost, only shortened.
 *
 * THE SENTENCE UNDERNEATH IS NOT DECORATION. "The season buys, not the
 * buyer" is the single most useful line in this domain model and no
 * reader is going to infer it from two chips and a count. It is wired to
 * the group with `aria-describedby` so it is read once, when the group
 * is entered, rather than repeated on every position.
 */

/** The classes, read from the meta block so a third one would appear here. */
const CLASSES = Object.keys(OCCASION_CLASS_META) as OccasionClass[];

/** Reading order. The two classes, then the way back to everything. */
export const OCCASION_SEGMENT_ORDER: (OccasionClass | null)[] = [
  ...CLASSES,
  null,
];

/** Every lane in a class, computed from LANE_META rather than listed. */
export function lanesOfClass(occasion: OccasionClass): Lane[] {
  return LANE_ORDER.filter(
    (lane) => LANE_META[lane].occasionClass === occasion,
  );
}

/**
 * Which position the shared lane filter currently amounts to.
 *
 * Pressed only when the filter is EXACTLY one class's lane set. An empty
 * filter means every lane, which is the "Both" position. Anything else,
 * such as two demand lines and one partner line, is a narrower thing
 * than any of the three positions can describe, so none of them claims
 * it.
 */
export function segmentValue(laneFilter: Lane[]): OccasionClass | null {
  const set = new Set(laneFilter);
  for (const occasion of CLASSES) {
    const lanes = lanesOfClass(occasion);
    if (set.size === lanes.length && lanes.every((lane) => set.has(lane))) {
      return occasion;
    }
  }
  return null;
}

/**
 * Write a whole class of lanes into the shared filter in one dispatch.
 *
 * `SET_LANES` is the single action `PipelineProvider` carries for this
 * control, and it exists so that choosing a class costs one render
 * rather than four `TOGGLE_LANE` dispatches in a row. Four dispatches
 * would also pass through three intermediate filters that no reader ever
 * asked for, and on a board this size a reader can see that happening.
 *
 * This stayed a named function rather than an inline dispatch because
 * the segment is not the only control that will ever want to write a set
 * of lanes at once, and a caller that reaches for the reducer directly
 * is a caller that can get the shape of the action wrong.
 */
export function setLaneFilter(
  dispatch: (action: PipelineAction) => void,
  lanes: Lane[],
): void {
  dispatch({ type: "SET_LANES", lanes });
}

export interface OccasionSegmentProps {
  /** Null means both classes are showing. */
  value: OccasionClass | null;
  onChange: (value: OccasionClass | null) => void;
  counts: Record<OccasionClass, number>;
  /** Sits on the group, for a pane that already names itself above it. */
  label?: string;
}

export function OccasionSegment({
  value,
  onChange,
  counts,
  label = "Why they buy",
}: OccasionSegmentProps) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const uid = useId();
  const labelId = `${uid}-label`;
  const noteId = `${uid}-note`;

  const total = CLASSES.reduce((n, occasion) => n + (counts[occasion] ?? 0), 0);

  /*
    Real radio semantics, and arrow keys that move the selection with the
    focus. Three divs with an onClick would look identical and would be
    unreachable by keyboard, unannounced by a screen reader and invisible
    to voice control. A radiogroup is what this is: three positions, one
    of them true.
  */
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key)) return;

    const at = OCCASION_SEGMENT_ORDER.findIndex((p) => p === value);
    const last = OCCASION_SEGMENT_ORDER.length - 1;
    const from = at === -1 ? last : at;

    let next = from;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = from === last ? 0 : from + 1;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = from === 0 ? last : from - 1;
    } else if (event.key === "Home") {
      next = 0;
    } else {
      next = last;
    }

    event.preventDefault();
    onChange(OCCASION_SEGMENT_ORDER[next]);
    buttons.current[next]?.focus();
  }

  return (
    <div className={styles.group}>
      <p className={styles.groupLabel} id={labelId}>
        {label}
      </p>

      <div
        className={styles.segment}
        role="radiogroup"
        aria-labelledby={labelId}
        aria-describedby={noteId}
        onKeyDown={onKeyDown}
      >
        {OCCASION_SEGMENT_ORDER.map((position, i) => {
          const meta = position ? OCCASION_CLASS_META[position] : null;
          const checked = position === value;
          const count = position ? (counts[position] ?? 0) : total;

          /*
            "Both" has no meta block of its own and is not given an
            invented glyph. It carries the two class glyphs together,
            which is literally what the position means and keeps the
            shape vocabulary at two marks rather than three.
          */
          const glyph = meta
            ? meta.glyph
            : CLASSES.map((c) => OCCASION_CLASS_META[c].glyph).join("");
          const word = meta ? meta.short : "Both";
          const full = meta ? meta.label : "Both classes of buyer";

          return (
            <button
              key={position ?? "both"}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              ref={(node) => {
                buttons.current[i] = node;
              }}
              className={styles.position}
              data-checked={checked || undefined}
              /* The reset takes the whole row. See the CSS module. */
              data-reset={position === null || undefined}
              title={full}
              aria-label={`${full}, ${count} organisations`}
              onClick={() => onChange(position)}
            >
              <span className={styles.glyph} aria-hidden="true">
                {glyph}
              </span>
              <span className={styles.word}>{word}</span>
              <span className={`${styles.count} num`} aria-hidden="true">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <p className={styles.note} id={noteId}>
        The season buys, not the buyer. A failure gets fixed anyway; a
        planned replacement is somebody's decision.
      </p>
    </div>
  );
}
