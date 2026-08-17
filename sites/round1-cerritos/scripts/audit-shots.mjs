/**
 * AUDIT: screenshots of the mega nav strip and the go-see run treatment.
 * Throwaway proof. Writes into /tmp/shots/audit/.
 */
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = "/tmp/work/me-prospecting/dist";
const BASE = "/me";
const OUT = "/tmp/shots/audit";
fs.mkdirSync(OUT, { recursive: true });

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p.startsWith(BASE)) p = p.slice(BASE.length) || "/";
  let f = path.join(ROOT, p);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    const nested = path.join(f, "index.html");
    f = fs.existsSync(nested) ? nested : path.join(ROOT, "index.html");
  }
  res.writeHead(200, {
    "Content-Type": MIME[path.extname(f)] || "application/octet-stream",
  });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(4183, r));

// A light grey tile so the basemap is present but deterministic.
const TILE = fs.readFileSync("/tmp/work/me-prospecting/scripts/_tile.png");

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

async function newCtx(width, height, reduced) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    ...(reduced ? { reducedMotion: "reduce" } : {}),
  });
  await ctx.route("**/basemaps.cartocdn.com/**", (r) =>
    r.fulfill({ status: 200, contentType: "image/png", body: TILE }),
  );
  return ctx;
}

const WIDTHS = [1440, 900, 768, 380];

for (const w of WIDTHS) {
  const ctx = await newCtx(w, 900, false);
  const page = await ctx.newPage();
  await page.goto("http://localhost:4183/me/today", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const bar = page.locator("header, [class*='bar']").first();
  // The strip is the first element containing the featured key.
  const strip = page
    .locator("div")
    .filter({ has: page.locator("[data-featured='key']") })
    .last();
  const box = await page
    .locator("[data-featured='key']")
    .evaluate((el) => {
      let n = el;
      while (n && !(n.querySelector("nav") && n.querySelector("button"))) n = n.parentElement;
      const r = n.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    })
    .catch(() => null);
  const clip = box
    ? { x: 0, y: 0, width: w, height: Math.ceil(box.y + box.height + 6) }
    : { x: 0, y: 0, width: w, height: 80 };
  await page.screenshot({ path: `${OUT}/strip-${w}.png`, clip });
  // Also full page top for context
  await page.screenshot({ path: `${OUT}/page-${w}.png` });
  await ctx.close();
  console.log("strip", w, JSON.stringify(box));
}

// --- The board and the run ------------------------------------------
for (const w of [1440, 380]) {
  const ctx = await newCtx(w, 900, false);
  const page = await ctx.newPage();
  await page.goto("http://localhost:4183/me/map", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/board-${w}-arrival.png` });
  // Take the run
  const take = page.getByRole("button", { name: /Put the run on the board/i });
  if (await take.count()) {
    await take.first().click();
    await page.waitForTimeout(1600);
    await page.screenshot({ path: `${OUT}/board-${w}-run-taken.png` });
  } else {
    console.log("no take-run button at", w);
  }
  await ctx.close();
}

await browser.close();
server.close();
console.log("done");
