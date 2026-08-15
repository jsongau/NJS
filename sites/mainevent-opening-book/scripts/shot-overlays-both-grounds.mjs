/**
 * The overlays, in both grounds. Throwaway proof, not part of the
 * application.
 *
 * WHY IT EXISTS SEPARATELY FROM shot-both-grounds.mjs. Every scrim in this
 * application is behind a click, so a walk of the routes never paints one.
 * That is exactly how six of them shipped with a wash that only worked on
 * the ground they were written against: a near black at 0.32 dims paper
 * and does nothing at all over a violet near black, and a wash mixed from
 * --surface-0 dims the dark ground and LIGHTENS the light one. Nothing
 * throws, nothing fails a contrast walk, and the defect is only visible to
 * somebody who opens the thing and looks.
 *
 * So this opens each one, on each ground, and writes the pair out. The
 * theme is set by hand rather than through the toggle, because the thing
 * under test is the paint and not the control.
 *
 * Run: node scripts/shot-overlays-both-grounds.mjs
 * Output: /tmp/sweep-ov
 */
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const ROOT = "/tmp/work/me-prospecting/dist";
const BASE = "/me";
const OUT = "/tmp/sweep-ov";
fs.mkdirSync(OUT, { recursive: true });
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
await new Promise((r) => server.listen(4192, r));
const TILE = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGN4cOcKAAUwApGnG1K1AAAAAElFTkSuQmCC", "base64");
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });

const STEPS = [
  ["/today", "add-prospect", async (p) => { await p.getByRole("button", { name: /Add a prospect/i }).first().click({ timeout: 5000 }); await p.waitForTimeout(700); }],
  ["/map", "compose", async (p) => { await p.waitForTimeout(2500); await p.locator('[class*="item"]').first().click({ force: true }); await p.waitForTimeout(900); await p.locator('[data-compose="write"]').first().click({ timeout: 6000 }); await p.waitForTimeout(1200); }],
  ["/requests", "request-drawer", async (p) => { await p.locator("button,a").filter({ hasText: /Open|Answer|View/i }).first().click({ timeout: 4000 }); await p.waitForTimeout(800); }],
  ["/map", "map-popup", async (p) => { await p.waitForTimeout(2500); await p.locator(".ob-marker").first().click({ force: true }); await p.waitForTimeout(900); }],
  ["/map", "detail-pane", async (p) => { await p.waitForTimeout(2500); await p.locator('[class*="ProspectListCard"], [class*="item"]').first().click({ force: true }); await p.waitForTimeout(900); }],
  ["/", "record-modal", async (p) => { await p.locator("[data-record-name]").first().click({ timeout: 6000 }); await p.waitForTimeout(1400); }],
];

for (const theme of ["dark", "light"]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: theme });
  await ctx.route(/cartocdn\.com|tile\.openstreetmap/, (r) => r.fulfill({ status: 200, contentType: "image/png", body: TILE }));
  await ctx.route(/fonts\.googleapis\.com|fonts\.gstatic\.com/, (r) => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  for (const [route, name, act] of STEPS) {
    const page = await ctx.newPage();
    await page.goto(`http://localhost:4192${BASE}${route}`, { waitUntil: "domcontentloaded" });
    await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, theme);
    await page.waitForTimeout(1100);
    try { await act(page); } catch (e) { console.log(`  ${theme} ${name}: ${String(e).split("\n")[0].slice(0, 90)}`); }
    await page.screenshot({ path: `${OUT}/${name}-${theme}.png` });
    await page.close();
  }
  await ctx.close();
}
await browser.close();
server.close();
console.log("done");
