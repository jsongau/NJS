/* Landing page builder UI. State is plain JSON; every change goes through commit() so undo, autosave and the
   preview stay in step. The preview is a same-origin iframe; its HTML is exactly what a download would be. */
(function () {
  'use strict';
  var FB = window.FB, $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var app = $('#builder'); if (!FB || !app) return;
  var KEY = 'fb-memorial-v1', reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hap = function (k) { if (window.fmHaptic) window.fmHaptic(k); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var uid = function () { return 's' + Math.random().toString(36).slice(2, 8); };

  function fromTemplate(id) {
    var t = FB.TEMPLATES.filter(function (x) { return x.id === id; })[0] || FB.TEMPLATES[0];
    return { tpl: t.id, brand: Object.assign({}, FB.BRAND, { palette: t.palette, font: t.font }), sections: t.sections.map(function (s) { return { id: uid(), type: s.type, angle: s.angle, layout: s.layout, f: {} }; }) };
  }
  function valid(s) { return s && s.brand && Array.isArray(s.sections) && s.sections.every(function (x) { return FB.SECTIONS[x.type]; }); }

  var state, sel = null, hist = [], fut = [], lastKey = '', lastAt = 0;
  var q = new URLSearchParams(location.search);
  if (q.get('t')) state = fromTemplate(q.get('t'));
  else { try { var saved = JSON.parse(localStorage.getItem(KEY) || 'null'); if (valid(saved)) state = saved; } catch (e) { /* storage blocked */ } }
  if (!state) state = fromTemplate('gift');

  function snap() { return JSON.stringify({ state: state, sel: sel }); }
  /* key groups rapid edits to one field into a single undo step */
  function commit(key) {
    var now = Date.now();
    if (!(key && key === lastKey && now - lastAt < 1200)) { hist.push(snap()); if (hist.length > 80) hist.shift(); fut = []; }
    lastKey = key || ''; lastAt = now;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* fine */ } $('#fbUndo').disabled = !hist.length; $('#fbRedo').disabled = !fut.length; }
  function restore(s) { var o = JSON.parse(s); state = o.state; sel = o.sel; lastKey = ''; all(); }
  $('#fbUndo').addEventListener('click', function () { if (!hist.length) return; fut.push(snap()); restore(hist.pop()); hap('tap'); });
  $('#fbRedo').addEventListener('click', function () { if (!fut.length) return; hist.push(snap()); restore(fut.pop()); hap('tap'); });
  document.addEventListener('keydown', function (e) {
    if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'z' || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    e.preventDefault(); $(e.shiftKey ? '#fbRedo' : '#fbUndo').click();
  });

  var toastT;
  function toast(msg, undo) {
    var t = $('#fbToast'); t.innerHTML = '<span>' + esc(msg) + '</span>' + (undo ? '<button type="button">Undo</button>' : '');
    t.classList.add('fb-on'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('fb-on'); }, 4200);
    var b = $('button', t); if (b) b.addEventListener('click', function () { $('#fbUndo').click(); t.classList.remove('fb-on'); });
  }

  /* ---------- templates strip ---------- */
  var tplBox = $('#fbTpl');
  tplBox.innerHTML = FB.TEMPLATES.map(function (t) {
    var p = FB.PALETTES[t.palette];
    return '<button type="button" class="fb-tpl" data-t="' + t.id + '" aria-pressed="false"><span class="fb-sw" aria-hidden="true"><i style="background:' + p.bg + '"></i><i style="background:' + p.accent + '"></i><i style="background:' + p.ink + '"></i></span><b>' + esc(t.name) + '</b><small>' + esc(t.desc) + '</small></button>';
  }).join('');
  tplBox.addEventListener('click', function (e) {
    var b = e.target.closest('.fb-tpl'); if (!b || b.dataset.t === state.tpl) return;
    commit(); var keep = { name: state.brand.name, phone: state.brand.phone, area: state.brand.area, license: state.brand.license };
    state = fromTemplate(b.dataset.t); Object.assign(state.brand, keep); sel = null; all(); hap('pick');
    toast('Loaded "' + b.querySelector('b').textContent + '".', true);
    if (innerWidth <= 900) setView('preview');
  });

  /* ---------- outline ---------- */
  var outline = $('#fbOutline');
  function label(s) { var a = s.angle && FB.ANGLES[s.angle]; return a ? a.name : (s.layout ? '' : 'Standard wording'); }
  function renderOutline() {
    outline.innerHTML = state.sections.map(function (s, i) {
      return '<li class="fb-o' + (s.id === sel ? ' fb-sel' : '') + '" draggable="true" data-i="' + i + '"><span class="fb-grip" aria-hidden="true"><svg viewBox="0 0 12 16"><circle cx="3" cy="3" r="1.5"/><circle cx="9" cy="3" r="1.5"/><circle cx="3" cy="8" r="1.5"/><circle cx="9" cy="8" r="1.5"/><circle cx="3" cy="13" r="1.5"/><circle cx="9" cy="13" r="1.5"/></svg></span>' +
        '<button type="button" class="fb-o-main" data-sel="' + s.id + '"><b>' + esc(FB.SECTIONS[s.type].name) + '</b><small>' + esc(label(s) || '') + '</small></button>' +
        '<span class="fb-o-act"><button type="button" data-mv="-1" aria-label="Move ' + esc(FB.SECTIONS[s.type].name) + ' up"' + (i === 0 ? ' disabled' : '') + '><svg viewBox="0 0 20 20"><path d="M10 15V5M5 10l5-5 5 5"/></svg></button><button type="button" data-mv="1" aria-label="Move ' + esc(FB.SECTIONS[s.type].name) + ' down"' + (i === state.sections.length - 1 ? ' disabled' : '') + '><svg viewBox="0 0 20 20"><path d="M10 5v10M5 10l5 5 5-5"/></svg></button><button type="button" data-rm aria-label="Remove ' + esc(FB.SECTIONS[s.type].name) + '"><svg viewBox="0 0 20 20"><path d="M5 5l10 10M15 5L5 15"/></svg></button></span></li>';
    }).join('');
  }
  function move(i, d) { var j = i + d; if (j < 0 || j >= state.sections.length) return; commit(); var a = state.sections; a.splice(j, 0, a.splice(i, 1)[0]); all(); hap('tap'); }
  function remove(i) { commit(); var s = state.sections.splice(i, 1)[0]; if (sel === s.id) sel = null; all(); hap('warn'); toast('Removed ' + FB.SECTIONS[s.type].name + '.', true); }
  outline.addEventListener('click', function (e) {
    var li = e.target.closest('.fb-o'); if (!li) return; var i = +li.dataset.i;
    var mv = e.target.closest('[data-mv]'); if (mv) return move(i, +mv.dataset.mv);
    if (e.target.closest('[data-rm]')) return remove(i);
    var b = e.target.closest('[data-sel]'); if (b) { select(b.dataset.sel, true); if (innerWidth <= 900) setView('edit'); }
  });
  var dragI = null;
  outline.addEventListener('dragstart', function (e) { var li = e.target.closest('.fb-o'); if (!li) return; dragI = +li.dataset.i; li.classList.add('fb-drag'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', String(dragI)); } catch (x) { /* old browsers */ } });
  outline.addEventListener('dragover', function (e) { var li = e.target.closest('.fb-o'); if (dragI == null || !li) return; e.preventDefault(); $$('.fb-over', outline).forEach(function (x) { x.classList.remove('fb-over'); }); li.classList.add('fb-over'); });
  outline.addEventListener('drop', function (e) { var li = e.target.closest('.fb-o'); if (dragI == null || !li) return; e.preventDefault(); var to = +li.dataset.i; if (to !== dragI) { commit(); var a = state.sections; a.splice(to, 0, a.splice(dragI, 1)[0]); } dragI = null; all(); });
  outline.addEventListener('dragend', function () { dragI = null; $$('.fb-drag,.fb-over', outline).forEach(function (x) { x.classList.remove('fb-drag', 'fb-over'); }); });

  /* ---------- library ---------- */
  (function () {
    var groups = {};
    Object.keys(FB.SECTIONS).forEach(function (k) { var s = FB.SECTIONS[k]; (groups[s.group] = groups[s.group] || []).push(k); });
    $('#fbLib').innerHTML = Object.keys(groups).map(function (g) {
      return '<div class="fb-lg"><small>' + esc(g) + '</small><div>' + groups[g].map(function (k) { var s = FB.SECTIONS[k]; return '<button type="button" class="fb-add" data-add="' + k + '"><i aria-hidden="true">+</i><span><b>' + esc(s.name) + '</b><small>' + esc(s.desc) + '</small></span></button>'; }).join('') + '</div></div>';
    }).join('');
    $('#fbLib').addEventListener('click', function (e) {
      var b = e.target.closest('[data-add]'); if (!b) return; commit();
      var type = b.dataset.add, def = FB.SECTIONS[type], s = { id: uid(), type: type, angle: null, layout: def.layouts ? def.layouts[0][0] : null, f: {} };
      var at = sel ? state.sections.findIndex(function (x) { return x.id === sel; }) + 1 : state.sections.length;
      state.sections.splice(at, 0, s); sel = s.id; all(); scrollFrameTo(s.id); hap('pick');
      toast('Added ' + def.name + '.', true);
      if (innerWidth <= 900) setView('preview');
    });
  })();

  /* ---------- inspector ---------- */
  var insp = $('#fbInspector');
  function curSec() { return state.sections.filter(function (s) { return s.id === sel; })[0]; }
  function renderInspector() {
    var s = curSec();
    if (!s) return brandPanel();
    var def = FB.SECTIONS[s.type], opts = FB.angleOptions(s.type), vk = FB.variantKey(s), a = FB.ANGLES[vk];
    var h = '<div class="fb-insp-h"><div><b>' + esc(def.name) + '</b><small>' + esc(def.desc) + '</small></div><button type="button" class="fb-back" data-brand>Brand</button></div>';
    if (opts.length) {
      h += '<span class="fb-lab">Wording angle</span><div class="fb-angles" role="group" aria-label="Wording angle">' + (def.variants.base ? '<button type="button" data-angle="" aria-pressed="' + (vk === 'base') + '">Standard</button>' : '') + opts.map(function (k) { return '<button type="button" data-angle="' + k + '" aria-pressed="' + (vk === k) + '">' + esc(FB.ANGLES[k].name) + '</button>'; }).join('') + '</div>';
      if (a) h += '<div class="fb-why"><b>Why it works</b>' + esc(a.why) + ' <a href="' + a.src[1] + '" target="_blank" rel="noopener">Source: ' + esc(a.src[0]) + '</a></div>';
    }
    if (def.layouts) h += '<span class="fb-lab">Layout</span><div class="fb-lays" role="group" aria-label="Layout">' + def.layouts.map(function (l) { return '<button type="button" data-lay="' + l[0] + '" aria-pressed="' + ((s.layout || def.layouts[0][0]) === l[0]) + '">' + esc(l[1]) + '</button>'; }).join('') + '</div>';
    h += '<span class="fb-lab">Words</span>' + def.fields.map(function (f) {
      var v = FB.raw(s, f[0]), ed = s.f && s.f[f[0]] != null, id = 'fbf-' + f[0];
      return '<label class="fb-field' + (ed ? ' fb-edited' : '') + '" for="' + id + '"><span>' + esc(f[1]) + '</span>' + (f[2] ? '<textarea id="' + id + '" data-k="' + f[0] + '" rows="3">' + esc(v) + '</textarea>' : '<input id="' + id + '" data-k="' + f[0] + '" value="' + esc(v) + '">') + '</label>';
    }).join('');
    h += '<p class="fb-tip">Words in curly brackets, like {phone}, fill in from the Brand panel. Text in square brackets shows highlighted until the business supplies it.</p>';
    var i = state.sections.indexOf(s);
    h += '<div class="fb-acts"><button type="button" data-act="up"' + (i === 0 ? ' disabled' : '') + '>Move up</button><button type="button" data-act="down"' + (i === state.sections.length - 1 ? ' disabled' : '') + '>Move down</button><button type="button" data-act="dup">Duplicate</button>' + (s.f && Object.keys(s.f).length ? '<button type="button" data-act="reset">Reset wording</button>' : '') + '<button type="button" class="fb-del" data-act="rm">Remove</button></div>';
    insp.innerHTML = h;
  }
  function brandPanel() {
    var b = state.brand;
    var h = '<div class="fb-insp-h"><div><b>Brand</b><small>Name, contact details, colors and type for the whole page.</small></div></div>';
    h += [['name', 'Business name'], ['phone', 'Phone'], ['area', 'Service area'], ['license', 'License number']].map(function (f) { return '<label class="fb-field" for="fbb-' + f[0] + '"><span>' + f[1] + '</span><input id="fbb-' + f[0] + '" data-b="' + f[0] + '" value="' + esc(b[f[0]]) + '"></label>'; }).join('');
    h += '<span class="fb-lab">Colors</span><div class="fb-pals" role="group" aria-label="Colors">' + Object.keys(FB.PALETTES).map(function (k) { var p = FB.PALETTES[k]; return '<button type="button" class="fb-pal" data-pal="' + k + '" aria-pressed="' + (b.palette === k) + '"><span aria-hidden="true"><i style="background:' + p.bg + '"></i><i style="background:' + p.accent + '"></i><i style="background:' + p.ink + '"></i></span>' + esc(p.name) + '</button>'; }).join('') + '</div>';
    h += '<span class="fb-lab">Type</span><div class="fb-fonts" role="group" aria-label="Type">' + Object.keys(FB.FONTS).map(function (k) { return '<button type="button" data-font="' + k + '" aria-pressed="' + (b.font === k) + '">' + esc(FB.FONTS[k].name) + '</button>'; }).join('') + '</div>';
    h += '<p class="fb-tip">Click any section in the preview to change its wording angle, layout and words.</p>';
    insp.innerHTML = h;
  }
  insp.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t) return; var s = curSec();
    if (t.hasAttribute('data-brand')) { select(null); return; }
    if (t.dataset.angle != null && s) { commit(); s.angle = t.dataset.angle || null; s.f = {}; all(); hap('pick'); return; }
    if (t.dataset.lay && s) { commit(); s.layout = t.dataset.lay; all(); hap('pick'); return; }
    if (t.dataset.pal) { commit(); state.brand.palette = t.dataset.pal; all(); hap('pick'); return; }
    if (t.dataset.font) { commit(); state.brand.font = t.dataset.font; all(); hap('pick'); return; }
    if (t.dataset.act && s) {
      var i = state.sections.indexOf(s), a = t.dataset.act;
      if (a === 'up' || a === 'down') return move(i, a === 'up' ? -1 : 1);
      if (a === 'rm') return remove(i);
      if (a === 'reset') { commit(); s.f = {}; all(); toast('Wording reset.', true); return; }
      if (a === 'dup') { commit(); var c = JSON.parse(JSON.stringify(s)); c.id = uid(); state.sections.splice(i + 1, 0, c); sel = c.id; all(); scrollFrameTo(c.id); hap('pick'); }
    }
  });
  insp.addEventListener('input', function (e) {
    var el = e.target, s = curSec();
    if (el.dataset.k && s) { commit('f:' + s.id + el.dataset.k); s.f = s.f || {}; s.f[el.dataset.k] = el.value; el.closest('.fb-field').classList.add('fb-edited'); paint(); save(); }
    if (el.dataset.b) { commit('b:' + el.dataset.b); state.brand[el.dataset.b] = el.value; paint(); save(); }
  });

  /* ---------- preview frame ---------- */
  var frame = $('#fbFrame'), wrap = $('#fbFrameWrap'), stage = $('#fbStage'), ready = false, dev = 'desktop';
  var PREVIEW_CSS = '<style>.lp-s{position:relative;cursor:pointer;transition:box-shadow .2s}.lp-s:hover{box-shadow:inset 0 0 0 2px rgba(255,79,154,.45)}.lp-s.fb-sel{box-shadow:inset 0 0 0 3px #FF4F9A}.lp-s.fb-sel::after{content:attr(data-name);position:absolute;top:8px;left:8px;padding:3px 8px;border-radius:6px;background:#FF4F9A;color:#121416;font:600 11px/1.4 system-ui,sans-serif;letter-spacing:.04em;text-transform:uppercase;pointer-events:none}</style>';
  function doc() { return frame.contentDocument; }
  function paint() {
    if (!ready) return;
    var d = doc(), b = state.brand, f = FB.FONTS[b.font] || FB.FONTS.modern;
    d.getElementById('lp-css').textContent = FB.css(b);
    var link = d.querySelector('link[rel="stylesheet"]');
    if (f.url) { if (!link) { link = d.createElement('link'); link.rel = 'stylesheet'; d.head.appendChild(link); } if (link.getAttribute('href') !== f.url) link.setAttribute('href', f.url); } else if (link) link.remove();
    d.getElementById('lp-root').innerHTML = FB.renderBody(state);
    $$('.lp-s', d).forEach(function (el) { var s = state.sections.filter(function (x) { return x.id === el.dataset.sid; })[0]; if (s) el.setAttribute('data-name', FB.SECTIONS[s.type].name); el.classList.toggle('fb-sel', el.dataset.sid === sel); });
    d.title = b.name;
    FB.lpTools(d); renderSide();
  }
  frame.addEventListener('load', function () {
    ready = true; paint();
    var d = doc();
    d.addEventListener('click', function (e) {
      var a = e.target.closest('a,button'); if (a) e.preventDefault();
      var s = e.target.closest('.lp-s'); if (s) { select(s.dataset.sid); hap('tap'); if (innerWidth <= 900) toast('Selected ' + (s.getAttribute('data-name') || 'section') + '. Tap Edit to change it.'); }
    });
    d.addEventListener('submit', function (e) { e.preventDefault(); });
  });
  frame.srcdoc = FB.renderDoc(state, PREVIEW_CSS);
  function scrollFrameTo(id) { if (!ready) return; var el = doc().querySelector('[data-sid="' + id + '"]'); if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
  function fit() {
    if (innerWidth <= 900) { wrap.style.cssText = ''; return; }
    var W = stage.clientWidth - 36, H = stage.clientHeight - 36;
    if (dev === 'phone') { wrap.style.width = '390px'; wrap.style.height = Math.min(844, H - 20) + 'px'; wrap.style.transform = 'translateY(10px)'; wrap.style.marginLeft = Math.max(0, (W - 390) / 2) + 'px'; wrap.style.marginBottom = ''; }
    else { var base = 1240, k = Math.min(1, W / base); wrap.style.width = base + 'px'; wrap.style.height = (H / k) + 'px'; wrap.style.transform = 'scale(' + k + ')'; wrap.style.marginLeft = Math.max(0, (W - base * k) / 2) + 'px'; wrap.style.marginBottom = (-(H / k) * (1 - k)) + 'px'; }
  }
  $$('.fb-dev button').forEach(function (b) { b.addEventListener('click', function () { dev = b.dataset.dev; $$('.fb-dev button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); wrap.dataset.dev = dev; wrap.style.marginBottom = ''; fit(); hap('tap'); }); });
  addEventListener('resize', fit);
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(stage);

  /* ---------- right panel: Edit, Meta ad, Check ---------- */
  var pane = 'edit';
  $$('.fb-rtabs [role="tab"]').forEach(function (t) { t.addEventListener('click', function () { setPane(t.dataset.pane); hap('tap'); }); });
  $('.fb-rtabs').addEventListener('keydown', function (e) { var tabs = $$('.fb-rtabs [role="tab"]'), i = tabs.indexOf(document.activeElement); if (i < 0 || !/Arrow(Left|Right)/.test(e.key)) return; var n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; n.focus(); setPane(n.dataset.pane); });
  function setPane(p) {
    pane = p;
    $$('.fb-rtabs [role="tab"]').forEach(function (t) { var on = t.dataset.pane === p; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
    $('#fbInspector').hidden = p !== 'edit'; $('#fbAd').hidden = p !== 'ad'; $('#fbCheck').hidden = p !== 'check';
    renderSide();
  }
  function heroOf() { return state.sections.filter(function (s) { return s.type === 'hero'; })[0]; }
  function pageText() {
    var b = state.brand, out = [];
    state.sections.forEach(function (s) { FB.SECTIONS[s.type].fields.forEach(function (f) { out.push([s, FB.raw(s, f[0]).replace(/\{(name|phone|area|license)\}/g, function (_, k) { return b[k] || ''; })]); }); });
    return out;
  }
  function adFor() { var h = heroOf(), k = state.adAngle || (h && h.angle) || 'gift'; return { k: k, ad: FB.ADS[k] }; }
  function checks() {
    var res = [], txt = pageText(), a = adFor(), hero = heroOf();
    FB.RULES.forEach(function (r) {
      var hits = txt.filter(function (t) { return r.re.test(t[1]); });
      if (a.ad && r.re.test(a.ad.text + ' ' + a.ad.head)) hits.push([null, a.ad.text]);
      res.push({ level: hits.length ? r.level : 'ok', title: { fear: 'No fear or guilt hooks', urgency: 'No made-up urgency', claim: 'No impossible claims', personal: 'Nothing implies the viewer\'s age, health or loss' }[r.id], msg: hits.length ? r.msg : '', src: r.src, sec: hits[0] && hits[0][0] });
    });
    var need = txt.filter(function (t) { return /\[[^\]]+\]/.test(t[1]); });
    res.push({ level: need.length ? 'warn' : 'ok', title: need.length ? need.length + ' item' + (need.length === 1 ? '' : 's') + ' to confirm before launch' : 'Nothing left to confirm', msg: need.length ? 'Text in square brackets (prices, dates, carrier facts) must come from the business before the page goes live.' : '', sec: need[0] && need[0][0] });
    res.push({ level: state.brand.phone.trim() ? 'ok' : 'stop', title: state.brand.phone.trim() ? 'Phone number on every screen' : 'Add a phone number', msg: state.brand.phone.trim() ? '' : 'Families who are not ready for a form still call. The phone sits in the top bar and the footer.' });
    res.push({ level: 'ok', title: 'General price list linked', msg: '', src: ['California B&P 7685', 'https://california.public.law/codes/business_and_professions_code_section_7685'] });
    res.push({ level: hero && state.sections[0] === hero ? 'ok' : 'warn', title: hero && state.sections[0] === hero ? 'Opens with a headline' : 'The page does not open with a headline', msg: hero && state.sections[0] === hero ? '' : 'Move the Hero to the top, so the ad\'s promise is the first thing people see.', sec: hero });
    if (hero && hero.angle === 'now') { var offers = state.sections.filter(function (s) { return /guide|seminar|prices|tour|costtool|paytool/.test(s.type); }); res.push({ level: offers.length ? 'warn' : 'ok', title: offers.length ? 'An offer appears on the help-now page' : 'Help-now page stays offer-free', msg: offers.length ? 'Someone who just lost a person should see a phone number and calm words, not a guide or a price tool.' : '', sec: offers[0] }); }
    if (state.sections.some(function (s) { return s.angle === 'eligible'; })) res.push({ level: 'warn', title: 'Insurance claims need the carrier\'s wording', msg: 'No medical exam and fixed rates must match the policy, and a licensed agent must be named on the page.', sec: state.sections.filter(function (s) { return s.angle === 'eligible'; })[0] });
    if (state.sections.some(function (s) { return s.type === 'reviews'; })) res.push({ level: 'info', title: 'Reviews must be real', msg: 'Only real, unedited reviews from families who agreed to be quoted (FTC Endorsement Guides).', sec: state.sections.filter(function (s) { return s.type === 'reviews'; })[0] });
    return res;
  }
  function renderSide() {
    var res = checks(), bad = res.filter(function (r) { return r.level === 'stop' || r.level === 'warn'; }).length;
    var badge = $('#fbBadge'); badge.textContent = bad || ''; badge.className = 'fb-badge' + (res.some(function (r) { return r.level === 'stop'; }) ? ' fb-stop' : bad ? ' fb-warn' : '');
    if (pane === 'check') renderCheck(res); else if (pane === 'ad') renderAd();
  }
  function renderCheck(res) {
    var ok = res.filter(function (r) { return r.level === 'ok'; }).length;
    var ord = { stop: 0, warn: 1, info: 2, ok: 3 };
    res = res.slice().sort(function (a, b) { return ord[a.level] - ord[b.level]; });
    $('#fbCheck').innerHTML = '<div class="fb-insp-h"><div><b>Rule check</b><small>Meta advertising standards, FTC guidance and California\'s price list rule, checked on every change.</small></div></div>' +
      '<div class="fb-score"><b>' + ok + '<span> / ' + res.length + '</span></b><small>checks clear</small></div><ul class="fb-checks">' +
      res.map(function (r) { return '<li class="fb-c-' + r.level + '"><i aria-hidden="true">' + { ok: '&#10003;', warn: '!', stop: '&#215;', info: 'i' }[r.level] + '</i><div><b>' + esc(r.title) + '</b>' + (r.msg ? '<p>' + esc(r.msg) + '</p>' : '') + (r.src && r.level !== 'ok' ? '<a href="' + r.src[1] + '" target="_blank" rel="noopener">' + esc(r.src[0]) + '</a>' : '') + (r.sec ? '<button type="button" data-goto="' + r.sec.id + '">Show me</button>' : '') + '</div></li>'; }).join('') + '</ul>';
  }
  function renderAd() {
    var a = adFor(), hero = heroOf(), b = state.brand, el = $('#fbAd');
    var chips = '<span class="fb-lab">Ad angle</span><div class="fb-angles" role="group" aria-label="Ad angle">' + Object.keys(FB.ADS).map(function (k) { return '<button type="button" data-adangle="' + k + '" aria-pressed="' + (a.k === k) + '">' + esc(FB.ANGLES[k].name) + '</button>'; }).join('') + '</div>';
    if (!a.ad) { el.innerHTML = '<div class="fb-insp-h"><div><b>Meta ad</b><small>The ad that would send people to this page.</small></div></div><div class="fb-why"><b>No ads for this page</b>Families who just lost someone find a funeral home through search, Maps and hospice referrals. Running ads at them is the wrong move, so this page gets none.</div>' + chips; return; }
    var dom = (b.name || 'yourbusiness').toLowerCase().replace(/[^a-z0-9]+/g, '') + '.com';
    var fill = function (t) { return esc(t).replace(/\[([^\]]+)\]/g, '<mark>$1</mark>'); };
    var heroAct = hero ? (FB.ADS[hero.angle] || {}).act : null;
    var words = function (t) { return (t || '').toLowerCase().match(/[a-z]{5,}/g) || []; };
    var pageWords = hero ? words(FB.raw(hero, 'h') + ' ' + FB.raw(hero, 'sub') + ' ' + FB.raw(hero, 'cta')) : [];
    var shared = words(a.ad.head + ' ' + a.ad.text).filter(function (w, i, arr) { return pageWords.indexOf(w) > -1 && arr.indexOf(w) === i; });
    var m = [
      [hero && a.k === hero.angle, 'Ad and page lead with the same angle', hero ? (a.k === hero.angle ? 'Both say "' + FB.ANGLES[a.k].name + '".' : 'The ad says "' + FB.ANGLES[a.k].name + '" but the page opens with "' + (FB.ANGLES[hero.angle] ? FB.ANGLES[hero.angle].name : 'standard wording') + '".') : 'Add a Hero section.'],
      [heroAct && heroAct === a.ad.act, 'The button promises what the page delivers', 'Ad button "' + a.ad.btn + '" against the page\'s main action.'],
      [shared.length >= 2, 'The ad\'s words show up in the headline', shared.length ? 'Shared: ' + shared.slice(0, 5).join(', ') + '.' : 'No shared words. People who click should see the ad\'s promise right away.']
    ];
    var score = m.filter(function (x) { return x[0]; }).length;
    el.innerHTML = '<div class="fb-insp-h"><div><b>Meta ad</b><small>The ad that would send people to this page.</small></div></div>' +
      '<article class="fb-ad"><header><span class="fb-ad-av" aria-hidden="true"></span><span><b>' + esc(b.name) + '</b><small>Sponsored</small></span></header><p>' + fill(a.ad.text) + '</p><div class="fb-ad-img" style="--a:' + FB.PALETTES[b.palette].accent + ';--bg:' + FB.PALETTES[b.palette].soft + ';--ink:' + FB.PALETTES[b.palette].ink + '"><span>' + fill(a.ad.head) + '</span></div><footer><span><small>' + esc(dom.toUpperCase()) + '</small><b>' + fill(a.ad.head) + '</b></span><em>' + esc(a.ad.btn) + '</em></footer></article>' +
      '<span class="fb-lab">Message match · ' + score + ' of 3</span><ul class="fb-checks">' + m.map(function (x) { return '<li class="fb-c-' + (x[0] ? 'ok' : 'warn') + '"><i aria-hidden="true">' + (x[0] ? '&#10003;' : '!') + '</i><div><b>' + esc(x[1]) + '</b><p>' + esc(x[2]) + '</p></div></li>'; }).join('') + '</ul>' +
      '<span class="fb-lab">Who sees it</span><p class="fb-tip" style="margin-top:0">' + esc(FB.AD_WHO[a.k] || FB.AD_WHO.base) + '</p>' + chips;
  }
  $('.fb-right').addEventListener('click', function (e) {
    var g = e.target.closest('[data-goto]'); if (g) { select(g.dataset.goto, true); setPane('edit'); hap('tap'); return; }
    var aa = e.target.closest('[data-adangle]'); if (aa) { commit(); state.adAngle = aa.dataset.adangle; save(); renderSide(); hap('pick'); }
  });

  /* ---------- share link and download ---------- */
  function b64u(bytes) { var s = ''; for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function unb64u(t) { var s = atob(t.replace(/-/g, '+').replace(/_/g, '/')), a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; }
  function pack(obj) {
    var raw = new TextEncoder().encode(JSON.stringify(obj));
    if (!('CompressionStream' in window)) return Promise.resolve('j' + b64u(raw));
    return new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer().then(function (buf) { return 'z' + b64u(new Uint8Array(buf)); });
  }
  function unpack(t) {
    var bytes = unb64u(t.slice(1));
    if (t[0] === 'j') return Promise.resolve(JSON.parse(new TextDecoder().decode(bytes)));
    return new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text().then(JSON.parse);
  }
  function slim() { return { t: state.tpl, b: state.brand, a: state.adAngle || null, s: state.sections.map(function (s) { var o = { y: s.type }; if (s.angle) o.g = s.angle; if (s.layout) o.l = s.layout; if (s.f && Object.keys(s.f).length) o.f = s.f; return o; }) }; }
  function unslim(o) { return { tpl: o.t, brand: Object.assign({}, FB.BRAND, o.b), adAngle: o.a, sections: (o.s || []).filter(function (x) { return FB.SECTIONS[x.y]; }).map(function (x) { return { id: uid(), type: x.y, angle: x.g || null, layout: x.l || null, f: x.f || {} }; }) }; }
  $('#fbShare').addEventListener('click', function () {
    pack(slim()).then(function (code) {
      var url = location.origin + location.pathname + '#p=' + code;
      history.replaceState(null, '', '#p=' + code);
      var done = function () { toast('Link copied. Anyone with it opens this exact page.'); hap('done'); };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () { toast('The link is in the address bar. Copy it from there.'); }); else toast('The link is in the address bar. Copy it from there.');
    });
  });
  $('#fbDown').addEventListener('click', function () {
    var html = FB.renderDoc(state), name = (state.brand.name || 'landing').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-landing-page.html';
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    toast('Downloaded ' + name + '. It opens in any browser.'); hap('done');
  });
  if (/^#p=[jz]/.test(location.hash)) {
    unpack(location.hash.slice(3)).then(function (o) { var st = unslim(o); if (st.sections.length) { commit(); state = st; sel = null; all(); toast('Opened a shared page.'); } }).catch(function () { toast('That link could not be opened.'); });
  }

  /* ---------- selection, phone views ---------- */
  function markSel() { if (!ready) return; $$('.lp-s', doc()).forEach(function (el) { el.classList.toggle('fb-sel', el.dataset.sid === sel); }); }
  function select(id, scroll) { var changed = sel !== id; sel = id; if (changed) { renderOutline(); renderInspector(); markSel(); } if (scroll && id) scrollFrameTo(id); }
  function setView(v) { app.dataset.view = v; $$('.fb-mtabs button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.view === v)); }); if (v === 'preview') fit(); }
  $$('.fb-mtabs button').forEach(function (b) { b.addEventListener('click', function () { setView(b.dataset.view); hap('tap'); }); });

  function all() {
    $$('.fb-tpl', tplBox).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.t === state.tpl)); });
    var t = FB.TEMPLATES.filter(function (x) { return x.id === state.tpl; })[0];
    $('#fbCur').textContent = (t ? t.name : 'Custom page') + ' · ' + state.sections.length + ' sections';
    renderOutline(); renderInspector(); paint(); save();
  }
  all(); fit();
  /* for tests and the share link in wave 5 */
  window.fbState = function () { return JSON.parse(JSON.stringify(state)); };
})();
