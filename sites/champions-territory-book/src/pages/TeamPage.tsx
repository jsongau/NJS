import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Seat } from "@/domain/seats";
import {
  HOLD_GATE_STEP,
  RAMP_STATE_META,
  RAMP_WORKING_DAYS,
  SEAT_STATE_META,
  signedOffOn,
} from "@/domain/seats";
import { floorReading } from "@/domain/selectors/seats";
import { SEATS } from "@/data/seats";
import { PROSPECTS } from "@/data/prospects";
import { LANE_META } from "@/domain/lanes";
import { LEDGER, PITCH_STATUS } from "@/domain/vocabulary";
import { formatDate } from "@/domain/licensing";
import { windowOpensWithin } from "@/domain/selectors/desk";
import { touchesFor, usePipeline } from "@/state/PipelineProvider";
import { useBook } from "@/state/BookProvider";
import { useAsOf } from "@/state/ScenarioProvider";
import { useOpenRecord } from "@/state/RecordProvider";
import { PageHeader } from "@/components/chrome/PageHeader";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { LaneChip } from "@/components/primitives/LaneChip";
import { SectionHead } from "@/components/licensing/Panels";
import { ClearedBoard } from "@/components/play/ClearedBoard";
import { WorkingSetLead } from "@/components/queue/WorkingSetLead";
import styles from "./TeamPage.module.css";

/**
 * THE FIELD CREW. THREE SEATS, TWO OF THEM EMPTY, AND WHAT THAT COSTS.
 *
 * ── WHY A MARKETING CONSOLE HAS A CAPACITY SCREEN AT ALL ──────────
 * Because the posting puts it in the first sentence. "Lead and execute
 * local marketing initiatives focused on demand generation, campaign
 * execution, OPERATIONAL ALIGNMENT, and brand growth", and the budget
 * bullet says the plan exists to "drive incremental phone calls and web
 * leads".
 *
 * Those two sentences only work together if somebody can run the calls.
 * A lead that arrives in a week the crew is already fully booked is a
 * lead that gets a callback tomorrow, and tomorrow is the day the
 * household calls the next brand in the local pack. Marketing that is
 * not aligned to capacity is marketing that funds the competition. That
 * is the entire argument of this screen, and it is why a spend decision
 * and a crew reading belong on the same site.
 *
 * ── WHAT A MANAGER SEES FIRST, AND WHY ────────────────────────────
 * Not a strip of percentages. The first block on the screen is what to
 * do on Monday: an open seat with a count of organisations whose season
 * is open and untouched, a service line with no hour planned into it, a
 * permission withheld because a ramp step is unsigned. Every one of them
 * names a seat, carries a figure derived from the same tables the desk
 * ranks on, and links to the screen it is done from. A percentage tells
 * a manager how the week is going. These tell them what to do about it,
 * which is the only thing a Monday has room for.
 *
 * ── A SEAT, NOT A PERSON ──────────────────────────────────────────
 * There is no name anywhere on this screen and there never will be. A
 * seat is an id, a published job title, an ordinal, filled or open, a
 * start date, its service lines and its ramp signoffs. Everything else,
 * the slice of the board, the coverage, the hours, the ramp day, is
 * derived at render. Two of the three seats are open, which is what a
 * division looks like when it is hiring, and a screen that showed three
 * staffed desks would be the one piece of fiction on a site that has
 * never invented a person. See `domain/seats.ts` for the argument in
 * full.
 *
 * ── THE ONE PERMISSION, AND IT IS WIRED ───────────────────────────
 * A seat not signed off on ramp step five cannot set a status to date
 * held. That gate is stated on /coaching in prose and it is enforced in
 * `PipelineProvider`, at the one place the status table is written. It
 * refuses nothing today, because the one filled seat was signed off on
 * 20 August 2026 and covers the whole board, and this screen prints who
 * holds the permission, who does not, and on what date it was granted.
 * The gate exists because holding a date commits crew time, and crew
 * time is the thing every campaign on this site is spending.
 *
 * ── THE CLOCK ─────────────────────────────────────────────────────
 * Every dated figure here takes `useAsOf()` as an argument. The accounts
 * board owns the visible control; this screen only reads the value. What
 * the dates show:
 *
 *   ?as-of=2026-08-14  before seat 1 starts. The ramp is a plan, and
 *                      nobody is signed off on anything.
 *   ?as-of=2026-08-17  ramp day 1. Steps 3 to 7 outstanding, step 5
 *                      unsigned, so the permission leads the Monday list.
 *   ?as-of=2026-08-20  step 5 signs off. The permission is granted and
 *                      the ramp is still under way.
 *   ?as-of=2026-08-27  the last step signs off. The set empties, and the
 *                      ramp closes as a real closure.
 *   ?as-of=2026-09-23  default. The ramp closed four weeks ago, so it is
 *                      drawn closed and announces nothing.
 *   ?as-of=2026-12-01  the season month moves to December, and every
 *                      coverage figure moves with it.
 *
 * THE CLOCK MOVES DATES AND NEVER REWINDS THE BOARD. The status table is
 * this session's whatever date is in the address, which is the invariant
 * `ScenarioProvider` sets out and the reason nothing here is a fixture.
 */

const ORG_TOTAL = PROSPECTS.length;

/** Hours, printed the way the book prints them. */
function hours(n: number): string {
  return n % 1 === 0 ? `${n}` : n.toFixed(1);
}

/** A seat's own tone. Never the only signal: the word is always beside it. */
function toneFor(seat: Seat): string {
  return SEAT_STATE_META[seat.state].cssVar;
}

export function TeamPage() {
  const pipeline = usePipeline();
  const { activity } = useBook();
  const asOf = useAsOf();
  const openRecord = useOpenRecord();

  const floor = useMemo(
    () => floorReading(pipeline, activity, asOf),
    [pipeline, activity, asOf],
  );

  const [seatId, setSeatId] = useState(SEATS[0].id);
  const reading =
    floor.seats.find((r) => r.seat.id === seatId) ?? floor.seats[0];
  const seat = reading.seat;

  /**
   * The named work behind the lens: organisations in this seat whose
   * window is open inside the horizon and which nobody has touched this
   * period. The rows are the point. A seat reading with no names under
   * it is a statistic about a person rather than a list of work.
   */
  const untouched = useMemo(
    () =>
      PROSPECTS.filter(
        (p) =>
          seat.lanes.includes(p.lane) &&
          windowOpensWithin(p.buyingWindow, floor.nowMonth, 4) &&
          touchesFor(pipeline, p.id) === 0,
      ),
    [seat, pipeline, floor.nowMonth],
  );

  const teamRow = floor.team;
  const gateSignoff = signedOffOn(seat, HOLD_GATE_STEP.id, asOf);

  return (
    <div className={styles.page}>
      <PageHeader />
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>
            Stage four, the field crew, as at {formatDate(asOf)}
          </p>
          <h1 className={styles.h1}>The field crew</h1>
          <p className={styles.thesis}>
            <span aria-hidden="true" className={styles.thesisGlyph}>
              ◬
            </span>
            <span>
              Three seats. One of them has somebody in it. The other two
              carry <strong className="num">{teamRow.carriedForOpenSeats}</strong>{" "}
              of the <strong className="num">{ORG_TOTAL}</strong> organisations
              in this territory, and this screen is about what that costs
              rather than about how anybody is performing.
            </span>
          </p>
          <p className={styles.lede}>
            The posting names operational alignment in its first sentence and
            frames the budget as driving incremental phone calls and web
            leads. Those are the same sentence: a lead that lands in a week
            the crew is fully booked is a callback tomorrow, and tomorrow the
            household calls somebody else. Marketing that is not aligned to
            capacity funds the competition.{" "}
            <Link to="/coaching">How I would run the week</Link> covers the
            coaching half. This screen carries the capacity half: a seat, the
            service lines it covers, the slice of the territory that follows
            from them, and the work in it that nobody is doing.
          </p>
          <p className={styles.subLede}>
            No name appears anywhere on this screen. A seat is a published
            job title and an ordinal, exactly as every counterparty in this
            console is a role rather than a person.
          </p>
        </header>

        {/* -----------------------------------------------------------
            MONDAY. First, because it is the only part that is a verb.
            ----------------------------------------------------------- */}
        <section className={styles.section} aria-labelledby="monday-h">
          <SectionHead
            eyebrow="First"
            id="monday-h"
            title="What to do on Monday about the crew"
            lede="Ranked by what goes wrong first if nobody does anything. A withheld permission stops work outright. A season shuts on the weather's calendar rather than ours and cannot be worked later. A service line with no hours in it can be fixed on any day of the period. Carrying two open seats is a standing condition rather than an event."
          />

          {floor.actions.length === 0 ? (
            <ClearedBoard
              headline="Nothing outstanding on the crew"
              figure={
                <>
                  <span className="num">{floor.team.seatsFilled}</span> of{" "}
                  <span className="num">{floor.seats.length}</span> seats filled
                </>
              }
              note="Every open season has had a touch, every service line has hours planned into it, and every filled seat is signed off."
            />
          ) : (
            <ol className={styles.actions}>
              {floor.actions.map((action) => {
                const target = SEATS.find((s) => s.id === action.seatId);
                return (
                  <li key={action.id} className={styles.action}>
                    <p className={styles.actionFigure}>
                      <span className={`${styles.actionValue} num`}>
                        {action.figure}
                      </span>
                      <span className={styles.actionUnit}>{action.unit}</span>
                    </p>
                    <div className={styles.actionBody}>
                      <p className={styles.actionSeat}>
                        <span aria-hidden="true" className={styles.actionGlyph}>
                          {target ? SEAT_STATE_META[target.state].glyph : "○"}
                        </span>
                        <span>
                          {target
                            ? `Seat ${target.seatNumber}, ${target.title}, ${SEAT_STATE_META[
                                target.state
                              ].label.toLowerCase()}`
                            : "The crew"}
                        </span>
                      </p>
                      <h3 className={styles.actionVerb}>{action.verb}</h3>
                      <p className={styles.actionBecause}>{action.because}</p>
                      <p className={styles.actionLink}>
                        <Link className="tap" to={action.to}>
                          {action.toLabel}
                        </Link>
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        {/* -----------------------------------------------------------
            THE THREE SEATS. Read across, not down.
            ----------------------------------------------------------- */}
        <section className={styles.section} aria-labelledby="seats-h">
          <SectionHead
            eyebrow="The seats"
            id="seats-h"
            title="Three seats, and what each one carries"
            lede={
              <>
                Territory is split by service line rather than by geography,
                because the brand publishes one service area across several
                cities and a postcode split would hand two people the same
                street. A service line carries a motion with it: the way in,
                the class of demand, the month and the call. Press a seat to
                put its own work on screen.
              </>
            }
          />

          <ul className={styles.seats}>
            {floor.seats.map((r) => {
              const s = r.seat;
              const stateMeta = SEAT_STATE_META[s.state];
              const rampMeta = RAMP_STATE_META[r.rampState];
              const on = s.id === seatId;
              return (
                <li key={s.id} className={styles.seatCell}>
                  <article
                    className={styles.seat}
                    data-on={on ? "yes" : "no"}
                    data-state={s.state}
                    style={{ ["--tone" as string]: toneFor(s) }}
                    aria-labelledby={`seat-${s.id}-h`}
                  >
                    <header className={styles.seatHead}>
                      <p className={styles.seatOrdinal}>
                        Seat <span className="num">{s.seatNumber}</span>
                      </p>
                      <h3 className={styles.seatTitle} id={`seat-${s.id}-h`}>
                        {s.title}
                      </h3>
                      <p className={styles.seatState}>
                        <span aria-hidden="true" className={styles.seatGlyph}>
                          {stateMeta.glyph}
                        </span>
                        <span>{stateMeta.label}</span>
                        <span className={styles.seatSince}>
                          {s.startedOn
                            ? `since ${formatDate(s.startedOn)}`
                            : "no start date"}
                        </span>
                        <ProvenanceBadge provenance="illustrative" compact />
                      </p>
                      <p className={styles.seatSource} title={s.titleSource}>
                        Title published in the posting
                        <ProvenanceBadge provenance="public" compact />
                      </p>
                    </header>

                    <p className={styles.seatBrief}>{s.brief}</p>

                    <ul className={styles.seatLanes}>
                      {s.lanes.map((lane) => (
                        <li key={lane}>
                          <LaneChip lane={lane} size="sm" />
                        </li>
                      ))}
                    </ul>

                    <dl className={styles.seatFacts}>
                      <div className={styles.seatFact}>
                        <dt>Organisations</dt>
                        <dd>
                          <span className="num">{r.board.total}</span>
                          <span className={styles.of}>
                            of <span className="num">{ORG_TOTAL}</span>
                          </span>
                          <ProvenanceBadge provenance="public" compact />
                        </dd>
                      </div>
                      <div className={styles.seatFact}>
                        <dt>Season open, touched this period</dt>
                        <dd>
                          <span className="num">{r.board.workedInWindow}</span>
                          <span className={styles.of}>
                            of <span className="num">{r.board.inWindow}</span>
                          </span>
                          <ProvenanceBadge provenance="illustrative" compact />
                        </dd>
                      </div>
                      <div className={styles.seatFact}>
                        <dt>Live now</dt>
                        <dd>
                          <span className="num">{r.board.live}</span>
                          <span className={styles.of}>
                            in conversation or holding a date
                          </span>
                          <ProvenanceBadge provenance="illustrative" compact />
                        </dd>
                      </div>
                      <div className={styles.seatFact}>
                        <dt>No written door</dt>
                        <dd>
                          <span className="num">{r.board.doorOnly}</span>
                          <span className={styles.of}>
                            publish no email, so these are visits
                          </span>
                          <ProvenanceBadge provenance="public" compact />
                        </dd>
                      </div>
                      <div className={styles.seatFact}>
                        <dt>Hours planned to this seat</dt>
                        <dd>
                          <span className="num">{hours(r.hours.planned)}</span>
                          <span className={styles.of}>
                            {s.state === "filled" ? (
                              <>
                                of which{" "}
                                <span className="num">
                                  {hours(r.hours.outside)}
                                </span>{" "}
                                in the field
                              </>
                            ) : (
                              "nobody sits here to plan an hour against"
                            )}
                          </span>
                          <ProvenanceBadge provenance="illustrative" compact />
                        </dd>
                      </div>
                      <div className={styles.seatFact}>
                        <dt>Hours planned into these service lines</dt>
                        <dd>
                          <span className="num">{hours(r.hours.intoLanes)}</span>
                          <span className={styles.of}>
                            by anybody, this period
                          </span>
                          <ProvenanceBadge provenance="illustrative" compact />
                        </dd>
                      </div>
                    </dl>

                    <p className={styles.seatRamp} data-ramp={r.rampState}>
                      <span aria-hidden="true" className={styles.seatGlyph}>
                        {rampMeta.glyph}
                      </span>
                      <span className={styles.seatRampWord}>
                        Ramp {rampMeta.label.toLowerCase()}
                      </span>
                      <span className={styles.seatRampFigure}>
                        <span className="num">{r.signed.length}</span> of{" "}
                        <span className="num">{floor.steps.length}</span> steps
                        signed off
                        {/* The day count belongs to a ramp still running.
                            A closed ramp printing "day 28 of 10" is
                            arithmetic nobody asked for, so it prints the
                            day it closed instead. */}
                        {r.rampState === "under-way" && r.rampDay !== null ? (
                          <>
                            , day <span className="num">{r.rampDay}</span> of{" "}
                            <span className="num">{RAMP_WORKING_DAYS}</span>{" "}
                            working days
                          </>
                        ) : null}
                        {r.rampState === "closed" && r.lastSignoffOn ? (
                          <>, closed {formatDate(r.lastSignoffOn)}</>
                        ) : null}
                      </span>
                    </p>

                    <p
                      className={styles.seatPermission}
                      data-granted={r.mayHold ? "yes" : "no"}
                    >
                      <span aria-hidden="true" className={styles.seatGlyph}>
                        {r.mayHold ? "●" : "✕"}
                      </span>
                      <span>
                        {r.mayHold
                          ? `May hold a date. Step ${HOLD_GATE_STEP.n} signed off.`
                          : `May not hold a date. ${r.holdWithheld ?? ""}`}
                      </span>
                    </p>

                    <p className={styles.seatOpen}>
                      <button
                        type="button"
                        className={styles.seatButton}
                        aria-pressed={on}
                        onClick={() => setSeatId(s.id)}
                      >
                        <span aria-hidden="true">▸</span>
                        <span>
                          {on ? "On screen below" : `Put seat ${s.seatNumber} on screen`}
                        </span>
                      </button>
                    </p>
                  </article>
                </li>
              );
            })}
          </ul>
        </section>

        {/* -----------------------------------------------------------
            THE SEAT ON SCREEN. Rows, not a statistic about a person.
            ----------------------------------------------------------- */}
        <section className={styles.section} aria-labelledby="lens-h">
          <SectionHead
            eyebrow="The seat on screen"
            id="lens-h"
            title="Its work, its ramp, and its permission"
            lede="The figures above compare seats. This compares nothing: it is one seat's own work, by name, with the ramp that decides what it is allowed to do."
          />

          <WorkingSetLead
            headingId="seat-lead-h"
            /* Re-keyed on the seat AND on the clock, because both change
               the reading. The live region inside this component sits
               outside the keyed element for the reason its own header
               sets out, and this screen has no second region. */
            changeKey={`${seat.id}|${asOf}`}
            kicker="Seat on screen"
            glyph={SEAT_STATE_META[seat.state].glyph}
            label={`Seat ${seat.seatNumber}, ${seat.title}`}
            tone={toneFor(seat)}
            count={reading.board.total}
            total={ORG_TOTAL}
            noun={["organisation", "organisations"]}
            facts={[
              {
                label: "Season open, no touch this period",
                value: <span className="num">{untouched.length}</span>,
                qualifier: <ProvenanceBadge provenance="illustrative" compact />,
              },
              {
                label: "Live now",
                value: <span className="num">{reading.board.live}</span>,
              },
              {
                label: "Hours into these service lines",
                value: (
                  <span className="num">{hours(reading.hours.intoLanes)}</span>
                ),
              },
              {
                label: "Ramp",
                value: (
                  <>
                    <span className="num">{reading.signed.length}</span> of{" "}
                    <span className="num">{floor.steps.length}</span>
                  </>
                ),
              },
            ]}
            rows={untouched.slice(0, 4).map((p) => ({
              id: p.id,
              name: p.name,
              kind: LANE_META[p.lane].short,
              when: <>buys {p.buyingWindow}</>,
              onOpen: () => openRecord(p.id),
              openLabel: "Open record",
            }))}
            emptyLine={`Every organisation in seat ${seat.seatNumber} with a season opening inside four months has had a touch this period.`}
            announcement={`Seat ${seat.seatNumber}, ${seat.title}, ${SEAT_STATE_META[
              seat.state
            ].label.toLowerCase()}. ${reading.board.total} organisations, ${
              untouched.length
            } with a season open and no touch. Ramp ${RAMP_STATE_META[
              reading.rampState
            ].label.toLowerCase()}, ${reading.signed.length} of ${
              floor.steps.length
            } steps signed off.`}
          />

          <div className={styles.detail}>
            {/* --- The ramp ledger ------------------------------- */}
            <div className={styles.ramp}>
              <h3 className={styles.detailTitle}>
                The ramp, with dates on it
              </h3>
              <p className={styles.detailNote}>
                The seven steps and the reason each one sits where it does are
                argued on <Link to="/coaching">the coaching page</Link>, which
                owns them. What lives here is the part that page cannot carry:
                an id, a clock and a signature. A ramp with no clock is a
                curriculum.
                <span className={styles.inlineProv}>
                  <ProvenanceBadge provenance="illustrative" compact />
                </span>
              </p>

              {reading.rampState === "closed" ? (
                <ClearedBoard
                  headline="Ramp closed"
                  figure={
                    <>
                      <span className="num">{reading.signed.length}</span> of{" "}
                      <span className="num">{floor.steps.length}</span> steps
                      signed off
                    </>
                  }
                  note={`Signed by the ${
                    seat.rampSignoffs[0]?.byRole ?? "General Manager"
                  }, the last of them on ${formatDate(
                    seat.rampSignoffs[seat.rampSignoffs.length - 1]?.on ?? asOf,
                  )}.`}
                  size="sm"
                />
              ) : null}

              <ol className={styles.steps}>
                {floor.steps.map((step) => {
                  const off = signedOffOn(seat, step.id, asOf);
                  return (
                    <li
                      key={step.id}
                      className={styles.step}
                      data-signed={off ? "yes" : "no"}
                    >
                      <span className={`${styles.stepN} num`} aria-hidden="true">
                        {step.n}
                      </span>
                      <span className={styles.stepBody}>
                        <span className={styles.stepTitle}>{step.title}</span>
                        <span className={styles.stepWhen}>{step.when}</span>
                        <span className={styles.stepSign}>
                          <span aria-hidden="true" className={styles.seatGlyph}>
                            {off ? "●" : "○"}
                          </span>
                          {off
                            ? `Signed off ${formatDate(off.on)} by the ${off.byRole}`
                            : "Not signed off"}
                        </span>
                      </span>
                      {step.gates ? (
                        <span className={styles.stepGate}>
                          Gates {PITCH_STATUS[step.gates].label.toLowerCase()}
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* --- The permission -------------------------------- */}
            <div
              className={styles.permission}
              data-granted={reading.mayHold ? "yes" : "no"}
            >
              <h3 className={styles.detailTitle}>
                The permission this seat holds
              </h3>
              <p className={styles.permissionLine}>
                <span aria-hidden="true" className={styles.seatGlyph}>
                  {reading.mayHold ? "●" : "✕"}
                </span>
                <span>
                  {reading.mayHold ? "Granted" : "Withheld"}. Setting a status
                  to {PITCH_STATUS["soft-hold"].label.toLowerCase()}, which is
                  the one act on this screen that takes crew capacity off the
                  schedule before anything is signed.
                </span>
              </p>
              <p className={styles.permissionWhy}>
                {reading.mayHold ? (
                  <>
                    Step <span className="num">{HOLD_GATE_STEP.n}</span> was
                    signed off on{" "}
                    <span className="num">
                      {gateSignoff ? formatDate(gateSignoff.on) : ""}
                    </span>
                    . Until it was, this seat could not have held a date, and
                    the refusal happens in the reducer that writes the status
                    table rather than on the three controls that offer it.
                  </>
                ) : (
                  <>
                    {reading.holdWithheld} The application enforces it rather
                    than warning about it: the pipeline reducer refuses the
                    status outright.
                  </>
                )}
              </p>
              <p className={styles.permissionCost}>
                Step <span className="num">{HOLD_GATE_STEP.n}</span> is the
                arithmetic that limits every promise. A date held that the crew
                cannot physically run becomes a rescheduled job, an apology from
                a general manager, and a property manager who tells every other
                manager in the association.{" "}
                <Link to="/calendar">What the crew can actually run</Link>.
              </p>
            </div>
          </div>
        </section>

        {/* -----------------------------------------------------------
            THE TEAM ROW. Leading indicators only, and it says so.
            ----------------------------------------------------------- */}
        <section className={styles.section} aria-labelledby="team-h">
          <SectionHead
            eyebrow="The team goal"
            id="team-h"
            title="One row, and not one dollar in it"
            lede={
              <>
                The individual goal is the leading indicator and collected
                revenue is the lagging one. The team goal is the sum of the
                leading indicators and is never a sum of anything in dollars. That is{" "}
                <Link to="/coaching">the first measurement rule</Link> applied
                upward, and it is a real team goal rather than an arithmetic
                convenience: coverage of the in-season population has a shared
                denominator set by the weather and by other organisations'
                budget cycles, so two seats covering four fifths of it between
                them is an outcome neither of them owns alone.
              </>
            }
          />

          <div className={styles.team} data-ledger="outbound-activity">
            <p className={styles.teamLedger}>
              <span aria-hidden="true" className={styles.seatGlyph}>
                {LEDGER["outbound-activity"].glyph}
              </span>
              {LEDGER["outbound-activity"].note}
            </p>

            <dl className={styles.teamFacts}>
              <div className={styles.teamFact}>
                <dt>Seats filled</dt>
                <dd>
                  <span className="num">{teamRow.seatsFilled}</span>
                  <span className={styles.of}>
                    of <span className="num">{floor.seats.length}</span>
                  </span>
                  <ProvenanceBadge provenance="illustrative" compact />
                </dd>
              </div>
              <div className={styles.teamFact}>
                <dt>
                  Non-discretionary organisations touched inside their season
                </dt>
                <dd>
                  <span className="num">{teamRow.lockedWorkedInWindow}</span>
                  <span className={styles.of}>
                    of <span className="num">{teamRow.lockedInWindow}</span>
                  </span>
                  <ProvenanceBadge provenance="illustrative" compact />
                </dd>
              </div>
              <div className={styles.teamFact}>
                <dt>Every organisation with a season open, touched</dt>
                <dd>
                  <span className="num">{teamRow.workedInWindow}</span>
                  <span className={styles.of}>
                    of <span className="num">{teamRow.inWindow}</span>
                  </span>
                  <ProvenanceBadge provenance="illustrative" compact />
                </dd>
              </div>
              <div className={styles.teamFact}>
                <dt>Hours in the field</dt>
                <dd>
                  <span className="num">{hours(teamRow.hoursOutside)}</span>
                  <span className={styles.of}>
                    of <span className="num">{hours(teamRow.hoursPlanned)}</span>{" "}
                    planned
                  </span>
                  <ProvenanceBadge provenance="illustrative" compact />
                </dd>
              </div>
              <div className={styles.teamFact}>
                <dt>Touches recorded this period</dt>
                <dd>
                  <span className="num">{teamRow.touches}</span>
                  <span className={styles.of}>
                    across <span className="num">{teamRow.touched}</span>{" "}
                    organisations
                  </span>
                  <ProvenanceBadge provenance="illustrative" compact />
                </dd>
              </div>
              <div className={styles.teamFact}>
                <dt>Carried for a seat nobody sits in</dt>
                <dd>
                  <span className="num">{teamRow.carriedForOpenSeats}</span>
                  <span className={styles.of}>
                    organisations,{" "}
                    <span className="num">
                      {teamRow.openSeatUntouchedInWindow}
                    </span>{" "}
                    of them open and untouched
                  </span>
                  <ProvenanceBadge provenance="illustrative" compact />
                </dd>
              </div>
            </dl>

            <p className={styles.teamRule}>
              <span aria-hidden="true" className={styles.seatGlyph}>
                ✕
              </span>
              <span>
                No revenue appears in this row and none ever will. The book is
                the other ledger, it is managed monthly rather than coached
                weekly, and the two are never summed.{" "}
                <Link to="/calendar">The book, both ledgers</Link>.
              </span>
            </p>
          </div>
        </section>

        <p className={styles.foot}>
          The seat titles are published ones: Champions Group's own Brea board
          carries a Marketing Manager for the West Division and a Digital
          Marketing Specialist, and no title on this screen was invented.
          Everything else about a seat, the start date, the signoff dates, the
          signing role and the service line split, is this console's own
          proposal, built for this work sample and badged as such. It is not a
          claim about how the division is staffed. The organisation counts come
          from the same <Link to="/method">researched territory</Link> every
          other screen reads, the coverage and the hours are read live off this
          session's state, and the clock moves dates without ever rewinding the
          board.
        </p>
      </div>
    </div>
  );
}
