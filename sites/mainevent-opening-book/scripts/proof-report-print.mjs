/**
 * PRINT PROOF FOR THE DISTRICT REPORT. Throwaway proof, not part of the
 * application, and kept out of `tsconfig.node.json` is unnecessary here
 * because it is plain JavaScript and imports no application source.
 *
 * The claim being tested is the one that matters for D8: this page is a
 * document a District Sales Manager can print. So the pass does the
 * three things a person would do with a printer and nothing else.
 *
 *   1. Renders the page with `media: "print"` FROM BOTH GROUNDS. The
 *      dark ground is the interesting one: paper is neither theme, and a
 *      report exported from the dark ground has to come out as ink on
 *      white rather than as near black cards on white.
 *   2. Walks every painted node in the printed document and records the
 *      set of text colours and background colours actually in use, so
 *      "black on white" is a measurement rather than an impression.
 *   3. Writes a letter PDF at half inch margins and counts the sides, so
 *      the length of the artefact is a number in the report rather than
 *      a guess.
 *
 * Run: node scripts/proof-report-print.mjs
 */
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = "/tmp/work/me-prospecting/dist";
const BASE = "/me";
const OUT = "/tmp/print-proof";
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

/** Every colour actually painted inside the printed document. */
const INK = () => {
  const sheet = document.querySelector("article");
  if (!sheet) return { error: "no document element found" };
  const colours = new Map();
  const grounds = new Map();
  const chrome = [];
  const walker = document.createTreeWalker(sheet, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (!node.nodeValue.trim()) continue;
    const el = node.parentElement;
    if (!el) continue;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    colours.set(cs.color, (colours.get(cs.color) ?? 0) + 1);
  }
  for (const el of sheet.querySelectorAll("*")) {
    const cs = getComputedStyle(el);
    if (cs.display === "none") continue;
    const bg = cs.backgroundColor;
    if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
      grounds.set(bg, (grounds.get(bg) ?? 0) + 1);
    }
    if (cs.boxShadow && cs.boxShadow !== "none") {
      chrome.push(`${el.tagName}.${String(el.className).slice(0, 30)} keeps a shadow`);
    }
  }
  /* What the shell leaves on the page. The rail, the nav and the demo
     badge all belong to the application and none of them belongs on a
     document that goes to a district manager. */
  const stillVisible = [];
  const outside = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let stray;
  while ((stray = outside.nextNode())) {
    const text = stray.nodeValue.trim();
    if (!text) continue;
    const el = stray.parentElement;
    if (!el || sheet.contains(el)) continue;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;
    stillVisible.push(`${el.tagName}: ${text.slice(0, 40)}`);
  }

  /*
    AND THE CHROME THAT CARRIES NO TEXT AT ALL.

    The breadcrumb band prints as an empty tinted strip once the nav
    inside it is hidden, which a text walk cannot see and a reader
    cannot miss. Anything outside the document that still paints a
    ground over a reasonable area is chrome that survived.
  */
  for (const el of document.body.querySelectorAll("*")) {
    if (sheet.contains(el) || el.contains(sheet)) continue;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    const bg = cs.backgroundColor;
    if (!bg || bg === "rgba(0, 0, 0, 0)" || bg === "transparent") continue;
    const rect = el.getBoundingClientRect();
    if (rect.width * rect.height < 400) continue;
    stillVisible.push(
      `${el.tagName} paints ${bg} over ${Math.round(rect.width)} by ${Math.round(rect.height)}`,
    );
  }

  return {
    pageBackground: getComputedStyle(document.body).backgroundColor,
    textColours: [...colours.entries()].sort((a, b) => b[1] - a[1]),
    backgrounds: [...grounds.entries()].sort((a, b) => b[1] - a[1]),
    shadows: chrome,
    chromeStillVisible: stillVisible,
    documentWidthPx: Math.round(sheet.getBoundingClientRect().width),
    documentHeightPx: Math.round(sheet.getBoundingClientRect().height),
  };
};

/** Pages in a PDF, counted off the page tree rather than guessed. */
function pdfPages(file) {
  const raw = fs.readFileSync(file).toString("latin1");
  const counts = [...raw.matchAll(/\/Type\s*\/Page[^s]/g)].length;
  return counts;
}

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

const problems = [];

for (const theme of ["light", "dark"]) {
  for (const [as, name] of [
    ["", "default"],
    ["?as-of=2026-12-27", "after-both"],
  ]) {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
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

    const page = await ctx.newPage();
    page.on("pageerror", (e) => problems.push(`${theme} ${name}: ${e.message}`));
    await page.goto(`http://localhost:4183${BASE}/report${as}`, {
      waitUntil: "domcontentloaded",
    });
    await page.evaluate((t) => {
      document.documentElement.dataset.theme = t;
    }, theme);
    await page.waitForTimeout(900);

    await page.emulateMedia({ media: "print" });
    await page.waitForTimeout(300);

    const ink = await page.evaluate(INK);
    const pdf = `${OUT}/report-${theme}-${name}.pdf`;
    await page.pdf({
      path: pdf,
      format: "Letter",
      margin: { top: "0.5in", bottom: "0.5in", left: "0.5in", right: "0.5in" },
      printBackground: true,
    });
    await page.screenshot({
      path: `${OUT}/report-${theme}-${name}-print.png`,
      fullPage: true,
    });

    const pages = pdfPages(pdf);
    console.log(`\n=== ${theme} ground, ${name} ===`);
    console.log(` body background   ${ink.pageBackground}`);
    console.log(` text colours      ${JSON.stringify(ink.textColours)}`);
    console.log(` painted grounds   ${JSON.stringify(ink.backgrounds)}`);
    console.log(` shadows left      ${ink.shadows.length}`);
    console.log(` app chrome left   ${JSON.stringify(ink.chromeStillVisible)}`);
    console.log(` document box      ${ink.documentWidthPx} by ${ink.documentHeightPx} px`);
    console.log(` letter sides      ${pages}`);

    const nonBlack = ink.textColours.filter(([c]) => c !== "rgb(0, 0, 0)");
    if (nonBlack.length > 0) {
      problems.push(
        `${theme} ${name}: ${nonBlack.length} text colour(s) other than black: ${nonBlack
          .map(([c, n]) => `${c} on ${n} nodes`)
          .join(", ")}`,
      );
    }
    /* Pure black is a drawn rule, which is ink rather than a filled
       panel: the straight line mark and the bar hatching are both black
       on white by design. Anything else is a panel that survived. */
    const filled = ink.backgrounds.filter(
      ([c]) =>
        c !== "rgb(255, 255, 255)" &&
        c !== "rgba(0, 0, 0, 0)" &&
        c !== "rgb(0, 0, 0)",
    );
    if (filled.length > 0) {
      problems.push(
        `${theme} ${name}: ${filled.length} painted panel(s) survived print: ${filled
          .map(([c, n]) => `${c} on ${n} elements`)
          .join(", ")}`,
      );
    }
    if (ink.pageBackground !== "rgb(255, 255, 255)") {
      problems.push(`${theme} ${name}: body prints on ${ink.pageBackground}`);
    }
    if (ink.shadows.length > 0) {
      problems.push(`${theme} ${name}: ${ink.shadows.length} shadow(s) survived print`);
    }
    if (ink.chromeStillVisible.length > 0) {
      problems.push(
        `${theme} ${name}: ${ink.chromeStillVisible.length} node(s) of application chrome still printing: ${ink.chromeStillVisible.slice(0, 6).join(" | ")}`,
      );
    }

    await page.close();
    await ctx.close();
  }
}

await browser.close();
server.close();

console.log("\n=== PROBLEMS ===");
console.log(problems.length ? problems.join("\n") : "none");
