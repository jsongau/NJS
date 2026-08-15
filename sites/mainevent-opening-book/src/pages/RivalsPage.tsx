import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/chrome/PageHeader";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { LaneChip } from "@/components/primitives/LaneChip";
import {
  LOSS_CAUSE_META,
  LOSS_EVIDENCE_META,
  LOSS_FILTER_META,
  RECALL_META,
  RECALL_WINDOW_DAYS,
  type LossFilter,
  type Rival,
} from "@/domain/rivals";
import {
  PROMOTION_STANDING_META,
  causeTallies,
  datedLossRows,
  filteredLosses,
  lossReading,
  promotionStanding,
  structuralCount,
} from "@/domain/selectors/rivals";
import {
  REBRAND_NOTE,
  REFUSED_FACTS,
  RIVALS,
  RIVAL_PROMOTIONS,
} from "@/data/rivals";
import { OBJECTIONS, OBJECTION_BY_ID } from "@/data/objections";
import { EXCLUDED_FROM_BOARD } from "@/data/prospects";
import { useAsOf } from "@/state/ScenarioProvider";
import styles from "./RivalsPage.module.css";

/**
 * THE COMPETITIVE SET, AND THE SCREEN THIS DELIBERATELY IS NOT.
 *
 * ── THE OBVIOUS BUILD, AND WHY IT WOULD HAVE BEEN A LIE ───────────
 * The expected screen here is a grid: four rival venues down the side,
 * a per head price in every cell, a green tick where Brea is cheaper.
 * That grid cannot be built. Lucky Strike Fullerton, Lucky Strike
 * Orange, Round1, Dave and Buster's Orange, The Phoenix Club and La
 * Habra 300 Bowl were each opened and read on 14 August 2026, and not
 * one of them publishes a group price. Every one routes the question
 * to a form, a planner or a telephone. Three of them are national
 * chains and one is a single site independent, which is what turns the
 * observation into a finding rather than a corporate habit.
 * `data/leagues.ts` already records the same silence for league
 * pricing across the same operators, and `data/packages.ts` records it
 * for Main Event itself.
 *
 * So every number in that grid would have been invented, on the one
 * screen in this application whose entire job is factual accuracy
 * about other people's businesses. It is the worst possible place to
 * make something up and it is exactly what the naive version does.
 *
 * ── WHAT IS ACTUALLY TRUE, AND IT IS MORE USEFUL ──────────────────
 * The register of seven objections in `data/objections.ts` sorts into
 * three classes and the sort is the finding. Four are the venue's own
 * silence: no published price, no opening date, nothing to walk
 * through, no track record. Two are somebody else's calendar: a three
 * year hotel contract, a budget that does not open until next fiscal
 * year. One names a competitor, and that competitor has shared a
 * parent company with Main Event since June 2022, which the
 * objection's own recommended answer says out loud.
 *
 * The three deals on record that actually died agree with it. A hotel
 * contract signed three years ago, a club that owns its own ballroom,
 * and a brokerage that booked in July before this venue had anybody to
 * ask them. None of them to a bowling house. None of them to a price.
 *
 * That changes what a rep does on Monday, which is the test this
 * screen was built against. "Round1 exists and it is up the road"
 * changes nothing. "Six of seven objections are structural and not one
 * loss on record went to a rival's price, so the play is the calendar"
 * changes the whole approach: find out when the incumbent contract
 * ends, take the second occasion nobody is defending, and get into the
 * conversation before July rather than after it.
 *
 * ── THE CLOCK IS PART OF THE ARGUMENT ─────────────────────────────
 * `useAsOf()` is consumed rather than reimplemented. Win and loss
 * practice says a loss reason should be collected inside three months,
 * because after that the buyer's memory of the evaluation has been
 * overwritten, so every loss here has ninety days on it. On the board
 * day all three are still worth ringing about. By the end of December
 * none of them is. The rival promotion is read against the same clock
 * and moves from claimable to closed to expired on its own dates.
 *
 * ── NOTHING ON THIS SCREEN CELEBRATES ─────────────────────────────
 * Emptying the askable filter is not an achievement, it is three
 * conversations nobody had in time. There is no confetti, no sound, no
 * character and no modal anywhere in this file, and there is no code
 * path that could produce one. A loss register is not a place for it.
 */

// ---------------------------------------------------------------
// Dates
// ---------------------------------------------------------------

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Split rather than parsed, for the reason the Book, Replies and
 * Objections pages all give: `new Date("2026-09-24")` is midnight UTC
 * and formatting that in California prints the twenty third.
 */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

const CHANNEL_WORD: Record<string, string> = {
  email: "email",
  phone: "a telephone call",
  "in-person": "a go-see",
  "contact-form": "their contact form",
};

// ---------------------------------------------------------------
// A citation, which is the unit this page is built out of
// ---------------------------------------------------------------

/**
 * A source line, on screen rather than in a tooltip.
 *
 * The application's rule is that every figure carries a provenance
 * badge. A fact about another company needs one thing more, because a
 * rival's marketing page is a moving target in a way a static seed is
 * not: the address it was read from and the day it was read. Both are
 * printed, both are visible without hovering anything, and the link
 * opens the page so a reader can check it in about fifteen seconds.
 */
function Cite({ url, readOn }: { url: string; readOn: string }) {
  return (
    <p className={styles.cite}>
      <span className={styles.citeLabel}>Read</span>
      <span className={`${styles.citeWhen} num`}>{formatDate(readOn)}</span>
      <a className={`tap ${styles.citeLink}`} href={url} target="_blank" rel="noreferrer">
        {url.replace(/^https:\/\//, "")}
      </a>
    </p>
  );
}

// ---------------------------------------------------------------
// One venue in the register
// ---------------------------------------------------------------

const STANDING_META: Record<
  Rival["standing"],
  { label: string; glyph: string; cssVar: string; note: string }
> = {
  "trade-area": {
    label: "In the trade area",
    glyph: "◆",
    cssVar: "var(--sec-ink, var(--sec-rivals-ink))",
    note: "Same segment, close enough to take the same group night.",
  },
  "category-only": {
    label: "Category only",
    glyph: "◇",
    cssVar: "var(--neutral)",
    note: "The same kind of venue and no location near enough to compete for this business. In the register to mark the boundary rather than to be watched.",
  },
  "same-parent": {
    label: "Same parent company",
    glyph: "◈",
    cssVar: "var(--info)",
    note: "Owned by the company that owns Main Event. Named by buyers as a competitor and not one.",
  },
  "banquet-room": {
    label: "A room, not a rival venue",
    glyph: "▣",
    cssVar: "var(--warn)",
    note: "No lanes and no arcade. It has a hall, a calendar and a membership, which is what actually takes a group night in this town.",
  },
};

function RivalCard({ rival }: { rival: Rival }) {
  const standing = STANDING_META[rival.standing];
  return (
    <article className={styles.rival} aria-labelledby={`rival-${rival.id}`}>
      <div className={styles.rivalHead}>
        <h3 className={styles.rivalName} id={`rival-${rival.id}`}>
          {rival.name}
        </h3>
        <span
          className={styles.standing}
          style={{ ["--tone" as string]: standing.cssVar }}
          title={standing.note}
        >
          <span aria-hidden="true" className={styles.standingGlyph}>
            {standing.glyph}
          </span>
          <span>{standing.label}</span>
        </span>
      </div>

      <p className={styles.rivalAddress}>{rival.address}</p>
      <p className={styles.rivalAddressSource}>{rival.addressSource}</p>
      <p className={styles.rivalWhy}>{rival.whyHere}</p>

      <div className={styles.factList}>
        {rival.facts.map((fact, i) => (
          <div className={styles.fact} key={`${rival.id}-${i}`}>
            <p className={styles.factLabel}>
              {fact.label}
              <ProvenanceBadge provenance={fact.provenance} compact />
            </p>
            <p className={styles.factValue}>{fact.value}</p>
            {fact.caveat ? <p className={styles.factCaveat}>{fact.caveat}</p> : null}
            <Cite url={fact.sourceUrl} readOn={fact.readOn} />
          </div>
        ))}
      </div>

      {/* ---------------------------------------------------------
          THE COLUMN A PRICE GRID WOULD HAVE HAD, TELLING THE TRUTH
          INSTEAD. Every venue in this register has one and every one
          of them starts with the same line.
          --------------------------------------------------------- */}
      <div className={styles.silence}>
        <p className={styles.silenceHead}>
          <span aria-hidden="true" className={styles.silenceGlyph}>
            ▩
          </span>
          Not published anywhere on their pages
        </p>
        <ul className={styles.silenceList}>
          {rival.notPublished.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className={styles.routes}>
          <span className={styles.routesLabel}>A group enquiry hits</span>
          <span>{rival.routesTo}</span>
        </p>
      </div>

      <Cite url={rival.sourceUrl} readOn={rival.readOn} />
    </article>
  );
}

// ---------------------------------------------------------------
// The page
// ---------------------------------------------------------------

export function RivalsPage() {
  const asOf = useAsOf();
  const [filter, setFilter] = useState<LossFilter>("all");

  const rows = useMemo(() => datedLossRows(asOf), [asOf]);
  const shown = useMemo(() => filteredLosses(rows, filter), [rows, filter]);
  const reading = useMemo(() => lossReading(rows), [rows]);
  const { tallies, unclassified } = useMemo(() => causeTallies(), []);
  const structural = structuralCount();

  const promotion = RIVAL_PROMOTIONS[0];
  const promoStanding = promotionStanding(promotion, asOf);
  const promoMeta = PROMOTION_STANDING_META[promoStanding];

  const named = OBJECTION_BY_ID["we-use-dave-and-busters"];

  return (
    <div className={styles.page}>
      <PageHeader />

      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>The competition, and what it is not</p>
          <h1 className={styles.h1}>Win and loss, then the register</h1>
          <p className={styles.lede}>
            Nobody in this category publishes a group price. Six venues were
            opened and read, three chains and one independent among them, and
            every one routes the question to a form or a telephone. So a price
            grid here would be invented. What is real is why deals actually
            died, and it is not a competitor.
          </p>
          <p className={styles.provNote}>
            <ProvenanceBadge provenance="public" />
            <span>
              Every fact about another business on this page carries the
              address it was read from and the day it was read.
            </span>
          </p>
        </header>

        {/* =========================================================
            ONE. THE FINDING.
            ========================================================= */}
        <section className={styles.finding} aria-labelledby="finding-h">
          <p className={styles.sectionEyebrow}>Read this first</p>
          <h2 className={styles.h2} id="finding-h">
            <span className="num">{structural}</span> of the{" "}
            <span className="num">{OBJECTIONS.length}</span> objections on
            record are structural
          </h2>
          <p className={styles.findingLede}>
            This venue loses to its own silence and to somebody else's
            calendar. It does not lose to a rival's price, and there is no
            rival price published anywhere in the category to lose to.
          </p>

          <div className={styles.causes}>
            {tallies.map((tally) => {
              const meta = LOSS_CAUSE_META[tally.cause];
              return (
                <div
                  className={styles.cause}
                  key={tally.cause}
                  style={{ ["--tone" as string]: meta.cssVar }}
                >
                  <p className={styles.causeHead}>
                    <span aria-hidden="true" className={styles.causeGlyph}>
                      {meta.glyph}
                    </span>
                    <span className={styles.causeLabel}>{meta.label}</span>
                    <span className={`${styles.causeCount} num`}>
                      {tally.count}
                    </span>
                  </p>
                  <p className={styles.causeNote}>{meta.note}</p>
                  <ul className={styles.causeItems}>
                    {tally.shorts.map((short) => (
                      <li key={short}>{short}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {unclassified.length > 0 ? (
            <p className={styles.warnLine}>
              <span aria-hidden="true">▲</span>{" "}
              <span className="num">{unclassified.length}</span> objections have
              no classification on file: {unclassified.join(", ")}. They are
              counted nowhere above rather than folded into a total.
            </p>
          ) : null}

          {named ? (
            <div className={styles.punchline}>
              <p className={styles.punchHead}>
                And the one that names a competitor names a sibling
              </p>
              <p className={styles.punchBody}>
                {named.short}. Dave and Buster's completed its acquisition of
                Main Event on{" "}
                <span className="num">29 June 2022</span>, so a buyer defending
                their annual night at Dave and Buster's is defending a night
                already held by the same parent company. The register's own
                recommended answer is not to compete on brand at all.
                <ProvenanceBadge provenance="public" compact />
              </p>
              <p className={styles.punchLink}>
                <Link className="tap" to="/objections">
                  The objection, its answer, and what the answer costs
                </Link>
              </p>
            </div>
          ) : null}
        </section>

        {/* =========================================================
            TWO. THE LOSSES.
            ========================================================= */}
        <section className={styles.losses} aria-labelledby="losses-h">
          <div className={styles.sectionHead}>
            <p className={styles.sectionEyebrow}>What actually killed them</p>
            <h2 className={styles.h2} id="losses-h">
              The deals on record that died
            </h2>
            <p className={styles.sectionLede}>
              Derived from the threads rather than typed beside them, so every
              row below can be opened and checked. The date is the day the
              record moved to lost, read against{" "}
              <span className="num">{formatDate(asOf)}</span>.
            </p>
          </div>

          <div className={styles.tiles}>
            <div className={styles.tile}>
              <span className={`${styles.tileValue} num`}>{reading.total}</span>
              <span className={styles.tileLabel}>
                losses on record
                <ProvenanceBadge provenance="illustrative" compact />
              </span>
            </div>
            <div className={styles.tile} data-emphasis="true">
              <span className={`${styles.tileValue} num`}>
                {reading.toACategoryRival}
              </span>
              <span className={styles.tileLabel}>
                lost to a bowling or arcade venue
                <ProvenanceBadge provenance="modeled" compact />
              </span>
            </div>
            <div className={styles.tile}>
              <span className={`${styles.tileValue} num`}>
                {reading.buyerWroteIt}
              </span>
              <span className={styles.tileLabel}>
                reasons in the buyer's own words
                <ProvenanceBadge provenance="modeled" compact />
              </span>
            </div>
            <div className={styles.tile}>
              <span className={`${styles.tileValue} num`}>
                {reading.askable}
              </span>
              <span className={styles.tileLabel}>
                still inside ninety days
                <ProvenanceBadge provenance="modeled" compact />
              </span>
            </div>
          </div>

          {/* -------------------------------------------------------
              THE BIAS THE LITERATURE WARNS ABOUT, AND THE ONE HONEST
              THING A FLOOR THIS SIZE CAN DO ABOUT IT.
              ------------------------------------------------------- */}
          <div className={styles.bias}>
            <h3 className={styles.h3}>Who wrote the reason down</h3>
            <p className={styles.biasBody}>
              Win and loss work says the reason should not be collected by the
              person who lost the deal, because a seller leading the interview
              hears what they want, and that it should be collected inside
              three months, because after that the buyer's memory of the
              evaluation has been overwritten. A venue with one manager and two
              seats has no independent interviewer and is not going to get one.
              So this register grades the evidence instead of pretending the
              problem is absent.
            </p>
            <ul className={styles.legendList}>
              {(["buyer-wrote-it", "seat-wrote-it", "no-reason-on-file"] as const).map(
                (key) => {
                  const meta = LOSS_EVIDENCE_META[key];
                  return (
                    <li className={styles.legendRow} key={key}>
                      <span
                        className={styles.legendGlyph}
                        aria-hidden="true"
                        style={{ ["--tone" as string]: meta.cssVar }}
                      >
                        {meta.glyph}
                      </span>
                      <span className={styles.legendLabel}>{meta.label}</span>
                      <span className={styles.legendNote}>{meta.note}</span>
                    </li>
                  );
                },
              )}
            </ul>
          </div>

          {/* -------------------------------------------------------
              THE FILTER. Three buttons, a count that moves, and one
              polite region that says what moved. Nothing celebrates
              when a set empties, because an empty askable set is
              three conversations nobody had in time.
              ------------------------------------------------------- */}
          <div className={styles.filterBar}>
            <div
              className={styles.filterButtons}
              role="group"
              aria-label="Which losses to show"
            >
              {(["all", "askable", "cold"] as const).map((key) => {
                const meta = LOSS_FILTER_META[key];
                const count =
                  key === "all"
                    ? reading.total
                    : key === "askable"
                      ? reading.askable
                      : reading.cold;
                const on = filter === key;
                return (
                  <button
                    key={key}
                    type="button"
                    className={styles.filterBtn}
                    data-on={on}
                    aria-pressed={on}
                    title={meta.note}
                    onClick={() => setFilter(key)}
                  >
                    <span>{meta.label}</span>
                    <span className={`${styles.filterCount} num`}>{count}</span>
                  </button>
                );
              })}
            </div>
            <p className={styles.filterState} role="status" aria-live="polite">
              Showing <span className="num">{shown.length}</span> of{" "}
              <span className="num">{reading.total}</span> losses.{" "}
              {LOSS_FILTER_META[filter].note}
            </p>
          </div>

          <div className={styles.lossRows}>
            {shown.map((row) => {
              const cause = LOSS_CAUSE_META[row.cause];
              const evidence = LOSS_EVIDENCE_META[row.evidence];
              const recall = RECALL_META[row.standing];
              const objection = row.objectionId
                ? OBJECTION_BY_ID[row.objectionId]
                : undefined;
              return (
                <article
                  className={styles.loss}
                  key={row.prospectId}
                  aria-labelledby={`loss-${row.prospectId}`}
                >
                  <div className={styles.lossHead}>
                    <h3 className={styles.lossName} id={`loss-${row.prospectId}`}>
                      {row.name}
                    </h3>
                    <LaneChip lane={row.lane} size="sm" />
                    <span className={`${styles.lossDate} num`}>
                      Lost {formatDate(row.lostOn)}
                    </span>
                  </div>

                  <blockquote className={styles.lossVoice}>
                    <p className={styles.lossVoiceText}>{row.reason}</p>
                    <footer className={styles.lossVoiceFoot}>
                      <span
                        className={styles.marker}
                        style={{ ["--tone" as string]: evidence.cssVar }}
                        title={evidence.note}
                      >
                        <span aria-hidden="true" className={styles.markerGlyph}>
                          {evidence.glyph}
                        </span>
                        <span>{evidence.label}</span>
                      </span>
                      <span className={styles.lossChannel}>
                        Arrived on {CHANNEL_WORD[row.channel] ?? row.channel}
                      </span>
                      <ProvenanceBadge provenance="illustrative" compact />
                    </footer>
                  </blockquote>

                  <div className={styles.lossGrid}>
                    <div className={styles.lossCell}>
                      <p className={styles.lossCellLabel}>What beat us</p>
                      <p
                        className={styles.marker}
                        style={{ ["--tone" as string]: cause.cssVar }}
                        title={cause.note}
                      >
                        <span aria-hidden="true" className={styles.markerGlyph}>
                          {cause.glyph}
                        </span>
                        <span>{cause.label}</span>
                      </p>
                      {row.because ? (
                        <p className={styles.lossCellBody}>{row.because}</p>
                      ) : null}
                    </div>

                    <div className={styles.lossCell}>
                      <p className={styles.lossCellLabel}>
                        Competitor named by the buyer
                      </p>
                      {row.namedCompetitor ? (
                        <p className={styles.lossCellBody}>
                          {row.namedCompetitor}
                        </p>
                      ) : (
                        <p className={styles.lossCellNone}>
                          <span aria-hidden="true">○</span> Nobody. They named a
                          date, not a venue.
                        </p>
                      )}
                    </div>

                    <div className={styles.lossCell}>
                      <p className={styles.lossCellLabel}>
                        Still worth ringing about
                      </p>
                      <p
                        className={styles.marker}
                        style={{ ["--tone" as string]: recall.cssVar }}
                        title={recall.note}
                      >
                        <span aria-hidden="true" className={styles.markerGlyph}>
                          {recall.glyph}
                        </span>
                        <span>{recall.label}</span>
                      </p>
                      <p className={styles.lossCellBody}>
                        {row.standing === "askable" ? (
                          <>
                            <span className="num">{row.daysLeft}</span> days left
                            of the <span className="num">{RECALL_WINDOW_DAYS}</span>{" "}
                            day window.
                          </>
                        ) : row.standing === "cold" ? (
                          <>
                            <span className="num">{row.daysSince}</span> days on.
                            What is on this row is the whole of it.
                          </>
                        ) : (
                          <>Recorded after the date being read.</>
                        )}
                        <ProvenanceBadge provenance="modeled" compact />
                      </p>
                    </div>
                  </div>

                  <p className={styles.lossFoot}>
                    {objection ? (
                      <>
                        <span className={styles.lossFootLabel}>
                          Objection on the register
                        </span>
                        <Link className="tap" to="/objections">
                          {objection.short}
                        </Link>
                      </>
                    ) : (
                      <span className={styles.lossCellNone}>
                        <span aria-hidden="true">○</span> No reply on file pins
                        this one to an objection.
                      </span>
                    )}
                    <Link className="tap" to="/replies">
                      What came back
                    </Link>
                  </p>
                </article>
              );
            })}

            {shown.length === 0 ? (
              /* No celebration here, and the sentence is the reason why. */
              <p className={styles.emptySet}>
                <span aria-hidden="true">○</span> No losses in this set on{" "}
                <span className="num">{formatDate(asOf)}</span>.{" "}
                {filter === "askable"
                  ? "Every reason on file is more than ninety days old, which is three conversations nobody had in time rather than an achievement."
                  : "Every loss on record is still inside its window, so all three are worth a telephone call this week."}
              </p>
            ) : null}
          </div>
        </section>

        {/* =========================================================
            THREE. WHAT A REP DOES ON MONDAY.
            ========================================================= */}
        <section className={styles.play} aria-labelledby="play-h">
          <p className={styles.sectionEyebrow}>What this changes</p>
          <h2 className={styles.h2} id="play-h">
            The play is the calendar, not the price
          </h2>

          <ol className={styles.playList}>
            <li className={styles.playItem}>
              <p className={styles.playHead}>Ask when the contract ends</p>
              <p className={styles.playBody}>
                Fairway Ford's holiday party is contracted at a hotel and has
                been for three years. That date is worth more than this year's
                party, and nobody can undercut it because nobody knows what it
                costs. The same reply left February open in the same sentence.
              </p>
              <Link className="tap" to="/book/week">
                Put February in the week sheet
              </Link>
            </li>
            <li className={styles.playItem}>
              <p className={styles.playHead}>Take the second occasion</p>
              <p className={styles.playBody}>
                Every organisation that buys a group night buys two, one to
                reward the team and one to entertain the customer, and the
                second has no incumbent defending it. It is the answer to the
                only objection in the register that names a competitor and it
                is the answer to the two that name a calendar.
              </p>
              <Link className="tap" to="/objections">
                The seven sentences and their answers
              </Link>
            </li>
            <li className={styles.playItem}>
              <p className={styles.playHead}>Be in the room before July</p>
              <p className={styles.playBody}>
                Sell My Home Real Estate booked and paid for its client event
                in July, two months before this venue had anybody to ask them.
                That is not a lost pitch, it is a pitch that never happened,
                and the only fix for it is the untouched half of the board.
              </p>
              <Link className="tap" to="/">
                The desk, in order of who is reachable
              </Link>
            </li>
          </ol>
        </section>

        {/* =========================================================
            FOUR. THE REGISTER.
            ========================================================= */}
        <section className={styles.register} aria-labelledby="register-h">
          <div className={styles.sectionHead}>
            <p className={styles.sectionEyebrow}>Published facts only</p>
            <h2 className={styles.h2} id="register-h">
              The competitive register
            </h2>
            <p className={styles.sectionLede}>
              <span className="num">{RIVALS.length}</span> venues, each opened
              and read rather than recalled. Every claim carries its address
              and its read date. Where a page says nothing, this register says
              nothing.
            </p>
          </div>

          {/* -----------------------------------------------------
              THE ONE FIGURE THIS PAGE WOULD HAVE BEEN BUILT ROUND,
              RENDERED AS THE SENTENCE IT ACTUALLY IS.
              ----------------------------------------------------- */}
          {/*
            NOT `WithheldFigure`, AND THE REASON IS THE WHOLE POINT.

            That component prints "Main Event does not publish this",
            which is correct on every other screen in this application
            and wrong here. The figure missing from this section is not
            Main Event's, it is six other companies', and putting
            Main Event's name over it would misattribute the silence.
            Same glyph, same discipline, different sentence.
          */}
          <div className={styles.noPrice}>
            <p className={styles.noPriceLabel}>
              A group price for any venue in this register
            </p>
            <p className={styles.noPriceLead}>
              <span aria-hidden="true" className={styles.noPriceGlyph}>
                ▩
              </span>
              <span>Not one of the {RIVALS.length} publishes one</span>
            </p>
            <p className={styles.noPriceBody}>
              Every venue below was opened on{" "}
              <span className="num">14 August 2026</span> and not one carries a
              per head group figure. Three national chains, one independent, one
              sibling brand and one members' club, and all of them route to a
              form, a planner or a telephone. It is the same gate Main Event
              puts on its own group pricing and the same gate{" "}
              <Link to="/leagues">the leagues</Link> hit on league fees. Rate
              shopping this segment is not difficult, it is impossible, and a
              grid of prices here would be{" "}
              <span className="num">{RIVALS.length}</span> invented numbers about{" "}
              <span className="num">{RIVALS.length}</span> real businesses.
              <ProvenanceBadge provenance="public" compact />
            </p>
          </div>

          {/* The dated promotion, read against the clock. */}
          <div
            className={styles.promo}
            style={{ ["--tone" as string]: promoMeta.cssVar }}
          >
            <p className={styles.promoHead}>
              <span aria-hidden="true" className={styles.promoGlyph}>
                {promoMeta.glyph}
              </span>
              <span className={styles.promoCode}>{promotion.code}</span>
              <span className={styles.promoStanding}>{promoMeta.label}</span>
            </p>
            <p className={styles.promoOffer}>
              {promotion.offer}, published on both Lucky Strike location pages.
              The page prints{" "}
              <span className={styles.quoted}>{promotion.printedWindow}</span>.
            </p>
            <p className={styles.promoNote}>{promoMeta.note}</p>
            <p className={styles.promoBasis}>
              <span className={styles.promoBasisLabel}>The year is a reading</span>
              {promotion.yearBasis} So this register treats it as closing{" "}
              <span className="num">{formatDate(promotion.booksBy)}</span> for
              events held by{" "}
              <span className="num">{formatDate(promotion.heldBy)}</span>, and
              reads that against{" "}
              <span className="num">{formatDate(asOf)}</span>.
              <ProvenanceBadge provenance="modeled" compact />
            </p>
            <Cite url={promotion.sourceUrl} readOn={promotion.readOn} />
          </div>

          <div className={styles.rivalGrid}>
            {RIVALS.map((rival) => (
              <RivalCard key={rival.id} rival={rival} />
            ))}
          </div>

          {/* The rebrand. A checkable dated fact of exactly the kind a
              register is for, and one that saves a confused search. */}
          <div className={styles.rebrand}>
            <h3 className={styles.h3}>The rename, which is why half the search results are wrong</h3>
            <p className={styles.rebrandBody}>
              {REBRAND_NOTE.headline}, announced{" "}
              <span className="num">{formatDate(REBRAND_NOTE.announced)}</span>.{" "}
              {REBRAND_NOTE.scale}.
              <ProvenanceBadge provenance="public" compact />
            </p>
            <p className={styles.rebrandBody}>{REBRAND_NOTE.liveEvidence}</p>
            {/* Two sources, because one of them carries the date and the
                other carries the scale, and neither is asked to support
                a claim it does not make. */}
            <Cite
              url={REBRAND_NOTE.announcedSourceUrl}
              readOn={REBRAND_NOTE.readOn}
            />
            <Cite url={REBRAND_NOTE.sourceUrl} readOn={REBRAND_NOTE.readOn} />
            <Cite
              url={REBRAND_NOTE.liveEvidenceFrom}
              readOn={REBRAND_NOTE.readOn}
            />
          </div>

          {/* The comp set boundary, and the row this application already
              deleted for the same reason. */}
          <div className={styles.boundary}>
            <h3 className={styles.h3}>Where the boundary was drawn, and why it held</h3>
            <p className={styles.boundaryBody}>
              Round1 is the venue everybody names, and its own locations list
              has no Brea entry and no Brea Mall entry. It is a category
              competitor and not a trade area one, which is the second time
              this application has reached that conclusion about the same
              company: Round One Entertainment came off the prospecting board
              in the first research pass because two sources disagreed about
              where its office was, and{" "}
              <span className="num">{EXCLUDED_FROM_BOARD.length}</span> more
              organisations were refused under the same rule.
            </p>
            <p className={styles.boundaryFoot}>
              <Link className="tap" to="/method">
                Every formula, every source, and every row that was thrown away
              </Link>
            </p>
          </div>
        </section>

        {/* =========================================================
            FIVE. WHAT CANNOT BE KNOWN.
            ========================================================= */}
        <section className={styles.refused} aria-labelledby="refused-h">
          <div className={styles.sectionHead}>
            <p className={styles.sectionEyebrow}>Named rather than fudged</p>
            <h2 className={styles.h2} id="refused-h">
              What this screen cannot know
            </h2>
            <p className={styles.sectionLede}>
              <span className="num">{REFUSED_FACTS.length}</span> things a
              competitor grid would happily have contained. Each one was looked
              for and each one is absent on purpose.
            </p>
          </div>

          <ul className={styles.refusedList}>
            {REFUSED_FACTS.map((item) => (
              <li className={styles.refusedRow} key={item.claim}>
                <span aria-hidden="true" className={styles.refusedGlyph}>
                  ▩
                </span>
                <div>
                  <p className={styles.refusedClaim}>{item.claim}</p>
                  <p className={styles.refusedWhy}>{item.why}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* The Phoenix Club is a row on the prospect board and a row in
            this register at once. That is not a duplicate, it is what a
            club with its own hall actually is in a town this size. */}
        <p className={styles.pageFoot}>
          One organisation appears twice on this screen, as a prospect that
          said no and as a venue with its own ballroom. Nothing on this page is
          scored, ranked or projected.{" "}
          <Link className="tap" to="/method">
            Every formula and source
          </Link>
        </p>
      </div>
    </div>
  );
}
