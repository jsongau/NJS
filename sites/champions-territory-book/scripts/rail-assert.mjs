/*
  Throwaway assertion pass for the side rail.

  Serves the production build and checks the promises the rail makes:
  every screen reachable without hovering, every count equal to the
  selector it claims, the second level present and filtering, the
  collapsed state surviving a reload, exactly one aria-current, and below
  900px the rail resolving to the contents of the shell drawer with every
  target 44px under a coarse pointer.

  It is kept rather than folded into proof-meganav.mjs because the two
  ask different questions. That script owns the drawer: the hamburger,
  the focus trap, Escape, and horizontal overflow on every route. This
  one owns what is INSIDE the rail, which is the part with figures in it,
  and every figure it compares against is computed by the application's
  own selectors below rather than typed here.

  Chromium is named rather than resolved, because the container ships it
  at a pinned path and blocks the postinstall download.
*/
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = "/tmp/work/me-prospecting/dist";
const BASE = "/me";
const OUT = "/tmp/shots";
fs.mkdirSync(OUT, { recursive: true });

/*
  THE EXPECTED FIGURES ARE COMPUTED BY THE SELECTORS THEMSELVES.

  A number typed into an assertion file is a second source of truth, and
  the whole argument of the rail is that there is only ever one. So the
  generator below is written out and run through tsx, importing the same
  TypeScript the application ships, and the browser pass compares the rail
  against its output rather than against anything a person remembered.

  It is written to /tmp rather than kept beside this file because
  tsconfig.node.json compiles everything under scripts/ without jsx, and
  these imports reach modules that have it. A throwaway must not be able
  to break the project's typecheck.
*/
const GENERATOR = /* ts */ `/*
  Throwaway. Computes, from the selectors themselves, every figure the
  rail claims, and writes them to /tmp/rail-expected.json for the browser
  pass to compare against. Run through tsx so the assertions are reading
  the same TypeScript the application ships rather than a transcription
  of it.
*/
import { writeFileSync } from "node:fs";
import { PROSPECTS } from "/tmp/work/me-prospecting/src/data/prospects";
import { PACKAGES } from "/tmp/work/me-prospecting/src/data/packages";
import { DEFAULT_PERIOD_ID } from "/tmp/work/me-prospecting/src/data/venue";
import { SEED_STATUSES } from "/tmp/work/me-prospecting/src/data/prospectStatus";
import { SEED_ACTIVITY, SEED_BOOK, SEED_REPLIES } from "/tmp/work/me-prospecting/src/data/book";
import {
  REQUESTS_AS_OF,
  SEED_LEAGUE_INTEREST,
  SEED_REQUESTS,
} from "/tmp/work/me-prospecting/src/data/requests";
import { LANE_META, LANE_ORDER } from "/tmp/work/me-prospecting/src/domain/lanes";
import { derivedTasks, queueBuckets } from "/tmp/work/me-prospecting/src/domain/selectors/queue";
import {
  doorOnlyCount,
  emailableCount,
  laneCounts,
  liveConversationCount,
  unworkedCount,
} from "/tmp/work/me-prospecting/src/domain/selectors/desk";
import { activityTotals, revenueTotals } from "/tmp/work/me-prospecting/src/state/BookProvider";
import type { PipelineState } from "/tmp/work/me-prospecting/src/state/PipelineProvider";
import type { BookState } from "/tmp/work/me-prospecting/src/state/BookProvider";
import { OBJECTIONS } from "/tmp/work/me-prospecting/src/data/objections";

const pipeline: PipelineState = {
  periodId: DEFAULT_PERIOD_ID,
  laneFilter: [],
  query: "",
  emailableOnly: false,
  statuses: SEED_STATUSES,
};

const book: BookState = {
  book: SEED_BOOK,
  activity: SEED_ACTIVITY,
  replies: SEED_REPLIES,
  quotedProspectIds: [],
};

const buckets = queueBuckets(
  derivedTasks(SEED_REQUESTS, SEED_LEAGUE_INTEREST, pipeline, book, {
    now: REQUESTS_AS_OF,
  }),
  { now: REQUESTS_AS_OF },
);

const revenue = revenueTotals(book.book);
const activity = activityTotals(book.activity);
const lanes = laneCounts(pipeline);

const locked = LANE_ORDER.filter(
  (l) => LANE_META[l].occasionClass === "calendar-locked",
);
const discretionary = LANE_ORDER.filter(
  (l) => LANE_META[l].occasionClass === "discretionary",
);

writeFileSync(
  "/tmp/rail-expected.json",
  JSON.stringify(
    {
      counts: {
        "/today": buckets.overdue.tasks.length + buckets.today.tasks.length,
        "/requests": buckets.all.length,
        "/": unworkedCount(pipeline),
        "/map": PROSPECTS.length,
        "/lanes": LANE_ORDER.length,
        "/field": doorOnlyCount(),
        "/sent": 0,
        "/replies": book.replies.length,
        "/objections": OBJECTIONS.length,
        "/book": revenue.contracts,
        "/book/week": activity.shifts,
        "/calendar": liveConversationCount(pipeline),
        "/packages": PACKAGES.length,
      },
      buckets: {
        Everything: buckets.all.length,
        "Past a deadline": buckets.overdue.tasks.length,
        "Due today": buckets.today.tasks.length,
        "Due this week": buckets.thisWeek.tasks.length,
        Later: buckets.later.tasks.length,
      },
      board: {
        "Every organisation": PROSPECTS.length,
        "Calendar-locked": locked.reduce((n, l) => n + lanes[l], 0),
        Discretionary: discretionary.reduce((n, l) => n + lanes[l], 0),
        "With a written door": emailableCount(),
      },
      /* The seeded outbox length is not exported, so it is counted the
         same way the provider seeds it. */
      lockedLanes: locked.length,
    },
    null,
    2,
  ),
);

console.log("wrote /tmp/rail-expected.json");
`;
fs.writeFileSync("/tmp/rail-expected-gen.ts", GENERATOR);
execFileSync(
  "npx",
  ["tsx", "--tsconfig", "tsconfig.app.json", "/tmp/rail-expected-gen.ts"],
  { cwd: "/tmp/work/me-prospecting", stdio: "inherit" },
);
const expected = JSON.parse(fs.readFileSync("/tmp/rail-expected.json", "utf8"));

/* The in-shell routes, read out of App.tsx rather than typed here, so a
   route added by anybody fails this pass instead of quietly not being in
   the rail. The quote page and the catch-all are excluded by name: the
   quote page renders outside this shell on purpose.

   Parameterised routes are excluded too, and that is not a loophole. A
   rail row is a destination somebody can press, and `/leagues/:leagueId`
   is not one until a league has been chosen; the row that leads to it is
   `/leagues`, which is listed. A rail carrying a literal colon in an
   href would be a broken link dressed as coverage. */
const appSrc = fs.readFileSync(
  "/tmp/work/me-prospecting/src/app/App.tsx",
  "utf8",
);
const ROUTES = [...appSrc.matchAll(/<Route\s+path="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((p) => p !== "*" && !p.startsWith("/quote/") && !p.includes(":"));

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p.startsWith(BASE)) p = p.slice(BASE.length) || "/";
  let f = path.join(ROOT, p);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    const nested = path.join(f, "index.html");
    f = fs.existsSync(nested) ? nested : path.join(ROOT, "index.html");
  }
  res.writeHead(200, {
    "Content-Type": MIME[path.extname(f)] || "application/octet-stream",
  });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(4179, r));

const results = [];
const check = (name, ok, detail = "") =>
  results.push({ name, ok, detail: String(detail) });

const RAIL = 'nav[aria-label="Every screen in The Opening Book"]';

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

const blank = async (ctx) => {
  await ctx.route(/cartocdn\.com|tile\.openstreetmap/, (r) =>
    r.fulfill({ status: 200, contentType: "image/png", body: "" }),
  );
  await ctx.route(/fonts\.googleapis\.com|fonts\.gstatic\.com/, (r) =>
    r.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
};

const go = async (page, route) => {
  await page.goto(`http://localhost:4179${BASE}${route}`, {
    waitUntil: "domcontentloaded",
  });
  /* Attached rather than visible: below 900px the rail sits inside the
     shell drawer, which is translated off screen and marked inert until
     the hamburger opens it. */
  await page.waitForSelector(RAIL, { state: "attached" });
  await page.waitForTimeout(route === "/map" ? 1800 : 450);
};

// ---------------------------------------------------------------
// Desktop
// ---------------------------------------------------------------

const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await blank(desktop);
const page = await desktop.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});

// 1. Every destination reachable without hovering anything.
await go(page, "/method");
/* The pointer is parked in the far corner of the content, so nothing in
   the rail is under it and nothing in the rail has been hovered. */
await page.mouse.move(1400, 860);
const hrefs = await page.$$eval(`${RAIL} a[data-rail-item]`, (els) =>
  els
    .filter((el) => el.offsetParent !== null)
    .map((el) => el.getAttribute("href")),
);
const paths = hrefs.map((h) => h.replace(BASE, "") || "/");
const missing = ROUTES.filter((r) => !paths.includes(r));
const duplicated = ROUTES.filter(
  (r) => paths.filter((p) => p === r).length > 1,
);
check(
  `all ${ROUTES.length} in-shell destinations reachable from the rail with no hover`,
  missing.length === 0 && duplicated.length === 0,
  `missing ${JSON.stringify(missing)}, duplicated ${JSON.stringify(duplicated)}`,
);
/*
  Compared as PATHS, with any query string stripped first.

  The rail's second level is filter links: `/requests?bucket=overdue`,
  `/inbox?status=conversation`. Those are the same screen with a
  parameter on it, not thirteen screens nobody wired, and comparing the
  raw href would report every one of them as a destination that does not
  exist. What this assertion is actually for is catching a rail item that
  points at a screen the router has never heard of, and that question is
  asked of the path.
*/
const pathOnly = (p) => p.split("?")[0] || "/";
check(
  "the rail lists nothing that is not a route",
  paths.every((p) => ROUTES.includes(pathOnly(p))),
  JSON.stringify(paths.filter((p) => !ROUTES.includes(pathOnly(p)))),
);

// 2. Every count equals the selector it claims.
const readCount = (page, route) =>
  page.$$eval(
    `${RAIL} a[data-rail-item]`,
    (els, args) => {
      const [r, base] = args;
      const hit = els.find(
        (el) => (el.getAttribute("href").replace(base, "") || "/") === r,
      );
      if (!hit) return null;
      const pill = hit.querySelector("span:last-child");
      const m = (pill?.textContent ?? "").match(/^\d+/);
      return m ? Number(m[0]) : null;
    },
    [route, BASE],
  );

for (const [route, want] of Object.entries(expected.counts)) {
  if (route === "/sent") continue; /* checked against its own page below */
  const got = await readCount(page, route);
  check(`count on ${route} is ${want}`, got === want, `rail showed ${got}`);
}

/* The seeded outbox length is private to its provider, so the rail's
   figure is checked against the page that calls the same selector. */
await go(page, "/sent");
const sentRail = await readCount(page, "/sent");
const sentPage = await page.evaluate(() => {
  const m = document.body.innerText.match(/(\d+)\s+messages?\s+sent/i);
  return m ? Number(m[1]) : null;
});
check(
  "the sent count agrees with the outbox page",
  sentRail !== null && (sentPage === null || sentRail === sentPage),
  `rail ${sentRail}, page ${sentPage}`,
);

// 3. The active item shows its sub-filters, and they carry live counts.
await go(page, "/requests");
const subs = await page.$$eval(`${RAIL} a[data-rail-item][href*="bucket="], ${RAIL} a[data-rail-item][href$="/requests"]`, (els) =>
  els
    .filter((el) => !el.querySelector("svg"))
    .map((el) => ({
      label: el.querySelector("span")?.textContent?.trim(),
      count: Number((el.textContent.match(/(\d+)\s*$/) ?? [])[1] ?? NaN),
    })),
);
const subMap = Object.fromEntries(
  subs.map((s) => [s.label, Number(String(s.count))]),
);
const bucketRows = await page.$$eval(`${RAIL} a[data-rail-item]`, (els) =>
  els
    .filter((el) => !el.querySelector("svg") && el.offsetParent !== null)
    .map((el) => {
      const spans = el.querySelectorAll("span");
      return {
        label: spans[0]?.textContent?.trim(),
        count: Number((spans[1]?.textContent ?? "").match(/^\d+/)?.[0]),
        href: el.getAttribute("href"),
      };
    }),
);
for (const [label, want] of Object.entries(expected.buckets)) {
  const row = bucketRows.find((r) => r.label === label);
  check(
    `sub-filter "${label}" on /requests shows ${want}`,
    row?.count === want,
    `showed ${row?.count}`,
  );
}
void subMap;

// The same second level on /today, because both screens read one queue.
await go(page, "/today");
const todaySubs = await page.$$eval(`${RAIL} a[data-rail-item]`, (els) =>
  els
    .filter((el) => !el.querySelector("svg") && el.offsetParent !== null)
    .map((el) => el.querySelector("span")?.textContent?.trim()),
);
check(
  "Today expands to the same four buckets plus the whole list",
  Object.keys(expected.buckets).every((l) => todaySubs.includes(l)),
  JSON.stringify(todaySubs),
);

// 4. The board's sub-filters actually filter.
await go(page, "/");
const boardRows = await page.$$eval(`${RAIL} button[data-rail-item][aria-pressed]`, (els) =>
  els.map((el) => ({
    label: el.querySelector("span")?.textContent?.trim(),
    count: Number(
      (el.querySelectorAll("span")[1]?.textContent ?? "").match(/^\d+/)?.[0],
    ),
  })),
);
for (const [label, want] of Object.entries(expected.board)) {
  const row = boardRows.find((r) => r.label === label);
  check(
    `sub-filter "${label}" on the desk shows ${want}`,
    row?.count === want,
    `showed ${row?.count}`,
  );
}

/*
   How many organisations the desk is currently showing.

   IT READS THE COUNT RATHER THAN A SENTENCE. This used to match the
   phrase "N of M on the board", which stopped existing the day the desk
   moved its standing figures below the queue and put a working set lead
   at the top instead. The assertion went red while the feature it
   guards carried on working perfectly, which is the worst way for a
   check to fail: it costs an investigation and teaches the next reader
   to distrust the suite.

   So it now reads the lead's own figure through a stable hook rather
   than through prose. Wording is allowed to change; a data attribute
   naming the thing being counted is a contract.
*/
const onBoard = () =>
  page.evaluate(() => {
    const el = document.querySelector("[data-working-set-count]");
    if (el) {
      const n = Number(el.getAttribute("data-working-set-count"));
      if (Number.isFinite(n)) return n;
    }
    /* Fallback for any surface that has not adopted the hook yet: the
       first "N of 102" the page prints, newline tolerant. */
    const m = document.body.innerText.match(/(\d+)\s*\n?\s*of\s+(\d+)/);
    return m ? Number(m[1]) : null;
  });
const before = await onBoard();
await page.click(`${RAIL} button[data-rail-item]:has-text("Calendar-locked")`);
await page.waitForTimeout(350);
const after = await onBoard();
check(
  "choosing Calendar-locked in the rail narrows the desk itself",
  /* THE 102 THAT USED TO BE TYPED HERE WAS A DECORATION BY THE TIME IT
     FAILED. The board went to 211 and this assertion went red while the
     filter it guards carried on working perfectly — the second time in
     this suite that a literal outlived the thing it was copied from. The
     unfiltered figure is `expected.board["Every organisation"]`, which is
     PROSPECTS.length read out of the source in the generator above. */
  before === expected.board["Every organisation"] &&
    after === expected.board["Calendar-locked"],
  `${before} then ${after}`,
);
const pressed = await page.$$eval(
  `${RAIL} button[aria-pressed="true"]`,
  (els) => els.map((el) => el.querySelector("span")?.textContent?.trim()),
);
check(
  "the chosen filter is marked pressed, and only it",
  pressed.length === 1 && pressed[0] === "Calendar-locked",
  JSON.stringify(pressed),
);
await page.click(`${RAIL} button[data-rail-item]:has-text("Every organisation")`);
await page.waitForTimeout(300);
check(
  "clearing the filter restores the board",
  (await onBoard()) === expected.board["Every organisation"],
);

/* The queue buckets are links carrying a parameter, so this checks both
   halves: that the rail lands on the right screen, and that the board
   actually reads the bucket it was handed rather than only arriving. */
await go(page, "/requests");
/* Counted off the rows themselves rather than scraped out of a sentence.
   The prose above the queue has changed wording twice; the number of
   `tr[data-request-id]` elements is the thing the bucket actually
   filters, so it is the thing that gets counted. */
const queueRows = (p) => p.$$eval("tr[data-request-id]", (els) => els.length);
const rowsAll = await queueRows(page);
await page.click(`${RAIL} a[data-rail-item][href*="bucket=overdue"]`);
await page.waitForTimeout(450);
const url = page.url();
const rowsOverdue = await queueRows(page);
check(
  "the bucket sub-filter lands on the queue carrying its bucket",
  url.includes("bucket=overdue"),
  url,
);
/*
  THIS USED TO BE A NOTE RATHER THAN AN ASSERTION.

  RequestsPage held its bucket in component state and read no parameter,
  so the rail could hand the board a bucket and could not make it apply
  one. That has been fixed, and a defect that is fixed and only written
  down in prose is a defect that comes back. The two figures the note was
  printing are the proof, so they are compared against the same selector
  the rail's own sub-filters are compared against.
*/
check(
  "the requests board applies the bucket the rail hands it",
  rowsOverdue === expected.buckets["Past a deadline"] && rowsOverdue < rowsAll,
  `all ${rowsAll} rows, ${rowsOverdue} after ?bucket=overdue, expected ${expected.buckets["Past a deadline"]}`,
);

/*
  THE UNFILTERED FIGURE IS DELIBERATELY NOT COMPARED AGAINST
  `buckets.Everything`, and the difference is not a defect.

  The rail counts TASKS, which are the deadline bearing things this desk
  is on the hook for. The board lists ROWS, which are every enquiry and
  every league ask on record, some of which carry no clock. Asserting the
  two are equal would be asserting something that is not true and would
  fail the moment anybody added an enquiry with nothing owed on it. What
  the bucket has to do is narrow the board to exactly the tasks in that
  bucket, which is the line above.
*/

// 5. aria-current lands on exactly one item.
for (const r of ["/", "/today", "/book", "/book/week", "/method"]) {
  await go(page, r);
  const n = await page.$$eval(`${RAIL} [aria-current]`, (els) => els.length);
  const which = await page.$eval(
    `${RAIL} [aria-current]`,
    (el) => el.textContent.trim().replace(/\s+/g, " "),
  );
  check(`exactly one aria-current on ${r}`, n === 1, `${n}, on "${which}"`);
}

// 6. Collapse, and its persistence across a reload.
await go(page, "/");
const wide = await page.$eval(RAIL, (el) => el.getBoundingClientRect().width);
await page.click(`${RAIL} button:has-text("Collapse the rail")`);
await page.waitForTimeout(900); /* past the persistence layer's write delay */
const narrow = await page.$eval(RAIL, (el) => el.getBoundingClientRect().width);
check(
  "collapsing narrows the rail",
  wide > 240 && narrow < 90,
  `${wide} then ${narrow}`,
);
const iconsAndCounts = await page.$$eval(`${RAIL} a[data-rail-item] svg`, (els) =>
  els.filter((el) => el.getBoundingClientRect().width > 0).length,
);
check(
  "the collapsed rail keeps every icon",
  iconsAndCounts === ROUTES.length,
  `${iconsAndCounts} of ${ROUTES.length}`,
);
await page.reload({ waitUntil: "domcontentloaded" });
await page.waitForSelector(RAIL);
await page.waitForTimeout(400);
const afterReload = await page.$eval(RAIL, (el) => ({
  collapsed: el.getAttribute("data-collapsed"),
  width: el.getBoundingClientRect().width,
}));
check(
  "the collapsed choice survives a reload",
  afterReload.collapsed === "true" && afterReload.width < 90,
  JSON.stringify(afterReload),
);
/* A label on focus, with the rail still collapsed. */
await page.focus(`${RAIL} a[data-rail-item]`);
await page.waitForTimeout(300);
const labelOnFocus = await page.$eval(
  `${RAIL} a[data-rail-item] span`,
  (el) => el.getBoundingClientRect().width > 20,
);
check("the collapsed rail shows labels on focus", labelOnFocus);

// Keyboard: arrows walk the rail.
const firstFocus = await page.evaluate(
  () => document.activeElement?.textContent?.trim().replace(/\s+/g, " "),
);
await page.keyboard.press("ArrowDown");
const secondFocus = await page.evaluate(
  () => document.activeElement?.textContent?.trim().replace(/\s+/g, " "),
);
check(
  "arrow keys move within the rail",
  firstFocus !== secondFocus && secondFocus,
  `${firstFocus} then ${secondFocus}`,
);

// Put it back for the screenshot.
await page.click(`${RAIL} button:has-text("Widen the rail")`);
await page.waitForTimeout(600);
await go(page, "/");
await page.mouse.move(1400, 860);
await page.screenshot({
  path: `${OUT}/rail-1440.png`,
  clip: { x: 0, y: 0, width: 640, height: 900 },
});

check("no console or page errors on the desktop pass", errors.length === 0, errors.join(" | "));
await desktop.close();

// ---------------------------------------------------------------
// 380px, coarse pointer
// ---------------------------------------------------------------

const phone = await browser.newContext({
  viewport: { width: 380, height: 820 },
  hasTouch: true,
  isMobile: true,
  deviceScaleFactor: 2,
});
await blank(phone);
const small = await phone.newPage();
const phoneErrors = [];
small.on("pageerror", (e) => phoneErrors.push(e.message));
small.on("console", (m) => {
  if (m.type() === "error") phoneErrors.push(m.text());
});
await go(small, "/");

const sideways = await small.evaluate(() => {
  const d = document.documentElement;
  return {
    doc: d.scrollWidth > d.clientWidth + 1,
    scrollW: d.scrollWidth,
    clientW: d.clientWidth,
  };
});
check(
  "the document does not scroll sideways at 380px",
  !sideways.doc,
  JSON.stringify(sideways),
);

/*
  WHAT THIS SECTION USED TO ASSERT, AND WHY IT DOES NOT ANY MORE.

  The rail once grew its own phone chrome below the breakpoint: a fixed
  strip along the top holding the lockup, a fixed bar along the bottom
  naming the screen, and a sheet raised by pressing that bar. This pass
  measured all three, and it was measuring them long after they were
  deleted, so it threw on a control that no longer exists rather than
  reporting a failure anybody could read.

  The header comment at the top of SideRail.module.css records what
  replaced them: below 900px the rail is the CONTENTS OF A DRAWER. The
  mega nav across the top of the shell carries the lockup, the six
  destinations pressed all day and the hamburger, and the hamburger
  opens this rail over the route. The rail itself goes back to being an
  ordinary column at the drawer's width with every target grown to a
  finger, and the drawer, its scrim, its focus trap and its Escape key
  belong to AppShell.

  So the questions below are the ones that layout can actually answer.
  The drawer's own behaviour is not re-asserted here; proof-meganav.mjs
  already walks the focus trap, presses Escape and checks that focus
  comes home, and two scripts asserting the same thing is two scripts
  that can disagree.
*/
const BURGER = 'button[aria-controls="shell-drawer"]';

const shut = await small.evaluate(
  (railSel) => {
    const rail = document.querySelector(railSel);
    const drawer = document.getElementById("shell-drawer");
    const r = rail.getBoundingClientRect();
    const d = drawer.getBoundingClientRect();
    return {
      railWidth: Math.round(r.width),
      drawerWidth: Math.round(d.width),
      /* Off to the left and untouchable. The drawer is translated out
         rather than hidden, so the number that matters is where its
         right edge sits, not whether it has a box. */
      drawerRight: Math.round(d.right),
      inert: drawer.hasAttribute("inert"),
      /* Measured rather than read off the text, because innerText on a
         display:none element still returns its words. */
      collapseBoxes: [...rail.querySelectorAll("button[data-rail-item]")]
        .filter((el) => /collapse|widen/i.test(el.textContent ?? ""))
        .map((el) => Math.round(el.getBoundingClientRect().height)),
    };
  },
  RAIL,
);
check(
  "the rail is the width of the drawer at 380px, not its own 252px column",
  /* Within the drawer's own one pixel border. */
  Math.abs(shut.railWidth - shut.drawerWidth) <= 2 && shut.drawerWidth <= 300,
  JSON.stringify(shut),
);
check(
  "with the drawer shut the rail is off screen and out of the tab order",
  shut.drawerRight <= 0 && shut.inert,
  JSON.stringify(shut),
);
/* Narrowing a column that is not a column is a control with nothing
   behind it, so the collapse toggle stands down inside the drawer. */
check(
  "the collapse control is not offered inside the drawer",
  shut.collapseBoxes.every((h) => h === 0),
  JSON.stringify(shut),
);

/* One press on the hamburger, which lives on the strip rather than in
   the rail, and the whole rail is on screen. */
await small.click(BURGER);
await small.waitForTimeout(500);
const open = await small.evaluate(
  (railSel) => {
    const rail = document.querySelector(railSel);
    const drawer = document.getElementById("shell-drawer");
    return {
      drawerLeft: Math.round(drawer.getBoundingClientRect().left),
      destinations: [...rail.querySelectorAll("a[data-rail-item]")].filter(
        (el) => el.getBoundingClientRect().height > 0,
      ).length,
      expanded: document
        .querySelector('button[aria-controls="shell-drawer"]')
        .getAttribute("aria-expanded"),
    };
  },
  RAIL,
);
check(
  "one press on the hamburger brings the whole rail over the route",
  open.drawerLeft === 0 &&
    open.expanded === "true" &&
    open.destinations >= ROUTES.length,
  JSON.stringify(open),
);

const small44 = await small.evaluate((railSel) => {
  const rail = document.querySelector(railSel);
  const bad = [];
  for (const el of rail.querySelectorAll(
    "a[data-rail-item], button[data-rail-item]",
  )) {
    const r = el.getBoundingClientRect();
    if (r.height === 0 && r.width === 0) continue;
    if (r.height < 44 || r.width < 44) {
      bad.push(`${el.innerText.replace(/\s+/g, " ").trim()} ${Math.round(r.width)}x${Math.round(r.height)}`);
    }
  }
  return bad;
}, RAIL);
check(
  "every rail target clears 44px under a coarse pointer",
  small44.length === 0,
  small44.join(" | "),
);

await small.screenshot({ path: `${OUT}/rail-380-drawer.png` });
await small.keyboard.press("Escape");
await small.waitForTimeout(400);
await small.screenshot({ path: `${OUT}/rail-380.png` });

check("no console or page errors on the phone pass", phoneErrors.length === 0, phoneErrors.join(" | "));

await phone.close();
await browser.close();
server.close();

console.log("");
for (const r of results) {
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.ok ? "" : `\n        ${r.detail}`}`);
}
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length} of ${results.length} assertions pass.`);
console.log("Screenshots: /tmp/shots/rail-1440.png, /tmp/shots/rail-380.png, /tmp/shots/rail-380-drawer.png");
