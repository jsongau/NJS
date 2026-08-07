import { Link } from "react-router-dom";
import { StoreLinkList } from "@/components/supply/StoreLinkList";
import { DISTRIBUTOR_BY_ID } from "@/data/trade";
import { useTerritory } from "@/state/TerritoryProvider";
import { distributorOrderLink } from "@/lib/links";
import { supplySignals } from "@/domain/selectors/supply";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { ACCOUNTS } from "@/data/accounts";
import styles from "./SupplyPage.module.css";

/**
 * The store directory. What this page used to be, and why it is smaller.
 *
 * It was a second order desk. It carried its own "who is ordering" toggle
 * between Southern Glazer's and a store, its own SKU picker, its own compose-and-send
 * flow, and its own copy of the link builder — roughly three hundred and
 * fifty lines duplicating what the order desk, the sell-in ladder and
 * Southern Glazer's review board now do together.
 *
 * That duplication was harmless while the desk also had a Southern Glazer's lane.
 * Once the desk became store-only and the ladder drew the path from a
 * store order to the Southern Glazer's ask, this page became the last surviving copy
 * of a flow that had been deliberately removed, reachable from a link
 * labelled "All 25 stores" — so anyone who followed it landed in the old
 * design and could send a message through code nothing else used.
 *
 * Two ways to do one thing is worse than either way. What remains is the
 * part that was never duplicated: the index of every store's own order
 * link, sorted by how bad the shelf is, which is what a rep planning a
 * morning of calls actually wants.
 */
export function SupplyPage() {
  const territory = useTerritory();
  const distributor = DISTRIBUTOR_BY_ID[territory.distributorId];

  /**
   * The wholesaler's own portal, kept reachable. It is the page Southern Glazer's
   * opens from an email, and until now the only door to it was this
   * screen's deleted Southern Glazer's lane — removing that without replacing the
   * link would have orphaned a whole surface.
   */
  const signals = supplySignals().slice(0, 6);
  const harborLink = distributorOrderLink(
    territory.distributorId,
    signals.map((s) => s.skuId),
    signals.map((s) => s.recommendedCases),
    territory.periodId,
  );

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>Store directory</p>
          <h1>All {ACCOUNTS.length} accounts</h1>
          <p className={styles.lede}>
            Every account on the route with its own order link, sorted by how
            bad the shelf is rather than alphabetically. A list in trouble
            order tells you where to start; a list in name order makes you
            read all of it. <ProvenanceBadge provenance="modeled" />
          </p>
        </div>
      </header>

      <StoreLinkList />

      <section className={styles.harbor}>
        <div>
          <h2>The wholesaler&rsquo;s own page</h2>
          <p>
            {distributor?.name} has a portal too — the page they open from a
            sell-in message, showing what the territory is short of and
            letting them order it. It is the same loop one tier up.
          </p>
        </div>
        <div className={styles.harborLinks}>
          <a
            className={styles.primary}
            href={harborLink}
            target="_blank"
            rel="noreferrer"
          >
            Open Southern Glazer's&rsquo;s portal
          </a>
          <Link className={styles.ghost} to="/distributor">
            Their review board
          </Link>
        </div>
      </section>

      <p className={styles.footnote}>
        Building an order happens on{" "}
        <Link to="/">the order desk</Link>. This page is the index, not a
        second desk — there used to be two, and the older one is gone.
      </p>
    </div>
  );
}
