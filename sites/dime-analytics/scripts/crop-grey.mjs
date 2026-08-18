/** Crop just the greyscale lane-band proof out of each swatch page, so the
 *  acceptance test can be looked at on its own rather than hunted for. */
import { chromium } from "playwright";
const OUT = "/tmp/work/me-prospecting/docs/theme-swatches";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
for (const key of ["approach", "ticket", "blacklight"]) {
  await p.goto(`file:///tmp/work/theme/out/${key}.html`, { waitUntil: "load" });
  await p.waitForTimeout(400);
  await p.locator(".gproof").screenshot({ path: `${OUT}/${key}-greyscale.png` });
  console.log("cropped", key);
}
await b.close();
