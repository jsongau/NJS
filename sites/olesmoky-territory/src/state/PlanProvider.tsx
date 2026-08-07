import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type {
  PlanLine,
  SellInLine,
  RetailExecutionLine,
  PlanGrouping,
  ExecutionCommitment,
} from "@/domain/types";
import { PACKAGE_BY_ID } from "@/data/packageFormats";
import { SKU_BY_ID } from "@/data/skus";

/**
 * The commitment plan: two ledgers, one reducer.
 *
 *   sell-in           Ole Smoky -> Southern Glazer's. Carries money.
 *   retail-execution  Southern Glazer's -> retail accounts. Carries execution only.
 *
 * The split is not cosmetic. California ABC has stated there is no
 * exception permitting cash payments from a supplier to a retailer, so a
 * promotional allowance attached to a store line would describe a
 * tied-house violation. Keeping money structurally out of the retail
 * ledger means the app cannot express that mistake.
 *
 * This is also the single source of truth for the order sheet, the
 * selling story, and every export. Those are pure functions of this
 * state, never second editable copies, which is what stops two
 * representations of the same plan from drifting apart.
 */

/**
 * What the distributor did with a sell-in line.
 *
 * `confirmed` means Southern Glazer's will buy the cases as written. `adjusted`
 * means they will buy a different number and said why. `declined` means
 * they will not take it this period. Nothing here is a supplier
 * decision: the distributor buys from the supplier, so this is the side
 * of the transaction the supplier does not control.
 */
export type DistributorDisposition = "pending" | "confirmed" | "adjusted" | "declined";

export interface DistributorResponse {
  disposition: DistributorDisposition;
  /** Cases the distributor will actually take. Null until they respond. */
  acceptedCases: number | null;
  reason?: string;
  deliveryWeek?: string;
  respondedAt?: string;
}

export interface PlanState {
  scenarioId: string;
  sellIn: SellInLine[];
  retail: RetailExecutionLine[];
  grouping: PlanGrouping;
  submittedRequestId: string | null;
  /** Keyed by sell-in line id. */
  distributorResponses: Record<string, DistributorResponse>;
  distributorConfirmedAt: string | null;
}

const STORAGE_KEY = "fairshare:plan:v1";

export const INITIAL_PLAN_STATE: PlanState = {
  scenarioId: "scenario-1",
  sellIn: [],
  retail: [],
  grouping: "account",
  submittedRequestId: null,
  distributorResponses: {},
  distributorConfirmedAt: null,
};

/** Pallets are always derived. A typed pallet count is a bug waiting. */
export function palletsFor(skuId: string, cases: number): number {
  const sku = SKU_BY_ID[skuId];
  const pkg = sku ? PACKAGE_BY_ID[sku.packageFormatId] : undefined;
  if (!pkg || pkg.casesPerPallet <= 0) return 0;
  return Math.round((cases / pkg.casesPerPallet) * 100) / 100;
}

export type PlanAction =
  | {
      type: "ADD_RETAIL_LINE";
      accountId: string;
      skuId: string;
      cases: number;
      commitment: ExecutionCommitment;
      deliveryWeek: string;
      promotionId?: string;
      closesVoid: boolean;
      notes?: string;
    }
  | { type: "ADD_SELL_IN_LINE"; skuId: string; cases: number; pricePerCase: number; deliveryWeek: string; promotionId?: string }
  /**
   * Sending an order commits it.
   *
   * The order desk used to send an email and touch nothing else, so a
   * visitor could build 2,600 cases on the landing page, send it to
   * Southern Glazer's, and find the Plan and Distributor tabs still reading zero.
   * The nav says those five tabs are one motion; this is what makes that
   * true rather than a claim.
   *
   * Southern Glazer's lane commits SELL-IN, because an order sent to a wholesaler is
   * a purchase and carries money. Store lane commits RETAIL EXECUTION,
   * because a shelf promise is not a purchase and by law carries none.
   */
  | {
      type: "COMMIT_ORDER";
      /** Groups the lines so a re-send replaces rather than doubles. */
      source: string;
      lane: "distributor" | "store";
      accountId?: string;
      deliveryWeek: string;
      lines: Array<{
        skuId: string;
        cases: number;
        pricePerCase?: number;
        promotionId?: string;
        commitment?: ExecutionCommitment;
        closesVoid?: boolean;
      }>;
    }
  | { type: "REMOVE_LINE"; id: string }
  | { type: "DUPLICATE_LINE"; id: string }
  | { type: "SET_CASES"; id: string; cases: number }
  | { type: "SET_DELIVERY_WEEK"; id: string; week: string }
  | { type: "SET_PROMOTION"; id: string; promotionId: string | undefined }
  | { type: "SET_COMMITMENT"; id: string; commitment: ExecutionCommitment }
  | { type: "SET_NOTE"; id: string; note: string }
  | { type: "REORDER"; id: string; direction: "up" | "down" }
  | { type: "BULK_PROMOTION"; ids: string[]; promotionId: string | undefined }
  | { type: "BULK_DELIVERY_WEEK"; ids: string[]; week: string }
  | { type: "SET_GROUPING"; grouping: PlanGrouping }
  | { type: "REMOVE_ACCOUNT"; accountId: string }
  | { type: "IMPORT_RECOVERY"; lines: Array<Omit<RetailExecutionLine, "id" | "sortOrder" | "ledger">> }
  | { type: "SUBMIT"; requestId: string }
  | {
      type: "DISTRIBUTOR_RESPOND";
      lineId: string;
      disposition: DistributorDisposition;
      acceptedCases: number | null;
      reason?: string;
      deliveryWeek?: string;
    }
  | { type: "DISTRIBUTOR_CONFIRM_ALL" }
  | { type: "DISTRIBUTOR_SUBMIT"; at: string }
  | { type: "DISTRIBUTOR_RESET" }
  | { type: "LOAD"; state: PlanState }
  | { type: "CLEAR" };

let lineSeq = 0;
const nextId = (prefix: string) => `${prefix}-${++lineSeq}`;

function reorder<T extends { id: string; sortOrder: number }>(
  lines: T[],
  id: string,
  direction: "up" | "down",
): T[] {
  const sorted = [...lines].sort((a, b) => a.sortOrder - b.sortOrder);
  const i = sorted.findIndex((l) => l.id === id);
  if (i < 0) return lines;
  const j = direction === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= sorted.length) return lines;
  [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
  return sorted.map((l, idx) => ({ ...l, sortOrder: idx }));
}

function reducer(state: PlanState, action: PlanAction): PlanState {
  switch (action.type) {
    case "COMMIT_ORDER": {
      // Everything previously committed by this source goes first, so a
      // revised order supersedes rather than accumulates.
      const sellIn = state.sellIn.filter((l) => l.source !== action.source);
      const retail = state.retail.filter((l) => l.source !== action.source);

      if (action.lane === "distributor") {
        const added: SellInLine[] = action.lines.map((l, i) => ({
          id: nextId("s"),
          ledger: "sell-in",
          source: action.source,
          skuId: l.skuId,
          cases: l.cases,
          pallets: palletsFor(l.skuId, l.cases),
          illustrativePricePerCase: l.pricePerCase ?? 0,
          promotionId: l.promotionId,
          deliveryWeek: action.deliveryWeek,
          sortOrder: sellIn.length + i,
        }));
        return { ...state, sellIn: [...sellIn, ...added], retail };
      }

      if (!action.accountId) return state;

      /**
       * A store order writes BOTH ledgers, and it has to.
       *
       * When the desk offered a Southern Glazer's lane, sell-in lines came from that
       * lane. Making the desk store-only removed the only writer, so the
       * sell-in ledger stayed permanently empty: Southern Glazer's review board
       * always said "nothing to review", the ledger balance check had
       * nothing to compare, and an unfunded promise — the most serious
       * thing this app can detect — could never occur.
       *
       * The fix is the domain rule, not a workaround. Cases promised to a
       * retailer are cases the distributor has to buy. So committing a
       * store order also writes the sell-in it REQUIRES, at list, tagged
       * with the same source so a revision supersedes both sides at once.
       *
       * Southern Glazer's can then accept it, cut it, or decline it, and if they take
       * fewer cases than the store was promised, the gap surfaces as an
       * unfunded promise. That is the whole point of keeping two ledgers:
       * the disagreement between them is the interesting number.
       */
      const requiredSellIn: SellInLine[] = action.lines.map((l, i) => ({
        id: nextId("s"),
        ledger: "sell-in",
        source: action.source,
        skuId: l.skuId,
        cases: l.cases,
        pallets: palletsFor(l.skuId, l.cases),
        illustrativePricePerCase: l.pricePerCase ?? 0,
        promotionId: l.promotionId,
        deliveryWeek: action.deliveryWeek,
        sortOrder: sellIn.length + i,
      }));

      const added: RetailExecutionLine[] = action.lines.map((l, i) => ({
        id: nextId("r"),
        ledger: "retail-execution",
        source: action.source,
        accountId: action.accountId!,
        skuId: l.skuId,
        cases: l.cases,
        pallets: palletsFor(l.skuId, l.cases),
        commitment: l.commitment ?? {
          placement: "shelf",
          recommendedLocation: "Main whiskey set",
          posMaterials: ["Shelf talker"],
          ownerRole: "Distributor account rep",
        },
        promotionId: l.promotionId,
        deliveryWeek: action.deliveryWeek,
        closesVoid: l.closesVoid ?? false,
        sortOrder: retail.length + i,
      }));
      return {
        ...state,
        sellIn: [...sellIn, ...requiredSellIn],
        retail: [...retail, ...added],
      };
    }

    case "ADD_RETAIL_LINE": {
      // Adding the same account/SKU twice increments rather than
      // duplicating. A plan with two White Lightnin' lines for one store is
      // a data-entry accident, not an intention.
      const existing = state.retail.find(
        (l) => l.accountId === action.accountId && l.skuId === action.skuId,
      );
      if (existing) {
        return {
          ...state,
          retail: state.retail.map((l) =>
            l.id === existing.id
              ? {
                  ...l,
                  cases: l.cases + action.cases,
                  pallets: palletsFor(l.skuId, l.cases + action.cases),
                }
              : l,
          ),
        };
      }
      const line: RetailExecutionLine = {
        id: nextId("r"),
        ledger: "retail-execution",
        accountId: action.accountId,
        skuId: action.skuId,
        cases: action.cases,
        pallets: palletsFor(action.skuId, action.cases),
        commitment: action.commitment,
        promotionId: action.promotionId,
        deliveryWeek: action.deliveryWeek,
        closesVoid: action.closesVoid,
        notes: action.notes,
        sortOrder: state.retail.length,
      };
      return { ...state, retail: [...state.retail, line] };
    }

    case "ADD_SELL_IN_LINE": {
      const existing = state.sellIn.find((l) => l.skuId === action.skuId);
      if (existing) {
        return {
          ...state,
          sellIn: state.sellIn.map((l) =>
            l.id === existing.id
              ? { ...l, cases: l.cases + action.cases, pallets: palletsFor(l.skuId, l.cases + action.cases) }
              : l,
          ),
        };
      }
      const line: SellInLine = {
        id: nextId("s"),
        ledger: "sell-in",
        skuId: action.skuId,
        cases: action.cases,
        pallets: palletsFor(action.skuId, action.cases),
        illustrativePricePerCase: action.pricePerCase,
        promotionId: action.promotionId,
        deliveryWeek: action.deliveryWeek,
        sortOrder: state.sellIn.length,
      };
      return { ...state, sellIn: [...state.sellIn, line] };
    }

    case "REMOVE_LINE":
      return {
        ...state,
        sellIn: state.sellIn.filter((l) => l.id !== action.id),
        retail: state.retail.filter((l) => l.id !== action.id),
      };

    case "REMOVE_ACCOUNT":
      return {
        ...state,
        retail: state.retail.filter((l) => l.accountId !== action.accountId),
      };

    case "DUPLICATE_LINE": {
      const r = state.retail.find((l) => l.id === action.id);
      if (r) {
        return {
          ...state,
          retail: [...state.retail, { ...r, id: nextId("r"), sortOrder: state.retail.length }],
        };
      }
      const s = state.sellIn.find((l) => l.id === action.id);
      if (s) {
        return {
          ...state,
          sellIn: [...state.sellIn, { ...s, id: nextId("s"), sortOrder: state.sellIn.length }],
        };
      }
      return state;
    }

    case "SET_CASES": {
      const cases = Math.max(0, Math.round(action.cases));
      return {
        ...state,
        sellIn: state.sellIn.map((l) =>
          l.id === action.id ? { ...l, cases, pallets: palletsFor(l.skuId, cases) } : l,
        ),
        retail: state.retail.map((l) =>
          l.id === action.id ? { ...l, cases, pallets: palletsFor(l.skuId, cases) } : l,
        ),
      };
    }

    case "SET_DELIVERY_WEEK":
      return {
        ...state,
        sellIn: state.sellIn.map((l) => (l.id === action.id ? { ...l, deliveryWeek: action.week } : l)),
        retail: state.retail.map((l) => (l.id === action.id ? { ...l, deliveryWeek: action.week } : l)),
      };

    case "SET_PROMOTION":
      return {
        ...state,
        sellIn: state.sellIn.map((l) => (l.id === action.id ? { ...l, promotionId: action.promotionId } : l)),
        retail: state.retail.map((l) => (l.id === action.id ? { ...l, promotionId: action.promotionId } : l)),
      };

    case "SET_COMMITMENT":
      return {
        ...state,
        retail: state.retail.map((l) => (l.id === action.id ? { ...l, commitment: action.commitment } : l)),
      };

    case "SET_NOTE":
      return {
        ...state,
        sellIn: state.sellIn.map((l) => (l.id === action.id ? { ...l, notes: action.note } : l)),
        retail: state.retail.map((l) => (l.id === action.id ? { ...l, notes: action.note } : l)),
      };

    case "REORDER":
      return {
        ...state,
        sellIn: reorder(state.sellIn, action.id, action.direction),
        retail: reorder(state.retail, action.id, action.direction),
      };

    case "BULK_PROMOTION": {
      const ids = new Set(action.ids);
      return {
        ...state,
        sellIn: state.sellIn.map((l) => (ids.has(l.id) ? { ...l, promotionId: action.promotionId } : l)),
        retail: state.retail.map((l) => (ids.has(l.id) ? { ...l, promotionId: action.promotionId } : l)),
      };
    }

    case "BULK_DELIVERY_WEEK": {
      const ids = new Set(action.ids);
      return {
        ...state,
        sellIn: state.sellIn.map((l) => (ids.has(l.id) ? { ...l, deliveryWeek: action.week } : l)),
        retail: state.retail.map((l) => (ids.has(l.id) ? { ...l, deliveryWeek: action.week } : l)),
      };
    }

    case "SET_GROUPING":
      return { ...state, grouping: action.grouping };

    case "IMPORT_RECOVERY": {
      const base = state.retail.length;
      const added: RetailExecutionLine[] = action.lines.map((l, i) => ({
        ...l,
        id: nextId("r"),
        ledger: "retail-execution",
        pallets: palletsFor(l.skuId, l.cases),
        sortOrder: base + i,
      }));
      return { ...state, retail: [...state.retail, ...added] };
    }

    case "SUBMIT":
      return { ...state, submittedRequestId: action.requestId };

    case "DISTRIBUTOR_RESPOND":
      return {
        ...state,
        distributorResponses: {
          ...state.distributorResponses,
          [action.lineId]: {
            disposition: action.disposition,
            acceptedCases: action.acceptedCases,
            reason: action.reason,
            deliveryWeek: action.deliveryWeek,
            respondedAt: "on review",
          },
        },
      };

    case "DISTRIBUTOR_CONFIRM_ALL": {
      const next: Record<string, DistributorResponse> = { ...state.distributorResponses };
      for (const l of state.sellIn) {
        if (!next[l.id] || next[l.id].disposition === "pending") {
          next[l.id] = {
            disposition: "confirmed",
            acceptedCases: l.cases,
            deliveryWeek: l.deliveryWeek,
            respondedAt: "on review",
          };
        }
      }
      return { ...state, distributorResponses: next };
    }

    case "DISTRIBUTOR_SUBMIT":
      return { ...state, distributorConfirmedAt: action.at };

    case "DISTRIBUTOR_RESET":
      return { ...state, distributorResponses: {}, distributorConfirmedAt: null };

    case "LOAD":
      return action.state;

    case "CLEAR":
      return { ...INITIAL_PLAN_STATE, scenarioId: state.scenarioId };

    default:
      return state;
  }
}

const StateCtx = createContext<PlanState>(INITIAL_PLAN_STATE);
const DispatchCtx = createContext<React.Dispatch<PlanAction>>(() => {});

function loadPersisted(): PlanState {
  if (typeof window === "undefined") return INITIAL_PLAN_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_PLAN_STATE;
    const parsed = JSON.parse(raw) as PlanState;
    // Re-seed the id counter so a restored plan cannot collide with new lines.
    const all = [...(parsed.sellIn ?? []), ...(parsed.retail ?? [])];
    lineSeq = all.length + 1;
    return { ...INITIAL_PLAN_STATE, ...parsed };
  } catch {
    return INITIAL_PLAN_STATE;
  }
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadPersisted);

  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Storage full or blocked. The plan still works in memory; losing
        // persistence is not worth interrupting the user over.
      }
    }, 400);
    return () => window.clearTimeout(t);
  }, [state]);

  const value = useMemo(() => state, [state]);
  return (
    <StateCtx.Provider value={value}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

export const usePlan = () => useContext(StateCtx);
export const usePlanDispatch = () => useContext(DispatchCtx);

export function allLines(state: PlanState): PlanLine[] {
  return [...state.sellIn, ...state.retail];
}

export function accountsInPlan(state: PlanState): Set<string> {
  return new Set(state.retail.map((l) => l.accountId));
}
