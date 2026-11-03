// Step 07: care plan cards, updates-per-month stepper, monthly or annual toggle (Ross 3.3 item 7).
// Reply-time lines stay hidden until email alerts are live (flag alerts_on).
import { $, $$, esc, radioGroup, stepper, money, moneyRange } from './util.js';

export function mountCare(store) {
  const { catalog, actions } = store;
  const flags = catalog.flags || {};
  const maxUpdates = Math.max(...catalog.care_plans.map((p) => p.updates_per_month));
  const months = catalog.billing.annual_months_billed;

  let dir = 0;
  const updStep = stepper($('#upd'), { min: 0, max: maxUpdates, labelId: 'upd-l', onChange: (v, d) => { dir = d; actions.setUpdates(v); } });

  const updBill = radioGroup($('#bill'), [{ id: 'monthly', html: 'Monthly', cls: 'b' }, { id: 'annual', html: 'Annual', cls: 'b' }], (id) => actions.setBilling(id));

  // Cards stay short (name, who it fits, updates, one line); the detail lives in one comparison
  // table underneath with the same rows for every plan, so plans compare side by side.
  const plansEl = $('#plans');
  const updPlans = radioGroup(plansEl, catalog.care_plans.map((p) => ({
    id: p.id, cls: 'plan',
    html: '<span class="pl-h"><b>' + esc(p.label) + '</b><span class="radio" aria-hidden="true"></span></span>' +
      '<span class="fits">' + esc(p.fits || 'You run it') + '</span>' +
      '<span class="upn"><span class="upn-n num">' + p.updates_per_month + '</span><span class="upn-t">' + (p.updates_per_month === 1 ? 'update' : 'updates') + '<br>a month</span></span>' +
      '<span class="pline">' + esc(p.line) + '</span>' +
      '<span class="pl-price priced-only" data-plan="' + p.id + '"></span>',
  })), (id) => actions.setCarePlan(id));

  const cmp = $('#care-cmp');
  if (cmp) {
    const ROWS = [
      ['Hosting in accounts you own', 'hosting'],
      ['Daily backups, monthly copy to your storage', 'backups'],
      ['Security and software updates', 'security'],
      ['Uptime check every 5 minutes', 'uptime'],
      ['Monthly report with your numbers', 'reports'],
      ['AI helper log read every week', 'helper_log'],
      ['Nightly review loop on your agents', 'review_loop'],
    ];
    const plans = catalog.care_plans;
    const tick = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.4l3 2.8 6-6.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const cell = (on) => on ? '<td class="y">' + tick + '<span class="sr">Included</span></td>' : '<td class="n"><span aria-hidden="true">-</span><span class="sr">Not included</span></td>';
    const rows = [
      '<tr><th scope="row">Updates a month</th>' + plans.map((p) => '<td class="num">' + p.updates_per_month + '</td>').join('') + '</tr>',
      ...ROWS.map(([label, key]) => '<tr><th scope="row">' + esc(label) + '</th>' + plans.map((p) => cell(key === 'helper_log' ? ['tend', 'run'].includes(p.id) : (p.includes || []).includes(key))).join('') + '</tr>'),
      '<tr><th scope="row">A 30-minute planning call each month</th>' + plans.map((p) => cell(p.id === 'run')).join('') + '</tr>',
      flags.alerts_on ? '<tr><th scope="row">Reply time</th>' + plans.map((p) => '<td>' + esc(p.response.label) + '</td>').join('') + '</tr>' : '',
      '<tr><th scope="row">Extra work outside the plan</th>' + plans.map(() => '<td>Hourly</td>').join('') + '</tr>',
    ].join('');
    cmp.innerHTML = '<details class="cmp"><summary>Compare what each plan includes</summary><div class="cmp-scroll"><table><thead><tr><th scope="col"><span class="sr">Included</span></th>' +
      plans.map((p) => '<th scope="col" data-p="' + p.id + '">' + esc(p.label) + '</th>').join('') + '</tr></thead><tbody>' + rows + '</tbody></table></div></details>';
  }

  store.subscribe(({ sel, quote: q }) => {
    updStep(sel.updates_per_month, dir); dir = 0;
    updBill(sel.billing);
    updPlans(q.care.id);
    if (cmp) { const i = catalog.care_plans.findIndex((p) => p.id === q.care.id); $$('tr', cmp).forEach((tr) => [...tr.children].forEach((c, j) => c.classList.toggle('cur', j === i + 1))); }
    $('#bill-note').textContent = sel.billing === 'annual'
      ? 'Annual: 12 months for the price of ' + months + ', billed yearly.'
      : 'Billed monthly. Pause or cancel any month.';
    const warn = q.warnings.includes('care_plan_below_tier');
    const why = $('#care-why');
    why.className = 'note-line' + (warn ? ' rose' : '');
    why.textContent = warn ? q.care.label + ' care fits Premium and Partner builds.' :
      q.care.id === 'none' ? 'No care plan. You can add one later.' :
      q.tier ? 'For a ' + q.tier.label + ' project, most of the work fits in ' + suggested(q) + '.' : '';
    if (q.priced) {
      $$('.pl-price', plansEl).forEach((el) => {
        const p = catalog.care_plans.find((x) => x.id === el.dataset.plan);
        el.textContent = p.monthly && p.monthly.high_cents ? 'From ' + money(p.monthly.low_cents) + ' a month, estimate' : '';
      });
      if (q.monthly_cents && sel.billing === 'annual') $('#bill-note').textContent += ' ' + moneyRange(q.monthly_cents) + ' a month equivalent.';
    }
  });
}

function suggested(q) {
  return { launch: 'Hosting', grow: 'Care', run: 'Partner' }[q.tier.id];
}
