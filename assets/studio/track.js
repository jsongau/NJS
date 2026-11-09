// Funnel events (Wave 0). Fire-and-forget beacons to the event-intake edge function.
// No personal data leaves the page: no names, emails or phone numbers, ever. A visit gets a
// random session id that lives only in sessionStorage and dies with the tab.

const EVENTS = ['page_view', 'picker_open', 'business_picked', 'plan_picked', 'build_step', 'plan_seen', 'form_open', 'lead_sent', 'call_click', 'mode_switch', 'goal_picked', 'fit_tab', 'fit_region', 'book_step'];
let endpoint = null;
let base = null;

function sid() {
  const make = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => (b % 36).toString(36)).join('');
  try {
    let s = sessionStorage.getItem('njs-sid');
    if (!s) { s = make(); sessionStorage.setItem('njs-sid', s); }
    return s;
  } catch (_) { return base ? base.sid : make(); }
}

function device() {
  const w = innerWidth;
  return w < 700 ? 'phone' : w < 1024 ? 'tablet' : 'desktop';
}

function source() {
  const p = new URLSearchParams(location.search);
  let ref = null;
  try { const h = new URL(document.referrer).host; if (h && h !== location.host) ref = h; } catch (_) { /* no referrer */ }
  return { referrer_host: ref, utm_source: p.get('utm_source'), utm_campaign: p.get('utm_campaign') };
}

// Turn tracking on. The endpoint sits next to lead-intake in the same Supabase project.
export function startTracking(leadIntakeUrl) {
  if (!leadIntakeUrl || typeof navigator === 'undefined' || !navigator.sendBeacon) return false;
  endpoint = leadIntakeUrl.replace(/\/lead-intake$/, '/event-intake');
  base = { sid: sid(), device: device(), mode: document.body.dataset.mode === 'fitness' ? 'fitness' : 'business', ...source() };
  return true;
}

export function track(event, props = {}) {
  if (!endpoint || !EVENTS.includes(event)) return;
  const body = { ...base, event, page: location.pathname, ...props };
  try { navigator.sendBeacon(endpoint, new Blob([JSON.stringify(body)], { type: 'text/plain' })); } catch (_) { /* never break the page */ }
}

// Listen to the store's own change events, plus a few views and clicks, so no view module
// has to know tracking exists beyond the three calls in endings.js and madlib.js.
export function mountTracking(store) {
  if (!startTracking(store.catalog.links && store.catalog.links.lead_intake)) return;
  const ctx = () => { const s = store.get().sel; return { business_type: s.sector || s.industry || s.business_type || null, tier: s.package_tab || null }; };
  track('page_view', ctx());

  const PICK = { sector_set: 'business_picked', industry_set: 'business_picked', biz_text_set: 'business_picked', package_tab_set: 'plan_picked' };
  store.subscribe(({ meta }) => {
    if (!meta || meta.init) return;
    const ev = PICK[meta.event];
    if (ev) track(ev, { ...ctx(), detail: meta.id || meta.tab || null });
  });

  if (typeof IntersectionObserver === 'function') {
    const seen = new Set();
    const io = new IntersectionObserver((list) => list.forEach((e) => {
      if (!e.isIntersecting || seen.has(e.target)) return;
      seen.add(e.target);
      if (e.target.id === 'plan') track('plan_seen', ctx());
      else track('build_step', { ...ctx(), detail: e.target.id });
    }), { threshold: 0.4 });
    document.querySelectorAll('#plan, .cfg .step').forEach((el) => io.observe(el));
  }
}
