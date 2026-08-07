import { Fragment, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePlan, usePlanDispatch, type DistributorDisposition } from "@/state/PlanProvider";
import { useTerritory } from "@/state/TerritoryProvider";
import { skuLabel, packageLabel } from "@/domain/selectors/planTotals";
import { DISTRIBUTOR_BY_ID, PROMOTION_BY_ID, PERIOD_BY_ID } from "@/data/trade";
import { ACCOUNT_BY_ID } from "@/data/accounts";
import { PACKAGE_BY_ID } from "@/data/packageFormats";
import { SKU_BY_ID } from "@/data/skus";
import { BrandMark } from "@/components/primitives/BrandMark";
import { Button } from "@/components/primitives/Button";
import styles from "./DistributorPage.module.css";

const WEEKS = ["Week 1", "Week 2", "Week 3", "Week 4"];

const REASONS = [
  "Warehouse capacity this period",
  "Existing inventory covers part of it",
  "Truck and delivery window constraint",
  "Want to see sell-through first",
  "Pricing needs review",
];

/**
 * Distributor Mode.
 *
 * This is the other side of every transaction the app models, and until
 * now the application did not have it. In a three-tier market the
 * distributor BUYS from the supplier, which means the sell-in commitment
 * is a proposal, not an instruction. Southern Glazer's can take it, take less, or
 * decline, and a Distributor Sales Executive does not get a vote.
 *
 * The interesting behaviour is the coherence check at the bottom. If the
 * distributor accepts fewer cases than the retail execution plan has
 * already promised to stores, those promises are now unfunded. Real
 * plans break exactly there, and surfacing it is the difference between
 * a demo and something that behaves like a working tool.
 */
export function DistributorPage() {
  const plan = usePlan();
  const dispatch = usePlanDispatch();
  const territory = useTerritory();
  const [expanded, setExpanded] = useState<string | null>(null);

  const distributor = DISTRIBUTOR_BY_ID[territory.distributorId];
  const period = PERIOD_BY_ID[territory.periodId];

  const rows = useMemo(
    () =>
      plan.sellIn.map((l) => {
        const response = plan.distributorResponses[l.id];
        const accepted = response?.acceptedCases ?? l.cases;
        const promo = l.promotionId ? PROMOTION_BY_ID[l.promotionId] : undefined;
        const pkg = PACKAGE_BY_ID[SKU_BY_ID[l.skuId]?.packageFormatId ?? ""];
        // Which stores are counting on this SKU, and for how many cases.
        const promisedTo = plan.retail.filter((r) => r.skuId === l.skuId);
        const promisedCases = promisedTo.reduce((s, r) => s + r.cases, 0);
        return {
          line: l,
          response,
          accepted,
          promo,
          pallets: pkg && pkg.casesPerPallet > 0 ? accepted / pkg.casesPerPallet : 0,
          promisedTo,
          promisedCases,
          shortfall: Math.max(0, promisedCases - accepted),
        };
      }),
    [plan.sellIn, plan.retail, plan.distributorResponses],
  );

  const totals = useMemo(() => {
    const requested = plan.sellIn.reduce((s, l) => s + l.cases, 0);
    const accepted = rows.reduce(
      (s, r) => s + (r.response?.disposition === "declined" ? 0 : r.accepted),
      0,
    );
    const value = rows.reduce(
      (s, r) =>
        s +
        (r.response?.disposition === "declined" ? 0 : r.accepted) *
          r.line.illustrativePricePerCase,
      0,
    );
    const responded = rows.filter(
      (r) => r.response && r.response.disposition !== "pending",
    ).length;
    const unfunded = rows.reduce((s, r) => s + r.shortfall, 0);
    const affectedAccounts = new Set(
      rows.flatMap((r) => (r.shortfall > 0 ? r.promisedTo.map((p) => p.accountId) : [])),
    );
    return { requested, accepted, value, responded, unfunded, affectedAccounts };
  }, [rows, plan.sellIn]);

  if (plan.sellIn.length === 0) {
    return (
      <div className={styles.empty}>
        <h1>Nothing to review</h1>
        <p>
          There is no sell-in commitment for {period?.label} yet. Send a store
          its order from the order desk and the retail promises land in the
          plan; the sell-in they require is what Southern Glazer's reviews here.
        </p>
        {/* The relationship does not start at the order. Even with nothing
            to review, what their reps can do at retail is worth reading,
            so this link exists on both states of the page. */}
        <div className={styles.emptyLinks}>
          <Link to="/">Go to the order desk</Link>
          <Link to="/training">How I would train their team</Link>
        </div>
      </div>
    );
  }

  const respond = (
    lineId: string,
    disposition: DistributorDisposition,
    acceptedCases: number | null,
    reason?: string,
    deliveryWeek?: string,
  ) => dispatch({ type: "DISTRIBUTOR_RESPOND", lineId, disposition, acceptedCases, reason, deliveryWeek });

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>Distributor view</p>
          <h1>{distributor?.name} order review</h1>
          <p className={styles.sub}>
            {territory.scenarioName} · {period?.label} · proposed by Ole Smoky
            Distillery
          </p>
        </div>
        <div className={styles.headActions}>
          {/* The order is half the relationship. What their reps can do at
              retail once they have bought it is the other half, and it is
              the half that carries past this period. */}
          <Link className={styles.trainLink} to="/training">
            How I would train their team
          </Link>
          <Button onClick={() => dispatch({ type: "DISTRIBUTOR_RESET" })}>
            Reset review
          </Button>
          <Button
            variant="primary"
            onClick={() => dispatch({ type: "DISTRIBUTOR_CONFIRM_ALL" })}
          >
            Accept all as proposed
          </Button>
        </div>
      </header>

      <p className={styles.framing}>
        In a three-tier market the distributor buys from the supplier, so
        this is a proposal rather than an instruction. Southern Glazer's can accept a
        line, take fewer cases, or decline it, and the supplier does not
        get a vote. Anything the distributor does not buy cannot be
        delivered to a store, which is what the coherence check below is for.
      </p>

      <section className={styles.totals}>
        <Stat label="Lines" value={plan.sellIn.length} />
        <Stat label="Reviewed" value={`${totals.responded}/${plan.sellIn.length}`} />
        <Stat label="Cases proposed" value={totals.requested} />
        <Stat label="Cases accepted" value={totals.accepted} emphasis />
        <Stat
          label="Illustrative value"
          value={`$${Math.round(totals.value).toLocaleString()}`}
        />
        <Stat
          label="Unfunded retail cases"
          value={totals.unfunded}
          emphasis={totals.unfunded > 0}
          warn={totals.unfunded > 0}
        />
      </section>

      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Brand and package</th>
            <th scope="col" className={styles.r}>Proposed</th>
            <th scope="col" className={styles.r}>Accept</th>
            <th scope="col" className={styles.r}>Pallets</th>
            <th scope="col">Delivery</th>
            <th scope="col">Decision</th>
            <th scope="col">Reason</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const d = r.response?.disposition ?? "pending";
            const isOpen = expanded === r.line.id;
            return (
              <Fragment key={r.line.id}>
                <tr
                  className={[
                    d === "declined" ? styles.rowDeclined : "",
                    r.shortfall > 0 ? styles.rowShort : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <th scope="row" className={styles.skuCell}>
                    <BrandMark brandId={SKU_BY_ID[r.line.skuId]?.brandId ?? ""} size="xs" />
                    <span>
                      <span className={styles.skuName}>
                        {skuLabel(r.line.skuId)}
                        {/* The red left bar was the only mark on a short
                            row, which is colour carrying meaning alone.
                            Now the row says it. */}
                        {r.shortfall > 0 ? (
                          <span className={styles.shortFlag}>
                            <span aria-hidden="true">▲</span> {r.shortfall} short
                          </span>
                        ) : null}
                      </span>
                      <button
                        type="button"
                        className={styles.who}
                        onClick={() => setExpanded(isOpen ? null : r.line.id)}
                        aria-expanded={isOpen}
                      >
                        {r.promisedTo.length} account
                        {r.promisedTo.length === 1 ? "" : "s"} waiting on{" "}
                        {r.promisedCases} cs
                      </button>
                    </span>
                  </th>

                  <td className={`${styles.r} num ${styles.muted}`}>{r.line.cases}</td>

                  <td className={styles.r}>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      className={`${styles.qty} num`}
                      value={d === "declined" ? 0 : r.accepted}
                      disabled={d === "declined"}
                      aria-label={`Cases accepted of ${skuLabel(r.line.skuId)}`}
                      onChange={(e) => {
                        const v = Math.max(0, Number(e.target.value));
                        respond(
                          r.line.id,
                          v === r.line.cases ? "confirmed" : "adjusted",
                          v,
                          r.response?.reason,
                          r.response?.deliveryWeek ?? r.line.deliveryWeek,
                        );
                      }}
                    />
                  </td>

                  <td className={`${styles.r} ${styles.muted} num`}>
                    {r.pallets.toFixed(2)}
                  </td>

                  <td>
                    <select
                      className={styles.select}
                      value={r.response?.deliveryWeek ?? r.line.deliveryWeek}
                      aria-label={`Delivery week for ${skuLabel(r.line.skuId)}`}
                      onChange={(e) =>
                        respond(
                          r.line.id,
                          d === "pending" ? "confirmed" : d,
                          r.accepted,
                          r.response?.reason,
                          e.target.value,
                        )
                      }
                    >
                      {WEEKS.map((w) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <div className={styles.decision} role="group" aria-label="Decision">
                      {(["confirmed", "adjusted", "declined"] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          className={[styles.dBtn, d === opt ? styles.dOn : ""]
                            .filter(Boolean)
                            .join(" ")}
                          aria-pressed={d === opt}
                          onClick={() =>
                            respond(
                              r.line.id,
                              opt,
                              opt === "declined" ? 0 : opt === "confirmed" ? r.line.cases : r.accepted,
                              r.response?.reason,
                              r.response?.deliveryWeek ?? r.line.deliveryWeek,
                            )
                          }
                        >
                          {opt === "confirmed" ? "Take" : opt === "adjusted" ? "Adjust" : "Decline"}
                        </button>
                      ))}
                    </div>
                  </td>

                  <td>
                    {d === "adjusted" || d === "declined" ? (
                      <select
                        className={styles.select}
                        value={r.response?.reason ?? ""}
                        aria-label={`Reason for ${skuLabel(r.line.skuId)}`}
                        onChange={(e) =>
                          respond(r.line.id, d, r.accepted, e.target.value, r.response?.deliveryWeek)
                        }
                      >
                        <option value="">Select a reason</option>
                        {REASONS.map((x) => (
                          <option key={x} value={x}>{x}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={styles.muted}>—</span>
                    )}
                  </td>
                </tr>

                {isOpen ? (
                  <tr key={`${r.line.id}-detail`} className={styles.detailRow}>
                    <td colSpan={7}>
                      <div className={styles.detail}>
                        <span className={styles.detailTitle}>
                          Accounts counting on this SKU
                        </span>
                        <ul>
                          {r.promisedTo.map((p) => (
                            <li key={p.id}>
                              <span>{ACCOUNT_BY_ID[p.accountId]?.chainName}</span>
                              <span className={styles.muted}>
                                {ACCOUNT_BY_ID[p.accountId]?.city}
                              </span>
                              <span className="num">{p.cases} cs</span>
                              <span className={styles.muted}>
                                {p.commitment.recommendedLocation}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>

      {/* --- The coherence check ------------------------------------- */}
      {totals.unfunded > 0 ? (
        <section className={styles.breakage}>
          <h2>
            {totals.unfunded} retail cases are now unfunded
          </h2>
          <p>
            Southern Glazer's is taking fewer cases than the retail execution plan has
            promised to stores. Those placements cannot be delivered as
            written, and this is where a plan actually breaks. Either reduce
            the retail commitments, move them to a later delivery week, or go
            back to Southern Glazer's with a case for the volume.
          </p>
          <ul className={styles.breakList}>
            {rows
              .filter((r) => r.shortfall > 0)
              .map((r) => (
                <li key={r.line.id}>
                  <BrandMark brandId={SKU_BY_ID[r.line.skuId]?.brandId ?? ""} size="xs" />
                  <span className={styles.breakSku}>
                    {skuLabel(r.line.skuId)}
                    <span className={styles.muted}> · {packageLabel(r.line.skuId)}</span>
                  </span>
                  <span className={`${styles.breakNum} num`}>
                    {r.promisedCases} promised
                  </span>
                  <span className={`${styles.breakNum} num`}>
                    {r.response?.disposition === "declined" ? 0 : r.accepted} accepted
                  </span>
                  <span className={`${styles.breakShort} num`}>
                    {r.shortfall} short
                  </span>
                  <span className={styles.breakWho}>
                    {r.promisedTo
                      .map((p) => ACCOUNT_BY_ID[p.accountId]?.chainName)
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </li>
              ))}
          </ul>
          <p className={styles.breakFoot}>
            {totals.affectedAccounts.size} account
            {totals.affectedAccounts.size === 1 ? "" : "s"} affected.
          </p>
        </section>
      ) : totals.responded === plan.sellIn.length ? (
        <section className={styles.clean}>
          <h2>Every retail promise is funded</h2>
          <p>
            Southern Glazer's is taking at least as many cases as the retail execution
            plan has committed to stores. Nothing in the plan is stranded.
          </p>
        </section>
      ) : null}

      <div className={styles.submitRow}>
        {plan.distributorConfirmedAt ? (
          <p className={styles.confirmed}>
            Order review recorded as a portfolio demonstration. No purchase
            order was created and no inventory was reserved.
          </p>
        ) : (
          <Button
            variant="primary"
            disabled={totals.responded === 0}
            onClick={() => dispatch({ type: "DISTRIBUTOR_SUBMIT", at: "on review" })}
          >
            Return review to Ole Smoky
          </Button>
        )}
        <Link to="/plan" className={styles.backLink}>
          Back to the commitment plan
        </Link>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  emphasis,
  warn,
}: {
  label: string;
  value: string | number;
  emphasis?: boolean;
  warn?: boolean;
}) {
  return (
    <div
      className={[styles.stat, emphasis ? styles.statEmphasis : "", warn ? styles.statWarn : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={styles.statLabel}>{label}</span>
      <span className={`${styles.statValue} num`}>{value}</span>
    </div>
  );
}
