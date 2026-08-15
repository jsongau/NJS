import type { Venue, Period, Offer, DemoRecipient } from "@/domain/types";

const BREA_PAGE = "https://www.mainevent.com/locations/california/brea/";

/**
 * Main Event Brea, as Main Event publishes it on 11 August 2026.
 *
 * READ THE openingStatus FIELD FIRST. It is "announced", and everything
 * else in this application follows from that one value.
 *
 * The Brea page publishes an address, a phone number, a list of
 * attractions and a heading that reads "Want More Information About The
 * Opening? Inquire Below!". It publishes no hours. Trade press reports
 * the venue is taking over the Regal Edwards West theatre that closed in
 * 2019 and expects to open in 2026; Main Event itself has not published
 * a date.
 *
 * So there is no client base to retain, no walk-in traffic to convert,
 * and no CRM history to mine. There is an address, a phone number, and
 * a trade area full of organisations who do not yet know the building
 * exists.
 */
export const VENUE: Venue = {
  id: "main-event-brea",
  name: "Main Event Brea",
  address: "245 W Birch Street",
  city: "Brea",
  state: "CA",
  postalCode: "92821",
  phone: "(657) 530-1177",
  /** Geocoded from the published street address. ROOFTOP accuracy. */
  lat: 33.9190296,
  lng: -117.9009311,
  locationAccuracy: "verified",
  openingStatus: "announced",
  /**
   * Published as "more than 26 lanes".
   *
   * The hedge is load-bearing and it is kept. 26 is a FLOOR, and every
   * capacity figure in this app computes against the floor, so the
   * capacity screen can only ever understate the building. A prototype
   * that oversells a venue's room to the people who run it has made the
   * one mistake there is no recovering from in a phone screen.
   */
  bowlingLanesPublishedFloor: 26,
  attractions: [
    {
      id: "bowling",
      label: "Bowling",
      breaSpecific: true,
      note: "Published as more than 26 lanes, with dragon ramps for younger bowlers. An exact lane count is not published.",
      source: BREA_PAGE,
      provenance: "public",
    },
    {
      id: "laser-tag",
      label: "Multi-level laser tag arena",
      breaSpecific: true,
      note: "48 inch height minimum applies on the packages that include it.",
      source: BREA_PAGE,
      provenance: "public",
    },
    {
      id: "gravity-ropes",
      label: "Gravity Ropes",
      breaSpecific: true,
      note: "A select-locations attraction brand-wide, and named explicitly for Brea. Worth leading with, because the nearest competitors do not have it.",
      source: BREA_PAGE,
      provenance: "public",
    },
    {
      id: "arcade",
      label: "Over 100 games",
      breaSpecific: true,
      note: "Published as over 100 modern and retro games.",
      source: BREA_PAGE,
      provenance: "public",
    },
    {
      id: "restaurant-bar",
      label: "Full-service restaurant and bar",
      breaSpecific: true,
      note: "Handcrafted cocktails, burgers, and giant screens for sport.",
      source: BREA_PAGE,
      provenance: "public",
    },
    {
      id: "meeting-rooms",
      label: "Private party rooms and dedicated meeting space",
      breaSpecific: true,
      note: "Published for Brea as suitable for team building, mini-retreats and planning sessions, with catering, free WiFi, AV and free on-site parking. The NUMBER of rooms and their capacities are not published.",
      source: BREA_PAGE,
      provenance: "public",
    },
  ],
  source: BREA_PAGE,
  provenance: "public",
};

/**
 * Attractions Main Event offers at other venues and does NOT publish for
 * Brea. Kept deliberately, because a sales manager who promises a group
 * an escape room that Brea has not announced has created a refund.
 */
export const NOT_PUBLISHED_FOR_BREA = [
  "Billiards",
  "Virtual reality",
  "Escape rooms",
  "Indoor mini golf",
  "Shuffleboard",
  "Rock climbing",
] as const;

/**
 * The pre-opening calendar.
 *
 * Main Event has not published an opening date, so these periods are
 * counted in WEEKS TO OPEN rather than against a month. That is not a
 * workaround, it is how the job is actually run: you cannot plan
 * outreach against a date nobody has given you, but you can absolutely
 * plan it against "twelve weeks out", and every window snaps into place
 * the day the date is announced.
 */
export const PERIODS: Period[] = [
  {
    id: "t-minus-16",
    label: "16 to 13 weeks out",
    startDate: "2026-08-17",
    endDate: "2026-09-13",
    weeksToOpen: 16,
    provenance: "illustrative",
  },
  {
    id: "t-minus-12",
    label: "12 to 9 weeks out",
    startDate: "2026-09-14",
    endDate: "2026-10-11",
    weeksToOpen: 12,
    provenance: "illustrative",
  },
  {
    id: "t-minus-8",
    label: "8 to 5 weeks out",
    startDate: "2026-10-12",
    endDate: "2026-11-08",
    weeksToOpen: 8,
    provenance: "illustrative",
  },
  {
    id: "t-minus-4",
    label: "4 weeks out to open",
    startDate: "2026-11-09",
    endDate: "2026-12-06",
    weeksToOpen: 4,
    provenance: "illustrative",
  },
];

export const DEFAULT_PERIOD_ID = "t-minus-12";

export const PERIOD_BY_ID: Record<string, Period> = Object.fromEntries(
  PERIODS.map((p) => [p.id, p]),
);

/**
 * What you can put on the table before the doors open.
 *
 * NOTE WHAT IS NOT HERE: a discount off a price Main Event has never
 * published. You cannot discount a secret, and every corporate package
 * in this portfolio is unpriced by design.
 *
 * Pre-opening leverage is a different currency. It is PRIORITY and
 * CERTAINTY: first pick of opening-month dates, a rate locked before it
 * exists publicly, a name on a wall. Those cost the venue nothing and
 * are worth something precisely because the calendar is empty, which is
 * the one and only commercial advantage of selling a building that has
 * not opened.
 */
export const OFFERS: Offer[] = [
  {
    id: "first-fifty",
    name: "First pick of the opening calendar",
    what: "First pick of any date in opening month, held without a deposit until Main Event publishes an opening date, at which point the hold converts or releases. Nothing is booked yet, so the choice is genuinely open and every date taken is one nobody else can have.",
    rationale:
      "Costs nothing while the calendar is empty and is worth the most it will ever be worth right now. It also solves the objection that stops every pre-opening conversation, which is that nobody wants to pay a deposit against a date that does not exist yet.",
    /* Every lane, including local retail and food. An owner-operator
       whose whole objection is that the building is not open yet is
       answered by the same thing a school district is answered by: a
       held date that costs them nothing and releases itself if the
       opening lands wrong. */
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
    eligiblePackageFamilies: ["corporate", "youth-group", "buyout"],
    costToVenue: 0,
    costNote:
      "Zero. The only thing given away is queue position in a queue that does not exist yet.",
    provenance: "illustrative",
  },
  {
    id: "founding-partner-tour",
    name: "Hard hat tour",
    what: "A walk of the building before anybody else has been inside it, for referral partners and the largest calendar-locked buyers.",
    rationale:
      "The hospitality and civic lane converts on the tour and almost nowhere else, because a hotel sales director will not recommend a venue they have not seen. A construction-phase walk is more memorable than a finished one and can be given weeks before there is anything to sell.",
    /* Deliberately not offered to local retail and food. The hard hat
       tour is expensive in the only currency that is scarce before
       opening, which is the sales manager's hours, and it is spent on
       referral partners and on the largest buyers. A twelve person boba
       counter half a mile away will see the building finished from the
       pavement anyway. */
    eligibleLanes: ["hospitality-civic", "schools", "corporate", "colleges"],
    eligiblePackageFamilies: ["corporate", "buyout"],
    costToVenue: 0,
    costNote:
      "Zero in cash. It costs the sales manager an hour and whatever the general contractor says about hard hats.",
    provenance: "illustrative",
  },
  {
    id: "spirit-night-first-quarter",
    name: "Spirit Night, in the opening months",
    what: "A Spirit Night fundraiser in the opening months, on Main Event's published terms of 20% of sales donated back, with the pick of the nights while nothing is booked.",
    rationale:
      "The one offer in this list that is not invented. Main Event publishes the 20% figure itself, which means it can be quoted to a school or a nonprofit today without any approval from anybody. It also fills a slow night with a group that brings its own crowd.",
    /* Not offered to local retail and food, for the plain reason that
       Main Event's published programme donates its share to a nonprofit
       and a boba shop is not one. Stretching the offer to fit the new
       lane would have meant misdescribing somebody else's published
       terms. */
    eligibleLanes: ["schools", "faith-nonprofit", "fitness-youth-sports", "colleges"],
    eligiblePackageFamilies: ["fundraiser"],
    costToVenue: 20,
    costNote:
      "20% of sales on the night, per Main Event's published programme. The venue keeps the other 80% of revenue it would otherwise not have had.",
    provenance: "public",
  },
  {
    id: "midweek-daytime-lock",
    name: "Midweek daytime rate lock",
    what: "A rate agreed now and honoured for a year, for any group willing to book Monday to Thursday before 5pm. A rate is only this cheap to agree while there is no rate card and nothing on the calendar.",
    rationale:
      "Weekday daytime is the emptiest inventory a venue owns and the hardest to sell once it is open. Main Event has already restricted several packages to exactly those hours, so this offer sells the hours the company itself is trying to fill. Schools, clinics, senior care and any shop or restaurant crew whose own trade runs in the evening can all move; a corporate holiday party cannot.",
    /* Local retail and food belongs here more squarely than anything
       else on the list. Shop and restaurant crews trade in the evening
       and at the weekend, so the hours they are all free are exactly the
       weekday daytime hours this offer sells, and a restaurant's dark
       Monday is the emptiest inventory in both buildings at once. */
    eligibleLanes: [
      "schools",
      "healthcare",
      "faith-nonprofit",
      "corporate",
      "local-retail-food",
    ],
    eligiblePackageFamilies: ["youth-group", "corporate"],
    costToVenue: 0,
    costNote:
      "No cash cost. It trades a peak-hour price the venue was unlikely to get for these groups anyway against certainty on hours that would otherwise be empty.",
    provenance: "illustrative",
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
export const DEMO_RECIPIENT: DemoRecipient = "events.brea@demo.invalid";

/**
 * Main Event's own published contact routes, which are worth stating
 * plainly because their shape is a finding in itself.
 *
 * There is a national number, a Brea number, an inquiry form on every
 * events page, and exactly one published email address on the entire
 * site: media@mainevent.com, for press. A venue whose largest packages
 * are all gated behind "contact the local sales manager" publishes no
 * way to email a sales manager.
 */
export const INBOUND_ROUTES = {
  nationalPhone: "877-624-6298",
  nationalPhoneHours: "Mon to Sun, 8am to 7pm CST",
  breaPhone: "(657) 530-1177",
  eventBookingUrl: "https://www.mainevent.com/book/events/",
  breaInquiryForm: BREA_PAGE,
  publishedEmailAddresses: ["media@mainevent.com"],
  publishedSalesEmail: null,
  source: "https://www.mainevent.com/contact-us/",
} as const;
