/**
 * THE GROUND, PROVED RATHER THAN ASSERTED.
 *
 * Throwaway proof, not part of the application. It serves the production
 * build and drives the real control in a real browser.
 *
 * IT DROVE A FIELDSET OF TWO RADIOS UNTIL THE CONTROL BECAME ONE
 * BUTTON. Every assertion it made then it still makes now: the first
 * painted frame on a cold load in each ground, a fresh profile following
 * the machine, a stored choice beating the machine across a reload, four
 * corrupt payloads landing mounted and silent, keyboard reach, 44 pixels
 * on a coarse pointer and every duration at zero under reduced motion.
 * What is new is what the shape changed: one press flips the ground, a
 * second press flips it back, the choice survives a reload, and the
 * button's name says what pressing it will do rather than only where the
 * reader is.
 *
 * The first test is the one that matters and it is the one that is
 * usually faked. A theme applied in an effect flashes the wrong ground on
 * every load, and a screenshot taken after the page has settled cannot
 * see it. So the tab is parked on a magenta document first, a CDP
 * screencast is started, and only then is the app opened. Every frame is
 * classified: magenta means the browser is still holding the old page,
 * anything else is the first frame of the new document. That frame has to
 * be the right ground.
 *
 * Run: node scripts/proof-ground.mjs
 */
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = "/tmp/work/me-prospecting/dist";
const BASE = "/me";
const PORT = 4187;
const ORIGIN = `http://localhost:${PORT}`;
const APP = `${ORIGIN}${BASE}/`;
const OUT = "/tmp/ground-proof";
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
await new Promise((r) => server.listen(PORT, r));

const TILE = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGN4cOcKAAUwApGnG1K1AAAAAElFTkSuQmCC",
  "base64",
);

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

const results = [];
let failures = 0;
function check(name, ok, detail) {
  results.push(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  ${detail}` : ""}`);
  if (!ok) failures += 1;
}

async function context(options = {}) {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    ...options,
  });
  await ctx.route(/cartocdn|tile\.openstreetmap/, (r) =>
    r.fulfill({ status: 200, contentType: "image/png", body: TILE }),
  );
  await ctx.route(/fonts\.googleapis|fonts\.gstatic/, (r) =>
    r.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
  return ctx;
}

const themeOf = (page) =>
  page.evaluate(() => document.documentElement.getAttribute("data-theme"));

// ---------------------------------------------------------------
// 1. What the app itself writes when somebody chooses
// ---------------------------------------------------------------

let storedLight = null;
let storedDark = null;
{
  const ctx = await context({ colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(APP, { waitUntil: "load" });
  await page.waitForTimeout(400);

  const before = await themeOf(page);
  check("fresh visit, system dark, lands dark", before === "dark", before);

  const sw = page.locator("#ground-switch");

  /* ONE PRESS, WHICH IS THE WHOLE POINT OF THE CONTROL. No aiming at an
     option, no second target, no keyboard dance: press it and the
     application is on the other ground. */
  await sw.click();
  await page.waitForTimeout(700);
  const after = await themeOf(page);
  storedLight = await page.evaluate(() =>
    window.localStorage.getItem("opening-book.v1"),
  );
  check("one press flips dark to light", after === "light", after);
  check(
    "the choice is written into the one storage key",
    !!storedLight && JSON.parse(storedLight).slices.theme.data.ground === "light",
    storedLight,
  );

  await sw.click();
  await page.waitForTimeout(700);
  const back = await themeOf(page);
  storedDark = await page.evaluate(() =>
    window.localStorage.getItem("opening-book.v1"),
  );
  check("a second press flips it back", back === "dark", back);
  check(
    "choosing dark back is written too",
    JSON.parse(storedDark).slices.theme.data.ground === "dark",
    back,
  );

  /* And it keeps flipping. A control that works once and then needs the
     page reloaded is a control that is holding state somewhere it should
     not be. */
  await sw.click();
  await page.waitForTimeout(500);
  await sw.click();
  await page.waitForTimeout(500);
  await sw.click();
  await page.waitForTimeout(500);
  const thrice = await themeOf(page);
  check("three more presses land where they should", thrice === "light", thrice);

  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(500);
  const persisted = await themeOf(page);
  check(
    "the pressed choice survives a reload",
    persisted === "light",
    `data-theme ${persisted}`,
  );

  await sw.click();
  await page.waitForTimeout(500);
  await page.screenshot({
    path: `${OUT}/control-dark.png`,
    clip: { x: 0, y: 0, width: 460, height: 56 },
  });
  await ctx.close();
}

// ---------------------------------------------------------------
// 2. The first painted frame
// ---------------------------------------------------------------

/* A colour no ground in this application contains, so a frame still
   showing it is a frame the browser has not repainted yet. */
const HOLD = "data:text/html,<body style='margin:0;background:%23c000c0'></body>";

async function meanOf(analyser, dataUrl) {
  return analyser.evaluate(async (url) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 64;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0, 64, 64);
    const { data } = g.getImageData(0, 0, 64, 64);
    let r = 0, gg = 0, b = 0;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      gg += data[i + 1];
      b += data[i + 2];
    }
    const n = data.length / 4;
    return { r: r / n, g: gg / n, b: b / n };
  }, dataUrl);
}

const analyserCtx = await context();
const analyser = await analyserCtx.newPage();

async function firstPaintedFrame(stored, systemScheme, tag) {
  const ctx = await context({ colorScheme: systemScheme });
  const seed = await ctx.newPage();
  await seed.goto(APP, { waitUntil: "domcontentloaded" });
  await seed.evaluate((raw) => {
    if (raw === null) window.localStorage.clear();
    else window.localStorage.setItem("opening-book.v1", raw);
  }, stored);
  await seed.close();

  const page = await ctx.newPage();
  await page.goto(HOLD, { waitUntil: "load" });
  await page.waitForTimeout(250);

  const cdp = await ctx.newCDPSession(page);
  const frames = [];
  cdp.on("Page.screencastFrame", async (f) => {
    frames.push(f.data);
    try {
      await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId });
    } catch {
      /* the cast is already stopped */
    }
  });
  await cdp.send("Page.startScreencast", {
    format: "png",
    everyNthFrame: 1,
  });

  await page.goto(APP, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  await cdp.send("Page.stopScreencast");

  /* The first frame that is no longer the magenta hold page is the first
     frame of the application. */
  let first = null;
  let index = -1;
  for (let i = 0; i < frames.length; i += 1) {
    const m = await meanOf(analyser, `data:image/png;base64,${frames[i]}`);
    const held = m.r > 120 && m.g < 90 && m.b > 120;
    if (held) continue;
    first = m;
    index = i;
    break;
  }

  if (first) {
    fs.writeFileSync(`${OUT}/first-frame-${tag}.png`, Buffer.from(frames[index], "base64"));
  }
  const lum = first ? 0.2126 * first.r + 0.7152 * first.g + 0.0722 * first.b : null;
  const settled = await themeOf(page);
  await ctx.close();
  return { lum, index, frames: frames.length, settled };
}

{
  const light = await firstPaintedFrame(storedLight, "dark", "light");
  check(
    "no flash: light stored, first painted frame is light",
    light.lum !== null && light.lum > 150 && light.settled === "light",
    `first frame ${light.index + 1} of ${light.frames}, mean luminance ${light.lum?.toFixed(1)}, settled ${light.settled}`,
  );

  const dark = await firstPaintedFrame(storedDark, "light", "dark");
  check(
    "no flash: dark stored, first painted frame is dark",
    dark.lum !== null && dark.lum < 90 && dark.settled === "dark",
    `first frame ${dark.index + 1} of ${dark.frames}, mean luminance ${dark.lum?.toFixed(1)}, settled ${dark.settled}`,
  );
}

// ---------------------------------------------------------------
// 3. A fresh profile follows the machine
// ---------------------------------------------------------------

for (const scheme of ["light", "dark"]) {
  const ctx = await context({ colorScheme: scheme });
  const page = await ctx.newPage();
  await page.goto(APP, { waitUntil: "load" });
  await page.waitForTimeout(300);
  const at = await themeOf(page);
  const key = await page.evaluate(() =>
    window.localStorage.getItem("opening-book.v1"),
  );
  check(
    `fresh profile, system ${scheme}, lands ${scheme}`,
    at === scheme,
    `data-theme ${at}`,
  );
  check(
    `fresh profile, system ${scheme}, writes nothing`,
    key === null,
    `storage ${key === null ? "absent" : "present"}`,
  );
  await ctx.close();
}

// ---------------------------------------------------------------
// 4. The machine moves under a reader who has not chosen, and under one who has
// ---------------------------------------------------------------

{
  const ctx = await context({ colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(APP, { waitUntil: "load" });
  await page.waitForTimeout(300);
  await page.emulateMedia({ colorScheme: "light" });
  await page.waitForTimeout(200);
  const followed = await themeOf(page);
  check(
    "never chosen: the machine flipping to light takes the page with it",
    followed === "light",
    `data-theme ${followed}`,
  );

  /* Pressing once from a light page lands on dark, which is also the
     first press this reader has ever made: their choice was null and the
     switch inverts what is on screen rather than what is stored. */
  await page.click("#ground-switch");
  await page.waitForTimeout(700);
  await page.emulateMedia({ colorScheme: "light" });
  await page.waitForTimeout(300);
  const held = await themeOf(page);
  check(
    "once chosen: the machine stops mattering",
    held === "dark",
    `data-theme ${held}`,
  );

  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(400);
  const survived = await themeOf(page);
  check(
    "the choice survives a reload and beats the system preference",
    survived === "dark",
    `data-theme ${survived}`,
  );
  await ctx.close();
}

// ---------------------------------------------------------------
// 5. A corrupt payload
// ---------------------------------------------------------------

const CORRUPT = [
  ["not JSON at all", "{{{"],
  ["a ground that does not exist", '{"v":1,"at":"","slices":{"theme":{"sig":"x","data":{"ground":"midnight"}}}}'],
  ["a slice that is a number", '{"v":1,"at":"","slices":{"theme":7}}'],
  ["a payload from a newer build", '{"v":99,"at":"","slices":{"theme":{"sig":"x","data":{"ground":"light"}}}}'],
];

for (const [name, raw] of CORRUPT) {
  const ctx = await context({ colorScheme: "dark" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(APP, { waitUntil: "domcontentloaded" });
  await page.evaluate((v) => window.localStorage.setItem("opening-book.v1", v), raw);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(500);
  const at = await themeOf(page);
  const mounted = await page.evaluate(
    () => document.querySelectorAll("#root nav").length > 0,
  );
  check(
    `corrupt storage, ${name}: loads on dark`,
    at === "dark" && mounted && errors.length === 0,
    `data-theme ${at}, mounted ${mounted}, errors ${errors.length}`,
  );
  await ctx.close();
}

// ---------------------------------------------------------------
// 6. The control itself
// ---------------------------------------------------------------

{
  const ctx = await context();
  const page = await ctx.newPage();
  await page.goto(APP, { waitUntil: "load" });
  await page.waitForTimeout(300);

  /* Reachable by keyboard, from the top of the document, with nothing
     doing it any favours. */
  let hops = 0;
  let landed = null;
  for (; hops < 200; hops += 1) {
    await page.keyboard.press("Tab");
    landed = await page.evaluate(() => document.activeElement?.id ?? "");
    if (landed === "ground-switch") break;
  }
  check(
    "keyboard reachable",
    landed === "ground-switch",
    `${landed} after ${hops + 1} presses of Tab`,
  );

  const ring = await page.evaluate(() => {
    const cs = getComputedStyle(document.activeElement);
    return {
      width: cs.outlineWidth,
      style: cs.outlineStyle,
      colour: cs.outlineColor,
    };
  });
  check(
    "visible focus on the control",
    ring.style === "solid" && parseFloat(ring.width) >= 2,
    `outline ${ring.width} ${ring.style} ${ring.colour}`,
  );

  /* A native button, so the two keys a button answers to both throw it,
     and neither of them needs a keydown handler of ours to do it. */
  const beforeEnter = await themeOf(page);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(500);
  const afterEnter = await themeOf(page);
  await page.keyboard.press("Space");
  await page.waitForTimeout(500);
  const afterSpace = await themeOf(page);
  check(
    "Enter and Space each throw it, and focus stays on it",
    afterEnter !== beforeEnter &&
      afterSpace === beforeEnter &&
      (await page.evaluate(() => document.activeElement?.id)) ===
        "ground-switch",
    `${beforeEnter} to ${afterEnter} to ${afterSpace}`,
  );

  /*
    WHAT A LISTENER IS HANDED. One button, and a name that says the
    ground now and what pressing it will do to that ground. Not
    aria-pressed: the reasoning is in MegaNav.tsx, and the test of it is
    that the name has to CHANGE when the ground does, because the half of
    it that is a promise is only true in one direction.
  */
  const nameNow = await page.getAttribute("#ground-switch", "aria-label");
  const roles = {
    dark: await page.getByRole("button", { name: "Ground dark, switch to light" }).count(),
    light: await page.getByRole("button", { name: "Ground light, switch to dark" }).count(),
  };
  check(
    "one button, named for the ground and for the press",
    roles.dark + roles.light === 1 &&
      /^Ground (dark|light), switch to (light|dark)$/.test(nameNow ?? ""),
    nameNow ?? "no name",
  );

  await page.click("#ground-switch");
  await page.waitForTimeout(500);
  const nameAfter = await page.getAttribute("#ground-switch", "aria-label");
  check(
    "the name follows the ground rather than going stale",
    nameAfter !== nameNow &&
      /^Ground (dark|light), switch to (light|dark)$/.test(nameAfter ?? ""),
    `${nameNow} then ${nameAfter}`,
  );

  /*
    AND WHAT A COLOURBLIND READER IS HANDED, WHICH IS THE HARDER TEST
    BECAUSE THIS CONTROL IS ABOUT COLOUR. Four signals and not one of
    them is a hue: the printed word, two different silhouettes, the
    knob's position, and two ends painted at opposite ends of the value
    ramp. The last of those is measured in greyscale here rather than
    described, in both grounds.
  */
  for (const want of ["dark", "light"]) {
    const at = await themeOf(page);
    if (at !== want) {
      await page.click("#ground-switch");
      await page.waitForTimeout(500);
    }
    const read = await page.evaluate(() => {
      const grey = (c) => {
        const [r, g, b] = c.match(/[\d.]+/g).map(Number);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const btn = document.getElementById("ground-switch");
      const track = btn.querySelector("[data-ground]");
      const dark = btn.querySelector('[data-end="dark"]');
      const light = btn.querySelector('[data-end="light"]');
      const knob = track.lastElementChild;
      return {
        ground: track.getAttribute("data-ground"),
        word: btn.lastElementChild.textContent.trim(),
        darkGrey: grey(getComputedStyle(dark).backgroundColor),
        lightGrey: grey(getComputedStyle(light).backgroundColor),
        knobShift: getComputedStyle(knob).transform,
        glyphs: [
          dark.querySelector("svg").innerHTML.length,
          light.querySelector("svg").innerHTML.length,
        ],
        paths: [
          dark.querySelectorAll("path,circle").length,
          light.querySelectorAll("path,circle").length,
        ],
      };
    });
    check(
      `${want}: the two ends are a near black and a near white in greyscale`,
      read.lightGrey - read.darkGrey > 120,
      `dark end ${read.darkGrey.toFixed(0)}, light end ${read.lightGrey.toFixed(0)}, difference ${(read.lightGrey - read.darkGrey).toFixed(0)} of 255`,
    );
    check(
      `${want}: the word on the switch is the ground on the page`,
      read.word.toLowerCase() === want,
      read.word,
    );
    check(
      `${want}: the two glyphs are different drawings`,
      read.glyphs[0] !== read.glyphs[1] && read.paths[0] !== read.paths[1],
      `crescent ${read.paths[0]} shape, sun ${read.paths[1]} shapes`,
    );
    check(
      `${want}: the knob is at the ${want} end`,
      want === "dark"
        ? read.knobShift === "none" || /matrix\(1, 0, 0, 1, 0, 0\)/.test(read.knobShift)
        : /matrix\(1, 0, 0, 1, (\d|[1-9]\d)/.test(read.knobShift) &&
          !/matrix\(1, 0, 0, 1, 0, 0\)/.test(read.knobShift),
      read.knobShift,
    );
  }

  await ctx.close();
}

// ---------------------------------------------------------------
// 7. A coarse pointer at 380, on the strip rather than in a drawer
// ---------------------------------------------------------------

/*
  THE SWITCH SURVIVES TO 380 AND IT IS NOT BEHIND THE HAMBURGER. It used
  to live in the rail, which at this width is a drawer, so proving it
  meant opening the drawer first. On the strip it is simply there, at
  every width, without a press to reach it, which is the point: it is the
  one control that changes how the whole screen looks and a reader
  fighting the light should not have to go looking for it.
*/
{
  const ctx = await context({
    viewport: { width: 380, height: 820 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto(APP, { waitUntil: "load" });
  await page.waitForTimeout(400);

  const coarse = await page.evaluate(
    () => window.matchMedia("(pointer: coarse)").matches,
  );

  const sw = page.locator("#ground-switch");
  const box = await sw.boundingBox();
  const onStrip = await page.evaluate(() => {
    const b = document.getElementById("ground-switch").getBoundingClientRect();
    return b.top >= 0 && b.bottom <= 56 + 4 && b.right <= window.innerWidth;
  });
  check(
    "44px on a coarse pointer, on the strip at 380",
    coarse && box.height >= 44 && onStrip,
    `pointer coarse ${coarse}, ${box.width.toFixed(0)} by ${box.height.toFixed(0)}, on the strip ${onStrip}`,
  );

  const before380 = await themeOf(page);
  await page.screenshot({ path: `${OUT}/strip-380-${before380}.png`, clip: { x: 0, y: 0, width: 380, height: 60 } });
  await sw.tap();
  await page.waitForTimeout(500);
  const after380 = await themeOf(page);
  await sw.tap();
  await page.waitForTimeout(500);
  const back380 = await themeOf(page);
  check(
    "one tap flips it at 380, and the next tap flips it back",
    after380 !== before380 && back380 === before380,
    `${before380} to ${after380} to ${back380}`,
  );
  await sw.tap();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/strip-380-${after380}.png`, clip: { x: 0, y: 0, width: 380, height: 60 } });
  await ctx.close();
}

// ---------------------------------------------------------------
// 8. Reduced motion
// ---------------------------------------------------------------

{
  const ctx = await context({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(APP, { waitUntil: "load" });
  await page.waitForTimeout(300);
  const motion = await page.evaluate(() => {
    const out = { tokens: {}, control: {} };
    const root = getComputedStyle(document.documentElement);
    for (const t of ["--dur-1", "--dur-2", "--dur-3"]) {
      out.tokens[t] = root.getPropertyValue(t).trim();
    }
    for (const sel of [
      "#ground-switch",
      "#ground-switch [data-ground]",
      "#ground-switch [data-ground] > :last-child",
    ]) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const cs = getComputedStyle(el);
      out.control[sel] = [cs.transitionDuration, cs.animationDuration];
    }
    return out;
  });
  /* The tokens go to 0ms and the house-wide reduced motion block in
     base.css clamps everything to 0.001ms on top, which is what a
     computed style reads back as 1e-06s. Both paths are checked. */
  const tokensZero = Object.values(motion.tokens).every(
    (v) => parseFloat(v) === 0,
  );
  const controlZero = Object.values(motion.control).every((pair) =>
    pair.every((v) =>
      v.split(",").every((d) => parseFloat(d) <= 0.000001),
    ),
  );
  check(
    "reduced motion: the duration tokens are zero",
    tokensZero,
    JSON.stringify(motion.tokens),
  );
  check(
    "reduced motion: every duration on the control is zero",
    controlZero,
    JSON.stringify(motion.control),
  );
  await ctx.close();
}

await analyserCtx.close();
await browser.close();
server.close();

console.log(results.join("\n"));
console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
