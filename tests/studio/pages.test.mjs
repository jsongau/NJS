// Page tests: the six studio pages are built from one set of partials. Run with: node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGES, buildAll } from '../../tools/build-pages.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const BUILT = buildAll();
const html = (p) => BUILT[p.out];

test('pages: committed files match the partials (run node tools/build-pages.mjs)', () => {
  for (const [rel, out] of Object.entries(BUILT)) assert.equal(readFileSync(join(ROOT, rel), 'utf8'), out, rel + ' is stale');
});

test('pages: unique titles and descriptions, canonical matches the path', () => {
  const titles = new Set(); const descs = new Set();
  for (const p of Object.values(PAGES)) {
    const h = html(p);
    titles.add(h.match(/<title>(.*?)<\/title>/)[1]);
    descs.add(h.match(/<meta name="description" content="(.*?)">/)[1]);
    assert.ok(h.includes('<link rel="canonical" href="https://nathanjsong.com' + p.path + '">'), p.id);
    assert.ok(p.description.length >= 80 && p.description.length <= 200, p.id + ' description length ' + p.description.length);
  }
  assert.equal(titles.size, Object.keys(PAGES).length);
  assert.equal(descs.size, Object.keys(PAGES).length);
});

test('pages: exactly one h1 each, and the right tab is marked current', () => {
  for (const p of Object.values(PAGES)) {
    const h = html(p);
    assert.equal((h.match(/<h1[\s>]/g) || []).length, 1, p.id + ' h1 count');
    const cur = h.match(/<a [^>]*href="([^"]+)"[^>]* aria-current="page">/g) || [];
    // The phone menu marks this page; the desktop MegaNav marks it too when it has a top link
    // (Care sits inside the Studio panel). Every mark points at this page.
    if (p.nav) { assert.ok(cur.length >= 1 && cur.length <= 2, p.id); cur.forEach((c) => assert.ok(c.includes('"' + p.path + '"'), p.id)); } else assert.equal(cur.length, 0, p.id);
  }
});

test('pages: every in-page #link has its target on the same page', () => {
  for (const p of Object.values(PAGES)) {
    const h = html(p);
    const ids = new Set([...h.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    for (const [, id] of h.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(id), p.id + ': #' + id + ' has no target');
  }
});

test('pages: ids are unique on each page', () => {
  for (const p of Object.values(PAGES)) {
    const all = [...html(p).matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    const dup = all.filter((x, i) => all.indexOf(x) !== i);
    assert.deepEqual(dup, [], p.id);
  }
});

test('pages: structured data parses, and the FAQ markup matches the visible FAQ', () => {
  for (const p of Object.values(PAGES)) {
    const m = html(p).match(/<script type="application\/ld\+json">(.*?)<\/script>/);
    assert.ok(m, p.id + ' has JSON-LD');
    JSON.parse(m[1]);
  }
  const plans = html(PAGES.plans);
  const visible = [...plans.matchAll(/<summary>(.*?)<\/summary>/g)].map((m) => m[1].replace(/&amp;/g, '&'));
  const ld = JSON.parse(plans.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);
  const faq = ld.find((x) => x['@type'] === 'FAQPage');
  assert.deepEqual(faq.mainEntity.map((q) => q.name), visible);
});

test('pages: copy rules hold on every page (no em or en dashes, no hype, no prices)', () => {
  const dashes = new RegExp('[' + String.fromCharCode(0x2013, 0x2014) + ']');
  const hype = /\b(revolutionary|cutting-edge|seamless(ly)?|supercharge|game-changer|world-class|best-in-class|effortless(ly)?|unlock your|next-level)\b/i;
  for (const p of Object.values(PAGES)) {
    const text = html(p).replace(/<style[\s\S]*?<\/style>/g, '').replace(/<svg[\s\S]*?<\/svg>/g, '');
    assert.ok(!dashes.test(text), p.id + ' has a dash');
    assert.equal((text.match(hype) || [null])[0], null, p.id);
    assert.ok(!/\$\s?\d/.test(text), p.id + ' shows a price');
  }
});

test('pages: sitemap lists every page and robots points to it', () => {
  for (const p of Object.values(PAGES)) assert.ok(BUILT['sitemap.xml'].includes('<loc>https://nathanjsong.com' + p.path + '</loc>'), p.id);
  assert.match(BUILT['robots.txt'], /Sitemap: https:\/\/nathanjsong\.com\/sitemap\.xml/);
});

test('pages: only /build carries the plan bar and the lead form', () => {
  for (const p of Object.values(PAGES)) {
    const has = html(p).includes('id="lead-form"');
    assert.equal(has, p.id === 'build' || p.id === 'home', p.id);
  }
});
