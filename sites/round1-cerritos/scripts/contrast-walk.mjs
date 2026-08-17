/**
 * Contrast walk. Throwaway proof, not part of the application.
 *
 * Serves the production build, opens every route at 1440 and at 380, IN BOTH
 * GROUNDS, and measures every rendered text node: its computed colour, the
 * nearest painted background behind it with alpha composited down the
 * ancestor chain, and the WCAG 2.x ratio between the two. The floor is
 * 4.5:1, relaxed to 3:1 for text at 24px or at 18.66px bold, which is what
 * the success criterion actually says.
 *
 * WHY IT WALKS BOTH RATHER THAN TRUSTING THE PALETTE AUDIT. A token's real
 * background is a fact about sixty CSS modules and not about the palette.
 * The audit in scripts/theme_cabinet.py can only check the pairs it is told
 * about; this finds the pairs nobody thought of. It found fifteen of them on
 * the dark ground once, all the same token painted on a surface the table
 * never anticipated, and a second ground doubles the number of places that
 * can happen.
 *
 * The theme is set by hand here rather than through the toggle, because the
 * thing under test is the palette and not the control: the attribute is
 * written before the first paint and the walk never touches storage.
 *
 * It lives under scripts/ because module resolution walks up from the
 * script's own directory and a file at /tmp cannot find playwright.
 */
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = "/tmp/work/me-prospecting/dist";
const BASE = "/me";

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
await new Promise((r) => server.listen(4179, r));

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
  /* The industry board. Four addresses rather than one, because the whole
     screen is a ranking that re-sorts under a different weighting and an
     expanded row paints prose the collapsed row does not. A walk that only
     visited the default would be measuring a quarter of the page. */
  "/segments",
  "/segments?weights=pre-opening",
  "/segments?weights=reach&open=62",
  "/segments?weights=volume&open=31",
  "/partners",
  "/promo",
  "/spend",
  "/packages",
  /* The promo picker, which is a dialog raised by pressing a card and
     which the walk cannot press, so it is entered by its own address.
     Two packages rather than one: the grad pack has a published price, a
     small published minimum and a long untold list, and the corporate
     buyout has a withheld price, the largest published minimum in the
     range and therefore the rows that paint the under-minimum flag. */
  "/packages?send=all-access-grad-pack",
  "/packages?send=corporate-buyout",
  "/book",
  "/book/week",
  "/book/accounts",
  /* The accounts board is a clock rather than a history, so most of its
     states are reached by moving the date rather than by pressing
     anything, and the walk cannot press a control. Three addresses cover
     the readings that change what is painted: a window open, an event
     delivered with obligations due, and a year out where one account is
     at risk and one is lapsed. */
  "/book/accounts?as-of=2026-10-05",
  "/book/accounts?as-of=2026-11-21",
  "/book/accounts?as-of=2026-12-27",
  "/book/accounts?as-of=2027-06-01",
  "/team",
  "/pay",
  /* Pay is a clock too. The default is the pre-opening quarter, where the
     bonus is the two leading gates and there is no revenue curve at all;
     the two dates below are the first trading quarter, where the
     attainment bar and the threshold gap are painted for the first time,
     and a later trading quarter with nothing collected in it. Three
     different sets of tokens on three different grounds of surface. */
  "/pay?as-of=2026-12-27",
  "/pay?as-of=2027-06-01",
  "/report",
  /* The district report is a period document, so the clock chooses which
     period it covers and therefore which blocks are painted at all. This
     date is past the pre opening calendar: the band is a continuation
     rather than a seeded period, the pace comparison has a real previous
     period behind it, and every held date is past its release date, which
     paints the warned state on five rows that read plainly at the
     default. */
  "/report?as-of=2026-12-27",
  "/rivals",
  "/replies",
  "/field",
  "/calendar",
  "/objections",
  "/sent",
  "/coaching",
  "/method",
  "/quote/brea-olinda-high-school",
  /* The same letter previewed over the console, because a dialog is a
     surface a reader looks at and the walk cannot see one that is only
     reachable by pressing something. */
  "/sent?quote=brea-olinda-high-school&quoteGuests=380",
  /* The leagues board and one league. Added while another agent was
     building them, so these may render the not-found screen on a given
     run; that screen is a real screen and is measured either way. */
  "/leagues",
  "/leagues/1",
  /* The cup board, on both of its views. The bracket sits behind a switch
     and the walk cannot press one, so the second entry is the same route
     with the view chosen in the address, which is why that switch keeps
     its state in the URL. */
  "/cup",
  "/cup?view=bracket",
  "/cup?view=bracket&bracket=plate",
  /* The three cup surfaces. They are dialogs raised by pressing a name,
     and the walk cannot press one, so each is entered by its own
     address, which is the whole reason they keep their state in the URL.
     The last entry is two of them stacked, because a team surface leads
     to a bowler and the layer underneath is still painted. */
  "/cup?team=pp-01",
  "/cup?bowler=boss-music",
  "/cup?tape=pf-1",
  "/cup?team=pp-01&bowler=boss-music",
  /* The same cards over the leagues board, because every team name and
     every handle there opens them too. */
  "/leagues?team=lfs-01",
];

const WALK = () => {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const parts = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
  };
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  });
  const lum = (c) => {
    const f = (v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
    return (x + 0.05) / (y + 0.05);
  };

  /* The background behind a node is whatever the first ancestor with a
     non-transparent fill paints, composited over whatever is behind IT if
     that fill is itself translucent. White is the page of last resort,
     which is what a browser paints when nothing else does. */
  const backdrop = (el) => {
    const stack = [];
    for (let n = el; n; n = n.parentElement) {
      const bg = parse(getComputedStyle(n).backgroundColor);
      if (bg && bg.a > 0) {
        stack.push(bg);
        if (bg.a >= 1) break;
      }
    }
    let out = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = stack.length - 1; i >= 0; i--) out = over(stack[i], out);
    return out;
  };

  const results = { checked: 0, failures: [] };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const text = node.nodeValue.trim();
    if (!text) continue;
    const el = node.parentElement;
    if (!el) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") continue;
    if (Number(cs.opacity) === 0) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) continue;
    /* The visually hidden helper clips to a 1px box; it is read aloud, not
       looked at, so it has no contrast requirement. */
    if (rect.width <= 2 && rect.height <= 2) continue;

    const bg = backdrop(el);
    let fg = parse(cs.color);
    if (!fg) continue;
    if (fg.a < 1) fg = over(fg, bg);

    const size = parseFloat(cs.fontSize);
    const weight = Number(cs.fontWeight) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const floor = large ? 3 : 4.5;
    const r = ratio(fg, bg);
    results.checked++;
    if (r + 0.005 < floor) {
      results.failures.push({
        text: text.slice(0, 48),
        cls: (el.className && el.className.baseVal !== undefined
          ? el.className.baseVal
          : String(el.className || "")
        ).slice(0, 48),
        tag: el.tagName,
        size,
        weight,
        ratio: Math.round(r * 100) / 100,
        floor,
        fg: cs.color,
        bg: `rgb(${Math.round(bg.r)}, ${Math.round(bg.g)}, ${Math.round(bg.b)})`,
      });
    }
  }
  return results;
};

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

const failures = [];
const tally = {};

for (const theme of ["dark", "light"]) {
  tally[theme] = { checked: 0, failures: 0 };

  for (const [w, h, label] of [
    [1440, 900, "desktop"],
    [380, 820, "mobile"],
  ]) {
    const ctx = await browser.newContext({
      viewport: { width: w, height: h },
      deviceScaleFactor: 1,
      /* THE ATTRIBUTE ALONE WAS NOT ENOUGH AND THE RUN WAS SILENTLY
         MEASURING ONE GROUND TWICE. ThemeProvider resolves to the stored
         choice or, where there is none, to whatever
         (prefers-color-scheme) reports, and it writes that in a layout
         effect on mount. So the init script below wrote "dark" before the
         first paint and the provider wrote "light" back over it a moment
         later, because an unconfigured Chromium reports light. Emulating
         the media query is what actually decides the ground; the init
         script stays because it is what paints the first frame. */
      colorScheme: theme,
    });
    await ctx.route(/cartocdn\.com|tile\.openstreetmap/, (r) =>
      r.fulfill({ status: 200, contentType: "image/png", body: TILE }),
    );
    await ctx.route(/fonts\.googleapis\.com|fonts\.gstatic\.com/, (r) =>
      r.fulfill({ status: 200, contentType: "text/css", body: "" }),
    );
    /* Before the bundle runs, so a route that reads the attribute during
       mount reads the right one. The guard is not defensive noise: an init
       script runs on document creation, when documentElement can still be
       null, and a throw there is swallowed silently and leaves the whole run
       measuring the wrong ground while reporting the right one. */
    await ctx.addInitScript((t) => {
      const apply = () => {
        if (document.documentElement) document.documentElement.dataset.theme = t;
      };
      apply();
      document.addEventListener("DOMContentLoaded", apply);
    }, theme);

    for (const route of ROUTES) {
      const page = await ctx.newPage();
      await page.goto(`http://localhost:4179${BASE}${route}`, {
        waitUntil: "domcontentloaded",
      });
      /* Belt and braces, and it has to happen BEFORE the settle wait rather
         than after it: a toggle that persists a choice could overwrite the
         init script after hydration, and forty odd components transition
         their background, so a flip measured immediately reads whatever the
         interpolation happened to be at that instant. */
      await page.evaluate((t) => {
        document.documentElement.dataset.theme = t;
      }, theme);
      await page.waitForTimeout(route === "/map" ? 2400 : 900);
      const res = await page.evaluate(WALK);
      tally[theme].checked += res.checked;
      tally[theme].failures += res.failures.length;
      for (const f of res.failures) failures.push({ theme, label, route, ...f });
      console.log(
        `${theme.padEnd(6)} ${label.padEnd(8)} ${route.padEnd(32)} nodes=${String(res.checked).padStart(4)} fail=${res.failures.length}`,
      );
      await page.close();
    }
    await ctx.close();
  }
}

await browser.close();
server.close();

console.log("\n=== CONTRAST WALK ===");
for (const theme of ["dark", "light"]) {
  console.log(
    `${theme.padEnd(6)} ${tally[theme].failures} failures of ${tally[theme].checked} text nodes`,
  );
}
for (const f of failures.slice(0, 60)) {
  console.log(
    `${f.theme} ${f.label} ${f.route} <${f.tag} class="${f.cls}"> ${f.size}px/${f.weight} ${f.ratio}:1 need ${f.floor} fg=${f.fg} bg=${f.bg} :: ${f.text}`,
  );
}
if (failures.length) process.exitCode = 1;
