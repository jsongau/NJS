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
await new Promise((r) => server.listen(4187, r));

const TILE = fs.readFileSync("/tmp/work/me-prospecting/scripts/_tile.png");
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });

const SCAN = `(() => {
  const ms = (v) => v.split(",").map((s) => {
    s = s.trim();
    if (s.endsWith("ms")) return parseFloat(s);
    if (s.endsWith("s")) return parseFloat(s) * 1000;
    return 0;
  });
  const out = [];
  const walk = (root) => {
    for (const el of root.querySelectorAll("*")) {
      for (const pe of ["", "::before", "::after"]) {
        const cs = getComputedStyle(el, pe || undefined);
        const td = Math.max(0, ...ms(cs.transitionDuration), 0);
        const tdel = Math.max(0, ...ms(cs.transitionDelay), 0);
        const ad = Math.max(0, ...ms(cs.animationDuration), 0);
        const adel = Math.max(0, ...ms(cs.animationDelay), 0);
        const name = cs.animationName;
        if (td + tdel > 0 || (ad > 0 && name !== "none")) {
          out.push({
            tag: el.tagName.toLowerCase(),
            pe,
            cls: (el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className || "").toString().slice(0, 70),
            td, tdel, ad, adel, name,
            prop: cs.transitionProperty,
            iter: cs.animationIterationCount,
          });
        }
      }
    }
  };
  walk(document);
  return out;
})()`;

async function run(reduced) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ...(reduced ? { reducedMotion: "reduce" } : {}),
  });
  await ctx.route(/cartocdn/, (r) => r.fulfill({ status: 200, contentType: "image/png", body: TILE }));
  const page = await ctx.newPage();
  const label = reduced ? "REDUCED" : "NORMAL ";

  // --- the featured key -------------------------------------------
  await page.goto("http://localhost:4187/me/today", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const key = await page.evaluate(() => {
    const slot = document.querySelector("[data-featured='key']");
    const a = slot.querySelector("a");
    const r = [];
    for (const [n, el] of [["slot", slot], ["key", a], ["label", a.querySelector("span")], ["mark", a.querySelector("svg")]]) {
      for (const pe of ["", "::before", "::after"]) {
        const cs = getComputedStyle(el, pe || undefined);
        r.push({ n, pe, td: cs.transitionDuration, prop: cs.transitionProperty, an: cs.animationName, ad: cs.animationDuration, it: cs.animationIterationCount });
      }
    }
    return r;
  });
  console.log(`\n=== ${label} featured key ===`);
  for (const k of key) console.log(` ${k.n}${k.pe} transition=${k.td} (${k.prop}) animation=${k.an}/${k.ad} x${k.it}`);

  let worst = { ms: 0, what: "" };
  const record = (rows, where) => {
    for (const r of rows) {
      const t = Math.max(r.td + r.tdel, r.name !== "none" ? r.ad + r.adel : 0);
      if (t > worst.ms) worst = { ms: t, what: `${where} ${r.tag}.${r.cls}${r.pe} td=${r.td}+${r.tdel} an=${r.name} ${r.ad}+${r.adel} x${r.iter} [${r.prop}]` };
    }
  };
  record(await page.evaluate(SCAN), "/today");

  // --- the board: arrival, run selection, refit --------------------
  await page.goto("http://localhost:4187/me/map", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  record(await page.evaluate(SCAN), "/map arrival");

  const take = page.getByRole("button", { name: /Put the run on the board/i });
  await take.first().click();
  await page.waitForTimeout(120);
  record(await page.evaluate(SCAN), "/map run taken");
  await page.waitForTimeout(1500);

  // Leaflet's own pan/zoom animation on the refit.
  const leaf = await page.evaluate(() => {
    const out = [];
    for (const sel of [".leaflet-map-pane", ".leaflet-tile", ".leaflet-zoom-animated", ".leaflet-marker-icon"]) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const cs = getComputedStyle(el);
      out.push({ sel, td: cs.transitionDuration, prop: cs.transitionProperty, an: cs.animationName, ad: cs.animationDuration });
    }
    return out;
  });
  console.log(` leaflet:`, JSON.stringify(leaf));

  console.log(` WORST ${label}: ${worst.ms}ms -- ${worst.what}`);
  await ctx.close();
  return worst;
}

await run(false);
await run(true);

await browser.close();
server.close();
