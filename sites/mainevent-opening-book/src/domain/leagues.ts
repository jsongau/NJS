import type { Provenance } from "@/domain/types";
import type { StatusToken } from "@/domain/vocabulary";

/**
 * LEAGUES. THE ONLY RECURRING PRODUCT THIS BUILDING SELLS.
 *
 * Every other surface in this application sells one night. A grad night,
 * a holiday party, a staff appreciation evening: one date, one invoice,
 * one conversation that starts again from nothing next year. That is a
 * transactional book, and a transactional book is the book a pre-opening
 * venue is most tempted to build, because each line closes fast.
 *
 * A league is the other kind. Sixteen teams claim the same pair of lanes
 * at the same hour every week for a whole season, and they recruit each
 * other rather than being recruited one at a time. It is the single
 * highest retention product a bowling house owns, it fills the midweek
 * evenings that are hardest to sell, and it is booked months before the
 * first ball is thrown.
 *
 * ---------------------------------------------------------------
 * THE THING THIS FILE REFUSES TO DO
 * ---------------------------------------------------------------
 *
 * MAIN EVENT BREA HAS NOT OPENED. Nothing has bowled a frame here. So
 * there are no scores, no averages, no handicaps, no pinfall and no
 * won-lost record, and this model has NO FIELD IN WHICH TO PUT ONE.
 * That absence is deliberate and it is structural: a `LeagueTeam` cannot
 * carry a game result because the type does not have one, so no screen
 * downstream can render a season that did not happen.
 *
 * What a forming league does have is a FIELD OF SIXTEEN, and the field
 * fills up in a checkable order. Slots are claimed, rosters fill, a
 * deposit either exists or does not. That is a real ladder with a real
 * top, it changes as the season forms, and every figure in it is a count
 * of something a rep actually did. `standingsBasis` names it on the page
 * so that a reader can never mistake it for a scoreboard.
 *
 * ---------------------------------------------------------------
 * WHAT IS PUBLISHED AND WHAT IS THIS PROPOSAL'S OWN
 * ---------------------------------------------------------------
 *
 * Main Event publishes a real brand-wide league programme, Open Lane
 * Socials, at mainevent.com/the-leagues. It is recorded already, in
 * `data/requests.ts` as `OPEN_LANE_SOCIALS`, with its five published
 * facts and its five withheld ones. Brea is not named on it and neither
 * is any other California venue.
 *
 * So the two leagues in `data/leagues.ts` are a PROPOSAL for the opening
 * season, not an announcement, and every field on them is illustrative
 * except the play nights, which are the nights the brand-wide programme
 * actually runs. The price is the one figure that is neither: Main Event
 * publishes no league price anywhere, so it renders as the withheld
 * sentence and never as a number.
 *
 * ---------------------------------------------------------------
 * LEAGUE MONEY IS A LEDGER OF ITS OWN AND IT HAS NO TOTAL HERE
 * ---------------------------------------------------------------
 *
 * BookProvider carries booked event revenue and outbound activity and
 * never sums them. Promotional product money is a third thing. League
 * dues would be a fourth, and the safest possible way to keep it out of
 * the other three is the way this file takes: there is no money field on
 * any type below. What a league commits is LANE NIGHTS, which is a
 * quantity of inventory rather than a quantity of dollars, and that is
 * the number the board reports.
 */

// ---------------------------------------------------------------
// The structure
// ---------------------------------------------------------------

/**
 * Sixteen. The number the whole surface is built around.
 *
 * Sixteen is not decoration. A field of sixteen plays a complete round
 * robin in fifteen weeks, which leaves the sixteenth week free for a
 * position night, and that is what makes a sixteen week season close
 * cleanly rather than stopping halfway through a rotation. Every
 * schedule figure on the board is derived from this constant, so a
 * league run as a field of twelve would recompute rather than lie.
 */
export const FIELD_SIZE = 16;

/**
 * Lanes consumed by one match.
 *
 * A league match is bowled across a PAIR of lanes, with the two teams
 * alternating, which is ordinary league practice everywhere the sport is
 * played. It is stated here rather than assumed because it doubles the
 * headline number: a field of sixteen is eight matches, and eight
 * matches is sixteen lanes, not eight. Sixteen lanes against a published
 * floor of twenty six is most of the house, every week, on one night.
 *
 * That is the number a general manager wants before they want any other
 * number about a league, and getting it wrong by a factor of two would
 * be the difference between a good idea and a promise the building
 * cannot keep.
 */
export const LANES_PER_MATCH = 2;

/** Bowling positions, in the order a team actually bowls them. */
export type BowlingPosition =
  /** Bowls first. Sets the frame the rest of the team plays against. */
  | "lead-off"
  | "second"
  | "third"
  | "fourth"
  /** Bowls last, in the frame that decides the match. */
  | "anchor"
  /** Registered and rostered to cover an absence. */
  | "substitute";

export const POSITION_ORDER: BowlingPosition[] = [
  "lead-off",
  "second",
  "third",
  "fourth",
  "anchor",
  "substitute",
];

export const POSITION_LABEL: Record<BowlingPosition, string> = {
  "lead-off": "Lead off",
  second: "Second",
  third: "Third",
  fourth: "Fourth",
  anchor: "Anchor",
  substitute: "Substitute",
};

/**
 * How open a league is to new people, as a state rather than a boolean.
 *
 * A house that answers "are you taking sign ups" with yes or no gets the
 * answer wrong most of the time, because the two things a caller can be
 * are not the same thing. A whole team of five needs a SLOT. One bowler
 * on their own needs a SEAT on a team that is short, which a full field
 * can still have plenty of. A league can be shut to the first and wide
 * open to the second, and telling a solo bowler the league is full when
 * six teams are a body short loses a customer for no reason at all.
 */
export type LeagueOpenness =
  /** Slots left in the field of sixteen. A whole team can claim one. */
  | "welcoming-teams"
  /** Field full, rosters not. A bowler on their own gets placed. */
  | "welcoming-individuals"
  /** Neither. Recorded rather than hidden, and it names its own reason. */
  | "closed";

export const LEAGUE_OPENNESS: Record<LeagueOpenness, StatusToken> = {
  "welcoming-teams": {
    glyph: "◇",
    label: "Welcoming teams",
    cssVar: "var(--ok)",
    note: "Slots are still free in the field of sixteen, so a whole team can claim one and keep its own name.",
  },
  "welcoming-individuals": {
    glyph: "◈",
    label: "Welcoming individuals",
    cssVar: "var(--info)",
    note: "The field is full and the rosters are not. A bowler with no team gets placed into a team that is a body short.",
  },
  closed: {
    glyph: "✕",
    label: "Closed",
    cssVar: "var(--neutral)",
    note: "Neither a team nor an individual can join this season. The next season is the next door in.",
  },
};

export const LEAGUE_OPENNESS_ORDER: LeagueOpenness[] = [
  "welcoming-teams",
  "welcoming-individuals",
  "closed",
];

/**
 * What a slot in the field of sixteen is actually worth today.
 *
 * The middle value is the one that earns the type. A held slot is a slot
 * a team asked for under the pre-opening offer in `venue.ts`, which
 * holds a place without a deposit until Main Event publishes an opening
 * date. It is real enough to keep somebody else out and it is not
 * confirmed, and a board that painted it the same colour as a confirmed
 * slot would be overstating the field by however many holds it carries.
 */
export type SlotState =
  /** Team registered and its place is not conditional on anything. */
  | "confirmed"
  /** Place held under the pre-opening offer. No deposit, and it can lapse. */
  | "held"
  /** Nobody has claimed it. */
  | "free";

export const SLOT_STATE: Record<SlotState, StatusToken> = {
  confirmed: {
    glyph: "●",
    label: "Confirmed",
    cssVar: "var(--ok)",
    note: "Registered for the first season and not conditional on anything.",
  },
  held: {
    glyph: "◐",
    label: "Held",
    cssVar: "var(--warn)",
    note: "A place held without a deposit under the first fifty offer. It converts or releases when an opening date is published.",
  },
  free: {
    glyph: "○",
    label: "Free",
    cssVar: "var(--neutral)",
    note: "Nobody has claimed this slot. A team can take it and keep its own name.",
  },
};

export const SLOT_STATE_ORDER: SlotState[] = ["confirmed", "held", "free"];

/**
 * HOW A TEAM CAME TO EXIST. Three routes, three different products.
 *
 * This is not a label on a card. It is the single most useful field on
 * the whole league surface for a person who has to decide what to do on
 * Monday, because each route is a different piece of work and each one
 * has a different next move.
 *
 * A team the venue assembled out of individual sign ups is proof that the
 * venue can create a team from nothing, and it is the one that needs the
 * most support to survive its first season. A team a captain brought in
 * whole is five customers who arrived together and it costs the venue
 * almost nothing; the captain is the relationship and there is nobody
 * else to talk to. A team that came off an employer is a booking that
 * came off the prospecting board, and the organisation behind it can
 * usually field a second team, which is why the affiliation join in the
 * selectors is worth more than either booking on its own.
 */
export type TeamFormation =
  /** The venue formed the league and the public joined it one at a time. */
  | "venue-formed"
  /** A captain formed a team and brought a whole roster with them. */
  | "captain-formed"
  /** An organisation off the prospecting board formed a team. */
  | "organisation-formed";

export const TEAM_FORMATION: Record<TeamFormation, StatusToken> = {
  "venue-formed": {
    glyph: "◍",
    label: "Venue formed",
    cssVar: "var(--info)",
    note: "The house opened the league and put individual sign ups together into a team. Nobody arrived with four friends.",
  },
  "captain-formed": {
    glyph: "◆",
    label: "Captain formed",
    cssVar: "var(--ok)",
    note: "A captain brought a whole roster. Five customers who arrived together, and the captain is the relationship.",
  },
  "organisation-formed": {
    glyph: "▣",
    label: "Organisation formed",
    cssVar: "var(--accent)",
    note: "An employer off the prospecting board fielded a team, which usually means it can field a second one.",
  },
};

export const TEAM_FORMATION_ORDER: TeamFormation[] = [
  "venue-formed",
  "captain-formed",
  "organisation-formed",
];

/** Whether a team has the bodies it needs. Two states, both plain. */
export type RosterState = "full" | "short";

export const ROSTER_STATE: Record<RosterState, StatusToken> = {
  full: {
    glyph: "▰",
    label: "Full roster",
    cssVar: "var(--ok)",
    note: "Every position on this team is spoken for.",
  },
  short: {
    glyph: "▱",
    label: "Seats open",
    cssVar: "var(--warn)",
    note: "This team is a body short and will take an individual bowler.",
  },
};

// ---------------------------------------------------------------
// The league
// ---------------------------------------------------------------

/**
 * What a ladder is ranked ON, named so a reader cannot misread it.
 *
 * There is exactly one value today and that is the point of the type.
 * "form-up" means the table is ordered by how ready each team is to
 * play, because the doors are shut and nothing else exists to order it
 * by. The day a first season is bowled, a second value appears here and
 * every screen that renders a ladder stops compiling until somebody has
 * decided what it should say instead. That is the same constraint the
 * nine lanes use and it is here for the same reason.
 */
export type StandingsBasis = "form-up";

export interface League {
  id: string;
  /** The name on the shirt. Written to be enjoyed, owned by nobody. */
  name: string;
  /** One line of voice. It is allowed to be funny; it is not allowed to lie. */
  tagline: string;
  /** Which of the published brand-wide play nights this league takes. */
  night: "Tuesday" | "Wednesday" | "Thursday";
  /** Local time the first ball goes, as a plain label. */
  startTime: string;
  /** Who it is for, in one clause. */
  who: string;
  /** Teams in the field. Sixteen, and the schedule maths depends on it. */
  fieldSize: number;
  /** Weeks in the season, including the position night. */
  seasonWeeks: number;
  /** Bowlers per team. Main Event publishes no team size, so this is ours. */
  teamSize: number;
  /** Games bowled per night. Also ours; the brand publishes no format. */
  gamesPerNight: number;
  /** One line on how a mixed ability field is kept competitive. */
  handicapNote: string;
  openness: LeagueOpenness;
  /** Why it stands where it stands, in one line. */
  opennessNote: string;
  standingsBasis: StandingsBasis;
  /**
   * The organisation this league grew out of, where it grew out of one.
   *
   * A league that formed from an employer is a booking that came off the
   * prospecting board, and this is the field that says so. It is an id in
   * data/prospects.ts, and every action on this surface writes to the
   * organisation it names.
   */
  anchorProspectId: string;
  anchorBasis: string;
  provenance: Provenance;
}

/**
 * A team in a league, with a roster that contains no people.
 *
 * THIS APPLICATION HAS NEVER INVENTED A PERSON AND IT IS NOT STARTING ON
 * A ROSTER. A team here is a name, a count of bowlers, the POSITIONS
 * those bowlers fill, and the JOB TITLE of whoever captains it. That is
 * everything a house needs to run a league night and it names nobody.
 *
 * The captain is a title rather than a name for the same reason every
 * decision maker in `prospects.ts` is a title: a plausible invented name
 * on a screen next to a hundred and two real organisations is the single
 * fastest way to make a reader doubt the real rows too.
 */
export interface LeagueTeam {
  id: string;
  leagueId: string;
  name: string;
  /** Position in the field of sixteen, one to sixteen. */
  slot: number;
  /** A team occupies a slot that is confirmed or held. Never free. */
  slotState: Exclude<SlotState, "free">;
  /** Bowlers signed up. Never more than the league's team size. */
  bowlersCommitted: number;
  /** The positions those bowlers fill. No names, ever. */
  positionsFilled: BowlingPosition[];
  /** The captain's job, not the captain. A title, never a name. */
  captainRole: string;
  /**
   * Which of the three routes brought this team in.
   *
   * Required rather than optional, because a team that came from nowhere
   * in particular is not a thing that happens: somebody either walked in
   * with four friends, or was placed by the house, or came off an
   * employer. A team with `prospectId` set is always organisation formed
   * and the proof pass asserts it.
   */
  formation: TeamFormation;
  /** When the slot was claimed. Orders the ladder at the bottom. */
  claimedAt: string;
  /** An organisation in data/prospects.ts, where the team came off the board. */
  prospectId?: string;
  /** How this team relates to that organisation, in one clause. */
  affiliationBasis?: string;
  /** One line where the team is worth a sentence. */
  note?: string;
  provenance: Provenance;
}

// ---------------------------------------------------------------
// Derived shape
// ---------------------------------------------------------------

export interface SeasonShape {
  fieldSize: number;
  seasonWeeks: number;
  /** Matches bowled on one league night. Half the field. */
  matchesPerNight: number;
  /** Lanes the league occupies on its night. Two per match. */
  lanesPerNight: number;
  /** Weeks needed for every team to meet every other team once. */
  roundRobinWeeks: number;
  /**
   * Weeks left over after the round robin closes.
   *
   * Zero or one on a well chosen field. A negative number means the
   * season is too short to complete a rotation, which is a scheduling
   * error rather than a display problem, so callers get the real figure
   * rather than a clamped one.
   */
  positionNights: number;
  /** Lane nights the season commits. Lanes multiplied by weeks. */
  laneNights: number;
}

/**
 * The whole schedule, derived from two numbers.
 *
 * Nothing here is stored anywhere. Change the field size in the seed and
 * the round robin, the lane count and the lane nights all move together,
 * which is the property that makes this a model rather than a picture of
 * one.
 */
export function seasonShape(league: League): SeasonShape {
  const matchesPerNight = Math.floor(league.fieldSize / 2);
  const lanesPerNight = matchesPerNight * LANES_PER_MATCH;
  const roundRobinWeeks = league.fieldSize - 1;
  return {
    fieldSize: league.fieldSize,
    seasonWeeks: league.seasonWeeks,
    matchesPerNight,
    lanesPerNight,
    roundRobinWeeks,
    positionNights: league.seasonWeeks - roundRobinWeeks,
    laneNights: lanesPerNight * league.seasonWeeks,
  };
}

/** Seats still open on a team. Never negative, whatever the seed says. */
export function seatsOpen(team: LeagueTeam, league: League): number {
  return Math.max(0, league.teamSize - team.bowlersCommitted);
}

export function rosterStateOf(team: LeagueTeam, league: League): RosterState {
  return seatsOpen(team, league) === 0 ? "full" : "short";
}

/** Positions with nobody on them yet, in bowling order. */
export function positionsOpen(
  team: LeagueTeam,
  league: League,
): BowlingPosition[] {
  const filled = new Set(team.positionsFilled);
  return POSITION_ORDER.filter((p) => !filled.has(p)).slice(
    0,
    seatsOpen(team, league),
  );
}

/**
 * The four things a person can want from this surface.
 *
 * They are a type rather than four loose button handlers because each
 * one carries a different sentence into the compose window and each one
 * is a different commercial event. An enquiry is a question. A join
 * request is one bowler. A team registration is five bowlers and a slot.
 * A proposal is a league that does not exist yet, which is the only one
 * of the four that can change what the building sells.
 */
export type LeagueAction =
  | "enquire"
  | "join-as-individual"
  | "register-team"
  | "propose-league";

export interface LeagueActionMeta {
  glyph: string;
  label: string;
  /** What the action does, in one clause. Never how to use the control. */
  what: string;
}

export const LEAGUE_ACTION: Record<LeagueAction, LeagueActionMeta> = {
  enquire: {
    glyph: "?",
    label: "Enquire",
    what: "Night, format and what a season involves.",
  },
  "join-as-individual": {
    glyph: "◈",
    label: "Join as an individual",
    what: "One bowler, placed on a team that is a body short.",
  },
  "register-team": {
    glyph: "◇",
    label: "Register a team",
    what: "A whole team claims a slot and keeps its own name.",
  },
  "propose-league": {
    glyph: "✦",
    label: "Propose a league",
    what: "A night that is not running yet, put to the house.",
  },
};

export const LEAGUE_ACTION_ORDER: LeagueAction[] = [
  "enquire",
  "join-as-individual",
  "register-team",
  "propose-league",
];

/** Dates as the rest of the application writes them. */
export function formatLeagueDate(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
