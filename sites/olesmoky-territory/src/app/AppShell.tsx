import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useTerritory, useTerritoryDispatch } from "@/state/TerritoryProvider";
import { TERRITORY_BY_ID, PERIODS } from "@/data/trade";
import { ResetControl } from "@/components/primitives/ResetControl";
import { JarMark } from "@/components/primitives/JarMark";
import { MegaNav } from "./MegaNav";
import styles from "./AppShell.module.css";

/**
 * The shell.
 *
 * Five primary destinations and nothing else. Enterprise software that
 * impresses does not have twelve top-level tabs; the nav budget is tight
 * on purpose, and every other surface is reached from one of these five.
 *
 * The Demo Mode badge is fixed in the chrome rather than shown per
 * screen, because the guarantee it describes is structural: there is no
 * email transport anywhere in the dependency tree.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const territory = useTerritory();
  const dispatch = useTerritoryDispatch();

  const terr = TERRITORY_BY_ID[territory.territoryId];

  return (
    <div className={styles.shell}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className={styles.nav}>
        <NavLink
          to="/"
          className={styles.brand}
          aria-label="Nathan's Territory Planning, go to the order desk"
        >
          <JarMark size={26} fill={0.62} />
          <span className={styles.brandText}>
            <strong>Nathan&rsquo;s Territory Planning</strong>
            <span className={styles.brandSub}>Los Angeles &middot; Long Beach</span>
          </span>
        </NavLink>

        <div className={styles.context}>
          <div className={styles.contextItem}>
            <span className={styles.contextLabel}>Territory</span>
            <span className={styles.contextValue}>{terr?.name ?? "—"}</span>
          </div>
          <div className={styles.contextItem}>
            <span className={styles.contextLabel}>Period</span>
            <select
              className={styles.select}
              value={territory.periodId}
              onChange={(e) =>
                dispatch({ type: "SET_PERIOD", periodId: e.target.value })
              }
              aria-label="Fiscal period"
            >
              {PERIODS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <MegaNav />

        <ResetControl />
      </header>

      <main id="main" className={styles.main}>
        {children}
      </main>

    </div>
  );
}
