import type { CSSProperties } from "react";
import type { Lane, PitchStatus } from "@/domain/types";
import { LANE_META } from "@/domain/lanes";
import {
  clusterMarkScene,
  laneIconScene,
  prospectMarkScene,
  venueMarkScene,
  type MarkScene,
  type MarkShape,
} from "@/lib/map/markerIcons";
import styles from "./LaneGlyph.module.css";

/**
 * THE MAP'S MARKS, AS REACT, FROM THE SAME DRAWING AS THE MAP.
 *
 * WHY THIS FILE EXISTS. Leaflet builds a marker from an HTML string, and
 * a legend, a filter chip and a list row build theirs from JSX. That is
 * two rendering paths for one drawing, and the ordinary way to serve both
 * is to write the shape twice: once in a template literal for the map and
 * once as JSX for everything else. Those two copies agree for about a
 * week. Then somebody nudges a roofline for the map, the legend keeps the
 * old one, and the key on the screen is quietly describing a mark that no
 * longer exists. A reader believes a key, which is what makes that
 * failure worse than no key at all.
 *
 * So neither renderer owns a coordinate. `lib/map/markerIcons.ts` builds
 * a `MarkScene`, which is a plain data description of a mark: paths,
 * circles, rectangles and text runs, each carrying paint expressed as a
 * CSS custom property. That module turns a scene into a string for
 * `L.divIcon`. This file turns the SAME scene into elements. A change to
 * the schoolhouse lands in both surfaces in one edit, because there is
 * only one schoolhouse.
 *
 * THE PAINT GOES THROUGH `style` AND NOT THROUGH `fill`. A presentation
 * attribute does not resolve a custom property: `fill="var(--lane-schools)"`
 * paints nothing, while `style={{ fill: "var(--lane-schools)" }}` paints
 * the lane. That is the whole reason every shape in the scene carries its
 * paint as a property reference rather than as a colour, and it is what
 * keeps a hex literal out of the one part of this application that sits
 * outside the stylesheet.
 *
 * WHAT A CALLER SHOULD REACH FOR
 *
 *   LaneGlyph      the lane's own drawing, alone or inside its body. This
 *                  is the legend row, the filter chip and the list icon.
 *   VenueGlyph     the broken ring. The Irvine address is an office.
 *   ClusterGlyph   the numbered bubble.
 *   MarkSvg        any scene at all, for a caller holding one already.
 */

// ---------------------------------------------------------------
// The renderer
// ---------------------------------------------------------------

function paintStyle(s: Extract<MarkShape, { k: "path" | "circle" | "rect" }>): CSSProperties {
  return { fill: s.fill ?? "none", stroke: s.stroke ?? "none" };
}

function renderShape(shape: MarkShape, key: number) {
  switch (shape.k) {
    case "path":
      return (
        <path
          key={key}
          d={shape.d}
          style={paintStyle(shape)}
          strokeWidth={shape.sw}
          strokeDasharray={shape.dash}
          strokeLinecap={shape.cap}
          strokeLinejoin={shape.join}
          opacity={shape.opacity}
        />
      );
    case "circle":
      return (
        <circle
          key={key}
          cx={shape.cx}
          cy={shape.cy}
          r={shape.r}
          style={paintStyle(shape)}
          strokeWidth={shape.sw}
          strokeDasharray={shape.dash}
          strokeLinecap={shape.cap}
          opacity={shape.opacity}
        />
      );
    case "rect":
      return (
        <rect
          key={key}
          x={shape.x}
          y={shape.y}
          width={shape.w}
          height={shape.h}
          rx={shape.rx}
          style={paintStyle(shape)}
          strokeWidth={shape.sw}
          opacity={shape.opacity}
        />
      );
    case "text":
      return (
        <text
          key={key}
          x={shape.x}
          y={shape.y}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fill: shape.fill ?? "var(--text-0)",
            fontFamily: shape.font ?? "var(--font-ui)",
          }}
          fontSize={shape.fontSize}
          fontWeight={shape.weight}
          letterSpacing={shape.letterSpacing}
          opacity={shape.opacity}
        >
          {shape.value}
        </text>
      );
    case "group":
      return (
        <g key={key} transform={shape.transform} opacity={shape.opacity}>
          {shape.children.map((c, i) => renderShape(c, i))}
        </g>
      );
  }
}

export interface MarkSvgProps {
  scene: MarkScene;
  /**
   * Overrides the accessible name. The `<title>` still says what the
   * drawing is, so a hover always answers "what am I looking at" even
   * when the label answers "which one is this".
   */
  label?: string;
  /**
   * The mark sits beside a word that already names it.
   *
   * Then it is decoration, and a screen reader announcing "schoolhouse,
   * schools and districts" immediately before the words "Schools and
   * districts" is reading the row twice. The title is kept for a sighted
   * reader hovering it.
   */
  decorative?: boolean;
  className?: string;
}

/** Any scene, drawn. The one renderer this file has. */
export function MarkSvg({ scene, label, decorative = false, className }: MarkSvgProps) {
  const height = scene.height ?? scene.size;
  const viewBoxHeight = scene.viewBoxHeight ?? scene.viewBox;

  return (
    <svg
      className={[styles.mark, className].filter(Boolean).join(" ")}
      width={scene.size}
      height={height}
      viewBox={`0 0 ${scene.viewBox} ${viewBoxHeight}`}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : (label ?? scene.ariaLabel)}
      opacity={scene.opacity}
      focusable="false"
    >
      <title>{scene.title}</title>
      {scene.shapes.map((s, i) => renderShape(s, i))}
    </svg>
  );
}

// ---------------------------------------------------------------
// The lane mark
// ---------------------------------------------------------------

export interface LaneGlyphProps {
  lane: Lane;
  /**
   * Rendered size in CSS pixels.
   *
   * The set was drawn on a 24 unit grid and checked at 16 and at 40, so
   * those two are safe, and so is anything between them. Below 14 the
   * hairline stops being ink on a 1x display and the drawing turns to
   * grey mush; use the word on its own at that point rather than a mark
   * nobody can read.
   */
  size?: number;
  /**
   * `icon` draws the lane's own picture alone, which is what a legend row
   * or a filter chip wants. `mark` draws the whole map marker: the
   * pointed or square body, the picture inside it, and any state on its
   * corner. A key that shows the icon alone has taught the reader half
   * the encoding, so the legend shows both.
   */
  variant?: "icon" | "mark";
  /** Only meaningful on `mark`. Draws the status pip. */
  status?: PitchStatus;
  /** Only meaningful on `mark`. Halo plus a heavier outline. */
  selected?: boolean;
  /** Only meaningful on `mark`. The off-route treatment on the field run. */
  muted?: boolean;
  /** Overrides the accessible name. Defaults to the lane's full label. */
  label?: string;
  decorative?: boolean;
  className?: string;
}

/**
 * A lane, drawn.
 *
 * THE SHAPE RULE IS THE SAME ONE `LaneChip` PRINTS AT ITS LEFT EDGE, and
 * that is deliberate rather than convenient. A pointed body means
 * calendar-locked: the date buys, not the buyer, and a graduating class
 * graduates whether or not anybody calls it. A square body means
 * discretionary: somebody has to decide there will be an event at all.
 * A reader learns that pair once on a chip and reads it for free on
 * two hundred and eleven pins, which only holds while the two agree. Both
 * take the class from `LANE_META[lane].occasionClass` and neither writes
 * down which lanes are which.
 */
export function LaneGlyph({
  lane,
  size = 20,
  variant = "icon",
  status,
  selected,
  muted,
  label,
  decorative = false,
  className,
}: LaneGlyphProps) {
  const meta = LANE_META[lane];
  const scene =
    variant === "mark"
      ? scaled(
          prospectMarkScene({
            lane,
            label: label ?? meta.label,
            status,
            selected,
            muted,
          }),
          size,
        )
      : laneIconScene(lane, { size });

  return (
    <MarkSvg
      scene={scene}
      label={label ?? meta.label}
      decorative={decorative}
      className={className}
    />
  );
}

/**
 * The venue, drawn.
 *
 * The ring is broken because the building is an office rather than a
 * store. DIME publishes an address and a corporate profile for it and
 * nothing else, so a solid pin would be the drawing making a claim the
 * company has not made.
 */
export function VenueGlyph({
  name,
  label,
  size,
  decorative = false,
  className,
}: {
  name: string;
  /** The words under the ring. The mark's own default unless a caller insists. */
  label?: string;
  size?: number;
  decorative?: boolean;
  className?: string;
}) {
  const base = venueMarkScene(name, label);
  return (
    <MarkSvg
      scene={size === undefined ? base : scaled(base, size)}
      decorative={decorative}
      className={className}
    />
  );
}

/**
 * A cluster bubble, drawn.
 *
 * Neutral, never a lane colour, because a group that spans lanes painted
 * with its majority lane is a claim the group does not support.
 */
export function ClusterGlyph({
  count,
  detail,
  size,
  decorative = false,
  className,
}: {
  count: number;
  /** The lane mix in words, appended to the title. */
  detail?: string;
  size?: number;
  decorative?: boolean;
  className?: string;
}) {
  const base = clusterMarkScene(count, { detail });
  return (
    <MarkSvg
      scene={size === undefined ? base : scaled(base, size)}
      decorative={decorative}
      className={className}
    />
  );
}

/**
 * The same drawing at a different rendered size.
 *
 * Only `size` moves. The viewBox, and therefore every coordinate in the
 * scene, is untouched, so a mark shrunk for a legend row is the same mark
 * the map draws rather than a redrawn approximation of it.
 */
function scaled(scene: MarkScene, size: number): MarkScene {
  const ratio = size / scene.size;
  return {
    ...scene,
    size,
    height: scene.height === undefined ? undefined : scene.height * ratio,
  };
}
