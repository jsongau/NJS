import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { Lane } from "@/domain/types";
import { LANE_META, LANE_ORDER } from "@/domain/lanes";
import { LaneChip } from "@/components/primitives/LaneChip";
import { Figure } from "@/components/primitives/ProvenanceBadge";
import { OFFERS } from "@/data/venue";
import {
  enumKey,
  isRecord,
  signatureOf,
  usePersistedReducer,
  type SliceCodec,
} from "@/state/persist";
import styles from "./OffersCard.module.css";

/**
 * What a rep can actually put on the table today, one offer at a time.
 *
 * WHY THIS CARD EXISTS AND WHY IT IS NOT A DISCOUNT PANEL. Round1
 * publishes the contents of one party package and prints no price for it,
 * publishes no lane count for any location in the country, and publishes
 * no minimum spend. Its booking page says to contact the venue. So there
 * is nothing to mark down, because nothing has a published price to mark
 * down from. The obvious move is to invent a figure and put a percentage
 * off it, and the whole credibility of this prototype rests on not doing
 * that.
 *
 * So the currency here is CERTAINTY rather than money. What Round1 states
 * in public can be quoted to a buyer today without anybody's approval:
 * what is in the All Inclusive Party, and how much notice a change to a
 * booking needs. What cannot be quoted is the price, and saying that
 * plainly is stronger than a range, because a reader can check both
 * halves of the sentence on round1usa.com in fifteen seconds. That
 * argument is the card, so the card says it out loud rather than burying
 * it under a headline figure.
 *
 * ── THERE IS NO COUNTDOWN ON THIS CARD, AND THAT IS THE POINT ─────
 * The screen this card is modelled on runs a green days-left countdown
 * against a campaign end date, and the fork ran a countdown of weeks
 * until a venue opened. Both are gone. Round1 publishes no deadline, and
 * the Cerritos office is open for business, so a clock here would be
 * either a date invented outright or urgency read out of an empty field.
 * Either would be the single dishonest thing on the page and would undo
 * every provenance badge around it. The periods in `data/venue.ts` are
 * ordinary forward quarters and this card never renders a date.
 *
 * ── ZERO IS PRINTED, NOT HIDDEN ───────────────────────────────────
 * Both offers cost the venue nothing, and the row that says so is the
 * most persuasive row on the card. A panel that hides an empty cost has
 * thrown away its own argument to save a line of space.
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
  /** Lanes currently filtered, so the card can say when an offer does not apply. */
  laneFilter: Lane[];
  /**
   * Something the reader opened is using this corner of the map. See the
   * long note beside `yielding` in the body.
   */
  yieldToOverlay?: boolean;
}

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
        title="Show what you can put on the table"
      >
        <span className={styles.restoreGlyph} aria-hidden="true">
          ◆
        </span>
        <span className={styles.restoreWord}>Offers</span>
        <span className="visually-hidden">
          . Reopens what you can put on the table, {count} offers.
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
                Eligibility is this prototype's proposal in every case. What
                Round1 publishes is what an offer contains, never which kinds
                of organisation it is offered to, so the count carries
                `illustrative` rather than the offer's own badge.
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

        <h4 className={styles.subhead}>Why it is credible</h4>
        <p className={styles.prose}>{offer.rationale}</p>

        <p className={styles.costNote}>{offer.costNote}</p>

        <p className={styles.compliance}>
          Every offer here quotes something Round1 states on its own pages and
          concedes nothing that it does not. None of them is a discount, and
          none of them could be: you cannot discount a price that has never
          been published.
        </p>
      </div>
    </section>
  );
}
