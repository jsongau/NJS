import type { Lane, Provenance } from "@/domain/types";

/**
 * THE INBOUND HALF.
 *
 * Everything else in this application is outbound. Two hundred and eleven
 * organisations, nine lanes, a desk that decides who to write to on a
 * Tuesday morning. That half of the job is a search problem: the work
 * only exists once somebody goes and finds it.
 *
 * Inbound is the opposite kind of problem and it is the one that loses
 * money quietly. A request arrives on its own, it arrives with a clock
 * already running, and the only way to fail it is to do nothing. Nobody
 * writes down "did not reply to the church youth pastor for four days".
 * There is no report that shows it. The enquiry simply stops mattering
 * to the person who sent it, and by the time anyone looks, the group has
 * booked somewhere that answered.
 *
 * So this file models three things and refuses to model a fourth.
 *
 * ONE: WHAT THE REAL FORMS ACTUALLY ASK.
 *
 * Main Event publishes two inbound forms and they are not the same form.
 * The brand-wide events form at mainevent.com/events asks for a desired
 * date, an event type and an estimated attendee count. The Brea page
 * form asks for none of those three. It asks for a first name, a last
 * name, an email, a phone number, a company or organisation, and 256
 * characters of free text.
 *
 * That gap is the single most useful intake fact in the research, and
 * the model makes it visible rather than smoothing it over. The three
 * qualifying fields are typed as `string | null` and `number | null`,
 * and every request records WHY each one is null: because the route it
 * came in through never asked, or because it asked and the sender left
 * it blank. Those are completely different problems. One is a form
 * design decision Main Event has made for a venue with nothing to book
 * against; the other is a person in a hurry. The first is recovered by
 * asking a better question at the front, the second by picking up the
 * phone.
 *
 * A model that stored a plain `headcount?: number` would collapse both
 * into an absence and the app would have nothing to say about the most
 * interesting thing it found.
 *
 * TWO: THE CLOCK, AND WHOSE CLOCK IT IS.
 *
 * MAIN EVENT PUBLISHES NO RESPONSE TIME ANYWHERE. Not on the Brea page,
 * not on the events pages, not on the contact page. There is no "we will
 * get back to you within one business day" to quote, and nothing in this
 * file pretends otherwise.
 *
 * The commitment below is therefore the VENUE'S OWN, invented for this
 * prototype, and it carries "illustrative" provenance with that stated
 * in the same sentence as the number. It is not a claim about how Main
 * Event operates. It is a claim about how this desk would operate, which
 * is a legitimate thing for a work sample to propose and an indefensible
 * thing for it to imply already exists.
 *
 * THREE: WORK IS DERIVED, NEVER STORED.
 *
 * There is no task list in this application. There is no "to do" column
 * somebody ticks and no owner field somebody forgets to clear. A task
 * exists because a fact about a request is true right now: it has not
 * been answered and the commitment has passed, or it has been answered
 * and still has no date on it, or a quote went out five days ago and
 * nothing came back.
 *
 * The failure that prevents is the one every CRM has. A stored task goes
 * stale the moment the underlying fact changes, so the list fills with
 * work that no longer needs doing, and a list that is mostly wrong is a
 * list people stop opening. Derive it and it cannot lie: change the
 * request, and the task appears, changes or disappears in the same
 * render.
 *
 * AND THE FOURTH THING, WHICH IS NOT HERE.
 *
 * There is no tournament type in this file. Main Event publishes no
 * tournament programme anywhere on mainevent.com: no format, no entry
 * fee, no bracket, no eligibility, no dates. A tournament registration
 * surface would be invented end to end, and an invented product sitting
 * beside real published packages is how a reader stops believing the
 * real ones. Leagues ARE modelled, because Open Lane Socials is a real
 * published brand-wide programme. What is modelled about them is exactly
 * what is published, plus an explicit record of what is not.
 */

// ---------------------------------------------------------------
// Where a request came from
// ---------------------------------------------------------------

/**
 * The route an enquiry arrived through.
 *
 * This is a union rather than a string because the route decides what
 * the venue knows. Two of these are real published forms with field sets
 * that were read off the pages themselves on 11 August 2026; the rest
 * are the ordinary human routes into any venue. A function that takes a
 * channel cannot be handed a value nobody has decided the field set for.
 *
 * Deliberately absent: mainevent.com/book/events, contact-us/change-
 * reservation and contact-us/general-questions. The first is disallowed
 * by Main Event's own robots.txt and the other two return 404. All three
 * are published routes whose field sets could not be read, so they are
 * worth linking and must not be modelled. Inventing a field set for a
 * page nobody can open is the same error as inventing a price.
 */
export type RequestChannel =
  /** The Brea opening-interest form. Six fields, and three of them missing. */
  | "brea-form"
  /** The brand-wide "Want Help Planning Your Party?" events form. */
  | "events-form"
  /** A call to the Brea number, or a voicemail on it. */
  | "phone"
  /** Somebody opened a quote this app sent and replied to it. */
  | "quote-page"
  /** Asked in person, during a go-see or a tabling shift. */
  | "go-see"
  /** Passed on by a chamber, a hotel, or an organisation already booked. */
  | "referral";

export interface RequestChannelMeta {
  label: string;
  /** For a dense row where the full label will not fit. */
  short: string;
  /** Shape before hue, always. Readable in greyscale. */
  glyph: string;
  /** Does this route capture a desired date at all? */
  capturesDate: boolean;
  capturesHeadcount: boolean;
  capturesEventType: boolean;
  /** How this route actually behaves, in one or two sentences. */
  note: string;
  /** Where the field set was read, where there is a page to read. */
  source: string | null;
  /** "public" only where a published page states the field set. */
  provenance: Provenance;
}

export const REQUEST_CHANNEL_META: Record<RequestChannel, RequestChannelMeta> = {
  "brea-form": {
    label: "Brea opening-interest form",
    short: "Brea form",
    glyph: "◻",
    capturesDate: false,
    capturesHeadcount: false,
    capturesEventType: false,
    note: "The form on Brea's own page, headed \"Want More Information About The Opening? Inquire Below!\". It asks for a first name, a last name, an email, a phone number, a company or organisation and 256 characters of free text. It asks for no date, no headcount and no event type, so every enquiry through this route arrives unqualified by design.",
    source: "https://www.mainevent.com/locations/california/brea/",
    provenance: "public",
  },
  "events-form": {
    label: "Brand-wide events enquiry form",
    short: "Events form",
    glyph: "◼",
    capturesDate: true,
    capturesHeadcount: true,
    capturesEventType: true,
    note: "The form headed \"Want Help Planning Your Party?\", published on the events pages and on every open location page. It asks everything the Brea form asks plus a preferred location, a desired date, an event type, an estimated attendee count, a multi-location flag and a free tour of the centre. Brea is not a selectable location on it today, so a sender who finds this form has to pick somewhere else or write Brea into the notes.",
    source: "https://www.mainevent.com/events/",
    provenance: "public",
  },
  phone: {
    label: "Phone or voicemail",
    short: "Phone",
    glyph: "◐",
    capturesDate: true,
    capturesHeadcount: true,
    capturesEventType: true,
    note: "The Brea number is published and no hours are published against it. A call captures whatever the caller happens to say and whatever the person answering thinks to ask, which is why phone enquiries in this queue are the most complete and the least consistent.",
    source: "https://www.mainevent.com/locations/california/brea/",
    provenance: "public",
  },
  "quote-page": {
    label: "Reply to a quote",
    short: "Quote reply",
    glyph: "◑",
    capturesDate: true,
    capturesHeadcount: true,
    capturesEventType: true,
    note: "An organisation this desk already quoted came back on the quote itself. The three qualifying fields are already known because the quote was built from them, which is the whole argument for sending a quote before anybody asked for one.",
    source: null,
    provenance: "illustrative",
  },
  "go-see": {
    label: "Asked during a go-see",
    short: "Go-see",
    glyph: "◒",
    capturesDate: false,
    capturesHeadcount: true,
    capturesEventType: true,
    note: "Asked in person, standing at a counter or a front desk. The headcount is usually right because the person saying it employs the people they are counting. The date almost never exists yet, because the conversation started with the venue rather than with an occasion.",
    source: null,
    provenance: "illustrative",
  },
  referral: {
    label: "Referred by a partner",
    short: "Referral",
    glyph: "◓",
    capturesDate: false,
    capturesHeadcount: false,
    capturesEventType: true,
    note: "Handed on by a chamber, a hotel sales desk or an organisation already on the book. The referrer knows what kind of event it is and rarely knows the numbers, so these arrive warm and thin at the same time.",
    source: null,
    provenance: "illustrative",
  },
};

export const REQUEST_CHANNEL_ORDER: RequestChannel[] = [
  "brea-form",
  "events-form",
  "phone",
  "quote-page",
  "go-see",
  "referral",
];

// ---------------------------------------------------------------
// The three fields that decide whether a request is workable
// ---------------------------------------------------------------

/**
 * The three answers a sales manager cannot quote without.
 *
 * Not a general "required fields" list. These three specifically, because
 * these three are exactly what the Brea form does not ask for and what
 * the brand-wide form does. Without a date you cannot check capacity;
 * without a headcount you cannot pick a package or count lanes; without
 * an event type you do not know whether you are selling a grad night or
 * a staff appreciation lunch. Everything else on an enquiry is nice to
 * have.
 */
export type QualifyingField = "desiredDate" | "headcount" | "eventType";

export const QUALIFYING_FIELD_ORDER: QualifyingField[] = [
  "desiredDate",
  "headcount",
  "eventType",
];

export const QUALIFYING_FIELD_LABEL: Record<QualifyingField, string> = {
  desiredDate: "Desired date",
  headcount: "Estimated attendees",
  eventType: "Event type",
};

/**
 * Why a qualifying field is empty.
 *
 * THIS TYPE IS THE POINT OF THE WHOLE FILE. An absent headcount that the
 * form never asked for and an absent headcount that a person skipped are
 * two different findings and they lead to two different actions. Storing
 * both as `undefined` throws away the distinction, and the distinction
 * is the research.
 */
export type MissingReason =
  /** The route captured it and here it is. */
  | "captured"
  /** This route does not ask. Nobody withheld anything. */
  | "not-asked-by-route"
  /** The route asked and the sender left it blank. */
  | "asked-and-left-blank"
  /** The sender answered, and the answer was that they do not know yet. */
  | "sender-does-not-know";

export const MISSING_REASON_LABEL: Record<MissingReason, string> = {
  captured: "Captured",
  "not-asked-by-route": "Route does not ask",
  "asked-and-left-blank": "Asked, left blank",
  "sender-does-not-know": "Sender does not know yet",
};

// ---------------------------------------------------------------
// The lifecycle
// ---------------------------------------------------------------

/**
 * Where an inbound enquiry stands.
 *
 * THE THREE LOSING STATES ARE THE REASON THIS IS NINE VALUES AND NOT
 * FIVE. Any lifecycle can get from "new" to "won" in four steps, and a
 * status list that only describes that path produces a board where
 * everything looks fine, because the enquiries that went wrong quietly
 * left the board.
 *
 * So "lost", "gone-quiet" and "lapsed" are first-class states, and they
 * are three different failures with three different owners:
 *
 *   LOST is the honest one. They said no, or they booked elsewhere, and
 *   they told us. The reason is worth more than the booking was.
 *
 *   GONE-QUIET is theirs. We answered, we did the work, and they stopped
 *   replying. It is recoverable and it has a shelf life.
 *
 *   LAPSED IS OURS. The enquiry sat past the response commitment until
 *   it stopped being live. Nobody said no. Nobody said anything. This is
 *   the state a stored task list never shows you, and it is the only one
 *   on this list that is entirely the venue's own doing, which is why it
 *   is named separately rather than being folded into "lost".
 */
export type RequestStatus =
  /** Arrived. Nobody has replied yet. The clock is running. */
  | "new"
  /** A holding reply went out. Not yet qualified, not yet quoted. */
  | "acknowledged"
  /** Chasing the fields the form did not capture. */
  | "qualifying"
  /** A quote or a proposal is out and we are waiting. */
  | "quoted"
  /** A date is held and nothing is signed. Worth nothing until it is. */
  | "held"
  /** Signed. There should be a line in the book against this. */
  | "won"
  /** They said no, or they went elsewhere, and they told us. */
  | "lost"
  /** We answered, they stopped replying. Recoverable, for a while. */
  | "gone-quiet"
  /** Never answered in time and now cold. The venue's own failure. */
  | "lapsed";

export interface RequestStatusMeta {
  label: string;
  short: string;
  /** Shape before hue, always. */
  glyph: string;
  cssVar: string;
  /** True while the enquiry can still become a booking. */
  open: boolean;
  /** One sentence a legend or a tooltip can carry. */
  note: string;
}

/**
 * The glyph set runs the same filling-circle idea as PITCH_STATUS in
 * vocabulary.ts, for the plain reason that a reader who has learned it
 * on one screen should not have to learn it again on another. The three
 * closed states break the sequence, because they are the sequence
 * stopping rather than a further stage of filling.
 */
export const REQUEST_STATUS_META: Record<RequestStatus, RequestStatusMeta> = {
  new: {
    label: "New",
    short: "New",
    glyph: "○",
    cssVar: "var(--info)",
    open: true,
    note: "Arrived and unanswered. The response commitment is the only thing that matters on this row.",
  },
  acknowledged: {
    label: "Acknowledged",
    short: "Ack",
    glyph: "◔",
    cssVar: "var(--info)",
    open: true,
    note: "Somebody replied. That stops the response clock and starts a different one.",
  },
  qualifying: {
    label: "Qualifying",
    short: "Qualify",
    glyph: "◑",
    cssVar: "var(--warn)",
    open: true,
    note: "Recovering the date, the headcount or the event type that the enquiry arrived without.",
  },
  quoted: {
    label: "Quoted",
    short: "Quoted",
    glyph: "◕",
    cssVar: "var(--accent)",
    open: true,
    note: "A quote is out. Nothing is held and nothing is signed.",
  },
  held: {
    label: "Date held",
    short: "Held",
    glyph: "◉",
    cssVar: "var(--accent)",
    open: true,
    note: "A date is held against no deposit. It converts or it releases, and it should never simply sit.",
  },
  won: {
    label: "Won",
    short: "Won",
    glyph: "●",
    cssVar: "var(--ok)",
    open: false,
    note: "Signed. There should be a matching line in the book, and if there is not, that is a task.",
  },
  lost: {
    label: "Lost",
    short: "Lost",
    glyph: "✕",
    cssVar: "var(--risk)",
    open: false,
    note: "They said no and told us why. Recorded rather than hidden, because the reason outlives the enquiry.",
  },
  "gone-quiet": {
    label: "Gone quiet",
    short: "Quiet",
    glyph: "◌",
    cssVar: "var(--neutral)",
    open: true,
    note: "We answered and they stopped replying. Still recoverable, and it has a shelf life.",
  },
  lapsed: {
    label: "Lapsed",
    short: "Lapsed",
    glyph: "⊘",
    cssVar: "var(--risk)",
    open: false,
    note: "Sat past the response commitment until it went cold. Nobody said no. This one is the venue's own.",
  },
};

export const REQUEST_STATUS_ORDER: RequestStatus[] = [
  "new",
  "acknowledged",
  "qualifying",
  "quoted",
  "held",
  "won",
  "lost",
  "gone-quiet",
  "lapsed",
];

// ---------------------------------------------------------------
// The clock
// ---------------------------------------------------------------

/**
 * The venue's own response commitment.
 *
 * READ THE PROVENANCE BEFORE THE NUMBER. Main Event publishes no
 * response time anywhere: not on the Brea page, not on the events pages,
 * not on the contact page, not in the confirmation copy. There is no
 * published service level to quote and this app does not invent one on
 * Main Event's behalf.
 *
 * What follows is a commitment this desk would make, which is a
 * different kind of statement and is labelled as one everywhere it
 * renders.
 *
 * FOUR WORKING HOURS, and the reason it is four rather than a
 * comfortable twenty four is arithmetic off a figure Main Event DOES
 * publish. The standard booking terms require a minimum five-day notice
 * and a fifty per cent deposit. An enquiry that arrives on a Monday
 * asking about the following Monday has five days in hand. Reply on
 * Wednesday and the booking is already outside Main Event's own published
 * notice period, and the answer has to be no to a group that was ready
 * to say yes. The clock is short because the published terms are what
 * make it short.
 */
export const RESPONSE_COMMITMENT = {
  hours: 4,
  label: "Four working hours",
  what: "Every inbound enquiry gets a human reply within four working hours of arriving, whether or not there is an answer yet.",
  why: "Main Event publishes a minimum five-day booking notice and a fifty per cent deposit. A reply that takes two days has spent nearly half of a short-notice group's runway before the conversation starts.",
  disclosure:
    "Main Event publishes no response time anywhere on its site. This commitment is the venue's own, invented for this prototype, and it is not a claim about how Main Event operates.",
  provenance: "illustrative" as Provenance,
  source: null,
} as const;

/**
 * Working hours, for the clock only.
 *
 * A four-hour commitment that ran through the night would mark an
 * enquiry received at 10pm as overdue before anybody was awake, which
 * would be a lie about the desk rather than a measure of it. The window
 * is 9am to 6pm at the venue, and the clock pauses outside it.
 *
 * These are NOT Main Event's hours. Main Event publishes no hours for
 * Brea at all, which is the central fact of this whole application. They
 * are the hours this desk works, and nothing renders them as a venue
 * opening time.
 */
export const WORKING_DAY = {
  startHour: 9,
  endHour: 18,
  /** Pacific Daylight Time. Fixed rather than read from the browser, so a
   *  screenshot taken anywhere in the world shows the same queue. */
  utcOffsetHours: -7,
  provenance: "illustrative" as Provenance,
} as const;

/**
 * The 256 character limit both published forms put on the notes field.
 *
 * This is a fact, off both pages, and it is load-bearing rather than
 * trivia. Two hundred and fifty six characters is about forty words. It
 * is enough for "we are looking at a graduation night in June for around
 * three hundred and eighty seniors" and it is not enough for anything
 * that would let a sales manager skip the qualifying call. The limit is
 * the reason the qualifying call exists.
 */
export const NOTE_CHARACTER_LIMIT = 256;

export function noteWithinLimit(note: string): boolean {
  return note.length <= NOTE_CHARACTER_LIMIT;
}

// ---------------------------------------------------------------
// Venue-local time arithmetic
// ---------------------------------------------------------------

/**
 * Time maths done in venue-local terms, with a fixed offset.
 *
 * The alternative was to use the browser's own timezone, and it was
 * rejected for a reason worth writing down: this app is a work sample
 * that will be read on somebody else's machine, and a queue whose
 * overdue count changes depending on where the reader is sitting is a
 * queue nobody can check. A fixed offset means the arithmetic is
 * reproducible in a screenshot, in a test, and in a hiring manager's
 * browser in a different state.
 */
const MS_PER_HOUR = 3_600_000;

function toVenueMs(iso: string): number {
  return Date.parse(iso) + WORKING_DAY.utcOffsetHours * MS_PER_HOUR;
}

/**
 * The inverse of toVenueMs. Reads the wall-clock fields off the shifted
 * instant, then stamps the offset they were read in, so the string round
 * trips through Date.parse back to the same moment.
 */
function fromVenueMs(venueMs: number): string {
  const local = new Date(venueMs);
  const pad = (n: number) => String(n).padStart(2, "0");
  const offset = WORKING_DAY.utcOffsetHours;
  const sign = offset <= 0 ? "-" : "+";
  const abs = Math.abs(offset);
  return (
    `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}` +
    `T${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}:00${sign}${pad(abs)}:00`
  );
}

/** Venue-local hour of day, 0 to 23. */
export function venueHour(iso: string): number {
  return new Date(toVenueMs(iso)).getUTCHours();
}

/**
 * Venue-local calendar date, as YYYY-MM-DD.
 *
 * A bare date passes straight through. Date.parse reads "2026-12-11" as
 * UTC midnight, so shifting it into venue time would hand back the tenth,
 * and a held date rendered one day early is the single most damaging
 * off-by-one this application could ship.
 */
export function venueDate(iso: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const d = new Date(toVenueMs(iso));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/**
 * When a reply is due, counting only working hours.
 *
 * An enquiry that arrives at 5pm is due at 10am the next morning, not at
 * 9pm the same evening. An enquiry that arrives at 7am is treated as
 * arriving at 9am, because that is when somebody could first have seen
 * it. Weekends are deliberately NOT skipped: a venue whose whole trade
 * is Friday and Saturday nights does not get to treat Saturday as a day
 * the phone is not answered.
 */
export function responseDueFrom(receivedAt: string): string {
  const dayMs = 24 * MS_PER_HOUR;
  let cursor = toVenueMs(receivedAt);
  const startOfDay = Math.floor(cursor / dayMs) * dayMs;

  const openAt = startOfDay + WORKING_DAY.startHour * MS_PER_HOUR;
  const closeAt = startOfDay + WORKING_DAY.endHour * MS_PER_HOUR;

  if (cursor < openAt) cursor = openAt;
  if (cursor >= closeAt) cursor = openAt + dayMs;

  let remaining = RESPONSE_COMMITMENT.hours * MS_PER_HOUR;
  while (remaining > 0) {
    const dayStart = Math.floor(cursor / dayMs) * dayMs;
    const dayClose = dayStart + WORKING_DAY.endHour * MS_PER_HOUR;
    const available = dayClose - cursor;
    if (remaining <= available) {
      cursor += remaining;
      remaining = 0;
    } else {
      remaining -= available;
      cursor = dayStart + dayMs + WORKING_DAY.startHour * MS_PER_HOUR;
    }
  }
  return fromVenueMs(cursor);
}

/** Working hours between two instants, counting only 9am to 6pm. */
export function workingHoursBetween(fromIso: string, toIso: string): number {
  const dayMs = 24 * MS_PER_HOUR;
  const from = toVenueMs(fromIso);
  const to = toVenueMs(toIso);
  if (to <= from) return 0;

  let total = 0;
  let dayStart = Math.floor(from / dayMs) * dayMs;
  while (dayStart < to) {
    const open = dayStart + WORKING_DAY.startHour * MS_PER_HOUR;
    const close = dayStart + WORKING_DAY.endHour * MS_PER_HOUR;
    const a = Math.max(from, open);
    const b = Math.min(to, close);
    if (b > a) total += b - a;
    dayStart += dayMs;
  }
  return Math.round((total / MS_PER_HOUR) * 10) / 10;
}

// ---------------------------------------------------------------
// The request itself
// ---------------------------------------------------------------

/**
 * One inbound enquiry.
 *
 * `prospectId` and `organisationName` are a deliberate either-or rather
 * than one optional field. An enquiry that maps to a row in prospects.ts
 * inherits a hundred things this app already knows: the lane, the
 * decision maker's title, the buying window, the mileage, the headcount
 * range, whether anybody has already written to them this period. An
 * enquiry that does not is a walk-in, and the honest record of a walk-in
 * is a descriptor rather than a row pretending to be research.
 *
 * NOTE WHAT IS NOT ON THIS TYPE: a person's name. Both published forms
 * ask for a first name and a last name, and the type still does not
 * carry one, because every request in this app is invented and an
 * invented human name attached to a real named organisation is the one
 * fabrication a reader would take personally. `contactRole` carries the
 * job title instead, which is what a sales manager actually works from.
 */
export interface GroupRequest {
  id: string;
  channel: RequestChannel;
  /** A row in prospects.ts, or null when this is a walk-in. */
  prospectId: string | null;
  /**
   * Free text organisation, used only where `prospectId` is null. These
   * are descriptors and not brand names: "Youth soccer club, Placentia"
   * rather than an invented business, because an invented business in a
   * real trade area is a claim about somebody who exists.
   */
  organisationName: string | null;
  /** A role, never a name. */
  contactRole: string;
  lane: Lane;
  /**
   * A reserved unroutable address, per RFC 2606, exactly as the outbound
   * half of this app uses DEMO_RECIPIENT. Both published forms capture a
   * real email, so the field is real; seeding a plausible address against
   * a real named organisation would not be.
   */
  email: string | null;
  /**
   * Null in every seeded row. Both forms capture a phone number and the
   * type carries it, but a phone number is the one contact detail that
   * cannot be made obviously fictional the way an .invalid address can.
   */
  phone: string | null;
  /** The free-text note, inside the published 256 character limit. */
  note: string;
  /** One line on what they are actually asking for. */
  askSummary: string;
  /** The package this desk would open with. A real published package id. */
  suggestedPackageId: string | null;

  // The three qualifying fields. Null is a finding, not a gap.
  desiredDate: string | null;
  headcount: number | null;
  eventType: string | null;
  /** Why each qualifying field holds what it holds. */
  fieldReasons: Record<QualifyingField, MissingReason>;

  /** Brand-wide events form only. Null means the route never asked. */
  freeTourRequested: boolean | null;
  multiLocation: boolean | null;

  receivedAt: string;
  /** Always `responseDueFrom(receivedAt)`. Stored so it can be checked. */
  responseDueAt: string;
  status: RequestStatus;
  /** When a human first replied. Null while the response clock still runs. */
  firstRespondedAt: string | null;
  /** The most recent contact in either direction. Drives the follow-up clock. */
  lastContactAt: string | null;
  /**
   * A date the two sides actually agreed to speak again, where there is
   * one. Null the rest of the time.
   *
   * It overrides the generic follow-up interval whenever it falls later,
   * and never when it falls earlier. A group that has told you their
   * procurement takes three to four weeks has told you when to come
   * back, and a tool that chases them on day five anyway is a tool that
   * teaches its user to ignore it. The one-sided version of that rule is
   * deliberate: an agreed date can push a follow-up out, and it can
   * never be used to let one sit longer than the desk's own interval
   * would have allowed.
   */
  agreedNextStepAt: string | null;
  closedAt: string | null;
  /** Why it closed, in their words where we have them. */
  closeReason: string | null;
  provenance: Record<string, Provenance>;
}

/** Which of the three qualifying fields this request still does not have. */
export function missingQualifiers(r: GroupRequest): QualifyingField[] {
  const out: QualifyingField[] = [];
  if (r.desiredDate === null) out.push("desiredDate");
  if (r.headcount === null) out.push("headcount");
  if (r.eventType === null) out.push("eventType");
  return out;
}

/** Has this request got everything a quote needs? */
export function isQualified(r: GroupRequest): boolean {
  return missingQualifiers(r).length === 0;
}

/**
 * Of the missing fields, which were never asked for by the route.
 *
 * This is the number the intake screen exists to show. It separates what
 * the sender withheld from what Main Event's own form never requested,
 * and only the second of those is fixable by changing a form.
 */
export function unaskedQualifiers(r: GroupRequest): QualifyingField[] {
  return missingQualifiers(r).filter(
    (f) => r.fieldReasons[f] === "not-asked-by-route",
  );
}

/** A label for the organisation, whichever kind of request this is. */
export function requestOrganisationLabel(
  r: GroupRequest,
  nameForProspectId: (id: string) => string | undefined,
): string {
  if (r.prospectId) {
    return nameForProspectId(r.prospectId) ?? r.prospectId;
  }
  return r.organisationName ?? "Organisation not recorded";
}

// ---------------------------------------------------------------
// Leagues
// ---------------------------------------------------------------

/**
 * Open Lane Socials, as Main Event publishes it on 11 August 2026.
 *
 * This type exists to hold a real programme and an honest hole in the
 * same object, because that combination is the finding.
 *
 * WHAT IS REAL: Main Event runs a brand-wide league product called Open
 * Lane Socials, under the banner Main Event Social Leagues, at
 * mainevent.com/the-leagues. It is currently marketed as open for
 * registration, it plays Tuesday, Wednesday or Thursday at the
 * participant's choice, it carries an exclusive menu, fifteen per cent
 * off the next season and nightly prizes, and there is a national
 * leaderboard across centres. Registration is handed off to a third
 * party at leaguepals.com/mainevent.
 *
 * WHAT IS NOT PUBLISHED: the price, the season length, the number of
 * weeks, the team size and the start date. None of the five appears
 * anywhere on the page. Bowlero and Lucky Strike withhold league pricing
 * in exactly the same way, so this is a category-wide withholding rather
 * than a Main Event quirk, and the app should not claim otherwise.
 *
 * WHAT IS NOT ANNOUNCED FOR BREA: everything. The leagues page says
 * select locations and names three, all in Colorado. No California venue
 * publishes a league, including Montclair, which is open. The Brea page
 * links to the leagues page in its own navigation and makes no league
 * claim of its own.
 *
 * The distinction between "withheld" and "unannounced" is the whole
 * reason this is a type. A price Main Event has decided not to publish
 * is a fact that exists; a Brea league is a thing that has not been said
 * to exist at all. Rendering both as "unknown" would flatten a sourced
 * commercial finding into a shrug.
 */
export interface UnpublishedLeagueFact {
  field: string;
  note: string;
  provenance: Provenance;
}

export interface LeagueProgramme {
  id: string;
  /** "Open Lane Socials". */
  name: string;
  /** "Main Event Social Leagues". */
  bannerName: string;
  /** Main Event's own words. */
  registrationStatus: string;
  /** Tuesday, Wednesday or Thursday, participant's choice. */
  playNights: string[];
  perks: string[];
  leaderboardNote: string;
  /** The only locations named on the page. All three are in Colorado. */
  namedLocations: string[];
  registrationUrl: string;
  /** Everything the page does not publish, each with its own reasoning. */
  unpublished: UnpublishedLeagueFact[];
  /**
   * Brea's participation. One value today and it is not "no": Main Event
   * has not said either way, and recording it as a refusal would be
   * inventing a decision.
   */
  breaStatus: "unannounced";
  breaNote: string;
  source: string;
  provenance: Provenance;
}

/**
 * Somebody asking about a league, at a venue that has not announced one.
 *
 * This is not a registration. There is nothing to register for at Brea
 * and this app will not pretend there is, so a LeagueInterest records an
 * ask and an honest answer rather than a sign-up.
 *
 * It earns its place because the ask is real commercial information. A
 * corporate team asking about a midweek league is telling a pre-opening
 * sales manager that there is midweek demand in the trade area, on
 * exactly the Tuesday to Thursday nights the brand-wide programme plays
 * and exactly the nights a venue struggles to fill. That is worth
 * recording whether or not Brea ever runs a league, and it is worth
 * carrying to whoever decides which locations get one next.
 */
export interface LeagueInterest {
  id: string;
  prospectId: string | null;
  organisationName: string | null;
  contactRole: string;
  lane: Lane;
  email: string | null;
  receivedAt: string;
  /** How many bowlers they think they would bring. Their number, not ours. */
  bowlersExpected: number | null;
  /** Which of the published play nights suits them, in their words. */
  preferredNights: string[];
  note: string;
  /**
   * What can honestly be said back today. Not a status on a pipeline; a
   * record of the answer the venue is able to give.
   */
  answerable: "published-brand-wide" | "unannounced-for-brea";
  /** The answer this desk would actually send. */
  standingAnswer: string;
  /**
   * When somebody actually sent it. Null while the ask is unanswered.
   *
   * A league ask is on the same response commitment as any other inbound
   * enquiry, and deliberately so. "We cannot help you with that" inside
   * four hours is a good answer; the same words nine days later is a
   * venue that ignored somebody offering it twenty four midweek bowlers.
   */
  answeredAt: string | null;
  provenance: Record<string, Provenance>;
}

// ---------------------------------------------------------------
// Derived work
// ---------------------------------------------------------------

/**
 * What kind of work a request is currently generating.
 *
 * There is exactly one task kind per request at any moment, and that is
 * a design constraint rather than a coincidence. A request that produced
 * three tasks would be counted three times in every bucket, and the
 * first thing anybody does with a queue is add up the buckets. One
 * request, at most one task, and the arithmetic closes on its own.
 */
export type TaskKind =
  /** Never answered, still inside the commitment. */
  | "answer"
  /** Never answered and the commitment has passed. */
  | "answer-overdue"
  /** Answered, and still missing a date, a headcount or an event type. */
  | "recover-qualifiers"
  /** Qualified and unquoted. Send the thing. */
  | "send-quote"
  /** Quote is out and has been out a while. */
  | "chase-quote"
  /** A date is held against nothing. Convert it or release it. */
  | "convert-hold"
  /** They stopped replying. One more attempt, then diary the window. */
  | "revive-quiet"
  /** Marked won with no line in the book. The two ledgers disagree. */
  | "reconcile-book"
  /** Lapsed. Nothing to sell; something to learn. */
  | "record-lapse"
  /** A league ask, at a venue with no announced league. */
  | "answer-league-interest";

export interface TaskKindMeta {
  label: string;
  glyph: string;
  cssVar: string;
  note: string;
}

export const TASK_KIND_META: Record<TaskKind, TaskKindMeta> = {
  answer: {
    label: "Answer",
    glyph: "○",
    cssVar: "var(--info)",
    note: "Unanswered and still inside the response commitment.",
  },
  "answer-overdue": {
    label: "Answer, overdue",
    glyph: "◉",
    cssVar: "var(--risk)",
    note: "Unanswered past the response commitment. Nothing else on the queue outranks this.",
  },
  "recover-qualifiers": {
    label: "Recover the missing fields",
    glyph: "◑",
    cssVar: "var(--warn)",
    note: "Answered, and still without a date, a headcount or an event type.",
  },
  "send-quote": {
    label: "Send the quote",
    glyph: "◕",
    cssVar: "var(--accent)",
    note: "Everything a quote needs is on the record and no quote has gone out.",
  },
  "chase-quote": {
    label: "Chase the quote",
    glyph: "◕",
    cssVar: "var(--warn)",
    note: "A quote has been sitting with them longer than a quote should sit.",
  },
  "convert-hold": {
    label: "Convert or release the hold",
    glyph: "◉",
    cssVar: "var(--accent)",
    note: "A date is held against no deposit, which is a date nobody else can be offered.",
  },
  "revive-quiet": {
    label: "One more attempt",
    glyph: "◌",
    cssVar: "var(--neutral)",
    note: "They stopped replying. One more attempt, then diary their buying window instead.",
  },
  "reconcile-book": {
    label: "Reconcile with the book",
    glyph: "●",
    cssVar: "var(--ok)",
    note: "Marked won with no matching line in the book. One of the two is wrong.",
  },
  "record-lapse": {
    label: "Write down what lapsed",
    glyph: "⊘",
    cssVar: "var(--risk)",
    note: "Nothing to sell here. Something to learn, and it will not learn itself.",
  },
  "answer-league-interest": {
    label: "Answer the league ask",
    glyph: "◇",
    cssVar: "var(--info)",
    note: "Somebody asked about a league at a venue that has not announced one. The honest answer is still an answer.",
  },
};

/**
 * One line of the reasoning behind a task's rank.
 *
 * Same shape as ScoreComponent on the desk, on purpose. A reader who has
 * opened one score breakdown in this app has opened all of them.
 */
export interface TaskReason {
  label: string;
  points: number;
  why: string;
}

/**
 * A task, derived.
 *
 * `id` is composed from the kind and the request rather than allocated,
 * so the same fact always produces the same task and React can key on it
 * across renders without anything being stored anywhere.
 */
export interface DerivedTask {
  id: string;
  kind: TaskKind;
  /** The request or the league interest this work came from. */
  requestId: string;
  prospectId: string | null;
  organisationName: string;
  lane: Lane;
  status: RequestStatus | null;
  /** The fact that made this task exist. Reads as a sentence. */
  because: string;
  /** What to actually do, in plain words. */
  action: string;
  dueAt: string;
  /** Working hours past due. Zero or more; null when not yet due. */
  hoursLate: number | null;
  score: number;
  reasons: TaskReason[];
}
