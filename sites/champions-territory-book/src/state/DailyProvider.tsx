import {
  createContext,
  useContext,
  useMemo,
  type Dispatch,
  type ReactNode,
} from "react";
import {
  RING_ORDER,
  STALE_TARGET,
  TOUCH_TARGET,
  mondayOf,
  type DailyTargets,
} from "@/domain/selectors/daily";
import {
  isRecord,
  optionalNum,
  signatureOf,
  str,
  usePersistedReducer,
  type SliceCodec,
} from "./persist";

/**
 * THE ONLY THING THE DAILY RINGS ARE ALLOWED TO REMEMBER.
 *
 * WHY THIS FILE IS SO SMALL, AND WHY THAT IS THE POINT. Every figure on
 * the rings is derived at render from the threads, the status table and
 * the outbox. Touches made, replies handled, records cleared, the week,
 * the streak: none of it is stored, and none of it may be. A stored
 * count is a fact with an expiry date that nothing is responsible for
 * renewing, and the first morning it disagrees with the thread it claims
 * to describe, a person stops believing both of them.
 *
 * So exactly two things live here, and both of them are decisions rather
 * than measurements. The target he accepted or typed over, because that
 * is his and no derivation may quietly replace it. And whether the whole
 * feature is switched off, because a professional tool that cannot be
 * told to stop keeping score is not a professional tool. Todoist ships
 * that switch for Karma and it is the reason Karma reads as a setting
 * rather than as a demand.
 *
 * THE STORED TARGET CARRIES THE WEEK IT WAS SET IN. Apple recalculates
 * the Move goal weekly and offers the new figure rather than imposing
 * it. The same shape here: a figure he set on Monday stands all week and
 * for as long after it as he likes, and when a new week's suggestion
 * differs the strip offers it beside his own number instead of moving
 * the bar underneath him.
 *
 * IT MOUNTS ITSELF. `DailyRings` wraps its own tree in this provider, so
 * a page adopts the strip with one line and no plumbing. Mounting it
 * again higher up, so the rail or another surface can read the same
 * state, is safe: the second provider sees the first and steps out of
 * the way rather than opening a second copy of the state that would
 * drift from it within a click.
 */

export interface DailyState {
  /** False removes the strip entirely. It is not a hidden state. */
  enabled: boolean;
  /** Null means take the weekly suggestion, which is the default. */
  targets: DailyTargets;
}

export type DailyAction =
  /** A figure he typed, for one ring, stamped with the week he set it. */
  | { type: "SET_TARGET"; ring: "touches" | "stale"; value: number; day: string }
  /** Back to the suggestion for that ring. */
  | { type: "CLEAR_TARGET"; ring: "touches" | "stale" }
  | { type: "SET_ENABLED"; enabled: boolean }
  | { type: "RESET" };

const initial: DailyState = {
  enabled: true,
  targets: { touches: null, stale: null, week: null },
};

/**
 * The range a typed target is allowed to take.
 *
 * A target of zero is a ring that is closed before the day starts, and a
 * target of two hundred is a ring that can never close; both are ways of
 * switching the feature off while leaving it on screen, and there is a
 * real off switch three inches away for that.
 */
export const TARGET_MIN = 1;
export const TARGET_MAX = 40;

function reducer(state: DailyState, action: DailyAction): DailyState {
  switch (action.type) {
    case "SET_TARGET": {
      const value = Math.round(
        Math.max(TARGET_MIN, Math.min(TARGET_MAX, action.value)),
      );
      return {
        ...state,
        targets: {
          ...state.targets,
          [action.ring]: value,
          week: mondayOf(action.day),
        },
      };
    }

    case "CLEAR_TARGET":
      return {
        ...state,
        targets: { ...state.targets, [action.ring]: null },
      };

    case "SET_ENABLED":
      return { ...state, enabled: action.enabled };

    case "RESET":
      return initial;

    default:
      return state;
  }
}

// ---------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------

/**
 * THE SIGNATURE IS OVER THE RULES, NOT OVER A SEED ARRAY.
 *
 * The other four slices in this app hash the seed rows they merge onto.
 * This one has no rows. What it has instead is a set of constants that
 * decide what a target MEANS: the floor, the ceiling, the window the
 * average is taken over, the share of the backlog the stale target is
 * cut from. Change any of those and a figure saved under the old rules
 * is no longer the thing it was saved as, so the delta is dropped and
 * the reader gets the new suggestion cleanly.
 */
const dailyCodec: SliceCodec<DailyState> = {
  slice: "daily",
  signature: signatureOf(RING_ORDER, TOUCH_TARGET, STALE_TARGET),

  encode: (state) => {
    /* NOTHING USER-MADE MEANS NO SLICE AT ALL. A reader who has never
       touched a target or the off switch leaves the storage key exactly
       as they found it, which is what makes a reset end with the key
       genuinely absent rather than hollow. */
    const untouched =
      state.enabled &&
      state.targets.touches === null &&
      state.targets.stale === null;
    if (untouched) return null;
    return {
      enabled: state.enabled,
      touches: state.targets.touches,
      stale: state.targets.stale,
      week: state.targets.week,
    };
  },

  decode: (raw, seed) => {
    if (!isRecord(raw)) return seed;
    const bounded = (v: unknown): number | null => {
      const n = optionalNum(v);
      if (n === undefined) return null;
      /* A hand-edited payload is user-writable, so the bounds are
         enforced again here rather than trusted from the reducer. A
         target of zero restored from storage would render a ring that
         is closed before the day begins. */
      return Math.round(Math.max(TARGET_MIN, Math.min(TARGET_MAX, n)));
    };
    return {
      enabled: typeof raw.enabled === "boolean" ? raw.enabled : seed.enabled,
      targets: {
        touches: bounded(raw.touches),
        stale: bounded(raw.stale),
        week: str(raw.week),
      },
    };
  },
};

const StateCtx = createContext<DailyState | null>(null);
const DispatchCtx = createContext<Dispatch<DailyAction>>(() => undefined);

function DailyRoot({ children }: { children: ReactNode }) {
  const [state, dispatch] = usePersistedReducer(reducer, initial, dailyCodec);
  const value = useMemo(() => state, [state]);
  return (
    <StateCtx.Provider value={value}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

/**
 * Mounts the daily state, unless something above already has.
 *
 * The hooks all sit in `DailyRoot` so that the pass-through case really
 * is a pass-through: no second reducer, no second hydration from
 * storage, and no second writer racing the first one to the same slice.
 */
export function DailyProvider({ children }: { children: ReactNode }) {
  const existing = useContext(StateCtx);
  if (existing) return <>{children}</>;
  return <DailyRoot>{children}</DailyRoot>;
}

/** The state, or the defaults where no provider is mounted above. */
export function useDaily(): DailyState {
  return useContext(StateCtx) ?? initial;
}

export function useDailyDispatch(): Dispatch<DailyAction> {
  return useContext(DispatchCtx);
}
