import { chromium } from "playwright";
const [,, src, out] = process.argv;
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage();
await p.goto(`file://${src}`, { waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(600);
await p.pdf({ path: out, width: "8.5in", height: "11in", printBackground: true, margin: {top:"0",right:"0",bottom:"0",left:"0"} });
await b.close();
