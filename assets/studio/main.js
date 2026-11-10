// Boot: load the public catalog and projects, create the store, mount every view.
// The single-file preview inlines both JSON files as <script type="application/json">.
import { createStore } from './store.js';
import { mountConfigurator } from './configurator.js';
import { mountCare } from './care.js';
import { mountSummary, sheet } from './summary.js';
import { mountEndings } from './endings.js';
import { mountDelivered, mountProof } from './delivered.js';
import { mountBlueprint } from './blueprint.js';
import { mountPlans } from './plans.js';
import { mountMadlib } from './madlib.js';
import { mountCrew } from './crew.js';
import { mountMegaNav } from './meganav.js';
import { $ } from './util.js';
import { mountTracking, track } from './track.js';
import { mountFitness } from './fitness.js';

const BASE = '/assets/studio/data/';

async function loadJson(id, file) {
  const inline = document.getElementById(id);
  if (inline) return JSON.parse(inline.textContent);
  const r = await fetch(BASE + file, { priority: 'high' });
  if (!r.ok) throw new Error(file + ' ' + r.status);
  return r.json();
}

function clock() {
  const el = $('#clock');
  if (!el) return;
  const tick = () => { el.textContent = 'Brea, CA · ' + new Date().toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit' }) + ' PT'; };
  tick();
  setInterval(tick, 15000);
}

// Old one-page links (/#build, /#delivered...) now live on their own pages.
const MOVED = { build: '/build', pricing: '/plans', delivered: '/work', 's-care': '/care', crew: '/crew' };
function redirectOldHash() {
  const h = location.hash.slice(1);
  if (location.pathname === '/' && MOVED[h]) { location.replace(MOVED[h]); return true; }
  return false;
}

// Links marked data-carry take the current selection (kept in the hash) with them.
function carryLinks() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-carry]');
    if (!a || !location.hash || location.hash.length < 3) return;
    const u = new URL(a.href, location.href);
    if (!u.hash) { u.hash = location.hash; a.href = u.pathname + u.search + u.hash; }
  });
}

// Phone menu: the header hides the tab links under 860px, so a Menu button opens them.
function phoneMenu() {
  const btn = $('#menu-btn');
  const menu = $('#m-menu');
  if (!btn || !menu) return;
  const set = (open) => {
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    if (open) { const f = menu.querySelector('summary, a'); if (f) f.focus({ preventScroll: true }); }
  };
  btn.addEventListener('click', () => set(menu.hidden));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { set(false); btn.focus(); } });
  document.addEventListener('click', (e) => { if (!menu.hidden && !e.target.closest('#m-menu, #menu-btn')) set(false); });
  addEventListener('resize', () => { if (innerWidth >= 860 && !menu.hidden) set(false); }, { passive: true });
}

// Home sub-menu: jumps to a section without touching the hash (the hash holds the plan
// selection), and marks the section in view.
function subNav() {
  const nav = $('#subnav');
  if (!nav) return;
  const links = [...nav.querySelectorAll('a')];
  const targets = links.map((a) => document.getElementById(a.getAttribute('href').slice(1)));
  nav.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const t = document.getElementById(a.getAttribute('href').slice(1));
    if (!t) return;
    e.preventDefault();
    // Land on the heading, not on the section's empty top padding.
    const head = t.querySelector('.sec-h, .step-h, .kick, .nf-h') || t;
    head.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });
  const mark = () => {
    const line = ($('#top-bar') || {}).offsetHeight + nav.offsetHeight + 24;
    let cur = -1;
    targets.forEach((t, i) => { if (t && t.getBoundingClientRect().top <= line) cur = i; });
    links.forEach((a, i) => { if (i === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    nav.classList.toggle('stuck', nav.getBoundingClientRect().top <= ($('#top-bar') || {}).offsetHeight + 1);
    const on = links[cur];
    if (on && nav.scrollWidth > nav.clientWidth) {
      const w = nav.querySelector('.wrap');
      const l = on.offsetLeft - 16;
      if (l < w.scrollLeft || on.offsetLeft + on.offsetWidth > w.scrollLeft + w.clientWidth) w.scrollTo({ left: l, behavior: 'smooth' });
    }
  };
  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; mark(); }); } }, { passive: true });
  mark();
}

// Business | Fitness switch: a plain link to the other side, counted on the way out.
// The full-screen color wipe was removed 2026-11-09 (Jay: "get rid of that fancy animation").
function modeSwitch() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-mode-link]');
    if (!a || a.getAttribute('aria-current')) return;
    track('mode_switch', { detail: a.dataset.modeLink });
  });
}

async function boot() {
  if (redirectOldHash()) return;
  modeSwitch();
  phoneMenu();
  subNav();
  const [catalog, projects] = await Promise.all([
    loadJson('studio-catalog-data', 'studio-catalog.public.json'),
    loadJson('studio-projects-data', 'projects.json'),
  ]);
  document.body.dataset.prices = catalog.prices === 'shown' ? 'range' : 'meter';
  const store = createStore(catalog, projects);
  // Each page carries only some sections; a view mounts only where its root is on the page.
  const on = (sel) => !!$(sel);
  if (on('#stage')) mountBlueprint(store);
  if (on('#proof')) mountProof(store);
  mountMadlib(store);
  mountCrew(store);
  mountMegaNav(store);
  mountPlans(store);
  if (on('#s-business')) mountConfigurator(store);
  if (on('#s-care')) mountCare(store);
  if (on('#plan')) { mountSummary(store); sheet.init(); mountEndings(store); }
  if (on('#wall')) mountDelivered(store);
  mountTracking(store);
  carryLinks();
  mountFitness();
  clock();
  // Logo: the j dot hops once on arrival (CSS); hovering the header logo snaps the S straight
  // (a few lines of JS inside the SVG drive that part).
  const lm = $('.logo-m');
  if (lm) setTimeout(() => { lm.classList.add('go'); setTimeout(() => lm.classList.remove('go'), 2300); }, 600);
  const top = $('#top-bar');
  const onScroll = () => top.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  window.__studio = store;
}

boot().catch((e) => {
  console.error(e);
  const p = document.createElement('p');
  p.className = 'wrap msg bad';
  p.textContent = "Couldn't load the configurator. Refresh the page, or book a call instead.";
  const b = document.getElementById('build');
  if (b) b.prepend(p);
});
