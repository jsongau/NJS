import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "react-router-dom";
import {
  ProspectRecordModal,
  snoozeUntilDay,
} from "@/components/record/ProspectRecordModal";

/**
 * ONE MODAL IN THE TREE, OPENABLE FROM ANYWHERE, ADDRESSABLE BY URL.
 *
 * WHY THIS FILE EXISTS. A business name appears on eleven surfaces: the
 * desk table, the lane board, the map list, the map popup, the inbox,
 * the week sheet, the field run, the requests queue. Every one of them
 * has to be able to open the same record. Threading an `onOpenRecord`
 * callback down from each page into a popup that Leaflet renders into a
 * detached DOM node is four layers of plumbing per surface, and the
 * plumbing is where the divergence starts: one surface passes the
 * prospect, another passes the id, a third forgets to close its own
 * panel first and leaves two overlapping dialogs on screen.
 *
 * So the modal is mounted exactly once, here, and every name on every
 * screen is a button that calls `openRecord(id)`. A surface that wants
 * to open a record needs no state, no props and no cleanup.
 *
 * THE OPEN RECORD LIVES IN THE URL, and that is the second reason this
 * file exists. `?record=brea-olinda-high-school` on any route opens that
 * organisation over that screen. A record can therefore be pasted to
 * somebody, bookmarked, or reopened after a reload, and the browser's
 * back button closes it because closing it is what going back to the
 * previous URL means. Holding it in React state instead would make the
 * most linkable object in the application the only one with no address.
 *
 * WHAT IT DELIBERATELY DOES NOT DO. It does not fetch, cache or store a
 * record. `prospectRecord` derives everything from the providers at
 * render, so there is nothing here to go stale, and opening the same
 * organisation twice cannot show two different answers.
 */

/** The search parameter a record is addressed by. */
export const RECORD_PARAM = "record";

/**
 * A snoozed record, and the reason this is the one piece of state the
 * provider actually holds.
 *
 * Snooze is the only honest way to clear a queue without pretending the
 * work is done, which is why Close ships it as a first class verb rather
 * than as a note. It is held here, beside the record surface that sets
 * it, rather than pushed into the pipeline table, because a snooze is
 * not a fact about where an organisation stands; it is a fact about when
 * this desk next wants to see it. Any surface that wants to hide snoozed
 * rows reads `useRecordSnoozes()` and filters on it.
 *
 * IT IS A SESSION, NOT A LEDGER. Nothing here is written to storage. A
 * decision that survives a reload has to be defensible six months later,
 * and "hidden from a queue for a fortnight because somebody pressed a
 * button on a demo" is not.
 */
export interface RecordSnooze {
  prospectId: string;
  /** Venue-local calendar day, YYYY-MM-DD. */
  until: string;
  days: number;
}

export interface RecordController {
  /** The organisation whose record is open, or null. */
  openId: string | null;
  openRecord: (prospectId: string) => void;
  closeRecord: () => void;
  snoozes: Record<string, RecordSnooze>;
  snooze: (prospectId: string, days: number) => void;
  clearSnooze: (prospectId: string) => void;
}

/**
 * The snooze intervals offered, in days.
 *
 * Three, seven and fourteen. Three days is "they are mid-term and I will
 * try again this week", a week is the default follow-up cadence in this
 * app, and a fortnight is how long a school front office is dark. A
 * picker with eight options is a picker nobody reads.
 */
export const SNOOZE_OPTIONS: number[] = [3, 7, 14];

let warned = false;

/**
 * What a name does when nobody mounted the provider.
 *
 * It warns once and does nothing, rather than throwing. A missing
 * provider should not take down a page that renders two hundred and eleven
 * names, and the warning names the fix.
 */
const FALLBACK: RecordController = {
  openId: null,
  openRecord: () => {
    if (warned) return;
    warned = true;
    // eslint-disable-next-line no-console
    console.warn(
      "RecordName was pressed with no RecordProvider above it. Wrap the app shell in <RecordProvider> so the record modal has somewhere to render.",
    );
  },
  closeRecord: () => {},
  snoozes: {},
  snooze: () => {},
  clearSnooze: () => {},
};

const Ctx = createContext<RecordController>(FALLBACK);

export function RecordProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useSearchParams();
  const [snoozes, setSnoozes] = useState<Record<string, RecordSnooze>>({});

  const openId = params.get(RECORD_PARAM);

  /**
   * The element that opened the record, so focus can go back to it.
   *
   * Captured at the moment of the press rather than read on unmount,
   * because by unmount the active element is a control inside the modal.
   * A keyboard reader who opens the fortieth row of the desk and closes
   * it belongs back on the fortieth row, not at the top of the document.
   */
  const openerRef = useRef<HTMLElement | null>(null);

  const openRecord = useCallback(
    (prospectId: string) => {
      openerRef.current = document.activeElement as HTMLElement | null;
      const next = new URLSearchParams(params);
      next.set(RECORD_PARAM, prospectId);
      /* Pushed rather than replaced, so the back button closes the
         record. Opening a record is a place a reader went. */
      setParams(next);
    },
    [params, setParams],
  );

  const closeRecord = useCallback(() => {
    const next = new URLSearchParams(params);
    next.delete(RECORD_PARAM);
    /* Replaced on the way out, so that closing and reopening a record
       three times does not bury the page the reader came from under six
       history entries. */
    setParams(next, { replace: true });
  }, [params, setParams]);

  const snooze = useCallback((prospectId: string, days: number) => {
    setSnoozes((prev) => ({
      ...prev,
      [prospectId]: { prospectId, days, until: snoozeUntilDay(days) },
    }));
  }, []);

  const clearSnooze = useCallback((prospectId: string) => {
    setSnoozes((prev) => {
      if (!(prospectId in prev)) return prev;
      const next = { ...prev };
      delete next[prospectId];
      return next;
    });
  }, []);

  /**
   * Focus comes back when the record closes.
   *
   * Where the opener has gone away, which happens when a map popup or a
   * filtered list re-renders underneath, focus lands on whatever the
   * page marked with `data-record-return` and then on the main region,
   * so it is never nowhere.
   */
  useEffect(() => {
    if (openId !== null) return;
    const opener = openerRef.current;
    openerRef.current = null;
    if (!opener) return;
    if (opener.isConnected && typeof opener.focus === "function") {
      opener.focus();
      return;
    }
    const fallback =
      document.querySelector<HTMLElement>("[data-record-return]") ??
      document.querySelector<HTMLElement>("main");
    if (!fallback) return;
    if (!fallback.hasAttribute("tabindex")) fallback.setAttribute("tabindex", "-1");
    fallback.focus?.();
  }, [openId]);

  const value = useMemo<RecordController>(
    () => ({ openId, openRecord, closeRecord, snoozes, snooze, clearSnooze }),
    [openId, openRecord, closeRecord, snoozes, snooze, clearSnooze],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      {openId ? (
        /* Keyed by id so opening a second organisation while the first
           is open remounts rather than reconciles. A dialog that keeps
           one organisation's expanded message open under another
           organisation's name is the worst bug this surface can have. */
        <ProspectRecordModal
          key={openId}
          prospectId={openId}
          onClose={closeRecord}
          snoozedUntil={snoozes[openId]?.until ?? null}
          onSnooze={snooze}
          onClearSnooze={clearSnooze}
          snoozeOptions={SNOOZE_OPTIONS}
        />
      ) : null}
    </Ctx.Provider>
  );
}

/** The whole controller. Most callers want `useOpenRecord` instead. */
export function useRecord(): RecordController {
  return useContext(Ctx);
}

/** The one function a business name needs. */
export function useOpenRecord(): (prospectId: string) => void {
  return useContext(Ctx).openRecord;
}

/** Snoozed records, for any queue that wants to hold them back. */
export function useRecordSnoozes(): Record<string, RecordSnooze> {
  return useContext(Ctx).snoozes;
}
