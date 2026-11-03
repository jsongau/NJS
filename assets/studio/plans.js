// The three plans, side by side (Linear and Vercel tier cards, "Everything in X, plus:").
// Each card names a real delivered project as its example and loads that starting set.
import { $, $$, esc, money, weeksText, reduced } from './util.js';
import { icon } from './icons.js';

const PLAN = {
  launch: { kick: 'A website, hosted', example: 'bobanight', exLine: 'Like Boba Night: a guide people find on their phone, live and hosted.', care: 'keep', cta: 'Start with Basic' },
  grow: { kick: 'Your customers log in and pay', example: 'boxvacay', exLine: 'Like BoxVacay: booking with deposits and emails to both sides.', care: 'tend', cta: 'Start with Premium' },
  run: { kick: 'I work alongside you', example: 'pmcountdown', exLine: 'Like PM Countdown: agents on a schedule and a dashboard I read every morning.', care: 'run', cta: 'Start with Partner' },
};

function dash() {
  const rows = [['Follow-up agent', '6:00 AM', '12 sent'], ['Review requests', '9:30 AM', '4 asked'], ['Booking check', 'Every hour', 'All clear']];
  return '<div class="pl-dash" aria-hidden="true"><div class="pl-dh"><span>Your dashboard</span><span class="pl-ex">Example</span></div>' +
    '<div class="pl-kpis"><div><b>38</b><span>bookings this week</span></div><div><b>91%</b><span>replied in an hour</span></div></div>' +
    rows.map((r) => '<div class="pl-row"><i></i><b>' + r[0] + '</b><span>' + r[1] + '</span><em>' + r[2] + '</em></div>').join('') + '</div>';
}

export function mountPlans(store) {
  const { catalog, actions, projects } = store;
  const el = $('#plans-grid');
  if (!el) return;
  const shown = catalog.prices === 'shown';
  const care = Object.fromEntries(catalog.care_plans.map((p) => [p.id, p]));
  // Compact cards (2026-11-03). The face sells; "What's included" slides a drawer up inside the
  // card's own frame, so opening one never moves the page (Mary's rule). The live date is a real
  // estimate from today: about a week for the audit, then the plan's longest build time.
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  const liveBy = (weeks) => { const d = new Date(); d.setDate(d.getDate() + 7 * (1 + weeks[weeks.length - 1])); return MON[d.getMonth()] + ' ' + d.getDate(); };
  el.innerHTML = catalog.tiers.map((t) => {
    const m = PLAN[t.id];
    const proj = projects.projects.find((p) => p.id === m.example);
    const c = care[m.care];
    const n = t.includes.filter((x) => !x.endsWith(':')).length;
    const price = shown && t.price
      ? '<p class="pl-price"><span class="pl-from">From</span> <b class="num">' + money(t.price.low_cents) + '</b><span class="pl-unit">to build</span></p>'
      : '<p class="pl-price hid">Priced in your written plan · then ' + esc(c.label) + ', month to month</p>';
    return '<article class="pl pl-' + t.id + '" aria-labelledby="pl-' + t.id + '">' +
      '<span class="pl-spot" aria-hidden="true"></span>' +
      '<div class="pl-face">' +
        '<div class="pl-top"><span class="gic pl-ic">' + icon('plan_' + t.id) + '</span><p class="pl-kick">' + esc(m.kick) + '</p></div>' +
        '<h3 id="pl-' + t.id + '">' + esc(t.label) + '</h3>' +
        '<p class="pl-for">' + esc(t.for) + '</p>' +
        '<p class="pl-eta"><i aria-hidden="true"></i><span>Start this week, live around <b>' + liveBy(t.weeks) + '</b></span></p>' +
        price +
        '<div class="pl-acts"><button type="button" class="btn ' + (t.id === 'run' ? 'btn-lime' : '') + ' pl-go" data-t="' + t.id + '">' + esc(m.cta) + '</button>' +
        '<button type="button" class="pl-more" aria-expanded="false" aria-controls="pl-d-' + t.id + '">What\'s included <span class="pl-n">' + n + '</span></button></div>' +
        (proj ? '<a class="pl-ex-l" href="' + ($('#wall') ? '' : '/work') + '#p-' + proj.id + '">' + esc(m.exLine) + '</a>' : '') +
      '</div>' +
      '<div class="pl-drawer" id="pl-d-' + t.id + '" role="region" aria-label="' + esc(t.label) + ': what\'s included" inert>' +
        '<div class="pl-dhd"><b>' + esc(t.label) + '</b><button type="button" class="pl-x" aria-label="Close">×</button></div>' +
        '<ul class="pl-inc">' + t.includes.map((x, i) => (x.endsWith(':') ? '<li class="sub" style="--i:' + i + '">' + esc(x) + '</li>' : '<li style="--i:' + i + '">' + esc(x) + '</li>')).join('') + '</ul>' +
        (t.id === 'run' ? dash() : '') +
        '<p class="pl-meta"><span>About ' + weeksText(t.weeks) + ' weeks after the audit</span><span>' + esc(c.label) + ': ' + esc(c.response.label.toLowerCase()) + '</span><span>Dates are an estimate; the audit sets yours.</span></p>' +
        '<button type="button" class="btn ' + (t.id === 'run' ? 'btn-lime' : '') + ' pl-go" data-t="' + t.id + '">' + esc(m.cta) + '</button>' +
      '</div>' +
      '</article>';
  }).join('');
  // Drawer open and close; one open at a time; Escape closes and hands focus back.
  const setOpen = (card, open) => {
    const more = $('.pl-more', card), dr = $('.pl-drawer', card);
    card.classList.toggle('open', open);
    more.setAttribute('aria-expanded', String(open));
    dr.toggleAttribute('inert', !open);
    if (open) setTimeout(() => $('.pl-x', card).focus({ preventScroll: true }), 120);
  };
  el.addEventListener('click', (e) => {
    const more = e.target.closest('.pl-more');
    if (more) { const card = more.closest('.pl'); $$('.pl.open', el).forEach((c) => c !== card && setOpen(c, false)); setOpen(card, !card.classList.contains('open')); return; }
    const x = e.target.closest('.pl-x');
    if (x) { const card = x.closest('.pl'); setOpen(card, false); $('.pl-more', card).focus({ preventScroll: true }); }
  });
  el.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const card = e.target.closest('.pl.open');
    if (card) { setOpen(card, false); $('.pl-more', card).focus({ preventScroll: true }); }
  });
  // Spotlight follows the pointer across each card.
  el.addEventListener('pointermove', (e) => {
    const card = e.target.closest('.pl');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
  el.addEventListener('click', (e) => {
    const b = e.target.closest('.pl-go');
    if (!b) return;
    actions.setTab(b.dataset.t);
    const plan = catalog.care_plans.find((p) => p.id === PLAN[b.dataset.t].care);
    if (plan) actions.setCarePlan(plan.id);
    const s = $('#s-features');
    if (s) s.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
    else location.href = '/build' + (location.hash || '#s-features');
  });
  store.subscribe(({ quote: q }) => {
    $$('.pl', el).forEach((a) => a.classList.toggle('cur', !!q.tier && a.classList.contains('pl-' + q.tier.id)));
  });
}
