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
 * lead time. DIME publishes no merchandise figures at all. So every
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
    id: "signature-berry-white",
    name: "Berry White",
    category: "disposable",
    licenceId: "signature",
    partnerId: "dime-inhouse",
  },
  {
    id: "signature-banana-punch",
    name: "Banana Punch",
    category: "disposable",
    licenceId: "signature",
    partnerId: "dime-inhouse",
  },
  {
    id: "signature-key-lime-pie",
    name: "Key Lime Pie",
    category: "disposable",
    licenceId: "signature",
    partnerId: "dime-inhouse",
  },
  {
    id: "signature-wedding-cake",
    name: "Wedding Cake",
    category: "disposable",
    licenceId: "signature",
    partnerId: "dime-inhouse",
  },
  {
    id: "signature-pina-colada",
    name: "Pina Colada",
    category: "disposable",
    licenceId: "signature",
    partnerId: "dime-inhouse",
  },
  {
    id: "signature-blackberry-og",
    name: "Blackberry OG",
    category: "cartridge",
    licenceId: "signature",
    partnerId: "dime-inhouse",
  },
  {
    id: "signature-blueberry-lemon-haze",
    name: "Blueberry Lemon Haze",
    category: "cartridge",
    licenceId: "signature",
    partnerId: "dime-inhouse",
  },
  {
    id: "signature-cantaloupe-dream",
    name: "Cantaloupe Dream",
    category: "cartridge",
    licenceId: "signature",
    partnerId: "dime-inhouse",
  },
  {
    id: "signature-forbidden-apple",
    name: "Forbidden Apple",
    category: "cartridge",
    licenceId: "signature",
    partnerId: "dime-inhouse",
  },
  {
    id: "signature-guavalicious",
    name: "Guavalicious",
    category: "cartridge",
    licenceId: "signature",
    partnerId: "dime-inhouse",
  },
  {
    id: "signature-lime-sherbanger",
    name: "Lime Sherbanger",
    category: "cartridge",
    licenceId: "signature",
    partnerId: "dime-inhouse",
  },
  {
    id: "signature-mango-diesel",
    name: "Mango Diesel",
    category: "cartridge",
    licenceId: "signature",
    partnerId: "dime-inhouse",
  },
  {
    id: "signature-paradise-passion",
    name: "Paradise Passion",
    category: "cartridge",
    licenceId: "signature",
    partnerId: "dime-inhouse",
  },
  {
    id: "signature-peach-kush",
    name: "Peach Kush",
    category: "cartridge",
    licenceId: "signature",
    partnerId: "dime-inhouse",
  },
  {
    id: "signature-pink-lemon-haze",
    name: "Pink Lemon Haze",
    category: "cartridge",
    licenceId: "signature",
    partnerId: "dime-inhouse",
  },
  {
    id: "signature-pink-rose",
    name: "Pink Rose",
    category: "cartridge",
    licenceId: "signature",
    partnerId: "dime-inhouse",
  },
  {
    id: "signature-red-plum",
    name: "Red Plum",
    category: "cartridge",
    licenceId: "signature",
    partnerId: "dime-inhouse",
  },
  {
    id: "signature-royal-pear",
    name: "Royal Pear",
    category: "cartridge",
    licenceId: "signature",
    partnerId: "dime-inhouse",
  },
  {
    id: "signature-sour-grape",
    name: "Sour Grape",
    category: "cartridge",
    licenceId: "signature",
    partnerId: "dime-inhouse",
  },
  {
    id: "signature-strawberry-cough",
    name: "Strawberry Cough",
    category: "cartridge",
    licenceId: "signature",
    partnerId: "dime-inhouse",
  },
  {
    id: "signature-tropical-kiwi",
    name: "Tropical Kiwi",
    category: "cartridge",
    licenceId: "signature",
    partnerId: "dime-inhouse",
  },
  {
    id: "signature-watermelon-kush",
    name: "Watermelon Kush",
    category: "cartridge",
    licenceId: "signature",
    partnerId: "dime-inhouse",
  },
  {
    id: "live-reserve-miami-ice",
    name: "Miami Ice",
    category: "disposable",
    licenceId: "live-reserve",
    partnerId: "dime-inhouse",
  },
  {
    id: "live-reserve-papaya",
    name: "Papaya",
    category: "disposable",
    licenceId: "live-reserve",
    partnerId: "dime-inhouse",
  },
  {
    id: "live-reserve-watermelon-og",
    name: "Watermelon OG",
    category: "cartridge",
    licenceId: "live-reserve",
    partnerId: "dime-inhouse",
  },
  {
    id: "live-reserve-banana-mac",
    name: "Banana Mac",
    category: "cartridge",
    licenceId: "live-reserve",
    partnerId: "dime-inhouse",
  },
  {
    id: "live-reserve-chocolope",
    name: "Chocolope",
    category: "cartridge",
    licenceId: "live-reserve",
    partnerId: "dime-inhouse",
  },
  {
    id: "live-reserve-dime-og",
    name: "Dime OG",
    category: "cartridge",
    licenceId: "live-reserve",
    partnerId: "dime-inhouse",
  },
  {
    id: "live-reserve-grape-limeade",
    name: "Grape Limeade",
    category: "cartridge",
    licenceId: "live-reserve",
    partnerId: "dime-inhouse",
  },
  {
    id: "live-reserve-jet-fuel",
    name: "Jet Fuel",
    category: "cartridge",
    licenceId: "live-reserve",
    partnerId: "dime-inhouse",
  },
  {
    id: "live-reserve-king-louis-xiii",
    name: "King Louis XIII",
    category: "cartridge",
    licenceId: "live-reserve",
    partnerId: "dime-inhouse",
  },
  {
    id: "live-reserve-kushmint",
    name: "Kushmint",
    category: "cartridge",
    licenceId: "live-reserve",
    partnerId: "dime-inhouse",
  },
  {
    id: "live-reserve-peach-mojito",
    name: "Peach Mojito",
    category: "cartridge",
    licenceId: "live-reserve",
    partnerId: "dime-inhouse",
  },
  {
    id: "balance-mint-og",
    name: "Mint OG",
    category: "disposable",
    licenceId: "balance",
    partnerId: "dime-inhouse",
  },
  {
    id: "balance-lemon-pound-cake",
    name: "Lemon Pound Cake",
    category: "cartridge",
    licenceId: "balance",
    partnerId: "dime-inhouse",
  },
  {
    id: "balance-mowie-wowie",
    name: "Mowie Wowie",
    category: "cartridge",
    licenceId: "balance",
    partnerId: "dime-inhouse",
  },
  {
    id: "rosin-black-ice",
    name: "Black Ice",
    category: "disposable",
    licenceId: "rosin",
    partnerId: "dime-inhouse",
  },
  {
    id: "rosin-sour-tangie",
    name: "Sour Tangie",
    category: "disposable",
    licenceId: "rosin",
    partnerId: "dime-inhouse",
  },
  {
    id: "rosin-garlic-cookies",
    name: "Garlic Cookies",
    category: "cartridge",
    licenceId: "rosin",
    partnerId: "dime-inhouse",
  },
  {
    id: "rosin-grapes-n-cream",
    name: "Grapes N Cream",
    category: "cartridge",
    licenceId: "rosin",
    partnerId: "dime-inhouse",
  },
  {
    id: "rosin-sunset-sherbert",
    name: "Sunset Sherbert",
    category: "cartridge",
    licenceId: "rosin",
    partnerId: "dime-inhouse",
  },
  {
    id: "rosin-white-fire-og",
    name: "White Fire OG",
    category: "cartridge",
    licenceId: "rosin",
    partnerId: "dime-inhouse",
  },
  {
    id: "state-exclusive-tropicali",
    name: "Tropicali",
    category: "disposable",
    licenceId: "state-exclusive",
    partnerId: "dime-inhouse",
  },
  {
    id: "state-exclusive-cactus-chill",
    name: "Cactus Chill",
    category: "disposable",
    licenceId: "state-exclusive",
    partnerId: "dime-inhouse",
  },
  {
    id: "state-exclusive-bombsicle",
    name: "Bombsicle",
    category: "disposable",
    licenceId: "state-exclusive",
    partnerId: "dime-inhouse",
  },
  {
    id: "state-exclusive-huckleberry-jam",
    name: "Huckleberry Jam",
    category: "disposable",
    licenceId: "state-exclusive",
    partnerId: "dime-inhouse",
  },
  {
    id: "state-exclusive-zia-fresca",
    name: "Zia Fresca",
    category: "disposable",
    licenceId: "state-exclusive",
    partnerId: "dime-inhouse",
  },
  {
    id: "collaborations-peach-ice-t",
    name: "Peach Ice T",
    category: "disposable",
    licenceId: "collab",
    partnerId: "dime-inhouse",
  },
  {
    id: "collaborations-whoa-si-whoa",
    name: "Whoa Si Whoa",
    category: "disposable",
    licenceId: "collab",
    partnerId: "dime-inhouse",
  },
  {
    id: "collaborations-birthday-cake",
    name: "Birthday Cake",
    category: "disposable",
    licenceId: "collab",
    partnerId: "dime-inhouse",
  },
  {
    id: "collaborations-pineapple-kush",
    name: "Pineapple Kush",
    category: "disposable",
    licenceId: "collab",
    partnerId: "dime-inhouse",
  },
  {
    id: "balanced-gummies-peach-gummies",
    name: "Peach gummies",
    category: "gummy",
    licenceId: "balance",
    partnerId: "dime-inhouse",
  },
  {
    id: "balanced-gummies-blue-raspberry-gummies",
    name: "Blue Raspberry gummies",
    category: "gummy",
    licenceId: "balance",
    partnerId: "dime-inhouse",
  },
  {
    id: "balanced-gummies-huckleberry-gummies",
    name: "Huckleberry gummies",
    category: "gummy",
    licenceId: "balance",
    partnerId: "dime-inhouse",
  },
  {
    id: "rosin-gummies-blueberry-gummies",
    name: "Blueberry gummies",
    category: "gummy",
    licenceId: "rosin",
    partnerId: "dime-inhouse",
  },
  {
    id: "rosin-gummies-watermelon-gummies",
    name: "Watermelon gummies",
    category: "gummy",
    licenceId: "rosin",
    partnerId: "dime-inhouse",
  },
  {
    id: "rosin-gummies-plh-gummies-listed-on-the-inde",
    name: "PLH gummies, listed on the index as Pink Lemon Haze",
    category: "gummy",
    licenceId: "rosin",
    partnerId: "dime-inhouse",
  },
  {
    id: "balanced-line-softgels-morning-softgels",
    name: "Morning softgels",
    category: "softgel",
    licenceId: "balance",
    partnerId: "dime-inhouse",
  },
  {
    id: "balanced-line-softgels-afternoon-softgels",
    name: "Afternoon softgels",
    category: "softgel",
    licenceId: "balance",
    partnerId: "dime-inhouse",
  },
  {
    id: "balanced-line-softgels-evening-softgels",
    name: "Evening softgels",
    category: "softgel",
    licenceId: "balance",
    partnerId: "dime-inhouse",
  },
  {
    id: "accessories-5th-gen-battery",
    name: "5th Gen Battery",
    category: "battery",
    licenceId: null,
    partnerId: "dime-inhouse",
  },
  {
    id: "accessories-5th-gen-mini",
    name: "5th Gen Mini",
    category: "battery",
    licenceId: null,
    partnerId: "dime-inhouse",
  },
  {
    id: "accessories-dime-x-glob-mops-xl-2-0",
    name: "Dime x Glob Mops XL 2.0",
    category: "battery",
    licenceId: null,
    partnerId: "dime-inhouse",
  },
  {
    id: "accessories-silicone-cap",
    name: "Silicone Cap",
    category: "battery",
    licenceId: null,
    partnerId: "dime-inhouse",
  },
  {
    id: "accessories-dime-plug-key-chain",
    name: "Dime Plug Key Chain",
    category: "battery",
    licenceId: null,
    partnerId: "dime-inhouse",
  },
];

const SPEC_BY_ID: Record<string, LineSpec> = Object.fromEntries(
  SPECS.map((s) => [s.id, s]),
);

/** id, units in, units out, units on hand, unit cost cents, unit retail cents. */
type Counts = [string, number, number, number, number, number];

const Q2_COUNTS: Counts[] = [
  ["signature-berry-white", 2400, 2158, 297, 1871, 4308],
  ["signature-banana-punch", 960, 749, 337, 2006, 4719],
  ["signature-key-lime-pie", 1440, 1094, 405, 2066, 4984],
  ["signature-wedding-cake", 720, 547, 175, 1987, 4482],
  ["signature-pina-colada", 2400, 2208, 217, 2059, 4473],
  ["signature-blackberry-og", 720, 579, 260, 1235, 3240],
  ["signature-blueberry-lemon-haze", 1920, 1318, 603, 1258, 3427],
  ["signature-cantaloupe-dream", 720, 334, 433, 1267, 3474],
  ["signature-forbidden-apple", 1440, 813, 703, 1360, 2824],
  ["signature-guavalicious", 0, 0, 150, 1414, 3536],
  ["signature-lime-sherbanger", 720, 366, 472, 1198, 3491],
  ["signature-mango-diesel", 720, 604, 213, 1265, 3512],
  ["signature-paradise-passion", 0, 0, 92, 1167, 3445],
  ["signature-peach-kush", 960, 696, 351, 1183, 2868],
  ["signature-pink-lemon-haze", 1920, 1571, 355, 1376, 3341],
  ["signature-pink-rose", 720, 451, 427, 1189, 3323],
  ["signature-red-plum", 240, 160, 117, 1246, 2817],
  ["signature-royal-pear", 1920, 954, 1079, 1292, 3039],
  ["signature-sour-grape", 720, 581, 266, 1287, 3416],
  ["signature-strawberry-cough", 1440, 766, 832, 1384, 3298],
  ["signature-tropical-kiwi", 1440, 1239, 305, 1245, 3121],
  ["signature-watermelon-kush", 480, 312, 226, 1207, 3417],
  ["live-reserve-miami-ice", 1440, 659, 879, 2040, 4360],
  ["live-reserve-papaya", 2400, 1595, 810, 2061, 4656],
  ["live-reserve-watermelon-og", 720, 619, 231, 1296, 2987],
  ["live-reserve-banana-mac", 960, 566, 473, 1196, 3248],
  ["live-reserve-chocolope", 1440, 908, 582, 1345, 3484],
  ["live-reserve-dime-og", 480, 274, 326, 1419, 3515],
  ["live-reserve-grape-limeade", 720, 592, 157, 1342, 3014],
  ["live-reserve-jet-fuel", 1440, 780, 730, 1164, 3295],
  ["live-reserve-king-louis-xiii", 0, 0, 159, 1163, 3113],
  ["live-reserve-kushmint", 720, 454, 389, 1405, 3507],
  ["live-reserve-peach-mojito", 720, 649, 91, 1246, 3052],
  ["balance-mint-og", 720, 612, 173, 1926, 4769],
  ["balance-lemon-pound-cake", 480, 320, 195, 1187, 3226],
  ["balance-mowie-wowie", 960, 578, 489, 1213, 3351],
  ["rosin-black-ice", 1920, 1712, 296, 2056, 4792],
  ["rosin-sour-tangie", 960, 675, 455, 2068, 4602],
  ["rosin-garlic-cookies", 240, 153, 195, 1258, 2873],
  ["rosin-grapes-n-cream", 1920, 1002, 925, 1245, 3379],
  ["rosin-sunset-sherbert", 960, 538, 563, 1299, 2848],
  ["rosin-white-fire-og", 240, 108, 197, 1294, 2855],
  ["state-exclusive-tropicali", 0, 0, 134, 2055, 4350],
  ["state-exclusive-cactus-chill", 0, 0, 113, 1957, 4889],
  ["state-exclusive-bombsicle", 2400, 1966, 610, 2004, 4695],
  ["state-exclusive-huckleberry-jam", 480, 232, 387, 1839, 5138],
  ["state-exclusive-zia-fresca", 1440, 1073, 447, 1994, 4310],
  ["collaborations-peach-ice-t", 480, 308, 185, 2019, 5103],
  ["collaborations-whoa-si-whoa", 240, 154, 92, 1846, 5014],
  ["collaborations-birthday-cake", 2400, 1216, 1257, 1793, 4411],
  ["collaborations-pineapple-kush", 240, 154, 246, 1842, 5164],
  ["balanced-gummies-peach-gummies", 1440, 720, 848, 483, 1632],
  ["balanced-gummies-blue-raspberry-gummies", 960, 775, 286, 516, 1492],
  ["balanced-gummies-huckleberry-gummies", 1920, 1036, 986, 516, 1734],
  ["rosin-gummies-blueberry-gummies", 2400, 1520, 1040, 520, 1588],
  ["rosin-gummies-watermelon-gummies", 960, 698, 380, 653, 1885],
  ["rosin-gummies-plh-gummies-listed-on-the-inde", 720, 540, 210, 499, 1752],
  ["balanced-line-softgels-morning-softgels", 720, 351, 452, 560, 2099],
  ["balanced-line-softgels-afternoon-softgels", 1440, 1330, 215, 703, 1787],
  ["balanced-line-softgels-evening-softgels", 480, 313, 330, 525, 1603],
  ["accessories-5th-gen-battery", 1440, 829, 700, 827, 1846],
  ["accessories-5th-gen-mini", 720, 481, 286, 872, 2313],
  ["accessories-dime-x-glob-mops-xl-2-0", 240, 221, 170, 670, 1833],
  ["accessories-silicone-cap", 960, 767, 357, 666, 2138],
  ["accessories-dime-plug-key-chain", 1920, 1259, 816, 720, 1930],
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
  ["signature-berry-white", 720, 659, 1043, 1975, 4589],
  ["signature-banana-punch", 480, 302, 635, 2071, 4628],
  ["signature-key-lime-pie", 960, 966, 1289, 1926, 5094],
  ["signature-wedding-cake", 240, 450, 1054, 1754, 5067],
  ["signature-pina-colada", 240, 206, 302, 1810, 4290],
  ["signature-blackberry-og", 0, 410, 344, 1329, 3441],
  ["signature-blueberry-lemon-haze", 1200, 595, 1462, 1328, 2860],
  ["signature-cantaloupe-dream", 0, 53, 1205, 1229, 3555],
  ["signature-forbidden-apple", 960, 1097, 1191, 1310, 3004],
  ["signature-guavalicious", 0, 48, 1441, 1226, 2946],
  ["signature-lime-sherbanger", 720, 887, 740, 1378, 3244],
  ["signature-mango-diesel", 480, 386, 1298, 1256, 3168],
  ["signature-paradise-passion", 480, 401, 294, 1342, 2988],
  ["signature-peach-kush", 1200, 554, 202, 1308, 2849],
  ["signature-pink-lemon-haze", 0, 45, 97, 1445, 3110],
  ["signature-pink-rose", 960, 860, 222, 1377, 3271],
  ["signature-red-plum", 240, 429, 896, 1413, 3180],
  ["signature-royal-pear", 720, 515, 1414, 1160, 2979],
  ["signature-sour-grape", 240, 247, 115, 1388, 3492],
  ["signature-strawberry-cough", 480, 479, 986, 1254, 3294],
  ["signature-tropical-kiwi", 240, 463, 405, 1174, 3557],
  ["signature-watermelon-kush", 960, 572, 873, 1350, 2985],
  ["live-reserve-miami-ice", 1200, 893, 388, 1830, 4572],
  ["live-reserve-papaya", 960, 871, 938, 1987, 4555],
  ["live-reserve-watermelon-og", 960, 996, 226, 1395, 2957],
  ["live-reserve-banana-mac", 0, 43, 391, 1206, 2944],
  ["live-reserve-chocolope", 1200, 638, 1078, 1449, 3431],
  ["live-reserve-dime-og", 1200, 993, 1189, 1439, 3557],
  ["live-reserve-grape-limeade", 0, 37, 514, 1419, 2987],
  ["live-reserve-jet-fuel", 960, 783, 743, 1328, 2856],
  ["live-reserve-king-louis-xiii", 480, 420, 1196, 1447, 2872],
  ["live-reserve-kushmint", 0, 268, 431, 1252, 3570],
  ["live-reserve-peach-mojito", 480, 311, 736, 1256, 3551],
  ["balance-mint-og", 1200, 1052, 933, 1762, 4909],
  ["balance-lemon-pound-cake", 1200, 870, 1517, 1158, 3181],
  ["balance-mowie-wowie", 240, 203, 1475, 1341, 2864],
  ["rosin-black-ice", 1200, 1088, 981, 1804, 4835],
  ["rosin-sour-tangie", 240, 231, 793, 1845, 5005],
  ["rosin-garlic-cookies", 960, 697, 597, 1219, 3486],
  ["rosin-grapes-n-cream", 0, 80, 607, 1256, 3032],
  ["rosin-sunset-sherbert", 720, 596, 1082, 1266, 2911],
  ["rosin-white-fire-og", 960, 823, 510, 1448, 3350],
  ["state-exclusive-tropicali", 240, 607, 794, 1933, 4470],
  ["state-exclusive-cactus-chill", 240, 197, 1491, 2031, 4901],
  ["state-exclusive-bombsicle", 240, 446, 338, 1897, 4210],
  ["state-exclusive-huckleberry-jam", 1200, 1081, 550, 1801, 4670],
  ["state-exclusive-zia-fresca", 240, 146, 229, 1821, 5103],
  ["collaborations-peach-ice-t", 0, 174, 356, 1969, 4602],
  ["collaborations-whoa-si-whoa", 0, 206, 1243, 1811, 4803],
  ["collaborations-birthday-cake", 0, 268, 1036, 1775, 5145],
  ["collaborations-pineapple-kush", 480, 353, 123, 1975, 4206],
  ["balanced-gummies-peach-gummies", 960, 793, 1031, 597, 1659],
  ["balanced-gummies-blue-raspberry-gummies", 240, 433, 665, 644, 1671],
  ["balanced-gummies-huckleberry-gummies", 720, 585, 1542, 592, 1565],
  ["rosin-gummies-blueberry-gummies", 240, 288, 1381, 509, 1547],
  ["rosin-gummies-watermelon-gummies", 0, 220, 1376, 587, 1679],
  ["rosin-gummies-plh-gummies-listed-on-the-inde", 0, 91, 174, 497, 1611],
  ["balanced-line-softgels-morning-softgels", 0, 26, 581, 597, 1738],
  ["balanced-line-softgels-afternoon-softgels", 240, 176, 273, 669, 2054],
  ["balanced-line-softgels-evening-softgels", 1200, 740, 1542, 671, 1866],
  ["accessories-5th-gen-battery", 240, 378, 745, 770, 2394],
  ["accessories-5th-gen-mini", 720, 407, 1255, 757, 1805],
  ["accessories-dime-x-glob-mops-xl-2-0", 1200, 723, 397, 842, 2273],
  ["accessories-silicone-cap", 240, 278, 504, 826, 1928],
  ["accessories-dime-plug-key-chain", 960, 689, 1505, 853, 2386],
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
