/**
 * BEFORE AND AFTER, on the same console screens.
 *
 * "Push it" is a claim that the new bytes are better than the deployed
 * bytes, and the honest way to support that claim is to run both and
 * compare, not to describe the diff. This serves the CURRENTLY DEPLOYED
 * build and the NEW build side by side on two ports, walks every console
 * route that exists in both, and reports, per screen:
 *
 *   - whether it still renders at all, with no page errors
 *   - its heading, so a screen that silently became a different screen
 *     is visible
 *   - its word count, so a screen that lost a panel is visible
 *   - every number on it, so a figure that moved is visible and can be
 *     defended rather than discovered by a hiring manager
 *
 * Screens that exist only in the new build are listed as additions
 * rather than compared, since there is nothing to compare them to.
 *
 * WHAT IT DOES NOT DO. It does not pass or fail on a word count change:
 * a screen that gained a section SHOULD have more words. It prints the
 * deltas and a human reads them. It fails only on a screen that stops
 * rendering, loses its heading, or drops below half its previous length,
 * which is the shape of an accident rather than of an edit.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";

const OLD = path.resolve(process.argv[2]);
const NEW = path.resolve(process.argv[3]);
const BASE = "/me";

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json", ".webmanifest": "application/manifest+json", ".woff2": "font/woff2", ".ico": "image/x-icon", ".webp": "image/webp" };

function serve(root, port) {
  const s = http.createServer((req, res) => {
    const raw = decodeURIComponent(req.url.split("?")[0]);
    const url = raw.startsWith(BASE) ? raw.slice(BASE.length) || "/" : raw;
    let file = path.join(root, url);
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404, { "content-type": "text/plain" });
      res.end("404");
      return;
    }
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] ?? "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((r) => s.listen(port, () => r(s)));
}

/** Route directories present in a build, minus the per record deep links. */
function routes(root) {
  const skip = new Set(["assets", "quote", "leagues", "rationale", "sellthrough"]);
  const out = ["/"];
  for (const e of fs.readdirSync(root, { withFileTypes: true })) {
    if (!e.isDirectory() || skip.has(e.name)) continue;
    if (fs.existsSync(path.join(root, e.name, "index.html"))) out.push(`/${e.name}`);
  }
  return out.sort();
}

const READ = () => ({
  h1: (document.querySelector("h1")?.textContent || "").trim(),
  words: document.body.innerText.trim().split(/\s+/).length,
  /* Every distinct number on the screen. A figure that changed is the
     thing a hiring manager would be asked to defend out loud, so it is
     surfaced rather than folded into a word count. */
  nums: [...new Set((document.body.innerText.match(/\$?\d[\d,]*(\.\d+)?%?/g) || []))].sort(),
});

const oldSrv = await serve(OLD, 4611);
const newSrv = await serve(NEW, 4612);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

async function walk(port) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  const seen = {};
  for (const r of routes(port === 4611 ? OLD : NEW)) {
    errs.length = 0;
    const res = await page.goto(`http://localhost:${port}${BASE}${r === "/" ? "/" : r}`, { waitUntil: "networkidle" });
    seen[r] = { status: res.status(), errors: [...errs], ...(await page.evaluate(READ)) };
  }
  await page.close();
  return seen;
}

const before = await walk(4611);
const after = await walk(4612);

await browser.close();
oldSrv.close();
newSrv.close();

const failures = [];
const changed = [];
const same = [];

for (const r of Object.keys(before)) {
  const b = before[r];
  const a = after[r];
  if (!a) {
    failures.push(`${r}: exists in the deployed build and is GONE from the new one`);
    continue;
  }
  if (a.status !== 200) failures.push(`${r}: new build returns ${a.status}`);
  if (a.errors.length) failures.push(`${r}: new build page error ${a.errors[0]}`);
  if (b.h1 && !a.h1) failures.push(`${r}: lost its heading (was "${b.h1}")`);
  if (b.words > 80 && a.words < b.words * 0.5) {
    failures.push(`${r}: lost more than half its content (${b.words} words to ${a.words})`);
  }
  const gainedNums = a.nums.filter((n) => !b.nums.includes(n));
  const lostNums = b.nums.filter((n) => !a.nums.includes(n));
  const row = { r, b, a, gainedNums, lostNums };
  if (b.words !== a.words || b.h1 !== a.h1 || gainedNums.length || lostNums.length) changed.push(row);
  else same.push(row);
}

const added = Object.keys(after).filter((r) => !before[r]);

console.log(`Console screens in the deployed build: ${Object.keys(before).length}`);
console.log(`Console screens in the new build:      ${Object.keys(after).length}\n`);

if (added.length) {
  console.log("NEW SCREENS (nothing to compare against):");
  for (const r of added) console.log(`  + ${r}  "${after[r].h1}"  ${after[r].words} words`);
  console.log();
}

console.log(`UNCHANGED, word for word and figure for figure: ${same.length} screens`);
if (same.length) console.log(`  ${same.map((s) => s.r).join(" ")}\n`);

if (changed.length) {
  console.log(`CHANGED: ${changed.length} screens`);
  for (const c of changed) {
    console.log(`  ${c.r}  ${c.b.words} to ${c.a.words} words${c.b.h1 !== c.a.h1 ? `  heading "${c.b.h1}" to "${c.a.h1}"` : ""}`);
    if (c.lostNums.length) console.log(`    figures no longer on the screen: ${c.lostNums.slice(0, 14).join(" ")}${c.lostNums.length > 14 ? ` and ${c.lostNums.length - 14} more` : ""}`);
    if (c.gainedNums.length) console.log(`    figures now on the screen:      ${c.gainedNums.slice(0, 14).join(" ")}${c.gainedNums.length > 14 ? ` and ${c.gainedNums.length - 14} more` : ""}`);
  }
  console.log();
}

if (failures.length) {
  console.log(`REGRESSIONS: ${failures.length}\n`);
  for (const f of failures) console.log(`  ${f}`);
  process.exit(1);
}
console.log("No screen lost, no screen broken, no screen gutted.");
