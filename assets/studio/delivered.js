// Delivered project tickets, rendered from projects.json (Ross 3.6, Mary B.6.5).
import { $, $$, esc } from './util.js';
import { icon } from './icons.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
export function prettyDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return MONTHS[m - 1] + ' ' + d + ', ' + y;
}

export function mountDelivered(store) {
  const wall = $('#wall');
  const list = store.projects.projects;
  wall.innerHTML = list.map((p) => {
    const n = p.features.length;
    const stats = p.stats.map((s) => '<div><i>' + esc(s.label) + '</i><b>' + esc(s.value) + '</b><span>' + esc(s.note) + '</span></div>').join('');
    const legs = p.features.map((f, j) => '<li class="' + (j > 3 ? 'more' : '') + '"><b>' + esc(f.name) + '<em>' + esc(f.what) + '</em></b><small>Shipped: ' + esc(f.shipped) + '</small><span class="done">DONE</span></li>').join('');
    return '<article class="tk" id="p-' + p.id + '" aria-labelledby="pt-' + p.id + '">' +
      '<div class="tk-top"><span class="stamp">' + icon('stamp') + 'SHIPPED</span><span class="k num">' + n + ' features · ' + esc(p.meta) + '</span></div>' +
      '<div class="tk-who"><span class="mono" style="background:' + esc(p.color) + '">' + esc(p.mono) + '</span><div><h3 id="pt-' + p.id + '">' + esc(p.title) + '</h3><p class="sub">' + esc(p.sub) + '</p></div></div>' +
      '<div class="tk-stats">' + stats + '</div>' +
      '<p class="tk-res"><span class="live' + (p.kind === 'concept' ? ' concept' : '') + '">' + (p.kind === 'concept' ? 'CONCEPT' : 'LIVE') + '</span><span>' + n + ' of ' + n + ' features shipped · ' + esc(p.verified.how) + ', ' + prettyDate(p.verified.on) + '</span></p>' +
      '<ol class="tk-legs">' + legs + '</ol>' +
      '<div class="tk-foot">' + (n > 4 ? '<button type="button" aria-expanded="false">Show all ' + n + ' features</button>' : '<span></span>') +
      '<a href="' + esc(p.url) + '" target="_blank" rel="noopener">See it live</a></div></article>';
  }).join('');

  wall.addEventListener('click', (e) => {
    const b = e.target.closest('.tk-foot button');
    if (!b) return;
    const c = b.closest('.tk');
    const o = c.classList.toggle('open');
    b.setAttribute('aria-expanded', o);
    b.textContent = o ? 'Show fewer features' : 'Show all ' + $$('.tk-legs li', c).length + ' features';
  });

  // "1 of 4" counter for the phone scroller (a scroller must say so).
  const count = $('#wall-count');
  const cards = $$('.tk', wall);
  const paint = () => {
    const mid = wall.scrollLeft + wall.clientWidth / 2;
    let i = cards.findIndex((c) => c.offsetLeft + c.offsetWidth > mid);
    if (i < 0) i = cards.length - 1;
    count.textContent = (i + 1) + ' of ' + cards.length + ' · swipe for more';
  };
  wall.addEventListener('scroll', paint, { passive: true });
  paint();
}

export function mountProof(store) {
  $('#proof').innerHTML = (store.projects.proof || []).map((p) => '<div><b>' + esc(p.value) + '</b><span>' + esc(p.label) + '</span><small>' + esc(p.source) + '</small></div>').join('');
}
