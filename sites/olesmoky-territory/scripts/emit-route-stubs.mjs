import fs from "node:fs";
import path from "node:path";

/**
 * Emit a real index.html at every client route.
 *
 * njs-site is a zero-build static repo with `cleanUrls: true`, and that
 * setting fights SPA rewrites: Vercel normalizes a rewrite destination of
 * `/molsoncoors/index.html` back to `/molsoncoors`, so the rewrite never
 * resolves and deep links 404. Verified in production, not assumed.
 *
 * Rather than fight the platform, this writes a real file at each route,
 * which is exactly how every other funnel in that repo already works. The
 * filesystem answers the request, the SPA router takes over on load, and
 * there is no server configuration to be wrong.
 *
 * Adding a route to App.tsx means adding it to ROUTES below. That coupling
 * is the cost of the approach, so it is kept in one obvious place.
 */
const here = path.dirname(new URL(import.meta.url).pathname);

/**
 * Account ids, read out of the seed rather than typed again here.
 *
 * Every store gets its own order URL, and those URLs go in emails, so a
 * store added to accounts.ts must get a stub without anyone remembering
 * to come back to this file. A regex over the source is crude, but the
 * alternative is compiling TypeScript inside a build step that exists to
 * copy an HTML file, and the check below turns a silent miss into a
 * failed build.
 */
function accountIds() {
  const src = fs.readFileSync(
    path.join(here, "..", "src", "data", "accounts.ts"),
    "utf8",
  );
  const ids = [...src.matchAll(/^\s*\{\s*id:\s*"([a-z0-9-]+)"/gm)].map((m) => m[1]);
  if (ids.length < 20) {
    console.error(
      `Only ${ids.length} account ids matched in accounts.ts. The seed shape changed; fix this script before shipping links that will 404.`,
    );
    process.exit(1);
  }
  return ids;
}

const ROUTES = [
  "maps",
  "plan",
  "plan/sheet",
  "portfolio",
  "supply",
  "method",
  "sent",
  "training",
  "field",
  "programs",
  "issues",
  "distributor",
  // The order portals are the URLs that go in emails, so they must resolve
  // on a cold open with no client-side routing. One stub per beer house,
  // and one per store.
  "order/southern-glazers-cerritos",
  ...accountIds().map((id) => `store-order/${id}`),
];

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
  console.log(`wrote ${route}/index.html`);
}

console.log(`\n${ROUTES.length} route stubs emitted into ${dist}`);
