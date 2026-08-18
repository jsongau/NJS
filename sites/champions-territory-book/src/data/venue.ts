import type { Venue, Period, Offer, DemoRecipient } from "@/domain/types";

const BREA_PAGE = "https://servicechampions.com";

/**
 * THE ANCHOR THIS BOARD MEASURES FROM.
 *
 * The console this was copied from was built around one building, and
 * every distance on the map was measured from its front door. A division
 * marketing console needs an anchor too, and the honest one is the
 * division's own Brea address rather than an idea of a head office.
 *
 * ── WHY SERVICE CHAMPIONS BREA AND NOT "CHAMPIONS GROUP, BREA" ─────
 * Because the second one is not published anywhere. Champions Group
 * Holdings publishes exactly one corporate address on its own contact
 * page and it is in IRVINE, at 2010 Main Street Suite 1250. The Brea
 * connection is real but it is a brand's office rather than a
 * headquarters: Service Champions Plumbing, Heating & AC publishes
 * "625 Columbia St. Brea, CA 92821" on its own site, and the Marketing
 * Manager role this console was built for is posted in Brea.
 *
 * So the anchor is the brand's published Brea address, labelled as the
 * brand's address, geocoded through the US Census Bureau on 18 August
 * 2026 to 33.930644, -117.907040. Printing a Brea head office that
 * nobody publishes would have been the first invented fact on the board,
 * and it would have been on the first screen.
 *
 * ── THE ANCHOR IS OPEN, AND THE MAP SAYS SO WITHOUT A SOLID PIN ────
 * Brea is a trading branch and has been for years, alongside Colton and
 * Murrieta. The mark on the map is still a dashed ring, and that is a
 * deliberate keep rather than a leftover: the ring means "this one is
 * ours, it is not a prospect", and a solid pin at the centre of a board
 * of three hundred and twenty nine organisations reads as one more of them.
 * What changed is the words under it, which now say the address rather
 * than a countdown.
 */
export const VENUE: Venue = {
  id: "service-champions-brea",
  name: "Service Champions, Brea",
  address: "625 Columbia St",
  city: "Brea",
  state: "CA",
  postalCode: "92821",
  phone: "(714) 584-6399",
  /** US Census Bureau geocoder, 18 August 2026, exact street match. */
  lat: 33.930644,
  lng: -117.907040,
  locationAccuracy: "verified",
  /**
   * A campaign state rather than a building state. See `OpeningStatus`
   * in domain/types.ts: "announced" is a published campaign running to a
   * printed end date with no successor published, which is exactly where
   * the West Division sits on 18 August 2026.
   */
  openingStatus: "announced",
  /**
   * THE FIELD CAPACITY THIS CONSOLE COMPUTES AGAINST, AND THE ONE
   * NUMBER ON THE BOARD THAT IS AN ASSUMPTION RATHER THAN A FACT.
   *
   * Say the weakness first. Service Champions publishes NO technician
   * count, NO truck count and NO crew count anywhere retrievable, on the
   * about page, the careers page or the Greenhouse board. So 26 daily
   * crew slots for the Brea branch is a working assumption, and every
   * screen that divides by it is doing modelled arithmetic. It is set
   * low on purpose: a demand plan that overstates the field books work
   * the trucks cannot run, which is the one mistake a marketing manager
   * cannot apologise their way out of.
   *
   * ── THE RULE IT INHERITS, WHICH IS WORTH KEEPING ──────────────────
   * Where a company hedges a published figure, compute against the FLOOR
   * of the hedge and never against its reach. Champions Group publishes
   * "over 1,800 field technicians" and "over 2,400 combined employees",
   * and both are floors: the true numbers are at least those and could
   * be anything above them. Neither can be divided down to one brand in
   * one division without inventing the split, which is why neither of
   * them is this constant. They are the reason the constant is marked as
   * an assumption instead of dressed up as published.
   *
   * The identifier is inherited from the console this was adapted from
   * and is read in six other files, so it is left alone. What it means
   * is written here.
   */
  crewSlotsModelledFloor: 26,
  attractions: [
    {
      id: "hvac",
      label: "Heating and air conditioning",
      breaSpecific: true,
      note: "The line the live campaign leads on, at a 47 dollar AC tune-up. Published as cooling, heating and HVAC. Mid-August is the tail of peak cooling, so this line is at its loudest and about to hand over to heating.",
      source: BREA_PAGE,
      provenance: "public",
    },
    {
      id: "plumbing",
      label: "Plumbing",
      breaSpecific: true,
      note: "Named in the brand itself, Plumbing, Heating & AC. The membership adds an annual plumbing inspection and a water heater tank flush, and names whole-home repiping as a thing the fees can be applied to.",
      source: BREA_PAGE,
      provenance: "public",
    },
    {
      id: "electrical",
      label: "Electrical",
      breaSpecific: true,
      note: "Thirteen published services, from panels and surge protection to car charger installation. It is missing from the brand name and from the primary navigation labels, which makes it the clearest local marketing gap on the site: a line the company sells and does not advertise where a buyer looks first.",
      source: BREA_PAGE,
      provenance: "public",
    },
    {
      id: "drain-sewer",
      label: "Drains and sewer",
      breaSpecific: true,
      note: "47 dollar drain clearing with a free camera inspection on the campaign, and 57 dollars for members, which is the wrong way round and worth raising. Free camera and sewer inspections appear at four rival brands, so the inspection is table stakes rather than a differentiator.",
      source: BREA_PAGE,
      provenance: "public",
    },
    {
      id: "water-heater",
      label: "Water heaters",
      breaSpecific: true,
      note: "Published inside the membership benefits rather than as a standalone offer, and no dedicated water heater page was retrievable. It matters anyway because SoCalGas HEER is funded through 31 December 2026 and pays 300 to 575 on a water heater and up to 1,500 on tankless, which is the most reliable rebate money in the region.",
      source: BREA_PAGE,
      provenance: "public",
    },
    {
      id: "meeting-rooms",
      label: "The proof wall",
      breaSpecific: true,
      note: "25 years in business, Diamond Certified for a nineteenth consecutive year, BBB accredited and A plus rated, OC Register People's Choice 2025, Inland Empire Readers' Choice, EPA Lead-Safe certified, and Google 4.9 stars. NO REVIEW COUNT IS PUBLISHED beside the 4.9, and the reviews page returned 404 on repeated attempts, so the star rating cannot be quoted with a volume behind it.",
      source: BREA_PAGE,
      provenance: "public",
    },
  ],
  source: BREA_PAGE,
  provenance: "public",
};

/**
 * Things another brand in the Champions family publishes and Service
 * Champions does NOT.
 *
 * Kept deliberately, and it is the most useful six lines in this file. A
 * division marketing manager works across five brands and reads five
 * sites in a week, and the fastest way to put a correction in front of a
 * customer is to promise them something the brand next door publishes
 * and this one never has. Every item below is real somewhere in the
 * family and absent here.
 */
export const NOT_PUBLISHED_FOR_BREA = [
  "A membership price",
  "A named financing lender",
  "A review count beside the star rating",
  "An indoor air quality offer",
  "A technician or truck count",
  "A system replacement discount",
] as const;

/**
 * THE CAMPAIGN CALENDAR, AND THE ONE DATE ON IT THAT IS PUBLISHED.
 *
 * The console this was adapted from counted its periods in weeks to a
 * date nobody had published, which was defensible there and is nonsense
 * here. Service Champions is open, has been for twenty five years, and
 * has no opening to count towards.
 *
 * What it does have is an END DATE. The summer savings fine print reads
 * "Offers expire 8/31/2026", and Adeedo's seasonal campaign carries the
 * same date. So the figure each period carries is DAYS OF PUBLISHED
 * OFFER RUNWAY: the days between that period's start and 31 August 2026,
 * floored at zero. The first period has fourteen. The other three have
 * none, because NO SUCCESSOR CAMPAIGN IS PUBLISHED, and a period that
 * prints zero is telling the truth about the state of the market rather
 * than failing to find a number.
 *
 * That zero is the argument this console exists to make. Two of five
 * brands go dark on 1 September, the heating pre-season has to launch in
 * September and October, and the work the date points at is building
 * that campaign now. The identifier on the field is inherited and is
 * read in five other files, so it stays; the unit it counts is days and
 * every screen that prints it says so.
 *
 * The figures are counted from each period's published start rather than
 * from the clock, so a screenshot of this board is reproducible and two
 * readers a week apart see the same number.
 */
export const PERIODS: Period[] = [
  {
    id: "t-minus-16",
    label: "August, offer tail",
    startDate: "2026-08-17",
    endDate: "2026-09-13",
    weeksToOpen: 14,
    provenance: "illustrative",
  },
  {
    id: "t-minus-12",
    label: "September, heating launch",
    startDate: "2026-09-14",
    endDate: "2026-10-11",
    weeksToOpen: 0,
    provenance: "illustrative",
  },
  {
    id: "t-minus-8",
    label: "October, heating season",
    startDate: "2026-10-12",
    endDate: "2026-11-08",
    weeksToOpen: 0,
    provenance: "illustrative",
  },
  {
    id: "t-minus-4",
    label: "November, membership push",
    startDate: "2026-11-09",
    endDate: "2026-12-06",
    weeksToOpen: 0,
    provenance: "illustrative",
  },
];

/*
  THE CONSOLE OPENS ON THE PERIOD THE BOARD DAY IS ACTUALLY IN.

  This was briefly set to the first period, on the reasoning that the
  first period is the live one. It is not. The seeded world runs on
  23 September 2026, which is the day every thread, every inbound lead
  and every reply on this board is dated against, and 23 September falls
  inside the SECOND period, not the first. Opening on the first period
  showed a countdown belonging to a window that had closed ten days
  earlier and hid all 102 worked rows in prospectStatus.ts, which are
  keyed to this period.

  The rule is one line: the default period is the period containing the
  board day, and if either of those moves the other has to move with it.
*/
export const DEFAULT_PERIOD_ID = "t-minus-12";

export const PERIOD_BY_ID: Record<string, Period> = Object.fromEntries(
  PERIODS.map((p) => [p.id, p]),
);

/**
 * THE ONLY PUBLISHED DATE IN THE ENTIRE PORTFOLIO.
 *
 * Service Champions and Adeedo both carry the same fine print under
 * their summer campaigns: "Offers expire 8/31/2026". Read on
 * 18 August 2026, on the brands' own pages. ASI, Powell and Timo's
 * publish standing offers with no expiry printed at all, and no brand in
 * the family publishes anything scheduled to follow 31 August.
 *
 * ── WHY THE COUNTDOWN IS COMPUTED AND NOT STORED ──────────────────
 * It was stored, once, as a number on each period, and it produced the
 * worst defect this application has had: a rail that read "14 days to
 * expiry" on a board dated 23 September, three weeks AFTER the date it
 * was counting to. A figure held in one file and a clock held in another
 * will drift, and the drift is invisible because both halves look right
 * on their own.
 *
 * So there is one date here, one clock in selectors/record.ts, and the
 * figure is the subtraction. It cannot disagree with itself.
 *
 * ── AND WHAT THE NEGATIVE NUMBER IS ALLOWED TO SAY ────────────────
 * That the date has passed. NOT that nothing has replaced it today,
 * because nobody read the site today. The claim this application is
 * entitled to make is the one it can source: on 18 August 2026 the only
 * published date was 31 August 2026 and no successor campaign was
 * published anywhere on either site. Everything on screen says it that
 * way.
 */
export const PUBLISHED_OFFER_EXPIRY = "2026-08-31";

/** The day the offers and the fine print were read off the brands' pages. */
export const OFFER_READ_ON = "2026-08-18";

/**
 * Whole days from a board day to the published expiry. Negative once the
 * date has passed. Both arguments are plain YYYY-MM-DD, parsed at noon
 * UTC so a timezone can never move the answer by a day.
 */
export function daysToOfferExpiry(boardDay: string): number {
  const a = Date.parse(`${boardDay}T12:00:00Z`);
  const b = Date.parse(`${PUBLISHED_OFFER_EXPIRY}T12:00:00Z`);
  return Math.round((b - a) / 86400000);
}

/**
 * WHAT THE FIVE BRANDS ARE ACTUALLY PUTTING IN MARKET RIGHT NOW.
 *
 * Every figure below is the brand's own published number, read off its
 * own site on 18 August 2026. Nothing here is invented and nothing is
 * modelled. That is the whole value of the card: a division manager who
 * has to be the expert in an assigned brand cannot be, unless the other
 * four are on the same screen at the same time.
 *
 * ── FOUR CARDS, FIVE BRANDS, AND WHY THAT IS NOT A ROUNDING ───────
 * Powell and Timo's each publish exactly one standing offer with no
 * expiry date, and they share the fourth card for that reason. The
 * alternatives were worse: dropping a brand, or splitting the two
 * Service Champions 47 dollar coupons across two cards and pretending
 * they were separate campaigns when they sit on one page under one piece
 * of fine print with one expiry. The card says both brands and both
 * figures out loud rather than hiding the join.
 *
 * ── EVERY CARD CARRIES ITS EXPIRY, OR THE ABSENCE OF ONE ──────────
 * That is the only column that matters in August. Two of the five expire
 * on 31 August with nothing published to follow them. Three carry no end
 * date at all, which means they never go stale and never feel urgent.
 * Both states are a decision somebody made, and neither is visible
 * anywhere on the brands' own sites.
 *
 * ── THE FINDING THIS LIST EXISTS TO SET UP ────────────────────────
 * Not one of the fourteen brands in the research publishes a membership
 * price except ASI at 19.95 a month and Timo's at 15 a month. Every
 * other plan, CHAMP-Rewards included, names itself and hides the number.
 * A transparently priced monthly membership as the headline offer is
 * unoccupied ground, it cannot be beaten by printing a smaller coupon,
 * and it turns a one job click into recurring revenue. The offers below
 * are the evidence for that recommendation rather than the
 * recommendation itself.
 */
export const OFFERS: Offer[] = [
  {
    id: "first-fifty",
    name: "Service Champions, summer savings",
    what: "47 dollars for an AC tune-up, and 47 dollars for a drain clearing with a free camera inspection. Both sit on one published page under one piece of fine print: cannot be combined with any other offer, no cash value, offers expire 31 August 2026.",
    rationale:
      "It is the only Service Champions offer with a number on it that a homeowner can act on without ringing anybody, and it is what every dollar of paid search in this territory currently points at. It also has two weeks left to run and no successor published, which is why the campaign period on this console counts against this date and not against anything else.",
    /* Every service line, and that is a claim about the CAMPAIGN rather
       than about the coupon. The banner runs sitewide, on the home page
       and on every offers page, so a lead arriving on any line arrives
       inside the summer campaign. Where it gets thin is plain enough to
       say: a water heater enquiry is not served by a tune-up coupon, and
       the card marks the eligibility list as this console's proposal
       rather than as published terms. */
    eligibleLanes: [
      "hvac",
      "plumbing",
      "multi-service",
      "drain-sewer",
      "partner-community",
      "electrical",
      "partner-property",
      "partner-employer",
      "water-heater",
    ],
    eligiblePackageFamilies: ["corporate", "youth-group", "buyout"],
    costToVenue: 47,
    costNote:
      "47 dollars is the published price of the job, not a discount off a list price, because no list price is published. What the campaign costs the brand cannot be computed from anything on the site.",
    provenance: "public",
  },
  {
    id: "founding-partner-tour",
    name: "ASI Hastings, the always-on menu",
    what: "Nine offers published as a standing price menu with no expiry date printed on any of them: a 0 dollar plumbing check, a 77 dollar HVAC check, a 57 dollar drain, 87 dollar tune-ups and 100 dollars off repairs. ASI also prints its membership at 19.95 a month and a 0 per cent for six months financing term, and neither of those appears anywhere else in the family.",
    rationale:
      "It is the control the other four are measured against. A menu with no expiry never needs a successor built for it, never goes stale on the site, and never leaves a fortnight of paid search pointing at a coupon that has run out. What it gives up is urgency, and ASI buys that back with the only published membership price and the only published financing term in the family.",
    /* ASI trades in San Diego County only, twenty eight cities, so this
       card is a comparison rather than something extendable in the Brea
       territory. The lane list is the set of lines its menu actually
       covers and it is this console's reading, not ASI's. */
    eligibleLanes: ["partner-employer", "hvac", "multi-service", "plumbing"],
    eligiblePackageFamilies: ["corporate", "buyout"],
    costToVenue: 0,
    costNote:
      "The entry point is a 0 dollar plumbing check, so the published price of the first visit is nothing and the cost is the visit itself. ASI publishes no figure for what that visit costs it.",
    provenance: "public",
  },
  {
    id: "spirit-night-first-quarter",
    name: "Adeedo, the summer campaign",
    what: "3,500 dollars off a system, an 88 dollar tune-up and a 57 dollar drain, on one seasonal page dated to expire 31 August 2026. Four older Adeedo campaign pages are still live and still indexed, dated 31 March 2025, 15 September 2025 and 31 December 2025.",
    rationale:
      "The largest published number in the family and the clearest warning in it. Adeedo shares its expiry with Service Champions, so on 1 September two of the five brands go dark at once. The four dead pages still standing are what happens when nobody owns the takedown, and auditing them is a week of work with a published finding at the end of it.",
    /* Adeedo covers three counties and seventy one cities, which overlaps
       this territory heavily, so the overlap is a real question rather
       than a comparison: two Champions brands quoting different prices
       for a drain in the same postcode is a thing a homeowner can see. */
    eligibleLanes: ["hvac", "partner-property", "electrical", "plumbing"],
    eligiblePackageFamilies: ["fundraiser"],
    costToVenue: 3500,
    costNote:
      "3,500 dollars off a system is the published concession. Adeedo publishes no list price to subtract it from, so the figure is a ceiling on the discount rather than a computed cost to the brand.",
    provenance: "public",
  },
  {
    id: "midweek-daytime-lock",
    name: "Powell and Timo's, the standing offers",
    what: "Powell Electric publishes 49 dollars off an electrical repair. Timo's publishes 100 dollars off indoor air quality, and its Advantage Plan at 15 a month or 189 a year. Neither offer carries an expiry date and neither brand has built a seasonal campaign around one.",
    rationale:
      "Two brands on one card because each publishes exactly one standing offer, and together they make the point the other three cannot: an offer with no end date is never stale and never urgent. Powell is the family's electrical-only brand while Service Champions sells electrical and does not advertise it, which is the cheapest cross-brand lesson on this board.",
    /* The lane list is the pair of lines these two offers actually name,
       plus the two partner lines a standing offer can be quoted to at any
       time of year precisely because it never expires. */
    eligibleLanes: [
      "hvac",
      "partner-community",
      "partner-property",
      "multi-service",
      "water-heater",
    ],
    eligiblePackageFamilies: ["youth-group", "corporate"],
    costToVenue: 49,
    costNote:
      "49 dollars off at Powell and 100 dollars off at Timo's, both published, neither with an end date. The figure on the card is the lower of the two, because a card that prints the larger one flatters the pair.",
    provenance: "public",
  },
];

export const OFFER_BY_ID: Record<string, Offer> = Object.fromEntries(
  OFFERS.map((o) => [o.id, o]),
);

/**
 * The demo recipient.
 *
 * .invalid is reserved by RFC 2606 and can never resolve, so a Send
 * action in this prototype has a real address to put in a To: field and
 * no possible route to a human being. There is no email transport
 * anywhere in this dependency tree; sending writes a row to the outbox
 * and nothing leaves the browser.
 */
export const DEMO_RECIPIENT: DemoRecipient = "leads.brea@demo.invalid";

/**
 * Service Champions' own published contact routes, which are worth
 * stating plainly because their shape is a finding in itself.
 *
 * ONE PHONE NUMBER carries the entire brand. (714) 584-6399 is on the
 * home page, the offers pages, the financing page, the membership page
 * and the contact page, and there is no separate Colton or Murrieta
 * number, so three branches and four counties route to one queue. ONE
 * EMAIL ADDRESS is published on the whole site and it is a maintenance
 * inbox. There is no marketing address, no sales address and no press
 * address. Published hours are Monday to Friday and Saturday daytime,
 * sitting beside a 24/7 live answering claim and a 24/7 emergency
 * membership benefit, which is a conflict a caller meets at 9pm.
 *
 * For a console whose whole budget is framed as driving incremental
 * phone calls and web leads, that is the funnel: one number, one form,
 * one inbox that is not read by anybody in marketing.
 */
export const INBOUND_ROUTES = {
  nationalPhone: "(714) 584-6399",
  nationalPhoneHours:
    "Mon to Fri 8am to 7pm, Sat 8am to 5pm, Sun closed, with 24/7 live answering advertised alongside",
  breaPhone: "(714) 584-6399",
  eventBookingUrl: "https://servicechampions.com/contact-us/",
  breaInquiryForm: BREA_PAGE,
  publishedEmailAddresses: ["maintenance@servicechampions.com"],
  publishedSalesEmail: null,
  source: "https://servicechampions.com/contact-us/",
} as const;
