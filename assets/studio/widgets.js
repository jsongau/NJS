// Live feature widgets for the hero preview (2026-11-03). The phone in the Draft card shows
// one working mini screen per feature, written with the chosen business's own words: tap a
// time, pay the deposit, rate the visit, flip the agent off. Each widget is plain HTML plus
// data-act hooks; play() runs its intro and act() handles taps. No prices, ever: the page
// never shows a money figure.
import { esc } from './util.js';

const CITIES = ['Brea', 'Fullerton', 'Anaheim', 'Irvine', 'Orange', 'Tustin'];
const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ctx: { brand, cta, tiles: [3], label, noun }
export const WIDGETS = {
  site: (c) => '<div class="wg-h">Search</div>' +
    '<div class="wg-search"><i></i>' + esc(c.label.toLowerCase()) + ' near me</div>' +
    '<ol class="wg-pack">' +
      '<li data-r="1"><b>Corner ' + esc(c.label) + '</b><small>4.1 ★ · 2.4 mi</small></li>' +
      '<li data-r="2"><b>Main St ' + esc(c.label) + '</b><small>4.3 ★ · 1.8 mi</small></li>' +
      '<li data-r="3" class="me"><b>' + esc(c.brand) + '</b><small>4.9 ★ · 0.6 mi · Open now</small></li>' +
    '</ol><button type="button" class="wg-btn" data-act="rank">Search again</button>',

  book: (c) => '<div class="wg-h">' + esc(c.cta) + '</div>' +
    '<div class="wg-days">' + ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d, i) => '<span' + (i === 1 ? ' class="on"' : '') + '>' + d + '<b>' + (10 + i) + '</b></span>').join('') + '</div>' +
    '<div class="wg-slots">' + ['7:00 AM', '9:00 AM', '12:30 PM', '4:00 PM', '6:00 PM', '7:30 PM'].map((t) => '<button type="button" data-act="slot">' + t + '</button>').join('') + '</div>' +
    '<div class="wg-sheet"><b>Booked</b><span class="wg-when">Tue 6:00 PM</span><small>' + esc(c.tiles[0]) + ' · added to your calendar</small></div>',

  deposit: (c) => '<div class="wg-h">Hold your spot</div>' +
    '<div class="wg-rows"><p><span>' + esc(c.tiles[0]) + '</span><b>Tue 6:00 PM</b></p><p><span>Deposit</span><b>Refundable 24h</b></p><p><span>Card</span><b>•••• 4242</b></p></div>' +
    '<button type="button" class="wg-btn wg-pay" data-act="pay"><span>Pay deposit</span></button>' +
    '<div class="wg-sheet"><b>Paid</b><span class="wg-when">Spot held</span><small>Receipt sent by email</small></div>',

  portal: (c) => '<div class="wg-h">Hi, Alex</div>' +
    '<div class="wg-card"><small>' + esc(c.tiles[2] || 'Your pack') + '</small><b><span class="wg-n">7</span> of 10 left</b><i class="wg-bar"><i style="width:70%"></i></i></div>' +
    '<div class="wg-rows"><p><span>Next</span><b>Tue 6:00 PM</b></p><p><span>Last visit</span><b>Thu</b></p></div>' +
    '<button type="button" class="wg-btn" data-act="rebook">Book my usual</button>' +
    '<div class="wg-toast">Booked for next Tue</div>',

  dash: () => '<div class="wg-h">This week <button type="button" class="wg-chip" data-act="week">Last week</button></div>' +
    '<div class="wg-kpis"><p><b class="wg-k1">38</b><small>bookings</small></p><p><b class="wg-k2">2</b><small>no-shows</small></p><p><b class="wg-k3">5</b><small>new reviews</small></p></div>' +
    '<div class="wg-chart">' + [40, 62, 48, 80, 70, 92, 55].map((h, i) => '<i style="--h:' + h + '%;--i:' + i + '"></i>').join('') + '</div>' +
    '<div class="wg-axis">' + ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d) => '<span>' + d + '</span>').join('') + '</div>',

  follow: (c) => '<div class="wg-h">Messages</div>' +
    '<div class="wg-chat">' +
      '<p class="them" style="--i:0">Hi Alex, it\'s ' + esc(c.brand) + '. It\'s been 3 weeks. Want your usual Tuesday at 6?</p>' +
      '<p class="you" style="--i:1">Yes please</p>' +
      '<p class="them" style="--i:2">Done. See you Tuesday.</p>' +
    '</div><button type="button" class="wg-btn" data-act="replay">Send again</button>',

  reviews: (c) => '<div class="wg-h">How was your visit?</div>' +
    '<p class="wg-sub">' + esc(c.brand) + '</p>' +
    '<div class="wg-stars">' + [1, 2, 3, 4, 5].map((n) => '<button type="button" data-act="star" data-n="' + n + '" aria-label="' + n + ' stars">★</button>').join('') + '</div>' +
    '<p class="wg-out" data-out="good">Thank you. One tap to post it on Google.</p>' +
    '<p class="wg-out" data-out="bad">Sorry about that. The owner will reach out today.</p>' +
    '<small class="wg-note">Happy guests go to Google. Unhappy ones come to you first.</small>',

  agent: () => '<div class="wg-h">Back-office agent <button type="button" class="wg-sw on" data-act="switch" aria-label="Agent on"><i></i></button></div>' +
    '<ol class="wg-log">' +
      '<li style="--i:0"><time>6:00</time>Checked 42 bookings</li>' +
      '<li style="--i:1"><time>6:01</time>Charged 2 no-show deposits</li>' +
      '<li style="--i:2"><time>6:02</time>Sent 5 reminders</li>' +
      '<li style="--i:3"><time>6:03</time>Logged it. Done for today.</li>' +
    '</ol><small class="wg-note">Limit 20 actions a day. Off switch always on top.</small>',

  pages: (c) => {
    const base = slug(c.label);
    return '<div class="wg-h">Pages from your data</div>' +
      '<ol class="wg-urls">' + CITIES.slice(0, 3).map((ct, i) => '<li style="--i:' + i + '">/' + base + '-in-' + slug(ct) + '</li>').join('') + '</ol>' +
      '<p class="wg-sub"><b class="wg-count">3</b> pages, one table</p>' +
      '<button type="button" class="wg-btn" data-act="city" data-base="' + esc(base) + '">Add a city</button>';
  },

  loop: () => '<div class="wg-h">Nightly review</div>' +
    '<div class="wg-grade"><b>A-</b><small>Agents graded on last night\'s work</small></div>' +
    '<div class="wg-card"><small>1 fix proposed</small><b>Shorter reminder text</b></div>' +
    '<div class="wg-pair"><button type="button" class="wg-btn" data-act="approve">Approve</button><button type="button" class="wg-btn ghost" data-act="skip">Skip</button></div>' +
    '<p class="wg-out" data-out="ok">Approved. Ships tonight.</p><p class="wg-out" data-out="no">Skipped. Nothing changes.</p>',
};

export function renderWidget(id, ctx) {
  const f = WIDGETS[id] || WIDGETS.site;
  return '<div class="wg wg-' + id + '" data-w="' + id + '">' + f(ctx) + '</div>';
}

// Intro motion for a freshly shown widget: the rank climb, the chat typing in, the log ticking.
export function playWidget(el) {
  if (!el) return;
  el.classList.remove('live', 'done', 'good', 'bad', 'ok', 'no', 'paying', 'paid', 'alt');
  void el.offsetWidth;
  el.classList.add('live');
}

export function actWidget(el, btn) {
  const act = btn.dataset.act;
  if (act === 'rank' || act === 'replay') { playWidget(el); return true; }
  if (act === 'slot') {
    el.querySelectorAll('[data-act="slot"]').forEach((b) => b.classList.toggle('on', b === btn));
    const w = el.querySelector('.wg-when');
    if (w) w.textContent = 'Tue ' + btn.textContent;
    el.classList.add('done');
    return true;
  }
  if (act === 'pay') { el.classList.add('paying'); setTimeout(() => { el.classList.remove('paying'); el.classList.add('done'); }, 900); return true; }
  if (act === 'rebook') { el.classList.add('done'); const n = el.querySelector('.wg-n'); if (n && !el.dataset.used) { n.textContent = '6'; el.dataset.used = '1'; el.querySelector('.wg-bar i').style.width = '60%'; } return true; }
  if (act === 'week') {
    const alt = el.classList.toggle('alt');
    btn.textContent = alt ? 'This week' : 'Last week';
    el.querySelector('.wg-h').firstChild.nodeValue = alt ? 'Last week ' : 'This week ';
    const [a, b, c] = alt ? ['31', '4', '2'] : ['38', '2', '5'];
    el.querySelector('.wg-k1').textContent = a; el.querySelector('.wg-k2').textContent = b; el.querySelector('.wg-k3').textContent = c;
    return true;
  }
  if (act === 'star') {
    const n = +btn.dataset.n;
    el.querySelectorAll('[data-act="star"]').forEach((b) => b.classList.toggle('on', +b.dataset.n <= n));
    el.classList.toggle('good', n >= 4); el.classList.toggle('bad', n < 4);
    return true;
  }
  if (act === 'switch') {
    const on = btn.classList.toggle('on');
    btn.setAttribute('aria-label', on ? 'Agent on' : 'Agent off');
    el.classList.toggle('off', !on);
    return true;
  }
  if (act === 'city') {
    const list = el.querySelector('.wg-urls');
    const have = list.children.length;
    if (have < CITIES.length) {
      const li = document.createElement('li');
      li.textContent = '/' + btn.dataset.base + '-in-' + slug(CITIES[have]);
      li.className = 'new';
      list.appendChild(li);
      el.querySelector('.wg-count').textContent = String(have + 1);
      if (have + 1 >= CITIES.length) { btn.textContent = 'Every city covered'; btn.disabled = true; }
    }
    return true;
  }
  if (act === 'approve' || act === 'skip') { el.classList.remove('ok', 'no'); el.classList.add(act === 'approve' ? 'ok' : 'no'); return true; }
  return false;
}
