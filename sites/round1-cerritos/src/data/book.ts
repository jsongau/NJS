import type { ActivityLine, BookLine, Reply } from "@/domain/types";
import { PACKAGES } from "@/data/packages";

/**
 * The book, seeded, read in Q3 2026.
 *
 * TWO LEDGERS AND THEY ARE NEVER ADDED TOGETHER. Signed contract value
 * on one side, hours spent outside the building on the other. One is
 * money somebody has agreed to pay and the other is time somebody has
 * agreed to spend, and a single figure that mixes the two describes
 * nothing that exists.
 *
 * TWO CONTRACTS. That is the whole revenue ledger, and it is the honest
 * number. A desk that has been working the Cerritos trade area for a few
 * weeks with two signed groups is not behind. Showing eleven contracts
 * here would have made a better screenshot and would have described a
 * situation nobody has ever been in.
 *
 * ---------------------------------------------------------------
 * EVERY PRICE IN THIS FILE IS ILLUSTRATIVE, AND THAT IS THE FINDING
 * ---------------------------------------------------------------
 *
 * The build this was forked from could show one contract on a published
 * per head price and one on a price a sales manager typed, and the gap
 * between the two was the argument of the whole page.
 *
 * ROUND1 PUBLISHES NO PRICE AT ALL. Not for the All Inclusive Party,
 * not for a party room, not for an hour, not for a minimum spend. The
 * book-a-party page names the package and itemises its contents and then
 * tells the reader to contact the venue. So there is no published half
 * of this book to set the typed half against, and pretending otherwise
 * by carrying a figure across from the operator this sample was forked
 * from would be the single most damaging thing this document could do.
 *
 * Both lines below therefore carry `illustrative` provenance on the
 * price, both say so in their own notes, and the Book page renders the
 * badge rather than a footnote. The honest reading of the revenue total
 * is that it is a worked example of what two signed groups look like,
 * not a forecast, and every screen that touches it says which.
 *
 * NO LANES ARE HELD BY EITHER LINE. Round1 publishes no bowling lane
 * count for any location, including Lakewood Center, and publishes no
 * guests per lane ratio either. `lanesHeld` is therefore zero on both
 * contracts rather than a share of a floor that has never been stated.
 * A capacity chart drawn against an unpublished denominator is worse
 * than no capacity chart, because it looks like arithmetic.
 */

/**
 * The package to write a contract against, taken from the catalogue.
 *
 * Looked up rather than spelled out, exactly as `data/prospects.ts` does
 * it, so this file can never sign a group up to a package id that
 * `data/packages.ts` does not actually carry.
 */
const CONTRACTED_PACKAGE_ID: string =
  PACKAGES.find((p) => p.id === "all-inclusive-party")?.id ?? PACKAGES[0].id;

export const SEED_BOOK: BookLine[] = [
  {
    id: "book-seed-1",
    ledger: "booked-revenue",
    source: "quote:cerritos-high-school",
    prospectId: "cerritos-high-school",
    packageId: CONTRACTED_PACKAGE_ID,
    guests: 60,
    /*
      A NUMBER NOBODY PUBLISHED.

      $27 a head is what a sixty student autumn club night might be
      written at. It is an example and it is labelled as one everywhere
      it renders. Round1 publishes the contents of the All Inclusive
      Party and no price for it, so there is nothing to check this
      against and the file says that instead of implying otherwise.
    */
    pricePerGuest: 27,
    pricePerGuestProvenance: "illustrative",
    depositPercent: 50,
    eventDate: "2026-11-20",
    /*
      Round1 publishes no lane count and no guests per lane figure, so
      this booking is recorded as holding no lanes rather than holding a
      modelled three. Zero here is a statement that the commitment is
      unknown, and the capacity screen renders it as withheld rather
      than as spare capacity.
    */
    lanesHeld: 0,
    notes:
      "Autumn club and society night for the campus activities office, sixty students, midweek. The published package contents can be read to the school today; the price cannot, and the school was told so in writing.",
    sortOrder: 0,
  },
  {
    id: "book-seed-2",
    ledger: "booked-revenue",
    source: "quote:porto-s-bakery-and-cafe",
    prospectId: "porto-s-bakery-and-cafe",
    packageId: CONTRACTED_PACKAGE_ID,
    guests: 120,
    /*
      The same kind of number as the one above and a different size of
      group, which is the only reason the two lines are not identical.
      A hundred and twenty covers on a December evening is a different
      negotiation from sixty students on a Tuesday, and neither figure
      is Round1's.
    */
    pricePerGuest: 31,
    pricePerGuestProvenance: "illustrative",
    depositPercent: 50,
    eventDate: "2026-12-11",
    lanesHeld: 0,
    notes:
      "Staff appreciation evening for the bakery's production and counter teams, split across the room rather than seated. Booked in the October to December window the account board computes from this organisation's own buying pattern.",
    sortOrder: 1,
  },
];

/**
 * The outbound plan for the period. Hours, and no money anywhere.
 *
 * THE SHAPE OF THIS ARRAY IS THE ARGUMENT.
 *
 * Add up the hours and most of them are outside the building. That is
 * not a stylistic choice. The posting asks for promotional product to be
 * sourced and for supplier and licensor relationships to be maintained
 * while new vendor opportunities are scouted, and a vendor is scouted by
 * standing in their unit, looking at what comes off their press and
 * asking what a run of five hundred costs and how long it takes.
 *
 * A plan that is mostly call blocks has quietly decided to do the job
 * from a chair. Call blocks are here, they are counted, and they are
 * deliberately the smallest share, because a delivery schedule is
 * negotiated far better in front of the machine that has to meet it.
 *
 * THE ROUTE IS SORTED BY WHAT EACH HOUR REACHES, NOT BY DISTANCE. Two
 * shapes of work dominate it. One is supply: the print, decorating,
 * embroidery and awards units along the Santa Fe Springs and Buena Park
 * industrial streets, which are what turn a licensed design into stock.
 * The other is audience: the mall concourse, the card and collectible
 * counters, and the two campuses, which are where a promotion is seen.
 * A period that works only one of the two either has stock nobody wants
 * or an audience with nothing to give them.
 *
 * EVERY LINE BELONGS TO SEAT 1, AND THAT IS THE FINDING RATHER THAN A
 * DEFAULT. Seats 2 and 3 are open, so one person is planning every hour
 * in a period whose lanes were split three ways. /team groups these
 * lines by seat and by lane, which is how the lanes with no hours
 * planned into them at all become visible. Three of the nine get none,
 * and that is honest rather than careless: the Cerritos board carries no
 * organisation in the auto and finance, healthcare or youth sports
 * lanes, so there is nothing in them to plan an hour against yet.
 */
export const SEED_ACTIVITY: ActivityLine[] = [
  {
    id: "act-seed-1",
    ledger: "outbound-activity",
    type: "networking-event",
    prospectId: "norwalk-chamber-of-commerce",
    locationLabel: "Norwalk Chamber of Commerce monthly mixer",
    week: "2026-09-14",
    hours: 3,
    targetConversations: 12,
    seatId: "seat-1",
    laneFocus: ["corporate", "hospitality-civic", "faith-nonprofit", "local-retail-food"],
    notes:
      "The single highest-leverage three hours in the period. A chamber mixer is not one prospect, it is a directory of local suppliers and retailers standing in one room expecting to be talked to, which is the cheapest introduction a promotions programme can buy.",
    sortOrder: 0,
  },
  {
    id: "act-seed-2",
    ledger: "outbound-activity",
    type: "tabling",
    prospectId: "los-cerritos-center",
    locationLabel: "Los Cerritos Center concourse, Saturday trading hours",
    week: "2026-09-14",
    hours: 4,
    targetConversations: 25,
    seatId: "seat-1",
    laneFocus: ["local-retail-food"],
    notes:
      "A regional centre about two miles from the office, with the specialty leasing desk that sells the concourse space an activation would stand in and a tenant directory of retailers who already buy prize and giveaway stock. One table reaches the site and the tenants in the same afternoon.",
    sortOrder: 1,
  },
  {
    id: "act-seed-3",
    ledger: "outbound-activity",
    type: "go-see",
    locationLabel: "Santa Fe Springs print, label and decorating streets",
    week: "2026-09-21",
    hours: 3,
    targetConversations: 8,
    seatId: "seat-1",
    laneFocus: ["corporate"],
    notes:
      "Nine printers, label houses and packaging suppliers inside two miles of each other, almost none of which publish a buyer's email and all of which have a sales manager standing on a shop floor. Terms and lead times are quoted at a counter in this lane and nowhere else.",
    sortOrder: 2,
  },
  {
    id: "act-seed-4",
    ledger: "outbound-activity",
    type: "go-see",
    prospectId: "french-press-custom-apparel-printing-and-design",
    locationLabel: "French Press Custom Apparel, Santa Fe Springs",
    week: "2026-09-21",
    hours: 1.5,
    targetConversations: 2,
    seatId: "seat-1",
    laneFocus: ["corporate"],
    notes:
      "Screen print and custom apparel inside the trade area, which is what turns a licensed design into staff and prize tees without a long lead time. The ask is a written price break table and a stated turnaround, held before a season starts rather than after.",
    completedAt: "2026-09-22",
    sortOrder: 3,
  },
  {
    id: "act-seed-5",
    ledger: "outbound-activity",
    type: "tabling",
    prospectId: "cerritos-college",
    locationLabel: "Cerritos College, club rush week tables",
    week: "2026-09-28",
    hours: 5,
    targetConversations: 40,
    seatId: "seat-1",
    laneFocus: ["colleges"],
    notes:
      "Hundreds of student organisations set up their own tables on the same day and the anime, gaming and esports clubs are all in that row. Being one of the tables costs very little and reaches more student officers in five hours than a term of emails.",
    sortOrder: 4,
  },
  {
    id: "act-seed-6",
    ledger: "outbound-activity",
    type: "call-block",
    locationLabel: "Desk, Tuesday and Thursday mornings, vendor and licensor calls",
    week: "2026-09-28",
    hours: 4,
    targetConversations: 10,
    seatId: "seat-1",
    laneFocus: ["corporate"],
    notes:
      "The only inside hours in the plan. They are aimed at the one thing a phone is genuinely better at than a doorway, which is chasing a quote that has already been given: confirming a unit cost, a minimum order quantity and a delivery date against a purchase order.",
    sortOrder: 5,
  },
  {
    id: "act-seed-7",
    ledger: "outbound-activity",
    type: "go-see",
    locationLabel: "Card, hobby and collectible counters, Cerritos and Artesia",
    week: "2026-10-05",
    hours: 3,
    targetConversations: 6,
    seatId: "seat-1",
    laneFocus: ["local-retail-food"],
    notes:
      "A row of card, hobby and collectible counters inside a couple of miles of the office, each with the person who decides standing behind it. Walking the shelves is competitive pricing research on prize stock and a conversation with the buyer at the same time, and it is the only lane where both happen in one visit.",
    sortOrder: 6,
  },
  {
    id: "act-seed-8",
    ledger: "outbound-activity",
    type: "email-sequence",
    locationLabel: "Published district, campus and student activities addresses",
    week: "2026-10-05",
    hours: 2,
    targetConversations: 6,
    seatId: "seat-1",
    laneFocus: ["schools", "colleges"],
    notes:
      "Schools and colleges are the only lanes where the decision maker's office and address are already published. Two hours of writing reaches every one of them, and their calendars are set an academic year ahead, which is why this lane goes first every single period.",
    sortOrder: 7,
  },
  {
    id: "act-seed-9",
    ledger: "outbound-activity",
    type: "networking-event",
    locationLabel: "Santa Fe Springs and Los Alamitos chamber mixers",
    week: "2026-10-12",
    hours: 4,
    targetConversations: 16,
    seatId: "seat-1",
    laneFocus: ["corporate", "faith-nonprofit", "local-retail-food"],
    notes:
      "The Cerritos trade area does not stop at the city line and neither do its neighbouring chambers. Santa Fe Springs is where the suppliers are and Los Alamitos is where a second set of employers is. Same evening format, a different few hundred businesses.",
    sortOrder: 8,
  },
  {
    id: "act-seed-10",
    ledger: "outbound-activity",
    type: "venue-tour",
    locationLabel: "Round1 Lakewood Center, 401 Lakewood Ctr Mall",
    week: "2026-10-12",
    hours: 3,
    targetConversations: 6,
    seatId: "seat-1",
    laneFocus: ["schools", "corporate", "hospitality-civic"],
    notes:
      "The nearest store to the office and the only Round1 floor inside this trade area. It is open, it trades until midnight on a weeknight, and a buyer who has stood on the floor asks a different set of questions afterwards. Nothing here is a claim about the store's capacity, because no lane count is published for it.",
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
 * first. Lexus of Cerritos is here saying no in their own words, and the
 * reason they gave is the most useful sentence in this file. The
 * unanswered one at the bottom is the second most useful.
 */
export const SEED_REPLIES: Reply[] = [
  {
    id: "reply-seed-1",
    prospectId: "gahr-high-school",
    disposition: "meeting-set",
    receivedAt: "2026-09-16",
    summary:
      "Asked what an end of year night would cost for roughly 380 seniors and how far ahead the date has to be settled. Wants the team and club outings quoted separately from the graduating year.",
    objectionId: "no-published-price",
    nextStep:
      "Take the published package contents and the change notice in writing, and say plainly that no price is published and the figure has to come from the store.",
    nextStepDue: "2026-09-25",
  },
  {
    id: "reply-seed-2",
    prospectId: "norwalk-chamber-of-commerce",
    disposition: "asked-for-info",
    receivedAt: "2026-09-15",
    summary:
      "Open to a member spotlight and suggested the desk take a table at the next mixer rather than a slot on the agenda. Asked for a one page description of what a member promotion would actually involve.",
    nextStep:
      "Write the one page and take a table. A table costs an evening and puts the supplier half and the retailer half of this board in front of one person at once.",
    nextStepDue: "2026-09-29",
  },
  {
    id: "reply-seed-3",
    prospectId: "lexus-of-cerritos",
    disposition: "no",
    receivedAt: "2026-09-10",
    summary:
      "Holiday party is already contracted at a hotel and has been for three years. Said to come back in February, when the sales incentive prizes for the spring push are chosen.",
    objectionId: "already-committed",
    nextStep:
      "Diary February. The December door is shut and the incentive prize door was left open, which is a different answer from no and is closer to this desk's actual job.",
    nextStepDue: "2027-02-02",
  },
  {
    id: "reply-seed-4",
    prospectId: "nettrophy-buena-park-plaque-and-trophy",
    disposition: "asked-for-info",
    receivedAt: "2026-09-18",
    summary:
      "Will quote custom awards and medals but wants an annual volume before setting a price break table. Asked whether artwork would arrive print ready and whether any of it carries a licensed property.",
    nextStep:
      "Answer the licensing question before the volume question. A supplier who has to handle licensed artwork needs the approval route in writing first, and that is a contract term rather than a price.",
    nextStepDue: "2026-09-26",
  },
  {
    id: "reply-seed-5",
    prospectId: "abc-unified-school-district",
    disposition: "wrong-person",
    receivedAt: "2026-09-17",
    summary:
      "The general district contact routed to an enquiries queue. No route to whoever approves outside partners for campus events is published anywhere on the site.",
    nextStep:
      "This is why the published campus addresses are worked directly and why the district office is a go-see. There is no email door here, so the door is a front counter.",
    nextStepDue: "2026-09-30",
  },
  {
    id: "reply-seed-6",
    prospectId: "los-cerritos-center",
    disposition: "no-reply",
    receivedAt: "2026-09-12",
    summary:
      "First approach to the centre's marketing office about concourse space and a tenant co-promotion. No response after nine days.",
    nextStep:
      "Second touch, then walk into the management office during the tabling shift. Two emails and a visit is the sequence; four emails is a spam folder.",
    nextStepDue: "2026-09-24",
  },
];
