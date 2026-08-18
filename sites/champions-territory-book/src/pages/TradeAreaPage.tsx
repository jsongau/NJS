import { Link } from "react-router-dom";
import { RATIONALE_AVAILABLE } from "@/data/rationale";
import { FullBleedRoute, useFullBleedExit } from "@/app/AppShell";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { MapBoard } from "@/components/map/MapBoard";
import styles from "./TradeAreaPage.module.css";

/**
 * MAPS. Where the organisations actually are, and what each of them
 * costs.
 *
 * The screen is called Maps in the rail, on the mega nav, in the
 * breadcrumb and in its own chrome band, because that is the word the
 * person using it reaches for. THE ROUTE IS STILL /map AND MUST STAY
 * /map: the deployed URL names it, every deep link into the board is
 * /map?prospect=<id>, and scripts/emit-route-stubs.mjs writes a static
 * stub per path for a zero-build host. Renaming a path to match a label
 * is how a work sample link 404s in front of the one reader it exists
 * for. The trade area is still what the map is OF, and the prose below
 * keeps the term where it means the territory rather than the screen.
 *
 * This screen is the evidence under the desk, and it exists to answer one
 * question the desk cannot: how much of the week does each of these cost?
 * A published email address costs two minutes wherever the organisation
 * sits. A front desk and no inbox costs a drive, and whether that drive is
 * twenty minutes or an afternoon is a property of the map rather than of
 * the prospect. So the map is not decoration here; it is the input to the
 * only genuinely scarce resource a division marketer has, which is hours
 * outside the office.
 *
 * ── IT IS A TAKEOVER, AND THAT IS THE WHOLE CHANGE ────────────────
 * Every other screen in this application is a document in a column beside
 * a rail. This one is a working surface, and it was being asked to be both
 * at once. The arithmetic of that was plain enough to measure: the rail
 * took 252 pixels, the page header another 105, and what was left for a
 * list of three hundred and twenty nine organisations, a map and a panel was a
 * strip.
 * Three panes in a column that is already 252 pixels short is not three
 * panes; it is three things that do not fit.
 *
 * So the route renders `FullBleedRoute` and the shell reacts by unmounting
 * the rail entirely. Not hiding it, not collapsing it: a zero width track
 * or a hidden column leaves a strip of screen that looks like the page and
 * belongs to something else. The reasoning for the direction of that
 * dependency, route tells shell rather than shell recognising route, is
 * written out in AppShell.tsx and is worth reading before anything else on
 * this page is changed.
 *
 * A takeover has to be leavable, and it has to be leavable by every reader
 * rather than by the ones who know about Escape. `useFullBleedExit` is
 * bound to both here: to the Back control the board draws in its chrome
 * band, and to the Escape key the shell binds on the document. They call
 * the same function, so they cannot drift, and it restores the screen the
 * reader came from, that screen's scroll offset, and the control they left
 * focus on.
 *
 * ── THE PAGE IS THIN AND THAT IS THE DESIGN ───────────────────────
 * Everything below the chrome band is `MapBoard`, which owns the three
 * panes, every piece of state a reader can change and the one email modal.
 * This file sets the voice, supplies the prose, wires the way out, and
 * gets out of the way. The alternative, a page holding the state and
 * passing twenty props down, was what the first version of this screen
 * did, and it meant the board could not be read without reading the page
 * and the page could not be read at all.
 *
 * ── WHERE THE ARGUMENT ABOUT THE RINGS WENT ───────────────────────
 * It used to sit in a header band above the board, and it was four hundred
 * words of it. On a takeover those are four hundred words of map. It is
 * not cut, because it is the one thing on this page that stops a reader
 * planning a morning with four visits in it that only holds two. It is
 * behind the disclosure below, which sits in the chrome band, costs a
 * single control's width when it is shut, and opens as a panel over the
 * board rather than pushing the board down. A `details` element is the
 * honest control for that: real, keyboard reachable without a line of
 * JavaScript, and it says what is inside it on the summary rather than
 * behind an icon.
 *
 * ── THE ANCHOR MARK SAYS THE THING THE WHOLE BOARD IS ABOUT ───────
 * The mark at 625 Columbia Street is a DASHED ring with the words "Our
 * address" under it. Every other pin on this screen is somebody else's:
 * a rival, a partner surface, an organisation nobody at the division has
 * spoken to. A solid pin in the middle would say "here is one more
 * business" and file the brand's own branch as the two hundred and
 * twelfth row on its own board. The dashed ring was chosen to keep the
 * anchor out of the pipeline, and that reasoning did not change when the
 * words under it did.
 *
 * ── ONE FILTER, TWO SCREENS ───────────────────────────────────────
 * The lane chips in the left pane write to PipelineProvider, which is the
 * same state the desk reads. Filter to drains here and the desk is
 * filtered to drains when the reader gets back to it, because a filter
 * that only applies to the screen you set it on is a filter that makes two
 * screens disagree about what the week contains.
 */

/**
 * The month the board scores against, injected rather than read from the
 * clock so that a screenshot of this page is reproducible. Seven is
 * August, which is when the research behind this data set was done.
 */
const NOW_MONTH = 7;

export function TradeAreaPage() {
  /*
    The one way out, shared with the Escape key the shell binds. It is
    read here, in the component that renders the surface, and handed down
    as an ordinary prop, so the board never has to know that a shell
    exists or that this route is a takeover at all.
  */
  const exit = useFullBleedExit();

  return (
    <FullBleedRoute label="Maps, the Brea trade area board">
      <MapBoard
        nowMonth={NOW_MONTH}
        screenName="Maps"
        screenNote="Stage two of five. Every organisation in the book, plotted from its own published coordinates."
        onExit={exit}
        /*
          THE ONE SCREEN THAT HAS TO CARRY ITS OWN MODE SWITCH.

          Rationale is a mode rather than a page: every screen is
          explained at its own address with a prefix, and the switch to
          it lives on the mega nav. This route unmounts the mega nav
          along with the rail, so without this control Maps would be the
          only screen in the application whose explanation cannot be
          reached from it.

          There is no path translation here, unlike on the bar. Only the
          console side of Maps is a takeover; /rationale/map is an
          ordinary railed document, so the traffic is one way and a
          general purpose switch would be machinery for a case that
          cannot occur.
        */
        modeLink={
          /* Dropped entirely while the second reading is closed. The
             prop is optional, so the takeover simply has one control
             fewer rather than an empty slot with a gap where a link
             used to be. */
          RATIONALE_AVAILABLE ? (
            <Link className={styles.modeLink} to="/rationale/map">
              Rationale
            </Link>
          ) : undefined
        }
        note={
          <details className={styles.rings}>
            {/*
              Two labels, both in the markup, and CSS chooses. The long one
              is the sentence a reader deserves; the short one is what fits
              beside a Back control and a list toggle on a handset. It is
              the idiom the figure strip already uses for its segment
              control, and it is deliberately not a visually hidden span:
              a clipped element inside a band that scrolls is how this
              screen grew a horizontal scrollbar once already.
            */}
            <summary className={styles.ringsSummary}>
              <span aria-hidden="true">◌</span>
              <span className={styles.ringsLong}>
                Why this map, and why the rings are straight lines
              </span>
              <span className={styles.ringsShort}>Why this map</span>
            </summary>
            <div className={styles.ringsBody}>
              <p>
                Every organisation in the book is plotted from its own
                published coordinates. The mark in the middle is the
                division's own branch at 625 Columbia Street, and nothing else
                on this map is a customer.
              </p>
              <p>
                What the map decides is cost. An organisation that publishes an
                email address costs two minutes wherever it sits, and one with
                a front desk and no inbox costs a drive. Whether that drive is
                twenty minutes or an afternoon is a property of the map rather
                than of the prospect, and hours outside the office are the only
                genuinely scarce resource a division marketer has.
              </p>
              <p>
                The three circles are great-circle distances from the published
                street address. They are not isochrones and they are not drive
                times, and the difference is the whole reason this note exists.
                Two organisations the same distance from the branch can cost
                very different amounts of a morning. One sits on a road that
                runs straight back to Columbia Street; the other is the same
                distance away with a freeway, a rail line or a hillside between
                the two, and it is a twenty minute detour to the nearest
                crossing. A circle cannot see any of that.
              </p>
              <p>
                So the rings are used for what they are honestly good at, which
                is sorting the trade area into work that fits in a gap, work
                that fits in a morning and work that needs a half day booked
                for it. The moment they are treated as travel times, a day gets
                planned with four visits in it that only holds two.
              </p>
              <p className={styles.ringsProv}>
                <ProvenanceBadge provenance="modeled" />
                <span>
                  Haversine distance between two published coordinate pairs.
                  The coordinates are public; the arithmetic is this app's, and
                  it is shown in full on the method page.
                </span>
              </p>
            </div>
          </details>
        }
      />
    </FullBleedRoute>
  );
}
