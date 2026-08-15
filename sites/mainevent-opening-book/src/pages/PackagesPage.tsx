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
  BANQUET_FLOOR_PER_GUEST,
  PACKAGE_FAMILY_ORDER,
} from "@/data/packages";
import { VENUE, NOT_PUBLISHED_FOR_BREA } from "@/data/venue";
import { PACKAGE_FAMILY } from "@/domain/vocabulary";
import { LANE_META, lanesForGuests, GUESTS_PER_BOWLING_LANE } from "@/domain/lanes";
import { usePipeline, usePipelineDispatch } from "@/state/PipelineProvider";
import { Figure, ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
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
 * EVERY PACKAGE MAIN EVENT PUBLISHES, AND THE SHAPE OF WHAT IT DOES NOT.
 *
 * ── THE HEADLINE OF THIS PAGE IS THE PATTERN IN THE NULLS ──────────
 * Main Event publishes a price for every product a parent buys alone on
 * a phone at night. Birthday packages. The All-Access Grad Pack at
 * $29.99. The MVP Grad Pack at $52. The Play It Forward voucher at
 * $19.95. Four products, four numbers, no phone call required.
 *
 * It publishes no price at all for any corporate or group package. All
 * Access Pass, MVP, Level Up, Fun 101, All Day Meeting, Happy Hour, both
 * full facility buyouts, both lock-ins, School All Access, Bowl 'n Fun,
 * Project Graduation. Every one of those pages ends the same way: call
 * your local Sales Manager. Several add that room rental fees and
 * revenue minimums may apply.
 *
 * Brea has no local Sales Manager yet. THAT GAP IS THE JOB, and this
 * page is the evidence for it, laid out so a reader can check every
 * claim against mainevent.com in about fifteen seconds a row.
 *
 * ── WHY THIS IS NOT A PRICE LIST ───────────────────────────────────
 * A price list would be four rows long and would be the least
 * interesting four rows in the research. What a sales manager actually
 * needs off this screen is the OTHER four things Main Event publishes
 * about a package it will not price: who it is for, how many of them,
 * WHEN the company will let it run, and what it consumes of a building
 * with a published floor of twenty-six lanes. Three of those four are
 * published in full for every gated package, which means a rep can walk
 * into a school with everything except the number and still run the
 * whole conversation.
 *
 * The day-part fence gets its own block on every card because it is the
 * real weekday lever. Corporate All Access is fenced out of Friday
 * evening. Bowl 'n Fun runs before 5pm. All Day Meeting is eight to five
 * on a weekday. Main Event has already decided which hours it wants
 * filled by groups, and a rep who reads that fence correctly is selling
 * the hours the company is trying to sell rather than arguing for the
 * ones it is not.
 *
 * ── THE ONE PLACE THIS APP REFUSES TO HELP ─────────────────────────
 * The team-building programmes are the only fully priced set on the
 * site, and mainevent.com prints them as "$1995 / Person" and "$4295 /
 * Person". Read literally that is nineteen hundred dollars a head. It is
 * almost certainly a decimal stripped in a template. This prototype does
 * not quote a price it cannot read cleanly, so both render as withheld
 * and the fault is named on screen instead. Guessing the decimal would
 * be inventing a Main Event price, which is the one thing this whole
 * portfolio is built not to do.
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
    note: "Monday to Friday, before 5pm. The emptiest inventory the building owns and the hardest hours to sell once it is open, which is exactly why Main Event fences its cheapest group packages into them.",
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
 * Fenced out of peak, in Main Event's own words rather than ours.
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
 * WithheldFigure prints "Main Event does not publish this" on its own,
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
// Cross-checking the inclusions against what Brea publishes
// ---------------------------------------------------------------

/**
 * The phrases to search package inclusions for, per attraction Main
 * Event runs somewhere and has not published for Brea.
 *
 * The two vocabularies do not match word for word and the mismatch is
 * the reason this map exists. Main Event's brand-wide attraction list
 * says "Indoor mini golf"; the package pages say "mini golf", and two of
 * them say "glow golf", which is the same holes with the lights off.
 * Searching for the brand-wide phrase would find nothing and report a
 * clean bill of health, which is the worst possible outcome for a check
 * whose entire job is to catch a promise the venue cannot keep.
 */
const NOT_PUBLISHED_PHRASES: Record<string, string[]> = {
  Billiards: ["billiards"],
  "Virtual reality": ["virtual reality"],
  "Escape rooms": ["escape room"],
  "Indoor mini golf": ["mini golf", "glow golf"],
  Shuffleboard: ["shuffleboard"],
  "Rock climbing": ["rock climbing"],
};

interface Collision {
  attraction: string;
  packages: EventPackage[];
}

/**
 * Packages whose published inclusions name an attraction Main Event has
 * not published for Brea.
 *
 * This is the single most useful thing on the page for anybody who
 * actually has to sell the building, and nothing about it is invented:
 * it is one list from data/packages.ts checked against another from
 * data/venue.ts. Several of the hits are hedged with "where available",
 * which is Main Event protecting itself and doing nothing at all for the
 * rep who read the sentence out loud in a school office.
 */
function collisions(): Collision[] {
  return NOT_PUBLISHED_FOR_BREA.map((attraction) => {
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
    Lanes at the published maximum, computed from Main Event's own "one
    lane per twenty guests" rule against the published FLOOR of 26. The
    floor is used rather than a real count because 26 is published as
    "more than 26", so every figure derived from it understates the
    building and can never oversell it to the people who run it.
  */
  const lanesAtMax =
    pkg.lanesPerTwentyGuests && pkg.maxGuests
      ? lanesForGuests(pkg.maxGuests)
      : null;
  const shareOfFloor =
    lanesAtMax === null
      ? null
      : Math.round((lanesAtMax / VENUE.bowlingLanesPublishedFloor) * 100);

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
              <span className={styles.leverTag} title="Main Event has published a day-part fence on this package that keeps it out of peak hours.">
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
          When Main Event allows it
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
              5 day notice Main Event repeats everywhere else.
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
                  <strong className="num">{lanesAtMax}</strong> lanes, or{" "}
                  <strong className="num">{shareOfFloor}%</strong> of the
                  published floor of {VENUE.bowlingLanesPublishedFloor}.
                  {shareOfFloor !== null && shareOfFloor > 100
                    ? " That is more lanes than the published floor carries, which means Main Event's own maximum assumes a group this size is never all bowling at once."
                    : null}
                  <ProvenanceBadge provenance="modeled" compact />
                </span>
              ) : null}
            </>
          ) : (
            <span className={styles.quiet}>
              Main Event publishes no lane allocation for this package.
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
        aria-label={`Read the ${pkg.name} page on mainevent.com, opens in a new tab`}
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
  const brea = VENUE.attractions.filter((a) => a.breaSpecific);
  const clashes = collisions();

  const playItForward = PACKAGE_BY_ID["play-it-forward"];
  const spiritNight = PACKAGE_BY_ID["spirit-night"];
  const relayRush = PACKAGE_BY_ID["relay-rush"];
  const collab = PACKAGE_BY_ID["collab-for-a-cause"];

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>What Main Event publishes</p>
          <h1 className={styles.h1}>Packages</h1>
          {/* The read date and the no-estimates rule are facts about every
              figure below, so they stay. The argument is on /method. */}
          <p
            className={styles.subLede}
            title="Nothing on this page is estimated, interpolated or filled in. Where Main Event withholds a number this page prints a sentence saying so."
          >
            Read off mainevent.com, 11 August 2026. Every figure carries the
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
                Published in full apart from the number.
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
              into weekday hours by Main Event's own published terms.
              Corporate All Access is valid Monday before 4pm, Tuesday to
              Thursday all day and Friday only before 5pm. Bowl 'n Fun runs
              before 5pm on a weekday. All Day Meeting is eight to five,
              Monday to Friday. Play It Forward is Monday to Thursday, and
              Friday only until 5pm. A further{" "}
              <strong className="num">{afterCloseCount}</strong> start only
              once the doors have shut.
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
              anybody. These are the products that sell whether this venue
              hires a sales manager or not, and they are worth knowing cold
              because they are the only prices anyone in this trade area can
              quote today.
            </p>
          </header>
          {visible.priced.length === 0 ? (
            <p className={styles.empty}>
              No priced package matches the current filters. Every published
              price sits in the self-serve and fundraiser families, so a
              narrow lane filter will empty this group quickly.
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
              Gated behind a Sales Manager
              <span className={`${styles.groupCount} num`}>
                {filtered
                  ? `${visible.gated.length} of ${GATED_PACKAGES.length}`
                  : GATED_PACKAGES.length}
              </span>
            </h2>
            <p className={styles.groupNote}>
              Published in full apart from the number. Inclusions, guest
              minimums, guest maximums, day parts, deposits and lane
              allocation are all there; the price is a phone call. Every card
              below prints the sentence Main Event's page actually leaves the
              buyer with.
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
                  {STANDARD_TERMS.bookingNoticeDays}
                </span>
                <span className={styles.termLabel}>
                  days minimum booking notice
                  <ProvenanceBadge provenance="public" compact />
                </span>
              </div>
              <div className={styles.termFigure}>
                <span className={`${styles.termValue} num`}>
                  {STANDARD_TERMS.depositPercent}%
                </span>
                <span className={styles.termLabel}>
                  deposit to reserve
                  <ProvenanceBadge provenance="public" compact />
                </span>
              </div>
            </div>
            <p className={styles.panelText}>{STANDARD_TERMS.note}</p>
            <a
              className={`${styles.source} tap`}
              href={STANDARD_TERMS.source}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Read the All Access Pass page on mainevent.com, opens in a new tab"
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
              The only food figure on the entire site
            </h2>
            <div className={styles.termFigures}>
              <div className={styles.termFigure}>
                <span className={`${styles.termValue} num`}>
                  {money(BANQUET_FLOOR_PER_GUEST)}
                </span>
                <span className={styles.termLabel}>
                  per guest, banquet floor
                  <ProvenanceBadge provenance="public" compact />
                </span>
              </div>
            </div>
            <p className={styles.panelText}>
              "Banquet Options starting at $14 per person" on Level Up,
              "minimum food spend starting at $14 per person" on Fun 101. That
              is the whole of Main Event's published food and beverage pricing.
            </p>
            {/* A floor, not a price. The hundred-guest line is arithmetic on
                a published floor and is badged as modeled for that reason. */}
            <p className={styles.panelText}>
              A floor, not a price. A hundred-guest night starts at{" "}
              <strong className="num">
                {money(BANQUET_FLOOR_PER_GUEST * 100)}
              </strong>{" "}
              of food before the package is priced.
              <ProvenanceBadge provenance="modeled" compact />
            </p>
          </article>
        </section>

        {/* -----------------------------------------------------------
            THE DECIMAL FAULT. A judgement call, shown rather than hidden.
            ----------------------------------------------------------- */}
        <section className={styles.fault} aria-labelledby="fault-title">
          <h2 className={styles.faultTitle} id="fault-title">
            <span aria-hidden="true" className={styles.faultGlyph}>
              ◬
            </span>
            A price this app refuses to quote
          </h2>
          <div className={styles.faultBody}>
            <div className={styles.faultText}>
              <p>
                The team-building programmes are the only fully priced set on
                mainevent.com, and the page prints them like this:
              </p>
              <ul className={styles.faultQuotes}>
                <li>
                  <span className={styles.faultName}>{relayRush?.name}</span>
                  <span className={`${styles.faultQuote} num`}>
                    "$1995 / Person"
                  </span>
                </li>
                <li>
                  <span className={styles.faultName}>{collab?.name}</span>
                  <span className={`${styles.faultQuote} num`}>
                    "$4295 / Person"
                  </span>
                </li>
              </ul>
              <p>
                Read literally, that is nineteen hundred and ninety-five
                dollars a head for a video game relay. It is almost certainly
                a decimal stripped somewhere in a template, and $19.95 and
                $42.95 sit exactly where you would expect them to against
                every other figure on the site.
              </p>
              <p>
                Almost certainly is not certainly, so both render as withheld
                rather than as a restored decimal.
              </p>
              <p className={styles.faultAside}>
                Both programmes also carry a published 20% FUN-cilitator host
                fee on top of the per-person figure, and neither price
                includes sales tax. Whatever the real number turns out to be,
                it is not the number on the tile.
              </p>
            </div>
            <div className={styles.faultRule}>
              <p className={styles.faultRuleLabel}>The rule</p>
              <p className={styles.faultRuleText}>
                A figure this app cannot read cleanly is treated exactly like a
                figure Main Event chose not to publish.
              </p>
            </div>
          </div>
        </section>

        {/* -----------------------------------------------------------
            TWO FUNDRAISERS, TWO COMPLETELY DIFFERENT MECHANICS
            ----------------------------------------------------------- */}
        <section className={styles.fundraisers} aria-labelledby="fund-title">
          <h2 className={styles.sectionTitle} id="fund-title">
            The two fundraisers
          </h2>
          <p className={styles.sectionLede}>
            Both on the school events page, and opposite transactions.
          </p>
          <div className={styles.fundGrid}>
            <article className={styles.fundCard}>
              <header className={styles.fundHead}>
                <PackageGlyph family="fundraiser" size={28} />
                <h3 className={styles.fundTitle}>{spiritNight?.name}</h3>
              </header>
              <p className={styles.fundMechanic}>
                The venue pays the group.
              </p>
              <div className={styles.fundFigure}>
                <span className={`${styles.fundValue} num`}>20%</span>
                <span className={styles.fundValueLabel}>
                  of sales on the night, donated back
                  <ProvenanceBadge provenance="public" compact />
                </span>
              </div>
              <p className={styles.fundText}>
                Nobody buys a package, so there is no per-guest price to
                withhold. The twenty percent is published, so it needs no
                approval to offer.
              </p>
              <p className={styles.fundGap}>
                Minimums, notice and every term beyond the twenty percent are
                not published.
                <ProvenanceBadge provenance="withheld" compact />
              </p>
            </article>

            <article className={styles.fundCard}>
              <header className={styles.fundHead}>
                <PackageGlyph family="fundraiser" size={28} />
                <h3 className={styles.fundTitle}>{playItForward?.name}</h3>
              </header>
              <p className={styles.fundMechanic}>
                The group buys from the venue and resells.
              </p>
              <div className={styles.fundFigure}>
                <span className={`${styles.fundValue} num`}>
                  {playItForward?.pricePerGuest
                    ? money(playItForward.pricePerGuest)
                    : ""}
                </span>
                <span className={styles.fundValueLabel}>
                  per voucher, minimum{" "}
                  {playItForward?.minGuests ?? ""} vouchers
                  <ProvenanceBadge provenance="public" compact />
                </span>
              </div>
              <p className={styles.fundText}>
                A wholesale block, not a party. The group buys vouchers at{" "}
                {money(playItForward?.pricePerGuest ?? 0)} and resells at
                whatever it likes. Main Event markets the voucher as sixty
                dollars of fun.
              </p>
              {/* The fences are published terms, and a voucher sold into a
                  Saturday does not work at all. */}
              <p className={styles.fundText}>
                Fences: issuing location only, Monday to Thursday and Friday
                until 5pm, youth seventeen and under, not valid with other
                offers, three business days ahead through the sales office.
              </p>
              <p className={styles.fundGap}>
                Before opening, there is nowhere to redeem it yet.
              </p>
            </article>
          </div>
        </section>

        {/* -----------------------------------------------------------
            WHAT BREA HAS NOT ANNOUNCED
            ----------------------------------------------------------- */}
        <section className={styles.brea} aria-labelledby="brea-title">
          <h2 className={styles.sectionTitle} id="brea-title">
            What Brea publishes, and what it does not
          </h2>

          <div className={styles.breaGrid}>
            <article className={styles.breaCol} data-kind="published">
              <h3 className={styles.breaColTitle}>
                <span aria-hidden="true" className={styles.breaGlyph}>
                  ◆
                </span>
                Published for Brea
                <span className={`${styles.breaCount} num`}>
                  {brea.length}
                </span>
              </h3>
              <p className={styles.breaColNote}>
                Named on the Brea location page itself.
              </p>
              <ul className={styles.breaList}>
                {brea.map((a) => (
                  <li key={a.id}>
                    <span className={styles.breaItem}>{a.label}</span>
                    {a.note ? (
                      <span className={styles.breaItemNote}>{a.note}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
              <a
                className={`${styles.source} tap`}
                href={VENUE.source}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Read the Main Event Brea location page on mainevent.com, opens in a new tab"
              >
                <span aria-hidden="true" className={styles.sourceGlyph}>
                  ◆
                </span>
                <span className={styles.sourceUrl}>
                  {sourceLabel(VENUE.source)}
                </span>
              </a>
            </article>

            <article className={styles.breaCol} data-kind="absent">
              <h3 className={styles.breaColTitle}>
                <span aria-hidden="true" className={styles.breaGlyph}>
                  ▩
                </span>
                Not published for Brea
                <span className={`${styles.breaCount} num`}>
                  {NOT_PUBLISHED_FOR_BREA.length}
                </span>
              </h3>
              <p className={styles.breaColNote}>
                Run somewhere in the brand, not named on the Brea page. Not
                the same as saying Brea will not have them.
              </p>
              <ul className={styles.breaList}>
                {NOT_PUBLISHED_FOR_BREA.map((a) => (
                  <li key={a}>
                    <span className={styles.breaItem}>{a}</span>
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
              Where the package copy and the Brea page disagree
            </h3>
            <p
              className={styles.clashLede}
              title="Several of the package pages hedge with the words 'where available'."
            >
              Named in published package inclusions, not on Brea's published
              attraction list.
            </p>
            <ul className={styles.clashList}>
              {clashes.map((c) => (
                <li key={c.attraction} className={styles.clashRow}>
                  <span className={styles.clashName}>
                    <span aria-hidden="true" className={styles.breaGlyph}>
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
            {/* What Brea has actually announced, which is what a rep can
                say out loud without creating a refund. */}
            <p className={styles.clashOut}>
              Sell on what Brea has announced: more than twenty-six lanes, a
              multi-level laser tag arena, Gravity Ropes, over a hundred
              games, a full-service restaurant and bar, and dedicated meeting
              space.
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
