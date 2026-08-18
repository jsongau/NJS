import type { Provenance } from "@/domain/types";
import type { StatusToken } from "@/domain/vocabulary";

/**
 * VENDORS, MARK PERMISSIONS, AND THE MONEY THAT MOVES BETWEEN THEM.
 *
 * The rest of this application generates phone calls and web leads. This
 * file models the trade that sits behind them: the agencies and
 * suppliers a division marketer works, the permission to put somebody
 * else's name and marks on a piece of local advertising, the stock of
 * branded collateral that permission produces, and the budget it all
 * comes out of.
 *
 * It exists because the Brea posting asks for exactly that. The manager
 * works with the digital marketing agencies to optimise paid search,
 * Local Services Ads and retargeting, manages vendors and agencies, and
 * owns a budget framed explicitly as driving incremental phone calls and
 * web leads. Three surfaces answer those: /partners, /promo, /spend. The
 * shapes below are what those need and nothing more.
 *
 * ---------------------------------------------------------------
 * WHAT A LICENCE IS HERE, AND WHY THIS FILE KEEPS THE SAMPLE HONEST
 * ---------------------------------------------------------------
 *
 * A `Licence` below is a PERMISSION TO USE A NAME. A brand mark on a
 * door hanger, a manufacturer's logo on a co-branded landing page, an
 * awarding body's badge on a truck wrap. In home services those
 * permissions are real, they are granted in writing, and creative goes
 * for approval before anything is printed.
 *
 * This console holds none of them. It is an unaffiliated work sample.
 * Nothing in this file, and nothing any screen reading it renders, is a
 * claim that any real organisation has granted anything, agreed
 * anything, or said anything. Every seeded row carries illustrative
 * provenance and every screen prints it beside the row rather than in a
 * footnote. Where a fact IS public, the row carries the page it was read
 * from so a sceptical reader can check it in fifteen seconds.
 *
 * That is the rule this file enforces structurally rather than by
 * remembering: an approval state is a state of a row in a prototype, a
 * royalty rate lives on `Contract` which is seeded and says so, and
 * there is no field anywhere below that could hold a sentence attributed
 * to a named organisation.
 *
 * ---------------------------------------------------------------
 * THE THIRD LEDGER, AND WHY IT IS NOT A THIRD FIELD ON THE FIRST TWO
 * ---------------------------------------------------------------
 *
 * `BookProvider` carries two ledgers that are never summed. Booked
 * revenue is money from signed work. Outbound activity is hours out in
 * the territory and has no revenue field at all, on purpose.
 *
 * Collateral and merchandise money is a THIRD thing, and it is the
 * dangerous one, because unlike hours it is denominated in dollars and
 * so it will add up if anybody lets it. It must not. A total that fused
 * eighty dollars of branded filters with a four thousand dollar system
 * replacement would answer no question a manager asks and would inflate
 * the single number a hiring manager reads first.
 *
 * So this money lives here, in its own types, with its own totals in
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
 * A name or mark this console models permission to use, as named by a
 * source that was actually read.
 *
 * THIS TYPE HAS NO PRICE, NO ROYALTY AND NO TERM ON IT, and that absence
 * is deliberate. A supplier will publish which marks it is set up to
 * print. It publishes nothing at all about the commercial terms, and a
 * royalty rate hanging off this record would look published because
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
   * True where the mark is named on the supplier's own partners page
   * rather than merely somewhere on its site. Two readings of one
   * company are two different strengths of evidence, and the register
   * would rather carry the distinction than quietly flatten them into
   * one list.
   */
  onPartnersPage: boolean;
  /** What a West Division brand would plausibly do with it locally. */
  fitNote: string;
}

// ---------------------------------------------------------------
// The gap between a published mark list and a particular territory
// ---------------------------------------------------------------

/**
 * One move in an argument about what a vendor's published mark list does
 * and does not reach.
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
 * A posting asks for a capability. A vendor's published list does not
 * carry it. There are three honest things to say about that and one
 * dishonest one, and the dishonest one is the easiest to write, so the
 * shape below has nowhere to put it. There is no `available`, no
 * `sourceable`, no `inDiscussion` and no list of marks somebody hopes to
 * get on this type. The only mark it can point at is one already on the
 * published register, named by id so it cannot be something nobody
 * published.
 *
 * THE FIELD NAMES BELOW ARE INHERITED and are not renamed while other
 * files could join on them. What each one holds is written beside it.
 */
export interface LicenceGap {
  /** The posting line this answers, quoted exactly as it is printed. */
  postingLine: string;
  postingCite: string;
  /**
   * The one published mark the bridge argument rests on, by id. An id
   * rather than a name, so the spelling on screen stays the spelling the
   * source page carries and the bridge cannot be something that is not on
   * the register at all.
   */
  bridgeLicenceId: string;
  /** Published ids the vendor can already produce in the territory. */
  japaneseLicenceIds: string[];
  /**
   * Published ids covering the capability the posting names. Empty, and
   * the emptiness is the finding rather than a to-do. It is a field so
   * that the count on screen is read off the data rather than typed into
   * the markup as a nine or a zero somebody has to keep true by hand.
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
 * What a vendor is FOR, which decides what you ask them and when.
 *
 * A fulfilment partner is worked on lead times measured in months and a
 * print shop is worked on a Tuesday for a Thursday. Filing both under
 * "vendor" produces a register sorted by nothing useful.
 */
export type PartnerKind =
  /** Produces branded goods in volume. Long lead times, real minimums. */
  | "manufacturing"
  /** Print: door hangers, mailers, invoice leave-behinds, coupon cards. */
  | "print"
  /** Signage and large format: yard signs, truck wraps, home show stands. */
  | "signage"
  /** Leave-behind and referral stock. What a technician hands over. */
  | "prize-redemption"
  /** Food and hospitality bought in for a community day or a trade stand. */
  | "catering"
  /** Crew uniform, branded shirts, high-visibility kit. */
  | "apparel"
  /** Freight, customs and the warehouse the container lands in. */
  | "logistics";

export const PARTNER_KIND: Record<PartnerKind, StatusToken> = {
  manufacturing: {
    glyph: "▣",
    label: "Manufacturing",
    cssVar: "var(--fam-corporate)",
    note: "Produces branded goods in volume. Lead times in months and minimums that decide whether a campaign is possible at all.",
  },
  print: {
    glyph: "▤",
    label: "Print",
    cssVar: "var(--fam-self-serve)",
    note: "Door hangers, mailers, coupon cards, invoice leave-behinds. Short lead times and the thing a campaign falls over on last.",
  },
  signage: {
    glyph: "▦",
    label: "Signage",
    cssVar: "var(--fam-youth-group)",
    note: "Yard signs, truck wraps, home show stands. Priced by the square foot and fitted by somebody with a ladder.",
  },
  "prize-redemption": {
    glyph: "◈",
    label: "Leave-behind and referral",
    cssVar: "var(--fam-fundraiser)",
    note: "What a technician leaves on the counter. Bought by the case, given away by the job, and the one category where take-up is the whole story.",
  },
  catering: {
    glyph: "◍",
    label: "Catering",
    cssVar: "var(--lane-partner-employer)",
    note: "Bought in for a community day or a trade stand. Ordered late, cancelled later, and invoiced either way.",
  },
  apparel: {
    glyph: "◎",
    label: "Apparel",
    cssVar: "var(--lane-electrical)",
    note: "Crew uniform, branded shirts, high-visibility kit. Sized rather than counted, which is why the reorder is never the same as the first order.",
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
 * Where a mark permission stands with the organisation that owns it.
 *
 * A mark a supplier is set up to print and a mark you hold written
 * approval to put on one specific campaign are different facts, and only
 * the second one lets anything go to press. Nothing on this type is a
 * claim that any real organisation has approved anything; the states
 * below describe rows in a prototype.
 */
export type ApprovalState = "approved" | "submitted" | "not-submitted";

export const APPROVAL_STATE: Record<ApprovalState, StatusToken> = {
  approved: {
    glyph: "✓",
    label: "Approved",
    cssVar: "var(--ok)",
    note: "Artwork and goods approved for this campaign by the organisation that owns the mark.",
  },
  submitted: {
    glyph: "◐",
    label: "Submitted",
    cssVar: "var(--warn)",
    note: "With the mark owner and awaiting a decision. Nothing may be produced against it yet.",
  },
  "not-submitted": {
    glyph: "○",
    label: "Not submitted",
    cssVar: "var(--neutral)",
    note: "Capability only. No artwork has gone to the mark owner for this campaign.",
  },
};

export interface Partner {
  id: string;
  name: string;
  kind: PartnerKind;
  /** One line. What they actually supply, in trade words. */
  supplies: string;
  /** Mark ids this vendor can print. Empty for unbranded suppliers. */
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
   * badge as well, because a row can be a real company with illustrative
   * lead times, which is precisely what several of these rows are.
   */
  provenance: Provenance;
  /** One line of context where a row would otherwise be misread. */
  note?: string;
}

// ---------------------------------------------------------------
// Branded collateral and merchandise
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
    label: "Soft goods",
    cssVar: "var(--fam-youth-group)",
    note: "Soft branded goods, the top of the leave-behind stack. Highest unit cost, longest lead time, and the thing a household keeps.",
  },
  collectible: {
    glyph: "◈",
    label: "Collectible",
    cssVar: "var(--fam-corporate)",
    note: "Magnets, pins, keyrings. Works on the name it carries rather than on the object.",
  },
  apparel: {
    glyph: "◎",
    label: "Apparel",
    cssVar: "var(--lane-electrical)",
    note: "Crew shirts and caps. Sized, so the reorder never matches the first order.",
  },
  novelty: {
    glyph: "◆",
    label: "Novelty",
    cssVar: "var(--fam-self-serve)",
    note: "Filter reminders, fridge magnets, tape measures. Cheap per unit and the volume driver on the van.",
  },
  print: {
    glyph: "▤",
    label: "Print",
    cssVar: "var(--neutral)",
    note: "Door hangers, coupon cards and invoice leave-behinds. Not sold, given, and still bought with real money.",
  },
  "food-novelty": {
    glyph: "◔",
    label: "Food novelty",
    cssVar: "var(--lane-partner-employer)",
    note: "Branded water and confectionery for community days. Dated stock, which makes weeks of cover the figure that matters.",
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
 * A collateral line, stored as the four things that are counted and
 * nothing that can be worked out from them.
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
  /** null where the line carries no outside mark at all. */
  licenceId: string | null;
  /** Who makes it. */
  partnerId: string;
  /** Trading period this row is counted against. */
  periodId: string;
  /** Units received into stock in the period. */
  unitsIn: number;
  /** Units sold or given out in the period. */
  unitsOut: number;
  /** Units on hand at the end of the period. */
  unitsOnHand: number;
  /** Landed cost per unit, in cents. Freight and duty included. */
  unitCostCents: number;
  /** What a household pays, or the value given away, in cents. */
  unitRetailCents: number;
  /** Weeks in the trading period, so weeks of cover has a denominator. */
  weeksInPeriod: number;
  provenance: Provenance;
}

export interface PromoPeriod {
  id: string;
  label: string;
  /** ISO. Printed on the vendor report, because a report without a period is a rumour. */
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
    note: "Renews only if both sides sign again. Nothing happens without a conversation.",
  },
  none: {
    glyph: "▪",
    label: "Ends",
    cssVar: "var(--neutral)",
    note: "Runs to the end date and stops. A new agreement is a new negotiation.",
  },
};

/**
 * An agreement with a vendor, an agency or a mark owner.
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
  /** Mark ids the agreement covers. Empty for a pure supply deal. */
  licenceIds: string[];
  startsOn: string;
  endsOn: string;
  /**
   * The minimum payable to the mark owner whatever sells, in cents. Zero
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
 * somebody outside the division is relying on. Received is stock on a
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
 * Whole dollars above a hundred, because a marketing budget read to the
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
