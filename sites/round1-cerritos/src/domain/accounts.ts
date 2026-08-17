import type { OccasionClass, Provenance } from "@/domain/types";
import type { StatusToken } from "@/domain/vocabulary";

/**
 * THE CUSTOMER AFTER THE SIGNATURE.
 *
 * Everything else in this application happens before somebody buys.
 * `PitchStatus` runs from `unworked` to `booked` and stops, `types.ts`
 * says in its own header that there is no client base to retain, and the
 * record modal's last word about a customer is an event date and a
 * contract value. This file is the other half: what an organisation is
 * once the contract exists.
 *
 * THE ONE DECISION THAT SHAPES EVERY LINE BELOW. The obvious model is an
 * anniversary: they bought in November, ask them again next November.
 * It is wrong for both of this venue's accounts, on day one, before
 * anybody has made a mistake. Heights Christian's `buyingWindow` reads
 * "Dec (Christmas program week), May-Jun (end of year), Jun-Aug (summer
 * program)" and Team Kwon's reads "Jun + Dec". Neither organisation is
 * annual. One of them holds three separate occasions on three separate
 * clocks and the other holds two, and an anniversary would produce a
 * date that appears on nobody's calendar.
 *
 * So the unit of rebooking is not the event, it is the OCCASION: a named
 * thing an organisation does at a time of year, in the buyer's own
 * words. An occasion recurs, a window opens a segment specific lead time
 * before it, the window closes when the decision is made with or without
 * us, and a window that closes empty is the churn event. That is the
 * whole mechanic, and it is Oracle OPERA's auto trace expressed for one
 * trade: an anchor date, a signed offset, a purpose.
 *
 * NOTHING HERE IS STORED. Every date on this page is arithmetic against
 * an injected `asOf`, exactly as `partnerRows(asOf)` already is, so a
 * screenshot taken in November shows the arithmetic that was true in
 * November. It is also what makes the honest constraint survivable:
 * no event has been delivered yet, `delivered` is a state the data
 * reaches on 21 November 2026 on its own, and no seed row has to be
 * edited on the day for the board to start telling the truth.
 *
 * AND ONE THING THIS FILE MUST NOT BE READ AS SAYING. Retained revenue
 * is the same `BookLine` money seen down a different axis. It is not a
 * third ledger. Booked revenue and outbound hours are two ledgers and
 * they are never summed; an account does not get to add a third pile of
 * money to the pile by being looked at from the side.
 */

// ---------------------------------------------------------------
// Dates, in whole calendar days
// ---------------------------------------------------------------

/**
 * Whole days added to an ISO date, midday UTC to keep a summer time
 * boundary from eating a day. `licensing.ts` counts days the same way
 * and this is its inverse; both live near the code that uses them
 * because a shared date module in this codebase would be one import that
 * every screen depends on and nobody owns.
 */
export function addDays(iso: string, days: number): string {
  const at = Date.parse(`${iso}T12:00:00Z`);
  if (Number.isNaN(at)) return iso;
  return new Date(at + days * 86_400_000).toISOString().slice(0, 10);
}

/** Days in a month, one-indexed on the month. Leap years included. */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** An ISO date from parts, with the day clamped to the month's length. */
export function isoOf(year: number, month: number, day: number): string {
  const clamped = Math.min(Math.max(1, day), daysInMonth(year, month));
  return `${year}-${String(month).padStart(2, "0")}-${String(clamped).padStart(2, "0")}`;
}

/** The year, month and day of an ISO date, or null where it is not one. */
export function partsOf(
  iso: string,
): { year: number; month: number; day: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
}

// ---------------------------------------------------------------
// Segments, and where the lead times come from
// ---------------------------------------------------------------

/**
 * The eight buying segments, which are not the nine lanes.
 *
 * A lane is a channel of outbound work and it decides the MOTION. A
 * segment decides the CLOCK: how long before the occasion the buyer
 * starts looking, and how long before it the decision is already made.
 * A school is one lane and three segments, because grad night is
 * decided a year out by a committee that turns over and a staff
 * appreciation day is decided in a fortnight by one administrator.
 */
export type AccountSegment =
  | "corporate-holiday"
  | "corporate-other"
  | "grad-night"
  | "school-programme"
  | "youth-sports-banquet"
  | "faith-group"
  | "martial-arts"
  | "senior-living";

export interface SegmentProfile {
  segment: AccountSegment;
  label: string;
  /** Days before the occasion when the board starts asking by name. */
  planningLeadDays: number;
  /** Days before the occasion after which the decision is made without us. */
  commitLeadDays: number;
  /**
   * The noun this segment uses for an unlabelled occasion. Used only
   * where the buyer's own words are absent from `buyingWindow`, so a row
   * reads "Test cycle, June" rather than "Occasion 2".
   */
  occasionNoun: string;
  /** Where the two lead times came from, printed next to the bar. */
  source: string;
  provenance: Provenance;
}

/**
 * The lead times, with their sources attached.
 *
 * NO SOURCE ANYWHERE PUBLISHES THESE FOR A BOWLING VENUE and the screen
 * has to say so in a line rather than implying an industry standard
 * exists. What the sources do publish is the shape of each buying
 * season, and these numbers are read off that shape with a margin either
 * side. They are stated on screen next to the bar they draw, for the
 * same reason `STALENESS_DAYS` is stated on `/partners`: a boundary the
 * reader cannot see is a boundary they have to take on trust.
 */
export const SEGMENT_PROFILE: Record<AccountSegment, SegmentProfile> = {
  "corporate-holiday": {
    segment: "corporate-holiday",
    label: "Corporate holiday party",
    planningLeadDays: 120,
    commitLeadDays: 60,
    occasionNoun: "Holiday party",
    source:
      "Catering Funnels puts research in July and August, shortlists in September and early October, and contracts signed in October and November for a December event.",
    provenance: "modeled",
  },
  "corporate-other": {
    segment: "corporate-other",
    label: "Corporate, other",
    planningLeadDays: 90,
    commitLeadDays: 45,
    occasionNoun: "Company event",
    source:
      "Releventful puts corporate venue research a quarter earlier than the holiday cycle, with shortlists in June and July.",
    provenance: "modeled",
  },
  "grad-night": {
    segment: "grad-night",
    label: "Grad night",
    planningLeadDays: 365,
    commitLeadDays: 120,
    occasionNoun: "Grad night",
    source:
      "GradNight.org describes a committee that re-evaluates every year and a treasury that carries forward, so the ask goes to the outgoing committee at the event and to the incoming one in the autumn. No published lead time exists for this occasion and these two figures are this application's own.",
    provenance: "modeled",
  },
  "school-programme": {
    segment: "school-programme",
    label: "School programme and staff events",
    planningLeadDays: 70,
    commitLeadDays: 30,
    occasionNoun: "School occasion",
    source:
      "By analogy with banquet committee formation, which Digital Record Board puts at eight to ten weeks before the date with reserving the venue in the first phase.",
    provenance: "modeled",
  },
  "youth-sports-banquet": {
    segment: "youth-sports-banquet",
    label: "Youth sports banquet",
    planningLeadDays: 70,
    commitLeadDays: 30,
    occasionNoun: "Season banquet",
    source:
      "Digital Record Board: planning starts eight to ten weeks out and step one of the checklist is reserving the venue, so the window closes early and hard.",
    provenance: "modeled",
  },
  "faith-group": {
    segment: "faith-group",
    label: "Faith group",
    planningLeadDays: 180,
    commitLeadDays: 60,
    occasionNoun: "Ministry event",
    source:
      "Ori's youth ministry calendar puts major events at three to six months of lead time and the whole year's calendar at twelve, decided on one planning day in May or June.",
    provenance: "modeled",
  },
  "martial-arts": {
    segment: "martial-arts",
    label: "Martial arts, dance and cheer",
    planningLeadDays: 90,
    commitLeadDays: 21,
    occasionNoun: "Test cycle",
    source:
      "California School of Martial Arts publishes colour and black belt tests every two months and Dan tests every six, approximately June and December. A studio owner is a single decision maker with no committee, so the commit lead is short.",
    provenance: "modeled",
  },
  "senior-living": {
    segment: "senior-living",
    label: "Senior living staff appreciation",
    planningLeadDays: 60,
    commitLeadDays: 21,
    occasionNoun: "Staff appreciation",
    source:
      "Read off a senior care operator's own reply in SEED_REPLIES, which asked for a weekday daytime staff appreciation for about forty split across two shifts. A rolling occasion tied to shift patterns rather than to a season.",
    provenance: "modeled",
  },
};

export const SEGMENT_ORDER: AccountSegment[] = [
  "corporate-holiday",
  "corporate-other",
  "grad-night",
  "school-programme",
  "youth-sports-banquet",
  "faith-group",
  "martial-arts",
  "senior-living",
];

// ---------------------------------------------------------------
// Reading the buying window
// ---------------------------------------------------------------

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTH_TOKENS: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  MONTH_NAMES.forEach((name, i) => {
    out[name.toLowerCase()] = i + 1;
    out[name.slice(0, 3).toLowerCase()] = i + 1;
  });
  out.sept = 9;
  return out;
})();

/**
 * A month named on its own anchors on the fourteenth.
 *
 * A `buyingWindow` that says "Dec" is a claim about a month and not
 * about a day, so the anchor sits in the middle of it and every surface
 * renders it as "mid Dec" rather than as a precision it has not earned.
 * The fourteenth rather than the fifteenth or the sixteenth because the
 * arithmetic has to land on one day and this is the one the research
 * ran its dates against; the value is exported so a reader can move it
 * and watch every window move with it.
 */
export const MID_MONTH_DAY = 14;

/**
 * A range anchors at the end of the first month it names.
 *
 * Thirty one is a nominal value and `isoOf` clamps it to whatever that
 * month is worth in the year the instance falls in, so February in a
 * leap year gets its twenty ninth without a special case. A range says
 * the occasion lands somewhere across those months, so the anchor sits
 * at the end of the first one: a window worked against the end of May is
 * still open for an occasion that turns out to fall in June, and a
 * window worked against the end of June has already closed on a May
 * date, which is the expensive way round.
 */
export const END_OF_MONTH_DAY = 31;

/**
 * A named occasion read out of a `buyingWindow` string.
 *
 * `basisClause` is the clause it was read from, verbatim, so a reader
 * can check the parse against the string rather than trusting it.
 */
export interface ParsedOccasion {
  /** The buyer's own words where the string gave any, else segment noun and month. */
  label: string;
  /** Months named, one-indexed, in the order the string named them. */
  months: number[];
  /** The month the occasion anchors in. */
  anchorMonth: number;
  /** The day of that month the occasion anchors on. */
  anchorDay: number;
  /** Whether the string named a range or a single month. */
  shape: "single-month" | "month-range";
  basisClause: string;
}

export type BuyingWindowParse =
  | {
      kind: "parsed";
      source: string;
      occasions: ParsedOccasion[];
      /** Clauses that named no month at the head. Kept so nothing is hidden. */
      ignoredClauses: string[];
      /** True where the string also said "year round". */
      alsoRolling: boolean;
    }
  | {
      kind: "no-cycle-recorded";
      source: string;
      /** Why, in one clause, for printing where the cycle would have gone. */
      because: string;
      ignoredClauses: string[];
      alsoRolling: boolean;
    };

/* A character no buying window string contains, used to hold a
   parenthetical out of the way while the string is split. */
const PLACEHOLDER = "\u0001";

/** Leading words that carry no occasion and can be stepped over. */
const LEAD_IN =
  /^(?:with|a|an|the|second|window|windows|in|on|plus|and|then|also|starting|from)\s+/i;

/** Any month, optionally as a range, at the head of a clause. */
const HEAD_MONTHS =
  /^([a-z]{3,9})(?:\s*(?:-|to|through|until|\/)\s*([a-z]{3,9}))?\b/i;

const ROLLING = /^year[\s-]?round\b/i;

/**
 * `buyingWindow` into dated occasions. Total by construction.
 *
 * THIS FUNCTION IS THE HEART OF THE BOARD AND IT IS ALSO THE PLACE IT
 * COULD MOST EASILY START LYING. Two hundred and eleven rows carry a
 * `buyingWindow` and they were written as prose for a human: "Jun +
 * Dec", "Nov-Dec, with a second window in Jan when their hall is booked
 * out", "Jan-Feb, their Nov-Dec being peak trading". The third of those
 * names two months and means one of them, and a parser that scrapes
 * every month token out of a string would have this venue phoning a
 * boba franchise in the middle of its busiest fortnight of the year
 * because the string mentioned November.
 *
 * So the rule is deliberately narrow: AN OCCASION IS NAMED AT THE HEAD
 * OF ITS OWN CLAUSE. Split on the separators a person actually types,
 * step over the connectives, and read a month only where the clause
 * opens with one. "their Nov-Dec being peak trading" opens with "their"
 * and is recorded as ignored rather than read. The cost is the opposite
 * error, an occasion buried mid sentence that the parser walks past, and
 * that is the right way round: a missed occasion is a row that does not
 * appear, and an invented one is a rep ringing a stranger about a party
 * that was never in the diary.
 *
 * NOTHING THROWS. A string it cannot read comes back as
 * `no-cycle-recorded` with the reason attached, and the screen prints
 * the reason where the cycle would have gone. That is the whole
 * difference between a model that degrades and one that guesses.
 */
export function parseBuyingWindow(
  source: string,
  options: { occasionNoun?: string } = {},
): BuyingWindowParse {
  const noun = options.occasionNoun ?? "Occasion";
  const raw = (source ?? "").trim();
  if (raw.length === 0) {
    return {
      kind: "no-cycle-recorded",
      source: raw,
      because: "no buying window is recorded against this organisation",
      ignoredClauses: [],
      alsoRolling: false,
    };
  }

  /* Parentheticals come out first and go back in afterwards. They are
     the buyer's own words and they contain the separators this function
     splits on: "May-Jun (8th grade promotion + spring season wrap)"
     splits into nonsense the moment a plus sign is treated as a divider
     everywhere it appears. */
  const held: string[] = [];
  const masked = raw.replace(/\(([^)]*)\)/g, (_all, inner: string) => {
    held.push(inner);
    return `${PLACEHOLDER}${held.length - 1}${PLACEHOLDER}`;
  });

  const clauses = masked
    .split(/[;,.]|\s+plus\s+|\s+and\s+|\s*\+\s*/i)
    .map((clause) =>
      clause.replace(
        new RegExp(`${PLACEHOLDER}(\\d+)${PLACEHOLDER}`, "g"),
        (_all, index: string) => `(${held[Number(index)] ?? ""})`,
      ),
    )
    .map((clause) => clause.trim())
    .filter((clause) => clause.length > 0);

  const occasions: ParsedOccasion[] = [];
  const ignoredClauses: string[] = [];
  let alsoRolling = false;

  for (const clause of clauses) {
    let head = clause;
    for (let step = 0; step < 8 && LEAD_IN.test(head); step += 1) {
      head = head.replace(LEAD_IN, "");
    }

    if (ROLLING.test(head)) {
      alsoRolling = true;
      continue;
    }

    const found = HEAD_MONTHS.exec(head);
    const first = found ? MONTH_TOKENS[(found[1] ?? "").toLowerCase()] : undefined;
    if (!found || !first) {
      ignoredClauses.push(clause);
      continue;
    }
    const second = found[2] ? MONTH_TOKENS[found[2].toLowerCase()] : undefined;

    const months = second ? [first, second] : [first];
    const shape: ParsedOccasion["shape"] = second ? "month-range" : "single-month";
    /* The two anchor rules and their reasoning are on MID_MONTH_DAY and
       END_OF_MONTH_DAY above, where a reader looking for the numbers
       will find them. */
    const anchorMonth = first;
    const anchorDay =
      shape === "month-range" ? END_OF_MONTH_DAY : MID_MONTH_DAY;

    const parenthetical = /\(([^)]*)\)/.exec(clause);
    const label = parenthetical
      ? (parenthetical[1] ?? "").trim()
      : `${noun}, ${MONTH_NAMES[first - 1]}`;

    if (occasions.some((o) => o.anchorMonth === anchorMonth)) {
      /* The same month twice in one string is one occasion described
         twice, not two. "Nov-Dec (holiday); Nov for the district" is a
         person writing the same party down from two angles. */
      ignoredClauses.push(clause);
      continue;
    }

    occasions.push({
      /* The first character only. A parenthetical is written mid
         sentence and becomes a heading here, so "end of year" would
         read as a typo on a chip, and "Teacher/Staff Appreciation Week"
         and "grad night" both have to survive untouched past the first
         letter because they are the buyer's own words. */
      label:
        label.length > 0
          ? label.charAt(0).toUpperCase() + label.slice(1)
          : `${noun}, ${MONTH_NAMES[first - 1]}`,
      months,
      anchorMonth,
      anchorDay,
      shape,
      basisClause: clause,
    });
  }

  if (occasions.length === 0) {
    return {
      kind: "no-cycle-recorded",
      source: raw,
      because: alsoRolling
        ? "the window is stated as year round, with no named month to anchor a cycle on"
        : "no clause in the window names a month at its head",
      ignoredClauses,
      alsoRolling,
    };
  }

  occasions.sort((a, b) => a.anchorMonth - b.anchorMonth);
  return { kind: "parsed", source: raw, occasions, ignoredClauses, alsoRolling };
}

/**
 * Days between one instance of an occasion and the next, per account.
 *
 * A named occasion comes round once a year, because a month does. The
 * ACCOUNT's purchase cadence is a different number: an organisation
 * holding three occasions buys roughly every four months, and that is
 * the figure the overdue ratio has to be divided by. Three hundred and
 * sixty five over the count of named occasions, which puts Team Kwon's
 * two at 183 days against the 180 the CalSMA six month Dan test cycle
 * implies, and Heights Christian's three at 122.
 *
 * THIS IS A DECLARED CYCLE AND IT SAYS SO EVERYWHERE IT RENDERS. The
 * moment two events have been delivered against the same occasion, the
 * median gap between them is an OBSERVED cycle and this function should
 * defer to it. That is a one line change here and a provenance badge on
 * screen, which is the same distinction this application already draws
 * between a published price and a price a person typed.
 */
export const OCCASION_RECURRENCE_DAYS = 365;

export function declaredCycleDays(occasionCount: number): number {
  if (occasionCount <= 0) return OCCASION_RECURRENCE_DAYS;
  return Math.round(OCCASION_RECURRENCE_DAYS / occasionCount);
}

// ---------------------------------------------------------------
// The account, the occasion and the window
// ---------------------------------------------------------------

/**
 * An organisation that has signed something.
 *
 * Identity is not copied. Name, address, lane, decision maker title and
 * geocode all resolve through `prospectId`, because two records of one
 * organisation is how a CRM ends up telling a rep to visit an address
 * the organisation left two years ago.
 */
export interface Account {
  id: string;
  prospectId: string;
  /** Which clock this organisation buys on. Drives both lead times. */
  segment: AccountSegment;
  /** Why it carries that segment, in one sentence. */
  segmentBasis: string;
  /** A role, never a person. Same rule as `ActivityLine.ownerRole`. */
  ownerRole: string;
  /**
   * The title that outlives the committee. A grad night chair turns over
   * every year by design and the assistant principal does not.
   */
  anchorTitle: string;
  /** An agreed term that survives one booking, where one exists at all. */
  standingTermId?: string;
  /** Where the balance sits. Referenced here, owned by finance. */
  balanceState: "settled" | "outstanding" | "not-applicable";
  /** Why the balance reads what it reads. */
  balanceBasis: string;
  provenance: Record<string, Provenance>;
}

/** One named thing an organisation does at a time of year. */
export interface Occasion {
  id: string;
  accountId: string;
  /** The buyer's own words wherever the seed gave any. */
  label: string;
  occasionClass: OccasionClass;
  /** Days between purchases for the whole account, not for this occasion. */
  cycleDays: number;
  cycleProvenance: "declared" | "observed";
  /** The string the cycle was read from, quoted so a reader can check it. */
  cycleBasis: string;
  segment: AccountSegment;
  planningLeadDays: number;
  commitLeadDays: number;
  /** The next instance, computed against `asOf`. */
  nextOccasionDate: string;
  nextOccasionProvenance: "declared" | "observed" | "confirmed-by-buyer";
  /** How the anchor date was arrived at, for the working to be shown. */
  anchorBasis: string;
  /** Signed lines that fall inside this occasion's own months. */
  lineIds: string[];
}

/** The window in which this occasion is either rebooked or missed. */
export interface RebookingWindow {
  occasionId: string;
  accountId: string;
  occasionDate: string;
  opensOn: string;
  closesOn: string;
  /** True where `asOf` sits inside the window. */
  open: boolean;
  /** Negative once the window has opened. */
  daysToOpen: number;
  /** Negative once the window has closed. */
  daysToClose: number;
  /** Set where a signed line already covers this instance. */
  signedLineId: string | null;
}

/** A window that closed with nothing signed. The churn event. */
export interface MissedWindow {
  accountId: string;
  occasionId: string;
  occasionLabel: string;
  closedOn: string;
  occasionDate: string;
  /** Null is honest. Sometimes nobody knows why. */
  reason: string | null;
  competitorNote?: string;
}

// ---------------------------------------------------------------
// Traces
// ---------------------------------------------------------------

/**
 * The five dated obligations around one event.
 *
 * Straight out of OPERA's Activity Trace Definition, which is the only
 * product in this category that has built the clock rather than a copy
 * button: a date field, a signed number of days either side of it, a
 * purpose, and an owner. Five fields, and every row below is an
 * instance of them.
 *
 * The day of trace carries an offset of zero on purpose. OPERA states
 * that leaving the offset blank "generates the activity with a start
 * date equal to the date in the Date Calculation field", and a host
 * standing at the door when the coach pulls in is the go-see with a
 * CURRENT customer that the posting's first daily responsibility names.
 * It is the anchor as well as a trace, which is why the four figures
 * that matter count the other four: four dated obligations per contract,
 * eight across the two contracts this venue has.
 */
export type TraceKind =
  | "confirm"
  | "host-on-the-day"
  | "debrief"
  | "review-ask"
  | "place-next";

export const TRACE_OFFSET_DAYS: Record<TraceKind, number> = {
  confirm: -1,
  "host-on-the-day": 0,
  debrief: 1,
  "review-ask": 7,
  "place-next": 14,
};

export const TRACE_ORDER: TraceKind[] = [
  "confirm",
  "host-on-the-day",
  "debrief",
  "review-ask",
  "place-next",
];

/**
 * The trace glyphs are the account family, arcs, and that is deliberate.
 *
 * `vocabulary.ts` sets the rule: one system, one shape family, so a
 * reader can tell which system a mark belongs to before they work out
 * which value it is. Traces and account states are one system, the
 * account clock, and they share the arcs for the same reason pitch
 * status and its short form share the filling circle. The label is
 * always beside the glyph, so a mark is never the only signal and the
 * colour is never the first one.
 */
export interface TraceMeta extends StatusToken {
  /** Whose job it is. Two systems owning one task is how both drop it. */
  ownerRole: string;
  /** False where this tool shows the row and must not let anybody tick it. */
  actionableHere: boolean;
  /** Why the offset is the number it is. */
  why: string;
}

export const TRACE_META: Record<TraceKind, TraceMeta> = {
  confirm: {
    glyph: "◜",
    label: "Confirm",
    cssVar: "var(--neutral)",
    ownerRole: "Operations",
    actionableHere: false,
    note: "Headcount, arrival time, allergies, lanes. The last operational check.",
    why: "Reference only. The account timeline is incomplete without it and it belongs to operations, so this board shows it and cannot tick it.",
  },
  "host-on-the-day": {
    glyph: "◠",
    label: "Host at arrival",
    cssVar: "var(--ledger-activity)",
    ownerRole: "Sales Manager",
    actionableHere: true,
    note: "Standing at the door when they arrive. A go-see with a customer who has already bought.",
    why: "Offset zero, which OPERA supports explicitly and which the posting asks for by name: go-sees with prospective and current customers.",
  },
  debrief: {
    glyph: "◡",
    label: "Debrief",
    cssVar: "var(--info)",
    ownerRole: "Sales Manager",
    actionableHere: true,
    note: "The thank you, and one recorded sentence on how it actually went.",
    why: "Plus one day. A rating out of five means nothing eleven months later; a sentence about two coaches arriving at once and nobody on the door tells the next manager what to fix and what to say in March.",
  },
  "review-ask": {
    glyph: "◞",
    label: "Review ask",
    cssVar: "var(--info)",
    ownerRole: "Sales Manager",
    actionableHere: true,
    note: "Ask for the review while the night is still recent enough to be worth reading.",
    why: "Plus seven days. BrightLocal's 2026 survey has 83 per cent of people asked to leave a review leaving one, and 32 per cent of readers looking for reviews written in the last fortnight. A review harvested six weeks late is worth materially less.",
  },
  "place-next": {
    glyph: "◟",
    label: "Place the next one",
    cssVar: "var(--ok)",
    ownerRole: "Sales Manager",
    actionableHere: true,
    note: "Name the next occasion in their words, offer a date, say what a hold costs.",
    why: "Plus fourteen days. Late enough that the debrief has come back, because asking for the next booking before you know how the last one went is how you find out in the worst possible way, and early enough that the night is still vivid.",
  },
};

export interface AccountTrace {
  id: string;
  accountId: string;
  kind: TraceKind;
  /** The date the obligation falls due. */
  on: string;
  /** The date it was anchored on. */
  anchorDate: string;
  offsetDays: number;
  /**
   * A contracted line, or an occasion this application projected. The
   * distinction is the honesty: one is a signature and the other is
   * arithmetic against a `buyingWindow` string.
   */
  basis: "contracted-event" | "projected-occasion";
  /** The line or occasion the anchor came from. */
  anchorId: string;
  occasionLabel: string | null;
  /** Negative once the date has passed. */
  daysAway: number;
  due: boolean;
}

// ---------------------------------------------------------------
// Health, as two readings that are never blended
// ---------------------------------------------------------------

/**
 * Purchase recency, normalised by the account's own cycle.
 *
 * CONTACT STALENESS PORTS FROM `partners.ts` VERBATIM AND PURCHASE
 * STALENESS CANNOT, and the arithmetic showing why is short. Run
 * `stalenessOf` on days since last purchase for a healthy school
 * account: thirty days in it reads cooling, ninety two days in it reads
 * cold, a hundred and twenty days in it reads gone quiet, and their next
 * occasion is still two months away and entirely on schedule. The bucket
 * is red for eight months of a relationship that is working and it is
 * still red on the day the relationship actually breaks. A signal that
 * is on all the time is worse than no signal, because it teaches the
 * reader to ignore the column.
 *
 * The fix is one division. Days since the last event over the days that
 * account's own cycle says should pass. Set against the forty day rhythm
 * that `partners.ts` implicitly assumes, these four boundaries land at
 * 30, 40 and 50 days, which is to say THE PARTNERS MODEL IS THIS MODEL
 * for a population where every counterparty shares one tempo. It was
 * never wrong. It was correct about suppliers, who all buy at roughly
 * the same rate, and customers do not.
 */
export const OVERDUE_RATIO = {
  windowOpen: 0.75,
  overdue: 1.0,
  lapsed: 1.25,
} as const;

export type CycleState =
  | "not-yet-delivered"
  | "on-cycle"
  | "window-open"
  | "overdue"
  | "lapsed";

export function cycleStateOf(overdueRatio: number | null): CycleState {
  if (overdueRatio === null) return "not-yet-delivered";
  if (overdueRatio > OVERDUE_RATIO.lapsed) return "lapsed";
  if (overdueRatio > OVERDUE_RATIO.overdue) return "overdue";
  if (overdueRatio >= OVERDUE_RATIO.windowOpen) return "window-open";
  return "on-cycle";
}

export const CYCLE_STATE_META: Record<CycleState, StatusToken> = {
  "not-yet-delivered": {
    glyph: "○",
    label: "No event delivered",
    cssVar: "var(--neutral)",
    note: "Nothing has run yet, so there is no purchase recency to read. This is not zero days and must never render as zero.",
  },
  "on-cycle": {
    glyph: "◜",
    label: "On cycle",
    cssVar: "var(--ok)",
    note: "Under three quarters of their own cycle since the last event. Nothing is due, so this generates no work.",
  },
  "window-open": {
    glyph: "◠",
    label: "Window open",
    cssVar: "var(--info)",
    note: "Three quarters of a cycle through. The next occasion is inside its planning lead. The only bucket that generates work.",
  },
  overdue: {
    glyph: "◞",
    label: "Overdue",
    cssVar: "var(--warn)",
    note: "Past a full cycle. The month they normally buy has gone by with nothing signed.",
  },
  lapsed: {
    glyph: "✕",
    label: "Lapsed",
    cssVar: "var(--risk)",
    note: "A quarter of a cycle past due. Win back is a different motion with different words.",
  },
};

export type PurchaseReading =
  | {
      kind: "not-yet-delivered";
      /** Why there is no figure, in one clause. */
      because: string;
      /** The date this reading first has a number in it. */
      firstReadsOn: string | null;
      cycleDays: number;
      cycleProvenance: "declared" | "observed";
      cycleState: "not-yet-delivered";
    }
  | {
      kind: "measured";
      lastDeliveredOn: string;
      daysSinceLast: number;
      cycleDays: number;
      cycleProvenance: "declared" | "observed";
      overdueRatio: number;
      cycleState: CycleState;
    };

// ---------------------------------------------------------------
// Account state
// ---------------------------------------------------------------

/**
 * Five states, and three of them cannot be reached yet.
 *
 * THIS IS NOT `PitchStatus` AND IT MUST NEVER BECOME PART OF IT. Those
 * six are drawn as a filling circle because progress through a pipeline
 * is a quantity, and adding `delivered` after `booked` would make the
 * disc keep filling after it is full and would quietly redefine `booked`
 * from "signed with a deposit" to "not yet delivered" on every screen
 * that renders it. An account is a different object with a different
 * life: cyclical rather than progressive, and it can come back.
 *
 * So this is a FOURTH GLYPH FAMILY, arcs, distinct from the filling
 * circles of pitch status, the pointed marks of lanes and the patterned
 * squares of package family. A reader can tell which system a mark
 * belongs to before they work out which value it is, and every one of
 * them survives greyscale.
 */
export type AccountState =
  | "awaiting-delivery"
  | "delivered"
  | "window-open"
  | "at-risk"
  | "lapsed";

export const ACCOUNT_STATE_META: Record<AccountState, StatusToken> = {
  "awaiting-delivery": {
    glyph: "◜",
    label: "Awaiting delivery",
    cssVar: "var(--info)",
    note: "Signed, and the event is still in front of us. Every account this venue has is here, because the venue has not opened.",
  },
  delivered: {
    glyph: "◠",
    label: "Delivered",
    cssVar: "var(--ok)",
    note: "An event has run. The debrief, the review ask and the next ask are all dated from it.",
  },
  "window-open": {
    glyph: "◡",
    label: "Window open",
    cssVar: "var(--warn)",
    note: "A rebooking window is open right now. This is the only state that is asking for work today.",
  },
  "at-risk": {
    glyph: "◞",
    label: "At risk",
    cssVar: "var(--warn)",
    note: "One window opened, closed, and nothing was signed. They had an occasion and they spent the money somewhere.",
  },
  lapsed: {
    glyph: "✕",
    label: "Lapsed",
    cssVar: "var(--risk)",
    note: "Two windows missed. Win back rather than nurture, and it is a different conversation.",
  },
};

export const ACCOUNT_STATE_ORDER: AccountState[] = [
  "lapsed",
  "at-risk",
  "window-open",
  "delivered",
  "awaiting-delivery",
];

// ---------------------------------------------------------------
// Figures that have no denominator yet
// ---------------------------------------------------------------

/**
 * A rate that cannot be computed, as a state rather than as a zero.
 *
 * Same shape and same reason as `BowlerAverage` in `domain/cup.ts`. It
 * is not `number | null`, because a nullable number invites a `?? 0`
 * somewhere downstream and a rebooking rate of 0% on the day the board
 * opens is a lie with a percentage sign on it. Nothing has closed, so
 * nothing has been missed, and the honest reading is a sentence with a
 * date in it rather than a figure.
 *
 * The union is the guarantee: a screen has to narrow on `kind` before it
 * can reach a number, and the day the first window closes the second arm
 * starts appearing with no component needing to be told.
 */
export interface NotMeasurable {
  kind: "not-measurable";
  /** The denominator, which is honestly zero. */
  denominator: 0;
  /** Why there is no figure, in one clause. */
  because: string;
}

export interface MeasuredFigure {
  kind: "measured";
  numerator: number;
  denominator: number;
  /** Numerator over denominator, guaranteed finite because the denominator is not zero. */
  value: number;
}

export type AccountFigure = NotMeasurable | MeasuredFigure;

/**
 * The one place a rate is built, so the zero denominator is handled once.
 *
 * Every rate on this board goes through here. That is the whole defence
 * against a NaN or an Infinity reaching a screen: there is no other
 * division in the accounts code that produces a figure a component can
 * render.
 */
export function figureOf(
  numerator: number,
  denominator: number,
  because: string,
): AccountFigure {
  if (!Number.isFinite(denominator) || denominator <= 0) {
    return { kind: "not-measurable", denominator: 0, because };
  }
  return {
    kind: "measured",
    numerator,
    denominator,
    value: numerator / denominator,
  };
}

export type AccountMetricId =
  | "rebooking-rate"
  | "accounts-on-cycle"
  | "revenue-retained"
  | "events-per-account";

export interface AccountMetric {
  id: AccountMetricId;
  label: string;
  /** The formula, printed on the tile. A figure whose arithmetic is hidden is a claim. */
  formula: string;
  figure: AccountFigure;
  /** How to read the measured value: a share of one, or a count. */
  unit: "share" | "count";
  /** The date this figure first has a denominator, where one can be computed. */
  firstReadsOn: string | null;
  /** What happens on that date, in one line. */
  firstReadsNote: string;
  provenance: Provenance;
  /** Where the numbers came from, named. */
  source: string;
}
