import { Fragment, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Provenance } from "@/domain/types";
import {
  ATTAINMENT_EVIDENCE,
  BAND_POINTS,
  BASE_BAND,
  CURVE_ROWS,
  HSMAI,
  MODELLED_OPENING,
  MODEL_QUARTERS,
  PLAN,
  PERIODS_PER_QUARTER,
  impliedQuarterlyQuota,
  type BandPoint,
} from "@/domain/pay";
import {
  BOOK_READ_ON,
  curvePoint,
  payReading,
  thresholdGap,
  type PayReading,
} from "@/domain/selectors/pay";
import { PERIOD_BY_ID } from "@/data/venue";
import { PROSPECT_BY_ID } from "@/data/prospects";
import { SCENARIOS, useScenario } from "@/state/ScenarioProvider";
import { useAsOf } from "@/state/ScenarioProvider";
import { useBook } from "@/state/BookProvider";
import { usePipeline } from "@/state/PipelineProvider";
import { PageHeader } from "@/components/chrome/PageHeader";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import styles from "./PayPage.module.css";

/**
 * WHAT THE WORK IS WORTH, AND THE GATE ON THE QUARTER.
 *
 * ── THE TEST THIS SCREEN IS HELD TO ───────────────────────────────
 * Does a person know what to do this week to be paid more, and is the
 * answer honest work rather than gaming? So the live quarter and the
 * dated actions come first, and the plan that produces them comes after.
 * A compensation page that opens with a plan document has answered a
 * different question.
 *
 * ── THE ONE THING THAT MAKES IT DEFENSIBLE ────────────────────────
 * Main Event publishes a salary band and two phrases: "Competitive
 * salary plus sales commission potential" and "Quarterly bonus program".
 * It publishes no rate, no quota, no threshold, no accelerator and no
 * mechanic, and neither does Dave and Buster's. So every figure here is
 * either that published band or a PERCENTAGE OF IT, and every percentage
 * carries the illustrative badge and the sentence that goes with it.
 * Nothing on this screen is a claim about how Main Event pays anybody.
 *
 * The percentages were shaped against HSMAI's incentive plan report,
 * which is published, and the benchmark is printed beside each one so a
 * reader can see both the proposal and the thing it was measured
 * against.
 *
 * ── THE QUOTA IS IMPLIED AND THE FORMULA IS ON SCREEN ─────────────
 * Fix the rate at 2% and the commission at plan at 10% of base and the
 * quarterly quota falls out by division. The application never asserts a
 * quota. It asserts a rate and shows what quota that rate implies, which
 * lets a general manager argue with the rate rather than with a number
 * that arrived from nowhere.
 *
 * ── THE BONUS IS GATED ON THE LEADING INDICATOR, ON PURPOSE ───────
 * The entry gate is the window coverage figure /coaching already
 * computes, over the quarter rather than over one period. Its
 * denominator is set by other organisations' calendars, so it cannot be
 * inflated by working the easy names. That is the whole argument of this
 * screen: the bonus is earned on work a person controls rather than on a
 * school district's budget cycle. /coaching makes that argument; this is
 * that argument made payable.
 *
 * ── NOTHING HERE CELEBRATES ───────────────────────────────────────
 * There is no cleared board, no mark, no closure treatment and no
 * announcement of a figure moving on this screen. A celebration fires
 * when a set empties, and money is not a set that empties. It is an
 * outcome, and a tool that throws a party when a number moves is the
 * first thing a professional switches off. The only live region here is
 * the polite one at the foot, and it speaks when a reader moves a
 * control, never when a figure changes on its own.
 *
 * ── WHICH SCENARIO DATES EXERCISE WHICH STATE ─────────────────────
 *   ?as-of=2026-09-23  default. The pre-opening quarter, day 38 of 112.
 *                      No revenue quota. The bonus is the two leading
 *                      gates, both short: 15 of 23 organisations worked
 *                      against a gate of 19, and 1.5 of 22 outside hours
 *                      ticked off. Commission runs anyway, on the two
 *                      deposits.
 *   ?as-of=2026-11-21  still pre-opening, one day after the first event.
 *                      The Heights Christian balance has collected, so
 *                      commission moves and the gates do not.
 *   ?as-of=2026-12-27  the first trading quarter. The revenue curve is
 *                      live for the first time, attainment reads against
 *                      the implied quota, and the threshold gap is
 *                      printed in contracts as well as in dollars.
 *   ?as-of=2027-06-01  a later trading quarter with nothing collected in
 *                      it, which is what a quarter looks like when the
 *                      book has run out rather than when it has failed.
 */

// ---------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const money = (n: number) => usd.format(n);

/** A percentage with one decimal, and no trailing nought where none is wanted. */
function pct(n: number, places = 1): string {
  const fixed = n.toFixed(places);
  return `${fixed.replace(/\.0+$/, "")}%`;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Dates are split rather than parsed, so no timezone can move one. */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

const hours = (n: number) => (n % 1 === 0 ? String(n) : n.toFixed(1));

// ---------------------------------------------------------------
// The drawing. Horizontal bars against a printed scale, and no radar.
// ---------------------------------------------------------------

/**
 * A bar with its own number, its own scale and, where one applies, the
 * gate printed on the track.
 *
 * The house encoding, and the reason for it: a bar's length is read
 * against a printed scale, the figure is beside it in words, the
 * direction of good is stated in the section rather than implied by a
 * hue, and the met or not met reading is a glyph and a word before it is
 * a colour. Put the page through greyscale and every reading survives.
 */
function ScaleBar({
  label,
  valueLabel,
  pctOfScale,
  marks = [],
  tone,
  state,
}: {
  label: string;
  valueLabel: string;
  pctOfScale: number;
  /** Printed marks on the track, as a share of the scale. */
  marks?: { at: number; label: string }[];
  tone: string;
  /** The word beside the bar. Never the colour on its own. */
  state?: { glyph: string; word: string; met: boolean };
}) {
  const width = Math.max(0, Math.min(100, pctOfScale));
  return (
    <div className={styles.barRow}>
      <div className={styles.barHead}>
        <span className={styles.barLabel}>{label}</span>
        {state ? (
          <span
            className={styles.barState}
            data-met={state.met ? "yes" : "no"}
          >
            <span aria-hidden="true">{state.glyph}</span> {state.word}
          </span>
        ) : null}
      </div>
      <div className={styles.barBody}>
        <div
          className={styles.barTrack}
          role="img"
          aria-label={`${label}. ${valueLabel}.`}
        >
          <div
            className={styles.barFill}
            style={{ width: `${width}%`, background: tone }}
          />
          {/*
            Mark labels sit under the track and alternate between two
            lines. Two marks seven points apart on a 140 point scale are
            forty five pixels apart at desktop and twenty at 380, which is
            narrower than either label, and two overlapping numbers are
            worse than no numbers at all. The tier is the cheapest fix
            that keeps every mark labelled at every width.
          */}
          {marks.map((mark, i) => {
            const at = `${Math.max(0, Math.min(100, mark.at))}%`;
            return (
              /*
                THE RULE AND ITS LABEL ARE SIBLINGS, NOT NESTED.

                The rule carries a background, because it is a drawn mark.
                A label inside it inherits that background as its nearest
                painted ancestor, which is both a real contrast failure
                for anything measuring the pair and a lie about what the
                text actually sits on, since the label hangs below the
                track. Two positioned siblings cost one span and the
                reading is measured against the surface it is painted on.
              */
              <Fragment key={mark.label}>
                <span
                  className={styles.barMark}
                  style={{ left: at }}
                  aria-hidden="true"
                />
                <span
                  className={styles.barMarkLabel}
                  style={{ left: at }}
                  data-tier={i % 2}
                  data-edge={
                    mark.at <= 2 ? "start" : mark.at >= 98 ? "end" : "mid"
                  }
                  aria-hidden="true"
                >
                  {mark.label}
                </span>
              </Fragment>
            );
          })}
        </div>
        <span className={`${styles.barValue} num`}>{valueLabel}</span>
      </div>
    </div>
  );
}

/** A figure with its badge, in the shape this page repeats sixteen times. */
function Reading({
  label,
  value,
  note,
  provenance,
}: {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  provenance: Provenance;
}) {
  return (
    <div className={styles.reading}>
      <span className={styles.readingLabel}>{label}</span>
      <span className={`${styles.readingValue} num`}>{value}</span>
      <ProvenanceBadge provenance={provenance} compact />
      {note ? <span className={styles.readingNote}>{note}</span> : null}
    </div>
  );
}

function SectionHead({
  eyebrow,
  title,
  id,
  children,
}: {
  eyebrow: string;
  title: string;
  id: string;
  children?: ReactNode;
}) {
  return (
    <div className={styles.sectionHead}>
      <p className={styles.sectionEyebrow}>{eyebrow}</p>
      <h2 className={styles.h2} id={id}>
        {title}
      </h2>
      {children ? <p className={styles.sectionLede}>{children}</p> : null}
    </div>
  );
}

// ---------------------------------------------------------------
// The scenario clock, which is chrome and says so
// ---------------------------------------------------------------

function ScenarioClock({
  asOf,
  announce,
}: {
  asOf: string;
  announce: (line: string) => void;
}) {
  const { current, moved, setAsOf } = useScenario();
  return (
    <section className={styles.clockBar} aria-labelledby="pay-scenario">
      <div className={styles.clockHead}>
        <h2 className={styles.clockTitle} id="pay-scenario">
          <span aria-hidden="true" className={styles.clockGlyph}>
            ◷
          </span>
          Scenario clock
        </h2>
        <p className={styles.clockNote}>
          Moves the date this application reads as today. It adds no contract,
          collects no money and invents no figure.
        </p>
      </div>
      <div className={styles.clockRow} role="group" aria-label="Choose a date">
        {SCENARIOS.map((scenario) => {
          const on = scenario.asOf === asOf;
          return (
            <button
              key={scenario.id}
              type="button"
              className={styles.clockKey}
              aria-pressed={on}
              title={scenario.because}
              onClick={() => {
                if (on) return;
                setAsOf(scenario.asOf);
                announce(
                  `Clock moved to ${formatDate(scenario.asOf)}. ${scenario.because}.`,
                );
              }}
            >
              <span className={styles.clockKeyLabel}>{scenario.label}</span>
              <span className={`${styles.clockKeyDate} num`}>
                {formatDate(scenario.asOf)}
              </span>
            </button>
          );
        })}
      </div>
      <p className={styles.clockReading}>
        <span aria-hidden="true">◇</span>{" "}
        {current
          ? `${current.label}. ${current.because}.`
          : `Reading ${formatDate(asOf)}, which is not one of the named points on the clock.`}
        {moved ? " The address carries the date, so this reading can be sent." : null}
      </p>
    </section>
  );
}

// ---------------------------------------------------------------
// The base, which every other figure is a percentage of
// ---------------------------------------------------------------

function BandControl({
  band,
  setBand,
  base,
  announce,
}: {
  band: BandPoint;
  setBand: (band: BandPoint) => void;
  base: number;
  announce: (line: string) => void;
}) {
  const through =
    ((base - BASE_BAND.low) / (BASE_BAND.high - BASE_BAND.low)) * 100;

  return (
    <section className={styles.bandBar} aria-labelledby="pay-band">
      <div className={styles.bandHead}>
        <h2 className={styles.bandTitle} id="pay-band">
          The base, and every figure below is a percentage of it
        </h2>
        <ProvenanceBadge provenance={BASE_BAND.provenance} />
      </div>
      <p className={styles.bandNote}>
        {money(BASE_BAND.low)} to {money(BASE_BAND.high)} a year, published on
        the posting itself. Pick a point in the band and the whole plan
        recomputes, because the arithmetic is base independent. That is the
        point of expressing all of it as percentages: a percentage of a
        published number invents nothing.
      </p>
      <div className={styles.bandKeys} role="group" aria-label="Point in the band">
        {BAND_POINTS.map((point) => {
          const on = point.id === band;
          return (
            <button
              key={point.id}
              type="button"
              className={styles.bandKey}
              aria-pressed={on}
              onClick={() => {
                if (on) return;
                setBand(point.id);
                announce(
                  `Base set to ${point.label.toLowerCase()}, ${money(point.value)}. Every figure on this screen is a percentage of it.`,
                );
              }}
            >
              <span className={styles.bandKeyLabel}>{point.label}</span>
              <span className={`${styles.bandKeyValue} num`}>
                {money(point.value)}
              </span>
            </button>
          );
        })}
      </div>
      <ScaleBar
        label="Where the chosen base sits in the published band"
        valueLabel={money(base)}
        pctOfScale={through}
        tone="var(--ledger-revenue)"
        marks={[
          { at: 0, label: "Bottom" },
          { at: 50, label: "Mid" },
          { at: 100, label: "Top" },
        ]}
      />
      <p className={styles.bandFoot}>
        Longer is more money, on this bar and on every bar below. The band is
        the only published figure on this screen.
      </p>
    </section>
  );
}

// ---------------------------------------------------------------
// The quarter, and what to do about it this week
// ---------------------------------------------------------------

function QuarterBlock({
  reading,
  gap,
}: {
  reading: PayReading;
  gap: ReturnType<typeof thresholdGap>;
}) {
  const { quarter, coverage, outside, collected, commission, bonus } = reading;
  const coverageNeeded = Math.ceil(coverage.inWindow * PLAN.coverageGate);

  return (
    <section className={styles.section} aria-labelledby="pay-quarter">
      <SectionHead
        eyebrow="First, because it is the question"
        title="This quarter, and what would move it"
        id="pay-quarter"
      >
        {quarter.label}, {formatDate(quarter.startDate)} to{" "}
        {formatDate(quarter.endDate)}. Day {reading.elapsedDays} of{" "}
        {reading.quarterDays}.{" "}
        {quarter.preOpening
          ? "It ends before the modelled opening, so there is no revenue quota in it and the bonus pays on the two leading gates instead."
          : "It is a trading quarter, so the revenue curve is live and the entry gate still has to be cleared before any of it pays."}
      </SectionHead>

      <div className={styles.readings}>
        <Reading
          label="Collected in this quarter"
          value={money(collected.inQuarter)}
          provenance="modeled"
          note={`${collected.contractsInQuarter} of the book's contracts collected money inside it. Deposits count on the day the book was read, balances on the event date.`}
        />
        <Reading
          label="Commission earned in this quarter"
          value={money(commission.inQuarter)}
          provenance="illustrative"
          note={`${pct(PLAN.commissionRate * 100, 1)} of collected contract value, from the first dollar, no threshold.`}
        />
        <Reading
          label="Bonus payable on today's reading"
          value={money(bonus.payable)}
          provenance="illustrative"
          note={
            bonus.state.kind === "pre-opening"
              ? `The quarterly target is ${money(bonus.target)}, a quarter of ${PLAN.bonusPct}% of base. A pre-opening quarter pays half of it for each leading gate, and ${bonus.state.gatesMet} of ${bonus.state.gatesTotal} are met.`
              : `The quarterly target is ${money(bonus.target)}, a quarter of ${PLAN.bonusPct}% of base. ${
                  bonus.state.kind === "gate-missed"
                    ? "A gate is missed, so it pays nothing whatever the revenue reads."
                    : bonus.state.kind === "below-threshold"
                      ? "Attainment is below the threshold, so it pays nothing yet."
                      : "Attainment is above the threshold, so it is paying."
                }`
          }
        />
        <Reading
          label="This quarter, both parts together"
          value={money(reading.quarterPay)}
          provenance="illustrative"
          note="Commission plus bonus. Base salary is not in this figure."
        />
      </div>

      <p className={styles.ledgerNote}>
        <span aria-hidden="true">▪</span> Commission is computed from the
        revenue ledger and from nothing else. The activity ledger carries hours
        and has no revenue field on it at all, so no hour anywhere in this
        application can become a dollar. Activity appears once on this screen,
        as a gate, where the unit stays hours. The two ledgers are on{" "}
        <Link to="/book">the book</Link> and they are never summed there
        either.
      </p>

      <h3 className={styles.h3}>The gates, before any money is counted</h3>
      <p className={styles.para}>
        Longer is better on every bar here, and the gate is printed on the
        track rather than left to a colour change. The coverage reading is the
        entry gate in every quarter. The outside hours reading is the second
        gate in a pre-opening quarter only, because it is standing in for a
        revenue curve that does not exist yet; once the venue trades, the
        second gate is the curve itself.
      </p>

      <ScaleBar
        label={`Calendar locked organisations worked inside their buying window, ${coverage.worked} of ${coverage.inWindow}`}
        valueLabel={
          coverage.share === null
            ? "no window opens in this quarter"
            : `${Math.round(coverage.share * 100)}%`
        }
        pctOfScale={(coverage.share ?? 0) * 100}
        tone={coverage.met ? "var(--ok)" : "var(--neutral)"}
        marks={[{ at: PLAN.coverageGate * 100, label: "Gate 80%" }]}
        state={{
          glyph: coverage.met ? "◼" : "◻",
          word: coverage.met ? "Gate met" : "Gate not met",
          met: coverage.met,
        }}
      />

      {quarter.preOpening ? (
        <ScaleBar
          label={`Hours outside the building completed against the hours planned, ${hours(outside.completedHours)} of ${hours(outside.plannedHours)}`}
          valueLabel={
            outside.share === null
              ? "none planned"
              : `${Math.round(outside.share * 100)}%`
          }
          pctOfScale={(outside.share ?? 0) * 100}
          tone={outside.met ? "var(--ok)" : "var(--neutral)"}
          marks={[{ at: 100, label: "Gate, the whole plan" }]}
          state={{
            glyph: outside.met ? "◼" : "◻",
            word: outside.met ? "Gate met" : "Gate not met",
            met: outside.met,
          }}
        />
      ) : null}

      {quarter.preOpening ? null : (
        <p className={styles.gateLine}>
          <span aria-hidden="true">{reading.contractFloorMet ? "◼" : "◻"}</span>{" "}
          <strong>The contract floor.</strong> {collected.contractsInQuarter} of{" "}
          {PLAN.contractFloor} contracts have collected in this quarter.{" "}
          {reading.contractFloorMet ? "Met." : "Not met, so the bonus is zero whatever the revenue reads."}{" "}
          It is here because revenue alone rewards chasing one whale while a
          scored event count rewards splitting, and this application has a live
          example of the second: the Heights Christian line is a voucher block
          of sixty at $19.95, and a plan that paid per event would pay more for
          booking it as three blocks of twenty. A floor cannot do that. It is
          crossed once, it pays nothing beyond itself, and the money is still
          decided by the revenue curve.
        </p>
      )}

      <h3 className={styles.h3}>What would move it this week</h3>
      <ol className={styles.actions}>
        {coverage.met ? (
          <li className={styles.action}>
            <span className={styles.actionVerb}>Hold the coverage gate.</span>{" "}
            {coverage.worked} of {coverage.inWindow} organisations whose window
            opens in this quarter have been worked, which is above the{" "}
            {coverageNeeded} the gate asks for. Every organisation whose window
            opens between now and the end of the quarter is a new denominator,
            so this is held rather than won.
          </li>
        ) : (
          <li className={styles.action}>
            <span className={styles.actionVerb}>
              Work {coverage.shortBy} more calendar locked{" "}
              {coverage.shortBy === 1
                ? "organisation inside its"
                : "organisations inside their"}{" "}
              buying window.
            </span>{" "}
            {coverage.worked} of {coverage.inWindow} are worked and the gate is{" "}
            {coverageNeeded}. Until that is cleared the quarterly bonus is
            zero whatever else happens, which is {money(reading.gateCost)} at
            this base. The list is on <Link to="/">the desk</Link>, sorted by
            the window that shuts first.
          </li>
        )}

        {quarter.preOpening && outside.met ? (
          <li className={styles.action}>
            <span className={styles.actionVerb}>
              The outside hours on the plan are done.
            </span>{" "}
            {hours(outside.completedHours)} of {hours(outside.plannedHours)}{" "}
            hours ticked off, so the second pre-opening gate is held.
          </li>
        ) : null}

        {quarter.preOpening && !outside.met ? (
          <li className={styles.action}>
            <span className={styles.actionVerb}>
              Complete the {hours(outside.outstandingHours)} outside hours still
              on the plan.
            </span>{" "}
            {hours(outside.completedHours)} of {hours(outside.plannedHours)}{" "}
            planned hours are ticked off. Tabling, networking and go sees count;
            a call block from a desk is outbound work and is counted elsewhere,
            but it is not the hours this gate is about. The plan is on{" "}
            <Link to="/book">the book</Link> and the week each shift falls in is
            on <Link to="/book/week">the week sheet</Link>.
          </li>
        ) : null}

        {!quarter.preOpening && !reading.contractFloorMet ? (
          <li className={styles.action}>
            <span className={styles.actionVerb}>
              Collect on{" "}
              {PLAN.contractFloor - collected.contractsInQuarter} more
              contracts to clear the floor of {PLAN.contractFloor}.
            </span>{" "}
            {collected.contractsInQuarter} have collected money inside this
            quarter. It is counted in contracts rather than in dollars so that
            one large booking cannot carry a quarter on its own, and it is a
            floor rather than a score so that crossing it pays nothing extra,
            which is what stops the count being worth inflating.
          </li>
        ) : null}

        {quarter.preOpening ? (
          <li className={styles.action}>
            <span className={styles.actionVerb}>
              Collect a deposit rather than a signature.
            </span>{" "}
            Commission runs normally in a pre-opening quarter, at{" "}
            {pct(PLAN.commissionRate * 100)} of collected contract value from
            the first dollar. This quarter has collected{" "}
            {money(collected.inQuarter)} and paid {money(commission.inQuarter)}.
            A signature with no deposit against it pays nothing, deliberately,
            because a held date is not cash.
          </li>
        ) : (
          <li className={styles.action}>
            <span className={styles.actionVerb}>
              Collect {money(gap.dollars)} more to reach the threshold.
            </span>{" "}
            That is where the bonus opens, at {Math.round(PLAN.threshold * 100)}
            % of the implied quota.{" "}
            {gap.contracts !== null && gap.averageContract !== null ? (
              <>
                At this book's average contract of {money(gap.averageContract)}{" "}
                that is {gap.contracts} contracts. The figure is printed in
                contracts as well as in dollars because a person cannot work a
                percentage.
              </>
            ) : null}{" "}
            Every dollar collected before that still pays{" "}
            {pct(PLAN.commissionRate * 100)} in commission, which is two cents
            on the dollar from the first dollar.
          </li>
        )}
      </ol>

      <p className={styles.para}>
        <strong>What the gate costs if it is missed.</strong>{" "}
        {money(reading.gateCost)} at this base, which is a quarter of the{" "}
        {PLAN.bonusPct}% bonus. It is deliberately expensive and deliberately
        payable on work a person controls. A quarter that books one large party
        while forty schools go untouched through the only window they open all
        year has burned the list for a year, and no revenue figure will show
        that until the following autumn.
      </p>

      <p className={styles.para}>
        <strong>No projection appears anywhere on this screen.</strong> Day{" "}
        {reading.elapsedDays} of {reading.quarterDays} is printed as elapsed
        days rather than drawn as a pace line, and there is no projected
        finish, because a contract book of this size moves by one booking and a
        projected finish is a prediction wearing the clothes of a fact.
      </p>
    </section>
  );
}

// ---------------------------------------------------------------
// The curve
// ---------------------------------------------------------------

/** The pay bars are drawn against the cap, which is the most that pays. */
const PAY_SCALE = 30;
/** The attainment bar is drawn against the cap of 140%. */
const ATTAINMENT_SCALE = 140;

function CurveBlock({ reading }: { reading: PayReading }) {
  const attainment = reading.attainment;

  return (
    <section className={styles.section} aria-labelledby="pay-curve">
      <SectionHead
        eyebrow="The shape of the plan"
        title="The curve, and where this quarter sits on it"
        id="pay-curve"
      >
        Each row is a level of attainment against the implied quota. The two
        bars beside it are what that level pays, as a percentage of base
        salary. Longer is more money. Commission and bonus are drawn as two
        bars rather than one stack, because they are earned on different things
        and one of them is gated.
      </SectionHead>

      {attainment === null ? (
        <p className={styles.callout}>
          <span aria-hidden="true">◇</span> There is no reading on this curve in
          a pre-opening quarter, because there is no revenue quota before there
          is a venue. Asking for a number twelve weeks before a building opens
          produces a figure that is wrong in whichever direction makes the next
          twenty minutes more comfortable, which is the argument{" "}
          <Link to="/coaching">the coaching page</Link> already makes about the
          weekly one to one. The revenue curve starts on{" "}
          {formatDate(MODELLED_OPENING)}. Until then the gates above are the
          whole bonus and commission runs on anything that collects.
        </p>
      ) : (
        <>
          <ScaleBar
            label="Attainment this quarter, against the implied quota"
            valueLabel={pct(attainment * 100, 2)}
            pctOfScale={(attainment * 100 * 100) / ATTAINMENT_SCALE}
            tone={
              attainment >= PLAN.threshold ? "var(--ok)" : "var(--neutral)"
            }
            marks={[
              { at: (PLAN.threshold * 100 * 100) / ATTAINMENT_SCALE, label: "90% threshold" },
              { at: (100 * 100) / ATTAINMENT_SCALE, label: "100% plan" },
              { at: 100, label: "140% cap" },
            ]}
            state={{
              glyph: attainment >= PLAN.threshold ? "◼" : "◻",
              word:
                attainment >= PLAN.threshold
                  ? "Above threshold"
                  : "Below threshold",
              met: attainment >= PLAN.threshold,
            }}
          />
          <p className={styles.para}>
            {money(reading.collected.inQuarter)} collected against an implied
            quota of {money(reading.quota)}. The bar is drawn on a scale that
            ends at the cap, so a reading this early in a quarter is a short
            bar and the figure beside it is the reading.
          </p>
        </>
      )}

      <p className={styles.caption}>
        The plan at five levels of attainment, as percentages of base salary.
        Every figure below is illustrative and every one of them is arithmetic
        from the four numbers in the plan. Both bars are drawn against the same
        scale, which ends at {PAY_SCALE}% of base, the most this plan can pay.
      </p>

      <ol className={styles.curve}>
        {CURVE_ROWS.map((row) => {
          const point = curvePoint(row.attainment);
          const here =
            attainment !== null &&
            Math.abs(attainment - row.attainment) < 0.0001;
          return (
            <li
              key={row.attainment}
              className={styles.curveRow}
              data-here={here ? "yes" : "no"}
            >
              <div className={styles.curveHead}>
                <span className={`${styles.curveLevel} num`}>
                  {pct(row.attainment * 100, 0)}
                </span>
                <span className={styles.rowNote}>{row.note}</span>
              </div>
              <ScaleBar
                label={`Commission at ${pct(row.attainment * 100, 0)} attainment`}
                valueLabel={pct(point.commission)}
                pctOfScale={(point.commission / PAY_SCALE) * 100}
                tone="var(--ledger-revenue)"
              />
              <ScaleBar
                label={`Bonus at ${pct(row.attainment * 100, 0)} attainment`}
                valueLabel={pct(point.bonus)}
                pctOfScale={(point.bonus / PAY_SCALE) * 100}
                tone="var(--sec, var(--sec-team))"
              />
              <p className={styles.curveTotal}>
                Total variable{" "}
                <strong className="num">{pct(point.total)}</strong> of base,
                which at the chosen base is{" "}
                <strong className="num">
                  {money((reading.base * point.total) / 100)}
                </strong>{" "}
                a year.
              </p>
            </li>
          );
        })}
      </ol>

      <p className={styles.para}>
        The arithmetic at the cap, because it is the number the plan was built
        backwards from. Commission scales linearly, so 1.4 times{" "}
        {PLAN.commissionPct}% is {PLAN.commissionPct * 1.4}%. The bonus is 100%
        of target plus forty points at {PLAN.accelerator} times, which is 160%
        of target, so {PLAN.bonusPct}% becomes {PLAN.bonusPct * 1.6}%. Fourteen
        plus sixteen is thirty per cent of base, landing exactly on HSMAI's
        converged maximum. That is why the accelerator is {PLAN.accelerator} and
        not two.
      </p>
    </section>
  );
}

// ---------------------------------------------------------------
// The quota, arrived at by division
// ---------------------------------------------------------------

function QuotaBlock({ base }: { base: number }) {
  return (
    <section className={styles.section} aria-labelledby="pay-quota">
      <SectionHead
        eyebrow="The number this application refuses to assert"
        title="The quota is implied, and here is the division"
        id="pay-quota"
      >
        Nobody publishes a quota for this job, so this application does not
        state one. It states a rate, and the quota falls out of the rate by
        division. A general manager can then argue with the rate, which is a
        thing that can be argued with, rather than with a number that arrived
        from nowhere.
      </SectionHead>

      <p className={styles.formula}>
        <span className="num">
          quarterly quota = ({PLAN.commissionPct}% of base / 4) /{" "}
          {pct(PLAN.commissionRate * 100)}
        </span>
      </p>

      <p className={styles.caption}>
        The same division at three points in the published band. The rate and
        the commission at plan are fixed; only the base moves. The outlined
        row is the point the control at the top of this screen is standing on.
      </p>

      <ul className={styles.quotaList}>
        {BAND_POINTS.map((point) => {
          const atPlan = (point.value * PLAN.commissionPct) / 100;
          return (
            <li
              key={point.id}
              className={styles.quotaRow}
              data-current={point.value === base ? "yes" : "no"}
            >
              <span className={styles.quotaLabel}>
                {point.label}
                <span className={`${styles.quotaBase} num`}>
                  {money(point.value)}
                </span>
              </span>
              <span className={styles.quotaSteps}>
                {PLAN.commissionPct}% of base is{" "}
                <span className="num">{money(atPlan)}</span>, a quarter of that
                is <span className="num">{money(atPlan / 4)}</span>, and at{" "}
                {pct(PLAN.commissionRate * 100)} that is collected contract
                value of
              </span>
              <span className={`${styles.quotaValue} num`}>
                {money(impliedQuarterlyQuota(point.value))}
              </span>
            </li>
          );
        })}
      </ul>

      <p className={styles.para}>
        At the midpoint that is {money(impliedQuarterlyQuota(BASE_BAND.mid))} of
        collected contract value a quarter, or about{" "}
        {money(impliedQuarterlyQuota(BASE_BAND.mid) * 4)} a year. It is a
        derived figure and it is drawn as one. Change the rate and every quota
        on this page changes with it, which is the property that makes the rate
        the thing worth discussing.
      </p>

      <div className={styles.readings}>
        <Reading
          label="Commission rate on collected contract value"
          value={pct(PLAN.commissionRate * 100)}
          provenance="illustrative"
          note="From the first dollar, with no threshold. This application's own proposal."
        />
        <Reading
          label="Implied quota at the chosen base"
          value={money(impliedQuarterlyQuota(base))}
          provenance="modeled"
          note="Calculated from the rate and the commission at plan. Not asserted anywhere."
        />
        <Reading
          label="Deposits collect on"
          value={formatDate(BOOK_READ_ON)}
          provenance="modeled"
          note="The seed carries no signature date, so a deposit is treated as collected on the day the book was read, and a balance on the event date."
        />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------
// Where the numbers came from, and where they deliberately did not
// ---------------------------------------------------------------

function PlanBlock({ base }: { base: number }) {
  const quarter = MODEL_QUARTERS[0];
  return (
    <section className={styles.section} aria-labelledby="pay-plan">
      <SectionHead
        eyebrow="The proposal, and the benchmark beside it"
        title="Two components, two metrics, and where each number came from"
        id="pay-plan"
      >
        Every line below is this application's own proposal, printed next to the
        published benchmark it was shaped against. Nothing in the
        left column is a claim about Main Event or Dave and Buster's.
      </SectionHead>

      <dl className={styles.plan}>
        <dt>
          <span>
            Target variable {PLAN.targetVariablePct}% of base at plan, split{" "}
            {PLAN.commissionPct} commission and {PLAN.bonusPct} bonus
          </span>
          <ProvenanceBadge provenance="illustrative" compact />
        </dt>
        <dd>
          HSMAI reports maximum incentive converged at 30% of base, with a range
          of 10% to 50%. This plan reaches exactly 30% at its cap.
        </dd>

        <dt>
          <span>
            Commission {pct(PLAN.commissionRate * 100)} of collected contract
            value, from the first dollar, no threshold
          </span>
          <ProvenanceBadge provenance="illustrative" compact />
        </dt>
        <dd>
          A deliberate departure. 97% of plans in the report are goal based;
          here the bonus carries all the gating instead. A threshold on
          commission pays nothing for the two hardest sales a building will ever
          make, which are the first two in a trade area nobody has worked.
        </dd>

        <dt>
          <span>Paid quarterly</span>
          <ProvenanceBadge provenance="illustrative" compact />
        </dt>
        <dd>
          {HSMAI.quarterlyShare}. The posting's "quarterly bonus program" is
          therefore not a perk, it is the standard structure of this job, which
          is a useful thing to be able to say in an interview.
        </dd>

        <dt>
          <span>
            Threshold at {Math.round(PLAN.threshold * 100)}% of quota, paying{" "}
            {Math.round(PLAN.thresholdPayout * 100)}% of target there
          </span>
          <ProvenanceBadge provenance="illustrative" compact />
        </dt>
        <dd>
          Below the benchmark, where {HSMAI.thresholdBand}. The reason is
          immediately below, and it is the departure this page argues for
          hardest.
        </dd>

        <dt>
          <span>
            Accelerator {PLAN.accelerator} times target above plan, capped at{" "}
            {Math.round(PLAN.cap * 100)}%
          </span>
          <ProvenanceBadge provenance="illustrative" compact />
        </dt>
        <dd>Inside the benchmark, where {HSMAI.capBand}.</dd>

        <dt>
          <span>Two metrics, with two gates rather than a third score</span>
          <ProvenanceBadge provenance="illustrative" compact />
        </dt>
        <dd>{HSMAI.metrics}.</dd>
      </dl>

      <p className={styles.sourceLine}>
        <ProvenanceBadge provenance={HSMAI.provenance} compact /> Benchmark
        column read from{" "}
        <a href={HSMAI.url} target="_blank" rel="noreferrer">
          {HSMAI.source}
        </a>
        .
      </p>

      <h3 className={styles.h3}>
        Why the threshold is {Math.round(PLAN.threshold * 100)} and not 95
      </h3>
      <p className={styles.para}>
        The best public dataset on actual attainment across more than a thousand
        commission plans reports median attainment of{" "}
        {pct(ATTAINMENT_EVIDENCE.median * 100)}, a mean of{" "}
        {pct(ATTAINMENT_EVIDENCE.mean * 100)},{" "}
        {pct(ATTAINMENT_EVIDENCE.belowHalf * 100)} of sellers below half of
        quota and {pct(ATTAINMENT_EVIDENCE.atOrAbovePlan * 100)} at or above
        plan. A threshold at 95% of a quota nobody has a history to set is a
        bonus designed not to pay the median performer. On a book lumpy enough
        that one three hundred guest party moves a whole quarter, against a
        posting that says in its own words that the person it wants is "driven
        by your bonus", that produces the opposite of what it was written for.
        So the threshold is lower, the departure is named rather than hidden,
        and the reason is printed where the number is.
      </p>
      <p className={styles.sourceLine}>
        <ProvenanceBadge provenance={ATTAINMENT_EVIDENCE.provenance} compact />{" "}
        <a href={ATTAINMENT_EVIDENCE.url} target="_blank" rel="noreferrer">
          {ATTAINMENT_EVIDENCE.source}
        </a>
        .
      </p>

      <h3 className={styles.h3}>Where the quarter came from</h3>
      <p className={styles.para}>
        There was no quarter anywhere in this application, and the cheap way to
        get one is a fifth period type. A quarter here is instead a{" "}
        <strong>grouping of {PERIODS_PER_QUARTER} consecutive periods</strong>.
        Four periods of four weeks is sixteen weeks, and the four periods in the
        pre-opening calendar span{" "}
        {quarter ? (
          <span className="num">
            {formatDate(quarter.startDate)} to {formatDate(quarter.endDate)}
          </span>
        ) : null}
        , which is one whole bonus quarter of pre-opening work whose boundaries
        already exist in the data. A grouping cannot disagree with the thing it
        groups; a fifth enum value eventually would, and the disagreement would
        surface as a bonus paid on a quarter the period selector has never heard
        of.
      </p>
      <ul className={styles.periodList}>
        {(quarter?.periodIds ?? []).map((id) => {
          const period = PERIOD_BY_ID[id];
          return (
            <li key={id}>
              <span className={styles.periodLabel}>
                {period?.label ?? id}
              </span>
              <span className={`${styles.periodDates} num`}>
                {period ? `${formatDate(period.startDate)} to ${formatDate(period.endDate)}` : ""}
              </span>
            </li>
          );
        })}
      </ul>
      <p className={styles.para}>
        Past the pre-opening calendar the grouping has nothing to group, because
        Main Event has published no opening date and this application has
        published no trading calendar. Quarters after{" "}
        {formatDate(MODELLED_OPENING)} keep the same sixteen week rhythm, carry
        no periods, and say so where they are drawn. The modelled opening is the
        day after the last pre-opening period ends. It decides one thing only,
        which is whether a quarter is pre-opening, and it is not a claim about
        when the building opens.
      </p>

      <h3 className={styles.h3}>The pre-opening quarter pays differently</h3>
      <p className={styles.para}>
        In any quarter ending before the modelled opening the bonus pays on the
        two leading gates only, half each, all or nothing: window coverage at{" "}
        {Math.round(PLAN.coverageGate * 100)}%, and the outside hours on the
        plan completed. Commission runs normally on anything that collects. This
        is the one place the plan pays for activity rather than for revenue, and
        the reason is that the alternative is a person carrying a zero bonus for
        four consecutive quarters, which is how a venue loses the person the
        posting describes. At this base each gate is worth{" "}
        {money((base * PLAN.bonusPct) / 100 / 4 / 2)}.
      </p>
    </section>
  );
}

function PublishedBlock() {
  return (
    <section className={styles.section} aria-labelledby="pay-published">
      <SectionHead
        eyebrow="The part that is checkable"
        title="What Main Event publishes about pay, in full"
        id="pay-published"
      >
        Three things, and this is the complete set.
      </SectionHead>

      <ul className={styles.published}>
        <li>
          <span className={styles.publishedLabel}>The band</span>
          <span className={`${styles.publishedValue} num`}>
            {money(BASE_BAND.low)} to {money(BASE_BAND.high)} a year
          </span>
          <ProvenanceBadge provenance="public" compact />
          <span className={styles.publishedNote}>{BASE_BAND.source}.</span>
        </li>
        <li>
          <span className={styles.publishedLabel}>Perk P1</span>
          <span className={styles.publishedValue}>
            "Competitive salary plus sales commission potential"
          </span>
          <ProvenanceBadge provenance="public" compact />
          <span className={styles.publishedNote}>
            The word is "potential". No rate is attached to it anywhere.
          </span>
        </li>
        <li>
          <span className={styles.publishedLabel}>Perk P2</span>
          <span className={styles.publishedValue}>"Quarterly bonus program"</span>
          <ProvenanceBadge provenance="public" compact />
          <span className={styles.publishedNote}>
            Four words. The posting names the bonus a second time in what it is
            looking for: "You like to surpass targets and are driven by your
            bonus."
          </span>
        </li>
      </ul>

      <p className={styles.callout}>
        <span aria-hidden="true">▩</span>{" "}
        <strong>
          No commission rate, quota, threshold, accelerator or bonus mechanic is
          published by Main Event or by Dave and Buster's anywhere this research
          could reach.
        </strong>{" "}
        The salary sites carry self reported total compensation for these
        titles, but those report pay levels rather than plan design and they are
        unverifiable individual submissions, so none of them is quoted here as a
        plan. Every other figure on this screen is this application's own
        proposal, badged illustrative, in the same words the league fee and the
        response commitment already use: the venue's own, invented for this
        prototype, and not a claim about how Main Event operates.
      </p>
    </section>
  );
}

// ---------------------------------------------------------------
// The page
// ---------------------------------------------------------------

export function PayPage() {
  const asOf = useAsOf();
  const { book, activity } = useBook();
  const pipeline = usePipeline();

  const [band, setBand] = useState<BandPoint>("mid");
  const [announcement, setAnnouncement] = useState("");

  const base =
    BAND_POINTS.find((point) => point.id === band)?.value ?? BASE_BAND.mid;

  const reading = useMemo(
    () =>
      payReading({
        book,
        activity,
        statuses: pipeline.statuses,
        asOf,
        base,
      }),
    [book, activity, pipeline.statuses, asOf, base],
  );

  const gap = useMemo(() => thresholdGap(reading, book), [reading, book]);

  /* The organisations behind the two collection events, named because
     every figure in this application can be traced back to a row a
     reader can open. */
  const collectingNames = reading.collected.events
    .map((event) => PROSPECT_BY_ID[event.prospectId]?.name)
    .filter((name): name is string => Boolean(name));

  return (
    <div className={styles.page}>
      <PageHeader />
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>The floor, made payable</p>
          <h1 className={styles.h1}>Pay</h1>
          <p className={styles.thesis}>
            The posting names the bonus twice, once as a perk and once as a
            quality it wants in a person. This screen answers the only question
            that makes either of those useful: what would a person do this week
            to be paid more, and is the answer honest work rather than gaming
            the measure.
          </p>
          <p className={styles.framing}>
            The answer is the gate. The quarterly bonus is gated on the leading
            indicator that <Link to="/coaching">the coaching page</Link> already
            argues for, which is calendar locked organisations worked inside
            their own buying window. Its denominator is set by other
            organisations' calendars, so it cannot be inflated by working the
            easiest names on the board, and it is earned on work a person
            controls rather than on a school district's budget cycle.
          </p>
          <p className={styles.framing}>
            Nothing on this screen celebrates anything. Money is an outcome
            rather than a completed task, and a tool that throws a party when a
            figure moves is the first thing a professional switches off.
          </p>
        </header>

        <ScenarioClock asOf={asOf} announce={setAnnouncement} />

        <BandControl
          band={band}
          setBand={setBand}
          base={base}
          announce={setAnnouncement}
        />

        <QuarterBlock reading={reading} gap={gap} />
        <CurveBlock reading={reading} />
        <QuotaBlock base={base} />
        <PlanBlock base={base} />
        <PublishedBlock />

        <section className={styles.section} aria-labelledby="pay-foot">
          <SectionHead
            eyebrow="Where the figures on this screen live"
            title="The rest of the working"
            id="pay-foot"
          />
          <p className={styles.para}>
            The contracts behind the collected figure are on{" "}
            <Link to="/book">the book</Link>
            {collectingNames.length > 0 ? (
              <>
                {" "}
                and this quarter's collections belong to{" "}
                {collectingNames.join(" and ")}
              </>
            ) : null}
            . The hours behind the second gate are on the same page and on{" "}
            <Link to="/book/week">the week sheet</Link>. The coverage figure and
            the argument for it are on <Link to="/coaching">coaching</Link>. The
            seats that would carry these goals are on{" "}
            <Link to="/team">the floor</Link>, the version of all of it that
            goes up the line is on <Link to="/report">the district report</Link>
            , and every formula in this application is on{" "}
            <Link to="/method">method</Link>.
          </p>
        </section>
      </div>

      {/* The one live region. Mounted from the first render, never
          re-keyed, polite, and silent until a reader moves a control. No
          figure announces itself here. */}
      <p className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
