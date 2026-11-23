// Request a 20-minute call without leaving the page (2026-11-23). The visitor picks a weekday and a
// Pacific time, adds a name and an email, and the request goes to lead-intake with the time in the
// message. It is a request: Jay confirms by email. Nothing here reads a calendar, so the copy never
// says a time is open or confirmed. Markup: partials/studio/call-dlg.html.
import { $ } from './util.js';
import { track } from './track.js';
import { resolveBusiness } from './engine.js';

const HOURS = [9, 10, 11, 13, 14, 15, 16];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const fmt = (h) => (h % 12 || 12) + ':00 ' + (h < 12 ? 'AM' : 'PM');
const dayLabel = (d) => DOW[d.getDay()] + ', ' + MON[d.getMonth()] + ' ' + d.getDate();

// The next eight weekdays, starting tomorrow.
export function callDays(now = new Date()) {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const out = [];
  while (out.length < 8) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) out.push(new Date(d)); }
  return out;
}

export function callMessage(day, hour, biz) {
  return ['Call request: ' + dayLabel(day) + ' at ' + fmt(hour) + ' Pacific', biz ? 'Business: ' + biz : null].filter(Boolean).join('\n');
}

let opener = null;
// Opens the call panel. Returns false when the page has no panel, so the caller can fall back.
export function openCall(from) { return opener ? opener(from) : false; }

export function mountCallBook(store) {
  const dlg = $('#call-dlg');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  const { catalog } = store;
  const endpoint = catalog.links && catalog.links.lead_intake;
  const form = $('#call-form'), err = $('#call-err'), done = $('#cb-done'), btn = $('#call-submit');
  const days = callDays();
  const st = { day: 0, hour: null };

  const paint = () => {
    $('#cb-days').innerHTML = days.map((d, i) => '<button type="button" class="cb-day" data-i="' + i + '" aria-pressed="' + (i === st.day) + '"><small>' + DOW[d.getDay()] + '</small><b>' + d.getDate() + '</b><small>' + MON[d.getMonth()] + '</small></button>').join('');
    $('#cb-times').innerHTML = HOURS.map((h) => '<button type="button" class="cb-time" data-h="' + h + '" aria-pressed="' + (h === st.hour) + '">' + fmt(h) + '</button>').join('');
  };
  const press = (wrap, el) => [...wrap.children].forEach((x) => x.setAttribute('aria-pressed', String(x === el)));
  $('#cb-days').addEventListener('click', (e) => { const b = e.target.closest('.cb-day'); if (!b) return; st.day = +b.dataset.i; press($('#cb-days'), b); });
  $('#cb-times').addEventListener('click', (e) => { const b = e.target.closest('.cb-time'); if (!b) return; st.hour = +b.dataset.h; press($('#cb-times'), b); err.textContent = ''; });

  opener = (from) => {
    if (dlg.open) return true;
    track('call_click', { detail: String(from || 'page').slice(0, 40) });
    // Start the business line from what the visitor already picked on the page.
    if (!form.elements.biz.value) {
      try { const rb = resolveBusiness(store.get().sel, catalog); if (rb && rb.text) form.elements.biz.value = rb.text; } catch (_) { /* no selection yet */ }
    }
    form.hidden = false; done.hidden = true; err.textContent = '';
    paint();
    dlg.showModal();
    return true;
  };
  const close = () => { if (dlg.open) dlg.close(); };
  $('#call-dlg-x').addEventListener('click', close);
  $('#cb-done-x').addEventListener('click', close);
  $('#cb-done-build').addEventListener('click', close);
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-call]');
    if (!t) return;
    e.preventDefault();
    opener(t.dataset.call);
  }, true);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const name = (d.name || '').trim(), email = (d.email || '').trim(), biz = (d.biz || '').trim();
    err.textContent = '';
    if (st.hour === null) { err.textContent = 'Pick a time first.'; $('#cb-times .cb-time').focus(); return; }
    if (!name) { err.textContent = 'Add your name so I know who to write back to.'; form.elements.name.focus(); return; }
    if (!EMAIL.test(email)) { err.textContent = 'That email doesn\'t look right. Check it and try again.'; form.elements.email.focus(); return; }
    const sel = store.get().sel;
    const type = catalog.business_types.find((b) => b.id === sel.business_type);
    const body = {
      door: type ? type.door : 'build', name, email,
      message: callMessage(days[st.day], st.hour, biz),
      page: location.pathname, referrer: document.referrer || null,
      company_website: d.company_website || '',
    };
    btn.disabled = true; btn.textContent = 'Sending';
    let ok = false, status = 0;
    try {
      const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      ok = r.ok; status = r.status;
    } catch (_) { /* offline */ }
    btn.disabled = false; btn.textContent = 'Request this time';
    if (!ok) {
      err.textContent = status === 429 ? 'A few too many tries. Give it a few minutes.' : status ? 'That didn\'t send. Try again in a moment.' : 'No connection. Check your signal and try again.';
      return;
    }
    track('lead_sent', { business_type: body.door, detail: 'call' });
    $('#cb-done-h').textContent = 'Got it, ' + name.split(/\s+/)[0] + '.';
    $('#cb-done-p').textContent = 'You asked for ' + dayLabel(days[st.day]) + ' at ' + fmt(st.hour) + ' Pacific. Look for my email confirming it, or offering the closest time I have. If it doesn\'t show up, check spam.';
    form.reset(); st.hour = null;
    form.hidden = true; done.hidden = false; done.focus();
  });
}
