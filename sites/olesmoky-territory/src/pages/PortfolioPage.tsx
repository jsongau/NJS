import { useMemo, useState } from "react";
import { brandDistribution, voidsForBrand, type BrandDistribution } from "@/domain/selectors/portfolio";
import { ACCOUNT_BY_ID } from "@/data/accounts";
import { BrandMark } from "@/components/primitives/BrandMark";
import { PackageGlyph } from "@/components/primitives/PackageGlyph";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { Button } from "@/components/primitives/Button";
import { usePlanDispatch } from "@/state/PlanProvider";
import { suggestedCasesForVoid, recommendedPlacement } from "@/domain/selectors/volume";
import { statusFor } from "@/data/accountSkuStatus";
import { FAMILY, FAMILY_ORDER } from "@/domain/vocabulary";
import styles from "./PortfolioPage.module.css";

export function PortfolioPage() {
  const dispatch = usePlanDispatch();
  const [open, setOpen] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);

  const brands = useMemo(() => {
    const all = brandDistribution();
    return FAMILY_ORDER.flatMap((f) =>
      all
        .filter((b) => b.family === f)
        .sort((a, b) => b.voidCases - a.voidCases),
    );
  }, []);

  /** Build a sell-in plan for every open void on a brand, in one action. */
  const closeAllVoids = (brand: BrandDistribution) => {
    const rows = voidsForBrand(brand.brandId);
    for (const row of rows) {
      const { cases } = suggestedCasesForVoid(row.accountId, row.skuId);
      const placement = recommendedPlacement(row.accountId, row.skuId);
      const status = statusFor(row.accountId, row.skuId);
      dispatch({
        type: "ADD_RETAIL_LINE",
        accountId: row.accountId,
        skuId: row.skuId,
        cases,
        closesVoid: true,
        deliveryWeek: "Week 1",
        promotionId: brand.family === "above-premium" ? "above-premium-shelf-2026" : "labor-day-2026",
        commitment: {
          placement: placement.placement as never,
          recommendedLocation: placement.location,
          posMaterials: ["Case card", "Shelf talker"],
          ownerRole: "Distributor account rep",
          executionNotes: placement.rationale,
        },
      });
      dispatch({
        type: "ADD_SELL_IN_LINE",
        skuId: row.skuId,
        cases,
        pricePerCase: status?.shelfPricePoint ? status.shelfPricePoint * 0.62 : 22,
        deliveryWeek: "Week 1",
        promotionId: brand.family === "above-premium" ? "above-premium-shelf-2026" : "labor-day-2026",
      });
    }
    setAdded(`${rows.length} lines added from ${brand.name}`);
    window.setTimeout(() => setAdded(null), 2600);
  };

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <h1>Portfolio</h1>
          <p className={styles.lede}>
            The same territory read down the brand axis. A brand that is
            under-distributed across the whole territory is a sell-in story.
            A brand missing from one store is the rep{"'"}s next call.
          </p>
        </div>
      </header>

      {added ? <p className={styles.toast}>{added}</p> : null}

      {FAMILY_ORDER.map((family) => {
        const group = brands.filter((b) => b.family === family);
        if (group.length === 0) return null;
        return (
          <section key={family} className={styles.family}>
            <h2 className={styles.familyTitle}>{FAMILY[family].label}</h2>
            <div className={styles.grid}>
              {group.map((b) => {
                const isOpen = open === b.brandId;
                const rate = Math.round(b.distributionRate * 100);
                return (
                  <article
                    key={b.brandId}
                    className={[styles.card, b.active ? "" : styles.cardInactive]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <div className={styles.cardTop}>
                      <BrandMark brandId={b.brandId} size="lg" />
                      <div className={styles.cardHead}>
                        <h3 className={styles.brandName}>{b.name}</h3>
                        {!b.active ? (
                          <p className={styles.inactiveNote}>
                            Held in the record, not offered for planning.
                            Status unverified for this period.
                          </p>
                        ) : (
                          <p className={styles.role}>
                            {b.strategicRole}
                            {b.strategicRoleSource ? (
                              <span className={styles.source}>
                                {" "}
                                {b.strategicRoleSource}
                              </span>
                            ) : null}
                          </p>
                        )}
                      </div>
                    </div>

                    {b.active ? (
                      <>
                        <dl className={styles.stats}>
                          <div>
                            <dt>PODs</dt>
                            <dd className="num">{b.pods}</dd>
                          </div>
                          <div className={b.voids > 0 ? styles.gap : ""}>
                            <dt>Voids</dt>
                            <dd className="num">{b.voids}</dd>
                          </div>
                          <div className={b.voidCases > 0 ? styles.gap : ""}>
                            <dt>
                              Void cases
                              <ProvenanceBadge provenance="modeled" compact />
                            </dt>
                            <dd className="num">{b.voidCases}</dd>
                          </div>
                          <div>
                            <dt>Accounts</dt>
                            <dd className="num">
                              {b.accountsCarrying}/{b.accountsPossible}
                            </dd>
                          </div>
                        </dl>

                        <div className={styles.rateRow}>
                          <span className={styles.track}>
                            <span
                              className={styles.fill}
                              style={{ width: `${rate}%` }}
                              aria-hidden="true"
                            />
                          </span>
                          <span className={`${styles.rateNum} num`}>{rate}%</span>
                        </div>

                        <div className={styles.actions}>
                          <button
                            type="button"
                            className={styles.expand}
                            onClick={() => setOpen(isOpen ? null : b.brandId)}
                            aria-expanded={isOpen}
                          >
                            {isOpen ? "Hide packages" : `${b.skus.length} packages`}
                          </button>
                          {/* "Close 11 voids" was supplier language: it
                              described a store as a hole in a distribution
                              number. Same action; the label now says whose
                              shop it is. */}
                          {b.voids > 0 ? (
                            <Button size="sm" onClick={() => closeAllVoids(b)}>
                              Get it into {b.voids} store
                              {b.voids === 1 ? "" : "s"}
                            </Button>
                          ) : null}
                        </div>

                        {isOpen ? (
                          <table className={styles.skuTable}>
                            <thead>
                              <tr>
                                <th>Package</th>
                                <th className={styles.r}>PODs</th>
                                <th className={styles.r}>Voids</th>
                                <th className={styles.r}>Cases</th>
                              </tr>
                            </thead>
                            <tbody>
                              {b.skus.map((s) => (
                                <tr key={s.skuId}>
                                  <td className={styles.pkgCell}>
                                    <PackageGlyph skuId={s.skuId} size={13} />
                                    {s.packageLabel}
                                    {s.innovation2026 ? (
                                      <span className={styles.newTag}>2026</span>
                                    ) : null}
                                  </td>
                                  <td className={`${styles.r} num`}>{s.pods}</td>
                                  <td className={`${styles.r} num`}>{s.voids}</td>
                                  <td className={`${styles.r} num`}>{s.voidCases}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : null}
                      </>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}

      <section className={styles.gapCall}>
        <h2>Biggest single gap in the territory</h2>
        <TopGap />
      </section>
    </div>
  );
}

function TopGap() {
  const rows = useMemo(() => {
    const all = brandDistribution().filter((b) => b.active);
    const innovation = all.flatMap((b) =>
      b.skus
        .filter((s) => s.innovation2026 && s.voids > 0)
        .map((s) => ({ brand: b.name, brandId: b.brandId, ...s })),
    );
    return innovation.sort((a, b) => b.voidCases - a.voidCases).slice(0, 5);
  }, []);

  if (rows.length === 0) return <p>No open innovation voids.</p>;

  const accountsFor = (skuId: string) =>
    voidsForBrand(rows.find((r) => r.skuId === skuId)?.brandId ?? "")
      .filter((r) => r.skuId === skuId)
      .map((r) => ACCOUNT_BY_ID[r.accountId]?.chainName)
      .filter(Boolean);

  return (
    <>
      <p className={styles.gapLede}>
        The published 2026 innovation slate, unplaced. New-item distribution
        is the part of the job that does not happen by itself.
      </p>
      <ul className={styles.gapList}>
        {rows.map((r) => (
          <li key={r.skuId}>
            <BrandMark brandId={r.brandId} size="sm" />
            <span className={styles.gapSku}>{r.label}</span>
            <span className={`${styles.gapCases} num`}>{r.voidCases} cs/wk</span>
            <span className={styles.gapWhere}>
              missing at {accountsFor(r.skuId).slice(0, 4).join(", ")}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
