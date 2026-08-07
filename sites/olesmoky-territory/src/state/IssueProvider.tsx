import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

/**
 * What has been DONE about an issue.
 *
 * The issues themselves are derived and never stored — see
 * selectors/issues.ts. What cannot be derived is the human half: whether
 * somebody has picked it up, and what they said when they did. That is
 * all this holds.
 *
 * Keeping the two apart matters. If dispositions lived alongside the
 * issues, an issue could be marked resolved while the condition causing
 * it was still true, which is how every issue tracker eventually starts
 * lying. Here a disposition is a note attached to a live condition. When
 * the condition clears, the issue disappears and takes its note with it —
 * you cannot close a problem you have not actually fixed.
 */

export type IssueStatus = "open" | "working" | "waiting";

export interface Disposition {
  status: IssueStatus;
  note?: string;
  /** ISO date the disposition was last touched. */
  touchedAt: string;
}

interface IssueState {
  byIssueId: Record<string, Disposition>;
}

type IssueAction =
  | { type: "SET"; issueId: string; status: IssueStatus; at: string }
  | { type: "NOTE"; issueId: string; note: string; at: string }
  | { type: "RESET" };

const STORAGE_KEY = "ntp:issues:v1";

function initial(): IssueState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as IssueState;
  } catch {
    /* Private browsing throws on read. Not worth dying for. */
  }
  return { byIssueId: {} };
}

function reducer(state: IssueState, action: IssueAction): IssueState {
  switch (action.type) {
    case "SET": {
      const prev = state.byIssueId[action.issueId];
      return {
        byIssueId: {
          ...state.byIssueId,
          [action.issueId]: {
            ...prev,
            status: action.status,
            touchedAt: action.at,
          },
        },
      };
    }
    case "NOTE": {
      const prev = state.byIssueId[action.issueId];
      return {
        byIssueId: {
          ...state.byIssueId,
          [action.issueId]: {
            status: prev?.status ?? "working",
            note: action.note,
            touchedAt: action.at,
          },
        },
      };
    }
    case "RESET":
      return { byIssueId: {} };
    default:
      return state;
  }
}

const StateCtx = createContext<IssueState>({ byIssueId: {} });
const DispatchCtx = createContext<React.Dispatch<IssueAction>>(() => {});

export function IssueProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* Quota or private mode. */
    }
  }, [state]);

  const value = useMemo(() => state, [state]);
  return (
    <StateCtx.Provider value={value}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

export const useIssueState = () => useContext(StateCtx);
export const useIssueDispatch = () => useContext(DispatchCtx);

export const STATUS_LABEL: Record<
  IssueStatus,
  { label: string; glyph: string; cssVar: string }
> = {
  open: { label: "Untouched", glyph: "○", cssVar: "var(--text-3)" },
  working: { label: "Working it", glyph: "◑", cssVar: "var(--accent)" },
  waiting: { label: "Waiting on them", glyph: "◔", cssVar: "var(--warn)" },
};
