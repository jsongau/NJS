import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import type {
  DayPart,
  EventPackage,
  Lane,
  PackageFamily,
  Prospect,
} from "@/domain/types";
import {
  PACKAGES,
  PACKAGE_BY_ID,
  PRICED_PACKAGES,
  GATED_PACKAGES,
  STANDARD_TERMS,
  PACKAGE_FAMILY_ORDER,
} from "@/data/packages";
import { VENUE, NOT_PUBLISHED_BY_ROUND1 } from "@/data/venue";
import { PACKAGE_FAMILY } from "@/domain/vocabulary";
import { LANE_META, lanesForGuests, GUESTS_PER_BOWLING_LANE } from "@/domain/lanes";
import { usePipeline, usePipelineDispatch } from "@/state/PipelineProvider";
import {
  Figure,
  ProvenanceBadge,
  WithheldFigure,
} from "@/components/primitives/ProvenanceBadge";
import { FamilyChip } from "@/components/primitives/FamilyChip";
import { PackageGlyph } from "@/components/primitives/PackageGlyph";
import { LaneChip } from "@/components/primitives/LaneChip";
import { Button } from "@/components/primitives/Button";
import {
  EmailComposeModal,
  useComposeModal,
} from "@/components/email/EmailComposeModal";
import { PromoSendModal } from "@/components/package/PromoSendModal";
import styles from "./PackagesPage.module.css";

/**
 * EVERY PACKAGE ROUND1 PUBLISHES, AND THE SHAPE OF WHAT IT DOES NOT.
 *
 * ── THE HEADLINE OF THIS PAGE IS THE PATTERN IN THE NULLS ──────────
 * Round1 names one group product in public, the All Inclusive Party, and
 * itemises it in full: arcade time-play, bowling with shoe rental,
 * karaoke or a party room, billiards and ping pong, pizza and soda, a
 * group photo, and a VIP Immersive Lane that can be added at a separate
 * fee. Seven inclusions and one add-on, published on the page.
 *
 * It publishes no price for any of it. Not a per head figure, not a room
 * rate, not a minimum, not the add-on fee. The page ends by telling the
 * reader to contact the venue, and the party room page ends the same way
 * with no capacity, no hourly rate and no minimum spend on it either.
 *
 * THAT GAP IS THE JOB, and this page is the evidence for it, laid out so
 * a reader can check every claim against round1usa.com in about fifteen
 * seconds a row.
 *
 * ── WHY THIS IS NOT A PRICE LIST ───────────────────────────────────
 * There is no price to list. What somebody selling this actually needs
 * off this screen is everything Round1 publishes about a package it will
 * not price: what is in it, who it suits, when the company will let it
 * run, and what a headcount would consume of a building whose lane count
 * is also unpublished. Most of that is on the page in full, which means
 * a rep can walk into a school with everything except the number and
 * still run the whole conversation.
 *
 * The day-part block stays on the card even though Round1 fences
 * nothing, because the absence of a fence is itself a published fact and
 * a reader is entitled to see the field come back empty rather than
 * wonder whether anybody looked.
 *
 * ── WHAT THIS PAGE REFUSES TO DO ───────────────────────────────────
 * It never fills a null. A figure Round1 withholds renders as the
 * withheld sentence and never as a range, an estimate, or a competitor's
 * number wearing this operator's name. That last one is the specific
 * failure this page was rebuilt to avoid: the catalogue it was forked
 * from belonged to somebody else, and every figure in it went out rather
 * than across.
 */

// ---------------------------------------------------------------
// Day parts
// ---------------------------------------------------------------

interface DayPartToken {
  glyph: string;
  label: string;
  note: string;
}

/**
 * The five published day parts, with a glyph apiece.
 *
 * THE FILL IS THE SLICE OF THE WEEK THE PACKAGE IS ALLOWED INTO, and
 * that is the whole idea behind this glyph set. A package with no
 * published restriction gets a solid square because it can have all of
 * it; a fenced package gets a half or a corner, because that is what it
 * has been given. Four partial fills and one solid read correctly in
 * greyscale, on a photocopy, and to a reader who cannot separate two of
 * the hues on this page, which is the requirement everywhere in this
 * codebase.
 *
 * There is no day-part token in domain/vocabulary.ts. It is declared
 * here rather than added there because exactly one screen has ever
 * needed it, and a vocabulary file that accumulates values nobody else
 * reads stops being the single source of truth and becomes a junk
 * drawer. The moment a second screen wants these, they move.
 */
const DAY_PART: Record<DayPart, DayPartToken> = {
  "weekday-daytime": {
    glyph: "◧",
    label: "Weekday daytime",
    note: "Monday to Friday, before 5pm. The emptiest inventory a venue owns and the hardest hours to sell, which is why an operator that fences a group package usually fences it into these.",
  },
  "weekday-evening": {
    glyph: "◨",
    label: "Weekday evening",
    note: "After work, early in the week. Busy enough to feel like a night out and quiet enough to hold a group of fifty without touching a Saturday.",
  },
  weekend: {
    glyph: "◩",
    label: "Weekend",
    note: "Peak. The hours a venue fills without any help from anybody, which is why not one published package is scoped to them.",
  },
  "after-close": {
    glyph: "◪",
    label: "After close",
    note: "Starting after the doors shut, usually thirty minutes after. Inventory that costs the building almost nothing to sell, because it was going to be dark anyway.",
  },
  any: {
    glyph: "■",
    label: "Any day part",
    note: "No published restriction. These are the packages to lead with the moment a buyer names a Friday, because nothing on the page stops them.",
  },
};

const DAY_PART_ORDER: DayPart[] = [
  "weekday-daytime",
  "weekday-evening",
  "weekend",
  "after-close",
  "any",
];

/**
 * Fenced out of peak, in the operator's own words rather than ours.
 *
 * A package is on the weekday lever if the company has published a day
 * part for it AND that day part is a weekday one. "any" is not a fence,
 * it is the absence of one, so it fails this test even though a weekday
 * is obviously inside it.
 */
function isWeekdayFenced(pkg: EventPackage): boolean {
  if (pkg.dayParts.includes("any")) return false;
  return pkg.dayParts.some(
    (d) => d === "weekday-daytime" || d === "weekday-evening",
  );
}

// ---------------------------------------------------------------
// Small formatters
// ---------------------------------------------------------------

const money = (n: number) =>
  n % 1 === 0 ? `$${n.toFixed(0)}` : `$${n.toFixed(2)}`;

const count = (n: number) => n.toLocaleString("en-US");

/** The source URL as a reader would read it out loud. */
const sourceLabel = (url: string) =>
  url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

/**
 * The price note, minus the half of it the primitive already said.
 *
 * WithheldFigure prints "Round1 does not publish this" on its own,
 * and about half the gated notes in data/packages.ts open with "Not
 * published." Printing both makes the primitive look like decoration
 * sitting above the real sentence. Stripping the lead keeps the useful
 * remainder, which is almost always the day-part fence or the food
 * minimum, and those are the parts a rep actually carries into a
 * meeting.
 */
const REDUNDANT_LEAD =
  /^(not published|package price is not published)[.,]\s*(and\s+)?/i;

function withheldReasonFor(pkg: EventPackage): string | undefined {
  if (!pkg.priceNote) return undefined;
  const rest = pkg.priceNote.replace(REDUNDANT_LEAD, "").trim();
  if (rest.length === 0) return undefined;
  /* Fun 101 reads "Not published, and must be combined with...", so the
     strip leaves a sentence starting lower case. Recapitalising is
     cheaper than a second field in the data file and cannot get out of
     step with it. */
  return rest.charAt(0).toUpperCase() + rest.slice(1);
}

// ---------------------------------------------------------------
// Cross-checking the inclusions against what the operator withholds
// ---------------------------------------------------------------

/**
 * The phrases to search package inclusions for, per figure Round1 does
 * not publish.
 *
 * THE CHECK USED TO POINT AT ATTRACTIONS AND NOW POINTS AT FIGURES,
 * because that is what the list it reads became. The fork's list was a
 * set of attractions one operator ran somewhere and had not announced
 * for one venue. `NOT_PUBLISHED_BY_ROUND1` is a set of numbers a buyer asks
 * for in the first two minutes and cannot get off any page: the lane
 * count above all, then prices, room capacity and minimum spend.
 *
 * The two vocabularies still do not match word for word, which is the
 * reason this map exists at all. Package copy says "bowling" and "lanes"
 * rather than "bowling lane count", so searching for the list entry
 * verbatim would find nothing and report a clean bill of health, which
 * is the worst possible outcome for a check whose whole job is to catch
 * a promise nobody can size. An empty phrase list is a deliberate no,
 * for the entries that no inclusion could ever name.
 */
const NOT_PUBLISHED_PHRASES: Record<string, string[]> = {
  "Bowling lane count, at any location": ["bowling", "lane"],
  "Party room capacity": ["party room", "private room", "meeting space"],
  /* An inclusions list names what is in the package, never what it
     costs, so these three can never collide with one and the empty
     array says so on purpose rather than by accident. */
  "Any party package price": [],
  "Minimum spend": [],
  "Current US location count": [],
};

interface Collision {
  attraction: string;
  packages: EventPackage[];
}

/**
 * Packages whose published inclusions promise something whose size
 * Round1 does not publish anywhere.
 *
 * This is the most useful row on the page for anybody who actually has
 * to sell the building, and nothing about it is invented: it is one list
 * from data/packages.ts checked against another from data/venue.ts. The
 * lane row is the one that matters. A package can promise bowling in
 * writing while no page in the chain says how many lanes exist, so a rep
 * can quote the inclusion and cannot answer the next question, and
 * finding that out in front of a school is far worse than finding it out
 * here.
 */
function collisions(): Collision[] {
  return NOT_PUBLISHED_BY_ROUND1.map((attraction) => {
    const phrases = NOT_PUBLISHED_PHRASES[attraction] ?? [
      attraction.toLowerCase(),
    ];
    return {
      attraction,
      packages: PACKAGES.filter((p) => {
        const hay = p.inclusions.join(" ").toLowerCase();
        return phrases.some((phrase) => hay.includes(phrase));
      }),
    };
  }).filter((c) => c.packages.length > 0);
}

// ---------------------------------------------------------------
// Card parts
// ---------------------------------------------------------------

/** One published fact and its origin, in a definition list. */
function Fact({
  term,
  children,
}: {
  term: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.fact}>
      <dt className={styles.factTerm}>{term}</dt>
      <dd className={styles.factValue}>{children}</dd>
    </div>
  );
}

function PackageCard({
  pkg,
  onSend,
}: {
  pkg: EventPackage;
  onSend: (packageId: string) => void;
}) {
  const priced = pkg.pricePerGuest !== null;
  const fenced = isWeekdayFenced(pkg);
  const meta = PACKAGE_FAMILY[pkg.family];

  /*
    Lanes at the published maximum, from the published "one lane per
    twenty guests" rule. That half needs no house total and it is still
    computed exactly as it was.

    THE SHARE IS NULL AND IT WILL STAY NULL. It used to divide by a
    published floor of twenty six lanes, which was another operator's
    figure for another building. Round1 publishes no lane count for any
    location, so there is no denominator. Carrying twenty six across would have printed a
    confident percentage on every card on this page, all of them about a
    building that is not this operator's, and a reader who checked one
    would have no reason to trust the eighteen prices beside them. The
    division is left here and guarded, because the method is sound and it
    is the input that is withheld.
  */
  const houseLanes: number | null = VENUE.bowlingLanesPublished;
  const lanesAtMax =
    pkg.lanesPerTwentyGuests && pkg.maxGuests
      ? lanesForGuests(pkg.maxGuests)
      : null;
  const shareOfFloor =
    lanesAtMax === null || houseLanes === null
      ? null
      : Math.round((lanesAtMax / houseLanes) * 100);

  return (
    <article
      className={styles.card}
      data-priced={priced ? "yes" : "no"}
      style={{
        ["--fam" as string]: meta.cssVar,
        ["--famTint" as string]: meta.tintVar,
      }}
    >
      <header className={styles.cardHead}>
        <PackageGlyph family={pkg.family} size={30} />
        <div className={styles.cardHeadText}>
          <h3 className={styles.cardTitle}>{pkg.name}</h3>
          <div className={styles.cardChips}>
            <FamilyChip family={pkg.family} size="sm" />
            {fenced ? (
              <span className={styles.leverTag} title="Round1 has published a day-part fence on this package that keeps it out of peak hours.">
                <span aria-hidden="true">◧</span> Weekday lever
              </span>
            ) : null}
          </div>
        </div>
      </header>

      {/* THE PRICE, OR THE SENTENCE THAT REPLACES IT. Never a
          placeholder, never a dash, never an estimate wearing a
          number's clothes. */}
      <div className={styles.price}>
        <span className={styles.priceLabel}>Per guest</span>
        {priced ? (
          <>
            <span className={styles.priceValue}>
              <Figure
                value={money(pkg.pricePerGuest as number)}
                provenance={pkg.provenance.pricePerGuest ?? "public"}
              />
            </span>
            {pkg.priceNote ? (
              <p className={styles.priceNote}>{pkg.priceNote}</p>
            ) : null}
          </>
        ) : (
          <Figure
            value={null}
            provenance="withheld"
            withheldReason={withheldReasonFor(pkg)}
          />
        )}
      </div>

      {/* THE DAY-PART FENCE. Its own block, above the facts, because it
          is the one published field that decides which hours of the week
          this package can be sold into. */}
      <div className={styles.dayParts} data-fenced={fenced ? "yes" : "no"}>
        <p className={styles.dayPartsLabel}>
          When Round1 allows it
          <ProvenanceBadge provenance="public" compact />
        </p>
        <ul className={styles.dayPartList}>
          {pkg.dayParts.map((dp) => (
            <li key={dp} className={styles.dayPartItem}>
              <span aria-hidden="true" className={styles.dayPartGlyph}>
                {DAY_PART[dp].glyph}
              </span>
              {DAY_PART[dp].label}
            </li>
          ))}
        </ul>
        {pkg.dayPartNote ? (
          <p className={styles.dayPartNote}>{pkg.dayPartNote}</p>
        ) : null}
      </div>

      <h4 className={styles.subhead}>What the guest gets</h4>
      <ul className={styles.inclusions}>
        {pkg.inclusions.map((inc) => (
          <li key={inc}>{inc}</li>
        ))}
      </ul>

      <dl className={styles.facts}>
        <Fact term="Minimum guests">
          {pkg.minGuests === null ? (
            <Figure value={null} provenance="withheld" compact />
          ) : (
            <Figure
              value={count(pkg.minGuests)}
              provenance={pkg.provenance.minGuests ?? "public"}
              compact
            />
          )}
        </Fact>
        <Fact term="Maximum guests">
          {pkg.maxGuests === null ? (
            <Figure value={null} provenance="withheld" compact />
          ) : (
            <Figure
              value={count(pkg.maxGuests)}
              provenance={pkg.provenance.maxGuests ?? "public"}
              compact
            />
          )}
        </Fact>
        <Fact term="Booking notice">
          {pkg.bookingNoticeDays ? (
            <Figure
              value={`${pkg.bookingNoticeDays} days`}
              provenance="public"
              compact
            />
          ) : (
            <span className={styles.quiet}>
              Not stated on this page. The{" "}
              <a href="#standard-terms">standard terms</a> below carry the
              three day change notice, which is the one timing figure
              Round1 publishes.
            </span>
          )}
        </Fact>
        <Fact term="Deposit">
          {pkg.depositPercent ? (
            <Figure
              value={`${pkg.depositPercent}%`}
              provenance="public"
              compact
            />
          ) : (
            <span className={styles.quiet}>
              Not stated on this page. See the{" "}
              <a href="#standard-terms">standard terms</a>.
            </span>
          )}
        </Fact>
        <Fact term="Bowling lanes">
          {pkg.lanesPerTwentyGuests ? (
            <>
              <Figure
                value={`${pkg.lanesPerTwentyGuests} per ${GUESTS_PER_BOWLING_LANE} guests`}
                provenance="public"
                compact
              />
              {lanesAtMax !== null ? (
                <span className={styles.derived}>
                  At its published maximum that is{" "}
                  <strong className="num">{lanesAtMax}</strong> lanes.
                  {shareOfFloor === null ? (
                    <>
                      {" "}
                      What share of the house that is cannot be given, because
                      Round1 publishes no bowling lane count for any location.
                      <ProvenanceBadge provenance="withheld" compact />
                    </>
                  ) : (
                    <>
                      {" "}
                      That is <strong className="num">{shareOfFloor}%</strong>{" "}
                      of the house.
                      <ProvenanceBadge provenance="modeled" compact />
                    </>
                  )}
                </span>
              ) : null}
            </>
          ) : (
            <span className={styles.quiet}>
              No lane allocation is published for this package.
            </span>
          )}
        </Fact>
      </dl>

      <div className={styles.laneFit}>
        <span className={styles.laneFitLabel}>Lanes it opens</span>
        <span className={styles.laneFitChips}>
          {pkg.laneFit.map((lane: Lane) => (
            <LaneChip key={lane} lane={lane} size="sm" />
          ))}
        </span>
      </div>

      {/* THE ONLY THING ON THIS CARD THAT IS NOT A PUBLISHED FACT, and
          the reason the page is now a working surface rather than a
          reference one. It opens the picker; the picker chooses who. */}
      <div className={styles.sendRow}>
        <Button
          variant="primary"
          glyph="◆"
          onClick={() => onSend(pkg.id)}
          data-package-send={pkg.id}
          aria-label={`Send the ${pkg.name} promo. Opens the picker.`}
        >
          Send this promo
        </Button>
      </div>

      <a
        className={`${styles.source} tap`}
        href={pkg.source}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={`Read the ${pkg.name} page on round1usa.com, opens in a new tab`}
      >
        <span aria-hidden="true" className={styles.sourceGlyph}>
          ◆
        </span>
        <span className={styles.sourceUrl}>{sourceLabel(pkg.source)}</span>
      </a>
    </article>
  );
}

// ---------------------------------------------------------------
// The page
// ---------------------------------------------------------------

/** The search parameter the promo picker is addressed by. */
const SEND_PARAM = "send";

export function PackagesPage() {
  const pipeline = usePipeline();
  const dispatch = usePipelineDispatch();
  const [leverOnly, setLeverOnly] = useState(false);

  const laneFilter = pipeline.laneFilter;

  // -------------------------------------------------------------
  // THE PICKER, ADDRESSED IN THE URL
  // -------------------------------------------------------------

  /**
   * `?send=all-access-grad-pack` opens the picker on that package.
   *
   * The quote preview and the three cup surfaces already work this way
   * and the reasoning is the same in all four places. A picker state is
   * then a link somebody can send, it survives a reload, the back button
   * closes it because closing it is what going back means, and the proof
   * scripts can reach it without pressing a control, which matters
   * because the contrast walk cannot press one.
   */
  const [params, setParams] = useSearchParams();
  const sendParam = params.get(SEND_PARAM);
  const sendPackage = sendParam ? PACKAGE_BY_ID[sendParam] ?? null : null;

  const compose = useComposeModal();
  const composeProspect = compose.props.prospect;

  /** The card the picker was opened from, so focus can go back to it. */
  const pickerReturn = useRef<string | null>(null);
  /** The candidate row the compose window was opened from, for the same reason. */
  const composeReturn = useRef<string | null>(null);

  /* A package id nobody publishes is dropped out of the address rather
     than rendered as a broken dialog. Replaced rather than pushed,
     because normalising somebody's typo is not a place they went. */
  useEffect(() => {
    if (sendParam === null || sendPackage) return;
    const next = new URLSearchParams(params);
    next.delete(SEND_PARAM);
    setParams(next, { replace: true });
  }, [sendParam, sendPackage, params, setParams]);

  const openSend = useCallback(
    (packageId: string) => {
      pickerReturn.current = packageId;
      const next = new URLSearchParams(params);
      next.set(SEND_PARAM, packageId);
      /* Pushed, so the back button closes the picker. */
      setParams(next);
    },
    [params, setParams],
  );

  const closeSend = useCallback(() => {
    const next = new URLSearchParams(params);
    next.delete(SEND_PARAM);
    /* Replaced on the way out, so opening and closing three pickers does
       not bury the page under six history entries. */
    setParams(next, { replace: true });
  }, [params, setParams]);

  /**
   * Focus goes back to the card's own button when the picker closes.
   *
   * Found by its address rather than held as an element, because the
   * card is re-rendered while the picker is open and because a reader
   * who arrived on `?send=` and pressed Escape never touched a button in
   * the first place. Where the card is filtered off the page, focus
   * lands on the main region rather than nowhere.
   */
  useEffect(() => {
    if (sendPackage) return;
    const id = pickerReturn.current;
    pickerReturn.current = null;
    if (!id) return;
    const card = document.querySelector<HTMLElement>(
      `[data-package-send="${id}"]`,
    );
    if (card) {
      card.focus();
      return;
    }
    const fallback = document.querySelector<HTMLElement>("main");
    if (!fallback) return;
    if (!fallback.hasAttribute("tabindex"))
      fallback.setAttribute("tabindex", "-1");
    fallback.focus();
  }, [sendPackage]);

  /**
   * THE HANDOFF. One organisation, the featured promo intent, this
   * package, and the compose window this application already has.
   *
   * Nothing is composed here and nothing is queued here. The picker
   * answers "who", the compose window answers "what it says", and the
   * outbox is written by the outbox reducer with the recipient forced to
   * the demo address, exactly as it is from every other surface.
   */
  const pick = useCallback(
    (prospect: Prospect) => {
      if (!sendPackage) return;
      composeReturn.current = prospect.id;
      compose.open({
        prospect,
        intent: "featured-promo",
        packageId: sendPackage.id,
      });
    },
    [compose, sendPackage],
  );

  /* Focus comes back to the row that raised the letter, so a reader can
     carry straight on down the list. The row is found by address because
     it has usually moved from the untold group to the told one by the
     time the window closes, which is the whole point of the loop. */
  useEffect(() => {
    if (composeProspect !== null) return;
    const id = composeReturn.current;
    composeReturn.current = null;
    if (!id) return;
    document
      .querySelector<HTMLElement>(`[data-promo-candidate="${id}"]`)
      ?.focus();
  }, [composeProspect]);

  /*
    The lane filter is the app's, not this page's. A reader who filtered
    the desk to Schools and then walked over here should see the same
    world, and the banner above the groups says so out loud rather than
    quietly serving them a shorter list they have no way to explain.
  */
  const visible = useMemo(() => {
    const inLanes = (p: EventPackage) =>
      laneFilter.length === 0 ||
      p.laneFit.some((lane) => laneFilter.includes(lane));
    const inLever = (p: EventPackage) => !leverOnly || isWeekdayFenced(p);
    const order = (a: EventPackage, b: EventPackage) =>
      PACKAGE_FAMILY_ORDER.indexOf(a.family) -
      PACKAGE_FAMILY_ORDER.indexOf(b.family);
    return {
      priced: PRICED_PACKAGES.filter((p) => inLanes(p) && inLever(p)).sort(order),
      gated: GATED_PACKAGES.filter((p) => inLanes(p) && inLever(p)).sort(order),
    };
  }, [laneFilter, leverOnly]);

  const total = PACKAGES.length;
  const gatedShare = Math.round((GATED_PACKAGES.length / total) * 100);

  /** Which families actually appear on each side of the line. */
  const familiesIn = (list: EventPackage[]): PackageFamily[] =>
    PACKAGE_FAMILY_ORDER.filter((f) => list.some((p) => p.family === f));

  const dayPartCounts = DAY_PART_ORDER.map((dp) => ({
    dayPart: dp,
    packages: PACKAGES.filter((p) => p.dayParts.includes(dp)),
  }));

  const leverCount = PACKAGES.filter(isWeekdayFenced).length;
  const afterCloseCount = PACKAGES.filter((p) =>
    p.dayParts.includes("after-close"),
  ).length;
  const filtered = laneFilter.length > 0 || leverOnly;
  /* Every attraction Round1 publishes, all of them chain-wide claims
     rather than claims about this address. See data/venue.ts. */
  const chainWide = VENUE.attractions;
  const clashes = collisions();

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>What Round1 publishes</p>
          <h1 className={styles.h1}>Packages</h1>
          {/* The read date and the no-estimates rule are facts about every
              figure below, so they stay. The argument is on /method. */}
          <p
            className={styles.subLede}
            title="Nothing on this page is estimated, interpolated or filled in. Where Round1 withholds a number this page prints a sentence saying so."
          >
            Read off round1usa.com, 17 August 2026. Every figure carries the
            page it came from.
          </p>
        </header>

        {/* -----------------------------------------------------------
            THE LINE THROUGH THE RANGE. This panel is the argument the
            rest of the page is evidence for, so it sits at the top
            rather than in a footnote nobody reaches.
            ----------------------------------------------------------- */}
        <section className={styles.split} aria-label="Priced against gated">
          <div className={styles.splitIntro}>
            <h2 className={styles.splitTitle}>Priced against gated</h2>
            <p className={styles.splitText}>
              <strong className="num">{GATED_PACKAGES.length}</strong> of{" "}
              <strong className="num">{total}</strong> packages carry no
              published price, <strong className="num">{gatedShare}%</strong>{" "}
              of the range.
            </p>
          </div>

          <div className={styles.splitCards}>
            {/*
              The bar is proportional and it is never the only signal. Each
              side carries its glyph, its word and its count, and the two
              marks are deliberately the provenance marks used everywhere
              else in this app, because the split between these two groups
              IS a provenance split: public on one side, withheld on the
              other.
            */}
            <div
              className={styles.bar}
              role="img"
              aria-label={`${PRICED_PACKAGES.length} packages carry a published price, ${GATED_PACKAGES.length} do not`}
            >
              <span
                className={styles.barSeg}
                data-kind="priced"
                style={{ flexGrow: PRICED_PACKAGES.length }}
              />
              <span
                className={styles.barSeg}
                data-kind="gated"
                style={{ flexGrow: GATED_PACKAGES.length }}
              />
            </div>

            <div className={styles.tally} data-kind="priced">
              <span className={styles.tallyGlyph} aria-hidden="true">
                ◆
              </span>
              <span className={`${styles.tallyCount} num`}>
                {PRICED_PACKAGES.length}
              </span>
              <span className={styles.tallyLabel}>
                carry a published price
              </span>
              <span className={styles.tallyFams}>
                {familiesIn(PRICED_PACKAGES).map((f) => (
                  <FamilyChip key={f} family={f} size="sm" />
                ))}
              </span>
              <p className={styles.tallyNote}>Quotable in an email today.</p>
            </div>

            <div className={styles.tally} data-kind="gated">
              <span className={styles.tallyGlyph} aria-hidden="true">
                ▩
              </span>
              <span className={`${styles.tallyCount} num`}>
                {GATED_PACKAGES.length}
              </span>
              <span className={styles.tallyLabel}>carry no price at all</span>
              <span className={styles.tallyFams}>
                {familiesIn(GATED_PACKAGES).map((f) => (
                  <FamilyChip key={f} family={f} size="sm" />
                ))}
              </span>
              <p className={styles.tallyNote}>
                Itemised in public and gated behind a person.
              </p>
            </div>
          </div>
        </section>

        {/* -----------------------------------------------------------
            THE WEEKDAY LEVER
            ----------------------------------------------------------- */}
        <section className={styles.lever} aria-labelledby="lever-title">
          <div className={styles.leverIntro}>
            <h2 className={styles.leverTitle} id="lever-title">
              Weekday fencing
            </h2>
            <p className={styles.leverText}>
              <strong className="num">{leverCount}</strong> of the{" "}
              <strong className="num">{total}</strong> packages are fenced
              into weekday hours by Round1's own published terms, and{" "}
              <strong className="num">{afterCloseCount}</strong> start only
              once the doors have shut. No day part restriction is published
              for the All Inclusive Party, so it is carried as available at
              any hour rather than as a weekday lever. That is an absence
              rather than a permission: if a fence exists it is quoted by a
              person, which is the same gate as the price.
            </p>
          </div>

          <ul className={styles.dayPartGrid}>
            {dayPartCounts.map(({ dayPart, packages }) => (
              <li key={dayPart} className={styles.dayPartCard}>
                <p className={styles.dayPartCardHead}>
                  <span aria-hidden="true" className={styles.dayPartCardGlyph}>
                    {DAY_PART[dayPart].glyph}
                  </span>
                  <span className={styles.dayPartCardLabel}>
                    {DAY_PART[dayPart].label}
                  </span>
                  <span className={`${styles.dayPartCardCount} num`}>
                    {packages.length}
                  </span>
                </p>
                <p className={styles.dayPartCardNote}>
                  {DAY_PART[dayPart].note}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* -----------------------------------------------------------
            Controls
            ----------------------------------------------------------- */}
        <div className={styles.controls}>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={leverOnly}
              onChange={() => setLeverOnly((v) => !v)}
            />
            <span>
              Show only the packages fenced into weekday hours
              <span className={`${styles.toggleCount} num`}>{leverCount}</span>
            </span>
          </label>

          {laneFilter.length > 0 ? (
            <p className={styles.laneBanner}>
              <span aria-hidden="true" className={styles.laneBannerGlyph}>
                ◬
              </span>
              The lane filter is on, so this page is showing only the
              packages that fit{" "}
              {laneFilter.map((lane, i) => (
                <span key={lane}>
                  {i > 0 ? ", " : ""}
                  <strong>{LANE_META[lane].label}</strong>
                </span>
              ))}
              .{" "}
              <button
                type="button"
                className={styles.clearLanes}
                onClick={() => dispatch({ type: "CLEAR_LANES" })}
              >
                Show every package
              </button>
            </p>
          ) : null}
        </div>

        {/* -----------------------------------------------------------
            GROUP ONE. Priced.
            ----------------------------------------------------------- */}
        <section className={styles.group} data-kind="priced">
          <header className={styles.groupHead}>
            <h2 className={styles.groupTitle}>
              <span aria-hidden="true" className={styles.groupGlyph}>
                ◆
              </span>
              Priced and published
              <span className={`${styles.groupCount} num`}>
                {filtered
                  ? `${visible.priced.length} of ${PRICED_PACKAGES.length}`
                  : PRICED_PACKAGES.length}
              </span>
            </h2>
            <p className={styles.groupNote}>
              A number on the page, so the buyer can act without speaking to
              anybody. This group is empty, and that is the finding rather
              than a filter problem: Round1 publishes no price for anything
              it sells to a group, so there is nothing here that closes
              itself.
            </p>
          </header>
          {visible.priced.length === 0 ? (
            <p className={styles.empty}>
              Nothing to show. Round1 publishes no price for any package, so
              this group is empty before any filter is applied to it.
            </p>
          ) : (
            <div className={styles.cards}>
              {visible.priced.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} onSend={openSend} />
              ))}
            </div>
          )}
        </section>

        {/* -----------------------------------------------------------
            GROUP TWO. Gated. The reason the role exists.
            ----------------------------------------------------------- */}
        <section className={styles.group} data-kind="gated">
          <header className={styles.groupHead}>
            <h2 className={styles.groupTitle}>
              <span aria-hidden="true" className={styles.groupGlyph}>
                ▩
              </span>
              Gated behind a conversation
              <span className={`${styles.groupCount} num`}>
                {filtered
                  ? `${visible.gated.length} of ${GATED_PACKAGES.length}`
                  : GATED_PACKAGES.length}
              </span>
            </h2>
            <p className={styles.groupNote}>
              The inclusions are published in full and almost nothing else
              is. Guest minimums, guest maximums, deposits and lane
              allocation are all absent from the page, and so is the price.
              Every card below prints the sentence Round1's page actually
              leaves the buyer with.
            </p>
          </header>
          {visible.gated.length === 0 ? (
            <p className={styles.empty}>
              No gated package matches the current filters.
            </p>
          ) : (
            <div className={styles.cards}>
              {visible.gated.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} onSend={openSend} />
              ))}
            </div>
          )}
        </section>

        {/* -----------------------------------------------------------
            Terms and the one food figure
            ----------------------------------------------------------- */}
        <section className={styles.panels} aria-label="Published terms">
          <article className={styles.panel} id="standard-terms">
            <h2 className={styles.panelTitle}>The standard terms</h2>
            <div className={styles.termFigures}>
              <div className={styles.termFigure}>
                <span className={`${styles.termValue} num`}>
                  {STANDARD_TERMS.changeNoticeDays}
                </span>
                <span className={styles.termLabel}>
                  or more days notice to change a booking
                  <ProvenanceBadge provenance="public" compact />
                </span>
              </div>
              <div className={styles.termFigure}>
                <WithheldFigure
                  reason="No minimum booking notice and no deposit percentage appear on the party page or the party room page. How far ahead a party must be booked in the first place comes from a person."
                />
              </div>
            </div>
            <p className={styles.panelText}>{STANDARD_TERMS.note}</p>
            <a
              className={`${styles.source} tap`}
              href={STANDARD_TERMS.source}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Read the party booking page on round1usa.com, opens in a new tab"
            >
              <span aria-hidden="true" className={styles.sourceGlyph}>
                ◆
              </span>
              <span className={styles.sourceUrl}>
                {sourceLabel(STANDARD_TERMS.source)}
              </span>
            </a>
          </article>

          <article className={styles.panel} data-emphasis="figure">
            <h2 className={styles.panelTitle}>
              There is no food figure on the entire site
            </h2>
            <div className={styles.termFigures}>
              <div className={styles.termFigure}>
                <WithheldFigure
                  reason="Pizza and soda are named as included in the All Inclusive Party and nothing is costed. No food floor, no per person minimum and no banquet rate appears on any page read for this document."
                />
              </div>
            </div>
            <p className={styles.panelText}>
              This is worth its own panel because a food floor is the one
              figure a committee can approve without a conversation, and it
              is the figure most operators publish first. A hundred guest
              night here cannot be costed at all before somebody picks up a
              phone.
            </p>
          </article>
        </section>

        {/* -----------------------------------------------------------
            WHAT ROUND1 PUBLISHES, AND WHAT IT WITHHOLDS
            ----------------------------------------------------------- */}
        <section className={styles.chain} aria-labelledby="chain-title">
          <h2 className={styles.sectionTitle} id="chain-title">
            What Round1 publishes, and what it does not
          </h2>

          <div className={styles.chainGrid}>
            <article className={styles.chainCol} data-kind="published">
              <h3 className={styles.chainColTitle}>
                <span aria-hidden="true" className={styles.chainGlyph}>
                  ◆
                </span>
                Published chain-wide
                <span className={`${styles.chainCount} num`}>
                  {chainWide.length}
                </span>
              </h3>
              <p className={styles.chainColNote}>
                Named on Round1's own corporate profile page as venue
                features across the chain. Not one of them is a claim about
                the Cerritos office, where nobody bowls.
              </p>
              <ul className={styles.chainList}>
                {chainWide.map((a) => (
                  <li key={a.id}>
                    <span className={styles.chainItem}>{a.label}</span>
                    {a.note ? (
                      <span className={styles.chainItemNote}>{a.note}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
              <a
                className={`${styles.source} tap`}
                href={VENUE.source}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Read Round1's corporate profile page on round1usa.com, opens in a new tab"
              >
                <span aria-hidden="true" className={styles.sourceGlyph}>
                  ◆
                </span>
                <span className={styles.sourceUrl}>
                  {sourceLabel(VENUE.source)}
                </span>
              </a>
            </article>

            <article className={styles.chainCol} data-kind="absent">
              <h3 className={styles.chainColTitle}>
                <span aria-hidden="true" className={styles.chainGlyph}>
                  ▩
                </span>
                Not published by Round1
                <span className={`${styles.chainCount} num`}>
                  {NOT_PUBLISHED_BY_ROUND1.length}
                </span>
              </h3>
              <p className={styles.chainColNote}>
                Asked for in the first two minutes of a conversation and
                answerable off no page in the chain. The lane count is
                withheld at every location, not just this one.
              </p>
              <ul className={styles.chainList}>
                {NOT_PUBLISHED_BY_ROUND1.map((a) => (
                  <li key={a}>
                    <span className={styles.chainItem}>{a}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>

          {/*
            THE COLLISION CHECK. Two published lists, cross-referenced, and
            the result is the sentence a rep most needs before their first
            school visit. Nothing here is asserted by hand: change either
            data file and this table changes with it.
          */}
          <div className={styles.clash}>
            <h3 className={styles.clashTitle}>
              <span aria-hidden="true" className={styles.faultGlyph}>
                ◬
              </span>
              Where the package copy and the published figures disagree
            </h3>
            <p
              className={styles.clashLede}
              title="Several of the package pages hedge with the words 'where available'."
            >
              Named in published package inclusions, and sized nowhere on
              any published page.
            </p>
            <ul className={styles.clashList}>
              {clashes.map((c) => (
                <li key={c.attraction} className={styles.clashRow}>
                  <span className={styles.clashName}>
                    <span aria-hidden="true" className={styles.chainGlyph}>
                      ▩
                    </span>
                    {c.attraction}
                  </span>
                  <span className={styles.clashPkgs}>
                    named in{" "}
                    <strong className="num">{c.packages.length}</strong>{" "}
                    {c.packages.length === 1 ? "package" : "packages"}:{" "}
                    {c.packages.map((p) => p.name).join(", ")}
                  </span>
                </li>
              ))}
            </ul>
            {/* What has actually been published, which is what a rep can
                say out loud without creating a refund. The lane count came
                out of this sentence: the fork carried "more than twenty-six
                lanes" off another operator's page, and Round1 publishes no
                lane count for any location. Selling on a number nobody
                published is the fastest way to owe somebody a refund. */}
            <p className={styles.clashOut}>
              Sell on what is published: bowling, arcade, karaoke, billiards
              and ping pong, party rooms, and the YUU food hall. Not on how
              many lanes there are, because that is not published anywhere,
              and the honest answer is that the store will tell you.
            </p>
          </div>
        </section>
      </div>

      {/* -----------------------------------------------------------
          TWO DIALOGS, ONE INSTANCE EACH, BOTH OWNED HERE.

          The rule the compose window states in its own source is that a
          page holds the state and renders exactly one copy, and that
          every control raises a request rather than rendering its own.
          Eighteen cards rendering eighteen compose windows would trap
          focus in whichever one the browser reached first.

          The picker is keyed by package id so opening a second package
          while the first is open remounts rather than reconciles. One
          package's candidate list left under another package's marquee
          is the worst bug this surface can have.
          ----------------------------------------------------------- */}
      {sendPackage ? (
        <PromoSendModal
          key={sendPackage.id}
          pkg={sendPackage}
          onPick={pick}
          composeOver={composeProspect !== null}
          onClose={closeSend}
        />
      ) : null}

      {/* Keyed on the pair rather than left to reconcile. The compose
          window resolves its intent, its draft and its package once, on
          mount, so a second letter to the same organisation about a
          DIFFERENT package would otherwise open on the first package's
          draft. The key is here rather than in that file because the
          window is not this agent's to change. */}
      <EmailComposeModal
        key={`${composeProspect?.id ?? "none"}:${compose.props.packageId ?? "none"}`}
        {...compose.props}
      />
    </div>
  );
}
