import type {
  BowlingPosition,
  League,
  LeagueTeam,
  TeamFormation,
} from "@/domain/leagues";
import { POSITION_ORDER } from "@/domain/leagues";
import type {
  BallPreferences,
  BallSurface,
  Bowler,
  BowlingHand,
  Coverstock,
} from "@/domain/cup";
import { ESTABLISHED_AVERAGE_GAMES } from "@/domain/cup";

/**
 * TWO RECURRING MIDWEEK NIGHTS, PROPOSED, FOR THE CERRITOS TRADE AREA.
 *
 * READ THIS BEFORE READING A SINGLE FIGURE BELOW.
 *
 * ROUND1 PUBLISHES NO LEAGUE. Not on its corporate profile, not on its
 * party booking pages, and not on the Lakewood Center location page,
 * whose amenity list runs to bowling, a VIP Immersive Lane option,
 * arcade, billiards and ping pong, karaoke, party rooms, Victory Zone
 * and the YUU Japanese food hall and then stops. There is no programme
 * to record, no price to quote and no night to sign anybody up to.
 *
 * A COMPETITOR DOES PUBLISH ONE, and it is recorded in this codebase as
 * exactly that: `OPEN_LANE_SOCIALS` in `data/requests.ts`, badged public,
 * cited to the page it was read from, with the five things that page
 * states and the five it withholds. It belongs to somebody else and no
 * screen in this application presents it as DIME's.
 *
 * SO THE TWO NIGHTS BELOW ARE A PROPOSAL. They are not an announcement,
 * they are not a DIME product, and every row in this file is badged
 * illustrative. The one thing borrowed from anywhere is the choice of
 * nights: Tuesday and Thursday are the nights an entertainment floor
 * finds hardest to fill, which is also why the rival programme plays
 * Tuesday to Thursday, and that observation is cited to them rather than
 * dressed up as research.
 *
 * ---------------------------------------------------------------
 * WHY A PROMOTIONS DESK OWNS THIS AND OPERATIONS DOES NOT
 * ---------------------------------------------------------------
 *
 * A recurring midweek night is the cheapest standing audience a prize
 * and merchandise programme will ever get. The same faces, on the same
 * night, for sixteen weeks, all of whom have already told you what they
 * like. That is a co-branded shirt run, a prize wall that turns over on
 * a known cadence, and a sell-through number that means something
 * because the denominator does not move.
 *
 * It is also why the Tuesday night below is anchored by a collectibles
 * shop rather than by an employer. A shop that already runs card
 * tournaments brings the players, knows what the players will pay for,
 * and buys prize stock itself. That is a merchandising relationship with
 * a league attached to it, which is a more interesting thing for this
 * desk than sixteen teams from sixteen payrolls would have been.
 *
 * ---------------------------------------------------------------
 * THERE IS NO PRICE IN THIS FILE AND THERE IS NOT GOING TO BE
 * ---------------------------------------------------------------
 *
 * DIME publishes no price for anything: not a party package, not a
 * party room, not an hour, not a minimum spend. Nobody else in the
 * category publishes a league price either. That makes the missing
 * figure a category habit rather than a gap in the research, and it
 * makes any number this file invented a number a reader could go looking
 * for and find nowhere. Every screen renders the withheld sentence
 * instead.
 *
 * NO LANE COUNT EITHER. DIME publishes none for any location, so
 * nothing in this file states how many lanes a night occupies as a share
 * of anything. The season shape derived in `domain/leagues.ts` counts
 * lanes the field itself needs, which is arithmetic on the field size
 * and not a claim about a building.
 *
 * ---------------------------------------------------------------
 * NOTHING HAS BOWLED A FRAME
 * ---------------------------------------------------------------
 *
 * There are no scores here because there is nothing to score. The type
 * in `domain/leagues.ts` carries no result field, so the ladder is
 * ordered by how ready each team is to play: slot state first, then
 * bodies on the roster, then the date the slot was claimed. Every one of
 * those is a count of something somebody actually did.
 *
 * The quarterly Cup runs a DECLARED EXHIBITION and that exhibition has
 * scores in it. Those scores live in `data/cup.ts`, on types that carry
 * their own simulated label as a required field, and not one of them
 * reaches a league type. That separation is the reason `LeagueTeam`
 * still has nowhere to put a result.
 *
 * ---------------------------------------------------------------
 * THE TEAM NAMES
 * ---------------------------------------------------------------
 *
 * Real bowling leagues name themselves badly on purpose and it is one of
 * the best things about the sport. Every name below is an original pun
 * written for this file. Several evoke a genre, a heist thriller, a
 * survival show, a games console, because that is the voice the room
 * has. NONE of them borrows a title, a character or a trademark. A desk
 * that would be sourcing licensed product for a living cannot be casual
 * about somebody else's mark on a bowling shirt, and a file that is
 * scrupulous about one licence and careless about another has not been
 * scrupulous about either.
 *
 * ---------------------------------------------------------------
 * NO PEOPLE. THE ROSTERS ARE HANDLES.
 * ---------------------------------------------------------------
 *
 * Every bowler below is a HANDLE, which is what a bowler is called on
 * the lanes, plus a position and a set of preferences about a ball.
 * There is no first name, no surname, no initial and nowhere to put one,
 * because `Bowler` in `domain/cup.ts` has no field for it.
 *
 * This is the same discipline that put twenty four verified real
 * organisations on the exclusion list rather than on the board. A
 * plausible invented name next to a hundred and nine real organisations
 * is the fastest way to make a reader doubt the real rows, and a handle
 * is not that: nobody reads "Gutter Therapy" and believes a specific
 * human is described. The captain's JOB TITLE stays on the team, because
 * a title is a role and a role is not a person either.
 *
 * ---------------------------------------------------------------
 * THE ROSTER IS THE REGISTER AND THE COUNTS ARE DERIVED FROM IT
 * ---------------------------------------------------------------
 *
 * `bowlersCommitted` and `positionsFilled` on `LeagueTeam` are not typed
 * out anywhere in this file. They are computed from the roster at the
 * bottom, once, so the count on the board and the list of handles on the
 * team sheet are the same fact rather than two facts that have to be
 * kept in step by hand. Add a bowler to a roster and the ladder reorders,
 * the seats count drops and the league's openness reading can flip, with
 * nobody editing a second number anywhere.
 */

/** The moment the board is read from. The same instant the queue uses. */
export const LEAGUES_AS_OF = "2026-09-23";

/**
 * The rival programme this proposal sits next to.
 *
 * It is a competitor's page and it is the only published league fact
 * this application has. The constant lives here so the leagues board and
 * the requests board quote the same URL, and so a reader who wants to
 * check that one fact can do it in fifteen seconds and see for
 * themselves whose programme it is.
 */
export const BRAND_LEAGUES_PAGE = "https://www.mainevent.com/the-leagues/";

export const LEAGUES: League[] = [
  {
    id: "pinfall-protocol",
    name: "The Pinfall Protocol",
    tagline: "Tuesday night, and somebody who sells card sleeves is very good at this.",
    night: "Tuesday",
    startTime: "6.45pm",
    who: "Shop crews, supplier crews and collectors. Five from one payroll, or five who met over a display case.",
    fieldSize: 16,
    seasonWeeks: 16,
    teamSize: 5,
    gamesPerNight: 3,
    handicapNote:
      "Handicap scored, so a team of first timers can beat a team of regulars. DIME publishes no handicap system, no team size and no format for anything, so all three below are this proposal's own and are labelled as such.",
    openness: "welcoming-teams",
    opennessNote:
      "Four slots free in the field of sixteen. A whole team can claim one and keep its own name.",
    standingsBasis: "form-up",
    anchorProspectId: "chalice-collectibles",
    anchorBasis:
      "The shop's store manager rang about a Saturday collector day and asked twice what could be committed towards a prize wall if the shop supplied the entrants. That ask is on the requests board, and a recurring Tuesday is the version of it that lasts sixteen weeks instead of one morning.",
    provenance: "illustrative",
  },
  {
    id: "last-frame-standing",
    name: "Last Frame Standing",
    tagline: "Thursday night, sixteen teams, one of them goes home smug.",
    night: "Thursday",
    startTime: "7.00pm",
    who: "Anybody. Neighbours, shift crews, and four people who found each other on a noticeboard.",
    fieldSize: 16,
    seasonWeeks: 16,
    teamSize: 5,
    gamesPerNight: 3,
    handicapNote:
      "Handicap scored, on the same basis as the Tuesday night. Nothing about it is published by DIME, because DIME publishes no league at all.",
    openness: "welcoming-individuals",
    opennessNote:
      "The field of sixteen is claimed and eight of the rosters are a body short, so a bowler with no team still gets a seat.",
    standingsBasis: "form-up",
    anchorProspectId: "norwalk-chamber-of-commerce",
    anchorBasis:
      "The chamber's membership director asked whether members could run a business league, on the basis that several members had asked her the same question. She put the first two teams in and asked for the night to be opened to anyone rather than kept to one employer.",
    provenance: "illustrative",
  },
];

export const LEAGUE_BY_ID: Record<string, League> = Object.fromEntries(
  LEAGUES.map((l) => [l.id, l]),
);

// ---------------------------------------------------------------
// Ball preferences, written short
// ---------------------------------------------------------------

/**
 * A bowler who owns a ball, in the order the enrollment form asks.
 *
 * Hand, weight, what they call it, shell, surface, and whether they carry
 * a plastic ball for corner pins. Those six are the ones a casual league
 * bowler can answer without looking anything up, which is exactly why
 * they are the six that are positional here and the grit number and the
 * core are not. Asking a first timer for a drilling layout signals that
 * the league is for serious bowlers, so there is no layout field at all.
 */
function own(
  hand: BowlingHand,
  weightLb: number,
  nickname: string,
  coverstock: Coverstock,
  surface: BallSurface,
  carriesSpareBall: boolean,
  extra: Partial<BallPreferences> = {},
): BallPreferences {
  return {
    hand,
    ownership: "own-ball",
    weightLb,
    nickname,
    coverstock,
    surface,
    carriesSpareBall,
    ...extra,
  };
}

/**
 * A bowler off the rack, which is most of a first season field.
 *
 * A house ball has no nickname, no coverstock worth stating and no
 * surface anybody chose, so those fields are simply absent rather than
 * filled with a shrug. Weight is optional because plenty of people pick
 * whatever is on the rack and could not tell you.
 */
function house(hand: BowlingHand, weightLb?: number): BallPreferences {
  return {
    hand,
    ownership: "house-ball",
    weightLb,
    carriesSpareBall: false,
  };
}

// ---------------------------------------------------------------
// The seed shape, and the two facts it derives
// ---------------------------------------------------------------

interface BowlerSeed {
  handle: string;
  position: BowlingPosition;
  ball: BallPreferences;
  captain?: true;
  whyHere?: string;
  walkUp?: string;
  /** Overrides the team's claim date for somebody who joined later. */
  joinedAt?: string;
  /** Simulated cup figures as [strikes, spares converted]. Cup field only. */
  ex?: [number, number];
}

/**
 * A bowler on a roster.
 *
 * The average is always the not established arm and it always will be
 * until a league night is bowled. It carries its denominator so a screen
 * can print "0 of 21 games" rather than a blank or, far worse, a zero
 * with a decimal point that reads like a real average of nothing.
 */
function bowler(
  handle: string,
  position: BowlingPosition,
  ball: BallPreferences,
  extra: Omit<BowlerSeed, "handle" | "position" | "ball"> = {},
): BowlerSeed {
  return { handle, position, ball, ...extra };
}

interface TeamSeed extends Omit<LeagueTeam, "bowlersCommitted" | "positionsFilled"> {
  roster: BowlerSeed[];
}

const TEAM_SEEDS: TeamSeed[] = [];

function team(
  base: Omit<TeamSeed, "roster" | "provenance">,
  roster: BowlerSeed[],
): void {
  TEAM_SEEDS.push({ ...base, roster, provenance: "illustrative" });
}

/**
 * How a team came to exist, inferred once rather than typed twice.
 *
 * A team with an organisation behind it is organisation formed by
 * definition, so that route is never written out below. The other two
 * are, because the difference between a captain who walked in with four
 * friends and five strangers the house put together is not visible in
 * any other field and it is the difference between two products.
 */
function formationOf(
  prospectId: string | undefined,
  declared: TeamFormation | undefined,
): TeamFormation {
  if (prospectId) return "organisation-formed";
  return declared ?? "venue-formed";
}

// -------------------------------------------------------------
// The Pinfall Protocol. Tuesday. Twelve of sixteen slots claimed.
// -------------------------------------------------------------

team(
  {
    id: "pp-01",
    leagueId: "pinfall-protocol",
    name: "Ctrl Alt Defeat",
    slot: 1,
    slotState: "confirmed",
    captainRole: "Store manager",
    formation: formationOf("chalice-collectibles", undefined),
    claimedAt: "2026-08-18",
    prospectId: "chalice-collectibles",
    affiliationBasis: "Two shifts off the same shop floor, and the shop that started the night.",
    note: "First slot claimed in either league, and the first written thing anybody sent about a midweek night.",
  },
  [
    bowler("Attract Mode", "lead-off", house("right", 12), { ex: [11, 13] }),
    bowler("Save Point", "second", own("right", 14, "The Rollback", "reactive", "dull", true), {
      ex: [12, 12],
      whyHere: "Brought by work and stayed for the Tuesday.",
    }),
    bowler("Frame Perfect", "third", own("left", 15, "Framerate", "reactive", "shiny", true, { gritNumber: 4000 }), {
      ex: [15, 12],
    }),
    bowler("Combo Breaker", "fourth", house("right", 13), { ex: [10, 14] }),
    bowler("Boss Music", "anchor", own("right", 15, "Second Phase", "urethane", "dull", true, { core: "symmetric" }), {
      captain: true,
      ex: [14, 11],
      walkUp: "Anything with a key change in it.",
      whyHere: "For the competition, and says so without embarrassment.",
    }),
  ],
);

team(
  {
    id: "pp-02",
    leagueId: "pinfall-protocol",
    name: "Four Colour Process",
    slot: 2,
    slotState: "confirmed",
    captainRole: "Print production manager",
    formation: formationOf("french-press-custom-apparel-printing-and-design", undefined),
    claimedAt: "2026-08-21",
    prospectId: "french-press-custom-apparel-printing-and-design",
    affiliationBasis:
      "Press and finishing crew. The yes on a supplier quote sits with the owner and the yes on a league slot did not.",
    note: "They printed their own shirts before the first ball and sent an invoice for nothing.",
  },
  [
    bowler("Spot Colour", "lead-off", own("right", 15, "The Squeegee", "reactive", "dull", true, { gritNumber: 2000 }), {
      ex: [13, 18],
    }),
    bowler("Flash Cure", "second", own("right", 14, "Buffed", "reactive", "shiny", false), { ex: [12, 19] }),
    bowler("Bleed Edge", "third", own("left", 15, "The Border", "urethane", "dull", true), { ex: [15, 16] }),
    bowler("Press Check", "fourth", house("right", 14), { ex: [11, 20] }),
    bowler("Last Pull", "anchor", own("right", 16, "Late Shift", "reactive", "not-sure", true, { core: "asymmetric" }), {
      captain: true,
      ex: [16, 15],
      whyHere: "Wanted one night a week the shop closes on time for.",
    }),
  ],
);

team(
  {
    id: "pp-03",
    leagueId: "pinfall-protocol",
    name: "Second Place Trophy",
    slot: 3,
    slotState: "confirmed",
    captainRole: "Sales manager",
    formation: formationOf("nettrophy-buena-park-plaque-and-trophy", undefined),
    claimedAt: "2026-08-25",
    prospectId: "nettrophy-buena-park-plaque-and-trophy",
    affiliationBasis: "The awards shop that would be quoting the medals for this season.",
    note: "Named themselves after the only trophy they intend to win, which they say is a supplier's job.",
  },
  [
    bowler("Engraved Plate", "lead-off", own("right", 14, "The Refill", "reactive", "shiny", true), {
      captain: true,
      ex: [14, 16],
      whyHere: "Quotes medals for half the youth leagues in the trade area and wanted to bowl in one.",
    }),
    bowler("Perpetual Cup", "second", house("right", 14), { ex: [12, 17] }),
    bowler("Rush Order", "third", house("left", 12), { ex: [11, 18] }),
    bowler("Presentation Box", "fourth", own("right", 15, "The Metric", "urethane", "dull", true), { ex: [15, 14] }),
    bowler("Blank Plaque", "anchor", own("right", 15, "Archive All", "reactive", "dull", true, { gritNumber: 3000 }), {
      ex: [13, 16],
      walkUp: "Something with no lyrics.",
    }),
  ],
);

team(
  {
    id: "pp-04",
    leagueId: "pinfall-protocol",
    name: "Patch Notes",
    slot: 4,
    slotState: "confirmed",
    captainRole: "Production supervisor",
    formation: formationOf("patchmade-llc", undefined),
    claimedAt: "2026-08-29",
    prospectId: "patchmade-llc",
    affiliationBasis: "One production shift, one team, and a second on the waiting list.",
  },
  [
    bowler("Clock Out", "lead-off", house("right", 15), { ex: [12, 17] }),
    bowler("Early Doors", "second", own("right", 14, "First In", "plastic", "shiny", false), { ex: [13, 15] }),
    bowler("Fire Drill", "third", house("right", 13), { ex: [10, 19] }),
    bowler("Overtime Optional", "fourth", own("left", 15, "Time And A Half", "reactive", "dull", true), {
      ex: [14, 15],
    }),
    bowler("Night Shift", "anchor", own("right", 16, "Graveyard", "reactive", "dull", true, { core: "asymmetric", gritNumber: 1500 }), {
      captain: true,
      ex: [15, 14],
      whyHere: "The only social thing on the calendar that a rotating shift can actually make.",
    }),
  ],
);

team(
  {
    id: "pp-05",
    leagueId: "pinfall-protocol",
    name: "Rolling Off The Press",
    slot: 5,
    slotState: "confirmed",
    captainRole: "Print shop foreman",
    formation: formationOf("norwalk-printing-and-graphics", undefined),
    claimedAt: "2026-09-01",
    prospectId: "norwalk-printing-and-graphics",
    affiliationBasis: "Bindery and delivery crew, who wanted a night that never moves.",
  },
  [
    bowler("Company Van", "lead-off", house("right", 15)),
    bowler("Loading Dock", "second", house("right", 16)),
    bowler("Trim Line", "third", own("right", 14, "Swipe", "plastic", "shiny", false)),
    bowler("Last Impression", "anchor", own("right", 16, "The Mains", "reactive", "dull", true), {
      captain: true,
      whyHere: "Wants a fixed night the crew cannot be talked out of.",
    }),
  ],
);

team(
  {
    id: "pp-06",
    leagueId: "pinfall-protocol",
    name: "Split Happens",
    slot: 6,
    slotState: "confirmed",
    captainRole: "Plant office manager",
    formation: formationOf("otafuku-foods-inc", undefined),
    claimedAt: "2026-09-02",
    prospectId: "otafuku-foods-inc",
    affiliationBasis: "Day shift from the plant office, who are finished by five on a Tuesday.",
  },
  [
    bowler("Big Four", "lead-off", house("right", 13)),
    bowler("Greek Church", "second", house("left", 12)),
    bowler("Bed Posts", "third", own("right", 14, "Seven Ten", "plastic", "shiny", true)),
    bowler("The Washout", "fourth", house("right", 14)),
    bowler("Baby Split", "anchor", own("right", 15, "The Gap", "reactive", "shiny", true), {
      captain: true,
      whyHere: "Named the team before anybody agreed to be on it.",
    }),
  ],
);

team(
  {
    id: "pp-07",
    leagueId: "pinfall-protocol",
    name: "The Handicap Heist",
    slot: 7,
    slotState: "confirmed",
    captainRole: "Sales manager",
    formation: formationOf("silver-spur-corporation", undefined),
    claimedAt: "2026-09-04",
    prospectId: "silver-spur-corporation",
    affiliationBasis: "Office and warehouse staff from one Irvine site.",
  },
  [
    bowler("Basis Points", "lead-off", own("right", 14, "The Spread", "urethane", "dull", true), {
      captain: true,
      whyHere: "Read the handicap formula before signing anything.",
    }),
    bowler("Vault Door", "second", house("right", 16)),
    bowler("Paper Trail", "third", house("left", 13)),
    bowler("Small Print", "anchor", own("right", 15, "Clause Nine", "reactive", "dull", true)),
  ],
);

team(
  {
    id: "pp-08",
    leagueId: "pinfall-protocol",
    name: "Turkey Squadron",
    slot: 8,
    slotState: "confirmed",
    captainRole: "Bakery production manager",
    formation: formationOf("porto-s-bakery-and-cafe", undefined),
    claimedAt: "2026-09-07",
    prospectId: "porto-s-bakery-and-cafe",
    affiliationBasis:
      "Production and counter teams, on the one evening the bakery can spare five people.",
  },
  [
    bowler("Turkey Trot", "lead-off", own("right", 15, "Three In A Row", "reactive", "dull", true), { ex: [18, 16] }),
    bowler("Six Pack Attack", "second", own("right", 15, "Half A Dozen", "reactive", "shiny", true, { gritNumber: 4000 }), {
      ex: [16, 18],
    }),
    bowler("Double Down", "third", own("left", 14, "Back To Back", "urethane", "dull", true), { ex: [15, 19] }),
    bowler("Front of House", "fourth", house("right", 13), { ex: [13, 21] }),
    bowler("Four Bagger", "anchor", own("right", 16, "The Fourth", "reactive", "dull", true, { core: "asymmetric", gritNumber: 2000 }), {
      captain: true,
      ex: [19, 15],
      walkUp: "Whatever the bakery radio is playing.",
      whyHere: "For the competition. Has bowled somewhere else before and will not say where.",
    }),
  ],
);

team(
  {
    id: "pp-09",
    leagueId: "pinfall-protocol",
    name: "Spare Parts Department",
    slot: 9,
    slotState: "held",
    captainRole: "Service department manager",
    formation: formationOf("lexus-of-cerritos", undefined),
    claimedAt: "2026-09-10",
    prospectId: "lexus-of-cerritos",
    affiliationBasis: "Service department, holding a place until a date exists.",
    note: "The same dealership that said no to a December party. The service drive said yes to a Tuesday, which is worth remembering when the holiday answer comes back.",
  },
  [
    bowler("Courtesy Shuttle", "lead-off", house("right", 15)),
    bowler("Oil Change", "second", house("right", 14)),
    bowler("Torque Wrench", "third", own("right", 16, "Foot Pounds", "reactive", "dull", true), {
      captain: true,
    }),
    bowler("Service Advisor", "anchor", own("left", 14, "The Upsell", "plastic", "shiny", false)),
  ],
);

team(
  {
    id: "pp-10",
    leagueId: "pinfall-protocol",
    name: "Gutter Instinct",
    slot: 10,
    slotState: "held",
    captainRole: "Team captain, unaffiliated",
    formation: formationOf(undefined, "captain-formed"),
    claimedAt: "2026-09-12",
    note: "Five friends, no employer between them. The kind of team a league brings in that nothing else on the board reaches.",
  },
  [
    bowler("Bumper Nostalgia", "lead-off", house("right", 12), {
      ex: [8, 17],
      whyHere: "Brought by a friend and has not thrown a ball since a birthday party.",
    }),
    bowler("Lucky Socks", "second", house("right", 13), { ex: [9, 16] }),
    bowler("Shoe Rental", "third", house("left", 12), { ex: [10, 15] }),
    bowler("Towel Snap", "fourth", house("right", 14), { ex: [11, 14] }),
    bowler("Gutter Therapy", "anchor", own("right", 14, "The Session", "plastic", "shiny", false), {
      captain: true,
      ex: [12, 15],
      walkUp: "Something everybody can shout the chorus of.",
      whyHere: "For the social night, and got four people to agree to six Tuesdays.",
    }),
  ],
);

team(
  {
    id: "pp-11",
    leagueId: "pinfall-protocol",
    name: "Pins of the Round Table",
    slot: 11,
    slotState: "held",
    captainRole: "Team captain, unaffiliated",
    formation: formationOf(undefined, "venue-formed"),
    claimedAt: "2026-09-15",
    note: "Five individual sign ups the house put together. Nobody on this roster knew anybody else on it in August.",
  },
  [
    bowler("Noticeboard Regular", "lead-off", house("right", 14), {
      ex: [12, 16],
      whyHere: "Signed up alone and asked to be put somewhere.",
    }),
    bowler("House Shot Hero", "second", own("right", 15, "The Freebie", "reactive", "shiny", true), { ex: [14, 15] }),
    bowler("Third Arrow", "third", own("right", 14, "Board Ten", "urethane", "dull", true), { ex: [13, 17] }),
    bowler("Board Count", "fourth", house("left", 13), { ex: [11, 18] }),
    bowler("Round Table Rules", "anchor", own("right", 15, "Equal Seats", "reactive", "dull", true), {
      captain: true,
      ex: [16, 14],
      whyHere: "Volunteered to captain a team of strangers and has kept all five of them.",
    }),
  ],
);

team(
  {
    id: "pp-12",
    leagueId: "pinfall-protocol",
    name: "Bowl Hard",
    slot: 12,
    slotState: "held",
    captainRole: "Team captain, unaffiliated",
    formation: formationOf(undefined, "captain-formed"),
    claimedAt: "2026-09-18",
    note: "Newest slot claimed in either league.",
  },
  [
    bowler("Cold Open", "lead-off", house("right", 15), { ex: [11, 15] }),
    bowler("Big Hook", "second", own("two-handed", 15, "Spin Cycle", "reactive", "dull", true, { core: "asymmetric" }), {
      ex: [13, 13],
      whyHere: "Two handed, self taught, and the only one on the team who has watched a tournament.",
    }),
    bowler("Axis Tilt", "third", own("right", 14, "Off Centre", "reactive", "shiny", true), { ex: [12, 15] }),
    bowler("Thumbless Wonder", "fourth", own("two-handed", 14, "No Thumb", "reactive", "dull", false), { ex: [10, 16] }),
    bowler("Hard Deck", "anchor", own("right", 16, "Floor It", "urethane", "dull", true), {
      captain: true,
      ex: [14, 13],
      walkUp: "One guitar, no words.",
    }),
  ],
);

// -------------------------------------------------------------
// Last Frame Standing. Thursday. All sixteen slots claimed.
// -------------------------------------------------------------

team(
  {
    id: "lfs-01",
    leagueId: "last-frame-standing",
    name: "Anchor Management",
    slot: 1,
    slotState: "confirmed",
    captainRole: "Membership director",
    formation: formationOf("norwalk-chamber-of-commerce", undefined),
    claimedAt: "2026-08-14",
    prospectId: "norwalk-chamber-of-commerce",
    affiliationBasis: "Members from four different chamber businesses, and the office that asked for this night to exist.",
    note: "First slot claimed anywhere on this board.",
  },
  [
    bowler("Second Coffee", "lead-off", house("right", 14), { ex: [12, 17] }),
    bowler("Standing Meeting", "second", own("right", 15, "The Callback", "reactive", "dull", true), {
      captain: true,
      ex: [14, 15],
      whyHere: "Asked for this night in writing before anybody had drawn a bracket.",
    }),
    bowler("Calendar Conflict", "third", house("left", 13), { ex: [11, 18] }),
    bowler("Quarterly Review", "fourth", own("right", 14, "Two Weeks", "urethane", "dull", true), { ex: [13, 16] }),
    bowler("Inbox Zero", "anchor", own("right", 15, "Day One", "reactive", "shiny", true, { gritNumber: 4000 }), {
      ex: [15, 14],
    }),
  ],
);

team(
  {
    id: "lfs-02",
    leagueId: "last-frame-standing",
    name: "Respawn Point",
    slot: 2,
    slotState: "confirmed",
    captainRole: "Shop floor supervisor",
    formation: formationOf("chalice-collectibles", undefined),
    claimedAt: "2026-08-16",
    prospectId: "chalice-collectibles",
    affiliationBasis: "A second team from the same shop, on a different night.",
  },
  [
    bowler("Insert Coin", "lead-off", own("right", 14, "One More Go", "reactive", "shiny", true), { ex: [15, 20] }),
    bowler("Extra Ball", "second", own("right", 15, "Nudge", "reactive", "dull", true), { ex: [16, 19] }),
    bowler("Side Quest", "third", house("left", 13), { ex: [14, 21] }),
    bowler("Fast Travel", "fourth", house("right", 14), { ex: [13, 22] }),
    bowler("Continue Screen", "anchor", own("right", 15, "Ten Nine Eight", "reactive", "dull", true, { core: "symmetric" }), {
      captain: true,
      ex: [18, 17],
      walkUp: "Eight seconds of a title screen.",
    }),
  ],
);

team(
  {
    id: "lfs-03",
    leagueId: "last-frame-standing",
    name: "The Night Shift Nine",
    slot: 3,
    slotState: "confirmed",
    captainRole: "Clinic operations manager",
    formation: formationOf("uci-health-lakewood", undefined),
    claimedAt: "2026-08-19",
    prospectId: "uci-health-lakewood",
    affiliationBasis: "The clinic, minus whoever is on call.",
  },
  [
    bowler("On Call", "lead-off", house("right", 12), { ex: [9, 15] }),
    bowler("Waiting Room", "second", house("right", 13), { ex: [10, 14] }),
    bowler("Triage Queue", "third", house("left", 12), { ex: [8, 16] }),
    bowler("Clipboard", "fourth", own("right", 14, "Good Chart", "plastic", "shiny", false), { ex: [11, 13] }),
    bowler("Solid Nine", "anchor", own("right", 15, "One Standing", "urethane", "dull", true), {
      captain: true,
      ex: [12, 14],
      whyHere: "Rota permitting, which is the whole story of this roster.",
    }),
  ],
);

team(
  {
    id: "lfs-04",
    leagueId: "last-frame-standing",
    name: "Open Box Special",
    slot: 4,
    slotState: "confirmed",
    captainRole: "Store manager",
    formation: formationOf("best-buy-cerritos", undefined),
    claimedAt: "2026-08-22",
    prospectId: "best-buy-cerritos",
    affiliationBasis: "Store crew. A chain unit, and the slot needed no region to approve it.",
  },
  [
    bowler("Price Match", "lead-off", own("right", 15, "Two Thirty Seconds", "reactive", "dull", true), { ex: [12, 11] }),
    bowler("Stock Count", "second", own("right", 15, "Zero Wobble", "reactive", "dull", true, { gritNumber: 2000 }), {
      captain: true,
      ex: [13, 10],
      whyHere: "For the competition, and put the entry in on the day it opened.",
    }),
    bowler("Click And Collect", "third", own("left", 14, "Thirty Two PSI", "urethane", "dull", true), { ex: [11, 12] }),
    bowler("Extended Warranty", "fourth", own("right", 15, "Straight True", "reactive", "shiny", true), { ex: [12, 12] }),
    bowler("Ringing Ten", "anchor", own("right", 16, "The Wobbler", "reactive", "dull", true, { core: "asymmetric" }), {
      ex: [14, 10],
      walkUp: "The one everybody groans at.",
    }),
  ],
);

team(
  {
    id: "lfs-05",
    leagueId: "last-frame-standing",
    name: "Lane Change Warning",
    slot: 5,
    slotState: "confirmed",
    captainRole: "Service drive manager",
    formation: formationOf("norm-reeves-honda-superstore-cerritos", undefined),
    claimedAt: "2026-08-24",
    prospectId: "norm-reeves-honda-superstore-cerritos",
    affiliationBasis: "Service drive and parts counter.",
  },
  [
    bowler("Blind Spot", "lead-off", own("right", 14, "Mirror Check", "reactive", "shiny", true), { ex: [15, 20] }),
    bowler("Test Drive", "second", house("right", 15), { ex: [14, 21] }),
    bowler("Parts Counter", "third", own("left", 15, "Back Order", "urethane", "dull", true), { ex: [16, 19] }),
    bowler("Trade In Value", "fourth", house("right", 14), { ex: [13, 22] }),
    bowler("Service Drive", "anchor", own("right", 16, "Courtesy Wash", "reactive", "dull", true, { gritNumber: 1500 }), {
      captain: true,
      ex: [17, 18],
    }),
  ],
);

team(
  {
    id: "lfs-06",
    leagueId: "last-frame-standing",
    name: "The Pin Drop Society",
    slot: 6,
    slotState: "confirmed",
    captainRole: "Director of sales",
    formation: formationOf("sheraton-cerritos-hotel", undefined),
    claimedAt: "2026-08-27",
    prospectId: "sheraton-cerritos-hotel",
    affiliationBasis:
      "Hotel front of house. The same relationship that refers group business, on a Thursday.",
  },
  [
    bowler("Front Desk", "lead-off", house("right", 14), { ex: [13, 16] }),
    bowler("Room Block", "second", own("right", 15, "Group Rate", "reactive", "shiny", true), { ex: [12, 18] }),
    bowler("Late Checkout", "third", own("right", 15, "Noon Plus Two", "reactive", "dull", true), {
      captain: true,
      ex: [15, 15],
      whyHere: "Refers group business already and wanted to see a league night from the other side of the counter.",
    }),
    bowler("Turndown Service", "fourth", house("left", 13), { ex: [11, 19] }),
    bowler("Messenger Pin", "anchor", own("right", 15, "The Courier", "urethane", "dull", true), { ex: [14, 16] }),
  ],
);

team(
  {
    id: "lfs-07",
    leagueId: "last-frame-standing",
    name: "Rolling in the Deep End",
    slot: 7,
    slotState: "confirmed",
    captainRole: "General manager",
    formation: formationOf("24-hour-fitness-lakewood-super-sport", undefined),
    claimedAt: "2026-08-30",
    prospectId: "24-hour-fitness-lakewood-super-sport",
    affiliationBasis: "Floor staff, on the one night the gym is quiet.",
  },
  [
    bowler("Leg Day", "lead-off", own("right", 16, "Squat Rack", "reactive", "dull", true), { ex: [12, 14] }),
    bowler("The Spotter", "second", house("right", 15), { ex: [11, 16] }),
    bowler("Rest Day", "third", house("right", 14), {
      captain: true,
      ex: [13, 14],
      whyHere: "For the social night, and mostly to stop the team talking about protein.",
    }),
    bowler("Personal Best", "fourth", own("left", 15, "The PB", "reactive", "shiny", true), { ex: [14, 13] }),
    bowler("Cool Down", "anchor", own("right", 14, "Stretch", "urethane", "dull", true), { ex: [10, 17] }),
  ],
);

team(
  {
    id: "lfs-08",
    leagueId: "last-frame-standing",
    name: "Split Ending",
    slot: 8,
    slotState: "confirmed",
    captainRole: "Production manager",
    formation: formationOf("superior-signs-and-graphics", undefined),
    claimedAt: "2026-09-01",
    prospectId: "superior-signs-and-graphics",
    affiliationBasis: "Production floor. Four of five, and looking.",
  },
  [
    bowler("Cut Line", "lead-off", house("right", 14)),
    bowler("Vinyl Wrap", "second", own("right", 15, "Full Colour", "reactive", "shiny", true), { captain: true }),
    bowler("Proof Copy", "third", house("left", 13)),
    bowler("Final Artwork", "anchor", own("right", 15, "Print Ready", "reactive", "dull", true)),
  ],
);

team(
  {
    id: "lfs-09",
    leagueId: "last-frame-standing",
    name: "Alley Cats After Dark",
    slot: 9,
    slotState: "confirmed",
    captainRole: "Restaurant operations manager",
    formation: formationOf("gen-restaurant-group-inc", undefined),
    claimedAt: "2026-09-03",
    prospectId: "gen-restaurant-group-inc",
    affiliationBasis:
      "Kitchen crew, who cannot start before seven on any night of the week.",
  },
  [
    bowler("Mise en Place", "lead-off", own("right", 14, "Everything Ready", "urethane", "dull", true)),
    bowler("Walk In", "second", house("right", 15)),
    bowler("Family Meal", "third", house("left", 13)),
    bowler("Last Cover", "anchor", own("right", 15, "Table Nine", "reactive", "dull", true), {
      captain: true,
      whyHere: "Picked the seven o'clock night because nothing earlier is possible.",
    }),
  ],
);

team(
  {
    id: "lfs-10",
    leagueId: "last-frame-standing",
    name: "The Spare Room",
    slot: 10,
    slotState: "confirmed",
    captainRole: "Shop owner",
    formation: formationOf("krazy-nick-s-games", undefined),
    claimedAt: "2026-09-05",
    prospectId: "krazy-nick-s-games",
    affiliationBasis: "The whole shop, which is four people.",
    note: "Smallest employer in either league and it fielded a team in one conversation at the counter.",
  },
  [
    bowler("Booster Pack", "lead-off", house("right", 12), {
      captain: true,
      whyHere: "Owns the shop and closed it early to sign the four of them up.",
    }),
    bowler("Sleeved Mint", "second", house("right", 13)),
    bowler("Foil Pull", "third", house("left", 12)),
    bowler("Shop Keys", "anchor", own("right", 14, "Last Out", "plastic", "shiny", false)),
  ],
);

team(
  {
    id: "lfs-11",
    leagueId: "last-frame-standing",
    name: "Frame Royale",
    slot: 11,
    slotState: "confirmed",
    captainRole: "Team captain, unaffiliated",
    formation: formationOf(undefined, "venue-formed"),
    claimedAt: "2026-09-06",
    note: "Five individual sign ups placed together by the house, and the only venue formed team to reach a cup semi final.",
  },
  [
    bowler("Loading Bar", "lead-off", house("right", 14), { ex: [12, 15] }),
    bowler("Local Co Op", "second", own("right", 15, "Player Two", "reactive", "shiny", true), { ex: [11, 16] }),
    bowler("Button Masher", "third", house("right", 15), { ex: [13, 14] }),
    bowler("Speedrun Split", "fourth", own("left", 14, "Any Percent", "reactive", "dull", true), { ex: [10, 17] }),
    bowler("Squad Wipe", "anchor", own("right", 15, "Full Reset", "reactive", "dull", true, { core: "symmetric" }), {
      captain: true,
      ex: [14, 14],
      whyHere: "Put a hand up to captain a team of strangers and now runs the group chat.",
    }),
  ],
);

team(
  {
    id: "lfs-12",
    leagueId: "last-frame-standing",
    name: "Loading Screen Legends",
    slot: 12,
    slotState: "held",
    captainRole: "Team captain, unaffiliated",
    formation: formationOf(undefined, "captain-formed"),
    claimedAt: "2026-09-09",
  },
  [
    bowler("Free Play Forever", "lead-off", house("right", 14)),
    bowler("High Score Panic", "second", house("right", 13)),
    bowler("Checkpoint Reached", "third", own("right", 15, "Autosave", "reactive", "shiny", true), { captain: true }),
    bowler("Tilt Warning", "anchor", own("left", 14, "Nudge Nudge", "urethane", "dull", true)),
  ],
);

team(
  {
    id: "lfs-13",
    leagueId: "last-frame-standing",
    name: "Sudden Death Overtime",
    slot: 13,
    slotState: "held",
    captainRole: "Team captain, unaffiliated",
    formation: formationOf(undefined, "captain-formed"),
    claimedAt: "2026-09-11",
  },
  [
    bowler("Coin Toss", "lead-off", house("right", 15)),
    bowler("Stoppage Time", "second", house("right", 14)),
    bowler("Golden Frame", "third", own("right", 15, "Extra Time", "reactive", "dull", true), { captain: true }),
    bowler("Final Whistle", "anchor", own("right", 15, "Full Time", "reactive", "shiny", true)),
  ],
);

team(
  {
    id: "lfs-14",
    leagueId: "last-frame-standing",
    name: "Bumpers Optional",
    slot: 14,
    slotState: "held",
    captainRole: "Team captain, unaffiliated",
    formation: formationOf(undefined, "venue-formed"),
    claimedAt: "2026-09-14",
  },
  [
    bowler("Ball Return", "lead-off", house("right", 13)),
    bowler("Two Ball Tote", "second", own("right", 14, "The Wheelie", "plastic", "shiny", true), { captain: true }),
    bowler("Approach Dot", "anchor", house("left", 12)),
  ],
);

team(
  {
    id: "lfs-15",
    leagueId: "last-frame-standing",
    name: "Pins Reaper",
    slot: 15,
    slotState: "held",
    captainRole: "Team captain, unaffiliated",
    formation: formationOf(undefined, "venue-formed"),
    claimedAt: "2026-09-17",
  },
  [
    bowler("The Deadwood", "lead-off", house("right", 15), { captain: true }),
    bowler("Sweeper Bar", "second", house("right", 14)),
    bowler("Rack Attack", "anchor", own("right", 15, "Full Rack", "reactive", "dull", true)),
  ],
);

team(
  {
    id: "lfs-16",
    leagueId: "last-frame-standing",
    name: "Gutterlings",
    slot: 16,
    slotState: "held",
    captainRole: "Team captain, unaffiliated",
    formation: formationOf(undefined, "venue-formed"),
    claimedAt: "2026-09-20",
    note: "Three bowlers holding a slot for five. The reason this league is open to individuals and shut to teams.",
  },
  [
    bowler("Foul Light", "lead-off", house("right", 12), {
      captain: true,
      whyHere: "Signed up alone, agreed to captain, and is still two bodies short.",
    }),
    bowler("Rosin Bag", "second", house("right", 13)),
    bowler("Tape Job", "anchor", own("right", 14, "Half A Piece", "plastic", "shiny", false)),
  ],
);

// ---------------------------------------------------------------
// The two derived collections
// ---------------------------------------------------------------

/**
 * The teams, both leagues, twenty eight of them.
 *
 * Slot numbers are the position in the field of sixteen and they are not
 * the ladder rank. A slot is where a team sits in the draw; the rank is
 * derived at render from how ready that team is to play. Keeping the two
 * separate is what lets the ladder reorder itself when one more bowler
 * signs up, without anybody editing a number in this file.
 *
 * `bowlersCommitted` and `positionsFilled` are computed from the roster
 * here rather than typed above, so there is exactly one place that knows
 * how many bowlers a team has and it is the list of handles.
 */
export const LEAGUE_TEAMS: LeagueTeam[] = TEAM_SEEDS.map((seed) => {
  const filled = new Set(seed.roster.map((b) => b.position));
  const { roster: _roster, ...team } = seed;
  return {
    ...team,
    bowlersCommitted: seed.roster.length,
    positionsFilled: POSITION_ORDER.filter((p) => filled.has(p)),
  };
});

export const LEAGUE_TEAM_BY_ID: Record<string, LeagueTeam> = Object.fromEntries(
  LEAGUE_TEAMS.map((t) => [t.id, t]),
);

/**
 * Every bowler on every roster, as a handle and a position.
 *
 * The average on each is the not established arm and it stays that way
 * until a league night is bowled. That is not a placeholder for a number
 * this file could not think of: it is the state the sport's own governing
 * body puts a bowler in when they have no prior average, and it is
 * re-rated from real games rather than assigned. Nothing here is a
 * competitive record and no screen can turn it into one.
 */
export const LEAGUE_BOWLERS: Bowler[] = TEAM_SEEDS.flatMap((seed) =>
  seed.roster.map<Bowler>((b) => ({
    handle: b.handle,
    teamId: seed.id,
    position: b.position,
    isCaptain: b.captain === true,
    joinedAt: b.joinedAt ?? seed.claimedAt,
    ball: b.ball,
    whyHere: b.whyHere,
    walkUp: b.walkUp,
    average: {
      kind: "not-established",
      gamesBowled: 0,
      gamesRequired: ESTABLISHED_AVERAGE_GAMES,
      because:
        "Nobody has bowled a competitive game under this proposal. A cup night is Baker scored, where five bowlers share one game, so it establishes a team score and never a personal average.",
    },
    exhibition: b.ex
      ? {
          strikes: b.ex[0],
          sparesConverted: b.ex[1],
          label: "Simulated exhibition",
          provenance: "illustrative",
        }
      : null,
    provenance: "illustrative",
  })),
);
