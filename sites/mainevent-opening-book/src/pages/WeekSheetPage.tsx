import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type {
  ActivityLine,
  ActivityType,
  Lane,
  Prospect,
  ProspectPriority,
} from "@/domain/types";
import { PROSPECTS, PROSPECT_BY_ID } from "@/data/prospects";
import { seatLabel } from "@/data/seats";
import { OFFERS, PERIODS, PERIOD_BY_ID, VENUE } from "@/data/venue";
import { OBJECTIONS, SEVERITY_META, type Objection } from "@/data/objections";
import { LANE_META, LANE_ORDER } from "@/domain/lanes";
import { ACTIVITY_TYPE } from "@/domain/vocabulary";
import { activityByWeek, activityTotals, useBook } from "@/state/BookProvider";
import { usePipeline, usePipelineDispatch } from "@/state/PipelineProvider";
import { milesFromVenue } from "@/domain/selectors/desk";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { LaneChip } from "@/components/primitives/LaneChip";
import {
  EmailConfidenceChip,
  TokenChip,
} from "@/components/primitives/StatusChip";
import { Button } from "@/components/primitives/Button";
import { RecordName } from "@/components/record/RecordName";
import styles from "./WeekSheetPage.module.css";

/**
 * THE WEEK SHEET. The one screen in this application that is meant to
 * leave the building.
 *
 * Everything else here is software. This is a document. The job posting's
 * first daily responsibility is "outbound lead-generating activities
 * outside the building, including tabling, networking events, and go-sees
 * with prospective and current customers", and outside the building is a
 * school reception at 8am, a dealership floor, a clinic corridor and a
 * chamber mixer. Nobody opens a laptop in any of those places. They carry
 * a sheet of paper, they write on it with a pen, and they type it up
 * afterwards if they type it up at all.
 *
 * So this page is laid out for the printer first and the screen second,
 * and the difference is not cosmetic. A screen can afford a panel the
 * reader might scroll past. A printed sheet cannot: everything a rep
 * needs while standing in a lobby has to be ON it, because there is no
 * second page to go and fetch. That is why the objection answers are
 * here in full rather than linked, why every named organisation carries
 * its address and phone number rather than an id, and why there is a
 * ruled blank line under each one. A form a person fills in with a pen is
 * a design decision, not a fallback.
 *
 * ── WHAT THIS SHEET REFUSES TO DO ─────────────────────────────────
 * It does not carry a revenue figure. Not one. This is the outbound
 * ledger printed, and ActivityLine has no revenue field to put a dollar
 * in. A week sheet with a running total on it is the exact document where
 * hours out of the building get quietly dressed up as results, and the
 * two ledgers live in separate arrays in BookProvider precisely so that
 * this page cannot do it by accident.
 *
 * ── THE THREE THINGS THE SHEET COMPUTES ───────────────────────────
 * 1. WHO TO CALL ON, per activity. The plan says "Brea dental and medical
 *    corridor, E Imperial Hwy" and eight target conversations. Standing
 *    on E Imperial Hwy, that is not a plan, it is a street. So the sheet
 *    names the organisations, and the rule it ranks them by changes with
 *    the kind of work: a go-see leads with the ones that publish no email
 *    at all, because those can be reached no other way.
 *
 * 2. THE THREE OBJECTIONS MOST LIKELY THIS WEEK, scored against the hours
 *    actually planned rather than picked by hand. A register that shows
 *    all seven every week is a register nobody reads twice.
 *
 * 3. WHAT I AM ASKING FOR, lane by lane, from the lane's own pre-opening
 *    problem and the offer in data/venue.ts that answers it. Before there
 *    is an opening date the ask is a place in line, not a deposit, and a
 *    rep who has that sentence in front of them does not improvise one.
 *
 * Nothing on this page invents a Main Event fact. The venue block is the
 * published address and phone number, the countdown is stated in weeks
 * because no opening date is published, and every organisation's address
 * came out of Google Places on 11 August 2026.
 */

// ---------------------------------------------------------------
// Dates and figures
// ---------------------------------------------------------------

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * ISO date strings are split, never parsed.
 *
 * `new Date("2026-09-21")` is midnight UTC, and formatting that in
 * California prints the twentieth. A week sheet that names the wrong
 * Monday is worse than no week sheet, so these strings are treated as the
 * calendar labels they are and never routed through a timezone.
 */
function parts(iso: string): [number, number, number] {
  const [y, m, d] = iso.split("-").map(Number);
  return [y || 0, m || 1, d || 1];
}

function formatWeek(iso: string): string {
  const [y, m, d] = parts(iso);
  return `Week commencing ${d} ${MONTHS[m - 1]} ${y}`;
}

function formatShort(iso: string): string {
  const [, m, d] = parts(iso);
  return `${d} ${MONTHS_SHORT[m - 1]}`;
}

/** The six days after the week's Monday, as a label. Arithmetic in UTC. */
function weekRange(iso: string): string {
  const [y, m, d] = parts(iso);
  const start = Date.UTC(y, m - 1, d);
  const end = new Date(start + 6 * 86400000);
  return `${d} ${MONTHS_SHORT[m - 1]} to ${end.getUTCDate()} ${
    MONTHS_SHORT[end.getUTCMonth()]
  }`;
}

/** Whole weeks from one Monday to another. Both are week-commencing dates. */
function weeksApart(fromIso: string, toIso: string): number {
  const [ay, am, ad] = parts(fromIso);
  const [by, bm, bd] = parts(toIso);
  const a = Date.UTC(ay, am - 1, ad);
  const b = Date.UTC(by, bm - 1, bd);
  return Math.round((b - a) / (7 * 86400000));
}

const hoursLabel = (n: number) => (n % 1 === 0 ? String(n) : n.toFixed(1));

// ---------------------------------------------------------------
// Who to call on
// ---------------------------------------------------------------

const RUN_SIZE = 3;

const PRIORITY_RANK: Record<ProspectPriority, number> = {
  anchor: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/**
 * WHAT A RUN LIST IS CALLED AND HOW IT IS RANKED, per kind of work.
 *
 * The ranking rule is different for each type and that is the whole point
 * of declaring it here rather than sorting everything by size. An
 * organisation that publishes no email address is the WORST prospect for
 * an email sequence and the BEST one for a go-see, because turning up is
 * the only route into it. The desk already says so in its own words, and
 * a sheet that ignored that would send a rep to knock on the door of the
 * one school that answers its email.
 *
 * The rule is printed on the sheet beside the names. A list somebody
 * cannot interrogate is a list they are being asked to take on faith,
 * and the whole argument of this prototype is that they should not have
 * to.
 */
const RUN_META: Record<
  ActivityType,
  { heading: string; rule: string; wants: "door" | "written" | "phone" }
> = {
  "go-see": {
    heading: "Doors to walk into",
    rule: "Ranked by no published email first, then by priority, then by how close they are to 245 W Birch Street. An organisation with a front desk and no inbox can be reached this way and no other.",
    wants: "door",
  },
  tabling: {
    heading: "Who to look for while the table is up",
    rule: "The organisations in these lanes worth walking over to introduce yourself to, hardest to reach in writing first. A table is the cheapest hour there is for the ones an email never gets to.",
    wants: "door",
  },
  "networking-event": {
    heading: "Who to find in the room",
    rule: "A mixer is not one prospect, it is several lanes standing up at once. These are the organisations in this week's lanes to ask after by name, hardest to reach in writing first.",
    wants: "door",
  },
  "venue-tour": {
    heading: "Who to walk through the building",
    rule: "The largest calendar-locked buyers and the referral partners in these lanes. This lane converts on the tour and almost nowhere else.",
    wants: "door",
  },
  "call-block": {
    heading: "The call list",
    rule: "Only organisations that publish a phone number, hardest to reach in writing first. A published email is worth two minutes of typing rather than a call.",
    wants: "phone",
  },
  "email-sequence": {
    heading: "The write list",
    rule: "Only organisations that publish an address or a contact form, best written door first. Nothing in this data set was pattern-guessed from a domain name.",
    wants: "written",
  },
};

/** How hard this organisation is to reach in writing. Lower is harder. */
const DOOR_RANK = { none: 0, form_only: 1, verified_public: 2 } as const;

interface RunEntry {
  prospect: Prospect;
  /** Named on the activity line itself rather than chosen by this page. */
  anchored: boolean;
}

/**
 * The named organisations for one line of the plan.
 *
 * The anchor, where the plan named one, always leads. Everything after it
 * is this application's judgement about who else is worth the same trip,
 * drawn from the lanes the line is already aimed at, and it carries a
 * modeled badge on screen and on paper.
 */
function runFor(
  line: ActivityLine,
  /**
   * Organisations already named earlier in the same week.
   *
   * A SHEET THAT SENDS YOU THROUGH THE SAME DOOR TWICE HAS WASTED HALF A
   * DAY. Two shifts in one week can easily share a lane, and ranking each
   * one in isolation puts the same manufacturer at the top of both. The
   * anchor is exempt, because if the plan itself names an organisation
   * for a second visit that is a decision somebody made on purpose.
   */
  alreadyNamed: ReadonlySet<string>,
): { entries: RunEntry[]; more: number } {
  const anchor = line.prospectId ? PROSPECT_BY_ID[line.prospectId] : undefined;
  const wants = RUN_META[line.type].wants;

  const pool = PROSPECTS.filter((p) => {
    if (anchor && p.id === anchor.id) return false;
    if (alreadyNamed.has(p.id)) return false;
    if (!line.laneFocus.includes(p.lane)) return false;
    if (wants === "phone" && !p.phone) return false;
    if (wants === "written" && p.emailConfidence === "none") return false;
    return true;
  }).sort((a, b) => {
    const door =
      wants === "written"
        ? DOOR_RANK[b.emailConfidence] - DOOR_RANK[a.emailConfidence]
        : DOOR_RANK[a.emailConfidence] - DOOR_RANK[b.emailConfidence];
    if (door !== 0) return door;
    const rank = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (rank !== 0) return rank;
    return milesFromVenue(a.lat, a.lng) - milesFromVenue(b.lat, b.lng);
  });

  const take = anchor ? RUN_SIZE - 1 : RUN_SIZE;
  const entries: RunEntry[] = [
    ...(anchor ? [{ prospect: anchor, anchored: true }] : []),
    ...pool.slice(0, take).map((prospect) => ({ prospect, anchored: false })),
  ];

  return { entries, more: Math.max(0, pool.length - take) };
}

// ---------------------------------------------------------------
// Which objections this week actually raises
// ---------------------------------------------------------------

const SEVERITY_BONUS: Record<Objection["severity"], number> = {
  structural: 2,
  high: 1,
  medium: 0,
};

interface RankedObjection {
  objection: Objection;
  /** Planned hours this week that sit in a lane which raises this one. */
  hours: number;
}

/**
 * THE THREE OBJECTIONS MOST LIKELY TO COME UP THIS WEEK.
 *
 * Scored rather than chosen, and the score is arithmetic anybody can
 * repeat: every planned hour whose lane raises the objection, plus a
 * bonus of two for a structural objection and one for a high one. The
 * bonus exists because "your website will not tell me what it costs" is
 * true of every conversation in every lane until somebody publishes a
 * price, so it outranks a lane-specific objection that happens to cover
 * the same hours.
 *
 * The alternative was to print all seven. Seven objections and their
 * answers is three sides of paper and a rep who reads none of them. Three
 * is what fits beside the plan they are actually working, and the
 * hours behind each one are printed next to it so the choice can be
 * argued with.
 */
function objectionsForWeek(lines: ActivityLine[]): RankedObjection[] {
  return OBJECTIONS.map((objection) => {
    const hours = lines.reduce(
      (n, line) =>
        line.laneFocus.some((lane) => objection.lanes.includes(lane))
          ? n + line.hours
          : n,
      0,
    );
    return { objection, hours };
  })
    .filter((row) => row.hours > 0)
    .sort(
      (a, b) =>
        b.hours +
        SEVERITY_BONUS[b.objection.severity] -
        (a.hours + SEVERITY_BONUS[a.objection.severity]),
    )
    .slice(0, 3);
}

// ---------------------------------------------------------------
// What I am asking for, lane by lane
// ---------------------------------------------------------------

/**
 * The offer this lane is actually asked for.
 *
 * The MOST SPECIFIC eligible offer wins, meaning the one written for the
 * fewest lanes. "First fifty on the calendar" is eligible everywhere, so
 * without that rule every lane on the sheet would carry the same sentence
 * and the block would be decoration. Hospitality gets the hard hat tour,
 * healthcare gets the midweek daytime rate lock, faith and nonprofit gets
 * Spirit Night, and the ones with nothing more specific fall back to a
 * place in line, which is the honest ask before an opening date exists.
 */
function offerForLane(lane: Lane) {
  const eligible = OFFERS.filter((o) => o.eligibleLanes.includes(lane));
  if (eligible.length === 0) return undefined;
  return eligible.reduce((best, o) =>
    o.eligibleLanes.length < best.eligibleLanes.length ? o : best,
  );
}

// ---------------------------------------------------------------
// Pieces of the sheet
// ---------------------------------------------------------------

function WriteIn({ label }: { label: string }) {
  return (
    <p className={styles.writeIn}>
      <span className={styles.writeInLabel}>{label}</span>
      <span className={styles.rule} aria-hidden="true" />
    </p>
  );
}

function RunRow({ entry, line }: { entry: RunEntry; line: ActivityLine }) {
  const p = entry.prospect;
  return (
    <li className={`${styles.runRow} avoid-break`}>
      <div className={styles.runHead}>
        <span className={styles.runGlyph} aria-hidden="true">
          {LANE_META[p.lane].glyph}
        </span>
        <span className={styles.runName}>
          <RecordName prospectId={p.id} name={p.name} />
        </span>
        {entry.anchored ? (
          <span className={styles.anchored}>
            <span aria-hidden="true">◆</span>
            <span>Named in the plan</span>
          </span>
        ) : null}
      </div>

      <dl className={styles.runFacts}>
        <div className={styles.runFact}>
          <dt>Ask for</dt>
          <dd>{p.decisionMakerTitle}</dd>
        </div>
        <div className={styles.runFact}>
          <dt>Address</dt>
          <dd>{p.address}</dd>
        </div>
        <div className={styles.runFact}>
          <dt>Phone</dt>
          <dd className="num">
            {p.phone ?? "No phone number published for this organisation"}
          </dd>
        </div>
        <div className={styles.runFact}>
          <dt>Written door</dt>
          <dd>
            <EmailConfidenceChip confidence={p.emailConfidence} size="sm" />
            {p.email ? <span className={styles.runEmail}>{p.email}</span> : null}
          </dd>
        </div>
      </dl>

      <WriteIn
        label={
          line.type === "call-block"
            ? "Who answered, what they said, and what is next"
            : "What happened, and what is next"
        }
      />
    </li>
  );
}

function ActivityBlock({
  line,
  run,
}: {
  line: ActivityLine;
  /** Computed for the whole week at once, so no door is listed twice. */
  run: { entries: RunEntry[]; more: number };
}) {
  const token = ACTIVITY_TYPE[line.type];
  const meta = RUN_META[line.type];

  /*
    THE ATOM HERE IS THE ORGANISATION, NOT THE SHIFT.

    The obvious move is to mark the whole shift block as unbreakable, and
    it is wrong. A shift with three named organisations on it is most of a
    side of paper, so refusing to split one leaves a third of the previous
    side blank and adds a sheet to the document. What must never split is
    a single organisation, because half an address at the foot of a page
    is worse than no address, and the identity of the shift must never be
    separated from its own hours and lanes. Those two things carry
    avoid-break; the section around them is allowed to flow.
  */
  return (
    <section className={styles.block}>
      <div className={`${styles.blockIdentity} avoid-break`}>
        <div className={styles.blockHead}>
          <span className={styles.blockGlyph} aria-hidden="true">
            {token.glyph}
          </span>
          {/* A div rather than a span: a heading is flow content and cannot
              legally sit inside a phrasing element, and the location IS the
              heading of this block. */}
          <div className={styles.blockHeadText}>
            <span className={styles.blockType}>{token.label}</span>
            <h3 className={styles.blockWhere}>{line.locationLabel}</h3>
          </div>
          <span className={styles.blockHours}>
            <span className={`${styles.blockHoursValue} num`}>
              {hoursLabel(line.hours)}
            </span>
            <span className={styles.blockHoursUnit}>
              {line.hours === 1 ? "hour" : "hours"}
            </span>
          </span>
        </div>

        <dl className={styles.blockFacts}>
          <div className={styles.blockFact}>
            <dt>Target conversations</dt>
            <dd>
              <span className="num">{line.targetConversations}</span>
              <ProvenanceBadge provenance="modeled" compact />
            </dd>
          </div>
          <div className={styles.blockFact}>
            <dt>Owner</dt>
            <dd>{seatLabel(line.seatId)}</dd>
          </div>
          <div className={styles.blockFact}>
            <dt>Lane focus</dt>
            <dd className={styles.blockLanes}>
              {line.laneFocus.map((lane) => (
                <LaneChip key={lane} lane={lane} size="sm" />
              ))}
            </dd>
          </div>
          <div className={styles.blockFact}>
            <dt>State</dt>
            <dd>
              {line.completedAt ? (
                <span className={styles.stateDone}>
                  <span aria-hidden="true">●</span>
                  <span>Completed {formatShort(line.completedAt)}</span>
                </span>
              ) : (
                <span className={styles.statePlanned}>
                  <span aria-hidden="true">○</span>
                  <span>Planned</span>
                </span>
              )}
            </dd>
          </div>
        </dl>

        {line.notes ? <p className={styles.blockNote}>{line.notes}</p> : null}
      </div>

      {run.entries.length > 0 ? (
        <div className={styles.run}>
          <div className={styles.runHeading}>
            <h4 className={styles.runTitle}>{meta.heading}</h4>
            <ProvenanceBadge provenance="modeled" compact />
          </div>
          <p className={styles.runRule}>{meta.rule}</p>
          <ol className={styles.runList}>
            {run.entries.map((entry) => (
              <RunRow key={entry.prospect.id} entry={entry} line={line} />
            ))}
          </ol>
          {run.more > 0 ? (
            <p className={styles.runMore}>
              {run.more} more organisation{run.more === 1 ? " " : "s "}
              in these lanes {run.more === 1 ? "sits" : "sit"} on the desk,
              ranked. The sheet carries the first {RUN_SIZE}, which is what
              fits beside the hours above.
            </p>
          ) : null}
        </div>
      ) : null}

      <p className={styles.conversations}>
        <span className={styles.writeInLabel}>
          Conversations actually had, against a target of {line.targetConversations}
        </span>
        <span className={`${styles.rule} ${styles.ruleShort}`} aria-hidden="true" />
      </p>
    </section>
  );
}

function ObjectionCard({ row, weekHours }: { row: RankedObjection; weekHours: number }) {
  const o = row.objection;
  const sev = SEVERITY_META[o.severity];

  return (
    <article className={`${styles.objection} avoid-break`}>
      <div className={styles.objectionHead}>
        {/*
          SEVERITY_META has exactly the shape of a StatusToken, so the
          severity rides the shared chip rather than a fourth chip
          component with slightly different padding. TokenChip exists for
          precisely this: a vocabulary that is not one of the four unions
          StatusChip knows about, rendered with the same glyph, word and
          colour in the same order of importance.
        */}
        <TokenChip token={sev} size="sm" />
        <h3 className={styles.objectionTitle}>{o.short}</h3>
        <span className={styles.objectionHours}>
          <span className="num">{hoursLabel(row.hours)}</span> of{" "}
          <span className="num">{hoursLabel(weekHours)}</span> planned hours
          this week sit in a lane that raises it
        </span>
      </div>

      <blockquote className={styles.voice}>
        <span className={styles.voiceLabel}>What they say</span>
        <p>{o.voice}</p>
      </blockquote>

      {/*
        WHY THEY ARE RIGHT is screen only, and that is a decision about the
        medium rather than about the sentence. Conceding the point before
        answering it is the part of this that actually works, and it is
        also the part a rep has to have understood BEFORE they are standing
        in the lobby. On paper the space goes to the answer, because the
        answer is the thing you glance down at with somebody watching.
      */}
      <p className={`${styles.why} no-print`}>
        <span className={styles.whyLabel}>Why they are right</span>
        {o.why}
      </p>

      <div className={styles.answer}>
        <span className={styles.answerLabel}>The answer</span>
        <p>{o.answer}</p>
      </div>

      <p className={styles.cost}>
        <span className={styles.costLabel}>What answering this way costs</span>
        {o.cost}
      </p>
    </article>
  );
}

function LaneAsk({ lane }: { lane: Lane }) {
  const meta = LANE_META[lane];
  const offer = offerForLane(lane);

  return (
    <li className={`${styles.ask} avoid-break`}>
      <div className={styles.askHead}>
        <LaneChip lane={lane} size="sm" />
        <span className={styles.askDoor}>Through the {meta.doorNoun}</span>
      </div>
      {offer ? (
        <p className={styles.askWhat}>
          <span className={styles.askLabel}>I am asking for</span>
          <strong>{offer.name}.</strong> {offer.what}{" "}
          <ProvenanceBadge provenance={offer.provenance} compact />
        </p>
      ) : null}
      <p className={styles.askProblem}>
        <span className={styles.askLabel}>Because</span>
        {meta.preOpeningProblem}
      </p>
    </li>
  );
}

// ---------------------------------------------------------------
// The page
// ---------------------------------------------------------------

/**
 * A class on the body, added only while this page is mounted.
 *
 * The shell's own chrome is not this page's to edit, and a print rule
 * that hid every application header would sit in the shared print
 * stylesheet and fire on screens that want their heading printed. Scoping
 * the rules under a body class that exists for the life of this component
 * keeps the blast radius exactly one page wide, and the class comes off
 * again on unmount.
 */
const PRINT_BODY_CLASS = "week-sheet-print";

export function WeekSheetPage() {
  const { activity } = useBook();
  const pipeline = usePipeline();
  const dispatch = usePipelineDispatch();

  const period = PERIOD_BY_ID[pipeline.periodId] ?? PERIODS[0];

  useEffect(() => {
    document.body.classList.add(PRINT_BODY_CLASS);
    return () => document.body.classList.remove(PRINT_BODY_CLASS);
  }, []);

  /** Every week in the plan that falls inside the period on the chrome. */
  const weeks = useMemo(
    () =>
      activityByWeek(activity).filter(
        (w) => w.week >= period.startDate && w.week <= period.endDate,
      ),
    [activity, period.startDate, period.endDate],
  );

  const [picked, setPicked] = useState<string | null>(null);
  const week = weeks.find((w) => w.week === picked) ?? weeks[0];

  /** Periods that do carry planned work, for the empty state below. */
  const periodsWithWork = useMemo(() => {
    const all = activityByWeek(activity);
    return PERIODS.filter((p) =>
      all.some((w) => w.week >= p.startDate && w.week <= p.endDate),
    );
  }, [activity]);

  const totals = useMemo(
    () => activityTotals(week ? week.lines : []),
    [week],
  );

  /** The week's shifts in the order the plan wrote them. */
  const ordered = useMemo(
    () => (week ? [...week.lines].sort((a, b) => a.sortOrder - b.sortOrder) : []),
    [week],
  );

  /**
   * Every run list for the week, built in one pass.
   *
   * It has to be one pass rather than one per block, because each list
   * depends on the ones before it: an organisation named on Tuesday is
   * not offered again on Thursday. Doing this inside each block would
   * have been less code and would have produced a sheet that sends a rep
   * to the same reception twice in a week.
   */
  const runs = useMemo(() => {
    const named = new Set<string>();
    const out = new Map<string, { entries: RunEntry[]; more: number }>();
    for (const line of ordered) {
      const run = runFor(line, named);
      for (const entry of run.entries) named.add(entry.prospect.id);
      out.set(line.id, run);
    }
    return out;
  }, [ordered]);

  const objections = useMemo(
    () => objectionsForWeek(week ? week.lines : []),
    [week],
  );

  const lanes = useMemo(() => {
    const present = new Set<Lane>();
    for (const line of week ? week.lines : []) {
      for (const lane of line.laneFocus) present.add(lane);
    }
    return LANE_ORDER.filter((lane) => present.has(lane));
  }, [week]);

  const weeksToOpen = week
    ? Math.max(0, period.weeksToOpen - weeksApart(period.startDate, week.week))
    : period.weeksToOpen;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* ---------------------------------------------------------
            Screen only. Everything from the sheet down is the document.
            --------------------------------------------------------- */}
        <div className={`${styles.controls} no-print`}>
          <div className={styles.controlsText}>
            <p className={styles.eyebrow}>Take it with you</p>
            <h1 className={styles.h1}>The week sheet</h1>
            {/* No revenue figure anywhere on this sheet. It is the outbound
                ledger and an activity line has no revenue field. */}
            <p className={styles.subLede}>
              Outbound ledger only, no revenue figure.{" "}
              <Link to="/book">Both ledgers are on the Book</Link>.
            </p>
          </div>

          <div className={styles.controlsActions}>
            <Button
              variant="primary"
              glyph="▤"
              onClick={() => window.print()}
              aria-label="Print this week sheet"
            >
              Print this sheet
            </Button>
            <p className={styles.printNote}>
              Black on white, no filled panels.
            </p>
          </div>
        </div>

        {weeks.length === 0 ? (
          <div className={`${styles.empty} no-print`}>
            <h2 className={styles.emptyTitle}>
              <span aria-hidden="true">○</span> No outbound work is planned in{" "}
              {period.label}
            </h2>
            <p>The periods that carry planned work:</p>
            <div className={styles.emptyActions}>
              {periodsWithWork.map((p) => (
                <Button
                  key={p.id}
                  variant="secondary"
                  glyph="▦"
                  onClick={() =>
                    dispatch({ type: "SET_PERIOD", periodId: p.id })
                  }
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        {weeks.length > 1 ? (
          <div
            className={`${styles.picker} no-print`}
            role="group"
            aria-label="Choose which week to print"
          >
            <span className={styles.pickerLabel}>Week</span>
            {weeks.map((w) => (
              <button
                key={w.week}
                type="button"
                className={styles.pickerBtn}
                aria-pressed={week?.week === w.week}
                onClick={() => setPicked(w.week)}
              >
                <span className="num">{formatShort(w.week)}</span>
                <span className={styles.pickerHours}>
                  <span className="num">{hoursLabel(w.hours)}</span> h
                </span>
              </button>
            ))}
          </div>
        ) : null}

        {/* ---------------------------------------------------------
            THE SHEET. Everything below this line is the printed page.
            --------------------------------------------------------- */}
        {week ? (
          <article className={styles.sheet}>
            <div className={`${styles.masthead} avoid-break`}>
              <div className={styles.mastheadTop}>
                <p className={styles.sheetEyebrow}>
                  The Opening Book, outbound week sheet
                </p>
                <p className={styles.sheetVenue}>
                  {VENUE.name}, {VENUE.address}, {VENUE.city} {VENUE.state}{" "}
                  {VENUE.postalCode}. Venue line{" "}
                  <span className="num">{VENUE.phone}</span>.
                </p>
              </div>

              <h2 className={styles.sheetTitle}>{formatWeek(week.week)}</h2>
              <p className={styles.sheetRange}>
                <span className="num">{weekRange(week.week)}</span>, inside{" "}
                {period.label}
              </p>

              <dl className={styles.headline}>
                <div className={styles.headlineItem}>
                  <dt>Weeks to open</dt>
                  <dd>
                    <span className={`${styles.headlineValue} num`}>
                      {weeksToOpen}
                    </span>
                    <ProvenanceBadge provenance="illustrative" compact />
                  </dd>
                </div>
                <div className={styles.headlineItem}>
                  <dt>Hours outside the building</dt>
                  <dd>
                    <span className={`${styles.headlineValue} num`}>
                      {hoursLabel(totals.outsideHours)}
                    </span>
                    <span className={styles.headlineOf}>
                      of {hoursLabel(totals.hours)} committed
                    </span>
                  </dd>
                </div>
                <div className={styles.headlineItem}>
                  <dt>Shifts</dt>
                  <dd>
                    <span className={`${styles.headlineValue} num`}>
                      {week.lines.length}
                    </span>
                  </dd>
                </div>
                <div className={styles.headlineItem}>
                  <dt>Target conversations</dt>
                  <dd>
                    <span className={`${styles.headlineValue} num`}>
                      {totals.targetConversations}
                    </span>
                    <ProvenanceBadge provenance="modeled" compact />
                  </dd>
                </div>
              </dl>

              {/*
                THE SENTENCE THAT HAS TO BE ON THE PAPER. A rep who is
                asked "when do you open" in a school reception and guesses
                has created a problem no discount fixes. Main Event
                publishes no date, so the sheet says so in words, every
                week, in the place the eye lands first.
              */}
              <p className={styles.noDate}>
                <span aria-hidden="true">▲</span>
                <span>
                  Main Event publishes no opening date and no hours for Brea.
                  The countdown above is this plan&apos;s own numbering in
                  weeks, not a date anybody has announced. If you are asked
                  today, the true answer is that the date is not published
                  yet, and the ask is a place in line rather than a deposit.
                </span>
              </p>
            </div>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNum} aria-hidden="true">
                  1
                </span>
                The work, and who to see while doing it
              </h2>
              {ordered.map((line) => (
                <ActivityBlock
                  key={line.id}
                  line={line}
                  run={runs.get(line.id) ?? { entries: [], more: 0 }}
                />
              ))}
            </section>

            {/*
              NO FORCED PAGE BREAK HERE, and that is a decision that was
              made the other way first.

              Starting the answers on a fresh side reads well in the
              abstract: where I am going on the front, what to say on the
              back. On real paper it left a third of a side blank and
              added a sheet, because a week's shifts do not politely end
              at the foot of a page. Every answer already carries
              avoid-break, so no objection is ever split across the fold,
              which is the part that actually matters. The shared
              page-break class in print.css is there for a document that
              needs it; this one does not, and using it to make a point
              would cost a sheet of paper per printout.
            */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNum} aria-hidden="true">
                  2
                </span>
                The three objections this week
              </h2>
              <p className={styles.sectionNote}>
                Ranked by planned hours in the lanes that raise them.{" "}
                {/* The full stop sits INSIDE the hidden span. A sentence
                    that ends on a stranded piece of punctuation because a
                    link was dropped for print is exactly the detail that
                    tells a reader nobody looked at the printed version. */}
                <span className="no-print">
                  <Link to="/objections">
                    All seven, with what each answer costs
                  </Link>
                  .
                </span>
              </p>
              {objections.length === 0 ? (
                <p className={styles.blockNote}>
                  No hours are planned this week, so there is nothing to rank.
                </p>
              ) : (
                objections.map((row) => (
                  <ObjectionCard
                    key={row.objection.id}
                    row={row}
                    weekHours={totals.hours}
                  />
                ))
              )}
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNum} aria-hidden="true">
                  3
                </span>
                What I am asking for, lane by lane
              </h2>
              <p className={styles.sectionNote}>
                The most specific pre-opening offer each lane is eligible for.
              </p>
              <ul className={styles.askList}>
                {lanes.map((lane) => (
                  <LaneAsk key={lane} lane={lane} />
                ))}
              </ul>
            </section>

            <section className={`${styles.section} avoid-break`}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNum} aria-hidden="true">
                  4
                </span>
                What the week actually produced
              </h2>
              <p className={styles.sectionNote}>
                Filled in on the way back, not at a desk on Friday.
              </p>
              <div className={styles.debrief}>
                <WriteIn label="Conversations had, total" />
                <WriteIn label="Names and titles worth a second touch" />
                <WriteIn label="Anything heard about a competitor or a date" />
                <WriteIn label="The one thing to do first on Monday" />
              </div>
            </section>

            <p className="print-only print-disclaimer">
              The Opening Book. An independent work sample by Nathan J. Song,
              built for a Main Event Brea Sales Manager application. Not
              affiliated with, endorsed by or connected to Main Event
              Entertainment. Addresses, phone numbers and package terms were
              read from published sources on 11 August 2026; hours, target
              conversations and the run lists on this sheet are modeled and are
              labelled as such. Demo build, no message ever leaves the browser.
            </p>
          </article>
        ) : null}

        {week ? (
          <div className={`${styles.method} no-print`}>
            <h2 className={styles.methodTitle}>Sources</h2>
            <ul className={styles.methodList}>
              <li>
                Outbound ledger for the weeks inside {period.label}, read from
                the same array the Book reads.
              </li>
              <li>
                Outside hours count tabling, go-sees and networking events
                only. A call block is counted as work, not as outside.
              </li>
              <li>
                Addresses and phone numbers from Google Places, 11 August 2026.
              </li>
              <li>
                <Link to="/method">Every formula and source</Link>.
              </li>
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
