/**
 * The literal text diff of one screen, deployed build against new build.
 * Exists because a uniform delta across twenty one screens is a chrome
 * change and a chrome change has to be named, not shrugged at.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";

const OLD = path.resolve(process.argv[2]);
const NEW = path.resolve(process.argv[3]);
const ROUTE = process.argv[4] ?? "/today";
const BASE = "/me";
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json", ".webmanifest": "application/manifest+json", ".woff2": "font/woff2", ".ico": "image/x-icon", ".webp": "image/webp" };

function serve(root, port) {
  const s = http.createServer((req, res) => {
    const raw = decodeURIComponent(req.url.split("?")[0]);
    const url = raw.startsWith(BASE) ? raw.slice(BASE.length) || "/" : raw;
    let f = path.join(root, url);
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
    if (!fs.existsSync(f) || !fs.statSync(f).isFile()) { res.writeHead(404); res.end("404"); return; }
    res.writeHead(200, { "content-type": TYPES[path.extname(f)] ?? "application/octet-stream" });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise((r) => s.listen(port, () => r(s)));
}

const a = await serve(OLD, 4621);
const b = await serve(NEW, 4622);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

async function text(port) {
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(`http://localhost:${port}${BASE}${ROUTE === "/" ? "/" : ROUTE}`, { waitUntil: "networkidle" });
  const t = await p.evaluate(() => document.body.innerText);
  await p.close();
  return t.split("\n").map((l) => l.trim()).filter(Boolean);
}

const before = await text(4621);
const after = await text(4622);
await browser.close();
a.close();
b.close();

/* A MULTISET, not a set. The first cut compared sets of lines and
   reported "only additions" on a screen whose word count had gone DOWN
   by five, which is impossible and was the comparison lying rather than
   the build. A line that appears three times in one build and twice in
   the other is exactly the kind of change a set hides. */
const tally = (ls) => ls.reduce((m, l) => m.set(l, (m.get(l) ?? 0) + 1), new Map());
const B = tally(before);
const A = tally(after);
const words = (ls) => ls.join(" ").split(/\s+/).filter(Boolean).length;
console.log(`${ROUTE}   ${words(before)} words to ${words(after)} words\n`);
console.log("ONLY IN THE DEPLOYED BUILD:");
for (const [l, n] of B) { const d = n - (A.get(l) ?? 0); if (d > 0) console.log(`  - ${l}${d > 1 || n > 1 ? `   (x${d} of ${n})` : ""}`); }
console.log("\nONLY IN THE NEW BUILD:");
for (const [l, n] of A) { const d = n - (B.get(l) ?? 0); if (d > 0) console.log(`  + ${l}${d > 1 || n > 1 ? `   (x${d} of ${n})` : ""}`); }
