import { groupProfile } from "@/domain/booking";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { Lane, OccasionClass } from "@/domain/types";
import { PROSPECTS } from "@/data/prospects";
import { PACKAGES } from "@/data/packages";
import { PACKAGE_FAMILY_ORDER } from "@/domain/vocabulary";
import {
  LANE_META,
  LANE_ORDER,
  OCCASION_CLASS_META,
  crewSlotsForDoors,
} from "@/domain/lanes";
import { usePipeline, usePipelineDispatch, furthestStatus } from "@/state/PipelineProvider";
import { LaneChip, OccasionClassChip } from "@/components/primitives/LaneChip";
import { FamilyChip } from "@/components/primitives/FamilyChip";
import { Figure, ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import styles from "./LaneBoardPage.module.css";

/**
 * THE SERVICE LINE BOARD. Every line of work the West Division brands
 * sell into this territory, and the two classes of demand that decide
 * when each one is marketed.
 *
 * ── WHY THIS SCREEN IS NOT A LIST OF CATEGORIES ────────────────────
 * A board that says "HVAC, Plumbing, Electrical, Drains" is a taxonomy,
 * and a taxonomy is worth nothing to a person holding one budget and
 * four counties. What makes a service line useful is the four things
 * printed on every card here: what the way in actually is, how the line
 * trades, what the brands publish as an offer into it, and the single
 * hardest marketing problem in it this season. That last one is the
 * field that turns this from a filing system into a plan, and it is
 * different in every line.
 *
 * ── NOTHING HERE COUNTS THE LINES BY HAND ──────────────────────────
 * The board was written when there were eight service lines and it
 * renders nine without a line of it being about nine. The cards come off
 * LANE_ORDER, the grouping comes off each line's own demand class, the
 * offer list comes off laneFit, and the heading spells the number it
 * finds rather than the number that was true when it was typed. A tenth
 * line lands on this page as one more card in the right group.
 *
 * ── THE SPLIT DOWN THE MIDDLE IS THE BIGGEST IDEA IN THIS APP ──────
 * Everything on this page hangs off one distinction. A compressor fails
 * in August whether or not anybody advertises; a panel upgrade happens
 * only because a household decided it should. Those are two different
 * marketing jobs, bought in two different months, and confusing them is
 * how a budget goes on brand awareness in July while the paid position
 * that catches the emergency calls slips to fourth and the calls go to
 * whoever is above us.
 *
 * So the board is grouped by demand class before it is grouped by
 * anything else, the two groups run cool and warm, and each one carries
 * its own glyph, its own word and its own explanation. The colour
 * temperature is the third signal and never the first.
 *
 * ── THE NUMBERS ON EACH CARD ARE SELECTORS, NOT LABELS ─────────────
 * Organisations, published emails and untouched rows are counted off the
 * live fact table, so advancing one property manager on the desk drops
 * the untouched count on that card by one, immediately. The modelled
 * door range is summed from the ranges on the rows and carries the badge
 * that says so. Nothing on this page is a figure somebody typed into a
 * template.
 *
 * ── WHAT A CLICK DOES ──────────────────────────────────────────────
 * Selecting a service line sets the pipeline's filter to that one line
 * and moves to the desk. The alternative was a per-line drilldown page,
 * which would have meant a second ranked list with its own sort order,
 * quietly disagreeing with the desk. There is one ranked list in this
 * application and this page is a filter onto it.
 */

interface LaneRollup {
  lane: Lane;
  prospects: number;
  emailable: number;
  untouched: number;
  headcountLow: number;
  headcountHigh: number;
}

interface ClassRollup {
  occasionClass: OccasionClass;
  lanes: LaneRollup[];
  prospects: number;
  emailable: number;
  untouched: number;
}

/**
 * Offers that run in a service line, in the family reading order the
 * whole app uses.
 *
 * Computed once at module scope rather than inside the card. PACKAGES and
 * LANE_META are both static, so recomputing one filter per line on every
 * status change would be work done to produce an answer that cannot have
 * changed.
 *
 * A service line with nothing in it renders an empty offer block and
 * reads as a fault in the page rather than as a fact about the market,
 * so a new line arriving in LANE_ORDER is a prompt to check laneFit in
 * data/packages.ts and not only the meta block in domain/lanes.ts.
 */
const PACKAGES_BY_LANE: Record<Lane, typeof PACKAGES> = LANE_ORDER.reduce(
  (acc, lane) => {
    acc[lane] = PACKAGES.filter((p) => p.laneFit.includes(lane)).sort(
      (a, b) =>
        PACKAGE_FAMILY_ORDER.indexOf(a.family) -
        PACKAGE_FAMILY_ORDER.indexOf(b.family),
    );
    return acc;
  },
  {} as Record<Lane, typeof PACKAGES>,
);

/**
 * The service line count, spelled, for the one heading that says it out
 * loud.
 *
 * "The eight service lines" was typed into the h1 when there were eight,
 * and a ninth made the biggest text on the page the only wrong thing on
 * it. Numerals in a display heading read as data rather than as a
 * sentence, so the count is spelled, and the numeral is the fallback for
 * a count nobody has a word ready for. This is not decoration: a page
 * whose title disagrees with its own contents is the first thing a
 * careful reader notices and the last thing they forgive.
 */
const SPELLED = [
  "no",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
];

const spell = (n: number) => SPELLED[n] ?? String(n);

const money = (n: number) =>
  n % 1 === 0 ? `$${n.toFixed(0)}` : `$${n.toFixed(2)}`;

const count = (n: number) => n.toLocaleString("en-US");

/** A figure on a card, with the origin every commercial number carries. */
function Stat({
  value,
  label,
  provenance,
  title,
}: {
  value: string;
  label: string;
  provenance: "public" | "modeled" | "illustrative";
  title: string;
}) {
  return (
    <div className={styles.stat} title={title}>
      <span className={`${styles.statValue} num`}>{value}</span>
      <span className={styles.statLabel}>
        {label}
        <ProvenanceBadge provenance={provenance} compact />
      </span>
    </div>
  );
}

function LaneCard({
  rollup,
  onOpen,
}: {
  rollup: LaneRollup;
  onOpen: () => void;
}) {
  const { lane } = rollup;
  const meta = LANE_META[lane];
  const packages = PACKAGES_BY_LANE[lane];
  const gated = packages.filter((p) => p.pricePerGuest === null).length;

  return (
    <li
      className={styles.card}
      data-occasion={meta.occasionClass}
      style={{
        ["--lane" as string]: meta.cssVar,
        ["--laneTint" as string]: meta.tintVar,
      }}
    >
      <div className={styles.cardHead}>
        <span className={styles.laneGlyph} aria-hidden="true">
          {meta.glyph}
        </span>
        <div className={styles.cardHeadText}>
          {/*
            The heading is the control and the whole card is the hit area,
            through a stretched pseudo element on this button rather than
            an onClick on the list item. A click handler on an <li> gives a
            keyboard reader nothing to focus and a screen reader nothing to
            announce.
          */}
          <h3 className={styles.cardTitle}>
            <button
              type="button"
              className={styles.laneBtn}
              onClick={onOpen}
              aria-label={`Filter the desk to ${meta.label} and open it`}
            >
              {meta.label}
            </button>
          </h3>
          <div className={styles.cardChips}>
            <OccasionClassChip lane={lane} />
            <LaneChip lane={lane} size="sm" />
          </div>
        </div>
      </div>

      <p className={styles.door}>
        <span className={styles.doorLabel}>The way in</span>
        <span className={styles.doorName}>{meta.doorName}</span>
      </p>

      <div className={styles.stats}>
        <Stat
          value={count(rollup.prospects)}
          label={rollup.prospects === 1 ? "organisation" : "organisations"}
          provenance="public"
          title="Real organisations inside the territory. Sixty nine of the three hundred and twenty nine on the board carry the Google place id they came from; the rest carry no place id and were geocoded with the US Census Bureau geocoder."
        />
        <Stat
          value={count(rollup.emailable)}
          label="publish an email"
          provenance="public"
          title="Read off the organisation's own page, with the URL it was read from on the row. Nothing here was guessed from a domain name."
        />
        <Stat
          value={count(rollup.untouched)}
          label="never touched"
          provenance="illustrative"
          title="Counted live off the fact table. Advance one of these anywhere in the app and this figure moves."
        />
        <Stat
          value={`${count(rollup.headcountLow)} to ${count(rollup.headcountHigh)}`}
          label="doors in the line"
          provenance="modeled"
          title="Every door count in this app is a range with its basis stated on the row. This is those ranges summed, not a measurement."
        />
      </div>

      <p className={styles.note}>{meta.note}</p>

      {/*
        THE MARKETING PROBLEM GETS ITS OWN BLOCK, and it is the reason
        this card is worth reading twice. Everything above it is true of
        the service line in any year; this is what is hard about it in
        the season the console is standing in.
      */}
      <div className={styles.problem}>
        <p className={styles.problemLabel}>
          <span aria-hidden="true" className={styles.problemGlyph}>
            ◬
          </span>
          The marketing problem
        </p>
        <p className={styles.problemText}>{meta.preOpeningProblem}</p>
      </div>

      <div className={styles.packages}>
        <h4 className={styles.packagesTitle}>
          What the brands publish into it
          <span className={`${styles.packagesCount} num`}>
            {packages.length}
          </span>
        </h4>
        <ul className={styles.packageList}>
          {packages.map((pkg) => (
            <li key={pkg.id} className={styles.packageRow}>
              <span className={styles.packageName}>{pkg.name}</span>
              <FamilyChip family={pkg.family} size="sm" />
              <span className={styles.packagePrice}>
                {pkg.pricePerGuest === null ? (
                  <Figure
                    value={null}
                    provenance="withheld"
                    compact
                  />
                ) : (
                  <>
                    <Figure
                      value={money(pkg.pricePerGuest)}
                      provenance={pkg.provenance.pricePerGuest ?? "public"}
                      compact
                    />
                    <span className={styles.perGuest}>as published</span>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
        {/* The gated count is the finding, not a comment on it: those pages
            name the plan and route the price to a phone number. */}
        <p
          className={styles.gated}
          title="Every gated row here names a membership plan, itemises the benefits and publishes no price. Not one rival brand profiled prints what its plan costs."
        >
          {gated === 0 ? (
            <>All {packages.length} carry a published price</>
          ) : (
            <>
              <strong className="num">{gated}</strong> of{" "}
              <strong className="num">{packages.length}</strong> not published
            </>
          )}
        </p>
      </div>

      <p className={styles.cta} aria-hidden="true">
        Open the desk
      </p>
    </li>
  );
}

export function LaneBoardPage() {
  const pipeline = usePipeline();
  const dispatch = usePipelineDispatch();
  const navigate = useNavigate();

  /**
   * One pass over the prospect list per render, rather than three passes
   * per lane inside every card. Untouched is the only figure here that
   * depends on state a reader can change, and it is the reason this is
   * memoised on the pipeline rather than computed once at module scope.
   */
  const groups = useMemo<ClassRollup[]>(() => {
    const byLane = new Map<Lane, LaneRollup>();
    for (const lane of LANE_ORDER) {
      byLane.set(lane, {
        lane,
        prospects: 0,
        emailable: 0,
        untouched: 0,
        headcountLow: 0,
        headcountHigh: 0,
      });
    }

    for (const p of PROSPECTS) {
      const row = byLane.get(p.lane);
      if (!row) continue;
      row.prospects += 1;
      if (p.emailConfidence === "verified_public") row.emailable += 1;
      if (furthestStatus(pipeline, p.id) === "unworked") row.untouched += 1;
      /* Rows with no modeled room add nothing to a lane's totals. */
      const g = groupProfile(p);
      if (g) {
        row.headcountLow += g.low;
        row.headcountHigh += g.high;
      }
    }

    const classes: OccasionClass[] = ["calendar-locked", "discretionary"];
    return classes.map((occasionClass) => {
      const lanes = LANE_ORDER.filter(
        (lane) => LANE_META[lane].occasionClass === occasionClass,
      ).map((lane) => byLane.get(lane)!);
      return {
        occasionClass,
        lanes,
        prospects: lanes.reduce((n, l) => n + l.prospects, 0),
        emailable: lanes.reduce((n, l) => n + l.emailable, 0),
        untouched: lanes.reduce((n, l) => n + l.untouched, 0),
      };
    });
  }, [pipeline]);

  const openLane = (lane: Lane) => {
    /* Set, rather than add. A reader who clicks Plumbing expects the
       desk to show plumbing, not plumbing plus whatever was ticked
       twenty minutes ago on another screen. */
    dispatch({ type: "CLEAR_LANES" });
    dispatch({ type: "TOGGLE_LANE", lane });
    navigate("/");
  };

  const locked = groups[0];
  const chosen = groups[1];

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Stage three</p>
          <h1 className={styles.h1}>
            The {spell(LANE_ORDER.length)} service lines
          </h1>
        </header>

        {/* -----------------------------------------------------------
            THE FORK. This panel is the argument the rest of the page is
            evidence for, so it sits above the board rather than in a
            legend at the bottom that nobody reads.
            ----------------------------------------------------------- */}
        <section className={styles.fork} aria-label="The two classes of demand">
          <div className={styles.forkIntro}>
            <h2 className={styles.forkTitle}>Split by who starts the job</h2>
            {/* The argument for this split is on /method. What stays here is
                the one line that tells a reader which half to work first. */}
            <p className={styles.forkText}>
              Non-discretionary lines lead the board: the call happens whether
              or not anybody advertises.
            </p>
          </div>

          <div className={styles.forkCards}>
            {groups.map((g) => {
              const cm = OCCASION_CLASS_META[g.occasionClass];
              return (
                <div
                  key={g.occasionClass}
                  className={styles.forkCard}
                  data-occasion={g.occasionClass}
                >
                  <p className={styles.forkCardHead}>
                    <span className={styles.forkGlyph} aria-hidden="true">
                      {cm.glyph}
                    </span>
                    <span className={styles.forkCardTitle}>{cm.label}</span>
                  </p>
                  <p className={styles.forkWhat}>{cm.what}</p>
                  <p className={styles.forkWhen}>
                    <span className={styles.forkWhenLabel}>How it is worked</span>
                    {cm.when}
                  </p>
                  <p className={styles.forkTally}>
                    <strong className="num">{g.lanes.length}</strong> service
                    lines, <strong className="num">{g.prospects}</strong>{" "}
                    organisations, <strong className="num">{g.emailable}</strong>{" "}
                    publishing an email we read off their own page.
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {[locked, chosen].map((group) => {
          const cm = OCCASION_CLASS_META[group.occasionClass];
          /* The top of the summed range, in crew days, at this console's
             own planning rate of one slot per twenty doors. It is here
             rather than on each card because the interesting comparison is
             between the two classes, and because it is the number that
             makes the alignment argument concrete: the non-discretionary
             half of this territory would take the branch months to work
             through if every door landed at once. */
          const peakLanes = crewSlotsForDoors(
            group.lanes.reduce((n, l) => n + l.headcountHigh, 0),
          );

          return (
            <section
              key={group.occasionClass}
              className={styles.group}
              data-occasion={group.occasionClass}
              aria-label={cm.label}
            >
              <div className={styles.groupHead}>
                <h2 className={styles.groupTitle}>
                  <span className={styles.groupGlyph} aria-hidden="true">
                    {cm.glyph}
                  </span>
                  {cm.label}
                </h2>
                <p className={styles.groupSummary}>
                  <strong className="num">{group.prospects}</strong>{" "}
                  organisations across{" "}
                  <strong className="num">{group.lanes.length}</strong> service
                  lines. <strong className="num">{group.untouched}</strong> never
                  touched. At the top of every modelled range at once:{" "}
                  <strong className="num">{peakLanes}</strong> crew days, at this
                  console's own rate of one slot per twenty doors.
                  <ProvenanceBadge provenance="modeled" compact />
                </p>
              </div>

              <ul className={styles.cards}>
                {group.lanes.map((rollup) => (
                  <LaneCard
                    key={rollup.lane}
                    rollup={rollup}
                    onOpen={() => openLane(rollup.lane)}
                  />
                ))}
              </ul>
            </section>
          );
        })}

        <p
          className={styles.foot}
          title="Every offer name, condition, day part and price on this page was read off a brand's own page on 18 August 2026 and carries the URL it came from on the offers screen."
        >
          Offers read off the brands' own pages, 18 August 2026. A missing price
          is missing because the brand does not publish one.
        </p>
      </div>
    </div>
  );
}
