import type {
  GroupRequest,
  LeagueInterest,
  LeagueProgramme,
  QualifyingField,
  MissingReason,
} from "@/domain/requests";
import { responseDueFrom } from "@/domain/requests";
import { PACKAGES } from "@/data/packages";

/**
 * The inbound queue, seeded.
 *
 * TWENTY FOUR ENQUIRIES, AND EVERY ONE OF THEM IS INVENTED. Every row
 * carries "illustrative" provenance on the request itself, and the app
 * says so on screen rather than in a footnote. Nobody has enquired about
 * anything through this application, because this application is an
 * unaffiliated work sample and there is no desk behind it.
 *
 * WHAT THE QUEUE IS ABOUT. This is a promotions and licensed merchandise
 * desk in the Cerritos trade area, so the mix is weighted the way that
 * desk's post actually arrives. Campuses and a district asking about
 * dates that are fixed an academic year ahead. Card, hobby and
 * collectible counters asking about joint giveaways and prize stock.
 * Large local employers asking about staff appreciation. A supplier who
 * became a customer during a go-see. A mall marketing office and a
 * chamber, which are routes to everybody else rather than bookings in
 * their own right.
 *
 * WHAT IS NOT INVENTED IS THE SHAPE. The field set on each row is the
 * field set of the route it came through. Some routes capture a date, a
 * headcount and an event type and some capture none of the three, and
 * the difference between those two rows is the reason this screen
 * exists: an enquiry that arrives unqualified is not a lazy enquiry, it
 * is a form that never asked. The field sets themselves are badged
 * illustrative rather than public, because Round1 publishes the contents
 * of its party package and its change notice and does not publish what
 * any of its forms ask for. Modelling a form nobody has read would be
 * inventing a fact about Round1, which is the one thing this application
 * never does.
 *
 * WHAT THE MIX IS FOR. A seeded queue where everything is new and
 * nothing is late is a screenshot, not a model. This one is built to
 * exercise the failures:
 *
 *   THREE are past the response commitment and still unanswered.
 *   ONE has lapsed entirely. It arrived on 4 September, nobody replied,
 *   and it is now nineteen days old. Nobody said no. That row is the
 *   single most useful thing on the board and it is the row a stored
 *   task list would never have shown anybody.
 *   TWO went quiet after a real conversation, and both of them went
 *   quiet in the same place, which is the moment somebody asked for a
 *   price. Round1 publishes none. That is not a gap in the research, it
 *   is the commercial fact this desk works inside, and two rows losing
 *   momentum at exactly that sentence is worth more than a queue where
 *   everybody is delighted.
 *   TWO were lost, and both of them said why.
 *   ONE is marked won with no line in the book, so the two ledgers
 *   disagree and the queue says so.
 *
 * NO INVENTED PEOPLE. Every row carries a role and no row carries a
 * name, exactly as the prospect list does. Where an enquiry came from an
 * organisation that is not in prospects.ts, the organisation is recorded
 * as a DESCRIPTOR rather than a business name: "Youth sports club,
 * Cerritos" and not an invented club. A made-up organisation in a real
 * trade area is a claim about somebody who exists, and there are real
 * youth sports clubs in Cerritos.
 *
 * NO INVENTED CONTACT DETAILS EITHER. Every email here sits on the
 * .invalid domain, which RFC 2606 reserves and which can never resolve,
 * the same guarantee the outbound half of the app gets from
 * DEMO_RECIPIENT. Phone numbers are null throughout: an .invalid address
 * is obviously fictional at a glance and a phone number is not.
 */

/**
 * The package to open a conversation with, taken from the catalogue.
 *
 * Looked up rather than spelled out, exactly as `data/prospects.ts` does
 * it, so no row in this queue can suggest a package id that
 * `data/packages.ts` does not actually carry. Rows whose ask is not a
 * party at all carry null instead, because suggesting a party package to
 * a shop asking about a joint giveaway is how a queue starts answering
 * the question it wishes it had been asked.
 */
const LEAD_PACKAGE_ID: string =
  PACKAGES.find((p) => p.id === "all-inclusive-party")?.id ?? PACKAGES[0].id;

const AS_OF = "2026-09-23T09:00:00-07:00";

/**
 * The moment the queue is read from.
 *
 * Injected everywhere rather than read off the clock, so the overdue
 * count in a screenshot taken today is the overdue count a reader sees
 * next March. A queue whose numbers move when nobody has touched it is a
 * queue nobody can check.
 *
 * It sits inside Q3 2026, which runs from 1 July to 30 September 2026,
 * and it agrees with the reply dates already seeded in data/book.ts.
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

/**
 * The short enquiry route asks for none of the three, and it is the
 * common case. A name, an email and a box of free text is what most
 * organisations send, whatever the form in front of them collected.
 */
const SHORT_FORM_GAP = reasons(
  "not-asked-by-route",
  "not-asked-by-route",
  "not-asked-by-route",
);

const ILLUSTRATIVE = {
  request: "illustrative",
  fieldSet: "illustrative",
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
    channel: "party-page",
    prospectId: "whitney-high-school",
    organisationName: null,
    contactRole: "Student activities office",
    lane: "schools",
    email: "student-activities@demo.invalid",
    phone: null,
    note: "Our anime and manga society runs one big off campus night a year and the officers have asked about somewhere with arcade and karaoke. Roughly how does it work for a group, and is there anything you can put towards prizes for the club raffle?",
    askSummary:
      "End of term night for the anime and manga society, plus a question about prize support for a club raffle.",
    suggestedPackageId: LEAD_PACKAGE_ID,
    desiredDate: null,
    headcount: null,
    eventType: null,
    fieldReasons: SHORT_FORM_GAP,
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
    organisationName: "Youth sports club, Cerritos",
    contactRole: "Club administrator",
    lane: "fitness-youth-sports",
    email: "club-admin@demo.invalid",
    phone: null,
    note: "Voicemail on the published support line. End of season banquet for the whole club, sometime in November, wants to know what a deposit looks like and whether medals can be handed out on site.",
    askSummary: "End of season club banquet in November, with an awards presentation on site.",
    suggestedPackageId: LEAD_PACKAGE_ID,
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
    channel: "party-page",
    prospectId: "krazy-nick-s-games",
    organisationName: null,
    contactRole: "Store manager",
    lane: "local-retail-food",
    email: "store-manager@demo.invalid",
    phone: null,
    note: "We run card tournaments most weekends and the room is at capacity. Wondering whether a bigger event could be run jointly and what you could put towards a prize pool if we brought the players.",
    askSummary:
      "Joint tournament day with a card shop that would bring the players, and a question about prize support.",
    suggestedPackageId: null,
    desiredDate: null,
    headcount: null,
    eventType: null,
    fieldReasons: SHORT_FORM_GAP,
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
    channel: "party-page",
    prospectId: "gahr-high-school",
    organisationName: null,
    contactRole: "Assistant Principal for Activities",
    lane: "schools",
    email: "activities-office@demo.invalid",
    phone: null,
    note: "End of year committee is comparing venues for June. We would need the whole group in one place and supervision arrangements in writing for the district before anything is signed.",
    askSummary: "June end of year night, comparing venues, needs supervision terms in writing.",
    suggestedPackageId: LEAD_PACKAGE_ID,
    desiredDate: "2027-06-10",
    headcount: 380,
    eventType: "End of year night",
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
    channel: "party-page",
    prospectId: null,
    organisationName: "Homeschool co-op, south east Los Angeles County",
    contactRole: "Co-op activities parent",
    lane: "schools",
    email: "co-op-activities@demo.invalid",
    phone: null,
    note: "We run weekday enrichment days for about eighty families and are looking for somewhere indoors for the winter term. Mornings work better for us than afternoons.",
    askSummary: "Weekday morning enrichment day for a homeschool co-op, winter term.",
    suggestedPackageId: LEAD_PACKAGE_ID,
    desiredDate: null,
    headcount: null,
    eventType: null,
    fieldReasons: SHORT_FORM_GAP,
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
    prospectId: "boxlunch",
    organisationName: null,
    contactRole: "Store manager",
    lane: "local-retail-food",
    email: "store-team@demo.invalid",
    phone: null,
    note: "Asked at the counter during a route go-see. Wants somewhere to take the store team on a weekday before the evening trade, and asked separately whether a giveaway could run across both sites on a property we both carry.",
    askSummary:
      "Weekday crew night for the store team, with a co-marketed giveaway raised in the same conversation.",
    suggestedPackageId: LEAD_PACKAGE_ID,
    desiredDate: null,
    headcount: 24,
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
    channel: "party-page",
    prospectId: "cerritos-college",
    organisationName: null,
    contactRole: "Student activities manager",
    lane: "colleges",
    email: "student-activities@demo.invalid",
    phone: null,
    note: "Planning a spring term social for recognised student organisations, with the anime and esports clubs driving it. Budget is per head and modest. We would need an invoice to the college rather than a card on the night.",
    askSummary:
      "Spring term social for student organisations, invoiced to the college.",
    suggestedPackageId: LEAD_PACKAGE_ID,
    desiredDate: "2027-01-21",
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
    channel: "party-page",
    prospectId: null,
    organisationName: "Insurance brokerage, Cerritos",
    contactRole: "Office manager",
    lane: "auto-finance",
    email: "office-manager@demo.invalid",
    phone: null,
    note: "Holiday party for the office and a few partner agents. Picked the nearest location on the list and asked whether the corporate office in Cerritos handles this or whether it all goes through the store.",
    askSummary:
      "December holiday party, and a direct question about who actually handles a group booking.",
    suggestedPackageId: LEAD_PACKAGE_ID,
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
    channel: "party-page",
    prospectId: "cerritos-library",
    organisationName: null,
    contactRole: "Programme coordinator",
    lane: "faith-nonprofit",
    email: "programme-desk@demo.invalid",
    phone: null,
    note: "We run free anime and manga programming for teens through the year and the numbers have outgrown the room. Interested in whether there is anything that gives something back to the programme, and whether a partner can bring materials.",
    askSummary:
      "Teen anime programming that has outgrown its room, and a question about what a partnership gives back.",
    suggestedPackageId: LEAD_PACKAGE_ID,
    desiredDate: null,
    headcount: 75,
    eventType: "Teen programming night",
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
    channel: "party-page",
    prospectId: "perfect-rares-card-center",
    organisationName: null,
    contactRole: "Store manager",
    lane: "local-retail-food",
    email: "shop-counter@demo.invalid",
    phone: null,
    note: "Enquiring on behalf of the shop. We have never done anything like this and would want to understand cost before taking it to the owner. No fixed date in mind at this stage.",
    askSummary:
      "First-time enquiry for a collector night, cost needed before it goes to the owner.",
    suggestedPackageId: LEAD_PACKAGE_ID,
    desiredDate: null,
    headcount: null,
    eventType: "Collector night",
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
    organisationName: "Boba franchise unit, Los Cerritos Center",
    contactRole: "Store manager",
    lane: "local-retail-food",
    email: "store-team@demo.invalid",
    phone: null,
    note: "Asked at the counter. Twelve staff, mostly students, all free on a weekday before the evening rush. Store manager can approve it without going to the franchisee if it is small enough.",
    askSummary:
      "Small weekday daytime crew night that the store manager can approve alone.",
    suggestedPackageId: LEAD_PACKAGE_ID,
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
    prospectId: "norm-reeves-honda-superstore-cerritos",
    organisationName: null,
    contactRole: "Human resources manager",
    lane: "corporate",
    email: "people-team@demo.invalid",
    phone: null,
    note: "Came back on the quote. Asked whether a party room could be used in the morning for the sales meeting and the floor in the afternoon as one booking, and what the minimum spend would be for that.",
    askSummary:
      "Morning meeting room plus an afternoon on the floor, as one booking, and a question about minimum spend.",
    suggestedPackageId: LEAD_PACKAGE_ID,
    desiredDate: "2026-12-03",
    headcount: 90,
    eventType: "Staff appreciation and sales meeting",
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
    prospectId: "sheraton-cerritos-hotel",
    organisationName: null,
    contactRole: "Director of sales",
    lane: "corporate",
    email: "hotel-sales@demo.invalid",
    phone: null,
    note: "Passing on a conference group who want an evening off site in the fourth quarter. They will ask to see the floor before they commit anything and I would want to walk it myself first.",
    askSummary:
      "Referred conference group wanting an evening off site, contingent on seeing the floor.",
    suggestedPackageId: LEAD_PACKAGE_ID,
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
    prospectId: "chalice-collectibles",
    organisationName: null,
    contactRole: "Store manager",
    lane: "local-retail-food",
    email: "shop-office@demo.invalid",
    phone: null,
    note: "Called about a Saturday collector day. Wants the morning, families included, and asked twice what could be committed towards a prize wall if the shop supplied the entrants.",
    askSummary:
      "Saturday morning collector day with families included, hinging on prize support.",
    suggestedPackageId: LEAD_PACKAGE_ID,
    desiredDate: "2026-12-19",
    headcount: 60,
    eventType: "Collector day",
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
    channel: "party-page",
    prospectId: "uci-health-lakewood",
    organisationName: null,
    contactRole: "Human resources manager",
    lane: "corporate",
    email: "people-services@demo.invalid",
    phone: null,
    note: "Holiday event for the Lakewood site. Two hundred and eighty expected. We will need the date held while procurement runs the supplier checks, which usually takes three to four weeks.",
    askSummary:
      "Site holiday event for 280, date held while procurement runs supplier checks.",
    suggestedPackageId: LEAD_PACKAGE_ID,
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
    channel: "party-page",
    prospectId: "norwalk-la-mirada-unified-school-district",
    organisationName: null,
    contactRole: "District activities office",
    lane: "schools",
    email: "activities-district@demo.invalid",
    phone: null,
    note: "Winter reward trip for middle school students across two campuses. We would bring staff chaperones and we need to know how many we are required to bring for that many students before the paperwork goes out.",
    askSummary:
      "Winter reward trip across two campuses, and a direct question about the chaperone requirement.",
    suggestedPackageId: LEAD_PACKAGE_ID,
    desiredDate: "2026-12-18",
    headcount: 96,
    eventType: "Student reward trip",
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
    prospectId: "cerritos-high-school",
    organisationName: null,
    contactRole: "Campus activities office",
    lane: "schools",
    email: "activities-office@demo.invalid",
    phone: null,
    note: "Came back on the quote for the autumn club and society night and asked for the package contents in writing so they could go on the permission slip. Confirmed the midweek date works around the calendar.",
    askSummary: "Autumn club and society night for sixty students, midweek.",
    suggestedPackageId: LEAD_PACKAGE_ID,
    desiredDate: "2026-11-20",
    headcount: 60,
    eventType: "Club and society night",
    fieldReasons: reasons("captured", "captured", "captured"),
    freeTourRequested: null,
    multiLocation: null,
    receivedAt: "2026-09-08T10:10:00-07:00",
    responseDueAt: responseDueFrom("2026-09-08T10:10:00-07:00"),
    status: "won",
    firstRespondedAt: "2026-09-08T11:05:00-07:00",
    lastContactAt: "2026-09-19T14:00:00-07:00",
    agreedNextStepAt: null,
    closeReason:
      "Signed on a per head figure this desk set. Round1 publishes no price for any package, so the number is an illustrative one and the book line says so.",
    closedAt: "2026-09-19T14:00:00-07:00",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "req-18",
    channel: "phone",
    prospectId: "porto-s-bakery-and-cafe",
    organisationName: null,
    contactRole: "Human resources manager",
    lane: "corporate",
    email: "people-team@demo.invalid",
    phone: null,
    note: "Called about the staff appreciation evening. Wanted a December weeknight the production and counter teams could both make, and took the first date offered.",
    askSummary: "Staff appreciation evening, December weeknight, 120 guests.",
    suggestedPackageId: LEAD_PACKAGE_ID,
    desiredDate: "2026-12-11",
    headcount: 120,
    eventType: "Staff appreciation",
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
    closeReason:
      "Signed on a per head figure this desk set, on the same basis as the school line. No published price exists to check it against.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "req-19",
    channel: "go-see",
    prospectId: "french-press-custom-apparel-printing-and-design",
    organisationName: null,
    contactRole: "Sales manager",
    lane: "corporate",
    email: "print-office@demo.invalid",
    phone: null,
    note: "Agreed at the counter during a supplier go-see and confirmed by the owner the same afternoon. Small crew night, weekday daytime, before the presses run the evening jobs.",
    askSummary: "Crew night for the print shop team, agreed on the spot.",
    suggestedPackageId: LEAD_PACKAGE_ID,
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
    closeReason:
      "Agreed verbally and confirmed by the owner. Not yet written into the book, which is why the two ledgers disagree about this organisation.",
    provenance: ILLUSTRATIVE,
  },

  // -------------------------------------------------------------
  // LOST. Both said why, and both reasons outlive the booking.
  // -------------------------------------------------------------
  {
    id: "req-20",
    channel: "phone",
    prospectId: "lexus-of-cerritos",
    organisationName: null,
    contactRole: "Human resources manager",
    lane: "corporate",
    email: "people-office@demo.invalid",
    phone: null,
    note: "Called to ask about December and mentioned in the same breath that the holiday party has been at the same hotel for three years. Said to come back in February when the spring sales incentive prizes are chosen.",
    askSummary: "December holiday party, already contracted elsewhere.",
    suggestedPackageId: LEAD_PACKAGE_ID,
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
      "Holiday party contracted at a hotel for three years running. February was left open for the spring incentive prizes, which is a different answer from no and is closer to what this desk actually sells.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "req-21",
    channel: "go-see",
    prospectId: null,
    organisationName: "Dental practice, Artesia",
    contactRole: "Practice manager",
    lane: "healthcare",
    email: "practice-office@demo.invalid",
    phone: null,
    note: "Wanted a staff night and needed an all in figure to put in front of the partners at their meeting on the Monday. Round1 publishes no price for any package, so nothing could be put in writing inside their week.",
    askSummary: "Staff night that needed a written figure inside a week.",
    suggestedPackageId: LEAD_PACKAGE_ID,
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
      "Booked an operator that publishes a per head figure on its own site. The loss is not a price loss, it is a speed loss: they needed a number in writing by the Monday and the only honest answer available was to contact the venue.",
    provenance: ILLUSTRATIVE,
  },

  // -------------------------------------------------------------
  // GONE QUIET. We answered. They stopped.
  // -------------------------------------------------------------
  {
    id: "req-22",
    channel: "party-page",
    prospectId: "yamaha-corporation-of-america",
    organisationName: null,
    contactRole: "Office manager",
    lane: "corporate",
    email: "front-office@demo.invalid",
    phone: null,
    note: "Asked what a mid-size team event would cost per head and whether there was anything running midweek. Went quiet after the first reply and has not opened anything since.",
    askSummary: "Mid-size team event, midweek, cost per head asked for up front.",
    suggestedPackageId: LEAD_PACKAGE_ID,
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
    channel: "party-page",
    prospectId: "premier-workspaces-cerritos-tower",
    organisationName: null,
    contactRole: "Office manager",
    lane: "corporate",
    email: "workspace-office@demo.invalid",
    phone: null,
    note: "Wanted something for the members and the front desk team together. Asked for a price and stopped replying once the answer was that no package price is published anywhere.",
    askSummary: "Members and staff night, stalled on the unpublished price.",
    suggestedPackageId: LEAD_PACKAGE_ID,
    desiredDate: null,
    headcount: 40,
    eventType: "Members and staff night",
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
    channel: "party-page",
    prospectId: "biola-university",
    organisationName: null,
    contactRole: "Student activities manager",
    lane: "colleges",
    email: "student-life@demo.invalid",
    phone: null,
    note: "Asked whether there was anyone to talk to about a standing arrangement for student club events across the academic year, rather than enquiring separately every term. No reply was ever sent.",
    askSummary:
      "Standing arrangement for student club events across the academic year.",
    suggestedPackageId: LEAD_PACKAGE_ID,
    desiredDate: null,
    headcount: null,
    eventType: null,
    fieldReasons: SHORT_FORM_GAP,
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
 * A COMPETITOR'S PUBLISHED LEAGUE PROGRAMME, CARRIED AS A COMPARISON AND
 * NEVER AS ROUND1'S.
 *
 * Read that heading twice before reading a field below. Open Lane
 * Socials belongs to Main Event, it is published on
 * mainevent.com/the-leagues, and every value in this object was read off
 * that page on 11 August 2026 and is badged `public` with the URL
 * attached. Nothing here is a Round1 product, a Round1 term or a Round1
 * price, and no screen may present it as one.
 *
 * WHY A RIVAL'S PROGRAMME IS IN THIS FILE AT ALL. Because the useful
 * observation is the contrast rather than the content. One operator in
 * this category markets a brand-wide midweek league, names the nights it
 * plays and the perks it carries, and hands registration to a third
 * party. Round1 publishes no league programme on any page this
 * application read, including the Lakewood Center location page, whose
 * amenity list runs to bowling, a VIP Immersive Lane option, arcade,
 * billiards and ping pong, karaoke, party rooms, Victory Zone and the
 * YUU food hall, and stops there.
 *
 * READ THE `unpublished` ARRAY BEFORE THE REST OF IT. Five things a
 * reader would expect a league page to say are not on Main Event's page
 * either: the price, the season length, the number of weeks, the team
 * size and the start date. Bowlero and Lucky Strike run per-location
 * league pages with far more structure and withhold price in exactly the
 * same way, so the missing dollar figure is a category habit rather than
 * one operator's quirk, and this file says so rather than scoring a
 * cheap point.
 *
 * That is the finding, and it is a better one for a promotions desk than
 * "nobody does leagues" would have been. A recurring midweek night is
 * being actively marketed by somebody in this category, it plays on
 * exactly the Tuesday to Thursday nights an entertainment floor
 * struggles to fill, and the local demand for it is already sitting in
 * the interest list below.
 *
 * WHAT IS NOT IN THIS FILE: a Round1 league, a Round1 league price, and
 * a tournament. None of the three is published anywhere, so there is no
 * format, no entry fee, no bracket and no eligibility to record. An
 * invented programme next to a real one takes the credibility of the
 * real one with it.
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
    "A national leaderboard across centres, published on that operator's leagues page.",
  namedLocations: ["Colorado Springs", "Windsor", "Thornton"],
  registrationUrl: "https://www.leaguepals.com/mainevent",
  unpublished: [
    {
      field: "Price",
      note: "No dollar amount appears anywhere on the leagues page. Bowlero and Lucky Strike withhold league pricing in the same way and both route the question to an enquiry form, so this is a category-wide withholding rather than something particular to one operator. Round1 publishes no league at all, so it has no price to withhold.",
      provenance: "withheld",
    },
    {
      field: "Season length",
      note: "The page shows the words Winter-Spring Season in its imagery and publishes no dates, no week count and no end.",
      provenance: "withheld",
    },
    {
      field: "Team size",
      note: "Not published. A blog post on the same site describes teams of three to five players, but that is generic education about how bowling leagues work in the world and it is not a rule anybody has committed to. It must not be quoted as one.",
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
  localStatus: "unannounced",
  localNote:
    "Round1 names no league on its profile page, its party booking pages or the Lakewood Center location page, and no California venue of the operator opposite is named either. This is unannounced rather than refused: nobody has said either way, and recording it as a no would be inventing a decision nobody has published. The field name is inherited from the fork and now reads as \"the trade area this application works\".",
  source: LEAGUES_PAGE,
  provenance: "public",
};

/**
 * People asking about a recurring midweek night at a business that has
 * not announced one.
 *
 * These are inbound asks, not registrations, and the difference is the
 * whole reason the type exists. There is nothing to register for. What
 * there is instead is evidence: three separate organisations asking
 * about recurring midweek play, on exactly the nights an entertainment
 * floor has the hardest time filling.
 *
 * A promotions desk cannot sell them a league. It can answer honestly,
 * show what a competitor publishes and what Round1 does not, and carry
 * the demand to whoever decides what runs midweek, which is a more
 * useful thing to do with an unanswerable question than deleting it.
 * Recurring midweek play is also the cheapest standing audience a prize
 * and merchandise programme will ever get, which is why this list sits
 * on a promotions desk rather than on an operations one.
 */
export const SEED_LEAGUE_INTEREST: LeagueInterest[] = [
  {
    id: "lg-01",
    prospectId: "yamaha-corporation-of-america",
    organisationName: null,
    contactRole: "Office manager",
    lane: "corporate",
    email: "front-office@demo.invalid",
    receivedAt: "2026-09-19T10:40:00-07:00",
    bowlersExpected: 24,
    preferredNights: ["Wednesday", "Thursday"],
    note: "Asked whether there would be a corporate league, having found a rival operator's programme while searching. Would put in four or five teams from the Buena Park office if there were something running midweek.",
    answerable: "not-published-here",
    standingAnswer:
      "The programme they found belongs to a different operator, plays Tuesday to Thursday, and publishes no price, no season length and no team size. Round1 publishes no league at any location. There is nothing to sign up to, and the interest is being recorded rather than answered with a maybe.",
    answeredAt: null,
    provenance: { request: "illustrative", programme: "public" },
  },
  {
    id: "lg-02",
    prospectId: "norwalk-chamber-of-commerce",
    organisationName: null,
    contactRole: "Membership director",
    lane: "faith-nonprofit",
    email: "membership@demo.invalid",
    receivedAt: "2026-09-22T15:10:00-07:00",
    bowlersExpected: null,
    preferredNights: ["Tuesday"],
    note: "Asked whether members could run a business league, on the basis that several members have asked her the same question. Did not have numbers and did not pretend to.",
    answerable: "not-published-here",
    standingAnswer:
      "A brand-wide midweek programme exists in this category and it belongs to somebody else. What can be offered today is the published detail of that one, the plain statement that Round1 publishes no league, and a note of the interest. Not a place in something that does not exist.",
    answeredAt: null,
    provenance: { request: "illustrative", programme: "public" },
  },
  {
    id: "lg-03",
    prospectId: null,
    organisationName: "Warehouse crew, Santa Fe Springs industrial park",
    contactRole: "Shift supervisor",
    lane: "corporate",
    email: "shift-office@demo.invalid",
    receivedAt: "2026-09-14T17:50:00-07:00",
    bowlersExpected: 16,
    preferredNights: ["Tuesday", "Wednesday"],
    note: "Two shifts want somewhere to bowl every week and asked what a season costs. Answered the same day with the published detail of the rival programme and the plain fact that no price for a league is published by anybody in this category.",
    answerable: "not-published-here",
    standingAnswer:
      "Answered on 15 September with what one operator publishes, what Round1 publishes, and the plain statement that no league price is published anywhere. Recorded as standing midweek demand for whenever something midweek is announced.",
    answeredAt: "2026-09-15T09:30:00-07:00",
    provenance: { request: "illustrative", programme: "public" },
  },
];

export const LEAGUE_INTEREST_BY_ID: Record<string, LeagueInterest> =
  Object.fromEntries(SEED_LEAGUE_INTEREST.map((l) => [l.id, l]));
