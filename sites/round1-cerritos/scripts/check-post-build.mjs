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
import crypto from "node:crypto";

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
/**
 * THE LINK PREVIEW SAYS WHAT THIS BUILD ACTUALLY IS.
 *
 * This used to assert only that og.png existed. It existed, it passed, and
 * the file was the previous fork's card: the wrong product name, the wrong
 * framing, the wrong organisation count and another company's disclaimer.
 * A text search over the whole shipped build could not see it because a
 * grep cannot read a picture, and that image is the FIRST thing anybody
 * sees when the URL is pasted anywhere.
 *
 * So the generator now writes public/og.json beside the card, carrying the
 * figures the card was drawn with, and this compares them against the seed.
 * A card drawn before the data changed fails the build instead of shipping.
 */
const ogPng = path.join(DIR, "og.png");
const ogJson = path.join(DIR, "og.json");

if (!fs.existsSync(ogPng)) {
  console.error("FAIL: og.png is missing. Every pasted link previews as a grey rectangle.");
  failed = true;
} else if (!fs.existsSync(ogJson)) {
  console.error("FAIL: og.png is present but og.json is not, so nothing can tell whether the card is this build's or a leftover from the fork it came from. Run scripts/make-og.mjs.");
  failed = true;
} else {
  const claimed = JSON.parse(fs.readFileSync(ogJson, "utf8"));
  const seed = fs.readFileSync(
    path.join(path.dirname(new URL(import.meta.url).pathname), "..", "src", "data", "prospects.ts"),
    "utf8",
  );
  const actual = [...seed.matchAll(/^\s*id:\s*"([a-z0-9-]+)",$/gm)].length;
  if (claimed.organisations !== actual) {
    console.error(
      `FAIL: the link preview card says ${claimed.organisations} organisations and the board has ${actual}. The card is stale. Run scripts/make-og.mjs and commit it.`,
    );
    failed = true;
  } else if (
    claimed.sha256 &&
    crypto.createHash("sha256").update(fs.readFileSync(ogPng)).digest("hex") !== claimed.sha256
  ) {
    console.error(
      "FAIL: og.json does not describe og.png. The manifest and the image have drifted, which is what happens when a copy creates the new sidecar and silently declines to overwrite the old picture. Run scripts/make-og.mjs and copy BOTH files.",
    );
    failed = true;
  } else if (!claimed.sha256) {
    console.error(
      "FAIL: og.json carries no image hash, so nothing can tell whether it describes the png beside it. Run scripts/make-og.mjs.",
    );
    failed = true;
  } else if (claimed.name !== "R1") {
    console.error(
      `FAIL: the link preview card is branded "${claimed.name}" and this application is R1. Run scripts/make-og.mjs.`,
    );
    failed = true;
  } else {
    console.log(`ok   og.png says ${actual} organisations, which is what the board says`);
  }
}

process.exit(failed ? 1 : 0);
