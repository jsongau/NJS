import type {
  ConversationMessage,
  OfferExtension,
} from "@/domain/types";

/**
 * THE THREADS. What was actually said, to whom, and what it changed.
 *
 * WHY THIS FILE EXISTS. Everything else in this application could tell
 * you where three hundred and twenty nine organisations stand. None of it could
 * tell you what any of them said. A status chip that reads "In conversation"
 * with nothing behind it is a rep's memory written down badly, and the
 * first question anybody asks when they open a record is not "what stage
 * is this", it is "what did they say, and when".
 *
 * So this is the message history: both directions, threaded per
 * organisation, with the channel on every row, because "we emailed twice
 * and then stood in their leasing office" and "we emailed four times"
 * produce the same touch count and describe completely different
 * situations.
 *
 * SIXTY OF THE TWO HUNDRED AND ELEVEN HAVE A THREAD. The other hundred
 * and fifty-one have nothing at all, and that is the honest shape of a
 * territory three and a half weeks into being worked by one person: a
 * hundred and fifty-six messages, a hundred and four of them outbound,
 * fifty-two back. Every screen that reads this file has to survive an
 * organisation with no history, because a hundred and fifty-one of them
 * have none.
 *
 * THIS IS NOT A FLATTERING PIPELINE, AND THAT IS THE ENTIRE POINT.
 *
 * Count what is in here before reading any of it. There are more silent
 * threads than warm ones. There are automatic absence replies from
 * offices that are genuinely dark for a fortnight, on-site managers who
 * wanted the agreement and could not sign it, a site lead who looks
 * after his own building and nothing else, a brokerage that signed a
 * referral arrangement with another company in July, and one college
 * whose own written question about a rebate sat unanswered for nineteen
 * days while this desk cold-emailed the same organisation about the
 * autumn heating campaign. Most published pipelines are a wall of
 * interested organisations, which is how a pipeline stops being a decision
 * tool and becomes a mood board. The failures are the rows that teach a
 * reader anything.
 *
 * OUT OF OFFICE AND WRONG PERSON ARE REQUEUES, NOT REJECTIONS. Both mean
 * try again, differently, and both are recorded as requeues rather than
 * as outcomes. They matter more in this territory than in most: a
 * property management office turns its staff over constantly, a school
 * or district front office is genuinely dark for a week at a time, and
 * the person who answers the phone at a managed site is almost never the
 * person who can sign a portfolio agreement. A tool that filed either as
 * a no would delete live records.
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
 * NO PRICE IS QUOTED THAT THE BRAND DOES NOT PUBLISH. Where a
 * counterparty asks what it costs, and thirteen of them do, the answer
 * in the thread is the true one: the two published consumer prices, the
 * 47 dollar cooling tune-up and the 47 dollar drain clearing, carried
 * fine print that ran out on 31 August 2026 and nothing has replaced
 * them; the membership club is named on the site with no price beside
 * it; and no portfolio or co-marketing rate is published anywhere in the
 * group. The only per-member figures published by any brand in the
 * family belong to two brands outside this territory, at 19.95 a month
 * in San Diego and 15 a month or 189 a year in the Coachella Valley.
 * There is no discount off a secret anywhere in this file.
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
 * date, a unit count or a sentence appears in one of those, it appears
 * here unchanged. A history that contradicted the board it belongs to
 * would be worse than no history.
 */
const WORKED: ConversationMessage[] = [
  // Brea Olinda High School. The anchor record, and the one held date
  // that exists because a community day happens whether anyone calls
  // or not.
  {
    id: "msg-boh-1",
    prospectId: "brea-olinda-high-school",
    direction: "outbound",
    channel: "email",
    at: "2026-09-02T09:10:00-07:00",
    counterpartyRole: "Assistant Principal for Activities and Athletics",
    address: "activities-office@demo.invalid",
    subject: "June community day, and holding a date before there is a campaign",
    body: "We are the heating and cooling brand on Columbia Street, about a mile from campus, and we sponsor two or three local events a year. No autumn or spring campaign has been published yet, which is the honest starting point for this conversation: the offer families would see in June is not written. What I can do now is hold a June date at no cost while the calendar is empty, and put the terms and the data handling in writing for the district. Is the community day committee meeting this term?",
    summarised: false,
    effect: {
      note: "Opened the thread and set the expectation that there is no published campaign to promise against.",
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
    subject: "Re: June community day, and holding a date before there is a campaign",
    body: "Following up once. If June is already committed elsewhere, the boosters' autumn programme is the more useful conversation and I would rather have that one than keep writing about June.",
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
    subject: "Re: June community day, and holding a date before there is a campaign",
    body: "Roughly 380 households on the boosters' mailing list. What would a June sponsorship cost us, and can you tell me the offer families see will definitely still be live by then? Quote the autumn programme separately, it comes out of a different account.",
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
    subject: "380 households in June, and what I can and cannot promise",
    body: "I cannot tell you what the offer will be in June, because the fine print on the two prices we did publish ran out on 31 August and nothing has been published to replace them. I am not going to invent a June price. What I can do is hold 12 June at no cost, with the hold releasing itself if the campaign lands somewhere else, so the committee is not carrying any risk for saying yes early. On cost: no sponsorship rate is published anywhere, so a real number needs your reach and what the boosters want in return, and I will put it in writing rather than say it on a call. Autumn programme quoted separately as asked.",
    summarised: false,
    effect: {
      note: "Answered the campaign question with a no, and put the hold on the table in its place.",
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
    body: "Called to confirm the hold. She took 12 June, said the committee will not sign anything until there is a published offer they can check, and asked for the terms and the data handling in writing so the district office can see them before the November board meeting.",
    summarised: true,
    effect: {
      note: "A date is held and nothing is signed. The written terms are now the only thing between this and an agreement.",
      movedStatusTo: "soft-hold",
      signals: ["held-a-date", "asked-for-it-in-writing"],
    },
    provenance: ILLUSTRATIVE,
  },

  // Brea Olinda Unified School District. A fortnight lost to a closed
  // office, which is the single most common failure mode in this cohort.
  {
    id: "msg-bousd-1",
    prospectId: "brea-olinda-unified-school-district",
    direction: "outbound",
    channel: "email",
    at: "2026-09-03T08:20:00-07:00",
    counterpartyRole: "Executive Assistant, HR Certificated",
    address: "hr-certificated@demo.invalid",
    subject: "The spring benefits fair, and the back to school staff week",
    body: "The district runs the classified benefits fair and the certificated welcome-back week centrally, which is why I am writing to you rather than to each school. We are the heating, cooling and plumbing brand on Columbia Street and we take a table at fairs like these. I would like ten minutes to understand how far ahead those two dates are budgeted and who approves an outside supplier.",
    summarised: false,
    effect: {
      note: "First touch, aimed at the office that plans both dates rather than at a campus.",
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
    subject: "The spring benefits fair, and the back to school staff week",
    body: "Resending now the office is back. Same question: how far ahead are the benefits fair and the welcome-back week budgeted, and who signs off an outside supplier?",
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
    subject: "Re: The spring benefits fair, and the back to school staff week",
    body: "The fair is April and it is budgeted in the spring cycle. We would be looking at about 120 classified staff, almost certainly across two sittings because the schools cannot all release people on the same afternoon. Everything goes on a purchase order and you would need to be set up as a district vendor first. What does the membership cost a member of staff?",
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
    body: "Two sittings suits both of us. On the membership: the club is named on our site with no price beside it, so I will not put a monthly figure in an email in September and change it in April. What I can do is agree a weekday daytime rate for staff households now and honour it for a year, which is the only way to give you a number you can take into the spring budget cycle. Send me whatever the vendor pack needs and I will start it this week rather than in March.",
    summarised: false,
    effect: {
      note: "Rate lock offered so the district can budget against something. Vendor paperwork started six months early on purpose.",
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
    counterpartyRole: "Employee Wellbeing and Benefits Coordinator",
    address: "employee-wellbeing@demo.invalid",
    subject: "A benefits fair table, and the rebates most staff have missed",
    body: "Most of your staff own or rent inside our service area, and most of them do not know that the federal credit for a heat pump ended for anything placed in service after 31 December 2025 while the gas utility rebate runs to the end of this year. That is a fifteen minute talk and a table rather than a sales pitch. Worth ten minutes?",
    summarised: false,
    effect: {
      note: "First touch into the office that owns the staff fair.",
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
    counterpartyRole: "Employee Wellbeing and Benefits Coordinator",
    address: "employee-wellbeing@demo.invalid",
    subject: "Re: A benefits fair table, and the rebates most staff have missed",
    body: "Send me something in writing I can put in front of the committee. We cannot pay a table fee on a card on the day, it has to be invoiced to the university, and that trips up most suppliers before we get anywhere near a date.",
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
    counterpartyRole: "Employee Wellbeing and Benefits Coordinator",
    address: "employee-wellbeing@demo.invalid",
    subject: "One page for the committee",
    body: "In the body rather than as a file so nobody has to open anything. Invoicing the university is normal and I will confirm the terms in writing before anything is held. Two hundred staff through a table in a morning is a number I can show you from other fairs rather than assert, and I would rather agree a date first and let the paperwork follow it.",
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
    counterpartyRole: "Employee wellbeing coordinator",
    address: "employee-wellbeing@demo.invalid",
    subject: "Brand enquiry form, submitted",
    body: "Planning an autumn resource fair for staff and want a home maintenance table. Budget for supplier tables is modest and per table. We would need an invoice to the university rather than a card on the day.",
    summarised: false,
    requestId: "req-07",
    effect: {
      note: "The same office came in again through the brand's own form with a date and a number attached. The written enquiry, not the email thread, is what carried the numbers.",
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
    counterpartyRole: "Employee benefits coordinator",
    address: "benefits-office@demo.invalid",
    subject: "Brea enquiry form, submitted",
    body: "Asked which heat pump and water heater rebates staff households can still claim this year, after somebody on campus was told the federal credit had gone, and whether anybody would come and explain it at a staff session.",
    summarised: false,
    requestId: "req-24",
    effect: {
      note: "Nobody replied. Nineteen days later nobody has replied, and it is a question this desk can answer in four sentences. This is the most valuable row on the board and no stored task list would ever have shown it to anybody.",
    },
    provenance: ILLUSTRATIVE,
  },
  {
    id: "msg-fc-2",
    prospectId: "fullerton-college",
    direction: "outbound",
    channel: "email",
    at: "2026-09-19T11:20:00-07:00",
    counterpartyRole: "Employee Benefits and Wellbeing Coordinator",
    address: "benefits-office@demo.invalid",
    subject: "Heating season, and a table at the staff fair",
    body: "Most of your staff commute through our service area and the heating campaign starts next month, which makes an autumn staff session useful to both of us. Fifteen minutes, no products, just what is still claimable and what is not.",
    summarised: false,
    effect: {
      note: "Cold outreach sent to the same organisation whose own written rebate question has been sitting unanswered for a fortnight, and it does not so much as acknowledge it. The two halves of this desk were not talking to each other, and the thread is the only place that shows it.",
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
    counterpartyRole: "Site Facilities Lead",
    address: "site-facilities@demo.invalid",
    subject: "Who signs for the plant, and who signs for the staff offer",
    body: "Two different things and they usually sit with two different people: planned maintenance on the site's own heating and hot water, and a staff household offer that goes out with the newsletter. We do both across Brea. Which of them, if either, is yours?",
    summarised: false,
    effect: {
      note: "First touch, deliberately asking who signs rather than assuming.",
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
    counterpartyRole: "Site Facilities Lead",
    address: "site-facilities@demo.invalid",
    subject: "Re: Who signs for the plant, and who signs for the staff offer",
    body: "I only look after this building, and only up to the point where it needs a purchase order. Anything across more than one site goes through the district, and anything that gets sent to staff goes through the front office. Try there.",
    summarised: false,
    effect: {
      note: "Cost one email and bought the name of the two doors that actually open. Requeued rather than closed.",
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
    counterpartyRole: "Activities Director and Booster Liaison",
    address: "activities-office@demo.invalid",
    subject: "Sponsoring one programme rather than the whole calendar",
    body: "Each booster group here raises its own money, which is a different shape from one school-wide sponsor. We would rather back one programme properly than put a logo on everything. Is the committee looking at sponsors for the spring yet?",
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
    subject: "Brand enquiry form, submitted",
    body: "The booster committee is comparing sponsors for the spring fundraiser. We would want one sponsor across the whole event and the terms in writing for the district before anything is announced to families.",
    summarised: false,
    requestId: "req-04",
    effect: {
      note: "The silence broke on their side, through a form rather than as a reply, and it arrived with a date, a number and a condition. Still unanswered.",
      movedStatusTo: "conversation",
      signals: ["asked-for-a-date", "named-a-headcount", "asked-for-it-in-writing"],
    },
    provenance: ILLUSTRATIVE,
  },

  // Heights Christian. The one thread that ends in a signature, and it
  // ends there on terms nobody had to invent.
  {
    id: "msg-heights-1",
    prospectId: "heights-christian-schools-brea-campus",
    direction: "outbound",
    channel: "email",
    at: "2026-08-31T09:30:00-07:00",
    counterpartyRole: "Campus Office Manager",
    address: "campus-office@demo.invalid",
    subject: "A fundraiser that does not depend on a campaign being published",
    body: "The arrangement is simple: the school sends its own families a heating check offer with its own code on it, we pay the school a fixed sum for every visit that actually happens, and nothing is owed if nobody books. It runs on a window rather than on an event date, which matters because our autumn pricing has not been published yet.",
    summarised: false,
    effect: {
      note: "Opened on the one arrangement that survives having no published campaign.",
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
    subject: "Re: A fundraiser that does not depend on a campaign being published",
    body: "Passing this to me, I run the fundraising calendar. What does a block of sixty households cost us and what do we have to commit to?",
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
    subject: "It costs the school nothing, and here is what I cannot print",
    body: "It costs the school nothing up front and there is no minimum. What I cannot do is print the price your families will pay: the two prices we published, the 47 dollar tune-up and the 47 dollar drain clearing, carried fine print that ended on 31 August and nothing has been published since. So the letter goes out with the school's code and the price the site is showing on the day, and I will not put a number in it that I would have to correct. I can also give the school a share back through the community giving arrangement if you would rather run one event than a window.",
    summarised: false,
    effect: {
      note: "Refused to quote a price that is no longer published and put the alternative arrangement beside it.",
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
    body: "Came back on the fundraiser and asked whether the school could set its own ask on top and keep it. Confirmed the appointment window works around the school calendar.",
    summarised: false,
    requestId: "req-17",
    effect: {
      note: "The last question before a signature, and it is about the school's margin rather than about our price.",
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
    subject: "Ask for whatever you like on top",
    body: "Yes. The school adds its own ask and keeps all of it; that is the whole design of the arrangement. Sixty households, a twelve week window, five working days notice on any visit, and the school can stop it at any point.",
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
    body: "Countersigned and it goes in the newsletter next week. Sixty households, window starting 20 November.",
    summarised: false,
    effect: {
      note: "The only status in this app that is a signed agreement rather than a hope. There is a line in the book against it.",
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
    subject: "Appointment window, in writing",
    body: "Confirming the window in writing so it can go in the school newsletter: appointments Monday to Thursday any time, Friday before 5pm, twelve weeks from 20 November. If the autumn campaign lands later than that the window moves with it and no family loses their place.",
    summarised: false,
    effect: {
      note: "Post-signature admin, which is where a co-marketing agreement is actually won or lost for the second time.",
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
    body: "Submitted the only written route the company publishes, asking to be pointed at whoever owns the site's benefits and wellbeing day.",
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
    body: "General contact form routed to a customer support queue. No route to an internal benefits owner is published anywhere.",
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
    counterpartyRole: "Site benefits lead",
    address: "site-benefits@demo.invalid",
    subject: "Brand enquiry form, submitted",
    body: "Winter benefits and wellbeing day for the Brea site. Two hundred and eighty staff expected through it. We will need the date held while procurement runs the supplier checks, which usually takes three to four weeks.",
    summarised: false,
    requestId: "req-15",
    effect: {
      note: "Came in through the brand form while the site's own form was going nowhere. Two hundred and eighty is the largest live audience on the board.",
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
    counterpartyRole: "Site benefits lead",
    address: "site-benefits@demo.invalid",
    subject: "11 December, held while procurement runs",
    body: "Holding 11 December at no cost while your supplier checks run. The hold releases itself rather than expiring quietly, so if procurement takes six weeks instead of four nobody is embarrassed. Two hundred and eighty people in one morning is the busiest day this desk will work in December, so the sooner it is signed the safer it is.",
    summarised: false,
    effect: {
      note: "A date held against no commitment, which is worth nothing until it converts and blocks two of the crew meanwhile.",
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
    counterpartyRole: "Site benefits lead",
    address: "site-benefits@demo.invalid",
    subject: "Vendor pack, and a date to speak again",
    body: "Vendor pack sent through as asked, including the licence number and the insurance certificate. You said three to four weeks for the checks, so I have diarised 9 October rather than chasing you next Tuesday.",
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
    body: "Called about the academy's winter family day. Wants a sponsor and a table, on a Saturday before eleven, which is the only window the academy has free, and took the first date offered.",
    summarised: true,
    requestId: "req-18",
    effect: {
      note: "An inbound call from an owner who can say yes on the phone, which is what an owner operated academy is.",
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
    body: "Called back inside the half hour with 12 December, forty-five member families, Saturday morning. Said plainly that no sponsorship rate is published anywhere on our site and that the figure I was about to give him was mine rather than the company's.",
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
    subject: "12 December, 45 families, in writing",
    body: "Everything we agreed on the phone, written down, including the sentence that the sponsorship figure is a number I quoted and not a published price.",
    summarised: false,
    effect: {
      note: "The provenance of the price travels with the quote rather than being lost between the call and the agreement.",
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
    subject: "Signed and invoiced",
    body: "Agreement countersigned and half the sponsorship fee invoiced up front, as agreed. Two of the crew and a table held for 12 December.",
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
    body: "Called about the December staff benefits morning. He mentioned in the same breath that the same supplier has run it for three years and said to come back in February when they build the summer plan.",
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
    body: "Understood on December. Diarising February for the summer plan. One thing worth knowing when you do look: the sales floor, the service drive and the parts counter keep different hours, and a weekday daytime offer reaches all three where an evening only reaches one.",
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
    body: "The December morning is already contracted with another supplier and has been for three years. Come back in February if you want the summer plan.",
    summarised: false,
    effect: {
      note: "The loss reason in their words, which is worth more on the objection register than the agreement would have been in the book.",
      requeue: "come-back-later",
      signals: ["booked-elsewhere"],
    },
    provenance: ILLUSTRATIVE,
  },

  // Brea Chamber. Not a customer so much as a room full of customers.
  {
    id: "msg-chamber-1",
    prospectId: "brea-chamber-of-commerce",
    direction: "outbound",
    channel: "email",
    at: "2026-09-01T09:00:00-07:00",
    counterpartyRole: "Chamber President and CEO",
    address: "chamber-office@demo.invalid",
    subject: "A rebate briefing your members can actually use",
    body: "Half the rebate money your members were told about last year has gone and the other half runs out on 31 December. Somebody should stand in front of them and say which is which. We will do that for nothing at a mixer, with no pitch attached. Is there space on the calendar this quarter?",
    summarised: false,
    effect: {
      note: "Opened on being useful rather than on selling, because this row is a channel and not a single account.",
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
    subject: "Re: A rebate briefing your members can actually use",
    body: "Open to a member spotlight once there is something concrete to point members at. Suggested the briefing sits inside a mixer this quarter.",
    summarised: false,
    effect: {
      note: "Interested and explicitly conditional on there being something published to point at.",
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
    subject: "Mixer briefing, offered",
    body: "Offering the briefing outright. It costs an hour of my time and puts four service lines in front of a room of members who all own or lease a building, which is worth more than any single account in it. Before that, let me walk your own plant room with a lead technician and leave you a written condition list, because you will introduce this better having watched somebody do it.",
    summarised: false,
    effect: {
      note: "Walkthrough offered ahead of the briefing. The return on both is a room full of small commercial accounts rather than a contract.",
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
    body: "Went to the monthly mixer. Confirmed the briefing slot verbally, collected three member introductions and was told the chamber will not put anything in the member newsletter until there is a published offer with terms a member can check.",
    summarised: true,
    effect: {
      note: "Verbal yes, no date, and the same blocker as everywhere else on this board: nothing has been published since 31 August.",
    },
    provenance: ILLUSTRATIVE,
  },

  // Embassy Suites. A managed property whose operator will not name a
  // contractor to a sister site until somebody has seen the plant.
  {
    id: "msg-embassy-1",
    prospectId: "embassy-suites-by-hilton-brea-north-orange-count",
    direction: "outbound",
    channel: "email",
    at: "2026-09-02T14:00:00-07:00",
    counterpartyRole: "Director of Operations",
    address: "hotel-operations@demo.invalid",
    subject: "Hot water at six in the morning, and who you call at two",
    body: "A property with two hundred rooms has one failure that costs it a night's reviews, and it always happens at the wrong hour. We are two minutes away and we cover four counties. I am not asking to replace anybody today; I am asking to be the second number, and I know you will not put a second number on the wall for somebody who has not seen the plant.",
    summarised: false,
    effect: {
      note: "Opened as a standby and referral conversation rather than as a sale, which is the only version of this that works.",
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
    counterpartyRole: "Director of Operations",
    address: "hotel-operations@demo.invalid",
    subject: "A sister property for you, conditionally",
    body: "Passing on a sister property under the same operator whose water heaters are on their last year. They will ask for a walk of our plant room and a reference before they commit anything, and I would want to see the walk myself first.",
    summarised: false,
    requestId: "req-13",
    effect: {
      note: "A referral arrived before anything was sold, and it is conditional on a walkthrough that has not happened yet.",
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
    counterpartyRole: "Director of Operations",
    address: "hotel-operations@demo.invalid",
    subject: "Your plant room first",
    body: "You watch us work before the sister property does. A walk of your own boilers and rooftop units, with a written condition list you keep whether or not you ever call us, and it costs an hour. Bring whoever else on your team fields the two in the morning phone call.",
    summarised: false,
    effect: {
      note: "Walkthrough offered to the referrer rather than to the referred property, which is the right way round.",
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
    counterpartyRole: "Director of Operations",
    address: "hotel-operations@demo.invalid",
    subject: "Re: Your plant room first",
    body: "Yes to the walk once we can get you in on a low occupancy morning. Which other properties around here do you hold an agreement with? Our regional will ask and I would rather not say nobody.",
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
    subject: "One visit, the whole practice, no regional sign-off",
    body: "A single-location practice can approve its own maintenance in a way a group cannot, which makes one weekday morning simpler for you than three rounds of paperwork. We cover Brea from Columbia Street and the autumn heating slots are not spoken for yet.",
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
    subject: "Maintenance that never leaves a wing without hot water",
    body: "A 24-hour community cannot have every unit down at once, so the usual whole-site visit is the wrong shape. Two phased weekday visits is the shape that works, and weekday daytime is the cheapest capacity this brand has to sell.",
    summarised: false,
    effect: {
      note: "Opened on their constraint rather than on our service list.",
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
    subject: "Re: Maintenance that never leaves a wing without hot water",
    body: "Interested in a weekday daytime agreement covering about 40 units, split across two visits so the community is never uncovered.",
    summarised: false,
    effect: {
      note: "A live conversation with a unit count and a day part already agreed by them.",
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
    subject: "Two twenties beat one forty",
    body: "Quoting two phased weekday visits rather than one. Two half-days on a Tuesday and a Wednesday is better work for a crew than one long Friday, so this is not a compromise, it is the version I would rather have. A rate agreed now and honoured for a year makes the second phase easy to approve.",
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
    subject: "Something that gives back to the club rather than a discount",
    body: "We already give locally: the brand's published total to Make-A-Wish is 160,000 dollars since 2014. The version of that a club can use is simpler. The club sends its own families a heating check offer with the club's code, and a fixed sum comes back for every visit that happens. It costs the club nothing and it does not need anybody to buy anything they were not going to buy.",
    summarised: false,
    effect: {
      note: "Opened on money coming back rather than on a discount, because the club's constraint is funding and not enthusiasm.",
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
    body: "We mail our member families each term and we run a fundraiser alongside it. Interested in whether there is anything that gives something back to the club.",
    summarised: false,
    requestId: "req-09",
    effect: {
      note: "Came back through the form with seventy-five member families attached and no date, which is the normal order for this cohort.",
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
    subject: "A fixed sum back, written into the agreement",
    body: "The share is written into the agreement rather than promised on a call, so it needs nobody's approval later and cannot be taken away from you halfway through. Pick a quiet midweek window and the club keeps the families it was going to mail anyway. The honest caveat: the per-visit figure is not published anywhere on our site, so it is a number this desk agreed rather than a number you can check.",
    summarised: false,
    effect: {
      note: "Fundraiser offered with the figure named as unpublished, which is the only way to put it on the table honestly.",
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
    body: "Called to fix a date. Held the window starting 14 November against about seventy-five member families, nothing committed, releasing itself if the autumn campaign lands elsewhere. She will confirm once the term calendar is signed off in October.",
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
    counterpartyRole: "Parish Office Coordinator",
    address: "parish-office@demo.invalid",
    subject: "The parish bulletin, and the autumn heating check",
    body: "A parish that mails a bulletin every week already owns the thing every local trade is trying to buy. We would rather pay for a place in it and stand behind what it says than knock on doors. We cover Los Angeles, Orange, Riverside and San Bernardino counties, and it is worth saying that up front.",
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
    counterpartyRole: "Parish office coordinator",
    address: "parish-office@demo.invalid",
    subject: "Brea enquiry form, submitted",
    body: "We heard you were asking about the bulletin. Roughly how does it work for a parish, and would the offer be honoured for the families who drive in from San Diego County?",
    summarised: false,
    requestId: "req-01",
    effect: {
      note: "Interested, and carrying the question the published service area answers with a no: four counties, and San Diego is not one of them. Still unanswered and past the response commitment.",
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
  of these arrived through a form, a phone call or a conversation at a
  counter while the outbound plan was pointed somewhere else, and a board
  built only from outbound work would have had all nine sitting at
  unworked while somebody was waiting for an answer.
*/
const INBOUND_LED: ConversationMessage[] = [
  // Envista. The most specific enquiry on the board, and the only one
  // that asks for a per-member price, which is the one number nobody in
  // this market publishes.
  {
    id: "msg-envista-1",
    prospectId: "envista-world-headquarters",
    direction: "outbound",
    channel: "email",
    at: "2026-09-07T09:20:00-07:00",
    counterpartyRole: "HR and People Ops Manager",
    address: "workplace-experience@demo.invalid",
    subject: "The staff offer and the building, in one conversation",
    body: "A headquarters that shares a campus with its own subsidiary is two conversations that almost never happen together: an offer for staff households, and planned maintenance on the building they all sit in. We do both, out of Columbia Street, ten minutes away. One agreement is less work for you than two.",
    summarised: false,
    effect: {
      note: "First touch, aimed at the one thing a full-service brand can do that a single-trade contractor cannot.",
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
    body: "Came back on the quote. Asked whether the staff offer and the site maintenance could run on one agreement, and what the membership would cost each member of staff who took it.",
    summarised: false,
    requestId: "req-12",
    effect: {
      note: "Ninety staff, a date, and a procurement-shaped question about the per-member price. This is a buyer rather than an enquirer.",
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
    subject: "One agreement, and the only per-member numbers anybody publishes",
    body: "One agreement covering both is the shape this brand is best at. On the per-member price, the honest position: our own club is named on the site with no price beside it, and I am not going to make one up in an email. The only per-member figures published by anyone in the wider group belong to two brands outside this territory, at 19.95 a month in San Diego and 15 a month or 189 a year in the Coachella Valley. I would rather give you those, and say plainly that they are not ours to sell here, than send you a total I would have to revise.",
    summarised: false,
    effect: {
      note: "Answered a price question with the only published figures that exist and named the rest as unpublished.",
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
    body: "Checking in once on 4 December, which is the date you named for the staff session. Nothing is held against it yet and December weekday mornings go first once the heating calls start, so I would rather hold it for you now and release it later than watch it go to somebody who asked second.",
    summarised: false,
    effect: {
      note: "Quote out, no answer, one chase sent. The next move is theirs and the date is the pressure.",
    },
    provenance: ILLUSTRATIVE,
  },

  // Brea Jiu-Jitsu. Asked twice whether the price would still be there,
  // which is the objection every thread in this file eventually hits.
  {
    id: "msg-bjj-1",
    prospectId: "brea-jiu-jitsu",
    direction: "inbound",
    channel: "phone",
    at: "2026-09-17T13:20:00-07:00",
    counterpartyRole: "Academy owner",
    body: "Called about putting an offer in front of his member families at the winter grading. Wants a Saturday morning, families included, and asked twice whether the price he tells them will still be the price in December.",
    summarised: true,
    requestId: "req-14",
    effect: {
      note: "Inbound, from an owner who can approve it himself, with a date and sixty families already decided.",
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
    body: "Called back inside forty minutes. Told him plainly that the fine print on the published prices ran out on 31 August and that I will not promise a December number I have not seen. Offered a hold on 19 December that costs nothing and releases itself if the campaign lands elsewhere.",
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
    subject: "Saturday 19 December, 60 families, in writing",
    body: "Written version of the call. A Saturday works because this is a table and a talk rather than a service visit, and a service visit at a weekend is the one thing this brand cannot do cheaply. No price is published for the sponsorship, so the figure in this quote is mine and it is labelled as mine.",
    summarised: false,
    effect: {
      note: "Quote sent. The day part he wanted happens to be the one this desk can give away, which is rare and worth saying.",
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
    subject: "Re: Saturday 19 December, 60 families, in writing",
    body: "One follow-up. If the unpublished December price is the blocker, say so and I will stop chasing until there is a published one to give you.",
    summarised: false,
    effect: {
      note: "Chased once and named the likely reason for the silence, which is more useful than a third cheerful email.",
    },
    provenance: ILLUSTRATIVE,
  },

  // The Cause Church. A held winter window and a compliance question
  // that has a real published answer for once.
  {
    id: "msg-cause-1",
    prospectId: "the-cause-church-brea",
    direction: "inbound",
    channel: "contact-form",
    at: "2026-09-10T19:20:00-07:00",
    counterpartyRole: "Community care pastor",
    address: "care-ministry@demo.invalid",
    subject: "Brea enquiry form, submitted",
    body: "Winter care list for member households, mostly older people on their own. If we send them to you, what protects them if they change their mind after somebody has been out?",
    summarised: false,
    requestId: "req-16",
    effect: {
      note: "Arrived at half past seven in the evening, which is when church staff do admin. Ninety-six households and a consumer protection question.",
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
    counterpartyRole: "Community care pastor",
    address: "care-ministry@demo.invalid",
    subject: "Cancellation in writing, and 18 December",
    body: "The best answer to that one is not ours, it is the law: since this year a California home improvement contract has to carry an email address and let the customer cancel by email rather than by post. Anything a member of your congregation signs will have that on it, and I would rather point at the rule than at our own promise. Holding the window from 18 December while you check it against whatever your own safeguarding policy requires, which is probably stricter than the rule.",
    summarised: false,
    effect: {
      note: "Answered the compliance question first and the date second, which is the order a care pastor cares about.",
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
    counterpartyRole: "Community care pastor",
    address: "care-ministry@demo.invalid",
    subject: "Re: Cancellation in writing, and 18 December",
    body: "Hold it. Our own policy wants two of our volunteers present at any visit to a member living alone, so we will staff it more heavily than you require. I cannot sign anything until the board meets, and it meets monthly and will not convene early.",
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
    body: "Enquiring on behalf of the clinic. We have never had a maintenance agreement of any kind and would want to understand cost before taking it to the partners. No fixed date in mind at this stage.",
    summarised: false,
    requestId: "req-10",
    effect: {
      note: "No date, no unit count, and a stated internal approval step. The price question is the whole conversation here.",
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
    body: "The honest answer is that no agreement price is published anywhere on our site, and I am not going to invent one to get a meeting. What I can do is put a real quote against your actual equipment this week and hold the rate while the partners look at it. To do that I need two things you have not told me: how many units are on the roof, and whether anything in the building has to stay running while we work.",
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
    body: "Called the clinic. Reception took a message; the operations manager was with patients. Left the two questions with reception rather than asking for a call back, so an answer can come back without anybody having to find me.",
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
    body: "Retail route go-see. Asked at the counter. Eighteen mostly part-time staff, most of them renting locally, none of them ever offered anything like a staff household rate. The store manager was interested and said the franchisee would have to say yes.",
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
    body: "The franchisee rang back the same afternoon. Yes to the staff offer going on the rota app and in the back room from around 16 November, eighteen people. Asked for nothing in writing.",
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
    body: "Called to turn the verbal agreement into a signed one. He is happy and has not signed anything, so there is no agreement, no artwork approved and no line in the book. Held 16 November rather than recording something that does not exist.",
    summarised: true,
    effect: {
      note: "A verbal yes is not a campaign. The request row says won, the book says nothing, and the queue is right to flag the disagreement rather than pick a side.",
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
    subject: "Brand enquiry form, submitted",
    body: "Asked what a staff household offer would cost per person and whether there was anything that could run midweek without people taking leave.",
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
    body: "Midweek daytime is the cheapest capacity this brand has and I can agree a rate now and hold it for a year. On cost per person: there is no published membership price, so anything I sent you today would be a figure I made up. Give me a date and a rough split of the hundred and thirty across your sites and I will quote it properly.",
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
    body: "Wanted something the branch could take to its realtor and inspector partners, a home readiness session for their clients. Asked for a price.",
    summarised: false,
    requestId: "req-23",
    effect: {
      note: "Forty people, half of them referral partners this desk wants anyway, and the first question is the one with no published answer.",
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
    body: "We publish no price for a co-marketing arrangement, at any of the group's brands, and the pages say to contact the local team instead. That is me. A real number needs the size of the list, what you want in front of it and who is paying for the room, and I would rather give you one this week that holds than a range today that moves. The session itself I will run for nothing.",
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
    body: "Looking for someone to service the units before winter. We cannot close the practice, so it would have to be two short visits on different days rather than one long one.",
    summarised: false,
    requestId: "req-03",
    effect: {
      note: "Inbound, unanswered, and the form asked for none of the date, the unit count or the equipment age.",
      movedStatusTo: "conversation",
    },
    provenance: ILLUSTRATIVE,
  },

  // Stonefire Grill. A kitchen that cannot go down at lunch, which is
  // a scheduling problem before it is a price problem.
  {
    id: "msg-stonefire-1",
    prospectId: "stonefire-grill-brea",
    direction: "outbound",
    channel: "in-person",
    at: "2026-09-23T08:10:00-07:00",
    counterpartyRole: "General manager",
    body: "Asked at the counter during a route go-see. Wants the water heaters and the make-up air looked at on a Monday, which is their quietest day, and a staff household offer for the thirty-eight on the rota. Said they would need a price before asking the owner.",
    summarised: true,
    requestId: "req-06",
    effect: {
      note: "Thirty-eight staff, two service lines and a stated approval chain above the general manager. The price is the gate.",
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
  The calendar-locked cohort, worked cold, with the results a school year
  actually produces in September. Two absence replies, one routing
  correction, one polite refusal on the grounds that they keep their own
  maintenance team, and two organisations that have said nothing at all.
*/
const SCHOOLS_COLD: ConversationMessage[] = [
  // Valencia High School. The school year's own answer to outreach.
  {
    id: "msg-valencia-1",
    prospectId: "valencia-high-school",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-09T10:40:00-07:00",
    counterpartyRole: "Activities and Community Partnerships Director",
    subject: "School contact form",
    body: "Submitted through the school's form, which is the only written route published. Asked whether the sponsor list for the spring is set and who approves anything that goes out to families.",
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
    counterpartyRole: "Activities and Community Partnerships Director",
    address: "activities-office@demo.invalid",
    subject: "Automatic reply",
    body: "I am off campus with the autumn programme and will respond to messages on my return. For urgent student matters contact the attendance office.",
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
    counterpartyRole: "Site Operations Lead",
    subject: "School contact form",
    body: "The school publishes contact links for all staff, so the ask was simple: which of the buildings and the family mailings do you handle yourself, and which go through somebody else?",
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
    counterpartyRole: "Site Operations Lead",
    address: "site-operations@demo.invalid",
    subject: "Re: School contact form",
    body: "Each programme here raises and spends its own money out of its own account, and the sponsor conversations happen inside those. I do not hold a budget for that. The front office does anything that goes to families.",
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
    counterpartyRole: "Site Operations Lead",
    address: "site-operations@demo.invalid",
    subject: "Thank you, and one ask",
    body: "That is genuinely useful. Would you forward this to the programme leads who ask you where to go for a sponsor? Fourteen small arrangements is a better year for this desk than one large one, and it spreads the risk across fourteen renewals instead of one.",
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
    counterpartyRole: "Activities and Community Partnerships Director",
    subject: "School contact form",
    body: "A newer campus with fewer long-standing sponsor arrangements tying the calendar to one firm. Asked whether we could be considered for the spring and who sits on the committee.",
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
    counterpartyRole: "Activities and Community Partnerships Director",
    subject: "School contact form",
    body: "Second submission, worded differently in case the first one was filtered.",
    summarised: false,
    effect: {
      note: "Two form submissions, no acknowledgement of either. There is nothing here to read as a signal, which is itself the reading: this one is a visit or it is nothing.",
    },
    provenance: ILLUSTRATIVE,
  },

  // Biola. A facilities office that buys contractors for a living,
  // which means the reply is a process rather than a mood.
  {
    id: "msg-biola-1",
    prospectId: "biola-university",
    direction: "outbound",
    channel: "email",
    at: "2026-09-05T09:00:00-07:00",
    counterpartyRole: "Facilities and Contract Services Manager",
    address: "facilities-office@demo.invalid",
    subject: "Overflow cover, and the residence halls before winter",
    body: "You have an office whose whole job is buying and scheduling contractors, which makes this a shorter conversation than most. We are twenty minutes away with crews across four counties, and the useful version of this is overflow cover on the weeks your own team cannot absorb rather than replacing anybody.",
    summarised: false,
    effect: {
      note: "First touch, pitched at a professional buyer rather than at somebody with facilities as a side responsibility.",
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
    counterpartyRole: "Facilities and Contract Services Manager",
    address: "facilities-office@demo.invalid",
    subject: "Re: Overflow cover, and the residence halls before winter",
    body: "Send me something in writing with your licence, your rates and your certificate of insurance. We keep a file of approved contractors and nothing gets raised as a purchase order that is not in it.",
    summarised: false,
    effect: {
      note: "A real reply and a smaller signal than it reads as. Nothing here is about wanting us; it is about paperwork, and paperwork is the actual gate.",
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
    counterpartyRole: "Facilities and Contract Services Manager",
    address: "facilities-office@demo.invalid",
    subject: "Licence, cover, and what is not published yet",
    body: "Licence number, insurance certificate and the Diamond Certified record, nineteen consecutive years, below. Two things I cannot give you yet and will not pretend otherwise: an autumn price list, because the fine print on the last published prices ran out on 31 August, and a per-unit agreement rate, because none is published anywhere in the group. The rates in the pack are mine and they are labelled as mine.",
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
    subject: "A staff offer for a district, not a campus",
    body: "The district office employs the staff behind three campuses and owns the benefits calendar for all of them, which makes one conversation worth three. We are the heating, cooling, plumbing and electrical brand on Columbia Street.",
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
    subject: "Re: A staff offer for a district, not a campus",
    body: "Thank you, but we run our own maintenance team across the three campuses and our benefits fair is staffed by the insurers we already contract with. There is no budget line for an outside trade and there has not been for some years.",
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
    body: "Understood. If your own team is ever short-handed on a heatwave week, weekday daytime overflow is the cheapest thing this brand owns and I will not need a budget line to be useful about it. The gas utility rebate money runs to 31 December if a water heater comes up before then.",
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
    counterpartyRole: "Human Resources Manager",
    subject: "University contact form",
    body: "A campus that runs clinics has equipment it cannot let fail and staff who mostly live within twenty minutes of it. Asked who owns the contractor list and whether there is a staff benefits fair in the calendar.",
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
    counterpartyRole: "Director of Campus Operations",
    body: "Walked into the operations office on the way back from the Fullerton route. The director was teaching. Left a card and the two dates that matter, the pre-winter check window and the spring staff fair, with the front desk.",
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
    body: "A site with both an office team and a warehouse crew has two groups who never see the same noticeboard, and the warehouse one is almost always the one a benefits offer misses. We can staff a table at a shift change as easily as at lunch, on a weekday, out of Columbia Street.",
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
    body: "Our club is named on the site with no price beside it, and the two prices we did publish, both 47 dollars, carried fine print that ended on 31 August. So the number you want does not exist in public today. Tell me how many staff and which shift and you will have a written figure this week that holds long enough to go through a request. The only per-member prices published by anyone in the group belong to two brands outside this territory, at 19.95 a month and at 15 a month, and I will show you those rather than pretend we have one.",
    summarised: false,
    effect: {
      note: "Gave the only published numbers that exist, named them as somebody else's, and refused to invent ours. Nothing back since.",
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
    body: "A defence manufacturer holding on to skilled machinists in a tight labour market spends on benefits because it is cheaper than recruitment, and a household maintenance rate is one of the few that costs the employer nothing. Asked who owns that.",
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
    body: "Saturn Street go-see. Reception is behind a badge reader and visitors do not get past it without an appointment. The receptionist took a card and said facilities books every contractor who comes on site, not HR.",
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
    subject: "Pointe Drive, and a crew on the same side of town",
    body: "Four organisations already on this desk's route sit in the same office cluster, so this costs nothing to add. We hold weekday daytime capacity through October that nobody has claimed, and October is the last quiet month before the heating calls start.",
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

  // Ultimate Staffing. Worth more as a route into the employer cohort
  // than as an account of its own.
  {
    id: "msg-ultimate-1",
    prospectId: "ultimate-staffing-services-brea",
    direction: "outbound",
    channel: "email",
    at: "2026-09-10T10:10:00-07:00",
    counterpartyRole: "Branch Manager",
    address: "brea-branch@demo.invalid",
    subject: "You know which Brea employers are having a good year",
    body: "This is only half a sales conversation. A staffing branch knows which local employers are hiring and growing before anybody else does, and those are exactly the companies that add a benefit in January. I would rather be useful to you than sell you one office maintenance visit.",
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
    subject: "Thursday, and a look at your own units while I am there",
    body: "Thursday works. While I am in the building I will walk your own rooftop units and leave you a written condition list, no charge and no obligation, because you will not recommend a crew you have not watched work and you should not.",
    summarised: false,
    effect: {
      note: "Walkthrough offered to a referral partner rather than to a buyer, which is where it earns the most.",
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
    body: "Retail route. Asked at the service desk for the store director, who was in a district call. The HR team leader came out instead, took the details and said a staff benefit like this is a real conversation but that nothing gets added to what the team is offered without the district.",
    summarised: true,
    effect: {
      note: "Reached a real person, learned the audience exists, and learned it is not theirs to reach. That is a chain in one paragraph.",
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
    body: "Second pass on the same route. The HR team leader remembered the conversation, said the store cannot pull everybody off the floor at once so a table would have to run across two shifts, and offered to raise it with the district in October.",
    summarised: true,
    effect: {
      note: "A repeat shape rather than a single date, and a named month for the decision to be possible in.",
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
    body: "A young commercial team that is hiring in cohorts is mostly renting or buying its first place, which is the point at which a maintenance plan is worth something to a household. Asked who owns the benefits list and whether the team is growing.",
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
  on the spot because the owner is behind the till; the chains want it
  and cannot approve it, because the budget line sits with a region.
  That is the organisation type filter doing real work rather than
  colouring a chip.
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
    subject: "Your crew rents, and nobody has ever offered them anything",
    body: "Three quarters of a mile down Brea Boulevard from our Columbia Street office. A shop this size cannot give its staff much, and a household rate on heating, plumbing and drains costs the shop nothing to hand out. A weekday afternoon before the counter gets busy is the one hour you can all hear it.",
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
    subject: "Re: Your crew rents, and nobody has ever offered them anything",
    body: "How much for about ten of us, and when does the autumn offer actually start? My staff will want to know both.",
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
    subject: "Ten of you, on a Tuesday",
    body: "No autumn price has been published since the 31 August fine print ran out, so I will not give you one. Ten households on weekday appointments is small enough that I can agree a rate now and honour it for a year, which means whenever the campaign lands, the price your staff were told is the price they get.",
    summarised: false,
    effect: {
      note: "Rate lock offered against the exact day part the owner chose.",
      offerExtensionId: "offx-bobaflip-midweek",
    },
    provenance: ILLUSTRATIVE,
  },

  // Old Brea Chop House. A restaurant, a neighbour, and a referral
  // partner for the calls it cannot take itself.
  {
    id: "msg-chophouse-1",
    prospectId: "old-brea-chop-house",
    direction: "outbound",
    channel: "email",
    at: "2026-09-14T10:15:00-07:00",
    counterpartyRole: "General Manager",
    address: "managers@demo.invalid",
    subject: "The call you make at five on a Friday",
    body: "A quarter of a mile apart. A kitchen that loses hot water or a grease line at five on a Friday loses the night, and the numbers people reach for at that hour are whoever answered last time. I would rather be that number than sell you a maintenance plan you have not asked for.",
    summarised: false,
    effect: {
      note: "Opened on being the emergency number rather than on the agreement, because the agreement follows the first callout.",
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
    subject: "Re: The call you make at five on a Friday",
    body: "Fair point, it happened to us twice last winter. Come and see me before the clocks change. Who else downtown do you look after?",
    summarised: false,
    effect: {
      note: "Warm, dated to the season rather than to a month, and asking who else has signed. The social proof question again.",
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
    body: "Brea Marketplace route. The general manager walked out to the front of house and talked for ten minutes. Twenty-odd staff, two water heaters he does not trust, and he liked the idea of one number covering both the building and the crew's own homes.",
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
    body: "Imperial route. Caught the store manager between bays. Twelve technicians and service advisors, most of them living within a few miles, and he said nobody has ever put a household benefit in front of them.",
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
    body: "Said he would want to do it and that anything with a supplier's name on it goes to the region. He has a small discretionary budget and this is not small enough to sit inside it. Suggested asking again in November when the region sets next year's numbers.",
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
    body: "Brea Boulevard route, half a mile from the office. The owner was on site. Fifteen on the crew, an ageing rooftop unit over the waiting room, and he asked how much and when before I had finished the second sentence.",
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
    body: "Called back with what I could actually say: no published price since 31 August, no published autumn campaign, and first call on the October weekday slots held at no cost until there is one. He asked me to call again once there is a price on the website.",
    summarised: true,
    effect: {
      note: "A held slot put on the table and the conversation parked on the one blocker this desk cannot solve.",
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
    body: "Asked for the general manager mid-afternoon, which is the only hour a restaurant will talk to anybody. Crew of thirty plus. He said the regional operator holds one maintenance contract across several stores and that a single store arrangement would be unusual.",
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
    body: "Called in during the Brea Boulevard route. The owner listened, said they are a five person shop in a leased unit where the landlord handles anything mechanical, and that she has never needed anybody. Polite, and a no without the word.",
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
    body: "Half a mile from the office. The owner came out from under a car, listened to the whole thing, and asked what a household rate would cost his eight staff and whether somebody would come and explain it over a lunch in December.",
    summarised: true,
    effect: {
      note: "A small arrangement with an owner who can decide it standing in his own workshop.",
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
    body: "Called back with December dates and the honest caveat that nothing has been published since the 31 August fine print ran out, so the rate would be mine rather than the company's. He said to try him again in a month and that he is not going anywhere.",
    summarised: true,
    effect: {
      note: "Second touch, parked on the unpublished campaign with a month named.",
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
    body: "On the same street as the office. The owner knows every landlord and every tenant on the block and which of them has been chasing a contractor for a fortnight. More interested in that conversation than in his own kitchen, which is newer than ours.",
    summarised: true,
    effect: {
      note: "A neighbour who hears about the failures before we do, which makes the referral worth more than the account.",
      movedStatusTo: "conversation",
    },
    provenance: ILLUSTRATIVE,
  },

  // 24 Hour Fitness. Two arrangements behind one conversation, and
  // neither of them is the general manager's to sign.
  {
    id: "msg-fitness24-1",
    prospectId: "24-hour-fitness-brea",
    direction: "outbound",
    channel: "in-person",
    at: "2026-09-22T10:15:00-07:00",
    counterpartyRole: "General Manager",
    body: "Retail route. The general manager was covering the front desk. Two separate ideas landed: a household rate for the trainers and instructors, and the same offer in the member email, which the club has an active reason to send. He said both would need the regional manager and that his own budget is for equipment.",
    summarised: true,
    effect: {
      note: "Two arrangements identified and neither is approvable in the building.",
      movedStatusTo: "reached-out",
      requeue: "decision-off-site",
    },
    provenance: ILLUSTRATIVE,
  },

  // Valvoline. One store, and a district manager who runs several
  // inside this territory.
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
  two clearest losses on the board and the one organisation whose own
  membership includes the competition.
*/
const LOCAL: ConversationMessage[] = [
  // Aloha Veterinary Hospital. A practice that closes as a unit, which
  // makes it one of the easiest accounts in the territory.
  {
    id: "msg-aloha-1",
    prospectId: "aloha-veterinary-hospital",
    direction: "outbound",
    channel: "email",
    at: "2026-09-07T08:50:00-07:00",
    counterpartyRole: "Hospital Manager",
    address: "hospital-manager@demo.invalid",
    subject: "Closed at five and closed at weekends",
    body: "A practice that shuts at the same hour every weekday and does not open at weekends can have its units serviced without paying anybody an out of hours rate, which most of the organisations on this list cannot. The same visit can carry a household rate for the team, and that part costs the practice nothing.",
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
    body: "There would be about eighteen of us including partners. What would the household rate cost them and can you do the building in December? The team has had a hard year and I would like to do something.",
    summarised: false,
    effect: {
      note: "A number, a price question and a date question in three lines, plus the reason they are buying.",
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
    subject: "Eighteen households, and what December depends on",
    body: "The household rate depends on an autumn campaign that has not been published, so I will not sell you a number for it. What I can do is hold a December weekday for the building at no cost, releasing itself if the campaign lands elsewhere, so you can tell the team something is in the diary without either of us pretending. A written quote follows once you confirm what is on the roof.",
    summarised: false,
    effect: {
      note: "Hold offered against the month they asked about. The record now waits on them.",
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
    subject: "Before the first cold week, not during it",
    body: "A practice with a monitored inbox is a practice where a message reaches the person who controls the diary, which is rarer than it should be. October is the last month a heating check can be booked at a time that suits you rather than at the first hour we have free.",
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
    subject: "Re: Before the first cold week, not during it",
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
    body: "Written so it can be forwarded without editing. No agreement price is published anywhere on our site and I have said so in it rather than leaving a gap somebody has to ask about, and the rate in it is labelled as mine.",
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
    body: "Called the community. The executive director took it. Independent living apartments with their own units in each one, a central plant for hot water, and no maintenance agreement covering either.",
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
  // an organisation that will not be first.
  {
    id: "msg-nocma-1",
    prospectId: "north-orange-county-martial-arts",
    direction: "outbound",
    channel: "email",
    at: "2026-09-08T09:10:00-07:00",
    counterpartyRole: "Programme Director",
    address: "programme-director@demo.invalid",
    subject: "Between belt cycles",
    body: "A school that already mails its member families between belt cycles owns the hardest part of this. We would sponsor the mailing and pay back a fixed sum on every visit that happens, which turns a newsletter you send anyway into funding.",
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
    body: "Which other schools have signed with you? We usually go where the other academies go and I would rather not be the first to try somebody.",
    summarised: false,
    effect: {
      note: "The social proof question asked plainly. The honest answer is two organisations, and that answer is worth more than a vague one.",
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
    subject: "Two, and I will not pretend it is more",
    body: "One taekwondo academy has signed a sponsorship for its December family day and a Christian school has signed the fundraiser arrangement for sixty households. That is the whole list and I would rather give you it than a number I cannot name.",
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
    body: "Members here are the small employers who each own one building and one ageing rooftop unit, which is exactly the size of account this desk wants and exactly the size nobody else chases.",
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
    body: "Come to the October breakfast as a guest and say two minutes about it. Members will ask what the offer is and what it costs, so have an answer.",
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
    body: "I will be there. When they ask what it costs I will say that the last published prices expired on 31 August, that I will not guess at the next ones, and then I will offer them a rate held for a year and a walk of their own plant that costs them nothing. That is a better two minutes than a number I would have to take back.",
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
    counterpartyRole: "Facilities and Grounds Manager",
    body: "Called the club. Asked about the kitchen and hall plant and about the member newsletter, on the theory that a club with a hall to heat and a mailing list is two conversations rather than one.",
    summarised: true,
    effect: {
      note: "First touch, pitched at the building and the list rather than at one job.",
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
    counterpartyRole: "Facilities and Grounds Manager",
    body: "Polite and immediate. Two of their own members run heating and plumbing firms, the club uses them, and putting another trade in the newsletter would be read as a slight. Said no to the building work as well, for the same reason.",
    summarised: true,
    effect: {
      note: "A clean no with a reason that will not change, from an organisation whose own membership is the competition. Recorded rather than left hopeful.",
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
    subject: "The building is not yours, but the list is",
    body: "A campus meeting in leased space does not own the boiler, which takes half of this off the table straight away. The half that is left is the one that matters: a congregation of households going into winter, and an offer in the weekly email that pays the campus back on every visit.",
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
    subject: "Re: The building is not yours, but the list is",
    body: "What goes out to the congregation is written centrally across all our campuses, so this is not mine to agree. I can pass it to the central communications team but they plan the year in January.",
    summarised: false,
    effect: {
      note: "A multi site church behaves like a chain, which is the whole reason the organisation type is a separate field from the cohort.",
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
    body: "A branch with a small team and a member outreach mandate has two reasons to talk to a home services brand rather than one: a household rate for staff, and a home maintenance piece in the member newsletter. Asked which of the two, if either, the branch manager can approve.",
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
    body: "Staff benefits come out of a regional budget and anything sent to members is written by marketing at head office. Neither is mine. I have forwarded it to both.",
    summarised: false,
    effect: {
      note: "Neither budget is in the building, and the forward is the only thing that happened. Requeued rather than closed.",
      requeue: "decision-off-site",
    },
    provenance: ILLUSTRATIVE,
  },

  // Sell My Home Real Estate. Signed with somebody else in July, which
  // is the answer nobody wants and everybody needs to hear early.
  {
    id: "msg-sellmyhome-1",
    prospectId: "sell-my-home-real-estate",
    direction: "outbound",
    channel: "contact-form",
    at: "2026-09-16T10:50:00-07:00",
    counterpartyRole: "Broker and Team Lead",
    subject: "Brokerage contact form",
    body: "Every listing that fails an inspection on the furnace or the water heater becomes a negotiation you have to run twice. A referral arrangement with a crew that answers the same day is worth more to a brokerage than any co-branded flyer.",
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
    body: "We signed a preferred contractor arrangement with another company back in July and the first year is paid for. Ask me again next summer.",
    summarised: false,
    effect: {
      note: "Lost on timing rather than on merit. They committed two months before this desk had anybody to ask them, which is the argument for working referral partners in the quiet months rather than a failure of the pitch.",
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
    subject: "The claim you would both rather nobody made",
    body: "A failed water heater is a claim for you and a call for us, and the version where neither happens is a fifteen minute talk to your clients about what to check before winter. A relationship agency renews its book face to face, and this is the cheapest excuse to be in front of them.",
    summarised: false,
    effect: {
      note: "First touch, framed as a retention tool for them rather than as a lead source for us.",
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
    subject: "Re: The claim you would both rather nobody made",
    body: "What dates do you have in the first quarter? We close on Fridays so a Thursday evening would suit us and about thirty clients.",
    summarised: false,
    effect: {
      note: "A date question, a day part and a number, unprompted, from the person who signs.",
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
    body: "Every Thursday in the first quarter is free, because the winter calls come in the evening and this desk's diary for January is empty. I would rather tell you that than pretend at scarcity. Pick one and I will hold it at no cost until there is a published offer to put in front of your clients.",
    summarised: false,
    effect: {
      note: "Told the truth about an empty diary instead of manufacturing urgency, and offered the hold.",
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
 * discount, because there is no published price here to discount: the
 * two consumer prices this brand did publish carried fine print that
 * ended on 31 August 2026, and no agreement or sponsorship rate is
 * published anywhere in the group. The cost is not restated here; it is
 * read off the offer itself so the two cannot drift apart, and three of
 * the four offers in that catalogue cost nothing but time.
 *
 * The one that does cost money is the community giving arrangement, and
 * it carries an honest caveat rather than a citation. The group
 * publishes what it has given to Make-A-Wish, 160,000 dollars since
 * 2014, and publishes no per-visit figure at all. So the share in that
 * offer is a number this desk agreed rather than one a counterparty can
 * check, and the rows say so instead of borrowing the credibility of the
 * published total.
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
      "Declined in favour of the twelve week window, which is a school choosing a mailing it controls over an event it would have to staff. The offer was not the reason this closed and it is recorded so the offer is not credited with the win.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "offx-beckman-first-fifty",
    prospectId: "beckman-coulter-inc",
    offerId: "first-fifty",
    messageId: "msg-beckman-4",
    extendedAt: "2026-09-09T10:30:00-07:00",
    toRole: "Site benefits lead",
    state: "accepted",
    stateNote:
      "Taken. 11 December is held against nothing at all while procurement runs, which is the largest audience on the board sitting on the weakest kind of commitment.",
    expiresAt: "2026-10-09T10:00:00-07:00",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "offx-cause-first-fifty",
    prospectId: "the-cause-church-brea",
    offerId: "first-fifty",
    messageId: "msg-cause-2",
    extendedAt: "2026-09-11T09:50:00-07:00",
    toRole: "Community care pastor",
    state: "accepted",
    stateNote:
      "Taken. The window from 18 December is held and cannot be signed until the board meets, and the board meets monthly and will not convene early. That is a blocker with a date rather than a stall.",
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
      "Accepted in principle at the mixer and not yet dated, because the chamber will not promote anything until there is a published offer to point at. Costs an hour of a lead technician's time and nothing else.",
    provenance: ILLUSTRATIVE,
  },
  {
    id: "offx-embassy-tour",
    prospectId: "embassy-suites-by-hilton-brea-north-orange-count",
    offerId: "founding-partner-tour",
    messageId: "msg-embassy-3",
    extendedAt: "2026-09-15T12:15:00-07:00",
    toRole: "Director of operations",
    state: "accepted",
    stateNote:
      "Accepted, and gated on a low occupancy morning. A managed property converts on watching somebody work and almost nowhere else, so this one is worth rearranging a crew for.",
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
      "On the table alongside the held window. It is the only offer in the catalogue that costs real money, and the per-visit figure is this desk's rather than a published one, which is said in the thread rather than hidden in it.",
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
      "Taken on the follow-up call. 12 June is held at no cost and the committee will not sign against it until there is a published offer families can check.",
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
      "Offered on the call and never taken up. He asked twice whether the price would still be there in December, which is the objection this offer exists to answer, so its going unanswered is a real signal.",
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
      "Offered to a referral partner rather than to a buyer. It costs an hour and a written condition list, and it is aimed at somebody who will repeat what they saw to every employer they place staff with.",
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
      "A rate held for a year for ten households on weekday appointments. It trades an evening callout rate this group was never going to pay against certainty on hours that would otherwise be empty.",
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
      "Open, and parked by him rather than by this desk. He asked to be called once there is a price on the website, which is the correct next action and not a follow-up email.",
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
      "Offered against the December weekday they asked about. Unanswered for a week, which for a practice that wanted to do something for its team reads as a diary problem rather than a no.",
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
      "Every Thursday in the first quarter offered, with the empty January diary stated plainly rather than dressed up as scarcity.",
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
