import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const f of process.argv.slice(2)) {
  const p = await b.newPage({ viewport: { width: 816, height: 1056 } });
  await p.goto(`file://${f}`, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(350);
  const m = await p.evaluate(() => {
    const box = s => { const r = document.querySelector(s).getBoundingClientRect();
      return { l: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width), b: Math.round(r.bottom) }; };
    const main = box('.main'), side = box('.side');
    return { main, side, gutter: side.l - main.r };
  });
  const fits = m.side.b <= 1056 && m.main.b <= 1056;
  console.log(`${f.split('/').pop().padEnd(15)} side ${String(m.side.w).padStart(3)}px  main ${String(m.main.w).padStart(3)}px  gutter ${String(m.gutter).padStart(2)}px  sideEnds ${String(m.side.b).padStart(4)}  mainEnds ${String(m.main.b).padStart(4)}  ${fits ? 'FITS' : 'OVERFLOWS'}`);
  await p.close();
}
await b.close();
