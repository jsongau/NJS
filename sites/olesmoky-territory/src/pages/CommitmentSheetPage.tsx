import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePlan, usePlanDispatch } from "@/state/PlanProvider";
import { useTerritory } from "@/state/TerritoryProvider";
import { computeTotals, skuLabel, packageLabel } from "@/domain/selectors/planTotals";
import { ACCOUNT_BY_ID } from "@/data/accounts";
import { DISTRIBUTOR_BY_ID, TERRITORY_BY_ID, PERIOD_BY_ID, PROMOTION_BY_ID } from "@/data/trade";
import { exportPlanCsvs } from "@/lib/export/planExport";
import { Button } from "@/components/primitives/Button";
import styles from "./CommitmentSheetPage.module.css";

const APPROVAL_STAGES = [
  { label: "Sales Executive review", gate: "Lines, placements and delivery weeks confirmed." },
  { label: "Distributor inventory validation", gate: "Southern Glazer's confirms stock and delivery capacity." },
  { label: "Market Manager approval", gate: "Allowance spend approved against period budget." },
  { label: "Delivery planning", gate: "Loads scheduled against the requested weeks." },
  { label: "Retail activation", gate: "Reps execute placements and confirm with photos." },
  { label: "Post-promotion review", gate: "Depletions measured against modeled lift." },
];

/**
 * The Period Commitment Plan.
 *
 * Named a commitment plan rather than an order sheet on purpose: an
 * order sheet implies the supplier is placing a purchase order, and what
 * a DSE actually leaves behind after a distributor meeting is a
 * commitment document. The rename is the three-tier correction made
 * visible on the page a hiring manager is most likely to print.
 *
 * This route is print-first. It renders as a document and is styled for
 * screen second, which is the opposite of the usual order and the reason
 * the PDF looks like a document rather than a screenshot of a web page.
 */
export function CommitmentSheetPage() {
  const plan = usePlan();
  const dispatch = usePlanDispatch();
  const territory = useTerritory();
  const [submitted, setSubmitted] = useState<string | null>(plan.submittedRequestId);

  const totals = useMemo(() => computeTotals(plan), [plan]);
  const distributor = DISTRIBUTOR_BY_ID[territory.distributorId];
  const terr = TERRITORY_BY_ID[territory.territoryId];
  const period = PERIOD_BY_ID[territory.periodId];

  const preparedDate = period?.startDate ?? "";

  const followUps = useMemo(
    () =>
      [...new Set(plan.retail.map((l) => l.accountId))]
        .map((id) => ACCOUNT_BY_ID[id])
        .filter(Boolean),
    [plan.retail],
  );

  if (plan.retail.length === 0 && plan.sellIn.length === 0) {
    return (
      <div className={styles.empty}>
        <h1>No plan to print</h1>
        <p>Add lines from the Maps tab first.</p>
        <Link to="/maps">Back to the map</Link>
      </div>
    );
  }

  const submit = () => {
    // Deterministic, sequence-based id. No payment, no transmission, no
    // reservation of anything.
    const n = String(plan.retail.length + plan.sellIn.length).padStart(4, "0");
    const id = `OS-DEMO-2026-${n}`;
    dispatch({ type: "SUBMIT", requestId: id });
    setSubmitted(id);
  };

  return (
    <div className={styles.page}>
      <div className={`${styles.toolbar} no-print`}>
        <Link to="/plan" className={styles.back}>
          Back to plan
        </Link>
        <div className={styles.toolbarActions}>
          <Button onClick={() => exportPlanCsvs(plan, territory.scenarioName)}>
            Export CSV
          </Button>
          <Button variant="primary" onClick={() => window.print()}>
            Print or save as PDF
          </Button>
        </div>
      </div>

      <article className={styles.sheet}>
        <header className={styles.sheetHead}>
          <div>
            <p className={styles.eyebrow}>Period commitment plan</p>
            <h1 className={styles.docTitle}>{territory.scenarioName}</h1>
          </div>
          <dl className={styles.meta}>
            <div><dt>Distributor</dt><dd>{distributor?.name}{distributor?.parent ? `, ${distributor.parent}` : ""}</dd></div>
            <div><dt>Facility</dt><dd>{distributor?.facilityAddress}, {distributor?.city}</dd></div>
            <div><dt>Territory</dt><dd>{terr?.name}</dd></div>
            <div><dt>Period</dt><dd>{period?.label}</dd></div>
            <div><dt>Prepared by</dt><dd>Nathan J. Song</dd></div>
            <div><dt>Date prepared</dt><dd>{preparedDate}</dd></div>
            {submitted ? (
              <div><dt>Demo request</dt><dd className="num">{submitted}</dd></div>
            ) : null}
          </dl>
        </header>

        <p className={styles.disclaimerTop}>
          Independent portfolio prototype. Product, inventory, pricing,
          account and performance figures are illustrative or modeled and are
          not supplied or endorsed by Ole Smoky, any distributor, or any
          retailer named.
        </p>

        {/* --- Ledger 1 ------------------------------------------------ */}
        <section className={styles.block}>
          <h2 className={styles.blockTitle}>
            1 · Sell-in commitment
            <span>Ole Smoky to {distributor?.name}</span>
          </h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Brand and package</th>
                <th className={styles.r}>Cases</th>
                <th className={styles.r}>Pallets</th>
                <th className={styles.r}>$/case</th>
                <th className={styles.r}>Extended</th>
                <th>Promotion</th>
                <th className={styles.r}>Allowance</th>
                <th className={styles.r}>Net</th>
                <th>Delivery</th>
              </tr>
            </thead>
            <tbody>
              {plan.sellIn.map((l) => {
                const promo = l.promotionId ? PROMOTION_BY_ID[l.promotionId] : undefined;
                const ext = l.cases * l.illustrativePricePerCase;
                const allow = promo ? l.cases * promo.distributorAllowancePerCase : 0;
                return (
                  <tr key={l.id}>
                    <td>{skuLabel(l.skuId)}</td>
                    <td className={`${styles.r} num`}>{l.cases}</td>
                    <td className={`${styles.r} num`}>{l.pallets.toFixed(2)}</td>
                    <td className={`${styles.r} num`}>${l.illustrativePricePerCase.toFixed(2)}</td>
                    <td className={`${styles.r} num`}>${ext.toFixed(2)}</td>
                    <td>{promo?.name ?? "—"}</td>
                    <td className={`${styles.r} num`}>{allow > 0 ? `-$${allow.toFixed(2)}` : "—"}</td>
                    <td className={`${styles.r} num`}>${(ext - allow).toFixed(2)}</td>
                    <td>{l.deliveryWeek}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <th>Total</th>
                <th className={`${styles.r} num`}>
                  {plan.sellIn.reduce((s, l) => s + l.cases, 0)}
                </th>
                <th className={`${styles.r} num`}>{totals.totalPallets.toFixed(2)}</th>
                <th />
                <th className={`${styles.r} num`}>${totals.illustrativeGross.toFixed(2)}</th>
                <th />
                <th className={`${styles.r} num`}>-${totals.allowanceTotal.toFixed(2)}</th>
                <th className={`${styles.r} num`}>${totals.illustrativeNet.toFixed(2)}</th>
                <th />
              </tr>
            </tfoot>
          </table>
        </section>

        {/* --- Ledger 2 ------------------------------------------------ */}
        <section className={styles.block}>
          <h2 className={styles.blockTitle}>
            2 · Retail execution plan
            <span>{distributor?.name} to retail</span>
          </h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Account</th>
                <th>Channel</th>
                <th>Brand and package</th>
                <th className={styles.r}>Cases</th>
                <th>Closes void</th>
                <th>Placement</th>
                <th>Owner</th>
                <th>Delivery</th>
              </tr>
            </thead>
            <tbody>
              {plan.retail.map((l) => {
                const a = ACCOUNT_BY_ID[l.accountId];
                return (
                  <tr key={l.id}>
                    <td>{a?.chainName}, {a?.city}</td>
                    <td className={styles.small}>{a?.channel.replace("-", " ")}</td>
                    <td>
                      {skuLabel(l.skuId)}
                      <span className={styles.pkg}> · {packageLabel(l.skuId)}</span>
                    </td>
                    <td className={`${styles.r} num`}>{l.cases}</td>
                    <td>{l.closesVoid ? "Yes" : "—"}</td>
                    <td className={styles.small}>{l.commitment.recommendedLocation}</td>
                    <td className={styles.small}>{l.commitment.ownerRole}</td>
                    <td>{l.deliveryWeek}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className={styles.tiedHouse}>
            This ledger carries no monetary value by design. Allowances are
            paid to {distributor?.name} on the sell-in ledger above.
            California ABC has stated there is no exception permitting cash
            payments from a supplier to a retailer, so retail support here is
            an execution commitment pursued by the distributor{"'"}s reps.
          </p>
        </section>

        {/* --- Summary ------------------------------------------------- */}
        <section className={`${styles.block} avoid-break`}>
          <h2 className={styles.blockTitle}>Summary</h2>
          <dl className={styles.summary}>
            <div><dt>Accounts</dt><dd className="num">{totals.accounts}</dd></div>
            <div><dt>Unique SKUs</dt><dd className="num">{totals.uniqueSkus}</dd></div>
            <div><dt>Total cases</dt><dd className="num">{totals.totalCases}</dd></div>
            <div><dt>Total pallets</dt><dd className="num">{totals.totalPallets.toFixed(2)}</dd></div>
            <div><dt>Voids closed</dt><dd className="num">{totals.voidsClosed}</dd></div>
            <div><dt>Illustrative gross</dt><dd className="num">${totals.illustrativeGross.toLocaleString()}</dd></div>
            <div><dt>Allowance</dt><dd className="num">${totals.allowanceTotal.toLocaleString()}</dd></div>
            <div><dt>Illustrative net</dt><dd className="num">${totals.illustrativeNet.toLocaleString()}</dd></div>
            <div><dt>Base weekly cases</dt><dd className="num">{totals.baseWeeklyCases}</dd></div>
            <div><dt>Incremental weekly</dt><dd className="num">{totals.incrementalWeeklyCases}</dd></div>
            <div><dt>Modeled ROI</dt><dd className="num">{totals.modeledROI ? `${totals.modeledROI}x` : "—"}</dd></div>
          </dl>
        </section>

        {/* --- Execution commitments ----------------------------------- */}
        <section className={`${styles.block} avoid-break`}>
          <h2 className={styles.blockTitle}>Execution commitments</h2>
          <ul className={styles.commitments}>
            <li><span className="num">{totals.coldBoxCount}</span> back-shelf placements</li>
            <li><span className="num">{totals.endcapCount}</span> endcaps</li>
            <li><span className="num">{totals.displayCount}</span> displays and floor stacks</li>
            <li><span className="num">{followUps.length}</span> accounts requiring a follow-up visit</li>
          </ul>
          <p className={styles.followList}>
            {followUps.map((a) => `${a.chainName} (${a.city})`).join(" · ")}
          </p>
        </section>

        {/* --- Approval workflow --------------------------------------- */}
        <section className={`${styles.block} avoid-break`}>
          <h2 className={styles.blockTitle}>
            Approval workflow
            <span>Prototype workflow. Nothing below is transmitted.</span>
          </h2>
          <ol className={styles.stages}>
            {APPROVAL_STAGES.map((s, i) => (
              <li key={s.label}>
                <span className={`${styles.stageNum} num`}>{i + 1}</span>
                <span>
                  <strong>{s.label}</strong>
                  <span className={styles.stageGate}>{s.gate}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <div className={`${styles.submitRow} no-print`}>
          {submitted ? (
            <p className={styles.confirmed}>
              Allocation request saved as a portfolio demonstration. No real
              order or inventory reservation has been created. Reference{" "}
              <strong className="num">{submitted}</strong>.
            </p>
          ) : (
            <Button variant="primary" onClick={submit}>
              Submit allocation request
            </Button>
          )}
        </div>

        <p className={`${styles.disclaimerBottom} print-disclaimer`}>
          Independent portfolio prototype by Nathan J. Song. Not affiliated
          with, commissioned by, or endorsed by Ole Smoky Distillery,
          Southern Glazer's Wine & Spirits, or any retailer named.
          All commercial figures are illustrative or modeled.
        </p>
      </article>
    </div>
  );
}
