import type { Channel, VenueClass } from "@/domain/types";

/**
 * One home for everything a channel means.
 *
 * WHY THIS FILE EXISTS. Before it, the label for a channel lived in
 * Wordmark, its glyph lived next to the label, its velocity behaviour
 * lived in a chain of ternaries in accountSkuStatus, and whether it was a
 * bar or a bottle shop was something each call site worked out for
 * itself by pattern-matching on the string. Five files knew four
 * different amounts about the same nine values.
 *
 * The failure that produces is not a crash. It is a screen that says
 * "Sports bar" in one place and "Bar" in another, and a filter that
 * quietly treats a bowling alley as retail because whoever wrote the
 * ternary listed the four channels they happened to remember.
 *
 * So: the channel is declared once, with everything that is true about
 * it, and the union type means adding a tenth channel breaks the build
 * in every place that has to decide something about it. That is the
 * point of the union. A `Record<Channel, T>` cannot be partially filled.
 *
 * `setName` is here for the same reason. A rep does not negotiate "shelf
 * space" at a sports bar, they negotiate a BACK BAR FACE, and a screen
 * that uses the retail word at a bar tells a hiring manager the model
 * does not really distinguish the two.
 */

export interface ChannelMeta {
  label: string;
  /** For a dense row where the full label will not fit. */
  short: string;
  /** Shape before hue, always. The card is identifiable in greyscale. */
  glyph: string;
  venueClass: VenueClass;
  /** What the negotiated space is actually called at this kind of account. */
  setName: string;
  /**
   * The same thing in one word, for the middle of a sentence.
   *
   * "Nothing on the back bar and well" is a real phrase and a terrible
   * clause. `setName` is a heading; this is what a rep would say out
   * loud, and a sentence that reads as though a program assembled it is
   * a sentence a store owner can tell was assembled by a program.
   */
  spaceNoun: string;
  /** What is true about how this channel trades. Shown in the drawer. */
  note: string;
}

export const CHANNEL_META: Record<Channel, ChannelMeta> = {
  // --- Off-premise --------------------------------------------------
  "liquor-store": {
    label: "Liquor store",
    short: "Liquor",
    glyph: "▮",
    venueClass: "off-premise",
    setName: "Spirits shelf run",
    spaceNoun: "shelf",
    note: "The owner is the buyer, the buyer is behind the counter, and a decision takes one conversation rather than one quarter. The deepest flavour set in the territory sits in these stores.",
  },
  "neighborhood-market": {
    label: "Neighbourhood market",
    short: "Market",
    glyph: "▢",
    venueClass: "off-premise",
    setName: "Licensed set",
    spaceNoun: "shelf",
    note: "Groceries at the front, a licensed set at the back. The spirits shelf is small enough that every facing given to one brand is taken from another.",
  },
  convenience: {
    label: "Convenience",
    short: "C-store",
    glyph: "◷",
    venueClass: "off-premise",
    setName: "Counter and back shelf",
    spaceNoun: "shelf",
    note: "Walk-in trade on a short dwell. Small formats and the counter position do almost all of the volume.",
  },
  "fuel-convenience": {
    label: "Fuel convenience",
    short: "Forecourt",
    glyph: "◶",
    venueClass: "off-premise",
    setName: "Counter set",
    spaceNoun: "counter",
    note: "A forecourt store carries spirits as an add-on to a fuel stop. The set is tiny, the 50ml is the whole opportunity, and a 1.75L handle would never earn its space.",
  },
  "beverage-specialty": {
    label: "Beverage specialty",
    short: "Specialty",
    glyph: "◆",
    venueClass: "off-premise",
    setName: "Category set",
    spaceNoun: "shelf",
    note: "The category specialist. Widest set, most discovery, and the only off-premise account where a shopper arrives intending to try something they have not had.",
  },

  // --- On-premise ---------------------------------------------------
  "casual-dining": {
    label: "Casual dining",
    short: "Dining",
    glyph: "◍",
    venueClass: "on-premise",
    setName: "Back bar and menu",
    spaceNoun: "back bar",
    note: "Cover count is high and the drink is ordered off a menu, so a printed cocktail line is worth more than a back-bar face on its own.",
  },
  "sports-bar": {
    label: "Sports bar",
    short: "Sports",
    glyph: "◉",
    venueClass: "on-premise",
    setName: "Back bar and well",
    spaceNoun: "back bar",
    note: "Trade is event-shaped. A televised card moves more volume in four hours than an ordinary Tuesday moves in a week, and the pour is decided at the bar rather than off a menu.",
  },
  steakhouse: {
    label: "Steakhouse",
    short: "Steak",
    glyph: "◈",
    venueClass: "on-premise",
    setName: "Back bar",
    spaceNoun: "back bar",
    note: "Brown spirits, a higher check and a slower turn. The straight bourbon belongs here in a way the flavoured range does not.",
  },
  "bowling-entertainment": {
    label: "Bowling and entertainment",
    short: "Entertainment",
    glyph: "◐",
    venueClass: "on-premise",
    setName: "Bar and lane service",
    spaceNoun: "bar",
    note: "Long dwell and group occasions. Pitchers and shareable serves do the work, and lane service puts a drink in front of people who were not walking to a bar.",
  },
  pub: {
    label: "Pub",
    short: "Pub",
    glyph: "◑",
    venueClass: "on-premise",
    setName: "Back bar and well",
    spaceNoun: "back bar",
    note: "Regulars and a bartender whose recommendation is the whole distribution strategy. Staff education outperforms any point-of-sale material here.",
  },
};

export const VENUE_CLASS_META: Record<
  VenueClass,
  { label: string; short: string; glyph: string; what: string }
> = {
  "off-premise": {
    label: "Retail locations",
    short: "Retail",
    glyph: "▮",
    what: "Shops that sell a sealed bottle to be opened somewhere else. The unit of the conversation is a case on a shelf.",
  },
  "on-premise": {
    label: "Bars and restaurants",
    /*
      "Bars" on the tab, not "On-premise".

      On-premise is the correct trade term and it is what the venue class
      is called everywhere else in this app. On a tab it is four
      characters too long and ellipsed to "On-...", which told the reader
      nothing. "Bars" is what a rep calls this list out loud, and the
      full name is still on the tooltip, the aria label and every heading
      that has room for it.
    */
    short: "Bars",
    glyph: "◉",
    what: "Venues that sell a pour to be drunk on site. The unit of the conversation is a serve behind a bar.",
  },
};

export function venueClassOf(channel: Channel): VenueClass {
  return CHANNEL_META[channel].venueClass;
}

export function isOnPremise(channel: Channel): boolean {
  return CHANNEL_META[channel].venueClass === "on-premise";
}

/**
 * Pours in a 750ml bottle at a 1.5oz serve.
 *
 * THIS SINGLE NUMBER IS WHY AN ON-PREMISE EMAIL READS DIFFERENTLY FROM A
 * RETAIL ONE. A bottle shop taking two cases is taking twenty-four
 * bottles it will sell as twenty-four transactions. A bar taking two
 * cases is committing to roughly four hundred drinks — which is either
 * an obvious yes or an obviously absurd ask depending on its cover
 * count, and a rep who does not do that arithmetic before sending is
 * asking a bar to over-buy by a factor of five.
 *
 * 25.36oz in a 750ml bottle, 1.5oz per pour, rounded down because you
 * cannot serve a partial drink.
 */
export const POURS_PER_BOTTLE = Math.floor(25.36 / 1.5);

/** Serves in a case, given the units in that case. */
export function poursPerCase(unitsPerCase: number): number {
  return unitsPerCase * POURS_PER_BOTTLE;
}
