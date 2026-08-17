import type { Prospect, Provenance } from "@/domain/types";
import type { League, LeagueTeam, TeamFormation } from "@/domain/leagues";
import type {
  BallPreferences,
  Bowler,
  BowlerAverage,
  Cup,
  CupBranch,
  CupFixture,
  CupRound,
  CupShape,
  CupState,
  ExhibitionLabel,
  MatchState,
} from "@/domain/cup";
import {
  BAKER_FRAMES_PER_BOWLER,
  EXHIBITION_LABEL,
  HANDICAP_BASIS,
  HANDICAP_FACTOR_PCT,
  UPSET_SEED_GAP,
  bowlerSlug,
  cupShape,
  daysUntil,
  gamesBowled,
  roundLanes,
} from "@/domain/cup";
import {
  CUPS,
  CUP_AS_OF_DATE,
  CUP_BY_ID,
  CUP_ENTRIES,
  CUP_FIXTURES,
  CUP_FIXTURE_BY_ID,
  CUP_ROUNDS,
  CUP_ROUND_BY_ID,
} from "@/data/cup";
import { LEAGUE_BY_ID, LEAGUE_TEAM_BY_ID } from "@/data/leagues";
import {
  allBowlers,
  bowlerByHandle,
  captainOf,
  rosterFor,
} from "@/domain/selectors/leagues";
import { PROSPECT_BY_ID } from "@/data/prospects";

/**
 * THE CUP, DERIVED.
 *
 * ---------------------------------------------------------------
 * THE EXPORTED SURFACE, IN ONE PLACE, BECAUSE TWO SCREENS BUILD ON IT
 * ---------------------------------------------------------------
 *
 * The cup, the calendar and the format
 *   allCups()                        every cup, this quarter and the next three
 *   cupById(id)                      one cup or null
 *   currentCup()                     the declared exhibition running now
 *   enrollingCup()                   the one taking teams, or null
 *   cupView(cup)                     cup, shape, nights, ladder, enrollment
 *   shapeOf(cup)                     field, matches, lanes, lane nights
 *
 * The schedule
 *   nightsFor(cup)                   six nights, each with its rounds and lanes
 *   roundsFor(cupId)                 rounds in night then branch order
 *   fixturesForRound(roundId)        fixtures on one round, in bowling order
 *   fixturesForNight(cupId, night)   every fixture on one night
 *   fixtureViews(cupId)              every fixture, resolved
 *   fixtureView(fixtureId)           one fixture, resolved, or null
 *
 * Standing
 *   seedingFor(cup)                  seeds one to sixteen out of nights one and two
 *   seedOf(cupId, teamId)            one seed or null
 *   cupLadder(cup)                   the field ranked, with where each team stands
 *   stepladderFor(cup)               the four rungs of finals night
 *
 * Teams and bowlers
 *   cupTeams(cup)                    the field, as team views
 *   cupTeam(cupId, teamId)           one team, roster, route in, run, or null
 *   teamView(teamId)                 a team outside a cup, roster and route in
 *   bowlerView(handle)               one bowler, ball and exhibition figures
 *   bowlerViewsFor(teamId)           a roster in bowling order
 *   bowlerViewBySlug(slug)           the same, addressed by route segment
 *
 * The build up
 *   runFor(cupId, teamId)            every fixture a team has, in order
 *   formFor(cupId, teamId)           the last five results as letters
 *   pathToFinal(cupId, teamId)       fixture ids a team can still reach
 *   headlineFixture(cup)             the one fixture worth promoting now
 *   upsetsIn(cup)                    wins across the stated seed gap
 *   taleOfTheTape(cupId, a, b)       twelve rows and a named decider
 *   enrollmentFor(cup)               slots, fee, deadline, days left
 *
 * ---------------------------------------------------------------
 * EVERY FIGURE IS DERIVED AT RENDER AND NOTHING IS STORED
 * ---------------------------------------------------------------
 *
 * The seed carries fixtures, results as raw pins and games, and two
 * counts per bowler. Everything a screen shows is computed here: seeds,
 * records, pins per game, strike rates, form, paths, upsets and the whole
 * tale of the tape. Change one result in `data/cup.ts` and the seeding
 * moves, the bracket pairings move, the ladder reorders, the tape flips
 * its bold weight and the headline fixture can change, with nobody
 * editing a second number anywhere. That property is why the numbers on
 * this surface cannot disagree with each other.
 *
 * ---------------------------------------------------------------
 * PINS PER GAME, NOT TOTAL PINS
 * ---------------------------------------------------------------
 *
 * This is the one piece of arithmetic worth stopping on, because getting
 * it the obvious way round would be wrong in a way nobody would notice
 * for weeks. A best of five match is three, four or five games depending
 * on how one sided it is. A team that wins three straight bowls three
 * games and banks about five hundred pins; a team that wins three to two
 * bowls five and banks about eight hundred. Seeding on TOTAL pins would
 * therefore rank the second team above the first for having needed longer
 * to win. Every rate on this surface is per game, per frame or per first
 * ball, and never per season, which is also the only way a team with two
 * matches behind it can be compared to a team with five.
 */

// ---------------------------------------------------------------
// The cups
// ---------------------------------------------------------------

export function allCups(): Cup[] {
  return CUPS;
}

export function cupById(id: string): Cup | null {
  return CUP_BY_ID[id] ?? null;
}

/**
 * The cup running now, which is the declared exhibition.
 *
 * There is exactly one and the seed would be wrong if there were two,
 * because two cups running at once would need thirty two teams and
 * thirty two lanes on one night. Whether a store could take that is not
 * knowable from here, since Round1 publishes no lane count anywhere, so
 * the constraint is stated as the lane demand it is and not as a share
 * of a house nobody has measured.
 */
export function currentCup(): Cup {
  return CUPS.find((c) => c.state === "exhibition") ?? CUPS[0];
}

/** The cup taking teams. Real product, real deadline, real scarcity. */
export function enrollingCup(): Cup | null {
  return CUPS.find((c) => c.state === "enrolling") ?? null;
}

export function cupsByState(state: CupState): Cup[] {
  return CUPS.filter((c) => c.state === state);
}

// ---------------------------------------------------------------
// Rounds, fixtures and the shape
// ---------------------------------------------------------------

export function roundsFor(cupId: string): CupRound[] {
  return CUP_ROUNDS.filter((r) => r.cupId === cupId).sort(
    (a, b) => a.night - b.night || a.depth - b.depth,
  );
}

export function fixturesForRound(roundId: string): CupFixture[] {
  return CUP_FIXTURES.filter((f) => f.roundId === roundId).sort(
    (a, b) => a.number - b.number,
  );
}

export function fixturesForNight(cupId: string, night: number): CupFixture[] {
  const ids = new Set(
    roundsFor(cupId)
      .filter((r) => r.night === night)
      .map((r) => r.id),
  );
  return CUP_FIXTURES.filter((f) => ids.has(f.roundId)).sort(
    (a, b) => a.lanes[0] - b.lanes[0],
  );
}

function fixtureCounts(cupId: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of roundsFor(cupId)) out[r.id] = 0;
  for (const f of CUP_FIXTURES) {
    if (f.cupId !== cupId) continue;
    out[f.roundId] = (out[f.roundId] ?? 0) + 1;
  }
  return out;
}

export function shapeOf(cup: Cup): CupShape {
  return cupShape(cup, roundsFor(cup.id), fixtureCounts(cup.id));
}

// ---------------------------------------------------------------
// A fixture, resolved
// ---------------------------------------------------------------

export interface FixtureSideView {
  team: LeagueTeam | null;
  /** One to sixteen once the seeding nights are bowled. Null before. */
  seed: number | null;
  /** The rule that will fill this side, where it is not filled yet. */
  rule: string | null;
  /** Baker games won, on a settled fixture. */
  gamesWon: number | null;
  /** Pins felled in this match. */
  pinfall: number | null;
  /** Best single Baker game in this match. */
  highGame: number | null;
  /** True on a settled fixture the team won. */
  won: boolean;
}

export interface FixtureView {
  fixture: CupFixture;
  round: CupRound;
  night: number;
  branch: CupBranch;
  state: MatchState;
  sides: [FixtureSideView, FixtureSideView];
  /** Both sides resolved, whatever the state. */
  resolved: boolean;
  /** Bowled and settled, with a result to read. */
  settled: boolean;
  /** Simulated label, present only where there is a figure to label. */
  label: ExhibitionLabel | null;
  provenance: Provenance;
  /** Baker games bowled in the match. */
  games: number | null;
  /** Seed gap, absolute, once both sides are seeded. */
  seedGap: number | null;
  /**
   * A settled win by a team seeded the stated gap or more below its
   * opponent. The definition is a rule, printed with the count, rather
   * than a word somebody applied to a result they liked.
   */
  isUpset: boolean;
  lanes: [number, number];
  date: string;
}

function sideView(
  fixture: CupFixture,
  index: 0 | 1,
  seeds: Map<string, number>,
): FixtureSideView {
  const side = fixture.sides[index];
  const other = index === 0 ? 1 : 0;
  const team = side.teamId ? (LEAGUE_TEAM_BY_ID[side.teamId] ?? null) : null;
  const r = fixture.result;
  return {
    team,
    seed: side.teamId ? (seeds.get(side.teamId) ?? null) : null,
    rule: side.teamId ? null : (side.source?.rule ?? null),
    gamesWon: r ? r.gamesWon[index] : null,
    pinfall: r ? r.pinfall[index] : null,
    highGame: r ? r.highGame[index] : null,
    won: r ? r.gamesWon[index] > r.gamesWon[other] : false,
  };
}

function buildFixtureView(
  fixture: CupFixture,
  seeds: Map<string, number>,
): FixtureView {
  const round = CUP_ROUND_BY_ID[fixture.roundId];
  const sides: [FixtureSideView, FixtureSideView] = [
    sideView(fixture, 0, seeds),
    sideView(fixture, 1, seeds),
  ];
  const settled = Boolean(fixture.result);
  const seedGap =
    sides[0].seed !== null && sides[1].seed !== null
      ? Math.abs(sides[0].seed - sides[1].seed)
      : null;
  const winner = sides[0].won ? sides[0] : sides[1].won ? sides[1] : null;
  const loser = winner === sides[0] ? sides[1] : winner === sides[1] ? sides[0] : null;
  return {
    fixture,
    round,
    night: round.night,
    branch: round.branch,
    state: fixture.state,
    sides,
    resolved: Boolean(sides[0].team && sides[1].team),
    settled,
    label: settled ? EXHIBITION_LABEL : null,
    provenance: fixture.provenance,
    games: fixture.result ? gamesBowled(fixture.result) : null,
    seedGap,
    isUpset:
      settled &&
      winner !== null &&
      loser !== null &&
      winner.seed !== null &&
      loser.seed !== null &&
      winner.seed - loser.seed >= UPSET_SEED_GAP,
    lanes: fixture.lanes,
    date: round.date,
  };
}

export function fixtureViews(cupId: string): FixtureView[] {
  const seeds = seedMap(cupId);
  return CUP_FIXTURES.filter((f) => f.cupId === cupId)
    .map((f) => buildFixtureView(f, seeds))
    .sort((a, b) => a.night - b.night || a.lanes[0] - b.lanes[0]);
}

export function fixtureView(fixtureId: string): FixtureView | null {
  const f = CUP_FIXTURE_BY_ID[fixtureId];
  if (!f) return null;
  return buildFixtureView(f, seedMap(f.cupId));
}

// ---------------------------------------------------------------
// The night, with its lane arithmetic
// ---------------------------------------------------------------

export interface RoundView {
  round: CupRound;
  fixtures: FixtureView[];
  /** Lanes this round holds. Not always fixtures times two. */
  lanes: number;
  /** Teams on the lanes in this round. */
  teams: number;
}

export interface CupNightView {
  night: number;
  date: string;
  rounds: RoundView[];
  /** Lanes the cup holds on this night. Sixteen, on all six of them. */
  lanes: number;
  /** Teams bowling. Sixteen, on all six of them. */
  teams: number;
  /** Head to head matches on the night. */
  matches: number;
  /**
   * Share of the house this night takes, WHERE THAT SHARE CAN BE
   * CALCULATED AT ALL. It cannot, so this is always null.
   *
   * The fork this was built from divided the night's lanes by a
   * published floor count. Round1 publishes no bowling lane count for
   * any location, so the denominator does not
   * exist and a percentage without one is an invention with a per cent
   * sign after it. Null rather than zero, because zero is a reading and
   * this is the absence of one. The lane figure beside it is untouched:
   * sixteen lanes on a cup night is a real number and it is the half
   * that was ever ours to state.
   */
  laneSharePct: null;
  /** Whole days from the reading instant. Negative once it has passed. */
  daysAway: number;
}

export function nightsFor(cup: Cup, asOf: string = CUP_AS_OF_DATE): CupNightView[] {
  const seeds = seedMap(cup.id);
  const byNight = new Map<number, RoundView[]>();

  for (const round of roundsFor(cup.id)) {
    const fixtures = fixturesForRound(round.id).map((f) =>
      buildFixtureView(f, seeds),
    );
    const view: RoundView = {
      round,
      fixtures,
      lanes: roundLanes(round, fixtures.length),
      teams:
        round.kind === "squad"
          ? (round.squadTeams ?? 0)
          : round.sequential
            ? fixtures.length + 1
            : fixtures.length * 2,
    };
    const list = byNight.get(round.night) ?? [];
    list.push(view);
    byNight.set(round.night, list);
  }

  return [...byNight.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([night, rounds]) => {
      const lanes = rounds.reduce((n, r) => n + r.lanes, 0);
      return {
        night,
        date: cup.nightDates[night - 1] ?? rounds[0].round.date,
        rounds,
        lanes,
        teams: rounds.reduce((n, r) => n + r.teams, 0),
        matches: rounds.reduce(
          (n, r) => n + (r.round.kind === "squad" ? 0 : r.fixtures.length),
          0,
        ),
        /* Was `Math.round((lanes / houseLanes) * 100)`, and that is still
           the right sum. There is no house lane count to put under it,
           so the night reports its lanes and says nothing about the
           share. See the field's own note. */
        laneSharePct: null,
        daysAway: daysUntil(
          cup.nightDates[night - 1] ?? rounds[0].round.date,
          asOf,
        ),
      };
    });
}

// ---------------------------------------------------------------
// Raw match figures, per team, per branch
// ---------------------------------------------------------------

interface Tally {
  matches: number;
  won: number;
  lost: number;
  games: number;
  gamesWon: number;
  pinfallFor: number;
  pinfallAgainst: number;
  highGame: number;
  /** Seeds of the teams beaten. Empty until somebody has been beaten. */
  beatenSeeds: number[];
  /** Seeds of every opponent faced. Quality of opposition, honestly. */
  opponentSeeds: number[];
}

function emptyTally(): Tally {
  return {
    matches: 0,
    won: 0,
    lost: 0,
    games: 0,
    gamesWon: 0,
    pinfallFor: 0,
    pinfallAgainst: 0,
    highGame: 0,
    beatenSeeds: [],
    opponentSeeds: [],
  };
}

function tallies(
  cupId: string,
  branches?: CupBranch[],
  seeds?: Map<string, number>,
): Map<string, Tally> {
  const keep = branches ? new Set(branches) : null;
  const out = new Map<string, Tally>();
  for (const fixture of CUP_FIXTURES) {
    if (fixture.cupId !== cupId) continue;
    const round = CUP_ROUND_BY_ID[fixture.roundId];
    if (keep && !keep.has(round.branch)) continue;
    const r = fixture.result;
    if (!r) continue;
    const games = gamesBowled(r);
    for (const index of [0, 1] as const) {
      const other = index === 0 ? 1 : 0;
      const id = fixture.sides[index].teamId;
      const otherId = fixture.sides[other].teamId;
      if (!id) continue;
      const t = out.get(id) ?? emptyTally();
      t.matches += 1;
      t.games += games;
      t.gamesWon += r.gamesWon[index];
      t.pinfallFor += r.pinfall[index];
      t.pinfallAgainst += r.pinfall[other];
      t.highGame = Math.max(t.highGame, r.highGame[index]);
      const won = r.gamesWon[index] > r.gamesWon[other];
      if (won) t.won += 1;
      else t.lost += 1;
      if (seeds && otherId) {
        const s = seeds.get(otherId);
        if (s !== undefined) {
          t.opponentSeeds.push(s);
          if (won) t.beatenSeeds.push(s);
        }
      }
      out.set(id, t);
    }
  }
  return out;
}

/** Pins per Baker game. The rate a short season can be ranked on. */
function pinsPerGame(t: Tally): number {
  return t.games === 0 ? 0 : t.pinfallFor / t.games;
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

// ---------------------------------------------------------------
// Seeding
// ---------------------------------------------------------------

export interface SeedRow {
  seed: number;
  team: LeagueTeam;
  matches: number;
  won: number;
  lost: number;
  games: number;
  pinfall: number;
  /** Pins per Baker game, to one decimal at render. */
  pinsPerGame: number;
  label: ExhibitionLabel;
  provenance: Provenance;
}

/**
 * Seeds one to sixteen, earned rather than drawn.
 *
 * Ordered on matches won, then pins per Baker game. Two keys, both of
 * them a count of something that happened on a lane, and no composite
 * score with a weighting a reader would have to take on trust. Both keys
 * are columns on the screen, so the order can be checked by eye.
 *
 * The seeding nights exist because a building that has not opened has
 * nothing to seed a bracket from. Two nights of Swiss paired match play
 * produce the history the cup did not have on night one, and they put all
 * sixteen teams on the lanes twice before anybody can lose anything.
 */
export function seedingFor(cup: Cup): SeedRow[] {
  const t = tallies(cup.id, ["seeding"]);
  const rows = [...t.entries()]
    .map(([teamId, tally]) => ({ teamId, tally }))
    .filter((r) => LEAGUE_TEAM_BY_ID[r.teamId])
    .sort(
      (a, b) =>
        b.tally.won - a.tally.won ||
        pinsPerGame(b.tally) - pinsPerGame(a.tally) ||
        a.teamId.localeCompare(b.teamId),
    );

  return rows.map((r, i) => ({
    seed: i + 1,
    team: LEAGUE_TEAM_BY_ID[r.teamId],
    matches: r.tally.matches,
    won: r.tally.won,
    lost: r.tally.lost,
    games: r.tally.games,
    pinfall: r.tally.pinfallFor,
    pinsPerGame: pinsPerGame(r.tally),
    label: EXHIBITION_LABEL,
    provenance: "illustrative",
  }));
}

const SEED_CACHE = new Map<string, Map<string, number>>();

function seedMap(cupId: string): Map<string, number> {
  const hit = SEED_CACHE.get(cupId);
  if (hit) return hit;
  const cup = CUP_BY_ID[cupId];
  const map = new Map<string, number>();
  if (cup) {
    for (const row of seedingFor(cup)) map.set(row.team.id, row.seed);
  }
  SEED_CACHE.set(cupId, map);
  return map;
}

export function seedOf(cupId: string, teamId: string): number | null {
  return seedMap(cupId).get(teamId) ?? null;
}

// ---------------------------------------------------------------
// Where a team stands
// ---------------------------------------------------------------

/**
 * Where a team is in the competition, and there is no value for "out".
 *
 * That is not a euphemism, it is the format. A team beaten in the Cup
 * moves into the Plate, a team beaten in the Plate bowls the Long Game
 * for banked pins, and every one of the sixteen is on a lane on finals
 * night, either on the stepladder, in the Plate final, or in the handicap
 * sweeper on the other twelve lanes. Losing changes which competition
 * tonight's pins count towards. It never changes whether there is one.
 */
export type CupStanding = "in-the-cup" | "in-the-plate" | "in-the-sweeper";

export const CUP_STANDING_LABEL: Record<CupStanding, string> = {
  "in-the-cup": "In the Cup",
  "in-the-plate": "In the Plate",
  "in-the-sweeper": "In the sweeper",
};

export const CUP_STANDING_NOTE: Record<CupStanding, string> = {
  "in-the-cup": "Still in the main bracket.",
  "in-the-plate": "Beaten out of the Cup and playing for the Plate, which has its own final and its own trophy.",
  "in-the-sweeper": "Out of both brackets and on the lanes on finals night regardless, in the handicap squad.",
};

export type FormLetter = "W" | "L";

export interface CupLadderRow {
  rank: number;
  seed: number | null;
  team: LeagueTeam;
  league: League | null;
  formation: TeamFormation;
  /** The organisation behind the team, resolved from its id. */
  prospect: Prospect | null;
  standing: CupStanding;
  matches: number;
  won: number;
  lost: number;
  games: number;
  pinfall: number;
  pinsPerGame: number;
  highGame: number;
  /** Last five results, oldest first, reading left to right into tonight. */
  form: FormLetter[];
  /** Mean seed of every opponent faced, which is what a record is worth. */
  averageOpponentSeed: number | null;
  label: ExhibitionLabel;
  provenance: Provenance;
}

function standingOf(cupId: string, teamId: string): CupStanding {
  let inCup = false;
  let inPlate = false;
  for (const f of CUP_FIXTURES) {
    if (f.cupId !== cupId || f.result) continue;
    const onIt = f.sides.some((s) => s.teamId === teamId);
    if (!onIt) continue;
    const branch = CUP_ROUND_BY_ID[f.roundId].branch;
    if (branch === "cup" || branch === "wildcard" || branch === "stepladder") {
      inCup = true;
    }
    if (branch === "plate") inPlate = true;
  }
  if (inCup) return "in-the-cup";
  if (inPlate) return "in-the-plate";
  return "in-the-sweeper";
}

/**
 * The whole field, ranked on what has been bowled so far.
 *
 * Matches won first, then pins per game. The same two keys as the
 * seeding, for the same reason: both are counts, both are columns, and a
 * reader can check the order without being asked to trust a coefficient.
 */
export function cupLadder(cup: Cup): CupLadderRow[] {
  const seeds = seedMap(cup.id);
  const t = tallies(cup.id, undefined, seeds);
  const entries = CUP_ENTRIES.filter((e) => e.cupId === cup.id);

  const rows = entries
    .map((e) => ({ teamId: e.teamId, tally: t.get(e.teamId) ?? emptyTally() }))
    .filter((r) => LEAGUE_TEAM_BY_ID[r.teamId])
    .sort(
      (a, b) =>
        b.tally.won - a.tally.won ||
        pinsPerGame(b.tally) - pinsPerGame(a.tally) ||
        a.teamId.localeCompare(b.teamId),
    );

  return rows.map((r, i) => {
    const team = LEAGUE_TEAM_BY_ID[r.teamId];
    return {
      rank: i + 1,
      seed: seeds.get(r.teamId) ?? null,
      team,
      league: LEAGUE_BY_ID[team.leagueId] ?? null,
      formation: team.formation,
      prospect: team.prospectId ? (PROSPECT_BY_ID[team.prospectId] ?? null) : null,
      standing: standingOf(cup.id, r.teamId),
      matches: r.tally.matches,
      won: r.tally.won,
      lost: r.tally.lost,
      games: r.tally.games,
      pinfall: r.tally.pinfallFor,
      pinsPerGame: pinsPerGame(r.tally),
      highGame: r.tally.highGame,
      form: formFor(cup.id, r.teamId),
      averageOpponentSeed: mean(r.tally.opponentSeeds),
      label: EXHIBITION_LABEL,
      provenance: "illustrative",
    };
  });
}

// ---------------------------------------------------------------
// A team's run through the cup
// ---------------------------------------------------------------

export interface RunStep {
  fixture: FixtureView;
  /** The side this team is on. */
  index: 0 | 1;
  opponent: LeagueTeam | null;
  /** The rule that will name the opponent, where there is not one yet. */
  opponentRule: string | null;
  outcome: "won" | "lost" | "pending";
}

/** Every fixture a team has in a cup, bowled or not, in night order. */
export function runFor(cupId: string, teamId: string): RunStep[] {
  const seeds = seedMap(cupId);
  const steps: RunStep[] = [];
  for (const f of CUP_FIXTURES) {
    if (f.cupId !== cupId) continue;
    const index = f.sides[0].teamId === teamId ? 0 : f.sides[1].teamId === teamId ? 1 : -1;
    if (index < 0) continue;
    const i = index as 0 | 1;
    const other = (i === 0 ? 1 : 0) as 0 | 1;
    const view = buildFixtureView(f, seeds);
    steps.push({
      fixture: view,
      index: i,
      opponent: view.sides[other].team,
      opponentRule: view.sides[other].rule,
      outcome: view.settled ? (view.sides[i].won ? "won" : "lost") : "pending",
    });
  }
  return steps.sort(
    (a, b) => a.fixture.night - b.fixture.night || a.fixture.lanes[0] - b.fixture.lanes[0],
  );
}

/**
 * The last five results as letters, oldest first.
 *
 * Letters first and colour second, which is why this returns W and L
 * rather than a status enum: the letter is the primary signal and it
 * survives greyscale, a colourblind reader and a printout. The order is
 * stated here and never changes, because both orders exist in the wild
 * and a strip whose direction moves is worse than no strip at all.
 */
export function formFor(cupId: string, teamId: string, count = 5): FormLetter[] {
  return runFor(cupId, teamId)
    .filter((s) => s.outcome !== "pending")
    .slice(-count)
    .map((s) => (s.outcome === "won" ? "W" : "L"));
}

/**
 * Forward edges of the advancement graph.
 *
 * Built from both directions, because neither on its own is complete. A
 * fixture states where its winner and its loser go, which covers the
 * ordinary bracket. A destination states which fixtures its empty sides
 * come out of, which is the only way to express a rung filled by "the
 * semi final winner carrying the better seed", where one fixture has two
 * possible destinations and a single forward edge cannot say so.
 */
function forwardEdges(cupId: string, winnersOnly: boolean): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  const add = (from: string, to: string) => {
    const set = out.get(from) ?? new Set<string>();
    set.add(to);
    out.set(from, set);
  };
  for (const f of CUP_FIXTURES) {
    if (f.cupId !== cupId) continue;
    if (f.winnerTo) add(f.id, f.winnerTo.fixtureId);
    if (f.loserTo && !winnersOnly) add(f.id, f.loserTo.fixtureId);
    for (const s of f.sides) {
      if (!s.source) continue;
      const isLoserRoute =
        s.source.take === "loser" || s.source.take === "higher-seed-loser";
      if (isLoserRoute && winnersOnly) continue;
      for (const src of s.source.fixtureIds) add(src, f.id);
    }
  }
  return out;
}

/**
 * Every fixture a team still has to win, which is the path to the final.
 *
 * WINNER EDGES ONLY, and starting from the fixtures that have not been
 * bowled. Following the loser edges too would draw a route the team is
 * not on: a team that won its round of sixteen would light up the whole
 * Plate as well, because the Plate is where it would have gone had it
 * lost. That is the wrong answer to "who would you have to beat".
 *
 * Returned as ids so a screen can pin a route through the bracket from
 * one tap without recomputing anything. It is a set rather than a chain
 * on purpose: a semi final winner can land on either of two stepladder
 * rungs depending on its seed, and pretending otherwise would draw a line
 * that is not there.
 */
export function pathToFinal(cupId: string, teamId: string): string[] {
  const edges = forwardEdges(cupId, true);
  const seen = new Set<string>();
  const queue: string[] = [];

  for (const step of runFor(cupId, teamId)) {
    if (step.outcome !== "pending") continue;
    queue.push(step.fixture.fixture.id);
  }
  const out: string[] = [];
  while (queue.length) {
    const id = queue.shift() as string;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    for (const next of edges.get(id) ?? []) queue.push(next);
  }
  const order = new Map(CUP_FIXTURES.map((f, i) => [f.id, i]));
  return out.sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0));
}

// ---------------------------------------------------------------
// The stepladder
// ---------------------------------------------------------------

export interface StepladderRung {
  /** Four is the first to bowl. One bowls once, last, for the Cup. */
  rung: number;
  team: LeagueTeam | null;
  rule: string;
  /** Matches this rung has to win to take the Cup. */
  matchesToWin: number;
}

/**
 * The four rungs of finals night, read out of the fixture sources.
 *
 * The shape is the argument. The top seed bowls one match all night and
 * it is the last one, so the seeding earned on nights one and two is a
 * visible prize rather than a bracket position, and the team that came
 * back through the wildcard has to win three to take the Cup. That is a
 * story the moment the rungs are known, and it needs no manufactured
 * rivalry to tell.
 */
export function stepladderFor(cup: Cup): StepladderRung[] {
  const round = roundsFor(cup.id).find((r) => r.branch === "stepladder");
  if (!round) return [];
  const fixtures = fixturesForRound(round.id);
  const rungs: StepladderRung[] = [];
  fixtures.forEach((f, i) => {
    if (i === 0) {
      rungs.push({
        rung: fixtures.length + 1,
        team: f.sides[0].teamId ? LEAGUE_TEAM_BY_ID[f.sides[0].teamId] : null,
        rule: f.sides[0].source?.rule ?? "",
        matchesToWin: fixtures.length,
      });
    }
    rungs.push({
      rung: fixtures.length - i,
      team: f.sides[1].teamId ? LEAGUE_TEAM_BY_ID[f.sides[1].teamId] : null,
      rule: f.sides[1].source?.rule ?? "",
      matchesToWin: fixtures.length - i,
    });
  });
  return rungs.sort((a, b) => b.rung - a.rung);
}

// ---------------------------------------------------------------
// Teams and bowlers
// ---------------------------------------------------------------

export interface BowlerView {
  bowler: Bowler;
  /** Route segment for a profile, derived from the handle. */
  slug: string;
  team: LeagueTeam | null;
  ball: BallPreferences;
  /** Never established today, and the type says so rather than a comment. */
  average: BowlerAverage;
  /** Null for a bowler whose team is not in the cup field. */
  exhibition: BowlerExhibitionView | null;
}

export interface BowlerExhibitionView {
  label: ExhibitionLabel;
  provenance: Provenance;
  /** Two frames per Baker game the team bowled. Derived, never stored. */
  framesBowled: number;
  /** One first ball to a frame. */
  firstBalls: number;
  strikes: number;
  /** Frames left standing after the first ball. */
  spareChances: number;
  sparesConverted: number;
  /** Neither a strike nor a spare. */
  openFrames: number;
  /** Strikes plus spares. The number a beginner can actually move. */
  markedFrames: number;
  strikeRatePct: number;
  spareConversionPct: number;
  markedFramePct: number;
  /** Printed with the figure, because the term means two things. */
  strikeRateDefinition: string;
}

function teamGamesIn(cupId: string, teamId: string): number {
  let games = 0;
  for (const f of CUP_FIXTURES) {
    if (f.cupId !== cupId || !f.result) continue;
    if (f.sides[0].teamId !== teamId && f.sides[1].teamId !== teamId) continue;
    games += gamesBowled(f.result);
  }
  return games;
}

function exhibitionView(bowler: Bowler): BowlerExhibitionView | null {
  const ex = bowler.exhibition;
  if (!ex) return null;
  const cup = currentCup();
  const framesBowled = teamGamesIn(cup.id, bowler.teamId) * BAKER_FRAMES_PER_BOWLER;
  const spareChances = Math.max(0, framesBowled - ex.strikes);
  const openFrames = Math.max(0, spareChances - ex.sparesConverted);
  const marked = ex.strikes + ex.sparesConverted;
  const pct = (n: number, d: number) => (d === 0 ? 0 : Math.round((n / d) * 100));
  return {
    label: ex.label,
    provenance: ex.provenance,
    framesBowled,
    firstBalls: framesBowled,
    strikes: ex.strikes,
    spareChances,
    sparesConverted: ex.sparesConverted,
    openFrames,
    markedFrames: marked,
    strikeRatePct: pct(ex.strikes, framesBowled),
    spareConversionPct: pct(ex.sparesConverted, spareChances),
    markedFramePct: pct(marked, framesBowled),
    strikeRateDefinition:
      "Strikes as a share of first balls thrown. The same words are used elsewhere for strikes as a share of pocket hits, which is a different number, so this one states which it is.",
  };
}

function toBowlerView(bowler: Bowler): BowlerView {
  return {
    bowler,
    slug: bowlerSlug(bowler.handle),
    team: LEAGUE_TEAM_BY_ID[bowler.teamId] ?? null,
    ball: bowler.ball,
    average: bowler.average,
    exhibition: exhibitionView(bowler),
  };
}

/** A roster in bowling order, lead off through anchor. */
export function bowlerViewsFor(teamId: string): BowlerView[] {
  return rosterFor(teamId).map(toBowlerView);
}

export function bowlerView(handle: string): BowlerView | null {
  const b = bowlerByHandle(handle);
  return b ? toBowlerView(b) : null;
}

export function bowlerViewBySlug(slug: string): BowlerView | null {
  const b = allBowlers().find((x) => bowlerSlug(x.handle) === slug);
  return b ? toBowlerView(b) : null;
}

export interface CupTeamView {
  team: LeagueTeam;
  league: League | null;
  /** The organisation behind the team, where there is one. */
  prospect: Prospect | null;
  formation: TeamFormation;
  captain: Bowler | null;
  roster: BowlerView[];
  seed: number | null;
  standing: CupStanding;
  ladder: CupLadderRow | null;
  run: RunStep[];
  form: FormLetter[];
  /** Fixture ids this team can still reach. */
  path: string[];
  /** The team's next fixture, bowled or not. */
  next: FixtureView | null;
  /** Never established. Printed with its denominator. */
  average: BowlerAverage;
}

const NOT_ESTABLISHED_TEAM: BowlerAverage = {
  kind: "not-established",
  gamesBowled: 0,
  gamesRequired: 21,
  because:
    "A team average needs league games and the leagues have not started. Cup nights are Baker scored, which produces a team score for a match rather than an average for a season.",
};

export function cupTeam(cupId: string, teamId: string): CupTeamView | null {
  const team = LEAGUE_TEAM_BY_ID[teamId];
  if (!team) return null;
  const run = runFor(cupId, teamId);
  const ladder = cupLadder(CUP_BY_ID[cupId] ?? currentCup()).find(
    (r) => r.team.id === teamId,
  );
  return {
    team,
    league: LEAGUE_BY_ID[team.leagueId] ?? null,
    prospect: team.prospectId ? (PROSPECT_BY_ID[team.prospectId] ?? null) : null,
    formation: team.formation,
    captain: captainOf(teamId),
    roster: bowlerViewsFor(teamId),
    seed: seedOf(cupId, teamId),
    standing: standingOf(cupId, teamId),
    ladder: ladder ?? null,
    run,
    form: formFor(cupId, teamId),
    path: pathToFinal(cupId, teamId),
    next: run.find((s) => s.outcome === "pending")?.fixture ?? null,
    average: NOT_ESTABLISHED_TEAM,
  };
}

/** Every team in a cup field, in ladder order. */
export function cupTeams(cup: Cup): CupTeamView[] {
  return cupLadder(cup)
    .map((row) => cupTeam(cup.id, row.team.id))
    .filter((v): v is CupTeamView => v !== null);
}

/**
 * A team outside any cup, for the twelve that are not in this field.
 *
 * Same roster, same route in, no seed and no run. A team that did not
 * enter is not a lesser team, it is a team that did not have five bodies
 * in August, and the surface should be able to say so without a bracket.
 */
export function teamView(teamId: string): CupTeamView | null {
  const team = LEAGUE_TEAM_BY_ID[teamId];
  if (!team) return null;
  return {
    team,
    league: LEAGUE_BY_ID[team.leagueId] ?? null,
    prospect: team.prospectId ? (PROSPECT_BY_ID[team.prospectId] ?? null) : null,
    formation: team.formation,
    captain: captainOf(teamId),
    roster: bowlerViewsFor(teamId),
    seed: null,
    standing: "in-the-sweeper",
    ladder: null,
    run: [],
    form: [],
    path: [],
    next: null,
    average: NOT_ESTABLISHED_TEAM,
  };
}

// ---------------------------------------------------------------
// The build up
// ---------------------------------------------------------------

/**
 * The one fixture worth promoting right now.
 *
 * A scheduled fixture beats a live one and a live one beats an awaiting
 * one, because a scheduled fixture is the only state a person can still
 * be sold a seat for. Among equals, the later round wins, because a
 * bigger round is a bigger night. This is the answer to the question the
 * whole surface exists to answer, which is what a rep should do on
 * Monday.
 */
export function headlineFixture(cup: Cup): FixtureView | null {
  const rank: Partial<Record<MatchState, number>> = {
    scheduled: 0,
    live: 1,
    "awaiting-opponent": 2,
  };
  const candidates = fixtureViews(cup.id).filter(
    (f) => rank[f.state] !== undefined,
  );
  if (candidates.length === 0) return null;
  return candidates.sort(
    (a, b) =>
      (rank[a.state] ?? 9) - (rank[b.state] ?? 9) ||
      b.round.depth - a.round.depth ||
      a.night - b.night,
  )[0];
}

/** Settled wins across the stated seed gap, most recent first. */
export function upsetsIn(cup: Cup): FixtureView[] {
  return fixtureViews(cup.id)
    .filter((f) => f.isUpset)
    .sort((a, b) => b.night - a.night || a.lanes[0] - b.lanes[0]);
}

export interface EnrollmentView {
  cup: Cup;
  field: number;
  claimed: number;
  confirmed: number;
  held: number;
  free: number;
  /** Bowlers already committed across the entered teams. */
  bowlers: number;
  /** The fee, and it is this application's own. */
  fee: number;
  feePerBowler: number;
  feeProvenance: Provenance;
  feeNote: string;
  closesAt: string | null;
  /** Whole days to the deadline. Negative once it has passed. */
  daysToClose: number | null;
  /** Teams in the field, in the order they entered. */
  entries: CupTeamView[];
}

/**
 * The enrollment, and every scarcity claim on it is physically true.
 *
 * "Five slots free of sixteen" is honest because the field is sixteen
 * for a reason that is a property of the format: two lanes to a match,
 * eight matches, nobody drawn twice in an evening. The deadline is
 * honest because it
 * actually closes and the next cup really is the next opportunity. There
 * is no viewer count on this type, no popularity figure and no timer that
 * can reset, because those are the three devices the pattern literature
 * exists to name.
 */
export function enrollmentFor(
  cup: Cup,
  asOf: string = CUP_AS_OF_DATE,
): EnrollmentView {
  const entries = CUP_ENTRIES.filter((e) => e.cupId === cup.id).sort(
    (a, b) => a.entryNumber - b.entryNumber,
  );
  let confirmed = 0;
  let held = 0;
  let bowlers = 0;
  for (const e of entries) {
    if (e.state === "confirmed") confirmed += 1;
    else held += 1;
    bowlers += LEAGUE_TEAM_BY_ID[e.teamId]?.bowlersCommitted ?? 0;
  }
  return {
    cup,
    field: cup.fieldSize,
    claimed: entries.length,
    confirmed,
    held,
    free: Math.max(0, cup.fieldSize - entries.length),
    bowlers,
    fee: cup.registrationFee,
    feePerBowler: Math.round(cup.registrationFee / cup.teamSize),
    feeProvenance: cup.registrationFeeProvenance,
    feeNote: cup.registrationFeeNote,
    closesAt: cup.enrollmentClosesAt ?? null,
    daysToClose: cup.enrollmentClosesAt
      ? daysUntil(cup.enrollmentClosesAt, asOf)
      : null,
    entries: entries
      .map((e) => cupTeam(cup.id, e.teamId))
      .filter((v): v is CupTeamView => v !== null),
  };
}

// ---------------------------------------------------------------
// The tale of the tape
// ---------------------------------------------------------------

export type TapeDirection = "higher" | "lower" | "none";

export interface TapeRow {
  key: string;
  label: string;
  /** Ready to print. The card does no arithmetic of its own. */
  a: string;
  b: string;
  /** The comparable number, where the row has one. */
  aValue: number | null;
  bValue: number | null;
  direction: TapeDirection;
  /** Printed on the row, because the direction is not always obvious. */
  directionLabel: string;
  /** Which side holds the row. Computed here so nothing downstream does. */
  edge: "a" | "b" | "level";
  /** True where the figure comes from the declared exhibition. */
  simulated: boolean;
  provenance: Provenance;
  note?: string;
}

export interface TaleOfTheTape {
  a: CupTeamView;
  b: CupTeamView;
  /** Twelve rows. The first seven exist today; the rest are simulated. */
  rows: TapeRow[];
  /** One named row, promoted, with its direction printed. */
  decider: TapeRow;
  headToHead: {
    played: number;
    aWins: number;
    bWins: number;
    /** A sentence, because a record with no key is a puzzle. */
    sentence: string;
  };
  /** Present because the card carries simulated figures. */
  label: ExhibitionLabel;
}

const DIRECTION_LABEL: Record<TapeDirection, string> = {
  higher: "Higher is better",
  lower: "Lower is better",
  none: "Neither is better",
};

function row(
  key: string,
  label: string,
  a: string,
  b: string,
  aValue: number | null,
  bValue: number | null,
  direction: TapeDirection,
  simulated: boolean,
  note?: string,
): TapeRow {
  let edge: "a" | "b" | "level" = "level";
  if (direction !== "none" && aValue !== null && bValue !== null && aValue !== bValue) {
    const aBetter = direction === "higher" ? aValue > bValue : aValue < bValue;
    edge = aBetter ? "a" : "b";
  }
  return {
    key,
    label,
    a,
    b,
    aValue,
    bValue,
    direction,
    directionLabel: DIRECTION_LABEL[direction],
    edge,
    simulated,
    provenance: "illustrative",
    note,
  };
}

const FORMATION_WORD: Record<TeamFormation, string> = {
  "venue-formed": "The venue put it together",
  "captain-formed": "A captain brought the roster",
  "organisation-formed": "An organisation fielded it",
};

function one(n: number): string {
  return (Math.round(n * 10) / 10).toFixed(1);
}

function rosterRates(view: CupTeamView): { strike: number; spare: number } {
  let strikes = 0;
  let firstBalls = 0;
  let spares = 0;
  let chances = 0;
  for (const b of view.roster) {
    if (!b.exhibition) continue;
    strikes += b.exhibition.strikes;
    firstBalls += b.exhibition.firstBalls;
    spares += b.exhibition.sparesConverted;
    chances += b.exhibition.spareChances;
  }
  return {
    strike: firstBalls === 0 ? 0 : (strikes / firstBalls) * 100,
    spare: chances === 0 ? 0 : (spares / chances) * 100,
  };
}

/**
 * Two teams, side by side, with nothing decorative on it.
 *
 * The boxing tale of the tape is fourteen anthropometric rows and most of
 * them decide nothing; reach without technique predicts no result and
 * everybody who follows the sport knows it. The lesson is not to skip the
 * device, it is to keep decorative statistics off it. So there is no ball
 * weight row here. Ball weight is a genuinely good field on a profile and
 * it is the bowling equivalent of reach on a fight card: fun, measurable,
 * and no use at all as a prediction.
 *
 * What is on it instead: the seven rows that are true today with the
 * building shut, and five that come out of the declared exhibition and
 * carry its label. A tape built only from the first seven would still
 * work, and it would survive a room in which somebody asks how a venue
 * that has not opened has a scoreboard.
 *
 * There is no win probability anywhere on this type and there is not
 * going to be. Nothing has been bowled, a model fitted to a simulation is
 * a number about a simulation, and seed difference does the same job
 * honestly and cannot be wrong.
 */
export function taleOfTheTape(
  cupId: string,
  aId: string,
  bId: string,
): TaleOfTheTape | null {
  const a = cupTeam(cupId, aId);
  const b = cupTeam(cupId, bId);
  if (!a || !b) return null;

  const la = a.ladder;
  const lb = b.ladder;
  const ra = rosterRates(a);
  const rb = rosterRates(b);
  const league = a.league;
  const teamSize = league?.teamSize ?? 5;

  const rows: TapeRow[] = [
    row("name", "Team", a.team.name, b.team.name, null, null, "none", false),
    row(
      "seed",
      "Seed",
      a.seed ? `${a.seed} of 16` : "Unseeded",
      b.seed ? `${b.seed} of 16` : "Unseeded",
      a.seed,
      b.seed,
      "lower",
      true,
      "Earned over the two seeding nights on record then pins per game, not drawn.",
    ),
    row(
      "formed",
      "Formed",
      FORMATION_WORD[a.formation],
      FORMATION_WORD[b.formation],
      null,
      null,
      "none",
      false,
    ),
    row(
      "from",
      "From",
      a.prospect?.name ?? "Unaffiliated",
      b.prospect?.name ?? "Unaffiliated",
      null,
      null,
      "none",
      false,
    ),
    row(
      "captain",
      "Captain",
      a.captain ? `${a.captain.handle}, ${a.team.captainRole}` : a.team.captainRole,
      b.captain ? `${b.captain.handle}, ${b.team.captainRole}` : b.team.captainRole,
      null,
      null,
      "none",
      false,
      "Bowlers appear as handles. A handle is not a person's name.",
    ),
    row(
      "roster",
      "Roster",
      `${a.team.bowlersCommitted} of ${teamSize}`,
      `${b.team.bowlersCommitted} of ${teamSize}`,
      a.team.bowlersCommitted,
      b.team.bowlersCommitted,
      "higher",
      false,
    ),
    row(
      "claimed",
      "Claimed a slot",
      a.team.claimedAt,
      b.team.claimedAt,
      -Date.parse(a.team.claimedAt),
      -Date.parse(b.team.claimedAt),
      "higher",
      false,
      "Earlier is the longer relationship. This is the cup debut date and it is a real fact about a real enrollment.",
    ),
    row(
      "record",
      "Cup record",
      la ? `${la.won} won, ${la.lost} lost` : "Not yet established",
      lb ? `${lb.won} won, ${lb.lost} lost` : "Not yet established",
      la?.won ?? null,
      lb?.won ?? null,
      "higher",
      true,
    ),
    row(
      "ppg",
      "Pins per Baker game",
      la ? one(la.pinsPerGame) : "Not yet established",
      lb ? one(lb.pinsPerGame) : "Not yet established",
      la?.pinsPerGame ?? null,
      lb?.pinsPerGame ?? null,
      "higher",
      true,
      "A rate rather than a total, so a team with two matches behind it can be compared to a team with five.",
    ),
    row(
      "handicap",
      "Handicap",
      "Not yet established",
      "Not yet established",
      null,
      null,
      "none",
      false,
      `Will be ${HANDICAP_FACTOR_PCT} per cent of ${HANDICAP_BASIS} once there are averages to compute one from. The basis is this proposal's own and Round1 publishes no handicap system.`,
    ),
    row(
      "form",
      "Form, last five",
      a.form.join(" ") || "No matches yet",
      b.form.join(" ") || "No matches yet",
      a.form.filter((f) => f === "W").length,
      b.form.filter((f) => f === "W").length,
      "higher",
      true,
      "Oldest on the left, reading into tonight.",
    ),
    row(
      "opposition",
      "Average opponent seed",
      la?.averageOpponentSeed !== null && la ? one(la.averageOpponentSeed as number) : "No matches yet",
      lb?.averageOpponentSeed !== null && lb ? one(lb.averageOpponentSeed as number) : "No matches yet",
      la?.averageOpponentSeed ?? null,
      lb?.averageOpponentSeed ?? null,
      "lower",
      true,
      "A three and nothing record means nothing without the seeds it was won against. Boxing calls this quality of opposition and it is the one idea on a fight card worth stealing outright.",
    ),
  ];

  /* The decider. One named row, promoted to the top of the card, chosen
     as the row where the two teams are furthest apart in proportion to
     the numbers involved. Choosing it rather than showing six stats is
     the whole point: a card with six numbers on it has told a reader
     nothing about which one matters tonight. */
  const candidates: TapeRow[] = [
    rows.find((r) => r.key === "ppg") as TapeRow,
    rows.find((r) => r.key === "opposition") as TapeRow,
    row(
      "strike",
      "Strike rate across the roster",
      `${Math.round(ra.strike)}%`,
      `${Math.round(rb.strike)}%`,
      ra.strike,
      rb.strike,
      "higher",
      true,
      "Strikes as a share of first balls thrown, which is one of the two things that phrase is used for and this is the one meant here.",
    ),
    row(
      "spare",
      "Spare conversion across the roster",
      `${Math.round(ra.spare)}%`,
      `${Math.round(rb.spare)}%`,
      ra.spare,
      rb.spare,
      "higher",
      true,
      "The stat that decides more league matches than striking does, and the one a first timer can move fastest.",
    ),
    row(
      "high",
      "Best single Baker game",
      la ? String(la.highGame) : "No games yet",
      lb ? String(lb.highGame) : "No games yet",
      la?.highGame ?? null,
      lb?.highGame ?? null,
      "higher",
      true,
    ),
  ];

  let decider = candidates[0];
  let widest = -1;
  for (const c of candidates) {
    if (c.aValue === null || c.bValue === null) continue;
    const scale = Math.max(Math.abs(c.aValue), Math.abs(c.bValue), 1);
    const gap = Math.abs(c.aValue - c.bValue) / scale;
    if (gap > widest) {
      widest = gap;
      decider = c;
    }
  }

  const met = runFor(cupId, aId).filter(
    (s) => s.opponent?.id === bId && s.outcome !== "pending",
  );
  const aWins = met.filter((s) => s.outcome === "won").length;
  const bWins = met.length - aWins;

  return {
    a,
    b,
    rows,
    decider,
    headToHead: {
      played: met.length,
      aWins,
      bWins,
      sentence:
        met.length === 0
          ? `${a.team.name} and ${b.team.name} have not met in this cup.`
          : `${a.team.name} ${aWins}, ${b.team.name} ${bWins}, from ${met.length} ${met.length === 1 ? "meeting" : "meetings"} in this cup.`,
    },
    label: EXHIBITION_LABEL,
  };
}

// ---------------------------------------------------------------
// The whole cup, in one object
// ---------------------------------------------------------------

export interface CupView {
  cup: Cup;
  shape: CupShape;
  nights: CupNightView[];
  ladder: CupLadderRow[];
  seeding: SeedRow[];
  stepladder: StepladderRung[];
  enrollment: EnrollmentView;
  headline: FixtureView | null;
  upsets: FixtureView[];
  /**
   * Share of the house the cup takes on a cup night, which is null
   * because Round1 publishes no lane count to take a share of. See
   * `CupNightView.laneSharePct` for the whole argument.
   */
  laneSharePct: null;
  /** Days to the next night that has not been bowled. */
  daysToNextNight: number | null;
}

export function cupView(cup: Cup, asOf: string = CUP_AS_OF_DATE): CupView {
  const shape = shapeOf(cup);
  const nights = nightsFor(cup, asOf);
  const next = nights.find((n) => n.daysAway > 0) ?? null;
  return {
    cup,
    shape,
    nights,
    ladder: cupLadder(cup),
    seeding: seedingFor(cup),
    stepladder: stepladderFor(cup),
    enrollment: enrollmentFor(cup, asOf),
    headline: headlineFixture(cup),
    upsets: upsetsIn(cup),
    /* Peak lanes over the house total, which has no published value.
       `shape.peakLanes` is still carried and still true. */
    laneSharePct: null,
    daysToNextNight: next ? next.daysAway : null,
  };
}
