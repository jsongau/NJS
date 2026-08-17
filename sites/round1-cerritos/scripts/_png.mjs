import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage({ viewport: { width: 816, height: 1056 }, deviceScaleFactor: 2 });
await p.goto(`file://${process.argv[2]}`, { waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(500);
await p.screenshot({ path: process.argv[3], fullPage: false });
await b.close();
