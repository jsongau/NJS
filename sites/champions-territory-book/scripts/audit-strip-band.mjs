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
await new Promise((r) => server.listen(4185, r));

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto("http://localhost:4185/me/today", { waitUntil: "networkidle" });
await page.waitForTimeout(400);

async function probe(w, tag, hideFeature) {
  await page.setViewportSize({ width: w, height: 800 });
  await page.evaluate((hide) => {
    const el = document.querySelector("[data-featured='key']");
    if (el) el.style.display = hide ? "none" : "";
  }, hideFeature);
  await page.waitForTimeout(200);
  const r = await page.evaluate(() => {
    const bar = document.querySelector("[data-featured='key']").closest("nav");
    const items = [...bar.querySelectorAll("ul li a")].filter(
      (a) => a.getBoundingClientRect().width > 0,
    );
    const boxes = items.map((a) => {
      const b = a.getBoundingClientRect();
      const sp = a.querySelector("span");
      return { t: a.textContent.trim().slice(0, 24), x: b.x, r: b.right, w: b.width, sw: a.scrollWidth, cw: a.clientWidth };
    });
    let clipped = boxes.filter((b) => b.sw - b.cw > 1);
    let over = 0, worst = 0;
    for (let i = 0; i < boxes.length - 1; i++) {
      const o = boxes[i].r - boxes[i + 1].x;
      if (o > 0.5) { over++; worst = Math.max(worst, o); }
    }
    return { n: boxes.length, over, worst: Math.round(worst), clipped: clipped.map((c) => `${c.t}:${c.sw - c.cw}px`) };
  });
  console.log(`${tag} w=${w} feature=${hideFeature ? "hidden" : "shown"} keys=${r.n} boxOverlaps=${r.over} worst=${r.worst} contentClipped=[${r.clipped.join(", ")}]`);
  if (!hideFeature) {
    await page.screenshot({ path: `${OUT}/strip-${w}.png`, clip: { x: 0, y: 0, width: w, height: 64 } });
  }
}

for (const w of [1440, 1366, 1300, 1280, 1200, 1100, 1024, 960, 900, 899]) {
  await probe(w, "band", false);
}
console.log("--- with the featured key removed ---");
for (const w of [1280, 1024, 960, 900]) {
  await probe(w, "noFeat", true);
}

await browser.close();
server.close();
