#!/usr/bin/env node
// Mary's layout audit. Loads each page at phone, tablet and desktop widths and fails on:
//   - sideways scroll,
//   - text cut off by its own box (ellipsis or hidden overflow; a deliberate line clamp is allowed),
//   - anything sticking out past the screen that is not inside a sideways scroller,
//   - on touch widths, a button, link or field under 44px on its short side (inline text links in a sentence and
//     targets that grow their hit area with an absolutely placed ::after are allowed),
//   - a script error.
// A control marked data-tap="aux" is a second route to something a bigger control already does (the numbers under
// the distance ruler), so only its height is checked.
// It checks each page as it loads. Screens with states (the near-me map) need their own walk-through as well.
// Usage: node tools/audit-mary.mjs http://localhost:8765 [/path ...]   (no paths: every page in sitemap.xml,
// with three gym profile pages standing in for the rest, since they share one template)
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const WIDTHS = [[320, 568], [390, 844], [768, 1024], [1024, 768], [1440, 900]];
const [base, ...given] = process.argv.slice(2);
if (!base) { console.error('usage: node tools/audit-mary.mjs http://localhost:8765 [/path ...]'); process.exit(2); }
let paths = given;
if (!paths.length) {
  const all = [...readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf8').matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)].map((m) => m[1] || '/');
  const gyms = all.filter((p) => p.includes('/guides/gyms/'));
  paths = all.filter((p) => !p.includes('/guides/gyms/')).concat(gyms.slice(0, 3));
}

const probe = () => {
  const vw = document.documentElement.clientWidth; const touch = vw < 1024;
  const name = (e) => { const c = (e.className && (e.className.baseVal ?? e.className) || '').toString().trim().split(/\s+/).filter(Boolean).slice(0, 2).join('.'); return e.tagName.toLowerCase() + (c ? '.' + c : ''); };
  const shown = (e) => { if (!e.getClientRects().length) return false; const cs = getComputedStyle(e); return cs.visibility !== 'hidden' && cs.opacity !== '0'; };
  const scroller = (e) => { for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) { const cs = getComputedStyle(p); if (/(auto|scroll|hidden|clip)/.test(cs.overflowX) || cs.position === 'fixed' && p.getBoundingClientRect().right <= vw + 1) return true; } return false; };
  const srOnly = (e) => { for (let p = e; p && p !== document.body; p = p.parentElement) { const cs = getComputedStyle(p); const r = p.getBoundingClientRect(); if ((r.width <= 2 || r.height <= 2) && cs.overflow !== 'visible') return true; if (cs.clipPath && cs.clipPath !== 'none' && r.width <= 2) return true; } return false; };
  const out = { over: document.documentElement.scrollWidth - vw, clip: [], off: [], small: [] };
  for (const e of document.querySelectorAll('body *')) {
    if (e.closest('svg, .leaflet-container, [aria-hidden="true"], [inert], dialog:not([open]), template') || !shown(e) || srOnly(e)) continue;
    const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
    const leaf = [...e.childNodes].some((n) => n.nodeType === 3 && n.data.trim());
    if (leaf && cs.overflowX !== 'visible' && e.scrollWidth > e.clientWidth + 1 && cs.webkitLineClamp === 'none' && !/(auto|scroll)/.test(cs.overflowX) && !/^(INPUT|TEXTAREA|SELECT)$/.test(e.tagName)) out.clip.push(name(e) + ' "' + e.textContent.trim().slice(0, 30) + '"');
    if (r.width && r.left < vw && r.right > vw + 1 && !scroller(e) && cs.position !== 'fixed') out.off.push(name(e) + ' ends ' + Math.round(r.right - vw) + 'px past');
    if (touch && /^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(e.tagName) && e.type !== 'hidden' && e.type !== 'range' && !(e.type === 'radio' || e.type === 'checkbox')) {
      const inline = e.tagName === 'A' && cs.display === 'inline';
      const a = getComputedStyle(e, '::after'); const b = getComputedStyle(e, '::before');
      const grown = [a, b].some((p) => p.content !== 'none' && p.position === 'absolute');
      const lab = e.closest('label'); const lr = lab ? lab.getBoundingClientRect() : null;
      const aux = e.dataset.tap === 'aux';
      if (!inline && !grown && (aux ? r.height : Math.min(r.width, r.height)) < 44 && !(lr && Math.min(lr.width, lr.height) >= 44)) out.small.push(name(e) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' "' + (e.textContent || e.getAttribute('aria-label') || e.placeholder || '').trim().slice(0, 18) + '"');
    }
  }
  for (const k of ['clip', 'off', 'small']) out[k] = [...new Set(out[k])];
  return out;
};

const browser = await chromium.launch();
const rows = []; let bad = 0;
const queue = paths.flatMap((p) => WIDTHS.map((w) => [p, w]));
const worker = async () => {
  for (let job; (job = queue.shift());) {
    const [path, [w, h]] = job; const errs = [];
    const page = await browser.newPage({ viewport: { width: w, height: h }, hasTouch: w < 1024, reducedMotion: 'reduce' });
    page.on('pageerror', (e) => errs.push(e.message.slice(0, 120)));
    try {
      await page.goto(base.replace(/\/$/, '') + path + (path.endsWith('/') ? '' : '/'), { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(500);
      const r = await page.evaluate(probe); r.errs = errs; r.path = path; r.w = w;
      if (r.over > 0 || r.clip.length || r.off.length || r.small.length || errs.length) bad++;
      rows.push(r);
    } catch (e) { rows.push({ path, w, over: 0, clip: [], off: [], small: [], errs: ['did not load: ' + e.message.slice(0, 80)] }); bad++; }
    await page.close();
  }
};
await Promise.all(Array.from({ length: 6 }, worker));
await browser.close();

rows.sort((a, b) => a.path.localeCompare(b.path) || a.w - b.w);
const sig = new Map();
for (const r of rows) {
  const add = (kind, what) => { const k = kind + ' | ' + what.replace(/ \d+x\d+/, '').replace(/ends \d+px past/, 'sticks out'); if (!sig.has(k)) sig.set(k, new Set()); sig.get(k).add(r.path + '@' + r.w); };
  if (r.over > 0) add('sideways scroll', r.over + 'px');
  r.clip.forEach((x) => add('cut off', x)); r.off.forEach((x) => add('off screen', x)); r.small.forEach((x) => add('small target', x)); r.errs.forEach((x) => add('script error', x));
}
if (process.argv.includes('--json')) console.log(JSON.stringify(rows));
else {
  for (const [k, where] of [...sig].sort((a, b) => b[1].size - a[1].size)) { const pages = new Set([...where].map((x) => x.split('@')[0])); console.log(String(where.size).padStart(4) + '  ' + k + '   [' + pages.size + ' page' + (pages.size > 1 ? 's' : '') + ': ' + [...pages].slice(0, 3).join(', ') + (pages.size > 3 ? ', …' : '') + '; widths ' + [...new Set([...where].map((x) => x.split('@')[1]))].join(',') + ']'); }
  console.log(bad ? '\n' + bad + ' of ' + rows.length + ' page-width checks have something to fix.' : '\nAll ' + rows.length + ' page-width checks pass.');
}
process.exit(bad ? 1 : 0);
