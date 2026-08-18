import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { BookLine } from "@/domain/types";
import type {
  AccountMetric,
  AccountSegment,
  AccountTrace,
  TraceKind,
} from "@/domain/accounts";
import {
  ACCOUNT_STATE_META,
  ACCOUNT_STATE_ORDER,
  CYCLE_STATE_META,
  OVERDUE_RATIO,
  SEGMENT_PROFILE,
  TRACE_META,
  TRACE_OFFSET_DAYS,
  TRACE_ORDER,
  daysInMonth,
  isoOf,
  partsOf,
} from "@/domain/accounts";
import type {
  AccountRow,
  ClockRow,
  WindowConflict,
} from "@/domain/selectors/accounts";
import { accountBoard } from "@/domain/selectors/accounts";
import { STALENESS_DAYS, STALENESS_META } from "@/domain/selectors/partners";
import { daysBetween, formatDate } from "@/domain/licensing";
import { SCENARIOS, useScenario } from "@/state/ScenarioProvider";
import { PageHeader } from "@/components/chrome/PageHeader";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { RecordName } from "@/components/record/RecordName";
import { ClearedBoard } from "@/components/play/ClearedBoard";
import { SectionHead, Stat, StatStrip, TokenMark } from "@/components/licensing/Panels";
import styles from "./AccountsPage.module.css";

/**
 * THE CUSTOMER AFTER THE SIGNATURE.
 *
 * ── THE TEST THIS SCREEN IS HELD TO ───────────────────────────────
 * Does a rep know what to do on Monday about somebody who has already
 * signed? Everything else in this application happens before a purchase.
 * A retention board that only reported the state of the world, with no
 * dated action against a named organisation, would have failed on its
 * own terms, so the first thing under the head is the dated work and the
 * figures come after it.
 *
 * ── WHAT IT FINDS ON THE FIRST RENDER ─────────────────────────────
 * Heights Christian holds three occasions and has signed one event.
 * Their December programme window opens on 5 October 2026 and closes on
 * 14 November 2026, which is SIX DAYS BEFORE the 20 November event they
 * have already bought. The natural order of work, run the event and then
 * ask for the next one, has already lost the December programme by the
 * time it starts. Two dates and a subtraction, found because the model
 * is an occasion rather than an anniversary. It is the first block on
 * the screen and it is drawn as a conflict rather than as a row.
 *
 * ── TWO FIGURES ARE HONESTLY NOT MEASURABLE ───────────────────────
 * No window has closed and no event has been delivered, so rebooking
 * rate and revenue retained have a denominator of zero. The engine
 * models that as a discriminated union and this screen narrows on it:
 * the word, the reason, and the date the figure first has a denominator.
 * Never nought per cent, never a dash, never NaN. Nought per cent would
 * mean every window was missed, which is a much worse claim than the
 * truth.
 *
 * ── THE LEDGER LINE, WHICH IS NOT DECORATION ──────────────────────
 * Retained revenue is the same `BookLine` money `/book` already counts,
 * seen down a second axis. It is not a third ledger and this page says
 * so where the figure is, because an account that appeared to add money
 * to the book by being looked at from the side would quietly break the
 * one rule the whole application is built on.
 *
 * ── THE SCENARIO CLOCK LIVES HERE ─────────────────────────────────
 * This is the screen it exists for, so the control that moves it is on
 * this screen, drawn as chrome and clearly separate from the data. It
 * moves the clock and nothing else. Which scenario shows which state:
 *
 *   ?as-of=2026-09-23  default. Nothing delivered, both accounts
 *                      awaiting delivery, two figures not measurable,
 *                      the December conflict live and 12 days from
 *                      opening.
 *   ?as-of=2026-10-05  the first window opens. Heights Christian moves
 *                      to `window-open` and the conflict is inside it.
 *   ?as-of=2026-11-14  the window's last day. Rebooking rate gets its
 *                      first denominator, one window closed.
 *   ?as-of=2026-11-21  the first event is delivered. The debrief falls
 *                      due, events per account reads for the first
 *                      time, purchase recency stops saying "no event".
 *   ?as-of=2026-12-27  both events delivered, all eight obligations due,
 *                      rebooking rate one of two.
 *   ?as-of=2027-06-01  a year out. One account at risk, one lapsed, and
 *                      the missed windows have dates on them.
 */

// ---------------------------------------------------------------
// Small readings shared by the blocks below
// ---------------------------------------------------------------

/** "in 12 days", "today", "12 days ago". Never a bare signed number. */
function whenClause(days: number): string {
  if (days === 0) return "today";
  if (days > 0) return `in ${days} ${days === 1 ? "day" : "days"}`;
  const back = Math.abs(days);
  return `${back} ${back === 1 ? "day" : "days"} ago`;
}

function money(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function cap(clause: string): string {
  return clause.length === 0 ? clause : clause.charAt(0).toUpperCase() + clause.slice(1);
}

/** The months an occasion label reads as, for the axis. */
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function AccountsPage() {
  /*
    THE CLOCK, SLICED TO A CALENDAR DAY.

    `useAsOf` returns the frozen board constant when the parameter is
    absent, and that constant is a full timestamp because the request
    queue needs an hour on it. Every date function in the accounts
    engine parses `${iso}T12:00:00Z`, which is NaN for a string that
    already carries a time, and a NaN day count renders as a confident
    zero. Ten characters is the whole fix and it is correct for both
    shapes.
  */
  const { asOf: asOfRaw } = useScenario();
  const asOf = asOfRaw.slice(0, 10);

  const board = useMemo(() => accountBoard(asOf), [asOf]);

  /*
    ONE POLITE LIVE REGION FOR THE WHOLE SCREEN, MOUNTED BEFORE ANY OF
    THIS CAN CHANGE AND NEVER RE-KEYED. It sits at the page root, outside
    every block that re-keys, because a region removed and re-added in
    the same commit is a region assistive technology has no reason to
    read, and the announcement would be lost to the very mechanism that
    makes the change visible. It is empty on load: a state that was
    already true when the page opened is not news.
  */
  const [announcement, setAnnouncement] = useState("");

  const nameOf = useMemo(() => {
    const out: Record<string, { prospectId: string; name: string }> = {};
    for (const row of board.rows) {
      out[row.account.id] = {
        prospectId: row.account.prospectId,
        name: row.prospect?.name ?? row.account.id,
      };
    }
    return out;
  }, [board.rows]);

  const segmentsOnBoard = useMemo(() => {
    const seen: AccountSegment[] = [];
    for (const row of board.clock) {
      if (!seen.includes(row.segment)) seen.push(row.segment);
    }
    return seen;
  }, [board.clock]);

  const firstDue = board.postEventObligations.find((t) => !t.due) ?? null;

  return (
    <div className={styles.page}>
      <PageHeader />

      <div className={styles.inner}>
        {/* ===========================================================
            HEAD
            =========================================================== */}
        <header className={styles.head}>
          <p className={styles.eyebrow}>
            The client base, as at {formatDate(asOf)}
          </p>
          <h1 className={styles.h1}>Accounts</h1>

          <p className={styles.thesis}>
            <span aria-hidden="true" className={styles.thesisGlyph}>
              ◠
            </span>
            <span>
              Everything else in this application happens before somebody
              buys. This is the half after: what each account holds, when
              each window opens, and what has to happen the day after each
              event. <strong className="num">{board.rows.length}</strong>{" "}
              accounts, <strong className="num">{board.clock.length}</strong>{" "}
              dated occasions,{" "}
              <strong className="num">{board.postEventObligations.length}</strong>{" "}
              dated obligations.
            </span>
          </p>

          <p className={styles.framing}>
            <span aria-hidden="true" className={styles.framingGlyph}>
              ◆
            </span>
            <span>
              A clock, not a history. This desk has no back catalogue, both
              signed contracts are still ahead of it, and none has been
              invented. Retained revenue is the same book money seen down a
              second axis and never a third ledger.
            </span>
          </p>
        </header>

        <ScenarioClock announce={setAnnouncement} asOf={asOf} />

        <StatStrip label="The register at a glance">
          <Stat
            value={board.rows.length}
            label="Accounts on the register"
            note="Every organisation that has signed something. Two, and both events are still in the future."
            provenance="modeled"
          />
          <Stat
            value={board.clock.length}
            label="Occasions dated"
            note="Read out of the buying window on each prospect row. One organisation holds several occasions on several clocks, which is the whole argument for the account level."
            provenance="modeled"
          />
          <Stat
            value={board.postEventObligations.length}
            label="Obligations dated"
            note="Four per contracted event, anchored on the event date with a signed offset. Confirm, debrief, review ask, place the next one."
            provenance="modeled"
          />
          <Stat
            value={board.conflicts.length}
            label="Window conflicts"
            note="A rebooking window that shuts before an event the same account has already signed. Found by subtraction, not by a heuristic."
            provenance="modeled"
            tone="var(--warn)"
            live
          />
          <Stat
            value={
              board.daysToFirstDelivery === null
                ? 0
                : Math.abs(board.daysToFirstDelivery)
            }
            label={
              board.daysToFirstDelivery !== null && board.daysToFirstDelivery < 0
                ? "Days since the first event"
                : "Days to the first event"
            }
            note="The first contracted event in the book. This board reads delivered from the morning after it."
            provenance="modeled"
            live
          />
        </StatStrip>

        {/* ===========================================================
            ONE. THE DATED WORK, CONFLICT FIRST
            =========================================================== */}
        <section className={styles.section} aria-labelledby="acc-monday">
          <SectionHead
            eyebrow="One"
            id="acc-monday"
            title="What has to happen next"
            lede="Dated work against a named organisation. A retention board that only reports the state of the world has failed its own test."
            meta={
              <>
                <ProvenanceBadge provenance="modeled" compact />
                <span>
                  Every date below is arithmetic against{" "}
                  {formatDate(asOf)} and a stated lead time. Nothing here was
                  typed against a record.
                </span>
              </>
            }
          />

          {board.conflicts.length > 0 ? (
            board.conflicts.map((conflict) => (
              <ConflictCard
                key={`${conflict.occasionId}:${conflict.eventLineId}`}
                conflict={conflict}
                prospectId={nameOf[conflict.accountId]?.prospectId ?? ""}
                asOf={asOf}
              />
            ))
          ) : (
            <p className={styles.quiet}>
              <span aria-hidden="true">○</span> No window closes before an event
              the same account has already signed.{" "}
              <span className="num">{board.clock.length}</span> occasions
              checked against{" "}
              <span className="num">
                {board.rows.reduce((n, r) => n + r.lines.length, 0)}
              </span>{" "}
              signed events.
            </p>
          )}

          <h3 className={styles.blockTitle}>The next dated thing on each account</h3>
          <ul className={styles.nextList}>
            {board.rows.map((row) => (
              <li key={row.account.id} className={styles.nextItem}>
                <RecordName
                  prospectId={row.account.prospectId}
                  name={row.prospect?.name}
                  className={styles.nextName}
                />
                {row.nextAction ? (
                  <>
                    <span className={styles.nextVerb}>{row.nextAction.label}</span>
                    <span className={styles.nextWhen}>
                      <span className="num">{formatDate(row.nextAction.on)}</span>
                      <span className={styles.nextDays}>
                        {whenClause(row.nextAction.daysAway)}
                      </span>
                    </span>
                    <span className={styles.nextOcc}>
                      {row.nextAction.occasionLabel ?? "Contracted event"}
                    </span>
                  </>
                ) : (
                  <span className={styles.nextVerb}>Nothing dated ahead</span>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* ===========================================================
            TWO. THE FORTNIGHT AFTER THE EVENT
            =========================================================== */}
        <section className={styles.section} aria-labelledby="acc-after">
          <SectionHead
            eyebrow="Two"
            id="acc-after"
            title="The fortnight after the event"
            lede="Five dated obligations per contract: an anchor date, a signed offset and a purpose. Oracle's trace definition with this trade's numbers in it."
            meta={
              <>
                <ProvenanceBadge provenance="modeled" compact />
                <span>
                  Offsets of minus 1, 0, plus 1, plus 7 and plus 14 days on the
                  event date. The confirm belongs to operations and cannot be
                  ticked here.
                </span>
              </>
            }
          />

          <ObligationsPanel
            /* Re-keyed on the clock so a reader who moves it does not carry
               a tick from one reading into another, where the same
               obligation may not even be due. The live region is at the
               page root and is deliberately not inside this. */
            key={asOf}
            traces={board.postEventObligations}
            nameOf={nameOf}
            asOf={asOf}
            firstDueOn={firstDue?.on ?? null}
            announce={setAnnouncement}
          />

          <ul className={styles.offsets}>
            {TRACE_ORDER.map((kind: TraceKind) => (
              <li key={kind} className={styles.offsetItem}>
                <span className={styles.offsetGlyph} aria-hidden="true">
                  {TRACE_META[kind].glyph}
                </span>
                <span className={styles.offsetLabel}>{TRACE_META[kind].label}</span>
                <span className={`${styles.offsetDays} num`}>
                  {offsetWords(TRACE_OFFSET_DAYS[kind])}
                </span>
                <span className={styles.offsetOwner}>{TRACE_META[kind].ownerRole}</span>
                <span className={styles.offsetWhy}>{TRACE_META[kind].why}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ===========================================================
            THREE. THE FOUR FIGURES
            =========================================================== */}
        <section className={styles.section} aria-labelledby="acc-figures">
          <SectionHead
            eyebrow="Three"
            id="acc-figures"
            title="The four figures"
            lede="Each one prints its formula and, where it has no denominator yet, the date it first has one. A rate with nothing under the line is a sentence, not a percentage."
            meta={
              <>
                <ProvenanceBadge provenance="modeled" compact />
                <span>
                  No source publishes a rebooking benchmark for an event venue.
                  These are this application's own definitions, stated here
                  rather than implied.
                </span>
              </>
            }
          />
          <div className={styles.tiles}>
            {board.metrics.map((metric) => (
              <MetricTile key={metric.id} metric={metric} asOf={asOf} />
            ))}
          </div>
        </section>

        {/* ===========================================================
            FOUR. THE CLOCK
            =========================================================== */}
        <section className={styles.section} aria-labelledby="acc-clock">
          <SectionHead
            eyebrow="Four"
            id="acc-clock"
            title="Twelve months of windows"
            lede="One row per occasion, not per contract. Two organisations produce five dated windows because an account holds occasions and a book holds events."
            meta={
              <>
                <ProvenanceBadge provenance="modeled" compact />
                <span>
                  Every label is read out of a buying window string and every
                  date is the occasion less a segment lead time.
                </span>
              </>
            }
          />
          <MonthClock rows={board.clock} accountLines={board.rows} asOf={asOf} />
        </section>

        {/* ===========================================================
            FIVE. THE ACCOUNTS
            =========================================================== */}
        <section className={styles.section} aria-labelledby="acc-cards">
          <SectionHead
            eyebrow="Five"
            id="acc-cards"
            title="The accounts"
            lede="Worst state first, then by the date of the next thing that has to happen. A register sorted by name is a directory and hides the row that needs a call."
            meta={
              <>
                <ProvenanceBadge provenance="modeled" compact />
                <span>
                  Two health readings, kept apart. Days since anybody spoke to
                  them, and days since they last bought over their own cycle.
                </span>
              </>
            }
          />
          <div className={styles.cards}>
            {board.rows.map((row) => (
              <AccountCard key={row.account.id} row={row} asOf={asOf} />
            ))}
          </div>
        </section>

        {/* ===========================================================
            SIX. STATES AND THRESHOLDS
            =========================================================== */}
        <section className={styles.section} aria-labelledby="acc-states">
          <SectionHead
            eyebrow="Six"
            id="acc-states"
            title="Five states and the boundaries between them"
            lede="Three of these cannot be reached today, and the board says so with the count rather than showing ticks it has not earned."
            meta={
              <>
                <ProvenanceBadge provenance="modeled" compact />
                <span>
                  Account state is its own vocabulary, drawn in arcs. It is not
                  an extension of pitch status, which is a filling circle and
                  stops at booked.
                </span>
              </>
            }
          />

          <ul className={styles.states}>
            {ACCOUNT_STATE_ORDER.map((state) => (
              <li key={state} className={styles.stateRow}>
                <TokenMark token={ACCOUNT_STATE_META[state]} />
                <span className={`${styles.stateCount} num`}>
                  {board.stateCounts[state]}
                </span>
                <span className={styles.stateNote}>
                  {ACCOUNT_STATE_META[state].note}
                </span>
              </li>
            ))}
          </ul>

          <h3 className={styles.blockTitle}>The lead times this board runs on</h3>
          <ul className={styles.leads}>
            {segmentsOnBoard.map((segment) => {
              const profile = SEGMENT_PROFILE[segment];
              return (
                <li key={segment} className={styles.leadRow}>
                  <span className={styles.leadName}>{profile.label}</span>
                  <span className={`${styles.leadDays} num`}>
                    Opens {profile.planningLeadDays} days before, closes{" "}
                    {profile.commitLeadDays} days before
                  </span>
                  <span className={styles.leadSource}>
                    <ProvenanceBadge provenance={profile.provenance} compact />{" "}
                    {profile.source}
                  </span>
                </li>
              );
            })}
          </ul>

          <ul className={styles.thresholds}>
            <li>
              <span className={styles.thresholdLabel}>Purchase recency</span>
              <span className={`${styles.thresholdValue} num`}>
                {OVERDUE_RATIO.windowOpen.toFixed(2)} window open,{" "}
                {OVERDUE_RATIO.overdue.toFixed(2)} overdue,{" "}
                {OVERDUE_RATIO.lapsed.toFixed(2)} lapsed
              </span>
              <span className={styles.thresholdNote}>
                Days since the last event over that account's own cycle. A day
                count on its own reads gone quiet for eight months of a
                perfectly healthy school year.
              </span>
            </li>
            <li>
              <span className={styles.thresholdLabel}>Contact staleness</span>
              <span className={`${styles.thresholdValue} num`}>
                {STALENESS_DAYS.cooling} cooling, {STALENESS_DAYS.cold} cold,{" "}
                {STALENESS_DAYS.goneQuiet} gone quiet
              </span>
              <span className={styles.thresholdNote}>
                Ported unchanged from the supplier register, where the same
                arithmetic already works, because a second copy of four
                boundaries is how a legend and a table start disagreeing.
              </span>
            </li>
            <li>
              <span className={styles.thresholdLabel}>Churn event</span>
              <span className={`${styles.thresholdValue} num`}>
                1 missed window at risk, 2 lapsed
              </span>
              <span className={styles.thresholdNote}>
                A window that opened, closed, and had nothing signed in it. Scale
                free, so it works the same for a six month cycle and a twelve
                month one.
              </span>
            </li>
          </ul>

          <p className={styles.sectionFoot}>
            No source publishes any of these boundaries for a bowling venue, so
            they are printed here rather than implied. The contracts behind
            these accounts are on <Link to="/book">the book</Link>, the dates
            they consume are on <Link to="/book/week">the week sheet</Link>, the
            other recurring product this building sells is on{" "}
            <Link to="/leagues">leagues</Link>, and every formula is on{" "}
            <Link to="/method">method</Link>.
          </p>
        </section>
      </div>

      {/* The one live region. Mounted here from the first render, never
          re-keyed, polite, and silent until a reader changes something. */}
      <p className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------
// The scenario clock, which is chrome
// ---------------------------------------------------------------

/**
 * THE CONTROL THAT MOVES THE DATE, AND IT IS HONEST ABOUT BEING ONE.
 *
 * This board is a clock rather than a history, so a reader looking at it
 * on one afternoon sees one state out of the ten the same code produces
 * across a year. The alternative to this control is ten sets of seeded
 * records about trading nobody has done, which would cost the
 * credibility of every other figure on the site.
 *
 * It is drawn as chrome: a dashed rule, the recessed ground, small type,
 * and it sits outside every data block. A reader must never mistake it
 * for a filter over the rows, so the one line under it says exactly what
 * it does and stops.
 */
function ScenarioClock({
  announce,
  asOf,
}: {
  announce: (line: string) => void;
  asOf: string;
}) {
  const { current, moved, setAsOf } = useScenario();

  return (
    <section className={styles.clockBar} aria-labelledby="acc-scenario">
      <div className={styles.clockHead}>
        <h2 className={styles.clockTitle} id="acc-scenario">
          <span aria-hidden="true" className={styles.clockGlyph}>
            ◷
          </span>
          Scenario clock
        </h2>
        <p className={styles.clockNote}>
          Moves the date this application reads as today. It adds no record and
          invents no figure.
        </p>
      </div>

      <div className={styles.clockRow} role="group" aria-label="Choose a date">
        {SCENARIOS.map((scenario) => {
          const on = scenario.asOf.slice(0, 10) === asOf;
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
                  `Clock moved to ${formatDate(scenario.asOf.slice(0, 10))}. ${scenario.because}.`,
                );
              }}
            >
              <span className={styles.clockKeyLabel}>{scenario.label}</span>
              <span className={`${styles.clockKeyDate} num`}>
                {formatDate(scenario.asOf.slice(0, 10))}
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
// The conflict
// ---------------------------------------------------------------

/**
 * THE ONE FINDING THIS BOARD EXISTS TO SURFACE, DRAWN SO IT CANNOT BE
 * SCROLLED PAST.
 *
 * A sales manager reading the book sees one contract in November. The
 * same organisation has a second occasion whose window shuts before that
 * contract is even delivered. It is three dates and a subtraction, and
 * an anniversary model cannot find it because an anniversary model does
 * not know the organisation holds three occasions.
 *
 * The word "conflict", the hatched edge and the tone all say the same
 * thing, so the reading survives greyscale.
 */
function ConflictCard({
  conflict,
  prospectId,
  asOf,
}: {
  conflict: WindowConflict;
  prospectId: string;
  asOf: string;
}) {
  const toClose = daysBetween(asOf, conflict.closesOn);
  const toOpen = daysBetween(asOf, conflict.opensOn);

  return (
    <div className={styles.conflict}>
      <p className={styles.conflictKicker}>
        <span aria-hidden="true" className={styles.conflictGlyph}>
          ◤
        </span>
        Conflict, found by subtraction
      </p>

      <h3 className={styles.conflictTitle}>
        {prospectId ? (
          <RecordName
            prospectId={prospectId}
            name={conflict.accountName}
            className={styles.conflictName}
          />
        ) : (
          <span className={styles.conflictName}>{conflict.accountName}</span>
        )}
        <span className={styles.conflictOcc}>{conflict.occasionLabel}</span>
      </h3>

      <ol className={styles.conflictDates}>
        <li>
          <span className={styles.conflictWhat}>Window opens</span>
          <span className={`${styles.conflictWhen} num`}>
            {formatDate(conflict.opensOn)}
          </span>
          <span className={styles.conflictAway}>{whenClause(toOpen)}</span>
        </li>
        <li>
          <span className={styles.conflictWhat}>Window closes</span>
          <span className={`${styles.conflictWhen} num`}>
            {formatDate(conflict.closesOn)}
          </span>
          <span className={styles.conflictAway}>{whenClause(toClose)}</span>
        </li>
        <li>
          <span className={styles.conflictWhat}>Signed event runs</span>
          <span className={`${styles.conflictWhen} num`}>
            {formatDate(conflict.eventDate)}
          </span>
          <span className={styles.conflictAway}>
            <span className="num">{conflict.daysBefore}</span> days after the
            window shuts
          </span>
        </li>
      </ol>

      <p className={styles.conflictVerb}>
        Place the {conflict.occasionLabel} before{" "}
        <strong className="num">{formatDate(conflict.closesOn)}</strong>. Waiting
        for the event on {formatDate(conflict.eventDate)} and asking afterwards
        loses it by <strong className="num">{conflict.daysBefore}</strong> days.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------
// The post event obligations
// ---------------------------------------------------------------

const CLEARED_FOCUS = "cleared";

function offsetWords(offset: number): string {
  if (offset === 0) return "on the day";
  if (offset < 0) {
    const back = Math.abs(offset);
    return `${back} ${back === 1 ? "day" : "days"} before`;
  }
  return `${offset} ${offset === 1 ? "day" : "days"} after`;
}

/**
 * THE ONLY SET ON THIS SCREEN THAT CAN EMPTY, AND THE ONLY PLACE A
 * CLOSURE IS EARNED.
 *
 * A celebration fires when a SET empties and never when a row completes.
 * On this board there is exactly one such set: the sales owned
 * obligations that have fallen due. Handle the last one and the rows are
 * replaced by the strike box, the word and the figure that moved, which
 * is the same mechanic the daily rings already use and the same three
 * redundant signals. Nothing flies across the screen, nothing sounds,
 * nothing takes focus away from the work.
 *
 * A SET THAT WAS ALREADY EMPTY IS NOT A CLOSURE. Before the first event
 * nothing is due, and drawing a cleared board for work nobody has done
 * would be the cheap celebration that retroactively discredits every
 * figure beside it. So the empty-at-load reading is a dated line saying
 * when the first obligation falls due, and the strike box appears only
 * when a reader has actually cleared the set in this session.
 *
 * THE CONFIRM ROW CANNOT BE TICKED HERE. It belongs to operations, and
 * two systems owning one task is how both of them drop it. It is listed,
 * because an account timeline missing it would be incomplete, and it
 * carries the owner's name instead of a control.
 */
function ObligationsPanel({
  traces,
  nameOf,
  asOf,
  firstDueOn,
  announce,
}: {
  traces: AccountTrace[];
  nameOf: Record<string, { prospectId: string; name: string }>;
  asOf: string;
  firstDueOn: string | null;
  announce: (line: string) => void;
}) {
  const [done, setDone] = useState<string[]>([]);
  const [focusWanted, setFocusWanted] = useState<string | null>(null);
  const rowRefs = useRef(new Map<string, HTMLButtonElement | null>());
  const clearedRef = useRef<HTMLDivElement | null>(null);

  const dueHere = traces.filter((t) => t.due && TRACE_META[t.kind].actionableHere);
  const dueElsewhere = traces.filter(
    (t) => t.due && !TRACE_META[t.kind].actionableHere,
  );
  const ahead = traces.filter((t) => !t.due);
  const left = dueHere.filter((t) => !done.includes(t.id));
  const handled = dueHere.filter((t) => done.includes(t.id));
  const cleared = dueHere.length > 0 && left.length === 0 && handled.length > 0;

  /* Focus follows the work: the row that took the place of the one just
     handled, or the cleared mark when there is nothing left. It only ever
     runs from a press, so nothing steals focus on load or on a clock
     move. */
  useEffect(() => {
    if (!focusWanted) return;
    const target =
      focusWanted === CLEARED_FOCUS
        ? clearedRef.current
        : (rowRefs.current.get(focusWanted) ?? null);
    target?.focus();
    setFocusWanted(null);
  }, [focusWanted]);

  function markDone(trace: AccountTrace) {
    const after = left.filter((t) => t.id !== trace.id);
    const who = nameOf[trace.accountId]?.name ?? trace.accountId;
    setDone((ids) => [...ids, trace.id]);
    announce(
      after.length === 0
        ? `Post event obligations cleared. ${handled.length + 1} handled on this reading.`
        : `${TRACE_META[trace.kind].label} done, ${who}. ${after.length} left.`,
    );
    setFocusWanted(after[0]?.id ?? CLEARED_FOCUS);
  }

  function putBack(trace: AccountTrace) {
    const who = nameOf[trace.accountId]?.name ?? trace.accountId;
    setDone((ids) => ids.filter((id) => id !== trace.id));
    announce(
      `${TRACE_META[trace.kind].label} put back, ${who}. ${left.length + 1} left.`,
    );
    setFocusWanted(trace.id);
  }

  return (
    <div className={styles.due}>
      <div className={styles.dueHead}>
        <h3 className={styles.dueTitle}>Due on this reading</h3>
        <p className={styles.dueCount}>
          <span className={`${styles.dueValue} num`}>{left.length}</span>
          {/* "0 of 0" is a figure a reader has to read twice to learn
              nothing, so the denominator appears only once it is
              narrowing something. */}
          <span className={styles.dueOf}>
            {dueHere.length > 0 ? (
              <>
                of <span className="num">{dueHere.length}</span>{" "}
              </>
            ) : null}
            {(dueHere.length === 0 ? left.length : dueHere.length) === 1
              ? "obligation"
              : "obligations"}{" "}
            due
          </span>
        </p>
      </div>

      {cleared ? (
        <div
          className={styles.clearedWrap}
          ref={clearedRef}
          tabIndex={-1}
          aria-label={`Post event obligations cleared. ${handled.length} handled.`}
        >
          <ClearedBoard
            headline="Obligations cleared"
            figure={<span className="num">{handled.length}</span>}
            note="handled on this reading"
          />
        </div>
      ) : left.length > 0 ? (
        <ul className={styles.dueList}>
          {left.map((trace) => {
            const meta = TRACE_META[trace.kind];
            const who = nameOf[trace.accountId];
            return (
              <li key={trace.id} className={styles.dueRow}>
                <span className={styles.dueGlyph} aria-hidden="true">
                  {meta.glyph}
                </span>
                <span className={styles.dueLabel}>{meta.label}</span>
                {who ? (
                  <RecordName
                    prospectId={who.prospectId}
                    name={who.name}
                    className={styles.dueName}
                  />
                ) : (
                  <span className={styles.dueName}>{trace.accountId}</span>
                )}
                <span className={`${styles.dueWhen} num`}>
                  {formatDate(trace.on)}
                </span>
                <span className={styles.dueAway}>{whenClause(trace.daysAway)}</span>
                <button
                  type="button"
                  className={styles.dueAct}
                  ref={(el) => {
                    rowRefs.current.set(trace.id, el);
                  }}
                  onClick={() => markDone(trace)}
                >
                  Mark done
                  <span className="visually-hidden">
                    , {meta.label}, {who?.name ?? trace.accountId}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={styles.quiet}>
          <span aria-hidden="true">○</span> Nothing falls due on{" "}
          {formatDate(asOf)}.
          {firstDueOn
            ? ` The first obligation is dated ${formatDate(firstDueOn)}, ${whenClause(daysBetween(asOf, firstDueOn))}.`
            : null}
        </p>
      )}

      {handled.length > 0 ? (
        <ul className={styles.handledList}>
          {handled.map((trace) => {
            const meta = TRACE_META[trace.kind];
            const who = nameOf[trace.accountId];
            return (
              <li key={trace.id} className={styles.handledRow}>
                <span className={styles.handledMark} aria-hidden="true">
                  ✕
                </span>
                <span className={styles.handledLabel}>Done</span>
                <span className={styles.handledWhat}>
                  {meta.label}, {who?.name ?? trace.accountId}
                </span>
                <button
                  type="button"
                  className={styles.handledUndo}
                  onClick={() => putBack(trace)}
                >
                  Put back
                  <span className="visually-hidden">
                    , {meta.label}, {who?.name ?? trace.accountId}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {dueElsewhere.length > 0 ? (
        <ul className={styles.refList}>
          {dueElsewhere.map((trace) => {
            const meta = TRACE_META[trace.kind];
            const who = nameOf[trace.accountId];
            return (
              <li key={trace.id} className={styles.refRow}>
                <span className={styles.refGlyph} aria-hidden="true">
                  {meta.glyph}
                </span>
                <span className={styles.refLabel}>{meta.label}</span>
                <span className={styles.refName}>
                  {who?.name ?? trace.accountId}
                </span>
                <span className={`${styles.refWhen} num`}>
                  {formatDate(trace.on)}
                </span>
                <span className={styles.refOwner}>{meta.ownerRole} owns this</span>
              </li>
            );
          })}
        </ul>
      ) : null}

      {ahead.length > 0 ? (
        <ol className={styles.aheadList}>
          {ahead.map((trace) => {
            const meta = TRACE_META[trace.kind];
            const who = nameOf[trace.accountId];
            return (
              <li key={trace.id} className={styles.aheadRow}>
                <span className={styles.aheadGlyph} aria-hidden="true">
                  {meta.glyph}
                </span>
                <span className={styles.aheadLabel}>{meta.label}</span>
                <span className={styles.aheadName}>
                  {who?.name ?? trace.accountId}
                </span>
                <span className={`${styles.aheadWhen} num`}>
                  {formatDate(trace.on)}
                </span>
                <span className={styles.aheadAway}>
                  {whenClause(trace.daysAway)}
                </span>
              </li>
            );
          })}
        </ol>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------
// The four figures
// ---------------------------------------------------------------

/**
 * A TILE THAT NARROWS ON THE UNION BEFORE IT REACHES A NUMBER.
 *
 * `AccountFigure` is a discriminated union rather than a nullable
 * number, which means a screen cannot print a percentage without first
 * admitting whether there is a denominator. Nought per cent on the day
 * the board opens would be a claim that every window was missed. The
 * honest reading is the word, the reason and the date the figure first
 * has something under the line, and that reading is the argument rather
 * than an apology for the absence of one.
 */
function MetricTile({ metric, asOf }: { metric: AccountMetric; asOf: string }) {
  const measurable = metric.figure.kind === "measured";

  return (
    <article className={styles.tile} data-state={measurable ? "measured" : "waiting"}>
      <h3 className={styles.tileLabel}>{metric.label}</h3>
      <p className={styles.tileFormula}>{metric.formula}</p>

      {metric.figure.kind === "measured" ? (
        <>
          <p className={styles.tileValue}>
            <span className="num">{bigOf(metric)}</span>
          </p>
          <p className={styles.tileSub}>{subOf(metric)}</p>
        </>
      ) : (
        <>
          <p className={styles.tileWaiting}>
            <span aria-hidden="true" className={styles.tileWaitGlyph}>
              ○
            </span>
            Not measurable yet
          </p>
          <p className={styles.tileBecause}>{cap(metric.figure.because)}.</p>
          {metric.firstReadsOn ? (
            <p className={styles.tileFirst}>
              First reads{" "}
              <strong className="num">{formatDate(metric.firstReadsOn)}</strong>,{" "}
              {whenClause(daysBetween(asOf, metric.firstReadsOn))}
            </p>
          ) : null}
        </>
      )}

      <p className={styles.tileNote}>{metric.firstReadsNote}</p>

      <p className={styles.tileProv} title={metric.source}>
        <ProvenanceBadge provenance={metric.provenance} compact />
        <span>{metric.source}</span>
      </p>

      {metric.id === "revenue-retained" ? (
        <p className={styles.tileLedger}>
          The same book money down a second axis. Not a third ledger, and never
          added to one.
        </p>
      ) : null}
    </article>
  );
}

function bigOf(metric: AccountMetric): string {
  if (metric.figure.kind !== "measured") return "";
  const figure = metric.figure;
  if (metric.unit === "share") return `${Math.round(figure.value * 100)}%`;
  if (metric.id === "accounts-on-cycle") {
    return `${figure.numerator} of ${figure.denominator}`;
  }
  return figure.value.toFixed(1);
}

/**
 * The two halves of the fraction, in the units they are actually in.
 *
 * Events per account is the one that cannot take an "n of m", because
 * the numerator counts events and the denominator counts organisations,
 * and "2 of 2" would quietly claim they were the same kind of thing.
 */
function subOf(metric: AccountMetric): ReactNode {
  if (metric.figure.kind !== "measured") return null;
  const figure = metric.figure;
  switch (metric.id) {
    case "rebooking-rate":
      return (
        <>
          <span className="num">{figure.numerator}</span> of{" "}
          <span className="num">{figure.denominator}</span> windows closed
          carried a signature
        </>
      );
    case "accounts-on-cycle":
      return (
        <>
          <span className="num">{figure.numerator}</span> of{" "}
          <span className="num">{figure.denominator}</span> live accounts are
          inside their own cycle
        </>
      );
    case "revenue-retained":
      return (
        <>
          <span className="num">{money(figure.numerator)}</span> back of{" "}
          <span className="num">{money(figure.denominator)}</span> spent then
        </>
      );
    default:
      return (
        <>
          <span className="num">{figure.numerator}</span> events delivered from{" "}
          <span className="num">{figure.denominator}</span> accounts
        </>
      );
  }
}

// ---------------------------------------------------------------
// The twelve month clock
// ---------------------------------------------------------------

interface AxisMonth {
  key: string;
  label: string;
  year: number;
  leftPct: number;
  widthPct: number;
}

/**
 * FIVE BARS, TWO CONTRACTS, NOTHING TYPED.
 *
 * The element that makes this board non empty on day one. Each bar runs
 * from the day the window opens to the day it closes, with a mark at the
 * occasion itself and a mark at any event the same account has already
 * signed. That second mark is what draws the conflict: the Heights
 * Christian bar stops six days short of an event that is already in the
 * book.
 *
 * THE DRAWING IS THE SECOND READING, NEVER THE ONLY ONE. Every date on
 * every bar is printed as words beside it, the bars are hidden from
 * assistive technology, and below a phone width the plot is removed
 * rather than squeezed. A reader on a 380px screen loses a picture and
 * keeps every fact.
 */
function MonthClock({
  rows,
  accountLines,
  asOf,
}: {
  rows: ClockRow[];
  accountLines: AccountRow[];
  asOf: string;
}) {
  const linesByAccount = useMemo(() => {
    const out: Record<string, BookLine[]> = {};
    for (const row of accountLines) out[row.account.id] = row.lines;
    return out;
  }, [accountLines]);

  /* The account id happens to equal the prospect id in the seed, and
     resolving it rather than relying on that is the difference between a
     name that opens a record and one that opens nothing the day somebody
     gives an account its own identifier. */
  const prospectByAccount = useMemo(() => {
    const out: Record<string, string> = {};
    for (const row of accountLines) out[row.account.id] = row.account.prospectId;
    return out;
  }, [accountLines]);

  const span = useMemo(() => {
    const dates: string[] = [asOf];
    for (const row of rows) {
      dates.push(row.window.opensOn, row.window.closesOn, row.window.occasionDate);
      const lines = linesByAccount[row.accountId] ?? [];
      for (const line of lines) dates.push(line.eventDate);
    }
    dates.sort();
    const firstIso = dates[0] ?? asOf;
    const lastIso = dates[dates.length - 1] ?? asOf;
    const first = partsOf(firstIso) ?? { year: 2026, month: 1, day: 1 };
    const last = partsOf(lastIso) ?? { year: 2027, month: 12, day: 31 };
    const start = isoOf(first.year, first.month, 1);
    const end = isoOf(last.year, last.month, daysInMonth(last.year, last.month));
    return { start, end, days: Math.max(1, daysBetween(start, end)) };
  }, [rows, linesByAccount, asOf]);

  const pct = useMemo(
    () => (iso: string) =>
      Math.min(100, Math.max(0, (daysBetween(span.start, iso) / span.days) * 100)),
    [span],
  );

  const months = useMemo<AxisMonth[]>(() => {
    const out: AxisMonth[] = [];
    const first = partsOf(span.start);
    const last = partsOf(span.end);
    if (!first || !last) return out;
    let year = first.year;
    let month = first.month;
    for (let guard = 0; guard < 40; guard += 1) {
      const startsOn = isoOf(year, month, 1);
      const length = daysInMonth(year, month);
      out.push({
        key: `${year}-${month}`,
        label: MONTH_SHORT[month - 1] ?? "",
        year,
        leftPct: pct(startsOn),
        widthPct: (length / span.days) * 100,
      });
      if (year === last.year && month === last.month) break;
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }
    return out;
  }, [span, pct]);

  const todayPct = pct(asOf);

  return (
    <div className={styles.clock}>
      {/* The axis and every bar share one column definition, so a mark
          sits on the month its own row names. */}
      <div className={styles.plotHead} aria-hidden="true">
        <span />
        <div className={styles.axis}>
          {months.map((month, index) => (
            <span
              key={month.key}
              className={styles.axisMonth}
              data-year={index === 0 || month.label === "Jan" ? "yes" : "no"}
              style={{
                left: `${month.leftPct}%`,
                width: `${month.widthPct}%`,
              }}
            >
              <span className={styles.axisLabel}>{month.label}</span>
              {index === 0 || month.label === "Jan" ? (
                <span className={`${styles.axisYear} num`}>{month.year}</span>
              ) : null}
            </span>
          ))}
          <span className={styles.todayFlag} style={{ left: `${todayPct}%` }}>
            Today
          </span>
        </div>
      </div>

      <ol className={styles.clockRows}>
        {rows.map((row) => {
          const opens = pct(row.window.opensOn);
          const closes = pct(row.window.closesOn);
          const lines = linesByAccount[row.accountId] ?? [];
          return (
            <li
              key={row.occasionId}
              className={styles.clockItem}
              data-conflict={row.conflicts.length > 0 ? "yes" : "no"}
            >
              <div className={styles.clockText}>
                <p className={styles.clockName}>
                  <RecordName
                    prospectId={prospectByAccount[row.accountId] ?? row.accountId}
                    name={row.accountName}
                    className={styles.clockNameText}
                  />
                  <span className={styles.clockOcc}>{row.occasionLabel}</span>
                  {row.window.open ? (
                    <span className={styles.clockOpenNow}>
                      <span aria-hidden="true">◠</span> Window open
                    </span>
                  ) : null}
                  {row.conflicts.length > 0 ? (
                    <span className={styles.clockConflict}>
                      <span aria-hidden="true">◤</span> Conflict
                    </span>
                  ) : null}
                </p>
                <p className={styles.clockDates}>
                  <span>
                    Opens{" "}
                    <strong className="num">
                      {formatDate(row.window.opensOn)}
                    </strong>
                  </span>
                  <span>
                    Closes{" "}
                    <strong className="num">
                      {formatDate(row.window.closesOn)}
                    </strong>
                  </span>
                  <span>
                    Occasion{" "}
                    <strong className="num">
                      {formatDate(row.window.occasionDate)}
                    </strong>
                  </span>
                </p>
                <p className={styles.clockLead}>
                  {SEGMENT_PROFILE[row.segment].label}. Opens{" "}
                  <span className="num">{row.planningLeadDays}</span> days
                  before, closes{" "}
                  <span className="num">{row.commitLeadDays}</span> days before.
                  Cycle <span className="num">{row.cycleDays}</span> days,{" "}
                  {row.cycleProvenance}.
                </p>
              </div>

              <div className={styles.trackCell} aria-hidden="true">
                <span className={styles.barRow}>
                  <span
                    className={styles.bar}
                    data-open={row.window.open ? "yes" : "no"}
                    data-conflict={row.conflicts.length > 0 ? "yes" : "no"}
                    style={{
                      left: `${opens}%`,
                      width: `${Math.max(0.6, closes - opens)}%`,
                    }}
                  />
                  <span
                    className={styles.occasionMark}
                    style={{ left: `${pct(row.window.occasionDate)}%` }}
                  />
                  {lines.map((line) => (
                    <span
                      key={line.id}
                      className={styles.eventMark}
                      style={{ left: `${pct(line.eventDate)}%` }}
                    />
                  ))}
                  <span
                    className={styles.todayLine}
                    style={{ left: `${todayPct}%` }}
                  />
                </span>
              </div>
            </li>
          );
        })}
      </ol>

      <ul className={styles.legend}>
        <li>
          <span className={styles.legendBar} aria-hidden="true" /> Window open to
          close
        </li>
        <li>
          <span className={styles.legendOcc} aria-hidden="true" /> The occasion
          itself
        </li>
        <li>
          <span className={styles.legendEvent} aria-hidden="true" /> An event
          already signed
        </li>
        <li>
          <span className={styles.legendToday} aria-hidden="true" /> Today,{" "}
          {formatDate(asOf)}
        </li>
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------
// The account card
// ---------------------------------------------------------------

/**
 * ONE ORGANISATION, TWO HEALTH READINGS, AND THE READER COMBINES THEM.
 *
 * Days since anybody spoke to them is the supplier register's arithmetic
 * unchanged. Days since they last bought is that same arithmetic divided
 * by this account's own cycle, because an absolute day count reads gone
 * quiet for eight months of a perfectly healthy school year and then
 * reads gone quiet again on the day the relationship actually breaks.
 * The two are never blended into one score: Heights Christian's contact
 * would have painted this card amber on the morning of the first event
 * this venue ever delivers, for a reason that has nothing to do with
 * delivery.
 */
function AccountCard({ row, asOf }: { row: AccountRow; asOf: string }) {
  const state = ACCOUNT_STATE_META[row.state];
  const contact = row.contact;
  const purchase = row.purchase;

  return (
    <article className={styles.card} data-state={row.state}>
      <header className={styles.cardHead}>
        <h3 className={styles.cardTitle}>
          <RecordName
            prospectId={row.account.prospectId}
            name={row.prospect?.name}
            className={styles.cardName}
          />
        </h3>
        <TokenMark token={state} />
        <p className={styles.cardBecause}>{cap(row.stateBecause)}.</p>
      </header>

      <dl className={styles.health}>
        <div className={styles.healthCell}>
          <dt>Last contact</dt>
          <dd>
            {contact.days === null || contact.staleness === null ? (
              <span className={styles.none}>
                {cap(contact.because ?? "no correspondence recorded")}
              </span>
            ) : (
              <>
                <span className="num">{contact.days}</span>{" "}
                {contact.days === 1 ? "day" : "days"}
                <span className={styles.healthSub}>
                  {contact.lastContactAt
                    ? formatDate(contact.lastContactAt)
                    : null}
                </span>
                <TokenMark token={STALENESS_META[contact.staleness]} small />
              </>
            )}
          </dd>
        </div>

        <div className={styles.healthCell}>
          <dt>Purchase recency</dt>
          <dd>
            {purchase.kind === "not-yet-delivered" ? (
              <>
                <span className={styles.none}>{cap(purchase.because)}</span>
                {purchase.firstReadsOn ? (
                  <span className={styles.healthSub}>
                    First reads{" "}
                    <span className="num">{formatDate(purchase.firstReadsOn)}</span>
                  </span>
                ) : null}
                <TokenMark token={CYCLE_STATE_META["not-yet-delivered"]} small />
              </>
            ) : (
              <>
                <span className="num">{purchase.daysSinceLast}</span> days since{" "}
                <span className="num">
                  {formatDate(purchase.lastDeliveredOn)}
                </span>
                <span className={styles.healthSub}>
                  <span className="num">
                    {purchase.overdueRatio.toFixed(2)}
                  </span>{" "}
                  of a <span className="num">{purchase.cycleDays}</span> day
                  cycle, {purchase.cycleProvenance}
                </span>
                <TokenMark token={CYCLE_STATE_META[purchase.cycleState]} small />
              </>
            )}
          </dd>
        </div>

        <div className={styles.healthCell}>
          <dt>Missed windows</dt>
          <dd>
            <span className="num">{row.missedWindows.length}</span>
            <span className={styles.healthSub}>
              {row.missedWindows.length === 0
                ? "None closed empty since the last delivery"
                : row.missedWindows
                    .map((w) => `${w.occasionLabel}, ${formatDate(w.closedOn)}`)
                    .join(". ")}
            </span>
          </dd>
        </div>

        <div className={styles.healthCell}>
          <dt>Balance</dt>
          <dd title={row.account.balanceBasis}>
            {row.account.balanceState === "not-applicable"
              ? "Not applicable"
              : cap(row.account.balanceState)}
            <span className={styles.healthSub}>
              Finance owns this. An unpaid balance blocks a rebooking ask.
            </span>
          </dd>
        </div>

        <div className={styles.healthCell}>
          <dt>Owner</dt>
          <dd>
            {row.account.ownerRole}
            <span className={styles.healthSub}>
              Institutional anchor: {row.account.anchorTitle}
            </span>
          </dd>
        </div>

        <div className={styles.healthCell}>
          <dt>Signed</dt>
          <dd>
            {row.signedOn ? (
              <span className="num">{formatDate(row.signedOn)}</span>
            ) : (
              <span className={styles.none}>No signature date recorded</span>
            )}
            <span className={styles.healthSub}>
              {SEGMENT_PROFILE[row.account.segment].label}
            </span>
          </dd>
        </div>
      </dl>

      <h4 className={styles.cardSub}>Contracted</h4>
      <ul className={styles.lines}>
        {row.lines.map((line) => (
          <li key={line.id} className={styles.line}>
            <span className={`${styles.lineDate} num`}>
              {formatDate(line.eventDate)}
            </span>
            <span className={styles.lineAway}>
              {whenClause(daysBetween(asOf, line.eventDate))}
            </span>
            <span className={`${styles.lineValue} num`}>
              {money(line.guests * line.pricePerGuest)}
            </span>
            <ProvenanceBadge provenance={line.pricePerGuestProvenance} compact />
            <span className={styles.lineDetail}>
              <span className="num">{line.guests}</span> guests at{" "}
              <span className="num">${line.pricePerGuest}</span>,{" "}
              <span className="num">{line.lanesHeld}</span> lanes held,{" "}
              <span className="num">{line.depositPercent}%</span> deposit
            </span>
          </li>
        ))}
      </ul>
      <p className={styles.lineFoot}>
        The same money the book already counts. It is on this card because an
        account is a second axis over the same ledger, not a second ledger.
      </p>

      <h4 className={styles.cardSub}>Occasions</h4>
      <ul className={styles.occasions}>
        {row.occasions.map((occasion) => (
          <li key={occasion.occasion.id} className={styles.occasion}>
            <span className={styles.occLabel}>{occasion.occasion.label}</span>
            <span className={styles.occWindow}>
              Opens{" "}
              <strong className="num">
                {formatDate(occasion.window.opensOn)}
              </strong>
              , closes{" "}
              <strong className="num">
                {formatDate(occasion.window.closesOn)}
              </strong>
            </span>
            <span className={styles.occNext}>
              Occasion{" "}
              <strong className="num">
                {formatDate(occasion.window.occasionDate)}
              </strong>
              , {whenClause(daysBetween(asOf, occasion.window.occasionDate))}
            </span>
            <span className={styles.occCycle} title={occasion.occasion.anchorBasis}>
              <ProvenanceBadge provenance="modeled" compact />
              <span className="num">{occasion.occasion.cycleDays}</span> day
              cycle, {occasion.occasion.cycleProvenance}, from{" "}
              {occasion.occasion.cycleBasis}
            </span>
          </li>
        ))}
        {row.occasions.length === 0 ? (
          <li className={styles.occasion}>
            <span className={styles.none}>
              {cap(row.noCycleBecause ?? "no cycle could be read")}
            </span>
          </li>
        ) : null}
      </ul>

      <h4 className={styles.cardSub}>The five traces on the contract</h4>
      <ul className={styles.traces}>
        {row.traces.map((trace) => (
          <li
            key={trace.id}
            className={styles.trace}
            data-due={trace.due ? "yes" : "no"}
          >
            <span className={styles.traceGlyph} aria-hidden="true">
              {TRACE_META[trace.kind].glyph}
            </span>
            <span className={styles.traceLabel}>{TRACE_META[trace.kind].label}</span>
            <span className={`${styles.traceWhen} num`}>
              {formatDate(trace.on)}
            </span>
            <span className={styles.traceAway}>{whenClause(trace.daysAway)}</span>
            <span className={styles.traceOwner}>
              {TRACE_META[trace.kind].ownerRole}
            </span>
            <span className={styles.traceNote}>{TRACE_META[trace.kind].note}</span>
          </li>
        ))}
      </ul>

      <p className={styles.cardFoot} title={row.account.segmentBasis}>
        <ProvenanceBadge
          provenance={row.account.provenance.segment ?? "modeled"}
          compact
        />
        <span>{row.account.segmentBasis}</span>
      </p>
    </article>
  );
}
