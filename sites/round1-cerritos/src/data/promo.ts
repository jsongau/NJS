import type { PromoCategory, PromoLine, PromoPeriod } from "@/domain/licensing";

/**
 * PROMOTIONAL PRODUCT, AS COUNTED RATHER THAN AS CALCULATED.
 *
 * Every row below carries five counted things and nothing else: units in,
 * units out, units on hand, landed cost per unit, and what a guest pays.
 * There is no sell-through column, no revenue column, no margin column
 * and no weeks-of-cover column anywhere in this file. All four are
 * derived in `selectors/promo.ts` at render.
 *
 * That is not tidiness. A stored sell-through is a number that was true
 * once. The first time somebody edits a unit count without editing it,
 * the table starts lying, and nobody notices for a month because the
 * figure still looks like arithmetic.
 *
 * ── EVERY FIGURE IN THIS FILE IS ILLUSTRATIVE ─────────────────────
 * No source publishes what a family entertainment centre pays for a
 * licensed plush or what it sells one for. Nature's Mark publishes which
 * properties it is licensed for and publishes no price, no minimum and no
 * lead time. Round1 publishes no merchandise figures at all. So every
 * row here is invented, labelled invented, and badged invented on screen.
 * The shape of the model is the claim being made; the numbers are not.
 *
 * ── WHY SOME ROWS SELL FOR NOTHING ────────────────────────────────
 * Voucher books and table tents carry a retail of zero cents, and that is
 * a fact rather than a gap. They are bought with real money and given
 * away, so they have a cost, a sell-through and a weeks-of-cover figure,
 * and they have no revenue and no margin at all. The selector reports
 * them as given rather than sold, because a print line showing a negative
 * margin would be arithmetic that is technically right and commercially
 * meaningless.
 *
 * ── THE THIRD LEDGER ──────────────────────────────────────────────
 * The money in this file is NOT event revenue and must never be added to
 * it. See the note at the top of `domain/licensing.ts`.
 */

/** Everything in this file is read as of this date. */
export const PROMO_AS_OF = "2026-08-13";

/**
 * Trading periods, because a licensor report without a period on it is a
 * rumour with a table in it.
 *
 * Q3 carries six weeks rather than thirteen on purpose. It is the period
 * in progress, and dividing a six week sales figure by a thirteen week
 * denominator would understate every weeks-of-cover reading on the page
 * by more than half, which is exactly the arithmetic that leaves a prize
 * wall empty in September.
 */
export const PROMO_PERIODS: PromoPeriod[] = [
  {
    id: "q2-2026",
    label: "Q2 2026, closed",
    startsOn: "2026-04-01",
    endsOn: "2026-06-30",
    weeks: 13,
  },
  {
    id: "q3-2026",
    label: "Q3 2026, to date",
    startsOn: "2026-07-01",
    endsOn: "2026-08-13",
    weeks: 6,
  },
];

export const PROMO_PERIOD_BY_ID: Record<string, PromoPeriod> =
  Object.fromEntries(PROMO_PERIODS.map((p) => [p.id, p]));

export const DEFAULT_PROMO_PERIOD_ID = "q3-2026";

/**
 * The product lines themselves, written once.
 *
 * The identity of a line, its name, its category, its property and who
 * makes it, does not change between periods. Only the counts do. Keeping
 * the two apart means a line cannot be filed under one licence in Q2 and
 * a different one in Q3, which is the single most embarrassing defect a
 * licensor report can have.
 */
interface LineSpec {
  id: string;
  name: string;
  category: PromoCategory;
  licenceId: string | null;
  partnerId: string;
}

const SPECS: LineSpec[] = [
  {
    id: "disney-plush-12",
    name: "Disney character plush, 12 inch",
    category: "plush",
    licenceId: "disney",
    partnerId: "natures-mark",
  },
  {
    id: "sanrio-plush-8",
    name: "Sanrio plush, 8 inch assortment",
    category: "plush",
    licenceId: "sanrio",
    partnerId: "natures-mark",
  },
  {
    id: "sesame-plush-toddler",
    name: "Sesame Street plush, toddler safe",
    category: "plush",
    licenceId: "sesame-street",
    partnerId: "natures-mark",
  },
  {
    id: "peanuts-plush-halloween",
    name: "Peanuts plush, Halloween run",
    category: "plush",
    licenceId: "peanuts",
    partnerId: "natures-mark",
  },
  {
    id: "rudolph-plush-december",
    name: "Rudolph plush, December run",
    category: "plush",
    licenceId: "rudolph",
    partnerId: "natures-mark",
  },
  {
    id: "wb-figure-set",
    name: "Warner Bros. collectible figure set",
    category: "collectible",
    licenceId: "warner-bros",
    partnerId: "natures-mark",
  },
  {
    id: "paramount-keyring",
    name: "Paramount keyring assortment",
    category: "collectible",
    licenceId: "paramount",
    partnerId: "natures-mark",
  },
  {
    id: "precious-moments-gift",
    name: "Precious Moments gift box",
    category: "collectible",
    licenceId: "precious-moments",
    partnerId: "natures-mark",
  },
  {
    id: "coke-tin-sign",
    name: "Coca-Cola tin sign, bar wall",
    category: "collectible",
    licenceId: "coca-cola",
    partnerId: "natures-mark",
  },
  {
    id: "coke-tumbler",
    name: "Coca-Cola branded tumbler",
    category: "food-novelty",
    licenceId: "coca-cola",
    partnerId: "natures-mark",
  },
  {
    id: "disney-pin-series",
    name: "Disney enamel pin series",
    category: "collectible",
    licenceId: "disney",
    partnerId: "natures-mark",
  },
  {
    id: "sanrio-youth-tee",
    name: "Sanrio youth tee",
    category: "apparel",
    licenceId: "sanrio",
    partnerId: "lane-six-apparel",
  },
  {
    id: "house-crew-tee",
    name: "House crew tee, opening run",
    category: "apparel",
    licenceId: null,
    partnerId: "lane-six-apparel",
  },
  {
    id: "lightup-ball",
    name: "Light-up bouncing ball",
    category: "novelty",
    licenceId: null,
    partnerId: "novelty-case-direct",
  },
  {
    id: "mini-megaphone",
    name: "Sound-effect mini megaphone",
    category: "novelty",
    licenceId: null,
    partnerId: "novelty-case-direct",
  },
  {
    id: "glow-bracelet",
    name: "Glow bracelet, hundred pack",
    category: "novelty",
    licenceId: null,
    partnerId: "ticket-wall-supply",
  },
  {
    id: "sticker-sheet",
    name: "Sticker sheet assortment",
    category: "novelty",
    licenceId: null,
    partnerId: "ticket-wall-supply",
  },
  {
    id: "voucher-book",
    name: "Redemption voucher book",
    category: "print",
    licenceId: null,
    partnerId: "county-line-litho",
  },
  {
    id: "birthday-table-tent",
    name: "Birthday table tent",
    category: "print",
    licenceId: null,
    partnerId: "county-line-litho",
  },
  {
    id: "confectionery-tin",
    name: "Branded confectionery tin",
    category: "food-novelty",
    licenceId: null,
    partnerId: "ticket-wall-supply",
  },
];

const SPEC_BY_ID: Record<string, LineSpec> = Object.fromEntries(
  SPECS.map((s) => [s.id, s]),
);

/** id, units in, units out, units on hand, unit cost cents, unit retail cents. */
type Counts = [string, number, number, number, number, number];

const Q2_COUNTS: Counts[] = [
  ["disney-plush-12", 2400, 1980, 610, 486, 1499],
  ["sanrio-plush-8", 1800, 1712, 180, 372, 1199],
  ["sesame-plush-toddler", 1200, 640, 690, 415, 1299],
  ["peanuts-plush-halloween", 900, 120, 795, 448, 1399],
  ["rudolph-plush-december", 1500, 0, 1500, 462, 1399],
  ["wb-figure-set", 1000, 815, 240, 622, 1999],
  ["paramount-keyring", 3000, 2460, 690, 118, 499],
  ["precious-moments-gift", 400, 138, 268, 940, 2499],
  ["coke-tin-sign", 250, 96, 158, 1180, 2999],
  ["coke-tumbler", 2000, 1740, 320, 305, 999],
  ["disney-pin-series", 2500, 2280, 340, 92, 599],
  ["sanrio-youth-tee", 720, 486, 245, 640, 2200],
  ["house-crew-tee", 480, 300, 180, 590, 1800],
  ["lightup-ball", 4320, 3980, 500, 61, 250],
  ["mini-megaphone", 3600, 2210, 1490, 78, 300],
  ["glow-bracelet", 600, 545, 70, 210, 900],
  ["sticker-sheet", 9000, 8120, 1100, 9, 50],
  ["voucher-book", 5000, 4600, 500, 22, 0],
  ["birthday-table-tent", 2000, 1850, 200, 31, 0],
  ["confectionery-tin", 1500, 1290, 165, 175, 699],
];

/**
 * Q3 to date.
 *
 * Two deliberate shapes in here, because a data set where everything
 * behaves is a data set that proves nothing. The Disney plush cost rises
 * from 486 to 512 cents a unit with no change in retail, which is the
 * margin squeeze a buyer is paid to notice. The Rudolph line has landed
 * two thousand four hundred units and sold none, which is correct for
 * August and would be a disaster in January.
 */
const Q3_COUNTS: Counts[] = [
  ["disney-plush-12", 1200, 1010, 800, 512, 1499],
  ["sanrio-plush-8", 2400, 1180, 1400, 372, 1199],
  ["sesame-plush-toddler", 0, 300, 390, 415, 1299],
  ["peanuts-plush-halloween", 1800, 410, 2185, 448, 1399],
  ["rudolph-plush-december", 900, 0, 2400, 462, 1399],
  ["wb-figure-set", 600, 380, 460, 622, 1999],
  ["paramount-keyring", 0, 520, 170, 118, 499],
  ["precious-moments-gift", 200, 61, 407, 940, 2499],
  ["coke-tin-sign", 0, 44, 114, 1180, 2999],
  ["coke-tumbler", 1200, 890, 630, 305, 999],
  ["disney-pin-series", 1500, 1120, 720, 92, 599],
  ["sanrio-youth-tee", 480, 262, 463, 640, 2200],
  ["house-crew-tee", 240, 141, 279, 590, 1800],
  ["lightup-ball", 2160, 1890, 770, 61, 250],
  ["mini-megaphone", 0, 640, 850, 78, 300],
  ["glow-bracelet", 900, 402, 568, 210, 900],
  ["sticker-sheet", 4500, 3610, 1990, 9, 50],
  ["voucher-book", 2500, 2100, 900, 22, 0],
  ["birthday-table-tent", 1000, 760, 440, 31, 0],
  ["confectionery-tin", 600, 500, 265, 175, 699],
];

function expand(periodId: string, counts: Counts[]): PromoLine[] {
  const period = PROMO_PERIOD_BY_ID[periodId];
  return counts.map(([specId, unitsIn, unitsOut, unitsOnHand, cost, retail]) => {
    const spec = SPEC_BY_ID[specId];
    if (!spec) {
      /* A count row naming a line that does not exist would silently drop
         from every total on the page. Failing loudly at module load is the
         only version of this a reader can trust. */
      throw new Error(`Promo counts name an unknown line: ${specId}`);
    }
    return {
      id: `${specId}-${periodId}`,
      name: spec.name,
      category: spec.category,
      licenceId: spec.licenceId,
      partnerId: spec.partnerId,
      periodId,
      unitsIn,
      unitsOut,
      unitsOnHand,
      unitCostCents: cost,
      unitRetailCents: retail,
      weeksInPeriod: period.weeks,
      provenance: "illustrative",
    };
  });
}

export const PROMO_LINES: PromoLine[] = [
  ...expand("q2-2026", Q2_COUNTS),
  ...expand("q3-2026", Q3_COUNTS),
];
