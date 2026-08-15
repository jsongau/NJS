import type { Account } from "@/domain/accounts";

/**
 * THE CLIENT BASE, WHICH IS TWO ORGANISATIONS AND NO HISTORY.
 *
 * This is the shortest seed file in the application and it is the one
 * with the strongest opinion, because the temptation here is enormous.
 * A retention board wants a back catalogue. Three years of repeat
 * bookings, a couple of lapsed accounts to win back, a lifetime value
 * column with four figures in it. Every one of those would be invented,
 * and Main Event Brea is publicly not open, so a populated retention
 * board is a lie an interviewer can catch by opening a browser.
 *
 * SO THERE ARE TWO ACCOUNTS, THEY ARE THE TWO SIGNED CONTRACTS IN
 * `book.ts`, AND NEITHER EVENT HAS HAPPENED. The board is a clock rather
 * than a history: what is coming, when each window opens, and what has
 * to happen the day after each event. That is genuinely the job on day
 * one of a venue that has not opened.
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
    id: "heights-christian-schools-brea-campus",
    prospectId: "heights-christian-schools-brea-campus",
    segment: "school-programme",
    segmentBasis:
      "A private campus buying its own programme events out of its own front office. Not grad night, which is a different clock: a committee that turns over every year and a date a year out.",
    ownerRole: "Sales Manager",
    /* A TITLE, NEVER A NAME. The application invents no people and the
       rule is worth more here than anywhere else, because the whole
       argument of the segment is that the person changes and the office
       does not. */
    anchorTitle: "Campus Office Manager",
    balanceState: "outstanding",
    balanceBasis:
      "Fifty per cent taken as a deposit on signature, per the book line. The remainder is due after the event, which has not happened. Finance owns this figure and the board only reads it, because an unpaid balance blocks a rebooking ask and knowing that is not the same as processing it.",
    provenance: {
      segment: "modeled",
      anchorTitle: "public",
      balanceState: "modeled",
    },
  },
  {
    id: "team-kwon-taekwondo-center-hq",
    prospectId: "team-kwon-taekwondo-center-hq",
    segment: "martial-arts",
    segmentBasis:
      "A taekwondo headquarters on a belt test cycle. California School of Martial Arts publishes colour and black belt tests every two months and Dan tests every six, approximately June and December, which is exactly what this row's buying window says.",
    ownerRole: "Sales Manager",
    anchorTitle: "Head Instructor / Studio Owner",
    balanceState: "outstanding",
    balanceBasis:
      "Fifty per cent taken as a deposit on signature, per the book line. The remainder is due after the event, which has not happened.",
    provenance: {
      segment: "public",
      anchorTitle: "public",
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
 * A standing negotiated rate. `midweek-daytime-lock` in `venue.ts` is a
 * real account level term, a rate agreed now and honoured for a year,
 * and it is exactly the sort of thing an account record should carry.
 * Neither of these two organisations has been offered it, so neither
 * carries it. Attaching one to make the record look complete would be
 * inventing a commercial term, which is the one kind of invention this
 * application never makes.
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
