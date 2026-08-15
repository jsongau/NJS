import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  Polygon,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  useMapEvent,
} from "react-leaflet";
import L from "leaflet";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

import type { LatLng, Prospect } from "@/domain/types";
import type { DeskLine } from "@/domain/selectors/desk";
import { VENUE } from "@/data/venue";
import { convexHull } from "@/lib/map/hull";
import { ringLabelIcon, venueIcon } from "@/lib/map/markerIcons";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import type { ComposeIntent } from "@/components/email/EmailComposeModal";
import { ProspectMapPopup } from "@/components/map/ProspectMapPopup";
import { ClusterLayer } from "@/components/map/ClusterLayer";
import styles from "./MapCanvas.module.css";

/**
 * THE CENTRE PANE. The trade area itself, and the one place on the screen
 * where the premise of the whole application is visible without reading a
 * word: Main Event Brea is not open.
 *
 * This component is the Leaflet container and nothing else. It holds no
 * filter state, no selection state and no modal. It is handed the rows the
 * board has already filtered, the id of whatever is selected, and a set of
 * callbacks, and it draws them. Everything a reader can change lives one
 * level up, in the page, because a map that owns a filter is a map that
 * disagrees with the list beside it the first time somebody changes the
 * filter from the list.
 *
 * WHY THE VENUE MARK IS A BROKEN RING
 * A solid pin on a map says "here is a business". Main Event Brea is an
 * address, a phone number, a coming soon form and no published opening
 * date, and a reader who takes the centre of this map for an operating
 * site reads every other mark on the screen as a customer instead of as an
 * organisation nobody has spoken to yet. So the ring is dashed, the words
 * "Not open yet" sit under it, and neither of those depends on the amber.
 *
 * WHY THE RINGS SAY "STRAIGHT LINE"
 * A circle drawn from a venue is the oldest trick on a territory map and
 * it is almost always sold as a drive time. It is not one. There is no
 * routing engine in this dependency tree and there will not be one, so the
 * claim is made in plain words on the map itself, in the ring note and on
 * the one ring label this pane draws, rather than only in a key three
 * hundred pixels away that a reader may never open.
 *
 * WHY A MAP IS THE HARDEST THING ON THIS SCREEN TO MAKE ACCESSIBLE
 * A map is a graphic. A screen reader is handed a canvas of tiles and gets
 * nothing at all, so this pane carries a live summary paragraph saying how
 * many organisations are plotted, how many sit inside three miles and how
 * many publish no written door. That paragraph is not a substitute for the
 * list pane beside it, which is the real non-map route to every row here;
 * it exists so that a reader who lands on the map is told what they are
 * standing in front of instead of being handed silence.
 *
 * ── THE WHEEL, AND WHY IT CHANGED SIDES ───────────────────────────
 *
 * This pane used to disable scroll wheel zoom outright, on the reasoning
 * that a map which eats the wheel is a map a reader cannot scroll past.
 * That reasoning was inherited from a page layout that no longer exists.
 * The trade area is a TAKEOVER now: the route fills the viewport, the
 * document behind it does not scroll, and there is nothing to scroll past.
 * What the reader got instead was a map that ignored the one gesture
 * everybody has used on every map since 2005, and three buttons in a
 * corner as the only way to change zoom.
 *
 * So the wheel zooms, and the three things that made disabling it look
 * attractive are each solved on their own terms:
 *
 *   THE PAGE BEHIND DOES NOT MOVE. Leaflet's own handler cancels the
 *   wheel event over the map container, and `WheelOwnership` below extends
 *   the same guarantee to the floating cards drawn OVER the container,
 *   which Leaflet knows nothing about. A card that can scroll still
 *   scrolls; a card that cannot no longer leaks the gesture upwards.
 *
 *   ONE NOTCH IS ONE LEVEL. Leaflet's default of 60 pixels per zoom level
 *   puts a browser's standard 100 pixel notch three levels down the scale
 *   in a single flick, which is the lurch that makes a web map feel
 *   broken. The constant below is set so a notch is a step.
 *
 *   A PINCH ON A TRACKPAD STILL PINCHES. Chrome and Safari both report a
 *   Mac trackpad pinch as a wheel event carrying `ctrlKey`, which Leaflet
 *   already reads as a zoom, and the wheel guard cancels it so that the
 *   browser does not page zoom the whole application underneath.
 *
 * Two defects were designed out on purpose, because both are common and
 * both are noticed immediately:
 *
 *   THE VIEW REFITS ON THE FILTER AND ON NOTHING ELSE. Refitting on every
 *   render is the classic Leaflet in React bug and it makes a map unusable,
 *   because the reader is thrown back to the whole territory every time
 *   they record a touch.
 *
 *   THE TILES ARE ALLOWED TO FAIL. CARTO is a third party and it is
 *   unreachable on some networks. When it is, this pane says so in words
 *   and keeps drawing the marks on a plain ground, rather than presenting a
 *   grey rectangle with no explanation in it.
 */

/**
 * The three rings, in straight line miles.
 *
 * ONE, THREE AND FIVE ARE NOT ROUND NUMBERS PICKED FOR THE LOOK OF THEM.
 * Each one changes how a visit is planned rather than how far it is. A mile
 * is walkable from the building and can be dropped into a gap between two
 * other things. Three miles is the radius inside which a go-see is a twenty
 * minute round trip, so a morning holds three or four of them. Five is the
 * edge past which a single visit costs a half day, which means it has to be
 * run with two or three others or not at all.
 */
const RINGS: { miles: number; note: string }[] = [
  { miles: 1, note: "Walkable from the building. Fits in a gap." },
  { miles: 3, note: "A twenty minute round trip. Three or four in a morning." },
  { miles: 5, note: "A half day unless it is run with two or three others." },
];

const METRES_PER_MILE = 1609.344;

/**
 * Miles per degree of latitude. Used only to place a ring's label on the
 * ring it belongs to, never to measure anything: every distance quoted on
 * this screen comes from the haversine in the desk selector, so there is
 * one definition of "how far" in the application and this is not it.
 */
const MILES_PER_DEGREE_LAT = 69.055;

const VENUE_POINT: [number, number] = [VENUE.lat, VENUE.lng];

/**
 * Below this pane width the map is treated as a phone map.
 *
 * It is measured off the PANE and not off the window, which matters,
 * because the same 1000px browser can hand this component 940 pixels with
 * the list collapsed and 180 with three panes open. The thing that decides
 * whether a ring label fits is the box the map is actually drawn in.
 */
const NARROW_PANE_PX = 520;

/**
 * How many pixels of wheel travel buy one zoom level.
 *
 * THIS IS THE SINGLE NUMBER THAT DECIDES WHETHER THE MAP FEELS RIGHT, and
 * Leaflet's default of 60 is wrong for every pointing device a person is
 * likely to be holding. The handler does not divide travel by this figure
 * and stop there: it runs the ratio through a logistic curve and then
 * rounds UP to the nearest zoom step, so the rounding is where the damage
 * happens. At 60, a browser's standard 100 pixel notch comes out at 2.31
 * levels and rounds to three. One flick of a wheel and the reader has gone
 * from a trade area to a street corner, which is exactly the behaviour
 * that gets scroll zoom switched off on maps like this one.
 *
 * At 120 the same notch comes out at 0.57 and rounds to one, a small
 * trackpad nudge of 40 pixels also comes out at one, and a hard flick of
 * 400 pixels comes out at two. A notch is a step, a shove is two steps,
 * and nothing the hand can do produces a jump.
 */
const WHEEL_PX_PER_ZOOM_LEVEL = 120;

/**
 * How long the handler gathers wheel travel before acting on it.
 *
 * A Mac trackpad fires a continuous stream of very small deltas, including
 * a momentum tail after the fingers have left the surface. Gathering for
 * 45 milliseconds turns that stream into steps a person can count, and it
 * is short enough that the map still answers the first movement inside a
 * frame or two rather than feeling like it has to think about it.
 */
const WHEEL_DEBOUNCE_MS = 45;

/**
 * The glide after a drag, and the shape of every animated move.
 *
 * A MAP COASTS AND A TABLE DOES NOT. That is most of the difference
 * between an interface that feels like a map and one that feels like a
 * grid with pictures on it. Leaflet's default deceleration of 3400 stops
 * the pane almost the instant the pointer is released, which reads as the
 * map being dropped rather than thrown. 2600 keeps roughly a third of a
 * second of travel, which is enough to feel like momentum and short enough
 * that nobody has to wait for it to finish before clicking a pin.
 *
 * `easeLinearity` is the same decision for animated zooms and fly moves:
 * lower is a longer tail, and 0.22 lands a zoom softly instead of
 * arriving at the new scale and stopping dead.
 */
const INERTIA_DECELERATION = 2600;
const EASE_LINEARITY = 0.22;

/** How long a cluster expansion takes, in seconds. */
const CLUSTER_FLY_SECONDS = 0.45;

/**
 * How far a cluster is allowed to zoom the reader in, however tight its
 * members are.
 *
 * Sixteen is a street. Two organisations at one address fit the screen
 * only at nineteen, which is a roof, and a reader who pressed a bubble
 * reading "2" to find out where those two are has instead lost every
 * landmark that told them where they were. The cap is a ceiling and not a
 * target: the floor of one level beyond wherever the reader already is
 * still applies above it, so a bubble pressed at zoom seventeen still
 * moves.
 */
const CLUSTER_MAX_ZOOM = 16;

/**
 * How much room `fitBounds` leaves round the edge, in pixels, as
 * [horizontal, vertical].
 *
 * FORTY PIXELS A SIDE IS NOT FREE, AND ON A PHONE IT COSTS A ZOOM LEVEL.
 * The book spans just under thirteen miles east to west. At zoom eleven
 * that is 328 pixels of screen, which fits inside a 380 pixel handset with
 * 36 pixels to spare and does not fit inside the 300 that the desk
 * padding leaves. So the desk padding pushed the phone down to zoom ten,
 * where the whole trade area compressed into 164 pixels, every mark in the
 * dense core landed in one grid cell, and the map answered a question
 * about a hundred organisations with two bubbles.
 *
 * The narrow figures are the smallest that still clear a mark: a prospect
 * mark is 34 pixels square and anchored at its centre, so 18 horizontally
 * and 28 vertically keep an edge organisation whole rather than sliced.
 */
const FIT_PADDING_WIDE: [number, number] = [40, 40];
const FIT_PADDING_NARROW: [number, number] = [18, 28];

/**
 * How much of each corner this pane has already spent on floating
 * controls, so Leaflet can pan an opening popup into the part of the
 * container that is genuinely free.
 *
 * Top left holds the ring note, which is now always on screen. Bottom
 * right holds the zoom column and the credits affordance underneath it,
 * and the credits may not be covered, because they are a licence
 * condition rather than decoration.
 *
 * The bottom LEFT deliberately has no entry here. The offers card sits
 * there and it is the page's, not this pane's, and the page already
 * removes the card outright the moment a popup opens. A padding value
 * would have been a second, weaker answer to a problem that is already
 * solved properly one level up.
 *
 * Module constants rather than inline literals so the values keep their
 * identity between renders. An array rebuilt on every pass is a prop that
 * has changed on every pass, and on a Leaflet layer that is how a hundred
 * markers end up being torn down and rebuilt for nothing.
 */
const POPUP_PAD_TOP_LEFT_WIDE: [number, number] = [12, 104];
const POPUP_PAD_BOTTOM_RIGHT_WIDE: [number, number] = [64, 184];
const POPUP_PAD_TOP_LEFT_NARROW: [number, number] = [12, 116];
const POPUP_PAD_BOTTOM_RIGHT_NARROW: [number, number] = [56, 156];

/**
 * How far from the building a ring label has to fall before it is worth
 * drawing, in screen pixels.
 *
 * A RING LABEL IS ONLY HONEST IF IT CAN BE READ. The venue mark is 104
 * pixels wide, because it carries the words "Not open yet" on a plate
 * under the ring, and that plate reaches 52 pixels either side of the
 * building and 34 below it. A ring drawn at the territory zoom is 25
 * pixels of radius per mile, so a one mile label lands 18 pixels from the
 * centre, which is underneath the plate, and a three mile label lands 54,
 * which clips its top edge.
 *
 * Sixty six pixels clears the plate and a label's own half height with a
 * margin. Below that the label is not drawn, and the ring is named by the
 * note instead.
 */
const RING_LABEL_MIN_OFFSET_PX = 66;

/*
 * THE PROMO BUTTON THAT USED TO SIT UNDER THE POPUP CARD IS GONE.
 *
 * This pane drew one more control beneath `ProspectMapPopup`, a filled
 * "Send a featured promo", on the reasoning that the pre-opening offer
 * could otherwise be sent from the panel and from nowhere on the map. The
 * card underneath it has since lost its own two buttons as well, and the
 * reasoning went with them: opening a marker selects the organisation, so
 * the detail pane beside the map is already showing it with every compose
 * intent on it, and the organisation's name in the popup opens the record,
 * which carries them too. Three routes to one modal, one of them stacked
 * on a 268 pixel card over a working map, was two too many.
 *
 * `onCompose` stays on this pane's props. The board passes it, the popup
 * card takes it, and the map may need to raise an intent again; what it
 * must not do is paint a button for one.
 */

/** Metres per pixel at the equator at zoom zero, the Web Mercator constant. */
const EQUATOR_METRES_PER_PIXEL = 156543.03392;

/** How many screen pixels one straight line mile occupies at a given zoom. */
function pixelsPerMile(zoom: number): number {
  const metresPerPixel =
    (EQUATOR_METRES_PER_PIXEL * Math.cos((VENUE.lat * Math.PI) / 180)) /
    Math.pow(2, zoom);
  return METRES_PER_MILE / metresPerPixel;
}

/**
 * How many tile requests have to fail before the pane admits it.
 *
 * One failed tile is a dropped packet and saying so would be noise. Six is
 * a basemap that is not coming, and by then the reader is looking at an
 * empty rectangle and deserves a sentence explaining it.
 */
const TILE_FAILURES_BEFORE_NOTICE = 6;

/**
 * Where a ring's label sits: north west of the venue, on the ring itself.
 *
 * ── WHY THE BEARING MOVED, AND WHY IT IS ABOUT THIS PANE ──────────
 * It used to be south west, chosen because the south west is the emptiest
 * quadrant of the trade area: Brea runs north east and due south of Birch
 * Street, so a label placed there sat over the fewest pins. That is a true
 * fact about the data and it was the wrong thing to optimise for, because
 * the south west of the trade area is also the bottom left of the map
 * COLUMN, and the bottom left of the map column is where the page parks
 * its offers card. The label was drawn correctly, on the correct arc, and
 * a reader never saw it. A label nobody can see is worse than no label,
 * because it costs the same work and answers nothing.
 *
 * The north west is the quadrant this pane keeps clear on purpose. The key
 * is pinned top right, the ring note top left as a thin strip, the zoom
 * column and the credits bottom right, and the offers card bottom left.
 * That leaves the upper left, away from every corner, and a label there is
 * on screen at every zoom this map can reach.
 */
function ringLabelPoint(miles: number): [number, number] {
  const diag = miles * Math.SQRT1_2;
  const lngPerMile =
    1 / (MILES_PER_DEGREE_LAT * Math.cos((VENUE.lat * Math.PI) / 180));
  return [
    VENUE.lat + diag / MILES_PER_DEGREE_LAT,
    VENUE.lng - diag * lngPerMile,
  ];
}

/**
 * Reduced motion, read once and watched.
 *
 * The duration tokens already collapse to zero under this media query, but
 * Leaflet animates in JavaScript rather than in CSS, so a pan it runs
 * itself never sees the token. This hook is how `animate: false` reaches
 * `setView` and `fitBounds`, how the inertia and the zoom animation are
 * switched off at construction, and how the fly move a cluster runs is
 * turned back into a jump.
 */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/**
 * Whether anything between `from` and `stopAt` is a box that can actually
 * move in the direction the wheel is asking for.
 *
 * The test is deliberately "can it move", not "is it scrollable". A card
 * with `overflow: auto` that is already at its bottom edge cannot answer a
 * downward wheel, and treating it as though it can is how a gesture ends
 * up chaining into the document behind the map. One pixel of tolerance,
 * because browsers report fractional scroll positions on scaled displays
 * and an exact comparison fails at the end of the range on a Mac.
 */
function canAbsorbWheel(
  from: EventTarget | null,
  stopAt: HTMLElement,
  deltaX: number,
  deltaY: number,
): boolean {
  let node = from instanceof Node ? from : null;
  while (node && node !== stopAt.parentNode) {
    if (node instanceof HTMLElement) {
      const style = window.getComputedStyle(node);
      const roomY = node.scrollHeight - node.clientHeight;
      const roomX = node.scrollWidth - node.clientWidth;
      const scrollsY = /auto|scroll|overlay/.test(style.overflowY) && roomY > 1;
      const scrollsX = /auto|scroll|overlay/.test(style.overflowX) && roomX > 1;
      if (scrollsY && deltaY !== 0) {
        const at = node.scrollTop;
        if (deltaY < 0 ? at > 1 : at < roomY - 1) return true;
      }
      if (scrollsX && deltaX !== 0) {
        const at = node.scrollLeft;
        if (deltaX < 0 ? at > 1 : at < roomX - 1) return true;
      }
    }
    node = node.parentNode;
  }
  return false;
}

/**
 * THE WHEEL BELONGS TO THE MAP WHILE THE POINTER IS OVER IT.
 *
 * This is the piece that made it safe to turn scroll wheel zoom back on,
 * so it is worth being exact about what it does and what it does not.
 *
 * Leaflet cancels wheel events on its own container, which covers the
 * tiles and the marks. It knows nothing about the layer this pane draws
 * ON TOP of that container: the key, the offers card, the ring note, the
 * zoom column. Those are ordinary DOM sitting over the map, and a wheel
 * over any of them was reaching the document. In a full height takeover
 * that mostly looks like nothing happening, which is its own kind of
 * broken, and on a Mac trackpad a pinch over a card page zoomed the entire
 * application because nobody had cancelled it.
 *
 * So this listener runs in the CAPTURE phase on the shell, which is the
 * outermost element of the pane, and cancels the event unless something in
 * the path can genuinely absorb it. Capture matters: cancelling early
 * still lets Leaflet's own bubble phase handler run and zoom the map, so
 * this suppresses the browser's default and takes nothing away from the
 * map.
 *
 * WHAT IT DOES NOT DO. It does not stop propagation, so nothing else that
 * wants to hear about the wheel is silenced. It does not touch the list
 * pane or the detail pane, which are siblings of this component and scroll
 * exactly as they always did. And it does not zoom the map itself, because
 * a second zoom implementation racing Leaflet's own is how a map ends up
 * moving two levels for one notch.
 */
function WheelOwnership({ shell }: { shell: HTMLElement | null }) {
  useEffect(() => {
    if (!shell) return;
    const onWheel = (event: WheelEvent) => {
      if (canAbsorbWheel(event.target, shell, event.deltaX, event.deltaY)) return;
      /*
        `ctrlKey` on a wheel event is how Chrome and Safari both report a
        trackpad pinch. Cancelling it is what stops the browser zooming
        the whole page; Leaflet reads the same event as a zoom, so the
        gesture still does what the hand expects.
      */
      if (event.cancelable) event.preventDefault();
    };
    shell.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () =>
      shell.removeEventListener("wheel", onWheel, { capture: true } as EventListenerOptions);
  }, [shell]);

  return null;
}

/**
 * Refit the view when the FILTER changes, and never on any other render.
 *
 * The alternative was a "fit to view" button, which is honest and which
 * nobody presses. The alternative to that was refitting whenever the marker
 * set changed at all, which would yank the map out from under a reader
 * every time they marked a prospect as contacted. Keying on a signature the
 * board computes from its filters gets the useful half of the behaviour and
 * none of the rude half.
 *
 * The venue is forced into the bounds whatever is filtered. A map of the
 * schools lane that has scrolled the building off the edge has lost the
 * only fixed point on it.
 */
function FitToFilter({
  signature,
  points,
  fitPoints,
  animate,
  padding,
}: {
  signature: string;
  points: [number, number][];
  fitPoints: [number, number][] | null;
  animate: boolean;
  padding: [number, number];
}) {
  const map = useMap();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (last.current === signature) return;
    last.current = signature;
    /*
      ── THE ONE FILTER THAT DOES NOT KEEP THE BUILDING IN FRAME ──────

      Everywhere else the venue is forced into the bounds, because a map
      of one lane that has scrolled 245 W Birch Street off the edge has
      lost the only fixed point on it. A go-see run is the exception and
      it is worth saying why rather than looking like an oversight.

      A run is six doors inside about half a mile, two or three miles out.
      Framing that against the building means framing five miles to show
      half of one, and the six pins land on top of each other in a corner:
      the reader presses a control that promised a walkable corridor and
      is handed the same territory view they already had. The run is also
      not a claim about the venue at all. It is a claim about six
      organisations being near EACH OTHER, and the frame that makes that
      claim is the one drawn round them.

      The zoom ceiling lifts with it, from 14 to 17, for the same reason.
      Fourteen is a suburb, which is the right ceiling for a filtered
      territory and two levels short of showing half a mile as half a mile.

      Nothing is lost: the building is one press of the fit control away,
      the run is dropped by a chip in the list pane, and the ring note
      still says what the circles are.
    */
    const source = fitPoints ?? [VENUE_POINT, ...points];
    const lats = source.map((p) => p[0]);
    const lngs = source.map((p) => p[1]);
    map.fitBounds(
      [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ],
      { padding, maxZoom: fitPoints ? 17 : 14, animate },
    );
    /*
      The padding is deliberately NOT in the dependency list. It changes
      when the pane crosses the narrow threshold, and refitting on that
      would throw a reader who collapsed the list back to the whole
      territory. It is read at the next filter change instead, which is
      the only moment this map is allowed to move the view.
    */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, points, map, animate]);

  return null;
}


/**
 * Pans to the selected organisation when the selection arrives from
 * somewhere else, typically a card in the list pane.
 *
 * IT DOES NOT REFIT AND IT DOES NOT ZOOM OUT. The reader chose a row; the
 * answer to that is to bring one pin into view at the zoom they are already
 * working at, not to rebuild their view of the territory.
 *
 * The in-view guard is the part worth reading. Clicking a pin on the map
 * also sets the selection, and without the guard the map would slide a
 * couple of hundred pixels every time somebody clicked something they could
 * already see, which reads as the map fighting the reader.
 */
function FocusOn({
  target,
  animate,
}: {
  target: [number, number] | null;
  animate: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!target) return;
    const zoom = map.getZoom();
    if (zoom >= 14 && map.getBounds().pad(-0.18).contains(target)) return;
    map.setView(target, Math.max(zoom, 14), { animate });
  }, [target, map, animate]);

  return null;
}

/**
 * Reports the zoom back to the pane, so the ring label can decide whether
 * it has room to be read.
 *
 * On `zoomend` and on nothing else. A pan cannot change how many pixels a
 * mile is worth, and re-rendering this pane on every frame of a drag to
 * discover that is the quiet way a Leaflet map in React becomes slow.
 */
function ZoomWatch({ onZoom }: { onZoom: (zoom: number) => void }) {
  const map = useMap();

  /*
    After every commit, not only when the map or the handler changes.
    A refit driven from an effect one sibling above this one changes the
    zoom while this component's `zoomend` listener is torn down for the
    same commit, so the event is fired at nobody. `ClusterLayer` carries
    the long version of that argument; the consequence here is smaller
    and the same shape, which is a ring label naming a circle the reader
    has already zoomed past.
  */
  useEffect(() => {
    onZoom(map.getZoom());
  });

  useMapEvent("zoomend", () => onZoom(map.getZoom()));

  return null;
}

/**
 * Says whether a marker popup is open, so the page can move its floating
 * cards out from under it.
 *
 * IT TRACKS THE POPUP INSTANCE RATHER THAN COUNTING EVENTS, and that is
 * the whole reason this is a component and not two lines inline. Leaflet
 * closes the popup being replaced AFTER it has opened the one replacing
 * it, so a reader clicking from one pin straight to the next produces
 * open, open, close, and anything that simply believes the last event it
 * heard concludes that nothing is open while a popup sits on the screen.
 * Comparing the closing popup against the one currently held ignores the
 * stale close and keeps the answer true.
 *
 * Reading the DOM instead was tried and is wrong for a subtler reason:
 * Leaflet leaves a closed popup's element in the container for the length
 * of its fade, so a query would report a popup that has already gone.
 */
function PopupWatch({ onChange }: { onChange: (open: boolean) => void }) {
  const current = useRef<unknown>(null);

  useMapEvent("popupopen", (event) => {
    current.current = event.popup;
    onChange(true);
  });

  useMapEvent("popupclose", (event) => {
    if (event.popup !== current.current) return;
    current.current = null;
    onChange(false);
  });

  return null;
}

/**
 * Tells Leaflet the container changed size.
 *
 * Leaflet caches its container dimensions on load, so a pane that grows
 * when the reader hides the list renders grey down one edge until something
 * else forces a redraw. A ResizeObserver catches every cause of that at
 * once: the list collapsing, the detail pane opening, a window resize and a
 * device rotating. The alternative, a `transitionend` listener on the
 * board, works for exactly one of those four and has to be re-wired every
 * time the layout changes.
 */
function InvalidateOnResize({ target }: { target: HTMLElement | null }) {
  const map = useMap();

  useEffect(() => {
    if (!target || typeof ResizeObserver === "undefined") return;
    /*
      COALESCED INTO ONE CALL PER FRAME.

      Hiding the list animates a grid column from 328 pixels to zero over
      two hundred milliseconds, and a ResizeObserver reports every step of
      that. `invalidateSize` is not free: it re-measures the container,
      recalculates the pixel origin and asks every tile layer to work out
      what it should be loading, and running that a dozen times inside one
      transition is what made the collapse feel heavy on the widest
      layout, which is the one with the most tiles on screen.

      A frame is also exactly the resolution the answer is needed at.
      Nothing on screen can show a size the browser has not painted yet.
    */
    let frame: number | null = null;
    const observer = new ResizeObserver(() => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
        map.invalidateSize({ animate: false });
      });
    });
    observer.observe(target);
    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [target, map]);

  return null;
}

export interface MapCanvasProps {
  /**
   * The rows the board has already filtered. This pane filters nothing.
   *
   * ── A FILTERED OUT ORGANISATION IS NOT DRAWN AT ALL ─────────────
   * The marker contract carries a `muted` flag for exactly this decision,
   * and this pane deliberately never sets it. Two reasons, and the first
   * is arithmetic: the strip says "31 of 102 on the board" and the list
   * shows thirty one cards, so a map showing a hundred and two marks with
   * seventy one of them greyed is a third pane disagreeing with the other
   * two about what the reader is looking at. The second is that a muted
   * mark is still a mark. It takes room in the cluster grid, it can be
   * clicked, and clicking it would open a panel for an organisation the
   * board has just said is not on the board.
   *
   * `muted` earns its place on `/field`, where the run is a route through
   * a chosen few and the rest of the trade area is genuine context for it.
   * Here the filter is the reader's own question, and the honest answer to
   * a question is the rows that answer it.
   */
  rows: DeskLine[];
  selectedId: string | null;
  onSelect: (prospectId: string | null) => void;
  /** Changes to this string refit the view. Nothing else does. */
  fitSignature: string;
  showOutline: boolean;
  /**
   * Opens the full detail pane for an organisation. Falls back to plain
   * selection, so a board that has not wired it yet still works.
   */
  onOpenDetail?: (prospectId: string) => void;
  /**
   * Raises the email compose modal, which the BOARD owns and renders. This
   * pane never imports the modal itself: a map that can open a dialog is a
   * map that has to manage focus return for a dialog, and that job belongs
   * where the dialog is.
   *
   * ── WHY THIS TAKES THE WHOLE UNION NOW ──────────────────────────
   * It used to be narrowed to `"outreach"`, on the reasoning that a type
   * import is a dependency and a pane should not take one on a component
   * it does not own. The reasoning was tidy and the effect was a hole in
   * the product: the map could raise exactly one of the four things a rep
   * can write, so the promo, the date hold and the free draft were
   * reachable from the panel and from nowhere on the map. A person who
   * clicked a pin because that is how they think about their territory
   * found one button where the panel offers four.
   *
   * A `type` import costs nothing at runtime and is erased at build. The
   * missing three cost a rep the reason they opened the map. So the union
   * is imported and the pane raises all four.
   */
  onCompose?: (
    prospect: Prospect,
    intent: ComposeIntent,
    packageId?: string,
  ) => void;
  /**
   * Raised whenever a marker popup opens or closes.
   *
   * The page needs this because a popup and a floating card can want the
   * same corner of a narrow map column, and only the page knows which
   * cards it put in the overlay. This pane reports the fact and takes no
   * view about what should be done with it.
   */
  onPopupChange?: (open: boolean) => void;
  /**
   * The stops of a go-see run, in walk order, drawn as one path.
   *
   * ── WHY A LINE IS WORTH MORE HERE THAN ANY CARD ─────────────────
   * A hundred pins on a basemap tell a reader where things are, which
   * they knew. What a territory map is FOR is the relationship between
   * them: that four of these doors sit on one road and can be walked in
   * an afternoon for the cost of parking once. A card can assert that in
   * a sentence and a reader has to take it on trust. A line through the
   * four pins is the claim itself, which is the difference between a map
   * and a picture of a map.
   *
   * The pane takes the points and no opinion about them. It does not
   * know what a run is, it does not choose one, and it does not refit
   * for one: taking a run is a filter change one level up, and the fit
   * signature already carries filter changes.
   */
  runPath?: [number, number][] | null;
  /** The path's accessible name, written once by the run selector. */
  runLabel?: string;
  /**
   * True when the run is narrowing the board rather than merely being
   * offered, which is the only condition under which the view is framed
   * on the run instead of on the trade area. The pane cannot work this
   * out for itself: an offered run is drawn and a taken one is drawn
   * identically, and the difference is a filter the board owns.
   */
  runOnBoard?: boolean;
  /** Floating cards, rendered over the map by the page. */
  children?: ReactNode;
}

export function MapCanvas({
  rows,
  selectedId,
  onSelect,
  fitSignature,
  showOutline,
  onOpenDetail,
  onCompose,
  onPopupChange,
  runPath,
  runLabel,
  runOnBoard = false,
  children,
}: MapCanvasProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [tilesFailed, setTilesFailed] = useState(false);
  const tileFailures = useRef(0);
  /*
    ── TWO PIECES OF STATE FOR ONE STRIP, AND WHY IT IS NOT ONE ──────

    The credits open on hover and they open on a press, and a single
    boolean toggled by both produces a control that visibly does nothing.
    A pointer arriving at the "i" opens the strip; the click that follows
    then toggles the same flag closed, so the reader presses a control
    that is plainly there and watches the thing they were reading vanish.

    Splitting them fixes it without a special case. Hover is transient and
    the press is a pin, the strip is open while either is true, and the
    press therefore reads as "keep this" rather than as "toggle this".
    Pressing again unpins, which on a touch device closes it immediately
    because there is no hover to hold it, and on a desk closes it when the
    pointer leaves, which is exactly what a person expects of something
    they are still pointing at.
  */
  const [creditsHovered, setCreditsHovered] = useState(false);
  const [creditsPinned, setCreditsPinned] = useState(false);
  const creditsOpen = creditsHovered || creditsPinned;
  /*
    The shell is held in state rather than in a ref because the resize
    watcher needs a render to fire once the element exists. A ref would
    still be null on the pass that mounts the observer, and the pane would
    never learn that the list had collapsed.
  */
  const [shell, setShell] = useState<HTMLDivElement | null>(null);
  /*
    THE PANE'S OWN WIDTH, WHICH IS NOT THE WINDOW'S.

    Everything narrow on this screen is decided from this number rather
    than from a media query, because the same browser hands this component
    940 pixels with the list collapsed and 180 with three panes open, and
    it is the box the map is drawn in that decides whether a ring label
    has anywhere to go.

    WHAT IS HELD IS THE ANSWER, NOT THE MEASUREMENT. This used to be the
    pane's width in pixels. Every question asked of it is a threshold
    question, and holding the raw number meant that collapsing the list,
    which animates a column from 328 pixels to zero over two hundred
    milliseconds, pushed a dozen new widths through `useState` and
    re-rendered this whole pane a dozen times to arrive at the same two
    booleans it started with.

    Storing the boolean instead means React's own identity check stops
    every one of those renders dead, and the pane re-renders exactly
    twice: once when it is first measured, and again only if the reader
    crosses the threshold. `null` is the third state and it is load
    bearing: the very first fit must not run against a guess, so it waits
    until the box has actually been measured.
  */
  const [narrowPane, setNarrowPane] = useState<boolean | null>(null);

  const measure = useCallback((node: HTMLElement) => {
    const width = node.getBoundingClientRect().width;
    if (width <= 0) return;
    setNarrowPane(width < NARROW_PANE_PX);
  }, []);

  const attachShell = useCallback(
    (node: HTMLDivElement | null) => {
      setShell(node);
      if (node) measure(node);
    },
    [measure],
  );

  useEffect(() => {
    if (!shell || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => measure(shell));
    observer.observe(shell);
    return () => observer.disconnect();
  }, [shell, measure]);

  const narrow = narrowPane === true;
  const measured = narrowPane !== null;
  const fitPadding = narrow ? FIT_PADDING_NARROW : FIT_PADDING_WIDE;

  const [zoom, setZoom] = useState(12);
  const handleZoom = useCallback((next: number) => setZoom(next), []);

  /**
   * ── ONE RING CARRIES A LABEL, NOT THREE ──────────────────────────
   *
   * All three rings used to be labelled, on the reasoning that a reader
   * should be able to name any circle without consulting a key. What that
   * produced was three 130 pixel pills on one bearing, spaced by whatever
   * a mile happened to be worth at the current zoom, marching over the
   * streets and over each other. On a handset the spacing was 18 pixels,
   * which is the height of a pill, so the three collapsed into two
   * unreadable fragments across the venue plate.
   *
   * The rule now is one label, on the arc of the INNERMOST ring that can
   * clear the venue plate at this zoom. Innermost rather than outermost is
   * the whole decision, and it is not arbitrary: as a reader zooms in, the
   * rings leave the screen from the outside, so the innermost readable
   * ring is always the one still fully drawn and is always the tightest
   * boundary around what they are actually looking at. At the territory
   * zoom that is five miles, which is the edge of the trade area. Two
   * levels in it becomes one mile, which is the walkable ring, and the
   * five mile arc has left the container by then anyway.
   *
   * THE OTHER TWO ARE NOT LOST. They are named, with their distances, in
   * the note in the corner, which is one line of plain words that is now
   * permanently on screen rather than an occasional stand-in. Two channels
   * for three rings, and neither of them is three pills over a street.
   *
   * The alternatives, for the next reader: labelling on hover was rejected
   * because a ring is not hoverable on a touch screen and these rings are
   * deliberately non-interactive, so hover would have hidden the claim
   * from every phone. Moving the whole key into the legend was rejected
   * because the legend is collapsed by default and a claim in a closed
   * drawer is a claim nobody reads.
   */
  const labelledRing = useMemo(() => {
    if (narrow) return null;
    const perMile = pixelsPerMile(zoom);
    return (
      RINGS.find(
        (ring) => ring.miles * perMile * Math.SQRT1_2 >= RING_LABEL_MIN_OFFSET_PX,
      ) ?? null
    );
  }, [narrow, zoom]);

  const points = useMemo<[number, number][]>(
    () => rows.map((r) => [r.prospect.lat, r.prospect.lng]),
    [rows],
  );

  const outline = useMemo<LatLng[]>(
    () =>
      showOutline
        ? convexHull(rows.map((r) => ({ lat: r.prospect.lat, lng: r.prospect.lng })))
        : [],
    [rows, showOutline],
  );

  /*
    The four figures in the summary paragraph are derived from the same
    `rows` array the stat bar and the list pane are handed, with the same
    predicates, so they cannot disagree with either of them. They are
    counted in one pass because a hundred rows recounted four times on every
    pan is work nobody asked for.
  */
  const summary = useMemo(() => {
    let insideThree = 0;
    let writtenDoor = 0;
    let formOnly = 0;
    let noDoor = 0;
    for (const row of rows) {
      if (row.miles <= 3) insideThree += 1;
      if (row.prospect.emailConfidence === "verified_public") writtenDoor += 1;
      if (row.prospect.emailConfidence === "form_only") formOnly += 1;
      if (row.prospect.emailConfidence === "none") noDoor += 1;
    }
    return { insideThree, writtenDoor, formOnly, noDoor };
  }, [rows]);

  const selectedPoint = useMemo<[number, number] | null>(() => {
    if (!selectedId) return null;
    const row = rows.find((r) => r.prospect.id === selectedId);
    return row ? [row.prospect.lat, row.prospect.lng] : null;
  }, [rows, selectedId]);

  /*
    LEAFLET MAKES ITS CONTAINER FOCUSABLE AND THEN LEAVES IT ANONYMOUS.

    A keyboard reader tabs into a div with a tabindex, no role and no name,
    and is told nothing at all. React Leaflet passes only className, id and
    style through to that div, so the name has to be set on the element
    once the map exists. It says what the region is and what the keys do,
    because arrow keys panning a map is not something a reader can be
    expected to guess.
  */
  useEffect(() => {
    if (!map) return;
    const container = map.getContainer();
    container.setAttribute("role", "region");
    container.setAttribute(
      "aria-label",
      "Maps. The scroll wheel zooms it, arrow keys pan it, the plus and minus keys zoom it, and the list beside the map carries the same organisations as text.",
    );
  }, [map]);

  /*
    THE MOTION OPTIONS ARE SET AT CONSTRUCTION AND CORRECTED AFTERWARDS.

    Leaflet reads `zoomAnimation` once, when it builds its panes, so a
    reader who turns reduced motion on mid-session would otherwise keep
    the animated zoom until the route is remounted. The properties below
    are read at event time rather than at construction, so writing them
    here catches the change for the inertia and the wheel; the animation
    flags are handled by the stylesheet, which has a `prefers-reduced-motion`
    block that stops Leaflet's own hardcoded transitions dead.
  */
  useEffect(() => {
    if (!map) return;
    map.options.inertia = !reducedMotion;
    map.options.inertiaDeceleration = INERTIA_DECELERATION;
    map.options.easeLinearity = EASE_LINEARITY;
  }, [map, reducedMotion]);

  const openDetail = useCallback(
    (prospectId: string) => {
      if (onOpenDetail) onOpenDetail(prospectId);
      else onSelect(prospectId);
    },
    [onOpenDetail, onSelect],
  );

  /**
   * ── A CLUSTER ALWAYS OPENS, AND IT ALWAYS MOVES ──────────────────
   *
   * This used to be a plain `fitBounds` on the cluster's extent, and it
   * had a dead end in it that is easy to miss and impossible to
   * misinterpret once it happens to you. Several organisations at almost
   * the same coordinate, a school and its district office at one address,
   * produce a cluster whose bounds are a few metres across. `fitBounds`
   * answers that with the maximum zoom, which is capped, and if the reader
   * is already at or beyond that cap the map does not move at all. A
   * bubble that says "zoom in to separate them" and then does nothing when
   * pressed is the single most prototype-feeling thing a map can do.
   *
   * So the target zoom is computed rather than delegated: the natural fit
   * for the extent, floored at one level beyond wherever the reader
   * currently is, capped at the basemap's own maximum. The move is a fly
   * rather than a jump because a cluster expanding is the one moment on
   * this map where a reader genuinely needs to keep track of where the
   * marks went, and half a second of travel is what carries that.
   */
  const handleZoomToCluster = useCallback(
    (bounds: [[number, number], [number, number]]) => {
      if (!map) return;
      const centre: [number, number] = [
        (bounds[0][0] + bounds[1][0]) / 2,
        (bounds[0][1] + bounds[1][1]) / 2,
      ];
      const natural = map.getBoundsZoom(
        bounds,
        false,
        L.point(fitPadding[0] * 2, fitPadding[1] * 2),
      );
      const target = Math.min(
        map.getMaxZoom(),
        Math.max(Math.min(natural, CLUSTER_MAX_ZOOM), map.getZoom() + 1),
      );
      if (reducedMotion) {
        map.setView(centre, target, { animate: false });
        return;
      }
      map.flyTo(centre, target, {
        duration: CLUSTER_FLY_SECONDS,
        easeLinearity: EASE_LINEARITY,
      });
    },
    [map, reducedMotion, fitPadding],
  );

  /*
    Closing a popup clears the selection only when the popup that closed
    belongs to the organisation currently selected. Leaflet fires
    `popupclose` on the OLD marker after it has already fired `popupopen` on
    the new one, so without this test clicking from one pin straight to
    another would open the second and then immediately deselect it.
  */
  const handlePopupClose = useCallback(
    (prospectId: string) => {
      if (selectedId === prospectId) onSelect(null);
    },
    [selectedId, onSelect],
  );

  const handleTileError = useCallback(() => {
    tileFailures.current += 1;
    if (tileFailures.current >= TILE_FAILURES_BEFORE_NOTICE) setTilesFailed(true);
  }, []);

  /*
    `zoomIn` and `zoomOut` rather than `setZoom(getZoom() + n)`, so the
    buttons, the plus and minus keys and the wheel all go through the same
    code path in Leaflet and therefore land on the same zoom levels. Two
    routes to the same control that disagree by a fraction of a level is
    how a map ends up with blurred tiles nobody can explain.
  */
  const zoomIn = useCallback(() => {
    map?.zoomIn(1, { animate: !reducedMotion });
  }, [map, reducedMotion]);

  const zoomOut = useCallback(() => {
    map?.zoomOut(1, { animate: !reducedMotion });
  }, [map, reducedMotion]);

  const fitEverything = useCallback(() => {
    if (!map) return;
    const all = [VENUE_POINT, ...points];
    const lats = all.map((p) => p[0]);
    const lngs = all.map((p) => p[1]);
    map.fitBounds(
      [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ],
      { padding: fitPadding, maxZoom: 14, animate: !reducedMotion },
    );
  }, [map, points, reducedMotion, fitPadding]);

  /*
    ── THE MARKS ARE BUILT ONLY WHEN THE MARKS CHANGE ────────────────

    This is the one memo on the page that is about speed rather than
    tidiness, and it is worth the words.

    `MapBoard` holds every piece of page state in one component: the
    selected tab of the detail panel, whether the key is open, which of
    the four offers is showing. Changing any of them re-renders the
    board, which re-renders this pane, which until now re-rendered the
    cluster layer, which rebuilds a `divIcon` for each of up to a hundred
    and two organisations and hands every one of them to Leaflet's
    `setIcon`. `setIcon` replaces the marker's element in the document.
    So pressing "next offer" on a card in the corner tore down and rebuilt
    every pin on the map, and the reader saw the whole board flicker for
    a control that has nothing to do with it.

    Holding the layer in a memo keyed on what it actually draws means the
    pins are rebuilt when the rows, the selection or the popup wiring
    change, and on no other render. Everything in the dependency list is
    either a prop or already wrapped in `useCallback` one level up, which
    is what makes the list honest rather than decorative. The layer itself
    then caches the icons, so even a render that does get through costs
    nothing at the DOM.
  */
  const clusterLayer = useMemo(
    () => (
      <ClusterLayer
        popupPaddingTopLeft={
          narrow ? POPUP_PAD_TOP_LEFT_NARROW : POPUP_PAD_TOP_LEFT_WIDE
        }
        popupPaddingBottomRight={
          narrow ? POPUP_PAD_BOTTOM_RIGHT_NARROW : POPUP_PAD_BOTTOM_RIGHT_WIDE
        }
        rows={rows}
        selectedId={selectedId}
        onSelectProspect={onSelect}
        onPopupClose={handlePopupClose}
        onZoomToCluster={handleZoomToCluster}
        renderPopup={(row) => (
          <ProspectMapPopup
            line={row}
            onOpenDetail={() => openDetail(row.prospect.id)}
            onCompose={onCompose}
          />
        )}
      />
    ),
    [
      narrow,
      rows,
      selectedId,
      onSelect,
      handlePopupClose,
      handleZoomToCluster,
      openDetail,
      onCompose,
    ],
  );

  /*
    The building, and the one ring label, on the same principle. Both
    build a `divIcon` from a template, both are handed to a `Marker`, and
    both were rebuilt on every render of this pane for no reason at all.
    The venue mark never changes; the label changes only when the ring it
    names changes.
  */
  const venueMark = useMemo(() => venueIcon(VENUE.name), []);
  const ringLabel = useMemo(
    () =>
      labelledRing
        ? {
            ring: labelledRing,
            icon: ringLabelIcon(`${labelledRing.miles} mi straight line`),
            at: ringLabelPoint(labelledRing.miles),
          }
        : null,
    [labelledRing],
  );

  return (
    <div
      className={styles.canvas}
      ref={attachShell}
      data-narrow={narrow ? "yes" : "no"}
    >
      {/*
        A map is a graphic and a screen reader gets nothing from it. This
        paragraph carries the same four facts the stat bar carries, it is
        polite rather than assertive so it is read after a filter settles
        rather than interrupting the reader mid-word, and it says out loud
        that the list beside the map is the real route to every row on it.
      */}
      <p className="visually-hidden" role="status" aria-live="polite">
        {rows.length} organisations plotted around Main Event Brea, which is not
        open. {summary.insideThree} of them are inside three straight line miles,{" "}
        {summary.writtenDoor} publish an email address, {summary.formOnly}{" "}
        publish a contact form and no address, and {summary.noDoor}{" "}
        publish no written door at all. The list beside the map carries the same
        organisations as text. The three broken circles are one, three and five
        straight line miles from 245 W Birch Street, and they are not drive
        times.
        {/* A path drawn between four pins says nothing at all to a screen
            reader, so the same claim is made in a sentence. It is the
            selector's own wording, so the line on the map and the card in
            the panel cannot describe the run two different ways. */}
        {runLabel ? ` A go-see run is marked on the map. ${runLabel}` : null}
      </p>

      <MapContainer
        ref={setMap}
        center={VENUE_POINT}
        zoom={12}
        /*
          ON, AND TUNED. See the block at the top of this file for the
          argument: the route is a takeover, there is nothing behind the
          map to scroll, and a territory map that ignores the wheel is a
          map that feels broken before a reader has read a word of it. The
          two constants are what turn Leaflet's default lurch into a step.
        */
        scrollWheelZoom
        wheelPxPerZoomLevel={WHEEL_PX_PER_ZOOM_LEVEL}
        wheelDebounceTime={WHEEL_DEBOUNCE_MS}
        /* Two fingers on a trackpad and two fingers on a touch screen are
           different events and both have to zoom. Leaflet defaults both
           on; they are named here so that nobody switching one off later
           does it by accident. */
        touchZoom
        doubleClickZoom
        /* Shift and drag draws a box and zooms to it. It is the one
           gesture a person who works a territory every day will look for
           and the one nobody discovers by accident, so it costs nothing
           to keep and it is worth having. */
        boxZoom
        /*
          A MAP COASTS. Without this a drag stops the instant the pointer
          is released, which is how a table scrolls, not how a map moves.
        */
        inertia={!reducedMotion}
        inertiaDeceleration={INERTIA_DECELERATION}
        easeLinearity={EASE_LINEARITY}
        zoomAnimation={!reducedMotion}
        fadeAnimation={!reducedMotion}
        markerZoomAnimation={!reducedMotion}
        /* Leaflet's own control would land under the board's chrome in the
           top left corner. Ours is drawn in the overlay layer, at a real
           hit target size, with words in its labels. */
        zoomControl={false}
        /*
          Leaflet's attribution control is off because this pane draws its
          own, immediately below. The credit itself is NOT off: the
          OpenStreetMap ODbL and the CARTO basemap terms both require it,
          it is on screen at all times, and it is in the document whether
          it is expanded or not.
        */
        attributionControl={false}
        /* Arrow keys pan, plus and minus zoom, once the container has
           focus. Leaflet gives the container a tabindex for this, so the
           map is a single stop in the tab order rather than a hole in it. */
        keyboard
        className={styles.map}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
          /*
            TWO SETTINGS THAT ARE ABOUT HOW THE MAP FEELS, NOT HOW IT LOOKS.

            `keepBuffer` is how many rings of tiles outside the container
            Leaflet holds on to. The default of two means a firm pan runs
            off the edge of what has been kept and paints grey until the
            network answers. Three is one more ring, which is roughly a
            third of a screen in every direction, and it is the difference
            between a pan that glides and a pan that flickers.

            `updateWhenZooming` off stops Leaflet requesting tiles for
            every intermediate scale WHILE a zoom animation is running.
            Those requests are thrown away the moment the animation lands
            on its real level, and issuing them is work taken directly out
            of the frames the animation needs.
          */
          keepBuffer={3}
          updateWhenZooming={false}
          eventHandlers={{ tileerror: handleTileError }}
        />

        {/*
          Held back for one commit, until the pane has been measured. The
          fit that matters most is the first one, and running it before
          this component knows whether it is drawing on a handset or on a
          desk would spend the phone's zoom level on padding it does not
          have room for.
        */}
        {measured ? (
          <FitToFilter
            signature={fitSignature}
            points={points}
            /* Only when the run is actually on the board. An offered run
               is drawn but never framed, because a reader arriving on
               this screen is owed the territory before anything else. */
            fitPoints={runOnBoard && runPath && runPath.length >= 2 ? runPath : null}
            animate={!reducedMotion}
            padding={fitPadding}
          />
        ) : null}
        <FocusOn target={selectedPoint} animate={!reducedMotion} />
        <InvalidateOnResize target={shell} />
        <ZoomWatch onZoom={handleZoom} />
        {onPopupChange ? <PopupWatch onChange={onPopupChange} /> : null}

        {/*
          The outline is the convex hull of whatever is plotted and it is
          cosmetic. It is labelled as such in the key, because a shape drawn
          round a set of pins reads as a catchment boundary, and this one is
          not a claim about where custom comes from. It is a claim about
          where these organisations happen to be.
        */}
        {outline.length >= 3 ? (
          <Polygon
            className={styles.outline}
            positions={outline.map((p) => [p.lat, p.lng] as [number, number])}
            interactive={false}
          />
        ) : null}

        {/*
          THE RINGS STAY ON THE SVG RENDERER, DELIBERATELY.

          `preferCanvas` is the obvious answer to "make the vectors cheaper
          on a pan" and it cannot be used here. A canvas renderer paints
          paths directly and ignores the class name entirely, and these
          rings take their stroke, their dash and their opacity from the
          design tokens through the stylesheet rather than from a literal
          handed to Leaflet. Canvas would trade three tokens for three hex
          values in a props object, which is the exact thing the marker
          system exists to prevent, and it would buy almost nothing: four
          paths is not what makes a map stutter, a hundred DOM icons is,
          and those are not vectors at all.
        */}
        {RINGS.map((ring) => (
          <Circle
            key={ring.miles}
            className={styles.ring}
            center={VENUE_POINT}
            radius={ring.miles * METRES_PER_MILE}
            interactive={false}
          />
        ))}

        {/*
          THE RUN PATH. Two strokes on the same points: a wide, quiet one
          underneath and a dashed one over it.

          The pair is not decoration, it is what keeps the line legible over
          a basemap this pane does not control. A single stroke either
          disappears into a road of the same weight or, drawn heavy enough
          not to, reads as a road itself. A halo under a dash is a mark that
          is plainly drawn ON the map rather than part of it, at every zoom
          and over any tile, and both strokes are value contrasts rather
          than a hue, so the run survives the same greyscale test every
          other signal on this board has to pass.

          Neither is interactive. The path annotates the pins; the pins are
          the controls, and a fat line lying over them that swallowed
          clicks would take four organisations off the board to say
          something about them.
        */}
        {runPath && runPath.length >= 2 ? (
          <>
            <Polyline
              className={styles.runHalo}
              positions={runPath}
              interactive={false}
            />
            <Polyline
              className={styles.runPath}
              positions={runPath}
              interactive={false}
            />
          </>
        ) : null}

        {ringLabel ? (
          <Marker
            key={`label-${ringLabel.ring.miles}`}
            position={ringLabel.at}
            icon={ringLabel.icon}
            /*
              The argument the old rail used to make in a panel travels
              with the label, because this layout has no rail to hold it
              and the claim has to survive the layout change. Nothing on
              this screen may imply a ring is a drive time.
            */
            title={`${ringLabel.ring.miles} straight line miles from 245 W Birch Street, not a drive time. ${ringLabel.ring.note}`}
            interactive={false}
            keyboard={false}
            /* Above the pins. A ring label a marker can hide is a ring
               nobody can name, and naming it is the whole reason it is
               drawn. */
            zIndexOffset={500}
          />
        ) : null}

        {/*
          Forced above every prospect mark. Leaflet stacks markers by
          latitude, and there are organisations north of Birch Street that
          would otherwise sit on top of the one building this entire
          application is about.
        */}
        <Marker
          position={VENUE_POINT}
          icon={venueMark}
          title={`${VENUE.name}, not open yet`}
          zIndexOffset={1000}
        >
          <Popup
            autoPanPaddingTopLeft={
              narrow ? POPUP_PAD_TOP_LEFT_NARROW : POPUP_PAD_TOP_LEFT_WIDE
            }
            autoPanPaddingBottomRight={
              narrow
                ? POPUP_PAD_BOTTOM_RIGHT_NARROW
                : POPUP_PAD_BOTTOM_RIGHT_WIDE
            }
          >
            <div className={styles.popup}>
              <p className={styles.popupKicker}>The venue</p>
              <h3 className={styles.popupName}>{VENUE.name}</h3>
              <p className={styles.popupLine}>
                {VENUE.address}, {VENUE.city} {VENUE.postalCode}
              </p>
              <p className={styles.popupLine}>{VENUE.phone}</p>
              <p className={styles.popupNotOpen}>
                <span aria-hidden="true">◌</span> Not open yet. Main Event
                publishes an address, a phone number and a coming soon form for
                this location, and no hours and no opening date.
              </p>
              <p className={styles.popupProv}>
                <ProvenanceBadge provenance="public" />
                <a href={VENUE.source} target="_blank" rel="noreferrer noopener">
                  The page this was read from
                </a>
              </p>
            </div>
          </Popup>
        </Marker>

        {clusterLayer}
      </MapContainer>

      <WheelOwnership shell={shell} />

      {/*
        The overlay layer is inert. Only the cards the page puts in it take
        pointer events, so a floating legend never becomes a hole in the
        middle of the map that a drag cannot cross.
      */}
      <div className={styles.overlay}>
        {children}

        {/*
          THE RING KEY, IN WORDS, PERMANENTLY.

          One line, always on, no control to open and nothing to press. It
          used to appear only when a ring label could not fit, which meant
          the sentence that matters most on this map came and went as the
          reader zoomed. Now that exactly one ring is ever labelled, this
          is the thing carrying the other two, so it is unconditional.

          It says the part that actually decides how a morning is planned,
          which is that a circle on a territory map is not a drive time.
          The key says it at length; a key that is collapsed on a phone
          says it to nobody.
        */}
        <p className={styles.ringNote}>
          <span className={styles.ringNoteGlyph} aria-hidden="true">
            ◌
          </span>
          <span>
            The circles are 1, 3 and 5 straight line miles from the building.
            They are not drive times.
          </span>
        </p>

        <div className={styles.zoomBar} role="group" aria-label="Map zoom">
          <button
            type="button"
            className={styles.zoomButton}
            onClick={zoomIn}
            title="Zoom in"
          >
            <span aria-hidden="true">+</span>
            <span className="visually-hidden">Zoom in</span>
          </button>
          <button
            type="button"
            className={styles.zoomButton}
            onClick={zoomOut}
            title="Zoom out"
          >
            <span aria-hidden="true">&minus;</span>
            <span className="visually-hidden">Zoom out</span>
          </button>
          <button
            type="button"
            className={styles.zoomButton}
            onClick={fitEverything}
            title="Fit everything that is plotted, including the building"
          >
            <span aria-hidden="true">▣</span>
            <span className="visually-hidden">
              Fit everything that is plotted
            </span>
          </button>
        </div>

        {/*
          ── THE CREDITS, WHICH ARE A LICENCE CONDITION ──────────────

          The OpenStreetMap ODbL and the CARTO basemap terms both require
          the credit to be shown. It is not optional and it is not going
          anywhere. What it does not have to be is a 250 pixel grey strip
          lying across the corner of a working map, which is what
          Leaflet's own control draws, and which on this screen also
          carried a "Leaflet" plug that no licence asks for at all.

          So it is compacted into the affordance every mapping product
          uses: a small "i", one press or one hover from the full credit,
          with both source links live. That is the treatment OpenStreetMap
          itself documents as acceptable for a constrained surface, and
          the credit is reachable in exactly one action from anywhere on
          the map.

          IT IS NEVER REMOVED FROM THE DOCUMENT. Collapsed, the sentence
          is still in the DOM and still in the accessibility tree, so a
          screen reader hears the credit whether or not anybody pressed
          anything. Focus moving into the collapsed sentence opens it, so
          a keyboard reader tabbing to the OpenStreetMap link can see
          where they are rather than chasing an invisible target.
        */}
        <div
          className={styles.credits}
          data-open={creditsOpen ? "yes" : "no"}
          onMouseEnter={() => setCreditsHovered(true)}
          onMouseLeave={() => setCreditsHovered(false)}
          /*
            Focus reaching one of the two LINKS pins the strip open, so a
            keyboard reader is never chasing a target they cannot see.
            Focus reaching the button does not, because a press moves
            focus to the button first and pinning there would leave the
            press with nothing left to do: a tap on a touch device would
            open the strip on focus and close it again on click, which
            reads as a control that does not work.
          */
          onFocusCapture={(event) => {
            if (!(event.target as HTMLElement).closest("button")) {
              setCreditsPinned(true);
            }
          }}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setCreditsPinned(false);
            }
          }}
        >
          <p className={styles.creditsText}>
            Map data{" "}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noreferrer noopener"
            >
              OpenStreetMap
            </a>{" "}
            contributors. Tiles{" "}
            <a
              href="https://carto.com/attributions"
              target="_blank"
              rel="noreferrer noopener"
            >
              CARTO
            </a>
            .
          </p>
          <button
            type="button"
            className={styles.creditsButton}
            aria-expanded={creditsOpen}
            aria-label="Map credits. Map data from OpenStreetMap contributors, basemap tiles from CARTO."
            title="Map credits"
            onClick={() => setCreditsPinned((pinned) => !pinned)}
          >
            <span aria-hidden="true">i</span>
          </button>
        </div>

        {tilesFailed ? (
          <p className={styles.tileNote} role="status">
            <span className={styles.tileNoteGlyph} aria-hidden="true">
              ◌
            </span>
            <span>
              The background map could not be loaded, so the ground is blank.
              Every mark is still in its correct place, and the list beside the
              map carries the same organisations as text.
            </span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
