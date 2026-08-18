import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { OccasionClass } from "@/domain/types";
import { PROSPECTS, DOOR_ONLY } from "@/data/prospects";
import { PACKAGES, PRICED_PACKAGES, GATED_PACKAGES } from "@/data/packages";
import { OBJECTIONS } from "@/data/objections";
import { VENUE, PERIOD_BY_ID } from "@/data/venue";
import {
  DOORS_PER_CREW_SLOT,
  LANE_META,
  LANE_ORDER,
  OCCASION_CLASS_META,
  crewSlotsForDoors,
} from "@/domain/lanes";
import { LEDGER } from "@/domain/vocabulary";
import { windowOpensWithin } from "@/domain/selectors/desk";
import { touchesFor, usePipeline } from "@/state/PipelineProvider";
import {
  activityTotals,
  hoursPerThousandBooked,
  revenueTotals,
  useBook,
} from "@/state/BookProvider";
import {
  Figure,
  ProvenanceBadge,
  WithheldFigure,
} from "@/components/primitives/ProvenanceBadge";
import { LaneChip } from "@/components/primitives/LaneChip";
import styles from "./CoachingPage.module.css";

/**
 * HOW I WOULD RUN THE WEEK.
 *
 * This is the screen about the moment the money lands. A marketing
 * manager does not coach a sales team here; the posting has them
 * partner "closely with General Managers and operational leaders as the
 * brand's go-to marketing expert" and work "with the digital marketing
 * agencies to optimize PPC, LSA, retargeting". Between those two sits
 * the thing that decides whether any of that spend converts: WHAT IS
 * SAID WHEN THE PHONE IS ANSWERED.
 *
 * SPEED TO LEAD IS WHERE PAID MEDIA IS EITHER CONVERTED OR WASTED. A
 * call from a Local Services Ad costs the same whether it is answered in
 * twenty seconds or goes to voicemail at six in the evening, and the
 * household that reaches voicemail calls the next brand on the results
 * page without a second thought. So the customer service script at the
 * moment a lead arrives is a marketing asset, not an operations detail,
 * and this screen treats it as one.
 *
 * ── WHY THE RAMP IS ORDERED THE WAY IT IS ──────────────────────────
 * The ordinary shape of this training is: here are the coupons, here is
 * what is on them, here is the script, go. That order teaches somebody
 * to be fluent in the half of the shelf that does not need them. The
 * priced offers sell themselves off a phone at eleven at night: a 47
 * dollar tune-up needs no explaining. The money that recurs is in the
 * tier nobody publishes a price for, and it is the tier a coached
 * conversation is worth anything on.
 *
 * So the ramp opens at the line through the offer shelf, and every step
 * after it is ordered by what somebody can get wrong before they have
 * been taught the step below. THE ORDER IS THE ARGUMENT, so each step
 * carries its reason for sitting where it does. A numbered list with no
 * reasons attached is a curriculum; a numbered list with reasons is a
 * decision somebody can disagree with, which is the only kind worth
 * publishing.
 *
 * ── WHY THE CALL FRAME IS TWO COLUMNS AND NOT ONE CHECKLIST ────────
 * The biggest distinction in this console is the one between demand that
 * arrives because something failed and demand somebody chose to create.
 * On the service line board that split decides WHERE THE BUDGET GOES.
 * Here it decides WHAT THE CALL IS, and the two conversations have
 * almost nothing in common: one competes against whoever answers second,
 * the other competes against a household deciding to wait another year.
 * Run the wrong one and the call is lost inside ninety seconds while
 * everybody stays perfectly pleasant, which is the hardest failure in a
 * call centre to hear from the outside.
 *
 * The two columns run cool and warm, exactly as they do on the service
 * line board, so a reader who has learned the temperature once reads it
 * here for free. Colour is the third signal as always: each column
 * carries its class glyph, its class name and its service lines spelled
 * out.
 *
 * ── WHY THE MEASUREMENT SECTION SPLITS THE VERBS ───────────────────
 * Activity is COACHED. Revenue is MANAGED. A person controls whether
 * they were standing in a home show aisle at noon on Tuesday and how
 * fast they picked up; they do not control whether a management company
 * signs. Coaching somebody on an outcome they cannot move teaches them
 * that effort and result are unrelated, and a team that believes that
 * stops trying. So the leading indicators here carry targets and the
 * lagging ones carry provenance badges, and the page never prints them
 * in the same sentence.
 *
 * Every figure in that section is read off the live state rather than
 * typed into the prose. Advance a row on the desk or complete a shift on
 * the field page and these numbers move, which is the only way a page
 * about measurement can be honest about measurement.
 *
 * ── NO INVENTED PEOPLE ─────────────────────────────────────────────
 * Every person named on this page is a role. Marketing manager, customer
 * service representative, community manager, practice manager, general
 * manager. There is not one human name anywhere in this console, because
 * a work sample that invents a person has invented the single kind of
 * fact a reader has no way to check.
 */

// ---------------------------------------------------------------
// Counts that cannot drift, because they are read off the sources
// ---------------------------------------------------------------

const PRICED = PRICED_PACKAGES.length;
const GATED = GATED_PACKAGES.length;
const TOTAL_PACKAGES = PACKAGES.length;
const OBJECTION_COUNT = OBJECTIONS.length;
const DOOR_ONLY_COUNT = DOOR_ONLY.length;
const PROSPECT_COUNT = PROSPECTS.length;

/**
 * The service lines in each class, once, for both the call frame columns
 * and the counts printed on them.
 */
const LANES_BY_CLASS: Record<OccasionClass, typeof LANE_ORDER> = {
  "calendar-locked": LANE_ORDER.filter(
    (lane) => LANE_META[lane].occasionClass === "calendar-locked",
  ),
  discretionary: LANE_ORDER.filter(
    (lane) => LANE_META[lane].occasionClass === "discretionary",
  ),
};

/** 300 doors, in crew days, at this console's own planning rate. */
const LANES_FOR_THREE_HUNDRED = crewSlotsForDoors(300);

// ---------------------------------------------------------------
// The ramp
// ---------------------------------------------------------------

interface RampStep {
  /** When in the ramp this lands. Days and weeks, not hours. */
  when: string;
  title: string;
  what: ReactNode;
  /** The reason this step sits at this number and not one lower. */
  why: string;
}

const RAMP: RampStep[] = [
  {
    when: "Day one, before a single offer is quoted",
    title: "The line through the offer shelf",
    what: (
      <>
        Sort the shelf into the offers a brand publishes a price for and the
        ones it does not. There are{" "}
        <strong className="num">{PRICED}</strong> of the first and{" "}
        <strong className="num">{GATED}</strong> of the second, out of{" "}
        <strong className="num">{TOTAL_PACKAGES}</strong> read off the brands'
        own pages. The priced ones are what a household finds alone at night
        on a phone. Almost every gated one is a membership plan that names its
        benefits and routes the price to a phone number, which is where a
        conversation is worth something and a coupon is not.
        <span className={styles.inlineProv}>
          <ProvenanceBadge provenance="public" compact />
        </span>
      </>
    ),
    why: "First, because everything a coached conversation is worth sits above that line. Somebody who does not know where the line falls will lead with the tune-up price, because a published number is the easiest thing in the world to say out loud, and the brand will have paid for a call to close a sale the website closes for nothing.",
  },
  {
    when: "Day one, in the same sitting",
    title: "The two ledgers, and the one they will be tempted to report",
    what: (
      <>
        Signed work carries money. Tabling, go-sees, community events and
        call blocks carry hours and carry no money at all. There is no revenue
        field on an activity line anywhere in this console, and there is not
        one on the weekly report to the division either.
      </>
    ),
    why: "Second, because it is the first thing anybody gets wrong, and they get it wrong on a Friday afternoon while feeling good about the week. Activity is always the easiest thing to report, which is precisely when it starts wearing revenue's clothes. Settle it in week one and nobody ever has to unpick a forecast built out of hours.",
  },
  {
    when: "Week one, before the first call is answered",
    title: "Which kind of call is on the line",
    what: (
      <>
        Two classes and no third. A non-discretionary call is a failure: no
        cooling, no hot water, water on the floor. The household is buying
        today and is comparing answer times rather than prices. A
        discretionary call is a plan: a panel upgrade, a tankless swap, a
        membership. Both are real money. They are not the same call.
      </>
    ),
    why: "Third, because it decides which of the two frames below gets run, and it is the only item on this list that cannot be corrected mid-call. Every other mistake here can be walked back with a follow-up. Running the wrong frame is finished inside the first ninety seconds and the caller is usually too polite to say why.",
  },
  {
    when: "Week one",
    title: "The nine service lines, and what the way in is called each time",
    what: (
      <>
        A homeowner with a failed compressor arrives through a published
        service area page and a local pack listing. A community association
        arrives through a board agenda and a community manager. A management
        company arrives through a maintenance supervisor who wants one number
        for after-hours failures, and never through a coupon. Say the wrong
        one and the caller knows in a sentence that they are on a list.
      </>
    ),
    why: "Fourth, after the class of call, because the way in is a property of the service line and the line already tells you the class. Learn the words a line uses and the first sentence of every conversation and every email writes itself.",
  },
  {
    when: "Week one, and specifically before anybody is allowed to hold a date",
    title: "The arithmetic that limits every promise",
    what: (
      <>
        This console plans one crew slot per{" "}
        <strong className="num">{DOORS_PER_CREW_SLOT}</strong> doors,
        against a working assumption of{" "}
        <strong className="num">{VENUE.crewSlotsModelledFloor}</strong>{" "}
        crew slots a day at the Brea branch. So a 300 door portfolio is{" "}
        <strong className="num">{LANES_FOR_THREE_HUNDRED}</strong> crew days,
        which is more than half a fortnight of the branch, and two of them
        landing in the same week is the whole branch.
        <span className={styles.inlineProv}>
          <ProvenanceBadge provenance="modeled" compact />
        </span>
      </>
    ),
    why: "Fifth, and before anybody may hold a date, because this is the only mistake on the list that costs a customer rather than a call. Work promised that the crew cannot run becomes a reschedule, an apology from a general manager, and a property manager who tells every other manager in the association. Both figures are this console's own and neither is published by any brand.",
  },
  {
    when: "Week two, before the first difficult conversation",
    title: "The rebate objection, and everything after it",
    what: (
      <>
        <strong className="num">{OBJECTION_COUNT}</strong> objections sit in
        the register with an answer against each and, more usefully, with what
        each answer costs. The one that matters this season is the incentive
        that no longer exists: the federal credit ended for anything placed in
        service after 31 December 2025, the state single family programme is
        fully reserved, and competitors are still advertising both. Callers
        arrive quoting money nobody can give them.{" "}
        <Link to="/objections">The register</Link>.
      </>
    ),
    why: "Sixth, because somebody who meets \"my neighbour got a tax credit for this\" without a prepared answer will agree, or hedge, or promise to check. All three cost the sale later. The honest answer names what died, names what is still live, and puts the live one in writing with the date it runs out, which is a better conversation than the one the competitor is having.",
  },
  {
    when: "Week two, and last on purpose",
    title: "The go-see",
    what: (
      <>
        <strong className="num">{DOOR_ONLY_COUNT}</strong> of the{" "}
        <strong className="num">{PROSPECT_COUNT}</strong> organisations in this
        territory publish no email address anywhere on their own website. Not
        a hard one to find; none at all. Those are visits, and a visit is the
        most expensive touch there is: an afternoon against two minutes.{" "}
        <Link to="/field">The runs</Link>.
        <span className={styles.inlineProv}>
          <ProvenanceBadge provenance="public" compact />
        </span>
      </>
    ),
    why: "Last, because a go-see spends the scarce resource and cannot be taken back. Sending somebody into a management office before they can answer the rebate question or name a response time spends an afternoon to make a worse impression than an email would have made for free.",
  },
];

// ---------------------------------------------------------------
// The call frame
// ---------------------------------------------------------------

interface CallFrame {
  /** The first question out of the representative's mouth, verbatim. */
  opening: string;
  openingNote: string;
  /** What is actually on the other side of the table. */
  against: string;
  closes: string;
  failure: string;
  leadWith: string;
}

/**
 * Two frames, and the fields are deliberately identical so the columns can
 * be read across rather than down.
 *
 * A reader comparing "what closes it" in both columns learns the whole
 * argument of this section in one movement of the eye, which a pair of
 * bulleted lists with different headings could never do.
 */
const CALL_FRAME: Record<OccasionClass, CallFrame> = {
  "calendar-locked": {
    opening:
      "What is it doing right now, and how long has it been doing it? I can have somebody there this afternoon.",
    openingNote:
      "Never \"how can I help you today\". They have already told the search engine what is wrong. The first sentence back should book a time, because the caller is measuring us against whoever answers second and nothing else.",
    against:
      "The four other brands whose numbers sit on the same results page, and a voicemail box. The need is not in question and must never be sold.",
    closes:
      "A time today, said out loud, with the technician's arrival window and a text confirmation. Certainty, offered before anybody else offers it.",
    failure:
      "Quoting a price before booking the visit. A number given to somebody standing in a wet garage turns a booking into a shopping exercise, and the shopping happens on somebody else's phone.",
    leadWith:
      "The published offers. The tune-up, the drain price, the free camera inspection carry a number the caller has usually already read, so confirming it costs nothing and buys the appointment.",
  },
  discretionary: {
    opening:
      "What made you start looking at this now, and has anybody quoted you yet?",
    openingNote:
      "It finds the trigger and the competition in one sentence. If the answer is \"just researching\", that is the real state of the lead, and it is far better to know it in minute one than after three visits.",
    against:
      "Nothing happening. Another year of a system that limps, or a repair instead of a replacement. There is no emergency doing the selling, which sounds easier than it is: an emergency at least proves the money exists.",
    closes:
      "Financing terms and whatever incentive is genuinely live, in writing, with the date it expires. This is the call where a transparently priced membership beats a bigger coupon, because it turns one job into a relationship.",
    failure:
      "Running the emergency script on a planned buyer. Pushing for a same-day slot at somebody who is comparing three quotes reads as pressure, and pressure loses a considered purchase.",
    leadWith:
      "The membership programmes and the replacement family. Two brands in this group publish a monthly price and no rival profiled publishes one at all, which makes the number itself the argument.",
  },
};

// ---------------------------------------------------------------
// The one to one
// ---------------------------------------------------------------

interface AgendaItem {
  minutes: number;
  title: string;
  /** The screen the item is run from. A real route, always. */
  to: string;
  toLabel: string;
  ask: string;
  /** What somebody says when they have not done the work. */
  bad: string;
}

const AGENDA: AgendaItem[] = [
  {
    minutes: 5,
    title: "The week that just went, read off the sheet",
    to: "/book/week",
    toLabel: "This week's sheet",
    ask: "Read me the sheet. What was planned, what happened, and what did not happen.",
    bad: "\"It was a busy week.\" The sheet was printed on Monday and it either carries completions or it does not. Busy is not a unit.",
  },
  {
    minutes: 6,
    title: "What came back, including the silence",
    to: "/replies",
    toLabel: "What came back",
    ask: "Who has taken two written touches and said nothing at all?",
    bad: "Naming only the warm ones. Two touches and silence is not a refusal, it is the written door failing, and the correct response is a visit rather than a third email.",
  },
  {
    minutes: 5,
    title: "Dates held, nothing signed",
    to: "/calendar",
    toLabel: "Crew capacity by date",
    ask: "Which dates are we holding that nobody has signed, and what is the release date on each one?",
    bad: "\"They are all still live.\" A hold is worth nothing, it occupies crew capacity meanwhile, and a hold with no release date on it is a day quietly taken off the schedule by our own side.",
  },
  {
    minutes: 8,
    title: "The rebate objection, worked out loud",
    to: "/objections",
    toLabel: "The objection register",
    ask: "Give me the answer to \"my neighbour got a federal credit for this\", and then tell me what that answer costs us.",
    bad: "A fluent answer with no cost attached. Every honest answer about a dead incentive gives something away, and somebody who cannot name what they are giving away will end up giving away the wrong thing, usually the price.",
  },
  {
    minutes: 6,
    title: "Next week's hours, in the diary before we leave",
    to: "/field",
    toLabel: "Tabling and go-see runs",
    ask: "Which hall, which day, what time, and what is the ask when you are standing there?",
    bad: "\"I will get some go-sees in.\" An hour in the field that is not in a diary by the end of this meeting is an hour that will be spent at a desk.",
  },
];

const AGENDA_MINUTES = AGENDA.reduce((n, item) => n + item.minutes, 0);

// ---------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------

const money = (n: number) =>
  `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const hours = (n: number) =>
  n % 1 === 0 ? `${n}` : n.toFixed(1);

// ---------------------------------------------------------------
// The page
// ---------------------------------------------------------------

export function CoachingPage() {
  const pipeline = usePipeline();
  const { book, activity } = useBook();

  const period = PERIOD_BY_ID[pipeline.periodId];
  /* The same month the desk scores against: the first month of the
     selected period, rather than the clock on the reader's machine. A
     coaching page whose targets drift because somebody opened it in March
     would be reporting on a week nobody worked. */
  const nowMonth = Number((period?.startDate ?? "2026-09-14").slice(5, 7)) - 1;

  const revenue = useMemo(() => revenueTotals(book), [book]);
  const totals = useMemo(() => activityTotals(activity), [activity]);
  const perThousand = useMemo(
    () => hoursPerThousandBooked(activity, book),
    [activity, book],
  );

  /**
   * The one activity number worth putting a target on.
   *
   * Not touches. Not calls. TOUCHES ON A NON-DISCRETIONARY ROW WHOSE
   * SEASON IS OPEN, which is a much smaller set and the only one where a
   * touch this week is worth more than the same touch in March. Anybody
   * can produce a hundred touches a week by working the easiest names on
   * the board; this figure cannot be inflated that way, because the
   * denominator is fixed by the weather and by other organisations'
   * budget cycles rather than by anybody's effort.
   *
   * The horizon is four months, matching the desk, because marketing
   * leads the season: a heating campaign that launches in October is
   * built in August.
   */
  const windowWork = useMemo(() => {
    let inWindow = 0;
    let worked = 0;
    let touches = 0;
    for (const p of PROSPECTS) {
      if (LANE_META[p.lane].occasionClass !== "calendar-locked") continue;
      if (!windowOpensWithin(p.buyingWindow, nowMonth, 4)) continue;
      inWindow += 1;
      const n = touchesFor(pipeline, p.id);
      if (n > 0) {
        worked += 1;
        touches += n;
      }
    }
    return { inWindow, worked, touches };
  }, [pipeline, nowMonth]);

  const outsideShare =
    totals.hours > 0 ? Math.round((totals.outsideHours / totals.hours) * 100) : null;

  const typedShare =
    revenue.revenue > 0
      ? Math.round((revenue.userPricedRevenue / revenue.revenue) * 100)
      : 0;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>
            Stage four, the people side of it
            {period ? `, ${period.label}` : null}
          </p>
          <h1 className={styles.h1}>How I would run the week</h1>
          <p className={styles.lede}>
            The posting asks the manager to partner closely with general
            managers and operational leaders as the brand's go-to marketing
            expert, and to work with the digital agencies on paid search,
            Local Services Ads and retargeting. Between those two sits the
            moment that decides whether any of the spend converts: what is
            said when the phone is answered. Speed to lead is where paid media
            is either converted or wasted, so the script at the moment a lead
            lands is treated here as a marketing asset rather than as an
            operations detail.
          </p>
          <p className={styles.subLede}>
            Four things: what somebody new is taught and in what order, the two
            conversations they have to be able to tell apart, what is measured
            and which of it is coached rather than managed, and the thirty
            minutes a week where all of it is checked. Every person mentioned
            below is a role. There is no invented human being anywhere in this
            console.
          </p>
        </header>

        {/* -----------------------------------------------------------
            THE RAMP. Numbered, because the order is the argument.
            ----------------------------------------------------------- */}
        <section className={styles.section} aria-labelledby="ramp-h">
          <div className={styles.sectionHead}>
            <h2 className={styles.h2} id="ramp-h">
              The ramp
            </h2>
            <p className={styles.sectionKicker}>
              Seven steps, two weeks, and a reason attached to every position
            </p>
          </div>

          <div className={styles.prose}>
            <p>
              The ordinary shape of this training is: here are the coupons,
              here is what is on them, here is the script, go. That order
              teaches somebody to be fluent in the half of the shelf that does
              not need them.
            </p>
            <p>
              The brands in this market publish a price for{" "}
              <strong className="num">{PRICED}</strong> of the{" "}
              <strong className="num">{TOTAL_PACKAGES}</strong> offers on this
              shelf and withhold it on the other{" "}
              <strong className="num">{GATED}</strong>, almost all of which are
              membership plans that itemise the benefits and route the number
              to a phone call. The priced ones convert off a phone at eleven at
              night to somebody who has never spoken to anybody.
              <span className={styles.inlineProv}>
                <ProvenanceBadge provenance="public" compact />
              </span>{" "}
              So the value of a coached conversation sits almost entirely in
              the withheld ones, and a first week spent memorising the tune-up
              price has been spent learning the part of the job the website
              already does.
            </p>
          </div>

          <p className={styles.pull}>
            The offers that carry a price are the ones the website already
            sells. Everything a conversation is worth happens above that line.
          </p>

          <div className={styles.prose}>
            <p>
              So the ramp opens at the line through the offer shelf, and every
              step after it is placed by what somebody can get wrong before
              they have been taught the step below it. The order is the argument,
              which is why each step carries the reason it sits where it does.
            </p>
          </div>

          <ol className={styles.ramp}>
            {RAMP.map((step, i) => (
              <li key={step.title} className={styles.rampStep}>
                <div className={styles.rampNumber} aria-hidden="true">
                  {i + 1}
                </div>
                <div className={styles.rampBody}>
                  <p className={styles.rampWhen}>{step.when}</p>
                  <h3 className={styles.rampTitle}>{step.title}</h3>
                  <p className={styles.rampWhat}>{step.what}</p>
                  <p className={styles.rampWhy}>
                    <span className={styles.rampWhyLabel}>
                      <span aria-hidden="true" className={styles.rampWhyGlyph}>
                        ◬
                      </span>
                      Why it sits here
                    </span>
                    {step.why}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {/*
            The withheld price rendered in place, rather than described.
            Step one of the ramp is an argument about a specific commercial
            fact, and the fact is stronger shown than paraphrased: this is
            what a household finds on every membership page in this market.
          */}
          <div className={styles.gateBox}>
            <p className={styles.gateLabel}>
              What a household finds on all{" "}
              <strong className="num">{GATED}</strong> of the withheld offers
              <span className={styles.inlineProv}>
                <ProvenanceBadge provenance="public" compact />
              </span>
            </p>
            <WithheldFigure />
            <p className={styles.gateNote}>
              That missing number is the ramp's first lesson and the clearest
              opening in this market. Nobody can be trained to defend a price
              that is not published, and a household cannot compare one plan
              against another however hard they try. Publishing ours is the
              recommendation the evidence actually supports.{" "}
              <Link to="/lanes">Every published offer, and every gap</Link>.
            </p>
          </div>
        </section>

        {/* -----------------------------------------------------------
            THE CALL FRAME. Two columns, cool and warm, read across.
            ----------------------------------------------------------- */}
        <section className={styles.section} aria-labelledby="frame-h">
          <div className={styles.sectionHead}>
            <h2 className={styles.h2} id="frame-h">
              The call frame
            </h2>
            <p className={styles.sectionKicker}>
              Two conversations, and whoever runs the wrong one has already
              lost
            </p>
          </div>

          <div className={styles.prose}>
            <p>
              A non-discretionary caller already has the problem. The system is
              down, the garage is wet, the house is at ninety degrees. You are
              competing on answer time and arrival time, and the incumbent is
              whoever picks up second.
            </p>
            <p>
              A discretionary caller has no problem yet, only a plan. Nobody
              has decided this year is the year, there is no deadline, and the
              money could just as easily stay where it is. You are competing
              against nothing happening at all.
            </p>
            <p>
              Those are different calls, and the damage from mixing them is
              invisible from across the room, because somebody running the
              wrong frame sounds friendly and professional right up to the
              moment the caller stops replying.
            </p>
          </div>

          <div className={styles.frames}>
            {(["calendar-locked", "discretionary"] as OccasionClass[]).map(
              (cls) => {
                const meta = OCCASION_CLASS_META[cls];
                const frame = CALL_FRAME[cls];
                const lanes = LANES_BY_CLASS[cls];
                return (
                  <article
                    key={cls}
                    className={styles.frame}
                    data-occasion={cls}
                    aria-labelledby={`frame-${cls}`}
                  >
                    <header className={styles.frameHead}>
                      <p className={styles.frameClass}>
                        <span className={styles.frameGlyph} aria-hidden="true">
                          {meta.glyph}
                        </span>
                        <span>{meta.label}</span>
                      </p>
                      <h3 className={styles.frameTitle} id={`frame-${cls}`}>
                        {cls === "calendar-locked"
                          ? "Competing on who answers first"
                          : "Competing against nothing happening"}
                      </h3>
                      <p className={styles.frameWhat}>{meta.what}</p>
                      <p className={styles.frameWhen}>
                        <span className={styles.microLabel}>
                          How it is worked
                        </span>
                        {meta.when}
                      </p>
                      <ul className={styles.frameLanes}>
                        {lanes.map((lane) => (
                          <li key={lane}>
                            <LaneChip lane={lane} size="sm" />
                          </li>
                        ))}
                      </ul>
                    </header>

                    <dl className={styles.frameRows}>
                      <div className={styles.frameRow}>
                        <dt className={styles.frameRowLabel}>
                          The opening question
                        </dt>
                        <dd className={styles.frameRowValue}>
                          <p className={styles.frameQuote}>{frame.opening}</p>
                          <p className={styles.frameSmall}>
                            {frame.openingNote}
                          </p>
                        </dd>
                      </div>

                      <div className={styles.frameRow}>
                        <dt className={styles.frameRowLabel}>
                          What you are actually competing against
                        </dt>
                        <dd className={styles.frameRowValue}>
                          <p className={styles.frameText}>{frame.against}</p>
                        </dd>
                      </div>

                      <div className={styles.frameRow}>
                        <dt className={styles.frameRowLabel}>What closes it</dt>
                        <dd className={styles.frameRowValue}>
                          <p className={styles.frameText}>{frame.closes}</p>
                        </dd>
                      </div>

                      <div className={`${styles.frameRow} ${styles.frameFail}`}>
                        <dt className={styles.frameRowLabel}>
                          <span aria-hidden="true" className={styles.failGlyph}>
                            ✕
                          </span>
                          The failure mode
                        </dt>
                        <dd className={styles.frameRowValue}>
                          <p className={styles.frameText}>{frame.failure}</p>
                        </dd>
                      </div>

                      <div className={styles.frameRow}>
                        <dt className={styles.frameRowLabel}>
                          What to lead with
                        </dt>
                        <dd className={styles.frameRowValue}>
                          <p className={styles.frameText}>{frame.leadWith}</p>
                        </dd>
                      </div>
                    </dl>
                  </article>
                );
              },
            )}
          </div>

          <p className={styles.frameFoot}>
            Both frames end the same way and it is the only thing they share:
            a time, in writing, that day. Neither of them ends with sending
            some information over.
          </p>
        </section>

        {/* -----------------------------------------------------------
            WHAT GETS MEASURED. Two ledgers, two verbs.
            ----------------------------------------------------------- */}
        <section className={styles.section} aria-labelledby="measure-h">
          <div className={styles.sectionHead}>
            <h2 className={styles.h2} id="measure-h">
              What gets measured
            </h2>
            <p className={styles.sectionKicker}>
              Activity is coached. Revenue is managed. Different verbs, on
              purpose
            </p>
          </div>

          <div className={styles.prose}>
            <p>
              A person controls whether they were standing in the Kraemer
              Boulevard lobby at noon on Tuesday and how fast the phone was
              answered. They do not control whether a management company
              signs. Coaching somebody weekly on an outcome they cannot move
              teaches them that effort and result are unrelated, and a team
              that believes that stops trying by about week six.
            </p>
            <p>
              So the leading indicators carry targets and are talked about
              every week by name. The lagging ones are reviewed monthly, they
              carry their provenance, and they are never quoted in the same
              breath as the hours that produced them.
            </p>
          </div>

          <p className={styles.pull}>
            Coach the thing a person can move on Tuesday. Manage the thing
            that only moves on a contract.
          </p>

          <div className={styles.ledgers}>
            {/* --- Leading ------------------------------------------- */}
            <div className={styles.ledger} data-ledger="outbound-activity">
              <header className={styles.ledgerHead}>
                <h3 className={styles.ledgerTitle}>
                  <span className={styles.ledgerGlyph} aria-hidden="true">
                    {LEDGER["outbound-activity"].glyph}
                  </span>
                  Leading, and coached weekly
                </h3>
                <p className={styles.ledgerNote}>
                  {LEDGER["outbound-activity"].note} Every figure here is a
                  count of work promised or done, and not one of them is
                  allowed to appear in dollars.
                </p>
              </header>

              <ul className={styles.metrics}>
                <li className={styles.metric}>
                  <p className={styles.metricValue}>
                    <span className="num">{windowWork.worked}</span>
                    <span className={styles.metricOf}>
                      of <span className="num">{windowWork.inWindow}</span>
                    </span>
                    <ProvenanceBadge provenance="illustrative" compact />
                  </p>
                  <p className={styles.metricLabel}>
                    Non-discretionary organisations touched inside their season
                  </p>
                  <p className={styles.metricNote}>
                    The only activity number worth a target.{" "}
                    <span className="num">{windowWork.touches}</span> touches
                    have gone into those organisations this period. The
                    denominator is set by the weather and by other people's
                    budget cycles rather than by anybody's effort, which is
                    exactly why it cannot be inflated by working the easiest
                    names on the board.
                  </p>
                </li>

                <li className={styles.metric}>
                  <p className={styles.metricValue}>
                    <span className="num">{hours(totals.outsideHours)}</span>
                    <span className={styles.metricOf}>
                      of <span className="num">{hours(totals.hours)}</span>{" "}
                      hours
                    </span>
                    <ProvenanceBadge provenance="illustrative" compact />
                  </p>
                  <p className={styles.metricLabel}>
                    Hours in the field, of hours planned this period
                  </p>
                  <p className={styles.metricNote}>
                    {outsideShare === null ? (
                      "No hours are planned in this period yet, so there is no share to show."
                    ) : (
                      <>
                        <span className="num">{outsideShare}%</span> of the
                        plan happens somewhere other than a desk. Local
                        marketing that never leaves an ad account is
                        indistinguishable from the last agency's. Call blocks
                        and email sequences are counted honestly and are not
                        this, and a week that hits its hours from a chair has
                        not hit it.
                      </>
                    )}
                  </p>
                </li>

                <li className={styles.metric}>
                  <p className={styles.metricValue}>
                    <span className="num">{totals.byType["venue-tour"]}</span>
                    <ProvenanceBadge provenance="illustrative" compact />
                  </p>
                  <p className={styles.metricLabel}>
                    Branch mornings and ride-alongs, planned
                  </p>
                  <p className={styles.metricNote}>
                    The cheapest way to find out what the crew can actually
                    deliver before it is promised in an advert: an hour in
                    dispatch, a ride-along on a call, a partner walked through
                    the branch. It is the operational alignment the posting
                    names, counted in hours rather than asserted in a bullet.
                  </p>
                </li>
              </ul>
            </div>

            {/* --- Lagging ------------------------------------------- */}
            <div className={styles.ledger} data-ledger="booked-revenue">
              <header className={styles.ledgerHead}>
                <h3 className={styles.ledgerTitle}>
                  <span className={styles.ledgerGlyph} aria-hidden="true">
                    {LEDGER["booked-revenue"].glyph}
                  </span>
                  Lagging, and managed monthly
                </h3>
                <p className={styles.ledgerNote}>
                  {LEDGER["booked-revenue"].note} Nothing reaches this column
                  until it is signed, so a held date is worth zero here and
                  says so.
                </p>
              </header>

              <ul className={styles.metrics}>
                <li className={styles.metric}>
                  <p className={styles.metricValue}>
                    <span className="num">{revenue.contracts}</span>
                    <span className={styles.metricOf}>
                      agreements, <span className="num">{revenue.guests}</span>{" "}
                      doors
                    </span>
                    <ProvenanceBadge provenance="illustrative" compact />
                  </p>
                  <p className={styles.metricLabel}>Signed, this period</p>
                  <p className={styles.metricNote}>
                    Two agreements is roughly what a territory looks like once
                    one person has worked it for a few weeks. Treating that as
                    a performance problem in week three produces somebody who
                    sends four emails instead of two and burns the list.
                  </p>
                </li>

                <li className={styles.metric}>
                  <p className={styles.metricValue}>
                    <Figure
                      value={money(revenue.revenue)}
                      provenance="modeled"
                      compact
                    />
                  </p>
                  <p className={styles.metricLabel}>
                    Booked value, at the price on each line
                  </p>
                  <p className={styles.metricNote}>
                    <span className="num">{typedShare}%</span> of it rests on a
                    price a person typed rather than a price a brand published,
                    and that share is the number a general manager should
                    actually want to see.{" "}
                    <Link to="/calendar">The book, both ledgers</Link>.
                  </p>
                </li>

                <li className={styles.metric}>
                  <p className={styles.metricValue}>
                    <Figure
                      value={money(revenue.deposits)}
                      provenance="modeled"
                      compact
                    />
                  </p>
                  <p className={styles.metricLabel}>
                    Deposits collected, at each line's own percentage
                  </p>
                  <p className={styles.metricNote}>
                    Cash, rather than intention. The single most useful
                    question in a monthly review is which agreements have a
                    deposit against them and which are a signature waiting for
                    somebody's finance department.
                  </p>
                </li>

                <li className={styles.metric}>
                  <p className={styles.metricValue}>
                    {perThousand === null ? (
                      <span className={styles.metricAbsent}>No ratio yet</span>
                    ) : (
                      <Figure
                        value={perThousand.toFixed(1)}
                        provenance="modeled"
                        compact
                      />
                    )}
                  </p>
                  <p className={styles.metricLabel}>
                    Hours in the field per $1,000 booked
                  </p>
                  <p className={styles.metricNote}>
                    The one place the two ledgers are allowed to meet, as a
                    ratio and never as a sum. It starts terrible, because the
                    first bookings cost the most work, and it is the honest way
                    to make activity legible without letting it pretend to be
                    revenue.
                  </p>
                </li>
              </ul>
            </div>
          </div>

          <div className={styles.rules}>
            <h3 className={styles.rulesTitle}>
              Three rules that keep the split honest
            </h3>
            <ol className={styles.rulesList}>
              <li>
                No leading indicator is ever reported in dollars. There is no
                revenue field on an activity line in this codebase, and there
                is not one on a weekly report either.
              </li>
              <li>
                No lagging number is ever used to coach a single week. A month
                is the shortest window in which a contract figure says anything
                about a person rather than about a calendar.
              </li>
              <li>
                Somebody hitting every leading indicator with nothing behind
                it after eight weeks is not working too little. They are
                working the wrong list, and that is the manager's error to
                correct, not theirs.
              </li>
            </ol>
          </div>
        </section>

        {/* -----------------------------------------------------------
            THE ONE TO ONE. Every item opens the screen it is run from.
            ----------------------------------------------------------- */}
        <section className={styles.section} aria-labelledby="oneToOne-h">
          <div className={styles.sectionHead}>
            <h2 className={styles.h2} id="oneToOne-h">
              The one-to-one
            </h2>
            <p className={styles.sectionKicker}>
              <span className="num">{AGENDA_MINUTES}</span> minutes, same time
              every week, run off these screens
            </p>
          </div>

          <div className={styles.prose}>
            <p>
              This meeting is run off the application rather than off a
              spreadsheet somebody rebuilt on Sunday night, and that is the
              whole reason the application exists in this shape. Every item
              below opens the screen it is answered from. If a question cannot
              be answered off a screen the whole team can see, the answer is a
              story, and a story is what a pipeline review is made of when
              nobody has the facts.
            </p>
          </div>

          <ol className={styles.agenda}>
            {AGENDA.map((item) => (
              <li key={item.to} className={styles.agendaItem}>
                <div className={styles.agendaWhen}>
                  <span className={`${styles.agendaMinutes} num`}>
                    {item.minutes}
                  </span>
                  <span className={styles.agendaMinutesLabel}>min</span>
                </div>
                <div className={styles.agendaBody}>
                  <h3 className={styles.agendaTitle}>{item.title}</h3>
                  <p className={styles.agendaAsk}>{item.ask}</p>
                  <p className={styles.agendaBad}>
                    <span className={styles.microLabel}>
                      <span aria-hidden="true" className={styles.failGlyph}>
                        ✕
                      </span>
                      What a bad answer sounds like
                    </span>
                    {item.bad}
                  </p>
                  <p className={styles.agendaLink}>
                    <Link className="tap" to={item.to}>
                      {item.toLabel}
                    </Link>
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className={styles.notThis}>
            <h3 className={styles.notThisTitle}>What this meeting is not</h3>
            <p className={styles.notThisText}>
              It is not a forecast call. Nobody is asked to predict a number a
              quarter out, because asked to predict, anybody will produce a
              figure, and it will be wrong in whichever direction makes the
              next twenty minutes more comfortable. The
              forecast lives in the book and it contains only things that are
              signed.
            </p>
            <p className={styles.notThisText}>
              It is also not where losses are punished. The most useful row on
              the replies screen is a no with a reason and a month attached to
              it, and a team that learns losses are expensive to report will
              stop reporting them, at which point the manager is running a
              brand on a set of numbers that has been edited for their
              comfort.{" "}
              <Link to="/replies">What came back, including the silence</Link>.
            </p>
          </div>
        </section>

        <p className={styles.foot}>
          Every person on this page is a role: marketing manager, customer
          service representative, community manager, practice manager, general
          manager. There is no invented human being anywhere in this console.
          The offer counts were read off the brands' own pages on 18 August
          2026. The one slot per twenty doors rule and the assumption of{" "}
          <strong className="num">{VENUE.crewSlotsModelledFloor}</strong>{" "}
          crew slots a day are this console's own and are published by nobody,
          which is why they are badged modelled everywhere they appear. The
          figures in the measurement section are read live off this session's
          state, so advancing a row on the desk or completing a shift in the
          field moves them while you watch.
        </p>
      </div>
    </div>
  );
}
