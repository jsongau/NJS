import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PROMOTIONS, PERIODS } from "@/data/trade";
import {
  KIT_BY_PROMOTION,
  POS_KIND_LABEL,
  type PosKind,
} from "@/data/merchandising";
import { BRAND_BY_ID } from "@/data/brands";
import { BrandMark } from "@/components/primitives/BrandMark";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { useTerritory } from "@/state/TerritoryProvider";
import styles from "./ProgramsPage.module.css";

/**
 * The programming calendar.
 *
 * "Programming" in this trade is a calendar of windows with a kit
 * attached to each one, not a single allowance sitting in a config file.
 * The app knew what a promotion was worth and what it asked a store to
 * do; it did not know what physically ships to make that happen, which is
 * the difference between a plan and a program.
 *
 * The compliance strip is the part worth reading. Under 27 CFR 6.84 a
 * supplier may furnish point of sale material and consumer advertising
 * specialties, and may NOT pay or credit the retailer for using them or
 * for any expense incidental to their use. So every item here says who
 * puts it up, and it is never the store. You may hand a manager the case
 * card. You may not pay them to put it up.
 */

/** Day-level arithmetic on the fiscal calendar for the Gantt track. */
const DAY = 86_400_000;

function toMs(iso: string): number {
  return Date.parse(`${iso}T00:00:00Z`);
}

export function ProgramsPage() {
  const territory = useTerritory();
  const [open, setOpen] = useState<string | null>(PROMOTIONS[0]?.id ?? null);

  /**
   * The calendar window: the first period start to the last period end,
   * derived rather than typed, so adding a period cannot leave a bar
   * hanging off the end of the track.
   */
  const window = useMemo(() => {
    const starts = PERIODS.map((p) => toMs(p.startDate));
    const ends = PERIODS.map((p) => toMs(p.endDate));
    const promoStarts = PROMOTIONS.map((p) => toMs(p.startDate));
    const promoEnds = PROMOTIONS.map((p) => toMs(p.endDate));
    const from = Math.min(...starts, ...promoStarts);
    const to = Math.max(...ends, ...promoEnds);
    return { from, to, span: Math.max(1, to - from) };
  }, []);

  const pos = (iso: string) => ((toMs(iso) - window.from) / window.span) * 100;
  const width = (a: string, b: string) =>
    ((toMs(b) - toMs(a) + DAY) / window.span) * 100;

  const totalInvestment = PROMOTIONS.reduce((n, p) => n + p.investment, 0);

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <p className={styles.eyebrow}>Merchandising and programming</p>
        <h1>The programme calendar</h1>
        <p className={styles.lede}>
          Five windows, what each one asks a store to do, and the kit that
          physically ships to make it happen. A promotion without a kit is a
          discount with a name on it.{" "}
          <ProvenanceBadge provenance="illustrative" />
        </p>
      </header>

      {/* --- the rule -------------------------------------------------- */}
      <section className={styles.rule} aria-label="What may be furnished">
        <h2 className={styles.ruleTitle}>What a supplier may and may not do</h2>
        <div className={styles.ruleGrid}>
          <div className={styles.may}>
            <span className={styles.ruleTag}>May</span>
            <p>
              Furnish point of sale advertising material and consumer
              advertising specialties, provided each carries advertising that
              is permanently inscribed or securely affixed.
            </p>
          </div>
          <div className={styles.mayNot}>
            <span className={styles.ruleTag}>May not</span>
            <p>
              Pay or credit the retailer for using or distributing the
              material, or for any expense incidental to its use. You may hand
              a manager the case card. You may not pay them to put it up.
            </p>
          </div>
        </div>
        <p className={styles.ruleNote}>
          Which is why every item below names who places it, and it is never
          the store. Federal rule:{" "}
          <a
            href="https://www.ecfr.gov/current/title-27/chapter-I/subchapter-A/part-6/subpart-D/section-6.84"
            target="_blank"
            rel="noreferrer noopener"
          >
            27 CFR 6.84
          </a>
          . California layers its own rules on top and none of this is legal
          advice. The reason to model the constraint is that a plan which
          cannot express it cannot respect it either.{" "}
          <ProvenanceBadge provenance="public" />
        </p>
      </section>

      {/* --- the calendar ---------------------------------------------- */}
      <section className={styles.calendar} aria-label="Programme calendar">
        <div className={styles.periods}>
          {PERIODS.map((p) => (
            <span
              key={p.id}
              className={[
                styles.period,
                p.id === territory.periodId ? styles.periodNow : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                left: `${pos(p.startDate)}%`,
                width: `${width(p.startDate, p.endDate)}%`,
              }}
            >
              {p.label.split(",")[0]}
            </span>
          ))}
        </div>

        <ul className={styles.bars}>
          {PROMOTIONS.map((p) => {
            const isOpen = open === p.id;
            return (
              <li key={p.id} className={styles.barRow}>
                <button
                  type="button"
                  className={styles.barLabel}
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : p.id)}
                >
                  {p.name}
                </button>
                <span className={styles.track}>
                  <span
                    className={[styles.bar, isOpen ? styles.barOn : ""]
                      .filter(Boolean)
                      .join(" ")}
                    style={{
                      left: `${pos(p.startDate)}%`,
                      width: `${width(p.startDate, p.endDate)}%`,
                    }}
                  >
                    <span className={`${styles.barCases} num`}>
                      ${p.distributorAllowancePerCase.toFixed(2)}/cs
                    </span>
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
        <p className={styles.calNote}>
          Bars are the real windows. The figure on each is the depletion
          allowance to Southern Glazer's per case, which is the only money in a
          promotion that may lawfully move.
        </p>
      </section>

      {/* --- the programmes -------------------------------------------- */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>The windows</h2>
          <p>
            Total modelled investment across all five:{" "}
            <strong className="num">
              ${totalInvestment.toLocaleString()}
            </strong>
            . Open one for the kit.
          </p>
        </div>

        <div className={styles.programs}>
          {PROMOTIONS.map((p) => {
            const kit = KIT_BY_PROMOTION[p.id];
            const isOpen = open === p.id;
            return (
              <article
                key={p.id}
                className={[styles.program, isOpen ? styles.programOn : ""]
                  .filter(Boolean)
                  .join(" ")}
              >
                <button
                  type="button"
                  className={styles.programHead}
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : p.id)}
                >
                  <span className={styles.programMarks}>
                    {(kit?.brandIds ?? []).slice(0, 3).map((id) => (
                      <BrandMark key={id} brandId={id} size="xs" />
                    ))}
                  </span>
                  <span className={styles.programName}>
                    <strong>{p.name}</strong>
                    <span className={styles.programDates}>
                      {p.startDate} to {p.endDate} ·{" "}
                      {kit?.channels.join(", ") ?? "All channels"}
                    </span>
                  </span>
                  <span className={styles.programStats}>
                    <span className={`${styles.stat} num`}>
                      ${p.distributorAllowancePerCase.toFixed(2)}
                      <span className={styles.statUnit}>per case</span>
                    </span>
                    <span className={`${styles.stat} num`}>
                      +{p.expectedLiftPercent}%
                      <span className={styles.statUnit}>modeled lift</span>
                    </span>
                    <span className={`${styles.stat} num`}>
                      {p.modeledROI}x
                      <span className={styles.statUnit}>return</span>
                    </span>
                  </span>
                </button>

                {isOpen ? (
                  <div className={styles.programBody}>
                    <div className={styles.asks}>
                      <div>
                        <h3>What it asks a store to do</h3>
                        <p>{p.retailExecutionRequirement}</p>
                      </div>
                      {kit ? (
                        <div>
                          <h3>What it should look like</h3>
                          <p>{kit.looksLike}</p>
                        </div>
                      ) : null}
                    </div>

                    {kit ? (
                      <>
                        <h3 className={styles.kitTitle}>What ships</h3>
                        <ul className={styles.kit}>
                          {kit.items.map((item) => (
                            <li key={item.name} className={styles.kitItem}>
                              <span
                                className={`${styles.kind} ${styles[`kind-${item.kind as PosKind}`]}`}
                              >
                                {POS_KIND_LABEL[item.kind].label}
                              </span>
                              <span className={styles.kitBody}>
                                <strong>{item.name}</strong>
                                <span>{item.purpose}</span>
                              </span>
                              <span className={styles.placedBy}>
                                Placed by
                                <strong>{item.placedBy}</strong>
                              </span>
                            </li>
                          ))}
                        </ul>
                        <p className={styles.kitFoot}>
                          Nobody in that column is the store, and no line in
                          this programme reimburses one. That is the
                          constraint, not an oversight.
                        </p>
                      </>
                    ) : null}

                    {kit?.brandIds.length ? (
                      <div className={styles.brands}>
                        {kit.brandIds.map((id) => {
                          const brand = BRAND_BY_ID[id];
                          if (!brand) return null;
                          return (
                            <div key={id} className={styles.brandRow}>
                              <BrandMark brandId={id} size="sm" />
                              <p>{brand.strategicRole}</p>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.closing}>
        <h2>Where the money actually goes</h2>
        <p>
          A promotion carries one lawful payment: a depletion allowance per
          case, supplier to wholesaler. Everything else on this page is either
          a physical object that ships with advertising printed on it, or
          labour done by a Southern Glazer's rep or by me. Nothing here pays a retailer,
          because nothing here can.
        </p>
        <div className={styles.closingLinks}>
          <Link className={styles.primary} to="/plan">
            The period plan
          </Link>
          <Link className={styles.ghost} to="/training">
            Training their team
          </Link>
          <Link className={styles.ghost} to="/method">
            How the numbers work
          </Link>
        </div>
      </section>
    </div>
  );
}
