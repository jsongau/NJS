#!/usr/bin/env node
// Builds the public studio catalog from the private source.
//   node tools/build-studio-catalog.mjs          write assets/studio/data/studio-catalog.public.json
//   node tools/build-studio-catalog.mjs --check  fail if the committed public file is stale
//
// The source (docs/nathan-j-song/studio-catalog.source.json) holds prices and is gitignored,
// because jsongau/NJS is a public repo. When show_prices is false the public build drops every
// key ending in _cents, every price, monthly and annual object, and every key that starts with
// an underscore (private notes). The server copy with prices is NOT written in Wave 1: Wave 4
// reads prices from Supabase, so no priced file ever sits in a tracked path.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCatalog } from '../assets/studio/engine.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SOURCE = join(ROOT, 'docs/nathan-j-song/studio-catalog.source.json');
export const PUBLIC = join(ROOT, 'assets/studio/data/studio-catalog.public.json');
export const PROJECTS = join(ROOT, 'assets/studio/data/projects.json');

const PRICE_OBJECTS = new Set(['price', 'monthly', 'annual']);
const PRICE_KEYS = new Set(['percent', 'price_multiplier', 'round_to_cents']);

function strip(node, hide) {
  if (Array.isArray(node)) return node.map((v) => strip(v, hide));
  if (!node || typeof node !== 'object') return node;
  const out = {};
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('_')) continue;
    if (hide && (k.endsWith('_cents') || PRICE_OBJECTS.has(k) || PRICE_KEYS.has(k))) continue;
    const s = strip(v, hide);
    if (s && typeof s === 'object' && !Array.isArray(s) && Object.keys(s).length === 0 && v && Object.keys(v).length) continue;
    out[k] = s;
  }
  return out;
}

export function buildPublic(source) {
  const hide = source.show_prices !== true;
  const pub = strip(source, hide);
  pub.prices = hide ? 'hidden' : 'shown';
  if (hide) pub.show_deposit_amount = false;
  return pub;
}

export function serialize(obj) { return JSON.stringify(obj, null, 2) + '\n'; }

function main() {
  if (!existsSync(SOURCE)) {
    console.error('No private source at ' + SOURCE + '. Nothing to build (expected on CI for the public repo).');
    process.exit(process.argv.includes('--check') ? 0 : 1);
  }
  const source = JSON.parse(readFileSync(SOURCE, 'utf8'));
  const projects = JSON.parse(readFileSync(PROJECTS, 'utf8'));
  const v = validateCatalog(source, projects);
  if (!v.ok) { console.error('Catalog invalid:\n  ' + v.errors.join('\n  ')); process.exit(1); }
  const out = serialize(buildPublic(source));
  if (process.argv.includes('--check')) {
    const cur = existsSync(PUBLIC) ? readFileSync(PUBLIC, 'utf8') : '';
    if (cur !== out) { console.error('Public catalog is stale. Run node tools/build-studio-catalog.mjs'); process.exit(1); }
    console.log('Public catalog is up to date (' + source.version + ').');
    return;
  }
  writeFileSync(PUBLIC, out);
  console.log('Wrote ' + PUBLIC + ' (' + source.version + ', prices ' + (source.show_prices ? 'shown' : 'hidden') + ').');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
