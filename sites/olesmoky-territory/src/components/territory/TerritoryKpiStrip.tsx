import { useMemo } from "react";
import { useTerritory, useTerritoryDispatch, type MapView } from "@/state/TerritoryProvider";
import { usePlan } from "@/state/PlanProvider";
import { roundCases } from "@/domain/rate";
import {
  podsForAccount,
  voidsForAccount,
  voidCasesForAccount,
  coldBoxPosition,
} from "@/domain/selectors/distribution";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import styles from "./TerritoryKpiStrip.module.css";

/**
 * The territory scorecard.
 *
 * Note what leads: PODs and voids, not cases. Cases are the output of
 * this job; points of distribution are the work. A DSE's real inventory
 * is the gap between what an account is authorized to carry and what is
 * actually on its shelf, and the strip is ordered to say so.
 */
const VIEWS: Array<{ id: MapView; label: string }> = [
  { id: "all", label: "All accounts" },
  { id: "voids", label: "With open voids" },
  { id: "in-plan", label: "In the plan" },
];

export function TerritoryKpiStrip({
  visibleAccountIds,
}: {
  visibleAccountIds: string[];
}) {
  const territory = useTerritory();
  const dispatch = useTerritoryDispatch();
  const plan = usePlan();

  const kpis = useMemo(() => {
    const ids = visibleAccountIds;
    const pods = ids.reduce((s, id) => s + podsForAccount(id), 0);
    const voidRows = ids.flatMap((id) => voidsForAccount(id));
    /*
      Rounded again after the sum, not only inside it.

      voidCasesForAccount already rounds each account. Adding twenty
      seven of those still reintroduces the binary-float tail, which is
      how "39.76000000000001" reached the largest numerals on the page.
      A rounded input does not make a rounded total.
    */
    const voidCases = roundCases(
      ids.reduce((s, id) => s + voidCasesForAccount(id), 0),
    );
    const coldGap =
      Math.round(ids.reduce((s, id) => s + coldBoxPosition(id).gapDoors, 0) * 10) / 10;
    const authorized = pods + voidRows.length;
    return {
      accounts: ids.length,
      pods,
      voids: voidRows.length,
      voidCases,
      coldGap,
      distribution: authorized > 0 ? (pods / authorized) * 100 : 0,
    };
  }, [visibleAccountIds]);

  const planCases = plan.retail.reduce((s, l) => s + l.cases, 0);

  return (
    <div className={styles.strip}>
      <div className={styles.views} role="group" aria-label="Map view">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            className={[styles.view, territory.view === v.id ? styles.viewActive : ""]
              .filter(Boolean)
              .join(" ")}
            aria-pressed={territory.view === v.id}
            onClick={() => dispatch({ type: "SET_VIEW", view: v.id })}
          >
            {v.label}
          </button>
        ))}
      </div>

      <dl className={styles.kpis}>
        <Kpi label="Accounts" value={kpis.accounts} />
        <Kpi
          label="PODs"
          value={kpis.pods}
          hint="Points of distribution: one SKU, authorized and present, in one store."
        />
        <Kpi
          label="Open voids"
          value={kpis.voids}
          emphasis
          hint="Authorized but not on the shelf. This is the addressable gap."
        />
        <Kpi
          label="Void cases / wk"
          value={kpis.voidCases}
          emphasis
          modeled
          hint="Modeled weekly cases sitting in those voids."
        />
        <Kpi
          label="Distribution"
          value={`${kpis.distribution.toFixed(0)}%`}
          hint="PODs as a share of what these accounts are authorized to carry."
        />
        <Kpi
          label="Shelf gap"
          value={`${kpis.coldGap.toFixed(1)}d`}
          emphasis
          modeled
          hint="Doors below modeled fair share, summed across the visible accounts."
        />
        <Kpi label="Plan cases" value={planCases} />
      </dl>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  emphasis,
  modeled,
}: {
  label: string;
  value: string | number;
  hint?: string;
  emphasis?: boolean;
  modeled?: boolean;
}) {
  return (
    <div
      className={[styles.kpi, emphasis ? styles.kpiEmphasis : ""]
        .filter(Boolean)
        .join(" ")}
      title={hint}
    >
      <dt>
        {label}
        {modeled ? <ProvenanceBadge provenance="modeled" compact /> : null}
      </dt>
      <dd className="num">{value}</dd>
    </div>
  );
}
