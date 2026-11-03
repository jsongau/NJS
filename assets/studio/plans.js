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
  el.innerHTML = catalog.tiers.map((t) => {
    const m = PLAN[t.id];
    const proj = projects.projects.find((p) => p.id === m.example);
    const c = care[m.care];
    const price = shown && t.price
      ? '<p class="pl-price"><span class="pl-from">From</span> <b class="num">' + money(t.price.low_cents) + '</b><span class="pl-unit">to build</span></p>' +
        '<p class="pl-mo">+ ' + esc(c.label) + ' from <b class="num">' + money(c.monthly.low_cents) + '</b> a month</p>'
      : '<p class="pl-price hid"><b>Priced in your written plan</b></p><p class="pl-mo">Then the ' + esc(c.label) + ' plan, month to month</p>';
    return '<article class="pl pl-' + t.id + '" aria-labelledby="pl-' + t.id + '">' +
      '<div class="pl-top"><span class="gic pl-ic">' + icon('plan_' + t.id) + '</span><p class="pl-kick">' + esc(m.kick) + '</p></div>' +
      '<h3 id="pl-' + t.id + '">' + esc(t.label) + '</h3>' +
      '<p class="pl-for">' + esc(t.for) + '</p>' + price +
      '<button type="button" class="btn ' + (t.id === 'run' ? 'btn-lime' : '') + ' pl-go" data-t="' + t.id + '">' + esc(m.cta) + '</button>' +
      '<ul class="pl-inc">' + t.includes.map((x) => (x.endsWith(':') ? '<li class="sub">' + esc(x) + '</li>' : '<li>' + esc(x) + '</li>')).join('') + '</ul>' +
      (t.id === 'run' ? dash() : '') +
      '<p class="pl-meta"><span>About ' + weeksText(t.weeks) + ' weeks</span><span>' + esc(c.label) + ': ' + esc(c.response.label.toLowerCase()) + '</span></p>' +
      (proj ? '<a class="pl-ex-l" href="' + ($('#wall') ? '' : '/work') + '#p-' + proj.id + '">' + esc(m.exLine) + '</a>' : '') +
      '</article>';
  }).join('');
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
