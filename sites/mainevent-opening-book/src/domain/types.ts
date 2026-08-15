/**
 * The Opening Book. Domain model.
 *
 * The shape here encodes the single most important thing about this
 * venue: MAIN EVENT BREA IS NOT OPEN YET.
 *
 * mainevent.com/locations/california/brea publishes an address, a phone
 * number, "more than 26 lanes", and a form that asks you to inquire
 * about the opening. It publishes no hours. There is no client base to
 * retain, no walk-in traffic to convert, and no CRM history to mine.
 *
 * That is not a smaller version of a sales job. It is a different one.
 * A steady-state venue grows a book; a pre-opening venue BUILDS one, and
 * every dollar of week-one revenue has to be sold from outside the
 * building before there is a building to sell from. The job posting says
 * so in its own words: "Perform outbound lead-generating activities
 * outside the building, including tabling, networking events, and
 * go-sees with prospective and current customers."
 *
 * So the model separates two things that a generic CRM smears together:
 *
 *   BOOKED REVENUE   contracts and deposits. Money.
 *   OUTBOUND ACTIVITY  tabling shifts, go-sees, networking. No money.
 *
 * Activity is not revenue and must never be allowed to look like it.
 * Before a venue opens, activity is the only thing there is to report,
 * which is exactly when the temptation to report it AS progress is
 * strongest. Two ledgers, two types, and no function that takes one can
 * be handed the other.
 *
 * See /method for every formula and source.
 */

/*
  A type-only import, and the one direction of dependency this file
  allows. `domain/seats.ts` owns what a seat is and reads `Lane` and
  `PitchStatus` from here; this file needs the id and nothing else.
  Written as `import type` so it is erased at build and no module cycle
  reaches the bundle.
*/
import type { SeatId } from "@/domain/seats";

// ---------------------------------------------------------------
// Provenance
// ---------------------------------------------------------------

/**
 * Every commercial figure in this app carries one of these. The UI
 * enforces it: number components require a provenance prop, so a figure
 * without a stated origin cannot render. That constraint is the whole
 * reason a viewer can trust the parts that ARE real.
 */
export type Provenance =
  /** A published address, a published price, a cited company statement. */
  | "public"
  /** Plausible and invented for the prototype. Not a claim about reality. */
  | "illustrative"
  /** Calculated from stated assumptions. The assumptions are shown. */
  | "modeled"
  /** Recorded during a simulated go-see inside the prototype. */
  | "observed"
  /** Typed by the user in this session. */
  | "user_input"
  /**
   * The fact exists and Main Event deliberately does not publish it.
   *
   * THIS VALUE IS NOT A GAP IN THE RESEARCH. It is a finding.
   *
   * Main Event publishes a price for every self-serve product, birthday
   * packages, the $29.99 All-Access Grad Pack, the $19.95 Play It
   * Forward voucher, and publishes NO price for any corporate or group
   * package. Those pages say to call the local Sales Manager. The
   * withheld price is the reason the role exists, so recording it as
   * "unknown" would throw away the most useful thing the research found.
   *
   * A withheld figure renders as the sentence "Main Event does not
   * publish this" rather than as a number. Never as an estimate wearing
   * a number's clothes.
   */
  | "withheld";

export type Confidence = "high" | "medium" | "low";

export interface LatLng {
  lat: number;
  lng: number;
}

// ---------------------------------------------------------------
// The venue
// ---------------------------------------------------------------

/**
 * The one venue this app is about, and its opening state.
 *
 * `openingStatus` is a type rather than a boolean because "announced"
 * and "opening date set" are commercially different: you cannot ask a
 * school for a deposit against a date nobody has published, but you can
 * absolutely ask for a place in line. Half the outreach templates in
 * this app branch on it.
 */
export type OpeningStatus =
  /** Address published, no date. Where Brea actually is today. */
  | "announced"
  /** A public opening date exists. Deposits become askable. */
  | "date-set"
  | "open";

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state: "CA";
  postalCode: string;
  phone: string;
  lat: number;
  lng: number;
  locationAccuracy: "verified" | "approximate";
  openingStatus: OpeningStatus;
  /** Every attraction Main Event publishes FOR BREA SPECIFICALLY. */
  attractions: VenueAttraction[];
  /**
   * Published as "more than 26 lanes". The hedge is load-bearing and is
   * kept: 26 is a FLOOR, and every capacity figure in this app is
   * computed from the floor so it can only ever understate the venue.
   */
  bowlingLanesPublishedFloor: number;
  source: string;
  provenance: Provenance;
}

export interface VenueAttraction {
  id: string;
  label: string;
  /** Published on the Brea page itself, not merely brand-wide. */
  breaSpecific: boolean;
  note?: string;
  source: string;
  provenance: Provenance;
}

// ---------------------------------------------------------------
// Prospecting structure
// ---------------------------------------------------------------

/**
 * WHY AN ORGANISATION BUYS is a bigger fork than what kind of
 * organisation it is, and it is the fork that decides when you call.
 *
 * A high school books grad night because there is a graduation. The date
 * is not negotiable, the budget is approved a season ahead, and if you
 * miss the window you have missed a year. A software company books a
 * holiday party because someone decided to. There is no date until
 * somebody picks one, and the whole thing can be pulled in a downturn.
 *
 * Those are different sales calls made at different times of year, which
 * is why this is a type and not a tag. A function that takes an
 * OccasionClass cannot silently be handed the wrong kind of buyer.
 */
export type OccasionClass =
  /**
   * The calendar buys, not the buyer. Graduations, seasons, terms,
   * belt tests. Miss the window and there is no second chance this year,
   * so these are worked backwards from a fixed date.
   */
  | "calendar-locked"
  /**
   * Somebody chooses. Holiday parties, offsites, client nights. The date
   * is soft, the budget is real, and the decision is made by a person
   * you have to find and persuade.
   */
  | "discretionary";

/**
 * The nine prospecting lanes.
 *
 * A "lane" here is a channel of outbound work, not a category of
 * business. The distinction matters because the lane decides the MOTION:
 * you reach a school through one named administrator whose title is
 * published on a staff directory, and you reach a corporate park by
 * standing in its lobby at lunchtime with a table. Same city, same
 * mileage, completely different week.
 *
 * The union type means adding a tenth lane breaks the build everywhere
 * something has to decide about it. That is the point of the union. A
 * `Record<Lane, T>` cannot be partially filled.
 *
 * The ninth lane, `local-retail-food`, was added after the first eight
 * and it is the proof that the constraint works. Every screen that had
 * an opinion about lanes stopped compiling until somebody wrote down
 * what the new one means, which is exactly the moment to decide it.
 */
export type Lane =
  /** K-12 schools and districts. Grad night, banquets, field trips. */
  | "schools"
  /** Colleges within the trade area. Student orgs, greek life, athletics. */
  | "colleges"
  /** Employers and corporate offices. Holiday parties, offsites, kickoffs. */
  | "corporate"
  /** Gyms, dojangs, clubs, travel teams. Season-end banquets. */
  | "fitness-youth-sports"
  /** Hotels, chambers, civic clubs. Referral partners as much as buyers. */
  | "hospitality-civic"
  /** Dealerships, brokerages, insurance, banks. Holiday and client nights. */
  | "auto-finance"
  /** Churches, youth ministries, nonprofits. Youth nights, volunteer thanks. */
  | "faith-nonprofit"
  /** Clinics, dental and medical groups, senior care. Staff appreciation. */
  | "healthcare"
  /**
   * Boba counters, small food franchises, mall tenants, independent
   * retail and service businesses. Eight to sixty staff, and the owner
   * or the store manager is the entire approval chain. They buy a staff
   * appreciation night, not a banquet somebody scheduled a year ago.
   */
  | "local-retail-food";

// ---------------------------------------------------------------
// Prospects
// ---------------------------------------------------------------

export type ProspectPriority = "anchor" | "high" | "medium" | "low";

/**
 * A two-digit NAICS sector. THE INDUSTRY CUT.
 *
 * The union lives here rather than beside its metadata in
 * `domain/segments.ts` for one boring reason: `Prospect` needs it and
 * `segments.ts` needs `Lane`, and a value-level cycle between the two
 * files is the kind of thing that works until the day it does not.
 * Types here, meaning there.
 *
 * Why a federal classification instead of categories invented for this
 * board, and the one place this board bends it: see `domain/segments.ts`.
 */
export type SegmentId =
  | "22" | "23" | "31" | "42" | "44" | "48" | "51" | "52" | "53"
  | "54" | "56" | "61" | "62" | "71" | "72" | "81" | "92";

/**
 * How a prospect can be reached, in the order a rep would actually try.
 *
 * `email_confidence` is not a nicety. Every email in this app was read
 * off the organisation's own website and carries the URL it was read
 * from, and a rep can click through and see it. Nothing in this data set
 * was pattern-guessed from a domain name, because one invented
 * info@ address is enough to make a hiring manager distrust every other
 * number on the screen.
 */
export type EmailConfidence =
  /** Read off the organisation's own published page. URL carried. */
  | "verified_public"
  /** No address published; a contact form is the only written door. */
  | "form_only"
  /** Phone or a walk-in is the only route. Which is what go-sees are for. */
  | "none";

export interface Prospect {
  id: string;
  slug: string;
  name: string;
  lane: Lane;
  address: string;
  city: string;
  state: "CA";
  postalCode: string;
  phone?: string;
  website?: string;
  lat: number;
  lng: number;
  locationAccuracy: "verified" | "approximate";
  /** Google Places id. Carried so every row is checkable at source. */
  placeId?: string;
  /** Google rating and review count, where published. A traffic proxy only. */
  rating?: number;
  reviewCount?: number;
  priority: ProspectPriority;
  /** The role that signs off a group booking here. A title, never a name. */
  decisionMakerTitle: string;
  email?: string;
  emailSourceUrl?: string;
  emailConfidence: EmailConfidence;
  contactFormUrl?: string;
  /** One concrete sentence on why THIS organisation books a group night. */
  whyTheyFit: string;
  /** The package to lead with. Must be a real published package id. */
  leadPackageId: string;
  /** When they buy. Drives the entire outreach calendar. */
  buyingWindow: string;
  occasionClass: OccasionClass;
  /**
   * Likely group size, as a RANGE and with its basis stated.
   *
   * Never a single number. A headcount is the input to every revenue
   * figure downstream, and a range that says "40 to 80, based on a
   * single-site clinic" is honest in a way that "62" is not.
   */
  headcountLow: number;
  headcountHigh: number;
  headcountBasis: string;
  /** Set where the prospect is notable for a reason worth saying out loud. */
  note?: string;
  /**
   * WHERE THE APPROVAL SITS. See `OrgType` below.
   *
   * Optional on the interface and present on all one hundred and two
   * seeded rows. It is optional because another surface in this app
   * lets a rep add an organisation from the pavement with a name and a
   * pin, and a row typed on a phone outside a shop should not be
   * rejected by the type system for a field the rep has not decided
   * yet. Read it through `orgTypeOf`, which resolves the absent case to
   * "unknown" rather than leaving a caller to guess.
   */
  orgType?: OrgType;
  /** Why this row carries the type it carries, in one sentence. */
  orgTypeBasis?: string;
  /**
   * WHAT INDUSTRY THIS IS. A two-digit NAICS sector.
   *
   * The third cut across the same board, and the one the job posting
   * asks for by name: "identify high-potential target customer segments
   * and industries". The lane says how you reach them, `orgType` says
   * where the yes lives, and this says what they do for a living, which
   * is what decides whether the occasion exists at all.
   *
   * Optional for the same reason `orgType` is: a rep adding an
   * organisation from the pavement has a name and a pin, not a sector
   * code. Read it through `segmentOf`, which resolves the absent case
   * rather than leaving a caller to guess.
   */
  segment?: SegmentId;
  addressSource: string;
  provenance: Record<string, Provenance>;
}

/**
 * WHO OWNS THE DECISION. A second cut across the trade area, and a
 * different one from the nine lanes.
 *
 * The lanes describe the MOTION: how you reach an organisation and what
 * you open with. This describes WHERE THE YES LIVES, which decides
 * whether the conversation you are having is the conversation that
 * matters at all.
 *
 * A boba counter's owner is behind the till, so a good ten minutes at
 * the counter is the whole sale. A Firestone store manager can want the
 * night, can say yes to your face, and still cannot approve it, because
 * a region above the building holds the budget line; the useful outcome
 * of that visit is the name of the role above them, not an agreement.
 * A school buys neither way: the date comes off a calendar published a
 * year ahead and the money moves on a purchase order, so the work is
 * paperwork and lead time rather than persuasion.
 *
 * Three values plus an honest fourth. "unknown" is not a hole to be
 * filled in later by guessing; it is the correct value for a row whose
 * own research does not say, and it is used exactly twice in the seeded
 * data rather than being quietly avoided.
 */
export type OrgType =
  /** Buys on a published calendar and a purchase order. */
  | "school"
  /** One site, and the person who can say yes works in it. */
  | "independent"
  /** A branch, store or franchised unit. The yes is above the building. */
  | "chain"
  /** The row does not say, and this app does not guess. */
  | "unknown";

// ---------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------

/**
 * A message in a thread against one organisation.
 *
 * WHY THIS EXISTS SEPARATELY FROM `Reply`. `Reply` records what came
 * back, one row per answer, and it is the right shape for a replies
 * board that asks how outreach is landing in aggregate. It is the wrong
 * shape for the question a rep asks twenty times a day, which is "what
 * did we actually say to these people, and what did they say back". That
 * question needs both directions, in order, with the channel attached,
 * because "we emailed twice and then stood in their reception" and "we
 * emailed four times" are the same touch count and completely different
 * situations.
 *
 * THE SEEDED THREADS ARE ILLUSTRATIVE AND EVERY ROW SAYS SO. Nothing
 * here is a claim that any named organisation said any of it. They are
 * written to be representative of the shape a real week takes, which
 * means most of them are silence, brush-offs, out of office replies and
 * routing corrections rather than enthusiasm. A seeded pipeline where
 * everyone answers warmly would be worse than an empty one, because an
 * empty one at least does not teach the reader anything false.
 *
 * NO INVENTED PEOPLE, in either direction. Every counterparty is a ROLE
 * and every address sits on the .invalid domain that RFC 2606 reserves
 * and which can never resolve.
 */
export type MessageDirection = "inbound" | "outbound";

/**
 * How the message travelled.
 *
 * "in-person" is on this list for the same reason the go-see is first
 * in the job posting's daily responsibilities: for the twenty-seven
 * organisations in this trade area that publish no email at all, a
 * conversation at a counter is not a lesser kind of contact, it is the
 * only kind there is.
 */
export type MessageChannel =
  /** Written, to a published address. */
  | "email"
  /** A call, in or out. The body is a summary written afterwards. */
  | "phone"
  /** A go-see or a tabling shift. The body is a summary written afterwards. */
  | "in-person"
  /** Their published contact form, which is a queue rather than a person. */
  | "contact-form";

/**
 * A reply that is not an answer.
 *
 * Instantly ships Out of Office and Wrong Person as first class lead
 * statuses, and both mean REQUEUE rather than reject. That distinction
 * earns its place in a trade area of schools and chains: a school
 * office is dark for a fortnight at a time and a store manager routing
 * you to a region has given you the most useful sentence of the visit.
 * Filing either as a rejection would delete a live record.
 */
export type RequeueReason =
  /** An automatic absence reply. Nobody has read it yet. */
  | "out-of-office"
  /** Reached a real person who does not own this decision. */
  | "wrong-person"
  /** They own the site and not the budget. A region or an owner decides. */
  | "decision-off-site"
  /** A real answer with a date on it. Diary the window, not the chase. */
  | "come-back-later";

/**
 * The things a buyer does that mean something, named so the app can
 * point at them.
 *
 * An intent reading built from a mood is a number nobody can argue
 * with, which makes it worthless. Every one of these is an observable
 * act with a message behind it, except the last three, which are
 * observable outcomes. The UI shows the list; the reader can disagree
 * with any line of it.
 */
export type IntentSignal =
  /** They asked when. The single strongest thing said short of a hold. */
  | "asked-for-a-date"
  /** They asked what it costs, which is a buyer's question and not a browser's. */
  | "asked-for-a-price"
  /** They put a number of guests in writing. */
  | "named-a-headcount"
  /** They asked who else has booked. Social proof is a late-stage question. */
  | "asked-who-else-has-booked"
  /** "Send me something in writing." Real, and weaker than it sounds. */
  | "asked-for-it-in-writing"
  /** A time in a diary with a role in it. */
  | "agreed-to-meet"
  /** A date held against no deposit. */
  | "held-a-date"
  /** Signed, with a deposit. */
  | "signed"
  /** Silence past the stage threshold after a quote went out. Derived. */
  | "went-quiet-after-a-quote"
  /** They told us they are going somewhere else. */
  | "booked-elsewhere"
  /** A plain no. */
  | "said-no";

/**
 * What a message CHANGED.
 *
 * Every row in a timeline that does not answer this is decoration. A
 * message that moved nothing says so in one clause, and that is itself
 * a finding: three touches that all moved nothing is the pattern that
 * tells a rep to stop writing and go and stand in the building.
 */
export interface MessageEffect {
  /** One clause. What changed, not a restatement of the message. */
  note: string;
  /** Where the record stood after this message, where it moved at all. */
  movedStatusTo?: PitchStatus;
  /** The offer this message put on the table, by extension id. */
  offerExtensionId?: string;
  /** Requeue rather than reject. */
  requeue?: RequeueReason;
  /** Signals a reader can point at. In practice inbound only. */
  signals?: IntentSignal[];
}

export interface ConversationMessage {
  id: string;
  /** A row in prospects.ts. Threads are keyed by organisation. */
  prospectId: string;
  direction: MessageDirection;
  channel: MessageChannel;
  /** ISO with the venue's own offset, as everywhere else in this app. */
  at: string;
  /** The role at the other end. A title, never a name. */
  counterpartyRole: string;
  /** A reserved unroutable address, where the channel has one at all. */
  address?: string;
  subject?: string;
  /**
   * What was said. For email and forms this is the text. For a call or
   * a go-see it is a summary written afterwards, and `summarised` says
   * which of the two a reader is looking at, because a quote and a
   * recollection are different kinds of evidence.
   */
  body: string;
  summarised: boolean;
  effect: MessageEffect;
  /**
   * The request row this message IS, where the two are one event.
   *
   * An inbound enquiry already lives in data/requests.ts with its
   * response clock and its qualifying fields. Recording it again here
   * as a second event would double every count that adds the two
   * together. So the message carries the request id and the selectors
   * treat them as the same thing seen from two angles.
   */
  requestId?: string;
  provenance: Provenance;
}

// ---------------------------------------------------------------
// Offers, as extended
// ---------------------------------------------------------------

/** Where an extended offer stands. */
export type OfferState =
  /** On the table and not answered. */
  | "open"
  /** They took it. */
  | "accepted"
  /** They said no to the offer, which is not always a no to the venue. */
  | "declined"
  /** Time ran out on it. Recorded rather than quietly reopened. */
  | "lapsed"
  /** The venue pulled it. Rare, and it needs a reason. */
  | "withdrawn";

/**
 * An offer, actually put to somebody.
 *
 * `Offer` in data/venue.ts is the catalogue: what could be offered and
 * why it is credible before the doors open. This is the ledger of what
 * WAS offered, to which role, when, and whether it still stands.
 *
 * THERE IS NO DISCOUNT FIELD ON THIS TYPE AND THAT IS THE POINT. Main
 * Event publishes no corporate price at all, so a percentage off one
 * would be a discount off a secret. Every extension here points at an
 * id in OFFERS, and the cost to the venue is read from that row rather
 * than restated here, so the two can never drift apart.
 */
export interface OfferExtension {
  id: string;
  prospectId: string;
  /** An id in OFFERS. Nothing else is extendable. */
  offerId: string;
  /** The message that put it on the table. */
  messageId: string;
  extendedAt: string;
  /** The role it was put to. A title, never a name. */
  toRole: string;
  state: OfferState;
  /** Why it stands where it stands, in one line. */
  stateNote: string;
  /** Where the offer was given a date to die on. */
  expiresAt?: string;
  provenance: Provenance;
}

// ---------------------------------------------------------------
// What is being sold
// ---------------------------------------------------------------

/**
 * Package family. The one piece of colour in this app that encodes data
 * rather than status.
 *
 * It earns that because family drives the commercial argument. Youth
 * packages are priced, published and self-serve; corporate packages are
 * unpriced and gated behind a sales manager. Seeing a week's book that
 * is entirely youth at a glance is a real read, and it means the room is
 * full and the revenue is not.
 */
export type PackageFamily =
  /** Priced, published, books itself. Grad packs, birthdays, vouchers. */
  | "self-serve"
  /** Unpriced, gated, needs a sales manager. The reason the job exists. */
  | "corporate"
  /** School and youth group programs. Volume, daytime, low margin, loyal. */
  | "youth-group"
  /** Buyouts and lock-ins. 150 to 800+ guests. The whole building. */
  | "buyout"
  /** Fundraisers. Spirit Night and Play It Forward. Community door-opener. */
  | "fundraiser";

export type DayPart =
  | "weekday-daytime"
  | "weekday-evening"
  | "weekend"
  | "after-close"
  | "any";

/**
 * A published Main Event package.
 *
 * `pricePerGuest` is `null` wherever Main Event does not publish one,
 * and the provenance on that field is "withheld". There is no fallback
 * estimate anywhere in this file. An invented price on a page a hiring
 * manager can check against mainevent.com is the fastest way to lose
 * the room.
 */
export interface EventPackage {
  id: string;
  name: string;
  family: PackageFamily;
  /** What the guest actually gets, in Main Event's own published terms. */
  inclusions: string[];
  minGuests: number | null;
  maxGuests: number | null;
  pricePerGuest: number | null;
  priceNote?: string;
  /** Published day-part eligibility. This is the real weekday lever. */
  dayParts: DayPart[];
  dayPartNote?: string;
  /** Published booking terms: notice period, deposit. */
  bookingNoticeDays?: number;
  depositPercent?: number;
  /**
   * Bowling lanes consumed per 20 guests, per Main Event's own published
   * "1 lane per 20 guests" rule. This is what makes the capacity screen
   * arithmetic rather than decoration.
   */
  lanesPerTwentyGuests?: number;
  /** Which lanes this package is the right opener for. */
  laneFit: Lane[];
  source: string;
  provenance: Record<string, Provenance>;
}

// ---------------------------------------------------------------
// The fact table
// ---------------------------------------------------------------

/**
 * Where a prospect stands on a package, right now.
 *
 * ONE ROW PER (prospect, package, period). The desk, the map, the lane
 * boards and every generated next action are selectors over this table.
 * Nothing downstream is stored: change one row here and the whole app
 * recalculates. That property is demonstrable live, and it is the
 * difference between a prototype with a data model and a prototype with
 * hardcoded screens.
 */
export type PitchStatus =
  /** Never contacted about this package. The pre-opening default. */
  | "unworked"
  /** Contacted, no answer yet. */
  | "reached-out"
  /** They replied and want to talk. */
  | "conversation"
  /** A date is held, no contract. Worth nothing until it is signed. */
  | "soft-hold"
  /** Signed, deposit taken. This is the only state that is revenue. */
  | "booked"
  /** They said no, or they went to a competitor. Recorded, not hidden. */
  | "lost";

/**
 * How a prospect's current state was learned.
 *
 * A pre-opening sales manager has no system of record to read from, and
 * a live feed would be a lie. Naming the source is more credible than
 * faking the feed.
 */
export type SignalSource =
  /** Seen on a go-see or at a tabling shift. */
  | "observed"
  /** They told us, in a reply or on a call. */
  | "reported"
  /** Inferred from their published calendar or season. */
  | "modeled"
  | "unknown";

export interface ProspectPackageStatus {
  prospectId: string;
  packageId: string;
  periodId: string;
  status: PitchStatus;
  /** Guests discussed, where a number has actually been discussed. */
  discussedHeadcount?: number;
  /** Date being held or booked, ISO. */
  targetDate?: string;
  signalSource: SignalSource;
  observedAt?: string;
  /** Touches made against this prospect and package. Drives the desk. */
  touches: number;
  lastTouchAt?: string;
  confidence: Confidence;
  provenance: Provenance;
}

// ---------------------------------------------------------------
// The two ledgers
// ---------------------------------------------------------------

export type Ledger = "booked-revenue" | "outbound-activity";

/**
 * A booked line. A signed contract with a deposit against it.
 *
 * This is the only place a dollar figure lives. If it is not signed, it
 * is not here, and the number at the top of the Book is the number a GM
 * would recognise from their own P&L.
 */
export interface BookLine {
  id: string;
  ledger: "booked-revenue";
  /**
   * Which action created this line. A revised contract sent to the same
   * prospect for the same package SUPERSEDES the first rather than
   * stacking a second beside it. A rep who re-sends a corrected quote
   * has not sold the party twice, and the ledger has to agree.
   */
  source?: string;
  prospectId: string;
  packageId: string;
  guests: number;
  /**
   * Per-guest price used for this line.
   *
   * For a published package this is the published price. For a gated
   * corporate package a rep types one in, and it lands as `user_input`
   * with a visible badge, because a number a person typed and a number a
   * company published are not the same kind of fact.
   */
  pricePerGuest: number;
  pricePerGuestProvenance: Provenance;
  depositPercent: number;
  eventDate: string;
  /** Lanes this booking consumes on its date. Feeds the capacity screen. */
  lanesHeld: number;
  offerId?: string;
  notes?: string;
  sortOrder: number;
}

export type ActivityType =
  /** A table set up somewhere other than the venue. The job's own word. */
  | "tabling"
  /** Chamber mixer, association meeting, school board night. */
  | "networking-event"
  /** Turning up at a prospect's place of business. The job's own word. */
  | "go-see"
  /** A cold call. Cheap, low yield, still counted honestly. */
  | "call-block"
  /** An email sequence step. */
  | "email-sequence"
  /** A facility tour, once there is a facility to tour. */
  | "venue-tour";

/**
 * An outbound activity line. Work promised, and it carries no money.
 *
 * Deliberately no revenue field. Not an omission; the whole reason
 * there are two ledgers is that a pre-opening pipeline report is where
 * activity gets quietly dressed up as results. Twelve tabling shifts is
 * twelve tabling shifts. If it turned into a booking, there is a
 * BookLine, and that is where the dollars are.
 */
export interface ActivityLine {
  id: string;
  ledger: "outbound-activity";
  type: ActivityType;
  /** Where the work happens. A prospect, or a place in the trade area. */
  prospectId?: string;
  locationLabel: string;
  /** Week commencing, ISO. Activity is planned by week, not by day. */
  week: string;
  /** Hours out of the building. The scarce resource, and it is finite. */
  hours: number;
  /** Conversations expected. Modeled, with the assumption shown. */
  targetConversations: number;
  /**
   * The seat that carries this work. A role, never a person.
   *
   * THIS FIELD USED TO BE A STRING SPELLING "Sales Manager" ON EVERY
   * ROW. It said the right thing and could do nothing with it: an hour
   * could not be attributed, a floor could not be rolled up, and a
   * screen about a team had nothing to group by. Promoting it to a seat
   * id keeps the rule that made it a role in the first place, because a
   * seat is a published job title and an ordinal and carries no name,
   * and it turns every per-seat figure in the application into a group
   * by. See `domain/seats.ts`.
   */
  seatId: SeatId;
  laneFocus: Lane[];
  notes?: string;
  completedAt?: string;
  sortOrder: number;
}

// ---------------------------------------------------------------
// Offers and replies
// ---------------------------------------------------------------

/**
 * A pre-opening offer. What you can put on the table when the thing you
 * are selling does not exist yet.
 *
 * Note what is NOT here: a discount off a price Main Event has never
 * published. You cannot discount a secret. Pre-opening leverage is
 * PRIORITY and CERTAINTY, first pick of opening-month dates, a locked
 * rate, a founding-partner slot, which cost nothing and are worth
 * something precisely because the calendar is empty.
 */
export interface Offer {
  id: string;
  name: string;
  what: string;
  /** Why this is credible before the doors open. */
  rationale: string;
  eligibleLanes: Lane[];
  eligiblePackageFamilies: PackageFamily[];
  /** Cost to the venue, where there is one. Often zero, and that is the point. */
  costToVenue: number;
  costNote: string;
  provenance: Provenance;
}

export type ReplyDisposition =
  | "meeting-set"
  | "asked-for-info"
  | "not-now"
  | "wrong-person"
  | "no"
  | "no-reply";

export interface Reply {
  id: string;
  prospectId: string;
  disposition: ReplyDisposition;
  receivedAt: string;
  /** What they actually said, in their words where we have them. */
  summary: string;
  /** The objection raised, if any. Feeds the objection register. */
  objectionId?: string;
  nextStep?: string;
  nextStepDue?: string;
}

// ---------------------------------------------------------------
// Periods
// ---------------------------------------------------------------

export interface Period {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  /** Weeks before the doors open. Negative once open. */
  weeksToOpen: number;
  provenance: Provenance;
}

/**
 * A demo recipient. A reserved, unroutable address so a Send action has
 * a real recipient to address with no chance of reaching a person.
 *
 * There is no email transport anywhere in this dependency tree. Sending
 * writes a row to the outbox and nothing leaves the browser. That
 * guarantee is structural, which is why the Demo Mode badge sits in the
 * chrome rather than on individual screens.
 */
export type DemoRecipient = `${string}@${string}.invalid`;
