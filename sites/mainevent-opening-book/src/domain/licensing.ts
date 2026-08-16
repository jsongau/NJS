import type { Provenance } from "@/domain/types";
import type { StatusToken } from "@/domain/vocabulary";

/**
 * LICENSORS, SUPPLIERS AND THE MONEY THAT MOVES BETWEEN THEM.
 *
 * The rest of this application sells events. This file models a
 * different trade that sits next to it: buying licensed promotional
 * product, reporting how it sold to the licensor who owns the property,
 * and controlling the budget the buying came out of.
 *
 * It exists because a second posting asks for exactly that, in its own
 * words, under a heading called "Vendor, Licensor & Budget Management":
 *
 *   "Maintain strong relationships with suppliers and licensors while
 *    scouting new vendor opportunities."
 *   "Track sales performance of promotional products and create detailed
 *    internal and external sales reports for licensors."
 *   "Manage budgets, purchase orders, and invoices to ensure cost control
 *    and compliance with contract terms."
 *
 * Three sentences, three surfaces: /partners, /promo, /spend. The shapes
 * below are what those three sentences need and nothing more.
 *
 * ---------------------------------------------------------------
 * THE THIRD LEDGER, AND WHY IT IS NOT A THIRD FIELD ON THE FIRST TWO
 * ---------------------------------------------------------------
 *
 * `BookProvider` carries two ledgers that are never summed. Booked
 * revenue is money from signed event contracts. Outbound activity is
 * hours outside the building and has no revenue field at all, on purpose.
 *
 * Promotional product revenue is a THIRD thing, and it is the dangerous
 * one, because unlike hours it is denominated in dollars and so it will
 * add up if anybody lets it. It must not. A total that fused an eighty
 * dollar plush sell-through with a four thousand dollar grad night would
 * answer no question a manager asks and would inflate the single number a
 * hiring manager reads first.
 *
 * So promo money lives here, in its own types, with its own totals in
 * `selectors/promo.ts`, and that selector imports nothing from
 * `BookProvider`. The separation is structural rather than a convention
 * somebody has to remember.
 *
 * ---------------------------------------------------------------
 * WHY THE FIGURES ARE IN CENTS
 * ---------------------------------------------------------------
 *
 * Every money figure below is an integer number of cents. A royalty is a
 * percentage of a wholesale value, an invoice is matched to a purchase
 * order, and a budget is compared against the sum of both. Three
 * floating-point dollar amounts through those operations produce the
 * classic penny that appears from nowhere, and a reconciliation screen
 * that is out by a penny is a screen nobody believes. Formatting to
 * dollars happens once, at the edge, in `formatMoney`.
 */

// ---------------------------------------------------------------
// Licences
// ---------------------------------------------------------------

/**
 * A licensed property, as named by a source that was actually read.
 *
 * THIS TYPE HAS NO PRICE, NO ROYALTY AND NO TERM ON IT, and that absence
 * is deliberate. Nature's Mark publishes which properties it is licensed
 * for. It publishes nothing at all about the commercial terms, and a
 * royalty rate hanging off a licence record would look published because
 * everything else on the record is. Terms live on `Contract`, which is
 * seeded illustrative and says so.
 */
export interface Licence {
  id: string;
  /** Spelled as the source page spells it, full stops and all. */
  name: string;
  /** The page that names it, so a reader can check in fifteen seconds. */
  source: string;
  provenance: Provenance;
  /**
   * True where the licence is named on the partners page itself. Harry
   * Potter appears on the Nature's Mark root page and not on the partners
   * page, and the register would rather carry that distinction than
   * quietly flatten two readings into one list.
   */
  onPartnersPage: boolean;
  /** What a family entertainment centre would plausibly do with it. */
  fitNote: string;
}

// ---------------------------------------------------------------
// The gap between a published licence list and a particular floor
// ---------------------------------------------------------------

/**
 * One move in an argument about what a licence list does and does not
 * reach.
 *
 * THIS IS NOT A LICENCE AND IT DELIBERATELY DOES NOT LOOK LIKE ONE. It
 * carries no id that any selector joins on, no source URL and no
 * approval state, because every one of those fields would make an
 * opinion render with the furniture of a sourced fact. What it carries
 * is a heading, a paragraph and a provenance, which is the shape of a
 * claim somebody is making rather than a row somebody read.
 */
export interface GapPoint {
  id: string;
  /** The claim in one line, as a buyer would say it out loud. */
  heading: string;
  /** Why it holds, or why it does not reach far enough. */
  body: string;
  provenance: Provenance;
}

/**
 * The argument a register makes about its own shortfall.
 *
 * A posting asks for a category. A published list does not carry it.
 * There are three honest things to say about that and one dishonest one,
 * and the dishonest one is the easiest to write, so the shape below has
 * nowhere to put it. There is no `available`, no `sourceable`, no
 * `inDiscussion` and no list of candidate properties on this type. The
 * only licence it can point at is one already on the published register,
 * named by id so it cannot be a property nobody published.
 */
export interface LicenceGap {
  /** The posting line this answers, quoted exactly as it is printed. */
  postingLine: string;
  postingCite: string;
  /**
   * The one published licence the bridge argument rests on, by id. An id
   * rather than a name, so the spelling on screen stays the spelling the
   * source page carries and the bridge cannot be a property that is not
   * on the register at all.
   */
  bridgeLicenceId: string;
  /** Published ids whose property is owned by a Japanese company. */
  japaneseLicenceIds: string[];
  /**
   * Published ids carrying an anime or game property. Empty, and the
   * emptiness is the finding rather than a to-do. It is a field so that
   * the count on screen is read off the data rather than typed into the
   * markup as a nine or a zero somebody has to keep true by hand.
   */
  animeOrGameLicenceIds: string[];
  /** What the list does reach, including the bridge and its limit. */
  reach: GapPoint[];
  /** What it does not reach, said plainly. */
  shortfall: GapPoint[];
  /** What closing the gap would actually require. */
  route: GapPoint[];
  /** Sentences stating what is not being claimed. Plain strings. */
  notClaimed: string[];
}

// ---------------------------------------------------------------
// Partners
// ---------------------------------------------------------------

/**
 * What a partner is FOR, which decides what you ask them and when.
 *
 * A manufacturing partner is worked on lead times measured in months and
 * a catering supplier is worked on a Tuesday for a Thursday. Filing both
 * under "vendor" produces a register sorted by nothing useful.
 */
export type PartnerKind =
  /** Makes licensed product in volume. Long lead times, real minimums. */
  | "manufacturing"
  /** Print: flyers, table tents, tickets, redemption vouchers. */
  | "print"
  /** Signage and large format: banners, window graphics, lane cards. */
  | "signage"
  /** Prize wall and redemption stock. The arcade's own inventory. */
  | "prize-redemption"
  /** Food and drink brought in for an event the kitchen does not cover. */
  | "catering"
  /** Staff and team apparel, uniform, event tees. */
  | "apparel"
  /** Freight, customs and the warehouse the container lands in. */
  | "logistics";

export const PARTNER_KIND: Record<PartnerKind, StatusToken> = {
  manufacturing: {
    glyph: "▣",
    label: "Manufacturing",
    cssVar: "var(--fam-corporate)",
    note: "Produces licensed product in volume. Lead times in months and minimums that decide whether a promotion is possible at all.",
  },
  print: {
    glyph: "▤",
    label: "Print",
    cssVar: "var(--fam-self-serve)",
    note: "Flyers, table tents, redemption vouchers, tickets. Short lead times and the thing a promotion falls over on last.",
  },
  signage: {
    glyph: "▦",
    label: "Signage",
    cssVar: "var(--fam-youth-group)",
    note: "Banners, window graphics, lane cards. Priced by the square foot and installed by somebody with a ladder.",
  },
  "prize-redemption": {
    glyph: "◈",
    label: "Prize and redemption",
    cssVar: "var(--fam-fundraiser)",
    note: "The prize wall. Bought by the case, redeemed by the ticket, and the one category where sell-through is the whole story.",
  },
  catering: {
    glyph: "◍",
    label: "Catering",
    cssVar: "var(--lane-hospitality)",
    note: "Brought in for what the kitchen does not cover. Ordered late, cancelled later, and invoiced either way.",
  },
  apparel: {
    glyph: "◎",
    label: "Apparel",
    cssVar: "var(--lane-fitness)",
    note: "Uniform, crew tees, event apparel. Sized rather than counted, which is why the reorder is never the same as the first order.",
  },
  logistics: {
    glyph: "▥",
    label: "Logistics",
    cssVar: "var(--neutral)",
    note: "Freight, customs and the warehouse a container lands in. Invisible until it is the only thing anyone is talking about.",
  },
};

export const PARTNER_KIND_ORDER: PartnerKind[] = [
  "manufacturing",
  "prize-redemption",
  "print",
  "signage",
  "apparel",
  "catering",
  "logistics",
];

/**
 * Where a relationship actually stands.
 *
 * THE GLYPHS ARE THE SAME FILLING CIRCLE THE PITCH STATUSES USE, for the
 * same reason: one shape filling up is a progress bar a reader already
 * understands, and it survives greyscale, a printout and a phone in
 * bright sun. "Lapsed" breaks the sequence with a different glyph
 * entirely, because it is the sequence stopping rather than a further
 * stage of it.
 */
export type RelationshipState =
  /** Identified, never contacted. The scouting half of the posting. */
  | "prospect"
  /** Contacted, talking, nothing agreed. */
  | "in-talks"
  /** Samples requested or in hand. Quality being judged before purchase. */
  | "sampling"
  /** Terms agreed and signed. Nothing ordered yet. */
  | "contracted"
  /** Signed and trading. Orders flowing. */
  | "active"
  /** Deliberately paused. A dispute, a season, a quality hold. */
  | "on-hold"
  /** Was trading, has stopped. Not a failure, but not a supplier. */
  | "lapsed";

export const RELATIONSHIP_STATE: Record<RelationshipState, StatusToken> = {
  prospect: {
    glyph: "○",
    label: "Prospect",
    cssVar: "var(--neutral)",
    note: "Identified and never contacted. This is the scouting half of the register.",
  },
  "in-talks": {
    glyph: "◔",
    label: "In talks",
    cssVar: "var(--info)",
    note: "Contacted and talking. Nothing agreed and nothing to rely on yet.",
  },
  sampling: {
    glyph: "◑",
    label: "Sampling",
    cssVar: "var(--info)",
    note: "Samples requested or in hand. Quality is being judged before any money moves.",
  },
  contracted: {
    glyph: "◕",
    label: "Contracted",
    cssVar: "var(--warn)",
    note: "Terms agreed and signed. Nothing ordered against it yet, which is a signature doing no work.",
  },
  active: {
    glyph: "●",
    label: "Active",
    cssVar: "var(--ok)",
    note: "Signed and trading. Orders are flowing and invoices are landing.",
  },
  "on-hold": {
    glyph: "◘",
    label: "On hold",
    cssVar: "var(--warn)",
    note: "Deliberately paused. A quality hold, a dispute or a season that has not come round.",
  },
  lapsed: {
    glyph: "✕",
    label: "Lapsed",
    cssVar: "var(--risk)",
    note: "Was trading and has stopped. Worth a call before it is worth a replacement.",
  },
};

export const RELATIONSHIP_STATE_ORDER: RelationshipState[] = [
  "active",
  "contracted",
  "sampling",
  "in-talks",
  "on-hold",
  "prospect",
  "lapsed",
];

/**
 * Where a licence stands with the party who owns it.
 *
 * A licence you can manufacture against and a licence you have written
 * approval to put on a specific promotion are different facts, and the
 * posting names the second one directly: "licensor approval processes".
 */
export type ApprovalState = "approved" | "submitted" | "not-submitted";

export const APPROVAL_STATE: Record<ApprovalState, StatusToken> = {
  approved: {
    glyph: "✓",
    label: "Approved",
    cssVar: "var(--ok)",
    note: "Artwork and product approved for this promotion by the party who owns the property.",
  },
  submitted: {
    glyph: "◐",
    label: "Submitted",
    cssVar: "var(--warn)",
    note: "With the licensor and awaiting a decision. Nothing may be produced against it yet.",
  },
  "not-submitted": {
    glyph: "○",
    label: "Not submitted",
    cssVar: "var(--neutral)",
    note: "Capability only. No artwork has gone to the licensor for this promotion.",
  },
};

export interface Partner {
  id: string;
  name: string;
  kind: PartnerKind;
  /** One line. What they actually supply, in trade words. */
  supplies: string;
  /** Licence ids this partner can carry. Empty for unlicensed suppliers. */
  licenceIds: string[];
  /** Where approval stands on the licences above. */
  approval: ApprovalState;
  /** Working days from order to delivery. */
  leadTimeDays: number;
  /** Smallest order they will take, in the unit below. */
  minimumOrderQty: number;
  minimumOrderUnit: string;
  state: RelationshipState;
  /** ISO date. The last time somebody actually worked this relationship. */
  lastWorked: string;
  /** The next thing to do, in plain words. A verb first. */
  nextAction: string;
  /** Where they sit. Local matters for lead time; overseas matters for freight. */
  region: string;
  /** Set only where a real published page carries the claim. */
  source?: string;
  /**
   * The provenance of the ROW. Every figure on the row carries its own
   * badge as well, because a row can be a real company with invented
   * lead times, which is precisely what Nature's Mark is here.
   */
  provenance: Provenance;
  /** One line of context where a row would otherwise be misread. */
  note?: string;
}

// ---------------------------------------------------------------
// Promotional product
// ---------------------------------------------------------------

export type PromoCategory =
  | "plush"
  | "collectible"
  | "apparel"
  | "novelty"
  | "print"
  | "food-novelty";

export const PROMO_CATEGORY: Record<PromoCategory, StatusToken> = {
  plush: {
    glyph: "◍",
    label: "Plush",
    cssVar: "var(--fam-youth-group)",
    note: "The top of the prize wall. Highest ticket cost, longest lead time, and the thing a child walks in for.",
  },
  collectible: {
    glyph: "◈",
    label: "Collectible",
    cssVar: "var(--fam-corporate)",
    note: "Figures, pins, keyrings. Sells on the property rather than on the object.",
  },
  apparel: {
    glyph: "◎",
    label: "Apparel",
    cssVar: "var(--lane-fitness)",
    note: "Tees and caps. Sized, so the reorder never matches the first order.",
  },
  novelty: {
    glyph: "◆",
    label: "Novelty",
    cssVar: "var(--fam-self-serve)",
    note: "Light-up, sound-making, pocket-sized. Cheap per unit and the volume driver on the wall.",
  },
  print: {
    glyph: "▤",
    label: "Print",
    cssVar: "var(--neutral)",
    note: "Cards, vouchers and table media. Not sold, given, and still bought with real money.",
  },
  "food-novelty": {
    glyph: "◔",
    label: "Food novelty",
    cssVar: "var(--lane-hospitality)",
    note: "Branded confectionery and cups. Dated stock, which makes weeks of cover the figure that matters.",
  },
};

export const PROMO_CATEGORY_ORDER: PromoCategory[] = [
  "plush",
  "collectible",
  "novelty",
  "apparel",
  "food-novelty",
  "print",
];

/**
 * A promotional product line, stored as the four things that are counted
 * and nothing that can be worked out from them.
 *
 * There is no `sellThrough`, no `revenue`, no `margin` and no
 * `weeksOfCover` field anywhere on this type, and there never will be.
 * Every one of them is derived in `selectors/promo.ts` at render. A
 * stored sell-through is a number that was true once, and the first time
 * somebody edits units without editing it, the page starts lying quietly
 * in a way nobody catches for a month.
 */
export interface PromoLine {
  id: string;
  name: string;
  category: PromoCategory;
  /** null where the line carries no licensed property at all. */
  licenceId: string | null;
  /** Who makes it. */
  partnerId: string;
  /** Trading period this row is counted against. */
  periodId: string;
  /** Units received into stock in the period. */
  unitsIn: number;
  /** Units sold or redeemed out in the period. */
  unitsOut: number;
  /** Units on hand at the end of the period. */
  unitsOnHand: number;
  /** Landed cost per unit, in cents. Freight and duty included. */
  unitCostCents: number;
  /** What a guest pays, or the ticket value redeemed against, in cents. */
  unitRetailCents: number;
  /** Weeks in the trading period, so weeks of cover has a denominator. */
  weeksInPeriod: number;
  provenance: Provenance;
}

export interface PromoPeriod {
  id: string;
  label: string;
  /** ISO. Printed on the licensor report, because a report without a period is a rumour. */
  startsOn: string;
  endsOn: string;
  weeks: number;
}

// ---------------------------------------------------------------
// Contracts
// ---------------------------------------------------------------

export type RenewalKind = "auto" | "mutual" | "none";

export const RENEWAL_KIND: Record<RenewalKind, StatusToken> = {
  auto: {
    glyph: "◉",
    label: "Auto renews",
    cssVar: "var(--warn)",
    note: "Renews on its own unless notice is served. The notice period is the date that actually matters.",
  },
  mutual: {
    glyph: "◇",
    label: "By agreement",
    cssVar: "var(--info)",
    note: "Renews only if both parties sign again. Nothing happens without a conversation.",
  },
  none: {
    glyph: "▪",
    label: "Ends",
    cssVar: "var(--neutral)",
    note: "Runs to the end date and stops. A new agreement is a new negotiation.",
  },
};

/**
 * An agreement with a partner or a licensor.
 *
 * The five terms below are the five a manager is asked about in a
 * meeting, which is why they are fields rather than a free-text blob:
 * how long, what is guaranteed, what rate, when do we pay, and how much
 * warning before it renews itself.
 */
export interface Contract {
  id: string;
  title: string;
  /** Partner id this agreement is with. */
  partnerId: string;
  /** Licence ids the agreement covers. Empty for a pure supply deal. */
  licenceIds: string[];
  startsOn: string;
  endsOn: string;
  /**
   * The floor payable to the licensor whatever sells, in cents. Zero
   * where the agreement carries none, which is a real and different fact
   * from a small one.
   */
  minimumGuaranteeCents: number;
  /** Percentage of wholesale value payable as royalty. */
  royaltyRatePct: number;
  /** Days from invoice date to due date. */
  paymentTermsDays: number;
  /** Days of written notice before the end date. */
  noticePeriodDays: number;
  renewal: RenewalKind;
  provenance: Provenance;
  note?: string;
}

// ---------------------------------------------------------------
// Budgets, purchase orders, invoices
// ---------------------------------------------------------------

export interface BudgetLine {
  id: string;
  label: string;
  /** Which spending this line pays for, in words a manager uses. */
  category: string;
  periodId: string;
  budgetCents: number;
  provenance: Provenance;
}

/**
 * Purchase order state, in the order money hardens.
 *
 * Draft is an intention. Approved is a decision. Issued is a commitment
 * somebody outside the building is relying on. Received is stock on a
 * shelf. Cancelled releases the money. The distinction between approved
 * and issued is the one that gets skipped in every simple model, and it
 * is the one that decides whether a budget can still be pulled back.
 */
export type PoState =
  | "draft"
  | "approved"
  | "issued"
  | "part-received"
  | "received"
  | "cancelled";

export const PO_STATE: Record<PoState, StatusToken> = {
  draft: {
    glyph: "○",
    label: "Draft",
    cssVar: "var(--neutral)",
    note: "An intention. Commits nothing and can be deleted without a phone call.",
  },
  approved: {
    glyph: "◔",
    label: "Approved",
    cssVar: "var(--info)",
    note: "Signed off internally and not yet sent. The last point at which the money can be pulled back quietly.",
  },
  issued: {
    glyph: "◑",
    label: "Issued",
    cssVar: "var(--warn)",
    note: "With the supplier and being worked. Committed money, whether or not anything has arrived.",
  },
  "part-received": {
    glyph: "◕",
    label: "Part received",
    cssVar: "var(--warn)",
    note: "Some of it landed. The rest is still a commitment and still unbilled.",
  },
  received: {
    glyph: "●",
    label: "Received",
    cssVar: "var(--ok)",
    note: "In full and on the shelf. Waiting only on the invoice.",
  },
  cancelled: {
    glyph: "✕",
    label: "Cancelled",
    cssVar: "var(--risk)",
    note: "Withdrawn. Releases its committed money back to the budget line.",
  },
};

export const PO_STATE_ORDER: PoState[] = [
  "draft",
  "approved",
  "issued",
  "part-received",
  "received",
  "cancelled",
];

export interface PurchaseOrder {
  id: string;
  /** The number a supplier quotes back on the phone. */
  reference: string;
  partnerId: string;
  budgetLineId: string;
  /** What it is for, one line. */
  description: string;
  raisedOn: string;
  /** ISO date the goods are expected. */
  expectedOn: string;
  state: PoState;
  amountCents: number;
  provenance: Provenance;
}

/**
 * Invoice state.
 *
 * "Approved" here means approved for payment and not yet paid, which is
 * the state most money sits in and the one a payment run empties.
 */
export type InvoiceState = "received" | "approved" | "paid" | "disputed";

export const INVOICE_STATE: Record<InvoiceState, StatusToken> = {
  received: {
    glyph: "◔",
    label: "Received",
    cssVar: "var(--info)",
    note: "Arrived and not yet checked against its purchase order.",
  },
  approved: {
    glyph: "◑",
    label: "Approved to pay",
    cssVar: "var(--warn)",
    note: "Matched and cleared for the next payment run. Money owed and not yet gone.",
  },
  paid: {
    glyph: "●",
    label: "Paid",
    cssVar: "var(--ok)",
    note: "Settled. Actual spend against the budget line.",
  },
  disputed: {
    glyph: "✕",
    label: "Disputed",
    cssVar: "var(--risk)",
    note: "Held against a quantity, a price or a damage claim. Ages like any other invoice while the argument runs.",
  },
};

export const INVOICE_STATE_ORDER: InvoiceState[] = [
  "disputed",
  "approved",
  "received",
  "paid",
];

export interface Invoice {
  id: string;
  reference: string;
  /** null where an invoice arrived with no purchase order behind it. */
  poId: string | null;
  /**
   * Coded straight onto the invoice rather than inherited from the
   * purchase order, because an invoice can arrive without one and still
   * has to land on a budget line. An accounts payable clerk codes the
   * invoice; they do not go looking for a purchase order that was never
   * raised. Inheriting it would have made every no-PO invoice invisible
   * to the budget, which is precisely the spend that gets away.
   */
  budgetLineId: string;
  partnerId: string;
  issuedOn: string;
  /** Derived from the contract's payment terms when the row was seeded. */
  dueOn: string;
  amountCents: number;
  state: InvoiceState;
  paidOn?: string;
  provenance: Provenance;
  note?: string;
}

// ---------------------------------------------------------------
// Formatting, in one place
// ---------------------------------------------------------------

/**
 * Cents to a dollar string, formatted once at the edge.
 *
 * Whole dollars above a hundred, because a promotional budget read to the
 * penny is four characters of noise on every row of a table somebody is
 * scanning for the one line that is over. Cents survive below a hundred
 * dollars, where a unit cost of $1.85 is the whole point.
 */
export function formatMoney(cents: number): string {
  const dollars = cents / 100;
  const abs = Math.abs(dollars);
  return dollars.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: abs < 100 ? 2 : 0,
    maximumFractionDigits: abs < 100 ? 2 : 0,
  });
}

/** A short date in the house format, "12 Dec 2026". */
export function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Whole days between two ISO dates. Negative where `to` is in the past. */
export function daysBetween(fromIso: string, toIso: string): number {
  const a = Date.parse(`${fromIso}T12:00:00Z`);
  const b = Date.parse(`${toIso}T12:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.round((b - a) / 86_400_000);
}
