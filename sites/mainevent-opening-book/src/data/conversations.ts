import type {
  ConversationMessage,
  OfferExtension,
} from "@/domain/types";

/**
 * THE THREADS. What was actually said, to whom, and what it changed.
 *
 * WHY THIS FILE EXISTS. Everything else in this application could tell
 * you where two hundred and eleven organisations stand. None of it could
 * tell you what any of them said. A status chip that reads "In conversation"
 * with nothing behind it is a rep's memory written down badly, and the
 * first question anybody asks when they open a record is not "what stage
 * is this", it is "what did they say, and when".
 *
 * So this is the message history: both directions, threaded per
 * organisation, with the channel on every row, because "we emailed twice
 * and then stood in their reception" and "we emailed four times" produce
 * the same touch count and describe completely different situations.
 *
 * SIXTY OF THE TWO HUNDRED AND ELEVEN HAVE A THREAD. The other hundred
 * and fifty-one have nothing at all, and that is the honest shape of a
 * trade area three and a half weeks into being worked by one person: a
 * hundred and fifty-six messages, a hundred and four of them outbound,
 * fifty-two back. Every screen that reads this file has to survive an
 * organisation with no history, because a hundred and fifty-one of them
 * have none.
 *
 * THIS IS NOT A FLATTERING PIPELINE, AND THAT IS THE ENTIRE POINT.
 *
 * Count what is in here before reading any of it. There are more silent
 * threads than warm ones. There are automatic absence replies from
 * school offices, store managers who wanted the night and could not
 * approve it, an athletics director who books athletics and nothing
 * else, a brokerage that signed with a hotel in July, and one college
 * whose own written enquiry sat unanswered for nineteen days while this
 * desk cold-emailed them about something else. Most published pipelines
 * are a wall of interested parties, which is how a pipeline stops being
 * a decision tool and becomes a mood board. The failures are the rows
 * that teach a reader anything.
 *
 * OUT OF OFFICE AND WRONG PERSON ARE REQUEUES, NOT REJECTIONS. Instantly
 * ships both as first class lead statuses and both mean try again,
 * differently. They matter more here than in most territories: a school
 * front office is genuinely dark for a fortnight at a time, and at a
 * chain the person you can reach is very often not the person who can
 * sign. A tool that filed either as a no would delete live records.
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
 * NO PRICE IS QUOTED THAT MAIN EVENT DOES NOT PUBLISH. Where a
 * counterparty asks what it costs, and eight of them do, the answer in
 * the thread is the true one: the corporate packages carry no published
 * price, the published figures are the ones on the self-serve pages, and
 * the food floor of fourteen dollars per person is the only per-head
 * number on the site. There is no discount off a secret anywhere in this
 * file.
 *
 * THE INBOUND ENQUIRIES ALREADY IN data/requests.ts APPEAR HERE ONCE,
 * carrying their request id. They are the same event seen from two
 * angles: the request row owns the response clock and the qualifying
 * fields, the message owns the words and the thread position. Anything
 * that counts both without checking `requestId` will double them, which
 * is why the field exists.
 */

const ILLUSTRATIVE = "illustrative" as const;

// ---------------------------------------------------------------
// The worked records
// ---------------------------------------------------------------

/**
 * The sixteen organisations that were already somewhere other than
 * unworked, now with the conversation that put them there.
 *
 * These threads were written to agree with three files that already
 * existed: the status rows in data/prospectStatus.ts, the replies in
 * data/book.ts, and the inbound enquiries in data/requests.ts. Where a
 * date, a headcount or a sentence appears in one of those, it appears
 * here unchanged. A history that contradicted the board it belongs to
 * would be worse than no history.
 */
const WORKED: ConversationMessage[] = [
  // Brea Olinda High School. The anchor record, and the one held date
  // that exists because a class graduates whether anyone calls or not.
  {
    id: "msg-boh-1",
    prospectId: "brea-olinda-high-school",
    direction: "outbound",
    channel: "email",
    at: "2026-09-02T09:10:00-07:00",
    counterpartyRole: "Assistant Principal for Activities and Athletics",
    address: "activities-office@demo.invalid",
    subject: "June grad night, and holding a date before there is a calendar",
    body: "Main Event is opening on West Birch Street, about a mile from campus. No opening date has been published yet, which is the honest starting point for this conversation. What I can do now is hold a June date at no cost while the calendar is empty, and put the supervision and lane arrangements in writing for the district. Is the grad night committee meeting this term?",
    summarised: false,
    effect: {
      note: "Opened the thread and set the expectation that there is no opening date to promise against.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-boh-2",
    prospectId: "brea-olinda-high-school",
    direction: "outbound",
    channel: "email",
    at: "2026-09-09T08:40:00-07:00",
    counterpartyRole: "Assistant Principal for Activities and Athletics",
    address: "activities-office@demo.invalid",
    subject: "Re: June grad night, and holding a date before there is a calendar",
    body: "Following up once. If June is already committed elsewhere, the athletics banquets are the more useful conversation and I would rather have that one than keep writing about grad night.",
    summarised: false,
    effect: {
      note: "Nothing back after a week. Second and last written touch before this one becomes a visit.",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-boh-3",
    prospectId: "brea-olinda-high-school",
    direction: "inbound",
    channel: "email",
    at: "2026-09-16T15:20:00-07:00",
    counterpartyRole: "Assistant Principal for Activities and Athletics",
    address: "activities-office@demo.invalid",
    subject: "Re: June grad night, and holding a date before there is a calendar",
    body: "Roughly 380 seniors. What would a June date cost us, and can you tell me the building will definitely be open by then? Quote the athletics banquets separately, they come out of a different budget.",
    summarised: false,
    effect: {
      note: "The record moved on their terms. Three separate buying questions in four lines.",
      movedStatusTo: "conversation",
      signals: ["named-a-headcount", "asked-for-a-price", "asked-for-a-date"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-boh-4",
    prospectId: "brea-olinda-high-school",
    direction: "outbound",
    channel: "email",
    at: "2026-09-17T09:05:00-07:00",
    counterpartyRole: "Assistant Principal for Activities and Athletics",
    address: "activities-office@demo.invalid",
    subject: "380 seniors in June, and what I can and cannot promise",
    body: "I cannot tell you the building will definitely be open in June, because no opening date has been published and I am not going to invent one. What I can do is hold 12 June at no cost, with the hold releasing itself if the opening lands wrong, so the committee is not carrying any risk for saying yes early. On price: Main Event publishes no group price, so a real number needs your headcount and the day part, and I will put it in writing rather than say it on a call. Athletics banquets quoted separately as asked.",
    summarised: false,
    effect: {
      note: "Answered the opening date question with a no, and put the hold on the table in its place.",
      offerExtensionId: "offx-boh-first-fifty",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-boh-5",
    prospectId: "brea-olinda-high-school",
    direction: "outbound",
    channel: "phone",
    at: "2026-09-22T11:30:00-07:00",
    counterpartyRole: "Assistant Principal for Activities and Athletics",
    body: "Called to confirm the hold. She took 12 June, said the committee will not sign anything until an opening date is published, and asked for the supervision terms in writing so the district office can see them before the November board meeting.",
    summarised: true,
    effect: {
      note: "A date is held and nothing is signed. The written supervision terms are now the only thing between this and a contract.",
      movedStatusTo: "soft-hold",
      signals: ["held-a-date", "asked-for-it-in-writing"],
    },
    provenance: ILLUSTRATIVE,
  },

  // Brea Olinda Unified School District. A fortnight lost to a closed
  // office, which is the single most common failure mode in this lane.
  {
    id: "msg-bousd-1",
    prospectId: "brea-olinda-unified-school-district",
    direction: "outbound",
    channel: "email",
    at: "2026-09-03T08:20:00-07:00",
    counterpartyRole: "Executive Assistant, HR Certificated",
    address: "hr-certificated@demo.invalid",
    subject: "Staff appreciation week, and the back to school kickoff",
    body: "The district plans classified staff appreciation and the certificated welcome-back centrally, which is why I am writing to you rather than to each school. A new venue opens on West Birch Street this year. I would like ten minutes to understand how far ahead those two events are budgeted.",
    summarised: false,
    effect: {
      note: "First touch, aimed at the office that plans both events rather than at a campus.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-bousd-2",
    prospectId: "brea-olinda-unified-school-district",
    direction: "inbound",
    channel: "email",
    at: "2026-09-03T08:21:00-07:00",
    counterpartyRole: "Executive Assistant, HR Certificated",
    address: "hr-certificated@demo.invalid",
    subject: "Automatic reply: out of the office",
    body: "The district office is closed to visitors for professional development week. Email will be read from 14 September. For urgent matters contact the main switchboard.",
    summarised: false,
    effect: {
      note: "Nobody has read the first email. Requeued for the day the office reopens rather than chased.",
      requeue: "out-of-office",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-bousd-3",
    prospectId: "brea-olinda-unified-school-district",
    direction: "outbound",
    channel: "email",
    at: "2026-09-15T08:15:00-07:00",
    counterpartyRole: "Executive Assistant, HR Certificated",
    address: "hr-certificated@demo.invalid",
    subject: "Staff appreciation week, and the back to school kickoff",
    body: "Resending now the office is back. Same question: how far ahead are staff appreciation and the welcome-back event budgeted, and who signs them off?",
    summarised: false,
    effect: {
      note: "Second touch, sent on the day the absence reply named. Eleven days of the calendar spent waiting.",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-bousd-4",
    prospectId: "brea-olinda-unified-school-district",
    direction: "inbound",
    channel: "email",
    at: "2026-09-18T13:40:00-07:00",
    counterpartyRole: "Executive Assistant, HR Certificated",
    address: "hr-certificated@demo.invalid",
    subject: "Re: Staff appreciation week, and the back to school kickoff",
    body: "Appreciation week is April and it is budgeted in the spring cycle. We would be looking at about 120 classified staff, almost certainly across two sittings because the schools cannot all release people on the same afternoon. Everything goes on a purchase order and you would need to be set up as a vendor first. What does it cost per person?",
    summarised: false,
    effect: {
      note: "A live conversation with a real constraint attached. The vendor paperwork is now on the critical path, not the price.",
      movedStatusTo: "conversation",
      signals: ["named-a-headcount", "asked-for-a-price"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-bousd-5",
    prospectId: "brea-olinda-unified-school-district",
    direction: "outbound",
    channel: "email",
    at: "2026-09-18T16:05:00-07:00",
    counterpartyRole: "Executive Assistant, HR Certificated",
    address: "hr-certificated@demo.invalid",
    subject: "Two sittings in April, and the vendor paperwork",
    body: "Two sittings suits both of us. Main Event publishes no group price, so I will not put a per-head figure in an email and then change it; what I can do is agree a weekday daytime rate now and honour it for a year, which is the only way to give you a number you can take into the spring budget cycle. Send me whatever the vendor pack needs and I will start it this week rather than in March.",
    summarised: false,
    effect: {
      note: "Rate lock offered so the school can budget against something. Vendor paperwork started six months early on purpose.",
      offerExtensionId: "offx-bousd-midweek",
    },
    provenance: ILLUSTRATIVE,
  },

  // Cal State Fullerton. The written enquiry arrived after the thread
  // had already started, which is why the record has two openings.
  {
    id: "msg-csuf-1",
    prospectId: "california-state-university-fullerton",
    direction: "outbound",
    channel: "email",
    at: "2026-09-08T10:30:00-07:00",
    counterpartyRole: "Student Life and Leadership Coordinator",
    address: "student-life@demo.invalid",
    subject: "Somewhere to put 200 students that is not a campus room",
    body: "Recognised student organisations, greek life and the athletics banquets all need somewhere off campus that can absorb a large group at once. A new venue opens three miles from campus this year. Worth ten minutes?",
    summarised: false,
    effect: {
      note: "First touch into the office that owns student org events.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-csuf-2",
    prospectId: "california-state-university-fullerton",
    direction: "inbound",
    channel: "email",
    at: "2026-09-19T09:50:00-07:00",
    counterpartyRole: "Student Life and Leadership Coordinator",
    address: "student-life@demo.invalid",
    subject: "Re: Somewhere to put 200 students that is not a campus room",
    body: "Send me something in writing I can put in front of the committee. We cannot pay on a card on the night, it has to be invoiced to the university, and that trips up most venues before we get anywhere near a date.",
    summarised: false,
    effect: {
      note: "A reply that is a real signal and a smaller one than it looks. The invoicing constraint is the thing to solve.",
      movedStatusTo: "conversation",
      signals: ["asked-for-it-in-writing"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-csuf-3",
    prospectId: "california-state-university-fullerton",
    direction: "outbound",
    channel: "email",
    at: "2026-09-19T14:10:00-07:00",
    counterpartyRole: "Student Life and Leadership Coordinator",
    address: "student-life@demo.invalid",
    subject: "One page for the committee",
    body: "Attached in the body rather than as a file so nobody has to open anything. Invoicing the university is normal and I will confirm the terms in writing before anything is held. Two hundred students is a lane count I can show you rather than assert, and I would rather agree a date first and let the paperwork follow it.",
    summarised: false,
    effect: {
      note: "Written summary sent the same day it was asked for, which is the whole of the follow-up in a committee-driven sale.",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-csuf-4",
    prospectId: "california-state-university-fullerton",
    direction: "inbound",
    channel: "contact-form",
    at: "2026-09-21T09:05:00-07:00",
    counterpartyRole: "Student life programme coordinator",
    address: "student-life@demo.invalid",
    subject: "Brand events form, submitted",
    body: "Planning a welcome week social for recognised student organisations. Budget is per head and modest. We would need an invoice to the university rather than a card on the night.",
    summarised: false,
    requestId: "req-07",
    effect: {
      note: "The same office came in again through the brand's own form with a date and a headcount attached. The written enquiry, not the email thread, is what carried the numbers.",
      signals: ["asked-for-a-date", "named-a-headcount"],
    },
    provenance: ILLUSTRATIVE,
  },

  // Fullerton College. Read this thread in order. It is the worst two
  // rows in the file and they are both true.
  {
    id: "msg-fc-1",
    prospectId: "fullerton-college",
    direction: "inbound",
    channel: "contact-form",
    at: "2026-09-04T14:00:00-07:00",
    counterpartyRole: "Student activities coordinator",
    address: "student-activities@demo.invalid",
    subject: "Brea enquiry form, submitted",
    body: "Asked whether the new Brea location would work for student club events and whether there was anyone to talk to about a standing arrangement across the year.",
    summarised: false,
    requestId: "req-24",
    effect: {
      note: "Nobody replied. Nineteen days later nobody has replied. This is the most valuable row on the board and no stored task list would ever have shown it to anybody.",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-fc-2",
    prospectId: "fullerton-college",
    direction: "outbound",
    channel: "email",
    at: "2026-09-19T11:20:00-07:00",
    counterpartyRole: "Student Activities and Commencement Coordinator",
    address: "student-activities@demo.invalid",
    subject: "Commencement and end of year, from a venue about to open",
    body: "Fullerton College's commencement office is published and most of your students commute through Brea, so an off-campus celebration is a shorter trip than it looks. A new venue opens on West Birch Street this year and the calendar is still empty.",
    summarised: false,
    effect: {
      note: "Cold outreach sent to the same organisation whose own written enquiry has been sitting unanswered for a fortnight. The two halves of this desk were not talking to each other, and the thread is the only place that shows it.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },

  // Brea Junior High. One email, one correction, and a better door.
  {
    id: "msg-bjh-1",
    prospectId: "brea-junior-high-school",
    direction: "outbound",
    channel: "email",
    at: "2026-09-11T09:00:00-07:00",
    counterpartyRole: "Athletics Director",
    address: "athletics@demo.invalid",
    subject: "End of season, and the three other programmes that also finish",
    body: "Your own staff directory lists instrumental music, choir and dance alongside athletics, and all four finish their year within a few weeks of each other. A venue opening on West Birch Street can take all four separately or all four at once. Which of those do you actually book?",
    summarised: false,
    effect: {
      note: "First touch, deliberately asking who books rather than assuming.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-bjh-2",
    prospectId: "brea-junior-high-school",
    direction: "inbound",
    channel: "email",
    at: "2026-09-14T07:45:00-07:00",
    counterpartyRole: "Athletics Director",
    address: "athletics@demo.invalid",
    subject: "Re: End of season, and the three other programmes that also finish",
    body: "I only book athletics. Music and dance run their own nights and the front office handles anything that needs a purchase order. Try there.",
    summarised: false,
    effect: {
      note: "Cost one email and bought the name of the door that actually opens. Requeued to the front office rather than closed.",
      requeue: "wrong-person",
    },
    provenance: ILLUSTRATIVE,
  },

  // Troy High School. Ten days of silence, ended by them.
  {
    id: "msg-troy-1",
    prospectId: "troy-high-school",
    direction: "outbound",
    channel: "email",
    at: "2026-09-12T10:05:00-07:00",
    counterpartyRole: "Activities Director and ASB Advisor",
    address: "activities-office@demo.invalid",
    subject: "Cohort nights rather than one campus-wide dance",
    body: "Troy Tech, IB and academic decathlon each want their own celebration, which is a different shape of booking from one big dance. A venue opening in Brea can take a cohort of forty as easily as a class of four hundred. Is the grad night committee looking at venues yet?",
    summarised: false,
    effect: {
      note: "First touch to the published activities address.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-troy-2",
    prospectId: "troy-high-school",
    direction: "inbound",
    channel: "contact-form",
    at: "2026-09-22T16:20:00-07:00",
    counterpartyRole: "Assistant Principal for Activities",
    address: "activities-office@demo.invalid",
    subject: "Brand events form, submitted",
    body: "Grad night committee is comparing venues for June. We would need the whole group in one place and supervision arrangements in writing for the district.",
    summarised: false,
    requestId: "req-04",
    effect: {
      note: "The silence broke on their side, through a form rather than as a reply, and it arrived with a date, a headcount and a condition. Still unanswered.",
      movedStatusTo: "conversation",
      signals: ["asked-for-a-date", "named-a-headcount", "asked-for-it-in-writing"],
    },
    provenance: ILLUSTRATIVE,
  },

  // Heights Christian. The one thread that ends in a signature, and it
  // ends there on a price Main Event publishes.
  {
    id: "msg-heights-1",
    prospectId: "heights-christian-schools-brea-campus",
    direction: "outbound",
    channel: "email",
    at: "2026-08-31T09:30:00-07:00",
    counterpartyRole: "Campus Office Manager",
    address: "campus-office@demo.invalid",
    subject: "A fundraiser that does not need the building to be open",
    body: "Main Event publishes a voucher programme a school can resell at whatever price it likes and keep the margin. It costs the school nothing up front and it works on a redemption window rather than a party date, which matters because no opening date has been published yet.",
    summarised: false,
    effect: {
      note: "Opened on the one product that survives having no opening date.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-heights-2",
    prospectId: "heights-christian-schools-brea-campus",
    direction: "inbound",
    channel: "email",
    at: "2026-09-05T11:10:00-07:00",
    counterpartyRole: "Director of Advancement",
    address: "advancement-office@demo.invalid",
    subject: "Re: A fundraiser that does not need the building to be open",
    body: "Passing this to me, I run the fundraising calendar. What does a block of sixty cost us and what do we have to commit to?",
    summarised: false,
    effect: {
      note: "Routed internally to the person who owns the money, which is the good kind of wrong person.",
      movedStatusTo: "conversation",
      signals: ["named-a-headcount", "asked-for-a-price"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-heights-3",
    prospectId: "heights-christian-schools-brea-campus",
    direction: "outbound",
    channel: "email",
    at: "2026-09-06T08:50:00-07:00",
    counterpartyRole: "Director of Advancement",
    address: "advancement-office@demo.invalid",
    subject: "Sixty vouchers at the published price",
    body: "Play It Forward is 19.95 per voucher and that figure is published on Main Event's own site, so you can check it rather than take my word for it. Redemption is Monday to Thursday and Friday before 5pm. I can also date a Spirit Night for the opening quarter on the published 20 per cent terms if you would rather run a night than sell a block.",
    summarised: false,
    effect: {
      note: "Quoted on a published number and put the alternative fundraiser beside it.",
      offerExtensionId: "offx-heights-spirit",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-heights-4",
    prospectId: "heights-christian-schools-brea-campus",
    direction: "inbound",
    channel: "contact-form",
    at: "2026-09-08T10:10:00-07:00",
    counterpartyRole: "Director of Advancement",
    address: "advancement-office@demo.invalid",
    subject: "Quote page enquiry, submitted",
    body: "Came back on the voucher quote and asked whether the school could resell them at its own price. Confirmed the redemption window works around the school calendar.",
    summarised: false,
    requestId: "req-17",
    effect: {
      note: "The last question before a signature, and it is about margin rather than price.",
      signals: ["asked-for-a-date"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-heights-5",
    prospectId: "heights-christian-schools-brea-campus",
    direction: "outbound",
    channel: "email",
    at: "2026-09-08T11:05:00-07:00",
    counterpartyRole: "Director of Advancement",
    address: "advancement-office@demo.invalid",
    subject: "Resell at whatever you like",
    body: "Yes. The school sets its own price and keeps the difference; that is the whole design of the programme. Sixty vouchers, 50 per cent deposit, five days notice, all published terms.",
    summarised: false,
    effect: {
      note: "Answered inside the hour on the only open question.",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-heights-6",
    prospectId: "heights-christian-schools-brea-campus",
    direction: "inbound",
    channel: "email",
    at: "2026-09-14T14:00:00-07:00",
    counterpartyRole: "Director of Advancement",
    address: "advancement-office@demo.invalid",
    subject: "Signed",
    body: "Countersigned and the deposit is away. Sixty vouchers against 20 November.",
    summarised: false,
    effect: {
      note: "The only status in this app that is revenue. There is a line in the book against it.",
      movedStatusTo: "booked",
      signals: ["signed"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-heights-7",
    prospectId: "heights-christian-schools-brea-campus",
    direction: "outbound",
    channel: "email",
    at: "2026-09-19T14:00:00-07:00",
    counterpartyRole: "Director of Advancement",
    address: "advancement-office@demo.invalid",
    subject: "Redemption window, in writing",
    body: "Confirming the redemption window in writing so it can go in the school newsletter: Monday to Thursday any time, Friday before 5pm. If the opening lands later than that the window moves and nobody loses a voucher.",
    summarised: false,
    effect: {
      note: "Post-signature admin, which is where a school booking is actually won or lost for the second time.",
    },
    provenance: ILLUSTRATIVE,
  },

  // Beckman Coulter. A dead form, a live enquiry, and procurement.
  {
    id: "msg-beckman-1",
    prospectId: "beckman-coulter-inc",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-04T11:00:00-07:00",
    counterpartyRole: "HR and People Ops Manager",
    subject: "Site contact form",
    body: "Submitted the only written route the company publishes, asking to be pointed at whoever owns the site's holiday event.",
    summarised: false,
    effect: {
      note: "A form is a queue rather than a person. Sent knowing that.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-beckman-2",
    prospectId: "beckman-coulter-inc",
    direction: "inbound",
    channel: "email",
    at: "2026-09-17T10:20:00-07:00",
    counterpartyRole: "Customer support queue",
    address: "site-contact@demo.invalid",
    subject: "Case closed",
    body: "General contact form routed to a customer support queue. No route to an internal events owner is published anywhere.",
    summarised: false,
    effect: {
      note: "The written door does not lead anywhere. This is why the Kraemer Boulevard tabling shift is in the activity plan.",
      requeue: "wrong-person",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-beckman-3",
    prospectId: "beckman-coulter-inc",
    direction: "inbound",
    channel: "contact-form",
    at: "2026-09-09T09:40:00-07:00",
    counterpartyRole: "Site events lead",
    address: "site-events@demo.invalid",
    subject: "Brand events form, submitted",
    body: "Holiday event for the Brea site. Two hundred and eighty expected. We will need the date held while procurement runs the supplier checks, which usually takes three to four weeks.",
    summarised: false,
    requestId: "req-15",
    effect: {
      note: "Came in through the brand form while the site's own form was going nowhere. Two hundred and eighty guests is the largest live number on the board.",
      movedStatusTo: "conversation",
      signals: ["asked-for-a-date", "named-a-headcount"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-beckman-4",
    prospectId: "beckman-coulter-inc",
    direction: "outbound",
    channel: "email",
    at: "2026-09-09T10:30:00-07:00",
    counterpartyRole: "Site events lead",
    address: "site-events@demo.invalid",
    subject: "11 December, held while procurement runs",
    body: "Holding 11 December at no cost while your supplier checks run. The hold releases itself rather than expiring quietly, so if procurement takes six weeks instead of four nobody is embarrassed. Two hundred and eighty on a December Friday is most of the building, so the sooner it is signed the safer it is.",
    summarised: false,
    effect: {
      note: "A date held against no deposit, which is worth nothing until it converts and blocks the biggest night of the year meanwhile.",
      movedStatusTo: "soft-hold",
      offerExtensionId: "offx-beckman-first-fifty",
      signals: ["held-a-date"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-beckman-5",
    prospectId: "beckman-coulter-inc",
    direction: "outbound",
    channel: "email",
    at: "2026-09-18T11:00:00-07:00",
    counterpartyRole: "Site events lead",
    address: "site-events@demo.invalid",
    subject: "Vendor pack, and a date to speak again",
    body: "Vendor pack sent through as asked. You said three to four weeks for the checks, so I have diarised 9 October rather than chasing you next Tuesday.",
    summarised: false,
    effect: {
      note: "They named their own interval, so the follow-up clock uses theirs instead of this desk's five day default.",
    },
    provenance: ILLUSTRATIVE,
  },

  // Team Kwon. Signed on a number a person typed, which the book says
  // out loud on every screen it appears on.
  {
    id: "msg-kwon-1",
    prospectId: "team-kwon-taekwondo-center-hq",
    direction: "inbound",
    channel: "phone",
    at: "2026-09-05T14:30:00-07:00",
    counterpartyRole: "Head Instructor",
    body: "Called about the belt test celebration. Asked for a Saturday before eleven, which is the only weekend window the package is published for, and took the first date offered.",
    summarised: true,
    requestId: "req-18",
    effect: {
      note: "An inbound call from an owner who can say yes on the phone, which is what an owner operated school is.",
      movedStatusTo: "conversation",
      signals: ["asked-for-a-date", "named-a-headcount"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-kwon-2",
    prospectId: "team-kwon-taekwondo-center-hq",
    direction: "outbound",
    channel: "phone",
    at: "2026-09-05T15:00:00-07:00",
    counterpartyRole: "Head Instructor",
    body: "Called back inside the half hour with 12 December, forty-five guests, Saturday morning. Said plainly that Main Event publishes no price for this package and that the number I was about to give him was mine rather than the company's.",
    summarised: true,
    effect: {
      note: "The unpublished price named as an unpublished price, on the call, before it appeared on anything.",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-kwon-3",
    prospectId: "team-kwon-taekwondo-center-hq",
    direction: "outbound",
    channel: "email",
    at: "2026-09-11T09:15:00-07:00",
    counterpartyRole: "Head Instructor",
    address: "front-desk@demo.invalid",
    subject: "12 December, 45 guests, in writing",
    body: "Everything we agreed on the phone, written down, including the sentence that the per-head figure is a number I quoted and not a published Main Event price.",
    summarised: false,
    effect: {
      note: "The provenance of the price travels with the quote rather than being lost between the call and the contract.",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-kwon-4",
    prospectId: "team-kwon-taekwondo-center-hq",
    direction: "outbound",
    channel: "email",
    at: "2026-09-17T09:00:00-07:00",
    counterpartyRole: "Head Instructor",
    address: "front-desk@demo.invalid",
    subject: "Signed and deposited",
    body: "Contract countersigned and the 50 per cent deposit is in. Three lanes held on 12 December.",
    summarised: false,
    effect: {
      note: "Booked, with a line in the book carrying a user-input price badge everywhere it renders.",
      movedStatusTo: "booked",
      signals: ["signed"],
    },
    provenance: ILLUSTRATIVE,
  },

  // Fairway Ford. Lost, in their own words, and still on the board.
  {
    id: "msg-ford-1",
    prospectId: "fairway-ford",
    direction: "outbound",
    channel: "phone",
    at: "2026-09-08T13:00:00-07:00",
    counterpartyRole: "Dealership Sales Manager",
    body: "Called about December. He mentioned in the same breath that the holiday party has been at the same hotel for three years and said to come back in February for the summer sales push.",
    summarised: true,
    requestId: "req-20",
    effect: {
      note: "A no to December and an invitation for June, delivered in one sentence.",
      movedStatusTo: "conversation",
      signals: ["booked-elsewhere"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-ford-2",
    prospectId: "fairway-ford",
    direction: "outbound",
    channel: "email",
    at: "2026-09-10T11:00:00-07:00",
    counterpartyRole: "Dealership Sales Manager",
    address: "sales-desk@demo.invalid",
    subject: "February then",
    body: "Understood on December. Diarising February for the summer push. One thing worth knowing when you do look: the sales, service, parts and finance teams almost never socialise together, and one venue can hold all four at once in a way a hotel ballroom cannot.",
    summarised: false,
    effect: {
      note: "Closed as lost for this occasion with the reason recorded, and the February window diarised rather than a follow-up email.",
      movedStatusTo: "lost",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-ford-3",
    prospectId: "fairway-ford",
    direction: "inbound",
    channel: "email",
    at: "2026-09-10T16:30:00-07:00",
    counterpartyRole: "Dealership Sales Manager",
    address: "sales-desk@demo.invalid",
    subject: "Re: February then",
    body: "Holiday party is already contracted at a hotel and has been for three years. Come back in February if you want the summer sales push.",
    summarised: false,
    effect: {
      note: "The loss reason in their words, which is worth more on the objection register than the booking would have been in the book.",
      requeue: "come-back-later",
      signals: ["booked-elsewhere"],
    },
    provenance: ILLUSTRATIVE,
  },

  // Brea Chamber. Not a buyer so much as a room full of buyers.
  {
    id: "msg-chamber-1",
    prospectId: "brea-chamber-of-commerce",
    direction: "outbound",
    channel: "email",
    at: "2026-09-01T09:00:00-07:00",
    counterpartyRole: "Chamber President and CEO",
    address: "chamber-office@demo.invalid",
    subject: "A mixer in a building nobody has seen yet",
    body: "A new venue opens on West Birch Street. Before it does, the most useful thing it can offer the chamber is a room and a reason for members to walk into it. Is there space on the mixer calendar in the opening quarter?",
    summarised: false,
    effect: {
      note: "Opened on hosting rather than selling, because this row is a channel and not a single booking.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-chamber-2",
    prospectId: "brea-chamber-of-commerce",
    direction: "inbound",
    channel: "email",
    at: "2026-09-15T10:20:00-07:00",
    counterpartyRole: "Chamber President and CEO",
    address: "chamber-office@demo.invalid",
    subject: "Re: A mixer in a building nobody has seen yet",
    body: "Open to a member spotlight once there is something to show. Suggested the venue host a mixer in the opening quarter.",
    summarised: false,
    effect: {
      note: "Interested and explicitly conditional on there being a building to stand in.",
      movedStatusTo: "conversation",
      signals: ["asked-for-a-date"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-chamber-3",
    prospectId: "brea-chamber-of-commerce",
    direction: "outbound",
    channel: "email",
    at: "2026-09-15T15:00:00-07:00",
    counterpartyRole: "Chamber President and CEO",
    address: "chamber-office@demo.invalid",
    subject: "Opening quarter mixer, offered",
    body: "Offering the opening-quarter mixer outright. It costs a room on a slow night and puts four lanes of members inside the building at once, which is worth more than any single party the chamber itself would ever book. Before that, I will walk you through it in a hard hat, because you will introduce it better having stood in it.",
    summarised: false,
    effect: {
      note: "Tour offered ahead of the mixer. The return on both is a room full of the corporate lane rather than a contract.",
      offerExtensionId: "offx-chamber-tour",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-chamber-4",
    prospectId: "brea-chamber-of-commerce",
    direction: "outbound",
    channel: "in-person",
    at: "2026-09-22T18:30:00-07:00",
    counterpartyRole: "Chamber President and CEO",
    body: "Went to the monthly mixer. Confirmed the opening-quarter slot verbally, collected three member introductions and was told the chamber will not put it in the newsletter until an opening date exists.",
    summarised: true,
    effect: {
      note: "Verbal yes, no date, and the same blocker as everywhere else on this board: there is no published opening date.",
    },
    provenance: ILLUSTRATIVE,
  },

  // Embassy Suites. A referral partner who converts on the tour and
  // almost nowhere else.
  {
    id: "msg-embassy-1",
    prospectId: "embassy-suites-by-hilton-brea-north-orange-count",
    direction: "outbound",
    channel: "email",
    at: "2026-09-02T14:00:00-07:00",
    counterpartyRole: "Director of Sales",
    address: "hotel-sales@demo.invalid",
    subject: "Where your conference groups go after 6pm",
    body: "Your groups are in the building all day and have nothing booked in the evening. A venue two minutes away opens this year. I am not asking for your business; I am asking to be the thing you recommend, and I know you will not recommend somewhere you have not seen.",
    summarised: false,
    effect: {
      note: "Opened as a referral conversation rather than a sale, which is the only version of this that works.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-embassy-2",
    prospectId: "embassy-suites-by-hilton-brea-north-orange-count",
    direction: "inbound",
    channel: "email",
    at: "2026-09-15T11:30:00-07:00",
    counterpartyRole: "Director of Sales",
    address: "hotel-sales@demo.invalid",
    subject: "A group for you, conditionally",
    body: "Passing on a conference group who want an evening off site in the opening quarter. They will ask about a tour before they commit anything and I would want to walk it myself first.",
    summarised: false,
    requestId: "req-13",
    effect: {
      note: "A referral arrived before anything was sold, and it is conditional on a walk of a building that is still a building site.",
      movedStatusTo: "conversation",
      signals: ["asked-for-a-date"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-embassy-3",
    prospectId: "embassy-suites-by-hilton-brea-north-orange-count",
    direction: "outbound",
    channel: "email",
    at: "2026-09-15T12:15:00-07:00",
    counterpartyRole: "Director of Sales",
    address: "hotel-sales@demo.invalid",
    subject: "Hard hat tour, you first",
    body: "You walk it before the group does. A construction-phase tour is more memorable than a finished one and I can run it weeks before there is anything to sell. Bring whoever else on your team fields the evening question.",
    summarised: false,
    effect: {
      note: "Tour offered to the referrer rather than to the referred group, which is the right way round.",
      offerExtensionId: "offx-embassy-tour",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-embassy-4",
    prospectId: "embassy-suites-by-hilton-brea-north-orange-count",
    direction: "inbound",
    channel: "email",
    at: "2026-09-17T16:40:00-07:00",
    counterpartyRole: "Director of Sales",
    address: "hotel-sales@demo.invalid",
    subject: "Re: Hard hat tour, you first",
    body: "Yes to the tour once the site will allow it. Who else has committed for the opening quarter? My group will ask and I would rather not say nobody.",
    summarised: false,
    effect: {
      note: "The social proof question, which is a late-stage question wearing an early-stage sentence.",
      signals: ["asked-who-else-has-booked", "agreed-to-meet"],
    },
    provenance: ILLUSTRATIVE,
  },

  // Brea Family Dental Center. One email, nothing back, twelve days.
  {
    id: "msg-bfdc-1",
    prospectId: "brea-family-dental-center",
    direction: "outbound",
    channel: "email",
    at: "2026-09-21T09:30:00-07:00",
    counterpartyRole: "Office Manager",
    address: "front-office@demo.invalid",
    subject: "One night, the whole practice, no cover needed",
    body: "A single-location practice can close together in a way a group cannot, which makes one evening simpler for you than two afternoons. A venue opens in Brea this year and December dates are not spoken for yet.",
    summarised: false,
    effect: {
      note: "First touch. Nothing back yet, which at two days is not yet a finding.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },

  // Silverado. The shift pattern is the whole sale.
  {
    id: "msg-silverado-1",
    prospectId: "silverado-brea-memory-care-community",
    direction: "outbound",
    channel: "email",
    at: "2026-09-04T10:00:00-07:00",
    counterpartyRole: "Administrator and HR Manager",
    address: "community-admin@demo.invalid",
    subject: "A staff night that does not leave the floor uncovered",
    body: "A 24-hour community cannot send everybody out on the same evening, so the usual all-hands night is the wrong shape. Two smaller weekday events is the shape that works, and weekday daytime is the emptiest inventory a venue owns.",
    summarised: false,
    effect: {
      note: "Opened on their constraint rather than on the venue's product.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-silverado-2",
    prospectId: "silverado-brea-memory-care-community",
    direction: "inbound",
    channel: "email",
    at: "2026-09-18T09:20:00-07:00",
    counterpartyRole: "Administrator and HR Manager",
    address: "community-admin@demo.invalid",
    subject: "Re: A staff night that does not leave the floor uncovered",
    body: "Interested in a weekday daytime staff appreciation for about 40, split across two shifts so the community is never uncovered.",
    summarised: false,
    effect: {
      note: "A live conversation with a headcount and a day part already agreed by them.",
      movedStatusTo: "conversation",
      signals: ["named-a-headcount"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-silverado-3",
    prospectId: "silverado-brea-memory-care-community",
    direction: "outbound",
    channel: "email",
    at: "2026-09-18T14:30:00-07:00",
    counterpartyRole: "Administrator and HR Manager",
    address: "community-admin@demo.invalid",
    subject: "Two forties beat one eighty",
    body: "Quoting two weekday events rather than one. Two forty-person weekday bookings is better inventory for this venue than a single eighty-person Friday, so this is not a compromise, it is the version I would rather have. A rate agreed now and honoured for a year makes the second one easy to approve.",
    summarised: false,
    effect: {
      note: "Rate lock extended against the day part they had already chosen.",
      offerExtensionId: "offx-silverado-midweek",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-silverado-4",
    prospectId: "silverado-brea-memory-care-community",
    direction: "inbound",
    channel: "email",
    at: "2026-09-21T08:10:00-07:00",
    counterpartyRole: "Administrator and HR Manager",
    address: "community-admin@demo.invalid",
    subject: "Automatic reply: annual leave",
    body: "Away until 5 October. Urgent matters to the community's main line.",
    summarised: false,
    effect: {
      note: "The conversation is live and the person is not. Requeued to the return date rather than chased into an empty inbox.",
      requeue: "out-of-office",
    },
    provenance: ILLUSTRATIVE,
  },

  // Boys and Girls Club. A hold, a fundraiser, and a club that needs
  // the money back rather than the discount.
  {
    id: "msg-bgc-1",
    prospectId: "boys-girls-club-brea-placentia-yorba-linda",
    direction: "outbound",
    channel: "email",
    at: "2026-09-08T11:40:00-07:00",
    counterpartyRole: "Programme Director",
    address: "programme-director@demo.invalid",
    subject: "End of term, and something that gives back to the club",
    body: "Main Event publishes a Spirit Night programme that donates 20 per cent of sales on the night to the nonprofit that brings the crowd. For a club that already takes its teen members somewhere at the end of each term, that is the same trip paying for itself.",
    summarised: false,
    effect: {
      note: "Opened on the published fundraiser rather than on a party, because the club's constraint is money and not enthusiasm.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-bgc-2",
    prospectId: "boys-girls-club-brea-placentia-yorba-linda",
    direction: "inbound",
    channel: "contact-form",
    at: "2026-09-17T10:00:00-07:00",
    counterpartyRole: "Programme director",
    address: "programme-director@demo.invalid",
    subject: "Brea enquiry form, submitted",
    body: "We take our teen members somewhere at the end of each term and we run a fundraiser alongside it. Interested in whether there is anything that gives something back to the club.",
    summarised: false,
    requestId: "req-09",
    effect: {
      note: "Came back through the form with seventy-five teenagers attached and no date, which is the normal order for this lane.",
      movedStatusTo: "conversation",
      signals: ["named-a-headcount"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-bgc-3",
    prospectId: "boys-girls-club-brea-placentia-yorba-linda",
    direction: "outbound",
    channel: "email",
    at: "2026-09-17T14:20:00-07:00",
    counterpartyRole: "Programme Director",
    address: "programme-director@demo.invalid",
    subject: "20 per cent back, on Main Event's own published terms",
    body: "The 20 per cent is Main Event's published figure rather than something I negotiated, so it needs nobody's approval and cannot be taken away from you later. Pick a slow midweek night and the club keeps the crowd it was going to bring anyway.",
    summarised: false,
    effect: {
      note: "Fundraiser offered on published terms, which is the one offer in the catalogue that is not an invention.",
      offerExtensionId: "offx-bgc-spirit",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-bgc-4",
    prospectId: "boys-girls-club-brea-placentia-yorba-linda",
    direction: "outbound",
    channel: "phone",
    at: "2026-09-20T10:00:00-07:00",
    counterpartyRole: "Programme Director",
    body: "Called to fix a date. Held 14 November against about seventy-five teen members, no deposit, releasing itself if the opening lands wrong. She will confirm once the term calendar is signed off in October.",
    summarised: true,
    effect: {
      note: "A held date with a stated condition on it, which is a better hold than one with no condition and a hopeful tone.",
      movedStatusTo: "soft-hold",
      signals: ["held-a-date"],
    },
    provenance: ILLUSTRATIVE,
  },

  // Saint Angela Merici. A form enquiry with an objection inside it.
  {
    id: "msg-angela-1",
    prospectId: "saint-angela-merici-catholic-church",
    direction: "outbound",
    channel: "email",
    at: "2026-09-15T09:45:00-07:00",
    counterpartyRole: "Youth Ministry Coordinator",
    address: "youth-ministry@demo.invalid",
    subject: "Autumn youth night, and the confirmation celebration",
    body: "A parish that runs both confirmation and a high school ministry has two dates a year that want somewhere loud and supervised. A venue opens on West Birch Street this year and can take a group of any size on a weeknight.",
    summarised: false,
    effect: {
      note: "First touch into the parish office.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-angela-2",
    prospectId: "saint-angela-merici-catholic-church",
    direction: "inbound",
    channel: "contact-form",
    at: "2026-09-21T11:15:00-07:00",
    counterpartyRole: "Youth ministry coordinator",
    address: "youth-ministry@demo.invalid",
    subject: "Brea enquiry form, submitted",
    body: "Our high school ministry does a big night out each autumn and we heard a new place is opening on Birch. Roughly how does it work for a group and can we bring our own cake for the birthdays that month?",
    summarised: false,
    requestId: "req-01",
    effect: {
      note: "Interested, and carrying the outside food question that Main Event's published house policy answers with a no. Still unanswered and past the response commitment.",
      movedStatusTo: "conversation",
      signals: ["asked-for-a-price"],
    },
    provenance: ILLUSTRATIVE,
  },
];

// ---------------------------------------------------------------
// Inbound led
// ---------------------------------------------------------------

/*
  Nine organisations whose thread starts with them rather than with this
  desk, and which the pipeline had not caught up with.

  This is the group that argues for the inbox existing at all. Every one
  of these arrived through a form, a phone call or a counter conversation
  while the outbound plan was pointed somewhere else, and a board built
  only from outbound work would have had all nine sitting at unworked
  while somebody in the building was waiting for an answer.
*/
const INBOUND_LED: ConversationMessage[] = [
  // Envista. The most specific enquiry on the board, and the only one
  // that asks about the food floor, which is the single per-head number
  // Main Event publishes anywhere.
  {
    id: "msg-envista-1",
    prospectId: "envista-world-headquarters",
    direction: "outbound",
    channel: "email",
    at: "2026-09-07T09:20:00-07:00",
    counterpartyRole: "HR and People Ops Manager",
    address: "workplace-experience@demo.invalid",
    subject: "A kickoff that does not need a hotel ballroom",
    body: "A global headquarters that shares a campus with its own subsidiary runs more offsites than most companies its size. A venue with meeting space and lanes in the same building opens ten minutes away this year, which makes a morning of talking and an afternoon of not talking one booking rather than two.",
    summarised: false,
    effect: {
      note: "First touch, aimed at the one thing a games venue can do that a hotel cannot.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-envista-2",
    prospectId: "envista-world-headquarters",
    direction: "inbound",
    channel: "contact-form",
    at: "2026-09-14T10:00:00-07:00",
    counterpartyRole: "Workplace experience manager",
    address: "workplace-experience@demo.invalid",
    subject: "Quote page enquiry, submitted",
    body: "Came back on the quote. Asked whether the meeting space could be used in the morning and the bowling in the afternoon as one booking, and what the food minimum would be for that.",
    summarised: false,
    requestId: "req-12",
    effect: {
      note: "Ninety guests, a date, and a procurement-shaped question about the minimum. This is a buyer rather than an enquirer.",
      movedStatusTo: "conversation",
      signals: ["asked-for-a-date", "named-a-headcount", "asked-for-a-price"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-envista-3",
    prospectId: "envista-world-headquarters",
    direction: "outbound",
    channel: "email",
    at: "2026-09-14T13:30:00-07:00",
    counterpartyRole: "Workplace experience manager",
    address: "workplace-experience@demo.invalid",
    subject: "One booking, and the only per-head number that is published",
    body: "Morning in the meeting space and the afternoon on the lanes is one booking, and it is the shape this building is best at. On the minimum: Main Event publishes no group price, and the only per-head figure it publishes anywhere is a banquet food floor starting at 14 dollars a person. I would rather give you that real number and the assumptions than a total I would have to revise.",
    summarised: false,
    effect: {
      note: "Answered a price question with the one published figure that exists and named the rest as unpublished.",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-envista-4",
    prospectId: "envista-world-headquarters",
    direction: "outbound",
    channel: "email",
    at: "2026-09-18T14:00:00-07:00",
    counterpartyRole: "Workplace experience manager",
    address: "workplace-experience@demo.invalid",
    subject: "4 December, still unclaimed",
    body: "Checking in once on 4 December. Nothing is held against it yet and December Fridays are the first dates to go, so I would rather hold it for you now and release it later than watch it go to somebody who asked second.",
    summarised: false,
    effect: {
      note: "Quote out, no answer, one chase sent. The next move is theirs and the date is the pressure.",
    },
    provenance: ILLUSTRATIVE,
  },

  // Brea Jiu-Jitsu. Asked twice whether the building will be open,
  // which is the objection every thread in this file eventually hits.
  {
    id: "msg-bjj-1",
    prospectId: "brea-jiu-jitsu",
    direction: "inbound",
    channel: "phone",
    at: "2026-09-17T13:20:00-07:00",
    counterpartyRole: "Academy owner",
    body: "Called about a belt promotion celebration. Wants a Saturday morning, families included, and asked twice whether the venue would definitely be open by then.",
    summarised: true,
    requestId: "req-14",
    effect: {
      note: "Inbound, from an owner who can approve it himself, with a date and sixty guests already decided.",
      movedStatusTo: "conversation",
      signals: ["asked-for-a-date", "named-a-headcount"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-bjj-2",
    prospectId: "brea-jiu-jitsu",
    direction: "outbound",
    channel: "phone",
    at: "2026-09-17T13:55:00-07:00",
    counterpartyRole: "Academy owner",
    body: "Called back inside forty minutes. Told him plainly that no opening date is published and that I will not promise one. Offered a hold on 19 December that costs nothing and releases itself if the opening moves.",
    summarised: true,
    effect: {
      note: "Answered the objection with a mechanism rather than with reassurance.",
      offerExtensionId: "offx-bjj-first-fifty",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-bjj-3",
    prospectId: "brea-jiu-jitsu",
    direction: "outbound",
    channel: "email",
    at: "2026-09-18T09:10:00-07:00",
    counterpartyRole: "Academy owner",
    address: "academy-owner@demo.invalid",
    subject: "Saturday 19 December, 60 guests, in writing",
    body: "Written version of the call. The package he wants is published for Saturday mornings before eleven only, which is the window he asked for anyway. No price is published for it, so the figure in this quote is mine and it is labelled as mine.",
    summarised: false,
    effect: {
      note: "Quote sent. The day part restriction happens to match what he wanted, which is rare and worth saying.",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-bjj-4",
    prospectId: "brea-jiu-jitsu",
    direction: "outbound",
    channel: "email",
    at: "2026-09-21T10:00:00-07:00",
    counterpartyRole: "Academy owner",
    address: "academy-owner@demo.invalid",
    subject: "Re: Saturday 19 December, 60 guests, in writing",
    body: "One follow-up. If the opening date is the blocker, say so and I will stop chasing until there is one to give you.",
    summarised: false,
    effect: {
      note: "Chased once and named the likely reason for the silence, which is more useful than a third cheerful email.",
    },
    provenance: ILLUSTRATIVE,
  },

  // The Cause Church. A held winter date and a chaperone question that
  // nobody had thought to publish an answer to.
  {
    id: "msg-cause-1",
    prospectId: "the-cause-church-brea",
    direction: "inbound",
    channel: "contact-form",
    at: "2026-09-10T19:20:00-07:00",
    counterpartyRole: "Student ministries pastor",
    address: "student-ministries@demo.invalid",
    subject: "Brea enquiry form, submitted",
    body: "Winter youth night for our middle and high school students. We would bring adult volunteers and we need to know how many we are required to bring for that many students.",
    summarised: false,
    requestId: "req-16",
    effect: {
      note: "Arrived at half past seven in the evening, which is when youth pastors do admin. Ninety-six students and a compliance question.",
      movedStatusTo: "conversation",
      signals: ["asked-for-a-date", "named-a-headcount"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-cause-2",
    prospectId: "the-cause-church-brea",
    direction: "outbound",
    channel: "email",
    at: "2026-09-11T09:50:00-07:00",
    counterpartyRole: "Student ministries pastor",
    address: "student-ministries@demo.invalid",
    subject: "Chaperone ratio, and 18 December",
    body: "The lock-in format is the one built for this and it has a published supervision requirement rather than a house rule I would have to invent. Holding 18 December while you check the ratio against your own safeguarding policy, which is probably stricter than ours.",
    summarised: false,
    effect: {
      note: "Answered the compliance question first and the date second, which is the order a youth pastor cares about.",
      offerExtensionId: "offx-cause-first-fifty",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-cause-3",
    prospectId: "the-cause-church-brea",
    direction: "inbound",
    channel: "email",
    at: "2026-09-14T15:00:00-07:00",
    counterpartyRole: "Student ministries pastor",
    address: "student-ministries@demo.invalid",
    subject: "Re: Chaperone ratio, and 18 December",
    body: "Hold it. Our policy needs one adult per eight students so we will bring twelve, which is more than you require. I cannot sign anything until the elders meet in October.",
    summarised: false,
    effect: {
      note: "A hold with a named blocker and a named date for it clearing, which is the most useful shape a hold can take.",
      movedStatusTo: "soft-hold",
      signals: ["held-a-date"],
    },
    provenance: ILLUSTRATIVE,
  },

  // Brea Urgent Care. A first-time buyer who needs a number before
  // anybody internal will even discuss it.
  {
    id: "msg-urgent-1",
    prospectId: "brea-urgent-care",
    direction: "inbound",
    channel: "contact-form",
    at: "2026-09-18T15:40:00-07:00",
    counterpartyRole: "Clinic operations manager",
    address: "clinic-operations@demo.invalid",
    subject: "Brea enquiry form, submitted",
    body: "Enquiring on behalf of the clinic. We have never done anything like this and would want to understand cost before taking it to the partners. No fixed date in mind at this stage.",
    summarised: false,
    requestId: "req-10",
    effect: {
      note: "No date, no headcount, and a stated internal approval step. The price question is the whole conversation here.",
      movedStatusTo: "conversation",
      signals: ["asked-for-a-price"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-urgent-2",
    prospectId: "brea-urgent-care",
    direction: "outbound",
    channel: "email",
    at: "2026-09-19T08:30:00-07:00",
    counterpartyRole: "Clinic Manager",
    address: "clinic-operations@demo.invalid",
    subject: "What I can tell you before the partners see it",
    body: "The honest answer is that Main Event publishes no group price, and I am not going to invent one to get a meeting. What I can do is put a real quote against your actual numbers this week and hold the price while the partners look at it. To do that I need two things you have not told me: roughly how many people, and whether it is an evening or an afternoon.",
    summarised: false,
    effect: {
      note: "Answered the unanswerable question with the two questions that make it answerable.",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-urgent-3",
    prospectId: "brea-urgent-care",
    direction: "outbound",
    channel: "phone",
    at: "2026-09-22T11:00:00-07:00",
    counterpartyRole: "Clinic Manager",
    body: "Called the clinic. Reception took a message; the operations manager was on the floor. Left the two questions with reception rather than asking for a call back, so an answer can come back without anybody having to find me.",
    summarised: true,
    effect: {
      note: "Second touch on a live enquiry, still missing both qualifying fields.",
    },
    provenance: ILLUSTRATIVE,
  },

  // Crumbl. Agreed at a counter, confirmed by the franchisee, and not
  // in the book. The two ledgers disagree and the app says so.
  {
    id: "msg-crumbl-1",
    prospectId: "crumbl-cookies-brea",
    direction: "outbound",
    channel: "in-person",
    at: "2026-09-16T15:00:00-07:00",
    counterpartyRole: "Store manager",
    body: "Route go-see on East Birch. Asked at the counter. Eighteen mostly part-time staff, all of them working weekend nights, none of them ever taken anywhere. The store manager was interested and said the franchisee would have to say yes.",
    summarised: true,
    requestId: "req-19",
    effect: {
      note: "A franchise unit answering exactly as a franchise unit does: keen in the building, and the signature is elsewhere.",
      movedStatusTo: "conversation",
      signals: ["named-a-headcount"],
      requeue: "decision-off-site",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-crumbl-2",
    prospectId: "crumbl-cookies-brea",
    direction: "inbound",
    channel: "phone",
    at: "2026-09-16T17:20:00-07:00",
    counterpartyRole: "Franchise owner",
    body: "The franchisee rang back the same afternoon. Yes to a weekday daytime crew night before the evening trade, around 16 November, eighteen people. Asked for nothing in writing.",
    summarised: true,
    effect: {
      note: "One signature, reached in two hours, which is the entire commercial argument for the independent and franchise cohort.",
      signals: ["asked-for-a-date", "held-a-date"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-crumbl-3",
    prospectId: "crumbl-cookies-brea",
    direction: "outbound",
    channel: "phone",
    at: "2026-09-22T16:00:00-07:00",
    counterpartyRole: "Franchise owner",
    body: "Called to turn the verbal agreement into a signed one. He is happy and has not signed anything, so there is no contract, no deposit and no line in the book. Held 16 November rather than recording a booking that does not exist.",
    summarised: true,
    effect: {
      note: "A verbal yes is not revenue. The request row says won, the book says nothing, and the queue is right to flag the disagreement rather than pick a side.",
      movedStatusTo: "soft-hold",
    },
    provenance: ILLUSTRATIVE,
  },

  // ViewSonic. The clearest case of going quiet after a quote, which is
  // the pattern the intent reading exists to catch.
  {
    id: "msg-viewsonic-1",
    prospectId: "viewsonic-corporation",
    direction: "inbound",
    channel: "contact-form",
    at: "2026-09-02T10:20:00-07:00",
    counterpartyRole: "Regional HR business partner",
    address: "hr-partner@demo.invalid",
    subject: "Brand events form, submitted",
    body: "Asked what a mid-size team event would cost per head and whether there was anything running midweek.",
    summarised: false,
    requestId: "req-22",
    effect: {
      note: "A hundred and thirty people and a price question in the first line, from a partner who covers several sites.",
      movedStatusTo: "conversation",
      signals: ["named-a-headcount", "asked-for-a-price"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-viewsonic-2",
    prospectId: "viewsonic-corporation",
    direction: "outbound",
    channel: "email",
    at: "2026-09-03T15:30:00-07:00",
    counterpartyRole: "Regional HR business partner",
    address: "hr-partner@demo.invalid",
    subject: "Midweek, and why there is no per-head number to send you",
    body: "Midweek is the best inventory this venue will ever sell and I can agree a rate now and hold it for a year. On cost per head: there is no published corporate price, so anything I sent you today would be a figure I made up. Give me a date and a rough split of the hundred and thirty and I will quote it properly.",
    summarised: false,
    effect: {
      note: "Answered inside the response commitment, with the rate lock in place of a number that does not exist.",
      offerExtensionId: "offx-viewsonic-midweek",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-viewsonic-3",
    prospectId: "viewsonic-corporation",
    direction: "outbound",
    channel: "email",
    at: "2026-09-11T09:00:00-07:00",
    counterpartyRole: "Regional HR business partner",
    address: "hr-partner@demo.invalid",
    subject: "Still holding the midweek rate",
    body: "One follow-up and then I will leave it with you. The rate lock stands whether or not January is the month.",
    summarised: false,
    effect: {
      note: "Twelve days of silence since. An offer is out, unanswered, and the record has been quiet longer than a live conversation is allowed to be.",
    },
    provenance: ILLUSTRATIVE,
  },

  // New American Funding. Stalled on the unpublished price, which is
  // the objection this whole app is organised around.
  {
    id: "msg-naf-1",
    prospectId: "new-american-funding-brea-branch",
    direction: "inbound",
    channel: "contact-form",
    at: "2026-09-15T09:15:00-07:00",
    counterpartyRole: "Branch manager",
    address: "branch-office@demo.invalid",
    subject: "Brea enquiry form, submitted",
    body: "Wanted something for the branch and a handful of referral partners. Asked for a price.",
    summarised: false,
    requestId: "req-23",
    effect: {
      note: "Forty people, half of them referral partners, and the first question is the one with no published answer.",
      movedStatusTo: "conversation",
      signals: ["named-a-headcount", "asked-for-a-price"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-naf-2",
    prospectId: "new-american-funding-brea-branch",
    direction: "outbound",
    channel: "email",
    at: "2026-09-16T14:00:00-07:00",
    counterpartyRole: "Branch Manager",
    address: "branch-office@demo.invalid",
    subject: "Why there is no price on the page",
    body: "Main Event does not publish a price for any corporate package, at any location, and the pages say to contact the local sales manager instead. That is me. A real number needs the headcount, the day part and what you want included, and I would rather give you one this week that holds than a range today that moves.",
    summarised: false,
    effect: {
      note: "The true answer, given plainly. It is also the answer that loses some of these conversations.",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-naf-3",
    prospectId: "new-american-funding-brea-branch",
    direction: "outbound",
    channel: "email",
    at: "2026-09-17T14:00:00-07:00",
    counterpartyRole: "Branch Manager",
    address: "branch-office@demo.invalid",
    subject: "Two questions and you have a number",
    body: "Forty people and a date is all I need. If it is easier, tell me the budget you have and I will tell you honestly whether it works.",
    summarised: false,
    effect: {
      note: "Nothing back in six days. A branch manager who wanted a number and got a policy is the most common way this desk loses a live enquiry.",
    },
    provenance: ILLUSTRATIVE,
  },

  // Gentle Dental. A chain practice, unanswered, and past nothing yet.
  {
    id: "msg-gentle-1",
    prospectId: "gentle-dental-brea",
    direction: "inbound",
    channel: "contact-form",
    at: "2026-09-22T13:05:00-07:00",
    counterpartyRole: "Practice manager",
    address: "practice-manager@demo.invalid",
    subject: "Brea enquiry form, submitted",
    body: "Looking at somewhere for a staff appreciation afternoon. We cannot all leave the practice at once so it would likely be two smaller groups on different days rather than one evening.",
    summarised: false,
    requestId: "req-03",
    effect: {
      note: "Inbound, unanswered, and the form asked for none of the date, headcount or event type.",
      movedStatusTo: "conversation",
    },
    provenance: ILLUSTRATIVE,
  },

  // Stonefire Grill. A competitor for the lunch trade and a customer
  // for the evening, which is a distinction worth holding.
  {
    id: "msg-stonefire-1",
    prospectId: "stonefire-grill-brea",
    direction: "outbound",
    channel: "in-person",
    at: "2026-09-23T08:10:00-07:00",
    counterpartyRole: "General manager",
    body: "Asked at the counter during a route go-see. Wants somewhere to take the kitchen and front of house crew on a Monday, which is their quietest day. Said they would need a price before asking the owner.",
    summarised: true,
    requestId: "req-06",
    effect: {
      note: "Thirty-eight staff and a stated approval chain above the general manager. The price is the gate.",
      movedStatusTo: "conversation",
      signals: ["named-a-headcount", "asked-for-a-price"],
      requeue: "decision-off-site",
    },
    provenance: ILLUSTRATIVE,
  },
];

// ---------------------------------------------------------------
// Schools and colleges, cold
// ---------------------------------------------------------------

/*
  The calendar-locked lane, worked cold, with the results a school year
  actually produces in September. Two absence replies, one routing
  correction, one polite refusal on the grounds that they own their own
  facilities, and two organisations that have said nothing at all.
*/
const SCHOOLS_COLD: ConversationMessage[] = [
  // Valencia High School. The school year's own answer to outreach.
  {
    id: "msg-valencia-1",
    prospectId: "valencia-high-school",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-09T10:40:00-07:00",
    counterpartyRole: "Activities and ASB Director",
    subject: "School contact form",
    body: "Submitted through the school's form, which is the only written route published. Asked whether the ASB calendar for the spring is set and who owns the team banquets.",
    summarised: false,
    effect: {
      note: "First touch through a form rather than an inbox, so it lands in a queue somebody may or may not read.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-valencia-2",
    prospectId: "valencia-high-school",
    direction: "inbound",
    channel: "email",
    at: "2026-09-09T10:41:00-07:00",
    counterpartyRole: "Activities and ASB Director",
    address: "activities-office@demo.invalid",
    subject: "Automatic reply",
    body: "I am off campus with the fall sports programme and will respond to messages on my return. For urgent student matters contact the attendance office.",
    summarised: false,
    effect: {
      note: "An absence reply with no return date on it, which is worse than one with a date. Requeued blind for a fortnight.",
      requeue: "out-of-office",
    },
    provenance: ILLUSTRATIVE,
  },

  // El Dorado High School. A routing correction that is worth more than
  // the email it cost.
  {
    id: "msg-eldorado-1",
    prospectId: "el-dorado-high-school",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-10T09:15:00-07:00",
    counterpartyRole: "Athletic Director",
    subject: "School contact form",
    body: "The school publishes contact links for all staff, so the ask was simple: which of the fall and spring banquets do you book yourself, and which go through somebody else?",
    summarised: false,
    effect: {
      note: "First touch, written to produce a routing answer even if it produces nothing else.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-eldorado-2",
    prospectId: "el-dorado-high-school",
    direction: "inbound",
    channel: "email",
    at: "2026-09-16T14:05:00-07:00",
    counterpartyRole: "Athletic Director",
    address: "athletics@demo.invalid",
    subject: "Re: School contact form",
    body: "Each head coach books their own end of season night and pays for it out of their own team account. I do not hold a budget for that. The ASB office does grad night and everything else.",
    summarised: false,
    effect: {
      note: "Not a rejection. It says the money is in fourteen small accounts rather than one, which changes the shape of the whole approach to this school.",
      requeue: "wrong-person",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-eldorado-3",
    prospectId: "el-dorado-high-school",
    direction: "outbound",
    channel: "email",
    at: "2026-09-17T08:50:00-07:00",
    counterpartyRole: "Athletic Director",
    address: "athletics@demo.invalid",
    subject: "Thank you, and one ask",
    body: "That is genuinely useful. Would you forward this to the coaches who ask you where to go? Fourteen team nights is a better year for this venue than one banquet.",
    summarised: false,
    effect: {
      note: "Converted a wrong person into a distribution route rather than closing the record.",
    },
    provenance: ILLUSTRATIVE,
  },

  // Yorba Linda High School. Nothing, twice.
  {
    id: "msg-ylhs-1",
    prospectId: "yorba-linda-high-school",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-08T11:05:00-07:00",
    counterpartyRole: "Activities and ASB Director",
    subject: "School contact form",
    body: "A newer campus with less legacy tradition tying grad night to one place. Asked whether the venue could be considered for June and who sits on the committee.",
    summarised: false,
    effect: {
      note: "First touch.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-ylhs-2",
    prospectId: "yorba-linda-high-school",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-16T11:00:00-07:00",
    counterpartyRole: "Activities and ASB Director",
    subject: "School contact form",
    body: "Second submission, worded differently in case the first one was filtered.",
    summarised: false,
    effect: {
      note: "Two form submissions, no acknowledgement of either. There is nothing here to read as a signal, which is itself the reading: this one is a visit or it is nothing.",
    },
    provenance: ILLUSTRATIVE,
  },

  // Biola. A conference services office that books logistics for a
  // living, which means the reply is a process rather than a mood.
  {
    id: "msg-biola-1",
    prospectId: "biola-university",
    direction: "outbound",
    channel: "email",
    at: "2026-09-05T09:00:00-07:00",
    counterpartyRole: "Conference and Event Services Manager",
    address: "conference-services@demo.invalid",
    subject: "Welcome week and post-season, off campus",
    body: "You have an office whose whole job is booking group logistics, which makes this a shorter conversation than most. A venue opens twenty minutes away this year with capacity for a whole residential cohort at once.",
    summarised: false,
    effect: {
      note: "First touch, pitched at a professional buyer rather than at a teacher with a side responsibility.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-biola-2",
    prospectId: "biola-university",
    direction: "inbound",
    channel: "email",
    at: "2026-09-12T13:30:00-07:00",
    counterpartyRole: "Conference and Event Services Manager",
    address: "conference-services@demo.invalid",
    subject: "Re: Welcome week and post-season, off campus",
    body: "Send me something in writing with capacities, minimums and your certificate of insurance. We keep a file of approved off-campus vendors and nothing gets booked that is not in it.",
    summarised: false,
    effect: {
      note: "A real reply and a smaller signal than it reads as. Nothing here is about wanting the venue; it is about paperwork, and paperwork is the actual gate.",
      movedStatusTo: "conversation",
      signals: ["asked-for-it-in-writing"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-biola-3",
    prospectId: "biola-university",
    direction: "outbound",
    channel: "email",
    at: "2026-09-14T10:20:00-07:00",
    counterpartyRole: "Conference and Event Services Manager",
    address: "conference-services@demo.invalid",
    subject: "Capacities and what is not published yet",
    body: "Capacities and published day part restrictions below. Two things I cannot give you yet and will not pretend otherwise: an opening date, because none is published, and a group price, because Main Event publishes none. The insurance certificate follows once the building has an occupancy date.",
    summarised: false,
    effect: {
      note: "Sent what exists and named what does not, which is the only version of this that survives being checked.",
    },
    provenance: ILLUSTRATIVE,
  },

  // North Orange County Community College District. A polite refusal
  // with a real reason inside it.
  {
    id: "msg-nocccd-1",
    prospectId: "north-orange-county-community-college-district",
    direction: "outbound",
    channel: "email",
    at: "2026-09-08T14:15:00-07:00",
    counterpartyRole: "HR and People Ops Manager",
    address: "district-hr@demo.invalid",
    subject: "Employee recognition for a district, not a campus",
    body: "The district office employs the staff behind three campuses and owns the recognition calendar for all of them, which makes one booking worth three. A venue opens in Brea this year.",
    summarised: false,
    effect: {
      note: "First touch to the office that actually holds the budget rather than to a campus.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-nocccd-2",
    prospectId: "north-orange-county-community-college-district",
    direction: "inbound",
    channel: "email",
    at: "2026-09-11T16:40:00-07:00",
    counterpartyRole: "HR and People Ops Manager",
    address: "district-hr@demo.invalid",
    subject: "Re: Employee recognition for a district, not a campus",
    body: "Thank you, but we hold service awards and the staff picnic on our own campuses. There is no budget line for an off-site venue and there has not been for some years.",
    summarised: false,
    effect: {
      note: "A polite no with the reason attached, which is worth recording: the obstacle is a missing budget line rather than a preference, and a missing line can appear in a different year.",
      requeue: "come-back-later",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-nocccd-3",
    prospectId: "north-orange-county-community-college-district",
    direction: "outbound",
    channel: "email",
    at: "2026-09-12T09:10:00-07:00",
    counterpartyRole: "HR and People Ops Manager",
    address: "district-hr@demo.invalid",
    subject: "Understood, and one thing worth keeping",
    body: "Understood. If a campus ever needs somewhere for a retirement or a service milestone that will not fit in a staff room, the weekday daytime hours are the cheapest thing this venue owns and I will not need a budget line to be generous with them.",
    summarised: false,
    effect: {
      note: "Left a door open without arguing with a no, and diarised the next budget cycle rather than a follow-up email.",
    },
    provenance: ILLUSTRATIVE,
  },

  // Marshall B. Ketchum. Silence from a form.
  {
    id: "msg-ketchum-1",
    prospectId: "marshall-b-ketchum-university",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-11T15:30:00-07:00",
    counterpartyRole: "Student Affairs Manager",
    subject: "University contact form",
    body: "Cohorts that move through together in tight yearly groups book white coat and class-of celebrations off campus. Asked who owns those and whether they are diarised a year ahead.",
    summarised: false,
    effect: {
      note: "First touch through the only written route published.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },

  // Hope International. No written door at all, so this one is a door.
  {
    id: "msg-hiu-1",
    prospectId: "hope-international-university-hiu",
    direction: "outbound",
    channel: "in-person",
    at: "2026-09-19T13:20:00-07:00",
    counterpartyRole: "Director of Student Life",
    body: "Walked into student life on the way back from the Fullerton route. The director was teaching. Left a card and the two dates that matter, welcome week and the end of the NAIA season, with the front desk.",
    summarised: true,
    effect: {
      note: "A visit rather than an email because this organisation publishes no address at all. Nobody has been reached yet and the record says so.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
];

// ---------------------------------------------------------------
// Employers
// ---------------------------------------------------------------

/*
  Corporate sites, where the failure mode is not rejection. It is that
  the written door leads to a queue, the person who answers does not own
  the budget, and the site that could say yes is behind a badge reader.
*/
const EMPLOYERS: ConversationMessage[] = [
  // TYC Americas. Two distinct groups in one building, and a price
  // question answered with the truth rather than a range.
  {
    id: "msg-tyc-1",
    prospectId: "tyc-americas-headquarters",
    direction: "outbound",
    channel: "email",
    at: "2026-09-10T08:45:00-07:00",
    counterpartyRole: "HR and People Ops Manager",
    address: "people-ops@demo.invalid",
    subject: "The office team and the warehouse team, separately",
    body: "A site with both an office sales team and a warehouse crew usually has two groups who never celebrate together, and the warehouse one is almost always the one that gets missed. A venue opens on West Birch Street this year that can take either, on a weekday, at a time that suits a shift.",
    summarised: false,
    effect: {
      note: "First touch, aimed at the group that normally gets left out.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-tyc-2",
    prospectId: "tyc-americas-headquarters",
    direction: "inbound",
    channel: "email",
    at: "2026-09-15T11:50:00-07:00",
    counterpartyRole: "HR and People Ops Manager",
    address: "people-ops@demo.invalid",
    subject: "Re: The office team and the warehouse team, separately",
    body: "What is the cost per person? I need a number to put in a request, not a conversation.",
    summarised: false,
    effect: {
      note: "The whole enquiry is a price question, and there is no published price to answer it with.",
      movedStatusTo: "conversation",
      signals: ["asked-for-a-price"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-tyc-3",
    prospectId: "tyc-americas-headquarters",
    direction: "outbound",
    channel: "email",
    at: "2026-09-15T16:30:00-07:00",
    counterpartyRole: "HR and People Ops Manager",
    address: "people-ops@demo.invalid",
    subject: "A number you can put in a request",
    body: "Main Event publishes no corporate price anywhere on its site; every group page says to contact the local sales manager, which is the job I am applying the same standard to here. Tell me a headcount and a day part and you will have a written figure this week that holds long enough to go through a request. The only published per-head number I can point at is the food floor, which starts at 14 dollars a person, and it is Main Event's own figure on its own page.",
    summarised: false,
    effect: {
      note: "Gave the one published number that exists and refused to invent the one that does not. Nothing back since.",
    },
    provenance: ILLUSTRATIVE,
  },

  // Karman Space and Defense. A badge reader, and a routing correction
  // from the only person a visitor can actually reach.
  {
    id: "msg-karman-1",
    prospectId: "karman-space-defense",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-09T13:10:00-07:00",
    counterpartyRole: "HR and People Ops Manager",
    subject: "Company contact form",
    body: "A defence manufacturer holding on to skilled machinists in a tight labour market spends on recognition because it is cheaper than recruitment. Asked who owns that spend.",
    summarised: false,
    effect: {
      note: "First touch through the only written route published.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-karman-2",
    prospectId: "karman-space-defense",
    direction: "outbound",
    channel: "in-person",
    at: "2026-09-17T11:30:00-07:00",
    counterpartyRole: "Front desk",
    body: "Saturn Street go-see. Reception is behind a badge reader and visitors do not get past it without an appointment. The receptionist took a card and said facilities books anything that happens off site, not HR.",
    summarised: true,
    effect: {
      note: "The visit did not reach a buyer and it corrected the target, which is worth the twenty minutes it cost.",
      requeue: "wrong-person",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-karman-3",
    prospectId: "karman-space-defense",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-18T09:00:00-07:00",
    counterpartyRole: "Facilities Manager",
    subject: "Company contact form",
    body: "Resubmitted addressed to facilities rather than to HR, per the front desk.",
    summarised: false,
    effect: {
      note: "Second attempt, aimed correctly this time. Nothing back yet.",
    },
    provenance: ILLUSTRATIVE,
  },

  // Avery Products. An absence reply and nothing else.
  {
    id: "msg-avery-1",
    prospectId: "avery-products-corporation",
    direction: "outbound",
    channel: "email",
    at: "2026-09-14T09:40:00-07:00",
    counterpartyRole: "Office Manager",
    address: "brea-office@demo.invalid",
    subject: "Pointe Drive, and a venue on the same side of town",
    body: "Four organisations already on this desk's route sit in the same office cluster, so this costs nothing to add. A venue opens on West Birch Street this year with weekday daytime hours nobody has claimed.",
    summarised: false,
    effect: {
      note: "First touch, sent because the route passes the door anyway.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-avery-2",
    prospectId: "avery-products-corporation",
    direction: "inbound",
    channel: "email",
    at: "2026-09-14T09:41:00-07:00",
    counterpartyRole: "Office Manager",
    address: "brea-office@demo.invalid",
    subject: "Automatic reply: out of office",
    body: "Out of the office with limited access to email until 28 September.",
    summarised: false,
    effect: {
      note: "Requeued to the 28th. Not a signal in either direction, and the record should not be allowed to look worked because a robot answered.",
      requeue: "out-of-office",
    },
    provenance: ILLUSTRATIVE,
  },

  // Ultimate Staffing. Worth more as a route into the corporate lane
  // than as a booking of its own.
  {
    id: "msg-ultimate-1",
    prospectId: "ultimate-staffing-services-brea",
    direction: "outbound",
    channel: "email",
    at: "2026-09-10T10:10:00-07:00",
    counterpartyRole: "Branch Manager",
    address: "brea-branch@demo.invalid",
    subject: "You know which Brea employers are having a good year",
    body: "This is only half a booking conversation. A staffing branch knows which local employers are hiring and growing before anybody else does, and those are exactly the companies that book a party in December. I would rather be useful to you than sell you eight covers.",
    summarised: false,
    effect: {
      note: "Opened as a referral conversation, which is what this row is actually for.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-ultimate-2",
    prospectId: "ultimate-staffing-services-brea",
    direction: "inbound",
    channel: "email",
    at: "2026-09-16T09:20:00-07:00",
    counterpartyRole: "Branch Manager",
    address: "brea-branch@demo.invalid",
    subject: "Re: You know which Brea employers are having a good year",
    body: "Happy to meet. We are appointment only so do not just turn up. Thursday mornings are usually clear and I would want to understand what I am recommending before I recommend it.",
    summarised: false,
    effect: {
      note: "A meeting agreed, with an explicit warning that a cold go-see would have found a locked door.",
      movedStatusTo: "conversation",
      signals: ["agreed-to-meet"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-ultimate-3",
    prospectId: "ultimate-staffing-services-brea",
    direction: "outbound",
    channel: "email",
    at: "2026-09-16T14:45:00-07:00",
    counterpartyRole: "Branch Manager",
    address: "brea-branch@demo.invalid",
    subject: "Thursday, and a hard hat when there is one",
    body: "Thursday works. When the site allows visitors I will walk you round it in a hard hat, because you will not recommend a building you have not seen and you should not.",
    summarised: false,
    effect: {
      note: "Tour offered to a referral partner rather than to a buyer, which is where it earns the most.",
      offerExtensionId: "offx-ultimate-tour",
    },
    provenance: ILLUSTRATIVE,
  },

  // Target. The largest single employer on the street, and the
  // approval is not on the street.
  {
    id: "msg-target-1",
    prospectId: "target-brea",
    direction: "outbound",
    channel: "in-person",
    at: "2026-09-15T10:30:00-07:00",
    counterpartyRole: "Store Director",
    body: "East Birch route. Asked at guest services for the store director, who was in a district call. The HR team leader came out instead, took the details and said team appreciation is a real budget line but that nothing above a small amount is signed in the building.",
    summarised: true,
    effect: {
      note: "Reached a real person, learned the budget exists, and learned it is not theirs to spend. That is a chain in one paragraph.",
      movedStatusTo: "reached-out",
      requeue: "decision-off-site",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-target-2",
    prospectId: "target-brea",
    direction: "outbound",
    channel: "in-person",
    at: "2026-09-22T09:45:00-07:00",
    counterpartyRole: "HR Team Leader",
    body: "Second pass on the same route. The HR team leader remembered the conversation, said the store cannot release everybody at once so it would be a department at a time, and offered to raise it with the district in October.",
    summarised: true,
    effect: {
      note: "A repeat booking shape rather than a single party, and a named month for the decision to be possible in.",
      requeue: "come-back-later",
      signals: ["named-a-headcount"],
    },
    provenance: ILLUSTRATIVE,
  },

  // Sprouts. A brush-off at a service desk, recorded rather than
  // rounded up into a conversation.
  {
    id: "msg-sprouts-1",
    prospectId: "sprouts-farmers-market-brea",
    direction: "outbound",
    channel: "in-person",
    at: "2026-09-15T11:10:00-07:00",
    counterpartyRole: "Store Manager",
    body: "Same route, four doors down. The store manager was on the floor and gave it about ninety seconds. Said to email the store's general inbox, which is not published anywhere, and went back to a delivery.",
    summarised: true,
    effect: {
      note: "A brush-off, and the only route offered does not exist. Recorded as touched rather than as interested.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },

  // Samyang America. A form, and silence.
  {
    id: "msg-samyang-1",
    prospectId: "samyang-america-inc",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-11T10:00:00-07:00",
    counterpartyRole: "HR and People Ops Manager",
    subject: "Company contact form",
    body: "A young commercial team that celebrates retail wins and onboards in cohorts has more reasons to book than one December party. Asked who owns that spend and whether the team is growing.",
    summarised: false,
    effect: {
      note: "First touch through a corporate form. Twelve days, nothing back, and no way to tell whether anybody read it.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
];

// ---------------------------------------------------------------
// The go-see cohort
// ---------------------------------------------------------------

/*
  Retail, food and auto service, where twenty-seven of thirty-three
  organisations publish no email at all and the only route in is the
  door. These threads are mostly `in-person` and mostly summaries
  written afterwards, which is exactly what a route sheet produces.

  Read the requeue reasons down this group. The independent shops answer
  on the spot because the owner is behind the till; the chains want the
  night and cannot approve it, because the budget line sits with a
  region. That is the organisation type filter doing real work rather
  than colouring a chip.
*/
const FIELD: ConversationMessage[] = [
  // Boba Flip. One of five organisations in the retail cohort that
  // publishes an email at all, and the fastest yes on the board.
  {
    id: "msg-bobaflip-1",
    prospectId: "boba-flip",
    direction: "outbound",
    channel: "email",
    at: "2026-09-14T09:00:00-07:00",
    counterpartyRole: "Owner and Store Manager",
    address: "shop-owner@demo.invalid",
    subject: "Your crew works every night everyone else is out",
    body: "Three quarters of a mile down Brea Boulevard from a venue that opens this year. A shop this size cannot give its staff much, and a weekday afternoon before the counter gets busy is the one night they can all make.",
    summarised: false,
    effect: {
      note: "First touch, written to one person who is the entire approval chain.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-bobaflip-2",
    prospectId: "boba-flip",
    direction: "inbound",
    channel: "email",
    at: "2026-09-16T21:40:00-07:00",
    counterpartyRole: "Owner and Store Manager",
    address: "shop-owner@demo.invalid",
    subject: "Re: Your crew works every night everyone else is out",
    body: "How much for about ten of us on a Tuesday afternoon, and when do you actually open? My staff will want to know both.",
    summarised: false,
    effect: {
      note: "Replied at twenty to ten at night, which is when a shop owner does admin, and asked both of the only two questions that matter.",
      movedStatusTo: "conversation",
      signals: ["asked-for-a-price", "named-a-headcount", "asked-for-a-date"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-bobaflip-3",
    prospectId: "boba-flip",
    direction: "outbound",
    channel: "email",
    at: "2026-09-17T08:20:00-07:00",
    counterpartyRole: "Owner and Store Manager",
    address: "shop-owner@demo.invalid",
    subject: "Ten on a Tuesday",
    body: "No opening date is published yet, so I will not give you one. Ten people on a weekday afternoon is small enough that I can agree a rate now and hold it for a year, which means whenever the doors open, the price you were quoted is the price.",
    summarised: false,
    effect: {
      note: "Rate lock offered against the exact day part the owner chose.",
      offerExtensionId: "offx-bobaflip-midweek",
    },
    provenance: ILLUSTRATIVE,
  },

  // Old Brea Chop House. A restaurant, a neighbour, and a referral
  // partner for the parties it cannot seat.
  {
    id: "msg-chophouse-1",
    prospectId: "old-brea-chop-house",
    direction: "outbound",
    channel: "email",
    at: "2026-09-14T10:15:00-07:00",
    counterpartyRole: "General Manager",
    address: "managers@demo.invalid",
    subject: "The parties you turn away",
    body: "A quarter of a mile apart and not really competitors. Your private dining room fills up and the enquiries that want bowling or a hundred and fifty covers have to go somewhere. I would send you the ones that want a steak.",
    summarised: false,
    effect: {
      note: "Opened on referral rather than on their staff night, because the referral is worth more.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-chophouse-2",
    prospectId: "old-brea-chop-house",
    direction: "inbound",
    channel: "email",
    at: "2026-09-18T16:05:00-07:00",
    counterpartyRole: "General Manager",
    address: "managers@demo.invalid",
    subject: "Re: The parties you turn away",
    body: "Fair point, we turn away the big corporate ones every December. Come and see me when the building is closer to finished. Who else downtown has committed?",
    summarised: false,
    effect: {
      note: "Warm, conditional on the building existing, and asking who else has signed. The social proof question again.",
      movedStatusTo: "conversation",
      signals: ["asked-who-else-has-booked"],
    },
    provenance: ILLUSTRATIVE,
  },

  // Bushfire Kitchen. Wanted it, could not sign it.
  {
    id: "msg-bushfire-1",
    prospectId: "bushfire-kitchen-brea",
    direction: "outbound",
    channel: "in-person",
    at: "2026-09-15T14:20:00-07:00",
    counterpartyRole: "General Manager",
    body: "Brea Marketplace route. The general manager walked out to the front of house and talked for ten minutes. Twenty-odd staff, all of them free on a Monday, and he liked the idea of walking them over on foot.",
    summarised: true,
    effect: {
      note: "A genuinely warm conversation in the building.",
      movedStatusTo: "conversation",
      signals: ["named-a-headcount"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-bushfire-2",
    prospectId: "bushfire-kitchen-brea",
    direction: "inbound",
    channel: "in-person",
    at: "2026-09-15T14:30:00-07:00",
    counterpartyRole: "General Manager",
    body: "Then said he cannot approve anything above a couple of hundred dollars without the franchise owner, who is not on site and who runs several stores. Offered to pass it on and did not offer a way to reach them directly.",
    summarised: true,
    effect: {
      note: "The single most common outcome in this cohort. Enthusiasm in the building, signature somewhere else, no route to the signature.",
      requeue: "decision-off-site",
    },
    provenance: ILLUSTRATIVE,
  },

  // Firestone. A corporate store, and the region owns the money.
  {
    id: "msg-firestone-1",
    prospectId: "firestone-complete-auto-care-brea",
    direction: "outbound",
    channel: "in-person",
    at: "2026-09-18T15:10:00-07:00",
    counterpartyRole: "Store Manager",
    body: "Imperial route. Caught the store manager between bays. Twelve technicians and service advisors, everyone finishes at the same hour every night, and he said nobody has ever taken them anywhere.",
    summarised: true,
    effect: {
      note: "First touch, and the only route in, because the brand publishes no store-level email anywhere in its site structure.",
      movedStatusTo: "reached-out",
      signals: ["named-a-headcount"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-firestone-2",
    prospectId: "firestone-complete-auto-care-brea",
    direction: "inbound",
    channel: "in-person",
    at: "2026-09-18T15:18:00-07:00",
    counterpartyRole: "Store Manager",
    body: "Said he would want to do it and that anything like this goes to the region. He has a small discretionary budget and this is not small enough to sit inside it. Suggested asking again in November when the region sets next year's numbers.",
    summarised: true,
    effect: {
      note: "Wanted, not approvable. Requeued to November with a reason rather than closed, and the useful next move is the region rather than the store.",
      requeue: "decision-off-site",
    },
    provenance: ILLUSTRATIVE,
  },

  // Big O Tires. Franchised, and the franchisee is local, which is the
  // difference between this row and the one above it.
  {
    id: "msg-bigo-1",
    prospectId: "big-o-tires-brea",
    direction: "outbound",
    channel: "in-person",
    at: "2026-09-21T10:20:00-07:00",
    counterpartyRole: "Store Manager and Franchise Owner",
    body: "Brea Boulevard route, half a mile from the venue. The owner was on site. Fifteen on the crew, all free after five every day, and he asked how much and when before I had finished the second sentence.",
    summarised: true,
    effect: {
      note: "An owner in the building, which is the whole reason the organisation type filter exists.",
      movedStatusTo: "conversation",
      signals: ["asked-for-a-price", "asked-for-a-date", "named-a-headcount"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-bigo-2",
    prospectId: "big-o-tires-brea",
    direction: "outbound",
    channel: "phone",
    at: "2026-09-22T14:00:00-07:00",
    counterpartyRole: "Store Manager and Franchise Owner",
    body: "Called back with what I could actually say: no published price, no published opening date, and first pick of any date in opening month held at no cost until there is one. He asked me to call again once there is a date on the building.",
    summarised: true,
    effect: {
      note: "A held date put on the table and the conversation parked on the one blocker this desk cannot solve.",
      offerExtensionId: "offx-bigo-first-fifty",
      requeue: "come-back-later",
    },
    provenance: ILLUSTRATIVE,
  },

  // Kabuki. Multi unit, and the regional operator buys.
  {
    id: "msg-kabuki-1",
    prospectId: "kabuki-japanese-restaurant-brea",
    direction: "outbound",
    channel: "in-person",
    at: "2026-09-15T15:00:00-07:00",
    counterpartyRole: "General Manager",
    body: "Asked for the general manager mid-afternoon, which is the only hour a restaurant will talk to anybody. Crew of thirty plus. He said the regional operator buys for several stores at once and that a single store night would be unusual.",
    summarised: true,
    effect: {
      note: "The useful finding is that one conversation could cover several stores, and this is not the conversation.",
      movedStatusTo: "reached-out",
      requeue: "decision-off-site",
    },
    provenance: ILLUSTRATIVE,
  },

  // Piccolo Coffee. A brush-off, and it belongs on the board.
  {
    id: "msg-piccolo-1",
    prospectId: "piccolo-coffee",
    direction: "outbound",
    channel: "in-person",
    at: "2026-09-21T11:40:00-07:00",
    counterpartyRole: "Owner and Store Manager",
    body: "Called in during the Brea Boulevard route. The owner listened, said they are a five person shop and that everyone is finished by mid-afternoon anyway, and that they do not really do staff nights. Polite, and a no without the word.",
    summarised: true,
    effect: {
      note: "Recorded as a touch and not as a conversation. A board that quietly upgrades this kind of exchange is a board that lies by the end of the month.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },

  // Jax Auto. AAA approved, owner operated, and the owner asked a
  // buying question inside two minutes.
  {
    id: "msg-jax-1",
    prospectId: "jax-auto",
    direction: "outbound",
    channel: "in-person",
    at: "2026-09-21T09:30:00-07:00",
    counterpartyRole: "Owner",
    body: "Half a mile from the venue. The owner came out from under a car, listened to the whole thing, and asked what a Friday in December looks like for eight people and their partners.",
    summarised: true,
    effect: {
      note: "A small booking with an owner who can decide it standing in his own workshop.",
      movedStatusTo: "conversation",
      signals: ["asked-for-a-date", "named-a-headcount"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-jax-2",
    prospectId: "jax-auto",
    direction: "outbound",
    channel: "phone",
    at: "2026-09-22T16:40:00-07:00",
    counterpartyRole: "Owner",
    body: "Called back with December Fridays and the honest caveat that there is no published opening date. He said to try him again in a month and that he is not going anywhere.",
    summarised: true,
    effect: {
      note: "Second touch, parked on the opening date with a month named.",
      requeue: "come-back-later",
    },
    provenance: ILLUSTRATIVE,
  },

  // Taal. An owner who is also a source of leads.
  {
    id: "msg-taal-1",
    prospectId: "taal-cultural-cuisine-of-india",
    direction: "outbound",
    channel: "in-person",
    at: "2026-09-14T15:40:00-07:00",
    counterpartyRole: "Owner",
    body: "On the venue's own street. The owner books private dining for local companies himself and knows which ones are looking for somewhere different in December. More interested in that conversation than in his own staff night.",
    summarised: true,
    effect: {
      note: "A neighbour who fields the same enquiries this venue wants, which makes the referral worth more than the booking.",
      movedStatusTo: "conversation",
    },
    provenance: ILLUSTRATIVE,
  },

  // 24 Hour Fitness. Two bookings behind one conversation, and neither
  // of them is the general manager's to sign.
  {
    id: "msg-fitness24-1",
    prospectId: "24-hour-fitness-brea",
    direction: "outbound",
    channel: "in-person",
    at: "2026-09-22T10:15:00-07:00",
    counterpartyRole: "General Manager",
    body: "East Birch route. The general manager was covering the front desk. Two separate ideas landed: a staff night for the trainers and instructors, and a member social the club has an active reason to run. He said both would need the regional manager and that his own budget is for equipment.",
    summarised: true,
    effect: {
      note: "Two bookings identified and neither is approvable in the building.",
      movedStatusTo: "reached-out",
      requeue: "decision-off-site",
    },
    provenance: ILLUSTRATIVE,
  },

  // Valvoline. One store, and a district manager who runs several
  // inside this trade area.
  {
    id: "msg-valvoline-1",
    prospectId: "valvoline-instant-oil-change-fullerton",
    direction: "outbound",
    channel: "in-person",
    at: "2026-09-18T16:30:00-07:00",
    counterpartyRole: "Store Manager",
    body: "Last stop on the Fullerton route. Young hourly crew, high turnover, and the store manager said straight away that the district manager runs several sites nearby and would be the person to ask. Would not give a number for them.",
    summarised: true,
    effect: {
      note: "One conversation could become a multi-store ask, and the only route to it is a name nobody will hand over at a counter.",
      movedStatusTo: "reached-out",
      requeue: "decision-off-site",
    },
    provenance: ILLUSTRATIVE,
  },
];

// ---------------------------------------------------------------
// Practices, clubs and civic
// ---------------------------------------------------------------

/*
  The long tail of single-site organisations, worked in writing. This is
  where the "send me something in writing" reply lives, along with the
  two clearest losses on the board and the one prospect that is also a
  competitor.
*/
const LOCAL: ConversationMessage[] = [
  // Aloha Veterinary Hospital. A practice that closes as a unit, which
  // makes it one of the easiest bookings in the trade area.
  {
    id: "msg-aloha-1",
    prospectId: "aloha-veterinary-hospital",
    direction: "outbound",
    channel: "email",
    at: "2026-09-07T08:50:00-07:00",
    counterpartyRole: "Hospital Manager",
    address: "hospital-manager@demo.invalid",
    subject: "Closed at five and closed at weekends",
    body: "A practice that shuts at the same hour every weekday and does not open at weekends can take its whole team out on a Friday evening without leaving anybody behind, which most of the organisations on this list cannot.",
    summarised: false,
    effect: {
      note: "First touch, built on their published hours rather than on a generic pitch.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-aloha-2",
    prospectId: "aloha-veterinary-hospital",
    direction: "inbound",
    channel: "email",
    at: "2026-09-16T12:15:00-07:00",
    counterpartyRole: "Hospital Manager",
    address: "hospital-manager@demo.invalid",
    subject: "Re: Closed at five and closed at weekends",
    body: "There would be about eighteen of us with partners. What would that cost and are you open in December? The team has had a hard year and I would like to do something.",
    summarised: false,
    effect: {
      note: "A headcount, a price question and a date question in three lines, plus the reason they are buying.",
      movedStatusTo: "conversation",
      signals: ["named-a-headcount", "asked-for-a-price", "asked-for-a-date"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-aloha-3",
    prospectId: "aloha-veterinary-hospital",
    direction: "outbound",
    channel: "email",
    at: "2026-09-16T17:00:00-07:00",
    counterpartyRole: "Hospital Manager",
    address: "hospital-manager@demo.invalid",
    subject: "Eighteen plus partners, and what December depends on",
    body: "December depends on an opening date that has not been published, so I will not sell you one. What I can do is hold a December Friday at no cost, releasing itself if the opening moves, so you can tell the team something is booked without either of us pretending. A written quote follows once you confirm the numbers.",
    summarised: false,
    effect: {
      note: "Hold offered against the date they asked about. The record now waits on them.",
      offerExtensionId: "offx-aloha-first-fifty",
    },
    provenance: ILLUSTRATIVE,
  },

  // Brea Dentistry. Send me something in writing, which is a real
  // answer and a weaker one than it sounds.
  {
    id: "msg-breadentistry-1",
    prospectId: "brea-dentistry",
    direction: "outbound",
    channel: "email",
    at: "2026-09-09T09:20:00-07:00",
    counterpartyRole: "Practice Manager",
    address: "appointments@demo.invalid",
    subject: "An evening the whole practice can make",
    body: "A practice with a monitored inbox is a practice where a message reaches the person who controls the schedule, which is rarer than it should be. A venue opens in Brea this year and the December evenings are not spoken for.",
    summarised: false,
    effect: {
      note: "First touch.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-breadentistry-2",
    prospectId: "brea-dentistry",
    direction: "inbound",
    channel: "email",
    at: "2026-09-13T10:00:00-07:00",
    counterpartyRole: "Practice Manager",
    address: "appointments@demo.invalid",
    subject: "Re: An evening the whole practice can make",
    body: "Send me something in writing and I will put it in front of the dentist when he is next in the office.",
    summarised: false,
    effect: {
      note: "A reply that moves the record and commits to nothing. The person who can say yes has still not seen it.",
      movedStatusTo: "conversation",
      signals: ["asked-for-it-in-writing"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-breadentistry-3",
    prospectId: "brea-dentistry",
    direction: "outbound",
    channel: "email",
    at: "2026-09-13T15:30:00-07:00",
    counterpartyRole: "Practice Manager",
    address: "appointments@demo.invalid",
    subject: "One page, for the dentist",
    body: "Written so it can be forwarded without editing. No price is published for the corporate packages and I have said so in it rather than leaving a gap somebody has to ask about.",
    summarised: false,
    effect: {
      note: "Sent the same day. Ten days of silence since, which is longer than a live conversation is allowed to sit.",
    },
    provenance: ILLUSTRATIVE,
  },

  // Cogir of Brea. A real answer with a date attached to it.
  {
    id: "msg-cogir-1",
    prospectId: "cogir-of-brea",
    direction: "outbound",
    channel: "phone",
    at: "2026-09-17T10:40:00-07:00",
    counterpartyRole: "Executive Director",
    body: "Called the community. The executive director took it. Dining, activities and care teams all work weekends and holidays, so the appreciation event happens off peak by necessity rather than by preference.",
    summarised: true,
    effect: {
      note: "First touch by phone, because there is no published address and a senior living community does not want a cold visitor.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-cogir-2",
    prospectId: "cogir-of-brea",
    direction: "inbound",
    channel: "phone",
    at: "2026-09-17T10:48:00-07:00",
    counterpartyRole: "Executive Director",
    body: "Said the budget for next year is set in November and there is no point discussing anything before it. Asked to be called back in the first week of November and meant it.",
    summarised: true,
    effect: {
      note: "A real answer with a date on it. Diary the window rather than the follow-up, and stop touching this record until then.",
      requeue: "come-back-later",
    },
    provenance: ILLUSTRATIVE,
  },

  // North Orange County Martial Arts. The social proof question, from
  // a school that will not be first.
  {
    id: "msg-nocma-1",
    prospectId: "north-orange-county-martial-arts",
    direction: "outbound",
    channel: "email",
    at: "2026-09-08T09:10:00-07:00",
    counterpartyRole: "Programme Director",
    address: "programme-director@demo.invalid",
    subject: "Between belt cycles",
    body: "A school that already budgets for student appreciation between belt cycles has the occasion; the only question is where. A venue opens four miles away this year and can take a whole student body plus parents at once.",
    summarised: false,
    effect: {
      note: "First touch.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-nocma-2",
    prospectId: "north-orange-county-martial-arts",
    direction: "inbound",
    channel: "email",
    at: "2026-09-15T19:30:00-07:00",
    counterpartyRole: "Programme Director",
    address: "programme-director@demo.invalid",
    subject: "Re: Between belt cycles",
    body: "Which other schools have booked with you? We usually go where the other academies go and I would rather not be the first to try somewhere.",
    summarised: false,
    effect: {
      note: "The social proof question asked plainly. The honest answer is one taekwondo school, and that answer is worth more than a vague one.",
      movedStatusTo: "conversation",
      signals: ["asked-who-else-has-booked"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-nocma-3",
    prospectId: "north-orange-county-martial-arts",
    direction: "outbound",
    channel: "email",
    at: "2026-09-16T08:40:00-07:00",
    counterpartyRole: "Programme Director",
    address: "programme-director@demo.invalid",
    subject: "One, and I will not pretend it is more",
    body: "One taekwondo school has signed for a belt test celebration in December and a Christian school has bought a voucher block. That is the whole list and I would rather give you it than a number I cannot name.",
    summarised: false,
    effect: {
      note: "Answered with the true count instead of a comfortable one. Nothing back in a week.",
    },
    provenance: ILLUSTRATIVE,
  },

  // Placentia Chamber. A room full of small employers, and a meeting.
  {
    id: "msg-placentia-1",
    prospectId: "placentia-chamber-of-commerce",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-09T14:00:00-07:00",
    counterpartyRole: "Chamber Executive Director",
    subject: "Chamber contact form",
    body: "Members here are the small employers who each need one thirty-person party a year, which is exactly the size of booking this venue will want in its first quarter and exactly the size nobody else chases.",
    summarised: false,
    effect: {
      note: "First touch through the chamber's form.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-placentia-2",
    prospectId: "placentia-chamber-of-commerce",
    direction: "inbound",
    channel: "email",
    at: "2026-09-14T11:20:00-07:00",
    counterpartyRole: "Chamber Executive Director",
    address: "chamber-office@demo.invalid",
    subject: "Re: Chamber contact form",
    body: "Come to the October breakfast as a guest and say two minutes about it. Members will ask when you open, so have an answer.",
    summarised: false,
    effect: {
      note: "A date in a diary, and a warning attached to it about the question this desk cannot answer.",
      movedStatusTo: "conversation",
      signals: ["agreed-to-meet"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-placentia-3",
    prospectId: "placentia-chamber-of-commerce",
    direction: "outbound",
    channel: "email",
    at: "2026-09-14T16:00:00-07:00",
    counterpartyRole: "Chamber Executive Director",
    address: "chamber-office@demo.invalid",
    subject: "October breakfast, and the answer I will give",
    body: "I will be there. When they ask when we open I will say that no date has been published and that I will not guess, and then I will offer them a held date that costs nothing and releases itself. That is a better two minutes than a fake date.",
    summarised: false,
    effect: {
      note: "Confirmed, with the objection handling agreed in advance rather than improvised in a room.",
    },
    provenance: ILLUSTRATIVE,
  },

  // The Phoenix Club. A no, and a good one.
  {
    id: "msg-phoenix-1",
    prospectId: "the-phoenix-club",
    direction: "outbound",
    channel: "phone",
    at: "2026-09-11T13:00:00-07:00",
    counterpartyRole: "Event and Banquet Sales Manager",
    body: "Called the club. Asked about overflow dates and about the board's own socials, on the theory that a club which books out its own hall has nights it cannot take.",
    summarised: true,
    effect: {
      note: "First touch, pitched at the overflow rather than at the club's core calendar.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-phoenix-2",
    prospectId: "the-phoenix-club",
    direction: "inbound",
    channel: "phone",
    at: "2026-09-11T13:06:00-07:00",
    counterpartyRole: "Event and Banquet Sales Manager",
    body: "Polite and immediate. They run a banquet hall themselves, members expect events to be at the club, and sending business to another venue is not something they do. Said no to the overflow idea as well.",
    summarised: true,
    effect: {
      note: "A clean no with a reason that will not change, from an organisation that is a competitor as much as a prospect. Recorded rather than left hopeful.",
      movedStatusTo: "lost",
      signals: ["said-no"],
    },
    provenance: ILLUSTRATIVE,
  },

  // Southlands Church. A campus, and the campus does not decide.
  {
    id: "msg-southlands-1",
    prospectId: "southlands-church-brea",
    direction: "outbound",
    channel: "email",
    at: "2026-09-10T11:15:00-07:00",
    counterpartyRole: "Campus Pastor",
    address: "campus-office@demo.invalid",
    subject: "No hall of your own, which is the point",
    body: "A campus meeting in leased space has to rent somewhere for student nights and volunteer thank-yous. A venue ten minutes away opens this year and its weekday evenings are empty.",
    summarised: false,
    effect: {
      note: "First touch, built on the one fact that makes this campus different from a church with its own building.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-southlands-2",
    prospectId: "southlands-church-brea",
    direction: "inbound",
    channel: "email",
    at: "2026-09-16T08:30:00-07:00",
    counterpartyRole: "Campus Pastor",
    address: "campus-office@demo.invalid",
    subject: "Re: No hall of your own, which is the point",
    body: "Student nights are programmed centrally across all our campuses, so this is not mine to book. I can pass it to the central student ministries team but they plan the year in January.",
    summarised: false,
    effect: {
      note: "A multi site church behaves like a chain, which is the whole reason the organisation type is a separate field from the lane.",
      requeue: "decision-off-site",
    },
    provenance: ILLUSTRATIVE,
  },

  // Credit Union of Southern California. A branch, and the branch does
  // not hold the budget either.
  {
    id: "msg-cusocal-1",
    prospectId: "credit-union-of-southern-california-brea-branch",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-14T13:40:00-07:00",
    counterpartyRole: "Branch Manager",
    subject: "Branch contact form",
    body: "A branch with a small team to thank and a member outreach mandate has two reasons to use a venue rather than one. Asked which of the two, if either, the branch manager can approve.",
    summarised: false,
    effect: {
      note: "First touch, written to find the approval line rather than to sell.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-cusocal-2",
    prospectId: "credit-union-of-southern-california-brea-branch",
    direction: "inbound",
    channel: "email",
    at: "2026-09-21T15:10:00-07:00",
    counterpartyRole: "Branch Manager",
    address: "branch-office@demo.invalid",
    subject: "Re: Branch contact form",
    body: "Branch team events come out of a regional budget and member events are run by marketing at head office. Neither is mine. I have forwarded it to both.",
    summarised: false,
    effect: {
      note: "Neither budget is in the building, and the forward is the only thing that happened. Requeued rather than closed.",
      requeue: "decision-off-site",
    },
    provenance: ILLUSTRATIVE,
  },

  // Sell My Home Real Estate. Booked elsewhere in July, which is the
  // answer nobody wants and everybody needs to hear early.
  {
    id: "msg-sellmyhome-1",
    prospectId: "sell-my-home-real-estate",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-16T10:50:00-07:00",
    counterpartyRole: "Broker and Team Lead",
    subject: "Brokerage contact form",
    body: "Past-client appreciation is how a referral pipeline gets fed, and a games venue is a better room for it than a restaurant because people actually talk to each other.",
    summarised: false,
    effect: {
      note: "First touch.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-sellmyhome-2",
    prospectId: "sell-my-home-real-estate",
    direction: "inbound",
    channel: "email",
    at: "2026-09-18T09:05:00-07:00",
    counterpartyRole: "Broker and Team Lead",
    address: "broker-office@demo.invalid",
    subject: "Re: Brokerage contact form",
    body: "We already booked our client event elsewhere back in July and it is paid for. Ask me again next summer.",
    summarised: false,
    effect: {
      note: "Lost on timing rather than on merit. They committed two months before this venue had anybody to ask them, which is the argument for building the book early rather than a failure of the pitch.",
      movedStatusTo: "lost",
      signals: ["booked-elsewhere"],
    },
    provenance: ILLUSTRATIVE,
  },

  // Schrimmer and Cavanagh. An independent agency, and the principal
  // asked for a date on the first reply.
  {
    id: "msg-schrimmer-1",
    prospectId: "schrimmer-cavanagh-insurance-agency-inc",
    direction: "outbound",
    channel: "email",
    at: "2026-09-11T08:30:00-07:00",
    counterpartyRole: "Agency Principal and Owner",
    address: "agency-office@demo.invalid",
    subject: "A client night that renews commercial accounts",
    body: "A relationship shop renews its commercial book face to face, and a client night is the cheapest version of face to face there is. A venue opens a mile away this year with a room and lanes in the same building.",
    summarised: false,
    effect: {
      note: "First touch, framed as a retention tool rather than as a party.",
      movedStatusTo: "reached-out",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-schrimmer-2",
    prospectId: "schrimmer-cavanagh-insurance-agency-inc",
    direction: "inbound",
    channel: "email",
    at: "2026-09-19T10:30:00-07:00",
    counterpartyRole: "Agency Principal and Owner",
    address: "agency-office@demo.invalid",
    subject: "Re: A client night that renews commercial accounts",
    body: "What dates do you have in the first quarter? We close on Fridays so a Thursday evening would suit us and about thirty clients.",
    summarised: false,
    effect: {
      note: "A date question, a day part and a headcount, unprompted, from the person who signs.",
      movedStatusTo: "conversation",
      signals: ["asked-for-a-date", "named-a-headcount"],
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-schrimmer-3",
    prospectId: "schrimmer-cavanagh-insurance-agency-inc",
    direction: "outbound",
    channel: "email",
    at: "2026-09-19T14:20:00-07:00",
    counterpartyRole: "Agency Principal and Owner",
    address: "agency-office@demo.invalid",
    subject: "First quarter Thursdays",
    body: "Every Thursday in the opening quarter is available, because nothing is booked at all yet. I would rather tell you that than pretend at scarcity. Pick one and I will hold it at no cost until there is an opening date to hold it against.",
    summarised: false,
    effect: {
      note: "Told the truth about an empty calendar instead of manufacturing urgency, and offered the hold.",
      offerExtensionId: "offx-schrimmer-first-fifty",
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
 * Built once at module load rather than filtered per render. At two
 * hundred and eleven organisations either would be fine; the reason to
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
 * Every row points at an id in OFFERS and none of them invents a
 * discount, because Main Event publishes no corporate price to discount.
 * The cost to the venue is not restated here; it is read off the offer
 * itself so the two cannot drift apart, and three of the four offers in
 * that catalogue cost nothing at all. The one that does cost something
 * is Spirit Night, where the 20 per cent is Main Event's own published
 * figure rather than anything negotiated here.
 *
 * Note how many say "open". An offer nobody answered is not a soft yes;
 * it is a thing this desk gave away for free and has not been paid for
 * in either attention or a date, and it should read as pressure on the
 * next follow-up rather than as progress.
 */
export const OFFER_EXTENSIONS: OfferExtension[] = [
  {
    id: "offx-heights-spirit",
    prospectId: "heights-christian-schools-brea-campus",
    offerId: "spirit-night-first-quarter",
    messageId: "msg-heights-3",
    extendedAt: "2026-09-06T08:50:00-07:00",
    toRole: "Director of Advancement",
    state: "declined",
    stateNote:
      "Declined in favour of the voucher block, which is a school choosing to resell rather than to run a night. The offer was not the reason this closed and it is recorded so the offer is not credited with the win.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "offx-beckman-first-fifty",
    prospectId: "beckman-coulter-inc",
    offerId: "first-fifty",
    messageId: "msg-beckman-4",
    extendedAt: "2026-09-09T10:30:00-07:00",
    toRole: "Site events lead",
    state: "accepted",
    stateNote:
      "Taken. 11 December is held against no deposit while procurement runs, which is the largest date on the board sitting on the weakest kind of commitment.",
    expiresAt: "2026-10-09T10:00:00-07:00",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "offx-cause-first-fifty",
    prospectId: "the-cause-church-brea",
    offerId: "first-fifty",
    messageId: "msg-cause-2",
    extendedAt: "2026-09-11T09:50:00-07:00",
    toRole: "Student ministries pastor",
    state: "accepted",
    stateNote:
      "Taken. 18 December is held and cannot be signed until the elders meet in October, which is a blocker with a date rather than a stall.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "offx-viewsonic-midweek",
    prospectId: "viewsonic-corporation",
    offerId: "midweek-daytime-lock",
    messageId: "msg-viewsonic-2",
    extendedAt: "2026-09-03T15:30:00-07:00",
    toRole: "Regional HR business partner",
    state: "open",
    stateNote:
      "Extended inside the response commitment and never answered. Twenty days open is not a soft yes; it is a thing given away for free that has not bought a reply.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "offx-chamber-tour",
    prospectId: "brea-chamber-of-commerce",
    offerId: "founding-partner-tour",
    messageId: "msg-chamber-3",
    extendedAt: "2026-09-15T15:00:00-07:00",
    toRole: "Chamber President and CEO",
    state: "open",
    stateNote:
      "Accepted in principle at the mixer and not yet dated, because the site will not take visitors. Costs an hour and whatever the general contractor says about hard hats.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "offx-embassy-tour",
    prospectId: "embassy-suites-by-hilton-brea-north-orange-count",
    offerId: "founding-partner-tour",
    messageId: "msg-embassy-3",
    extendedAt: "2026-09-15T12:15:00-07:00",
    toRole: "Director of sales",
    state: "accepted",
    stateNote:
      "Accepted, and gated on the site allowing visitors. The hospitality lane converts on the tour and almost nowhere else, so this one is worth chasing the contractor for.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "offx-bgc-spirit",
    prospectId: "boys-girls-club-brea-placentia-yorba-linda",
    offerId: "spirit-night-first-quarter",
    messageId: "msg-bgc-3",
    extendedAt: "2026-09-17T14:20:00-07:00",
    toRole: "Programme Director",
    state: "open",
    stateNote:
      "On the table alongside the held date. This is the only offer in the catalogue quoting a figure Main Event publishes itself, so it needs nobody's approval and cannot be withdrawn later.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "offx-boh-first-fifty",
    prospectId: "brea-olinda-high-school",
    offerId: "first-fifty",
    messageId: "msg-boh-4",
    extendedAt: "2026-09-17T09:05:00-07:00",
    toRole: "Assistant Principal for Activities and Athletics",
    state: "accepted",
    stateNote:
      "Taken on the follow-up call. 12 June is held at no cost and the committee will not sign against it until an opening date exists.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "offx-bousd-midweek",
    prospectId: "brea-olinda-unified-school-district",
    offerId: "midweek-daytime-lock",
    messageId: "msg-bousd-5",
    extendedAt: "2026-09-18T16:05:00-07:00",
    toRole: "Executive Assistant, HR Certificated",
    state: "open",
    stateNote:
      "Extended so the district has a figure to put in the spring budget cycle. Unanswered, and the vendor paperwork is the real gate rather than the rate.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "offx-silverado-midweek",
    prospectId: "silverado-brea-memory-care-community",
    offerId: "midweek-daytime-lock",
    messageId: "msg-silverado-3",
    extendedAt: "2026-09-18T14:30:00-07:00",
    toRole: "Administrator and HR Manager",
    state: "open",
    stateNote:
      "Open, and the person it was made to is on leave until 5 October. Nothing is wrong here; the clock is simply not theirs.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "offx-bjj-first-fifty",
    prospectId: "brea-jiu-jitsu",
    offerId: "first-fifty",
    messageId: "msg-bjj-2",
    extendedAt: "2026-09-17T13:55:00-07:00",
    toRole: "Academy owner",
    state: "open",
    stateNote:
      "Offered on the call and never taken up. He asked twice whether the building would be open, which is the objection this offer exists to answer, so its going unanswered is a real signal.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "offx-ultimate-tour",
    prospectId: "ultimate-staffing-services-brea",
    offerId: "founding-partner-tour",
    messageId: "msg-ultimate-3",
    extendedAt: "2026-09-16T14:45:00-07:00",
    toRole: "Branch Manager",
    state: "open",
    stateNote:
      "Offered to a referral partner rather than to a buyer. It costs an hour and it is aimed at somebody who will repeat what they saw to every employer they place staff with.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "offx-bobaflip-midweek",
    prospectId: "boba-flip",
    offerId: "midweek-daytime-lock",
    messageId: "msg-bobaflip-3",
    extendedAt: "2026-09-17T08:20:00-07:00",
    toRole: "Owner and Store Manager",
    state: "open",
    stateNote:
      "A rate held for a year for a ten person weekday afternoon. It trades a peak-hour price this group was never going to pay against certainty on hours that would otherwise be empty.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "offx-bigo-first-fifty",
    prospectId: "big-o-tires-brea",
    offerId: "first-fifty",
    messageId: "msg-bigo-2",
    extendedAt: "2026-09-22T14:00:00-07:00",
    toRole: "Store Manager and Franchise Owner",
    state: "open",
    stateNote:
      "Open, and parked by him rather than by this desk. He asked to be called once there is a date on the building, which is the correct next action and not a follow-up email.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "offx-aloha-first-fifty",
    prospectId: "aloha-veterinary-hospital",
    offerId: "first-fifty",
    messageId: "msg-aloha-3",
    extendedAt: "2026-09-16T17:00:00-07:00",
    toRole: "Hospital Manager",
    state: "open",
    stateNote:
      "Offered against the December Friday they asked about. Unanswered for a week, which for a practice that wanted to do something for its team reads as a diary problem rather than a no.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "offx-schrimmer-first-fifty",
    prospectId: "schrimmer-cavanagh-insurance-agency-inc",
    offerId: "first-fifty",
    messageId: "msg-schrimmer-3",
    extendedAt: "2026-09-19T14:20:00-07:00",
    toRole: "Agency Principal and Owner",
    state: "open",
    stateNote:
      "Every Thursday in the opening quarter offered, with the empty calendar stated plainly rather than dressed up as scarcity.",
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
