/**
 * Proof pass. Serves the production build, walks every route, records any
 * page error or failed console message, and writes a full-page screenshot
 * at desktop and at 380px.
 *
 * The 380px pass is not decoration. The group quote page is opened from an
 * email on a phone, and a page that only works at 1440 has not been built.
 */
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = "/tmp/work/me-prospecting/dist";
const BASE = "/me";
const OUT = "/tmp/shots";
fs.mkdirSync(OUT, { recursive: true });

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
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
await new Promise((r) => server.listen(4178, r));

/* A neutral grey tile. The CARTO basemap is not reachable from this
   container, so this stands in purely to prove the Leaflet layer, the
   markers and the rings render. It is not part of the app. */
const TILE = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGN4cOcKAAUwApGnG1K1AAAAAElFTkSuQmCC",
  "base64",
);

const ROUTES = [
  ["/today", "00-today"],
  ["/", "01-desk"],
  ["/requests", "01b-requests"],
  ["/inbox", "01c-inbox"],
  ["/inbox?status=conversation", "01d-inbox-status"],
  ["/map", "02-trade-area"],
  ["/lanes", "03-lanes"],
  ["/leagues", "03a-leagues"],
  ["/leagues/last-frame-standing", "03a2-league-detail"],
  /* The cup board opens on the fixtures list, which is the primary view.
     The two bracket entries are the same route with the view chosen in
     the address, because the switch keeps its state in the URL. */
  ["/cup", "03a3-cup"],
  ["/cup?view=bracket", "03a4-cup-bracket"],
  ["/cup?view=bracket&bracket=plate", "03a5-cup-plate"],
  /* The three cup surfaces, each entered by its own address because a
     dialog raised by pressing a name is not reachable to a pass that
     cannot press one. */
  ["/cup?team=pp-01", "03a6-cup-team"],
  ["/cup?bowler=boss-music", "03a7-cup-bowler"],
  ["/cup?tape=pf-1", "03a8-cup-tape"],
  ["/cup?team=pp-01&bowler=boss-music", "03a9-cup-stacked"],
  ["/partners", "03b-partners"],
  ["/promo", "03c-promo"],
  ["/spend", "03d-spend"],
  ["/packages", "04-packages"],
  /* The promo picker, entered by its own address for the same reason the
     cup surfaces are: it is a dialog raised by pressing a card. Two
     packages, because the under-minimum flag only paints where the
     published minimum is larger than most of the trade area. */
  ["/packages?send=all-access-grad-pack", "04a-packages-send"],
  ["/packages?send=corporate-buyout", "04b-packages-send-minimum"],
  ["/book", "05-book"],
  ["/book/week", "06-week-sheet"],
  ["/book/accounts", "06b-accounts"],
  ["/team", "06c-team"],
  ["/pay", "06d-pay"],
  ["/report", "06e-report"],
  ["/rivals", "06f-rivals"],
  ["/replies", "07-replies"],
  ["/field", "08-field"],
  ["/calendar", "09-capacity"],
  ["/objections", "10-objections"],
  ["/sent", "11-sent"],
  ["/coaching", "12-coaching"],
  ["/method", "13-method"],
  ["/quote/brea-olinda-high-school", "14-quote"],
  ["/quote/does-not-exist", "15-quote-unknown"],
];

const problems = [];
/* The container ships Chromium at a pinned path and blocks the postinstall
   download, so the executable is named rather than resolved. */
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
  await ctx.route(/cartocdn\.com|tile\.openstreetmap/, (r) =>
    r.fulfill({ status: 200, contentType: "image/png", body: TILE }),
  );
  await ctx.route(/fonts\.googleapis\.com|fonts\.gstatic\.com/, (r) =>
    r.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );

  for (const [route, name] of ROUTES) {
    const page = await ctx.newPage();
    page.on("pageerror", (e) => problems.push(`${label} ${route}: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error") problems.push(`${label} ${route}: console ${m.text()}`);
    });
    await page.goto(`http://localhost:4178${BASE}${route}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(route === "/map" ? 2600 : 1100);

    /* The shell is height:100dvh with overflow:hidden and an inner scroll
       region, so Playwright's fullPage flag captures one viewport and calls
       it a page. Measure the real scroller, grow the viewport to it, and
       take an ordinary shot instead. */
    const measure = () =>
      page.evaluate(() => {
        let tallest = document.documentElement.scrollHeight;
        let overflowX =
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth + 1;
        for (const el of document.querySelectorAll("*")) {
          const cs = getComputedStyle(el);
          if (/(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 2) {
            tallest = Math.max(tallest, el.scrollHeight + 120);
          }
          /* Deliberately NOT flagging per-element scrollWidth here. A chip
             row with text-overflow ellipsis clips by design, and treating
             that as a defect buries the one case that matters: the document
             itself scrolling sideways. */
        }
        return {
          h1: document.querySelector("h1")?.textContent?.trim().slice(0, 60) ?? null,
          docH: tallest,
          overflowX,
          placeholder: document.body.innerText.includes("Specified, not yet built"),
        };
      });

    let info = await measure();
    if (info.docH > h) {
      await page.setViewportSize({ width: w, height: Math.min(info.docH, 20000) });
      await page.waitForTimeout(600);
      info = await measure();
    }
    if (info.placeholder) problems.push(`${label} ${route}: STILL A PLACEHOLDER`);
    if (info.overflowX) problems.push(`${label} ${route}: horizontal overflow`);
    console.log(
      `${label.padEnd(8)} ${route.padEnd(34)} h=${String(info.docH).padStart(6)} ${info.overflowX ? "OVERFLOW " : ""}${info.h1 ?? "(no h1)"}`,
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
