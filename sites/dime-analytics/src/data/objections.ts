import type { Lane, Provenance } from "@/domain/types";

/**
 * THE OBJECTION REGISTER.
 *
 * Every sales prototype ever built shows the pipeline. Almost none of
 * them show the handful of sentences that actually decide whether the
 * pipeline moves, and those sentences are the job.
 *
 * The objections here are the ones a trade area throws at an operator
 * that publishes a package and withholds its price, whose nearest
 * building is one town over, and whose category has an incumbent in
 * almost every corporate diary. None of them is an excuse a buyer
 * invented. They are correct observations, and anybody who cannot answer
 * them honestly and fast has no business asking for a signature.
 *
 * So this file records the objection IN THE BUYER'S OWN VOICE, the answer
 * that actually works, and, unusually, WHAT THE ANSWER COSTS. The last
 * one is the part most objection-handling documents leave out and the
 * part a manager cares about, because every one of these answers gives
 * something away. A held date gives away optionality on the calendar. A
 * rate held across a fiscal boundary gives away a number before the year
 * is known. Naming the cost is the difference between a script and a
 * plan.
 *
 * WHAT IS SOURCED AND WHAT IS NOT. The facts about DIME are sourced to
 * dimeindustries.com: the single published package, the absent price, the
 * three day change notice, the support number, the nearest store and its
 * published hours and amenities, the company history. The one competitor
 * figure quoted below is Main Event's own published figure on Main
 * Event's own site and is labelled as such. The objections themselves
 * are marked illustrative except where a real reply in the record raised
 * them, and the answers are judgements written for this work sample.
 * Nothing here is a quotation from a real person, and no organisation is
 * described as having said anything it did not.
 *
 * WHAT WAS DELETED RATHER THAN REWRITTEN. This register used to carry
 * three objections about a building that had not opened: no opening
 * date, nothing to tour, and no track record. DIME has been trading in
 * the United States since 2010 and the nearest store keeps published
 * hours seven days a week, so all three premises are simply false here.
 * A weaker version of a dead argument is worse than no argument, so they
 * are gone rather than softened.
 */

export type ObjectionDisposition =
  /** Live. Somebody is raising this and it has not been answered. */
  | "open"
  /** Answered, and the deal carried on. The answer worked. */
  | "answered"
  /** This is why the deal died. Recorded, because a register that only
   *  logs wins teaches nothing. */
  | "lost-to-it";

export interface Objection {
  id: string;
  /** A short handle for a chip or a table cell. */
  short: string;
  /** The objection as a buyer would actually say it. First person. */
  voice: string;
  /** Which lanes raise this one. Not all of them raise all of these. */
  lanes: Lane[];
  /** Why they are right to raise it. Concede this before answering. */
  why: string;
  /** The answer that works. Plain, specific, and honest. */
  answer: string;
  /** What answering this way costs the venue. Sometimes zero, and that
   *  is worth saying out loud rather than leaving to be assumed. */
  cost: string;
  /** The offer in data/venue.ts that this answer leans on, if any. */
  offerId?: string;
  /** How hard this one is to answer at all. */
  severity: "structural" | "high" | "medium";
  source?: string;
  provenance: Provenance;
}

const R1_PARTY = "https://www.dimeindustries.com/book-a-party";
const R1_PROFILE = "https://www.dimeindustries.com/profile";
const R1_LAKEWOOD = "https://www.dimeindustries.com/locations/lakewood-center-mall";

const ALL_LANES: Lane[] = [
  "schools",
  "colleges",
  "fitness-youth-sports",
  "corporate",
  "auto-finance",
  "hospitality-civic",
  "faith-nonprofit",
  "healthcare",
  "local-retail-food",
];

/*
  WHICH OF THESE THE NINTH LANE ACTUALLY RAISES, decided one row at a
  time rather than by ticking the box on all of them.

  local-retail-food gets everything in ALL_LANES and the geography one.
  "No published price" is the same silence for an owner-operator as for a
  finance committee, and it is arguably worse: a person spending their
  own money on twelve staff asks what it costs in the first sentence and
  has nowhere to look it up. "Nearest store is not here" lands hard for a
  counter whose crew finishes at eleven at night and will not drive for
  it.

  The other two are left off on purpose. "Already committed" assumes a
  multi year contract that a boba counter does not have. "Budget is next
  fiscal" assumes an appropriation, and an owner-operator IS the budget.
  A register that showed every row on every lane would be a register
  nobody read twice.
*/

export const OBJECTIONS: Objection[] = [
  /*
    THE MOST IMPORTANT ROW IN THIS FILE.

    It is first because it is true of every conversation in every lane,
    it is a deliberate commercial design rather than an accident, and the
    honest answer to it is the entire argument for the role.
  */
  {
    id: "no-published-price",
    short: "No published price",
    voice:
      "Your website will not tell me what it costs. I cannot take a number I do not have to my finance committee, and one of the venues I looked at this morning publishes its fundraiser terms on the page.",
    lanes: ALL_LANES,
    why: "They are describing something real and deliberate. DIME publishes exactly one named group offering, the All Inclusive Party, lists what is in it, and publishes no price for it. The party room page publishes no price, no capacity, no hourly rate and no minimum spend either. The buyer has not failed to find the price. There is no price to find.",
    answer:
      "Say the true thing first, because it disarms the whole objection: we do not publish group pricing, and I am the reason. A group price depends on headcount, day part and what you want included, and the difference between a Tuesday at eleven and a Friday at seven is large enough that a single published number would be wrong for almost everybody. What I can give you today is a written quote against your actual numbers, this week, with the price held. What I will not do is invent a figure to get off the phone. What I can point at on the page is exactly what is in the package, and the one term that is published, which is that changes need three or more days notice.",
    cost: "The manager's time, which is what the role is for. It also costs the deal any chance of being closed by a website, which is a trade the operator has already made on purpose.",
    severity: "structural",
    source: R1_PARTY,
    provenance: "public",
  },
  {
    id: "competitor-publishes-terms",
    short: "They publish, you do not",
    voice:
      "Main Event puts its fundraiser terms straight on the page. Twenty per cent of sales, and I can see the guest minimums before I ring anybody. Why can I not see yours?",
    lanes: [
      "schools",
      "faith-nonprofit",
      "fitness-youth-sports",
      "colleges",
      "corporate",
    ],
    why: "The comparison is fair and the figures are real. Main Event publishes a Spirit Night fundraiser rate of twenty per cent of sales, a one hundred and fifty guest school lock-in minimum and a two hundred guest buyout minimum, all on its own site. Those are that operator's published figures, not this one's, and pretending otherwise on a call is the fastest way to be caught. A volunteer committee with no budget can approve a published percentage in a meeting and cannot approve a phone call.",
    answer:
      "Concede the comparison out loud, because they have already made it and denying it costs the rest of the conversation. One operator publishes its fundraiser terms and this one does not, and that is a real difference on the day they are choosing. Then move the ground to where the published facts are on this side: the package contents are published in full, the nearest store keeps published hours seven days a week, and the quote you write against their actual headcount will be firmer than a percentage that has to be reconciled after the night. Ask for the headcount and the date, and put a number in writing the same week.",
    cost: "Nothing in cash, and it costs the illusion of an advantage that was never there. It also costs a same week turnaround on a written quote, which is a commitment on the manager's diary rather than on the margin.",
    severity: "high",
    source: "https://www.mainevent.com/events/school-events/",
    provenance: "public",
  },
  {
    id: "no-local-venue",
    short: "Nearest store is not here",
    voice:
      "Your head office is on the Irvine office and your building is not. You are asking me to put a coach on the road to Lakewood for a staff night.",
    lanes: ALL_LANES,
    why: "Correct, and the register says so rather than talking around it. The US corporate headquarters is at the Irvine office in Irvine and the nearest store is at 401 Lakewood Ctr Mall in Lakewood. That is a real journey for a group that finishes work at six, and no amount of enthusiasm about the building shortens it.",
    answer:
      "Give them the journey in facts rather than in adjectives, because the published ones are good. The store is open Sunday to Thursday from ten in the morning until midnight and Friday and Saturday until one, so a group that leaves at seven is not chasing a closing time. What is in the building is published too: bowling, arcade, karaoke, billiards and ping pong, party rooms, a Victory Zone and the YUU Japanese food hall, which is a different evening from a room with a buffet in it. Then ask the question that actually decides it: which of your dates is a Friday, because a Friday night that ends at one in the morning is worth a drive and a Tuesday at six is not.",
    cost: "Nothing, and it costs the temptation to imply a nearer building. The distance is on the map screen for the same reason, so nobody in the seat has to guess at it on a call.",
    severity: "high",
    source: R1_LAKEWOOD,
    provenance: "public",
  },
  {
    id: "already-committed",
    short: "Already committed",
    voice:
      "Our holiday party is already contracted at a hotel and has been for three years. Come back in February if you want the summer sales push.",
    lanes: ["auto-finance", "corporate", "healthcare", "hospitality-civic"],
    why: "This is a real answer that came back from a real dealership in this trade area, and it is the most useful no in the register. A multi-year contract is not an objection to be overcome, it is a fact with a date on it. Pushing against it wastes the relationship and the February door that was left open in the same sentence.",
    answer:
      "Take the no on December and take the yes they just handed over. They named a second occasion themselves, so the follow-up is a diary entry for February and a note about the summer sales push, not another email about the holiday party. A commission business buys group nights twice, once to reward the team and once to entertain the customers, and the second one has no incumbent. Then find out when the hotel contract ends, because that date is worth more than this year's party.",
    cost: "A year of patience and one diary entry. It costs nothing except the temptation to keep selling into a closed door.",
    severity: "medium",
    source: "Reply recorded in data/book.ts, 10 September 2026",
    provenance: "illustrative",
  },
  {
    id: "budget-next-fiscal",
    short: "Budget is next fiscal",
    voice:
      "There is no money in this year's budget. Ask me again after July, when the new one opens.",
    lanes: [
      "schools",
      "colleges",
      "healthcare",
      "corporate",
      "faith-nonprofit",
      "hospitality-civic",
    ],
    why: "Usually true and almost always survivable, because it is an objection about timing rather than about value. School districts, colleges, hospital groups and anybody running on a public budget genuinely cannot spend money that has not been appropriated. Arguing with a fiscal calendar is arguing with a law.",
    answer:
      "Get in the budget rather than around it. The useful ask is not for money, it is for a line: what would you need from me, in writing, in time for the budget to be built. A quote with a held rate, dated before their planning cycle, costs them nothing to file and puts this operator inside the document that decides next year. Then ask what is spendable this year, because there is nearly always a small discretionary pot, and a forty person staff appreciation lunch out of it is a foot in a door that opens properly in twelve months.",
    cost: "A rate held across a fiscal boundary, which is a real commitment: a number is being promised before next year's demand is known.",
    severity: "medium",
    provenance: "illustrative",
  },
  /*
    THE ONE WITH THE GENUINELY INTERESTING ANSWER, kept last because it
    is the one a reader is most likely to remember.
  */
  {
    id: "we-use-dave-and-busters",
    short: "We use Dave and Buster's",
    voice:
      "We already do this at Dave and Buster's every year and it works fine. Why would we move it?",
    lanes: ["corporate", "auto-finance", "healthcare", "colleges", "hospitality-civic"],
    why: "A fair question, and the answer most reps reach for is the wrong one. The instinct is to attack the incumbent, in front of a buyer who has enjoyed it for years and chose it themselves. That argument cannot be won and does not need to be had.",
    answer:
      "Do not sell against their night, sell a different one. Theirs is arcade and food. This is bowling, karaoke, billiards and ping pong, an arcade, a Victory Zone and a Japanese food hall, which is a genuinely different evening for the same group rather than the same evening with a different sign on it. Say the karaoke part out loud, because it is the one thing on that list the incumbent does not have and the one thing a team remembers. Then ask the question that actually moves it: if the December night is already spoken for, what is the second occasion. Almost every organisation has one, and nobody is defending it.",
    cost: "Nothing. It costs the December date this year, which was never available, and it buys the conversation about the occasion that is.",
    severity: "medium",
    source: R1_LAKEWOOD,
    provenance: "public",
  },
];

export const OBJECTION_BY_ID: Record<string, Objection> = Object.fromEntries(
  OBJECTIONS.map((o) => [o.id, o]),
);

/**
 * Which objections a given lane actually hits.
 *
 * A register that shows every row on every lane board is a register
 * nobody reads twice. A school is never told to go and use Dave and
 * Buster's instead, and a memory care community is not worried about its
 * holiday party contract.
 */
export function objectionsForLane(lane: Lane): Objection[] {
  return OBJECTIONS.filter((o) => o.lanes.includes(lane));
}

/** Kept so a reader can see the company facts the answers lean on. */
export const COMPANY_SOURCE = R1_PROFILE;

export const SEVERITY_META: Record<
  Objection["severity"],
  { label: string; glyph: string; cssVar: string; note: string }
> = {
  structural: {
    label: "Structural",
    glyph: "▲",
    cssVar: "var(--risk)",
    note: "True of every conversation, in every lane, for as long as the price stays off the page. These do not get solved, they get answered well.",
  },
  high: {
    label: "High",
    glyph: "◑",
    cssVar: "var(--warn)",
    note: "Blocks the largest bookings specifically. Answerable, and the answer costs something.",
  },
  medium: {
    label: "Medium",
    glyph: "○",
    cssVar: "var(--neutral)",
    note: "Comes up often, rarely fatal, and usually contains the next occasion inside the refusal.",
  },
};
