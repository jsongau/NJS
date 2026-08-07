import { useCallback, useMemo, useState } from "react";
import type { AccountSkuStatus } from "@/domain/types";
import { ACCOUNT_BY_ID } from "@/data/accounts";
import { DISTRIBUTOR_BY_ID, PROMOTIONS } from "@/data/trade";
import { SKU_BY_ID } from "@/data/skus";
import { BRAND_BY_ID } from "@/data/brands";
import { PACKAGE_BY_ID } from "@/data/packageFormats";
import { useTerritory, useTerritoryDispatch } from "@/state/TerritoryProvider";
import { usePlan, usePlanDispatch } from "@/state/PlanProvider";
import {
  podsForAccount,
  voidsForAccount,
  coldBoxPosition,
  haversineMiles,
  distributionRate,
} from "@/domain/selectors/distribution";
import { opportunityFor } from "@/domain/selectors/opportunity";
import {
  suggestedCasesForVoid,
  suggestedReplenishment,
  recommendedPlacement,
} from "@/domain/selectors/volume";
import { Wordmark, ChannelLabel, VenueClassLabel } from "@/components/primitives/Wordmark";
import { LOCATOR_SOURCE } from "@/data/accounts";
import { CHANNEL_META } from "@/domain/channels";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { DistributionGrid } from "./DistributionGrid";
import { OpportunityExplainer } from "./OpportunityExplainer";
import { StoreOrder } from "./StoreOrder";
import { retailPriorityLines } from "@/domain/selectors/retailOrder";
import { storeOrderLink } from "@/lib/links";
import styles from "./AccountDrawer.module.css";

/**
 * Which promotion a line belongs to.
 *
 * The mapping is commercial, not arbitrary: single-serve in a back shelf is
 * the cooler reset, an above-premium shelf or endcap gain is the shelf
 * expansion, and the rest of the period rides Labor Day.
 */
function promotionFor(
  channel: string,
  skuId: string,
  placement: string,
): string {
  const sku = SKU_BY_ID[skuId];
  const brand = sku ? BRAND_BY_ID[sku.brandId] : undefined;
  const pkg = sku ? PACKAGE_BY_ID[sku.packageFormatId] : undefined;

  if (
    (channel === "convenience" || channel === "drug") &&
    pkg &&
    pkg.unitsPerCase <= 24 &&
    pkg.unitSizeOz >= 7.5 &&
    placement === "back-shelf"
  ) {
    return "convenience-single-serve-2026";
  }
  if (brand?.family === "above-premium") {
    return "above-premium-shelf-2026";
  }
  return "labor-day-2026";
}

type TabId = "distribution" | "order" | "opportunity" | "coldbox" | "promotion" | "plan";

export function AccountDrawer() {
  const territory = useTerritory();
  const dispatch = useTerritoryDispatch();
  const plan = usePlan();
  const planDispatch = usePlanDispatch();

  /**
   * Tabs, with Distribution first and default.
   *
   * The drawer used to stack every section vertically, which meant the
   * seven-column distribution table forced a horizontal scroll and the
   * thing a rep opens the account FOR sat below two other sections.
   * Distribution now opens first and each section gets the full width.
   */
  const [tab, setTab] = useState<TabId>("distribution");

  const account = territory.selectedAccountId
    ? ACCOUNT_BY_ID[territory.selectedAccountId]
    : undefined;
  const distributor = DISTRIBUTOR_BY_ID[territory.distributorId];

  /** Keys already in the plan, so the grid can show what has been added. */
  const linesInPlan = useMemo(
    () => new Set(plan.retail.map((l) => `${l.accountId}::${l.skuId}`)),
    [plan.retail],
  );

  const addRow = useCallback(
    (row: AccountSkuStatus) => {
      if (!account) return;
      const isVoid = row.status === "void";
      const { cases } = isVoid
        ? suggestedCasesForVoid(account.id, row.skuId)
        : suggestedReplenishment(account.id, row.skuId);
      const placement = recommendedPlacement(account.id, row.skuId);

      // Attach the promotion that actually fits this line rather than
      // leaving it blank. A single-serve placement in a convenience cooler
      // belongs to the cooler reset; an above-premium shelf gain belongs to
      // the shelf expansion; everything else rides Labor Day. Leaving it
      // unset made every plan show a zero allowance and no ROI, which read
      // as a broken calculation rather than a deliberate blank.
      const promotionId = promotionFor(account.channel, row.skuId, placement.placement);

      planDispatch({
        type: "ADD_RETAIL_LINE",
        accountId: account.id,
        skuId: row.skuId,
        cases,
        closesVoid: isVoid,
        deliveryWeek: "Week 1",
        promotionId,
        commitment: {
          placement: placement.placement as never,
          recommendedLocation: placement.location,
          posMaterials: placement.placement === "back-shelf"
            ? ["Cooler door cling", "Shelf talker"]
            : ["Case card", "Shelf talker"],
          ownerRole: "Distributor account rep",
          executionNotes: placement.rationale,
        },
      });

      // The sell-in ledger has to move too, because cases promised to
      // retail must be cases the distributor actually bought. Keeping
      // them in step is the entire reason the plan has two ledgers.
      planDispatch({
        type: "ADD_SELL_IN_LINE",
        skuId: row.skuId,
        cases,
        pricePerCase: row.shelfPricePoint ? row.shelfPricePoint * 0.62 : 22,
        deliveryWeek: "Week 1",
        promotionId,
      });
    },
    [account, planDispatch],
  );

  if (!account) {
    return (
      <aside className={styles.drawer} aria-label="Account detail">
        <div className={styles.placeholder}>
          <p className={styles.placeholderTitle}>No account selected</p>
          <p>
            Pick an account on the map or in the list to review its
            distribution, back-shelf position, and open gaps.
          </p>
        </div>
      </aside>
    );
  }

  const voids = voidsForAccount(account.id);
  const cold = coldBoxPosition(account.id);
  const opp = opportunityFor(
    account.id,
    territory.distributorId,
    territory.opportunityWeights,
  );
  const distance = distributor
    ? haversineMiles({ lat: distributor.lat, lng: distributor.lng }, account)
    : 0;

  const activePromotion = PROMOTIONS.find((p) =>
    account.channel === "convenience"
      ? p.id === "convenience-single-serve-2026"
      : p.id === "labor-day-2026",
  );

  const plannedLines = plan.retail.filter((l) => l.accountId === account.id);
  const plannedCases = plannedLines.reduce((s, l) => s + l.cases, 0);

  /**
   * What this store could reorder today. The tab badge counts everything
   * worth discussing, including items it is authorized for but does not
   * stock. The quick link pre-selects only what is empty or thin, which is
   * what the Order tab and the supply desk both default to. Opening the
   * page with four new items already ticked is a harder conversation than
   * the one the rep meant to start.
   */
  const orderLines = retailPriorityLines(account.id);
  const orderCount = orderLines.length;
  const quickOrderLines = orderLines.filter((l) => l.kind !== "new");

  return (
    <aside className={styles.drawer} aria-label={`${account.chainName} detail`}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.close}
          onClick={() => dispatch({ type: "SELECT_ACCOUNT", accountId: null })}
          aria-label="Close account detail"
        >
          ×
        </button>

        <div className={styles.identity}>
          <Wordmark name={account.chainName} channel={account.channel} size="lg" />
          <div className={styles.identityText}>
            <h2 className={styles.name}>{account.chainName}</h2>
            <p className={styles.address}>
              {account.address}, {account.city}, {account.state}{" "}
              {account.postalCode}
              {account.phone ? <span className="num"> · {account.phone}</span> : null}
            </p>
            {/*
              THE PROVENANCE LINE, and it is the strongest one in the app.

              Everything else on this screen is modelled — the priority,
              the traffic tier, the velocity, the shelf gap. This line is
              not. The name, the address, the phone number and the
              distance are published by Ole Smoky's own store locator,
              which means a reader can check this account against the
              brand's website rather than taking it on trust, and it says
              so with a link rather than asking them to believe it.

              It is placed directly under the address, before any modelled
              figure, because provenance stated after the numbers reads as
              a disclaimer and provenance stated before them reads as a
              foundation.
            */}
            <p className={styles.sourceLine}>
              <ProvenanceBadge provenance="public" compact />
              Listed on{" "}
              <a
                href={LOCATOR_SOURCE.url}
                target="_blank"
                rel="noreferrer noopener"
              >
                {LOCATOR_SOURCE.label}
              </a>
              {account.locatorMiles !== undefined ? (
                <>
                  {" "}
                  — <span className="num">{account.locatorMiles.toFixed(1)} mi</span>{" "}
                  from the {LOCATOR_SOURCE.query} search
                </>
              ) : null}
            </p>
            <div className={styles.chips}>
              <ChannelLabel channel={account.channel} />
              <VenueClassLabel channel={account.channel} />
              <span className={`${styles.chip} ${styles.chipPriority}`}>
                {account.priority} priority
                <ProvenanceBadge provenance="illustrative" compact />
              </span>
              <span className={`${styles.chip} num`}>
                {distance.toFixed(1)} mi
              </span>
            </div>
          </div>
        </div>

        <dl className={styles.headStats}>
          <div>
            <dt>PODs</dt>
            <dd className="num">{podsForAccount(account.id)}</dd>
          </div>
          <div className={voids.length ? styles.statGap : ""}>
            <dt>Voids</dt>
            <dd className="num">{voids.length}</dd>
          </div>
          <div>
            <dt>Distribution</dt>
            <dd className="num">{(distributionRate(account.id) * 100).toFixed(0)}%</dd>
          </div>
          <div className={cold.gapDoors > 0 ? styles.statGap : ""}>
            <dt>{CHANNEL_META[account.channel].setName} gap</dt>
            <dd className="num">
              {cold.totalDoors === 0 ? "n/a" : cold.gapDoors.toFixed(1)}
            </dd>
          </div>
          <div>
            <dt>In plan</dt>
            <dd className="num">{plannedCases}</dd>
          </div>
        </dl>

        <p className={styles.lastVisit}>
          Last visit {account.lastVisitDate ?? "not recorded"}
          <ProvenanceBadge provenance="illustrative" compact />
        </p>

        {/* The order page is the thing a rep leaves this drawer to do, so
            it gets a button in the header rather than living behind a tab.
            An anchor, not a button, because it navigates: middle-click and
            open-in-new-tab should both work. */}
        <div className={styles.headActions}>
          <a
            className={styles.orderBtn}
            href={storeOrderLink(account.id, quickOrderLines)}
            target="_blank"
            rel="noreferrer"
          >
            Open this store{"'"}s order page
            {quickOrderLines.length > 0 ? (
              <span className={`${styles.orderCount} num`}>
                {quickOrderLines.length}
              </span>
            ) : null}
          </a>
          <button
            type="button"
            className={styles.orderTabBtn}
            onClick={() => setTab("order")}
          >
            Write the message
          </button>
        </div>
      </header>

      <div className={styles.tabs} role="tablist" aria-label="Account sections">
        {([
          ["distribution", "SKUs", voids.length ? String(voids.length) : ""],
          ["order", "Order", orderCount ? String(orderCount) : ""],
          ["opportunity", "Opportunity", String(opp.total)],
          /*
            The tab is named after the space THIS account actually has.
            "Back shelf" at a steakhouse describes nothing that exists
            there, and a rep who reads it will bring the wrong ask.
          */
          [
            "coldbox",
            CHANNEL_META[account.channel].setName,
            cold.totalDoors ? `${cold.gapDoors.toFixed(1)}` : "",
          ],
          ["promotion", "Promotion", ""],
          ["plan", "Plan", plannedLines.length ? String(plannedLines.length) : ""],
        ] as Array<[TabId, string, string]>).map(([id, label, badge]) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            className={[styles.tab, tab === id ? styles.tabOn : ""]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setTab(id)}
          >
            {label}
            {badge ? <span className={styles.tabBadge}>{badge}</span> : null}
          </button>
        ))}
      </div>

      <div
        className={styles.panel}
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
      >
        {tab === "distribution" ? (
          <DistributionGrid
            account={account}
            onAddVoid={addRow}
            linesInPlan={linesInPlan}
          />
        ) : null}

        {tab === "order" ? <StoreOrder account={account} /> : null}

        {tab === "opportunity" ? <OpportunityExplainer breakdown={opp} /> : null}

        {tab === "coldbox" ? (
          cold.totalDoors > 0 ? (
            <section className={styles.section} aria-label="Shelf position">
              <h3 className={styles.sectionTitle}>
                {CHANNEL_META[account.channel].setName}{" "}
                <ProvenanceBadge provenance="modeled" />
              </h3>
              <div className={styles.coldBar}>
                <div
                  className={styles.coldOurs}
                  style={{
                    width: `${Math.min(100, (cold.ourDoors / Math.max(1, cold.totalDoors)) * 100)}%`,
                  }}
                />
                <div
                  className={styles.coldFair}
                  style={{
                    left: `${Math.min(100, (cold.fairShareDoors / Math.max(1, cold.totalDoors)) * 100)}%`,
                  }}
                  title={`Modeled fair share: ${cold.fairShareDoors.toFixed(1)} facings`}
                />
              </div>
              <p className={styles.coldLegend}>
                <span>
                  <strong className="num">{cold.ourDoors.toFixed(1)}</strong> of{" "}
                  <span className="num">{cold.totalDoors}</span> facings held
                </span>
                <span>
                  Fair share{" "}
                  <strong className="num">{cold.fairShareDoors.toFixed(1)}</strong>
                </span>
                <span>
                  Gap <strong className="num">{cold.gapDoors.toFixed(1)}</strong>
                </span>
              </p>
              <p className={styles.explain}>{cold.explain}</p>
            </section>
          ) : (
            <p className={styles.tabEmpty}>
              No set size is on file for this account. A forecourt counter is
              a shelf nobody measures in sections, so there is no share to win
              here — the position at the till is the whole negotiation.
            </p>
          )
        ) : null}

        {tab === "promotion" ? (
          activePromotion ? (
            <section className={styles.section} aria-label="Promotion">
              <h3 className={styles.sectionTitle}>
                {activePromotion.name}{" "}
                <ProvenanceBadge provenance="illustrative" />
              </h3>
              <dl className={styles.promo}>
                <div>
                  <dt>Window</dt>
                  <dd>
                    {activePromotion.startDate} to {activePromotion.endDate}
                  </dd>
                </div>
                <div>
                  <dt>Modeled lift</dt>
                  <dd className="num">{activePromotion.expectedLiftPercent}%</dd>
                </div>
                <div>
                  <dt>Distributor allowance</dt>
                  <dd className="num">
                    ${activePromotion.distributorAllowancePerCase.toFixed(2)}/case
                  </dd>
                </div>
              </dl>
              <p className={styles.tiedHouse}>
                The allowance is paid to Southern Glazer's, not to this
                retailer. Retail support is the execution commitment below,
                which the distributor{"'"}s reps pursue. California does not
                permit a supplier to pay a retailer for placement.
              </p>
              <p className={styles.requirement}>
                {activePromotion.retailExecutionRequirement}
              </p>
            </section>
          ) : (
            <p className={styles.tabEmpty}>No promotion applies this period.</p>
          )
        ) : null}

        {tab === "plan" ? (
          plannedLines.length > 0 ? (
            <section className={styles.section} aria-label="Lines in the plan">
              <h3 className={styles.sectionTitle}>In the commitment plan</h3>
              <ul className={styles.planList}>
                {plannedLines.map((l) => (
                  <li key={l.id}>
                    <span className={styles.planSku}>
                      {SKU_BY_ID[l.skuId]?.label}
                    </span>
                    <span className={`${styles.planCases} num`}>{l.cases} cs</span>
                    <span className={styles.planPlacement}>
                      {l.commitment.recommendedLocation}
                    </span>
                    <button
                      type="button"
                      className={styles.remove}
                      onClick={() => planDispatch({ type: "REMOVE_LINE", id: l.id })}
                      aria-label={`Remove ${SKU_BY_ID[l.skuId]?.label} from the plan`}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <p className={styles.tabEmpty}>
              Nothing from this account is in the plan yet. Close a void on the SKUs
              tab and it lands in both ledgers.
            </p>
          )
        ) : null}
      </div>

    </aside>
  );
}
