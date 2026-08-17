import type { RefObject } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { PinMark } from "@/components/primitives/PinMark";
import { SectionMark } from "@/components/play/SectionMark";
import { Readout } from "@/components/play/Readout";
import { PROSPECTS } from "@/data/prospects";
import { unworkedCount } from "@/domain/selectors/desk";
import { usePipeline } from "@/state/PipelineProvider";
import { useTheme } from "@/state/ThemeProvider";
import { INBOX_PATH } from "@/pages/InboxPage";
import { useShellFigures } from "./SideRail";
import { FEATURED_KEY, normalisePath, type SectionId } from "./sections";
import { isRationalePath, toConsole, toRationale } from "@/data/rationale";
import styles from "./MegaNav.module.css";

/**
 * THE MEGA NAV. Six queue keys, one featured key, their live figures,
 * the switch that decides which ground the whole application is painted
 * on, and the way into everything else, across the top of every railed
 * screen.
 *
 * ── THIS IS NOT THE BAR THAT WAS DELETED ──────────────────────────
 * A horizontal bar of six items stood here once and it failed, for the
 * reasons written out at the top of AppShell.tsx and again in
 * SideRail.tsx. It failed because ten of the fifteen screens in this
 * application lived inside panels that opened on hover, so the structure
 * of the product was invisible until a pointer rested on the right word,
 * and a whole screen went missing inside those panels for long enough to
 * be asked for a second time.
 *
 * Every part of that failure was the hover panel. None of it was the
 * horizontal bar. So the bar is back and the panels are not, and the
 * distinction is worth stating as a rule the next person can check
 * against: NOTHING IN THIS FILE MAY BE REVEALED BY HOVER. There is no
 * second level here to reveal. Seven destinations, all seven painted at
 * all times, all seven also in the rail below, none of them the only way
 * to reach anything. The queue is capped at six and the cap is the point
 * rather than an accident of the current width; a seventh QUEUE goes in
 * the rail.
 *
 * ── WHY THESE SIX QUEUES, IN THIS ORDER ───────────────────────────
 * The rail answers "what is in this product". This bar answers a much
 * narrower question, which is "what do I press twenty times a day", and
 * the answer comes off what the tool is actually for: one person works a
 * territory around Brea, contacts organisations, records what each said,
 * and books the ones that say yes. That loop has a shape and the bar
 * follows it.
 *
 *   Today     What is late and what is due before this evening. The
 *             first screen of the morning and the one that decides the
 *             order of everything after it.
 *   Inbox     What came back. In a prospecting tool the reply is the
 *             event; everything else is a consequence of one.
 *   Requests  What came in unasked: enquiries and league interest, each
 *             with a clock on it. Inbound beats outbound for urgency
 *             because somebody else is already waiting.
 *   Desk      Who to contact next, ranked. The outbound half of the day,
 *             and the application's front door.
 *   Book      What is signed. The reason for all of the above, and the
 *             figure a sales manager is asked for.
 *   Leagues   The two leagues forming, their field of sixteen and the
 *             asks to join. See the trade below.
 *
 * LEAGUES EARNS ITS SLOT because it is the only RECURRING product the
 * building sells and the only queue on the strip where the clock belongs
 * to somebody else: a forming league either fills its sixteen before the
 * season is called or it does not, and the asks to join arrive
 * unprompted in exactly the way the requests queue's do. During the
 * forming window it is a daily read.
 *
 * ── AND THEN THERE IS MAPS, WHICH IS NOT ONE OF THEM ──────────────
 * Maps was taken off this strip to make room for Leagues and the
 * argument for taking it off was sound: pressing it removes this strip
 * from the document entirely, so it is the only key here that cannot be
 * pressed twice. You arrive, and the row you arrived from is gone.
 *
 * That argument disqualified it as a QUEUE KEY and it was read as a
 * ranking of the screen, which it never was. The six above are queues:
 * a label and a count of work waiting behind it, six of one kind of
 * thing, and the eye is supposed to run along them and stop at the
 * biggest figure. Maps is not that. Its figure is the whole trade area
 * rather than a backlog, it is a place rather than a pile, and it is the
 * one screen in this application somebody would open because they wanted
 * to rather than because something was due.
 *
 * SO IT COMES BACK OUTSIDE THE ROW RATHER THAN INSIDE IT. Its own slot
 * past a divider, its own shape, its own colour, and its figure spelled
 * in words instead of dropped into a readout well. Think of the lit
 * button set apart from the row of small controls on a cabinet: nobody
 * has to be told which one starts the game. The queue is still six, the
 * cap still holds, and the thing that eats the strip when you press it
 * is no longer pretending to be a shortcut to a queue.
 *
 * WHAT CARRIES THAT WITH NO COLOUR AT ALL, because the owner is
 * colourblind and orange on its own is not a feature he can see. The key
 * is set apart in POSITION, past a rule and a gap. It is a filled plate
 * rather than a tab, so it is the only control on the strip with dark
 * type on a light face, which is a value inversion and not a hue. It is
 * WIDER and TALLER, it carries TWO LINES where every queue key carries
 * one, its label is set HEAVIER, and it keeps its mark at the width the
 * queue keys give theirs up. Take every colour out of the strip and it
 * is still the only thing on it that looks like a button.
 *
 * WHAT IS DELIBERATELY NOT HERE. Lanes, Packages, Method and Coaching
 * are reference: consulted, not worked. Sent, Replies and Objections are
 * the record behind the Inbox rather than separate daily destinations.
 * Week sheet and Capacity are planning surfaces opened from the Book.
 * Partners, Promo stock and Budget are the resources the outbound work
 * spends, and none of the three is a queue. All thirteen keep their row
 * in the rail with their own figure on it, and on a phone they are one
 * press of the hamburger away.
 *
 * ── THE FIGURES COME FROM THE RAIL'S OWN HOOK ─────────────────────
 * Not a copy of the selectors, not a second call with a different `now`:
 * useShellFigures, keyed by route, is the single derivation both
 * navigations read. Two chrome elements showing the same count is only
 * safe if there is one count, and there is.
 *
 * ── FOUR SIGNALS ON THE ITEM YOU ARE STANDING ON ──────────────────
 * The owner is colourblind, so the active item carries a rule along its
 * bottom edge, a washed ground, heavier type and its own drawn mark
 * lit, plus the aria-current the router sets. The colour of all of that
 * is the section's own, taken from the data-sec attribute each item
 * carries, so arriving somewhere changes the colour of the strip as well
 * as the position of the mark on it. Any one of the signals would read
 * for most people; the rule and the mark survive greyscale, a projector
 * and a photograph of a screen.
 */

interface MegaItem {
  to: string;
  label: string;
  /** The section, which supplies both the mark and the identity ink. */
  sec: SectionId;
  /**
   * The order they stand down in, and every width is measured in a
   * browser rather than chosen: rank 6 at 1425, rank 5 at 1266, rank 4
   * at 1133, rank 3 at 1001 and rank 2 at 454. All five moved when the
   * ground switch arrived on the strip, because the switch is 99 pixels
   * and a gutter and the widths that say what fits have to know it.
   * Rank 1 is on the bar at every width down to 360. Nothing is lost:
   * the hamburger sits beside them at every one of those widths, it
   * never moves, and the drawer behind it carries all twenty
   * destinations with their figures on them. The measurements are in
   * MegaNav.module.css beside the rules.
   */
  rank: 1 | 2 | 3 | 4 | 5 | 6;
}

/*
  THE STRIP STOPPED BEING A SHORTER COPY OF THE RAIL.

  Every one of the six keys this list used to carry was also a row in the
  rail, which meant the bar had no job the rail was not already doing and
  a reader had two places to look for one answer. The rule now is one
  line long: THE BAR IS WHAT IS WAITING FOR YOU, THE RAIL IS WHERE THINGS
  ARE. Nothing appears in both.

  So Desk and Book left, because they are places and the rail is the map.
  Today, Inbox and Requests stayed, because each one is a count of work
  that arrived without being asked for and a reader needs to see it from
  any screen without opening anything.

  Leagues stayed on the same reasoning even though it reads as a place:
  the four is teams waiting to be answered, not leagues that exist, and a
  league ask that sits unanswered for a week is a lost season rather than
  a stale row. Maps stayed as the featured key, which is a different
  instrument again and is argued for beside it below.
*/
const ITEMS: MegaItem[] = [
  { to: "/today", label: "Today", sec: "today", rank: 1 },
  { to: INBOX_PATH, label: "Inbox", sec: "inbox", rank: 2 },
  { to: "/requests", label: "Requests", sec: "requests", rank: 3 },
  { to: "/leagues", label: "Leagues", sec: "leagues", rank: 4 },
];

/*
  THE MODE SWITCH, AND WHY IT IS ON THE BAR RATHER THAN ON A PAGE.

  Console and Rationale are not two destinations, they are two readings
  of the same work: the instrument, and the argument for why it is shaped
  like that. A control that changes which of those you are in is a
  different class of thing from a control that changes which screen you
  are on, so it sits before the queues and outside their list, with a
  divider between.

  It was on the Rationale page itself first, which meant the way back was
  visible from Rationale and the way in was visible from nowhere. A mode
  you can leave but cannot enter is not a mode.
*/
/*
  THE MODE SWITCH, AND WHY IT DOES NOT SEND YOU HOME.

  Console and Rationale are two readings of the same work: the
  instrument, and the argument for why the instrument is shaped like
  that. So the switch is not a link to two pages, it is a translation of
  the address you are already at. Standing on Lanes and pressing
  Rationale gets you how Lanes was built, and pressing Console again puts
  you back on Lanes.

  The first version sent both modes to a fixed destination, which threw
  away the reader's place every time they asked a question about the
  screen in front of them. That is the opposite of what a mode is for.
*/


/**
 * THE GROUND SWITCH, WHICH IS ONE BUTTON AND NOT TWO OPTIONS.
 *
 * It stood in the rail foot as a fieldset of two radios and the ask was
 * to move it onto the housing and make it flip on one press. That is not
 * a restyle. A radio group asks a reader to aim: read two labels, decide
 * which one is not the one they are on, hit that one. There are only two
 * grounds and a reader pressing this already knows they want the other,
 * so every part of the aiming is work the control invented for itself.
 *
 * ── WHY NOT aria-pressed ──────────────────────────────────────────
 * A toggle button is the usual model and it was the first thing tried.
 * It wants a name that HOLDS STILL while the state moves under it, which
 * means the name has to be one thing being switched on and off: "Light
 * ground", pressed or not pressed. That is a lie about this control in a
 * way that only a listener pays for. Dark is not light switched off; it
 * is a named ground with its own palette, its own contrast tables and
 * its own half of this switch, and "Light ground, not pressed" leaves a
 * listener to infer the ground they are actually on from a word the
 * control never says.
 *
 * So it is a plain button and the name carries both: the ground now, and
 * what pressing will do to it. "Ground dark, switch to light." The state
 * half is not padding, it is the visible word the switch prints, which
 * is what keeps the name honest for anybody driving this by voice.
 *
 * ── AND THE STATE IS ON SCREEN FOUR WAYS, NONE OF THEM COLOUR ─────
 * The owner is colourblind and this is the one control in the product
 * that is about colour, so it is built to be read with none.
 *
 *   POSITION  The cap is at the moon end or the sun end. A switch that
 *             has travelled is the oldest state indicator there is, and
 *             a solid cap is the version of it the eye actually catches
 *             at this size. A hollow frame was tried first and did not.
 *   FILL      The cap is the page's own paint and the slot behind it is
 *             the other ground, one near black and one near white out of
 *             the palette the reader is on, at a value distance no
 *             dichromacy and no greyscale can collapse.
 *   GLYPH     A solid crescent against a radiating disc. Two different
 *             silhouettes, not two colours of the same shape.
 *   WORD      The ground is printed beside the switch, in words.
 *
 * The cap travels over a duration token, which the query at the foot of
 * tokens.css zeroes for a reader who has asked their system to stop
 * moving things. Nothing else on the page animates on a press: repainting
 * every surface through a cross fade is a second of a product looking
 * broken, and the ground arrives in one frame instead.
 */
function GroundSwitch() {
  const { theme, toggle } = useTheme();
  const lit = theme === "light";

  return (
    <button
      type="button"
      /* One on the page, and scripts/proof-ground.mjs drives it by this
         name. A hook a proof depends on is part of the component. */
      id="ground-switch"
      className={styles.ground}
      onClick={toggle}
      aria-label={
        lit ? "Ground light, switch to dark" : "Ground dark, switch to light"
      }
    >
      <span className={styles.groundTrack} data-ground={theme}>
        {/* The cap, and it is FIRST in the markup on purpose: it sits
            under both glyphs, which is what lets the live glyph be page
            ink on page paint and the dead one be panel ink on panel,
            with neither drawn twice. Decorative, because everything it
            says is said by the word beside it and by the name on the
            button.

            IT CARRIES data-cap AND scripts/proof-ground.mjs FINDS IT BY
            THAT NAME. The proof used to take the track's last child,
            which was true only while the cap happened to be last in the
            markup, and this change moved it first. A hook a proof
            depends on is part of the component, so it is written down
            rather than inferred from an ordering. */}
        <span className={styles.groundCap} data-cap="" aria-hidden="true" />
        <span className={styles.groundEnd} data-end="dark">
          <svg
            viewBox="0 0 16 16"
            width="14"
            height="14"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M8 1a7 7 0 1 0 7 7 5.5 5.5 0 0 1-7-7Z" fill="currentColor" />
          </svg>
        </span>
        <span className={styles.groundEnd} data-end="light">
          <svg
            viewBox="0 0 16 16"
            width="14"
            height="14"
            aria-hidden="true"
            focusable="false"
          >
            <circle cx="8" cy="8" r="3.1" fill="currentColor" />
            <g
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            >
              <path d="M8 .9v1.7M8 13.4v1.7M.9 8h1.7M13.4 8h1.7M3 3l1.2 1.2M11.8 11.8 13 13M13 3l-1.2 1.2M4.2 11.8 3 13" />
            </g>
          </svg>
        </span>
      </span>
      {/*
        The word is the switch's readout and it is the current ground, not
        the destination, because it belongs to the cap rather than to the
        press. Its box is reserved for the longer of the two words: a
        control that changes width under the finger that just pressed it
        shifts the whole strip to the right of it.
      */}
      <span className={styles.groundWord}>{lit ? "Light" : "Dark"}</span>
    </button>
  );
}

export interface MegaNavProps {
  /** Whether the rail drawer is open. Narrow layouts only. */
  navOpen: boolean;
  /** Opens or shuts that drawer. Owned by the shell. */
  onToggleNav: () => void;
  /** The shell holds this so it can send focus home when the drawer shuts. */
  burgerRef: RefObject<HTMLButtonElement>;
  /** The id of the drawer, for aria-controls. */
  drawerId: string;
}

export function MegaNav({
  navOpen,
  onToggleNav,
  burgerRef,
  drawerId,
}: MegaNavProps) {
  const pipeline = usePipeline();
  const { counts } = useShellFigures();
  const { pathname } = useLocation();

  /* The same fraction the rail's mark draws, so the two marks on screen
     at once cannot show different fills. */
  const worked = PROSPECTS.length - unworkedCount(pipeline);
  const fill = PROSPECTS.length > 0 ? worked / PROSPECTS.length : 0;
  const workedPct = Math.round(fill * 100);

  /* The featured key's figure, out of the same record every other figure
     on this strip comes from, keyed by the route it links to. */
  const mapped = counts[FEATURED_KEY.to]?.value ?? PROSPECTS.length;
  const markLabel =
    `The Opening Book. The dial and the pin both show how far the trade ` +
    `area has been worked: ${worked} of ${PROSPECTS.length} organisations ` +
    `worked so far, ${workedPct} per cent.`;

  return (
    <div className={styles.bar}>
      {/*
        THE HAMBURGER IS FIRST IN THE DOM AND FIRST ON THE BAR.
        It is the control that reaches the other thirteen screens, so a
        keyboard reader arriving at the top of the page meets it before
        the six shortcuts rather than after them. It is hidden on a wide
        screen because the rail it opens is already on the page there,
        and a button that opens something already open is a lie.
      */}
      <button
        type="button"
        ref={burgerRef}
        className={styles.burger}
        aria-expanded={navOpen}
        aria-controls={drawerId}
        onClick={onToggleNav}
      >
        <svg
          className={styles.burgerGlyph}
          viewBox="0 0 20 20"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          aria-hidden="true"
          focusable="false"
        >
          {navOpen ? (
            <>
              <path d="M5 5l10 10M15 5 5 15" />
            </>
          ) : (
            <>
              <path d="M3 5.5h14M3 10h14M3 14.5h14" />
            </>
          )}
        </svg>
        {/*
          The word is on screen, not only in an aria-label. An icon-only
          hamburger is the single most argued-about control in interface
          design and the argument only exists because the icon alone is
          ambiguous. Two letters more and it is not.
        */}
        <span className={styles.burgerLabel}>{navOpen ? "Close" : "Menu"}</span>
      </button>

      {/*
        THE MARK IS A SIBLING OF THE LINK, NOT ITS CHILD. A link computes
        its accessible name from its own aria-label first, so the
        sentence the mark carries about the fraction it draws would be
        swallowed if it sat inside one. Same arrangement as the rail.
      */}
      <div className={styles.brand}>
        <PinMark size={26} fill={fill} title={markLabel} />
        <Link
          to="/"
          className={styles.brandLink}
          aria-label="The Opening Book, go to the desk"
        >
          <span className={styles.brandText}>The Opening Book</span>
        </Link>
      </div>

      {/*
        THE SWITCH SITS ON THE HOUSING, NOT AMONG THE DESTINATIONS.

        It is beside the lockup rather than out at the right hand end, and
        that is two decisions rather than one.

        It is OUTSIDE the nav landmark because it goes nowhere. A reader
        listing the links on this strip should get seven destinations and
        not a control that repaints the page, and a reader tabbing through
        should meet it before the queue, once, next to the mark.

        And it is on the LEFT because the space is already there. The
        strip pushes its destinations to the right, so between the lockup
        and the first key there is dead width at every size above about
        1100 and the switch costs the queue nothing to stand in it. Put it
        past the Maps plate instead and it takes its hundred pixels off
        the right hand end, where every key on the strip is already
        queueing for room, and it stands next to the one control on the
        strip that is deliberately the loudest thing on it.
      */}
      <GroundSwitch />

      <nav className={styles.nav} aria-label="The screens used every day">
        {/* Modes first, then what is waiting. The divider is drawn by
            the slot rather than by a character, for the same reason the
            featured key's is. */}
        <div className={styles.modes} role="group" aria-label="Mode">
          {(() => {
            const here = normalisePath(pathname);
            const inRationale = isRationalePath(here);
            const pair = [
              { label: "Console", to: toConsole(here), current: !inRationale },
              { label: "Rationale", to: toRationale(toConsole(here)), current: inRationale },
            ];
            return pair.map((m) => (
              <NavLink
                key={m.label}
                to={m.to}
                /* Whether a mode is current is decided above, not by
                   prefix matching. to="/" matches every path in this
                   application, so without this Console would light up
                   while standing on a Rationale screen. */
                end
                className={[styles.mode, m.current ? styles.modeCurrent : ""]
                  .filter(Boolean)
                  .join(" ")}
                aria-current={m.current ? "page" : undefined}
              >
                {m.label}
              </NavLink>
            ));
          })()}
        </div>
        <ul className={styles.list}>
          {ITEMS.map((item) => {
            const count = counts[item.to];
            /* The same test NavLink runs, computed here as well because
               the readout has to be told whether it is the lead figure
               and the className callback cannot reach it. Exact
               everywhere except leagues, which has a child route. */
            const active =
              item.to === "/leagues"
                ? pathname === item.to || pathname.startsWith("/leagues/")
                : pathname === item.to;
            return (
              <li
                key={item.to}
                className={styles.row}
                data-rank={item.rank}
                /*
                  THE SECTION IS DECLARED ON THE ROW, NOT ON THE STRIP.
                  Six items, six identities, all on screen at once, and
                  the strip itself is standing in a seventh. Setting the
                  attribute here lets each item wear the colour of where
                  it LEADS while the shell root behind it still says
                  where the reader IS, out of the same twenty rules. See
                  sections.ts.
                */
                data-sec={item.sec}
              >
                <NavLink
                  to={item.to}
                  /* Exact everywhere except leagues, which is the one
                     destination on this strip with a child route under
                     it. A reader inside one league has not left the
                     leagues section and the strip should say so. */
                  end={item.to !== "/leagues"}
                  className={({ isActive }) =>
                    [styles.item, isActive ? styles.itemActive : ""]
                      .filter(Boolean)
                      .join(" ")
                  }
                >
                  <SectionMark section={item.sec} size={20} />
                  <span className={styles.label}>{item.label}</span>
                  {/*
                    A readout rather than a number in brackets. Reserved
                    width on the mono face, so a figure going from 9 to
                    104 moves nothing on the bar, and a tick when it
                    moves at all. These numbers change while a person is
                    looking at them.
                  */}
                  {count ? (
                    <Readout
                      value={count.value}
                      unit={count.unit}
                      lead={active}
                    />
                  ) : null}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/*
          THE FEATURED KEY, AND IT IS NOT THE SEVENTH ITEM OF THAT LIST.
          It sits outside the list because it is outside the set: the six
          are queues counted in work waiting, this one is a place counted
          in territory. A reader running an eye along six figures looking
          for the biggest is asking a question the trade area board does
          not answer, so putting it in the row would have made its 211 a
          wrong answer to the right question. The divider and the gap are
          drawn by the slot, and everything else about how it is set
          apart is at the top of this file.

          IT HAS NO RESTING ACTIVE STATE AND IT CANNOT HAVE ONE. Pressing
          it removes this strip from the document, which is the exact
          property that disqualified it as a queue key. The NavLink is
          still a NavLink rather than a Link, because the router owns the
          question of whether a destination is current and a component
          that answered it locally would be wrong the day the board stops
          taking the whole screen.
        */}
        <div
          className={styles.featureSlot}
          data-sec={FEATURED_KEY.sec}
          data-featured="key"
        >
          <NavLink to={FEATURED_KEY.to} className={styles.feature}>
            <SectionMark section={FEATURED_KEY.sec} size={22} />
            <span className={styles.featureLabel}>{FEATURED_KEY.label}</span>{" "}
            {/*
              Spelled out rather than dropped into a readout well, which
              is the instrument the six queue keys use and the one thing
              on this strip that means "work waiting". 211 on its own
              beside the word Maps reads as a backlog. With the noun on
              it, it reads as the size of the territory behind the door,
              which is what it is.
            */}
            <span className={styles.featureFigure}>
              <span className="num">{mapped}</span> {FEATURED_KEY.figureUnit}
            </span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
