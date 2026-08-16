/**
 * PROOF: the two modes agree, and nothing 404s.
 *
 * Run against the BUILT dist over a static server, because that is the
 * shape Vercel serves: real index.html files at real directories, no
 * dev server rewriting anything. A route that works under `vite dev`
 * and 404s in production has happened here before.
 *
 * WHAT IT ASSERTS, per screen, for all twenty seven:
 *
 *   1. The console route loads with zero page errors and zero failed
 *      requests.
 *   2. The rationale route at the same address with a prefix loads the
 *      same way.
 *   3. The rail is IDENTICAL in both modes. Not similar: the same list
 *      of hrefs in the same order with the same labels, once the mode
 *      prefix is stripped. This is the whole claim of the design, so it
 *      is measured rather than eyeballed.
 *   4. Both modes resolve the SAME section identity. The explanation of
 *      Lanes must be drawn in Lanes' colour, which means data-sec has to
 *      survive the prefix strip in sectionFor.
 *   5. The rationale screen has an explanation on file. A screen that
 *      renders the "Not written yet" panel is a gap, and a gap that
 *      ships silently is the failure this check exists to catch.
 *   6. The mode switch on the bar points at the OTHER reading of the
 *      address you are standing on, not at a fixed destination.
 *
 * It also walks a sample of the deep link routes, the quote letters and
 * the league pages, because those are the URLs that go in emails.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";

const DIST = path.resolve(process.argv[2] ?? "dist");
const PORT = 4599;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};

/**
 * A static server that behaves the way `cleanUrls: true` behaves: a
 * directory request is answered by the index.html inside it, and a path
 * with no file behind it is a 404 rather than a fallback to the app.
 * The fallback is what would hide a missing stub.
 */
/**
 * BASE. The build sets `base: "/me/"` and the router sets basename
 * "/me", because dist is committed into njs-site/me and served from
 * nathanjsong.com/me. So the fixture has to be mounted at /me too. The
 * first run of this file mounted it at the root, every asset 404d, and
 * the app never booted, which is a fair reproduction of what would
 * happen if the pair in vite.config.ts and main.tsx ever drifted apart.
 */
const BASE = "/me";

const server = http.createServer((req, res) => {
  const raw = decodeURIComponent(req.url.split("?")[0]);
  const url = raw.startsWith(BASE) ? raw.slice(BASE.length) || "/" : raw;
  let file = path.join(DIST, url);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    file = path.join(file, "index.html");
  }
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("404");
    return;
  }
  res.writeHead(200, { "content-type": TYPES[path.extname(file)] ?? "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});

/** The console paths, read out of the rationale content so the two lists cannot drift. */
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

const toRationale = (p) => (p === "/" ? "/rationale" : `/rationale${p}`);

/** Everything the page can tell us about itself, in one evaluate. */
const READ = () => {
  /*
    THE RAIL IS ONE ELEMENT, not "links that look navigational". The
    first cut of this read `aside a, nav[aria-label] a`, which swept up
    in-page links on the busier boards and reported the rail as sixty
    rows on Today and forty nine on its explanation. That was the
    measurement being wrong, not the rail. Address the real element.
  */
  const railEl = document.querySelector('nav[aria-label="Every screen in The Opening Book"]');
  const rail = railEl
    ? [...railEl.querySelectorAll("a[href]")].filter((a) => a.getAttribute("href").startsWith("/"))
    : [];
  const secEl = document.querySelector("[data-sec]");
  const modes = [...document.querySelectorAll('a[href], button')]
    .filter((el) => /^(console|rationale)$/i.test((el.textContent || "").trim()))
    .map((el) => ({ text: el.textContent.trim().toLowerCase(), href: el.getAttribute("href"), current: el.getAttribute("aria-current") }));
  return {
    sec: secEl ? secEl.getAttribute("data-sec") : null,
    rail: rail.map((a) => ({ href: a.getAttribute("href"), label: (a.textContent || "").trim() })),
    modes,
    notWritten: /Not written yet/.test(document.body.innerText),
    railFound: Boolean(railEl),
    /* The takeover's own way into its explanation, read by destination
       rather than by class name so a rename of the style does not
       quietly turn this assertion off. */
    modeLinkHref:
      [...document.querySelectorAll("a[href]")]
        .map((a) => a.getAttribute("href"))
        .find((h) => /^\/(me\/)?rationale(\/|$)/.test(h)) ?? null,
    shellMode: document.querySelector("[data-mode]")?.getAttribute("data-mode") ?? null,
    h1: (document.querySelector("h1")?.textContent || "").trim(),
    words: document.body.innerText.trim().split(/\s+/).length,
  };
};

/**
 * Rendered hrefs carry the basename, so compare app paths rather than
 * URLs: drop /me, then drop /rationale.
 */
const stripBase = (href) => href.replace(/^\/me(?=\/|$)/, "") || "/";
const stripMode = (href) => stripBase(href).replace(/^\/rationale(?=\/|$)/, "") || "/";

await new Promise((r) => server.listen(PORT, r));

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const failures = [];
const rows = [];

const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
const bad = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("response", (r) => {
  if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`);
});

async function visit(route) {
  errors.length = 0;
  bad.length = 0;
  const res = await page.goto(`http://localhost:${PORT}${BASE}${route === "/" ? "/" : route}`, { waitUntil: "networkidle" });
  const read = await page.evaluate(READ);
  return { status: res.status(), errors: [...errors], bad: [...bad], ...read };
}

const paths = consolePaths();
console.log(`Walking ${paths.length} screens in two modes.\n`);

for (const p of paths) {
  const c = await visit(p);
  const r = await visit(toRationale(p));

  const problems = [];
  if (c.status !== 200) problems.push(`console ${c.status}`);
  if (r.status !== 200) problems.push(`rationale ${r.status}`);
  if (c.errors.length) problems.push(`console pageerror: ${c.errors[0]}`);
  if (r.errors.length) problems.push(`rationale pageerror: ${r.errors[0]}`);
  if (c.bad.length) problems.push(`console request ${c.bad[0]}`);
  if (r.bad.length) problems.push(`rationale request ${r.bad[0]}`);
  if (r.notWritten) problems.push("rationale has no explanation on file");

  /*
    THE ONE EXEMPTION, AND IT IS NAMED RATHER THAN INFERRED.

    /map renders FullBleedRoute, which unmounts the rail and the mega nav
    on purpose: three panes and a rail do not fit, and that decision
    predates this mode. So the rail comparison is not run on it. What IS
    run instead is stricter than the general check, because a screen with
    no bar has nowhere to put the mode switch: the takeover must carry a
    link to its own explanation in its chrome band, or Maps becomes the
    single screen whose explanation cannot be reached from it.

    Written as one named path rather than as "skip any screen with no
    rail", which would make every future rail regression pass silently.
  */
  const TAKEOVER = p === "/map";
  if (TAKEOVER) {
    if (c.shellMode !== "full-bleed") problems.push("map is no longer a takeover; re-examine this exemption");
    if (!c.modeLinkHref) problems.push("takeover has no link to its own explanation");
    else if (stripBase(c.modeLinkHref) !== toRationale(p)) problems.push(`takeover mode link points at ${c.modeLinkHref}`);
    if (r.shellMode !== "railed") problems.push("the explanation of Maps should be an ordinary railed document");
  }

  // 3. The rail, identical once the mode prefix is stripped.
  const cRail = c.rail.map((x) => `${stripMode(x.href)}|${x.label}`).join("\n");
  const rRail = r.rail.map((x) => `${stripMode(x.href)}|${x.label}`).join("\n");
  if (!TAKEOVER && cRail !== rRail) {
    const cs = new Set(c.rail.map((x) => stripMode(x.href)));
    const rs = new Set(r.rail.map((x) => stripMode(x.href)));
    const onlyC = [...cs].filter((x) => !rs.has(x));
    const onlyR = [...rs].filter((x) => !cs.has(x));
    problems.push(
      `rail differs: console ${c.rail.length} rows (shell ${c.shellMode}), rationale ${r.rail.length} rows (shell ${r.shellMode})` +
        (onlyC.length ? `; console only: ${onlyC.slice(0, 5).join(" ")}` : "") +
        (onlyR.length ? `; rationale only: ${onlyR.slice(0, 5).join(" ")}` : ""),
    );
  }

  // 4. One section identity across both readings.
  if (c.sec !== r.sec) problems.push(`section identity ${c.sec} vs ${r.sec}`);

  // 6. The switch translates the address you are on.
  const rSwitch = r.modes.find((m) => m.text === "console");
  const cSwitch = c.modes.find((m) => m.text === "rationale");
  if (!rSwitch) problems.push("no Console switch while in rationale");
  else if (rSwitch.href && stripBase(rSwitch.href) !== p) problems.push(`Console switch points at ${rSwitch.href}, not ${p}`);
  if (!cSwitch && !TAKEOVER) problems.push("no Rationale switch while in console");
  else if (cSwitch.href && stripBase(cSwitch.href) !== toRationale(p)) problems.push(`Rationale switch points at ${cSwitch.href}, not ${toRationale(p)}`);

  rows.push({ path: p, sec: c.sec, rail: c.rail.length, words: r.words, ok: problems.length === 0 });
  if (problems.length) failures.push({ path: p, problems });
  process.stdout.write(problems.length ? "x" : ".");
}

// The deep links that go in emails. A sample rather than all 250, since
// they share one template and the point is that the stubs resolve cold.
console.log("\n\nDeep links (cold open, no client routing):");
const deep = [];
for (const dir of ["quote", "leagues"]) {
  const base = path.join(DIST, dir);
  if (!fs.existsSync(base)) continue;
  const kids = fs.readdirSync(base).filter((f) => fs.statSync(path.join(base, f)).isDirectory());
  deep.push(...kids.slice(0, 4).map((k) => `/${dir}/${k}`));
}
for (const d of deep) {
  const v = await visit(d);
  const ok = v.status === 200 && !v.errors.length && !v.bad.length;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${d}  ${v.h1.slice(0, 48)}`);
  if (!ok) failures.push({ path: d, problems: [`status ${v.status}`, ...v.errors, ...v.bad] });
}

// A route with no stub must 404 rather than quietly serving the app,
// because a fallback would make every check above pass on a typo.
const ghost = await page.goto(`http://localhost:${PORT}${BASE}/this-route-does-not-exist`);
console.log(`\nUnknown route returns ${ghost.status()} ${ghost.status() === 404 ? "(correct: no silent fallback)" : "(WRONG: a fallback would hide missing stubs)"}`);
if (ghost.status() !== 404) failures.push({ path: "/this-route-does-not-exist", problems: ["served the app instead of 404ing"] });

await browser.close();
server.close();

console.log(`\nScreens: ${rows.length}   passing: ${rows.filter((r) => r.ok).length}   words of explanation: ${rows.reduce((a, b) => a + b.words, 0).toLocaleString()}`);
console.log(`Distinct section identities across the rationale mode: ${new Set(rows.map((r) => r.sec)).size}`);
console.log(`Rail rows, every screen: ${[...new Set(rows.map((r) => r.rail))].join(", ")}`);

if (failures.length) {
  console.log(`\n${failures.length} FAILING:\n`);
  for (const f of failures) console.log(`  ${f.path}\n    ${f.problems.join("\n    ")}`);
  process.exit(1);
}
console.log("\nAll checks pass.");
