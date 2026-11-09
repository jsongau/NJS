// NJS Fitness pages (2026-11-09, v3): the Thursday calendar, the start bar and the booking request.
// The calendar shows Jay's Thursday at Brea: classes at 6 AM and 6 PM, booked hours from his current
// clients, everything else open. Until live availability ships (wave F3), the open hours are a
// request: Jay confirms each one by email. The request goes to lead-intake as a "train" lead.
import { $, $$ } from './util.js';
import { track } from './track.js';

const ENDPOINT = 'https://cedunmyttprzgslthuyk.supabase.co/functions/v1/lead-intake';
const HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
const CLASS = new Set([6, 18]);
const BOOKED = new Set([7, 10, 13, 17]);
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ERR = {
  name: 'Add your name so I know who to write back to.',
  email: 'That email doesn\'t look right. Check it and try again.',
  other: 'That didn\'t send. Try again, or email natejmsong@gmail.com.',
  rate: 'A few too many tries. Give it a few minutes.',
  net: 'No connection. Check your signal and try again.',
};

const fmt = (h) => (h % 12 || 12) + ':00 ' + (h < 12 ? 'AM' : 'PM');
const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const label = (d, h) => 'Thu ' + MON[d.getMonth()] + ' ' + d.getDate() + ' · ' + fmt(h);

// The next four Thursdays, counted from today in the visitor's clock. A Thursday whose hours have
// all passed is skipped.
function thursdays(now = new Date()) {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  while (d.getDay() !== 4 || (iso(d) === iso(now) && now.getHours() >= HOURS[HOURS.length - 1])) d.setDate(d.getDate() + 1);
  const out = [];
  for (let i = 0; i < 4; i++) { out.push(new Date(d)); d.setDate(d.getDate() + 7); }
  return out;
}

function mountCalendar(form) {
  const cal = $('[data-nf-cal]');
  if (!cal) return;
  const days = $('[data-nf-days]', cal), slots = $('[data-nf-slots]', cal), pick = $('[data-nf-pick]', cal), go = $('[data-nf-go]', cal);
  const bar = $('[data-nf-bar]'), barGo = $('[data-nf-bar-go]');
  const th = thursdays();
  const now = new Date();
  let day = 0, hour = null;

  days.innerHTML = th.map((x, i) => '<button type="button" class="nf-day" aria-pressed="' + (i === 0) + '" data-i="' + i + '"><small>Thu</small><b>' + x.getDate() + '</b><small>' + MON[x.getMonth()] + '</small></button>').join('');
  const drawSlots = () => {
    const today = iso(th[day]) === iso(now);
    slots.innerHTML = HOURS.map((h) => {
      const c = CLASS.has(h), b = BOOKED.has(h), past = today && h <= now.getHours();
      const off = c || b || past;
      return '<li><button type="button" class="nf-slot' + (c ? ' is-class' : '') + '" data-h="' + h + '" aria-pressed="' + (h === hour) + '"' + (off ? ' disabled' : '') + '>' + fmt(h) + '<em>' + (c ? 'Class' : b ? 'Booked' : past ? 'Past' : 'Open') + '</em></button></li>';
    }).join('');
  };
  const render = () => {
    if (hour === null) {
      pick.innerHTML = '<b>Pick an open hour</b>Times are Pacific. I confirm every booking by email.';
      go.setAttribute('href', '/fitness/book');
      return;
    }
    const d = th[day], when = label(d, hour);
    const q = 'slot=' + iso(d) + 'T' + String(hour).padStart(2, '0');
    pick.innerHTML = '<b>' + when + '</b>Brea · 60 minutes';
    go.setAttribute('href', form ? '#request' : '/fitness/book?' + q + '#request');
    if (bar) { bar.innerHTML = '<b>' + when + '</b>' + (form ? 'Finish your request below' : 'Pick a pack to book it'); barGo.setAttribute('href', form ? '#request' : '/fitness/book?' + q + '#request'); }
    if (form) setSlot(form, iso(d) + 'T' + String(hour).padStart(2, '0'), when);
  };
  drawSlots();
  days.addEventListener('click', (e) => {
    const b = e.target.closest('.nf-day');
    if (!b) return;
    day = +b.dataset.i;
    hour = null;
    $$('.nf-day', days).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    drawSlots();
    render();
  });
  slots.addEventListener('click', (e) => {
    const b = e.target.closest('.nf-slot');
    if (!b || b.disabled) return;
    hour = +b.dataset.h;
    $$('.nf-slot', slots).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    track('fit_tab', { detail: 'slot_' + hour });
    render();
  });

  // A slot passed in the link (?slot=2026-11-12T08) is picked on arrival.
  const want = new URLSearchParams(location.search).get('slot');
  const m = want && want.match(/^(\d{4}-\d{2}-\d{2})T(\d{2})$/);
  if (m) {
    const i = th.findIndex((x) => iso(x) === m[1]), h = +m[2];
    if (i >= 0 && HOURS.includes(h) && !CLASS.has(h) && !BOOKED.has(h)) {
      day = i; hour = h;
      $$('.nf-day', days).forEach((x, j) => x.setAttribute('aria-pressed', String(j === i)));
      drawSlots();
      render();
    }
  }
}

function setSlot(form, value, text) {
  form.dataset.slot = value;
  const box = $('[data-nf-slotpick]', form);
  if (box) box.innerHTML = '<span><b>' + text + '</b> · Brea. Change it in the calendar above.</span>';
  const brea = form.querySelector('input[name="location"][value="brea"]');
  if (brea) brea.checked = true;
}

function mountForm(form) {
  const q = new URLSearchParams(location.search);
  const pack = q.get('pack');
  if (pack === '2' || pack === '12') form.querySelector('input[name="pack"][value="' + pack + '-pack"]').checked = true;
  (q.get('focus') || '').split(',').slice(0, 2).forEach((id) => {
    const f = id && form.querySelector('input[name="focus"][value="' + CSS.escape(id) + '"]');
    if (f) f.checked = true;
  });
  form.dataset.entry = q.get('slot') ? 'calendar' : pack ? 'pack' : 'form';

  form.addEventListener('focusin', () => { if (!form.dataset.started) { form.dataset.started = '1'; track('book_step', { detail: 'start' }); } });
  form.addEventListener('change', (e) => { if (e.target.name === 'location') track('fit_region', { detail: e.target.value }); });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const d = Object.fromEntries(fd);
    const msg = $('#nf-msg');
    msg.className = 'nf-msg wide';
    if (!d.name || !d.name.trim()) { msg.textContent = ERR.name; form.elements.name.focus(); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test((d.email || '').trim())) { msg.textContent = ERR.email; form.elements.email.focus(); return; }
    const location_ = d.location === 'in-home' ? 'in-home' : d.location;
    const body = {
      door: 'train', name: d.name.trim(), email: d.email.trim(), phone: (d.phone || '').trim() || null,
      location: location_ || null, city: (d.city || '').trim() || null,
      message: (d.note || '').trim() || null,
      meta: {
        pack: d.pack, focus: fd.getAll('focus'), times: fd.getAll('times'),
        slot: d.location === 'brea' ? form.dataset.slot : undefined,
        first: d.first === '1' || undefined, entry: form.dataset.entry,
      },
      page: location.pathname, referrer: document.referrer || null,
      consent_marketing: d.consent_marketing === 'on', company_website: d.company_website || '',
    };
    const btn = $('#nf-send');
    btn.disabled = true; btn.textContent = 'Sending';
    try {
      const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (r.ok) {
        track('lead_sent', { business_type: 'train', detail: d.pack + ':' + fd.getAll('focus').join('+') });
        form.reset();
        delete form.dataset.slot;
        msg.classList.add('ok');
        msg.textContent = 'Got it, ' + body.name.split(/\s+/)[0] + '. Your request is pending; look for an email from me with your time and price. If it doesn\'t show up, check spam.';
      } else {
        let code = ''; try { code = (await r.json()).error || ''; } catch (_) { /* no body */ }
        msg.textContent = r.status === 429 ? ERR.rate : code === 'invalid_email' ? ERR.email : code === 'name_required' ? ERR.name : ERR.other;
      }
    } catch (_) { msg.textContent = ERR.net; }
    btn.disabled = false; btn.textContent = 'Send my request';
  });
}


// Focus picker: up to two focus areas. Picking a third drops the oldest. The choice rides along to
// /fitness/book as ?focus=a,b. Cards reveal as they scroll in; icons animate only while visible.
const FOCUS_MAX = 2;
function mountFocus() {
  const list = $('[data-nf-focus]');
  if (!list) return;
  const sum = $('[data-nf-fsum]'), go = $('[data-nf-fgo]'), bar = $('[data-nf-bar]'), barGo = $('[data-nf-bar-go]');
  const picked = [];
  const name = (id) => $('.nf-fbtn[data-focus="' + id + '"] b', list).textContent;
  const render = () => {
    $$('.nf-fbtn', list).forEach((b) => b.setAttribute('aria-pressed', String(picked.includes(b.dataset.focus))));
    const href = '/fitness/book?pack=12' + (picked.length ? '&focus=' + picked.join(',') : '');
    go.setAttribute('href', href);
    if (!picked.length) { sum.innerHTML = '<b>Pick up to two</b>Tap a card to add it to your plan.'; return; }
    const text = picked.map(name).join(' + ');
    sum.innerHTML = '<b>' + text + '</b>Your 12-pack is built around ' + (picked.length === 1 ? 'this' : 'these') + '.';
    if (bar) { bar.innerHTML = '<b>' + text + '</b>Your 12-pack focus'; barGo.setAttribute('href', href); }
  };
  list.addEventListener('click', (e) => {
    const b = e.target.closest('.nf-fbtn');
    if (!b) return;
    const id = b.dataset.focus, i = picked.indexOf(id);
    if (i >= 0) picked.splice(i, 1);
    else { picked.push(id); if (picked.length > FOCUS_MAX) picked.shift(); track('goal_picked', { detail: id }); }
    render();
  });
  reveal($$('.nf-fc', list));
  list.dataset.ready = '1';
}

// Reveal once (.in), and run icon motion only while on screen (.live).
function reveal(els) {
  if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('in', 'live')); return; }
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) en.target.classList.add('in');
    en.target.classList.toggle('live', en.isIntersecting);
  }), { threshold: 0.15 });
  els.forEach((el) => io.observe(el));
}

// Stance switch: Orthodox, Southpaw, Switch. Tabs with arrow keys; the figure and text sit in fixed frames.
function mountStance() {
  $$('[data-nf-stance]').forEach((box) => {
    const tabs = $$('[role="tab"]', box);
    const show = (t, focus) => {
      tabs.forEach((x) => { const on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; $('#' + x.getAttribute('aria-controls')).hidden = !on; });
      box.dataset.st = t.dataset.st;
      if (focus) t.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => { show(t); track('fit_tab', { detail: 'stance_' + t.dataset.st }); });
      t.addEventListener('keydown', (e) => { const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (d) { e.preventDefault(); show(tabs[(i + d + tabs.length) % tabs.length], true); } });
    });
  });
  reveal($$('.nf-tile'));
}

// Video embeds load the YouTube player only when tapped (privacy-enhanced domain).
function mountVideos() {
  $$('[data-nf-video]').forEach((b) => b.addEventListener('click', () => {
    const id = b.dataset.nfVideo;
    if (!/^[\w-]{11}$/.test(id)) return;
    const f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
    f.title = b.getAttribute('aria-label') || 'Video';
    f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
    f.allowFullscreen = true;
    b.replaceWith(f);
    track('fit_tab', { detail: 'video_' + id });
  }));
}

export function mountFitness() {
  if (document.body.dataset.mode !== 'fitness') return;
  const form = $('#nf-form');
  if (form) mountForm(form);
  mountCalendar(form);
  mountVideos();
  mountFocus();
  mountStance();
  reveal($$('.nf-art'));
}
