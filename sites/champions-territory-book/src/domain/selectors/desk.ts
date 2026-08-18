import { groupProfile, leadPackage } from "@/domain/booking";
import type { Lane, PitchStatus, Prospect } from "@/domain/types";
import { PROSPECTS } from "@/data/prospects";
import { LANE_META, LANE_ORDER, crewSlotsForDoors } from "@/domain/lanes";
import { VENUE } from "@/data/venue";
import {
  furthestStatus,
  touchesFor,
  type PipelineState,
} from "@/state/PipelineProvider";

/**
 * THE DESK. Who to contact today, and why that one.
 *
 * This is the front door of the application, and the ordering function
 * below is the most opinionated thing in it. Everything else displays
 * facts; this decides what matters.
 *
 * A territory with no CRM history in it has three hundred and twenty nine
 * organisations on the board and one person working them. Sorting
 * alphabetically, or by distance, or by Google rating, all produce a list
 * that looks organised and wastes the week. The four things that actually
 * decide what to do first are:
 *
 *   1. CAN I REACH THEM AT ALL? An organisation that publishes the
 *      decision maker's email is worth several that do not, because the
 *      cost of a touch is two minutes rather than a forty minute round
 *      trip. This is weighted heaviest and it is the least romantic
 *      criterion in the list.
 *
 *   2. DOES THE DEMAND EXIST WITHOUT ME? A furnace that has not run
 *      since March gets switched on in November whoever calls first.
 *      That certainty is the strongest asset a local brand has, so
 *      calendar-locked service lines outrank discretionary ones.
 *
 *   3. IS THE WINDOW OPEN? A buying window that closes inside this
 *      period is worth more than a bigger one that opens in March. Miss
 *      the pre-season walkthrough and you have missed a heating season.
 *
 *   4. HOW BIG IS IT? Last, and deliberately last. Door count is the
 *      number everybody sorts by and it is the one most likely to be
 *      wrong, because every door count in this data set is a modeled
 *      range rather than a measurement.
 *
 * Every row on the desk shows its own score breakdown. A ranking a
 * reader cannot interrogate is a ranking they are being asked to take on
 * faith, and the whole argument of this prototype is that they should
 * not have to.
 */

export interface ScoreComponent {
  label: string;
  points: number;
  why: string;
}

export interface DeskLine {
  prospect: Prospect;
  /** Absent on rows that are not group booking prospects at all. */
  packageId?: string;
  status: PitchStatus;
  touches: number;
  score: number;
  components: ScoreComponent[];
  /** Straight-line miles from 625 Columbia St, Brea. */
  miles: number;
  /** The next thing to actually do, in plain words. */
  nextAction: string;
  /**
   * Crew slots this account would consume at the midpoint door count, or
   * null where the row carries no door count because it is a competitor or
   * one of the division's own brands. Null rather than zero: see
   * domain/booking.ts.
   */
  lanesAtMidpoint: number | null;
}

/** Straight-line miles. Named as such everywhere it is shown. */
export function milesFromVenue(lat: number, lng: number): number {
  const R = 3958.8;
  const p1 = (VENUE.lat * Math.PI) / 180;
  const p2 = (lat * Math.PI) / 180;
  const dp = ((lat - VENUE.lat) * Math.PI) / 180;
  const dl = ((lng - VENUE.lng) * Math.PI) / 180;
  const a =
    Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}


/**
 * The month words, in the spellings a buying window is actually written
 * in. Both the abbreviation and the full name, because the board carries
 * "Jan-Mar" on one row and "September" on another.
 */
const MONTH_WORDS: string[][] = [
  ["january", "jan"],
  ["february", "feb"],
  ["march", "mar"],
  ["april", "apr"],
  ["may"],
  ["june", "jun"],
  ["july", "jul"],
  ["august", "aug"],
  ["september", "sept", "sep"],
  ["october", "oct"],
  ["november", "nov"],
  ["december", "dec"],
];

/**
 * A WORD BOUNDARY, AND THE TWO ROWS THAT PROVE IT HAS TO BE THERE.
 *
 * This read `s.includes(m)` against three letter stems, which is a
 * substring match, and a substring match finds months inside words that
 * are not months. Two rows in the 329 were wrong because of it, and both
 * were found by running the matcher over the whole board rather than by
 * reading it:
 *
 *   24-hour-fitness-brea  "...when a gym's whole MARketing year turns
 *                          over" took March.
 *   rotary-club-of-brea   "Jan-Mar (MAYor's Cup build-up)..." took May.
 *
 * Neither is a typo in the data. The data is right and the reader was
 * wrong, which is the worse of the two because it is invisible: the row
 * still looked correct on screen, and the false month fed
 * `windowOpensWithin`, which feeds a twenty point criterion in
 * `scoreProspect`, which is the order the board is sorted in. A scoring
 * input that is wrong on two rows out of three hundred and twenty nine is not a
 * disaster and it is exactly the kind of thing that never gets found,
 * because nothing about it looks broken.
 *
 * The fix is a boundary on both ends. "Mayor" no longer contains May
 * because the letter after it is a word character; "Jan-Mar" still yields
 * both because a hyphen is not.
 *
 * WHAT THIS DELIBERATELY STILL DOES NOT DO. It does not parse ranges. A
 * window of "Jan-Mar" yields January and March and not February, which is
 * the behaviour that shipped and the behaviour every figure on the board
 * was computed against. Widening it to fill ranges would change counts on
 * six screens, and that is a separate decision with its own before and
 * after, not a bug fix riding along inside one.
 */
const MONTH_PATTERN = new RegExp(
  `\\b(?:${MONTH_WORDS.flat().join("|")})\\b`,
  "g",
);

export function windowMonths(buyingWindow: string): number[] {
  const s = buyingWindow.toLowerCase();
  const hits = new Set<number>();
  for (const word of s.match(MONTH_PATTERN) ?? []) {
    const i = MONTH_WORDS.findIndex((names) => names.includes(word));
    if (i >= 0) hits.add(i);
  }
  return [...hits].sort((a, b) => a - b);
}

/**
 * Is a buying window open within the next `horizonMonths` from `now`?
 *
 * Outreach leads the window. A heating contract decided in September is
 * worked in August, not in November, so the horizon is generous on purpose.
 */
export function windowOpensWithin(
  buyingWindow: string,
  fromMonth: number,
  horizonMonths: number,
): boolean {
  const months = windowMonths(buyingWindow);
  if (months.length === 0) return false;
  return months.some((m) => {
    const delta = (m - fromMonth + 12) % 12;
    return delta <= horizonMonths;
  });
}

const REACHABILITY_POINTS = {
  verified_public: 40,
  form_only: 15,
  none: 8,
} as const;

export function scoreProspect(
  p: Prospect,
  state: PipelineState,
  nowMonth: number,
): { score: number; components: ScoreComponent[] } {
  const components: ScoreComponent[] = [];

  components.push({
    label: "Reachable",
    points: REACHABILITY_POINTS[p.emailConfidence],
    why:
      p.emailConfidence === "verified_public"
        ? "Publishes an email we read off their own site, so a touch costs two minutes."
        : p.emailConfidence === "form_only"
          ? "Contact form only. A written touch is possible but lands in a queue."
          : "No written door. This one is a visit, which costs an hour of the week.",
  });

  const locked = LANE_META[p.lane].occasionClass === "calendar-locked";
  components.push({
    label: locked ? "Calendar-locked" : "Discretionary",
    points: locked ? 25 : 8,
    why: locked
      ? "The work happens whether or not anyone calls. Only the contractor is in question."
      : "Somebody has to decide the work is worth doing at all, which is a longer conversation.",
  });

  const openSoon = windowOpensWithin(p.buyingWindow, nowMonth, 4);
  components.push({
    label: openSoon ? "Window open" : "Window later",
    points: openSoon ? 20 : 4,
    why: openSoon
      ? `Buys in ${p.buyingWindow}, which is inside the next four months.`
      : `Buys in ${p.buyingWindow || "no window on record"}, which is further out than this period reaches.`,
  });

  /* Size last, and capped, because every door count here is a modeled
     range. A criterion built on the softest data in the set should not
     be allowed to dominate one built on a published email address. */
  const group = groupProfile(p);
  const sizePoints = group ? Math.min(15, Math.round(group.mid / 20)) : 0;
  components.push({
    label: group ? "Likely size" : "No group profile",
    points: sizePoints,
    why: group
      ? `Modeled at ${group.low} to ${group.high} doors. Capped at 15 points because this is the softest figure on the row.`
      : "This row is a competitor or an operating brand rather than an account we could serve, so the size criterion does not apply and scores nothing.",
  });

  const touches = touchesFor(state, p.id);
  if (touches >= 3) {
    components.push({
      label: "Already worked",
      points: -10,
      why: `${touches} touches already made. A fourth email is a spam complaint; this one wants a visit or a rest.`,
    });
  }

  const score = components.reduce((n, c) => n + c.points, 0);
  return { score, components };
}

function nextActionFor(p: Prospect, status: PitchStatus, touches: number): string {
  if (status === "booked") return "Signed. Confirm the schedule with dispatch four weeks out.";
  if (status === "lost")
    return "Lost this round. Diary the next buying window rather than the next email.";
  if (status === "soft-hold")
    return "Verbal yes, nothing signed. Get it in writing or release it before the window closes.";
  if (status === "conversation")
    return `Live conversation. Send the ${leadPackage(p)?.name ?? "offer"} proposal and name a date.`;
  if (touches >= 2 && p.emailConfidence !== "none")
    return "Two touches, no reply. Stop writing and go and stand in their reception.";
  if (p.emailConfidence === "verified_public")
    return `Email the ${p.decisionMakerTitle.toLowerCase()} at ${p.email}.`;
  if (p.emailConfidence === "form_only")
    return `No published address. Submit the contact form, then call the ${p.decisionMakerTitle.toLowerCase()}.`;
  return `No written door. Add to the next go-see run and ask for the ${p.decisionMakerTitle.toLowerCase()}.`;
}

export interface DeskOptions {
  /** 0 to 11. Injected rather than read from the clock so the desk is
   *  reproducible in a screenshot. */
  nowMonth: number;
  limit?: number;
}

export function deskLines(
  state: PipelineState,
  { nowMonth, limit }: DeskOptions,
): DeskLine[] {
  const q = state.query.trim().toLowerCase();

  const rows = PROSPECTS.filter((p) => {
    if (state.laneFilter.length > 0 && !state.laneFilter.includes(p.lane))
      return false;
    if (state.emailableOnly && p.emailConfidence !== "verified_public")
      return false;
    if (q) {
      const hay = `${p.name} ${p.city} ${p.decisionMakerTitle}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }).map<DeskLine>((p) => {
    const status = furthestStatus(state, p.id);
    const touches = touchesFor(state, p.id);
    const { score, components } = scoreProspect(p, state, nowMonth);
    const group = groupProfile(p);
    return {
      prospect: p,
      packageId: p.leadPackageId,
      status,
      touches,
      score,
      components,
      miles: milesFromVenue(p.lat, p.lng),
      nextAction: nextActionFor(p, status, touches),
      lanesAtMidpoint: group ? crewSlotsForDoors(group.mid) : null,
    };
  });

  /* Signed and lost drop to the bottom. They are not work to be done,
     and a desk that keeps showing you the account you already won is a
     desk people stop reading. */
  const weight = (s: PitchStatus) => (s === "booked" || s === "lost" ? -1000 : 0);

  rows.sort(
    (a, b) => b.score + weight(b.status) - (a.score + weight(a.status)),
  );

  return limit ? rows.slice(0, limit) : rows;
}

/**
 * How many organisations sit in each lane.
 *
 * The parameter is unused and it is kept, prefixed, because this counts
 * the TRADE AREA rather than the filtered board. A lane count that shrank
 * when somebody ticked a filter would make the lane board disagree with
 * itself: the point of that screen is how much of each channel exists,
 * not how much of it is currently on screen. Dropping the parameter would
 * have been tidier and would have made every call site read as though the
 * two were the same thing.
 */
export function laneCounts(_state: PipelineState): Record<Lane, number> {
  /* Seeded from LANE_ORDER rather than from a hand-written literal.
     The literal that used to live here listed eight keys and was
     asserted into shape with `as`, which meant the ninth lane compiled
     cleanly and then counted `undefined + 1` at runtime. Building the
     zeroes from the lane list is the version a tenth lane cannot
     silently break. */
  const out = Object.fromEntries(LANE_ORDER.map((lane) => [lane, 0])) as Record<
    Lane,
    number
  >;
  for (const p of PROSPECTS) out[p.lane] += 1;
  return out;
}

export function unworkedCount(state: PipelineState): number {
  return PROSPECTS.filter((p) => furthestStatus(state, p.id) === "unworked")
    .length;
}

export function liveConversationCount(state: PipelineState): number {
  return PROSPECTS.filter((p) => {
    const s = furthestStatus(state, p.id);
    return s === "conversation" || s === "soft-hold";
  }).length;
}

export function emailableCount(): number {
  return PROSPECTS.filter((p) => p.emailConfidence === "verified_public").length;
}

export function doorOnlyCount(): number {
  return PROSPECTS.filter((p) => p.emailConfidence === "none").length;
}
