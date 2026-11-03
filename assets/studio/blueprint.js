// The Live Blueprint (Mary B.2), Wave 1 version: a lime scan line, a wireframe that draws,
// then fills into a mini site for the chosen business. CSS and inline SVG only, no WebGL.
// Plays once per session; any scroll, click or key skips to the final frame; reduced motion
// shows the final frame. Picking a business type rebuilds the preview.
import { $, $$, esc, radioGroup, reduced, typer, weeksText } from './util.js';
import { quote, resolveBusiness } from './engine.js';
import { icon } from './icons.js';
import { marqRow, MARQ_SPEED } from './marquee.js';

const KEY = 'njs-bp-played-v1';
const HERO_LINE = {
  gym: "A gym that books itself. That's a Premium build.",
  dental: "A front desk that answers itself. That's a Premium build.",
  food: "A cafe people find from their phone. That's a Premium build.",
  shop: "A shop people find nearby and come back to. That's a Premium build.",
  service: "Quotes out the same day. That's a Premium build.",
};
const WIRE = [[4, 3, 92, 10], [4, 18, 56, 36], [64, 18, 32, 36], [4, 60, 29, 15], [35.5, 60, 29, 15], [67, 60, 29, 15], [4, 80, 44, 15], [52, 80, 44, 15]];

function playedBefore() { try { return sessionStorage.getItem(KEY) === '1'; } catch (_) { return true; } }
function markPlayed() { try { sessionStorage.setItem(KEY, '1'); } catch (_) { /* private mode */ } }

export function mountBlueprint(store) {
  const { catalog, actions } = store;
  const hero = $('#hero');
  const stage = $('#stage');
  const bizById = Object.fromEntries(catalog.business_types.map((b) => [b.id, b]));
  const featById = Object.fromEntries(catalog.features.map((f) => [f.id, f]));

  // Headline: words rise one by one; screen readers get the one string.
  const h1 = $('#h1');
  let wi = 0;
  $$('.ln', h1).forEach((ln) => {
    const words = ln.textContent.split(' ');
    ln.innerHTML = words.map((w) => '<span class="w" style="--i:' + wi++ + '">' + esc(w) + '</span>').join(' ');
  });
  h1.setAttribute('aria-label', 'Your project, built while you watch.');

  stage.innerHTML =
    '<span class="stage-k"><b>DRAFT</b> · <span id="bp-for"></span></span><span class="bp-cap">Preview</span>' +
    '<div class="bp-browser"><div class="bp-bar"><i></i><i></i><i></i><span class="bp-url" id="bp-url"></span></div><div class="bp-body">' +
    '<div class="bp-site" id="bp-site"><div class="bp-nav"><b id="bp-brand"></b><span id="bp-n1"></span><span id="bp-n2"></span></div>' +
    '<div class="bp-hero"><h4 id="bp-head"></h4><span class="bp-cta" id="bp-cta"></span></div><div class="bp-img"></div>' +
    '<div class="bp-tiles" id="bp-tiles"></div><div class="bp-map"><i class="pin"></i></div><div class="bp-foot"></div></div>' +
    '<svg class="bp-wire" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' +
    WIRE.map((r, i) => '<rect x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '" rx="1.5" pathLength="1" vector-effect="non-scaling-stroke" style="--i:' + i + '"/>').join('') +
    '</svg></div></div>' +
    '<div class="bp-phone" aria-hidden="true"><div class="bp-site" id="bp-psite"><div class="bp-p-head" id="bp-phead"></div><div class="bp-p-slot"></div><div class="bp-p-slot"></div><div class="bp-p-cta" id="bp-pcta"></div></div></div>' +
    '<ul class="bp-chips" id="bp-chips" aria-hidden="true"></ul>' +
    '<div class="bp-total"><span class="bp-tier" id="bp-tier">Premium</span><span class="bp-meter"><i id="bp-meter"></i></span><p class="bp-say"><b>NS</b><span id="bp-say"></span></p></div>';
  stage.insertAdjacentHTML('afterend', '<p class="sr">Preview. Your real build is designed in the audit.</p>');
  const say = typer($('#bp-say'), 900);

  // Business ribbon (Snellenberg-style, reverses with scroll). Content and marks live in
  // marquee.js; the speed is set in pixels per second so the row length never changes it.
  const marq = $('#marq');
  if (marq) {
    const row = marqRow(esc);
    marq.innerHTML = '<div>' + row + '</div><div>' + row + '</div>';
    const pace = () => {
      const w = marq.firstElementChild.getBoundingClientRect().width;
      const v = innerWidth < 700 ? MARQ_SPEED.narrow : MARQ_SPEED.wide;
      if (w) marq.style.animationDuration = (w / v).toFixed(1) + 's';
    };
    pace();
    if (document.fonts) document.fonts.ready.then(pace);
    addEventListener('resize', pace, { passive: true });
    let lastY = scrollY;
    addEventListener('scroll', () => { const y = scrollY; if (Math.abs(y - lastY) > 4) { marq.classList.toggle('rev', y < lastY); lastY = y; } }, { passive: true });
  }

  let timers = [];
  let running = false;
  let lastBiz = null;
  let lastStyle = null;
  let current = null;

  function preview({ sel, quote: q }) {
    const rb = resolveBusiness(sel, catalog);
    const b = { ...bizById[rb.profile], scene: rb.scene, label: rb.label, key: rb.sector || rb.text || rb.industry || rb.profile };
    const own = q.features.length > 0;
    const shown = own ? q : quote({ ...sel, features: b.preset.grow, addons: [] }, catalog);
    const ids = own ? q.features : b.preset.grow;
    return { b, q: shown, own, ids };
  }

  function paintContent(v) {
    const s = v.b.scene;
    $('#bp-for').textContent = v.b.label.toLowerCase();
    $('#bp-url').textContent = s.brand.toLowerCase().replace(/[^a-z0-9]+/g, '') + '.com';
    $('#bp-brand').textContent = s.brand;
    $('#bp-n1').textContent = s.tiles[0];
    $('#bp-n2').textContent = s.tiles[1];
    $('#bp-head').textContent = s.head;
    $('#bp-cta').textContent = s.cta;
    $('#bp-phead').textContent = s.head;
    $('#bp-pcta').textContent = s.cta;
    $('#bp-tiles').innerHTML = s.tiles.map((t) => '<div>' + esc(t) + '</div>').join('');
    $$('.bp-site', stage).forEach((el) => el.style.setProperty('--bp-acc', s.accent));
  }
  function paintChips(v) {
    const ids = v.ids.slice(0, 4);
    const more = v.ids.length - ids.length;
    $('#bp-chips').innerHTML = ids.map((id, i) => '<li style="--i:' + i + '"><span class="gic">' + icon(featById[id].icon) + '</span><b>' + esc(featById[id].name) + '</b><em>' + (v.own ? 'in your plan' : 'suggested') + '</em></li>').join('') +
      '';
  }
  function paintTotal(v) {
    $('#bp-tier').textContent = v.q.tier ? v.q.tier.label : '';
    $('#bp-meter').style.transform = 'scaleX(' + v.q.meter / 100 + ')';
    say(v.own ? "So far that's a " + v.q.tier.label + ' project. About ' + weeksText(v.q.weeks) + ' weeks after the audit.' : (v.b.key === v.b.id || !v.b.label ? HERO_LINE[v.b.id] || '' : 'A Premium build for ' + v.b.label.toLowerCase() + ', sketched in seconds.'));
  }

  function finalFrame() {
    timers.forEach(clearTimeout); timers = [];
    running = false;
    stage.classList.remove('run');
    stage.classList.add('final', 'filled');
    hero.classList.add('final');
    $('#madlib').classList.remove('invite');
    if (current) { paintChips(current); paintTotal(current); }
    markPlayed();
    requestAnimationFrame(() => requestAnimationFrame(() => stage.classList.remove('final')));
    removeSkip();
  }
  const skip = () => { if (running) finalFrame(); };
  const SKIP_EVENTS = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
  function removeSkip() { SKIP_EVENTS.forEach((ev) => removeEventListener(ev, skip)); }

  function play() {
    running = true;
    SKIP_EVENTS.forEach((ev) => addEventListener(ev, skip, { passive: true }));
    $('#bp-meter').style.transform = 'scaleX(0)';
    requestAnimationFrame(() => { stage.classList.add('run'); hero.classList.add('go'); });
    timers.push(setTimeout(() => stage.classList.add('filled'), 1100));
    timers.push(setTimeout(() => paintTotal(current), 1600));
    timers.push(setTimeout(() => $('#madlib').classList.add('invite'), 2600));
    timers.push(setTimeout(() => { $('#madlib').classList.add('done'); running = false; markPlayed(); removeSkip(); stage.classList.remove('run'); }, 3200));
  }

  function rebuild() {
    if (reduced()) return;
    stage.classList.add('swap');
    stage.classList.remove('filled', 'run');
    void stage.offsetWidth;
    stage.classList.remove('swap');
    stage.classList.add('run');
    setTimeout(() => stage.classList.add('filled'), 60);
    setTimeout(() => stage.classList.remove('run'), 900);
  }

  let first = true;
  store.subscribe((state) => {
    const v = preview(state);
    current = v;
    stage.dataset.style = state.sel.style;
    if (first) {
      first = false;
      lastBiz = v.b.key; lastStyle = state.sel.style;
      paintContent(v); paintChips(v);
      if (reduced() || playedBefore()) finalFrame(); else play();
      return;
    }
    if (v.b.key !== lastBiz) {
      lastBiz = v.b.key;
      if (running) finalFrame();
      paintContent(v);
      rebuild();
    }
    if (state.sel.style !== lastStyle) lastStyle = state.sel.style;
    paintChips(v);
    if (!running) paintTotal(v);
  });
}
