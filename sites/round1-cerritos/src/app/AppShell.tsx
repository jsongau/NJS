import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SideRail } from "./SideRail";
import { MegaNav } from "./MegaNav";
import { sectionFor } from "./sections";
import "./sections.css";
import styles from "./AppShell.module.css";

/**
 * The shell. A strip across the top, a rail down the left, and the route
 * in what is left. Or, when a route asks for it, one surface and none of
 * the above.
 *
 * ── WHAT THIS REPLACED, AND WHY ───────────────────────────────────
 * A horizontal bar of six items with a hover panel behind each one. It
 * was drawn on a good argument, that a tight navigation budget stops an
 * information architecture eroding, and it was defeated by a fact: this
 * application has fifteen screens inside the shell, and ten of them could
 * only be reached by hovering. Structure a reader cannot see is structure
 * a reader does not have. A screen was specified, built and then lost
 * inside those panels for long enough to be asked for a second time.
 *
 * A rail costs 252 pixels and buys back the whole map of the product,
 * permanently, with a live figure against every destination. The
 * reasoning for the grouping, the counts and the second level lives in
 * SideRail.tsx, which is where a reader will look for it.
 *
 * ── AND WHY THERE IS A STRIP ABOVE IT AGAIN ───────────────────────
 * The rail solved discoverability and it did not solve reach. Twenty
 * rows is the correct answer to "what is in this product" and the wrong
 * shape for the six rows pressed twenty times a day, which end up
 * scattered down a column between screens that get opened once a week.
 * So the mega nav carries those six across the top, permanently, with
 * the same live figures on them, out of the same hook.
 *
 * It is not the deleted bar returning. Every fault in that bar was the
 * hover panel: ten screens reachable only by resting a pointer on a
 * word, no keyboard equivalent, no touch equivalent, and a whole screen
 * lost inside the panels for long enough to be asked for twice. The
 * strip above has no panel, no flyout and no second level. Six items,
 * six labels, six figures, all painted at all times, all six also in the
 * rail. It adds a shortcut and it hides nothing.
 *
 * ── THE DRAWER, AND WHY THE SHELL OWNS IT ─────────────────────────
 * Below 900px the rail's 252 pixels are a third of a phone, so it moves
 * into a drawer opened by the hamburger the mega nav carries. The state,
 * the focus trap, the Escape key and the scrim all live here rather than
 * in either navigation, for one reason: making the page behind a drawer
 * inert means reaching `main`, and `main` belongs to the shell. A rail
 * that reached out of itself to disable its siblings would be a
 * component with an opinion about what it is next to.
 *
 * ── WHAT THE SHELL NO LONGER CARRIES ──────────────────────────────
 * A footer disclaimer, a link to the method page reading "How every
 * number here works", and a floating demo mode badge, all three repeated
 * on every one of the seventeen screens. They are gone.
 *
 * The claim they made is true and it still has to be made, which is why
 * it survives in the two places built to carry it: /method argues the
 * whole provenance question, disclaimer included, and /quote is prospect
 * facing and carries its own footer and its own demo notice because a
 * school activities director reading it never sees this chrome at all.
 * Repeating the same paragraph on the other fifteen screens bought no
 * extra honesty and cost a band of vertical space on every phone, and the
 * badge pinned above it ended up sitting on the footer's only control.
 * Said once, in the place a reader goes to check it, it is a statement.
 * Said seventeen times it is furniture.
 *
 * ── WHAT THE SHELL ITSELF STILL OWNS ──────────────────────────────
 * The skip link, first in the DOM, because the chrome is a strip of six
 * plus a rail of twenty and a keyboard reader arriving on the tenth
 * screen of the day should not have to walk all of it again.
 *
 * The drawer described above, and the full bleed seam below, because
 * deciding whether the rail is on screen is the one question no page can
 * answer for itself.
 *
 * ── AND WHICH SECTION THE READER IS STANDING IN ───────────────────
 * The shell writes `data-sec` on its own root from the current path, and
 * sections.css turns that one attribute into three inherited custom
 * properties. Everything below it, the strip, the rail, the header band
 * and any page furniture that asks, then reads its identity through
 * var() without being handed anything. The full reasoning is at the top
 * of sections.ts. The shell is the right place for it for the same
 * reason the drawer is: the current path is a fact about the whole
 * screen, and a component that asked its parent which section it was in
 * would be a component with an opinion about what it is inside.
 */

/**
 * WHERE THE RAIL STOPS BEING AFFORDABLE, IN ONE PLACE.
 *
 * The number is repeated in MegaNav.module.css and SideRail.module.css
 * because a media query cannot read a custom property, which is a real
 * limitation of CSS and not an oversight here. This constant is the one
 * the behaviour keys off, the two stylesheets say so where they use it,
 * and all three carry the same figure. If it moves, it moves in three
 * places and a browser at 899 pixels will say so immediately.
 */
const NARROW = "(max-width: 899px)";

// ---------------------------------------------------------------
// The full bleed seam
// ---------------------------------------------------------------

/**
 * FULL BLEED IS A ROUTE'S DECISION, NOT THE SHELL'S.
 *
 * One screen in this application is a working surface rather than a
 * document: the trade area board, which is a header, a figure strip and
 * three panes that have to fill whatever height the browser gives them.
 * A 252 pixel rail and a scrolling content column are exactly wrong for
 * it, and it is the only screen that is true of today.
 *
 * The tempting shortcut is a path test inside this file, something of the
 * form "if the location is /map, drop the rail". It works on the first
 * day and it is how a shell starts accumulating knowledge of its
 * children: every later takeover adds another string, the route file and
 * the shell file have to be edited together to move a screen, and a
 * component that is supposed to be indifferent to its contents ends up
 * naming them. So the direction is inverted. The route renders
 * `FullBleedRoute` and the shell reacts. This file does not know, and
 * must never learn, which path is doing it.
 *
 * The registration runs in a LAYOUT effect rather than a passive one on
 * purpose. Both fire before the browser paints, but only a layout effect
 * flushes the state change it triggers before that paint as well, so the
 * rail is never drawn for a frame and thrown away. That is the whole of
 * the "no flash on entry" requirement; the shell is already a fixed
 * viewport with its own overflow, so there is no document scrollbar to
 * appear or vanish either.
 */
interface FullBleedShell {
  /** Called by the surface as it mounts. `here` is the path it is on. */
  enter: (here: string) => void;
  /** Called by the surface as it unmounts, however that came about. */
  leave: () => void;
  /** The one way out. Escape and the visible control both call this. */
  exit: () => void;
}

const FullBleedContext = createContext<FullBleedShell | null>(null);

/**
 * Where a return leads when the surface was the reader's first screen of
 * the session, typically because they followed a deep link into it. The
 * desk is the front door of the application, which is the reasoning
 * written down in App.tsx, so it is the only sensible landing.
 */
const FULL_BLEED_FALLBACK = "/";

/**
 * How many recent screens the shell remembers in order to answer "where
 * was I before this". Two would do for one takeover; four costs nothing
 * and survives a screen that redirects on the way in.
 */
const TRAIL_LIMIT = 4;

/**
 * WHERE FOCUS CAME FROM, RECORDED TWICE, BECAUSE ONCE IS NOT ENOUGH.
 *
 * Returning focus to the control that opened a surface normally means
 * holding the element and calling focus() on it afterwards. That fails
 * here for a reason that is the point of the feature rather than a bug in
 * it: the control is usually a rail link, and in full bleed the rail is
 * genuinely unmounted. The node the reader clicked no longer exists by
 * the time they come back, and the rail that returns is built from new
 * ones.
 *
 * The node does not survive. Its address does. So the anchor keeps the
 * element for the ordinary case, where the opener was inside the page and
 * is still connected, and a selector for the case where it was not, so
 * the same control can be found again in the rebuilt rail.
 *
 * The anchor is also recorded EARLY, from a focusin listener, rather than
 * read at the moment the surface registers. By then it is too late: React
 * has already removed the previous screen from the document, the control
 * the reader clicked went with it, and document.activeElement has fallen
 * back to the body. The shell therefore keeps the last control that held
 * focus while it was railed, which is the one that opened the takeover in
 * every case that matters, including a keyboard reader pressing Enter on
 * a rail link.
 */
interface FocusAnchor {
  element: HTMLElement | null;
  selector: string | null;
}

function focusAnchorFor(node: Element | null): FocusAnchor | null {
  if (!(node instanceof HTMLElement) || node === document.body) return null;

  let selector: string | null = null;
  if (node.id) {
    selector = `#${CSS.escape(node.id)}`;
  } else {
    const href = node.getAttribute("href");
    if (node.tagName === "A" && href) {
      /* JSON.stringify rather than CSS.escape: this is a quoted attribute
         value, not an identifier, and the two take different escapes. */
      selector = `a[href=${JSON.stringify(href)}]`;
    }
  }

  return { element: node, selector };
}

function returnFocusTo(anchor: FocusAnchor | null) {
  if (!anchor) return;

  if (anchor.element && anchor.element.isConnected) {
    anchor.element.focus({ preventScroll: true });
    return;
  }

  if (!anchor.selector) return;
  const found = document.querySelector(anchor.selector);
  if (found instanceof HTMLElement) found.focus({ preventScroll: true });
}

/**
 * The element inside `main` that actually scrolls.
 *
 * Every top level page in this application takes `flex: 1; min-height: 0;
 * overflow-y: auto` on its own root, which is what keeps the shell one
 * viewport tall. That makes the page root the scroller, not `main`, so
 * remembering a reader's place means finding it. Reading the computed
 * style rather than trusting the first child keeps this honest if a page
 * ever wraps itself in something.
 */
function scrollSurfaceIn(main: HTMLElement | null): HTMLElement | null {
  if (!main) return null;
  for (const child of Array.from(main.children)) {
    if (!(child instanceof HTMLElement)) continue;
    const overflowY = getComputedStyle(child).overflowY;
    if (overflowY === "auto" || overflowY === "scroll") return child;
  }
  return null;
}

// ---------------------------------------------------------------
// The shell
// ---------------------------------------------------------------

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLElement>(null);

  const [fullBleed, setFullBleed] = useState(false);

  /* The rail drawer, and whether the layout is narrow enough for it to be
     a drawer at all. Deliberately not persisted: a collapsed rail is a
     preference about how somebody likes to work, an open menu is a thing
     they are doing right now, and restoring it on the next load would
     greet a returning reader with the menu instead of the screen. */
  const [navOpen, setNavOpen] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const returnToBurger = useRef(false);

  /* The path, including its query, is the key for everything below.
     Two visits to /map with different prospects selected are two places a
     reader can be standing and should be remembered separately. */
  const pathKey = location.pathname + location.search;

  /* State the shell keeps in refs rather than in state, because nothing
     here should cause a render: reading it is always a response to
     something the reader just did. */
  const fullBleedRef = useRef(false);
  const trailRef = useRef<string[]>([]);
  const returnToRef = useRef<string | null>(null);
  const openerRef = useRef<FocusAnchor | null>(null);
  const lastFocusRef = useRef<FocusAnchor | null>(null);
  const restoreFocusRef = useRef(false);
  const scrollTops = useRef(new Map<string, number>());

  /* navigate() is not guaranteed to keep its identity across renders, and
     the exit callback must, because the surface registers once and holds
     what it was given. Holding the latest navigate in a ref buys a
     permanently stable exit without the surface re-registering every time
     the router re-renders. */
  const navigateRef = useRef(navigate);
  useLayoutEffect(() => {
    navigateRef.current = navigate;
  });

  /* The trail of settled paths. This runs after the surface's own
     registration on the commit that enters full bleed, which is why entry
     picks its return target out of the trail by searching backwards for
     the first path that is not the one it is standing on, rather than
     assuming the last entry is the previous screen. Ordering that a
     reader has to reason about is ordering that will be got wrong later.*/
  useLayoutEffect(() => {
    const trail = trailRef.current;
    if (trail[trail.length - 1] === pathKey) return;
    trail.push(pathKey);
    if (trail.length > TRAIL_LIMIT) trail.shift();
  }, [pathKey]);

  /**
   * THE READER'S PLACE ON EACH SCREEN.
   *
   * Leaving a takeover is supposed to put somebody back where they were,
   * and "where they were" on a list of two hundred and eleven organisations
   * is a scroll offset, not a path. The browser cannot help: it restores
   * the document scroll, and in this shell the document never scrolls, the
   * page root does.
   *
   * The offsets are keyed by path, so this also does the obvious right
   * thing for ordinary navigation around the rail. The map is bounded by
   * the number of screens in the application, so it does not grow.
   */
  useLayoutEffect(() => {
    if (fullBleed) return;
    const surface = scrollSurfaceIn(mainRef.current);
    if (!surface) return;

    const parked = scrollTops.current.get(pathKey);
    if (parked) surface.scrollTop = parked;

    const onScroll = () => {
      scrollTops.current.set(pathKey, surface.scrollTop);
    };
    surface.addEventListener("scroll", onScroll, { passive: true });
    return () => surface.removeEventListener("scroll", onScroll);
  }, [fullBleed, pathKey]);

  /* Who had focus last, while there was still a rail to have it. Nulls
     are dropped rather than stored: an element being removed hands focus
     back to the body, and remembering the body as the opener would throw
     away the control that was there a moment earlier. */
  useEffect(() => {
    function onFocusIn(event: FocusEvent) {
      if (fullBleedRef.current) return;
      const anchor = focusAnchorFor(event.target as Element | null);
      if (anchor) lastFocusRef.current = anchor;
    }
    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, []);

  /* Focus goes home in a PASSIVE effect, unlike everything else here. The
     rail has to be mounted and laid out before the control that opened
     the takeover can be found again in it. */
  useEffect(() => {
    if (fullBleed || !restoreFocusRef.current) return;
    restoreFocusRef.current = false;
    const anchor = openerRef.current;
    openerRef.current = null;
    returnFocusTo(anchor);
  }, [fullBleed]);

  // -------------------------------------------------------------
  // The rail drawer
  // -------------------------------------------------------------

  /* Whether the rail is a column or a drawer, read from the same query
     the two stylesheets use. A resize past the breakpoint shuts the
     drawer rather than leaving it open behind a rail that has just come
     back, which would put two copies of the same navigation on screen. */
  useEffect(() => {
    const mq = window.matchMedia(NARROW);
    const apply = () => {
      setNarrow(mq.matches);
      if (!mq.matches) setNavOpen(false);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const closeNav = useCallback(() => {
    returnToBurger.current = true;
    setNavOpen(false);
  }, []);

  /* A destination chosen from the drawer closes it. Leaving a menu open
     over the screen somebody just asked for is the single most irritating
     thing a mobile navigation does. The click handler just below is the
     belt to this braces: a link back to the screen you are already on
     changes no path, so this effect would never fire for it. */
  useEffect(() => {
    if (!navOpen) return;
    returnToBurger.current = true;
    setNavOpen(false);
    /* Only the path matters here. The drawer must survive the query
       string changing under it, which the lane filters do. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const onDrawerClick = useCallback(
    (event: React.MouseEvent) => {
      const target = event.target as Element | null;
      if (target?.closest("a[href]")) closeNav();
    },
    [closeNav],
  );

  /**
   * WHAT IS REACHABLE, AND WHAT SCROLLS, WHILE THE DRAWER IS OPEN.
   *
   * `inert` on the route removes the whole page behind the drawer from
   * the tab order, from the accessibility tree and from hit testing in
   * one attribute, which is three separate bugs that used to be written
   * by hand and got one of them wrong. aria-hidden goes on beside it for
   * the browsers that support one and not the other.
   *
   * Scrolling is the part inert does not cover. The document itself never
   * scrolls in this shell, but the page inside `main` does, and a menu
   * that lets the page slide about underneath it feels broken on a phone.
   * So the real scroller is found the same way the place-keeping effect
   * above finds it, frozen, and given its offset back on the way out.
   *
   * When the rail is a column none of this happens. The drawer is not a
   * drawer at that width and the page behind it is simply the page.
   *
   * IT IS DECLARED ABOVE THE FOCUS TRAP AND THAT ORDER IS LOAD BEARING.
   * Effects run in the order they are written, the drawer is still
   * marked inert from the previous commit at the moment it opens, and
   * calling focus() on anything inside an inert subtree does exactly
   * nothing. Written the other way round the trap silently loses its
   * first move and a keyboard reader has to press Tab twice to get in.
   */
  useEffect(() => {
    const drawer = drawerRef.current;
    const main = mainRef.current;
    const blocked = narrow && navOpen;

    if (drawer) {
      /* Shut, on a narrow screen, the rail is off the page entirely. It
         is left mounted so it keeps its scroll position and its state,
         and made unreachable so a tab press cannot walk into a column
         nobody can see. */
      const hidden = narrow && !navOpen;
      drawer.toggleAttribute("inert", hidden);
      if (hidden) drawer.setAttribute("aria-hidden", "true");
      else drawer.removeAttribute("aria-hidden");
    }

    if (!main) return;
    main.toggleAttribute("inert", blocked);
    if (blocked) main.setAttribute("aria-hidden", "true");
    else main.removeAttribute("aria-hidden");

    if (!blocked) return;
    const surface = scrollSurfaceIn(main);
    if (!surface) return;
    const parked = surface.scrollTop;
    const before = surface.style.overflowY;
    surface.style.overflowY = "hidden";
    return () => {
      surface.style.overflowY = before;
      surface.scrollTop = parked;
    };
  }, [narrow, navOpen, fullBleed]);

  /**
   * THE TRAP, THE ESCAPE KEY AND THE WAY BACK TO THE HAMBURGER.
   *
   * A drawer over a page is a dead end for a keyboard reader unless Tab
   * stops at its edges, so Tab wraps inside it and Escape leaves. The
   * list of focusable children is read out of the DOM on every press
   * rather than cached, because the rail's second level appears and
   * disappears as the route changes and a cached list would send focus to
   * a row that is no longer there.
   *
   * Escape is bound in the CAPTURE phase, ahead of the takeover handler
   * at the foot of this file, which binds in the bubble phase precisely
   * so the topmost layer always wins. The drawer is the topmost layer
   * while it is open.
   */
  useEffect(() => {
    if (!navOpen) return;
    const drawer = drawerRef.current;
    if (!drawer) return;

    const focusable = () =>
      Array.from(
        drawer.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), select:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);

    focusable()[0]?.focus({ preventScroll: true });

    const trap = drawer;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeNav();
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const here = document.activeElement as HTMLElement | null;
      const inside = here ? trap.contains(here) : false;

      if (event.shiftKey) {
        if (!inside || here === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (!inside || here === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [navOpen, closeNav]);

  /* Focus goes back to the control that opened the drawer, and only when
     a person closed it. A drawer shut by a resize past the breakpoint
     must not reach across the screen and take focus off whatever they
     were doing. */
  useEffect(() => {
    if (navOpen || !returnToBurger.current) return;
    returnToBurger.current = false;
    burgerRef.current?.focus({ preventScroll: true });
  }, [navOpen]);

  const enter = useCallback((here: string) => {
    const trail = trailRef.current;
    let back: string | null = null;
    for (let i = trail.length - 1; i >= 0; i -= 1) {
      if (trail[i] !== here) {
        back = trail[i];
        break;
      }
    }
    returnToRef.current = back;
    openerRef.current = lastFocusRef.current;
    fullBleedRef.current = true;
    setFullBleed(true);
  }, []);

  const leave = useCallback(() => {
    fullBleedRef.current = false;
    restoreFocusRef.current = true;
    setFullBleed(false);
  }, []);

  const exit = useCallback(() => {
    /* Nothing to leave. A control wired to this outside a takeover should
       do nothing rather than navigate somebody off their screen. */
    if (!fullBleedRef.current) return;
    navigateRef.current(returnToRef.current ?? FULL_BLEED_FALLBACK);
  }, []);

  /* One object, built once. The surface registers against it on mount and
     never again, so an identity that changed would re-register the
     takeover on every render of the shell. */
  const shell = useMemo<FullBleedShell>(
    () => ({ enter, leave, exit }),
    [enter, leave, exit],
  );

  return (
    <FullBleedContext.Provider value={shell}>
      <div
        className={styles.shell}
        data-mode={fullBleed ? "full-bleed" : "railed"}
        data-nav={navOpen ? "open" : "shut"}
        /* Always written, even where no section matches, so the base
           block in sections.css supplies the fallback ink rather than
           leaving every var(--sec) in the application undefined. */
        data-sec={sectionFor(location.pathname) ?? "none"}
      >
        {/*
          All of these are rendered conditionally in place rather than
          moved, so that switching modes changes only these slots. `main`
          and everything the route has built inside it keep their position
          in the tree, which means entering full bleed does not remount
          the screen, lose its state or reset its scroll.

          The skip link goes with the chrome because it exists to skip the
          chrome. Offering to skip a navigation that is not there is a
          keyboard reader's version of a dead link.
        */}
        {fullBleed ? null : (
          <a className="skip-link" href="#main">
            Skip the navigation and go to the content
          </a>
        )}

        {/*
          ── THE MEGA NAV GOES WITH THE RAIL IN A TAKEOVER ────────────
          The map board is a takeover and it should stay one: it is three
          panes that have to fill the viewport, and leaving a strip of
          chrome across the top would take a band off every one of them
          to save a reader one press. The board draws its own exit
          control in its own chrome band, labelled with words rather than
          a glyph, which is the control a phone reader needs because a
          phone has no Escape key.
        */}
        {fullBleed ? null : (
          <MegaNav
            navOpen={navOpen}
            onToggleNav={() =>
              setNavOpen((open) => {
                if (open) returnToBurger.current = true;
                return !open;
              })
            }
            burgerRef={burgerRef}
            drawerId="shell-drawer"
          />
        )}

        {/*
          The scrim is a button rather than a div with a click handler,
          because it is a control: pressing it shuts the drawer. It is
          aria-hidden and out of the tab order because Escape and the
          hamburger already say the same thing to a keyboard, and a third
          unlabelled stop in the sequence would be noise.
        */}
        {fullBleed ? null : (
          <button
            type="button"
            className={styles.scrim}
            tabIndex={-1}
            aria-hidden="true"
            onClick={closeNav}
          />
        )}

        {fullBleed ? null : (
          <div
            id="shell-drawer"
            className={styles.drawer}
            ref={drawerRef}
            onClick={onDrawerClick}
          >
            <SideRail />
          </div>
        )}

        {/*
          The content column scrolls on its own, or rather the page inside
          it does. The rail does not move with it, which is the entire
          point of a rail: a person four thousand pixels down the capacity
          chart can still see what is waiting on the queue.
        */}
        <main id="main" className={styles.main} ref={mainRef}>
          {children}
        </main>
      </div>
    </FullBleedContext.Provider>
  );
}

// ---------------------------------------------------------------
// What a route uses
// ---------------------------------------------------------------

/**
 * THE OPT IN. Render this as the outermost element of a route and that
 * route owns the whole viewport below the browser chrome: no rail, no
 * padding, nothing of the shell left except the escape hatch out.
 *
 *   export function TradeAreaPage() {
 *     return (
 *       <FullBleedRoute label="Maps board">
 *         ...header, figure strip, panes...
 *       </FullBleedRoute>
 *     );
 *   }
 *
 * The surface is a flex COLUMN filling the viewport, which is the same
 * idiom every other page root uses in this application. A header and a
 * figure strip sit at their natural heights and the pane region takes
 * `flex: 1; min-height: 0` to fill what is left.
 *
 * It is a labelled region, not a dialog. `role="dialog"` with
 * `aria-modal` would tell a screen reader that the rest of the page still
 * exists behind this one and is being suppressed, which is a lie: there
 * is no rest of the page, the rail is unmounted. A named region is what
 * this is, so that is what it announces.
 *
 * ESCAPE IS BOUND ON THE DOCUMENT IN THE BUBBLE PHASE, deliberately last.
 * Layers inside the surface, the compose modal above all, bind in the
 * capture phase and stop the event, so Escape always closes the topmost
 * thing and only that. Any inner layer that consumes Escape must either
 * stop propagation or call preventDefault, and this handler honours both.
 */
export function FullBleedRoute({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const shell = useContext(FullBleedContext);
  const location = useLocation();
  const surfaceRef = useRef<HTMLElement>(null);

  /* The path at the moment of mounting. A takeover that changes its own
     query string, which the board does whenever a prospect is selected,
     must not re-register itself and must not lose the screen it came
     from. */
  const hereRef = useRef(location.pathname + location.search);

  useLayoutEffect(() => {
    /* Rendered outside AppShell, this is simply a region that fills its
       parent. The prospect facing quote page has no shell at all, and a
       component that threw there would be a trap laid for later. */
    if (!shell) return;
    shell.enter(hereRef.current);
    return () => shell.leave();
  }, [shell]);

  /* Focus moves in on entry. A surface that replaces the entire screen
     while the reader's focus is still on a rail link they can no longer
     see is a screen a keyboard reader has to hunt for. preventScroll
     because the panes below may already be positioned. */
  useLayoutEffect(() => {
    surfaceRef.current?.focus({ preventScroll: true });
  }, []);

  const exit = shell?.exit;
  useEffect(() => {
    if (!exit) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      event.preventDefault();
      exit?.();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [exit]);

  return (
    <section
      ref={surfaceRef}
      className={styles.surface}
      tabIndex={-1}
      aria-label={label}
    >
      {children}
    </section>
  );
}

/**
 * THE WAY OUT, for the visible control.
 *
 * Escape and a button have to do the same thing, so they call the same
 * function. Give it to a real `<button type="button">` with a real label,
 * "Back to console" or whatever the screen calls the place it came from,
 * because Escape alone is a keyboard secret and a touch reader has no
 * Escape key at all.
 *
 * The hook reads from AppShell rather than from the surface, so a route
 * can call it in the same component that renders `FullBleedRoute` and
 * hand the callback down as a prop. Outside a takeover it returns a
 * function that does nothing, which keeps a shared header component
 * usable on a railed screen.
 */
export function useFullBleedExit(): () => void {
  const shell = useContext(FullBleedContext);
  const noop = useCallback(() => {}, []);
  return shell ? shell.exit : noop;
}
