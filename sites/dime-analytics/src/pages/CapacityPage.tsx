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
 * ----- THIS PAGE LOST HALF ITS FIGURES, ON PURPOSE --------------------
 *
 * It was forked from a version built for a venue whose own page
 * published a lane count. Every
 * chart on it divided by that twenty six: utilisation per date, share of
 * the floor per package, evenings of bowling in the stress test, the
 * largest group that still fits. DIME publishes NO BOWLING LANE COUNT
 * FOR ANY LOCATION, including Lakewood Center, which is the nearest
 * store to the office this application is centred on. So there is no
 * denominator, and everything that was a proportion is now a sentence
 * saying why it cannot be one.
 *
 * CARRYING TWENTY SIX ACROSS WAS THE OBVIOUS WRONG ANSWER. It would have
 * kept every bar, every percentage and the whole argument intact, and
 * every one of those figures would have been a claim about another
 * operator's building printed on a page about DIME. A reader who checked
 * it would find nothing on dimeindustries.com to check it against, and would
 * be right to stop trusting the addresses, the package contents and the
 * dates as well. A wrong lane count in front of a DIME reader is the
 * single most damaging thing this document could contain.
 *
 * ----- WHAT SURVIVES, WHICH IS THE HALF WORTH KEEPING -----------------
 *
 * One lane per twenty guests still holds and it needs no house total. A
 * headcount still becomes a lane count, so a 300 guest party still
 * consumes fifteen lanes, the book still totals the lanes held on a
 * date, and the pipeline still totals the lanes it would want. Those are
 * the numbers a rep takes to the store to ask the one question that
 * unlocks the rest. What has gone is every statement about what is left
 * over, because what is left over is the house minus the holds and
 * nobody has published the house.
 *
 * ----- WHY THE ARITHMETIC IS STILL IN THE FILE ------------------------
 *
 * Guarded rather than deleted, everywhere. The subtraction, the division
 * and the multiplication are all correct and all missing one operand.
 * Leaving them readable makes the point the withheld treatment is there
 * to make: the method is sound and the operator withholds the input, so
 * the day somebody rings the store and writes the answer down, this page
 * fills back in without anybody rewriting a formula.
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
 * A grid shaded by fullness is the exact chart that has to signal by
 * colour alone, and most of those squares would be shaded off a
 * denominator that does not exist. The
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

/**
 * The house lane count, which is null on every render.
 *
 * Typed `number | null` rather than left as the literal so that every
 * one of the twenty odd places this page used to divide by it has to
 * pass through a branch and say what it does when there is nothing to
 * divide by. A silent zero, or a default of twenty six, would have
 * produced a page that looked finished and was wrong in a way only a
 * DIME employee could catch.
 */
const HOUSE_LANES: number | null = VENUE.bowlingLanesPublished;

/** The one sentence every absence on this page resolves to. */
const NO_LANE_COUNT =
  "DIME publishes no bowling lane count for any location, including Lakewood Center, the nearest store to this office. There is no house total, so there is no share, no free lanes and no fullness to report. The number comes from the store, not from a page.";

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
 * One horizontal bar, measured in bowling lanes, with the house lane
 * count marked on it where there is one to mark.
 *
 * THE MARKER WAS THE WHOLE REASON THIS WAS A SHARED COMPONENT and it no
 * longer draws. Several things on this page are bigger than the
 * building: a School Lock-In at its published maximum of 800 guests
 * wants forty lanes, and a request that does not fit a date wants more
 * than are free. The rule across the track marked where the house ran
 * out, so a reader could see at a glance which bars overshot it.
 *
 * DIME publishes no lane count for any location, so there is no
 * position on the track to draw the rule at. The bar now scales to its
 * own total and says underneath, in words, that there is no ceiling
 * marked and why. Drawing the rule at twenty six anyway, which is the
 * figure the fork carried off another operator's page, would have put a
 * precise and invented edge on every chart on the page.
 *
 * The bar was always decoration and the key below it was always the
 * data, which is why this degrades as well as it does: every segment
 * still carries its own glyph, its own word and its own figure.
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
  /* Scaled to the house where one is published, and to the bar's own
     total otherwise. The `|| 1` keeps a bar of nothing from dividing by
     zero rather than expressing any opinion about capacity. */
  const scale = Math.max(HOUSE_LANES ?? 0, total) || 1;
  const over = HOUSE_LANES !== null && total > HOUSE_LANES;

  return (
    <div className={styles.barBlock}>
      <div
        className={styles.track}
        role="img"
        aria-label={caption}
        style={
          HOUSE_LANES === null
            ? undefined
            : { ["--markerAt" as string]: `${(HOUSE_LANES / scale) * 100}%` }
        }
        data-over={over ? "true" : "false"}
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
        {over ? <span className={styles.marker} aria-hidden="true" /> : null}
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
      {HOUSE_LANES === null ? (
        <p className={styles.markerNote}>
          <span aria-hidden="true">▩</span>
          <span>
            No ceiling is marked on this bar. DIME publishes no bowling lane
            count for any location, so the bar shows what the booking wants and
            says nothing about what is left.
          </span>
        </p>
      ) : over ? (
        <p className={styles.markerNote}>
          <span aria-hidden="true">▏</span>
          <span>
            The rule across the bar is the published lane count of{" "}
            <span className="num">{HOUSE_LANES}</span> lanes. Everything to the
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
 * headcounts this book actually carries rather than round numbers
 * somebody liked, and an answer that updates as you type and is
 * announced to a screen reader when it changes.
 *
 * THE DATE DEFAULTS TO THE BUSIEST DATE IN THE BOOK, which is a
 * deliberate choice about what a reader discovers first. Defaulting to
 * today, or to an empty field, means the first thing anybody sees is
 * "fits", every time, because an empty calendar takes everything. The
 * interesting half of this tool is the branch where the answer is no,
 * and it should not take a reader three guesses to find it.
 *
 * THE TOOL NOW HAS A THIRD ANSWER AND IT IS THE ONLY ONE IT GIVES. Yes
 * and no both need the house lane count, and DIME publishes none for
 * any location, so the check reports what it can work out and says
 * plainly that it cannot finish. That is a worse tool and an honest one.
 * The alternative was to answer "fits" off a lane count carried over
 * from the fork, which would have told a rep an evening was free on the
 * strength of a building in another city that belongs to somebody
 * else.
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
  /* Free lanes are the house minus what is held, and there is no house.
     `needed` is the half that still works, since it comes off the
     headcount and the published ratio. */
  const free = HOUSE_LANES === null ? null : HOUSE_LANES - held;
  const needed = guestsValid ? lanesForGuests(guestCount) : 0;
  const overflow = free === null ? 0 : Math.max(0, needed - free);

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
            {/*
              THREE STATES, EACH WITH A WORD AND A GLYPH AS WELL AS A
              COLOUR. `result.fits` is null wherever the house lane count
              is unpublished, which is everywhere, and null is rendered
              as its own verdict rather than folded into "does not fit".
              Telling a rep a group does not fit, on arithmetic nobody
              could do, would turn business away for no reason at all.
            */}
            <p
              className={styles.fitVerdict}
              data-fits={
                result?.fits === null
                  ? "unknown"
                  : result?.fits
                    ? "true"
                    : "false"
              }
            >
              <span className={styles.fitGlyph} aria-hidden="true">
                {result?.fits === null ? "▩" : result?.fits ? "●" : "✕"}
              </span>
              <span className={styles.fitWord}>
                {result?.fits === null
                  ? "Cannot be checked"
                  : result?.fits
                    ? "Fits"
                    : "Does not fit"}
              </span>
              <span className={styles.fitOn}>
                <span className="num">{count(guestCount)}</span> guests on{" "}
                <span className="num">{formatDate(date)}</span>
                <ProvenanceBadge provenance="user_input" compact />
              </span>
            </p>

            <p className={styles.fitMessage}>{result?.message}</p>

            <LaneBar
              caption={
                free === null
                  ? `${date}. ${held} lanes already held, ${needed} lanes needed for ${guestCount} guests. How many lanes would be left cannot be given, because no lane count is published for the house.`
                  : `${date}. ${held} lanes already held, ${needed} lanes needed for ${guestCount} guests, ${Math.max(
                      0,
                      free - needed,
                    )} lanes still free of the published ${HOUSE_LANES}.`
              }
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
                  lanes:
                    free === null ? needed : Math.min(needed, Math.max(free, 0)),
                  label: `needed for ${count(guestCount)} guests`,
                  glyph: "◆",
                  tone: "var(--brand-gold)",
                },
                {
                  key: "over",
                  lanes: overflow,
                  label: "asked for beyond the published lane count",
                  glyph: "✕",
                  tone: "var(--risk)",
                },
                {
                  key: "free",
                  /* Nothing can be drawn as free when nothing is known
                     to be free. Zero here means the segment does not
                     render, and the note under the bar says why. */
                  lanes: free === null ? 0 : Math.max(0, free - needed),
                  label: "still free after this booking",
                  glyph: "○",
                  tone: "var(--text-2)",
                  hollow: true,
                },
              ]}
            />

            {/* A statement about lanes, not about the building. */}
            {result?.fits === null ? (
              <p
                className={styles.fitAside}
                title={NO_LANE_COUNT}
              >
                <strong>What is missing, and who has it.</strong> The lanes
                this group needs are worked out above at one lane per{" "}
                {GUESTS_PER_BOWLING_LANE}. The lanes the house has are not
                published for any DIME location, so that is the question to
                put to the store, and the answer belongs in the record rather
                than in somebody&apos;s head.
              </p>
            ) : !result?.fits ? (
              <p
                className={styles.fitAside}
                title="This does not say the building cannot hold the people. It says the lanes are gone."
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

  /**
   * The stress test drawn as whole evenings of the house, which is an
   * empty list because an evening of the house is not a published
   * quantity.
   *
   * The loop is the right loop. It fills evening after evening until the
   * pipeline's lane-holds are used up, and it needs to know how many
   * lanes an evening holds. DIME publishes that for no location, so
   * there is nothing to fill and the section says so in words instead of
   * drawing bars against an invented ceiling.
   */
  const evenings = useMemo(() => {
    const out: number[] = [];
    if (HOUSE_LANES === null) return out;
    let left = stress.lanes;
    while (left > 0 && out.length < 12) {
      out.push(Math.min(left, HOUSE_LANES));
      left -= HOUSE_LANES;
    }
    return out;
  }, [stress.lanes]);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Capacity</p>
          <h1 className={styles.h1}>What a group actually holds</h1>
          {/* The title used to name a lane count. It cannot, because
              DIME publishes none, and a heading is the last place to
              put a number nobody can check. */}
          <p className={styles.subLede} title={NO_LANE_COUNT}>
            One lane per {GUESTS_PER_BOWLING_LANE} guests. How many lanes the
            house has is not published, so nothing here is a share of the
            building.
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
            One published figure, one that is withheld
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
                The ratio, which still holds
                <ProvenanceBadge provenance="public" compact />
              </span>
              <span className={styles.termNote}>
                A published way to size a group against lanes, and the only
                input on this page that has a value.
              </span>
            </li>

            <li className={styles.term}>
              <span className={styles.termIndex} aria-hidden="true">
                2
              </span>
              <span className={styles.termValue}>Not published</span>
              <span className={styles.termLabel}>
                Bowling lanes in the house
                <ProvenanceBadge provenance="withheld" compact />
              </span>
              <span className={styles.termNote}>
                DIME publishes no lane count for any location, including
                Lakewood Center. There is no floor and no ceiling to compute
                against.
              </span>
            </li>

            <li className={styles.term}>
              <span className={styles.termIndex} aria-hidden="true">
                3
              </span>
              <span className={styles.termValue}>Say so</span>
              <span className={styles.termLabel}>
                The one decision made here
                <ProvenanceBadge provenance="withheld" compact />
              </span>
              <span className={styles.termNote}>
                The forked version divided by twenty six, read off another
                operator&apos;s page. Nothing is carried across, so every
                figure that needed the house reads as a sentence.
              </span>
            </li>
          </ol>

          {/*
            THE EQUALS LINE HAS NO PRODUCT. Lane count times guests per
            lane is the right multiplication and one operand is
            withheld, so the sum is stated and the answer is the
            withheld sentence rather than a figure.
          */}
          <p className={styles.equals}>
            <span className={styles.equalsSum}>
              An unpublished number of lanes at{" "}
              <span className="num">{GUESTS_PER_BOWLING_LANE}</span> guests
              each
            </span>
            <span className={styles.equalsValue}>
              {MAX_SIMULTANEOUS_BOWLERS === null
                ? "Not computable"
                : count(MAX_SIMULTANEOUS_BOWLERS)}
            </span>
            <span className={styles.equalsLabel}>
              guests bowling at one time
              <ProvenanceBadge provenance="withheld" />
            </span>
          </p>
        </section>

        {/* ---------------------------------------------------------
            A BOWLING NUMBER AND A BUILDING NUMBER. ONLY ONE OF THEM
            CAN STILL BE PRINTED.
            --------------------------------------------------------- */}
        <section className={styles.twoFigures} aria-labelledby="both-h">
          <div className={styles.bothBody}>
            <h2 className={styles.h2} id="both-h">
              Two figures, two different things
            </h2>
            {/*
              THIS PANEL EXISTED TO STOP ONE NUMBER BEING QUOTED AS THE
              OTHER: 520 bowling at once against a published buyout
              maximum of 800 or more. The bowling half needed the lane
              count and is gone, so what is left is the distinction
              itself, which is still worth making. A rep who has only a
              building number in their head will quote it for lanes.
            */}
            <p className={styles.bothText}>
              <strong>A bowling number cannot be given.</strong> Guests on a
              lane at one time is the lane count times the guests each lane
              takes, and DIME publishes no lane count for any location.
            </p>
            <p className={styles.bothText}>
              <strong>
                {buyoutMax === null ? (
                  "A building number is a different measurement."
                ) : (
                  <>
                    <span className="num">{count(buyoutMax)}</span> or more is a
                    building number.
                  </>
                )}
              </strong>{" "}
              A whole-site figure counts everybody through the door, bowling or
              not, so it can never answer a question about lanes.
            </p>
          </div>

          <div className={styles.bothFigures}>
            <div className={styles.bigFig}>
              <span className={styles.bigValue}>
                {MAX_SIMULTANEOUS_BOWLERS === null
                  ? "Not published"
                  : count(MAX_SIMULTANEOUS_BOWLERS)}
              </span>
              <span className={styles.bigLabel}>
                guests bowling at once, which needs a lane count nobody
                publishes
              </span>
              <ProvenanceBadge provenance="withheld" />
            </div>
            <div className={styles.bigFig}>
              <span className={`${styles.bigValue} num`}>
                {buyoutMax === null ? "Not published" : `${count(buyoutMax)}+`}
              </span>
              <span className={styles.bigLabel}>
                guests at a full site buyout, which DIME does not publish
                either
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
              How many lanes each package holds at its own published maximum
            </h2>
            <ProvenanceBadge provenance="modeled" />
          </div>

          {/* Not a forecast of demand. What a package would consume if sold
              at the size it is published as being sellable at. The heading
              used to say "how much of the floor", and that half is gone
              with the lane count. */}
          <p className={styles.note}>
            Published maximum guest count times the published one-lane-per-
            twenty rule. What share of the house that is cannot be given,
            because no lane count is published for any location.
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
                            value={`${count(row.lanesAtMax)} ${lanesWord(
                              row.lanesAtMax,
                            )}`}
                            provenance="modeled"
                            compact
                          />
                        </span>
                        {/*
                          THE SHARE CELL KEEPS ITS PLACE AND LOSES ITS
                          NUMBER. `row.shareOfVenue` is null on every
                          row, so `Figure` short-circuits to the withheld
                          sentence. Passing zero per cent instead would
                          have read as a package that takes none of the
                          building, which is the opposite of true.
                        */}
                        <span className={styles.numCell}>
                          <span className={styles.numLabel}>
                            Share of the house
                          </span>
                          <Figure
                            value={
                              row.shareOfVenue === null
                                ? null
                                : pct(row.shareOfVenue)
                            }
                            provenance={
                              row.shareOfVenue === null ? "withheld" : "modeled"
                            }
                            withheldReason={NO_LANE_COUNT}
                            compact
                          />
                        </span>
                      </div>

                      <LaneBar
                        caption={
                          row.shareOfVenue === null
                            ? `${row.name} at its published maximum of ${row.maxGuests} guests takes ${row.lanesAtMax} lanes. What share of the house that is cannot be given, because no lane count is published.`
                            : `${row.name} at its published maximum of ${row.maxGuests} guests takes ${row.lanesAtMax} of the ${HOUSE_LANES} published lanes, which is ${pct(
                                row.shareOfVenue,
                              )} of the house.`
                        }
                        segments={[
                          {
                            key: "used",
                            lanes:
                              HOUSE_LANES === null
                                ? row.lanesAtMax
                                : Math.min(row.lanesAtMax, HOUSE_LANES),
                            label:
                              HOUSE_LANES === null
                                ? "held at the published maximum"
                                : "of the published lane count",
                            glyph: over ? "▲" : heavy ? "◆" : "■",
                            tone: over
                              ? "var(--risk)"
                              : heavy
                                ? "var(--brand-gold)"
                                : "var(--accent)",
                          },
                          {
                            key: "over",
                            lanes:
                              HOUSE_LANES === null
                                ? 0
                                : Math.max(0, row.lanesAtMax - HOUSE_LANES),
                            label: "beyond the published lane count",
                            glyph: "✕",
                            tone: "var(--risk)",
                          },
                        ]}
                      />

                      {/*
                        The note used to appear only on the heavy rows,
                        because only a heavy row had anything to warn
                        about. `heavy` needs the share and is false
                        everywhere now, so the note is shown on every row
                        instead: it carries the lanes and the reason
                        there is no share, which is the whole of what is
                        left to say.
                      */}
                      {heavy || row.shareOfVenue === null ? (
                        <p
                          className={styles.pressureNote}
                          data-heavy={heavy ? "true" : undefined}
                        >
                          <span aria-hidden="true">
                            {over ? "✕" : heavy ? "▲" : "▩"}
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
              {/*
                THE CALLOUT LOST ITS PUNCHLINE AND KEPT ITS PREMISE.
                It used to end "that is 58% of the floor, and the second
                one has to be told no". That conclusion needed the house
                lane count. What is left is the lane demand, which is
                still the number a rep has to carry, and the honest
                statement that nobody can say what it consumes.
              */}
              <p className={styles.calloutText}>
                A <span className="num">{count(headline.maxGuests)}</span>
                -guest {headline.name}, at its published maximum, takes{" "}
                <strong className="num">{count(headline.lanesAtMax)}</strong>{" "}
                {lanesWord(headline.lanesAtMax)} on one evening. Whether a
                second booking of that size could sit beside it is not
                answerable from any published page, because DIME gives no
                lane count for any location. That is the first question for the
                store and the reason a person does this job rather than a
                website.
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

          {/*
            Lanes held are derived from each line's headcount and never
            typed, so that half of every row below is still real.

            THE FULLNESS TEST NO LONGER FIRES. A date was called
            effectively full below three free lanes, and free lanes are
            the house total minus what is held. DIME publishes no lane
            count for any location, so there are no free lanes to count,
            `effectivelyFull` is null on every row, and the state reads
            "cannot be checked" rather than "room on this date". Reading
            room off a missing denominator is the exact promise this page
            was built to stop.
          */}
          <p className={styles.note} title={NO_LANE_COUNT}>
            Read live off <Link to="/book">the Book</Link>. Whether a date is
            effectively full cannot be checked, because no lane count is
            published for the house.
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
                    {/* The state carries a word as well as a colour, and
                        the third word is the only one that fires now. */}
                    <span
                      className={styles.dateState}
                      data-full={
                        load.effectivelyFull === null
                          ? "unknown"
                          : load.effectivelyFull
                            ? "true"
                            : "false"
                      }
                    >
                      <span aria-hidden="true">
                        {load.effectivelyFull === null
                          ? "▩"
                          : load.effectivelyFull
                            ? "✕"
                            : "●"}
                      </span>
                      <span>
                        {load.effectivelyFull === null
                          ? "Fullness cannot be checked"
                          : load.effectivelyFull
                            ? "Effectively full"
                            : "Room on this date"}
                      </span>
                    </span>
                  </div>

                  <div className={styles.dateStats}>
                    <span className={styles.numCell}>
                      <span className={styles.numLabel}>Lanes held</span>
                      <Figure
                        value={`${count(load.lanesHeld)} ${lanesWord(
                          load.lanesHeld,
                        )}`}
                        provenance="modeled"
                        compact
                      />
                    </span>
                    {/*
                      Three cells that were figures and are now the
                      withheld sentence. Free lanes, utilisation and the
                      largest group that still fits all start from the
                      house total minus what is held, and there is no
                      house total. Rendering zero free, zero per cent
                      utilised or a group of zero would each be a
                      confident wrong answer rather than an absent one.
                    */}
                    <span className={styles.numCell}>
                      <span className={styles.numLabel}>Lanes free</span>
                      <Figure
                        value={
                          load.lanesFree === null ? null : count(load.lanesFree)
                        }
                        provenance={
                          load.lanesFree === null ? "withheld" : "modeled"
                        }
                        withheldReason={NO_LANE_COUNT}
                        compact
                      />
                    </span>
                    <span className={styles.numCell}>
                      <span className={styles.numLabel}>Utilisation</span>
                      <Figure
                        value={
                          load.utilisation === null
                            ? null
                            : pct(load.utilisation)
                        }
                        provenance={
                          load.utilisation === null ? "withheld" : "modeled"
                        }
                        withheldReason={NO_LANE_COUNT}
                        compact
                      />
                    </span>
                    <span className={styles.numCell}>
                      <span className={styles.numLabel}>
                        Largest group that still fits
                      </span>
                      <Figure
                        value={
                          load.lanesFree === null
                            ? null
                            : `${count(
                                load.lanesFree * GUESTS_PER_BOWLING_LANE,
                              )} guests`
                        }
                        provenance={
                          load.lanesFree === null ? "withheld" : "modeled"
                        }
                        withheldReason={NO_LANE_COUNT}
                        compact
                      />
                    </span>
                  </div>

                  <LaneBar
                    caption={
                      load.lanesFree === null
                        ? `${load.date}. ${load.lanesHeld} lanes are held by signed bookings. How many are free cannot be given, because no lane count is published for the house.`
                        : `${load.date}. ${load.lanesHeld} of the ${HOUSE_LANES} published lanes are held, ${load.lanesFree} are free, which is ${pct(
                            load.utilisation ?? 0,
                          )} utilisation.`
                    }
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
                        /* Nothing is drawn free, because nothing is known
                           to be free. The note under the bar says so. */
                        lanes: load.lanesFree ?? 0,
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
                      One line on this date holds no lanes at all. A voucher
                      block is not a reserved party: nothing is held against
                      it and the group turns up and uses whatever is
                      available. Recording three lanes against it would have
                      overstated committed capacity by three lanes, which is
                      exactly the quiet error that makes a capacity chart
                      useless.
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
                {/*
                  The fourth figure was the one that changed the reading:
                  lane-holds divided by the house, which turned a
                  frightening total into a handful of evenings. It needs
                  a denominator and there is none, so the tile carries
                  the word instead of a number.
                */}
                <div className={styles.bigFig}>
                  <span className={styles.bigValue}>
                    {stress.eveningsOfBowling === null
                      ? "Not published"
                      : stress.eveningsOfBowling.toFixed(1)}
                  </span>
                  <span className={styles.bigLabel}>
                    full evenings of bowling, which needs a lane count nobody
                    publishes
                  </span>
                  <ProvenanceBadge provenance="withheld" />
                </div>
              </div>

              <p className={styles.stressRead}>{stress.note}</p>

              {/*
                DRAWN AS EVENINGS RATHER THAN AS ONE LONG BAR, because the
                reading that mattered was the last line of the selector's
                own note: a hundred and twenty lane-holds against a house
                of twenty six is not a building three times too small, it
                is five evenings, and that is a spread problem rather than
                a size one.

                THE EVENINGS CANNOT BE DRAWN NOW. Splitting a total into
                evenings requires knowing how many lanes an evening holds,
                and DIME publishes that for no location, so `evenings`
                is empty on every render and the list renders nothing. The
                paragraph below replaces it, because a section that simply
                went quiet would read as a bug rather than as an absence.
                This is the biggest single thing this page lost.
              */}
              {evenings.length === 0 ? (
                <p className={styles.empty}>
                  <span aria-hidden="true">▩</span>
                  <span>
                    The pipeline cannot be drawn as evenings. Splitting{" "}
                    <span className="num">{count(stress.lanes)}</span>{" "}
                    lane-holds into nights needs the number of lanes a night
                    holds, and DIME publishes no lane count for any location.
                    So the total above is a real figure and the reassuring
                    reading that used to sit under it, that this is a handful
                    of evenings rather than a building too small, cannot
                    honestly be given here.
                  </span>
                </p>
              ) : (
                <ol className={styles.evenings}>
                  {evenings.map((lanes, i) => (
                    <li key={i} className={styles.evening}>
                      <span className={styles.eveningLabel}>
                        Evening {i + 1}
                      </span>
                      <LaneBar
                        caption={`Evening ${i + 1} of the stress test. ${lanes} of the ${HOUSE_LANES} published lanes used.`}
                        segments={[
                          {
                            key: "used",
                            lanes,
                            label:
                              HOUSE_LANES !== null && lanes >= HOUSE_LANES
                                ? "used, the whole published lane count"
                                : "used",
                            glyph:
                              HOUSE_LANES !== null && lanes >= HOUSE_LANES
                                ? "◆"
                                : "■",
                            tone:
                              HOUSE_LANES !== null && lanes >= HOUSE_LANES
                                ? "var(--brand-gold)"
                                : "var(--accent)",
                          },
                          {
                            key: "spare",
                            lanes: (HOUSE_LANES ?? lanes) - lanes,
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
              )}

              {biggest ? (
                <p className={styles.stressRead}>
                  <strong>The concentration is the finding, not the total.</strong>{" "}
                  The largest single conversation in the pipeline is{" "}
                  {biggest.prospect.name}, at a modeled midpoint of{" "}
                  <span className="num">{count(biggest.guests)}</span> guests,
                  which is{" "}
                  <strong className="num">{count(biggest.lanes)}</strong>{" "}
                  {lanesWord(biggest.lanes)} on its own.
                  {HOUSE_LANES === null ? (
                    <>
                      {" "}
                      What share of an evening that is cannot be given, because
                      no lane count is published for any DIME location.
                      <ProvenanceBadge provenance="withheld" compact />
                    </>
                  ) : (
                    <>
                      {" "}
                      That is{" "}
                      <span className="num">
                        {pct(biggest.lanes / HOUSE_LANES)}
                      </span>{" "}
                      of the house.
                      <ProvenanceBadge provenance="modeled" compact />
                    </>
                  )}{" "}
                  When one organisation can take a block of lanes that size on
                  its own, the work is not finding more capacity. It is making
                  sure the two biggest conversations in the book are never sold
                  the same night.
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
          The package contents on this page were read off published pages. A
          lane count was not, because none is published for any location, and
          neither was a guest maximum, a capacity or a price, which is why so
          much of this screen is a sentence rather than a figure. The pages
          are{" "}
          <a href={SOURCE_LINKS.nearestStore} target="_blank" rel="noreferrer">
            the nearest store page
          </a>{" "}
          and{" "}
          <a href={SOURCE_LINKS.bookAParty} target="_blank" rel="noreferrer">
            the party booking page
          </a>
          , and each one carries its source URL on{" "}
          <Link to="/packages">the packages screen</Link>. Everything else here
          is those figures multiplied together, with the multiplication shown,
          and everything that would have needed a lane count says so.{" "}
          <Link to="/method">Every formula and source in this application</Link>
          .
        </p>
      </div>
    </div>
  );
}
