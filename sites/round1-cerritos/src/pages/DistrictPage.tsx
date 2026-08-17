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
 * THE DISTRICT REPORT. The document that goes up the line.
 *
 * The posting's last daily responsibility is "Partner closely with your
 * District Sales/Regional Sales Managers", and until this page existed
 * the application had no upward surface at all. It also had no month:
 * daily was the rings and weekly was the week sheet, and the third word
 * in "daily, weekly, and monthly" had nowhere to live.
 *
 * ── IT IS PRINTABLE, AND THAT IS THE REQUIREMENT RATHER THAN A NICETY ──
 * A District Sales Manager reads this between two venues, often at the
 * same time as four other venues' versions of it. A dashboard they have
 * to log into and configure is a worse artefact than a page they can
 * print, hold and write on, so everything below the control strip is
 * laid out for paper first. The week sheet already proved this codebase
 * can produce a real printable; this is the same discipline pointed at a
 * different reader.
 *
 * ── THE FIVE FIELDS, AND THE ONE THAT MATTERS MOST ────────────────
 * The two ledgers, the board, the held dates with their release dates,
 * the losses with their reasons, and the exceptions the venue wants a
 * decision on. That last one is the difference between partnering with a
 * District Sales Manager and reporting to one: a weekly page with no ask
 * in it is a status update, and a manager receiving five status updates
 * a week reads none of them. Every exception on this page names the
 * decision wanted and the date it is wanted by, and every one of those
 * dates comes off the row itself.
 *
 * ── WHAT THIS PAGE REFUSES TO DO ──────────────────────────────────
 * It never adds the two ledgers together. It never pro rata a contract
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
 * set, and a tool that threw a party inside a document addressed to a
 * manager would be the first thing a professional switched off. The only
 * live region is the polite one at the foot, and it speaks when a reader
 * moves the clock and at no other time.
 *
 * ── WHICH SCENARIO DATES EXERCISE WHICH READING ───────────────────
 *   ?as-of=2026-09-23  default. Twelve to nine weeks out, day eight of
 *                      twenty working days. Both deposits collected, the
 *                      previous band collected nothing, the outside hours
 *                      are behind the straight line and the run rate is
 *                      printed because the band is old enough to carry
 *                      one.
 *   ?as-of=2026-11-21  four weeks out, the morning after the first
 *                      delivered event. The balance lands inside the band
 *                      and the pace comparison has a real previous period
 *                      behind it for the first time.
 *   ?as-of=2026-12-27  past the seeded calendar. The band is a
 *                      continuation rather than a seeded period, both
 *                      contracts are behind the desk, and every one of
 *                      the five held dates is past the day it could have
 *                      converted, which is the strongest single ask this
 *                      document has ever carried upward.
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
          Moves the date this application reads as today. A report is a period
          document, so moving it changes which period this one covers. It adds
          no contract and invents no figure.
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

  /* The enquiries that need somebody to do something. The ones answered
     inside the commitment are a count at the foot rather than nine rows
     of good news, because a page a manager reads on a phone spends its
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
            <h1 className={styles.h1}>The district report</h1>
            <p className={styles.lede}>
              One period on one page, addressed to the District Sales Manager,
              with the two ledgers kept apart, every held date carrying its
              release date, and every exception carrying the decision wanted and
              the date it is wanted by. The weekly work is on{" "}
              <Link to="/book/week">the week sheet</Link>; this is the month.
            </p>
          </div>
          <div className={styles.controlsActions}>
            <Button
              variant="primary"
              glyph="▤"
              onClick={() => window.print()}
              aria-label="Print this district report"
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
                R1, district report
              </p>
              <p className={styles.sheetVenue}>
                {VENUE.name}, {VENUE.address}, {VENUE.city} {VENUE.state}{" "}
                {VENUE.postalCode}. Venue line{" "}
                <span className="num">{VENUE.phone}</span>.
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
                <dd>District Sales Manager</dd>
              </div>
              <div className={styles.addresseeItem}>
                <dt>From</dt>
                <dd>{seatLabel(ACTING_SEAT_ID)}</dd>
              </div>
              <div className={styles.addresseeItem}>
                <dt>Reports to</dt>
                <dd>General Manager, on site</dd>
              </div>
            </dl>

            <dl className={styles.headline}>
              <Figure
                label="Working days gone"
                value={`${elapsed.elapsed} of ${elapsed.workingDays}`}
                provenance="modeled"
                note="Weekends excluded, on the same rule the daily targets use."
              />
              <Figure
                label="Contracts on the book"
                value={count(rev.bookContracts)}
                provenance="illustrative"
                note={`${count(rev.bookGuests)} guests across all of them.`}
              />
              <Figure
                label="Dates held, nothing signed"
                value={count(holds.length)}
                provenance="illustrative"
                note="Each one blocks an evening and is worth nothing until it converts."
              />
            </dl>

            <p className={styles.mastheadNote}>
              <span aria-hidden="true">▲</span>
              <span>
                {period.basis} The period bands are this plan&apos;s own
                forward quarters rather than a calendar anybody has published,
                because Round1 publishes no trading calendar of any kind.
                Nothing on this page is a claim about how Round1 runs a
                territory.
              </span>
            </p>
          </div>

          {/* --- 1. The two ledgers ------------------------------ */}
          <section className={styles.section}>
            <SectionTitle n={1}>
              The two ledgers, side by side and never added together
            </SectionTitle>
            <p className={styles.sectionNote}>
              Booked revenue carries money. Outbound activity carries hours and
              has no revenue field at all. They live in separate arrays for this
              exact reason: a period report is where hours quietly get
              dressed up as results. The only place they touch is the ratio at
              the foot.
            </p>

            <div className={styles.ledgers}>
              <div className={`${styles.ledger} avoid-break`}>
                <h3 className={styles.ledgerTitle}>
                  <span aria-hidden="true">◆</span> Booked revenue
                </h3>
                <dl className={styles.ledgerFigures}>
                  <Figure
                    label="Collected in this period"
                    value={money(rev.collected)}
                    provenance="modeled"
                    note={`${count(rev.contracts)} ${rev.contracts === 1 ? "contract" : "contracts"} put money in inside the band. Deposits are treated as collected on the day the book was read and balances on the event date, and both assumptions are printed rather than assumed.`}
                  />
                  <Figure
                    label="Contract value on the book"
                    value={money(rev.bookValue)}
                    provenance="illustrative"
                    note="The standing book rather than a period figure: every contract signed so far, whether or not it collected anything inside this band."
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
                    note="Round1 publishes no price for any group package, so this share of the total came off this desk rather than off a rate card."
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
                    label="Hours outside the building"
                    value={hoursLabel(act.outsideHours)}
                    unit={act.outsideHours === 1 ? "hour" : "hours"}
                    provenance="illustrative"
                    note="Tabling, go sees and networking events. A call block is work and is not outside."
                  />
                  <Figure
                    label="Outside hours completed"
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
                  <span className="num">{ratio.toFixed(1)}</span> hours outside
                  the building per thousand dollars booked, across the whole plan
                  rather than this period alone. It starts terrible in every pre
                  opening book, because the first contracts cost the most work,
                  and it is the only honest way to make activity legible without
                  letting it wear revenue&apos;s clothes.
                </>
              )}
            </p>
          </section>

          {/* --- 2. Where the period stands ---------------------- */}
          <section className={styles.section}>
            <SectionTitle n={2}>Where the period stands, part way through</SectionTitle>
            <p className={styles.sectionNote}>
              The leading ledger is pro rata across elapsed working days,
              because outbound hours are meant to be uniform across them. The
              lagging ledger is paced against the previous period, because
              contract value is not uniform and never will be. No contract
              figure on this page is pro rata, and no finish is projected
              anywhere on it.
            </p>

            <div className={`${styles.pace} avoid-break`}>
              <h3 className={styles.paceTitle}>
                Leading: hours outside the building
              </h3>
              <ProRataTrack
                label="Hours outside the building"
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
                    outside the building a working day for the remaining{" "}
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
                  there cannot be, because this desk has no prior year. Every
                  pace figure in the hospitality literature is defined against a
                  prior year this territory does not have, so the comparison is
                  drawn against the previous band and labelled as that.
                </p>
              )}
            </div>
          </section>

          {/* --- 3. The board ------------------------------------ */}
          <section className={`${styles.section} avoid-break`}>
            <SectionTitle n={3}>The board on the day this was read</SectionTitle>
            <p className={styles.sectionNote}>
              One row per organisation against the package this desk would lead
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
              Dates held with nothing signed, each with its release date
            </SectionTitle>
            <p className={styles.sectionNote}>
              A hold is inventory taken off the market by our own side. It is
              invisible in every revenue total and it blocks the evening
              regardless. Round1 publishes no minimum booking notice, so the
              release date is derived from the one timing term it does
              publish, which is the{" "}
              <span className="num">{STANDARD_TERMS.changeNoticeDays}</span>{" "}
              or more days notice a booked party needs to be changed. It is
              this desk&apos;s working rule rather than a published deadline,
              and it is drawn that way.
            </p>
            {holds.length === 0 ? (
              <p className={styles.empty}>
                <span aria-hidden="true">○</span> No date is held against
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
                        lane={PROSPECT_BY_ID[h.prospectId]?.lane ?? "corporate"}
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
                        <dt>Date held</dt>
                        <dd className="num">{formatDate(h.targetDate)}</dd>
                      </div>
                      <div className={styles.rowFact}>
                        <dt>Releases on</dt>
                        <dd className="num">{formatDate(h.releaseOn)}</dd>
                      </div>
                      <div className={styles.rowFact}>
                        <dt>Guests discussed</dt>
                        <dd>
                          {h.guests === null ? (
                            "No headcount discussed"
                          ) : (
                            <>
                              <span className="num">{count(h.guests)}</span>
                              <ProvenanceBadge provenance="illustrative" compact />
                            </>
                          )}
                        </dd>
                      </div>
                      {/*
                        This cell used to read "10 of 26, 38%". The lane
                        figure survives and the two that followed it do
                        not: Round1 publishes no bowling lane count for
                        any location, so `h.shareOfFloor` is null and
                        there is no house total to sit the hold against.
                        Carrying the fork's twenty six across would have
                        printed a share of another operator's building in
                        another city beside a Round1 hold, which is
                        precisely the figure a reader would repeat and be
                        wrong about.
                      */}
                      <div className={styles.rowFact}>
                        <dt>Lanes it would take</dt>
                        <dd>
                          {h.lanes === null ? (
                            "Not computable without a headcount"
                          ) : (
                            <>
                              <span className="num">{count(h.lanes)}</span>, at
                              one lane per twenty guests
                              <ProvenanceBadge provenance="modeled" compact />
                            </>
                          )}
                        </dd>
                      </div>
                      {/* The share is a state, so it carries a word. */}
                      <div className={styles.rowFact}>
                        <dt>Share of the house</dt>
                        <dd>
                          Not published
                          <ProvenanceBadge provenance="withheld" compact />
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
              Recorded rather than hidden. A lane full of quiet losses is a
              finding, and the reason outlives the enquiry.{" "}
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
                          {LANE_META[PROSPECT_BY_ID[l.prospectId]?.lane ?? "corporate"].label}
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

          {/* --- 6. Inbound enquiries ---------------------------- */}
          <section className={styles.section}>
            <SectionTitle n={6}>
              Inbound enquiries still open, against the response commitment
            </SectionTitle>
            <p className={styles.sectionNote}>
              <span className="num">{count(enquiries.length)}</span> enquiries
              are open, <span className="num">{count(arrivedInPeriod)}</span> of
              them arrived inside this period, and{" "}
              <span className="num">{count(metCount)}</span> were answered inside
              the {RESPONSE_COMMITMENT.label.toLowerCase()} commitment and are
              not listed below. {RESPONSE_COMMITMENT.disclosure}
            </p>
            {needing.length === 0 ? (
              <p className={styles.empty}>
                <span aria-hidden="true">○</span> Every open enquiry was answered
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
            <SectionTitle n={7}>Commitments the district inherits</SectionTitle>
            <p className={styles.sectionNote}>
              Obligations made at venue level that outlive whoever made them,
              read out of the threads rather than typed anywhere.{" "}
              <span className="num">{count(inherited.total)}</span> offers have
              been put on a table so far.
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
                        <dt>What it costs the venue</dt>
                        <dd>{c.costNote}</dd>
                      </div>
                      <div className={styles.rowFact}>
                        <dt>Agreed with</dt>
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
                the building this period. That is a real reading and it is rarer
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
              <WriteIn label="What changed that the district did not already know" />
              <WriteIn label="What the district is taking away to decide" />
              <WriteIn label="Returned by, role and title, and the date" />
            </div>
          </section>

          <p className="print-only print-disclaimer">
            R1. An independent work sample by Nathan J. Song, built for a
            Round1 promotion planner application. Not affiliated with,
            endorsed by or connected to Round One Entertainment, Inc.
            Addresses, package contents and the published change notice were
            read from published sources on 17 August 2026. Period bands,
            offers, holds and
            every figure badged illustrative or modeled are this
            application&apos;s own and are labelled as such. Demo build, no
            message ever leaves the browser.
          </p>
        </article>

        <div className={`${styles.method} no-print`}>
          <h2 className={styles.methodTitle}>Where each figure comes from</h2>
          <ul className={styles.methodList}>
            <li>
              The two ledgers are the same two arrays the{" "}
              <Link to="/book">Book</Link> reads, filtered to this period and
              never summed.
            </li>
            <li>
              Collection dates come from the same schedule{" "}
              <Link to="/pay">Pay</Link> pays commission on: a deposit on the day
              the book was read, a balance on the event date.
            </li>
            <li>
              Working days exclude weekends, on the rule the daily rings on{" "}
              <Link to="/today">Today</Link> already use.
            </li>
            <li>
              Release dates are the published booking notice subtracted from
              the held date. Lanes on a hold are the headcount at one lane per
              twenty guests. There is no share of the house beside them,
              because Round1 publishes no bowling lane count for any location,
              which is the same absence <Link to="/calendar">Capacity</Link>{" "}
              runs into.
            </li>
            <li>
              The seats are on <Link to="/team">the floor</Link>, the objections
              behind the losses are on <Link to="/objections">Objections</Link>,
              and every formula in the application is on{" "}
              <Link to="/method">Method</Link>.
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
