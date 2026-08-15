import type { Licence, Partner } from "@/domain/licensing";

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
 * descriptive trade name rather than the name of a real Brea business,
 * for a reason worth stating plainly: a real local printer appearing in a
 * work sample with an invented invoice against it would be a claim about
 * that printer's business. Real local organisations live in
 * `prospects.ts`, and they are there because they are prospects rather
 * than because somebody owes them money.
 *
 * ── THE FRAMING RULE, WHICH IS THE POINT OF THE WHOLE FILE ────────
 * What is true: Nature's Mark publishes those licences, and Jay has a
 * connection to Nature's Mark. What is NOT true and is claimed nowhere:
 * that Main Event has an agreement with any licensor named here, that
 * Round1 does, or that Nature's Mark manufactures in any particular
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
 * than a figure: what a bowling, arcade and laser tag venue would
 * plausibly do with the property. It carries no number, so it carries no
 * badge.
 */
export const LICENCES: Licence[] = [
  {
    id: "disney",
    name: "Disney",
    source: NATURES_MARK_SOURCE,
    provenance: "public",
    onPartnersPage: true,
    fitNote:
      "The broadest family property on the list. Works on the prize wall at every ticket tier and on a birthday package insert.",
  },
  {
    id: "peanuts",
    name: "Peanuts",
    source: NATURES_MARK_SOURCE,
    provenance: "public",
    onPartnersPage: true,
    fitNote:
      "Seasonal rather than year round. A Halloween and Christmas property, which suits a promotional calendar built around two quarters.",
  },
  {
    id: "sanrio",
    name: "Sanrio",
    source: NATURES_MARK_SOURCE,
    provenance: "public",
    onPartnersPage: true,
    fitNote:
      "The strongest teen and young adult property on the list, and the one that moves plush at the top ticket tier.",
  },
  {
    id: "warner-bros",
    name: "Warner Bros.",
    source: NATURES_MARK_SOURCE,
    provenance: "public",
    onPartnersPage: true,
    fitNote:
      "A studio rather than a single property, so the usable characters depend entirely on what the agreement schedules.",
  },
  {
    id: "rudolph",
    name: "Rudolph",
    source: NATURES_MARK_SOURCE,
    provenance: "public",
    onPartnersPage: true,
    fitNote:
      "One season and one season only. Ordered in spring for a December that sells out in three weeks or does not sell at all.",
  },
  {
    id: "paramount",
    name: "Paramount",
    source: NATURES_MARK_SOURCE,
    provenance: "public",
    onPartnersPage: true,
    fitNote:
      "Release driven. Value tracks the studio's calendar rather than the venue's, which makes lead time the binding constraint.",
  },
  {
    id: "coca-cola",
    name: "Coca-Cola",
    source: NATURES_MARK_SOURCE,
    provenance: "public",
    onPartnersPage: true,
    fitNote:
      "The one property here that touches the bar and the restaurant rather than the prize wall. Glassware, cups, tin signage.",
  },
  {
    id: "precious-moments",
    name: "Precious Moments",
    source: NATURES_MARK_SOURCE,
    provenance: "public",
    onPartnersPage: true,
    fitNote:
      "Gift rather than prize. Fits a corporate thank-you or a fundraiser raffle far better than a redemption counter.",
  },
  {
    id: "sesame-street",
    name: "Sesame Street",
    source: NATURES_MARK_SOURCE,
    provenance: "public",
    onPartnersPage: true,
    fitNote:
      "Under sevens. The narrowest age band on the list and the one that matches a weekday morning birthday package.",
  },
  {
    id: "harry-potter",
    name: "Harry Potter",
    source: NATURES_MARK_ROOT,
    provenance: "public",
    onPartnersPage: false,
    fitNote:
      "Named on the Nature's Mark root page and not on its partners page. Treated as a lead to confirm rather than a licence to plan against.",
  },
];

export const LICENCE_BY_ID: Record<string, Licence> = Object.fromEntries(
  LICENCES.map((l) => [l.id, l]),
);

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
    note: "A connection Jay holds. There is no agreement between Main Event and Nature's Mark, and none between Main Event and any licensor on this list. Capability, not a deal.",
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
    region: "Brea and Fullerton, CA",
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
