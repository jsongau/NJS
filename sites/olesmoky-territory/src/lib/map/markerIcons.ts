import L from "leaflet";

/**
 * Marker icons.
 *
 * The spec asked for six marker states, which is exactly the situation
 * where a naive build reaches for six colors. This app is used by someone
 * who is colorblind, and more generally a map that encodes meaning in hue
 * alone is unreadable on a projector, in sunlight, and to about one man in
 * twelve. So state is carried on three independent channels:
 *
 *   SHAPE   circle for a retail account, HEXAGON for a bar or restaurant,
 *           square for the distributor facility, and a notched ring on
 *           any of them when the account has open voids
 *   GLYPH   a check when it is in the plan, a numeral when it has open
 *           issues, a facility mark for the distributor
 *   SIZE    scales with modeled weekly opportunity
 *
 * Color is used only for figure-ground contrast against the basemap and
 * for the single accent on selection. Remove all color and every state is
 * still distinguishable, which is the test.
 */

export interface MarkerVisual {
  /**
   * Retail or on-premise, carried as SHAPE.
   *
   * This is the one distinction on the map that a reader has to be able
   * to make without clicking anything, because the two halves of the
   * territory answer different questions and a pin that does not say
   * which it is invites the wrong one. Colour was available and was not
   * used: the app is read by somebody who is colourblind, and a hue-only
   * split would have been invisible to him and to about one man in
   * twelve besides.
   *
   * A hexagon rather than a square, because the square is already spoken
   * for by the wholesaler's facility and two squares meaning two things
   * is worse than no distinction at all.
   */
  onPremise: boolean;
  /** 0..100, drives radius. */
  opportunity: number;
  hasVoids: boolean;
  inPlan: boolean;
  openIssues: number;
  selected: boolean;
  hovered: boolean;
  label: string;
}

const INK = "#14181f";
const PAPER = "#ffffff";
const ACCENT = "#1f5fd0";

/** Flat-topped regular hexagon inscribed in radius r. */
function hexPath(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

function radiusFor(opportunity: number): number {
  // 9px at zero opportunity, 17px at the top. Small enough that twenty
  // markers in one shopping centre stay separable.
  return 9 + Math.round((Math.max(0, Math.min(100, opportunity)) / 100) * 8);
}

export function accountIcon(v: MarkerVisual): L.DivIcon {
  const r = radiusFor(v.opportunity);
  const stroke = v.selected ? ACCENT : INK;
  const strokeWidth = v.selected ? 3 : v.hovered ? 2.4 : 1.8;
  const size = (r + strokeWidth) * 2 + (v.selected ? 14 : 6);
  const c = size / 2;

  /*
    The body. A hexagon is drawn flat-topped and inscribed in the same
    radius as the circle, so a bar and a shop of equal opportunity read
    as equal weight — the shape says WHAT it is and the size still says
    HOW MUCH, and neither steals the other's channel.
  */
  const body = v.onPremise
    ? `<path d="${hexPath(c, c, r)}" fill="${PAPER}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>`
    : `<circle cx="${c}" cy="${c}" r="${r}" fill="${PAPER}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;

  // A notched ring reads as "something is missing here" without a legend.
  const voidNotch = v.hasVoids
    ? `<path d="M ${c} ${c - r - 1}
              A ${r + 1} ${r + 1} 0 0 1 ${c + (r + 1) * 0.707} ${c - (r + 1) * 0.707}"
         fill="none" stroke="${PAPER}" stroke-width="${strokeWidth + 2.5}" stroke-linecap="round"/>`
    : "";

  const halo = v.selected
    ? `<circle cx="${c}" cy="${c}" r="${r + 6}" fill="${ACCENT}" opacity="0.14"/>`
    : "";

  let mark = "";
  if (v.inPlan) {
    mark = `<path d="M ${c - r * 0.42} ${c} l ${r * 0.32} ${r * 0.34} l ${r * 0.6} -${r * 0.66}"
              fill="none" stroke="${INK}" stroke-width="${Math.max(2, r * 0.22)}"
              stroke-linecap="round" stroke-linejoin="round"/>`;
  } else if (v.openIssues > 0) {
    mark = `<text x="${c}" y="${c + r * 0.36}" text-anchor="middle"
              font-family="IBM Plex Mono, monospace" font-weight="600"
              font-size="${Math.max(10, r * 0.95)}" fill="${INK}">${v.openIssues}</text>`;
  }

  const html = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeAttr(v.label)}">
  ${halo}
  ${body}
  ${voidNotch}
  ${mark}
</svg>`.trim();

  return L.divIcon({
    html,
    className: "fs-marker",
    iconSize: [size, size],
    iconAnchor: [c, c],
  });
}

export function distributorIcon(label: string): L.DivIcon {
  const size = 40;
  const s = 24;
  const o = (size - s) / 2;
  const html = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeAttr(label)}">
  <rect x="${o}" y="${o}" width="${s}" height="${s}" rx="3"
        fill="${PAPER}" stroke="${INK}" stroke-width="2.6"/>
  <path d="M ${o + 5} ${o + 15} l 0 -5 l 7 -4 l 7 4 l 0 5 z"
        fill="${INK}" opacity="0.85"/>
  <rect x="${o + 9}" y="${o + 14}" width="${s - 18}" height="5" fill="${PAPER}"/>
</svg>`.trim();

  return L.divIcon({
    html,
    className: "fs-marker fs-marker--distributor",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** The legend states, in words. Kept next to the icons so they cannot drift. */
export const MARKER_LEGEND: Array<{ label: string; description: string; visual: MarkerVisual }> = [
  {
    label: "Retail location",
    description: "Circle. Size scales with modeled weekly opportunity",
    visual: { onPremise: false, opportunity: 40, hasVoids: false, inPlan: false, openIssues: 0, selected: false, hovered: false, label: "Retail location" },
  },
  {
    /*
      THE SECOND ROW IN THE LEGEND, not the last, because it is the
      distinction a reader needs before any of the others mean anything.
      A notched hexagon and a notched circle both say "voids"; what they
      do not say on their own is that one of them is a bar, where a void
      is a menu line rather than a facing.
    */
    label: "Bar or restaurant",
    description: "Hexagon. On-premise: the unit is a pour, not a case",
    visual: { onPremise: true, opportunity: 40, hasVoids: false, inPlan: false, openIssues: 0, selected: false, hovered: false, label: "Bar or restaurant" },
  },
  {
    label: "Open voids",
    description: "Notched ring: authorized SKUs not on the shelf",
    visual: { onPremise: false, opportunity: 60, hasVoids: true, inPlan: false, openIssues: 0, selected: false, hovered: false, label: "Open voids" },
  },
  {
    label: "In the plan",
    description: "Check: this account has lines in the commitment plan",
    visual: { onPremise: false, opportunity: 70, hasVoids: false, inPlan: true, openIssues: 0, selected: false, hovered: false, label: "In the plan" },
  },
  {
    /* The count was rendered by the icon and never supplied, because the
       map passed a hardcoded zero. Now that the issue register feeds it,
       the legend has to say what the number means. */
    label: "Open issues",
    description: "A number: how many things are broken at this account",
    visual: { onPremise: false, opportunity: 55, hasVoids: false, inPlan: false, openIssues: 3, selected: false, hovered: false, label: "Open issues" },
  },
  {
    label: "Selected",
    description: "Halo and heavier stroke",
    visual: { onPremise: false, opportunity: 60, hasVoids: true, inPlan: false, openIssues: 0, selected: true, hovered: false, label: "Selected" },
  },
];
