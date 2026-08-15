/**
 * The segments board, photographed.
 *
 * Throwaway proof, not part of the application. It serves the production
 * build, forces each ground on the browser CONTEXT as well as the
 * attribute — the ThemeProvider writes the attribute back from the system
 * preference on mount, and a run that only sets the attribute silently
 * photographs the light ground twice — and writes a full page shot of the
 * board under each weighting.
 *
 * The whole claim of that screen is that the ranking moves when the
 * weighting moves. A screenshot of the default state alone does not show
 * that, so this takes the default and the pre-opening preset side by side.
 *
 * Run: node scripts/shot-segments.mjs
 */
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = "/tmp/work/me-prospecting/dist";
const BASE = "/me";
const OUT = "/tmp/shots-segments";
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json",
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
await new Promise((r) => server.listen(4187, r));

const SHOTS = [
  ["/segments", "01-default"],
  ["/segments?weights=pre-opening", "02-pre-opening"],
  ["/segments?weights=reach&open=62", "03-reach-open-health"],
  ["/lanes", "04-lanes-for-comparison"],
];

const TILE = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGN4cOcKAAUwApGnG1K1AAAAAElFTkSuQmCC",
  "base64",
);

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-sandbox"],
});

let errors = 0;
for (const theme of ["dark", "light"]) {
  for (const [width, tag] of [[1440, "desktop"], [380, "mobile"]]) {
    const ctx = await browser.newContext({
      viewport: { width, height: width === 380 ? 820 : 1000 },
      deviceScaleFactor: 2,
      colorScheme: theme,
    });
    /* The tile server is unreachable from this container and the map is
       reachable from the rail, so every route request would otherwise log
       a failed resource and be counted as an error. Serve a 1x1 instead of
       pretending the network is there. */
    await ctx.route("**://*.basemaps.cartocdn.com/**", (r) =>
      r.fulfill({ status: 200, contentType: "image/png", body: TILE }),
    );
    /* THE TYPE IN THESE SHOTS IS NOT THE TYPE IN PRODUCTION. index.html
       pulls Rubik, Inter and Azeret Mono from Google Fonts, and this
       container has no route to fonts.googleapis.com, so the request fails
       and the browser falls back to its own stack. Fulfilling it with an
       empty sheet keeps the run honest — one failed resource per page was
       being counted as an application error, which it is not — but the
       reader should know the letterforms below are a stand-in and the
       metrics are close rather than exact. */
    await ctx.route("**://fonts.googleapis.com/**", (r) =>
      r.fulfill({ status: 200, contentType: "text/css", body: "" }),
    );
    /* documentElement is null on the initial about:blank that an init
       script also runs against, so this guards rather than throwing a page
       error the run would then count against the application. */
    await ctx.addInitScript((t) => {
      const set = () => {
        if (document.documentElement) document.documentElement.dataset.theme = t;
      };
      set();
      document.addEventListener("DOMContentLoaded", set);
      try { localStorage.setItem("opening-book.theme", JSON.stringify(t)); } catch { /* private mode */ }
    }, theme);
    const page = await ctx.newPage();
    page.on("pageerror", (e) => { errors += 1; console.error("PAGE ERROR", e.message); });
    page.on("console", (m) => {
      if (m.type() === "error") { errors += 1; console.error("CONSOLE", m.text()); }
    });

    for (const [route, name] of SHOTS) {
      await page.goto(`http://127.0.0.1:4187${BASE}${route}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);
      const ground = await page.evaluate(
        () => getComputedStyle(document.documentElement).getPropertyValue("--surface-0").trim(),
      );
      const wide = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      if (wide) { errors += 1; console.error(`OVERFLOW ${theme} ${tag} ${route}`); }
      /* THE SHELL SCROLLS, NOT THE DOCUMENT. A fullPage shot of this
         application returns exactly one viewport, because the route area
         is its own overflow container and the document never grows. So
         this walks that container instead, one viewport at a time, which
         is the only way to photograph a long screen here. */
      const shots = await page.evaluate(() => {
        /* The rail also scrolls, and it appears first in document order,
           so a `find` picks the wrong element and photographs a navigation
           column moving past a stationary page. Take the DEEPEST scroll
           instead: the route area is by a wide margin the tallest thing
           that overflows. */
        const el = [...document.querySelectorAll("*")]
          .filter(
            (n) => n.scrollHeight > n.clientHeight + 40 &&
              getComputedStyle(n).overflowY !== "visible" &&
              n.clientHeight > 300,
          )
          .sort((a, b) => (b.scrollHeight - b.clientHeight) - (a.scrollHeight - a.clientHeight))[0];
        if (!el) return 1;
        el.dataset.shotScroller = "true";
        return Math.min(6, Math.ceil(el.scrollHeight / el.clientHeight));
      });
      for (let i = 0; i < shots; i += 1) {
        await page.evaluate((n) => {
          const el = document.querySelector("[data-shot-scroller]");
          if (el) el.scrollTop = n * (el.clientHeight - 40);
        }, i);
        await page.waitForTimeout(250);
        await page.screenshot({
          path: path.join(OUT, `${name}-${theme}-${tag}-${i}.png`),
        });
      }
      console.log(`${theme.padEnd(6)}${tag.padEnd(9)}${route.padEnd(38)}ground=${ground}`);
    }
    await ctx.close();
  }
}

await browser.close();
server.close();
console.log(errors === 0 ? "\nno page errors, no console errors, no horizontal overflow" : `\n${errors} PROBLEMS`);
process.exit(errors === 0 ? 0 : 1);
