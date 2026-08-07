import type { DeskLine } from "@/domain/selectors/orderDesk";
import type { OrderLane } from "@/data/tradeTerms";
import { bracketFor, nextBracket } from "@/data/tradeTerms";
import { LEAD_TIME, FAMILY } from "@/domain/vocabulary";
import { PackageGlyph } from "@/components/primitives/PackageGlyph";
import styles from "./OrderSummary.module.css";

/**
 * The running order.
 *
 * Totals as you go rather than at the end, because a buyer deciding
 * whether to add a line needs to know what it does to the total while
 * they are deciding, not after.
 *
 * On the Southern Glazer's lane it carries money and volume brackets. On the store
 * lane it carries cases, pallets and lead time and nothing else, and says
 * plainly why. That is the tied-house rule made visible instead of
 * enforced silently, which is the more useful version of the same fact.
 */

interface Props {
  lines: DeskLine[];
  lane: OrderLane;
  quantities: Record<string, number>;
  allowancePerCase: number;
  onRemove: (skuId: string) => void;
  onSend: () => void;
  onClear: () => void;
  recipient: string;
  recipientRole: string;
  /** The page the recipient opens. Linked so it is reachable in-app. */
  portalLink: string;
}

export function OrderSummary({
  lines,
  lane,
  quantities,
  allowancePerCase,
  onRemove,
  onSend,
  onClear,
  recipient,
  recipientRole,
  portalLink,
}: Props) {
  const chosen = lines.filter((l) => quantities[l.skuId] !== undefined);

  let totalCases = 0;
  let pallets = 0;
  let gross = 0;
  for (const l of chosen) {
    const c = quantities[l.skuId] ?? 0;
    totalCases += c;
    if (l.casesPerPallet) pallets += c / l.casesPerPallet;
    if (l.listPerCase) gross += l.listPerCase * c;
  }

  /** Cases by brand family, biggest first. Drives the mix bar. */
  const familyMix = Object.entries(
    chosen.reduce<Record<string, number>>((acc, l) => {
      acc[l.family] = (acc[l.family] ?? 0) + (quantities[l.skuId] ?? 0);
      return acc;
    }, {}),
  )
    .map(([family, cases]) => ({ family: family as keyof typeof FAMILY, cases }))
    .filter((f) => f.cases > 0)
    .sort((a, b) => b.cases - a.cases);

  const bracket = bracketFor(totalCases);
  const next = nextBracket(totalCases);
  const discount = lane === "distributor" ? gross * bracket.discount : 0;
  const allowance =
    lane === "distributor" ? allowancePerCase * totalCases : 0;
  const net = gross - discount - allowance;

  /** Slowest line sets the delivery, which is what a buyer actually waits on. */
  const slowest = chosen.reduce<"stock" | "short" | "standard">((worst, l) => {
    const rank = { stock: 0, short: 1, standard: 2 } as const;
    return rank[l.leadTime.tone] > rank[worst] ? l.leadTime.tone : worst;
  }, "stock");
  const leadLabel =
    slowest === "standard"
      ? "Standard lead, 2 to 3 weeks"
      : slowest === "short"
        ? "Short lead, about 1 week"
        : "In stock";

  return (
    <aside className={styles.summary} aria-label="Order summary">
      <div className={styles.pinnedTop}>
        <h2>The order</h2>
        {chosen.length > 0 ? (
          <span className={styles.headCount}>
            <strong className="num">{totalCases}</strong> cases
          </span>
        ) : null}
      </div>

      {/* The scrolling middle. Lines, totals and money scroll together so
          the heading stays legible and the send button stays reachable no
          matter how long the order gets. */}
      <div className={styles.scrollArea}>
      {chosen.length === 0 ? (
        <p className={styles.empty}>
          No cases yet. Add a line and it lands here with the totals, the
          pallet count, and the lead time it will actually ship on.
        </p>
      ) : (
        <ul className={styles.lines}>
          {chosen.map((l) => {
            const c = quantities[l.skuId] ?? 0;
            return (
              <li key={l.skuId} className={styles.line}>
                <div className={styles.lineTop}>
                  <PackageGlyph skuId={l.skuId} size={13} />
                  <span className={styles.lineName}>{l.label}</span>
                  {l.listPerCase !== null ? (
                    <span className={`${styles.lineTotal} num`}>
                      ${(l.listPerCase * c).toFixed(2)}
                    </span>
                  ) : (
                    <span className={`${styles.lineTotal} num`}>{c} cs</span>
                  )}
                </div>
                <div className={styles.lineBottom}>
                  <span className={styles.lineDetail}>
                    {l.listPerCase !== null
                      ? `${c} cases at $${l.listPerCase.toFixed(2)}`
                      : `${l.packageLabel}, ${(c / (l.casesPerPallet || 1)).toFixed(2)} pallets`}
                  </span>
                  <button
                    type="button"
                    className={styles.remove}
                    onClick={() => onRemove(l.skuId)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <dl className={styles.totals}>
        <div>
          <dt>Lines</dt>
          <dd className="num">{chosen.length}</dd>
        </div>
        <div>
          <dt>Total cases</dt>
          <dd className="num">{totalCases}</dd>
        </div>
        <div>
          <dt>Pallets</dt>
          <dd className="num">{pallets.toFixed(2)}</dd>
        </div>
        {lane === "distributor" ? (
          <div>
            <dt>Volume tier</dt>
            <dd>{bracket.label}</dd>
          </div>
        ) : null}
        <div>
          <dt>Lead time</dt>
          <dd className={styles[`lt-${slowest}` as keyof typeof styles]}>
            {/* The glyph was on the builder card and missing here, so the
                same fact was shape-encoded on one panel and hue-encoded on
                the panel beside it. */}
            <span aria-hidden="true">{LEAD_TIME[slowest].glyph}</span> {leadLabel}
          </dd>
        </div>
      </dl>

      {/* Family mix. The one chart in the app, and the one place colour
          carries data rather than status. What an order is MADE of is a
          real commercial read: an order that is all core defends volume
          and grows nothing, and you can see that in one glance here. */}
      {chosen.length > 0 ? (
        <div className={styles.mix}>
          <span className={styles.mixLabel}>What the order is made of</span>
          <div
            className={styles.mixBar}
            role="img"
            aria-label={familyMix
              .map((f) => `${FAMILY[f.family].label} ${Math.round((f.cases / totalCases) * 100)}%`)
              .join(", ")}
          >
            {familyMix.map((f) => (
              <span
                key={f.family}
                className={styles.mixSeg}
                style={{
                  width: `${(f.cases / totalCases) * 100}%`,
                  background: FAMILY[f.family].cssVar,
                }}
              />
            ))}
          </div>
          <ul className={styles.mixKey}>
            {familyMix.map((f) => (
              <li key={f.family}>
                <span
                  className={styles.mixDot}
                  style={{ background: FAMILY[f.family].cssVar }}
                  aria-hidden="true"
                />
                {FAMILY[f.family].label}
                <span className={`${styles.mixPct} num`}>
                  {Math.round((f.cases / totalCases) * 100)}%
                </span>
              </li>
            ))}
          </ul>

          {/* A concentration read, not decoration. An order that is all
              core defends the volume base and grows nothing, and that is
              the single most useful sentence anyone can say about a sell-in
              before it is sent. The bar shows the shape; this says what the
              shape means. */}
          {familyMix[0] && familyMix[0].cases / totalCases >= 0.8 ? (
            <p className={styles.mixNote}>
              <span aria-hidden="true">◆</span>{" "}
              {familyMix[0].family === "core" ? (
                <>
                  This order is almost entirely core. It defends the volume
                  base and grows nothing. Worth adding an above-premium or
                  flavour line before it goes.
                </>
              ) : (
                <>
                  This order is concentrated in{" "}
                  {FAMILY[familyMix[0].family].label.toLowerCase()}. Check that
                  the core base is covered before it goes.
                </>
              )}
            </p>
          ) : null}
        </div>
      ) : null}

      {lane === "distributor" ? (
        <div className={styles.money}>
          <div className={styles.moneyRow}>
            <span>Gross</span>
            <span className="num">${gross.toFixed(2)}</span>
          </div>
          {discount > 0 ? (
            <div className={styles.moneyRow}>
              <span>Volume, {(bracket.discount * 100).toFixed(0)}%</span>
              <span className="num">−${discount.toFixed(2)}</span>
            </div>
          ) : null}
          {allowance > 0 ? (
            <div className={styles.moneyRow}>
              <span>Depletion allowance</span>
              <span className="num">−${allowance.toFixed(2)}</span>
            </div>
          ) : null}
          <div className={`${styles.moneyRow} ${styles.moneyTotal}`}>
            <span>Net to Southern Glazer's</span>
            <span className="num">${net.toFixed(2)}</span>
          </div>
          {next && totalCases > 0 ? (
            <p className={styles.nudge}>
              Add <strong className="num">{next.minCases - totalCases}</strong>{" "}
              cases, any mix, to reach {(next.discount * 100).toFixed(0)}% off.
            </p>
          ) : null}
        </div>
      ) : (
        <p className={styles.tierNote}>
          No money on this lane. A supplier may not price, discount, or pay a
          retailer in California, so a store order carries cases, timing and
          placement only. Southern Glazer's invoices the store on their own terms.
        </p>
      )}
      </div>

      <div className={styles.pinnedBottom}>
      <div className={styles.toRow}>
        <span className={styles.toLabel}>Goes to</span>
        <span className={styles.toAddress}>{recipient}</span>
        <span className={styles.toRole}>{recipientRole}</span>
      </div>

      <button
        type="button"
        className={styles.send}
        disabled={chosen.length === 0}
        onClick={onSend}
      >
        {lane === "distributor"
          ? "Tell Southern Glazer's they are low"
          : "Send this store its order"}
      </button>

      {/* The portal is the page the recipient opens from the email. It had
          no clickable path anywhere in the app, so the one surface that
          proves the loop closes could only be reached by typing a URL. */}
      <a
        className={styles.previewLink}
        href={portalLink}
        target="_blank"
        rel="noreferrer"
      >
        Preview what they will open
      </a>

      {chosen.length > 0 ? (
        <button type="button" className={styles.clear} onClick={onClear}>
          Put the suggested numbers back
        </button>
      ) : null}

      <p className={styles.smallprint}>
        Illustrative pricing and terms. Nothing is ordered and nothing is
        transmitted.
      </p>
      </div>
    </aside>
  );
}
