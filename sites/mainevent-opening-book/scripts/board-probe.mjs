/**
 * Board probe. Throwaway measurement, not part of the application.
 *
 * Serves the production build, opens /map at 1440 and at 380, records the
 * moment the board becomes interactive, counts page and console errors,
 * checks for horizontal overflow, and writes a screenshot of each width.
 *
 * "Interactive" here is the first moment the reader can press the thing
 * the board exists for: the list pane's first organisation card is in the
 * document and hit testable. That is a stricter and more honest reading
 * than load, because the Leaflet container mounts long before any row is
 * pressable.
 */
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = "/tmp/work/me-prospecting/dist";
const BASE = "/me";
const OUT = process.env.PROBE_OUT || "/tmp/board-probe";
const RUNS = Number(process.env.PROBE_RUNS || 5);
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

await new Promise((r) => server.listen(0, r));
const port = server.address().port;
const url = `http://127.0.0.1:${port}${BASE}/map`;

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

const widths = [
  { name: "1440", width: 1440, height: 900 },
  { name: "380", width: 380, height: 820 },
];

let failures = 0;

for (const w of widths) {
  const times = [];
  for (let i = 0; i < RUNS; i += 1) {
    const context = await browser.newContext({
      viewport: { width: w.width, height: w.height },
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(`page: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(`console: ${m.text()}`);
    });

    const started = Date.now();
    await page.goto(url, { waitUntil: "commit" });
    await page.waitForSelector("[data-prospect-row]", { state: "attached" });
    const interactive = Date.now() - started;
    times.push(interactive);

    if (i === RUNS - 1) {
      await page.waitForTimeout(1200);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      await page.screenshot({
        path: path.join(OUT, `map-${w.name}.png`),
        fullPage: false,
      });
      if (overflow > 0) {
        failures += 1;
        console.log(`  OVERFLOW ${overflow}px at ${w.name}`);
      }
      for (const e of errors) {
        failures += 1;
        console.log(`  ERROR at ${w.name}: ${e}`);
      }
    }
    await context.close();
  }
  times.sort((a, b) => a - b);
  const median = times[Math.floor(times.length / 2)];
  console.log(
    `${w.name}: interactive median ${median}ms, all [${times.join(", ")}]`,
  );
}

await browser.close();
server.close();
console.log(failures === 0 ? "clean" : `${failures} problems`);
