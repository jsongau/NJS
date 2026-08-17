import type { MouseEvent, ReactNode } from "react";
import { bowlerSlug } from "@/domain/cup";
import { LEAGUE_TEAM_BY_ID } from "@/data/leagues";
import { useCupSurfaceController } from "@/state/cupSurfaceContext";
import styles from "./CupNames.module.css";

/**
 * THE CALL SITES FOR THE THREE SURFACES THIS FOLDER DOES NOT OWN.
 *
 * ── WHAT THIS FILE IS AND WHAT IT IS NOT ──────────────────────────
 * The team surface, the bowler profile and the tale of the tape are
 * being built at the same time as this board, in
 * `components/cup/profile/` and `components/cup/tape/`, as modals
 * addressed by the URL exactly the way `state/RecordProvider.tsx`
 * already addresses an organisation record with `?record=`.
 *
 * THIS FILE DOES NOT BUILD ANY OF THEM AND MUST NOT. What it does is
 * make every team name, every handle and every fixture on the cup board
 * a real button, so that the day the provider mounts there is nothing to
 * go and find. Every press writes ONE search parameter and stops. No
 * dialog, no focus trap, no state, no second copy of anything.
 *
 * ── THE ONE THING THE OTHER AGENT HAS TO CHANGE ───────────────────
 * `useCupSurfaces` below is the single call site. When the profile
 * surface publishes its hook, the body of that one function becomes a
 * call to it and every name on this board is wired. Nothing else in
 * `components/cup/board/` or `components/cup/bracket/` knows these
 * parameters exist.
 *
 * The three parameter names are exported so the receiving provider can
 * import them rather than spell them again, which is the only way two
 * files can agree on a key without a comment asking them to.
 *
 * ── WHY THE NAME IS THE CONTROL ───────────────────────────────────
 * The owner asked for team names to be clickable. So the name itself is
 * the button, everywhere it appears, and there is no second "open"
 * control beside it competing for the same press. It is a real button
 * rather than a span with a handler: focusable, announced as a button,
 * fires on Enter and on Space, and it takes the focus ring the rest of
 * this application already draws. It looks like the type around it until
 * it is hovered or focused, because a board with forty names painted as
 * links is a board of one colour.
 *
 * A NAME NEVER TRUNCATES. Bowling teams name themselves badly on
 * purpose, and "Rolling in the Deep End" is the point rather than an
 * inconvenience. Every name here wraps and the cell is sized for the two
 * line case, so nothing on the board moves when one of them is long.
 */

/** The search parameter a cup team surface is addressed by. */
export const CUP_TEAM_PARAM = "team";

/** The search parameter a bowler profile is addressed by, as a slug. */
export const CUP_BOWLER_PARAM = "bowler";

/** The search parameter a tale of the tape is addressed by, as a fixture. */
export const CUP_TAPE_PARAM = "tape";

export interface CupSurfaces {
  openTeam: (teamId: string) => void;
  openBowler: (handle: string) => void;
  openTape: (fixtureId: string) => void;
}

/**
 * THE CALL SITE. One function, and it is the whole of the coupling.
 *
 * It is now the controller in `state/CupSurfaceProvider.tsx`, which
 * mounts the three dialogs once and addresses the open one in the URL
 * using the three parameter names above. Every name on this board, and
 * every name on the leagues board, opens the same surface, and nothing
 * else in `components/cup/board/` or `components/cup/bracket/` knows
 * that a dialog exists.
 *
 * The context it reads is a leaf module that imports only React, which
 * is what keeps this file out of a circle: the provider imports the team
 * surface, the team surface imports the names above, and the names read
 * the context rather than the provider.
 */
export function useCupSurfaces(): CupSurfaces {
  const { openTeam, openBowler, openTape } = useCupSurfaceController();
  return { openTeam, openBowler, openTape };
}

function stop(e: MouseEvent<HTMLButtonElement>) {
  /* A name very often sits inside something that reacts to a click: a
     bracket cell, a fixture row, a ladder row. Opening the surface is the
     whole of what this press means, so it stops there. */
  e.preventDefault();
  e.stopPropagation();
}

export function TeamName({
  teamId,
  name,
  className,
  children,
}: {
  teamId: string;
  /** Saves a lookup where the caller already holds the team. */
  name?: string;
  className?: string;
  children?: ReactNode;
}) {
  const { openTeam } = useCupSurfaces();
  const label = name ?? LEAGUE_TEAM_BY_ID[teamId]?.name ?? teamId;

  return (
    <button
      type="button"
      className={[styles.name, className].filter(Boolean).join(" ")}
      aria-haspopup="dialog"
      data-cup-team={teamId}
      title={`${label}. Opens the team.`}
      onClick={(e) => {
        stop(e);
        openTeam(teamId);
      }}
    >
      <span className={styles.label}>{children ?? label}</span>
      <span className="visually-hidden">, open team</span>
    </button>
  );
}

export function BowlerHandle({
  handle,
  className,
  children,
}: {
  handle: string;
  className?: string;
  children?: ReactNode;
}) {
  const { openBowler } = useCupSurfaces();

  return (
    <button
      type="button"
      className={[styles.name, styles.handle, className].filter(Boolean).join(" ")}
      aria-haspopup="dialog"
      data-cup-bowler={bowlerSlug(handle)}
      title={`${handle}. A handle, not a name. Opens the bowler.`}
      onClick={(e) => {
        stop(e);
        openBowler(handle);
      }}
    >
      <span className={styles.label}>{children ?? handle}</span>
      <span className="visually-hidden">, open bowler</span>
    </button>
  );
}

/**
 * The press that opens a matchup, from a fixture row or a bracket cell.
 *
 * It carries a word rather than only a glyph, because a row of unlabelled
 * marks down the right hand edge of a list is a column of shrugs.
 */
export function MatchupPress({
  fixtureId,
  label = "Card",
  accessibleName,
  className,
}: {
  fixtureId: string;
  label?: string;
  /** What the press opens, said in full for anything listening. */
  accessibleName: string;
  className?: string;
}) {
  const { openTape } = useCupSurfaces();

  return (
    <button
      type="button"
      className={[styles.press, className].filter(Boolean).join(" ")}
      aria-haspopup="dialog"
      data-cup-tape={fixtureId}
      title={`${accessibleName}. Opens the matchup card.`}
      onClick={(e) => {
        stop(e);
        openTape(fixtureId);
      }}
    >
      <span aria-hidden="true" className={styles.pressGlyph}>
        ◈
      </span>
      <span>{label}</span>
      <span className="visually-hidden">, {accessibleName}</span>
    </button>
  );
}
