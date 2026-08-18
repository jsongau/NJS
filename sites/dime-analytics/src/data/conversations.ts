import type {
  ConversationMessage,
  OfferExtension,
} from "@/domain/types";

/**
 * THE THREADS. What was actually said, to whom, and what it changed.
 *
 * WHY THIS FILE EXISTS. Everything else in this application could tell
 * you where a hundred and nine organisations stand. None of it could
 * tell you what any of them said. A status chip that reads "In
 * conversation" with nothing behind it is somebody's memory written down
 * badly, and the first question anybody asks when they open a record is
 * not "what stage is this", it is "what did they say, and when".
 *
 * So this is the message history: both directions, threaded per
 * organisation, with the channel on every row, because "we filled in
 * their form twice and then stood at their counter" and "we filled in
 * their form four times" produce the same touch count and describe
 * completely different situations.
 *
 * THIRTY-FOUR OF THE HUNDRED AND NINE HAVE A THREAD. The other
 * seventy-five have nothing at all, and that is the honest shape of a
 * trade area a few weeks into being worked by one person: a hundred
 * messages, sixty-four of them outbound, thirty-six back. Every screen
 * that reads this file has to survive an organisation with no history,
 * because seventy-five of them have none.
 *
 * THE CHANNEL MIX IS NOT AN ACCIDENT AND IT IS NOT THE FORK'S. The
 * board in data/prospects.ts publishes no email address for any of the
 * hundred and nine, because none was gathered. A board like that cannot
 * open with a cold email, so almost every first touch here is a contact
 * form or a door, and email only appears on a thread after somebody has
 * written back from an inbox of their own. Read the channel column
 * before reading the reply rate: the forms are where the silence is.
 *
 * THIS IS NOT A FLATTERING PIPELINE, AND THAT IS THE ENTIRE POINT.
 *
 * Count what is in here before reading any of it. There are more silent
 * threads than warm ones. There is an absence reply from a school
 * activities office, a store manager who could tell us what sells but
 * could not commit a promotion because the calendar is set somewhere
 * else, a headquarters that routed us to a desk its own form does not
 * reach, a label manufacturer whose minimum run is bigger than any
 * promotion this desk would place, and a trampoline park that sells the
 * same evening and said so to our face. Most published pipelines are a
 * wall of interested parties, which is how a pipeline stops being a
 * decision tool and becomes a mood board. The failures are the rows that
 * teach a reader anything.
 *
 * OUT OF OFFICE, WRONG PERSON AND COME BACK LATER ARE REQUEUES, NOT
 * REJECTIONS. All three mean try again, differently. They matter more
 * here than in most territories: a school front office is genuinely dark
 * for a fortnight at a time, and at a chain retailer the person you can
 * reach at the counter is very often not the person who can sign. A tool
 * that filed any of them as a no would delete live records.
 *
 * THE RULES THIS FILE KEEPS.
 *
 * NO INVENTED PEOPLE, in either direction. Every counterparty is a role.
 * Every address sits on the .invalid domain, which RFC 2606 reserves and
 * which can never resolve, exactly as the outbound half of this app uses
 * DEMO_RECIPIENT.
 *
 * NOTHING IS PUT IN A REAL ORGANISATION'S MOUTH AS FACT. Every row
 * carries "illustrative" provenance and the interface says so wherever
 * it renders one. These are written to be representative of the shape a
 * real week takes, not to report one.
 *
 * NO PRICE IS QUOTED ANYWHERE IN THIS FILE, BECAUSE ROUND1 PUBLISHES
 * NONE. Where a counterparty asks what it costs, and several of them do,
 * the answer in the thread is the true one: the party page names what is
 * in the package and then says to contact the venue, so the contents can
 * be quoted today and the figure cannot. A supplier quoting a minimum
 * order quantity is a quantity rather than a price, and those appear
 * here as what they are.
 *
 * THE INBOUND ENQUIRIES ALREADY IN data/requests.ts APPEAR HERE ONCE,
 * carrying their request id. They are the same event seen from two
 * angles: the request row owns the response clock and the qualifying
 * fields, the message owns the words and the thread position. Anything
 * that counts both without checking `requestId` will double them, which
 * is why the field exists. Six messages below carry one; every other
 * message in this file is a thread event and nothing else.
 */

const ILLUSTRATIVE = "illustrative" as const;

// ---------------------------------------------------------------
// The worked records
// ---------------------------------------------------------------

/**
 * The four anchor accounts, and the conversations that put them where
 * they are.
 *
 * These threads were written to agree with the status rows in
 * data/prospectStatus.ts: where a date, a headcount or a touch count
 * appears there, it appears here unchanged, because a history that
 * contradicted the board it belongs to would be worse than no history.
 */
const WORKED: ConversationMessage[] = [
  // Norwalk-La Mirada Unified School District. The largest held date on
  // the board, sitting on the weakest kind of commitment.
  {
    id: "msg-nlmusd-1",
    prospectId: "norwalk-la-mirada-unified-school-district",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-03T09:15:00-07:00",
    counterpartyRole: "Purchasing and contracts officer",
    subject: "District contact form",
    body: "Submitted through the district's own form, which is the only written route it publishes. Two questions and nothing else: how does a vendor get registered here, and which office plans the classified staff appreciation evening?",
    summarised: false,
    effect: {
      note: "First touch, written to produce a routing answer even if it produces nothing else.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-nlmusd-2",
    prospectId: "norwalk-la-mirada-unified-school-district",
    direction: "inbound",
    channel: "email",
    at: "2026-09-11T14:05:00-07:00",
    counterpartyRole: "Purchasing and contracts officer",
    address: "purchasing@demo.invalid",
    subject: "Re: District contact form",
    body: "Vendor registration goes to the board for approval and the packet takes a cycle. The staff appreciation evening is ours, roughly 96 people, and we would want a December weekday. What is actually included, and can you hold a date while the paperwork runs?",
    summarised: false,
    effect: {
      note: "The record moved on their terms. A headcount, a month and a paperwork clock, in four lines.",
      movedStatusTo: "conversation",
      signals: ["named-a-headcount", "asked-for-a-date", "asked-for-it-in-writing"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-nlmusd-3",
    prospectId: "norwalk-la-mirada-unified-school-district",
    direction: "outbound",
    channel: "email",
    at: "2026-09-12T08:50:00-07:00",
    counterpartyRole: "Purchasing and contracts officer",
    address: "purchasing@demo.invalid",
    subject: "What is included, in writing, and a date held while the packet runs",
    body: "In writing, because that is what a board packet needs. DIME publishes the contents of its All Inclusive Party: arcade time-play, bowling with shoe rental, karaoke or a party room, billiards and ping pong, pizza and soda, and a group photo, with a VIP Immersive Lane available as an add-on at a separate fee. It publishes no price for any of it and directs you to the venue for a figure, so I am not going to put one in an email. It does publish that changes to a booking need three or more days notice, which is the one term I can commit to today. A December weekday can be held at no cost while your registration runs.",
    summarised: false,
    effect: {
      note: "Answered the price question with what is published and put a hold on the table in place of a figure.",
      offerExtensionId: "offx-nlmusd-package",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-nlmusd-4",
    prospectId: "norwalk-la-mirada-unified-school-district",
    direction: "inbound",
    channel: "email",
    at: "2026-09-21T16:10:00-07:00",
    counterpartyRole: "Purchasing and contracts officer",
    address: "purchasing@demo.invalid",
    subject: "Re: What is included, in writing, and a date held while the packet runs",
    body: "Hold 18 December for us. Nothing can be signed until the board approves the registration, so treat that date as pencil until you hear otherwise.",
    summarised: false,
    effect: {
      note: "A date held against no deposit and an approval this desk does not control. The most fragile row on the board.",
      movedStatusTo: "soft-hold",
      signals: ["held-a-date"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-nlmusd-5",
    prospectId: "norwalk-la-mirada-unified-school-district",
    direction: "outbound",
    channel: "phone",
    at: "2026-09-22T10:20:00-07:00",
    counterpartyRole: "Purchasing and contracts officer",
    body: "Called to confirm the hold and to ask what the board packet actually needs from a vendor. Insurance certificate, a signed vendor form and a written statement of what is supplied. None of that is a negotiation, so it is work this desk can simply do.",
    summarised: true,
    effect: {
      note: "Turned a vague blocker into a list of three documents, which is the difference between waiting and working.",
    },
    provenance: ILLUSTRATIVE,
  },

  // ABC Unified School District. One conversation that reaches every
  // campus behind it, and it took a fortnight to get an answer.
  {
    id: "msg-abcusd-1",
    prospectId: "abc-unified-school-district",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-04T09:05:00-07:00",
    counterpartyRole: "Community relations office",
    subject: "District contact form",
    body: "The district office is about a mile from the Irvine office, which is close enough that this should be a walk rather than a form, and the form is still the only published route. Asked who approves a partner visiting campuses and when the calendar for staff and student events is set.",
    summarised: false,
    effect: {
      note: "First touch into the office that plans centrally, rather than into nine separate campuses.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-abcusd-2",
    prospectId: "abc-unified-school-district",
    direction: "inbound",
    channel: "email",
    at: "2026-09-10T11:40:00-07:00",
    counterpartyRole: "Community relations office",
    address: "community-relations@demo.invalid",
    subject: "Re: District contact form",
    body: "Spring and summer dates are settled in the autumn, so you are early rather than late. Anything going in front of students needs the packet approved first. Send what you would supply and what it says on it, and I will put it in front of the right desk.",
    summarised: false,
    effect: {
      note: "A real answer and a real gate. What goes on the merchandise matters here more than what it costs.",
      movedStatusTo: "conversation",
      signals: ["asked-for-it-in-writing"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-abcusd-3",
    prospectId: "abc-unified-school-district",
    direction: "outbound",
    channel: "email",
    at: "2026-09-17T08:35:00-07:00",
    counterpartyRole: "Community relations office",
    address: "community-relations@demo.invalid",
    subject: "What would be supplied, and what would be printed on it",
    body: "Two things, kept apart on purpose. First, the group side: DIME publishes what its All Inclusive Party contains and publishes no price for it, so the contents can go in your packet today and a figure has to come from the venue. Second, the merchandise side, which is the part your desk actually reviews: any giveaway stock for a reading or attendance programme would carry artwork approved in writing by whoever holds the licence, and nothing goes on a district campus that has not been through that approval. Happy to send samples before anything is ordered.",
    summarised: false,
    effect: {
      note: "Separated the booking from the merchandise, because only one of the two needs their approval.",
      offerExtensionId: "offx-abcusd-package",
    },
    provenance: ILLUSTRATIVE,
  },

  // Irvine College. Not one customer, hundreds of student
  // organisations, and the activities office is the door to all of them.
  {
    id: "msg-cerritos-college-1",
    prospectId: "cerritos-college",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-02T10:10:00-07:00",
    counterpartyRole: "Student activities manager",
    subject: "Student life enquiry, autumn term",
    body: "Autumn is when student organisation budgets get set, which makes September the only useful month for this conversation. Asked whether the club fair still runs, whether an outside partner can take a table, and who signs off prize stock for a campus tournament.",
    summarised: false,
    effect: {
      note: "First touch, timed to the term rather than to this desk's week.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-cerritos-college-2",
    prospectId: "cerritos-college",
    direction: "inbound",
    channel: "email",
    at: "2026-09-09T13:15:00-07:00",
    counterpartyRole: "Student activities manager",
    address: "student-activities@demo.invalid",
    subject: "Re: Student life enquiry, autumn term",
    body: "Tables are available and about 200 students come through the fair in a day. The esports club runs a tournament each term and buys its own prizes badly, so if you can supply prize stock that is the more interesting half. Put both in writing and I will take it to the advisor.",
    summarised: false,
    effect: {
      note: "They named the audience and then named a better use for us than the one we asked about.",
      movedStatusTo: "conversation",
      signals: ["named-a-headcount", "asked-for-it-in-writing"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-cerritos-college-3",
    prospectId: "cerritos-college",
    direction: "outbound",
    channel: "email",
    at: "2026-09-10T09:00:00-07:00",
    counterpartyRole: "Student activities manager",
    address: "student-activities@demo.invalid",
    subject: "A table, and prize stock for the tournament",
    body: "Both, in writing, as asked. The table is straightforward. The prize stock is the part worth doing properly: quantities set to the bracket size rather than to a round number, artwork approved in writing before anything is decorated, and a delivery date that sits a fortnight before the tournament rather than the week of it. On the group side, DIME publishes what the All Inclusive Party includes and publishes no price, so the contents are yours to circulate and the figure comes from the venue.",
    summarised: false,
    effect: {
      note: "Answered the prize question with lead times and approvals, which is the part a student advisor cannot do themselves.",
      offerExtensionId: "offx-cerritos-college-package",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-cerritos-college-4",
    prospectId: "cerritos-college",
    direction: "inbound",
    channel: "contact-form",
    at: "2026-09-21T09:05:00-07:00",
    counterpartyRole: "Student activities manager",
    address: "student-activities@demo.invalid",
    requestId: "req-07",
    subject: "Events form enquiry, submitted",
    body: "Spring term social for the recognised student organisations, 21 January, about 200, with the anime and esports clubs driving it. The budget is per head and modest. It has to be invoiced to the college rather than paid on the night.",
    summarised: false,
    effect: {
      note: "Came back eleven days later through the form rather than the thread, with a date, a headcount and a payment route. The payment route is the part that decides this.",
      movedStatusTo: "conversation",
      signals: ["named-a-headcount", "asked-for-a-date"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-cerritos-college-5",
    prospectId: "cerritos-college",
    direction: "outbound",
    channel: "email",
    at: "2026-09-21T11:20:00-07:00",
    counterpartyRole: "Student activities manager",
    address: "student-activities@demo.invalid",
    subject: "21 January, invoiced to the college",
    body: "Acknowledged inside the response commitment rather than at the end of it. Invoicing the college rather than taking payment on the night is the normal shape for a student organisation budget and it is not a problem; it does mean the paperwork starts now rather than in January. On the modest per head budget: no price is published to negotiate against, so the number will come from the venue against 200 and a January weeknight, and it will arrive in writing.",
    summarised: false,
    effect: {
      note: "Answered the payment route first, because that is the thing that stops student socials rather than the price.",
    },
    provenance: ILLUSTRATIVE,
  },

  // Los Irvine Center. A promotion site before it is an account, and
  // the tenant directory is the second reason to be there.
  {
    id: "msg-loscerritos-1",
    prospectId: "los-cerritos-center",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-05T09:40:00-07:00",
    counterpartyRole: "Marketing manager",
    subject: "Centre management enquiry",
    body: "Asked two things of the management office: how specialty leasing sells concourse space by the week, and whether the centre programmes anything around anime or collectibles that a partner could stand inside rather than beside.",
    summarised: false,
    effect: {
      note: "First touch aimed at the promotion site rather than at a party booking.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-loscerritos-2",
    prospectId: "los-cerritos-center",
    direction: "inbound",
    channel: "email",
    at: "2026-09-12T15:30:00-07:00",
    counterpartyRole: "Specialty leasing manager",
    address: "specialty-leasing@demo.invalid",
    subject: "Re: Centre management enquiry",
    body: "Concourse space lets by the week and the fourth quarter goes first, so tell me dates before you tell me anything else. Marketing runs a pop culture weekend in the spring and they take partners for it. What would you actually put on the floor?",
    summarised: false,
    effect: {
      note: "A reply that asks for dates first, which is a leasing desk telling you what it is short of.",
      movedStatusTo: "conversation",
      signals: ["asked-for-a-date"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-loscerritos-3",
    prospectId: "los-cerritos-center",
    direction: "outbound",
    channel: "email",
    at: "2026-09-15T09:10:00-07:00",
    counterpartyRole: "Specialty leasing manager",
    address: "specialty-leasing@demo.invalid",
    subject: "What would go on the floor, and the dates it would need",
    body: "A prize wall and a claw, staffed, with giveaway stock that people leave holding rather than reading. Dates: the pop culture weekend in the spring is the one worth planning properly, and a fourth quarter week is worth having if anything drops out. Also asked for the tenant directory, because half the shops in it already buy the kind of stock this programme would source, and a centre visit that only produces one conversation is a wasted afternoon.",
    summarised: false,
    effect: {
      note: "Answered the dates question and asked for the directory, which is the thing this visit is really worth.",
    },
    provenance: ILLUSTRATIVE,
  },
];

// ---------------------------------------------------------------
// Inbound led
// ---------------------------------------------------------------

/*
  Six organisations whose thread starts with them rather than with this
  desk, and which the outbound plan had not reached.

  This is the group that argues for the inbox existing at all. Every one
  of these arrived through a party enquiry form or a telephone call
  while the outbound plan was pointed at printers and district offices,
  and a board built only from outbound work would have had all six
  sitting at unworked while somebody in the building was waiting for an
  answer. The larger of the two signed bookings on this board is here,
  the other one is a campus that wrote to the quote page, and nothing
  this desk opened cold has signed anything at all. That is worth
  sitting with before planning another week of forms.
*/
const INBOUND_LED: ConversationMessage[] = [
  // Porto's Bakery and Cafe. The largest headcount anybody has named,
  // and it came in on the telephone.
  {
    id: "msg-portos-1",
    prospectId: "porto-s-bakery-and-cafe",
    direction: "inbound",
    channel: "phone",
    at: "2026-09-05T14:30:00-07:00",
    counterpartyRole: "Human resources manager",
    requestId: "req-18",
    body: "Rang about a staff appreciation evening. Production and counter teams together, about 120 people, and it has to be a December weeknight both rotas can make. Asked what it would cost.",
    summarised: true,
    effect: {
      note: "Arrived unprompted with a headcount, a month and a rota constraint attached. The rota is the whole design problem.",
      movedStatusTo: "conversation",
      signals: ["named-a-headcount", "asked-for-a-price"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-portos-2",
    prospectId: "porto-s-bakery-and-cafe",
    direction: "outbound",
    channel: "email",
    at: "2026-09-05T15:00:00-07:00",
    counterpartyRole: "Human resources manager",
    address: "people-team@demo.invalid",
    subject: "December weeknights, and the honest answer on cost",
    body: "Half an hour later, because a caller who has already picked a month is not browsing. Three December weeknights that would take a group that size are listed below in the order I would pick them. On cost, the honest answer rather than the comfortable one: DIME publishes what the All Inclusive Party contains and publishes no price for it, and the page says to contact the venue. So I can tell you today exactly what is included, and the figure has to come from the venue against your headcount and the evening you take.",
    summarised: false,
    effect: {
      note: "Answered a price question with the published contents and a plain statement that the figure is not published, and offered dates in the same breath.",
      offerExtensionId: "offx-portos-package",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-portos-3",
    prospectId: "porto-s-bakery-and-cafe",
    direction: "inbound",
    channel: "email",
    at: "2026-09-12T12:05:00-07:00",
    counterpartyRole: "Human resources manager",
    address: "people-team@demo.invalid",
    subject: "Re: December weeknights, and the honest answer on cost",
    body: "We will take the first one, 11 December. Send the paperwork and tell me what happens if the rota moves on us.",
    summarised: false,
    effect: {
      note: "Took the first date offered, which almost nobody does. The change term is now the live question rather than a footnote.",
      signals: ["asked-for-a-date", "asked-for-it-in-writing"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-portos-4",
    prospectId: "porto-s-bakery-and-cafe",
    direction: "outbound",
    channel: "email",
    at: "2026-09-15T09:30:00-07:00",
    counterpartyRole: "Human resources manager",
    address: "people-team@demo.invalid",
    subject: "Paperwork for 11 December, and what happens if the rota moves",
    body: "If the rota moves: DIME publishes that changes to a booked party need three or more days notice, so that is the term rather than a favour anybody has to ask for, and it is on the face of the paperwork rather than buried in it. Contract attached for 11 December, 120 people. The per head figure on it is one this desk has set and it is labelled as such, because no published price exists to check it against.",
    summarised: false,
    effect: {
      note: "Put the one published booking term where the person who will need it can find it, and labelled the price as this desk's own.",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-portos-5",
    prospectId: "porto-s-bakery-and-cafe",
    direction: "inbound",
    channel: "email",
    at: "2026-09-17T09:00:00-07:00",
    counterpartyRole: "Human resources manager",
    address: "people-team@demo.invalid",
    subject: "Signed, 11 December",
    body: "Signed and the deposit is away. Send me something the teams can put on the noticeboards in both buildings, and if you have anything the shift leads can hand out beforehand, we would take it.",
    summarised: false,
    effect: {
      note: "The largest signed line on the board, and the last sentence is a merchandise request rather than a booking one.",
      movedStatusTo: "booked",
      signals: ["signed"],
    },
    provenance: ILLUSTRATIVE,
  },

  // Premier Workspaces Irvine Tower. Asked for a price, was told the
  // truth, and stopped replying. The most instructive row in the group.
  {
    id: "msg-premier-1",
    prospectId: "premier-workspaces-cerritos-tower",
    direction: "inbound",
    channel: "contact-form",
    at: "2026-09-15T09:15:00-07:00",
    counterpartyRole: "Office manager",
    address: "workspace-office@demo.invalid",
    requestId: "req-23",
    subject: "Party enquiry, submitted",
    body: "Something for the tower members and the front desk team together, about 40 people. What is the price per person?",
    summarised: false,
    effect: {
      note: "An enquiry this desk did nothing to earn, from a building two and a half miles away, opening with the one question that has no published answer.",
      movedStatusTo: "conversation",
      signals: ["named-a-headcount", "asked-for-a-price"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-premier-2",
    prospectId: "premier-workspaces-cerritos-tower",
    direction: "outbound",
    channel: "email",
    at: "2026-09-16T14:00:00-07:00",
    counterpartyRole: "Office manager",
    address: "workspace-office@demo.invalid",
    subject: "There is no published price, and here is everything there is",
    body: "There is no price per person published anywhere, for any package, and I am not going to invent one to keep this conversation comfortable. What is published is what the All Inclusive Party contains, and that is attached in full. A real figure for 40 people comes from the venue against a date, and changes to a booking need three or more days notice once it is made. Give me a weekday evening and I will get you the number.",
    summarised: false,
    effect: {
      note: "Answered the only question they asked with the only honest answer available, which is that the answer is not published.",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-premier-3",
    prospectId: "premier-workspaces-cerritos-tower",
    direction: "outbound",
    channel: "email",
    at: "2026-09-17T14:00:00-07:00",
    counterpartyRole: "Office manager",
    address: "workspace-office@demo.invalid",
    subject: "One date is all this needs",
    body: "One line, because the last message was long. Name any weekday evening and the figure follows within the day.",
    summarised: false,
    effect: {
      note: "Nothing since. An enquiry that opened with price and went quiet when the answer was that no price is published, which is the cost of telling the truth and is recorded rather than smoothed over.",
    },
    provenance: ILLUSTRATIVE,
  },

  // UCI Health Lakewood. The biggest held date on the board, and the
  // furthest away.
  {
    id: "msg-uci-1",
    prospectId: "uci-health-lakewood",
    direction: "inbound",
    channel: "contact-form",
    at: "2026-09-09T09:40:00-07:00",
    counterpartyRole: "Human resources manager",
    address: "people-team@demo.invalid",
    requestId: "req-15",
    subject: "Party enquiry, submitted",
    body: "Staff appreciation for around 280 across clinical and administrative teams, December if possible. We would need something we can put in front of a committee, and an invoice rather than a card on the night.",
    summarised: false,
    effect: {
      note: "The largest headcount on the board, arriving through a form from five miles away with a procurement shape already on it.",
      movedStatusTo: "conversation",
      signals: ["named-a-headcount", "asked-for-it-in-writing"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-uci-2",
    prospectId: "uci-health-lakewood",
    direction: "outbound",
    channel: "email",
    at: "2026-09-09T15:20:00-07:00",
    counterpartyRole: "Human resources manager",
    address: "people-team@demo.invalid",
    subject: "For the committee, and a December date held while it meets",
    body: "Written for a committee rather than for a person. What is included is published and listed. What it costs is not published anywhere and comes from the venue, which is a sentence worth putting in the paper rather than leaving out of it. Changes need three or more days notice. A December weeknight can be held at no cost while the committee meets, and a hold that costs nothing is easier to defend in a room than a discount would be.",
    summarised: false,
    effect: {
      note: "Offered the hold rather than a concession, because a hospital committee cannot approve a concession and can approve a date.",
      offerExtensionId: "offx-uci-package",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-uci-3",
    prospectId: "uci-health-lakewood",
    direction: "inbound",
    channel: "email",
    at: "2026-09-18T11:35:00-07:00",
    counterpartyRole: "Human resources manager",
    address: "people-team@demo.invalid",
    subject: "Re: For the committee, and a December date held while it meets",
    body: "Hold 11 December. Nothing is signed until the committee sits and the invoice route is approved, so please do not treat this as confirmed.",
    summarised: false,
    effect: {
      note: "The largest date on the board, held against no deposit, with the buyer themselves warning us not to count it. Recorded exactly as they said it.",
      movedStatusTo: "soft-hold",
      signals: ["held-a-date"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-uci-4",
    prospectId: "uci-health-lakewood",
    direction: "outbound",
    channel: "email",
    at: "2026-09-18T16:10:00-07:00",
    counterpartyRole: "Human resources manager",
    address: "people-team@demo.invalid",
    subject: "Held, and not counted",
    body: "Held and not counted, which is the same thing this desk tells its own board. One question for the committee paper: does the invoice route need a purchase order raised before the date, because if it does then the date is not the blocker and the paperwork is.",
    summarised: false,
    effect: {
      note: "Asked the question that decides whether this converts, which is a procurement question rather than a sales one.",
    },
    provenance: ILLUSTRATIVE,
  },

  // RailMaster Hobbies. A shop that wants to bring its own regulars,
  // which is co-marketing arriving by accident, and a manager who
  // cannot sign for it.
  {
    id: "msg-railmaster-1",
    prospectId: "railmaster-hobbies",
    direction: "inbound",
    channel: "phone",
    at: "2026-09-10T12:30:00-07:00",
    counterpartyRole: "Store manager",
    body: "Rang the office. Wants a customer appreciation night for the shop's tournament regulars, about 40 people, a Friday in November, and asked whether the shop could hand out its own vouchers on the night.",
    summarised: true,
    effect: {
      note: "A hobby shop offering to bring its own customers. That is the co-marketing conversation this desk has been trying to start on foot.",
      movedStatusTo: "conversation",
      signals: ["named-a-headcount", "asked-for-a-date"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-railmaster-2",
    prospectId: "railmaster-hobbies",
    direction: "outbound",
    channel: "email",
    at: "2026-09-11T09:05:00-07:00",
    counterpartyRole: "Store manager",
    address: "store-manager@demo.invalid",
    subject: "Your regulars, your vouchers, a Friday in November",
    body: "The vouchers are the shop's own and nobody here needs to approve them. What is included in the package is published and attached; the figure is not published and comes from the venue. Worth asking while we are talking: what prize stock does the shop buy for its own tournaments, and in what quantities? A shop that already buys medals and sleeves in small lots is telling a merchandise buyer something useful about this trade area.",
    summarised: false,
    effect: {
      note: "Answered the booking and opened the sourcing question in the same message, because the same person owns both.",
      offerExtensionId: "offx-railmaster-package",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-railmaster-3",
    prospectId: "railmaster-hobbies",
    direction: "outbound",
    channel: "email",
    at: "2026-09-17T08:30:00-07:00",
    counterpartyRole: "Store manager",
    address: "store-manager@demo.invalid",
    subject: "Paperwork for a Friday in November",
    body: "Paperwork attached for the November Friday you named, and the three day change notice is on the face of it rather than buried. Nothing else to sign.",
    summarised: false,
    effect: {
      note: "Second and last outbound touch on this record.",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-railmaster-4",
    prospectId: "railmaster-hobbies",
    direction: "inbound",
    channel: "email",
    at: "2026-09-21T14:20:00-07:00",
    counterpartyRole: "Store manager",
    address: "store-manager@demo.invalid",
    subject: "Re: Paperwork for a Friday in November",
    body: "Cannot sign it myself, the owner does that and he is away until the fourth quarter buying trip is done. It will happen, I just cannot put a date on when he signs. Separately: we buy medals and card sleeves a hundred at a time from two suppliers and both of them are slow in the fourth quarter, so if you find a better one I want to know.",
    summarised: false,
    effect: {
      note: "An enthusiastic buyer who cannot sign, which is the most common way a small retail booking stalls. The sourcing complaint at the end is worth more than the booking.",
      requeue: "decision-off-site",
    },
    provenance: ILLUSTRATIVE,
  },

  // Lakewood Bellflower Elks Lodge No. 888. A committee that meets on a
  // known night, which is a blocker with a date on it.
  {
    id: "msg-elks-1",
    prospectId: "lakewood-bellflower-elks-lodge-no-888",
    direction: "inbound",
    channel: "phone",
    at: "2026-09-16T11:20:00-07:00",
    counterpartyRole: "Programme coordinator",
    body: "Rang after a member mentioned the venue. The lodge runs a December social for about 60, and buys prize and raffle stock for it every year. Decisions are made by a committee that meets on the first Tuesday.",
    summarised: true,
    effect: {
      note: "A repeating social calendar and a repeating prize order, from an organisation that rang us.",
      movedStatusTo: "conversation",
      signals: ["named-a-headcount"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-elks-2",
    prospectId: "lakewood-bellflower-elks-lodge-no-888",
    direction: "outbound",
    channel: "email",
    at: "2026-09-16T15:00:00-07:00",
    counterpartyRole: "Programme coordinator",
    address: "programmes@demo.invalid",
    subject: "For the committee, in one page",
    body: "Written for a committee rather than for a person, because a committee reads one page or none. What is included is published and listed. What it costs is not published and comes from the venue. Changes need three or more days notice, which is the term the committee should know before it votes rather than after.",
    summarised: false,
    effect: {
      note: "Put the one published booking term in front of the people who will actually vote on it.",
      offerExtensionId: "offx-elks-notice",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-elks-3",
    prospectId: "lakewood-bellflower-elks-lodge-no-888",
    direction: "inbound",
    channel: "email",
    at: "2026-09-23T10:10:00-07:00",
    counterpartyRole: "Programme coordinator",
    address: "programmes@demo.invalid",
    subject: "Re: For the committee, in one page",
    body: "Pencil 4 December. The committee votes on the first Tuesday of October and I am not able to commit before that.",
    summarised: false,
    effect: {
      note: "A held date with a vote behind it. This is the healthiest kind of soft hold, because the blocker has a date.",
      movedStatusTo: "soft-hold",
      signals: ["held-a-date"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-elks-4",
    prospectId: "lakewood-bellflower-elks-lodge-no-888",
    direction: "outbound",
    channel: "email",
    at: "2026-09-23T16:00:00-07:00",
    counterpartyRole: "Programme coordinator",
    address: "programmes@demo.invalid",
    subject: "4 December pencilled, and the raffle stock question",
    body: "Pencilled and diarised for the first Tuesday. Separate question while the committee thinks: what does the lodge buy for the raffle, and how far ahead does it order? A group that buys the same stock every December is worth quoting properly once rather than chasing every year.",
    summarised: false,
    effect: {
      note: "Turned a held date into a sourcing question, which is the part of this account that repeats.",
    },
    provenance: ILLUSTRATIVE,
  },

  // GEN Restaurant Group. A head office enquiry that answered itself and
  // then went quiet until October.
  {
    id: "msg-gen-1",
    prospectId: "gen-restaurant-group-inc",
    direction: "inbound",
    channel: "contact-form",
    at: "2026-09-07T13:40:00-07:00",
    counterpartyRole: "Office manager",
    address: "office@demo.invalid",
    subject: "Party enquiry, submitted",
    body: "Head office team, about 45 of us, thinking about a Friday evening. What is involved, and how late can we change it if the calendar moves?",
    summarised: false,
    effect: {
      note: "An enquiry from a listed company's head office two miles away, asking the change question first.",
      movedStatusTo: "conversation",
      signals: ["named-a-headcount", "asked-for-a-price"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-gen-2",
    prospectId: "gen-restaurant-group-inc",
    direction: "outbound",
    channel: "email",
    at: "2026-09-08T09:15:00-07:00",
    counterpartyRole: "Office manager",
    address: "office@demo.invalid",
    subject: "What is involved, and how late you can move it",
    body: "Taking the second question first, because it is the one nobody usually answers: DIME publishes that changes to a booked party need three or more days notice. That is a published term, not a concession, and it will not change on you. On what is involved, the package contents are published and attached. The figure is not published and comes from the venue.",
    summarised: false,
    effect: {
      note: "Answered the change question with the published term, which is the only commitment this desk can make without checking.",
      offerExtensionId: "offx-gen-notice",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-gen-3",
    prospectId: "gen-restaurant-group-inc",
    direction: "inbound",
    channel: "email",
    at: "2026-09-12T16:30:00-07:00",
    counterpartyRole: "Office manager",
    address: "office@demo.invalid",
    subject: "Re: What is involved, and how late you can move it",
    body: "That answers it. We cannot pick a date until the finance calendar is set. Come back to me in October.",
    summarised: false,
    effect: {
      note: "Not a no and not a date. A requeue with a month on it, which is the most useful kind.",
      requeue: "come-back-later",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-gen-4",
    prospectId: "gen-restaurant-group-inc",
    direction: "outbound",
    channel: "email",
    at: "2026-09-19T09:25:00-07:00",
    counterpartyRole: "Office manager",
    address: "office@demo.invalid",
    subject: "Diarised for October",
    body: "Diarised, and one line so October is not a cold start: which week does the finance calendar land? If it is the first, this becomes a Friday in November and if it is the last it becomes January, and those are different conversations.",
    summarised: false,
    effect: {
      note: "Nothing back. A requeue that has been acknowledged is still a requeue.",
    },
    provenance: ILLUSTRATIVE,
  },
];

// ---------------------------------------------------------------
// Schools and colleges, cold
// ---------------------------------------------------------------

/*
  The calendar-locked lane, with the results a school year actually
  produces in September: one campus half a mile away that came to us and
  signed, one absence reply with no return date on it, and one campus
  that has taken two submissions through its own form and said nothing
  at all. Two of the three threads here were opened by this desk and
  neither of those is the one that closed.
*/
const SCHOOLS_COLD: ConversationMessage[] = [
  // Irvine High School. Half a mile away, and they wrote to us.
  {
    id: "msg-cerritoshs-1",
    prospectId: "cerritos-high-school",
    direction: "inbound",
    channel: "contact-form",
    at: "2026-09-08T10:10:00-07:00",
    counterpartyRole: "Campus activities office",
    address: "activities-office@demo.invalid",
    requestId: "req-17",
    subject: "Quote page enquiry, submitted",
    body: "Autumn club and society night, about sixty students, midweek so it sits around the sports calendar. Please send the package contents in writing, because they have to go on the permission slip that goes home with each student.",
    summarised: false,
    effect: {
      note: "The nearest campus on the board wrote to us first, and asked for the one thing that is published in writing rather than for a discount.",
      movedStatusTo: "conversation",
      signals: ["named-a-headcount", "asked-for-a-date", "asked-for-it-in-writing"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-cerritoshs-2",
    prospectId: "cerritos-high-school",
    direction: "outbound",
    channel: "email",
    at: "2026-09-08T11:05:00-07:00",
    counterpartyRole: "Campus activities office",
    address: "activities-office@demo.invalid",
    subject: "Contents for the permission slip, and 20 November",
    body: "Within the hour, because a permission slip has a print deadline behind it. The contents are published and are pasted below in the order they appear on the page, so nothing on your slip is a paraphrase of ours: arcade time-play, bowling with shoe rental, karaoke or a party room, billiards and ping pong, pizza and soda, and a group photo. The VIP Immersive Lane is an add-on at a separate fee and is left off deliberately. No price is published for any of it, so the per head figure in the quote is one this desk has set and it says so on the quote. 20 November is free and midweek.",
    summarised: false,
    effect: {
      note: "Answered inside an hour with published wording rather than a rewrite of it, which is what a permission slip actually needs.",
      offerExtensionId: "offx-cerritoshs-package",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-cerritoshs-3",
    prospectId: "cerritos-high-school",
    direction: "outbound",
    channel: "email",
    at: "2026-09-12T09:00:00-07:00",
    counterpartyRole: "Campus activities office",
    address: "activities-office@demo.invalid",
    subject: "One thing worth knowing before the slips go out",
    body: "One thing before the slips print. Changes to a booking need three or more days notice, which DIME publishes, and a school calendar moves more than most. Building that into the date on the slip now costs nothing and saves a conversation in November.",
    summarised: false,
    effect: {
      note: "Told them the published change term before it could become their problem, which is the cheapest goodwill available on this board.",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-cerritoshs-4",
    prospectId: "cerritos-high-school",
    direction: "inbound",
    channel: "email",
    at: "2026-09-19T14:00:00-07:00",
    counterpartyRole: "Campus activities office",
    address: "activities-office@demo.invalid",
    subject: "Signed, 20 November",
    body: "Signed and the deposit is authorised. Sixty students, 20 November. The society officers have asked whether there is anything they can hand out at the club fair beforehand.",
    summarised: false,
    effect: {
      note: "Signed eleven days after they wrote to us, and the last line is a merchandise question this desk can actually answer.",
      movedStatusTo: "booked",
      signals: ["signed"],
    },
    provenance: ILLUSTRATIVE,
  },

  // La Mirada High School. The school year's own answer to outreach.
  {
    id: "msg-lamiradahs-1",
    prospectId: "la-mirada-high-school",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-09T10:30:00-07:00",
    counterpartyRole: "Activities director",
    subject: "School contact form",
    body: "Submitted through the school's form, which is the only written route published. Asked whether the spring calendar is set and who books the club and team nights.",
    summarised: false,
    effect: {
      note: "First touch through a form rather than an inbox, so it lands in a queue somebody may or may not read.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-lamiradahs-2",
    prospectId: "la-mirada-high-school",
    direction: "inbound",
    channel: "email",
    at: "2026-09-09T10:31:00-07:00",
    counterpartyRole: "Activities director",
    address: "activities-office@demo.invalid",
    subject: "Automatic reply",
    body: "I am off campus with the autumn sports programme and will respond to messages on my return. For urgent student matters please contact the attendance office.",
    summarised: false,
    effect: {
      note: "An absence reply with no return date on it, which is worse than one with a date. Requeued blind for a fortnight.",
      requeue: "out-of-office",
    },
    provenance: ILLUSTRATIVE,
  },

  // Whitney High School. Two submissions, no answer, and a club
  // calendar that is the whole reason to keep trying.
  {
    id: "msg-whitney-1",
    prospectId: "whitney-high-school",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-11T09:20:00-07:00",
    counterpartyRole: "Activities director",
    subject: "School contact form",
    body: "The campus publishes a club list that includes an anime society, which is a more precise audience than most schools can offer. Asked who books club nights and when the calendar closes.",
    summarised: false,
    effect: {
      note: "First touch, aimed at a named club rather than at the school in general.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-whitney-2",
    prospectId: "whitney-high-school",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-21T09:10:00-07:00",
    counterpartyRole: "Activities director",
    subject: "School contact form",
    body: "Second submission through the same form, ten days on. Nothing has come back from the first and the form gives no receipt, so there is no way to tell whether it arrived.",
    summarised: false,
    effect: {
      note: "Two touches into a channel that returns no evidence of delivery. The next one has to be the front counter.",
    },
    provenance: ILLUSTRATIVE,
  },
];

// ---------------------------------------------------------------
// Employers, suppliers and licensors
// ---------------------------------------------------------------

/*
  The corporate lane, which on this board is mostly a sourcing lane.

  Eleven threads, and the interesting half of them are not about an
  evening out at all. They are a decorator quoting a minimum order
  quantity, a patch maker refusing to quote anything with a character on
  it until the licence paperwork appears, a trophy supplier asking what
  volume an event actually consumes, and an importer whose freight lanes
  are the ones a merchandise programme would use. Four of the eleven have
  never replied, and one declined to quote at all, which is what a
  sourcing pass through an industrial trade area really looks like.
*/
const EMPLOYERS: ConversationMessage[] = [
  // French Press Custom Apparel. The most useful supplier conversation
  // on the board, and it is still waiting on a sample pack.
  {
    id: "msg-frenchpress-1",
    prospectId: "french-press-custom-apparel-printing-and-design",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-04T08:50:00-07:00",
    counterpartyRole: "Sales manager",
    subject: "Quote request, decorated apparel",
    body: "Three questions through their form, because a quote that arrives without these is not a quote. What is the minimum order quantity per design, what is the lead time in working days once artwork is approved, and do you handle licensed artwork with a written approval trail?",
    summarised: false,
    effect: {
      note: "First touch written so the reply is usable whatever it says.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-frenchpress-2",
    prospectId: "french-press-custom-apparel-printing-and-design",
    direction: "inbound",
    channel: "email",
    at: "2026-09-08T10:20:00-07:00",
    counterpartyRole: "Sales manager",
    address: "sales@demo.invalid",
    subject: "Re: Quote request, decorated apparel",
    body: "Minimum is 48 pieces per design for screen print and lower for embroidery. Lead time is ten working days from approved artwork, longer from October. We will not print licensed characters without written permission from the licence holder on file, no exceptions. Send sizes, quantities and the artwork and we will price it.",
    summarised: false,
    effect: {
      note: "A real supplier answer: a minimum, a lead time, and a licence rule stated before we asked twice.",
      movedStatusTo: "conversation",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-frenchpress-3",
    prospectId: "french-press-custom-apparel-printing-and-design",
    direction: "outbound",
    channel: "email",
    at: "2026-09-09T09:30:00-07:00",
    counterpartyRole: "Sales manager",
    address: "sales@demo.invalid",
    subject: "Quantity bands, and a sample pack before anything is ordered",
    body: "Quantity bands attached rather than a single number, because a staff run and a prize run are different sizes and both would sit with you. On the licence rule, that is the correct answer and it is the reason this conversation is worth having: nothing goes on a garment here without written approval either. Can you send a sample pack of blanks and stitch quality before anything is committed?",
    summarised: false,
    effect: {
      note: "Agreed with their licence rule in writing, which is cheap here and expensive to retrofit later.",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-frenchpress-4",
    prospectId: "french-press-custom-apparel-printing-and-design",
    direction: "outbound",
    channel: "email",
    at: "2026-09-18T08:45:00-07:00",
    counterpartyRole: "Sales manager",
    address: "sales@demo.invalid",
    subject: "Chasing the sample pack",
    body: "Chasing once. Their own reply said lead times stretch from October, which makes a sample pack in September worth more than one in November.",
    summarised: false,
    effect: {
      note: "Third touch, nothing back on the samples. A supplier who answers fast on questions and slowly on samples is telling you where their capacity is.",
    },
    provenance: ILLUSTRATIVE,
  },

  // netTrophy. Awards and medals, which is what a tournament actually
  // consumes.
  {
    id: "msg-nettrophy-1",
    prospectId: "nettrophy-buena-park-plaque-and-trophy",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-05T09:10:00-07:00",
    counterpartyRole: "Sales manager",
    subject: "Quote request, medals and plaques",
    body: "Asked for minimum order quantity and turnaround on stock medals and on custom dies, kept as two separate questions because they are two different lead times and treating them as one is how a prize order misses a tournament.",
    summarised: false,
    effect: {
      note: "First touch, split into the two questions a prize programme actually has to plan around.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-nettrophy-2",
    prospectId: "nettrophy-buena-park-plaque-and-trophy",
    direction: "inbound",
    channel: "email",
    at: "2026-09-11T13:50:00-07:00",
    counterpartyRole: "Sales manager",
    address: "sales@demo.invalid",
    subject: "Re: Quote request, medals and plaques",
    body: "Stock medals go out in five working days with a low minimum. Custom dies are three weeks the first time and faster after that, and the minimum is higher. What volume per event are you talking about, and is any of the artwork licensed?",
    summarised: false,
    effect: {
      note: "Answered both lead times and then asked the two questions a supplier asks when it is deciding whether to bother.",
      movedStatusTo: "conversation",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-nettrophy-3",
    prospectId: "nettrophy-buena-park-plaque-and-trophy",
    direction: "outbound",
    channel: "email",
    at: "2026-09-15T09:40:00-07:00",
    counterpartyRole: "Sales manager",
    address: "sales@demo.invalid",
    subject: "Volume per event, and what is licensed",
    body: "Volume per event is set by the bracket rather than by a round number, so a tournament of 24 takes three places and a handful of spares, and a season takes that repeatedly. On licensing: nothing licensed goes on a die without written approval from the licence holder, so assume the first run is unlicensed stock and the second is a longer conversation.",
    summarised: false,
    effect: {
      note: "Gave a real volume shape instead of a flattering one, which is the number a supplier will hold a price against.",
    },
    provenance: ILLUSTRATIVE,
  },

  // Patchmade. The supplier who asked for the licence paperwork before
  // anybody asked them to.
  {
    id: "msg-patchmade-1",
    prospectId: "patchmade-llc",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-07T11:15:00-07:00",
    counterpartyRole: "Sales manager",
    subject: "Quote request, embroidered patches",
    body: "Patches and emblems, asked through their form: minimum per design, turnaround, and whether they hold stock shapes that avoid a die charge on a first run.",
    summarised: false,
    effect: {
      note: "First touch, aimed at the cheapest version of a first order rather than at the best one.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-patchmade-2",
    prospectId: "patchmade-llc",
    direction: "inbound",
    channel: "email",
    at: "2026-09-12T09:05:00-07:00",
    counterpartyRole: "Sales manager",
    address: "sales@demo.invalid",
    subject: "Re: Quote request, embroidered patches",
    body: "Minimum is 100 per design. Before we quote anything with a character on it we need the licence paperwork, because we have been caught before. Stock shapes exist and they do avoid the die charge.",
    summarised: false,
    effect: {
      note: "A supplier that polices licensing itself is worth more than a cheaper one that does not.",
      movedStatusTo: "conversation",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-patchmade-3",
    prospectId: "patchmade-llc",
    direction: "outbound",
    channel: "email",
    at: "2026-09-14T10:00:00-07:00",
    counterpartyRole: "Sales manager",
    address: "sales@demo.invalid",
    subject: "Licence paperwork, and stock shapes for the first run",
    body: "You will get the paperwork before you get the artwork, every time. First run would be a stock shape and nothing licensed on it, which keeps the die charge out of a trial order and keeps the licence conversation where it belongs, which is with the licence holder rather than with a printer.",
    summarised: false,
    effect: {
      note: "Agreed the order of operations in writing. This is the supplier most likely to survive a licensed run.",
    },
    provenance: ILLUSTRATIVE,
  },

  // Wismettac Asian Foods. An importer at the front of the supply chain,
  // and a sampling tie-in nobody had asked them for.
  {
    id: "msg-wismettac-1",
    prospectId: "wismettac-asian-foods-inc",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-09T08:40:00-07:00",
    counterpartyRole: "Sales manager",
    subject: "Partnership enquiry",
    body: "An importer three miles from the office is two things at once, and the form asked about both: whether their brands run sampling promotions with venues, and how their import lanes are booked, because the lanes that bring food in are the lanes licensed merchandise moves on.",
    summarised: false,
    effect: {
      note: "First touch into a supply chain rather than into a party diary.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-wismettac-2",
    prospectId: "wismettac-asian-foods-inc",
    direction: "inbound",
    channel: "email",
    at: "2026-09-15T14:30:00-07:00",
    counterpartyRole: "Sales manager",
    address: "sales@demo.invalid",
    subject: "Re: Partnership enquiry",
    body: "Brand promotions are run by our own marketing desk and they do look at venue sampling. Send an outline with volumes and dates and I will pass it across. The import side is a different team and a longer answer.",
    summarised: false,
    effect: {
      note: "A yes to the smaller question and a polite hedge on the bigger one, which is the correct order for a first contact.",
      movedStatusTo: "conversation",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-wismettac-3",
    prospectId: "wismettac-asian-foods-inc",
    direction: "outbound",
    channel: "email",
    at: "2026-09-16T09:20:00-07:00",
    counterpartyRole: "Sales manager",
    address: "sales@demo.invalid",
    subject: "Outline for the marketing desk",
    body: "Outline attached, written for their marketing desk rather than for a buyer. A Japanese food hall trades inside the venue, which is the obvious place a sampling tie-in lands, and a promotion that puts a product in somebody's hand while they are already standing still is worth more than one that puts it on a poster. Volumes and dates in the attachment, deliberately conservative.",
    summarised: false,
    effect: {
      note: "Aimed the outline at the desk that will actually read it, and kept the volumes small enough to be believed.",
    },
    provenance: ILLUSTRATIVE,
  },

  // Yamaha Corporation of America. A staff event enquiry that came back
  // with something better than a staff event.
  {
    id: "msg-yamaha-1",
    prospectId: "yamaha-corporation-of-america",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-08T09:25:00-07:00",
    counterpartyRole: "Office manager",
    subject: "Head office enquiry",
    body: "Two questions through the form. Does the office run a staff event in the fourth quarter, and who buys the branded merchandise for it? A headquarters this close is a group booking and a vendor relationship in the same building.",
    summarised: false,
    effect: {
      note: "First touch that asks the sourcing question as well as the booking one, because both live at the same front desk.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-yamaha-2",
    prospectId: "yamaha-corporation-of-america",
    direction: "inbound",
    channel: "email",
    at: "2026-09-16T11:10:00-07:00",
    counterpartyRole: "Office manager",
    address: "office@demo.invalid",
    subject: "Re: Head office enquiry",
    body: "The staff committee meets in October and I will put you in front of it. Our promotional merchandise goes through a supplier we have used for years, and I am happy to pass your details to our purchasing manager if that is useful.",
    summarised: false,
    effect: {
      note: "The booking is parked until October and an introduction to a working supplier is on offer, which is the more valuable half.",
      movedStatusTo: "conversation",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-yamaha-3",
    prospectId: "yamaha-corporation-of-america",
    direction: "outbound",
    channel: "email",
    at: "2026-09-17T08:15:00-07:00",
    counterpartyRole: "Office manager",
    address: "office@demo.invalid",
    subject: "The October date, and yes to the introduction",
    body: "Yes to the introduction, and thank you for offering it before it was asked for. A supplier that has held a large account for years has capacity, artwork discipline and a delivery record, and all three of those are worth more than a keener quote from somebody untested. On the committee: which week in October, so this is diarised rather than remembered?",
    summarised: false,
    effect: {
      note: "Took the introduction and pinned the committee date, in that order.",
    },
    provenance: ILLUSTRATIVE,
  },

  // Epson America. The form does not reach the desk that owns the thing
  // the form is for.
  {
    id: "msg-epson-1",
    prospectId: "epson-america-inc",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-08T10:50:00-07:00",
    counterpartyRole: "Office manager",
    subject: "Head office enquiry",
    body: "Asked whether the site runs staff events and who plans them.",
    summarised: false,
    effect: {
      note: "First touch through the only published route.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-epson-2",
    prospectId: "epson-america-inc",
    direction: "inbound",
    channel: "email",
    at: "2026-09-12T16:20:00-07:00",
    counterpartyRole: "Office manager",
    address: "office@demo.invalid",
    subject: "Re: Head office enquiry",
    body: "You want workplace services rather than this desk, and their address is not on the site. I would suggest calling the main line and asking for them by name.",
    summarised: false,
    effect: {
      note: "A routing correction that costs a fortnight and is still worth having. The published form does not reach the desk that owns staff events.",
      requeue: "wrong-person",
    },
    provenance: ILLUSTRATIVE,
  },

  // InBody USA. One touch, one chase, nothing back.
  {
    id: "msg-inbody-1",
    prospectId: "inbody-usa",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-11T09:35:00-07:00",
    counterpartyRole: "Office manager",
    subject: "Head office enquiry",
    body: "A US head office under two miles from the Irvine office. Asked about staff events in the fourth quarter and who buys the branded stock for them.",
    summarised: false,
    effect: {
      note: "First touch.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-inbody-2",
    prospectId: "inbody-usa",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-21T09:15:00-07:00",
    counterpartyRole: "Office manager",
    subject: "Head office enquiry",
    body: "Second submission, ten days on, nothing back and no receipt from the form either time.",
    summarised: false,
    effect: {
      note: "Two touches into silence. The building is close enough to walk to, and that is what the next touch should be.",
    },
    provenance: ILLUSTRATIVE,
  },

  // 365 Custom Printing. Two quote requests, no reply.
  {
    id: "msg-365-1",
    prospectId: "365-custom-printing",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-07T14:10:00-07:00",
    counterpartyRole: "Sales manager",
    subject: "Quote request, screen print and sublimation",
    body: "Asked for minimum order quantity, turnaround and whether sublimation is in house or subcontracted, which is the question that decides whether a deadline is theirs or somebody else's.",
    summarised: false,
    effect: {
      note: "First touch.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-365-2",
    prospectId: "365-custom-printing",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-16T08:55:00-07:00",
    counterpartyRole: "Sales manager",
    subject: "Quote request, screen print and sublimation",
    body: "Second request through the same form. A decorator that does not answer a quote request in September will not answer one in November either, which is itself a finding about capacity.",
    summarised: false,
    effect: {
      note: "Two touches, nothing back. Filed as a doorstep call rather than a third form.",
    },
    provenance: ILLUSTRATIVE,
  },

  // Superior Signs and Graphics. In store signage carries the offer, and
  // nobody has answered.
  {
    id: "msg-superior-1",
    prospectId: "superior-signs-and-graphics",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-10T10:05:00-07:00",
    counterpartyRole: "Sales manager",
    subject: "Quote request, banners and window graphics",
    body: "Asked for lead time on banners and window graphics and whether they install as well as print, because a promotion that arrives flat in a box is a promotion nobody hangs.",
    summarised: false,
    effect: {
      note: "First touch.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-superior-2",
    prospectId: "superior-signs-and-graphics",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-22T09:40:00-07:00",
    counterpartyRole: "Sales manager",
    subject: "Quote request, banners and window graphics",
    body: "Second submission. Still nothing, and this is the third sign and print business on this board to take a quote request and return silence.",
    summarised: false,
    effect: {
      note: "Two touches, no reply. The pattern across this cohort is more informative than any single row in it.",
    },
    provenance: ILLUSTRATIVE,
  },

  // Silver Spur Corporation. Packaging, which is the unglamorous end of
  // a merchandise programme and the end that fails first.
  {
    id: "msg-silverspur-1",
    prospectId: "silver-spur-corporation",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-15T09:50:00-07:00",
    counterpartyRole: "Sales manager",
    subject: "Quote request, premium and gift packing",
    body: "Asked what they hold in stock for gift and premium packing and what a pallet quantity looks like, because prize stock that arrives loose costs more in handling than it saved in packaging.",
    summarised: false,
    effect: {
      note: "First touch.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-silverspur-2",
    prospectId: "silver-spur-corporation",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-23T09:05:00-07:00",
    counterpartyRole: "Sales manager",
    subject: "Quote request, premium and gift packing",
    body: "Second submission, a mile and a half from the office. This one deserves a walk rather than a third form.",
    summarised: false,
    effect: {
      note: "Two touches, nothing back, and the shortest drive on the board.",
    },
    provenance: ILLUSTRATIVE,
  },

  // Steven Label Corporation. A plain no, and a useful one.
  {
    id: "msg-stevenlabel-1",
    prospectId: "steven-label-corporation",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-09T11:30:00-07:00",
    counterpartyRole: "Sales manager",
    subject: "Quote request, stickers and decals",
    body: "Asked for their minimum run on printed stickers and decals for a promotional giveaway, and what the artwork deadline looks like against it.",
    summarised: false,
    effect: {
      note: "First touch into a manufacturer rather than a jobbing printer, which is a different size of business.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-stevenlabel-2",
    prospectId: "steven-label-corporation",
    direction: "inbound",
    channel: "email",
    at: "2026-09-16T15:40:00-07:00",
    counterpartyRole: "Sales manager",
    address: "sales@demo.invalid",
    subject: "Re: Quote request, stickers and decals",
    body: "Our minimum run is well above what you have described and we do not take short runs. You want a trade printer rather than a label manufacturer. Good luck with it.",
    summarised: false,
    effect: {
      note: "A clean no from the right kind of business at the wrong scale. Recorded as lost rather than left open, because reopening it would need a campaign ten times the size.",
      movedStatusTo: "lost",
      signals: ["said-no"],
    },
    provenance: ILLUSTRATIVE,
  },
];

// ---------------------------------------------------------------
// The field, walked
// ---------------------------------------------------------------

/*
  The go-sees, which on this board is not a fallback tactic but the
  method the board was built for. None of these organisations publishes
  an email address on this board, so every one of these threads starts
  at a counter with a person who was mid-shift.

  Read the effect notes rather than the bodies. Two of the six produced
  something no form would have: a store manager who rang back with an
  offer, and a shop that named its own tournament audience. Two produced
  the answer this cohort gives most often, which is that promotions are
  decided somewhere else. One produced a plain no.
*/
const FIELD: ConversationMessage[] = [
  // Chalice Collectibles. The nearest thing in this trade area to a
  // prize wall, walked on a mall pass.
  {
    id: "msg-chalice-1",
    prospectId: "chalice-collectibles",
    direction: "outbound",
    channel: "in-person",
    at: "2026-09-08T13:20:00-07:00",
    counterpartyRole: "Store manager",
    body: "Walked the shop on the mall pass. Asked the manager what is moving off the shelves this quarter and what he watches when he buys. He answered both, at length, while restocking a shelf, and the answer was more useful than any category report: the licences that sell here are not the ones that sell nationally.",
    summarised: true,
    effect: {
      note: "First touch, and it was pricing research before it was a sales call.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-chalice-2",
    prospectId: "chalice-collectibles",
    direction: "inbound",
    channel: "phone",
    at: "2026-09-17T13:20:00-07:00",
    counterpartyRole: "Store manager",
    requestId: "req-14",
    body: "Rang back nine days after the visit. Wants a Saturday collector day on 19 December, families included, about 60 through the morning, and asked twice what could be committed towards a prize wall if the shop supplies the entrants.",
    summarised: true,
    effect: {
      note: "A visit that produced a callback with a date, a headcount and a co-marketing proposal on it. The cheapest lead on the board and it cost twenty minutes of standing still.",
      movedStatusTo: "conversation",
      signals: ["named-a-headcount", "asked-for-a-date"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-chalice-3",
    prospectId: "chalice-collectibles",
    direction: "outbound",
    channel: "email",
    at: "2026-09-17T13:55:00-07:00",
    counterpartyRole: "Store manager",
    address: "shop-office@demo.invalid",
    subject: "What can be supplied for the collector day, and what cannot",
    body: "Half an hour after the call, and honest in both directions. What can be supplied: unlicensed prize stock, quantities set to sixty entrants rather than to a round number, delivered the week before rather than on the morning. What cannot: anything carrying a licensed character without written approval from the licence holder, which is a real gate rather than a stalling tactic, and asking twice does not move it. What a Saturday morning includes is published; what it costs is not, and comes from the venue.",
    summarised: false,
    effect: {
      note: "Said no to the licensed half in writing on the day, which is the only way that promise stays credible later.",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-chalice-4",
    prospectId: "chalice-collectibles",
    direction: "outbound",
    channel: "email",
    at: "2026-09-21T10:00:00-07:00",
    counterpartyRole: "Store manager",
    address: "shop-office@demo.invalid",
    subject: "19 December, and what the shop would need from us by when",
    body: "Following up with the only thing that decides whether 19 December is real: prize stock ordered for a December Saturday has to be placed in October, because decorating capacity in this trade area tightens from then and two suppliers have already said so in writing. If the shop wants the prize wall, the decision is an October one rather than a December one.",
    summarised: false,
    effect: {
      note: "Turned a December date into an October decision, using lead times two other suppliers on this board supplied for free.",
    },
    provenance: ILLUSTRATIVE,
  },

  // Hot Topic. The shelves answer the merchandising question and the
  // store cannot answer the promotions one.
  {
    id: "msg-hottopic-1",
    prospectId: "hot-topic",
    direction: "outbound",
    channel: "in-person",
    at: "2026-09-08T13:50:00-07:00",
    counterpartyRole: "Store manager",
    body: "Same mall pass, two doors along. Asked which licences have sold through since the summer and who decides a co-marketing tie-in for this store.",
    summarised: true,
    effect: {
      note: "First touch, and the two questions were deliberately separate because one of them a store manager can answer.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-hottopic-2",
    prospectId: "hot-topic",
    direction: "inbound",
    channel: "in-person",
    at: "2026-09-08T14:05:00-07:00",
    counterpartyRole: "Store manager",
    body: "Answered the first question in detail and named the two properties that have cleared shelves since the summer, both anime. On the second, the promotions calendar is set centrally and a store cannot commit to anything, which she said without apology and without being asked twice.",
    summarised: true,
    effect: {
      note: "A genuine answer to the merchandising question and a hard no to the local one. Both are worth having and only one of them is a lead.",
      movedStatusTo: "conversation",
      requeue: "decision-off-site",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-hottopic-3",
    prospectId: "hot-topic",
    direction: "outbound",
    channel: "email",
    at: "2026-09-15T09:00:00-07:00",
    counterpartyRole: "Store manager",
    address: "store-manager@demo.invalid",
    subject: "The route to the office that decides",
    body: "Thank you for the shelf answer, which was the more useful half. One ask: what is the route to the office that sets the promotions calendar, and does a local proposal ever get put up through a district manager? A tie-in that has to start at head office should start there rather than through a store that cannot say yes.",
    summarised: false,
    effect: {
      note: "Nothing back yet. The record is warm on merchandising and cold on booking, and the board should show both.",
    },
    provenance: ILLUSTRATIVE,
  },

  // POP MART. Everything is decided at the regional office and no local
  // route was offered.
  {
    id: "msg-popmart-1",
    prospectId: "pop-mart",
    direction: "outbound",
    channel: "in-person",
    at: "2026-09-08T14:30:00-07:00",
    counterpartyRole: "Store manager",
    body: "Asked about the blind box lines, how quickly a release clears, and who would decide a joint promotion with a venue nearby.",
    summarised: true,
    effect: {
      note: "First touch, on the same mall pass as the two before it.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-popmart-2",
    prospectId: "pop-mart",
    direction: "inbound",
    channel: "in-person",
    at: "2026-09-08T14:40:00-07:00",
    counterpartyRole: "Store manager",
    body: "Polite and short. Everything is decided at the regional office, no local contact was offered, and no route up was suggested. The shelf question went unanswered because the queue at the till got longer.",
    summarised: true,
    effect: {
      note: "A requeue rather than a rejection, and a weak one because nobody handed over a route. Stays at reached-out, which is what the vocabulary says it is.",
      requeue: "decision-off-site",
    },
    provenance: ILLUSTRATIVE,
  },

  // BoxLunch. The manager was on a break, which is what happens on a
  // Tuesday afternoon.
  {
    id: "msg-boxlunch-1",
    prospectId: "boxlunch",
    direction: "outbound",
    channel: "in-person",
    at: "2026-09-08T15:05:00-07:00",
    counterpartyRole: "Store manager",
    body: "Manager on a break. Left a card with the shift lead and asked when he is usually on the floor, which is the only useful thing to take away from a visit that missed.",
    summarised: true,
    effect: {
      note: "One touch and no conversation. Recorded honestly rather than dressed up as a meeting.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },

  // Krazy Nick's Games. The closest shop on the board and the one that
  // holds the tournament crowd.
  {
    id: "msg-krazynick-1",
    prospectId: "krazy-nick-s-games",
    direction: "outbound",
    channel: "in-person",
    at: "2026-09-09T15:40:00-07:00",
    counterpartyRole: "Store manager",
    body: "Under a mile from the Irvine office, so this was a walk rather than a drive. Asked what nights the tournaments run, how many people come, and what the shop buys for prizes.",
    summarised: true,
    effect: {
      note: "First touch, aimed at the audience rather than at the shop.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-krazynick-2",
    prospectId: "krazy-nick-s-games",
    direction: "inbound",
    channel: "in-person",
    at: "2026-09-09T15:55:00-07:00",
    counterpartyRole: "Store manager",
    body: "Tournaments run on a fixed night with about 24 regulars, and the shop buys prize stock in small lots because a bigger order sits in the stockroom for a year. Asked what a joint night would actually involve and whether the prizes would be ours or theirs.",
    summarised: true,
    effect: {
      note: "A headcount and a purchasing habit in the same two minutes, from the person who decides both.",
      movedStatusTo: "conversation",
      signals: ["named-a-headcount"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-krazynick-3",
    prospectId: "krazy-nick-s-games",
    direction: "outbound",
    channel: "email",
    at: "2026-09-17T09:10:00-07:00",
    counterpartyRole: "Store manager",
    address: "store-manager@demo.invalid",
    subject: "A joint tournament night, and whose prizes",
    body: "Whose prizes: both, and split on purpose. The shop's stock stays the shop's, and the venue side would supply unlicensed prize stock at the bracket sizes you named rather than a pallet you would still be looking at next summer. What is included in an evening is published and attached; the figure is not published and comes from the venue.",
    summarised: false,
    effect: {
      note: "Answered the ownership question first, because that is the one a small shop is actually worried about.",
      offerExtensionId: "offx-krazynick-package",
    },
    provenance: ILLUSTRATIVE,
  },

  // Big Air Trampoline Park. A plain no, given to our face, and the
  // right answer from where they are standing.
  {
    id: "msg-bigair-1",
    prospectId: "big-air-trampoline-park-buena-park",
    direction: "outbound",
    channel: "in-person",
    at: "2026-09-11T11:30:00-07:00",
    counterpartyRole: "General manager",
    body: "Asked whether there is a cross promotion worth running between two venues that sell the same Friday evening to the same families, and what their group programme looks like.",
    summarised: true,
    effect: {
      note: "First touch, and an honest one: this is a competitor before it is a partner.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-bigair-2",
    prospectId: "big-air-trampoline-park-buena-park",
    direction: "inbound",
    channel: "in-person",
    at: "2026-09-11T11:45:00-07:00",
    counterpartyRole: "General manager",
    body: "No, and no hesitation about it. They run their own group and birthday programme and will not point a family at a venue selling the same evening. He was pleasant about it and he was right.",
    summarised: true,
    effect: {
      note: "A plain no from a competitor, recorded rather than left open. The visit still paid for itself in what their prize counter looked like.",
      movedStatusTo: "lost",
      signals: ["said-no"],
    },
    provenance: ILLUSTRATIVE,
  },
];

// ---------------------------------------------------------------
// Local, civic and neighbourhood
// ---------------------------------------------------------------

/*
  Four organisations that are not buyers and are worth more than most of
  the buyers on this board: a library whose youth programme already
  gathers the exact audience a licensed promotion is aimed at, a city
  hall that owns the permit route, a chamber whose membership list is
  half of this file, and a centre whose marketing office is booked out
  until January.

  Three of the four have replied, which is a better rate than anything
  else in this file returns, and only one of the three is a lead this
  quarter. The one that has not replied is the city hall a third of a
  mile from the office, which is the shortest journey on the board and
  the next thing that should be walked rather than filled in.
*/
const LOCAL: ConversationMessage[] = [
  // Irvine Library. A third of a mile away, and the programme already
  // exists.
  {
    id: "msg-cerritoslib-1",
    prospectId: "cerritos-library",
    direction: "outbound",
    channel: "in-person",
    at: "2026-09-14T10:30:00-07:00",
    counterpartyRole: "Programme coordinator",
    body: "Walked over, because it is closer than the car park. Asked how the manga and anime programme runs, how many teenagers it draws and whether partners are ever involved in it.",
    summarised: true,
    effect: {
      note: "First touch, and the shortest journey on the board.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-cerritoslib-2",
    prospectId: "cerritos-library",
    direction: "inbound",
    channel: "in-person",
    at: "2026-09-14T10:50:00-07:00",
    counterpartyRole: "Programme coordinator",
    body: "The teen programme runs monthly and fills. Partners are welcome to supply materials and are not welcome to supply advertising, and she drew that line clearly. Asked whether giveaway stock could be supplied instead of flyers, which nobody usually offers.",
    summarised: true,
    effect: {
      note: "A yes with a condition attached, and the condition is the whole brief: something to keep rather than something to read.",
      movedStatusTo: "conversation",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-cerritoslib-3",
    prospectId: "cerritos-library",
    direction: "outbound",
    channel: "email",
    at: "2026-09-16T08:45:00-07:00",
    counterpartyRole: "Programme coordinator",
    address: "programmes@demo.invalid",
    subject: "Materials rather than advertising",
    body: "Taking your line seriously rather than negotiating it. What could be supplied for a monthly teen session is stock a teenager keeps, sourced at the quantity the session actually draws, with nothing licensed on it unless the licence holder has approved it in writing. If any of that reads as advertising to you, say so and it comes out.",
    summarised: false,
    effect: {
      note: "Accepted their constraint in writing, which costs nothing and is the reason a programme desk lets somebody back in.",
    },
    provenance: ILLUSTRATIVE,
  },

  // City of Irvine City Hall. The permit route, and silence.
  {
    id: "msg-cerritoscity-1",
    prospectId: "city-of-cerritos-city-hall",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-12T11:05:00-07:00",
    counterpartyRole: "Community services manager",
    subject: "Community services enquiry",
    body: "Asked which permits an outdoor activation needs, how far ahead they have to be filed, and whether the city keeps a list of event sponsors. City hall is a third of a mile from the office and it is still a form, because that is what is published.",
    summarised: false,
    effect: {
      note: "First touch. The permit answer is worth having before anything is planned rather than after.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },

  // Norwalk Chamber of Commerce. Not a booking. A directory of half this
  // board, standing in one room.
  {
    id: "msg-norwalkchamber-1",
    prospectId: "norwalk-chamber-of-commerce",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-05T10:20:00-07:00",
    counterpartyRole: "Membership director",
    subject: "Membership enquiry",
    body: "Asked when the monthly mixer runs, what membership includes and whether the member directory is available to members, because the directory is the reason to join and the mixer is the reason to turn up.",
    summarised: false,
    effect: {
      note: "First touch, aimed at the introductions rather than at an event booking.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-norwalkchamber-2",
    prospectId: "norwalk-chamber-of-commerce",
    direction: "inbound",
    channel: "email",
    at: "2026-09-09T12:40:00-07:00",
    counterpartyRole: "Membership director",
    address: "membership@demo.invalid",
    subject: "Re: Membership enquiry",
    body: "Mixer is the third Thursday and visitors are welcome once. The directory comes with membership. If you want to be remembered, put something into the raffle: members notice who supplies the prizes and nobody remembers who gave a talk.",
    summarised: false,
    effect: {
      note: "An invitation and a piece of advice worth more than the invitation. The raffle is a merchandise ask rather than a sponsorship one.",
      movedStatusTo: "conversation",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-norwalkchamber-3",
    prospectId: "norwalk-chamber-of-commerce",
    direction: "outbound",
    channel: "in-person",
    at: "2026-09-18T18:30:00-07:00",
    counterpartyRole: "Membership director",
    body: "Went to the mixer. Met a sign shop, a garment decorator and a caterer, all members, and two of the three are already rows on this board that have never answered a form. Took the raffle ask away to price properly rather than promising stock in a room.",
    summarised: true,
    effect: {
      note: "One evening produced three supplier conversations that four separate forms had not. That is the argument for the chamber row existing at all.",
    },
    provenance: ILLUSTRATIVE,
  },

  // The Source OC. Booked out until January, which is a real answer.
  {
    id: "msg-sourceoc-1",
    prospectId: "the-source-oc",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-14T09:15:00-07:00",
    counterpartyRole: "Marketing manager",
    subject: "Centre marketing enquiry",
    body: "Asked about concourse space and about the centre's Korean pop culture programming, because a centre built around that audience is a promotion site rather than a shopping list.",
    summarised: false,
    effect: {
      note: "First touch, aimed at the marketing office rather than at leasing.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-sourceoc-2",
    prospectId: "the-source-oc",
    direction: "inbound",
    channel: "email",
    at: "2026-09-19T16:50:00-07:00",
    counterpartyRole: "Marketing manager",
    address: "marketing@demo.invalid",
    subject: "Re: Centre marketing enquiry",
    body: "The calendar is full through the holiday season and I am not able to look at anything new until January. Send it again then and I will read it properly.",
    summarised: false,
    effect: {
      note: "A requeue with a month on it from somebody who read the message. Better than most replies on this board and it is still not a lead this quarter.",
      requeue: "come-back-later",
    },
    provenance: ILLUSTRATIVE,
  },
];

// ---------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------

/**
 * Every message, oldest first.
 *
 * Sorted here rather than trusted to the order they were typed in. A
 * timeline that is out of order by one row is a timeline nobody can
 * trust, and the groups above are written by theme rather than by date
 * because that is how they stay readable.
 */
export const CONVERSATIONS: ConversationMessage[] = [
  ...WORKED,
  ...INBOUND_LED,
  ...SCHOOLS_COLD,
  ...EMPLOYERS,
  ...FIELD,
  ...LOCAL,
].sort((a, b) => Date.parse(a.at) - Date.parse(b.at));

export const MESSAGE_BY_ID: Record<string, ConversationMessage> =
  Object.fromEntries(CONVERSATIONS.map((m) => [m.id, m]));

/**
 * The thread for each organisation, oldest first.
 *
 * Built once at module load rather than filtered per render. At a
 * hundred and nine organisations either would be fine; the reason to
 * build the index is that the record selector is called for every row of
 * a list and a filter inside it turns a list render into a quadratic
 * one.
 */
export const MESSAGES_BY_PROSPECT: Record<string, ConversationMessage[]> =
  CONVERSATIONS.reduce<Record<string, ConversationMessage[]>>((acc, m) => {
    (acc[m.prospectId] ??= []).push(m);
    return acc;
  }, {});

/** Organisations with any history at all. The rest have none, honestly. */
export const CONVERSED_PROSPECT_IDS: string[] = Object.keys(
  MESSAGES_BY_PROSPECT,
).sort();

/**
 * WHAT WAS PUT ON THE TABLE, TO WHOM, AND WHETHER IT STILL STANDS.
 *
 * Every row points at an id in OFFERS, and there are only two things in
 * that catalogue to point at, because DIME publishes exactly two
 * things a person on a telephone can commit to without asking anybody:
 * what the All Inclusive Party contains, and that changes to a booking
 * need three or more days notice. Neither costs the venue anything,
 * because neither concedes anything. There is no discount here and there
 * could not be, since there is no published price to discount.
 *
 * Note how many say "open". An offer nobody answered is not a soft yes;
 * it is a thing this desk gave away for free and has not been paid for
 * in either attention or a date, and it should read as pressure on the
 * next follow-up rather than as progress.
 */
export const OFFER_EXTENSIONS: OfferExtension[] = [
  {
    id: "offx-nlmusd-package",
    prospectId: "norwalk-la-mirada-unified-school-district",
    offerId: "all-inclusive-party",
    messageId: "msg-nlmusd-3",
    extendedAt: "2026-09-12T08:50:00-07:00",
    toRole: "Purchasing and contracts officer",
    state: "accepted",
    stateNote:
      "Taken. 18 December is held against no deposit while board approval of the vendor registration runs, and a district that cannot sign until its own board sits is a blocker with a calendar rather than a stall.",
    expiresAt: "2026-10-12T08:00:00-07:00",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "offx-abcusd-package",
    prospectId: "abc-unified-school-district",
    offerId: "all-inclusive-party",
    messageId: "msg-abcusd-3",
    extendedAt: "2026-09-17T08:35:00-07:00",
    toRole: "Community relations office",
    state: "open",
    stateNote:
      "Put in front of a district that reviews what is printed rather than what is charged. Open, and the review is the gate rather than the contents.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "offx-cerritos-college-package",
    prospectId: "cerritos-college",
    offerId: "all-inclusive-party",
    messageId: "msg-cerritos-college-3",
    extendedAt: "2026-09-10T09:00:00-07:00",
    toRole: "Student activities manager",
    state: "open",
    stateNote:
      "Open for a fortnight while the student advisor is the one who has to read it. The prize supply half of that message is the part they asked for; the package half is the part this desk offered.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "offx-portos-package",
    prospectId: "porto-s-bakery-and-cafe",
    offerId: "all-inclusive-party",
    messageId: "msg-portos-2",
    extendedAt: "2026-09-05T15:00:00-07:00",
    toRole: "Human resources manager",
    state: "accepted",
    stateNote:
      "Taken within a week and signed for 11 December. Quoting the published contents half an hour after the call did more here than any concession would have.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "offx-cerritoshs-package",
    prospectId: "cerritos-high-school",
    offerId: "all-inclusive-party",
    messageId: "msg-cerritoshs-2",
    extendedAt: "2026-09-08T11:05:00-07:00",
    toRole: "Campus activities office",
    state: "accepted",
    stateNote:
      "Taken and signed for 20 November. What was extended was the published wording itself, because a permission slip needs the venue's own sentences rather than a rewrite of them.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "offx-uci-package",
    prospectId: "uci-health-lakewood",
    offerId: "all-inclusive-party",
    messageId: "msg-uci-2",
    extendedAt: "2026-09-09T15:20:00-07:00",
    toRole: "Human resources manager",
    state: "accepted",
    stateNote:
      "Taken, and 11 December is held against no deposit while a committee sits and an invoice route is approved. The largest headcount on the board resting on the weakest kind of commitment.",
    expiresAt: "2026-10-09T15:00:00-07:00",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "offx-railmaster-package",
    prospectId: "railmaster-hobbies",
    offerId: "all-inclusive-party",
    messageId: "msg-railmaster-2",
    extendedAt: "2026-09-11T09:05:00-07:00",
    toRole: "Store manager",
    state: "open",
    stateNote:
      "Open, and open with a person who wants it and cannot sign it. The owner is away until the fourth quarter buying trip is done, which is a date nobody here controls.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "offx-gen-notice",
    prospectId: "gen-restaurant-group-inc",
    offerId: "change-notice-three-days",
    messageId: "msg-gen-2",
    extendedAt: "2026-09-08T09:15:00-07:00",
    toRole: "Office manager",
    state: "accepted",
    stateNote:
      "Accepted as an answer rather than as a concession, which is the honest way to describe a published term. It settled the question and it did not produce a date.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "offx-elks-notice",
    prospectId: "lakewood-bellflower-elks-lodge-no-888",
    offerId: "change-notice-three-days",
    messageId: "msg-elks-2",
    extendedAt: "2026-09-16T15:00:00-07:00",
    toRole: "Programme coordinator",
    state: "open",
    stateNote:
      "In front of a committee that votes on the first Tuesday of October. Open until they meet, and there is nothing to chase in the meantime.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "offx-krazynick-package",
    prospectId: "krazy-nick-s-games",
    offerId: "all-inclusive-party",
    messageId: "msg-krazynick-3",
    extendedAt: "2026-09-17T09:10:00-07:00",
    toRole: "Store manager",
    state: "open",
    stateNote:
      "Offered to the shop nearest the office and unanswered since. A shop with two dozen regulars on a fixed night is worth another visit rather than another email.",
    provenance: ILLUSTRATIVE,
  },
];

export const OFFER_EXTENSIONS_BY_PROSPECT: Record<string, OfferExtension[]> =
  OFFER_EXTENSIONS.reduce<Record<string, OfferExtension[]>>((acc, o) => {
    (acc[o.prospectId] ??= []).push(o);
    return acc;
  }, {});

export const OFFER_EXTENSION_BY_ID: Record<string, OfferExtension> =
  Object.fromEntries(OFFER_EXTENSIONS.map((o) => [o.id, o]));
