// The hero sentence: "I run [a gym] and I want [customers who book and pay online]."
// A fill-in-the-blank form (LukeW's "Mad Libs" pattern) replaces the row of pills. Each blank
// opens a small panel: illustrated industry tiles and kinds, or the three plans.
import { $, $$, esc, reduced } from './util.js';
import { icon } from './icons.js';
import { resolveBusiness } from './engine.js';
import { track } from './track.js';

export function mountMadlib(store) {
  const { catalog, actions } = store;
  const inds = catalog.industries || [];
  if (!$('#madlib') || !inds.length) return;
  const wants = catalog.plan_wants || {};
  const slotBiz = $('#slot-biz'); const slotPlan = $('#slot-plan');
  const popBiz = $('#pop-biz'); const popPlan = $('#pop-plan');
  let viewInd = null; let openPop = null; let opener = null;

  const tiles = $('#ml-tiles');
  tiles.innerHTML = inds.map((i) => '<button type="button" class="ml-tile" data-ind="' + i.id + '" aria-pressed="false"><span class="gic">' + icon(i.id) + '</span><span>' + esc(i.label) + '</span></button>').join('') +
    '<button type="button" class="ml-tile ghost" data-ind="other" aria-pressed="false"><span class="gic">' + icon('other') + '</span><span>Something else</span></button>';
  const kinds = $('#ml-kinds');
  function renderKinds(id, current) {
    viewInd = id;
    const ind = inds.find((i) => i.id === id);
    $$('.ml-tile', tiles).forEach((b) => b.setAttribute('aria-pressed', b.dataset.ind === id));
    kinds.innerHTML = ind ? '<p class="ml-k">' + esc(ind.label) + ': which one?</p><ul>' + ind.sectors.map((x) => '<li><button type="button" data-sec="' + x.id + '" aria-pressed="' + (x.id === current) + '">' + esc(x.label) + '</button></li>').join('') + '</ul>' : '<p class="ml-k">Type it below. I\'ll plan from your words.</p>';
  }
  $('#ml-plans').innerHTML = catalog.tiers.map((t) => '<button type="button" class="ml-plan" data-t="' + t.id + '"><span class="gic">' + icon('plan_' + t.id) + '</span><span><b>' + esc(wants[t.id] || t.label) + '</b><small>' + esc(t.label) + '. ' + esc(t.for) + '</small></span></button>').join('');

  // Goals sit under the three plans: same picker, but each loads a feature set, and its line is
  // written for the kind of business picked.
  const goals = catalog.plan_goals || [];
  const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
  const goalOf = (sel) => goals.find((g) => sameSet(g.features, sel.features || []));
  if (goals.length) {
    $('#ml-plans').insertAdjacentHTML('beforeend', '<p class="ml-k ml-goal-k">Or start from a goal</p>' +
      goals.map((g) => '<button type="button" class="ml-plan ml-goal" data-g="' + g.id + '" aria-pressed="false"><span class="gic">' + icon(g.icon) + '</span><span><b>' + esc(g.want) + '</b><small data-gl="' + g.id + '"></small></span></button>').join(''));
  }

  function open(pop, btn) {
    if (openPop === pop) { close(); return; }
    close(true);
    openPop = pop; opener = btn;
    pop.hidden = false; btn.setAttribute('aria-expanded', 'true');
    track('picker_open', { detail: pop === popBiz ? 'business' : 'plan' });
    pop.style.setProperty('--x', Math.max(0, btn.offsetLeft - 8) + 'px');
    if (pop === popBiz) { const r = resolveBusiness(store.get().sel, catalog); renderKinds(r.industry || 'other', r.sector); }
    requestAnimationFrame(() => { pop.classList.add('on'); const f = pop.querySelector('[aria-pressed="true"], button'); if (f) f.focus({ preventScroll: true }); reveal(pop); });
  }
  // A panel that opens below the fold is a panel nobody sees. Scroll just enough to show all of
  // it under the sticky bar; if it is taller than the screen, line its top up under the bar.
  function reveal(pop) {
    const bar = (($('#top-bar') || {}).offsetHeight || 72) + (($('#subnav') || {}).offsetHeight || 0);
    const r = pop.getBoundingClientRect();
    const room = innerHeight - bar - 16;
    let dy = 0;
    if (r.height > room || r.top < bar + 8) dy = r.top - bar - 12;
    else if (r.bottom > innerHeight - 16) dy = r.bottom - innerHeight + 16;
    if (Math.abs(dy) > 2) scrollBy({ top: dy, behavior: reduced() ? 'auto' : 'smooth' });
  }
  function close(silent) {
    if (!openPop) return;
    openPop.classList.remove('on'); openPop.hidden = true;
    opener.setAttribute('aria-expanded', 'false');
    if (!silent) opener.focus({ preventScroll: true });
    openPop = null;
  }
  slotBiz.addEventListener('click', () => open(popBiz, slotBiz));
  slotPlan.addEventListener('click', () => open(popPlan, slotPlan));
  document.addEventListener('click', (e) => { if (openPop && !e.target.closest('.ml-pop') && !e.target.closest('.slot')) close(true); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && openPop) close(); });

  tiles.addEventListener('click', (e) => {
    const b = e.target.closest('.ml-tile');
    if (!b) return;
    if (b.dataset.ind === 'other') { renderKinds('other'); $('#ml-own-q').focus(); return; }
    actions.setIndustry(b.dataset.ind);
    renderKinds(b.dataset.ind, store.get().sel.sector);
  });
  kinds.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sec]');
    if (!b) return;
    actions.setSector(viewInd, b.dataset.sec);
    close();
  });
  $('#ml-own').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = $('#ml-own-q');
    if (!q.value.trim()) return;
    actions.setBizText(q.value); q.value = ''; close();
  });
  $('#ml-plans').addEventListener('click', (e) => {
    const b = e.target.closest('.ml-plan');
    if (!b) return;
    if (b.dataset.g) { actions.setGoal(b.dataset.g); close(); return; }
    actions.setTab(b.dataset.t);
    const care = { launch: 'keep', grow: 'tend', run: 'run' }[b.dataset.t];
    if (care) actions.setCarePlan(care);
    close();
  });

  let lastInd = null; let lastTier = null;
  const bump = (el) => { if (reduced()) return; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); };
  store.subscribe(({ sel, quote: q }) => {
    const r = resolveBusiness(sel, catalog);
    const ind = r.industry || 'other';
    $('#slot-biz-t').textContent = r.noun;
    if (ind !== lastInd) { $('#slot-biz-ic').innerHTML = icon(ind); if (lastInd) bump(slotBiz); lastInd = ind; }
    const tier = (q.tier && q.tier.id) || sel.package_tab || 'grow';
    const goal = goalOf(sel);
    const key = goal ? 'goal_' + goal.id : tier;
    $('#slot-plan-t').textContent = goal ? goal.want : wants[tier] || tier;
    if (key !== lastTier) { $('#slot-plan-ic').innerHTML = icon(goal ? goal.icon : 'plan_' + tier); if (lastTier) bump(slotPlan); lastTier = key; }
    $$('.ml-plan', popPlan).forEach((b) => b.setAttribute('aria-pressed', goal ? b.dataset.g === goal.id : b.dataset.t === tier));
    goals.forEach((g) => { const el = popPlan.querySelector('[data-gl="' + g.id + '"]'); if (el) el.textContent = (g.by_industry && g.by_industry[r.industry]) || (g.line && g.line[sel.business_type]) || ''; });
  });
}
