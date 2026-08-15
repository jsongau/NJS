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
await new Promise((r) => server.listen(4188, r));

const TILE = fs.readFileSync("/tmp/work/me-prospecting/scripts/_tile.png");
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });

const ROUTES = ["/today", "/", "/requests", "/inbox", "/map", "/lanes", "/partners", "/promo", "/spend", "/packages", "/book", "/calendar", "/replies", "/field", "/objections", "/sent", "/coaching", "/method", "/leagues", "/leagues/1"];

// ---------- 1. horizontal overflow, every route, 1440 + 380 ----------
console.log("--- horizontal document overflow ---");
for (const [w, h] of [[1440, 900], [380, 780]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.route(/cartocdn/, (r) => r.fulfill({ status: 200, contentType: "image/png", body: TILE }));
  const page = await ctx.newPage();
  for (const r of ROUTES) {
    await page.goto("http://localhost:4188/me" + r, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const of = await page.evaluate(() => {
      const de = document.documentElement;
      const over = de.scrollWidth - de.clientWidth;
      let culprits = [];
      if (over > 0) {
        for (const el of document.querySelectorAll("*")) {
          const b = el.getBoundingClientRect();
          if (b.right > de.clientWidth + 1 && b.width > 0)
            culprits.push(`${el.tagName.toLowerCase()}.${(el.className.baseVal ?? el.className ?? "").toString().slice(0, 40)}=${Math.round(b.right)}`);
        }
      }
      return { over, culprits: culprits.slice(0, 4) };
    });
    if (of.over > 0) console.log(`  OVERFLOW ${w} ${r} +${of.over}px ${of.culprits.join(" ")}`);
  }
  console.log(`  ${w}: done`);
  await ctx.close();
}

// ---------- 2. coarse pointer 44px ----------
console.log("--- coarse pointer target sizes ---");
for (const [w, h] of [[1440, 900], [380, 780]]) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    hasTouch: true,
    isMobile: false,
  });
  await ctx.route(/cartocdn/, (r) => r.fulfill({ status: 200, contentType: "image/png", body: TILE }));
  const page = await ctx.newPage();
  // force coarse pointer media
  await page.emulateMedia({ media: "screen" });
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "pointer", value: "coarse" }, { name: "any-pointer", value: "coarse" }],
  });
  for (const r of ["/today", "/map"]) {
    await page.goto("http://localhost:4188/me" + r, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    const small = await page.evaluate(() => {
      const bad = [];
      for (const el of document.querySelectorAll("a[href], button, [role='button'], input, select, summary, [tabindex]:not([tabindex='-1'])")) {
        const b = el.getBoundingClientRect();
        if (b.width === 0 || b.height === 0) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || cs.display === "none") continue;
        if (b.height < 43.5 || b.width < 43.5) {
          bad.push(`${el.tagName.toLowerCase()}[${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 22)}] ${Math.round(b.width)}x${Math.round(b.height)}`);
        }
      }
      return bad;
    });
    console.log(`  ${w} ${r}: ${small.length} under 44px`);
    for (const s of small.slice(0, 12)) console.log(`     ${s}`);
  }
  await ctx.close();
}

// ---------- 3. keyboard: featured key + run controls, focus ring ----------
console.log("--- keyboard reach and visible focus ---");
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.route(/cartocdn/, (r) => r.fulfill({ status: 200, contentType: "image/png", body: TILE }));
  const page = await ctx.newPage();
  await page.goto("http://localhost:4188/me/today", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  let found = null;
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Tab");
    const at = await page.evaluate(() => {
      const a = document.activeElement;
      const slot = document.querySelector("[data-featured='key']");
      if (!slot.contains(a)) return null;
      const cs = getComputedStyle(a);
      return { i: true, outline: cs.outlineWidth + " " + cs.outlineStyle + " " + cs.outlineColor, offset: cs.outlineOffset, shadow: cs.boxShadow.slice(0, 90), name: a.textContent.trim().slice(0, 30) };
    });
    if (at) { found = { tabs: i + 1, ...at }; break; }
  }
  console.log("  featured key:", JSON.stringify(found));

  await page.goto("http://localhost:4188/me/map", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  for (const nm of [/Put the run on the board/i, /Offer the next of/i]) {
    const btn = page.getByRole("button", { name: nm }).first();
    const n = await btn.count();
    if (!n) { console.log(`  ${nm} NOT FOUND`); continue; }
    await btn.focus();
    const st = await page.evaluate(() => {
      const a = document.activeElement;
      const cs = getComputedStyle(a);
      return { name: (a.getAttribute("aria-label") || a.textContent).trim().slice(0, 34), outline: `${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor}`, offset: cs.outlineOffset, focusVisible: a.matches(":focus-visible") };
    });
    console.log("  run control:", JSON.stringify(st));
  }
  // Escape out of the takeover
  const before = page.url();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);
  console.log(`  Escape: ${before} -> ${page.url()}`);
  // visible back control
  await page.goto("http://localhost:4188/me/map", { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  const back = page.getByRole("button", { name: /back to the console/i }).first();
  console.log("  visible exit control present:", (await back.count()) > 0);
  await back.click();
  await page.waitForTimeout(600);
  console.log("  after clicking exit:", page.url());
  await ctx.close();
}

// ---------- 4. drawer focus trap at 380 ----------
console.log("--- drawer focus trap 380 ---");
{
  const ctx = await browser.newContext({ viewport: { width: 380, height: 780 } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:4188/me/today", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: /^Menu$/i }).first().click();
  await page.waitForTimeout(400);
  const drawerId = await page.evaluate(() => document.querySelector("[aria-expanded='true'][aria-controls]")?.getAttribute("aria-controls"));
  let escapes = 0;
  for (let i = 0; i < 45; i++) {
    await page.keyboard.press("Tab");
    const inside = await page.evaluate((id) => {
      const d = document.getElementById(id);
      const a = document.activeElement;
      return !!(d && (d.contains(a) || a === d)) || (a.getAttribute && a.getAttribute("aria-controls") === id);
    }, drawerId);
    if (!inside) escapes++;
  }
  console.log(`  drawer=${drawerId} focus left the trap ${escapes} times in 45 tabs`);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  const home = await page.evaluate(() => (document.activeElement.textContent || "").trim().slice(0, 20));
  console.log(`  after Escape focus is on: "${home}"`);
  await ctx.close();
}

// ---------- 5. board TTI at 1440 ----------
console.log("--- board time to interactive, 1440 ---");
{
  const samples = [];
  for (let i = 0; i < 5; i++) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.route(/cartocdn/, (r) => r.fulfill({ status: 200, contentType: "image/png", body: TILE }));
    const page = await ctx.newPage();
    const t0 = Date.now();
    await page.goto("http://localhost:4188/me/map", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("text=Put the run on the board", { timeout: 20000 });
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    samples.push(Date.now() - t0);
    await ctx.close();
  }
  samples.sort((a, b) => a - b);
  console.log(`  samples ${samples.join(", ")} median=${samples[2]}ms`);
}

await browser.close();
server.close();
