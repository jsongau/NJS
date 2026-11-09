#!/usr/bin/env node
// Headline line-break audit (Mary's rule). For every h1/h2/h3 on the given pages, at every
// width below, it finds where the browser wraps the text and fails when:
//   - big headlines (h1/h2 at 28px+): any line of a phrase block is a single word (3+ word phrases),
//   - any heading: a multi-phrase heading breaks anywhere but after . , : ; ? ! — or ·,
//   - any heading overflows its box.
// Small card titles (h3, under 28px) may wrap onto two even lines.
//   - from 390px up, a phrase inside a big headline must fit on one line (size the heading to its column).
// Phrases wrapped in .ph (inline-block) count as separate blocks, so breaks between them are fine.
// Usage: node tools/check-headlines.mjs <url-or-file> [more...]
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const WIDTHS = [320, 360, 375, 390, 393, 412, 430, 768, 1024, 1280, 1440];
const targets = process.argv.slice(2).map((t) => (/^https?:|^file:/.test(t) ? t : pathToFileURL(resolve(t)).href));
if (!targets.length) { console.error('usage: node tools/check-headlines.mjs <url-or-file>...'); process.exit(2); }

const probe = () => [...document.querySelectorAll('h1, h2, h3')].filter((h) => h.offsetParent && h.textContent.trim()).map((h) => {
  const words = [];
  const walk = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
  for (let n; (n = walk.nextNode());) {
    const re = /\S+/g;
    for (let m; (m = re.exec(n.data));) {
      const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length);
      const rects = r.getClientRects(); if (!rects.length) continue;
      let blk = n.parentElement;
      while (blk !== h && getComputedStyle(blk).display === 'inline') blk = blk.parentElement;
      words.push({ w: m[0], top: Math.round(rects[0].top), blk });
    }
  }
  const big = h.tagName !== 'H3' && parseFloat(getComputedStyle(h).fontSize) >= 28;
  const bad = [];
  const groups = new Map();
  words.forEach((x) => { if (!groups.has(x.blk)) groups.set(x.blk, []); groups.get(x.blk).push(x); });
  const lines = [];
  for (const ws of groups.values()) {
    const ls = [];
    ws.forEach((x, i) => { if (!i || Math.abs(x.top - ws[i - 1].top) > 4) ls.push([x]); else ls[ls.length - 1].push(x); });
    lines.push(...ls);
    const multi = /[.,:;?!—·]\s+\S/.test(ws.map((x) => x.w).join(' '));
    if (big && ls.length > 1 && ws.length >= 3) ls.forEach((l, i) => { if (l.length === 1) bad.push((i === ls.length - 1 ? 'orphan "' : 'lone word "') + l[0].w + '"'); });
    for (let i = 0; i < ls.length - 1; i++) {
      const end = ls[i][ls[i].length - 1].w;
      if (multi && !/[.,:;?!—·]$/.test(end)) bad.push('splits a phrase after "' + end + '"');
    }
  }
  if (h.scrollWidth > h.clientWidth + 1) bad.push('overflows its box');
  // From 390px up, a phrase in a big headline must fit on one line.
  if (big && innerWidth >= 390) h.querySelectorAll('.ph').forEach((ph) => { const r = ph.getClientRects(); const lh = parseFloat(getComputedStyle(h).lineHeight) || parseFloat(getComputedStyle(h).fontSize) * 1.1; if (ph.getBoundingClientRect().height > lh * 1.5) bad.push('phrase "' + ph.textContent.trim() + '" is wider than its column'); });
  return { text: h.textContent.replace(/\s+/g, ' ').trim().slice(0, 70), lines: lines.map((l) => l.map((x) => x.w).join(' ')), bad };
});

const browser = await chromium.launch();
let fails = 0;
for (const url of targets) {
  const page = await browser.newPage();
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(url, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts && document.fonts.ready);
    for (const r of await page.evaluate(probe)) {
      if (!r.bad.length) continue;
      fails++;
      console.log(`${w}px  ${url.split('/').slice(-2).join('/')}\n  "${r.text}"\n  lines: ${r.lines.map((l) => '[' + l + ']').join(' ')}\n  ${r.bad.join('; ')}`);
    }
  }
  await page.close();
}
await browser.close();
console.log(fails ? `\n${fails} headline problem(s).` : 'All headlines break cleanly at every width.');
process.exit(fails ? 1 : 0);
