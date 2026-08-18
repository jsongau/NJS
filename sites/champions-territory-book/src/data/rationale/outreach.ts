import type { ScreenRationale } from "./types";

/**
 * EMPTIED ON PURPOSE, AND THIS COMMENT IS THE RECEIPT.
 *
 * The console this application was copied from shipped a second reading:
 * twenty eight screens of prose arguing for every decision on every
 * screen, addressed at /rationale and switched on by a pair of keys on
 * the strip. That prose was written about a single entertainment venue.
 * Every sentence of it named the venue, its rooms, its programmes and
 * its opening, and not one of those things exists in a division
 * marketing console.
 *
 * There were three options and only one of them was honest.
 *
 *   REWRITE IT      Twenty eight screens of argument about a business
 *                   this desk has no inside knowledge of. The result
 *                   would have read as confident and been invented,
 *                   which is the one failure mode this whole application
 *                   is built to avoid.
 *   SHIP IT AS IT   A reader who found the door would have been handed
 *                   an essay about a bowling alley.
 *   EMPTY IT        This.
 *
 * So the registry is empty, RATIONALE_AVAILABLE is false, the mode's
 * keys are not rendered, and every /rationale URL redirects to the
 * console screen at the same address rather than 404ing. The types, the
 * routes, the stubs and the switch all survive intact, so the second
 * reading is a room with nothing in it rather than a room that was
 * demolished. When there is something true to say in it, it opens.
 *
 * The argument the old prose carried has not been thrown away. It moved
 * into the block comments above the things it was arguing about, which
 * is where a working engineer reads it anyway.
 */
export const OUTREACH_RATIONALE: ScreenRationale[] = [];
