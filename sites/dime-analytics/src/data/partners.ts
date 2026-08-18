import type { Licence, LicenceGap, Partner } from "@/domain/licensing";

/**
 * THE RELATIONSHIP REGISTER.
 *
 * Two cohorts live in this file and they are not the same kind of fact.
 *
 * ── COHORT ONE: WHAT A PAGE ACTUALLY PUBLISHES ────────────────────
 * `LICENCES` is read off `https://natures-mark.com/partners/`, fetched on
 * 13 August 2026. That page carries a heading called "License Partners"
 * and names nine properties under it. All nine are below, spelled as the
 * page spells them, and each carries the URL it was read from.
 *
 * Harry Potter is the tenth row and it is flagged differently, because it
 * is named on the Nature's Mark ROOT page and not on the partners page.
 * Flattening two readings into one list would have been tidier and would
 * have made a claim neither page makes.
 *
 * `NATURES_MARK_RETAIL_PARTNERS` is the same page's other list, all
 * twenty four of them. It is here because it is the fact that makes the
 * licence list mean something: a supplier who ships licensed product into
 * Costco and Target is a supplier who has passed those retailers' own
 * compliance, and that is a stronger statement about capability than
 * anything a candidate could assert about themselves.
 *
 * ── COHORT TWO: WHAT A VENUE ACTUALLY NEEDS ───────────────────────
 * `PARTNERS` is the working register. Exactly one row in it is a real
 * company, and that is Nature's Mark. Every other row carries a
 * descriptive trade name rather than the name of a real local business,
 * for a reason worth stating plainly: a real local printer appearing in a
 * work sample with an invented invoice against it would be a claim about
 * that printer's business. Real local organisations live in
 * `prospects.ts`, and they are there because they are prospects rather
 * than because somebody owes them money.
 *
 * ── THE FRAMING RULE, WHICH IS THE POINT OF THE WHOLE FILE ────────
 * What is true: Nature's Mark publishes those licences, and Jay has a
 * connection to Nature's Mark. What is NOT true and is claimed nowhere:
 * that DIME has an agreement with any licensor named here, or that
 * Nature's Mark manufactures in any particular
 * country. The partners page names no factory, no country and no sourcing
 * route, so this file names none either.
 *
 * Every lead time, minimum order quantity and dollar figure attached to
 * any row, INCLUDING the Nature's Mark row, is illustrative and carries
 * the badge that says so. A real company with invented commercial terms
 * is the most dangerous shape of row in this application, so it is the
 * one row where the badge does the most work.
 */

/** Every figure in this cohort is read as of this date. */
export const PARTNERS_AS_OF = "2026-08-13";

export const NATURES_MARK_SOURCE = "https://natures-mark.com/partners/";
export const NATURES_MARK_ROOT = "https://natures-mark.com/";

/**
 * The nine properties the partners page names, plus the one the root page
 * names and the partners page does not.
 *
 * `fitNote` is the only invented column here and it is a judgement rather
 * than a figure: what a bowling, arcade and karaoke venue would
 * plausibly do with the property. It carries no number, so it carries no
 * badge.
 */
export const LICENCES: Licence[] = [
  {
    id: "signature",
    name: "Signature Line",
    source: "https://dimeindustries.com/products/",
    provenance: "public",
    onPartnersPage: true,
    fitNote:
      "The volume line and the one every promotion is built around. DIME publishes it as its award winning distillate line.",
  },
  {
    id: "live-reserve",
    name: "Live Reserve Line",
    source: "https://dimeindustries.com/products/",
    provenance: "public",
    onPartnersPage: true,
    fitNote:
      "Liquid live resin with high terpene extracts. The premium tier, and the one a budtender recommends by name.",
  },
  {
    id: "balance",
    name: "Balance Line",
    source: "https://dimeindustries.com/products/",
    provenance: "public",
    onPartnersPage: true,
    fitNote:
      "Published as calibrated ratios across multiple cannabinoids and organised by intent rather than by flavour.",
  },
  {
    id: "rosin",
    name: "Rosin Line",
    source: "https://dimeindustries.com/products/",
    provenance: "public",
    onPartnersPage: true,
    fitNote:
      "Published as solventless. The smallest line by SKU count and the highest ticket per unit.",
  },
  {
    id: "state-exclusive",
    name: "State Exclusive",
    source: "https://dimeindustries.com/products/",
    provenance: "public",
    onPartnersPage: true,
    fitNote:
      "Five SKUs published as tied to a named state: Tropicali in California, Cactus Chill in Arizona, Bombsicle in Oklahoma, Huckleberry Jam in Montana, Zia Fresca in New Mexico.",
  },
  {
    id: "collab",
    name: "Collaborations",
    source: "https://dimeindustries.com/products/",
    provenance: "public",
    onPartnersPage: true,
    fitNote:
      "Limited collaboration drops. Published as a line rather than as a permanent assortment.",
  },
];

export const LICENCE_BY_ID: Record<string, Licence> = Object.fromEntries(
  LICENCES.map((l) => [l.id, l]),
);

/**
 * THE GAP THIS REGISTER HAS AGAINST ONE PARTICULAR FLOOR.
 *
 * The DIME posting carries a line that nothing above answers, and it
 * is quoted below exactly as the posting prints it: "Incorporate
 * culturally relevant and trending anime/game properties into product
 * offerings."
 *
 * The published list has no anime property on it and no game property on
 * it. `RESEARCH_licensors.md` records that as "Not covered" and it stays
 * recorded that way, because every alternative was a way of writing one
 * in.
 *
 * ── WHAT WAS REJECTED, AND WHY ────────────────────────────────────
 *
 * REJECTED: a tenth licence row. The most tempting fix on this file is
 * one more object in `LICENCES` carrying a Japanese property and a badge
 * reading illustrative. It would render beautifully and it would be the
 * end of the nine, because a reader who spots one invented licence has
 * no way left to tell which of the others were read off a page.
 * `data/sellthrough.ts` throws at module load if that list stops being
 * nine, which is a check doing precisely the job it was written for.
 *
 * REJECTED: a field on the Sanrio record. The bridge argument wanted to
 * live on the licence itself, as an origin note or a Japanese flag. The
 * `Licence` type refuses extra fields for a stated reason: every other
 * field on that record was read off a published page, so anything
 * sitting beside them inherits the look of having been published too. An
 * argument about why Sanrio matters to this employer is not a published
 * fact. It lives out here instead, in its own shape, badged for what it
 * is.
 *
 * REJECTED: naming anime and game properties as market colour. It is
 * permitted to say what an anime led floor typically carries, and any
 * reader could name five of them faster than this file could. They are
 * absent anyway. The names would print inches from nine real published
 * licences on the same screen, and the ten second read of a property
 * name sitting next to a licence list is that it is a licence. The gap
 * is stated in words instead. Words cannot be misread as inventory.
 *
 * ── WHAT IS KEPT ──────────────────────────────────────────────────
 *
 * Sanrio, which is the one Japanese property on the published list and
 * therefore the only honest bridge available. It is argued as a bridge
 * and never as a substitute for the category that is missing, because a
 * bridge that is described as a floor is just a longer way of lying.
 *
 * Every line below is `modeled`. It is an argument built on top of the
 * nine public names above, and an argument is not a source.
 */
export const ANIME_GAP: LicenceGap = {
  postingLine:
    "Incorporate culturally relevant and trending anime/game properties into product offerings.",
  postingCite:
    "DIME Industries, Irvine. Sales Performance Analyst / Senior Manager",

  bridgeLicenceId: "sanrio",
  japaneseLicenceIds: ["sanrio"],

  /* Empty on purpose. The count on screen is read off this array, so the
     zero a reader sees is the data speaking rather than a digit typed
     into the markup that somebody has to remember to keep true. */
  animeOrGameLicenceIds: [],

  reach: [
    {
      id: "eight-and-one",
      heading: "Nine properties, and exactly one of them is Japanese",
      body: "Eight of the nine are American properties. Sanrio is the ninth, and on a list assembled for North American retail doors it is the only one whose owner is a Japanese company.",
      provenance: "modeled",
    },
    {
      id: "bridge",
      heading: "Sanrio is the bridge, and it is a real one",
      body: "A current, globally licensed Japanese character company, already named on a page a supplier publishes. For a Japanese owned operator it is the one name on this list that needs no introduction, and it is the name that makes the other eight worth a meeting rather than a polite no.",
      provenance: "modeled",
    },
    {
      id: "bridge-limit",
      heading: "A bridge is not a floor",
      body: "Sanrio opens a conversation with a buyer who already knows the name. It does not stock an arcade led by anime and game properties, and nobody should read it as though it did. No property on this page carries approval for any promotion.",
      provenance: "modeled",
    },
  ],

  shortfall: [
    {
      id: "none-held",
      heading: "No anime property and no game property is on this register",
      body: "Not one. No source read for this application publishes an anime or game licence held by anybody Jay has a connection to, so none is seeded, none is claimed and none is hinted at.",
      provenance: "modeled",
    },
    {
      id: "against-this-floor",
      heading: "Against this particular floor that is a real gap",
      body: "DIME sells an arcade led by anime and game properties. Nine Western family licences plus one Japanese character brand do not serve that floor, and a candidate who says otherwise is telling a buyer something the buyer already knows to be untrue.",
      provenance: "modeled",
    },
    {
      id: "no-names",
      heading: "No anime or game property is named on this screen at all",
      body: "Not even as an example of what the category looks like. A property name printed beside a published licence list reads as a licence to anybody scanning for ten seconds, and the nine above are worth more than the illustration would have been.",
      provenance: "modeled",
    },
  ],

  route: [
    {
      id: "ask-the-open-question",
      heading: "Ask the question already open on the register",
      body: "The one supplier connection here has an unanswered question against it: which of the published properties can be scheduled to a family entertainment venue rather than a retail door. That is the first call, and it is about the nine rather than about anything not on the list.",
      provenance: "modeled",
    },
    {
      id: "new-licensor",
      heading: "Treat the category as a new licensor, not an extension",
      body: "Nothing on this page reaches an anime or game property. Closing that means a licensor who is not on this list, which is a new agreement, a new approval route and new artwork rather than a line added to a register.",
      provenance: "modeled",
    },
    {
      id: "buy-from-the-holder",
      heading: "Buy the category from whoever actually holds it",
      body: "A supplier who does not hold a property cannot sell it, whatever else they make well. Keeping those two facts apart on one screen is most of what a register is for.",
      provenance: "modeled",
    },
    {
      id: "machinery-exists",
      heading: "The buying machinery is already built and is property agnostic",
      body: "Sell-through per property, the licensor report, purchase orders, invoices and contract terms all run on whatever licence is put into them. What is missing here is the licence, not the ability to plan, buy and report against one.",
      provenance: "modeled",
    },
  ],

  notClaimed: [
    "No agreement between DIME and any licensor named on this page.",
    "No anime or game licence held, sourceable, quoted or in discussion by anybody named here.",
    "No licensor contact, royalty rate, minimum order, lead time, factory or country of manufacture. No source read publishes any of them.",
    "No anime or game property name anywhere on this screen, by choice rather than by oversight.",
    "Japanese and English fluency is the posting's other question. It is a fact about a person rather than something software can demonstrate.",
  ],
};

/**
 * The twenty four retailers the same page names.
 *
 * Kept as plain strings rather than modelled, because nothing in this
 * application does anything with them except quote them. They are
 * evidence of scale, not a data set.
 */
export const NATURES_MARK_RETAIL_PARTNERS: string[] = [
  "Costco",
  "Sam's Club",
  "BJ's",
  "PriceSmart",
  "The Home Depot",
  "Lowe's",
  "Menards",
  "Rona",
  "Canadian Tire",
  "Kroger",
  "Aldi",
  "Walgreens",
  "CVS",
  "TJX",
  "Target",
  "Walmart",
  "Dollar General",
  "Five Below",
  "Hobby Lobby",
  "Michaels",
  "Macy's",
  "Amazon",
  "Wayfair",
  "Cracker Barrel",
];

const ALL_LICENCES = LICENCES.map((l) => l.id);

export const PARTNERS: Partner[] = [
  {
    id: "natures-mark",
    name: "Nature's Mark",
    kind: "manufacturing",
    supplies:
      "Licensed seasonal and home décor at retail volume. Plush, collectibles, housewares, candles.",
    licenceIds: ALL_LICENCES,
    approval: "not-submitted",
    leadTimeDays: 120,
    minimumOrderQty: 2400,
    minimumOrderUnit: "units per style",
    state: "in-talks",
    lastWorked: "2026-08-11",
    nextAction:
      "Ask which of the nine properties can be scheduled to a family entertainment venue rather than a retail door.",
    region: "Not published. Their pages name no facility and no country.",
    source: NATURES_MARK_SOURCE,
    provenance: "public",
    note: "A connection Jay holds. There is no agreement between DIME and Nature's Mark, and none between DIME and any licensor on this list. Capability, not a deal.",
  },
  {
    id: "pacific-rim-plush",
    name: "Pacific Rim Plush Works",
    kind: "manufacturing",
    supplies:
      "Unlicensed plush at prize-wall tiers. Second source, used to hold the wall when a licensed run slips.",
    licenceIds: [],
    approval: "not-submitted",
    leadTimeDays: 95,
    minimumOrderQty: 1500,
    minimumOrderUnit: "units per style",
    state: "sampling",
    lastWorked: "2026-08-04",
    nextAction:
      "Judge the second sample set against the first on seam and fill before any purchase order is raised.",
    region: "Overseas, shipped through Long Beach",
    provenance: "illustrative",
    note: "A second source exists so that one factory slipping is a delay rather than an empty wall.",
  },
  {
    id: "delta-toy",
    name: "Delta Toy Manufacturing",
    kind: "manufacturing",
    supplies:
      "Moulded novelty and small collectibles. Quoted, never ordered from.",
    licenceIds: [],
    approval: "not-submitted",
    leadTimeDays: 110,
    minimumOrderQty: 5000,
    minimumOrderUnit: "units per mould",
    state: "prospect",
    lastWorked: "2026-06-19",
    nextAction:
      "Ask for a tooling quote and a first-article timeline before committing to a mould nobody has seen.",
    region: "Overseas, shipped through Long Beach",
    provenance: "illustrative",
    note: "The scouting half of the register. A supplier list with no prospects on it is a list that has stopped looking.",
  },
  {
    id: "long-beach-import",
    name: "Long Beach Import Desk",
    kind: "logistics",
    supplies:
      "Freight forwarding, customs entry and a bonded pallet position until stock is called forward.",
    licenceIds: [],
    approval: "not-submitted",
    leadTimeDays: 21,
    minimumOrderQty: 1,
    minimumOrderUnit: "container",
    state: "active",
    lastWorked: "2026-08-10",
    nextAction:
      "Confirm the September sailing before the plush order is released, or the lead time is academic.",
    region: "Long Beach, CA",
    provenance: "illustrative",
    note: "Every manufacturing lead time in this register assumes this row does its job. That dependency is why it is a partner rather than a line on an invoice.",
  },
  {
    id: "county-line-litho",
    name: "County Line Litho",
    kind: "print",
    supplies:
      "Table tents, redemption vouchers, entry tickets, birthday inserts. Short run, fast turn.",
    licenceIds: [],
    approval: "not-submitted",
    leadTimeDays: 6,
    minimumOrderQty: 500,
    minimumOrderUnit: "pieces",
    state: "active",
    lastWorked: "2026-08-12",
    nextAction:
      "Hold a press slot for the opening-week voucher run before the date is public and everybody wants one.",
    region: "Orange County, CA",
    provenance: "illustrative",
  },
  {
    id: "grad-night-print",
    name: "Grad Night Print Bureau",
    kind: "print",
    supplies:
      "Wristbands, lanyards and event passes at school-event volume.",
    licenceIds: [],
    approval: "not-submitted",
    leadTimeDays: 12,
    minimumOrderQty: 1000,
    minimumOrderUnit: "pieces",
    state: "lapsed",
    lastWorked: "2026-03-27",
    nextAction:
      "Call before the spring window opens. Four months of silence is a relationship, not a supplier.",
    region: "Inland Empire, CA",
    provenance: "illustrative",
    note: "Kept on the register rather than deleted. A lapsed supplier with a working price list is worth more than a new quote in April.",
  },
  {
    id: "freeway-sign",
    name: "Freeway Sign Works",
    kind: "signage",
    supplies:
      "Banners, window graphics, lane cards and A-frames. Priced by the square foot, installed on site.",
    licenceIds: [],
    approval: "not-submitted",
    leadTimeDays: 9,
    minimumOrderQty: 1,
    minimumOrderUnit: "piece",
    state: "active",
    lastWorked: "2026-08-07",
    nextAction:
      "Get the licensed artwork sizes agreed before the promotion is booked, not after.",
    region: "Irvine and Lakewood, CA",
    provenance: "illustrative",
  },
  {
    id: "ticket-wall-supply",
    name: "Ticket Wall Supply Co",
    kind: "prize-redemption",
    supplies:
      "The redemption counter end to end. Low-tier novelty by the case, mid-tier at pallet quantities.",
    licenceIds: [],
    approval: "not-submitted",
    leadTimeDays: 14,
    minimumOrderQty: 24,
    minimumOrderUnit: "cases",
    state: "active",
    lastWorked: "2026-08-12",
    nextAction:
      "Reorder the two lines that are inside their lead time on weeks of cover.",
    region: "City of Industry, CA",
    provenance: "illustrative",
  },
  {
    id: "novelty-case-direct",
    name: "Novelty Case Direct",
    kind: "prize-redemption",
    supplies:
      "Light-up and sound novelty at the bottom two ticket tiers. The volume driver on the wall.",
    licenceIds: [],
    approval: "not-submitted",
    leadTimeDays: 18,
    minimumOrderQty: 36,
    minimumOrderUnit: "cases",
    state: "contracted",
    lastWorked: "2026-07-30",
    nextAction:
      "Signed and nothing ordered against it. Raise the first purchase order or the terms were negotiated for nothing.",
    region: "City of Industry, CA",
    provenance: "illustrative",
    note: "A signature doing no work. This is the state a register exists to make visible.",
  },
  {
    id: "party-stock-wholesale",
    name: "Party Stock Wholesale",
    kind: "prize-redemption",
    supplies:
      "Foil balloons, table kits and party consumables at wholesale case pricing.",
    licenceIds: [],
    approval: "not-submitted",
    leadTimeDays: 8,
    minimumOrderQty: 12,
    minimumOrderUnit: "cases",
    state: "prospect",
    lastWorked: "2026-05-15",
    nextAction:
      "Get a case price list and compare against the current birthday consumable cost per head.",
    region: "Santa Fe Springs, CA",
    provenance: "illustrative",
  },
  {
    id: "lane-six-apparel",
    name: "Lane Six Apparel",
    kind: "apparel",
    supplies:
      "Event tees, crew polos and caps. Screen and embroidery, sized runs.",
    licenceIds: [],
    approval: "not-submitted",
    leadTimeDays: 15,
    minimumOrderQty: 48,
    minimumOrderUnit: "pieces per design",
    state: "active",
    lastWorked: "2026-08-05",
    nextAction:
      "Fix the size curve off the last two runs before reordering, or the reorder buys another box of XS.",
    region: "Anaheim, CA",
    provenance: "illustrative",
  },
  {
    id: "crew-uniform-supply",
    name: "Crew Uniform Supply",
    kind: "apparel",
    supplies: "Uniform programme, replenished on a standing order.",
    licenceIds: [],
    approval: "not-submitted",
    leadTimeDays: 22,
    minimumOrderQty: 24,
    minimumOrderUnit: "pieces per size",
    state: "on-hold",
    lastWorked: "2026-07-22",
    nextAction:
      "Hold stays until the colourfastness claim on the June delivery is settled.",
    region: "Los Angeles, CA",
    provenance: "illustrative",
    note: "On hold is a decision and it is recorded as one. A supplier that quietly stops being used is a supplier nobody ever resolves.",
  },
  {
    id: "valley-catering",
    name: "Valley Catering Group",
    kind: "catering",
    supplies:
      "Brought-in catering for what the kitchen does not cover. Dietary sets, platters, dessert stations.",
    licenceIds: [],
    approval: "not-submitted",
    leadTimeDays: 4,
    minimumOrderQty: 25,
    minimumOrderUnit: "covers",
    state: "active",
    lastWorked: "2026-08-09",
    nextAction:
      "Agree the cancellation window in writing before the corporate season, not during it.",
    region: "Fullerton, CA",
    provenance: "illustrative",
  },
];

export const PARTNER_BY_ID: Record<string, Partner> = Object.fromEntries(
  PARTNERS.map((p) => [p.id, p]),
);
