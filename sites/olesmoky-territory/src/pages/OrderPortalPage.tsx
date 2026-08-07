import { useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { DISTRIBUTOR_BY_ID, PERIOD_BY_ID, CURRENT_PERIOD_ID } from "@/data/trade";
import { PACKAGE_BY_ID } from "@/data/packageFormats";
import { SKU_BY_ID } from "@/data/skus";
import { supplySignals, accountsOutOf, accountsLowOn, type SupplySignal } from "@/domain/selectors/supply";
import { BrandMark } from "@/components/primitives/BrandMark";
import styles from "./OrderPortalPage.module.css";

/**
 * The distributor order portal.
 *
 * This is the page a Southern Glazer's order desk lands on from an email, so it is
 * built for someone who did not ask to be here: no app chrome, no
 * navigation, no jargon they have to decode. One question at the top,
 * a pre-filled order they can accept in one click, and a reason attached
 * to every line so it does not read as a supplier pushing inventory.
 *
 * Deep-linkable by construction. Every piece of state that matters lives
 * in the URL, so a link pasted into an email reproduces exactly what the
 * sender saw, and a static stub exists at this path so the link survives
 * a cold open with no client-side routing.
 *
 * Nothing here transmits. Confirming records a demonstration reference
 * and says so plainly.
 */
export function OrderPortalPage() {
  const { distributorId } = useParams();
  const [params] = useSearchParams();

  const distributor = DISTRIBUTOR_BY_ID[distributorId ?? "southern-glazers-cerritos"];
  const period = PERIOD_BY_ID[params.get("period") ?? CURRENT_PERIOD_ID];
  const reference = params.get("ref") ?? "OS-DEMO-2026-0001";

  const signals = useMemo(() => supplySignals(), []);

  /**
   * Preselection comes from the link. `?sku=a,b,c` names the lines the
   * email was about; without it the portal falls back to everything under
   * real supply pressure, so a bare link is still useful.
   */
  const preselected = useMemo(() => {
    const fromUrl = (params.get("sku") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((id) => SKU_BY_ID[id]);
    if (fromUrl.length > 0) return fromUrl;
    return signals.filter((s) => s.urgency !== "watch").map((s) => s.skuId);
  }, [params, signals]);

  const initialQty = useMemo(() => {
    const q: Record<string, number> = {};
    const casesParam = (params.get("cases") ?? "")
      .split(",")
      .map((n) => Number(n.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    preselected.forEach((skuId, i) => {
      const sig = signals.find((s) => s.skuId === skuId);
      q[skuId] = casesParam[i] ?? sig?.recommendedCases ?? 12;
    });
    return q;
  }, [preselected, params, signals]);

  const [selected, setSelected] = useState<Set<string>>(new Set(preselected));
  const [qty, setQty] = useState<Record<string, number>>(initialQty);
  const [week, setWeek] = useState(params.get("week") ?? "Week 1");
  const [note, setNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? signals : signals.filter((s) => s.urgency !== "watch" || selected.has(s.skuId));

  const totals = useMemo(() => {
    let cases = 0;
    let pallets = 0;
    for (const id of selected) {
      const c = qty[id] ?? 0;
      cases += c;
      const pkg = PACKAGE_BY_ID[SKU_BY_ID[id]?.packageFormatId ?? ""];
      if (pkg?.casesPerPallet) pallets += c / pkg.casesPerPallet;
    }
    return { cases, pallets, lines: selected.size };
  }, [selected, qty]);

  const toggle = (skuId: string, sig: SupplySignal) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(skuId)) next.delete(skuId);
      else {
        next.add(skuId);
        setQty((q) => ({ ...q, [skuId]: q[skuId] ?? sig.recommendedCases }));
      }
      return next;
    });
  };

  const bump = (skuId: string, delta: number) =>
    setQty((q) => ({ ...q, [skuId]: Math.max(0, (q[skuId] ?? 0) + delta) }));

  /** Back to the order as it arrived, without losing the week or the note. */
  const resetAll = () => {
    setSelected(new Set(preselected));
    setQty(initialQty);
    setShowAll(false);
  };

  if (confirmed) {
    return (
      <div className={styles.portal}>
        <div className={styles.confirmCard}>
          <span className={styles.check} aria-hidden="true">✓</span>
          <h1>Order request recorded</h1>
          <p className={styles.confirmLead}>
            {totals.lines} line{totals.lines === 1 ? "" : "s"}, {totals.cases} cases,{" "}
            {totals.pallets.toFixed(1)} pallets, requested for {week}.
          </p>
          <p className={styles.demoNote}>
            This is a portfolio demonstration. No purchase order was created,
            no inventory was reserved, and no message was sent to anyone.
            Reference <strong className="num">{reference}</strong>.
          </p>
          <button type="button" className={styles.secondary} onClick={() => setConfirmed(false)}>
            Back to the order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.portal}>
      <span className={styles.demoBadge}>
        <span aria-hidden="true">●</span> Demo workflow. Nothing is ordered and
        nothing is sent.
      </span>

      <header className={styles.head}>
        <p className={styles.eyebrow}>Replenishment recommendation</p>
        <h1>
          {distributor?.name ?? "Distributor"}, {period?.label ?? "current period"}
        </h1>
        <p className={styles.lede}>
          Prepared by Nathan J. Song, Ole Smoky. These SKUs are running
          short across Territory 12. Adjust anything that looks wrong and
          send it back.
        </p>
        <dl className={styles.meta}>
          <div><dt>Reference</dt><dd className="num">{reference}</dd></div>
          <div><dt>Ship to</dt><dd>{distributor?.facilityAddress}, {distributor?.city}</dd></div>
          <div><dt>Territory</dt><dd>Territory 12, East LA County</dd></div>
        </dl>
      </header>

      <ol className={styles.steps}>
        <li><span className="num">1</span> Check the quantities</li>
        <li><span className="num">2</span> Pick a delivery week</li>
        <li><span className="num">3</span> Send it back</li>
      </ol>

      <section className={styles.lines} aria-label="Recommended order lines">
        {visible.map((s) => {
          const on = selected.has(s.skuId);
          const out = accountsOutOf(s.skuId);
          const low = accountsLowOn(s.skuId);
          const cases = qty[s.skuId] ?? s.recommendedCases;
          const pallets = s.casesPerPallet ? cases / s.casesPerPallet : 0;

          return (
            <article
              key={s.skuId}
              className={[styles.line, on ? styles.lineOn : ""].filter(Boolean).join(" ")}
            >
              <label className={styles.pick}>
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggle(s.skuId, s)}
                  aria-label={`Include ${s.label}`}
                />
              </label>

              <BrandMark brandId={s.brandId} size="sm" />

              <div className={styles.lineBody}>
                <div className={styles.lineTop}>
                  <span className={styles.lineName}>{s.label}</span>
                  <span
                    className={[
                      styles.urgency,
                      s.urgency === "critical" ? styles.uCritical : s.urgency === "high" ? styles.uHigh : styles.uWatch,
                    ].join(" ")}
                  >
                    <span aria-hidden="true">
                      {s.urgency === "critical" ? "▲" : s.urgency === "high" ? "◆" : "○"}
                    </span>
                    {s.urgency === "critical" ? "Out at multiple accounts" : s.urgency === "high" ? "Running short" : "Watch"}
                  </span>
                </div>

                <p className={styles.why}>
                  {out.length > 0 ? (
                    <><strong>Out of stock at {out.slice(0, 3).join(", ")}</strong>
                      {out.length > 3 ? ` and ${out.length - 3} more` : ""}. </>
                  ) : null}
                  {low.length > 0 ? <>Running low at {low.slice(0, 3).join(", ")}. </> : null}
                  {s.weeklyDepletion} modeled cases a week depleting across{" "}
                  {s.accountsCarrying} accounts.
                </p>
              </div>

              <div className={styles.qtyBlock}>
                <span className={styles.qtyLabel}>Cases</span>
                <div className={styles.stepper}>
                  <button
                    type="button"
                    onClick={() => bump(s.skuId, -12)}
                    disabled={!on}
                    aria-label={`Decrease cases of ${s.label}`}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={0}
                    step={12}
                    className="num"
                    value={cases}
                    disabled={!on}
                    aria-label={`Cases of ${s.label}`}
                    onChange={(e) =>
                      setQty((q) => ({ ...q, [s.skuId]: Math.max(0, Number(e.target.value)) }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => bump(s.skuId, 12)}
                    disabled={!on}
                    aria-label={`Increase cases of ${s.label}`}
                  >
                    +
                  </button>
                </div>
                <span className={styles.pallets}>
                  {pallets.toFixed(2)} pallets · {s.packageLabel}
                </span>
                {cases !== s.recommendedCases && on ? (
                  <button
                    type="button"
                    className={styles.reset}
                    onClick={() => setQty((q) => ({ ...q, [s.skuId]: s.recommendedCases }))}
                  >
                    Reset to {s.recommendedCases}
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}

        <button type="button" className={styles.showAll} onClick={() => setShowAll((v) => !v)}>
          {showAll ? "Show only what is short" : `Show the full portfolio (${signals.length} SKUs)`}
        </button>
      </section>

      <section className={styles.footer}>
        <div className={styles.deliveryBlock}>
          <span className={styles.fieldLabel}>Delivery week</span>
          <div className={styles.weekPick} role="group" aria-label="Delivery week">
            {["Week 1", "Week 2", "Week 3", "Week 4"].map((w) => (
              <button
                key={w}
                type="button"
                className={[styles.weekBtn, week === w ? styles.weekOn : ""].filter(Boolean).join(" ")}
                aria-pressed={week === w}
                onClick={() => setWeek(w)}
              >
                {w}
              </button>
            ))}
          </div>

          <label className={styles.noteLabel}>
            <span className={styles.fieldLabel}>Anything we should know</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Capacity, timing, or a quantity you want changed"
            />
          </label>
        </div>

        <aside className={styles.summary}>
          <h2>Your order</h2>
          <dl>
            <div><dt>Lines</dt><dd className="num">{totals.lines}</dd></div>
            <div><dt>Cases</dt><dd className="num">{totals.cases}</dd></div>
            <div><dt>Pallets</dt><dd className="num">{totals.pallets.toFixed(2)}</dd></div>
            <div><dt>Delivery</dt><dd>{week}</dd></div>
          </dl>
          <button
            type="button"
            className={styles.primary}
            disabled={totals.lines === 0}
            onClick={() => setConfirmed(true)}
          >
            Send order back to Ole Smoky
          </button>
          <button type="button" className={styles.resetAll} onClick={resetAll}>
            Put the suggested numbers back
          </button>
          <p className={styles.smallprint}>
            Nothing is transmitted. This records a demonstration reference
            only.
          </p>
        </aside>
      </section>

      <p className={styles.disclaimer}>
        Independent portfolio prototype by Nathan J. Song. Not affiliated
        with, commissioned by, or endorsed by Ole Smoky Distillery,
        Southern Glazer's Wine & Spirits, or Southern Glazer's. Depletion, inventory
        and account figures are modeled.{" "}
        <Link to="/method">Methodology and limitations</Link>
      </p>
    </div>
  );
}
