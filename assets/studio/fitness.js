// NJS Fitness pages (2026-11-09, v3): the Thursday calendar, the start bar and the booking request.
// The calendar shows Jay's Thursday at Brea: classes at 6 AM and 6 PM, booked hours from his current
// clients, everything else open. Until live availability ships (wave F3), the open hours are a
// request: Jay confirms each one by email. The request goes to lead-intake as a "train" lead.
import { $, $$ } from './util.js';
import { track } from './track.js';
import { GYMS, PARTS, gymMode, daySched, slotMinutes, fmtHour, slotValue } from './places.js';

const ENDPOINT = 'https://cedunmyttprzgslthuyk.supabase.co/functions/v1/lead-intake';
const HOURS = GYMS.brea.hours;
const CLASS = new Set(Object.keys(GYMS.brea.blocks).map(Number));
const BOOKED = GYMS.brea.booked;
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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
const openHours = (d, now) => HOURS.filter((h) => !CLASS.has(h) && !BOOKED.has(h) && !(iso(d) === iso(now) && h <= now.getHours())).length;
// Restart a one-shot CSS animation: drop the class, force a style pass, add it again.
const replay = (el, cls) => { el.classList.remove(cls); void el.getBoundingClientRect(); el.classList.add(cls); };
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

// The gyms with a set schedule, in the order the calendar shows them.
const CAL_LOCS = ['brea', 'rsm', 'corona'];
// The days the calendar offers for a gym, from tomorrow: the booking step takes no same-day requests, so a
// time picked here always exists there. A gym open every day shows the next seven days; 9Round shows its
// next four.
function gymDays(loc, now = new Date()) {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const want = GYMS[loc].days.length === 7 ? 7 : 4;
  const out = [];
  for (let i = 0; i < 60 && out.length < want; i++, d.setDate(d.getDate() + 1)) {
    if (gymMode(loc, d.getDay())) out.push(new Date(d));
  }
  return out;
}
const isPast = (d, h, now) => iso(d) === iso(now) && h <= now.getHours() + now.getMinutes() / 60;
function gymOpen(loc, d, now) {
  const p = daySched(loc, d.getDay());
  return p.hours.filter((h) => p.open.has(h) && !p.booked.has(h) && !isPast(d, h, now)).length;
}

// The calendar on the Fitness home: pick a gym, a day and an open time, then carry it to the booking step.
function mountCalendar(form) {
  const cal = $('[data-nf-cal]');
  if (!cal) return;
  const locs = $('[data-nf-locs]', cal), days = $('[data-nf-days]', cal), slots = $('[data-nf-slots]', cal), pick = $('[data-nf-pick]', cal), go = $('[data-nf-go]', cal);
  const bar = $('[data-nf-bar]'), barGo = $('[data-nf-bar-go]'), badge = $('[data-nf-when]', cal);
  const now = new Date();
  let loc = 'brea', list = gymDays(loc, now), day = 0, hour = null;
  const mode = () => (list[day] ? gymMode(loc, list[day].getDay()) : null);

  const drawDays = () => {
    days.innerHTML = list.map((x, i) => '<button type="button" class="nf-day" aria-pressed="' + (i === day) + '" data-i="' + i + '"><small>' + DOW[x.getDay()] + '</small><b>' + x.getDate() + '</b><small>' + MON[x.getMonth()] + '</small><small class="nf-day-n">' + (gymMode(loc, x.getDay()) === 'sched' ? gymOpen(loc, x, now) + ' open' : 'Request') + '</small></button>').join('');
    days.dataset.n = list.length;
  };
  const drawSlots = () => {
    const d = list[day];
    if (!d) { slots.innerHTML = '<li class="nf-fine" style="grid-column:1/-1">No set hours in the next weeks. <a href="/fitness/book?loc=' + GYMS[loc].slug + '">Send a request</a> and I reply with a time.</li>'; return; }
    if (mode() === 'parts') {
      // No set hours this day: the visitor asks for a part of the day and Jay replies with a time.
      slots.innerHTML = PARTS.map(([k, t]) => '<li class="nf-slot-p"><button type="button" class="nf-slot" data-part="' + k + '" aria-pressed="' + (k === hour) + '"><span><b>' + k + '</b>' + t + '</span><em>Request</em></button></li>').join('');
      return;
    }
    const p = daySched(loc, d.getDay());
    const starts = Object.keys(p.blocks).map(Number);
    const inside = (h) => starts.some((s0) => h > s0 && h < s0 + p.blocks[s0][2]);
    slots.innerHTML = p.hours.filter((h) => !inside(h)).map((h) => {
      const blk = p.blocks[h];
      if (blk) return '<li' + (blk[2] > 1 ? ' class="nf-slot-w"' : '') + '><button type="button" class="nf-slot is-class" disabled>' + (blk[2] > 1 ? fmtHour(h).replace(':00', '') + ' to ' + fmtHour(h + blk[2]).replace(':00', '') : fmtHour(h)) + '<em>Class</em></button></li>';
      const booked = p.booked.has(h), past = isPast(d, h, now), off = booked || past || !p.open.has(h);
      return '<li><button type="button" class="nf-slot" data-h="' + h + '" aria-pressed="' + (h === hour) + '"' + (off ? ' disabled' : '') + '>' + fmtHour(h) + '<em>' + (booked ? 'Booked' : past ? 'Past' : off ? 'Closed' : 'Open') + '</em></button></li>';
    }).join('');
  };
  const render = () => {
    const base = '/fitness/book?loc=' + GYMS[loc].slug;
    if (hour === null) {
      pick.innerHTML = '<b>' + (mode() === 'parts' ? 'Pick a part of the day' : 'Pick an open time') + '</b>Times are Pacific. I confirm every booking by email.';
      go.setAttribute('href', form ? '#book' : base);
      return;
    }
    const d = list[day], part = typeof hour === 'string';
    const when = DOW[d.getDay()] + ' ' + MON[d.getMonth()] + ' ' + d.getDate() + ' · ' + (part ? hour.toLowerCase() : fmtHour(hour));
    const href = form ? '#book' : base + (part ? '&day=' + iso(d) + '&part=' + hour.toLowerCase() : '&slot=' + slotValue(iso(d), hour)) + '#book';
    pick.innerHTML = '<b>' + when + '</b>' + GYMS[loc].region.split(' · ')[0] + ' · ' + (part ? 'I reply with an exact time' : slotMinutes(loc) + ' minutes');
    go.setAttribute('href', href);
    if (bar) { bar.innerHTML = '<b>' + when + '</b>' + (form ? 'Finish your request below' : 'Tap Start to book it'); barGo.setAttribute('href', href); }
    if (form && loc === 'brea' && !part) setSlot(form, slotValue(iso(d), hour), when);
  };
  const setLoc = (next) => {
    loc = next; list = gymDays(loc, now); day = 0; hour = null;
    if (locs) $$('button', locs).forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.loc === loc)));
    if (badge) badge.textContent = GYMS[loc].short;
    days.setAttribute('aria-label', 'Choose a day in ' + GYMS[loc].region.split(' · ')[0]);
    drawDays(); drawSlots(); render();
  };
  if (locs) locs.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-loc]');
    if (!b || !CAL_LOCS.includes(b.dataset.loc) || b.dataset.loc === loc) return;
    track('fit_tab', { detail: 'cal_' + b.dataset.loc });
    setLoc(b.dataset.loc);
  });
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
    hour = b.dataset.part || +b.dataset.h;
    $$('.nf-slot', slots).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    track('fit_tab', { detail: 'slot_' + String(hour).toLowerCase() });
    render();
  });
  setLoc('brea');
}

function setSlot(form, value, text) {
  form.dataset.slot = value;
  const box = $('[data-nf-slotpick]', form);
  if (box) box.innerHTML = '<span><b>' + text + '</b> · Brea. Change it in the calendar above.</span>';
  const brea = form.querySelector('input[name="location"][value="brea"]');
  if (brea) { brea.checked = true; brea.dispatchEvent(new Event('change', { bubbles: true })); }
}

function mountForm(form) {
  const q = new URLSearchParams(location.search);
  const pack = q.get('pack');
  // Where: a link can preselect the place, and the price line under the choices follows the pick.
  const loc = q.get('loc') && form.querySelector('input[name="location"][value="' + CSS.escape(q.get('loc')) + '"]');
  if (loc) loc.checked = true;
  const line = $('[data-nf-priceline]', form);
  const price = () => { const c = form.querySelector('input[name="location"]:checked'); if (line && c && c.dataset.price) line.textContent = c.dataset.price; };
  form.addEventListener('change', (e) => { if (e.target.name === 'location') price(); });
  price();
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
  const sum = $('[data-nf-fsum]'), go = $('[data-nf-fgo]'), fbar = $('[data-nf-fbar]'), bar = $('[data-nf-bar]'), barGo = $('[data-nf-bar-go]');
  const picked = [];
  const name = (id) => $('.nf-fbtn[data-focus="' + id + '"] b', list).textContent;
  // The small wheel in the plan bar: each pick fills its pillar, and the line names one still open.
  const dots = $$('[data-nf-mini] circle');
  const NEXT = ['mobility', 'engine', 'strength', 'control', 'skill'];
  const wheel = (ids) => {
    const full = new Set(), part = new Set();
    ids.forEach((id) => ($('.nf-fbtn[data-focus="' + id + '"]', list).dataset.p || '').split(' ').forEach((p, i) => p && (i ? part : full).add(p)));
    dots.forEach((d) => { d.classList.toggle('on', full.has(d.dataset.pl)); d.classList.toggle('half', !full.has(d.dataset.pl) && part.has(d.dataset.pl)); });
    if (!dots.length || !full.size) return '';
    const label = (p) => dots.find((d) => d.dataset.pl === p).dataset.name;
    const open = NEXT.find((p) => !full.has(p) && !part.has(p));
    return 'Builds ' + [...full].map(label).join(' and ').toLowerCase() + '.' + (open ? ' Add ' + label(open).toLowerCase() + ' later to round it out.' : '');
  };
  const render = () => {
    $$('.nf-fbtn', list).forEach((b) => b.setAttribute('aria-pressed', String(picked.includes(b.dataset.focus))));
    const href = '/fitness/book?pack=12' + (picked.length ? '&focus=' + picked.join(',') : '');
    go.setAttribute('href', href);
    if (fbar) fbar.dataset.n = picked.length;
    if (!picked.length) { wheel(picked); sum.innerHTML = '<b>Pick up to two</b>Tap a card to add it to your plan.'; return; }
    const text = picked.map(name).join(' + ');
    sum.innerHTML = '<b>' + text + '</b>' + (wheel(picked) || 'Your 12-pack is built around ' + (picked.length === 1 ? 'this' : 'these') + '.');
    if (bar) { bar.innerHTML = '<b>' + text + '</b>Your 12-pack focus'; barGo.setAttribute('href', href); }
  };
  list.addEventListener('click', (e) => {
    const b = e.target.closest('.nf-fbtn');
    if (!b) return;
    const id = b.dataset.focus, i = picked.indexOf(id);
    if (i >= 0) picked.splice(i, 1);
    else { picked.push(id); if (picked.length > FOCUS_MAX) picked.shift(); replay(b, 'burst'); track('goal_picked', { detail: id }); }
    render();
  });
  // A soft light follows the pointer across each card.
  list.addEventListener('pointermove', (e) => {
    const b = e.target.closest('.nf-fbtn');
    if (!b || e.pointerType === 'touch') return;
    const r = b.getBoundingClientRect();
    b.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    b.style.setProperty('--my', (e.clientY - r.top) + 'px');
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

// Hero: hit the bag. Each tap throws a jab or a cross and lights one of twelve pips, two a week for
// six weeks, so the visitor counts out the 12-pack with their own hand. The idle loop yields while
// they play and comes back after seven quiet seconds. Everything moves inside a fixed frame.
function mountCombo() {
  const fig = $('[data-nf-combo]');
  if (!fig) return;
  const tap = $('[data-nf-combo-tap]', fig), pill = $('[data-nf-combo-pill]', fig), call = $('[data-nf-combo-call]', fig), live = $('[data-nf-combo-live]', fig);
  const pips = $$('[data-nf-combo-pips] rect', fig);
  const cta = $('.nf-hero .nf-btn.nf-ink');
  let n = 0, idle = 0, tracked = false;
  tap.addEventListener('click', () => {
    if (n >= 12) { n = 0; fig.classList.remove('done'); pips.forEach((p) => p.classList.remove('on', 'pop')); }
    n++;
    const cross = n % 2 === 0;
    fig.classList.add('used');
    fig.classList.remove('pa', 'pb');
    replay(fig, cross ? 'pb' : 'pa');
    pips[n - 1].classList.add('on');
    replay(pips[n - 1], 'pop');
    call.textContent = n === 12 ? '12 of 12' : cross ? 'Cross' : 'Jab';
    replay(call, 'go');
    pill.innerHTML = n === 12 ? 'That\'s the 12-pack' : '<b>' + n + '</b>/12 · week ' + Math.ceil(n / 2);
    if (n === 12) {
      fig.classList.add('done');
      if (cta) replay(cta, 'nf-wake');
      live.textContent = 'Twelve punches. That is the 12-pack: two sessions a week for six weeks.';
      track('fit_tab', { detail: 'hero_12' });
    } else if (!tracked) { tracked = true; track('fit_tab', { detail: 'hero_combo' }); }
    clearTimeout(idle);
    idle = setTimeout(() => fig.classList.remove('used', 'pa', 'pb'), 7000);
  });
}

// The hero line counts the open hours on the next Thursday from the same data as the calendar.
function mountOpen() {
  const el = $('[data-nf-open] span');
  if (!el) return;
  const now = new Date(), d = thursdays(now)[0], n = openHours(d, now);
  if (n) el.innerHTML = '<b>' + n + ' open hour' + (n === 1 ? '' : 's') + '</b> · Thu ' + MON[d.getMonth()] + ' ' + d.getDate() + ' in Brea';
}

// A press ripple that starts where the button was touched.
function mountRipple() {
  document.addEventListener('pointerdown', (e) => {
    const b = e.target.closest && e.target.closest('.nf-btn');
    if (!b) return;
    const r = b.getBoundingClientRect();
    b.style.setProperty('--rx', (e.clientX - r.left) + 'px');
    b.style.setProperty('--ry', (e.clientY - r.top) + 'px');
    replay(b, 'rip');
  });
}

// Focus pages: the wheel names a pillar when you point at it, and the ladder marks where you are.
function mountPath() {
  $$('[data-nf-wheel]').forEach((fig) => {
    const cap = $('[data-nf-whcap]', fig), base = cap.textContent;
    const show = (e) => { const n = e.target.closest('[data-wh-line]'); if (n) cap.textContent = n.dataset.whLine; };
    fig.addEventListener('pointerover', show);
    fig.addEventListener('focusin', show);
    fig.addEventListener('pointerleave', () => { cap.textContent = base; });
    fig.addEventListener('focusout', () => { cap.textContent = base; });
    fig.addEventListener('click', (e) => { if (e.target.closest('a')) track('fit_tab', { detail: 'wheel' }); });
  });
  $$('[data-nf-ladder]').forEach((list) => {
    const msg = $('[data-nf-lvmsg]'), items = $$('li', list);
    list.addEventListener('click', (e) => {
      const b = e.target.closest('.nf-lv');
      if (!b) return;
      const n = +b.dataset.lv;
      items.forEach((li, i) => { li.classList.toggle('done', i < n); $('.nf-lv', li).setAttribute('aria-pressed', String(i === n - 1)); });
      msg.textContent = n === 1 ? 'Starting fresh? Your first 12-pack is built to reach level 1.' : 'Already at level ' + n + '? Say so in the note when you book, and we start from there.';
      track('fit_tab', { detail: 'level_' + n });
    });
    reveal(items);
    list.dataset.ready = '1';
  });
  reveal($$('.nf-hc'));
  reveal($$('.nf-pathc'));
  // Gear links: count which item was opened (no personal data, same event as other fitness taps).
  document.addEventListener('click', (e) => { const g = e.target.closest && e.target.closest('[data-nf-gear]'); if (g) track('fit_tab', { detail: 'gear_' + g.dataset.nfGear }); });
}

// 12-pack pace: once or twice a week. Swaps the card copy and pips, and carries ?pace= into every
// booking link in the packs section so the booking page opens with the same choice.
function mountPace() {
  const box = document.querySelector('.nf-pace'); if (!box) return;
  const sec = box.closest('section');
  const set = (v) => {
    box.dataset.pace = v;
    sec.querySelectorAll('.nf-pips').forEach((e) => { e.dataset.pace = v; });
    sec.querySelectorAll('[data-pace-p]').forEach((e) => { e.hidden = e.dataset.paceP !== v; });
    const tag = sec.querySelector('[data-pace-tag]'); if (tag) tag.textContent = v === '1' ? 'Twelve weeks' : 'Six weeks';
    sec.querySelectorAll('a[href*="/fitness/book"]').forEach((a) => { const u = new URL(a.getAttribute('href'), location.origin); u.searchParams.set('pace', v); a.setAttribute('href', u.pathname + u.search + u.hash); });
  };
  box.addEventListener('change', (e) => { if (e.target.name !== 'nf-pace') return; set(e.target.value); track('fit_tab', { detail: 'pace_' + e.target.value + 'x' }); });
}

export function mountFitness() {
  mountPace();
  if (document.body.dataset.mode !== 'fitness') return;
  const form = $('#nf-form');
  if (form) mountForm(form);
  mountCalendar(form);
  mountVideos();
  mountFocus();
  mountStance();
  mountCombo();
  mountOpen();
  mountRipple();
  reveal($$('.nf-art'));
  reveal($$('.nf-pairc'));
  mountPath();
  // Focus page mark: a click stamps the tile and sends out a ring.
  $$('[data-nf-fart]').forEach((f) => f.addEventListener('click', () => replay(f, 'hit')));
}
