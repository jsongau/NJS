import styles from "./PinMark.module.css";

/**
 * THE MARK: a solid disc inside a dial that draws a fraction.
 *
 * ── WHY IT IS NO LONGER A PIN ─────────────────────────────
 * The pin that stood here was drawn on a forty eight unit field with a
 * regulation profile, and it was a good drawing of a pin. It was also the
 * wrong object for the place it had to work hardest. A pin is tall and
 * narrow, so in a square field it uses about a third of the width and all
 * of the height; at twenty four pixels in the collapsed rail its neck,
 * its collar and the gap between its shoulders all land inside one pixel
 * and the whole silhouette closes up into a pale smudge. A disc uses the
 * entire field at every size, which is why every mark that has to survive
 * a favicon in the world is round.
 *
 * ── WHAT THE DISC SAYS HERE, AND WHAT IT DOES NOT ─────────────
 * Say the weakness first. The three cut circles in this disc are drilling
 * inherited from the console this one was adapted from, where they meant
 * something specific, and here they mean nothing in particular. They are
 * kept because the path, its constants and the stylesheet rule that cuts
 * them are one drawing, and redrawing a mark is a design decision rather
 * than part of a copy pass.
 *
 * What is left is still defensible, which is why it is left. A disc with
 * a groove round it is a dot on a map, at the top of a console whose main
 * screen is a map, and it is a shape nobody owns: no wordmark, no lockup,
 * no sampled brand colour and no red. It does not claim to say "home
 * services", and it should not try: the only marks that say that at
 * twenty four pixels are a house and a van silhouette, and `markerIcons`
 * argues in its own comment against drawing either of them.
 *
 * ── THE SAME STROKE LANGUAGE AS THE TWENTY SECTION MARKS ──────────
 * Twenty four unit field, two unit round stroke, and EXACTLY ONE SOLID
 * SHAPE. SectionMark states that rule and this mark obeys it, so the
 * thing at the top of the rail belongs to the family running down it
 * rather than sitting next to it. The one solid shape is the disc. The
 * dial is drawn at line weight, and the arc over it is the only other
 * ink in the file.
 *
 * ── THE HOLES ARE CUT, NOT PAINTED ───────────────────────
 * The disc and its three holes are ONE path with an even odd fill, so the
 * holes are genuinely absent and whatever surface the mark is standing on
 * shows through them. Painting them in a surface token would be a guess
 * about what that surface is, and this mark stands on the rail, on the
 * strip and inside a drawer, which are three surfaces across two grounds.
 * A hole is absence, and the honest way to draw absence is to leave it
 * out. It is also why there is no mask element here and therefore no
 * generated id to keep unique: a mark that needs a document global name
 * to render is a mark that breaks the second time it appears on a page.
 *
 * ── WHAT `fill` MEANS ───────────────────────────────────
 * Nothing on its own, and that is deliberate. The component draws the
 * fraction it is handed and the CALLER supplies the sentence saying what
 * the fraction counts, through `title`. The rail currently counts how
 * much of the trade area has been worked. A mark that encodes a number
 * without ever saying which number is decoration pretending to be data.
 *
 * ── READABLE IN GREYSCALE, WHICH IS THE REAL CONSTRAINT ───────────
 * The owner is colourblind, so the value is carried by ARC LENGTH first
 * and colour second, and the arc runs against four quarter notches so
 * "some of it" becomes "just past the half". The disc is light on the
 * dark ground and dark on the light one, which is a lightness difference
 * rather than a hue, so the mark holds through a black and white printer
 * and through a photograph of a screen.
 *
 * ── WHAT DOES NOT MOVE ────────────────────────────────
 * Nothing, after the first frame. The arc sweeps in once on mount and
 * then holds still, and even that is off under prefers-reduced-motion. A
 * perpetual animation in the chrome of a working tool is a thing the eye
 * keeps checking.
 *
 * ── WHY THE EXPORT IS STILL CALLED PinMark ──────────────────
 * Two other files reach for this name and neither is this pass's to edit.
 * Renaming an export across an ownership boundary is an API change
 * dressed up as a tidy, and it buys a word. The name is the slot at the
 * top of the chrome; the drawing is what changed.
 */

/** Centre of the field, which everything below is measured from. */
const C = 12;

/**
 * Dial geometry. The band is two units, the same weight every section
 * mark is drawn at, so the ring reads as a groove cut round the mark
 * rather than as a hairline near it.
 */
const RING_R = 10.4;
const RING_C = 2 * Math.PI * RING_R;
const BAND = 2;

/**
 * The quarter notches, at twelve, three, six and nine o'clock. A bare arc
 * only says "some of it"; an arc against quarters says "just past the
 * half", which is a number. They are cut in the ground rather than drawn
 * in ink, and they overshoot the band by a third of a unit so no
 * antialiased sliver survives inside a notch.
 */
const NOTCH_IN = RING_R - BAND / 2 - 0.35;
const NOTCH_OUT = RING_R + BAND / 2 + 0.35;
const NOTCHES: Array<{ x1: number; y1: number; x2: number; y2: number }> = [
  { x1: C, y1: C - NOTCH_IN, x2: C, y2: C - NOTCH_OUT },
  { x1: C + NOTCH_IN, y1: C, x2: C + NOTCH_OUT, y2: C },
  { x1: C, y1: C + NOTCH_IN, x2: C, y2: C + NOTCH_OUT },
  { x1: C - NOTCH_IN, y1: C, x2: C - NOTCH_OUT, y2: C },
];

/**
 * The disc, and the three holes cut in it.
 *
 * The radius leaves three and a half units of air inside the dial, which
 * is what stops the two shapes fusing into one blob at twenty four
 * pixels. The three holes sit high and to the left rather than centred,
 * and that offset is the load bearing part: centred, two round holes over
 * a third read as a face, which is the one thing this mark must not be.
 * Off centre they read as cut geometry and nothing else, which is what a
 * mark at this size can afford to say.
 */
const BALL_R = 5.9;
const HOLES: Array<{ cx: number; cy: number; r: number }> = [
  { cx: 9.25, cy: 9.3, r: 1.05 },
  { cx: 13.15, cy: 9.3, r: 1.05 },
  { cx: 11.2, cy: 13.15, r: 1.2 },
];

/**
 * A circle as a path, because a path can carry subpaths and a <circle>
 * cannot. Two half turn arcs, rounded to three places so the geometry
 * reads as numbers rather than as floating point noise.
 */
const round = (n: number) => Number(n.toFixed(3));
const circlePath = (cx: number, cy: number, r: number) =>
  `M${round(cx - r)} ${cy}` +
  `a${r} ${r} 0 1 0 ${round(r * 2)} 0` +
  `a${r} ${r} 0 1 0 ${round(-r * 2)} 0Z`;

/** The disc and its three cuts, in one path. See the even odd rule in
 *  the stylesheet for how the three subpaths become holes. */
const BALL_PATH = [
  circlePath(C, C, BALL_R),
  ...HOLES.map((h) => circlePath(h.cx, h.cy, h.r)),
].join("");

export function PinMark({
  size = 40,
  fill = 0.34,
  title = "The Territory Book",
}: {
  size?: number;
  /** The fraction the dial draws, 0 to 1. */
  fill?: number;
  /**
   * A full sentence naming what the fraction counts. This is both the
   * accessible name and the hover tooltip, and it is the caller's job
   * because only the caller knows what was measured.
   */
  title?: string;
}) {
  const pct = Math.min(1, Math.max(0, fill));

  return (
    <svg
      className={styles.mark}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      /*
        Belt and braces, and both are load bearing. The <title> element is
        what gives a pointer a tooltip on hover; aria-label is what a
        screen reader announces, and it wins over the title when both are
        present, so the two carry the same sentence. Neither is invented
        here: the shell passes the real figure in words.
      */
      aria-label={title}
    >
      <title>{title}</title>

      {/*
        --- The dial ----------------------------------------------------
        A full band for the distance still to run, with the covered arc
        laid over it at the same width so the two read as one groove
        partly filled. Both are rotated so the arc starts at twelve
        o'clock, which is where a reader expects a countdown to begin.
      */}
      <g transform={`rotate(-90 ${C} ${C})`}>
        <circle className={styles.track} cx={C} cy={C} r={RING_R} fill="none" />
        {/*
          Skipped entirely at zero rather than drawn as a zero length
          dash. A round cap on an empty dash renders as a dot at twelve
          o'clock in most engines, and a dot on an empty dial reads as a
          small amount of progress, which is the one thing an empty dial
          must not say.
        */}
        {pct > 0.001 && (
          <circle
            className={styles.progress}
            cx={C}
            cy={C}
            r={RING_R}
            fill="none"
            strokeDasharray={`${RING_C * pct} ${RING_C}`}
            strokeLinecap="butt"
            /*
              The arc's own length, handed to the stylesheet so the sweep
              starts from nothing and arrives at exactly this figure. A
              keyframe cannot compute it, and a constant start would leave
              the mark blank for most of the animation on a low fraction.
            */
            style={{ ["--dash" as string]: `${RING_C * pct}` }}
          />
        )}
      </g>

      <g className={styles.notches}>
        {NOTCHES.map((n, i) => (
          <line key={i} x1={n.x1} y1={n.y1} x2={n.x2} y2={n.y2} />
        ))}
      </g>

      {/* --- The disc ---------------------------------------------------- */}
      <path className={styles.ball} d={BALL_PATH} />
    </svg>
  );
}
