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
