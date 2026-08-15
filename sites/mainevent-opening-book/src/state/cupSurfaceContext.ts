import { createContext, useContext } from "react";

/**
 * THE CONTROLLER FOR THE THREE CUP SURFACES, AS A LEAF MODULE.
 *
 * It holds the context object and nothing else: no components, no data,
 * no selectors. That is the whole reason it is its own file.
 *
 * `components/cup/board/CupNames.tsx` calls this to turn every name on
 * the board into a press. `state/CupSurfaceProvider.tsx` supplies the
 * value and mounts the dialogs, and those dialogs render names, which
 * come from CupNames. If the context lived in the provider, that circle
 * would close: CupNames would import the provider, the provider would
 * import the team surface, and the team surface would import CupNames
 * again. Putting the context in a file that imports only React breaks
 * the circle at the only place it can be broken cleanly.
 */

export interface CupSurfaceController {
  /** The team whose surface is open, as a team id, or null. */
  teamId: string | null;
  /** The bowler whose profile is open, as a handle slug, or null. */
  bowlerSlug: string | null;
  /** The fixture whose tale of the tape is open, or null. */
  tapeFixtureId: string | null;
  openTeam: (teamId: string) => void;
  /** Takes the handle itself. The slug is derived where it is written. */
  openBowler: (handle: string) => void;
  openTape: (fixtureId: string) => void;
  closeTeam: () => void;
  closeBowler: () => void;
  closeTape: () => void;
}

let warned = false;

/**
 * What a name does with no provider above it.
 *
 * It warns once and does nothing, in the shape RecordProvider and
 * QuotePreviewProvider already use. A missing provider should not take
 * down a board of sixteen teams and eighty handles, and the warning
 * names the fix rather than describing the symptom.
 */
const FALLBACK: CupSurfaceController = {
  teamId: null,
  bowlerSlug: null,
  tapeFixtureId: null,
  openTeam: warnOnce,
  openBowler: warnOnce,
  openTape: warnOnce,
  closeTeam: () => {},
  closeBowler: () => {},
  closeTape: () => {},
};

function warnOnce() {
  if (warned) return;
  warned = true;
  // eslint-disable-next-line no-console
  console.warn(
    "A cup name was pressed with no CupSurfaceProvider above it. Wrap the app shell in <CupSurfaceProvider> so the team, the bowler and the tape have somewhere to render.",
  );
}

export const CupSurfaceCtx = createContext<CupSurfaceController>(FALLBACK);

/** The whole controller. Most callers want the three open functions. */
export function useCupSurfaceController(): CupSurfaceController {
  return useContext(CupSurfaceCtx);
}
