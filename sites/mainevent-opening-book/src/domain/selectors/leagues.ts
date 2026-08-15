import type { Prospect } from "@/domain/types";
import type {
  League,
  LeagueTeam,
  RosterState,
  SeasonShape,
  SlotState,
  TeamFormation,
} from "@/domain/leagues";
import {
  rosterStateOf,
  seasonShape,
  seatsOpen,
} from "@/domain/leagues";
import type { Bowler } from "@/domain/cup";
import { POSITION_ORDER } from "@/domain/leagues";
import { LEAGUES, LEAGUE_BOWLERS, LEAGUE_TEAMS } from "@/data/leagues";
import { PROSPECT_BY_ID } from "@/data/prospects";
import { SEED_LEAGUE_INTEREST } from "@/data/requests";
import type { LeagueInterest } from "@/domain/requests";
import { VENUE } from "@/data/venue";

/**
 * THE LEAGUE BOARD, DERIVED.
 *
 * Nothing on either league screen is stored. The seed carries slots,
 * rosters and dates; this file turns those into a ladder, a field, a
 * schedule and a lane count, at render. Add one bowler to one team in
 * `data/leagues.ts` and the ladder reorders, the seats count drops, the
 * openness reading can flip and the board's headline figure moves, with
 * nobody editing a second number anywhere.
 *
 * ---------------------------------------------------------------
 * THE LADDER IS NOT A SCOREBOARD AND THIS FILE IS WHERE THAT HOLDS
 * ---------------------------------------------------------------
 *
 * The venue has not opened. There are no scores, so `ladderFor` ranks on
 * three visible keys and no hidden ones:
 *
 *   1. SLOT STATE. A confirmed slot outranks a held one, and a held slot
 *      outranks an empty one. A hold is a place kept without a deposit
 *      under the pre-opening offer, which is real enough to keep somebody
 *      else out and not real enough to count as a registration.
 *   2. BODIES ON THE ROSTER. More bowlers committed ranks higher. A team
 *      of five can bowl on week one; a team of three cannot.
 *   3. THE DATE THE SLOT WAS CLAIMED. Earlier first, which is the only
 *      fair way to break a tie in a queue.
 *
 * There is no composite score, no weighting and no coefficient, because
 * every one of those would be a number a reader has to take on trust in
 * a table whose whole job is to be checkable. Each key is a column on
 * the screen, so the order can be verified by eye.
 *
 * ---------------------------------------------------------------
 * WHY EMPTY SLOTS ARE ROWS
 * ---------------------------------------------------------------
 *
 * A field of sixteen with twelve teams in it is not a table of twelve.
 * The four empty slots are the product: they are what a team can still
 * claim, and they are the difference between a league that is forming
 * and a league that is full. So the ladder always returns sixteen rows
 * and the empty ones carry a null team rather than being filtered out.
 */

export interface LadderRow {
  /** One to sixteen. Position in the ladder, not the number on the draw. */
  rank: number;
  /** The slot in the field, where a team holds one. */
  slot: number | null;
  /** Null on an unclaimed slot, which is a row rather than an absence. */
  team: LeagueTeam | null;
  slotState: SlotState;
  bowlersCommitted: number;
  seatsOpen: number;
  rosterState: RosterState | null;
  /** The organisation behind the team, resolved from its id. */
  prospect: Prospect | null;
}

/** Teams in one league, in slot order. */
export function teamsFor(leagueId: string): LeagueTeam[] {
  return LEAGUE_TEAMS.filter((t) => t.leagueId === leagueId).sort(
    (a, b) => a.slot - b.slot,
  );
}

// ---------------------------------------------------------------
// Rosters
// ---------------------------------------------------------------

/**
 * One team's bowlers, in the order the team actually bowls them.
 *
 * Lead off first, anchor last, substitutes after that, because the order
 * on a team sheet is a fact about the match rather than an alphabetical
 * convenience. The anchor bowls the tenth frame and that is the whole
 * drama of a Baker game, so putting them anywhere but last would throw
 * away the one thing the order tells a reader.
 */
export function rosterFor(teamId: string): Bowler[] {
  return LEAGUE_BOWLERS.filter((b) => b.teamId === teamId).sort(
    (a, b) =>
      POSITION_ORDER.indexOf(a.position) - POSITION_ORDER.indexOf(b.position),
  );
}

/** Every bowler on the board, both leagues, in seed order. */
export function allBowlers(): Bowler[] {
  return LEAGUE_BOWLERS;
}

/**
 * The captain, as a handle rather than a title.
 *
 * `LeagueTeam.captainRole` carries the JOB, which is what the leagues
 * board has always shown and what a rep needs to know before a call. This
 * is the other half: what that person is called on the lanes. Every team
 * has exactly one and the proof pass asserts it, because a team without a
 * captain is a team nobody can be asked to bring five people.
 */
export function captainOf(teamId: string): Bowler | null {
  return rosterFor(teamId).find((b) => b.isCaptain) ?? null;
}

export function bowlerByHandle(handle: string): Bowler | null {
  return LEAGUE_BOWLERS.find((b) => b.handle === handle) ?? null;
}

/** Teams grouped by how they came to exist, across both leagues. */
export function teamsByFormation(): Record<TeamFormation, LeagueTeam[]> {
  const out: Record<TeamFormation, LeagueTeam[]> = {
    "venue-formed": [],
    "captain-formed": [],
    "organisation-formed": [],
  };
  for (const t of LEAGUE_TEAMS) out[t.formation].push(t);
  return out;
}

const SLOT_RANK: Record<SlotState, number> = {
  confirmed: 0,
  held: 1,
  free: 2,
};

/**
 * The field of sixteen, ranked, with every empty slot still in it.
 *
 * The returned array is always `league.fieldSize` long. A seed carrying
 * more teams than the field has slots would be a data error rather than
 * a display one, so the extra rows are kept and ranked rather than being
 * silently dropped; the count on the board would then read higher than
 * the field and somebody would notice, which is the correct outcome.
 */
export function ladderFor(league: League): LadderRow[] {
  const teams = teamsFor(league.id);

  const claimed = teams.map((team) => ({
    team,
    slotState: team.slotState as SlotState,
    bowlers: team.bowlersCommitted,
    seats: seatsOpen(team, league),
  }));

  const emptyCount = Math.max(0, league.fieldSize - teams.length);
  const empties = Array.from({ length: emptyCount }, () => ({
    team: null as LeagueTeam | null,
    slotState: "free" as SlotState,
    bowlers: 0,
    seats: league.teamSize,
  }));

  const all = [...claimed, ...empties];

  all.sort((a, b) => {
    const s = SLOT_RANK[a.slotState] - SLOT_RANK[b.slotState];
    if (s !== 0) return s;
    if (a.bowlers !== b.bowlers) return b.bowlers - a.bowlers;
    const ca = a.team?.claimedAt ?? "9999-12-31";
    const cb = b.team?.claimedAt ?? "9999-12-31";
    if (ca !== cb) return ca < cb ? -1 : 1;
    return (a.team?.slot ?? 0) - (b.team?.slot ?? 0);
  });

  return all.map((r, i) => ({
    rank: i + 1,
    slot: r.team ? r.team.slot : null,
    team: r.team,
    slotState: r.slotState,
    bowlersCommitted: r.bowlers,
    seatsOpen: r.seats,
    rosterState: r.team ? rosterStateOf(r.team, league) : null,
    prospect: r.team?.prospectId
      ? (PROSPECT_BY_ID[r.team.prospectId] ?? null)
      : null,
  }));
}

// ---------------------------------------------------------------
// Counts
// ---------------------------------------------------------------

export interface LeagueSlots {
  field: number;
  confirmed: number;
  held: number;
  free: number;
  /** Slots with a team on them, whatever state that team is in. */
  claimed: number;
  /** Bowlers signed up across the whole field. */
  bowlers: number;
  /** Seats a single bowler could take, across every short roster. */
  seats: number;
  /** Rosters that are a body short. The number that decides openness. */
  shortRosters: number;
}

export function slotsFor(league: League): LeagueSlots {
  const teams = teamsFor(league.id);
  let confirmed = 0;
  let held = 0;
  let bowlers = 0;
  let seats = 0;
  let shortRosters = 0;

  for (const t of teams) {
    if (t.slotState === "confirmed") confirmed += 1;
    else held += 1;
    bowlers += t.bowlersCommitted;
    const open = seatsOpen(t, league);
    seats += open;
    if (open > 0) shortRosters += 1;
  }

  return {
    field: league.fieldSize,
    confirmed,
    held,
    free: Math.max(0, league.fieldSize - teams.length),
    claimed: teams.length,
    bowlers,
    seats,
    shortRosters,
  };
}

export interface BoardTotals {
  leagues: number;
  field: number;
  claimed: number;
  free: number;
  bowlers: number;
  seats: number;
  /** Lanes both leagues hold in a single week, across their two nights. */
  lanesPerWeek: number;
  /** Lanes multiplied by weeks, both leagues. Inventory, never money. */
  laneNights: number;
  /**
   * The busiest single night, as a share of the published lane floor.
   *
   * Main Event publishes "more than 26 lanes" for Brea and this app
   * treats 26 as a floor everywhere, so this percentage can only ever
   * overstate how much of the house a league takes. That is the safe
   * direction to be wrong in when the figure is going to a general
   * manager who has to keep the rest of the building sellable.
   */
  peakNightLaneSharePct: number;
  /** Teams with an organisation on the prospecting board behind them. */
  affiliatedTeams: number;
  /** Distinct organisations from data/prospects.ts fielding a team. */
  affiliatedOrganisations: number;
}

export function boardTotals(): BoardTotals {
  let field = 0;
  let claimed = 0;
  let free = 0;
  let bowlers = 0;
  let seats = 0;
  let lanesPerWeek = 0;
  let laneNights = 0;
  let peakLanes = 0;

  for (const league of LEAGUES) {
    const s = slotsFor(league);
    const shape = seasonShape(league);
    field += s.field;
    claimed += s.claimed;
    free += s.free;
    bowlers += s.bowlers;
    seats += s.seats;
    lanesPerWeek += shape.lanesPerNight;
    laneNights += shape.laneNights;
    peakLanes = Math.max(peakLanes, shape.lanesPerNight);
  }

  const orgs = new Set<string>();
  let affiliatedTeams = 0;
  for (const t of LEAGUE_TEAMS) {
    if (t.prospectId && PROSPECT_BY_ID[t.prospectId]) {
      affiliatedTeams += 1;
      orgs.add(t.prospectId);
    }
  }

  return {
    leagues: LEAGUES.length,
    field,
    claimed,
    free,
    bowlers,
    seats,
    lanesPerWeek,
    laneNights,
    peakNightLaneSharePct: Math.round(
      (peakLanes / VENUE.bowlingLanesPublishedFloor) * 100,
    ),
    affiliatedTeams,
    affiliatedOrganisations: orgs.size,
  };
}

// ---------------------------------------------------------------
// Where the leagues meet the rest of the application
// ---------------------------------------------------------------

export interface AffiliatedOrg {
  prospect: Prospect;
  teams: LeagueTeam[];
}

/**
 * Organisations from the prospecting board that are fielding a team.
 *
 * This is the join that makes the leagues part of the same product
 * rather than a folder of screens. A team that formed out of a local
 * employer is a booking that came off the board, and an organisation
 * with two teams in two leagues is a relationship that is worth more
 * than either booking on its own.
 *
 * Sorted by team count so the deepest relationship is first, then by
 * name so the order is stable for a screenshot.
 */
export function affiliatedOrganisations(): AffiliatedOrg[] {
  const byId = new Map<string, LeagueTeam[]>();
  for (const t of LEAGUE_TEAMS) {
    if (!t.prospectId || !PROSPECT_BY_ID[t.prospectId]) continue;
    const list = byId.get(t.prospectId) ?? [];
    list.push(t);
    byId.set(t.prospectId, list);
  }
  return [...byId.entries()]
    .map(([id, teams]) => ({ prospect: PROSPECT_BY_ID[id], teams }))
    .sort(
      (a, b) =>
        b.teams.length - a.teams.length ||
        a.prospect.name.localeCompare(b.prospect.name),
    );
}

/**
 * Inbound asks about a league, matched to the night they asked for.
 *
 * These rows are not invented for this screen. They already sit in
 * `data/requests.ts` as `SEED_LEAGUE_INTEREST`, they are worked on the
 * requests board against the same response commitment as any other
 * enquiry, and they are the evidence that midweek league demand exists
 * in this trade area at all. Reading them here rather than seeding a
 * second copy is the difference between one product and two screens that
 * happen to agree.
 *
 * An ask with no night preference matches every league, because a person
 * who did not name a night has not ruled one out.
 */
export function interestFor(league: League): LeagueInterest[] {
  return SEED_LEAGUE_INTEREST.filter(
    (i) => i.preferredNights.length === 0 || i.preferredNights.includes(league.night),
  );
}

/** Every league ask, answered or not. The demand behind the board. */
export function allInterest(): LeagueInterest[] {
  return [...SEED_LEAGUE_INTEREST].sort((a, b) =>
    a.receivedAt < b.receivedAt ? 1 : -1,
  );
}

/** Asks still without an answer. The only count on this board that is work. */
export function unansweredInterest(): LeagueInterest[] {
  return SEED_LEAGUE_INTEREST.filter((i) => !i.answeredAt);
}

// ---------------------------------------------------------------
// The schedule, for one league
// ---------------------------------------------------------------

export interface LeagueView {
  league: League;
  slots: LeagueSlots;
  shape: SeasonShape;
  ladder: LadderRow[];
  teams: LeagueTeam[];
  /** The organisation this league grew out of, resolved. */
  anchor: Prospect | null;
  /** Share of the published lane floor this league holds on its night. */
  laneSharePct: number;
}

export function leagueView(league: League): LeagueView {
  const shape = seasonShape(league);
  return {
    league,
    slots: slotsFor(league),
    shape,
    ladder: ladderFor(league),
    teams: teamsFor(league.id),
    anchor: PROSPECT_BY_ID[league.anchorProspectId] ?? null,
    laneSharePct: Math.round(
      (shape.lanesPerNight / VENUE.bowlingLanesPublishedFloor) * 100,
    ),
  };
}

/** Every league as a view, in seed order. */
export function leagueViews(): LeagueView[] {
  return LEAGUES.map(leagueView);
}
