import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTerritory } from "@/state/TerritoryProvider";
import { usePlan } from "@/state/PlanProvider";
import { DISTRIBUTOR_BY_ID } from "@/data/trade";
import { ACCOUNTS } from "@/data/accounts";
import { computeTotals } from "@/domain/selectors/planTotals";
import { supplySignals } from "@/domain/selectors/supply";
import { voidsForAccount } from "@/domain/selectors/distribution";
import { ACTIVE_SKUS } from "@/data/skus";
import { BRAND_BY_ID } from "@/data/brands";
import { FAMILY } from "@/domain/vocabulary";
import styles from "./MegaNav.module.css";

/**
 * The nav, as a pipeline rather than a list of pages.
 *
 * Five tabs that read as five destinations tell a visitor nothing about
 * how the job works. These five are stages of one motion, in order, and
 * the nav says so: what is short, why, what we sell, what we committed
 * for the period, and what Southern Glazer's said back. Each panel carries the live
 * number for that stage, so the nav doubles as the status of the week.
 *
 * This is a deepening, not a widening. Still five top-level items. What
 * changed is that each one now explains its own reason for existing,
 * which is the thing Plan and Distributor were missing.
 *
 * Opens on hover AND on focus, closes on Escape and on blur out. Hover
 * alone would make it unusable by keyboard, which is most of why mega
 * menus have a bad reputation.
 */

interface Section {
  to: string;
  label: string;
  stage: string;
  question: string;
  purpose: string;
  end?: boolean;
}

const SECTIONS: Section[] = [
  {
    to: "/",
    label: "Order",
    stage: "1",
    question: "What is short right now?",
    purpose:
      "This week's replenishment. Build it, price it on the lane where pricing is lawful, and send it with a question attached.",
    end: true,
  },
  {
    to: "/maps",
    label: "Maps",
    stage: "2",
    question: "Where is it short?",
    purpose:
      "The evidence under every order line. Twenty seven accounts — twelve retail, fifteen bars and restaurants — what each one is missing, and how far it is from the wholesaler.",
  },
  {
    to: "/portfolio",
    label: "Portfolio",
    stage: "3",
    question: "What are we selling?",
    purpose:
      "The book, by brand family. Which brands defend the base, which carry margin, which recruit new drinkers.",
  },
  {
    to: "/plan",
    label: "Plan",
    stage: "4",
    question: "What did we commit for the period?",
    purpose:
      "Bigger horizon than an order. Two ledgers: cases sold IN to Southern Glazer's, which carry money, and execution promised at retail, which carries none.",
  },
  {
    to: "/distributor",
    label: "Distributor",
    stage: "5",
    question: "What did Southern Glazer's say back?",
    purpose:
      "Their side of the transaction. Every line accepted, cut, or declined, and the gap between what you promised retail and what they actually bought.",
  },
];

export function MegaNav() {
  const territory = useTerritory();
  const plan = usePlan();
  const navigate = useNavigate();
  const [open, setOpen] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);

  const distributor = DISTRIBUTOR_BY_ID[territory.distributorId];
  const totals = computeTotals(plan);
  const signals = supplySignals();
  const shortCount = signals.filter((s) => s.urgency !== "watch").length;
  const emptyDoors = signals.reduce((n, s) => n + s.accountsOut, 0);
  const openVoids = ACCOUNTS.reduce((n, a) => n + voidsForAccount(a.id).length, 0);
  const responded = plan.sellIn.filter((l) => plan.distributorResponses[l.id]).length;

  const familyCounts = ACTIVE_SKUS.reduce<Record<string, number>>((acc, sku) => {
    const f = BRAND_BY_ID[sku.brandId]?.family;
    if (f) acc[f] = (acc[f] ?? 0) + 1;
    return acc;
  }, {});

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  /** A short grace period, so crossing a gap does not slam the panel. */
  const scheduleClose = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(null), 140);
  };
  const cancelClose = () => window.clearTimeout(timer.current);

  const stat = (s: Section) => {
    switch (s.to) {
      case "/":
        return { value: shortCount, unit: shortCount === 1 ? "SKU short" : "SKUs short" };
      case "/maps":
        return { value: emptyDoors, unit: emptyDoors === 1 ? "empty facing" : "empty facings" };
      case "/portfolio":
        return { value: ACTIVE_SKUS.length, unit: "SKUs live" };
      case "/plan":
        return { value: totals.totalCases, unit: "cases committed" };
      case "/distributor":
        return {
          value: responded,
          unit: `of ${plan.sellIn.length} answered`,
        };
      default:
        return { value: 0, unit: "" };
    }
  };

  return (
    <div className={styles.wrap} ref={wrapRef} onMouseLeave={scheduleClose}>
      <nav className={styles.links} aria-label="Primary">
        {SECTIONS.map((s) => {
          const st = stat(s);
          return (
            <div
              key={s.to}
              className={styles.item}
              onMouseEnter={() => {
                cancelClose();
                setOpen(s.to);
              }}
            >
              <NavLink
                to={s.to}
                end={s.end}
                className={({ isActive }) =>
                  [styles.link, isActive ? styles.linkActive : ""].join(" ")
                }
                aria-expanded={open === s.to}
                onFocus={() => setOpen(s.to)}
              >
                <span className={styles.stage} aria-hidden="true">
                  {s.stage}
                </span>
                {s.label}
                {st.value > 0 ? (
                  <span className={`${styles.badge} num`}>{st.value}</span>
                ) : null}
              </NavLink>
            </div>
          );
        })}
      </nav>

      {open ? (
        <div
          className={styles.panel}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          {SECTIONS.filter((s) => s.to === open).map((s) => {
            const st = stat(s);
            return (
              <div key={s.to} className={styles.panelInner}>
                <div className={styles.panelMain}>
                  <p className={styles.panelStage}>
                    Stage {s.stage} of 5 · {s.label}
                  </p>
                  <h3 className={styles.panelQuestion}>{s.question}</h3>
                  <p className={styles.panelPurpose}>{s.purpose}</p>
                  <div className={styles.panelActions}>
                    <button
                      type="button"
                      className={styles.panelGo}
                      onClick={() => {
                        navigate(s.to);
                        setOpen(null);
                      }}
                    >
                      Open {s.label}
                    </button>
                    {/* The methodology page lost its home when the footer
                        went. It documents every formula and every source
                        in the app, so it cannot be orphaned: one hover
                        from anywhere is the replacement. */}
                    <button
                      type="button"
                      className={styles.panelMethod}
                      onClick={() => {
                        navigate("/method");
                        setOpen(null);
                      }}
                    >
                      How the numbers work
                    </button>

                    {/* Training belongs under the Southern Glazer's relationship, not
                        as a sixth top-level stage. The nav budget is five
                        and widening it to surface one page is how an
                        information architecture erodes. */}
                    {s.to === "/" ? (
                      <button
                        type="button"
                        className={styles.panelMethod}
                        onClick={() => {
                          navigate("/issues");
                          setOpen(null);
                        }}
                      >
                        What is broken right now
                      </button>
                    ) : null}

                    {s.to === "/plan" ? (
                      <button
                        type="button"
                        className={styles.panelMethod}
                        onClick={() => {
                          navigate("/programs");
                          setOpen(null);
                        }}
                      >
                        The programme calendar
                      </button>
                    ) : null}

                    {s.to === "/distributor" ? (
                      <button
                        type="button"
                        className={styles.panelMethod}
                        onClick={() => {
                          navigate("/training");
                          setOpen(null);
                        }}
                      >
                        How I would train their team
                      </button>
                    ) : null}

                    {/*
                      Field sits under Maps rather than getting its own
                      top-level slot. An activation is a geographic object
                      before it is a marketing one — the whole argument of
                      the page is that the catchment around a site is what
                      matters — so it belongs where the territory lives.
                      Widening the nav to surface content is how an
                      information architecture erodes.
                    */}
                    {s.to === "/maps" ? (
                      <button
                        type="button"
                        className={styles.panelMethod}
                        onClick={() => {
                          navigate("/field");
                          setOpen(null);
                        }}
                      >
                        Events and field activations
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className={styles.panelSide}>
                  <div className={styles.bigStat}>
                    <span className={`${styles.bigValue} num`}>{st.value}</span>
                    <span className={styles.bigUnit}>{st.unit}</span>
                  </div>

                  {s.to === "/portfolio" ? (
                    <ul className={styles.famList}>
                      {Object.entries(familyCounts).map(([f, n]) => (
                        <li key={f}>
                          <span
                            className={styles.famDot}
                            style={{ background: FAMILY[f as keyof typeof FAMILY].cssVar }}
                            aria-hidden="true"
                          />
                          {FAMILY[f as keyof typeof FAMILY].label}
                          <span className={`${styles.famCount} num`}>{n}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {s.to === "/maps" ? (
                    <p className={styles.sideNote}>
                      {ACCOUNTS.length} accounts, {openVoids} open voids.
                    </p>
                  ) : null}

                  {s.to === "/plan" ? (
                    <p className={styles.sideNote}>
                      {plan.sellIn.length} sell-in lines carry money.{" "}
                      {plan.retail.length} retail lines carry execution and,
                      by law, no money at all.
                    </p>
                  ) : null}

                  {s.to === "/distributor" ? (
                    <p className={styles.sideNote}>
                      {distributor?.name} moves {distributor?.scale?.annualCases}{" "}
                      cases a year to {distributor?.scale?.retailAccounts}{" "}
                      accounts. Territory 12 is {ACCOUNTS.length} of them.
                    </p>
                  ) : null}

                  {s.to === "/" ? (
                    <p className={styles.sideNote}>
                      Two lanes. Southern Glazer's buys for the territory and sees
                      pricing. A store orders for its own shelf and sees
                      none, because a supplier may not price a retailer in
                      California.
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
