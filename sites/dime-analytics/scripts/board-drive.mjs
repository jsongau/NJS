/**
 * Board drive. Throwaway proof, not part of the application.
 *
 * Serves the production build and actually uses the board: lands cold,
 * takes the offered go-see run, presses a stop, walks the keyboard, and
 * shoots each state at 1440 and at 380. Every step records page errors,
 * console errors and horizontal overflow, because a control that works
 * and throws is not working.
 */
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = "/tmp/work/me-prospecting/dist";
const BASE = "/me";
const OUT = "/tmp/board-drive";
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

await new Promise((r) => server.listen(0, r));
const port = server.address().port;
const url = `http://127.0.0.1:${port}${BASE}/map`;

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

/* The basemap is a third party and this sandbox has no route to it, so a
   failed tile is expected and is not what this script is looking for. */
const ignorable = (text) =>
  /ERR_TUNNEL_CONNECTION_FAILED|basemaps\.cartocdn|Failed to load resource/.test(
    text,
  );

let problems = 0;

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  if (overflow > 0) {
    problems += 1;
    console.log(`  OVERFLOW ${overflow}px at ${name}`);
  }
}

for (const w of [
  { name: "1440", width: 1440, height: 900 },
  { name: "380", width: 380, height: 820 },
]) {
  const context = await browser.newContext({
    viewport: { width: w.width, height: w.height },
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => {
    problems += 1;
    console.log(`  PAGE ERROR ${w.name}: ${e.message}`);
  });
  page.on("console", (m) => {
    if (m.type() !== "error" || ignorable(m.text())) return;
    problems += 1;
    console.log(`  CONSOLE ${w.name}: ${m.text()}`);
  });

  await page.goto(url, { waitUntil: "load" });
  await page.waitForTimeout(1400);

  if (w.name === "380") {
    /* The phone lands on the list. The run lives in the detail position,
       which is now live with nothing selected. */
    await page.getByRole("radio", { name: /Detail/i }).click();
    await page.waitForTimeout(600);
  }
  await shot(page, `${w.name}-arrival`);

  const take = page.getByRole("button", { name: /Put the run on the board/i });
  console.log(`${w.name}: take control count ${await take.count()}`);
  await take.first().click();
  await page.waitForTimeout(1200);
  await shot(page, `${w.name}-run-taken`);

  const rows = await page.locator("[data-prospect-row]").count();
  const chip = await page
    .getByRole("button", { name: /Go-see run/i })
    .count();
  console.log(`${w.name}: rows on board ${rows}, run chip ${chip}`);

  /* Keyboard: tab to the first stop control and press it. */
  if (w.name === "1440") {
    const stop = page.locator("[data-run-stop]").first();
    if ((await stop.count()) > 0) {
      await stop.focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(900);
      await shot(page, `${w.name}-stop-selected`);
      const heading = await page.locator("#detail-heading").innerText();
      console.log(`${w.name}: stop opened ${heading.trim()}`);
    } else {
      console.log(`${w.name}: run cleared by selection, no stop control left`);
    }
  }

  await context.close();
}

await browser.close();
server.close();
console.log(problems === 0 ? "clean" : `${problems} problems`);
