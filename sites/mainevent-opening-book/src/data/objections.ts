import type { Lane, Provenance } from "@/domain/types";

/**
 * THE OBJECTION REGISTER.
 *
 * Every sales prototype ever built shows the pipeline. Almost none of
 * them show the seven sentences that actually decide whether the pipeline
 * moves, and those seven sentences are the job.
 *
 * A pre-opening venue does not lose deals to a competitor's better price.
 * It loses them to the fact that there is nothing to walk through, no
 * date to book against, no photograph, no review, and no published
 * number. Those are not excuses a buyer invents. They are correct
 * observations, and a sales manager who cannot answer them honestly and
 * fast has no business asking anybody for a deposit.
 *
 * So this file records the objection IN THE BUYER'S OWN VOICE, the answer
 * that actually works, and, unusually, WHAT THE ANSWER COSTS. The last
 * one is the part most objection-handling documents leave out and the
 * part a general manager cares about, because every one of these answers
 * gives something away. A held date with no deposit gives away optionality
 * on the calendar. A hard hat tour gives away an hour and a conversation
 * with the general contractor. Naming the cost is the difference between
 * a script and a plan.
 *
 * WHAT IS SOURCED AND WHAT IS NOT. The facts about Main Event are sourced:
 * the gated pricing, the published Spirit Night terms, the fact that no
 * opening date is published, the shared parent company with Dave and
 * Buster's. The objections themselves are marked illustrative except
 * where a real reply in data/book.ts raised them, and the answers are
 * judgements written for this work sample. Nothing here is a quotation
 * from a real person, and no organisation is described as having said
 * anything it did not.
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
  /** How hard this one is, in the pre-opening period specifically. */
  severity: "structural" | "high" | "medium";
  source?: string;
  provenance: Provenance;
}

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
  WHICH OF THESE SEVEN THE NINTH LANE ACTUALLY RAISES, decided one row at
  a time rather than by ticking the box on all of them.

  It gets the two in ALL_LANES and one more. "No published price" is the
  same silence for an owner-operator as for a finance committee, and it
  is arguably worse: a person spending their own money on twelve staff
  asks what it costs in the first sentence and has nowhere to look it up.
  "Unproven venue" lands harder still, because the name on a bad night at
  a fifteen person shop is the owner's own. "No opening date" is added
  below, because "call me when you are open" is the single most likely
  first answer at a counter.

  The other four are left off on purpose. "Cannot tour it" is the large
  buyer's objection, raised by somebody with a board to answer to; these
  prospects are within half a mile and watch the building go up on their
  way to work. "Already committed" assumes a multi-year hotel contract
  that a boba counter does not have. "Budget is next fiscal" assumes an
  appropriation, and an owner-operator IS the budget. "We use Dave and
  Buster's" assumes an annual tradition somewhere else, and this lane's
  whole premise is that nobody has ever taken these crews anywhere. A
  register that showed all seven on every lane would be a register
  nobody read twice.
*/

export const OBJECTIONS: Objection[] = [
  /*
    THE MOST IMPORTANT ROW IN THIS FILE.

    It is first because it is the one that is true of every conversation
    in every lane, it is Main Event's own deliberate design rather than an
    accident, and the honest answer to it is the entire argument for
    filling this role.
  */
  {
    id: "no-published-price",
    short: "No published price",
    voice:
      "Your website will not tell me what it costs. I cannot take a number I do not have to my finance committee, and every other venue I looked at this morning had a per-person price on the page.",
    lanes: ALL_LANES,
    why: "They are describing something real and deliberate. Main Event publishes a price for every product a parent buys alone at night on a phone, and publishes none for any corporate or group package. Those pages say to contact the local sales manager, and several add that room rental fees and revenue minimums may apply. The buyer has not failed to find the price. There is no price to find.",
    answer:
      "Say the true thing first, because it disarms the whole objection: we do not publish group pricing, and I am the reason. A group price here depends on headcount, day part and what you want included, and the difference between a Tuesday at eleven and a Friday at seven is large enough that a single published number would be wrong for almost everybody. What I can give you today is a written quote against your actual numbers, this week, with the price held. What I will not do is invent a figure to get off the phone. The one published number I can point at is the food floor, which starts at fourteen dollars per person, and that is Main Event's own figure on its own page.",
    cost: "The sales manager's time, which is what the role is for. It also costs the deal any chance of being closed by a website, which is the trade Main Event has already made on purpose.",
    severity: "structural",
    source: "https://www.mainevent.com/events/corporate-events/",
    provenance: "public",
  },
  {
    id: "no-opening-date",
    short: "No opening date",
    voice:
      "You do not have an opening date. How am I supposed to book a June grad night with a venue that cannot tell me it will be open in June?",
    lanes: [
      "schools",
      "colleges",
      "faith-nonprofit",
      "fitness-youth-sports",
      "corporate",
      "local-retail-food",
    ],
    why: "The single hardest fact about this venue and there is no getting around it. Main Event publishes the Brea address, the phone number and the attraction list, and publishes no opening date and no hours. A school that moves grad night and then finds the building shut has a bus full of seniors and a headline.",
    answer:
      "Do not argue with it, and never guess at a date. Separate the two things they are actually being asked for: a decision, and a commitment. The ask before an opening date exists is a place in line, not a deposit. First pick of any date in opening month, held at no cost, with the hold converting or releasing the day Main Event publishes a date. If the date lands wrong for them, they walk away having lost nothing, which is precisely why they can say yes to it now.",
    cost: "Zero in cash and something real in optionality: a held date cannot be sold to anybody else while it is held. The register tracks how many holds are outstanding for exactly that reason.",
    offerId: "first-fifty",
    severity: "structural",
    provenance: "public",
  },
  {
    id: "cannot-tour",
    short: "Cannot tour it",
    voice:
      "I am not signing for a venue I have not walked. I have three hundred people and a board that will ask me whether I have seen the room.",
    lanes: [
      "corporate",
      "hospitality-civic",
      "auto-finance",
      "schools",
      "healthcare",
      "colleges",
    ],
    why: "Correct, and any buyer who did not say this would be worse at their job. Nobody signs a holiday party contract for a room that does not exist yet. The hospitality and civic lane converts on the tour and almost nowhere else, because a hotel sales director will not recommend a building they have not seen.",
    answer:
      "Offer the walk that does exist. A hard hat tour of the site during construction, for the largest buyers and for the referral partners, is more memorable than a finished walkthrough and can be given weeks earlier. What Main Event does publish for Brea is specific and checkable: more than twenty six lanes, a multi level laser tag arena, Gravity Ropes, over a hundred games, private party rooms and dedicated meeting space. Walk them through that list, then walk them through the actual building in a hard hat, then ask.",
    cost: "An hour of the sales manager's time, plus whatever the general contractor says about site access and hard hats. No cash.",
    offerId: "founding-partner-tour",
    severity: "high",
    provenance: "illustrative",
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
    source: "Reply recorded in data/book.ts from Fairway Ford, 10 September 2026",
    provenance: "illustrative",
  },
  {
    id: "unproven-venue",
    short: "Unproven venue",
    voice:
      "There are no reviews, no photographs of your building and nobody I know has been. If the night goes badly it is my name on it.",
    lanes: ALL_LANES,
    why: "The buyer is not worried about the venue, they are worried about themselves. Whoever books the staff party owns the staff party, and the downside of a bad one is personal in a way the upside of a good one never is. No amount of enthusiasm about Gravity Ropes touches that.",
    answer:
      "Move the risk off them. Two things do it. First, point at the chain rather than the building: Main Event operates around sixty locations and the Brea site is a company build, not a franchise experiment, so the operating standard is not being invented here. Second, make the first commitment small. A Spirit Night or a Play It Forward voucher block is a low stakes way to put their group inside the building once, on published terms, and the organisation that has already run one small thing with you is the organisation that books the three hundred person night the following year.",
    cost: "Twenty percent of sales on a Spirit Night, which is Main Event's own published programme, on a night that would otherwise have been empty. The venue keeps the other eighty percent of revenue it would not have had.",
    offerId: "spirit-night-first-quarter",
    severity: "high",
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
      "Get in the budget rather than around it. The useful ask is not for money, it is for a line: what would you need from me, in writing, in time for the budget to be built. A quote with a held rate, dated before their planning cycle, costs them nothing to file and puts the venue inside the document that decides next year. Then ask what is spendable this year, because there is nearly always a small discretionary pot, and a forty person staff appreciation lunch out of it is a foot in a door that opens properly in twelve months.",
    cost: "A rate held across a fiscal boundary, which is a real commitment: the venue is agreeing to honour a number before it knows what its own opening demand looks like.",
    offerId: "midweek-daytime-lock",
    severity: "medium",
    provenance: "illustrative",
  },
  /*
    THE ONE WITH THE GENUINELY INTERESTING ANSWER, kept last because it is
    the one a reader is most likely to remember.
  */
  {
    id: "we-use-dave-and-busters",
    short: "We use Dave and Buster's",
    voice:
      "We already do this at Dave and Buster's every year and it works fine. Why would we move it?",
    lanes: ["corporate", "auto-finance", "healthcare", "colleges", "hospitality-civic"],
    why: "A fair question, and the answer that most reps would reach for is the wrong one. The instinct is to attack the competitor. That is a bad idea in general and a strange idea here in particular.",
    answer:
      "Say the thing they do not expect: Dave and Buster's and Main Event have had the same parent company since 2022, so this is not a pitch to switch brands and there is no point pretending otherwise. What changes is the format and the geography. Their annual night is arcade and food; this one is more than twenty six bowling lanes plus a multi level laser tag arena plus Gravity Ropes plus over a hundred games, which is a different evening for the same group, and it is in Brea rather than wherever they have been driving. Then ask the question that actually moves it: if the December night is already spoken for, what is the second occasion. Almost every organisation has one, and nobody is defending it.",
    cost: "Nothing, and it buys a great deal. A rep who volunteers the awkward fact about ownership before the buyer finds it is a rep the buyer believes on the next twelve things.",
    severity: "medium",
    source: "https://www.mainevent.com/about-us/",
    provenance: "public",
  },
];

export const OBJECTION_BY_ID: Record<string, Objection> = Object.fromEntries(
  OBJECTIONS.map((o) => [o.id, o]),
);

/**
 * Which objections a given lane actually hits.
 *
 * A register that shows all seven on every lane board is a register
 * nobody reads twice. A school is never told to go and use Dave and
 * Buster's instead, and a memory care community is not worried about
 * its holiday party contract.
 */
export function objectionsForLane(lane: Lane): Objection[] {
  return OBJECTIONS.filter((o) => o.lanes.includes(lane));
}

export const SEVERITY_META: Record<
  Objection["severity"],
  { label: string; glyph: string; cssVar: string; note: string }
> = {
  structural: {
    label: "Structural",
    glyph: "▲",
    cssVar: "var(--risk)",
    note: "True of every conversation, in every lane, until the venue opens. These do not get solved, they get answered well.",
  },
  high: {
    label: "High",
    glyph: "◑",
    cssVar: "var(--warn)",
    note: "Blocks the largest bookings specifically. Answerable, and the answer costs the venue something.",
  },
  medium: {
    label: "Medium",
    glyph: "○",
    cssVar: "var(--neutral)",
    note: "Comes up often, rarely fatal, and usually contains the next occasion inside the refusal.",
  },
};
