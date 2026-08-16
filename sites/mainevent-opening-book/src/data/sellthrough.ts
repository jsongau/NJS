import type { Provenance } from "@/domain/types";
import type { StatusToken } from "@/domain/vocabulary";
import {
  LICENCES,
  NATURES_MARK_RETAIL_PARTNERS,
  NATURES_MARK_SOURCE,
} from "@/data/partners";
import { PROMO_LINES } from "@/data/promo";

/**
 * THE LICENSOR STATEMENT LAYER: what was bought, what moved, what is
 * left, and where it went.
 *
 * The Round1 posting asks for two things this file exists to serve, and
 * they are quoted in its own words on the screen that reads it:
 *
 *   "Provide accurate and timely reports to both internal stakeholders
 *    and external licensors."
 *   "Use sales data to guide purchasing strategies and negotiate future
 *    promotional agreements."
 *
 * ── WHAT IS REAL IN THIS FILE, AND IT IS EXACTLY ONE THING ────────
 * The names of the nine licensed properties. They are not typed here at
 * all: `REPORTED_LICENCE_IDS` is read off `LICENCES` in
 * `data/partners.ts`, which was read off `https://natures-mark.com/partners/`
 * on 13 August 2026. Copying "Warner Bros." into a second file is how a
 * full stop goes missing from a document addressed to the party who owns
 * the trademark, so this file quotes the register rather than retyping it
 * and throws at module load if the register stops holding nine.
 *
 * The five retailer names cited at the foot of a statement are read off
 * the same published page, and the check below refuses to let a name be
 * cited that the published list does not carry.
 *
 * ── WHAT IS MODELLED, WHICH IS EVERYTHING ELSE ────────────────────
 * Every unit, every cent and every week on the surface that reads this
 * file is invented for the prototype. The unit counts and prices are not
 * even invented HERE: they are the counts already seeded in
 * `data/promo.ts`, so that the internal stock table and the outward
 * statement can never disagree about how many units of a property moved.
 * A licensor statement that contradicts the licensee's own stock report
 * is the one defect in this trade that ends a relationship rather than
 * costing a phone call.
 *
 * What this file genuinely adds is the fact `data/promo.ts` does not
 * carry and a licensor actually asks for: WHERE the units went. A
 * thousand units off the prize wall against a thousand units sold at the
 * counter are the same number and a completely different read on the
 * property, and only one of them is evidence that a guest chose it.
 *
 * ── WHAT IS NOT PUBLISHED, AND IS THEREFORE NOT HERE ──────────────
 * Nature's Mark publishes no factory, no country of manufacture, no
 * minimum order quantity, no lead time, no unit cost and no anime or game
 * licence. None of the six appears in this file in any form. The reorder
 * bands below are therefore judged against a DECLARED planning horizon
 * rather than against a manufacturing lead time, and the screen says so
 * where the band is printed. Inventing a lead time for a real company and
 * printing it on a document addressed to that company's licensors would
 * be the exact failure this whole application argues against.
 *
 * ── NOTHING DERIVED IS STORED ─────────────────────────────────────
 * There is no sell-through figure, no margin figure, no weekly rate and
 * no cover figure anywhere below. All four are computed at render on
 * `SellThroughPage`, each printed beside the number it was divided by. A
 * stored rate is a number that was true once.
 */

/** Every figure on the statement is read as at this date. */
export const SELLTHROUGH_AS_OF = "2026-08-13";

/** The page both the licence names and the retailer names were read off. */
export const SELLTHROUGH_SOURCE = NATURES_MARK_SOURCE;
export const SELLTHROUGH_SOURCE_READ_ON = "13 August 2026";

/**
 * The nine properties a statement can be raised against.
 *
 * Read off the register rather than typed, so the spelling on a document
 * that leaves the building is the spelling the published page carries.
 * Harry Potter is excluded by the same flag the register uses: it is
 * named on the Nature's Mark root page and not on the partners page, and
 * a statement is not the place to resolve a discrepancy between two
 * readings of two pages.
 */
export const REPORTED_LICENCE_IDS: string[] = LICENCES.filter(
  (l) => l.onPartnersPage,
).map((l) => l.id);

/**
 * Five of the retailers the same published page names, cited at the foot
 * of a statement.
 *
 * They are cited because they are the part of the published page a
 * licensor reads as evidence rather than as a claim: a supplier already
 * shipping licensed product into named doors has passed those retailers'
 * own compliance. The full published list of twenty four lives in
 * `data/partners.ts` and is not duplicated here; the check below refuses
 * any name that list does not carry, so a statement cannot cite a
 * retailer into existence.
 */
export const RETAIL_PARTNERS_CITED: string[] = [
  "Michaels",
  "Macy's",
  "Amazon",
  "Wayfair",
  "Cracker Barrel",
];

// ---------------------------------------------------------------
// The reporting window
// ---------------------------------------------------------------

/**
 * A reporting window, which is the first line of any statement worth
 * sending.
 *
 * The two below are deliberately the same days as the two trading
 * periods on `/promo`. A licensor statement covering a window the
 * licensee's own stock report does not cover is a document nobody can
 * check, and the whole argument of this surface is that it can be
 * checked. `promoPeriodId` is the join, and it is a field rather than a
 * naming convention because a convention breaks silently.
 */
export interface ReportingWindow {
  id: string;
  label: string;
  /** ISO. Printed on the statement. */
  startsOn: string;
  endsOn: string;
  /** The divisor under every per-week figure on the statement. */
  weeks: number;
  /** The `/promo` trading period whose counts this window reports. */
  promoPeriodId: string;
  /**
   * False where the window is still running. A statement for a window in
   * progress is a legitimate thing to send and a dishonest thing to send
   * unlabelled, because six weeks of sales read as a quarter of sales.
   */
  closed: boolean;
  /** The window before it, or null where the seed holds none. */
  priorWindowId: string | null;
}

export const REPORTING_WINDOWS: ReportingWindow[] = [
  {
    id: "w-q2-2026",
    label: "Q2 2026, closed",
    startsOn: "2026-04-01",
    endsOn: "2026-06-30",
    weeks: 13,
    promoPeriodId: "q2-2026",
    closed: true,
    priorWindowId: null,
  },
  {
    id: "w-q3-2026",
    label: "Q3 2026, to date",
    startsOn: "2026-07-01",
    endsOn: "2026-08-13",
    weeks: 6,
    promoPeriodId: "q3-2026",
    closed: false,
    priorWindowId: "w-q2-2026",
  },
];

export const REPORTING_WINDOW_BY_ID: Record<string, ReportingWindow> =
  Object.fromEntries(REPORTING_WINDOWS.map((w) => [w.id, w]));

/** The window a reader opens on. The one in progress, not the tidy one. */
export const DEFAULT_WINDOW_ID = "w-q3-2026";

// ---------------------------------------------------------------
// Where the units went
// ---------------------------------------------------------------

/**
 * The four ways a unit of licensed product leaves this building.
 *
 * They are four different commercial facts wearing one unit count. A
 * counter sale is a guest choosing the property and paying for it. A
 * prize wall redemption is a guest spending tickets they already earned,
 * which says the property is attractive and says nothing about price. A
 * package inclusion is the venue choosing the property on the guest's
 * behalf. An event giveaway is the venue buying goodwill with it.
 *
 * A licensor reading a flat sell-through figure cannot tell those apart,
 * and the buyer negotiating the next agreement needs to, because only the
 * first two are evidence of demand.
 */
export type MovementChannel = "counter" | "prize-wall" | "package" | "event";

export const MOVEMENT_CHANNEL: Record<MovementChannel, StatusToken> = {
  counter: {
    glyph: "◆",
    label: "Counter sale",
    cssVar: "var(--fam-corporate)",
    note: "A guest chose the property and paid retail for it. The strongest evidence of demand on the statement.",
  },
  "prize-wall": {
    glyph: "◈",
    label: "Prize wall",
    cssVar: "var(--fam-fundraiser)",
    note: "Redeemed against tickets already earned. Evidence the property is chosen, and no evidence at all about price.",
  },
  package: {
    glyph: "◍",
    label: "Package inclusion",
    cssVar: "var(--fam-youth-group)",
    note: "Included in a birthday or party package. The venue chose the property on the guest's behalf, so it counts as movement rather than as demand.",
  },
  event: {
    glyph: "◎",
    label: "Event giveaway",
    cssVar: "var(--lane-hospitality)",
    note: "Handed over at a fundraiser or corporate event. Bought with real money and given away, which is a cost with no revenue against it.",
  },
};

export const MOVEMENT_CHANNEL_ORDER: MovementChannel[] = [
  "counter",
  "prize-wall",
  "package",
  "event",
];

/**
 * One property, one window, one channel, one unit count.
 *
 * ILLUSTRATIVE, every row. Nobody publishes where a family entertainment
 * centre's licensed plush goes, and this application does not either. The
 * one thing these rows are held to is arithmetic: per property and per
 * window they must add up to the units out already seeded in
 * `data/promo.ts`, and the check at the bottom of this file throws at
 * module load if they do not. That is what stops a channel split
 * quietly becoming a second, contradictory sales figure.
 */
export interface ChannelMovement {
  id: string;
  licenceId: string;
  windowId: string;
  channel: MovementChannel;
  units: number;
  provenance: Provenance;
}

/** licence id, window id, channel, units. Kept as a tuple so the splits stay readable as a block. */
type Split = [string, string, MovementChannel, number];

const SPLITS: Split[] = [
  /* Q2 2026, closed. */
  ["disney", "w-q2-2026", "prize-wall", 2100],
  ["disney", "w-q2-2026", "counter", 1360],
  ["disney", "w-q2-2026", "package", 800],
  ["sanrio", "w-q2-2026", "prize-wall", 1200],
  ["sanrio", "w-q2-2026", "counter", 700],
  ["sanrio", "w-q2-2026", "package", 298],
  ["sesame-street", "w-q2-2026", "package", 380],
  ["sesame-street", "w-q2-2026", "prize-wall", 180],
  ["sesame-street", "w-q2-2026", "counter", 80],
  ["peanuts", "w-q2-2026", "counter", 70],
  ["peanuts", "w-q2-2026", "prize-wall", 50],
  /* Rudolph carries two rows at zero rather than no rows at all. A
     property that moved nothing is a finding, and a statement that
     silently omits it lets a reader assume it was not stocked. It was:
     fifteen hundred units landed in Q2 and none of them moved, which is
     correct in June and would be a disaster in January. */
  ["rudolph", "w-q2-2026", "prize-wall", 0],
  ["rudolph", "w-q2-2026", "counter", 0],
  ["warner-bros", "w-q2-2026", "prize-wall", 500],
  ["warner-bros", "w-q2-2026", "counter", 215],
  ["warner-bros", "w-q2-2026", "event", 100],
  ["paramount", "w-q2-2026", "prize-wall", 1900],
  ["paramount", "w-q2-2026", "counter", 360],
  ["paramount", "w-q2-2026", "package", 200],
  ["precious-moments", "w-q2-2026", "counter", 96],
  ["precious-moments", "w-q2-2026", "event", 42],
  ["coca-cola", "w-q2-2026", "counter", 1500],
  ["coca-cola", "w-q2-2026", "event", 220],
  ["coca-cola", "w-q2-2026", "prize-wall", 116],

  /* Q3 2026, six weeks in rather than thirteen. */
  ["disney", "w-q3-2026", "prize-wall", 1050],
  ["disney", "w-q3-2026", "counter", 700],
  ["disney", "w-q3-2026", "package", 380],
  ["sanrio", "w-q3-2026", "prize-wall", 800],
  ["sanrio", "w-q3-2026", "counter", 442],
  ["sanrio", "w-q3-2026", "package", 200],
  ["sesame-street", "w-q3-2026", "package", 190],
  ["sesame-street", "w-q3-2026", "prize-wall", 70],
  ["sesame-street", "w-q3-2026", "counter", 40],
  ["peanuts", "w-q3-2026", "counter", 250],
  ["peanuts", "w-q3-2026", "prize-wall", 160],
  ["rudolph", "w-q3-2026", "prize-wall", 0],
  ["rudolph", "w-q3-2026", "counter", 0],
  ["warner-bros", "w-q3-2026", "prize-wall", 240],
  ["warner-bros", "w-q3-2026", "counter", 100],
  ["warner-bros", "w-q3-2026", "event", 40],
  ["paramount", "w-q3-2026", "prize-wall", 400],
  ["paramount", "w-q3-2026", "counter", 80],
  ["paramount", "w-q3-2026", "package", 40],
  ["precious-moments", "w-q3-2026", "counter", 40],
  ["precious-moments", "w-q3-2026", "event", 21],
  ["coca-cola", "w-q3-2026", "counter", 760],
  ["coca-cola", "w-q3-2026", "event", 110],
  ["coca-cola", "w-q3-2026", "prize-wall", 64],
];

export const CHANNEL_MOVEMENTS: ChannelMovement[] = SPLITS.map(
  ([licenceId, windowId, channel, units]) => ({
    id: `${licenceId}-${windowId}-${channel}`,
    licenceId,
    windowId,
    channel,
    units,
    provenance: "illustrative",
  }),
);

// ---------------------------------------------------------------
// What the numbers imply for the next order
// ---------------------------------------------------------------

/**
 * THE PLANNING HORIZON, AND WHY IT IS NOT A LEAD TIME.
 *
 * The obvious test for a reorder is cover against the factory's lead
 * time, and that is exactly the test `/promo` runs on its internal line
 * table, using the illustrative lead times seeded on the register.
 *
 * This statement will not run it, for one reason: it is a document
 * addressed to a licensor, and no source read for this application
 * publishes a lead time for any manufacturer of any of these nine
 * properties. Printing "cover is under the lead time" on an outward
 * document would put an invented figure about a real company into a
 * sentence that reads as fact.
 *
 * So the test is cover against a DECLARED horizon: eight weeks, which is
 * this venue's own replanning cycle and is a statement about the venue
 * rather than about anybody's factory. The horizon is printed next to
 * every band it produces.
 */
export const REORDER_HORIZON_WEEKS = 8;

/**
 * Twenty six weeks, half a year, and the same threshold `/promo` calls
 * overstocked. Two surfaces disagreeing about what "too much stock"
 * means would be a worse defect than either threshold being wrong.
 */
export const OVERSTOCK_WEEKS = 26;

export type ReorderBandId = "nothing-moved" | "short" | "steady" | "long";

export interface ReorderBand {
  id: ReorderBandId;
  token: StatusToken;
  /** The test in words, with the divisor named. Printed as the rule. */
  test: string;
  /** What it means for the next order and the next negotiation. */
  implication: string;
}

export const REORDER_BANDS: ReorderBand[] = [
  {
    id: "nothing-moved",
    token: {
      glyph: "○",
      label: "Nothing moved",
      cssVar: "var(--neutral)",
      note: "No units left the building in the window, so there is no weekly rate to divide stock by.",
    },
    test: "Units moved in the window is zero, so cover has no divisor and is not estimated.",
    implication:
      "No reorder. The question for the licensor is whether the property is out of season or out of favour, and a statement cannot tell those apart.",
  },
  {
    id: "short",
    token: {
      glyph: "✕",
      label: "Order before the next window",
      cssVar: "var(--risk)",
      note: "Closing stock divided by the window's own weekly rate is under the declared eight week horizon.",
    },
    test: "Weeks of cover, closing units over units moved per week, is under 8.",
    implication:
      "Raise the next order inside this window. Cover is shorter than the venue's own replanning cycle, so waiting for the window to close is a decision to run thin.",
  },
  {
    id: "steady",
    token: {
      glyph: "●",
      label: "Holds to the next window",
      cssVar: "var(--ok)",
      note: "Cover sits between the eight week horizon and twenty six weeks.",
    },
    test: "Weeks of cover is 8 or more and 26 or less.",
    implication:
      "Reorder at the normal point. This is the band where a repeat order can be negotiated rather than rushed, which is where the price is.",
  },
  {
    id: "long",
    token: {
      glyph: "◘",
      label: "Do not reorder",
      cssVar: "var(--warn)",
      note: "Over twenty six weeks of cover. Money already spent sitting on a shelf.",
    },
    test: "Weeks of cover is over 26, which is half a year at the window's own rate.",
    implication:
      "No further order on this property. The conversation with the licensor is about the assortment or the season, not about the next quantity.",
  },
];

export const REORDER_BAND_BY_ID: Record<ReorderBandId, ReorderBand> =
  Object.fromEntries(REORDER_BANDS.map((b) => [b.id, b])) as Record<
    ReorderBandId,
    ReorderBand
  >;

// ---------------------------------------------------------------
// The checks, run once at module load
// ---------------------------------------------------------------

/*
  THREE THINGS THIS FILE REFUSES TO SHIP QUIETLY.

  Every one of them is a defect that would look like working software: a
  statement with a missing property, a cited retailer nobody published,
  or a channel split that adds up to a different sales figure than the
  stock report it was taken from. All three fail at module load instead,
  where a person sees them, rather than on paper in front of a licensor.
*/

if (REPORTED_LICENCE_IDS.length !== 9) {
  throw new Error(
    `The published register should carry nine licence names on the partners page and carries ${REPORTED_LICENCE_IDS.length}. A statement will not be raised against a list that has moved.`,
  );
}

for (const name of RETAIL_PARTNERS_CITED) {
  if (!NATURES_MARK_RETAIL_PARTNERS.includes(name)) {
    throw new Error(
      `A statement cites "${name}" as a published retail partner and the published list does not carry that name.`,
    );
  }
}

for (const window of REPORTING_WINDOWS) {
  for (const licenceId of REPORTED_LICENCE_IDS) {
    const split = CHANNEL_MOVEMENTS.filter(
      (m) => m.windowId === window.id && m.licenceId === licenceId,
    ).reduce((sum, m) => sum + m.units, 0);

    const counted = PROMO_LINES.filter(
      (l) => l.periodId === window.promoPeriodId && l.licenceId === licenceId,
    ).reduce((sum, l) => sum + l.unitsOut, 0);

    if (split !== counted) {
      throw new Error(
        `The channel split for ${licenceId} in ${window.label} adds up to ${split} units and the stock count on /promo says ${counted}. One document contradicting the other is the defect this check exists to stop.`,
      );
    }
  }
}
