import L from "leaflet";
import type { Lane, OccasionClass, PitchStatus } from "@/domain/types";
import { LANE_META, LANE_ORDER, OCCASION_CLASS_META } from "@/domain/lanes";
import { PITCH_STATUS, PITCH_STATUS_ORDER } from "@/domain/vocabulary";
import { PROSPECTS } from "@/data/prospects";

/**
 * EVERY MARK THAT GOES ON THE TRADE AREA MAP, DRAWN ONCE.
 *
 * WHY THIS FILE EXISTS. A Leaflet marker is an HTML string handed to a
 * library, which means it sits outside React, outside CSS Modules and
 * outside every guarantee the rest of this codebase relies on. Left in a
 * page component that string quietly becomes the one place in the
 * application where a colour is a hex literal and a state has no glyph,
 * because nobody reviewing a page component reads the middle of a
 * template literal. One file, one set of shapes, and the legend beside
 * the map is drawn by calling these same builders, so a swatch and a
 * marker cannot disagree.
 *
 * WHAT CHANGED IN THIS PASS, AND WHY IT WAS WORTH THE WORK. The map used
 * to plot two hundred and eleven real organisations as a coloured body with
 * a single geometric character inside it. A reader could tell the two
 * occasion classes apart at a glance and could tell the lanes apart only
 * by consulting the key, because a diamond and a lozenge are not a
 * hospital and a car showroom, they are two lozenges. So each lane now
 * carries a drawing of the KIND OF PLACE it is: a schoolhouse, a
 * mortarboard, a dumbbell, an office tower, a car, a bed, an arched
 * window, a clinic cross, a shopfront. The map is then readable without
 * the key, and the key teaches it in one pass instead of asking a reader
 * to memorise nine abstract marks.
 *
 * THE FOUR CHANNELS, IN THE ORDER A READER USES THEM
 *
 *   SHAPE   POINTED body for a calendar-locked lane, SQUARE body for a
 *           discretionary one. This is the biggest single distinction in
 *           the application, it is the same pair of shapes `LaneChip`
 *           puts at the left edge of every chip, and it has to be
 *           readable without clicking anything.
 *   ICON    the kind of place, so nine lanes stay separable rather than
 *           only the two classes. In go-see route mode the icon is
 *           replaced by the stop number, which is the one thing a numeral
 *           does better than any drawing.
 *   STATE   a status pip on the body's lower right, drawn as the FILLING
 *           CIRCLE this application already uses for pitch status:
 *           an empty ring, a quarter, a half, three quarters, a solid
 *           disc, and a cross for lost. Unworked carries no pip at all,
 *           because unworked is the honest default for most of a trade
 *           area before a venue opens and a hundred pips saying "nothing
 *           has happened here" is a hundred marks of noise.
 *   COLOUR  fourth, always, and drawn from the Okabe-Ito lane tokens.
 *
 * Take the colour away and every distinction above survives. That is the
 * test, it is not a figure of speech, and it is run: a throwaway harness
 * rendered every mark at 16px and 40px through a greyscale filter and
 * measured every pair of lanes against every other pair.
 *
 * HOW THE REACT COMPONENT AND THE HTML STRING ARE KEPT IDENTICAL. They
 * are not two drawings. Every mark in this file is built as a `MarkScene`,
 * which is a plain data description of the mark: a list of paths,
 * circles, rectangles and text runs with the paint on each. This module
 * turns a scene into an SVG string for `L.divIcon`, and
 * `components/map/LaneGlyph.tsx` turns THE SAME scene into React
 * elements. Neither renderer holds a coordinate of its own. A geometry
 * change lands in both surfaces in the same commit or it lands in
 * neither, which is the failure this arrangement exists to prevent:
 * two hand-maintained copies of one mark drift within a week, and the
 * first thing a reader notices is that the legend is lying.
 *
 * COLOUR NEVER APPEARS AS A LITERAL. Paint is always a CSS custom
 * property reference, and it is applied through the `style` attribute
 * rather than through the `fill` and `stroke` presentation attributes,
 * because `fill="var(--lane-schools)"` does not resolve while
 * `style="fill: var(--lane-schools)"` does. Custom properties inherit
 * into this markup exactly as they do into the rest of the document, so
 * the map reads the same tokens as every chip on the page.
 *
 * ONE THING A CONSUMING PAGE MUST DO. Leaflet ships `.leaflet-div-icon`
 * with a white background and a grey border, which frames every one of
 * these shapes in a box. Any page mounting these icons has to neutralise
 * it, which the map pages do with
 *
 *   .mapPane :global(.ob-marker) { background: none; border: 0; }
 *
 * That reset lives with the map rather than in base.css because base.css
 * is shared by screens with no map on them at all.
 */

// ---------------------------------------------------------------
// The scene description. One drawing, two renderers.
// ---------------------------------------------------------------

/**
 * Paint, shared by every shape.
 *
 * `fill` and `stroke` are CSS custom property references such as
 * `var(--lane-schools)`, never a colour. `sw` is the stroke width in
 * viewBox units.
 */
export interface MarkPaint {
  fill?: string;
  stroke?: string;
  sw?: number;
  /** `stroke-dasharray`, in viewBox units. The venue's ring uses it. */
  dash?: string;
  opacity?: number;
  cap?: "round" | "butt" | "square";
  join?: "round" | "miter" | "bevel";
}

export type MarkShape =
  | ({ k: "path"; d: string } & MarkPaint)
  | ({ k: "circle"; cx: number; cy: number; r: number } & MarkPaint)
  | ({ k: "rect"; x: number; y: number; w: number; h: number; rx?: number } & MarkPaint)
  | ({
      k: "text";
      x: number;
      y: number;
      value: string;
      fontSize: number;
      weight?: number;
      /** A font custom property reference, such as `var(--font-mono)`. */
      font?: string;
      letterSpacing?: string;
    } & MarkPaint)
  | { k: "group"; transform?: string; opacity?: number; children: MarkShape[] };

/**
 * A complete mark: a square drawing surface, the words that describe it,
 * and the shapes inside it.
 *
 * `title` and `ariaLabel` are separate because they answer different
 * questions. The title is what the drawing IS ("A schoolhouse, schools
 * and districts"), which is what a reader hovering a legend swatch wants.
 * The aria label is what this particular mark MEANS in context ("Irvine
 * High School, schools and districts, calendar locked"), which is
 * what a screen reader user tabbing across a map needs. A mark with only
 * one of the two either reads as an unlabelled picture or announces a
 * shape rather than an organisation.
 */
export interface MarkScene {
  /** Rendered size in CSS pixels. */
  size: number;
  /** Square viewBox side, in drawing units. */
  viewBox: number;
  /** Non-square marks state their own box. The venue plate needs it. */
  viewBoxHeight?: number;
  height?: number;
  title: string;
  ariaLabel: string;
  shapes: MarkShape[];
  opacity?: number;
}

// ---------------------------------------------------------------
// The lane icons
// ---------------------------------------------------------------

/**
 * THE ICON GRID, AND WHY IT IS TWENTY FOUR.
 *
 * Every lane icon is drawn inside a 24 by 24 box with a stroke of 1.5,
 * which is the one decision that makes the set crisp at both the sizes
 * that matter. At 24px and at 48px, which is the same mark on a 2x
 * display, a drawing unit is exactly one device pixel or exactly two, so
 * a coordinate on a half unit lands on a pixel boundary and a 1.5 stroke
 * covers whole pixels rather than smearing across three. The legend
 * renders at 20px and the map body at 16px, where the same stroke lands
 * at 1.25 and 1.0 device pixels: thin, and still ink.
 *
 * The paths therefore sit on quarter and half units and nothing in this
 * file is drawn with a decimal that came out of a design tool.
 */
export const LANE_ICON_VIEWBOX = 24;
export const LANE_ICON_STROKE = 1.5;

/**
 * The nine drawings, as bare path data.
 *
 * NO PAINT LIVES HERE ON PURPOSE. Geometry is one concern and colour is
 * another, and keeping them apart is what lets the same schoolhouse be
 * drawn in the lane's own hue in a legend, in a paper outline behind
 * itself on the map, and in plain ink on a printed contact sheet, without
 * three copies of the path.
 *
 * A note on what each one is, because the choices are not arbitrary. Each
 * icon draws the PLACE or the OBJECT that the lane trades in, so that a
 * reader who has never opened the key can still tell a school run from a
 * showroom run. Where two lanes risked the same silhouette, one of them
 * moved: colleges are a mortarboard rather than a portico, because a
 * portico and a schoolhouse are one gable apart at sixteen pixels.
 *
 * `local-retail-food` is deliberately built from an awning, a window and
 * an off-centre door, and `schools` from a roof, a flag and a centred
 * door, for the same reason. Two buildings with a centred door and a
 * different hat are the same mark in greyscale.
 */
const LANE_ICON_PATHS: Record<Lane, readonly string[]> = {
  /* A schoolhouse. Gable roof, centred door, flag on the ridge. */
  schools: [
    "M2.75 10.25 L12 4.5 L21.25 10.25",
    "M4.75 10.25 V20.5 H19.25 V10.25",
    "M10 20.5 V15.25 H14 V20.5",
    "M12 4.5 V1.75",
    "M12 2.25 L15 3 L12 3.75",
  ],
  /* A mortarboard. The one object every campus lane has in common. */
  colleges: [
    "M2.5 9.25 L12 5 L21.5 9.25 L12 13.5 Z",
    "M6.75 11.25 V15.5 C6.75 17.5 9.25 18.75 12 18.75 C14.75 18.75 17.25 17.5 17.25 15.5 V11.25",
    "M21.5 9.25 V15.75",
  ],
  /* A dumbbell. Horizontal, so it cannot be mistaken for a building. */
  "fitness-youth-sports": [
    "M8 12 H16",
    "M6 8.5 V15.5",
    "M18 8.5 V15.5",
    "M3.5 10 V14",
    "M20.5 10 V14",
  ],
  /* An office tower with a lower annexe, standing on a ground line. */
  corporate: [
    "M5.5 20.75 V4.75 H14.5 V20.75",
    "M14.5 20.75 V10.25 H19.5 V20.75",
    "M2.75 20.75 H21.25",
    "M8.25 8.5 H11.75",
    "M8.25 12.25 H11.75",
    "M8.25 16 H11.75",
  ],
  /* A car in profile. Bonnet, cabin, two wheels. */
  "auto-finance": [
    "M3.25 16.25 V12.5 L6.5 8.5 H14.25 L18.5 12.5 H20.75 V16.25",
    "M10 8.5 V12.5",
    "M3.25 12.5 H18.5",
    "M6.5 16.25 A2.15 2.15 0 1 0 10.8 16.25 A2.15 2.15 0 1 0 6.5 16.25",
    "M14 16.25 A2.15 2.15 0 1 0 18.3 16.25 A2.15 2.15 0 1 0 14 16.25",
  ],
  /* A hotel bed. Headboard, frame, pillow, turned covers. */
  "hospitality-civic": [
    "M2.75 19.25 V7.5",
    "M2.75 13.5 H21.25 V19.25",
    "M6 13.5 V10.75 H10 V13.5",
    "M10.75 11.5 H20.5",
  ],
  /* An arched window. A chapel and a civic hall share this one form. */
  "faith-nonprofit": [
    "M5.5 20.75 V11.25 A6.5 6.5 0 0 1 18.5 11.25 V20.75 Z",
    "M12 4.75 V20.75",
    "M6.5 13.75 H17.5",
  ],
  /* A clinic. A cross inside a rounded plate, legible at any size. */
  healthcare: [
    "M3 7.5 A3 3 0 0 1 6 4.5 H18 A3 3 0 0 1 21 7.5 V16.5 A3 3 0 0 1 18 19.5 H6 A3 3 0 0 1 3 16.5 Z",
    "M12 8.25 V15.75",
    "M8.25 12 H15.75",
  ],
  /* A shopfront. Striped awning, display window, door to one side. */
  "local-retail-food": [
    "M2.75 10 L4.75 5.75 H19.25 L21.25 10 Z",
    "M8.75 5.75 V10",
    "M15.25 5.75 V10",
    "M4.75 10 V20.5 H19.25 V10",
    "M6.5 12.75 H12 V16.5 H6.5 Z",
    "M14.75 20.5 V13.75 H17.75 V20.5",
  ],
};

/**
 * What each icon draws, in words, for a legend line and a `<title>`.
 *
 * It sits here rather than in `LANE_META` because it describes THIS
 * drawing rather than the lane itself, and the lane registry should not
 * have to be edited when an icon is redrawn.
 */
const LANE_ICON_NOUN: Record<Lane, string> = {
  schools: "A schoolhouse with a flag",
  colleges: "A mortarboard",
  "fitness-youth-sports": "A dumbbell",
  corporate: "An office tower",
  "auto-finance": "A car",
  "hospitality-civic": "A hotel bed",
  "faith-nonprofit": "An arched window",
  healthcare: "A clinic cross",
  "local-retail-food": "A shopfront with an awning",
};

/** Ink for a lane icon: the lane's own token unless a caller overrides it. */
export function laneIconShapes(lane: Lane, ink?: string): MarkShape[] {
  const stroke = ink ?? LANE_META[lane].cssVar;
  return LANE_ICON_PATHS[lane].map((d) => ({
    k: "path" as const,
    d,
    fill: "none",
    stroke,
    sw: LANE_ICON_STROKE,
    cap: "round" as const,
    join: "round" as const,
  }));
}

/**
 * The lane icon on its own, with no body around it.
 *
 * This is what the legend and the filter chips draw. `size` is in CSS
 * pixels; 16 and 20 are the working sizes and 40 is the size the set was
 * checked at.
 */
export function laneIconScene(
  lane: Lane,
  opts: { size?: number; ink?: string } = {},
): MarkScene {
  const meta = LANE_META[lane];
  return {
    size: opts.size ?? 20,
    viewBox: LANE_ICON_VIEWBOX,
    title: `${LANE_ICON_NOUN[lane]}, ${meta.label}`,
    ariaLabel: meta.label,
    shapes: laneIconShapes(lane, opts.ink),
  };
}

// ---------------------------------------------------------------
// The prospect mark
// ---------------------------------------------------------------

/**
 * Both bodies are drawn inside this box, so the pointed and the square
 * mark sit level and weigh the same on the page.
 */
export const PROSPECT_MARK_SIZE = 36;

/** Kept for callers that imported the old name. Same number, same box. */
export const PROSPECT_SIZE = PROSPECT_MARK_SIZE;

export interface ProspectMarkerVisual {
  lane: Lane;
  /** The organisation, in words. Becomes the accessible name. */
  label: string;
  /**
   * Where this organisation stands on a package.
   *
   * Optional, and its absence is not the same as `unworked`: a caller
   * that does not track status at all should pass nothing and get a clean
   * mark, while a board that does track it passes the real value and gets
   * the pip. Both are honest; a default of `unworked` would have the map
   * asserting something the caller never said.
   */
  status?: PitchStatus;
  /**
   * Position in the go-see run, 1 based. Replaces the lane icon.
   *
   * A numeral is the one mark that beats a drawing here: the panel beside
   * the map lists the same stops in the same order, and a reader matching
   * row four to a pin does it instantly with a 4 and slowly with a car.
   */
  routeStep?: number;
  /** Route mode is on and this organisation is not on the route. */
  muted?: boolean;
  selected?: boolean;
}

/**
 * The two bodies.
 *
 * The pointed body is a square with a roof on it rather than a triangle.
 * A triangle large enough to hold a legible drawing is nearly twice the
 * visual weight of a square of the same width, which would make the
 * schools lane look more important than the corporate lane for reasons of
 * geometry alone. The apex still points, which is the part the reader
 * learns from the chips.
 */
const BODY_LEFT = 6;
const BODY_RIGHT = 30;
const BODY_TOP = 6;
const BODY_BOTTOM = 30;
/** Where the roof meets the walls on a pointed body. */
const BODY_SHOULDER = 13;
const BODY_APEX = 4.5;

function bodyPath(occasionClass: OccasionClass): string {
  return occasionClass === "calendar-locked"
    ? `M18 ${BODY_APEX} L${BODY_RIGHT} ${BODY_SHOULDER} V${BODY_BOTTOM} H${BODY_LEFT} V${BODY_SHOULDER} Z`
    : `M${BODY_LEFT + 3} ${BODY_TOP} H${BODY_RIGHT - 3} A3 3 0 0 1 ${BODY_RIGHT} ${BODY_TOP + 3}` +
        ` V${BODY_BOTTOM - 3} A3 3 0 0 1 ${BODY_RIGHT - 3} ${BODY_BOTTOM}` +
        ` H${BODY_LEFT + 3} A3 3 0 0 1 ${BODY_LEFT} ${BODY_BOTTOM - 3}` +
        ` V${BODY_TOP + 3} A3 3 0 0 1 ${BODY_LEFT + 3} ${BODY_TOP} Z`;
}

/**
 * The icon sits in the rectangular part of whichever body it is in.
 *
 * A pointed body's usable interior starts at the shoulder, so its icon
 * rides lower than a square body's. The icon is the SAME SIZE in both,
 * because a schoolhouse that shrinks when it becomes calendar-locked
 * would be encoding the occasion class twice and the lane not at all.
 */
const ICON_IN_BODY = 16;

function iconTransform(occasionClass: OccasionClass): string {
  const scale = ICON_IN_BODY / LANE_ICON_VIEWBOX;
  const cy = occasionClass === "calendar-locked" ? 21.5 : 18;
  const x = 18 - ICON_IN_BODY / 2;
  const y = cy - ICON_IN_BODY / 2;
  return `translate(${x} ${y}) scale(${scale})`;
}

/**
 * THE STATUS PIP, AND WHY IT IS A FILLING CIRCLE.
 *
 * `vocabulary.ts` already draws pitch status as a circle filling up, from
 * an empty ring through a quarter, a half and three quarters to a solid
 * disc, with a cross for lost because lost is the sequence stopping
 * rather than a further stage of it. Every chip, table cell and legend in
 * this application uses that sequence. Inventing a second vocabulary for
 * the map, a dashed outline here and a heavier ring there, would give a
 * reader two systems to learn for one fact.
 *
 * So the map draws the same sequence, as geometry rather than as a
 * character, in a pip on the body's lower right. Drawn as geometry
 * because a text glyph at five pixels depends on the font that happens to
 * be installed, and `◕` falls back to a box on a machine without a font
 * that carries it. The arithmetic below is a wedge from twelve o'clock,
 * clockwise, covering the same fraction the character does.
 *
 * `unworked` deliberately draws NOTHING. Before a venue opens most of a
 * trade area has never been contacted, so a hundred pips all saying "no
 * contact" would be a hundred marks of noise over the one signal that
 * matters, which is the handful that have moved.
 */
const PIP_CX = 28.5;
const PIP_CY = 28.5;
const PIP_R = 5.5;

/** The fraction of the disc each status fills. Lost is not on this scale. */
const PIP_FILL: Record<PitchStatus, number> = {
  unworked: 0,
  "reached-out": 0.25,
  conversation: 0.5,
  "soft-hold": 0.75,
  booked: 1,
  lost: 0,
};

function wedgePath(cx: number, cy: number, r: number, fraction: number): string {
  if (fraction >= 1) {
    return `M${cx} ${cy - r} A${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;
  }
  const angle = fraction * Math.PI * 2 - Math.PI / 2;
  const x = cx + r * Math.cos(angle);
  const y = cy + r * Math.sin(angle);
  const large = fraction > 0.5 ? 1 : 0;
  return `M${cx} ${cy} L${cx} ${cy - r} A${r} ${r} 0 ${large} 1 ${round(x)} ${round(y)} Z`;
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function statusPipShapes(status: PitchStatus): MarkShape[] {
  if (status === "unworked") return [];
  const token = PITCH_STATUS[status];
  const shapes: MarkShape[] = [
    /* Paper under the pip, so it reads as a separate mark rather than as
       a hole cut in the body. */
    {
      k: "circle",
      cx: PIP_CX,
      cy: PIP_CY,
      r: PIP_R + 1.4,
      fill: "var(--surface-1)",
    },
    {
      k: "circle",
      cx: PIP_CX,
      cy: PIP_CY,
      r: PIP_R,
      fill: "var(--surface-1)",
      stroke: token.cssVar,
      sw: 1.4,
    },
  ];

  if (status === "lost") {
    /* The one status that is not a quantity gets the one mark that is not
       a wedge, exactly as the vocabulary does. */
    const a = 2.6;
    shapes.push(
      {
        k: "path",
        d: `M${PIP_CX - a} ${PIP_CY - a} L${PIP_CX + a} ${PIP_CY + a}`,
        stroke: token.cssVar,
        sw: 1.6,
        cap: "round",
      },
      {
        k: "path",
        d: `M${PIP_CX + a} ${PIP_CY - a} L${PIP_CX - a} ${PIP_CY + a}`,
        stroke: token.cssVar,
        sw: 1.6,
        cap: "round",
      },
    );
    return shapes;
  }

  const fill = PIP_FILL[status];
  if (fill > 0) {
    shapes.push({
      k: "path",
      d: wedgePath(PIP_CX, PIP_CY, PIP_R - 0.9, fill),
      fill: token.cssVar,
    });
  }
  return shapes;
}

/**
 * The prospect mark, as a scene.
 *
 * Read from the back forwards, which is the order it draws: the selection
 * halo, a paper outline of the body, the body itself, the lane icon or
 * the route numeral, then the status pip on top of the corner.
 */
export function prospectMarkScene(v: ProspectMarkerVisual): MarkScene {
  const meta = LANE_META[v.lane];
  const locked = meta.occasionClass === "calendar-locked";
  const sw = v.selected ? 2.6 : 1.6;
  const d = bodyPath(meta.occasionClass);
  const shapes: MarkShape[] = [];

  /* A halo rather than a colour change, because the stroke is already
     carrying the lane and cannot be asked to carry selection as well. It
     composes: a selected, booked, calendar-locked school is a haloed
     pointed body with a schoolhouse in it and a full disc on its corner,
     and every one of those four facts is still legible. */
  if (v.selected) {
    shapes.push(
      { k: "circle", cx: 18, cy: 18, r: 17, fill: meta.cssVar, opacity: 0.14 },
      {
        k: "circle",
        cx: 18,
        cy: 18,
        r: 17,
        fill: "none",
        stroke: meta.cssVar,
        sw: 1,
        opacity: 0.5,
      },
    );
  }

  /*
    THE PAPER OUTLINE IS NOT DECORATION. Two hundred and eleven
    organisations sit inside six and a half miles of the corporate
    office and a good number of them share a shopping centre, so at any
    useful zoom the marks
    overlap. Drawn without it they merge into one continuous shape and the
    reader loses the count, which is the one thing a map of a trade area is
    for. A ring of the page's own paper under each body separates them
    without adding a colour to the key.
  */
  shapes.push(
    { k: "path", d, fill: "none", stroke: "var(--surface-1)", sw: sw + 2.4, join: "round" },
    { k: "path", d, fill: meta.tintVar, stroke: meta.cssVar, sw, join: "round" },
  );

  if (v.routeStep === undefined) {
    shapes.push({
      k: "group",
      transform: iconTransform(meta.occasionClass),
      children: laneIconShapes(v.lane),
    });
  } else {
    shapes.push({
      k: "text",
      x: 18,
      y: locked ? 22 : 18.5,
      value: String(v.routeStep),
      fontSize: 13,
      weight: 700,
      font: "var(--font-mono)",
      fill: meta.cssVar,
    });
  }

  shapes.push(...statusPipShapes(v.status ?? "unworked"));

  const statusWords = v.status ? `, ${PITCH_STATUS[v.status].label.toLowerCase()}` : "";
  const classWords = locked ? "calendar locked" : "discretionary";

  return {
    size: PROSPECT_MARK_SIZE,
    viewBox: PROSPECT_MARK_SIZE,
    title: `${v.label}. ${meta.label}, ${classWords}${statusWords}`,
    ariaLabel: `${v.label}, ${meta.label}, ${classWords}${statusWords}${
      v.selected ? ", selected" : ""
    }`,
    shapes,
    opacity: v.muted ? 0.3 : undefined,
  };
}

export function prospectMarkerHtml(v: ProspectMarkerVisual): string {
  return sceneToSvg(prospectMarkScene(v));
}

export function prospectIcon(v: ProspectMarkerVisual): L.DivIcon {
  return L.divIcon({
    html: prospectMarkerHtml(v),
    className: "ob-marker",
    iconSize: [PROSPECT_MARK_SIZE, PROSPECT_MARK_SIZE],
    iconAnchor: [PROSPECT_MARK_SIZE / 2, PROSPECT_MARK_SIZE / 2],
    /* The popup clears the mark rather than sitting on top of it. */
    popupAnchor: [0, -(PROSPECT_MARK_SIZE / 2 - 2)],
  });
}

// ---------------------------------------------------------------
// The venue
// ---------------------------------------------------------------

/**
 * THE RING IS BROKEN AND THAT IS THE WHOLE POINT OF THIS MARK.
 *
 * The anchor of this map is a corporate office, not a store. A solid pin
 * says "here is somewhere a group can go", which is the one thing this
 * address is not, and a reader who takes it for a venue misreads the
 * whole screen: the trade area is measured from a desk, and the nearest
 * building a party can actually be held in is a separate pin one town
 * over.
 *
 * So the ring is dashed, the words "Corporate office" sit under it, and
 * neither of those depends on the amber. Nothing else on this map is
 * dashed: the status pips are solid wedges, the prospect bodies are solid
 * outlines, and the only other broken circles on the screen are the mile
 * rings, which are three times the size and carry their own labels. A
 * dashed ring at marker scale means one thing here and one thing only.
 *
 * Deliberately NOT a bowling pin. `PinMark` owns that silhouette and its
 * path is load-bearing there; a second copy of it in this file is a
 * second copy to keep in step, and the office does not need it. What
 * this mark has to say is "not a venue", which is geometry a broken
 * circle can do.
 */
export function venueMarkScene(name: string, label = "Corporate office"): MarkScene {
  const w = 104;
  const cx = w / 2;
  const cy = 21;
  const plateW = Math.min(w - 4, 22 + label.length * 6.4);

  return {
    size: w,
    height: 60,
    viewBox: w,
    viewBoxHeight: 60,
    title: `${name}, ${label.toLowerCase()}`,
    ariaLabel: `${name}, ${label.toLowerCase()}`,
    shapes: [
      {
        k: "circle",
        cx,
        cy,
        r: 16,
        fill: "none",
        stroke: "var(--brand-gold)",
        sw: 2.2,
        dash: "5.5 4.5",
        cap: "round",
      },
      { k: "circle", cx, cy, r: 10.5, fill: "var(--surface-1)" },
      { k: "circle", cx, cy, r: 6.5, fill: "var(--brand-gold)" },
      {
        k: "rect",
        x: cx - plateW / 2,
        y: 38,
        w: plateW,
        h: 17,
        rx: 8.5,
        fill: "var(--surface-1)",
        stroke: "var(--brand-gold-line)",
        sw: 1,
      },
      {
        k: "text",
        x: cx,
        y: 46.8,
        value: label,
        fontSize: 10.5,
        weight: 700,
        font: "var(--font-ui)",
        fill: "var(--brand-gold-600)",
        letterSpacing: "0.02em",
      },
    ],
  };
}

export function venueMarkerHtml(name: string, label = "Corporate office"): string {
  return sceneToSvg(venueMarkScene(name, label));
}

export function venueIcon(name: string): L.DivIcon {
  const w = 104;
  const cy = 21;
  return L.divIcon({
    html: venueMarkerHtml(name),
    className: "ob-marker ob-marker--venue",
    iconSize: [w, 60],
    /* Anchored on the ring centre, not on the box centre, so the
       coordinate under the mark is the street address rather than the
       middle of a label. */
    iconAnchor: [w / 2, cy],
    popupAnchor: [0, -cy],
  });
}

// ---------------------------------------------------------------
// The cluster bubble
// ---------------------------------------------------------------

/**
 * THREE SIZES, NOT A SCALE, AND NOT A LANE COLOUR.
 *
 * A bubble is a circle, which is a shape no prospect mark ever uses, so a
 * group of organisations is never mistaken for one organisation. Its
 * radius moves in three fixed steps because nobody can compare two radii
 * accurately and everybody can tell three sizes apart; the numeral is the
 * signal and the size is reinforcement.
 *
 * It is NEUTRAL. Painting a bubble with its majority lane would be a
 * claim the group does not support: seven marks reading "schools" when
 * three of them are tyre shops is worse than seven marks reading nothing.
 * The lane mix travels in words, in the title and the aria label, which
 * is a channel that survives greyscale because it was never a colour.
 */
export const CLUSTER_STEPS: ReadonlyArray<{ min: number; r: number; fontSize: number }> = [
  { min: 10, r: 24, fontSize: 15 },
  { min: 5, r: 20, fontSize: 13.5 },
  { min: 2, r: 16, fontSize: 12 },
];

export function clusterStepFor(count: number): { min: number; r: number; fontSize: number } {
  return CLUSTER_STEPS.find((s) => count >= s.min) ?? CLUSTER_STEPS[CLUSTER_STEPS.length - 1];
}

export function clusterMarkScene(
  count: number,
  opts: { detail?: string } = {},
): MarkScene {
  const step = clusterStepFor(count);
  const box = (step.r + 3) * 2;
  const c = box / 2;
  const words = `${count} organisations, zoom in to separate them`;

  return {
    size: box,
    viewBox: box,
    title: opts.detail ? `${words}. ${opts.detail}` : words,
    ariaLabel: words,
    shapes: [
      { k: "circle", cx: c, cy: c, r: step.r, fill: "var(--surface-1)", stroke: "var(--surface-1)", sw: 3 },
      { k: "circle", cx: c, cy: c, r: step.r, fill: "var(--surface-1)", stroke: "var(--text-1)", sw: 1.6 },
      /* A second hairline inside the first, so a bubble still reads as a
         group and not as an empty circle when the numeral is small. */
      { k: "circle", cx: c, cy: c, r: step.r - 3.5, fill: "none", stroke: "var(--line-2)", sw: 1 },
      {
        k: "text",
        x: c,
        y: c,
        value: String(count),
        fontSize: step.fontSize,
        weight: 700,
        font: "var(--font-mono)",
        fill: "var(--text-0)",
      },
    ],
  };
}

export function clusterMarkerHtml(count: number, detail?: string): string {
  return sceneToSvg(clusterMarkScene(count, { detail }));
}

export function clusterIcon(count: number, detail?: string): L.DivIcon {
  const box = (clusterStepFor(count).r + 3) * 2;
  return L.divIcon({
    html: clusterMarkerHtml(count, detail),
    className: "ob-marker ob-marker--cluster",
    iconSize: [box, box],
    iconAnchor: [box / 2, box / 2],
    popupAnchor: [0, -(box / 2 - 2)],
  });
}

// ---------------------------------------------------------------
// The ring labels
// ---------------------------------------------------------------

/**
 * A ring's label, sitting on the ring itself.
 *
 * The words "straight line" are in the label rather than only in the key,
 * because a reader who glances at a circle on a map and reads it as a
 * drive time has been misled by the drawing, and a legend three hundred
 * pixels away does not undo that.
 */
export function ringLabelScene(text: string): MarkScene {
  const w = Math.round(20 + text.length * 6.1);
  const h = 18;
  return {
    size: w,
    height: h,
    viewBox: w,
    viewBoxHeight: h,
    title: text,
    ariaLabel: text,
    shapes: [
      {
        k: "rect",
        x: 0.5,
        y: 0.5,
        w: w - 1,
        h: h - 1,
        rx: (h - 1) / 2,
        fill: "var(--surface-1)",
        stroke: "var(--line-2)",
        sw: 1,
        opacity: 0.94,
      },
      {
        k: "text",
        x: w / 2,
        y: h / 2 + 0.4,
        value: text,
        fontSize: 9.5,
        weight: 500,
        font: "var(--font-mono)",
        fill: "var(--text-2)",
      },
    ],
  };
}

export function ringLabelIcon(text: string): L.DivIcon {
  const scene = ringLabelScene(text);
  return L.divIcon({
    html: sceneToSvg(scene),
    className: "ob-marker ob-marker--ring",
    iconSize: [scene.size, scene.height ?? scene.size],
    iconAnchor: [scene.size / 2, (scene.height ?? scene.size) / 2],
  });
}

// ---------------------------------------------------------------
// The manifest
// ---------------------------------------------------------------

export interface LaneGlyphManifestEntry {
  lane: Lane;
  /** The full name, for a heading or a tooltip. */
  label: string;
  /** The name for a dense row. */
  short: string;
  occasionClass: OccasionClass;
  /** "Calendar-locked buyers" or "Discretionary buyers", from the registry. */
  occasionLabel: string;
  /** POINTED or SQUARE, in one word, for a key that spells the rule out. */
  bodyShape: "pointed" | "square";
  cssVar: string;
  tintVar: string;
  /** What the icon actually draws, for a legend line. */
  drawing: string;
  /** The icon on its own, ready for `dangerouslySetInnerHTML`. */
  iconSvg: string;
  /** The whole mark as it appears on the map, body and all. */
  markSvg: string;
  /** How many organisations in the book trade in this lane. */
  count: number;
}

/**
 * WHAT THE LEGEND ITERATES.
 *
 * Built from `LANE_ORDER` and `LANE_META`, never from a list written
 * here, so a tenth lane appears in the key the day it is added to the
 * registry and nothing in this file or in the legend has to be edited.
 * That is not a hypothetical: the ninth lane, local retail and food,
 * landed in this codebase after the map was built, and every screen that
 * had written its own array of eight had to be found and corrected.
 *
 * The counts come from `PROSPECTS`, which is the book, and they are
 * therefore a constant rather than a report on whatever is currently
 * filtered. A key whose numbers move as somebody types in a search box is
 * a key a reader stops trusting halfway through the session. A caller
 * that genuinely wants live counts passes them to `laneGlyphManifest`.
 */
export function laneGlyphManifest(
  counts?: Partial<Record<Lane, number>>,
): LaneGlyphManifestEntry[] {
  return LANE_ORDER.map((lane) => {
    const meta = LANE_META[lane];
    return {
      lane,
      label: meta.label,
      short: meta.short,
      occasionClass: meta.occasionClass,
      occasionLabel: OCCASION_CLASS_META[meta.occasionClass].label,
      bodyShape:
        meta.occasionClass === "calendar-locked"
          ? ("pointed" as const)
          : ("square" as const),
      cssVar: meta.cssVar,
      tintVar: meta.tintVar,
      drawing: LANE_ICON_NOUN[lane],
      iconSvg: sceneToSvg(laneIconScene(lane, { size: 20 })),
      markSvg: prospectMarkerHtml({ lane, label: meta.label }),
      count: counts?.[lane] ?? bookCount(lane),
    };
  });
}

function bookCount(lane: Lane): number {
  return PROSPECTS.filter((p) => p.lane === lane).length;
}

/** The manifest against the book, which is what a legend usually wants. */
export const LANE_GLYPH_MANIFEST: LaneGlyphManifestEntry[] = laneGlyphManifest();

export interface StateTreatmentEntry {
  status: PitchStatus;
  /** The vocabulary's own glyph and word. Nothing is invented here. */
  glyph: string;
  label: string;
  note?: string;
  cssVar: string;
  /** How the map draws it, in words, for the key. */
  treatment: string;
  /** A worked example, on the first lane in the order. */
  markSvg: string;
}

/**
 * The six states as the map draws them, for the key.
 *
 * It iterates `PITCH_STATUS_ORDER` and takes every word and glyph from
 * `PITCH_STATUS`, so the map's key cannot describe a state differently
 * from the desk, the lane board or the week sheet.
 */
export const STATE_TREATMENTS: StateTreatmentEntry[] = PITCH_STATUS_ORDER.map((status) => {
  const token = PITCH_STATUS[status];
  const treatment =
    status === "unworked"
      ? "No pip. The clean mark is the default, because most of a trade area has never been contacted."
      : status === "lost"
        ? "A crossed pip, the one mark in the set that is not a filling circle."
        : status === "booked"
          ? "A solid pip on the corner. The disc is full."
          : `A pip on the corner, filled ${
              status === "reached-out" ? "a quarter" : status === "conversation" ? "a half" : "three quarters"
            } of the way round.`;
  return {
    status,
    glyph: token.glyph,
    label: token.label,
    note: token.note,
    cssVar: token.cssVar,
    treatment,
    markSvg: prospectMarkerHtml({
      lane: LANE_ORDER[0],
      label: `${LANE_META[LANE_ORDER[0]].label}, ${token.label}`,
      status,
    }),
  };
});

/** The selected treatment, as a worked example plus the sentence for it. */
export const SELECTED_TREATMENT = {
  note: "A halo and a heavier outline. It composes with everything else rather than replacing it, so a selected mark still carries its shape, its drawing and its state.",
  markSvg: prospectMarkerHtml({
    lane: LANE_ORDER[0],
    label: LANE_META[LANE_ORDER[0]].label,
    selected: true,
  }),
};

// ---------------------------------------------------------------
// The string renderer
// ---------------------------------------------------------------

/**
 * A scene, as an SVG string for `L.divIcon` or for a legend swatch.
 *
 * The React renderer in `components/map/LaneGlyph.tsx` consumes the same
 * scenes and holds no coordinates of its own, which is the guarantee that
 * a swatch in the key and a marker on the map are the same drawing.
 */
export function sceneToSvg(scene: MarkScene): string {
  const h = scene.height ?? scene.size;
  const vbH = scene.viewBoxHeight ?? scene.viewBox;
  return `
<svg width="${scene.size}" height="${h}" viewBox="0 0 ${scene.viewBox} ${vbH}"
     xmlns="http://www.w3.org/2000/svg" role="img"
     aria-label="${escapeAttr(scene.ariaLabel)}"${
       scene.opacity === undefined ? "" : ` opacity="${scene.opacity}"`
     }>
  <title>${escapeText(scene.title)}</title>
  ${scene.shapes.map((s) => shapeToSvg(s)).join("\n  ")}
</svg>`.trim();
}

function paintAttrs(p: MarkPaint): string {
  const style = [
    `fill: ${p.fill ?? "none"}`,
    `stroke: ${p.stroke ?? "none"}`,
  ].join("; ");
  const out = [`style="${style}"`];
  if (p.sw !== undefined) out.push(`stroke-width="${p.sw}"`);
  if (p.dash) out.push(`stroke-dasharray="${p.dash}"`);
  if (p.cap) out.push(`stroke-linecap="${p.cap}"`);
  if (p.join) out.push(`stroke-linejoin="${p.join}"`);
  if (p.opacity !== undefined) out.push(`opacity="${p.opacity}"`);
  return out.join(" ");
}

function shapeToSvg(s: MarkShape): string {
  switch (s.k) {
    case "path":
      return `<path d="${s.d}" ${paintAttrs(s)}/>`;
    case "circle":
      return `<circle cx="${s.cx}" cy="${s.cy}" r="${s.r}" ${paintAttrs(s)}/>`;
    case "rect":
      return `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}"${
        s.rx === undefined ? "" : ` rx="${s.rx}"`
      } ${paintAttrs(s)}/>`;
    case "text":
      /* Text carries its own attribute list rather than going through
         `paintAttrs`, because it needs a font family in the same style
         declaration and two `style` attributes on one element is one
         attribute the browser throws away. */
      return `<text x="${s.x}" y="${s.y}" text-anchor="middle" dominant-baseline="central"
        style="fill: ${s.fill ?? "var(--text-0)"}; font-family: ${s.font ?? "var(--font-ui)"}"
        font-size="${s.fontSize}"${s.weight === undefined ? "" : ` font-weight="${s.weight}"`}${
          s.letterSpacing ? ` letter-spacing="${s.letterSpacing}"` : ""
        }${s.opacity === undefined ? "" : ` opacity="${s.opacity}"`}>${escapeText(s.value)}</text>`;
    case "group":
      return `<g${s.transform ? ` transform="${s.transform}"` : ""}${
        s.opacity === undefined ? "" : ` opacity="${s.opacity}"`
      }>${s.children.map((c) => shapeToSvg(c)).join("")}</g>`;
  }
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeText(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
