import { useMemo, useState } from "react";
import { PROMOTIONS } from "@/data/trade";
import { ACCOUNTS } from "@/data/accounts";
import { STATUS_BY_ACCOUNT } from "@/data/accountSkuStatus";
import { KIT_BY_PROMOTION } from "@/data/merchandising";
import { SKU_BY_ID } from "@/data/skus";
import { BRAND_BY_ID } from "@/data/brands";
import { CrateIcon, TagIcon, JarIcon, EmptyJarIcon } from "./DistilleryIcons";
import styles from "./LaunchSupport.module.css";

/**
 * Launch support — the overlay that answers "we are running a promotion,
 * which doors are actually ready for it".
 *
 * WHY THIS EXISTS ON THE MAP AND NOT ON A REPORT. A promotion window is
 * a date range and a list of accounts, and both of those are spatial
 * facts before they are commercial ones: a rep has a Tuesday, a car and
 * eleven stores that need a shelf talker. Reading that off a table means
 * translating account names into geography in your head. Reading it off
 * the map means looking at it.
 *
 * WHAT "READY" MEANS HERE, precisely, because a readiness figure with a
 * fuzzy definition is worse than none: an account is ready for a
 * promotion when it already stocks at least one of the brands the
 * promotion features. You cannot merchandise a display for a product a
 * store does not carry, so an account that is not ready needs a
 * distribution call BEFORE it needs a kit — and sending point-of-sale
 * material to a door that cannot use it is the most common way a
 * programme budget disappears without a trace.
 *
 * THE 27 CFR 6.84 LINE IS DRAWN IN THE COMPONENT, not written under it.
 * A supplier may FURNISH point-of-sale material and consumer advertising
 * specialties to a retailer. A supplier may NOT pay or credit the
 * retailer for using or distributing them, or for any expense incidental
 * to their use. So the support actions this panel offers are all things
 * that can be handed over; there is no "fund the display" action,
 * because that action would be a federal problem rather than a missing
 * feature.
 */

/** Today, passed nowhere and read once, so the panel is deterministic. */
const TODAY = "2026-08-07";
const TODAY_MS = Date.parse(`${TODAY}T00:00:00Z`);

function daysBetween(iso: string): number {
  const t = Date.parse(`${iso}T00:00:00Z`);
  return Math.round((t - TODAY_MS) / 86_400_000);
}

export function LaunchSupport({
  onFocusAccounts,
}: {
  /** Hand the not-ready account ids up so the map can filter to them. */
  onFocusAccounts?: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(true);
  const [index, setIndex] = useState(0);

  /**
   * Live windows first, then the next one to open. A panel that opens on
   * a promotion that finished in March is a panel nobody trusts twice.
   */
  const windows = useMemo(() => {
    const scored = PROMOTIONS.map((p) => ({
      promo: p,
      startsIn: daysBetween(p.startDate),
      endsIn: daysBetween(p.endDate),
    }));
    const live = scored.filter((w) => w.startsIn <= 0 && w.endsIn >= 0);
    const upcoming = scored
      .filter((w) => w.startsIn > 0)
      .sort((a, b) => a.startsIn - b.startsIn);
    const past = scored
      .filter((w) => w.endsIn < 0)
      .sort((a, b) => b.endsIn - a.endsIn);
    return [...live, ...upcoming, ...past];
  }, []);

  const current = windows[Math.min(index, windows.length - 1)];

  const readiness = useMemo(() => {
    if (!current) return { ready: [], notReady: [], brandNames: [] as string[] };
    const kit = KIT_BY_PROMOTION[current.promo.id];
    const brandIds = new Set(kit?.brandIds ?? []);
    const brandNames = [...brandIds]
      .map((b) => BRAND_BY_ID[b]?.name)
      .filter(Boolean) as string[];

    const ready: string[] = [];
    const notReady: string[] = [];
    for (const account of ACCOUNTS) {
      const rows = STATUS_BY_ACCOUNT[account.id] ?? [];
      /*
        READY MEANS FULLY SET, NOT MERELY PRESENT.

        The first version asked "does this account stock any featured
        brand", and every one of the twenty seven did — so the panel
        reported 25 ready, 0 not, and told a reader nothing they could
        act on. A readiness measure that always says yes is decoration.

        An account is ready when it carries the featured brands AND has
        no open void on one of them. A store holding two of the three
        items in a display programme cannot build that display, which is
        exactly the call a rep needs to make before the window opens.
      */
      const featured = rows.filter((r) =>
        brandIds.has(SKU_BY_ID[r.skuId]?.brandId ?? ""),
      );
      const carries =
        featured.length > 0 && featured.every((r) => r.status !== "void");
      (carries ? ready : notReady).push(account.id);
    }
    return { ready, notReady, brandNames };
  }, [current]);

  if (!current) return null;

  const { promo, startsIn, endsIn } = current;
  const kit = KIT_BY_PROMOTION[promo.id];
  const live = startsIn <= 0 && endsIn >= 0;
  const total = readiness.ready.length + readiness.notReady.length;
  const pct = total ? Math.round((readiness.ready.length / total) * 100) : 0;

  const timing = live
    ? endsIn === 0
      ? "Last day"
      : `${endsIn} day${endsIn === 1 ? "" : "s"} left`
    : startsIn > 0
      ? `Opens in ${startsIn} day${startsIn === 1 ? "" : "s"}`
      : "Closed";

  return (
    <div className={styles.panel}>
      <button
        type="button"
        className={styles.head}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className={styles.headMark} aria-hidden="true">
          <CrateIcon size={18} />
        </span>
        <span className={styles.headText}>Launch support</span>
        <span aria-hidden="true" className={styles.chev}>
          {open ? "−" : "+"}
        </span>
      </button>

      {open ? (
        <div className={styles.body}>
          <div className={styles.promoRow}>
            <button
              type="button"
              className={styles.step}
              aria-label="Previous window"
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
            >
              ‹
            </button>
            <span className={styles.promoName}>{promo.name}</span>
            <button
              type="button"
              className={styles.step}
              aria-label="Next window"
              disabled={index >= windows.length - 1}
              onClick={() =>
                setIndex((i) => Math.min(windows.length - 1, i + 1))
              }
            >
              ›
            </button>
          </div>

          <p className={[styles.timing, live ? styles.timingLive : ""].join(" ")}>
            <span aria-hidden="true">{live ? "●" : "○"}</span> {timing}
          </p>

          {/*
            Readiness as a bar AND as two counts AND as two words. The bar
            is the fast read, the counts are the precise one, and neither
            is the only carrier — strip the colour and the sentence
            underneath still says it.
          */}
          <div className={styles.readyBar} role="img" aria-label={`${readiness.ready.length} of ${total} accounts stock the featured range`}>
            <span className={styles.readyFill} style={{ width: `${pct}%` }} />
          </div>

          <ul className={styles.counts}>
            <li>
              <span className={styles.cIcon} aria-hidden="true">
                <JarIcon size={18} />
              </span>
              <span className={`${styles.cNum} num`}>
                {readiness.ready.length}
              </span>
              <span className={styles.cLabel}>stock the range</span>
            </li>
            <li>
              <span className={styles.cIcon} aria-hidden="true">
                <EmptyJarIcon size={18} />
              </span>
              <span className={`${styles.cNum} num`}>
                {readiness.notReady.length}
              </span>
              <span className={styles.cLabel}>need it first</span>
            </li>
          </ul>

          {readiness.brandNames.length ? (
            <p className={styles.featured}>
              Featuring {readiness.brandNames.slice(0, 3).join(", ")}
              {readiness.brandNames.length > 3
                ? ` and ${readiness.brandNames.length - 3} more`
                : ""}
              .
            </p>
          ) : null}

          {kit?.items?.length ? (
            <div className={styles.kit}>
              <p className={styles.kitHead}>
                <span aria-hidden="true">
                  <TagIcon size={14} />
                </span>{" "}
                What we can hand over
              </p>
              <ul className={styles.kitList}>
                {kit.items.slice(0, 4).map((it, i) => (
                  <li key={i}>
                    {it.name}
                    {/*
                      `placedBy` cannot be "Store" — the union does not
                      contain it, and that is the point. A supplier may
                      not pay a retailer for the labour of putting
                      material up, so the type never offers "the store
                      does it" as an option to choose. The rule is
                      enforced by the shape rather than remembered.
                    */}
                    <span className={styles.by}> · {it.placedBy.toLowerCase()}</span>
                  </li>
                ))}
              </ul>
              <p className={styles.rule}>
                Furnished, never funded. 27 CFR 6.84 lets a supplier give a
                retailer point-of-sale material and forbids paying them to
                use it, so there is no button here that spends money at a
                store.
              </p>
            </div>
          ) : null}

          {onFocusAccounts && readiness.notReady.length ? (
            <button
              type="button"
              className={styles.focus}
              onClick={() => onFocusAccounts(readiness.notReady)}
            >
              Show me the {readiness.notReady.length} that need it first
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
