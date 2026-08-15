/**
 * PROOF PASS FOR THE COMPOSE WINDOW.
 *
 * Serves the production build, opens the modal from the map board at 1440
 * and at 380, and asserts the six things the rebuild claims:
 *
 *   1. the letter is visible without scrolling at both widths
 *   2. changing an intent changes the letter, with no submit step
 *   3. Tab is trapped inside the dialog
 *   4. Escape closes and returns focus to whatever opened it
 *   5. copy puts the subject and the message on the clipboard
 *   6. the mailto href is correctly encoded and inside the safe length
 *
 * Numbers are printed rather than only checked, because "visible" is a
 * measurement and a proof that prints a tick is a proof nobody can argue
 * with or learn anything from.
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

const TILE = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGN4cOcKAAUwApGnG1K1AAAAAElFTkSuQmCC",
  "base64",
);

/* The container ships Chromium at a pinned path and blocks the postinstall
   download, so the executable is named rather than resolved. */
const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

const problems = [];
const check = (label, ok, detail = "") => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  ${detail}` : ""}`);
  if (!ok) problems.push(label);
};

for (const [w, h, label] of [
  [1440, 900, "desktop"],
  [380, 820, "mobile"],
]) {
  console.log(`\n=== ${label} ${w}x${h} ===`);
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: 1,
    permissions: ["clipboard-read", "clipboard-write"],
  });
  await ctx.route(/cartocdn\.com|tile\.openstreetmap/, (r) =>
    r.fulfill({ status: 200, contentType: "image/png", body: TILE }),
  );
  await ctx.route(/fonts\.googleapis\.com|fonts\.gstatic\.com/, (r) =>
    r.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );

  const page = await ctx.newPage();
  page.on("pageerror", (e) => problems.push(`${label} pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") problems.push(`${label} console: ${m.text()}`);
  });

  await page.goto(`http://localhost:4181${BASE}/map`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2600);

  /* At 1440 the board shows the detail panel beside the list and the write
     control is already on screen. At 380 the same board is three tabs, and
     Detail is disabled until an organisation is chosen, so a card is picked
     first and the tab followed. Both routes end on the same control. */
  let opener = page.locator("[data-compose='write']").first();
  if ((await opener.count()) === 0) {
    await page.locator("[data-prospect-id]").first().evaluate((el) => el.click());
    await page.waitForTimeout(500);
    const detail = page.getByRole("radio", { name: /Detail/ }).first();
    if ((await detail.getAttribute("aria-checked")) !== "true") {
      await detail.evaluate((el) => el.click());
    }
    await page.waitForTimeout(600);
    opener = page.locator("[data-compose='write']").first();
  }

  await opener.scrollIntoViewIfNeeded();
  const openerLabel = (await opener.getAttribute("aria-label")) ?? "(write)";
  await opener.click();
  await page.waitForSelector("[data-compose-dialog]", { timeout: 5000 });
  await page.waitForTimeout(500);

  // -----------------------------------------------------------
  // 1. The letter is visible without scrolling.
  // -----------------------------------------------------------
  const seen = await page.evaluate(() => {
    const letter = document.querySelector("[data-compose-letter]");
    const subject = document.getElementById("compose-subject");
    const body = document.getElementById("compose-body");
    const r = letter.getBoundingClientRect();
    const sr = subject.getBoundingClientRect();
    const br = body.getBoundingClientRect();
    const vh = window.innerHeight;
    /* How many pixels of the body box are inside the viewport, and whether
       any ancestor had to be scrolled to get there. */
    let scrolled = 0;
    for (let el = body; el; el = el.parentElement) scrolled += el.scrollTop ?? 0;
    return {
      letterTop: Math.round(r.top),
      letterVisible: Math.round(Math.min(r.bottom, vh) - Math.max(r.top, 0)),
      subjectValue: subject.value,
      subjectVisible: sr.top >= 0 && sr.bottom <= vh,
      bodyVisiblePx: Math.round(Math.min(br.bottom, vh) - Math.max(br.top, 0)),
      bodyChars: body.value.length,
      scrolled,
      vh,
    };
  });
  check(
    "letter visible with no scroll",
    seen.scrolled === 0 && seen.subjectVisible && seen.bodyVisiblePx > 120,
    `letter ${seen.letterVisible}px of ${seen.vh}, body box ${seen.bodyVisiblePx}px on screen, ${seen.bodyChars} chars in it, scrollTop ${seen.scrolled}`,
  );
  check(
    "subject already written on open",
    seen.subjectValue.trim().length > 0,
    `"${seen.subjectValue.slice(0, 58)}"`,
  );

  /* Shot on open, before anything is touched, because "what does a reader
     see the moment it appears" is the question the rebuild answers. */
  await page.screenshot({ path: `${OUT}/compose-${label}-open.png` });

  const openIntent = await page.getAttribute("[data-compose-dialog] input[name='compose-intent']:checked", "value");
  console.log(`  note  opened on intent "${openIntent}" for ${openerLabel}`);

  // -----------------------------------------------------------
  // 6. The mailto, before anything is changed.
  // -----------------------------------------------------------
  const mail = await page.evaluate(() => {
    const a = document.querySelector("[data-mailto]");
    if (!a) return null;
    const href = a.getAttribute("href");
    const u = new URL(href);
    const q = new URLSearchParams(u.search);
    return {
      href,
      length: href.length,
      address: decodeURIComponent(u.pathname),
      subject: q.get("subject"),
      body: q.get("body"),
      rawNewline: /[\r\n]/.test(href),
      encodedNewline: href.includes("%0A"),
      liveSubject: document.getElementById("compose-subject").value,
      liveBody: document.getElementById("compose-body").value,
    };
  });
  if (mail) {
    check(
      "mailto encodes the letter exactly",
      mail.subject === mail.liveSubject &&
        mail.body === mail.liveBody &&
        !mail.rawNewline &&
        mail.encodedNewline,
      `${mail.length} chars, to ${mail.address}, newlines percent encoded`,
    );
    check("mailto inside the safe length", mail.length <= 1900, `${mail.length} of 1900`);
  } else {
    const off = await page.textContent(".letterActionOff, [data-compose-letter] button").catch(() => "");
    console.log(`  note  no mailto offered on this organisation: ${String(off).trim().slice(0, 60)}`);
  }

  // -----------------------------------------------------------
  // 2. Changing an intent changes the letter, in place.
  // -----------------------------------------------------------
  const before = await page.evaluate(() => ({
    s: document.getElementById("compose-subject").value,
    b: document.getElementById("compose-body").value,
  }));
  const otherIntent = openIntent === "reserve-party" ? "outreach" : "reserve-party";
  await page.locator(`[data-intent='${otherIntent}']`).click();
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => ({
    s: document.getElementById("compose-subject").value,
    b: document.getElementById("compose-body").value,
  }));
  check(
    "changing intent rewrites the letter",
    after.s !== before.s && after.b !== before.b,
    `"${before.s.slice(0, 30)}" became "${after.s.slice(0, 30)}"`,
  );

  /* The long letter. Some promo drafts run past what a mail link carries,
     and the control has to change job rather than truncate silently. */
  await page.locator("[data-intent='featured-promo']").click();
  await page.waitForTimeout(400);
  const long = await page.evaluate(() => {
    const a = document.querySelector("[data-mailto]");
    const b = document.getElementById("compose-body").value;
    const s = document.getElementById("compose-subject").value;
    const encoded = `mailto:x?subject=${encodeURIComponent(s)}&body=${encodeURIComponent(b)}`;
    return {
      hasLink: !!a,
      wouldBe: encoded.length,
      fallback: [...document.querySelectorAll("[data-compose-letter] button")]
        .map((x) => x.textContent.trim())
        .find((t) => /copy/i.test(t)),
    };
  });
  console.log(
    `  note  featured promo letter would encode to about ${long.wouldBe} chars; mail link ${long.hasLink ? "offered" : "withheld"}, controls read "${long.fallback}"`,
  );

  /* Force the case: a letter past the safe length must lose the link and
     gain a control that copies, rather than opening something truncated. */
  if (label === "desktop") {
    const filler = "Paragraph about the opening month calendar. ".repeat(60);
    await page.fill("#compose-body", filler);
    await page.waitForTimeout(300);
    const over = await page.evaluate(() => ({
      link: !!document.querySelector("[data-mailto]"),
      controls: [...document.querySelectorAll("[data-compose-letter] button")].map((b) =>
        b.textContent.trim(),
      ),
      foot: document.querySelector("footer p")?.textContent ?? "",
    }));
    check(
      "over the safe length the link is withdrawn",
      !over.link && over.controls.some((t) => /Too long/.test(t)),
      `${over.foot.trim()}`,
    );
    /* Put the draft back so the rest of the pass measures the real letter. */
    await page.locator("[data-intent='outreach']").click();
    await page.waitForTimeout(200);
    const replace = page.getByRole("button", { name: "Replace", exact: true });
    if (await replace.count()) {
      await replace.click();
      await page.waitForTimeout(300);
    }
  }

  /* The polite announcement, debounced, exactly once. */
  await page.waitForTimeout(700);
  const live = await page.textContent("[data-draft-live]");
  check("draft change announced politely", live.trim().length > 0, `"${live.trim()}"`);

  // -----------------------------------------------------------
  // 5. Copy.
  // -----------------------------------------------------------
  await page.locator("[data-compose-dialog] [data-copy-letter]").click();
  await page.waitForTimeout(400);
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  const nowLetter = await page.evaluate(() => ({
    s: document.getElementById("compose-subject").value,
    b: document.getElementById("compose-body").value,
  }));
  check(
    "copy puts subject and message on the clipboard",
    clip === `Subject: ${nowLetter.s}\n\n${nowLetter.b}`,
    `${clip.length} chars, opens "${clip.slice(0, 34)}"`,
  );
  const said = await page.textContent("[data-compose-dialog] [role='status'][aria-live='polite']");
  check("copy confirms out loud", said.trim().length > 0, `"${said.trim()}"`);

  // -----------------------------------------------------------
  // 3. The trap.
  // -----------------------------------------------------------
  await page.evaluate(() => {
    const list = document.querySelectorAll(
      "[data-compose-dialog] button:not([disabled]), [data-compose-dialog] a[href]",
    );
    list[list.length - 1].focus();
  });
  let escaped = 0;
  for (let i = 0; i < 45; i += 1) {
    await page.keyboard.press("Tab");
    const inside = await page.evaluate(
      () => !!document.activeElement?.closest("[data-compose-dialog]"),
    );
    if (!inside) escaped += 1;
  }
  check("Tab never leaves the dialog", escaped === 0, `45 presses, ${escaped} escapes`);

  await page.keyboard.down("Shift");
  for (let i = 0; i < 20; i += 1) {
    await page.keyboard.press("Tab");
    const inside = await page.evaluate(
      () => !!document.activeElement?.closest("[data-compose-dialog]"),
    );
    if (!inside) escaped += 1;
  }
  await page.keyboard.up("Shift");
  check("Shift Tab never leaves either", escaped === 0, `20 more presses`);

  await page.screenshot({ path: `${OUT}/compose-${label}.png` });

  // -----------------------------------------------------------
  // 4. Escape, and the focus return.
  // -----------------------------------------------------------
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  /* The letter was edited by nothing, so the first Escape closes rather
     than asking. Where a confirmation appears, answer it and press again. */
  if (await page.locator("[data-compose-dialog]").count()) {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
  }
  const closed = (await page.locator("[data-compose-dialog]").count()) === 0;
  const returned = await page.evaluate(
    () => document.activeElement?.getAttribute("data-compose") === "write",
  );
  check("Escape closes the window", closed);
  check("focus returns to the control that opened it", returned);

  /* THE ORGANISATION WITH NO WRITTEN DOOR. Roughly a fifth of this data
     set publishes no address, and the promise is that the mail link is
     not offered there rather than pointed at a guess. */
  if (label === "desktop") {
    const search = page.getByPlaceholder(/Name, city/).first();
    await search.fill("Beckman");
    await page.waitForTimeout(700);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(900);
    const goSee = page.locator("[data-compose='write']").first();
    if (await goSee.count()) {
      await goSee.click();
      await page.waitForSelector("[data-compose-dialog]", { timeout: 5000 });
      await page.waitForTimeout(400);
      const shape = await page.evaluate(() => ({
        who: document.querySelector("[data-compose-dialog] h2")?.textContent,
        link: !!document.querySelector("[data-mailto]"),
        off: document.querySelector("[data-compose-letter] span + span")?.textContent,
        text: document.querySelector("[data-compose-letter]")?.innerText.slice(0, 200),
      }));
      check(
        "no published address means no mail link",
        !shape.link && /No published address/.test(shape.text),
        `${shape.who}`,
      );
      await page.screenshot({ path: `${OUT}/compose-go-see.png` });
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
    } else {
      console.log("  note  could not reach an organisation with no address from search");
    }
  }

  await page.close();
  await ctx.close();
}

await browser.close();
server.close();

console.log("\n=== PROBLEMS ===");
console.log(problems.length ? problems.join("\n") : "none");
process.exitCode = problems.length ? 1 : 0;
