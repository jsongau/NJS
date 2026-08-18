/**
 * The Territory Book. Domain model.
 *
 * The shape here encodes the single most important structural fact about
 * this division: THE FIVE BRANDS ARE RUN AS LOCAL BUSINESSES AND THE
 * DIVISION SITS BEHIND THEM.
 *
 * None of the five West Division sites mentions Champions Group
 * anywhere. Service Champions publishes one phone number for three
 * branches and four counties, one maintenance inbox, a campaign that
 * expires on 31 August 2026 and no successor. Adeedo publishes four dead
 * campaign pages nobody took down. ASI publishes a price for everything
 * and an expiry for nothing. There is no shared demand system to read
 * from, and there is no CRM history to mine, because the history sits
 * inside five separate agencies and five separate sites.
 *
 * That is not a smaller version of a marketing job. It is a different
 * one. The posting says so in its own words: local marketing
 * initiatives focused on demand generation, campaign execution,
 * operational alignment and brand growth, with a budget framed
 * explicitly as driving incremental phone calls and web leads.
 *
 * So the model separates two things a generic CRM smears together:
 *
 *   BOOKED WORK        jobs, installs, signed proposals. Money.
 *   OUTBOUND ACTIVITY  calls made, doors worked, partners briefed. No
 *                      money.
 *
 * Activity is not revenue and must never be allowed to look like it.
 * Between one campaign expiring and the next one launching, activity is
 * the only thing there is to report, which is exactly when the
 * temptation to report it AS progress is strongest. Two ledgers, two
 * types, and no function that takes one can be handed the other.
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
   * The fact exists and the company deliberately does not publish it.
   *
   * THIS VALUE IS NOT A GAP IN THE RESEARCH. It is the strongest finding
   * in it.
   *
   * Service Champions publishes a price for a tune-up, a price for a
   * drain clearing, a price for a member diagnostic, and NO price for
   * CHAMP-Rewards. The membership page routes to the phone instead. It
   * is not alone: of the fourteen brands profiled, twelve name a
   * membership plan and hide the number, and only ASI at 19.95 a month
   * and Timo's at 15 a month print one. The same silence covers
   * financing, where nobody in the market publishes an APR and Service
   * Champions names no lender at all.
   *
   * A withheld figure is the reason a marketing role exists, so
   * recording it as "unknown" would throw away the most useful thing the
   * research found. It renders as the sentence "the company does not
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
// The anchor branch
// ---------------------------------------------------------------

/**
 * The one branch this console measures from, and the state of the
 * campaign running out of it.
 *
 * `openingStatus` is a type rather than a boolean because a campaign
 * with a printed end date and a campaign with a published successor are
 * commercially different: you cannot promise a partner a price for
 * October against a campaign nobody has signed off, but you can
 * absolutely tell them what is live until 31 August. Half the outreach
 * templates in this app branch on it.
 *
 * The type name and its three members are read in four other files and
 * are left alone. What each member means is written here.
 */
export type OpeningStatus =
  /**
   * A campaign is published and running to a printed end date, and no
   * successor is published. Where the West Division actually is today:
   * two brands expire on 31 August 2026 and nothing follows them.
   */
  | "announced"
  /** A successor campaign has a published start. Autumn becomes sellable. */
  | "date-set"
  /** The successor is live and can be quoted. */
  | "open";

/**
 * THE ANCHOR BRANCH. The name is inherited and is read in a dozen other
 * files, so it stays; what it holds is a home services branch, not a
 * building the public visits.
 *
 * One row: the address, the phone number, the service lines the BRAND
 * publishes on its own site, and a modelled figure for what the crew
 * standing behind it can run in a day. Everything the console says about
 * distance, drive time and coverage is measured from here.
 */
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
  /**
   * Every service line and proof signal the BRAND publishes on its own
   * site, rather than anything the group publishes on its behalf. The
   * distinction is the whole point: a homeowner never sees the group.
   */
  attractions: VenueAttraction[];
  /**
   * Daily field capacity for the anchor branch, in crew slots.
   *
   * NOT A PUBLISHED FIGURE. Service Champions publishes no technician,
   * truck or crew count anywhere retrievable, so this is a deliberately
   * low working assumption and every screen that divides by it is doing
   * modelled arithmetic. The reasoning, and the published hedges it
   * refuses to launder into a fact, are set out in data/venue.ts.
   */
  crewSlotsModelledFloor: number;
  source: string;
  provenance: Provenance;
}

/**
 * One published service line or proof signal. Inherited name, kept
 * because other files read it.
 *
 * `breaSpecific` is the field that earns this type. The group publishes
 * claims on behalf of 22 brands and none of the five West Division sites
 * mentions the group at all, so "published by the brand about this
 * territory" and "published somewhere by somebody" are two different
 * strengths of evidence and this console refuses to flatten them.
 */
export interface VenueAttraction {
  id: string;
  label: string;
  /** Published on the brand's own site, not merely by the group. */
  breaSpecific: boolean;
  note?: string;
  source: string;
  provenance: Provenance;
}

// ---------------------------------------------------------------
// Prospecting structure
// ---------------------------------------------------------------

/**
 * WHY THE WORK ARRIVES is a bigger fork than what kind of work it is,
 * and it is the fork that decides when you spend.
 *
 * A failing air conditioner in July is not a decision anybody made. The
 * weather made it, the household rings whoever it can find in two
 * minutes, and if the brand is not already in the local pack and the
 * paid results by May it is buying August leads at the worst price of
 * the year. A property manager choosing a preferred vendor is the
 * opposite: nothing forces it, nobody owns it, and it can be pulled at
 * any time by whoever answers a referral faster.
 *
 * Those are different campaigns bought at different times of year, which
 * is why this is a type and not a tag. A function that takes an
 * OccasionClass cannot silently be handed the wrong kind of demand.
 */
export type OccasionClass =
  /**
   * The season or the failure buys, not the buyer. Cooling peaks in
   * July, heating turns over in October, a burst line waits for nobody.
   * Demand arrives on its own schedule, so these are worked backwards
   * from a date the weather sets and the marketing has to be already
   * standing there when it lands.
   */
  | "calendar-locked"
  /**
   * Somebody chooses. Partner programmes, membership pushes, planned
   * upgrades, community sponsorship. There is no forcing event, the
   * budget is real, and the decision is made by a person who has to be
   * found and persuaded.
   */
  | "discretionary";

/**
 * The nine lanes.
 *
 * A "lane" here is a channel of outbound work, not a category of
 * business. The distinction matters because the lane decides the MOTION:
 * you reach a household with a failing water heater through the local
 * pack and a paid result read in ninety seconds, and you reach a
 * property management office by standing in it and being the number they
 * ring first. Same city, same mileage, completely different week.
 *
 * The union type means adding a tenth lane breaks the build everywhere
 * something has to decide about it. That is the point of the union. A
 * `Record<Lane, T>` cannot be partially filled.
 *
 * Six of the nine are service lines and three are partner surfaces, and
 * they sit in one union rather than two because the week does. A
 * marketing manager's Tuesday holds a paid search review and a property
 * manager's coffee, and a model that filed them separately would need a
 * second copy of every screen to put them back together.
 *
 * The labels live in `domain/lanes.ts`. What each key MEANS lives here.
 */
export type Lane =
  /** Heating and air conditioning. The line that decides the year. */
  | "hvac"
  /** Plumbing. Emergency-led and therefore search-led. */
  | "plumbing"
  /** Multi-service operators. One van for the whole house, and the
      direct structural competitor to a multi-brand division. */
  | "multi-service"
  /** Electrical. Panels, EV chargers, planned and financed. */
  | "electrical"
  /** Employers and hospitality. A few hundred households through one
      relationship rather than a few hundred impressions. */
  | "partner-employer"
  /** Drain and sewer. The loss leader, and a price anybody can read off
      a competitor's home page. */
  | "drain-sewer"
  /** Property and referral partners. Managers, realtors, inspectors,
      standing beside the homeowner when a system is found to be failing. */
  | "partner-property"
  /**
   * Schools, faith and civic. Not customers. These are the sponsorship
   * and community surfaces a local brand uses to be visible in a
   * postcode before anybody needs it, inherited from the trade-area
   * research this console was built on and re-read as partnership
   * targets rather than as buyers.
   */
  | "partner-community"
  /**
   * Water heaters. A replacement purchase with a hard deadline and a
   * known price band, which makes it the most comparison-shopped item in
   * the trade and the one where financing and rebate messaging change
   * the answer.
   */
  | "water-heater";

// ---------------------------------------------------------------
// Prospects
// ---------------------------------------------------------------

/**
 * How hard a row is being worked.
 *
 * "watch" is new on this build and it is the honest state for most of the
 * competitor rows: nobody is going to do anything about them this week,
 * and pretending they are a low priority TASK would put a hundred and
 * eleven items into a queue that is supposed to mean something. A watched
 * row is on the board to be seen, not to be actioned.
 */
export type ProspectPriority = "anchor" | "high" | "medium" | "low" | "watch";

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

/**
 * WHAT A ROW IS ON THIS BOARD.
 *
 * The /me build this console was copied from had one kind of row: an
 * organisation you might sell a group booking to. A local marketing
 * console for a division of home services brands has four, and the
 * difference between them decides what every screen should do with the
 * row, so it is a field rather than a convention.
 *
 *   champions   a brand the division actually operates. The row exists
 *               so the board can say where its own coverage already is.
 *   competitor  another operator selling the same service in the same
 *               postcode. The row exists to be watched.
 *   partner     a local organisation that is not in this trade at all:
 *               a school, a church, a dealership, an employer. These are
 *               the sponsorship and hyper-local surfaces the posting
 *               names, and they are the three hundred and twenty nine rows this
 *               console inherited rather than a new invention.
 *   benchmark   an operator outside the service area kept on the board
 *               because it does something worth copying.
 *
 * `other` exists so a row typed in from the field is never rejected for
 * a judgement its author has not made yet.
 */
export type MarketRole =
  | "champions"
  | "competitor"
  | "partner"
  | "benchmark"
  | "other";

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
  /** The role that signs off spend here. A title, never a name. */
  decisionMakerTitle: string;
  email?: string;
  emailSourceUrl?: string;
  emailConfidence: EmailConfidence;
  contactFormUrl?: string;
  /** One concrete sentence on why THIS row is worth a marketer's week. */
  whyTheyFit: string;
  /**
   * The offer to lead with. Must be a real published offer id.
   *
   * OPTIONAL ON THIS BUILD. An offer to lead with is a fact about a
   * household or a partner you could actually send something to, and
   * this board also carries competitors and the division's own brands,
   * where the field means nothing. Absent is the honest value for those
   * rows, and every surface that draws an offer checks for it rather
   * than assuming.
   */
  leadPackageId?: string;
  /** When the work lands. Drives the entire campaign calendar. */
  buyingWindow: string;
  occasionClass: OccasionClass;
  /**
   * Likely reachable households, as a RANGE and with its basis stated.
   *
   * Never a single number. Reach is the input to every revenue figure
   * downstream, and a range that says "40 to 80 doors, based on a
   * single-site clinic's staff list" is honest in a way that "62" is
   * not.
   */
  headcountLow?: number;
  headcountHigh?: number;
  headcountBasis?: string;
  /** Set where the prospect is notable for a reason worth saying out loud. */
  note?: string;

  /**
   * ── THE LOCAL MARKETING FIELDS ─────────────────────────────────
   *
   * Every one of these is OPTIONAL and every one of them is a thing a
   * competitor publishes on its own website, which is the whole reason
   * they are worth collecting: they are the visible half of somebody
   * else's marketing, and a division marketer can read them in an
   * afternoon without buying a data product.
   *
   * They are optional rather than defaulted because an absent field and
   * a field that says "none" are different findings. A contractor with
   * no published offer is not the same as a contractor whose offer we
   * did not check, and a board that cannot tell those apart will get
   * asked about it in the first meeting.
   */

  /** What this row is to the division. See MarketRole. */
  role?: MarketRole;
  /** The promotional offer published on their own site, verbatim. */
  offer?: string;
  /** The financing claim published on their own site, verbatim. */
  financing?: string;
  /** The name of their membership or maintenance plan, as published. */
  membership?: string;
  /** Whether the site offers online booking. Absent means not checked. */
  onlineBooking?: "yes" | "no";
  /** Published locations, where a count is published. */
  locationCount?: number;
  /** The service area their own site claims. */
  serviceArea?: string;
  /** Yelp, where the figure was actually read. A second reputation source. */
  yelpRating?: number;
  yelpReviewCount?: number;
  /** Year founded, where published. Longevity is a local marketing asset. */
  foundedYear?: number;
  /** The service lines they sell, as published. */
  services?: string[];
  /** The one sentence a marketer would act on. */
  marketingAngle?: string;
  /** What their published marketing tells you they are betting on. */
  competitiveSignal?: string;
  /**
   * WHERE THE APPROVAL SITS. See `OrgType` below.
   *
   * Optional on the interface and present on all three hundred and twenty nine
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
 * earns its place in a territory of offices, schools and chains: a
 * school office is dark for a fortnight at a time and a branch manager
 * routing you to a region has given you the most useful sentence of the
 * visit.
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
  /** They put a number of properties or doors in writing. */
  | "named-a-headcount"
  /** They asked who else uses us. Social proof is a late-stage question. */
  | "asked-who-else-has-booked"
  /** "Send me something in writing." Real, and weaker than it sounds. */
  | "asked-for-it-in-writing"
  /** A time in a diary with a role in it. */
  | "agreed-to-meet"
  /** A date in the diary with nothing signed against it. */
  | "held-a-date"
  /** Signed. */
  | "signed"
  /** Silence past the stage threshold after a proposal went out. Derived. */
  | "went-quiet-after-a-quote"
  /** They told us they are using somebody else. */
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
  /** ISO with the territory's own offset, as everywhere else in this app. */
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
  /** They said no to the offer, which is not always a no to the brand. */
  | "declined"
  /** The published expiry passed. Recorded rather than quietly reopened. */
  | "lapsed"
  /** The brand pulled it. Rare, and it needs a reason. */
  | "withdrawn";

/**
 * An offer, actually put to somebody.
 *
 * `Offer` in data/venue.ts is the catalogue: what each of the five
 * brands publishes and what it costs them. This is the ledger of what
 * WAS put to somebody, to which role, when, and whether it still stands.
 *
 * THERE IS NO DISCOUNT FIELD ON THIS TYPE AND THAT IS THE POINT. Not one
 * of these brands publishes a list price to discount from, so a
 * percentage off would be a percentage off a secret. Every extension
 * points at an id in OFFERS and reads that row's published figure rather
 * than restating it, so the two can never drift apart.
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
  /** The published expiry, where the offer carries one at all. */
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
 * It earns that because family drives the commercial argument. A
 * published coupon converts with no call and no negotiation; a
 * membership names itself and hides its price behind a phone number.
 * Seeing a week that is entirely self-serve at a glance is a real read,
 * and it means the calls are cheap and the revenue is one job deep.
 *
 * The five keys are inherited ids read in five other files and are left
 * alone. What each one means here is written here.
 */
export type PackageFamily =
  /** Priced, published, converts with no call. A 47 dollar tune-up. */
  | "self-serve"
  /**
   * Named and unpriced, gated behind a phone number. CHAMP-Rewards is
   * the family's largest example and the reason a marketing role exists.
   */
  | "corporate"
  /** Recurring plans and volume programmes. Thin per visit, loyal over years. */
  | "youth-group"
  /** Whole-property and portfolio work. One decision, many doors. */
  | "buyout"
  /** Community and charity surfaces. The door-opener, not the sale. */
  | "fundraiser";

export type DayPart =
  | "weekday-daytime"
  | "weekday-evening"
  | "weekend"
  | "after-close"
  | "any";

/**
 * A published offer or plan.
 *
 * `pricePerGuest` is `null` wherever the brand does not publish one, and
 * the provenance on that field is "withheld". There is no fallback
 * estimate anywhere in this file. An invented price on a page a hiring
 * manager can check against servicechampions.com in fifteen seconds is
 * the fastest way to lose the room.
 */
export interface EventPackage {
  id: string;
  name: string;
  family: PackageFamily;
  /** What the customer actually gets, in the brand's own published terms. */
  inclusions: string[];
  /**
   * Smallest and largest reach this offer is written for, in doors, or
   * null where the brand publishes no limit. Inherited field names. A
   * single household is a floor of one; a property portfolio campaign
   * has a floor because it is not worth a proposal below it.
   */
  minGuests: number | null;
  maxGuests: number | null;
  pricePerGuest: number | null;
  priceNote?: string;
  /** Published day-part eligibility. This is the real weekday lever. */
  dayParts: DayPart[];
  dayPartNote?: string;
  /** Published terms: notice period, deposit, where any are published. */
  bookingNoticeDays?: number;
  depositPercent?: number;
  /**
   * Crew slots consumed per twenty doors reached, at this console's own
   * stated ratio. This is what makes the capacity screen arithmetic
   * rather than decoration, and the ratio is modelled rather than
   * published, which every screen that prints it has to say.
   */
  lanesPerTwentyGuests?: number;
  /** Which lanes this offer is the right opener for. */
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
  /** Never worked on this offer. The default for most of the book. */
  | "unworked"
  /** Contacted, no answer yet. */
  | "reached-out"
  /** They replied and want to talk. */
  | "conversation"
  /** A proposal is out and nothing is signed. Worth nothing yet. */
  | "soft-hold"
  /** Signed. This is the only state that is revenue. */
  | "booked"
  /** They said no, or they went to a competitor. Recorded, not hidden. */
  | "lost";

/**
 * How a row's current state was learned.
 *
 * A division marketer reads five brand sites, three agency dashboards
 * and a phone log, and none of them are wired into this prototype. A
 * live feed would be a lie. Naming the source is more credible than
 * faking the feed.
 */
export type SignalSource =
  /** Seen in the field, on a visit or at a community shift. */
  | "observed"
  /** They told us, in a reply or on a call. */
  | "reported"
  /** Inferred from their published pages or from the season. */
  | "modeled"
  | "unknown";

export interface ProspectPackageStatus {
  prospectId: string;
  packageId: string;
  periodId: string;
  status: PitchStatus;
  /** Doors discussed, where a number has actually been discussed. */
  discussedHeadcount?: number;
  /** Date in the diary, ISO. */
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
 * A booked line. Signed work with money against it.
 *
 * This is the only place a dollar figure lives. If it is not signed, it
 * is not here, and the number at the top of the Book is the number a
 * general manager would recognise from their own P&L.
 */
export interface BookLine {
  id: string;
  ledger: "booked-revenue";
  /**
   * Which action created this line. A revised proposal sent to the same
   * account for the same offer SUPERSEDES the first rather than stacking
   * a second beside it. A corrected quote is not a second job sold, and
   * the ledger has to agree.
   */
  source?: string;
  prospectId: string;
  packageId: string;
  /** Doors this line was signed against. Inherited field name. */
  guests: number;
  /**
   * Per-door price used for this line.
   *
   * For a published offer this is the published price. Where the brand
   * publishes nothing, somebody types one in and it lands as
   * `user_input` with a visible badge, because a number a person typed
   * and a number a company published are not the same kind of fact.
   */
  pricePerGuest: number;
  pricePerGuestProvenance: Provenance;
  depositPercent: number;
  eventDate: string;
  /** Crew slots this work consumes on its date. Feeds the capacity screen. */
  lanesHeld: number;
  offerId?: string;
  notes?: string;
  sortOrder: number;
}

export type ActivityType =
  /** A table at a fair, a home show or a community day. The job's own word. */
  | "tabling"
  /** Chamber mixer, association meeting, property managers' breakfast. */
  | "networking-event"
  /** Turning up at a partner's place of business. The job's own word. */
  | "go-see"
  /** A call block. Cheap, low yield, still counted honestly. */
  | "call-block"
  /** An email sequence step. */
  | "email-sequence"
  /** A branch visit or a ride-along for a partner who wants to see the crew. */
  | "venue-tour";

/**
 * An outbound activity line. Work promised, and it carries no money.
 *
 * Deliberately no revenue field. Not an omission; the whole reason there
 * are two ledgers is that a weekly marketing report is where activity
 * gets quietly dressed up as results. Twelve community shifts is twelve
 * community shifts. If it turned into work, there is a BookLine, and
 * that is where the dollars are.
 */
export interface ActivityLine {
  id: string;
  ledger: "outbound-activity";
  type: ActivityType;
  /** Where the work happens. A row, or a place in the territory. */
  prospectId?: string;
  locationLabel: string;
  /** Week commencing, ISO. Activity is planned by week, not by day. */
  week: string;
  /** Hours out of the office. The scarce resource, and it is finite. */
  hours: number;
  /** Conversations expected. Modelled, with the assumption shown. */
  targetConversations: number;
  /**
   * The seat that carries this work. A role, never a person.
   *
   * THIS FIELD USED TO BE A STRING SPELLING "Marketing Manager" ON EVERY
   * ROW. It said the right thing and could do nothing with it: an hour
   * could not be attributed, a team could not be rolled up, and a screen
   * about a division had nothing to group by. Promoting it to a seat
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
 * A published offer. What one of the five brands is actually putting in
 * market, read off its own site with its expiry or its lack of one.
 *
 * Note what is NOT here: a discount off a list price nobody publishes.
 * You cannot discount a secret, and not one brand in this research
 * publishes the price a coupon is supposed to be cheaper than. What each
 * row carries instead is the published figure itself, the date it dies
 * on, and a plain statement of what cannot be computed from either.
 */
export interface Offer {
  id: string;
  name: string;
  what: string;
  /** Why it is worth a division marketer's attention this month. */
  rationale: string;
  eligibleLanes: Lane[];
  eligiblePackageFamilies: PackageFamily[];
  /**
   * The published dollar figure on the offer, where the brand prints one.
   * Zero means the published entry price is nothing, not that the offer
   * is free to run, and `costNote` is where that difference is spelled
   * out.
   */
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
  /**
   * DAYS OF PUBLISHED OFFER RUNWAY inside this period, counted from its
   * start to the published expiry of 31 August 2026 and floored at zero.
   * Zero is the honest answer for every period after that date, because
   * no successor campaign is published. The identifier is inherited and
   * read in five other files; the unit it counts is days.
   */
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
