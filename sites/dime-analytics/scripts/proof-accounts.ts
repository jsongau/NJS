/**
 * PROOF PASS FOR THE ACCOUNT SEED AND THE REBOOKING ARITHMETIC.
 *
 * Every failure mode below renders perfectly. A buying window that
 * silently parses to nothing shows an account with no occasions and
 * looks tidy. A window whose open date has drifted past its close date
 * draws a bar the wrong way round and reads as a design choice. A rate
 * with a zero denominator prints "NaN%" or, far worse, "0%", which is a
 * sentence about missing every window somebody never had. None of them
 * throws. All of them are wrong, and one of them is a lie.
 *
 * This is kept rather than deleted because the seed will be edited
 * again. Change a `buyingWindow` string in `data/prospects.ts` or an
 * `eventDate` in `data/book.ts` and every window and every trace on the
 * board moves, and the December conflict this board exists to surface
 * can vanish without anything on screen looking different. Run this
 * after any edit to either seed.
 *
 *   npx tsx --tsconfig tsconfig.app.json scripts/proof-accounts.ts
 *
 * It is excluded from tsconfig.node.json for the same reason
 * proof-cup.ts is: it imports application source, that project has no
 * jsx setting, and pulling app source into it turns `tsc -b` red for a
 * reason that has nothing to do with the application.
 */
import {
  MID_MONTH_DAY,
  OVERDUE_RATIO,
  SEGMENT_ORDER,
  SEGMENT_PROFILE,
  TRACE_OFFSET_DAYS,
  TRACE_ORDER,
  addDays,
  cycleStateOf,
  declaredCycleDays,
  figureOf,
  isoOf,
  parseBuyingWindow,
} from "../src/domain/accounts";
import type { CycleState } from "../src/domain/accounts";
import {
  accountBoard,
  accountMetrics,
  accountRows,
  buyingWindowAudit,
  clockRows,
  windowConflicts,
} from "../src/domain/selectors/accounts";
import { PROSPECTS } from "../src/data/prospects";
import { ACCOUNTS } from "../src/data/accounts";
import { SEED_BOOK } from "../src/data/book";

/* The clock the research ran its dates against. Everything the board
   claims about today is claimed against this instant and no other. */
const AS_OF = "2026-08-14";

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

// ---------------------------------------------------------------
section("1. Every buying window in the trade area parses or says why not");
// ---------------------------------------------------------------

let parsed = 0;
let unparseable = 0;
let threw = 0;

for (const prospect of PROSPECTS) {
  let outcome: ReturnType<typeof parseBuyingWindow> | null = null;
  try {
    outcome = parseBuyingWindow(prospect.buyingWindow, {
      occasionNoun: "Occasion",
    });
  } catch (error) {
    threw += 1;
    ok(false, `${prospect.id} threw on its buying window`, String(error));
    continue;
  }
  if (outcome.kind === "parsed") {
    parsed += 1;
    ok(
      outcome.occasions.length > 0,
      `${prospect.id} parsed to at least one occasion`,
    );
    for (const occasion of outcome.occasions) {
      ok(
        occasion.anchorMonth >= 1 && occasion.anchorMonth <= 12,
        `${prospect.id} occasion anchors in a real month`,
        String(occasion.anchorMonth),
      );
      ok(
        occasion.label.trim().length > 0,
        `${prospect.id} occasion carries a label`,
      );
      ok(
        occasion.basisClause.length > 0,
        `${prospect.id} occasion records the clause it was read from`,
      );
    }
  } else {
    unparseable += 1;
    ok(
      outcome.because.trim().length > 0,
      `${prospect.id} states why it has no cycle`,
    );
  }
}

ok(threw === 0, "no buying window threw", `${threw} threw`);
ok(
  parsed + unparseable === PROSPECTS.length,
  "every row is accounted for",
  `${parsed} parsed, ${unparseable} unparseable, ${PROSPECTS.length} rows`,
);
console.log(
  `      ${PROSPECTS.length} rows: ${parsed} parsed, ${unparseable} recorded as no cycle, 0 thrown`,
);

/* Strings the seed does not contain, which is the point. A parser that
   is only ever handed the hundred and two strings it was written
   against has not been tested. */
const HOSTILE = [
  "",
  "   ",
  "Whenever they feel like it",
  "12/12",
  "Q4",
  "Nov-Dec-Jan-Feb-Mar",
  "Year round",
  "year-round",
  "SEPT + DEC",
  "december",
  "Dec (",
  "()",
  "+++",
  ", , ,",
  "Marchmallow season",
  "Their Nov-Dec is peak trading",
  "a".repeat(4000),
  "Jun + Dec",
];

for (const source of HOSTILE) {
  let outcome: ReturnType<typeof parseBuyingWindow> | null = null;
  try {
    outcome = parseBuyingWindow(source, { occasionNoun: "Occasion" });
  } catch (error) {
    ok(false, `hostile string threw: ${JSON.stringify(source.slice(0, 40))}`, String(error));
    continue;
  }
  ok(
    outcome.kind === "parsed" || outcome.because.length > 0,
    `hostile string degrades to a stated reason: ${JSON.stringify(source.slice(0, 40))}`,
  );
}

/* The one case the narrow rule is written for. A month named inside
   prose about somebody else's trading peak is not a buying occasion. */
const peak = parseBuyingWindow("Jan-Feb, their Nov-Dec being peak trading", {
  occasionNoun: "Occasion",
});
ok(
  peak.kind === "parsed" && peak.occasions.length === 1,
  "a month named mid clause is not read as an occasion",
  peak.kind === "parsed" ? `${peak.occasions.length} occasions` : peak.because,
);
ok(
  peak.kind === "parsed" && peak.occasions[0]?.anchorMonth === 1,
  "the occasion read is the one at the head of the clause",
);

const rolling = parseBuyingWindow("Year round (staff appreciation)", {
  occasionNoun: "Occasion",
});
ok(
  rolling.kind === "no-cycle-recorded",
  "a year round window degrades to no cycle recorded rather than to a guess",
);

const audit = buyingWindowAudit();
ok(audit.length === PROSPECTS.length, "the audit covers every row");
ok(
  audit.every((row) => row.because !== null || row.occasionCount > 0),
  "every audited row has occasions or a stated reason",
);

// ---------------------------------------------------------------
section("2. Every occasion generates exactly five traces at the stated offsets");
// ---------------------------------------------------------------

ok(TRACE_ORDER.length === 5, "there are five trace kinds", String(TRACE_ORDER.length));
ok(TRACE_OFFSET_DAYS.confirm === -1, "confirm is minus one day");
ok(TRACE_OFFSET_DAYS["host-on-the-day"] === 0, "the host trace is the anchor itself");
ok(TRACE_OFFSET_DAYS.debrief === 1, "debrief is plus one day");
ok(TRACE_OFFSET_DAYS["review-ask"] === 7, "the review ask is plus seven days");
ok(TRACE_OFFSET_DAYS["place-next"] === 14, "placing the next one is plus fourteen days");

const rows = accountRows(AS_OF);
let occasionCount = 0;
for (const row of rows) {
  for (const occasionRow of row.occasions) {
    occasionCount += 1;
    const traces = occasionRow.traces;
    ok(
      traces.length === 5,
      `${occasionRow.occasion.id} generates five traces`,
      String(traces.length),
    );
    for (const trace of traces) {
      ok(
        trace.offsetDays === TRACE_OFFSET_DAYS[trace.kind],
        `${trace.id} carries the stated offset`,
        `${trace.offsetDays} against ${TRACE_OFFSET_DAYS[trace.kind]}`,
      );
      ok(
        trace.on === addDays(trace.anchorDate, trace.offsetDays),
        `${trace.id} lands on anchor plus offset`,
        `${trace.on} against ${addDays(trace.anchorDate, trace.offsetDays)}`,
      );
    }
    const kinds = new Set(traces.map((t) => t.kind));
    ok(kinds.size === 5, `${occasionRow.occasion.id} has five distinct kinds`);
  }
  /* The contracted lines carry the same five, anchored on a signature
     rather than on a projection. */
  ok(
    row.traces.length === row.lines.length * 5,
    `${row.account.id} carries five traces per signed line`,
    `${row.traces.length} against ${row.lines.length * 5}`,
  );
}

const board = accountBoard(AS_OF);
ok(
  board.postEventObligations.length === SEED_BOOK.length * 4,
  "four dated post event obligations per contract",
  `${board.postEventObligations.length} across ${SEED_BOOK.length} contracts`,
);
console.log(
  `      ${occasionCount} occasions, ${board.postEventObligations.length} dated post event obligations from ${SEED_BOOK.length} contracts`,
);

/* The two counts the research says this seed produces. */
ok(occasionCount === 5, "five dated windows", String(occasionCount));
ok(board.postEventObligations.length === 8, "eight dated traces", String(board.postEventObligations.length));

// ---------------------------------------------------------------
section("3. No window opens after it closes");
// ---------------------------------------------------------------

for (const segment of SEGMENT_ORDER) {
  const profile = SEGMENT_PROFILE[segment];
  ok(
    profile.planningLeadDays > profile.commitLeadDays,
    `${segment} opens before it closes`,
    `${profile.planningLeadDays} and ${profile.commitLeadDays}`,
  );
  ok(profile.commitLeadDays >= 0, `${segment} does not close after the occasion`);
  ok(profile.source.trim().length > 0, `${segment} states where its leads came from`);
}

/* Across three years of clocks, not just today's, because a window that
   is well formed in August and malformed in March is the failure this
   check is for. */
for (let month = 0; month < 36; month += 1) {
  const asOf = isoOf(2026 + Math.floor(month / 12), (month % 12) + 1, 14);
  for (const row of clockRows(asOf)) {
    ok(
      row.window.opensOn < row.window.closesOn,
      `${row.occasionId} opens before it closes on ${asOf}`,
      `${row.window.opensOn} and ${row.window.closesOn}`,
    );
    ok(
      row.window.closesOn <= row.window.occasionDate,
      `${row.occasionId} closes on or before the occasion on ${asOf}`,
    );
    ok(
      row.window.open === (asOf >= row.window.opensOn && asOf <= row.window.closesOn),
      `${row.occasionId} agrees with itself about being open on ${asOf}`,
    );
  }
}

// ---------------------------------------------------------------
section("4. The overdue buckets are monotonic");
// ---------------------------------------------------------------

const SEVERITY: Record<CycleState, number> = {
  "not-yet-delivered": -1,
  "on-cycle": 0,
  "window-open": 1,
  overdue: 2,
  lapsed: 3,
};

ok(
  OVERDUE_RATIO.windowOpen < OVERDUE_RATIO.overdue &&
    OVERDUE_RATIO.overdue < OVERDUE_RATIO.lapsed,
  "the three boundaries are in order",
);

let previous = -Infinity;
for (let step = 0; step <= 400; step += 1) {
  const ratio = step / 100;
  const severity = SEVERITY[cycleStateOf(ratio)];
  ok(
    severity >= previous,
    `bucket does not go backwards at ratio ${ratio.toFixed(2)}`,
    `${severity} after ${previous}`,
  );
  previous = severity;
}

ok(cycleStateOf(null) === "not-yet-delivered", "no delivery is its own state");
ok(cycleStateOf(0) === "on-cycle", "nothing elapsed reads on cycle");
ok(cycleStateOf(0.74) === "on-cycle", "just under three quarters reads on cycle");
ok(cycleStateOf(0.75) === "window-open", "three quarters reads window open");
ok(cycleStateOf(1) === "window-open", "a full cycle is still window open");
ok(cycleStateOf(1.01) === "overdue", "past a full cycle reads overdue");
ok(cycleStateOf(1.25) === "overdue", "a quarter over is still overdue");
ok(cycleStateOf(1.26) === "lapsed", "past a quarter over reads lapsed");

/* Every account's own ratio, on every clock, is a finite number or is
   honestly absent. It is never zero standing in for absent. */
for (let month = 0; month < 36; month += 1) {
  const asOf = isoOf(2026 + Math.floor(month / 12), (month % 12) + 1, 14);
  for (const row of accountRows(asOf)) {
    if (row.purchase.kind === "measured") {
      ok(
        Number.isFinite(row.purchase.overdueRatio),
        `${row.account.id} ratio is finite on ${asOf}`,
        String(row.purchase.overdueRatio),
      );
      ok(row.purchase.cycleDays > 0, `${row.account.id} divides by a real cycle`);
    } else {
      ok(
        row.purchase.cycleState === "not-yet-delivered",
        `${row.account.id} says no delivery rather than zero on ${asOf}`,
      );
    }
  }
}

// ---------------------------------------------------------------
section("5. A zero denominator never becomes NaN, Infinity or nought per cent");
// ---------------------------------------------------------------

const ZERO_CASES: Array<[number, number]> = [
  [0, 0],
  [1, 0],
  [0, -1],
  [3, Number.NaN],
  [1, Number.POSITIVE_INFINITY],
];
for (const [numerator, denominator] of ZERO_CASES) {
  const figure = figureOf(numerator, denominator, "test");
  ok(
    figure.kind === "not-measurable" || Number.isFinite(figure.value),
    `figureOf(${numerator}, ${denominator}) does not produce a number it cannot defend`,
  );
}
ok(
  figureOf(1, Number.POSITIVE_INFINITY, "test").kind === "measured" ||
    figureOf(1, Number.POSITIVE_INFINITY, "test").kind === "not-measurable",
  "an infinite denominator is handled rather than propagated",
);

for (let month = 0; month < 36; month += 1) {
  const asOf = isoOf(2026 + Math.floor(month / 12), (month % 12) + 1, 14);
  for (const metric of accountMetrics(asOf)) {
    if (metric.figure.kind === "not-measurable") {
      ok(
        metric.figure.because.trim().length > 0,
        `${metric.id} states why it cannot be measured on ${asOf}`,
      );
      ok(
        metric.figure.denominator === 0,
        `${metric.id} is unmeasurable only for want of a denominator on ${asOf}`,
      );
      continue;
    }
    ok(
      Number.isFinite(metric.figure.value),
      `${metric.id} is finite on ${asOf}`,
      String(metric.figure.value),
    );
    ok(
      metric.figure.denominator > 0,
      `${metric.id} measured against a real denominator on ${asOf}`,
    );
    ok(
      !Number.isNaN(metric.figure.numerator),
      `${metric.id} numerator is a number on ${asOf}`,
    );
  }
}

const today = accountMetrics(AS_OF);
const rebooking = today.find((m) => m.id === "rebooking-rate");
ok(
  rebooking?.figure.kind === "not-measurable",
  "the rebooking rate has no denominator today",
);
ok(
  rebooking?.firstReadsOn === "2026-11-14",
  "and it says the first window closes on 14 November 2026",
  String(rebooking?.firstReadsOn),
);
const onCycle = today.find((m) => m.id === "accounts-on-cycle");
ok(
  onCycle?.figure.kind === "measured" &&
    onCycle.figure.numerator === 2 &&
    onCycle.figure.denominator === 2,
  "accounts on cycle reads two of two",
);
const retained = today.find((m) => m.id === "revenue-retained");
ok(
  retained?.figure.kind === "not-measurable" &&
    retained.firstReadsOn === "2027-11-21",
  "revenue retained first reads on 21 November 2027",
  String(retained?.firstReadsOn),
);
const perAccount = today.find((m) => m.id === "events-per-account");
ok(
  perAccount?.figure.kind === "not-measurable" &&
    perAccount.firstReadsOn === "2026-11-21",
  "events per account first reads on 21 November 2026",
  String(perAccount?.firstReadsOn),
);

// ---------------------------------------------------------------
section("6. The Heights Christian December conflict, with its exact dates");
// ---------------------------------------------------------------

const conflicts = windowConflicts(AS_OF);
ok(conflicts.length === 1, "exactly one conflict on the board today", String(conflicts.length));

const heights = conflicts.find(
  (c) => c.accountId === "heights-christian-schools-brea-campus",
);
ok(Boolean(heights), "the conflict is Heights Christian's");
ok(heights?.opensOn === "2026-10-05", "the window opens on 5 October 2026", String(heights?.opensOn));
ok(heights?.closesOn === "2026-11-14", "the window closes on 14 November 2026", String(heights?.closesOn));
ok(heights?.eventDate === "2026-11-20", "the signed event is on 20 November 2026", String(heights?.eventDate));
ok(heights?.daysBefore === 6, "the window closes six days before it", String(heights?.daysBefore));
ok(
  heights?.occasionLabel === "Christmas program week",
  "on the occasion the school named itself",
  String(heights?.occasionLabel),
);

const heightsRow = rows.find(
  (r) => r.account.id === "heights-christian-schools-brea-campus",
);
ok(heightsRow?.occasions.length === 3, "Heights Christian holds three occasions");
ok(
  heightsRow?.occasions.every((o) => o.occasion.cycleProvenance === "declared"),
  "and every one of its cycles is declared rather than observed",
);
const kwonRow = rows.find((r) => r.account.id === "team-kwon-taekwondo-center-hq");
ok(kwonRow?.occasions.length === 2, "Team Kwon holds two");
ok(
  kwonRow?.occasions.some((o) => o.occasion.nextOccasionDate.startsWith("2027-12")),
  "and its December occasion has stepped past the December it already signed",
  kwonRow?.occasions.map((o) => o.occasion.nextOccasionDate).join(" "),
);

// ---------------------------------------------------------------
section("7. The honest constraint, and the date the board comes alive");
// ---------------------------------------------------------------

ok(ACCOUNTS.length === SEED_BOOK.length, "one account per signed contract");
ok(
  rows.every((r) => r.deliveredLines.length === 0),
  "nothing has been delivered today",
);
ok(
  rows.every((r) => r.state === "awaiting-delivery"),
  "so both accounts read awaiting delivery",
  rows.map((r) => r.state).join(" "),
);
ok(
  rows.every((r) => r.missedWindows.length === 0),
  "and no account can be at risk, because no window has closed against a delivery",
);
ok(
  rows.every((r) => r.purchase.kind === "not-yet-delivered"),
  "purchase recency reads no event delivered rather than zero days",
);

/* The state the data reaches on its own, with nobody editing the seed. */
const dayAfter = "2026-11-21";
const afterRows = accountRows(dayAfter);
const afterHeights = afterRows.find(
  (r) => r.account.id === "heights-christian-schools-brea-campus",
);
ok(
  afterHeights?.deliveredLines.length === 1,
  "on 21 November 2026 Heights Christian has a delivered event",
);
ok(
  afterHeights?.state === "delivered" || afterHeights?.state === "window-open",
  "and the board reads it off the clock rather than off a flag",
  String(afterHeights?.state),
);
ok(
  afterHeights?.purchase.kind === "measured" &&
    afterHeights.purchase.daysSinceLast === 1,
  "with purchase recency of one day",
);

ok(
  declaredCycleDays(3) === 122 && declaredCycleDays(2) === 183,
  "the declared cycle divides the year by the count of named occasions",
  `${declaredCycleDays(3)} and ${declaredCycleDays(2)}`,
);
ok(MID_MONTH_DAY === 14, "a bare month anchors on the fourteenth");

// ---------------------------------------------------------------
console.log(
  `\n${checks} checks, ${failures} failed.${failures === 0 ? " Board is sound." : ""}`,
);
process.exit(failures === 0 ? 0 : 1);
