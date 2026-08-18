/**
 * Two grounds, side by side, plus the greyscale check on the nine lanes.
 *
 * Throwaway proof, not part of the application. It serves the production
 * build, sets <html data-theme> by hand rather than through the toggle, and
 * writes a full page shot of each route on each ground so the two can be
 * looked at rather than only measured. A palette that measures clean and
 * looks like a hospital form is a fail, and no audit catches that.
 *
 * The lane strip at the end is rendered on the lane board and then read back
 * through a luminance preserving desaturation, which is what a monochrome
 * print and a greyscale filter both do. The nine lanes have to fall into
 * three flat value bands, in both grounds, because that is the separation
 * that survives a reader with no colour vision at all.
 *
 * Run: node scripts/shot-both-grounds.mjs
 */
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = "/tmp/work/me-prospecting/dist";
const BASE = "/me";
const OUT = "/tmp/shots-grounds";
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

const TILE = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGN4cOcKAAUwApGnG1K1AAAAAElFTkSuQmCC",
  "base64",
);

const ROUTES = [
  ["/today", "00-today"],
  ["/", "01-desk"],
  ["/map", "02-trade-area"],
  ["/lanes", "03-lanes"],
  ["/packages", "04-packages"],
  ["/book", "05-book"],
  ["/book/week", "06-week-sheet"],
  ["/field", "08-field"],
  ["/calendar", "09-capacity"],
  ["/method", "13-method"],
  ["/quote/brea-olinda-high-school", "14-quote"],
];

const LANES = [
  "schools",
  "colleges",
  "fitness",
  "local-retail-food",
  "auto",
  "corporate",
  "healthcare",
  "hospitality",
  "faith",
];

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});
const problems = [];

for (const theme of ["dark", "light"]) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  await ctx.route(/cartocdn\.com|tile\.openstreetmap/, (r) =>
    r.fulfill({ status: 200, contentType: "image/png", body: TILE }),
  );
  await ctx.route(/fonts\.googleapis\.com|fonts\.gstatic\.com/, (r) =>
    r.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
  await ctx.addInitScript((t) => {
    const apply = () => {
      if (document.documentElement) document.documentElement.dataset.theme = t;
    };
    apply();
    document.addEventListener("DOMContentLoaded", apply);
  }, theme);

  for (const [route, name] of ROUTES) {
    const page = await ctx.newPage();
    page.on("pageerror", (e) => problems.push(`${theme} ${route}: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error") problems.push(`${theme} ${route}: console ${m.text()}`);
    });
    await page.goto(`http://localhost:4183${BASE}${route}`, {
      waitUntil: "domcontentloaded",
    });
    await page.evaluate((t) => {
      document.documentElement.dataset.theme = t;
    }, theme);
    await page.waitForTimeout(route === "/map" ? 2600 : 1100);

    const h = await page.evaluate(() => {
      let tallest = document.documentElement.scrollHeight;
      for (const el of document.querySelectorAll("*")) {
        const cs = getComputedStyle(el);
        if (/(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 2) {
          tallest = Math.max(tallest, el.scrollHeight + 120);
        }
      }
      return tallest;
    });
    if (h > 900) {
      await page.setViewportSize({ width: 1440, height: Math.min(h, 12000) });
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: `${OUT}/${theme}-${name}.png` });
    console.log(`${theme.padEnd(6)} ${route.padEnd(34)} h=${h}`);
    await page.close();
  }

  /* Greyscale. Read the nine lane inks and their tints straight off the
     computed custom properties, desaturate preserving luminance, and print
     the value bands. */
  const page = await ctx.newPage();
  await page.goto(`http://localhost:4183${BASE}/lanes`, {
    waitUntil: "domcontentloaded",
  });
  await page.evaluate((t) => {
    document.documentElement.dataset.theme = t;
  }, theme);
  await page.waitForTimeout(900);
  const greys = await page.evaluate((lanes) => {
    const cs = getComputedStyle(document.documentElement);
    const lin = (v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const enc = (y) =>
      Math.round(255 * (y <= 0.0031308 ? y * 12.92 : 1.055 * Math.pow(y, 1 / 2.4) - 0.055));
    return lanes.map((ln) => {
      const hex = cs.getPropertyValue(`--lane-${ln}`).trim();
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
      const y = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      return { lane: ln, hex, grey: enc(y) };
    });
  }, LANES);
  console.log(`\n${theme} greyscale, nine lanes`);
  for (const g of greys) console.log(`  ${g.lane.padEnd(20)} ${g.hex}  grey ${g.grey}`);

  /* Cluster rather than group on equality. Two lanes in the same band can
     land a code apart after the trip through 8 bit sRGB, and a check that
     calls that a fourth band is measuring rounding rather than the palette.
     What matters is the number of clusters and the CONTRAST between them,
     because 8 bit distance is not perceptual: the same twelve points of L*
     buy fewer codes at the bottom of the range than at the top and would
     make the light ground look worse than it is. */
  const sorted = [...greys].sort((a, b) => a.grey - b.grey);
  const clusters = [[sorted[0]]];
  for (const g of sorted.slice(1)) {
    const last = clusters[clusters.length - 1];
    if (g.grey - last[last.length - 1].grey <= 4) last.push(g);
    else clusters.push([g]);
  }
  const lin = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const mid = clusters.map((c) => c.reduce((s, g) => s + g.grey, 0) / c.length);
  console.log(
    `  bands: ${mid.map((m) => m.toFixed(1)).join(", ")}  (${clusters.length} value bands, ${clusters.map((c) => c.length).join("/")} lanes each)`,
  );
  if (clusters.length !== 3) {
    problems.push(`${theme}: nine lanes fall into ${clusters.length} grey bands, not three`);
  }
  for (let i = 1; i < mid.length; i++) {
    const r = (lin(mid[i]) + 0.05) / (lin(mid[i - 1]) + 0.05);
    console.log(`    band ${i} to band ${i + 1}: ${r.toFixed(2)}:1 in greyscale`);
    if (r < 1.4) {
      problems.push(`${theme}: grey bands ${i} and ${i + 1} are only ${r.toFixed(2)}:1 apart`);
    }
  }
  await page.close();
  await ctx.close();
}

await browser.close();
server.close();

console.log("\n=== PROBLEMS ===");
console.log(problems.length ? problems.join("\n") : "none");
if (problems.length) process.exitCode = 1;
