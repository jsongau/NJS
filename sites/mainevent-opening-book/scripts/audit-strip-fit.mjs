import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = "/tmp/work/me-prospecting/dist";
const BASE = "/me";
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
await new Promise((r) => server.listen(4184, r));

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const widths = [];
for (let w = 1440; w >= 360; w -= 10) widths.push(w);
widths.push(899, 901, 1023, 1025, 767, 769);
widths.sort((a, b) => b - a);

const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://localhost:4184/me/today", { waitUntil: "networkidle" });

const rows = [];
for (const w of widths) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.waitForTimeout(90);
  const r = await page.evaluate(() => {
    const feat = document.querySelector("[data-featured='key']");
    if (!feat) return { err: "no featured key" };
    let bar = feat;
    while (bar && !(bar.querySelector("nav") && bar.querySelector("button"))) bar = bar.parentElement;
    const items = [...bar.querySelectorAll("nav ul li a")];
    const boxes = items.map((a) => {
      const rr = a.getBoundingClientRect();
      return { t: a.innerText.replace(/\s+/g, " ").trim(), x: rr.x, r: rr.right, w: rr.width, h: rr.height };
    });
    let overlap = 0, worst = 0, pair = "";
    for (let i = 0; i < boxes.length - 1; i++) {
      const o = boxes[i].r - boxes[i + 1].x;
      if (o > 0.5) { overlap++; if (o > worst) { worst = o; pair = boxes[i].t + " / " + boxes[i + 1].t; } }
    }
    const fb = feat.getBoundingClientRect();
    const barB = bar.getBoundingClientRect();
    const featOut = fb.right - barB.right;
    const de = document.documentElement;
    return {
      visible: boxes.length,
      labels: boxes.map((b) => b.t),
      overlap, worst: Math.round(worst), pair,
      featRight: Math.round(fb.right), barRight: Math.round(barB.right), featOut: Math.round(featOut),
      featW: Math.round(fb.width), featH: Math.round(fb.height),
      navScrollW: Math.round(bar.querySelector("nav").scrollWidth),
      navClientW: Math.round(bar.querySelector("nav").clientWidth),
      docOverflow: de.scrollWidth - de.clientWidth,
    };
  });
  rows.push({ w, ...r });
}
for (const r of rows) {
  const flag = r.overlap > 0 || r.docOverflow > 0 || r.featOut > 1 ? " <<<" : "";
  console.log(
    `${String(r.w).padStart(4)} keys=${r.visible} overlaps=${r.overlap} worst=${String(r.worst).padStart(3)}px navScroll=${r.navScrollW}/${r.navClientW} featOut=${r.featOut} docOF=${r.docOverflow}${flag} ${r.pair || ""}`,
  );
}
await browser.close();
server.close();
