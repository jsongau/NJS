import type { Account } from "@/domain/types";
import { CHANNEL_META, POURS_PER_BOTTLE } from "@/domain/channels";

/**
 * How fast something moves, said in the unit the reader actually uses.
 *
 * ── THE PROBLEM THIS SOLVES ───────────────────────────────────────
 * The model stores one number: modelled cases a week. That number is
 * correct everywhere and READABLE almost nowhere on the on-premise side.
 * "0.31 cases a week" is not a sentence a bar manager has ever said. Nor
 * is "1 case a week", which is what the old integer floor turned it
 * into, and which happens to be three times what that bar actually
 * pours. The rounding was not a cosmetic problem: it was the app telling
 * a bar to triple its order.
 *
 * ── ONE FACT, THREE UNITS ─────────────────────────────────────────
 * So the stored fact stays a case rate — one number, one home — and this
 * function is the only place allowed to turn it into words. At a bottle
 * shop it says cases, because a shop orders and shelves in cases. At a
 * bar it says BOTTLES, because that is what goes on the back bar, and it
 * says POURS, because that is the number that tells a bar manager
 * whether the ask is reasonable before they have to think about it.
 *
 * A rep who tells a pub "this is about five bottles a week, call it
 * eighty drinks" is speaking the manager's language. A rep who says "0.4
 * cases" is speaking the ERP's.
 *
 * ── WHY IT LIVES IN THE DOMAIN AND NOT IN A COMPONENT ─────────────
 * Because the email needs it too, and the issue detail, and the order
 * line reason. A formatter that lives in one component gets copied into
 * the next one, and then the email says cases while the screen says
 * bottles about the same row. That has already happened once in this
 * codebase, with the weekly rate parsed back out of an email sentence by
 * regex, and it shipped a message with a hole in the middle of it.
 */

export interface WeeklyRate {
  /** The stored fact, untouched. */
  cases: number;
  /** Bottles, jars or cans a week. Whole units. */
  units: number;
  /** Serves a week. Null off-premise, where nobody is pouring. */
  pours: number | null;
  /** "about 4 cases a week" / "about 5 bottles a week, near 80 pours" */
  text: string;
  /** "4 cs/wk" / "5 btl/wk" — for a dense cell. */
  short: string;
  /** True when the rate rounds to nothing in the reader's unit. */
  belowUnit: boolean;
}

/**
 * ROUNDING IS DONE ONCE, HERE, AND ALWAYS DOWNWARD AT THE BOUNDARY.
 *
 * A rate of 0.9 bottles a week is reported as "under a bottle a week"
 * rather than rounded up to one. Rounding a rate up is how a modelled
 * territory quietly inflates: do it on four hundred rows and the
 * territory total is meaningfully larger than the model that produced
 * it, with no single number visibly wrong.
 */
export function weeklyRate(
  account: Pick<Account, "channel"> | undefined,
  cases: number,
  unitsPerCase: number,
): WeeklyRate {
  const onPremise = account
    ? CHANNEL_META[account.channel].venueClass === "on-premise"
    : false;

  const rawUnits = cases * (unitsPerCase || 12);

  if (!onPremise) {
    const whole = Math.round(cases);
    const belowUnit = cases < 0.5;
    return {
      cases,
      units: Math.round(rawUnits),
      pours: null,
      text: belowUnit
        ? "under a case a week"
        : `about ${whole} ${whole === 1 ? "case" : "cases"} a week`,
      short: belowUnit ? "<1 cs/wk" : `${whole} cs/wk`,
      belowUnit,
    };
  }

  const units = Math.floor(rawUnits);
  const pours = Math.round(rawUnits * POURS_PER_BOTTLE);
  const belowUnit = units < 1;

  return {
    cases,
    units,
    pours,
    text: belowUnit
      ? "under a bottle a week"
      : `about ${units} ${units === 1 ? "bottle" : "bottles"} a week, near ${pours} pours`,
    short: belowUnit ? "<1 btl/wk" : `${units} btl/wk`,
    belowUnit,
  };
}

/**
 * The order increment, which is a different number in each lane and was
 * a single hardcoded 4 before this roster existed.
 *
 * FOUR CASES IS A NORMAL MINIMUM AT A BOTTLE SHOP and it is an absurd
 * one at a pub: forty-eight bottles of one flavour into a back bar that
 * holds four is a year of stock and a manager who stops taking the call.
 * On-premise orders in ones, because that is how a bar orders.
 */
export function orderIncrementFor(
  account: Pick<Account, "channel"> | undefined,
  casesPerPallet: number,
): number {
  if (!account) return casesPerPallet >= 96 ? 6 : 4;
  const { venueClass } = CHANNEL_META[account.channel];
  if (venueClass === "on-premise") return 1;
  /*
    A forecourt is on the retail side of the fork and orders like a bar.

    The pallet-based increment sent Mobil six cases of 50ml minis — three
    hundred and sixty bottles into a shop whose entire spirits set is one
    counter unit. The rule that produced it was not wrong about pallets;
    it was wrong to think pallets have anything to do with an account
    that has never seen one.
  */
  if (account.channel === "fuel-convenience") return 1;
  return casesPerPallet >= 96 ? 6 : 4;
}

/**
 * Round an aggregate of case rates for display.
 *
 * WHY THIS EXISTS AT ALL. The stored rate went fractional so a bar could
 * be described honestly, and the first thing that did was put
 * `39.76000000000001` in the territory KPI strip — binary floating point
 * doing exactly what it always does, in the largest numerals on the
 * page. Nothing was wrong with the arithmetic. Everything was wrong with
 * printing it raw.
 *
 * One decimal, and the trailing zero dropped, so a sum of whole cases
 * still reads as a whole number and a sum that genuinely has a fraction
 * in it still shows it. Every selector that adds case rates together
 * ends with this call, which is why no component has to remember to.
 */
export function roundCases(n: number): number {
  return Math.round(n * 10) / 10;
}
