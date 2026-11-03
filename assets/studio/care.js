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

  const plansEl = $('#plans');
  const updPlans = radioGroup(plansEl, catalog.care_plans.map((p) => {
    const bullets = (p.bullets || []).filter((b) => b.kind !== 'reply' || flags.alerts_on);
    return {
      id: p.id, cls: 'plan',
      html: '<span class="pl-h"><b>' + esc(p.label) + '</b><span class="radio" aria-hidden="true"></span></span>' +
        (p.fits ? '<span class="fits">' + esc(p.fits) + '</span>' : '<span class="fits">You run it</span>') +
        '<span class="upn">' + (p.updates_per_month ? p.updates_per_month + ' updates a month' : 'No monthly updates') + '</span>' +
        '<span class="pline">' + esc(p.line) + '</span>' +
        '<span class="pl-price priced-only" data-plan="' + p.id + '"></span>' +
        (bullets.length ? '<span class="ul">' + bullets.map((b) => '<span class="li">' + esc(b.text) + '</span>').join('') + '</span>' : ''),
    };
  }), (id) => actions.setCarePlan(id));

  store.subscribe(({ sel, quote: q }) => {
    updStep(sel.updates_per_month, dir); dir = 0;
    updBill(sel.billing);
    updPlans(q.care.id);
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
