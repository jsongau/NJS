/**
 * THE INDUSTRY CUT.
 *
 * ── WHY A THIRD CUT ───────────────────────────────────────────────
 * This board already slices the trade area twice. `lane` says HOW YOU
 * REACH somebody, a published staff directory, a counter, a practice
 * manager who never answers the phone. `orgType` says WHERE THE YES
 * LIVES, in the building, above it, or on a purchase order.
 *
 * Neither of those answers the question the job posting actually asks:
 *
 *   "Develop and execute a local and outbound sales strategy to identify
 *    high-potential target customer SEGMENTS AND INDUSTRIES that would
 *    benefit from our services."
 *
 * An industry is not a lane. A hospital and a dance studio are both
 * worked by walking in, so they share a lane; they have nothing else in
 * common and they buy for completely different reasons. A school
 * district and a city both move money on a purchase order; one buys in
 * May because a class graduates and the other buys in December because
 * somebody decided to. If you plan a quarter by lane you plan a route.
 * If you plan it by industry you plan a strategy, and those are
 * different documents.
 *
 * ── WHY NAICS RATHER THAN CATEGORIES SOMEBODY MADE UP ─────────────
 * The obvious move is to invent fifteen labels, "industrial", "youth",
 * "professional", and it would have taken ten minutes. It would also
 * have been unfalsifiable: nobody can check "industrial" against
 * anything, so the segmentation would be an opinion wearing the clothes
 * of an analysis.
 *
 * NAICS is the federal industry classification. It is what the Census
 * Bureau's County Business Patterns is published in, which means the
 * moment a real sales manager wants to know HOW MANY sector 31
 * establishments exist in ZIP 92821 rather than how many this board
 * happens to carry, the answer is a public download away and it lines up
 * with these codes exactly. A segmentation you can join to a government
 * data set is worth more than one you cannot, and it costs the same.
 *
 * Two-digit sectors only. NAICS goes six deep, and six deep would split
 * a trade area of two hundred organisations into groups of one.
 *
 * ── THE ONE PLACE THIS BOARD BENDS NAICS, AND IT SAYS SO ──────────
 * Veterinary hospitals are 541940 in NAICS, which lands them in
 * Professional and Technical Services next to law firms. On this board
 * they sit in 62 with the clinics, because the thing that makes an
 * animal hospital a prospect, a chronically short-staffed team whose
 * manager controls one morale lever, is the clinic pattern and not the
 * law-firm one. The bend is recorded here rather than hidden in a data
 * file.
 */

import type { Lane, SegmentId } from "@/domain/types";

export type { SegmentId };

export interface SegmentMeta {
  /** The official sector name. Not paraphrased. */
  label: string;
  /** For a dense row or a tab. */
  short: string;
  /**
   * WHAT MAKES AN ORGANISATION IN THIS SECTOR BUY A GROUP NIGHT.
   *
   * One sentence, and it has to be the sentence that is true of the
   * sector rather than of one member of it. If it could be said about
   * any industry it is not worth saying.
   */
  occasion: string;
  /**
   * THE MOTION. What outbound into this sector actually looks like.
   *
   * This is the "and execute" half of the requirement. A segment nobody
   * has a motion for is not a target, it is a list.
   */
  motion: string;
  /**
   * The single hardest thing about this sector, named.
   *
   * Every sector has one. A segmentation that only lists upside is a
   * pitch deck.
   */
  friction: string;
  /** The lanes organisations in this sector actually sit in on this board. */
  typicalLanes: Lane[];
}

export const SEGMENT_META: Record<SegmentId, SegmentMeta> = {
  "61": {
    label: "Educational Services",
    short: "Education",
    occasion:
      "A cohort finishes. Grad night, an end-of-season banquet, a recital and a staff appreciation week all exist on a calendar published a year ahead, so the event is certain and only the venue is in question.",
    motion:
      "Read the published staff directory, write to the assistant principal for activities or the student life coordinator by name, and get on the approved-vendor list at the district office before any campus needs a purchase order. One district agreement unlocks every campus under it.",
    friction:
      "The window is fixed and it is early. A June grad night is decided the previous autumn, so a venue that opens without a spring push has missed a full year of the biggest youth occasion there is.",
    typicalLanes: ["schools", "colleges", "fitness-youth-sports"],
  },
  "62": {
    label: "Health Care and Social Assistance",
    short: "Health care",
    occasion:
      "A team that cannot all leave at once still needs a night out, so the buy is two or three smaller weekday events rather than one Friday, which is exactly the midweek daytime inventory a venue struggles to fill.",
    motion:
      "A go-see lane, not a call lane. The practice manager is the buyer and is the hardest person in the building to reach by phone; the route sheet clusters clinics by building so one morning covers six of them. Senior care is a second buyer entirely: the activities director books resident outings on a monthly programme while the administrator holds the staff budget.",
    friction:
      "Almost nothing in this sector publishes an email that reaches the building. Corporate contact pages route to a region, and a row that claims otherwise is a row that bounces.",
    typicalLanes: ["healthcare", "faith-nonprofit"],
  },
  "31": {
    label: "Manufacturing",
    short: "Manufacturing",
    occasion:
      "A plant runs shifts, and a shift cannot be stood down together, so a plant-wide recognition night is bought as two or three weekday events. Safety milestones and production records are occasions a factory celebrates that an office does not.",
    motion:
      "Badge-in security means no walk-in. The way in is the HR or EHS manager by name, or a lunchtime table in a lobby the plant already lets vendors use. Slowest sector to open and the largest headcounts on the board once open.",
    friction:
      "The approval is often above the building, at a division or a parent company in another county, and the plant manager who wants it cannot sign it.",
    typicalLanes: ["corporate"],
  },
  "92": {
    label: "Public Administration",
    short: "Public sector",
    occasion:
      "Employee appreciation is a line in an adopted budget rather than a discretionary impulse, and it recurs annually because the budget does. Police and fire associations buy separately from the city that employs their members.",
    motion:
      "Everything is published: the staff directory, the budget, the purchasing threshold. Write to Human Resources, and read the adopted budget for the authorised headcount before quoting anything.",
    friction:
      "Half these agencies run a recreation division that sells its own parties and youth programming, so the same city is a customer on one floor and a competitor one block west. Sell the employee side and leave the recreation division alone until there is a referral worth trading.",
    typicalLanes: ["hospitality-civic"],
  },
  "81": {
    label: "Other Services",
    short: "Civic and faith",
    occasion:
      "Congregations, service clubs and membership organisations run standing youth and fellowship programmes with a genuine need for somewhere indoors and supervised, and they are already raising money for something specific.",
    motion:
      "The offer, not the sale. A volunteer committee with no budget cannot approve 'buy a party' and can approve 'bring your people on a quiet night and see what it costs'. Round1 publishes no fundraiser programme to lead with, which is the hardest fact about this sector and the reason the first ask has to be small. Repair and personal-care businesses in it are a different, smaller thing worked as a walking route.",
    friction:
      "Budgets are small and the calendar belongs to a committee that meets monthly, so nothing moves fast even when everybody wants it.",
    typicalLanes: ["faith-nonprofit", "hospitality-civic", "local-retail-food"],
  },
  "71": {
    label: "Arts, Entertainment, and Recreation",
    short: "Recreation",
    occasion:
      "A season ends, a belt is tested, a recital closes, and when it does, everybody goes somewhere. The occasion recurs two or three times a year without anybody deciding to have one.",
    motion:
      "The owner is the buyer and is usually standing at the front desk, so this converts in ten minutes in person and never by email. It only pays worked as a SET: eight studios in one afternoon, not one gym at a time.",
    friction:
      "Small tickets, twenty to eighty guests. Any single booking here is worth less than the hour it took to get, and a rep who works this lane instead of the calendar-locked ones is busy rather than productive.",
    typicalLanes: ["fitness-youth-sports", "hospitality-civic"],
  },
  "72": {
    label: "Accommodation and Food Services",
    short: "Hotels and food",
    occasion:
      "Two completely different buys. A hotel sales director is asked for group recommendations by people who have already decided to spend money, which is a referral. A restaurant or counter crew is eight to sixty people whose owner decides on the spot, which is a small booking.",
    motion:
      "For hotels, a sales-director relationship and a rate-card exchange; the tour is what converts it and it is worth almost nothing before there is a building. For food service, a walking route in the afternoon lull between shifts.",
    friction:
      "Several of these are simultaneously competitors. A hotel with its own ballroom sells the same December Friday you do. Say so on the row rather than pretending the relationship is one-directional.",
    typicalLanes: ["hospitality-civic", "local-retail-food"],
  },
  "52": {
    label: "Finance and Insurance",
    short: "Finance",
    occasion:
      "Commission floors buy twice a year: once to reward the team against a quota, once to entertain the clients who filled it. The second one has a marketing budget behind it rather than an HR one.",
    motion:
      "Fast, because the person who signs is on the floor rather than three approvals away. Named branch managers and agency principals are published; the approach that lands names their December push, not staff morale in the abstract.",
    friction:
      "Sold to constantly and by everybody. A generic message is deleted without being read, and there is no second first impression here.",
    typicalLanes: ["auto-finance", "corporate"],
  },
  "53": {
    label: "Real Estate and Rental and Leasing",
    short: "Real estate",
    occasion:
      "A brokerage buys an agent appreciation night. A large apartment community is a different animal entirely: its community manager holds a RESIDENT EVENTS budget and a monthly programming calendar, which is a recurring buy rather than an annual one.",
    motion:
      "Brokerages through the broker of record at the office. Apartment communities through the community manager, and the ask is a standing monthly slot rather than one party, the highest-frequency repeat buyer in the whole trade area.",
    friction:
      "Resident event budgets are per-head and small, so the offer has to be a package that works at thirty people on a Tuesday rather than a Friday buyout.",
    typicalLanes: ["auto-finance", "corporate"],
  },
  "44": {
    label: "Retail Trade",
    short: "Retail",
    occasion:
      "A dealership or a store rewards a sales floor against a month-end number, and it entertains customers to move inventory. Both are decided close to the date.",
    motion:
      "The showroom floor and the general sales manager. Franchised units cannot approve alone, so the useful outcome of a first visit is often the name of the role above the building rather than an agreement.",
    friction:
      "Store-level staff have no budget and no authority, and the person who does is at a district office that publishes nothing.",
    typicalLanes: ["auto-finance", "local-retail-food"],
  },
  "54": {
    label: "Professional, Scientific, and Technical Services",
    short: "Professional services",
    occasion:
      "Small high-margin teams with real discretionary spend and a partner who can approve it over lunch. Firm anniversaries, closed-deal celebrations and a holiday party that is genuinely optional.",
    motion:
      "The office manager or managing partner, reached by name. Small headcounts mean the whole firm fits in one package, which makes quoting simple and the yes quick.",
    friction:
      "Twelve to forty people is a small booking, and these firms are also the most likely to choose a restaurant instead. There is no calendar forcing it.",
    typicalLanes: ["corporate"],
  },
  "56": {
    label: "Administrative and Support Services",
    short: "Admin and staffing",
    occasion:
      "A staffing agency has two completely different populations, a small internal team and a large placed workforce, and only one of them is the guest list. Field-service contractors with big crews celebrate a season ending.",
    motion:
      "Ask which population the event is for in the first sentence, because getting that wrong wastes the whole conversation. Branch managers are published and reachable.",
    friction:
      "The large number on the page is almost never the number that attends, and a quote built on it is a quote that gets withdrawn.",
    typicalLanes: ["corporate"],
  },
  "42": {
    label: "Wholesale Trade",
    short: "Wholesale",
    occasion:
      "Distribution operations run to a seasonal peak and celebrate after it clears, which puts their occasion in January and February, the emptiest weeks in a venue's year.",
    motion:
      "Operations manager at the site rather than a corporate marketing contact. The pitch is the off-peak date, and it should be priced like one.",
    friction:
      "Almost no wholesale operation publishes a site-level email, and the corporate form reaches a region that has never heard of the building.",
    typicalLanes: ["corporate"],
  },
  "48": {
    label: "Transportation and Warehousing",
    short: "Logistics",
    occasion:
      "Peak season ends and a warehouse that ran seven days a week for two months stands down. The recognition event is real, it is large, and it lands in the first quarter.",
    motion:
      "Site or general manager, in person, because these buildings do not answer generic mail. A school transport yard is a second thing again: it is a prospect AND it is the dispatcher every school on this board has to phone to bring a bus.",
    friction:
      "Shift patterns make a single date nearly impossible, and the site manager may not control the budget the parent company holds.",
    typicalLanes: ["corporate", "hospitality-civic"],
  },
  "22": {
    label: "Utilities",
    short: "Utilities",
    occasion:
      "Stable, unionised workforces with a long-service recognition culture and an annual employee event that survives budget cycles because it always has.",
    motion:
      "Board-governed and slow, but everything is public: the board agenda, the budget and the general manager's name. Approach through Human Resources with a written proposal that can sit in an agenda packet.",
    friction:
      "Very few of them, and the calendar runs on board approval, so a decision can take two meetings and a month between each.",
    typicalLanes: ["hospitality-civic", "corporate"],
  },
  "23": {
    label: "Construction",
    short: "Construction",
    occasion:
      "A project closes out and a crew that has worked together for eighteen months disbands. The celebration is real and it is scheduled by the job rather than by the calendar.",
    motion:
      "The project manager or the owner, and the date is set by a milestone nobody can predict from outside. This sector rewards being remembered rather than being timely.",
    friction:
      "Unpredictable timing and crews that scatter across sites, so there is no reliable window to work backwards from.",
    typicalLanes: ["corporate"],
  },
  "51": {
    label: "Information",
    short: "Information",
    occasion:
      "Media, publishing, telecom and data operations with young office populations and a strong internal social calendar.",
    motion:
      "Not yet established in this trade area. See the gap note on the segments board.",
    friction:
      "NO ORGANISATION IN THIS SECTOR SURVIVED VERIFICATION IN THE TRADE AREA. Candidates existed and every one of them rested on a single directory line with a generic number. The sector is carried here so its absence is visible rather than silently missing.",
    typicalLanes: ["corporate"],
  },
};

/**
 * Reading order. Not alphabetical, not numeric. This is a sales order.
 *
 * Sectors whose occasion exists whether or not anybody calls them come
 * first, because before a venue opens those are the only prospects worth
 * anything. Then the large employers, then the referral multipliers, then
 * the small and fast, then the thin sectors.
 *
 * The board's own ranking on `/segments` is computed from the rows and
 * will not always agree with this. That disagreement is the interesting
 * part of the screen and it is deliberately not smoothed away.
 */
export const SEGMENT_ORDER: SegmentId[] = [
  "61", "62", "31", "92", "81", "71", "72", "52", "53", "44",
  "54", "56", "42", "48", "22", "23", "51",
];

export function segmentLabel(id: SegmentId): string {
  return SEGMENT_META[id]?.label ?? `NAICS ${id}`;
}

/** NAICS sector codes are printed with their range, not as bare numbers. */
export const SEGMENT_CODE_DISPLAY: Record<SegmentId, string> = {
  "22": "22", "23": "23", "31": "31-33", "42": "42", "44": "44-45",
  "48": "48-49", "51": "51", "52": "52", "53": "53", "54": "54",
  "56": "56", "61": "61", "62": "62", "71": "71", "72": "72",
  "81": "81", "92": "92",
};
