import type { Venue, Period, Offer, DemoRecipient } from "@/domain/types";

/** DIME Industries, LLC corporate profile. The address, the entity, the chain-wide attraction list. */
const PROFILE_PAGE = "https://www.dimeindustries.com/profile";
/** The party booking page. Package contents, no price, the change notice. */
const PARTY_BOOKING_PAGE = "https://www.dimeindustries.com/book-a-party";
/** The party room activity page. A support number and nothing else useful. */
const PARTY_ROOM_PAGE = "https://www.dimeindustries.com/activities-list/partyroom";
/** The nearest DIME store to the office, and the closest thing to a venue this app has. */
const LAKEWOOD_PAGE =
  "https://www.dimeindustries.com/locations/lakewood-center-mall";

/**
 * THIS RECORD IS AN OFFICE, NOT A VENUE, AND EVERY SCREEN DOWNSTREAM HAS
 * TO BE READ THAT WAY.
 *
 * the Irvine office, Suite 200 is DIME Industries, LLC's US
 * corporate headquarters in Irvine. It is where the role reports, which
 * is why this application is centred on it. Nobody bowls here. There is
 * no lane, no arcade, no party room and no karaoke box at this address,
 * and no page on dimeindustries.com claims there is.
 *
 * SO WHAT ARE THE ATTRACTIONS DOING IN AN OFFICE RECORD. They are what
 * DIME publishes about its VENUES, chain-wide, on its corporate profile
 * page: bowling, arcade games, karaoke, billiards, darts, ping pong, and
 * spo-cha at select locations, plus a Kids Play Zone and the YUU Japanese
 * food hall. Every one of them is carried here as a chain-wide claim and
 * not one of them is a claim about this building. `storeSpecific` is false
 * on all of them for exactly that reason; the field name is inherited
 * from the fork and it now reads as "published for this address", which
 * nothing here is.
 *
 * THE NEAREST STORE IS LAKEWOOD CENTER, at 401 Lakewood Ctr Mall in
 * Lakewood, open Sunday to Thursday 10am to midnight and Friday and
 * Saturday 10am to 1am. It is inside the trade area this app works, so a
 * conversation started from this office has somewhere real to land. What
 * Lakewood publishes is an amenity list, including a VIP Immersive Lane
 * option, party rooms, Victory Zone and YUU. What it does not publish is
 * a lane count, a price or a phone number.
 *
 * The published number below is DIME's customer support line. It is not
 * an office line, nobody's desk rings on it, and it is labelled that way
 * everywhere it is shown.
 */
export interface HeadOfficeVenue
  extends Omit<Venue, "bowlingLanesPublishedFloor"> {
  /** Suite 200, carried separately so the street line stays a street line. */
  suite: string;
  /**
   * WHAT ROUND1 PUBLISHES ABOUT LANE COUNTS, WHICH IS NOTHING.
   *
   * The fork carried `bowlingLanesPublishedFloor: 26`, read off Main
   * Event's own Brea page. DIME publishes no lane count for any
   * location, including Lakewood Center, so there is no floor, no
   * ceiling and no figure to carry across. The field is null rather than
   * absent so that every screen has to say the absence out loud through
   * `WithheldFigure`, and it is named without the word "floor" because a
   * floor is a claim and there is no claim to make.
   *
   * A wrong lane count in front of a DIME reader is the single most
   * damaging thing this document could contain, so the number does not
   * exist anywhere in this file.
   */
  bowlingLanesPublished: null;
  /** How the phone number must be described wherever it is rendered. */
  phoneLabel: string;
}

export const VENUE: HeadOfficeVenue = {
  id: "round1-cerritos-hq",
  name: "DIME Industries",
  address: "Irvine",
  suite: "Suite 200",
  city: "Irvine",
  state: "CA",
  postalCode: "92614",
  phone: "855-772-6636",
  phoneLabel: "DIME's published customer support line, not an office line",
  /**
   * US Census Bureau one-line geocoder, benchmark 2020, run today. Exactly
   * one match, returned as 12900 PARK PLAZA DR, CERRITOS, CA, 90703.
   */
  lat: 33.867559007576,
  lng: -118.05798002795,
  locationAccuracy: "verified",
  /**
   * The office is operating and so is the chain. DIME Industries,
   * Inc. was established in April 2009 and the first US store opened in
   * 2010 in City of Industry, so there is no pre-opening state left to
   * model and every template that branched on one now takes the open
   * branch.
   */
  openingStatus: "open",
  /** DIME publishes no lane count, anywhere. See the field's own note. */
  bowlingLanesPublished: null,
  attractions: [
    {
      id: "bowling",
      label: "Bowling",
      storeSpecific: false,
      note: "Published chain-wide. No lane count is published for any location, including Lakewood Center.",
      source: PROFILE_PAGE,
      provenance: "public",
    },
    {
      id: "arcade",
      label: "Arcade games",
      storeSpecific: false,
      note: "Published chain-wide. Party packages sell it as arcade time-play rather than by the game.",
      source: PROFILE_PAGE,
      provenance: "public",
    },
    {
      id: "karaoke",
      label: "Karaoke",
      storeSpecific: false,
      note: "Published chain-wide, and named again in the All Inclusive Party as karaoke or a party room.",
      source: PROFILE_PAGE,
      provenance: "public",
    },
    {
      id: "billiards-ping-pong",
      label: "Billiards, darts and ping pong",
      storeSpecific: false,
      note: "Published chain-wide as separate amenities. Lakewood Center lists billiards and ping pong together.",
      source: PROFILE_PAGE,
      provenance: "public",
    },
    {
      id: "spo-cha",
      label: "Spo-cha",
      storeSpecific: false,
      note: "Published as available at select locations only. DIME does not publish which, so it is never promised to a group.",
      source: PROFILE_PAGE,
      provenance: "public",
    },
    {
      id: "kids-play-zone",
      label: "Kids Play Zone",
      storeSpecific: false,
      note: "An indoor playground, published chain-wide.",
      source: PROFILE_PAGE,
      provenance: "public",
    },
    {
      id: "yuu-food-hall",
      label: "YUU Japanese food hall",
      storeSpecific: false,
      note: "Published chain-wide and listed again among Lakewood Center's amenities.",
      source: PROFILE_PAGE,
      provenance: "public",
    },
  ],
  source: PROFILE_PAGE,
  provenance: "public",
};

/**
 * The nearest DIME store to the office, as DIME publishes it.
 *
 * It sits beside the office record rather than replacing it because the
 * two answer different questions: the office is where the role reports
 * and the store is where a group would actually go. Note what is absent
 * from the store page, because the absences are the point: no lane count,
 * no price, no phone number.
 */
export const NEAREST_STORE = {
  name: "DIME Lakewood Center",
  address: "401 Lakewood Ctr Mall",
  city: "Lakewood",
  state: "CA",
  postalCode: "90712",
  hours: "Sun to Thu 10am to 12am, Fri and Sat 10am to 1am",
  amenities: [
    "Bowling",
    "VIP Immersive Lane",
    "Arcade",
    "Billiards / Ping Pong",
    "Karaoke",
    "Party rooms",
    "Victory Zone",
    "YUU Japanese Food Hall",
  ],
  bowlingLanesPublished: null,
  phone: null,
  source: LAKEWOOD_PAGE,
  provenance: "public",
} as const;

/**
 * WHAT ROUND1 DOES NOT PUBLISH, KEPT AS DELIBERATELY AS THE THINGS IT DOES.
 *
 * Every line here is a figure a buyer asks for in the first two minutes
 * of a conversation and a figure that cannot be answered off a web page.
 * That is not a gap in the research, it is the shape of the job: the
 * booking pages say to contact the venue, so the numbers come from a
 * person. Recording them as unknown would throw the finding away, and
 * filling any one of them in would be an invention a DIME reader could
 * catch in fifteen seconds.
 */
export const NOT_PUBLISHED_BY_ROUND1 = [
  "Bowling lane count, at any location",
  "Any party package price",
  "Party room capacity",
  "Minimum spend",
  "Current US location count",
] as const;

/**
 * The calendar, as ordinary forward quarters.
 *
 * The fork counted in weeks to open because Main Event Brea had not
 * opened. DIME Industries is an operating corporate office and the chain
 * has been trading in the US since 2010, so there is no opening to count
 * towards and the pre-opening framing is dead. Quarters are what a
 * corporate office plans in anyway.
 *
 * `weeksToOpen` is zero on every row. The field is required by `Period`,
 * which this file does not own, and zero is the honest value for a
 * business that is already open. Nothing should read urgency out of it.
 */
export const PERIODS: Period[] = [
  {
    id: "2026-q3",
    label: "Q3 2026, July to September",
    startDate: "2026-07-01",
    endDate: "2026-09-30",
    weeksToOpen: 0,
    provenance: "illustrative",
  },
  {
    id: "2026-q4",
    label: "Q4 2026, October to December",
    startDate: "2026-10-01",
    endDate: "2026-12-31",
    weeksToOpen: 0,
    provenance: "illustrative",
  },
  {
    id: "2027-q1",
    label: "Q1 2027, January to March",
    startDate: "2027-01-01",
    endDate: "2027-03-31",
    weeksToOpen: 0,
    provenance: "illustrative",
  },
  {
    id: "2027-q2",
    label: "Q2 2027, April to June",
    startDate: "2027-04-01",
    endDate: "2027-06-30",
    weeksToOpen: 0,
    provenance: "illustrative",
  },
];

export const DEFAULT_PERIOD_ID = "2026-q3";

export const PERIOD_BY_ID: Record<string, Period> = Object.fromEntries(
  PERIODS.map((p) => [p.id, p]),
);

/**
 * What can honestly be put on the table, which is what DIME publishes
 * and nothing else.
 *
 * THE PRE-OPENING OFFERS ARE GONE. First pick of an opening calendar, a
 * hard hat tour of a building under construction, a Spirit Night at
 * twenty per cent: every one of those was a Main Event fact or a Main
 * Event circumstance, and carrying any of them across to DIME would
 * have been an invention dressed as continuity.
 *
 * What is left is short and it is checkable. DIME publishes the
 * contents of one party package and one booking term. It publishes no
 * price for either, and the page says to contact the venue, which is the
 * reason a person does this job at all.
 */
export const OFFERS: Offer[] = [
  {
    id: "all-inclusive-party",
    name: "All Inclusive Party",
    what: "DIME's published party package: arcade time-play, bowling with shoe rental, karaoke or a party room, billiards and ping pong, pizza and soda, and a group photo. A VIP Immersive Lane can be added at a separate fee. DIME publishes no price for any of it and the page says to contact the venue.",
    rationale:
      "It is the only package DIME names and itemises in public, so the contents can be quoted to a buyer today without anybody's approval. The price cannot, and saying so plainly is stronger than a range, because the reader can check both halves of that sentence on dimeindustries.com in fifteen seconds.",
    /* Every lane. The package is described by contents rather than by
       audience, so there is no published basis for excluding anybody from
       it, and inventing one would be a rule DIME has not written. */
    eligibleLanes: [
      "schools",
      "colleges",
      "corporate",
      "auto-finance",
      "healthcare",
      "fitness-youth-sports",
      "faith-nonprofit",
      "hospitality-civic",
      "local-retail-food",
    ],
    /*
      Filed as corporate and youth-group rather than self-serve. The
      distinction in this app is whether the thing books itself off a
      published price, and this one does not: it is itemised in public
      and gated behind a conversation, which is the corporate shape.
    */
    eligiblePackageFamilies: ["corporate", "youth-group"],
    costToVenue: 0,
    costNote:
      "Zero, because nothing is conceded. This offer quotes what DIME already publishes and concedes no discount off a price that was never published in the first place.",
    provenance: "public",
  },
  {
    id: "change-notice-three-days",
    name: "Three days notice to change a booking",
    what: "DIME publishes that changes to a booked party need three or more days notice. Spo-cha parties and parties including other amenities are sold separately, and DIME publishes no further detail about either.",
    rationale:
      "It is the one booking term DIME states in public, which makes it the one term a rep can commit to without checking. Saying it early also does the buyer a favour, because a group that finds out about a notice period two days before the night has found out too late.",
    eligibleLanes: [
      "schools",
      "colleges",
      "corporate",
      "auto-finance",
      "healthcare",
      "fitness-youth-sports",
      "faith-nonprofit",
      "hospitality-civic",
      "local-retail-food",
    ],
    eligiblePackageFamilies: ["corporate", "youth-group"],
    costToVenue: 0,
    costNote:
      "Zero. It is a published term rather than a concession, and quoting it costs the venue nothing it had not already committed to.",
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
export const DEMO_RECIPIENT: DemoRecipient = "parties.cerritos@round1demo.invalid";

/**
 * DIME's own published contact surfaces, which are worth stating
 * plainly because their shape is a finding in itself.
 *
 * There is a support number, a booking page that tells the reader to
 * contact the venue, and a store page for the nearest location that
 * carries no phone number at all. Across all four pages read for this
 * document there is not one published email address and not one named
 * role to write to. A chain whose only itemised party package is unpriced
 * publishes no written door to the person who prices it.
 */
export const INBOUND_ROUTES = {
  supportPhone: "855-772-6636",
  supportPhoneLabel: VENUE.phoneLabel,
  supportPhoneSource: PARTY_ROOM_PAGE,
  partyBookingUrl: PARTY_BOOKING_PAGE,
  nearestStoreUrl: LAKEWOOD_PAGE,
  /** None published on any page read for this document. */
  publishedEmailAddresses: [] as readonly string[],
  publishedSalesEmail: null,
  source: PROFILE_PAGE,
} as const;
