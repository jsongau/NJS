// Fitness mode page (2026-11-03): goal picker and the private-session request.
// The request goes to the same lead-intake function as the studio form, as a "train" lead.
import { $, $$ } from './util.js';
import { track } from './track.js';

const ENDPOINT = 'https://cedunmyttprzgslthuyk.supabase.co/functions/v1/lead-intake';
const ERR = {
  name: 'Add your name so I know who to write back to.',
  email: 'That email doesn\'t look right. Check it and try again.',
  other: 'That didn\'t send. Try again, or email natejmsong@gmail.com.',
  rate: 'A few too many tries. Give it a few minutes.',
  net: 'No connection. Check your signal and try again.',
};

export function mountFitness() {
  const grid = $('.fx-goal-grid');
  const form = $('#fx-form');
  if (!grid || !form) return;
  const goals = $$('.fx-goal', grid).map((b) => ({ id: b.dataset.goal, name: $('b', b).textContent, how: $('.fx-how', b).textContent }));
  const sel = $('#fx-goal');
  sel.insertAdjacentHTML('beforeend', goals.map((g) => '<option value="' + g.id + '">' + g.name + '</option>').join('') + '<option value="other">Something else</option>');

  const pick = (id, from) => {
    $$('.fx-goal', grid).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.goal === id)));
    sel.value = id;
    const g = goals.find((x) => x.id === id);
    if (g) {
      $('#fx-pick').innerHTML = '<p><b>' + g.name + '.</b> ' + g.how + '</p><a class="btn btn-lime" href="#book">Request a session for this</a>';
      if (from) track('goal_picked', { detail: id });
    }
  };
  grid.addEventListener('click', (e) => { const b = e.target.closest('.fx-goal'); if (b) pick(b.dataset.goal, 'grid'); });
  sel.addEventListener('change', () => { if (sel.value && sel.value !== 'other') pick(sel.value, 'form'); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const msg = $('#fx-msg');
    msg.className = 'fx-msg fx-wide';
    if (!d.name || !d.name.trim()) { msg.textContent = ERR.name; form.elements.name.focus(); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test((d.email || '').trim())) { msg.textContent = ERR.email; form.elements.email.focus(); return; }
    const g = goals.find((x) => x.id === d.goal);
    const body = {
      door: 'train', name: d.name.trim(), email: d.email.trim(), phone: (d.phone || '').trim() || null,
      location: d.location || null,
      message: ['Goal: ' + (g ? g.name : d.goal === 'other' ? 'Something else' : 'Not picked'), (d.note || '').trim()].filter(Boolean).join('\n'),
      page: location.pathname, referrer: document.referrer || null,
      consent_marketing: d.consent_marketing === 'on', company_website: d.company_website || '',
    };
    const btn = $('#fx-send');
    btn.disabled = true; btn.textContent = 'Sending';
    try {
      const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (r.ok) {
        track('lead_sent', { business_type: 'train', detail: d.goal || null });
        form.reset();
        msg.classList.add('ok');
        msg.textContent = 'Got it, ' + body.name.split(/\s+/)[0] + '. Look for an email from me with times. If it doesn\'t show up, check spam.';
      } else {
        let code = ''; try { code = (await r.json()).error || ''; } catch (_) { /* no body */ }
        msg.textContent = r.status === 429 ? ERR.rate : code === 'invalid_email' ? ERR.email : code === 'name_required' ? ERR.name : ERR.other;
      }
    } catch (_) { msg.textContent = ERR.net; }
    btn.disabled = false; btn.textContent = 'Send my request';
  });
}
