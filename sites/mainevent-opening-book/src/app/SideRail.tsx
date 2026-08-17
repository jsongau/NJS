import { useCallback, useEffect, useMemo, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { PERIODS, PERIOD_BY_ID, VENUE } from "@/data/venue";
import { PROSPECTS } from "@/data/prospects";
import { PACKAGES } from "@/data/packages";
import {
  REQUESTS_AS_OF,
  SEED_LEAGUE_INTEREST,
  SEED_REQUESTS,
} from "@/data/requests";
import type { Lane } from "@/domain/types";
import { LANE_META, LANE_ORDER } from "@/domain/lanes";
import { PITCH_STATUS, PITCH_STATUS_ORDER } from "@/domain/vocabulary";
import { derivedTasks, queueBuckets } from "@/domain/selectors/queue";
import {
  ORG_TYPE_META,
  ORG_TYPE_ORDER,
  prospectRecords,
} from "@/domain/selectors/record";
import {
  INBOX_PATH,
  workingSetCounts,
  workingSetHref,
} from "@/pages/InboxPage";
import {
  AddProspectButton,
  useAddedProspects,
} from "@/components/prospect/AddProspect";
import {
  doorOnlyCount,
  emailableCount,
  laneCounts,
  liveConversationCount,
  unworkedCount,
} from "@/domain/selectors/desk";
import { boardTotals } from "@/domain/selectors/leagues";
import { enrollingCup, enrollmentFor } from "@/domain/selectors/cup";
import { usePipeline, usePipelineDispatch } from "@/state/PipelineProvider";
import { activityTotals, revenueTotals, useBook } from "@/state/BookProvider";
import { useOutbox } from "@/state/OutboxProvider";
import { objectionRows, useObjections } from "@/state/ObjectionProvider";
import {
  isRecord,
  signatureOf,
  usePersistedReducer,
  type SliceCodec,
} from "@/state/persist";
import { PinMark } from "@/components/primitives/PinMark";
import { ResetControl } from "@/components/primitives/ResetControl";
import { SoundControlButton } from "@/components/primitives/SoundControl";
import { SectionMark } from "@/components/play/SectionMark";
import { Readout } from "@/components/play/Readout";
import { FEATURED_KEY, normalisePath, type SectionId } from "./sections";
import { isRationalePath, toConsole, toRationale } from "@/data/rationale";
import styles from "./SideRail.module.css";

/**
 * THE RAIL. Every screen in this application, named, grouped and
 * counted, in a column that is always on the page.
 *
 * ── THE FAILURE THIS FILE EXISTS TO END ───────────────────────────
 * What stood here before was a six item horizontal bar whose every
 * secondary destination lived inside a panel that opened on hover. Ten
 * of the fifteen screens in this application could only be reached by
 * putting a pointer on a word and waiting. That arrangement has three
 * separate faults and this app hit all three.
 *
 * It hides the structure. A reader cannot count what a hover panel is
 * concealing, so nobody could answer "how big is this thing" without
 * touching six tabs one at a time and remembering what each held.
 *
 * It loses screens. A page was specified, built, and then went missing
 * inside the panels for long enough that it was asked for twice. That is
 * not a slip by whoever wrote the nav; it is the predictable behaviour of
 * an information architecture whose second level is invisible until
 * hovered.
 *
 * And it is a pointer affordance pretending to be navigation. Hover has
 * no keyboard equivalent worth the name and no touch equivalent at all,
 * so the panels were bolted onto focus events afterwards, which is how
 * mega menus earned their reputation.
 *
 * A rail fixes all three by refusing to hide anything. Twenty
 * destinations, seven groups, all of them on screen, all of them one
 * click from anywhere. Nothing in here opens on hover. Nothing in here
 * needs to.
 *
 * ── AND THE THING ABOVE IT IS NOT THAT BAR COMING BACK ────────────
 * There is a mega nav across the top of the shell now, and it is worth
 * being precise about why it is not the arrangement described above. It
 * carries six destinations, every one of them also in this rail, every
 * one of them permanently visible with its live figure on it, and it
 * reveals nothing on hover because it has no second level to reveal. It
 * is a shortcut to the six rows pressed all day, not a container for the
 * thirteen that are not. The moment anything in it only appears when a
 * pointer rests on it, this comment has been ignored.
 *
 * ── THE COUNTS ARE THE POINT ──────────────────────────────────────
 * Every destination carries a live figure derived from the same selector
 * the destination screen itself calls. Not a copy of it, not a number
 * typed into this file: the same function, with the same arguments. That
 * is what turns a list of links into the status of the week, and it is
 * also the only way the rail and the page it leads to cannot disagree.
 * A rail keeping its own tally would eventually be right on one screen
 * and wrong on the other, with no way for a reader to tell which.
 *
 * ── THE SECOND LEVEL COSTS SPACE ONLY WHEN YOU ARE IN IT ──────────
 * The item you are standing on expands to show its own filters, indented,
 * each with its own count. Everything else stays one line. A rail that
 * showed every filter of every screen at once would be sixty rows long
 * and would have reinvented the problem it was built to solve.
 *
 * There is a rule about which screens get a second level, and it is
 * strict: A SUB-FILTER MUST ACTUALLY FILTER THE SCREEN IT SITS UNDER.
 * The lane filter lives in pipeline state, so the rail can set it and the
 * desk, the map and the packages board all narrow in the same render.
 * The inbound queue's four buckets come off queueBuckets, which is the
 * partition the queue page draws itself. Screens whose filters live in
 * their own component state get no second level at all, because a filter
 * that does not filter is worse than no filter: it teaches a reader that
 * the rail lies.
 *
 * ── THERE IS ONE PERSON HERE ──────────────────────────────────────
 * No role switcher, no "viewing as", no persona menu. This application
 * has exactly one user, the Sales Manager, and a switcher offering a view
 * that does not exist would be chrome describing a product that was never
 * built. The context label at the top of the rail says who you are and
 * stops there.
 */

// ---------------------------------------------------------------
// The collapsed state, and where it is kept
// ---------------------------------------------------------------

interface RailState {
  collapsed: boolean;
}

type RailAction = { type: "TOGGLE_COLLAPSE" };

const RAIL_SEED: RailState = { collapsed: false };

function railReducer(state: RailState, action: RailAction): RailState {
  switch (action.type) {
    case "TOGGLE_COLLAPSE":
      return { collapsed: !state.collapsed };
    default:
      return state;
  }
}

/**
 * The rail width is a preference, so it is persisted with everything
 * else rather than beside it.
 *
 * state/persist.ts already owns one namespaced, versioned, throttled,
 * quota-tolerant storage key for this application, and a second mechanism
 * written here would be a second answer to what happens when a browser
 * refuses to write, a second thing for a reset to have to remember, and a
 * second key for the next person to find and have to guess about. This
 * slice costs four lines and inherits all of that.
 *
 * The signature is a constant rather than a hash over seed data because
 * there is no seed to drift: a boolean is a boolean. It is still spelled
 * with a version in it, so that changing what this slice means later
 * drops the old value cleanly instead of reinterpreting it.
 *
 * `encode` returns null for the default, which removes the slice
 * entirely. A reader who has never collapsed the rail leaves no trace of
 * the rail in storage at all.
 */
const RAIL_CODEC: SliceCodec<RailState> = {
  slice: "rail",
  signature: signatureOf("rail.collapsed.v1"),
  encode: (state) => (state.collapsed ? { collapsed: true } : null),
  decode: (raw, seed) =>
    isRecord(raw) && raw.collapsed === true ? { collapsed: true } : seed,
};

// ---------------------------------------------------------------
// The icons
// ---------------------------------------------------------------

/**
 * ── WHERE THE NINETEEN LINE MARKS WENT ────────────────────────────
 * A set of nineteen shapes lived in this file, described here as
 * "deliberately crude geometry at sixteen pixels with a single stroke
 * weight". That was the right answer for a rail on paper and it is the
 * wrong one for a cabinet: nineteen shapes at one weight, one colour and
 * one amount of interest is nineteen shrugs down a column.
 *
 * They are replaced by SectionMark, in components/play, which draws one
 * mark per navigation section on a twenty four unit field with a two
 * unit stroke and exactly one solid shape in the section's own colour.
 * The mega nav draws the same component for the same sections, so the
 * clock at the top and the clock on the left are still visibly one
 * screen, which was the reason the old set was exported and is the
 * reason the new one is shared.
 *
 * WHAT IS LEFT IN HERE IS ONE MARK. The collapse control is not a
 * destination and has no section, so it cannot use SectionMark and does
 * not want to: it is a chevron, it points the way the rail is about to
 * move, and it is the one shape in this file that means an action rather
 * than a place.
 */
export type IconName = "chevron";

const ICON_PATHS: Record<IconName, JSX.Element> = {
  chevron: (
    <>
      <path d="M10 3.5 5.5 8l4.5 4.5" />
    </>
  ),
};

export function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

// ---------------------------------------------------------------
// The information architecture
// ---------------------------------------------------------------

interface Destination {
  to: string;
  label: string;
  /**
   * The section, which is the single key to everything visual about this
   * row: the mark it draws, the colour of that mark, and the ink, edge
   * and wash it takes when you are standing on it. One field, twenty
   * values, no per screen code. See sections.ts.
   */
  sec: SectionId;
  /** What this screen is for, in one clause. Carried as the title. */
  hint: string;
  /**
   * THE ONE ROW THAT IS DRAWN AS A KEY RATHER THAN AS A ROW.
   *
   * Nineteen of the twenty destinations here are the same kind of thing:
   * a place with a figure of work waiting behind it, and the rail's
   * value is that they all look alike so an eye can run down them. The
   * trade area board is the exception the strip above already makes,
   * and the two navigations have to agree or the feature reads as an
   * accident of whichever one you happened to look at.
   *
   * So this row is a filled plate with dark type on it and the same
   * moulded shoulder the strip's key stands on, and its figure is the
   * size of the territory printed with its noun rather than a count in a
   * readout well. See FEATURED_KEY in sections.ts for why the rank
   * exists at all, and the head of MegaNav.tsx for the full argument.
   */
  featured?: true;
}

interface RailGroup {
  id: string;
  heading: string;
  items: Destination[];
}

/**
 * Seven groups, twenty destinations, and every in-shell route appears
 * exactly once.
 *
 * The grouping answers "what part of the job is this" rather than "what
 * kind of object does it show", because the person reading it is running
 * a week and not browsing a database. TODAY is the two screens with a
 * clock running on them. THE BOARD is who to contact and where they are.
 * OUTREACH is what went out and what came back. THE BOOK is what is
 * signed and what will fit. REFERENCE is what you consult and never edit.
 *
 * ONE DEPARTURE FROM THE GROUPING THIS WAS DRAWN FROM, and it is worth
 * defending. The field plan started in REFERENCE and it does not belong
 * there. Everything else in REFERENCE is read-only: the published
 * packages, the coaching notes, the methodology. The field plan is a
 * working screen where hours outside the building are planned and
 * recorded, and it is built directly off the map, so it sits in THE
 * BOARD beside the map it comes from. The test for REFERENCE is that
 * nothing in it can be changed, and a group that fails its own test is a
 * group a reader learns to ignore.
 *
 * /quote/:prospectId is deliberately absent. It renders outside this
 * shell entirely, for the reason written at the top of App.tsx: it is the
 * page a school activities director opens from an email, and showing them
 * the venue's own call sheet would be the digital equivalent of handing a
 * customer your prospect list. A destination that must never be reached
 * from the internal navigation must not appear in the internal
 * navigation.
 */
const GROUPS: RailGroup[] = [
  {
    id: "today",
    heading: "Today",
    items: [
      {
        to: "/today",
        label: "Today",
        sec: "today",
        hint: "What you are on the hook for this morning, both halves of the job",
      },
      {
        to: "/requests",
        label: "Requests",
        sec: "requests",
        hint: "The inbound queue, with a clock on every row",
      },
    ],
  },
  {
    id: "board",
    heading: "The board",
    items: [
      {
        to: "/",
        label: "Desk",
        sec: "desk",
        hint: "Who to contact today, ranked, with the score that put them there",
      },
      {
        to: FEATURED_KEY.to,
        label: FEATURED_KEY.label,
        sec: FEATURED_KEY.sec,
        hint: "The same board answered in geography",
        featured: true,
      },
      {
        to: "/lanes",
        label: "Lanes",
        sec: "lanes",
        hint: "The nine channels of outbound work and what sells into each",
      },
      {
        to: "/segments",
        label: "Segments",
        sec: "lanes",
        hint: "The same board cut by industry, ranked by what to work first",
      },
      {
        to: "/field",
        label: "Field",
        sec: "field",
        hint: "Tabling, networking and go-see runs outside the building",
      },
      {
        to: "/rivals",
        label: "Rivals",
        sec: "rivals",
        hint: "Published facts about the other venues, and why deals were actually lost",
      },
    ],
  },
  {
    id: "working",
    heading: "The working set",
    items: [
      {
        to: INBOX_PATH,
        label: "Inbox",
        sec: "inbox",
        hint: "Every message in and out, threaded per organisation and categorised",
      },
    ],
  },
  {
    id: "outreach",
    heading: "Outreach",
    items: [
      {
        to: "/sent",
        label: "Sent",
        sec: "sent",
        hint: "Everything that has gone out of the outbox",
      },
      {
        to: "/replies",
        label: "Replies",
        sec: "replies",
        hint: "Every reply, and every silence, recorded as a disposition",
      },
      {
        to: "/objections",
        label: "Objections",
        sec: "objections",
        hint: "What gets said back, and the answer to it",
      },
    ],
  },
  {
    id: "book",
    heading: "The book",
    items: [
      {
        to: "/book",
        label: "Book",
        sec: "book",
        hint: "Two ledgers, signed revenue and outbound hours, never added together",
      },
      {
        to: "/book/week",
        label: "Week sheet",
        sec: "week",
        hint: "This week's plan, hour by hour",
      },
      {
        to: "/book/accounts",
        label: "Accounts",
        sec: "accounts",
        hint: "The customer after the signature, and when the next one is due",
      },
      {
        to: "/calendar",
        label: "Capacity",
        sec: "capacity",
        hint: "What will actually fit on a date, in lanes",
      },
      /**
       * LEAGUES IS FILED UNDER THE BOOK AND NOT UNDER THE BOARD, and
       * the choice is worth a sentence because the board was the cheap
       * place to put it.
       *
       * Everything under THE BOARD is a view of the same two hundred
       * and eleven organisations: ranked on the desk, plotted on the map,
       * cut by lane, walked in the field. A league is not one of those. It
       * is the only RECURRING product the building sells, it is sold to
       * teams rather than to organisations, and a claimed slot occupies
       * a night of the week for a whole season. That is a commitment on
       * a calendar, which is exactly what the other three rows in this
       * group are about: what is signed, what is planned, and what will
       * still fit.
       */
      {
        to: "/leagues",
        label: "Leagues",
        sec: "leagues",
        hint: "Two leagues forming, the field of sixteen behind each, and the asks to join",
      },
      /**
       * THE CUP SITS BESIDE LEAGUES AND NOT IN THE STRIP ACROSS THE TOP.
       *
       * The mega nav carries six keys plus the featured one and they
       * stand down at measured widths; a seventh would be a measurement
       * somebody has to redo rather than a decision. The cup is also not
       * one of the six screens pressed all day. It is the competition the
       * leagues play for, it is read on the night it is bowled and on the
       * morning the enrollment is chased, and the row it belongs next to
       * is the one above it.
       *
       * Its figure is the slots still free in the field taking teams,
       * which is the number that moves the day somebody enrols, and it is
       * the same selector the board draws its own count from. The number
       * of cups is four for the whole year, and a constant on a rail is a
       * decoration.
       */
      {
        to: "/cup",
        label: "Cup",
        sec: "leagues",
        hint: "One cup a quarter. The exhibition running now, and the January field taking teams",
      },
    ],
  },
  {
    id: "floor",
    heading: "The floor",
    items: [
      {
        to: "/team",
        label: "The floor",
        sec: "team",
        hint: "Three seats, two of them open, and what each one owes this week",
      },
      {
        to: "/pay",
        label: "Pay",
        sec: "team",
        hint: "What the work is worth, and the gate on the quarter",
      },
      {
        to: "/report",
        label: "District report",
        sec: "team",
        hint: "The page that goes up the line, printable",
      },
    ],
  },
  {
    id: "reference",
    heading: "Reference",
    items: [
      {
        to: "/packages",
        label: "Packages",
        sec: "packages",
        hint: "Every package Main Event publishes, priced and gated",
      },
      {
        to: "/coaching",
        label: "Coaching",
        sec: "coaching",
        hint: "How this week would be run, and why in that order",
      },
      {
        to: "/method",
        label: "Method",
        sec: "method",
        hint: "Every formula and every source behind every number",
      },
    ],
  },
  /**
   * SPEND AND SUPPORT, and it is a sixth group rather than three rows
   * added to an existing one.
   *
   * Everything above this line is the pipeline: who to contact, what they
   * said, what got signed. These three are the resources that pipeline
   * runs on. A co-marketing partner is somebody else's audience borrowed
   * for an evening, promo stock is the physical inventory carried to a
   * go-see, and the budget is what both of those cost. None of the three
   * is a prospect and none of them belongs under THE BOARD, which would
   * have been the cheap place to drop them.
   *
   * They carry no figure yet. A number invented so a row would not look
   * empty is the habit this application argues against on fourteen other
   * screens, and Coaching and Method already sit here without one.
   */
  {
    id: "spend",
    heading: "Spend and support",
    items: [
      {
        to: "/partners",
        label: "Partners",
        sec: "partners",
        hint: "Organisations whose audience overlaps this venue's",
      },
      {
        to: "/promo",
        label: "Promo stock",
        sec: "promo",
        hint: "What is carried to a go-see, and how much of it is left",
      },
      {
        to: "/spend",
        label: "Budget",
        sec: "spend",
        hint: "What the outbound work costs, against what was set aside",
      },
      /* The one row in this group that is read by somebody who does not
         work here. It wears the Budget colour rather than one of its own,
         which sections.ts explains, and it sits last because it is the
         output of the three above it. */
      {
        to: "/sellthrough",
        label: "Sell-through",
        sec: "spend",
        hint: "The statement a licensor receives, printable, per property",
      },
    ],
  },
];

/** Every destination in one flat list. Used by the assertions and the breadcrumb check. */
export const RAIL_DESTINATIONS: string[] = GROUPS.flatMap((g) =>
  g.items.map((i) => i.to),
);

const LOCKED_LANES: Lane[] = LANE_ORDER.filter(
  (lane) => LANE_META[lane].occasionClass === "calendar-locked",
);
const DISCRETIONARY_LANES: Lane[] = LANE_ORDER.filter(
  (lane) => LANE_META[lane].occasionClass === "discretionary",
);

/** Same lane set, in any order. The rail and the desk must agree. */
function sameLanes(a: Lane[], b: Lane[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((lane) => set.has(lane));
}

// ---------------------------------------------------------------
// The counts, and the second level
// ---------------------------------------------------------------

export interface Count {
  value: number;
  /** What the figure counts, read out after it. Never on screen. */
  unit: string;
}

export interface ShellFigures {
  /** Keyed by route, so a destination and its figure cannot be paired wrong. */
  counts: Record<string, Count>;
  queue: ReturnType<typeof queueBuckets>;
  lanes: ReturnType<typeof laneCounts>;
  working: ReturnType<typeof workingSetCounts>;
}

/**
 * EVERY FIGURE THE CHROME SHOWS, DERIVED ONCE AND IN ONE PLACE.
 *
 * There are now two navigations on screen at the same time. The rail
 * names all twenty destinations down the left; the mega nav carries six
 * of them across the top, permanently, at the width of a thumb. Both put
 * a live number against Inbox, and the day those two numbers disagree is
 * the day a reader stops believing either of them.
 *
 * The obvious way to stop that is discipline, and discipline is what
 * fails. So there is no second derivation to keep in step: this hook is
 * the only place in the chrome that calls a selector, and the rail and
 * the mega nav both read the same record out of it, keyed by the route
 * they are already linking to. A figure attached to the wrong screen is
 * not expressible.
 *
 * Every selector here is called with exactly the arguments the receiving
 * page calls it with, including the same `now`. Not a copy of the
 * arithmetic, the arithmetic.
 *
 * Both components call this hook rather than one passing to the other,
 * because the alternative is the shell holding navigation state it has no
 * other use for and handing it down through two prop chains. The work is
 * memoised on the state it reads, so a keystroke in the desk search box
 * costs nothing at all, and the walks only run again when the pipeline,
 * the book or the outbox actually move.
 */
export function useShellFigures(): ShellFigures {
  const pipeline = usePipeline();
  const book = useBook();
  const outbox = useOutbox();
  const objections = useObjections();
  const added = useAddedProspects();

  /**
   * The inbound figures, from the selectors the queue page calls, with
   * the identical `now`.
   *
   * Memoised because deriving the tasks walks every request and every
   * league ask, and the chrome re-renders on every keystroke in the desk
   * search box.
   */
  const queue = useMemo(() => {
    const tasks = derivedTasks(
      SEED_REQUESTS,
      SEED_LEAGUE_INTEREST,
      pipeline,
      book,
      { now: REQUESTS_AS_OF },
    );
    return queueBuckets(tasks, { now: REQUESTS_AS_OF });
  }, [pipeline, book]);

  /* The league board totals. Derived from the data file alone, so this
     is computed once and never again; it is memoised for the shape of
     the file rather than for the cost of it. */
  const leagues = useMemo(() => boardTotals(), []);

  /* The cup figure, from the same selector the cup board draws its own
     enrollment panel from. Free slots in the field that is taking teams,
     because that is the figure that moves the day somebody enrols. */
  const cupFree = useMemo(() => {
    const next = enrollingCup();
    return next ? enrollmentFor(next).free : 0;
  }, []);

  const revenue = useMemo(() => revenueTotals(book.book), [book.book]);
  const activity = useMemo(() => activityTotals(book.activity), [book.activity]);
  const lanes = useMemo(() => laneCounts(pipeline), [pipeline]);

  /**
   * The working set, counted over every organisation on the board plus
   * every one the reader has added.
   *
   * Memoised for the same reason the inbound queue above is: this walks
   * two hundred and eleven records, joining threads, offers and statuses.
   */
  const working = useMemo(
    () => workingSetCounts(prospectRecords({ pipeline, book: book.book }), added),
    [pipeline, book.book, added],
  );

  /**
   * Open objections, counted over the whole register rather than over the
   * entries a reader has touched.
   *
   * objectionCounts tallies the entries in state, and an objection nobody
   * has dispositioned has no entry at all, so counting entries alone
   * would show a nine-item register as zero until somebody clicked
   * something. objectionRows synthesises the open entry for every
   * objection in the data file, which is the same list the page draws.
   */
  const openObjections = useMemo(
    () =>
      objectionRows(objections).filter((r) => r.entry.disposition === "open")
        .length,
    [objections],
  );

  const counts = useMemo<Record<string, Count>>(() => {
    /**
     * What the Today badge counts, and it is deliberately not the total.
     *
     * Today is a screen about this morning, so its figure is the work that
     * is already late plus the work falling due before the end of the day.
     * A badge that counted the whole board would read the same on the
     * morning the desk is on top of its queue as on the morning it is four
     * days behind, which is the only distinction the number exists to make.
     */
    const onYouToday = queue.overdue.tasks.length + queue.today.tasks.length;

    return {
      "/today": { value: onYouToday, unit: "late or due today" },
      "/requests": { value: queue.all.length, unit: "pieces of inbound work" },
      "/": { value: unworkedCount(pipeline), unit: "never contacted" },
      "/map": { value: PROSPECTS.length, unit: "organisations plotted" },
      "/lanes": { value: LANE_ORDER.length, unit: "prospecting lanes" },
      "/field": { value: doorOnlyCount(), unit: "with no written door" },
      /* The inbox badge counts the threads where they wrote last and
         nothing has gone back, not the size of the mailbox. A figure that
         counted every thread would read the same on the morning everything
         has been answered as on the morning nothing has. */
      [INBOX_PATH]: {
        value: working.box["needs-reply"].threads,
        unit: "threads where they are waiting on an answer",
      },
      "/sent": { value: outbox.sent.length, unit: "messages sent" },
      "/replies": { value: book.replies.length, unit: "replies in" },
      "/objections": { value: openObjections, unit: "objections still open" },
      "/book": { value: revenue.contracts, unit: "signed contracts" },
      "/book/week": { value: activity.shifts, unit: "planned activity lines" },
      "/calendar": {
        value: liveConversationCount(pipeline),
        unit: "live conversations wanting a date",
      },
      "/packages": { value: PACKAGES.length, unit: "published packages" },
      /* WHAT THE LEAGUES FIGURE COUNTS, and it is deliberately not the
         number of leagues. Two is a constant and a constant on a rail is
         a decoration. The free slots across both fields of sixteen is
         the number that moves the day a team claims one, and it is the
         same selector the leagues board draws its own header from. */
      "/leagues": {
        value: leagues.free,
        unit: "slots still open across the leagues forming",
      },
      /* The cup carries the free slots in the field taking teams now,
         for the same reason: four cups a year is a constant and a
         constant on a rail is a decoration. */
      "/cup": {
        value: cupFree,
        unit: "slots still open in the cup taking teams",
      },
      /* Coaching, the method page and the three spend screens carry no
         figure on purpose. None of them is a queue and none changes with
         the state of the week, and a number invented so a row would not
         look empty is the exact habit this application spends fourteen
         screens arguing against. */
    };
  }, [
    queue,
    pipeline,
    working,
    outbox.sent.length,
    book.replies.length,
    openObjections,
    revenue.contracts,
    activity.shifts,
    leagues.free,
    cupFree,
  ]);

  return { counts, queue, lanes, working };
}

interface SubFilter {
  id: string;
  label: string;
  count: number;
  unit: string;
  /** A destination, for a filter the receiving page reads off the URL. */
  to?: string;
  /** A dispatch, for a filter that lives in shared state. */
  onSelect?: () => void;
  /** Only meaningful for the dispatched kind. */
  active?: boolean;
}

// ---------------------------------------------------------------
// The working set filters
// ---------------------------------------------------------------

/**
 * ── FILTERS THAT ACTUALLY FILTER, AND WHY THEY ARE LINKS ──────────
 *
 * The rail's job is to change what is on screen. The lane filters above
 * do that by dispatching into pipeline state, which works and has one
 * defect a reader hits within a minute: a filtered board is not a place.
 * Reload it and the filter is gone; paste the address to somebody and
 * they get the unfiltered board; press the back button and nothing
 * happens, because nothing moved.
 *
 * So every filter below is an ordinary link with its argument in the
 * query string. A working set is then an address: it survives a reload,
 * it can be sent to somebody, the back button undoes it, and the browser
 * marks the row you are standing on without this file tracking anything.
 * The row carries aria-current rather than aria-pressed because it is a
 * link and not a toggle button, and pressing the one that is already on
 * returns the bare inbox, which is how it turns off.
 *
 * ── WHY THEY ALL LAND ON THE INBOX ────────────────────────────────
 * A status filter has to be able to show an organisation that has never
 * been touched, a type filter has to be able to show all forty-one
 * independents whether or not anybody has written to them, and both have
 * to sit next to the last thing that was said. The inbox is the one
 * surface in this application that draws an organisation and its
 * conversation in the same row, so it is the surface a filtered working
 * set belongs on. The desk keeps its own ranking and the map keeps its
 * own geography; neither is a list you would want re-sorted by a filter
 * chosen in the rail.
 *
 * ── THE FIGURES ARE THE SAME FUNCTION THE INBOX CALLS ─────────────
 * workingSetCounts is called in the hook above with the same arguments
 * the inbox calls it with, so the number on a row and the number of rows
 * it produces are the same arithmetic and cannot drift apart.
 */

/** True when this facet, and only this facet, is what the URL asks for. */
function onlyFacet(
  params: URLSearchParams,
  key: string,
  value: string,
): boolean {
  for (const [k, v] of params.entries()) {
    /* The open thread is a position, not a filter, so a reader reading a
       conversation inside a filtered set still sees the filter marked. */
    if (k === "thread") continue;
    if (k !== key || v !== value) return false;
  }
  return params.get(key) === value;
}

/**
 * ── WHERE THE GROUND CONTROL WENT ─────────────────────────────────
 * It stood in this foot, as a two option radio group, and it has moved
 * up into the strip across the top of the shell as a single button. The
 * argument for it living down here was that the foot is the only shelf
 * carrying settings, and that argument lost to a simpler one: the foot is
 * dropped from the collapsed rail entirely, and a control that disappears
 * when a reader narrows their navigation is a control they cannot find
 * when they want it. MegaNav owns it now.
 */

export function SideRail() {
  const pipeline = usePipeline();
  const dispatch = usePipelineDispatch();
  const location = useLocation();

  /*
    THE RAIL IS THE SAME RAIL IN BOTH MODES.

    Same groups, same order, same labels, same counts, same section
    colours. The ONLY thing the mode changes is where a row points: in
    Rationale every destination gets /rationale in front of it, so
    pressing Lanes takes you to how Lanes was built rather than to Lanes.

    It is done here, at the point of rendering a link, rather than by
    keeping a second table. A second table is a second thing to forget to
    update, and the whole argument of this mode is that a screen and its
    explanation are one destination addressed twice.
  */
  const onRationale = isRationalePath(normalisePath(location.pathname));
  const railHref = (to: string) => (onRationale ? toRationale(to) : to);

  /**
   * WHICH SCREEN THE READER IS STANDING ON, WITHOUT THE MODE.
   *
   * Everything below that asks "which screen is open" has to ask it in
   * console terms, because the rail is one rail and its second level is
   * part of the rail. Reading location.pathname raw means the queue
   * buckets under Requests and the facet lists under the desk appear in
   * Console and silently vanish in Rationale, which is precisely the
   * claim this mode makes about itself, broken.
   *
   * It shipped that way until a walk of all twenty seven screens in both
   * modes compared the two rails row by row and found Today and Requests
   * five rows shorter on the explanation side. Worth stating plainly:
   * the design was right and the reading of the address was wrong, and a
   * count is what told the difference. sectionFor solves the same problem
   * the same way one file over, which is the pattern to follow rather
   * than a new one to invent.
   */
  const here = normalisePath(location.pathname);
  const consoleHere = toConsole(here);

  /* Every figure in the chrome, from the one hook the mega nav also
     reads. The rail keeps the intermediates because its second level and
     its facet lists are built out of the same walks. */
  const { counts, queue, lanes, working } = useShellFigures();

  const [rail, railDispatch] = usePersistedReducer(
    railReducer,
    RAIL_SEED,
    RAIL_CODEC,
  );

  const period = PERIOD_BY_ID[pipeline.periodId] ?? PERIODS[0];
  const weeks = period?.weeksToOpen ?? 0;

  /**
   * HOW FULL THE OPENING BOOK IS. Carried over from the old header, with
   * its reasoning intact.
   *
   * The tempting figure was revenue against a target. There is no target:
   * Main Event publishes no opening date, no capacity plan and no budget,
   * so a percentage against one would be a number this app made up and
   * then drew a picture of. What is real and countable is how much of the
   * trade area has been worked at all, and it moves the moment a reader
   * changes a status anywhere in the application.
   */
  const worked = PROSPECTS.length - unworkedCount(pipeline);
  const fill = PROSPECTS.length > 0 ? worked / PROSPECTS.length : 0;
  const workedPct = Math.round(fill * 100);
  const markLabel =
    `The Opening Book. The dial round the ball shows how far the trade ` +
    `area has been worked: ${worked} of ${PROSPECTS.length} organisations ` +
    `worked so far, ${workedPct} per cent.`;

  /* Said once, drawn once, and read out once. The unit is the only part
     of the countdown the collapsed column has no room to print, so it is
     built here and used in both places rather than spelled twice. */
  const countdownUnit =
    weeks > 1 ? "weeks to open" : weeks === 1 ? "week to open" : "open";
  const countdownLabel =
    weeks > 0 ? `${weeks} ${countdownUnit}` : "Open. No weeks left to run.";

  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const onInbox = consoleHere === INBOX_PATH;

  /**
   * The second level for the screen currently open.
   *
   * The lane filters dispatch into pipeline state, which the desk, the
   * map and the packages board all read, so choosing one here narrows the
   * screen behind the rail in the same render. The queue buckets are
   * links, because the partition belongs to the queue page.
   */
  const subFilters = useMemo<SubFilter[]>(() => {
    const path = consoleHere;

    if (path === "/today" || path === "/requests") {
      /* The four buckets plus the whole list. All five come off
         queueBuckets, which insists the four add up to the total, so
         showing three of them here would break the one arithmetic
         property that selector exists to guarantee. */
      return [
        {
          id: "all",
          label: "Everything",
          count: queue.all.length,
          unit: "pieces of work",
          to: "/requests",
        },
        {
          id: "overdue",
          label: "Past a deadline",
          count: queue.overdue.tasks.length,
          unit: "past the commitment",
          to: "/requests?bucket=overdue",
        },
        {
          id: "today",
          label: "Due today",
          count: queue.today.tasks.length,
          unit: "due before the end of today",
          to: "/requests?bucket=today",
        },
        {
          id: "thisWeek",
          label: "Due this week",
          count: queue.thisWeek.tasks.length,
          unit: "due in the next seven days",
          to: "/requests?bucket=thisWeek",
        },
        {
          id: "later",
          label: "Later",
          count: queue.later.tasks.length,
          unit: "beyond the next seven days",
          to: "/requests?bucket=later",
        },
      ];
    }

    if (path === "/" || path === "/map" || path === "/packages") {
      const lockedTotal = LOCKED_LANES.reduce((n, l) => n + lanes[l], 0);
      const discretionaryTotal = DISCRETIONARY_LANES.reduce(
        (n, l) => n + lanes[l],
        0,
      );
      const filtered = pipeline.laneFilter;

      const out: SubFilter[] = [
        {
          id: "every",
          label: "Every organisation",
          count: PROSPECTS.length,
          unit: "in the trade area",
          onSelect: () => dispatch({ type: "CLEAR_LANES" }),
          active: filtered.length === 0,
        },
        {
          id: "locked",
          label: "Calendar-locked",
          count: lockedTotal,
          unit: "whose occasion happens anyway",
          onSelect: () => dispatch({ type: "SET_LANES", lanes: LOCKED_LANES }),
          active: sameLanes(filtered, LOCKED_LANES),
        },
        {
          id: "discretionary",
          label: "Discretionary",
          count: discretionaryTotal,
          unit: "where somebody has to decide",
          onSelect: () =>
            dispatch({ type: "SET_LANES", lanes: DISCRETIONARY_LANES }),
          active: sameLanes(filtered, DISCRETIONARY_LANES),
        },
      ];

      /* The written-door toggle is offered on the two boards that show
         organisations and withheld from the packages board, which has no
         opinion about whether an organisation publishes an email. */
      if (path !== "/packages") {
        out.push({
          id: "emailable",
          label: "With a written door",
          count: emailableCount(),
          unit: "publish an email we read off their own site",
          onSelect: () => dispatch({ type: "TOGGLE_EMAILABLE_ONLY" }),
          active: pipeline.emailableOnly,
        });
      }

      return out;
    }

    return [];
  }, [consoleHere, queue, lanes, pipeline, dispatch]);

  // -------------------------------------------------------------
  // Keyboard
  // -------------------------------------------------------------

  const navRef = useRef<HTMLElement>(null);

  /**
   * Up and down walk the rail, home and end jump to its ends.
   *
   * Tab still works and still leaves the rail, which is the behaviour a
   * keyboard reader expects of a navigation landmark. The arrows are the
   * addition: twenty destinations and up to five sub-filters is a long
   * tab sequence to cross when what you wanted was the row below the one
   * you are on. The list is read out of the DOM on every press rather
   * than cached, because the second level appears and disappears as the
   * route changes and a cached list would send focus to a row that is no
   * longer there.
   */
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    const isMove =
      e.key === "ArrowDown" ||
      e.key === "ArrowUp" ||
      e.key === "Home" ||
      e.key === "End";
    if (!isMove) return;

    /* The period select owns all four of those keys itself, and it owns
       them for the same reason this rail does: they move between the
       things inside it. Walking the rail out of the middle of an open
       list of periods would take a reader off the choice they were
       making, so anything marked this way keeps its own keys and the rail
       steps back. */
    if ((e.target as HTMLElement | null)?.closest("[data-arrow-keys]")) return;

    const root = navRef.current;
    if (!root) return;
    const items = Array.from(
      root.querySelectorAll<HTMLElement>("[data-rail-item]"),
    ).filter((el) => el.offsetParent !== null);
    if (items.length === 0) return;

    const here = items.indexOf(document.activeElement as HTMLElement);
    let next = here;
    if (e.key === "ArrowDown") next = here < 0 ? 0 : (here + 1) % items.length;
    if (e.key === "ArrowUp")
      next = here < 0 ? items.length - 1 : (here - 1 + items.length) % items.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = items.length - 1;

    e.preventDefault();
    items[next]?.focus();
  }, []);

  // -------------------------------------------------------------
  // The scroll affordance
  // -------------------------------------------------------------

  const groupsRef = useRef<HTMLDivElement>(null);

  /**
   * ── THE LIST HAS TO SAY THAT IT CONTINUES ─────────────────────────
   * At 1440 by 900 the sheet of destinations is 1942 pixels tall in a
   * 596 pixel well, so two thirds of it is below the fold. The overflow
   * was already `auto` and the wheel already worked, but the scrollbar
   * this application draws is a one pixel hairline and the last visible
   * row happened to land flush against the foot's border. The result was
   * a list that stopped dead under a heading with nothing on screen
   * saying there was more, which is the bug the owner photographed. The
   * content was never unreachable. It was unannounced.
   *
   * This marks the scroller with `data-more-above` and `data-more-below`
   * and the stylesheet turns those into a soft fade at whichever end
   * still has content. Two attributes rather than one, because a fade at
   * the bottom that is still there when you have reached the bottom is a
   * permanent smudge that teaches the reader to ignore it, and then it
   * cannot tell them anything on the screen where it matters.
   *
   * IT WRITES THE ATTRIBUTES BY HAND INSTEAD OF THROUGH STATE. A
   * setState in a scroll handler would re-render twenty destinations,
   * their counts and their marks on every frame of every flick. Nothing
   * else in the tree reads these two values, so nothing is served by
   * putting them in React's model; the DOM is the model here.
   */
  const markScrollEnds = useCallback(() => {
    const el = groupsRef.current;
    if (!el) return;

    /* A pixel of slack at each end. Fractional scroll positions are
       ordinary on a trackpad and at a device pixel ratio that is not a
       whole number, and an exact comparison would leave a one hair fade
       hanging at the bottom of a list that has finished. */
    const slack = 1;
    const room = el.scrollHeight - el.clientHeight;
    const above = el.scrollTop > slack;
    const below = room > slack && el.scrollTop < room - slack;

    el.setAttribute("data-more-above", above ? "true" : "false");
    el.setAttribute("data-more-below", below ? "true" : "false");
  }, []);

  /* Runs after every render, with no dependency list on purpose. The
     height of this sheet is not a constant: the second level opens and
     closes with the route, the facet blocks appear on some screens only,
     and the counts can rewrap a row. Every one of those arrives as a
     render, so a render is the cheapest reliable moment to re-measure,
     and the two writes above are idempotent. */
  useEffect(markScrollEnds);

  /* The other three moments, none of which is a render: the reader
     scrolls, the window changes shape, or the well itself is resized by
     something outside this component, which is what the collapse does. */
  useEffect(() => {
    const el = groupsRef.current;
    if (!el) return;

    el.addEventListener("scroll", markScrollEnds, { passive: true });
    window.addEventListener("resize", markScrollEnds);

    /* Guarded, because jsdom and older Safari have no ResizeObserver and
       a rail that throws on mount would take the whole shell with it. */
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(markScrollEnds);
    observer?.observe(el);

    return () => {
      el.removeEventListener("scroll", markScrollEnds);
      window.removeEventListener("resize", markScrollEnds);
      observer?.disconnect();
    };
  }, [markScrollEnds]);

  /**
   * ── WHERE THE NARROW LAYOUT WENT ──────────────────────────────────
   * This rail used to grow its own phone chrome: a fixed strip at the
   * top holding the lockup, a fixed bar across the bottom naming the
   * screen, and a sheet raised by pressing that bar. All three are gone,
   * and none of the reasoning behind them is lost.
   *
   * The mega nav now runs across the top of every railed screen at every
   * width, carrying the lockup and the six destinations pressed all day
   * with their live figures on them. Below the narrow breakpoint it also
   * carries the hamburger, and the hamburger opens this whole rail as a
   * drawer. That is one navigation with two levels rather than two
   * navigations arguing, and the bar naming the current screen is
   * redundant now that the mega nav marks it in place.
   *
   * The drawer, its focus trap, its Escape key and its scrim all belong
   * to AppShell, because the shell is the only component that can make
   * the page behind a drawer inert. The rail is simply what goes in it.
   */
  const collapsed = rail.collapsed;

  return (
    <nav
      ref={navRef}
      onKeyDown={onKeyDown}
      className={styles.rail}
      data-collapsed={collapsed ? "true" : "false"}
      aria-label="Every screen in The Opening Book"
    >
      <div className={styles.head}>
        {/*
          THE MARK IS A SIBLING OF THE LINK, NOT ITS CHILD, and it stays
          that way in the rail. A link computes its accessible name from
          its own aria-label first, so anything the mark has to say about
          the figure it draws is swallowed if it sits inside one.
        */}
        <div className={styles.brand}>
          <PinMark size={34} fill={fill} title={markLabel} />
          {/*
            A plain Link rather than a NavLink, and that is not an
            oversight. The lockup and the Desk row both point at "/", so a
            NavLink here would put a second aria-current="page" on the
            page every time somebody was standing on the desk. Two
            answers to "where am I" is the same as none. The lockup is a
            way home, not a position in the rail.
          */}
          <Link
            to="/"
            className={styles.brandLink}
            aria-label="The Opening Book, go to the desk"
          >
            <span className={styles.brandText}>
              <strong>The Opening Book</strong>
              <span className={styles.brandSub}>
                {VENUE.name}, 245 W Birch St
              </span>
            </span>
          </Link>
        </div>

        {/*
          The context label. It names the one person this tool is for and
          the one building it is about, and there is nothing to switch
          between because there is nothing else.
        */}
        <p className={styles.contextLabel}>Sales manager, Brea</p>

        <div className={styles.context}>
          {/*
            The countdown is the point of the chrome and it survived the
            move into the rail unchanged. A conventional shell would put
            the venue name here and stop. This one carries a number of
            weeks permanently, because the single fact that makes this
            application different from a CRM is that MAIN EVENT BREA IS
            NOT OPEN YET, and a fact that only appears on the screen a
            reader happens to be looking at is a fact half of them miss.

            The weeks come from the selected period rather than from a
            clock. Main Event has not published an opening date, so
            counting down to one would be inventing it.

            COLLAPSED, THE UNIT IS CLIPPED RATHER THAN DROPPED. A bare
            figure in a narrow column is the defect the owner photographed:
            "12" on its own is twelve of nothing. The word stays in the
            accessibility tree so the figure is still announced with what
            it counts, and it is repeated as the title so a pointer gets
            the same sentence a screen reader does.
          */}
          <div className={styles.countdown} title={countdownLabel}>
            <span className={`${styles.countdownValue} num`}>
              {weeks > 0 ? weeks : 0}
            </span>
            <span className={styles.countdownUnit}>{countdownUnit}</span>
          </div>

          <div className={styles.contextItem}>
            <label className={styles.periodLabel} htmlFor="period-select">
              Period
            </label>
            <select
              id="period-select"
              /* Up and down belong to the list of periods here, not to the
                 rail. See the guard in onKeyDown. */
              data-arrow-keys=""
              className={styles.select}
              value={pipeline.periodId}
              onChange={(e) =>
                dispatch({ type: "SET_PERIOD", periodId: e.target.value })
              }
            >
              {PERIODS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/*
        The two data attributes start as "false" and are corrected by
        markScrollEnds in the layout that follows this render. Declaring
        them here rather than leaving them absent means the first paint
        already matches the resting shape of the rule in the stylesheet,
        so a reader who lands on a short list never sees a fade flash on
        and off before the measurement catches up.
      */}
      <div
        ref={groupsRef}
        className={styles.groups}
        id="rail-groups"
        data-more-above="false"
        data-more-below="false"
      >
        {/*
          THE ADD CONTROL SITS AT THE TOP OF THE RAIL, NOT IN ITS FOOT.
          The foot is dropped entirely below 1024px, and a phone is
          exactly where a business found on a pavement gets typed in, so
          a control parked there would be missing on the one device that
          needs it. Here it is the first thing in the sheet. The inbox
          carries the same control above its list for the same reason.
        */}
        <div className={styles.add}>
          <AddProspectButton label="Add a prospect" />
        </div>

        {GROUPS.map((group) => (
          <section
            key={group.id}
            className={styles.group}
            aria-labelledby={`rail-group-${group.id}`}
          >
            <h2 className={styles.heading} id={`rail-group-${group.id}`}>
              {group.heading}
            </h2>

            <ul className={styles.list}>
              {group.items.map((item) => {
                const href = railHref(item.to);
                /* `here` is the one computed at the top of the component.
                   It used to be recomputed inside this map, shadowing it,
                   which is how the mode aware reading above could be
                   correct and this row still be wrong. */
                const active =
                  item.to === "/leagues"
                    ? here === href || here.startsWith(`${href}/`)
                    : here === href;
                const count = counts[item.to];
                return (
                  <li
                    key={item.to}
                    className={styles.row}
                    /*
                      THE SECTION IS DECLARED ON THE ROW. Twenty rows,
                      twenty identities, all on screen at once, and the
                      shell root behind them still saying which one the
                      reader is standing in. One attribute, one
                      stylesheet, no per screen code in here. See
                      sections.ts.
                    */
                    data-sec={item.sec}
                    /*
                      And the featured row declares its rank the same
                      way, on the same element, so sections.css can turn
                      the mark inside it into a silhouette on a light key
                      cap without either navigation naming a colour. See
                      the block at the foot of that file.
                    */
                    data-featured={item.featured ? "key" : undefined}
                  >
                    <NavLink
                      to={href}
                      /* Exact everywhere except leagues, the one
                         destination in this rail with a child route
                         under it. */
                      end={item.to !== "/leagues"}
                      data-rail-item=""
                      title={item.hint}
                      className={({ isActive }) =>
                        [
                          styles.item,
                          item.featured ? styles.itemFeature : "",
                          isActive ? styles.itemActive : "",
                        ]
                          .filter(Boolean)
                          .join(" ")
                      }
                    >
                      <SectionMark section={item.sec} />
                      {item.featured ? (
                        <>
                          {/*
                            The space between the two lines is a real
                            text node, so the name this link computes is
                            "Maps 211 organisations" rather than one run
                            of characters with a number wedged into it.
                            A whitespace only run inside a grid container
                            generates no box, so it costs nothing on
                            screen.
                          */}
                          <span className={styles.featureLabel}>
                            {item.label}
                          </span>{" "}
                          {/*
                            THE FIGURE IS PRINTED, NOT DROPPED IN A WELL.
                            A readout is this rail's instrument for work
                            waiting, and 211 in one beside the word Maps
                            says two hundred and eleven things are owed. The
                            noun turns the same figure into the size of
                            the territory behind the key, which is what
                            it has always counted.

                            It is also the last child of the link on
                            purpose: the rail's own assertion script
                            reads a row's figure off the last span, and a
                            proof that has to be taught about a special
                            case stops being a proof.
                          */}
                          <span className={styles.featureFigure}>
                            <span className="num">
                              {count ? count.value : 0}
                            </span>{" "}
                            {FEATURED_KEY.figureUnit}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className={styles.label}>{item.label}</span>
                          {/*
                            THE READOUT IS ALWAYS RENDERED, WITH OR
                            WITHOUT A FIGURE IN IT. Its width is reserved
                            in ch on the mono face, so a count going from
                            9 to 10 to 104 moves nothing, and a
                            destination with no figure leaves a well the
                            same size as every other. A rail whose rows
                            shuffle sideways as the week changes is a
                            rail that cannot be scanned.
                          */}
                          <Readout
                            value={count ? count.value : null}
                            unit={count?.unit}
                            lead={active}
                          />
                        </>
                      )}
                    </NavLink>

                    {/*
                      The second level, and only for the row you are
                      standing on. Rendered inside this row's list item so
                      it is structurally part of the destination it
                      refines rather than a sibling that happens to sit
                      underneath it.
                    */}
                    {active && subFilters.length > 0 ? (
                      <ul
                        className={styles.subList}
                        aria-label={`Filters within ${item.label}`}
                      >
                        {subFilters.map((sub) => (
                          <li key={sub.id}>
                            {sub.to ? (
                              <Link
                                /* Through railHref like every other row.
                                   A second level row that jumps out of
                                   Rationale back into Console is a rail
                                   that is not the same rail. */
                                to={railHref(sub.to)}
                                data-rail-item=""
                                className={styles.sub}
                              >
                                <span className={styles.subLabel}>
                                  {sub.label}
                                </span>
                                <Readout value={sub.count} unit={sub.unit} />
                              </Link>
                            ) : (
                              <button
                                type="button"
                                data-rail-item=""
                                className={styles.sub}
                                aria-pressed={sub.active ?? false}
                                onClick={sub.onSelect}
                              >
                                <span className={styles.subLabel}>
                                  {sub.label}
                                </span>
                                <Readout value={sub.count} unit={sub.unit} />
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>

            {/*
              The filters that change the working set, under the group
              whose destination draws it. Always on screen rather than
              only on the row you are standing on, because the whole point
              of them is to be pressed FROM the desk, the map or the week
              sheet when a number somewhere else raises a question.
            */}
            {group.id === "working" ? (
              <div className={styles.facets}>
                <h3 className={styles.facetHeading} id="rail-facet-status">
                  By status
                </h3>
                <ul
                  className={styles.filterList}
                  aria-labelledby="rail-facet-status"
                >
                  {PITCH_STATUS_ORDER.map((status) => {
                    const token = PITCH_STATUS[status];
                    const on = onInbox && onlyFacet(params, "status", status);
                    return (
                      <li key={status}>
                        <Link
                          to={workingSetHref("status", status, on)}
                          data-rail-item=""
                          data-facet={`status:${status}`}
                          className={styles.filter}
                          aria-current={on ? "true" : undefined}
                          title={token.note}
                        >
                          <span
                            className={styles.filterGlyph}
                            style={{ color: token.cssVar }}
                            aria-hidden="true"
                          >
                            {token.glyph}
                          </span>
                          <span className={styles.label}>{token.label}</span>
                          <Readout
                            value={working.status[status]}
                            unit="organisations at this status"
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                {/*
                  THE ICON FILTER. Four marks from one family, because the
                  question they answer is not what an organisation sells,
                  it is WHERE THE DECISION IS: inside the building, above
                  it at a region, or on a term calendar through
                  procurement. Each tile carries the glyph, the word and
                  the figure, so it is readable in greyscale.
                */}
                <h3 className={styles.facetHeading} id="rail-facet-type">
                  By who decides
                </h3>
                <ul
                  className={styles.tiles}
                  aria-labelledby="rail-facet-type"
                >
                  {ORG_TYPE_ORDER.map((type) => {
                    const meta = ORG_TYPE_META[type];
                    const on = onInbox && onlyFacet(params, "type", type);
                    return (
                      <li key={type}>
                        <Link
                          to={workingSetHref("type", type, on)}
                          data-rail-item=""
                          data-facet={`type:${type}`}
                          className={styles.tile}
                          aria-current={on ? "true" : undefined}
                          title={meta.note}
                        >
                          <span
                            className={styles.tileGlyph}
                            style={{ color: meta.cssVar }}
                            aria-hidden="true"
                          >
                            {meta.glyph}
                          </span>
                          <span className={styles.tileLabel}>{meta.label}</span>
                          <span className={`${styles.tileCount} num`}>
                            {working.type[type]}
                            <span className="visually-hidden">
                              {" "}
                              organisations of this type
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                <h3 className={styles.facetHeading} id="rail-facet-attention">
                  Wanting attention
                </h3>
                <ul
                  className={styles.filterList}
                  aria-labelledby="rail-facet-attention"
                >
                  {/*
                    GOING STALE IS THE MOST USEFUL ROW IN THIS RAIL.
                    It is Pipedrive's rotting timer: a threshold per stage
                    in days, reset by any real activity in either
                    direction, and it works inside every status rather
                    than only at the end of one. A held date at three days
                    of silence is an emergency and a first touch at six
                    days is not, which is why the thresholds differ and
                    why one figure can carry both.
                  */}
                  <li>
                    <Link
                      to={workingSetHref(
                        "stale",
                        "1",
                        onInbox && onlyFacet(params, "stale", "1"),
                      )}
                      data-rail-item=""
                      data-facet="stale:1"
                      className={styles.filter}
                      aria-current={
                        onInbox && onlyFacet(params, "stale", "1")
                          ? "true"
                          : undefined
                      }
                      title="Past the day threshold this status allows, counted from the last activity in either direction"
                    >
                      <span
                        className={styles.filterGlyph}
                        style={{ color: "var(--risk)" }}
                        aria-hidden="true"
                      >
                        ⌛
                      </span>
                      <span className={styles.label}>Going stale</span>
                      <Readout
                        value={working.stale}
                        unit="organisations past their stage threshold"
                      />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={workingSetHref(
                        "awaiting",
                        "1",
                        onInbox && onlyFacet(params, "awaiting", "1"),
                      )}
                      data-rail-item=""
                      data-facet="awaiting:1"
                      className={styles.filter}
                      aria-current={
                        onInbox && onlyFacet(params, "awaiting", "1")
                          ? "true"
                          : undefined
                      }
                      title="They wrote last and nothing has gone back"
                    >
                      <span
                        className={styles.filterGlyph}
                        style={{ color: "var(--warn)" }}
                        aria-hidden="true"
                      >
                        ◉
                      </span>
                      <span className={styles.label}>Awaiting a reply</span>
                      <Readout
                        value={working.awaiting}
                        unit="organisations waiting on an answer"
                      />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={workingSetHref(
                        "added",
                        "1",
                        onInbox && onlyFacet(params, "added", "1"),
                      )}
                      data-rail-item=""
                      data-facet="added:1"
                      className={styles.filter}
                      aria-current={
                        onInbox && onlyFacet(params, "added", "1")
                          ? "true"
                          : undefined
                      }
                      title="Organisations typed in from the field, kept apart from the researched rows"
                    >
                      <span
                        className={styles.filterGlyph}
                        style={{ color: "var(--prov-user)" }}
                        aria-hidden="true"
                      >
                        ✎
                      </span>
                      <span className={styles.label}>Added by hand</span>
                      <Readout
                        value={working.added}
                        unit="organisations entered by hand"
                      />
                    </Link>
                  </li>
                </ul>
              </div>
            ) : null}
          </section>
        ))}
      </div>

      <div className={styles.foot}>
        {/*
          The width control is the one thing in this foot that survives the
          collapse, and its word survives with it: the label is clipped
          rather than dropped, so the button is still called "Widen the
          rail" by anything listening. A chevron on its own is a glyph with
          no name, which is how a narrow rail becomes a dead end.
        */}
        <button
          type="button"
          data-rail-item=""
          className={styles.collapse}
          aria-pressed={collapsed}
          title={collapsed ? "Widen the rail" : "Collapse the rail"}
          onClick={() => railDispatch({ type: "TOGGLE_COLLAPSE" })}
        >
          <Icon name="chevron" />
          <span className={styles.label}>
            {collapsed ? "Widen the rail" : "Collapse the rail"}
          </span>
        </button>

        {/*
          The sound control lives in the foot rather than on the strip for
          one measured reason: the strip needs 888px against a breakpoint
          of 899, so there are eleven pixels of width up there and this
          button is not worth the mega nav breaking at one window size.
          The foot is also where the other two settings already are, which
          is the shelf a reader looks at when they want to change how the
          thing behaves rather than where they are.
        */}
        <SoundControlButton />

        <div className={styles.reset}>
          <ResetControl />
        </div>
      </div>
    </nav>
  );
}
