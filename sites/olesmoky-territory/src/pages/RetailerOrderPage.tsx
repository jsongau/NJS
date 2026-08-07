import { useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { ACCOUNT_BY_ID } from "@/data/accounts";
import { RETAIL_CONTACT_BY_ACCOUNT } from "@/data/retailContacts";
import { DISTRIBUTOR_BY_ID } from "@/data/trade";
import { SKU_BY_ID } from "@/data/skus";
import { retailOrderLines, type RetailOrderLine } from "@/domain/selectors/retailOrder";
import { BrandMark } from "@/components/primitives/BrandMark";
import { PackageGlyph } from "@/components/primitives/PackageGlyph";
import styles from "./RetailerOrderPage.module.css";

/**
 * The store reorder portal.
 *
 * The distributor portal at /order/:distributorId answers "what is Southern Glazer's
 * about to run out of." This answers a different question that the same
 * link-in-an-email motion serves: what is missing from ONE store's shelf.
 * A grocery buyer opens it from a phone in a back room, checks four
 * quantities, and sends it back.
 *
 * The commercially important thing on this page is the paragraph about
 * where the order goes. California is a three-tier state: a supplier may
 * solicit a retailer, but may not sell to one. So this page produces a
 * recommendation that routes to the wholesaler, and it says so above the
 * fold rather than in a footnote. Getting that wrong would not be a
 * cosmetic error, it would describe an unlawful transaction.
 *
 * Deep-linkable by construction, same as the distributor portal: SKUs,
 * quantities, week and reference all live in the URL, and a static stub
 * exists at every account path so a cold open from email resolves without
 * client-side routing.
 */

const GROUPS: Array<{
  kind: RetailOrderLine["kind"];
  title: string;
  blurb: string;
  glyph: string;
}> = [
  {
    kind: "out",
    title: "Off the shelf",
    blurb: "Nothing to sell until this lands.",
    glyph: "▲",
  },
  {
    kind: "low",
    title: "Running low",
    blurb: "Enough for a few days at the current rate.",
    glyph: "◆",
  },
  {
    kind: "new",
    title: "Available and not stocked",
    blurb: "Your wholesaler can deliver these. Your set does not have them.",
    glyph: "＋",
  },
  {
    kind: "steady",
    title: "Everything else you carry",
    blurb: "In stock. Here if you want to top something up.",
    glyph: "○",
  },
];

export function RetailerOrderPage() {
  const { accountId } = useParams();
  const [params] = useSearchParams();

  const account = accountId ? ACCOUNT_BY_ID[accountId] : undefined;
  const contact = accountId ? RETAIL_CONTACT_BY_ACCOUNT[accountId] : undefined;
  const distributor = DISTRIBUTOR_BY_ID["southern-glazers-cerritos"];
  const reference = params.get("ref") ?? "OS-DEMO-STORE-0001";

  const lines = useMemo(
    () => (account ? retailOrderLines(account.id) : []),
    [account],
  );

  const preselected = useMemo(() => {
    const fromUrl = (params.get("sku") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((id) => SKU_BY_ID[id] && lines.some((l) => l.skuId === id));
    if (fromUrl.length > 0) return fromUrl;
    return lines.filter((l) => l.kind === "out" || l.kind === "low").map((l) => l.skuId);
  }, [params, lines]);

  const initialQty = useMemo(() => {
    const q: Record<string, number> = {};
    const casesParam = (params.get("cases") ?? "")
      .split(",")
      .map((n) => Number(n.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    preselected.forEach((skuId, i) => {
      const line = lines.find((l) => l.skuId === skuId);
      q[skuId] = casesParam[i] ?? line?.suggestedCases ?? 2;
    });
    return q;
  }, [preselected, params, lines]);

  const [selected, setSelected] = useState<Set<string>>(new Set(preselected));
  const [qty, setQty] = useState<Record<string, number>>(initialQty);
  const [week, setWeek] = useState(params.get("week") ?? "Next delivery");
  const [note, setNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [showSteady, setShowSteady] = useState(false);

  const totals = useMemo(() => {
    let cases = 0;
    let newItems = 0;
    for (const id of selected) {
      cases += qty[id] ?? 0;
      if (lines.find((l) => l.skuId === id)?.kind === "new") newItems += 1;
    }
    return { cases, lines: selected.size, newItems };
  }, [selected, qty, lines]);

  if (!account || !contact) {
    return (
      <div className={styles.portal}>
        <div className={styles.notFound}>
          <h1>That store link is not valid</h1>
          <p>
            The address in the link does not match a store in this territory.
            It may have been truncated by a mail client. The whole link needs
            to come across, including everything after the question mark.
          </p>
          <Link to="/">Go to the order desk</Link>
        </div>
      </div>
    );
  }

  const toggle = (line: RetailOrderLine) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(line.skuId)) next.delete(line.skuId);
      else {
        next.add(line.skuId);
        setQty((q) => ({ ...q, [line.skuId]: q[line.skuId] ?? line.suggestedCases }));
      }
      return next;
    });
  };

  const bump = (skuId: string, delta: number) =>
    setQty((q) => ({ ...q, [skuId]: Math.max(0, (q[skuId] ?? 0) + delta) }));

  /**
   * Back to what arrived in the email. Not a page reload: reloading would
   * also throw away the delivery week and the note, and a buyer who wanted
   * to undo their quantities rarely wanted to undo those too.
   */
  const resetAll = () => {
    setSelected(new Set(preselected));
    setQty(initialQty);
    setShowSteady(false);
  };

  if (confirmed) {
    return (
      <div className={styles.portal}>
        <div className={styles.confirmCard}>
          <span className={styles.check} aria-hidden="true">✓</span>
          <h1>Passed to {distributor?.name}</h1>
          <p className={styles.confirmLead}>
            {totals.lines} item{totals.lines === 1 ? "" : "s"}, {totals.cases}{" "}
            cases, for {week.toLowerCase()}.
          </p>
          <p className={styles.demoNote}>
            In a live version this would reach the {distributor?.name} order
            desk, who deliver to {account.chainName} on {account.address}.
            Ole Smoky would not touch the shipment. Here it is a portfolio
            demonstration: no purchase order was created, no stock was
            reserved, and nothing was sent to anyone. Reference{" "}
            <strong className="num">{reference}</strong>.
          </p>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => setConfirmed(false)}
          >
            Back to the order
          </button>
        </div>
      </div>
    );
  }

  const emptyCount = lines.filter((l) => l.kind === "out").length;

  return (
    <div className={styles.portal}>
      <span className={styles.demoBadge}>
        <span aria-hidden="true">●</span> Demo workflow. Nothing is ordered and
        nothing is sent.
      </span>

      <header className={styles.head}>
        <p className={styles.eyebrow}>Suggested reorder</p>
        <h1>
          {account.chainName}, {account.city}
        </h1>
        <p className={styles.lede}>
          {emptyCount > 0 ? (
            <>
              <strong className="num">{emptyCount}</strong> of our items{" "}
              {emptyCount === 1 ? "is" : "are"} off your shelf right now.
            </>
          ) : (
            <>A few of our items are getting thin on your shelf.</>
          )}{" "}
          The quantities below are filled in already. Change anything that
          looks wrong and send it back.
        </p>
        <dl className={styles.meta}>
          <div>
            <dt>Store</dt>
            <dd>
              {account.address}, {account.city} {account.postalCode}
            </dd>
          </div>
          <div>
            <dt>Attention</dt>
            <dd>{contact.role}</dd>
          </div>
          <div>
            <dt>Reference</dt>
            <dd className="num">{reference}</dd>
          </div>
        </dl>
      </header>

      {/* The single most important sentence on the page. */}
      <section className={styles.tierNote} aria-label="Where this order goes">
        <h2>Where this goes</h2>
        <p>
          Ole Smoky does not sell or deliver spirits to stores in California.
          Whatever you confirm here is passed to{" "}
          <strong>{distributor?.name}</strong> in {distributor?.city}, who hold
          the wholesaler license for this area and already deliver to you. They
          schedule it the usual way. Nothing about your account, your terms, or
          your delivery day changes.
        </p>
      </section>

      {GROUPS.map((group) => {
        const groupLines = lines.filter((l) => l.kind === group.kind);
        if (groupLines.length === 0) return null;
        if (group.kind === "steady" && !showSteady) {
          return (
            <button
              key={group.kind}
              type="button"
              className={styles.showAll}
              onClick={() => setShowSteady(true)}
            >
              Show everything else you carry ({groupLines.length} items)
            </button>
          );
        }

        return (
          <section key={group.kind} className={styles.group} aria-label={group.title}>
            <div className={styles.groupHead}>
              <h2>
                <span
                  className={[
                    styles.kindGlyph,
                    group.kind === "out"
                      ? styles.kOut
                      : group.kind === "low"
                        ? styles.kLow
                        : group.kind === "new"
                          ? styles.kNew
                          : styles.kSteady,
                  ].join(" ")}
                  aria-hidden="true"
                >
                  {group.glyph}
                </span>
                {group.title}
                <span className={`${styles.groupCount} num`}>{groupLines.length}</span>
              </h2>
              <p>{group.blurb}</p>
            </div>

            <div className={styles.lines}>
              {groupLines.map((l) => {
                const on = selected.has(l.skuId);
                const cases = qty[l.skuId] ?? l.suggestedCases;
                return (
                  <article
                    key={l.skuId}
                    className={[styles.line, on ? styles.lineOn : ""]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <label className={styles.pick}>
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggle(l)}
                        aria-label={`Include ${l.label}`}
                      />
                    </label>

                    <BrandMark brandId={l.brandId} size="sm" />

                    <div className={styles.lineBody}>
                      <div className={styles.lineTop}>
                        <span className={styles.lineName}>{l.label}</span>
                        <span className={styles.pkg}>
                          <PackageGlyph skuId={l.skuId} size={12} />
                          {l.packageLabel}
                        </span>
                      </div>
                      <p className={styles.why}>{l.reason}</p>
                    </div>

                    <div className={styles.qtyBlock}>
                      <span className={styles.qtyLabel}>Cases</span>
                      <div className={styles.stepper}>
                        <button
                          type="button"
                          onClick={() => bump(l.skuId, -1)}
                          disabled={!on}
                          aria-label={`One case less of ${l.label}`}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min={0}
                          className="num"
                          value={cases}
                          disabled={!on}
                          aria-label={`Cases of ${l.label}`}
                          onChange={(e) =>
                            setQty((q) => ({
                              ...q,
                              [l.skuId]: Math.max(0, Number(e.target.value)),
                            }))
                          }
                        />
                        <button
                          type="button"
                          onClick={() => bump(l.skuId, 1)}
                          disabled={!on}
                          aria-label={`One case more of ${l.label}`}
                        >
                          +
                        </button>
                      </div>
                      <span className={styles.units}>
                        {l.unitsPerCase > 0 ? `${l.unitsPerCase} per case` : ""}
                      </span>
                      {on && cases !== l.suggestedCases ? (
                        <button
                          type="button"
                          className={styles.reset}
                          onClick={() =>
                            setQty((q) => ({ ...q, [l.skuId]: l.suggestedCases }))
                          }
                        >
                          Back to {l.suggestedCases}
                        </button>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}

      <section className={styles.footer}>
        <div className={styles.deliveryBlock}>
          <span className={styles.fieldLabel}>When you want it</span>
          <div className={styles.weekPick} role="group" aria-label="Delivery timing">
            {["Next delivery", "Week after", "Split it", "Call me"].map((w) => (
              <button
                key={w}
                type="button"
                className={[styles.weekBtn, week === w ? styles.weekOn : ""]
                  .filter(Boolean)
                  .join(" ")}
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
              placeholder="Back room space, a set change coming, a quantity you want moved"
            />
          </label>
        </div>

        <aside className={styles.summary}>
          <h2>Your order</h2>
          <dl>
            <div>
              <dt>Items</dt>
              <dd className="num">{totals.lines}</dd>
            </div>
            <div>
              <dt>Cases</dt>
              <dd className="num">{totals.cases}</dd>
            </div>
            <div>
              <dt>New to the shelf</dt>
              <dd className="num">{totals.newItems}</dd>
            </div>
            <div>
              <dt>Timing</dt>
              <dd>{week}</dd>
            </div>
          </dl>
          <button
            type="button"
            className={styles.primary}
            disabled={totals.lines === 0}
            onClick={() => setConfirmed(true)}
          >
            Send to {distributor?.name}
          </button>
          {/* A buyer who has clicked twenty steppers needs a way back to
              what was suggested without hunting for the original email. */}
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
        Southern Glazer's Wine & Spirits, or {account.chainName}.
        Inventory, depletion and account figures are modeled.{" "}
        <Link to="/method">Methodology and limitations</Link>
      </p>
    </div>
  );
}
