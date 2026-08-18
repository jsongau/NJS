/**
 * READ THE LETTERS AS THE RECIPIENT WOULD.
 *
 * The copy pass rewrote every draft in lib/email/templates.ts around one
 * idea: the missing opening date is the offer rather than the apology.
 * That claim cannot be checked by reading the source, because the source
 * is a set of branches and the reader only ever sees one of them. So this
 * opens the real compose window on one organisation per lane, walks every
 * intent and every draft inside it, and prints the letter exactly as it
 * lands in the box.
 *
 * It also fails loudly on the two things that would undo the whole
 * application: a month, a season or a quarter appearing in a rendered
 * letter, and any manufactured urgency. The prospect's own buying window
 * is allowed to carry months, because that is their calendar rather than
 * a claim about when the building opens.
 */
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = "/tmp/work/me-prospecting/dist";
const BASE = "/me";
const OUT = "/tmp/shots-copy";
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

const TILE = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGN4cOcKAAUwApGnG1K1AAAAAElFTkSuQmCC",
  "base64",
);

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

/* One per lane, and every one of them publishes an address, so the letter
   under test is a letter rather than a reception script. */
const SUBJECTS = [
  ["schools", "brea-olinda-high-school"],
  ["corporate", "envista-world-headquarters"],
  ["local-retail-food", "old-brea-chop-house"],
  ["fitness-youth-sports", "team-kwon-taekwondo-center-hq"],
  ["faith-nonprofit", "live-oak-united-church-of-christ-formerly-brea-c"],
  ["hospitality-civic", "brea-chamber-of-commerce"],
];

const BANNED = [
  /\b(january|february|march|april|june|july|august|september|october|november|december)\b/i,
  /\b(jan|feb|mar|apr|jun|jul|aug|sept?|oct|nov|dec)\b/i,
  /\b(spring|summer|autumn|winter)\b/i,
  /\bquarter/i,
  /\bcountdown\b/i,
  /\bonly \d+ (spots|places|dates|slots)/i,
  /\b(spots|places|slots) left\b/i,
  /\bexpires?\b/i,
  /\bdeadline\b/i,
  /\bact now\b/i,
  /\blimited time\b/i,
  /!/,
  /* The dashes and the whole arrow block, written as code points so that
     this file does not itself contain the glyphs it bans. */
  /[\u2012-\u2015\u2190-\u21ff\u27f0-\u27ff]/,
];

/**
 * The three strings the ORGANISATION supplies, subtracted before the scan.
 *
 * A buying window is the reader's own calendar and it legitimately says
 * "Nov-Dec"; a research note legitimately says "quarter-close" or "a
 * quarter-mile from the venue". Neither is this file making a claim about
 * when the building opens, which is the thing the rule exists to stop. So
 * they are removed from the text under test rather than argued about
 * afterwards, and everything the templates themselves wrote is scanned
 * with no exemptions at all.
 */
const SRC = fs.readFileSync("/tmp/work/me-prospecting/src/data/prospects.ts", "utf8");
function ownWords(id) {
  const at = SRC.indexOf(`id: "${id}"`);
  if (at < 0) return [];
  const slice = SRC.slice(at, at + 3400);
  const out = [];
  for (const key of ["whyTheyFit", "buyingWindow", "name", "headcountBasis"]) {
    const m = slice.match(new RegExp(`${key}:\\s*\\n?\\s*"((?:[^"\\\\]|\\\\.)*)"`));
    if (m) out.push(m[1]);
  }
  return out;
}

const problems = [];

const ctx = await browser.newContext({
  viewport: { width: 1440, height: 950 },
  deviceScaleFactor: 1,
});
await ctx.route(/cartocdn\.com|tile\.openstreetmap/, (r) =>
  r.fulfill({ status: 200, contentType: "image/png", body: TILE }),
);
await ctx.route(/fonts\.googleapis\.com|fonts\.gstatic\.com/, (r) =>
  r.fulfill({ status: 200, contentType: "text/css", body: "" }),
);

const page = await ctx.newPage();
page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));

for (const [lane, id] of SUBJECTS) {
  console.log(`\n\n${"=".repeat(74)}\n${lane.toUpperCase()}  ${id}\n${"=".repeat(74)}`);
  await page.goto(`http://localhost:4187${BASE}/map?prospect=${id}`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(2200);

  let opener = page.locator("[data-compose='write']").first();
  if ((await opener.count()) === 0) {
    console.log("  (no write control reachable for this organisation)");
    continue;
  }
  await opener.scrollIntoViewIfNeeded();
  await opener.click();
  await page.waitForSelector("[data-compose-dialog]", { timeout: 5000 });
  await page.waitForTimeout(400);

  const supplied = ownWords(id);

  const intents = await page.$$eval(
    "[data-compose-dialog] input[name='compose-intent']",
    (els) => els.map((e) => e.value),
  );

  let shot = 0;
  for (const intent of intents) {
    await page.evaluate((v) => {
      const el = document.querySelector(
        `[data-compose-dialog] input[name='compose-intent'][value='${v}']`,
      );
      el.click();
    }, intent);
    await page.waitForTimeout(320);

    const draftIds = await page.$$eval(
      "[data-compose-dialog] input[name='compose-draft']",
      (els) => els.map((e) => e.value),
    );

    for (const d of draftIds.length ? draftIds : [null]) {
      if (d) {
        await page.evaluate((v) => {
          document
            .querySelector(`[data-compose-dialog] input[name='compose-draft'][value='${v}']`)
            .click();
        }, d);
        await page.waitForTimeout(280);
      }

      const letter = await page.evaluate(() => ({
        subject: document.getElementById("compose-subject")?.value ?? "",
        body: document.getElementById("compose-body")?.value ?? "",
        label:
          document.querySelector("[data-compose-dialog] input[name='compose-draft']:checked")
            ?.closest("label")
            ?.querySelector("span + span > span")?.textContent ?? "",
      }));

      const words = letter.body.trim().split(/\s+/).length;
      console.log(
        `\n--- ${intent} / ${d ?? "(single)"}  [${words} words] ---------------------`,
      );
      console.log(`SUBJECT: ${letter.subject}`);
      console.log(letter.body);

      let scrubbed = `${letter.subject}\n${letter.body}`;
      for (const s of supplied) {
        if (!s) continue;
        /* Whole, lower cased, and cut at the first clause, because the
           subject lines carry the short form of the buying window. */
        for (const form of [s, s.toLowerCase(), s.split(/[,;(]/)[0].trim()]) {
          if (form.length > 2) scrubbed = scrubbed.split(form).join(" ");
        }
      }
      for (const re of BANNED) {
        const m = scrubbed.match(re);
        if (m) problems.push(`${lane} / ${intent} / ${d}: banned "${m[0]}"`);
      }

      /* One shot per DRAFT rather than per intent. A single shot per
         intent lands on whichever draft the loop finished on, which is
         the last one in the picker and never the one the window opens
         on, so the evidence would show a letter no reader starts from. */
      await page.screenshot({ path: `${OUT}/${lane}-${intent}-${shot}.png` });
      shot += 1;
    }
  }

  await page.keyboard.press("Escape");
  await page.waitForTimeout(250);
}

await browser.close();
server.close();

console.log(`\n\n${"=".repeat(74)}`);
if (problems.length === 0) {
  console.log("CLEAN. No month, season, quarter, countdown, exclamation or dash in any letter.");
} else {
  console.log(`${problems.length} PROBLEMS`);
  for (const p of problems) console.log(`  ${p}`);
}
console.log(`shots in ${OUT}`);
process.exit(problems.length ? 1 : 0);
