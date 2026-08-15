import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "react-router-dom";
import { bowlerSlug } from "@/domain/cup";
import {
  CUP_BOWLER_PARAM,
  CUP_TAPE_PARAM,
  CUP_TEAM_PARAM,
} from "@/components/cup/board/CupNames";
import { TeamSurface } from "@/components/cup/profile/TeamSurface";
import { BowlerProfile } from "@/components/cup/profile/BowlerProfile";
import { TaleOfTheTapeModal } from "@/components/cup/tape/TaleOfTheTapeModal";
import {
  CupSurfaceCtx,
  type CupSurfaceController,
} from "@/state/cupSurfaceContext";
import { useRecord } from "@/state/RecordProvider";
import { useQuotePreview } from "@/state/QuotePreviewProvider";

/**
 * THE THREE CUP SURFACES, MOUNTED ONCE, ADDRESSED BY URL.
 *
 * WHY THIS FILE EXISTS. A team name appears on the cup lead, the fixture
 * list, the bracket, the field ladder, the enrollment panel, the leagues
 * board and the league detail page. A handle appears on four of those.
 * Threading an `onOpenTeam` callback down through a bracket cell into a
 * ladder row is four layers of plumbing per surface, and the plumbing is
 * where the divergence starts. So each surface is mounted exactly once,
 * here, and every name anywhere in the application is a button that asks
 * this provider to open one.
 *
 * THE OPEN SURFACE LIVES IN THE URL, for the reasons RecordProvider
 * gives at length. `?team=pp-01`, `?bowler=boss-music` and `?tape=pf-1`
 * over any route open that card above that screen, so a card is a link
 * rather than a piece of state, it survives a reload, the back button
 * closes it because closing it is what going back means, and a proof
 * pass can reach it without learning to press a button. The three
 * parameter names are imported from `CupNames.tsx` rather than spelled
 * again, which is the only way two files can agree on a key without a
 * comment asking them to.
 *
 * ── THESE DIALOGS STACK, AND THE STACK IS THE POINT ───────────────
 * A team surface leads to a bowler. A team's run leads to a tale of the
 * tape. A tape leads back to a team. All three can therefore be open at
 * once, so this provider keeps the ORDER THEY WERE OPENED IN and hands
 * `active` to the topmost one only. Every dialog under it stands its own
 * focus trap and Escape handler down, which is exactly what the record
 * modal already does while the compose window or the quote preview is
 * over it. One layer owns the keyboard at a time and it is always the
 * top one.
 *
 * The order is derived rather than stored: a parameter that appears is
 * pushed, a parameter that goes away is dropped. On a cold load of an
 * address carrying two of them at once there is no order to recover, so
 * the fallback runs team, then tape, then bowler, deepest object last.
 *
 * ── AND IT SITS UNDER RecordProvider ──────────────────────────────
 * A team surface and a bowler profile both carry the organisation the
 * team came off the board from, as a live name that opens its record.
 * That record modal is mounted by RecordProvider, which renders it after
 * its children, so it lands above these dialogs. These therefore stand
 * their own keyboard down while a record or a quote preview is open, for
 * the same reason the record modal does it for the compose window. The
 * record modal cannot be asked to know about the cup, so the cup knows
 * about the record.
 *
 * ── THE BODY SCROLL LOCK IS HERE, ONCE ────────────────────────────
 * Three dialogs each saving and restoring `body.style.overflow` would
 * restore each other's saved value in the wrong order and leave the page
 * behind either frozen or scrolling. So the lock is taken once while any
 * of the three is open, with the scrollbar width compensated exactly as
 * the quote preview does it, so opening a card moves nothing behind it.
 */

type SurfaceKey = "team" | "tape" | "bowler";

/** Deepest object last, for a cold load that cannot recover an order. */
const COLD_ORDER: SurfaceKey[] = ["team", "tape", "bowler"];

export function CupSurfaceProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useSearchParams();
  const record = useRecord();
  const quote = useQuotePreview();

  const teamId = params.get(CUP_TEAM_PARAM);
  const slug = params.get(CUP_BOWLER_PARAM);
  const tapeFixtureId = params.get(CUP_TAPE_PARAM);

  const open = useMemo<Record<SurfaceKey, string | null>>(
    () => ({ team: teamId, tape: tapeFixtureId, bowler: slug }),
    [teamId, tapeFixtureId, slug],
  );

  /**
   * The order the open cards were raised in, newest last.
   *
   * Held in state rather than a ref because the render has to read it,
   * and reconciled from the parameters rather than written at the press,
   * so that a back button, a pasted address and a reload all produce a
   * stack rather than only the presses this session saw.
   */
  const [stack, setStack] = useState<SurfaceKey[]>(() =>
    COLD_ORDER.filter((k) => open[k] !== null),
  );

  useEffect(() => {
    setStack((prev) => {
      const kept = prev.filter((k) => open[k] !== null);
      const added = COLD_ORDER.filter(
        (k) => open[k] !== null && !kept.includes(k),
      );
      const next = [...kept, ...added];
      const same =
        next.length === prev.length && next.every((k, i) => k === prev[i]);
      return same ? prev : next;
    });
  }, [open]);

  const anyOpen = stack.length > 0;

  /**
   * The element that raised the card, per surface, so focus goes back to
   * the exact control rather than to the top of the document.
   *
   * Captured at the press, because by the time a dialog unmounts the
   * active element is a control inside it. A reader who opened the
   * fortieth handle on a roster belongs back on the fortieth handle.
   */
  const openers = useRef<Partial<Record<SurfaceKey, HTMLElement | null>>>({});

  const raise = useCallback(
    (key: SurfaceKey, param: string, value: string) => {
      openers.current[key] = document.activeElement as HTMLElement | null;
      const next = new URLSearchParams(params);
      next.set(param, value);
      /* Pushed rather than replaced, so the back button closes the card.
         Opening one is a place a reader went. */
      setParams(next);
    },
    [params, setParams],
  );

  const drop = useCallback(
    (key: SurfaceKey, param: string) => {
      const next = new URLSearchParams(params);
      next.delete(param);
      /* Replaced on the way out, so opening and closing three cards does
         not bury the board under six history entries. */
      setParams(next, { replace: true });
      const opener = openers.current[key] ?? null;
      openers.current[key] = null;
      /* Focus goes back on the next frame, once the dialog has gone and
         the control underneath is reachable again. Where the opener has
         been re-rendered away, which happens when a filtered list moves
         under a card, focus lands on whatever the page marked as its
         return and then on the main region, so it is never nowhere. */
      window.requestAnimationFrame(() => {
        if (opener && opener.isConnected && typeof opener.focus === "function") {
          opener.focus();
          return;
        }
        const fallback =
          document.querySelector<HTMLElement>("[data-record-return]") ??
          document.querySelector<HTMLElement>("main");
        if (!fallback) return;
        if (!fallback.hasAttribute("tabindex"))
          fallback.setAttribute("tabindex", "-1");
        fallback.focus?.();
      });
    },
    [params, setParams],
  );

  /**
   * The page behind does not scroll, and does not jump when it stops.
   *
   * Hiding the body overflow removes the scrollbar, and on a desktop
   * with classic scrollbars that shifts the layout fifteen pixels left
   * and back again. The padding compensates for exactly the width that
   * disappeared.
   */
  useEffect(() => {
    if (!anyOpen) return undefined;
    const el = document.body;
    const prevOverflow = el.style.overflow;
    const prevPadding = el.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    el.style.overflow = "hidden";
    if (gap > 0) el.style.paddingRight = `${gap}px`;
    return () => {
      el.style.overflow = prevOverflow;
      el.style.paddingRight = prevPadding;
    };
  }, [anyOpen]);

  const value = useMemo<CupSurfaceController>(
    () => ({
      teamId,
      bowlerSlug: slug,
      tapeFixtureId,
      openTeam: (id) => raise("team", CUP_TEAM_PARAM, id),
      openBowler: (handle) =>
        raise("bowler", CUP_BOWLER_PARAM, bowlerSlug(handle)),
      openTape: (fixtureId) => raise("tape", CUP_TAPE_PARAM, fixtureId),
      closeTeam: () => drop("team", CUP_TEAM_PARAM),
      closeBowler: () => drop("bowler", CUP_BOWLER_PARAM),
      closeTape: () => drop("tape", CUP_TAPE_PARAM),
    }),
    [teamId, slug, tapeFixtureId, raise, drop],
  );

  /* The topmost cup card owns the keyboard, unless a record or a quote
     preview is over the top of all of them, in which case none of them
     does. */
  const overlaid = record.openId !== null || quote.openId !== null;
  const top = stack.length > 0 ? stack[stack.length - 1] : null;

  return (
    <CupSurfaceCtx.Provider value={value}>
      {children}

      {stack.map((key) => {
        const active = !overlaid && key === top;
        if (key === "team" && teamId) {
          return (
            /* Keyed by id so opening a second team while the first is
               open remounts rather than reconciles. One team's roster
               left under another team's name is the worst bug this
               surface can have. */
            <TeamSurface
              key={`team-${teamId}`}
              teamId={teamId}
              active={active}
              onClose={value.closeTeam}
            />
          );
        }
        if (key === "tape" && tapeFixtureId) {
          return (
            <TaleOfTheTapeModal
              key={`tape-${tapeFixtureId}`}
              fixtureId={tapeFixtureId}
              active={active}
              onClose={value.closeTape}
            />
          );
        }
        if (key === "bowler" && slug) {
          return (
            <BowlerProfile
              key={`bowler-${slug}`}
              slug={slug}
              active={active}
              onClose={value.closeBowler}
            />
          );
        }
        return null;
      })}
    </CupSurfaceCtx.Provider>
  );
}
