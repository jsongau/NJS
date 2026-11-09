// Mary's headline rule: the page builder wraps each phrase of a multi-phrase heading in .ph so lines
// break between phrases. The browser check is tools/check-headlines.mjs; this guards the builder.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { phraseWrap, buildAll } from '../../tools/build-pages.mjs';

test('multi-phrase headings get one .ph per phrase', () => {
  assert.equal(phraseWrap('Pick a time. Pick a pack. <em>Start training.</em>'),
    '<span class="ph">Pick a time.</span> <span class="ph">Pick a pack.</span> <span class="ph"><em>Start training.</em></span>');
  assert.equal(phraseWrap('Six weeks from now,<br>you\'ll be glad you started.'),
    '<span class="ph">Six weeks from now,</span><br><span class="ph">you\'ll be glad you started.</span>');
});

test('single-phrase headings and block content are left alone', () => {
  assert.equal(phraseWrap('Lose fat without losing the muscle you have.'), 'Lose fat without losing the muscle you have.');
  assert.equal(phraseWrap('<div>Not a heading body.</div> Two.'), '<div>Not a heading body.</div> Two.');
  assert.equal(phraseWrap('<span class="ph">Done.</span> <span class="ph">Already.</span>'), '<span class="ph">Done.</span> <span class="ph">Already.</span>');
});

test('punctuation inside an inline tag does not split it', () => {
  assert.equal(phraseWrap('<em>One, two</em> three'), '<em>One, two</em> three');
});

test('every built heading with two phrases carries .ph', () => {
  const files = buildAll();
  const misses = [];
  for (const [rel, html] of Object.entries(files)) {
    if (!rel.endsWith('.html')) continue;
    for (const m of html.matchAll(/<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/g)) {
      const inner = m[2];
      if (/<(div|p|ul|svg)\b/i.test(inner)) continue;
      const text = inner.replace(/<br\s*\/?>/gi, ' | ').replace(/<[^>]+>/g, '').trim();
      if (/[.,:;?!—·|]\s+\S/.test(text) && !/class="ph"/.test(inner)) misses.push(rel + ': ' + text);
    }
  }
  assert.deepEqual(misses, []);
});
