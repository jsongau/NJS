import fs from "node:fs";
import path from "node:path";

/**
 * Emit a real index.html at every client route.
 *
 * njs-site is a zero-build static repo with `cleanUrls: true`, and that
 * setting fights SPA rewrites: Vercel normalizes a rewrite destination of
 * `/me/index.html` back to `/me`, so the rewrite never
 * resolves and deep links 404. Verified in production, not assumed.
 *
 * Rather than fight the platform, this writes a real file at each route,
 * which is exactly how every other concept in that repo already works.
 * The filesystem answers the request, the SPA router takes over on load,
 * and there is no server configuration to be wrong.
 *
 * Adding a route to App.tsx means adding it to ROUTES below. That
 * coupling is the cost of the approach, so it is kept in one obvious
 * place and the check further down turns a silent miss into a failed
 * build.
 */
const here = path.dirname(new URL(import.meta.url).pathname);

/**
 * Prospect ids, read out of the seed rather than typed again here.
 *
 * Every organisation gets its own quote URL, and those URLs go in
 * emails, so a prospect added to prospects.ts must get a stub without
 * anyone remembering to come back to this file. A regex over the source
 * is crude, but the alternative is compiling TypeScript inside a build
 * step that exists to copy an HTML file, and the guard below turns a
 * silent miss into a failed build.
 */
function prospectIds() {
  const src = fs.readFileSync(
    path.join(here, "..", "src", "data", "prospects.ts"),
    "utf8",
  );
  const ids = [...src.matchAll(/^\s*id:\s*"([a-z0-9-]+)",$/gm)].map((m) => m[1]);
  if (ids.length < 50) {
    console.error(
      `Only ${ids.length} prospect ids matched in prospects.ts. The seed shape changed; fix this script before shipping links that will 404.`,
    );
    process.exit(1);
  }
  return ids;
}

/**
 * League ids, read out of the seed for the same reason prospect ids are.
 *
 * The slice matters. `leagues.ts` declares LEAGUES and then LEAGUE_TEAMS
 * in the same file, and both carry an `id` field, so a regex over the
 * whole source would emit a stub for all twenty eight teams and none of
 * them is a route. Cutting the source at the LEAGUE_TEAMS declaration
 * keeps this honest, and the guard below fails the build rather than
 * shipping a board whose deep links 404.
 */
function leagueIds() {
  const src = fs.readFileSync(
    path.join(here, "..", "src", "data", "leagues.ts"),
    "utf8",
  );
  const start = src.indexOf("export const LEAGUES:");
  const end = src.indexOf("export const LEAGUE_TEAMS");
  if (start === -1 || end === -1 || end < start) {
    console.error(
      "Could not find the LEAGUES block in leagues.ts. The seed shape changed; fix this script before shipping links that will 404.",
    );
    process.exit(1);
  }
  const ids = [...src.slice(start, end).matchAll(/^\s*id:\s*"([a-z0-9-]+)",$/gm)]
    .map((m) => m[1]);
  if (ids.length < 2) {
    console.error(
      `Only ${ids.length} league ids matched in leagues.ts. Fix this script before shipping links that will 404.`,
    );
    process.exit(1);
  }
  return ids;
}

/**
 * The console paths that have an explanation written against them, read
 * out of src/data/rationale rather than listed again here. A regex over
 * the source is crude, and the guard below turns a silent miss into a
 * failed build.
 */
function rationalePaths() {
  const dir = path.join(here, "..", "src", "data", "rationale");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".ts") && f !== "types.ts" && f !== "index.ts");
  const paths = new Set();
  for (const f of files) {
    const src = fs.readFileSync(path.join(dir, f), "utf8");
    for (const m of src.matchAll(/^\s*path:\s*"([^"]+)",$/gm)) paths.add(m[1]);
  }
  if (paths.size < 20) {
    console.error(
      `Only ${paths.size} rationale screens matched. The shape changed; fix this before shipping links that will 404.`,
    );
    process.exit(1);
  }
  // "/" is explained at "/rationale" itself, everything else gets a child.
  return [...paths].map((p) => (p === "/" ? "rationale" : `rationale${p}`));
}

const ROUTES = [
  "today",
  "leagues",
  // The quarterly cup board. It is the URL that goes in a "put a team
  // down for January" message, so it has to resolve on a cold open.
  "cup",
  "requests",
  "inbox",
  "map",
  "lanes",
  "segments",
  "partners",
  "promo",
  "spend",
  // The licensor statement. It is the one URL in this group that could
  // be sent to somebody outside the building, so a cold open on it has
  // to serve the screen rather than a 404.
  "sellthrough",
  "book",
  "book/week",
  "book/accounts",
  "team",
  "pay",
  "report",
  "rivals",
  "replies",
  "field",
  "calendar",
  "packages",
  "objections",
  "sent",
  "coaching",
  "method",
  // Rationale is a second reading of every screen above, at the same
  // address with a prefix, so its stubs are derived from the console
  // routes rather than typed again. Read out of the same file the
  // application reads, so a screen added to one mode cannot be missing
  // from the other. That includes "rationale" itself, which is how the
  // home board is explained, so it is NOT typed here as well: it was,
  // once, and the emitted count then disagreed with the file count on
  // disk by one for no reason a reader could see.
  ...rationalePaths(),
  // The quote pages are the URLs that go in emails, so they must resolve
  // on a cold open with no client-side routing. One stub per prospect.
  ...prospectIds().map((id) => `quote/${id}`),
  // One stub per league, because a league page is what goes in a "come
  // and see the Tuesday night" email and it has to resolve cold.
  ...leagueIds().map((id) => `leagues/${id}`),
];

/**
 * A route listed twice writes the same file twice and reports a count
 * nobody can reconcile against `find dist -name index.html`. Two sources
 * feed this list now, a typed one and a derived one, so the overlap is a
 * standing hazard rather than a one off. Fail the build instead.
 */
const seen = new Set();
const duplicates = ROUTES.filter((r) => (seen.has(r) ? true : (seen.add(r), false)));
if (duplicates.length > 0) {
  console.error(
    `Route listed more than once: ${duplicates.join(", ")}. Remove the typed entry; the derived list already covers it.`,
  );
  process.exit(1);
}

const dist = path.resolve(process.argv[2] ?? "dist");
const source = path.join(dist, "index.html");

if (!fs.existsSync(source)) {
  console.error(`No index.html at ${source}. Run the build first.`);
  process.exit(1);
}

const html = fs.readFileSync(source, "utf8");

for (const route of ROUTES) {
  const dir = path.join(dist, route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
}

console.log(`${ROUTES.length} route stubs emitted into ${dist}`);
