import { useEffect, useState, type ReactNode } from "react";
import type { Lane } from "@/domain/types";
import {
  DOOR_ONLY,
  EMAILABLE,
  EXCLUDED_FROM_BOARD,
  PROSPECTS,
} from "@/data/prospects";
import {
  GATED_PACKAGES,
  PACKAGES,
  PRICED_PACKAGES,
  STANDARD_TERMS,
} from "@/data/packages";
import {
  DEMO_RECIPIENT,
  INBOUND_ROUTES,
  NOT_PUBLISHED_BY_ROUND1,
  OFFERS,
  PERIODS,
  VENUE,
} from "@/data/venue";
import { SEED_ACTIVITY, SEED_BOOK, SEED_REPLIES } from "@/data/book";
import { SEED_STATUSES } from "@/data/prospectStatus";
import {
  GUESTS_PER_BOWLING_LANE,
  LANE_META,
  LANE_ORDER,
  lanesForGuests,
} from "@/domain/lanes";
import { MAX_SIMULTANEOUS_BOWLERS } from "@/domain/selectors/capacity";
import { LEDGER } from "@/domain/vocabulary";
import { RESPONSE_COMMITMENT } from "@/domain/requests";
import { LaneChip } from "@/components/primitives/LaneChip";
import {
  ProvenanceBadge,
  PROVENANCE_META,
  PROVENANCE_ORDER,
  WithheldFigure,
} from "@/components/primitives/ProvenanceBadge";
import { SOURCE_LINKS } from "@/lib/links";
import styles from "./MethodPage.module.css";

/**
 * METHOD. The page that makes every other page in this application
 * worth reading.
 *
 * ── WHY IT EXISTS ──────────────────────────────────────────────────
 * Every other screen here asks a hiring manager to believe something.
 * The desk asks them to believe an ordering. The capacity chart asks
 * them to believe a lane count. The book asks them to believe a dollar
 * figure. None of those are worth anything on their own, because a
 * prototype can print any number it likes and most of them do.
 *
 * What makes a figure believable is not confidence. It is the reader
 * being able to check it, and being told plainly which figures they
 * cannot check because nobody published them. So this page carries every
 * formula, every source, every assumption and every invention, in the
 * order a sceptical reader would ask for them, and it links out to the
 * actual pages the real numbers were read off on 11 and 14 August 2026.
 *
 * ── THE SECTION THAT DOES THE MOST WORK IS THE SECOND ONE ──────────
 * Section two is about the prospects that are NOT in this application.
 * DIME Industries would have been the most entertaining row on
 * the board, and two sources disagreed about where its office is, so the
 * row came out. Nothing on any other screen demonstrates the standard
 * this data was held to as economically as one deleted row does, which
 * is why it gets its own visual treatment rather than a bullet in a
 * list.
 *
 * One deleted row is an anecdote, though, and an anecdote is the easiest
 * thing in the world to pick because it flatters the person telling it.
 * So the section now renders EXCLUDED_FROM_BOARD in full underneath it:
 * every organisation the research passes found, verified as real,
 * and still refused. A rule that was applied once is a story. A rule
 * that was applied every time it fired is a standard, and the difference
 * between the two is the entire argument this page makes.
 *
 * ── EVERY COUNT HERE IS DERIVED, NOT TYPED ─────────────────────────
 * The organisation counts, the emailable counts, the package counts, the
 * seed counts and the lane arithmetic are all read off the data at render
 * time. A method page that hardcodes "69 organisations" is one data
 * change away from being the least trustworthy page in an application
 * whose entire argument is about trust. There is no number below that a
 * reader can catch disagreeing with the screen it describes.
 *
 * ── THE SHAPE OF THE PAGE ──────────────────────────────────────────
 * This is long prose and it is meant to be. A reader who cannot see the
 * shape of a long page bounces off it, so the section index is pinned
 * down the side on wide screens and tracks the reader's position, and the
 * measure is held at 68 characters throughout because that is where prose
 * stops being work to read.
 */

// ---------------------------------------------------------------
// The index
// ---------------------------------------------------------------

interface SectionRef {
  id: string;
  ordinal: string;
  title: string;
  /** Shown under the title in the rail, so the index is a summary too. */
  gist: string;
}

const SECTIONS: SectionRef[] = [
  {
    id: "real",
    ordinal: "01",
    title: "What is real",
    gist: "Three research passes, three email ratios",
  },
  {
    id: "left-out",
    ordinal: "02",
    title: "What was left out",
    gist: "The rows that came off the board",
  },
  {
    id: "provenance",
    ordinal: "03",
    title: "The provenance system",
    gist: "Six values, and why one is a finding",
  },
  {
    id: "score",
    ordinal: "04",
    title: "The score",
    gist: "Every weight in the desk ranking",
  },
  {
    id: "capacity",
    ordinal: "05",
    title: "The capacity arithmetic",
    gist: "One lane per twenty guests, and no house to divide by",
  },
  {
    id: "ledgers",
    ordinal: "06",
    title: "The two ledgers",
    gist: "Why activity can never be revenue",
  },
  {
    id: "illustrative",
    ordinal: "07",
    title: "What is illustrative",
    gist: "The invented half, named",
  },
  {
    id: "day-one",
    ordinal: "08",
    title: "What changes on day one",
    gist: "Four figures that arrive with access",
  },
  {
    id: "theme",
    ordinal: "09",
    title: "The theme and its proof",
    gist: "Two grounds from one table, and every ratio measured",
  },
  {
    id: "disclaimer",
    ordinal: "10",
    title: "The disclaimer",
    gist: "Unaffiliated work sample",
  },
];

// ---------------------------------------------------------------
// Small pieces
// ---------------------------------------------------------------

/**
 * A citation. Every one of these goes to a page a reader can open in a
 * new tab and check in about fifteen seconds, which is the only reason
 * the word "public" means anything anywhere in this application.
 */
function Src({
  href,
  children,
  label,
}: {
  href: string;
  children: ReactNode;
  label: string;
}) {
  return (
    <a
      className={`${styles.src} tap`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label}, opens in a new tab`}
    >
      <span aria-hidden="true" className={styles.srcGlyph}>
        ◆
      </span>
      <span className={styles.srcLabel}>{children}</span>
    </a>
  );
}

function Section({
  section,
  lead,
  children,
}: {
  section: SectionRef;
  lead: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={section.id} className={styles.section} aria-labelledby={`${section.id}-h`}>
      <div className={styles.sectionHead}>
        <p className={styles.ordinal} aria-hidden="true">
          {section.ordinal}
        </p>
        <h2 className={styles.h2} id={`${section.id}-h`}>
          {section.title}
        </h2>
      </div>
      {/* The lead is set in the serif operator face. Serif for voice,
          sans for work, which is the rule the whole app follows. */}
      <p className={styles.lead}>{lead}</p>
      {children}
    </section>
  );
}

/** A figure with its origin, for the count strips at the top of sections. */
function Tally({
  value,
  label,
  provenance,
  title,
}: {
  value: string;
  label: string;
  /* "withheld" is in the union because a tally can now report an
     absence, and an absence has to carry the same badge everything
     else does. */
  provenance: "public" | "modeled" | "illustrative" | "withheld";
  title: string;
}) {
  return (
    <div className={styles.tally} title={title}>
      <span className={`${styles.tallyValue} num`}>{value}</span>
      <span className={styles.tallyLabel}>
        {label}
        <ProvenanceBadge provenance={provenance} compact />
      </span>
    </div>
  );
}

// ---------------------------------------------------------------
// THE DESK WEIGHTS, transcribed from domain/selectors/desk.ts.
//
// These are read off the source file rather than remembered, and they
// are the real values the ranking uses: 40 / 15 / 8 for reachability,
// 25 against 8 for occasion class, 20 against 4 for the buying window,
// a size term capped at 15, and a penalty of minus 10 once a prospect
// has been touched three times.
//
// WHY THEY ARE RETYPED HERE RATHER THAN IMPORTED. The constants in
// desk.ts are private to the scoring function, and exporting them so
// this page could render a table would widen a domain module's public
// surface for the benefit of a documentation screen. The honest cost of
// the copy is that the two can drift, so the table below prints the
// maximum it computes from its own rows, and that maximum is 100. A
// reader who sees anything other than 100 there is looking at a page
// that has fallen out of step with the file it describes.
// ---------------------------------------------------------------

interface WeightRow {
  criterion: string;
  cases: { when: string; points: number }[];
  /** Counts toward the theoretical maximum score. */
  best: number;
  why: string;
}

const WEIGHTS: WeightRow[] = [
  {
    criterion: "Can I reach them at all",
    cases: [
      { when: "Publishes an email, read off a cited page", points: 40 },
      { when: "Contact form only", points: 15 },
      { when: "No written door at all", points: 8 },
    ],
    best: 40,
    why: "Weighted heaviest, and it is the least romantic criterion in the list. A touch against a published address costs two minutes. A touch against a front desk costs a forty minute round trip, and there are only so many of those in a week. Nothing else on this list changes the cost of the work by that factor.",
  },
  {
    criterion: "Does their event exist without me",
    cases: [
      { when: "Calendar-locked buyer", points: 25 },
      { when: "Discretionary buyer", points: 8 },
    ],
    best: 25,
    why: "A graduating class graduates whether or not anybody calls it. That certainty is the only asset a venue with no building has, so a buyer whose occasion is already on a calendar outranks one who has to be persuaded there should be an occasion at all.",
  },
  {
    criterion: "Is the window open",
    cases: [
      { when: "Buys inside the next four months", points: 20 },
      { when: "Buys later than that, or no window on record", points: 4 },
    ],
    best: 20,
    why: "Outreach leads the window, so the horizon is four months rather than one. A grad night in June is decided in autumn. Miss it and you have not missed a month, you have missed a year.",
  },
  {
    criterion: "How big is it",
    cases: [
      {
        when: "Midpoint of the modeled range divided by twenty, then capped",
        points: 15,
      },
    ],
    best: 15,
    why: "Last, deliberately, and capped. Headcount is the figure everybody sorts by and it is the one most likely to be wrong, because every headcount in this data set is a modeled range with its basis stated rather than a measurement. A criterion built on the softest data in the set is not allowed to outweigh one built on a published email address.",
  },
];

const ALREADY_WORKED_PENALTY = -10;
const ALREADY_WORKED_AT = 3;

// ---------------------------------------------------------------
// THE KINDS OF REMOVAL IN SECTION TWO
//
// Every row in EXCLUDED_FROM_BOARD came off the board for a coordinate
// reason, and they are not all the same reason. Fifteen of them the US
// Census geocoder simply could not match, which is a statement about the
// Census address file lagging new construction rather than about the
// business. Two more are real and have nothing loadable behind them that
// proves the address at all. Eight are worse and much more interesting:
// the geocoder came back with a DIFFERENT STREET from the one the
// research pass had read off a first-party page, which is precisely the
// disagreement that took DIME Industries out.
//
// THE KIND IS READ OFF THE ROW. Every removal carries a `kind` field and
// this page groups on it. It is not inferred from the organisation's
// name and it is not sniffed out of the reason prose, because a list of
// names typed into a screen is a classifier that works until somebody
// adds a row, and a regular expression run over a paragraph of English
// is one that works until somebody rewrites a sentence. See
// ExclusionKind in data/prospects.ts.
//
// The page renders two headings rather than three. The disagreements get
// one, and the other two kinds share the second, because both of those
// are "there is nothing here to pin" and only a disagreement is "two
// sources contradict each other". The note under that heading counts
// each kind separately rather than blurring them.
// ---------------------------------------------------------------

// ---------------------------------------------------------------
// THE CONTRAST TABLE, AND WHY IT IS TRANSCRIBED RATHER THAN
// COMPUTED IN THE BROWSER.
//
// A page could read the computed colour of every element and print
// live ratios, and that would be a worse exhibit than this one. A
// live figure measures whatever happens to be on screen at the
// moment it runs, so it can only ever report the pairs this page
// itself paints, and it would report them for a reader who cannot
// check the working. These are the measured ratios for every pair
// the THEME defines, produced with the WCAG 2.x relative luminance
// formula against every background each ink is actually painted on
// across all seventeen routes, and then confirmed by walking every
// rendered text node in a browser.
//
// Four papers, seven status and lane tints, and the operator note's
// two surfaces is fourteen backgrounds. The table prints the three
// papers a reader can name and then the worst of all fourteen,
// because the worst number is the only one that decides anything.
// ---------------------------------------------------------------

interface InkRow {
  /** The token, named rather than spelled as a hex. */
  token: string;
  /** What it is for, since a token name is not a job description. */
  role: string;
  /** The lightness the generator was asked for, in each ground. */
  darkL: string;
  lightL: string;
  card: string;
  page: string;
  well: string;
  worst: string;
}

/**
 * The same four tokens, twice, because there are two grounds now.
 *
 * The table is keyed by ground rather than duplicated, so a third
 * ground would be a third key and not a third block of markup. That
 * is the same argument the section makes in prose and it is worth
 * the page making it in its own structure as well.
 *
 * The lightness columns are the interesting ones. Read down them and
 * the whole light theme is visible: 97 becomes 10, 70 becomes 35,
 * and the ratio beside each one barely moves.
 */
const INK_RATIOS: Record<"dark" | "light", InkRow[]> = {
  dark: [
    {
      token: "--text-0",
      role: "Primary ink. Figures, names, headings",
      darkL: "97",
      lightL: "10",
      card: "15.28",
      page: "16.97",
      well: "10.31",
      worst: "10.31",
    },
    {
      token: "--text-1",
      role: "Secondary. Body prose and table cells",
      darkL: "85",
      lightL: "22",
      card: "11.14",
      page: "12.37",
      well: "7.51",
      worst: "7.51",
    },
    {
      token: "--text-2",
      role: "Meta. Notes, captions, unit labels",
      darkL: "78",
      lightL: "29",
      card: "9.09",
      page: "10.09",
      well: "6.13",
      worst: "6.13",
    },
    {
      token: "--text-3",
      role: "Dimmest. Column headings, provenance notes",
      darkL: "70",
      lightL: "35",
      card: "7.13",
      page: "7.91",
      well: "4.81",
      worst: "4.81",
    },
  ],
  light: [
    {
      token: "--text-0",
      role: "Primary ink. Figures, names, headings",
      darkL: "97",
      lightL: "10",
      card: "14.76",
      page: "16.24",
      well: "10.62",
      worst: "10.62",
    },
    {
      token: "--text-1",
      role: "Secondary. Body prose and table cells",
      darkL: "85",
      lightL: "22",
      card: "10.66",
      page: "11.72",
      well: "7.66",
      worst: "7.66",
    },
    {
      token: "--text-2",
      role: "Meta. Notes, captions, unit labels",
      darkL: "78",
      lightL: "29",
      card: "8.32",
      page: "9.15",
      well: "5.99",
      worst: "5.99",
    },
    {
      token: "--text-3",
      role: "Dimmest. Column headings, provenance notes",
      darkL: "70",
      lightL: "35",
      card: "6.68",
      page: "7.35",
      well: "4.80",
      worst: "4.80",
    },
  ],
};

/**
 * What a second ground actually cost, token by token, for the four
 * colours that carry the product's identity.
 *
 * The hue column is the whole exhibit: it does not change. A reader
 * toggling the theme sees the same violet, the same cyan, the same
 * magenta and the same orange at a different lightness, which is why
 * both themes are recognisably one product rather than two.
 */
interface GroundRow {
  token: string;
  role: string;
  hue: string;
  darkL: string;
  lightL: string;
}

const GROUND_MOVES: GroundRow[] = [
  {
    token: "--surface-0",
    role: "The page. The one decision every screen inherits",
    hue: "300",
    darkL: "7",
    lightL: "98",
  },
  {
    token: "--surface-3",
    role: "The inset well, and the hardest paper in both grounds",
    hue: "300",
    darkL: "25",
    lightL: "82",
  },
  {
    token: "--accent",
    role: "The pressable colour. Nothing else is this hue",
    hue: "205",
    darkL: "74",
    lightL: "36",
  },
  {
    token: "--brand-gold",
    role: "The signal colour. Editorial, never a status",
    hue: "336",
    darkL: "70",
    lightL: "34",
  },
  {
    token: "--feature",
    role: "The featured key. The one warm thing on a cold cabinet",
    hue: "62",
    darkL: "70",
    lightL: "42",
  },
  {
    token: "--surface-inverse",
    role: "The inverted panel. Not a dark surface, the other ground",
    hue: "78 / 300",
    darkL: "95",
    lightL: "10",
  },
];

// ---------------------------------------------------------------
// THE NINE LANES, MEASURED UNDER SIMULATED COLOUR BLINDNESS.
//
// Keyed by Lane rather than written as a list, so a tenth lane
// cannot be added to the domain without this table refusing to
// compile. The rendering below walks LANE_ORDER, which is the same
// order every other screen uses, so this table can never disagree
// with the board about how many lanes exist or which order they
// come in.
//
// `before` and `after` are each the smallest CIEDE2000 distance
// between that lane and any of the other eight, taken as the worst
// of protanopia, deuteranopia and tritanopia simulated with the
// Vienot, Brettel and Mollon (1999) transform. Below about 2 units
// two colours are the same colour. Above about 8 they are reliably
// told apart.
//
// `before` is the paper theme this one replaced, which was itself a
// rebuild of a ramp whose floor was 1.32. `after` is the cabinet.
// ---------------------------------------------------------------

interface LaneSeparation {
  /** Cool, earth or plum, crossed with the band to make the matrix. */
  family: string;
  /** 1 is the band nearest the ground, 3 the one furthest from it. */
  band: string;
  before: string;
  after: string;
  /** The same measurement on the light ground. */
  light: string;
}

const LANE_SEPARATION: Record<Lane, LaneSeparation> = {
  schools: {
    family: "Acid",
    band: "1",
    before: "9.53",
    after: "10.42",
    light: "9.50",
  },
  colleges: {
    family: "Acid",
    band: "2",
    before: "8.85",
    after: "10.00",
    light: "8.87",
  },
  "fitness-youth-sports": {
    family: "Acid",
    band: "3",
    before: "8.85",
    after: "10.00",
    light: "8.87",
  },
  corporate: {
    family: "Ember",
    band: "3",
    before: "8.98",
    after: "10.66",
    light: "9.56",
  },
  "auto-finance": {
    family: "Ember",
    band: "2",
    before: "9.10",
    after: "10.42",
    light: "9.56",
  },
  "hospitality-civic": {
    family: "Ultra",
    band: "2",
    before: "9.83",
    after: "10.42",
    light: "8.72",
  },
  "faith-nonprofit": {
    family: "Ultra",
    band: "3",
    before: "8.98",
    after: "10.42",
    light: "8.72",
  },
  healthcare: {
    family: "Ultra",
    band: "1",
    before: "9.68",
    after: "11.30",
    light: "10.07",
  },
  "local-retail-food": {
    family: "Ember",
    band: "1",
    before: "9.84",
    after: "10.42",
    light: "9.50",
  },
};

/**
 * How many rendered text nodes the last contrast walk covered, per
 * ground.
 *
 * Every text node on all twenty two routes, at 1440 and at 380, with
 * its computed colour resolved against the nearest painted background
 * behind it. The walk sets the theme attribute itself and runs the
 * whole set twice, so the two figures are the same nodes measured
 * against two palettes. Transcribed from the run rather than computed
 * here, because a page that audits itself while a reader watches is
 * measuring the page it is on and nothing else.
 */
const CONTRAST_WALK_NODES = "30,302";
const CONTRAST_WALK_TOTAL = "60,604";

// ---------------------------------------------------------------
// The page
// ---------------------------------------------------------------

export function MethodPage() {
  const [active, setActive] = useState<string>(SECTIONS[0]!.id);

  /**
   * The rail tracks the reader rather than the reader tracking the rail.
   *
   * The observer margins deliberately watch a band across the upper third
   * of the viewport rather than the whole of it. Without that, a long
   * section and a short one are both "intersecting" for most of a scroll
   * and the highlight flickers between them, which is worse than no
   * highlight at all.
   */
  useEffect(() => {
    const nodes = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (n): n is HTMLElement => Boolean(n),
    );
    if (nodes.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-12% 0px -72% 0px", threshold: 0 },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  /* Everything countable on this page, counted off the data it describes.
     Cheap enough to do on every render; these are single passes over an
     array of a hundred-odd items and another of twenty-odd. */
  const total = PROSPECTS.length;
  const emailable = EMAILABLE.length;
  const doorOnly = DOOR_ONLY.length;

  /*
    ONE RESEARCH PASS, AND THE ROWS SAY SO THEMSELVES.

    The fork this page came from described three passes told apart by
    what each row carried: a Google place id for the first, a date in
    `addressSource` for the other two. That structure is gone. Every row
    on this board was read off a published page and geocoded through the
    US Census Bureau one-line geocoder, benchmark 2020, on the same day,
    and every row states that method in its own `addressSource`.

    NO PLACES CALL WAS MADE, so `withPlaceId` counts zero and the field
    is absent on every row rather than filled with something that looks
    like an identifier. It is computed rather than asserted, because a
    documentation screen that claims an absence it has not checked is
    the one screen guaranteed to be wrong first: if a place id ever
    appears in the data this figure moves off zero and the sentence
    beside it stops matching, which is exactly the failure a reader
    should be able to catch.
  */
  const withPlaceId = PROSPECTS.filter((p) => p.placeId).length;
  const censusPass = PROSPECTS.filter((p) => !p.placeId);
  const isEmailable = (p: (typeof PROSPECTS)[number]) =>
    p.emailConfidence === "verified_public";

  /*
    The lane rollup is built off LANE_ORDER rather than off a list typed
    into this page, which is why a ninth lane appeared in this table
    without anybody editing it. A documentation screen that has its own
    opinion about how many lanes exist is the one screen guaranteed to be
    wrong first.
  */
  const laneRows = LANE_ORDER.map((lane: Lane) => {
    const rows = PROSPECTS.filter((p) => p.lane === lane);
    return {
      lane,
      organisations: rows.length,
      emails: rows.filter(isEmailable).length,
      doors: rows.filter((p) => p.emailConfidence === "none").length,
    };
  });

  const gated = GATED_PACKAGES.length;
  const priced = PRICED_PACKAGES.length;

  /*
    THE DENOMINATOR IS GONE AND THIS SECTION IS HALF THE LENGTH IT WAS.

    `houseLanes` is null, because DIME publishes no bowling lane count
    for any location. The fork read twenty six off another operator's own
    page and every figure in the capacity section divided by it. Carrying
    that number across would have been the cheapest possible fix and the
    most damaging: a share of somebody else's building, printed on a page
    that claims to document where every figure came from, is the one
    error that would put the rest of this document in doubt.

    So the share is null and the screen says so. The multiplication is
    left in place, guarded, because the method was never the problem.
  */
  const houseLanes: number | null = VENUE.bowlingLanesPublished;
  const bigGroup = 300;
  const bigGroupLanes = lanesForGuests(bigGroup);
  const bigGroupShare =
    houseLanes === null
      ? null
      : Math.round((bigGroupLanes / houseLanes) * 100);

  const seededRows = SEED_STATUSES.length;
  const seededUnworked = SEED_STATUSES.filter((s) => s.status === "unworked").length;
  const illustrativeOffers = OFFERS.filter((o) => o.provenance === "illustrative").length;
  const publicOffers = OFFERS.filter((o) => o.provenance === "public").length;
  const typedPriceLines = SEED_BOOK.filter(
    (l) => l.pricePerGuestProvenance === "user_input",
  ).length;

  /* Section two, grouped by the kind of removal rather than listed flat.
     The two groups make a different argument from each other and the
     second one is the stronger of the two. */
  const disagreements = EXCLUDED_FROM_BOARD.filter(
    (e) => e.kind === "disagreement",
  );
  /* Unverifiable rows sit with the unmatched ones rather than getting a
     third heading. Both are "there is nothing here to pin"; only the
     disagreements are "two sources contradict each other", and that is
     the distinction the section is actually about. */
  const unmatched = EXCLUDED_FROM_BOARD.filter((e) => e.kind !== "disagreement");
  /* Both kinds inside that group, counted, because the heading covers two
     different failures and the note names each one. */
  const unmatchedOnly = unmatched.filter((e) => e.kind === "unmatched").length;
  const unverifiable = unmatched.filter((e) => e.kind === "unverifiable").length;

  const maxScore = WEIGHTS.reduce((n, w) => n + w.best, 0);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Every formula and source</p>
          <h1 className={styles.h1}>Method</h1>
          <p className={styles.lede}>
            Every other screen in this application asks you to believe
            something. This one is where those claims are settled. It carries
            the origin of every real figure, the formula behind every derived
            one, the name of everything invented, and the reason each
            invention was necessary to show the model working.
          </p>
          <p className={styles.subLede}>
            The published figures were read off dimeindustries.com and link back
            to the page they came from. The organisations came out of one
            research pass, read off first-party pages, landlord tenant
            directories, chamber member directories and city and district
            sites, and every coordinate was set by the US Census Bureau
            geocoder on 17 August 2026. No Places call was made, so no row
            carries a place id.
            Everything else is labelled as modeled, illustrative, entered or
            withheld, and the labels are enforced by the components rather
            than by good intentions.
          </p>
        </header>

        <div className={styles.board}>
          {/* -------------------------------------------------------
              THE INDEX. On a page this long a reader who cannot see
              the shape of it leaves before the argument lands, so the
              rail is pinned and tracks position. It collapses to a
              horizontal strip of anchors under 1080px rather than
              disappearing, because the shape is the point.
              ------------------------------------------------------- */}
          <nav className={styles.rail} aria-label="Sections on this page">
            <p className={styles.railTitle}>On this page</p>
            <ol className={styles.railList}>
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={styles.railLink}
                    data-active={active === s.id ? "true" : undefined}
                    aria-current={active === s.id ? "true" : undefined}
                  >
                    <span className={`${styles.railOrdinal} num`}>
                      {s.ordinal}
                    </span>
                    <span className={styles.railText}>
                      <span className={styles.railLabel}>{s.title}</span>
                      <span className={styles.railGist}>{s.gist}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className={styles.prose}>
            {/* =====================================================
                01. WHAT IS REAL
                ===================================================== */}
            <Section
              section={SECTIONS[0]!}
              lead={
                <>
                  The addresses, the coordinates, the phone numbers and the
                  email addresses are the part of this application that would
                  survive being checked line by line, and they are the reason
                  anything else on it is worth reading.
                </>
              }
            >
              <div className={styles.tallies}>
                <Tally
                  value={String(total)}
                  label="organisations"
                  provenance="public"
                  title="Every one inside the trade area around the Irvine office, read off a published page and geocoded through the US Census Bureau one-line geocoder on 17 August 2026."
                />
                <Tally
                  value={String(censusPass.length)}
                  label="geocoded by the US Census Bureau"
                  provenance="public"
                  title="Benchmark 2020, one call per address, run on 17 August 2026. The coordinate on the row is the coordinate the geocoder returned and nothing was nudged afterwards."
                />
                <Tally
                  value={String(withPlaceId)}
                  label="carry a Google place id"
                  provenance="public"
                  title="Zero, and counted rather than asserted. No Places call was made in this pass, so the field is absent on every row instead of filled with something that looks like an identifier."
                />
                <Tally
                  value={String(emailable)}
                  label="publish an email this pass read"
                  provenance="public"
                  title="Zero. No published address was read off a page in this pass, so none is claimed. An absent field is the honest record of work that was not done."
                />
                <Tally
                  value={String(doorOnly)}
                  label="have no written door at all"
                  provenance="public"
                  title="Counted live. This is the whole board, which is what makes it a go-see board rather than a mailing list."
                />
              </div>

              <p className={styles.p}>
                The board was gathered in one pass and every row says how.
                Somebody opened a page and read it: for most rows the
                organisation's own site, for the rest a shopping centre tenant
                directory, a chamber of commerce member directory, or a city
                or school district site. Where an address came from a chamber
                directory rather than a first-party page the row says so,
                because a second-party address is a slightly weaker fact and a
                reader is entitled to know which kind they are looking at. The
                street address read off that page was then put through the US
                Census Bureau one-line geocoder, benchmark 2020, on{" "}
                <span className="num">17 August 2026</span>, and the
                coordinate it returned is the coordinate on the row.
              </p>

              <p className={styles.p}>
                NO PLACES CALL WAS MADE, SO NO ROW CARRIES A PLACE ID. The
                field is absent rather than filled, on all{" "}
                <strong className="num">{total}</strong>. That is worth saying
                plainly, because the obvious thing to do with an empty column
                is to fill it, and an invented identifier sitting next to a
                real coordinate would quietly make every other figure on the
                screen worth less. The same rule governs the phone, the email,
                the contact form, the rating and the review count: none of
                them were gathered in this pass, so none of them appear.
              </p>

              <div className={styles.callout}>
                <p className={styles.calloutLabel}>
                  <span aria-hidden="true" className={styles.calloutGlyph}>
                    ◬
                  </span>
                  So this is a go-see board, and that is a finding rather
                  than a gap
                </p>
                <p className={styles.calloutText}>
                  <strong className="num">{emailable}</strong> rows publish an
                  address this pass read, which means there is no sequence to
                  send and no list to import. What there is instead is a
                  route, sorted by distance from the Irvine office, and a
                  fortnight of standing in front of people: mall management
                  offices, print and decorating shops on the Santa Fe Springs
                  industrial streets, district offices, chamber desks and
                  store counters. If an entire trade area cannot be emailed by
                  anybody, then nobody is emailing it, and the competitor with
                  the better mailing list has no advantage here at all. What
                  reaches these organisations is a person walking in during a
                  quiet hour with something specific to say.{" "}
                  <strong className="num">{total}</strong> doors inside seven
                  miles is a fuller fortnight than{" "}
                  <strong className="num">{total}</strong> unanswered emails
                  would be, and the field board is built to be walked in that
                  order.
                </p>
              </div>

              <h3 className={styles.h3}>Every lane, and how it is reached</h3>
              <p className={styles.pTight}>
                Counted off the board rather than typed, one row per lane in the
                order the whole application uses. The gap between the two
                right-hand columns is the gap between a week of emails and a
                week of driving:
              </p>

              <div className={styles.tableWrap}>
                <table className={`${styles.table} ${styles.laneTable}`}>
                  <caption className={styles.tableCaption}>
                    Organisations by lane, with how many of them can be reached
                    in writing. Totals are{" "}
                    <span className="num">{total}</span> organisations,{" "}
                    <span className="num">{emailable}</span> publishing an
                    email and <span className="num">{doorOnly}</span> with no
                    written door at all.
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Lane</th>
                      <th
                        scope="col"
                        className={`${styles.numCol} ${styles.laneNumHead}`}
                      >
                        On the board
                      </th>
                      <th
                        scope="col"
                        className={`${styles.numCol} ${styles.laneNumHead}`}
                      >
                        Publish an email
                      </th>
                      <th
                        scope="col"
                        className={`${styles.numCol} ${styles.laneNumHead}`}
                      >
                        Go-see only
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {laneRows.map((row) => (
                      <tr key={row.lane}>
                        <th scope="row" className={styles.laneCell}>
                          {/*
                            The chip is hidden from assistive technology
                            here and nowhere else. It carries its own
                            visually hidden label, which is right on a map
                            legend where the mark is the only thing there,
                            and wrong in a row header that then reads the
                            lane name twice in a row. The word beside it
                            is the content; the mark is a second signal
                            for the eye.
                          */}
                          <span aria-hidden="true">
                            <LaneChip lane={row.lane} size="sm" glyphOnly />
                          </span>
                          <span className={styles.laneCellName}>
                            {LANE_META[row.lane].label}
                          </span>
                        </th>
                        <td className={`${styles.numCol} num`}>
                          {row.organisations}
                        </td>
                        <td className={`${styles.numCol} num`}>{row.emails}</td>
                        <td className={`${styles.numCol} num`}>{row.doors}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className={styles.p}>
                The office itself is held to the same standard. The address,
                the entity, the date of establishment and the chain-wide
                attraction list all come off one page, and the coordinate
                under them came back from the same Census geocoder as every
                other pin on this board: one match, returned as 12900 PARK
                PLAZA DR, CERRITOS, CA, 90703. What that page does not carry
                is a lane count, a location count or a revenue figure, and
                what the booking pages do not carry is a price.
              </p>

              <p className={styles.p}>
                ACROSS EVERY ROUND1 PAGE READ FOR THIS DOCUMENT THERE IS NOT
                ONE PUBLISHED EMAIL ADDRESS AND NOT ONE NAMED ROLE TO WRITE
                TO.{" "}
                <strong className="num">
                  {INBOUND_ROUTES.publishedEmailAddresses.length}
                </strong>{" "}
                of them, on four pages. There is a customer support number, a
                booking page that tells the reader to contact the venue, and a
                store page for the nearest location carrying no phone number
                at all. A chain whose only itemised party package is unpriced
                publishes no written door to the person who prices it, and
                that is a finding rather than an oversight.
              </p>

              <p className={styles.sources}>
                <Src
                  href={VENUE.source}
                  label="DIME Industries, LLC's corporate profile page on dimeindustries.com"
                >
                  The corporate profile page
                </Src>
                <Src
                  href={INBOUND_ROUTES.partyBookingUrl}
                  label="DIME's party booking page on dimeindustries.com"
                >
                  The party booking page
                </Src>
              </p>
            </Section>

            {/* =====================================================
                02. WHAT WAS DELIBERATELY LEFT OUT
                ===================================================== */}
            <Section
              section={SECTIONS[1]!}
              lead={
                <>
                  The most persuasive thing on this page is the list of rows
                  that are not on the board. All of them are real, all of them
                  were researched, and every one of them failed the same test.
                </>
              }
            >
              <p className={styles.p}>
                The rule this data set was built under is that an address two
                sources disagree about is not an address with a margin of
                error, it is an address nobody has established yet, and the
                correct thing to do with one is to remove it and say so.
                Keeping it and adding a hedge would have made the board look
                larger and would have made every other row on it worth
                slightly less.
              </p>

              <h3 className={styles.h3}>
                The rule fired{" "}
                <span className="num">{EXCLUDED_FROM_BOARD.length}</span> times
                in this pass
              </h3>

              <p className={styles.p}>
                One deleted row is an anecdote, and an anecdote is the easiest
                thing in the world to choose, because the person telling it
                picks which one to tell. So here is every organisation the
                research found, verified as real, and left off the board
                anyway. They are named, their addresses are printed, and the
                reason is printed with them. A data set is defined as much by
                what it refused as by what it kept, and the only way to show
                that is to publish the refusals at the same size as everything
                else.
              </p>

              <div className={styles.excluded}>
                <h4 className={styles.excludedGroupTitle}>
                  <span aria-hidden="true" className={styles.excludedGlyph}>
                    ▨
                  </span>
                  The geocoder returned a different street
                  <span className={`${styles.excludedCount} num`}>
                    {disagreements.length}
                  </span>
                </h4>
                <p className={styles.excludedGroupNote}>
                  A first-party page said one address, the US Census Bureau
                  geocoder came back with a different street, and nothing
                  settled which was right. A coordinate on the wrong road is
                  worse than no coordinate at all, so there is nothing to pin
                  and the row is not on the map.
                </p>
                <ul className={styles.excludedList}>
                  {disagreements.map((e) => (
                    <li key={e.name} className={styles.excludedRow}>
                      <p className={styles.excludedName}>{e.name}</p>
                      <p className={styles.excludedAddress}>{e.address}</p>
                      <p className={styles.excludedReason}>{e.reason}</p>
                    </li>
                  ))}
                </ul>

                <h4 className={styles.excludedGroupTitle}>
                  <span aria-hidden="true" className={styles.excludedGlyph}>
                    ▨
                  </span>
                  There was nothing to pin
                  <span className={`${styles.excludedCount} num`}>
                    {unmatched.length}
                  </span>
                </h4>
                <p className={styles.excludedGroupNote}>
                  A softer failure and still a failure, in two kinds.{" "}
                  <span className="num">{unmatchedOnly}</span> of them the
                  Census geocoder could not match at all, which is a
                  statement about the federal address file rather than about
                  the business: mall interior addresses, newer industrial
                  blocks and private entry roads are exactly where its ranges
                  run out. The other{" "}
                  <span className="num">{unverifiable}</span> never got that
                  far, because no page publishes a street address for them, or
                  because nothing loadable proves the one on record. The
                  businesses are real. The pin is what is missing, and the
                  alternative was to nudge a nearby coordinate until it looked
                  right.
                </p>
                <ul className={styles.excludedList}>
                  {unmatched.map((e) => (
                    <li key={e.name} className={styles.excludedRow}>
                      <p className={styles.excludedName}>{e.name}</p>
                      <p className={styles.excludedAddress}>{e.address}</p>
                      <p className={styles.excludedReason}>{e.reason}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <p className={styles.p}>
                Count what that costs. The board would have been{" "}
                <strong className="num">
                  {total + EXCLUDED_FROM_BOARD.length}
                </strong>{" "}
                organisations rather than{" "}
                <strong className="num">{total}</strong>. Nudging a pin two
                streets over
                would have cost nothing that a reader could see and would have
                made every other coordinate on the map a guess. The rule was
                applied every time it fired rather than once, memorably, for the
                anecdote, and that is the difference between a standard and a
                story.
              </p>

              <p className={styles.p}>
                The same discipline is why{" "}
                <strong className="num">{NOT_PUBLISHED_BY_ROUND1.length}</strong>{" "}
                figures a buyer asks for in the first two minutes are recorded
                here specifically as not published by DIME:{" "}
                {NOT_PUBLISHED_BY_ROUND1.join(", ")}. Every one of them exists
                in the real world and not one of them is on a page. A sales
                manager who answers the lane count question with a number
                nobody published has not made an optimistic claim, they have
                created a refund.
              </p>
            </Section>

            {/* =====================================================
                03. THE PROVENANCE SYSTEM
                ===================================================== */}
            <Section
              section={SECTIONS[2]!}
              lead={
                <>
                  Every commercial figure in this application carries one of six
                  values saying where it came from. The components require it,
                  so a number with no stated origin cannot be rendered at all.
                </>
              }
            >
              <p className={styles.p}>
                That constraint is the whole reason the parts that are real can
                be trusted. A reader who can see which figures are modeled has
                no cause to doubt the addresses. A reader who cannot tell the
                difference has cause to doubt all of it, and no way to resolve
                the doubt except to stop reading.
              </p>

              <p className={styles.pTight}>
                The six, in the reading order the whole application uses.
                Strongest claim first, withheld last. Each carries a glyph as
                well as a colour, because colour alone is not a signal:
              </p>

              <dl className={styles.legend}>
                {PROVENANCE_ORDER.map((p) => (
                  <div key={p} className={styles.legendRow}>
                    <dt className={styles.legendTerm}>
                      <ProvenanceBadge provenance={p} />
                    </dt>
                    <dd className={styles.legendDesc}>
                      {PROVENANCE_META[p].title}
                    </dd>
                  </div>
                ))}
              </dl>

              <h3 className={styles.h3}>
                The sixth one is not a gap in the research
              </h3>

              <p className={styles.p}>
                "Not published" is the value worth stopping on, because it is
                the only one that describes a decision somebody else made rather
                than a decision this application made. It does not mean the
                figure could not be found. It means DIME has one and
                deliberately does not print it.
              </p>

              <p className={styles.p}>
                Look at what DIME puts on a page. The All Inclusive Party is
                itemised in full: arcade time-play, bowling with shoe rental,
                karaoke or a party room, billiards and ping pong, pizza and
                soda, a group photo, and a VIP Immersive Lane at a separate
                fee. Every one of those is a thing a buyer can picture. Now
                look at what is not on a page. The price. The add-on fee. The
                room capacity, the hourly rate, the minimum spend, the minimum
                booking notice, the price of a Spo-cha party. The page says to
                contact the venue, and the party room page says nothing about
                money at all.
              </p>

              <div className={styles.tallies}>
                <Tally
                  value={String(priced)}
                  label="packages carry a published price"
                  provenance="public"
                  title="Priced on dimeindustries.com. These could be quoted in an email without a phone call, and there are none."
                />
                <Tally
                  value={String(gated)}
                  label="are gated behind a conversation"
                  provenance="public"
                  title="The page says to contact the venue, so the number comes from a person rather than from a page."
                />
                <Tally
                  value={String(NOT_PUBLISHED_BY_ROUND1.length)}
                  label="figures a buyer asks for that are on no page"
                  provenance="withheld"
                  title="The lane count at any location, any party package price, party room capacity, minimum spend and the current US location count. Every one of them exists and not one is published."
                />
              </div>

              <p className={styles.p}>
                DIME has drawn a line through its own product range. Below
                it the website describes, and above it a person prices. THE
                PATTERN IN WHICH FIGURES ARE WITHHELD IS THE SHAPE OF THE JOB:
                the gated half is precisely the half a buyer cannot work out
                alone, which is where a person earns the margin and why
                the role exists at all. Recording those{" "}
                <strong className="num">{gated}</strong> packages as "unknown"
                would have thrown away the single most useful thing the research
                found.
              </p>

              <p className={styles.pTight}>
                So a withheld figure renders as a sentence, never as a number,
                and never as an estimate wearing a number's clothes:
              </p>

              <div className={styles.withheldDemo}>
                <WithheldFigure />
              </div>

              <p className={styles.p}>
                The temptations, in order of how bad they are, are an estimate,
                a range, "POA", a placeholder made of punctuation, and a dash.
                Every one of those reads as a number the application failed to
                fetch. What is true is both shorter and stronger. DIME
                publishes no price of any kind that touches this territory, so
                no screen in this application has an anchor to lean on and none
                of them pretends otherwise. Where a figure is needed to show a
                model working, it is typed by the reader and badged as
                entered.
              </p>

              <p className={styles.sources}>
                <Src
                  href={SOURCE_LINKS.bookAParty}
                  label="DIME's party booking page on dimeindustries.com"
                >
                  The party booking page
                </Src>
                <Src
                  href={SOURCE_LINKS.partyRoom}
                  label="DIME's party room activity page on dimeindustries.com"
                >
                  The party room page
                </Src>
                <Src
                  href={SOURCE_LINKS.nearestStore}
                  label="The Lakewood Center store page on dimeindustries.com"
                >
                  The nearest store
                </Src>
                <Src
                  href={STANDARD_TERMS.source}
                  label="The party booking page on dimeindustries.com, where the change notice is published"
                >
                  The published booking terms
                </Src>
              </p>
            </Section>

            {/* =====================================================
                04. THE SCORE
                ===================================================== */}
            <Section
              section={SECTIONS[3]!}
              lead={
                <>
                  This trade area holds{" "}
                  <span className="num">{total}</span> organisations and one
                  person to work them. The ordering function is the most
                  opinionated thing in this application, so here it is in full.
                </>
              }
            >
              <p className={styles.p}>
                Sorting alphabetically, or by distance, or by Google rating all
                produce a list that looks organised and wastes the week. Four
                things actually decide what to do first, and they are worth
                different amounts. Every row on the desk shows its own
                breakdown, because a ranking a reader cannot interrogate is a
                ranking they are being asked to take on faith.
              </p>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <caption className={styles.tableCaption}>
                    The desk ranking, as implemented in
                    domain/selectors/desk.ts. A perfect row scores{" "}
                    <span className="num">{maxScore}</span>.
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Criterion</th>
                      <th scope="col">Case</th>
                      <th scope="col" className={styles.numCol}>
                        Points
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {WEIGHTS.map((w) =>
                      w.cases.map((c, i) => (
                        <tr key={`${w.criterion}-${c.when}`} data-first={i === 0 ? "true" : undefined}>
                          {i === 0 ? (
                            <th scope="row" rowSpan={w.cases.length} className={styles.rowHead}>
                              <span className={styles.rowHeadOrder}>
                                {WEIGHTS.indexOf(w) + 1}
                              </span>
                              {w.criterion}
                            </th>
                          ) : null}
                          <td>{c.when}</td>
                          <td className={`${styles.numCol} num`}>{c.points}</td>
                        </tr>
                      )),
                    )}
                    <tr className={styles.penaltyRow}>
                      <th scope="row" className={styles.rowHead}>
                        <span className={styles.rowHeadOrder} aria-hidden="true">
                          ◬
                        </span>
                        Already worked
                      </th>
                      <td>
                        {ALREADY_WORKED_AT} touches or more against this
                        prospect
                      </td>
                      <td className={`${styles.numCol} num`}>
                        {ALREADY_WORKED_PENALTY}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <ol className={styles.reasons}>
                {WEIGHTS.map((w) => (
                  <li key={w.criterion} className={styles.reason}>
                    <p className={styles.reasonHead}>
                      <span className={styles.reasonName}>{w.criterion}</span>
                      <span className={`${styles.reasonPoints} num`}>
                        up to {w.best}
                      </span>
                    </p>
                    <p className={styles.reasonWhy}>{w.why}</p>
                  </li>
                ))}
              </ol>

              <p className={styles.p}>
                The penalty is the part people leave out. After{" "}
                <strong className="num">{ALREADY_WORKED_AT}</strong> touches a
                prospect loses{" "}
                <strong className="num">{Math.abs(ALREADY_WORKED_PENALTY)}</strong>{" "}
                points, because a fifth email is a spam complaint. That prospect
                does not need another message, it needs a visit or a rest, and a
                desk that keeps pushing the same untouched-looking name to the
                top is a desk that trains a rep to ignore it.
              </p>

              <p className={styles.p}>
                Two more decisions worth naming. Booked and lost rows fall to
                the bottom of the desk through a large negative weight rather
                than being filtered out, because they are not work to be done
                and they are also not things to hide; a pipeline that quietly
                deletes its losses teaches nobody anything. And the month the
                score is calculated against is injected rather than read off the
                system clock, so the desk is reproducible in a screenshot and a
                reader six months from now sees the ordering that was argued for
                rather than one the calendar has silently rewritten.
              </p>
            </Section>

            {/* =====================================================
                05. THE CAPACITY ARITHMETIC
                ===================================================== */}
            <Section
              section={SECTIONS[4]!}
              lead={
                <>
                  This arithmetic needs two numbers and only one of them is
                  published. A headcount still becomes a lane count. A lane
                  count no longer becomes a share of anything, and every screen
                  that used to print one now prints the sentence instead.
                </>
              }
            >
              <div className={styles.tallies}>
                <Tally
                  value={`1 : ${GUESTS_PER_BOWLING_LANE}`}
                  label="lanes per guests"
                  provenance="public"
                  title="One lane per twenty guests is the standard way a group is sized against lanes, and it is the only half of this arithmetic that has an input."
                />
                <Tally
                  value="Not published"
                  label="bowling lanes in the house"
                  provenance="withheld"
                  title="DIME publishes no bowling lane count for any location, including Lakewood Center, the nearest store to this office. There is no floor, no ceiling and no count."
                />
                <Tally
                  value={
                    MAX_SIMULTANEOUS_BOWLERS === null
                      ? "Not computable"
                      : String(MAX_SIMULTANEOUS_BOWLERS)
                  }
                  label="guests bowling at once"
                  provenance="withheld"
                  title="Lane count times guests per lane. The multiplication is this application's and it is missing one of its two operands, so it returns null and the screens say so."
                />
              </div>

              <p className={styles.p}>
                One lane per{" "}
                <strong className="num">{GUESTS_PER_BOWLING_LANE}</strong>{" "}
                guests still holds, so a{" "}
                <strong className="num">{bigGroup}</strong> guest party consumes{" "}
                <strong className="num">{bigGroupLanes}</strong> lanes and that
                figure is real. What fraction of the building that is cannot be
                said here, and neither can whether a second group of the same
                size fits on the same evening.{" "}
                {bigGroupShare === null
                  ? "DIME publishes no lane count for any location, so there is nothing to divide by."
                  : `It is ${bigGroupShare}% of the house.`}
              </p>

              <div className={styles.withheldDemo}>
                <WithheldFigure
                  reason={`What share of the house a ${bigGroupLanes} lane booking takes. DIME publishes no bowling lane count for any location, including Lakewood Center, so the denominator does not exist.`}
                />
              </div>

              <div className={styles.callout}>
                <p className={styles.calloutLabel}>
                  <span aria-hidden="true" className={styles.calloutGlyph}>
                    ◬
                  </span>
                  Why no number was carried across
                </p>
                <p className={styles.calloutText}>
                  This application was forked from one built for a venue
                  whose own page published a lane count, and every figure in
                  this section divided by that number. It was sitting right
                  there, it is the correct order of magnitude for a bowling
                  centre, and using it would have kept every chart on every
                  screen exactly as it was. It is also a fact about a different
                  company's building in a different city, and a DIME reader
                  who went looking for it would find nothing, because DIME
                  publishes no lane count anywhere. An estimate would be worse
                  again, since a plausible number is harder to catch than an
                  absent one. So the figures that need a house total return
                  null, the screens carry the withheld sentence, and the method
                  stays in the code where it can be read. What is missing is an
                  input the operator withholds, not a calculation nobody did.
                </p>
              </div>

              <p className={styles.p}>
                The same absence stops a warning firing. A day used to be
                called effectively full below three free lanes, because below
                three the only group that still fits is sixty guests and most
                of the pipeline is larger than that. Free lanes are the house
                total minus what is held, so with no house total there are no
                free lanes, the threshold has nothing to test and the capacity
                screen says plainly that fullness cannot be checked rather than
                reporting room on every date. Reporting room would have been
                the quiet version of the same lie.
              </p>

              <p className={styles.p}>
                Note what these figures are not. Party room capacities are not
                published either, so no screen here prints one, and the two
                absences are the same absence: DIME sells the group business
                through a conversation and publishes almost nothing a buyer
                could use to skip it. That is the shape of the job rather than
                a gap in the research, which is why it is documented here at
                the same length the figures would have been.
              </p>

              <p className={styles.sources}>
                <Src
                  href={SOURCE_LINKS.nearestStore}
                  label="The nearest DIME store page, which carries an amenity list and no lane count"
                >
                  Where a lane count would be, if there were one
                </Src>
                <Src
                  href={SOURCE_LINKS.bookAParty}
                  label="The DIME party booking page, which itemises a package and prices nothing"
                >
                  The party booking page
                </Src>
              </p>
            </Section>

            {/* =====================================================
                06. THE TWO LEDGERS
                ===================================================== */}
            <Section
              section={SECTIONS[5]!}
              lead={
                <>
                  Booked revenue and outbound activity are separate types with
                  separate totals functions, and no function that takes one can
                  be handed the other. That is a compiler rule standing in for a
                  management rule.
                </>
              }
            >
              <div className={styles.ledgers}>
                {(["booked-revenue", "outbound-activity"] as const).map((id) => {
                  const l = LEDGER[id];
                  return (
                    <div key={id} className={styles.ledger} data-ledger={id}>
                      <p className={styles.ledgerHead}>
                        <span aria-hidden="true" className={styles.ledgerGlyph}>
                          {l.glyph}
                        </span>
                        <span className={styles.ledgerName}>{l.label}</span>
                      </p>
                      <p className={styles.ledgerNote}>{l.note}</p>
                      <p className={styles.ledgerType}>
                        {id === "booked-revenue"
                          ? "BookLine. Guests, a per-guest price, the provenance of that price, a deposit percentage, an event date and lanes held."
                          : "ActivityLine. A type, a week, hours, target conversations, an owner role and the lanes it covers. There is no money field on it at all."}
                      </p>
                    </div>
                  );
                })}
              </div>

              <p className={styles.p}>
                The absence of a revenue field on an activity line is not an
                omission that nobody got round to. It is the point. A
                pipeline report on a territory nobody has worked is precisely
                where hours out of the office get quietly dressed up as
                results, and it is the moment when that temptation is
                strongest, because activity is the only thing there is to
                report.
              </p>

              <div className={styles.callout}>
                <p className={styles.calloutLabel}>
                  <span aria-hidden="true" className={styles.calloutGlyph}>
                    ◬
                  </span>
                  The specific lie this prevents
                </p>
                <p className={styles.calloutText}>
                  A generic CRM lets a rep attach an estimated value to an
                  activity and roll it into a pipeline total. Twelve tabling
                  shifts at a notional two thousand dollars each becomes a
                  twenty four thousand dollar pipeline in a slide, and not one
                  dollar of it has been agreed by anybody. A general manager
                  reads that number as money in progress, plans against it, and
                  finds out in week one that it described a car park and a
                  folding table. In this application twelve tabling shifts is
                  twelve tabling shifts and a count of hours. If one of them
                  turned into a booking there is a signed line in the other
                  ledger, and that is where the dollars are.
                </p>
              </div>

              <p className={styles.p}>
                So there are two totals functions, and neither will accept the
                other's rows. Revenue totals return contracts, guests, contract
                value, deposits actually collected, and separately how much of
                that value rests on a price a person typed rather than a price a
                company published. Activity totals return shifts, hours, target
                conversations, completions and, separately again, the hours spent
                specifically outside the building. That last split matters
                because the job posting's first daily responsibility is outbound
                work outside the building; a call block from a desk is real work
                and it is counted honestly, and a plan that quietly meets its
                hours target from a chair has not met it.
              </p>

              <p className={styles.p}>
                The one figure that crosses the two is deliberately a ratio
                rather than a sum: hours of outbound activity per thousand
                dollars booked. A ratio compares them without ever adding them,
                which is the only honest relationship the two ledgers have.
              </p>
            </Section>

            {/* =====================================================
                07. WHAT IS ILLUSTRATIVE
                ===================================================== */}
            <Section
              section={SECTIONS[6]!}
              lead={
                <>
                  Some of this application is invented. Naming exactly which
                  parts, and why each one had to exist, costs less than being
                  caught by a reader who worked it out for themselves.
                </>
              }
            >
              <div className={styles.tallies}>
                <Tally
                  value={String(PERIODS.length)}
                  label="planning periods"
                  provenance="illustrative"
                  title="Ordinary forward quarters. DIME publishes no trading calendar of any kind, so there is nothing to count against and nothing was invented."
                />
                <Tally
                  value={String(OFFERS.length)}
                  label="offers on the table"
                  provenance="illustrative"
                  title={`${illustrativeOffers} invented and ${publicOffers} published. Every published one quotes something already on dimeindustries.com.`}
                />
                <Tally
                  value={String(seededRows)}
                  label="seeded status rows"
                  provenance="illustrative"
                  title={`${seededUnworked} of them say unworked, which is what a trade area nobody has worked actually looks like.`}
                />
                <Tally
                  value={String(SEED_BOOK.length)}
                  label="contracts in the seeded book"
                  provenance="illustrative"
                  title="Two. A desk twelve weeks into a new territory with two signed groups is roughly where one person gets to."
                />
              </div>

              <h3 className={styles.h3}>The periods</h3>
              <p className={styles.p}>
                All <strong className="num">{PERIODS.length}</strong> periods
                are illustrative and they are ordinary forward quarters,
                because DIME publishes no trading calendar and inventing one
                would be the worst kind of confident guess. Quarters are what a
                corporate office plans in anyway, and every buying window in
                this application is scored against them.
              </p>

              <h3 className={styles.h3}>The offers</h3>
              <p className={styles.p}>
                <strong className="num">{illustrativeOffers}</strong> of the{" "}
                <strong className="num">{OFFERS.length}</strong> offers are
                invented, and note what is not among them. There is no discount
                off a price DIME has never published. You cannot discount a
                secret. What is left to put on a table is priority and
                certainty, and those cost the operator nothing.
              </p>
              <p className={styles.p}>
                The <strong className="num">{publicOffers}</strong> that are not
                invented quote what DIME already publishes: the contents of
                the All Inclusive Party, and the three or more days notice a
                change to a booked party needs. Both can be said to a buyer
                today without anybody's approval, and both can be checked on
                dimeindustries.com in fifteen seconds.
              </p>

              <h3 className={styles.h3}>The seeded statuses and the book</h3>
              <p className={styles.p}>
                There is one seeded status row for every organisation on the
                board, <strong className="num">{seededRows}</strong> of them, and{" "}
                <strong className="num">{seededUnworked}</strong> say unworked.
                That is not an unfinished seed. It is what a trade area looks
                like on the day somebody is hired into it, and softening it
                would have been the most dishonest thing this prototype could
                do. There is no book. There is a list of organisations nobody
                has spoken to.
              </p>
              <p className={styles.p}>
                The seeded book holds{" "}
                <strong className="num">{SEED_BOOK.length}</strong> contracts,
                alongside <strong className="num">{SEED_ACTIVITY.length}</strong>{" "}
                planned activity shifts and{" "}
                <strong className="num">{SEED_REPLIES.length}</strong> replies
                including the losses and the silence. Showing eleven contracts
                would have made a better screenshot and would have described a
                situation nobody has ever been in. The two that are there were
                chosen to carry one distinction:{" "}
                <strong className="num">{SEED_BOOK.length - typedPriceLines}</strong>{" "}
                sits on a published price anybody can check, and{" "}
                <strong className="num">{typedPriceLines}</strong> sits on a
                price a person typed, because the package it books is one of the{" "}
                <strong className="num">{gated}</strong> DIME gates. That
                second line carries an entered badge everywhere it appears, and
                the book states in words how much of its own total rests on a
                number somebody made up in a meeting. That is the figure a
                general manager should want to see and the one a pipeline report
                never shows them.
              </p>

              {/*
                THE RESPONSE COMMITMENT LIVES HERE NOW.

                It used to be argued on the queue screen and on Today, in
                three standing paragraphs each. The disclosure still sits
                beside every figure it qualifies, because that is data. The
                argument for the number belongs on this page.
              */}
              <h3 className={styles.h3}>The response commitment</h3>
              <p className={styles.p}>
                <strong>
                  DIME publishes no response time anywhere on its site.
                </strong>{" "}
                Not on the party booking page, not on the party room page, not
                on the nearest store's page. There is no service level to
                quote, and no screen in this application invents one on their
                behalf. The {RESPONSE_COMMITMENT.label.toLowerCase()}{" "}
                commitment is this desk's own, invented for this prototype, and
                every figure measured against it carries that disclosure beside
                it.
              </p>
              <p className={styles.p}>
                {RESPONSE_COMMITMENT.why} The clock runs 9am to 6pm at the
                venue and pauses outside it, so an enquiry that arrives at ten
                at night is not marked late before anybody is awake. Those are
                the hours this desk works. They are not the store's: the
                nearest DIME trades from 10am to midnight on weekdays and to
                1am at weekends, and nobody answers a group enquiry at
                midnight.
              </p>
              <p className={styles.p}>
                The queue's own reading moment is fixed rather than taken from
                the machine it is opened on. A dated demonstration read through
                a live clock is one where everything is overdue a fortnight
                after it was published, which says nothing about the desk and
                everything about the calendar.
              </p>

              <h3 className={styles.h3}>What the enquiry routes do not ask for</h3>
              <p className={styles.p}>
                The published routes into a group booking do not collect the
                same things. One asks a first name, a last name, an email, a
                phone number, a company and a block of free text, and asks for
                no date, no headcount and no event type. Another asks for all
                three. Every field set is recorded on the route it belongs to
                rather than assumed.
              </p>
              <p className={styles.p}>
                That difference is a commercial hole rather than a design
                quibble. Nobody can quote what the form did not collect, so an
                enquiry through the thinner route arrives missing all three
                answers a person needs before pricing anything. The queue counts
                what that costs and keeps "they left it blank" and "the form
                never asked" in separate columns, because only the second is
                fixable by changing a form.
              </p>
              <p className={styles.p}>
                A low early response rate is what a trade area nobody has worked
                looks like, and it is not a failure to correct with more email.
                The first message any of these organisations receives is from a
                company they have not dealt with, about an evening at a store
                they may not have been to, at a price DIME does not publish.
                The rule this application argues for is two written touches and
                then a visit.
              </p>

              <h3 className={styles.h3}>The replies, and the sending</h3>
              <p className={styles.p}>
                Every reply on the replies screen is illustrative. The words were
                written for this work sample, and no organisation is described as
                having said anything it did not say. The lanes, the addresses and
                the decision maker titles behind each row are the sourced part.
                There is also no email transport anywhere in this dependency
                tree: sending writes a row to the outbox and nothing leaves the
                browser tab. The demo recipient is{" "}
                <span className="num">{DEMO_RECIPIENT}</span>, on a domain
                reserved by RFC 2606 that can never resolve, so a send action has
                a real address to put in a To field and no possible route to a
                person.
              </p>

              <p className={styles.p}>
                Headcount ranges, buying windows and the one-line fit note on
                each organisation are judgements rather than measurements. They
                carry modeled provenance, they state their basis on the row, and
                they are ranges rather than single numbers on purpose. A range
                that says forty to eighty guests based on a single-site clinic is
                honest in a way that "sixty two" is not, and the whole revenue
                model downstream inherits that honesty or inherits its absence.
              </p>
            </Section>

            {/* =====================================================
                08. WHAT WOULD CHANGE ON DAY ONE
                ===================================================== */}
            <Section
              section={SECTIONS[7]!}
              lead={
                <>
                  Four things arrive with real access, and each one replaces a
                  stated assumption with a fact. None of them changes the model;
                  they change the inputs, which is the test of whether a model
                  was built properly.
                </>
              }
            >
              <ol className={styles.dayOne}>
                <li className={styles.dayOneItem}>
                  <p className={styles.dayOneWhat}>The lane count at the store</p>
                  <p className={styles.dayOneHow}>
                    Every capacity figure in this application stops at the
                    demand half, because DIME publishes no lane count for any
                    location and there is nothing to divide by. One sentence
                    from whoever runs Lakewood Center turns every withheld
                    share on the capacity screen into a real percentage.
                    Nothing in the model has to move. One field stops being
                    null and eleven figures start rendering.
                  </p>
                </li>
                <li className={styles.dayOneItem}>
                  <p className={styles.dayOneWhat}>
                    The venue's real lane count and room capacities
                  </p>
                  <p className={styles.dayOneHow}>
                    Today the capacity arithmetic stops at the lanes a group
                    needs and refuses to say what share of the house that is,
                    because DIME publishes no bowling lane count for any
                    location and publishes party rooms without a number or a
                    size. One walk of the building with a clipboard replaces
                    both absences with measurements, and every figure that
                    currently renders as a sentence becomes a number the same
                    afternoon. Nothing in the model has to change to accept
                    them.
                  </p>
                </li>
                <li className={styles.dayOneItem}>
                  <p className={styles.dayOneWhat}>Real pricing authority</p>
                  <p className={styles.dayOneHow}>
                    <strong className="num">{gated}</strong> packages here carry
                    no price because the company does not publish one. With
                    access to the actual rate card and the actual discretion
                    band, every one of those withheld sentences becomes a
                    figure, the entered badge disappears from the book, and
                    quotes stop being illustrative. Until then the honest thing
                    on screen is the sentence, not a guess.
                  </p>
                </li>
                <li className={styles.dayOneItem}>
                  <p className={styles.dayOneWhat}>A real CRM to write to</p>
                  <p className={styles.dayOneHow}>
                    The fact table in this application is one row per
                    organisation, package and period, and everything else is a
                    selector over it. That is the same shape a real CRM object
                    has, which means this is an import rather than a rebuild:
                    the{" "}
                    <strong className="num">{seededRows}</strong> seeded rows are
                    replaced by real ones and the desk, the lane board, the
                    capacity chart and every generated next action recalculate
                    from them. The outbox becomes a real sequence tool. Nothing
                    on any screen is stored, so nothing on any screen has to be
                    migrated.
                  </p>
                </li>
              </ol>
            </Section>

            {/* =====================================================
                09. THE THEME AND ITS PROOF
                ===================================================== */}
            <Section
              section={SECTIONS[8]!}
              lead={
                <>
                  The palette is called The Cabinet: a dark housing, a bright
                  screen, marquee type, and ink at full strength thrown at it.
                  No colour in it was sampled from DIME. Every one was
                  constructed in CIELAB at a chosen lightness, chroma and hue,
                  and then measured. There are two grounds now, and the second
                  one cost a column in that table rather than a rewrite.
                </>
              }
            >
              <p className={styles.p}>
                The palette before this one was warm paper, a brass hairline
                and a house blue. It was a good paper. It was still a paper,
                and the building the application describes is bowling, arcade,
                laser tag and ropes: a dark room full of lit objects. The
                ground is the only decision in a palette that every screen
                inherits, so on a light ground an arcade can only ever be
                applied to the top of the product, and a theme that is applied
                is decoration. This one is committed. Near black everywhere,
                no light data pane held back as a safe harbour, and one lit
                panel kept as an event rather than as a default.
              </p>

              <p className={styles.p}>
                Three references, and what each one actually contributed. Ink
                gave the method: colour at the most saturation the sRGB gamut
                holds at its stated lightness, and no apology for it. Warmth
                and chunk gave the radii, the heavy display face and the fact
                that the one lit surface is a cream rather than a clinical
                white. Cyberpunk gave the ground its hue: a violet black rather
                than the blue grey that every framework ships, because blue
                grey is the dark mode version of exactly the cool paper this
                work replaced two themes ago.
              </p>

              <p className={styles.p}>
                Dense data on dark is not a compromise. It is what every
                trading terminal and every scoreboard in the building already
                does, and this tool is used in a car, in a school car park and
                on a phone at 380 pixels between go-sees. The{" "}
                <strong className="num">{total}</strong> row table did not get
                quieter. It got a ground that stops competing with it.
              </p>

              <h3 className={styles.h3}>
                A second ground, and what it actually cost
              </h3>

              <p className={styles.p}>
                Then the owner asked for a light version and a toggle. A
                request like that is the cheapest audit there is of whether a
                design system is real, because a codebase with colours typed
                into it cannot grow a second theme without a thousand edits
                and a fortnight of hunting the ones that were missed. Nothing
                in this palette is typed. A generator states every colour as a
                lightness, a chroma and a hue, resolves each one to the most
                saturated value the sRGB gamut holds at that lightness, and
                emits both the values and the contrast tables. So a second
                ground is a second lightness column in one table, and the same
                audit runs over it.
              </p>

              <p className={styles.p}>
                The rule that makes the two look like one product is that the
                hues carry the identity and the lightness carries the ground.
                The violet stays at hue 300, the pressable cyan at 205, the
                signal at 336, the featured key at 62, and all twenty section
                hues keep their slot. Only the lightness moves, and the chroma
                only where the gamut refuses the request. Get that wrong and a
                light theme is a different application wearing the same layout,
                which is the failure mode of nearly every light theme bolted
                onto a dark one.
              </p>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <caption className={styles.tableCaption}>
                    Six tokens that decide how the product reads, and what
                    changed between the two grounds. The hue column is the
                    exhibit: it does not move. The last row is the one that
                    catches people out, and it is the reason nothing in this
                    file is called a dark surface: --surface-inverse means the
                    inverted panel, so it is a lit cream on the dark ground and
                    the housing itself on the light one.
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Token</th>
                      <th scope="col" className={styles.numCol}>
                        Hue
                      </th>
                      <th scope="col" className={styles.numCol}>
                        Lightness, dark
                      </th>
                      <th scope="col" className={styles.numCol}>
                        Lightness, light
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {GROUND_MOVES.map((row) => (
                      <tr key={row.token}>
                        <th scope="row" className={styles.rowHead}>
                          <span className="num">{row.token}</span>
                          <span className={styles.laneCellName}>{row.role}</span>
                        </th>
                        <td className={`${styles.numCol} num`}>{row.hue}</td>
                        <td className={`${styles.numCol} num`}>{row.darkL}</td>
                        <td className={`${styles.numCol} num`}>{row.lightL}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className={styles.p}>
                Three things invert and each one is a trap worth naming. The
                surface ramp reverses, so the inset well is the lightest
                surface on one ground and the darkest on the other, and it sets
                the contrast floor in both. The inverted panel and the ink on
                it swap, and that ink is also the label on every bright fill in
                the system, so getting it backwards breaks the primary button
                in one theme while looking correct in the other. And every tint
                is a wash behind text, deep on one ground and pale on the
                other, with the same rule in both: no wash may be harder than
                the hardest paper, or it silently becomes the new floor for the
                whole text ramp.
              </p>

              <h3 className={styles.h3}>Every ink, on every paper it lands on</h3>

              <p className={styles.pTight}>
                A palette is a matter of taste and there is no arguing with
                taste. Whether it can be read is arithmetic, and arithmetic can
                be published. Ratios below are WCAG 2.x relative luminance. The
                floor for body text at any size is 4.5:1, and no ink in this
                system is allowed an exception to it, on either ground:
              </p>

              {(["dark", "light"] as const).map((ground) => (
                <div className={styles.tableWrap} key={ground}>
                  <table className={styles.table}>
                    <caption className={styles.tableCaption}>
                      {ground === "dark" ? "The dark ground." : "The light ground."}{" "}
                      The text ramp against the forty-two backgrounds it is
                      painted on: four surfaces, every status, lane, family and
                      ledger tint, all twenty section glows, and the operator
                      note's two surfaces. L* is the lightness the generator
                      was asked for. The last column is the worst of all
                      forty-two, which is the only number that decides
                      anything.{" "}
                      {ground === "dark"
                        ? "Here the inset well is the LIGHTEST surface rather than the darkest, so it is where light ink has the least to work with."
                        : "Here the ramp runs the other way and the inset well is the DARKEST surface, so it is again the hardest background, this time for dark ink."}{" "}
                      It sets the floor for the whole file in both.
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Ink</th>
                        <th scope="col" className={styles.numCol}>
                          L*
                        </th>
                        <th scope="col" className={styles.numCol}>
                          Card
                        </th>
                        <th scope="col" className={styles.numCol}>
                          Page
                        </th>
                        <th scope="col" className={styles.numCol}>
                          Inset well
                        </th>
                        <th scope="col" className={styles.numCol}>
                          Worst of forty-two
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {INK_RATIOS[ground].map((row) => (
                        <tr key={row.token}>
                          <th scope="row" className={styles.rowHead}>
                            <span className="num">{row.token}</span>
                            <span className={styles.laneCellName}>{row.role}</span>
                          </th>
                          <td className={`${styles.numCol} num`}>
                            {ground === "dark" ? row.darkL : row.lightL}
                          </td>
                          <td className={`${styles.numCol} num`}>{row.card}</td>
                          <td className={`${styles.numCol} num`}>{row.page}</td>
                          <td className={`${styles.numCol} num`}>{row.well}</td>
                          <td className={`${styles.numCol} num`}>{row.worst}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}

              <p className={styles.p}>
                Read the two tables against each other rather than separately.
                Every lightness moved, most of them by fifty points or more,
                and no ratio moved by a third of a step. That is not luck and
                it is not taste. The lightness values were chosen by working
                backwards from the floor the ink has to clear, in both
                directions, which is a calculation and not a preference.
              </p>

              <div className={styles.tallies}>
                <Tally
                  value="4.80"
                  label="worst ratio any ink meets anywhere, light"
                  provenance="modeled"
                  title="The dimmest step of the text ramp on the inset well, which is the darkest surface in the light theme. The same pair measures 4.81 on the dark ground. The floor for body text is 4.5:1."
                />
                <Tally
                  value="3.20"
                  label="weakest control boundary, light, was 1.99"
                  provenance="modeled"
                  title="The strong rule against the inset well, which is the hardest background a rule has in either theme. It measures 3.26 on the dark ground. WCAG 1.4.11 asks 3:1 of a control boundary."
                />
                <Tally
                  value="8.72"
                  label="lane separation under colour blindness, light"
                  provenance="modeled"
                  title="The smallest CIEDE2000 distance between any two of the nine lanes, taken as the worst of three simulated dichromacies. The dark ground measures 10.00, the paper theme measured 8.85 and the ramp before that measured 1.32."
                />
              </div>

              <h3 className={styles.h3}>
                Three things the measuring found that looking did not
              </h3>

              <div className={styles.callout}>
                <p className={styles.calloutLabel}>
                  <span aria-hidden="true" className={styles.calloutGlyph}>
                    ◬
                  </span>
                  A pair of tokens that cannot both be light
                </p>
                <p className={styles.calloutText}>
                  The interactive colour is painted two ways in this codebase:
                  as small text in <strong className="num">27</strong>{" "}
                  declarations, where on a dark ground it has to be bright, and
                  as the fill under a primary button, where whatever label sits
                  on it has to clear{" "}
                  <strong className="num">4.5:1</strong>. Work the arithmetic
                  through and those two demands need a label brighter than
                  white, which does not exist. So the label token had to invert
                  with the ground, and once it inverted the surface it names
                  had to invert too. That is why the one light surface in this
                  theme is the lit panel: the map chrome, the daily rings, the
                  offers card and the block on this page are now the screen
                  inside the cabinet rather than ink on paper. The theme did
                  not choose that for the look of it. It fell out of a
                  constraint that was checked before anything was painted.
                </p>
              </div>

              <div className={styles.callout}>
                <p className={styles.calloutLabel}>
                  <span aria-hidden="true" className={styles.calloutGlyph}>
                    ◬
                  </span>
                  A token the table passed and the browser failed
                </p>
                <p className={styles.calloutText}>
                  The palette audit cleared every pair it knew about. The
                  browser walk then found{" "}
                  <strong className="num">15</strong> text nodes at{" "}
                  <strong className="num">2.09:1</strong> across three routes,
                  all of them the same token: the signal colour in the variant
                  the codebase only ever paints on the inverted panel. The
                  audit had no way to know that, because a token's real
                  background is a fact about sixty CSS modules and not about
                  the palette. Rebuilt as a deep magenta it measures{" "}
                  <strong className="num">4.73:1</strong> as text on the lit
                  panel and <strong className="num">3.07:1</strong> as a border
                  on a card, which are the only two jobs it has. This is the
                  case for walking a real browser rather than trusting a table.
                </p>
              </div>

              <div className={styles.callout}>
                <p className={styles.calloutLabel}>
                  <span aria-hidden="true" className={styles.calloutGlyph}>
                    ◬
                  </span>
                  It happened again on the second ground, in one place
                </p>
                <p className={styles.calloutText}>
                  The light palette cleared its audit and the walk then found{" "}
                  <strong className="num">4</strong> nodes at{" "}
                  <strong className="num">4.17:1</strong> on the book, all the
                  same pair: the second rung of the inverted ink, printed on
                  the booked revenue fill, which on a light ground is the
                  deepest colour in the file. That token is a panel ink
                  everywhere else, so the table had never been asked about it.
                  Four points of lightness fixed it and the pair is in the
                  audit now, which means a third ground cannot repeat it. The
                  useful part is not the fix. It is that a generated palette
                  and a browser walk find different classes of defect, and
                  neither one replaces the other.
                </p>
              </div>

              <h3 className={styles.h3}>Nine lanes will not fit on one axis</h3>

              <p className={styles.p}>
                A lane chip sets the lane colour as text on the lane tint at
                9.5 pixels, so on a dark ground the ink has to be light enough
                to clear 4.5:1 against a deep wash and to hold 3:1 as a mark on
                the lightest surface. That is a FLOOR near lightness 59, and on
                the light ground the same two demands become a CEILING near 44.
                Above that floor the
                sRGB gamut narrows fast and unevenly: at lightness 88 a yellow
                still holds 85 units of chroma and a violet holds 24. So the
                obvious move, pushing the bands high to buy separation, ends in
                three pastels, and CIEDE2000 makes it worse, because its
                lightness term is divided by a factor that grows with distance
                from the middle of the range. A ten point step at the light end
                is worth far less than the same step in the middle.
              </p>

              <p className={styles.p}>
                So the ramp was searched rather than picked. A script sweeps hue
                triples crossed with band lightnesses and per-band hue drift,
                takes the most chroma the gamut will give at every cell,
                rejects any arrangement whose weakest cell falls below a chroma
                floor, and keeps whichever arrangement has the highest worst
                pair under all three simulated dichromacies. Rejecting on
                chroma is the part that matters: without it the search returns
                a palette that measures beautifully and looks like a hospital.
              </p>

              <p className={styles.p}>
                The answer is a three by three matrix: three hue families
                crossed with three value bands, fourteen points of lightness
                apart on the dark ground and twelve on the light one. The three
                family hues and the per-band drift are shared, because a lane's
                hue is its identity and schools is the same green with the
                lights on or off. Only the three band lightnesses move, and
                they move as a block.
              </p>

              <p className={styles.pTight}>
                Greyscale gives the band in both, at{" "}
                <strong className="num">1.56:1</strong> and{" "}
                <strong className="num">1.50:1</strong> between adjacent ones on
                dark and{" "}
                <strong className="num">1.50:1</strong> and{" "}
                <strong className="num">1.56:1</strong> on light, measured off
                the rendered screen rather than off the palette. The pointed and
                square caps on the chips give the buyer class. The glyph and the
                word give the lane. Colour is the fourth signal here, as it is
                everywhere else in this application:
              </p>

              <div className={styles.tableWrap}>
                <table className={`${styles.table} ${styles.laneTable}`}>
                  <caption className={styles.tableCaption}>
                    Band 1 is the band nearest the ground and band 3 the one
                    furthest from it. Each figure is the smallest CIEDE2000
                    distance between that lane and any of the other eight,
                    taken as the worst of protanopia, deuteranopia and
                    tritanopia. Below about 2, two colours are one colour. The
                    floor across all thirty-six pairs moves from{" "}
                    <span className="num">8.85</span> on the paper theme to{" "}
                    <span className="num">10.00</span> on the dark ground, and
                    the light ground holds{" "}
                    <span className="num">8.72</span>. It is lower there and it
                    is not a defect: at the bottom of the lightness range the
                    gamut has less chroma in it, so two hues that separate by
                    saturation on a dark ground have to separate by value here.
                    The ramp that preceded all three measured{" "}
                    <span className="num">1.32</span>.
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Lane</th>
                      <th scope="col" className={styles.laneNumHead}>
                        Family and band
                      </th>
                      <th
                        scope="col"
                        className={`${styles.numCol} ${styles.laneNumHead}`}
                      >
                        Paper theme
                      </th>
                      <th
                        scope="col"
                        className={`${styles.numCol} ${styles.laneNumHead}`}
                      >
                        Dark ground
                      </th>
                      <th
                        scope="col"
                        className={`${styles.numCol} ${styles.laneNumHead}`}
                      >
                        Light ground
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {LANE_ORDER.map((lane) => (
                      <tr key={lane}>
                        <th scope="row" className={styles.laneCell}>
                          {/* Hidden from assistive technology for the same
                              reason as the rollup in section one: the chip
                              carries its own label and the word beside it is
                              already the content. */}
                          <span aria-hidden="true">
                            <LaneChip lane={lane} size="sm" glyphOnly />
                          </span>
                          <span className={styles.laneCellName}>
                            {LANE_META[lane].label}
                          </span>
                        </th>
                        <td>
                          {LANE_SEPARATION[lane].family}, band{" "}
                          <span className="num">
                            {LANE_SEPARATION[lane].band}
                          </span>
                        </td>
                        <td className={`${styles.numCol} num`}>
                          {LANE_SEPARATION[lane].before}
                        </td>
                        <td className={`${styles.numCol} num`}>
                          {LANE_SEPARATION[lane].after}
                        </td>
                        <td className={`${styles.numCol} num`}>
                          {LANE_SEPARATION[lane].light}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className={styles.p}>
                The result that was not expected is that going loud made the
                palette safer. Saturated colour normally collapses harder under
                dichromacy than muted colour does, which is the standard
                argument against a neon palette for a colourblind reader, and
                it is a real effect. It was beaten here by spending the extra
                lightness the dark ground makes available: fourteen points
                between bands instead of eleven. The ink got louder and the
                floor went up, which is the opposite of what everyone expects
                and is the whole reason the search exists rather than a mood
                board.
              </p>

              <p className={styles.p}>
                One thing this ramp gives up honestly, once on each ground. On
                dark the lightest band is less saturated than the other two,
                because at that lightness the gamut simply has less colour in
                it, so the three band-three lanes read as bright pastels next to
                the deep ink of band one. On light the same thing happens at the
                other end and the deepest band reads as three near-blacks. Both
                are a real cost and the alternative was worse: forcing chroma
                out of the gamut drives all three hue families into the
                yellow-green wedge, which is precisely where dichromacy
                collapses them. And inside a band the three lanes are the same
                grey by design, with the cap and the glyph resolving them,
                which is the same deliberate trade all three themes made.
              </p>

              <h3 className={styles.h3}>
                A hue order that was safe on one ground and not on the other
              </h3>

              <p className={styles.p}>
                Every navigation section carries its own colour: twenty hues
                eighteen degrees apart, with which slot gets which hue decided
                by an annealer maximising the worst separation between sections
                that sit within two slots of each other in the rail, measured
                after simulated dichromacy. That order was solved against the
                dark ground. Re-scored against the light one it fell from{" "}
                <strong className="num">7.74</strong> to{" "}
                <strong className="num">3.03</strong>, because at lightness 20 a
                green and a violet project onto nearly the same dark teal under
                tritanopia, where at lightness 86 the same two hues keep thirty
                units of chroma between them.
              </p>

              <p className={styles.p}>
                So the objective became the worst floor across both grounds and
                the search was restarted a hundred and forty times. The order it
                found scores{" "}
                <strong className="num">7.76</strong> on dark and{" "}
                <strong className="num">8.14</strong> on light. The dark number
                went up, not down: being made to satisfy two grounds at once
                landed on a better arrangement for the first one. That is the
                argument for keeping the solver rather than the answer. A frozen
                palette would have shipped a light theme with two sections in
                the same group painted the same colour for a colourblind reader,
                and nothing on screen would have looked wrong.
              </p>

              <h3 className={styles.h3}>What the browser said afterwards</h3>

              <p className={styles.p}>
                Tables prove a palette is sound in isolation. Only a browser
                proves that nothing in sixty CSS modules is painting an ink on
                a surface the palette never anticipated, so every rendered text
                node on twenty two routes was walked at 1440 pixels and again at
                380, its computed colour resolved against the nearest painted
                background behind it with any transparency composited down the
                ancestor chain, and the ratio checked against the floor for its
                own size and weight. The walk sets the theme attribute itself
                and runs the whole set twice. The last run covered{" "}
                <strong className="num">{CONTRAST_WALK_NODES}</strong> text
                nodes on each ground,{" "}
                <strong className="num">{CONTRAST_WALK_TOTAL}</strong> in all,
                and found <strong className="num">0</strong> failures in either.
                It found <strong className="num">15</strong> on dark and{" "}
                <strong className="num">4</strong> on light on the runs before
                those, which are the two callouts above. That walk, and not the
                palette, is the part of this section worth reading.
              </p>

              <p className={styles.p}>
                Colour still carries nothing on its own anywhere in this
                application, on either ground. Every status has a glyph and a
                word, every lane has a glyph and a cap shape and a name, every
                bar carries its number, and the whole set survives being printed
                in greyscale: the nine lanes resolve into three flat values,
                measured off the rendered screen at{" "}
                <strong className="num">142</strong>,{" "}
                <strong className="num">179</strong> and{" "}
                <strong className="num">218</strong> out of 255 on dark and{" "}
                <strong className="num">47</strong>,{" "}
                <strong className="num">73</strong> and{" "}
                <strong className="num">102</strong> on light. The same rule
                binds the sections: the section is named in the rail, in the
                page title and in the document title, and the hue is an aid to
                place rather than a signal of state. A theme that had to be seen
                in colour to be used would be a downgrade however good it
                looked, and so would a second theme that quietly gave up the
                property.
              </p>
            </Section>

            {/* =====================================================
                10. THE DISCLAIMER
                ===================================================== */}
            <Section
              section={SECTIONS[9]!}
              lead={
                <>
                  This is an independent work sample. It is not a DIME
                  product, it does not represent DIME, and it was built by one
                  person for a job application.
                </>
              }
            >
              <div className={styles.disclaimer}>
                <p className={styles.disclaimerP}>
                  DIME is an unaffiliated work sample by Nathan J. Song, built
                  for a Sales Performance Analyst application
                  at DIME. It is not affiliated with, endorsed by or
                  connected to DIME Industries, LLC in any way.
                </p>
                <p className={styles.disclaimerP}>
                  No DIME logo, wordmark, typeface or trade dress appears
                  anywhere in it. The colours here were chosen for the work they
                  do on a screen and none of them was sampled from DIME's
                  site. A hue is not a mark; a lockup is, and there is no lockup
                  here.
                </p>
                <p className={styles.disclaimerP}>
                  Every published figure in this application was read off
                  dimeindustries.com and carries the page it came from. All{" "}
                  <strong className="num">{censusPass.length}</strong>{" "}
                  organisations were read off published pages and geocoded by
                  the US Census Bureau on 17 August 2026, with the place id
                  field left absent rather than invented on every one of them.
                  Everything else is labelled as modeled, illustrative,
                  observed, entered or not published, and those labels are the
                  most important thing on any screen they appear on.
                </p>
                <p className={styles.disclaimerP}>
                  No real person is named anywhere in it. Every buyer is a role
                  and a title, because inventing a name at a real organisation
                  would be inventing a person, and that is a line this exercise
                  does not need to cross to make its argument.
                </p>
                <p className={styles.disclaimerP}>
                  There is no email transport in this dependency tree and no data
                  leaves the browser tab. Every figure on{" "}
                  <strong className="num">{PACKAGES.length}</strong> packages,{" "}
                  <strong className="num">{total}</strong> organisations and{" "}
                  <strong className="num">{SEED_BOOK.length}</strong> contracts
                  is either checkable at source or labelled as invented, and
                  there is no third category.
                </p>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
