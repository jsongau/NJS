import { useCallback, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { Prospect } from "@/domain/types";
import type { Cup } from "@/domain/cup";
import {
  BAKER_FRAMES_PER_BOWLER,
  BEST_OF_EARLY,
  BEST_OF_LATE,
  CUP_NIGHTS,
  EXHIBITION_LABEL,
  HANDLE_NOTE,
  LANES_PER_CUP_MATCH,
  MATCH_STATE,
  formatCupDate,
  type MatchState,
} from "@/domain/cup";
import type { CupTeamView } from "@/domain/selectors/cup";
import {
  allCups,
  cupTeams,
  cupView,
  currentCup,
  enrollingCup,
} from "@/domain/selectors/cup";
import { CUP_AS_OF_DATE, CUP_ENTRIES } from "@/data/cup";
import { PROSPECT_BY_ID } from "@/data/prospects";
import { leagueViews } from "@/domain/selectors/leagues";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { SectionHead, Stat, StatStrip } from "@/components/licensing/Panels";
import { SegmentedFilter } from "@/components/queue/SegmentedFilter";
import { WorkingSetLead } from "@/components/queue/WorkingSetLead";
import {
  EmailComposeModal,
  useComposeModal,
} from "@/components/email/EmailComposeModal";
import { CupLead, type MondayItem } from "@/components/cup/board/CupLead";
import { EnrollmentPanel } from "@/components/cup/board/EnrollmentPanel";
import { CadenceRail } from "@/components/cup/board/CadenceRail";
import { FieldLadder } from "@/components/cup/board/FieldLadder";
import { useCupSurfaces } from "@/components/cup/board/CupNames";
import {
  ANY_STATE,
  FixtureList,
  MatchStateLegend,
  UPSET_RULE,
  filterFixtures,
  stateCounts,
} from "@/components/cup/board/FixtureList";
import {
  BRACKET_LADDER_ORDER,
  BracketView,
  bracketLadderLabel,
  type BracketLadder,
} from "@/components/cup/bracket/BracketView";
import styles from "./CupPage.module.css";

/**
 * THE CUP BOARD.
 *
 * ── THE TEST THIS SCREEN IS HELD TO ───────────────────────────────
 * A bracket is the easiest thing in software to make look impressive and
 * the hardest to make useful. So the question is not whether the tree is
 * handsome. It is whether a rep can open this and know what to do on
 * Monday: who is enrolled and who is not, which matchup is worth
 * promoting, and which team is one conversation away from bringing four
 * more people into the building.
 *
 * ── THE ORDER OF THIS BOARD, AND WHY IT IS THIS ORDER ─────────────
 * One. THE CUP ON THE LANES AND THE THREE VERBS. What is live tonight,
 * which fixture is worth promoting, and beside it the only three counts
 * on this board that a person can act on: slots free in the next field,
 * rosters a seat short, and slots held rather than confirmed. Those two
 * halves together are the answer to the test, so they are above
 * everything else and the tree is nowhere near them.
 *
 * Two. ENROLLMENT. It is second rather than fifth because it is the only
 * REAL PRODUCT on the page. Everything with a score on it is a declared
 * exhibition; putting a team down for January is a thing a person can
 * genuinely do today, and burying it under a bracket would be building
 * the demo and hiding the offer.
 *
 * Three. THE FIXTURES, and the tree as a view inside them. The list is
 * the primary view and it is what this section opens on. The tree is a
 * second drawing of the same fixtures behind a two segment switch, which
 * is the correct status for it: a screen reader cannot traverse a bracket
 * tree, the sport's own tournament software ships no bracket graphic at
 * all, and the most praised feature of the most studied consumer bracket
 * product is a list of every game.
 *
 * Four. THE FIELD OF SIXTEEN. Where each team stands, how it came to
 * exist, and the organisation behind it. This is where "one conversation
 * away" is actually answered, and every name in it opens something.
 *
 * Five. THE QUARTERLY CADENCE. Four cups a year, with the enrollment
 * window on each, so a reader can see that the January deadline is
 * information rather than pressure: it closes, and April exists.
 *
 * ── WHAT IS SIMULATED SAYS SO, EVERYWHERE, VISIBLY ────────────────
 * `domain/cup.ts` makes the label a required field on every exhibition
 * figure, so a score cannot be constructed without the word travelling
 * with it. This page does not fight that, it prints it: the declaration
 * is in the first block at full size, every settled fixture carries the
 * label and the illustrative badge, and the ladder states its basis
 * above its own first row.
 *
 * ── AND THERE IS NO WIN PROBABILITY HERE ──────────────────────────
 * Nothing has been bowled in this building. Seed difference does the job
 * honestly, carries its own uncertainty and cannot be wrong. Upsets are
 * counted after the fact against a rule that is printed with the count.
 */

const NOW = CUP_AS_OF_DATE;

type BoardView = "fixtures" | "bracket";

/**
 * THE FOUR READINGS OF THIS BOARD LIVE IN THE URL, NOT IN COMPONENT
 * STATE.
 *
 * Which view, which bracket, which night and which state. Held in
 * component state they would each have the same four defects the rail
 * already names: a reload loses them, a pasted address gives somebody
 * else a different screen, the back button does nothing because nothing
 * moved, and a screenshot pass cannot reach the second view at all
 * without learning to press a button. As parameters they are a place, and
 * the contrast walk and the shot pass both open the bracket by address.
 *
 * They are deliberately not the same keys the team, the bowler and the
 * matchup surfaces use, so a reader can have a filter and a card open at
 * once and closing one does not clear the other.
 */
const VIEW_PARAM = "view";
const BRACKET_PARAM = "bracket";
const NIGHT_PARAM = "night";
const STATE_PARAM = "state";

export function CupPage() {
  const cup = useMemo(() => currentCup(), []);
  const view = useMemo(() => cupView(cup, NOW), [cup]);
  const teams = useMemo(() => cupTeams(cup), [cup]);
  const next = useMemo(() => enrollingCup(), []);
  const nextView = useMemo(() => (next ? cupView(next, NOW) : null), [next]);
  const cups = useMemo(() => allCups(), []);
  const anchor = useMemo<Prospect | null>(
    () => leagueViews().find((v) => v.anchor)?.anchor ?? null,
    [],
  );

  const [params, setParams] = useSearchParams();
  const setReading = useCallback(
    (key: string, value: string, fallback: string) => {
      setParams(
        (prev) => {
          const nextParams = new URLSearchParams(prev);
          if (value === fallback) nextParams.delete(key);
          else nextParams.set(key, value);
          return nextParams;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  /* Every reading is narrowed to a value this board actually has, because
     the address bar is an input like any other. A pasted `?night=99` or a
     misspelled state falls back to the whole cup rather than drawing an
     empty board with no explanation of why it is empty. */
  const boardView: BoardView =
    params.get(VIEW_PARAM) === "bracket" ? "bracket" : "fixtures";
  const ladder: BracketLadder =
    params.get(BRACKET_PARAM) === "plate" ? "plate" : "cup";
  const askedNight = Number(params.get(NIGHT_PARAM) ?? "0") || 0;
  const night = view.nights.some((n) => n.night === askedNight) ? askedNight : 0;
  const askedState = params.get(STATE_PARAM) ?? ANY_STATE;
  const state =
    askedState in MATCH_STATE || askedState === ANY_STATE
      ? askedState
      : ANY_STATE;

  /* The cup entry state per team, read off the entries themselves.
     `CupTeamView` carries a LEAGUE slot state and that is a different fact
     about a different product, so the panel is handed the cup's own answer
     rather than being left to infer one. */
  const slotStates = useMemo<Record<string, "confirmed" | "held">>(() => {
    const out: Record<string, "confirmed" | "held"> = {};
    if (!next) return out;
    for (const entry of CUP_ENTRIES) {
      if (entry.cupId !== next.id) continue;
      out[entry.teamId] = entry.state;
    }
    return out;
  }, [next]);

  const compose = useCupCompose(anchor, nextView?.enrollment.free ?? 0);
  const { openTape } = useCupSurfaces();

  const counts = useMemo(() => stateCounts(view.nights), [view.nights]);
  const allFixtures = useMemo(
    () => filterFixtures(view.nights, { night: 0, state: ANY_STATE }),
    [view.nights],
  );
  const shown = useMemo(
    () => filterFixtures(view.nights, { night, state }),
    [view.nights, night, state],
  );

  const liveCount = counts.live;
  const tonight =
    view.nights.find((n) => n.daysAway === 0) ??
    view.nights.find((n) => n.daysAway > 0) ??
    null;

  /* The three counts on this board a person can act on, and every one of
     them belongs to the cup that is TAKING TEAMS rather than to the one
     being bowled. Nothing about a simulated bracket is actionable, which
     is exactly why the actionable block sits next to it rather than
     inside it. */
  const monday = useMemo<MondayItem[]>(() => {
    if (!nextView || !next) return [];
    const enrollment = nextView.enrollment;
    const short = enrollment.entries.filter(
      (e) => e.team.bowlersCommitted < next.teamSize,
    );
    const held = enrollment.entries.filter(
      (e) => slotStates[e.team.id] === "held",
    );
    const seats = short.reduce(
      (n, e) => n + (next.teamSize - e.team.bowlersCommitted),
      0,
    );

    return [
      {
        id: "free",
        glyph: "○",
        count: enrollment.free,
        label: "slots free in the January field",
        /* The field size used to be justified as lanes over a published
           house of twenty six. DIME publishes no lane count anywhere,
           so the justification is stated as the lane demand it is. */
        note: `Whole teams still to find for ${next.name}. The field is ${enrollment.field} because a match takes ${LANES_PER_CUP_MATCH} lanes, and how many the house has is not published.`,
        tone: "var(--warn)",
        actLabel: "Offer a slot",
        onAct: () => compose.act("league-team", next),
      },
      {
        id: "seats",
        glyph: "◐",
        count: seats,
        label: seats === 1 ? "seat short on a roster" : "seats short on rosters",
        note:
          short.length === 0
            ? "Every roster in the field is complete."
            : `${short.map((e) => e.team.name).join(" and ")} cannot bowl a Baker game without five bodies. One conversation each.`,
        tone: "var(--risk)",
        actLabel: "Fill a seat",
        onAct: () =>
          short[0]
            ? compose.act("league-join", next, short[0])
            : compose.act("league-enquiry", next),
      },
      {
        id: "held",
        glyph: "◑",
        count: held.length,
        label: held.length === 1 ? "slot held, not confirmed" : "slots held, not confirmed",
        note:
          held.length === 0
            ? "Every slot in the field is confirmed."
            : `${held.map((e) => e.team.name).join(" and ")} are holding a place and have not confirmed it.`,
        tone: "var(--info)",
        actLabel: "Confirm a hold",
        onAct: () =>
          held[0]
            ? compose.act("league-enquiry", next, held[0])
            : compose.act("league-enquiry", next),
      },
    ];
  }, [next, nextView, compose, slotStates]);

  const stateToken =
    state === ANY_STATE ? null : (MATCH_STATE[state as MatchState] ?? null);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* ===========================================================
            HEAD
            =========================================================== */}
        <header className={styles.head}>
          <p className={styles.eyebrow}>
            One cup a quarter, as at {formatCupDate(NOW)}
          </p>
          <h1 className={styles.h1}>The Cup</h1>

          <p className={styles.thesis}>
            <span aria-hidden="true" className={styles.thesisGlyph}>
              ★
            </span>
            <span>
              A league is what the building sells. A cup is the reason to
              care about it in week nine.{" "}
              <strong className="num">{CUP_NIGHTS}</strong> nights,{" "}
              <strong className="num">{view.shape.fieldSize}</strong> teams, and
              nobody sits out on any of them.
            </span>
          </p>

          <p className={styles.framing}>
            <span aria-hidden="true" className={styles.framingGlyph}>
              ◆
            </span>
            <span>
              A proposed programme, not an announcement. DIME has not
              announced a cup and publishes no dollar amount for a league. The
              two leagues this field is drawn from are on{" "}
              <Link to="/leagues">leagues</Link>.
            </span>
          </p>

          <p className={styles.handles}>
            <span aria-hidden="true" className={styles.handlesGlyph}>
              ◇
            </span>
            <span>{HANDLE_NOTE}</span>
          </p>
        </header>

        {/* ===========================================================
            ONE. WHAT IS ON THE LANES, AND THE THREE VERBS
            =========================================================== */}
        <section className={styles.section} aria-labelledby="cup-lead">
          <h2 className="visually-hidden" id="cup-lead">
            The cup running now and what to do about it
          </h2>
          <CupLead
            view={view}
            liveCount={liveCount}
            tonight={
              tonight
                ? {
                    night: tonight.night,
                    date: tonight.date,
                    daysAway: tonight.daysAway,
                  }
                : null
            }
            monday={monday}
            mondayLede={
              next ? (
                <>
                  Nothing about a simulated bracket is actionable. These three
                  belong to <strong>{next.name}</strong>, which is taking teams
                  now.
                </>
              ) : (
                "No cup is taking teams."
              )
            }
          />
        </section>

        {/* ===========================================================
            TWO. ENROLLMENT
            =========================================================== */}
        {nextView && next ? (
          <section className={styles.section} aria-labelledby="cup-enrol">
            <SectionHead
              eyebrow="One"
              id="cup-enrol"
              title={`Enrolling now for ${next.quarter} ${next.year}`}
              lede="A team can be put down against a quarter that has not started, which is what a forward book is for."
              meta={
                <>
                  <ProvenanceBadge provenance="illustrative" compact />
                  <span>
                    The programme, the nights and the entry figure are this
                    application's own proposal.
                  </span>
                </>
              }
            />
            <EnrollmentPanel
              enrollment={nextView.enrollment}
              slotStates={slotStates}
              onTakeSlot={() => compose.act("league-team", next)}
              onFillSeat={(entry) => compose.act("league-join", next, entry)}
            />
          </section>
        ) : null}

        {/* ===========================================================
            THREE. THE FIXTURES, WITH THE TREE AS A VIEW
            =========================================================== */}
        <section className={styles.section} aria-labelledby="cup-fixtures">
          <SectionHead
            eyebrow="Two"
            id="cup-fixtures"
            title="Fixtures"
            lede="By night and by round. The list is the view this board opens on and the tree is a second drawing of the same fixtures."
            meta={
              <>
                <ProvenanceBadge provenance="illustrative" compact />
                <span>
                  {EXHIBITION_LABEL}. Every score below is generated and
                  labelled.
                </span>
              </>
            }
          />

          <StatStrip label="The format, in figures derived from the field">
            <Stat
              value={view.shape.matches}
              label="Matches in the cup"
              note="Head to head matches across all six nights, counted off the fixture list rather than typed anywhere."
              provenance="modeled"
            />
            <Stat
              value={view.shape.laneNights}
              label="Lane nights committed"
              note="Lanes multiplied by nights. Inventory rather than money, and it is never added to a revenue ledger."
              provenance="modeled"
            />
            {/*
              THIS STAT USED TO BE A PERCENTAGE AND IS NOW A SENTENCE.

              It read "62% of the published floor", because the fork
              this was built from had a published lane count to divide
              by. DIME publishes no lane count for any location, so
              there is no denominator and no share. What survives is the
              numerator, which is the useful half anyway: a cup night
              holds sixteen lanes, and a store can say in one sentence
              whether it has them. The word "Not published" is carried
              rather than a dash, so the tile reads the same in
              greyscale and on paper.
            */}
            <Stat
              value="Not published"
              label="Lane count for the house"
              note="A cup night holds sixteen lanes. What share of the house that is cannot be given, because DIME publishes no bowling lane count for any location, including Lakewood Center."
              provenance="withheld"
            />
            <Stat
              value={view.upsets.length}
              label="Upsets so far"
              note={UPSET_RULE}
              provenance="illustrative"
              tone="var(--warn)"
              live
            />
            <Stat
              value={`${BEST_OF_EARLY} and ${BEST_OF_LATE}`}
              label="Baker games to a match"
              note={`Best of ${BEST_OF_EARLY} early and best of ${BEST_OF_LATE} from the semi finals, which is at most ${BEST_OF_LATE * BAKER_FRAMES_PER_BOWLER} frames for one bowler.`}
              provenance="modeled"
            />
            <Stat
              value={view.daysToNextNight ?? 0}
              label="Days to the next night"
              note="A fixed date on a fixed pair of lanes. It arrives and it passes, and there is no version of this figure that resets."
              provenance="modeled"
              live
            />
          </StatStrip>

          {/* The view switch. Two segments, the list first, and the tree is
              never what a reader has to get past to reach the fixtures. */}
          <SegmentedFilter
            label="Choose a view of the fixtures"
            value={boardView}
            onChange={(v) => setReading(VIEW_PARAM, v, "fixtures")}
            countLabel="fixtures in this view"
            segments={[
              {
                value: "fixtures",
                label: "Fixtures list",
                glyph: "▤",
                count: allFixtures.length,
                tone: "var(--sec-leagues-ink)",
              },
              {
                value: "bracket",
                label: "Bracket",
                glyph: "★",
                count: allFixtures.filter(
                  (f) =>
                    f.branch === "cup" ||
                    f.branch === "plate" ||
                    f.branch === "stepladder",
                ).length,
                tone: "var(--accent)",
              },
            ]}
          />

          {boardView === "fixtures" ? (
            <>
              <SegmentedFilter
                label="Filter the fixtures by night"
                value={String(night)}
                onChange={(v) => setReading(NIGHT_PARAM, v, "0")}
                countLabel="fixtures on this night"
                segments={[
                  {
                    value: "0",
                    label: "Every night",
                    glyph: "◈",
                    count: allFixtures.length,
                    tone: "var(--sec-leagues-ink)",
                  },
                  ...view.nights.map((n) => ({
                    value: String(n.night),
                    label: `Night ${n.night}`,
                    glyph: n.daysAway === 0 ? "◉" : n.daysAway > 0 ? "○" : "●",
                    count: n.matches,
                    tone:
                      n.daysAway === 0
                        ? "var(--warn)"
                        : n.daysAway > 0
                          ? "var(--info)"
                          : "var(--neutral)",
                  })),
                ]}
              />

              <SegmentedFilter
                label="Filter the fixtures by state"
                value={state}
                onChange={(v) => setReading(STATE_PARAM, v, ANY_STATE)}
                countLabel="fixtures in this state"
                segments={[
                  {
                    value: ANY_STATE,
                    label: "Any state",
                    glyph: "◈",
                    count: allFixtures.length,
                    tone: "var(--sec-leagues-ink)",
                  },
                  ...(
                    ["live", "scheduled", "awaiting-opponent", "final", "bye", "withdrawn"] as const
                  ).map((s) => ({
                    value: s,
                    label: MATCH_STATE[s].label,
                    glyph: MATCH_STATE[s].glyph,
                    count: counts[s],
                    tone: MATCH_STATE[s].cssVar,
                  })),
                ]}
              />

              <WorkingSetLead
                headingId="cup-reading"
                changeKey={`${night}:${state}`}
                kicker="Fixtures on this reading"
                glyph={stateToken ? stateToken.glyph : "◈"}
                label={
                  stateToken
                    ? `${stateToken.label}${night === 0 ? "" : `, night ${night}`}`
                    : night === 0
                      ? "Every fixture in the cup"
                      : `Night ${night}, every state`
                }
                tone={stateToken ? stateToken.cssVar : "var(--sec-leagues)"}
                count={shown.length}
                total={allFixtures.length}
                noun={["fixture", "fixtures"]}
                facts={[
                  {
                    label: "Live now",
                    value: <span className="num">{counts.live}</span>,
                  },
                  {
                    label: "Scheduled, promotable",
                    value: <span className="num">{counts.scheduled}</span>,
                  },
                  {
                    label: "Upsets in this cup",
                    value: <span className="num">{view.upsets.length}</span>,
                    qualifier: <ProvenanceBadge provenance="illustrative" compact />,
                  },
                ]}
                rows={shown.slice(0, 3).map((f) => ({
                  id: f.fixture.id,
                  name: `${f.sides[0].team?.name ?? "Undecided"} against ${f.sides[1].team?.name ?? "Undecided"}`,
                  kind: f.round.name,
                  when: (
                    <>
                      {formatCupDate(f.date)}, lanes{" "}
                      <span className="num">{f.lanes[0]}</span> and{" "}
                      <span className="num">{f.lanes[1]}</span>
                    </>
                  ),
                  onOpen: () => openTape(f.fixture.id),
                  openLabel: "Card",
                }))}
                emptyLine="No fixture matches this reading."
                announcement={`${shown.length} of ${allFixtures.length} fixtures. ${
                  night === 0 ? "Every night" : `Night ${night}`
                }, ${stateToken ? stateToken.label : "any state"}.`}
              />

              <FixtureList nights={view.nights} filter={{ night, state }} />

              <h3 className={styles.legendTitle}>
                The six states a cup fixture can be in
              </h3>
              <p className={styles.legendLede}>
                Three states is right for a tournament that runs in one
                afternoon and wrong for a cup whose fixtures are a week apart.
                A bye and a withdrawal are modelled and neither has happened,
                so both stay on this legend at zero.
              </p>
              <MatchStateLegend counts={counts} />
            </>
          ) : (
            <>
              <SegmentedFilter
                label="Choose a bracket"
                value={ladder}
                onChange={(v) => setReading(BRACKET_PARAM, v, "cup")}
                countLabel="fixtures in this bracket"
                segments={BRACKET_LADDER_ORDER.map((l) => ({
                  value: l,
                  label: bracketLadderLabel(l),
                  glyph: l === "cup" ? "★" : "✧",
                  count: allFixtures.filter((f) =>
                    l === "cup"
                      ? f.branch === "cup" || f.branch === "stepladder"
                      : f.branch === "plate",
                  ).length,
                  tone: l === "cup" ? "var(--ok)" : "var(--accent)",
                }))}
              />

              <BracketView view={view} teams={teams} ladder={ladder} />
            </>
          )}
        </section>

        {/* ===========================================================
            FOUR. THE FIELD
            =========================================================== */}
        <section className={styles.section} aria-labelledby="cup-field">
          <SectionHead
            eyebrow="Three"
            id="cup-field"
            title={`The field of ${view.shape.fieldSize}`}
            lede="Where every team stands, how it came to exist, and the organisation behind it. There is no value for out."
            meta={
              <>
                <ProvenanceBadge provenance="illustrative" compact />
                <span>
                  Every team name and every handle on this board opens its own
                  surface.
                </span>
              </>
            }
          />
          <p className={styles.countLine} aria-live="polite">
            <strong className="num">{teams.length}</strong> teams,{" "}
            <strong className="num">{view.shape.bowlers}</strong> bowlers,{" "}
            <strong className="num">
              {teams.filter((t) => t.prospect).length}
            </strong>{" "}
            of them fielded by an organisation off the prospecting board
          </p>
          <FieldLadder rows={view.ladder} />
        </section>

        {/* ===========================================================
            FIVE. THE CADENCE
            =========================================================== */}
        <section className={styles.section} aria-labelledby="cup-cadence">
          <SectionHead
            eyebrow="Four"
            id="cup-cadence"
            title="One special cup per quarter"
            lede="Six consecutive nights, then a gap in which enrollment for the next one opens. Four times a year."
            meta={
              <>
                <ProvenanceBadge provenance="illustrative" compact />
                <span>
                  A deadline is honest only if it closes and the next
                  opportunity really exists. Both are on this rail.
                </span>
              </>
            }
          />
          <CadenceRail cups={cups} asOf={NOW} />

          <p className={styles.sectionFoot}>
            The two leagues this field is drawn from are on{" "}
            <Link to="/leagues">leagues</Link>. The lane arithmetic is on{" "}
            <Link to="/calendar">capacity</Link>, where it stops at the lane
            counts themselves, because DIME publishes no house lane count to
            hold them against. Every formula is on{" "}
            <Link to="/method">method</Link>.
          </p>
        </section>
      </div>

      {/*
        =============================================================
        THE SINGLE COMPOSE CALL SITE FOR THE WHOLE CUP SURFACE.
        =============================================================
        Every verb on this board raises its message through `useCupCompose`
        below, which is the only thing in this folder that knows the
        compose window exists. One page, one modal instance, one owner,
        exactly as the leagues board and the requests queue already do it.
        Two copies would trap focus in whichever the browser reached first.
      */}
      <EmailComposeModal {...compose.props} />
    </div>
  );
}

// ---------------------------------------------------------------
// The compose bridge
// ---------------------------------------------------------------

type CupIntent = "league-enquiry" | "league-join" | "league-team";

/**
 * Every cup verb, translated into one compose request.
 *
 * THIS IS THE ONLY PLACE ON THE CUP SURFACE THAT KNOWS ABOUT EMAIL, and
 * it hands the compose window the CUP as the named programme rather than
 * inventing a second context shape. The guardrail those drafts already
 * carry is the right one here: DIME publishes no price and has
 * announced no league programme anywhere, which is exactly as true of a
 * cup as it is of a league.
 *
 * WHICH ORGANISATION IT WRITES TO. A team action addresses the team's own
 * organisation where it has one. A team of five friends with no employer
 * between them falls back to the leagues' anchor, because the message
 * still has to go somewhere and the anchor is the one relationship the
 * house actually has.
 */
function useCupCompose(anchor: Prospect | null, freeSlots: number) {
  const compose = useComposeModal();

  function act(intent: CupIntent, cup: Cup, team?: CupTeamView) {
    const prospect: Prospect | null =
      (team?.team.prospectId
        ? (PROSPECT_BY_ID[team.team.prospectId] ?? null)
        : null) ?? anchor;
    if (!prospect) return;

    compose.open({
      prospect,
      intent,
      league: {
        leagueName: cup.name,
        night: cup.night,
        weeks: cup.nightDates.length,
        /* SLOTS IN THE FIELD, never seats on a roster. A cup whose field
           is claimed but whose rosters are short has seats and no slots,
           and handing the draft the wrong one would put a sentence in a
           rep's mail that is wrong in the one way a reader can check.
           Zero is falsy and the draft writes the accurate sentence
           instead of a promise of places that are gone. */
        spotsOpen: freeSlots,
        teamName: team?.team.name,
        teamSize: cup.teamSize,
        leaguePath: "/cup",
      },
    });
  }

  return { act, props: compose.props };
}
