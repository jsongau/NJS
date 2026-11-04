// MegaNav 2: each top link keeps working on its own (no JS needed), and a caret opens a panel
// with the deeper pages. Every panel ends on the next step: pick agents, start a plan, send it.
// Desktop opens on hover with a short intent delay; touch and keyboard use the caret button.
// Phones get the same map as an accordion inside the Menu drawer.
import { $, $$, esc, plural, weeksText, reduced } from './util.js';
import { icon } from './icons.js';
import { CLIENT_AGENTS, AGENT_FACES, CREW_ART } from './crewart.js';
import { ticketTier } from './delivered.js';
import { agentPicks } from './picks.js';

const PLAN = {
  launch: { kick: 'A website, hosted', care: 'keep', line: 'Found nearby, takes bookings.' },
  grow: { kick: 'Customers log in and pay', care: 'tend', line: 'Accounts, payments, an AI helper.' },
  run: { kick: 'I work alongside you', care: 'run', line: 'Your dashboard and agents, run monthly.' },
};
const STEPS = [['s-business', 'Your business'], ['s-package', 'Pick a plan'], ['s-features', 'Features and agents'], ['s-size', 'How big'], ['s-style', 'The look'], ['s-extras', 'Extras'], ['s-care', 'Care after launch']];
const STUDIO = [
  ['The studio', [['/care', 'team', 'Care plans', 'Hosting, fixes and updates after launch'], ['/crew', 'bot', 'The crew', 'Who builds it, human and agent'], ['/crew#runs', 'loop', 'How a build runs', 'Audit, plan, build, launch, care'], ['/resume', 'user', 'Résumé', 'Nathan J. Song, the builder']]],
  ['Before you start', [['/plans#faq', 'msg', 'Questions', 'Straight answers on scope and payment'], ['/build?call=1', 'cal', 'Request a call', 'Twenty minutes, no pitch deck'], ['/plans', 'check', "What's included", 'Every plan, side by side']]],
];

const caret = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const arrow = '<svg class="mn-arr" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const link = (href, ic, t, s) => '<li><a class="mn-link" href="' + href + '"><span class="mn-ico gic">' + icon(ic) + '</span><span class="mn-txt"><strong>' + esc(t) + '</strong><small>' + esc(s) + '</small></span></a></li>';

function agentsPanel() {
  const cards = CLIENT_AGENTS.map((a) => '<button type="button" class="mn-ag" data-ag="' + a.id + '" aria-pressed="false">' +
    '<span class="mn-face">' + AGENT_FACES[a.id] + '</span><span class="mn-ag-t"><strong>' + esc(a.name.replace(' agent', '')) + '</strong><small>' + esc(a.short) + '</small></span>' +
    '<span class="mn-add" aria-hidden="true"><i></i></span></button>').join('');
  const yours = '<a class="mn-ag mn-yours" href="/build?call=1" data-carry><span class="mn-face">' + AGENT_FACES.yours + '</span>' +
    '<span class="mn-ag-t"><strong>Your agent here</strong><small>Name the job you repeat every week. I scope an agent for it.</small></span>' + arrow + '</a>';
  return '<div class="mn-in mn-in-agents">' +
    '<div class="mn-main"><p class="mn-hd">Agents I build for your business <span class="mn-new">New</span></p>' +
    '<div class="mn-ags">' + cards + yours + '</div>' +
    '<p class="mn-note">Tap to add one to your plan. Each agent keeps a log and has an off switch.</p></div>' +
    '<aside class="mn-feat mn-feat-dark"><p class="mn-kick">How an agent ships</p>' +
    '<ol class="mn-ship"><li><b>Pick or describe it</b><span>Here, or on a call.</span></li><li><b>I scope it in writing</b><span>What it does, what it never does.</span></li><li><b>Built, watched, fixed</b><span>Checked nightly. Changes wait for your OK.</span></li></ol>' +
    '<p class="mn-count" data-mn="ag-count">No agents picked yet.</p>' +
    '<a class="btn btn-lime mn-go" href="/build" data-mn="ag-go">Build my plan</a>' +
    '<a class="mn-sub" href="/crew#agents">See every agent' + arrow + '</a></aside></div>';
}

function plansPanel(catalog) {
  const dep = catalog.flags && catalog.flags.deposit_enabled;
  const cards = catalog.tiers.map((t) => '<button type="button" class="mn-plan mn-plan-' + t.id + '" data-plan="' + t.id + '">' +
    '<span class="mn-plan-ic gic">' + icon('plan_' + t.id) + '</span><span class="mn-plan-k">' + esc(PLAN[t.id].kick) + '</span>' +
    '<strong>' + esc(t.label) + '</strong><small>' + esc(PLAN[t.id].line) + '</small><span class="mn-plan-go">Start with ' + esc(t.label) + arrow + '</span></button>').join('');
  return '<div class="mn-in mn-in-plans"><div class="mn-main"><p class="mn-hd">Three plans. Start with one, change it any time.</p>' +
    '<div class="mn-plans">' + cards + '</div></div>' +
    '<aside class="mn-feat"><p class="mn-kick">How paying works</p><ol class="mn-pay">' +
    '<li><b>Written plan and quote</b><span>Free. You see the scope before you pay anything.</span></li>' +
    '<li><b>Audit deposit</b><span>' + esc(catalog.deposit.label) + '.' + (dep ? '' : ' <em class="mn-soon">Opens soon</em>') + '</span></li>' +
    '<li><b>Care, month to month</b><span>Cancel any time. The site stays yours.</span></li></ol>' +
    '<a class="mn-sub" href="/care">Compare care plans' + arrow + '</a><a class="mn-sub" href="/plans">See full plans' + arrow + '</a></aside></div>';
}

function buildPanel() {
  return '<div class="mn-in mn-in-build"><div class="mn-main"><p class="mn-hd">Seven steps, about three minutes</p><ol class="mn-steps">' +
    STEPS.map(([id, t], i) => '<li><a href="/build#' + id + '" data-step="' + id + '"><span class="mn-n">' + String(i + 1).padStart(2, '0') + '</span>' + esc(t) + '</a></li>').join('') +
    '</ol></div><aside class="mn-feat"><p class="mn-kick">Your plan so far</p><div class="mn-so" data-mn="so"></div>' +
    '<a class="btn btn-lime mn-go" href="/build" data-carry>Continue my plan</a><a class="mn-sub" href="/build?call=1" data-carry>Rather talk it through?' + arrow + '</a></aside></div>';
}

function workPanel(projects) {
  const rows = projects.projects.map((p) => {
    const t = ticketTier(p);
    const mark = p.logo ? '<img src="' + esc(p.logo) + '" alt="" width="40" height="40" loading="lazy">' : '<b style="background:' + esc(p.color) + '">' + esc(p.mono) + '</b>';
    return '<li><a class="mn-case" href="/work#p-' + p.id + '"><span class="mn-logo">' + mark + '</span><span class="mn-txt"><strong>' + esc(p.name) + ' <span class="mn-tier mn-tier-' + t.id + '">' + esc(t.name) + '</span></strong><small>' + esc(p.job) + '</small></span></a></li>';
  }).join('');
  return '<div class="mn-in mn-in-work"><div class="mn-main"><p class="mn-hd">Live in production</p><ul class="mn-cases">' + rows + '</ul></div>' +
    '<aside class="mn-feat"><p class="mn-kick">Every case shows its scope</p><p class="mn-p">What was delivered, the results, and which plan it maps to. Pick one and start from its scope.</p>' +
    '<a class="btn mn-go" href="/work">See all work</a><a class="mn-sub" href="/build" data-carry>Start a project like these' + arrow + '</a></aside></div>';
}

function studioPanel() {
  return '<div class="mn-in mn-in-studio">' + STUDIO.map(([h, items]) => '<div class="mn-col"><p class="mn-hd">' + esc(h) + '</p><ul>' + items.map((x) => link(...x)).join('') + '</ul></div>').join('') +
    '<aside class="mn-feat mn-who"><span class="mn-port">' + (CREW_ART.nathan || '') + '</span><p class="mn-kick">Who builds it</p><p class="mn-p">Nathan J. Song. AI writes most of the code, and I check every change before it ships.</p>' +
    '<a class="mn-sub" href="/crew">Meet the crew' + arrow + '</a></aside></div>';
}

export function mountMegaNav(store) {
  const list = $('#mn-list');
  if (!list) return;
  const { catalog, projects, actions } = store;
  const picks = agentPicks(store);
  const fill = { agents: agentsPanel, plans: () => plansPanel(catalog), build: buildPanel, work: () => workPanel(projects), studio: studioPanel };
  const items = $$('.mn-item', list);
  items.forEach((li) => {
    const panel = $('.mn-panel', li);
    if (panel && fill[li.dataset.nav]) panel.innerHTML = '<div class="wrap">' + fill[li.dataset.nav]() + '</div>';
  });

  // Open and close. One panel at a time; hover intent so a mouse passing over doesn't flash panels.
  let open = null; let tOpen = 0; let tClose = 0;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const set = (li) => {
    if (open === li) return;
    if (open) { open.classList.remove('open'); $('.mn-caret', open).setAttribute('aria-expanded', 'false'); $('.mn-panel', open).hidden = true; }
    open = li;
    if (li) { li.classList.add('open'); $('.mn-caret', li).setAttribute('aria-expanded', 'true'); $('.mn-panel', li).hidden = false; }
    document.body.classList.toggle('mn-open', !!li);
  };
  items.forEach((li) => {
    if (!$('.mn-panel', li)) return;
    li.addEventListener('mouseenter', () => { if (!fine.matches) return; clearTimeout(tClose); clearTimeout(tOpen); tOpen = setTimeout(() => set(li), open ? 0 : 90); });
    li.addEventListener('mouseleave', () => { if (!fine.matches) return; clearTimeout(tOpen); tClose = setTimeout(() => { if (open === li) set(null); }, 180); });
    $('.mn-caret', li).addEventListener('click', () => set(open === li ? null : li));
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) { const c = $('.mn-caret', open); set(null); c.focus(); } });
  document.addEventListener('click', (e) => { if (open && !e.target.closest('#mn-list')) set(null); });
  // Tabbing out closes the panel. A null target means focus was dropped (a panel hid, or a click
  // elsewhere, which the click handler covers), so that case is left alone.
  list.addEventListener('focusout', (e) => { if (open && e.relatedTarget && !list.contains(e.relatedTarget)) set(null); });
  addEventListener('resize', () => { if (innerWidth < 860 && open) set(null); }, { passive: true });

  // Panel actions.
  const goBuild = (anchor) => {
    if (document.body.dataset.page === 'build') {
      set(null);
      const s = document.getElementById(anchor || 'build');
      if (s) s.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
      return;
    }
    location.href = '/build' + (location.hash.length > 2 ? location.hash : '');
  };
  document.addEventListener('click', (e) => {
    const ag = e.target.closest('button.mn-ag');
    if (ag) { picks.toggle(ag.dataset.ag); return; }
    const pl = e.target.closest('[data-plan]');
    if (pl) {
      const id = pl.dataset.plan;
      actions.setTab(id);
      actions.setCarePlan(PLAN[id].care);
      picks.reapply();
      goBuild('s-features');
      return;
    }
    const st = e.target.closest('a[data-step]');
    if (st && document.body.dataset.page === 'build') { e.preventDefault(); goBuild(st.dataset.step); return; }
    const go = e.target.closest('[data-mn="ag-go"]');
    if (go) {
      e.preventDefault();
      const { quote: q } = store.get();
      if (q.tier && q.tier.id === 'run') actions.setCarePlan('run');
      goBuild('s-features');
    }
  });

  function paint() {
    const { sel, quote: q } = store.get();
    const n = picks.size;
    $$('button.mn-ag').forEach((b) => { const on = picks.has(b.dataset.ag); b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
    $$('[data-mn="ag-count"]').forEach((el) => { el.textContent = n ? plural(n, 'agent', 'agents') + ' in your plan' + (q.tier ? ', a ' + q.tier.label + ' build.' : '.') : 'No agents picked yet.'; });
    $$('[data-mn="ag-go"]').forEach((el) => { el.textContent = n ? 'Build my plan with ' + plural(n, 'agent', 'agents') : 'Build my plan'; });
    $$('.mn-plan').forEach((b) => b.classList.toggle('cur', !!q.tier && q.tier.id === b.dataset.plan));
    const nf = sel.features.length;
    $$('[data-mn="so"]').forEach((el) => {
      el.innerHTML = q.tier
        ? '<p class="mn-so-t"><span class="mn-plan-ic gic">' + icon('plan_' + q.tier.id) + '</span><b>' + esc(q.tier.label) + '</b></p><ul><li><b>' + nf + '</b> ' + (nf === 1 ? 'feature' : 'features') + '</li><li><b>' + n + '</b> ' + (n === 1 ? 'agent' : 'agents') + '</li>' + (q.weeks ? '<li><b>' + esc(weeksText(q.weeks)) + '</b> weeks</li>' : '') + '</ul>'
        : '<p class="mn-p">Nothing picked yet. Start with your business and I fill in the rest.</p>';
    });
    $$('.mn-badge').forEach((el) => { el.textContent = n; el.hidden = !n; });
  }
  store.subscribe(paint);
  picks.subscribe(paint);
  paint();
  mountPhoneMap(fill);
}

// Phones: the drawer becomes an accordion of the same panels, with agents up top.
function mountPhoneMap(fill) {
  const menu = $('#m-menu');
  if (!menu) return;
  const groups = [['agents', 'AI agents', '/crew#agents'], ['plans', 'Plans', '/plans'], ['build', 'Build a project', '/build'], ['work', 'Delivered', '/work'], ['studio', 'Studio', '/care']];
  const cta = menu.querySelector('.btn');
  menu.innerHTML = groups.map(([id, label, href]) => '<details class="mm-g mm-' + id + '"><summary>' + esc(label) + (id === 'agents' ? ' <span class="mn-new">New</span>' : '') + caret + '</summary>' +
    '<div class="mm-body">' + fill[id]() + '<a class="mm-all" href="' + href + '">Open ' + esc(label) + arrow + '</a></div></details>').join('');
  if (cta) menu.appendChild(cta);
  menu.addEventListener('toggle', (e) => {
    if (e.target.open) $$('details.mm-g', menu).forEach((d) => { if (d !== e.target) d.open = false; });
  }, true);
}
