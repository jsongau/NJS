import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { OccasionClass } from "@/domain/types";
import { PROSPECTS, DOOR_ONLY } from "@/data/prospects";
import { PACKAGES, PRICED_PACKAGES, GATED_PACKAGES } from "@/data/packages";
import { OBJECTIONS } from "@/data/objections";
import { VENUE, PERIOD_BY_ID } from "@/data/venue";
import {
  GUESTS_PER_BOWLING_LANE,
  LANE_META,
  LANE_ORDER,
  OCCASION_CLASS_META,
  lanesForGuests,
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
 * This is the only screen in the application that is about PEOPLE rather
 * than prospects, and it is here because the job posting asks for it in
 * its own words: "Build and manage a high-performing sales team,
 * providing mentorship, training, and support." Every other page argues
 * that the trade area has been read properly. This one argues that a
 * second and a third person could be put in front of it on a Monday and
 * would know what to do by Friday.
 *
 * ── WHY THE RAMP IS ORDERED THE WAY IT IS ──────────────────────────
 * The ordinary shape of venue sales training is: here are the packages,
 * here is what is in them, here is the deck, go. That order teaches a new
 * rep to be fluent in the half of the range that does not need them.
 * Main Event publishes a price for four packages in this file and gates
 * fourteen behind a sentence that says to contact the local sales
 * manager. The priced four sell themselves off a phone at eleven at
 * night. A rep who spends week one memorising the $29.99 grad pack has
 * learned the part of the job the website already does for free.
 *
 * So the ramp opens at the line through the price list, and every step
 * after it is ordered by what a rep can get wrong before they have been
 * taught the step below. THE ORDER IS THE ARGUMENT, so each step carries
 * its reason for sitting where it does. A numbered list with no reasons
 * attached is a curriculum; a numbered list with reasons is a decision
 * somebody can disagree with, which is the only kind worth publishing.
 *
 * ── WHY THE CALL FRAME IS TWO COLUMNS AND NOT ONE CHECKLIST ────────
 * The biggest distinction in this application is the one between a buyer
 * whose event exists whether or not anybody calls and a buyer who has no
 * event until a person decides there will be one. On the lane board that
 * split decides WHEN you call. Here it decides WHAT the call is, and the
 * two conversations have almost nothing in common: one competes against
 * the venue that had the party last year, the other competes against a
 * quarter in which nothing happens at all. A rep who runs the wrong one
 * has lost the call inside ninety seconds while being perfectly pleasant,
 * which is why it is the hardest failure on a floor to spot from the
 * outside.
 *
 * The two columns run cool and warm, exactly as they do on the lane
 * board, so a reader who has learned the temperature once reads it here
 * for free. Colour is the third signal as always: each column carries its
 * class glyph, its class name and its lanes spelled out.
 *
 * ── WHY THE MEASUREMENT SECTION SPLITS THE VERBS ───────────────────
 * Activity is COACHED. Revenue is MANAGED. A rep controls whether they
 * were standing in a lobby at noon on Tuesday; they do not control
 * whether a district signs. Coaching somebody on an outcome they cannot
 * move teaches them that effort and result are unrelated, and a floor
 * that believes that stops trying. So the leading indicators here carry
 * targets and the lagging ones carry provenance badges, and the page
 * never prints them in the same sentence.
 *
 * Every figure in that section is read off the live state rather than
 * typed into the prose. Advance a prospect on the desk or complete a
 * shift on the field page and these numbers move, which is the only way
 * a page about measurement can be honest about measurement.
 *
 * ── NO INVENTED PEOPLE ─────────────────────────────────────────────
 * Every person named on this page is a role. Sales Manager, event sales
 * representative, Assistant Principal for Activities, practice manager.
 * There is not one human name anywhere in this application, because a
 * work sample that invents a person has invented the single kind of fact
 * a reader has no way to check.
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
 * The lanes in each class, once, for both the call frame columns and the
 * counts printed on them.
 */
const LANES_BY_CLASS: Record<OccasionClass, typeof LANE_ORDER> = {
  "calendar-locked": LANE_ORDER.filter(
    (lane) => LANE_META[lane].occasionClass === "calendar-locked",
  ),
  discretionary: LANE_ORDER.filter(
    (lane) => LANE_META[lane].occasionClass === "discretionary",
  ),
};

/** A 300 guest party, in bowling lanes, at Main Event's own published rate. */
const LANES_FOR_THREE_HUNDRED = lanesForGuests(300);

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
    when: "Day one, before a single package is opened",
    title: "The line through the price list",
    what: (
      <>
        Sort the range into the packages Main Event publishes a price for and
        the packages it does not. There are{" "}
        <strong className="num">{PRICED}</strong> of the first and{" "}
        <strong className="num">{GATED}</strong> of the second, out of{" "}
        <strong className="num">{TOTAL_PACKAGES}</strong> read off
        mainevent.com. The priced ones are the products a parent buys alone at
        night on a phone. Every gated one carries the same sentence on its own
        page: contact the local sales manager. That is the whole job,
        published by the company, in its own words.
        <span className={styles.inlineProv}>
          <ProvenanceBadge provenance="public" compact />
        </span>
      </>
    ),
    why: "First, because everything the role is worth sits above that line. A rep who does not know where the line falls will lead with the grad pack, because a published price is the easiest thing in the world to say out loud, and the venue will have paid a salary to close a sale the website closes for nothing.",
  },
  {
    when: "Day one, in the same sitting",
    title: "The two ledgers, and the one they will be tempted to report",
    what: (
      <>
        Signed contracts with deposits against them carry money. Tabling,
        go-sees, networking events and call blocks carry hours and carry no
        money at all. There is no revenue field on an activity line anywhere
        in this application, and there is not one on a weekly report either.
      </>
    ),
    why: "Second, because it is the first thing a new rep gets wrong, and they get it wrong on a Friday afternoon while feeling good about the week. Before the doors open, activity is the only thing there is to report, which is precisely when it starts wearing revenue's clothes. Settle it in week one and nobody ever has to unpick a forecast built out of hours.",
  },
  {
    when: "Week one, before the first outbound call",
    title: "Which kind of buyer is on the other end",
    what: (
      <>
        Two classes and no third. A calendar-locked buyer has an event because
        the calendar says so: a graduation, a season ending, a term finishing.
        A discretionary buyer has no event at all until a person decides there
        will be one. Both are real budgets. They are not the same call.
      </>
    ),
    why: "Third, because it decides which of the two frames below a rep runs, and it is the only item on this list that cannot be corrected mid-call. Every other mistake here can be walked back with a second email. Running the wrong frame is finished inside the first ninety seconds and the buyer is usually too polite to say why.",
  },
  {
    when: "Week one",
    title: "The eight doors, and what each door is called",
    what: (
      <>
        You do not call the buyer at a high school. You email an Assistant
        Principal for Activities whose title sits on a published staff
        directory. At a taekwondo school the buyer is standing at the front
        desk. At a clinic the practice manager is the buyer and is the hardest
        person in the building to reach by phone, which is why that lane is a
        go-see lane rather than a call lane.
      </>
    ),
    why: "Fourth, after the buyer class, because the door is a property of the lane and the lane already tells you the class. Learn the word a lane uses for its own door and the first line of every email writes itself. Get it wrong and the corporate word turns up in a message to a school, which tells the reader in one sentence that they are on a list.",
  },
  {
    when: "Week one, and specifically before anybody is allowed to hold a date",
    title: "The arithmetic that limits every promise",
    what: (
      <>
        Main Event publishes one bowling lane per{" "}
        <strong className="num">{GUESTS_PER_BOWLING_LANE}</strong> guests, and
        Brea publishes more than{" "}
        <strong className="num">{VENUE.bowlingLanesPublishedFloor}</strong>{" "}
        lanes. So a 300 guest All Access Pass consumes{" "}
        <strong className="num">{LANES_FOR_THREE_HUNDRED}</strong> lanes, which
        is more than half the published floor of the building, and two of them
        on one December Friday is most of the venue.
        <span className={styles.inlineProv}>
          <ProvenanceBadge provenance="public" compact />
        </span>
      </>
    ),
    why: "Fifth, and before a rep may hold anything, because this is the only mistake on the list that costs a customer rather than a call. A held date that cannot physically be delivered becomes a refund, an apology from a general manager, and a school that tells every other school in the district.",
  },
  {
    when: "Week two, before the first difficult conversation",
    title: "The objections, all of them, in advance",
    what: (
      <>
        <strong className="num">{OBJECTION_COUNT}</strong> objections sit in
        the register with an answer against each and, more usefully, with what
        each answer costs. They are structural rather than personal: no
        published price, no opening date, nothing to tour, no track record.
        They arrive in week one and they arrive from everybody.{" "}
        <Link to="/objections">The register</Link>.
      </>
    ),
    why: "Sixth, because a rep who meets \"you have not even got an opening date\" without a prepared answer will invent one. That is the most expensive sentence anybody on this floor can say, and it gets said out of helpfulness rather than dishonesty, which is exactly why training has to get there before the buyer does.",
  },
  {
    when: "Week two, and last on purpose",
    title: "The go-see",
    what: (
      <>
        <strong className="num">{DOOR_ONLY_COUNT}</strong> of the{" "}
        <strong className="num">{PROSPECT_COUNT}</strong> organisations in this
        trade area publish no email address anywhere on their own website. Not
        a hard one to find; none at all. Those are visits, and a visit is the
        most expensive touch there is: an afternoon against two minutes.{" "}
        <Link to="/field">The runs</Link>.
        <span className={styles.inlineProv}>
          <ProvenanceBadge provenance="public" compact />
        </span>
      </>
    ),
    why: "Last, because a go-see spends the scarce resource and cannot be taken back. Sending somebody to stand in a practice manager's reception before they can answer why there is no price and no date spends an afternoon to make a worse impression than an email would have made for free.",
  },
];

// ---------------------------------------------------------------
// The call frame
// ---------------------------------------------------------------

interface CallFrame {
  /** The first question out of the rep's mouth, verbatim. */
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
    opening: "What did you do for it last year, and what was wrong with it?",
    openingNote:
      "Never \"do you have a grad night\". They do. Asking tells an activities director who has run nine of them that nobody read anything about the school before dialling.",
    against:
      "The venue that had it last year, the school gym floor, and the year it rained. The occasion itself is not in question and must never be argued for.",
    closes:
      "Certainty about a date, offered earlier than the incumbent will offer one. Before the doors open the only currency is queue position, and to a buyer working backwards from a fixed date, queue position is the thing actually worth having.",
    failure:
      "Selling the occasion. Explaining to somebody who has run this event for nine years why the event is a good idea. It is the fastest way to be filed as a vendor rather than as a venue, and the call never recovers.",
    leadWith:
      "The youth group and self-serve families. Two of these carry published prices, so a written quote can go out the same day without anybody's approval.",
  },
  discretionary: {
    opening:
      "The last time your team did something together, what was it, and who signed it off?",
    openingNote:
      "It finds the occasion and the decision maker in one sentence. If the answer is \"nothing\", that is the real state of the account and it is far better to know it in minute one than in month three.",
    against:
      "Nothing happening. A quarter where the money goes somewhere else or goes nowhere. There is no incumbent venue to beat, which sounds easier than it is: an incumbent at least proves the budget exists.",
    closes:
      "An occasion they already have, named back to them with a date attached. The December sales push, staff appreciation week, the quarter close. The rep supplies the reason for the event; the buyer supplies the budget.",
    failure:
      "Running the calendar-locked call. \"What did you do last year\" asked of a company that did nothing last year returns \"nothing, we are not really a party company\", and there is no second question that recovers it.",
    leadWith:
      "The corporate family, where Main Event publishes no price at all. So the first conversation is about fit and date, and the number arrives later, from a person, which is the entire reason the role exists.",
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
  /** What a rep says when they have not done the work. */
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
    toLabel: "Lane capacity by date",
    ask: "Which dates are we holding that nobody has signed, and what is the release date on each one?",
    bad: "\"They are all still live.\" A hold is worth nothing, it blocks the date meanwhile, and a hold with no release date on it is a date quietly taken off the market by our own side.",
  },
  {
    minutes: 8,
    title: "One objection, worked out loud",
    to: "/objections",
    toLabel: "The objection register",
    ask: "Give me the answer to \"you do not even have an opening date\", and then tell me what that answer costs us.",
    bad: "A fluent answer with no cost attached. Every real answer to a pre-opening objection gives something away, and a rep who cannot name what they are giving away will end up giving away the wrong thing.",
  },
  {
    minutes: 6,
    title: "Next week's hours, in the diary before we leave",
    to: "/field",
    toLabel: "Tabling and go-see runs",
    ask: "Which lobby, which day, what time, and what is the ask when you are standing there?",
    bad: "\"I will get some go-sees in.\" An hour outside the building that is not in a diary by the end of this meeting is an hour that will be spent at a desk.",
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
   * Not touches. Not calls. TOUCHES ON A CALENDAR-LOCKED PROSPECT WHOSE
   * BUYING WINDOW IS OPEN, which is a much smaller set and the only one
   * where a touch this week is worth more than the same touch in March.
   * A rep can produce a hundred touches a week by working the easiest
   * names on the board; this figure cannot be inflated that way, because
   * the denominator is fixed by other organisations' calendars rather
   * than by anybody's effort.
   *
   * The horizon is four months, matching the desk, because outreach leads
   * the window: a grad night decided in autumn is contacted in autumn.
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
            The job posting asks the Sales Manager to build and manage a
            high-performing sales team, providing mentorship, training and
            support. Every other screen here argues that the trade area has
            been read properly. This one argues that a second person could be
            put in front of it on a Monday and would know what to do by
            Friday, and that a third could be added without the first two
            quietly inventing two different jobs.
          </p>
          <p className={styles.subLede}>
            Four things: what a new rep is taught and in what order, the two
            conversations they have to be able to tell apart, what is measured
            and which of it is coached rather than managed, and the thirty
            minutes a week where all of it is checked. Every person mentioned
            below is a role. There is no invented human being anywhere in this
            application.
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
              The ordinary shape of venue sales training is: here are the
              packages, here is what is in them, here is the deck, go. That
              order teaches a new rep to be fluent in the half of the range
              that does not need them.
            </p>
            <p>
              Main Event publishes a price for{" "}
              <strong className="num">{PRICED}</strong> of the{" "}
              <strong className="num">{TOTAL_PACKAGES}</strong> packages in
              this application and gates the other{" "}
              <strong className="num">{GATED}</strong> behind a sentence that
              says to contact the local sales manager. The priced ones sell
              themselves off a phone at eleven at night to somebody who has
              never spoken to anybody.
              <span className={styles.inlineProv}>
                <ProvenanceBadge provenance="public" compact />
              </span>{" "}
              So a rep's entire value sits in the
              gated ones, and a first week spent memorising the published grad
              pack has been spent learning the part of the job the website
              already does.
            </p>
          </div>

          <p className={styles.pull}>
            The packages that are priced are the ones the website already
            sells. Everything a rep is worth happens above that line.
          </p>

          <div className={styles.prose}>
            <p>
              So the ramp opens at the line through the price list, and every
              step after it is placed by what a rep can get wrong before they
              have been taught the step below it. The order is the argument,
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
            what a rep sees on every one of the fourteen pages that matter.
          */}
          <div className={styles.gateBox}>
            <p className={styles.gateLabel}>
              What a rep finds on all{" "}
              <strong className="num">{GATED}</strong> of the gated pages
              <span className={styles.inlineProv}>
                <ProvenanceBadge provenance="public" compact />
              </span>
            </p>
            <WithheldFigure />
            <p className={styles.gateNote}>
              That sentence is the ramp's first lesson and the reason for the
              role. It is also the reason a rep cannot be trained on price
              objections out of a script: there is no price to defend, only a
              date, a room and a reason to decide now.{" "}
              <Link to="/packages">Every published package, and every gap</Link>
              .
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
              Two conversations, and a rep who runs the wrong one has already
              lost
            </p>
          </div>

          <div className={styles.prose}>
            <p>
              A calendar-locked buyer already has the event. The graduation is
              happening, the season is ending, the term finishes in June
              whatever anybody does. You are competing for the venue, and the
              incumbent is whoever had it last year.
            </p>
            <p>
              A discretionary buyer has no event. Nobody has decided there will
              be one, there is no date, and the money is sitting in a budget
              line that could just as easily go on something else. You are
              competing against nothing happening at all.
            </p>
            <p>
              Those are different calls made in different months, and the
              damage from mixing them is invisible from across the room,
              because a rep running the wrong frame sounds friendly and
              professional right up to the moment the buyer stops replying.
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
                          ? "Competing for the venue"
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
            a date, in writing, that day. Neither of them ends with sending
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
              A rep controls whether they were standing in the Kraemer
              Boulevard lobby at noon on Tuesday. They do not control whether a
              school district signs. Coaching somebody weekly on an outcome
              they cannot move teaches them that effort and result are
              unrelated, and a floor that believes that stops trying by about
              week six.
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
                    Calendar-locked organisations touched inside their buying
                    window
                  </p>
                  <p className={styles.metricNote}>
                    The only activity number worth a target.{" "}
                    <span className="num">{windowWork.touches}</span> touches
                    have gone into those organisations this period. The
                    denominator is set by other people's calendars rather than
                    by anybody's effort, which is exactly why it cannot be
                    inflated by working the easiest names on the board.
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
                    Hours outside the building, of hours planned this period
                  </p>
                  <p className={styles.metricNote}>
                    {outsideShare === null ? (
                      "No hours are planned in this period yet, so there is no share to show."
                    ) : (
                      <>
                        <span className="num">{outsideShare}%</span> of the
                        plan happens somewhere other than a desk. The job
                        posting's first daily responsibility is outbound
                        activity outside the building. Call blocks and email
                        sequences are counted honestly and are not this, and a
                        week that hits its hours from a chair has not hit it.
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
                    Tours of the building, planned
                  </p>
                  <p className={styles.metricNote}>
                    Worth almost nothing while the venue is a construction
                    site, and worth more than everything else on this list the
                    week it is not. It is counted now so that the number is
                    already running the day it starts to matter, and so the
                    hospitality lane has somewhere to land, because a hotel
                    sales director will not recommend a venue they have not
                    seen.
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
                  until it is signed with a deposit against it, so a held date
                  is worth zero here and says so.
                </p>
              </header>

              <ul className={styles.metrics}>
                <li className={styles.metric}>
                  <p className={styles.metricValue}>
                    <span className="num">{revenue.contracts}</span>
                    <span className={styles.metricOf}>
                      contracts, <span className="num">{revenue.guests}</span>{" "}
                      guests
                    </span>
                    <ProvenanceBadge provenance="illustrative" compact />
                  </p>
                  <p className={styles.metricLabel}>Signed, this period</p>
                  <p className={styles.metricNote}>
                    Two contracts twelve weeks out is roughly what a
                    pre-opening venue looks like once one person has worked the
                    trade area for a few weeks. Treating that as a performance
                    problem in week three produces a rep who sends four emails
                    instead of two and burns the list.
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
                    Contract value, at the per-guest price on each line
                  </p>
                  <p className={styles.metricNote}>
                    <span className="num">{typedShare}%</span> of it rests on a
                    price a person typed rather than a price Main Event
                    published, and that share is the number a general manager
                    should actually want to see.{" "}
                    <Link to="/book">The book, both ledgers</Link>.
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
                    question in a monthly review is which contracts have a
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
                    Hours outside the building per $1,000 booked
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
                A rep hitting every leading indicator with nothing behind it
                after eight weeks is not working too little. They are working
                the wrong list, and that is the manager's error to correct,
                not theirs.
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
              be answered off a screen the whole floor can see, the answer is a
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
              It is not a forecast call. Nobody is asked to predict a number
              twelve weeks before a building opens, because asked to predict, a
              rep will produce a figure, and it will be wrong in whichever
              direction makes the next twenty minutes more comfortable. The
              forecast lives in the book and it contains only things that are
              signed.
            </p>
            <p className={styles.notThisText}>
              It is also not where losses are punished. The most useful row on
              the replies screen is a no with a reason and a month attached to
              it, and a floor that learns losses are expensive to report will
              stop reporting them, at which point the manager is running a
              venue on a set of numbers that has been edited for their
              comfort.{" "}
              <Link to="/replies">What came back, including the silence</Link>.
            </p>
          </div>
        </section>

        <p className={styles.foot}>
          Every person on this page is a role: Sales Manager, event sales
          representative, Assistant Principal for Activities, practice manager,
          youth pastor. There is no invented human being anywhere in this
          application. The package counts, the one lane per twenty guests rule
          and the published floor of{" "}
          <strong className="num">{VENUE.bowlingLanesPublishedFloor}</strong>{" "}
          lanes were read off mainevent.com on 11 August 2026. The figures in
          the measurement section are read live off this session's state, so
          advancing a prospect on the desk or completing a shift in the field
          moves them while you watch.
        </p>
      </div>
    </div>
  );
}
