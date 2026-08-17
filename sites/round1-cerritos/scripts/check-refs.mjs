/**
 * EVERY SEEDED REFERENCE POINTS AT AN ORGANISATION THAT EXISTS.
 *
 * This check exists because the failure it catches is invisible and it
 * already happened once, at full scale.
 *
 * When this application was forked from a Main Event Brea work sample and
 * repointed at Round1 Cerritos, `prospects.ts` was replaced wholesale:
 * 211 organisations near Brea out, 109 near Cerritos in. Every other
 * seeded file kept its old ids. That left 210 dead references, spread
 * across the statuses, the conversations, the requests, the book, the
 * accounts and the leagues.
 *
 * NONE OF IT FAILED TO COMPILE. A prospect id is a string, so TypeScript
 * has nothing to check it against, and `tsc -b` was clean, the bundle
 * built, the route stubs emitted and every standing check in the repo
 * passed. The application rendered. It just rendered a territory nobody
 * had ever worked: never touched 109 of 109, live conversations zero, the
 * inbox empty, the book empty. Which is exactly what a brand new board
 * would look like, so it read as data rather than as damage.
 *
 * That is the whole lesson of this codebase in one bug. "The build
 * succeeded" is not "the links work", and a green pipeline is the most
 * convincing form a silent failure can take.
 *
 * A real database refuses to store a row pointing at a parent that does
 * not exist, and the name for that guarantee is REFERENTIAL INTEGRITY.
 * This file is the poor version of a foreign key, and it is here until
 * the data moves somewhere that can enforce the real one.
 *
 *   node scripts/check-refs.mjs
 *
 * Exits 1 on any dead reference, so it can gate a build.
 */
import fs from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const src = (p) => path.join(here, "..", "src", p);
const read = (p) => fs.readFileSync(p, "utf8");

/**
 * The ids read out of the seed itself rather than listed here.
 *
 * A second list is a second thing to forget, and this check would then be
 * asserting agreement between two stale files while the application read
 * a third.
 */
const ids = new Set(
  [...read(src("data/prospects.ts")).matchAll(/^\s*id:\s*"([a-z0-9-]+)",$/gm)].map(
    (m) => m[1],
  ),
);

if (ids.size < 20) {
  console.error(
    `Only ${ids.size} prospect ids matched in prospects.ts. The seed shape changed; fix this script before trusting a pass.`,
  );
  process.exit(1);
}

/**
 * The files that carry a prospectId. Listed rather than globbed, because
 * a glob that silently stops matching reports a clean run over nothing,
 * and that is the same class of failure this file exists to catch.
 */
const FILES = [
  "data/conversations.ts",
  "data/prospectStatus.ts",
  "data/requests.ts",
  "data/book.ts",
  "data/accounts.ts",
  "data/leagues.ts",
  "data/cup.ts",
  "data/seats.ts",
];

let dead = 0;
let checked = 0;

console.log(`${ids.size} organisations in prospects.ts\n`);

for (const f of FILES) {
  const p = src(f);
  if (!fs.existsSync(p)) {
    console.error(`MISSING: ${f}. It was in the list and it is not on disk.`);
    process.exit(1);
  }
  const refs = new Set(
    [...read(p).matchAll(/prospectId:\s*"([a-z0-9-]+)"/g)].map((m) => m[1]),
  );
  checked += refs.size;
  const missing = [...refs].filter((r) => !ids.has(r)).sort();
  const mark = missing.length ? "DEAD" : "ok  ";
  console.log(`${mark} ${f}: ${refs.size} references, ${missing.length} dead`);
  if (missing.length) {
    dead += missing.length;
    for (const m of missing.slice(0, 8)) console.log(`       ${m}`);
    if (missing.length > 8) console.log(`       and ${missing.length - 8} more`);
  }
}

console.log(`\n${checked} references checked.`);

if (dead > 0) {
  console.error(
    `\n${dead} DEAD REFERENCE${dead === 1 ? "" : "S"}. Every one of these renders as an absence rather than an error, so nothing else in this repo will tell you.`,
  );
  process.exit(1);
}

console.log("Every seeded reference resolves to an organisation on the board.");
