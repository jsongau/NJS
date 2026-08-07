import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { allPlans, fieldSummary } from "@/domain/selectors/activation";
import { ACTIVATION_KIND, RECAP_BY_ACTIVATION } from "@/data/activations";
import { BRAND_BY_ID } from "@/data/brands";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { JarIcon, EmptyJarIcon, RoutePinIcon, TagIcon } from "@/components/territory/DistilleryIcons";
import styles from "./FieldPage.module.css";

/**
 * Field and experiential marketing.
 *
 * WHY A SELLING APP HAS THIS PAGE. The brief names "experiential/field
 * marketing" as one of five touchpoints a CRM strategy has to span. An
 * events calendar would answer that literally and prove nothing. What
 * follows is the version a CRM director would actually want, and it
 * rests on one argument:
 *
 *   A FESTIVAL DOES NOT SELL PRODUCT. It cannot — a supplier pouring at
 *   an event is sampling, and the money changes hands somewhere else
 *   entirely. What a festival produces is three thousand people who now
 *   know what Blackberry tastes like, standing within a mile of four
 *   liquor stores that may or may not have it on the shelf.
 *
 * So the measure of an activation is not samples poured or impressions
 * delivered. It is EXPOSURE MET BY AVAILABILITY: how many people met the
 * brand, and whether the shelf within reach of them was ready. Pouring
 * beside a store that does not stock what you are pouring is not
 * marketing, it is a donation — and it is the commonest failure in the
 * discipline, because the events team books the site, the sales team
 * owns the shelf, and those two calendars never meet.
 *
 * The CRM director sits across both. This page is that job.
 *
 * THREE SECTIONS, IN THE ORDER THE WORK HAPPENS: plan the catchment
 * before the trucks arrive, capture contacts lawfully on the day, file
 * the recap afterwards. The third is the one that never happens, which
 * is why its compliance rate is reported as a headline number rather
 * than buried.
 */

export function FieldPage() {
  const plans = useMemo(() => allPlans(), []);
  const summary = useMemo(() => fieldSummary(), []);
  const [openId, setOpenId] = useState(plans[0]?.activation.id ?? "");
  const plan = plans.find((p) => p.activation.id === openId) ?? plans[0];
  const recap = plan ? RECAP_BY_ACTIVATION[plan.activation.id] : undefined;

  if (!plan) return null;

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <p className={styles.eyebrow}>Experiential and field</p>
        <h1>A festival does not sell anything. The shop across the road does.</h1>
        <p className={styles.lede}>
          A supplier pouring at an event is sampling, not retailing — the money
          changes hands somewhere the supplier is not a party to. So the measure
          of an activation is not samples poured. It is whether the shelf within
          walking distance of the crowd was ready for them. Pouring beside a
          store that does not stock what you are pouring is a donation.{" "}
          <ProvenanceBadge provenance="modeled" /> on every event; the sites are
          real places, the bookings are not.
        </p>
      </header>

      {/* --- Programme summary ---------------------------------------- */}
      <section className={styles.stats} aria-label="Field programme">
        <div className={styles.stat}>
          <span className={styles.statKey}>Activations</span>
          <span className={`${styles.statVal} num`}>{summary.activations}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statKey}>People reached</span>
          <span className={`${styles.statVal} num`}>
            {summary.attendance.toLocaleString("en-US")}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statKey}>Contacts capturable</span>
          <span className={`${styles.statVal} ${styles.gold} num`}>
            {summary.captureCeiling.toLocaleString("en-US")}
          </span>
          <span className={styles.statSub}>
            ceiling set by tablets in hands, not by crowd size
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statKey}>Calls before the trucks</span>
          <span className={`${styles.statVal} num`}>
            {summary.unstockedCalls}
          </span>
          <span className={styles.statSub}>
            accounts in a catchment missing something being poured
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statKey}>Recaps filed</span>
          <span
            className={`${styles.statVal} num ${
              summary.recapRate < 0.6 ? styles.bad : ""
            }`}
          >
            {summary.filed}/{summary.activations}
          </span>
          <span className={styles.statSub}>
            an unfiled recap is a crowd, a cost, and nothing to act on
          </span>
        </div>
      </section>

      {/* --- Activation picker ----------------------------------------- */}
      <div className={styles.picker} role="tablist" aria-label="Activations">
        {plans.map((p) => {
          const k = ACTIVATION_KIND[p.activation.kind];
          return (
            <button
              key={p.activation.id}
              role="tab"
              type="button"
              aria-selected={p.activation.id === openId}
              className={[
                styles.tab,
                p.activation.id === openId ? styles.tabOn : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setOpenId(p.activation.id)}
            >
              <span className={styles.tabName}>
                <span aria-hidden="true">{k.glyph}</span> {p.activation.name}
              </span>
              <span className={styles.tabMeta}>
                {p.activation.city} ·{" "}
                {p.activation.attendance.toLocaleString("en-US")} people ·{" "}
                {p.catchment.length} account
                {p.catchment.length === 1 ? "" : "s"} in reach
              </span>
            </button>
          );
        })}
      </div>

      {/* --- 1. The catchment ------------------------------------------ */}
      <section className={styles.panel}>
        <div className={styles.sectionHead}>
          <h2>
            <span className={styles.no}>1</span> Before the trucks arrive
          </h2>
          <p>
            Every retail account within {plan.activation.catchmentMiles} mile
            {plan.activation.catchmentMiles === 1 ? "" : "s"} of the site, and
            whether it stocks what is being poured. One mile is walking distance
            in this corridor and deliberately tighter than the five an agency
            would claim — a radius chosen to flatter the report is a radius that
            sends a rep to stores nobody at the event will ever enter.
          </p>
        </div>

        <div className={styles.pouring}>
          <span className={styles.pouringKey}>Pouring</span>
          {plan.activation.brandIds.map((b) => (
            <span key={b} className={styles.brandChip}>
              {BRAND_BY_ID[b]?.name ?? b}
            </span>
          ))}
        </div>

        <ul className={styles.catchment}>
          {plan.catchment.map((c) => (
            <li
              key={c.account.id}
              className={`${styles.acct} ${styles[`s-${c.state}`]}`}
            >
              <span className={styles.acctIcon} aria-hidden="true">
                {c.state === "ready" ? (
                  <JarIcon size={26} />
                ) : (
                  <EmptyJarIcon size={26} />
                )}
              </span>
              <span className={styles.acctBody}>
                <span className={styles.acctName}>
                  {c.account.chainName}, {c.account.city}
                </span>
                <span className={styles.acctState}>
                  {c.state === "ready"
                    ? "Stocks everything being poured"
                    : c.state === "partial"
                      ? `Missing ${c.missing.map((b) => BRAND_BY_ID[b]?.name ?? b).join(" and ")}`
                      : "Stocks none of it — this one is the donation case"}
                </span>
              </span>
              <span className={`${styles.acctMiles} num`}>
                {c.miles.toFixed(2)}
                <span className={styles.unit}>mi</span>
              </span>
              {c.preEventCases > 0 ? (
                <Link
                  className={styles.acctAction}
                  to={`/?account=${c.account.id}`}
                >
                  Put {c.preEventCases} cases in first
                </Link>
              ) : (
                <span className={styles.acctOk}>Ready</span>
              )}
            </li>
          ))}
          {plan.catchment.length === 0 ? (
            <li className={styles.empty}>
              No retail account within {plan.activation.catchmentMiles} miles.
              Worth knowing before the booking, not after — this is an
              activation with no shelf behind it.
            </li>
          ) : null}
        </ul>

        <div className={styles.derived}>
          <div>
            <span className={styles.dKey}>People per ready account</span>
            <span className={`${styles.dVal} num`}>
              {plan.attendancePerReadyAccount?.toLocaleString("en-US") ?? "—"}
            </span>
          </div>
          <div>
            <span className={styles.dKey}>Catchment ready</span>
            <span className={`${styles.dVal} num`}>
              {Math.round(plan.readyShare * 100)}%
            </span>
          </div>
          <div>
            <span className={styles.dKey}>Cases to place first</span>
            <span className={`${styles.dVal} num`}>{plan.preEventCases}</span>
          </div>
        </div>

        <p className={styles.permit}>
          <span className={styles.permitKey}>
            <TagIcon size={14} /> What permits the pour
          </span>
          {plan.activation.permit}
        </p>
      </section>

      {/* --- 2. The tablet --------------------------------------------- */}
      <section className={styles.panel}>
        <div className={styles.sectionHead}>
          <h2>
            <span className={styles.no}>2</span> On the day
          </h2>
          <p>
            The screen an ambassador holds at the end of the queue. The field
            order is the entire point of it.
          </p>
        </div>

        <div className={styles.tabletWrap}>
          <div className={styles.tablet} aria-label="Capture screen, illustrative">
            <p className={styles.tabletBrand}>{plan.activation.name}</p>
            <ol className={styles.fields}>
              <li className={styles.fieldOn}>
                <span className={styles.fNum}>1</span>
                <span>
                  <strong>Date of birth</strong>
                  <span className={styles.fHint}>
                    Month, day and year. Not a checkbox.
                  </span>
                </span>
              </li>
              <li className={styles.fieldOn}>
                <span className={styles.fNum}>2</span>
                <span>
                  <strong>Email</strong>
                  <span className={styles.fHint}>
                    Only reachable once step one passes
                  </span>
                </span>
              </li>
              <li className={styles.fieldOn}>
                <span className={styles.fNum}>3</span>
                <span>
                  <strong>What did you taste?</strong>
                  <span className={styles.fHint}>
                    The one thing this beats an ecommerce form at
                  </span>
                </span>
              </li>
              <li className={styles.fieldOff}>
                <span className={styles.fNum}>4</span>
                <span>
                  <strong>Text me offers</strong>
                  <span className={styles.fHint}>
                    Separate, declinable, and not a condition of anything
                  </span>
                </span>
              </li>
            </ol>
          </div>

          <div className={styles.rules}>
            <h3>Why it is in that order</h3>
            <p>
              <strong>Date of birth comes first because the Code says so.</strong>{" "}
              DISCUS Code of Responsible Practices (2025) §2D.B.6: information
              may only be collected from people of legal purchase age, and the
              affirmation must precede the collection. §2D.B.2 defines it as
              full month, day and year — a tick box reading &ldquo;I am
              21&rdquo; does not satisfy it. An email field above a birthday
              field is a list built in a state the Code forbids.
            </p>
            <p>
              <strong>The SMS opt-in is a separate ask.</strong> 47 CFR
              §64.1200(f) requires prior express written consent naming the
              specific number, with a disclosure that agreeing is not a
              condition of anything. Bundled into the same tap, it is not
              consent — it is a number you may not text.
            </p>
            <p>
              <strong>&ldquo;What did you taste&rdquo; is the whole prize.</strong>{" "}
              It is a declared product preference, captured at the only moment
              the person genuinely knows the answer, in a category where the
              three-tier system otherwise hides every purchase. No ecommerce
              form gets this.
            </p>
            <p className={styles.ceiling}>
              Capture ceiling for this activation:{" "}
              <span className="num">
                {plan.captureCeiling.toLocaleString("en-US")}
              </span>{" "}
              contacts — {plan.activation.ambassadors} ambassadors, 34 an hour,
              eight-hour days. The constraint is tablets in hands, not crowd
              size, and budgeting against attendance is how a programme
              overpromises.
            </p>
          </div>
        </div>
      </section>

      {/* --- 3. The recap ---------------------------------------------- */}
      <section className={styles.panel}>
        <div className={styles.sectionHead}>
          <h2>
            <span className={styles.no}>3</span> Afterwards
          </h2>
          <p>
            The recap is what makes an activation a data source, and it is the
            thing that never gets filed. Samples poured is an inventory record
            before it is a marketing one — product used at a sampling event
            comes off the books and has to be accounted for.
          </p>
        </div>

        {recap?.filed ? (
          <div className={styles.recapFiled}>
            <p className={styles.recapTop}>
              <span aria-hidden="true">✓</span> Filed {recap.filedAt} by{" "}
              {recap.ambassador}
            </p>
            <dl className={styles.recapGrid}>
              <div>
                <dt>Samples poured</dt>
                <dd className="num">{recap.samplesPoured}</dd>
              </div>
              <div>
                <dt>Contacts captured</dt>
                <dd className="num">{recap.contactsCaptured}</dd>
              </div>
              <div>
                <dt>Capture rate</dt>
                <dd className="num">
                  {recap.contactsCaptured && plan.activation.attendance
                    ? `${((recap.contactsCaptured / plan.activation.attendance) * 100).toFixed(1)}%`
                    : "—"}
                </dd>
              </div>
            </dl>
            {recap.heardOnTheFloor ? (
              <blockquote className={styles.heard}>
                {recap.heardOnTheFloor}
              </blockquote>
            ) : null}
            {recap.followUp ? (
              <p className={styles.followUp}>
                <span className={styles.fuKey}>
                  <RoutePinIcon size={14} /> Next action
                </span>
                {recap.followUp}
              </p>
            ) : null}
          </div>
        ) : (
          <div className={styles.recapMissing}>
            <p className={styles.recapTop}>
              <span aria-hidden="true">○</span> No recap filed
            </p>
            <p>
              {plan.activation.attendance.toLocaleString("en-US")} people, {plan.activation.ambassadors}{" "}
              ambassadors and up to{" "}
              {plan.captureCeiling.toLocaleString("en-US")} capturable contacts,
              and nothing on record. This is what a field budget looks like when
              it cannot defend itself in a bad quarter: the spend is documented
              and the return is anecdotal.
            </p>
            <p className={styles.recapWhy}>
              There is no button here to mark it filed. A recap is a thing an
              ambassador does, not a state a manager sets — and a register you
              can wave through is one that will eventually disagree with what
              actually happened.
            </p>
          </div>
        )}
      </section>

      <nav className={styles.next} aria-label="Continue">
        <Link className={styles.primary} to="/maps">
          See the catchment on the map
        </Link>
        <Link className={styles.ghost} to="/programs">
          The merchandising calendar
        </Link>
        <Link className={styles.ghost} to="/">
          Build one of these orders
        </Link>
      </nav>
    </div>
  );
}
