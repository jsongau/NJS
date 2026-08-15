import type { CupNightView, FixtureSideView, FixtureView, RoundView } from "@/domain/selectors/cup";
import {
  CUP_BRANCH,
  MATCH_STATE,
  MATCH_STATE_ORDER,
  UPSET_SEED_GAP,
  formatCupDate,
  gamesToWin,
  type MatchState,
} from "@/domain/cup";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { TokenMark } from "@/components/licensing/Panels";
import { MatchupPress, TeamName } from "./CupNames";
import styles from "./FixtureList.module.css";

/**
 * THE FIXTURES LIST, AND IT IS THE PRIMARY VIEW OF THIS CUP.
 *
 * ── WHY A LIST OUTRANKS THE TREE, WITH THE EVIDENCE ───────────────
 * A bracket tree is the easiest thing on this board to make look
 * impressive and the hardest to make useful, and two findings decide the
 * order rather than taste.
 *
 * A screen reader cannot follow one team through a tree. Rounds as list
 * items force a listener through every match of round one before they can
 * reach round two; rounds as table columns improve arrow key movement
 * until `rowspan` appears, and merged rows are exactly how a bracket
 * draws two matches feeding one, at which point arrow keys reach only the
 * first row of the merge. The practitioner walkthrough that establishes
 * both ends by doubting that HTML and CSS can carry an accessible bracket
 * at all.
 *
 * And the sport's own tooling agrees. A working bowling tournament site
 * presents an event as squads, rosters and standings with no bracket
 * graphic anywhere on it. The most praised feature of the most studied
 * consumer bracket product is not its tree either: it is the list of
 * every game with its result.
 *
 * So this is a first class view rather than an accessible alternative
 * hidden behind a link, it is what the board opens on, and the tree is a
 * second drawing of the same fixtures for readers who prefer one.
 *
 * ── SIX STATES, NOT THREE ─────────────────────────────────────────
 * The bracket platforms expose pending, running and completed, which is
 * right for an event that runs in one afternoon and wrong for a cup whose
 * fixtures are a week apart. `MATCH_STATE` carries six, and the two the
 * platforms merge are the two this board exists to separate: a fixture
 * awaiting an opponent is most of the bracket for most of the cup, and a
 * scheduled fixture is the only one a person can be sold a seat for.
 * Every state prints its glyph and its word before its colour, because
 * the owner is colourblind and colour is never the only signal here.
 *
 * ── EVERY CELL CARRIES SEED, NAME AND SCORE ───────────────────────
 * A bracket that shows only who won has thrown away the story. The seed
 * is the cheapest of the three and the one that makes an upset legible,
 * so it is on every side of every fixture that has been seeded.
 *
 * ── AND THERE IS NO WIN PROBABILITY ON THIS SURFACE ───────────────
 * Nothing has been bowled in this building. A percentage fitted to a
 * simulated exhibition is a number about a simulation wearing the clothes
 * of a number about a team, and a precise looking figure next to a
 * hundred and two verified organisations costs more than it buys. Seed
 * difference does the same job, carries its own uncertainty and cannot be
 * wrong. An upset is counted only after the fact, against a stated rule.
 */

export const ANY_STATE = "any";

export interface FixtureFilter {
  /** A night number, or zero for every night. */
  night: number;
  /** A match state, or ANY_STATE. */
  state: string;
}

/** Fixtures that survive a reading, flattened out of the nights. */
export function filterFixtures(
  nights: CupNightView[],
  filter: FixtureFilter,
): FixtureView[] {
  const out: FixtureView[] = [];
  for (const night of nights) {
    if (filter.night !== 0 && night.night !== filter.night) continue;
    for (const round of night.rounds) {
      for (const fixture of round.fixtures) {
        if (filter.state !== ANY_STATE && fixture.state !== filter.state) continue;
        out.push(fixture);
      }
    }
  }
  return out;
}

/** How many fixtures across the whole cup sit in each state. */
export function stateCounts(nights: CupNightView[]): Record<MatchState, number> {
  const out = {
    "awaiting-opponent": 0,
    scheduled: 0,
    live: 0,
    final: 0,
    bye: 0,
    withdrawn: 0,
  } as Record<MatchState, number>;
  for (const night of nights) {
    for (const round of night.rounds) {
      for (const fixture of round.fixtures) out[fixture.state] += 1;
    }
  }
  return out;
}

// ---------------------------------------------------------------
// One side of a fixture
// ---------------------------------------------------------------

function Side({
  side,
  fixture,
  settled,
}: {
  side: FixtureSideView;
  fixture: FixtureView;
  settled: boolean;
}) {
  if (!side.team) {
    return (
      <div className={styles.side} data-open="yes">
        <span className={styles.seed} aria-hidden="true">
          ??
        </span>
        <span className={styles.rule}>
          {side.rule ?? "Not decided yet."}
          <span className="visually-hidden"> This side has no team yet.</span>
        </span>
      </div>
    );
  }

  return (
    <div className={styles.side} data-won={side.won ? "yes" : "no"}>
      <span className={`${styles.seed} num`}>
        {side.seed === null ? "" : side.seed}
        <span className="visually-hidden">
          {side.seed === null ? "Not seeded yet." : ` Seed ${side.seed} of 16.`}
        </span>
      </span>
      <span className={styles.sideName}>
        <TeamName teamId={side.team.id} name={side.team.name} />
      </span>
      {settled ? (
        <span className={styles.score}>
          <span className={`${styles.games} num`}>{side.gamesWon}</span>
          <span className={styles.pins}>
            <span className="num">{side.pinfall}</span> pins
          </span>
        </span>
      ) : (
        <span className={styles.score} />
      )}
      {side.won ? (
        <span className={styles.won}>
          <span aria-hidden="true">■</span> Won
        </span>
      ) : settled ? (
        <span className={styles.lost}>
          <span aria-hidden="true">□</span> Lost
        </span>
      ) : (
        <span className={styles.won} data-empty="yes" />
      )}
      {/* The upset marker sits on the winning side, because that is the
          side it is a fact about. The rule is printed with the count in
          the section head rather than being implied by a colour. */}
      {side.won && fixture.isUpset ? (
        <span className={styles.upset}>
          <span aria-hidden="true">✦</span> Upset, {fixture.seedGap} seeds
        </span>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------
// One fixture
// ---------------------------------------------------------------

export function FixtureRow({ fixture }: { fixture: FixtureView }) {
  const token = MATCH_STATE[fixture.state];
  const a = fixture.sides[0].team?.name ?? "an undecided side";
  const b = fixture.sides[1].team?.name ?? "an undecided side";

  return (
    <li className={styles.row} data-state={fixture.state}>
      <div className={styles.rowHead}>
        <TokenMark token={token} small />
        <span className={styles.lanes}>
          Lanes <span className="num">{fixture.lanes[0]}</span> and{" "}
          <span className="num">{fixture.lanes[1]}</span>
        </span>
        <span className={styles.when}>{formatCupDate(fixture.date)}</span>
      </div>

      <div className={styles.sides}>
        <Side side={fixture.sides[0]} fixture={fixture} settled={fixture.settled} />
        <Side side={fixture.sides[1]} fixture={fixture} settled={fixture.settled} />
      </div>

      <div className={styles.rowFoot}>
        <MatchupPress
          fixtureId={fixture.fixture.id}
          accessibleName={`${a} against ${b}`}
        />
        {/* THE LABEL AND THE BADGE TRAVEL WITH THE FIGURE. The selector
            hands back `label` only where there is a simulated figure to
            label, so a row with no score carries the badge alone and a
            row with a score carries the word as well. */}
        {fixture.label ? (
          <span className={styles.simulated}>
            <span aria-hidden="true">◍</span> {fixture.label}
          </span>
        ) : null}
        <ProvenanceBadge provenance={fixture.provenance} compact />
        {fixture.fixture.note ? (
          <span className={styles.note}>{fixture.fixture.note}</span>
        ) : null}
      </div>
    </li>
  );
}

// ---------------------------------------------------------------
// One round
// ---------------------------------------------------------------

export function RoundBlock({
  round,
  fixtures,
}: {
  round: RoundView;
  fixtures: FixtureView[];
}) {
  const r = round.round;
  return (
    <section className={styles.round} aria-labelledby={`round-${r.id}`}>
      <div className={styles.roundHead}>
        <h4 className={styles.roundName} id={`round-${r.id}`}>
          {r.name}
        </h4>
        <TokenMark token={CUP_BRANCH[r.branch]} small />
        <span className={styles.roundFacts}>
          {r.kind === "squad" ? (
            <>
              <span className="num">{r.squadTeams ?? 0}</span> teams across{" "}
              <span className="num">{r.squadLanes ?? 0}</span> lanes
            </>
          ) : (
            <>
              <span className="num">{round.lanes}</span> lanes
              {r.bestOf ? (
                <>
                  , best of <span className="num">{r.bestOf}</span>, first to{" "}
                  <span className="num">{gamesToWin(r.bestOf)}</span>
                </>
              ) : null}
            </>
          )}
        </span>
      </div>

      <p className={styles.roundWhat}>{r.what}</p>

      {r.kind === "squad" ? (
        <p className={styles.squad}>
          <span aria-hidden="true">▦</span> {r.squadEntry}
        </p>
      ) : fixtures.length === 0 ? (
        <p className={styles.none}>
          <span aria-hidden="true">○</span> No fixture in this round matches the
          reading.
        </p>
      ) : (
        <ul className={styles.rows}>
          {fixtures.map((f) => (
            <FixtureRow key={f.fixture.id} fixture={f} />
          ))}
        </ul>
      )}
    </section>
  );
}

// ---------------------------------------------------------------
// The whole list, by night then round
// ---------------------------------------------------------------

export function FixtureList({
  nights,
  filter,
}: {
  nights: CupNightView[];
  filter: FixtureFilter;
}) {
  const shown = nights.filter(
    (n) => filter.night === 0 || n.night === filter.night,
  );

  return (
    <div className={styles.list}>
      {shown.map((night) => {
        const rounds = night.rounds.map((round) => ({
          round,
          fixtures: round.fixtures.filter(
            (f) => filter.state === ANY_STATE || f.state === filter.state,
          ),
        }));
        const kept = rounds.reduce((n, r) => n + r.fixtures.length, 0);

        return (
          <section
            key={night.night}
            className={styles.night}
            aria-labelledby={`night-${night.night}`}
          >
            <div className={styles.nightHead}>
              <h3 className={styles.nightName} id={`night-${night.night}`}>
                Night <span className="num">{night.night}</span> of{" "}
                <span className="num">{nights.length}</span>
              </h3>
              <span className={styles.nightDate}>{formatCupDate(night.date)}</span>
              <span className={styles.nightFacts}>
                <span className="num">{night.matches}</span> matches,{" "}
                <span className="num">{night.lanes}</span> lanes,{" "}
                <span className="num">{night.laneSharePct}</span>% of the
                published floor
              </span>
              <span className={styles.nightWhen}>
                {night.daysAway === 0
                  ? "Tonight"
                  : night.daysAway > 0
                    ? `In ${night.daysAway} day${night.daysAway === 1 ? "" : "s"}`
                    : `${Math.abs(night.daysAway)} days ago`}
              </span>
            </div>

            {kept === 0 ? (
              <p className={styles.none}>
                <span aria-hidden="true">○</span> Nothing on this night matches
                the reading.
              </p>
            ) : (
              rounds
                .filter((r) => r.fixtures.length > 0 || r.round.round.kind === "squad")
                .map((r) => (
                  <RoundBlock
                    key={r.round.round.id}
                    round={r.round}
                    fixtures={r.fixtures}
                  />
                ))
            )}
          </section>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------
// The six states, spelled out once
// ---------------------------------------------------------------

/**
 * All six states with a count against each, including the two at zero.
 *
 * A bye and a withdrawal have not happened in this exhibition and both
 * stay on the legend at zero rather than being dropped. A legend that
 * only shows what occurred teaches a reader that the vocabulary is
 * whatever they happen to be looking at, and a withdrawal in particular
 * has to be modelled before it happens, because it is a real thing in a
 * league and it must never be drawn as a defeat.
 */
export function MatchStateLegend({
  counts,
}: {
  counts: Record<MatchState, number>;
}) {
  return (
    <ul className={styles.legend}>
      {MATCH_STATE_ORDER.map((state) => (
        <li key={state} className={styles.legendItem}>
          <TokenMark token={MATCH_STATE[state]} small />
          <span className={`${styles.legendCount} num`}>{counts[state]}</span>
          <span className={styles.legendNote}>{MATCH_STATE[state].note}</span>
        </li>
      ))}
    </ul>
  );
}

/** The upset rule, printed wherever the count appears. */
export const UPSET_RULE = `A win over a team seeded ${UPSET_SEED_GAP} or more places above you. The definition is borrowed rather than invented, so the count has a stated rule behind it.`;
