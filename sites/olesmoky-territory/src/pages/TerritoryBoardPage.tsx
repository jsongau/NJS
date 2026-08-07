import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { TerritoryMap } from "@/components/territory/TerritoryMap";
import { AccountList } from "@/components/territory/AccountList";
import { TerritoryKpiStrip } from "@/components/territory/TerritoryKpiStrip";
import { LaunchSupport } from "@/components/territory/LaunchSupport";
import { MapLegend } from "@/components/territory/MapLegend";
import { AccountDrawer } from "@/components/account/AccountDrawer";
import { useTerritory, useTerritoryDispatch } from "@/state/TerritoryProvider";
import { usePlan, accountsInPlan } from "@/state/PlanProvider";
import { ACCOUNTS } from "@/data/accounts";
import { CHANNEL_META } from "@/domain/channels";
import { DISTRIBUTOR_BY_ID } from "@/data/trade";
import { rankAccountsByOpportunity } from "@/domain/selectors/opportunity";
import { voidsForAccount, haversineMiles } from "@/domain/selectors/distribution";
import { accountsDrivingSku } from "@/domain/selectors/orderDesk";
import { SKU_BY_ID } from "@/data/skus";
import styles from "./TerritoryBoardPage.module.css";

export function TerritoryBoardPage() {
  const territory = useTerritory();
  const dispatch = useTerritoryDispatch();
  const plan = usePlan();

  const inPlan = useMemo(() => accountsInPlan(plan), [plan]);
  const distributor = DISTRIBUTOR_BY_ID[territory.distributorId];

  const opportunity = useMemo(
    () =>
      rankAccountsByOpportunity(
        territory.distributorId,
        territory.opportunityWeights,
      ),
    [territory.distributorId, territory.opportunityWeights],
  );

  const [params, setParams] = useSearchParams();

  const opportunityById = useMemo(
    () => Object.fromEntries(opportunity.map((o) => [o.accountId, o])),
    [opportunity],
  );

  /**
   * `?sku=` arrives from the order desk. An order line links here saying
   * "see where it is short", and the board owes the visitor exactly the
   * accounts behind that line. The link used to promise a filter and
   * deliver an unfiltered map, which is worse than not linking at all.
   */
  const skuFocus = params.get("sku");
  const skuAccounts = useMemo(
    () => (skuFocus ? new Set(accountsDrivingSku(skuFocus)) : null),
    [skuFocus],
  );

  /** Filtering and sorting happen once here; the map and the list read the
   *  same result, so the two panels can never disagree about what is shown. */
  const visible = useMemo(() => {
    const f = territory.filters;
    const q = f.search.trim().toLowerCase();

    let rows = ACCOUNTS.filter((a) => {
      if (skuAccounts && !skuAccounts.has(a.id)) return false;
      if (f.venueClass && CHANNEL_META[a.channel].venueClass !== f.venueClass)
        return false;
      if (f.channels.length && !f.channels.includes(a.channel)) return false;
      if (f.priorities.length && !f.priorities.includes(a.priority)) return false;
      if (f.hasOpenVoids && voidsForAccount(a.id).length === 0) return false;
      if (f.inPlanOnly && !inPlan.has(a.id)) return false;
      if (q && !`${a.chainName} ${a.city} ${a.address}`.toLowerCase().includes(q))
        return false;
      if (f.maxDistanceMiles !== null && distributor) {
        const d = haversineMiles(
          { lat: distributor.lat, lng: distributor.lng },
          { lat: a.lat, lng: a.lng },
        );
        if (d > f.maxDistanceMiles) return false;
      }
      if (territory.view === "voids" && voidsForAccount(a.id).length === 0) return false;
      if (territory.view === "in-plan" && !inPlan.has(a.id)) return false;
      return true;
    });

    /*
      ONE ORDER: most recently visited first.

      This was a five-way switch behind five pills. Sorting earns a
      control when a list is long enough that a reader cannot find the
      answer by scrolling, and twelve rows is not that list — the pills
      were asking for a decision before the reader had seen anything.

      Last visit is the honest default because it is the order a rep's
      own week actually arrives in. Accounts with no visit recorded sort
      last rather than first: an empty date is missing information, and
      missing information should never outrank a known fact.
    */
    rows = rows.sort((a, b) =>
      (b.lastVisitDate ?? "").localeCompare(a.lastVisitDate ?? ""),
    );
    return rows;
  }, [territory.filters, territory.view, inPlan, distributor, opportunityById, skuAccounts]);

  const visibleIds = useMemo(() => visible.map((a) => a.id), [visible]);

  return (
    <div className={styles.page}>
      <TerritoryKpiStrip visibleAccountIds={visibleIds} />

      {/* Arriving from an order line. The board says out loud that it is
          showing a subset and offers the way back, because a filtered map
          with no explanation reads as a map that lost your accounts. */}
      {skuFocus && SKU_BY_ID[skuFocus] ? (
        <div className={styles.focusBar} role="status">
          <span className={styles.focusGlyph} aria-hidden="true">◆</span>
          <span>
            Showing the <strong>{visible.length}</strong> account
            {visible.length === 1 ? "" : "s"} behind{" "}
            <strong>{SKU_BY_ID[skuFocus].label}</strong>, out of {ACCOUNTS.length} in
            the territory.
          </span>
          <button
            type="button"
            className={styles.focusClear}
            onClick={() => {
              const next = new URLSearchParams(params);
              next.delete("sku");
              setParams(next, { replace: true });
            }}
          >
            Show the whole territory
          </button>
        </div>
      ) : null}

      <div
        className={[
          styles.board,
          territory.listOpen ? "" : styles.boardListClosed,
          territory.selectedAccountId ? styles.boardDrawerOpen : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <aside
          className={styles.listPane}
          aria-label="Accounts in territory"
          hidden={!territory.listOpen}
        >
          <AccountList accounts={visible} opportunityById={opportunityById} />
        </aside>

        <section className={styles.mapPane} aria-label="Territory map">
          <TerritoryMap visibleAccountIds={visibleIds} />
          <MapLegend />
          <LaunchSupport />
          <button
            type="button"
            className={styles.listToggle}
            onClick={() => dispatch({ type: "TOGGLE_LIST" })}
            aria-expanded={territory.listOpen}
          >
            {territory.listOpen ? "Hide list" : `Show list (${visible.length})`}
          </button>
        </section>

        <AccountDrawer />
      </div>
    </div>
  );
}
