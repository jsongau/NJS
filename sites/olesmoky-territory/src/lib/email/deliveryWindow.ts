/**
 * The cutoff.
 *
 * Every persuasion finding that survived scrutiny points at the same
 * thing: a real, short, operational deadline is the single strongest
 * legitimate lever in a reorder email. Shu and Gneezy's field experiments
 * put it at 31% redemption on a three-week deadline against 6% on two
 * months, and Zhu, Yang and Hsee found the pull is STRONGEST on people
 * who feel busy — which is every store manager alive.
 *
 * Which is exactly why it must be true. A manufactured deadline is the
 * fastest way to burn a route relationship, because a manager on a weekly
 * call will find out within one delivery cycle. So the cutoff here is a
 * wholesaler's load schedule, which is a real thing that really works this
 * way: a load is built the day before it rolls, and an order that misses
 * the build waits for the next one.
 *
 * Modeled, like every other operational figure in this prototype. Southern Glazer's
 * does not publish its load schedule.
 */
export const DELIVERY_WINDOW = {
  /** When the wholesaler stops adding to the load. */
  cutoffLabel: "Thursday at 4pm",
  /** When it lands if it makes that cutoff. */
  deliveryLabel: "Friday",
  /** For prose that needs the possessive. */
  loadLabel: "Friday's delivery",
} as const;
