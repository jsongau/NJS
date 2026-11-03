// Configurator steps 01 to 06: business, package tabs, features, pages, style, extras (Ross 3.3).
import { $, $$, esc, radioGroup, stepper, toast, weeksText } from './util.js';
import { icon } from './icons.js';
import { quote, bandIndexForPages, resolveBusiness } from './engine.js';

// Slider stops: equal track per band instead of a linear 1 to 200 scale.
export const PAGE_STOPS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 18, 20, 25, 30, 40, 50, 75, 100, 150, 200];
const LEVEL = { 2: 'Premium-level', 3: 'Partner-level' };

export function stopIndex(pages) {
  let i = PAGE_STOPS.findIndex((s) => s >= pages);
  if (i === -1) i = PAGE_STOPS.length - 1;
  return i;
}

export function reasonLine(q, catalog) {
  if (!q.tier) return '';
  const t = q.tier.label;
  if (q.tier.reason === 'page_band') return '"' + q.page_band.label + '" makes this a ' + t + ' build.';
  if (q.tier.reason === 'feature_count') return q.features.length + ' features make this a ' + t + ' build.';
  const top = q.features.map((id) => catalog.features.find((f) => f.id === id)).sort((a, b) => b.weight - a.weight)[0];
  return top.weight === 1 ? 'Up to three Basic-level features stay a Basic build.' : top.name + ' makes this a ' + t + ' build.';
}

export function mountConfigurator(store) {
  const { catalog, actions } = store;
  const flags = catalog.flags || {};
  const bizById = Object.fromEntries(catalog.business_types.map((b) => [b.id, b]));

  // 01 Business: industry, then the kind within it, or free text. Each kind maps to a profile.
  const inds = catalog.industries || [];
  const updInd = radioGroup($('#cfg-ind'), inds.map((i) => ({ id: i.id, cls: 'ind-tile', html: '<span class="gic">' + icon(i.id) + '</span><span>' + esc(i.label) + '</span>' })).concat({ id: 'other', cls: 'ind-tile ghost', html: '<span class="gic">' + icon('other') + '</span><span>Something else</span>' }), (id) => {
    actions.setIndustry(id);
    if (id === 'other') { const q = $('#biz-q'); q.focus(); }
  });
  const secEl = $('#cfg-sec');
  let secFor = null;
  function renderSectors(indId) {
    secFor = indId;
    const ind = inds.find((i) => i.id === indId);
    $('#sec-k').hidden = !ind; secEl.hidden = !ind;
    secEl.innerHTML = ind ? ind.sectors.map((x) => '<button type="button" class="kind" aria-pressed="false" data-sec="' + x.id + '">' + esc(x.label) + '</button>').join('') +
      '<button type="button" class="kind ghost" data-sec="__own">Not listed? Type it</button>' : '';
  }
  secEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sec]');
    if (!b) return;
    if (b.dataset.sec === '__own') { const q = $('#biz-q'); q.focus(); q.placeholder = 'Type your kind of ' + inds.find((i) => i.id === secFor).label.toLowerCase().split(' ')[0] + ' business'; return; }
    actions.setSector(secFor, b.dataset.sec);
  });

  const qEl = $('#biz-q');
  const suggEl = $('#biz-sugg');
  const ALL = inds.flatMap((i) => i.sectors.map((x) => ({ ind: i, sec: x, hay: (x.label + ' ' + i.label).toLowerCase() })));
  function closeSugg() { suggEl.hidden = true; qEl.setAttribute('aria-expanded', 'false'); }
  function showSugg() {
    const t = qEl.value.trim();
    if (!t) { closeSugg(); return; }
    const words = t.toLowerCase().split(/\s+/);
    const hits = ALL.filter((h) => words.every((w) => h.hay.includes(w))).slice(0, 5);
    suggEl.innerHTML = hits.map((h) => '<button type="button" data-i="' + h.ind.id + '" data-s="' + h.sec.id + '"><b>' + esc(h.sec.label) + '</b><span>' + esc(h.ind.label) + '</span></button>').join('') +
      '<button type="button" class="own" data-own="1"><b>Use "' + esc(t) + '"</b><span>Your own words</span></button>';
    suggEl.hidden = false; qEl.setAttribute('aria-expanded', 'true');
  }
  function pickOwn() { const t = qEl.value.trim(); if (!t) return; actions.setBizText(t); qEl.value = ''; closeSugg(); }
  qEl.addEventListener('input', showSugg);
  qEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); pickOwn(); }
    else if (e.key === 'Escape') closeSugg();
    else if (e.key === 'ArrowDown' && !suggEl.hidden) { e.preventDefault(); const f = suggEl.querySelector('button'); if (f) f.focus(); }
  });
  suggEl.addEventListener('keydown', (e) => {
    const bs = $$('button', suggEl); const i = bs.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); (bs[i + 1] || bs[0]).focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); i <= 0 ? qEl.focus() : bs[i - 1].focus(); }
    if (e.key === 'Escape') { closeSugg(); qEl.focus(); }
  });
  suggEl.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.own) { pickOwn(); return; }
    actions.setSector(b.dataset.i, b.dataset.s);
    qEl.value = ''; closeSugg();
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.biz-search')) closeSugg(); });

  // 02 Package tabs (manual activation: arrows move focus, Enter, Space or click loads the set)
  const tabsEl = $('#tabs');
  tabsEl.innerHTML = catalog.tiers.map((t, i) => '<button type="button" role="tab" class="tab" id="tab-' + t.id + '" data-t="' + t.id + '" aria-controls="panel-' + t.id + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '">' + esc(t.label) + '</button>').join('') + '<span class="tab-line" aria-hidden="true"></span>';
  const tabBtns = $$('.tab', tabsEl);
  tabsEl.addEventListener('click', (e) => {
    const b = e.target.closest('.tab');
    if (!b) return;
    actions.setTab(b.dataset.t);
    toast('Loaded the ' + b.textContent + ' starting set.', () => actions.undo());
  });
  tabsEl.addEventListener('keydown', (e) => {
    const d = { ArrowRight: 1, ArrowLeft: -1, Home: -99, End: 99 }[e.key];
    if (!d) return;
    e.preventDefault();
    const i = tabBtns.indexOf(document.activeElement);
    const n = d === -99 ? 0 : d === 99 ? tabBtns.length - 1 : (i + d + tabBtns.length) % tabBtns.length;
    tabBtns[n].focus();
  });
  const panelsEl = $('#panels');
  function renderPanels(biz) {
    panelsEl.innerHTML = catalog.tiers.map((t) => {
      const preset = (bizById[biz].preset[t.id] || []).map((id) => catalog.features.find((f) => f.id === id).name);
      const inc = t.includes.map((x) => (x.endsWith(':') ? '<li class="sub">' + esc(x) + '</li>' : '<li>' + esc(x) + '</li>')).join('');
      return '<div class="panel" role="tabpanel" id="panel-' + t.id + '" aria-labelledby="tab-' + t.id + '" tabindex="0">' +
        '<p class="for">' + esc(t.for) + '</p><span class="when">About ' + weeksText(t.weeks) + ' weeks</span><ul>' + inc + '</ul>' +
        '<p class="help" style="margin:0">Starting set: ' + esc(preset.join(', ')) + '.</p></div>';
    }).join('');
  }

  // 03 Features
  const featEl = $('#features');
  function renderFeatures(biz) {
    const sugg = new Set(bizById[biz].preset.grow || []);
    featEl.innerHTML = catalog.features.map((f) => {
      const line = (f.wording && f.wording[biz]) || f.desc;
      const proj = f.proof && store.projects.projects.find((p) => p.id === f.proof);
      const tags = [sugg.has(f.id) ? 'Suggested for this business' : null, LEVEL[f.weight] || null].filter(Boolean).join(' · ');
      return '<div class="card" data-id="' + f.id + '">' +
        '<button type="button" class="card-hit" aria-pressed="false"' + (f.weight === 3 ? ' title="This one moves the project to Partner."' : f.tip ? ' title="' + esc(f.tip) + '"' : '') + '>' +
        '<span class="ic gic">' + icon(f.icon) + '</span><b>' + esc(f.name) + '</b><span class="d">' + esc(line) + '</span>' +
        (tags ? '<span class="tagl">' + esc(tags) + '</span>' : '') +
        '<span class="state"><span class="st-t">Add</span>' + icon('check') + '</span></button>' +
        (proj ? '<a class="proofl" href="#p-' + proj.id + '">Shipped before in ' + esc(proj.name) + '</a>' : '') + '</div>';
    }).join('');
  }
  featEl.addEventListener('click', (e) => { const b = e.target.closest('.card-hit'); if (b) actions.toggleFeature(b.closest('.card').dataset.id); });

  // 04 Pages slider
  const range = $('#pages');
  range.max = String(PAGE_STOPS.length - 1);
  const ticks = $('#ticks');
  ticks.innerHTML = catalog.page_bands.map((b, i) => {
    const idx = stopIndex(b.min);
    const lbl = i === catalog.page_bands.length - 1 ? '150+' : String(b.min);
    return '<span style="left:' + ((idx / (PAGE_STOPS.length - 1)) * 100).toFixed(2) + '%">' + lbl + '</span>';
  }).join('');
  range.addEventListener('input', () => {
    const n = PAGE_STOPS[Number(range.value)];
    const before = store.get().sel.features.length;
    actions.setPages(n);
    const after = store.get().sel.features.length;
    if (after > before) toast("Added 'Pages from your data'. Past about 40 pages, generating them is how I keep them accurate.");
  });

  // 05 Style
  const stylesEl = $('#styles');
  stylesEl.innerHTML = catalog.styles.map((s) => '<button type="button" class="style-opt" data-s="' + s.id + '" aria-pressed="false">' +
    (s.swatch && s.swatch.length ? '<span class="sw" aria-hidden="true">' + s.swatch.map((c) => '<i style="background:' + c + '"></i>').join('') + '</span>' : '<span class="sw none" aria-hidden="true">on the call</span>') +
    '<b>' + esc(s.label) + '</b><span>' + esc(s.line) + '</span></button>').join('');
  stylesEl.addEventListener('click', (e) => { const b = e.target.closest('.style-opt'); if (b) actions.setStyle(b.dataset.s); });

  // 06 Extras
  const addEl = $('#addons');
  let fitStep = null;
  function renderAddons(biz) {
    addEl.innerHTML = catalog.addons.map((a) => {
      const line = (a.wording && a.wording[biz]) || a.desc;
      const off = a.id === 'rush' && flags.rush_available === false;
      const wide = a.billing === 'separate';
      let extra = '';
      if (a.id === 'rush') extra = '<p class="rose" id="rush-note">' + esc(off ? "Rush isn't available this month. I'll tell you on the call when the next slot opens." : a.note) + '</p>';
      if (wide) {
        extra = '<p class="fit-line">' + esc(a.line) + '</p>' +
          '<ul class="rounds" aria-label="A session"><li><b>R1</b>Wraps and stance</li><li><b>R2</b>Jab, cross, hook</li><li><b>R3</b>Pad work</li><li><b>R4</b>Breath and cool down</li></ul>' +
          '<div class="fit-steps" id="fit-steps" hidden><span class="lbl" id="fit-l">Sessions</span><div class="stepper" id="fit-stepper"></div><span class="lbl">Arranged separately from the build.</span></div>' +
          '<p class="fit-foot">' + esc(a.footnote) + '</p>';
      }
      return '<div class="card' + (wide ? ' wide' : '') + '" data-a="' + a.id + '">' +
        '<button type="button" class="card-hit" aria-pressed="false"' + (off ? ' disabled aria-disabled="true"' : '') + '>' +
        '<span class="ic gic">' + icon(a.icon) + '</span><b>' + esc(a.name) + '</b><span class="d">' + esc(a.desc + (line !== a.desc ? ' ' + line : '')) + '</span>' +
        '<span class="state"><span class="st-t">Add</span>' + icon('check') + '</span></button>' + extra + '</div>';
    }).join('');
    const fs = $('#fit-stepper');
    fitStep = fs ? stepper(fs, { min: 1, max: 10, labelId: 'fit-l', onChange: (v, dir) => { actions.setFitSessions(v); fitDir = dir; } }) : null;
  }
  let fitDir = 0;
  addEl.addEventListener('click', (e) => { const b = e.target.closest('.card-hit'); if (b && !b.disabled) actions.toggleAddon(b.closest('.card').dataset.a); });

  let lastBiz = null;
  function setCard(card, on) {
    card.classList.toggle('on', on);
    const b = $('.card-hit', card);
    b.setAttribute('aria-pressed', on);
    $('.st-t', card).textContent = on ? 'Added' : 'Add';
  }

  store.subscribe(({ sel, quote: q }) => {
    if (sel.business_type !== lastBiz) {
      lastBiz = sel.business_type;
      const focusId = document.activeElement && document.activeElement.closest('.card') ? document.activeElement.closest('.card').dataset : null;
      renderPanels(lastBiz); renderFeatures(lastBiz); renderAddons(lastBiz);
      if (focusId) { const c = $('.card[data-id="' + focusId.id + '"] .card-hit, .card[data-a="' + focusId.a + '"] .card-hit'); if (c) c.focus(); }
      $('#dental-note').hidden = lastBiz !== 'dental';
    }
    const rb = resolveBusiness(sel, catalog);
    updInd(rb.industry || 'other');
    if (rb.industry !== secFor || !secEl.children.length) renderSectors(rb.industry);
    $$('[data-sec]', secEl).forEach((b) => b.setAttribute('aria-pressed', b.dataset.sec === rb.sector));
    $('#biz-own').hidden = !rb.text && rb.industry !== null;
    $('#biz-own-t').textContent = rb.text || 'your business';

    // Tabs show the computed tier; with nothing picked, the last chosen tab (or Basic).
    const shown = q.tier ? q.tier.id : sel.package_tab || 'launch';
    tabBtns.forEach((b, i) => {
      const on = b.dataset.t === shown;
      b.setAttribute('aria-selected', on);
      b.tabIndex = on ? 0 : -1;
      if (on) tabsEl.style.setProperty('--x', i);
    });
    $$('.panel', panelsEl).forEach((p) => p.classList.toggle('on', p.id === 'panel-' + shown));
    $('#tier-why').textContent = reasonLine(q, catalog);

    $$('.card[data-id]', featEl).forEach((c) => setCard(c, sel.features.includes(c.dataset.id)));
    $('#feat-count').textContent = sel.features.length + ' picked';

    const idx = stopIndex(sel.pages);
    if (Number(range.value) !== idx) range.value = String(idx);
    range.style.setProperty('--fill', ((idx / (PAGE_STOPS.length - 1)) * 100).toFixed(2) + '%');
    const band = catalog.page_bands[bandIndexForPages(sel.pages, catalog)];
    const last = idx === PAGE_STOPS.length - 1;
    $('#pages-val').innerHTML = (last ? 'Hundreds' : 'About ' + sel.pages) + '<small>pages</small>';
    $('#band-badge').textContent = band.label;
    $('#band-line').textContent = band.line;
    range.setAttribute('aria-valuetext', (last ? 'Hundreds of pages' : 'About ' + sel.pages + ' pages') + ', ' + band.label);

    $$('.style-opt', stylesEl).forEach((b) => b.setAttribute('aria-pressed', b.dataset.s === sel.style));

    $$('.card[data-a]', addEl).forEach((c) => setCard(c, sel.addons.includes(c.dataset.a)));
    const fitOn = sel.addons.includes('fit');
    const fsw = $('#fit-steps');
    if (fsw) fsw.hidden = !fitOn;
    if (fitStep) { fitStep(sel.fit_sessions || 1, fitDir); fitDir = 0; }
    const rn = $('#rush-note');
    if (rn && flags.rush_available !== false && q.tier) {
      const withRush = sel.addons.includes('rush') ? q : quote({ ...sel, addons: sel.addons.concat('rush') }, catalog);
      rn.textContent = 'Tighter timeline, and it adds cost. About ' + weeksText(withRush.weeks) + ' weeks with Rush. Confirmed after the audit, because it depends on my schedule.';
    }
  });
}
