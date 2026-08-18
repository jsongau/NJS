import type { Prospect } from "./types";
import { PACKAGE_BY_ID } from "@/data/packages";

/**
 * THE PORTFOLIO PROFILE, AND WHY IT IS NOW ALLOWED TO BE ABSENT.
 *
 * This console was copied from one built around a single site, where
 * every row on the board was an organisation you could put one proposal
 * to. Two fields carried that idea: a modelled range of reachable doors,
 * and the offer to lead with. Every screen assumed both were present,
 * because on that board they always were.
 *
 * This board carries three other kinds of row. A competing plumbing
 * contractor has no door count and no offer of ours to lead with;
 * neither does one of the division's own sibling brands. The fields are
 * not zero for those rows and they are not unknown, they are NOT
 * APPLICABLE, and those are three different things that a number cannot
 * tell apart.
 *
 * So the fields became optional and this file is the only place allowed
 * to read them. Every caller gets either a complete profile or null, and
 * null means "this row is not that kind of row" rather than "we have not
 * checked yet".
 *
 * WHY NOT DEFAULT THE MISSING VALUES TO ZERO. Because zero is a number,
 * and a number flows into a crew capacity model, a score, a segment
 * total and a sentence in a proposal. "0 to 0 doors" would have rendered
 * on screen and averaged into a service line's mean portfolio size, and
 * both of those are the quiet kind of wrong this project has spent its
 * whole life avoiding.
 *
 * The type and the two exported names are inherited join keys read in a
 * dozen other files and are left alone. What they mean is written here.
 */
export interface GroupProfile {
  low: number;
  high: number;
  mid: number;
  basis: string;
}

export function groupProfile(p: Prospect): GroupProfile | null {
  if (typeof p.headcountLow !== "number") return null;
  if (typeof p.headcountHigh !== "number") return null;
  return {
    low: p.headcountLow,
    high: p.headcountHigh,
    mid: Math.round((p.headcountLow + p.headcountHigh) / 2),
    basis: p.headcountBasis ?? "",
  };
}

/** True when the row is the kind you can put a portfolio proposal to. */
export function isBookable(p: Prospect): boolean {
  return groupProfile(p) !== null && Boolean(p.leadPackageId);
}

/** The offer to lead with, or undefined when the row has none. */
export function leadPackage(p: Prospect) {
  return p.leadPackageId ? PACKAGE_BY_ID[p.leadPackageId] : undefined;
}

/**
 * The sentence a screen prints where a door count would have gone. It
 * names the reason rather than leaving a blank, because a blank in a
 * table reads as a bug and a sentence reads as a decision.
 */
export const NO_GROUP_PROFILE = "Not a portfolio opportunity";
