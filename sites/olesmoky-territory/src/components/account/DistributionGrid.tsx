import { useMemo, useState } from "react";
import type { Account, AccountSkuStatus } from "@/domain/types";
import { STATUS_BY_ACCOUNT } from "@/data/accountSkuStatus";
import { SKU_BY_ID } from "@/data/skus";
import { PACKAGE_BY_ID } from "@/data/packageFormats";
import { BRAND_BY_ID } from "@/data/brands";
import { weeklyRate } from "@/domain/rate";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { BrandMark } from "@/components/primitives/BrandMark";
import styles from "./DistributionGrid.module.css";

/**
 * The distribution list: the core widget of the whole application.
 *
 * This is what a Distributor Sales Executive actually looks at on a store
 * walk. For one account it answers what we are authorized to carry, what
 * is on the shelf, and what is missing.
 *
 * It was a seven-column table, which forced the drawer to scroll
 * sideways at every width below a desktop monitor. A table that has to be
 * scrolled horizontally is a table nobody reads, so this is now a stacked
 * row: identity on the first line, state on the second, action on the
 * right. Nothing was removed, and it fits a phone.
 *
 * Status is carried by a word and a glyph, never by row color. Rows worth
 * acting on get a heavier left bar and bolder type, which survives
 * greyscale and a projector.
 */

const STATUS_META = {
  distributed: { label: "On shelf", glyph: "●", cls: "distributed" },
  void: { label: "Void", glyph: "○", cls: "void" },
  "not-authorized": { label: "Not authorized", glyph: "–", cls: "notAuth" },
  discontinued: { label: "Delisted", glyph: "×", cls: "delisted" },
} as const;

const INVENTORY_META = {
  "in-stock": { label: "In stock", glyph: "●" },
  low: { label: "Low", glyph: "◐" },
  "out-of-stock": { label: "Out of stock", glyph: "○" },
  unknown: { label: "", glyph: "" },
} as const;

type Filter = "actionable" | "voids" | "all";

export function DistributionGrid({
  account,
  onAddVoid,
  linesInPlan,
}: {
  account: Account;
  onAddVoid: (row: AccountSkuStatus) => void;
  linesInPlan: Set<string>;
}) {
  const [filter, setFilter] = useState<Filter>("actionable");

  const rows = useMemo(() => {
    const all = STATUS_BY_ACCOUNT[account.id] ?? [];
    const ranked = [...all].sort((a, b) => {
      const rank = (r: AccountSkuStatus) =>
        r.status === "void" ? 0
        : r.inventoryState === "out-of-stock" ? 1
        : r.inventoryState === "low" ? 2
        : r.status === "distributed" ? 3
        : 4;
      return rank(a) - rank(b) || b.baseWeeklyCases - a.baseWeeklyCases;
    });

    if (filter === "voids") return ranked.filter((r) => r.status === "void");
    if (filter === "actionable")
      return ranked.filter(
        (r) =>
          r.status === "void" ||
          r.inventoryState === "out-of-stock" ||
          r.inventoryState === "low",
      );
    return ranked.filter((r) => r.status !== "not-authorized");
  }, [account.id, filter]);

  const counts = useMemo(() => {
    const all = STATUS_BY_ACCOUNT[account.id] ?? [];
    return {
      distributed: all.filter((r) => r.status === "distributed").length,
      voids: all.filter((r) => r.status === "void").length,
      notAuth: all.filter((r) => r.status === "not-authorized").length,
      out: all.filter((r) => r.inventoryState === "out-of-stock").length,
    };
  }, [account.id]);

  return (
    <section className={styles.section} aria-label="Distribution by SKU">
      <p className={styles.summary}>
        <strong className="num">{counts.distributed}</strong> on shelf ·{" "}
        <strong className="num">{counts.voids}</strong> void
        {counts.out > 0 ? (
          <>
            {" "}
            · <strong className="num">{counts.out}</strong> out of stock
          </>
        ) : null}{" "}
        · <span className={styles.muted}>{counts.notAuth} not authorized</span>
      </p>

      <div className={styles.filters} role="group" aria-label="Filter SKUs">
        {(
          [
            ["actionable", "Needs action"],
            ["voids", "Voids"],
            ["all", "All carried"],
          ] as Array<[Filter, string]>
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={[styles.filterBtn, filter === id ? styles.filterOn : ""]
              .filter(Boolean)
              .join(" ")}
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className={styles.empty}>
          {filter === "actionable"
            ? "Nothing needs action here. Every authorized SKU is on the shelf and in stock."
            : "No SKUs match this filter."}
        </p>
      ) : (
        <ul className={styles.list}>
          {rows.map((r) => {
            const sku = SKU_BY_ID[r.skuId];
            const pkg = PACKAGE_BY_ID[sku.packageFormatId];
            const brand = BRAND_BY_ID[sku.brandId];
            const st = STATUS_META[r.status];
            const inv = INVENTORY_META[r.inventoryState];
            const actionable =
              r.status === "void" || r.inventoryState === "out-of-stock";
            const added = linesInPlan.has(`${account.id}::${r.skuId}`);

            return (
              <li
                key={r.skuId}
                className={[styles.row, actionable ? styles.rowActionable : ""]
                  .filter(Boolean)
                  .join(" ")}
              >
                <BrandMark brandId={brand.id} size="xs" />

                <div className={styles.body}>
                  {/* Line 1: what it is. */}
                  <div className={styles.identity}>
                    <span className={styles.brand}>{brand.name}</span>
                    <span className={styles.pkg}>{pkg.shortLabel}</span>
                    {sku.innovation2026 ? (
                      <span className={styles.newTag} title="Published 2026 innovation">
                        2026
                      </span>
                    ) : null}
                  </div>

                  {/* Line 2: where it stands. */}
                  <div className={styles.state}>
                    <span className={[styles.status, styles[st.cls]].join(" ")}>
                      <span aria-hidden="true">{st.glyph}</span>
                      {st.label}
                    </span>

                    {r.inventoryState !== "unknown" ? (
                      <span
                        className={styles.inv}
                        title={`Source: ${r.inventorySource.replace("-", " ")}${
                          r.inventoryObservedAt ? `, ${r.inventoryObservedAt}` : ""
                        }`}
                      >
                        <span aria-hidden="true">{inv.glyph}</span>
                        {inv.label}
                        <ProvenanceBadge
                          provenance={
                            r.inventorySource === "observed"
                              ? "observed"
                              : r.inventorySource === "modeled"
                                ? "modeled"
                                : "illustrative"
                          }
                          compact
                        />
                      </span>
                    ) : null}

                    {r.facings ? (
                      <span className={styles.metric}>
                        <span className="num">{r.facings}</span> facings
                      </span>
                    ) : null}

                    {r.baseWeeklyCases > 0 ? (
                      <span className={styles.metric}>
                        <span className="num">
                          {
                            weeklyRate(
                              account,
                              r.baseWeeklyCases,
                              PACKAGE_BY_ID[SKU_BY_ID[r.skuId]?.packageFormatId ?? ""]
                                ?.unitsPerCase ?? 12,
                            ).short
                          }
                        </span>
                      </span>
                    ) : null}
                  </div>
                </div>

                {r.status === "void" || r.inventoryState === "out-of-stock" ? (
                  <button
                    type="button"
                    className={[styles.add, added ? styles.addDone : ""]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => onAddVoid(r)}
                    disabled={added}
                  >
                    {/* Plain verbs, and the store is the beneficiary.
                        "Close void" is correct trade language and it is
                        what the footnote calls the thing, but a button
                        has one job: say what happens when you press it,
                        and say it from the account's side of the desk.
                        The term is taught below, not in the label. */}
                    {added
                      ? "On their order"
                      : r.status === "void"
                        ? "Add it for them"
                        : "Top them up"}
                  </button>
                ) : (
                  <span className={styles.noAction} aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className={styles.footnote}>
        <strong>Void</strong> is the trade word for an item this store is
        allowed to sell but does not have on the shelf. It is the gap worth
        money, because nobody has to be persuaded to list it, only to stock
        it. Pressing <em>Put it on the shelf</em> adds it to the commitment
        plan and to the matching Southern Glazer's order, since cases promised to a
        store have to be cases the distributor actually bought.
      </p>
      <p className={styles.footnote}>
        <strong>Not authorized</strong> is a different problem and is left out
        of the gap on purpose. The chain has not listed the item, so no amount
        of selling in this store will put it on the shelf. Counting those as
        voids is the most common way a territory plan flatters itself.
      </p>
    </section>
  );
}
