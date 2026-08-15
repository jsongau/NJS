/**
 * Screenshot the three theme swatch pages.
 *
 * Runs from scripts/ so that `playwright` resolves out of the app's own
 * node_modules, and points at the Chromium already on this machine rather than
 * downloading one.
 */
import { chromium } from "playwright";
import fs from "node:fs";

const OUT = "/tmp/work/me-prospecting/docs/theme-swatches";
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 1400 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

for (const key of ["approach", "ticket", "blacklight"]) {
  await page.goto(`file:///tmp/work/theme/out/${key}.html`, { waitUntil: "load" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/${key}.png`, fullPage: true });
  console.log("shot", key);
}
await browser.close();
