import type {
  GroupRequest,
  LeagueInterest,
  LeagueProgramme,
  QualifyingField,
  MissingReason,
} from "@/domain/requests";
import { responseDueFrom } from "@/domain/requests";

/**
 * The inbound queue, seeded.
 *
 * TWENTY FOUR ENQUIRIES, AND EVERY ONE OF THEM IS INVENTED. Every row
 * carries "illustrative" provenance on the request itself, and the app
 * says so on screen rather than in a footnote. Nobody has enquired about
 * Main Event Brea through this application, because this application is
 * an unaffiliated work sample and there is no venue behind it.
 *
 * WHAT IS NOT INVENTED IS THE SHAPE. The field set on each row is the
 * field set of the route it came through, read off Main Event's own
 * published pages on 11 August 2026. A request that arrived through the
 * Brea opening-interest form carries no date, no headcount and no event
 * type, because that form does not ask for any of the three. A request
 * that arrived through the brand-wide events form carries all three,
 * because that form does. The difference between those two rows is a
 * published fact and it is the reason this screen exists.
 *
 * WHAT THE MIX IS FOR. A seeded queue where everything is new and
 * nothing is late is a screenshot, not a model. This one is built to
 * exercise the failures:
 *
 *   THREE are past the response commitment and still unanswered.
 *   ONE has lapsed entirely. It arrived on 4 September through the Brea
 *   form, nobody replied, and it is now nineteen days old. Nobody said
 *   no. That row is the single most useful thing on the board and it is
 *   the row a stored task list would never have shown anybody.
 *   TWO went quiet after a real conversation.
 *   TWO were lost, and both of them said why. One of the two was lost to
 *   Main Event's own published house policy on outside food, which is
 *   worth far more as a recorded objection than as a booking.
 *   ONE is marked won with no line in the book, so the two ledgers
 *   disagree and the queue says so.
 *
 * NO INVENTED PEOPLE. Every row carries a role and no row carries a
 * name, exactly as the prospect list does. Where an enquiry came from an
 * organisation that is not in prospects.ts, the organisation is recorded
 * as a DESCRIPTOR rather than a business name: "Youth soccer club,
 * Placentia" and not an invented club. A made-up organisation in a real
 * trade area is a claim about somebody who exists, and there are real
 * youth soccer clubs in Placentia.
 *
 * NO INVENTED CONTACT DETAILS EITHER. Every email here sits on the
 * .invalid domain, which RFC 2606 reserves and which can never resolve,
 * the same guarantee the outbound half of the app gets from
 * DEMO_RECIPIENT. Phone numbers are null throughout: an .invalid address
 * is obviously fictional at a glance and a phone number is not.
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
 * It sits inside the default period, t-minus-12, which runs from 14
 * September to 11 October 2026, and it agrees with the reply dates
 * already seeded in data/book.ts.
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

/** The Brea form asks for none of the three. This is the common case. */
const BREA_FORM_GAP = reasons(
  "not-asked-by-route",
  "not-asked-by-route",
  "not-asked-by-route",
);

const ILLUSTRATIVE = {
  request: "illustrative",
  fieldSet: "public",
  responseDue: "illustrative",
  headcount: "illustrative",
} as const;

export const SEED_REQUESTS: GroupRequest[] = [
  // -------------------------------------------------------------
  // PAST THE COMMITMENT AND STILL UNANSWERED.
  // Three rows, and they are the first three deliberately.
  // -------------------------------------------------------------
  {
    id: "req-01",
    channel: "brea-form",
    prospectId: "saint-angela-merici-catholic-church",
    organisationName: null,
    contactRole: "Youth ministry coordinator",
    lane: "faith-nonprofit",
    email: "youth-ministry@demo.invalid",
    phone: null,
    note: "Our high school ministry does a big night out each autumn and we heard a new place is opening on Birch. Roughly how does it work for a group and can we bring our own cake for the birthdays that month?",
    askSummary:
      "Autumn youth night for the high school ministry, and a question about outside food.",
    suggestedPackageId: "school-lock-in",
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
    organisationName: "Youth soccer club, Placentia",
    contactRole: "Club administrator",
    lane: "fitness-youth-sports",
    email: "club-admin@demo.invalid",
    phone: null,
    note: "Voicemail on the Brea number. End of season banquet for the whole club, sometime in November, wants to know if the building will be open and what the deposit looks like.",
    askSummary: "End of season club banquet in November, wants to know about the deposit.",
    suggestedPackageId: "bowl-n-fun",
    desiredDate: null,
    headcount: 120,
    eventType: "Season-end banquet",
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
    lane: "healthcare",
    email: "practice-manager@demo.invalid",
    phone: null,
    note: "Looking at somewhere for a staff appreciation afternoon. We cannot all leave the practice at once so it would likely be two smaller groups on different days rather than one evening.",
    askSummary:
      "Staff appreciation, split across two weekday afternoons because the practice cannot close.",
    suggestedPackageId: "happy-hour",
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
    contactRole: "Assistant Principal for Activities",
    lane: "schools",
    email: "activities-office@demo.invalid",
    phone: null,
    note: "Grad night committee is comparing venues for June. We would need the whole group in one place and supervision arrangements in writing for the district.",
    askSummary: "June grad night, comparing venues, needs supervision terms in writing.",
    suggestedPackageId: "project-graduation",
    desiredDate: "2027-06-11",
    headcount: 420,
    eventType: "Grad night",
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
    organisationName: "Homeschool co-op, north Orange County",
    contactRole: "Co-op activities parent",
    lane: "schools",
    email: "co-op-activities@demo.invalid",
    phone: null,
    note: "We run weekday enrichment days for about eighty families and are looking for somewhere indoors for the winter term. Mornings work better for us than afternoons.",
    askSummary: "Weekday morning enrichment day for a homeschool co-op, winter term.",
    suggestedPackageId: "school-all-access-pass",
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
    lane: "local-retail-food",
    email: "store-manager@demo.invalid",
    phone: null,
    note: "Asked at the counter during a route go-see. Wants somewhere to take the kitchen and front of house crew on a Monday, which is their quietest day. Said they would need a price before asking the owner.",
    askSummary: "Monday crew night for the kitchen and front of house team.",
    suggestedPackageId: "happy-hour",
    desiredDate: null,
    headcount: 38,
    eventType: "Staff appreciation",
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
    contactRole: "Student life programme coordinator",
    lane: "colleges",
    email: "student-life@demo.invalid",
    phone: null,
    note: "Planning a welcome week social for recognised student organisations. Budget is per head and modest. We would need an invoice to the university rather than a card on the night.",
    askSummary:
      "Welcome week social for student organisations, invoiced to the university.",
    suggestedPackageId: "level-up",
    desiredDate: "2027-01-22",
    headcount: 200,
    eventType: "Student social",
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
    organisationName: "Insurance brokerage, Yorba Linda",
    contactRole: "Office manager",
    lane: "auto-finance",
    email: "office-manager@demo.invalid",
    phone: null,
    note: "Holiday party for the office and a few partner agents. Brea was not on the location list so I picked the nearest one and wrote Brea here instead. Is the new site taking bookings yet?",
    askSummary:
      "December holiday party, and a direct question about whether Brea takes bookings yet.",
    suggestedPackageId: "corporate-all-access-pass",
    desiredDate: "2026-12-18",
    headcount: 55,
    eventType: "Holiday party",
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
    contactRole: "Programme director",
    lane: "faith-nonprofit",
    email: "programme-director@demo.invalid",
    phone: null,
    note: "We take our teen members somewhere at the end of each term and we run a fundraiser alongside it. Interested in whether there is anything that gives something back to the club.",
    askSummary:
      "End of term teen outing with a fundraising element attached to it.",
    suggestedPackageId: "spirit-night",
    desiredDate: null,
    headcount: 75,
    eventType: "Teen night with a fundraiser",
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
    lane: "healthcare",
    email: "clinic-operations@demo.invalid",
    phone: null,
    note: "Enquiring on behalf of the clinic. We have never done anything like this and would want to understand cost before taking it to the partners. No fixed date in mind at this stage.",
    askSummary:
      "First-time enquiry for a clinic staff night, cost needed before it goes to the partners.",
    suggestedPackageId: "fun-101",
    desiredDate: null,
    headcount: null,
    eventType: "Staff night",
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
    organisationName: "Boba franchise unit, Brea Mall",
    contactRole: "Store manager",
    lane: "local-retail-food",
    email: "store-team@demo.invalid",
    phone: null,
    note: "Asked at the counter. Twelve staff, mostly students, all free on a weekday before the evening rush. Store manager can approve it without going to the franchisee if it is small enough.",
    askSummary:
      "Small weekday daytime crew night that the store manager can approve alone.",
    suggestedPackageId: "happy-hour",
    desiredDate: null,
    headcount: 12,
    eventType: "Staff appreciation",
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
  // QUOTED. A quote is out and nothing is held.
  // -------------------------------------------------------------
  {
    id: "req-12",
    channel: "quote-page",
    prospectId: "envista-world-headquarters",
    organisationName: null,
    contactRole: "Workplace experience manager",
    lane: "corporate",
    email: "workplace-experience@demo.invalid",
    phone: null,
    note: "Came back on the quote. Asked whether the meeting space could be used in the morning and the bowling in the afternoon as one booking, and what the food minimum would be for that.",
    askSummary:
      "Morning meeting space plus an afternoon on the lanes, as one booking.",
    suggestedPackageId: "all-day-meeting",
    desiredDate: "2026-12-04",
    headcount: 90,
    eventType: "Team offsite",
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
    contactRole: "Director of sales",
    lane: "hospitality-civic",
    email: "hotel-sales@demo.invalid",
    phone: null,
    note: "Passing on a conference group who want an evening off site in the opening quarter. They will ask about a tour before they commit anything and I would want to walk it myself first.",
    askSummary:
      "Referred conference group wanting an evening off site, contingent on a tour.",
    suggestedPackageId: "corporate-all-access-pass",
    desiredDate: null,
    headcount: null,
    eventType: "Conference evening",
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
    contactRole: "Academy owner",
    lane: "fitness-youth-sports",
    email: "academy-owner@demo.invalid",
    phone: null,
    note: "Called about a belt promotion celebration. Wants a Saturday morning, families included, and asked twice whether the venue would definitely be open by then.",
    askSummary:
      "Saturday morning belt promotion celebration with families included.",
    suggestedPackageId: "bowl-n-fun",
    desiredDate: "2026-12-19",
    headcount: 60,
    eventType: "Belt promotion",
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
  // HELD. A date against no deposit, which is a date nobody else
  // can be offered.
  // -------------------------------------------------------------
  {
    id: "req-15",
    channel: "events-form",
    prospectId: "beckman-coulter-inc",
    organisationName: null,
    contactRole: "Site events lead",
    lane: "corporate",
    email: "site-events@demo.invalid",
    phone: null,
    note: "Holiday event for the Brea site. Two hundred and eighty expected. We will need the date held while procurement runs the supplier checks, which usually takes three to four weeks.",
    askSummary:
      "Site holiday event for 280, date held while procurement runs supplier checks.",
    suggestedPackageId: "corporate-all-access-pass",
    desiredDate: "2026-12-11",
    headcount: 280,
    eventType: "Holiday party",
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
       generic five day hold interval is wrong for this one and their
       date stands instead. */
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
    contactRole: "Student ministries pastor",
    lane: "faith-nonprofit",
    email: "student-ministries@demo.invalid",
    phone: null,
    note: "Winter youth night for our middle and high school students. We would bring adult volunteers and we need to know how many we are required to bring for that many students.",
    askSummary:
      "Winter youth night, and a direct question about the chaperone requirement.",
    suggestedPackageId: "school-lock-in",
    desiredDate: "2026-12-18",
    headcount: 96,
    eventType: "Youth night",
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
    contactRole: "Director of advancement",
    lane: "schools",
    email: "advancement-office@demo.invalid",
    phone: null,
    note: "Came back on the voucher quote and asked whether the school could resell them at its own price. Confirmed the redemption window works around the school calendar.",
    askSummary: "Voucher block the school resells itself, redeemed midweek.",
    suggestedPackageId: "play-it-forward",
    desiredDate: "2026-11-20",
    headcount: 60,
    eventType: "Fundraiser voucher block",
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
    closeReason: "Signed the voucher block at the published price.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "req-18",
    channel: "phone",
    prospectId: "team-kwon-taekwondo-center-hq",
    organisationName: null,
    contactRole: "Head instructor",
    lane: "fitness-youth-sports",
    email: "front-desk@demo.invalid",
    phone: null,
    note: "Called about the belt test celebration. Asked for a Saturday before eleven, which is the only weekend window the package is published for, and took the first date offered.",
    askSummary: "Belt test celebration, Saturday morning, 45 guests.",
    suggestedPackageId: "bowl-n-fun",
    desiredDate: "2026-12-12",
    headcount: 45,
    eventType: "Belt test celebration",
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
    closeReason: "Signed on a price a sales manager typed. No published price exists for this package.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "req-19",
    channel: "go-see",
    prospectId: "crumbl-cookies-brea",
    organisationName: null,
    contactRole: "Store manager",
    lane: "local-retail-food",
    email: "store-manager@demo.invalid",
    phone: null,
    note: "Agreed at the counter during a route go-see and confirmed by the franchisee the same afternoon. Small crew night, weekday daytime, before the evening trade starts.",
    askSummary: "Crew night for the store team, agreed on the spot.",
    suggestedPackageId: "happy-hour",
    desiredDate: "2026-11-16",
    headcount: 18,
    eventType: "Staff appreciation",
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
  // LOST. Both said why, and both reasons outlive the booking.
  // -------------------------------------------------------------
  {
    id: "req-20",
    channel: "phone",
    prospectId: "fairway-ford",
    organisationName: null,
    contactRole: "Dealership sales manager",
    lane: "auto-finance",
    email: "sales-desk@demo.invalid",
    phone: null,
    note: "Called to ask about December and mentioned in the same breath that the holiday party has been at the same hotel for three years. Said to come back in February for the summer sales push.",
    askSummary: "December holiday party, already contracted elsewhere.",
    suggestedPackageId: "corporate-all-access-pass",
    desiredDate: null,
    headcount: 70,
    eventType: "Holiday party",
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
      "Holiday party contracted at a hotel for three years running. February was left open for the summer sales push, which is a different answer from no.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "req-21",
    channel: "go-see",
    prospectId: null,
    organisationName: "Dental practice, La Habra",
    contactRole: "Practice manager",
    lane: "healthcare",
    email: "practice-office@demo.invalid",
    phone: null,
    note: "Wanted a staff night with a cake made by one of the hygienists, which is what the whole thing was about. Lost it on Main Event's published house policy that outside food and drink are prohibited.",
    askSummary: "Staff night built around a cake somebody was going to bake.",
    suggestedPackageId: "happy-hour",
    desiredDate: null,
    headcount: 22,
    eventType: "Staff night",
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
      "Outside food and drink are strictly prohibited under Main Event's published house policies. The cake was the occasion, so there was nothing to trade.",
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
    contactRole: "Regional HR business partner",
    lane: "corporate",
    email: "hr-partner@demo.invalid",
    phone: null,
    note: "Asked what a mid-size team event would cost per head and whether there was anything running midweek. Went quiet after the first reply and has not opened anything since.",
    askSummary: "Mid-size team event, midweek, cost per head asked for up front.",
    suggestedPackageId: "level-up",
    desiredDate: null,
    headcount: 130,
    eventType: "Team event",
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
    lane: "auto-finance",
    email: "branch-office@demo.invalid",
    phone: null,
    note: "Wanted something for the branch and a handful of referral partners. Asked for a price and stopped replying once the answer was that the corporate packages are not published.",
    askSummary: "Branch and referral partner night, stalled on the unpublished price.",
    suggestedPackageId: "happy-hour",
    desiredDate: null,
    headcount: 40,
    eventType: "Client and staff night",
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
  // LAPSED. Nobody said no. Nobody said anything.
  // -------------------------------------------------------------
  {
    id: "req-24",
    channel: "brea-form",
    prospectId: "fullerton-college",
    organisationName: null,
    contactRole: "Student activities coordinator",
    lane: "colleges",
    email: "student-activities@demo.invalid",
    phone: null,
    note: "Asked whether the new Brea location would work for student club events and whether there was anyone to talk to about a standing arrangement across the year. No reply was ever sent.",
    askSummary:
      "Standing arrangement for student club events across the academic year.",
    suggestedPackageId: "level-up",
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
// Leagues
// ---------------------------------------------------------------

const LEAGUES_PAGE = "https://www.mainevent.com/the-leagues/";

/**
 * Open Lane Socials, exactly as published on 11 August 2026.
 *
 * Read the `unpublished` array before the rest of it. Five things a
 * reader would expect a league page to say are not on that page: the
 * price, the season length, the number of weeks, the team size and the
 * start date. Bowlero and Lucky Strike run per-location league pages
 * with far more structure than this and they withhold price in exactly
 * the same way, so the missing dollar figure is a category habit rather
 * than a Main Event quirk, and this file says so rather than scoring a
 * cheap point.
 *
 * BREA IS NOT ON IT. The page says select locations and names three,
 * all in Colorado. No California venue publishes a league at all,
 * including Montclair, which is open and publishes full daily hours.
 * The Brea page links to this programme in its own site navigation and
 * makes no league claim of its own.
 *
 * That is the finding, and it is a better one for a sales manager than
 * "Main Event does not do leagues" would have been. A brand-wide
 * programme is being actively marketed, it plays on exactly the Tuesday
 * to Thursday nights a venue struggles to fill, and it has not been
 * extended to a venue whose nearest competitor publishes both leagues
 * and tournaments on a location page twenty five miles away.
 *
 * WHAT IS NOT IN THIS FILE: a tournament. Main Event publishes no
 * tournament programme anywhere, so there is no format, no entry fee,
 * no bracket and no eligibility to record. An invented tournament next
 * to a real league would take the credibility of the league with it.
 */
export const OPEN_LANE_SOCIALS: LeagueProgramme = {
  id: "open-lane-socials",
  name: "Open Lane Socials",
  bannerName: "Main Event Social Leagues",
  registrationStatus: "Now Open For Registration!",
  playNights: ["Tuesday", "Wednesday", "Thursday"],
  perks: [
    "An exclusive menu",
    "15% off next season",
    "Nightly prizes",
  ],
  leaderboardNote:
    "A national leaderboard across centres, published on the leagues page.",
  namedLocations: ["Colorado Springs", "Windsor", "Thornton"],
  registrationUrl: "https://www.leaguepals.com/mainevent",
  unpublished: [
    {
      field: "Price",
      note: "No dollar amount appears anywhere on the leagues page. Bowlero and Lucky Strike withhold league pricing in the same way and both route the question to an enquiry form, so this is a category-wide withholding rather than something particular to Main Event.",
      provenance: "withheld",
    },
    {
      field: "Season length",
      note: "The page shows the words Winter-Spring Season in its imagery and publishes no dates, no week count and no end.",
      provenance: "withheld",
    },
    {
      field: "Team size",
      note: "Not published. A Main Event blog post describes teams of three to five players, but that is generic education about how bowling leagues work in the world and it is not a Main Event rule. It must not be quoted as one.",
      provenance: "withheld",
    },
    {
      field: "Start date",
      note: "Not published on the leagues page or anywhere linked from it.",
      provenance: "withheld",
    },
    {
      field: "Registration field set",
      note: "Registration is handed off to leaguepals.com/mainevent, which is a third party site disallowed by its own robots.txt. What that form asks for could not be read and is not modelled here.",
      provenance: "withheld",
    },
  ],
  breaStatus: "unannounced",
  breaNote:
    "Brea is not named on the leagues page and neither is any California venue, open or otherwise. This is unannounced rather than refused: Main Event has not said either way, and recording it as a no would be inventing a decision nobody has published.",
  source: LEAGUES_PAGE,
  provenance: "public",
};

/**
 * People asking about a league at a venue that has not announced one.
 *
 * These are inbound asks, not registrations, and the difference is the
 * whole reason the type exists. There is nothing at Brea to register
 * for. What there is instead is evidence: three separate organisations
 * asking about recurring midweek play, on exactly the nights the
 * brand-wide programme runs and exactly the nights an entertainment
 * venue has the hardest time filling.
 *
 * A pre-opening sales manager cannot sell them a league. They can
 * answer honestly, quote the published programme, and carry the demand
 * to whoever decides which locations get one next, which is a more
 * useful thing to do with an unanswerable question than deleting it.
 */
export const SEED_LEAGUE_INTEREST: LeagueInterest[] = [
  {
    id: "lg-01",
    prospectId: "viewsonic-corporation",
    organisationName: null,
    contactRole: "Regional HR business partner",
    lane: "corporate",
    email: "hr-partner@demo.invalid",
    receivedAt: "2026-09-19T10:40:00-07:00",
    bowlersExpected: 24,
    preferredNights: ["Wednesday", "Thursday"],
    note: "Asked whether there would be a corporate league, having seen Open Lane Socials on the main site. Would put in four or five teams from the Brea site if there were something running midweek.",
    answerable: "unannounced-for-brea",
    standingAnswer:
      "Main Event runs Open Lane Socials brand wide, Tuesday to Thursday, and publishes no price, no season length and no team size for it. It runs at select locations and Brea is not one of the locations named. There is nothing to sign up to here yet, and the interest is being recorded.",
    answeredAt: null,
    provenance: { request: "illustrative", programme: "public" },
  },
  {
    id: "lg-02",
    prospectId: "brea-chamber-of-commerce",
    organisationName: null,
    contactRole: "Membership director",
    lane: "hospitality-civic",
    email: "membership@demo.invalid",
    receivedAt: "2026-09-22T15:10:00-07:00",
    bowlersExpected: null,
    preferredNights: ["Tuesday"],
    note: "Asked whether members could run a business league once the venue opens, on the basis that several members have asked her the same question. Did not have numbers and did not pretend to.",
    answerable: "unannounced-for-brea",
    standingAnswer:
      "The brand-wide programme is real and Brea's participation has not been announced. What can be offered today is the published detail of Open Lane Socials and a note of the interest, not a place in a league that does not exist.",
    answeredAt: null,
    provenance: { request: "illustrative", programme: "public" },
  },
  {
    id: "lg-03",
    prospectId: null,
    organisationName: "Warehouse crew, Brea industrial park",
    contactRole: "Shift supervisor",
    lane: "corporate",
    email: "shift-office@demo.invalid",
    receivedAt: "2026-09-14T17:50:00-07:00",
    bowlersExpected: 16,
    preferredNights: ["Tuesday", "Wednesday"],
    note: "Two shifts want somewhere to bowl every week and asked what a season costs. Answered the same day with the published detail and the plain fact that no price is published for it anywhere.",
    answerable: "unannounced-for-brea",
    standingAnswer:
      "Answered on 15 September with the published programme detail and the plain statement that Main Event publishes no league price at all. Recorded as standing midweek demand for whenever a league is announced.",
    answeredAt: "2026-09-15T09:30:00-07:00",
    provenance: { request: "illustrative", programme: "public" },
  },
];

export const LEAGUE_INTEREST_BY_ID: Record<string, LeagueInterest> =
  Object.fromEntries(SEED_LEAGUE_INTEREST.map((l) => [l.id, l]));
