import { useState } from "react";
import { Link } from "react-router-dom";
import type { DeskLine } from "@/domain/selectors/orderDesk";
import type { OrderLane } from "@/data/tradeTerms";
import { BrandMark } from "@/components/primitives/BrandMark";
import { PackageGlyph } from "@/components/primitives/PackageGlyph";
import { FamilyChip } from "@/components/primitives/FamilyChip";
import { ShelfStrip } from "./ShelfStrip";
import { URGENCY, LEAD_TIME } from "@/domain/vocabulary";
import styles from "./OrderBuilder.module.css";

/**
 * The order builder.
 *
 * Everything a trade buyer needs to decide is on the card: case pack,
 * minimum on the line, lead time, pallet quantity, and, on the lane where
 * it is lawful, the price. Nothing is revealed at checkout, because a
 * buyer who discovers the minimum after building an order stops trusting
 * the rest of the page.
 *
 * The line that makes this a planning tool rather than a store is `why`.
 * Every card says what is happening at retail that put it here. Strip
 * that out and this is a catalog.
 */

/** Glyph, word and colour all come from one place now. See vocabulary.ts. */
const URGENCY_CLASS: Record<string, string> = {
  critical: "uCritical",
  high: "uHigh",
  new: "uNew",
  watch: "uWatch",
};

interface Props {
  lines: DeskLine[];
  lane: OrderLane;
  quantities: Record<string, number>;
  onAdd: (line: DeskLine, cases: number) => void;
  onSet: (skuId: string, cases: number) => void;
  onRemove: (skuId: string) => void;
}

export function OrderBuilder({
  lines,
  lane,
  quantities,
  onAdd,
  onSet,
  onRemove,
}: Props) {
  const [openCalc, setOpenCalc] = useState<string | null>(null);

  return (
    <div className={styles.grid}>
      {lines.map((l) => {
        const inOrder = quantities[l.skuId] !== undefined;
        const cases = quantities[l.skuId] ?? l.suggestedCases;
        const u = URGENCY[l.urgency];
        const lt = LEAD_TIME[l.leadTime.tone];
        const lineTotal = l.listPerCase ? l.listPerCase * cases : null;

        return (
          <article
            key={l.skuId}
            className={[styles.card, inOrder ? styles.cardOn : ""]
              .filter(Boolean)
              .join(" ")}
          >
            {inOrder ? (
              <span className={styles.inOrderTick}>
                <span aria-hidden="true">✓</span> On the order
              </span>
            ) : null}
            <div className={styles.cardHead}>
              {/* Brand over vessel. A rep reads the pack shape before the
                  words, so the card shows what is actually in the case:
                  whose spirit, in what container, how many to a case. */}
              <div className={styles.packPlate}>
                <BrandMark brandId={l.brandId} size="md" />
                <span className={styles.packShape}>
                  <PackageGlyph skuId={l.skuId} size={20} />
                  <span className={`${styles.packCount} num`}>
                    ×{l.unitsPerCase}
                  </span>
                </span>
              </div>
              <div className={styles.identity}>
                <h3 className={styles.name}>{l.label}</h3>
                <p className={styles.meta}>
                  <span className={styles.pkg}>{l.packageLabel}</span>
                  <span className={`${styles.code} num`}>{l.itemCode}</span>
                </p>
                <div className={styles.chips}>
                  <span
                    className={`${styles.urgency} ${styles[URGENCY_CLASS[l.urgency]]}`}
                  >
                    <span aria-hidden="true">{u.glyph}</span> {u.label}
                  </span>
                  <FamilyChip family={l.family} size="sm" />
                </div>
              </div>

              {l.listPerCase !== null ? (
                <div className={styles.priceBlock}>
                  <span className={`${styles.price} num`}>
                    ${l.listPerCase.toFixed(2)}
                  </span>
                  <span className={styles.priceUnit}>per case</span>
                  <button
                    type="button"
                    className={styles.calcToggle}
                    aria-expanded={openCalc === l.skuId}
                    onClick={() =>
                      setOpenCalc(openCalc === l.skuId ? null : l.skuId)
                    }
                  >
                    How this was worked out
                  </button>
                </div>
              ) : (
                <div className={styles.priceBlock}>
                  <span className={styles.noPrice}>No price on this lane</span>
                  <span className={styles.noPriceWhy}>
                    Supplier to retailer
                  </span>
                </div>
              )}
            </div>

            {openCalc === l.skuId ? (
              <ol className={styles.calc}>
                {l.priceCalculation.map((step) => (
                  <li key={step}>{step}</li>
                ))}
                <li className={styles.calcNote}>
                  Illustrative. Read back from ordinary US shelf pricing, not
                  a Ole Smoky price list.
                </li>
              </ol>
            ) : null}

            <p className={styles.why}>{l.why}</p>

            <ShelfStrip shelf={l.shelf} />

            <dl className={styles.terms}>
              <div>
                <dt>Case pack</dt>
                <dd className="num">{l.unitsPerCase} units</dd>
              </div>
              <div>
                <dt>Minimum per line</dt>
                <dd className="num">{l.minimumCases} cases</dd>
              </div>
              <div>
                <dt>Lead time</dt>
                <dd className={styles[`lt-${l.leadTime.tone}` as keyof typeof styles]}>
                  <span aria-hidden="true">{lt.glyph}</span> {lt.label}
                </dd>
              </div>
              <div>
                <dt>Pallet</dt>
                <dd className="num">{l.casesPerPallet} cases</dd>
              </div>
            </dl>

            <div className={styles.actions}>
              {inOrder ? (
                <>
                  <div className={styles.stepper}>
                    <button
                      type="button"
                      onClick={() =>
                        onSet(l.skuId, Math.max(l.minimumCases, cases - l.minimumCases))
                      }
                      aria-label={`Fewer cases of ${l.label}`}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      className="num"
                      min={l.minimumCases}
                      value={cases}
                      aria-label={`Cases of ${l.label}`}
                      onChange={(e) =>
                        onSet(l.skuId, Math.max(0, Number(e.target.value)))
                      }
                    />
                    <span className={styles.stepUnit}>cases</span>
                    <button
                      type="button"
                      onClick={() => onSet(l.skuId, cases + l.minimumCases)}
                      aria-label={`More cases of ${l.label}`}
                    >
                      +
                    </button>
                  </div>
                  {lineTotal !== null ? (
                    <span className={`${styles.lineTotal} num`}>
                      ${lineTotal.toFixed(2)}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    className={styles.remove}
                    aria-label={`Take ${l.label} off the order`}
                    onClick={() => onRemove(l.skuId)}
                  >
                    Take it off
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className={styles.add}
                  onClick={() => onAdd(l, l.suggestedCases)}
                >
                  Add {l.suggestedCases} cases to the order
                </button>
              )}

              {l.evidenceAccountIds.length > 0 ? (
                <Link
                  className={styles.evidence}
                  to={`/maps?sku=${l.skuId}`}
                  title="Open the territory board filtered to the accounts behind this line"
                >
                  See where it is short
                  <span className={`${styles.evidenceCount} num`}>
                    {l.evidenceAccountIds.length}
                  </span>
                </Link>
              ) : null}
            </div>
          </article>
        );
      })}

      {lines.length === 0 ? (
        <p className={styles.empty}>
          {lane === "store"
            ? "Pick a store above and its shelf gaps land here."
            : "Nothing is short this period."}
        </p>
      ) : null}
    </div>
  );
}
