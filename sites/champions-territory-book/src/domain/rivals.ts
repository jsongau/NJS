import type { Lane, Provenance } from "@/domain/types";

/**
 * THE COMPETITIVE SET, AS A TYPE THAT REFUSES THE OBVIOUS SCREEN.
 *
 * ── WHAT THE RESEARCH ACTUALLY FOUND ──────────────────────────────
 * The naive version of this surface is a grid of rivals with a price
 * in every cell. Half of that grid can be built honestly and half of
 * it cannot, and the half that cannot is the half that matters.
 *
 * The coupons are published and they are specific: a fifty seven
 * dollar drain with a promo code, seventy seven with an access limit,
 * ninety nine at four storefronts, fifty off a repair almost
 * everywhere, five hundred off a replacement at the franchises and an
 * up to ceiling of fifteen hundred to two thousand elsewhere. Those
 * belong on the screen with their URLs attached.
 *
 * The membership price is published nowhere. Fourteen brands were
 * profiled across five counties and every one of them names a plan and
 * hides the number, so a `planPricePerMonth` field would be a field
 * with nothing true to put in it, and the first person to fill it in
 * would be inventing a figure about somebody else's business on the
 * one screen whose whole job is factual accuracy about other
 * businesses. There is no such field below. What there is instead is
 * `notPublished`, a list of the things a register keeps saying it
 * cannot see, and `routesTo`, which is what the page offers in place
 * of a number.
 *
 * ── EVERY FACT CARRIES WHERE IT WAS READ AND WHEN ─────────────────
 * The application already requires a provenance badge on every figure.
 * A fact about ANOTHER company needs one more thing than that: the URL
 * it was read from and the date it was read, because a rival's
 * marketing page is a moving target in a way our own published offer
 * is not. A coupon expires. A franchise changes hands. A domain
 * redirects onto a new one. `sourceUrl` and `readOn` are therefore
 * required on the fact, not optional decoration underneath it.
 *
 * ── WHAT MAY NOT GO IN HERE, STATED IN THE TYPE'S OWN FILE ────────
 * Nothing about a rival's customers, staff, call volume, close rate or
 * internal operations. Published marketing pages only. There is no
 * field below that could hold any of it, which is the cheapest form of
 * enforcement there is.
 */

/**
 * Where a rival sits relative to this brand.
 *
 * The distinction is the discipline. A competitive set is built on
 * proximity, comparable size, comparable services and the same
 * customer, and a set that ignores proximity stops being a comp set
 * and becomes a list of companies in the same trade.
 */
export type RivalStanding =
  /** In the five counties, same services, competes for the same call. */
  | "trade-area"
  /** Same trade, no branch near enough to take a call here. */
  | "category-only"
  /** Publishes a partnership with another brand in this register. */
  | "same-parent"
  /** Competes on a guarantee rather than on a price. */
  | "guarantee-led";

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
  /** One sentence on why this brand is in the register at all. */
  whyHere: string;
  /** What it publishes, each item checkable at its own URL. */
  facts: RivalFact[];
  /** What it does not publish. The list is the finding. */
  notPublished: string[];
  /** What a question about the plan price hits instead of a number. */
  routesTo: string;
  /** The page the register as a whole was read from. */
  sourceUrl: string;
  readOn: string;
}

/**
 * A dated coupon a rival has published.
 *
 * The single most useful competitive row available, because it is
 * printed in the operator's own words, it is aimed at the same
 * household this division is buying clicks for, and it expires, which
 * means the register can be right today and wrong in a fortnight and
 * say which.
 *
 * `printedWindow` is the page's own string. `booksBy` and `heldBy` are
 * that string read as dates. Where a page prints one deadline and not
 * two, both fields carry the same date rather than a service window
 * nobody published, and `yearBasis` says so out loud.
 */
export interface RivalPromotion {
  id: string;
  rivalIds: string[];
  /** The coupon's headline as printed, or its promo code where one exists. */
  code: string;
  /** The offer, in the page's own words. */
  offer: string;
  /** The validity exactly as the coupon prints it. */
  printedWindow: string;
  /** Last day to claim it, as this register reads the printed window. */
  booksBy: string;
  /** Last day the work may be done under it, likewise. */
  heldBy: string;
  /** How the two dates above were read, said out loud. */
  yearBasis: string;
  sourceUrl: string;
  readOn: string;
}

/** Where a promotion stands against the date the reader is looking at. */
export type PromotionStanding = "live" | "booking-closed" | "expired";

// ---------------------------------------------------------------
// What beats this brand
// ---------------------------------------------------------------

/**
 * The three things that actually kill a job here.
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
   * Our own gap. A ticket we do not justify with a published plan
   * price, a rebate answer a rep gets wrong, a replacement pitched at
   * somebody who asked for a repair. Nobody else is winning these.
   */
  | "our-own-gap"
  /**
   * Somebody else's decision cycle. An incumbent tradesman, an absent
   * owner, a board that meets monthly and wants three bids. None of
   * them is a price.
   */
  | "their-calendar"
  /** A rival's published figure, quoted at us by the customer. */
  | "a-named-competitor";

export const LOSS_CAUSE_META: Record<
  LossCause,
  { label: string; glyph: string; cssVar: string; note: string }
> = {
  "our-own-gap": {
    label: "Our own gap",
    glyph: "▲",
    cssVar: "var(--risk)",
    note: "The brand loses these to itself. An unjustified ticket, an unpublished plan price, a rebate answered badly, a repair answered with a replacement quote. No rival is involved and beating one would not fix any of them.",
  },
  "their-calendar": {
    label: "Their decision cycle",
    glyph: "◑",
    cssVar: "var(--warn)",
    note: "Somebody already holds the account, or the person in the building cannot sign, or the board meets next month and wants three bids. This is incumbency and approval, and the answer is a diary entry rather than a discount.",
  },
  "a-named-competitor": {
    label: "A rival's published price",
    glyph: "◆",
    cssVar: "var(--info)",
    note: "The customer quoted a published figure at us. One of the seven does this, and the register's own recommended answer is not to match it.",
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
 * INSISTS ON AND THE ONE THING A SMALL DIVISION CANNOT SOLVE.
 *
 * The practice literature is blunt: the reason should not be collected
 * by the person who lost the job, because a seller leading the
 * interview introduces bias, and it should be collected inside three
 * months, because after that the customer's memory of the decision has
 * been overwritten. A brand marketing team with one manager and a
 * shared inbox has no independent interviewer available and is not
 * going to acquire one.
 *
 * The honest response is not to pretend the bias is absent. It is to
 * put the evidence quality on the row. A reason the customer typed
 * into an email is a quotation. A reason the seat wrote down after a
 * phone call is a recollection, made by the person with the most
 * reason to hear it kindly. Both are worth keeping and they are not
 * the same fact, so the register says which it is holding.
 */
export type LossEvidence =
  /** The customer wrote it. Inbound, unsummarised, still on file. */
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
    label: "Customer wrote it",
    glyph: "●",
    cssVar: "var(--ok)",
    note: "The reason is on file in the customer's own words, in a message they sent. The strongest evidence a team this size can produce.",
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

/** One job that died, and everything the record can prove about it. */
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
  /** Whether the customer wrote the reason down or the seat did. */
  evidence: LossEvidence;
  /** The reason itself, from the message that carries it. */
  reason: string;
  /** The channel the reason arrived on. */
  channel: string;
  /** Whether the customer named anybody else, and which kind. */
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
    note: "Every job the record has moved to lost, whatever the date being read.",
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
