import type { ActivityLine, BookLine, Reply } from "@/domain/types";

/**
 * The book, seeded, twelve weeks before the doors open.
 *
 * TWO CONTRACTS. That is the whole book, and it is the honest number.
 *
 * A pre-opening venue twelve weeks out with two signed groups is not
 * behind. It is roughly where a venue gets to once one person has been
 * working the trade area for a few weeks. Showing eleven contracts here
 * would have made a better screenshot and would have described a
 * situation nobody has ever been in.
 *
 * The two are chosen to show the one distinction that runs through this
 * whole application:
 *
 *   HEIGHTS CHRISTIAN is on a PUBLISHED price. Play It Forward is
 *   $19.95 a voucher on mainevent.com, so that line is arithmetic
 *   anybody can check.
 *
 *   TEAM KWON is on a price a person typed. Bowl 'n Fun is one of the
 *   packages Main Event gates behind a sales manager, so there is no
 *   published number to compute from. The line carries "user_input"
 *   provenance and the Book page states, in words, how much of the
 *   total rests on a figure somebody made up in a meeting.
 *
 * That second number is the one a GM should want to see and the one a
 * pipeline report never shows them.
 */
export const SEED_BOOK: BookLine[] = [
  {
    id: "book-seed-1",
    ledger: "booked-revenue",
    source: "quote:heights-christian-schools-brea-campus",
    prospectId: "heights-christian-schools-brea-campus",
    packageId: "play-it-forward",
    guests: 60,
    pricePerGuest: 19.95,
    /* Published on mainevent.com/events/school-events/play-it-forward. */
    pricePerGuestProvenance: "public",
    depositPercent: 50,
    eventDate: "2026-11-20",
    /*
      Play It Forward is a voucher block rather than a reserved party, so
      it holds no lanes. Main Event says so explicitly: there are no lane
      reservations, groups sign up for sessions as available. Recording
      three lanes here would have overstated the venue's committed
      capacity by three lanes, which is the kind of quiet error that
      makes a capacity chart useless.
    */
    lanesHeld: 0,
    notes:
      "Voucher block, not a party. The school resells at whatever it likes and keeps the margin. Redeemable Mon to Thu and Fri before 5pm only, which is the point: it fills hours nothing else will.",
    sortOrder: 0,
  },
  {
    id: "book-seed-2",
    ledger: "booked-revenue",
    source: "quote:team-kwon-taekwondo-center-hq",
    prospectId: "team-kwon-taekwondo-center-hq",
    packageId: "bowl-n-fun",
    guests: 45,
    /*
      A NUMBER A PERSON TYPED.

      Main Event publishes no price for Bowl 'n Fun. $24 is what a sales
      manager would quote a 45-guest belt-test celebration on a Saturday
      morning, and it is an invention. It renders everywhere with a
      user-input badge and it is called out by name in the Book totals,
      because the alternative, letting it sit in a revenue figure
      looking exactly like the $19.95 above, is how a forecast becomes
      fiction one plausible line at a time.
    */
    pricePerGuest: 24,
    pricePerGuestProvenance: "user_input",
    depositPercent: 50,
    eventDate: "2026-12-12",
    lanesHeld: 3,
    notes:
      "Belt-test celebration. Saturday before 11am, which is the only weekend window Bowl 'n Fun is published for.",
    sortOrder: 1,
  },
];

/**
 * The outbound plan for the period. Hours, and no money anywhere.
 *
 * THE SHAPE OF THIS ARRAY IS THE ARGUMENT.
 *
 * Add up the hours and most of them are outside the building. That is
 * not a stylistic choice, it is the first line of the job posting's
 * daily responsibilities: "Perform outbound lead-generating activities
 * outside the building, including tabling, networking events, and
 * go-sees with prospective and current customers."
 *
 * A pre-opening plan that is mostly call blocks has quietly decided to
 * do the job from a chair. Call blocks are here, they are counted, and
 * they are deliberately the smallest share, because a venue nobody has
 * seen is very hard to sell down a phone line and much easier to sell
 * standing in a lobby with a photograph of it.
 *
 * EVERY LINE BELONGS TO SEAT 1, AND THAT IS THE FINDING RATHER THAN A
 * DEFAULT. Seats 2 and 3 are open, so one person is planning every hour
 * in a period whose lanes were split three ways. /team groups these
 * lines by seat and by lane, which is how the lane with no hours planned
 * into it at all becomes visible.
 */
export const SEED_ACTIVITY: ActivityLine[] = [
  {
    id: "act-seed-1",
    ledger: "outbound-activity",
    type: "networking-event",
    prospectId: "brea-chamber-of-commerce",
    locationLabel: "Brea Chamber of Commerce monthly mixer",
    week: "2026-09-14",
    hours: 3,
    targetConversations: 12,
    seatId: "seat-1",
    laneFocus: ["corporate", "auto-finance", "healthcare", "hospitality-civic"],
    notes:
      "The single highest-leverage three hours in the period. A chamber mixer is not one prospect, it is a room containing four of these lanes at once, standing up, expecting to be talked to.",
    sortOrder: 0,
  },
  {
    id: "act-seed-2",
    ledger: "outbound-activity",
    type: "tabling",
    locationLabel: "Beckman Coulter / Envista campus, S Kraemer Blvd, lunch hour",
    week: "2026-09-14",
    hours: 4,
    targetConversations: 25,
    seatId: "seat-1",
    laneFocus: ["corporate"],
    notes:
      "Two of Brea's largest single-site employers are on the same street. One table, one lunch hour, and the HR contacts for both walk past it.",
    sortOrder: 1,
  },
  {
    id: "act-seed-3",
    ledger: "outbound-activity",
    type: "go-see",
    prospectId: "brea-olinda-high-school",
    locationLabel: "Brea Olinda High School, front office",
    week: "2026-09-21",
    hours: 1.5,
    targetConversations: 2,
    seatId: "seat-1",
    laneFocus: ["schools"],
    notes:
      "The Assistant Principal for Activities and Athletics owns grad night and every team banquet. One person, one visit, an entire school year of occasions.",
    completedAt: "2026-09-22",
    sortOrder: 2,
  },
  {
    id: "act-seed-4",
    ledger: "outbound-activity",
    type: "go-see",
    locationLabel: "Brea dental and medical corridor, E Imperial Hwy",
    week: "2026-09-21",
    hours: 3,
    targetConversations: 8,
    seatId: "seat-1",
    laneFocus: ["healthcare"],
    notes:
      "Five clinics inside a mile, none of which publish an email and all of which have a practice manager standing at a desk. This lane cannot be worked any other way.",
    sortOrder: 3,
  },
  {
    id: "act-seed-5",
    ledger: "outbound-activity",
    type: "tabling",
    prospectId: "california-state-university-fullerton",
    locationLabel: "CSUF, Titan Walk, club rush week",
    week: "2026-09-28",
    hours: 5,
    targetConversations: 40,
    seatId: "seat-1",
    laneFocus: ["colleges"],
    notes:
      "Hundreds of recognised student organisations set up their own tables on the same day. Being one of them costs a folding table and reaches more student officers in five hours than a term of emails.",
    sortOrder: 4,
  },
  {
    id: "act-seed-6",
    ledger: "outbound-activity",
    type: "call-block",
    locationLabel: "Desk, Tuesday and Thursday mornings",
    week: "2026-09-28",
    hours: 4,
    targetConversations: 10,
    seatId: "seat-1",
    laneFocus: ["auto-finance", "fitness-youth-sports"],
    notes:
      "The only inside hours in the plan, and they are aimed at the two lanes where the buyer is genuinely standing next to a phone: a dealership sales manager and a gym owner at the front desk.",
    sortOrder: 5,
  },
  {
    id: "act-seed-7",
    ledger: "outbound-activity",
    type: "go-see",
    prospectId: "embassy-suites-by-hilton-brea-north-orange-count",
    locationLabel: "Embassy Suites Brea, sales office",
    week: "2026-10-05",
    hours: 1.5,
    targetConversations: 2,
    seatId: "seat-1",
    laneFocus: ["hospitality-civic"],
    notes:
      "A hotel sales director is asked for group activity recommendations by people who have already decided to spend money. This is a referral relationship, not a booking, and it is worth more than most bookings.",
    sortOrder: 6,
  },
  {
    id: "act-seed-8",
    ledger: "outbound-activity",
    type: "email-sequence",
    locationLabel: "Thirty published school and district addresses",
    week: "2026-10-05",
    hours: 2,
    targetConversations: 6,
    seatId: "seat-1",
    laneFocus: ["schools", "colleges"],
    notes:
      "The schools lane is the only one where the decision maker's title and address are already published. Two hours of writing reaches every one of them, which is why this lane goes first every single period.",
    sortOrder: 7,
  },
  {
    id: "act-seed-9",
    ledger: "outbound-activity",
    type: "networking-event",
    locationLabel: "Placentia and Yorba Linda chamber mixers",
    week: "2026-10-12",
    hours: 4,
    targetConversations: 16,
    seatId: "seat-1",
    laneFocus: ["corporate", "auto-finance", "faith-nonprofit"],
    notes:
      "Brea's trade area does not stop at the city line, and neither do its two neighbouring chambers. Same three hours, a different four hundred businesses.",
    sortOrder: 8,
  },
  {
    id: "act-seed-10",
    ledger: "outbound-activity",
    type: "venue-tour",
    locationLabel: "245 W Birch St, hard hat walk",
    week: "2026-10-12",
    hours: 3,
    targetConversations: 6,
    seatId: "seat-1",
    laneFocus: ["hospitality-civic", "schools", "corporate"],
    notes:
      "The building is the closing argument and it does not have to be finished to be one. A construction walk is more memorable than a finished tour and can be given weeks earlier.",
    sortOrder: 9,
  },
];

/**
 * What came back.
 *
 * Including the ones that said no, and including the silence.
 *
 * A pipeline that records only its wins teaches nobody anything, and a
 * hiring manager who has run a sales floor will look for the losses
 * first. Fairway Ford is here saying no in their own words, and the
 * reason they gave is the most useful sentence in this file.
 */
export const SEED_REPLIES: Reply[] = [
  {
    id: "reply-seed-1",
    prospectId: "brea-olinda-high-school",
    disposition: "meeting-set",
    receivedAt: "2026-09-16",
    summary:
      "Asked what a June date would cost for roughly 380 seniors and whether the building would definitely be open by then. Wants the athletics banquets quoted separately.",
    objectionId: "no-opening-date",
    nextStep: "Hold 12 June, confirm in writing that the hold costs nothing.",
    nextStepDue: "2026-09-25",
  },
  {
    id: "reply-seed-2",
    prospectId: "brea-chamber-of-commerce",
    disposition: "asked-for-info",
    receivedAt: "2026-09-15",
    summary:
      "Open to a member spotlight once there is something to show. Suggested the venue host a mixer in the opening quarter.",
    nextStep:
      "Offer the opening-quarter mixer. It costs a room on a slow night and puts four lanes inside the building at once.",
    nextStepDue: "2026-09-29",
  },
  {
    id: "reply-seed-3",
    prospectId: "fairway-ford",
    disposition: "no",
    receivedAt: "2026-09-10",
    summary:
      "Holiday party is already contracted at a hotel and has been for three years. Said to come back in February if we want the summer sales push.",
    objectionId: "already-committed",
    nextStep:
      "Diary February. The December door is shut and the June one was left open, which is a different answer from no.",
    nextStepDue: "2027-02-02",
  },
  {
    id: "reply-seed-4",
    prospectId: "silverado-brea-memory-care-community",
    disposition: "asked-for-info",
    receivedAt: "2026-09-18",
    summary:
      "Interested in a weekday daytime staff appreciation for about 40, split across two shifts so the community is never uncovered.",
    nextStep:
      "Quote two smaller weekday events rather than one. Two forty-person weekday bookings is better inventory for the venue than one eighty-person Friday.",
    nextStepDue: "2026-09-26",
  },
  {
    id: "reply-seed-5",
    prospectId: "beckman-coulter-inc",
    disposition: "wrong-person",
    receivedAt: "2026-09-17",
    summary:
      "General contact form routed to a customer support queue. No route to an internal events owner published anywhere.",
    nextStep:
      "This is why the Kraemer Blvd tabling shift is in the plan. There is no email door here, so the door is the lobby at lunchtime.",
    nextStepDue: "2026-09-30",
  },
  {
    id: "reply-seed-6",
    prospectId: "troy-high-school",
    disposition: "no-reply",
    receivedAt: "2026-09-12",
    summary:
      "First email to the published activities director address. No response after nine days.",
    nextStep:
      "Second touch, then a go-see. Two emails and a visit is the sequence; four emails is a spam folder.",
    nextStepDue: "2026-09-24",
  },
];
