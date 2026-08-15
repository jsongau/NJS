/**
 * Proof pass for the three supply-side routes.
 *
 * Serves the production build, opens /partners, /promo and /spend at 1440
 * and at 380, collects every page error and every console error, checks
 * the document does not scroll sideways at either width, and drives a few
 * controls on each so the assertions cover the page after a filter rather
 * than only on first paint.
 *
 * It lives under scripts/ rather than /tmp because module resolution walks
 * up from the script's own directory and playwright is installed here.
 */
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = "/tmp/work/me-prospecting/dist";
const BASE = "/me";
const OUT = "/tmp/shots-supply";
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
await new Promise((r) => server.listen(4181, r));

const ROUTES = [
  ["/partners", "partners"],
  ["/promo", "promo"],
  ["/spend", "spend"],
];

const problems = [];
const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

for (const [w, h, label] of [
  [1440, 900, "desktop"],
  [380, 820, "mobile"],
]) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: 1,
  });
  await ctx.route(/fonts\.googleapis\.com|fonts\.gstatic\.com/, (r) =>
    r.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );

  for (const [route, name] of ROUTES) {
    const page = await ctx.newPage();
    page.on("pageerror", (e) =>
      problems.push(`${label} ${route}: pageerror ${e.message}`),
    );
    page.on("console", (m) => {
      if (m.type() === "error")
        problems.push(`${label} ${route}: console ${m.text()}`);
    });

    await page.goto(`http://localhost:4181${BASE}${route}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(900);

    /* Drive the controls, so the assertions cover a filtered page too. A
       screen that only holds up on first paint has not been tested. */
    const buttons = await page.$$("main button[aria-pressed]");
    for (const b of buttons.slice(0, 4)) {
      await b.click().catch(() => {});
      await page.waitForTimeout(120);
    }
    await page.waitForTimeout(400);

    const measure = () =>
      page.evaluate(() => {
        let tallest = document.documentElement.scrollHeight;
        const overflowX =
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth + 1;
        for (const el of document.querySelectorAll("*")) {
          const cs = getComputedStyle(el);
          if (
            /(auto|scroll)/.test(cs.overflowY) &&
            el.scrollHeight > el.clientHeight + 2
          ) {
            tallest = Math.max(tallest, el.scrollHeight + 120);
          }
        }
        /* Tap targets. Every interactive control on these three screens is
           supposed to clear 44px, which is the one accessibility figure
           easiest to lose to a late padding change. */
        let small = 0;
        for (const el of document.querySelectorAll(
          "main button, main a, main input, main select",
        )) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) continue;
          const inline = getComputedStyle(el).display === "inline";
          if (!inline && r.height < 44) small += 1;
        }
        return {
          h1: document.querySelector("h1")?.textContent?.trim() ?? null,
          docH: tallest,
          docW: document.documentElement.scrollWidth,
          clientW: document.documentElement.clientWidth,
          overflowX,
          small,
          tables: document.querySelectorAll("main table").length,
          badges: document.querySelectorAll('[class*="badge"]').length,
        };
      });

    let info = await measure();
    if (info.docH > h) {
      await page.setViewportSize({
        width: w,
        height: Math.min(info.docH, 20000),
      });
      await page.waitForTimeout(500);
      info = await measure();
    }
    if (info.overflowX)
      problems.push(
        `${label} ${route}: horizontal overflow, scrollWidth ${info.docW} against clientWidth ${info.clientW}`,
      );
    if (info.small > 0)
      problems.push(
        `${label} ${route}: ${info.small} block-level controls under 44px tall`,
      );

    console.log(
      `${label.padEnd(8)} ${route.padEnd(12)} h=${String(info.docH).padStart(6)} w=${String(info.docW).padStart(5)}/${info.clientW} ${info.overflowX ? "OVERFLOW " : "no-overflow "} tables=${info.tables} badges=${info.badges} small=${info.small} h1="${info.h1}"`,
    );

    await page.screenshot({ path: `${OUT}/${label}-${name}.png` });
    await page.close();
  }
  await ctx.close();
}

await browser.close();
server.close();

console.log("\n=== PROBLEMS ===");
console.log(problems.length ? problems.join("\n") : "none");
process.exit(problems.length ? 1 : 0);
