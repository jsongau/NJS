import type { Provenance } from "@/domain/types";

/**
 * Experiential and field marketing.
 *
 * WHY THIS FILE EXISTS AT ALL, given the app is a territory planner. The
 * brief for this role names "experiential/field marketing" as one of the
 * five touchpoints a CRM strategy has to span, and an application that
 * ignores it is answering four fifths of the question. But bolting an
 * events calendar onto a selling tool would be exactly the sort of
 * dashboard that displays numbers and asks for no decision.
 *
 * THE ARGUMENT THIS MAKES INSTEAD. A festival does not sell product. It
 * cannot: in California a supplier pouring at an event is sampling, not
 * retailing, and the money changes hands somewhere else entirely. What a
 * festival does is create three thousand people who now know what
 * Blackberry moonshine tastes like, standing within a mile of four
 * liquor stores that may or may not have it on the shelf.
 *
 * So the unit of measurement for an activation is NOT samples poured or
 * impressions delivered. It is depletion in the accounts around the
 * site, in the fortnight after. That reframing is the whole point of
 * this file, and it is why an activation here is a geographic object
 * that reaches into the account list rather than a row in a calendar.
 *
 * It is also why field marketing belongs to a CRM director rather than
 * to events: the activation produces two assets, a crowd and a set of
 * consented contacts, and only one of them is measurable today.
 *
 * EVERY EVENT BELOW IS MODELED. The sites are real places in the
 * territory; the dates, attendance and permits are invented and marked
 * as such. Nothing here claims Ole Smoky has booked anything.
 */

export type ActivationKind =
  /** A public festival or fair. Sampling under an event permit. */
  | "festival"
  /** A tasting inside a retail account. The rules are strictest here. */
  | "in-store-tasting"
  /** A bar or restaurant takeover. Trade audience as much as consumer. */
  | "on-premise-night"
  /** Sponsorship of a venue or team, with an activation footprint. */
  | "sponsorship";

export interface Activation {
  id: string;
  name: string;
  kind: ActivationKind;
  /** Where the crowd is. Everything else is derived from this point. */
  lat: number;
  lng: number;
  venue: string;
  city: string;
  startDate: string;
  endDate: string;
  /** Modeled attendance across the whole window. */
  attendance: number;
  /** Brands being poured. Drives which accounts count as ready. */
  brandIds: string[];
  /** Ambassadors on the ground. Drives capture capacity. */
  ambassadors: number;
  /**
   * The radius, in miles, inside which a retail account is close enough
   * that somebody who tasted here could plausibly buy there this week.
   *
   * ONE MILE IS NOT A ROUND NUMBER PICKED FOR TIDINESS. It is walking
   * distance in a dense LA corridor and a two-minute drive everywhere
   * else, and it is deliberately tighter than the five or ten miles an
   * agency would claim, because a wider radius flatters the report and
   * tells a rep to visit stores nobody at the festival will ever enter.
   * A number chosen to make the activation look good is a number that
   * makes the next activation worse.
   */
  catchmentMiles: number;
  /** What legally permits the pour. Named, not assumed. */
  permit: string;
  provenance: Provenance;
  note: string;
}

export const ACTIVATIONS: Activation[] = [
  {
    id: "industry-hills-summer",
    name: "Summer Nights, Industry Hills",
    kind: "festival",
    lat: 34.0206,
    lng: -117.9426,
    venue: "Industry Hills Expo Center",
    city: "City of Industry",
    startDate: "2026-08-21",
    endDate: "2026-08-23",
    attendance: 18_400,
    brandIds: ["apple-pie", "blackberry", "sparkling-lemonade"],
    ambassadors: 6,
    catchmentMiles: 1.0,
    permit:
      "California ABC Type 86 instructional tasting is NOT this. A festival pour runs on the event's own licence or a daily on-sale general permit held by the organiser, with the supplier present as a brand representative. The distinction matters: the supplier does not sell, does not take money, and does not staff a retailer's till.",
    provenance: "modeled",
    note: "Three days, eighteen thousand people, and four retail accounts inside a mile — including Total Wine, which is the one that can actually convert a taste into a bottle.",
  },
  {
    id: "totalwine-tasting",
    name: "Saturday tasting, Total Wine",
    kind: "in-store-tasting",
    /*
      An in-store tasting is not near an account, it IS one. These are
      Total Wine's own coordinates from coordinates.ts rather than a
      separately invented point — two records of the same place typed in
      two files is how a venue ends up a mile from itself.
    */
    lat: 33.9902,
    lng: -117.9186,
    venue: "Total Wine & More",
    city: "City of Industry",
    startDate: "2026-08-15",
    endDate: "2026-08-15",
    attendance: 340,
    brandIds: ["tn-bourbon", "salty-caramel"],
    ambassadors: 2,
    catchmentMiles: 0.25,
    permit:
      "Instructional tasting inside a licensed off-sale premises. The supplier furnishes product and a representative; the RETAILER controls the service, and the supplier may not pay the retailer for the space, the labour, or any expense incidental to it. 27 CFR 6.84 and California B&P 25503.",
    provenance: "modeled",
    note: "The highest-converting activation in the estate and the most legally constrained. Somebody who tastes a bourbon standing eight feet from the shelf it sits on has almost no distance left to travel.",
  },
  {
    id: "rowland-heights-night",
    name: "Distillery night, Rowland Heights",
    kind: "on-premise-night",
    lat: 33.9805,
    lng: -117.8990,
    venue: "Independent on-premise account",
    city: "Rowland Heights",
    startDate: "2026-09-04",
    endDate: "2026-09-04",
    attendance: 210,
    brandIds: ["mango-habanero", "hunch-punch", "original-shine"],
    ambassadors: 2,
    catchmentMiles: 0.75,
    permit:
      "On-premise brand night. The account serves; the supplier's representative may host and educate. Trade employees and their families are excluded from any consumer prize element under 27 CFR 6.96(b).",
    provenance: "modeled",
    note: "The audience here is half consumer and half trade — bar staff who will recommend the pour for the next six months are worth more than the two hundred people drinking it tonight.",
  },
  {
    id: "diamond-bar-fair",
    name: "Diamond Bar Autumn Fair",
    kind: "festival",
    lat: 33.9982,
    lng: -117.8148,
    venue: "Diamond Bar Center",
    city: "Diamond Bar",
    startDate: "2026-09-19",
    endDate: "2026-09-20",
    attendance: 7_600,
    brandIds: ["moonshine-cherries", "apple-pie"],
    ambassadors: 4,
    catchmentMiles: 1.0,
    permit:
      "Event organiser's daily licence. Supplier present as brand representative, pouring measured samples only.",
    provenance: "modeled",
    note: "Smaller crowd, but it sits between Albertsons and H Mart — a genuinely dense catchment rather than a field with a car park.",
  },
];

export const ACTIVATION_BY_ID = Object.fromEntries(
  ACTIVATIONS.map((a) => [a.id, a]),
) as Record<string, Activation>;

export const ACTIVATION_KIND: Record<
  ActivationKind,
  { label: string; glyph: string; what: string }
> = {
  festival: {
    label: "Festival",
    glyph: "▲",
    what: "Public event under the organiser's licence. Biggest crowd, loosest attribution.",
  },
  "in-store-tasting": {
    label: "In-store tasting",
    glyph: "●",
    what: "Inside a licensed retailer. Smallest crowd, shortest distance to a purchase, tightest rules.",
  },
  "on-premise-night": {
    label: "On-premise night",
    glyph: "◐",
    what: "A bar or restaurant. Half consumer audience, half trade education.",
  },
  sponsorship: {
    label: "Sponsorship",
    glyph: "◆",
    what: "A venue or team relationship with an activation footprint attached.",
  },
};

/**
 * Ambassador recaps.
 *
 * THE RECAP IS THE ONLY THING THAT MAKES AN ACTIVATION A DATA SOURCE,
 * and it is the thing that never gets filed. An event with no recap
 * produced a crowd, a cost, and nothing anybody can act on — which is
 * why field budgets are the first killed in a bad quarter and why the
 * defence is always anecdotal.
 *
 * `samplesPoured` is not vanity. Product used at a sampling event comes
 * off the books and has to be accounted for, so this figure is an
 * inventory record before it is a marketing one.
 *
 * `contactsCaptured` against `attendance` is the capture rate, and it is
 * the number a CRM director owns. Everything else on this record belongs
 * to somebody else.
 */
export interface Recap {
  activationId: string;
  filed: boolean;
  filedAt: string | null;
  ambassador: string;
  samplesPoured: number | null;
  contactsCaptured: number | null;
  /** Verbatim, because a sentence from the floor beats a survey. */
  heardOnTheFloor: string | null;
  /** What the rep should do next, in the accounts around the site. */
  followUp: string | null;
}

export const RECAPS: Recap[] = [
  {
    activationId: "totalwine-tasting",
    filed: true,
    filedAt: "2026-08-15",
    ambassador: "Ambassador 2",
    samplesPoured: 288,
    contactsCaptured: 74,
    heardOnTheFloor:
      "Four separate people asked whether the bourbon was the same company as the jars. They did not know Ole Smoky made a straight bourbon.",
    followUp:
      "The bourbon is shelved with the flavoured whiskey here, not in the Tennessee set. That is a placement conversation, not a distribution one.",
  },
  {
    activationId: "industry-hills-summer",
    filed: false,
    filedAt: null,
    ambassador: "Ambassador 1",
    samplesPoured: null,
    contactsCaptured: null,
    heardOnTheFloor: null,
    followUp: null,
  },
  {
    activationId: "rowland-heights-night",
    filed: false,
    filedAt: null,
    ambassador: "Ambassador 4",
    samplesPoured: null,
    contactsCaptured: null,
    heardOnTheFloor: null,
    followUp: null,
  },
];

export const RECAP_BY_ACTIVATION = Object.fromEntries(
  RECAPS.map((r) => [r.activationId, r]),
) as Record<string, Recap>;
