import { groupProfile } from "@/domain/booking";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Provenance } from "@/domain/types";
import { VENUE } from "@/data/venue";
import { PACKAGE_BY_ID } from "@/data/packages";
import { PROSPECT_BY_ID, PROSPECTS } from "@/data/prospects";
import { DOORS_PER_CREW_SLOT, crewSlotsForDoors } from "@/domain/lanes";
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
 * SEASONAL DEMAND AND CAMPAIGN CAPACITY. The screen that stops a
 * marketing desk generating a week of work the crew cannot run.
 *
 * ----- WHY THIS IS A PAGE AND NOT A TOOLTIP ---------------------------
 *
 * The constraint on a home services campaign is never the number of
 * leads. It is the hours behind them. A precision tune-up takes an hour
 * of one technician; an emergency full system replacement takes a crew
 * for a day. Both arrive through the same 47 dollar coupon, and only one
 * of them can be run twenty six times on a Tuesday.
 *
 * So this page multiplies two figures out loud: twenty six crew slots a
 * day at the Brea branch, and twenty properties to a slot. At those
 * numbers a campaign with a published ceiling of three hundred doors
 * consumes fifteen slots, which is well over half a working day of the
 * whole branch, and a second campaign landing on the same week is a
 * promise somebody has to break.
 *
 * ----- THE JUDGEMENT, DECLARED AT THE TOP RATHER THAN IN A FOOTNOTE ---
 *
 * NEITHER NUMBER IS PUBLISHED. Champions Group publishes "over 1,800
 * field technicians" and "over 2,400 combined employees" across twenty
 * two brands, and no brand publishes a truck count, a crew count or a
 * job duration anywhere retrievable. Both figures here are this
 * console's own assumptions, set low on purpose so every figure on the
 * page understates the field and none of them can oversell it, and both
 * carry a modeled badge wherever they surface. A capacity chart whose
 * assumptions are hidden is a chart nobody can argue with; this one can
 * be argued with in fifteen seconds, and the argument is the point.
 *
 * ----- WHAT AUGUST ACTUALLY MEANS -------------------------------------
 *
 * Mid-August is the TAIL of peak cooling, not the middle of it. July is
 * the apex: AC repair runs 266 per cent above baseline and the mix skews
 * to emergency full system replacement, which swings 393 per cent.
 * Inland valleys hold cooling demand into September while the coast
 * cools first, so the territory does not turn over on one date. Heating
 * campaigns have to be built now to launch in September and October, and
 * the heat pump is the one message that carries across the pivot because
 * it sells against both halves of the year.
 *
 * The commercial consequence is the whole reason this screen exists.
 * Marketing that fills the tail of the season with cheap tune-up leads
 * while the crew is buried on emergency replacements costs the company
 * money twice: once for the clicks and once for the jobs the crew could
 * not get to.
 *
 * ----- WHY 520 AND THE CAMPAIGN CEILING ARE BOTH TRUE -----------------
 *
 * Twenty six slots at twenty properties is 520 properties served in a
 * day. The largest campaign in the offer table publishes a far bigger
 * ceiling than that, because a campaign ceiling is a REACH number and
 * 520 is a FIELD number. Quote the field number as reach and the
 * campaign is undersold; quote the reach as field capacity and the desk
 * has generated work the trucks cannot run. Both mistakes are made on
 * the phone, in the first thirty seconds, by somebody who has never had
 * the two numbers side by side.
 *
 * ----- WHAT THIS PAGE READS FROM, AND WHY IT MATTERS ------------------
 *
 * The dates come from useBook() rather than from a seed, and the stress
 * test comes from usePipeline() rather than from a stored total. Change
 * a property count on the Book page and the utilisation on a date here
 * moves before you have finished walking back to this tab. A capacity
 * chart that is a stored snapshot rather than a selector is one that
 * will eventually disagree with the ledger it was copied from, in front
 * of a customer.
 *
 * ----- THE ALTERNATIVE THAT WAS REJECTED ------------------------------
 *
 * The obvious build is a month grid shaded by how full each day is. It
 * was not built. A grid shaded by fullness signals by colour alone, and
 * the owner of this codebase is colourblind. The list below carries the
 * same information with the numbers written on it, and it degrades to a
 * printout somebody can take into a Monday operations call.
 *
 * ----- EVERY BAR CARRIES ITS NUMBER -----------------------------------
 *
 * That rule holds everywhere in this application and it is enforced hard
 * here, because this page is an argument about arithmetic. A bar with no
 * figure on it asks the reader to take the multiplication on trust,
 * which is the one thing this screen exists not to do.
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
 * locale formatter in California prints the eleventh. An install date
 * that is one day early on the screen somebody is checking a held slot
 * against is not a rounding error, it is a wrong answer.
 */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

const count = (n: number) => n.toLocaleString("en-US");
const pct = (n: number) => `${Math.round(n * 100)}%`;
const lanesWord = (n: number) => (n === 1 ? "crew slot" : "crew slots");

const FLOOR = VENUE.crewSlotsModelledFloor;

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
 * One horizontal bar, measured in crew slots, with the modelled daily
 * capacity marked on it.
 *
 * THE MARKER IS THE WHOLE REASON THIS IS A SHARED COMPONENT. Several
 * things on this page are bigger than a day of the branch: a campaign at
 * its published ceiling can want forty slots, and a job volume that does
 * not fit a date wants more than are free. A chart that clipped those to
 * the edge of the track would hide the single most useful fact in the
 * row, and one that silently rescaled would make a forty slot campaign
 * look the same width as a twenty six slot one.
 *
 * So the track is scaled to whichever is larger, the daily capacity or
 * the total, and a labelled rule is drawn at twenty six slots. Anything
 * to the right of that rule is work that has to move to another day or
 * be turned away. Every segment carries its own glyph, its own word and
 * its own figure underneath, so the bar is decoration and the key below
 * it is the data.
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
            The rule across the bar is the modelled working day of{" "}
            <span className="num">{FLOOR}</span> crew slots at Brea.
            Everything to the right of it is work that has to move to
            another day.
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
 * This is the only part of the page a person would open with a property
 * manager on the phone, so it is built as a real form rather than a
 * demonstration of one: labelled fields, a number pad on a phone,
 * presets that are the published ceilings of actual campaigns rather
 * than round numbers somebody liked, and an answer that updates as you
 * type and is announced to a screen reader when it changes.
 *
 * THE DATE DEFAULTS TO THE BUSIEST DAY IN THE BOOK, which is a
 * deliberate choice about what a reader discovers first. Defaulting to
 * today, or to an empty field, means the first thing anybody sees is
 * "fits", every time, because a thin calendar always fits. The
 * interesting half of this tool is the branch where the answer is no,
 * and it should not take three guesses to find it.
 */
function FitChecker({
  dates,
  presets,
}: {
  /** Days already carrying committed work, busiest first. */
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
  const needed = guestsValid ? crewSlotsForDoors(guestCount) : 0;
  const overflow = Math.max(0, needed - free);

  return (
    <section className={styles.fit} id="fit" aria-labelledby="fit-h">
      <div className={styles.sectionHead}>
        <h2 className={styles.h2} id="fit-h">
          Does this much work fit on this day?
        </h2>
        <ProvenanceBadge provenance="modeled" />
      </div>

      <div className={styles.fitForm}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="fit-date">
            Day of work
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
                Days already carrying committed work
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
                        ? "no crew slots committed"
                        : `${count(d.lanesHeld)} ${lanesWord(d.lanesHeld)} committed`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="fit-guests">
            Properties
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
              Published campaign ceilings, so the number means something
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
                ? "Pick a day and a number of properties. Nothing in the book commits a crew slot on a day nobody has chosen, so an unset date would answer yes to everything."
                : "Type a number of properties above. Zero properties is not a job, so there is nothing to check yet."}
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
                <span className="num">{count(guestCount)}</span> properties on{" "}
                <span className="num">{formatDate(date)}</span>
                <ProvenanceBadge provenance="user_input" compact />
              </span>
            </p>

            <p className={styles.fitMessage}>{result?.message}</p>

            <LaneBar
              caption={`${date}. ${held} crew slots already committed, ${needed} needed for ${guestCount} properties, ${Math.max(
                0,
                free - needed,
              )} still free of the modelled ${FLOOR} a day.`}
              segments={[
                {
                  key: "held",
                  lanes: held,
                  label: "already committed to signed work",
                  glyph: "■",
                  tone: "var(--ledger-revenue)",
                },
                {
                  key: "needed",
                  lanes: Math.min(needed, Math.max(free, 0)),
                  label: `needed for ${count(guestCount)} properties`,
                  glyph: "◆",
                  tone: "var(--brand-gold)",
                },
                {
                  key: "over",
                  lanes: overflow,
                  label: "asked for beyond the modelled working day",
                  glyph: "✕",
                  tone: "var(--risk)",
                },
                {
                  key: "free",
                  lanes: Math.max(0, free - needed),
                  label: "still free after this work",
                  glyph: "○",
                  tone: "var(--text-2)",
                  hollow: true,
                },
              ]}
            />

            {/* A statement about the field on one day, not about how many
                doors a campaign can reach. The two are always confused. */}
            {!result?.fits ? (
              <p
                className={styles.fitAside}
                title="This says nothing about how many properties a campaign can reach. It says the crew cannot run this much work on this day at the modelled ratio."
              >
                <strong>A statement about the crew, not the campaign.</strong>{" "}
                This much work does not fit this day at one crew slot per{" "}
                {DOORS_PER_CREW_SLOT} properties. Moving it a week is
                usually cheaper than turning it down.
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
   * "Live" is in conversation or holding a slot, and it deliberately
   * excludes booked. Signed work is already sitting in the days above
   * with its crew slots counted; adding it here as well would charge the
   * calendar twice for the same job, which is the classic way a pipeline
   * stress test ends up describing a busier branch than the real one.
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
   * A held slot blocks a crew in the real world and it is not signed
   * work, so it is not in the ledger the chart above is built from.
   * Leaving that unsaid would be the quiet kind of wrong: the reader
   * would see an empty week and have no way to know a property manager
   * is sitting on the Tuesday of it.
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

  /** Presets for the fit checker, from real published campaign ceilings. */
  const presets = useMemo(() => {
    const seen = new Map<number, string>();
    for (const p of pressure) {
      if (p.maxGuests && !seen.has(p.maxGuests)) seen.set(p.maxGuests, p.name);
    }
    return [...seen.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([guests, name]) => ({ guests, name: `${name} at its ceiling` }));
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
    (p) => p.packageId === "rival-nexgen-protection",
  );
  const buyout = PACKAGE_BY_ID["replacement-band"];
  const buyoutMax = buyout?.maxGuests ?? null;

  /** The single largest live conversation, in crew slots. */
  const biggest = useMemo(() => {
    if (live.length === 0) return null;
    return live
      .map((p) => {
        const mid = (groupProfile(p)?.mid ?? 0);
        return { prospect: p, guests: mid, lanes: crewSlotsForDoors(mid) };
      })
      .sort((a, b) => b.lanes - a.lanes)[0];
  }, [live]);

  /** The stress test drawn as whole working days of the modelled field. */
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
          <p className={styles.eyebrow}>Seasonal demand and campaign capacity</p>
          <h1 className={styles.h1}>What 26 crew slots a day will hold</h1>
          {/* Both figures are assumptions and are set low on purpose, so
              every figure here understates the field rather than the
              reverse. Nobody publishes either of them. */}
          <p
            className={styles.subLede}
            title="No Champions brand publishes a crew count, a truck count or a job duration. Both figures below are this console's own, set low so the page understates the field."
          >
            One crew slot per {DOORS_PER_CREW_SLOT} properties, against a
            modelled working day of {FLOOR} slots. Mid-August is the tail of
            peak cooling, so the heating campaign has to be built now.
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
            Two assumptions and one decision about how to use them
          </h2>

          <ol className={styles.termList}>
            <li className={styles.term}>
              <span className={styles.termIndex} aria-hidden="true">
                1
              </span>
              <span className={`${styles.termValue} num`}>
                1 slot per {DOORS_PER_CREW_SLOT}
              </span>
              <span className={styles.termLabel}>
                Properties one crew can serve in a day
                <ProvenanceBadge provenance="modeled" compact />
              </span>
              <span className={styles.termNote}>
                This console&apos;s own planning ratio. No brand in the group
                publishes a job duration, so nothing here is read off a site.
              </span>
            </li>

            <li className={styles.term}>
              <span className={styles.termIndex} aria-hidden="true">
                2
              </span>
              <span className={`${styles.termValue} num`}>
                {FLOOR} a day
              </span>
              <span className={styles.termLabel}>
                Crew slots assumed at the Brea branch
                <ProvenanceBadge provenance="modeled" compact />
              </span>
              <span className={styles.termNote}>
                Champions Group publishes over 1,800 field technicians across
                twenty two brands and no per-branch count. This is an
                assumption, not a division of that figure.
              </span>
            </li>

            <li className={styles.term}>
              <span className={styles.termIndex} aria-hidden="true">
                3
              </span>
              <span className={`${styles.termValue} num`}>Set it low</span>
              <span className={styles.termLabel}>
                The one decision made here
                <ProvenanceBadge provenance="modeled" compact />
              </span>
              <span className={styles.termNote}>
                Understating the field means the page turns work away that
                might have fitted. Overstating it books work the trucks cannot
                run, and only one of those two is recoverable.
              </span>
            </li>
          </ol>

          <p className={styles.equals}>
            <span className={styles.equalsSum}>
              <span className="num">{FLOOR}</span> crew slots at{" "}
              <span className="num">{DOORS_PER_CREW_SLOT}</span> properties
              each
            </span>
            <span className={`${styles.equalsValue} num`}>
              {count(MAX_SIMULTANEOUS_BOWLERS)}
            </span>
            <span className={styles.equalsLabel}>
              properties the field could serve in one day
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
            {/* One is a field number and one is a reach number. Quoting
                either as the other is the mistake this panel exists to
                stop, and it is made on the phone constantly. */}
            <p className={styles.bothText}>
              <strong>
                <span className="num">{count(MAX_SIMULTANEOUS_BOWLERS)}</span>{" "}
                is a field number.
              </strong>{" "}
              Properties the crew could serve in one day, at the modelled ratio
              against the modelled working day.
            </p>
            <p className={styles.bothText}>
              <strong>
                {buyoutMax === null ? (
                  "The largest campaign ceiling is a reach number."
                ) : (
                  <>
                    <span className="num">{count(buyoutMax)}</span> or more is a
                    reach number.
                  </>
                )}
              </strong>{" "}
              The published ceiling on the largest campaign in the offer table,
              which is how many doors it may be quoted to rather than how many
              the field can visit.
            </p>
          </div>

          <div className={styles.bothFigures}>
            <div className={styles.bigFig}>
              <span className={`${styles.bigValue} num`}>
                {count(MAX_SIMULTANEOUS_BOWLERS)}
              </span>
              <span className={styles.bigLabel}>
                properties served in a day, at the modelled working day
              </span>
              <ProvenanceBadge provenance="modeled" />
            </div>
            <div className={styles.bigFig}>
              <span className={`${styles.bigValue} num`}>
                {buyoutMax === null ? "Not published" : `${count(buyoutMax)}+`}
              </span>
              <span className={styles.bigLabel}>
                doors at the largest campaign ceiling published in the offer
                table
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
              How much of a working day each campaign eats at its own published
              ceiling
            </h2>
            <ProvenanceBadge provenance="modeled" />
          </div>

          {/* Not a forecast of demand. What a campaign would consume if it
              landed at the size its own published terms allow. */}
          <p className={styles.note}>
            Published ceiling times the modelled one slot per twenty
            properties. Nothing here predicts how many leads a campaign
            actually produces.
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
                          aria-label={`${row.name} publishes no ceiling, so there is nothing to compute a share against.`}
                        />
                        <p className={styles.noMax}>
                          <span aria-hidden="true">○</span>
                          <span>
                            No published ceiling
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
                            Published ceiling
                          </span>
                          <Figure
                            value={`${count(row.maxGuests)} properties`}
                            provenance={
                              (pkg?.provenance.maxGuests as Provenance) ??
                              "public"
                            }
                            compact
                          />
                        </span>
                        <span className={styles.numCell}>
                          <span className={styles.numLabel}>
                            Crew slots at that size
                          </span>
                          <Figure
                            value={`${count(row.lanesAtMax)} of ${FLOOR}`}
                            provenance="modeled"
                            compact
                          />
                        </span>
                        <span className={styles.numCell}>
                          <span className={styles.numLabel}>
                            Share of a working day
                          </span>
                          <Figure
                            value={pct(row.shareOfVenue ?? 0)}
                            provenance="modeled"
                            compact
                          />
                        </span>
                      </div>

                      <LaneBar
                        caption={`${row.name} at its published ceiling of ${row.maxGuests} properties takes ${row.lanesAtMax} of the ${FLOOR} modelled crew slots, which is ${pct(
                          row.shareOfVenue ?? 0,
                        )} of a working day.`}
                        segments={[
                          {
                            key: "used",
                            lanes: Math.min(row.lanesAtMax, FLOOR),
                            label: "of the modelled working day",
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
                            label: "beyond a single working day at Brea",
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
                -property {headline.name}, at the ceiling published for it,
                takes{" "}
                <strong className="num">{count(headline.lanesAtMax)}</strong> of
                the <span className="num">{FLOOR}</span> modelled crew slots.
                That is{" "}
                <strong className="num">{pct(headline.shareOfVenue ?? 0)}</strong>{" "}
                of a working day for one campaign. Two of them landing in the
                same week is the branch, and the second one waits.
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
              Days with work already against them
            </h2>
            <ProvenanceBadge provenance="modeled" />
          </div>

          {/* Crew slots are derived from the property count on each line and
              never typed. Effectively full is this console's own threshold
              and belongs to nobody else. */}
          <p
            className={styles.note}
            title="Crew slots are derived from the property count on each line and never typed. A day is called effectively full below three free slots, which is this console's own threshold."
          >
            Read live off <Link to="/calendar">the Book</Link>. Effectively full
            means fewer than three free crew slots.
          </p>

          {loads.length === 0 ? (
            <p className={styles.empty}>
              <span aria-hidden="true">○</span>
              <span>Nothing in the book commits a crew slot yet.</span>
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
                          : "Room on this day"}
                      </span>
                    </span>
                  </div>

                  <div className={styles.dateStats}>
                    <span className={styles.numCell}>
                      <span className={styles.numLabel}>Slots committed</span>
                      <Figure
                        value={`${count(load.lanesHeld)} of ${FLOOR}`}
                        provenance="modeled"
                        compact
                      />
                    </span>
                    <span className={styles.numCell}>
                      <span className={styles.numLabel}>Slots free</span>
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
                        Largest job volume that still fits
                      </span>
                      <Figure
                        value={`${count(
                          load.lanesFree * DOORS_PER_CREW_SLOT,
                        )} properties`}
                        provenance="modeled"
                        compact
                      />
                    </span>
                  </div>

                  <LaneBar
                    caption={`${load.date}. ${load.lanesHeld} of the ${FLOOR} modelled crew slots are committed, ${load.lanesFree} are free, which is ${pct(
                      load.utilisation,
                    )} utilisation.`}
                    segments={[
                      {
                        key: "held",
                        lanes: load.lanesHeld,
                        label: "committed to signed work",
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
                            {count(line.guests)} properties
                            <ProvenanceBadge
                              provenance="illustrative"
                              compact
                            />
                          </span>
                          <span className={styles.lineLanes}>
                            {line.lanesHeld === 0 ? (
                              <>
                                <span aria-hidden="true">○</span> commits no
                                crew slot
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
                      One line on this day commits no crew slot at all. Not
                      every campaign converts into a visit: a membership
                      signup, an offer redeemed against a job already
                      scheduled, or a lead handed to a sister brand generates
                      revenue and takes none of the field. Recording crew slots
                      against it would have overstated committed capacity, and
                      that quiet overstatement is what makes most capacity
                      charts useless.
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
                The book carries signed work only, so a day somebody is sitting
                on with nothing agreed consumes no crew slot in any figure
                above. In the field it blocks the crew regardless. Both of
                those are true at once, which is why these are listed here
                rather than quietly folded into the utilisation.
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
                          <span className="num">{count(guests)}</span>{" "}
                          properties discussed, about{" "}
                          <span className="num">
                            {count(crewSlotsForDoors(guests))}
                          </span>{" "}
                          {lanesWord(crewSlotsForDoors(guests))}
                          <ProvenanceBadge provenance="illustrative" compact />
                        </span>
                      ) : (
                        <span className={styles.holdGuests}>
                          No property count discussed yet
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
            modeled property range. That will not happen and it is not supposed
            to. It is a load test on the calendar: if the whole pipeline
            landed, would the branch need more crews or a wider spread of
            dates? Those are different problems with different answers, and
            only one of them is a marketing decision.
          </p>

          {live.length === 0 ? (
            <p className={styles.empty}>
              <span aria-hidden="true">○</span>
              <span>
                No conversations are live in this period, so there is nothing
                to stress the calendar with. The figure is absent rather than
                shown as zero pressure, because zero pressure reads as good
                news and an empty pipeline in the tail of the cooling season
                is the opposite of it.
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
                    live conversations, talking or holding a slot
                  </span>
                  <ProvenanceBadge provenance="illustrative" />
                </div>
                <div className={styles.bigFig}>
                  <span className={`${styles.bigValue} num`}>
                    {count(stress.guests)}
                  </span>
                  <span className={styles.bigLabel}>
                    properties at the midpoint of every modeled range
                  </span>
                  <ProvenanceBadge provenance="modeled" />
                </div>
                <div className={styles.bigFig}>
                  <span className={`${styles.bigValue} num`}>
                    {count(stress.lanes)}
                  </span>
                  <span className={styles.bigLabel}>
                    crew slots, at one per {DOORS_PER_CREW_SLOT} properties
                  </span>
                  <ProvenanceBadge provenance="modeled" />
                </div>
                <div className={styles.bigFig}>
                  <span className={`${styles.bigValue} num`}>
                    {(Math.round((stress.lanes / FLOOR) * 10) / 10).toFixed(1)}
                  </span>
                  <span className={styles.bigLabel}>
                    full working days of field work, at the modelled day
                  </span>
                  <ProvenanceBadge provenance="modeled" />
                </div>
              </div>

              <p className={styles.stressRead}>{stress.note}</p>

              {/*
                DRAWN AS DAYS RATHER THAN AS ONE LONG BAR, because the
                reading that matters is the last line of the selector's own
                note. A single bar 121 slots long against a working day of 26
                looks like a branch that is 365 per cent understaffed. Five
                days, four of them full and one part full, is what the number
                actually describes, and it is a scheduling problem rather than
                a hiring one.
              */}
              <ol className={styles.evenings}>
                {evenings.map((lanes, i) => (
                  <li key={i} className={styles.evening}>
                    <span className={styles.eveningLabel}>
                      Working day {i + 1}
                    </span>
                    <LaneBar
                      caption={`Working day ${i + 1} of the stress test. ${lanes} of the ${FLOOR} modelled crew slots used.`}
                      segments={[
                        {
                          key: "used",
                          lanes,
                          label:
                            lanes >= FLOOR
                              ? "used, the whole modelled day"
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
                          label: "spare on this day",
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
                  <span className="num">{count(biggest.guests)}</span>{" "}
                  properties, which is{" "}
                  <strong className="num">{count(biggest.lanes)}</strong>{" "}
                  {lanesWord(biggest.lanes)} on its own, or{" "}
                  <span className="num">{pct(biggest.lanes / FLOOR)}</span> of a
                  working day.
                  <ProvenanceBadge provenance="modeled" compact /> When one
                  account can take most of a day on its own, the work is not
                  finding more crews. It is making sure the two biggest
                  conversations on the board are never scheduled into the same
                  week.
                </p>
              ) : null}

              <ul className={styles.liveList}>
                {live.map((p) => {
                  const mid = (groupProfile(p)?.mid ?? 0);
                  const lanes = crewSlotsForDoors(mid);
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
                          {count((groupProfile(p)?.low ?? 0))} to {count((groupProfile(p)?.high ?? 0))}
                        </span>{" "}
                        properties, midpoint{" "}
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
                Signed work is deliberately left out of this list. It is
                already counted against its days further up the page, and
                charging the calendar twice for the same job is how a stress
                test ends up describing a busier branch than the real one.
                Every property count here is a range with its basis on the
                organisation row; the midpoint is this page&apos;s arithmetic
                rather than a measurement of anything.
              </p>
            </>
          )}
        </section>

        <p className={styles.foot}>
          The crew slot count and the properties per slot are this
          console&apos;s own assumptions and are badged modeled everywhere they
          appear. The campaign ceilings were read off{" "}
          <a href={SOURCE_LINKS.breaLocation} target="_blank" rel="noreferrer">
            the brand&apos;s own Brea pages
          </a>{" "}
          and{" "}
          <a
            href={SOURCE_LINKS.corporateEvents}
            target="_blank"
            rel="noreferrer"
          >
            the published offer pages
          </a>{" "}
          on 18 August 2026, and each carries its source URL on{" "}
          <Link to="/lanes">the offers screen</Link>. The seasonal reading is
          the industry demand curve rather than the brand&apos;s own call data,
          which nobody outside the company can see. Everything else here is
          those figures multiplied together, with the multiplication shown.{" "}
          <Link to="/method">Every formula and source in this application</Link>
          .
        </p>
      </div>
    </div>
  );
}
