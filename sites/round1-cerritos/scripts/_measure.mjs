import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const [label, file] of [["MAIN EVENT v20", process.argv[2]], ["OLE SMOKY v36", process.argv[3]]]) {
  const p = await b.newPage({ viewport: { width: 816, height: 1056 } });
  await p.goto(`file://${file}`, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(400);
  const m = await p.evaluate(() => {
    const g = (sel) => { const e = document.querySelector(sel); if (!e) return null;
      const r = e.getBoundingClientRect(); return { left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width), h: Math.round(r.height) }; };
    return { main: g('.main'), side: g('.side'), page: document.documentElement.scrollWidth };
  });
  const gap = m.side && m.main ? m.side.left - m.main.right : null;
  console.log(`${label}`);
  console.log(`  main  ${m.main.w}px  (x ${m.main.left} to ${m.main.right})`);
  console.log(`  side  ${m.side.w}px  (x ${m.side.left} to ${m.side.right})   height ${m.side.h}px`);
  console.log(`  gutter between them: ${gap}px`);
  console.log(`  side as share of the two columns: ${(m.side.w/(m.side.w+m.main.w)*100).toFixed(1)}%`);
  await p.close();
}
await b.close();
