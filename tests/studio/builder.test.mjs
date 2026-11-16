// Landing page builder: every template, section and wording angle renders, wording follows the copy rules,
// every angle carries a source, and nothing claims what it cannot back up.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
require('../../assets/funnels/builder/data.js');
require('../../assets/funnels/builder/render.js');
const FB = globalThis.FB;

const DASH = new RegExp('[' + String.fromCharCode(0x2013, 0x2014) + ']');
const HYPE = /\b(revolutionary|cutting-edge|seamless(ly)?|supercharge|game-changer|world-class|best-in-class|effortless(ly)?|unlock|leverage|empower|peace of mind|guaranteed approval|everyone (is )?approved|act now|limited time|only \d+ (left|spots|seats)|hurry|don't wait)\b/i;
const FEAR = /\b(funeral debt|burden your|leave your (kids|children|family) with|before it'?s too late|fight over)\b/i;

function allText() {
  const out = [];
  for (const [type, s] of Object.entries(FB.SECTIONS)) for (const [k, v] of Object.entries(s.variants)) for (const [f, t] of Object.entries(v)) out.push([type + '.' + k + '.' + f, t]);
  for (const [k, a] of Object.entries(FB.ANGLES)) out.push(['angle.' + k, a.name + ' ' + a.why]);
  FB.FAQ.forEach((q, i) => out.push(['faq' + i, q.join(' ')]));
  return out;
}

test('builder: every angle has a name, a reason and an https source', () => {
  for (const [k, a] of Object.entries(FB.ANGLES)) {
    assert.ok(a.name && a.why.length > 40, k);
    assert.match(a.src[1], /^https:\/\//, k);
  }
});

test('builder: every variant key is a real angle (or base), and every section field has wording', () => {
  for (const [type, s] of Object.entries(FB.SECTIONS)) {
    for (const k of Object.keys(s.variants)) assert.ok(k === 'base' || FB.ANGLES[k], type + ' uses unknown angle ' + k);
    const first = s.variants.base || Object.values(s.variants)[0];
    for (const [f] of s.fields) assert.ok(first[f] != null, type + ' default has no ' + f);
  }
});

test('builder: wording follows the copy rules (no dashes, hype, fear hooks or fake urgency)', () => {
  for (const [where, t] of allText()) {
    assert.ok(!DASH.test(t), where + ' has an em or en dash');
    assert.equal((t.match(HYPE) || [null])[0], null, where);
    assert.equal((t.match(FEAR) || [null])[0], null, where);
  }
});

test('builder: every template, and every section in every angle and layout, renders a full page', () => {
  for (const t of FB.TEMPLATES) {
    for (const s of t.sections) assert.ok(FB.SECTIONS[s.type], t.id + ' ' + s.type);
    const st = { brand: { ...FB.BRAND, palette: t.palette, font: t.font }, sections: t.sections.map((s, i) => ({ id: 's' + i, ...s })) };
    const html = FB.renderDoc(st);
    assert.match(html, /^<!doctype html>/);
    assert.ok(!/undefined|NaN|\{(name|phone|area|license)\}/.test(html), t.id + ' leaks a token');
    assert.ok(html.includes('General price list'), t.id + ' has no price list link (California B&P 7685)');
  }
  for (const [type, s] of Object.entries(FB.SECTIONS)) {
    for (const angle of [null, ...Object.keys(s.variants)]) for (const layout of (s.layouts || [[null]]).map((l) => l[0])) {
      const body = FB.renderBody({ brand: FB.BRAND, sections: [{ id: 'x', type, angle, layout }] });
      assert.ok(body.includes('data-sid="x"'), type + ' ' + angle + ' ' + layout);
      assert.ok(!/undefined/.test(body), type + ' ' + angle);
    }
  }
});

test('builder: user text is escaped, and bracketed text is marked for the client', () => {
  const body = FB.renderBody({ brand: { ...FB.BRAND, name: '<b>x</b>' }, sections: [{ id: 'x', type: 'hero', angle: 'gift', layout: 'center', f: { h: '<img src=x onerror=alert(1)> [Price]' } }] });
  assert.ok(!body.includes('<img src=x'));
  assert.ok(!body.includes('<b>x</b>'));
  assert.ok(body.includes('<mark class="lp-need">Price</mark>'));
});

test('builder: reviews are slots for real reviews only, never invented quotes', () => {
  const body = FB.renderBody({ brand: FB.BRAND, sections: [{ id: 'r', type: 'reviews' }] });
  assert.ok(body.includes('A real review from Google, shown with permission'));
});

test('builder: the page links to the funnel template and is in the funnels hub and mega nav', () => {
  const page = readFileSync(new URL('../../funnels/memorial/builder/index.html', import.meta.url), 'utf8');
  assert.ok(page.includes('/assets/funnels/builder/app.js'));
  assert.ok(readFileSync(new URL('../../assets/studio/meganav.js', import.meta.url), 'utf8').includes("'/funnels/memorial/builder'"));
  assert.ok(readFileSync(new URL('../../funnels/index.html', import.meta.url), 'utf8').includes('/funnels/memorial/builder'));
});
