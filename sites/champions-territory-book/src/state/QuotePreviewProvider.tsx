import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useSearchParams } from "react-router-dom";
import { QuotePreviewModal } from "@/components/quote/QuotePreviewModal";

/**
 * THE QUOTE, PREVIEWED OVER THE CONSOLE, WITHOUT LEAVING IT.
 *
 * WHY THIS FILE EXISTS. Five surfaces carried a link to /quote/:id: the
 * map detail pane twice, the record modal, the desk drawer, the requests
 * drawer and the outbox log. Every one of them was a one way trip. That
 * route renders outside the shell on purpose, so pressing any of them
 * took the rail, the strip and the service line filter off the screen and
 * left the browser's back button as the only way home. A marketer who
 * wanted to check what a prospect would see lost the board they were
 * working.
 *
 * The route is right and the controls were wrong. A prospect opening a
 * link from an email should get a bare letter; a marketer looking at the
 * same letter is looking at a preview, and a preview belongs over the work
 * rather than instead of it. So every internal control now asks this
 * provider to open the document in a dialog, and the standalone route is
 * untouched: same URL, same layout, same disclaimer, same demo notice.
 *
 * THE OPEN PREVIEW LIVES IN THE URL, for the reasons RecordProvider
 * gives at length. `?quote=brea-olinda-high-school` over any route opens
 * that letter above that screen, so a preview is a link rather than a
 * piece of state, it survives a reload, and the back button closes it
 * because closing it is what going back means. The door count and the
 * offer ride along beside it, because a proposal covering 380 doors on a
 * maintenance plan is a different document from the bare one, and the
 * preview has to be the one the marketer would actually send.
 *
 * IT SITS ABOVE RecordProvider IN App.tsx, which is a rendering order
 * rather than a hierarchy of importance. The record modal reads this
 * controller so it can stand its own focus trap down while the preview
 * is over it, exactly as it already does for the compose window, and one
 * layer owning the keyboard at a time is the whole reason that works.
 */

/** The search parameters a preview is addressed by. */
export const QUOTE_PARAM = "quote";
export const QUOTE_PACKAGE_PARAM = "quotePackage";
export const QUOTE_GUESTS_PARAM = "quoteGuests";

export interface QuotePreviewOptions {
  /** The package quoted. Omitted means the organisation's lead package. */
  packageId?: string;
  /** The doors discussed. Omitted means the modeled midpoint. */
  guests?: number;
}

export interface QuotePreviewController {
  /** The organisation whose quote is being previewed, or null. */
  openId: string | null;
  packageId: string | null;
  guests: number | null;
  openQuotePreview: (prospectId: string, options?: QuotePreviewOptions) => void;
  closeQuotePreview: () => void;
}

let warned = false;

/**
 * What a preview control does with no provider above it.
 *
 * It warns once and does nothing. A missing provider should not take
 * down a board of three hundred and twenty nine organisations, and the warning
 * names the fix.
 */
const FALLBACK: QuotePreviewController = {
  openId: null,
  packageId: null,
  guests: null,
  openQuotePreview: () => {
    if (warned) return;
    warned = true;
    // eslint-disable-next-line no-console
    console.warn(
      "A group quote control was pressed with no QuotePreviewProvider above it. Wrap the app shell in <QuotePreviewProvider> so the preview has somewhere to render.",
    );
  },
  closeQuotePreview: () => {},
};

const Ctx = createContext<QuotePreviewController>(FALLBACK);

export function QuotePreviewProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useSearchParams();

  const openId = params.get(QUOTE_PARAM);
  const packageId = params.get(QUOTE_PACKAGE_PARAM);
  const guestsParamRaw = params.get(QUOTE_GUESTS_PARAM);
  const guestsNumber = Number(guestsParamRaw);
  const guests =
    guestsParamRaw !== null && Number.isFinite(guestsNumber) && guestsNumber > 0
      ? Math.round(guestsNumber)
      : null;

  /**
   * The control that opened the preview, so focus can go back to it.
   *
   * Captured at the press rather than read on unmount, because by then
   * the active element is a control inside the dialog. Somebody who
   * opened the preview from the fortieth row of a list belongs back on
   * the fortieth row.
   */
  const openerRef = useRef<HTMLElement | null>(null);

  const openQuotePreview = useCallback(
    (prospectId: string, options: QuotePreviewOptions = {}) => {
      openerRef.current = document.activeElement as HTMLElement | null;
      const next = new URLSearchParams(params);
      next.set(QUOTE_PARAM, prospectId);
      if (options.packageId) next.set(QUOTE_PACKAGE_PARAM, options.packageId);
      else next.delete(QUOTE_PACKAGE_PARAM);
      if (options.guests) next.set(QUOTE_GUESTS_PARAM, String(options.guests));
      else next.delete(QUOTE_GUESTS_PARAM);
      /* Pushed rather than replaced, so the back button closes the
         preview. Opening one is a place a reader went. */
      setParams(next);
    },
    [params, setParams],
  );

  const closeQuotePreview = useCallback(() => {
    const next = new URLSearchParams(params);
    next.delete(QUOTE_PARAM);
    next.delete(QUOTE_PACKAGE_PARAM);
    next.delete(QUOTE_GUESTS_PARAM);
    /* Replaced on the way out, so opening and closing three previews
       does not bury the board under six history entries. */
    setParams(next, { replace: true });
  }, [params, setParams]);

  /**
   * Focus comes back when the preview closes.
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
    if (!fallback.hasAttribute("tabindex"))
      fallback.setAttribute("tabindex", "-1");
    fallback.focus?.();
  }, [openId]);

  const value = useMemo<QuotePreviewController>(
    () => ({ openId, packageId, guests, openQuotePreview, closeQuotePreview }),
    [openId, packageId, guests, openQuotePreview, closeQuotePreview],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      {openId ? (
        /* Keyed by id so opening a second organisation's quote while the
           first is open remounts rather than reconciles. One
           organisation's door count left in another organisation's
           calculator is the worst bug this surface can have. */
        <QuotePreviewModal
          key={openId}
          prospectId={openId}
          packageId={packageId}
          guests={guests}
          onClose={closeQuotePreview}
        />
      ) : null}
    </Ctx.Provider>
  );
}

/** The whole controller. Most callers want `useOpenQuotePreview`. */
export function useQuotePreview(): QuotePreviewController {
  return useContext(Ctx);
}

/** The one function a group quote control needs. */
export function useOpenQuotePreview(): (
  prospectId: string,
  options?: QuotePreviewOptions,
) => void {
  return useContext(Ctx).openQuotePreview;
}
