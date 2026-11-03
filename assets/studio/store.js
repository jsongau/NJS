// One state object, one set(), subscribers re-render (Ross 3.2). No framework.
// The selection is mirrored into the URL hash and a per-viewer localStorage draft.
import { quote, carePlanForUpdates, bandIndexForPages, resolveBusiness } from './engine.js';

const DRAFT_KEY = 'njs-studio-draft-v1';
const HASH_KEYS = { i: 'industry', sc: 'sector', bt: 'biz_text', b: 'business_type', t: 'package_tab', f: 'features', p: 'pages', s: 'style', a: 'addons', c: 'care_plan', u: 'updates_per_month', bl: 'billing', fs: 'fit_sessions' };
const LISTS = new Set(['features', 'addons']);
const NUMS = new Set(['pages', 'updates_per_month', 'fit_sessions']);

export function encodeSelection(sel) {
  const parts = [];
  for (const [k, key] of Object.entries(HASH_KEYS)) {
    const v = sel[key];
    if (v == null || (Array.isArray(v) && !v.length)) continue;
    parts.push(k + '=' + encodeURIComponent(Array.isArray(v) ? v.join(',') : String(v)));
  }
  return parts.join('&');
}

export function decodeSelection(str) {
  const out = {};
  for (const part of String(str || '').replace(/^#/, '').split('&')) {
    const [k, raw] = part.split('=');
    const key = HASH_KEYS[k];
    if (!key || raw == null) continue;
    const v = decodeURIComponent(raw);
    out[key] = LISTS.has(key) ? v.split(',').filter(Boolean) : NUMS.has(key) ? Number(v) : v;
  }
  return out;
}

function safeGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (_) { /* private mode */ } }
function safeDel(k) { try { localStorage.removeItem(k); } catch (_) { /* private mode */ } }

export function createStore(catalog, projects, opts = {}) {
  const defaults = Object.freeze({
    industry: catalog.industries ? catalog.industries[0].id : null,
    sector: catalog.industries ? catalog.industries[0].sectors[0].id : null, biz_text: '',
    business_type: catalog.industries ? catalog.industries[0].sectors[0].profile : catalog.business_types[0].id, package_tab: null, features: [], pages: 5,
    style: catalog.styles[0].id, addons: [], care_plan: 'none', care_via: 'card', updates_per_month: 0,
    billing: 'monthly', fit_sessions: 0,
  });
  const valid = (s) => {
    const r = resolveBusiness(s, catalog);
    s = { ...s, industry: r.industry, sector: r.sector, biz_text: r.text, business_type: r.profile };
    const q = quote(s, catalog);
    return { ...s, features: q.features, addons: q.addons, business_type: q.business_type, pages: q.pages };
  };

  let restored = false;
  let initial = { ...defaults };
  if (opts.persist !== false && typeof location !== 'undefined') {
    const fromHash = decodeSelection(location.hash);
    if (Object.keys(fromHash).length) { initial = { ...initial, ...fromHash }; restored = true; }
    else {
      const raw = safeGet(DRAFT_KEY);
      if (raw) { try { initial = { ...initial, ...JSON.parse(raw) }; restored = true; } catch (_) { /* bad draft */ } }
    }
  }
  let sel = valid(initial);
  let q = quote(sel, catalog);
  let undoSnap = null;
  let touched = new Set(restored ? Object.keys(initial) : []);
  const subs = new Set();
  let queued = false;
  let pendingMeta = {};
  let prevQuote = q;

  const raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (fn) => fn();
  function flush() {
    queued = false;
    const meta = pendingMeta; pendingMeta = {};
    const before = prevQuote; prevQuote = q;
    for (const fn of subs) fn({ sel, quote: q, prev: before, meta, touched });
  }
  function persist() {
    if (opts.persist === false || typeof location === 'undefined') return;
    safeSet(DRAFT_KEY, JSON.stringify(sel));
    try { history.replaceState(null, '', '#' + encodeSelection(sel)); } catch (_) { /* file:// in some browsers */ }
  }
  function set(patch, meta = {}) {
    sel = valid({ ...sel, ...patch });
    q = quote(sel, catalog);
    Object.keys(patch).forEach((k) => touched.add(k));
    pendingMeta = { ...pendingMeta, ...meta };
    persist();
    if (!queued) { queued = true; raf(flush); }
    return q;
  }

  const actions = {
    setBusiness(id) { set({ business_type: id }, { event: 'business_type_set' }); },
    setIndustry(id) {
      if (id === 'other') { set({ industry: null, sector: null }, { event: 'industry_set', id }); return; }
      const ind = catalog.industries.find((i) => i.id === id);
      if (!ind) return;
      const keep = sel.industry === id && sel.sector;
      set({ industry: id, sector: keep ? sel.sector : ind.sectors[0].id, biz_text: '' }, { event: 'industry_set', id });
    },
    setSector(industryId, sectorId) { set({ industry: industryId, sector: sectorId, biz_text: '' }, { event: 'sector_set', id: sectorId }); },
    setBizText(text) {
      const t = String(text || '').trim().slice(0, 60);
      if (!t) return;
      set({ sector: null, biz_text: t }, { event: 'biz_text_set' });
    },
    setTab(id) {
      const biz = catalog.business_types.find((b) => b.id === sel.business_type);
      const preset = (biz.preset && biz.preset[id]) || [];
      undoSnap = { ...sel };
      const pages = { launch: 5, grow: 12, run: 25 }[id] || sel.pages;
      set({ package_tab: id, features: preset.slice(), pages }, { event: 'package_tab_set', undoable: true, tab: id });
    },
    undo() { if (!undoSnap) return; const s = undoSnap; undoSnap = null; set(s, { event: 'undo' }); },
    toggleFeature(id) {
      const has = sel.features.includes(id);
      set({ features: has ? sel.features.filter((x) => x !== id) : sel.features.concat(id) }, { event: has ? 'feature_removed' : 'feature_added', id });
    },
    removeFeature(id) { set({ features: sel.features.filter((x) => x !== id) }, { event: 'feature_removed', id }); },
    setPages(n) {
      const bands = catalog.page_bands;
      const band = bands[bandIndexForPages(n, catalog)];
      const add = (band.adds || []).filter((id) => !sel.features.includes(id));
      set({ pages: n, features: add.length ? sel.features.concat(add) : sel.features }, { event: 'pages_set', autoAdded: add });
    },
    setStyle(id) { set({ style: id }, { event: 'style_set' }); },
    toggleAddon(id) {
      const has = sel.addons.includes(id);
      const patch = { addons: has ? sel.addons.filter((x) => x !== id) : sel.addons.concat(id) };
      if (id === 'fit' && !has && !sel.fit_sessions) patch.fit_sessions = 1;
      set(patch, { event: has ? 'addon_removed' : 'addon_added', id });
    },
    setFitSessions(n) { set({ fit_sessions: Math.max(0, Math.min(10, n)) }, { event: 'fit_sessions_set' }); },
    setCarePlan(id) {
      const plan = catalog.care_plans.find((p) => p.id === id);
      set({ care_plan: id, care_via: 'card', updates_per_month: plan.updates_per_month }, { event: 'care_plan_set', via: 'card' });
    },
    setUpdates(n) {
      const r = carePlanForUpdates(n, catalog);
      set({ updates_per_month: r.value, care_plan: r.plan.id, care_via: 'stepper' }, { event: 'care_plan_set', via: 'stepper' });
    },
    setBilling(b) { set({ billing: b === 'annual' ? 'annual' : 'monthly' }, { event: 'billing_toggled' }); },
    reset() { undoSnap = null; touched = new Set(); safeDel(DRAFT_KEY); set({ ...defaults }, { event: 'reset' }); touched = new Set(); },
  };

  return {
    catalog, projects, actions, restored,
    get: () => ({ sel, quote: q, touched }),
    set,
    subscribe(fn) { subs.add(fn); fn({ sel, quote: q, prev: q, meta: { init: true }, touched }); return () => subs.delete(fn); },
    canUndo: () => !!undoSnap,
  };
}
