import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { PitchStatus, Provenance } from "@/domain/types";
import { VENUE } from "@/data/venue";
import { STANDARD_TERMS } from "@/data/packages";
import { SEED_REQUESTS } from "@/data/requests";
import { PROSPECT_BY_ID } from "@/data/prospects";
import { ACTING_SEAT_ID, seatLabel } from "@/data/seats";
import { LANE_META } from "@/domain/lanes";
import { PITCH_STATUS, PITCH_STATUS_ORDER } from "@/domain/vocabulary";
import { RESPONSE_COMMITMENT } from "@/domain/requests";
import { OBJECTION_BY_ID } from "@/data/objections";
import { MODELLED_OPENING } from "@/domain/pay";
import {
  activityReading,
  boardReading,
  commitments,
  elapsedIn,
  exceptions,
  heldDates,
  losses,
  openEnquiries,
  previousPeriodOf,
  reportPeriodFor,
  revenueReading,
  RATE_GUARD,
} from "@/domain/selectors/district";
import { hoursPerThousandBooked, useBook } from "@/state/BookProvider";
import { usePipeline } from "@/state/PipelineProvider";
import { SCENARIOS, useAsOf, useScenario } from "@/state/ScenarioProvider";
import { PageHeader } from "@/components/chrome/PageHeader";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { LaneChip } from "@/components/primitives/LaneChip";
import { Button } from "@/components/primitives/Button";
import styles from "./DistrictPage.module.css";

/**
 * THE WEST DIVISION WEEKLY. The document that goes up the line.
 *
 * The posting says it plainly: report weekly to the West Division. Until
 * this page existed the console had no upward surface at all. It also
 * had no month: daily was the rings and weekly was the week sheet, and
 * the third word in "daily, weekly, and monthly" had nowhere to live.
 *
 * ── THE STRUCTURAL FACT THIS DOCUMENT SITS ON ─────────────────────
 * The five West Division brands are run as local businesses. Service
 * Champions, ASI Hastings, Adeedo, Powell and Timo's each publish their
 * own offers, their own membership plan and their own phone number, and
 * NOT ONE OF THE FIVE SITES MENTIONS CHAMPIONS GROUP ANYWHERE. That is a
 * structural fact rather than a criticism: local trust is the asset, and
 * a homeowner in Brea is buying from a 25 year old local name rather
 * than from a group of twenty two brands owned by a private equity
 * buyer. The consequence for this document is exactly the one it is
 * built around. The division cannot be seen by the customer, so the
 * only place the five brands are ever visible side by side is a report
 * like this one, and anything the division wants to know has to be
 * carried up rather than read off a shared shopfront.
 *
 * ── IT IS PRINTABLE, AND THAT IS THE REQUIREMENT RATHER THAN A NICETY ──
 * A Director of Marketing reads this between two branches, often at the
 * same time as four other brands' versions of it. A dashboard they have
 * to log into and configure is a worse artefact than a page they can
 * print, hold and write on, so everything below the control strip is
 * laid out for paper first. The week sheet already proved this codebase
 * can produce a real printable; this is the same discipline pointed at a
 * different reader.
 *
 * ── THE FIVE FIELDS, AND THE ONE THAT MATTERS MOST ────────────────
 * The two ledgers, the board, the held slots with their release dates,
 * the losses with their reasons, and the exceptions the branch wants a
 * decision on. That last one is the difference between partnering with a
 * division and reporting to one: a weekly page with no ask in it is a
 * status update, and a director receiving five status updates a week
 * reads none of them. Every exception on this page names the decision
 * wanted and the date it is wanted by, and every one of those dates
 * comes off the row itself.
 *
 * ── WHAT THIS PAGE REFUSES TO DO ──────────────────────────────────
 * It never adds the two ledgers together. It never pro rata a sold-work
 * figure, because a signature is an event and not a rate. It prints no
 * projected finish at any elapsed day, only the run rate the rest of the
 * period would need, and it prints nothing at all until the period has
 * enough of itself behind it. And it names no person: the recipient is a
 * role and a title, the author is a seat, and nothing on the page could
 * be mistaken for either.
 *
 * ── NOTHING HERE CELEBRATES ───────────────────────────────────────
 * No cleared board, no mark, no closure treatment, no confetti and no
 * sound. A celebration belongs where a set empties. A report is not a
 * set, and a tool that threw a celebration inside a document addressed
 * to a director would be the first thing a professional switched off. The
 * only live region is the polite one at the foot, and it speaks when a
 * reader moves the clock and at no other time.
 *
 * ── WHICH SCENARIO DATES EXERCISE WHICH READING ───────────────────
 *   ?as-of=2026-09-23  default. The heating build, day eight of twenty
 *                      working days. Both deposits collected, the
 *                      previous band collected nothing, the field hours
 *                      are behind the straight line and the run rate is
 *                      printed because the band is old enough to carry
 *                      one.
 *   ?as-of=2026-11-21  deep in the heating season, the morning after the
 *                      first job ran. The balance lands inside the band
 *                      and the pace comparison has a real previous
 *                      period behind it for the first time.
 *   ?as-of=2026-12-27  past the seeded campaign calendar. The band is a
 *                      continuation rather than a seeded period, both
 *                      jobs are behind the branch, and every one of the
 *                      held slots is past the day it could have
 *                      converted, which is the strongest single ask this
 *                      document carries upward.
 */

// ---------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** ISO strings are split, never parsed. A timezone must not move a date. */
function parts(iso: string): [number, number, number] {
  const [y, m, d] = iso.split("-").map(Number);
  return [y || 0, m || 1, d || 1];
}

function formatDate(iso: string): string {
  const [y, m, d] = parts(iso);
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

function formatLong(iso: string): string {
  const [y, m, d] = parts(iso);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const money = (n: number) => usd.format(n);
const count = (n: number) => new Intl.NumberFormat("en-US").format(n);
const hoursLabel = (n: number) => (n % 1 === 0 ? String(n) : n.toFixed(1));
const pct = (share: number) => `${Math.round(share * 100)}%`;

// ---------------------------------------------------------------
// Small pieces the document repeats
// ---------------------------------------------------------------

function Figure({
  label,
  value,
  unit,
  provenance,
  note,
}: {
  label: string;
  value: string;
  unit?: string;
  provenance?: Provenance;
  note?: string;
}) {
  return (
    <div className={styles.figure}>
      <dt className={styles.figureLabel}>{label}</dt>
      <dd className={styles.figureBody}>
        <span className={`${styles.figureValue} num`}>{value}</span>
        {unit ? <span className={styles.figureUnit}>{unit}</span> : null}
        {provenance ? <ProvenanceBadge provenance={provenance} compact /> : null}
        {note ? <span className={styles.figureNote}>{note}</span> : null}
      </dd>
    </div>
  );
}

/**
 * A track with the done figure on it and the straight line printed as a
 * mark, never as a target.
 *
 * The mark is labelled "where a straight line would put you today"
 * everywhere it appears, because a straight line through planned hours
 * is an expectation and not a goal anybody agreed to. The reading is
 * carried by the words and the numbers beside the track; the track only
 * makes the gap quick to see, and it disappears into a hairline on
 * paper.
 */
function ProRataTrack({
  label,
  done,
  mark,
  total,
}: {
  label: string;
  done: number;
  mark: number;
  total: number;
}) {
  const share = total > 0 ? Math.min(1, done / total) : 0;
  const markShare = total > 0 ? Math.min(1, mark / total) : 0;
  return (
    <div
      className={styles.track}
      role="img"
      aria-label={`${label}. ${hoursLabel(done)} done of ${hoursLabel(total)} planned. A straight line across elapsed working days would put it at ${hoursLabel(mark)}.`}
    >
      <div className={styles.trackRail}>
        <div className={styles.trackFill} style={{ width: `${share * 100}%` }} />
        <span
          className={styles.trackMark}
          style={{ left: `${markShare * 100}%` }}
          aria-hidden="true"
        />
      </div>
      <p className={styles.trackKey}>
        <span className={styles.trackKeyItem}>
          <span aria-hidden="true">▰</span> Done{" "}
          <span className="num">{hoursLabel(done)}</span>
        </span>
        <span className={styles.trackKeyItem}>
          <span aria-hidden="true">│</span> Straight line today{" "}
          <span className="num">{hoursLabel(mark)}</span>
        </span>
        <span className={styles.trackKeyItem}>
          <span aria-hidden="true">▱</span> Planned for the period{" "}
          <span className="num">{hoursLabel(total)}</span>
        </span>
      </p>
    </div>
  );
}

function WriteIn({ label }: { label: string }) {
  return (
    <p className={styles.writeIn}>
      <span className={styles.writeInLabel}>{label}</span>
      <span className={styles.rule} aria-hidden="true" />
    </p>
  );
}

function SectionTitle({ n, children }: { n: number; children: string }) {
  return (
    <h2 className={styles.sectionTitle}>
      <span className={styles.sectionNum} aria-hidden="true">
        {n}
      </span>
      {children}
    </h2>
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
    <section className={`${styles.clockBar} no-print`} aria-labelledby="rep-scenario">
      <div className={styles.clockHead}>
        <h2 className={styles.clockTitle} id="rep-scenario">
          <span aria-hidden="true" className={styles.clockGlyph}>
            ◷
          </span>
          Scenario clock
        </h2>
        <p className={styles.clockNote}>
          Moves the date this console reads as today. A report is a period
          document, so moving it changes which period this one covers. It adds
          no work and invents no figure.
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
// The page
// ---------------------------------------------------------------

/**
 * A class on the body for the life of this component, exactly as the
 * week sheet does it. The shell's chrome is not this page's to edit, and
 * a print rule that hid every application header would sit in the shared
 * stylesheet and fire on screens that want theirs printed.
 */
const PRINT_BODY_CLASS = "district-report-print";

export function DistrictPage() {
  const asOf = useAsOf();
  const { book, activity, replies } = useBook();
  const pipeline = usePipeline();
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    document.body.classList.add(PRINT_BODY_CLASS);
    return () => document.body.classList.remove(PRINT_BODY_CLASS);
  }, []);

  const period = useMemo(() => reportPeriodFor(asOf), [asOf]);
  const previous = useMemo(() => previousPeriodOf(period), [period]);
  const elapsed = useMemo(() => elapsedIn(period, asOf), [period, asOf]);

  const act = useMemo(
    () => activityReading(activity, period, asOf, elapsed),
    [activity, period, asOf, elapsed],
  );
  const rev = useMemo(
    () => revenueReading(book, period, asOf, elapsed),
    [book, period, asOf, elapsed],
  );
  const board = useMemo(
    () => boardReading(pipeline.statuses, period, asOf),
    [pipeline.statuses, period, asOf],
  );
  const holds = useMemo(
    () => heldDates(pipeline.statuses, book, asOf),
    [pipeline.statuses, book, asOf],
  );
  const lost = useMemo(
    () => losses(pipeline.statuses, replies),
    [pipeline.statuses, replies],
  );
  const enquiries = useMemo(() => openEnquiries(SEED_REQUESTS, asOf), [asOf]);
  const inherited = useMemo(() => commitments(period, asOf), [period, asOf]);
  const asks = useMemo(
    () =>
      exceptions({
        book,
        statuses: pipeline.statuses,
        requests: SEED_REQUESTS,
        period,
        asOf,
      }),
    [book, pipeline.statuses, period, asOf],
  );

  const ratio = useMemo(
    () => hoursPerThousandBooked(activity, book),
    [activity, book],
  );

  /* The leads that need somebody to do something. The ones answered
     inside the commitment are a count at the foot rather than nine rows
     of good news, because a page a director reads on a phone spends its
     space on what is unresolved. */
  const needing = enquiries.filter((e) => e.commitment !== "met");
  const metCount = enquiries.length - needing.length;
  const arrivedInPeriod = enquiries.filter(
    (e) => e.receivedOn >= period.startDate && e.receivedOn <= period.endDate,
  ).length;

  return (
    <div className={styles.page}>
      {/*
        THE BREADCRUMB BAND IS CHROME AND IS WRAPPED SO IT SAYS SO.

        The shared print stylesheet hides the nav landmark inside the
        band, which leaves the band itself: an empty tinted strip with a
        rule under it, at the top of the first side of a document that is
        supposed to be black on white. The wrapper uses the shared
        no-print class rather than a selector reaching into another
        agent's CSS module, which is the mechanism this codebase already
        has for exactly this.
      */}
      <div className="no-print">
        <PageHeader />
      </div>
      <div className={styles.inner}>
        {/* ------------------------------------------------------
            Screen only. Everything from the sheet down is the document.
            ------------------------------------------------------ */}
        <div className={`${styles.controls} no-print`}>
          <div className={styles.controlsText}>
            <p className={styles.eyebrow}>Goes up the line</p>
            <h1 className={styles.h1}>The West Division weekly</h1>
            <p className={styles.lede}>
              One period on one page, addressed to the Director of Marketing for
              the West Division, with the two ledgers kept apart, every held
              slot carrying its release date, and every exception carrying the
              decision wanted and the date it is wanted by. The weekly work is
              on <Link to="/calendar">the week sheet</Link>; this is the
              period.
            </p>
          </div>
          <div className={styles.controlsActions}>
            <Button
              variant="primary"
              glyph="▤"
              onClick={() => window.print()}
              aria-label="Print this West Division weekly"
            >
              Print this report
            </Button>
            <p className={styles.printNote}>
              Black on white, no filled panels, letter paper.
            </p>
          </div>
        </div>

        <ScenarioClock asOf={asOf} announce={setAnnouncement} />

        {/* ------------------------------------------------------
            THE DOCUMENT.
            ------------------------------------------------------ */}
        <article className={styles.sheet}>
          <div className={`${styles.masthead} avoid-break`}>
            <div className={styles.mastheadTop}>
              <p className={styles.sheetEyebrow}>
                Local marketing console, West Division weekly
              </p>
              <p className={styles.sheetVenue}>
                {VENUE.name}, {VENUE.address}, {VENUE.city} {VENUE.state}{" "}
                {VENUE.postalCode}. Published line{" "}
                <span className="num">{VENUE.phone}</span>, which is the one
                number the brand publishes across all three offices.
              </p>
            </div>

            <h2 className={styles.sheetTitle}>{period.label}</h2>
            <p className={styles.sheetRange}>
              <span className="num">
                {formatLong(period.startDate)} to {formatLong(period.endDate)}
              </span>
              , read on <span className="num">{formatLong(asOf)}</span>
            </p>

            <dl className={styles.addressee}>
              <div className={styles.addresseeItem}>
                <dt>For</dt>
                <dd>Director of Marketing, West Division</dd>
              </div>
              <div className={styles.addresseeItem}>
                <dt>From</dt>
                <dd>{seatLabel(ACTING_SEAT_ID)}</dd>
              </div>
              <div className={styles.addresseeItem}>
                <dt>Brand covered</dt>
                <dd>One assigned brand, Brea territory</dd>
              </div>
            </dl>

            <dl className={styles.headline}>
              <Figure
                label="Weeks of calendar left"
                value={
                  period.weeksToOpen > 0
                    ? String(period.weeksToOpen)
                    : "Continued"
                }
                provenance="illustrative"
                note={
                  period.weeksToOpen > 0
                    ? "Weeks to the end of the seeded campaign calendar."
                    : `Past the seeded calendar, which ends on ${formatDate(MODELLED_OPENING)}.`
                }
              />
              <Figure
                label="Working days gone"
                value={`${elapsed.elapsed} of ${elapsed.workingDays}`}
                provenance="modeled"
                note="Weekends excluded, on the same rule the daily targets use."
              />
              <Figure
                label="Jobs sold, on the book"
                value={count(rev.bookContracts)}
                provenance="illustrative"
                note={`${count(rev.bookGuests)} properties across all of them.`}
              />
              <Figure
                label="Slots held, nothing agreed"
                value={count(holds.length)}
                provenance="illustrative"
                note="Each one blocks a crew and is worth nothing until it converts."
              />
            </dl>

            <p className={styles.mastheadNote}>
              <span aria-hidden="true">▲</span>
              <span>
                {period.basis} The campaign bands are this console&apos;s own
                and nothing about them is published: the brands publish offers
                and expiry dates, not a marketing calendar. Nothing on this page
                is a claim about how Champions Group runs its West Division, and
                no figure here has been put in the company&apos;s mouth.
              </span>
            </p>
          </div>

          {/* --- 1. The two ledgers ------------------------------ */}
          <section className={styles.section}>
            <SectionTitle n={1}>
              The two ledgers, side by side and never added together
            </SectionTitle>
            <p className={styles.sectionNote}>
              Sold work carries money. Outbound activity carries hours and has
              no revenue field at all. They live in separate arrays for this
              exact reason: a weekly report is exactly where hours quietly get
              dressed up as results. The only place they touch is the ratio at
              the foot.
            </p>

            <div className={styles.ledgers}>
              <div className={`${styles.ledger} avoid-break`}>
                <h3 className={styles.ledgerTitle}>
                  <span aria-hidden="true">◆</span> Sold work
                </h3>
                <dl className={styles.ledgerFigures}>
                  <Figure
                    label="Collected in this period"
                    value={money(rev.collected)}
                    provenance="modeled"
                    note={`${count(rev.contracts)} ${rev.contracts === 1 ? "job" : "jobs"} put money in inside the band. Deposits are treated as collected on the day the book was read and balances on the day the work runs, and both assumptions are printed rather than left implied.`}
                  />
                  <Figure
                    label="Value of work sold"
                    value={money(rev.bookValue)}
                    provenance="illustrative"
                    note="The standing book rather than a period figure: every job sold so far, whether or not it collected anything inside this band."
                  />
                  <Figure
                    label="Deposits taken"
                    value={money(rev.bookDeposits)}
                    provenance="illustrative"
                  />
                  <Figure
                    label="Resting on a price a person typed"
                    value={
                      rev.typedShare === null
                        ? "None"
                        : `${money(rev.typedValue)}, ${pct(rev.typedShare)}`
                    }
                    provenance="user_input"
                    note="The brand publishes two coupon prices and no rate card, so this share of the total came off this desk rather than off a published price."
                  />
                </dl>
              </div>

              <div className={`${styles.ledger} avoid-break`}>
                <h3 className={styles.ledgerTitle}>
                  <span aria-hidden="true">▣</span> Outbound activity
                </h3>
                <dl className={styles.ledgerFigures}>
                  <Figure
                    label="Shifts planned"
                    value={count(act.shifts)}
                    provenance="illustrative"
                    note={`${count(act.completedShifts)} ticked off so far.`}
                  />
                  <Figure
                    label="Hours planned"
                    value={hoursLabel(act.hours)}
                    unit={act.hours === 1 ? "hour" : "hours"}
                    provenance="illustrative"
                  />
                  <Figure
                    label="Hours out in the territory"
                    value={hoursLabel(act.outsideHours)}
                    unit={act.outsideHours === 1 ? "hour" : "hours"}
                    provenance="illustrative"
                    note="Property visits, go sees and trade events. A call block from the desk is work and is not field time."
                  />
                  <Figure
                    label="Field hours completed"
                    value={hoursLabel(act.outsideDone)}
                    unit={act.outsideDone === 1 ? "hour" : "hours"}
                    provenance="observed"
                  />
                </dl>
              </div>
            </div>

            <p className={styles.ledgerFoot}>
              <span className={styles.ledgerFootLabel}>The one ratio</span>
              {ratio === null ? (
                <>
                  Nothing is booked, so hours per thousand dollars booked cannot
                  be computed and is not estimated.
                </>
              ) : (
                <>
                  <span className="num">{ratio.toFixed(1)}</span> hours in the
                  territory per thousand dollars of work sold, across the whole
                  plan rather than this period alone. It starts terrible in
                  every new territory, because the first accounts cost the most
                  work, and it is the only honest way to make activity legible
                  without letting it wear revenue&apos;s clothes.
                </>
              )}
            </p>
          </section>

          {/* --- 2. Where the period stands ---------------------- */}
          <section className={styles.section}>
            <SectionTitle n={2}>Where the period stands, part way through</SectionTitle>
            <p className={styles.sectionNote}>
              The leading ledger is pro rata across elapsed working days,
              because field hours are meant to be uniform across them. The
              lagging ledger is paced against the previous period, because sold
              work is not uniform and never will be: this trade runs 266 per
              cent above baseline on AC repair in July and nothing like it in
              February. No sold-work figure on this page is pro rata, and no
              finish is projected anywhere on it.
            </p>

            <div className={`${styles.pace} avoid-break`}>
              <h3 className={styles.paceTitle}>
                Leading: hours out in the territory
              </h3>
              <ProRataTrack
                label="Hours out in the territory"
                done={act.outsideDone}
                mark={act.straightLine}
                total={act.outsideHours}
              />
              <p className={styles.paceLine}>
                <span className={styles.paceLabel}>The mark is not a target</span>
                It is where a straight line across{" "}
                <span className="num">{elapsed.elapsed}</span> of{" "}
                <span className="num">{elapsed.workingDays}</span> working days
                would put the hours today. Missing it on a Tuesday is
                information, not a failure.
              </p>
              <p className={styles.paceLine}>
                <span className={styles.paceLabel}>Required run rate</span>
                {act.runRate === null ? (
                  <>
                    {act.runRateNote}{" "}
                  </>
                ) : (
                  <>
                    <span className="num">{hoursLabel(act.runRate)}</span> hours
                    in the territory a working day for the remaining{" "}
                    <span className="num">{elapsed.remaining}</span>{" "}
                    {elapsed.remaining === 1 ? "day" : "days"} clears the{" "}
                    <span className="num">{hoursLabel(act.outstanding)}</span>{" "}
                    still on the plan. That is a fact about what is left. A
                    projected finish would be a prediction wearing the clothes
                    of a fact, so this page does not carry one.
                  </>
                )}
                <ProvenanceBadge provenance="modeled" compact />
              </p>
              <p className={styles.paceFoot}>
                Nothing is rated until the later of{" "}
                <span className="num">{RATE_GUARD.minWorkingDays}</span> elapsed
                working days or a quarter of the band, which is{" "}
                <span className="num">{elapsed.needed}</span> days here. A tool
                that says too early to say on the second of the month earns more
                trust than any figure it could have shown instead.
              </p>
            </div>

            <div className={`${styles.pace} avoid-break`}>
              <h3 className={styles.paceTitle}>
                Lagging: money collected, paced rather than pro rata
              </h3>
              <dl className={styles.paceFigures}>
                <Figure
                  label="Collected this period"
                  value={money(rev.collected)}
                  provenance="modeled"
                />
                {rev.pace ? (
                  <Figure
                    label={`Previous period at the same working day`}
                    value={money(rev.pace.previousToSamePoint)}
                    provenance="modeled"
                    note={`${rev.pace.previousLabel}, measured to ${formatDate(rev.pace.comparableOn)}, which is its own ${elapsed.elapsed}th working day. The whole of it collected ${money(rev.pace.previousWhole)}.`}
                  />
                ) : null}
                {rev.pace && rev.pace.previousToSamePoint > 0 ? (
                  <Figure
                    label="Against the same point last period"
                    value={`${rev.pace.delta >= 0 ? "Ahead by " : "Behind by "}${money(Math.abs(rev.pace.delta))}`}
                    provenance="modeled"
                    note={`${pct(Math.abs(rev.pace.delta) / rev.pace.previousToSamePoint)} ${rev.pace.delta >= 0 ? "ahead of" : "behind"} the same point of the previous band. A pace figure and never a projection.`}
                  />
                ) : null}
              </dl>
              {rev.paceNote ? (
                <p className={styles.paceFoot}>
                  <span aria-hidden="true">◇</span> {rev.paceNote}
                </p>
              ) : null}
              {!previous ? null : (
                <p className={styles.paceFoot}>
                  There is no same period last year anywhere in this model and
                  there cannot be, because this console holds no prior year for
                  the territory. Seasonal demand comparisons in this trade are
                  defined against a prior year nobody outside the company can
                  see, so the comparison is drawn against the previous band and
                  labelled as that. It is the weaker reading and it is the only
                  honest one available here.
                </p>
              )}
            </div>
          </section>

          {/* --- 3. The board ------------------------------------ */}
          <section className={`${styles.section} avoid-break`}>
            <SectionTitle n={3}>The board on the day this was read</SectionTitle>
            <p className={styles.sectionNote}>
              One row per organisation against the offer this desk would lead
              with. <span className="num">{count(board.touchedInPeriod)}</span>{" "}
              of the <span className="num">{count(board.rows)}</span> rows carry
              a touch dated inside this period. Every status is a glyph and a
              word before it is a colour.
            </p>
            <ul className={styles.statusList}>
              {PITCH_STATUS_ORDER.map((status: PitchStatus) => {
                const token = PITCH_STATUS[status];
                const n = board.counts[status];
                const share = board.rows > 0 ? n / board.rows : 0;
                return (
                  <li key={status} className={styles.statusRow}>
                    <span className={styles.statusName}>
                      <span aria-hidden="true" className={styles.statusGlyph}>
                        {token.glyph}
                      </span>
                      {token.label}
                    </span>
                    <span className={styles.statusBar} aria-hidden="true">
                      <span
                        className={styles.statusFill}
                        style={{ width: `${share * 100}%` }}
                      />
                    </span>
                    <span className={`${styles.statusCount} num`}>
                      {count(n)}
                    </span>
                    <span className={`${styles.statusShare} num`}>
                      {pct(share)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* --- 4. Held dates ----------------------------------- */}
          <section className={styles.section}>
            <SectionTitle n={4}>
              Slots held with nothing agreed, each with its release date
            </SectionTitle>
            <p className={styles.sectionNote}>
              A hold is crew capacity taken off the board by our own side. It is
              invisible in every revenue total and it blocks the day regardless.
              The release date subtracts the{" "}
              <span className="num">{STANDARD_TERMS.bookingNoticeDays}</span>{" "}
              day scheduling notice this console assumes: after it, the hold can
              no longer become a crew visit on the day it is holding. No brand
              in the group publishes a scheduling notice, so that figure is an
              assumption and every release date below is modeled.
            </p>
            {holds.length === 0 ? (
              <p className={styles.empty}>
                <span aria-hidden="true">○</span> No slot is held against
                nothing. That is a clean reading rather than an empty one.
              </p>
            ) : (
              <ul className={styles.rows}>
                {holds.map((h) => (
                  <li
                    key={`${h.prospectId}-${h.packageId}`}
                    className={`${styles.row} avoid-break`}
                  >
                    <div className={styles.rowHead}>
                      <span className={styles.rowName}>{h.name}</span>
                      <LaneChip
                        lane={PROSPECT_BY_ID[h.prospectId]?.lane ?? "multi-service"}
                        size="sm"
                      />
                      <span
                        className={styles.rowState}
                        data-past={h.pastRelease ? "yes" : "no"}
                      >
                        <span aria-hidden="true">
                          {h.pastRelease ? "▲" : "◷"}
                        </span>
                        {h.pastRelease
                          ? "Past its release date"
                          : `Releases in ${count(h.daysToRelease)} ${h.daysToRelease === 1 ? "day" : "days"}`}
                      </span>
                    </div>
                    <dl className={styles.rowFacts}>
                      <div className={styles.rowFact}>
                        <dt>Day held</dt>
                        <dd className="num">{formatDate(h.targetDate)}</dd>
                      </div>
                      <div className={styles.rowFact}>
                        <dt>Releases on</dt>
                        <dd className="num">{formatDate(h.releaseOn)}</dd>
                      </div>
                      <div className={styles.rowFact}>
                        <dt>Properties discussed</dt>
                        <dd>
                          {h.guests === null ? (
                            "No property count discussed"
                          ) : (
                            <>
                              <span className="num">{count(h.guests)}</span>
                              <ProvenanceBadge provenance="illustrative" compact />
                            </>
                          )}
                        </dd>
                      </div>
                      <div className={styles.rowFact}>
                        <dt>Crew slots it would take</dt>
                        <dd>
                          {h.lanes === null ? (
                            "Not computable without a property count"
                          ) : (
                            <>
                              <span className="num">{count(h.lanes)}</span> of{" "}
                              <span className="num">
                                {VENUE.crewSlotsModelledFloor}
                              </span>
                              , <span className="num">{pct(h.shareOfFloor ?? 0)}</span>
                              <ProvenanceBadge provenance="modeled" compact />
                            </>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* --- 5. Losses --------------------------------------- */}
          <section className={styles.section}>
            <SectionTitle n={5}>Losses, in the buyer&apos;s own words</SectionTitle>
            <p className={styles.sectionNote}>
              Recorded rather than hidden. A service line full of quiet losses
              is a finding, and the reason outlives the lead.{" "}
              <span className="num">{count(lost.length)}</span> closed decisions
              went against us so far, which is far too few to compute a rate
              from, and no rate is computed.
            </p>
            {lost.length === 0 ? (
              <p className={styles.empty}>
                <span aria-hidden="true">○</span> Nothing has been lost yet.
              </p>
            ) : (
              <ul className={styles.rows}>
                {lost.map((l) => (
                  <li key={l.prospectId} className={`${styles.row} avoid-break`}>
                    <div className={styles.rowHead}>
                      <span className={styles.rowName}>{l.name}</span>
                      {l.lane ? (
                        <span className={styles.rowLane}>
                          {LANE_META[PROSPECT_BY_ID[l.prospectId]?.lane ?? "multi-service"].label}
                        </span>
                      ) : null}
                      <span className={styles.rowState} data-past="no">
                        <span aria-hidden="true">✕</span>
                        {l.bookedElsewhere
                          ? "They had already committed elsewhere"
                          : "A plain no, with a reason that will not change"}
                      </span>
                    </div>
                    {l.words ? (
                      <blockquote className={styles.quote}>
                        <span className={styles.quoteLabel}>
                          {l.wordsAreSummary
                            ? "Written up after the call"
                            : "What they said"}
                          , {l.saidOn ? formatDate(l.saidOn) : "undated"}
                        </span>
                        <p>{l.words}</p>
                      </blockquote>
                    ) : null}
                    <dl className={styles.rowFacts}>
                      <div className={styles.rowFact}>
                        <dt>On the objection register</dt>
                        <dd>
                          {l.objectionId && OBJECTION_BY_ID[l.objectionId]
                            ? OBJECTION_BY_ID[l.objectionId].short
                            : "Not tied to a registered objection"}
                        </dd>
                      </div>
                      <div className={styles.rowFact}>
                        <dt>Named a competitor</dt>
                        <dd>
                          {l.bookedElsewhere
                            ? "They named a prior commitment rather than a rival by name"
                            : "No competitor named"}
                        </dd>
                      </div>
                      <div className={styles.rowFact}>
                        <dt>Diarised next step</dt>
                        <dd>
                          {l.nextStepDue ? (
                            <>
                              <span className="num">
                                {formatDate(l.nextStepDue)}
                              </span>
                              {l.nextStep ? (
                                <span className={styles.rowSub}>{l.nextStep}</span>
                              ) : null}
                            </>
                          ) : (
                            "None. Closed for this occasion."
                          )}
                        </dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* --- 6. Inbound leads --------------------------------- */}
          <section className={styles.section}>
            <SectionTitle n={6}>
              Inbound leads still open, against the response commitment
            </SectionTitle>
            <p className={styles.sectionNote}>
              <span className="num">{count(enquiries.length)}</span> leads are
              open, <span className="num">{count(arrivedInPeriod)}</span> of
              them arrived inside this period, and{" "}
              <span className="num">{count(metCount)}</span> were answered inside
              the {RESPONSE_COMMITMENT.label.toLowerCase()} commitment and are
              not listed below. {RESPONSE_COMMITMENT.disclosure}
            </p>
            {needing.length === 0 ? (
              <p className={styles.empty}>
                <span aria-hidden="true">○</span> Every open lead was answered
                inside the commitment.
              </p>
            ) : (
              <ul className={styles.rows}>
                {needing.map((e) => (
                  <li key={e.id} className={`${styles.row} avoid-break`}>
                    <div className={styles.rowHead}>
                      <span className={styles.rowName}>{e.organisation}</span>
                      <LaneChip lane={e.lane} size="sm" />
                      <span
                        className={styles.rowState}
                        data-past={e.commitment === "missed" ? "yes" : "no"}
                      >
                        <span aria-hidden="true">
                          {e.commitment === "missed" ? "▲" : "○"}
                        </span>
                        {e.commitment === "missed"
                          ? `Answered in ${hoursLabel(e.workingHours ?? 0)} working hours, outside the commitment`
                          : "Not answered yet"}
                      </span>
                    </div>
                    <dl className={styles.rowFacts}>
                      <div className={styles.rowFact}>
                        <dt>Arrived</dt>
                        <dd className="num">{formatDate(e.receivedOn)}</dd>
                      </div>
                      <div className={styles.rowFact}>
                        <dt>Reply due</dt>
                        <dd className="num">{formatDate(e.dueOn)}</dd>
                      </div>
                      <div className={styles.rowFact}>
                        <dt>What they asked for</dt>
                        <dd>{e.ask}</dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* --- 7. Commitments ---------------------------------- */}
          <section className={styles.section}>
            <SectionTitle n={7}>Commitments the division inherits</SectionTitle>
            <p className={styles.sectionNote}>
              Obligations made at branch level that outlive whoever made them,
              read out of the threads rather than typed anywhere.{" "}
              <span className="num">{count(inherited.total)}</span> offers have
              been quoted to somebody so far. Two of the five brands publish an
              expiry date and three do not, which is the difference between a
              campaign that needs a successor and one that never ends.
              {inherited.unmatched.length > 0
                ? ` ${inherited.unmatched.length} of them could not be matched to an offer in the catalogue and are named here rather than dropped: ${inherited.unmatched.join(", ")}.`
                : null}
            </p>
            {inherited.rows.length === 0 ? (
              <p className={styles.empty}>
                <span aria-hidden="true">○</span> Nothing has been offered yet on
                or before this date.
              </p>
            ) : (
              <ul className={styles.rows}>
                {inherited.rows.map((c) => (
                  <li key={c.offerId} className={`${styles.row} avoid-break`}>
                    <div className={styles.rowHead}>
                      <span className={styles.rowName}>{c.offerName}</span>
                      <ProvenanceBadge provenance={c.provenance} compact />
                      <span className={styles.rowState} data-past="no">
                        <span aria-hidden="true">◈</span>
                        <span className="num">{c.extendedTo.length}</span>{" "}
                        {c.extendedTo.length === 1
                          ? "organisation"
                          : "organisations"}
                        , <span className="num">{c.newInPeriod}</span> agreed in
                        this period
                      </span>
                    </div>
                    <p className={styles.rowNote}>{c.what}</p>
                    <dl className={styles.rowFacts}>
                      <div className={styles.rowFact}>
                        <dt>What it costs the brand</dt>
                        <dd>{c.costNote}</dd>
                      </div>
                      <div className={styles.rowFact}>
                        <dt>Quoted to</dt>
                        <dd>
                          {c.extendedTo
                            .map((e) => `${e.name} (${formatDate(e.on)})`)
                            .join(", ")}
                        </dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* --- 8. The exceptions, which are the ask ------------ */}
          <section className={styles.section}>
            <SectionTitle n={8}>Exceptions, and the decision wanted</SectionTitle>
            <p className={styles.sectionNote}>
              The reason this page is sent rather than filed. Each row names what
              is true, the decision being asked for, and the date the answer is
              wanted by, and each of those dates comes off the row itself rather
              than out of the air.
            </p>
            {asks.length === 0 ? (
              <p className={styles.empty}>
                <span aria-hidden="true">○</span> Nothing needs a decision above
                the branch this period. That is a real reading and it is rarer
                than it sounds.
              </p>
            ) : (
              <ol className={styles.asks}>
                {asks.map((a) => (
                  <li key={a.id} className={`${styles.ask} avoid-break`}>
                    <div className={styles.askHead}>
                      <h3 className={styles.askTitle}>{a.title}</h3>
                      <ProvenanceBadge provenance={a.provenance} compact />
                    </div>
                    <p className={styles.askWhat}>{a.what}</p>
                    <p className={styles.askDecision}>
                      <span className={styles.askLabel}>Decision wanted</span>
                      {a.decision}
                    </p>
                    <p className={styles.askBy}>
                      <span className={styles.askLabel}>Wanted by</span>
                      <span className="num">{formatDate(a.wantedBy)}</span>.{" "}
                      {a.wantedByBecause}
                    </p>
                    <WriteIn label="Decision, and who made it" />
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* --- The pen part ------------------------------------ */}
          <section className={`${styles.section} avoid-break`}>
            <SectionTitle n={9}>Filled in on the call, not afterwards</SectionTitle>
            <div className={styles.debrief}>
              <WriteIn label="What changed that the division did not already know" />
              <WriteIn label="What the division is taking away to decide" />
              <WriteIn label="Returned by, role and title, and the date" />
            </div>
          </section>

          <p className="print-only print-disclaimer">
            An independent work sample by Nathan J. Song, built for a Champions
            Group Holdings Marketing Manager, West Division application. Not
            affiliated with, endorsed by or connected to Champions Group
            Holdings or any of its brands. Addresses, offer prices and expiry
            dates were read from published sources on 18 August 2026. Campaign
            bands, crew capacity, holds and every figure badged illustrative or
            modeled are this console&apos;s own and are labelled as such. No
            Champions marketing budget figure is published anywhere and none is
            invented here. Demo build, no message ever leaves the browser.
          </p>
        </article>

        <div className={`${styles.method} no-print`}>
          <h2 className={styles.methodTitle}>Where each figure comes from</h2>
          <ul className={styles.methodList}>
            <li>
              The two ledgers are the same two arrays the{" "}
              <Link to="/calendar">Book</Link> reads, filtered to this period and
              never summed.
            </li>
            <li>
              Collection dates come from the same schedule{" "}
              <Link to="/team">Pay</Link> pays commission on: a deposit on the day
              the book was read, a balance on the day the work runs.
            </li>
            <li>
              Working days exclude weekends, on the rule the daily rings on{" "}
              <Link to="/today">Today</Link> already use.
            </li>
            <li>
              Release dates subtract the assumed{" "}
              {STANDARD_TERMS.bookingNoticeDays} day scheduling notice from the
              held day. Crew slots are one per twenty properties against a
              modelled working day of {VENUE.crewSlotsModelledFloor} slots,
              which is what <Link to="/calendar">Capacity</Link> computes
              against. Neither figure is published by anybody and both are
              badged modeled.
            </li>
            <li>
              The seats are on <Link to="/team">the team page</Link>, the
              objections behind the losses are on{" "}
              <Link to="/objections">Objections</Link>, and every formula in the
              console is on <Link to="/method">Method</Link>.
            </li>
          </ul>
        </div>
      </div>

      {/* The one live region. Polite, mounted from the first render, and
          silent until a reader moves the clock. */}
      <p className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
