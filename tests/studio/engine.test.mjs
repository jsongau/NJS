// Engine tests (Ross section 2.3). Run with: node --test
// Priced tests read the private source from docs/nathan-j-song/ (gitignored). On the public
// repo, where that file does not exist, they skip. No real price is typed into this file:
// every expectation is computed from the catalog itself.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { quote, validateCatalog, carePlanForUpdates } from '../../assets/studio/engine.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = join(ROOT, 'docs/nathan-j-song/studio-catalog.source.json');
const deepFreeze = (o) => { if (o && typeof o === 'object') { Object.values(o).forEach(deepFreeze); Object.freeze(o); } return o; };
const load = (p) => deepFreeze(JSON.parse(readFileSync(p, 'utf8')));
const HIDDEN = load(join(ROOT, 'assets/studio/data/studio-catalog.public.json'));
const HAS_PRICED = existsSync(SRC);
const PRICED = HAS_PRICED ? load(SRC) : null;
const skip = HAS_PRICED ? false : 'private source not present';
const CAT = PRICED || HIDDEN;

const FEATURES = CAT.features.map((f) => f.id);
const W = Object.fromEntries(CAT.features.map((f) => [f.id, f.weight]));
const tierOf = (id) => CAT.tiers.find((t) => t.id === id);
const R = PRICED ? PRICED.round_to_cents : 1;
const subsets = () => {
  const out = [];
  for (let m = 0; m < 1 << FEATURES.length; m++) out.push(FEATURES.filter((_, i) => m & (1 << i)));
  return out;
};
const BAND_PAGES = [3, 10, 20, 100, 400];

test('1. empty selection: no tier, meter 0, every range null, no throw', () => {
  const q = quote({}, CAT);
  assert.equal(q.tier, null);
  assert.equal(q.meter, 0);
  assert.equal(q.weeks, null);
  for (const k of ['one_time_cents', 'monthly_cents', 'annual_total_cents', 'deposit_cents', 'build_window_cents']) assert.equal(q[k], null, k);
});

test('2. site alone is Launch, 2 to 3 weeks, window inside the tier, meter 8', { skip }, () => {
  const q = quote({ features: ['site'] }, PRICED);
  const t = tierOf('launch');
  assert.equal(q.tier.id, 'launch');
  assert.deepEqual(q.weeks, t.weeks);
  assert.ok(q.one_time_cents[0] >= t.price.low_cents && q.one_time_cents[1] <= t.price.high_cents);
  assert.equal(q.build_window_cents[1] - q.build_window_cents[0], (t.price.high_cents - t.price.low_cents) * PRICED.rules.window_share);
  assert.equal(q.meter, 8);
});

test('3. any weight 2 feature alone is Grow, reason weight', () => {
  for (const id of FEATURES.filter((f) => W[f] === 2)) {
    const q = quote({ features: [id] }, CAT);
    assert.equal(q.tier.id, 'grow', id);
    assert.equal(q.tier.reason, 'weight');
  }
});

test('4. four weight 1 features is Grow, reason feature_count', () => {
  // The live catalog has three weight 1 features, so the count rule is checked on a copy
  // where one more feature is weight 1.
  const c = JSON.parse(JSON.stringify(CAT));
  c.features.find((f) => f.id === 'dash').weight = 1;
  const ones = c.features.filter((f) => f.weight === 1).map((f) => f.id);
  assert.equal(ones.length, 4);
  const q = quote({ features: ones }, c);
  assert.equal(q.tier.id, 'grow');
  assert.equal(q.tier.reason, 'feature_count');
  assert.equal(quote({ features: ones.slice(0, 3) }, c).tier.id, 'launch');
});

test('5. seven features is Run by count; any weight 3 feature alone is Run by weight', () => {
  const seven = FEATURES.filter((f) => W[f] < 3).slice(0, 7);
  assert.equal(seven.length, 7);
  const q = quote({ features: seven }, CAT);
  assert.equal(q.tier.id, 'run');
  assert.equal(q.tier.reason, 'feature_count');
  for (const id of FEATURES.filter((f) => W[f] === 3)) {
    const r = quote({ features: [id] }, CAT);
    assert.equal(r.tier.id, 'run');
    assert.equal(r.tier.reason, 'weight');
  }
});

test('6. page band floor: Launch features plus 20 pages is Grow, reason page_band', () => {
  const q = quote({ features: ['site'], pages: 20 }, CAT);
  assert.equal(q.tier.id, 'grow');
  assert.equal(q.tier.reason, 'page_band');
});

test('7. 400 pages without the pages feature falls back to p41_150 and warns', () => {
  const q = quote({ features: ['site'], pages: 400 }, CAT);
  assert.equal(q.page_band.id, 'p41_150');
  assert.ok(q.warnings.includes('band_needs_feature:p151'));
  const r = quote({ features: ['site', 'pages'], pages: 400 }, CAT);
  assert.equal(r.page_band.id, 'p151');
});

test('8. every build window sits inside its tier range (all subsets x 5 bands)', { skip }, () => {
  for (const f of subsets()) {
    if (!f.length) continue;
    for (const pages of BAND_PAGES) {
      const q = quote({ features: f, pages }, PRICED);
      const t = tierOf(q.tier.id).price;
      assert.ok(q.build_window_cents[0] >= t.low_cents && q.build_window_cents[1] <= t.high_cents, f.join(',') + ' p' + pages);
    }
  }
});

test('9. monotonic: adding a feature never lowers one-time lo, hi or the meter', () => {
  for (const f of subsets()) {
    for (const pages of BAND_PAGES) {
      const a = quote({ features: f, pages }, CAT);
      for (const id of FEATURES) {
        if (f.includes(id)) continue;
        const b = quote({ features: f.concat(id), pages }, CAT);
        assert.ok(b.meter >= a.meter, 'meter ' + f.join(',') + '+' + id + ' p' + pages);
        if (PRICED && a.one_time_cents) {
          assert.ok(b.one_time_cents[0] >= a.one_time_cents[0], 'lo ' + f.join(',') + '+' + id + ' p' + pages);
          assert.ok(b.one_time_cents[1] >= a.one_time_cents[1], 'hi ' + f.join(',') + '+' + id + ' p' + pages);
        }
      }
    }
  }
});

test('10. rounding: both ends are multiples of the round step and lo <= hi', { skip }, () => {
  for (const f of subsets()) {
    if (!f.length) continue;
    const q = quote({ features: f, pages: 12, addons: ['onsite', 'rush'] }, PRICED);
    assert.equal(q.one_time_cents[0] % R, 0);
    assert.equal(q.one_time_cents[1] % R, 0);
    assert.ok(q.one_time_cents[0] <= q.one_time_cents[1]);
  }
});

test('11. onsite adds exactly its range; fit never changes one-time', { skip }, () => {
  const base = quote({ features: ['site', 'book'] }, PRICED);
  const on = quote({ features: ['site', 'book'], addons: ['onsite'] }, PRICED);
  const pr = PRICED.addons.find((a) => a.id === 'onsite').price;
  // The line carries the exact range; the rounded total moves by it within one round step.
  assert.deepEqual(on.lines.find((l) => l.id === 'onsite').cents, [pr.low_cents, pr.high_cents]);
  assert.ok(Math.abs(on.one_time_cents[0] - base.one_time_cents[0] - pr.low_cents) < R);
  assert.ok(Math.abs(on.one_time_cents[1] - base.one_time_cents[1] - pr.high_cents) < R);
  const fit = quote({ features: ['site', 'book'], addons: ['fit'], fit_sessions: 5 }, PRICED);
  assert.deepEqual(fit.one_time_cents, base.one_time_cents);
  assert.equal(fit.separate[0].qty, 5);
});

test('12. rush: price x multiplier then rounded, weeks x 0.7 rounded up, Run floor 5 weeks', () => {
  const rush = CAT.addons.find((a) => a.id === 'rush');
  const g = quote({ features: ['deposit'] }, CAT);
  const gr = quote({ features: ['deposit'], addons: ['rush'] }, CAT);
  assert.deepEqual(gr.weeks, g.weeks.map((w) => Math.max(tierOf('grow').weeks[0] - 1, Math.ceil(w * rush.weeks_multiplier))));
  const r = quote({ features: ['agent'], addons: ['rush'] }, CAT);
  assert.ok(r.weeks[0] >= 5);
  assert.ok(r.warnings.includes('rush_on_run_capped'));
  if (PRICED) {
    const lo = Math.floor((g.one_time_cents[0] * rush.price_multiplier) / R) * R;
    assert.ok(Math.abs(gr.one_time_cents[0] - lo) <= R);
    assert.ok(gr.one_time_cents[0] > g.one_time_cents[0]);
  }
});

test('13. care stepper: 0 none, 1 to 2 keep, 3 to 5 tend, 6 to 12 run, 15 clamps to run and warns', () => {
  const plan = (n) => carePlanForUpdates(n, CAT).plan.id;
  assert.equal(plan(0), 'none');
  [1, 2].forEach((n) => assert.equal(plan(n), 'keep'));
  [3, 4, 5].forEach((n) => assert.equal(plan(n), 'tend'));
  [6, 10, 12].forEach((n) => assert.equal(plan(n), 'run'));
  const r = carePlanForUpdates(15, CAT);
  assert.equal(r.plan.id, 'run');
  assert.ok(r.warnings.includes('updates_above_plan'));
  const q = quote({ features: ['site'], updates_per_month: 4, care_via: 'stepper', care_plan: 'none' }, CAT);
  assert.equal(q.care.id, 'tend');
});

test('14. annual: per-month is months/12 of monthly (rounded to 2500 cents), total is months x monthly', { skip }, () => {
  const months = PRICED.billing.annual_months_billed;
  const m = quote({ features: ['site'], care_plan: 'tend' }, PRICED);
  const a = quote({ features: ['site'], care_plan: 'tend', billing: 'annual' }, PRICED);
  assert.deepEqual(a.monthly_cents, m.monthly_cents.map((c) => Math.round((c * months) / 12 / 2500) * 2500));
  assert.deepEqual(a.annual_total_cents, m.monthly_cents.map((c) => c * months));
  assert.equal(m.annual_total_cents, null);
});

test('15. run care on a Launch build warns care_plan_below_tier and still prices', () => {
  const q = quote({ features: ['site'], care_plan: 'run' }, CAT);
  assert.equal(q.tier.id, 'launch');
  assert.equal(q.care.id, 'run');
  assert.ok(q.warnings.includes('care_plan_below_tier'));
  if (PRICED) assert.ok(Array.isArray(q.monthly_cents));
});

test('16. deposit: fixed amount, percent never above one-time lo, null with no tier', { skip }, () => {
  const q = quote({ features: ['site'] }, PRICED);
  assert.equal(q.deposit_cents, PRICED.deposit.amount_cents);
  const pct = { ...PRICED, deposit: { ...PRICED.deposit, mode: 'percent_of_low', percent: 2 } };
  const p = quote({ features: ['site'] }, pct);
  assert.equal(p.deposit_cents, p.one_time_cents[0]);
  assert.equal(quote({ features: [] }, PRICED).deposit_cents, null);
});

test('17. hidden catalog: priced false, cents null, tier, weeks and meter identical to priced', () => {
  for (const f of subsets()) {
    const sel = { features: f, pages: 12, addons: ['onsite'], care_plan: 'keep' };
    const h = quote(sel, HIDDEN);
    assert.equal(h.priced, false);
    assert.equal(h.one_time_cents, null);
    assert.equal(h.monthly_cents, null);
    assert.ok(h.lines.every((l) => l.cents === null));
    if (PRICED) {
      const p = quote(sel, PRICED);
      assert.deepEqual(h.tier, p.tier);
      assert.deepEqual(h.weeks, p.weeks);
      assert.equal(h.meter, p.meter);
    }
  }
});

test('18. unknown ids are dropped with warnings; duplicates count once', () => {
  const q = quote({ features: ['site', 'site', 'xyz'], addons: ['nope', 'onsite', 'onsite'] }, CAT);
  assert.deepEqual(q.features, ['site']);
  assert.deepEqual(q.addons, ['onsite']);
  assert.ok(q.warnings.includes('unknown_feature:xyz'));
  assert.ok(q.warnings.includes('unknown_addon:nope'));
});

test('19. pure: same input gives deep-equal output, input is not mutated', () => {
  const sel = deepFreeze({ features: ['book', 'deposit'], pages: 30, addons: ['rush', 'fit'], fit_sessions: 3, care_plan: 'tend', billing: 'annual' });
  assert.deepEqual(quote(sel, CAT), quote(sel, CAT));
});

test('20. validateCatalog rejects low > high, a duplicate id, a popular key, a band gap', () => {
  assert.ok(validateCatalog(CAT).ok, validateCatalog(CAT).errors.join(', '));
  const clone = () => JSON.parse(JSON.stringify(CAT));
  const a = clone(); a.tiers[0].price = { low_cents: 9, high_cents: 1 };
  assert.ok(validateCatalog(a).errors.some((e) => e.startsWith('range_low_above_high')));
  const b = clone(); b.features.push({ ...b.features[0] });
  assert.ok(validateCatalog(b).errors.some((e) => e.startsWith('duplicate_id')));
  const c = clone(); c.features[0].popular = true;
  assert.ok(validateCatalog(c).errors.some((e) => e.startsWith('forbidden_key')));
  const d = clone(); d.page_bands[1].min = 7;
  assert.ok(validateCatalog(d).errors.some((e) => e.startsWith('band_gap')));
});

test('21. parity: engine copy in the edge function matches (skips until Wave 4 adds it)', (t) => {
  const copy = join(ROOT, 'supabase/functions/studio-quote/engine.js');
  if (!existsSync(copy)) { t.skip('no edge function copy in Wave 1'); return; }
  const h = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
  assert.equal(h(copy), h(join(ROOT, 'assets/studio/engine.js')));
});

test('22. version: quote().catalog_version equals the catalog version', () => {
  assert.equal(quote({ features: ['site'] }, HIDDEN).catalog_version, HIDDEN.version);
  if (PRICED) assert.equal(PRICED.version, HIDDEN.version);
});
