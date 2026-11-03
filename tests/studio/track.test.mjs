// Funnel tracking tests. Run with: node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const SQL = read('supabase/migrations/20261103120000_studio_events.sql');
const FN = read('supabase/functions/event-intake/index.ts');
const TRACK = read('assets/studio/track.js');

const listIn = (src, re) => [...src.match(re)[1].matchAll(/'([a-z_]+)'|"([a-z_]+)"/g)].map((m) => m[1] || m[2]).sort();

test('tracking: page, edge function and table agree on the event names', () => {
  const page = listIn(TRACK, /const EVENTS = \[([^\]]+)\]/);
  const fn = listIn(FN, /const EVENTS = new Set\(\[([^\]]+)\]/);
  const sql = listIn(SQL, /event in \(([^)]+)\)/);
  assert.deepEqual(page, fn);
  assert.deepEqual(page, sql);
});

test('tracking: no personal data in the table, the function or any track() call', () => {
  for (const col of ['name', 'email', 'phone', 'ip text', 'message']) assert.ok(!new RegExp('^\\s+' + col + '\\b', 'm').test(SQL), 'column ' + col);
  for (const f of ['assets/studio/track.js', 'assets/studio/endings.js', 'assets/studio/madlib.js']) {
    for (const call of read(f).match(/track\('[a-z_]+'[^;]*\);/g) || []) {
      assert.ok(!/name|email|phone|note|message/i.test(call.replace(/track\('[a-z_]+'/, '')), f + ': ' + call);
    }
  }
});

test('tracking: table is closed to the public keys', () => {
  assert.match(SQL, /enable row level security/);
  assert.ok(!/create policy/i.test(SQL));
});
