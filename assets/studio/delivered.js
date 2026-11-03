// Delivered project tickets, rendered from projects.json (Ross 3.6, Mary B.6.5).
import { $, $$, esc } from './util.js';
import { icon } from './icons.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
export function prettyDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return MONTHS[m - 1] + ' ' + d + ', ' + y;
}

// Each delivered project is a build ticket, like a parlay slip: every feature is a leg, every leg
// carries the plan level it belongs to (Basic, Premium, Partner), and the highest leg sets the
// ticket's tier. "Start from this build" loads the matching catalog features into the visitor's
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
    filt.innerHTML = [['all', 'All builds'], ['launch', tierLabel('launch')], ['grow', tierLabel('grow')], ['run', tierLabel('run')]]
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
      return '<li class="lg lv-' + lv.id + (j > 4 ? ' more' : '') + '" style="--j:' + j + '"><span class="lg-lv" title="' + esc(tierLabel(lv.id)) + '-level feature">' + lv.short + '</span>' +
        '<span class="lg-b"><b>' + esc(f.name) + '</b><em>' + esc(f.what) + '</em><small>' + esc(f.shipped) + '</small></span>' +
        '<span class="lg-hit">' + icon('check') + 'HIT</span></li>';
    }).join('');
    const logo = p.logo ? '<img class="mono logo" src="' + esc(p.logo) + '" alt="' + esc(p.name) + ' logo" width="48" height="48" loading="lazy" decoding="async">' : '<span class="mono" style="background:' + esc(p.color) + '">' + esc(p.mono) + '</span>';
    const host = p.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    return '<article class="bt bt-' + tier.id + '" id="p-' + p.id + '" data-tier="' + tier.id + '" aria-labelledby="pt-' + p.id + '">' +
      '<header class="bt-head"><span class="bt-no num">BUILD TICKET #' + String(i + 1).padStart(2, '0') + '</span><span class="bt-stamp">' + icon('stamp') + (p.kind === 'concept' ? 'CONCEPT' : 'SHIPPED · LIVE') + '</span></header>' +
      '<div class="bt-who">' + logo + '<div><h3 id="pt-' + p.id + '">' + esc(p.name) + '</h3><a class="bt-url" href="' + esc(p.url) + '" target="_blank" rel="noopener">' + esc(host) + '</a></div>' +
      '<span class="bt-tier"><small>Build tier</small><b>' + esc(tierLabel(tier.id)) + '</b></span></div>' +
      '<p class="bt-job"><b>The job.</b> ' + esc(p.job || p.sub) + '</p>' +
      '<div class="bt-stats">' + stats + '</div>' +
      '<div class="bt-legs-h"><span>' + n + ' legs · ' + n + ' hit</span><span class="bt-mix">' + byLv.map((c, k) => c ? '<i class="lv-' + LEVEL[k + 1].id + '">' + c + ' ' + esc(tierLabel(LEVEL[k + 1].id)) + '</i>' : '').join('') + '</span></div>' +
      '<ol class="bt-legs">' + legs + '</ol>' +
      (n > 5 ? '<button type="button" class="bt-more" aria-expanded="false">Show all ' + n + ' legs</button>' : '') +
      '<div class="bt-tear" aria-hidden="true"></div>' +
      '<footer class="bt-foot"><div class="bt-pay"><small>Payout</small><b>' + esc(tierLabel(tier.id)) + ' build, all ' + n + ' features live</b><span>' + esc(p.verified.how) + ', ' + prettyDate(p.verified.on) + '</span></div>' +
      '<div class="bt-cta"><button type="button" class="btn btn-lime bt-start" data-p="' + p.id + '">Start a build like ' + esc(p.name) + '</button><a class="tlink" href="' + esc(p.url) + '" target="_blank" rel="noopener">See it live</a></div></footer>' +
      '</article>';
  }).join('');

  wall.addEventListener('click', (e) => {
    const more = e.target.closest('.bt-more');
    if (more) {
      const c = more.closest('.bt');
      const o = c.classList.toggle('open');
      more.setAttribute('aria-expanded', o);
      more.textContent = o ? 'Show fewer legs' : 'Show all ' + $$('.lg', c).length + ' legs';
      return;
    }
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
