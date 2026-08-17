/**
 * THE LINK PREVIEW CARD, GENERATED RATHER THAN DRAWN ONCE AND FORGOTTEN.
 *
 * This file exists because of a specific failure, and the failure is worth
 * writing down because nothing in the repo caught it.
 *
 * This application was forked from a work sample built for Main Event
 * Brea. Every string was swept: the source, the bundle, the 168 route
 * stubs, the head metadata. A text search over the whole shipped build
 * came back clean. `check-post-build.mjs` passed, and one of the things it
 * asserts is that `og.png` is present.
 *
 * The og.png that was present was the Main Event one, byte for byte. It
 * read "The Opening Book", "a pre-opening sales console for a venue that
 * has not opened yet", 211 organisations, 27 screens, nathanjsong.com/me,
 * and a Main Event Entertainment disclaimer. Every fact on it was wrong.
 *
 * A GREP CANNOT READ A PICTURE. The check asserted the file existed, which
 * was true, and said nothing about what it said, which was the only thing
 * that mattered. That is the same shape as every other bad measurement
 * this project has produced: the instrument could not see the failure it
 * was pointed at.
 *
 * So the card is no longer an artefact somebody made in a session and
 * dropped in public/. It is generated from the same seed the application
 * reads, which means the organisation count on the card cannot disagree
 * with the organisation count on the board, and a rename cannot leave the
 * old name sitting in the one image a hiring manager sees first.
 *
 *   node scripts/make-og.mjs
 *
 * Writes public/og.png at 1200x630. Run it after changing the name, the
 * count, or the framing, and commit the result.
 *
 * ON FONTS. The design ships Rubik and Azeret Mono from a web font
 * service, and the machine this runs on has no route to one. Rather than
 * fail, or silently render in something that looks nothing like the
 * product, it uses the DejaVu family that is present, which is a
 * reasonable neutral stand-in at this size. If you run this somewhere with
 * the real faces installed, they are picked up first because they are
 * named first in the stack.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.join(here, "..");

/**
 * The figures, read out of the seed rather than typed here.
 *
 * This is the entire point of the file. A card that says 211 while the
 * board says 109 is worse than a card with no figures on it, because the
 * reader has no way to know which one is lying and will assume both are.
 */
function counts() {
  const prospects = fs.readFileSync(path.join(root, "src/data/prospects.ts"), "utf8");
  const organisations = [...prospects.matchAll(/^\s*id:\s*"([a-z0-9-]+)",$/gm)].length;
  const cities = new Set(
    [...prospects.matchAll(/^\s*city:\s*"([^"]+)",$/gm)].map((m) => m[1]),
  ).size;

  if (organisations < 20 || cities < 3) {
    console.error(
      `Read ${organisations} organisations across ${cities} cities out of prospects.ts. The seed shape changed; fix this before shipping a card with wrong numbers on it.`,
    );
    process.exit(1);
  }
  return { organisations, cities };
}

const { organisations, cities } = counts();

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px;
    background:
      radial-gradient(900px 500px at 88% 8%, #10343a 0%, rgba(16,52,58,0) 62%),
      radial-gradient(700px 420px at 4% 96%, #241a33 0%, rgba(36,26,51,0) 58%),
      #16141c;
    color: #f7f6fb;
    font-family: Rubik, "DejaVu Sans", "Liberation Sans", sans-serif;
    padding: 64px 72px;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .eyebrow {
    font-family: "Azeret Mono", "DejaVu Sans Mono", monospace;
    font-size: 17px; letter-spacing: 0.22em; text-transform: uppercase;
    color: #99f7ff; font-weight: 500;
  }
  .rule { width: 76px; height: 4px; background: #16c9d4; margin: 18px 0 34px; border-radius: 2px; }
  h1 { font-size: 92px; line-height: 0.98; font-weight: 800; letter-spacing: -0.025em; }
  .sub { font-size: 30px; line-height: 1.32; color: #c9c5d6; margin-top: 22px; max-width: 21ch; font-weight: 400; }
  .figs { display: flex; gap: 76px; margin-top: 8px; }
  .n { font-size: 54px; font-weight: 700; line-height: 1; letter-spacing: -0.02em; }
  .l {
    font-family: "Azeret Mono", "DejaVu Sans Mono", monospace;
    font-size: 13px; letter-spacing: 0.13em; text-transform: uppercase;
    color: #9d98ad; margin-top: 12px; font-weight: 400;
  }
  .foot { border-top: 1px solid #33303e; padding-top: 26px; display: flex; justify-content: space-between; align-items: flex-end; }
  .who { font-size: 25px; font-weight: 700; }
  .url { font-family: "Azeret Mono", "DejaVu Sans Mono", monospace; font-size: 16px; color: #9d98ad; margin-top: 9px; }
  .disc { font-family: "Azeret Mono", "DejaVu Sans Mono", monospace; font-size: 14px; line-height: 1.6; color: #7e7a8c; text-align: right; }
</style></head><body>
  <div>
    <div class="eyebrow">Independent work sample</div>
    <div class="rule"></div>
    <h1>R1</h1>
    <div class="sub">A territory and partner console for Round1 Cerritos.</div>
  </div>
  <div class="figs">
    <div><div class="n">${organisations}</div><div class="l">Organisations sourced</div></div>
    <div><div class="n">${cities}</div><div class="l">Cities in the trade area</div></div>
    <div><div class="n">6</div><div class="l">Provenance classes</div></div>
  </div>
  <div class="foot">
    <div>
      <div class="who">Nathan J. Song</div>
      <div class="url">nathanjsong.com/r1</div>
    </div>
    <div class="disc">Not affiliated with, endorsed by, or a<br>product of Round One Entertainment, Inc.</div>
  </div>
</body></html>`;

const browser = await chromium.launch({
  executablePath: fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined,
});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "load" });
const out = path.join(root, "public", "og.png");
await page.screenshot({ path: out });
await browser.close();

/**
 * The sidecar, and why a build check needs one.
 *
 * check-post-build.mjs used to assert only that og.png existed, which was
 * true on the day the card said the wrong company's name. A picture cannot
 * be grepped, so the check has nothing to read unless the generator leaves
 * it something. This is that something: the figures the card was drawn
 * with, written beside it, so a build can compare them against the seed and
 * fail when the card has gone stale. It is not a checksum of the image. It
 * is the claim the image makes, in a form a machine can read.
 */
/**
 * THE SIDECAR CARRIES A HASH OF THE IMAGE, AND THAT IS THE WHOLE POINT.
 *
 * The first version of this wrote only the figures, and it was checked
 * within the hour by the exact failure it was built to stop. The card was
 * regenerated correctly, but the copy onto the target disk silently
 * refused to overwrite the existing png while happily creating the new
 * json beside it. The result was a sidecar claiming R1 and 109 sitting
 * next to an image still saying The Opening Book and 211, and a build
 * check that compared the sidecar to the seed, agreed with itself, and
 * passed.
 *
 * A check that reads the claim instead of the thing is not a check. So the
 * sidecar records the sha256 of the bytes it was written beside, and the
 * build hashes the shipped png and compares. The two cannot drift now
 * without failing, because a stale image and a fresh manifest no longer
 * agree about anything.
 */
const sha256 = crypto.createHash("sha256").update(fs.readFileSync(out)).digest("hex");

fs.writeFileSync(
  path.join(root, "public", "og.json"),
  JSON.stringify({ organisations, cities, name: "R1", url: "nathanjsong.com/r1", sha256 }, null, 2) + "\n",
);

console.log(`og.png written: ${organisations} organisations across ${cities} cities, ${out}`);
