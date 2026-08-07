import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Polygon,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { ACCOUNTS, ACCOUNT_SEED_IDS } from "@/data/accounts";
import { DISTRIBUTOR_BY_ID, TERRITORY_BY_ID } from "@/data/trade";
import { CHANNEL_META } from "@/domain/channels";
import { accountIcon, distributorIcon } from "@/lib/map/markerIcons";
import { useTerritory, useTerritoryDispatch } from "@/state/TerritoryProvider";
import { usePlan, accountsInPlan } from "@/state/PlanProvider";
import { rankAccountsByOpportunity } from "@/domain/selectors/opportunity";
import { voidsForAccount, haversineMiles } from "@/domain/selectors/distribution";
import { convexHull } from "@/lib/map/hull";
import { useOutbox } from "@/state/OutboxProvider";
import { openIssues } from "@/domain/selectors/issues";
import styles from "./TerritoryMap.module.css";

/**
 * The territory map.
 *
 * Basemap is CARTO Positron rather than default OpenStreetMap raster.
 * That single choice does more for perceived quality than any amount of
 * CSS: OSM's default tiles are dense, saturated, and instantly read as a
 * hobby project, while Positron is quiet enough that the markers are the
 * subject. No API key, no billing risk on a public URL.
 *
 * There is deliberately no clustering library. Twenty markers do not need
 * one, and adding markercluster here would be dependency theatre.
 */

const CARTO_URL =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
/**
 * Attribution stays. It is a licence condition, not a design choice.
 *
 * OpenStreetMap data is ODbL, which requires crediting the contributors,
 * and CARTO's free basemap terms require crediting CARTO. Stripping it
 * would breach both on a page that is being used to demonstrate
 * professional judgment, which is the worst possible place to cut that
 * corner.
 *
 * What it does NOT have to be is a text label sitting on the map. It is
 * collapsed behind a quiet mark that opens on hover or on focus, which is
 * the same pattern Leaflet itself uses on small screens and is accepted
 * practice under OSM's attribution guidelines: one interaction away, on
 * the map, and reachable by keyboard. The Leaflet plug is dropped because
 * that one is courtesy rather than obligation.
 */
/** The two credits the licences actually require, and their canonical URLs. */
const MAP_CREDITS = [
  { label: "OpenStreetMap", href: "https://www.openstreetmap.org/copyright" },
  { label: "CARTO", href: "https://carto.com/attributions" },
];

/**
 * The credit, collapsed.
 *
 * `:focus-within` rather than a click handler and a piece of state. The
 * panel has to open for a keyboard user before they can tab into the
 * links, and focus-within does that for free — the mark is focusable, so
 * tabbing to it opens the panel and the next two tabs land on the links.
 * A useState version would need onFocus, onBlur, and a relatedTarget
 * check to avoid closing before the link is reached.
 */
function MapCredit() {
  return (
    <span className={styles.credit}>
      <button
        type="button"
        className={styles.creditMark}
        aria-label="Map data credits"
      >
        <span aria-hidden="true">i</span>
      </button>
      <span className={styles.creditPanel} role="note">
        Map data{" "}
        {MAP_CREDITS.map((c, i) => (
          <span key={c.href}>
            {i > 0 ? " · " : ""}
            <a href={c.href} target="_blank" rel="noreferrer noopener">
              {c.label}
            </a>
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * Fit the view to the territory.
 *
 * Order of operations is the whole bug this fixes. Leaflet computes a fit
 * zoom from the container size it currently believes it has, and at mount
 * the pane is still being laid out by the grid, so that belief is wrong.
 * The old code fit first and called invalidateSize 260ms later, which
 * corrected the SIZE and left the ZOOM computed against the old one. The
 * map landed centred between Santa Fe Springs and Rowland Heights, zoomed
 * far enough in that every store sat off screen and the only thing
 * visible was the Southern Glazer's warehouse marker sitting alone in Norwalk.
 *
 * Measure first, then fit. Twice, because the drawer opening changes the
 * width again on the frame after paint.
 */
function FitToAccounts({ ids }: { ids: string }) {
  const map = useMap();
  useEffect(() => {
    if (ACCOUNTS.length === 0) return;

    const fit = () => {
      map.invalidateSize({ animate: false });
      const bounds = L.latLngBounds(
        ACCOUNTS.map((a) => [a.lat, a.lng] as [number, number]),
      );
      const distributor = DISTRIBUTOR_BY_ID["southern-glazers-cerritos"];
      if (distributor && distributor.lat !== 0) {
        bounds.extend([distributor.lat, distributor.lng]);
      }
      map.fitBounds(bounds, { padding: [56, 56], animate: false });
    };

    const raf = requestAnimationFrame(fit);
    const settle = window.setTimeout(fit, 320);

    /* And once more if the pane is ever resized under us, which is what
       happens every time the account list or the drawer toggles. */
    const container = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize({ animate: false }));
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
      ro.disconnect();
    };
    // `ids` is a stable digest of the account set, so this refits when the
    // territory changes and not on every render.
  }, [map, ids]);
  return null;
}

/**
 * Leaflet measures its container once at mount. The drawer and the list
 * both change the container width, and without this the map keeps the
 * stale size and renders grey bands where tiles were never requested.
 */
function ResizeOnLayout({ signal }: { signal: string }) {
  const map = useMap();
  useEffect(() => {
    const t = window.setTimeout(() => map.invalidateSize(), 260);
    return () => window.clearTimeout(t);
  }, [map, signal]);
  return null;
}

/**
 * Open issues per account, computed once for the whole map rather than
 * per marker. Twenty seven markers each recomputing the register would run
 * the same derivation twenty seven times on every pan.
 */
function useIssueCounts(): Record<string, number> {
  const plan = usePlan();
  const { sent } = useOutbox();
  return useMemo(() => {
    const nowMs = Date.parse("2026-08-07T00:00:00Z");
    const counts: Record<string, number> = {};
    for (const i of openIssues({ plan, sent, nowMs })) {
      if (!i.accountId) continue;
      counts[i.accountId] = (counts[i.accountId] ?? 0) + 1;
    }
    return counts;
  }, [plan, sent]);
}

export function TerritoryMap({ visibleAccountIds }: { visibleAccountIds: string[] }) {
  const territory = useTerritory();
  const dispatch = useTerritoryDispatch();
  const plan = usePlan();
  const [tilesFailed, setTilesFailed] = useState(false);
  const tileErrors = useRef(0);

  const distributor = DISTRIBUTOR_BY_ID[territory.distributorId];
  const inPlan = useMemo(() => accountsInPlan(plan), [plan]);
  const issueCounts = useIssueCounts();

  const opportunity = useMemo(
    () =>
      Object.fromEntries(
        rankAccountsByOpportunity(
          territory.distributorId,
          territory.opportunityWeights,
        ).map((o) => [o.accountId, o.total]),
      ),
    [territory.distributorId, territory.opportunityWeights],
  );

  const visible = useMemo(
    () => new Set(visibleAccountIds),
    [visibleAccountIds],
  );

  const shown = useMemo(
    () => ACCOUNTS.filter((a) => visible.has(a.id)),
    [visible],
  );

  /** Route line from the facility through planned accounts, nearest first. */
  const routeLine = useMemo(() => {
    if (!distributor || distributor.lat === 0) return null;
    const stops = ACCOUNTS.filter((a) => inPlan.has(a.id));
    if (stops.length === 0) return null;
    const ordered = [...stops].sort(
      (a, b) =>
        haversineMiles({ lat: distributor.lat, lng: distributor.lng }, a) -
        haversineMiles({ lat: distributor.lat, lng: distributor.lng }, b),
    );
    return [
      [distributor.lat, distributor.lng] as [number, number],
      ...ordered.map((a) => [a.lat, a.lng] as [number, number]),
    ];
  }, [distributor, inPlan]);

  /** A soft hull so the accounts read as a sales territory, not scattered pins. */
  const hull = useMemo(() => {
    if (ACCOUNTS.length < 3) return null;
    return convexHull(ACCOUNTS.map((a) => ({ lat: a.lat, lng: a.lng })))
      .map((p) => [p.lat, p.lng] as [number, number]);
  }, []);

  const accountDigest = useMemo(() => ACCOUNTS.map((a) => a.id).join(","), []);
  const layoutSignal = `${territory.listOpen}:${territory.selectedAccountId ?? ""}`;

  if (ACCOUNTS.length === 0) {
    return (
      <div className={styles.empty} role="status">
        <h3>Coordinates not loaded</h3>
        <p>
          The territory has {ACCOUNT_SEED_IDS.length} accounts on file and no coordinates
          yet. Nothing is rendered at an estimated position on purpose: run{" "}
          <code>scripts/geocode-tool.html</code>, paste the result into{" "}
          <code>src/data/coordinates.ts</code>, and the map fills in.
        </p>
      </div>
    );
  }

  if (tilesFailed) {
    return (
      <div className={styles.empty} role="status">
        <h3>Basemap unavailable</h3>
        <p>
          Map tiles could not be reached. The account list beside this panel
          is unaffected and carries the same information.
        </p>
      </div>
    );
  }

  const center: [number, number] = [
    TERRITORY_BY_ID[territory.territoryId]?.centroid.lat ?? 33.9853,
    TERRITORY_BY_ID[territory.territoryId]?.centroid.lng ?? -117.8992,
  ];

  return (
    <div className={styles.wrap}>
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        className={styles.map}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url={CARTO_URL}
          subdomains={["a", "b", "c", "d"]}
          maxZoom={19}
          eventHandlers={{
            tileerror: () => {
              tileErrors.current += 1;
              // One failed tile is a hiccup. Sustained failure means the
              // basemap is gone, and a demo should degrade to the list
              // rather than show a grey rectangle.
              if (tileErrors.current > 12) setTilesFailed(true);
            },
          }}
        />

        <FitToAccounts ids={accountDigest} />
        <ResizeOnLayout signal={layoutSignal} />

        {hull ? (
          <Polygon
            positions={hull}
            pathOptions={{
              color: "#4a5461",
              weight: 1,
              opacity: 0.35,
              fillColor: "#4a5461",
              fillOpacity: 0.04,
              dashArray: "4 6",
            }}
            interactive={false}
          />
        ) : null}

        {routeLine ? (
          <Polyline
            positions={routeLine}
            pathOptions={{
              color: "#1f5fd0",
              weight: 2,
              opacity: 0.55,
              dashArray: "5 5",
            }}
            interactive={false}
          />
        ) : null}

        {distributor && distributor.lat !== 0 ? (
          <Marker
            position={[distributor.lat, distributor.lng]}
            icon={distributorIcon(`${distributor.name}, ${distributor.city}`)}
            zIndexOffset={500}
          />
        ) : null}

        {shown.map((a) => {
          /**
           * Open issues on this account, from the register.
           *
           * This was a hardcoded zero with a comment promising a phase
           * that has since arrived under a different name. Every marker
           * claimed a clean account, which meant the map could not show
           * the one thing a rep most wants to see from across a territory:
           * where the trouble is.
           */
          const issues = issueCounts[a.id] ?? 0;
          return (
            <Marker
              key={a.id}
              position={[a.lat, a.lng]}
              icon={accountIcon({
                onPremise: CHANNEL_META[a.channel].venueClass === "on-premise",
                opportunity: opportunity[a.id] ?? 0,
                hasVoids: voidsForAccount(a.id).length > 0,
                inPlan: inPlan.has(a.id),
                openIssues: issues,
                selected: territory.selectedAccountId === a.id,
                hovered: territory.hoveredAccountId === a.id,
                label: `${a.chainName}, ${a.city}`,
              })}
              zIndexOffset={territory.selectedAccountId === a.id ? 400 : 0}
              eventHandlers={{
                click: () => dispatch({ type: "SELECT_ACCOUNT", accountId: a.id }),
                mouseover: () => dispatch({ type: "HOVER_ACCOUNT", accountId: a.id }),
                mouseout: () => dispatch({ type: "HOVER_ACCOUNT", accountId: null }),
              }}
              keyboard
              alt={`${a.chainName}, ${a.city}`}
            />
          );
        })}
      </MapContainer>

      <MapCredit />

      {routeLine ? (
        <p className={styles.routeNote}>
          Route line is straight-line distance between stops, not drive time.
        </p>
      ) : null}
    </div>
  );
}
