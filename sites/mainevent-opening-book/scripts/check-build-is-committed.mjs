/**
 * THE COMMITTED SITE MUST BE THIS SOURCE, BUILT.
 *
 * njs-site serves /me from files committed into the repo. The source that
 * produces those files lives beside them, in sites/mainevent-opening-book.
 * Nothing enforces the relationship: a person can edit the source, commit
 * it, and ship a site built from a different version of it, and every
 * check in this repo would still pass. The failure is silent and it looks
 * exactly like the code being right.
 *
 * So this builds the source and compares the result, file by file and
 * byte for byte, against what is committed. Vite hashes asset names off
 * content, so an identical source produces identical filenames; a
 * difference in either direction is a real difference.
 *
 *   node scripts/check-build-is-committed.mjs <builtDir> <committedDir>
 *
 * WHAT A FAILURE MEANS. Usually that somebody edited the source and
 * forgot to run the build, or ran the build and forgot to copy it across.
 * It is fixed by rebuilding and copying, not by editing this file.
 *
 * WHY THE HTML IS COMPARED BY CONTENT RATHER THAN SKIPPED. Every route
 * stub is a copy of index.html, so a change to the head, a meta tag, a
 * title or the theme script has to reach 298 files. Comparing them is how
 * you find out that it reached 297.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const BUILT = path.resolve(process.argv[2] ?? "dist");
const COMMITTED = path.resolve(process.argv[3] ?? "../../me");

function walk(root) {
  const out = new Map();
  if (!fs.existsSync(root)) return out;
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) stack.push(full);
      else if (e.isFile()) {
        out.set(
          path.relative(root, full),
          crypto.createHash("sha256").update(fs.readFileSync(full)).digest("hex"),
        );
      }
    }
  }
  return out;
}

const built = walk(BUILT);
const committed = walk(COMMITTED);

if (built.size === 0) {
  console.error(`Nothing at ${BUILT}. Run the build first.`);
  process.exit(1);
}

const missing = [...built.keys()].filter((f) => !committed.has(f)).sort();
const extra = [...committed.keys()].filter((f) => !built.has(f)).sort();
const differing = [...built.keys()]
  .filter((f) => committed.has(f) && committed.get(f) !== built.get(f))
  .sort();

const show = (list, n = 12) =>
  list.slice(0, n).map((f) => `    ${f}`).join("\n") +
  (list.length > n ? `\n    and ${list.length - n} more` : "");

console.log(`built:     ${built.size} files`);
console.log(`committed: ${committed.size} files`);

if (!missing.length && !extra.length && !differing.length) {
  console.log("\nThe committed site is this source, built. Byte for byte.");
  process.exit(0);
}

console.error("\nTHE COMMITTED SITE DOES NOT MATCH A BUILD OF THIS SOURCE.\n");
if (missing.length) {
  console.error(`  ${missing.length} file(s) the build produces and the repo does not have:`);
  console.error(show(missing));
}
if (extra.length) {
  console.error(`  ${extra.length} file(s) in the repo that this source does not produce:`);
  console.error(show(extra));
}
if (differing.length) {
  console.error(`  ${differing.length} file(s) whose contents differ:`);
  console.error(show(differing));
}
console.error(
  "\nRebuild and copy the output across. Do not edit this check.",
);
process.exit(1);
