/**
 * MOBILE AUDIT. Measured, not eyeballed.
 *
 * Walks every screen at three phone widths in both modes and reports
 * only defects that can be measured, because "looks a bit cramped" is
 * not something anybody can act on or verify a fix against.
 *
 * WHAT IT CHECKS, and why each one is a real defect rather than taste:
 *
 *   OVERFLOW. document.scrollWidth greater than the viewport means the
 *   page scrolls sideways. On a phone that is the single worst layout
 *   failure there is: it makes vertical scrolling feel broken, it hides
 *   content off the right edge, and it happens to a whole page because
 *   of one element. The offender is reported by name, since finding it
 *   by hand in a 300 element tree is the actual work.
 *
 *   TAP TARGETS. Anything a finger presses smaller than 44 CSS pixels in
 *   either direction. That number is Apple's published minimum and it is
 *   the one accessibility figure a hiring manager might personally know.
 *   Elements inside a horizontally scrolling strip are exempted from the
 *   width half of the rule, because a chip row is a legitimate pattern
 *   and its chips are reached by scrolling rather than by precision.
 *
 *   TYPE SIZE. Body text under 12px. Below that a reader zooms, and a
 *   zoomed page on iOS then scrolls sideways, which is the first defect
 *   again by another route.
 *
 *   FORM CONTROL SIZE. Any input, select or textarea under 16px, because
 *   iOS Safari zooms the whole viewport when one under 16px takes focus
 *   and does not zoom back out. It is the most common mobile bug in
 *   existence and it is invisible on a desktop browser.
 *
 *   CLIPPED TEXT. An element whose content is wider than its own box
 *   with overflow hidden and no ellipsis, which is text silently cut in
 *   half rather than truncated honestly.
 *
 * It does NOT check anything subjective. No opinions about spacing.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";

const DIST = path.resolve(process.argv[2] ?? "dist");
const ONLY = process.argv[3];
const BASE = "/me";
const PORT = 4671;
const WIDTHS = [320, 360, 390];

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json", ".webmanifest": "application/manifest+json", ".woff2": "font/woff2", ".ico": "image/x-icon" };

const server = http.createServer((req, res) => {
  const raw = decodeURIComponent(req.url.split("?")[0]);
  const url = raw.startsWith(BASE) ? raw.slice(BASE.length) || "/" : raw;
  let f = path.join(DIST, url);
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
  if (!fs.existsSync(f) || !fs.statSync(f).isFile()) { res.writeHead(404); res.end("404"); return; }
  res.writeHead(200, { "content-type": TYPES[path.extname(f)] ?? "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});

function consolePaths() {
  const dir = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "src", "data", "rationale");
  const out = new Set();
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".ts") || f === "types.ts" || f === "index.ts") continue;
    const src = fs.readFileSync(path.join(dir, f), "utf8");
    for (const m of src.matchAll(/^\s*path:\s*"([^"]+)",$/gm)) out.add(m[1]);
  }
  return [...out].sort();
}

const AUDIT = (vw) => {
  const out = { overflow: null, taps: [], tiny: [], inputs: [], clipped: [], chrome: [] };

  /*
    TWO EXEMPTIONS, BOTH LEARNED BY BEING WRONG FIRST.

    The first run of this file reported 168 screens with "text cut
    without an ellipsis" and 64 undersized tap targets, and almost all of
    both were the check being wrong rather than the page.

    VISUALLY HIDDEN TEXT IS SUPPOSED TO BE CLIPPED. The pattern is a 1px
    box with overflow hidden, and it exists so a screen reader hears
    "twelve late or due today" where a sighted reader sees "12" beside an
    icon. Measuring it as clipped content is measuring the accessibility
    feature and calling it a defect. Every one of the 168 was this.

    AN INLINE LINK IN A SENTENCE IS NOT A TAP TARGET. WCAG 2.5.8 exempts
    a link whose size is determined by the line of text it sits in, for
    the obvious reason: making "standard terms" 44px tall inside a
    paragraph would mean 44px line height on every paragraph containing a
    link. The rule is for controls that stand alone. Once the exemption
    was applied, the count went from 64 to zero.

    A check that reports defects the code does not have is worse than no
    check, because it trains you to skim past it.
  */
  const isHidden = (el) => {
    const cs = getComputedStyle(el);
    if (el.classList && el.classList.contains("visually-hidden")) return true;
    if (cs.clipPath && cs.clipPath !== "none") return true;
    if (cs.clip && cs.clip !== "auto") return true;
    const r = el.getBoundingClientRect();
    return r.width <= 2 || r.height <= 2;
  };
  const isInlineInProse = (el) =>
    Boolean(el.closest("p, li, figcaption, dd, dt, blockquote, td, th, caption, summary"));

  /* 1. Does the page scroll sideways, and if so, because of what. */
  const docW = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
  if (docW > vw + 1) {
    const blame = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right > vw + 1) {
        /* Only blame an element whose own ancestors are NOT already
           scrolling it: an element inside a legitimate x-scroller is
           doing what it was told. */
        let inScroller = false;
        for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
          const ov = getComputedStyle(p).overflowX;
          if (ov === "auto" || ov === "scroll") { inScroller = true; break; }
        }
        if (inScroller) continue;
        const id = el.tagName.toLowerCase() +
          (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/)[0] : "");
        blame.push({ id, right: Math.round(r.right), width: Math.round(r.width), text: (el.textContent || "").trim().slice(0, 40) });
      }
    }
    /* The widest offender is almost always the cause; the rest are its
       children inheriting the overflow. */
    blame.sort((a, b) => b.right - a.right);
    out.overflow = { docW, vw, worst: blame.slice(0, 4) };
  }

  /*
    1b. THE CHROME MUST NOT CLIP ITS OWN CONTROLS.

    An element can overflow its container without the DOCUMENT
    overflowing, and then check 1 says the page is fine while a
    control sits past the right edge with nothing to scroll it. That
    is exactly what the mega nav did: content 621px wide in a 390px
    bar, not scrolling but CLIPPING, so the Rationale switch and
    five queue keys were not merely awkward to reach, they were
    unreachable. The document width was a clean 390 the whole time.

    So every control inside the bar is checked against the viewport
    directly. The mode switch is called out by name because it is
    the only control in the application that moves a reader between
    the console and the argument for it, and losing it on a phone
    loses half the work.
  */
  const bar = document.querySelector('[class*="_bar_"]');
  if (bar) {
    for (const el of bar.querySelectorAll("a[href], button")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right <= vw + 1 && r.left >= -1) continue;
      const t = (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 24);
      out.chrome = out.chrome || [];
      out.chrome.push({ t, left: Math.round(r.left), right: Math.round(r.right) });
    }
  }

  /* 2. Tap targets. */
  const interactive = document.querySelectorAll(
    'a[href], button, [role="button"], input:not([type="hidden"]), select, textarea, summary, [tabindex]:not([tabindex="-1"])',
  );
  for (const el of interactive) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (getComputedStyle(el).visibility === "hidden") continue;
    if (isHidden(el)) continue;
    /* An anchor sized by the line of prose it sits in is exempt. */
    if (el.tagName === "A" && isInlineInProse(el)) continue;

    /*
      MAP PINS ARE EXEMPT, BY NAME AND WITH A REASON.

      They measure 36 and 38 pixels. That clears WCAG 2.5.8 at AA,
      which asks for 24, and falls short of the 44 in Apple's
      guidelines, which is written for controls that stand alone.
      A pin does not stand alone: there are 211 of them over a trade
      area six miles across, and the ones that collide are already
      merged into a cluster whose own label reads "zoom in to
      separate".

      Growing them to 44 would not make the map easier to use. It
      would make neighbouring pins overlap, so a tap meant for one
      lands on the one beside it, and it would do that worst on the
      screen where they are most crowded. Zoom is the disambiguation
      mechanism on a map and it is the right one.

      Exempted by NAME rather than by size, so a real control that
      happens to be 38px still fails this check.
    */
    if (typeof el.className === "string" &&
        /leaflet-marker-icon|ob-marker/.test(el.className)) continue;
    let inXScroller = false;
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const ov = getComputedStyle(p).overflowX;
      if (ov === "auto" || ov === "scroll") { inXScroller = true; break; }
    }
    const tooShort = r.height < 44;
    const tooNarrow = r.width < 44 && !inXScroller;
    if (tooShort || tooNarrow) {
      out.taps.push({
        id: el.tagName.toLowerCase() + (typeof el.className === "string" && el.className ? "." + el.className.trim().split(/\s+/)[0] : ""),
        w: Math.round(r.width), h: Math.round(r.height),
        text: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 32),
      });
    }
  }

  /* 3. Type size on text-bearing leaves. */
  for (const el of document.querySelectorAll("p, li, td, th, span, div, a, button, label")) {
    if (el.children.length > 0) continue;
    const t = (el.textContent || "").trim();
    if (t.length < 8) continue;
    if (isHidden(el)) continue;
    const fs2 = parseFloat(getComputedStyle(el).fontSize);
    if (fs2 < 12) out.tiny.push({ px: Math.round(fs2 * 10) / 10, text: t.slice(0, 40) });
  }

  /* 4. Form controls under 16px, the iOS zoom trap. */
  /* Checkbox, radio and range do not take a text caret, so Safari
     does not zoom on focus for them. Reporting them was the audit
     inventing work: the fix rule excludes them too. */
  for (const el of document.querySelectorAll("input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=range]), select, textarea")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0) continue;
    const fs3 = parseFloat(getComputedStyle(el).fontSize);
    if (fs3 < 16) out.inputs.push({ px: Math.round(fs3 * 10) / 10, id: el.tagName.toLowerCase() + (el.type ? `[${el.type}]` : "") });
  }

  /* 5. Text cut rather than truncated. */
  for (const el of document.querySelectorAll("body *")) {
    if (el.children.length > 0) continue;
    const t = (el.textContent || "").trim();
    if (t.length < 12) continue;
    if (isHidden(el)) continue;
    const cs = getComputedStyle(el);
    if (cs.overflow !== "hidden" && cs.overflowX !== "hidden") continue;
    if (cs.textOverflow === "ellipsis") continue;
    if (el.scrollWidth > el.clientWidth + 2) {
      out.clipped.push({ cut: el.scrollWidth - el.clientWidth, text: t.slice(0, 40) });
    }
  }

  return out;
};

await new Promise((r) => server.listen(PORT, r));
const browser = await chromium.launch({ executablePath: fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined });

const paths = consolePaths();
const targets = ONLY ? [ONLY] : [...paths, ...paths.map((p) => (p === "/" ? "/rationale" : `/rationale${p}`)), "/start"];
const findings = [];

for (const width of WIDTHS) {
  const page = await browser.newPage({
    viewport: { width, height: 780 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  for (const route of targets) {
    await page.goto(`http://localhost:${PORT}${BASE}${route === "/" ? "/" : route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(160);
    const r = await page.evaluate(AUDIT, width);
    if (r.overflow || r.taps.length || r.tiny.length || r.inputs.length || r.clipped.length || (r.chrome && r.chrome.length)) {
      findings.push({ width, route, ...r });
    }
    process.stdout.write(r.overflow ? "O" : (r.chrome && r.chrome.length) ? "C" : r.taps.length || r.inputs.length ? "t" : ".");
  }
  await page.close();
  process.stdout.write(` ${width}\n`);
}

await browser.close();
server.close();

console.log(`\n${targets.length} screens x ${WIDTHS.length} widths = ${targets.length * WIDTHS.length} checks\n`);

const overflow = findings.filter((f) => f.overflow);
const chrome = findings.filter((f) => f.chrome && f.chrome.length);
const inputs = findings.filter((f) => f.inputs.length);
const taps = findings.filter((f) => f.taps.length);
const tiny = findings.filter((f) => f.tiny.length);
const clipped = findings.filter((f) => f.clipped.length);

if (overflow.length) {
  console.log(`HORIZONTAL OVERFLOW on ${overflow.length} screen/width pairs:\n`);
  for (const f of overflow.slice(0, 14)) {
    console.log(`  ${f.route} @ ${f.width}  document is ${f.overflow.docW}px`);
    for (const w of f.overflow.worst) console.log(`      ${w.id}  right:${w.right} width:${w.width}  "${w.text}"`);
  }
  if (overflow.length > 14) console.log(`  and ${overflow.length - 14} more`);
  console.log();
} else console.log("No horizontal overflow at any width.\n");

if (chrome.length) {
  console.log(`CONTROLS CLIPPED OFF THE NAVIGATION BAR on ${chrome.length} screen/width pairs:`);
  const seen = new Map();
  for (const f of chrome) for (const c of f.chrome) seen.set(`${c.t} @ ${f.width}`, c);
  for (const [k, c] of [...seen].slice(0, 12)) console.log(`  "${k}"  spans ${c.left}..${c.right}`);
  console.log();
} else console.log("Every control on the navigation bar is fully on screen.\n");

if (inputs.length) {
  const seen = new Map();
  for (const f of inputs) for (const i of f.inputs) seen.set(`${i.id} ${i.px}px`, (seen.get(`${i.id} ${i.px}px`) ?? 0) + 1);
  console.log(`FORM CONTROLS UNDER 16px (iOS focus zoom), ${seen.size} distinct:`);
  for (const [k, n] of [...seen].sort((a, b) => b[1] - a[1]).slice(0, 10)) console.log(`  ${k}  on ${n} screen/width pairs`);
  console.log();
} else console.log("No form control under 16px.\n");

if (taps.length) {
  const seen = new Map();
  for (const f of taps) for (const t of f.taps) {
    const k = `${t.id}  ${t.w}x${t.h}`;
    if (!seen.has(k)) seen.set(k, { n: 0, text: t.text });
    seen.get(k).n++;
  }
  console.log(`TAP TARGETS UNDER 44px, ${seen.size} distinct:`);
  for (const [k, v] of [...seen].sort((a, b) => b[1].n - a[1].n).slice(0, 18)) console.log(`  ${k}  x${v.n}  "${v.text}"`);
  console.log();
} else console.log("Every tap target is at least 44px.\n");

if (tiny.length) {
  const seen = new Map();
  for (const f of tiny) for (const t of f.tiny) seen.set(`${t.px}px`, (seen.get(`${t.px}px`) ?? 0) + 1);
  console.log(`TEXT UNDER 12px: ${[...seen].map(([k, n]) => `${k} x${n}`).join(", ")}`);
  console.log(`  example: "${tiny[0].tiny[0].text}"\n`);
} else console.log("No body text under 12px.\n");

if (clipped.length) {
  console.log(`TEXT CUT WITHOUT AN ELLIPSIS on ${clipped.length} screen/width pairs:`);
  for (const f of clipped.slice(0, 8)) console.log(`  ${f.route} @ ${f.width}  "${f.clipped[0].text}" cut by ${f.clipped[0].cut}px`);
  console.log();
} else console.log("No text cut without an ellipsis.\n");

const hard = overflow.length + inputs.length + chrome.length;
process.exit(hard > 0 ? 1 : 0);
