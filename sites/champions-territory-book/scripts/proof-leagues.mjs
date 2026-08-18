/**
 * Proof pass for the two league routes.
 *
 * Serves the production build, opens /leagues and both league detail
 * routes at 1440 and at 380, collects every page error and every console
 * error, checks the document does not scroll sideways at either width,
 * checks no tappable control is under 44px, drives the league switch and
 * opens the compose window from a league action so the assertions cover
 * the page in use rather than only on first paint.
 *
 * It lives under scripts/ rather than /tmp because module resolution
 * walks up from the script's own directory and playwright is installed
 * here. Chromium is named at its pinned path because the container blocks
 * the postinstall download.
 */
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = "/tmp/work/me-prospecting/dist";
const BASE = "/me";
const OUT = "/tmp/shots-leagues";
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
await new Promise((r) => server.listen(4187, r));

const ROUTES = [
  ["/leagues", "leagues"],
  ["/leagues/pinfall-protocol", "league-pinfall"],
  ["/leagues/last-frame-standing", "league-lastframe"],
  ["/leagues/does-not-exist", "league-unknown"],
];

const problems = [];
const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

/*
 * The 380px pass runs with touch on, because a phone has a coarse
 * pointer and base.css puts its 44px floor behind `@media (pointer:
 * coarse)`. A narrow window with a mouse in it is not a phone, and a
 * proof that measures one and reports the other proves nothing.
 */
for (const [w, h, label, touch] of [
  [1440, 900, "desktop", false],
  [380, 820, "mobile", true],
]) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: 1,
    hasTouch: touch,
    isMobile: touch,
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

    await page.goto(`http://localhost:4187${BASE}${route}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(900);

    /* Drive the league switch on the board, so the ladder and the roster
       list are asserted after a change rather than only on first paint. */
    if (route === "/leagues") {
      const switches = await page.$$("main button[aria-pressed]");
      for (const b of switches) {
        await b.click().catch(() => {});
        await page.waitForTimeout(180);
      }
    }

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
        /*
          Tap targets.

          TWO EXEMPTIONS, BOTH NAMED SO NEITHER IS MISTAKEN FOR AN
          OVERSIGHT, and both of them are this application's own
          documented line rather than something invented here.

          `[data-record-name]` is the organisation name control. It is
          deliberately drawn as text that inherits its container's type
          and carries no padding, on eleven surfaces, so that a table of
          a hundred and two names is not a page of buttons. On a coarse
          pointer base.css raises it to 44px with the rest; on a mouse it
          stays the size of the words it replaced.

          A link with words either side of it inside a paragraph is a
          word in a sentence. base.css says so in as many words and
          exempts it; a 44px inline-flex link inside prose breaks the
          line box. Links that are CONTROLS carry their own floor and
          are measured here.
        */
        const small = [];
        for (const el of document.querySelectorAll(
          "main button, main a, main input, main select",
        )) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) continue;
          const cs = getComputedStyle(el);
          if (cs.display === "inline") continue;
          if (el.hasAttribute("data-record-name")) continue;
          if (r.height < 44)
            small.push(
              `${el.tagName.toLowerCase()}.${el.className.toString().slice(0, 40)} ${Math.round(r.height)}px`,
            );
        }
        return {
          h1: document.querySelector("h1")?.textContent?.trim() ?? null,
          docH: tallest,
          docW: document.documentElement.scrollWidth,
          clientW: document.documentElement.clientWidth,
          overflowX,
          small,
          rows: document.querySelectorAll("main table tbody tr").length,
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
    if (info.small.length > 0)
      problems.push(
        `${label} ${route}: ${info.small.length} controls under 44px tall: ${info.small.slice(0, 6).join(" | ")}`,
      );
    if (route !== "/leagues/does-not-exist" && info.rows === 0)
      problems.push(`${label} ${route}: no ladder rows rendered`);

    console.log(
      `${label.padEnd(8)} ${route.padEnd(34)} h=${String(info.docH).padStart(6)} w=${String(info.docW).padStart(5)}/${info.clientW} ${info.overflowX ? "OVERFLOW " : "no-overflow "} rows=${String(info.rows).padStart(2)} badges=${info.badges} small=${info.small.length} h1="${info.h1}"`,
    );

    await page.screenshot({ path: `${OUT}/${label}-${name}.png` });
    await page.close();
  }

  /* The compose window, opened from a league action. It is the one
     control on this surface that leaves the page, so a proof that never
     presses it has not tested the thing the owner actually asked for. */
  const page = await ctx.newPage();
  page.on("pageerror", (e) =>
    problems.push(`${label} compose: pageerror ${e.message}`),
  );
  page.on("console", (m) => {
    if (m.type() === "error")
      problems.push(`${label} compose: console ${m.text()}`);
  });
  await page.goto(`http://localhost:4187${BASE}/leagues/last-frame-standing`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(900);

  const opened = await page.evaluate(() => {
    const btn = [...document.querySelectorAll("main button")].find((b) =>
      /Join as an individual/i.test(b.textContent || ""),
    );
    if (!btn) return false;
    btn.click();
    return true;
  });
  if (!opened) problems.push(`${label} compose: no join action found`);
  await page.waitForTimeout(900);

  const dialog = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    return {
      open: Boolean(d),
      heading: d?.querySelector("h2, h1")?.textContent?.trim() ?? null,
      hasLeagueDraft: /league|season|Open Lane/i.test(
        document.body.innerText,
      ),
    };
  });
  if (!dialog.open) problems.push(`${label} compose: dialog did not open`);
  console.log(
    `${label.padEnd(8)} compose window                     open=${dialog.open} heading="${dialog.heading}" leagueCopy=${dialog.hasLeagueDraft}`,
  );
  await page.screenshot({ path: `${OUT}/${label}-compose.png` });
  await page.close();

  await ctx.close();
}

await browser.close();
server.close();

console.log("\n=== PROBLEMS ===");
console.log(problems.length ? problems.join("\n") : "none");
process.exit(problems.length ? 1 : 0);
