import { groupProfile, NO_GROUP_PROFILE } from "@/domain/booking";
import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import type {
  ActivityLine,
  ActivityType,
  Lane,
  PitchStatus,
  Prospect,
} from "@/domain/types";
import { DOOR_ONLY, PROSPECT_BY_ID, PROSPECTS } from "@/data/prospects";
import { SEED_ACTIVITY } from "@/data/book";
import { ACTING_SEAT_ID, seatLabel } from "@/data/seats";
import { PERIODS, PERIOD_BY_ID } from "@/data/venue";
import { LANE_META, LANE_ORDER } from "@/domain/lanes";
import { ACTIVITY_TYPE, ACTIVITY_TYPE_ORDER, LEDGER } from "@/domain/vocabulary";
import { activityTotals, useBook, useBookDispatch } from "@/state/BookProvider";
import {
  furthestStatus,
  touchesFor,
  usePipeline,
  usePipelineDispatch,
} from "@/state/PipelineProvider";
import { milesFromVenue } from "@/domain/selectors/desk";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { LaneChip } from "@/components/primitives/LaneChip";
import {
  EmailConfidenceChip,
  StatusChip,
  TokenChip,
} from "@/components/primitives/StatusChip";
import { Button } from "@/components/primitives/Button";
import { RecordName } from "@/components/record/RecordName";
import styles from "./FieldPage.module.css";

/**
 * THE FIELD.
 *
 * This page is the half of local marketing that does not happen in an ad
 * account. The Champions Group Marketing Manager posting for the West
 * Division opens with it:
 *
 *   "Lead and execute local marketing initiatives focused on demand
 *    generation, campaign execution, operational alignment, and brand
 *    growth."
 *
 * Every other screen in this console is a way of deciding what to do.
 * This one is the doing, and for a home services brand in a defined
 * territory the doing is a home show hall, an HOA board meeting, a
 * property management association chapter, an employer benefits fair and
 * a management office with a counter and no published inbox. It is the
 * cheapest lead source in the portfolio and the one nobody can copy by
 * raising a bid.
 *
 * THE COMMUNITY WORK IS ALREADY REAL AND IT IS ALREADY PUBLISHED, which
 * is why this page argues from it rather than inventing a programme.
 * Service Champions publishes a Make-A-Wish Orange County and Inland
 * Empire partnership and states it has raised more than 160,000 dollars
 * since 2014, with a top-level navigation slot of its own. ASI publishes
 * San Diego State Athletics and San Diego Padres partnerships and an
 * American Lung Association donation tied to every indoor air quality
 * install. That is a standing invitation into rooms this page plans
 * shifts in, and it is under-used against the paid channels.
 *
 * ---------------------------------------------------------------
 * THE THREE SECTIONS ARE THREE DIFFERENT ARGUMENTS
 * ---------------------------------------------------------------
 *
 * THE GO-SEE RUN is the argument from necessity. Every organisation in
 * it publishes no email address anywhere on their own website. Not a
 * hard one to find, none at all. They cannot be reached in writing,
 * cannot be reached by a sequence, and cannot be reached by anything a
 * person does sitting down. The size of the run is read off the data on
 * every line that states it, because the board grew across three
 * research passes and any figure typed into this prose would have been
 * wrong the same afternoon. They are sorted by straight-line distance
 * from 625 Columbia Street because that is literally the order somebody
 * drives them, and the distance is on every row so a reader can see what
 * an afternoon costs.
 *
 * TABLING is the argument from geography. Brea's employer base is
 * concentrated on a handful of streets, and the Kraemer Boulevard block
 * below is the clearest case of it in the whole data set: two of the
 * city's largest single-site employers, a few hundred feet apart. One
 * table, one lunch hour, both of them, and an employee home services
 * offer put in front of a few thousand households through two
 * relationships instead of a few thousand impressions. A call block does
 * not reproduce that afternoon at any price.
 *
 * THE HOURS LEDGER is the argument against this page. Hours are finite
 * and a plan that fills them with the comfortable kind of work has
 * quietly decided to do the job from a chair. So the ledger splits the
 * period's hours into the ones spent in the field and the ones spent at
 * a desk, and it does not congratulate anybody for the total.
 *
 * ---------------------------------------------------------------
 * WHAT THIS PAGE REFUSES TO DO
 * ---------------------------------------------------------------
 * It carries no revenue figure, anywhere, for the same reason the week
 * sheet does not: ActivityLine has no revenue field, the two ledgers live
 * in separate arrays in BookProvider, and a field report with a dollar
 * total on it is the exact document where hours in the field get dressed
 * up as results. Twelve go-sees is twelve go-sees. If one of them turned
 * into work there is a BookLine, and the money is on /book.
 *
 * Nothing here invents a Champions fact. The branch address and phone
 * number are the published ones; every organisation's address, phone
 * number and coordinates came out of Google Places on 11 August 2026.
 */

// ---------------------------------------------------------------
// Time
// ---------------------------------------------------------------

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * ISO date strings are split, never parsed.
 *
 * `new Date("2026-09-21")` is midnight UTC, and formatting that in
 * California prints the twentieth. A field plan that names the wrong
 * Monday sends somebody to a lobby on the wrong day, so these strings are
 * treated as the calendar labels they are and never routed through a
 * timezone.
 */
function parts(iso: string): [number, number, number] {
  const [y, m, d] = iso.split("-").map(Number);
  return [y || 0, m || 1, d || 1];
}

function formatDay(iso: string): string {
  const [, m, d] = parts(iso);
  return `${d} ${MONTHS_SHORT[m - 1]}`;
}

function formatWeek(iso: string): string {
  const [y, m, d] = parts(iso);
  return `Week commencing ${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

/**
 * Every Monday inside a period, as week-commencing ISO strings.
 *
 * The arithmetic is done in UTC and only in UTC. A loop that adds seven
 * days to a local Date walks straight into the November clock change and
 * produces a Sunday, which would file a week's work against a week that
 * does not exist in the plan.
 */
function weeksIn(startIso: string, endIso: string): string[] {
  const [sy, sm, sd] = parts(startIso);
  const [ey, em, ed] = parts(endIso);
  const end = Date.UTC(ey, em - 1, ed);
  const out: string[] = [];
  for (
    let cursor = Date.UTC(sy, sm - 1, sd);
    cursor <= end;
    cursor += 7 * 86400000
  ) {
    out.push(new Date(cursor).toISOString().slice(0, 10));
  }
  return out;
}

/**
 * The date stamped on a visit recorded here.
 *
 * Read once at module load rather than per click, so a page left open
 * through an afternoon does not stamp two visits in two different ways.
 * A visit is a user action in real time, which is the one thing on this
 * screen that legitimately belongs to the clock rather than to the period
 * selector in the chrome.
 */
const TODAY = new Date().toISOString().slice(0, 10);

const hoursLabel = (n: number) => (n % 1 === 0 ? String(n) : n.toFixed(2).replace(/0$/, ""));

// ---------------------------------------------------------------
// Distance
// ---------------------------------------------------------------

/**
 * Straight-line miles between two published coordinates.
 *
 * `milesFromVenue` in the desk selector answers the question this app
 * asks a hundred times, which is how far an organisation is from the
 * Brea branch. This answers a different one that only the tabling
 * section needs: how far two of them are from EACH OTHER. That is the
 * whole Kraemer Boulevard argument reduced to a number, and it is
 * computed from the two Google Places coordinates rather than asserted,
 * so a reader who doubts it can check both rows on the territory map.
 *
 * It is straight line and it is called that everywhere it is shown.
 * Nothing in this app claims a drive time it has not measured.
 */
function milesBetween(a: Prospect, b: Prospect): number {
  const R = 3958.8;
  const p1 = (a.lat * Math.PI) / 180;
  const p2 = (b.lat * Math.PI) / 180;
  const dp = ((b.lat - a.lat) * Math.PI) / 180;
  const dl = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const feet = (miles: number) => Math.round((miles * 5280) / 10) * 10;

// ---------------------------------------------------------------
// Which work counts as being in the field
// ---------------------------------------------------------------

function probe(type: ActivityType): ActivityLine {
  return {
    id: `probe-${type}`,
    ledger: "outbound-activity",
    type,
    locationLabel: "",
    week: "1970-01-01",
    hours: 1,
    targetConversations: 0,
    seatId: ACTING_SEAT_ID,
    laneFocus: [],
    sortOrder: 0,
  };
}

/**
 * WHICH KINDS OF WORK COUNT AS BEING IN THE FIELD.
 *
 * This page could simply restate the list. It deliberately does not,
 * because a second copy of that list is a second opinion: the day
 * somebody adds a seventh activity type, one copy learns about it and the
 * other does not, and this ledger quietly stops agreeing with the Book
 * page about the same period. That class of bug never crashes. It just
 * makes two screens disagree in front of the one reader who was checking.
 *
 * So the question is ASKED of BookProvider rather than answered here. One
 * probe line of one hour per type goes in, and whatever comes back in
 * `outsideHours` is the answer. It costs six objects at module load and
 * it cannot drift.
 *
 * The result is worth knowing before you read the table: a BRANCH AND
 * RIDE-ALONG does not count. A morning in dispatch is real work and it
 * is the fastest way to learn what the crew can actually deliver, but it
 * happens at our own address, and an hour spent there is not an hour
 * spent in front of a household or a partner.
 */
const OUTSIDE_TYPES = new Set<ActivityType>(
  ACTIVITY_TYPE_ORDER.filter((t) => activityTotals([probe(t)]).outsideHours === 1),
);

/**
 * The share of planned hours this console holds itself to spending in
 * the field.
 *
 * ILLUSTRATIVE, AND IT IS THIS CONSOLE'S BAR RATHER THAN THE COMPANY'S.
 * Champions publishes no such target and this file does not pretend
 * otherwise. Seventy percent is set where it is because local marketing
 * that never leaves an ad account is indistinguishable from the last
 * agency's, and because a target you can hit while sitting down is not a
 * target, it is a total.
 */
const OUTSIDE_SHARE_FLOOR = 0.7;

/**
 * Hours booked against a single recorded go-see.
 *
 * A stop is a drive, a wait at a front counter and a conversation, and
 * three quarters of an hour is what that costs on average across a run
 * of door-only organisations inside this territory. It is a planning
 * figure, not a stopwatch, it renders with a modeled badge everywhere it
 * appears, and the assumption is printed beside it rather than buried
 * here.
 */
const GO_SEE_HOURS = 0.75;

/**
 * How far the run reaches, read off the data rather than typed.
 *
 * The sentence under the visit form describes what the figure above was
 * averaged over, and that description used to carry two written-out
 * numbers. Both went stale the moment the board grew, which is the same
 * failure the desk's opening sentence had. Deriving it means the prose
 * cannot disagree with the list sitting directly above it.
 */
const RUN_FURTHEST_MILES = DOOR_ONLY.reduce(
  (furthest, p) => Math.max(furthest, milesFromVenue(p.lat, p.lng)),
  0,
);

const SEED_IDS = new Set(SEED_ACTIVITY.map((l) => l.id));

// ---------------------------------------------------------------
// The Kraemer Boulevard block
// ---------------------------------------------------------------

/**
 * The two organisations the tabling argument is built on.
 *
 * They are looked up by id rather than hardcoded as prose, so that if
 * either row ever leaves the prospect file this section disappears
 * instead of quietly asserting an address nobody can check.
 */
const KRAEMER_IDS = ["beckman-coulter-inc", "envista-world-headquarters"];

// ---------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------

function Kpi({
  value,
  unit,
  label,
  note,
  provenance,
}: {
  value: string | number;
  unit?: string;
  label: string;
  note: string;
  provenance: "public" | "illustrative" | "modeled";
}) {
  /* The note is a fact about the figure, so it moves to the tooltip and the
     accessibility tree rather than being deleted. */
  return (
    <div className={styles.kpi} title={note}>
      <span className={`${styles.kpiValue} num`}>
        {value}
        {unit ? <span className={styles.kpiUnit}>{unit}</span> : null}
      </span>
      <span className={styles.kpiLabel}>{label}</span>
      <span className="visually-hidden">{note}</span>
      <ProvenanceBadge provenance={provenance} compact />
    </div>
  );
}

interface StopProps {
  prospect: Prospect;
  index: number;
  miles: number;
  visits: ActivityLine[];
  touches: number;
  status: PitchStatus;
  open: boolean;
  weeks: string[];
  onToggle: () => void;
  onRecord: (week: string, found: string) => void;
}

/**
 * One stop on the run.
 *
 * The row leads with the distance and the address rather than the name,
 * because a person reading this has already decided to go and is now
 * deciding in what order. The decision maker title is a TITLE. There is
 * not one invented human name anywhere in this application, and asking a
 * receptionist for the practice manager works considerably better than
 * asking for somebody who does not exist.
 */
function Stop({
  prospect: p,
  index,
  miles,
  visits,
  touches,
  status,
  open,
  weeks,
  onToggle,
  onRecord,
}: StopProps) {
  const [week, setWeek] = useState(weeks[0] ?? "");
  const [found, setFound] = useState("");
  const meta = LANE_META[p.lane];
  const done = visits.length > 0;

  return (
    <li className={styles.stop} data-done={done ? "yes" : "no"}>
      <div className={styles.stopHead}>
        <span className={`${styles.stopIndex} num`} aria-hidden="true">
          {index}
        </span>
        <div className={styles.stopTitle}>
          {/*
            The stop is a card, not a control, so the organisation's name
            is the only interactive thing on this line and nothing is
            nested inside anything.
          */}
          <h3 className={styles.stopName}>
            <RecordName prospectId={p.id} name={p.name} />
          </h3>
          <div className={styles.stopChips}>
            <LaneChip lane={p.lane} size="sm" />
            <StatusChip status={status} size="sm" short />
          </div>
        </div>
        <span className={styles.stopMiles}>
          <span className={`${styles.stopMilesValue} num`}>
            {miles.toFixed(1)}
          </span>
          <span className={styles.stopMilesUnit}>
            straight-line miles from the branch
          </span>
        </span>
      </div>

      <dl className={styles.stopFacts}>
        <div className={styles.stopFact}>
          <dt>Ask for</dt>
          <dd>{p.decisionMakerTitle}</dd>
        </div>
        <div className={styles.stopFact}>
          <dt>Address</dt>
          <dd>{p.address}</dd>
        </div>
        <div className={styles.stopFact}>
          <dt>Phone</dt>
          <dd className="num">
            {p.phone ?? "No phone number published for this organisation"}
          </dd>
        </div>
        <div className={styles.stopFact}>
          <dt>The way in</dt>
          <dd>{meta.doorName}</dd>
        </div>
      </dl>

      <p className={styles.stopWhy}>{p.whyTheyFit}</p>

      {done ? (
        <ul className={styles.visits}>
          {visits.map((v) => (
            <li key={v.id} className={styles.visit}>
              <span className={styles.visitHead}>
                <span aria-hidden="true">●</span>
                <span>
                  Visited, recorded {formatDay(v.completedAt ?? TODAY)}
                </span>
                <ProvenanceBadge provenance="observed" compact />
              </span>
              <p className={styles.visitNote}>
                {v.notes ??
                  "Recorded with nothing written against it, which is a visit nobody can learn from. The next one gets a sentence."}
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      <div className={styles.stopActions}>
        <Button
          variant={open ? "secondary" : "primary"}
          size="sm"
          glyph={ACTIVITY_TYPE["go-see"].glyph}
          onClick={onToggle}
          aria-expanded={open}
          aria-label={
            open
              ? `Close the visit form for ${p.name}`
              : `Record a visit to ${p.name}`
          }
        >
          {open ? "Close" : done ? "Record another visit" : "Record the visit"}
        </Button>
        <span className={styles.stopTouches}>
          <span className="num">{touches}</span>{" "}
          {touches === 1 ? "touch" : "touches"} against this organisation this
          period
        </span>
      </div>

      {open ? (
        <form
          className={styles.visitForm}
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            onRecord(week, found.trim());
            setFound("");
          }}
        >
          {/* The hours figure is drive, wait and conversation averaged
              across the run. A planning figure, not a stopwatch. */}
          <p
            className={styles.visitFormLede}
            title={`Averaged across the ${DOOR_ONLY.length} stops on this run, the furthest of which is ${RUN_FURTHEST_MILES.toFixed(1)} straight-line miles out. A planning figure rather than a stopwatch.`}
          >
            One touch on {p.name}, and{" "}
            <strong className="num">{GO_SEE_HOURS}</strong> hours in the
            outbound ledger <ProvenanceBadge provenance="modeled" compact />.
          </p>

          <div className={styles.visitField}>
            <label htmlFor={`week-${p.id}`}>File against</label>
            <select
              id={`week-${p.id}`}
              value={week}
              onChange={(e) => setWeek(e.target.value)}
            >
              {weeks.map((w) => (
                <option key={w} value={w}>
                  {formatWeek(w)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.visitField}>
            <label htmlFor={`found-${p.id}`}>What you found</label>
            <textarea
              id={`found-${p.id}`}
              rows={3}
              value={found}
              onChange={(e) => setFound(e.target.value)}
              placeholder="Who was at the desk, whether the title on this row is the right one, when they said to come back."
            />
            <span className={styles.visitHint}>
              Lands as an observed note, badged observed.
            </span>
          </div>

          <div className={styles.visitSubmit}>
            <Button type="submit" variant="primary" size="sm">
              Log the visit
            </Button>
            <span className={styles.visitStamp}>
              Stamped {formatDay(TODAY)}
            </span>
          </div>
        </form>
      ) : null}
    </li>
  );
}

function PlanLine({
  line,
  onComplete,
}: {
  line: ActivityLine;
  onComplete: () => void;
}) {
  const token = ACTIVITY_TYPE[line.type];
  const anchor = line.prospectId ? PROSPECT_BY_ID[line.prospectId] : undefined;

  return (
    <article className={styles.planLine}>
      <div className={styles.planHead}>
        <TokenChip token={token} size="sm" />
        <h3 className={styles.planWhere}>{line.locationLabel}</h3>
        <span className={styles.planHours}>
          <span className={`${styles.planHoursValue} num`}>
            {hoursLabel(line.hours)}
          </span>
          <span className={styles.planHoursUnit}>
            {line.hours === 1 ? "hour" : "hours"}
          </span>
        </span>
      </div>

      <dl className={styles.planFacts}>
        <div className={styles.planFact}>
          <dt>Week</dt>
          <dd>{formatWeek(line.week)}</dd>
        </div>
        <div className={styles.planFact}>
          <dt>Target conversations</dt>
          <dd>
            <span className="num">{line.targetConversations}</span>
            <ProvenanceBadge provenance="modeled" compact />
          </dd>
        </div>
        <div className={styles.planFact}>
          <dt>Owner</dt>
          <dd>{seatLabel(line.seatId)}</dd>
        </div>
        <div className={styles.planFact}>
          <dt>Service line focus</dt>
          <dd className={styles.planLanes}>
            {line.laneFocus.map((lane) => (
              <LaneChip key={lane} lane={lane} size="sm" />
            ))}
          </dd>
        </div>
      </dl>

      {line.notes ? (
        <blockquote className={styles.planWhy}>
          <span className={styles.planWhyLabel}>Why this location</span>
          <p>{line.notes}</p>
        </blockquote>
      ) : (
        <p className={styles.planNoWhy}>
          No reasoning written against this shift.
        </p>
      )}

      {anchor ? (
        <p className={styles.planAnchor}>
          Anchored on {anchor.name}, {anchor.address}. Ask for the{" "}
          {anchor.decisionMakerTitle.toLowerCase()}.
        </p>
      ) : null}

      <div className={styles.planFoot}>
        {line.completedAt ? (
          <span className={styles.planDone}>
            <span aria-hidden="true">●</span>
            <span>Completed {formatDay(line.completedAt)}</span>
          </span>
        ) : (
          <>
            <span className={styles.planPlanned}>
              <span aria-hidden="true">○</span>
              <span>Planned</span>
            </span>
            <Button
              size="sm"
              onClick={onComplete}
              aria-label={`Mark the shift at ${line.locationLabel} as done`}
            >
              Mark this shift done
            </Button>
          </>
        )}
      </div>
    </article>
  );
}

// ---------------------------------------------------------------
// The page
// ---------------------------------------------------------------

export function FieldPage() {
  const pipeline = usePipeline();
  const pipelineDispatch = usePipelineDispatch();
  const book = useBook();
  const bookDispatch = useBookDispatch();

  const period = PERIOD_BY_ID[pipeline.periodId] ?? PERIODS[0];
  const weeks = useMemo(
    () => weeksIn(period.startDate, period.endDate),
    [period.startDate, period.endDate],
  );

  const [openStopId, setOpenStopId] = useState<string | null>(null);

  /**
   * What the last recorded visit did, as a sentence.
   *
   * Logging a visit closes the form, adds a line to the row, moves the
   * organisation off unworked and changes three of the four figures in
   * the strip at the top of this page, and none of that navigates. A
   * reader who cannot see the screen was given no confirmation that the
   * button had done anything at all. The tabling form below already
   * answers in a polite status region and this is the same pattern
   * carried to the counts, not a new one.
   */
  const [visitDone, setVisitDone] = useState<string | null>(null);

  /* The run. Sorted by straight-line distance from 625 Columbia Street,
     which is the order somebody actually drives them, and nothing else.
     Not by size, not by priority: every organisation in this list costs
     the same trip, so the only sensible ordering is the cheap one. */
  const run = useMemo(
    () =>
      DOOR_ONLY.map((p) => ({ prospect: p, miles: milesFromVenue(p.lat, p.lng) }))
        .sort((a, b) => a.miles - b.miles),
    [],
  );

  const periodLines = useMemo(
    () =>
      book.activity
        .filter((l) => l.week >= period.startDate && l.week <= period.endDate)
        .sort((a, b) => a.week.localeCompare(b.week)),
    [book.activity, period.startDate, period.endDate],
  );

  const tablingLines = periodLines.filter(
    (l) => l.type === "tabling" || l.type === "networking-event",
  );

  const totals = activityTotals(periodLines);
  const deskHours = totals.hours - totals.outsideHours;
  const outsideShare = totals.hours > 0 ? totals.outsideHours / totals.hours : 0;
  const typedHours = periodLines
    .filter((l) => !SEED_IDS.has(l.id))
    .reduce((n, l) => n + l.hours, 0);

  const hoursByType = ACTIVITY_TYPE_ORDER.map((type) => ({
    type,
    hours: periodLines
      .filter((l) => l.type === type)
      .reduce((n, l) => n + l.hours, 0),
  }));

  const kraemer = KRAEMER_IDS.map((id) => PROSPECT_BY_ID[id]).filter(
    (p): p is Prospect => Boolean(p),
  );
  const kraemerGap =
    kraemer.length === 2 ? milesBetween(kraemer[0], kraemer[1]) : null;
  const kraemerReply = book.replies.find((r) => r.prospectId === kraemer[0]?.id);

  // ---- the new activity form ----------------------------------
  const [formType, setFormType] = useState<ActivityType>("tabling");
  const [formWhere, setFormWhere] = useState("");
  const [formWeek, setFormWeek] = useState(weeks[0] ?? "");
  const [formHours, setFormHours] = useState("3");
  const [formTargets, setFormTargets] = useState("12");
  const [formLanes, setFormLanes] = useState<Lane[]>(["multi-service"]);
  const [formError, setFormError] = useState<string | null>(null);
  const [formDone, setFormDone] = useState<string | null>(null);

  /* The selected week is validated against the period rather than
     trusted, because the period selector lives in the chrome and can move
     underneath this form. A shift filed against a week outside the period
     would land in the ledger and vanish from the table above it, which
     looks exactly like the app losing the entry. */
  const activeWeek = weeks.includes(formWeek) ? formWeek : weeks[0] ?? "";

  function submitActivity(e: FormEvent) {
    e.preventDefault();
    const hours = Number(formHours);
    const targets = Number(formTargets);

    /* Validation says what is wrong in a sentence and never by turning a
       border red. The owner of this site is colourblind, and a form that
       signals a fault with a hue has told him nothing. */
    if (!formWhere.trim()) {
      setFormError("Give the shift a location. A plan that says nothing about where the work happens cannot be driven to.");
      return;
    }
    if (!Number.isFinite(hours) || hours <= 0) {
      setFormError("Hours has to be a positive number. A shift of zero hours is not a shift.");
      return;
    }
    if (!Number.isFinite(targets) || targets < 0) {
      setFormError("Target conversations has to be zero or more.");
      return;
    }
    if (formLanes.length === 0) {
      setFormError("Pick at least one service line. A shift aimed at nobody in particular reaches nobody in particular.");
      return;
    }

    bookDispatch({
      type: "ADD_ACTIVITY",
      line: {
        type: formType,
        locationLabel: formWhere.trim(),
        week: activeWeek,
        hours,
        targetConversations: targets,
        /* A SEAT, NEVER A NAME. Not one invented human name appears
           anywhere in this application, and the owner of a shift is a
           job rather than a person in any case. There is one filled seat
           today, so every shift added here belongs to it and /team can
           say so. */
        seatId: ACTING_SEAT_ID,
        laneFocus: formLanes,
        notes: undefined,
      },
    });

    setFormDone(
      `${ACTIVITY_TYPE[formType].label} at ${formWhere.trim()} added to ${formatWeek(activeWeek).toLowerCase()}. It is in the ledger above, and it moved the split.`,
    );
    setFormError(null);
    setFormWhere("");
  }

  function recordVisit(p: Prospect, week: string, found: string) {
    pipelineDispatch({
      type: "RECORD_TOUCH",
      prospectId: p.id,
      packageId: p.leadPackageId ?? "",
      at: TODAY,
    });
    bookDispatch({
      type: "ADD_ACTIVITY",
      line: {
        type: "go-see",
        prospectId: p.id,
        locationLabel: `${p.name}, ${LANE_META[p.lane].doorNoun}`,
        week,
        hours: GO_SEE_HOURS,
        targetConversations: 1,
        seatId: ACTING_SEAT_ID,
        laneFocus: [p.lane],
        notes: found || undefined,
        completedAt: TODAY,
      },
    });
    setOpenStopId(null);
    setVisitDone(
      `Go-see at ${p.name} recorded against ${formatWeek(week).toLowerCase()}. It counts a touch on the fact table and ${hoursLabel(GO_SEE_HOURS)} hours in the outbound ledger below, and the figures at the top of this page have moved.`,
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Stage two, {period.label}</p>
          <h1 className={styles.h1}>In the field</h1>

          {/* The page is named after somebody else's sentence and it says
              so at the top rather than in a footnote. A work sample that
              answers the posting's first bullet should be able to point
              at the bullet. */}
          <blockquote className={styles.posting}>
            <p>
              "Lead and execute local marketing initiatives focused on demand
              generation, campaign execution, operational alignment, and brand
              growth."
            </p>
            <cite>
              The role summary on the Champions Group Marketing Manager
              posting, West Division, Brea
            </cite>
          </blockquote>

          {/* No dollar figure anywhere on this page. The outbound ledger has
              no revenue field to put one in. */}
          <p className={styles.subLede}>
            Outbound ledger only. The money is on{" "}
            <Link to="/calendar">the book</Link>.
          </p>
        </header>

        <section className={styles.kpis} aria-label="The period at a glance">
          <Kpi
            value={DOOR_ONLY.length}
            label="No written door at all"
            note="Organisations publishing no email address anywhere on their own site. A visit is the only route into them, and most of them are management offices and community associations."
            provenance="public"
          />
          <Kpi
            value={hoursLabel(totals.outsideHours)}
            unit="h"
            label="Hours in the field"
            note="Tabling, go-sees and community events planned this period. Home shows, HOA board nights, association chapters, employer benefits fairs."
            provenance="illustrative"
          />
          <Kpi
            value={hoursLabel(deskHours)}
            unit="h"
            label="Hours at a desk"
            note="Call blocks, email sequences, and time at our own branch. Real work, counted honestly, and not the same work."
            provenance="illustrative"
          />
          <Kpi
            value={`${Math.round(outsideShare * 100)}%`}
            label="Share spent outside"
            note={`This console holds itself to ${Math.round(OUTSIDE_SHARE_FLOOR * 100)}% or better. That bar is this console's own and Champions publishes no such figure.`}
            provenance="modeled"
          />
        </section>

        {/* ===========================================================
            1. THE GO-SEE RUN
            =========================================================== */}
        <section className={styles.section} aria-labelledby="run-h">
          <div className={styles.sectionHead}>
            <p className={styles.sectionEyebrow}>One</p>
            <h2 id="run-h" className={styles.sectionTitle}>
              The go-see run
            </h2>
            <p className={styles.sectionLede}>
              {DOOR_ONLY.length} organisations publishing no email address at
              all, sorted by straight-line distance from 625 Columbia Street.
            </p>
            <div className={styles.sectionMeta}>
              <EmailConfidenceChip confidence="none" size="sm" />
              <span className={styles.sectionMetaNote}>
                Every row carries this chip.
              </span>
            </div>
            <div className={styles.sectionMeta}>
              <ProvenanceBadge provenance="modeled" compact />
              <span className={styles.sectionMetaNote}>
                Straight line from the brand's published Brea address to each
                Google Places coordinate. Not drive time.
              </span>
            </div>
          </div>

          <ol className={styles.run}>
            {run.map((stop, i) => {
              const visits = book.activity.filter(
                (l) =>
                  l.prospectId === stop.prospect.id &&
                  l.type === "go-see" &&
                  l.completedAt,
              );
              return (
                <Stop
                  /* Keyed on the period as well as the organisation, so
                     that changing the period in the chrome remounts the
                     row and its week selector defaults to a week that is
                     actually in the period being looked at. */
                  key={`${stop.prospect.id}-${period.id}`}
                  prospect={stop.prospect}
                  index={i + 1}
                  miles={stop.miles}
                  visits={visits}
                  touches={touchesFor(pipeline, stop.prospect.id)}
                  status={furthestStatus(pipeline, stop.prospect.id)}
                  open={openStopId === stop.prospect.id}
                  weeks={weeks}
                  onToggle={() =>
                    setOpenStopId(
                      openStopId === stop.prospect.id ? null : stop.prospect.id,
                    )
                  }
                  onRecord={(week, found) =>
                    recordVisit(stop.prospect, week, found)
                  }
                />
              );
            })}
          </ol>

          {/* The confirmation is a sentence with a glyph in front of it and
              it does not rely on a colour to be read, the same way the
              tabling form's answer does not. */}
          {visitDone ? (
            <p className={styles.formDone} role="status">
              <span aria-hidden="true">●</span>
              <span>{visitDone}</span>
            </p>
          ) : null}

          {/* WHAT THE LIST COSTS, stated in hours rather than implied.
              A run list with no price on it reads as free, and the whole
              argument of the ledger further down this page is that it is
              not. The arithmetic is the stop count times the modeled cost
              of a stop, and both halves are on the screen. */}
          <p className={styles.sectionFoot}>
            The nearest of these is{" "}
            <strong className="num">
              {run.length > 0 ? run[0].miles.toFixed(1) : "0"}
            </strong>{" "}
            straight-line miles from the branch and the furthest is{" "}
            <strong className="num">
              {run.length > 0 ? run[run.length - 1].miles.toFixed(1) : "0"}
            </strong>
            . All {run.length} of them at{" "}
            <strong className="num">{GO_SEE_HOURS}</strong> hours a stop is{" "}
            <strong className="num">
              {hoursLabel(run.length * GO_SEE_HOURS)}
            </strong>{" "}
            hours <ProvenanceBadge provenance="modeled" compact />.
          </p>
        </section>

        {/* ===========================================================
            2. TABLING
            =========================================================== */}
        <section className={styles.section} aria-labelledby="tabling-h">
          <div className={styles.sectionHead}>
            <p className={styles.sectionEyebrow}>Two</p>
            <h2 id="tabling-h" className={styles.sectionTitle}>
              Tabling and the rooms worth standing in
            </h2>
            <p className={styles.sectionLede}>
              Home shows, HOA board nights, property management association
              chapters, employer benefits fairs and community events. Every
              shift carries the reasoning it was chosen for.
            </p>
          </div>

          {/* --------------------------------------------------------
              THE KRAEMER BOULEVARD SHIFT.
              The clearest single geographic argument in the data set,
              and it is made from two rows a reader can check rather
              than from an assertion about Brea.
              -------------------------------------------------------- */}
          {kraemer.length === 2 && kraemerGap !== null ? (
            <article className={styles.kraemer} aria-labelledby="kraemer-h">
              <p className={styles.kraemerEyebrow}>The argument in one shift</p>
              <h3 id="kraemer-h" className={styles.kraemerTitle}>
                Kraemer Boulevard, one lunch hour
              </h3>

              <p className={styles.kraemerLede}>
                Two of Brea's largest single-site employers sit{" "}
                <strong className="num">{feet(kraemerGap)}</strong> feet apart
                on the same street. One table, set up once, and the people who
                decide whether an employee home services offer goes into a
                benefits fair at both of them walk past it on the way to lunch.
              </p>

              <div className={styles.kraemerPair}>
                {kraemer.map((p) => (
                  <div key={p.id} className={styles.kraemerCard}>
                    <div className={styles.kraemerCardHead}>
                      <LaneChip lane={p.lane} size="sm" />
                      <h4 className={styles.kraemerName}>
                        <RecordName prospectId={p.id} name={p.name} />
                      </h4>
                    </div>
                    <dl className={styles.kraemerFacts}>
                      <div>
                        <dt>Address</dt>
                        <dd>{p.address}</dd>
                      </div>
                      <div>
                        <dt>Ask for</dt>
                        <dd>{p.decisionMakerTitle}</dd>
                      </div>
                      <div>
                        <dt>Written door</dt>
                        <dd>
                          <EmailConfidenceChip
                            confidence={p.emailConfidence}
                            size="sm"
                          />
                        </dd>
                      </div>
                      <div>
                        <dt>Households reachable</dt>
                        <dd>
                          <span className="num">
                            {groupProfile(p) ? `${groupProfile(p)!.low} to ${groupProfile(p)!.high}` : NO_GROUP_PROFILE}
                          </span>{" "}
                          doors
                          <ProvenanceBadge provenance="modeled" compact />
                        </dd>
                      </div>
                    </dl>
                    <p className={styles.kraemerWhy}>{p.whyTheyFit}</p>
                  </div>
                ))}
              </div>

              <div className={styles.kraemerPoint}>
                <p>
                  Both hold the same door, an employer with a benefits calendar
                  and an internal newsletter. Both are on the same block. One
                  of them publishes an email address and the other publishes a
                  support form, so a written approach reaches half of this
                  street at best.
                </p>
                {kraemerReply ? (
                  <p className={styles.kraemerEvidence}>
                    The written approach has already been tried:{" "}
                    <em>{kraemerReply.summary}</em> That reply is on{" "}
                    <Link to="/replies">the replies board</Link> under wrong
                    person, and it is the reason this shift is in the plan
                    rather than a second email.
                  </p>
                ) : null}
                <p>
                  Four hours in that lobby costs less than a single day spent
                  chasing two switchboards, and there is no version of that
                  afternoon a call block reproduces. That is the whole case for
                  tabling, and it is geography rather than enthusiasm.
                </p>
              </div>
            </article>
          ) : null}

          {tablingLines.length === 0 ? (
            <p className={styles.empty}>
              No tabling or networking shift is planned in {period.label}.
            </p>
          ) : (
            <div className={styles.planList}>
              {tablingLines.map((line) => (
                <PlanLine
                  key={line.id}
                  line={line}
                  onComplete={() =>
                    bookDispatch({
                      type: "COMPLETE_ACTIVITY",
                      id: line.id,
                      at: TODAY,
                    })
                  }
                />
              ))}
            </div>
          )}
        </section>

        {/* ===========================================================
            3. THE HOURS LEDGER
            =========================================================== */}
        <section className={styles.section} aria-labelledby="ledger-h">
          <div className={styles.sectionHead}>
            <p className={styles.sectionEyebrow}>Three</p>
            <h2 id="ledger-h" className={styles.sectionTitle}>
              The hours ledger
            </h2>
            <p className={styles.sectionLede}>
              {period.label}, split into work in the field and work at a desk.
            </p>
            <div className={styles.sectionMeta}>
              <TokenChip token={LEDGER["outbound-activity"]} size="sm" />
              <span className={styles.sectionMetaNote}>
                Hours only. An activity line has no revenue field.
              </span>
            </div>
          </div>

          <div className={styles.split}>
            <div className={styles.splitFigures}>
              <div className={styles.splitFigure} data-side="outside">
                <span className={styles.splitGlyph} aria-hidden="true">
                  ▤
                </span>
                <span className={`${styles.splitValue} num`}>
                  {hoursLabel(totals.outsideHours)}
                </span>
                <span className={styles.splitLabel}>hours in the field</span>
                <span className={styles.splitShare}>
                  <span className="num">
                    {Math.round(outsideShare * 100)}%
                  </span>{" "}
                  of the period
                </span>
              </div>
              <div className={styles.splitFigure} data-side="desk">
                <span className={styles.splitGlyph} aria-hidden="true">
                  ◐
                </span>
                <span className={`${styles.splitValue} num`}>
                  {hoursLabel(deskHours)}
                </span>
                <span className={styles.splitLabel}>hours at a desk</span>
                <span className={styles.splitShare}>
                  <span className="num">
                    {Math.round((1 - outsideShare) * 100)}%
                  </span>{" "}
                  of the period
                </span>
              </div>
            </div>

            {/* The bar is decoration. Both segments are already stated as
                a figure, a share and a word above it, so the whole thing
                can be lost to a colourblind reader, a greyscale print or
                a failed stylesheet without losing the reading. */}
            <div className={styles.bar} aria-hidden="true">
              <span
                className={styles.barOutside}
                style={{ width: `${Math.round(outsideShare * 100)}%` }}
              />
              <span
                className={styles.barDesk}
                style={{ width: `${Math.round((1 - outsideShare) * 100)}%` }}
              />
            </div>

            <p
              className={styles.verdict}
              data-meets={outsideShare >= OUTSIDE_SHARE_FLOOR ? "yes" : "no"}
            >
              <span className={styles.verdictGlyph} aria-hidden="true">
                {outsideShare >= OUTSIDE_SHARE_FLOOR ? "●" : "◔"}
              </span>
              <span>
                <strong>
                  {outsideShare >= OUTSIDE_SHARE_FLOOR
                    ? "This period clears the bar."
                    : "This period does not clear the bar."}
                </strong>{" "}
                The plan spends {Math.round(outsideShare * 100)}% of its hours
                in the field against a floor of{" "}
                {Math.round(OUTSIDE_SHARE_FLOOR * 100)}%. That floor is this
                console's own and it is illustrative; Champions publishes no
                such figure and this page does not pretend otherwise.
              </span>
            </p>
          </div>

          <table className={styles.byType}>
            <caption className={styles.tableCaption}>
              Every kind of local marketing work in {period.label}, and
              whether it happens in the field or at a desk.
            </caption>
            <thead>
              <tr>
                <th scope="col">Kind of work</th>
                <th scope="col" className={styles.numCol}>
                  Hours
                </th>
                <th scope="col">Where it happens</th>
              </tr>
            </thead>
            <tbody>
              {hoursByType.map(({ type, hours }) => (
                <tr key={type} data-zero={hours === 0 ? "yes" : "no"}>
                  <th scope="row">
                    <TokenChip token={ACTIVITY_TYPE[type]} size="sm" />
                  </th>
                  <td className={`${styles.numCol} num`}>
                    {hours === 0 ? "0" : hoursLabel(hours)}
                  </td>
                  <td className={styles.whereCell}>
                    <span
                      className={styles.where}
                      data-outside={OUTSIDE_TYPES.has(type) ? "yes" : "no"}
                    >
                      <span aria-hidden="true">
                        {OUTSIDE_TYPES.has(type) ? "▲" : "■"}
                      </span>
                      <span>
                        {OUTSIDE_TYPES.has(type)
                          ? "In the field"
                          : "At a desk, or at the branch"}
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">All local marketing work</th>
                <td className={`${styles.numCol} num`}>
                  {hoursLabel(totals.hours)}
                </td>
                <td>
                  Across <span className="num">{periodLines.length}</span>{" "}
                  {periodLines.length === 1 ? "shift" : "shifts"}, of which{" "}
                  <span className="num">{totals.completed}</span>{" "}
                  {totals.completed === 1 ? "is" : "are"} marked done.
                </td>
              </tr>
            </tfoot>
          </table>

          {/* A morning at our own branch is real work and it is not field
              work. Both pages ask the same function, so they cannot drift
              into disagreeing about the same week. */}
          <div className={styles.ledgerNotes}>
            {typedHours > 0 ? (
              <p>
                <strong className="num">{hoursLabel(typedHours)}</strong> of{" "}
                {hoursLabel(totals.hours)} hours entered this session rather
                than seeded.{" "}
                <ProvenanceBadge provenance="user_input" compact />
              </p>
            ) : (
              <p>Every hour above came with the seeded plan.</p>
            )}
            <p>
              <Link to="/calendar">The book</Link> carries the ratio: hours in the
              field per thousand dollars booked.
            </p>
          </div>
        </section>

        {/* ===========================================================
            4. ADD A SHIFT
            =========================================================== */}
        <section className={styles.section} aria-labelledby="add-h">
          <div className={styles.sectionHead}>
            <p className={styles.sectionEyebrow}>Four</p>
            <h2 id="add-h" className={styles.sectionTitle}>
              Put a shift in the plan
            </h2>

          </div>

          <form className={styles.form} onSubmit={submitActivity}>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label htmlFor="act-type">Kind of work</label>
                <select
                  id="act-type"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as ActivityType)}
                >
                  {ACTIVITY_TYPE_ORDER.map((t) => (
                    <option key={t} value={t}>
                      {ACTIVITY_TYPE[t].label}
                      {OUTSIDE_TYPES.has(t) ? " (outside)" : " (at a desk)"}
                    </option>
                  ))}
                </select>
                <span className={styles.fieldHint}>
                  {ACTIVITY_TYPE[formType].note}
                </span>
              </div>

              <div className={styles.field}>
                <label htmlFor="act-where">Where</label>
                <input
                  id="act-where"
                  type="text"
                  value={formWhere}
                  onChange={(e) => {
                    setFormWhere(e.target.value);
                    /* The confirmation of the last shift clears the moment
                       somebody starts typing the next one. A success
                       message left sitting above a half-filled form
                       eventually gets read as confirmation of the thing
                       currently on screen, which it is not. */
                    setFormDone(null);
                    setFormError(null);
                  }}
                  placeholder="Home show hall, HOA clubhouse, employer benefits fair, Friday lunch hour"
                />
                <span className={styles.fieldHint}>
                  A street, a lobby, a clubhouse or a hall. Specific enough to
                  drive to.
                </span>
              </div>

              <div className={styles.field}>
                <label htmlFor="act-week">Week</label>
                <select
                  id="act-week"
                  value={activeWeek}
                  onChange={(e) => setFormWeek(e.target.value)}
                >
                  {weeks.map((w) => (
                    <option key={w} value={w}>
                      {formatWeek(w)}
                    </option>
                  ))}
                </select>
                <span className={styles.fieldHint}>
                  Only the weeks inside {period.label}. Activity is planned by
                  week rather than by day, because a lobby at lunchtime is a
                  week's decision and not a diary entry.
                </span>
              </div>

              <div className={styles.field}>
                <label htmlFor="act-hours">Hours</label>
                <input
                  id="act-hours"
                  type="number"
                  inputMode="decimal"
                  min="0.25"
                  step="0.25"
                  value={formHours}
                  onChange={(e) => setFormHours(e.target.value)}
                />
                <span className={styles.fieldHint}>
                  The scarce resource. Whatever goes in here is counted against
                  the split above, on whichever side of the office this kind of
                  work happens.
                </span>
              </div>

              <div className={styles.field}>
                <label htmlFor="act-targets">Target conversations</label>
                <input
                  id="act-targets"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={formTargets}
                  onChange={(e) => setFormTargets(e.target.value)}
                />
                <span className={styles.fieldHint}>
                  A target, and the app treats it as one. It renders with a
                  modeled badge everywhere, never as a result.
                </span>
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel} id="act-lanes-label">
                  Service line focus
                </span>
                <div
                  className={styles.lanePicker}
                  role="group"
                  aria-labelledby="act-lanes-label"
                >
                  {LANE_ORDER.map((lane) => {
                    const on = formLanes.includes(lane);
                    return (
                      <button
                        key={lane}
                        type="button"
                        className={styles.lanePick}
                        aria-pressed={on}
                        onClick={() =>
                          setFormLanes(
                            on
                              ? formLanes.filter((l) => l !== lane)
                              : [...formLanes, lane],
                          )
                        }
                      >
                        <span className={styles.lanePickMark} aria-hidden="true">
                          {on ? "✓" : "+"}
                        </span>
                        <LaneChip lane={lane} size="sm" />
                      </button>
                    );
                  })}
                </div>
                <span className={styles.fieldHint}>
                  Which service lines this shift is aimed at. The coverage
                  figure on the book is computed from exactly this, so a shift
                  aimed at everything is a shift aimed at nothing.
                </span>
              </div>
            </div>

            <div className={styles.formFoot}>
              <Button type="submit" variant="primary">
                Add this shift to the plan
              </Button>
              <span className={styles.formOwner}>
                Owner is recorded as the acting seat, by role. This console
                contains no invented human names, only roles.
              </span>
            </div>

            {/* Both messages are a sentence with a glyph in front of it.
                Neither one relies on a colour to be read. */}
            {formError ? (
              <p className={styles.formError} role="alert">
                <span aria-hidden="true">✕</span>
                <span>{formError}</span>
              </p>
            ) : null}
            {formDone && !formError ? (
              <p className={styles.formDone} role="status">
                <span aria-hidden="true">●</span>
                <span>{formDone}</span>
              </p>
            ) : null}
          </form>

          <p className={styles.sectionFoot}>
            {PROSPECTS.length} organisations sit inside this territory, and{" "}
            <strong className="num">
              {PROSPECTS.filter((p) => furthestStatus(pipeline, p.id) === "unworked").length}
            </strong>{" "}
            of them have never been touched. The plan above is how that number
            comes down, and the only way it comes down is by somebody leaving
            the office. See{" "}
            <Link to="/calendar">this week's sheet</Link> for the printed
            version a person actually carries.
          </p>
        </section>
      </div>
    </div>
  );
}
