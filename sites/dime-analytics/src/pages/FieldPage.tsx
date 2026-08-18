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
 * OUTSIDE THE BUILDING.
 *
 * This page is named after a sentence somebody else wrote. The job
 * posting this application was built for lists its daily
 * responsibilities in order, and one of them is:
 *
 *   "Perform outbound lead-generating activities outside the building,
 *    including tabling, networking events, and go-sees with prospective
 *    and current customers."
 *
 * Every other screen in this application is a way of deciding what to do.
 * This one is the doing, and it exists because the three words at the
 * centre of that sentence are the ones a territory nobody has worked
 * cannot get around. There is no book. There is no CRM history to mine,
 * because nobody has ever prospected this trade area from this desk, and
 * not one organisation on the board publishes an email address this
 * research read. What there is, is a trade area full of organisations
 * who have never been asked, and one person with a car.
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
 * every line that states it, because any figure typed into this prose
 * would have been wrong the same afternoon. They are sorted by
 * straight-line distance from the Irvine office because that is
 * literally the order somebody drives them, and the distance is on every
 * row so a reader can see what an afternoon costs.
 *
 * TABLING is the argument from geography. Employers, mall tenants and
 * industrial units in this trade area cluster on a handful of streets,
 * so one table in the right lobby reaches several buyers who would each
 * have cost a separate trip. A call block does not reproduce that
 * afternoon at any price.
 *
 * THE HOURS LEDGER is the argument against this page. Hours are finite
 * and a plan that fills them with the comfortable kind of work has
 * quietly decided to do the job from a chair. So the ledger splits the
 * period's hours into the ones spent outside the building and the ones
 * spent at a desk, and it does not congratulate anybody for the total.
 *
 * ---------------------------------------------------------------
 * WHAT THIS PAGE REFUSES TO DO
 * ---------------------------------------------------------------
 * It carries no revenue figure, anywhere, for the same reason the week
 * sheet does not: ActivityLine has no revenue field, the two ledgers live
 * in separate arrays in BookProvider, and a field report with a dollar
 * total on it is the exact document where hours out of the building get
 * dressed up as results. Twelve go-sees is twelve go-sees. If one of them
 * turned into a party there is a BookLine, and the money is on /book.
 *
 * Nothing here invents a DIME fact. The office address and the support
 * number are the published ones; every organisation's address was read
 * off a published page and geocoded through the US Census Bureau on 17
 * August 2026.
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
// Which work counts as outside the building
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
 * WHICH KINDS OF WORK COUNT AS OUTSIDE THE BUILDING.
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
 * The result is worth knowing before you read the table: a VENUE TOUR
 * does not count. It is outbound work, it is real, and it happens at
 * the Irvine office, which is the one address in this application
 * that is not outside the building.
 */
const OUTSIDE_TYPES = new Set<ActivityType>(
  ACTIVITY_TYPE_ORDER.filter((t) => activityTotals([probe(t)]).outsideHours === 1),
);

/**
 * The share of planned hours this app holds itself to spending outside
 * the building.
 *
 * ILLUSTRATIVE, AND IT IS THIS APP'S BAR RATHER THAN MAIN EVENT'S. Main
 * Event publishes no such target and this file does not pretend
 * otherwise. Seventy percent is set where it is because the posting names
 * outside work first and names a desk nowhere, and because a target you
 * can hit while sitting down is not a target, it is a total.
 */
const OUTSIDE_SHARE_FLOOR = 0.7;

/**
 * Hours booked against a single recorded go-see.
 *
 * A stop is a drive, a wait at a front desk and a conversation, and three
 * quarters of an hour is what that costs on average across a run of
 * door-only organisations inside this trade area. It is a planning
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
            straight-line miles from the venue
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
          <dt>Lane focus</dt>
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

  /* The run. Sorted by straight-line distance from the Irvine office,
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


  // ---- the new activity form ----------------------------------
  const [formType, setFormType] = useState<ActivityType>("tabling");
  const [formWhere, setFormWhere] = useState("");
  const [formWeek, setFormWeek] = useState(weeks[0] ?? "");
  const [formHours, setFormHours] = useState("3");
  const [formTargets, setFormTargets] = useState("12");
  const [formLanes, setFormLanes] = useState<Lane[]>(["corporate"]);
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
      setFormError("Pick at least one lane. A shift aimed at nobody in particular reaches nobody in particular.");
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
      packageId: p.leadPackageId,
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
          <h1 className={styles.h1}>Outside the building</h1>

          {/* The page is named after somebody else's sentence and it says
              so at the top rather than in a footnote. A work sample that
              answers the posting's first bullet should be able to point
              at the bullet. */}
          <blockquote className={styles.posting}>
            <p>
              "Perform outbound lead-generating activities outside the
              building, including tabling, networking events, and go-sees with
              prospective and current customers."
            </p>
            <cite>
              A daily responsibility on the posting this application was built
              for
            </cite>
          </blockquote>

          {/* No dollar figure anywhere on this page. The outbound ledger has
              no revenue field to put one in. */}
          <p className={styles.subLede}>
            Outbound ledger only. The money is on{" "}
            <Link to="/book">the book</Link>.
          </p>
        </header>

        <section className={styles.kpis} aria-label="The period at a glance">
          <Kpi
            value={DOOR_ONLY.length}
            label="No written door at all"
            note="Organisations publishing no email address anywhere on their own site. A visit is the only route into them."
            provenance="public"
          />
          <Kpi
            value={hoursLabel(totals.outsideHours)}
            unit="h"
            label="Hours outside the building"
            note="Tabling, go-sees and networking events planned this period. The thing the posting names first."
            provenance="illustrative"
          />
          <Kpi
            value={hoursLabel(deskHours)}
            unit="h"
            label="Hours at a desk"
            note="Call blocks, email sequences and tours of the venue itself. Real work, counted honestly, and not the same work."
            provenance="illustrative"
          />
          <Kpi
            value={`${Math.round(outsideShare * 100)}%`}
            label="Share spent outside"
            note={`This app holds itself to ${Math.round(OUTSIDE_SHARE_FLOOR * 100)}% or better. That bar is this app's own and DIME publishes no such figure.`}
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
              all, sorted by straight-line distance from the Irvine office.
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
                Straight line from the venue's published address to each Google
                Places coordinate. Not drive time.
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
            straight-line miles from the venue and the furthest is{" "}
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
              Every shift carries the reasoning it was chosen for.
            </p>
          </div>

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
              {period.label}, split into work outside the building and work at
              a desk.
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
                <span className={styles.splitLabel}>
                  hours outside the building
                </span>
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
                outside the building against a floor of{" "}
                {Math.round(OUTSIDE_SHARE_FLOOR * 100)}%. That floor is this
                app's own and it is illustrative; DIME publishes no such
                figure and this page does not pretend otherwise.
              </span>
            </p>
          </div>

          <table className={styles.byType}>
            <caption className={styles.tableCaption}>
              Every kind of outbound work in {period.label}, and which side of
              the building it happens on.
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
                          ? "Outside the building"
                          : "At a desk, or at the venue"}
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">All outbound work</th>
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

          {/* A venue tour is real outbound work and it is not outside the
              building. Both pages ask the same function, so they cannot
              drift into disagreeing about the same week. */}
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
              <Link to="/book">The book</Link> carries the ratio: hours outside
              the building per thousand dollars booked.
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
                  placeholder="Los Irvine Center corridor, employer lobbies, Friday lunch hour"
                />
                <span className={styles.fieldHint}>
                  A street, a lobby, a campus or a room. Specific enough to
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
                  the split above, on whichever side of the building this kind
                  of work happens.
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
                  Lane focus
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
                  Which channels this shift is aimed at. The lane coverage on
                  the book is computed from exactly this, so a shift aimed at
                  everything is a shift aimed at nothing.
                </span>
              </div>
            </div>

            <div className={styles.formFoot}>
              <Button type="submit" variant="primary">
                Add this shift to the plan
              </Button>
              <span className={styles.formOwner}>
                Owner is recorded as Sales Manager. This application contains
                no invented human names, only roles.
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
            {PROSPECTS.length} organisations sit within seven miles of the
            Irvine office, and{" "}
            <strong className="num">
              {PROSPECTS.filter((p) => furthestStatus(pipeline, p.id) === "unworked").length}
            </strong>{" "}
            of them have never been touched. The plan above is how that number
            comes down, and the only way it comes down is by somebody leaving
            the office. See{" "}
            <Link to="/book/week">this week's sheet</Link> for the printed
            version a person actually carries.
          </p>
        </section>
      </div>
    </div>
  );
}
