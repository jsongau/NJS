import {
  createContext,
  useContext,
  useMemo,
  type Dispatch,
  type ReactNode,
} from "react";
import {
  OBJECTIONS,
  OBJECTION_BY_ID,
  type Objection,
  type ObjectionDisposition,
} from "@/data/objections";
import {
  arr,
  enumKey,
  isRecord,
  mergeRows,
  optionalStr,
  signatureOf,
  str,
  usePersistedReducer,
  type SliceCodec,
} from "./persist";

/**
 * THE OBJECTION REGISTER, as state a reader can actually move.
 *
 * WHY THIS IS A PROVIDER AND NOT A STATIC PAGE. An objection list that
 * cannot be marked off is a document, and documents are where sales
 * knowledge goes to be forgotten. The useful artefact is a REGISTER: the
 * things this territory actually gets hit with, each one carrying
 * whether it is currently live, whether the answer worked, or whether it
 * is the reason a deal died, plus whatever the person doing the work
 * learned this week.
 *
 * The third disposition is the one that matters. "lost-to-it" exists so
 * that a register cannot quietly become a list of wins. If four
 * conversations in the corporate lane died on "you will not tell me what
 * it costs", that is not a coaching note about objection handling, it is
 * an argument for taking the pricing question up the line. A register
 * that only records successes cannot make that argument, because the
 * evidence for it is exactly the part it threw away.
 *
 * Seeded from data/objections.ts and never mutated there. The data file
 * holds what is true about the objection; this holds what has happened to
 * it in this session, which is a different kind of fact with a different
 * lifetime.
 */

export interface ObjectionEntry {
  objectionId: string;
  disposition: ObjectionDisposition;
  /** What the person working the register learned. Free text, theirs. */
  note?: string;
  /** Set when a disposition is changed, so the page can say when. */
  updatedAt?: string;
}

export interface ObjectionState {
  entries: ObjectionEntry[];
}

export type ObjectionAction =
  | {
      type: "SET_DISPOSITION";
      objectionId: string;
      disposition: ObjectionDisposition;
      at: string;
    }
  | { type: "SET_NOTE"; objectionId: string; note: string; at: string }
  | { type: "RESET" };

/**
 * EVERYTHING STARTS OPEN, AND THAT IS THE HONEST OPENING STATE.
 *
 * The alternative was to seed three as answered so the screen looks
 * worked. Twelve weeks before a building opens, with two hundred and
 * eleven organisations in the trade area and two contracts in the book,
 * nothing has been answered enough times to call it settled. A register that
 * opens already half ticked is a register describing a week that did not
 * happen.
 */
const initial: ObjectionState = {
  entries: OBJECTIONS.map((o) => ({
    objectionId: o.id,
    disposition: "open" as ObjectionDisposition,
  })),
};

function upsert(
  state: ObjectionState,
  objectionId: string,
  patch: Partial<ObjectionEntry>,
): ObjectionState {
  const idx = state.entries.findIndex((e) => e.objectionId === objectionId);
  if (idx === -1) {
    return {
      entries: [
        ...state.entries,
        { objectionId, disposition: "open", ...patch },
      ],
    };
  }
  const next = [...state.entries];
  next[idx] = { ...next[idx], ...patch };
  return { entries: next };
}

function reducer(state: ObjectionState, action: ObjectionAction): ObjectionState {
  switch (action.type) {
    case "SET_DISPOSITION":
      return upsert(state, action.objectionId, {
        disposition: action.disposition,
        updatedAt: action.at,
      });

    case "SET_NOTE":
      /*
        A note does not change the disposition, deliberately. Writing down
        what a buyer said is not the same as deciding the objection is
        handled, and a control that quietly did both would make the
        register's own numbers untrustworthy.
      */
      return upsert(state, action.objectionId, {
        note: action.note,
        updatedAt: action.at,
      });

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
 * ONLY THE ENTRIES A PERSON HAS ACTUALLY MOVED ARE WRITTEN.
 *
 * The register opens with every objection sitting on "open", which is
 * the honest opening state and is also, conveniently, the state that
 * carries no information. Writing seven untouched open rows to storage
 * would say nothing and would freeze the register's own membership: add
 * an eighth objection to data/objections.ts and a returning reader would
 * still see seven, because their saved copy would win.
 *
 * So an entry is saved when it has left "open" or when somebody has
 * written a note against it, and a note on an otherwise open objection
 * counts, because that note is the most valuable thing in the file. It
 * is the sentence a buyer actually said.
 */
const DISPOSITIONS: Record<ObjectionDisposition, true> = {
  open: true,
  answered: true,
  "lost-to-it": true,
};

const isWorked = (entry: ObjectionEntry) =>
  entry.disposition !== "open" || Boolean(entry.note);

const entryKey = (entry: ObjectionEntry) => entry.objectionId;

function reviveEntry(raw: unknown): ObjectionEntry | null {
  if (!isRecord(raw)) return null;
  const objectionId = str(raw.objectionId);
  const disposition = enumKey(raw.disposition, DISPOSITIONS);
  if (!objectionId || !disposition) return null;
  /* An objection retired from the data file cannot come back through
     storage. objectionRows() walks OBJECTIONS, so an orphan entry would
     be invisible on the page and still counted in the totals beside it,
     which is worse than losing it. */
  if (!OBJECTION_BY_ID[objectionId]) return null;
  return {
    objectionId,
    disposition,
    note: optionalStr(raw.note),
    updatedAt: optionalStr(raw.updatedAt),
  };
}

const objectionCodec: SliceCodec<ObjectionState> = {
  slice: "objections",
  /* THE SIGNATURE COVERS THE IDS AND NOT THE PROSE. Every other slice
     hashes its whole seed, because a changed price or a changed guest
     count changes what an edit MEANS. Here the seed is a question and
     the delta is what happened when somebody asked it, and rewording
     "we have not walked the building" does not make last week's note
     about it untrue. Adding or retiring an objection does, and that is
     exactly what the id list catches. */
  signature: signatureOf(OBJECTIONS.map((o) => o.id)),
  encode: (state) => {
    const entries = state.entries.filter(isWorked);
    return entries.length === 0 ? null : { entries };
  },
  decode: (raw, seed) => {
    if (!isRecord(raw)) return seed;
    const saved = arr(raw.entries)
      .map(reviveEntry)
      .filter((entry): entry is ObjectionEntry => entry !== null);
    if (saved.length === 0) return seed;
    return { entries: mergeRows(seed.entries, saved, [], entryKey) };
  },
};

const StateCtx = createContext<ObjectionState>(initial);
const DispatchCtx = createContext<Dispatch<ObjectionAction>>(() => undefined);

export function ObjectionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = usePersistedReducer(reducer, initial, objectionCodec);
  const value = useMemo(() => state, [state]);
  return (
    <StateCtx.Provider value={value}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

export function useObjections() {
  return useContext(StateCtx);
}

export function useObjectionDispatch() {
  return useContext(DispatchCtx);
}

/** The entry for one objection, or a synthesised open one. */
export function entryFor(
  state: ObjectionState,
  objectionId: string,
): ObjectionEntry {
  return (
    state.entries.find((e) => e.objectionId === objectionId) ?? {
      objectionId,
      disposition: "open",
    }
  );
}

/** The objection and its entry together, which is what every screen wants. */
export interface ObjectionRow {
  objection: Objection;
  entry: ObjectionEntry;
}

export function objectionRows(state: ObjectionState): ObjectionRow[] {
  return OBJECTIONS.map((objection) => ({
    objection,
    entry: entryFor(state, objection.id),
  }));
}

export function objectionCounts(state: ObjectionState): Record<
  ObjectionDisposition,
  number
> {
  const out: Record<ObjectionDisposition, number> = {
    open: 0,
    answered: 0,
    "lost-to-it": 0,
  };
  for (const e of state.entries) out[e.disposition] += 1;
  return out;
}

/**
 * The three dispositions, with their glyph, word and colour.
 *
 * Kept beside the provider rather than in domain/vocabulary.ts because a
 * disposition is a property of this register rather than of the domain:
 * nothing outside the objections screen has an opinion about it, and the
 * vocabulary file earns its authority by holding only the values that
 * several screens must agree on.
 */
export const DISPOSITION_META: Record<
  ObjectionDisposition,
  { label: string; glyph: string; cssVar: string; note: string }
> = {
  open: {
    label: "Open",
    glyph: "○",
    cssVar: "var(--warn)",
    note: "Live and unanswered. Early in a territory most of this register should be sitting here, and a register that is not is probably not being read.",
  },
  answered: {
    label: "Answered",
    glyph: "●",
    cssVar: "var(--ok)",
    note: "Raised, answered, and the conversation carried on afterwards. The answer works.",
  },
  "lost-to-it": {
    label: "Lost to it",
    glyph: "✕",
    cssVar: "var(--risk)",
    note: "This is why a deal died. Recorded, because a register that logs only wins cannot argue for a change of plan.",
  },
};
