import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ActivityLine, BookLine, Lane, Ledger, Provenance } from "@/domain/types";
import { PROSPECT_BY_ID } from "@/data/prospects";
import { seatLabel } from "@/data/seats";
import { PACKAGE_BY_ID, STANDARD_TERMS } from "@/data/packages";
import { GUESTS_PER_BOWLING_LANE, LANE_META, LANE_ORDER } from "@/domain/lanes";
import { ACTIVITY_TYPE, LEDGER } from "@/domain/vocabulary";
import {
  activityByWeek,
  activityTotals,
  hoursPerThousandBooked,
  laneCoverage,
  revenueTotals,
  useBook,
  useBookDispatch,
} from "@/state/BookProvider";
import {
  Figure,
  PROVENANCE_META,
  PROVENANCE_ORDER,
  ProvenanceBadge,
  WithheldFigure,
} from "@/components/primitives/ProvenanceBadge";
import { LaneChip } from "@/components/primitives/LaneChip";
import { FamilyChip } from "@/components/primitives/FamilyChip";
import { PackageGlyph } from "@/components/primitives/PackageGlyph";
import { ProspectPlate } from "@/components/primitives/Wordmark";
import { RecordName } from "@/components/record/RecordName";
import styles from "./BookPage.module.css";

/**
 * THE BOOK. Two ledgers, side by side, that are never added together.
 *
 * This is the page a general manager will judge, so it is worth saying
 * plainly what it is arguing.
 *
 * A territory nobody has worked has no book, no history and no inbound
 * habit. For the first quarter the only thing there is to report is
 * work: tables set up in office lobbies, mixers attended, front desks
 * walked into. That is precisely the situation in which activity gets quietly
 * dressed up as results, because "we made four hundred calls" is a
 * bigger number than "we have two contracts", and the first one is
 * always available while the second one has to be earned.
 *
 * So the two things live in two columns. BOOKED REVENUE carries money
 * and gets the ink treatment. OUTBOUND ACTIVITY carries hours, and it
 * carries no money at all, because ActivityLine has no revenue field to
 * put any in. The types enforce what the layout says. Nothing on this
 * page ever sums across the divider.
 *
 * --- THE THREE NUMBERS THAT MAKE THIS HONEST -----------------------
 *
 * 1. HOW MUCH OF THE BOOK RESTS ON A PRICE SOMEBODY TYPED. DIME
 *    publishes no price for anything it sells to a group, so every line
 *    in a real book here is quoted by a person rather than read off a
 *    page. Every
 *    pipeline report in the world shows the total and hides that split.
 *    This one puts it in a panel of its own with the share in words,
 *    because a forecast becomes fiction one plausible line at a time and
 *    the only defence is naming which lines those are.
 *
 * 2. HOURS OUTSIDE THE BUILDING PER THOUSAND DOLLARS BOOKED. The ratio
 *    is the only honest way to make activity legible: it puts hours and
 *    dollars in one sentence without letting either pretend to be the
 *    other. It starts terrible, and it is supposed to. The first
 *    bookings in a trade area nobody has worked cost the most, and the
 *    number improves as referral partners begin sending people rather
 *    than being found.
 *
 * 3. HOURS PLANNED PER LANE. A week can hit its hours target and still
 *    have a hole in it. Nine lanes with the hours drawn against each
 *    one shows a plan with nothing against local retail and food in
 *    about a second, which no total ever will.
 *
 * --- WHAT IS EDITABLE AND WHY ---------------------------------------
 * Guests, on every booked line. Change one and the contract value, the
 * deposit, the guest total, the typed-price share and the ratio at the
 * bottom of the page all move together, because every figure here is a
 * selector over the two arrays in BookProvider and nothing downstream is
 * stored. A reader can prove that in four seconds, which is the point of
 * making the smallest field on the page the editable one.
 */

// ---------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------

const usd0 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const usd2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Whole dollars stay whole. Cents appear only where there are cents. */
const money = (n: number) => (n % 1 === 0 ? usd0.format(n) : usd2.format(n));

const count = (n: number) => n.toLocaleString("en-US");

const hours = (n: number) => (n % 1 === 0 ? String(n) : n.toFixed(1));

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Dates are split rather than parsed.
 *
 * `new Date("2026-11-20")` is midnight UTC, and rendering that through a
 * locale formatter in California prints the nineteenth. An event date
 * that is one day early on a screen a school is reading is not a
 * rounding error, it is a wrong answer, so these strings are treated as
 * the calendar labels they are and never routed through a timezone.
 */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

function formatWeek(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  if (!m || !d) return iso;
  return `Week of ${d} ${MONTHS[m - 1]}`;
}

/**
 * Provenance colours, mapped once, locally.
 *
 * ProvenanceBadge owns these hues inside its own CSS module and a module
 * cannot be reached into from another file, so the revenue split bar
 * below needs its own map. It is six lines of duplication against the
 * alternative of a bar whose segments are all the same colour, and the
 * duplication is safe because every segment still carries the badge's
 * own glyph and word beside it. Colour is the third signal here, as
 * everywhere else.
 */
const PROV_TONE: Record<Provenance, string> = {
  public: "var(--prov-public)",
  illustrative: "var(--prov-illustrative)",
  modeled: "var(--prov-modeled)",
  observed: "var(--prov-observed)",
  user_input: "var(--prov-user)",
  withheld: "var(--prov-withheld)",
};

/**
 * Where a line's deposit percentage actually comes from.
 *
 * DIME publishes no deposit percentage on any page, so no line here
 * can carry one as public. A line whose package publishes the figure
 * would carry it as public; every line whose package does not carries it
 * as modeled, against the standard terms, with the substitution stated
 * on the cell. The branch stays because the rule is right, not because
 * either side of it is currently populated.
 */
function depositProvenance(packageId: string, percent: number): Provenance {
  return PACKAGE_BY_ID[packageId]?.depositPercent === percent
    ? "public"
    : "modeled";
}

// ---------------------------------------------------------------
// Booked revenue
// ---------------------------------------------------------------

/**
 * The one editable field on the page.
 *
 * It keeps a local draft string while the field has focus and commits
 * only values that parse, so clearing the box to type "120" does not
 * make the reducer clamp to 1 and yank the caret. On blur the draft is
 * dropped and the field falls back to whatever the ledger holds, which
 * means the input can never disagree with the totals above it.
 */
function GuestsField({ line }: { line: BookLine }) {
  const dispatch = useBookDispatch();
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? String(line.guests);
  const prospect = PROSPECT_BY_ID[line.prospectId];

  return (
    <input
      className={`${styles.guestInput} num`}
      type="number"
      min={1}
      step={1}
      inputMode="numeric"
      value={shown}
      aria-label={`Guests for ${prospect?.name ?? "this booking"}`}
      onChange={(e) => {
        const next = e.target.value;
        setDraft(next);
        const n = Number(next);
        if (next.trim() !== "" && Number.isFinite(n) && n >= 1) {
          dispatch({ type: "SET_GUESTS", id: line.id, guests: Math.round(n) });
        }
      }}
      onBlur={() => setDraft(null)}
    />
  );
}

/**
 * A headcount checked against what DIME actually publishes.
 *
 * Both bounds are published fields on the package rows, so this is a
 * check rather than an opinion. DIME publishes neither bound for the
 * All Inclusive Party, so the check has nothing to fire on today and
 * says nothing rather than inventing a limit. It carries a glyph and a
 * word, never a colour alone.
 */
function HeadcountCheck({ line }: { line: BookLine }) {
  const pkg = PACKAGE_BY_ID[line.packageId];
  if (!pkg) return null;

  if (pkg.minGuests !== null && line.guests < pkg.minGuests) {
    return (
      <p className={`${styles.check} ${styles.checkWarn}`}>
        <span aria-hidden="true">▲</span>
        <span>
          Below the published minimum of {count(pkg.minGuests)} guests for{" "}
          {pkg.name}.
        </span>
      </p>
    );
  }

  if (pkg.maxGuests !== null && line.guests > pkg.maxGuests) {
    return (
      <p className={`${styles.check} ${styles.checkWarn}`}>
        <span aria-hidden="true">▲</span>
        <span>
          Above the published maximum of {count(pkg.maxGuests)} guests for{" "}
          {pkg.name}. This one needs a different package, not a bigger room.
        </span>
      </p>
    );
  }

  return (
    <p className={`${styles.check} ${styles.checkOk}`}>
      <span aria-hidden="true">◆</span>
      <span>
        Within {pkg.name}&apos;s published guest range.
      </span>
    </p>
  );
}

function RevenueLine({ line }: { line: BookLine }) {
  const prospect = PROSPECT_BY_ID[line.prospectId];
  const pkg = PACKAGE_BY_ID[line.packageId];
  const value = line.guests * line.pricePerGuest;
  const deposit = (value * line.depositPercent) / 100;
  const gated = pkg ? pkg.pricePerGuest === null : false;

  return (
    <li className={styles.bookLine}>
      <div className={styles.bookHead}>
        {prospect ? (
<span className={styles.ident}>
            <ProspectPlate name={prospect.name} lane={prospect.lane} />
            <span className={styles.identText}>
              <span className={styles.identName}>
                <RecordName prospectId={prospect.id} name={prospect.name} />
              </span>
              <span className={styles.identMeta}>
                <LaneChip lane={prospect.lane} size="sm" />
                <span className={styles.identSub}>
                  {prospect.decisionMakerTitle}
                </span>
              </span>
            </span>
          </span>
        ) : (
          <strong>{line.prospectId}</strong>
        )}
        <span className={`${styles.lineValue} num`}>{money(value)}</span>
      </div>

      <div className={styles.pkgRow}>
        <PackageGlyph packageId={line.packageId} size={22} />
        <span className={styles.pkgName}>{pkg?.name ?? line.packageId}</span>
        {pkg ? <FamilyChip family={pkg.family} size="sm" /> : null}
      </div>

      <dl className={styles.cells}>
        <div className={styles.cell}>
          <dt className={styles.cellLabel}>Guests</dt>
          <dd className={styles.cellValue}>
            <GuestsField line={line} />
          </dd>
        </div>

        {/*
          The one badge on this line that is NOT compact.

          A compact badge keeps the glyph and moves the word to a tooltip
          and a screen reader, which is right for a dense cell nobody is
          weighing. The price is the cell the whole page is arguing
          about, so its origin is spelled out in a word that is visible
          without hovering anything.
        */}
        <div className={styles.cell}>
          <dt className={styles.cellLabel}>Price per guest</dt>
          <dd className={styles.cellValue}>
            <Figure
              value={money(line.pricePerGuest)}
              provenance={line.pricePerGuestProvenance}
            />
          </dd>
        </div>

        <div className={styles.cell}>
          <dt className={styles.cellLabel}>Deposit</dt>
          <dd className={styles.cellValue}>
            <Figure
              value={`${line.depositPercent}% is ${money(deposit)}`}
              provenance={depositProvenance(line.packageId, line.depositPercent)}
              compact
            />
          </dd>
        </div>

        <div className={styles.cell}>
          <dt className={styles.cellLabel}>Event date</dt>
          <dd className={styles.cellValue}>
            <span className="num">{formatDate(line.eventDate)}</span>
          </dd>
        </div>

        <div className={styles.cell}>
          <dt className={styles.cellLabel}>Bowling lanes held</dt>
          <dd
            className={styles.cellValue}
            title={`One lane per ${GUESTS_PER_BOWLING_LANE} guests is this app's own planning ratio. DIME publishes no lane count for any location, so this says what the group needs and never what is left.`}
          >
            <Figure
              value={
                line.lanesHeld === 0
                  ? "None held"
                  : `${line.lanesHeld} lanes`
              }
              provenance="modeled"
              compact
            />
          </dd>
        </div>
      </dl>

      <HeadcountCheck line={line} />

      {/*
        A gated package is the reason this application exists, so the
        line says so out loud rather than letting the typed price sit
        there looking like a published one. The typed number above is
        real, it is what the contract is worth, and it is a different
        kind of fact from the $19.95 on the line beside it.
      */}
      {gated ? (
        <div className={styles.gated}>
          <WithheldFigure
            reason={`DIME publishes no price for ${pkg?.name ?? "this package"}, so there is no published figure to check this line against. The price above was quoted by a person, which is exactly what its entered badge means.`}
          />
        </div>
      ) : null}

      {line.notes ? <p className={styles.lineNote}>{line.notes}</p> : null}
    </li>
  );
}

// ---------------------------------------------------------------
// Outbound activity
// ---------------------------------------------------------------

function ActivityRow({ line }: { line: ActivityLine }) {
  const token = ACTIVITY_TYPE[line.type];
  const prospect = line.prospectId ? PROSPECT_BY_ID[line.prospectId] : undefined;

  return (
    <li className={styles.actLine}>
      <div className={styles.actHead}>
        <span
          className={styles.actGlyph}
          aria-hidden="true"
          style={{ ["--tone" as string]: token.cssVar }}
        >
          {token.glyph}
        </span>
        <span className={styles.actHeadText}>
          <span className={styles.actType}>{token.label}</span>
          <span className={styles.actWhere}>{line.locationLabel}</span>
        </span>
        <span className={`${styles.actHours} num`}>{hours(line.hours)} h</span>
      </div>

      <p className={styles.actMeta}>
        <span className={styles.actMetaItem}>
          <span className={styles.cellLabel}>Week</span>
          <span className="num">{formatWeek(line.week)}</span>
        </span>
        <span className={styles.actMetaItem}>
          <span className={styles.cellLabel}>Target conversations</span>
          <Figure
            value={count(line.targetConversations)}
            provenance="modeled"
            compact
          />
        </span>
        <span className={styles.actMetaItem}>
          <span className={styles.cellLabel}>Owner</span>
          <span>{seatLabel(line.seatId)}</span>
        </span>
        {prospect ? (
          <span className={styles.actMetaItem}>
            <span className={styles.cellLabel}>Organisation</span>
            <span>
              <RecordName prospectId={prospect.id} name={prospect.name} />
            </span>
          </span>
        ) : null}
      </p>

      <div className={styles.actLanes}>
        {line.laneFocus.map((lane) => (
          <LaneChip key={lane} lane={lane} size="sm" />
        ))}
        {line.completedAt ? (
          <span className={styles.done}>
            <span aria-hidden="true">●</span>
            <span>Completed {formatDate(line.completedAt)}</span>
          </span>
        ) : (
          <span className={styles.planned}>
            <span aria-hidden="true">○</span>
            <span>Planned</span>
          </span>
        )}
      </div>

      {line.notes ? <p className={styles.lineNote}>{line.notes}</p> : null}
    </li>
  );
}

// ---------------------------------------------------------------
// Lane coverage
// ---------------------------------------------------------------

/**
 * Hours planned against each of the nine lanes.
 *
 * THESE SUM TO MORE THAN THE HOURS IN THE PLAN, on purpose, and the
 * panel says so on screen. A chamber mixer is three hours worked against
 * corporate, auto and finance, healthcare and hospitality at once, so it
 * counts once in the hours total and four times here. This is attention
 * per lane, not a division of the week, and a bar chart that quietly
 * normalised it to a hundred percent would be describing a plan nobody
 * wrote.
 *
 * The reason it is worth a panel at all: a week can hit its hours target
 * and still have a lane with nothing against it. A total cannot show
 * that and nine bars can.
 */
function LaneCoverage({
  coverage,
  planHours,
}: {
  coverage: Record<Lane, number>;
  /** The hours actually in the plan, counted once each. */
  planHours: number;
}) {
  const values = LANE_ORDER.map((lane) => coverage[lane]);
  const max = Math.max(...values, 0);
  const total = values.reduce((n, v) => n + v, 0);
  const empty = LANE_ORDER.filter((lane) => coverage[lane] === 0);

  /* A fifth of the busiest lane. The threshold is this app's own and it
     is stated on screen rather than hidden in here, because a reader who
     cannot see where a line was drawn has no way to disagree with it. */
  const thinAt = max / 5;

  return (
    <section className={styles.coverage} aria-labelledby="coverage-h">
      <div className={styles.coverageHead}>
        <h2 className={styles.h2} id="coverage-h">
          Hours planned per lane
        </h2>
        <ProvenanceBadge provenance="modeled" />
      </div>

      {/* Lane-hours exceed worked hours because one shift can serve four
          lanes at once. Thin is this application's own threshold. */}
      <p
        className={styles.coverageNote}
        title="One shift can serve several lanes at once, so lane-hours are attention per lane rather than a division of the week. Thin means below a fifth of the busiest lane, which is this application's threshold and nobody else's."
      >
        {hours(total)} lane-hours against {hours(planHours)} h worked. Thin
        means below a fifth of the busiest lane.
      </p>

      <ul className={styles.coverageList}>
        {LANE_ORDER.map((lane) => {
          const h = coverage[lane];
          const state =
            h === 0 ? "none" : h < thinAt ? "thin" : "covered";
          const meta = LANE_META[lane];
          return (
            <li key={lane} className={styles.coverageRow} data-state={state}>
              <span className={styles.coverageLane}>
                <LaneChip lane={lane} size="sm" />
              </span>
              <span className={styles.track}>
                <span
                  className={styles.bar}
                  style={{
                    width: max > 0 ? `${(h / max) * 100}%` : "0%",
                    ["--lane" as string]: meta.cssVar,
                  }}
                />
              </span>
              <span className={`${styles.coverageHours} num`}>
                {hours(h)} h
              </span>
              <span className={styles.coverageState}>
                <span aria-hidden="true">
                  {state === "none" ? "✕" : state === "thin" ? "◔" : "●"}
                </span>
                <span>
                  {state === "none"
                    ? "No hours planned"
                    : state === "thin"
                      ? "Thin"
                      : "Covered"}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      <p className={styles.coverageVerdict}>
        {empty.length === 0
          ? "Every lane carries hours this period."
          : `${empty.length} ${
              empty.length === 1 ? "lane has" : "lanes have"
            } no hours planned: ${empty
              .map((lane) => LANE_META[lane].label)
              .join(", ")}.`}
      </p>
    </section>
  );
}

// ---------------------------------------------------------------
// The page
// ---------------------------------------------------------------

export function BookPage() {
  const { book, activity } = useBook();

  const revenue = useMemo(() => revenueTotals(book), [book]);
  const acts = useMemo(() => activityTotals(activity), [activity]);
  const weeks = useMemo(() => activityByWeek(activity), [activity]);
  const coverage = useMemo(() => laneCoverage(activity), [activity]);
  const ratio = useMemo(
    () => hoursPerThousandBooked(activity, book),
    [activity, book],
  );

  /**
   * Contract value grouped by the origin of the price it was struck at.
   *
   * The split bar under the revenue total is built from this rather than
   * from the two-way published-or-typed shorthand, so a book that later
   * carries a modeled or an observed price shows that honestly instead
   * of being quietly filed under one of the two buckets that happen to
   * exist today.
   */
  const byProvenance = useMemo(() => {
    const out = new Map<Provenance, number>();
    for (const line of book) {
      const v = line.guests * line.pricePerGuest;
      out.set(
        line.pricePerGuestProvenance,
        (out.get(line.pricePerGuestProvenance) ?? 0) + v,
      );
    }
    return PROVENANCE_ORDER.filter((p) => (out.get(p) ?? 0) > 0).map((p) => ({
      provenance: p,
      value: out.get(p) ?? 0,
    }));
  }, [book]);

  const typedShare =
    revenue.revenue > 0 ? revenue.userPricedRevenue / revenue.revenue : 0;

  /** Which ledger a narrow screen is showing. Both, on a wide one. */
  const [view, setView] = useState<Ledger>("booked-revenue");

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>The two ledgers</p>
          <h1 className={styles.h1}>The Book</h1>
          {/* The rule the page is built on, kept because it is the reason
              there is no total anywhere on it. */}
          <p className={styles.subLede}>
            Signed contracts left, hours outside the building right. Never
            added together.
          </p>

          <nav className={styles.jump} aria-label="Related planning screens">
            <Link className={styles.jumpCard} to="/book/week">
              <span className={styles.jumpGlyph} aria-hidden="true">
                ▤
              </span>
              <span>
                <strong>The week sheet</strong>
                <span className={styles.jumpNote}>
                  One week of the right column, printed.
                </span>
              </span>
            </Link>
            <Link className={styles.jumpCard} to="/calendar">
              <span className={styles.jumpGlyph} aria-hidden="true">
                ▦
              </span>
              <span>
                <strong>Dates and capacity</strong>
                <span className={styles.jumpNote}>
                  What the left column consumes. A 300 guest booking takes
                  fifteen lanes, and what share of a house that is cannot be
                  said.
                </span>
              </span>
            </Link>
          </nav>
        </header>

        {/*
          The toggle exists only where the two columns cannot both fit. It
          is not a density preference: on a wide screen the whole argument
          of this page is that the two ledgers are visible at once, so the
          control is removed rather than merely ignored.
        */}
        <div
          className={styles.toggle}
          role="group"
          aria-label="Choose which ledger to show on a narrow screen"
        >
          {(["booked-revenue", "outbound-activity"] as Ledger[]).map((id) => (
            <button
              key={id}
              type="button"
              className={styles.toggleBtn}
              aria-pressed={view === id}
              onClick={() => setView(id)}
            >
              <span aria-hidden="true">{LEDGER[id].glyph}</span>
              <span>{LEDGER[id].label}</span>
            </button>
          ))}
        </div>

        <div className={styles.ledgers} data-view={view}>
          {/* ---------------------------------------------------------
              LEFT. Booked revenue. This ledger carries money.
              --------------------------------------------------------- */}
          <section
            className={`${styles.col} ${styles.revenueCol}`}
            aria-labelledby="revenue-h"
          >
            <header className={styles.colHead}>
              <h2 className={styles.colTitle} id="revenue-h">
                <span aria-hidden="true" className={styles.colGlyph}>
                  {LEDGER["booked-revenue"].glyph}
                </span>
                {LEDGER["booked-revenue"].label}
              </h2>
              <p className={styles.colNote}>
                {LEDGER["booked-revenue"].note} Nothing reaches this column
                until it is signed, so a held date is worth zero here and
                says so.
              </p>
            </header>

            {/*
              THESE FOUR FIGURES ARE A LIVE REGION, BECAUSE THE GUESTS
              FIELD REWRITES THEM AND NOTHING NAVIGATES.

              Changing a headcount on a line below recomputes all four of
              these, the deposit column, the lane check and the split
              underneath, and a reader who cannot see the top of the
              column was told none of it. The region is the visible
              figures themselves rather than a hidden sentence repeating
              them, so there is only one set of words to keep true.
              Polite, so it lands once the typing settles instead of
              interrupting every keystroke, and `role="status"` reads the
              whole strip rather than the one number that changed, which
              on its own would be a figure with no label attached.
            */}
            <div className={styles.totals} role="status" aria-live="polite">
              <div className={styles.total}>
                <span className={`${styles.totalValue} num`}>
                  {count(revenue.contracts)}
                </span>
                <span className={styles.totalLabel}>
                  Contracts
                  <ProvenanceBadge provenance="illustrative" />
                </span>
              </div>
              <div className={styles.total}>
                <span className={`${styles.totalValue} num`}>
                  {count(revenue.guests)}
                </span>
                <span className={styles.totalLabel}>
                  Guests
                  <ProvenanceBadge provenance="illustrative" />
                </span>
              </div>
              <div className={styles.total}>
                <span className={`${styles.totalValue} num`}>
                  {money(revenue.revenue)}
                </span>
                <span className={styles.totalLabel}>
                  Contract value
                  <ProvenanceBadge provenance="modeled" />
                </span>
              </div>
              <div className={styles.total}>
                <span className={`${styles.totalValue} num`}>
                  {money(revenue.deposits)}
                </span>
                <span className={styles.totalLabel}>
                  Deposits collected
                  <ProvenanceBadge provenance="modeled" />
                </span>
              </div>
            </div>

            {/* ---------------------------------------------------------
                THE MOST HONEST NUMBER IN THE APPLICATION.
                --------------------------------------------------------- */}
            <section className={styles.typed} aria-labelledby="typed-h">
              <p className={styles.typedEyebrow}>Where the price came from</p>
              <h3 className={styles.typedTitle} id="typed-h">
                {revenue.revenue <= 0 ? (
                  "Nothing is booked, so nothing rests on anything yet"
                ) : (
                  <>
                    <span className="num">
                      {money(revenue.userPricedRevenue)}
                    </span>{" "}
                    of{" "}
                    <span className="num">{money(revenue.revenue)}</span> rests
                    on a price somebody typed
                  </>
                )}
              </h3>

              {revenue.revenue > 0 ? (
                <>
                  <div
                    className={styles.split}
                    role="img"
                    aria-label={`Contract value by the origin of its price. ${byProvenance
                      .map(
                        (s) =>
                          `${PROVENANCE_META[s.provenance].label}, ${money(
                            s.value,
                          )}`,
                      )
                      .join(". ")}.`}
                  >
                    {byProvenance.map((s) => (
                      <span
                        key={s.provenance}
                        className={styles.splitSeg}
                        style={{
                          width: `${(s.value / revenue.revenue) * 100}%`,
                          ["--tone" as string]: PROV_TONE[s.provenance],
                        }}
                      />
                    ))}
                  </div>

                  <ul className={styles.splitKey}>
                    {byProvenance.map((s) => (
                      <li key={s.provenance} className={styles.splitKeyItem}>
                        <span
                          className={styles.splitSwatch}
                          aria-hidden="true"
                          style={{
                            ["--tone" as string]: PROV_TONE[s.provenance],
                          }}
                        >
                          {PROVENANCE_META[s.provenance].glyph}
                        </span>
                        <span className={styles.splitKeyLabel}>
                          {PROVENANCE_META[s.provenance].label}
                        </span>
                        <span className={`${styles.splitKeyValue} num`}>
                          {money(s.value)}
                        </span>
                        <span className={`${styles.splitKeyPct} num`}>
                          {Math.round((s.value / revenue.revenue) * 100)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              {/* DIME publishes no price for any group package, so every
                  figure in this book is one a person quoted. This says how
                  much of the total that is. */}
              <p className={styles.typedBody}>
                {revenue.revenue > 0
                  ? `${Math.round(typedShare * 100)}% of the book rests on a quoted price rather than a published one.`
                  : "No gated package has been quoted yet."}
              </p>
              <p className={styles.typedFoot}>
                <Link className="tap" to="/method">
                  Formulas and sources
                </Link>
              </p>
            </section>

            {book.length === 0 ? (
              <p className={styles.empty}>
                <span aria-hidden="true">○</span> Nothing is booked.
              </p>
            ) : (
              <ul className={styles.lines}>
                {[...book]
                  .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
                  .map((line) => (
                    <RevenueLine key={line.id} line={line} />
                  ))}
              </ul>
            )}

            {/* Where a package page is silent on deposit or notice, the
                published corporate standard is used and the cell says so. */}
            <p className={styles.colFoot}>
              Contracts seeded for this prototype, badged illustrative.
              Deposits at each line&apos;s own percentage. DIME publishes no
              deposit and no minimum booking notice, only that a change to a
              booked party needs {STANDARD_TERMS.changeNoticeDays} or more
              days notice.
            </p>
          </section>

          {/* ---------------------------------------------------------
              RIGHT. Outbound activity. This ledger carries no money.
              --------------------------------------------------------- */}
          <section
            className={`${styles.col} ${styles.activityCol}`}
            aria-labelledby="activity-h"
          >
            <header className={styles.colHead}>
              <h2 className={styles.colTitle} id="activity-h">
                <span aria-hidden="true" className={styles.colGlyph}>
                  {LEDGER["outbound-activity"].glyph}
                </span>
                {LEDGER["outbound-activity"].label}
              </h2>
              <p className={styles.colNote}>
                {LEDGER["outbound-activity"].note} There is no revenue field
                on an activity line to put a dollar in, which is the whole
                reason there are two ledgers.
              </p>
            </header>

            <div className={styles.totals}>
              <div className={styles.total}>
                <span className={`${styles.totalValue} num`}>
                  {count(acts.shifts)}
                </span>
                <span className={styles.totalLabel}>
                  Shifts planned
                  <ProvenanceBadge provenance="illustrative" />
                </span>
              </div>
              <div className={styles.total}>
                <span className={`${styles.totalValue} num`}>
                  {hours(acts.hours)}
                </span>
                <span className={styles.totalLabel}>
                  Hours, all work
                  <ProvenanceBadge provenance="illustrative" />
                </span>
              </div>
              <div className={`${styles.total} ${styles.totalKey}`}>
                <span className={`${styles.totalValue} num`}>
                  {hours(acts.outsideHours)}
                </span>
                <span className={styles.totalLabel}>
                  Hours outside the building
                  <ProvenanceBadge provenance="modeled" />
                </span>
              </div>
              <div className={styles.total}>
                <span className={`${styles.totalValue} num`}>
                  {count(acts.targetConversations)}
                </span>
                <span className={styles.totalLabel}>
                  Target conversations
                  <ProvenanceBadge provenance="modeled" />
                </span>
              </div>
            </div>

            <p className={styles.outsideNote}>
              <strong>
                {hours(acts.outsideHours)} of {hours(acts.hours)} hours are
                outside the building
              </strong>
              , and that is the split the job posting asks about first:
              tabling, networking events and go-sees with prospective
              customers. A call block from a desk is real outbound work, it
              is counted here, and it is not counted as outside. Neither is a
              venue tour, because a tour happens at the building rather than
              out in the trade area. A week that hits its hours target from a
              chair has not done the thing the posting asked for.{" "}
              {acts.completed} of {acts.shifts} shifts are marked completed.
            </p>

            {weeks.length === 0 ? (
              <p className={styles.empty}>
                <span aria-hidden="true">○</span> No outbound work is
                planned. Before a venue opens, that is the only genuinely
                alarming state on this page.
              </p>
            ) : (
              weeks.map((w) => (
                <section key={w.week} className={styles.week}>
                  <h3 className={styles.weekHead}>
                    <span className="num">{formatWeek(w.week)}</span>
                    <span className={`${styles.weekHours} num`}>
                      {hours(w.hours)} h
                    </span>
                  </h3>
                  <ul className={styles.lines}>
                    {w.lines.map((line) => (
                      <ActivityRow key={line.id} line={line} />
                    ))}
                  </ul>
                </section>
              ))
            )}

            <p
              className={styles.colFoot}
              title="A chamber mixer is three hours and roughly a dozen real conversations; a lunchtime table in a busy lobby is four hours and many more. The assumption sits on each line."
            >
              Target conversations are modeled from the shift, not counted
              from a system.
            </p>
          </section>
        </div>

        {/* ---------------------------------------------------------
            THE ONE NUMBER THAT LINKS THE TWO COLUMNS.
            --------------------------------------------------------- */}
        <section className={styles.ratio} aria-labelledby="ratio-h">
          <div className={styles.ratioFigure}>
            {ratio === null ? (
              <p className={styles.ratioNone}>
                <span aria-hidden="true">○</span> No ratio yet
              </p>
            ) : (
              <>
                <span className={`${styles.ratioValue} num`}>
                  {ratio.toFixed(1)}
                </span>
                <span className={styles.ratioUnit}>
                  hours outside the building
                  <br />
                  per $1,000 booked
                </span>
                <ProvenanceBadge provenance="modeled" />
              </>
            )}
          </div>

          <div className={styles.ratioBody}>
            <h2 className={styles.h2} id="ratio-h">
              Hours against the book
            </h2>

            {/* Absent rather than infinite. Hours divided by zero dollars is
                not a large number, it is not a number. */}
            {ratio === null ? (
              <p className={styles.ratioText}>
                Nothing is booked yet, so there is no ratio.
              </p>
            ) : (
              <>
                <p className={styles.ratioText}>
                  {hours(acts.outsideHours)} hours outside the building
                  against {money(revenue.revenue)} of signed contracts. Read
                  the other way round, every hour spent out in the trade
                  area has bought about{" "}
                  <span className="num">
                    {money(
                      Math.round(revenue.revenue / (acts.outsideHours || 1)),
                    )}
                  </span>{" "}
                  of booked business so far.
                </p>
              </>
            )}

            {/* The only place in this application where hours and dollars
                share a sentence, and it is a ratio rather than a sum. */}
            <p className={styles.ratioText}>
              A ratio, never a sum.
            </p>
          </div>
        </section>

        <LaneCoverage coverage={coverage} planHours={acts.hours} />
      </div>
    </div>
  );
}
