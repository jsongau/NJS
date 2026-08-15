import type { Lane, Provenance } from "@/domain/types";

/**
 * THE COMPETITIVE SET, AS A TYPE THAT REFUSES THE OBVIOUS SCREEN.
 *
 * ── WHAT THE RESEARCH ACTUALLY FOUND ──────────────────────────────
 * The naive version of this surface is a grid of competitors with a
 * per head price in every cell. That grid cannot be built honestly,
 * because nobody in the category publishes a group price. Lucky Strike
 * Fullerton, Lucky Strike Orange, Round1 and Dave and Buster's Orange
 * were each opened and read, and every one of them routes a group or
 * party enquiry to a form or a planner. `data/leagues.ts` records the
 * same silence for league pricing and says so in its own header.
 *
 * So a `pricePerHead` field would be a field with nothing true to put
 * in it, and the first person to fill it in would be inventing a
 * number about somebody else's business on the one screen whose whole
 * job is factual accuracy about other businesses. There is no such
 * field below. What there is instead is `notPublished`, a list of the
 * things a register keeps saying it cannot see, and `routesTo`, which
 * is what the page says in place of a price.
 *
 * ── EVERY FACT CARRIES WHERE IT WAS READ AND WHEN ─────────────────
 * The application already requires a provenance badge on every figure.
 * A fact about ANOTHER company needs one more thing than that: the URL
 * it was read from and the date it was read, because a competitor's
 * page is a moving target in a way Main Event's own gated pricing is
 * not. A promotion expires. A location rebrands. A lane count is
 * refurbished. `sourceUrl` and `readOn` are therefore required on the
 * fact, not optional decoration underneath it.
 *
 * ── WHAT MAY NOT GO IN HERE, STATED IN THE TYPE'S OWN FILE ────────
 * Nothing about a competitor's customers, staff, bookings, occupancy
 * or internal operations. Published marketing pages and public filings
 * only. There is no field below that could hold any of it, which is
 * the cheapest form of enforcement there is.
 */

/**
 * Where a venue sits relative to this one.
 *
 * The distinction is the discipline. Cvent's competitive set criteria
 * are proximity, similar size, similar amenities, similar pricing and
 * the same segment, and a set that ignores proximity stops being a
 * comp set and becomes a list of companies in the same industry.
 */
export type RivalStanding =
  /** In the trade area, same segment, competes for the same group night. */
  | "trade-area"
  /** Same category, no location near enough to take this business. */
  | "category-only"
  /** Owned by the same parent as Main Event since June 2022. */
  | "same-parent"
  /** Not a bowling venue. A room with a calendar, which is the real rival. */
  | "banquet-room";

/** One checkable claim, with the page it was read from and the day. */
export interface RivalFact {
  /** What the claim is about, in two or three words. */
  label: string;
  /** The claim, as close to the page's own wording as is readable. */
  value: string;
  sourceUrl: string;
  /** ISO date the page was opened and read. */
  readOn: string;
  provenance: Provenance;
  /** Where the claim needs a caveat the page itself does not carry. */
  caveat?: string;
}

export interface Rival {
  id: string;
  name: string;
  standing: RivalStanding;
  /** Street address as the operator publishes it, or as noted otherwise. */
  address: string;
  /** Where the address came from, when it is not the operator's own page. */
  addressSource: string;
  /** One sentence on why this venue is in the register at all. */
  whyHere: string;
  /** What it publishes, each item checkable at its own URL. */
  facts: RivalFact[];
  /** What it does not publish. The list is the finding. */
  notPublished: string[];
  /** What a group enquiry hits instead of a price. */
  routesTo: string;
  /** The page the register as a whole was read from. */
  sourceUrl: string;
  readOn: string;
}

/**
 * A dated promotion a competitor has published.
 *
 * The single most useful competitive row available, because it is
 * aimed squarely at the event segment, it is printed on the page in
 * the operator's own words, and it expires, which means the register
 * can be right today and wrong in a fortnight and say which.
 *
 * `printedWindow` is the page's own string. `booksBy` and `heldBy` are
 * that string read as dates, and the year is an inference rather than
 * something the page states, which is why the inference is a field
 * with its own sentence rather than a silent assumption.
 */
export interface RivalPromotion {
  id: string;
  rivalIds: string[];
  code: string;
  /** The offer, in the page's own words. */
  offer: string;
  /** The validity as printed, with no year, because none is printed. */
  printedWindow: string;
  /** Last day to book, as this register reads the printed window. */
  booksBy: string;
  /** Last day the event may be held, likewise. */
  heldBy: string;
  /** Why the year above is what it is, said out loud. */
  yearBasis: string;
  sourceUrl: string;
  readOn: string;
}

/** Where a promotion stands against the date the reader is looking at. */
export type PromotionStanding = "live" | "booking-closed" | "expired";

// ---------------------------------------------------------------
// What beats this venue
// ---------------------------------------------------------------

/**
 * The three things that actually kill a deal here.
 *
 * These are a reading of `data/objections.ts`, made in this file
 * rather than in that one, because the objection register answers a
 * different question and should not grow a field that only this screen
 * uses. The reading is stated per objection in `data/rivals.ts` with a
 * sentence of reasoning each, so a sceptical reader can disagree with
 * one row without having to take the whole classification on trust.
 */
export type LossCause =
  /**
   * The venue's own silence or absence. No published price, no opening
   * date, nothing to walk through, no track record. Nobody else is
   * winning these; the building is losing them on its own.
   */
  | "our-own-gap"
  /**
   * Somebody already has the date, or the money is not appropriated
   * yet. An incumbent supplier or a fiscal calendar, and neither of
   * them is a price.
   */
  | "their-calendar"
  /** A competitor the buyer named out loud. */
  | "a-named-competitor";

export const LOSS_CAUSE_META: Record<
  LossCause,
  { label: string; glyph: string; cssVar: string; note: string }
> = {
  "our-own-gap": {
    label: "Our own gap",
    glyph: "▲",
    cssVar: "var(--risk)",
    note: "The venue loses these to itself. No published price, no opening date, nothing to tour, no track record. A competitor is not involved and beating one would not fix any of them.",
  },
  "their-calendar": {
    label: "Their calendar",
    glyph: "◑",
    cssVar: "var(--warn)",
    note: "Somebody already holds the date, or the money is not appropriated until next year. This is incumbency and appropriation, and the answer is a diary entry rather than a discount.",
  },
  "a-named-competitor": {
    label: "A named competitor",
    glyph: "◆",
    cssVar: "var(--info)",
    note: "The buyer named another venue. One of the seven does this, and the register's own recommended answer is not to compete on brand.",
  },
};

/** One objection, classified, with the reasoning for the classification. */
export interface ObjectionCause {
  objectionId: string;
  cause: LossCause;
  /** Why it sits in that class, in one sentence. */
  because: string;
}

// ---------------------------------------------------------------
// Losses
// ---------------------------------------------------------------

/**
 * WHO REPORTED THE REASON, WHICH IS THE ONE THING WIN AND LOSS WORK
 * INSISTS ON AND THE ONE THING A SMALL FLOOR CANNOT SOLVE.
 *
 * The practice literature is blunt: the reason should not be collected
 * by the person who lost the deal, because a seller leading the
 * interview introduces bias, and it should be collected inside three
 * months, because after that the buyer's memory of the evaluation has
 * been overwritten. A venue with one sales manager and two seats has
 * no independent interviewer available and is not going to acquire
 * one.
 *
 * The honest response is not to pretend the bias is absent. It is to
 * put the evidence quality on the row. A reason the buyer typed into
 * an email is a quotation. A reason the seat wrote down after a phone
 * call is a recollection, made by the person with the most reason to
 * hear it kindly. Both are worth keeping and they are not the same
 * fact, so the register says which it is holding.
 */
export type LossEvidence =
  /** The buyer wrote it. Inbound, unsummarised, still on file. */
  | "buyer-wrote-it"
  /** The seat wrote it afterwards. Inbound, but a recollection. */
  | "seat-wrote-it"
  /** Nothing inbound carries a reason. The row says so. */
  | "no-reason-on-file";

export const LOSS_EVIDENCE_META: Record<
  LossEvidence,
  { label: string; glyph: string; cssVar: string; note: string }
> = {
  "buyer-wrote-it": {
    label: "Buyer wrote it",
    glyph: "●",
    cssVar: "var(--ok)",
    note: "The reason is on file in the buyer's own words, in a message they sent. The strongest evidence a floor this size can produce.",
  },
  "seat-wrote-it": {
    label: "Seat wrote it",
    glyph: "◑",
    cssVar: "var(--warn)",
    note: "A phone call or a doorstep, summarised afterwards by the person who lost it. Worth keeping and worth discounting, because the seller led the conversation.",
  },
  "no-reason-on-file": {
    label: "No reason on file",
    glyph: "○",
    cssVar: "var(--neutral)",
    note: "The record moved to lost and nothing inbound says why. The register shows the gap rather than filling it.",
  },
};

/**
 * How long a loss reason is worth asking about.
 *
 * Ninety days, from the win and loss practice above. It is not a
 * confidence interval and it is not tuned: it is the published rule of
 * thumb, applied to the date the loss was recorded, and it is on the
 * page because it is the only thing on this screen that a reader can
 * act on today and could not act on in March.
 */
export const RECALL_WINDOW_DAYS = 90;

/** Where a loss sits against the recall window on the day being read. */
export type RecallStanding =
  /** Inside the window. There is still a conversation to be had. */
  | "askable"
  /** Past it. The reason on file is the only reason there will be. */
  | "cold"
  /** Ahead of the date being read. Not a loss yet on this clock. */
  | "not-yet";

export const RECALL_META: Record<
  RecallStanding,
  { label: string; glyph: string; cssVar: string; note: string }
> = {
  askable: {
    label: "Still askable",
    glyph: "◑",
    cssVar: "var(--warn)",
    note: "Inside ninety days of the loss. Ring them, ask what decided it, and write down what they say rather than what you remember.",
  },
  cold: {
    label: "Past asking",
    glyph: "○",
    cssVar: "var(--neutral)",
    note: "More than ninety days on. What is on the row is what there is, and the next one has to be caught faster.",
  },
  "not-yet": {
    label: "Not yet",
    glyph: "◇",
    cssVar: "var(--neutral)",
    note: "This loss is recorded after the date being read, so on this clock it has not happened.",
  },
};

/** One deal that died, and everything the record can prove about it. */
export interface LossRow {
  prospectId: string;
  name: string;
  lane: Lane;
  /** The day the record moved to lost. */
  lostOn: string;
  /** The objection in the register that matches, where one does. */
  objectionId?: string;
  /** What the reason class is, read through the objection classification. */
  cause: LossCause;
  /** Why it sits in that class, where the register has said so. */
  because?: string;
  /** Whether the buyer wrote the reason down or the seat did. */
  evidence: LossEvidence;
  /** The reason itself, from the message that carries it. */
  reason: string;
  /** The channel the reason arrived on. */
  channel: string;
  /** Whether the buyer named another venue, and which kind. */
  namedCompetitor: string | null;
  /** Where the reason can be read in full. */
  messageId?: string;
}

/** A loss row read against a date. */
export interface DatedLossRow extends LossRow {
  standing: RecallStanding;
  /** Days since the loss, on the date being read. Negative before it. */
  daysSince: number;
  /** Days left inside the recall window, or zero once it has closed. */
  daysLeft: number;
}

/** The three filters the loss register offers, in reading order. */
export type LossFilter = "all" | "askable" | "cold";

export const LOSS_FILTER_META: Record<
  LossFilter,
  { label: string; note: string }
> = {
  all: {
    label: "Every loss on record",
    note: "Every deal the record has moved to lost, whatever the date being read.",
  },
  askable: {
    label: "Still askable",
    note: "Inside ninety days. These are the ones where ringing back would still produce a reason worth having.",
  },
  cold: {
    label: "Past asking",
    note: "More than ninety days on. Kept, because a register that drops its cold rows cannot show a pattern.",
  },
};
