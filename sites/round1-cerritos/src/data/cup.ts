import type {
  Cup,
  CupAdvance,
  CupEntry,
  CupFixture,
  CupRound,
  CupSide,
  CupSource,
  ExhibitionResult,
  MatchState,
  SourceTake,
} from "@/domain/cup";
import {
  BEST_OF_EARLY,
  BEST_OF_LATE,
  HANDICAP_BASIS,
  HANDICAP_FACTOR_PCT,
} from "@/domain/cup";

/**
 * THE QUARTERLY CUP. ONE OF THEM IS A DECLARED EXHIBITION.
 *
 * READ THIS BEFORE READING A SINGLE SCORE BELOW.
 *
 * ---------------------------------------------------------------
 * ROUND1 HAS NOT ANNOUNCED A CUP
 * ---------------------------------------------------------------
 *
 * There is no quarterly cup on round1usa.com, no cup calendar, and no
 * entry fee published for anything of this kind. The nearest store's own
 * page lists bowling, a VIP Immersive Lane, arcade, billiards and ping
 * pong, karaoke, party rooms, a Victory Zone and the YUU food hall, and
 * it names no league and no tournament. So everything in this file is A
 * PROPOSED PROGRAMME and every row in it is badged illustrative. It is
 * this application's own proposal for what a bowling floor could run,
 * not a claim about how Round1 operates.
 *
 * ---------------------------------------------------------------
 * THE CUP RUNNING NOW HAS NOT BEEN BOWLED
 * ---------------------------------------------------------------
 *
 * The Founders Cup below carries scores. Not a frame of this programme
 * has been bowled anywhere, because the programme is a proposal, and
 * every one of those scores is generated. It is a
 * DECLARED EXHIBITION: a simulated run of the format, seeded so that the
 * bracket, the advancement, the plate, the wildcard and the matchup build
 * up can all be judged in use rather than admired as a picture.
 *
 * The labelling is structural rather than editorial. Every simulated
 * figure sits on a type whose `label` and `provenance` fields are
 * REQUIRED, so a score cannot be constructed without the word simulated
 * attached to it and cannot be read without the label being in the same
 * object. A screen would have to work at it to render one of these
 * numbers bare.
 *
 * The Fresh Sheet Cup in January is the opposite. It has no scores
 * because it has not happened, and its enrollment is real product
 * presented as real product, because enrolling a team is a thing a
 * person can genuinely do a quarter ahead of the first night.
 *
 * ---------------------------------------------------------------
 * THE FEE
 * ---------------------------------------------------------------
 *
 * A hundred and eighty dollars for a team of five over six nights. That
 * figure is THIS APPLICATION'S OWN and it is badged illustrative
 * everywhere it renders. Round1 publishes no league price and no cup
 * price; neither does Lucky Strike Entertainment. It is not
 * added to the booked revenue ledger, it is not added to the outbound
 * activity ledger, and it is not added to the promotional product ledger.
 * Those three are never summed and a fourth would not improve matters.
 *
 * ---------------------------------------------------------------
 * WHY SIX NIGHTS AND NOT A FOUR NIGHT KNOCKOUT
 * ---------------------------------------------------------------
 *
 * Single elimination is what the word cup means to most people and it is
 * the wrong answer here. Fifteen matches, thirty lane nights, forty of
 * the eighty bowlers with no reason to come back after night one, and a
 * final bowled on a single pair while the rest of the floor stands
 * empty. The house is quieter on the biggest night of the quarter than
 * on any other night of it.
 *
 * This schedule commits ninety six lane nights instead of thirty, keeps
 * sixteen lanes occupied on all six nights including the finals, and has
 * no night on which a registered team has nothing to bowl. It costs two
 * extra nights and it is worth them.
 *
 * ---------------------------------------------------------------
 * ONE DEFECT IN THE RECOMMENDED SCHEDULE, AND WHAT WAS DONE ABOUT IT
 * ---------------------------------------------------------------
 *
 * `RESEARCH_tournaments.md` tabulates night five as the Cup semi finals,
 * four Plate rounds, the Plate final and the wildcard, eight matches over
 * sixteen teams. THAT NIGHT CANNOT BE BOWLED AS WRITTEN. For a Plate
 * final to be contested on night five, its two teams must have qualified
 * on night four, which needs the Plate to go from eight teams to two in
 * one night: six matches, on top of the four Cup quarter finals, which is
 * ten matches on twenty lanes. And if the Plate final's teams instead
 * came out of the same night's Plate rounds, they would be bowling twice
 * in one evening while the research's own rule is that each team bowls
 * once a night.
 *
 * The fix keeps every load bearing property and moves one fixture. Night
 * five is the Cup semi finals, the wildcard bout, the Plate semi finals
 * and a three match pinfall round for the six teams out of both brackets,
 * which is eight matches over sixteen teams with nobody drawn twice. The
 * Plate final moves to night six and is bowled on the pair beside the
 * stepladder, which is a better night for it anyway: two trophies lifted
 * in the same hour rather than one of them a week early.
 *
 * The consequence for the arithmetic is one extra match. The research
 * derives forty three plus the sweeper; this schedule derives forty four,
 * and it derives it from a night by night plan that resolves rather than
 * from a table that does not. The lane nights are unchanged at ninety six
 * because the Plate final replaces two lanes the sweeper would otherwise
 * have taken.
 */

/**
 * The instant the cup board is read from.
 *
 * The rest of the application reads its board at nine in the morning on
 * the twenty third of September. A cup night starts at a quarter to seven
 * in the evening, so a board read at nine would show night five as a
 * fixture rather than as a thing happening, and every live state in the
 * model would be unreachable. This instant is therefore stated separately
 * and stated exactly: twenty to nine on the same evening, part way
 * through night five, with the two best of five matches settled and the
 * two best of seven semi finals still bowling.
 */
export const CUP_AS_OF = "2026-09-23T20:40:00-07:00";

/** The date part of the above, for the day arithmetic. */
export const CUP_AS_OF_DATE = "2026-09-23";

const FEE_NOTE =
  "This application's own, invented for the prototype, and not a claim about how Round1 operates. Round1 publishes no dollar amount for a league or a cup anywhere, and neither does Lucky Strike Entertainment.";

const HANDICAP_NOTE =
  "Handicap is declared as a rule and not computed as a number, because a handicap needs an average and nothing has been bowled. Ninety per cent of two hundred and ten is the balanced adult setting, between the hundred per cent of two hundred used for beginner leagues and the eighty per cent of two hundred and twenty used where a field is competitive. The basis has to exceed the highest average in the field, which is the other reason it cannot be fixed yet.";

const FORMAT_SUMMARY =
  "Sixteen teams of five, six Wednesdays, Baker scored. Nights one and two are Swiss paired match play that turn an unseeded field into seeds one to sixteen on record then pins per game. Night three is the Cup round of sixteen. A first defeat moves a team into the Plate, which has its own semi finals, its own final and its own trophy. Night five carries the Cup semi finals, the Plate semi finals, one wildcard bout that returns a beaten team to the Cup, and a pinfall round for the teams out of both brackets. Night six is a stepladder final on one pair, the Plate final on the next, and a handicap sweeper for everybody else. Matches are best of five, and best of seven from the semi finals onward.";

export const CUPS: Cup[] = [
  {
    id: "founders-cup-2026-q4",
    name: "The Founders Cup",
    quarter: "Q4",
    year: 2026,
    state: "exhibition",
    strapline: "The first one. Sixteen teams, six Wednesdays, nobody sits out.",
    formatSummary: FORMAT_SUMMARY,
    fieldSize: 16,
    teamSize: 5,
    night: "Wednesday",
    startTime: "6.45pm",
    nightDates: [
      "2026-08-26",
      "2026-09-02",
      "2026-09-09",
      "2026-09-16",
      "2026-09-23",
      "2026-09-30",
    ],
    handicapBasis: HANDICAP_BASIS,
    handicapFactorPct: HANDICAP_FACTOR_PCT,
    handicapNote: HANDICAP_NOTE,
    registrationFee: 180,
    registrationFeeProvenance: "illustrative",
    registrationFeeNote: FEE_NOTE,
    note: "A simulated run of the format, generated so the bracket and the build up can be judged in use. Every score in it is labelled.",
    provenance: "illustrative",
  },
  {
    id: "fresh-sheet-cup-2027-q1",
    name: "The Fresh Sheet Cup",
    quarter: "Q1",
    year: 2027,
    state: "enrolling",
    strapline: "January, on fresh oil, and five slots of sixteen are still free.",
    formatSummary: FORMAT_SUMMARY,
    fieldSize: 16,
    teamSize: 5,
    night: "Wednesday",
    startTime: "6.45pm",
    nightDates: [
      "2027-01-06",
      "2027-01-13",
      "2027-01-20",
      "2027-01-27",
      "2027-02-03",
      "2027-02-10",
    ],
    handicapBasis: HANDICAP_BASIS,
    handicapFactorPct: HANDICAP_FACTOR_PCT,
    handicapNote: HANDICAP_NOTE,
    registrationFee: 180,
    registrationFeeProvenance: "illustrative",
    registrationFeeNote: FEE_NOTE,
    enrollmentOpensAt: "2026-09-01",
    enrollmentClosesAt: "2026-12-16",
    note: "The field is sixteen because a bracket of sixteen is what resolves in the nights available, with nobody drawn twice in an evening. No lane count is published for any Round1 location, so the field size is a property of the format rather than a number read off a floor plan, and the deadline still closes.",
    provenance: "illustrative",
  },
  {
    id: "long-oil-cup-2027-q2",
    name: "The Long Oil Cup",
    quarter: "Q2",
    year: 2027,
    state: "scheduled",
    strapline: "April, and enrollment opens the night the Fresh Sheet finishes.",
    formatSummary: FORMAT_SUMMARY,
    fieldSize: 16,
    teamSize: 5,
    night: "Wednesday",
    startTime: "6.45pm",
    nightDates: [
      "2027-04-07",
      "2027-04-14",
      "2027-04-21",
      "2027-04-28",
      "2027-05-05",
      "2027-05-12",
    ],
    handicapBasis: HANDICAP_BASIS,
    handicapFactorPct: HANDICAP_FACTOR_PCT,
    handicapNote: HANDICAP_NOTE,
    registrationFee: 180,
    registrationFeeProvenance: "illustrative",
    registrationFeeNote: FEE_NOTE,
    provenance: "illustrative",
  },
  {
    id: "late-shift-cup-2027-q3",
    name: "The Late Shift Cup",
    quarter: "Q3",
    year: 2027,
    state: "scheduled",
    strapline: "July, for the crews who cannot make a seven o'clock start.",
    formatSummary: FORMAT_SUMMARY,
    fieldSize: 16,
    teamSize: 5,
    night: "Wednesday",
    startTime: "6.45pm",
    nightDates: [
      "2027-07-07",
      "2027-07-14",
      "2027-07-21",
      "2027-07-28",
      "2027-08-04",
      "2027-08-11",
    ],
    handicapBasis: HANDICAP_BASIS,
    handicapFactorPct: HANDICAP_FACTOR_PCT,
    handicapNote: HANDICAP_NOTE,
    registrationFee: 180,
    registrationFeeProvenance: "illustrative",
    registrationFeeNote: FEE_NOTE,
    provenance: "illustrative",
  },
];

export const CUP_BY_ID: Record<string, Cup> = Object.fromEntries(
  CUPS.map((c) => [c.id, c]),
);

// ---------------------------------------------------------------
// The fields
// ---------------------------------------------------------------

const FOUNDERS = "founders-cup-2026-q4";
const FRESH_SHEET = "fresh-sheet-cup-2027-q1";

/**
 * The sixteen teams in each field, pointing at `data/leagues.ts`.
 *
 * The cup keeps no second roster. An entry is a team id and a date, and
 * everything else about the team, its name, its captain, its route in and
 * its five handles, is read from the league seed. A bowler who joins a
 * roster therefore appears in the cup with nobody editing a second file,
 * which is the difference between one product and two screens that happen
 * to agree.
 *
 * The Founders field is the sixteen teams that had five bowlers by the
 * middle of August. That is not a judgement about the other twelve: a
 * Baker game needs five bodies, because the five share the ten frames
 * between them.
 */
export const CUP_ENTRIES: CupEntry[] = [
  ...[
    ["pp-01", "2026-08-19"],
    ["pp-02", "2026-08-21"],
    ["pp-03", "2026-08-25"],
    ["pp-04", "2026-08-01"],
    ["pp-08", "2026-08-07"],
    ["pp-10", "2026-08-12"],
    ["pp-11", "2026-08-15"],
    ["pp-12", "2026-08-18"],
    ["lfs-01", "2026-07-30"],
    ["lfs-02", "2026-08-02"],
    ["lfs-03", "2026-08-04"],
    ["lfs-04", "2026-08-06"],
    ["lfs-05", "2026-08-08"],
    ["lfs-06", "2026-08-11"],
    ["lfs-07", "2026-08-13"],
    ["lfs-11", "2026-08-17"],
  ].map<CupEntry>(([teamId, enrolledAt], i) => ({
    cupId: FOUNDERS,
    teamId,
    entryNumber: i + 1,
    state: "confirmed",
    enrolledAt,
    provenance: "illustrative",
  })),

  /* Eleven of sixteen for January. The five free slots are the product:
     they are what a team can still claim, and the count falls out of a
     bracket that holds sixteen rather than out of a line of copy written
     to create urgency. */
  ...[
    ["pp-01", "confirmed", "2026-09-04"],
    ["pp-04", "confirmed", "2026-09-05"],
    ["pp-06", "confirmed", "2026-09-08"],
    ["pp-08", "confirmed", "2026-09-09"],
    ["pp-10", "held", "2026-09-14"],
    ["lfs-01", "confirmed", "2026-09-02"],
    ["lfs-03", "confirmed", "2026-09-10"],
    ["lfs-06", "confirmed", "2026-09-11"],
    ["lfs-10", "held", "2026-09-16"],
    ["lfs-11", "confirmed", "2026-09-12"],
    ["lfs-12", "held", "2026-09-21"],
  ].map<CupEntry>(([teamId, state, enrolledAt], i) => ({
    cupId: FRESH_SHEET,
    teamId,
    entryNumber: i + 1,
    state: state as "confirmed" | "held",
    enrolledAt,
    provenance: "illustrative",
  })),
];

// ---------------------------------------------------------------
// The rounds
// ---------------------------------------------------------------

const N = FOUNDERS;

export const CUP_ROUNDS: CupRound[] = [
  {
    id: "r-seed-1",
    cupId: N,
    night: 1,
    branch: "seeding",
    depth: 1,
    name: "Seeding round one",
    what: "All sixteen teams, drawn at random. Nobody can be knocked out of anything, and after tonight the cup has a result to its name for the first time.",
    kind: "head-to-head",
    bestOf: BEST_OF_EARLY,
    date: "2026-08-26",
    provenance: "illustrative",
  },
  {
    id: "r-seed-2",
    cupId: N,
    night: 2,
    branch: "seeding",
    depth: 2,
    name: "Seeding round two",
    what: "Swiss paired. The eight teams that won on night one bowl each other and the eight that lost bowl each other, so the seeds come out of matches that meant something rather than out of a hat.",
    kind: "head-to-head",
    bestOf: BEST_OF_EARLY,
    date: "2026-09-02",
    provenance: "illustrative",
  },
  {
    id: "r-cup-16",
    cupId: N,
    night: 3,
    branch: "cup",
    depth: 1,
    name: "Cup round of sixteen",
    what: "Seeded one against sixteen down to eight against nine. Every first round pair adds up to seventeen, which is the check that the draw is right.",
    kind: "head-to-head",
    bestOf: BEST_OF_EARLY,
    date: "2026-09-09",
    provenance: "illustrative",
  },
  {
    id: "r-cup-qf",
    cupId: N,
    night: 4,
    branch: "cup",
    depth: 2,
    name: "Cup quarter finals",
    what: "The eight teams still unbeaten in the Cup.",
    kind: "head-to-head",
    bestOf: BEST_OF_EARLY,
    date: "2026-09-16",
    provenance: "illustrative",
  },
  {
    id: "r-plate-8",
    cupId: N,
    night: 4,
    branch: "plate",
    depth: 1,
    name: "Plate round of eight",
    what: "The eight teams beaten in the Cup round of sixteen, paired best against worst by seed so that nobody meets the team that has just beaten them. The Plate is a competition with its own trophy and it is not promoted as a consolation.",
    kind: "head-to-head",
    bestOf: BEST_OF_EARLY,
    date: "2026-09-16",
    provenance: "illustrative",
  },
  {
    id: "r-cup-sf",
    cupId: N,
    night: 5,
    branch: "cup",
    depth: 3,
    name: "Cup semi finals",
    what: "Best of seven from here. Both winners take a rung on the stepladder and the better seeded loser takes a third.",
    kind: "head-to-head",
    bestOf: BEST_OF_LATE,
    date: "2026-09-23",
    provenance: "illustrative",
  },
  {
    id: "r-wildcard",
    cupId: N,
    night: 5,
    branch: "wildcard",
    depth: 1,
    name: "Wildcard bout",
    what: "One fixture between the two Cup quarter final losers carrying the better seeds. The winner returns to the Cup on the bottom rung of the stepladder, which is the whole point of it: a beaten roster stays in the building.",
    kind: "head-to-head",
    bestOf: BEST_OF_EARLY,
    date: "2026-09-23",
    provenance: "illustrative",
  },
  {
    id: "r-plate-sf",
    cupId: N,
    night: 5,
    branch: "plate",
    depth: 2,
    name: "Plate semi finals",
    what: "The four teams still alive in the Plate, on the pair next to the Cup semi finals.",
    kind: "head-to-head",
    bestOf: BEST_OF_EARLY,
    date: "2026-09-23",
    provenance: "illustrative",
  },
  {
    id: "r-long-game",
    cupId: N,
    night: 5,
    branch: "long-game",
    depth: 1,
    name: "The Long Game",
    what: "Six teams out of both brackets, bowling for banked pinfall that seeds the finals night sweeper. Losing a bracket changes what tonight's pins are worth and never whether there are any.",
    kind: "head-to-head",
    bestOf: BEST_OF_EARLY,
    date: "2026-09-23",
    provenance: "illustrative",
  },
  {
    id: "r-plate-final",
    cupId: N,
    night: 6,
    branch: "plate",
    depth: 3,
    name: "Plate final",
    what: "Best of seven on the second pair, at the same hour as the stepladder. Two trophies, two celebrations.",
    kind: "head-to-head",
    bestOf: BEST_OF_LATE,
    date: "2026-09-30",
    provenance: "illustrative",
  },
  {
    id: "r-stepladder",
    cupId: N,
    night: 6,
    branch: "stepladder",
    depth: 1,
    name: "Cup stepladder final",
    what: "Three matches on one pair, one after another, each bigger than the last. The wildcard winner bowls the best seeded semi final loser, the winner of that bowls the second seeded finalist, and the winner of that bowls the top seed for the Cup. The top seed bowls once, last, and everybody else watches.",
    kind: "head-to-head",
    bestOf: BEST_OF_LATE,
    sequential: true,
    date: "2026-09-30",
    provenance: "illustrative",
  },
  {
    id: "r-sweeper",
    cupId: N,
    night: 6,
    branch: "sweeper",
    depth: 1,
    name: "Handicap sweeper",
    what: "Every team not on the stepladder or in the Plate final, bowling a handicap squad on the other twelve lanes while the finals are on. It is the piece that keeps sixteen lanes busy on the biggest night instead of two.",
    kind: "squad",
    squadLanes: 12,
    squadTeams: 10,
    squadEntry:
      "Automatic for the ten teams not in the stepladder or the Plate final. Seeded on pinfall banked over the five nights, including the Long Game.",
    date: "2026-09-30",
    provenance: "illustrative",
  },
];

export const CUP_ROUND_BY_ID: Record<string, CupRound> = Object.fromEntries(
  CUP_ROUNDS.map((r) => [r.id, r]),
);

// ---------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------

/**
 * A settled result, with its label attached rather than implied.
 *
 * Games won, pins and the high game of the match. Pinfall is carried
 * alongside the win because a team that lost tonight has still banked
 * something true, which is what the Peterson points idea does in ordinary
 * league play and what professional match play does with bonus pins on
 * top of total pinfall. Pins per game, not total pins, is what seeds the
 * bracket, because a team that wins three straight bowls three games and
 * a team that wins three to two bowls five, and ranking on the total
 * would punish the first for being better.
 */
function res(
  gamesWon: [number, number],
  pinfall: [number, number],
  highGame: [number, number],
): ExhibitionResult {
  return {
    gamesWon,
    pinfall,
    highGame,
    label: "Simulated exhibition",
    provenance: "illustrative",
  };
}

function from(take: SourceTake, rule: string, ...fixtureIds: string[]): CupSource {
  return { fixtureIds, take, rule };
}

function side(teamId: string | null, source?: CupSource): CupSide {
  return source ? { teamId, source } : { teamId };
}

function to(fixtureId: string, slot: 0 | 1): CupAdvance {
  return { fixtureId, slot };
}

interface FixtureSeed {
  id: string;
  roundId: string;
  number: number;
  state: MatchState;
  lanes: [number, number];
  sides: [CupSide, CupSide];
  winnerTo?: CupAdvance;
  loserTo?: CupAdvance;
  result?: ExhibitionResult;
  note?: string;
}

const F: FixtureSeed[] = [
  // -----------------------------------------------------------
  // NIGHT ONE. Seeding round one, drawn at random.
  // -----------------------------------------------------------
  {
    id: "s1-1",
    roundId: "r-seed-1",
    number: 1,
    state: "final",
    lanes: [1, 2],
    sides: [side("pp-01"), side("lfs-01")],
    result: res([3, 1], [664, 612], [189, 176]),
  },
  {
    id: "s1-2",
    roundId: "r-seed-1",
    number: 2,
    state: "final",
    lanes: [3, 4],
    sides: [side("pp-02"), side("lfs-02")],
    result: res([2, 3], [790, 812], [181, 194]),
  },
  {
    id: "s1-3",
    roundId: "r-seed-1",
    number: 3,
    state: "final",
    lanes: [5, 6],
    sides: [side("pp-03"), side("lfs-03")],
    result: res([3, 0], [496, 441], [178, 162]),
  },
  {
    id: "s1-4",
    roundId: "r-seed-1",
    number: 4,
    state: "final",
    lanes: [7, 8],
    sides: [side("pp-04"), side("lfs-04")],
    result: res([1, 3], [622, 668], [172, 185]),
  },
  {
    id: "s1-5",
    roundId: "r-seed-1",
    number: 5,
    state: "final",
    lanes: [9, 10],
    sides: [side("pp-08"), side("lfs-05")],
    result: res([3, 2], [806, 779], [191, 183]),
  },
  {
    id: "s1-6",
    roundId: "r-seed-1",
    number: 6,
    state: "final",
    lanes: [11, 12],
    sides: [side("pp-10"), side("lfs-06")],
    result: res([0, 3], [455, 502], [166, 180]),
  },
  {
    id: "s1-7",
    roundId: "r-seed-1",
    number: 7,
    state: "final",
    lanes: [13, 14],
    sides: [side("pp-11"), side("lfs-07")],
    result: res([3, 2], [781, 760], [175, 187]),
  },
  {
    id: "s1-8",
    roundId: "r-seed-1",
    number: 8,
    state: "final",
    lanes: [15, 16],
    sides: [side("pp-12"), side("lfs-11")],
    result: res([1, 3], [619, 657], [170, 182]),
  },

  // -----------------------------------------------------------
  // NIGHT TWO. Swiss paired: winners meet winners.
  // -----------------------------------------------------------
  {
    id: "s2-1",
    roundId: "r-seed-2",
    number: 1,
    state: "final",
    lanes: [1, 2],
    sides: [side("pp-01"), side("lfs-02")],
    result: res([3, 2], [812, 795], [193, 188]),
    note: "The best two teams on night one, on the top pair on night two. Swiss pairing does that on purpose and it is why the seeds are worth anything.",
  },
  {
    id: "s2-2",
    roundId: "r-seed-2",
    number: 2,
    state: "final",
    lanes: [3, 4],
    sides: [side("pp-03"), side("lfs-04")],
    result: res([1, 3], [640, 671], [174, 186]),
  },
  {
    id: "s2-3",
    roundId: "r-seed-2",
    number: 3,
    state: "final",
    lanes: [5, 6],
    sides: [side("pp-08"), side("lfs-06")],
    result: res([3, 1], [664, 631], [190, 177]),
  },
  {
    id: "s2-4",
    roundId: "r-seed-2",
    number: 4,
    state: "final",
    lanes: [7, 8],
    sides: [side("pp-11"), side("lfs-11")],
    result: res([2, 3], [773, 788], [181, 189]),
  },
  {
    id: "s2-5",
    roundId: "r-seed-2",
    number: 5,
    state: "final",
    lanes: [9, 10],
    sides: [side("lfs-01"), side("pp-02")],
    result: res([3, 0], [489, 442], [175, 158]),
  },
  {
    id: "s2-6",
    roundId: "r-seed-2",
    number: 6,
    state: "final",
    lanes: [11, 12],
    sides: [side("lfs-03"), side("pp-04")],
    result: res([1, 3], [615, 649], [168, 183]),
  },
  {
    id: "s2-7",
    roundId: "r-seed-2",
    number: 7,
    state: "final",
    lanes: [13, 14],
    sides: [side("lfs-05"), side("pp-10")],
    result: res([3, 2], [768, 741], [184, 176]),
  },
  {
    id: "s2-8",
    roundId: "r-seed-2",
    number: 8,
    state: "final",
    lanes: [15, 16],
    sides: [side("lfs-07"), side("pp-12")],
    result: res([1, 3], [628, 655], [171, 180]),
  },

  // -----------------------------------------------------------
  // NIGHT THREE. Cup round of sixteen, seeded, pairs summing to 17.
  // -----------------------------------------------------------
  {
    id: "c16-1",
    roundId: "r-cup-16",
    number: 1,
    state: "final",
    lanes: [1, 2],
    sides: [side("lfs-04"), side("pp-10")],
    winnerTo: to("cqf-1", 0),
    loserTo: to("p8-1", 1),
    result: res([3, 0], [512, 449], [182, 158]),
  },
  {
    id: "c16-2",
    roundId: "r-cup-16",
    number: 2,
    state: "final",
    lanes: [3, 4],
    sides: [side("pp-12"), side("pp-04")],
    winnerTo: to("cqf-1", 1),
    loserTo: to("p8-3", 0),
    result: res([2, 3], [778, 796], [180, 187]),
    note: "Seed nine over seed eight, which is not an upset by any definition and was the closest match of the night.",
  },
  {
    id: "c16-3",
    roundId: "r-cup-16",
    number: 3,
    state: "final",
    lanes: [5, 6],
    sides: [side("lfs-11"), side("lfs-07")],
    winnerTo: to("cqf-2", 0),
    loserTo: to("p8-4", 1),
    result: res([3, 1], [674, 638], [186, 172]),
  },
  {
    id: "c16-4",
    roundId: "r-cup-16",
    number: 4,
    state: "final",
    lanes: [7, 8],
    sides: [side("pp-03"), side("lfs-05")],
    winnerTo: to("cqf-2", 1),
    loserTo: to("p8-1", 0),
    result: res([2, 3], [789, 803], [184, 191]),
    note: "Seed twelve over seed five, a gap of seven, which clears the five line the cup uses to call something an upset.",
  },
  {
    id: "c16-5",
    roundId: "r-cup-16",
    number: 5,
    state: "final",
    lanes: [9, 10],
    sides: [side("pp-01"), side("lfs-03")],
    winnerTo: to("cqf-3", 0),
    loserTo: to("p8-2", 1),
    result: res([3, 0], [521, 446], [188, 160]),
  },
  {
    id: "c16-6",
    roundId: "r-cup-16",
    number: 6,
    state: "final",
    lanes: [11, 12],
    sides: [side("lfs-02"), side("lfs-01")],
    winnerTo: to("cqf-3", 1),
    loserTo: to("p8-4", 0),
    result: res([3, 1], [668, 634], [183, 175]),
  },
  {
    id: "c16-7",
    roundId: "r-cup-16",
    number: 7,
    state: "final",
    lanes: [13, 14],
    sides: [side("pp-08"), side("pp-02")],
    winnerTo: to("cqf-4", 0),
    loserTo: to("p8-3", 1),
    result: res([3, 1], [681, 629], [189, 170]),
  },
  {
    id: "c16-8",
    roundId: "r-cup-16",
    number: 8,
    state: "final",
    lanes: [15, 16],
    sides: [side("lfs-06"), side("pp-11")],
    winnerTo: to("cqf-4", 1),
    loserTo: to("p8-2", 0),
    result: res([2, 3], [781, 795], [182, 190]),
    note: "Seed eleven over seed six. A team the house put together out of five individual sign ups, beating an employer team, on night three.",
  },

  // -----------------------------------------------------------
  // NIGHT FOUR. Cup quarter finals and the Plate round of eight.
  // -----------------------------------------------------------
  {
    id: "cqf-1",
    roundId: "r-cup-qf",
    number: 1,
    state: "final",
    lanes: [1, 2],
    sides: [
      side("lfs-04", from("winner", "Winner of Cup round of sixteen, match one.", "c16-1")),
      side("pp-04", from("winner", "Winner of Cup round of sixteen, match two.", "c16-2")),
    ],
    loserTo: to("lg-1", 0),
    result: res([3, 1], [667, 641], [185, 176]),
  },
  {
    id: "cqf-2",
    roundId: "r-cup-qf",
    number: 2,
    state: "final",
    lanes: [3, 4],
    sides: [
      side("lfs-11", from("winner", "Winner of Cup round of sixteen, match three.", "c16-3")),
      side("lfs-05", from("winner", "Winner of Cup round of sixteen, match four.", "c16-4")),
    ],
    loserTo: to("lg-2", 0),
    result: res([3, 2], [806, 788], [190, 186]),
  },
  {
    id: "cqf-3",
    roundId: "r-cup-qf",
    number: 3,
    state: "final",
    lanes: [5, 6],
    sides: [
      side("pp-01", from("winner", "Winner of Cup round of sixteen, match five.", "c16-5")),
      side("lfs-02", from("winner", "Winner of Cup round of sixteen, match six.", "c16-6")),
    ],
    loserTo: to("wc-1", 1),
    result: res([3, 2], [812, 799], [194, 187]),
  },
  {
    id: "cqf-4",
    roundId: "r-cup-qf",
    number: 4,
    state: "final",
    lanes: [7, 8],
    sides: [
      side("pp-08", from("winner", "Winner of Cup round of sixteen, match seven.", "c16-7")),
      side("pp-11", from("winner", "Winner of Cup round of sixteen, match eight.", "c16-8")),
    ],
    loserTo: to("wc-1", 0),
    result: res([2, 3], [792, 804], [188, 192]),
    note: "Seed eleven again, this time over seed three. The second upset of their run and the reason the wildcard has a seed three in it.",
  },
  {
    id: "p8-1",
    roundId: "r-plate-8",
    number: 1,
    state: "final",
    lanes: [9, 10],
    sides: [
      side("pp-03", from("loser", "Beaten in Cup round of sixteen, match four.", "c16-4")),
      side("pp-10", from("loser", "Beaten in Cup round of sixteen, match one.", "c16-1")),
    ],
    winnerTo: to("psf-1", 0),
    loserTo: to("lg-1", 1),
    result: res([3, 1], [668, 622], [184, 165]),
  },
  {
    id: "p8-2",
    roundId: "r-plate-8",
    number: 2,
    state: "final",
    lanes: [11, 12],
    sides: [
      side("lfs-06", from("loser", "Beaten in Cup round of sixteen, match eight.", "c16-8")),
      side("lfs-03", from("loser", "Beaten in Cup round of sixteen, match five.", "c16-5")),
    ],
    winnerTo: to("psf-2", 0),
    loserTo: to("lg-2", 1),
    result: res([3, 0], [508, 449], [181, 159]),
  },
  {
    id: "p8-3",
    roundId: "r-plate-8",
    number: 3,
    state: "final",
    lanes: [13, 14],
    sides: [
      side("pp-12", from("loser", "Beaten in Cup round of sixteen, match two.", "c16-2")),
      side("pp-02", from("loser", "Beaten in Cup round of sixteen, match seven.", "c16-7")),
    ],
    winnerTo: to("psf-2", 1),
    loserTo: to("lg-3", 0),
    result: res([2, 3], [773, 786], [179, 184]),
  },
  {
    id: "p8-4",
    roundId: "r-plate-8",
    number: 4,
    state: "final",
    lanes: [15, 16],
    sides: [
      side("lfs-01", from("loser", "Beaten in Cup round of sixteen, match six.", "c16-6")),
      side("lfs-07", from("loser", "Beaten in Cup round of sixteen, match three.", "c16-3")),
    ],
    winnerTo: to("psf-1", 1),
    loserTo: to("lg-3", 1),
    result: res([3, 2], [791, 776], [186, 181]),
  },

  // -----------------------------------------------------------
  // NIGHT FIVE. In progress at the instant this board is read.
  // -----------------------------------------------------------
  {
    id: "csf-1",
    roundId: "r-cup-sf",
    number: 1,
    state: "live",
    lanes: [1, 2],
    sides: [
      side("lfs-04", from("winner", "Winner of Cup quarter final one.", "cqf-1")),
      side("pp-11", from("winner", "Winner of Cup quarter final four.", "cqf-4")),
    ],
    note: "The top seed against the team that has already beaten seeds six and three. Best of seven, and it is still bowling.",
  },
  {
    id: "csf-2",
    roundId: "r-cup-sf",
    number: 2,
    state: "live",
    lanes: [3, 4],
    sides: [
      side("lfs-11", from("winner", "Winner of Cup quarter final two.", "cqf-2")),
      side("pp-01", from("winner", "Winner of Cup quarter final three.", "cqf-3")),
    ],
  },
  {
    id: "wc-1",
    roundId: "r-wildcard",
    number: 1,
    state: "final",
    lanes: [5, 6],
    sides: [
      side("pp-08", from("loser", "Beaten in Cup quarter final four, and the better seeded of the two beaten teams entitled to this bout.", "cqf-4")),
      side("lfs-02", from("loser", "Beaten in Cup quarter final three.", "cqf-3")),
    ],
    winnerTo: to("sl-1", 0),
    result: res([3, 2], [801, 789], [190, 185]),
    note: "The fixture the whole format exists to make possible. A team knocked out on night four is on the stepladder on night six.",
  },
  {
    id: "psf-1",
    roundId: "r-plate-sf",
    number: 1,
    state: "final",
    lanes: [7, 8],
    sides: [
      side("pp-03", from("winner", "Winner of Plate round of eight, match one.", "p8-1")),
      side("lfs-01", from("winner", "Winner of Plate round of eight, match four.", "p8-4")),
    ],
    winnerTo: to("pf-1", 0),
    result: res([3, 1], [671, 640], [185, 174]),
  },
  {
    id: "psf-2",
    roundId: "r-plate-sf",
    number: 2,
    state: "final",
    lanes: [9, 10],
    sides: [
      side("lfs-06", from("winner", "Winner of Plate round of eight, match two.", "p8-2")),
      side("pp-02", from("winner", "Winner of Plate round of eight, match three.", "p8-3")),
    ],
    winnerTo: to("pf-1", 1),
    result: res([3, 2], [798, 781], [187, 182]),
  },
  {
    id: "lg-1",
    roundId: "r-long-game",
    number: 1,
    state: "final",
    lanes: [11, 12],
    sides: [
      side("pp-04", from("loser", "Beaten in Cup quarter final one.", "cqf-1")),
      side("pp-10", from("loser", "Beaten in Plate round of eight, match one.", "p8-1")),
    ],
    result: res([3, 0], [514, 455], [180, 161]),
  },
  {
    id: "lg-2",
    roundId: "r-long-game",
    number: 2,
    state: "final",
    lanes: [13, 14],
    sides: [
      side("lfs-05", from("loser", "Beaten in Cup quarter final two.", "cqf-2")),
      side("lfs-03", from("loser", "Beaten in Plate round of eight, match two.", "p8-2")),
    ],
    result: res([3, 1], [663, 619], [183, 168]),
  },
  {
    id: "lg-3",
    roundId: "r-long-game",
    number: 3,
    state: "live",
    lanes: [15, 16],
    sides: [
      side("pp-12", from("loser", "Beaten in Plate round of eight, match three.", "p8-3")),
      side("lfs-07", from("loser", "Beaten in Plate round of eight, match four.", "p8-4")),
    ],
  },

  // -----------------------------------------------------------
  // NIGHT SIX. Finals night. Sixteen lanes, not two.
  // -----------------------------------------------------------
  {
    id: "pf-1",
    roundId: "r-plate-final",
    number: 1,
    state: "scheduled",
    lanes: [3, 4],
    sides: [
      side("pp-03", from("winner", "Winner of Plate semi final one.", "psf-1")),
      side("lfs-06", from("winner", "Winner of Plate semi final two.", "psf-2")),
    ],
    note: "Both teams are known, the date is fixed and the pair is booked. This is the fixture on this board that is worth ringing a captain about.",
  },
  {
    id: "sl-1",
    roundId: "r-stepladder",
    number: 1,
    state: "awaiting-opponent",
    lanes: [1, 2],
    sides: [
      side("pp-08", from("winner", "Winner of the wildcard bout.", "wc-1")),
      side(
        null,
        from(
          "higher-seed-loser",
          "The beaten Cup semi finalist carrying the better seed.",
          "csf-1",
          "csf-2",
        ),
      ),
    ],
    winnerTo: to("sl-2", 0),
  },
  {
    id: "sl-2",
    roundId: "r-stepladder",
    number: 2,
    state: "awaiting-opponent",
    lanes: [1, 2],
    sides: [
      side(null, from("winner", "Winner of the first stepladder rung.", "sl-1")),
      side(
        null,
        from(
          "lower-seed-winner",
          "The Cup semi final winner carrying the lower seed.",
          "csf-1",
          "csf-2",
        ),
      ),
    ],
    winnerTo: to("sl-3", 0),
  },
  {
    id: "sl-3",
    roundId: "r-stepladder",
    number: 3,
    state: "awaiting-opponent",
    lanes: [1, 2],
    sides: [
      side(null, from("winner", "Winner of the second stepladder rung.", "sl-2")),
      side(
        null,
        from(
          "higher-seed-winner",
          "The Cup semi final winner carrying the better seed. Bowls once all night, and it is the last match of the quarter.",
          "csf-1",
          "csf-2",
        ),
      ),
    ],
    note: "The Cup. One pair, everybody else watching, and the seed earned on nights one and two decides who has to bowl three matches to win it and who has to bowl one.",
  },
];

export const CUP_FIXTURES: CupFixture[] = F.map((f) => ({
  cupId: N,
  provenance: "illustrative",
  ...f,
}));

export const CUP_FIXTURE_BY_ID: Record<string, CupFixture> = Object.fromEntries(
  CUP_FIXTURES.map((f) => [f.id, f]),
);
