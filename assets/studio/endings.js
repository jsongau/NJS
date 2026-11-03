// The two Wave 1 endings: "Book a 20-minute call" (Cal.com link out) and "Send my plan"
// (POST to the live lead-intake function, full selection in message). The deposit button
// stays visible and disabled until Wave 5.
import { $, plural, weeksText } from './util.js';
import { resolveBusiness } from './engine.js';
import { sheet } from './summary.js';
import { track } from './track.js';

export function planMessage(store, extra = {}) {
  const { catalog } = store;
  const { sel, quote: q } = store.get();
  const name = (list, id) => { const x = list.find((i) => i.id === id); return x ? x.short || x.name || x.label : id; };
  const rb = resolveBusiness(sel, catalog);
  const style = catalog.styles.find((s) => s.id === sel.style);
  const extras = q.addons.map((id) => name(catalog.addons, id) + (id === 'fit' ? ' (' + plural(sel.fit_sessions || 1, 'session', 'sessions') + ')' : ''));
  const lines = [
    'NJS Studio plan (catalog ' + q.catalog_version + ')',
    'Business: ' + rb.label + (rb.industry_label && rb.industry_label !== rb.label ? ' (' + rb.industry_label + ')' : '') + (rb.text ? ' [typed by visitor]' : ''),
    'Tier: ' + (q.tier ? q.tier.label + ' (' + q.tier.reason + ')' : 'none yet'),
    'Timeline: ' + (q.weeks ? 'about ' + weeksText(q.weeks) + ' weeks after the audit' : 'none yet'),
    'Features (' + q.features.length + '): ' + (q.features.map((id) => name(catalog.features, id)).join(', ') || 'none'),
    'Pages: ' + (q.pages >= 151 ? 'hundreds' : 'about ' + q.pages) + ' (' + q.page_band.label + ')',
    'Style: ' + (style ? style.label : 'not picked'),
    'Extras: ' + (extras.join(', ') || 'none'),
    'Care: ' + (q.care.id === 'none' ? 'no plan' : q.care.label + ', ' + q.care.updates_per_month + ' updates a month') + ', billing ' + sel.billing,
    'Package tab: ' + (sel.package_tab || 'none') + ' · Size: ' + q.meter + ' of 100',
  ];
  if (extra.ppo) lines.push('PPO plans: ' + extra.ppo);
  if (extra.note) lines.push('Note: ' + extra.note);
  if (q.warnings.length) lines.push('Warnings: ' + q.warnings.join(', '));
  const selection = {
    industry: rb.industry, sector: rb.sector, biz_text: rb.text || undefined, business_type: sel.business_type, package_tab: sel.package_tab, features: q.features, pages: q.pages,
    style: sel.style, addons: q.addons, care_plan: q.care.id, updates_per_month: sel.updates_per_month,
    billing: sel.billing, fit_sessions: q.addons.includes('fit') ? sel.fit_sessions : 0,
  };
  lines.push('', 'selection: ' + JSON.stringify(selection));
  return lines.join('\n').slice(0, 3990);
}

export function callUrl(store, who = {}) {
  const base = (store.catalog.links && store.catalog.links.call_url) || '';
  const { quote: q } = store.get();
  const p = new URLSearchParams();
  if (who.name) p.set('name', who.name);
  if (who.email) p.set('email', who.email);
  p.set('notes', 'Studio plan: ' + (q.tier ? q.tier.label : 'no tier yet') + ', ' + plural(q.features.length, 'feature', 'features'));
  return base + '?' + p.toString();
}

const ERR = {
  name: 'Add your name.',
  email: "That email doesn't look right. Check for a typo.",
  phone: 'Check the number, or leave it blank.',
  net: "Couldn't reach the server. Your plan is still here. Try again in a minute.",
  429: 'A lot of requests from this connection just now. Try again in a few minutes.',
  other: "That didn't go through. Your plan is saved on this page. Try again in a minute.",
};

export function mountEndings(store) {
  const { catalog } = store;
  const endpoint = catalog.links && catalog.links.lead_intake;
  const form = $('#lead-form');
  const err = $('#form-err');
  const msg = $('#form-msg');
  const sendBtn = $('#send-btn');
  let sent = false;
  let enabled = false;

  function openForm() {
    if (!enabled) return;
    form.classList.add('open');
    track('form_open', { tier: store.get().sel.package_tab || null });
    sendBtn.hidden = true;
    $('#send-sub').hidden = true;
    setTimeout(() => form.querySelector('input[name="name"]').focus(), 40);
  }
  sendBtn.addEventListener('click', openForm);
  $('#final-send').addEventListener('click', () => {
    if (sheet.isPhone()) sheet.setOpen(true);
    else $('#plan').scrollIntoView({ behavior: 'smooth', block: 'start' });
    openForm();
  });

  const calls = [$('#call-btn'), $('#final-call')];
  // Until the booking link exists (call_url_todo), the call buttons open the plan form instead,
  // so no button on the live page leads to a dead link.
  const callLive = !(catalog.links && catalog.links.call_url_todo);
  if (!callLive) calls.forEach((a) => { a.textContent = 'Request a 20-minute call'; a.removeAttribute('target'); });
  calls.forEach((a) => a.addEventListener('click', (e) => {
    if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
    track('call_click', { detail: a.id });
    if (callLive) return;
    e.preventDefault();
    if (sheet.isPhone()) sheet.setOpen(true);
    else $('#plan').scrollIntoView({ behavior: 'smooth', block: 'start' });
    openForm();
    const note = form.elements.note;
    if (note && !note.value) note.value = "I'd like a 20-minute call. Best times: ";
  }));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    err.textContent = '';
    if (!d.name || !d.name.trim()) { err.textContent = ERR.name; form.elements.name.focus(); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test((d.email || '').trim())) { err.textContent = ERR.email; form.elements.email.focus(); return; }
    if (d.phone && !/^[0-9+().\-\s]{7,20}$/.test(d.phone.trim())) { err.textContent = ERR.phone; form.elements.phone.focus(); return; }
    const { sel } = store.get();
    const body = {
      door: catalog.business_types.find((b) => b.id === sel.business_type).door,
      name: d.name.trim(), email: d.email.trim(), phone: (d.phone || '').trim() || null,
      city: (d.city || '').trim() || null,
      message: planMessage(store, { note: (d.note || '').trim(), ppo: sel.business_type === 'dental' ? (d.ppo || '').trim() : '' }),
      page: location.pathname, referrer: document.referrer || null,
      consent_marketing: d.consent_marketing === 'on',
      company_website: d.company_website || '',
    };
    const btn = $('#form-submit');
    btn.disabled = true; btn.textContent = 'Sending';
    try {
      const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (r.ok) {
        sent = true;
        track('lead_sent', { business_type: body.door, tier: store.get().sel.package_tab || null });
        const first = body.name.split(/\s+/)[0];
        msg.className = 'msg';
        msg.innerHTML = '';
        const b = document.createElement('b'); b.textContent = 'Got it, ' + first + '.';
        msg.append(b, ' Your plan is with me. Look for an email from me with times. If it doesn\'t show up, check spam.');
        $('#status').textContent = 'Sent'; $('#status').classList.add('sent');
        form.reset(); form.classList.remove('open');
        if (callLive) calls.forEach((a) => { a.href = callUrl(store, { name: body.name, email: body.email }); });
      } else {
        let code = '';
        try { code = (await r.json()).error || ''; } catch (_) { /* no body */ }
        err.textContent = r.status === 429 ? ERR[429] : code === 'name_required' ? ERR.name : code === 'invalid_email' ? ERR.email : ERR.other;
      }
    } catch (_) {
      err.textContent = ERR.net;
    }
    btn.disabled = false; btn.textContent = 'Send my plan';
  });

  store.subscribe(({ sel, quote: q }) => {
    enabled = q.features.length + q.addons.length > 0;
    const why = !enabled ? 'Your plan is empty. Tap a feature to start.' :
      !q.features.length ? "Just the extras? That works. I'll set those up on a quick call." : '';
    $('#ends-why').textContent = why;
    sendBtn.disabled = !enabled;
    $('#final-send').disabled = !enabled;
    calls.forEach((a) => {
      a.setAttribute('aria-disabled', String(!enabled));
      if (!sent) a.href = callLive ? callUrl(store) : '#plan';
    });
    $('#ppo-field').hidden = sel.business_type !== 'dental';
    if (!enabled && form.classList.contains('open')) { form.classList.remove('open'); sendBtn.hidden = false; $('#send-sub').hidden = false; }
  });
}
