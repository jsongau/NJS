import type { EventPackage, Provenance } from "@/domain/types";
import { LANE_ORDER } from "@/domain/lanes";

/*
  The family reading order is re-exported from the vocabulary rather than
  declared here. It used to be declared in both places, which is two
  files with an opinion about the order of five values, and the cost of
  that shows up the first time one of them changes.
*/
export { PACKAGE_FAMILY_ORDER } from "@/domain/vocabulary";

/**
 * What DIME publishes about group business, and nothing else.
 *
 * EVERY FIELD IN THIS FILE WAS READ OFF ROUND1USA.COM AND CARRIES THE URL
 * IT WAS READ FROM. Where DIME withholds a figure the field is null and
 * its provenance is "withheld" rather than an estimate wearing a
 * number's clothes.
 *
 * THE WHOLE CATALOGUE IS THE FINDING, BECAUSE THE WHOLE CATALOGUE IS ONE
 * ROW. DIME publishes exactly one named group offering, the All
 * Inclusive Party, it publishes what is in it, and it publishes no price
 * for it at all. The page asks the reader to contact the venue. The
 * party room page publishes no price, no capacity, no hourly rate, no
 * minimum spend and no booking notice either.
 *
 * So the priced half of this file is empty and the gated half holds
 * everything there is: one package of one. That is not missing research.
 * It is the shape of the commercial gate, and the person who stands at
 * that gate is the person this console was built for.
 *
 * This file previously held a competitor's published catalogue, read off
 * that competitor's own site, and it has been removed rather than
 * rewritten. A competitor's price sitting in a file named packages.ts is
 * one careless glance away from being read as DIME's. The competitive
 * comparison lives in `data/rivals.ts`, where every figure carries the
 * operator that published it.
 */

const SRC = {
  bookAParty: "https://www.dimeindustries.com/book-a-party",
  partyRoom: "https://www.dimeindustries.com/activities-list/partyroom",
} as const;

/**
 * The booking terms DIME actually publishes.
 *
 * ONE NUMBER SURVIVES THE READ. Changes to a booked party require three
 * or more days notice, and that is the only timing figure on either
 * page. No minimum booking notice is published, and no deposit
 * percentage is published anywhere.
 *
 * The nulls are kept as fields rather than dropped so that every screen
 * that wants to talk about deposits and notice periods has somewhere
 * honest to point. A missing key reads as an oversight; a null with a
 * provenance of "withheld" reads as the finding it is.
 */
export const STANDARD_TERMS = {
  /** Published verbatim: changes require 3 or more days notice. */
  changeNoticeDays: 3,
  /** Not published. DIME states no minimum booking notice. */
  bookingNoticeDays: null,
  /** Not published. DIME states no deposit percentage. */
  depositPercent: null,
  note: "DIME publishes one booking term for the All Inclusive Party: changes require 3 or more days notice. No minimum booking notice and no deposit are published, on the party page or on the party room page.",
  source: SRC.bookAParty,
  provenance: {
    changeNoticeDays: "public",
    bookingNoticeDays: "withheld",
    depositPercent: "withheld",
  } as Record<string, Provenance>,
} as const;

/**
 * A commercial figure and the operator's decision about publishing it.
 *
 * MAKES AN ABSENCE RENDERABLE. A screen cannot show a number that does
 * not exist, but it can show that the number does not exist, name the
 * page it is not on, and say who would have to be asked for it. That is
 * a stronger line on a page than a blank, and it is the only version of
 * these figures that is true.
 */
export interface GroupFigure {
  id: string;
  /** What the figure would be, if it were published. */
  what: string;
  /** Null wherever the operator withholds it. There is no fallback. */
  value: number | null;
  provenance: Provenance;
  note: string;
  source: string;
}

/**
 * Everything a group buyer asks for on the first call and cannot look up.
 *
 * This list is the agenda for the first conversation, in order, and it
 * is also the answer to "why does this role exist". Each row is a
 * question the website refuses, which means each row is a reason a human
 * being picks up the phone.
 */
export const WITHHELD_GROUP_FIGURES: GroupFigure[] = [
  {
    id: "party-price-per-guest",
    what: "Price per guest for the All Inclusive Party",
    value: null,
    provenance: "withheld",
    note: "The package page lists every inclusion and no price. It directs the reader to contact the venue.",
    source: SRC.bookAParty,
  },
  {
    id: "food-minimum-per-guest",
    what: "Minimum food spend per guest",
    value: null,
    provenance: "withheld",
    note: "No food floor, no per-person minimum and no banquet rate is published. Pizza and soda are named as included and nothing is costed.",
    source: SRC.bookAParty,
  },
  {
    id: "party-room-capacity",
    what: "Party room capacity",
    value: null,
    provenance: "withheld",
    note: "The party room page describes the room and publishes no capacity.",
    source: SRC.partyRoom,
  },
  {
    id: "party-room-hourly-rate",
    what: "Party room hourly rate",
    value: null,
    provenance: "withheld",
    note: "No hourly rate and no room rental fee are published.",
    source: SRC.partyRoom,
  },
  {
    id: "party-room-minimum-spend",
    what: "Party room minimum spend",
    value: null,
    provenance: "withheld",
    note: "No minimum spend is published.",
    source: SRC.partyRoom,
  },
  {
    id: "booking-notice-days",
    what: "Minimum booking notice",
    value: null,
    provenance: "withheld",
    note: "Only a change notice is published, at 3 or more days. How far ahead a party must be booked in the first place is not stated.",
    source: SRC.bookAParty,
  },
  {
    id: "vip-immersive-lane-fee",
    what: "The VIP Immersive Lane add-on fee",
    value: null,
    provenance: "withheld",
    note: "Published as available at a separate fee. The fee itself is not published.",
    source: SRC.bookAParty,
  },
  {
    id: "spocha-party-price",
    what: "Price for a Spo-cha party or a party including other amenities",
    value: null,
    provenance: "withheld",
    note: "Published as sold separately, with no further detail of any kind.",
    source: SRC.bookAParty,
  },
];

export const WITHHELD_GROUP_FIGURE_BY_ID: Record<string, GroupFigure> =
  Object.fromEntries(WITHHELD_GROUP_FIGURES.map((f) => [f.id, f]));

export const PACKAGES: EventPackage[] = [
  {
    id: "all-inclusive-party",
    name: "All Inclusive Party",
    family: "corporate",
    inclusions: [
      "Arcade Time-Play",
      "Bowling / Shoe Rental",
      "Karaoke / Party Room",
      "Billiards / Ping Pong",
      "Pizza & Soda",
      "Group Photo",
      "Optional VIP Immersive Lane, at a separate fee",
    ],
    minGuests: null,
    maxGuests: null,
    pricePerGuest: null,
    priceNote:
      "No price is published. The page lists what is included and asks the reader to contact the venue. Changes require 3 or more days notice. Spo-cha parties and parties including other amenities are sold separately, with no further detail published.",
    dayParts: ["any"],
    dayPartNote:
      "No day part restriction is published, so this package is shown as available at any hour rather than as a weekday lever. If a restriction exists it is quoted by a person, which is the same gate as the price.",
    /*
      `lanesPerTwentyGuests` IS DELIBERATELY ABSENT. No lane ratio is
      published, for this package or for any DIME location, so setting
      it to a competitor's figure would make every capacity number
      downstream arithmetic about somebody else's building.

      `laneFit` is read off LANE_ORDER rather than typed out, so a tenth
      lane is covered on the day it is added. There is one package and
      the operator describes it by contents rather than by audience, so
      there is no published basis for excluding anybody from it and
      inventing one would be a rule nobody has written.
    */
    laneFit: [...LANE_ORDER],
    source: SRC.bookAParty,
    provenance: {
      pricePerGuest: "withheld",
      inclusions: "public",
      minGuests: "withheld",
      maxGuests: "withheld",
    },
  },
];

export const PACKAGE_BY_ID: Record<string, EventPackage> = Object.fromEntries(
  PACKAGES.map((p) => [p.id, p]),
);

/**
 * Packages DIME publishes a price for.
 *
 * Empty, and it is meant to be. A screen that renders this list renders
 * nothing, which is the most accurate thing it can do.
 */
export const PRICED_PACKAGES = PACKAGES.filter((p) => p.pricePerGuest !== null);

/**
 * Packages gated behind a person. The reason the role exists.
 *
 * One of one. The original version of this file made the same argument
 * across a partial catalogue and had to explain which half it meant.
 * Here there is no half to explain.
 */
export const GATED_PACKAGES = PACKAGES.filter((p) => p.pricePerGuest === null);
