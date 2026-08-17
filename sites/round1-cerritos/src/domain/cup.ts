import type { BowlingPosition } from "@/domain/leagues";
import type { Provenance } from "@/domain/types";
import type { StatusToken } from "@/domain/vocabulary";

/**
 * THE CUP. ONE PER QUARTER, AND THE ONE RUNNING NOW HAS NOT HAPPENED.
 *
 * A league is the recurring product. A cup is the reason to care about it
 * in week nine. `domain/leagues.ts` models sixteen teams claiming the
 * same pair of lanes for sixteen weeks; this file models what those teams
 * bowl for over six of those weeks, four times a year.
 *
 * ---------------------------------------------------------------
 * THE ONE INSIGHT THE WHOLE FORMAT RESTS ON
 * ---------------------------------------------------------------
 *
 * A bowling bracket is side action riding on games you were bowling
 * anyway. A bowler who loses their bracket does not go home; they were
 * already booked to bowl three games and the bracket only decided what
 * those games were worth. That is the difference between bowling and
 * every other sport a bracket product is built for, and it is why single
 * elimination is the wrong answer here even though it is what the word
 * cup means to most people.
 *
 * So the Cup is a LAYER OVER A FIXED WEEKLY COMMITMENT. Sixteen teams
 * take the same slot on the same night for six weeks. Losing changes
 * which competition tonight's pins count towards, never whether the team
 * turns up. There is no night on which a registered team has nothing to
 * bowl, and sixteen lanes are occupied on all six nights including the
 * finals. Single elimination would empty ten of those lanes by night four
 * and finish with two teams on a single pair while the rest of the floor
 * stands idle.
 *
 * ---------------------------------------------------------------
 * NOBODY HAS BOWLED A COMPETITIVE FRAME AND THE TYPES SAY SO
 * ---------------------------------------------------------------
 *
 * This cup has never been run, so there is no average, no handicap and
 * no won lost record anywhere in this application, and
 * `LeagueTeam` deliberately has no field that could hold one. That
 * property is preserved here: nothing in `domain/leagues.ts` gained a
 * result field for this wave.
 *
 * What this file adds instead is TWO SEPARATE THINGS that are never
 * confused for each other in the type system.
 *
 *   1. `NotYetEstablished`. A real state, not a nullable number and not a
 *      zero. It carries games bowled against the threshold at which a
 *      figure becomes real, so a screen renders "not yet established, 0 of
 *      21 games" rather than a blank or a fake 0.00. This is not a
 *      workaround. It is what the United States Bowling Congress itself
 *      does with a bowler who has no prior average: the average is
 *      established over the first sessions and re-rated, and assigned flat
 *      averages are described in its own guidance as inaccurate.
 *
 *   2. `ExhibitionResult` and `BowlerExhibition`. Figures from the
 *      DECLARED EXHIBITION, which is a simulated run of the format
 *      generated so that the bracket, the advancement and the matchup
 *      build up can be judged in use. Every one of these types carries
 *      `label: EXHIBITION_LABEL` and `provenance: "illustrative"` as
 *      required fields, so the word travels with the number and a screen
 *      cannot render the figure without also having the label in hand.
 *
 * A union of the two is the only way to reach a figure, so no downstream
 * screen can render a fake average by accident. It has to narrow on
 * `kind` first, and the narrowing is where the label comes from.
 *
 * ---------------------------------------------------------------
 * MONEY
 * ---------------------------------------------------------------
 *
 * Round1 publishes no league price and no cup price, and the withheld
 * block in `data/leagues.ts` stands untouched. A registration fee appears
 * here only as THIS APPLICATION'S OWN PROPOSAL, badged illustrative, and
 * it is never presented as a Round1 price. It is also not added to
 * the booked revenue ledger, the outbound activity ledger or the
 * promotional product ledger. Those three are never summed and a fourth
 * number would not make that better. What the Cup commits is LANE NIGHTS,
 * which is inventory rather than dollars, in the same unit a league
 * season already reports.
 */

// ---------------------------------------------------------------
// Constants the whole format is derived from
// ---------------------------------------------------------------

/**
 * Six nights. Two to earn a seed, three of bracket, one finals night.
 *
 * Six is not a round number chosen for looks. Two seeding nights exist
 * because the building has not opened and there is therefore nothing to
 * seed a bracket from; a draw would be a lottery and a lottery makes the
 * first round meaningless. Two nights of Swiss paired match play produce
 * a real seed one to sixteen out of record and pins per game, and they
 * put every team on the lanes twice before anybody can lose anything.
 * After night two the cup has the history it did not have on night one.
 */
export const CUP_NIGHTS = 6;

/**
 * Ten frames to a Baker game, whoever is standing on the approach.
 *
 * In a Baker game the five bowlers share one ten frame game between them:
 * the first bowler takes frames one and six, the second takes two and
 * seven, and so on to the anchor taking five and ten. It was invented in
 * the nineteen fifties for spectators and it is what makes eight
 * simultaneous cup matches fit inside one evening slot. A best of five
 * Baker match is at most a hundred frames on a pair of lanes against
 * three hundred for a standard three game league night.
 */
export const BAKER_FRAMES_PER_GAME = 10;

/** Frames one bowler takes in a Baker game. Two of the ten, always. */
export const BAKER_FRAMES_PER_BOWLER = 2;

/** Baker games to win a seeding, bracket or plate match. */
export const BEST_OF_EARLY = 5;

/** Baker games to win a semi final, a plate final or a stepladder rung. */
export const BEST_OF_LATE = 7;

/**
 * Games before an average is an average, and the number is printed.
 *
 * Twenty one is the United States Bowling Congress benchmark for a usable
 * prior average and it is the figure a tournament uses when it asks what
 * somebody bowls. It is quoted rather than invented, and every screen
 * that shows a not yet established figure shows this denominator next to
 * it so a reader can see how far off it is.
 *
 * Note what it means here: a Baker cup does not establish one. Five
 * bowlers sharing one game produces a team score, not a personal one, so
 * cup frames count towards nothing on this counter. The counter moves
 * when the leagues start bowling.
 */
export const ESTABLISHED_AVERAGE_GAMES = 21;

/**
 * Handicap, declared as a rule rather than computed as a number.
 *
 * Handicap is (basis minus average) times a percentage factor. Ninety per
 * cent of two hundred and ten is the balanced adult default, sitting
 * between the hundred per cent of two hundred used for beginner leagues
 * and the eighty per cent of two hundred and twenty used where the field
 * is competitive. The basis has to exceed the highest average in the
 * field, which is another reason it cannot be fixed until averages exist.
 *
 * These two numbers are a STATED RULE for when there is something to
 * compute from. They are not a handicap and no screen renders one.
 */
export const HANDICAP_BASIS = 210;
export const HANDICAP_FACTOR_PCT = 90;

/**
 * An upset, defined before it is counted.
 *
 * The NCAA defines an upset as a win by a team seeded five or more lines
 * below its opponent. Borrowing the definition rather than inventing one
 * means the count on the screen has a stated rule behind it, which is the
 * whole difference between a countable fact and a piece of commentary.
 * The definition is printed wherever the count appears.
 */
export const UPSET_SEED_GAP = 5;

/**
 * The word that travels with every simulated number.
 *
 * Typed as a literal and required on every exhibition figure, so a figure
 * cannot be constructed without it and cannot be rendered without the
 * caller having it in hand. That is a stronger guarantee than a comment
 * asking screens to remember.
 */
export const EXHIBITION_LABEL = "Simulated exhibition" as const;
export type ExhibitionLabel = typeof EXHIBITION_LABEL;

/** The sentence that sits next to the label the first time it appears. */
export const EXHIBITION_NOTE =
  "Every score in this cup is generated. Nobody has bowled a frame in this building and no result here is a claim that they have.";

/** The sentence that sits next to a roster. Said once, and it is true. */
export const HANDLE_NOTE =
  "Bowlers appear as handles. A handle is what a bowler is called on the lanes and it is not a person's name.";

// ---------------------------------------------------------------
// Match state. Six of them, and three would be wrong.
// ---------------------------------------------------------------

/**
 * What is true about one fixture tonight.
 *
 * The bracket platforms expose three states, pending, running and
 * completed, and three is right for an event that runs in a single
 * afternoon. It is wrong for a cup whose fixtures are a week apart,
 * because it collapses the two states that matter most on a board a
 * salesperson reads on a Monday.
 *
 * "Awaiting opponent" is most of the bracket for most of the cup and it
 * is the thing a path to the final is made of. "Scheduled" is the
 * promotable object: both teams known, a date, a lane pair, and something
 * to put on a card. Merging them into "pending" throws away the one
 * distinction that tells a rep which fixture is worth ringing somebody
 * about.
 *
 * The glyphs are A FILLING SQUARE, in the same spirit as the filling
 * circle that carries pitch status: empty, half, on, solid. A fixture
 * gets more real from left to right and the shape says so before the
 * colour does. The two states that are not a stage of that progression,
 * a bye and a withdrawal, get the two glyphs that are not squares.
 */
export type MatchState =
  /** The node exists and one or both sides are not known yet. */
  | "awaiting-opponent"
  /** Both teams known, date and lane pair fixed. The promotable object. */
  | "scheduled"
  /** Being bowled now. */
  | "live"
  /** Result recorded, and the advancement with it. */
  | "final"
  /** Resolves without pins. A node in the tree, not an absence from it. */
  | "bye"
  /** A team did not appear. Real in a league, and it is not a loss. */
  | "withdrawn";

export const MATCH_STATE: Record<MatchState, StatusToken> = {
  "awaiting-opponent": {
    glyph: "□",
    label: "Awaiting opponent",
    cssVar: "var(--neutral)",
    note: "The fixture exists and at least one side is still being bowled for. This is what a path to the final is made of.",
  },
  scheduled: {
    glyph: "◧",
    label: "Scheduled",
    cssVar: "var(--info)",
    note: "Both teams known, date set and the lane pair fixed. This is the fixture worth promoting.",
  },
  live: {
    glyph: "◉",
    label: "Live",
    cssVar: "var(--warn)",
    note: "Being bowled right now. The figure on it moves until the last frame.",
  },
  final: {
    glyph: "■",
    label: "Final",
    cssVar: "var(--ok)",
    note: "Bowled and settled. The result carries the advancement with it.",
  },
  bye: {
    glyph: "◊",
    label: "Bye",
    cssVar: "var(--neutral)",
    note: "Resolves without pins. A bye is a fixture that was won by not needing to be bowled, not a night off the schedule.",
  },
  withdrawn: {
    glyph: "✕",
    label: "Withdrawn",
    cssVar: "var(--risk)",
    note: "A team did not appear. Recorded as its own thing, because a withdrawal is not a defeat and must not be drawn as one.",
  },
};

export const MATCH_STATE_ORDER: MatchState[] = [
  "live",
  "scheduled",
  "awaiting-opponent",
  "final",
  "bye",
  "withdrawn",
];

/** States in which a fixture has two known teams and a real result. */
export const SETTLED_STATES: MatchState[] = ["final"];

// ---------------------------------------------------------------
// The branches of the tournament
// ---------------------------------------------------------------

/**
 * Which competition a fixture belongs to.
 *
 * The Plate is the piece that fixes the tail of the cup, and the name is
 * doing work. It is not a consolation bracket and it is not promoted as
 * one: it is a competition with its own trophy, its own final and its own
 * winner, bowled on the same nights and the same lanes as the Cup. Two
 * trophies and two celebrations, rather than one trophy and fourteen
 * teams who lost.
 */
export type CupBranch =
  /** Nights one and two. Nobody can be knocked out of anything yet. */
  | "seeding"
  /** The main bracket, from the round of sixteen to the stepladder. */
  | "cup"
  /** The second competition, for teams beaten out of the Cup. */
  | "plate"
  /** One fixture that puts a beaten team back into the Cup. */
  | "wildcard"
  /** Pins banked by teams out of both brackets. Still a reason to bowl. */
  | "long-game"
  /** Finals night. Three rungs on one pair, everybody else watching. */
  | "stepladder"
  /** Finals night. A handicap squad event for the rest of the field. */
  | "sweeper";

export const CUP_BRANCH: Record<CupBranch, StatusToken> = {
  seeding: {
    glyph: "◍",
    label: "Seeding",
    cssVar: "var(--info)",
    note: "Two nights of Swiss paired match play that turn sixteen unranked teams into seeds one to sixteen.",
  },
  cup: {
    glyph: "★",
    label: "Cup",
    cssVar: "var(--ok)",
    note: "The main bracket. A first loss moves a team into the Plate rather than out of the building.",
  },
  plate: {
    glyph: "✧",
    label: "Plate",
    cssVar: "var(--accent)",
    note: "The second competition, with its own final and its own trophy. Beaten out of the Cup is not out of the cup.",
  },
  wildcard: {
    glyph: "✦",
    label: "Wildcard",
    cssVar: "var(--warn)",
    note: "One fixture on night five that returns a beaten team to the Cup, on the last rung of the stepladder.",
  },
  "long-game": {
    glyph: "◈",
    label: "The Long Game",
    cssVar: "var(--neutral)",
    note: "Teams out of both brackets, bowling for banked pinfall that seeds the finals night sweeper.",
  },
  stepladder: {
    glyph: "▲",
    label: "Stepladder",
    cssVar: "var(--ok)",
    note: "Three matches on one pair, each bigger than the last. The top seed bowls once, last, for the Cup.",
  },
  sweeper: {
    glyph: "▦",
    label: "Sweeper",
    cssVar: "var(--info)",
    note: "A handicap squad event on finals night for every team not in the stepladder or the Plate final.",
  },
};

export const CUP_BRANCH_ORDER: CupBranch[] = [
  "seeding",
  "cup",
  "plate",
  "wildcard",
  "long-game",
  "stepladder",
  "sweeper",
];

// ---------------------------------------------------------------
// Where a team on an unresolved side comes from
// ---------------------------------------------------------------

/**
 * The rule that will fill an empty side, printed rather than implied.
 *
 * A bracket that draws a line and leaves the reader to work out what the
 * line means is the failure mode the whole cup surface is trying to
 * avoid. Every unresolved side names the fixtures it comes out of and the
 * rule that picks between them, in a sentence a captain can read.
 */
export type SourceTake =
  /** The winner of one fixture. */
  | "winner"
  /** The loser of one fixture. */
  | "loser"
  /** Of two fixtures, the winner carrying the lower seed number. */
  | "higher-seed-winner"
  /** Of two fixtures, the other winner. */
  | "lower-seed-winner"
  /** Of two fixtures, the loser carrying the lower seed number. */
  | "higher-seed-loser";

export interface CupSource {
  /** One fixture for a winner or a loser, two where a rule picks between them. */
  fixtureIds: string[];
  take: SourceTake;
  /** The rule in one line, printed next to the empty slot. */
  rule: string;
}

/** Where a result sends a team. An edge in the advancement graph. */
export interface CupAdvance {
  fixtureId: string;
  /** Which of the destination's two sides this fills. */
  slot: 0 | 1;
}

// ---------------------------------------------------------------
// Figures that do not exist yet, and figures that are simulated
// ---------------------------------------------------------------

/**
 * A figure that has not been earned, as a state rather than an absence.
 *
 * This is the type that stops a screen inventing an average. It is not
 * `number | null`, because a nullable number invites a `?? 0` somewhere
 * downstream and a zero average on a profile is a lie with a decimal
 * point in it. It carries its own denominator so the screen can say how
 * far off the figure is instead of just saying it is missing.
 */
export interface NotYetEstablished {
  kind: "not-established";
  /** Games bowled towards the threshold. Honestly zero today. */
  gamesBowled: number;
  /** The threshold, printed next to the state wherever it appears. */
  gamesRequired: number;
  /** Why it is not established, in one clause. */
  because: string;
}

/** A figure that has been earned. No seed row can carry one yet. */
export interface EstablishedAverage {
  kind: "established";
  average: number;
  gamesBowled: number;
}

/**
 * A bowler's competitive average.
 *
 * The union is the guarantee. A caller has to narrow on `kind` before it
 * can reach a number, and the day the leagues bowl their first night the
 * second arm starts appearing in the seed with no screen needing to be
 * told.
 */
export type BowlerAverage = NotYetEstablished | EstablishedAverage;

/** The same shape for a team. Same reason, same guarantee. */
export type TeamAverage = NotYetEstablished | EstablishedAverage;

/**
 * A result from the declared exhibition.
 *
 * `label` and `provenance` are required rather than optional, so a
 * simulated score cannot be constructed without its own label attached.
 * A screen that renders `result.pinfall` has `result.label` in the same
 * object and no excuse.
 *
 * Pinfall is carried alongside games won for a reason that is pure
 * bowling. Peterson points award points for pins whether a team wins or
 * loses, so that the gap between the good teams and the rest does not
 * become a canyon by week three, and professional match play does the
 * same thing with bonus pins added to total pinfall. A team that lost
 * tonight has still banked something visible, and pins per game is what
 * seeds the bracket after the two seeding nights.
 */
export interface ExhibitionResult {
  /** Baker games won, in fixture side order. */
  gamesWon: [number, number];
  /** Pins felled across the whole match, in side order. */
  pinfall: [number, number];
  /** Highest single Baker game in the match, in side order. */
  highGame: [number, number];
  label: ExhibitionLabel;
  provenance: "illustrative";
}

/**
 * One bowler's simulated cup figures, stored as two raw counts.
 *
 * EVERYTHING ELSE IS DERIVED, and that is deliberate to the point of
 * being the reason this type is so small. Frames bowled is two per Baker
 * game the team bowled, so it comes out of the fixtures rather than being
 * typed here and drifting. Spare chances are the frames that were not
 * struck. Open frames are the spare chances that were not converted. A
 * strike rate is strikes over first balls with the definition printed,
 * because "strike percentage" means share of first balls to some people
 * and share of pocket hits to others and the two are different numbers
 * with the same name.
 *
 * There is no individual pinfall here and no individual average, and that
 * is not an omission. In a Baker game five bowlers share one ten frame
 * game, so the score belongs to the team and splitting it five ways would
 * be a number nobody bowled. Frames, strikes and spares are the three
 * things that are genuinely an individual's, and all three are counts of
 * something that happened.
 */
export interface BowlerExhibition {
  /** Frames the first ball took all ten pins down. */
  strikes: number;
  /** Frames the remaining pins were cleared with the second ball. */
  sparesConverted: number;
  label: ExhibitionLabel;
  provenance: "illustrative";
}

// ---------------------------------------------------------------
// Ball preferences
// ---------------------------------------------------------------

/** Which way the ball is thrown. Also useful for lane assignment. */
export type BowlingHand = "right" | "left" | "two-handed";

/** The real dividing line in a league, and everybody knows their answer. */
export type BallOwnership = "own-ball" | "house-ball";

/** The shell, in plain language, in order of how much it grips the lane. */
export type Coverstock = "plastic" | "urethane" | "reactive" | "not-sure";

/** Shiny or dull, which is the question a league bowler can answer. */
export type BallSurface = "shiny" | "dull" | "not-sure";

/** The weight block inside. Serious bowlers only, and optional. */
export type BallCore = "symmetric" | "asymmetric" | "not-sure";

export const HAND_LABEL: Record<BowlingHand, string> = {
  right: "Right handed",
  left: "Left handed",
  "two-handed": "Two handed",
};

export const OWNERSHIP_LABEL: Record<BallOwnership, StatusToken> = {
  "own-ball": {
    glyph: "●",
    label: "Own ball",
    cssVar: "var(--ok)",
    note: "Brings their own ball, which is the line between a bowler and somebody who bowls.",
  },
  "house-ball": {
    glyph: "○",
    label: "House ball",
    cssVar: "var(--neutral)",
    note: "Picks one off the rack. Most of a first season field, and nothing wrong with it.",
  },
};

export const COVERSTOCK_LABEL: Record<Coverstock, StatusToken> = {
  plastic: {
    glyph: "◌",
    label: "Plastic",
    cssVar: "var(--neutral)",
    note: "Goes very straight with almost no hook. What a spare ball is, and what most first balls should be.",
  },
  urethane: {
    glyph: "◑",
    label: "Urethane",
    cssVar: "var(--info)",
    note: "Grips early and smoothly. Less snap at the back end and far more predictable.",
  },
  reactive: {
    glyph: "◕",
    label: "Reactive",
    cssVar: "var(--ok)",
    note: "The modern shell. Skids through the front of the lane and turns hard at the back.",
  },
  "not-sure": {
    glyph: "?",
    label: "Not sure",
    cssVar: "var(--neutral)",
    note: "A perfectly normal answer and the enrollment form treats it as one.",
  },
};

export const SURFACE_LABEL: Record<BallSurface, StatusToken> = {
  shiny: {
    glyph: "◇",
    label: "Shiny",
    cssVar: "var(--info)",
    note: "Polished. Skids longer through the oil and turns later.",
  },
  dull: {
    glyph: "◆",
    label: "Dull",
    cssVar: "var(--warn)",
    note: "Sanded. Bites into the oil earlier, which is what heavy lanes want.",
  },
  "not-sure": {
    glyph: "?",
    label: "Not sure",
    cssVar: "var(--neutral)",
    note: "Most of a league field. Up to seventy per cent of how much a ball hooks comes from this and hardly anybody is asked.",
  },
};

export const CORE_LABEL: Record<BallCore, string> = {
  symmetric: "Symmetric",
  asymmetric: "Asymmetric",
  "not-sure": "Not sure",
};

/**
 * What a bowler brings, in the words a casual league bowler would use.
 *
 * THIS IS A DESCRIPTION OF EQUIPMENT AND NEVER OF A BODY. The boxing tale
 * of the tape that the rest of this surface borrows from is built on
 * height, reach and weigh in weight, and not one of those crosses over.
 * A family entertainment centre selling league nights to schools, church
 * groups and office teams cannot put a customer's body measurement on a
 * screen, as a joke or otherwise. Ball weight is the substitute and it is
 * a better field anyway, because "I throw a fourteen" is a thing somebody
 * says about themselves without being asked.
 *
 * The optional fields are optional on purpose. Asking a first timer for a
 * drilling layout signals that the league is for serious bowlers, which
 * is the single easiest way to make a room feel unwelcoming, so the
 * layout is not a field at all.
 */
export interface BallPreferences {
  hand: BowlingHand;
  ownership: BallOwnership;
  /** Pounds. Sixteen is the sanctioned maximum and there is no minimum. */
  weightLb?: number;
  /** Whether they carry a plastic ball for corner pins. One question, and it says a lot. */
  carriesSpareBall: boolean;
  /** What they call it. The field people enjoy most and the cheapest one here. */
  nickname?: string;
  coverstock?: Coverstock;
  surface?: BallSurface;
  /** Advanced. Lower grit hooks earlier, which surprises everybody. */
  gritNumber?: number;
  /** Advanced. */
  core?: BallCore;
}

// ---------------------------------------------------------------
// The bowler
// ---------------------------------------------------------------

/**
 * A bowler, as a handle and a position.
 *
 * THIS APPLICATION HAS NEVER INVENTED A PERSON AND A ROSTER IS NOT WHERE
 * IT STARTS. Every organisation on the prospecting board is real, every
 * contact on it is a role and a title, and twenty five organisations were
 * excluded rather than guessed at. A plausible invented name sitting next
 * to two hundred and eleven verified organisations is the fastest way to
 * make a reader doubt the verified ones.
 *
 * A handle is not that. Bowling leagues, darts leagues, pool leagues and
 * every fantasy sport on earth run on handles, and nobody reads "Gutter
 * Therapy" and believes a specific human is being described. It is also
 * the better field: an arcade register wants a handle far more than it
 * wants an initial and a surname.
 *
 * So there is no name field on this type, no first name, no surname and
 * no initials, and there is nowhere to put one. The disclosure is one
 * line, `HANDLE_NOTE`, said once where a roster first appears.
 */
export interface Bowler {
  /** The handle. Unique across the register, and it is not a name. */
  handle: string;
  /** The team in data/leagues.ts this bowler is rostered on. */
  teamId: string;
  position: BowlingPosition;
  /** Exactly one bowler per team carries this. */
  isCaptain: boolean;
  /** When they joined the roster. */
  joinedAt: string;
  ball: BallPreferences;
  /** Why they are here, in their own words. Optional, and it converts. */
  whyHere?: string;
  /** A walk up line. One short free text field and it costs nothing. */
  walkUp?: string;
  /**
   * The competitive average, which cannot exist yet.
   *
   * Always the not established arm today. Typed as the union so that the
   * day a league night is bowled, the seed gains the other arm and every
   * screen already narrows correctly rather than needing to be found.
   */
  average: BowlerAverage;
  /** Simulated cup figures, or null for a bowler not in the cup field. */
  exhibition: BowlerExhibition | null;
  provenance: Provenance;
}

/**
 * A stable id for a handle, derived rather than stored.
 *
 * Storing a slug next to the handle would be storing the same fact twice
 * and inviting the two to disagree the first time somebody edits one of
 * them. The handle is the fact; the route segment is a function of it.
 */
export function bowlerSlug(handle: string): string {
  return handle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------------------------------------------------------------
// The cup itself
// ---------------------------------------------------------------

export type CupQuarter = "Q1" | "Q2" | "Q3" | "Q4";

/**
 * Where a cup stands, and the first value is the one that needs care.
 *
 * "exhibition" is the cup running now, and it is a declared exhibition:
 * a simulated run of the format generated so the bracket, the
 * advancement and the matchup build up can be judged in use before a
 * single lane exists. Nothing about it is hidden and nothing about it is
 * in a footnote.
 *
 * "enrolling" is real product presented as real product. Enrolling a
 * team is a thing a person can genuinely do before a building opens, and
 * it is the whole premise of this application.
 */
export type CupState =
  /** Running now, simulated, and labelled as such everywhere. */
  | "exhibition"
  /** Taking enrollment now. Real product, real deadline. */
  | "enrolling"
  /** On the calendar, not yet open. */
  | "scheduled";

export const CUP_STATE: Record<CupState, StatusToken> = {
  exhibition: {
    glyph: "◍",
    label: "Declared exhibition",
    cssVar: "var(--warn)",
    note: "A simulated run of the format. Every score in it is generated and labelled, because the building has not opened.",
  },
  enrolling: {
    glyph: "◇",
    label: "Enrolling",
    cssVar: "var(--ok)",
    note: "Taking teams now. The field is sixteen and the deadline is a real date that really closes.",
  },
  scheduled: {
    glyph: "○",
    label: "On the calendar",
    cssVar: "var(--neutral)",
    note: "Dated and not yet open. Enrollment opens when the cup before it finishes.",
  },
};

export const CUP_STATE_ORDER: CupState[] = [
  "exhibition",
  "enrolling",
  "scheduled",
];

export interface Cup {
  id: string;
  /** The name on the trophy. */
  name: string;
  quarter: CupQuarter;
  year: number;
  state: CupState;
  /** One line of voice. Allowed to be enjoyed, not allowed to lie. */
  strapline: string;
  /** The format in one paragraph, for a captain who wants the rules. */
  formatSummary: string;
  /** Teams in the field. Sixteen, and every schedule figure follows it. */
  fieldSize: number;
  /** Bowlers per team. Five, which is what makes Baker Baker. */
  teamSize: number;
  /** The play night. Wednesday is the one night neither league takes. */
  night: "Tuesday" | "Wednesday" | "Thursday";
  /** Local time the first ball goes, as a plain label. */
  startTime: string;
  /** Every cup night in order, six of them. */
  nightDates: string[];
  handicapBasis: number;
  handicapFactorPct: number;
  handicapNote: string;
  /**
   * The fee this application proposes, in dollars, for a team of five.
   *
   * ILLUSTRATIVE, ALWAYS, AND NEVER A ROUND1 PRICE. Round1 publishes no
   * dollar amount for a league anywhere, and neither Lucky Strike
   * Entertainment nor Main Event does either; all three route the
   * question to a person. That makes the missing figure a category habit
   * rather than a gap in the research, so this number is this
   * application's own, invented for the prototype, and it is not a claim
   * about how Round1 operates.
   *
   * It is also not added to any ledger on this board. Booked revenue and
   * outbound activity are never summed, promotional product money is a
   * third thing, and a cup fee is not going to become a fourth number
   * that quietly joins one of them.
   */
  registrationFee: number;
  registrationFeeProvenance: "illustrative";
  registrationFeeNote: string;
  /** Enrollment window, where the cup has one. Real dates that close. */
  enrollmentOpensAt?: string;
  enrollmentClosesAt?: string;
  /** One line where the cup is worth a sentence. */
  note?: string;
  provenance: Provenance;
}

/**
 * A team's place in a cup field.
 *
 * The cup keeps no second roster. It points at a team in
 * `data/leagues.ts` and reads that team's bowlers, so a bowler who joins
 * a roster appears in the cup with nobody editing a second file.
 */
export interface CupEntry {
  cupId: string;
  teamId: string;
  /** Order of entry into the field, one to sixteen. Not the seed. */
  entryNumber: number;
  /** Registered outright, or holding a place under a standing offer. */
  state: "confirmed" | "held";
  enrolledAt: string;
  provenance: Provenance;
}

// ---------------------------------------------------------------
// Rounds and fixtures
// ---------------------------------------------------------------

export interface CupRound {
  id: string;
  cupId: string;
  /** One to six. */
  night: number;
  branch: CupBranch;
  /** Round index inside its branch, starting at one. */
  depth: number;
  name: string;
  /** What is bowled and who is in it, in one line. */
  what: string;
  /** A round of matches, or a squad all bowling at once for a prize fund. */
  kind: "head-to-head" | "squad";
  /** Baker games to win. Absent on a squad round. */
  bestOf?: number;
  /**
   * Matches bowled one after another on a single pair.
   *
   * True only for the stepladder, and it is the whole point of a
   * stepladder: three matches, one pair, everyone else watching, each one
   * bigger than the last, and the top seed bowling once and last.
   */
  sequential?: boolean;
  /** Squad rounds only. Lanes the squad spreads across. */
  squadLanes?: number;
  /** Squad rounds only. Teams in the squad. */
  squadTeams?: number;
  /** How a team gets into a squad round, printed rather than implied. */
  squadEntry?: string;
  date: string;
  provenance: Provenance;
}

/** One side of a fixture. Either a team, or the rule that will fill it. */
export interface CupSide {
  /** Null until the fixture that feeds this side has been bowled. */
  teamId: string | null;
  /** Where the team comes from, where it is not known yet. */
  source?: CupSource;
}

export interface CupFixture {
  id: string;
  cupId: string;
  roundId: string;
  /** Order on the night, so a card can be read top to bottom. */
  number: number;
  state: MatchState;
  /** The pair of lanes. A match is bowled across two, teams alternating. */
  lanes: [number, number];
  sides: [CupSide, CupSide];
  /** Where the winner goes. Absent where the fixture ends a competition. */
  winnerTo?: CupAdvance;
  /** Where the loser goes. Absent where a loss ends the run. */
  loserTo?: CupAdvance;
  /** Present only on a settled fixture, and it carries its own label. */
  result?: ExhibitionResult;
  /** One line where the fixture is worth a sentence. */
  note?: string;
  provenance: Provenance;
}

// ---------------------------------------------------------------
// Derived shape. Nothing below is stored anywhere.
// ---------------------------------------------------------------

export interface CupShape {
  fieldSize: number;
  teamSize: number;
  nights: number;
  /** Bowlers in the building on a cup night. */
  bowlers: number;
  /** Head to head matches across the whole cup. */
  matches: number;
  /** Lanes the cup occupies on its busiest night. */
  peakLanes: number;
  /** Lanes multiplied by nights. Inventory, never money. */
  laneNights: number;
  /** Baker frames one bowler takes in a best of five match, at most. */
  maxFramesPerBowlerEarly: number;
  /** The same for a best of seven. */
  maxFramesPerBowlerLate: number;
}

/**
 * Lanes one round occupies.
 *
 * Not simply matches times two, and the two exceptions are the reason
 * this is a function rather than a stored number. A stepladder bowls its
 * three matches one after another on one pair, so it occupies two lanes
 * and not six. A sweeper is a squad rather than a set of pairings, so it
 * declares the lanes it spreads across. Getting this wrong in either
 * direction would misstate what the cup asks of the building on its
 * biggest night, which is the one figure a general manager checks.
 */
export function roundLanes(round: CupRound, fixtureCount: number): number {
  if (round.kind === "squad") return round.squadLanes ?? 0;
  if (round.sequential) return LANES_PER_CUP_MATCH;
  return fixtureCount * LANES_PER_CUP_MATCH;
}

/**
 * Lanes one cup match consumes.
 *
 * A match is bowled across a PAIR of lanes with the two teams
 * alternating, which is ordinary league practice everywhere the sport is
 * played. Eight matches is sixteen lanes and not eight, and getting that
 * wrong by a factor of two is the difference between a good idea and a
 * promise the building cannot keep. It is stated here rather than
 * imported so that the cup arithmetic is legible on its own, and it is
 * the same two as `LANES_PER_MATCH` in `domain/leagues.ts`.
 */
export const LANES_PER_CUP_MATCH = 2;

/**
 * The whole format, derived from the field size and the round list.
 *
 * Nothing here is stored. Change the field to twelve in the seed and the
 * match count, the lane count and the lane nights all move together,
 * which is the property that makes this a model rather than a picture of
 * one.
 */
export function cupShape(
  cup: Cup,
  rounds: CupRound[],
  fixtureCountByRound: Record<string, number>,
): CupShape {
  let matches = 0;
  const lanesByNight = new Map<number, number>();
  for (const round of rounds) {
    const count = fixtureCountByRound[round.id] ?? 0;
    matches += count;
    lanesByNight.set(
      round.night,
      (lanesByNight.get(round.night) ?? 0) + roundLanes(round, count),
    );
  }
  let laneNights = 0;
  let peakLanes = 0;
  for (const lanes of lanesByNight.values()) {
    laneNights += lanes;
    peakLanes = Math.max(peakLanes, lanes);
  }
  return {
    fieldSize: cup.fieldSize,
    teamSize: cup.teamSize,
    nights: cup.nightDates.length,
    bowlers: cup.fieldSize * cup.teamSize,
    matches,
    peakLanes,
    laneNights,
    maxFramesPerBowlerEarly: BEST_OF_EARLY * BAKER_FRAMES_PER_BOWLER,
    maxFramesPerBowlerLate: BEST_OF_LATE * BAKER_FRAMES_PER_BOWLER,
  };
}

/**
 * Games needed to win a match of this length. Best of five is three.
 */
export function gamesToWin(bestOf: number): number {
  return Math.floor(bestOf / 2) + 1;
}

/** Baker games actually bowled in a settled match. */
export function gamesBowled(result: ExhibitionResult): number {
  return result.gamesWon[0] + result.gamesWon[1];
}

/**
 * Handicap from an average, for the day there is an average.
 *
 * (basis minus average) times the factor, truncated to a whole number,
 * because a handicap is an integer added to a scratch score and never a
 * fraction. It is exported because the rule is worth printing next to the
 * not established state, so a reader can see what will happen rather than
 * only that nothing has happened yet. It is called by nothing that
 * renders a figure today, and it cannot be: there is no average to pass
 * it.
 */
export function handicapFrom(
  average: number,
  basis: number = HANDICAP_BASIS,
  factorPct: number = HANDICAP_FACTOR_PCT,
): number {
  return Math.trunc(((basis - average) * factorPct) / 100);
}

/**
 * The first round pairings for a seeded field, in bracket order.
 *
 * Every first round pair sums to the field size plus one. If a generated
 * pairing does not sum to seventeen in a field of sixteen, the seeding is
 * wrong, and that is a property worth having as a function rather than a
 * comment because the proof pass can assert it against the seed.
 */
export function seededPairs(fieldSize: number): Array<[number, number]> {
  const order = bracketSeedOrder(fieldSize);
  const pairs: Array<[number, number]> = [];
  for (let i = 0; i < order.length; i += 2) {
    pairs.push([order[i], order[i + 1]]);
  }
  return pairs;
}

/**
 * Seeds in bracket order, so the strongest teams meet last.
 *
 * Built by repeated mirroring: [1, 2] becomes [1, 4, 2, 3] becomes
 * [1, 8, 4, 5, 2, 7, 3, 6] and so on. For sixteen this produces the
 * standard quarters, one against sixteen and eight against nine at the
 * top, four against thirteen and five against twelve next, and it is the
 * only arrangement in which the top two seeds cannot meet before the
 * final.
 */
export function bracketSeedOrder(fieldSize: number): number[] {
  let order = [1];
  while (order.length < fieldSize) {
    const size = order.length * 2;
    const next: number[] = [];
    for (const seed of order) {
      next.push(seed, size + 1 - seed);
    }
    order = next;
  }
  return order;
}

/**
 * Byes needed for a field that is not a power of two.
 *
 * Sixteen is a power of two so the Cup needs none, which is a real
 * argument for holding the field at sixteen rather than a coincidence.
 * The function exists because the field is not guaranteed to be sixteen
 * for ever, and because a bye should be a node in the tree that resolves
 * without pins rather than a fixture quietly missing from a night.
 */
export function byesNeeded(entrants: number): number {
  if (entrants < 2) return 0;
  let size = 1;
  while (size < entrants) size *= 2;
  return size - entrants;
}

/** Dates as the rest of the application writes them. */
export function formatCupDate(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Whole days between two dates, for a countdown that is honest.
 *
 * A countdown to a cup night is honest because the night is a fixed date
 * on a fixed lane pair: it genuinely arrives and it genuinely passes. A
 * countdown that resets when it reaches zero is the definitional
 * deceptive pattern and there is not one anywhere in this model. The same
 * test applies to the enrollment deadline: it is honest only if it
 * actually closes and the next cup is actually the next opportunity.
 */
export function daysUntil(iso: string, asOf: string): number {
  const a = Date.parse(`${asOf.slice(0, 10)}T00:00:00Z`);
  const b = Date.parse(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.round((b - a) / 86400000);
}
