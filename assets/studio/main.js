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
import { $ } from './util.js';
import { mountTracking } from './track.js';

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

async function boot() {
  if (redirectOldHash()) return;
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
  mountPlans(store);
  if (on('#s-business')) mountConfigurator(store);
  if (on('#s-care')) mountCare(store);
  if (on('#plan')) { mountSummary(store); sheet.init(); mountEndings(store); }
  if (on('#wall')) mountDelivered(store);
  mountTracking(store);
  carryLinks();
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
