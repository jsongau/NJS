import type {
  BudgetLine,
  Contract,
  Invoice,
  PurchaseOrder,
} from "@/domain/licensing";
import type { Provenance } from "@/domain/types";
import type { StatusToken } from "@/domain/vocabulary";

/**
 * THE MONEY: budgets, purchase orders, invoices and the terms they were
 * all agreed under.
 *
 * The posting this file answers puts three nouns in one sentence:
 * "Manage budgets, purchase orders, and invoices to ensure cost control
 * and compliance with contract terms." They are four different objects
 * with four different failure modes, and a screen that flattens them into
 * one table of transactions cannot answer any of the four questions a
 * manager actually asks.
 *
 *   A BUDGET fails by being exceeded quietly, because the exceeding is
 *   spread across committed money nobody has been invoiced for yet.
 *   A PURCHASE ORDER fails by sitting in draft while everyone believes it
 *   was sent.
 *   AN INVOICE fails by ageing past its terms while nobody owns it.
 *   A CONTRACT fails by renewing itself on a date nobody diarised.
 *
 * So the four are separate types, and `selectors/spend.ts` derives every
 * figure that connects them. Nothing in this file stores a total.
 *
 * ── EVERY FIGURE HERE IS ILLUSTRATIVE ─────────────────────────────
 * Neither Round1 nor Nature's Mark publishes a
 * promotional budget, a unit cost, a royalty rate or a payment term.
 * Every number below is invented for this prototype and badged as such on
 * screen. The model is the claim; the numbers are furniture.
 *
 * ── ONE ROW NEEDS SAYING OUT LOUD ─────────────────────────────────
 * The Nature's Mark contract row is titled as a DRAFT and is not
 * executed, and the two purchase orders against it sit in draft state,
 * which commits nothing. That is deliberate and it matches the register:
 * `/partners` shows that relationship as in talks. There is no agreement
 * between Round1 and Nature's Mark, and none between Round1 and any
 * licensor Nature's Mark names. Anything else on this screen would be
 * a claim about two real companies.
 *
 * ── AND A FOURTH COHORT, ADDED FOR THE BUYING HALF OF THE JOB ─────
 * A budget, an order header and an invoice header answer the finance
 * question and none of the buying one. The posting also says "Evaluate
 * product quality, pricing, and supplier reliability before purchase" and
 * "Negotiate costs, terms, and delivery schedules with vendors and
 * licensors", and neither sentence can be answered by a dollar total.
 *
 * So `ORDER_CONTROL` sits below, one row per goods order, carrying the
 * three things a buyer compares and nothing that can be worked out from
 * them: what the order said, what the goods receipt said, what the
 * invoice charged. `/spend` derives the stage, the variances, the term
 * checks and the reliability rates from those rows at render. Not one
 * stage, variance or rate is stored, for the reason the rest of this
 * application repeats: a stored derived figure is a figure that was true
 * once, and the first edit that misses it starts a quiet lie.
 *
 * ── WHAT IS NOT INVENTED IN THAT COHORT ───────────────────────────
 * Nature's Mark publishes nine licence names and nothing else. It
 * publishes NO factory location, NO country of manufacture, NO minimum
 * order quantity, NO lead time, NO unit cost and NO payment terms. None
 * of those is invented here and none is inferred. Where a promised date
 * appears on an order below it is a date this prototype seeded, and the
 * lead time the screen prints beside it is derived from that seeded date
 * and badged `modeled`, with the page saying in words that no supplier
 * here publishes a lead time.
 *
 * Two orders below carry a licensed property, and both of them FAIL the
 * two licence checks on purpose. The supplier on each is not registered
 * to carry that property, and the only licence schedule on the register
 * is the Nature's Mark draft, which is not executed. Seeding a passing
 * licensed order would have required inventing an executed agreement
 * with a real licensor, which is the one thing this file will not do.
 */

/** Every ageing figure on /spend is measured from this date. */
export const SPEND_AS_OF = "2026-08-13";

/** The budget year these lines belong to, printed on the page. */
export const SPEND_PERIOD = {
  id: "promo-2026",
  label: "2026 promotional programme",
  startsOn: "2026-01-01",
  endsOn: "2026-12-31",
};

export const BUDGET_LINES: BudgetLine[] = [
  {
    id: "bl-plush",
    label: "Licensed plush and collectibles",
    category: "Merchandise",
    periodId: SPEND_PERIOD.id,
    budgetCents: 11_000_000,
    provenance: "illustrative",
  },
  {
    id: "bl-novelty",
    label: "Prize wall novelty and confectionery",
    category: "Merchandise",
    periodId: SPEND_PERIOD.id,
    budgetCents: 1_800_000,
    provenance: "illustrative",
  },
  {
    id: "bl-apparel",
    label: "Apparel and uniform",
    category: "Merchandise",
    periodId: SPEND_PERIOD.id,
    budgetCents: 1_400_000,
    provenance: "illustrative",
  },
  {
    id: "bl-print",
    label: "Print, vouchers and table media",
    category: "Marketing",
    periodId: SPEND_PERIOD.id,
    budgetCents: 360_000,
    provenance: "illustrative",
  },
  {
    id: "bl-signage",
    label: "Signage and installation",
    category: "Marketing",
    periodId: SPEND_PERIOD.id,
    budgetCents: 900_000,
    provenance: "illustrative",
  },
  {
    id: "bl-freight",
    label: "Freight, duty and storage",
    category: "Supply chain",
    periodId: SPEND_PERIOD.id,
    budgetCents: 1_600_000,
    provenance: "illustrative",
  },
  {
    id: "bl-royalty",
    label: "Royalties and minimum guarantees",
    category: "Licensing",
    periodId: SPEND_PERIOD.id,
    budgetCents: 3_200_000,
    provenance: "illustrative",
  },
  {
    id: "bl-catering",
    label: "Event catering, brought in",
    category: "Operations",
    periodId: SPEND_PERIOD.id,
    budgetCents: 750_000,
    provenance: "illustrative",
  },
];

export const BUDGET_LINE_BY_ID: Record<string, BudgetLine> = Object.fromEntries(
  BUDGET_LINES.map((b) => [b.id, b]),
);

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "po-101",
    reference: "PO-2026-101",
    partnerId: "natures-mark",
    budgetLineId: "bl-plush",
    description: "Licensed plush, four properties, opening assortment",
    raisedOn: "2026-08-05",
    expectedOn: "2026-12-14",
    state: "draft",
    amountCents: 4_620_000,
    provenance: "illustrative",
  },
  {
    id: "po-102",
    reference: "PO-2026-102",
    partnerId: "natures-mark",
    budgetLineId: "bl-royalty",
    description: "Minimum guarantee, first year schedule",
    raisedOn: "2026-08-05",
    expectedOn: "2027-01-15",
    state: "draft",
    amountCents: 2_500_000,
    provenance: "illustrative",
  },
  {
    id: "po-103",
    reference: "PO-2026-103",
    partnerId: "novelty-case-direct",
    budgetLineId: "bl-novelty",
    description: "Light-up bouncing ball, thirty six cases",
    raisedOn: "2026-07-02",
    expectedOn: "2026-07-24",
    state: "received",
    /* Thirty six cases at $110.00, which is the order line in
       ORDER_CONTROL below multiplied out. The header and the line agree
       to the cent on every goods order in this file, because a three-way
       match that starts from a header nobody can reconcile to a quantity
       is a match a supplier wins every argument against. */
    amountCents: 396_000,
    provenance: "illustrative",
  },
  {
    id: "po-104",
    reference: "PO-2026-104",
    partnerId: "pacific-rim-plush",
    budgetLineId: "bl-plush",
    description: "Unlicensed plush pilot, two styles",
    raisedOn: "2026-07-14",
    expectedOn: "2026-10-20",
    state: "issued",
    amountCents: 1_840_000,
    provenance: "illustrative",
  },
  {
    id: "po-105",
    reference: "PO-2026-105",
    partnerId: "lane-six-apparel",
    budgetLineId: "bl-apparel",
    description: "Sanrio youth tee, spring run",
    raisedOn: "2026-04-22",
    expectedOn: "2026-05-12",
    state: "received",
    amountCents: 768_000,
    provenance: "illustrative",
  },
  {
    id: "po-106",
    reference: "PO-2026-106",
    partnerId: "county-line-litho",
    budgetLineId: "bl-print",
    description: "Redemption voucher books, spring run",
    raisedOn: "2026-04-10",
    expectedOn: "2026-04-18",
    state: "received",
    amountCents: 165_000,
    provenance: "illustrative",
  },
  {
    id: "po-107",
    reference: "PO-2026-107",
    partnerId: "ticket-wall-supply",
    budgetLineId: "bl-plush",
    description: "Mid-tier plush restock, prize wall",
    raisedOn: "2026-04-08",
    expectedOn: "2026-04-28",
    state: "received",
    amountCents: 2_460_000,
    provenance: "illustrative",
  },
  {
    id: "po-108",
    reference: "PO-2026-108",
    partnerId: "ticket-wall-supply",
    budgetLineId: "bl-novelty",
    description: "Glow bracelet, fifteen hundred packs",
    raisedOn: "2026-04-15",
    expectedOn: "2026-05-06",
    state: "received",
    amountCents: 315_000,
    provenance: "illustrative",
  },
  {
    id: "po-109",
    reference: "PO-2026-109",
    partnerId: "freeway-sign",
    budgetLineId: "bl-signage",
    description: "Prize wall tier signage and lane cards",
    raisedOn: "2026-07-20",
    /* Past its date and still open, which is what the late counter on
       /spend is for. Its invoice landed on 1 August for goods that have
       not arrived, so this one row exercises both controls at once. */
    expectedOn: "2026-08-06",
    state: "issued",
    amountCents: 412_000,
    provenance: "illustrative",
  },
  {
    id: "po-110",
    reference: "PO-2026-110",
    partnerId: "crew-uniform-supply",
    budgetLineId: "bl-apparel",
    description: "Uniform replenishment, summer sizes",
    raisedOn: "2026-06-05",
    expectedOn: "2026-06-27",
    state: "received",
    amountCents: 218_000,
    provenance: "illustrative",
  },
  {
    id: "po-111",
    reference: "PO-2026-111",
    partnerId: "long-beach-import",
    budgetLineId: "bl-freight",
    description: "Freight and customs entry, autumn container",
    raisedOn: "2026-07-16",
    expectedOn: "2026-09-22",
    state: "issued",
    amountCents: 685_000,
    provenance: "illustrative",
  },
  {
    id: "po-112",
    reference: "PO-2026-112",
    partnerId: "ticket-wall-supply",
    budgetLineId: "bl-plush",
    description: "Mid-tier plush restock, summer",
    raisedOn: "2026-06-02",
    expectedOn: "2026-06-24",
    state: "received",
    amountCents: 1_980_000,
    provenance: "illustrative",
  },
  {
    id: "po-113",
    reference: "PO-2026-113",
    partnerId: "ticket-wall-supply",
    budgetLineId: "bl-novelty",
    description: "Sticker sheet assortment, thirteen thousand five hundred",
    raisedOn: "2026-05-20",
    expectedOn: "2026-06-10",
    state: "received",
    amountCents: 121_500,
    provenance: "illustrative",
  },
  {
    id: "po-114",
    reference: "PO-2026-114",
    partnerId: "county-line-litho",
    budgetLineId: "bl-print",
    description: "Birthday table tents, summer artwork",
    raisedOn: "2026-07-08",
    expectedOn: "2026-07-16",
    state: "received",
    amountCents: 93_000,
    provenance: "illustrative",
  },
  {
    id: "po-115",
    reference: "PO-2026-115",
    partnerId: "novelty-case-direct",
    budgetLineId: "bl-novelty",
    description: "Sound-effect mini megaphone, thirty cases",
    raisedOn: "2026-08-06",
    expectedOn: "2026-08-28",
    state: "issued",
    amountCents: 280_800,
    provenance: "illustrative",
  },
  {
    id: "po-116",
    reference: "PO-2026-116",
    partnerId: "lane-six-apparel",
    budgetLineId: "bl-apparel",
    description: "House crew tee, opening run",
    raisedOn: "2026-08-03",
    expectedOn: "2026-08-25",
    state: "issued",
    amountCents: 424_800,
    provenance: "illustrative",
  },
  {
    id: "po-117",
    reference: "PO-2026-117",
    partnerId: "long-beach-import",
    budgetLineId: "bl-freight",
    description: "Freight and customs entry, spring container",
    raisedOn: "2026-05-04",
    expectedOn: "2026-05-30",
    state: "received",
    amountCents: 524_000,
    provenance: "illustrative",
  },
  {
    id: "po-118",
    reference: "PO-2026-118",
    partnerId: "pacific-rim-plush",
    budgetLineId: "bl-plush",
    description: "Second sample run and first production tranche",
    raisedOn: "2026-08-01",
    expectedOn: "2026-09-30",
    state: "part-received",
    amountCents: 1_230_000,
    provenance: "illustrative",
  },
  {
    id: "po-119",
    reference: "PO-2026-119",
    partnerId: "ticket-wall-supply",
    budgetLineId: "bl-novelty",
    description: "Branded confectionery tin, autumn",
    raisedOn: "2026-08-11",
    expectedOn: "2026-09-04",
    state: "approved",
    amountCents: 367_500,
    provenance: "illustrative",
  },
  {
    id: "po-120",
    reference: "PO-2026-120",
    partnerId: "freeway-sign",
    budgetLineId: "bl-signage",
    description: "Window graphics, opening announcement",
    raisedOn: "2026-08-12",
    expectedOn: "2026-09-10",
    state: "draft",
    amountCents: 264_000,
    provenance: "illustrative",
  },
  {
    id: "po-121",
    reference: "PO-2026-121",
    partnerId: "long-beach-import",
    budgetLineId: "bl-freight",
    description: "Consolidation booking, cancelled sailing",
    raisedOn: "2026-06-18",
    expectedOn: "2026-07-30",
    state: "cancelled",
    amountCents: 390_000,
    provenance: "illustrative",
  },
];

export const PO_BY_ID: Record<string, PurchaseOrder> = Object.fromEntries(
  PURCHASE_ORDERS.map((p) => [p.id, p]),
);

export const INVOICES: Invoice[] = [
  {
    id: "inv-3222",
    reference: "INV-2026-3222",
    poId: null,
    budgetLineId: "bl-print",
    partnerId: "grad-night-print",
    issuedOn: "2026-03-30",
    dueOn: "2026-04-29",
    amountCents: 141_000,
    state: "paid",
    paidOn: "2026-04-27",
    provenance: "illustrative",
    note: "The last invoice from a supplier that has since gone quiet. Coded to print with no purchase order behind it.",
  },
  {
    id: "inv-3244",
    reference: "INV-2026-3244",
    poId: null,
    budgetLineId: "bl-catering",
    partnerId: "valley-catering",
    issuedOn: "2026-05-19",
    dueOn: "2026-06-03",
    amountCents: 124_000,
    state: "paid",
    paidOn: "2026-06-02",
    provenance: "illustrative",
  },
  {
    id: "inv-3252",
    reference: "INV-2026-3252",
    poId: null,
    budgetLineId: "bl-signage",
    partnerId: "freeway-sign",
    issuedOn: "2026-04-28",
    dueOn: "2026-05-28",
    amountCents: 148_000,
    state: "paid",
    paidOn: "2026-05-27",
    provenance: "illustrative",
  },
  {
    id: "inv-3268",
    reference: "INV-2026-3268",
    poId: "po-106",
    budgetLineId: "bl-print",
    partnerId: "county-line-litho",
    issuedOn: "2026-04-20",
    dueOn: "2026-05-11",
    amountCents: 165_000,
    state: "paid",
    paidOn: "2026-05-06",
    provenance: "illustrative",
  },
  {
    id: "inv-3277",
    reference: "INV-2026-3277",
    poId: "po-105",
    budgetLineId: "bl-apparel",
    partnerId: "lane-six-apparel",
    issuedOn: "2026-05-14",
    dueOn: "2026-06-13",
    amountCents: 768_000,
    state: "paid",
    paidOn: "2026-06-11",
    provenance: "illustrative",
  },
  {
    id: "inv-3286",
    reference: "INV-2026-3286",
    poId: "po-108",
    budgetLineId: "bl-novelty",
    partnerId: "ticket-wall-supply",
    issuedOn: "2026-05-08",
    dueOn: "2026-06-07",
    amountCents: 315_000,
    state: "paid",
    paidOn: "2026-06-03",
    provenance: "illustrative",
  },
  {
    id: "inv-3290",
    reference: "INV-2026-3290",
    poId: "po-117",
    budgetLineId: "bl-freight",
    partnerId: "long-beach-import",
    issuedOn: "2026-06-01",
    dueOn: "2026-06-15",
    amountCents: 524_000,
    state: "paid",
    paidOn: "2026-06-14",
    provenance: "illustrative",
  },
  {
    id: "inv-3295",
    reference: "INV-2026-3295",
    poId: "po-113",
    budgetLineId: "bl-novelty",
    partnerId: "ticket-wall-supply",
    issuedOn: "2026-06-12",
    dueOn: "2026-07-12",
    amountCents: 121_500,
    state: "paid",
    paidOn: "2026-07-09",
    provenance: "illustrative",
  },
  {
    id: "inv-3301",
    reference: "INV-2026-3301",
    poId: "po-107",
    budgetLineId: "bl-plush",
    partnerId: "ticket-wall-supply",
    issuedOn: "2026-05-02",
    dueOn: "2026-06-01",
    amountCents: 2_460_000,
    state: "paid",
    paidOn: "2026-05-28",
    provenance: "illustrative",
  },
  {
    id: "inv-3305",
    reference: "INV-2026-3305",
    poId: "po-110",
    budgetLineId: "bl-apparel",
    partnerId: "crew-uniform-supply",
    issuedOn: "2026-06-30",
    dueOn: "2026-07-30",
    amountCents: 218_000,
    state: "disputed",
    provenance: "illustrative",
    note: "Held against a colourfastness claim on the June delivery. Ageing runs whether or not the argument is settled.",
  },
  {
    id: "inv-3308",
    reference: "INV-2026-3308",
    poId: "po-104",
    budgetLineId: "bl-plush",
    partnerId: "pacific-rim-plush",
    issuedOn: "2026-06-20",
    dueOn: "2026-08-19",
    amountCents: 920_000,
    state: "approved",
    provenance: "illustrative",
    note: "Half the pilot order billed on sixty day terms. The remainder of the purchase order is still uninvoiced and still committed.",
  },
  {
    id: "inv-3312",
    reference: "INV-2026-3312",
    poId: "po-103",
    budgetLineId: "bl-novelty",
    partnerId: "novelty-case-direct",
    issuedOn: "2026-07-25",
    dueOn: "2026-08-24",
    amountCents: 396_000,
    state: "paid",
    paidOn: "2026-08-07",
    provenance: "illustrative",
  },
  {
    id: "inv-3318",
    reference: "INV-2026-3318",
    poId: "po-112",
    budgetLineId: "bl-plush",
    partnerId: "ticket-wall-supply",
    issuedOn: "2026-06-26",
    dueOn: "2026-07-26",
    /* Three thousand three hundred units at 20 cents a unit above the
       order, which is $660 nobody agreed to. The quantity is right, the
       supplier is right and the total looks like every other plush
       invoice, which is exactly why a price check has to be arithmetic
       rather than a person recognising a wrong-looking number. */
    amountCents: 2_046_000,
    state: "approved",
    provenance: "illustrative",
    note: "Approved for payment at a unit price above the order. Catching this before the payment run is the whole job of the match desk.",
  },
  {
    id: "inv-3321",
    reference: "INV-2026-3321",
    poId: "po-114",
    budgetLineId: "bl-print",
    partnerId: "county-line-litho",
    issuedOn: "2026-07-18",
    dueOn: "2026-08-08",
    amountCents: 93_000,
    state: "approved",
    provenance: "illustrative",
  },
  {
    id: "inv-3330",
    reference: "INV-2026-3330",
    poId: null,
    budgetLineId: "bl-catering",
    partnerId: "valley-catering",
    issuedOn: "2026-07-04",
    dueOn: "2026-07-19",
    amountCents: 86_000,
    state: "approved",
    provenance: "illustrative",
    note: "Arrived with no purchase order behind it. Coded on the invoice, which is the only reason it is visible to the budget at all.",
  },
  {
    id: "inv-3336",
    reference: "INV-2026-3336",
    poId: "po-109",
    budgetLineId: "bl-signage",
    partnerId: "freeway-sign",
    issuedOn: "2026-08-01",
    dueOn: "2026-08-31",
    amountCents: 412_000,
    state: "received",
    provenance: "illustrative",
    note: "Invoiced on 1 August against an order whose goods were expected on 6 August and have not landed. Not approved for payment until they do.",
  },
  {
    id: "inv-3339",
    reference: "INV-2026-3339",
    poId: "po-111",
    budgetLineId: "bl-freight",
    partnerId: "long-beach-import",
    issuedOn: "2026-08-08",
    /* Seven days from issue, against the fourteen the freight terms
       carry. Seeded out of terms on purpose, because a payment terms
       check with nothing to catch proves only that the check compiles.
       A supplier who shortens their own terms on the invoice is paid
       early by any accounts payable process that reads the invoice
       instead of the agreement. */
    dueOn: "2026-08-15",
    amountCents: 685_000,
    state: "received",
    provenance: "illustrative",
    note: "Billed on seven days against the fourteen agreed on the freight terms. The invoice says one thing and the agreement says another, and the agreement wins.",
  },
  {
    id: "inv-3341",
    reference: "INV-2026-3341",
    poId: "po-116",
    budgetLineId: "bl-apparel",
    partnerId: "lane-six-apparel",
    issuedOn: "2026-08-10",
    dueOn: "2026-09-09",
    amountCents: 424_800,
    state: "received",
    provenance: "illustrative",
  },
  {
    id: "inv-3344",
    reference: "INV-2026-3344",
    poId: "po-118",
    budgetLineId: "bl-plush",
    partnerId: "pacific-rim-plush",
    issuedOn: "2026-08-12",
    dueOn: "2026-10-11",
    amountCents: 615_000,
    state: "received",
    provenance: "illustrative",
  },
  {
    id: "inv-3346",
    reference: "INV-2026-3346",
    poId: "po-115",
    budgetLineId: "bl-novelty",
    partnerId: "novelty-case-direct",
    issuedOn: "2026-08-12",
    dueOn: "2026-09-11",
    amountCents: 280_800,
    state: "received",
    provenance: "illustrative",
  },
];

export const CONTRACTS: Contract[] = [
  {
    id: "c-ticket-wall",
    title: "Ticket Wall Supply master terms",
    partnerId: "ticket-wall-supply",
    licenceIds: [],
    startsOn: "2025-10-01",
    endsOn: "2026-09-30",
    minimumGuaranteeCents: 0,
    royaltyRatePct: 0,
    paymentTermsDays: 30,
    noticePeriodDays: 30,
    renewal: "auto",
    provenance: "illustrative",
    note: "The nearest renewal on the register. It auto-renews on thirty days' notice, so the decision is due a month before the end date rather than on it.",
  },
  {
    id: "c-lane-six",
    title: "Lane Six Apparel supply agreement",
    partnerId: "lane-six-apparel",
    licenceIds: [],
    startsOn: "2026-01-15",
    endsOn: "2026-12-31",
    minimumGuaranteeCents: 0,
    royaltyRatePct: 0,
    paymentTermsDays: 30,
    noticePeriodDays: 45,
    renewal: "mutual",
    provenance: "illustrative",
  },
  {
    id: "c-novelty-case",
    title: "Novelty Case Direct supply agreement",
    partnerId: "novelty-case-direct",
    licenceIds: [],
    startsOn: "2026-07-01",
    endsOn: "2027-06-30",
    minimumGuaranteeCents: 0,
    royaltyRatePct: 0,
    paymentTermsDays: 30,
    noticePeriodDays: 60,
    renewal: "mutual",
    provenance: "illustrative",
  },
  {
    id: "c-county-line",
    title: "County Line Litho rate card",
    partnerId: "county-line-litho",
    licenceIds: [],
    startsOn: "2026-04-01",
    endsOn: "2027-03-31",
    minimumGuaranteeCents: 0,
    royaltyRatePct: 0,
    paymentTermsDays: 21,
    noticePeriodDays: 30,
    renewal: "none",
    provenance: "illustrative",
  },
  {
    id: "c-long-beach",
    title: "Long Beach Import Desk freight terms",
    partnerId: "long-beach-import",
    licenceIds: [],
    startsOn: "2026-02-01",
    endsOn: "2027-01-31",
    minimumGuaranteeCents: 0,
    royaltyRatePct: 0,
    paymentTermsDays: 14,
    noticePeriodDays: 60,
    renewal: "auto",
    provenance: "illustrative",
  },
  {
    id: "c-valley-catering",
    title: "Valley Catering Group event terms",
    partnerId: "valley-catering",
    licenceIds: [],
    startsOn: "2026-05-01",
    endsOn: "2027-04-30",
    minimumGuaranteeCents: 0,
    royaltyRatePct: 0,
    paymentTermsDays: 15,
    noticePeriodDays: 30,
    renewal: "auto",
    provenance: "illustrative",
  },
  {
    id: "c-pacific-rim",
    title: "Pacific Rim Plush Works pilot supply",
    partnerId: "pacific-rim-plush",
    licenceIds: [],
    startsOn: "2026-08-01",
    endsOn: "2026-11-30",
    minimumGuaranteeCents: 0,
    royaltyRatePct: 0,
    paymentTermsDays: 60,
    noticePeriodDays: 0,
    renewal: "none",
    provenance: "illustrative",
    note: "A pilot with no notice period at all, which is the point of a pilot. It ends and then it is renegotiated or it is not.",
  },
  {
    id: "c-natures-mark",
    title: "Nature's Mark licence schedule, DRAFT, not executed",
    partnerId: "natures-mark",
    licenceIds: [
      "disney",
      "sanrio",
      "sesame-street",
      "peanuts",
      "rudolph",
      "coca-cola",
    ],
    startsOn: "2027-01-01",
    endsOn: "2027-12-31",
    minimumGuaranteeCents: 2_500_000,
    royaltyRatePct: 12,
    paymentTermsDays: 45,
    noticePeriodDays: 90,
    renewal: "auto",
    provenance: "illustrative",
    note: "Nothing is signed. This is the shape a licence schedule takes, seeded so the terms panel holds a licensed agreement. There is no agreement between Round1 and Nature's Mark, and none between Round1 and any licensor Nature's Mark names.",
  },
];

export const CONTRACT_BY_ID: Record<string, Contract> = Object.fromEntries(
  CONTRACTS.map((c) => [c.id, c]),
);

// ---------------------------------------------------------------
// The order control desk: stage, three-way match, licensed property
// ---------------------------------------------------------------

/**
 * WHERE THE GOODS ARE, WHICH IS NOT WHERE THE MONEY IS.
 *
 * `PoState` in `domain/licensing.ts` is the ACCOUNTING state: draft,
 * approved, issued, part received, received, cancelled. It answers one
 * question, and it is the right question for a budget: how much of this
 * money can still be pulled back.
 *
 * It answers none of the buyer's questions. A purchase order sitting in
 * "issued" for eleven weeks may be acknowledged and in production and on
 * a boat, or it may be a fax nobody at the other end ever read, and those
 * two are the same row on a budget screen. So the stages below run beside
 * the accounting state rather than replacing it, and `/spend` prints both
 * on the same row and never merges them.
 *
 * ── THE STAGES ARE DERIVED, NOT STORED ────────────────────────────
 * There is no `stage` field on `OrderControl`. There are MILESTONE DATES,
 * and the stage is the furthest milestone reached, worked out at render.
 * A stored stage plus stored milestone dates is two facts that can
 * disagree, and the first time somebody sets a shipped date without
 * touching the stage, the rail says "acknowledged" about a container
 * already at anchor.
 *
 * ── THE LAST TWO MARKS LEAVE THE FILLING CIRCLE ON PURPOSE ────────
 * The house vocabulary draws progress as a circle filling up. Five goods
 * milestones fit that family exactly. Invoiced and paid are money
 * milestones rather than goods milestones, so they break the family
 * deliberately: a reader glancing at the rail can see the point where the
 * order stops being about a pallet and starts being about a payment run.
 */
export type OrderStage =
  | "raised"
  | "acknowledged"
  | "in-production"
  | "shipped"
  | "received"
  | "invoiced"
  | "paid";

export const ORDER_STAGE: Record<OrderStage, StatusToken> = {
  raised: {
    glyph: "○",
    label: "Raised",
    cssVar: "var(--neutral)",
    note: "Written and costed. The supplier has either not seen it yet or has not come back on it, so there is no promise to hold them to.",
  },
  acknowledged: {
    glyph: "◔",
    label: "Acknowledged",
    cssVar: "var(--info)",
    note: "The supplier has confirmed it and named a date. That date, not the date the order asked for, is what on-time is measured against.",
  },
  "in-production": {
    glyph: "◑",
    label: "In production",
    cssVar: "var(--info)",
    note: "Being made. The last stage where a specification change costs a phone call rather than a credit note.",
  },
  shipped: {
    glyph: "◕",
    label: "Shipped",
    cssVar: "var(--warn)",
    note: "Left the supplier and not yet booked in here. Many suppliers invoice at this point, which is why an invoice can arrive before the goods do.",
  },
  received: {
    glyph: "●",
    label: "Received",
    cssVar: "var(--ok)",
    note: "Booked in against a goods receipt. Only a receipt for the full quantity reaches this mark; a part delivery stops short of it.",
  },
  invoiced: {
    glyph: "◉",
    label: "Invoiced",
    cssVar: "var(--warn)",
    note: "An invoice is on the ledger against this order. Reaching this mark says nothing about whether it should be paid.",
  },
  paid: {
    glyph: "✓",
    label: "Paid",
    cssVar: "var(--ok)",
    note: "Settled in full. Past this point a variance is recovered with a credit note or it is not recovered at all.",
  },
};

export const ORDER_STAGE_ORDER: OrderStage[] = [
  "raised",
  "acknowledged",
  "in-production",
  "shipped",
  "received",
  "invoiced",
  "paid",
];

/**
 * How a three-way match came out.
 *
 * FOUR GRADES RATHER THAN PASS AND FAIL, because a desk that paints
 * every unmatched order red teaches its reader to ignore red. An order
 * billed on shipment cannot be matched yet and is not a fault. An
 * over-run on a print job is a query for a person. A short delivery
 * billed in full and already paid is money gone. Those are three
 * different mornings and they get three different words.
 *
 * These tokens live beside the rows they grade rather than in
 * `domain/vocabulary.ts`, because nothing outside this desk grades a
 * match. The moment a second surface does, they move.
 */
export type MatchGrade = "matched" | "open" | "query" | "fail";

export const MATCH_GRADE: Record<MatchGrade, StatusToken> = {
  matched: {
    glyph: "●",
    label: "Matched",
    cssVar: "var(--ok)",
    note: "Order, goods receipt and invoice agree on quantity and on unit price. Nothing to do.",
  },
  open: {
    glyph: "○",
    label: "Not yet matchable",
    cssVar: "var(--neutral)",
    note: "One of the three documents does not exist yet. Not a fault, and not evidence that anything is right either.",
  },
  query: {
    glyph: "◑",
    label: "Query",
    cssVar: "var(--warn)",
    note: "The three documents disagree in a way that costs nothing yet. A person decides before it becomes a payment.",
  },
  fail: {
    glyph: "✕",
    label: "Fails the match",
    cssVar: "var(--risk)",
    note: "The invoice charges for goods or at a price the order and the receipt do not support, and it is approved or already paid.",
  },
};

export const MATCH_GRADE_ORDER: MatchGrade[] = [
  "fail",
  "query",
  "open",
  "matched",
];

/**
 * One goods order, in the three columns a buyer actually compares.
 *
 * ── WHY THE INVOICE SIDE IS REPEATED HERE ─────────────────────────
 * `Invoice` already carries a total. It does not carry a quantity or a
 * unit price, because an invoice header cannot: an invoice for $2,046,000
 * is indistinguishable from the correct one until somebody divides it by
 * the quantity. The billed quantity and billed unit price below are the
 * invoice LINE, and the screen checks that they multiply back to the
 * invoice header. An invoice whose lines do not add up to its own total
 * is the oldest trick in accounts payable and it takes one multiplication
 * to catch.
 *
 * ── NULL MEANS THE DOCUMENT DOES NOT EXIST ────────────────────────
 * Not zero. A goods receipt for zero units and no goods receipt at all
 * are different facts, and only one of them is a short delivery. Zero
 * would have made every unshipped order look like a supplier who sent an
 * empty pallet, and the short shipment rate, which is the number a buyer
 * takes into a negotiation, would have been nonsense.
 */
export interface OrderControl {
  poId: string;
  /**
   * The licensed property the order carries, or null for unlicensed
   * goods. Only the nine names Nature's Mark publishes may appear, and
   * the NAME is the only public thing about the row. The order, the
   * supplier, the quantity, the price and the dates around it are not.
   */
  licenceId: string | null;
  /** What is being counted: cases, pieces, units, packs, books, sheets. */
  unit: string;
  /** WHAT THE ORDER SAID. Multiplies out to the order header, to the cent. */
  orderedQty: number;
  orderedUnitCents: number;
  /**
   * The date the supplier came back with, which is null until they come
   * back. An order with no acknowledgement cannot be late, because
   * nobody has promised anything. Defaulting this to the date the order
   * asked for would have manufactured a promise the supplier never made
   * and then scored them against it.
   */
  promisedOn: string | null;
  acknowledgedOn: string | null;
  productionFromOn: string | null;
  shippedOn: string | null;
  /** WHAT ARRIVED. Both null until a goods receipt exists. */
  receivedOn: string | null;
  receivedQty: number | null;
  /** WHAT THE INVOICE CHARGED. Both null until an invoice exists. */
  billedQty: number | null;
  billedUnitCents: number | null;
  /**
   * Every quantity, price and date on this row is modeled: worked out
   * from the order header this prototype already carried, so that the
   * three columns reconcile. None of it is published by anybody.
   */
  provenance: Provenance;
  note?: string;
}

/**
 * Fifteen goods orders. Three of the twenty one purchase orders are
 * freight and customs entries and two are drafts, and neither belongs on
 * a match desk:
 *
 *   A FREIGHT INVOICE HAS NO GOODS RECEIPT. Nobody books in a customs
 *   entry. It matches on two documents, the order and the invoice, and
 *   the third leg is a person confirming the service happened. Putting it
 *   on this table would have shown three services permanently failing a
 *   test they can never pass.
 *
 *   A DRAFT HAS NOT BEEN RAISED. The two Nature's Mark orders are drafts
 *   against a licence schedule that is not executed. They commit nothing,
 *   they have been sent to nobody, and there is nothing to match.
 */
export const ORDER_CONTROL: OrderControl[] = [
  {
    poId: "po-103",
    licenceId: null,
    unit: "cases",
    orderedQty: 36,
    orderedUnitCents: 11_000,
    acknowledgedOn: "2026-07-03",
    promisedOn: "2026-07-24",
    productionFromOn: "2026-07-06",
    shippedOn: "2026-07-18",
    receivedOn: "2026-07-22",
    receivedQty: 36,
    billedQty: 36,
    billedUnitCents: 11_000,
    provenance: "modeled",
  },
  {
    poId: "po-104",
    licenceId: null,
    unit: "units",
    orderedQty: 3_200,
    orderedUnitCents: 575,
    acknowledgedOn: "2026-07-17",
    /* Fifteen days later than the order asked for, agreed at
       acknowledgement. The slip is invisible on the order header, which
       still carries the date somebody typed in July. */
    promisedOn: "2026-11-04",
    productionFromOn: "2026-08-03",
    shippedOn: null,
    receivedOn: null,
    receivedQty: null,
    billedQty: 1_600,
    billedUnitCents: 575,
    provenance: "modeled",
    note: "Half the pilot billed before anything shipped, described by the supplier as a deposit. No agreement on this register carries a deposit term, so nothing can check whether half is the agreed share. A person decides, and that is the honest answer rather than a green tick.",
  },
  {
    poId: "po-105",
    licenceId: "sanrio",
    unit: "pieces",
    orderedQty: 960,
    orderedUnitCents: 800,
    acknowledgedOn: "2026-04-23",
    promisedOn: "2026-05-12",
    productionFromOn: "2026-04-27",
    shippedOn: "2026-05-08",
    receivedOn: "2026-05-11",
    /* One carton of forty eight short, booked in as a full receipt and
       billed in full. The order closed, the invoice matched the ORDER
       and nobody compared it to the RECEIPT, which is the entire reason
       a two-way match is not a control. */
    receivedQty: 912,
    billedQty: 960,
    billedUnitCents: 800,
    provenance: "modeled",
    note: "Short by forty eight pieces, billed for all nine hundred and sixty, and paid on 11 June. The money has left. The only remedy left is a credit note against the next order, which is why this row is the loudest on the desk.",
  },
  {
    poId: "po-106",
    licenceId: null,
    unit: "books",
    orderedQty: 1_500,
    orderedUnitCents: 110,
    acknowledgedOn: "2026-04-10",
    promisedOn: "2026-04-18",
    productionFromOn: "2026-04-13",
    shippedOn: "2026-04-16",
    receivedOn: "2026-04-17",
    receivedQty: 1_500,
    billedQty: 1_500,
    billedUnitCents: 110,
    provenance: "modeled",
  },
  {
    poId: "po-107",
    licenceId: null,
    unit: "units",
    orderedQty: 4_000,
    orderedUnitCents: 615,
    acknowledgedOn: "2026-04-09",
    promisedOn: "2026-04-28",
    productionFromOn: "2026-04-11",
    shippedOn: "2026-04-22",
    receivedOn: "2026-04-27",
    receivedQty: 4_000,
    billedQty: 4_000,
    billedUnitCents: 615,
    provenance: "modeled",
  },
  {
    poId: "po-108",
    licenceId: null,
    unit: "packs",
    orderedQty: 1_500,
    orderedUnitCents: 210,
    acknowledgedOn: "2026-04-16",
    promisedOn: "2026-05-06",
    productionFromOn: "2026-04-18",
    shippedOn: "2026-05-05",
    receivedOn: "2026-05-11",
    receivedQty: 1_500,
    billedQty: 1_500,
    billedUnitCents: 210,
    provenance: "modeled",
    note: "Complete and correct, five days after the date the supplier named. A clean match and a late delivery are two different findings about the same order, and only one of them belongs in a negotiation.",
  },
  {
    poId: "po-109",
    licenceId: null,
    unit: "pieces",
    orderedQty: 40,
    orderedUnitCents: 10_300,
    acknowledgedOn: "2026-07-21",
    promisedOn: "2026-08-06",
    productionFromOn: "2026-07-24",
    shippedOn: null,
    receivedOn: null,
    receivedQty: null,
    billedQty: 40,
    billedUnitCents: 10_300,
    provenance: "modeled",
    note: "Billed in full on 1 August for forty pieces that have not shipped, seven days past the date the supplier named. The invoice sits in received rather than approved, which is the control working.",
  },
  {
    poId: "po-110",
    licenceId: null,
    unit: "pieces",
    orderedQty: 400,
    orderedUnitCents: 545,
    acknowledgedOn: "2026-06-06",
    promisedOn: "2026-06-27",
    productionFromOn: "2026-06-09",
    shippedOn: "2026-06-24",
    receivedOn: "2026-06-26",
    receivedQty: 400,
    billedQty: 400,
    billedUnitCents: 545,
    provenance: "modeled",
    note: "Four hundred ordered, four hundred received, four hundred billed at the agreed price, on time. This match passes on every arithmetic test there is and the invoice is disputed anyway, because what is wrong with the delivery is colourfastness. No machine on this page can check that.",
  },
  {
    poId: "po-112",
    licenceId: null,
    unit: "units",
    orderedQty: 3_300,
    orderedUnitCents: 600,
    acknowledgedOn: "2026-06-03",
    promisedOn: "2026-06-24",
    productionFromOn: "2026-06-05",
    shippedOn: "2026-06-19",
    receivedOn: "2026-06-23",
    receivedQty: 3_300,
    /* Right quantity, right supplier, right week, twenty cents a unit
       over the order. Nothing about the total looks wrong until it is
       divided by three thousand three hundred. */
    billedQty: 3_300,
    billedUnitCents: 620,
    provenance: "modeled",
    note: "Approved for payment at 20 cents a unit above the order, which is $660 across the run. Quantity and delivery are perfect, which is precisely why it got approved.",
  },
  {
    poId: "po-113",
    licenceId: null,
    unit: "sheets",
    orderedQty: 13_500,
    orderedUnitCents: 9,
    acknowledgedOn: "2026-05-21",
    promisedOn: "2026-06-10",
    productionFromOn: "2026-05-23",
    shippedOn: "2026-06-05",
    receivedOn: "2026-06-09",
    receivedQty: 13_500,
    billedQty: 13_500,
    billedUnitCents: 9,
    provenance: "modeled",
  },
  {
    poId: "po-114",
    licenceId: null,
    unit: "pieces",
    orderedQty: 3_000,
    orderedUnitCents: 31,
    acknowledgedOn: "2026-07-08",
    promisedOn: "2026-07-16",
    productionFromOn: "2026-07-10",
    shippedOn: "2026-07-14",
    receivedOn: "2026-07-15",
    /* A hundred and twenty over, billed at the ordered quantity. Litho
       runs over and under and the trade allows for it, but no field on
       this register carries an over-run allowance, so the desk raises it
       and a person closes it. */
    receivedQty: 3_120,
    billedQty: 3_000,
    billedUnitCents: 31,
    provenance: "modeled",
    note: "A hundred and twenty pieces more than ordered arrived and only three thousand were billed. Free stock is still a variance: it was not ordered, it was not budgeted, and next time it may be billed.",
  },
  {
    poId: "po-115",
    licenceId: null,
    unit: "cases",
    orderedQty: 30,
    orderedUnitCents: 9_360,
    acknowledgedOn: "2026-08-07",
    promisedOn: "2026-08-28",
    productionFromOn: "2026-08-10",
    shippedOn: "2026-08-12",
    receivedOn: null,
    receivedQty: null,
    billedQty: 30,
    billedUnitCents: 9_360,
    provenance: "modeled",
    note: "Invoiced on shipment, which the supplier is entitled to do. It cannot be matched until it lands, and it is not late until 28 August.",
  },
  {
    poId: "po-116",
    licenceId: null,
    unit: "pieces",
    orderedQty: 720,
    orderedUnitCents: 590,
    acknowledgedOn: "2026-08-04",
    /* Three days past the date the order asked for. Small, agreed, and
       invisible unless the two dates are held next to each other. */
    promisedOn: "2026-08-28",
    productionFromOn: "2026-08-06",
    shippedOn: "2026-08-10",
    receivedOn: null,
    receivedQty: null,
    billedQty: 720,
    billedUnitCents: 590,
    provenance: "modeled",
  },
  {
    poId: "po-118",
    licenceId: null,
    unit: "units",
    orderedQty: 2_000,
    orderedUnitCents: 615,
    acknowledgedOn: "2026-08-02",
    promisedOn: "2026-09-30",
    productionFromOn: "2026-08-05",
    shippedOn: "2026-08-07",
    receivedOn: "2026-08-11",
    /* Half landed and exactly half billed. This is what a correct part
       delivery looks like, and it is on the desk so that the rows which
       are wrong have something to be wrong against. */
    receivedQty: 1_000,
    billedQty: 1_000,
    billedUnitCents: 615,
    provenance: "modeled",
    note: "A thousand of two thousand landed and a thousand billed, at the ordered price. Part delivery, part billing, no variance. The rest is due 30 September and is still committed money.",
  },
  {
    poId: "po-119",
    licenceId: "coca-cola",
    unit: "tins",
    orderedQty: 1_500,
    orderedUnitCents: 245,
    acknowledgedOn: null,
    promisedOn: null,
    productionFromOn: null,
    shippedOn: null,
    receivedOn: null,
    receivedQty: null,
    billedQty: null,
    billedUnitCents: null,
    provenance: "modeled",
    note: "Approved internally and not yet sent, which is why there is no acknowledgement and no promised date. This is the last moment the licence questions below can be answered cheaply, and both of them currently answer no.",
  },
];

export const CONTROL_BY_PO: Record<string, OrderControl> = Object.fromEntries(
  ORDER_CONTROL.map((c) => [c.poId, c]),
);

// ---------------------------------------------------------------
// Compliance with contract terms
// ---------------------------------------------------------------

/**
 * THE HALF OF COMPLIANCE THAT IS ARITHMETIC.
 *
 * The posting asks for "compliance with contract terms". Almost every
 * screen that claims to do this shows a green tick per agreement, which
 * is a person's opinion rendered as a control.
 *
 * A term is checkable mechanically when it is a number or a date on one
 * document compared with a number or a date on another. That is a small
 * set and it is worth being precise about, because the value of the nine
 * checks below is entirely in the reader knowing they are the only nine.
 *
 * ── THREE OUTCOMES, NEVER TWO ─────────────────────────────────────
 * Pass, fail, and CANNOT CHECK. The third is the one that gets dropped,
 * and dropping it is how a screen reports a hundred per cent pass rate
 * on a supplier who has no agreement on file at all. Three suppliers
 * here are being invoiced with no agreement on the register, and a
 * payment terms check that quietly skipped them would have hidden the
 * most useful thing on this page.
 */
export type TermCheckId =
  | "line-vs-header"
  | "invoice-total-vs-line"
  | "received-vs-ordered"
  | "billed-vs-received"
  | "price-vs-order"
  | "terms-vs-agreement"
  | "promise-vs-request"
  | "supplier-carries-licence"
  | "licence-executed";

export interface TermCheckDef {
  id: TermCheckId;
  /** What is being compared, in one line. */
  label: string;
  /** The term in the words an agreement would use. */
  clause: string;
  /** The arithmetic, stated so a reader can disagree with it. */
  method: string;
  /** What the check runs over, so a rate has a stated denominator. */
  population: string;
}

export const MECHANICAL_TERM_CHECKS: TermCheckDef[] = [
  {
    id: "line-vs-header",
    label: "Order line multiplies out to the order value",
    clause: "Quantity and unit price stated on the order are the price.",
    method: "Quantity ordered times unit price ordered equals the order total.",
    population: "All fifteen goods orders on the desk.",
  },
  {
    id: "invoice-total-vs-line",
    label: "Invoice total equals its own line",
    clause: "The supplier invoices the goods supplied at the price quoted.",
    method:
      "Quantity billed times unit price billed equals the invoice total on the ledger.",
    population: "Goods orders carrying at least one invoice.",
  },
  {
    id: "received-vs-ordered",
    label: "What arrived is what was ordered",
    clause: "Deliver the quantity ordered, in one delivery unless agreed.",
    method:
      "Quantity on the goods receipt equals quantity ordered. Only orders the buyer has closed are tested, because a part delivery still running is not a short one.",
    population: "Orders closed as received.",
  },
  {
    id: "billed-vs-received",
    label: "Nothing is billed that has not arrived",
    clause: "Invoice against delivery, not against the order.",
    method:
      "Quantity billed is no greater than quantity received. An order with no goods receipt at all fails this by definition, which is the point.",
    population: "Goods orders carrying at least one invoice.",
  },
  {
    id: "price-vs-order",
    label: "Billed at the ordered price",
    clause: "Prices are fixed at order and not varied without agreement.",
    method: "Unit price billed equals unit price ordered.",
    population: "Goods orders carrying at least one invoice.",
  },
  {
    id: "terms-vs-agreement",
    label: "Due date honours the agreed payment terms",
    clause: "Payment falls due the stated number of days from invoice date.",
    method:
      "Days from issue date to due date equals the payment terms on the agreement with that supplier. No agreement on the register means the check cannot run, which is itself the finding.",
    population: "Every invoice on the ledger.",
  },
  {
    id: "promise-vs-request",
    label: "The promised date is not later than the date asked for",
    clause: "Delivery schedules are agreed at order and honoured.",
    method:
      "Date the supplier acknowledged is on or before the date the order asked for. An order with no acknowledgement cannot be tested and is reported as such.",
    population: "Goods orders that have been acknowledged.",
  },
  {
    id: "supplier-carries-licence",
    label: "Supplier is registered to carry the property",
    clause: "Licensed goods are made only by a party the licensor permits.",
    method:
      "The property on the order appears in the supplier's licence list on the partner register.",
    population: "Goods orders carrying a licensed property.",
  },
  {
    id: "licence-executed",
    label: "The property is covered by an executed schedule",
    clause: "No production against a property without a signed schedule.",
    method:
      "A contract on the register schedules that property and is not marked draft.",
    population: "Goods orders carrying a licensed property.",
  },
];

/**
 * THE HALF THAT IS NOT ARITHMETIC, AND WHY THAT IS SAID OUT LOUD.
 *
 * Every term below is real, is the kind of clause an agreement actually
 * carries, and cannot be checked by this page or any page like it. The
 * temptation is to model them anyway, give each a field and a green
 * tick, and let the screen imply that compliance has been verified. That
 * would be the most dishonest thing in this application, because it is
 * the failure mode a buyer is hired to prevent.
 *
 * So they are listed as work rather than as status, each with what would
 * actually settle it and who holds the evidence. A reader can see the
 * line where the software stops and the job starts, and that line is the
 * argument this screen is making.
 */
export interface JudgementTerm {
  id: string;
  label: string;
  /** Why arithmetic cannot settle it. */
  why: string;
  /** What would actually settle it. */
  settles: string;
  /** The live example on this register, where there is one. */
  live?: string;
}

export const JUDGEMENT_TERMS: JudgementTerm[] = [
  {
    id: "quality",
    label: "Product quality and safety",
    why: "Colourfastness, seam strength, fill weight and age grading are properties of an object. Nothing on an order, a receipt or an invoice records them.",
    settles:
      "An inspection against a written standard, a retained sample kept here, and a test report per production run.",
    live: "The June uniform delivery matches on quantity, price and date and is disputed on colour. Every arithmetic check on this page passes it.",
  },
  {
    id: "artwork-approval",
    label: "Licensor artwork approval for this promotion",
    why: "A property can be licensed to a manufacturer and the specific artwork still not approved for a specific promotion. Those are two documents and only one of them is a licence.",
    settles:
      "A written approval reference per style, dated, held against the order. Approval state per partner is on the partner register.",
  },
  {
    id: "brand-fit",
    label: "Brand alignment and audience fit",
    why: "Whether a property suits a family entertainment venue on a weekday morning is a judgement about guests, not a comparison between two numbers.",
    settles:
      "A buyer's read, written down before the order rather than defended after it.",
  },
  {
    id: "supplier-compliance",
    label: "Factory standards and country of manufacture",
    why: "Nothing here can see a factory. Nature's Mark publishes no facility, no country of manufacture and no sourcing route, so nothing about any of the three is asserted anywhere in this application.",
    settles:
      "An audit report, a certificate with an expiry date on it, and a site visit. The posting budgets for that: supplier visits and asset inspections, roughly monthly.",
  },
  {
    id: "territory",
    label: "Territory, channel and window",
    why: "Whether a property may be used at this site, in this format, in this window, is a reading of a schedule rather than a sum.",
    settles: "The executed schedule, read by somebody who has it.",
  },
  {
    id: "allowances",
    label: "Over-run, under-run and cancellation windows",
    why: "The register carries no field for either, deliberately. Inventing one would have made a printer's trade custom look like an agreed term.",
    settles:
      "The clause itself, in writing, before the season rather than during it.",
    live: "A print over-run of a hundred and twenty pieces is on the desk as a query for exactly this reason.",
  },
  {
    id: "deposit",
    label: "Deposit share on a pilot",
    why: "Half a pilot order is billed before anything shipped. No agreement on this register carries a deposit term, so there is no agreed share to compare it against.",
    settles: "A payment schedule in the pilot agreement, naming a percentage.",
  },
  {
    id: "insurance",
    label: "Insurance, indemnity and certificates current",
    why: "A certificate expiring is a date, but nobody on this register has filed one, and a check against a document that does not exist is theatre.",
    settles:
      "Certificates on file with expiry dates, which would then make this the tenth mechanical check rather than the eighth judgement.",
  },
];
