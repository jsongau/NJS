import type { Lane, Provenance } from "@/domain/types";

/**
 * THE INBOUND HALF.
 *
 * Everything else in this console is outbound. Three hundred and twenty nine
 * organisations, nine lanes, a desk that decides who to write to on a
 * Tuesday morning. That half of the job is a search problem: the work
 * only exists once somebody goes and finds it.
 *
 * Inbound is the opposite kind of problem and it is the one that loses
 * money quietly. A lead arrives on its own, it arrives with a clock
 * already running, and the only way to fail it is to do nothing. Nobody
 * writes down "did not ring the homeowner in Placentia for four days".
 * There is no report that shows it. The enquiry simply stops mattering
 * to the person who sent it, and by the time anyone looks the job has
 * gone to whoever answered that afternoon.
 *
 * SPEED TO LEAD IS THE SUBJECT OF THIS FILE. Champions Group Holdings
 * publishes a Digital Marketing Specialist posting in Brea whose scope,
 * in its own words, is to configure speed-to-lead systems across LSA,
 * Yelp and HomeAdvisor and to own reporting on metrics such as call
 * answer rates. The company has written down that answering fast is the
 * job. A lead that sits nineteen days is not a stale row on a board. It
 * is money that went to whoever picked up.
 *
 * So this file models three things and refuses to model a fourth.
 *
 * ONE: WHAT EACH ROUTE ACTUALLY CAPTURES.
 *
 * A lead does not arrive as a lead. It arrives as whatever the route it
 * came through happened to ask for, and the routes ask for wildly
 * different things. A Google Local Services Ad hands over a name, a
 * phone number and Google's own broad category and nothing else: no
 * property address, no preferred window, and a category nobody can
 * price a job from. A form on a landing page asks for the address and
 * the window, because the brand wrote the questions. A call captures
 * whatever the person answering thought to ask. A marketplace lead
 * arrives as a project description and, on Yelp, with no phone number
 * at all.
 *
 * That difference is the most useful intake fact this console holds, and
 * the model makes it visible rather than smoothing it over. The three
 * qualifying fields are typed as `string | null` and `number | null`,
 * and every request records WHY each one is null: because the route it
 * came in through never asked, or because it asked and the sender left
 * it blank. Those are completely different problems. One is a decision
 * somebody made about a form or a bid; the other is a person in a hurry.
 * The first is recovered by asking a better question at the front, the
 * second by picking up the phone.
 *
 * A model that stored a plain `headcount?: number` would collapse both
 * into an absence, and the console would have nothing to say about the
 * most interesting thing it found.
 *
 * TWO: THE CLOCK, AND WHOSE CLOCK IT IS.
 *
 * NONE OF THE FIVE WEST DIVISION BRAND SITES PUBLISHES A RESPONSE TIME.
 * Not Service Champions, not ASI, not Adeedo, not Powell, not Timo's.
 * The nearest thing in the market is a rival's sixty minute emergency
 * response claim, and that is a rival's claim rather than one of these
 * brands'. There is no published service level to quote and nothing in
 * this file pretends otherwise.
 *
 * The commitment below is therefore THIS CONSOLE'S OWN, invented for a
 * work sample, and it carries "illustrative" provenance with that stated
 * in the same sentence as the number. It is not a claim about how any
 * Champions brand operates. It is a claim about how this desk would
 * operate, which is a legitimate thing for a work sample to propose and
 * an indefensible thing for it to imply already exists.
 *
 * THREE: WORK IS DERIVED, NEVER STORED.
 *
 * There is no task list in this console. There is no "to do" column
 * somebody ticks and no owner field somebody forgets to clear. A task
 * exists because a fact about a lead is true right now: it has not been
 * answered and the commitment has passed, or it has been answered and
 * still has no address on it, or an estimate went out five days ago and
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
 * There is no membership PRICE in this file. Service Champions publishes
 * CHAMP-Rewards by name and publishes no monthly or annual figure for it
 * anywhere, and neither does a single one of the thirteen rivals
 * profiled for this console. Inventing a number for a plan a brand has
 * deliberately declined to price would be the one fabrication a
 * marketing reader would spot on sight. The programme IS modelled,
 * because it is real and published. What is modelled about it is exactly
 * what is published, plus an explicit record of what is not.
 */

// ---------------------------------------------------------------
// Where a request came from
// ---------------------------------------------------------------

/**
 * The route a lead arrived through.
 *
 * This is a union rather than a string because the route decides what
 * the brand knows before anybody picks up a phone. The six values are
 * the routes the Champions Group postings name for themselves: Local
 * Services Ads, web forms paid and organic, inbound calls, the
 * marketplaces, replies to estimates already sent, and referrals.
 *
 * THE KEYS ARE NOT THE LABELS. What is written below the comment on each
 * line is an internal identifier that other files sort, filter and key
 * off. The label a reader sees lives in the metadata underneath, and it
 * is the only one of the two that is allowed to change wording.
 *
 * Deliberately absent: a separate value for paid search against organic
 * search. Both land on the same form, that form asks the same questions
 * either way, and this file is about what a route CAPTURES rather than
 * what it cost to buy. Where the click came from belongs on the spend
 * screen, beside the money. Splitting the union on a distinction that
 * changes no field would be modelling the media plan and calling it
 * intake.
 *
 * Also absent, and this is the honest limit of the file: a field set
 * read off a live page. No Champions brand publishes the schema of its
 * intake forms and neither Google nor the marketplaces publish theirs in
 * anything this console can cite. Every field set below is this
 * console's own reading of how those routes behave in practice, and
 * every one of them carries illustrative provenance saying exactly that.
 */
export type RequestChannel =
  /** A Google Local Services Ad lead. The thinnest route and the busiest. */
  | "brea-form"
  /** A form on a landing page or on the brand site. Paid or organic. */
  | "events-form"
  /** A call to a tracked number, or a voicemail on it. */
  | "phone"
  /** Somebody opened an estimate this console sent and replied to it. */
  | "quote-page"
  /** A marketplace lead: Yelp, HomeAdvisor or Angi. */
  | "go-see"
  /** Passed on by a partner, a property manager or a past customer. */
  | "referral";

export interface RequestChannelMeta {
  label: string;
  /** For a dense row where the full label will not fit. */
  short: string;
  /** Shape before hue, always. Readable in greyscale. */
  glyph: string;
  /** Does this route capture a preferred window at all? */
  capturesDate: boolean;
  capturesHeadcount: boolean;
  capturesEventType: boolean;
  /** How this route actually behaves, in one or two sentences. */
  note: string;
  /** Where the field set was read, where there is a page to read it on. */
  source: string | null;
  /** "public" only where a published page states the field set. Nothing
      in this market does, so every row below is illustrative. */
  provenance: Provenance;
}

export const REQUEST_CHANNEL_META: Record<RequestChannel, RequestChannelMeta> = {
  "brea-form": {
    label: "Google Local Services Ad",
    short: "LSA",
    glyph: "◻",
    capturesDate: false,
    capturesHeadcount: false,
    capturesEventType: false,
    note: "Google hands over a name, a phone number and one of its own broad service categories, and the lead is billed on arrival whether or not anybody answers it. It carries no property address, no preferred window and no job description a technician could be dispatched against, so every lead through this route arrives unqualified by design. It is also the busiest route on this board, which is why the group's own Digital Marketing Specialist posting is built around answering these first.",
    source: null,
    provenance: "illustrative",
  },
  "events-form": {
    label: "Web form, paid or organic",
    short: "Web form",
    glyph: "◼",
    capturesDate: true,
    capturesHeadcount: true,
    capturesEventType: true,
    note: "The brand's own form, whether it sits on a paid landing page or on the site itself. It asks for the property address, a preferred window and what has actually gone wrong, because the brand wrote the questions rather than renting them. It is the only route on this board that arrives ready to schedule, and that difference is the commercial argument for owning the form instead of buying the click.",
    source: null,
    provenance: "illustrative",
  },
  phone: {
    label: "Inbound call or voicemail",
    short: "Call",
    glyph: "◐",
    capturesDate: true,
    capturesHeadcount: true,
    capturesEventType: true,
    note: "A tracked number, answered by whoever is on the desk. A call captures whatever the caller happens to say and whatever the person answering thinks to ask, which is why calls in this queue are the most complete record on the board and the least consistent one.",
    source: null,
    provenance: "illustrative",
  },
  "quote-page": {
    label: "Reply to an estimate",
    short: "Estimate reply",
    glyph: "◑",
    capturesDate: true,
    capturesHeadcount: true,
    capturesEventType: true,
    note: "Somebody this desk had already sent a priced estimate to came back on the estimate itself. All three qualifying answers are already known, because the estimate was built out of them. That is the whole argument for putting a priced proposal in front of a household before anybody asks for one.",
    source: null,
    provenance: "illustrative",
  },
  "go-see": {
    label: "Marketplace lead",
    short: "Marketplace",
    glyph: "◒",
    capturesDate: false,
    capturesHeadcount: true,
    capturesEventType: true,
    note: "Yelp, HomeAdvisor and Angi, filed together because they behave the same way: the job and the property come through, the window never does, and the same lead is sold to two or three other contractors at the same moment. One difference is worth knowing before ringing: a Yelp request arrives as a message with no phone number attached to it at all, so the only route back is the platform's own inbox and the clock runs faster than it looks.",
    source: null,
    provenance: "illustrative",
  },
  referral: {
    label: "Partner or customer referral",
    short: "Referral",
    glyph: "◓",
    capturesDate: false,
    capturesHeadcount: false,
    capturesEventType: true,
    note: "Handed on by a property manager, a partner or a household already on the book. The referrer knows what has broken and rarely knows the address or the schedule, so these arrive warm and thin at the same time. They are also the only lead on this board that cost nothing to acquire, which is the argument for the partner lanes on the outbound half.",
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
 * The three answers nobody can price a job without.
 *
 * Not a general "required fields" list. These three specifically,
 * because these three are exactly what a Local Services Ad lead does not
 * carry and what the brand's own web form does. Without a window you
 * cannot dispatch anybody; without knowing how many properties or units
 * are involved you cannot tell whether this is one van for an afternoon
 * or a schedule across a fortnight; without a job type you do not know
 * whether you are selling a drain clearing under a hundred dollars or a
 * full system replacement. Everything else on a lead is nice to have.
 */
export type QualifyingField = "desiredDate" | "headcount" | "eventType";

export const QUALIFYING_FIELD_ORDER: QualifyingField[] = [
  "desiredDate",
  "headcount",
  "eventType",
];

export const QUALIFYING_FIELD_LABEL: Record<QualifyingField, string> = {
  desiredDate: "Preferred window",
  headcount: "Properties or units",
  eventType: "Job type",
};

/**
 * Why a qualifying field is empty.
 *
 * THIS TYPE IS THE POINT OF THE WHOLE FILE. An absent address that the
 * route never asked for and an absent address that a person skipped are
 * two different findings and they lead to two different actions. One is
 * fixed by changing a form or a bid and stays fixed; the other is fixed
 * by one phone call and comes back tomorrow. Storing both as `undefined`
 * throws the distinction away, and the distinction is the finding.
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
 * Where an inbound lead stands.
 *
 * THE THREE LOSING STATES ARE THE REASON THIS IS NINE VALUES AND NOT
 * FIVE. Any lifecycle can get from "new" to "won" in four steps, and a
 * status list that only describes that path produces a board where
 * everything looks fine, because the leads that went wrong quietly left
 * the board.
 *
 * So "lost", "gone-quiet" and "lapsed" are first-class states, and they
 * are three different failures with three different owners:
 *
 *   LOST is the honest one. They said no, or they went with somebody
 *   else, and they told us why. On a board where every rival prices
 *   within a few dollars of every other rival, the reason is worth more
 *   than the job was, which is why it is written down instead of tidied
 *   away.
 *
 *   GONE-QUIET is theirs. We answered, we did the work, and they stopped
 *   replying. It is recoverable and it has a shelf life.
 *
 *   LAPSED IS OURS. The lead sat past the response commitment until it
 *   stopped being live. Nobody said no. Nobody said anything. The money
 *   that bought it was spent the moment it arrived and it bought
 *   nothing. This is the state a stored task list never shows you, and
 *   it is the only one on this list that belongs entirely to the brand,
 *   which is why it is named separately rather than folded into "lost".
 */
export type RequestStatus =
  /** Arrived. Nobody has replied yet. The clock is running. */
  | "new"
  /** A holding reply went out. Not yet qualified, not yet estimated. */
  | "acknowledged"
  /** Chasing the answers the route did not capture. */
  | "qualifying"
  /** An estimate or a proposal is out and we are waiting. */
  | "quoted"
  /** A slot is held and nothing is signed. Worth nothing until it is. */
  | "held"
  /** Signed. There should be a line in the book against this. */
  | "won"
  /** They said no, or they went elsewhere, and they told us. */
  | "lost"
  /** We answered, they stopped replying. Recoverable, for a while. */
  | "gone-quiet"
  /** Never answered in time and now cold. The brand's own failure. */
  | "lapsed";

export interface RequestStatusMeta {
  label: string;
  short: string;
  /** Shape before hue, always. */
  glyph: string;
  cssVar: string;
  /** True while the lead can still become a job. */
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
    note: "Recovering the window, the property detail or the job type that the lead arrived without.",
  },
  quoted: {
    label: "Quoted",
    short: "Quoted",
    glyph: "◕",
    cssVar: "var(--accent)",
    open: true,
    note: "An estimate is out. Nothing is scheduled and nothing is signed.",
  },
  held: {
    label: "Slot held",
    short: "Held",
    glyph: "◉",
    cssVar: "var(--accent)",
    open: true,
    note: "An install date is held against no deposit. It converts or it releases, and it should never simply sit.",
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
    note: "They said no and told us why. Recorded rather than hidden, because in a market this tightly priced the reason outlives the job.",
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
    note: "Sat past the response commitment until it went cold. Nobody said no. The lead was paid for and it bought nothing. This one is the brand's own.",
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
 * This console's own response commitment.
 *
 * READ THE PROVENANCE BEFORE THE NUMBER. None of the five West Division
 * brand sites publishes a response time: not Service Champions, not ASI,
 * not Adeedo, not Powell, not Timo's. The only numeric speed claim
 * anywhere in the scrape belongs to a rival, and a rival's promise is
 * not a service level this desk can be held to. There is nothing to
 * quote and this console does not invent one on any brand's behalf.
 *
 * What follows is a commitment this desk would make, which is a
 * different kind of statement and is labelled as one everywhere it
 * renders.
 *
 * FOUR WORKING HOURS, and the reason it is four rather than a
 * comfortable twenty four is the economics of the routes above. A Local
 * Services Ad lead and a marketplace lead are both billed on arrival and
 * both are sold to two or three contractors at once. The money is gone
 * before anybody speaks. Reply on Thursday to a Tuesday lead and the job
 * has already been booked by whoever rang back that afternoon, and the
 * invoice for the lead arrives regardless. Four hours is not politeness.
 * It is the window in which the spend can still become revenue.
 *
 * WHAT FOUR HOURS GETS WRONG, and it is worth saying rather than
 * hiding: for a no-cooling call in July, four hours is far too slow, and
 * a real desk would answer that one in minutes. A single figure across
 * every route understates the emergency lines and overstates a planned
 * panel upgrade. A commitment set per lane would be the honest model,
 * and there is no published evidence to set one from, so this console
 * uses one number and states the cost of doing so.
 */
export const RESPONSE_COMMITMENT = {
  hours: 4,
  label: "Four working hours",
  what: "Every inbound lead gets a human reply within four working hours of arriving, whether or not there is an answer yet.",
  why: "Local Services Ads and marketplace leads are billed on arrival and sold to more than one contractor. A reply that takes two days has already paid for the lead and lost the job to whoever answered first.",
  disclosure:
    "No Champions Group brand publishes a response time anywhere on its site. This commitment is the console's own, invented for this work sample, and it is not a claim about how any of the brands operates.",
  provenance: "illustrative" as Provenance,
  source: null,
} as const;

/**
 * Working hours, for the clock only.
 *
 * A four-hour commitment that ran through the night would mark a lead
 * received at 10pm as overdue before anybody was awake, which would be a
 * lie about the desk rather than a measure of it. The window is 9am to
 * 6pm in the territory, and the clock pauses outside it.
 *
 * THESE ARE NOT ANYBODY'S CALL CENTRE HOURS, and the difference matters.
 * Several of the brands publish round-the-clock emergency availability,
 * so the phone does not stop ringing at six even though this marketing
 * desk stops reading. That is the honest weakness of the model: the
 * 10pm lead is exactly the one most likely to be lost, and pausing the
 * clock overnight flatters the desk on precisely those rows. It is done
 * anyway, because measuring a marketing desk against hours it does not
 * work would make every figure on the screen unreadable.
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
 * The 256 character convention on the free text a lead arrives with.
 *
 * THIS IS THE CONSOLE'S OWN LIMIT AND NOT A PUBLISHED ONE. No Champions
 * brand publishes the schema of its intake forms, and neither Google nor
 * the marketplaces publish theirs in anything citable, so a figure read
 * off a real page was not available and is not claimed.
 *
 * It is set at 256 because that is about forty words, and forty words is
 * what a lead's message actually is. It is enough for "upstairs unit
 * stopped overnight, house is from the seventies, someone today if at
 * all possible" and it is nowhere near enough to let anybody skip the
 * qualifying call. The limit is the reason the qualifying call exists.
 */
export const NOTE_CHARACTER_LIMIT = 256;

export function noteWithinLimit(note: string): boolean {
  return note.length <= NOTE_CHARACTER_LIMIT;
}

// ---------------------------------------------------------------
// Territory-local time arithmetic
// ---------------------------------------------------------------

/**
 * Time maths done in the territory's own terms, with a fixed offset.
 *
 * The alternative was to use the browser's own timezone, and it was
 * rejected for a reason worth writing down: this console is a work
 * sample that will be read on somebody else's machine, and a queue whose
 * overdue count changes depending on where the reader is sitting is a
 * queue nobody can check. A fixed offset means the arithmetic is
 * reproducible in a screenshot, in a test, and in a hiring manager's
 * browser three states away.
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

/** Hour of day in the territory, 0 to 23. */
export function venueHour(iso: string): number {
  return new Date(toVenueMs(iso)).getUTCHours();
}

/**
 * Calendar date in the territory, as YYYY-MM-DD.
 *
 * A bare date passes straight through. Date.parse reads "2026-12-11" as
 * UTC midnight, so shifting it into local time would hand back the
 * tenth, and a held install date rendered one day early is the single
 * most damaging off-by-one this console could ship: somebody would ring
 * a household about a crew that is not coming until tomorrow.
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
 * A lead that arrives at 5pm is due at 10am the next morning, not at 9pm
 * the same evening. A lead that arrives at 7am is treated as arriving at
 * 9am, because that is when somebody could first have seen it. Weekends
 * are deliberately NOT skipped: a trade whose worst hours are a hot
 * Saturday and a burst pipe on a Sunday does not get to treat the
 * weekend as time the phone is not answered.
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
// The lead itself
// ---------------------------------------------------------------

/**
 * One inbound lead.
 *
 * `prospectId` and `organisationName` are a deliberate either-or rather
 * than one optional field. A lead that maps to a row in prospects.ts
 * inherits a hundred things this console already knows: the lane, the
 * decision maker's title, the buying window, the mileage, the size
 * range, whether anybody has already written to them this period. A lead
 * that does not is a household or a small business with no research
 * behind it, and the honest record of one is a descriptor rather than a
 * row pretending to be research.
 *
 * NOTE WHAT IS NOT ON THIS TYPE: a person's name. Every route in this
 * market captures a first name and most capture a surname, and the type
 * still does not carry one, because every lead in this console is
 * invented and an invented human name attached to a real named
 * organisation is the one fabrication a reader would take personally.
 * `contactRole` carries the job title instead, which is what a CSR
 * actually reads off the screen, and a household is recorded as
 * "Homeowner" and nothing more.
 */
export interface GroupRequest {
  id: string;
  channel: RequestChannel;
  /** A row in prospects.ts, or null when nothing is known behind it. */
  prospectId: string | null;
  /**
   * Free text organisation, used only where `prospectId` is null. These
   * are descriptors and not names: "Homeowner, Placentia" rather than an
   * invented household or an invented business, because an invented
   * business in a real trade area is a claim about somebody who exists,
   * and there are real plumbers and real landlords in Placentia.
   */
  organisationName: string | null;
  /** A role, never a name. */
  contactRole: string;
  lane: Lane;
  /**
   * A reserved unroutable address, per RFC 2606, exactly as the outbound
   * half of this console uses DEMO_RECIPIENT. Web forms capture a real
   * email, so the field is real; seeding a plausible address against a
   * real named organisation would not be.
   */
  email: string | null;
  /**
   * Null in every seeded row. Every route except Yelp captures a phone
   * number and the type carries it, but a phone number is the one
   * contact detail that cannot be made obviously fictional the way an
   * .invalid address can. On a board about speed to lead that absence is
   * awkward and it is still the right call.
   */
  phone: string | null;
  /** The free-text message, inside the 256 character convention. */
  note: string;
  /** One line on what they are actually asking for. */
  askSummary: string;
  /** The offer this desk would open with. A real published offer id. */
  suggestedPackageId: string | null;

  // The three qualifying fields. Null is a finding, not a gap.
  desiredDate: string | null;
  headcount: number | null;
  eventType: string | null;
  /** Why each qualifying field holds what it holds. */
  fieldReasons: Record<QualifyingField, MissingReason>;

  /** Web form only. Null means the route never offered it. */
  freeTourRequested: boolean | null;
  /** More than one property on the same enquiry. Null where unasked. */
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
   * and never when it falls earlier. A property manager who has told you
   * the board signs off at its monthly meeting has told you when to come
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

/** Which of the three qualifying answers this lead still does not have. */
export function missingQualifiers(r: GroupRequest): QualifyingField[] {
  const out: QualifyingField[] = [];
  if (r.desiredDate === null) out.push("desiredDate");
  if (r.headcount === null) out.push("headcount");
  if (r.eventType === null) out.push("eventType");
  return out;
}

/** Has this lead got everything an estimate needs? */
export function isQualified(r: GroupRequest): boolean {
  return missingQualifiers(r).length === 0;
}

/**
 * Of the missing answers, which were never asked for by the route.
 *
 * This is the number the intake screen exists to show. It separates what
 * the sender withheld from what the route never requested, and only the
 * second of those is fixable by changing a form or a bid. The first
 * needs a phone call and will be back tomorrow on the next lead.
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
// The membership programme
// ---------------------------------------------------------------

/**
 * CHAMP-Rewards, as Service Champions publishes it on 18 August 2026.
 *
 * This type exists to hold a real programme and an honest hole in the
 * same object, because that combination is the finding.
 *
 * WHAT IS REAL: Service Champions runs a named membership plan called
 * CHAMP-Rewards, surfaced on its home page and given its own page. The
 * published inclusions are specific and generous: a twenty four hour
 * repair response backed by a 500 dollar credit if it is missed, an AC
 * precision tune-up in spring and a furnace tune-up in autumn, an annual
 * plumbing inspection with a water heater flush, priority scheduling,
 * 25 per cent off repairs, a diagnostic fee cut to 19 dollars, member
 * drain clearing at 57 dollars, and accumulated fees applied against a
 * replacement. It transfers to a new home or to a new owner on sale.
 *
 * WHAT IS NOT PUBLISHED: the price. No monthly figure, no annual figure,
 * no joining fee, no term, no cancellation clause. The page routes the
 * question to a phone number instead.
 *
 * AND THAT IS THE WHOLE MARKET, not one brand's oversight. Across the
 * thirteen rivals profiled for this console, every single one names a
 * plan and hides the number. Two brands inside the same holding group,
 * ASI at 19.95 a month and Timo's at 15 a month, publish theirs openly
 * and prove it can be done. A homeowner searching at two in the
 * afternoon can compare six drain prices in ninety seconds and cannot
 * compare a single maintenance plan.
 *
 * The distinction between "withheld" and "unannounced" is the reason
 * this is a type rather than a paragraph. A price a brand has decided
 * not to publish is a fact that exists and is being kept back. Whether
 * that decision will change is a thing nobody has said either way.
 * Rendering both as "unknown" would flatten a sourced commercial finding
 * into a shrug.
 */
export interface UnpublishedLeagueFact {
  field: string;
  note: string;
  provenance: Provenance;
}

export interface PlanProgramme {
  id: string;
  /** "CHAMP-Rewards". */
  name: string;
  /** The brand the plan is sold under. */
  bannerName: string;
  /** How the page describes joining, in its own words. */
  registrationStatus: string;
  /** The visits the plan runs in a year, in the order they fall. */
  playNights: string[];
  perks: string[];
  leaderboardNote: string;
  /** The branches the plan is delivered from. */
  namedLocations: string[];
  registrationUrl: string;
  /** Everything the page does not publish, each with its own reasoning. */
  unpublished: UnpublishedLeagueFact[];
  /**
   * Whether the price will ever be published. One value today and it is
   * not "no": nobody has said either way, and recording it as a refusal
   * would be inventing a decision.
   */
  breaStatus: "unannounced";
  breaNote: string;
  source: string;
  provenance: Provenance;
}

/**
 * Somebody asking what the membership costs, on a plan with no price.
 *
 * This is not an enrolment. There is no number to quote and this console
 * will not invent one, so a membership enquiry records an ask and an
 * honest answer rather than a sign-up.
 *
 * It earns its place because the ask is real commercial information. A
 * property manager asking what a maintenance plan costs across forty
 * doors is telling a marketing manager that the recurring-revenue
 * question is being asked in the territory and that nobody in the
 * territory is answering it. That is worth recording whether or not the
 * price is ever published, and it is worth carrying to whoever decides
 * whether to publish it.
 */
export interface PlanInterest {
  id: string;
  prospectId: string | null;
  organisationName: string | null;
  contactRole: string;
  lane: Lane;
  email: string | null;
  receivedAt: string;
  /** How many properties or units they would enrol. Their number. */
  householdsExpected: number | null;
  /** Which parts of the published plan they actually care about. */
  preferredNights: string[];
  note: string;
  /**
   * What can honestly be said back today. Not a status on a pipeline; a
   * record of the answer the brand is able to give.
   */
  answerable: "published-brand-wide" | "unannounced-for-brea";
  /** The answer this desk would actually send. */
  standingAnswer: string;
  /**
   * When somebody actually sent it. Null while the ask is unanswered.
   *
   * A membership ask is on the same response commitment as any other
   * inbound lead, and deliberately so. "We cannot publish that figure"
   * inside four hours is a usable answer; the same words nine days later
   * is a brand that ignored somebody trying to hand it recurring
   * revenue.
   */
  answeredAt: string | null;
  provenance: Record<string, Provenance>;
}

// ---------------------------------------------------------------
// Derived work
// ---------------------------------------------------------------

/**
 * What kind of work a lead is currently generating.
 *
 * There is exactly one task kind per lead at any moment, and that is a
 * design constraint rather than a coincidence. A lead that produced
 * three tasks would be counted three times in every bucket, and the
 * first thing anybody does with a queue is add up the buckets. One lead,
 * at most one task, and the arithmetic closes on its own.
 */
export type TaskKind =
  /** Never answered, still inside the commitment. */
  | "answer"
  /** Never answered and the commitment has passed. */
  | "answer-overdue"
  /** Answered, and still missing a window, a property or a job type. */
  | "recover-qualifiers"
  /** Qualified and unpriced. Send the thing. */
  | "send-quote"
  /** The estimate is out and has been out a while. */
  | "chase-quote"
  /** An install date is held against nothing. Convert it or release it. */
  | "convert-hold"
  /** They stopped replying. One more attempt, then diary the window. */
  | "revive-quiet"
  /** Marked won with no line in the book. The two ledgers disagree. */
  | "reconcile-book"
  /** Lapsed. Nothing to sell; something to learn. */
  | "record-lapse"
  /** A membership ask, on a plan with no published price. */
  | "answer-plan-interest";

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
    note: "Unanswered past the response commitment. The lead is already paid for. Nothing else on this queue outranks it.",
  },
  "recover-qualifiers": {
    label: "Recover the missing answers",
    glyph: "◑",
    cssVar: "var(--warn)",
    note: "Answered, and still without a window, a property detail or a job type.",
  },
  "send-quote": {
    label: "Send the estimate",
    glyph: "◕",
    cssVar: "var(--accent)",
    note: "Everything an estimate needs is on the record and nothing has gone out.",
  },
  "chase-quote": {
    label: "Chase the estimate",
    glyph: "◕",
    cssVar: "var(--warn)",
    note: "An estimate has been sitting with them longer than an estimate should sit.",
  },
  "convert-hold": {
    label: "Convert or release the slot",
    glyph: "◉",
    cssVar: "var(--accent)",
    note: "An install date is held against no deposit, which is a date nobody else can be given.",
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
  "answer-plan-interest": {
    label: "Answer the membership ask",
    glyph: "◇",
    cssVar: "var(--info)",
    note: "Somebody asked what the membership costs, on a plan that publishes no price. The honest answer is still an answer, and it is one almost nobody in this market gives.",
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
 * `id` is composed from the kind and the lead rather than allocated, so
 * the same fact always produces the same task and React can key on it
 * across renders without anything being stored anywhere.
 */
export interface DerivedTask {
  id: string;
  kind: TaskKind;
  /** The lead or the membership ask this work came from. */
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
