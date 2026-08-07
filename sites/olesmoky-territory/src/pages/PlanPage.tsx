import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePlan, usePlanDispatch } from "@/state/PlanProvider";
import { useTerritory } from "@/state/TerritoryProvider";
import { computeTotals, ledgerBalance, skuLabel, packageLabel } from "@/domain/selectors/planTotals";
import { ACCOUNT_BY_ID } from "@/data/accounts";
import {
  PROMOTIONS,
  PROMOTION_BY_ID,
  DISTRIBUTOR_BY_ID,
  PERIOD_BY_ID,
  GOAL_BY_PERIOD,
  ANNUAL_GOAL_CASES,
} from "@/data/trade";
import { ChannelLabel } from "@/components/primitives/Wordmark";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { Button } from "@/components/primitives/Button";
import { exportPlanCsvs, encodePlanLink } from "@/lib/export/planExport";
import styles from "./PlanPage.module.css";

const WEEKS = ["Week 1", "Week 2", "Week 3", "Week 4"];

export function PlanPage() {
  const plan = usePlan();
  const dispatch = usePlanDispatch();
  const territory = useTerritory();
  const [copied, setCopied] = useState<string | null>(null);

  const totals = useMemo(() => computeTotals(plan), [plan]);

  const balance = useMemo(() => ledgerBalance(plan), [plan]);
  const distributor = DISTRIBUTOR_BY_ID[territory.distributorId];
  const period = PERIOD_BY_ID[territory.periodId];
  const goal = GOAL_BY_PERIOD[territory.periodId];

  /** Progress against the period, and against the same period last year. */
  const goalPct = goal
    ? Math.min(100, (totals.totalCases / goal.periodCases) * 100)
    : 0;
  const goalRemaining = goal
    ? Math.max(0, goal.periodCases - totals.totalCases)
    : 0;
  /**
   * Goal against last year, NOT plan-so-far against last year. A plan in
   * progress is not a period result, and a half-built plan reading "down
   * 98%" teaches a reader to distrust the figure rather than the plan.
   */
  const goalVsPrior =
    goal && goal.priorYearCases > 0
      ? Math.round(
          ((goal.periodCases - goal.priorYearCases) / goal.priorYearCases) * 100,
        )
      : 0;

  const grouped = useMemo(() => {
    if (plan.grouping !== "account") return null;
    const map = new Map<string, typeof plan.retail>();
    for (const l of plan.retail) {
      const arr = map.get(l.accountId) ?? [];
      arr.push(l);
      map.set(l.accountId, arr);
    }
    return [...map.entries()];
  }, [plan.retail, plan.grouping]);

  if (plan.retail.length === 0 && plan.sellIn.length === 0) {
    return (
      <div className={styles.empty}>
        <h1>Nothing in the plan yet</h1>
        {/* The goal belongs on the empty state more than anywhere else.
            "Zero of 2,600" is the most useful sentence this screen can
            say to someone who has not started; "nothing here" is the
            least. */}
        {goal ? (
          <p className={styles.emptyGoal}>
            <strong className="num">0</strong> of{" "}
            <strong className="num">{goal.periodCases.toLocaleString()}</strong>{" "}
            cases for {period?.label ?? "this period"}, a goal set{" "}
            {Math.abs(goalVsPrior)}% {goalVsPrior >= 0 ? "over" : "under"} the
            same period last year.
          </p>
        ) : null}
        <p>
          Send a store its order from the order desk, or open an account on
          the map and close a void. Lines land here as retail commitments,
          and the sell-in they require is computed from them.
        </p>
        <Link to="/" className={styles.emptyCta}>
          Go to the order desk
        </Link>
        <p className={styles.emptyAlt}>
          Or read{" "}
          <Link to="/programs">the programme calendar</Link> — the five
          windows this period sits inside, and the kit that ships with each.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>Commitment plan</h1>
          <p className={styles.sub}>
            {territory.scenarioName} · {distributor?.name} ·{" "}
            {territory.periodId.replace("2026-", "")}
          </p>
        </div>
        <div className={styles.actions}>
          <Button onClick={() => exportPlanCsvs(plan, territory.scenarioName)}>
            Export CSV
          </Button>
          <Button
            onClick={() => {
              const url = encodePlanLink(plan, territory.scenarioName);
              if (!url) {
                setCopied("Plan is too large for a link. Use CSV instead.");
                return;
              }
              navigator.clipboard?.writeText(url);
              setCopied("Link copied");
              window.setTimeout(() => setCopied(null), 2200);
            }}
          >
            Copy share link
          </Button>
          <Link to="/plan/sheet" className={styles.primaryLink}>
            Open commitment sheet
          </Link>
        </div>
      </header>

      {copied ? <p className={styles.toast}>{copied}</p> : null}

      {/* The tier explainer sits at the top of the plan because it is the
          thing a reader most needs before reading two tables of numbers. */}
      <section className={styles.tiers}>
        <div className={styles.tier}>
          <span className={styles.tierLabel}>Ledger 1 · sell-in</span>
          <strong>Ole Smoky to {distributor?.name}</strong>
          <span>Cases the distributor commits to buy. Allowances live here.</span>
        </div>
        <span className={styles.tierArrow} aria-hidden="true" />
        <div className={styles.tier}>
          <span className={styles.tierLabel}>Ledger 2 · retail execution</span>
          <strong>{distributor?.name} to retail</strong>
          <span>
            PODs, displays and back-shelf resets the distributor{"'"}s reps
            pursue. No money changes hands with a retailer.
          </span>
        </div>
      </section>

      {/* The goal. Every number below says what is in the plan; this is
          the only one that says whether it is enough, which is the number
          a Distributor Sales Executive is actually scored on. */}
      {goal ? (
        <section className={styles.goalBar} aria-label="Period goal">
          <div className={styles.goalHead}>
            <span className={styles.goalLabel}>
              {period?.label ?? "This period"} goal
            </span>
            <span className={`${styles.goalNum} num`}>
              {totals.totalCases.toLocaleString()} /{" "}
              {goal.periodCases.toLocaleString()} cases
            </span>
            <span className={goalVsPrior >= 0 ? styles.goalUp : styles.goalDown}>
              <span aria-hidden="true">{goalVsPrior >= 0 ? "▲" : "▼"}</span>{" "}
              goal is {Math.abs(goalVsPrior)}%{" "}
              {goalVsPrior >= 0 ? "over" : "under"} the same period last year
            </span>
            <ProvenanceBadge provenance="illustrative" />
          </div>
          <div
            className={styles.goalTrack}
            role="img"
            aria-label={`${Math.round(goalPct)} percent of the period goal`}
          >
            <span className={styles.goalFill} style={{ width: `${goalPct}%` }} />
          </div>
          <p className={styles.goalNote}>
            <Link className={styles.goalLink} to="/programs">
              The programme calendar
            </Link>{" "}
            ·{" "}
            {goalRemaining > 0
              ? `${goalRemaining.toLocaleString()} cases short. Annual goal is ${ANNUAL_GOAL_CASES.toLocaleString()} cases across thirteen periods.`
              : `Period covered. Annual goal is ${ANNUAL_GOAL_CASES.toLocaleString()} cases across thirteen periods.`}
          </p>
        </section>
      ) : null}

      <section className={styles.totals} aria-label="Plan totals">
        <Total label="Accounts" value={totals.accounts} />
        <Total label="Lines" value={totals.podsAdded} />
        <Total label="Voids closed" value={totals.voidsClosed} emphasis />
        <Total label="Cases" value={totals.totalCases} />
        <Total label="Pallets" value={totals.totalPallets.toFixed(1)} />
        <Total label="Displays" value={totals.displayCount} />
        <Total label="Back shelf" value={totals.coldBoxCount} />
        {/* Required, not booked. Once the desk became store-only every
            plan line was a retail commitment and the sell-in ledger stayed
            empty, so every dollar here read zero — arithmetically right and
            commercially useless. Cases promised at retail are cases Southern Glazer's
            has to buy. It stays labelled as a requirement, because booking
            one as revenue is the error the two-ledger model exists to
            prevent. */}
        <Total
          label="Required sell-in"
          value={`$${Math.round(totals.illustrativeGross || totals.requiredSellInValue).toLocaleString()}`}
          modeled
        />
        <Total
          label="Allowance"
          value={`$${Math.round(totals.allowanceTotal || totals.requiredAllowance).toLocaleString()}`}
          modeled
        />
        {/* Net and return were computed and then shown on /plan/sheet
            only — three clicks from the front page. A hiring manager
            reading for "sound investment and spending practices" was
            being asked to go looking for the evidence. */}
        <Total
          label="Net to Southern Glazer's"
          value={`$${Math.round(totals.illustrativeNet || totals.requiredNet).toLocaleString()}`}
          modeled
        />
        <Total
          label="Return on allowance"
          value={totals.modeledROI ? `${totals.modeledROI}x` : "—"}
          modeled
          emphasis
        />
        <Total
          label="Incremental / wk"
          value={totals.incrementalWeeklyCases}
          modeled
          emphasis
        />
      </section>

      {!balance.balanced ? (
        <p className={styles.warn}>
          <strong>Ledgers disagree.</strong> Cases promised to retail must be
          cases the distributor actually bought.{" "}
          {balance.bySku
            .map(
              (r) =>
                `${skuLabel(r.skuId)}: ${r.retail} retail vs ${r.sellIn} sell-in`,
            )
            .join(" · ")}
        </p>
      ) : null}

      {/* --- Ledger 2, shown first: it is the one a rep works from ---- */}
      <section className={styles.ledger}>
        <h2 className={styles.ledgerTitle}>
          Retail execution <span className={styles.ledgerNote}>{distributor?.name} to retail</span>
        </h2>

        {grouped?.map(([accountId, lines]) => {
          const a = ACCOUNT_BY_ID[accountId];
          const cases = lines.reduce((s, l) => s + l.cases, 0);
          return (
            <div key={accountId} className={styles.group}>
              <div className={styles.groupHead}>
                <span className={styles.groupName}>{a?.chainName}</span>
                {a ? <ChannelLabel channel={a.channel} /> : null}
                <span className={styles.groupCity}>{a?.city}</span>
                <span className={`${styles.groupCases} num`}>{cases} cs</span>
                <button
                  type="button"
                  className={styles.removeAll}
                  onClick={() => dispatch({ type: "REMOVE_ACCOUNT", accountId })}
                >
                  Remove account
                </button>
              </div>

              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">SKU</th>
                    <th scope="col">Package</th>
                    <th scope="col" className={styles.right}>Cases</th>
                    <th scope="col" className={styles.right}>Pallets</th>
                    <th scope="col">Placement</th>
                    <th scope="col">Promotion</th>
                    <th scope="col">Delivery</th>
                    <th scope="col" />
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => (
                    <tr key={l.id}>
                      <th scope="row" className={styles.skuCell}>
                        {skuLabel(l.skuId)}
                        {l.closesVoid ? (
                          <span className={styles.voidTag} title="This line closes a known void">
                            closes void
                          </span>
                        ) : null}
                      </th>
                      <td className={styles.muted}>{packageLabel(l.skuId)}</td>
                      <td className={styles.right}>
                        <input
                          type="number"
                          min={0}
                          step={1}
                          className={`${styles.qty} num`}
                          value={l.cases}
                          aria-label={`Cases of ${skuLabel(l.skuId)}`}
                          onChange={(e) =>
                            dispatch({
                              type: "SET_CASES",
                              id: l.id,
                              cases: Number(e.target.value),
                            })
                          }
                        />
                      </td>
                      <td className={`${styles.right} ${styles.muted} num`}>
                        {l.pallets.toFixed(2)}
                      </td>
                      <td className={styles.placement}>
                        {l.commitment.recommendedLocation}
                      </td>
                      <td>
                        <select
                          className={styles.select}
                          value={l.promotionId ?? ""}
                          aria-label={`Promotion for ${skuLabel(l.skuId)}`}
                          onChange={(e) =>
                            dispatch({
                              type: "SET_PROMOTION",
                              id: l.id,
                              promotionId: e.target.value || undefined,
                            })
                          }
                        >
                          <option value="">None</option>
                          {PROMOTIONS.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          className={styles.select}
                          value={l.deliveryWeek}
                          aria-label={`Delivery week for ${skuLabel(l.skuId)}`}
                          onChange={(e) =>
                            dispatch({
                              type: "SET_DELIVERY_WEEK",
                              id: l.id,
                              week: e.target.value,
                            })
                          }
                        >
                          {WEEKS.map((w) => (
                            <option key={w} value={w}>
                              {w}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className={styles.right}>
                        <button
                          type="button"
                          className={styles.remove}
                          onClick={() => dispatch({ type: "REMOVE_LINE", id: l.id })}
                          aria-label={`Remove ${skuLabel(l.skuId)}`}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </section>

      {/* --- Ledger 1 --------------------------------------------------- */}
      <section className={styles.ledger}>
        <h2 className={styles.ledgerTitle}>
          Sell-in commitment{" "}
          <span className={styles.ledgerNote}>
            Ole Smoky to {distributor?.name}
          </span>
        </h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">SKU</th>
              <th scope="col">Package</th>
              <th scope="col" className={styles.right}>Cases</th>
              <th scope="col" className={styles.right}>Pallets</th>
              <th scope="col" className={styles.right}>$/case</th>
              <th scope="col" className={styles.right}>Extended</th>
              <th scope="col">Promotion</th>
              <th scope="col" className={styles.right}>Allowance</th>
              <th scope="col" className={styles.right}>Net</th>
            </tr>
          </thead>
          <tbody>
            {plan.sellIn.map((l) => {
              const promo = l.promotionId ? PROMOTION_BY_ID[l.promotionId] : undefined;
              const ext = l.cases * l.illustrativePricePerCase;
              const allow = promo ? l.cases * promo.distributorAllowancePerCase : 0;
              return (
                <tr key={l.id}>
                  <th scope="row" className={styles.skuCell}>{skuLabel(l.skuId)}</th>
                  <td className={styles.muted}>{packageLabel(l.skuId)}</td>
                  <td className={`${styles.right} num`}>{l.cases}</td>
                  <td className={`${styles.right} ${styles.muted} num`}>
                    {l.pallets.toFixed(2)}
                  </td>
                  <td className={`${styles.right} num`}>
                    ${l.illustrativePricePerCase.toFixed(2)}
                  </td>
                  <td className={`${styles.right} num`}>${ext.toFixed(2)}</td>
                  <td>
                    <select
                      className={styles.select}
                      value={l.promotionId ?? ""}
                      aria-label={`Promotion for ${skuLabel(l.skuId)} sell-in`}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_PROMOTION",
                          id: l.id,
                          promotionId: e.target.value || undefined,
                        })
                      }
                    >
                      <option value="">None</option>
                      {PROMOTIONS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className={`${styles.right} num`}>
                    {allow > 0 ? `-$${allow.toFixed(2)}` : "—"}
                  </td>
                  <td className={`${styles.right} num`}>
                    ${(ext - allow).toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className={styles.tiedHouse}>
          Allowances are paid to {distributor?.name}, never to a retailer.
          California ABC has stated there is no exception permitting cash
          payments from a supplier to a retailer, so retail support in this
          plan is an execution commitment rather than money.
        </p>
      </section>
    </div>
  );
}

function Total({
  label,
  value,
  modeled,
  emphasis,
}: {
  label: string;
  value: string | number;
  modeled?: boolean;
  emphasis?: boolean;
}) {
  return (
    <div className={[styles.total, emphasis ? styles.totalEmphasis : ""].filter(Boolean).join(" ")}>
      <span className={styles.totalLabel}>
        {label}
        {modeled ? <ProvenanceBadge provenance="modeled" compact /> : null}
      </span>
      <span className={`${styles.totalValue} num`}>{value}</span>
    </div>
  );
}
