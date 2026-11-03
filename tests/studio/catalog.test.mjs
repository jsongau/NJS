// Catalog, leak and copy tests. Run with: node --test
// The leak test greps the public catalog and the built page output (the page, every studio
// module, the stylesheet, and the single-file preview built in memory) for "$" followed by a digit.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCatalog, quote } from '../../assets/studio/engine.js';
import { buildPublic, serialize, SOURCE, PUBLIC } from '../../tools/build-studio-catalog.mjs';
import { buildPreview } from '../../tools/build-preview.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const PUB_TEXT = read('assets/studio/data/studio-catalog.public.json');
const PUB = JSON.parse(PUB_TEXT);
const PROJECTS = JSON.parse(read('assets/studio/data/projects.json'));
const MODULES = readdirSync(join(ROOT, 'assets/studio')).filter((f) => f.endsWith('.js')).map((f) => 'assets/studio/' + f);
const PAGE_FILES = ['index.html', 'assets/studio/studio.css', ...MODULES];
const MONEY = /\$\s?\d/;
const DASHES = new RegExp('[' + String.fromCharCode(0x2013, 0x2014) + ']');
const keysDeep = (o, out = []) => { if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { out.push(k); keysDeep(v, out); } return out; };

test('public catalog validates and says prices are hidden', () => {
  const v = validateCatalog(PUB, PROJECTS);
  assert.ok(v.ok, v.errors.join(', '));
  assert.equal(PUB.show_prices, false);
  assert.equal(PUB.prices, 'hidden');
  assert.equal(PUB.flags.deposit_enabled, false);
});

test('leak: no "$" plus digit in the public catalog, projects, page files or the built preview', () => {
  assert.ok(!MONEY.test(PUB_TEXT), 'public catalog');
  assert.ok(!MONEY.test(JSON.stringify(PROJECTS)), 'projects.json');
  for (const f of PAGE_FILES) assert.ok(!MONEY.test(read(f)), f);
  const built = buildPreview();
  const hit = built.match(/.{0,40}\$\s?\d.{0,40}/);
  assert.equal(hit, null, 'built preview: ' + (hit && hit[0]));
});

test('leak: no _cents key, price, monthly or percent field in the public catalog', () => {
  const keys = keysDeep(PUB);
  assert.equal(keys.filter((k) => k.endsWith('_cents')).length, 0);
  for (const k of ['price', 'monthly', 'annual', 'percent', 'price_multiplier']) assert.ok(!keys.includes(k), k);
  assert.ok(!keys.some((k) => k.startsWith('_')), 'private note keys');
});

test('public engine run returns no money at all', () => {
  const q = quote({ features: ['site', 'book', 'deposit', 'agent'], pages: 30, addons: ['onsite', 'fit'], fit_sessions: 2, care_plan: 'tend', billing: 'annual' }, PUB);
  assert.equal(q.priced, false);
  assert.ok(!MONEY.test(JSON.stringify(q)));
  assert.ok(q.lines.every((l) => l.cents === null) && q.separate.every((s) => s.cents === null) && q.deposit_cents === null);
});

test('private source validates, builds to the committed public file, same version', { skip: existsSync(SOURCE) ? false : 'private source not present' }, () => {
  const src = JSON.parse(readFileSync(SOURCE, 'utf8'));
  const v = validateCatalog(src, PROJECTS);
  assert.ok(v.ok, v.errors.join(', '));
  assert.equal(serialize(buildPublic(src)), readFileSync(PUBLIC, 'utf8'), 'public catalog is stale: run node tools/build-studio-catalog.mjs');
  assert.equal(src.version, PUB.version);
  assert.equal(PROJECTS.version, PUB.version);
});

test('the priced source never sits in a tracked path', () => {
  const ignore = read('.gitignore');
  assert.ok(ignore.split('\n').some((l) => l.trim() === 'docs/nathan-j-song/'), '.gitignore must list docs/nathan-j-song/');
  for (const f of ['assets/studio/data', 'tests/studio', 'tools']) {
    for (const name of readdirSync(join(ROOT, f))) {
      if (!name.endsWith('.json')) continue;
      assert.ok(!/_cents/.test(read(join(f, name))), f + '/' + name + ' holds prices');
    }
  }
  assert.ok(!existsSync(join(ROOT, 'supabase/functions/studio-quote/catalog.json')), 'no priced server copy in Wave 1');
});

test('projects: every project has a verified date and a live or concept kind; proof links resolve', () => {
  const ids = new Set(PROJECTS.projects.map((p) => p.id));
  for (const p of PROJECTS.projects) {
    assert.match(p.verified && p.verified.on, /^\d{4}-\d{2}-\d{2}$/, p.id);
    assert.ok(['live', 'concept'].includes(p.kind), p.id);
    assert.ok(/^https:\/\//.test(p.url), p.id);
  }
  for (const f of PUB.features) if (f.proof) assert.ok(ids.has(f.proof), f.id);
  const fIds = new Set(PUB.features.map((f) => f.id));
  for (const p of PROJECTS.projects) for (const f of p.features) if (f.catalog_feature) assert.ok(fIds.has(f.catalog_feature), p.id + ':' + f.name);
});

test('honesty: no popularity, guarantee or urgency language in the catalog or page', () => {
  const banned = /most popular|best value|best seller|customer favorite|clients love|guaranteed|risk-free|money-back|limited time|only \d+ spots|\bour team\b|\bour engineers\b|\bagency\b/i;
  for (const [name, text] of [['catalog', PUB_TEXT], ['projects', JSON.stringify(PROJECTS)], ...PAGE_FILES.map((f) => [f, read(f)])]) {
    const m = text.match(banned);
    assert.equal(m, null, name + ': ' + (m && m[0]));
  }
});

test('copy lint: no em or en dashes, no hype words, no unfilled brackets in shipped copy', () => {
  const hype = /\b(revolutionary|cutting-edge|seamless(ly)?|supercharge|game-changer|world-class|best-in-class|effortless(ly)?|unlock your|next-level)\b/i;
  const files = [...PAGE_FILES, 'assets/studio/data/studio-catalog.public.json', 'assets/studio/data/projects.json',
    'tools/build-studio-catalog.mjs', 'tools/build-preview.mjs', 'tests/studio/engine.test.mjs', 'tests/studio/catalog.test.mjs'];
  for (const f of files) {
    const t = read(f);
    assert.ok(!DASHES.test(t), f + ' has an em or en dash');
    if (!f.startsWith('tests/')) assert.equal((t.match(hype) || [null])[0], null, f);
  }
  const copy = keysDeep(PUB).length && JSON.stringify(PUB);
  assert.ok(!/\[[A-Za-z0-9 ]+\]/.test(copy.replace(/"[a-z_]+":\s*\[/g, '')), 'bracket placeholder in catalog copy');
});

test('type: Geist and Geist Mono only, never Instrument Serif', () => {
  const html = read('index.html');
  assert.ok(/family=Geist:wght/.test(html) && /family=Geist\+Mono/.test(html));
  for (const f of PAGE_FILES) assert.ok(!/Instrument Serif|Instrument\+Serif/.test(read(f)), f);
});
