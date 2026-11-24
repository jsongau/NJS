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

// Gym guides: region filter. Rows below the buttons hide; nothing above the click moves.
function mountRank() {
  $$('[data-nf-rk]').forEach((box) => {
    const btns = $$('[data-rk-f]', box);
    box.addEventListener('click', (e) => {
      const b = e.target.closest('[data-rk-f]'); if (!b) return;
      const v = b.dataset.rkF;
      btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      $$('[data-region]', box).forEach((r) => { r.hidden = v !== 'all' && r.dataset.region !== v; });
      track('fit_tab', { detail: 'guide_' + v.toLowerCase() });
    });
  });
}

// Near me: a filter tree, a distance sort and a map. The position is used here and nowhere else:
// it is never sent, stored or tracked. Leaflet loads only when the map is first shown.
const LEAFLET = '/assets/vendor/leaflet/leaflet';
let leafletReady;
function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (!leafletReady) leafletReady = new Promise((resolve, reject) => {
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = LEAFLET + '.css'; document.head.appendChild(css);
    const js = document.createElement('script'); js.src = LEAFLET + '.js'; js.onload = () => resolve(window.L); js.onerror = reject; document.head.appendChild(js);
  });
  return leafletReady;
}
// A rough Southern California coastline, drawn under the street tiles so the map still reads if tiles are slow.
const COAST = [[34.6, -120.6], [34.45, -120.45], [34.4, -119.7], [34.27, -119.3], [34.1, -119.1], [34.03, -118.78], [34.01, -118.5], [33.85, -118.4], [33.74, -118.41], [33.71, -118.28], [33.75, -118.19], [33.72, -118.08], [33.65, -118.0], [33.6, -117.9], [33.54, -117.78], [33.46, -117.7], [33.42, -117.61], [33.2, -117.39], [32.9, -117.26], [32.7, -117.25], [32.53, -117.12]];
const REGION_BOX = { LA: [[33.7, -118.7], [34.3, -117.75]], OC: [[33.4, -118.1], [33.95, -117.5]], IE: [[33.45, -117.75], [34.2, -116.85]] };
const RINGS = [2, 5, 10];
const PLACE_NAMES = [['Los Angeles', 34.06, -118.25], ['Orange County', 33.72, -117.83], ['Inland Empire', 33.98, -117.4], ['San Fernando Valley', 34.22, -118.47], ['Temecula Valley', 33.5, -117.1], ['Pacific Ocean', 33.55, -118.35]];

function mountNear() {
  const box = $('[data-nf-near]'); if (!box) return;
  const list = $('[data-nr-list]', box); const rows = $$('li', list); const status = $('[data-nr-status]', box);
  const split = $('[data-nr-split]', box); const mapEl = $('[data-nr-map]', box); const cards = $('[data-nr-cards]', box);
  const panel = $('[data-nr-panel]', box); const shade = $('[data-nr-shade]', box); const sortSel = $('[data-nr-sort]', box);
  const distIn = $('[data-nr-dist]', box); const distOut = $('[data-nr-distout]', box);
  const icons = {}; const tpl = $('[data-nr-icons]', box);
  if (tpl) $$('[data-k]', tpl.content).forEach((s) => { icons[s.dataset.k] = s.innerHTML; });
  const MILES = [null, 1, 2, 3, 4, 5, 10, 15, 20, 25, 30];
  const st = { top: 'all', kinds: new Set(), regs: new Set(), brands: new Set(), max: null, sort: 'near', at: null, from: '', map: null, L: null, you: null, sel: null, limit: 20 };
  const STEP = 20; const more = $('[data-nr-more]', box);
  // Three home gyms (where Jay coaches). Each has an avatar pin no filter hides. Picking one makes it the
  // centre: distances, rings and spokes all start from it, so the rest of the map reads as what surrounds it.
  const homesBox = $('[data-nr-homes]', box); const mine = homesBox ? $$('.nf-nr-home', homesBox) : [];
  const homeSum = homesBox && $('[data-nr-home-sum]', homesBox); const homeSum0 = homeSum ? homeSum.textContent : '';
  const minePos = (g) => [Number(g.dataset.lat), Number(g.dataset.lng)];
  const SPOKE = { strike: '#E0563A', pilates: '#1F8A7A', yoga: '#7A5AE0', run: '#B8730A' };
  const PILLAR = [['yoga', 'mobility'], ['pilates', 'control'], ['run', 'engine'], ['strike', 'skill']];
  const mineHtml = (g) => '<p class="nf-pop-k">Home gym · I coach here</p><p class="nf-pop-n">' + g.dataset.name + '</p><p class="nf-pop-w">' + g.dataset.city + ' · ' + g.dataset.short + '</p>' +
    '<p class="nf-pop-l"><a class="nf-pop-go" href="/fitness/book?loc=' + g.dataset.slug + '">Book here</a><button type="button" data-nr-home-pin="' + g.dataset.slug + '">Measure from here</button><a href="' + g.dataset.nav + '" target="_blank" rel="noopener">Navigate</a></p>';
  const drawHomes = () => {
    if (!mine.length) return;
    mine.forEach((g) => {
      const on = g === st.home; $('[data-nr-home]', g).setAttribute('aria-pressed', String(on)); g.classList.toggle('on', on);
      if (g.pin && g.pin.getElement()) g.pin.getElement().classList.toggle('home', on);
      const d = $('[data-nr-home-d]', g); const far = st.at && !st.home ? miles(st.at, minePos(g)) : null;
      d.textContent = on ? 'Centre of the map' : far !== null ? (far < 10 ? far.toFixed(1) : Math.round(far)) + ' miles from ' + (st.from === 'you' ? 'you' : st.from) : '';
    });
    const closest = st.at && !st.home ? mine.slice().sort((x, y) => miles(st.at, minePos(x)) - miles(st.at, minePos(y)))[0] : null;
    mine.forEach((g) => g.classList.toggle('closest', g === closest));
    if (!homeSum) return;
    if (!st.home) { homeSum.textContent = closest ? closest.dataset.name + ' is my closest gym to ' + (st.from === 'you' ? 'you' : st.from) + '. Pick it to see what sits around it.' : homeSum0; return; }
    const vis = shown(); const parts = PILLAR.map(([top, w]) => [vis.filter((r) => r.dataset.top === top).length, w]).filter(([n]) => n);
    homeSum.textContent = parts.length ? 'Around ' + st.home.dataset.name + (st.max ? ', within ' + st.max + ' miles' : '') + ': ' + parts.map(([n, w]) => n + ' for ' + w).join(', ') + '.' : 'Nothing matches around ' + st.home.dataset.name + '. Loosen a filter.';
  };
  const syncDist = () => {
    const i = Math.max(0, MILES.indexOf(st.max)); distIn.value = i;
    distOut.textContent = st.max === null ? 'any distance' : st.max + (st.max === 1 ? ' mile' : ' miles');
    const note = $('[data-nr-distnote]', box); if (note) note.textContent = st.at ? 'of ' + (st.from === 'you' ? 'you' : st.from) : 'Pick a spot first.';
    $$('[data-nr-mi]', box).forEach((bt) => bt.setAttribute('aria-pressed', String(Number(bt.dataset.nrMi) === i)));
    const ruler = $('[data-nr-ruler]', box); const bub = $('[data-nr-bub]', box);
    if (ruler) ruler.style.setProperty('--p', String(i / (MILES.length - 1)));
    if (bub) { const txt = st.max === null ? 'Any' : st.max + ' mi'; if (bub.textContent !== txt) { bub.textContent = txt; replay(bub, 'pop'); } }
  };
  // Drop a pin: the next click on the map becomes the spot.
  const arm = (on) => { st.dropping = on; $$('[data-nr-drop]', box).forEach((bt) => bt.setAttribute('aria-pressed', String(on))); mapEl.classList.toggle('dropping', on); };
  // Expanded map: the controls become a side column and the map takes the rest of the screen. On phones the map
  // takes the whole screen and the distance control moves in with it.
  const distBox = $('[data-nr-distbox]', box); const tilesBox = $('.nf-nr-tiles', box); const fullBar = $('[data-nr-fullbar]', box);
  const distHome = document.createComment('distance'); const tilesHome = document.createComment('tiles');
  const full = (on) => {
    box.classList.toggle('full', on); document.documentElement.classList.toggle('nf-lock', on);
    $$('[data-nr-full]', box).forEach((bt) => { bt.setAttribute('aria-pressed', String(on)); $('span', bt).textContent = on ? 'Close' : 'Expand'; });
    if (on) { distBox.before(distHome); tilesBox.before(tilesHome); fullBar.append(tilesBox, distBox); if (!wide()) setView('map', false); }
    else { if (distHome.parentNode) distHome.replaceWith(distBox); if (tilesHome.parentNode) tilesHome.replaceWith(tilesBox); }
    startMap().then(() => { if (st.map) { st.map.invalidateSize(); if (on) st.map.scrollWheelZoom.enable(); syncMap(true); } });
  };
  const setHome = (g) => {
    st.home = g === st.home ? null : g; st.spot = st.home ? 'home' : null;
    const sel = $('[data-nr-city]', box); if (sel) sel.value = '';
    const note = $('[data-nr-distnote]', box);
    if (st.home) { st.at = minePos(g); st.from = g.dataset.name; distIn.disabled = false; if (st.max === null) { st.max = 10; distIn.value = MILES.indexOf(10); } if (note) note.textContent = 'Measured from ' + st.from + ', in a straight line.'; }
    else { st.at = null; st.from = ''; st.max = null; distIn.value = 0; distIn.disabled = false; distOut.textContent = 'Any distance'; if (note) note.textContent = 'Share your location or pick an area to use this.'; rows.forEach((r) => { r.dist = Infinity; $('.nf-nr-d b', r).textContent = r.dataset.region; $('.nf-nr-d small', r).textContent = ''; r.classList.remove('near'); }); }
  };
  const wide = () => matchMedia('(min-width: 1024px)').matches;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // A short tap you can feel, on phones that support it (Android; iPhones ignore it).
  const buzz = (ms) => { try { if (navigator.vibrate) navigator.vibrate(ms || 8); } catch (e) { /* not supported */ } };
  const rad = (d) => (d * Math.PI) / 180;
  const miles = (p1, p2) => {
    const dLat = rad(p2[0] - p1[0]); const dLng = rad(p2[1] - p1[1]);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(p1[0])) * Math.cos(rad(p2[0])) * Math.sin(dLng / 2) ** 2;
    return 3958.8 * 2 * Math.asin(Math.sqrt(h));
  };
  const pos = (r) => [Number(r.dataset.lat), Number(r.dataset.lng)];
  const shown = () => $$('li', list).filter((r) => !r.hidden);
  const fmt = (d) => (d < 10 ? d.toFixed(1) : String(Math.round(d)));
  const nameOf = (r) => $('h3', r).textContent;
  const awayOf = (r) => (st.at && r.dist < Infinity ? fmt(r.dist) + ' miles away' : '');

  const cardHtml = (r) => {
    const more = $('.nf-rk-links a[href^="/fitness/guides/gyms/"]', r);
    return '<p class="nf-pop-k">' + $('.nf-nr-cat span', r).textContent + '</p><p class="nf-pop-n">' + nameOf(r) + '</p><p class="nf-pop-w">' + $('.nf-nr-where', r).textContent + (awayOf(r) ? ' · ' + awayOf(r) : '') + '</p>' +
      (r.dataset.addr ? '<p class="nf-pop-a"><a href="' + r.dataset.nav + '" target="_blank" rel="noopener">' + r.dataset.addr + '</a></p>' : '') +
      '<p class="nf-pop-l"><a class="nf-pop-go" href="' + r.dataset.nav + '" target="_blank" rel="noopener">Navigate</a>' + (more ? '<a href="' + more.getAttribute('href') + '">Full profile</a>' : '') + '</p>';
  };
  const drawRoute = (r) => {
    if (!st.map) return; if (st.route) { st.map.removeLayer(st.route); st.route = null; }
    if (!r || !st.at || !r.pin) return;
    st.route = st.L.polyline([st.at, pos(r)], { color: '#E0563A', weight: 3, dashArray: '6 9', className: 'nf-route', interactive: false }).addTo(st.map);
  };
  const select = (r, scroll) => {
    st.sel = r;
    rows.forEach((x) => { x.classList.toggle('on', x === r); if (x.pin && x.pin.getElement()) x.pin.getElement().classList.toggle('sel', x === r); });
    drawRoute(r);
    if (r) r.classList.remove('nf-nr-cut');
    if (scroll && r && wide()) r.scrollIntoView({ block: 'nearest', behavior: calm ? 'auto' : 'smooth' });
  };
  const drawRings = () => {
    if (!st.map || !st.at) return; const L = st.L;
    if (st.rings) st.map.removeLayer(st.rings); st.rings = L.layerGroup().addTo(st.map);
    (st.max ? [st.max] : RINGS).forEach((mi) => {
      L.circle(st.at, { radius: mi * 1609.34, color: '#1B6FE8', weight: 1.5, opacity: 0.55, dashArray: '4 7', fill: st.max ? true : mi === RINGS[0], fillColor: '#1B6FE8', fillOpacity: 0.05, interactive: false }).addTo(st.rings);
      L.marker([st.at[0] + mi / 69.05, st.at[1]], { interactive: false, keyboard: false, icon: L.divIcon({ className: 'nf-ringname', html: mi + ' mi', iconSize: [48, 16], iconAnchor: [24, 8] }) }).addTo(st.rings);
    });
  };
  const inView = () => {
    const out = $('[data-nr-inview]', box); if (!out || !st.map) return;
    const bb = st.map.getBounds(); out.textContent = shown().filter((r) => r.pin && bb.contains(pos(r))).length + ' on screen';
  };
  // Phones: a swipeable strip of cards under the map. Swiping moves the map; tapping a pin moves the strip.
  const fillCards = () => {
    if (!cards) return; const vis = shown().filter((r) => r.dataset.lat).slice(0, 40);
    cards.innerHTML = vis.map((r, i) => '<article class="nf-nr-card" data-i="' + i + '">' + cardHtml(r) + '</article>').join('');
    cards.rows = vis; cards.scrollLeft = 0;
  };
  const cardTo = (r) => { if (!cards || !cards.rows) return; const i = cards.rows.indexOf(r); const el = i >= 0 && cards.children[i]; if (el) { cards.lock = true; el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: calm ? 'auto' : 'smooth' }); setTimeout(() => { cards.lock = false; }, 600); } };
  const flyToRow = (r, openPopup) => {
    if (!st.map || !r || !r.pin) return; st.map.invalidateSize(); select(r, false);
    if (openPopup && wide()) st.map.once('moveend', () => r.pin.openPopup());
    st.map.flyTo(pos(r), Math.max(st.map.getZoom(), 13), { duration: 0.8 });
  };
  const syncMap = (fit) => {
    if (!st.map) return; const L = st.L; const vis = shown().filter((r) => r.pin);
    rows.forEach((r) => { if (!r.pin) return; if (r.hidden) st.map.removeLayer(r.pin); else r.pin.addTo(st.map); });
    const near = st.at ? vis.slice().sort((x, y) => x.dist - y.dist)[0] : null;
    rows.forEach((r) => { if (r.pin && r.pin.getElement()) r.pin.getElement().classList.toggle('nearest', r === near); });
    // Spokes: from the chosen home gym out to what sits around it, coloured by what each place adds.
    if (st.spokes) { st.map.removeLayer(st.spokes); st.spokes = null; }
    if (st.home) {
      st.spokes = L.layerGroup().addTo(st.map); const reach = st.max || 10;
      vis.filter((r) => r.dist <= reach).sort((x, y) => x.dist - y.dist).slice(0, 40).forEach((r) => L.polyline([st.at, pos(r)], { color: SPOKE[r.dataset.top] || '#121416', weight: 1.6, opacity: 0.55, dashArray: '3 7', className: 'nf-spoke', interactive: false }).addTo(st.spokes));
    }
    if (st.you) st.you.setOpacity(st.spot === 'home' || st.spot === 'pin' ? 0 : 1);
    if (st.spot === 'pin' && st.at) {
      if (!st.drop) { st.drop = L.marker(st.at, { draggable: true, autoPan: true, zIndexOffset: 950, title: 'Your pin. Drag to move it.', icon: L.divIcon({ className: 'nf-droppin', html: '<span></span>', iconSize: [30, 40], iconAnchor: [15, 38] }) }).addTo(st.map);
        st.drop.on('dragend', () => { const p = st.drop.getLatLng(); track('fit_tab', { detail: 'near_pin_drag' }); located([p.lat, p.lng], 'your pin', 'pin'); }); }
      else { st.drop.setLatLng(st.at); if (!st.map.hasLayer(st.drop)) st.drop.addTo(st.map); }
    } else if (st.drop && st.map.hasLayer(st.drop)) st.map.removeLayer(st.drop);
    if (st.at) {
      if (!st.you) st.you = L.marker(st.at, { opacity: st.spot === 'home' || st.spot === 'pin' ? 0 : 1, icon: L.divIcon({ className: 'nf-you', html: '<i></i>', iconSize: [22, 22], iconAnchor: [11, 11] }), interactive: false, keyboard: false, zIndexOffset: 900 }).addTo(st.map);
      else st.you.setLatLng(st.at);
      drawRings();
    }
    inView();
    if (!fit || !vis.length) return;
    if (st.at && st.max) { st.map.flyToBounds(L.latLng(st.at).toBounds(st.max * 1609.34 * 2.15), { padding: [16, 16], maxZoom: 14, duration: 0.8 }); return; }
    const pts = st.at ? [st.at, ...vis.slice().sort((x, y) => x.dist - y.dist).slice(0, 6).map(pos)] : vis.map(pos);
    st.map.flyToBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 13, duration: 0.8 });
  };
  const startMap = () => {
    if (st.ready) return st.ready;
    st.ready = loadLeaflet().then((L) => {
      st.L = L; const map = L.map(mapEl, { zoomControl: false, scrollWheelZoom: false, attributionControl: true, minZoom: 8, maxZoom: 17 }).setView([33.9, -117.85], 9);
      map.attributionControl.setPrefix(false);
      if (calm) { map.flyTo = (c, z) => map.setView(c, z, { animate: false }); map.flyToBounds = (bb, opt) => map.fitBounds(bb, Object.assign({}, opt, { animate: false })); }
      L.control.zoom({ position: 'topright' }).addTo(map);
      map.createPane('base').style.zIndex = 100; map.createPane('names').style.zIndex = 110;
      L.polygon([...COAST, [32.53, -114.4], [35.6, -114.4], [35.6, -120.6]], { pane: 'base', renderer: L.svg({ pane: 'base' }), stroke: false, fillColor: '#F1EBE2', fillOpacity: 1, interactive: false }).addTo(map);
      PLACE_NAMES.forEach(([n, la, ln]) => L.marker([la, ln], { pane: 'names', interactive: false, keyboard: false, icon: L.divIcon({ className: 'nf-mapname', html: n, iconSize: [160, 16], iconAnchor: [80, 8] }) }).addTo(map));
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors' }).addTo(map);
      map.on('click', (e) => {
        map.scrollWheelZoom.enable();
        if (!st.dropping) return;
        arm(false); buzz(14); track('fit_tab', { detail: 'near_pin_drop' }); located([e.latlng.lat, e.latlng.lng], 'your pin', 'pin');
      });
      map.on('moveend zoomend', inView);
      map.on('popupclose', () => select(null, false));
      rows.forEach((r) => {
        if (!r.dataset.lat) return;
        r.pin = L.marker(pos(r), { title: nameOf(r), riseOnHover: true, icon: L.divIcon(r.dataset.mono
          ? { className: 'nf-pin nf-pin-chain nf-pin-' + r.dataset.top, html: '<span><b>' + r.dataset.mono + '</b></span><i>' + (icons[r.dataset.ic] || '') + '</i>', iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -18] }
          : { className: 'nf-pin nf-pin-' + r.dataset.top, html: '<span>' + (icons[r.dataset.ic] || icons.pin || '') + '</span>', iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -16] }) });
        r.pin.bindTooltip(nameOf(r), { direction: 'top', offset: [0, -20], className: 'nf-tip' });
        r.pin.on('click', () => {
          buzz(10); select(r, true); track('fit_tab', { detail: 'near_pin' });
          if (wide() || box.classList.contains('full')) { r.pin.unbindPopup(); r.pin.bindPopup('<div class="nf-pop">' + cardHtml(r) + '</div>', { maxWidth: 270, minWidth: 210, autoPanPadding: [24, 70] }).openPopup(); r.pin.closeTooltip(); }
          else cardTo(r);
        });
      });
      // The three home gyms: a triangle between them, and an avatar pin with its name on each.
      if (mine.length === 3) L.polygon(mine.map(minePos), { color: '#FF8A6B', weight: 2, opacity: 0.9, dashArray: '2 8', fillColor: '#FF8A6B', fillOpacity: 0.05, interactive: false, className: 'nf-tri' }).addTo(map);
      mine.forEach((g) => {
        // The pin carries the same emblem as the card (with its own clip id, so the two never collide).
        const art = $('.nf-gx', g); const id = art ? art.dataset.gx : ''; const face = art ? art.outerHTML.split(id).join(id + '-pin') : '';
        g.pin = L.marker(minePos(g), { title: 'Home gym: ' + g.dataset.name, zIndexOffset: 800, riseOnHover: true, icon: L.divIcon({ className: 'nf-pin nf-pin-coach', html: '<i style="border-color:' + g.dataset.hg + '"></i><span>' + face + '</span><em style="--hg:' + g.dataset.hg + '">' + g.dataset.name + '</em>', iconSize: [64, 64], iconAnchor: [32, 32], popupAnchor: [0, -32] }) }).addTo(map);
        g.pin.bindPopup('<div class="nf-pop nf-pop-coach">' + mineHtml(g) + '</div>', { maxWidth: 270, minWidth: 210, autoPanPadding: [24, 70] });
        g.pin.on('click', () => { buzz(10); track('fit_tab', { detail: 'near_home_pin' }); });
      });
      st.map = map; syncMap(true);
    }).catch(() => { mapEl.innerHTML = '<p class="nf-nr-maperr">The map could not load. The list below still works.</p>'; });
    return st.ready;
  };

  const draw = (fit, keep) => {
    if (!keep) st.limit = STEP;
    if (st.at) rows.forEach((r) => {
      const has = !!r.dataset.lat; r.dist = has ? miles(st.at, pos(r)) : Infinity;
      $('.nf-nr-d b', r).textContent = has ? fmt(r.dist) : r.dataset.region;
      $('.nf-nr-d small', r).textContent = has ? 'miles' : 'no address';
      r.classList.toggle('near', has && r.dist <= 5);
    });
    let count = 0;
    rows.forEach((r) => {
      const c = r.dataset.cat.split(' ');
      const ok = (st.top === 'all' || c.includes(st.top)) && (!st.kinds.size || [...st.kinds].some((k) => c.includes(k))) &&
        (!st.regs.size || st.regs.has(r.dataset.region)) && (!st.brands.size || st.brands.has(r.dataset.brand)) && (st.max === null || !st.at || r.dist <= st.max);
      r.hidden = !ok; if (ok) count++;
    });
    const sort = st.sort === 'near' && !st.at ? 'az' : st.sort;
    const by = { near: (x, y) => x.dist - y.dist, az: (x, y) => nameOf(x).localeCompare(nameOf(y)),
      old: (x, y) => (Number(x.dataset.since) || 9999) - (Number(y.dataset.since) || 9999) || nameOf(x).localeCompare(nameOf(y)),
      score: (x, y) => (Number(y.dataset.score) || 0) - (Number(x.dataset.score) || 0) }[sort];
    // The list shows twenty at a time. Every row stays in the page (and on the map); the rest wait behind Show more.
    let seen = 0;
    [...rows].sort(by).forEach((r) => { list.appendChild(r); const cut = !r.hidden && ++seen > st.limit; r.classList.toggle('nf-nr-cut', cut); });
    if (more) { const left = count - Math.min(count, st.limit); more.hidden = left <= 0; more.textContent = 'Show ' + Math.min(STEP, left) + ' more · ' + left + ' left'; }
    drawHomes(); syncDist();
    const how = { near: 'closest to ' + st.from + ' first', az: 'A to Z', old: 'longest running first', score: 'my rating, highest first' }[sort];
    status.textContent = count + (count === 1 ? ' place, ' : ' places, ') + how + '.' + (st.sort === 'near' && !st.at ? ' Share your location to see the closest first.' : '') + (count === 0 ? ' Nothing matches: loosen a filter.' : '');
    const active = st.kinds.size + st.regs.size + st.brands.size + (st.max !== null ? 1 : 0);
    const badge = $('[data-nr-badge]', box); if (badge) { badge.hidden = !active; badge.textContent = String(active); }
    const done = $('[data-nr-done]', box); if (done) done.textContent = 'Show ' + count + (count === 1 ? ' place' : ' places');
    if (st.map) st.map.closePopup();
    fillCards(); syncMap(fit !== false);
  };
  const setTop = (id) => {
    st.top = id; st.kinds.clear();
    $$('[data-nr-top]', box).forEach((bt) => bt.setAttribute('aria-pressed', String(bt.dataset.nrTop === id)));
    $$('[data-nr-sub]', box).forEach((g) => { g.hidden = g.dataset.nrSub !== id; });
    $$('[data-nr-kind]', box).forEach((bt) => bt.setAttribute('aria-pressed', 'false'));
    // Run by: only the names that have places in this branch stay visible.
    $$('[data-nr-brand]', box).forEach((bt) => { const fits = id === 'all' || bt.dataset.tops.split(' ').includes(id); bt.hidden = !fits; if (!fits) { st.brands.delete(bt.dataset.nrBrand); bt.setAttribute('aria-pressed', 'false'); } });
  };
  const setView = (v, fit) => {
    split.dataset.view = v; $$('[data-nr-view]', box).forEach((bt) => bt.setAttribute('aria-pressed', String(bt.dataset.nrView === v)));
    if (v === 'map') startMap().then(() => { if (st.map) { st.map.invalidateSize(); syncMap(fit !== false); } });
  };
  const sheet = (open) => {
    panel.classList.toggle('open', open); shade.hidden = !open; $('[data-nr-sheet]', box).setAttribute('aria-expanded', String(open));
    if (open) { const f = $('button:not([hidden]), input', panel); if (f) f.focus({ preventScroll: true }); } else if (!wide()) $('[data-nr-sheet]', box).focus({ preventScroll: true });
  };
  const located = (at, from, kind) => {
    st.home = null; st.spot = kind || 'you'; st.at = at; st.from = from; distIn.disabled = false; const note = $('[data-nr-distnote]', box); if (note) note.textContent = 'Measured from ' + from + ', in a straight line.';
    buzz(14); draw();
  };

  box.addEventListener('click', (e) => {
    const hit = (sel) => e.target.closest(sel);
    const top = hit('[data-nr-top]');
    if (top) { buzz(); setTop(top.dataset.nrTop); track('fit_tab', { detail: 'near_' + st.top }); draw(); return; }
    const kind = hit('[data-nr-kind]');
    if (kind) { buzz(); const k = kind.dataset.nrKind; if (st.kinds.has(k)) st.kinds.delete(k); else st.kinds.add(k); kind.setAttribute('aria-pressed', String(st.kinds.has(k))); track('fit_tab', { detail: 'near_kind_' + k }); draw(); return; }
    const brand = hit('[data-nr-brand]');
    if (brand) { buzz(); const k = brand.dataset.nrBrand; if (st.brands.has(k)) st.brands.delete(k); else st.brands.add(k); brand.setAttribute('aria-pressed', String(st.brands.has(k))); track('fit_tab', { detail: 'near_brand_' + k }); draw(); return; }
    const reg = hit('[data-nr-reg]');
    if (reg) { buzz(); const k = reg.dataset.nrReg; if (st.regs.has(k)) st.regs.delete(k); else st.regs.add(k); reg.setAttribute('aria-pressed', String(st.regs.has(k))); draw(); return; }
    if (hit('[data-nr-clear]')) { buzz(); st.kinds.clear(); st.regs.clear(); st.brands.clear(); st.max = null; distIn.value = 0; $$('[data-nr-kind], [data-nr-reg], [data-nr-brand]', box).forEach((bt) => bt.setAttribute('aria-pressed', 'false')); draw(); return; }
    if (hit('[data-nr-sheet]')) { buzz(); sheet(!panel.classList.contains('open')); return; }
    if (hit('[data-nr-done]') || hit('[data-nr-shade]')) { sheet(false); return; }
    const view = hit('[data-nr-view]');
    if (view) { buzz(); setView(view.dataset.nrView); if (!wide()) split.scrollIntoView({ block: 'start', behavior: calm ? 'auto' : 'smooth' }); return; }
    if (hit('[data-nr-more]')) { buzz(); st.limit += STEP; track('fit_tab', { detail: 'near_more' }); draw(false, true); return; }
    const mi = hit('[data-nr-mi]');
    if (mi) { distIn.value = mi.dataset.nrMi; distIn.dispatchEvent(new Event('input')); return; }
    if (hit('[data-nr-full]')) { buzz(10); full(!box.classList.contains('full')); track('fit_tab', { detail: 'near_expand' }); return; }
    if (hit('[data-nr-drop]')) {
      buzz(); const on = !st.dropping; if (on && !wide()) { setView('map', false); split.scrollIntoView({ block: 'start' }); }
      startMap().then(() => { arm(on); if (on) status.textContent = 'Now click the map where you want to measure from.'; });
      return;
    }
    const tryIt = hit('[data-nr-try]');
    if (tryIt) {
      buzz(12); const g = mine.find((x) => x.dataset.slug === tryIt.dataset.slug); if (!g) return;
      if (st.home !== g) setHome(g); setTop(tryIt.dataset.top); st.max = MILES[Number(tryIt.dataset.mi)];
      track('fit_tab', { detail: 'near_try_' + g.dataset.slug }); draw();
      if (wide() || split.dataset.view === 'map') startMap(); else list.scrollIntoView({ block: 'start', behavior: calm ? 'auto' : 'smooth' });
      return;
    }
    const homePin = hit('[data-nr-home-pin]');
    if (homePin) { buzz(12); const g = mine.find((x) => x.dataset.slug === homePin.dataset.nrHomePin); if (g) { if (st.home !== g) setHome(g); st.map.closePopup(); draw(); } return; }
    const home = hit('[data-nr-home]');
    if (home) {
      buzz(12); const g = home.closest('.nf-nr-home'); setHome(g); track('fit_tab', { detail: 'near_home_' + g.dataset.slug }); draw();
      // Phones start the map only on the Map tab, when it has a size; starting it hidden breaks its maths.
      if (st.home && (wide() || split.dataset.view === 'map')) startMap().then(() => { if (st.map && wide()) st.map.once('moveend', () => g.pin && g.pin.openPopup()); });
      return;
    }
    const show = hit('[data-nr-show]');
    if (show) {
      buzz(10); const r = show.closest('li'); if (!wide()) { setView('map', false); mapEl.scrollIntoView({ block: 'center' }); }
      startMap().then(() => { flyToRow(r, true); if (!wide()) cardTo(r); }); return;
    }
    const fly = hit('[data-nr-fly]');
    if (fly) {
      buzz(); const to = fly.dataset.nrFly;
      startMap().then(() => {
        if (!st.map) return; const L = st.L; const vis = shown().filter((r) => r.pin);
        if (to === 'me') { if (st.at) st.map.flyTo(st.at, 12, { duration: 0.8 }); else status.textContent = 'Tap Use my location or pick an area first, then Me brings the map back to you.'; }
        else if (to === 'all') { if (vis.length) st.map.flyToBounds(L.latLngBounds(vis.map(pos)), { padding: [40, 40], duration: 0.9 }); }
        else if (to === 'lucky') { const pool = st.at ? vis.slice().sort((x, y) => x.dist - y.dist).slice(0, 12) : vis; const r = pool[Math.floor(Math.random() * pool.length)]; if (r) { buzz([8, 40, 14]); flyToRow(r, true); cardTo(r); } }
        else if (REGION_BOX[to]) st.map.flyToBounds(L.latLngBounds(REGION_BOX[to]), { duration: 0.9 });
        track('fit_tab', { detail: 'near_fly_' + to.toLowerCase() });
      });
      return;
    }
    if (hit('[data-nr-geo]')) {
      if (!navigator.geolocation) { status.textContent = 'This browser cannot share a location. Pick an area instead.'; return; }
      status.textContent = 'Finding you…';
      navigator.geolocation.getCurrentPosition((p) => {
        const sel = $('[data-nr-city]', box); if (sel) sel.value = '';
        track('fit_tab', { detail: 'near_located' }); located([p.coords.latitude, p.coords.longitude], 'you');
      }, () => { status.textContent = 'I could not get your location. Pick an area instead, or allow location for this site and try again.'; },
      { maximumAge: 300000, timeout: 12000 });
    }
  });
  const city = $('[data-nr-city]', box);
  const pickCity = () => { if (!city.value) return; track('fit_tab', { detail: 'near_area' }); located(city.value.split(',').map(Number), city.options[city.selectedIndex].textContent); };
  if (city) city.addEventListener('change', pickCity);
  sortSel.addEventListener('change', () => { st.sort = sortSel.value; buzz(); track('fit_tab', { detail: 'near_sort_' + st.sort }); draw(false); });
  distIn.addEventListener('input', () => {
    st.max = MILES[Number(distIn.value)]; buzz(4);
    draw();
    if (!st.at && st.max !== null) status.textContent = 'Pick a spot first: one of my gyms, your location, an address or a pin. Then the distance applies.';
  });
  const addr = $('[data-nr-addr]', box);
  if (addr) addr.addEventListener('submit', (e) => {
    e.preventDefault(); const q = addr.elements.q.value.trim(); if (!q) return;
    status.textContent = 'Looking that up…'; track('fit_tab', { detail: 'near_address' });
    // OpenStreetMap's search, limited to Southern California. Only the typed text is sent.
    fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=us&viewbox=-119.6,35.0,-116.2,33.0&bounded=1&q=' + encodeURIComponent(q))
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((hits) => { const h = hits && hits[0]; if (!h) { status.textContent = 'I could not find that in Southern California. Try a city, or drop a pin on the map.'; return; }
        const sel = $('[data-nr-city]', box); if (sel) sel.value = ''; located([Number(h.lat), Number(h.lon)], q.length > 28 ? q.slice(0, 27) + '…' : q, 'addr'); })
      .catch(() => { status.textContent = 'The address search did not answer. Pick an area or drop a pin on the map instead.'; });
  });
  document.addEventListener('keydown', (e) => { if (e.key !== 'Escape') return; if (panel.classList.contains('open')) sheet(false); else if (st.dropping) arm(false); else if (box.classList.contains('full')) full(false); });
  // Desktop: the filters open as a card over the page, and a click anywhere else closes it.
  document.addEventListener('click', (e) => { if (wide() && panel.classList.contains('open') && !e.target.closest('[data-nr-panel], [data-nr-sheet]')) sheet(false); });
  rows.forEach((r) => {
    r.addEventListener('mouseenter', () => { if (r.pin && r.pin.getElement()) r.pin.getElement().classList.add('hot'); });
    r.addEventListener('mouseleave', () => { if (r.pin && r.pin.getElement()) r.pin.getElement().classList.remove('hot'); });
  });
  if (cards) {
    let timer; cards.addEventListener('scroll', () => {
      if (cards.lock) return; clearTimeout(timer);
      timer = setTimeout(() => {
        const mid = cards.scrollLeft + cards.clientWidth / 2; let best = null; let gap = Infinity;
        [...cards.children].forEach((el) => { const g = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid); if (g < gap) { gap = g; best = el; } });
        const r = best && cards.rows[Number(best.dataset.i)]; if (r && r !== st.sel) { buzz(6); flyToRow(r, false); }
      }, 140);
    }, { passive: true });
  }
  // Links from the guides and profiles can open the map already filtered: ?show=strike&kind=boxing, ?area=Brea, ?focus=slug
  const qs = new URLSearchParams(location.search);
  if ($('[data-nr-top="' + qs.get('show') + '"]', box)) setTop(qs.get('show'));
  const k0 = qs.get('kind') && $('[data-nr-sub="' + st.top + '"] [data-nr-kind="' + qs.get('kind') + '"]', box); if (k0) { st.kinds.add(qs.get('kind')); k0.setAttribute('aria-pressed', 'true'); }
  const b0 = qs.get('brand') && $('[data-nr-brand="' + qs.get('brand') + '"]:not([hidden])', box); if (b0) { st.brands.add(qs.get('brand')); b0.setAttribute('aria-pressed', 'true'); }
  const a0 = qs.get('area') && city && [...city.options].find((o) => o.textContent.toLowerCase() === qs.get('area').toLowerCase());
  if (a0) { city.value = a0.value; st.at = a0.value.split(',').map(Number); st.from = a0.textContent; distIn.disabled = false; }
  draw(false);
  const f0 = qs.get('focus') && rows.find((r) => r.dataset.slug === qs.get('focus'));
  if (f0) { if (!wide()) setView('map', false); startMap().then(() => { flyToRow(f0, true); cardTo(f0); }); }
  // Desktop shows list and map side by side, so the map starts when it scrolls near. Phones start it on the Map tab.
  if (wide() && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((en) => { if (en.some((x) => x.isIntersecting)) { io.disconnect(); startMap(); } }, { rootMargin: '300px' });
    io.observe(mapEl);
  }
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
  mountRank();
  mountNear();
  // Focus page mark: a click stamps the tile and sends out a ring.
  $$('[data-nf-fart]').forEach((f) => f.addEventListener('click', () => replay(f, 'hit')));
}
