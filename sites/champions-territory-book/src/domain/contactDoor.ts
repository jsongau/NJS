/**
 * IS THIS ADDRESS A DOOR YOU CAN WALK THROUGH, OR A DOOR THAT EXISTS.
 *
 * Fifty two of the addresses in data/prospects.ts are withheld: the row
 * carries the real domain and the words "[named staff, address
 * withheld]" where the local part used to be, and the argument for that
 * is written at the top of that file. The short version is that a role
 * address was published so strangers would write to it, and a person's
 * address at a school district was published because a directory
 * obliged the district, which is not the same decision by the same
 * party.
 *
 * THE INTERFACE HAS TO KNOW THE DIFFERENCE, because a mailto built over
 * a withheld local part is a link that opens a mail client addressed to
 * nobody, which is worse than no link at all: it looks like it worked.
 *
 * So the rule is one predicate, used at both places an address renders.
 * A withheld address still SHOWS, because the finding on those screens
 * is that a door exists, and hiding it would delete the finding along
 * with the address. It just stops being a link and starts carrying the
 * withheld provenance value it has always deserved.
 */
export const WITHHELD_LOCAL_PART = "[named staff, address withheld]";

export function isWithheldEmail(email: string | undefined): boolean {
  return typeof email === "string" && email.startsWith(WITHHELD_LOCAL_PART);
}

/** True only when the address can actually be written to. */
export function isReachableEmail(email: string | undefined): boolean {
  return typeof email === "string" && email.length > 0 && !isWithheldEmail(email);
}
