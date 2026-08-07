import { useState } from "react";
import type { OpportunityBreakdown } from "@/domain/selectors/opportunity";
import { DEFAULT_OPPORTUNITY_WEIGHTS } from "@/domain/selectors/opportunity";
import { useTerritoryDispatch } from "@/state/TerritoryProvider";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import styles from "./OpportunityExplainer.module.css";

/**
 * The opportunity score, with its arithmetic and its weights exposed.
 *
 * This component is the argument of the whole application. A score a
 * viewer cannot interrogate is a number the app asserted; a score whose
 * inputs are visible, and whose weights can be moved to watch the
 * ranking reorder, is a demonstration of how someone prioritizes
 * accounts. The second one is the thing worth showing a hiring manager.
 */

const LABELS: Record<string, string> = {
  voidCases: "Void cases",
  coldBoxGap: "Back-shelf gap",
  displayUpside: "Display upside",
  trafficTier: "Traffic tier",
  routeEfficiency: "Route efficiency",
};

export function OpportunityExplainer({
  breakdown,
}: {
  breakdown: OpportunityBreakdown;
}) {
  const [open, setOpen] = useState(false);
  const dispatch = useTerritoryDispatch();

  const keys = Object.keys(breakdown.components) as Array<
    keyof typeof breakdown.components
  >;

  return (
    <section className={styles.section} aria-label="Opportunity score">
      <div className={styles.head}>
        <div>
          <h3 className={styles.title}>
            Opportunity <ProvenanceBadge provenance="modeled" />
          </h3>
          <p className={styles.sub}>
            Weighted from five inputs. Every one is shown.
          </p>
        </div>
        <div className={styles.score}>
          <span className={`${styles.scoreNum} num`}>{breakdown.total}</span>
          <span className={styles.scoreOf}>/ 100</span>
        </div>
      </div>

      <ul className={styles.bars}>
        {keys.map((k) => {
          const value = breakdown.components[k];
          const weight = breakdown.weights[k as keyof typeof breakdown.weights];
          return (
            <li key={k}>
              <span className={styles.barLabel}>
                {LABELS[k]}
                <span className={styles.weight}>
                  ×{weight.toFixed(2)}
                </span>
              </span>
              <span className={styles.track}>
                <span
                  className={styles.fill}
                  style={{ width: `${value}%` }}
                  aria-hidden="true"
                />
              </span>
              <span className={`${styles.barValue} num`}>{value.toFixed(0)}</span>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        className={styles.toggle}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {open ? "Hide the arithmetic" : "Show the arithmetic"}
      </button>

      {open ? (
        <div className={styles.detail}>
          <ol className={styles.explain}>
            {breakdown.explain.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>

          <div className={styles.weights}>
            <p className={styles.weightsTitle}>
              Move a weight and the whole territory reorders.
            </p>
            {keys.map((k) => (
              <label key={k} className={styles.weightRow}>
                <span>{LABELS[k]}</span>
                <input
                  type="range"
                  min={0}
                  max={0.6}
                  step={0.05}
                  value={breakdown.weights[k as keyof typeof breakdown.weights]}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_WEIGHTS",
                      weights: {
                        ...breakdown.weights,
                        [k]: Number(e.target.value),
                      },
                    })
                  }
                />
                <span className="num">
                  {breakdown.weights[k as keyof typeof breakdown.weights].toFixed(2)}
                </span>
              </label>
            ))}
            <button
              type="button"
              className={styles.reset}
              onClick={() =>
                dispatch({ type: "SET_WEIGHTS", weights: DEFAULT_OPPORTUNITY_WEIGHTS })
              }
            >
              Reset to default weights
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
