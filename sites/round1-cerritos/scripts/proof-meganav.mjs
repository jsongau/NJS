/**
 * Throwaway proof for the mega nav, the drawer and the 380px layout.
 *
 * Serves the production build, then at 380 x 820 with touch emulation
 * (so `(pointer: coarse)` actually matches) it measures the hamburger,
 * walks the focus trap, presses Escape, checks focus came home, and
 * asserts that no route has horizontal document overflow at 380 or at
 * 1440. Everything it prints is a measurement, not a claim.
 *
 * It lives under scripts/ because module resolution walks up from the
 * script's own directory and a file in /tmp cannot find playwright.
 */
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = "/tmp/work/me-prospecting/dist";
const BASE = "/me";
const PORT = 4191;

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
await new Promise((r) => server.listen(PORT, r));

const TILE = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGN4cOcKAAUwApGnG1K1AAAAAElFTkSuQmCC",
  "base64",
);

const ROUTES = [
  "/today",
  "/",
  "/requests",
  "/inbox",
  "/map",
  "/lanes",
  "/packages",
  "/book",
  "/book/week",
  "/replies",
  "/field",
  "/calendar",
  "/objections",
  "/sent",
  "/coaching",
  "/method",
  "/partners",
  "/promo",
  "/spend",
];

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

const problems = [];
const lines = [];

async function makeContext(width, height, touch) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    hasTouch: touch,
    isMobile: false,
  });
  await ctx.route(/cartocdn\.com|tile\.openstreetmap/, (r) =>
    r.fulfill({ status: 200, contentType: "image/png", body: TILE }),
  );
  await ctx.route(/fonts\.googleapis\.com|fonts\.gstatic\.com/, (r) =>
    r.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
  return ctx;
}

const overflow = async (page) =>
  page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    bodyScroll: document.body.scrollWidth,
  }));

// ---------------------------------------------------------------
// 1. Horizontal overflow, every route, both widths
// ---------------------------------------------------------------

for (const [w, h, label, touch] of [
  [1440, 900, "1440", false],
  [380, 820, "380", true],
]) {
  const ctx = await makeContext(w, h, touch);
  for (const route of ROUTES) {
    const page = await ctx.newPage();
    page.on("pageerror", (e) => problems.push(`${label} ${route}: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error")
        problems.push(`${label} ${route}: console ${m.text()}`);
    });
    await page.goto(`http://localhost:${PORT}${BASE}${route}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(route === "/map" ? 2400 : 700);
    const o = await overflow(page);
    const over = o.scrollWidth - o.clientWidth;
    lines.push(
      `overflow ${label.padEnd(4)} ${route.padEnd(12)} scrollWidth ${o.scrollWidth} clientWidth ${o.clientWidth} over ${over}`,
    );
    if (over > 0) problems.push(`${label} ${route}: horizontal overflow ${over}px`);
    await page.close();
  }
  await ctx.close();
}

// ---------------------------------------------------------------
// 2. The hamburger and the drawer, at 380 with a coarse pointer
// ---------------------------------------------------------------

const ctx = await makeContext(380, 820, true);
const page = await ctx.newPage();
page.on("pageerror", (e) => problems.push(`drawer: ${e.message}`));
await page.goto(`http://localhost:${PORT}${BASE}/today`, {
  waitUntil: "domcontentloaded",
});
await page.waitForTimeout(800);

lines.push(
  `pointer coarse matches: ${await page.evaluate(() => matchMedia("(pointer: coarse)").matches)}`,
);

const burger = page.locator('button[aria-controls="shell-drawer"]');
const box = await burger.boundingBox();
lines.push(
  `hamburger box ${box.width.toFixed(1)} x ${box.height.toFixed(1)}, name "${await burger.innerText()}"`,
);
if (box.width < 44 || box.height < 44)
  problems.push(`hamburger is ${box.width}x${box.height}, under 44`);

lines.push(
  `hamburger aria-expanded before: ${await burger.getAttribute("aria-expanded")}`,
);

/* Every tappable thing on the strip, measured. This is the coarse
   pointer defect the audit raised, checked rather than assumed. */
const strip = await page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll(
    'button[aria-controls="shell-drawer"], nav[aria-label="The screens used every day"] a, a[aria-label^="R1"]',
  )) {
    const r = el.getBoundingClientRect();
    out.push({
      text: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 26),
      w: +r.width.toFixed(1),
      h: +r.height.toFixed(1),
    });
  }
  return out;
});
for (const t of strip) {
  /* Ranks four to six stand down at this width, so they measure zero.
     A target that is not on the strip is not a target. */
  if (t.w === 0 && t.h === 0) {
    lines.push(`strip target "${t.text}" stood down at 380`);
    continue;
  }
  lines.push(`strip target "${t.text}" ${t.w} x ${t.h}`);
  if (t.h < 44 || t.w < 44)
    problems.push(`strip target "${t.text}" is ${t.w}x${t.h}, under 44`);
}

/* The six become three, and nothing vanishes without the drawer. */
const visibleItems = await page.evaluate(() =>
  Array.from(
    document.querySelectorAll(
      'nav[aria-label="The screens used every day"] li',
    ),
  )
    .filter((li) => li.getBoundingClientRect().width > 0)
    .map((li) => li.textContent.trim()),
);
lines.push(`mega nav items visible at 380: ${JSON.stringify(visibleItems)}`);

// Open it.
await burger.click();
await page.waitForTimeout(500);
lines.push(
  `hamburger aria-expanded after open: ${await burger.getAttribute("aria-expanded")}`,
);
lines.push(
  `main inert while open: ${await page.evaluate(() => document.getElementById("main").hasAttribute("inert"))}`,
);
lines.push(
  `main aria-hidden while open: ${await page.evaluate(() => document.getElementById("main").getAttribute("aria-hidden"))}`,
);
lines.push(
  `drawer inert while open: ${await page.evaluate(() => document.getElementById("shell-drawer").hasAttribute("inert"))}`,
);
lines.push(
  `document scrollable while open: ${await page.evaluate(() => document.documentElement.scrollHeight > document.documentElement.clientHeight)}`,
);
lines.push(
  `page scroller frozen while open: ${await page.evaluate(() => {
    const main = document.getElementById("main");
    for (const c of main.children) {
      const cs = getComputedStyle(c);
      if (c.scrollHeight > c.clientHeight + 2 || cs.overflowY === "hidden")
        return cs.overflowY;
    }
    return "no scroller found";
  })}`,
);

const insideDrawer = () =>
  page.evaluate(
    () =>
      !!document
        .getElementById("shell-drawer")
        ?.contains(document.activeElement),
  );

lines.push(`focus inside drawer on open: ${await insideDrawer()}`);
lines.push(
  `first focused: ${await page.evaluate(() => (document.activeElement.textContent || "").trim().slice(0, 30))}`,
);

/* Tab forty times. If the trap holds, focus never leaves the drawer. */
let escapes = 0;
for (let i = 0; i < 40; i += 1) {
  await page.keyboard.press("Tab");
  if (!(await insideDrawer())) escapes += 1;
}
lines.push(`focus left the drawer on ${escapes} of 40 forward tabs`);
if (escapes > 0) problems.push(`focus trap leaked forward ${escapes} times`);

let backEscapes = 0;
for (let i = 0; i < 12; i += 1) {
  await page.keyboard.press("Shift+Tab");
  if (!(await insideDrawer())) backEscapes += 1;
}
lines.push(`focus left the drawer on ${backEscapes} of 12 backward tabs`);
if (backEscapes > 0) problems.push(`focus trap leaked backward ${backEscapes} times`);

// Escape closes it, and focus comes home.
await page.keyboard.press("Escape");
await page.waitForTimeout(500);
lines.push(
  `aria-expanded after Escape: ${await burger.getAttribute("aria-expanded")}`,
);
const home = await page.evaluate(
  () => document.activeElement?.getAttribute("aria-controls") === "shell-drawer",
);
lines.push(`focus returned to the hamburger after Escape: ${home}`);
if (!home) problems.push("focus did not return to the hamburger after Escape");
lines.push(
  `main inert after close: ${await page.evaluate(() => document.getElementById("main").hasAttribute("inert"))}`,
);
lines.push(
  `drawer inert after close: ${await page.evaluate(() => document.getElementById("shell-drawer").hasAttribute("inert"))}`,
);

// A link inside the drawer closes it, and focus comes home.
await burger.click();
await page.waitForTimeout(400);
await page.locator('#shell-drawer a[href$="/lanes"]').first().click();
await page.waitForTimeout(600);
lines.push(`path after following a drawer link: ${page.url().split(BASE)[1]}`);
lines.push(
  `aria-expanded after following a link: ${await burger.getAttribute("aria-expanded")}`,
);
const homeAfterLink = await page.evaluate(
  () => document.activeElement?.getAttribute("aria-controls") === "shell-drawer",
);
lines.push(`focus returned to the hamburger after a link: ${homeAfterLink}`);
if (!homeAfterLink)
  problems.push("focus did not return to the hamburger after a drawer link");

/* The map takeover drops the strip and the rail. Its own exit control has
   to be findable on a phone, because a phone has no Escape key. */
await page.goto(`http://localhost:${PORT}${BASE}/map`, {
  waitUntil: "domcontentloaded",
});
await page.waitForTimeout(2400);
lines.push(
  `mega nav present on /map: ${await page.locator('button[aria-controls="shell-drawer"]').count()}`,
);
const exits = await page.evaluate(() => {
  const out = [];
  for (const b of document.querySelectorAll("button")) {
    const t = (b.textContent || "").trim();
    if (/back|exit|close|leave/i.test(t)) {
      const r = b.getBoundingClientRect();
      if (r.width > 0 && r.top < 200)
        out.push({ text: t.slice(0, 32), w: +r.width.toFixed(1), h: +r.height.toFixed(1), top: +r.top.toFixed(1) });
    }
  }
  return out;
});
lines.push(`map exit controls above the fold: ${JSON.stringify(exits)}`);

await page.screenshot({ path: "/tmp/shots/meganav-380-map.png" });
await page.goto(`http://localhost:${PORT}${BASE}/today`, {
  waitUntil: "domcontentloaded",
});
await page.waitForTimeout(700);
await page.screenshot({ path: "/tmp/shots/meganav-380-today.png" });
await burger.click();
await page.waitForTimeout(500);
await page.screenshot({ path: "/tmp/shots/meganav-380-drawer.png" });

const wide = await makeContext(1440, 900, false);
const wp = await wide.newPage();
await wp.goto(`http://localhost:${PORT}${BASE}/today`, {
  waitUntil: "domcontentloaded",
});
await wp.waitForTimeout(700);
lines.push(
  `hamburger visible at 1440: ${await wp.locator('button[aria-controls="shell-drawer"]').isVisible()}`,
);
const wideItems = await wp.evaluate(() =>
  Array.from(
    document.querySelectorAll('nav[aria-label="The screens used every day"] li'),
  )
    .filter((li) => li.getBoundingClientRect().width > 0)
    .map((li) => li.textContent.trim()),
);
lines.push(`mega nav items visible at 1440: ${JSON.stringify(wideItems)}`);
await wp.screenshot({ path: "/tmp/shots/meganav-1440-today.png" });

await browser.close();
server.close();

fs.mkdirSync("/tmp/shots", { recursive: true });
console.log(lines.join("\n"));
console.log("\n--- problems ---");
console.log(problems.length ? problems.join("\n") : "none");
process.exit(problems.length ? 1 : 0);
