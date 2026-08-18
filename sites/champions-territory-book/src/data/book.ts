import type { ActivityLine, BookLine, Reply } from "@/domain/types";

/**
 * The book, seeded, twelve weeks before the autumn heating campaign has
 * to be live.
 *
 * TWO SIGNED LINES. That is the whole book, and it is the honest number.
 *
 * A territory twelve weeks out with two signed lines is not behind. It
 * is roughly where one person gets to after a few weeks of working a
 * trade area that has no CRM history in it, because the history sits
 * inside five separate agencies and five separate brand sites. Showing
 * eleven signed lines here would have made a better screenshot and would
 * have described a situation nobody has ever been in.
 *
 * The two are chosen to show the one distinction that runs through this
 * whole application:
 *
 *   TEAM KWON is on a PUBLISHED price. The summer campaign is 47 dollars
 *   for a tune-up on servicechampions.com/summer-savings/, so that line
 *   is arithmetic anybody can check against the brand's own page.
 *
 *   HEIGHTS CHRISTIAN is on a price a person typed. CHAMP-Rewards names
 *   its benefits, itemises a 500 dollar credit and a 19 dollar
 *   diagnostic, and routes the price question to a phone number. There
 *   is no published figure to compute from, so 19.95 a month is what
 *   somebody put in the box, borrowed from the only comparable the group
 *   publishes anywhere: ASI Rewards, in a different county. The line
 *   carries "user_input" provenance and the Book page states, in words,
 *   how much of the total rests on a figure somebody chose in a meeting.
 *
 * That second number is the one a general manager should want to see and
 * the one a pipeline report never shows them. It is also the whole
 * commercial argument of this console in one field: twelve of the
 * eight of the fourteen brands profiled name a membership plan and hide its price, five publish no plan at all, and not one of the fourteen publishes a price,
 * and a division that publishes one first owns ground nobody else is
 * standing on.
 *
 * WHAT THIS PAIR GETS WRONG. Both lines are enrolments reached THROUGH
 * an organisation rather than one household at a time, which is the
 * partner motion and not the search motion. The search motion is where
 * most of the division's volume actually comes from, and none of it
 * appears here, because a call that arrives from a paid result has no
 * counterparty to seed and inventing two hundred of them would be
 * inventing revenue.
 */
export const SEED_BOOK: BookLine[] = [
  {
    id: "book-seed-1",
    ledger: "booked-revenue",
    source: "quote:heights-christian-schools-brea-campus",
    prospectId: "heights-christian-schools-brea-campus",
    packageId: "champ-rewards-unpriced",
    guests: 60,
    /*
      A NUMBER A PERSON TYPED.

      Service Champions publishes no price for CHAMP-Rewards. 19.95 a
      month is what a manager would put against sixty households, and it
      is borrowed rather than observed: ASI Hastings publishes ASI
      Rewards at 19.95 in San Diego County, and Timo's publishes its
      Advantage Plan at 15 in the Coachella Valley. Neither is this
      brand and neither is this territory. It renders everywhere with a
      user-input badge and it is called out by name in the Book totals,
      because the alternative, letting it sit in a revenue figure looking
      exactly like the 47 dollars below, is how a forecast becomes
      fiction one plausible line at a time.
    */
    pricePerGuest: 19.95,
    pricePerGuestProvenance: "user_input",
    depositPercent: 50,
    eventDate: "2026-11-20",
    /*
      A membership enrolment holds no crew capacity on the day it is
      signed. The visits it entitles a household to are scheduled one at
      a time across the following year, which is exactly what makes a
      plan worth more than a coupon. Recording three crew slots here
      would have overstated the branch's committed capacity by three
      slots on a single November day, which is the kind of quiet error
      that makes a capacity chart useless.
    */
    lanesHeld: 0,
    notes:
      "Sixty households enrolled through one campus office, not sixty separate sales. Recurring monthly revenue rather than a job, which is why it sits in the book with no crew day against it.",
    sortOrder: 0,
  },
  {
    id: "book-seed-2",
    ledger: "booked-revenue",
    source: "quote:team-kwon-taekwondo-center-hq",
    prospectId: "team-kwon-taekwondo-center-hq",
    packageId: "sc-summer-tuneup-47",
    guests: 45,
    pricePerGuest: 47,
    /* Published on servicechampions.com/summer-savings/, 18 August 2026. */
    pricePerGuestProvenance: "public",
    depositPercent: 50,
    eventDate: "2026-12-12",
    /* Forty-five properties at the console's own planning rate of one
       crew slot per twenty doors is three slots, and the block is being
       run on one December Saturday rather than spread. */
    lanesHeld: 3,
    notes:
      "Sold on the published 47 dollar tune-up and delivered in December, which is the reason the 31 August expiry matters: the price has been promised past the date the campaign dies, and no successor campaign is published yet.",
    sortOrder: 1,
  },
];

/**
 * The outbound plan for the period. Hours, and no money anywhere.
 *
 * THE SHAPE OF THIS ARRAY IS THE ARGUMENT.
 *
 * Add up the hours and most of them are outside the office. That is not
 * a stylistic choice. The posting asks for local marketing initiatives
 * focused on demand generation and campaign execution, for partnership
 * with general managers and operational leaders as the brand's go-to
 * marketing expert, and for vendor and agency management. None of those
 * happens on a dashboard.
 *
 * A plan that is mostly call blocks has quietly decided to do the job
 * from a chair. Call blocks are here, they are counted, and they are
 * deliberately the smallest share, because the thing a local brand sells
 * is trust in a postcode and that is very hard to build down a phone
 * line and much easier to build standing in somebody's lobby.
 *
 * WHAT THIS PLAN CANNOT SEE. Every hour here is outbound. The paid
 * search, Local Services Ads and retargeting work that produces most of
 * the division's phone calls is agency-run and does not consume hours on
 * this ledger at all, so a reader who takes this as the whole marketing
 * week will badly under-count it. The two ledgers are booked work and
 * outbound hours; media spend is a third thing and it lives on /spend.
 *
 * EVERY LINE BELONGS TO SEAT 1, AND THAT IS THE FINDING RATHER THAN A
 * DEFAULT. Seats 2 and 3 are open, so one person is planning every hour
 * in a period whose service lines were split three ways. /team groups
 * these lines by seat and by line, which is how the service line with no
 * hours planned into it at all becomes visible.
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
    laneFocus: ["multi-service", "drain-sewer", "partner-community", "partner-employer"],
    notes:
      "The single highest-leverage three hours in the period. A chamber mixer is not one prospect, it is a room containing four service lines at once, standing up, expecting to be talked to.",
    sortOrder: 0,
  },
  {
    id: "act-seed-2",
    ledger: "outbound-activity",
    type: "tabling",
    locationLabel: "Beckman Coulter / Envista campus, S Kraemer Blvd, benefits fair at lunch",
    week: "2026-09-14",
    hours: 4,
    targetConversations: 25,
    seatId: "seat-1",
    laneFocus: ["multi-service"],
    notes:
      "Two of Brea's largest single-site employers are on the same street. One table, one lunch hour, and the message is the one a multi-service brand can make and a one-van contractor cannot: one number for the whole house.",
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
    laneFocus: ["hvac"],
    notes:
      "The autumn heating campaign has to be placed somewhere before October, and a school newsletter reaches several hundred local households for the cost of a visit. One office, one conversation, a whole term of placements.",
    completedAt: "2026-09-22",
    sortOrder: 2,
  },
  {
    id: "act-seed-4",
    ledger: "outbound-activity",
    type: "go-see",
    locationLabel: "Brea churches and civic offices, N Brea Blvd",
    week: "2026-09-21",
    hours: 3,
    targetConversations: 8,
    seatId: "seat-1",
    laneFocus: ["partner-community"],
    notes:
      "Five organisations inside a mile, none of which publish an email and all of which have somebody standing at a desk who decides what goes in the weekly bulletin. This line cannot be worked any other way.",
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
    laneFocus: ["plumbing"],
    notes:
      "Hundreds of recognised student organisations set up their own tables on the same day. Plumbing is the line worth carrying to a room with no season in it, because a burst line waits for nobody and the decision takes two minutes on a phone.",
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
    laneFocus: ["drain-sewer", "electrical"],
    notes:
      "The only inside hours in the plan, and they are aimed at the two lines where the buyer is genuinely standing next to a phone: a property manager with a blocked main, and a landlord who has been told the panel needs replacing.",
    sortOrder: 5,
  },
  {
    id: "act-seed-7",
    ledger: "outbound-activity",
    type: "go-see",
    prospectId: "embassy-suites-by-hilton-brea-north-orange-count",
    locationLabel: "Embassy Suites Brea, front office",
    week: "2026-10-05",
    hours: 1.5,
    targetConversations: 2,
    seatId: "seat-1",
    laneFocus: ["partner-employer"],
    notes:
      "A hotel that runs its own plant asks a contractor for a number long before a household does, and it recommends one to every business it hosts. This is a referral relationship, not a job, and it is worth more than most jobs.",
    sortOrder: 6,
  },
  {
    id: "act-seed-8",
    ledger: "outbound-activity",
    type: "email-sequence",
    locationLabel: "The ninety-three published addresses on the board",
    week: "2026-10-05",
    hours: 2,
    targetConversations: 6,
    seatId: "seat-1",
    laneFocus: ["hvac", "plumbing"],
    notes:
      "Ninety-three of the organisations on this board publish an address on their own page, and it is the only set where the role and the route are both already known. Two hours of writing reaches every one of them, carrying the heating turnover and the plumbing check together.",
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
    laneFocus: ["multi-service", "drain-sewer", "partner-property"],
    notes:
      "The territory does not stop at the city line, and neither do its two neighbouring chambers. Same three hours, a different four hundred businesses, and the property managers are in these rooms rather than in Brea's.",
    sortOrder: 8,
  },
  {
    id: "act-seed-10",
    ledger: "outbound-activity",
    type: "venue-tour",
    locationLabel: "625 Columbia St, Brea, dispatch morning and a ride-along",
    week: "2026-10-12",
    hours: 3,
    targetConversations: 6,
    seatId: "seat-1",
    laneFocus: ["partner-employer", "hvac", "multi-service"],
    notes:
      "A morning in dispatch and an afternoon on a truck. It is how marketing finds out what the crew can actually deliver in October before promising it in an advert, and it is the cheapest way to stop writing copy the field has to apologise for.",
    sortOrder: 9,
  },
];

/**
 * What came back.
 *
 * Including the ones that said no, and including the silence.
 *
 * A pipeline that records only its wins teaches nobody anything, and a
 * hiring manager who has run a division will look for the losses first.
 * Fairway Ford is here saying no in their own words, and the reason they
 * gave is the most useful sentence in this file: it is the incumbent
 * objection, it is answered in data/objections.ts, and it is the answer
 * that decides whether a multi-brand division is worth anything to a
 * property that already has somebody.
 *
 * FIVE OF THESE SIX ANSWER A ROW IN THE OUTBOX, BY ID AND BY DATE. The
 * outbox in state/OutboxProvider.tsx holds five messages: the staged
 * replacement proposal to Amerige Pointe, the pre-season walkthrough to
 * the school district, the rebate session offered to the chamber, the
 * drain survey offered to the dealership, and the condition survey to
 * The Pointe that nobody answered. Each of those has its counterpart
 * below, with the same disposition the outbox records and a date after
 * the one it was sent on. Two seeded screens describing two different
 * weeks would be the fastest way to prove neither of them is real.
 *
 * The sixth, Beckman Coulter, deliberately has no outbox row. That touch
 * went through a contact form rather than an email, which is the only
 * door that organisation publishes, and a form submission is not a sent
 * message. It comes back routed to a support queue, which is what the
 * form lane mostly does and the reason the Kraemer Blvd tabling shift is
 * in the plan above.
 *
 * THESE SIX ARE ILLUSTRATIVE AND EVERY SURFACE THAT SHOWS THEM SAYS SO.
 * No named organisation said any of this. They are written to be
 * representative of the shape a real fortnight takes, which is mostly
 * silence, routing corrections and one flat no.
 */
export const SEED_REPLIES: Reply[] = [
  {
    id: "reply-seed-1",
    prospectId: "brea-olinda-unified-school-district",
    disposition: "meeting-set",
    receivedAt: "2026-09-16",
    summary:
      "Wants to know what a pre-season walkthrough would cover across eleven sites, and whether it can be done before the October board meeting. Asked for the two oldest campuses to be priced separately, and asked whether the rebate figures a supplier had quoted them are still real, because a parent had already told them the federal credit had gone.",
    objectionId: "no-opening-date",
    nextStep: "Confirm in writing which rebates are live and drop the ones that are not, then put a September walkthrough week in the diary before the board papers close.",
    nextStepDue: "2026-09-25",
  },
  {
    id: "reply-seed-2",
    prospectId: "brea-chamber-of-commerce",
    disposition: "asked-for-info",
    receivedAt: "2026-09-15",
    summary:
      "Open to a member spotlight once there is a campaign to spotlight, but the rebate session is the part they want. Asked for an outline and said they would find a morning for it.",
    nextStep:
      "Send the outline, sourced line by line, with nothing in it that cannot be shown on a utility page. The session is thirty minutes and it puts four service lines in front of the room at once.",
    nextStepDue: "2026-09-29",
  },
  {
    id: "reply-seed-3",
    prospectId: "fairway-ford",
    disposition: "no",
    receivedAt: "2026-09-10",
    summary:
      "Facilities is contracted through the dealer group and has been for three years. The plumber on that contract has looked after the building for eleven years, knows it and answers his phone. Said to come back in February about the fleet vehicle work.",
    objectionId: "already-committed",
    nextStep:
      "Diary February and ask for the work he does not do rather than the work he does. The drain door is shut and the fleet one was left open, which is a different answer from no.",
    nextStepDue: "2027-02-02",
  },
  {
    id: "reply-seed-4",
    prospectId: "amerige-pointe-apartments-greystar",
    disposition: "asked-for-info",
    receivedAt: "2026-09-18",
    summary:
      "The board will not sign one capital number this year, so the staged version is the one they want, in writing, with the unit counts on it. Said plainly that they need something to show ownership, and asked what the plan costs a month.",
    nextStep:
      "Send the staged option with unit counts and a monthly figure on it, or say plainly that the brand does not publish one. This is the question the whole board says nobody answers.",
    nextStepDue: "2026-09-26",
  },
  {
    id: "reply-seed-5",
    prospectId: "beckman-coulter-inc",
    disposition: "wrong-person",
    receivedAt: "2026-09-17",
    summary:
      "General contact form routed to a customer support queue. No route to whoever owns facilities or employee benefits is published anywhere.",
    nextStep:
      "This is why the Kraemer Blvd tabling shift is in the plan. There is no email door here, so the door is the lobby at lunchtime.",
    nextStepDue: "2026-09-30",
  },
  {
    id: "reply-seed-6",
    prospectId: "the-pointe-apartments-olen-living",
    disposition: "no-reply",
    receivedAt: "2026-09-12",
    summary:
      "First email to the community manager at the published leasing address, offering a condition survey across the units. No response after nine days.",
    nextStep:
      "Second touch, then a go-see. Two emails and a visit is the sequence; four emails is a spam folder.",
    nextStepDue: "2026-09-24",
  },
];
