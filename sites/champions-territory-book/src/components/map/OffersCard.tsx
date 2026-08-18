import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { Lane } from "@/domain/types";
import { LANE_META, LANE_ORDER } from "@/domain/lanes";
import { LaneChip } from "@/components/primitives/LaneChip";
import { Figure } from "@/components/primitives/ProvenanceBadge";
import { OFFERS, PERIODS, daysToOfferExpiry } from "@/data/venue";
import { BOARD_DAY } from "@/state/ScenarioProvider";
import {
  enumKey,
  isRecord,
  signatureOf,
  usePersistedReducer,
  type SliceCodec,
} from "@/state/persist";
import styles from "./OffersCard.module.css";

/**
 * What the five brands are actually offering, one card at a time.
 *
 * WHY THIS CARD EXISTS AND WHY IT IS NOT A DISCOUNT PANEL. None of the
 * five West Division brands publishes a list price for anything, so
 * every figure on this card is the price of a job rather than a
 * reduction from a price somebody could check. There is nothing to mark
 * down. What there is instead is a published number, a published expiry
 * or the conspicuous absence of one, and the fine print that goes with
 * them, and that is what a division marketer has to hold in their head
 * across five sites in five different templates.
 *
 * So the card carries four things per offer: what is published, why it
 * matters this month, what it costs the brand as far as anything
 * published allows, and which lanes this console proposes it for. The
 * last of those is the only judgement on the card and it is badged as
 * one.
 *
 * ── THE COUNTDOWN IS DAYS TO OFFER EXPIRY ─────────────────────────
 * There is exactly one date in this whole research with a number on it:
 * 8/31/2026, printed in the Service Champions summer fine print and
 * again on Adeedo's seasonal page. Everything else is undated. So the
 * countdown runs against that date and against nothing else, and when it
 * reaches zero it says so rather than reaching for a second date nobody
 * has published. The bar fills as the runway is spent.
 *
 * The note under it carries the part that matters more than the number:
 * NO SUCCESSOR CAMPAIGN IS PUBLISHED. On 1 September two of the five
 * brands have nothing in market, the heating pre-season has to launch in
 * September and October, and building that campaign is the work this
 * date is pointing at.
 *
 * ── THE PUBLISHED FIGURE IS PRINTED, NOT SUMMARISED ───────────────
 * Every card shows the brand's own number. A panel that rounds 3,500 to
 * "thousands off" or hides a 0 dollar check behind the word "free" has
 * thrown away the only thing on it that can be checked in fifteen
 * seconds against the brand's own site.
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
  /**
   * Days of published offer runway left in the selected period, from
   * `PERIOD_BY_ID[pipeline.periodId]`. Zero after 31 August 2026,
   * because nothing is published after it. Drives the countdown.
   */
  weeksToOpen: number;
  /** Lanes currently filtered, so the card can say when an offer does not apply. */
  laneFilter: Lane[];
  /**
   * Something the reader opened is using this corner of the map. See the
   * long note beside `yielding` in the body.
   */
  yieldToOverlay?: boolean;
}

/* The most runway any period in the campaign calendar has. Read from
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
  /* One date, one clock, and the figure is the subtraction. The rail
     computes the same two values from the same two constants, which is
     the point: they cannot disagree. data/venue.ts has the argument. */
  const daysLeft = daysToOfferExpiry(BOARD_DAY);
  const daysPast = -daysLeft;
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

  /* The bar fills as the runway is spent. Past the date it is full,
     which is the honest picture: there is nothing left to spend. */
  const elapsed =
    MAX_WEEKS_TO_OPEN > 0 ? 1 - weeksToOpen / MAX_WEEKS_TO_OPEN : 1;
  const barPercent =
    daysLeft <= 0 ? 100 : Math.round(Math.min(1, Math.max(0, elapsed)) * 100);

  /* Singular, plural and none, spelled out rather than left to a bare
     numeral with an "s" bolted on. None is the state three of the four
     periods are in, and it has to read as a finding rather than as a
     missing value. */
  const runwayValue =
    daysLeft > 1
      ? `${daysLeft} days`
      : daysLeft === 1
        ? "1 day"
        : daysLeft === 0
          ? "Today"
          : daysPast === 1
            ? "1 day past"
            : `${daysPast} days past`;

  const costValue =
    offer.costToVenue === 0
      ? "0 dollars"
      : `${offer.costToVenue.toLocaleString("en-GB")} dollars`;

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
        title="Show what the five brands are offering right now"
      >
        <span className={styles.restoreGlyph} aria-hidden="true">
          ◆
        </span>
        <span className={styles.restoreWord}>Offers</span>
        <span className="visually-hidden">
          . Reopens what is published, {count} live brand offers.
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
            What the brands are offering
          </span>
          <span className={`${styles.headPosition} num`}>
            {safe + 1} of {count}
          </span>
        </button>

        <button
          type="button"
          ref={closeRef}
          className={styles.headClose}
          aria-label="Close what the brands are offering"
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
          <span className={styles.countdownLabel}>
            {daysLeft > 0 ? "Days to offer expiry" : "Days past offer expiry"}
          </span>
          <span className={styles.countdownFigure}>
            <Figure value={runwayValue} provenance="public" compact />
          </span>
          <span className={styles.track} aria-hidden="true">
            <span className={styles.bar} style={{ width: `${barPercent}%` }} />
          </span>
          <span className={styles.countdownNote}>
            {daysLeft > 0
              ? "The Service Champions and Adeedo campaigns both carry 31 August 2026 in their fine print. This is the runway left, counted from this board's day to that date."
              : "The Service Champions and Adeedo campaigns both carried 31 August 2026 in their fine print, and when both sites were read on 18 August 2026 there was nothing published to follow them. This board's day is later than that date, so the figure counts up rather than down. Building the heating pre-season for a September and October launch is the work it points at."}
          </span>
        </div>

        <dl className={styles.figures}>
          <div className={styles.figureCell}>
            <dt>Published figure</dt>
            <dd>
              <Figure value={costValue} provenance={offer.provenance} compact />
            </dd>
          </div>
          <div className={styles.figureCell}>
            <dt>Service lines it applies to</dt>
            <dd>
              {/*
                Eligibility is this console's proposal in every case. What
                each brand publishes is a price and a date, never a list of
                the lanes it wants that price used on, so the count carries
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

        <h4 className={styles.subhead}>What is published</h4>
        <p className={styles.prose}>{offer.what}</p>

        <h4 className={styles.subhead}>Why it matters this month</h4>
        <p className={styles.prose}>{offer.rationale}</p>

        <p className={styles.costNote}>{offer.costNote}</p>

        <p className={styles.compliance}>
          Every figure and every date on this card is the brand's own,
          published on its own site and read on 18 August 2026. What belongs
          to this console is the grouping, the lanes each offer is proposed
          for, and the countdown. No card here is a discount off a list
          price, because not one of these brands publishes a list price to
          discount from.
        </p>
      </div>
    </section>
  );
}
