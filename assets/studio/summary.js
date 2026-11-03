// The live plan: tier, meter, size odometer, timeline, Agent NS line, rows, lists (Ross 3.4),
// plus the phone bar and bottom sheet (Mary B.6.9). Meter mode when prices are hidden.
import { $, $$, esc, odometer, typer, plural, weeksText, moneyRange, reduced } from './util.js';
import { resolveBusiness } from './engine.js';

export function nsLine(q, catalog) {
  if (!q.tier) return q.addons.length ? "Just the extras? That works. I'll set those up on a quick call." : 'Pick a feature to see the size.';
  let s = "So far that's a " + q.tier.label + ' project. About ' + weeksText(q.weeks) + ' weeks after the audit.';
  if (q.features.length >= 7) s = "That's a big list. Totally doable, it just becomes a Partner project. The audit will help you pick what goes first.";
  return s;
}

export function planSentence(q, catalog) {
  if (!q.tier) return 'Your plan is empty.';
  return q.tier.label + ' build, ' + weeksText(q.weeks) + ' weeks, care plan ' + q.care.label + '.';
}

export function mountSummary(store) {
  const { catalog, actions } = store;
  const bizById = Object.fromEntries(catalog.business_types.map((b) => [b.id, b]));
  const featById = Object.fromEntries(catalog.features.map((f) => [f.id, f]));
  const addById = Object.fromEntries(catalog.addons.map((a) => [a.id, a]));
  const styleById = Object.fromEntries(catalog.styles.map((s) => [s.id, s]));
  const sizeOd = odometer($('#size-od'));
  const weeksOd = odometer($('#weeks-od'));
  const type = typer($('#ns-line'));
  let srTimer = null;
  let firstRun = true;
  let lastTier = null;
  const baseTitle = document.title;

  $('#sum-features').addEventListener('click', (e) => { const id = e.target.dataset && e.target.dataset.rm; if (id) actions.removeFeature(id); });
  $('#sum-extras').addEventListener('click', (e) => { const id = e.target.dataset && e.target.dataset.rma; if (id) actions.toggleAddon(id); });

  function flash(text) {
    if (reduced() || !text) return;
    const d = $('#delta');
    d.textContent = text;
    d.classList.remove('go'); void d.offsetWidth; d.classList.add('go');
    const u = $('#underline');
    u.classList.remove('go'); void u.offsetWidth; u.classList.add('go');
  }

  store.subscribe(({ sel, quote: q, prev, meta }) => {
    $('#sum-for').textContent = resolveBusiness(sel, catalog).plan_label;
    const tw = $('#tier-word');
    tw.classList.toggle('empty', !q.tier);
    tw.textContent = q.tier ? q.tier.label : 'Pick a feature to see the size.';
    const extras = q.addons.filter((id) => addById[id].billing !== 'separate').length;
    $('#total-k2').textContent = q.tier ? (extras ? q.tier.label + ' + ' + plural(extras, 'extra', 'extras') : 'Tier') : 'Tier';
    sizeOd.set(String(q.meter).padStart(2, '0'));
    weeksOd.set(q.weeks ? weeksText(q.weeks) : '0');
    $('#weeks-u').textContent = q.weeks ? 'weeks' : 'weeks, once you pick';
    $('#m-fill').style.transform = 'scaleX(' + q.meter / 100 + ')';
    const tickOn = !q.tier ? -1 : q.tier.id === 'run' && extras ? 3 : q.tier.rank - 1;
    $$('#m-ticks span').forEach((s, i) => s.classList.toggle('on', i === tickOn));

    if (!firstRun && !meta.init) {
      if ((q.tier && q.tier.id) !== (prev.tier && prev.tier.id) && q.tier) flash((prev.tier && prev.tier.rank > q.tier.rank ? '- ' : '+ ') + q.tier.label);
      else if (q.meter !== prev.meter) flash((q.meter > prev.meter ? '+' : '') + (q.meter - prev.meter));
    }
    firstRun = false;

    type(nsLine(q, catalog));

    const rows = [
      ['Features', String(q.features.length)],
      ['Pages', q.pages >= 151 ? 'Hundreds' : 'About ' + q.pages],
      ['Tier', q.tier ? q.tier.label : 'None yet'],
      ['Timeline', q.weeks ? 'About ' + weeksText(q.weeks) + ' weeks after the audit' + (q.addons.includes('rush') ? ', shorter with Rush' : '') : 'Once you pick'],
      ['Style', styleById[sel.style] ? styleById[sel.style].label : 'Not picked'],
      ['Care', q.care.id === 'none' ? 'None' : q.care.label + ', ' + q.care.updates_per_month + ' updates a month' + (sel.billing === 'annual' ? ', annual' : '')],
    ];
    $('#rows').innerHTML = rows.map(([k, v]) => '<dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd>').join('');

    $('#sum-features').innerHTML = q.features.length
      ? q.features.map((id) => '<li>' + esc(featById[id].name) + '<button type="button" data-rm="' + id + '" aria-label="Remove ' + esc(featById[id].name) + '">Remove</button></li>').join('')
      : '<li class="empty"><b style="color:var(--ink)">Your plan is empty.</b> Tap a feature to start.</li>';
    $('#sum-extras').innerHTML = q.addons.length
      ? q.addons.map((id) => {
        const a = addById[id];
        const label = (a.short || a.name) + (a.billing === 'separate' ? ', ' + plural(sel.fit_sessions || 1, 'session', 'sessions') + ', arranged separately' : '');
        return '<li><span><span class="plus">+</span>' + esc(label) + '</span><button type="button" data-rma="' + id + '" aria-label="Remove ' + esc(a.short || a.name) + '">Remove</button></li>';
      }).join('')
      : "<li class=\"empty\">No extras. That's fine.</li>";

    // Price mode (only when the catalog ships prices).
    if (q.priced) {
      $('#priced-figures').innerHTML = '<p class="rows" style="display:block">Build estimate ' + esc(moneyRange(q.one_time_cents)) +
        (q.monthly_cents && q.care.id !== 'none' ? '<br>Care ' + esc(moneyRange(q.monthly_cents)) + ' a month' : '') + '</p>' +
        '<p class="est">These are estimates from what you picked. The audit sets the final scope and price in writing, before you pay for any build work.</p>';
    }

    // Progress: rail on the steps, top edge on the summary.
    const done = {
      's-business': true,
      's-package': !!sel.package_tab || q.features.length > 0,
      's-features': q.features.length > 0,
      's-size': store.get().touched.has('pages'),
      's-style': store.get().touched.has('style'),
      's-extras': q.addons.length > 0,
      's-care': q.care.id !== 'none' || store.get().touched.has('care_plan'),
    };
    const n = Object.values(done).filter(Boolean).length;
    Object.entries(done).forEach(([id, on]) => { const el = document.getElementById(id); if (el) el.classList.toggle('has', on); });
    $('#rail-fill').style.transform = 'scaleY(' + n / 7 + ')';
    $('#plan').style.setProperty('--done', n / 7);

    // Phone bar.
    $('#pb-tier').textContent = q.tier ? q.tier.label : 'None';
    $('#pb-fill').style.transform = 'scaleX(' + q.meter / 100 + ')';
    $('#pb-sub').textContent = plural(q.features.length, 'feature', 'features') + (q.weeks ? ' · ' + weeksText(q.weeks) + ' weeks' : '') + (q.care.id !== 'none' ? ' · Care: ' + q.care.label : '');
    bar.update(q.features.length + q.addons.length > 0);

    clearTimeout(srTimer);
    if (!meta.init) srTimer = setTimeout(() => { $('#sr-live').textContent = planSentence(q, catalog); }, 500);
    lastTier = q.tier ? q.tier.label : null;
  });

  // Leaving the tab with a build in progress (Mary B.5, Bruno Simon's title made useful).
  document.addEventListener('visibilitychange', () => {
    document.title = document.hidden && lastTier ? 'Your ' + lastTier + ' build is waiting' : baseTitle;
  });
}

// Phone bar and bottom sheet. Desktop (1024 and up) never shows either.
const bar = (() => {
  let has = false;
  let inCfg = false;
  let atEnd = false;
  let open = false;
  let lastFocus = null;
  const mq = typeof matchMedia === 'function' ? matchMedia('(max-width: 1023px)') : { matches: false, addEventListener() {} };
  function paint() {
    const show = mq.matches && has && inCfg && !atEnd && !open;
    const pb = $('#pbar');
    if (!pb) return;
    pb.classList.toggle('show', show);
    document.body.style.setProperty('--bar-h', show ? '76px' : '0px');
  }
  function focusables() { return $$('#sheet button:not([disabled]), #sheet a[href], #sheet input, #sheet textarea').filter((el) => el.offsetParent !== null); }
  function setOpen(v) {
    if (!mq.matches && v) return;
    open = v;
    const sheet = $('#sheet');
    sheet.classList.toggle('open', v);
    $('#scrim').classList.toggle('open', v);
    $('#pb-review').setAttribute('aria-expanded', v);
    if (v) { sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); lastFocus = document.activeElement; setTimeout(() => $('#sheet-close').focus(), 30); }
    else { sheet.removeAttribute('role'); sheet.removeAttribute('aria-modal'); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
    paint();
  }
  function init() {
    $('#pb-review').addEventListener('click', () => setOpen(true));
    $('#sheet-close').addEventListener('click', () => setOpen(false));
    $('#scrim').addEventListener('click', () => setOpen(false));
    document.addEventListener('keydown', (e) => {
      if (!open) return;
      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key !== 'Tab') return;
      const f = focusables();
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
    const check = () => {
      inCfg = $('#build').getBoundingClientRect().top < innerHeight * 0.6;
      atEnd = $('#final').getBoundingClientRect().top < innerHeight * 0.85;
      paint();
    };
    addEventListener('scroll', check, { passive: true });
    addEventListener('resize', check);
    check();
    mq.addEventListener('change', () => { if (!mq.matches && open) setOpen(false); paint(); });
  }
  return { init, setOpen, update(v) { has = v; paint(); }, isPhone: () => mq.matches };
})();

export const sheet = bar;
