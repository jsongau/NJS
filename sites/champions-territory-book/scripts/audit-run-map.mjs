import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = "/tmp/work/me-prospecting/dist";
const BASE = "/me";
const OUT = "/tmp/shots/audit";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json" };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p.startsWith(BASE)) p = p.slice(BASE.length) || "/";
  let f = path.join(ROOT, p);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    const nested = path.join(f, "index.html");
    f = fs.existsSync(nested) ? nested : path.join(ROOT, "index.html");
  }
  res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(4186, r));

const TILE = fs.readFileSync("/tmp/work/me-prospecting/scripts/_tile.png");
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await ctx.route(/cartocdn/, (r) => r.fulfill({ status: 200, contentType: "image/png", body: TILE }));
const page = await ctx.newPage();
await page.goto("http://localhost:4186/me/map", { waitUntil: "networkidle" });
await page.waitForTimeout(1800);

// Dismiss the floating offers card if it has a close control, so the map is clear.
const close = page.getByRole("button", { name: /close|dismiss/i });
if (await close.count()) { try { await close.first().click(); } catch {} }
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/run-offered-1440.png` });

const take = page.getByRole("button", { name: /Put the run on the board/i });
await take.first().click();
await page.waitForTimeout(2200);
await page.screenshot({ path: `${OUT}/run-taken-1440.png` });

// Crop the map column only.
const mapBox = await page.evaluate(() => {
  const el = document.querySelector(".leaflet-container");
  const r = el.getBoundingClientRect();
  return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
});
await page.screenshot({ path: `${OUT}/run-taken-map.png`, clip: mapBox });

// What the path is actually painted as.
const paint = await page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll(".leaflet-overlay-pane path")) {
    const cs = getComputedStyle(el);
    out.push({
      cls: el.getAttribute("class"),
      stroke: cs.stroke,
      width: cs.strokeWidth,
      dash: cs.strokeDasharray,
      op: cs.strokeOpacity,
    });
  }
  return out;
});
console.log(JSON.stringify(paint, null, 1));

// Stat strip figures after taking the run
const stats = await page.evaluate(() => {
  const dl = document.querySelector("dl[aria-live]");
  return { live: dl?.getAttribute("aria-live"), text: dl?.innerText.replace(/\n+/g, " | ") };
});
console.log("STATS", JSON.stringify(stats));

await browser.close();
server.close();
