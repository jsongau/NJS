import type { LatLng } from "@/domain/types";

/**
 * Convex hull (monotone chain), used to draw a soft boundary around the
 * territory's accounts. Purely cosmetic, and worth the ~30 lines: a set
 * of pins inside a faint boundary reads as a sales territory, while the
 * same pins without one read as scattered locations.
 *
 * Treating lat/lng as planar is fine at this scale. Over twenty
 * kilometres the projection error is invisible, and this shape is never
 * measured against.
 */
export function convexHull(points: LatLng[]): LatLng[] {
  if (points.length < 3) return points;

  const pts = [...points].sort((a, b) =>
    a.lng === b.lng ? a.lat - b.lat : a.lng - b.lng,
  );

  const cross = (o: LatLng, a: LatLng, b: LatLng) =>
    (a.lng - o.lng) * (b.lat - o.lat) - (a.lat - o.lat) * (b.lng - o.lng);

  const lower: LatLng[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper: LatLng[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  lower.pop();
  upper.pop();
  return lower.concat(upper);
}
