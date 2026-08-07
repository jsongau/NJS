import type { Account } from "@/domain/types";
import type { OpportunityBreakdown } from "@/domain/selectors/opportunity";
import { Wordmark, ChannelLabel, VenueClassLabel } from "@/components/primitives/Wordmark";
import { useTerritory, useTerritoryDispatch } from "@/state/TerritoryProvider";
import { usePlan, accountsInPlan } from "@/state/PlanProvider";
import {
  voidsForAccount,
  podsForAccount,
  voidCasesForAccount,
  coldBoxPosition,
  haversineMiles,
} from "@/domain/selectors/distribution";
import { DISTRIBUTOR_BY_ID } from "@/data/trade";
import { OFF_PREMISE_ACCOUNTS, ON_PREMISE_ACCOUNTS } from "@/data/accounts";
import { VENUE_CLASS_META } from "@/domain/channels";
import type { VenueClass } from "@/domain/types";
import { useMemo } from "react";
import styles from "./AccountList.module.css";

/**
 * Two tabs, computed from the roster rather than typed out.
 *
 * THERE WAS A THIRD, "All", AND DROPPING IT WAS THE RIGHT CALL. Three
 * tabs plus three counts did not fit the list column: the labels
 * ellipsed to "All ...", "Reta..." and "On-...", so the one tab a reader
 * had never opened was also the one they could not read the name of. A
 * control that has to be guessed at is not a control.
 *
 * Two tabs is also the truer model. This territory is two businesses,
 * and "all accounts" was a view that ranked a bowling alley against a
 * bottle shop on an opportunity score that means different things in
 * each row — the same reason the score is normalised per venue class.
 * The combined view read as a summary and was really an average of two
 * unlike things.
 *
 * `id` is no longer nullable, which deletes a whole category of bug: no
 * call site has to decide what an absent venue class means.
 */
const VENUE_TABS: Array<{
  key: string;
  id: VenueClass;
  /** What fits on the tab. */
  label: string;
  /** What it is really called, for the accessible name. */
  fullLabel: string;
  glyph: string;
  count: number;
  what: string;
}> = [
  {
    key: "off-premise",
    id: "off-premise",
    label: VENUE_CLASS_META["off-premise"].short,
    fullLabel: VENUE_CLASS_META["off-premise"].label,
    glyph: VENUE_CLASS_META["off-premise"].glyph,
    count: OFF_PREMISE_ACCOUNTS.length,
    what: VENUE_CLASS_META["off-premise"].what,
  },
  {
    key: "on-premise",
    id: "on-premise",
    label: VENUE_CLASS_META["on-premise"].short,
    fullLabel: VENUE_CLASS_META["on-premise"].label,
    glyph: VENUE_CLASS_META["on-premise"].glyph,
    count: ON_PREMISE_ACCOUNTS.length,
    what: VENUE_CLASS_META["on-premise"].what,
  },
];


export function AccountList({
  accounts,
  opportunityById,
}: {
  accounts: Account[];
  opportunityById: Record<string, OpportunityBreakdown>;
}) {
  const territory = useTerritory();
  const dispatch = useTerritoryDispatch();
  const plan = usePlan();
  const inPlan = useMemo(() => accountsInPlan(plan), [plan]);
  const distributor = DISTRIBUTOR_BY_ID[territory.distributorId];

  /*
    The denominator follows the tab.

    "12 of 27 accounts" while the Retail tab is showing is a true
    sentence that answers a question nobody asked — the reader is looking
    at retail, so the 27 is noise that makes a complete list look like a
    filtered one. The count says what is in front of them.
  */
  const activeTab =
    VENUE_TABS.find((t) => t.id === territory.filters.venueClass) ?? VENUE_TABS[0];
  const tabTotal = activeTab.count;
  const tabNoun =
    activeTab.id === "on-premise" ? "bars and restaurants" : "retail locations";

  return (
    <div className={styles.pane}>
      <div className={styles.controls}>
        {/*
          THE TABS ARE THE FIRST CONTROL ON THE PAGE, above search and
          above sort, and the order is the argument.

          This territory is two businesses. Twelve shops that sell a
          sealed bottle and fifteen bars that sell a pour, and almost
          nothing a rep does for one is the same as what they do for the
          other: different buyer, different unit, different ask,
          different email. Mixing them in one scrolling list produces an
          "opportunity" ranking that puts a bowling alley above a bottle
          shop on a number that means different things in each row.

          Counts sit in the tabs on purpose. A tab that hides how much is
          behind it makes the reader click to find out, and the first
          thing anyone wants to know about a split territory is how it
          splits.
        */}
        <div className={styles.tabs} role="tablist" aria-label="Account type">
          {VENUE_TABS.map((t) => {
            const active = territory.filters.venueClass === t.id;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={active}
                /*
                  The full name goes on the accessible label rather than
                  into a visually-hidden span. The first attempt used a
                  `sr-only` class this codebase has never defined, so the
                  long name rendered — twice, next to the short one — and
                  pushed the second tab's count off the edge. A utility
                  class you assume exists is a utility class that renders.
                */
                aria-label={`${t.fullLabel}, ${t.count} accounts`}
                title={t.what}
                className={[styles.tab, active ? styles.tabActive : ""]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() =>
                  dispatch({ type: "SET_FILTER", patch: { venueClass: t.id } })
                }
              >
                <span aria-hidden="true" className={styles.tabGlyph}>
                  {t.glyph}
                </span>
                <span className={styles.tabLabel}>{t.label}</span>
                <span className={`${styles.tabCount} num`}>{t.count}</span>
              </button>
            );
          })}
        </div>

        <input
          type="search"
          className={styles.search}
          placeholder="Find an account"
          value={territory.filters.search}
          onChange={(e) =>
            dispatch({ type: "SET_FILTER", patch: { search: e.target.value } })
          }
          aria-label="Find an account"
        />
        {/*
          THE FIVE SORT PILLS ARE GONE, and removing them was a fix
          rather than a simplification.

          Opportunity, Nearest, Voids, Name, Channel — five controls
          sitting above a list of twelve. Sorting is worth a control when
          a list is long enough that a reader cannot see the answer by
          scrolling, and twelve rows is not that list. What the pills
          actually did was ask the reader to make a decision before they
          had seen anything, and take a row of vertical space to do it in.

          One fixed order instead: most recently visited first. That is
          the order a rep's own week arrives in, and it needs no
          explanation and no click.
        */}
        <p className={styles.count}>
          {accounts.length} of {tabTotal} {tabNoun}
          {territory.filters.hasOpenVoids ? " with open voids" : ""}
        </p>
      </div>

      <ul className={styles.list}>
        {accounts.map((a) => {
          const opp = opportunityById[a.id];
          const voids = voidsForAccount(a.id);
          const cold = coldBoxPosition(a.id);
          const distance = distributor
            ? haversineMiles({ lat: distributor.lat, lng: distributor.lng }, a)
            : 0;
          const selected = territory.selectedAccountId === a.id;
          const planned = inPlan.has(a.id);

          return (
            <li key={a.id}>
              <button
                type="button"
                className={[styles.card, selected ? styles.cardSelected : ""]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() =>
                  dispatch({ type: "SELECT_ACCOUNT", accountId: a.id })
                }
                onMouseEnter={() =>
                  dispatch({ type: "HOVER_ACCOUNT", accountId: a.id })
                }
                onMouseLeave={() =>
                  dispatch({ type: "HOVER_ACCOUNT", accountId: null })
                }
                aria-current={selected ? "true" : undefined}
              >
                <Wordmark name={a.chainName} channel={a.channel} />

                <div className={styles.body}>
                  <div className={styles.titleRow}>
                    <span className={styles.name}>{a.chainName}</span>
                    {planned ? (
                      <span className={styles.planned}>
                        <span aria-hidden="true">✓</span> In plan
                      </span>
                    ) : null}
                  </div>

                  <div className={styles.metaRow}>
                    <ChannelLabel channel={a.channel} />
                    <VenueClassLabel channel={a.channel} />
                    <span className={styles.city}>{a.city}</span>
                    <span className={`${styles.distance} num`}>
                      {distance.toFixed(1)} mi
                    </span>
                  </div>

                  <dl className={styles.stats}>
                    <div>
                      <dt>PODs</dt>
                      <dd className="num">{podsForAccount(a.id)}</dd>
                    </div>
                    <div className={voids.length > 0 ? styles.statGap : ""}>
                      <dt>Voids</dt>
                      <dd className="num">{voids.length}</dd>
                    </div>
                    <div className={voids.length > 0 ? styles.statGap : ""}>
                      <dt>Void cases</dt>
                      <dd className="num">{voidCasesForAccount(a.id)}</dd>
                    </div>
                    <div className={cold.gapDoors > 0 ? styles.statGap : ""}>
                      <dt>Shelf gap</dt>
                      <dd className="num">
                        {cold.totalDoors === 0 ? "—" : `${cold.gapDoors.toFixed(1)}d`}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className={styles.score} title={opp?.explain.join("\n")}>
                  <span className={`${styles.scoreNum} num`}>
                    {opp?.total ?? 0}
                  </span>
                  <span className={styles.scoreLabel}>opp</span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {accounts.length === 0 ? (
        <p className={styles.empty}>
          No accounts match these filters. Clear the search or the view filter
          to see the full territory.
        </p>
      ) : null}
    </div>
  );
}
