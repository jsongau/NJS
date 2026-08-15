import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { Lane } from "@/domain/types";
import { LANE_META, LANE_ORDER } from "@/domain/lanes";
import { LaneChip } from "@/components/primitives/LaneChip";
import { Figure } from "@/components/primitives/ProvenanceBadge";
import { OFFERS, PERIODS } from "@/data/venue";
import {
  enumKey,
  isRecord,
  signatureOf,
  usePersistedReducer,
  type SliceCodec,
} from "@/state/persist";
import styles from "./OffersCard.module.css";

/**
 * What a sales manager can actually put on the table before the doors
 * open, one offer at a time.
 *
 * WHY THIS CARD EXISTS AND WHY IT IS NOT A DISCOUNT PANEL. Main Event
 * publishes no price for any corporate or group package, and it has
 * published no opening date for Brea. Between those two facts sits the
 * entire pre-opening problem: there is nothing to mark down, because
 * nothing has a published price to mark down from, and there is no date
 * to sell against. The obvious move is to invent one of the two, and the
 * whole credibility of this prototype rests on not doing it.
 *
 * So the currency here is PRIORITY and CERTAINTY rather than money. First
 * pick of opening month dates, a position held in a queue that does not
 * exist yet, a walk of a building nobody else has walked, a rate agreed
 * before there is a rate. Every one of those costs the venue nothing while
 * the calendar is empty and is worth the most it will ever be worth
 * precisely because the calendar is empty. That argument is the card, so
 * the card says it out loud rather than burying it under a headline
 * figure.
 *
 * ── THE COUNTDOWN IS WEEKS TO OPEN, NOT DAYS TO A DEADLINE ────────
 * The screen this card is modelled on runs a green days-left countdown
 * against a campaign end date. Copying that here would mean printing a
 * deadline Main Event has never published, which would be the single
 * dishonest thing on the page and would undo every provenance badge
 * around it. What is honest, and just as useful for planning, is the
 * distance to open in weeks, which is how the pre-opening calendar in
 * `data/venue.ts` is counted in the first place. It carries the
 * illustrative badge that `PERIODS` carries, and this card never renders
 * a date.
 *
 * ── ZERO IS PRINTED, NOT HIDDEN ───────────────────────────────────
 * Three of the four offers cost the venue nothing, and the row that says
 * so is the most persuasive row on the card. A panel that hides an empty
 * cost has thrown away its own argument to save a line of space.
 *
 * ── THREE STATES, BECAUSE THE OWNER ASKED FOR TWO OF THEM ─────────
 * "I need to be able to close and minimise what you can put on the
 * table." Both, and they are different requests, so they are different
 * controls rather than one control that means two things.
 *
 * MINIMISED keeps the card in its corner as a single header row. It still
 * names itself and still says which of the four offers is showing, so a
 * reader who wanted the map back has not lost the thing they collapsed.
 *
 * CLOSED takes the card off the map. What replaces it is a 44 pixel chip
 * carrying a glyph and the word "Offers", because a panel with no way
 * back is not closed, it is deleted, and the reader who closed it while
 * reading a pin will want it again at the next one. The chip is small
 * enough to cost the map nothing and named well enough to be found
 * without hunting.
 *
 * Both choices are written through `state/persist.ts`, on the same
 * mechanism as every other thing this application remembers. A preference
 * that a reader has to set again on every visit is not a preference, and a
 * second storage layer beside the one that already exists is two places
 * for a key to drift.
 *
 * ── IT YIELDS TO A POPUP RATHER THAN COMPETING WITH ONE ───────────
 * See the note above `yielding` below. Short version: a popup is the
 * direct answer to a press the reader just made, this card is standing
 * argument, and standing argument gets out of the way.
 */

/** The three positions the card can be in. */
export type OffersView = "open" | "minimised" | "closed";

/**
 * The lookup that both names the states and validates a stored one.
 *
 * `enumKey` in the persistence layer checks an untrusted string against a
 * table rather than against a list of literals, so the table is the
 * definition and there is no second copy of these three words to fall out
 * of step with it.
 */
const VIEW_META: Record<OffersView, { label: string }> = {
  open: { label: "open" },
  minimised: { label: "minimised" },
  closed: { label: "closed" },
};

interface OffersViewState {
  /**
   * Null means the reader has never chosen, and the card falls back to
   * the width it is being drawn at. Storing null rather than the
   * viewport's answer is what stops a reader who opened the map once on a
   * phone from finding the card collapsed on their desk forever.
   */
  view: OffersView | null;
}

type OffersViewAction = { type: "SET_VIEW"; view: OffersView };

function offersViewReducer(
  _state: OffersViewState,
  action: OffersViewAction,
): OffersViewState {
  return { view: action.view };
}

const OFFERS_VIEW_SEED: OffersViewState = { view: null };

/**
 * The persistence contract for this one preference.
 *
 * THE SIGNATURE IS A CONSTANT AND THAT IS DELIBERATE. Every other slice
 * in this application hashes the seed data it was computed against, so
 * that a data release drops edits made against figures that have since
 * changed. This slice holds no data. It holds whether a reader wanted a
 * panel on their screen, which stays true whatever happens to the four
 * offers inside it, so hashing `OFFERS` here would throw away a
 * preference every time a word in an offer's rationale was corrected.
 */
const OFFERS_VIEW_CODEC: SliceCodec<OffersViewState> = {
  slice: "mapOffers",
  signature: signatureOf("map-offers-card", 1),
  encode: (state) => (state.view === null ? null : { view: state.view }),
  decode: (raw, seed) => {
    if (!isRecord(raw)) return seed;
    const view = enumKey(raw.view, VIEW_META);
    return view === null ? seed : { view };
  },
};

export interface OffersCardProps {
  index: number;
  onIndexChange: (index: number) => void;
  /** From `PERIOD_BY_ID[pipeline.periodId]`. Drives the countdown. */
  weeksToOpen: number;
  /** Lanes currently filtered, so the card can say when an offer does not apply. */
  laneFilter: Lane[];
  /**
   * Something the reader opened is using this corner of the map. See the
   * long note beside `yielding` in the body.
   */
  yieldToOverlay?: boolean;
}

/* The furthest out any period in the pre-opening calendar sits. Read from
   PERIODS rather than written down, so the bar still means something if
   the calendar is ever re-cut. */
const MAX_WEEKS_TO_OPEN = Math.max(...PERIODS.map((p) => p.weeksToOpen));

/**
 * Where a reader who has never chosen starts.
 *
 * Open above 1024px, minimised below it, read once at mount. The card is
 * 320px of argument sitting over the map, which is right on a desk and
 * wrong on a handset, and the header alone still says what is underneath
 * it. Watched rather than read once would mean a card that reopens itself
 * because somebody resized a window, which overrides a decision the
 * reader already made.
 */
function defaultView(): OffersView {
  if (typeof window === "undefined" || !window.matchMedia) return "open";
  return window.matchMedia("(min-width: 1024px)").matches
    ? "open"
    : "minimised";
}

export function OffersCard({
  index,
  onIndexChange,
  weeksToOpen,
  laneFilter,
  yieldToOverlay = false,
}: OffersCardProps) {
  const bodyId = useId();

  const [stored, dispatch] = usePersistedReducer(
    offersViewReducer,
    OFFERS_VIEW_SEED,
    OFFERS_VIEW_CODEC,
  );
  const [fallback] = useState(defaultView);
  const view = stored.view ?? fallback;

  const setView = useCallback(
    (next: OffersView) => dispatch({ type: "SET_VIEW", view: next }),
    [dispatch],
  );

  /*
    FOCUS FOLLOWS THE CONTROL THAT REPLACED THE ONE IT WAS ON.

    Closing the card removes the button the press came from, and a browser
    left to itself drops focus to the document body, which puts a keyboard
    reader back at the top of the page for the crime of tidying their map.
    So closing sends focus to the chip that brings it back, and reopening
    sends it to the close control, which is the same position in the same
    corner. Neither runs on the first paint, because moving focus at load
    is how a screen reader gets dropped past the page heading.
  */
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLButtonElement>(null);
  const previousView = useRef(view);
  useEffect(() => {
    const was = previousView.current;
    if (was === view) return;
    previousView.current = view;
    if (view === "closed") restoreRef.current?.focus();
    else if (was === "closed") closeRef.current?.focus();
  }, [view]);

  const count = OFFERS.length;
  /* Defensive rather than decorative: the board owns the index, and a
     wrapped or stale value must not blank the card. */
  const safe = ((index % count) + count) % count;
  const offer = OFFERS[safe];
  const prev = (safe - 1 + count) % count;
  const next = (safe + 1) % count;

  const elapsed = 1 - weeksToOpen / MAX_WEEKS_TO_OPEN;
  const barPercent = Math.round(Math.min(1, Math.max(0, elapsed)) * 100);

  const costValue =
    offer.costToVenue === 0 ? "Zero" : `${offer.costToVenue}% of sales`;

  const appliesHere =
    laneFilter.length === 0 ||
    offer.eligibleLanes.some((lane) => laneFilter.includes(lane));

  const open = view === "open";

  /*
    ── WHY THIS CARD DISAPPEARS INSTEAD OF DIMMING ───────────────────

    The map column is 320px of offers card pinned to the bottom left and,
    on the two narrowest three pane widths, a marker popup that Leaflet
    has nowhere left to pan to. The two were reported overlapping, and a
    popup that has an argument printed across it is worse than either of
    them alone.

    Three fixes were possible. Raising the popup above the card cannot
    work: `tokens.css` pins every Leaflet pane to one z-index with an
    `!important`, so the popup pane is trapped inside that stacking
    context and our overlay is a later sibling at the same number. Fading
    the card to a low opacity leaves it in the layout, which means it
    still takes the pixels, still catches a click aimed at the popup, and
    still prints grey words through a white card, and it fails the only
    test that matters, which is that the two boxes must not intersect at
    any width.

    So the card yields the corner entirely for as long as something the
    reader deliberately opened is using it. It is `display: none` rather
    than unmounted, so the state above survives untouched, the offer
    index does not reset, and the card is back in the same position the
    instant the popup closes. A popup is the direct answer to a press
    somebody just made. This card is a standing argument that has been in
    the corner since the page loaded. When the two want the same pixels
    the answer is not a compromise.
  */
  const yielding = yieldToOverlay && view !== "closed";

  if (view === "closed") {
    return (
      <button
        type="button"
        ref={restoreRef}
        className={styles.restore}
        data-offers-restore="yes"
        onClick={() => setView("open")}
        title="Show what you can put on the table before the doors open"
      >
        <span className={styles.restoreGlyph} aria-hidden="true">
          ◆
        </span>
        <span className={styles.restoreWord}>Offers</span>
        <span className="visually-hidden">
          . Reopens what you can put on the table, {count} pre-opening offers.
        </span>
      </button>
    );
  }

  return (
    <section
      className={styles.card}
      data-open={open ? "yes" : "no"}
      data-yielding={yielding ? "yes" : "no"}
      data-offers-card="yes"
      aria-labelledby={`${bodyId}-title`}
    >
      <div className={styles.head}>
        {/*
          MINIMISE IS THE TITLE, CLOSE IS ITS OWN CONTROL. A single
          control that collapsed on one press and vanished on another
          would be a button whose meaning depends on how many times it
          has been pressed, which is a thing no reader can see.
        */}
        <button
          type="button"
          className={styles.headToggle}
          aria-expanded={open}
          aria-controls={bodyId}
          title={open ? "Minimise this card" : "Open this card"}
          onClick={() => setView(open ? "minimised" : "open")}
        >
          <span className={styles.headGlyph} aria-hidden="true">
            {open ? "▾" : "▸"}
          </span>
          <span id={`${bodyId}-title`} className={styles.headTitle}>
            What you can put on the table
          </span>
          <span className={`${styles.headPosition} num`}>
            {safe + 1} of {count}
          </span>
        </button>

        <button
          type="button"
          ref={closeRef}
          className={styles.headClose}
          aria-label="Close what you can put on the table"
          title="Close this card. A chip in the same corner brings it back."
          onClick={() => setView("closed")}
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>

      <div id={bodyId} className={styles.body} hidden={!open}>
        <div className={styles.nav}>
          <button
            type="button"
            className={styles.navBtn}
            aria-label={`Previous offer, ${OFFERS[prev].name}`}
            onClick={() => onIndexChange(prev)}
          >
            <span aria-hidden="true">‹</span>
          </button>
          <h3 className={styles.offerName}>{offer.name}</h3>
          <button
            type="button"
            className={styles.navBtn}
            aria-label={`Next offer, ${OFFERS[next].name}`}
            onClick={() => onIndexChange(next)}
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>

        {/* The one thing on this card that changes without a navigation. */}
        <p className="visually-hidden" aria-live="polite">
          Offer {safe + 1} of {count}. {offer.name}.
        </p>

        <div className={styles.countdown}>
          <span className={styles.countdownLabel}>Weeks to open</span>
          <span className={styles.countdownFigure}>
            <Figure
              value={`${weeksToOpen} weeks`}
              provenance="illustrative"
              compact
            />
          </span>
          <span className={styles.track} aria-hidden="true">
            <span className={styles.bar} style={{ width: `${barPercent}%` }} />
          </span>
          <span className={styles.countdownNote}>
            Main Event has published no opening date. This is the position of
            the selected period in the pre-opening calendar, counted backwards
            in weeks, which is how the outreach plan is run in the absence of a
            date.
          </span>
        </div>

        <dl className={styles.figures}>
          <div className={styles.figureCell}>
            <dt>Cost to the venue</dt>
            <dd>
              <Figure value={costValue} provenance={offer.provenance} compact />
            </dd>
          </div>
          <div className={styles.figureCell}>
            <dt>Lanes it applies to</dt>
            <dd>
              {/*
                Eligibility is this prototype's proposal in every case,
                including the Spirit Night row, whose published part is the
                20% and not the list of lanes it is offered to. So the count
                carries `illustrative` rather than the offer's own badge.
              */}
              <Figure
                value={`${offer.eligibleLanes.length} of ${LANE_ORDER.length}`}
                provenance="illustrative"
                compact
              />
            </dd>
          </div>
        </dl>

        <ul className={styles.laneChips}>
          {offer.eligibleLanes.map((lane) => (
            <li key={lane} title={LANE_META[lane].label}>
              <LaneChip lane={lane} size="sm" glyphOnly />
            </li>
          ))}
        </ul>

        {appliesHere ? null : (
          <p className={styles.mismatch}>
            <span className={styles.mismatchGlyph} aria-hidden="true">
              ⚠
            </span>
            Does not apply to the lanes you are looking at.
          </p>
        )}

        <h4 className={styles.subhead}>What we can hand over</h4>
        <p className={styles.prose}>{offer.what}</p>

        <h4 className={styles.subhead}>
          Why it is credible before the doors open
        </h4>
        <p className={styles.prose}>{offer.rationale}</p>

        <p className={styles.costNote}>{offer.costNote}</p>

        <p className={styles.compliance}>
          Only the Spirit Night terms are Main Event's own published figures.
          The rest are pre-opening positions this prototype proposes, and every
          one of them is priority or certainty rather than a discount. You
          cannot discount a price that has never been published.
        </p>
      </div>
    </section>
  );
}
