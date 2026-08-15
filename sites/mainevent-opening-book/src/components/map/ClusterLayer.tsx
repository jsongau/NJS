import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Marker, Popup, useMap, useMapEvent } from "react-leaflet";
import type L from "leaflet";

import type { Lane } from "@/domain/types";
import type { DeskLine } from "@/domain/selectors/desk";
import { LANE_META } from "@/domain/lanes";
import {
  clusterPoints,
  toClusterPoints,
  DEFAULT_CELL_PX,
  type Cluster,
} from "@/lib/map/cluster";
import {
  CLUSTER_STEPS,
  clusterIcon,
  clusterMarkScene,
  prospectIcon,
} from "@/lib/map/markerIcons";
import styles from "./ClusterLayer.module.css";

/**
 * THE MARKS THEMSELVES. Either a bubble carrying a count or an
 * organisation carrying its lane, decided by how close together they are
 * at the zoom the reader is actually at.
 *
 * WHY THIS IS A COMPONENT AND NOT PART OF THE MAP
 * `MapCanvas` owns the container, the rings, the venue and the fit
 * behaviour, all of which are fixed. This layer owns the only thing on the
 * map that changes as the reader zooms, and separating the two means the
 * expensive part, which is a hundred Leaflet markers, is re-rendered when
 * the zoom or the rows change and at no other time. Fold the two together
 * and every pan of the map becomes a rebuild of every pin, which is the
 * quiet way a Leaflet map in React becomes unusable.
 *
 * WHAT A CLUSTER BUBBLE IS ALLOWED TO SAY
 * It carries its count as a NUMERAL, because a number is the one mark a
 * reader can compare exactly. Its radius moves in three fixed steps rather
 * than on a continuous scale, because nobody can compare two circles
 * accurately and everybody can tell three sizes apart, so the size is
 * reinforcement and the numeral is the signal.
 *
 * It is NEUTRAL. Not one lane colour appears on a bubble. A cluster spans
 * lanes and painting it with its majority lane would be a claim about a
 * group that the group does not support: seven marks reading "schools"
 * when three of them are tyre shops is worse than seven marks reading
 * nothing. The lane mix is still carried, in words and numbers, in the
 * title a reader gets on hover and a screen reader gets on focus, which is
 * a channel that survives greyscale because it was never a colour.
 *
 * THE SELECTED ORGANISATION IS NEVER FOLDED INTO A BUBBLE
 * It is pulled out of the clustering input entirely and drawn on its own at
 * every zoom. A reader who chose a row in the list and then cannot find its
 * pin has lost the connection between the two panes, which is the whole
 * reason the panes sit beside each other.
 *
 * A BUBBLE COUNTS WHAT IS ON THE BOARD, AND NOTHING ELSE
 * `rows` arrives already narrowed by the lane filter, the search box and
 * the written door switch, and this layer clusters exactly what it is
 * given. It never reaches past its props for the whole trade area to make
 * a bubble look busier. That is not a detail: the key beside the map now
 * prints a live count per lane, and a bubble reading twelve over a board
 * the key says holds three would make one of the two a liar. The reader
 * will believe the numeral, because a numeral on the thing itself always
 * beats a figure in a panel, so the numeral has to be the true one.
 *
 * THE DRAWING IS NOT THIS FILE'S ANY MORE
 * The bubble used to be built here, as a template literal, because the
 * marker system was being written in the same wave and this layer could
 * not depend on it yet. It can now, so it does. `clusterIcon` in
 * `lib/map/markerIcons.ts` owns the geometry, the three sizes, the paper
 * halo and the words, exactly as it owns the prospect mark and the venue,
 * and a second copy of a shape is a second copy to keep in step.
 */

/**
 * The widest a bubble ever gets, from the marker system's own steps.
 *
 * The box a step draws into is its radius plus the three units of paper
 * halo around it, doubled, which is the arithmetic `clusterMarkScene`
 * does. Reading the steps rather than restating the number means a fourth
 * size, or a wider halo, cannot silently break the anti-collision clamp
 * below.
 */
const MAX_BUBBLE_PX = Math.max(...CLUSTER_STEPS.map((s) => (s.r + 3) * 2));

/**
 * ── EVERY ICON IS BUILT ONCE AND THEN HANDED OUT ──────────────────
 *
 * This is the change that makes a hundred and two organisations feel like
 * a map rather than like a prototype, so it is worth being precise about
 * what was wrong.
 *
 * React Leaflet compares the `icon` prop by IDENTITY and calls Leaflet's
 * `setIcon` whenever it differs. `setIcon` does not repaint an element,
 * it REPLACES it: the old icon is removed from the marker pane, a new div
 * is built from the HTML string, and it is inserted and positioned again.
 * Both builders below construct a fresh `L.DivIcon` on every call, so
 * every single render of this layer replaced a hundred and two elements
 * in the document to arrive at exactly the same pixels.
 *
 * The renders were not rare. This layer re-renders on every zoom, on
 * every change to the filtered rows, and on every selection, and a
 * selection is a click on a pin. So clicking one organisation rebuilt the
 * other hundred and one, which is why the board flickered under a popup
 * that had just opened, and why a zoom felt heavier than the animation
 * running underneath it.
 *
 * Caching by the values the drawing actually depends on means an icon is
 * built once and then handed to the same marker on every subsequent
 * render, `setIcon` is never called, and the only DOM that changes when a
 * reader picks an organisation is the one mark whose selected state
 * changed. A `L.DivIcon` is safe to share, incidentally: `createIcon`
 * builds a fresh element from the stored options on each call, so the
 * instance is a recipe rather than a node.
 *
 * The cache is bounded and cleared wholesale rather than evicted one
 * entry at a time. The keys are drawn from a fixed book of a hundred and
 * two organisations and a handful of cluster counts, so it settles at a
 * few hundred entries and never grows; the ceiling exists so that a
 * future page plotting something unbounded degrades into rebuilding
 * icons rather than into a leak.
 */
const ICON_CACHE_CEILING = 600;
const iconCache = new Map<string, L.DivIcon>();

function cached(key: string, build: () => L.DivIcon): L.DivIcon {
  const found = iconCache.get(key);
  if (found) return found;
  if (iconCache.size >= ICON_CACHE_CEILING) iconCache.clear();
  const made = build();
  iconCache.set(key, made);
  return made;
}

/**
 * The marker system's bubble, plus the one class that belongs to this
 * layer rather than to the drawing.
 *
 * A divIcon is built by Leaflet from an options object and never passes
 * through this component's JSX, so a class cannot be handed to it as a
 * prop. `clusterIcon` already gives it the two public marker classes, and
 * the alternative to appending here was to add a `className` parameter to
 * the marker system whose only purpose is to let one caller reach back
 * into it. The class is appended before Leaflet has ever seen the icon.
 */
function bubbleIcon(count: number, detail: string): L.DivIcon {
  return cached(`bubble|${count}|${detail}`, () => {
    const icon = clusterIcon(count, detail);
    icon.options.className = `${icon.options.className ?? ""} ${styles.bubble}`;
    return icon;
  });
}

/**
 * An organisation's mark. Keyed on everything the drawing reads: the lane
 * decides the body and the icon, the selection decides the halo and the
 * stroke weight, and the label is baked into the accessible name inside
 * the SVG.
 */
function markIcon(
  id: string,
  lane: Lane,
  label: string,
  selected: boolean,
): L.DivIcon {
  return cached(`mark|${id}|${lane}|${selected ? "on" : "off"}|${label}`, () =>
    prospectIcon({ lane, label, selected }),
  );
}

/**
 * WHY A BUBBLE IS NOT DRAWN EXACTLY ON ITS CENTROID.
 *
 * The clusterer cuts the world into a fixed grid and puts each bubble at
 * the mean of its members, which is the honest answer to "where is this
 * group". It is also the answer that lets two bubbles collide. Members
 * bunched against one edge of their cell pull the centroid to that edge,
 * the neighbouring cell's members do the same from the other side, and two
 * marks up to 56 pixels across end up a handful of pixels apart. That is
 * the pair of overlapping bubbles in the photograph, and it is not a phone
 * problem: the same thing happens at 1440, where a bubble reading 11 and a
 * bubble reading 62 were drawn on top of each other.
 *
 * So each centroid is allowed to move away from its own cell centre by at
 * most half the slack the cell has left after the widest bubble is
 * subtracted. Two neighbouring cell centres are `cell` pixels apart, each
 * bubble gives up at most that much, so the closest two centres can ever
 * come is the width of the widest bubble. No two bubbles can overlap, at
 * any zoom, for any arrangement of the data. It is a clamp rather than a
 * rounding, so a bubble whose members are genuinely central does not move
 * at all, and the worst any bubble is displaced is the difference between
 * a true position and a truthful one.
 *
 * The cell coordinates come out of the cluster key, which the clusterer
 * documents as `zoom:cellX:cellY` and guarantees stable, so nothing here
 * has to recompute the grid or agree with it by hand.
 */
function clampedPixelPoint(
  cluster: Cluster,
  cell: number,
  zoom: number,
  project: (lat: number, lng: number) => { x: number; y: number },
): { x: number; y: number } | null {
  const parts = cluster.key.split(":");
  const cellX = Number(parts[1]);
  const cellY = Number(parts[2]);
  if (!Number.isFinite(cellX) || !Number.isFinite(cellY)) return null;
  if (Number(parts[0]) !== zoom) return null;

  const slack = Math.max(0, (cell - MAX_BUBBLE_PX) / 2);
  const centreX = (cellX + 0.5) * cell;
  const centreY = (cellY + 0.5) * cell;
  const p = project(cluster.lat, cluster.lng);
  return {
    x: Math.min(centreX + slack, Math.max(centreX - slack, p.x)),
    y: Math.min(centreY + slack, Math.max(centreY - slack, p.y)),
  };
}

/**
 * The lane mix, in words, for the title on a bubble.
 *
 * Built from the breakdown the clusterer produced, which it built by
 * walking LANE_ORDER, so a ninth or a tenth lane appears here the day it is
 * added and nothing in this file has to be touched.
 */
function laneMixSentence(cluster: Cluster): string {
  if (cluster.laneBreakdown.length === 0) return "";
  const parts = cluster.laneBreakdown.map(
    (entry) => `${LANE_META[entry.lane].label} ${entry.count}`,
  );
  return `Lanes inside it: ${parts.join(", ")}.`;
}

export interface ClusterLayerProps {
  rows: DeskLine[];
  selectedId: string | null;
  onSelectProspect: (prospectId: string) => void;
  onZoomToCluster: (bounds: [[number, number], [number, number]]) => void;
  /**
   * Fired when an organisation's popup closes. The caller decides whether
   * that should clear the selection, because only the caller knows whether
   * a newer selection has already replaced this one.
   */
  onPopupClose?: (prospectId: string) => void;
  /** The popup body. Supplied by the caller so this layer imports no card. */
  renderPopup?: (row: DeskLine) => ReactNode;
  /** Grid cell size in screen pixels. The clusterer's default is tuned. */
  cellPx?: number;
  /**
   * How much of each corner of the map the caller has already spent on
   * floating controls, as [x, y] pixels, so an opening popup is panned
   * into the part of the container that is genuinely free.
   *
   * It is a prop rather than a constant because only the pane that draws
   * those controls knows how tall they are at the current width, and it is
   * optional because a layer with no floating cards over it should not
   * have to say so.
   */
  popupPaddingTopLeft?: [number, number];
  popupPaddingBottomRight?: [number, number];
}

export function ClusterLayer({
  rows,
  selectedId,
  onSelectProspect,
  onZoomToCluster,
  onPopupClose,
  renderPopup,
  cellPx,
  popupPaddingTopLeft,
  popupPaddingBottomRight,
}: ClusterLayerProps) {
  const map = useMap();
  const [zoom, setZoom] = useState<number>(() => map.getZoom());

  /*
    Zoom only. Not move, not moveend. The grid is computed in pixel space
    at an integer zoom, so panning cannot change which points share a cell,
    and recomputing on every frame of a drag would rebuild a hundred markers
    for a result that is identical to the one already on screen.
  */
  useMapEvent("zoomend", () => setZoom(map.getZoom()));

  /*
    ── AND THE ZOOM IS ALSO READ BACK AFTER EVERY COMMIT ─────────────

    The event alone is not enough, and the hole it leaves is a real
    defect rather than a theoretical one. React runs every cleanup in a
    commit before it runs any effect. When the board changes the rows,
    this layer re-renders in the same commit as `FitToFilter`, so the
    order is: this layer's `zoomend` listener is REMOVED, `FitToFilter`
    calls `fitBounds`, Leaflet changes the zoom synchronously and fires
    `zoomend` into empty air, and only then is the listener put back.
    The event that mattered is the one nobody was listening for.

    What that looked like: taking a go-see run refit the map from the
    trade area to a corridor five zoom levels in, and the marks stayed
    grouped on the grid of the zoom the reader had left. Six pins the
    card had just named were two bubbles somewhere off the edge, and the
    map only corrected itself when somebody happened to zoom by hand.

    Reading the zoom back after every render closes it without a timer
    and without racing the animation. `setZoom` with the value it already
    holds is a no-op in React, so a pan, a selection or a status change
    costs one comparison and no re-render.
  */
  useEffect(() => {
    setZoom(map.getZoom());
  });

  const rowById = useMemo(() => {
    const index = new Map<string, DeskLine>();
    for (const row of rows) index.set(row.prospect.id, row);
    return index;
  }, [rows]);

  /* Mirrors the clusterer's own guard, so the grid this layer draws
     against is always the grid the clusterer actually used. */
  const cell = cellPx && cellPx > 0 ? cellPx : DEFAULT_CELL_PX;
  const gridZoom = Math.round(zoom);

  const result = useMemo(() => {
    const clusterable = selectedId
      ? rows.filter((r) => r.prospect.id !== selectedId)
      : rows;
    return clusterPoints(toClusterPoints(clusterable), gridZoom, cellPx);
  }, [rows, selectedId, gridZoom, cellPx]);

  /*
    Where each bubble is drawn, in latitude and longitude, after the
    anti-collision clamp above. Recomputed only when the grid changes,
    never on a pan: the clamp is arithmetic in the pixel space of a fixed
    integer zoom, and panning does not move a point within that space.
  */
  const bubbles = useMemo(
    () =>
      result.clusters.map((cluster) => {
        const clamped = clampedPixelPoint(cluster, cell, gridZoom, (lat, lng) =>
          map.project([lat, lng], gridZoom),
        );
        const at = clamped
          ? map.unproject([clamped.x, clamped.y], gridZoom)
          : null;
        return {
          cluster,
          position: at
            ? ([at.lat, at.lng] as [number, number])
            : ([cluster.lat, cluster.lng] as [number, number]),
        };
      }),
    [result, cell, gridZoom, map],
  );

  /*
    EVERY ORGANISATION THIS LAYER DRAWS, IN ONE KEYED ARRAY.

    The selected row is appended to the singles rather than rendered in a
    slot of its own after them, and the reason is a defect that is very
    easy to build and very hard to look at. React reconciles a keyed array
    against a keyed array, and a lone element after it against that lone
    element. So a marker that was a single before the click and the
    selection afterwards moved from the array to the slot, which is an
    unmount and a mount rather than an update, and Leaflet destroyed the
    marker's icon while its own popup was open on it. On a desk that
    reads as a popup that flickers. On a phone the popup is the ONLY route
    from a pin to the panel, so a popup that closes itself the instant it
    opens makes every pin on the map a dead end.

    One array, keyed by organisation id, and the selected row keeps the
    same component instance whether it is selected or not. The `selected`
    flag then changes an icon rather than a component.
  */
  const selectedRow = selectedId ? rowById.get(selectedId) ?? null : null;

  const drawnRows: DeskLine[] = [];
  for (const point of result.singles) {
    const row = rowById.get(point.id);
    if (row) drawnRows.push(row);
  }
  /* Always drawn, whatever the zoom and whatever the grid decided. The
     clusterer never sees it, so it can never appear twice. */
  if (selectedRow) drawnRows.push(selectedRow);

  const renderProspect = (row: DeskLine) => {
    const p = row.prospect;
    const meta = LANE_META[p.lane];
    return (
      <Marker
        key={p.id}
        position={[p.lat, p.lng]}
        icon={markIcon(
          p.id,
          p.lane,
          `${p.name}, ${meta.label}`,
          selectedId === p.id,
        )}
        /*
          Leaflet gives a marker a tabindex and role="button" of its own, and
          the title is what a screen reader then reads out. So the title is
          written as a sentence a person would want read to them rather than
          as a tooltip: the organisation, its lane and its occasion class,
          which is the same three facts the mark itself carries in shape,
          glyph and colour.
        */
        title={`${p.name}. ${meta.label}, ${
          meta.occasionClass === "calendar-locked"
            ? "calendar locked"
            : "discretionary"
        }. ${row.miles.toFixed(1)} straight line miles from the building.`}
        keyboard
        eventHandlers={{
          popupopen: () => onSelectProspect(p.id),
          popupclose: () => onPopupClose?.(p.id),
        }}
      >
        {renderPopup ? (
          <Popup
            autoPanPaddingTopLeft={popupPaddingTopLeft}
            autoPanPaddingBottomRight={popupPaddingBottomRight}
          >
            {renderPopup(row)}
          </Popup>
        ) : null}
      </Marker>
    );
  };

  return (
    /*
      EVERY MARK GOES IN LEAFLET'S OWN MARKER PANE. NO CUSTOM PANE.

      An earlier draft put the organisations in a pane of their own at
      z-index 590, so that the venue and the ring labels in the default
      pane at 600 would always draw above them. It looked correct and it
      was not, because `tokens.css` flattens every Leaflet pane to one
      z-index with an `!important` so that no map can punch through the
      application's drawers and modals. With the panes all equal, stacking
      falls back to document order, a pane created afterwards goes on top
      of every pane created before it, and two things broke at once: the
      broken ring reading "Not open yet" was buried under a cluster bubble
      at the dead centre of the board, and a popup, which Leaflet draws in
      the popup pane, opened underneath the pins around it.

      Raising the custom pane instead of removing it fixes the first and
      makes the second worse, so it is removed. Ordering inside the one
      pane is what `zIndexOffset` is for and what the rest of this
      application already relies on: the venue is forced to 1000 and the
      ring labels to 500, both far beyond the pixel heights a mark can
      reach, so the building is always on top of the organisations around
      it and a popup is always on top of everything.
    */
    <>
      {bubbles.map(({ cluster, position }) => {
        /*
          The words come off the scene the icon is built from rather than
          being assembled again here, so the tooltip a reader hovers and
          the accessible name a screen reader hears are one string. The
          lane mix is the detail: a bubble reading twelve tells a rep how
          many doors, and the mix tells them whether it is a morning of
          email or an afternoon on foot.
        */
        const detail = laneMixSentence(cluster);
        const label = clusterMarkScene(cluster.count, { detail }).title;
        return (
          <Marker
            key={cluster.key}
            position={position}
            icon={bubbleIcon(cluster.count, detail)}
            title={label}
            keyboard
            eventHandlers={{
              click: () => onZoomToCluster(cluster.bounds),
              keypress: (event) => {
                /* Leaflet fires a click for Enter on a focused marker, but
                   not for the space bar, and a reader who has tabbed to a
                   bubble will try both. */
                const original = event.originalEvent as KeyboardEvent;
                if (original.key === " " || original.key === "Spacebar") {
                  original.preventDefault();
                  onZoomToCluster(cluster.bounds);
                }
              },
            }}
          />
        );
      })}

      {drawnRows.map((row) => renderProspect(row))}
    </>
  );
}
