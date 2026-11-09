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

// Hero "Your first session" card: discipline tabs (fixed-height panels, no layout shift),
// a region choice, and a CTA that carries both into the request form below.
function mountFirst(form) {
  const card = $('.fx-first');
  if (!card) return;
  const tabs = $$('[role="tab"]', card);
  const show = (t, focus) => {
    tabs.forEach((x) => {
      const on = x === t;
      x.setAttribute('aria-selected', String(on));
      x.tabIndex = on ? 0 : -1;
      $('#' + x.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) t.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => { show(t); track('fit_tab', { detail: t.dataset.disc }); });
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); show(tabs[(i + d + tabs.length) % tabs.length], true); }
    });
  });
  card.addEventListener('change', (e) => { if (e.target.name === 'fx-region') track('fit_region', { detail: e.target.value }); });
  $('.fx-first-go', card).addEventListener('click', () => {
    const t = tabs.find((x) => x.getAttribute('aria-selected') === 'true');
    const r = $('input[name="fx-region"]:checked', card);
    if (r && form.elements.location) form.elements.location.value = r.value;
    if (t && form.elements.discipline) form.elements.discipline.value = t.dataset.disc;
    form.dataset.entry = 'hero_card';
    track('form_open', { detail: 'first_session:' + (t ? t.dataset.disc : '') });
  });
}

export function mountFitness() {
  const grid = $('.fx-goal-grid');
  const form = $('#fx-form');
  if (!grid || !form) return;
  mountFirst(form);
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
      if (from === 'grid' && form.dataset.entry !== 'hero_card') form.dataset.entry = 'goal_grid';
    }
  };
  grid.addEventListener('click', (e) => { const b = e.target.closest('.fx-goal'); if (b) pick(b.dataset.goal, 'grid'); });
  sel.addEventListener('change', () => { if (sel.value && sel.value !== 'other') pick(sel.value, 'form'); });

  form.addEventListener('focusin', () => { if (!form.dataset.started) { form.dataset.started = '1'; track('book_step', { detail: 'start' }); } });
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
      meta: { discipline: d.discipline || undefined, goal: d.goal || undefined, times: new FormData(form).getAll('times'), entry: form.dataset.entry || 'form' },
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
        delete form.dataset.entry;
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
