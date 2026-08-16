import type { Lane, OccasionClass } from "@/domain/types";

/**
 * One home for everything a lane means.
 *
 * WHY THIS FILE EXISTS. In the build this was forked from, the label for
 * a channel lived in one component, its glyph next to the label, its
 * behaviour in a chain of ternaries, and whether it was a bar or a shop
 * was something each call site worked out for itself by pattern-matching
 * on a string. Five files knew four different amounts about the same
 * nine values.
 *
 * The failure that produces is not a crash. It is a screen that says
 * "Youth sports" in one place and "Sports" in another, and a filter that
 * quietly treats a dojang as a corporate account because whoever wrote
 * the ternary listed the four lanes they happened to remember.
 *
 * So: the lane is declared once, with everything that is true about it.
 *
 * `doorName` earns its place for the same reason `setName` did there. You
 * do not "call the buyer" at a high school, you email an ASSISTANT
 * PRINCIPAL FOR ACTIVITIES whose name is on a public staff directory,
 * and a screen that uses the corporate word at a school tells a hiring
 * manager the model does not really distinguish the two.
 */

export interface LaneMeta {
  label: string;
  /** For a dense row where the full label will not fit. */
  short: string;
  /** Shape before hue, always. The card is identifiable in greyscale. */
  glyph: string;
  occasionClass: OccasionClass;
  /** What the way in is actually called in this lane. */
  doorName: string;
  /**
   * The same thing in one word, for the middle of a sentence.
   *
   * "Nothing through the published staff directory" is a real phrase and
   * a terrible clause. `doorName` is a heading; this is what a rep would
   * say out loud, and a sentence that reads as though a program
   * assembled it is a sentence a reader can tell was assembled by a
   * program.
   */
  doorNoun: string;
  /** How this lane actually trades. Shown in the drawer. */
  note: string;
  /**
   * The single hardest thing about this lane before the doors open.
   *
   * Every lane has one, they are all different, and naming them is the
   * difference between a list of categories and a plan.
   */
  preOpeningProblem: string;
  cssVar: string;
  tintVar: string;
}

export const LANE_META: Record<Lane, LaneMeta> = {
  // --- Calendar-locked: the date buys, not the buyer -----------------
  schools: {
    label: "Schools and districts",
    short: "Schools",
    glyph: "▲",
    occasionClass: "calendar-locked",
    doorName: "Published staff directory",
    doorNoun: "directory",
    note: "The most reachable lane in the trade area and the least worked. A public school district publishes the name, title and email of the exact person who owns grad night, and that person usually owns every team banquet too. One email, one decision, one calendar that repeats every year for as long as the school exists.",
    preOpeningProblem:
      "The buying window is fixed and it is early. Grad night for June is decided in autumn, so a venue that opens without a spring outreach push has missed a full year of the single biggest youth occasion there is.",
    cssVar: "var(--lane-schools)",
    tintVar: "var(--lane-schools-tint)",
  },
  colleges: {
    label: "Colleges and universities",
    short: "Colleges",
    glyph: "◭",
    occasionClass: "calendar-locked",
    doorName: "Student life office",
    doorNoun: "student life office",
    note: "One campus is not one customer. Cal State Fullerton alone contains hundreds of recognised student organisations, greek chapters and athletic teams, each with its own small budget and its own reason to go somewhere. The student life office is the door to all of them at once.",
    preOpeningProblem:
      "Officers turn over every year, so a relationship built with a chapter president in March is gone by September. The durable relationship is with the staff advisor, not the student.",
    cssVar: "var(--lane-colleges)",
    tintVar: "var(--lane-colleges-tint)",
  },
  "fitness-youth-sports": {
    label: "Fitness and youth sports",
    short: "Youth sports",
    glyph: "◮",
    occasionClass: "calendar-locked",
    doorName: "Owner or head coach",
    doorNoun: "front desk",
    note: "A season ends, and when it ends everybody goes somewhere. Dojangs, travel teams, cheer gyms and club programmes run on a cycle that produces a banquet two or three times a year without anybody deciding to have one. The owner is usually the buyer and is usually standing at the desk.",
    preOpeningProblem:
      "These are small buyers, twenty to eighty guests, and each booking is worth little on its own. The lane only pays if it is worked as a set rather than one gym at a time.",
    cssVar: "var(--lane-fitness)",
    tintVar: "var(--lane-fitness-tint)",
  },

  // --- Discretionary: somebody chooses -------------------------------
  corporate: {
    label: "Corporate and employers",
    short: "Corporate",
    glyph: "■",
    occasionClass: "discretionary",
    doorName: "HR or office manager",
    doorNoun: "front office",
    note: "The highest value per booking and the slowest to reach. Brea's employer base is concentrated on a handful of streets, which means a tabling shift in one lobby at lunchtime reaches more decision makers than a week of calls.",
    preOpeningProblem:
      "Nobody signs a holiday party contract with a venue they cannot walk. Before the doors open, the corporate ask is not a booking, it is a place in line and a date held.",
    cssVar: "var(--lane-corporate)",
    tintVar: "var(--lane-corporate-tint)",
  },
  "auto-finance": {
    label: "Auto, finance and real estate",
    short: "Auto and finance",
    glyph: "◧",
    occasionClass: "discretionary",
    doorName: "Sales manager or broker",
    doorNoun: "showroom floor",
    note: "Commission businesses run on incentives and client appreciation, so they buy group nights twice: once to reward the team and once to entertain the customers. They also decide fast, because the person who signs is on the floor rather than three approvals away.",
    preOpeningProblem:
      "They are sold to constantly and by everybody. A generic approach is deleted. The one that lands names their December sales push, not their staff morale.",
    cssVar: "var(--lane-auto)",
    tintVar: "var(--lane-auto-tint)",
  },
  "hospitality-civic": {
    label: "Hotels, chambers and civic",
    short: "Hospitality",
    glyph: "◍",
    occasionClass: "discretionary",
    doorName: "Membership or sales director",
    doorNoun: "membership desk",
    note: "The referral lane, and the only one that multiplies. A chamber of commerce is not a large booking; it is a room full of every other lane on this board, standing together, once a month. A hotel sales director is asked for group activity recommendations by people who have already decided to spend money.",
    preOpeningProblem:
      "A referral partner will not recommend a venue they have not seen. This lane converts on the tour, so it is worth almost nothing until there is a building, and worth a great deal the week there is.",
    cssVar: "var(--lane-hospitality)",
    tintVar: "var(--lane-hospitality-tint)",
  },
  "faith-nonprofit": {
    label: "Faith and nonprofit",
    short: "Faith and nonprofit",
    glyph: "◇",
    occasionClass: "discretionary",
    doorName: "Youth pastor or programme director",
    doorNoun: "church office",
    note: "Large recurring youth groups with a genuine need for somewhere safe, indoors and supervised to take fifty teenagers on a Friday. Main Event publishes a Spirit Night fundraiser that donates twenty percent of sales back to a nonprofit, which turns this lane from a sale into an offer.",
    preOpeningProblem:
      "Budgets are small and the calendar is set by a volunteer committee. The fundraiser mechanic is the way in, not the party package.",
    cssVar: "var(--lane-faith)",
    tintVar: "var(--lane-faith-tint)",
  },
  healthcare: {
    label: "Healthcare and senior care",
    short: "Healthcare",
    glyph: "◈",
    occasionClass: "discretionary",
    doorName: "Practice or office manager",
    doorNoun: "practice manager",
    note: "Dense, close, and almost never prospected by entertainment venues. A clinic of forty staff who cannot all leave at once buys two smaller weekday events rather than one large one, which is exactly the midweek daytime inventory a venue struggles to fill.",
    preOpeningProblem:
      "The practice manager is the buyer and is the hardest person in the building to get on the phone. This lane is a go-see lane, not a call lane.",
    cssVar: "var(--lane-healthcare)",
    tintVar: "var(--lane-healthcare-tint)",
  },
  "local-retail-food": {
    label: "Local retail and food",
    short: "Local retail",
    glyph: "◫",
    occasionClass: "discretionary",
    doorName: "Owner or store manager",
    doorNoun: "counter",
    note: "Six to seventy staff, and the person who decides is standing behind the counter. Boba shops, small food franchises, mall tenants and independent restaurants have no HR department, no committee and no procurement process; the owner hears the ask, does the arithmetic in their head and answers the same afternoon. Every booking is small and fourteen of the fifteen sit within a mile of the venue, which is a tighter cluster than any other lane on the board and what makes this a route rather than a set of accounts.",
    preOpeningProblem:
      "They do not publish an email. Of the forty five local retail, food and auto organisations researched for this trade area, eight published an email address that could be read off their own page; franchise retail routes everything through a corporate form and a chain store number has no inbox behind it at all. So this is a go-see lane by nature rather than by preference. The only door is the door, and the crews who work it are on shift in the evening, which is the one time a rep is not.",
    cssVar: "var(--lane-local-retail-food)",
    tintVar: "var(--lane-local-retail-food-tint)",
  },
};

export const OCCASION_CLASS_META: Record<
  OccasionClass,
  { label: string; short: string; glyph: string; what: string; when: string }
> = {
  "calendar-locked": {
    label: "Calendar-locked buyers",
    short: "Calendar",
    glyph: "▲",
    what: "Organisations whose event exists because the calendar says so. A graduation, a season ending, a term finishing. The occasion is certain; only the venue is in question.",
    when: "Worked backwards from a fixed date, months ahead. Miss the window and there is no second chance until next year.",
  },
  discretionary: {
    label: "Discretionary buyers",
    /*
      "Chosen" on the tab, not "Discretionary".

      Discretionary is the correct term and it is what the class is
      called everywhere else in this app. On a narrow tab it ellipses to
      "Discre...", which tells a reader nothing, so the short form is
      what a rep would say out loud and the full name is still on the
      tooltip, the aria label and every heading with room for it.
    */
    short: "Chosen",
    glyph: "■",
    what: "Organisations where a person decides there will be an event at all. Holiday parties, offsites, client nights, team rewards.",
    when: "Worked on the decision maker rather than the date. Findable year round, and cancellable year round.",
  },
};

export function occasionClassOf(lane: Lane): OccasionClass {
  return LANE_META[lane].occasionClass;
}

export function isCalendarLocked(lane: Lane): boolean {
  return LANE_META[lane].occasionClass === "calendar-locked";
}

/**
 * The order lanes are shown in, everywhere.
 *
 * SCHOOLS LEAD, and that is a commercial decision rather than an
 * alphabetical accident. Before a venue opens, the only prospects worth
 * anything are the ones whose event is going to happen whether or not
 * you call them. A graduating class graduates. A season ends. That
 * certainty is the entire pre-opening asset, so the lanes whose demand
 * exists independently of anybody's decision come first, and the ones
 * that need a person to choose come after.
 *
 * It lives here rather than on the lane board because that page was not
 * the only screen with an opinion about which lane leads, and two
 * screens disagreeing about the priority of the week is exactly the kind
 * of incoherence this file exists to prevent.
 *
 * `local-retail-food` sits last, and that is not a demotion. It is the
 * smallest ticket of any lane on the board and the only one worked as a
 * walking route rather than as a list of accounts, so it is the lane a
 * rep gets to once the week's calendar-locked and corporate work is
 * already out of the door. Put it any higher and the board would be
 * telling somebody to spend a Tuesday morning on a twelve person boba
 * counter while a graduating class went unclaimed.
 */
export const LANE_ORDER: Lane[] = [
  "schools",
  "colleges",
  "fitness-youth-sports",
  "corporate",
  "auto-finance",
  "hospitality-civic",
  "faith-nonprofit",
  "healthcare",
  "local-retail-food",
];

/**
 * BOWLING LANES CONSUMED PER TWENTY GUESTS.
 *
 * THIS SINGLE NUMBER IS WHY A 300-GUEST BOOKING AND A 30-GUEST BOOKING
 * ARE NOT THE SAME SALE. Main Event publishes "1 lane per 20 guests" on
 * the All Access Pass, the MVP package and Level Up. Brea publishes
 * "more than 26 lanes".
 *
 * So a 300-guest corporate All Access Pass consumes fifteen lanes, which
 * is more than half the published floor of the building, and two of them
 * on the same evening is most of the venue. That is not a scheduling
 * detail, it is the reason a sales manager has to know which December
 * Fridays are already spoken for before promising anybody anything.
 *
 * The arithmetic is Main Event's own, not this app's. The only choice
 * made here is to compute against the published FLOOR of 26 rather than
 * the true count, so every capacity figure understates the venue and
 * never oversells it.
 */
export const GUESTS_PER_BOWLING_LANE = 20;

/** Lanes required for a headcount, rounded up. You cannot hold half a lane. */
export function lanesForGuests(guests: number): number {
  return Math.ceil(guests / GUESTS_PER_BOWLING_LANE);
}
