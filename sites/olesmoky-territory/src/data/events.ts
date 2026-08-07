import type { Provenance } from "@/domain/types";

/**
 * Televised events a bar can build a night around.
 *
 * ── WHY A SUPPLIER TRACKS SOMEBODY ELSE'S CALENDAR ────────────────
 * An on-premise account's week is not flat. A neighbourhood sports bar
 * does an ordinary Saturday most weeks and then does three ordinary
 * Saturdays in one night when there is a card on. The bottle behind the
 * bar does not care, but the ORDER does: a bar that gets caught two
 * bottles short at nine o'clock on fight night pours something else for
 * the rest of the evening, and the guest who would have had a Blackberry
 * shot has a different brand's instead.
 *
 * So the only useful thing a supplier can do with a televised card is
 * arrive before it. That is a distribution action with a date on it,
 * which is exactly what a CRM system is for and exactly what an events
 * calendar in a marketing deck is not.
 *
 * ── WHAT THIS IS NOT ──────────────────────────────────────────────
 * There is no sponsorship claim here, no suggestion Ole Smoky has any
 * relationship with the UFC, and no use of any mark. The event is a
 * PUBLIC FACT about a date, in the same way a bank holiday is: the card
 * is on, bars will be full, and a rep should have been there on the
 * Tuesday. A promotion built around "the fight is on Saturday" needs no
 * licence; one that puts a fight promoter's logo on a shelf talker needs
 * several, and this app does neither.
 *
 * ── THE RULE THAT CONSTRAINS EVERY TEMPLATE BELOW ─────────────────
 * 27 CFR 6.84 lets a supplier FURNISH point-of-sale material to a
 * retailer — table tents, menu inserts, branded serving pieces of
 * limited value. It does not let a supplier pay a retailer to run a
 * promotion, buy the retailer's advertising, or cover the retailer's
 * costs. In California, B&P 25500 and 25502 say the same thing harder.
 *
 * That is not a footnote, it is the design constraint. "We will fund
 * your fight-night promo" is the single most natural sentence for a
 * supplier to write to a bar and it is illegal in this state, so no
 * template in this app can generate it. See the `mayNot` field: it is on
 * the record rather than in a comment, because a rule that lives in a
 * comment gets edited around.
 */

export interface TradeEvent {
  id: string;
  name: string;
  /** What it is, in words a bar manager would use. */
  shortName: string;
  date: string;
  /** Where the event physically happens. Not where the promotion runs. */
  venue: string;
  /** The draw. Named because a bar manager knows the names. */
  headline: string;
  /**
   * Which channels this event actually moves. A steakhouse does not run
   * a fight night, and pretending otherwise is how a template ends up
   * sent to fifteen accounts and read by three.
   */
  relevantChannels: string[];
  /** What a supplier MAY furnish. 27 CFR 6.84. */
  mayFurnish: string[];
  /** What a supplier may NOT do. Same rule, other side. */
  mayNot: string[];
  provenance: Provenance;
  source: string;
}

export const TRADE_EVENTS: TradeEvent[] = [
  {
    id: "ufc-330",
    name: "UFC 330: Makhachev vs. Machado Garry",
    shortName: "UFC 330",
    date: "2026-08-15",
    venue: "Philadelphia, Pennsylvania",
    headline: "Islam Makhachev vs. Ian Machado Garry",
    /*
      Four Buffalo Wild Wings, one independent sports bar, one pub and a
      bowling alley. The steakhouses are deliberately not on this list:
      a Saturday-night fight card is the opposite of a steakhouse's
      trade, and sending them this would cost credibility on the next
      call for nothing.
    */
    relevantChannels: ["sports-bar", "pub", "bowling-entertainment"],
    mayFurnish: [
      "Table tents and menu inserts for a featured serve",
      "Branded glassware and serving pieces of limited value",
      "A staff education session on the pour, before doors",
      "Product for the order itself, at the ordinary trade price",
    ],
    mayNot: [
      "Pay the account to run the promotion, or reimburse any part of its cost",
      "Buy or contribute to the account's advertising for the night",
      "Supply anything of value conditioned on the account's purchase",
      "Include the account's own staff in a consumer prize (27 CFR 6.96(b))",
    ],
    provenance: "public",
    source:
      "Event date, card and venue published by UFC and reported by ESPN, CBS Sports and Tapology. Ole Smoky has no announced relationship with the event; it is referenced here only as a date on which bars are busy.",
  },
];

export const EVENT_BY_ID = Object.fromEntries(
  TRADE_EVENTS.map((e) => [e.id, e]),
) as Record<string, TradeEvent>;

/**
 * Days between today and an event.
 *
 * WHY THE LEAD TIME IS THE INTERESTING NUMBER and not the date. A bar
 * manager knows when the fight is. What they do not have in front of
 * them is the fact that the last delivery which can land before it goes
 * out on Thursday, which is the only part of this a supplier controls.
 * A template that says "the card is on the 15th" tells them nothing; one
 * that says "eight days, so this needs to be on Thursday's load" is
 * doing the job.
 */
export function daysUntil(dateISO: string, from = new Date()): number {
  const target = Date.parse(`${dateISO}T00:00:00`);
  const start = new Date(
    from.getFullYear(),
    from.getMonth(),
    from.getDate(),
  ).getTime();
  if (Number.isNaN(target)) return 0;
  return Math.round((target - start) / 86_400_000);
}

/** The next event this account could actually run, or null. */
export function nextEventForChannel(
  channel: string,
  from = new Date(),
): TradeEvent | null {
  const upcoming = TRADE_EVENTS.filter(
    (e) => e.relevantChannels.includes(channel) && daysUntil(e.date, from) >= 0,
  ).sort((a, b) => a.date.localeCompare(b.date));
  return upcoming[0] ?? null;
}

export function formatEventDate(dateISO: string): string {
  const d = new Date(`${dateISO}T00:00:00`);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
