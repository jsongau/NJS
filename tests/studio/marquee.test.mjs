// Business ribbon tests. Run with: node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { MARQ, marqRow } from '../../assets/studio/marquee.js';

test('ribbon: every entry has a unique id, name and line', () => {
  assert.ok(MARQ.length >= 50, 'at least 50 businesses');
  for (const key of ['id', 'name', 'line']) {
    const seen = new Set(MARQ.map((m) => m[key]));
    assert.equal(seen.size, MARQ.length, 'duplicate ' + key);
  }
});

test('ribbon: every mark is its own drawing with one accent', () => {
  const art = new Set();
  for (const m of MARQ) {
    assert.match(m.svg, /^<svg class="gi mq-ic" data-i="[a-z]+" viewBox="0 0 32 32"/, m.id);
    assert.ok(m.svg.endsWith('</svg>'), m.id);
    assert.ok(m.svg.includes('class="a"'), m.id + ' needs an accent shape');
    const body = m.svg.replace(/data-i="[a-z]+"/, '');
    assert.ok(!art.has(body), m.id + ' reuses another mark');
    art.add(body);
  }
});

test('ribbon: lines stay short enough to read while moving', () => {
  for (const m of MARQ) assert.ok(m.line.length <= 48, m.id + ': ' + m.line);
});

test('ribbon: row escapes names', () => {
  const row = marqRow((s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;'));
  assert.equal((row.match(/class="mq"/g) || []).length, MARQ.length);
});
