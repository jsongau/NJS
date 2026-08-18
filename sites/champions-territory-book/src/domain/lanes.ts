import type { Lane, OccasionClass } from "@/domain/types";

/**
 * One home for everything a service line means.
 *
 * WHY THIS FILE EXISTS. In the build this was forked from, the label for
 * a channel lived in one component, its glyph next to the label, its
 * behaviour in a chain of ternaries, and what kind of thing it was at
 * all was something each call site worked out for itself by
 * pattern-matching on a string. Five files knew four different amounts
 * about the same nine values.
 *
 * The failure that produces is not a crash. It is a screen that says
 * "Drain and sewer" in one place and "Drains" in another, and a filter
 * that quietly treats a property management office as a homeowner
 * because whoever wrote the ternary listed the four lines they happened
 * to remember.
 *
 * So: the service line is declared once, with everything that is true
 * about it. The `Lane` union and the `lane` field keep their old names
 * because a dozen other files join on them; what a reader sees is the
 * label, and the labels are the nine lines the West Division brands
 * actually sell and the partner channels that feed them.
 *
 * `doorName` earns its place because the way in is different in every
 * one of them. You do not "call the buyer" for heating and air, you
 * compete for a published service area page against nine rivals running
 * the same offer, and a screen that uses the partner word at a homeowner
 * tells a hiring manager the model does not really distinguish the two.
 */

export interface LaneMeta {
  label: string;
  /** For a dense row where the full label will not fit. */
  short: string;
  /** Shape before hue, always. The card is identifiable in greyscale. */
  glyph: string;
  occasionClass: OccasionClass;
  /** What the way in is actually called in this service line. */
  doorName: string;
  /**
   * The same thing in one word, for the middle of a sentence.
   *
   * "Nothing through the published service area page" is a real phrase
   * and a terrible clause. `doorName` is a heading; this is what a
   * marketer would say out loud, and a sentence that reads as though a
   * program assembled it is a sentence a reader can tell was assembled
   * by a program.
   */
  doorNoun: string;
  /** How this service line actually trades. Shown in the drawer. */
  note: string;
  /**
   * The single hardest marketing problem in this service line, named.
   *
   * The field keeps its old name because other files read it. What it
   * holds now is the thing that makes demand generation here hard this
   * season: a seasonal window closing, a price that competitors publish
   * on their own homepage, a membership programme that does not exist
   * yet. Every line has one, they are all different, and naming them is
   * the difference between a list of categories and a plan.
   */
  preOpeningProblem: string;
  cssVar: string;
  tintVar: string;
}

export const LANE_META: Record<Lane, LaneMeta> = {
  // --- Calendar-locked: the date buys, not the buyer -----------------
  "hvac": {
    label: "Heating and air conditioning",
    short: "HVAC",
    glyph: "▲",
    occasionClass: "calendar-locked",
    doorName: "Published service area page",
    doorNoun: "service area page",
    note:
      "The largest service line in the West portfolio and the one that decides the year. Replacement demand is weather-driven and it arrives in a fortnight rather than a quarter, so the marketing question is never whether people need it, it is whose number they have when the house hits ninety degrees.",
    preOpeningProblem:
      "Demand is seasonal and it does not wait. A brand that is not already in the local pack and the paid results in May is buying its August leads at the worst price of the year.",
    cssVar: "var(--lane-hvac)",
    tintVar: "var(--lane-hvac-tint)",
  },
  "plumbing": {
    label: "Plumbing",
    short: "Plumbing",
    glyph: "◭",
    occasionClass: "calendar-locked",
    doorName: "Published service area page",
    doorNoun: "service area page",
    note:
      "Emergency-led and therefore search-led. A burst line is the least considered purchase in home services: the homeowner opens a phone, reads three listings, and calls one of them inside two minutes.",
    preOpeningProblem:
      "There is no consideration window to influence. Everything has to already be in place before the failure, which makes reviews, the local pack and answer rate the whole game.",
    cssVar: "var(--lane-plumbing)",
    tintVar: "var(--lane-plumbing-tint)",
  },
  "electrical": {
    label: "Electrical",
    short: "Electrical",
    glyph: "◮",
    occasionClass: "calendar-locked",
    doorName: "Published service area page",
    doorNoun: "service area page",
    note:
      "The newest line in the portfolio and the one being bought rather than built. Panel upgrades and EV charger installs are planned purchases with a long consideration window, which makes them the one home service where content and financing actually move the decision.",
    preOpeningProblem:
      "Powell Electric joined the group in August 2026 and is the only West brand publishing no membership plan, so the retention machine every sibling runs does not exist here yet.",
    cssVar: "var(--lane-electrical)",
    tintVar: "var(--lane-electrical-tint)",
  },

  // --- Discretionary: somebody chooses -------------------------------
  "multi-service": {
    label: "Multi-service operators",
    short: "Multi-service",
    glyph: "■",
    occasionClass: "discretionary",
    doorName: "Published service area page",
    doorNoun: "service area page",
    note:
      "Contractors selling HVAC, plumbing and often electrical from one van. They are the direct structural competitor to a multi-brand division, because they make the same argument about one number for the whole house.",
    preOpeningProblem:
      "A homeowner who already has a multi-service contractor is not a lead, they are a switch. The wedge is the thing that contractor cannot match: coverage, response time, or a membership that pays for itself.",
    cssVar: "var(--lane-multi-service)",
    tintVar: "var(--lane-multi-service-tint)",
  },
  "drain-sewer": {
    label: "Drain and sewer",
    short: "Drain and sewer",
    glyph: "◧",
    occasionClass: "discretionary",
    doorName: "Published service area page",
    doorNoun: "service area page",
    note:
      "The loss leader of the trade. Almost every operator in this set publishes a drain-clearing price between forty seven and ninety nine dollars, because the drain call is how you get into a house and find the sewer line that needs relining.",
    preOpeningProblem:
      "If the published drain price drifts above the local pack, call volume falls before revenue does, and the leading indicator is a number anybody can read off a competitor's homepage.",
    cssVar: "var(--lane-drain-sewer)",
    tintVar: "var(--lane-drain-sewer-tint)",
  },
  "partner-employer": {
    label: "Employers and hospitality",
    short: "Employers",
    glyph: "◍",
    occasionClass: "discretionary",
    doorName: "Front desk or HR",
    doorNoun: "front desk",
    note:
      "Local employers, hotels and chambers. The pitch is an employee home services programme or a preferred-vendor listing, which puts a brand in front of a few hundred households through one relationship rather than a few hundred impressions.",
    preOpeningProblem:
      "Nobody at an employer owns this, so the approach has to make it somebody's easy yes rather than somebody's new project.",
    cssVar: "var(--lane-partner-employer)",
    tintVar: "var(--lane-partner-employer-tint)",
  },
  "partner-property": {
    label: "Property and referral partners",
    short: "Property",
    glyph: "◇",
    occasionClass: "discretionary",
    doorName: "Office or listing page",
    doorNoun: "office",
    note:
      "Property managers, realtors, brokerages and home inspectors. The highest-value partner type in home services, because they are standing next to the homeowner at the exact moment a system is found to be failing.",
    preOpeningProblem:
      "Every competitor wants the same relationship and most of them ask for it the same way. What wins it is response time on the first referral, not the pitch.",
    cssVar: "var(--lane-partner-property)",
    tintVar: "var(--lane-partner-property-tint)",
  },
  "partner-community": {
    label: "Schools, faith and civic",
    short: "Community",
    glyph: "◈",
    occasionClass: "discretionary",
    doorName: "Published staff directory",
    doorNoun: "directory",
    note:
      "Not customers. These are the sponsorship and community surfaces a local brand uses to be visible in a postcode before anybody needs it: school fundraisers, church directories, civic clubs. Inherited from the trade-area research this console was built on, and re-read as partnership targets rather than as buyers.",
    preOpeningProblem:
      "Community marketing has no attribution and a long lag, which is exactly why it is the first line cut and the last one a competitor copies.",
    cssVar: "var(--lane-partner-community)",
    tintVar: "var(--lane-partner-community-tint)",
  },
  "water-heater": {
    label: "Water heaters",
    short: "Water heaters",
    glyph: "◫",
    occasionClass: "discretionary",
    doorName: "Published service area page",
    doorNoun: "service area page",
    note:
      "A replacement purchase with a hard deadline and a known price band, which makes it the most comparison-shopped item in the trade and the one where financing and rebate messaging change the answer.",
    preOpeningProblem:
      "A failed water heater is replaced the same day or the next. Anything that slows the quote loses the job to whoever answers second.",
    cssVar: "var(--lane-water-heater)",
    tintVar: "var(--lane-water-heater-tint)",
  },
};

/**
 * THE TWO CLASSES OF DEMAND, and the split the whole board hangs off.
 *
 * Some of this money is going to be spent whether or not anybody markets
 * to anybody. A compressor fails in August, a water heater floods a
 * garage, a main line backs up on a Sunday. The household is buying; the
 * only question is whose number is in front of them at the moment they
 * look. Everything else on this board is demand somebody chooses to
 * create: a panel upgrade, a tankless swap, a membership, a
 * preferred-vendor agreement with a management company.
 *
 * Those are two different marketing jobs on two different clocks, and
 * confusing them is how a budget gets spent on brand awareness in July
 * while the paid search position that captures the emergency calls slips
 * to fourth.
 *
 * WHAT THIS CLASSIFICATION GETS WRONG, said plainly: electrical sits in
 * the non-discretionary class and it is the loosest fit on the board. A
 * panel upgrade is planned months ahead and shops around, which is
 * discretionary behaviour. It sits here because the calls that actually
 * pay for the line arrive with a failure or a permit deadline attached.
 * The class is a planning aid, not a law, and a reader who would move it
 * is not wrong.
 */
export const OCCASION_CLASS_META: Record<
  OccasionClass,
  { label: string; short: string; glyph: string; what: string; when: string }
> = {
  "calendar-locked": {
    label: "Non-discretionary demand",
    short: "Demand",
    glyph: "▲",
    what: "Service lines where the call happens because something failed or the weather turned. The household is going to spend the money; only the phone number is in question.",
    when: "Bought ahead of the season, because there is no consideration window left once the house is at ninety degrees. Rank, reviews and answer rate are paid for in May and spent in August.",
  },
  discretionary: {
    label: "Discretionary demand",
    /*
      "Chosen" on the tab, not "Discretionary".

      Discretionary is the correct term and it is what the class is
      called everywhere else in this app. On a narrow tab it ellipses to
      "Discre...", which tells a reader nothing, so the short form is
      what a marketer would say out loud and the full name is still on
      the tooltip, the aria label and every heading with room for it.
    */
    short: "Chosen",
    glyph: "■",
    what: "Service lines and partnerships where a person decides there will be a job at all. A planned replacement, a membership sign-up, a management company agreeing a vendor list.",
    when: "Worked on the decision maker rather than on the season. Findable year round, and postponable year round.",
  },
};

export function occasionClassOf(lane: Lane): OccasionClass {
  return LANE_META[lane].occasionClass;
}

export function isCalendarLocked(lane: Lane): boolean {
  return LANE_META[lane].occasionClass === "calendar-locked";
}

/**
 * The order service lines are shown in, everywhere.
 *
 * HEATING AND AIR LEADS, and that is a commercial decision rather than
 * an alphabetical accident. It is the largest line in the West portfolio
 * and the one that decides the year, and the demand under it exists
 * whether or not a single advert runs. Plumbing and electrical follow
 * for the same reason: the call arrives with a failure attached to it.
 * The lines that need a person to choose come after.
 *
 * It lives here rather than on the service line board because that page
 * was not the only screen with an opinion about which line leads, and
 * two screens disagreeing about the priority of the week is exactly the
 * kind of incoherence this file exists to prevent.
 *
 * The three partner lines sit last, and that is not a demotion. They
 * are the slowest to pay: a property management agreement or a community
 * programme takes a quarter to produce its first call and cannot be
 * attributed cleanly when it does. They are also the first line a
 * nervous budget cuts and the last thing a competitor copies. Putting
 * them any higher would tell somebody to spend an August morning at a
 * board meeting while the season's replacement demand went to whoever
 * was ranked above us.
 */
export const LANE_ORDER: Lane[] = [
  "hvac",
  "plumbing",
  "electrical",
  "multi-service",
  "drain-sewer",
  "water-heater",
  "partner-community",
  "partner-employer",
  "partner-property",
];

/**
 * DOORS ONE CREW SLOT COVERS. THE CAPACITY RATIO.
 *
 * THIS SINGLE NUMBER IS WHY A 300-DOOR PORTFOLIO AND A 30-DOOR ONE ARE
 * NOT THE SAME CAMPAIGN. A marketing budget exists to drive incremental
 * phone calls and web leads. A call that lands on a week the crew is
 * already fully booked is a call that gets a callback tomorrow, and a
 * callback tomorrow buys a competitor. So every screen that promises
 * volume converts that volume into crew days first, at one slot per
 * twenty doors, and shows the answer next to what the branch can
 * actually run.
 *
 * WHAT IS HONEST ABOUT IT: the twenty is OURS. No brand in this market
 * publishes a jobs-per-truck-per-day figure and none of the five West
 * Division sites publishes a technician count by branch. This is a
 * planning rate the console picked so that capacity is at least
 * expressed rather than ignored, and every screen that uses it says
 * modelled beside the number. A reader who works in the business will
 * have a better rate and should substitute it; the argument the ratio
 * carries does not depend on the value being right, only on it existing.
 *
 * THE NAME IS INHERITED and deliberately not changed while a dozen other
 * files import it. An identifier is a join key; the words beside it on
 * screen are what a reader is owed.
 */
export const DOORS_PER_CREW_SLOT = 20;

/** Crew slots a volume needs, rounded up. There is no half a crew day. */
export function crewSlotsForDoors(guests: number): number {
  return Math.ceil(guests / DOORS_PER_CREW_SLOT);
}
