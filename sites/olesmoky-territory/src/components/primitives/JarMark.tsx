import { useId } from "react";
import styles from "./JarMark.module.css";

/**
 * The mark: a mason jar, drawn rather than photographed.
 *
 * WHY A JAR AND NOT A LOGO. This is an unaffiliated work sample, so it
 * cannot use Ole Smoky's wordmark or trade dress. What it can use is
 * the object the whole brand is built around — a threaded jar with a
 * lid band — because a jar is a jar. Every line here is original.
 *
 * WHAT MOVES. Three things, and each one has a reason:
 *
 *   1. The fill rises once on mount. A jar filling is the only piece of
 *      motion that says "shine" without a word, and it lasts under a
 *      second so it reads as a flourish rather than a loading state.
 *   2. A specular glint sweeps across the glass, clipped to the jar
 *      silhouette so it never escapes the shape. On mount, then again
 *      on hover.
 *   3. The liquid surface has a slow, tiny sway — two degrees of
 *      rotation on a long ease. Nothing you look at directly; the sort
 *      of thing you only notice is missing.
 *
 * ALL OF IT STOPS under prefers-reduced-motion, which is handled in the
 * stylesheet rather than here so there is one place to check.
 *
 * useId() FOR EVERY REFERENCED ID. Gradients and clip paths are
 * document-global in SVG. Two of these on one page with hard-coded ids
 * means the second one silently steals the first one's gradient — a bug
 * that only appears once somebody reuses the component, which is to say
 * later, in front of somebody.
 */
export function JarMark({
  size = 40,
  fill = 0.62,
  title = "Ole Smoky mason jar",
}: {
  size?: number;
  /** How full, 0 to 1. The nav uses a modest pour; the hero fills it. */
  fill?: number;
  title?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const glass = `glass-${uid}`;
  const liquid = `liquid-${uid}`;
  const clip = `clip-${uid}`;
  const glint = `glint-${uid}`;

  // The jar body runs from y=22 (shoulder) to y=58 (base) in a 48x64 box.
  const TOP = 22;
  const BOTTOM = 58;
  const level = BOTTOM - (BOTTOM - TOP) * Math.min(1, Math.max(0, fill));

  return (
    <svg
      className={styles.mark}
      width={size}
      height={(size * 64) / 48}
      viewBox="0 0 48 64"
      role="img"
      aria-label={title}
      style={{ ["--level" as string]: `${level}` }}
    >
      <defs>
        {/* Glass: cool at the edges, near-clear through the middle. */}
        <linearGradient id={glass} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c9cfc6" stopOpacity="0.55" />
          <stop offset="22%" stopColor="#ffffff" stopOpacity="0.14" />
          <stop offset="70%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#9aa396" stopOpacity="0.5" />
        </linearGradient>

        {/* The pour. Antique gold, deeper at the bottom of the jar. */}
        <linearGradient id={liquid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d8a83f" />
          <stop offset="45%" stopColor="#b8862a" />
          <stop offset="100%" stopColor="#8a6a1c" />
        </linearGradient>

        {/* A narrow white band, swept across by the stylesheet. */}
        <linearGradient id={glint} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.72" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.72" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Everything decorative is clipped to the jar silhouette. */}
        <clipPath id={clip}>
          <path d="M11 26c0-2.6 1.1-4.1 2.6-5.2V16h20.8v4.8c1.5 1.1 2.6 2.6 2.6 5.2v28.2c0 3.2-1.8 4.8-5 4.8H16c-3.2 0-5-1.6-5-4.8V26z" />
        </clipPath>
      </defs>

      {/* --- Lid band ------------------------------------------------ */}
      <rect
        x="12.4"
        y="5.4"
        width="23.2"
        height="7.2"
        rx="1.6"
        fill="#5c4a1f"
      />
      <rect
        x="12.4"
        y="5.4"
        width="23.2"
        height="2.6"
        rx="1.3"
        fill="#8a6a1c"
        opacity="0.85"
      />

      {/* --- Threaded neck ------------------------------------------- */}
      <path
        d="M13.6 12.6h20.8V16H13.6z"
        fill="#c9cfc6"
        opacity="0.5"
      />
      {[13.4, 15.0].map((y, i) => (
        <rect
          key={i}
          x="13.6"
          y={y}
          width="20.8"
          height="0.9"
          rx="0.45"
          fill="#8a8f85"
          opacity="0.45"
        />
      ))}

      {/* --- The jar ------------------------------------------------- */}
      <g clipPath={`url(#${clip})`}>
        {/* Empty glass behind the pour. */}
        <rect x="9" y="14" width="30" height="46" fill={`url(#${glass})`} />

        {/* The pour. Rises on mount; the surface sways. */}
        <g className={styles.pour}>
          <rect
            x="9"
            y={level}
            width="30"
            height={BOTTOM + 2 - level}
            fill={`url(#${liquid})`}
          />
          <ellipse
            className={styles.surface}
            cx="24"
            cy={level}
            rx="15"
            ry="1.5"
            fill="#e6bf5c"
            opacity="0.9"
          />
        </g>

        {/* Embossed ribs. Barely there, but a flat jar reads as a bottle. */}
        {[28, 34, 40, 46, 52].map((y) => (
          <rect
            key={y}
            x="9"
            y={y}
            width="30"
            height="0.6"
            fill="#ffffff"
            opacity="0.1"
          />
        ))}

        {/* The sweep. */}
        <rect
          className={styles.glint}
          x="-24"
          y="10"
          width="18"
          height="54"
          fill={`url(#${glint})`}
          transform="skewX(-12)"
        />
      </g>

      {/* --- Silhouette, drawn last so it sits over everything -------- */}
      <path
        d="M11 26c0-2.6 1.1-4.1 2.6-5.2V16h20.8v4.8c1.5 1.1 2.6 2.6 2.6 5.2v28.2c0 3.2-1.8 4.8-5 4.8H16c-3.2 0-5-1.6-5-4.8V26z"
        fill="none"
        stroke="#14120f"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <rect
        x="12.4"
        y="5.4"
        width="23.2"
        height="7.2"
        rx="1.6"
        fill="none"
        stroke="#14120f"
        strokeWidth="1.6"
      />
    </svg>
  );
}
