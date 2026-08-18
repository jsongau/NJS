import type { ScreenRationale } from "./types";
import { BOARD_RATIONALE } from "./board";
import { LANES_RATIONALE } from "./lanes";
import { OUTREACH_RATIONALE } from "./outreach";
import { BOOK_RATIONALE } from "./book";
import { FLOOR_RATIONALE } from "./floor";
import { REFERENCE_RATIONALE } from "./reference";

export type { ScreenRationale };

export const SCREEN_RATIONALE: ScreenRationale[] = [
  ...BOARD_RATIONALE,
  ...LANES_RATIONALE,
  ...OUTREACH_RATIONALE,
  ...BOOK_RATIONALE,
  ...FLOOR_RATIONALE,
  ...REFERENCE_RATIONALE,
];

export const RATIONALE_BY_PATH: Record<string, ScreenRationale> =
  Object.fromEntries(SCREEN_RATIONALE.map((r) => [r.path, r]));

/**
 * IS THE SECOND READING OPEN.
 *
 * Rationale is a mode rather than a page, so switching it off is not a
 * matter of deleting a route: there is a pair of keys on the bar, a
 * sentence at the foot of Method, a link on the Maps takeover and a
 * whole section of the front door that all point at it. One flag closes
 * every one of them, and nothing in the mode itself is deleted.
 *
 * WHAT FALSE DOES, in the four places that read this:
 *   MegaNav      the Console and Rationale pair is not rendered at all,
 *                which gives the strip back about a hundred and eighty
 *                pixels it can spend on the queue keys.
 *   App          /rationale and /rationale/anything redirect to the
 *                console screen at the same address, replacing the entry
 *                so the back button does not bounce.
 *   StartPage    the "two ways to read it" section is not rendered.
 *                Advertising a door that is locked is worse than a wall.
 *   MethodPage   the sentence pointing at the other half is dropped.
 *   TradeAreaPage the Maps takeover's Rationale link is dropped.
 *
 * The 28 rationale screens, their text, their routes and their
 * prerendered stubs all still exist and still build. That is deliberate:
 * this is a switch, not a demolition, and the stubs staying in place is
 * what keeps every /rationale URL a redirect rather than a 404 for
 * anybody holding an old link.
 *
 * scripts/proof-both-modes.mjs READS THIS VALUE OUT OF THIS FILE and
 * proves the closed contract instead of the open one when it is false.
 * A proof that asserts the open contract against a deliberately closed
 * mode is the sixth version of this project's oldest mistake.
 */
export const RATIONALE_AVAILABLE = false;

/**
 * The two directions of one address.
 *
 * A console screen at /lanes is explained at /rationale/lanes, and the
 * desk at "/" is explained at "/rationale". Both are pure string work
 * with no table to fall out of step, which matters because the rail
 * builds every one of its links by running its own unchanged `to` value
 * through toRationale when the mode is on.
 */
export function toRationale(consolePath: string): string {
  return consolePath === "/" ? "/rationale" : `/rationale${consolePath}`;
}

export function toConsole(rationalePath: string): string {
  if (rationalePath === "/rationale") return "/";
  return rationalePath.startsWith("/rationale/")
    ? rationalePath.slice("/rationale".length)
    : rationalePath;
}

export function isRationalePath(pathname: string): boolean {
  return pathname === "/rationale" || pathname.startsWith("/rationale/");
}
