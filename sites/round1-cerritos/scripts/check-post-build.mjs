/**
 * The two standing checks, run by a machine instead of by remembering.
 *
 * Both of these exist because both have already failed in production.
 *
 * NO WHISKEY IMAGES. This application was forked from a distillery work
 * sample, and public/assets/products came with it. Twenty eight bottle
 * photographs shipped inside a Main Event prototype, were removed by
 * hand, and CAME BACK on the next build, because the removal had been
 * done in the deployed copy rather than in the source. It fired twice.
 * A grep is cheaper than a third time.
 *
 * EVERY ROUTE HAS A FILE. The host serves this with cleanUrls, so deep
 * links resolve only if a real index.html sits at the path. The emitter
 * writes one per route; this asserts the emitter actually ran and wrote
 * as many as it said, which is what turns "the build succeeded" into
 * "the links work". Expected is stubs plus one, the one being the root.
 *
 *   node scripts/check-post-build.mjs <dir> <expectedStubs>
 */
import fs from "node:fs";
import path from "node:path";

const DIR = path.resolve(process.argv[2] ?? "dist");
const EXPECTED_STUBS = Number(process.argv[3]);

function walk(root, test) {
  const out = [];
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) stack.push(full);
      else if (test(e.name)) out.push(path.relative(root, full));
    }
  }
  return out;
}

let failed = false;

const images = walk(DIR, (n) => /\.(webp|jpe?g)$/i.test(n));
if (images.length > 0) {
  console.error(
    `FAIL: ${images.length} photographic image(s) in the build. This project ships no product photography, and their return is a known regression.\n` +
      images.slice(0, 10).map((f) => `  ${f}`).join("\n"),
  );
  failed = true;
} else {
  console.log("ok   no product photography in the build");
}

const indexes = walk(DIR, (n) => n === "index.html");
if (Number.isFinite(EXPECTED_STUBS)) {
  const expected = EXPECTED_STUBS + 1;
  if (indexes.length !== expected) {
    console.error(
      `FAIL: ${indexes.length} index.html files, expected ${expected} (${EXPECTED_STUBS} stubs plus the root). Deep links will 404.`,
    );
    failed = true;
  } else {
    console.log(`ok   ${indexes.length} index.html files, ${EXPECTED_STUBS} stubs plus the root`);
  }
} else {
  console.error("FAIL: no expected stub count passed. Read it out of the emitter's own output rather than typing it here.");
  failed = true;
}

/* The link preview card. It is referenced by an absolute URL in the head,
   so a missing file is a preview that silently renders as a grey box in
   somebody's inbox rather than an error anybody would see. */
if (!fs.existsSync(path.join(DIR, "og.png"))) {
  console.error("FAIL: og.png is missing. Every pasted link previews as a grey rectangle.");
  failed = true;
} else {
  console.log("ok   og.png present for the link preview");
}

process.exit(failed ? 1 : 0);
