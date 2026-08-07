/**
 * Merchandising kits, and the rule that governs them.
 *
 * WHAT THIS ADDS. The app already knew what a promotion was worth and
 * what it asked an account to do. It did not know what physically ships
 * to make that happen, and "programming" in this trade means a calendar
 * of windows with a kit attached to each one — not a single allowance.
 *
 * THE RULE, AND IT IS THE INTERESTING PART. Under 27 CFR 6.84 an industry
 * member MAY furnish a retailer with point of sale advertising materials
 * and consumer advertising specialties. The conditions are specific and
 * they are what make this data model interesting rather than decorative:
 *
 *   - The material must bear "conspicuous and substantial advertising
 *     matter about the product or the industry member which is
 *     permanently inscribed or securely affixed." Unbranded fixtures are
 *     not advertising material.
 *   - The industry member "may not directly or indirectly pay or credit
 *     the retailer for using or distributing these materials or for any
 *     expense incidental to their use."
 *
 * That second condition is the sharp one, and it is why every item below
 * carries `placedBy` and why that field cannot say "the store". The
 * labour of building a stack, dressing a back bar or refilling a counter
 * unit is borne by the wholesaler's rep or by mine, and it is never
 * reimbursed to the account. You may hand a manager the case card. You
 * may not pay them to put it up. A merchandising plan that quietly funds
 * "display labor" at retail is describing a thing-of-value problem, and
 * it is the single easiest way for a well-meaning program to become a
 * trade practice violation.
 *
 * WHY THERE IS NO PALLET ANYWHERE ON THIS PAGE. This roster is twelve
 * off-premise accounts — independent bottle shops, a neighbourhood
 * market, two counter-trade stores and one category specialist — and
 * fifteen bars, dining rooms and one bowling house. Not one of them has
 * a pallet position, because not one of them has an aisle wide enough to
 * lose. A programme written in pallets is a programme written for a
 * different roster, and the merchandising it asks for would arrive,
 * be looked at, and go in the back room. So the units here are the ones
 * these accounts actually execute: a counter unit, a shelf block, a
 * six-case stack at the end of a counter run, a back-bar face, a table
 * tent, a menu insert, a card that rides out to a lane.
 *
 * WHY THE ON-PREMISE HALF IS TIGHTER, NOT LOOSER. At a bar the thing a
 * supplier most wants is the thing that costs the account money to give
 * — a face on the lit shelf, a line on the printed menu, a bartender's
 * attention before doors. Buying any of those is a payment to a
 * retailer. Federal law says so at 27 CFR 6.84 and California says it
 * harder at B&P 25500 and 25502, which is why no kit below contains a
 * line that funds, reimburses, underwrites or shares the cost of
 * anything an account does. "We will cover your fight night" is the most
 * natural sentence a supplier could write to a sports bar and it is
 * unlawful in this state, so it is not written here and there is no
 * field that could hold it.
 *
 * Each kit therefore names the item that would have been the obvious ask
 * and marks it NOT PERMITTED, because the temptation is real and the
 * rule does not bend for it.
 *
 * Section 6.84 states no dollar limit. California layers its own rules on
 * top, and nothing here should be read as legal advice — the point of
 * modelling it is that a plan which cannot express the constraint cannot
 * respect it either.
 *
 * Source: 27 CFR 6.84, Point of sale advertising materials and consumer
 * advertising specialties. California B&P 25500 and 25502.
 */

export type PosKind =
  /** Stays in the store, advertises the product. Permitted, branded. */
  | "point-of-sale"
  /** Designed for the shopper to take away. Permitted, branded. */
  | "consumer-specialty"
  /** The thing product actually stands on. Branded shipper or shell. */
  | "display-vehicle";

export interface PosItem {
  name: string;
  kind: PosKind;
  /** What it is for, in one line a rep could repeat. */
  purpose: string;
  /** Who physically puts it up. Never the store, never reimbursed. */
  placedBy: "Southern Glazer's rep" | "Ole Smoky rep" | "Either";
}

export interface ProgramKit {
  promotionId: string;
  /** Brands the window is built around. */
  brandIds: string[];
  /** Channels where the kit actually fits. */
  channels: string[];
  items: PosItem[];
  /** What a rep should be able to see on their next pass. */
  looksLike: string;
}

export const PROGRAM_KITS: ProgramKit[] = [
  /*
   * NOT PERMITTED in this window: a per-store fee for the floor position
   * by the door, and paying an owner's own staff to build the stack and
   * keep it filled. Both are payment to a retailer for an expense
   * incidental to the use of the material. The shell ships free; the
   * labour is ours.
   *
   * The stack is specced at six cases and it is specced that way on
   * purpose. Six cases of 750ml jars is a waist-high block about two feet
   * square, which is the largest secondary display an independent bottle
   * shop in this territory can give up without losing a run of shelf. Ask
   * a store for more than it has and the honest answer is no; ask for
   * exactly what fits and the answer is usually yes for the full window.
   */
  {
    promotionId: "labor-day-2026",
    brandIds: ["original-shine", "apple-pie", "hunch-punch"],
    channels: ["Liquor store", "Neighbourhood market", "Beverage specialty"],
    looksLike:
      "A six-case block of 750ml jars at the end of the counter run, holding through the full window, with the flavour run on the shelf behind it full rather than gapped.",
    items: [
      {
        name: "Six-case stack shell",
        kind: "display-vehicle",
        purpose:
          "The thing the product stands on. Branded on all four panels, so it is advertising material rather than a fixture, and specced for twelve glass jars to a case in a footprint an independent will actually surrender.",
        placedBy: "Southern Glazer's rep",
      },
      {
        name: "Header card",
        kind: "point-of-sale",
        purpose:
          "Sits on top of the block at eye height. The only part of a floor display a shopper reads from the door.",
        placedBy: "Southern Glazer's rep",
      },
      {
        name: "Case cards",
        kind: "point-of-sale",
        purpose: "Slot into the stack face. Carry the flavour and the proof, which is the pair a spirits shopper actually decides on.",
        placedBy: "Either",
      },
      {
        name: "Shelf talker for the flavour run",
        kind: "point-of-sale",
        purpose:
          "Sends the shopper who stopped at the block back to the set, where the rest of the range is. A display that does not feed the shelf is a one-week sale.",
        placedBy: "Either",
      },
    ],
  },
  /*
   * NOT PERMITTED in this window: buying the counter position, and paying
   * a store to fit a lockable acrylic case for the minis. The case is a
   * fixture rather than advertising material, and fitting it is an expense
   * incidental to use — so the kit ships a branded counter unit the rep
   * places and takes away, and nothing changes hands.
   *
   * This is the one window where the forecourt and the walk-in store are
   * planned together with the bottle shops, because the counter is the
   * same three feet of space in all three. A fuel forecourt carries
   * spirits as an add-on to a fuel stop and the 50ml is the whole
   * opportunity there; a bottle shop has the counter as well as the run,
   * and the counter is where the mini sells.
   */
  {
    promotionId: "convenience-single-serve-2026",
    brandIds: ["apple-pie", "salty-caramel", "original-shine"],
    channels: ["Convenience", "Fuel convenience", "Liquor store"],
    looksLike:
      "Minis in a branded counter unit at the one point where the shopper is standing still, and the 375s at eye level on the back shelf behind the register rather than down on the bottom rail.",
    items: [
      {
        name: "Counter unit for 50ml minis",
        kind: "display-vehicle",
        purpose:
          "Holds a full case of sixty minis, which is a week of stock in a busy store rather than a token six. Branded on the face and on the riser, which is what keeps it advertising material.",
        placedBy: "Southern Glazer's rep",
      },
      {
        name: "Back-shelf strips",
        kind: "point-of-sale",
        purpose:
          "Mark the reset so the 375s do not drift back to the bottom rail within two weeks, which is what always happens without them.",
        placedBy: "Southern Glazer's rep",
      },
      {
        name: "Register topper",
        kind: "point-of-sale",
        purpose:
          "Catches the impulse buy at the one moment the shopper is not moving. The mini is the only format in the range that can be bought on impulse.",
        placedBy: "Either",
      },
      {
        name: "Printed serve cards",
        kind: "consumer-specialty",
        purpose:
          "Two-ingredient serves for the 375. Take-away for the shopper, branded, which is what keeps it an advertising specialty rather than a gift.",
        placedBy: "Either",
      },
    ],
  },
  /*
   * NOT PERMITTED in this window: a reset fee for the incremental
   * facings, paying a shop's own crew to cut them in, and — on the
   * steakhouse half — buying the listing or covering the cost of
   * reprinting a drinks menu. Space in the whiskey set is bought with
   * rate of sale or it is not bought at all, which is why the ask is one
   * facing rather than four. A line on a menu is bought the same way,
   * with a pour the room will actually order.
   *
   * The steakhouse is on this window and on no other. Brown spirits, a
   * higher check and a slower turn is the one on-premise setting where
   * the straight bourbon belongs in a way the flavoured range does not,
   * so it gets the back-bar face and nothing else here does.
   */
  {
    promotionId: "above-premium-shelf-2026",
    brandIds: ["tn-bourbon", "blue-flame"],
    channels: ["Beverage specialty", "Liquor store", "Steakhouse"],
    looksLike:
      "Incremental facings placed where each item argues best — the bourbon in the whiskey set, Blue Flame in the specialist run — and one bourbon face on the steakhouse back bar, at the height the guest looks at rather than down on the rail.",
    items: [
      {
        name: "Shelf talkers",
        kind: "point-of-sale",
        purpose:
          "The cheapest thing on this list and the one that moves the most, because it does the arguing when nobody is standing there. Four years in barrel is a fact a shelf edge can carry.",
        placedBy: "Either",
      },
      {
        name: "Neckers",
        kind: "point-of-sale",
        purpose:
          "Ride on the bottle. Useful where a store will not give up shelf-edge space, and the only place 128 proof gets stated at the point the shopper reaches for it.",
        placedBy: "Either",
      },
      {
        name: "Back-bar tent card",
        kind: "point-of-sale",
        purpose:
          "Stands on the lit shelf beside the bourbon. It is the pour a guest asks for by pointing, so the card carries the age statement and nothing else. It comes away with us at the end of the window.",
        placedBy: "Ole Smoky rep",
      },
      {
        name: "Branded tiered riser",
        kind: "display-vehicle",
        purpose:
          "Lifts the bourbon clear of the run without asking for a second facing. Branded on the face and it leaves with us at the end of the window, which is what stops it being a fixture the account has been given.",
        placedBy: "Southern Glazer's rep",
      },
      {
        name: "Window decal",
        kind: "point-of-sale",
        purpose:
          "Beverage-specialty only. Bought before the shopper is inside the store.",
        placedBy: "Southern Glazer's rep",
      },
    ],
  },
  /*
   * NOT PERMITTED in this window: renting the till position for the
   * month, and paying an account for print it produces itself. We furnish
   * the card in both languages; a store that wants its own version prints
   * it at its own cost or takes ours. Which version goes up is the
   * store's call and not a judgement we make about its shoppers from an
   * office.
   *
   * The cherries are the one item in the portfolio that dies in the set
   * and sells at the till, so this window is built entirely around a
   * counter unit. That is not a smaller version of a floor programme, it
   * is a different programme: the shopper is not looking for it, they are
   * standing in a queue looking at whatever is in front of them.
   */
  {
    promotionId: "heritage-cherries-2026",
    brandIds: ["moonshine-cherries", "apple-pie"],
    channels: ["Neighbourhood market", "Liquor store"],
    looksLike:
      "The cherries on a branded counter unit at the till, held the full month, with the jar turned so the fruit faces the queue rather than the wall, and the set behind it signed so a shopper who came back for a second jar can find it.",
    items: [
      {
        name: "Cherries counter unit",
        kind: "display-vehicle",
        purpose:
          "Six jars at the till. The cherries are an impulse and gifting item and they die in the set, so this is the one piece I build and refill myself rather than leaving to the route.",
        placedBy: "Ole Smoky rep",
      },
      {
        name: "Counter card, English and Spanish",
        kind: "point-of-sale",
        purpose:
          "Both versions ship and the account decides which goes up. Written for each reader rather than translated as an afterthought.",
        placedBy: "Southern Glazer's rep",
      },
      {
        name: "Shelf talker for the set",
        kind: "point-of-sale",
        purpose:
          "The jar sells at the counter and gets restocked from the set, and a shopper who wants a second one looks on the shelf. Without this the repeat purchase is a question asked at a busy till.",
        placedBy: "Either",
      },
      {
        name: "Printed serve card",
        kind: "consumer-specialty",
        purpose:
          "What to do with the cherries and what to do with the liquid left in the jar. Take-away, branded, which is what keeps it an advertising specialty rather than a gift.",
        placedBy: "Either",
      },
    ],
  },
  /*
   * THE ON-PREMISE WINDOW, and the one that has to be written most
   * carefully.
   *
   * WHY IT IS EVENT-LED. A sports bar's week is not flat. A televised
   * card moves more volume in four hours than an ordinary Tuesday moves
   * in a week, and the only useful thing a supplier can do with somebody
   * else's calendar is arrive before it. The card on 15 August is the
   * archetype and it lands ahead of this window opening; the kit is the
   * same kit either way, because these rooms run a season of cards and
   * home weekends rather than one Saturday. No promoter's mark appears on
   * any of it, and none of this claims a relationship with any event.
   *
   * WHY THE ORDER MATTERS MORE THAN THE KIT. One 750ml bottle is about
   * sixteen 1.5oz pours, so a bar taking two cases has committed to
   * roughly four hundred drinks. That arithmetic decides whether an ask
   * is obvious or absurd before any table tent is printed, and a bar that
   * runs out at nine o'clock pours a competitor for the rest of the
   * night. The kit is the easy half. The Thursday load is the job.
   *
   * NOT PERMITTED in this window, and this is the list that matters:
   * paying an account to run the night, reimbursing any part of what it
   * spends on the night, buying or contributing to its advertising,
   * covering a door charge, a DJ or extra staff, guaranteeing a bar tab,
   * or supplying anything of value on condition that the account buys.
   * Under 27 CFR 6.84 we may FURNISH the printed material below and we
   * may stand behind the bar before doors and teach the pour. Under
   * California B&P 25500 and 25502 we may not put a dollar into the
   * account's side of the night, and there is no wording of that which
   * makes it lawful. Staff at the account are also out of any consumer
   * prize, per 27 CFR 6.96(b).
   *
   * WHY CASUAL DINING IS ON THE KIT BUT NOT ON THE FIGHT. Applebee's and
   * the grill rooms are menu-led with a high cover count, so they take
   * the printed line and nothing else — no fight-night dressing, no
   * back-bar theatre. The event record lists sports bars, the pub and the
   * bowling house, and sending a dining room a fight-night pack it cannot
   * use costs credibility on the next call for nothing.
   */
  {
    promotionId: "football-kickoff-2026",
    brandIds: ["hunch-punch", "salty-caramel", "sparkling-lemonade"],
    channels: ["Sports bar", "Pub", "Bowling and entertainment", "Casual dining"],
    looksLike:
      "Table tents down before doors, the feature jars lifted on the back bar where a guest can read them from a stool, a bottle in the well so the pour does not need the bartender to turn round, and the printed line on the menu in the dining rooms.",
    items: [
      {
        name: "Back-bar riser",
        kind: "display-vehicle",
        purpose:
          "Lifts two feature bottles clear of the lit shelf. The 750ml jar is the one package in this range a guest can identify across a room, which is worth more on a back bar than it ever is on a shelf. Branded on the face, and it leaves with us at the end of the window.",
        placedBy: "Ole Smoky rep",
      },
      {
        name: "Table tents",
        kind: "point-of-sale",
        purpose:
          "The featured serve, on the table a guest is already sitting at. The price line is left blank on purpose: what a bar charges is its own decision, and printing a number would be us making it.",
        placedBy: "Either",
      },
      {
        name: "Menu inserts",
        kind: "point-of-sale",
        purpose:
          "A printed line for the drinks menu, which is the only placement a guest actually reads. Furnished as a printed insert the account can drop in or leave out — we do not pay for a reprint and we do not buy the listing.",
        placedBy: "Either",
      },
      {
        name: "Lane-service cards",
        kind: "point-of-sale",
        purpose:
          "For the bowling house, where the group never walks to the bar. The card goes out with lane service and puts the serve in front of six people at once, which is the shape of the occasion there.",
        placedBy: "Either",
      },
      {
        name: "Bar-station pour cards",
        kind: "point-of-sale",
        purpose:
          "The build, at the station, branded and securely affixed. A serve that comes out the same at eleven as it did at seven is what gets reordered; the card is what makes that survive a shift change.",
        placedBy: "Ole Smoky rep",
      },
    ],
  },
];

export const KIT_BY_PROMOTION = Object.fromEntries(
  PROGRAM_KITS.map((k) => [k.promotionId, k]),
) as Record<string, ProgramKit>;

export const POS_KIND_LABEL: Record<PosKind, { label: string; note: string }> = {
  "point-of-sale": {
    label: "Point of sale",
    note: "Stays in the store and advertises the product. Permitted where the advertising is permanently inscribed or securely affixed.",
  },
  "consumer-specialty": {
    label: "Consumer specialty",
    note: "Designed for the shopper to take away. Same branding condition applies.",
  },
  "display-vehicle": {
    label: "Display vehicle",
    note: "What the product stands on. Branded on its faces, which is what keeps it advertising material rather than a fixture.",
  },
};
