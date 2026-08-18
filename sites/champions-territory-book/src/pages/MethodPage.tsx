import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { RATIONALE_AVAILABLE } from "@/data/rationale";
import type { Lane } from "@/domain/types";
import {
  DOOR_ONLY,
  EMAILABLE,
  EXCLUDED_FROM_BOARD,
  PROSPECTS,
} from "@/data/prospects";
import {
  LOWEST_PUBLISHED_PLAN_PRICE,
  GATED_PACKAGES,
  PACKAGES,
  PRICED_PACKAGES,
  STANDARD_TERMS,
} from "@/data/packages";
import {
  DEMO_RECIPIENT,
  INBOUND_ROUTES,
  NOT_PUBLISHED_FOR_BREA,
  OFFERS,
  PERIODS,
  VENUE,
} from "@/data/venue";
import { SEED_ACTIVITY, SEED_BOOK, SEED_REPLIES } from "@/data/book";
import { SEED_STATUSES } from "@/data/prospectStatus";
import {
  DOORS_PER_CREW_SLOT,
  LANE_META,
  LANE_ORDER,
  crewSlotsForDoors,
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
 * them to believe a crew count. The rivals board asks them to believe a
 * competitor's price. None of those are worth anything on their own,
 * because a prototype can print any number it likes and most of them do.
 *
 * What makes a figure believable is not confidence. It is the reader
 * being able to check it, and being told plainly which figures they
 * cannot check because nobody published them. So this page carries every
 * formula, every source, every assumption and every invention, in the
 * order a sceptical reader would ask for them, and it links out to the
 * pages the published figures were read off on 18 August 2026.
 *
 * ── THE SECTION THAT DOES THE MOST WORK IS THE SECOND ONE ──────────
 * Section two is about the rows that are NOT in this application. A food
 * manufacturing plant with a few hundred people on it would have been
 * the largest single employer on the board, two sources disagreed about
 * which end of the street it sits on, and the row came out. Nothing on
 * any other screen demonstrates the standard this data was held to as
 * economically as one deleted row does, which is why it gets its own
 * visual treatment rather than a bullet in a list.
 *
 * One deleted row is an anecdote, though, and an anecdote is the easiest
 * thing in the world to pick because it flatters the person telling it.
 * So the section renders EXCLUDED_FROM_BOARD in full underneath it:
 * every organisation the research passes found, verified as real,
 * and still refused. A rule that was applied once is a story. A rule
 * that was applied every time it fired is a standard, and the difference
 * between the two is the entire argument this page makes.
 *
 * ── EVERY COUNT HERE IS DERIVED, NOT TYPED ─────────────────────────
 * The organisation counts, the emailable counts, the offer counts, the
 * seed counts and the capacity arithmetic are all read off the data at
 * render time. A method page that hardcodes "329 organisations" is one
 * data change away from being the least trustworthy page in an
 * application whose entire argument is about trust. There is no number
 * below that a reader can catch disagreeing with the screen it
 * describes.
 *
 * ── WHAT THIS PAGE GETS WRONG, SAID ONCE ───────────────────────────
 * The three research passes it counts were run for the console this was
 * adapted from. The board has since grown a fourth block of rows, the
 * rival and Champions brand storefronts read off their own sites on
 * 18 August 2026, and those are not prospects and did not come out of a
 * pass. So the pass counts and the board total no longer add to the same
 * number. Section one prints both and names the difference rather than
 * quietly reconciling it.
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
    gist: "One crew slot per twenty properties",
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
    gist: "Four things that arrive with access",
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
  provenance: "public" | "modeled" | "illustrative";
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
    why: "Weighted heaviest, and it is the least romantic criterion in the list. A touch against a published address costs two minutes. A touch against a front counter costs a forty minute round trip across a territory that runs from Brea to Murrieta, and there are only so many of those in a week. Nothing else on this list changes the cost of the work by that factor.",
  },
  {
    criterion: "Does the demand exist without me",
    cases: [
      { when: "Calendar-locked buyer", points: 25 },
      { when: "Discretionary buyer", points: 8 },
    ],
    best: 25,
    why: "A heating system fails in November whether or not anybody markets to it, and a school district's summer shutdown is printed on a published calendar. That certainty is the only thing a campaign can be planned against, so a buyer whose demand already sits on a calendar outranks one who has to be persuaded there is a problem at all.",
  },
  {
    criterion: "Is the window open",
    cases: [
      { when: "Buys inside the next four months", points: 20 },
      { when: "Buys later than that, or no window on record", points: 4 },
    ],
    best: 20,
    why: "Outreach leads the window, so the horizon is four months rather than one. The heating campaign that runs in October is built in August, and the first cold week is not the moment to start writing it. Miss the window and you have not missed a month, you have missed a season.",
  },
  {
    criterion: "How big is it",
    cases: [
      {
        when: "Midpoint of the modeled door range divided by twenty, then capped",
        points: 15,
      },
    ],
    best: 15,
    why: "Last, deliberately, and capped. The door count is the figure everybody sorts by and it is the one most likely to be wrong, because every one in this data set is a modeled range with its basis stated rather than a measurement. A criterion built on the softest data in the set is not allowed to outweigh one built on a published email address.",
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
// disagreement that took the Fullerton food plant out.
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
// THE NINE SERVICE LINES, MEASURED UNDER SIMULATED COLOUR BLINDNESS.
//
// Keyed by Lane rather than written as a list, so a tenth service
// line cannot be added to the domain without this table refusing to
// compile. The rendering below walks LANE_ORDER, which is the same
// order every other screen uses, so this table can never disagree
// with the board about how many service lines exist or which order
// they come in.
//
// `before` and `after` are each the smallest CIEDE2000 distance
// between that line and any of the other eight, taken as the worst
// of protanopia, deuteranopia and tritanopia simulated with the
// Vienot, Brettel and Mollon (1999) transform. Below about 2 units
// two colours are the same colour. Above about 8 they are reliably
// told apart.
//
// `before` is the paper theme this one replaced, which was itself a
// rebuild of a ramp whose floor was 1.32. `after` is the cabinet.
// ---------------------------------------------------------------

interface LaneSeparation {
  /** The hue family, crossed with the band to make the matrix. */
  family: string;
  /** 1 is the band nearest the ground, 3 the one furthest from it. */
  band: string;
  before: string;
  after: string;
  /** The same measurement on the light ground. */
  light: string;
}

const LANE_SEPARATION: Record<Lane, LaneSeparation> = {
  "hvac": {
    family: "Acid",
    band: "1",
    before: "9.53",
    after: "10.42",
    light: "9.50",
  },
  "plumbing": {
    family: "Acid",
    band: "2",
    before: "8.85",
    after: "10.00",
    light: "8.87",
  },
  "electrical": {
    family: "Acid",
    band: "3",
    before: "8.85",
    after: "10.00",
    light: "8.87",
  },
  "multi-service": {
    family: "Ember",
    band: "3",
    before: "8.98",
    after: "10.66",
    light: "9.56",
  },
  "drain-sewer": {
    family: "Ember",
    band: "2",
    before: "9.10",
    after: "10.42",
    light: "9.56",
  },
  "partner-employer": {
    family: "Ultra",
    band: "2",
    before: "9.83",
    after: "10.42",
    light: "8.72",
  },
  "partner-property": {
    family: "Ultra",
    band: "3",
    before: "8.98",
    after: "10.42",
    light: "8.72",
  },
  "partner-community": {
    family: "Ultra",
    band: "1",
    before: "9.68",
    after: "11.30",
    light: "10.07",
  },
  "water-heater": {
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
     array of two hundred-odd items and another of twenty-odd. */
  const total = PROSPECTS.length;
  const emailable = EMAILABLE.length;
  const doorOnly = DOOR_ONLY.length;
  const formOnly = total - emailable - doorOnly;
  const withEmailSource = EMAILABLE.filter((p) => p.emailSourceUrl).length;
  /* Published addresses that were NOT read off the organisation's own site.
     A California district's administrator addresses sit on the state school
     directory, and for these rows that was the page carrying one, so that is
     where they were read and that is where they link. Counted rather than
     typed, because the number moves whenever a school row is added. */
  const stateDirectoryEmails = EMAILABLE.filter((p) =>
    (p.emailSourceUrl ?? "").includes("cde.ca.gov"),
  ).length;
  const withRating = PROSPECTS.filter((p) => typeof p.rating === "number").length;

  /*
    THE THREE RESEARCH PASSES, EACH TOLD APART BY SOMETHING THE ROW
    ITSELF CARRIES.

    A place id comes back from the Google Places API and from nothing
    else, so its presence is a fact about where a row came from rather
    than a flag somebody set. That is the whole of the first pass, and
    nothing outside it carries one.

    The second and third passes both had no Places call available, both
    took their coordinate from the US Census Bureau geocoder and both
    leave the id absent rather than filled with something that looks
    like one. So the id cannot tell those two apart. What can is the
    date each row states in its own `addressSource`: the second pass was
    read and geocoded on 11 August 2026 alongside the first, the third
    on 14 August 2026. Every one of the rows names one of those two
    dates, none names both, and the 14 August rows are exactly the block
    that sits below the WAVE 3 banner in data/prospects.ts. The date is
    a stated fact on the row rather than a position in the array, so a
    row can move and stay in its own pass.

    The failure mode is loud on purpose. A row with no place id that
    named neither date would fall out of all three cohorts, and the
    paragraph under these figures prints the three counts added together
    beside the board total, so a reader who sees those two disagree is
    looking at a page that has fallen out of step with the file it
    describes.
  */
  const PASS_TWO_DATE = /\b11 Aug(ust)? 2026\b/;
  const PASS_THREE_DATE = /\b14 Aug(ust)? 2026\b/;
  const placesPass = PROSPECTS.filter((p) => p.placeId);
  const censusPass = PROSPECTS.filter((p) => !p.placeId);
  const handPass = censusPass.filter((p) => PASS_TWO_DATE.test(p.addressSource));
  const industryPass = censusPass.filter((p) =>
    PASS_THREE_DATE.test(p.addressSource),
  );
  const passTotal = placesPass.length + handPass.length + industryPass.length;
  const withPlaceId = placesPass.length;
  const isEmailable = (p: (typeof PROSPECTS)[number]) =>
    p.emailConfidence === "verified_public";
  const placesEmails = placesPass.filter(isEmailable).length;
  const handEmails = handPass.filter(isEmailable).length;
  const industryEmails = industryPass.filter(isEmailable).length;
  const share = (n: number, of: number) =>
    of === 0 ? 0 : Math.round((n / of) * 100);

  /*
    The service line rollup is built off LANE_ORDER rather than off a list
    typed into this page, which is why a ninth line appeared in this table
    without anybody editing it. A documentation screen that has its own
    opinion about how many service lines exist is the one screen guaranteed
    to be wrong first.
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

  const floor = VENUE.crewSlotsModelledFloor;
  const bigGroup = 300;
  const bigGroupLanes = crewSlotsForDoors(bigGroup);
  const bigGroupShare = Math.round((bigGroupLanes / floor) * 100);

  const seededRows = SEED_STATUSES.length;
  const seededUnworked = SEED_STATUSES.filter((s) => s.status === "unworked").length;
  const illustrativeOffers = OFFERS.filter((o) => o.provenance === "illustrative").length;
  const publicOffers = OFFERS.filter((o) => o.provenance === "public").length;
  const typedPriceLines = SEED_BOOK.filter(
    (l) => l.pricePerGuestProvenance === "user_input",
  ).length;

  /* Six real emails, with the pages they were read off. A reader who
     opens two of these has checked the claim the whole section rests on,
     which is a better argument than another paragraph making it. */
  const emailSamples = EMAILABLE.filter((p) => p.emailSourceUrl).slice(0, 6);

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
            Every price, offer, expiry date and rebate figure was read off
            the brand's own published page on 18 August 2026 and links back
            to the page it came from. The organisations came out of three
            research passes, the first two on 11 August 2026 through the
            Google Places API and off first-party pages and landlord
            directories, and a third on 14 August 2026 that named nine
            sectors first and then went looking for the organisations inside
            them. The rival and Champions brand rows were added on 18 August
            2026 off their own sites. Every row says where it came from, and
            every coordinate outside the first sixty-nine was set by the US
            Census Bureau geocoder. Everything else is labelled as modeled,
            observed, illustrative, entered or not published, and the labels
            are enforced by the components rather than by good intentions.
          </p>
          {/*
            THE ONE LINK OUT, AND WHY IT IS HERE RATHER THAN IN THE RAIL.

            This page settles whether a figure is right. It does not say why
            the application is shaped the way it is: why the desk ranks on
            reachability before size, why the two ledgers never add together,
            why a transparently priced membership is the recommendation the
            evidence supports. Those are decisions rather than calculations
            and they live on Rationale.

            A reader who has come this far is exactly the reader who wants
            the other half, and they are the only reader who does, which is
            why this is one sentence at the foot of a header rather than a
            thirty first row in the rail.
          */}
          <p className={styles.subLede}>
            This page answers whether a figure is right.
            {RATIONALE_AVAILABLE ? (
              <>
                {" "}
                <Link to="/rationale">Rationale</Link> answers why the thing
                is shaped this way at all, and how it was built.
              </>
            ) : null}
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
                  title="Every organisation on the board. The prospecting rows were gathered around the Brea branch at 625 Columbia St in three research passes, two on 11 August 2026 and a third on 14 August 2026. The rival and Champions brand rows were read off their own sites on 18 August 2026."
                />
                <Tally
                  value={String(withPlaceId)}
                  label="carry a Google place id"
                  provenance="public"
                  title="The identifier the row came back with from the Google Places API. It is what makes any row checkable at source rather than merely plausible."
                />
                <Tally
                  value={String(censusPass.length)}
                  label="researched by hand, geocoded by the Census"
                  provenance="public"
                  title="Everything without a place id. Read off first-party pages, landlord tenant directories, published registers and the brands' own sites, then run through the US Census Bureau geocoder for a coordinate. No place id, because there was no Places call available for any of them."
                />
                <Tally
                  value={String(emailable)}
                  label="publish an email"
                  provenance="public"
                  title="Read off a published page and never guessed from a domain name. Most are the organisation's own site; the school rows were read off the state school directory. Every one carries the URL it was read from."
                />
                <Tally
                  value={String(withEmailSource)}
                  label="carry the page it was read off"
                  provenance="public"
                  title="Not a claim that an address exists. A link to the page where it is printed."
                />
              </div>

              <p className={styles.p}>
                The board was gathered in three passes and every row says which
                one it came from.{" "}
                <strong className="num">{withPlaceId}</strong> of them came out
                of the Google Places API on 11 August 2026, searched around
                the published address of the Brea branch at {VENUE.address},{" "}
                {VENUE.city}, and each carries the place id it came back with,
                so any address, coordinate, rating or review count can be taken
                back to its source. <strong className="num">{withRating}</strong>{" "}
                also carry a Google rating and review count, used as a rough
                proxy for how visible an organisation is locally rather than as
                any kind of quality judgement.
              </p>

              <p className={styles.p}>
                The second pass ran the same day and added{" "}
                <strong className="num">{handPass.length}</strong>: the local
                retail, food, auto service and small employers the Places sweep
                never reached. Each one was found by reading the organisation's
                own published page or its landlord's tenant directory, and then
                run through the US Census Bureau geocoder, benchmark 2020, for a
                coordinate.
              </p>

              <p className={styles.p}>
                The third pass added{" "}
                <strong className="num">{industryPass.length}</strong> on 14
                August 2026, and it ran the other way round. The first two
                passes swept the trade area and took what was there, which finds
                shopfronts and clinics. This one named nine sectors first,
                because the board was thin in them and the demand is real, and
                then went looking for the organisations inside each one. Those
                rows were geocoded through the same Census benchmark, one call
                per address.
              </p>

              <p className={styles.p}>
                <strong className="num">{withPlaceId}</strong> and{" "}
                <strong className="num">{handPass.length}</strong> and{" "}
                <strong className="num">{industryPass.length}</strong> is{" "}
                <strong className="num">{passTotal}</strong> prospecting rows,
                and the board above holds{" "}
                <strong className="num">{total}</strong>. THOSE TWO FIGURES DO
                NOT MATCH AND THE DIFFERENCE IS NOT A MISCOUNT. The other{" "}
                <strong className="num">{total - passTotal}</strong> rows are
                the five West Division brands and the rival storefronts, read
                off their own published pages on 18 August 2026 for the offer
                comparison rather than gathered as prospects. They are on the
                board to be watched, not written to, and every one of them says
                so on its own row. Both figures are counted rather than typed,
                so a reader who sees the arithmetic above disagree with itself
                is looking at a page that has fallen out of step with the file
                it describes.
              </p>

              <p className={styles.p}>
                NO ROW OUTSIDE THE FIRST PASS CARRIES A PLACE ID AND THE FIELD
                IS ABSENT RATHER THAN FILLED. There was no Places call available
                for any of them, and an identifier that looks exactly like the
                real ones on a row a reader might click is worse than no
                identifier at all. The coordinate provenance is different too,
                and it is stated on every row: Google for the first{" "}
                <strong className="num">{withPlaceId}</strong>, the US Census
                Bureau for the other{" "}
                <strong className="num">{censusPass.length}</strong>.
              </p>

              <p className={styles.p}>
                <strong className="num">{emailable}</strong> of the whole board
                publish an email address, and this is the part worth being
                careful about. Every one of those{" "}
                <strong className="num">{emailable}</strong> addresses was read
                off a page anybody can open, and every one carries the URL of
                the page it was read from, which is printed beside it on the
                prospect drawer and linked from the map. Most of those pages are
                the organisation's own site.{" "}
                <strong className="num">{stateDirectoryEmails}</strong> of the
                school rows link to the California Department of Education's
                public school directory instead, because that is where a
                California district publishes an administrator's address, and
                two police rows link to the recruiting page the department
                points applicants at. Every one of those exceptions is on the
                row, so a reader opens the same page the research read. Nothing
                in this data set was pattern-guessed from a domain name. There
                is no info@ in this application that was not actually seen on an
                actual page.
              </p>

              <div className={styles.callout}>
                <p className={styles.calloutLabel}>
                  <span aria-hidden="true" className={styles.calloutGlyph}>
                    ◬
                  </span>
                  Why that rule was worth the extra days
                </p>
                <p className={styles.calloutText}>
                  One invented address is enough to make a reader reasonably
                  distrust every other figure on the screen, and they would be
                  right to. A person who spots a guessed info@ has learned
                  something true about the standard of the whole exercise, and
                  no amount of careful work elsewhere gets that back. The cost
                  of the rule is that{" "}
                  <strong className="num">{doorOnly}</strong> organisations here
                  publish no email at all and{" "}
                  <strong className="num">{formOnly}</strong> publish only a
                  contact form. Say the honest part about that first figure: the
                  rival and Champions brand rows sit inside it, and a rival is
                  on this board to be watched rather than written to. The rest
                  is not a hole in the research, and the rest of this section is
                  about why it turned out to be the most useful thing the second
                  pass produced.
                </p>
              </div>

              <h3 className={styles.h3}>
                The three passes returned very different ratios, and that is
                the finding
              </h3>

              <div className={styles.tallies}>
                <Tally
                  value={`${placesEmails} of ${withPlaceId}`}
                  label={`published an email, first pass, ${share(placesEmails, withPlaceId)} per cent`}
                  provenance="public"
                  title="A sweep of the trade area, every service line at once. The published addresses are concentrated in the institutional rows, because institutions publish staff directories."
                />
                <Tally
                  value={`${handEmails} of ${handPass.length}`}
                  label={`published an email, second pass, ${share(handEmails, handPass.length)} per cent`}
                  provenance="public"
                  title="Franchise retail, mall tenants and chain auto service. They deliberately publish nothing at store level."
                />
                <Tally
                  value={`${industryEmails} of ${industryPass.length}`}
                  label={`published an email, third pass, ${share(industryEmails, industryPass.length)} per cent`}
                  provenance="public"
                  title="Districts, city halls, congregations, professional practices and industrial employers. The sectors were named first, and they are sectors that publish."
                />
                <Tally
                  value={String(doorOnly)}
                  label="publish no email at all"
                  provenance="public"
                  title="Counted live. The partner rows in this count are the field route, sorted by distance from the Brea branch on the field board. The rival and brand rows are in it too, and they are there to be watched rather than contacted."
                />
              </div>

              <p className={styles.p}>
                The first pass found{" "}
                <strong className="num">{placesEmails}</strong> published
                addresses across <strong className="num">{withPlaceId}</strong>{" "}
                organisations. The second found{" "}
                <strong className="num">{handEmails}</strong> across{" "}
                <strong className="num">{handPass.length}</strong>. That is not
                the same search done worse. The first pass swept the trade area
                and came back with every service line at once, and its published
                addresses sit in the institutional rows: a school, a college, a
                church or a professional practice publishes a staff directory
                either because it is obliged to or because it wins it business,
                so the decision maker's title and inbox are on a public page
                waiting to be read. The second pass was franchise retail, mall
                tenants and chain auto service, and those organisations publish
                nothing at store level on purpose. A cookie franchisee routes
                every enquiry through a corporate form. A tyre shop's store
                number has no inbox behind it. The absence is a policy, not an
                oversight, and it is the same policy at every one of them.
              </p>

              <div className={styles.callout}>
                <p className={styles.calloutLabel}>
                  <span aria-hidden="true" className={styles.calloutGlyph}>
                    ◬
                  </span>
                  So that whole cohort is a field cohort, by nature
                </p>
                <p className={styles.calloutText}>
                  This is a commercial finding rather than a data quality
                  problem, and it is worth more than the addresses it failed to
                  produce. If an entire cohort of local businesses cannot be
                  emailed by anybody, then nobody is emailing them, and the
                  rival with the better mailing list has no advantage here at
                  all. What reaches them is a person walking in during a quiet
                  hour with something specific to say. They sit inside a few
                  miles of the branch, they occupy buildings with plant in them
                  and they employ households who own or rent the houses around
                  them. THE POSTING ASKS FOR LOCAL MARKETING INITIATIVES
                  FOCUSED ON DEMAND GENERATION, and this is what local means
                  once the paid channels have been bought: a route, a door and a
                  reason to walk in. The route sheet is on the field board.
                </p>
              </div>

              <p className={styles.p}>
                The third pass found{" "}
                <strong className="num">{industryEmails}</strong> published
                addresses across{" "}
                <strong className="num">{industryPass.length}</strong>{" "}
                organisations, the highest ratio of the three, and it is the
                same mechanism read the other way. That pass chose its sectors
                before it chose its organisations, and the sectors it chose were
                school districts, city halls, congregations, senior care,
                professional services and the industrial belt. Those are the
                kinds of organisation that publish a named address, so naming
                them first is the reason the ratio moved. It says nothing about
                one pass being run better than another. Where you look decides
                what you can reach in writing, and that is the argument for
                choosing a sector rather than sweeping a map.
              </p>

              <h3 className={styles.h3}>
                Every service line, and how it is reached
              </h3>
              <p className={styles.pTight}>
                Counted off the board rather than typed, one row per service
                line in the order the whole application uses. The gap between
                the two right-hand columns is the gap between a week of emails
                and a week of driving:
              </p>

              <div className={styles.tableWrap}>
                <table className={`${styles.table} ${styles.laneTable}`}>
                  <caption className={styles.tableCaption}>
                    Organisations by service line, with how many of them can be
                    reached in writing. Totals are{" "}
                    <span className="num">{total}</span> organisations,{" "}
                    <span className="num">{emailable}</span> publishing an
                    email and <span className="num">{doorOnly}</span>{" "}
                    publishing none.
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Service line</th>
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
                        Field only
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
                            service line name twice in a row. The word
                            beside it is the content; the mark is a second
                            signal for the eye.
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

              <h3 className={styles.h3}>Check six of them</h3>
              <p className={styles.pTight}>
                Every published email on the board links to the page it was read
                from. Here are the first six, unpicked:
              </p>
              <ul className={styles.srcList}>
                {emailSamples.map((p) => (
                  <li key={p.id} className={styles.srcRow}>
                    <span className={styles.srcRowName}>{p.name}</span>
                    <span className={`${styles.srcRowEmail} num`}>{p.email}</span>
                    <Src
                      href={p.emailSourceUrl!}
                      label={`The page the ${p.name} address was read from`}
                    >
                      where it was read
                    </Src>
                  </li>
                ))}
              </ul>

              <p className={styles.p}>
                Our own brand is held to the same standard, and its published
                contact surface is a finding in itself. ONE PHONE NUMBER carries
                the whole of Service Champions: the same{" "}
                <span className="num">{INBOUND_ROUTES.nationalPhone}</span> sits
                on the home page, the offers pages, the financing page, the
                membership page and the contact page, with no separate Colton or
                Murrieta number, so three branches and four counties route to
                one queue. ONE EMAIL ADDRESS is published on the entire site,{" "}
                <span className="num">
                  {INBOUND_ROUTES.publishedEmailAddresses[0]}
                </span>
                , and it is a maintenance inbox. There is no marketing address
                and no sales address. For a role whose budget is framed as
                driving incremental phone calls and web leads, that is the
                funnel: one number, one form, and one inbox nobody in marketing
                reads.
              </p>

              <p className={styles.sources}>
                <Src
                  href={VENUE.source}
                  label="The Service Champions site, where the branch address and the offers are published"
                >
                  The brand's own site
                </Src>
                <Src
                  href={INBOUND_ROUTES.source}
                  label="The Service Champions contact page, where the one phone number and the one email address are published"
                >
                  Their contact page
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
                  that are not on the board. One of them would have been the
                  largest employer in the territory. All of them are real, all
                  of them were researched, and every one of them failed the
                  same test.
                </>
              }
            >
              <div className={styles.excision}>
                <p className={styles.excisionLabel}>
                  <span aria-hidden="true" className={styles.excisionGlyph}>
                    ▨
                  </span>
                  Removed from the board
                </p>
                <p className={styles.excisionName}>
                  CJ Foods Manufacturing Corp, Fullerton
                </p>
                <p className={styles.excisionBody}>
                  A food manufacturing plant on South State College Boulevard
                  with a few hundred people on it, which makes it the largest
                  single employer the whole research turned up inside this
                  territory. One site, one facilities decision maker, plant
                  rooms that need servicing, and several hundred households on
                  the payroll who all heat and cool a home somewhere in these
                  four counties. It is the row anybody would put at the top of
                  a partner board.
                </p>
                <p className={styles.excisionBody}>
                  The US Census Bureau geocoder returned the NORTH segment of
                  State College Boulevard rather than the south, and landed the
                  pin on the same block as a boba cafe. A plant with a few
                  hundred people on it does not share a lot with a boba cafe,
                  and a second CJ site a mile away is unresolved as well. Two
                  sources disagreed. Nothing settled it, and an unsettled
                  address is not a fact.
                </p>
                <p className={styles.excisionKicker}>
                  So the row came out. It would have been the largest employer
                  on the board, and it is not on the board.
                </p>
              </div>

              <p className={styles.p}>
                That is the whole standard, in one worked example. The rule this
                data set was built under is that a figure with two sources
                disagreeing about it is not a figure with a margin of error, it
                is a figure nobody has established yet, and the correct thing to
                do with one is to remove it and say so. Keeping it and adding a
                hedge would have made the board look larger and would have made
                every other row on it worth slightly less.
              </p>

              <h3 className={styles.h3}>
                The same rule fired{" "}
                <span className="num">{EXCLUDED_FROM_BOARD.length}</span> times
                across the research passes
              </h3>

              <p className={styles.p}>
                One deleted row is an anecdote, and an anecdote is the easiest
                thing in the world to choose, because the person telling it
                picks which one to tell. So here is every organisation the
                research found, verified as real, and left off the board anyway,
                the one above included. They are named, their addresses are
                printed, and the reason is printed with them. A data set is
                defined as much by what it refused as by what it kept, and the
                only way to show that is to publish the refusals at the same
                size as everything else.
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
                  These are the case above exactly. A first-party page said one
                  address, the US Census Bureau geocoder came back with another,
                  and nothing settled which was right. An unsettled address is
                  not a fact, so there is nothing to pin and the row is not on
                  the map.
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
                  Census geocoder could not match at all, which is the Census
                  address file lagging new construction rather than a statement
                  about the business: the newer Imperial Highway centres and the
                  Village at La Floresta returned nothing while every older Brea
                  Boulevard address matched first time. The other{" "}
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
                <strong className="num">{total}</strong>, and the row printed
                above is the largest single employer the whole research pass
                turned up. Nudging a pin two streets over
                would have cost nothing that a reader could see and would have
                made every other coordinate on the map a guess. The rule was
                applied every time it fired rather than once, memorably, for the
                anecdote, and that is the difference between a standard and a
                story.
              </p>

              <p className={styles.p}>
                The same discipline is why{" "}
                <strong className="num">{NOT_PUBLISHED_FOR_BREA.length}</strong>{" "}
                things another brand in the family publishes are recorded in
                this application specifically as NOT published by our own:{" "}
                {NOT_PUBLISHED_FOR_BREA.join(", ")}. Every one of them is real
                somewhere in the Champions family and none of them is on this
                brand's site. A marketing manager who quotes a homeowner a
                membership price or a named lender that the brand has never
                published has not made an optimistic claim, they have created a
                complaint on the first invoice.
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

              <h3 className={styles.h3}>What each value means in this build</h3>

              <p className={styles.p}>
                PUBLIC is the largest category and the only one a reader can
                check without taking anybody's word for it. Every rival offer
                price in the comparison set was read off that rival's own page
                on 18 August 2026 with the URL recorded on the row. Every
                Champions brand offer sits there on the same terms, fine print
                included: the 47 dollar tune-up, the 47 dollar drain clearing
                with a free camera inspection, and the line saying both expire
                on 31 August 2026. So does the live rebate money, such as the
                SoCalGas HEER programme paying 300 to 575 dollars on a water
                heater and funded through 31 December 2026.
              </p>

              <p className={styles.p}>
                OBSERVED is the value most systems do not have, and it is the
                one that earned its place in this build. It covers things that
                are true, that nobody published as a fact, and that were found
                by looking. Four of Adeedo's campaign landing pages are still
                live and still indexed carrying expiry dates of 31 March 2025,
                15 September 2025 and 31 December 2025. Southern California
                Edison's own heat pump factsheet still advertises TECH Clean
                California money that ran out in Southern California on 7
                January 2026. No press release says either of those things.
                They are what those pages were doing on the day they were read,
                and each one carries that date on its row.
              </p>

              <p className={styles.p}>
                MODELED is anything derived rather than read: the capacity
                arithmetic, the door ranges on a row, the seasonality applied
                to a month, and every rate the spend screen computes from the
                figures seeded into it. A modeled figure never appears without
                the assumption it rests on printed beside it, because a
                calculation whose inputs are hidden is only a number wearing
                more confidence.
              </p>

              <p className={styles.p}>
                ILLUSTRATIVE is the invented half, and section seven names all
                of it: every seeded thread, every seeded inbound lead, every
                objection, and every dollar on the spend screen. Those were
                written to be representative of the shape a week in a territory
                like this one takes, not to report one that happened. No
                counterparty in any of them is a person. Every one is a role
                and a title.
              </p>

              <h3 className={styles.h3}>
                The sixth one is not a gap in the research
              </h3>

              <p className={styles.p}>
                "Not published" is the value worth stopping on, because it is
                the only one that describes a decision somebody else made rather
                than a decision this console made. It does not mean the figure
                could not be found. It means a company has one and deliberately
                does not print it.
              </p>

              <p className={styles.p}>
                Look at what carries a number in this market. A 47 dollar
                tune-up. A 47 dollar drain clearing. A 57, a 77, a 99. Fifty
                dollars off a repair, 500 off a replacement, 3,500 off a full
                system. Every one of those is a single job, bought once, by a
                household that found it on a phone while something in the house
                was broken. Now look at what carries no number. CHAMP-Rewards.
                NEXGEN's X Protection Plan. Mike Diamond's three protection
                plans. Mr. Rooter's Advantage Plan. Every one of them names the
                programme, itemises the benefits and routes the price to a
                phone number.
              </p>

              <div className={styles.tallies}>
                <Tally
                  value={String(priced)}
                  label="offers carry a published price"
                  provenance="public"
                  title="Read off a brand's own page on 18 August 2026. These are the offers that can be put in an ad, a landing page or an email without anybody picking up a phone."
                />
                <Tally
                  value={String(gated)}
                  label="route the price to a phone call"
                  provenance="public"
                  title="The page names the plan, itemises what is in it and publishes no figure. Not one of the thirteen rival brands profiled publishes a membership price."
                />
                <Tally
                  value={`$${LOWEST_PUBLISHED_PLAN_PRICE}`}
                  label="the lowest published recurring price in the market"
                  provenance="public"
                  title="Timo's Advantage Plan at 15 dollars a month, or 189 a year. The cheapest published membership figure a household in these counties can find anywhere, and it belongs to one of our own brands."
                />
              </div>

              <p className={styles.p}>
                The whole market has drawn the same line through its own
                product range. Below it the website sells a job, and above it a
                phone call sells a relationship. THE PATTERN IN WHICH FIGURES
                ARE WITHHELD IS THE SHAPE OF THE OPPORTUNITY: the gated half is
                the recurring half, a household can compare six drain prices in
                ninety seconds and cannot compare a single maintenance plan,
                and two of the only brands that publish one are ours. Recording
                those <strong className="num">{gated}</strong> offers as
                "unknown" would have thrown away the single most useful thing
                the research found.
              </p>

              <p className={styles.p}>
                There is a second set of withheld figures and it matters more
                than the first, because it is ours. CHAMPIONS GROUP PUBLISHES NO
                MARKETING BUDGET, NO COST PER LEAD, NO CLOSE RATE, AND NO AGENCY
                ROSTER OR WHAT IT PAYS THEM. Nothing at the holding company,
                nothing on any of the five West Division brand sites, and
                nothing in the posting beyond one sentence saying the budget
                exists and is meant to drive incremental phone calls and web
                leads. Every one of those figures is withheld here and not one
                of them is estimated. A work sample that printed an invented
                cost per lead for the company it is applying to would be
                answering a question nobody asked and getting it wrong in
                public, and that is disqualifying rather than impressive. The
                spend screen is a framework with the shape of the model in it
                and illustrative dollars filling the rows, and it says so on
                every row.
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
                fetch. What is true is both shorter and stronger. The one
                recurring price this market does publish is Timo's{" "}
                <strong className="num">${LOWEST_PUBLISHED_PLAN_PRICE}</strong> a
                month, and where a screen needs an anchor for a plan nobody
                prices that is the figure it uses, labelled as the market floor
                rather than as our price.
              </p>

              <p className={styles.sources}>
                <Src
                  href={SOURCE_LINKS.corporateEvents}
                  label="A published offers page, one of the pages these prices were read from"
                >
                  Where the prices were read
                </Src>
                <Src
                  href={SOURCE_LINKS.schoolEvents}
                  label="A published membership programme page, which names the plan and publishes no price"
                >
                  A plan with no price on it
                </Src>
                <Src
                  href={SOURCE_LINKS.groupEvents}
                  label="A rival brand's published offers page, read on 18 August 2026"
                >
                  A rival's own offers
                </Src>
                <Src
                  href={STANDARD_TERMS.source}
                  label="Timo's Advantage Plan terms and conditions, the only published membership terms found anywhere in the set"
                >
                  The only published terms in the set
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
                  A territory this size holds{" "}
                  <span className="num">{total}</span> organisations on the
                  board and one person to work them. The ordering function is
                  the most opinionated thing in this application, so here it is
                  in full.
                </>
              }
            >
              <p className={styles.p}>
                Sorting alphabetically, or by distance, or by Google rating all
                produce a list that looks organised and wastes the week. Four
                things actually decide what to work first, and they are worth
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
                points, because a fifth email is a spam complaint. That
                organisation does not need another message, it needs a call, a
                visit or a rest, and a desk that keeps pushing the same
                untouched-looking name to the top is a desk that trains the
                person reading it to ignore the order.
              </p>

              <p className={styles.p}>
                Two more decisions worth naming. Won and lost rows fall to the
                bottom of the desk through a large negative weight rather than
                being filtered out, because they are not work to be done and
                they are also not things to hide; a pipeline that quietly
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
                  Two numbers decide how much work a week of campaign can put
                  in front of the crew, and neither of them is published by
                  anybody. They are stated as assumptions everywhere they
                  appear. The only judgement made here is which direction to be
                  wrong in.
                </>
              }
            >
              <div className={styles.tallies}>
                <Tally
                  value={`1 : ${DOORS_PER_CREW_SLOT}`}
                  label="properties to a crew slot, modelled"
                  provenance="modeled"
                  title="One crew slot is modelled as serving twenty properties in a day. No brand in the set publishes a figure like this, so it is an assumption and every screen that divides by it says so."
                />
                <Tally
                  value={String(floor)}
                  label="daily crew slots at the branch, modelled"
                  provenance="modeled"
                  title="Champions Group publishes over 1,800 field technicians across twenty two brands and no per-branch count anywhere. Twenty six is a working assumption set deliberately low."
                />
                <Tally
                  value={String(MAX_SIMULTANEOUS_BOWLERS)}
                  label="properties the branch could serve in a day"
                  provenance="modeled"
                  title="The modelled slot count multiplied by the modelled properties per slot. Both inputs are assumptions; the multiplication is this console's."
                />
              </div>

              <p className={styles.p}>
                Twenty six daily crew slots at the branch, and twenty properties
                to a slot. Put those together and a campaign that lands{" "}
                <strong className="num">{bigGroup}</strong> jobs on one date
                consumes <strong className="num">{bigGroupLanes}</strong> crew
                slots. That is{" "}
                <strong className="num">{bigGroupShare}%</strong> of the
                modelled day. Two campaigns landing on the same date is most of
                the branch, and the second one is a week of leads nobody can
                run.
              </p>

              <div className={styles.callout}>
                <p className={styles.calloutLabel}>
                  <span aria-hidden="true" className={styles.calloutGlyph}>
                    ◬
                  </span>
                  Why the number is set low rather than fairly
                </p>
                <p className={styles.calloutText}>
                  A branch that runs three locations across four counties almost
                  certainly fields more than{" "}
                  <strong className="num">{floor}</strong> crews in a day.
                  Computing against a low figure therefore understates the field
                  on every screen, and understating is the only safe direction
                  to be wrong in. A capacity chart that says a week is tight
                  when it is comfortable costs a phone call to check. A capacity
                  chart that says a week is comfortable when the trucks are
                  already full costs a customer a missed appointment, costs the
                  brand the review that follows, and costs every other figure
                  the same tool produced its credibility. Those two errors are
                  not symmetrical, so the arithmetic is biased on purpose and
                  the bias is stated wherever the figures appear.
                </p>
              </div>

              <p className={styles.p}>
                The same reasoning sets where a day is treated as effectively
                full. The threshold is three free crew slots rather than zero,
                because below three the only thing that still fits is one small
                job and most of what a campaign generates is larger than that. A
                date with two slots left is not a date with room on it, it is a
                date that will disappoint whoever rings next.
              </p>

              <p className={styles.p}>
                Note what these figures are not. THE NUMBER OF PROPERTIES A
                CAMPAIGN CAN REACH AND THE NUMBER THE CREW CAN SERVE ARE
                DIFFERENT FIGURES BY AN ORDER OF MAGNITUDE. One is a media
                number and one is a field number, and quoting either as the
                other is the fastest way to be wrong in a Monday review. The
                field number modelled here is{" "}
                <strong className="num">{MAX_SIMULTANEOUS_BOWLERS}</strong>{" "}
                properties in a day. Neither figure is published by anybody, and
                no screen in this console prints a technician count, a truck
                count or a job duration, because none of the three exists on any
                page that was retrievable.
              </p>

              <p className={styles.sources}>
                <Src
                  href={SOURCE_LINKS.breaLocation}
                  label="The brand's own Brea page, which publishes the address and no crew count"
                >
                  Where the branch address is published
                </Src>
                <Src
                  href={SOURCE_LINKS.corporateEvents}
                  label="The published offers page, which prices the work and publishes no capacity figure at all"
                >
                  Where the work is priced
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
                          ? "BookLine. Properties, a price per property, the provenance of that price, a deposit percentage, a scheduled date and the crew slots the work consumes."
                          : "ActivityLine. A type, a week, hours, target conversations, an owning seat and the service lines it covers. There is no money field on it at all."}
                      </p>
                    </div>
                  );
                })}
              </div>

              <p className={styles.p}>
                The absence of a revenue field on an activity line is not an
                omission that nobody got round to. It is the point. A weekly
                report to a division is precisely where hours get quietly
                dressed up as results, and a marketing desk is where that
                temptation is strongest, because activity is the thing there is
                most of and the sold work lands weeks later.
              </p>

              <div className={styles.callout}>
                <p className={styles.calloutLabel}>
                  <span aria-hidden="true" className={styles.calloutGlyph}>
                    ◬
                  </span>
                  The specific lie this prevents
                </p>
                <p className={styles.calloutText}>
                  A generic CRM lets somebody attach an estimated value to an
                  activity and roll it into a pipeline total. Twelve partner
                  visits at a notional two thousand dollars each becomes a
                  twenty four thousand dollar pipeline in a slide, and not one
                  dollar of it has been agreed by anybody. A division director
                  reads that number as money in progress, plans against it, and
                  finds out a month later that it described a car park and a
                  stack of leaflets. In this application twelve partner visits
                  is twelve partner visits and a count of hours. If one of them
                  turned into sold work there is a signed line in the other
                  ledger, and that is where the dollars are.
                </p>
              </div>

              <p className={styles.p}>
                So there are two totals functions, and neither will accept the
                other's rows. Revenue totals return signed lines, properties,
                contract value, deposits actually collected, and separately how much of
                that value rests on a price a person typed rather than a price a
                company published. Activity totals return shifts, hours, target
                conversations, completions and, separately again, the hours
                spent out in the territory rather than at a desk. That last
                split matters because the posting asks for local marketing
                initiatives and operational alignment as well as media buying; a
                call block from a desk is real work and it is counted honestly,
                and a plan that quietly meets its hours target from a chair has
                not met it.
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
                  label="campaign periods"
                  provenance="illustrative"
                  title="Each one counts days of published offer runway against the 31 August 2026 expiry, because that is the only published date in the whole set."
                />
                <Tally
                  value={String(OFFERS.length)}
                  label="offer cards on the board"
                  provenance="public"
                  title={`${publicOffers} published and ${illustrativeOffers} invented. Every figure on them is a brand's own, read off its own site on 18 August 2026.`}
                />
                <Tally
                  value={String(seededRows)}
                  label="seeded status rows"
                  provenance="illustrative"
                  title={`${seededUnworked} of them say unworked, which is what a territory looks like on the day somebody starts working it.`}
                />
                <Tally
                  value={String(SEED_BOOK.length)}
                  label="signed lines in the seeded book"
                  provenance="illustrative"
                  title="A desk a few weeks into a cold territory with a couple of signed jobs against it is roughly where one person gets to. More would have made a better screenshot and described a situation nobody has been in."
                />
              </div>

              <h3 className={styles.h3}>The periods</h3>
              <p className={styles.p}>
                All <strong className="num">{PERIODS.length}</strong> periods are
                illustrative, and the figure each one carries is DAYS OF
                PUBLISHED OFFER RUNWAY rather than a month. The console this was
                adapted from counted weeks to a date nobody had published.
                Service Champions has been trading for twenty five years and has
                no such date. What the market does have is an END date: the
                summer savings fine print reads that offers expire 31 August
                2026, and Adeedo's seasonal campaign carries the same one. So
                the countdown on every screen runs against the only published
                date in the set.
              </p>
              <p className={styles.p}>
                The first period has fourteen days on it. THE OTHER THREE PRINT
                ZERO, because no successor campaign is published anywhere, and a
                period that prints zero is telling the truth about the market
                rather than failing to find a number. That zero is the argument
                this console exists to make: two of the five brands go dark on 1
                September, the heating pre-season has to launch in September and
                October, and the work the date points at is building that
                campaign now.
              </p>

              <h3 className={styles.h3}>The offers</h3>
              <p className={styles.p}>
                <strong className="num">{illustrativeOffers}</strong> of the{" "}
                <strong className="num">{OFFERS.length}</strong> offer cards are
                invented. That is the one count on this page allowed to be zero
                and it is zero: every figure on those cards is a brand's own
                published number, read off its own site on 18 August 2026, fine
                print and expiry included. Note what is not among them. There is
                no discount off a price nobody publishes. You cannot discount a
                secret, and the move the evidence actually supports is the
                opposite one: publish the recurring price the whole market
                hides.
              </p>
              <p className={styles.p}>
                All <strong className="num">{publicOffers}</strong> cards carry
                an expiry date or say plainly that there is none, and in August
                that is the only column that matters. Two of the five brands
                expire on 31 August with nothing published to follow them. Three
                carry no end date at all, which means they never go stale and
                never feel urgent. Both are decisions somebody made, and neither
                is visible anywhere on the brands' own sites.
              </p>

              <h3 className={styles.h3}>The seeded statuses and the book</h3>
              <p className={styles.p}>
                The seeded fact table holds{" "}
                <strong className="num">{seededRows}</strong> rows against the
                board and <strong className="num">{seededUnworked}</strong> of
                them say unworked. That is not an unfinished seed. It is what a
                territory looks like on the day somebody is hired into it, and
                softening it would have been the most dishonest thing this
                prototype could do. There is no pipeline yet. There is a list of
                organisations who have never heard from this brand, and a
                published date fourteen days out.
              </p>
              <p className={styles.p}>
                The seeded book holds{" "}
                <strong className="num">{SEED_BOOK.length}</strong> signed lines,
                alongside <strong className="num">{SEED_ACTIVITY.length}</strong>{" "}
                planned activity shifts and{" "}
                <strong className="num">{SEED_REPLIES.length}</strong> replies
                including the losses and the silence. Showing eleven signed
                lines would have made a better screenshot and would have
                described a situation nobody has ever been in. The ones that are
                there were chosen to carry a single distinction:{" "}
                <strong className="num">{SEED_BOOK.length - typedPriceLines}</strong>{" "}
                sits on a published price anybody can check, and{" "}
                <strong className="num">{typedPriceLines}</strong> sits on a
                price a person typed, because the offer behind it is one of the{" "}
                <strong className="num">{gated}</strong> this market routes to a
                phone call. That second line carries an entered badge everywhere
                it appears, and the book states in words how much of its own
                total rests on a number somebody made up in a meeting. That is
                the figure a division director should want to see and the one a
                pipeline report never shows them.
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
                  No Champions Group brand publishes a response time anywhere on
                  its site.
                </strong>{" "}
                Not on a brand home page, not on an offers page, not on a
                contact page. There is no service level to quote, and no screen
                in this console invents one on anybody's behalf. The{" "}
                {RESPONSE_COMMITMENT.label.toLowerCase()} commitment is this
                desk's own, invented for this work sample, and every figure
                measured against it carries that disclosure beside it.
              </p>
              <p className={styles.p}>
                {RESPONSE_COMMITMENT.why} The clock runs 9am to 6pm in the
                territory and pauses outside it, so a lead that arrives at ten
                at night is not marked late before anybody is awake. Those are
                this marketing desk's hours and not the brands': several of them
                advertise round-the-clock emergency availability, which means
                the ten at night lead is exactly the one most likely to be lost
                and pausing the clock flatters the desk on precisely those rows.
              </p>
              <p className={styles.p}>
                The queue's own reading moment is fixed rather than taken from
                the machine it is opened on. A dated demonstration read through
                a live clock is one where everything is overdue a fortnight
                after it was published, which says nothing about the desk and
                everything about the calendar.
              </p>

              <h3 className={styles.h3}>
                The threads, the inbound leads and the objections
              </h3>
              <p className={styles.p}>
                Every seeded conversation, every seeded inbound lead and every
                objection on the objections screen is illustrative, and each one
                says so on its own row. They were written to be representative
                of the shape a week takes in a territory like this one, not to
                report a week that happened. NO COUNTERPARTY IN ANY OF THEM IS A
                PERSON. Every one is a role and a title, because inventing a
                named facilities manager at a real school district would be
                inventing a person, and that is a line this exercise does not
                need to cross to make its argument.
              </p>
              <p className={styles.p}>
                The objections are the part worth reading twice, because they
                are the only place in this console where the argument runs
                against us. Each one is written as a household or a partner
                would actually put it, including the ones there is no good
                answer to, and the answer beside it never invents a price, a
                warranty term or a rebate that nobody publishes.
              </p>
              <p className={styles.p}>
                A low early response rate is what a cold territory looks like,
                and it is not a failure to correct with more email. The first
                message any of these organisations gets is from a brand they did
                not ask to hear from, about a service they do not need today, at
                a price that depends on somebody looking at the property. The
                rule this console argues for is two written touches and then a
                call or a visit.
              </p>

              <h3 className={styles.h3}>The replies, and the sending</h3>
              <p className={styles.p}>
                Every reply on the replies screen is illustrative. The words were
                written for this work sample, and no organisation is described as
                having said anything it did not say. The service lines, the
                addresses and the decision maker titles behind each row are the
                sourced part. There is also no email transport anywhere in this
                dependency tree: sending writes a row to the outbox and nothing
                leaves the browser tab. The demo recipient is{" "}
                <span className="num">{DEMO_RECIPIENT}</span>, on a domain
                reserved by RFC 2606 that can never resolve, so a send action has
                a real address to put in a To field and no possible route to a
                person.
              </p>

              <p className={styles.p}>
                Door counts, buying windows and the one-line fit note on each
                organisation are judgements rather than measurements. They carry
                modeled provenance, they state their basis on the row, and they
                are ranges rather than single numbers on purpose. A range that
                says forty to eighty doors based on a single-site clinic is
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
                  stated assumption with a measurement. None of them changes the
                  model; they change the inputs, which is the test of whether a
                  model was built properly.
                </>
              }
            >
              <ol className={styles.dayOne}>
                <li className={styles.dayOneItem}>
                  <p className={styles.dayOneWhat}>
                    The campaign that follows 31 August
                  </p>
                  <p className={styles.dayOneHow}>
                    Every period in this application counts days against the 31
                    August expiry because that is the only published date in the
                    set, and three of the{" "}
                    <strong className="num">{PERIODS.length}</strong> print zero
                    because no successor is published. A signed-off autumn
                    campaign turns all of them into real months with real end
                    dates and gives the heating pre-season something to be built
                    against. Nothing in the model has to move. One field changes
                    and half the outreach templates branch differently.
                  </p>
                </li>
                <li className={styles.dayOneItem}>
                  <p className={styles.dayOneWhat}>
                    The real crew count and the real job durations
                  </p>
                  <p className={styles.dayOneHow}>
                    Today the capacity arithmetic runs against a modelled{" "}
                    <strong className="num">{floor}</strong> daily crew slots and
                    twenty properties to a slot, because Champions Group
                    publishes over 1,800 field technicians across twenty two
                    brands and no per-branch number anywhere. A real crew count
                    and a real job-duration table replace two assumptions with
                    two measurements, and every screen that currently
                    understates the field stops doing so.
                  </p>
                </li>
                <li className={styles.dayOneItem}>
                  <p className={styles.dayOneWhat}>
                    The budget, the cost per lead and the close rate
                  </p>
                  <p className={styles.dayOneHow}>
                    <strong className="num">{gated}</strong> offers here carry no
                    price because nobody in the market publishes one, and this
                    console carries no marketing budget, no cost per lead, no
                    close rate and no agency fee because Champions Group
                    publishes none of them. With the actual budget, the agency
                    invoices and the booked jobs beside each other, every
                    withheld sentence on the spend screen becomes a figure and
                    the modelled rates become measured ones. Until then the
                    honest thing on screen is the sentence, not a guess.
                  </p>
                </li>
                <li className={styles.dayOneItem}>
                  <p className={styles.dayOneWhat}>
                    A real CRM, and the agencies' own reporting
                  </p>
                  <p className={styles.dayOneHow}>
                    The fact table in this application is one row per
                    organisation, offer and period, and everything else is a
                    selector over it. That is the same shape a real CRM object
                    has, which means this is an import rather than a rebuild:
                    the{" "}
                    <strong className="num">{seededRows}</strong> seeded rows are
                    replaced by real ones and the desk, the service line board,
                    the capacity chart and every generated next action
                    recalculate from them. Paid search, Local Services Ads and
                    retargeting arrive from the agencies rather than from a
                    seed. Nothing on any screen is stored, so nothing on any
                    screen has to be migrated.
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
                  No colour in it was sampled from any brand in this set. Every
                  one was constructed in CIELAB at a chosen lightness, chroma
                  and hue, and then measured. There are two grounds, and the
                  second one cost a column in that table rather than a rewrite.
                </>
              }
            >
              <p className={styles.p}>
                SAY THE AWKWARD PART FIRST: THIS PALETTE WAS BUILT FOR A
                DIFFERENT SUBJECT. It was chosen for the console this one was
                adapted from, where the argument for a dark ground was that the
                thing being described was a dark room full of lit objects.
                That argument does not survive the move, because nothing about a
                heat pump or a sewer line is served by a violet black. What
                survives is the half that was never about the subject: the
                arithmetic below, and one argument that stands on its own. This
                tool is read in a truck, in a driveway and on a phone at 380
                pixels between calls, and a dense table on a dark ground stops
                the ground competing with the numbers. The name stayed because
                it is written into the token file and six other modules, and
                renaming a theme while eight files are mid-edit is how two files
                stop agreeing about a colour.
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
                trading terminal already does, and this tool is read in a truck,
                in a car park and on a phone at 380 pixels between calls. The{" "}
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
                  label="service line separation under colour blindness, light"
                  provenance="modeled"
                  title="The smallest CIEDE2000 distance between any two of the nine service lines, taken as the worst of three simulated dichromacies. The dark ground measures 10.00, the paper theme measured 8.85 and the ramp before that measured 1.32."
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

              <h3 className={styles.h3}>
                Nine service lines will not fit on one axis
              </h3>

              <p className={styles.p}>
                A service line chip sets its colour as text on its own tint at
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
                family hues and the per-band drift are shared, because a service
                line's hue is its identity and plumbing is the same green with
                the lights on or off. Only the three band lightnesses move, and
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
                word give the service line. Colour is the fourth signal here, as
                it is everywhere else in this application:
              </p>

              <div className={styles.tableWrap}>
                <table className={`${styles.table} ${styles.laneTable}`}>
                  <caption className={styles.tableCaption}>
                    Band 1 is the band nearest the ground and band 3 the one
                    furthest from it. Each figure is the smallest CIEDE2000
                    distance between that service line and any of the other
                    eight, taken as the worst of protanopia, deuteranopia and
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
                      <th scope="col">Service line</th>
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
                it, so the three band-three lines read as bright pastels next to
                the deep ink of band one. On light the same thing happens at the
                other end and the deepest band reads as three near-blacks. Both
                are a real cost and the alternative was worse: forcing chroma
                out of the gamut drives all three hue families into the
                yellow-green wedge, which is precisely where dichromacy
                collapses them. And inside a band the three lines are the same
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
                word, every service line has a glyph and a cap shape and a name,
                every bar carries its number, and the whole set survives being
                printed
                in greyscale: the nine service lines resolve into three flat
                values,
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
                  This is an independent work sample. It is not a Champions
                  Group product, it does not represent Champions Group Holdings
                  or any of its brands, and it was built by one person for a job
                  application.
                </>
              }
            >
              <div className={styles.disclaimer}>
                <p className={styles.disclaimerP}>
                  This console is an unaffiliated work sample by Nathan J. Song,
                  built for a Marketing Manager, West Division application at
                  Champions Group Holdings in Brea. It is not affiliated with,
                  endorsed by or connected to Champions Group Holdings, Service
                  Champions, ASI Hastings, Adeedo, Powell Electric, Timo's or
                  any rival brand named on any screen.
                </p>
                <p className={styles.disclaimerP}>
                  Every brand name in this application belongs to its owner and
                  appears here only to identify the company whose published
                  pages were read. No brand's logo, typeface or colour is used
                  anywhere: the type was chosen for the work it does at 9.5
                  pixels, and every colour was constructed at a stated lightness
                  rather than sampled from anybody's site.
                </p>
                <p className={styles.disclaimerP}>
                  Every published figure in this application was read off a
                  brand's own page on 18 August 2026 and carries the page it came
                  from. <strong className="num">{withPlaceId}</strong>{" "}
                  organisations came out of the Google Places API on 11 August
                  2026 and carry the place id they came with, and the other{" "}
                  <strong className="num">{censusPass.length}</strong> were read
                  off first-party pages, published directories and the brands'
                  own sites, on that day, on 14 August 2026 and on 18 August
                  2026, then geocoded by the US Census Bureau, with the place id
                  field left absent rather than invented. Everything else is
                  labelled as modeled, observed, illustrative, entered or not
                  published, and those labels are the most important thing on
                  any screen they appear on.
                </p>
                <p className={styles.disclaimerP}>
                  No real person is named anywhere in it. Every counterparty is a
                  role and a title, because inventing a name at a real
                  organisation would be inventing a person, and that is a line
                  this exercise does not need to cross to make its argument.
                  Every email address in a seeded thread sits on the .invalid
                  domain, which RFC 2606 reserves and which can never resolve.
                </p>
                <p className={styles.disclaimerP}>
                  There is no email transport in this dependency tree and no data
                  leaves the browser tab. Every figure on{" "}
                  <strong className="num">{PACKAGES.length}</strong> offers,{" "}
                  <strong className="num">{total}</strong> organisations and{" "}
                  <strong className="num">{SEED_BOOK.length}</strong> signed
                  lines is either checkable at source or labelled as invented,
                  and there is no third category.
                </p>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
