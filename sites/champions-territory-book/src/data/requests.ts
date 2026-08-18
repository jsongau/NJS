import type {
  GroupRequest,
  PlanInterest,
  PlanProgramme,
  QualifyingField,
  MissingReason,
} from "@/domain/requests";
import { responseDueFrom } from "@/domain/requests";

/**
 * The inbound queue, seeded.
 *
 * TWENTY FOUR LEADS, AND EVERY ONE OF THEM IS INVENTED. Every row
 * carries "illustrative" provenance and the console says so on screen
 * rather than in a footnote. Nobody has enquired about anything through
 * this application, because this application is an unaffiliated work
 * sample and there is no brand behind it.
 *
 * WHAT IS NOT INVENTED IS THE SHAPE. The field set on each row is the
 * field set of the route it came through, and the routes behave the way
 * the Champions Group's own Digital Marketing Specialist posting says
 * they behave: speed to lead across LSA, Yelp and HomeAdvisor, with call
 * answer rates as the reported metric. A lead that arrived through a
 * Local Services Ad carries a category and a phone number and nothing
 * else, because that is all Google hands over. A lead that arrived
 * through the brand's own web form carries the address, the window and
 * the fault, because the brand wrote those questions itself. The
 * difference between those two rows is the reason this screen exists.
 *
 * WHAT THE MIX IS FOR. A seeded queue where everything is new and
 * nothing is late is a screenshot, not a model. This one is built to
 * exercise the failures:
 *
 *   THREE are past the response commitment and still unanswered.
 *   ONE has lapsed entirely. It arrived on 4 September as a Local
 *   Services Ad lead, nobody rang it, and it is now nineteen days old.
 *   Nobody said no. Google billed for it on the day it arrived, so that
 *   row is not a stale entry on a board, it is money spent on a job that
 *   went to whoever answered that afternoon. It is the single most
 *   useful row here and it is the row a stored task list would never
 *   have shown anybody.
 *   TWO went quiet after a real conversation, and one of the two stopped
 *   replying at the exact moment it learned the membership has no
 *   published price.
 *   TWO were lost, and both of them said why. One was lost to a rival's
 *   published replacement incentive of up to 2,000 dollars, against a
 *   brand that publishes no replacement incentive at all. That objection
 *   is worth more than the job was.
 *   ONE is marked won with no line in the book, so the two ledgers
 *   disagree and the queue says so.
 *
 * NO INVENTED PEOPLE. Every row carries a role and no row carries a
 * name, exactly as the prospect list does. Where a lead came from
 * somebody who is not in prospects.ts, they are recorded as a DESCRIPTOR
 * rather than a name: "Homeowner, Yorba Linda" and not an invented
 * person or an invented business. A made-up business in a real trade
 * area is a claim about somebody who exists, and there are real
 * landlords in Placentia.
 *
 * NO INVENTED CONTACT DETAILS EITHER. Every email here sits on the
 * .invalid domain, which RFC 2606 reserves and which can never resolve,
 * the same guarantee the outbound half of the console gets from
 * DEMO_RECIPIENT. Phone numbers are null throughout: an .invalid address
 * is obviously fictional at a glance and a phone number is not. On a
 * board about answering the phone quickly, that absence is awkward, and
 * it is still the right call.
 */

const AS_OF = "2026-09-23T09:00:00-07:00";

/**
 * The moment the queue is read from.
 *
 * Injected everywhere rather than read off the clock, so the overdue
 * count in a screenshot taken today is the overdue count a reader sees
 * next March. A queue whose numbers move when nobody has touched it is a
 * queue nobody can check.
 *
 * It sits inside the console's default period and it agrees with the
 * reply dates already seeded in data/book.ts.
 */
export const REQUESTS_AS_OF = AS_OF;

/** Shorthand for the three-field reason map, which every row carries. */
function reasons(
  desiredDate: MissingReason,
  headcount: MissingReason,
  eventType: MissingReason,
): Record<QualifyingField, MissingReason> {
  return { desiredDate, headcount, eventType };
}

/** A Local Services Ad carries none of the three. The common case. */
const BREA_FORM_GAP = reasons(
  "not-asked-by-route",
  "not-asked-by-route",
  "not-asked-by-route",
);

/**
 * Every commercial value on a seeded row, with the reason it is what it
 * is. `fieldSet` is illustrative rather than public and that is a change
 * worth noticing: no Champions brand publishes the schema of its intake
 * forms and neither Google nor the marketplaces publish theirs in
 * anything citable, so how each route behaves is this console's reading
 * and not a quotation.
 */
const ILLUSTRATIVE = {
  request: "illustrative",
  fieldSet: "illustrative",
  responseDue: "illustrative",
  headcount: "illustrative",
} as const;

export const SEED_REQUESTS: GroupRequest[] = [
  // -------------------------------------------------------------
  // PAST THE COMMITMENT AND STILL UNANSWERED.
  // Three rows, and they are the first three deliberately. Every one
  // of them was paid for on arrival.
  // -------------------------------------------------------------
  {
    id: "req-01",
    channel: "brea-form",
    prospectId: "saint-angela-merici-catholic-church",
    organisationName: null,
    contactRole: "Parish facilities coordinator",
    lane: "partner-property",
    email: "facilities-office@demo.invalid",
    phone: null,
    note: "Google passed a first name, a mobile number and its own category, Heating and Air Conditioning. Nothing else came with it: no address, no preferred window and nothing about what has actually failed. The number matches the parish office already on the partner list.",
    askSummary:
      "Heating and air conditioning, category only. Nobody yet knows what has broken or where.",
    suggestedPackageId: "adeedo-3500-system",
    desiredDate: null,
    headcount: null,
    eventType: null,
    fieldReasons: BREA_FORM_GAP,
    freeTourRequested: null,
    multiLocation: null,
    receivedAt: "2026-09-21T11:15:00-07:00",
    responseDueAt: responseDueFrom("2026-09-21T11:15:00-07:00"),
    status: "new",
    firstRespondedAt: null,
    lastContactAt: null,
    agreedNextStepAt: null,
    closedAt: null,
    closeReason: null,
    provenance: ILLUSTRATIVE,
  },
  {
    id: "req-02",
    channel: "phone",
    prospectId: null,
    organisationName: "Apartment community, Placentia",
    contactRole: "On-site property manager",
    lane: "electrical",
    email: "site-office@demo.invalid",
    phone: null,
    note: "Voicemail on the tracked number. A hundred and twenty units, original panels from 1978, and two unit disconnects have failed this month. Wants to know whether a survey can run building by building and what that costs. No date, because the board has not met yet.",
    askSummary: "Panel and disconnect survey across 120 units, no date until the board meets.",
    suggestedPackageId: "timos-advantage-15",
    desiredDate: null,
    headcount: 120,
    eventType: "Panel and disconnect survey",
    fieldReasons: reasons("sender-does-not-know", "captured", "captured"),
    freeTourRequested: null,
    multiLocation: null,
    receivedAt: "2026-09-22T09:30:00-07:00",
    responseDueAt: responseDueFrom("2026-09-22T09:30:00-07:00"),
    status: "new",
    firstRespondedAt: null,
    lastContactAt: null,
    agreedNextStepAt: null,
    closedAt: null,
    closeReason: null,
    provenance: ILLUSTRATIVE,
  },
  {
    id: "req-03",
    channel: "brea-form",
    prospectId: "gentle-dental-brea",
    organisationName: null,
    contactRole: "Practice manager",
    lane: "partner-community",
    email: "practice-manager@demo.invalid",
    phone: null,
    note: "Google passed a name, a number and the category Plumbing. No address, no window and nothing about the fault. The number matches a dental practice already on the partner list, which is the only reason anybody knows who this is.",
    askSummary:
      "Plumbing, category only. The route back is a phone call and there is nothing else on the record.",
    suggestedPackageId: "rival-sheldons-magnolia",
    desiredDate: null,
    headcount: null,
    eventType: null,
    fieldReasons: BREA_FORM_GAP,
    freeTourRequested: null,
    multiLocation: null,
    receivedAt: "2026-09-22T13:05:00-07:00",
    responseDueAt: responseDueFrom("2026-09-22T13:05:00-07:00"),
    status: "new",
    firstRespondedAt: null,
    lastContactAt: null,
    agreedNextStepAt: null,
    closedAt: null,
    closeReason: null,
    provenance: ILLUSTRATIVE,
  },

  // -------------------------------------------------------------
  // DUE TODAY, UNANSWERED. Still inside the commitment.
  // -------------------------------------------------------------
  {
    id: "req-04",
    channel: "events-form",
    prospectId: "troy-high-school",
    organisationName: null,
    contactRole: "District facilities director",
    lane: "hvac",
    email: "facilities-office@demo.invalid",
    phone: null,
    note: "Comparing contractors for a rooftop replacement in the June break, which is the only window the campus is empty. Needs the phasing, the licence number and the insurance certificates in writing before it goes to the board.",
    askSummary: "Summer rooftop replacement across the campus, written up for a board paper.",
    suggestedPackageId: "champ-rewards-unpriced",
    desiredDate: "2027-06-11",
    headcount: 12,
    eventType: "Rooftop unit replacement",
    fieldReasons: reasons("captured", "captured", "captured"),
    freeTourRequested: true,
    multiLocation: false,
    receivedAt: "2026-09-22T16:20:00-07:00",
    responseDueAt: responseDueFrom("2026-09-22T16:20:00-07:00"),
    status: "new",
    firstRespondedAt: null,
    lastContactAt: null,
    agreedNextStepAt: null,
    closedAt: null,
    closeReason: null,
    provenance: ILLUSTRATIVE,
  },
  {
    id: "req-05",
    channel: "brea-form",
    prospectId: null,
    organisationName: "Homeowner, Yorba Linda",
    contactRole: "Homeowner",
    lane: "hvac",
    email: "homeowner@demo.invalid",
    phone: null,
    note: "Google passed a first name, a mobile number and the category Heating and Air Conditioning. No address, no window, nothing about the fault. Charged on arrival whether or not anybody rings it back.",
    askSummary: "Heating and air conditioning, category only. Everything else is a phone call.",
    suggestedPackageId: "asi-rewards-1995",
    desiredDate: null,
    headcount: null,
    eventType: null,
    fieldReasons: BREA_FORM_GAP,
    freeTourRequested: null,
    multiLocation: null,
    receivedAt: "2026-09-22T17:30:00-07:00",
    responseDueAt: responseDueFrom("2026-09-22T17:30:00-07:00"),
    status: "new",
    firstRespondedAt: null,
    lastContactAt: null,
    agreedNextStepAt: null,
    closedAt: null,
    closeReason: null,
    provenance: ILLUSTRATIVE,
  },
  {
    id: "req-06",
    channel: "go-see",
    prospectId: "stonefire-grill-brea",
    organisationName: null,
    contactRole: "General manager",
    lane: "water-heater",
    email: "site-manager@demo.invalid",
    phone: null,
    note: "HomeAdvisor match. Two tankless units at the restaurant, one of them cutting out at lunchtime, and the job came through with the property but no window on it. The same lead was sold to three other contractors in the same minute.",
    askSummary: "Two commercial water heaters, one failing. No window, and the lead is shared.",
    suggestedPackageId: "rival-sheldons-magnolia",
    desiredDate: null,
    headcount: 2,
    eventType: "Commercial water heater replacement",
    fieldReasons: reasons("not-asked-by-route", "captured", "captured"),
    freeTourRequested: null,
    multiLocation: null,
    receivedAt: "2026-09-23T08:10:00-07:00",
    responseDueAt: responseDueFrom("2026-09-23T08:10:00-07:00"),
    status: "new",
    firstRespondedAt: null,
    lastContactAt: null,
    agreedNextStepAt: null,
    closedAt: null,
    closeReason: null,
    provenance: ILLUSTRATIVE,
  },

  // -------------------------------------------------------------
  // ANSWERED, AND NOW ON THE DESK'S OWN CLOCK RATHER THAN THE
  // RESPONSE COMMITMENT.
  // -------------------------------------------------------------
  {
    id: "req-07",
    channel: "events-form",
    prospectId: "california-state-university-fullerton",
    organisationName: null,
    contactRole: "Campus facilities planner",
    lane: "plumbing",
    email: "facilities-planning@demo.invalid",
    phone: null,
    note: "Planning a repipe survey on a residence block in the January break, which is the only fortnight the building is empty. Purchasing pays on invoice rather than by card, and the licence number has to appear on the paperwork.",
    askSummary:
      "Repipe survey across a 200 door residence block, invoiced to the university.",
    suggestedPackageId: "rival-hero-club",
    desiredDate: "2027-01-22",
    headcount: 200,
    eventType: "Repipe survey, residence block",
    fieldReasons: reasons("captured", "captured", "captured"),
    freeTourRequested: false,
    multiLocation: false,
    receivedAt: "2026-09-21T09:05:00-07:00",
    responseDueAt: responseDueFrom("2026-09-21T09:05:00-07:00"),
    status: "acknowledged",
    firstRespondedAt: "2026-09-21T11:20:00-07:00",
    lastContactAt: "2026-09-21T11:20:00-07:00",
    agreedNextStepAt: null,
    closedAt: null,
    closeReason: null,
    provenance: ILLUSTRATIVE,
  },
  {
    id: "req-08",
    channel: "events-form",
    prospectId: null,
    organisationName: "Retail strip, Yorba Linda",
    contactRole: "Building manager",
    lane: "drain-sewer",
    email: "building-office@demo.invalid",
    phone: null,
    note: "Came through the form on the drain landing page. Six units share one main line and it has backed up twice this quarter. Asked straight out whether the camera inspection is genuinely included or whether it turns up on the invoice afterwards.",
    askSummary:
      "Main line clearing across six units, and a direct question about whether the camera inspection is free.",
    suggestedPackageId: "rival-nexgen-protection",
    desiredDate: "2026-12-18",
    headcount: 6,
    eventType: "Main line clearing and camera inspection",
    fieldReasons: reasons("captured", "captured", "captured"),
    freeTourRequested: true,
    multiLocation: false,
    receivedAt: "2026-09-18T14:00:00-07:00",
    responseDueAt: responseDueFrom("2026-09-18T14:00:00-07:00"),
    status: "acknowledged",
    firstRespondedAt: "2026-09-18T15:10:00-07:00",
    lastContactAt: "2026-09-18T15:10:00-07:00",
    agreedNextStepAt: null,
    closedAt: null,
    closeReason: null,
    provenance: ILLUSTRATIVE,
  },
  {
    id: "req-09",
    channel: "brea-form",
    prospectId: "boys-girls-club-brea-placentia-yorba-linda",
    organisationName: null,
    contactRole: "Site operations manager",
    lane: "partner-property",
    email: "site-operations@demo.invalid",
    phone: null,
    note: "Arrived as a Local Services Ad lead with a category and a number and nothing else. One call recovered three club sites and a wish to put all of them on a single maintenance agreement instead of ringing round each time something fails. No date, because the trustees decide.",
    askSummary:
      "One maintenance agreement across three club sites, date waiting on the trustees.",
    suggestedPackageId: "community-programmes-unpriced",
    desiredDate: null,
    headcount: 3,
    eventType: "Maintenance agreement across three sites",
    fieldReasons: reasons("sender-does-not-know", "captured", "captured"),
    freeTourRequested: null,
    multiLocation: null,
    receivedAt: "2026-09-17T10:00:00-07:00",
    responseDueAt: responseDueFrom("2026-09-17T10:00:00-07:00"),
    status: "qualifying",
    firstRespondedAt: "2026-09-17T12:00:00-07:00",
    lastContactAt: "2026-09-21T09:30:00-07:00",
    agreedNextStepAt: null,
    closedAt: null,
    closeReason: null,
    provenance: ILLUSTRATIVE,
  },
  {
    id: "req-10",
    channel: "brea-form",
    prospectId: "brea-urgent-care",
    organisationName: null,
    contactRole: "Clinic operations manager",
    lane: "partner-community",
    email: "clinic-operations@demo.invalid",
    phone: null,
    note: "Arrived as a Local Services Ad lead. A call got as far as the job, an air quality and filtration survey for the waiting rooms, and no further: no address confirmed, no count of the units, and the cost has to be known before it goes to the partners.",
    askSummary:
      "Filtration survey for the clinic, priced before it can go to the partners.",
    suggestedPackageId: "rival-mr-rooter-advantage",
    desiredDate: null,
    headcount: null,
    eventType: "Air quality and filtration survey",
    fieldReasons: reasons(
      "not-asked-by-route",
      "not-asked-by-route",
      "captured",
    ),
    freeTourRequested: null,
    multiLocation: null,
    receivedAt: "2026-09-18T15:40:00-07:00",
    responseDueAt: responseDueFrom("2026-09-18T15:40:00-07:00"),
    status: "qualifying",
    firstRespondedAt: "2026-09-21T10:15:00-07:00",
    lastContactAt: "2026-09-22T11:00:00-07:00",
    agreedNextStepAt: null,
    closedAt: null,
    closeReason: null,
    provenance: ILLUSTRATIVE,
  },
  {
    id: "req-11",
    channel: "go-see",
    prospectId: null,
    organisationName: "Small landlord, Brea and La Habra",
    contactRole: "Owner",
    lane: "water-heater",
    email: "landlord@demo.invalid",
    phone: null,
    note: "A Yelp request, which means a message and no phone number on it at all. Twelve units across three fourplexes, water heaters all fitted the same year, and they want them replaced a few at a time rather than all at once. The only route back is the platform inbox.",
    askSummary:
      "Phased water heater replacement across twelve units, and no phone number to ring.",
    suggestedPackageId: "rival-sheldons-magnolia",
    desiredDate: null,
    headcount: 12,
    eventType: "Phased water heater replacement",
    fieldReasons: reasons("not-asked-by-route", "captured", "captured"),
    freeTourRequested: null,
    multiLocation: null,
    receivedAt: "2026-09-21T18:40:00-07:00",
    responseDueAt: responseDueFrom("2026-09-21T18:40:00-07:00"),
    status: "qualifying",
    firstRespondedAt: "2026-09-22T12:00:00-07:00",
    lastContactAt: "2026-09-22T12:00:00-07:00",
    agreedNextStepAt: null,
    closedAt: null,
    closeReason: null,
    provenance: ILLUSTRATIVE,
  },

  // -------------------------------------------------------------
  // QUOTED. An estimate is out and nothing is scheduled.
  // -------------------------------------------------------------
  {
    id: "req-12",
    channel: "quote-page",
    prospectId: "envista-world-headquarters",
    organisationName: null,
    contactRole: "Facilities operations manager",
    lane: "multi-service",
    email: "facilities-operations@demo.invalid",
    phone: null,
    note: "Came back on the estimate. Asked whether the HVAC service and the plumbing inspection could run as one visit rather than two, since the building only releases access once a quarter, and what a December window does to the number.",
    askSummary:
      "HVAC and plumbing planned maintenance folded into one visit rather than two.",
    suggestedPackageId: "rival-authority-club",
    desiredDate: "2026-12-04",
    headcount: 90,
    eventType: "Planned maintenance across the site",
    fieldReasons: reasons("captured", "captured", "captured"),
    freeTourRequested: null,
    multiLocation: null,
    receivedAt: "2026-09-14T10:00:00-07:00",
    responseDueAt: responseDueFrom("2026-09-14T10:00:00-07:00"),
    status: "quoted",
    firstRespondedAt: "2026-09-14T10:45:00-07:00",
    lastContactAt: "2026-09-18T14:00:00-07:00",
    agreedNextStepAt: null,
    closedAt: null,
    closeReason: null,
    provenance: ILLUSTRATIVE,
  },
  {
    id: "req-13",
    channel: "referral",
    prospectId: "embassy-suites-by-hilton-brea-north-orange-count",
    organisationName: null,
    contactRole: "Director of engineering",
    lane: "partner-employer",
    email: "engineering-desk@demo.invalid",
    phone: null,
    note: "Passed on by the hotel's own engineering desk on behalf of a neighbouring property. They know the job is a survey of the room units and they do not know the address or how many rooms are in it. They want to walk the site themselves before anything is committed.",
    askSummary:
      "Referred survey of the room units. Address and room count both unknown.",
    suggestedPackageId: "rival-nexgen-protection",
    desiredDate: null,
    headcount: null,
    eventType: "Room unit survey",
    fieldReasons: reasons(
      "not-asked-by-route",
      "not-asked-by-route",
      "captured",
    ),
    freeTourRequested: true,
    multiLocation: null,
    receivedAt: "2026-09-15T11:30:00-07:00",
    responseDueAt: responseDueFrom("2026-09-15T11:30:00-07:00"),
    status: "quoted",
    firstRespondedAt: "2026-09-15T12:15:00-07:00",
    lastContactAt: "2026-09-16T16:00:00-07:00",
    agreedNextStepAt: null,
    closedAt: null,
    closeReason: null,
    provenance: ILLUSTRATIVE,
  },
  {
    id: "req-14",
    channel: "phone",
    prospectId: "brea-jiu-jitsu",
    organisationName: null,
    contactRole: "Studio owner",
    lane: "electrical",
    email: "studio-owner@demo.invalid",
    phone: null,
    note: "Called about a sub-panel upgrade and two chargers in the car park. Wants it done on a Saturday when the studio is shut, and asked twice whether the permit sits inside the number quoted or arrives afterwards as an extra.",
    askSummary:
      "Sub-panel upgrade and two chargers, Saturday, and the permit question asked twice.",
    suggestedPackageId: "timos-advantage-15",
    desiredDate: "2026-12-19",
    headcount: 1,
    eventType: "Sub-panel and charger install",
    fieldReasons: reasons("captured", "captured", "captured"),
    freeTourRequested: null,
    multiLocation: null,
    receivedAt: "2026-09-17T13:20:00-07:00",
    responseDueAt: responseDueFrom("2026-09-17T13:20:00-07:00"),
    status: "quoted",
    firstRespondedAt: "2026-09-17T13:55:00-07:00",
    lastContactAt: "2026-09-21T10:00:00-07:00",
    agreedNextStepAt: null,
    closedAt: null,
    closeReason: null,
    provenance: ILLUSTRATIVE,
  },

  // -------------------------------------------------------------
  // HELD. An install date against no deposit, which is a date
  // nobody else can be given.
  // -------------------------------------------------------------
  {
    id: "req-15",
    channel: "events-form",
    prospectId: "beckman-coulter-inc",
    organisationName: null,
    contactRole: "Site facilities lead",
    lane: "multi-service",
    email: "site-facilities@demo.invalid",
    phone: null,
    note: "Planned replacement across the Brea site, two hundred and eighty units in scope. They need the install date held while procurement runs its supplier checks, which they say takes three to four weeks every time.",
    askSummary:
      "Planned replacement across 280 units, date held while procurement runs its checks.",
    suggestedPackageId: "rival-nexgen-protection",
    desiredDate: "2026-12-11",
    headcount: 280,
    eventType: "Planned replacement across the site",
    fieldReasons: reasons("captured", "captured", "captured"),
    freeTourRequested: true,
    multiLocation: false,
    receivedAt: "2026-09-09T09:40:00-07:00",
    responseDueAt: responseDueFrom("2026-09-09T09:40:00-07:00"),
    status: "held",
    firstRespondedAt: "2026-09-09T10:30:00-07:00",
    lastContactAt: "2026-09-18T11:00:00-07:00",
    /* The one row on the board with an agreed callback date. Procurement
       told the desk three to four weeks in their own words, so the
       console's generic five day hold interval is wrong for this one and
       their date stands instead. */
    agreedNextStepAt: "2026-10-09T10:00:00-07:00",
    closedAt: null,
    closeReason: null,
    provenance: ILLUSTRATIVE,
  },
  {
    id: "req-16",
    channel: "brea-form",
    prospectId: "the-cause-church-brea",
    organisationName: null,
    contactRole: "Campus facilities director",
    lane: "partner-property",
    email: "campus-facilities@demo.invalid",
    phone: null,
    note: "Arrived as a Local Services Ad lead and a call filled in the rest. Four units on the campus, the main hall furnace is the one that has failed, and they want it replaced before the winter services start. Asked what the finance terms are, because nobody they have rung publishes one.",
    askSummary:
      "Main hall furnace replacement before the winter services, and a question about finance terms.",
    suggestedPackageId: "adeedo-3500-system",
    desiredDate: "2026-12-18",
    headcount: 4,
    eventType: "Furnace replacement, main hall",
    fieldReasons: reasons(
      "sender-does-not-know",
      "not-asked-by-route",
      "not-asked-by-route",
    ),
    freeTourRequested: null,
    multiLocation: null,
    receivedAt: "2026-09-10T19:20:00-07:00",
    responseDueAt: responseDueFrom("2026-09-10T19:20:00-07:00"),
    status: "held",
    firstRespondedAt: "2026-09-11T09:50:00-07:00",
    lastContactAt: "2026-09-14T15:00:00-07:00",
    agreedNextStepAt: null,
    closedAt: null,
    closeReason: null,
    provenance: ILLUSTRATIVE,
  },

  // -------------------------------------------------------------
  // WON. Two of these have a line in the book. One does not, and
  // that disagreement is the point of the third.
  // -------------------------------------------------------------
  {
    id: "req-17",
    channel: "quote-page",
    prospectId: "heights-christian-schools-brea-campus",
    organisationName: null,
    contactRole: "Director of operations",
    lane: "hvac",
    email: "operations-office@demo.invalid",
    phone: null,
    note: "Came back on the estimate and asked whether the tune-up cadence could be split spring and autumn to match the published plan rather than done in one pass. Confirmed a November start works around the school calendar.",
    askSummary: "Campus tune-up agreement across nine units, split spring and autumn.",
    suggestedPackageId: "free-inspection-tier",
    desiredDate: "2026-11-20",
    headcount: 9,
    eventType: "Tune-up agreement across the campus",
    fieldReasons: reasons("captured", "captured", "captured"),
    freeTourRequested: null,
    multiLocation: null,
    receivedAt: "2026-09-08T10:10:00-07:00",
    responseDueAt: responseDueFrom("2026-09-08T10:10:00-07:00"),
    status: "won",
    firstRespondedAt: "2026-09-08T11:05:00-07:00",
    lastContactAt: "2026-09-19T14:00:00-07:00",
    agreedNextStepAt: null,
    closedAt: "2026-09-19T14:00:00-07:00",
    closeReason: "Signed the tune-up agreement at the published promotional price.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "req-18",
    channel: "phone",
    prospectId: "team-kwon-taekwondo-center-hq",
    organisationName: null,
    contactRole: "Studio owner",
    lane: "electrical",
    email: "front-desk@demo.invalid",
    phone: null,
    note: "Called about a dead circuit in the training hall and took the first Saturday offered. Asked what the member repair discount would be, and there is no published figure for this brand, so a manager typed a number into the estimate.",
    askSummary: "Lighting and circuit repair in the training hall, Saturday.",
    suggestedPackageId: "timos-advantage-15",
    desiredDate: "2026-12-12",
    headcount: 1,
    eventType: "Lighting and circuit repair",
    fieldReasons: reasons("captured", "captured", "captured"),
    freeTourRequested: null,
    multiLocation: null,
    receivedAt: "2026-09-05T14:30:00-07:00",
    responseDueAt: responseDueFrom("2026-09-05T14:30:00-07:00"),
    status: "won",
    firstRespondedAt: "2026-09-05T15:00:00-07:00",
    lastContactAt: "2026-09-17T09:00:00-07:00",
    agreedNextStepAt: null,
    closedAt: "2026-09-17T09:00:00-07:00",
    closeReason: "Signed on a price a manager typed. No published figure exists for this repair discount.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "req-19",
    channel: "go-see",
    prospectId: "crumbl-cookies-brea",
    organisationName: null,
    contactRole: "Store manager",
    lane: "water-heater",
    email: "store-manager@demo.invalid",
    phone: null,
    note: "HomeAdvisor match, rung back inside the hour and confirmed by the franchisee the same afternoon. Answering first is the entire reason this one closed: the identical lead went to three other contractors at the same moment.",
    askSummary: "Water heater replacement at the store, won by answering first.",
    suggestedPackageId: "rival-sheldons-magnolia",
    desiredDate: "2026-11-16",
    headcount: 1,
    eventType: "Water heater replacement",
    fieldReasons: reasons("captured", "captured", "captured"),
    freeTourRequested: null,
    multiLocation: null,
    receivedAt: "2026-09-16T15:00:00-07:00",
    responseDueAt: responseDueFrom("2026-09-16T15:00:00-07:00"),
    status: "won",
    firstRespondedAt: "2026-09-16T15:05:00-07:00",
    lastContactAt: "2026-09-22T16:00:00-07:00",
    agreedNextStepAt: null,
    closedAt: "2026-09-22T16:00:00-07:00",
    closeReason: "Agreed verbally and confirmed by the franchisee. Not yet written into the book.",
    provenance: ILLUSTRATIVE,
  },

  // -------------------------------------------------------------
  // LOST. Both said why, and both reasons outlive the job.
  // -------------------------------------------------------------
  {
    id: "req-20",
    channel: "phone",
    prospectId: "fairway-ford",
    organisationName: null,
    contactRole: "Dealership facilities manager",
    lane: "drain-sewer",
    email: "facilities-desk@demo.invalid",
    phone: null,
    note: "Called about the service bay drains and mentioned in the same breath that the site has been on an annual contract with the same plumber for three years. Said to come back in February, when that contract goes out for renewal.",
    askSummary: "Service bay drain maintenance, already on somebody else's annual contract.",
    suggestedPackageId: "rival-nexgen-protection",
    desiredDate: null,
    headcount: 4,
    eventType: "Drain and grease line maintenance",
    fieldReasons: reasons("sender-does-not-know", "captured", "captured"),
    freeTourRequested: null,
    multiLocation: null,
    receivedAt: "2026-09-08T13:00:00-07:00",
    responseDueAt: responseDueFrom("2026-09-08T13:00:00-07:00"),
    status: "lost",
    firstRespondedAt: "2026-09-08T13:40:00-07:00",
    lastContactAt: "2026-09-10T11:00:00-07:00",
    agreedNextStepAt: null,
    closedAt: "2026-09-10T11:00:00-07:00",
    closeReason:
      "On an annual contract with an incumbent plumber for three years running. February was left open for the renewal, which is a different answer from no.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "req-21",
    channel: "go-see",
    prospectId: null,
    organisationName: "Homeowner, La Habra",
    contactRole: "Homeowner",
    lane: "partner-community",
    email: "homeowner-la-habra@demo.invalid",
    phone: null,
    note: "A Yelp request for a full system replacement, priced against two other contractors in the same afternoon. One of them advertises up to 2,000 dollars off a replacement on its own home page. This brand publishes a 47 dollar tune-up and no replacement incentive at all, so there was no number to put beside theirs.",
    askSummary: "Full system replacement, decided on a straight comparison of published incentives.",
    suggestedPackageId: "rival-sheldons-magnolia",
    desiredDate: null,
    headcount: 1,
    eventType: "Full system replacement",
    fieldReasons: reasons("not-asked-by-route", "captured", "captured"),
    freeTourRequested: null,
    multiLocation: null,
    receivedAt: "2026-09-11T11:00:00-07:00",
    responseDueAt: responseDueFrom("2026-09-11T11:00:00-07:00"),
    status: "lost",
    firstRespondedAt: "2026-09-11T11:30:00-07:00",
    lastContactAt: "2026-09-15T10:00:00-07:00",
    agreedNextStepAt: null,
    closedAt: "2026-09-15T10:00:00-07:00",
    closeReason:
      "Lost to a rival's published replacement incentive of up to 2,000 dollars. This brand publishes no replacement incentive anywhere, so the desk had nothing to answer with. The objection is worth more than the job was.",
    provenance: ILLUSTRATIVE,
  },

  // -------------------------------------------------------------
  // GONE QUIET. We answered. They stopped.
  // -------------------------------------------------------------
  {
    id: "req-22",
    channel: "events-form",
    prospectId: "viewsonic-corporation",
    organisationName: null,
    contactRole: "Regional facilities manager",
    lane: "multi-service",
    email: "facilities-region@demo.invalid",
    phone: null,
    note: "Asked what a planned maintenance agreement costs per unit across two sites and whether anything was on offer for multi-site accounts. Went quiet after the first reply and has not opened anything since.",
    askSummary: "Planned maintenance across two sites, price per unit asked for up front.",
    suggestedPackageId: "rival-hero-club",
    desiredDate: null,
    headcount: 130,
    eventType: "Planned maintenance, two sites",
    fieldReasons: reasons("asked-and-left-blank", "captured", "captured"),
    freeTourRequested: false,
    multiLocation: true,
    receivedAt: "2026-09-02T10:20:00-07:00",
    responseDueAt: responseDueFrom("2026-09-02T10:20:00-07:00"),
    status: "gone-quiet",
    firstRespondedAt: "2026-09-03T15:30:00-07:00",
    lastContactAt: "2026-09-11T09:00:00-07:00",
    agreedNextStepAt: null,
    closedAt: null,
    closeReason: null,
    provenance: ILLUSTRATIVE,
  },
  {
    id: "req-23",
    channel: "brea-form",
    prospectId: "new-american-funding-brea-branch",
    organisationName: null,
    contactRole: "Branch manager",
    lane: "drain-sewer",
    email: "branch-office@demo.invalid",
    phone: null,
    note: "Arrived as a Local Services Ad lead. Asked what the maintenance membership costs before scheduling a drain clearing, and stopped replying the moment the answer was that no price is published for it anywhere.",
    askSummary: "Wanted the membership price before scheduling anything. There is not one published.",
    suggestedPackageId: "rival-sheldons-magnolia",
    desiredDate: null,
    headcount: 1,
    eventType: "Membership and drain clearing enquiry",
    fieldReasons: reasons(
      "not-asked-by-route",
      "not-asked-by-route",
      "captured",
    ),
    freeTourRequested: null,
    multiLocation: null,
    receivedAt: "2026-09-15T09:15:00-07:00",
    responseDueAt: responseDueFrom("2026-09-15T09:15:00-07:00"),
    status: "gone-quiet",
    firstRespondedAt: "2026-09-16T14:00:00-07:00",
    lastContactAt: "2026-09-17T14:00:00-07:00",
    agreedNextStepAt: null,
    closedAt: null,
    closeReason: null,
    provenance: ILLUSTRATIVE,
  },

  // -------------------------------------------------------------
  // LAPSED. Nobody said no. Nobody said anything. The lead was paid
  // for on the day it arrived and it bought nothing.
  // -------------------------------------------------------------
  {
    id: "req-24",
    channel: "brea-form",
    prospectId: "fullerton-college",
    organisationName: null,
    contactRole: "Campus facilities coordinator",
    lane: "plumbing",
    email: "campus-facilities@demo.invalid",
    phone: null,
    note: "Arrived on 4 September as a Local Services Ad lead: a name, a number and the category Plumbing. Nobody ever rang it. Google billed for it on the day it landed, so the money was spent and the job went to whoever answered that afternoon.",
    askSummary:
      "Plumbing, category only. Nineteen days old, paid for, and never answered.",
    suggestedPackageId: "rival-hero-club",
    desiredDate: null,
    headcount: null,
    eventType: null,
    fieldReasons: BREA_FORM_GAP,
    freeTourRequested: null,
    multiLocation: null,
    receivedAt: "2026-09-04T14:00:00-07:00",
    responseDueAt: responseDueFrom("2026-09-04T14:00:00-07:00"),
    status: "lapsed",
    firstRespondedAt: null,
    lastContactAt: null,
    agreedNextStepAt: null,
    closedAt: null,
    closeReason: null,
    provenance: ILLUSTRATIVE,
  },
];

export const REQUEST_BY_ID: Record<string, GroupRequest> = Object.fromEntries(
  SEED_REQUESTS.map((r) => [r.id, r]),
);

// ---------------------------------------------------------------
// The membership programme
// ---------------------------------------------------------------

const LEAGUES_PAGE = "https://servicechampions.com/champ-rewards/";

/**
 * CHAMP-Rewards, exactly as published on 18 August 2026.
 *
 * Read the `unpublished` array before the rest of it. The plan page is
 * generous and specific about what a member gets and it does not carry a
 * price. No monthly figure, no annual figure, no joining fee, no term
 * and no cancellation clause: the page routes that question to a phone
 * number instead.
 *
 * AND THAT IS THE WHOLE MARKET RATHER THAN ONE BRAND'S OVERSIGHT.
 * Across the thirteen rivals profiled for this console, every single one
 * names a maintenance plan and hides the number. Two brands inside the
 * same holding group publish theirs openly, ASI at 19.95 a month and
 * Timo's at 15 a month or 189 a year, which proves the number can be
 * printed without the sky falling in. This file says that rather than
 * scoring a cheap point off one page.
 *
 * WHY IT IS THE STRONGEST FINDING IN THE SCRAPE. A homeowner searching
 * at two on a hot afternoon can compare six drain prices in ninety
 * seconds and cannot compare a single maintenance plan. The drain war is
 * already under a hundred dollars and the floor has been broken at 57,
 * so the next move down is unprofitable. A transparently priced monthly
 * membership is the one position in this market that cannot be answered
 * by printing a smaller coupon, and it turns a one-job click into
 * recurring revenue.
 *
 * WHAT IS NOT IN THIS FILE: a price. Inventing one for a plan the brand
 * has deliberately declined to publish would take the credibility of
 * every real figure beside it.
 */
export const OPEN_LANE_SOCIALS: PlanProgramme = {
  id: "open-lane-socials",
  name: "CHAMP-Rewards",
  bannerName: "the Service Champions membership plan",
  registrationStatus: "Open to join, no price published",
  playNights: [
    "AC precision tune-up and clean, spring",
    "Furnace tune-up and clean, autumn",
    "Annual plumbing inspection with a water heater flush",
  ],
  perks: [
    "25% off repairs",
    "Diagnostic fee reduced to $19",
    "Member drain clearing at $57",
  ],
  leaderboardNote:
    "Accumulated membership fees are applied against a replacement system, ductwork or a repipe, and the plan transfers to a new home or to a new owner on sale.",
  namedLocations: ["Brea", "Colton", "Murrieta"],
  registrationUrl: "https://servicechampions.com/champ-rewards/",
  unpublished: [
    {
      field: "Price",
      note: "No monthly or annual dollar amount appears anywhere on the plan page; it routes the question to a phone number. Every one of the thirteen rivals profiled for this console does the same. Two brands inside this holding group, ASI at 19.95 a month and Timo's at 15 a month, publish theirs openly, so this is a decision rather than an industry impossibility.",
      provenance: "withheld",
    },
    {
      field: "Minimum term",
      note: "Nothing on the page states how long a member is committed for, or whether the plan runs monthly or annually.",
      provenance: "withheld",
    },
    {
      field: "Cancellation terms",
      note: "Not published. Worth flagging beside CSLB AB 1327, which now requires a contract to carry an email address and to allow cancellation by email, because a plan with no published cancellation route sits awkwardly next to that.",
      provenance: "withheld",
    },
    {
      field: "The credit cap",
      note: "Fees are published as applying toward a replacement, ductwork or a repipe, with no ceiling, no expiry and no statement of what happens to the credit if the membership lapses.",
      provenance: "withheld",
    },
    {
      field: "How many members are on it",
      note: "The group publishes 150,000 active members while its own home page tiles say 100,000 club members. Neither figure is broken out by brand or by plan, so the size of this programme specifically is not a number anybody outside can state.",
      provenance: "withheld",
    },
  ],
  breaStatus: "unannounced",
  breaNote:
    "Whether the price will ever be published has not been said either way. Recording it as a refusal would be inventing a decision nobody has announced, and recording it as coming soon would be inventing a plan. It is withheld today and that is all anybody outside the building knows.",
  source: LEAGUES_PAGE,
  provenance: "public",
};

/**
 * People asking what the membership costs, on a plan with no price.
 *
 * These are asks, not enrolments, and the difference is the whole reason
 * the type exists. There is no figure to quote. What there is instead is
 * evidence: three separate organisations asking the recurring-revenue
 * question unprompted, in a market where fourteen brands out of fourteen
 * refuse to answer it.
 *
 * A marketing manager cannot publish the price on their own authority.
 * They can answer honestly, quote every published inclusion, and carry
 * the demand to whoever decides whether the number gets printed, which
 * is a more useful thing to do with an unanswerable question than
 * deleting it.
 */
export const SEED_LEAGUE_INTEREST: PlanInterest[] = [
  {
    id: "lg-01",
    prospectId: "viewsonic-corporation",
    organisationName: null,
    contactRole: "Regional facilities manager",
    lane: "multi-service",
    email: "facilities-region@demo.invalid",
    receivedAt: "2026-09-19T10:40:00-07:00",
    householdsExpected: 24,
    preferredNights: [
      "AC precision tune-up and clean, spring",
      "Furnace tune-up and clean, autumn",
    ],
    note: "Saw CHAMP-Rewards named on the brand site and asked what it costs across twenty four units on two sites. Wants the two seasonal tune-ups and nothing else, and wants to compare it against what the incumbent charges per visit.",
    answerable: "unannounced-for-brea",
    standingAnswer:
      "CHAMP-Rewards is a real published plan and every inclusion on it can be quoted: the two seasonal tune-ups, the annual plumbing inspection, priority scheduling, 25 per cent off repairs, a 19 dollar diagnostic and member drain clearing at 57 dollars. The price is not published anywhere and this desk will not invent one. The interest is being recorded.",
    answeredAt: null,
    provenance: { request: "illustrative", programme: "public" },
  },
  {
    id: "lg-02",
    prospectId: "brea-chamber-of-commerce",
    organisationName: null,
    contactRole: "Membership director",
    lane: "partner-employer",
    email: "membership@demo.invalid",
    receivedAt: "2026-09-22T15:10:00-07:00",
    householdsExpected: null,
    preferredNights: ["Annual plumbing inspection with a water heater flush"],
    note: "Asked whether chamber members could be offered the maintenance plan at a members' rate, on the basis that several of them have asked her the same question. Did not have a number of properties and did not pretend to.",
    answerable: "unannounced-for-brea",
    standingAnswer:
      "The plan is real and its inclusions are published in full. What cannot be answered today is the one thing a member rate would have to be quoted against, because no list price is published to discount from. The ask is recorded and it is the second one this month.",
    answeredAt: null,
    provenance: { request: "illustrative", programme: "public" },
  },
  {
    id: "lg-03",
    prospectId: null,
    organisationName: "Landlord, Brea industrial park",
    contactRole: "Owner",
    lane: "multi-service",
    email: "landlord-office@demo.invalid",
    receivedAt: "2026-09-14T17:50:00-07:00",
    householdsExpected: 16,
    preferredNights: [
      "AC precision tune-up and clean, spring",
      "Furnace tune-up and clean, autumn",
    ],
    note: "Sixteen units across two buildings, all on the same failing schedule, and asked what a year on the plan costs per unit. Answered the same day with every published inclusion and the plain fact that no price is published for any of it.",
    answerable: "unannounced-for-brea",
    standingAnswer:
      "Answered on 15 September with the published inclusions in full and the plain statement that no membership price is published, here or at any of the thirteen rivals checked. Recorded as standing demand for a plan somebody could actually read a number off.",
    answeredAt: "2026-09-15T09:30:00-07:00",
    provenance: { request: "illustrative", programme: "public" },
  },
];

export const LEAGUE_INTEREST_BY_ID: Record<string, PlanInterest> =
  Object.fromEntries(SEED_LEAGUE_INTEREST.map((l) => [l.id, l]));
