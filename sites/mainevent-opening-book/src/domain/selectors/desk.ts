import type { Lane, PitchStatus, Prospect } from "@/domain/types";
import { PROSPECTS } from "@/data/prospects";
import { PACKAGE_BY_ID } from "@/data/packages";
import { LANE_META, LANE_ORDER, lanesForGuests } from "@/domain/lanes";
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
 * A pre-opening trade area has two hundred and eleven organisations in
 * it and one person working them. Sorting alphabetically, or by distance,
 * or by Google rating, all produce a list that looks organised and
 * wastes the week. The four things that actually decide what to do
 * first are:
 *
 *   1. CAN I REACH THEM AT ALL? An organisation that publishes the
 *      decision maker's email is worth several that do not, because the
 *      cost of a touch is two minutes rather than a forty minute round
 *      trip. This is weighted heaviest and it is the least romantic
 *      criterion in the list.
 *
 *   2. DOES THEIR EVENT EXIST WITHOUT ME? A graduating class graduates
 *      whether or not anyone calls it. That certainty is the only asset
 *      a venue with no building has, so calendar-locked buyers outrank
 *      discretionary ones.
 *
 *   3. IS THE WINDOW OPEN? A buying window that closes inside this
 *      period is worth more than a bigger one that opens in March. Miss
 *      a grad night and you have missed a year.
 *
 *   4. HOW BIG IS IT? Last, and deliberately last. Headcount is the
 *      number everybody sorts by and it is the one most likely to be
 *      wrong, because every headcount in this data set is a modeled
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
  packageId: string;
  status: PitchStatus;
  touches: number;
  score: number;
  components: ScoreComponent[];
  /** Straight-line miles from 245 W Birch Street. */
  miles: number;
  /** The next thing to actually do, in plain words. */
  nextAction: string;
  /** Bowling lanes this booking would consume at the midpoint headcount. */
  lanesAtMidpoint: number;
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
 * Months in which a buying window is open, parsed out of the window
 * string on the prospect.
 *
 * The strings are things like "May-Jun (grad night), Nov + Mar" and they
 * were written by the research pass rather than picked from a dropdown.
 * Parsing prose is ugly. The alternative was to throw away the reasoning
 * attached to each window and keep a bare month number, and the
 * reasoning is the part a reader can argue with.
 */
const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

export function windowMonths(buyingWindow: string): number[] {
  const s = buyingWindow.toLowerCase();
  const hits = new Set<number>();
  MONTHS.forEach((m, i) => {
    if (s.includes(m)) hits.add(i);
  });
  return [...hits].sort((a, b) => a - b);
}

/**
 * Is a buying window open within the next `horizonMonths` from `now`?
 *
 * Outreach leads the window. A grad night decided in autumn is contacted
 * in autumn, not in June, so the horizon is generous on purpose.
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
      ? "Their event happens whether or not anyone calls. Only the venue is in question."
      : "Somebody has to decide there will be an event at all, which is a longer conversation.",
  });

  const openSoon = windowOpensWithin(p.buyingWindow, nowMonth, 4);
  components.push({
    label: openSoon ? "Window open" : "Window later",
    points: openSoon ? 20 : 4,
    why: openSoon
      ? `Buys in ${p.buyingWindow}, which is inside the next four months.`
      : `Buys in ${p.buyingWindow || "no window on record"}, which is further out than this period reaches.`,
  });

  /* Size last, and capped, because every headcount here is a modeled
     range. A criterion built on the softest data in the set should not
     be allowed to dominate one built on a published email address. */
  const mid = (p.headcountLow + p.headcountHigh) / 2;
  const sizePoints = Math.min(15, Math.round(mid / 20));
  components.push({
    label: "Likely size",
    points: sizePoints,
    why: `Modeled at ${p.headcountLow} to ${p.headcountHigh} guests. Capped at 15 points because this is the softest figure on the row.`,
  });

  const touches = touchesFor(state, p.id);
  if (touches >= 3) {
    components.push({
      label: "Already worked",
      points: -10,
      why: `${touches} touches already made. A fifth email is a spam complaint; this one wants a visit or a rest.`,
    });
  }

  const score = components.reduce((n, c) => n + c.points, 0);
  return { score, components };
}

function nextActionFor(p: Prospect, status: PitchStatus, touches: number): string {
  if (status === "booked") return "Booked. Confirm the run sheet four weeks out.";
  if (status === "lost")
    return "Lost this occasion. Diary the next window rather than the next email.";
  if (status === "soft-hold")
    return "Date held, nothing signed. Convert it or release it before someone else asks for the date.";
  if (status === "conversation")
    return `Live conversation. Send the ${PACKAGE_BY_ID[p.leadPackageId]?.name ?? "package"} quote and name a date.`;
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
    const mid = Math.round((p.headcountLow + p.headcountHigh) / 2);
    return {
      prospect: p,
      packageId: p.leadPackageId,
      status,
      touches,
      score,
      components,
      miles: milesFromVenue(p.lat, p.lng),
      nextAction: nextActionFor(p, status, touches),
      lanesAtMidpoint: lanesForGuests(mid),
    };
  });

  /* Booked and lost drop to the bottom. They are not work to be done,
     and a desk that keeps showing you the party you already sold is a
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
