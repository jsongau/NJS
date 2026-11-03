// Delivered project case files, rendered from projects.json (Ross 3.6, Mary B.6.5).
import { $, $$, esc } from './util.js';
import { icon } from './icons.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
export function prettyDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return MONTHS[m - 1] + ' ' + d + ', ' + y;
}

// Each delivered project is a case file: every feature is a deliverable, every deliverable
// carries the plan level it belongs to (Basic, Premium, Partner), and the highest one sets the
// project's package. "Start from this build" loads the matching catalog features into the visitor's
// plan, so a finished project becomes a starting point for theirs.
const LEVEL = { 1: { id: 'launch', short: 'B', name: 'Basic' }, 2: { id: 'grow', short: 'P', name: 'Premium' }, 3: { id: 'run', short: 'PT', name: 'Partner' } };

export function ticketTier(p) {
  const top = Math.max(1, ...p.features.map((f) => f.level || 1));
  return LEVEL[top];
}

export function mountDelivered(store) {
  const wall = $('#wall');
  if (!wall) return;
  const list = store.projects.projects;
  const tierLabel = (id) => { const t = (store.catalog.tiers || []).find((x) => x.id === id); return t ? t.label : id; };

  const filt = $('#wall-filter');
  if (filt) {
    const counts = { all: list.length };
    list.forEach((p) => { const t = ticketTier(p).id; counts[t] = (counts[t] || 0) + 1; });
    filt.innerHTML = [['all', 'All work'], ['launch', tierLabel('launch')], ['grow', tierLabel('grow')], ['run', tierLabel('run')]]
      .map(([id, label], i) => '<button type="button" role="tab" aria-selected="' + (i === 0) + '" data-f="' + id + '">' + esc(label) + '<span class="num">' + (counts[id] || 0) + '</span></button>').join('');
    filt.addEventListener('click', (e) => {
      const b = e.target.closest('[data-f]');
      if (!b) return;
      $$('[data-f]', filt).forEach((x) => x.setAttribute('aria-selected', x === b));
      $$('.bt', wall).forEach((t) => { t.hidden = b.dataset.f !== 'all' && t.dataset.tier !== b.dataset.f; });
      paint();
    });
  }

  wall.innerHTML = list.map((p, i) => {
    const n = p.features.length;
    const tier = ticketTier(p);
    const byLv = [1, 2, 3].map((lv) => p.features.filter((f) => (f.level || 1) === lv).length);
    const stats = p.stats.map((s) => '<div><i>' + esc(s.label) + '</i><b>' + esc(s.value) + '</b><span>' + esc(s.note) + '</span></div>').join('');
    const legs = p.features.map((f, j) => {
      const lv = LEVEL[f.level || 1];
      return '<li class="lg lv-' + lv.id + (j > 2 ? ' more' : '') + '" style="--j:' + j + '"><span class="lg-lv" title="' + esc(tierLabel(lv.id)) + '-level deliverable">' + lv.short + '</span>' +
        '<span class="lg-b"><b>' + esc(f.name) + '</b><em>' + esc(f.what) + '</em><small>' + esc(f.shipped) + '</small></span>' +
        '<span class="lg-hit">' + icon('check') + 'Shipped</span></li>';
    }).join('');
    // A one-line strip: one block per deliverable, coloured by level. Readable at a glance, even compact.
    const strip = '<div class="bt-strip" aria-hidden="true">' + p.features.map((f, j) => '<i class="lv-' + LEVEL[f.level || 1].id + '" style="--j:' + j + '" title="' + esc(f.name) + '"></i>').join('') + '</div>';
    const logo = p.logo ? '<img class="mono logo" src="' + esc(p.logo) + '" alt="' + esc(p.name) + ' logo" width="48" height="48" loading="lazy" decoding="async">' : '<span class="mono" style="background:' + esc(p.color) + '">' + esc(p.mono) + '</span>';
    const host = p.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    const tid = 'bt-' + p.id;
    const tab = (k, label, on) => '<button type="button" role="tab" id="' + tid + '-t-' + k + '" aria-controls="' + tid + '-p-' + k + '" aria-selected="' + on + '" tabindex="' + (on ? 0 : -1) + '" data-tab="' + k + '">' + label + '</button>';
    return '<article class="bt bt-' + tier.id + '" id="p-' + p.id + '" data-tier="' + tier.id + '" aria-labelledby="pt-' + p.id + '">' +
      '<header class="bt-head"><span class="bt-no num"><b>Case ' + String(i + 1).padStart(2, '0') + '</b><span>/ ' + String(list.length).padStart(2, '0') + '</span></span><span class="bt-stamp">' + icon('stamp') + (p.kind === 'concept' ? 'Concept' : '<i class="bt-live"></i>Live in production') + '</span></header>' +
      '<div class="bt-who">' + logo + '<div><h3 id="pt-' + p.id + '">' + esc(p.name) + '</h3><a class="bt-url" href="' + esc(p.url) + '" target="_blank" rel="noopener">' + esc(host) + '</a></div>' +
      '<span class="bt-tier"><small>Package</small><b>' + esc(tierLabel(tier.id)) + '</b></span></div>' +
      '<div class="bt-sum"><span class="bt-sum-k">' + n + ' deliverables · all shipped</span>' + strip + '<span class="bt-mix">' + byLv.map((c, k) => c ? '<i class="lv-' + LEVEL[k + 1].id + '">' + c + ' ' + esc(tierLabel(LEVEL[k + 1].id)) + '</i>' : '').join('') + '</span></div>' +
      '<div class="bt-tabs" role="tablist" aria-label="' + esc(p.name) + ' case">' + tab('legs', 'Deliverables', true) + tab('proof', 'Results', false) + tab('job', 'Brief', false) + '</div>' +
      '<div class="bt-panel" role="tabpanel" id="' + tid + '-p-legs" aria-labelledby="' + tid + '-t-legs"><ol class="bt-legs">' + legs + '</ol></div>' +
      '<div class="bt-panel" role="tabpanel" id="' + tid + '-p-proof" aria-labelledby="' + tid + '-t-proof" hidden><div class="bt-stats">' + stats + '</div><p class="bt-ver">' + icon('stamp') + 'All ' + n + ' features ' + esc(p.verified.how) + ', ' + prettyDate(p.verified.on) + '.</p></div>' +
      '<div class="bt-panel" role="tabpanel" id="' + tid + '-p-job" aria-labelledby="' + tid + '-t-job" hidden><p class="bt-job">' + esc(p.job || p.sub) + '</p><p class="bt-job-sub">' + esc(p.sub) + ' · ' + esc(p.meta) + '</p></div>' +
      '<button type="button" class="bt-exp" aria-expanded="false" aria-controls="' + tid + '-p-legs"><span>View full case</span><i aria-hidden="true"></i></button>' +
      '<div class="bt-tear" aria-hidden="true"></div>' +
      '<footer class="bt-foot"><div class="bt-pay"><small>Scope delivered</small><b>' + esc(tierLabel(tier.id)) + ' package, ' + n + ' of ' + n + ' shipped</b></div>' +
      '<div class="bt-cta"><button type="button" class="btn btn-lime bt-start" data-p="' + p.id + '">Start a project like this</button><a class="tlink" href="' + esc(p.url) + '" target="_blank" rel="noopener">See it live</a></div></footer>' +
      '</article>';
  }).join('');

  const setOpen = (c, o) => {
    c.classList.toggle('open', o);
    const b = $('.bt-exp', c);
    b.setAttribute('aria-expanded', o);
    $('span', b).textContent = o ? 'Collapse case' : 'View full case';
  };
  const showTab = (c, k) => {
    $$('[role="tab"]', c).forEach((t) => { const on = t.dataset.tab === k; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    $$('[role="tabpanel"]', c).forEach((pn) => { pn.hidden = !pn.id.endsWith('-p-' + k); });
  };
  wall.addEventListener('keydown', (e) => {
    const t = e.target.closest('[role="tab"]');
    if (!t || !['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
    const tabs = $$('[role="tab"]', t.parentNode); const i = tabs.indexOf(t);
    const nx = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    nx.focus(); showTab(t.closest('.bt'), nx.dataset.tab);
  });
  const view = $('#wall-view');
  if (view) view.addEventListener('click', (e) => {
    const b = e.target.closest('[data-v]');
    if (!b) return;
    $$('[data-v]', view).forEach((x) => x.setAttribute('aria-pressed', x === b));
    const full = b.dataset.v === 'full';
    wall.classList.toggle('full', full);
    $$('.bt', wall).forEach((c) => setOpen(c, full));
  });

  wall.addEventListener('click', (e) => {
    const tb = e.target.closest('[role="tab"]');
    if (tb) { showTab(tb.closest('.bt'), tb.dataset.tab); return; }
    const ex = e.target.closest('.bt-exp');
    if (ex) { const c = ex.closest('.bt'); setOpen(c, !c.classList.contains('open')); return; }
    const start = e.target.closest('.bt-start');
    if (!start) return;
    const p = list.find((x) => x.id === start.dataset.p);
    const want = [...new Set(p.features.map((f) => f.catalog_feature).filter(Boolean))];
    const { actions } = store;
    const tier = ticketTier(p);
    actions.setTab(tier.id);
    want.forEach((f) => { if (!store.get().sel.features.includes(f)) actions.toggleFeature(f); });
    const s = $('#s-features');
    if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else location.href = '/build' + (location.hash || '#s-features');
  });

  // Phone scroller counter ("1 of 4").
  const count = $('#wall-count');
  const paint = () => {
    if (!count) return;
    const cards = $$('.bt', wall).filter((c) => !c.hidden);
    const mid = wall.scrollLeft + wall.clientWidth / 2;
    let i = cards.findIndex((c) => c.offsetLeft + c.offsetWidth > mid);
    if (i < 0) i = cards.length - 1;
    count.textContent = cards.length ? (i + 1) + ' of ' + cards.length + ' · swipe for more' : '';
  };
  wall.addEventListener('scroll', paint, { passive: true });
  paint();
}

export function mountProof(store) {
  $('#proof').innerHTML = (store.projects.proof || []).map((p) => '<div><b>' + esc(p.value) + '</b><span>' + esc(p.label) + '</span><small>' + esc(p.source) + '</small></div>').join('');
}
