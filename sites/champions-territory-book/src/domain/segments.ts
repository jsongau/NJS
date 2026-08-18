/**
 * THE INDUSTRY CUT.
 *
 * ── WHY A THIRD CUT ───────────────────────────────────────────────
 * This board already slices the territory twice. `lane` says WHICH
 * SERVICE LINE the work belongs to, heating and air or drains or a
 * referral partner. `orgType` says WHERE THE YES LIVES: in the building,
 * above it at a regional office, or on a purchase order.
 *
 * Neither of those answers the question the posting actually asks, which
 * is which segments to spend a local budget against. A dental practice
 * and a machine shop are both reached by walking in, so they share a
 * service line; they have nothing else in common and they buy for
 * completely different reasons. A school district and a city both move
 * money on a purchase order; one replaces rooftop units in July because
 * the campus is empty and the other does it when an adopted budget says
 * so. Plan a quarter by service line and you have planned a route. Plan
 * it by industry and you have planned a strategy, and those are
 * different documents.
 *
 * ── WHAT THIS CUT DOES NOT COVER, SAID FIRST ──────────────────────
 * MOST OF THE REVENUE IN THIS MARKET IS RESIDENTIAL, AND A HOMEOWNER HAS
 * NO NAICS CODE. This cut is the commercial and light industrial half of
 * the territory plus the referral surfaces that feed the residential
 * half. The residential cut that matters is not an industry at all, it
 * is the AGE OF THE HOUSING STOCK: a 1960s tract in north Orange County
 * is a replacement market where the argument is a failing system,
 * financing and whatever rebate is still live, and a 2015 build is a
 * maintenance market where the argument is a membership plan. The same
 * offer sent to both wastes half the spend. Door count does the same job
 * for multifamily, and the boundary between an owner with four doors and
 * a manager with four hundred is the boundary between a coupon and a
 * portfolio proposal.
 *
 * Those two cuts are argued on the segments screen and are not encoded
 * here, because this board carries organisations rather than parcels and
 * there is no housing-stock field on a row to key them off. Saying so is
 * better than quietly implying that seventeen federal sector codes are
 * the whole segmentation.
 *
 * ── WHY NAICS RATHER THAN CATEGORIES SOMEBODY MADE UP ─────────────
 * The obvious move is to invent fifteen labels, "industrial", "medical",
 * "professional", and it would have taken ten minutes. It would also
 * have been unfalsifiable: nobody can check "industrial" against
 * anything, so the segmentation would be an opinion wearing the clothes
 * of an analysis.
 *
 * NAICS is the federal industry classification. It is what the Census
 * Bureau's County Business Patterns is published in, which means the
 * moment somebody wants to know HOW MANY sector 31 establishments exist
 * in ZIP 92821 rather than how many this board happens to carry, the
 * answer is a public download away and it lines up with these codes
 * exactly. A segmentation you can join to a government data set is worth
 * more than one you cannot, and it costs the same.
 *
 * Two-digit sectors only. NAICS goes six deep, and six deep would split
 * a territory of a few hundred organisations into groups of one.
 *
 * ── THE ONE PLACE THIS BOARD BENDS NAICS, AND IT SAYS SO ──────────
 * Veterinary hospitals are 541940 in NAICS, which lands them in
 * Professional and Technical Services next to law firms. On this board
 * they sit in 62 with the clinics, because the thing that makes an
 * animal hospital a prospect, a building that cannot trade for a day
 * without cooling and a practice manager who signs for the fix, is the
 * clinic pattern and not the law-firm one. The bend is recorded here
 * rather than hidden in a data file.
 */

import type { Lane, SegmentId } from "@/domain/types";

export type { SegmentId };

export interface SegmentMeta {
  /** The official sector name. Not paraphrased. */
  label: string;
  /** For a dense row or a tab. */
  short: string;
  /**
   * WHAT MAKES AN ORGANISATION IN THIS SECTOR RAISE A CALL.
   *
   * One sentence, and it has to be the sentence that is true of the
   * sector rather than of one member of it. If it could be said about
   * any industry it is not worth saying.
   */
  occasion: string;
  /**
   * THE MOTION. What local marketing into this sector actually looks
   * like.
   *
   * A segment nobody has a motion for is not a target, it is a list.
   */
  motion: string;
  /**
   * The single hardest thing about this sector, named.
   *
   * Every sector has one. A segmentation that only lists upside is a
   * pitch deck.
   */
  friction: string;
  /** The service lines organisations in this sector sit in on this board. */
  typicalLanes: Lane[];
}

export const SEGMENT_META: Record<SegmentId, SegmentMeta> = {
  "61": {
    label: "Educational Services",
    short: "Education",
    occasion:
      "A district runs dozens of buildings full of rooftop units and boiler rooms on a maintenance calendar somebody publishes a year ahead, and the heavy replacement work is done in the weeks the campuses are empty.",
    motion:
      "Read the published directory, write to the facilities or maintenance and operations lead by name, and get onto the approved vendor list at the district office before any single campus needs the work. One district agreement covers every campus under it. The staff benefits fair is a second, cheaper door into a few thousand households.",
    friction:
      "The buying window is fixed and it is the summer, so a brand that is not on the vendor list by spring has missed a full year of the largest planned replacement work in the territory.",
    typicalLanes: ["hvac", "plumbing", "electrical"],
  },
  "62": {
    label: "Health Care and Social Assistance",
    short: "Health care",
    occasion:
      "A clinic that loses cooling stops seeing patients that morning, so this sector buys response time and planned maintenance rather than price, and it is the most reliable membership and service agreement sector on the board.",
    motion:
      "A go-see sector, not a call sector. The practice manager holds the decision and is the hardest person in the building to reach by phone, so the route clusters clinics by medical office building and one morning covers six of them. Senior care is a second buyer entirely: the administrator holds the capital budget while the maintenance lead raises the emergency.",
    friction:
      "Almost nothing in this sector publishes an email that reaches the building. Corporate contact pages route to a region, and a row that claims otherwise is a row that bounces.",
    typicalLanes: ["partner-community", "partner-property"],
  },
  "31": {
    label: "Manufacturing",
    short: "Manufacturing",
    occasion:
      "Light industrial buildings run process cooling, compressed air and make-up air that nobody thinks about until a line stops, and the cost of the stoppage is larger than any quote, which is what makes the planned-maintenance argument land here when it lands nowhere else.",
    motion:
      "Badge-in security means no walk-in. The way in is the facilities or EHS manager by name, or a lunchtime table in a lobby the plant already lets vendors use. Slowest sector to open on the board and the largest single tickets once open.",
    friction:
      "The approval is often above the building, at a division or a parent company in another county, and the plant manager who wants it cannot sign it.",
    typicalLanes: ["multi-service"],
  },
  "92": {
    label: "Public Administration",
    short: "Public sector",
    occasion:
      "Capital replacement is a line in an adopted budget rather than a reaction to a failure, and it recurs because the budget does. Public buildings are also the most likely in the territory to be reaching for a utility rebate, which puts the live SoCalGas and municipal utility money at the centre of the conversation.",
    motion:
      "Everything is published: the directory, the adopted budget, the purchasing threshold, the agenda packet. Write to facilities and to purchasing, and read the budget before proposing anything.",
    friction:
      "Procurement is slow and formal, a small job can need three quotes, and nothing moves between one meeting and the next. This sector rewards patience and punishes a campaign built on a month.",
    typicalLanes: ["partner-employer"],
  },
  "81": {
    label: "Other Services",
    short: "HOAs and civic",
    occasion:
      "Homeowner associations, community associations, congregations and clubs own common-area systems, clubhouses and shared water heating, and they are the one channel that puts a brand in front of a few hundred households through a single relationship.",
    motion:
      "The board meeting and the community manager, not an advert. A slot on an agenda, a maintenance briefing that is genuinely useful and a resident offer the board can put in a newsletter turn one evening into a standing referral into every door in the association.",
    friction:
      "Budgets are set annually, a volunteer board meets monthly, and a decision needs a vote. Nothing moves fast here even when everybody in the room wants it.",
    typicalLanes: ["partner-property", "partner-employer", "water-heater"],
  },
  "71": {
    label: "Arts, Entertainment, and Recreation",
    short: "Recreation",
    occasion:
      "Gyms, studios and clubs run their systems at full load fourteen hours a day, which ages equipment two or three times faster than an office and turns them into replacement prospects long before the building looks old enough.",
    motion:
      "The owner is the buyer and is usually standing at the front desk, so this converts in ten minutes in person and never by email. It only pays worked as a set: eight sites in one afternoon, not one at a time.",
    friction:
      "Small operators with thin margins who will take the cheapest repair over the right replacement, so the honest conversation is repair against replace rather than a coupon.",
    typicalLanes: ["electrical", "partner-employer"],
  },
  "72": {
    label: "Accommodation and Food Services",
    short: "Hotels and food",
    occasion:
      "Two completely different buys. A hotel runs the heaviest hot water load of any building type on this board and cannot take a room out of service, which makes water heating and boilers a planned capital conversation. A restaurant lives on kitchen make-up air and refrigeration and buys at the moment something fails, at the worst hour of the week.",
    motion:
      "For hotels, the chief engineer and the general manager, with a service agreement rather than a coupon. For food service, a walking route in the afternoon lull between shifts, and an out-of-hours answer rate that is either there or the call goes elsewhere.",
    friction:
      "Both halves are price-sensitive and both are used to being courted. A hotel already has an incumbent contractor, and displacing one takes a failure the incumbent handled badly.",
    typicalLanes: ["partner-employer", "water-heater"],
  },
  "52": {
    label: "Finance and Insurance",
    short: "Finance",
    occasion:
      "Branch offices and agencies with small systems and no facilities department, where the office manager both notices the problem and signs for it. The second, larger opportunity is as a referral surface: agents and lenders stand next to homeowners at the exact moment a property changes hands.",
    motion:
      "Fast, because the person who signs is in the room rather than three approvals away. Named branch managers and agency principals are published, and the approach that lands offers something their clients want rather than something the branch needs.",
    friction:
      "Sold to constantly and by everybody, and a leased branch usually has a landlord who owns the roof. A generic message is deleted without being read.",
    typicalLanes: ["drain-sewer", "multi-service"],
  },
  "53": {
    label: "Real Estate and Rental and Leasing",
    short: "Real estate",
    occasion:
      "THE HIGHEST-VALUE SECTOR ON THE BOARD. A property management company holds hundreds of doors, replaces systems on a rolling schedule and needs one number for after-hours failures. A brokerage is smaller and different: it is a referral machine that touches a household at the one moment the systems are being inspected.",
    motion:
      "Managers through the maintenance supervisor and the regional manager, with a portfolio proposal, a rate sheet and a response-time commitment rather than a coupon. Brokerages through the broker of record at the office, with something an agent can hand a client.",
    friction:
      "Doors are won on response time and lost on one missed after-hours call, and a portfolio agreement that arrives when the crew is already fully booked costs more relationship than it earns revenue.",
    typicalLanes: ["drain-sewer", "multi-service"],
  },
  "44": {
    label: "Retail Trade",
    short: "Retail",
    occasion:
      "A storefront that gets hot loses trade the same day, so retail buys emergency repair fast and plans nothing. Dealerships and larger formats are the exception: big rooftop plant, long hours and a facilities budget.",
    motion:
      "The store or general manager on the floor. Franchised and leased units cannot approve alone, so the useful outcome of a first visit is often the name of the role above the building rather than an agreement.",
    friction:
      "Store-level staff have no budget and no authority, the landlord frequently owns the equipment, and the person who does decide sits at a district office that publishes nothing.",
    typicalLanes: ["drain-sewer", "water-heater"],
  },
  "54": {
    label: "Professional, Scientific, and Technical Services",
    short: "Professional services",
    occasion:
      "Small high-margin offices with real discretionary spend and a partner who can approve a replacement over lunch. Comfort complaints, not failures, are what start the conversation.",
    motion:
      "The office manager or managing partner, reached by name. Small systems mean one visit produces the whole quote, which makes the proposal simple and the yes quick.",
    friction:
      "Small tickets in leased suites, and the landlord often owns the equipment, so the firm that wants the work is not always the one that can buy it.",
    typicalLanes: ["multi-service"],
  },
  "56": {
    label: "Administrative and Support Services",
    short: "Admin and facilities",
    occasion:
      "Facilities, janitorial and building services firms hold the maintenance subcontracts for buildings they do not own, which makes them a channel into dozens of sites through one agreement rather than a single account.",
    motion:
      "Ask in the first sentence which buildings they actually control, because getting that wrong wastes the whole conversation. Branch managers are published and reachable, and the offer is trade pricing and response time, not a consumer coupon.",
    friction:
      "They are a middleman with their own margin to protect and their own preferred contractor, so the pitch has to make them look good to their client rather than save them money.",
    typicalLanes: ["multi-service"],
  },
  "42": {
    label: "Wholesale Trade",
    short: "Wholesale",
    occasion:
      "Distribution buildings run large make-up air and dock equipment on a seasonal peak, and the work is done in the quiet months after it clears, which lands their planned spend in the emptiest weeks of a home services year.",
    motion:
      "Operations manager at the site rather than a corporate marketing contact. The pitch is the off-peak date, and it should be priced like one because the crew has the capacity then and not in July.",
    friction:
      "Almost no wholesale operation publishes a site-level email, and the corporate form reaches a region that has never heard of the branch.",
    typicalLanes: ["multi-service"],
  },
  "48": {
    label: "Transportation and Warehousing",
    short: "Logistics",
    occasion:
      "Warehouses that ran seven days a week through peak stand down afterwards, and the deferred plant work lands in the first quarter. Cooling in an occupied warehouse is a heat-safety question before it is a comfort one, which changes who raises it.",
    motion:
      "Site or general manager, in person, because these buildings do not answer generic mail. The safety lead is a second door and often the faster one.",
    friction:
      "Shift patterns make an outage window nearly impossible, and the site manager may not control the budget the parent company holds.",
    typicalLanes: ["multi-service", "partner-employer"],
  },
  "22": {
    label: "Utilities",
    short: "Utilities",
    occasion:
      "This sector is where the money comes from rather than where the leads do. SoCalGas HEER is funded through the end of 2026, LADWP raised its heat pump rebate in November 2025, and Riverside, Pasadena and Burbank all run their own programmes. Every one of those changes what a replacement quote says.",
    motion:
      "Read the programme pages, keep a dated list of what is live and what has died, and make sure the offer copy and the call centre are working from the same version. The federal 25C credit terminated for anything placed in service after 31 December 2025 and TECH single family money is fully reserved, and competitors are still advertising both.",
    friction:
      "The programmes move faster than anybody's website, including the utilities' own: an SCE heat pump factsheet still advertises reserved TECH money and links a programme that has ended. Anything published here has a shelf life measured in weeks.",
    typicalLanes: ["partner-employer", "multi-service"],
  },
  "23": {
    label: "Construction",
    short: "Construction",
    occasion:
      "General contractors and remodellers stand next to a homeowner at the moment a system is opened up, which makes them the fastest referral channel on the board. They are also the sector most likely to be a competitor, because a design-build firm sells the same replacement.",
    motion:
      "The project manager or the owner, and the timing is set by a milestone nobody can predict from outside. This sector rewards being remembered rather than being timely, which means a standing relationship and a referral fee structure rather than a campaign.",
    friction:
      "Unpredictable timing, crews scattered across sites, and a real chance that the firm you are courting quotes the same job you do. Say so on the row rather than pretending the relationship runs one way.",
    typicalLanes: ["multi-service"],
  },
  "51": {
    label: "Information",
    short: "Information",
    occasion:
      "Media, telecom and data operations, which run server rooms with cooling loads that dwarf the offices around them.",
    motion:
      "Not yet established in this territory. See the gap note on the segments board.",
    friction:
      "NO ORGANISATION IN THIS SECTOR SURVIVED VERIFICATION IN THE TERRITORY. Candidates existed and every one of them rested on a single directory line with a generic number. The sector is carried here so its absence is visible rather than silently missing.",
    typicalLanes: ["multi-service"],
  },
};

/**
 * Reading order. Not alphabetical, not numeric. This is a working order.
 *
 * Sectors whose systems fail on their own and whose spend is already
 * budgeted come first, then the large sites, then the referral
 * multipliers, then the small and fast, then the thin sectors.
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
