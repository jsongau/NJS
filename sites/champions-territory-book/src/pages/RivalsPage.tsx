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
 * ── THE OBVIOUS BUILD, AND WHY HALF OF IT WOULD BE A LIE ──────────
 * The expected screen here is a grid: rival brands down the side, a
 * price in every cell, a green tick where we are cheaper. Half of that
 * grid can be built and it is built below, because the coupons in this
 * market are genuinely published: fifty seven dollars for a drain with
 * a promo code, seventy seven with an access limit, ninety nine at
 * four storefronts, fifty off a repair almost everywhere, five hundred
 * off a replacement at the franchises and an up to ceiling of fifteen
 * hundred to two thousand elsewhere, tune-ups from fifty nine to
 * 89.95.
 *
 * The other half cannot be built at all. Thirteen rival brands were
 * profiled across five counties and NOT ONE publishes what its
 * membership costs. Every one names a plan and hides the number. So a
 * plan price column would be thirteen invented figures about thirteen
 * real businesses, on the one screen in this application whose job
 * is factual accuracy about other people's businesses. It is the worst
 * possible place to make something up and it is exactly what the naive
 * version does.
 *
 * ── WHAT IS ACTUALLY TRUE, AND IT IS MORE USEFUL ──────────────────
 * The register of seven objections in `data/objections.ts` sorts into
 * three classes and the sort is the finding. Three are our own gap: a
 * ticket that loses to a smaller outfit because nothing published
 * justifies it, a rebate landscape our own reps have to know better
 * than the utility's website does, and a replacement pitched at
 * somebody who asked for a repair. Three are somebody else's decision
 * cycle: an incumbent tradesman, an absent landlord, a board that
 * wants three bids. One quotes a rival's published price, and that
 * price belongs to a brand which publishes a partnership with the
 * brand holding the next price up.
 *
 * The three jobs on record that actually died agree with it. A
 * maintenance agreement already in place, an organisation with its own
 * maintenance staff, and a replacement signed in July before this desk
 * had anybody to ask. None of them to a rival's coupon.
 *
 * That changes what a marketing manager does on Monday, which is the
 * test this screen was built against. "NEXGEN exists and it is cheap"
 * changes nothing. "Six of seven objections are ours or theirs and not
 * one loss on record went to a rival's price, and nobody in the market
 * prices a membership" changes the whole budget: stop bidding the
 * drain price down, publish the plan, and be in the conversation
 * before July rather than after it.
 *
 * ── THE CLOCK IS PART OF THE ARGUMENT ─────────────────────────────
 * `useAsOf()` is consumed rather than reimplemented. Win and loss
 * practice says a loss reason should be collected inside three months,
 * because after that the customer's memory of the decision has been
 * overwritten, so every loss here has ninety days on it. On the board
 * day all three are still worth ringing about. By the end of December
 * none of them is. The rival coupon is read against the same clock and
 * moves from claimable to expired on its own printed date.
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
 * rival's coupon page is a moving target in a way a static seed is
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
// One brand in the register
// ---------------------------------------------------------------

const STANDING_META: Record<
  Rival["standing"],
  { label: string; glyph: string; cssVar: string; note: string }
> = {
  "trade-area": {
    label: "In the territory",
    glyph: "◆",
    cssVar: "var(--sec-ink, var(--sec-rivals-ink))",
    note: "Same services, close enough to take the same call on the same afternoon.",
  },
  "category-only": {
    label: "Same trade, wrong map",
    glyph: "◇",
    cssVar: "var(--neutral)",
    note: "The same trade and no branch near enough to compete for a call here. In the register to mark the boundary rather than to be watched.",
  },
  "same-parent": {
    label: "Publishes a partnership",
    glyph: "◈",
    cssVar: "var(--info)",
    note: "Its own About page names another brand in this register as a partner. Quoted by homeowners as an independent rival, and not one.",
  },
  "guarantee-led": {
    label: "Not competing on price",
    glyph: "▣",
    cssVar: "var(--warn)",
    note: "No dollar coupon anywhere on the site. It sells a guarantee with a dollar mechanic on it and a magazine credential, which is what wins a job when three quotes are on the kitchen table.",
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
          THE COLUMN A PLAN PRICE GRID WOULD HAVE HAD, TELLING THE
          TRUTH INSTEAD. Every brand in this register has one and
          every one of them starts with the same line.
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
          <span className={styles.routesLabel}>Asking what the plan costs hits</span>
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
            The coupons in this market are published and they cluster: drain
            clearing is a price war entirely under a hundred dollars, repair
            discounts converge on fifty off, replacement splits between a flat
            five hundred and an up to ceiling of fifteen hundred to two
            thousand. The membership price is published by nobody at all,
            across fourteen brands. So the coupons are printed below with
            their sources, the plan prices are marked absent, and neither is
            guessed at. What is real is why jobs actually died, and it is not
            a rival.
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
            record are nothing to do with a rival's price
          </h2>
          <p className={styles.findingLede}>
            This brand loses to its own gaps and to somebody else's decision
            cycle. Exactly one of the seven is a rival's published figure, and
            the answer the register recommends for that one is not to match
            it.
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
                And the one that quotes a rival quotes a partnership
              </p>
              <p className={styles.punchBody}>
                {named.short}. The brand publishing that{" "}
                <span className="num">$57</span> price describes itself on its
                own About page as a proud partner of the brand publishing{" "}
                <span className="num">$77</span>, so the two cheapest numbers
                in the drain aisle were set by partners rather than by two
                independent bidders. Matching the floor means bidding against
                a floor two companies agreed on. The register's own
                recommended answer is not to match it at all.
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
              The jobs on record that died
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
                lost to a rival's published price
                <ProvenanceBadge provenance="modeled" compact />
              </span>
            </div>
            <div className={styles.tile}>
              <span className={`${styles.tileValue} num`}>
                {reading.buyerWroteIt}
              </span>
              <span className={styles.tileLabel}>
                reasons in the customer's own words
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
              person who lost the job, because a seller leading the interview
              hears what they want, and that it should be collected inside
              three months, because after that the customer's memory of the
              decision has been overwritten. A brand team with one manager and
              a shared inbox has no independent interviewer and is not going to
              get one. So this register grades the evidence instead of
              pretending the problem is absent.
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
                        Anybody the customer named
                      </p>
                      {row.namedCompetitor ? (
                        <p className={styles.lossCellBody}>
                          {row.namedCompetitor}
                        </p>
                      ) : (
                        <p className={styles.lossCellNone}>
                          <span aria-hidden="true">○</span> Nobody. They named a
                          date, not a price.
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
            The play is the plan price, not the coupon
          </h2>

          <ol className={styles.playList}>
            <li className={styles.playItem}>
              <p className={styles.playHead}>Publish what the club costs</p>
              <p className={styles.playBody}>
                Eight name a membership and hide the number, five publish none at all, and not one of the fourteen publishes a price, and two
                of them are inside this division's own family. A monthly figure
                on the landing page, with the tune-up, the waived diagnostic,
                the priority window and the repair discount itemised against
                it, is the one claim in this market that cannot be answered by
                printing a smaller coupon. It also turns a one job click into
                revenue that renews.
              </p>
              <Link className="tap" to="/calendar">
                Put it in the week sheet
              </Link>
            </li>
            <li className={styles.playItem}>
              <p className={styles.playHead}>Stop bidding the drain down</p>
              <p className={styles.playBody}>
                Fifty seven has already broken the floor and it was set by two
                brands that publish a partnership with each other, so the next
                move down is unprofitable and it is not even a move against an
                independent. The free camera inspection is published by four
                brands, which makes it table stakes rather than a hook. Neither
                one is worth a budget line.
              </p>
              <Link className="tap" to="/objections">
                The seven sentences and their answers
              </Link>
            </li>
            <li className={styles.playItem}>
              <p className={styles.playHead}>Know which money is still live</p>
              <p className={styles.playBody}>
                Rivals are still advertising a federal credit that ended for
                anything placed in service after 31 December 2025 and a state
                heat pump programme that has been fully reserved in Southern
                California since 7 January 2026. Naming what is live instead,
                SoCalGas through 31 December 2026 and LADWP at up to 2,500 a
                ton, is a differentiator that costs nothing but a briefing.
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
              <span className="num">{RIVALS.length}</span> brands, each opened
              and read rather than recalled, out of fourteen profiled across
              the five counties. Every claim carries its address and its read
              date. Where a page says nothing, this register says nothing.
            </p>
          </div>

          {/* -----------------------------------------------------
              THE ONE FIGURE THIS PAGE WOULD HAVE BEEN BUILT ROUND,
              RENDERED AS THE SENTENCE IT ACTUALLY IS.
              ----------------------------------------------------- */}
          {/*
            NOT `WithheldFigure`, AND THE REASON IS THE WHOLE POINT.

            That component prints that this brand does not publish the
            figure, which is correct on every other screen in this
            application and wrong here. The number missing from this
            section is not ours, it is fourteen other companies', and
            putting our own name over their silence would misattribute
            it. Same glyph, same discipline, different sentence.
          */}
          <div className={styles.noPrice}>
            <p className={styles.noPriceLabel}>
              A membership price for any brand in this register
            </p>
            <p className={styles.noPriceLead}>
              <span aria-hidden="true" className={styles.noPriceGlyph}>
                ▩
              </span>
              <span>Not one of the {RIVALS.length} publishes one</span>
            </p>
            <p className={styles.noPriceBody}>
              Every brand below was opened on{" "}
              <span className="num">18 August 2026</span> and not one carries a
              monthly plan figure, and neither do the eight others profiled
              alongside them. Eight name a plan and hide the number, five
              publish no plan at all, and not one of the fourteen publishes a
              price, so a homeowner can compare six drain prices in ninety
              seconds and cannot compare a single maintenance plan. It is the
              same gate this division puts on its own club, which the offer
              shelf on{" "}
              <Link to="/lanes">the service lines board</Link> records in
              full. Rate shopping the plan is not difficult, it is impossible,
              and a plan price column here would be{" "}
              <span className="num">{RIVALS.length}</span> invented numbers about{" "}
              <span className="num">{RIVALS.length}</span> real businesses. The
              coupons, by contrast, are printed on every row below with the
              page they came off.
              <ProvenanceBadge provenance="public" compact />
            </p>
          </div>

          {/* The dated coupon, read against the clock. */}
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
              {promotion.offer}, published by two brands in this register and
              dated by only one of them. The coupon prints{" "}
              <span className={styles.quoted}>{promotion.printedWindow}</span>.
            </p>
            <p className={styles.promoNote}>{promoMeta.note}</p>
            <p className={styles.promoBasis}>
              <span className={styles.promoBasisLabel}>How the dates were read</span>
              {promotion.yearBasis} So this register treats it as closing to
              new claims on{" "}
              <span className="num">{formatDate(promotion.booksBy)}</span>, with
              no separate date published for finishing the work, and reads that
              against <span className="num">{formatDate(asOf)}</span>.
              <ProvenanceBadge provenance="modeled" compact />
            </p>
            <Cite url={promotion.sourceUrl} readOn={promotion.readOn} />
          </div>

          <div className={styles.rivalGrid}>
            {RIVALS.map((rival) => (
              <RivalCard key={rival.id} rival={rival} />
            ))}
          </div>

          {/* The stale page. A checkable dated fact of exactly the kind
              a register is for, and one a price grid would never hold. */}
          <div className={styles.rebrand}>
            <h3 className={styles.h3}>The page nobody in that market owns</h3>
            <p className={styles.rebrandBody}>
              {REBRAND_NOTE.headline}. Every coupon on it is dated{" "}
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
              Sierra Air comes up in searches for California HVAC operators and
              works Lake Tahoe, Truckee and Portola out of Reno. It is in the
              trade and it is not in the territory, so it sits in the register
              marked as such rather than being quietly counted as a rival. That
              is the same rule the prospecting board runs on:{" "}
              <span className="num">{EXCLUDED_FROM_BOARD.length}</span>{" "}
              organisations were refused a place there for failing a check of
              exactly this kind, and each refusal is published rather than
              deleted.
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

        {/* Two of the six rows are a rival and a partner at the same
            time, which is what a market of franchises and networks
            actually looks like from the outside. */}
        <p className={styles.pageFoot}>
          Two brands on this screen publish a partnership with each other while
          holding the two cheapest drain prices in the market. Nothing on this
          page is scored, ranked or projected.{" "}
          <Link className="tap" to="/method">
            Every formula and source
          </Link>
        </p>
      </div>
    </div>
  );
}
