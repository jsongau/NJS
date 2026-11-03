// NJS Studio pricing engine.
// Pure module: no imports, no DOM, no Date, no randomness. The same file runs in the
// browser, in node --test, and (Wave 4) inside the studio-quote edge function.
// With the public catalog (no price data) every _cents value is null and priced is false;
// tier, weeks, care wording and the meter are identical in both modes.

const TIER_IDS = ['launch', 'grow', 'run'];
const METER_BANDS = { launch: [8, 33], grow: [34, 66], run: [67, 100] };
const ID_RE = /^[a-z][a-z0-9_]{1,23}$/;
const FORBIDDEN_KEYS = ['popular', 'most_popular', 'badge', 'best_value', 'recommended', 'guarantee', 'bestseller'];

function clampN(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
function toNum(v, d) {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v);
  return d;
}
function hasRange(r) { return !!r && Number.isInteger(r.low_cents) && Number.isInteger(r.high_cents); }

export function isPriced(catalog) {
  return Array.isArray(catalog.tiers) && catalog.tiers.length > 0 && catalog.tiers.every((t) => hasRange(t.price));
}

export function tierRank(catalog, id) {
  const t = catalog.tiers.find((x) => x.id === id);
  return t ? t.rank : 0;
}

export function bandIndexForPages(pages, catalog) {
  const bands = catalog.page_bands;
  const i = bands.findIndex((b) => b.min <= pages && (b.max === null || pages <= b.max));
  return i === -1 ? bands.length - 1 : i;
}

export function carePlanForUpdates(n, catalog) {
  const warnings = [];
  const v = clampN(Math.round(toNum(n, 0)), 0, 20);
  const plans = catalog.care_plans.slice().sort((a, b) => a.updates_per_month - b.updates_per_month);
  let plan = plans.find((p) => p.updates_per_month >= v);
  if (!plan) { plan = plans[plans.length - 1]; warnings.push('updates_above_plan'); }
  return { plan, value: v, warnings };
}

export function quote(selection, catalog) {
  const sel = selection || {};
  const warnings = [];
  const priced = isPriced(catalog);
  const rules = catalog.rules || {};
  const growAt = rules.grow_at_feature_count ?? 4;
  const runAt = rules.run_at_feature_count ?? 7;
  const featById = new Map(catalog.features.map((f) => [f.id, f]));
  const addById = new Map(catalog.addons.map((a) => [a.id, a]));

  // 1. Clean input.
  const cleanIds = (list, map, kind) => {
    const out = [];
    for (const id of Array.isArray(list) ? list : []) {
      if (!map.has(id)) { warnings.push('unknown_' + kind + ':' + id); continue; }
      if (!out.includes(id)) out.push(id);
    }
    return out;
  };
  const features = cleanIds(sel.features, featById, 'feature');
  const addons = cleanIds(sel.addons, addById, 'addon');
  const bizIds = catalog.business_types.map((b) => b.id);
  let business = sel.business_type;
  if (!bizIds.includes(business)) {
    if (business != null) warnings.push('unknown_business:' + business);
    business = bizIds[0];
  }
  let style = sel.style == null ? null : sel.style;
  if (style != null && !catalog.styles.some((s) => s.id === style)) { warnings.push('unknown_style:' + style); style = null; }
  const pages = clampN(Math.round(toNum(sel.pages, 5)), 1, 2000);
  const billing = sel.billing === 'annual' ? 'annual' : 'monthly';
  const fitSessions = clampN(Math.round(toNum(sel.fit_sessions, 0)), 0, 10);

  // 2. Page band, with fallback when the band needs a feature that is not picked.
  const bands = catalog.page_bands;
  let bi = bandIndexForPages(pages, catalog);
  while (bi > 0 && (bands[bi].requires || []).some((id) => !features.includes(id))) {
    warnings.push('band_needs_feature:' + bands[bi].id);
    bi -= 1;
  }
  const band = bands[bi];

  // 3. Tier and 4. load.
  let tier = null;
  let reason = null;
  let p = 0;
  if (features.length) {
    const maxW = Math.max(...features.map((id) => featById.get(id).weight));
    const n = features.length;
    const cands = [
      { rank: maxW, reason: 'weight' },
      { rank: n >= runAt ? 3 : n >= growAt ? 2 : 1, reason: 'feature_count' },
    ];
    if (band.tier_floor) cands.push({ rank: tierRank(catalog, band.tier_floor), reason: 'page_band' });
    let best = cands[0];
    for (const c of cands) if (c.rank > best.rank) best = c;
    tier = catalog.tiers.find((t) => t.rank === best.rank);
    reason = best.reason;
    const load = features.reduce((s, id) => { const f = featById.get(id); return s + toNum(f.load, f.weight); }, 0);
    p = clampN((load - tier.load[0]) / (tier.load[1] - tier.load[0]), 0, 1);
  }

  const lines = [];
  const R = catalog.round_to_cents || 1;
  const modifiers = addons.map((id) => addById.get(id)).filter((a) => a.billing === 'modifier');
  const oneTimes = addons.map((id) => addById.get(id)).filter((a) => a.billing === 'one_time');

  // 5 to 8. Build window, pages, add-ons, modifiers, rounding.
  let oneTime = null;
  let buildWindow = null;
  if (tier) {
    let lo = null;
    let hi = null;
    if (priced) {
      const span = tier.price.high_cents - tier.price.low_cents;
      const w = span * (rules.window_share ?? 0.5);
      lo = tier.price.low_cents + p * (span - w);
      hi = lo + w;
      buildWindow = [Math.floor(lo / R) * R, Math.ceil(hi / R) * R];
    }
    lines.push({ kind: 'tier', id: tier.id, label: tier.label, cents: priced ? buildWindow.slice() : null });
    const bandPriced = priced && hasRange(band.price);
    if (bandPriced && (band.price.low_cents || band.price.high_cents)) {
      lo += band.price.low_cents; hi += band.price.high_cents;
    }
    lines.push({ kind: 'pages', id: band.id, label: band.label, cents: bandPriced ? [band.price.low_cents, band.price.high_cents] : null });
    for (const a of oneTimes) {
      const ap = priced && hasRange(a.price);
      if (ap) { lo += a.price.low_cents; hi += a.price.high_cents; }
      lines.push({ kind: 'addon', id: a.id, label: a.short || a.name, cents: ap ? [a.price.low_cents, a.price.high_cents] : null });
    }
    for (const m of modifiers) {
      if (priced && m.price_multiplier) { lo *= m.price_multiplier; hi *= m.price_multiplier; }
      lines.push({ kind: 'modifier', id: m.id, label: m.short || m.name, cents: null, multiplier: m.price_multiplier || 1 });
    }
    if (priced) oneTime = [Math.floor(lo / R) * R, Math.ceil(hi / R) * R];
  }

  // 9. Weeks.
  let weeks = null;
  if (tier) {
    const trigger = { launch: 1, grow: growAt, run: runAt }[tier.id];
    const extra = (band.extra_weeks || 0) + Math.floor(Math.max(0, features.length - trigger) / 3);
    weeks = [tier.weeks[0] + extra, tier.weeks[1] + extra];
    for (const m of modifiers) {
      if (!m.weeks_multiplier) continue;
      const floor = tier.id === 'run' ? 5 : Math.max(1, tier.weeks[0] - 1);
      weeks = weeks.map((w) => Math.max(floor, Math.ceil(w * m.weeks_multiplier)));
      if (tier.id === 'run') warnings.push('rush_on_run_capped');
    }
    if (weeks[1] < weeks[0]) weeks[1] = weeks[0];
  }

  // 10. Care.
  let plan = catalog.care_plans.find((x) => x.id === sel.care_plan) || null;
  if (sel.care_plan != null && !plan) warnings.push('unknown_care_plan:' + sel.care_plan);
  if (sel.care_via === 'stepper' || !plan) {
    const r = carePlanForUpdates(sel.updates_per_month ?? 0, catalog);
    plan = r.plan;
    warnings.push(...r.warnings);
  }
  if (plan.min_tier && tier && tierRank(catalog, plan.min_tier) > tier.rank) warnings.push('care_plan_below_tier');
  const care = {
    id: plan.id, label: plan.label, updates_per_month: plan.updates_per_month,
    response_label: plan.response ? plan.response.label : null,
    includes: (plan.includes || []).slice(), min_tier: plan.min_tier || null, billing,
  };
  let monthly = null;
  let annualTotal = null;
  if (priced && tier && hasRange(plan.monthly)) {
    const months = (catalog.billing && catalog.billing.annual_months_billed) || 12;
    const m = [plan.monthly.low_cents, plan.monthly.high_cents];
    if (billing === 'annual') {
      monthly = m.map((c) => Math.round((c * months) / 12 / 2500) * 2500);
      annualTotal = m.map((c) => c * months);
    } else {
      monthly = m;
    }
    if (plan.id !== 'none') lines.push({ kind: 'care', id: plan.id, label: plan.label, cents: monthly.slice() });
  } else if (plan.id !== 'none' && tier) {
    lines.push({ kind: 'care', id: plan.id, label: plan.label, cents: null });
  }

  // 11. Separate lines (Founder fitness), never inside the build total.
  const separate = addons.map((id) => addById.get(id)).filter((a) => a.billing === 'separate').map((a) => {
    const ap = priced && tier && hasRange(a.price);
    const qty = fitSessions;
    return {
      id: a.id, label: a.short || a.name, unit: a.unit || 'flat', qty,
      cents: ap ? (qty ? [a.price.low_cents * qty, a.price.high_cents * qty] : [a.price.low_cents, a.price.high_cents]) : null,
    };
  });

  // 12. Deposit.
  let deposit = null;
  if (priced && tier && oneTime && catalog.deposit) {
    const d = catalog.deposit;
    if (d.mode === 'fixed' && Number.isInteger(d.amount_cents)) deposit = Math.min(d.amount_cents, oneTime[0]);
    else if (d.mode === 'percent_of_low' && typeof d.percent === 'number') deposit = Math.min(Math.round(d.percent * oneTime[0]), oneTime[0]);
  }

  // 13. Meter, always computed.
  let meter = 0;
  if (tier) {
    const [a, b] = METER_BANDS[tier.id];
    meter = a + p * (b - a);
    for (const id of addons) meter += addById.get(id).meter_bump || 0;
    meter = Math.min(100, Math.round(meter));
  }

  return {
    catalog_version: catalog.version,
    priced,
    business_type: business,
    style,
    features,
    addons,
    pages,
    tier: tier ? { id: tier.id, label: tier.label, rank: tier.rank, reason } : null,
    position: tier ? p : null,
    meter,
    weeks,
    page_band: { id: band.id, label: band.label },
    care,
    build_window_cents: buildWindow,
    one_time_cents: oneTime,
    monthly_cents: monthly,
    annual_total_cents: annualTotal,
    separate,
    deposit_cents: deposit,
    lines,
    warnings,
  };
}

// Industry and sector are what the visitor sees; each sector maps to one of the business_types
// profiles, which carry presets, wording and the door. Free text covers anything not listed.
const GENERIC_SCENE = { brand: 'Your business', head: 'Built around how you work', cta: 'Get in touch', tiles: ['Services', 'About', 'Contact'] };
export function resolveBusiness(sel, catalog) {
  const profiles = catalog.business_types;
  const pById = (id) => profiles.find((b) => b.id === id);
  const inds = catalog.industries || [];
  const ind = inds.find((i) => i.id === sel.industry) || null;
  const sec = ind ? ind.sectors.find((x) => x.id === sel.sector) || null : null;
  const text = String(sel.biz_text || '').trim().slice(0, 60);
  let profile; let label; let scene;
  if (sec) {
    profile = pById(sec.profile) || profiles[0];
    label = sec.label;
    scene = { ...profile.scene, ...sec.scene };
  } else if (text) {
    profile = pById(sel.business_type) || (ind && pById(ind.sectors[0].profile)) || pById((catalog.business_other || {}).profile) || profiles[0];
    label = text;
    scene = { ...profile.scene, ...GENERIC_SCENE, brand: 'Your ' + text.toLowerCase().split(/\s+/).slice(0, 2).join(' ') };
  } else if (ind) {
    profile = pById(ind.sectors[0].profile) || profiles[0];
    label = ind.label;
    scene = { ...profile.scene, ...ind.sectors[0].scene };
  } else if (inds.length) {
    profile = pById(sel.business_type) || pById((catalog.business_other || {}).profile) || profiles[0];
    label = 'Your business';
    scene = { ...profile.scene, ...GENERIC_SCENE };
  } else {
    profile = pById(sel.business_type) || profiles[0];
    label = profile.label;
    scene = profile.scene;
  }
  return {
    industry: ind ? ind.id : null, industry_label: ind ? ind.label : (text ? 'Something else' : null),
    sector: sec ? sec.id : null, text: sec ? '' : text,
    profile: profile.id, door: profile.door, label, noun: sec ? sec.noun || label.toLowerCase() : text ? text : ind ? ind.sectors[0].noun || ind.label.toLowerCase() : 'a business', plan_label: inds.length ? 'Built for: ' + label : profile.plan_label, scene,
  };
}

function walk(node, fn, path) {
  if (Array.isArray(node)) { node.forEach((v, i) => walk(v, fn, path + '[' + i + ']')); return; }
  if (node && typeof node === 'object') {
    for (const k of Object.keys(node)) { fn(k, node[k], path + '.' + k); walk(node[k], fn, path + '.' + k); }
  }
}

export function validateCatalog(c, projects) {
  const errors = [];
  const req = ['version', 'show_prices', 'currency', 'business_types', 'features', 'styles', 'addons',
    'page_bands', 'tiers', 'care_plans', 'billing', 'deposit', 'rules'];
  for (const k of req) if (!(k in c)) errors.push('missing:' + k);
  if (errors.length) return { ok: false, errors };
  if (!/^\d{4}-\d{2}-\d{2}\.\d+$/.test(c.version)) errors.push('bad_version');
  if (typeof c.show_prices !== 'boolean') errors.push('bad_show_prices');

  walk(c, (k, v, path) => {
    if (FORBIDDEN_KEYS.includes(k.toLowerCase())) errors.push('forbidden_key:' + path);
    if (v && typeof v === 'object' && !Array.isArray(v) && 'low_cents' in v && 'high_cents' in v && v.low_cents > v.high_cents) {
      errors.push('range_low_above_high:' + path);
    }
  }, '$');

  for (const coll of ['business_types', 'features', 'styles', 'addons', 'page_bands', 'tiers', 'care_plans']) {
    const seen = new Set();
    for (const item of c[coll]) {
      if (!ID_RE.test(item.id || '')) errors.push('bad_id:' + coll + ':' + item.id);
      if (seen.has(item.id)) errors.push('duplicate_id:' + coll + ':' + item.id);
      seen.add(item.id);
    }
  }
  const fIds = new Set(c.features.map((f) => f.id));
  const bIds = new Set(c.business_types.map((b) => b.id));
  const projIds = projects ? new Set(projects.projects.map((p) => p.id)) : null;

  for (const b of c.business_types) {
    if (!['build', 'dental'].includes(b.door)) errors.push('bad_door:' + b.id);
    for (const tab of Object.keys(b.preset || {})) {
      if (!TIER_IDS.includes(tab)) errors.push('bad_preset_tab:' + b.id + ':' + tab);
      for (const id of b.preset[tab]) if (!fIds.has(id)) errors.push('preset_unknown_feature:' + b.id + ':' + id);
    }
  }
  if (c.industries) {
    const seenI = new Set(); const seenS = new Set();
    for (const ind of c.industries) {
      if (!ID_RE.test(ind.id || '') || seenI.has(ind.id)) errors.push('bad_industry:' + ind.id);
      seenI.add(ind.id);
      if (!ind.label || ind.label.length > 40) errors.push('bad_industry_label:' + ind.id);
      if (!Array.isArray(ind.sectors) || !ind.sectors.length) errors.push('industry_no_sectors:' + ind.id);
      for (const sec of ind.sectors || []) {
        if (!ID_RE.test(sec.id || '') || seenS.has(sec.id)) errors.push('bad_sector:' + ind.id + ':' + sec.id);
        seenS.add(sec.id);
        if (!bIds.has(sec.profile)) errors.push('sector_unknown_profile:' + sec.id);
        if (!sec.label || sec.label.length > 40) errors.push('bad_sector_label:' + sec.id);
        if (sec.noun && sec.noun.length > 40) errors.push('sector_noun_long:' + sec.id);
        const sc = sec.scene || {};
        if (sc.tiles && (!Array.isArray(sc.tiles) || sc.tiles.length !== 3)) errors.push('sector_tiles:' + sec.id);
        for (const k of ['brand', 'head', 'cta']) if (sc[k] && sc[k].length > 40) errors.push('sector_' + k + '_long:' + sec.id);
      }
    }
  }
  for (const f of c.features) {
    if (![1, 2, 3].includes(f.weight)) errors.push('bad_weight:' + f.id);
    if (!f.name || f.name.length > 40) errors.push('bad_name:' + f.id);
    if (!f.desc || f.desc.length > 120) errors.push('bad_desc:' + f.id);
    for (const k of Object.keys(f.wording || {})) {
      if (!bIds.has(k)) errors.push('wording_unknown_business:' + f.id + ':' + k);
      if (f.wording[k].length > 100) errors.push('wording_too_long:' + f.id + ':' + k);
    }
    for (const id of f.requires || []) if (!fIds.has(id)) errors.push('requires_unknown:' + f.id + ':' + id);
    if (projIds && f.proof && !projIds.has(f.proof)) errors.push('proof_unknown_project:' + f.id + ':' + f.proof);
  }
  for (const a of c.addons) {
    if (!['one_time', 'separate', 'modifier'].includes(a.billing)) errors.push('bad_billing:' + a.id);
  }

  if (c.tiers.length !== 3) errors.push('tiers_not_three');
  c.tiers.forEach((t, i) => {
    if (t.id !== TIER_IDS[i] || t.rank !== i + 1) errors.push('tier_order:' + t.id);
    if (!Array.isArray(t.weeks) || t.weeks.length !== 2 || t.weeks[0] > t.weeks[1]) errors.push('tier_weeks:' + t.id);
    if (!Array.isArray(t.load) || t.load.length !== 2 || t.load[0] >= t.load[1]) errors.push('tier_load:' + t.id);
  });

  const bands = c.page_bands;
  if (!bands.length || bands[0].min !== 1) errors.push('bands_must_start_at_1');
  for (let i = 1; i < bands.length; i++) {
    if (bands[i - 1].max === null || bands[i].min !== bands[i - 1].max + 1) errors.push('band_gap:' + bands[i].id);
  }
  if (bands.length && bands[bands.length - 1].max !== null) errors.push('last_band_must_be_open');
  for (const b of bands) {
    if (b.tier_floor && !TIER_IDS.includes(b.tier_floor)) errors.push('bad_tier_floor:' + b.id);
    for (const id of (b.requires || []).concat(b.adds || [])) if (!fIds.has(id)) errors.push('band_unknown_feature:' + b.id + ':' + id);
  }

  if (!c.care_plans.some((p) => p.id === 'none')) errors.push('care_needs_none');
  for (const p of c.care_plans) {
    if (!['none', 'keep', 'tend', 'run'].includes(p.id)) errors.push('bad_care_id:' + p.id);
    if (p.min_tier && !TIER_IDS.includes(p.min_tier)) errors.push('bad_min_tier:' + p.id);
  }
  const m = c.billing.annual_months_billed;
  if (!Number.isInteger(m) || m < 9 || m > 12) errors.push('bad_annual_months');
  return { ok: errors.length === 0, errors };
}
