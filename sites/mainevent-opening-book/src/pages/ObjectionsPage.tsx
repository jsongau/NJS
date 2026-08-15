import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Lane, Reply } from "@/domain/types";
import { SEVERITY_META, type ObjectionDisposition } from "@/data/objections";
import { PROSPECTS } from "@/data/prospects";
import { PACKAGES, GATED_PACKAGES, BANQUET_FLOOR_PER_GUEST } from "@/data/packages";
import { OFFER_BY_ID } from "@/data/venue";
import { LANE_ORDER } from "@/domain/lanes";
import { furthestStatus, usePipeline, usePipelineDispatch } from "@/state/PipelineProvider";
import { useBook } from "@/state/BookProvider";
import {
  DISPOSITION_META,
  objectionCounts,
  objectionRows,
  useObjectionDispatch,
  useObjections,
  type ObjectionRow,
} from "@/state/ObjectionProvider";
import { Figure, ProvenanceBadge, WithheldFigure } from "@/components/primitives/ProvenanceBadge";
import { LaneChip } from "@/components/primitives/LaneChip";
import { Button } from "@/components/primitives/Button";
import styles from "./ObjectionsPage.module.css";

/**
 * THE OBJECTION REGISTER, as a screen somebody works rather than reads.
 *
 * ----- WHY A REGISTER EXISTS AT ALL -----------------------------------
 *
 * An objection heard once is a conversation. An objection heard three
 * times is a product problem, and the two want completely different
 * work. The first is answered by a better sentence on the next call.
 * The second is answered by changing what the venue actually offers, or
 * by spending a season on hard hat tours, or by accepting that a whole
 * lane is unsellable until a date is published. Nothing tells those two
 * apart except writing them down, and a sales floor that does not write
 * them down relearns the same lesson every quarter with a different rep.
 *
 * So this page is a register and not a script. Each row carries the
 * objection IN THE BUYER'S OWN VOICE, why they are right to raise it,
 * the answer that works, WHAT THAT ANSWER COSTS THE VENUE, and a
 * disposition the reader can set. The cost line is the one most
 * objection-handling documents leave out and the one a general manager
 * reads first, because every answer on this page gives something away:
 * a held date gives away optionality on the calendar, a hard hat tour
 * gives away an hour and a conversation with the general contractor, a
 * Spirit Night gives away twenty percent of a night's sales.
 *
 * ----- WHY ONE CARD IS TWICE THE SIZE OF THE OTHERS -------------------
 *
 * "Your website will not tell me what it costs" is not one objection
 * among seven. It is true of every conversation in every lane, it is
 * Main Event's own deliberate design rather than an accident of the
 * website, and the honest answer to it is the entire argument for
 * filling this role. Main Event publishes a price for every product a
 * parent buys alone at night on a phone and publishes none for any
 * corporate or group package; those pages say to contact the local sales
 * manager. The price really does come from a person, and Brea does not
 * have that person yet.
 *
 * A reader who reads exactly one card on this page should read that one,
 * so it is lifted out of the list, given the page's only amber rule and
 * the largest pull quote in the application. Ranking by severity alone
 * would have left it as the first of seven identical cards, which is a
 * layout that has quietly decided all seven are the same size of
 * problem.
 *
 * ----- WHERE THE BLOCKING NUMBERS COME FROM ---------------------------
 *
 * Nothing on this page counts how many times somebody said a sentence,
 * because nobody has been standing in the trade area with a tally
 * counter. What is countable is EXPOSURE: the organisations sitting in
 * the lanes an objection covers that are not yet booked and not recorded
 * as lost. That is computed live off the fact table, so advancing one
 * school on the desk moves the figure here, and it carries a modeled
 * badge because it is derived rather than observed.
 *
 * Beside it sits a smaller and harder number: the replies on file that
 * actually named the objection. Two of the seven have one. That gap
 * between what the register models and what the record proves is worth
 * showing rather than smoothing over, which is why both figures appear
 * on every card and neither one is presented as the other.
 */

// ---------------------------------------------------------------
// Dates
// ---------------------------------------------------------------

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Split rather than parsed, for the reason the Book and Replies pages
 * give: `new Date("2026-09-24")` is midnight UTC, and formatting that in
 * California prints the twenty third.
 */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/**
 * The stamp on a disposition change.
 *
 * The wall clock is correct here and it is not correct on the Replies
 * page, which is worth a sentence because the two look inconsistent
 * otherwise. A dated seed read through a live clock goes stale; an
 * action the reader just performed happened today, whenever today is.
 */
const TODAY = new Date().toISOString().slice(0, 10);

// ---------------------------------------------------------------
// Reading order for the three dispositions
// ---------------------------------------------------------------

/**
 * Live, then worked, then lost.
 *
 * Declared here rather than in the provider for the same reason the
 * reply reading order lives on the replies page: no other screen has an
 * opinion about it, and a shared file earns its authority by holding
 * only the values several screens must agree on.
 */
const DISPOSITION_ORDER: ObjectionDisposition[] = ["open", "answered", "lost-to-it"];

// ---------------------------------------------------------------
// Exposure
// ---------------------------------------------------------------

/**
 * What an objection can currently block, and what the record proves.
 *
 * `blocks` is deliberately not "organisations in these lanes". A booked
 * contract cannot be blocked by an objection, and an organisation
 * already recorded as lost is not being blocked by anything any more, so
 * both drop out. Leaving them in would have made the figure bigger and
 * meaningless, which is the usual direction that mistake goes.
 */
interface Exposure {
  /** Live organisations in the lanes this objection covers. */
  blocks: number;
  /** Of those, the ones nobody has approached yet at all. */
  untouched: number;
  /** Replies on file that named this objection by id. */
  raised: Reply[];
}

// ---------------------------------------------------------------
// One row of the register
// ---------------------------------------------------------------

type Tone = "feature" | "notable" | "plain";

function ObjectionCard({
  row,
  exposure,
  tone,
  onWorkLanes,
  children,
}: {
  row: ObjectionRow;
  exposure: Exposure;
  tone: Tone;
  onWorkLanes: (lanes: Lane[]) => void;
  /** The extra block a feature card carries and a plain one does not. */
  children?: ReactNode;
}) {
  const { objection, entry } = row;
  const dispatch = useObjectionDispatch();
  const severity = SEVERITY_META[objection.severity];
  const offer = objection.offerId ? OFFER_BY_ID[objection.offerId] : undefined;

  /*
    The note is drafted locally and saved on submit rather than dispatched
    on every keystroke. Two reasons, and the second is the real one.
    Dispatching per character would stamp `updatedAt` forty times for one
    sentence, so the register would report that a row was worked at the
    moment somebody paused typing. And a note is a considered thing: the
    act of pressing save is the act of deciding the sentence is worth
    keeping.
  */
  const [draft, setDraft] = useState(entry.note ?? "");

  const lanes = LANE_ORDER.filter((lane) => objection.lanes.includes(lane));
  const everyLane = lanes.length === LANE_ORDER.length;

  const saveNote = (e: FormEvent) => {
    e.preventDefault();
    dispatch({
      type: "SET_NOTE",
      objectionId: objection.id,
      note: draft.trim(),
      at: TODAY,
    });
  };

  return (
    <article className={styles.card} data-tone={tone} aria-labelledby={`obj-${objection.id}`}>
      <div className={styles.cardHead}>
        <h3 className={styles.cardTitle} id={`obj-${objection.id}`}>
          {objection.short}
        </h3>
        <span
          className={styles.severity}
          style={{ ["--tone" as string]: severity.cssVar }}
          title={severity.note}
        >
          <span aria-hidden="true" className={styles.severityGlyph}>
            {severity.glyph}
          </span>
          <span>{severity.label}</span>
        </span>
      </div>

      {/*
        THE ONE VOICE ON THIS PAGE THAT IS NOT THE APPLICATION'S.

        Set in the operator serif, which everywhere else in this build
        marks the moment somebody steps outside the product to speak. A
        buyer's sentence deserves the same treatment for the same reason:
        every other word on this card is the venue talking to itself, and
        the reader needs to be able to tell at a glance which is which.
      */}
      <blockquote className={styles.voice}>
        <p className={styles.voiceText}>{objection.voice}</p>
        <footer className={styles.voiceFoot}>
          <span>
            {objection.provenance === "public"
              ? "The situation behind this sentence is sourced. The wording is written for this work sample."
              : "Written for this work sample. No organisation is described as having said this."}
          </span>
          <ProvenanceBadge provenance={objection.provenance} compact />
        </footer>
      </blockquote>

      <div className={styles.lanes}>
        <p className={styles.lanesLabel}>
          {everyLane ? "Raised in every lane on the board" : "Raised in these lanes"}
        </p>
        <div className={styles.laneChips}>
          {lanes.map((lane) => (
            <LaneChip key={lane} lane={lane} size="sm" />
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------------
          WHAT IT BLOCKS. Two figures, both derived, neither dressed
          up as the other.
          --------------------------------------------------------- */}
      <div className={styles.blocks}>
        <div className={styles.blockFigure}>
          <span className={`${styles.blockValue} num`}>{exposure.blocks}</span>
          <span className={styles.blockLabel}>
            organisations it can block
            <ProvenanceBadge provenance="modeled" compact />
          </span>
        </div>
        <div className={styles.blockFigure}>
          <span className={`${styles.blockValue} num`}>{exposure.untouched}</span>
          <span className={styles.blockLabel}>
            of those never approached
            <ProvenanceBadge provenance="modeled" compact />
          </span>
        </div>
        <div className={styles.blockFigure}>
          <span className={`${styles.blockValue} num`}>{exposure.raised.length}</span>
          <span className={styles.blockLabel}>
            replies on file named it
            <ProvenanceBadge provenance="illustrative" compact />
          </span>
        </div>
        {/* Exposure is modeled off the fact table; replies on file are
            evidence. The two are not the same figure and are never summed. */}
        <p
          className={styles.blockNote}
          title="Exposure counts every organisation in these lanes that is neither booked nor recorded as lost, read off the fact table. Replies on file is the harder figure: answers that actually named this objection."
        >
          Exposure is modeled. Replies on file is evidence.
        </p>
      </div>

      <div className={styles.prose}>
        <section className={styles.block}>
          <h4 className={styles.blockHead}>Why they are right to raise it</h4>
          <p className={styles.blockText}>{objection.why}</p>
        </section>

        <section className={styles.block} data-key="answer">
          <h4 className={styles.blockHead}>The answer that works</h4>
          <p className={styles.blockText}>{objection.answer}</p>
        </section>

        <section className={styles.block} data-key="cost">
          <h4 className={styles.blockHead}>What that answer costs the venue</h4>
          <p className={styles.blockText}>{objection.cost}</p>
        </section>
      </div>

      {children}

      {offer ? (
        <div className={styles.offer}>
          <p className={styles.offerHead}>
            <span aria-hidden="true" className={styles.offerGlyph}>
              ◆
            </span>
            <span className={styles.offerName}>{offer.name}</span>
            <ProvenanceBadge provenance={offer.provenance} compact />
          </p>
          <p className={styles.offerWhat}>{offer.what}</p>
          <p className={styles.offerCost}>{offer.costNote}</p>
        </div>
      ) : null}

      {objection.source ? (
        <p className={styles.source}>
          <span className={styles.sourceLabel}>Source</span>
          {objection.source.startsWith("http") ? (
            <a
              className="tap"
              href={objection.source}
              target="_blank"
              rel="noreferrer"
            >
              {objection.source}
            </a>
          ) : (
            <span>{objection.source}</span>
          )}
        </p>
      ) : null}

      {/* ---------------------------------------------------------
          THE DISPOSITION. Three states, and the third one is why
          this is a register rather than a crib sheet.
          --------------------------------------------------------- */}
      <div className={styles.disposition}>
        <div
          className={styles.dispButtons}
          role="group"
          aria-label={`Disposition for the objection: ${objection.short}`}
        >
          {DISPOSITION_ORDER.map((d) => {
            const meta = DISPOSITION_META[d];
            const on = entry.disposition === d;
            return (
              <button
                key={d}
                type="button"
                className={styles.dispBtn}
                data-on={on}
                aria-pressed={on}
                title={meta.note}
                style={{ ["--tone" as string]: meta.cssVar }}
                onClick={() =>
                  dispatch({
                    type: "SET_DISPOSITION",
                    objectionId: objection.id,
                    disposition: d,
                    at: TODAY,
                  })
                }
              >
                <span aria-hidden="true" className={styles.dispGlyph}>
                  {meta.glyph}
                </span>
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>

        {/*
          Setting a disposition rewrites this sentence and the counts at
          the top of the page, and nothing navigates, so a reader who
          cannot see the row has no confirmation the button did anything.
          Polite, so it lands after the click rather than over it.
        */}
        <p className={styles.dispState} role="status" aria-live="polite">
          {DISPOSITION_META[entry.disposition].note}
          {entry.updatedAt ? (
            <>
              {" "}
              Last changed <span className="num">{formatDate(entry.updatedAt)}</span>
              <ProvenanceBadge provenance="user_input" compact />
            </>
          ) : null}
        </p>

        <form className={styles.noteForm} onSubmit={saveNote}>
          <label htmlFor={`note-${objection.id}`}>What you learned</label>
          <textarea
            id={`note-${objection.id}`}
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Who raised it, what actually landed, and what you would say differently next time."
          />
          <div className={styles.noteSubmit}>
            <Button type="submit" size="sm" variant="secondary">
              Save the note
            </Button>
            <span className={styles.noteHint}>
              A note does not change the disposition.
            </span>
          </div>
        </form>

        {entry.note ? (
          <p className={styles.savedNote}>
            <span aria-hidden="true" className={styles.savedGlyph}>
              ✎
            </span>
            <span>{entry.note}</span>
          </p>
        ) : null}
      </div>

      {/* ---------------------------------------------------------
          CROSS-LINKS. An objection that blocks organisations should
          be able to hand the reader the organisations.
          --------------------------------------------------------- */}
      <div className={styles.foot}>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onWorkLanes(lanes)}
          aria-label={`Filter the desk to the ${lanes.length} lanes that raise ${objection.short}`}
        >
          {everyLane
            ? "Work the whole board on the desk"
            : `Work these ${lanes.length} lanes on the desk`}
        </Button>
        {exposure.raised.length > 0 ? (
          <Link className="tap" to="/replies">
            {exposure.raised.length === 1
              ? "The reply that raised this one"
              : `The ${exposure.raised.length} replies that raised this one`}
          </Link>
        ) : (
          <span className={styles.noEvidence}>
            <span aria-hidden="true">○</span> No reply on file has named this
            one yet.
          </span>
        )}
      </div>
    </article>
  );
}

// ---------------------------------------------------------------
// The page
// ---------------------------------------------------------------

export function ObjectionsPage() {
  const state = useObjections();
  const pipeline = usePipeline();
  const pipelineDispatch = usePipelineDispatch();
  const { replies } = useBook();
  const navigate = useNavigate();

  const rows = objectionRows(state);
  const counts = objectionCounts(state);

  /**
   * The organisations an objection can still stand in front of.
   *
   * One pass over the prospect list, not one per card. Booked and lost
   * both drop out: a signed contract cannot be blocked, and a row already
   * recorded as lost is not being held up by anything any more.
   */
  const live = useMemo(() => {
    return PROSPECTS.filter((p) => {
      const status = furthestStatus(pipeline, p.id);
      return status !== "booked" && status !== "lost";
    }).map((p) => ({
      id: p.id,
      lane: p.lane,
      untouched: furthestStatus(pipeline, p.id) === "unworked",
    }));
  }, [pipeline]);

  const exposures = useMemo(() => {
    const out = new Map<string, Exposure>();
    for (const { objection } of rows) {
      const inLanes = live.filter((p) => objection.lanes.includes(p.lane));
      out.set(objection.id, {
        blocks: inLanes.length,
        untouched: inLanes.filter((p) => p.untouched).length,
        raised: replies.filter((r) => r.objectionId === objection.id),
      });
    }
    return out;
  }, [rows, live, replies]);

  /**
   * Organisations sitting behind AT LEAST ONE open objection.
   *
   * A union rather than a sum, and that distinction is the whole reason
   * this figure is computed here instead of added up from the cards.
   * Every one of the seven objections covers the corporate lane, so
   * summing the card figures would count the same employer seven times
   * and produce a number several times larger than the trade area
   * contains. This is the count
   * that moves when a disposition changes, which is the point of a
   * register you can actually work.
   */
  const behindOpen = useMemo(() => {
    const ids = new Set<string>();
    for (const { objection, entry } of rows) {
      if (entry.disposition !== "open") continue;
      for (const p of live) {
        if (objection.lanes.includes(p.lane)) ids.add(p.id);
      }
    }
    return ids.size;
  }, [rows, live]);

  const workLanes = (lanes: Lane[]) => {
    /* Set rather than add, matching the lane board. A reader who asks to
       work the lanes behind one objection expects exactly those lanes on
       the desk, not those plus whatever was ticked twenty minutes ago. */
    pipelineDispatch({ type: "CLEAR_LANES" });
    for (const lane of lanes) pipelineDispatch({ type: "TOGGLE_LANE", lane });
    navigate("/");
  };

  const featured = rows.find((r) => r.objection.id === "no-published-price");
  const notable = rows.find((r) => r.objection.id === "we-use-dave-and-busters");
  const middle = rows.filter(
    (r) =>
      r.objection.id !== "no-published-price" &&
      r.objection.id !== "we-use-dave-and-busters",
  );

  const cardFor = (row: ObjectionRow, tone: Tone, extra?: ReactNode) => (
    <ObjectionCard
      key={row.objection.id}
      row={row}
      exposure={
        exposures.get(row.objection.id) ?? { blocks: 0, untouched: 0, raised: [] }
      }
      tone={tone}
      onWorkLanes={workLanes}
    >
      {extra}
    </ObjectionCard>
  );

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Stage six, the seven sentences</p>
          <h1 className={styles.h1}>The objection register</h1>
          {/* A register rather than a script: every row carries the answer
              and what the answer costs the venue. */}
          <p
            className={styles.provenanceNote}
            title="The facts underneath these rows are sourced: the gated corporate pricing, the published Spirit Night terms, the absent opening date, the shared parent company. The sentences in quotation marks were written for this work sample."
          >
            <ProvenanceBadge provenance="illustrative" />
            <span>Sourced facts, wording written for this work sample.</span>
          </p>
        </header>

        {/* ---------------------------------------------------------
            WHERE THE REGISTER STANDS. Three dispositions, live counts,
            and the union figure underneath them.
            --------------------------------------------------------- */}
        <section className={styles.standing} aria-labelledby="standing-h">
          <div className={styles.standingHead}>
            <h2 className={styles.h2} id="standing-h">
              Where the register stands today
            </h2>
            <ProvenanceBadge provenance="user_input" />
          </div>

          <div className={styles.tiles}>
            {DISPOSITION_ORDER.map((d) => {
              const meta = DISPOSITION_META[d];
              return (
                <div
                  key={d}
                  className={styles.tile}
                  style={{ ["--tone" as string]: meta.cssVar }}
                >
                  <p className={styles.tileHead}>
                    <span aria-hidden="true" className={styles.tileGlyph}>
                      {meta.glyph}
                    </span>
                    <span className={styles.tileLabel}>{meta.label}</span>
                    <span className={`${styles.tileCount} num`}>{counts[d]}</span>
                  </p>
                  <p className={styles.tileNote}>{meta.note}</p>
                </div>
              );
            })}
          </div>

          <p className={styles.standingUnion}>
            <strong className="num">{behindOpen}</strong> of{" "}
            <strong className="num">{PROSPECTS.length}</strong> organisations in
            the trade area sit behind at least one objection this register still
            calls open.
            <ProvenanceBadge provenance="modeled" compact />{" "}
            <span
              className={styles.unionNote}
              title="Every row on this page covers the corporate lane, so adding the card figures together would count the same employer seven times over."
            >
              A union, not a sum.
            </span>
          </p>

          {/* Severity, spelled out once. A legend keyed only by colour is a
              bug in this codebase, so each level carries its glyph and its
              word here and on every card. */}
          <div className={styles.legend}>
            <p className={styles.legendHead}>Severity</p>
            <ul className={styles.legendList}>
              {(["structural", "high", "medium"] as const).map((s) => {
                const meta = SEVERITY_META[s];
                return (
                  <li key={s} className={styles.legendRow}>
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
              })}
            </ul>
          </div>
        </section>

        {/* ---------------------------------------------------------
            THE ONE THAT DECIDES EVERY CONVERSATION.
            --------------------------------------------------------- */}
        {featured ? (
          <section className={styles.feature} aria-labelledby="feature-h">
            <div className={styles.featureHead}>
              <p className={styles.featureEyebrow}>Read this one first</p>
              <h2 className={styles.h2} id="feature-h">
                The objection Main Event created on purpose
              </h2>
              <p className={styles.featureLede}>
                True of every conversation in every lane.
              </p>
            </div>

            {cardFor(
              featured,
              "feature",
              <div className={styles.gate}>
                <h4 className={styles.gateHead}>Why this one gets the room</h4>
                <p className={styles.gateText}>
                  No corporate or group package carries a published price.
                  Those pages say to contact the local sales manager, and Brea
                  does not have one yet.
                </p>

                <div className={styles.gateFigures}>
                  <div className={styles.gateFigure}>
                    <span className={styles.gateFigureLabel}>
                      Group price for Brea
                    </span>
                    <WithheldFigure
                      reason={
                        <>
                          The page says to contact the local sales manager, so
                          the price comes from a person. Brea does not have that
                          person yet, and that vacancy is the job this work
                          sample is applying for.
                        </>
                      }
                    />
                  </div>

                  <div className={styles.gateFigure}>
                    <span className={styles.gateFigureLabel}>
                      Packages carrying no published price
                    </span>
                    <Figure
                      value={`${GATED_PACKAGES.length} of ${PACKAGES.length}`}
                      provenance="public"
                    />
                  </div>

                  <div className={styles.gateFigure}>
                    <span className={styles.gateFigureLabel}>
                      The one food figure that is published
                    </span>
                    <Figure
                      value={`$${BANQUET_FLOOR_PER_GUEST} per person`}
                      provenance="public"
                    />
                  </div>
                </div>

                {/* Never invent a figure to get off the phone. A number a
                    buyer takes to a finance committee and then withdraws
                    costs more than the booking was worth. */}
                <p className={styles.gateFoot}>
                  <Link to="/packages">
                    Every package, and what Main Event publishes for it
                  </Link>
                  .
                </p>
              </div>,
            )}
          </section>
        ) : null}

        {/* ---------------------------------------------------------
            THE REST OF THE REGISTER.
            --------------------------------------------------------- */}
        <section className={styles.register} aria-labelledby="register-h">
          <h2 className={styles.h2} id="register-h">
            The rest of the register
          </h2>
          <p className={styles.registerNote}>
            Five more, in the order they hurt.
          </p>

          <div className={styles.cards}>
            {middle.map((row) => cardFor(row, "plain"))}
          </div>
        </section>

        {/* ---------------------------------------------------------
            THE ONE WITH THE ANSWER NOBODY EXPECTS.
            --------------------------------------------------------- */}
        {notable ? (
          <section className={styles.notable} aria-labelledby="notable-h">
            <div className={styles.notableHead}>
              <p className={styles.featureEyebrow}>The one worth remembering</p>
              <h2 className={styles.h2} id="notable-h">
                When the competitor turns out to be the same company
              </h2>

            </div>

            {cardFor(
              notable,
              "notable",
              <div className={styles.gate} data-variant="notable">
                <h4 className={styles.gateHead}>The awkward fact, volunteered</h4>
                <p className={styles.gateText}>
                  Dave and Buster's and Main Event have had the same parent
                  company since 2022. Volunteering that turns a switch into a
                  question about format and postcode.
                </p>
                <p className={styles.gateFoot}>
                  If December is spoken for, ask what the second occasion is.{" "}
                  <Link to="/replies">What came back</Link>.
                </p>
              </div>,
            )}
          </section>
        ) : null}

        {/* Nothing here is scored or ranked by likelihood to close. */}
        <p className={styles.pageFoot}>
          <Link to="/method">Every formula and source</Link>.
        </p>
      </div>
    </div>
  );
}
