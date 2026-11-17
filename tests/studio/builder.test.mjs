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

test('builder: compliance rules catch each banned pattern and pass the shipped wording', () => {
  const bad = { fear: "Don't leave your family with funeral debt.", urgency: 'Act now: only 3 spots left.', claim: 'Everyone is approved for one dollar a month.', personal: 'Did you just lose your mother?' };
  for (const r of FB.RULES) {
    assert.ok(r.re.test(bad[r.id]), r.id + ' misses its own example');
    assert.match(r.src[1], /^https:\/\//);
    for (const [where, t] of allText()) assert.ok(!r.re.test(t), where + ' trips the ' + r.id + ' rule');
    for (const [k, a] of Object.entries(FB.ADS)) assert.ok(!r.re.test(a.text + ' ' + a.head), 'ad ' + k + ' trips ' + r.id);
  }
});

test('builder: every ad angle exists, follows the copy rules and names a Meta button', () => {
  const buttons = ['Download', 'Learn more', 'Sign up', 'Get quote', 'Book now'];
  for (const [k, a] of Object.entries(FB.ADS)) {
    assert.ok(FB.ANGLES[k], k);
    assert.ok(buttons.includes(a.btn), k + ' button ' + a.btn);
    assert.ok(!DASH.test(a.text + a.head), k + ' has a dash');
    assert.equal(((a.text + ' ' + a.head).match(HYPE) || [null])[0], null, k);
  }
  assert.ok(!FB.ADS.now, 'the help-now page must have no ad');
});

test('builder: the downloaded page carries working tools and no builder chrome', () => {
  const st = { brand: FB.BRAND, sections: [{ id: 'a', type: 'costtool' }, { id: 'b', type: 'paytool' }] };
  const html = FB.renderDoc(st);
  assert.ok(html.includes('data-lp-tool="cost"') && html.includes('data-lp-tool="pay"'));
  assert.ok(html.includes('<script>(function lpTools'), 'tools script is inlined');
  assert.ok(!html.includes('fb-sel'), 'no builder selection styles in the download');
  const total = FB.COST_ITEMS.reduce((a, i) => a + i[1], 0);
  assert.equal(total, 9959, 'cost lines still match the NFDA medians used on the toolkit');
});

test('funnel split: the family-facing funnel links to the behind-the-page page, which holds the stack, add-ons and tabs', () => {
  const funnel = readFileSync(new URL('../../funnels/memorial/index.html', import.meta.url), 'utf8');
  const behind = readFileSync(new URL('../../funnels/memorial/behind/index.html', import.meta.url), 'utf8');
  for (const id of ['id="stack"', 'id="addons"', 'id="behind"']) {
    assert.ok(!funnel.includes(id), 'funnel still has ' + id);
    assert.ok(behind.includes(id), 'behind page is missing ' + id);
  }
  assert.ok(funnel.includes('href="/funnels/memorial/behind"'), 'funnel does not link to the behind page');
  assert.ok(behind.includes('href="/funnels/memorial"'), 'behind page does not link back to the funnel');
  assert.ok(readFileSync(new URL('../../assets/funnels/memorial.js', import.meta.url), 'utf8').includes("location.replace('/funnels/memorial/behind'"), 'old #stack links are not forwarded');
});
