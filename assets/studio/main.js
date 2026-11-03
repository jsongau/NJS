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

async function boot() {
  const [catalog, projects] = await Promise.all([
    loadJson('studio-catalog-data', 'studio-catalog.public.json'),
    loadJson('studio-projects-data', 'projects.json'),
  ]);
  document.body.dataset.prices = catalog.prices === 'shown' ? 'range' : 'meter';
  const store = createStore(catalog, projects);
  mountBlueprint(store);
  mountProof(store);
  mountMadlib(store);
  mountPlans(store);
  mountConfigurator(store);
  mountCare(store);
  mountSummary(store);
  sheet.init();
  mountEndings(store);
  mountDelivered(store);
  mountTracking(store);
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
