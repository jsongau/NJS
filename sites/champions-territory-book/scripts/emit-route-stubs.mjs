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
 * THE TWO DERIVED LISTS THIS SCRIPT USED TO CARRY ARE GONE.
 *
 * One read league ids out of a seed file to emit a stub per league page.
 * The league screens came out with the rest of the venue subsystem and
 * the seed file went with them.
 *
 * The other read every path that had a rationale screen written against
 * it, and emitted a stub per screen so /rationale/lanes would resolve on
 * a cold open. The rationale registries are empty now, on purpose, and
 * the argument for that is written at the top of each of them. What is
 * left is one typed stub for "rationale" itself, so the mode's own
 * address still loads the application and redirects to the console
 * rather than serving a 404 from the host.
 *
 * Both had a guard that failed the build when the derived count dropped
 * below a floor, which is exactly what a guard should do and exactly
 * what happened: the build stopped rather than quietly shipping a board
 * of dead links. The guard did its job on the way out the door.
 */

const ROUTES = [
  "today",
  "requests",
  "inbox",
  "map",
  "lanes",
  "segments",
  "team",
  "report",
  "rivals",
  "replies",
  "field",
  "calendar",
  "objections",
  "sent",
  "coaching",
  "method",
  // The door. The address that goes in a job application, so it has to
  // resolve on a cold open before anything else here does.
  "start",
  // The second reading's own address. The mode is closed and the
  // registries behind it are empty, so this stub exists for one reason:
  // a person who types it, or holds a link to it, gets the application
  // and a redirect to the console rather than a 404 from the host. A
  // closed door is not the same as a missing building.
  "rationale",
  // The quote pages are the URLs that go in emails, so they must resolve
  // on a cold open with no client-side routing. One stub per prospect.
  ...prospectIds().map((id) => `quote/${id}`),
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
