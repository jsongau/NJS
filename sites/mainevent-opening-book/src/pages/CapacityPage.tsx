import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Provenance } from "@/domain/types";
import { VENUE } from "@/data/venue";
import { PACKAGE_BY_ID } from "@/data/packages";
import { PROSPECT_BY_ID, PROSPECTS } from "@/data/prospects";
import { GUESTS_PER_BOWLING_LANE, lanesForGuests } from "@/domain/lanes";
import {
  MAX_SIMULTANEOUS_BOWLERS,
  dayLoads,
  fitCheck,
  packagePressure,
  pipelinePressure,
} from "@/domain/selectors/capacity";
import { furthestStatus, usePipeline } from "@/state/PipelineProvider";
import { useBook } from "@/state/BookProvider";
import { Figure, ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { FamilyChip } from "@/components/primitives/FamilyChip";
import { PackageGlyph } from "@/components/primitives/PackageGlyph";
import { LaneChip } from "@/components/primitives/LaneChip";
import { StatusChip } from "@/components/primitives/StatusChip";
import { SOURCE_LINKS } from "@/lib/links";
import styles from "./CapacityPage.module.css";

/**
 * CAPACITY. The screen that stops a sales manager promising the same
 * Friday to three people.
 *
 * ----- WHY THIS IS A PAGE AND NOT A TOOLTIP ---------------------------
 *
 * Every number on this screen is a multiplication of two figures Main
 * Event publishes itself. One lane per twenty guests, printed in the
 * inclusions list of the All Access Pass, the MVP package and Level Up.
 * More than 26 lanes, printed on the Brea location page. Nobody has to
 * be persuaded of either of them.
 *
 * The consequence is not visible until somebody does the multiplication,
 * which is exactly why it earns a screen. A 300-guest Corporate All
 * Access Pass, at the maximum Main Event publishes for that package,
 * consumes fifteen lanes. That is well over half the floor of the
 * building for one booking, and the second group asking for the same
 * evening has to be told no. A venue that has not opened has no history
 * to warn anybody about that. It has arithmetic, and this is where the
 * arithmetic is written down.
 *
 * ----- THE ONE JUDGEMENT, DECLARED AT THE TOP -------------------------
 *
 * Brea publishes "more than 26 lanes" and not a count. The hedge is
 * load-bearing and it is kept: everything here computes against the
 * published FLOOR of 26, so every figure on this page understates the
 * building and not one of them can oversell it. That decision is the
 * first thing a reader meets rather than a footnote, because a capacity
 * chart whose assumptions are hidden is a capacity chart nobody can
 * argue with, and the whole point of this one is that it can be argued
 * with in fifteen seconds against mainevent.com.
 *
 * ----- WHY 520 AND 800 ARE BOTH TRUE ----------------------------------
 *
 * The published lane floor supports 520 guests bowling at one moment.
 * Main Event publishes a maximum of 800 or more for a Full Facility
 * Buyout. Those are two different measurements of two different things,
 * and the distinction is precisely the sort that gets lost when nobody
 * writes it down: quote 520 as the capacity of the venue and you have
 * undersold it by most of a school; quote 800 as a bowling number and
 * you have oversold the lanes by fourteen of them. Both mistakes are
 * made on the phone, in the first thirty seconds, by somebody who has
 * never had the two numbers side by side.
 *
 * ----- WHAT THIS PAGE READS FROM, AND WHY IT MATTERS ------------------
 *
 * The dates come from useBook() rather than from SEED_BOOK, and the
 * stress test comes from usePipeline() rather than from a stored total.
 * Change a guest count on the Book page and the utilisation on a date
 * here moves before you have finished walking back to this tab. That is
 * not a party trick; a capacity chart that is a stored snapshot rather
 * than a selector is a capacity chart that will one day disagree with
 * the ledger it was copied from, in front of a customer.
 *
 * ----- THE ALTERNATIVE THAT WAS REJECTED ------------------------------
 *
 * The obvious build for this is a month grid: twelve little calendars,
 * dates shaded by how full they are. It was not built, for two reasons.
 * Main Event has published no opening date for Brea, so eleven of those
 * twelve months would be squares nobody can sell into, and a grid shaded
 * by fullness is the exact chart that has to signal by colour alone. The
 * list below carries the same information with the numbers written on
 * it, and it degrades to a printout on a general manager's desk.
 *
 * ----- EVERY BAR CARRIES ITS NUMBER -----------------------------------
 *
 * That rule holds everywhere in this application and it is enforced hard
 * here, because this page is an argument about arithmetic. A bar with no
 * figure on it would be asking the reader to take the multiplication on
 * trust, which is the one thing this screen exists not to do.
 */

// ---------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Dates are split rather than parsed, as they are on the Book page and
 * the replies page.
 *
 * `new Date("2026-12-12")` is midnight UTC, and rendering that through a
 * locale formatter in California prints the eleventh. An event date that
 * is one day early on the screen somebody is checking a hold against is
 * not a rounding error, it is a wrong answer.
 */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

const count = (n: number) => n.toLocaleString("en-US");
const pct = (n: number) => `${Math.round(n * 100)}%`;
const lanesWord = (n: number) => (n === 1 ? "lane" : "lanes");

const FLOOR = VENUE.bowlingLanesPublishedFloor;

// ---------------------------------------------------------------
// The bar
// ---------------------------------------------------------------

interface Segment {
  key: string;
  lanes: number;
  label: string;
  glyph: string;
  /**
   * Paints the bar segment and, more importantly, the glyph in the key
   * below it. It has to be a colour that can carry a 10px character on
   * paper: --line-2 was used here for the free segment and measured
   * 1.49:1, which is a hairline colour doing a text colour's job. The
   * hollow segments draw themselves in hatching and never read --tone,
   * so what this value does for them is set the key glyph alone.
   */
  tone: string;
  /** Drawn as an outline rather than a fill. Used for what is free. */
  hollow?: boolean;
}

/**
 * One horizontal bar, measured in bowling lanes, with the published
 * floor marked on it.
 *
 * THE MARKER IS THE WHOLE REASON THIS IS A SHARED COMPONENT. Several
 * things on this page are bigger than the building: a School Lock-In at
 * its published maximum of 800 guests wants forty lanes, and a request
 * that does not fit a date wants more than are free. A chart that
 * clipped those to the edge of the track would be hiding the single most
 * useful fact in the row, and one that silently rescaled would make a
 * 40-lane package look the same width as a 26-lane one.
 *
 * So the track is scaled to whichever is larger, the floor or the total,
 * and a labelled rule is drawn at 26 lanes. Anything to the right of
 * that rule is capacity the venue does not publish. Every segment
 * carries its own glyph, its own word and its own figure underneath, so
 * the bar is decoration and the key below it is the data.
 */
function LaneBar({
  segments,
  caption,
}: {
  segments: Segment[];
  /** Read to a screen reader in place of the bar itself. */
  caption: string;
}) {
  const total = segments.reduce((n, s) => n + s.lanes, 0);
  const scale = Math.max(FLOOR, total);

  return (
    <div className={styles.barBlock}>
      <div
        className={styles.track}
        role="img"
        aria-label={caption}
        style={{ ["--markerAt" as string]: `${(FLOOR / scale) * 100}%` }}
        data-over={total > FLOOR ? "true" : "false"}
      >
        {segments.map((s) =>
          s.lanes > 0 ? (
            <span
              key={s.key}
              className={s.hollow ? styles.segHollow : styles.seg}
              style={{
                width: `${(s.lanes / scale) * 100}%`,
                ["--tone" as string]: s.tone,
              }}
            />
          ) : null,
        )}
        {total > FLOOR ? (
          <span className={styles.marker} aria-hidden="true" />
        ) : null}
      </div>

      <ul className={styles.barKey}>
        {segments.map((s) => (
          <li key={s.key} className={styles.barKeyItem}>
            <span
              className={styles.keyGlyph}
              aria-hidden="true"
              style={{ ["--tone" as string]: s.tone }}
            >
              {s.glyph}
            </span>
            <span className={`${styles.keyValue} num`}>
              {count(s.lanes)} {lanesWord(s.lanes)}
            </span>
            <span className={styles.keyLabel}>{s.label}</span>
          </li>
        ))}
      </ul>

      {/*
        The rule is explained in words underneath rather than labelled on
        the track itself. A caption sitting inside a 14px bar has to be
        set in eight point type over whatever segment happens to be
        behind it, which is a contrast failure waiting for the one row
        where the segment is dark.
      */}
      {total > FLOOR ? (
        <p className={styles.markerNote}>
          <span aria-hidden="true">▏</span>
          <span>
            The rule across the bar is Brea&apos;s published floor of{" "}
            <span className="num">{FLOOR}</span> lanes. Everything to the
            right of it is capacity nobody has published.
          </span>
        </p>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------
// The fit checker
// ---------------------------------------------------------------

/**
 * Two fields and a sentence.
 *
 * This is the only part of the page a person would open with somebody on
 * the phone, so it is built as a real form rather than as a demonstration
 * of one: labelled fields, a number pad on a phone, presets that are the
 * published maxima of actual Main Event packages rather than round
 * numbers somebody liked, and an answer that updates as you type and is
 * announced to a screen reader when it changes.
 *
 * THE DATE DEFAULTS TO THE BUSIEST DATE IN THE BOOK, which is a
 * deliberate choice about what a reader discovers first. Defaulting to
 * today, or to an empty field, means the first thing anybody sees is
 * "fits", every time, because a venue that has not opened has an empty
 * calendar. The interesting half of this tool is the branch where the
 * answer is no, and it should not take a reader three guesses to find
 * it.
 */
function FitChecker({
  dates,
  presets,
}: {
  /** Dates already carrying a hold, busiest first. */
  dates: { date: string; lanesHeld: number }[];
  presets: { guests: number; name: string }[];
}) {
  const { book } = useBook();

  const [date, setDate] = useState<string>(() => dates[0]?.date ?? "");
  const [guests, setGuests] = useState<string>("300");

  const guestCount = Number.parseInt(guests, 10);
  const guestsValid = Number.isFinite(guestCount) && guestCount > 0;
  const ready = date !== "" && guestsValid;

  const result = ready ? fitCheck(book, date, guestCount) : null;

  const held = book
    .filter((l) => l.eventDate === date)
    .reduce((n, l) => n + l.lanesHeld, 0);
  const free = FLOOR - held;
  const needed = guestsValid ? lanesForGuests(guestCount) : 0;
  const overflow = Math.max(0, needed - free);

  return (
    <section className={styles.fit} id="fit" aria-labelledby="fit-h">
      <div className={styles.sectionHead}>
        <h2 className={styles.h2} id="fit-h">
          Does this group fit on this date?
        </h2>
        <ProvenanceBadge provenance="modeled" />
      </div>

      <div className={styles.fitForm}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="fit-date">
            Event date
          </label>
          <input
            id="fit-date"
            className={`${styles.input} num`}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {dates.length > 0 ? (
            <div className={styles.presets}>
              <span className={styles.presetLabel}>
                Dates already carrying a hold
              </span>
              <div className={styles.presetRow}>
                {dates.map((d) => (
                  <button
                    key={d.date}
                    type="button"
                    className={styles.preset}
                    aria-pressed={date === d.date}
                    onClick={() => setDate(d.date)}
                  >
                    <span className={`${styles.presetValue} num`}>
                      {formatDate(d.date)}
                    </span>
                    <span className={styles.presetNote}>
                      {d.lanesHeld === 0
                        ? "no lanes held"
                        : `${count(d.lanesHeld)} ${lanesWord(d.lanesHeld)} held`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="fit-guests">
            Guests
          </label>
          <input
            id="fit-guests"
            className={`${styles.input} num`}
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
          />
          <div className={styles.presets}>
            <span className={styles.presetLabel}>
              Published package maxima, for a group size that means something
            </span>
            <div className={styles.presetRow}>
              {presets.map((p) => (
                <button
                  key={p.guests}
                  type="button"
                  className={styles.preset}
                  aria-pressed={guests === String(p.guests)}
                  onClick={() => setGuests(String(p.guests))}
                >
                  <span className={`${styles.presetValue} num`}>
                    {count(p.guests)}
                  </span>
                  <span className={styles.presetNote}>{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.fitOut} aria-live="polite">
        {!ready ? (
          <p className={styles.fitPrompt}>
            <span aria-hidden="true">○</span>
            <span>
              {date === ""
                ? "Pick a date and a headcount. Nothing in the book holds a lane on a date that has not been chosen, so an unset date would answer yes to everything."
                : "Type a headcount above. A guest count of zero is not a booking, so there is nothing to check yet."}
            </span>
          </p>
        ) : (
          <>
            <p
              className={styles.fitVerdict}
              data-fits={result?.fits ? "true" : "false"}
            >
              <span className={styles.fitGlyph} aria-hidden="true">
                {result?.fits ? "●" : "✕"}
              </span>
              <span className={styles.fitWord}>
                {result?.fits ? "Fits" : "Does not fit"}
              </span>
              <span className={styles.fitOn}>
                <span className="num">{count(guestCount)}</span> guests on{" "}
                <span className="num">{formatDate(date)}</span>
                <ProvenanceBadge provenance="user_input" compact />
              </span>
            </p>

            <p className={styles.fitMessage}>{result?.message}</p>

            <LaneBar
              caption={`${date}. ${held} lanes already held, ${needed} lanes needed for ${guestCount} guests, ${Math.max(
                0,
                free - needed,
              )} lanes still free of the published floor of ${FLOOR}.`}
              segments={[
                {
                  key: "held",
                  lanes: held,
                  label: "already held by signed bookings",
                  glyph: "■",
                  tone: "var(--ledger-revenue)",
                },
                {
                  key: "needed",
                  lanes: Math.min(needed, Math.max(free, 0)),
                  label: `needed for ${count(guestCount)} guests`,
                  glyph: "◆",
                  tone: "var(--brand-gold)",
                },
                {
                  key: "over",
                  lanes: overflow,
                  label: "asked for beyond the published floor",
                  glyph: "✕",
                  tone: "var(--risk)",
                },
                {
                  key: "free",
                  lanes: Math.max(0, free - needed),
                  label: "still free after this booking",
                  glyph: "○",
                  tone: "var(--text-2)",
                  hollow: true,
                },
              ]}
            />

            {/* A statement about lanes, not about the building. The published
                buyout maximum is far larger. */}
            {!result?.fits ? (
              <p
                className={styles.fitAside}
                title="This does not say the building cannot hold the people. Main Event's published buyout maximum is far larger than the lanes can take at one time."
              >
                <strong>A statement about lanes, not the building.</strong> No
                lane-holding package fits this date at one lane per{" "}
                {GUESTS_PER_BOWLING_LANE}.
              </p>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------
// The page
// ---------------------------------------------------------------

export function CapacityPage() {
  const { book } = useBook();
  const pipeline = usePipeline();

  const loads = useMemo(() => dayLoads(book), [book]);
  const pressure = useMemo(() => packagePressure(), []);

  /**
   * The live conversations, taken off the fact table rather than from a
   * list somebody kept.
   *
   * "Live" is in conversation or holding a date, and it deliberately
   * excludes booked. A signed contract is already sitting in the dates
   * above with its lanes counted; adding it here as well would charge
   * the calendar twice for the same party, which is the classic way a
   * pipeline stress test ends up describing a busier venue than the one
   * that exists.
   */
  const live = useMemo(
    () =>
      PROSPECTS.filter((p) => {
        const s = furthestStatus(pipeline, p.id);
        return s === "conversation" || s === "soft-hold";
      }),
    [pipeline],
  );

  const stress = useMemo(() => pipelinePressure(live), [live]);

  /**
   * Dates held in the fact table that are not in the book.
   *
   * A soft hold blocks an evening in the real world and it is not a
   * contract, so it is not in the ledger the chart above is built from.
   * Leaving that unsaid would be the quiet kind of wrong: the reader
   * would see an empty June and have no way to know a school is sitting
   * on the twelfth of it.
   */
  const heldNotSigned = useMemo(() => {
    const bookDates = new Set(book.map((l) => l.eventDate));
    return pipeline.statuses
      .filter(
        (s) =>
          s.periodId === pipeline.periodId &&
          s.status === "soft-hold" &&
          s.targetDate &&
          !bookDates.has(s.targetDate),
      )
      .sort((a, b) => (a.targetDate ?? "").localeCompare(b.targetDate ?? ""));
  }, [pipeline.statuses, pipeline.periodId, book]);

  /** Presets for the fit checker, from real published package maxima. */
  const presets = useMemo(() => {
    const seen = new Map<number, string>();
    for (const p of pressure) {
      if (p.maxGuests && !seen.has(p.maxGuests)) seen.set(p.maxGuests, p.name);
    }
    return [...seen.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([guests, name]) => ({ guests, name: `${name} at its maximum` }));
  }, [pressure]);

  const fitDates = useMemo(
    () =>
      [...loads]
        .sort(
          (a, b) => b.lanesHeld - a.lanesHeld || a.date.localeCompare(b.date),
        )
        .map((l) => ({ date: l.date, lanesHeld: l.lanesHeld })),
    [loads],
  );

  /* The row the whole page is an argument about. Looked up by id so the
     figures in the callout are the selector's and not a typist's. */
  const headline = pressure.find(
    (p) => p.packageId === "corporate-all-access-pass",
  );
  const buyout = PACKAGE_BY_ID["corporate-buyout"];
  const buyoutMax = buyout?.maxGuests ?? null;

  /** The single largest live conversation, in lanes. */
  const biggest = useMemo(() => {
    if (live.length === 0) return null;
    return live
      .map((p) => {
        const mid = Math.round((p.headcountLow + p.headcountHigh) / 2);
        return { prospect: p, guests: mid, lanes: lanesForGuests(mid) };
      })
      .sort((a, b) => b.lanes - a.lanes)[0];
  }, [live]);

  /** The stress test drawn as whole evenings of the published floor. */
  const evenings = useMemo(() => {
    const out: number[] = [];
    let left = stress.lanes;
    while (left > 0 && out.length < 12) {
      out.push(Math.min(left, FLOOR));
      left -= FLOOR;
    }
    return out;
  }, [stress.lanes]);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Capacity</p>
          <h1 className={styles.h1}>What 26 lanes will actually hold</h1>
          {/* Computed against the published floor of 26, so every figure here
              understates the building and none can oversell it. */}
          <p
            className={styles.subLede}
            title="Brea publishes 'more than 26 lanes' without a count. Computing against the floor means every figure on this page is the pessimistic one."
          >
            One lane per {GUESTS_PER_BOWLING_LANE} guests, against a published
            floor of {FLOOR} lanes.
          </p>
          <p className={styles.jump}>
            <a className={styles.jumpLink} href="#fit">
              <span aria-hidden="true">◆</span>
              <span>Straight to the fit checker</span>
            </a>
          </p>
        </header>

        {/* ---------------------------------------------------------
            THE ARITHMETIC, AND WHOSE IT IS.
            --------------------------------------------------------- */}
        <section className={styles.terms} aria-labelledby="terms-h">
          <h2 className={styles.h2} id="terms-h">
            Two published figures and one judgement
          </h2>

          <ol className={styles.termList}>
            <li className={styles.term}>
              <span className={styles.termIndex} aria-hidden="true">
                1
              </span>
              <span className={`${styles.termValue} num`}>
                1 lane per {GUESTS_PER_BOWLING_LANE}
              </span>
              <span className={styles.termLabel}>
                Main Event&apos;s own ratio
                <ProvenanceBadge provenance="public" compact />
              </span>
              <span className={styles.termNote}>
                Printed in the inclusions list of the All Access Pass, the MVP
                package and Level Up.
              </span>
            </li>

            <li className={styles.term}>
              <span className={styles.termIndex} aria-hidden="true">
                2
              </span>
              <span className={`${styles.termValue} num`}>
                More than {FLOOR}
              </span>
              <span className={styles.termLabel}>
                Bowling lanes published for Brea
                <ProvenanceBadge provenance="public" compact />
              </span>
              <span className={styles.termNote}>
                The Brea page says &ldquo;more than 26 lanes&rdquo; and gives
                no count. The hedge is kept rather than tidied away.
              </span>
            </li>

            <li className={styles.term}>
              <span className={styles.termIndex} aria-hidden="true">
                3
              </span>
              <span className={`${styles.termValue} num`}>Use {FLOOR}</span>
              <span className={styles.termLabel}>
                The one decision made here
                <ProvenanceBadge provenance="modeled" compact />
              </span>
              <span className={styles.termNote}>
                Against the floor, so every figure here is the pessimistic one.
              </span>
            </li>
          </ol>

          <p className={styles.equals}>
            <span className={styles.equalsSum}>
              <span className="num">{FLOOR}</span> lanes at{" "}
              <span className="num">{GUESTS_PER_BOWLING_LANE}</span> guests
              each
            </span>
            <span className={`${styles.equalsValue} num`}>
              {count(MAX_SIMULTANEOUS_BOWLERS)}
            </span>
            <span className={styles.equalsLabel}>
              guests bowling at one time
              <ProvenanceBadge provenance="modeled" />
            </span>
          </p>
        </section>

        {/* ---------------------------------------------------------
            520 AND 800 ARE BOTH TRUE.
            --------------------------------------------------------- */}
        <section className={styles.twoFigures} aria-labelledby="both-h">
          <div className={styles.bothBody}>
            <h2 className={styles.h2} id="both-h">
              Two figures, two different things
            </h2>
            {/* Both are true. One is a bowling number, the other is a
                building number, and quoting either as the other is the
                mistake this panel exists to stop. */}
            <p className={styles.bothText}>
              <strong>
                <span className="num">{count(MAX_SIMULTANEOUS_BOWLERS)}</span>{" "}
                is a bowling number.
              </strong>{" "}
              Guests on a lane at one time, at the published ratio against the
              published floor.
            </p>
            <p className={styles.bothText}>
              <strong>
                {buyoutMax === null ? (
                  "The buyout maximum is a building number."
                ) : (
                  <>
                    <span className="num">{count(buyoutMax)}</span> or more is a
                    building number.
                  </>
                )}
              </strong>{" "}
              Main Event's published maximum for a Full Facility Buyout, which
              is the whole site.
            </p>
          </div>

          <div className={styles.bothFigures}>
            <div className={styles.bigFig}>
              <span className={`${styles.bigValue} num`}>
                {count(MAX_SIMULTANEOUS_BOWLERS)}
              </span>
              <span className={styles.bigLabel}>
                guests bowling at once, at the published floor
              </span>
              <ProvenanceBadge provenance="modeled" />
            </div>
            <div className={styles.bigFig}>
              <span className={`${styles.bigValue} num`}>
                {buyoutMax === null ? "Not published" : `${count(buyoutMax)}+`}
              </span>
              <span className={styles.bigLabel}>
                guests at a Full Facility Buyout, Main Event&apos;s own
                published maximum
              </span>
              <ProvenanceBadge
                provenance={
                  (buyout?.provenance.maxGuests as Provenance) ?? "public"
                }
              />
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------
            PACKAGE PRESSURE.
            --------------------------------------------------------- */}
        <section className={styles.pressure} aria-labelledby="pressure-h">
          <div className={styles.sectionHead}>
            <h2 className={styles.h2} id="pressure-h">
              How much of the floor each package eats at its own published
              maximum
            </h2>
            <ProvenanceBadge provenance="modeled" />
          </div>

          {/* Not a forecast of demand. What a package would consume if sold
              at the size Main Event says it can be sold at. */}
          <p className={styles.note}>
            Published maximum guest count times the published one-lane-per-
            twenty rule.
          </p>

          <ul className={styles.pressureList}>
            {pressure.map((row) => {
              const pkg = PACKAGE_BY_ID[row.packageId];
              const over =
                row.shareOfVenue !== null && row.shareOfVenue > 1;
              const heavy =
                row.shareOfVenue !== null && row.shareOfVenue > 0.5;

              return (
                <li key={row.packageId} className={styles.pressureRow}>
                  <div className={styles.pkgHead}>
                    <PackageGlyph packageId={row.packageId} size={22} />
                    <span className={styles.pkgName}>{row.name}</span>
                    {pkg ? <FamilyChip family={pkg.family} size="sm" /> : null}
                  </div>

                  {row.maxGuests === null || row.lanesAtMax === null ? (
                    <>
                      <div className={styles.barBlock}>
                        <div
                          className={`${styles.track} ${styles.trackEmpty}`}
                          role="img"
                          aria-label={`${row.name} publishes no maximum guest count, so there is no ceiling to compute against.`}
                        />
                        <p className={styles.noMax}>
                          <span aria-hidden="true">○</span>
                          <span>
                            No published maximum
                            <ProvenanceBadge provenance="withheld" compact />
                          </span>
                        </p>
                      </div>
                      <p className={styles.pressureNote}>{row.note}</p>
                    </>
                  ) : (
                    <>
                      <div className={styles.pressureNums}>
                        <span className={styles.numCell}>
                          <span className={styles.numLabel}>
                            Published maximum
                          </span>
                          <Figure
                            value={`${count(row.maxGuests)} guests`}
                            provenance={
                              (pkg?.provenance.maxGuests as Provenance) ??
                              "public"
                            }
                            compact
                          />
                        </span>
                        <span className={styles.numCell}>
                          <span className={styles.numLabel}>
                            Lanes at that size
                          </span>
                          <Figure
                            value={`${count(row.lanesAtMax)} of ${FLOOR}`}
                            provenance="modeled"
                            compact
                          />
                        </span>
                        <span className={styles.numCell}>
                          <span className={styles.numLabel}>
                            Share of the lane floor
                          </span>
                          <Figure
                            value={pct(row.shareOfVenue ?? 0)}
                            provenance="modeled"
                            compact
                          />
                        </span>
                      </div>

                      <LaneBar
                        caption={`${row.name} at its published maximum of ${row.maxGuests} guests takes ${row.lanesAtMax} of the ${FLOOR} published lanes, which is ${pct(
                          row.shareOfVenue ?? 0,
                        )} of the floor.`}
                        segments={[
                          {
                            key: "used",
                            lanes: Math.min(row.lanesAtMax, FLOOR),
                            label: "of the published floor",
                            glyph: over ? "▲" : heavy ? "◆" : "■",
                            tone: over
                              ? "var(--risk)"
                              : heavy
                                ? "var(--brand-gold)"
                                : "var(--accent)",
                          },
                          {
                            key: "over",
                            lanes: Math.max(0, row.lanesAtMax - FLOOR),
                            label: "beyond anything Brea publishes",
                            glyph: "✕",
                            tone: "var(--risk)",
                          },
                        ]}
                      />

                      {heavy ? (
                        <p className={styles.pressureNote} data-heavy="true">
                          <span aria-hidden="true">
                            {over ? "✕" : "▲"}
                          </span>{" "}
                          {row.note}
                        </p>
                      ) : null}
                    </>
                  )}
                </li>
              );
            })}
          </ul>

          {headline &&
          headline.maxGuests !== null &&
          headline.lanesAtMax !== null ? (
            <div className={styles.callout}>
              <p className={styles.calloutEyebrow}>
                The line that makes the point
              </p>
              <p className={styles.calloutText}>
                A <span className="num">{count(headline.maxGuests)}</span>
                -guest {headline.name}, at the maximum Main Event publishes for
                it, takes{" "}
                <strong className="num">{count(headline.lanesAtMax)}</strong> of
                the <span className="num">{FLOOR}</span> published lanes. That
                is <strong className="num">{pct(headline.shareOfVenue ?? 0)}</strong>{" "}
                of the floor for one booking. Two of them on the same evening is
                the building, and the second one has to be told no.
              </p>
            </div>
          ) : null}
        </section>

        {/* ---------------------------------------------------------
            DATES WITH SOMETHING AGAINST THEM.
            --------------------------------------------------------- */}
        <section className={styles.dates} aria-labelledby="dates-h">
          <div className={styles.sectionHead}>
            <h2 className={styles.h2} id="dates-h">
              Dates with something already against them
            </h2>
            <ProvenanceBadge provenance="modeled" />
          </div>

          {/* Lanes held are derived from each line's headcount, never typed.
              Effectively full is this application's own threshold, not Main
              Event's. */}
          <p
            className={styles.note}
            title="Lanes held are derived from the headcount on each line and never typed. A date is called effectively full below three free lanes, which is this application's own threshold rather than Main Event's."
          >
            Read live off <Link to="/book">the Book</Link>. Effectively full
            means fewer than three free lanes.
          </p>

          {loads.length === 0 ? (
            <p className={styles.empty}>
              <span aria-hidden="true">○</span>
              <span>Nothing in the book holds a lane yet.</span>
            </p>
          ) : (
            <ul className={styles.dateList}>
              {loads.map((load) => (
                <li key={load.date} className={styles.dateRow}>
                  <div className={styles.dateHead}>
                    <h3 className={styles.dateTitle}>
                      <span className="num">{formatDate(load.date)}</span>
                    </h3>
                    <span
                      className={styles.dateState}
                      data-full={load.effectivelyFull ? "true" : "false"}
                    >
                      <span aria-hidden="true">
                        {load.effectivelyFull ? "✕" : "●"}
                      </span>
                      <span>
                        {load.effectivelyFull
                          ? "Effectively full"
                          : "Room on this date"}
                      </span>
                    </span>
                  </div>

                  <div className={styles.dateStats}>
                    <span className={styles.numCell}>
                      <span className={styles.numLabel}>Lanes held</span>
                      <Figure
                        value={`${count(load.lanesHeld)} of ${FLOOR}`}
                        provenance="modeled"
                        compact
                      />
                    </span>
                    <span className={styles.numCell}>
                      <span className={styles.numLabel}>Lanes free</span>
                      <Figure
                        value={count(load.lanesFree)}
                        provenance="modeled"
                        compact
                      />
                    </span>
                    <span className={styles.numCell}>
                      <span className={styles.numLabel}>Utilisation</span>
                      <Figure
                        value={pct(load.utilisation)}
                        provenance="modeled"
                        compact
                      />
                    </span>
                    <span className={styles.numCell}>
                      <span className={styles.numLabel}>
                        Largest group that still fits
                      </span>
                      <Figure
                        value={`${count(
                          load.lanesFree * GUESTS_PER_BOWLING_LANE,
                        )} guests`}
                        provenance="modeled"
                        compact
                      />
                    </span>
                  </div>

                  <LaneBar
                    caption={`${load.date}. ${load.lanesHeld} of the ${FLOOR} published lanes are held, ${load.lanesFree} are free, which is ${pct(
                      load.utilisation,
                    )} utilisation.`}
                    segments={[
                      {
                        key: "held",
                        lanes: load.lanesHeld,
                        label: "held by signed bookings",
                        glyph: "■",
                        tone: "var(--ledger-revenue)",
                      },
                      {
                        key: "free",
                        lanes: load.lanesFree,
                        label: "free",
                        glyph: "○",
                        tone: "var(--text-2)",
                        hollow: true,
                      },
                    ]}
                  />

                  <ul className={styles.lineList}>
                    {load.lines.map((line) => {
                      const prospect = PROSPECT_BY_ID[line.prospectId];
                      const pkg = PACKAGE_BY_ID[line.packageId];
                      return (
                        <li key={line.id} className={styles.line}>
                          <span className={styles.lineWho}>
                            <span className={styles.lineName}>
                              {prospect?.name ?? line.prospectId}
                            </span>
                            {prospect ? (
                              <LaneChip lane={prospect.lane} size="sm" />
                            ) : null}
                          </span>
                          <span className={styles.linePkg}>
                            {pkg?.name ?? line.packageId}
                          </span>
                          <span className={`${styles.lineGuests} num`}>
                            {count(line.guests)} guests
                            <ProvenanceBadge
                              provenance="illustrative"
                              compact
                            />
                          </span>
                          <span className={styles.lineLanes}>
                            {line.lanesHeld === 0 ? (
                              <>
                                <span aria-hidden="true">○</span> holds no
                                lanes
                              </>
                            ) : (
                              <>
                                <span aria-hidden="true">■</span>{" "}
                                <span className="num">
                                  {count(line.lanesHeld)}
                                </span>{" "}
                                {lanesWord(line.lanesHeld)}
                              </>
                            )}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {load.lines.some((l) => l.lanesHeld === 0) ? (
                    <p className={styles.dateAside}>
                      One line on this date holds no lanes at all. Play It
                      Forward is a voucher block rather than a reserved party,
                      and Main Event says plainly that there are no lane
                      reservations against it: groups turn up and use sessions
                      as they are available. Recording three lanes against it
                      would have overstated committed capacity by three lanes,
                      which is exactly the quiet error that makes a capacity
                      chart useless.
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          {/* A hold is not a contract, and this page reads contracts. */}
          {heldNotSigned.length > 0 ? (
            <div className={styles.holds}>
              <h3 className={styles.h3}>
                Held, not signed, and therefore not on the chart above
              </h3>
              <p className={styles.note}>
                The book carries signed lines only, so a date somebody is
                sitting on with nothing countersigned does not consume a lane
                in any figure above. In the building it absolutely blocks the
                evening. Both of those are true at once, which is why these are
                listed here rather than quietly folded into the utilisation.
              </p>
              <ul className={styles.holdList}>
                {heldNotSigned.map((s) => {
                  const prospect = PROSPECT_BY_ID[s.prospectId];
                  const guests = s.discussedHeadcount;
                  return (
                    <li
                      key={`${s.prospectId}-${s.packageId}`}
                      className={styles.holdRow}
                    >
                      <span className={`${styles.holdDate} num`}>
                        {formatDate(s.targetDate ?? "")}
                      </span>
                      <span className={styles.lineName}>
                        {prospect?.name ?? s.prospectId}
                      </span>
                      <StatusChip status="soft-hold" size="sm" />
                      {guests ? (
                        <span className={styles.holdGuests}>
                          <span className="num">{count(guests)}</span> guests
                          discussed, about{" "}
                          <span className="num">
                            {count(lanesForGuests(guests))}
                          </span>{" "}
                          {lanesWord(lanesForGuests(guests))}
                          <ProvenanceBadge provenance="illustrative" compact />
                        </span>
                      ) : (
                        <span className={styles.holdGuests}>
                          No headcount discussed yet
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </section>

        <FitChecker dates={fitDates} presets={presets} />

        {/* ---------------------------------------------------------
            THE STRESS TEST. Labelled as one, on the page.
            --------------------------------------------------------- */}
        <section className={styles.stress} aria-labelledby="stress-h">
          <div className={styles.sectionHead}>
            <h2 className={styles.h2} id="stress-h">
              The stress test, which is not a forecast
            </h2>
            <ProvenanceBadge provenance="modeled" />
          </div>

          <p className={styles.note}>
            Every live conversation converting at once, at the midpoint of its
            modeled headcount range. That will not happen and it is not
            supposed to. It is a load test on the calendar: if the whole
            pipeline landed, would it need a bigger building or a wider
            spread of dates? Those are different problems with different
            answers, and only one of them is anybody&apos;s to solve.
          </p>

          {live.length === 0 ? (
            <p className={styles.empty}>
              <span aria-hidden="true">○</span>
              <span>
                No conversations are live in this period, so there is nothing
                to stress the calendar with. The figure is absent rather than
                shown as zero pressure, because zero pressure sounds like good
                news and an empty pipeline is not.
              </span>
            </p>
          ) : (
            <>
              <div className={styles.stressFigures}>
                <div className={styles.bigFig}>
                  <span className={`${styles.bigValue} num`}>
                    {count(live.length)}
                  </span>
                  <span className={styles.bigLabel}>
                    live conversations, in conversation or holding a date
                  </span>
                  <ProvenanceBadge provenance="illustrative" />
                </div>
                <div className={styles.bigFig}>
                  <span className={`${styles.bigValue} num`}>
                    {count(stress.guests)}
                  </span>
                  <span className={styles.bigLabel}>
                    guests at the midpoint of every modeled range
                  </span>
                  <ProvenanceBadge provenance="modeled" />
                </div>
                <div className={styles.bigFig}>
                  <span className={`${styles.bigValue} num`}>
                    {count(stress.lanes)}
                  </span>
                  <span className={styles.bigLabel}>
                    lane-holds, at one lane per {GUESTS_PER_BOWLING_LANE}
                  </span>
                  <ProvenanceBadge provenance="modeled" />
                </div>
                <div className={styles.bigFig}>
                  <span className={`${styles.bigValue} num`}>
                    {(Math.round((stress.lanes / FLOOR) * 10) / 10).toFixed(1)}
                  </span>
                  <span className={styles.bigLabel}>
                    full evenings of bowling, at the published floor
                  </span>
                  <ProvenanceBadge provenance="modeled" />
                </div>
              </div>

              <p className={styles.stressRead}>{stress.note}</p>

              {/*
                DRAWN AS EVENINGS RATHER THAN AS ONE LONG BAR, because the
                reading that matters is the last line of the selector's own
                note. A single bar 121 lanes long against a floor of 26 looks
                like a building that is 365 percent too small. Five evenings,
                four of them full and one part full, is what the number
                actually describes, and it is a spread problem rather than a
                size one.
              */}
              <ol className={styles.evenings}>
                {evenings.map((lanes, i) => (
                  <li key={i} className={styles.evening}>
                    <span className={styles.eveningLabel}>
                      Evening {i + 1}
                    </span>
                    <LaneBar
                      caption={`Evening ${i + 1} of the stress test. ${lanes} of the ${FLOOR} published lanes used.`}
                      segments={[
                        {
                          key: "used",
                          lanes,
                          label:
                            lanes >= FLOOR
                              ? "used, the whole published floor"
                              : "used",
                          glyph: lanes >= FLOOR ? "◆" : "■",
                          tone:
                            lanes >= FLOOR
                              ? "var(--brand-gold)"
                              : "var(--accent)",
                        },
                        {
                          key: "spare",
                          lanes: FLOOR - lanes,
                          label: "spare on this evening",
                          glyph: "○",
                          tone: "var(--text-2)",
                          hollow: true,
                        },
                      ]}
                    />
                  </li>
                ))}
              </ol>

              {biggest ? (
                <p className={styles.stressRead}>
                  <strong>The concentration is the finding, not the total.</strong>{" "}
                  The largest single conversation in the pipeline is{" "}
                  {biggest.prospect.name}, at a modeled midpoint of{" "}
                  <span className="num">{count(biggest.guests)}</span> guests,
                  which is{" "}
                  <strong className="num">{count(biggest.lanes)}</strong>{" "}
                  {lanesWord(biggest.lanes)} on its own, or{" "}
                  <span className="num">{pct(biggest.lanes / FLOOR)}</span> of
                  the floor.
                  <ProvenanceBadge provenance="modeled" compact /> When one
                  organisation can take most of an evening on its own, the work
                  is not finding more capacity. It is making sure the two
                  biggest conversations in the book are never sold the same
                  night.
                </p>
              ) : null}

              <ul className={styles.liveList}>
                {live.map((p) => {
                  const mid = Math.round((p.headcountLow + p.headcountHigh) / 2);
                  const lanes = lanesForGuests(mid);
                  return (
                    <li key={p.id} className={styles.liveRow}>
                      <span className={styles.lineWho}>
                        <span className={styles.lineName}>{p.name}</span>
                        <LaneChip lane={p.lane} size="sm" />
                      </span>
                      <StatusChip
                        status={furthestStatus(pipeline, p.id)}
                        size="sm"
                        short
                      />
                      <span className={styles.liveGuests}>
                        <span className="num">
                          {count(p.headcountLow)} to {count(p.headcountHigh)}
                        </span>{" "}
                        guests, midpoint{" "}
                        <span className="num">{count(mid)}</span>
                        <ProvenanceBadge provenance="modeled" compact />
                      </span>
                      <span className={`${styles.liveLanes} num`}>
                        {count(lanes)} {lanesWord(lanes)}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <p className={styles.stressFoot}>
                Booked contracts are deliberately left out of this list. They
                are already counted against their dates further up the page,
                and charging the calendar twice for the same party is how a
                stress test ends up describing a busier venue than the one that
                exists. Every headcount here is a range with its basis on the
                prospect row; the midpoint is this page&apos;s arithmetic, not
                a measurement of anything.
              </p>
            </>
          )}
        </section>

        <p className={styles.foot}>
          The lane ratio, the lane floor, every package maximum and the buyout
          ceiling on this page were read off{" "}
          <a href={SOURCE_LINKS.breaLocation} target="_blank" rel="noreferrer">
            the Brea location page
          </a>{" "}
          and{" "}
          <a
            href={SOURCE_LINKS.corporateEvents}
            target="_blank"
            rel="noreferrer"
          >
            Main Event&apos;s corporate events pages
          </a>{" "}
          on 11 August 2026, and each one carries its source URL on{" "}
          <Link to="/packages">the packages screen</Link>. Everything else here
          is those figures multiplied together, with the multiplication shown.{" "}
          <Link to="/method">Every formula and source in this application</Link>
          .
        </p>
      </div>
    </div>
  );
}
