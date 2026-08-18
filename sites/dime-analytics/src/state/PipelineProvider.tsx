import {
  createContext,
  useContext,
  useMemo,
  type Dispatch,
  type ReactNode,
} from "react";
import type {
  Confidence,
  Lane,
  PitchStatus,
  Provenance,
  ProspectPackageStatus,
  SignalSource,
} from "@/domain/types";
import { SEED_STATUSES } from "@/data/prospectStatus";
import { DEFAULT_PERIOD_ID, PERIOD_BY_ID } from "@/data/venue";
import { PROSPECT_BY_ID } from "@/data/prospects";
import { workingSeatForLane } from "@/data/seats";
import { mayHoldADate } from "@/domain/seats";
import { PITCH_STATUS } from "@/domain/vocabulary";
import {
  arr,
  enumKey,
  isRecord,
  mergeRows,
  num,
  optionalNum,
  optionalStr,
  signatureOf,
  str,
  usePersistedReducer,
  type SliceCodec,
} from "./persist";

/**
 * Where every prospect stands, and what the reader is currently looking
 * at. One reducer, because these two things are not independent: change
 * the period and the whole board is describing a different week.
 *
 * The status table lives here rather than in a data file at rest because
 * it is the one thing in this app the user can change. Everything else is
 * a selector over it: the desk order, the lane counts, the capacity
 * chart, the nav badges. Move one prospect from "unworked" to
 * "conversation" and nine numbers move, live, in front of the reader.
 * That property is demonstrable in about four seconds and it is the
 * difference between a prototype with a data model and a prototype with
 * hardcoded screens.
 */

export interface PipelineState {
  periodId: string;
  /** Empty means all lanes. */
  laneFilter: Lane[];
  /** Free text over prospect name, city and decision maker title. */
  query: string;
  /** Only show organisations that publish an email we actually read. */
  emailableOnly: boolean;
  statuses: ProspectPackageStatus[];
}

export type PipelineAction =
  | { type: "SET_PERIOD"; periodId: string }
  | { type: "TOGGLE_LANE"; lane: Lane }
  | { type: "SET_LANES"; lanes: Lane[] }
  | { type: "CLEAR_LANES" }
  | { type: "SET_QUERY"; query: string }
  | { type: "TOGGLE_EMAILABLE_ONLY" }
  | {
      type: "SET_STATUS";
      prospectId: string;
      packageId: string;
      status: PitchStatus;
      at: string;
    }
  | {
      type: "RECORD_TOUCH";
      prospectId: string;
      packageId: string;
      at: string;
    }
  | { type: "RESET" };

const initial: PipelineState = {
  periodId: DEFAULT_PERIOD_ID,
  laneFilter: [],
  query: "",
  emailableOnly: false,
  statuses: SEED_STATUSES,
};

/**
 * Advancing a prospect is allowed in either direction and the app does
 * not police it.
 *
 * A rep who marks a conversation back to "unworked" has almost certainly
 * learned something real, that the contact left or the programme was
 * cut, and a tool that refuses to record a step backwards is one people
 * lie to. The one thing that IS enforced is that "booked" requires a book
 * line, which is handled in BookProvider where the money lives.
 *
 * ── AND ONE PERMISSION, WHICH IS A DIFFERENT KIND OF RULE ─────────
 * A DATE MAY ONLY BE HELD BY A SEAT SIGNED OFF ON RAMP STEP FIVE.
 *
 * /coaching states that gate in prose and has always enforced it
 * nowhere: step five is the lane arithmetic, its own `when` field reads
 * "before anybody is allowed to hold a date", and its reason is that a
 * held date that cannot physically be delivered becomes a refund, an
 * apology from a general manager, and a school that tells every other
 * school in the district.
 *
 * It is enforced HERE rather than on the three controls that offer the
 * status, because a rule enforced at the one place state changes holds
 * and a rule enforced on three buttons drifts the first time somebody
 * adds a fourth. The permission follows the seat doing the work, which
 * `workingSeatForLane` resolves through the cover rule, so a signed-off
 * manager covering an open seat's lane may hold a date in it.
 *
 * TODAY IT REFUSES NOTHING, and that is the correct reading rather than
 * a dead branch: there is one filled seat, it was signed off on 20
 * August 2026, and it covers the whole board. The day a second seat is
 * filled, that seat cannot hold a date until the step is signed off, and
 * /team prints which seats hold the permission and which do not.
 */
function reducer(state: PipelineState, action: PipelineAction): PipelineState {
  switch (action.type) {
    case "SET_PERIOD":
      return { ...state, periodId: action.periodId };

    case "TOGGLE_LANE":
      return {
        ...state,
        laneFilter: state.laneFilter.includes(action.lane)
          ? state.laneFilter.filter((l) => l !== action.lane)
          : [...state.laneFilter, action.lane],
      };

    /*
      SET_LANES replaces the whole filter in one dispatch, and it exists
      for the occasion class segment on the map.

      That control is a two way switch between calendar-locked buyers and
      discretionary ones, and a class is several lanes. Expressing it as
      four TOGGLE_LANE dispatches would render the board four times and,
      worse, would pass through three intermediate states that no reader
      asked to see. One action, one render, one state.

      THE REASON IT WRITES HERE RATHER THAN OWNING ITS OWN FILTER is the
      part worth reading. A segment control with local state would let
      the map show three lanes while the desk still showed nine, and a
      reader who filtered to schools on one screen and found the other
      unfiltered would stop trusting either. The segment is DERIVED from
      this shared field: it renders pressed when laneFilter is exactly
      one class's lane set, and it drops out of that state naturally the
      moment somebody ticks an individual lane chip, which is correct,
      because they have narrowed past a whole class and the control
      should stop claiming otherwise.
    */
    case "SET_LANES":
      return { ...state, laneFilter: action.lanes };

    case "CLEAR_LANES":
      return { ...state, laneFilter: [] };

    case "SET_QUERY":
      return { ...state, query: action.query };

    case "TOGGLE_EMAILABLE_ONLY":
      return { ...state, emailableOnly: !state.emailableOnly };

    case "SET_STATUS": {
      if (action.status === "soft-hold") {
        const lane = PROSPECT_BY_ID[action.prospectId]?.lane;
        const seat = lane ? workingSeatForLane(lane) : null;
        /* The state is returned unchanged rather than thrown on. A
           reducer is not a place to raise, and the surface that offers
           the status is the surface that should explain the refusal;
           /team names the seat, the step and the date it was signed. */
        if (!mayHoldADate(seat)) return state;
      }
      const idx = state.statuses.findIndex(
        (s) =>
          s.prospectId === action.prospectId &&
          s.packageId === action.packageId &&
          s.periodId === state.periodId,
      );
      const next = [...state.statuses];
      if (idx === -1) {
        next.push({
          prospectId: action.prospectId,
          packageId: action.packageId,
          periodId: state.periodId,
          status: action.status,
          signalSource: "reported",
          touches: 1,
          lastTouchAt: action.at,
          confidence: "high",
          provenance: "user_input",
        });
      } else {
        next[idx] = {
          ...next[idx],
          status: action.status,
          signalSource: "reported",
          lastTouchAt: action.at,
          provenance: "user_input",
        };
      }
      return { ...state, statuses: next };
    }

    case "RECORD_TOUCH": {
      const idx = state.statuses.findIndex(
        (s) =>
          s.prospectId === action.prospectId &&
          s.packageId === action.packageId &&
          s.periodId === state.periodId,
      );
      const next = [...state.statuses];
      if (idx === -1) {
        next.push({
          prospectId: action.prospectId,
          packageId: action.packageId,
          periodId: state.periodId,
          status: "reached-out",
          signalSource: "reported",
          touches: 1,
          lastTouchAt: action.at,
          confidence: "high",
          provenance: "user_input",
        });
      } else {
        const row = next[idx];
        next[idx] = {
          ...row,
          touches: row.touches + 1,
          lastTouchAt: action.at,
          /* A touch on an unworked prospect IS reaching out. Anything
             further along has already earned a better word than that. */
          status: row.status === "unworked" ? "reached-out" : row.status,
          provenance: "user_input",
        };
      }
      return { ...state, statuses: next };
    }

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
 * WHAT SURVIVES A RELOAD HERE, AND WHAT DELIBERATELY DOES NOT.
 *
 * The status table survives. It is the reader's work: every prospect
 * they advanced, every touch they recorded, the whole reason this screen
 * is called a pipeline rather than a list.
 *
 * The period, the lane filter, the search box and the emailable toggle
 * do NOT survive, and that is a decision rather than an oversight. Those
 * four fields describe WHERE SOMEBODY IS LOOKING, not what they did. A
 * reader who filtered to two lanes on Friday, came back on Monday and
 * found ninety of two hundred and eleven organisations missing from the
 * desk with no memory of having hidden them would conclude the data had
 * gone, not that a filter was still on. Restoring a query is a saved search
 * pretending to be a saved session.
 *
 * The rows written out are exactly the ones carrying "user_input"
 * provenance, which is not a coincidence: both reducer actions that let
 * a person move a row stamp that provenance as they go, so the same flag
 * that tells the UI a number came from a human tells this codec which
 * rows are worth keeping. Every other row is seed, and seed lives in
 * data/prospectStatus.ts where a data release can still reach it.
 */
interface PipelinePayload {
  statuses: unknown;
}

const SIGNAL_SOURCE: Record<SignalSource, true> = {
  observed: true,
  reported: true,
  modeled: true,
  unknown: true,
};

const CONFIDENCE: Record<Confidence, true> = {
  high: true,
  medium: true,
  low: true,
};

const PROVENANCE: Record<Provenance, true> = {
  public: true,
  illustrative: true,
  modeled: true,
  observed: true,
  user_input: true,
  withheld: true,
};

const statusKey = (s: ProspectPackageStatus) =>
  `${s.prospectId}|${s.packageId}|${s.periodId}`;

/**
 * One saved row, checked claim by claim.
 *
 * Every field that is used as a key into a lookup table is checked
 * against that table, because `PITCH_STATUS[row.status].label` on a
 * hand-edited value is a white screen on the busiest page in the app.
 * The prospect and the period are checked against the seed data for the
 * same reason a level lower: an organisation dropped from the trade area
 * in a later build must not walk back in through a stale payload.
 */
function reviveStatus(raw: unknown): ProspectPackageStatus | null {
  if (!isRecord(raw)) return null;
  const prospectId = str(raw.prospectId);
  const packageId = str(raw.packageId);
  const periodId = str(raw.periodId);
  const status = enumKey(raw.status, PITCH_STATUS);
  const signalSource = enumKey(raw.signalSource, SIGNAL_SOURCE);
  const confidence = enumKey(raw.confidence, CONFIDENCE);
  const provenance = enumKey(raw.provenance, PROVENANCE);
  const touches = num(raw.touches);
  if (
    !prospectId ||
    !packageId ||
    !periodId ||
    !status ||
    !signalSource ||
    !confidence ||
    !provenance ||
    touches === null
  ) {
    return null;
  }
  if (!PROSPECT_BY_ID[prospectId] || !PERIOD_BY_ID[periodId]) return null;
  return {
    prospectId,
    packageId,
    periodId,
    status,
    signalSource,
    confidence,
    provenance,
    touches: Math.max(0, Math.round(touches)),
    discussedHeadcount: optionalNum(raw.discussedHeadcount),
    targetDate: optionalStr(raw.targetDate),
    observedAt: optionalStr(raw.observedAt),
    lastTouchAt: optionalStr(raw.lastTouchAt),
  };
}

const pipelineCodec: SliceCodec<PipelineState> = {
  slice: "pipeline",
  signature: signatureOf(SEED_STATUSES),
  encode: (state) => {
    const statuses = state.statuses.filter((s) => s.provenance === "user_input");
    if (statuses.length === 0) return null;
    return { statuses } satisfies PipelinePayload;
  },
  decode: (raw, seed) => {
    if (!isRecord(raw)) return seed;
    const saved = arr(raw.statuses)
      .map(reviveStatus)
      .filter((row): row is ProspectPackageStatus => row !== null);
    if (saved.length === 0) return seed;
    /* No removals: nothing in this reducer deletes a status row, so an
       empty removal list is the honest thing to pass rather than a
       computed one that could only ever be empty. */
    return {
      ...seed,
      statuses: mergeRows(seed.statuses, saved, [], statusKey),
    };
  },
};

const StateCtx = createContext<PipelineState>(initial);
const DispatchCtx = createContext<Dispatch<PipelineAction>>(() => undefined);

export function PipelineProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = usePersistedReducer(reducer, initial, pipelineCodec);
  const value = useMemo(() => state, [state]);
  return (
    <StateCtx.Provider value={value}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

export function usePipeline() {
  return useContext(StateCtx);
}

export function usePipelineDispatch() {
  return useContext(DispatchCtx);
}

/** The status row for a prospect and package in the current period. */
export function statusFor(
  state: PipelineState,
  prospectId: string,
  packageId: string,
): ProspectPackageStatus | undefined {
  return state.statuses.find(
    (s) =>
      s.prospectId === prospectId &&
      s.packageId === packageId &&
      s.periodId === state.periodId,
  );
}

/**
 * The furthest a prospect has got on ANY package this period.
 *
 * A prospect is not "unworked" because one package was never pitched;
 * they are unworked because nothing has been pitched. Ranking the desk
 * on a per-package row would put the same school at the top four times.
 */
const RANK: PitchStatus[] = [
  "unworked",
  "reached-out",
  "conversation",
  "soft-hold",
  "booked",
  "lost",
];

export function furthestStatus(
  state: PipelineState,
  prospectId: string,
): PitchStatus {
  const rows = state.statuses.filter(
    (s) => s.prospectId === prospectId && s.periodId === state.periodId,
  );
  if (rows.length === 0) return "unworked";
  /* "lost" is deliberately last in RANK and deliberately NOT treated as
     furthest-along here. A prospect who said no to a grad night and is
     mid-conversation about a staff appreciation night is a live
     conversation, not a loss. */
  const live = rows.filter((r) => r.status !== "lost");
  if (live.length === 0) return "lost";
  return live.reduce<PitchStatus>(
    (best, r) => (RANK.indexOf(r.status) > RANK.indexOf(best) ? r.status : best),
    "unworked",
  );
}

export function touchesFor(state: PipelineState, prospectId: string): number {
  return state.statuses
    .filter((s) => s.prospectId === prospectId && s.periodId === state.periodId)
    .reduce((n, s) => n + s.touches, 0);
}
