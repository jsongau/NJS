import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  isRecord,
  signatureOf,
  usePersistedReducer,
  type SliceCodec,
} from "./persist";

/**
 * WHICH GROUND THE APPLICATION IS PAINTED ON.
 *
 * tokens.css carries the dark palette on `:root` and the light one on
 * `:root[data-theme="light"]`, so the whole of this file resolves to one
 * attribute on one element. Nothing else selects a theme and no component
 * is ever told which one is on.
 *
 * ── DARK IS THE DEFAULT AND THE FALLBACK ──────────────────────────
 * The arcade ground is the product's identity, so it is what renders when
 * this file never runs: JavaScript off, storage blocked, attribute
 * missing or misspelt. Everything below can only move a reader OFF that
 * default, never onto it by accident.
 *
 * ── THREE STATES, NOT TWO ─────────────────────────────────────────
 * A reader is in one of three positions and collapsing them to a boolean
 * is what makes theme toggles behave badly. They have chosen dark, they
 * have chosen light, or THEY HAVE NOT CHOSEN, which is the state a first
 * visit is in and the only state where the operating system gets a vote.
 * So `choice` is nullable and the ground actually painted is
 * `choice ?? system`.
 *
 * That one expression is the whole of the resolution rule, and it gives
 * both halves of the requirement for free. Somebody whose machine is set
 * to light lands on light and keeps following the machine, including at
 * sunset when the machine flips on its own, because `system` is a live
 * subscription rather than a value read once. The moment they press the
 * control, `choice` is set and the system stops mattering, permanently
 * and on every later visit. A preference that keeps being overruled by
 * the operating system is not a preference.
 *
 * ── WHAT IS PERSISTED ─────────────────────────────────────────────
 * The choice, and only when there is one. state/persist.ts already owns
 * one namespaced, versioned, defensively parsed storage key, so this is a
 * slice inside it rather than a second mechanism with its own answer to
 * what happens when a browser refuses to write. A reader who has never
 * touched the control leaves no theme slice at all, which is what keeps
 * the system preference live for them.
 *
 * ── AND THE FIRST PAINT IS NOT DONE HERE ──────────────────────────
 * React mounts after the first frame, so a theme applied from this file
 * alone would flash the wrong ground on every single load. The attribute
 * is set by the blocking script in index.html, before the bundle, reading
 * the same storage key and the same media query and resolving them the
 * same way. This file is what keeps that attribute honest afterwards.
 * The two must agree; the script says so and names this file.
 */

export type Theme = "dark" | "light";

export const DEFAULT_THEME: Theme = "dark";

interface ThemeState {
  /** Null until the reader has actually chosen. See the note above. */
  choice: Theme | null;
}

type ThemeAction = { type: "CHOOSE"; theme: Theme };

const SEED: ThemeState = { choice: null };

function reducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case "CHOOSE":
      return state.choice === action.theme ? state : { choice: action.theme };
    default:
      return state;
  }
}

/**
 * The slice, versioned in its own signature rather than against seed data,
 * exactly as the rail's width is. There is no seed here to drift: a word
 * is a word. Spelling a version into the signature is what lets a later
 * change of meaning drop the old value cleanly instead of reinterpreting
 * it.
 *
 * `encode` returns null when nothing has been chosen, which removes the
 * slice entirely. That is not tidiness: an absent slice is precisely how
 * "still following the system" is stored.
 *
 * ONE THING TO KNOW BEFORE CHANGING THAT SIGNATURE. The blocking script
 * in index.html reads the stored ground without checking the signature,
 * because it cannot compute an FNV hash of a string it would have to be
 * handed by the module graph it runs before. Bump the version here and
 * every reader with a stored choice gets one load where the script paints
 * their old ground and this file then drops the slice and paints the
 * default. Once, on one load, and only if this is deliberately versioned.
 * Worth knowing; not worth a second hash in the head of the document.
 */
const THEME_CODEC: SliceCodec<ThemeState> = {
  slice: "theme",
  signature: signatureOf("theme.ground.v1"),
  encode: (state) => (state.choice ? { ground: state.choice } : null),
  decode: (raw, seed) => {
    if (!isRecord(raw)) return seed;
    const ground = raw.ground;
    /* Two words are acceptable and everything else is a corrupt payload,
       which resolves to the seed and therefore to dark. A hand-edited
       ground of "midnight" must not reach the attribute. */
    if (ground === "dark" || ground === "light") return { choice: ground };
    return seed;
  },
};

// ---------------------------------------------------------------
// What the machine is asking for
// ---------------------------------------------------------------

/**
 * The query is written for LIGHT rather than for dark on purpose. A
 * browser that has never heard of the feature, and every browser under a
 * user agent with no preference set, answers false, and false has to mean
 * the default. Asking for dark would make an unknown answer mean light.
 */
const LIGHT_QUERY = "(prefers-color-scheme: light)";

function mediaQuery(): MediaQueryList | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return null;
  }
  try {
    return window.matchMedia(LIGHT_QUERY);
  } catch {
    return null;
  }
}

function subscribeToSystem(notify: () => void): () => void {
  const mq = mediaQuery();
  if (!mq) return () => undefined;
  mq.addEventListener("change", notify);
  return () => mq.removeEventListener("change", notify);
}

function systemTheme(): Theme {
  return mediaQuery()?.matches ? "light" : DEFAULT_THEME;
}

// ---------------------------------------------------------------
// The provider
// ---------------------------------------------------------------

export interface ThemeControl {
  /** The ground actually painted right now. */
  theme: Theme;
  /** False while the operating system is still being followed. */
  chosen: boolean;
  choose: (theme: Theme) => void;
  /**
   * The other ground, in one press.
   *
   * IT FLIPS THE GROUND ON SCREEN RATHER THAN THE STORED CHOICE, and the
   * difference only shows up for the reader who has never chosen. Their
   * `choice` is null while the machine is being followed, so a toggle
   * written against the stored value would have nothing to invert and
   * would have to guess. Inverting `theme`, which is `choice ?? system`,
   * means the first press always lands on the ground the reader can see
   * they are not on. It also does the thing a first press has to do: it
   * writes a choice, and the machine stops mattering from then on.
   */
  toggle: () => void;
}

const ThemeCtx = createContext<ThemeControl>({
  theme: DEFAULT_THEME,
  chosen: false,
  choose: () => undefined,
  toggle: () => undefined,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = usePersistedReducer(reducer, SEED, THEME_CODEC);

  /* A live subscription rather than a value read at mount, because a
     machine that flips to dark at sunset should take a reader who has
     never chosen with it. useSyncExternalStore is the honest shape for a
     browser fact this app does not own. */
  const system = useSyncExternalStore(
    subscribeToSystem,
    systemTheme,
    () => DEFAULT_THEME,
  );

  const theme = state.choice ?? system;

  /**
   * A LAYOUT EFFECT, AND THAT IS THE POINT OF IT.
   *
   * On the first mount this writes what the blocking script already
   * wrote, so it costs nothing and is skipped by the guard. On a press it
   * is the write that repaints the application, and a passive effect
   * could be flushed after the browser had already painted the control in
   * its new state on the old ground. One frame of that is a control that
   * looks broken.
   */
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (root.getAttribute("data-theme") !== theme) {
      root.setAttribute("data-theme", theme);
    }
  }, [theme]);

  const choose = useCallback(
    (next: Theme) => dispatch({ type: "CHOOSE", theme: next }),
    [dispatch],
  );

  const toggle = useCallback(
    () => dispatch({ type: "CHOOSE", theme: theme === "dark" ? "light" : "dark" }),
    [dispatch, theme],
  );

  const value = useMemo<ThemeControl>(
    () => ({ theme, chosen: state.choice !== null, choose, toggle }),
    [theme, state.choice, choose, toggle],
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme(): ThemeControl {
  return useContext(ThemeCtx);
}
