import { useState } from "react";
import { Link } from "react-router-dom";
import {
  COMPETENCIES,
  BRAND_BRIEFS,
  SESSION_PLAN,
} from "@/data/training";
import { BRAND_BY_ID } from "@/data/brands";
import { DISTRIBUTOR_BY_ID, GOAL_BY_PERIOD } from "@/data/trade";
import { useTerritory } from "@/state/TerritoryProvider";
import { BrandMark } from "@/components/primitives/BrandMark";
import { FamilyChip } from "@/components/primitives/FamilyChip";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import styles from "./TrainingPage.module.css";

/**
 * Training Southern Glazer's team.
 *
 * The leverage argument, which is the whole page: a Distributor Sales
 * Executive with twenty five accounts on their own route caps out at
 * twenty five. Southern Glazer's people call on roughly 13,960 accounts. Anything a
 * rep learns carries across all of them, every week, whether or not the
 * supplier is standing there.
 *
 * This is the one bullet in the posting where the deliverable IS the
 * skill. Anyone can claim they train partners. Showing the session plan,
 * the competencies, the brand briefs with the objection AND the answer,
 * and the number you would judge it by is a different kind of claim.
 */
export function TrainingPage() {
  const territory = useTerritory();
  const distributor = DISTRIBUTOR_BY_ID[territory.distributorId];
  const goal = GOAL_BY_PERIOD[territory.periodId];
  const [openBrand, setOpenBrand] = useState<string | null>(
    BRAND_BRIEFS[0]?.brandId ?? null,
  );

  const totalMinutes = SESSION_PLAN.reduce((n, b) => n + b.minutes, 0);
  const outOfRoom = SESSION_PLAN.filter((b) => b.place !== "room").reduce(
    (n, b) => n + b.minutes,
    0,
  );

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <p className={styles.eyebrow}>Partner training</p>
        <h1>What I would train Southern Glazer's&rsquo;s team on</h1>
        <p className={styles.lede}>
          I do not sell twenty five stores. I sell one wholesaler, and their
          sales force sells the stores. Everything below is built on that
          one fact.
        </p>
      </header>

      {/* The leverage math. It is the argument, so it goes first and it is
          made of real published figures rather than a slogan. */}
      <section className={styles.leverage} aria-label="Why training is the job">
        <div className={styles.lev}>
          <span className={`${styles.levNum} num`}>25</span>
          <span className={styles.levLabel}>doors I call on</span>
          <span className={styles.levNote}>Territory 12, East LA corridor</span>
        </div>
        <span className={styles.levVs} aria-hidden="true">
          against
        </span>
        <div className={`${styles.lev} ${styles.levBig}`}>
          <span className={`${styles.levNum} num`}>
            {distributor?.scale?.retailAccounts ?? "13,960"}
          </span>
          <span className={styles.levLabel}>doors Southern Glazer's calls on</span>
          <span className={styles.levNote}>
            {distributor?.scale?.employees ?? "1,510+"} people,{" "}
            {distributor?.scale?.annualCases ?? "52.2M"} cases a year
          </span>
        </div>
        <p className={styles.levSay}>
          A thing I do with my own hands stops at twenty five. A thing a
          Southern Glazer's rep learns to do runs their whole route, every week, when I
          am not there. That ratio is why training is a line in this job
          description and not a favour.{" "}
          <ProvenanceBadge provenance="public" />
        </p>
      </section>

      {/* --- the session --------------------------------------------- */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>The session</h2>
          <p>
            <strong className="num">{totalMinutes} minutes</strong>, of which{" "}
            <strong className="num">{outOfRoom}</strong> are not in a room. A
            wholesaler gives you one morning, once. Spending it on slides is
            the most common way a supplier wastes the access they fought for.
          </p>
        </div>

        <ol className={styles.plan}>
          {SESSION_PLAN.map((b) => (
            <li key={b.title} className={styles.block}>
              <span className={`${styles.mins} num`}>{b.minutes}m</span>
              <span className={styles.blockBody}>
                <span className={styles.blockTitle}>
                  {b.title}
                  <span
                    className={`${styles.place} ${styles[`place-${b.place}`]}`}
                  >
                    {b.place === "room"
                      ? "In the room"
                      : b.place === "store"
                        ? "In a store"
                        : "At the truck"}
                  </span>
                </span>
                <span className={styles.blockDetail}>{b.detail}</span>
              </span>
            </li>
          ))}
        </ol>

        {goal ? (
          <p className={styles.planNote}>
            The first ten minutes are the period number:{" "}
            <strong className="num">{goal.periodCases.toLocaleString()}</strong>{" "}
            cases, and which brands are carrying the gap. A team that does not
            know the number cannot be held to it.
          </p>
        ) : null}
      </section>

      {/* --- competencies -------------------------------------------- */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>The five skills, and how I would know they landed</h2>
          <p>
            Ordered on purpose. A rep who learns to close before they can read
            a back shelf is just guessing louder.
          </p>
        </div>

        <ol className={styles.comps}>
          {COMPETENCIES.map((c, i) => (
            <li key={c.id} className={styles.comp}>
              <span className={`${styles.compNum} num`}>{i + 1}</span>
              <div className={styles.compBody}>
                <h3 className={styles.compName}>{c.name}</h3>
                <dl className={styles.compDl}>
                  <div>
                    <dt>They can</dt>
                    <dd>{c.outcome}</dd>
                  </div>
                  <div>
                    <dt>How</dt>
                    <dd>{c.method}</dd>
                  </div>
                  <div className={styles.compEvidence}>
                    <dt>Measured by</dt>
                    <dd>{c.evidence}</dd>
                  </div>
                </dl>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* --- brand briefs -------------------------------------------- */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>The brand briefs</h2>
          <p>
            One card per brand a rep will actually be asked about, each with
            the objection they will hear and an answer that is true. Every
            position traces to Ole Smoky&rsquo; own published commercial
            posture; the objections are ordinary trade objections.{" "}
            <ProvenanceBadge provenance="public" />
          </p>
        </div>

        <div className={styles.briefs}>
          {BRAND_BRIEFS.map((b) => {
            const brand = BRAND_BY_ID[b.brandId];
            const isOpen = openBrand === b.brandId;
            return (
              <article
                key={b.brandId}
                className={[styles.brief, isOpen ? styles.briefOn : ""]
                  .filter(Boolean)
                  .join(" ")}
              >
                <button
                  type="button"
                  className={styles.briefHead}
                  aria-expanded={isOpen}
                  onClick={() => setOpenBrand(isOpen ? null : b.brandId)}
                >
                  <BrandMark brandId={b.brandId} size="sm" />
                  <span className={styles.briefName}>
                    <strong>{brand?.name ?? b.brandId}</strong>
                    <span className={styles.briefHook}>{b.hook}</span>
                  </span>
                  {brand ? <FamilyChip family={brand.family} size="sm" /> : null}
                </button>

                {isOpen ? (
                  <div className={styles.briefBody}>
                    <dl className={styles.briefDl}>
                      <div>
                        <dt>Where it wins</dt>
                        <dd>{b.wins}</dd>
                      </div>
                      <div className={styles.objection}>
                        <dt>What they say back</dt>
                        <dd>&ldquo;{b.objection}&rdquo;</dd>
                      </div>
                      <div>
                        <dt>The answer</dt>
                        <dd>{b.answer}</dd>
                      </div>
                      <div className={styles.askRow}>
                        <dt>Ask for</dt>
                        <dd>
                          <strong>{b.ask}</strong>
                        </dd>
                      </div>
                    </dl>
                    {brand?.strategicRoleSource ? (
                      <p className={styles.source}>
                        Brand position: {brand.strategicRoleSource}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        <p className={styles.omitted}>
          <strong>Two brands are deliberately not here.</strong> Cookies &amp;
          Cream is a fourth-quarter gifting item and this session sits in
          August,
          and a training hour spent on it is an hour not spent on the three
          carrying the gap. Sparkling Lemonade&rsquo;s current status could not be verified,
          and training a team on a brand you are unsure of costs you their
          trust permanently.
        </p>
      </section>

      <section className={styles.closing}>
        <h2>How I would know any of this worked</h2>
        <p>
          Same measures the rest of this app runs on, taken per rep and
          before-and-after rather than in aggregate: points of distribution
          added, share of those that were voids rather than new listings,
          days of back-shelf cover, and the share of calls that end in a
          committed case count. An aggregate number tells you the territory
          moved. A per-rep number tells you whether the training did it.
        </p>
        <div className={styles.closingLinks}>
          <Link className={styles.primary} to="/distributor">
            The Southern Glazer's review board
          </Link>
          <Link className={styles.ghost} to="/maps">
            The measures, live
          </Link>
          <Link className={styles.ghost} to="/portfolio">
            Distribution by brand
          </Link>
        </div>
      </section>
    </div>
  );
}
