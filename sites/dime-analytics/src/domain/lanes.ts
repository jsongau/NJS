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
   * The single hardest thing about working this lane.
   *
   * Every lane has one, they are all different, and naming them is the
   * difference between a list of categories and a plan.
   */
  laneProblem: string;
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
    laneProblem:
      "The buying window is fixed and it is early. Grad night for June is decided in autumn, so a territory worked from spring onwards catches the year and a territory worked from January has already missed the single biggest youth occasion there is.",
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
    laneProblem:
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
    laneProblem:
      "These are small buyers, twenty to eighty guests, and each booking is worth little on its own. The lane only pays if it is worked as a set rather than one gym at a time.",
    cssVar: "var(--lane-fitness)",
    tintVar: "var(--lane-fitness-tint)",
  },

  // --- Discretionary: somebody chooses -------------------------------
  corporate: {
    label: "Key accounts, four or more doors",
    short: "Key accounts",
    glyph: "■",
    occasionClass: "discretionary",
    doorName: "Category buyer or purchasing manager",
    doorNoun: "chain buyer",
    note: "Catalyst operates nine of the premises on this board, Haven six, Mr Nice Guy four. One conversation with a buyer at this level places product in every one of those storefronts at once, which is why a chain call is worth several independent calls and why losing one costs several at once.",
    laneProblem:
      "The decision sits above the store, so a good relationship with a store manager buys nothing. The buyer is often not in any of the buildings, publishes no email, and resets the assortment on a schedule the brand does not control.",
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
    laneProblem:
      "They are sold to constantly and by everybody. A generic approach is deleted. The one that lands names their December sales push, not their staff morale.",
    cssVar: "var(--lane-auto)",
    tintVar: "var(--lane-auto-tint)",
  },
  "hospitality-civic": {
    label: "Regional groups, two to three doors",
    short: "Regional groups",
    glyph: "◇",
    occasionClass: "discretionary",
    doorName: "Owner operator or buyer",
    doorNoun: "owner",
    note: "STIIIZY, Off The Charts, 420 Central, King's Crew and Culture Cannabis Club each run two or three of the premises here. Small enough that the person who decides still answers the phone, large enough that a yes lands in more than one door.",
    laneProblem:
      "They behave like independents until they do not. A group that opened its third door this year starts buying like a chain, and a rep still treating it as a single store finds the assortment decision has moved without being told.",
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
    note: "Large recurring youth groups with a genuine need for somewhere safe, indoors and supervised to take fifty teenagers on a Friday. This operator publishes no fundraiser programme, which is the lane's hardest fact: a competitor publishes one on its own page, and a volunteer committee can read those terms without ringing anybody.",
    laneProblem:
      "Budgets are small, the calendar is set by a volunteer committee, and there is no published fundraiser to lead with. The way in is a small first commitment on a quiet night rather than a programme.",
    cssVar: "var(--lane-faith)",
    tintVar: "var(--lane-faith-tint)",
  },
  healthcare: {
    label: "Microbusiness licence",
    short: "Microbusiness",
    glyph: "◈",
    occasionClass: "discretionary",
    doorName: "Owner operator",
    doorNoun: "owner",
    note: "A microbusiness licence covers cultivation, manufacture and retail under one holder, so this operator is not only a customer. Anybody selling into it is selling to somebody who also makes product, and the conversation about shelf space is not the same conversation.",
    laneProblem:
      "One row on this board, so nothing here generalises. It is kept as its own lane rather than folded into independents because the licence class is a real commercial difference and hiding it inside a bigger group would be the tidier and less true choice.",
    cssVar: "var(--lane-healthcare)",
    tintVar: "var(--lane-healthcare-tint)",
  },
  "local-retail-food": {
    label: "Independents, single door",
    short: "Independents",
    glyph: "□",
    occasionClass: "discretionary",
    doorName: "Store buyer",
    doorNoun: "store buyer",
    note: "Forty two of the seventy four are a single premises. The person who decides what goes on the shelf is usually in the building, which makes this the only lane on the board where walking in is a genuinely efficient use of an hour.",
    laneProblem:
      "Every yes is one door. Working this lane is the highest effort per unit of shelf on the board, and it is also the only lane where a brand can win placement without a chain negotiation, which is why it is worked rather than skipped.",
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
 * alphabetical accident. In a territory nobody has worked, the only
 * prospects worth anything are the ones whose event is going to happen
 * whether or not you call them. A graduating class graduates. A season
 * ends. That certainty is the asset a cold desk has, so the lanes whose
 * demand exists independently of anybody's decision come first, and the
 * ones that need a person to choose come after.
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
  /**
   * Ordered by how much shelf one conversation buys, deepest first.
   *
   * Five of the nine lanes this application inherited describe occasions
   * a venue sells to, and none of them exists in cannabis wholesale, so
   * they are not iterated. They stay declared in LANE_META because the
   * type demands every key, and a lane with no accounts would render as
   * an honest zero rather than an error if one were added back.
   */
  "corporate",
  "hospitality-civic",
  "local-retail-food",
  "healthcare",
];

/**
 * BOWLING LANES CONSUMED PER TWENTY GUESTS.
 *
 * THIS SINGLE NUMBER IS WHY A 300-GUEST BOOKING AND A 30-GUEST BOOKING
 * ARE NOT THE SAME SALE. Twenty guests to a lane is THIS APPLICATION'S
 * OWN PLANNING RATE and it is labelled that way everywhere it is shown.
 * DIME publishes no lane ratio for its one party package and no lane
 * count for any location, so there is no published rule to borrow and
 * nothing to check this against.
 *
 * WHAT IT MAY AND MAY NOT BE USED FOR. It may size a conversation: three
 * hundred guests is fifteen lanes and that is a different request from
 * thirty guests on two. It may NOT be turned into a share of a floor,
 * because the denominator does not exist. Every screen that wants a
 * percentage of the house is refused one, and `selectors/capacity.ts`
 * returns null rather than a figure with a per cent sign after it.
 *
 * A rep who needs the real number asks the store, and the answer goes on
 * the record as observed rather than into a letter as published.
 */
export const GUESTS_PER_BOWLING_LANE = 20;

/** Lanes required for a headcount, rounded up. You cannot hold half a lane. */
export function lanesForGuests(guests: number): number {
  return Math.ceil(guests / GUESTS_PER_BOWLING_LANE);
}
