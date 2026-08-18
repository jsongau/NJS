/**
 * PROOF PASS FOR THE CUP AND LEAGUE SEED.
 *
 * A bracket is the easiest thing in software to make look impressive and
 * the hardest to make correct. Every failure mode below is one that
 * renders perfectly: a fixture whose loser goes nowhere, a round in which
 * the same team is drawn twice, a seeding that does not sum to seventeen,
 * a lane count that quietly says fourteen when the format promised
 * sixteen. None of them throws. All of them are wrong.
 *
 * This is kept rather than deleted because the seed will be edited again.
 * Change one result in `data/cup.ts` and the seeding moves, which moves
 * the round of sixteen pairings, which can break the sum to seventeen
 * rule without anything on screen looking different. Run this after any
 * edit to the seed.
 *
 *   npx tsx --tsconfig tsconfig.app.json scripts/proof-cup.ts
 */
import {
  CUPS,
  CUP_ENTRIES,
  CUP_FIXTURES,
  CUP_FIXTURE_BY_ID,
  CUP_ROUNDS,
  CUP_ROUND_BY_ID,
} from "../src/data/cup";
import { LEAGUES, LEAGUE_BOWLERS, LEAGUE_TEAMS, LEAGUE_TEAM_BY_ID } from "../src/data/leagues";
import { LANES_PER_CUP_MATCH, roundLanes, seededPairs } from "../src/domain/cup";
import {
  cupLadder,
  currentCup,
  nightsFor,
  seedingFor,
  shapeOf,
  taleOfTheTape,
} from "../src/domain/selectors/cup";
import { captainOf, rosterFor } from "../src/domain/selectors/leagues";

let failures = 0;
let checks = 0;

function ok(condition: boolean, label: string, detail = ""): void {
  checks += 1;
  if (condition) return;
  failures += 1;
  console.error(`FAIL  ${label}${detail ? `: ${detail}` : ""}`);
}

function section(name: string): void {
  console.log(`\n${name}`);
}

const cup = currentCup();
const rounds = CUP_ROUNDS.filter((r) => r.cupId === cup.id);
const fixtures = CUP_FIXTURES.filter((f) => f.cupId === cup.id);

// ---------------------------------------------------------------
section("1. Every fixture resolves to two teams or declares where they come from");
// ---------------------------------------------------------------

for (const f of fixtures) {
  if (f.state === "bye") {
    const named = f.sides.filter((s) => s.teamId).length;
    ok(named === 1, `${f.id} bye names exactly one team`, `named ${named}`);
    continue;
  }
  f.sides.forEach((s, i) => {
    if (s.teamId) {
      ok(
        Boolean(LEAGUE_TEAM_BY_ID[s.teamId]),
        `${f.id} side ${i} names a team that exists`,
        s.teamId,
      );
      return;
    }
    ok(Boolean(s.source), `${f.id} side ${i} has a team or a source`);
    if (!s.source) return;
    ok(s.source.rule.length > 0, `${f.id} side ${i} source states its rule`);
    ok(
      s.source.fixtureIds.length > 0,
      `${f.id} side ${i} source names at least one fixture`,
    );
    for (const id of s.source.fixtureIds) {
      ok(Boolean(CUP_FIXTURE_BY_ID[id]), `${f.id} source fixture exists`, id);
    }
  });
  if (f.result) {
    ok(
      f.sides.every((s) => Boolean(s.teamId)),
      `${f.id} has a result and two named teams`,
    );
    ok(f.state === "final", `${f.id} has a result and reads as final`, f.state);
  } else {
    ok(f.state !== "final", `${f.id} reads final only with a result`, f.state);
  }
}

// ---------------------------------------------------------------
section("2. No team appears twice in a round, or twice on a night");
// ---------------------------------------------------------------

for (const round of rounds) {
  const seen = new Map<string, string>();
  for (const f of fixtures.filter((x) => x.roundId === round.id)) {
    for (const s of f.sides) {
      if (!s.teamId) continue;
      ok(
        !seen.has(s.teamId),
        `${round.id} draws ${s.teamId} once`,
        `also in ${seen.get(s.teamId)}`,
      );
      seen.set(s.teamId, f.id);
    }
  }
}

for (let night = 1; night <= cup.nightDates.length; night += 1) {
  const ids = new Set(rounds.filter((r) => r.night === night).map((r) => r.id));
  const seen = new Map<string, string>();
  for (const f of fixtures.filter((x) => ids.has(x.roundId))) {
    for (const s of f.sides) {
      if (!s.teamId) continue;
      ok(
        !seen.has(s.teamId),
        `night ${night} bowls ${s.teamId} once`,
        `also in ${seen.get(s.teamId)}`,
      );
      seen.set(s.teamId, f.id);
    }
  }
}

// ---------------------------------------------------------------
section("3. Losers of every Cup round reach another competition");
// ---------------------------------------------------------------

/* Loser edges come from both directions. A fixture can state where its
   loser goes, and a destination can state which fixtures its empty side
   comes out of. The stepladder rung filled by "the beaten semi finalist
   carrying the better seed" only exists in the second form, because one
   fixture there has two possible destinations. */
const loserEdges = new Map<string, Set<string>>();
const addLoser = (from: string, to: string) => {
  const set = loserEdges.get(from) ?? new Set<string>();
  set.add(to);
  loserEdges.set(from, set);
};
for (const f of fixtures) {
  if (f.loserTo) addLoser(f.id, f.loserTo.fixtureId);
  for (const s of f.sides) {
    if (!s.source) continue;
    if (s.source.take !== "loser" && s.source.take !== "higher-seed-loser") continue;
    for (const src of s.source.fixtureIds) addLoser(src, f.id);
  }
}

for (const round of rounds.filter((r) => r.branch === "cup")) {
  for (const f of fixtures.filter((x) => x.roundId === round.id)) {
    const dests = [...(loserEdges.get(f.id) ?? [])];
    ok(dests.length > 0, `${f.id} sends its loser somewhere`);
    for (const d of dests) {
      const branch = CUP_ROUND_BY_ID[CUP_FIXTURE_BY_ID[d].roundId].branch;
      ok(
        branch !== "cup",
        `${f.id} loser lands outside the Cup bracket`,
        `landed in ${branch}`,
      );
    }
  }
}

/* Every slot the Plate offers is filled by exactly one Cup fixture, so
   nobody is drawn twice and no seat is left empty. */
const plateSlots = new Map<string, number>();
for (const f of fixtures) {
  if (!f.loserTo) continue;
  const key = `${f.loserTo.fixtureId}:${f.loserTo.slot}`;
  plateSlots.set(key, (plateSlots.get(key) ?? 0) + 1);
}
for (const [key, count] of plateSlots) {
  ok(count === 1, `advancement slot ${key} is filled once`, `filled ${count} times`);
}

// ---------------------------------------------------------------
section("4. The advancement graph has no cycles");
// ---------------------------------------------------------------

const forward = new Map<string, Set<string>>();
const addForward = (from: string, to: string) => {
  const set = forward.get(from) ?? new Set<string>();
  set.add(to);
  forward.set(from, set);
};
for (const f of fixtures) {
  if (f.winnerTo) addForward(f.id, f.winnerTo.fixtureId);
  if (f.loserTo) addForward(f.id, f.loserTo.fixtureId);
  for (const s of f.sides) {
    if (!s.source) continue;
    for (const src of s.source.fixtureIds) addForward(src, f.id);
  }
}

const WHITE = 0;
const GREY = 1;
const BLACK = 2;
const colour = new Map<string, number>();
let cycle: string | null = null;

function visit(id: string, trail: string[]): void {
  if (cycle) return;
  const c = colour.get(id) ?? WHITE;
  if (c === GREY) {
    cycle = [...trail, id].join(" then ");
    return;
  }
  if (c === BLACK) return;
  colour.set(id, GREY);
  for (const next of forward.get(id) ?? []) visit(next, [...trail, id]);
  colour.set(id, BLACK);
}

for (const f of fixtures) visit(f.id, []);
ok(cycle === null, "advancement graph is acyclic", cycle ?? "");

/* An edge never runs backwards in time either, which is the property a
   cycle check alone would not catch: a fixture on night five feeding one
   on night four is acyclic and still impossible.
   The one place an edge may stay inside a night is a sequential round.
   A stepladder bowls its three rungs one after another on the same pair
   on the same evening, so rung one feeding rung two is correct there and
   nowhere else. */
for (const [from, tos] of forward) {
  const fromRound = CUP_ROUND_BY_ID[CUP_FIXTURE_BY_ID[from].roundId];
  for (const to of tos) {
    const toRound = CUP_ROUND_BY_ID[CUP_FIXTURE_BY_ID[to].roundId];
    const sameSequentialRound =
      fromRound.id === toRound.id && fromRound.sequential === true;
    ok(
      toRound.night > fromRound.night || sameSequentialRound,
      `${from} feeds a later night, or a later rung of the same sequence`,
      `${fromRound.night} feeds ${toRound.night}`,
    );
    if (sameSequentialRound) {
      ok(
        CUP_FIXTURE_BY_ID[to].number > CUP_FIXTURE_BY_ID[from].number,
        `${from} feeds a later rung of its own stepladder`,
      );
    }
  }
}

// ---------------------------------------------------------------
section("5. Every handle is unique");
// ---------------------------------------------------------------

const handles = new Map<string, string>();
for (const b of LEAGUE_BOWLERS) {
  ok(!handles.has(b.handle), `handle "${b.handle}" is unique`, `also on ${handles.get(b.handle)}`);
  handles.set(b.handle, b.teamId);
}
ok(LEAGUE_BOWLERS.length === handles.size, "handle count equals bowler count");

const slugs = new Map<string, string>();
for (const b of LEAGUE_BOWLERS) {
  const slug = b.handle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  ok(!slugs.has(slug), `route slug "${slug}" is unique`, `also ${slugs.get(slug)}`);
  slugs.set(slug, b.handle);
}

// ---------------------------------------------------------------
section("6. No handle reads as a person's name");
// ---------------------------------------------------------------

/* The rule this application has kept everywhere is that it never invents
   a person. A handle is safe because nobody reads "Gutter Therapy" and
   believes a specific human is described. The failure mode is a handle
   that drifts into looking like one, so the check is mechanical: no
   given name, no family name, no honorific, no lone initial, and never a
   single bare word that could be read as somebody being introduced. */
const GIVEN_NAMES = new Set(
  ("aaron adam alan albert alex alexander alice amanda amy andrew angela ann anna anthony arthur ashley barbara ben benjamin betty beverly bill bob bobby brandon brenda brian bruce bryan carl carol carolyn catherine charles cheryl chris christina christine christopher cindy clarence craig crystal cynthia dale daniel danny david dawn dean debbie deborah debra denise dennis diana diane don donald donna doris dorothy douglas earl edward eileen elaine eleanor elizabeth ellen emily emma eric ernest ethel eugene evelyn frances francis frank fred frederick gary george gerald gloria grace greg gregory harold harry heather helen henry herbert holly howard irene jack jackie jacob james jamie jane janet janice jason jean jeff jeffrey jennifer jeremy jerry jesse jessica jill jim jimmy joan joann joe joel john johnny jon jonathan jordan jose joseph joshua joyce juan judith judy julia julie justin karen katherine kathleen kathryn kathy keith kelly ken kenneth kevin kim kimberly kyle larry laura lauren lawrence lee leonard leslie lillian linda lisa lois lori louis louise lucille luis marc margaret maria marie marilyn marion mark marsha martha martin marvin mary matthew maureen megan melissa michael michelle mike mildred nancy natalie nathan neil nicholas nicole norma norman pamela pat patricia patrick paul paula pauline pearl peggy peter philip phillip phyllis rachel ralph randall randy ray raymond rebecca regina rene rhonda richard rick ricky rita rob robert roberta robin rodney roger ron ronald rose rosemary roy ruby russell ruth ryan sally samuel sandra sara sarah scott sean shannon sharon shawn sheila shirley stanley stephanie stephen steve steven sue susan suzanne sylvia tammy tara ted teresa terry theresa thomas tim timothy tina todd tom tommy tony tracy travis troy valerie vera vernon veronica vicki victor victoria vincent virginia walter wanda warren wayne wendy wesley william willie yvonne zachary")
    .split(" "),
);
const FAMILY_NAMES = new Set(
  ("adams allen anderson bailey baker barnes bell bennett brooks brown bryant butler campbell carter clark coleman collins cook cooper cox davis diaz edwards evans flores foster garcia gonzalez gray green griffin hall harris hayes henderson hernandez hill howard hughes jackson james jenkins johnson jones kelly king lee lewis lopez martin martinez miller mitchell moore morgan morris murphy myers nelson nguyen parker patterson perez perry peterson phillips powell price ramirez reed richardson rivera roberts robinson rodriguez rogers ross russell sanchez sanders scott simmons smith stewart sullivan taylor thomas thompson torres turner walker ward washington watson white williams wilson wood wright young")
    .split(" "),
);
const HONORIFICS = /\b(mr|mrs|ms|miss|dr|prof|sir|rev|fr|sgt|capt)\b/i;

for (const b of LEAGUE_BOWLERS) {
  const words = b.handle.split(/\s+/);
  ok(words.length >= 2, `handle "${b.handle}" is more than one word`);
  ok(!HONORIFICS.test(b.handle), `handle "${b.handle}" carries no honorific`);
  ok(
    !/\b[A-Z]\.(\s|$)/.test(b.handle),
    `handle "${b.handle}" carries no initial`,
  );
  for (const w of words) {
    const bare = w.toLowerCase().replace(/[^a-z]/g, "");
    ok(!GIVEN_NAMES.has(bare), `handle "${b.handle}" uses no given name`, bare);
    ok(!FAMILY_NAMES.has(bare), `handle "${b.handle}" uses no family name`, bare);
  }
}

/* There is nowhere on the type to put a real name, which is the stronger
   guarantee, so assert the shape rather than trusting the seed. */
for (const b of LEAGUE_BOWLERS) {
  const keys = Object.keys(b);
  for (const banned of ["name", "firstName", "lastName", "surname", "initials"]) {
    ok(!keys.includes(banned), `bowler carries no ${banned} field`, b.handle);
  }
}

// ---------------------------------------------------------------
section("7. Every team has exactly one captain and a coherent roster");
// ---------------------------------------------------------------

for (const t of LEAGUE_TEAMS) {
  const roster = rosterFor(t.id);
  const captains = roster.filter((b) => b.isCaptain);
  ok(captains.length === 1, `${t.id} has exactly one captain`, `has ${captains.length}`);
  ok(Boolean(captainOf(t.id)), `${t.id} resolves a captain`);
  ok(t.captainRole.length > 0, `${t.id} names the captain's job`);

  ok(
    roster.length === t.bowlersCommitted,
    `${t.id} roster length matches the committed count`,
    `${roster.length} against ${t.bowlersCommitted}`,
  );
  const league = LEAGUES.find((l) => l.id === t.leagueId);
  ok(Boolean(league), `${t.id} belongs to a league that exists`);
  if (league) {
    ok(
      roster.length <= league.teamSize,
      `${t.id} roster is not over the team size`,
      `${roster.length} of ${league.teamSize}`,
    );
  }
  const positions = new Set(roster.map((b) => b.position));
  ok(
    positions.size === roster.length,
    `${t.id} fills each position once`,
    [...positions].join(", "),
  );
  ok(
    t.positionsFilled.length === positions.size,
    `${t.id} positions filled matches the roster`,
  );

  const expected = t.prospectId ? "organisation-formed" : t.formation;
  ok(
    t.formation === expected,
    `${t.id} route in agrees with its organisation join`,
    t.formation,
  );
  if (t.prospectId) {
    ok(
      t.formation === "organisation-formed",
      `${t.id} with an organisation is organisation formed`,
    );
  } else {
    ok(
      t.formation !== "organisation-formed",
      `${t.id} without an organisation is not organisation formed`,
    );
  }
}

// ---------------------------------------------------------------
section("8. Lane nights match the arithmetic the format promises");
// ---------------------------------------------------------------

const shape = shapeOf(cup);
const nights = nightsFor(cup);

ok(cup.fieldSize === 16, "the field is sixteen", String(cup.fieldSize));
ok(cup.nightDates.length === 6, "the cup is six nights", String(cup.nightDates.length));
ok(shape.bowlers === 80, "eighty bowlers are in the building", String(shape.bowlers));

for (const n of nights) {
  ok(n.lanes === 16, `night ${n.night} occupies sixteen lanes`, String(n.lanes));
  ok(n.teams === 16, `night ${n.night} puts sixteen teams on the lanes`, String(n.teams));
}
ok(shape.laneNights === 96, "the cup commits ninety six lane nights", String(shape.laneNights));
ok(shape.peakLanes === 16, "the busiest night is sixteen lanes", String(shape.peakLanes));

/* The finals night is the one the whole format argues about, so it gets
   its own reading. Single elimination would put two teams on two lanes
   here. This is two lanes of stepladder, two of Plate final and twelve
   of sweeper. */
const finals = nights[nights.length - 1];
ok(finals.lanes === 16, "finals night occupies sixteen lanes, not two", String(finals.lanes));
ok(finals.teams === 16, "finals night bowls all sixteen teams", String(finals.teams));

for (const round of rounds) {
  const count = fixtures.filter((f) => f.roundId === round.id).length;
  const lanes = roundLanes(round, count);
  if (round.kind === "head-to-head" && !round.sequential) {
    ok(
      lanes === count * LANES_PER_CUP_MATCH,
      `${round.id} takes two lanes a match`,
      String(lanes),
    );
  }
  for (const f of fixtures.filter((x) => x.roundId === round.id)) {
    ok(f.lanes[1] === f.lanes[0] + 1, `${f.id} bowls across a pair`, f.lanes.join(" and "));
  }
}

// ---------------------------------------------------------------
section("9. Seeding is earned, and the bracket draw follows from it");
// ---------------------------------------------------------------

const seeding = seedingFor(cup);
ok(seeding.length === 16, "sixteen teams are seeded", String(seeding.length));
ok(
  seeding.every((r, i) => r.seed === i + 1),
  "seeds run one to sixteen with no gaps",
);
for (let i = 1; i < seeding.length; i += 1) {
  const a = seeding[i - 1];
  const b = seeding[i];
  ok(
    a.won > b.won || (a.won === b.won && a.pinsPerGame >= b.pinsPerGame),
    `seed ${a.seed} outranks seed ${b.seed} on record then pins per game`,
  );
}

const seedById = new Map(seeding.map((r) => [r.team.id, r.seed]));
const r16 = rounds.find((r) => r.branch === "cup" && r.depth === 1);
if (r16) {
  const drawn = fixtures
    .filter((f) => f.roundId === r16.id)
    .sort((a, b) => a.number - b.number)
    .map((f) => f.sides.map((s) => seedById.get(s.teamId ?? "") ?? 0) as [number, number]);
  const expected = seededPairs(16);
  drawn.forEach((pair, i) => {
    ok(
      pair[0] + pair[1] === 17,
      `round of sixteen match ${i + 1} pairs to seventeen`,
      pair.join(" against "),
    );
    ok(
      pair[0] === expected[i][0] && pair[1] === expected[i][1],
      `round of sixteen match ${i + 1} sits in bracket order`,
      `${pair.join(" against ")} where ${expected[i].join(" against ")} was expected`,
    );
  });
}

// ---------------------------------------------------------------
section("10. Entries, rosters and exhibition figures agree with each other");
// ---------------------------------------------------------------

for (const c of CUPS) {
  const entries = CUP_ENTRIES.filter((e) => e.cupId === c.id);
  ok(entries.length <= c.fieldSize, `${c.id} field is not oversubscribed`, String(entries.length));
  const ids = new Set<string>();
  for (const e of entries) {
    ok(Boolean(LEAGUE_TEAM_BY_ID[e.teamId]), `${c.id} entry names a real team`, e.teamId);
    ok(!ids.has(e.teamId), `${c.id} enters ${e.teamId} once`);
    ids.add(e.teamId);
  }
  if (c.state === "exhibition") {
    ok(entries.length === c.fieldSize, `${c.id} field is full`, String(entries.length));
    for (const e of entries) {
      const roster = rosterFor(e.teamId);
      ok(
        roster.length === c.teamSize,
        `${e.teamId} fields five for a Baker game`,
        String(roster.length),
      );
    }
  }
  ok(
    c.registrationFeeProvenance === "illustrative",
    `${c.id} fee is badged illustrative`,
  );
}

/* Every bowler in the cup field is credited with frames the team really
   bowled, and no bowler has more marked frames than frames. */
for (const row of cupLadder(cup)) {
  const frames = row.games * 2;
  for (const b of rosterFor(row.team.id)) {
    ok(b.exhibition !== null, `${b.handle} has exhibition figures`, row.team.id);
    if (!b.exhibition) continue;
    ok(
      b.exhibition.strikes + b.exhibition.sparesConverted <= frames,
      `${b.handle} marks no more frames than bowled`,
      `${b.exhibition.strikes + b.exhibition.sparesConverted} of ${frames}`,
    );
    ok(
      b.exhibition.label === "Simulated exhibition",
      `${b.handle} figures carry the simulated label`,
    );
  }
  ok(
    row.team.bowlersCommitted * 2 * row.games === frames * 5,
    `${row.team.id} frames divide evenly across five bowlers`,
  );
}

/* No bowler anywhere has an established average, because nothing has
   been bowled. This is the assertion that stops a screen inventing one. */
for (const b of LEAGUE_BOWLERS) {
  ok(
    b.average.kind === "not-established",
    `${b.handle} has no established average`,
    b.average.kind,
  );
  if (b.average.kind === "not-established") {
    ok(
      b.average.gamesRequired > 0,
      `${b.handle} prints the threshold with the state`,
    );
  }
}

/* Every settled result carries the word simulated with the number. */
for (const f of fixtures) {
  if (!f.result) continue;
  ok(f.result.label === "Simulated exhibition", `${f.id} result is labelled`);
  ok(f.result.provenance === "illustrative", `${f.id} result is badged illustrative`);
  const [a, b] = f.result.gamesWon;
  const best = CUP_ROUND_BY_ID[f.roundId].bestOf ?? 5;
  const needed = Math.floor(best / 2) + 1;
  ok(Math.max(a, b) === needed, `${f.id} was won with the right game count`, `${a} to ${b}`);
  ok(Math.min(a, b) < needed, `${f.id} has one winner`, `${a} to ${b}`);
}

// ---------------------------------------------------------------
section("11. The tale of the tape renders without arithmetic downstream");
// ---------------------------------------------------------------

const top = cupLadder(cup);
const tape = taleOfTheTape(cup.id, top[0].team.id, top[1].team.id);
ok(tape !== null, "a tale of the tape can be built for the top two");
if (tape) {
  ok(tape.rows.length === 12, "the tape carries twelve rows", String(tape.rows.length));
  ok(tape.decider.key.length > 0, "the tape names a decider");
  ok(tape.headToHead.sentence.length > 0, "the head to head is a sentence");
  for (const r of tape.rows) {
    ok(r.a.length > 0 && r.b.length > 0, `tape row ${r.key} prints both sides`);
    ok(r.directionLabel.length > 0, `tape row ${r.key} prints its direction`);
    if (r.direction === "none") {
      ok(r.edge === "level", `tape row ${r.key} claims no edge without a direction`);
    }
    if (r.aValue !== null && r.bValue !== null && r.direction !== "none") {
      const expected =
        r.aValue === r.bValue
          ? "level"
          : (r.direction === "higher" ? r.aValue > r.bValue : r.aValue < r.bValue)
            ? "a"
            : "b";
      ok(r.edge === expected, `tape row ${r.key} marks the right side`, r.edge);
    }
  }
  const weightRow = tape.rows.find((r) => /weight|height|reach/i.test(r.label));
  ok(!weightRow, "the tape carries no body measurement and no ball weight");
}

// ---------------------------------------------------------------
section("12. No forbidden glyph reaches a human readable string");
// ---------------------------------------------------------------

/* Written as escapes rather than as the characters themselves, so that a
   grep of this repository for a forbidden glyph does not match the one
   file whose job is to find them. */
const FORBIDDEN = new RegExp(
  "[\\u2012\\u2013\\u2014\\u2015\\u2190\\u2191\\u2192\\u2193\\u21d0\\u21d2\\u27f5\\u27f6\\u2794\\u279c]",
);
const strings: Array<[string, string]> = [];
const collect = (label: string, value: unknown): void => {
  if (typeof value === "string") strings.push([label, value]);
  else if (Array.isArray(value)) value.forEach((v, i) => collect(`${label}[${i}]`, v));
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) collect(`${label}.${k}`, v);
  }
};
collect("CUPS", CUPS);
collect("CUP_ROUNDS", CUP_ROUNDS);
collect("CUP_FIXTURES", CUP_FIXTURES);
collect("LEAGUES", LEAGUES);
collect("LEAGUE_TEAMS", LEAGUE_TEAMS);
collect("LEAGUE_BOWLERS", LEAGUE_BOWLERS);
for (const [label, value] of strings) {
  ok(!FORBIDDEN.test(value), `${label} carries no dash or arrow glyph`, value.slice(0, 60));
}

// ---------------------------------------------------------------

console.log(`\n${checks - failures} of ${checks} checks passed.`);
if (failures > 0) {
  console.error(`${failures} FAILED.`);
  process.exit(1);
}
console.log("Seed is sound.");
