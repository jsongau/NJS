import type { Lane } from "@/domain/types";
import { LANE_ORDER } from "@/domain/lanes";

/**
 * Grid clustering, written here because this repo takes no new
 * dependency and `leaflet.markercluster` is not installed.
 *
 * WHY THIS FILE EXISTS. Roughly a hundred organisations sit inside a six
 * and a half mile trade area, and a good third of them are stacked on
 * three streets: the Brea Mall frontage, the Imperial Highway corridor
 * and the schools cluster north of Birch. Drawn individually at the zoom
 * that shows the whole territory, those pins overlap into a single amber
 * smear. A reader cannot count them, cannot click the one underneath,
 * and cannot tell a dense street from an empty one, which is the only
 * question a trade area map is actually asked.
 *
 * So near pins collapse into a bubble carrying its own count, and the
 * bubble expands back into pins as the reader zooms in. That is the
 * whole job. It is arithmetic, it lives outside the component, and it is
 * testable without a browser, because clustering logic buried inside a
 * Leaflet layer is clustering logic nobody can check.
 *
 * WHAT A CLUSTER CARRIES, AND WHY IT IS MORE THAN A COUNT. The legend
 * contract on this screen says colour is never the only signal, and the
 * same principle applies one level up: a bubble that says "12" and
 * nothing else has thrown away the one thing a rep needs to know before
 * deciding whether to zoom into it, which is what kind of twelve it is.
 * Twelve schools is a morning of email. Twelve mall tenants is an
 * afternoon on foot. So every cluster carries the lane breakdown of its
 * own members, built by iterating LANE_ORDER rather than any list
 * written here, so a ninth or a tenth lane appears in the breakdown the
 * day it is added and nothing in this file has to be edited.
 *
 * DETERMINISM IS A REQUIREMENT, NOT A HAPPY ACCIDENT. No clock, no
 * random, no dependence on object key order. The same points at the same
 * zoom produce byte-identical output every time, which is what lets the
 * `key` field be used as a React key and what lets a test assert on a
 * count rather than on a range.
 */

export interface ClusterPoint {
  id: string;
  lat: number;
  lng: number;
  /**
   * The lane this organisation trades in.
   *
   * This is the one place this module departs from the shape sketched in
   * the spec, and it is deliberate. The lane breakdown described above
   * cannot be computed from an id and a coordinate, and the alternative,
   * making the caller pass a second parallel lookup alongside the
   * points, is exactly the sort of two-arguments-that-must-agree
   * arrangement that goes wrong six months later. Every caller already
   * holds a `DeskLine`, so the lane is free at the call site. Use
   * `toClusterPoints` and it is filled in for you.
   */
  lane: Lane;
}

/** A lane keyed tally. Built from LANE_ORDER, never from a literal. */
export type LaneTally = Record<Lane, number>;

export interface Cluster {
  /** Stable across renders at a given zoom, for a React key. */
  key: string;
  lat: number;
  lng: number;
  count: number;
  ids: string[];
  /** [[southLat, westLng], [northLat, eastLng]], for `fitBounds`. */
  bounds: [[number, number], [number, number]];
  /**
   * Members per lane, every lane present, zeroes included.
   *
   * Zeroes are kept rather than stripped so a caller can render a fixed
   * set of rows without deciding what a missing key means.
   */
  lanes: LaneTally;
  /**
   * The same tally with the empty lanes dropped, in LANE_ORDER, for a
   * badge or a tooltip that has room for three lines and not nine.
   */
  laneBreakdown: Array<{ lane: Lane; count: number }>;
}

export interface ClusterResult {
  clusters: Cluster[];
  /** Points that are alone in their cell and render as themselves. */
  singles: ClusterPoint[];
}

/**
 * ABOVE THIS ZOOM, CLUSTERING IS OFF ENTIRELY.
 *
 * At zoom 15 a hundred points spread over six and a half miles have
 * separated on their own, and a bubble reading "2" at street level is an
 * insult: the reader has zoomed in precisely because they want the two
 * actual buildings, and the map has answered by hiding both of them
 * behind a numeral. Clustering earns its place when it prevents a smear.
 * It costs the reader something the moment it stops preventing one.
 */
export const CLUSTER_MAX_ZOOM = 15;

/**
 * CELL SIZE, IN SCREEN PIXELS, AND WHY SIXTY FOUR.
 *
 * A prospect mark on this map is about 28px across with its label, and a
 * cluster bubble runs from 32px to 48px. Sixty four is a little over two
 * mark widths, which means two pins that land in the same cell would in
 * fact have overlapped had they been drawn, and two pins in adjacent
 * cells generally would not have. Thirty two left obvious collisions on
 * screen. A hundred and twenty eight swallowed whole neighbourhoods into
 * one bubble at territory zoom, which hides the thing the map is for.
 *
 * THE ARTEFACT, STATED PLAINLY SO NOBODY FILES IT AS A BUG. A fixed grid
 * cuts the world at fixed lines, so two pins forty pixels apart that
 * happen to straddle a cell boundary stay separate, while two pins sixty
 * pixels apart inside one cell merge. Distance to the boundary matters as
 * much as distance to each other. It is visible if you look for it, at
 * one or two cells per screen, and it self corrects the instant the
 * reader zooms because the grid is recomputed in the new pixel space.
 *
 * THE ALTERNATIVE THAT WAS REJECTED: greedy radius clustering, the
 * supercluster approach, where each unvisited point claims every
 * neighbour inside r pixels and the winner is whoever is visited first.
 * It has no boundary artefact and it produces prettier groups. It also
 * costs a spatial index to stay quick, it makes cluster identity depend
 * on iteration order, which means the React key changes when the input
 * order changes, and it makes the whole thing far harder to reason about
 * in a code review. At roughly a hundred points on one screen the grid is
 * quick enough to be uninteresting and simple enough to be checked by
 * hand, and being checkable is worth more here than being pretty.
 */
export const DEFAULT_CELL_PX = 64;

/** Web Mercator tile size, the constant Leaflet projects against. */
const TILE_SIZE = 256;

/**
 * Latitude beyond which Web Mercator runs away to infinity. Clamping
 * costs one line and means a bad coordinate in the data produces a pin
 * in the wrong place rather than a NaN that quietly removes a row.
 */
const MAX_MERCATOR_LAT = 85.05112878;

/**
 * Project a coordinate to pixel space at a given zoom, the same
 * arithmetic Leaflet's `map.project` performs.
 *
 * Done here rather than through the map instance so this module has no
 * Leaflet import and can be exercised by a plain node script, which is
 * how the cell size above was actually chosen.
 */
export function projectToPixels(
  lat: number,
  lng: number,
  zoom: number,
): { x: number; y: number } {
  const worldSize = TILE_SIZE * Math.pow(2, zoom);
  const clamped = Math.max(-MAX_MERCATOR_LAT, Math.min(MAX_MERCATOR_LAT, lat));
  const sin = Math.sin((clamped * Math.PI) / 180);
  const x = ((lng + 180) / 360) * worldSize;
  const y =
    (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * worldSize;
  return { x, y };
}

/** An all zeroes lane tally. Built from LANE_ORDER so it never goes stale. */
export function emptyLaneTally(): LaneTally {
  return Object.fromEntries(LANE_ORDER.map((lane) => [lane, 0])) as LaneTally;
}

/**
 * The convenience the callers actually want.
 *
 * Every call site holds rows carrying a `prospect`, so this saves each of
 * them writing the same three field map and, more usefully, means none of
 * them can forget the lane.
 */
export function toClusterPoints(
  rows: Array<{ prospect: { id: string; lat: number; lng: number; lane: Lane } }>,
): ClusterPoint[] {
  return rows.map((r) => ({
    id: r.prospect.id,
    lat: r.prospect.lat,
    lng: r.prospect.lng,
    lane: r.prospect.lane,
  }));
}

export function clusterPoints(
  points: ClusterPoint[],
  zoom: number,
  /** Cell size in screen pixels. 64 is the default and is tuned. */
  cellPx: number = DEFAULT_CELL_PX,
): ClusterResult {
  /* Above the threshold every point draws as itself. Returning a copy
     rather than the caller's array keeps this function free of side
     effects at every exit, not just the interesting one. */
  if (zoom >= CLUSTER_MAX_ZOOM || points.length === 0) {
    return { clusters: [], singles: [...points] };
  }

  const size = cellPx > 0 ? cellPx : DEFAULT_CELL_PX;

  /* A Map keyed by cell, insertion ordered, so the grouping pass does
     not depend on object key ordering rules. The output is sorted
     afterwards anyway; this just means the intermediate state is as
     deterministic as the result. */
  const cells = new Map<string, ClusterPoint[]>();

  for (const p of points) {
    const { x, y } = projectToPixels(p.lat, p.lng, zoom);
    const cellX = Math.floor(x / size);
    const cellY = Math.floor(y / size);
    const key = `${zoom}:${cellX}:${cellY}`;
    const bucket = cells.get(key);
    if (bucket) bucket.push(p);
    else cells.set(key, [p]);
  }

  const clusters: Cluster[] = [];
  const singles: ClusterPoint[] = [];

  for (const [key, unordered] of cells) {
    /* One point in a cell is not a cluster. It is a pin, and drawing it
       as a bubble reading "1" would tell the reader nothing they could
       not already see and would cost them the lane glyph. */
    if (unordered.length === 1) {
      singles.push(unordered[0]);
      continue;
    }

    /* Members are put in id order before anything is summed. Sorting the
       ids afterwards would leave the centroid dependent on the order the
       caller happened to hand the rows over, because floating point
       addition is not associative and two orderings of the same six
       coordinates can differ in the last bit. That is invisible on
       screen and poisonous in a test, which would pass or fail depending
       on how the board was sorted. */
    const members = [...unordered].sort((a, b) =>
      a.id < b.id ? -1 : a.id > b.id ? 1 : 0,
    );

    let sumLat = 0;
    let sumLng = 0;
    let south = Infinity;
    let north = -Infinity;
    let west = Infinity;
    let east = -Infinity;
    const lanes = emptyLaneTally();

    for (const m of members) {
      sumLat += m.lat;
      sumLng += m.lng;
      if (m.lat < south) south = m.lat;
      if (m.lat > north) north = m.lat;
      if (m.lng < west) west = m.lng;
      if (m.lng > east) east = m.lng;
      /* Guarded rather than incremented blind: a row carrying a lane
         this build has never heard of should be counted nowhere rather
         than adding a key that is not in the union. */
      if (m.lane in lanes) lanes[m.lane] += 1;
    }

    /* The centroid is the mean of the members, which is the honest
       answer to "where is this group". A bounding box centre would sit
       between two distant outliers with nothing underneath it. */
    const count = members.length;
    clusters.push({
      key,
      lat: sumLat / count,
      lng: sumLng / count,
      count,
      ids: members.map((m) => m.id),
      bounds: [
        [south, west],
        [north, east],
      ],
      lanes,
      laneBreakdown: LANE_ORDER.filter((lane) => lanes[lane] > 0).map((lane) => ({
        lane,
        count: lanes[lane],
      })),
    });
  }

  /* Sorted by cell key so the arrays come back in one fixed order
     regardless of how the caller ordered its rows. Two renders of the
     same board then produce identical React keys in identical positions,
     which is what stops Leaflet tearing down and rebuilding a layer it
     could have left alone. */
  clusters.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  singles.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  return { clusters, singles };
}

/**
 * How many marks the map will actually draw at a given zoom.
 *
 * Small, and worth exporting, because the accessible summary and the
 * "showing n of m" line both need it and neither of them should be
 * counting array lengths for itself.
 */
export function drawnMarkCount(result: ClusterResult): number {
  return result.clusters.length + result.singles.length;
}
