import type { Account } from "@/domain/accounts";

/**
 * THE CLIENT BASE, WHICH IS TWO ORGANISATIONS AND NO HISTORY.
 *
 * This is the shortest seed file in the application and it is the one
 * with the strongest opinion, because the temptation here is enormous.
 * A retention board wants a back catalogue. Three years of repeat
 * bookings, a couple of lapsed accounts to win back, a lifetime value
 * column with four figures in it. Every one of those would be invented.
 * R1 is an unaffiliated work sample, no promotion has been run out of
 * it and no group has been served, so a populated retention board would
 * be a claim about Round1's customers that nobody could check and that
 * Round1 itself would know to be wrong.
 *
 * SO THERE ARE TWO ACCOUNTS, THEY ARE THE TWO SIGNED CONTRACTS IN
 * `book.ts`, BOTH ARE BADGED ILLUSTRATIVE THERE, AND NEITHER EVENT HAS
 * HAPPENED. The board is a clock rather than a history: what is coming,
 * when each window opens, and what has to happen the day after each
 * event. On a desk that sources promotional product against a campaign
 * calendar, the day after is when the sell-through report is owed to a
 * licensor, so the clock is genuinely the job rather than a substitute
 * for one.
 *
 * WHY THESE TWO AND NOT TWO OTHERS. They sit on the two clocks that
 * govern most of the Cerritos trade area and they govern it in opposite
 * directions. A high school campus buys against a fixed academic
 * calendar that nobody in this building controls. A high volume employer
 * buys against a holiday season that moves a little every year and is
 * settled by a human resources office. One window shuts whether anybody
 * rings or not; the other has to be opened. A retention board that only
 * models one of the two is modelling half a year.
 *
 * NOTHING IN THIS FILE IS AN EVENT, A PERSON OR A NUMBER. It carries the
 * handful of facts about an organisation that cannot be derived from
 * somewhere else: which clock it buys on, whose job it is, and which
 * title outlives the person holding it. The occasions, the cycle, every
 * window and every trace date are computed in
 * `domain/selectors/accounts.ts` at render, out of the `buyingWindow`
 * string the prospect row already carries and the `eventDate` the book
 * line already carries. A seeded window would be a date somebody typed;
 * a computed one is arithmetic a reader can check against the string.
 *
 * The account id is the prospect id. One organisation, one identifier,
 * and no chance of the account board and the desk disagreeing about who
 * anybody is.
 */
export const ACCOUNTS: Account[] = [
  {
    id: "cerritos-high-school",
    prospectId: "cerritos-high-school",
    segment: "school-programme",
    segmentBasis:
      "A comprehensive campus about half a mile from the Park Plaza Drive office, buying its own programme events out of its own activities office. Not grad night, which is a different clock: a committee that turns over every year and a date settled a year out.",
    ownerRole: "Sales Manager",
    /* A TITLE, NEVER A NAME. The application invents no people and the
       rule is worth more here than anywhere else, because the whole
       argument of the segment is that the person changes and the office
       does not. The prospect row records the door as the principal's
       office, so the anchor is the office and not a named director. */
    anchorTitle: "Campus activities office",
    balanceState: "outstanding",
    balanceBasis:
      "Fifty per cent taken as a deposit on signature, per the book line. The remainder is due after the event, which has not happened. Finance owns this figure and the board only reads it, because an unpaid balance blocks a rebooking ask and knowing that is not the same as processing it.",
    provenance: {
      segment: "modeled",
      anchorTitle: "modeled",
      balanceState: "modeled",
    },
  },
  {
    id: "porto-s-bakery-and-cafe",
    prospectId: "porto-s-bakery-and-cafe",
    segment: "corporate-holiday",
    segmentBasis:
      "A high volume bakery employer in Buena Park whose staff appreciation and holiday spend is settled by a human resources office in the autumn, which is exactly what this row's buying window says: October to December, with a second window in January and February for kickoffs.",
    ownerRole: "Sales Manager",
    anchorTitle: "Human resources manager",
    balanceState: "outstanding",
    balanceBasis:
      "Fifty per cent taken as a deposit on signature, per the book line. The remainder is due after the event, which has not happened.",
    provenance: {
      segment: "modeled",
      anchorTitle: "modeled",
      balanceState: "modeled",
    },
  },
];

export const ACCOUNT_BY_ID: Record<string, Account> = Object.fromEntries(
  ACCOUNTS.map((a) => [a.id, a]),
);

export const ACCOUNT_BY_PROSPECT_ID: Record<string, Account> =
  Object.fromEntries(ACCOUNTS.map((a) => [a.prospectId, a]));

/**
 * WHAT IS DELIBERATELY NOT IN THIS FILE, AND WHY.
 *
 * A standing negotiated rate. An account level term, a rate agreed now
 * and honoured for a year, is exactly the sort of thing an account
 * record should carry. Round1 publishes no price for any package, so
 * there is no rate card for such a term to sit against, and neither of
 * these two organisations has been offered one. Attaching one to make
 * the record look complete would be inventing a commercial term, which
 * is the one kind of invention this application never makes.
 *
 * A supplier or licensor term. The posting asks for costs, terms and
 * delivery schedules negotiated with vendors and licensors, and those
 * belong to a purchase order rather than to a customer account. Filing
 * them here would put a vendor's payment terms on a buyer's record,
 * which is how a promotions desk ends up quoting a supplier's lead time
 * to a school.
 *
 * A last contact date. It is derived from `data/conversations.ts`,
 * which already holds every message either organisation has exchanged
 * with its date on it. Storing a second copy here is how two files end
 * up disagreeing about when somebody was last spoken to.
 *
 * A lifetime value, an events delivered count, a satisfaction score and
 * a debrief sentence. All four are readings taken off events, and no
 * event has been delivered. They appear the moment one has.
 */
