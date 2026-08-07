import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type { Channel, AccountPriority, VenueClass } from "@/domain/types";
import {
  DEFAULT_OPPORTUNITY_WEIGHTS,
  type OpportunityWeights,
} from "@/domain/selectors/opportunity";
import { CURRENT_PERIOD_ID } from "@/data/trade";

/**
 * Territory state: what the user is looking at.
 *
 * This is deliberately a SEPARATE store from the plan. The map viewport
 * changes on every pan; plan lines change rarely. Putting both in one
 * context means panning the map re-renders the plan table, which is the
 * known failure mode of a single global store with a map in it. Two
 * providers is not premature optimization here, it is the fix.
 */

export type MapView = "all" | "voids" | "issues" | "in-plan";
/*
  ListSort is gone along with the five pills that drove it. A list of
  twelve rows does not need five orderings; it needs one good one, and
  keeping the state for a control that no longer exists is how a reducer
  turns into a junk drawer.
*/

export interface TerritoryFilters {
  /**
   * Which half of the territory is on screen: retail, bars and
   * restaurants, or both.
   *
   * WHY THIS IS ITS OWN FILTER AND NOT A CHANNEL SELECTION. It could
   * have been — "off-premise" is exactly the five off-premise channels —
   * and that version would have been wrong in a way that matters. A
   * channel filter is a REFINEMENT a user reaches for after they know
   * what they are looking at. The venue class is the first question, and
   * the answer changes what the numbers on screen even mean: a case is a
   * shelf position on one side of it and four hundred drinks on the
   * other. That belongs in a tab at the top of the list, not a chip in a
   * filter tray, and a tab needs a state field of its own so it survives
   * someone clearing the filters.
   *
   * It is not nullable. "Both" was a third tab and it is gone — see the
   * note on the tab strip — so every call site gets a real venue class
   * and none of them has to decide what an absent one would mean.
   */
  venueClass: VenueClass;
  channels: Channel[];
  priorities: AccountPriority[];
  maxDistanceMiles: number | null;
  hasOpenVoids: boolean;
  hasOpenIssues: boolean;
  inPlanOnly: boolean;
  search: string;
}

export interface TerritoryState {
  distributorId: string;
  territoryId: string;
  periodId: string;
  scenarioName: string;
  selectedAccountId: string | null;
  hoveredAccountId: string | null;
  view: MapView;
  filters: TerritoryFilters;
  opportunityWeights: OpportunityWeights;
  listOpen: boolean;
  /**
   * Bumped by RESET_ALL and never by anything else.
   *
   * Some screens hold state that does not belong in a provider — the order
   * desk keeps a diff of the quantities you changed against the ones it
   * suggested, because that diff is meaningless outside the desk. "Reset
   * everything" has to reach that state too, and the alternative is
   * hoisting genuinely local state into global state just so a button can
   * see it, which is how a reducer turns into a junk drawer. A counter is
   * the smaller price: screens watch it and clear their own state.
   */
  resetNonce: number;
}

const EMPTY_FILTERS: TerritoryFilters = {
  /*
    Retail is the default view, not "everything".

    The combined view was removed because three tabs did not fit the
    column, and retail is the right survivor: it is the larger half of
    the roster and the lane the rest of the app's vocabulary was built
    around. A reader who wants the bars is one click away and can see
    the count before they click.
  */
  venueClass: "off-premise",
  channels: [],
  priorities: [],
  maxDistanceMiles: null,
  hasOpenVoids: false,
  hasOpenIssues: false,
  inPlanOnly: false,
  search: "",
};

export const INITIAL_TERRITORY_STATE: TerritoryState = {
  distributorId: "southern-glazers-cerritos",
  territoryId: "east-la",
  periodId: CURRENT_PERIOD_ID,
  scenarioName: "Labor Day sell-in",
  selectedAccountId: null,
  hoveredAccountId: null,
  view: "all",
  filters: EMPTY_FILTERS,
  opportunityWeights: DEFAULT_OPPORTUNITY_WEIGHTS,
  listOpen: true,
  resetNonce: 0,
};

export type TerritoryAction =
  | { type: "SELECT_ACCOUNT"; accountId: string | null }
  | { type: "HOVER_ACCOUNT"; accountId: string | null }
  | { type: "SET_VIEW"; view: MapView }
  | { type: "SET_FILTER"; patch: Partial<TerritoryFilters> }
  | { type: "CLEAR_FILTERS" }
  | { type: "SET_PERIOD"; periodId: string }
  | { type: "SET_SCENARIO_NAME"; name: string }
  | { type: "SET_WEIGHTS"; weights: OpportunityWeights }
  | { type: "RESET_WEIGHTS" }
  | { type: "TOGGLE_LIST" }
  /** Everything back to the opening screen. Paired with the plan's CLEAR. */
  | { type: "RESET_ALL" };

function reducer(state: TerritoryState, action: TerritoryAction): TerritoryState {
  switch (action.type) {
    case "SELECT_ACCOUNT":
      return { ...state, selectedAccountId: action.accountId };
    case "HOVER_ACCOUNT":
      return { ...state, hoveredAccountId: action.accountId };
    case "SET_VIEW":
      return { ...state, view: action.view };
    case "SET_FILTER":
      return { ...state, filters: { ...state.filters, ...action.patch } };
    case "CLEAR_FILTERS":
      return { ...state, filters: EMPTY_FILTERS };
    case "SET_PERIOD":
      return { ...state, periodId: action.periodId };
    case "SET_SCENARIO_NAME":
      return { ...state, scenarioName: action.name };
    case "SET_WEIGHTS":
      return { ...state, opportunityWeights: action.weights };
    case "RESET_WEIGHTS":
      return { ...state, opportunityWeights: DEFAULT_OPPORTUNITY_WEIGHTS };
    case "TOGGLE_LIST":
      return { ...state, listOpen: !state.listOpen };
    case "RESET_ALL":
      return { ...INITIAL_TERRITORY_STATE, resetNonce: state.resetNonce + 1 };
    default:
      return state;
  }
}

const StateCtx = createContext<TerritoryState>(INITIAL_TERRITORY_STATE);
const DispatchCtx = createContext<React.Dispatch<TerritoryAction>>(() => {});

export function TerritoryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_TERRITORY_STATE);
  // dispatch is referentially stable, so consumers that only dispatch
  // never re-render when the viewport changes.
  const value = useMemo(() => state, [state]);
  return (
    <StateCtx.Provider value={value}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

export const useTerritory = () => useContext(StateCtx);
export const useTerritoryDispatch = () => useContext(DispatchCtx);

export function filtersAreActive(f: TerritoryFilters): boolean {
  return (
    f.channels.length > 0 ||
    f.priorities.length > 0 ||
    f.maxDistanceMiles !== null ||
    f.hasOpenVoids ||
    f.hasOpenIssues ||
    f.inPlanOnly ||
    f.search.trim() !== ""
  );
}
