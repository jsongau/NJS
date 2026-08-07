import { Link } from "react-router-dom";
import { DISTRIBUTOR_BY_ID } from "@/data/trade";
import { usePlan } from "@/state/PlanProvider";
import { useTerritory } from "@/state/TerritoryProvider";
import { GOAL_BY_PERIOD } from "@/data/trade";
import { caseTerms } from "@/data/tradeTerms";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import styles from "./SellInLadder.module.css";

/**
 * Where the store order goes.
 *
 * THE PROBLEM THIS FIXES. This app is a work sample for a Distributor
 * Sales Executive, and the noun in that title is DISTRIBUTOR. But the
 * front door sells to a store manager, which was the right call for
 * clarity and the wrong one for the argument: a visitor who spends ninety
 * seconds saw a retail order and left believing that was the whole job.
 * Southern Glazer's lived two clicks away with no visible path to it.
 *
 * The path was always there — sending a store order commits it to the
 * period plan, and the plan is what gets sold into Southern Glazer's. It was just
 * never drawn. This draws it, on the page where people land.
 *
 * THE LADDER IS THE THREE-TIER LAW, not a progress bar. Each rung is a
 * different legal relationship and a different unit:
 *
 *   1. One store.        Cases and placement. No money, ever — a supplier
 *                        may not price a retailer in California.
 *   2. The period plan.  Every store's commitments, added up. Still no
 *                        money: these are promises about shelves.
 *   3. Southern Glazer's.           Now it carries money, because supplier to
 *                        wholesaler is the one lane in the chain where a
 *                        price is lawful.
 *
 * So the dollars appearing only at rung three is not a design choice
 * about emphasis. It is the statute, drawn.
 *
 * And it puts the goal on screen. A DSE's year is a volume number split
 * across periods; an app that can describe what is happening but never
 * say whether it is ENOUGH is a reporting tool, not a sales tool.
 */
export function SellInLadder({
  accountId,
  storeName,
  storeLines,
  storeCases,
  storeValue,
}: {
  accountId: string;
  storeName: string;
  storeLines: number;
  storeCases: number;
  /** The open order priced at list. Computed by the desk, which is the
   *  only place that knows the current quantities. */
  storeValue: number;
}) {
  const plan = usePlan();
  const territory = useTerritory();

  /*
    Read from the record, never typed twice.

    This label used to be a literal string. When the portfolio moved from
    beer to spirits the wholesaler changed from Harbor to Southern
    Glazer's, a find-and-replace caught the NAME and left the CITY
    behind, and the app confidently rendered "Southern Glazer's, Santa Fe
    Springs" — a real company at a competitor's address, on the screen a
    hiring manager looks at first. Two facts about one entity, typed in
    two places, will eventually disagree.
  */
  const house = DISTRIBUTOR_BY_ID[territory.distributorId];
  const houseName = house?.name ?? "the wholesaler";
  const distributorLabel = house ? `${house.name}, ${house.city}` : "the wholesaler";
  const goal = GOAL_BY_PERIOD[territory.periodId];

  /** Rung two: what is already committed across every store this period. */
  const stores = new Set(plan.retail.map((l) => l.accountId));
  const committedCases = plan.retail.reduce((n, l) => n + l.cases, 0);

  /**
   * Rung three, and the arithmetic here is the whole point.
   *
   * The ask is every OTHER store's commitment plus this store's current
   * order. The first version added the open order to the full committed
   * total, which counted this store twice the moment its order had been
   * sent — the plan held 42 cases for 99 Ranch, the builder still showed
   * the same 42 on screen, and the ask read 84. Excluding this store from
   * the committed side means re-opening a store you already sent to
   * REPLACES its contribution rather than stacking a second copy, which
   * is the same replace-on-resend rule the plan reducer follows.
   */
  const others = plan.retail.filter((l) => l.accountId !== accountId);
  const askCases = others.reduce((n, l) => n + l.cases, 0) + storeCases;

  /** Money exists here and nowhere above it. */
  const askValue =
    others.reduce(
      (n, l) => n + l.cases * (caseTerms(l.skuId)?.listPerCase ?? 0),
      0,
    ) + storeValue;

  const goalCases = goal?.periodCases ?? 0;
  const pct = goalCases > 0 ? Math.min(100, (askCases / goalCases) * 100) : 0;
  const remaining = Math.max(0, goalCases - askCases);

  /**
   * The year-over-year figure compares the GOAL to last year, not the
   * plan-so-far to last year.
   *
   * The first version compared them, and a half-built plan read "down
   * 98% versus last year" — a category error dressed as a catastrophe. A
   * plan in progress is not a period result, and putting a red arrow on
   * it teaches a reader to distrust the number rather than the plan. What
   * a rep actually says out loud is what the GOAL asks of them against
   * what they did last year, which is stable from the first case to the
   * last.
   */
  const goalVsPrior =
    goal && goal.priorYearCases > 0
      ? Math.round(
          ((goal.periodCases - goal.priorYearCases) / goal.priorYearCases) * 100,
        )
      : 0;

  return (
    <section className={styles.ladder} aria-label="Where this order goes">
      <div className={styles.head}>
        <h2 className={styles.title}>Where this order goes</h2>
        <p className={styles.sub}>
          A store order is not the end of the job. It is evidence for the
          one that is. <ProvenanceBadge provenance="illustrative" />
        </p>
      </div>

      <ol className={styles.rungs}>
        <li className={styles.rung}>
          <span className={styles.step}>1</span>
          <span className={styles.rungBody}>
            <span className={styles.rungLabel}>This store</span>
            <span className={styles.rungName}>{storeName}</span>
            <span className={`${styles.rungNum} num`}>
              {storeCases}
              <span className={styles.unit}>cases</span>
            </span>
            <span className={styles.rungNote}>
              {storeLines} line{storeLines === 1 ? "" : "s"} · cases and
              placement only, no price
            </span>
          </span>
        </li>

        <li className={styles.rung}>
          <span className={styles.step}>2</span>
          <span className={styles.rungBody}>
            <span className={styles.rungLabel}>Committed this period</span>
            <span className={styles.rungName}>
              {stores.size === 0
                ? "Nothing sent yet"
                : `${stores.size} store${stores.size === 1 ? "" : "s"} across Territory 12`}
            </span>
            <span className={`${styles.rungNum} num`}>
              {committedCases}
              <span className={styles.unit}>cases</span>
            </span>
            <span className={styles.rungNote}>
              {stores.size === 0
                ? "Send the order and it lands here as a retail commitment"
                : "Shelf promises the distributor's reps will execute"}
            </span>
          </span>
        </li>

        <li className={`${styles.rung} ${styles.rungFinal}`}>
          <span className={`${styles.step} ${styles.stepFinal}`}>3</span>
          <span className={styles.rungBody}>
            <span className={styles.rungLabel}>Your ask to {houseName}</span>
            <span className={styles.rungName}>
              {distributorLabel}
            </span>
            <span className={`${styles.rungNum} num`}>
              {askCases}
              <span className={styles.unit}>cases</span>
            </span>
            <span className={styles.rungNote}>
              {askValue > 0 ? (
                <>
                  <strong className="num">
                    ${Math.round(askValue).toLocaleString()}
                  </strong>{" "}
                  of sell-in. The only lane in the chain where a supplier may
                  lawfully quote a price.
                </>
              ) : (
                "Money appears here and nowhere above it. Supplier to wholesaler is the one lawful lane."
              )}
            </span>
          </span>
        </li>
      </ol>

      {/* The goal. Everything above says what is happening; this is the
          only thing on the page that says whether it is enough. */}
      {goalCases > 0 ? (
        <div className={styles.goal}>
          <div className={styles.goalTop}>
            <span className={styles.goalLabel}>Period goal</span>
            <span className={`${styles.goalNum} num`}>
              {askCases} / {goalCases.toLocaleString()} cases
            </span>
            <span
              className={goalVsPrior >= 0 ? styles.up : styles.down}
              title="What the goal asks against the same period last year"
            >
              <span aria-hidden="true">{goalVsPrior >= 0 ? "▲" : "▼"}</span>{" "}
              goal is {Math.abs(goalVsPrior)}%{" "}
              {goalVsPrior >= 0 ? "over" : "under"} last year
            </span>
          </div>
          <div
            className={styles.track}
            role="img"
            aria-label={`${Math.round(pct)} percent of the period goal`}
          >
            <span className={styles.fill} style={{ width: `${pct}%` }} />
          </div>
          <p className={styles.goalNote}>
            {remaining > 0 ? (
              <>
                <strong className="num">{remaining.toLocaleString()}</strong>{" "}
                cases short of the period. That is the gap the next store
                visit has to close.
              </>
            ) : (
              <>Period goal covered. Everything after this is growth.</>
            )}
          </p>
        </div>
      ) : null}

      <div className={styles.actions}>
        <Link className={styles.primary} to="/distributor">
          Take it to Southern Glazer's
        </Link>
        <Link className={styles.ghost} to="/plan">
          See the period plan
        </Link>
        <Link className={styles.ghost} to="/sent">
          What went out
        </Link>
        <Link className={styles.ghost} to="/issues">
          What is broken
        </Link>
        <Link className={styles.ghost} to="/training">
          Train their team
        </Link>
      </div>
    </section>
  );
}
