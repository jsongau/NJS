// Small shared helpers for the studio views.

export const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

export function weeksText(w) { return w ? (w[0] === w[1] ? String(w[0]) : w[0] + ' to ' + w[1]) : null; }

// Money only renders when the catalog ships prices (show_prices true). Never called otherwise.
export function money(cents) { return '$' + Math.round(cents / 100).toLocaleString('en-US'); }
export function moneyRange(r) { return r ? money(r[0]) + ' to ' + money(r[1]) : ''; }

// Odometer: each digit is a 0 to 9 strip that slides to its value; other characters are fixed.
// Digits further left start 30ms later so the number rolls right to left (Mary B.5).
export function odometer(el) {
  let pattern = null;
  const strip = '<span>' + Array.from({ length: 10 }, (_, i) => '<span>' + i + '</span>').join('') + '</span>';
  return {
    set(str) {
      const s = String(str);
      const pat = s.replace(/\d/g, '0');
      const fresh = pat !== pattern;
      if (fresh) {
        pattern = pat;
        el.innerHTML = Array.from(s).map((ch) => (/\d/.test(ch) ? '<span class="d">' + strip + '</span>' : '<span class="c">' + esc(ch) + '</span>')).join('');
      }
      const digits = Array.from(el.querySelectorAll('.d > span'));
      const vals = Array.from(s).filter((ch) => /\d/.test(ch)).map(Number);
      const apply = () => digits.forEach((d, i) => {
        d.style.setProperty('--dl', (digits.length - 1 - i) * 30 + 'ms');
        d.style.setProperty('--v', vals[i]);
      });
      if (fresh && !reduced()) { digits.forEach((d) => d.style.setProperty('--v', 0)); requestAnimationFrame(() => requestAnimationFrame(apply)); }
      else apply();
      el.setAttribute('data-value', s);
    },
  };
}

// Types a line at 22ms per character, capped at maxMs in total. Instant under reduced motion.
export function typer(el, maxMs = 700) {
  let timer = null;
  let current = '';
  return function type(text) {
    if (text === current) return;
    current = text;
    clearInterval(timer);
    if (reduced() || !text) { el.textContent = text; return; }
    const steps = Math.max(1, Math.round(Math.min(maxMs, text.length * 22) / 22));
    const per = Math.ceil(text.length / steps);
    let i = 0;
    el.textContent = '';
    timer = setInterval(() => {
      i += per;
      el.textContent = text.slice(0, i);
      if (i >= text.length) clearInterval(timer);
    }, 22);
  };
}

// A radio group of buttons with roving tabindex and arrow keys (one tab stop).
export function radioGroup(container, items, onPick) {
  container.innerHTML = items.map((it) => '<button type="button" role="radio" class="' + (it.cls || 'chip') + '" data-v="' + esc(it.id) + '" aria-checked="false" tabindex="-1">' + it.html + '</button>').join('');
  const btns = $$('[role="radio"]', container);
  container.addEventListener('click', (e) => { const b = e.target.closest('[role="radio"]'); if (b) onPick(b.dataset.v); });
  container.addEventListener('keydown', (e) => {
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const i = btns.indexOf(document.activeElement);
    const n = btns[(i + keys[e.key] + btns.length) % btns.length];
    n.focus();
    onPick(n.dataset.v);
  });
  return function update(value) {
    btns.forEach((b) => { const on = b.dataset.v === value; b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1; });
    if (!btns.some((b) => b.dataset.v === value) && btns[0]) btns[0].tabIndex = 0;
  };
}

// Plus and minus stepper with a typeable value and long-press repeat (400ms, then every 120ms).
export function stepper(container, { min, max, labelId, label, onChange }) {
  container.innerHTML = '<button type="button" data-d="-1" aria-label="Fewer">-</button>' +
    '<input type="number" inputmode="numeric" min="' + min + '" max="' + max + '" ' + (labelId ? 'aria-labelledby="' + labelId + '"' : 'aria-label="' + esc(label) + '"') + '>' +
    '<button type="button" data-d="1" aria-label="More">+</button>';
  const input = $('input', container);
  const [minus, plus] = $$('button', container);
  let value = min;
  let hold = null;
  let pend = null;
  const commit = (v) => { const c = Math.max(min, Math.min(max, Math.round(Number(v) || 0))); if (c !== value) { const d = c > value ? 1 : -1; value = c; pend = c; onChange(c, d); } else input.value = value; };
  const stop = () => { clearTimeout(hold); clearInterval(hold); hold = null; };
  for (const b of [minus, plus]) {
    b.addEventListener('click', (e) => { if (e.detail === 0 || !b.dataset.held) commit(value + Number(b.dataset.d)); delete b.dataset.held; });
    b.addEventListener('pointerdown', () => {
      stop();
      hold = setTimeout(() => { b.dataset.held = '1'; hold = setInterval(() => commit(value + Number(b.dataset.d)), 120); }, 400);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => b.addEventListener(ev, stop));
  }
  input.addEventListener('change', () => commit(input.value));
  return function update(v, dir) {
    // A store flush can lag behind fast taps; ignore stale values until the last tap lands.
    if (pend !== null && v !== pend) return;
    pend = null;
    value = v;
    if (document.activeElement !== input) input.value = v;
    minus.setAttribute('aria-disabled', v <= min);
    plus.setAttribute('aria-disabled', v >= max);
    if (dir && !reduced()) {
      input.animate([{ transform: 'translateY(' + (dir > 0 ? 6 : -6) + 'px)', opacity: 0.4 }, { transform: 'none', opacity: 1 }], { duration: 220, easing: 'cubic-bezier(.22,1,.36,1)' });
    }
  };
}

let toastTimer = null;
export function toast(text, onUndo) {
  const t = $('#toast');
  if (!t) return;
  $('#toast-t').textContent = text;
  const u = $('#toast-undo');
  u.hidden = !onUndo;
  u.onclick = () => { if (onUndo) onUndo(); t.classList.remove('show'); };
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 6000);
}
