/* Landing page builder renderer: state -> a complete, self-contained HTML page. Pure functions, no DOM,
   so the preview, the download and the tests all use the same output. */
(function (G) {
  var FB = G.FB = G.FB || {};
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  function variantKey(sec) {
    var v = FB.SECTIONS[sec.type].variants;
    if (sec.angle && v[sec.angle]) return sec.angle;
    return v.base ? 'base' : Object.keys(v)[0];
  }
  FB.variantKey = variantKey;
  FB.angleOptions = function (type) { return Object.keys(FB.SECTIONS[type].variants).filter(function (k) { return k !== 'base'; }); };

  function raw(sec, k) {
    if (sec.f && sec.f[k] != null) return sec.f[k];
    var v = FB.SECTIONS[sec.type].variants, cur = v[variantKey(sec)];
    return cur[k] != null ? cur[k] : (v.base && v.base[k] != null ? v.base[k] : '');
  }
  FB.raw = raw;
  function fill(s, b) { return String(s).replace(/\{(name|phone|area|license)\}/g, function (_, k) { return b[k] || ''; }); }
  /* escaped text with [client supplies this] spans marked */
  function T(sec, k, b) { return esc(fill(raw(sec, k), b)).replace(/\[([^\]]+)\]/g, '<mark class="lp-need">$1</mark>'); }
  function telHref(p) { return 'tel:' + String(p || '').replace(/[^\d+]/g, ''); }

  var ART = {
    lantern: '<svg viewBox="0 0 320 240" aria-hidden="true"><defs><radialGradient id="lpg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="var(--accent)" stop-opacity=".55"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></radialGradient></defs><rect width="320" height="240" rx="24" fill="var(--soft)"/><path d="M0 190c60-26 120-22 170-8s110 10 150-8v66H0z" fill="var(--line)"/><circle cx="160" cy="128" r="84" fill="url(#lpg)" class="lp-pulse"/><g transform="translate(160 100)" fill="none" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"><circle cx="0" cy="-26" r="7"/><path d="M-16 -14h32l-4 8h-24z"/><path d="M-20 -6h40v52a8 8 0 0 1-8 8h-24a8 8 0 0 1-8-8z" fill="var(--bg)"/><path d="M-30 62h60" stroke-linecap="round"/></g><path class="lp-flame" d="M160 106c8 9 8 18 0 25-8-7-8-16 0-25z" fill="var(--accent)"/><circle cx="62" cy="54" r="2" fill="var(--ink2)"/><circle cx="252" cy="40" r="2.4" fill="var(--ink2)"/><circle cx="214" cy="76" r="1.6" fill="var(--ink2)"/></svg>',
    book: '<svg viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" rx="24" fill="var(--soft)"/><g transform="rotate(-6 160 120)"><rect x="96" y="40" width="128" height="164" rx="8" fill="var(--accent)"/><rect x="104" y="40" width="6" height="164" fill="var(--deep)" opacity=".5"/><rect x="122" y="70" width="84" height="8" rx="4" fill="var(--on)" opacity=".9"/><rect x="122" y="86" width="60" height="6" rx="3" fill="var(--on)" opacity=".6"/><circle cx="164" cy="146" r="22" fill="none" stroke="var(--on)" stroke-width="3" opacity=".8"/><path d="M164 132c5 6 5 12 0 16-5-4-5-10 0-16z" fill="var(--on)" opacity=".85"/></g><g class="lp-float"><rect x="214" y="150" width="70" height="44" rx="10" fill="var(--bg)" stroke="var(--line)"/><path d="M226 172l8 8 16-16" fill="none" stroke="var(--accent)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g></svg>',
    cards: '<svg viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" rx="24" fill="var(--soft)"/><g transform="rotate(-12 130 130)"><rect x="70" y="70" width="110" height="140" rx="12" fill="var(--bg)" stroke="var(--line)" stroke-width="2"/></g><g transform="rotate(8 190 120)" class="lp-float"><rect x="140" y="50" width="110" height="140" rx="12" fill="var(--accent)"/><text x="195" y="112" text-anchor="middle" font-size="15" font-weight="700" fill="var(--on)" font-family="inherit">What would</text><text x="195" y="132" text-anchor="middle" font-size="15" font-weight="700" fill="var(--on)" font-family="inherit">you want?</text></g></svg>',
    table: '<svg viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" rx="24" fill="var(--soft)"/><ellipse cx="160" cy="150" rx="110" ry="36" fill="var(--bg)" stroke="var(--line)" stroke-width="2"/><circle cx="120" cy="146" r="14" fill="var(--line)"/><circle cx="200" cy="146" r="14" fill="var(--line)"/><path d="M160 136c6 6 6 12 0 16-6-4-6-10 0-16z" fill="var(--accent)" class="lp-flame"/><g fill="var(--ink2)"><circle cx="70" cy="96" r="13"/><circle cx="125" cy="86" r="13"/><circle cx="195" cy="86" r="13"/><circle cx="250" cy="96" r="13"/></g><g fill="var(--ink2)" opacity=".5"><rect x="56" y="110" width="28" height="22" rx="10"/><rect x="111" y="100" width="28" height="22" rx="10"/><rect x="181" y="100" width="28" height="22" rx="10"/><rect x="236" y="110" width="28" height="22" rx="10"/></g></svg>',
    window: '<svg viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" rx="24" fill="var(--soft)"/><rect x="70" y="36" width="180" height="150" rx="90" fill="var(--bg)" stroke="var(--line)" stroke-width="3"/><circle cx="160" cy="132" r="34" fill="var(--accent)" opacity=".85" class="lp-pulse"/><path d="M74 150h172" stroke="var(--line)" stroke-width="3"/><path d="M160 40v146M76 112h168" stroke="var(--line)" stroke-width="3"/><path d="M50 200h220" stroke="var(--ink2)" stroke-width="4" stroke-linecap="round"/><path d="M92 200v-26a10 10 0 0 1 20 0v26M208 200v-26a10 10 0 0 1 20 0v26" fill="none" stroke="var(--ink)" stroke-width="3"/></svg>',
    flag: '<svg viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" rx="24" fill="var(--soft)"/><path d="M110 40v170" stroke="var(--ink)" stroke-width="4" stroke-linecap="round"/><g class="lp-wave"><path d="M112 48c30-12 60 12 90 0s50-8 70 0v70c-20-8-40-12-70 0s-60-12-90 0z" fill="var(--accent)"/><path d="M112 72c30-12 60 12 90 0s50-8 70 0M112 96c30-12 60 12 90 0s50-8 70 0" fill="none" stroke="var(--on)" stroke-width="5" opacity=".8"/></g><circle cx="110" cy="36" r="6" fill="var(--ink)"/><path d="M70 210h80" stroke="var(--ink2)" stroke-width="4" stroke-linecap="round"/></svg>',
    shield: '<svg viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" rx="24" fill="var(--soft)"/><path d="M160 36l72 26v50c0 46-32 78-72 92-40-14-72-46-72-92V62z" fill="var(--bg)" stroke="var(--accent)" stroke-width="4"/><path class="lp-draw" d="M128 120l22 22 44-46" fill="none" stroke="var(--accent)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    tag: '<svg viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" rx="24" fill="var(--soft)"/><g class="lp-float"><path d="M96 70h96l50 50-70 70-76-76z" fill="var(--bg)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/><circle cx="124" cy="98" r="9" fill="none" stroke="var(--ink)" stroke-width="3"/></g><g fill="var(--accent)"><rect x="140" y="124" width="70" height="8" rx="4"/><rect x="152" y="142" width="46" height="8" rx="4" opacity=".6"/></g></svg>'
  };
  var ART_FOR = { gift: 'lantern', choice: 'lantern', noguess: 'lantern', now: 'lantern', price: 'tag', guide: 'book', talk: 'cards', event: 'table', eligible: 'shield', lifestyle: 'window', caregiver: 'window', veteran: 'flag' };

  function btn(sec, b, k, cls) {
    var t = fill(raw(sec, k || 'cta'), b), tel = /^Call /.test(t);
    return '<a class="lp-btn ' + (cls || '') + '" href="' + (tel ? telHref(b.phone) : '#start') + '">' + esc(t) + '</a>';
  }

  var R = {
    hero: function (s, b) {
      var lay = s.layout || 'split', art = ART[ART_FOR[s.angle] || 'lantern'];
      var text = '<p class="lp-eyebrow">' + T(s, 'eyebrow', b) + '</p><h1>' + T(s, 'h', b) + '</h1><p class="lp-sub">' + T(s, 'sub', b) + '</p><div class="lp-ctas">' + btn(s, b) + (s.angle === 'now' ? '' : '<a class="lp-link" href="' + telHref(b.phone) + '">or call ' + esc(b.phone) + '</a>') + '</div><p class="lp-note">' + T(s, 'note', b) + '</p>';
      return '<section class="lp-hero lp-' + lay + '"><div class="lp-w">' + (lay === 'split' ? '<div class="lp-ht">' + text + '</div><div class="lp-art">' + art + '</div>' : text) + '</div></section>';
    },
    picker: function (s, b) {
      return '<section class="lp-sec lp-pick"><div class="lp-w"><h2>' + T(s, 'h', b) + '</h2><div class="lp-pick-g"><a href="#start"><b>' + T(s, 'a', b) + '</b><span>Guide, prices and a call only if you want one</span></a><a href="' + telHref(b.phone) + '"><b>' + T(s, 'b', b) + '</b><span>A director answers, day or night</span></a><a href="#start"><b>' + T(s, 'c', b) + '</b><span>A care check, then a tour</span></a></div></div></section>';
    },
    trust: function (s, b) {
      return '<section class="lp-trust"><div class="lp-w"><ul>' + ['t1', 't2', 't3'].map(function (k) { return '<li><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10.5l3.8 3.6L16 6"/></svg>' + T(s, k, b) + '</li>'; }).join('') + '</ul></div></section>';
    },
    steps: function (s, b) {
      return '<section class="lp-sec"><div class="lp-w"><h2>' + T(s, 'h', b) + '</h2><ol class="lp-steps">' + [1, 2, 3].map(function (i) { return '<li><span>' + i + '</span><b>' + T(s, 's' + i + 't', b) + '</b><p>' + T(s, 's' + i, b) + '</p></li>'; }).join('') + '</ol></div></section>';
    },
    prices: function (s, b) {
      return '<section class="lp-sec lp-soft"><div class="lp-w"><h2>' + T(s, 'h', b) + '</h2><p class="lp-lede">' + T(s, 'sub', b) + '</p><div class="lp-plans">' + [1, 2, 3].map(function (i) { return '<article' + (i === 1 ? ' class="lp-feat"' : '') + '><b>' + T(s, 'p' + i + 'n', b) + '</b><p class="lp-price">' + T(s, 'p' + i + 'p', b) + '</p><p>' + T(s, 'p' + i + 'd', b) + '</p><a class="lp-btn lp-btn-s" href="#start">Choose this plan</a></article>'; }).join('') + '</div><p class="lp-fine"><a href="#price-list">See the full general price list</a></p></div></section>';
    },
    guide: function (s, b) {
      return '<section class="lp-sec lp-soft" id="start"><div class="lp-w lp-two"><div><h2>' + T(s, 'h', b) + '</h2><ul class="lp-checks">' + ['b1', 'b2', 'b3'].map(function (k) { return '<li>' + T(s, k, b) + '</li>'; }).join('') + '</ul></div><form class="lp-form" onsubmit="return false"><label>First name<input autocomplete="given-name"></label><label>Email<input type="email" autocomplete="email"></label><button class="lp-btn" type="submit">' + esc(fill(raw(s, 'cta'), b)) + '</button><p class="lp-fine">' + T(s, 'fine', b) + '</p></form></div></section>';
    },
    seminar: function (s, b) {
      return '<section class="lp-sec" id="start"><div class="lp-w"><div class="lp-event"><div class="lp-cal"><small>Free</small><b>Lunch</b><span>talk</span></div><div><h2>' + T(s, 'h', b) + '</h2><p class="lp-lede">' + T(s, 'sub', b) + '</p><p class="lp-meta"><b>When</b> ' + T(s, 'when', b) + '</p><p class="lp-meta"><b>Where</b> ' + T(s, 'where', b) + '</p><form class="lp-inline" onsubmit="return false"><input aria-label="Your name" placeholder="Your name"><input aria-label="Email or phone" placeholder="Email or phone"><button class="lp-btn" type="submit">' + esc(fill(raw(s, 'cta'), b)) + '</button></form></div></div></div></section>';
    },
    callback: function (s, b) {
      return '<section class="lp-sec lp-soft" id="start"><div class="lp-w lp-two"><div><h2>' + T(s, 'h', b) + '</h2><p class="lp-lede">' + T(s, 'sub', b) + '</p><a class="lp-phone" href="' + telHref(b.phone) + '">' + esc(b.phone) + '</a></div><form class="lp-form" onsubmit="return false"><label>Your name<input autocomplete="name"></label><label>Best number<input type="tel" autocomplete="tel"></label><button class="lp-btn" type="submit">' + esc(fill(raw(s, 'cta'), b)) + '</button><p class="lp-fine">' + T(s, 'fine', b) + '</p></form></div></section>';
    },
    tour: function (s, b) {
      var slots = ['Tue 10:00', 'Tue 1:30', 'Wed 11:00', 'Thu 10:00', 'Thu 2:00', 'Sat 11:00'];
      return '<section class="lp-sec" id="start"><div class="lp-w"><h2>' + T(s, 'h', b) + '</h2><p class="lp-lede">' + T(s, 'sub', b) + '</p><div class="lp-slots">' + slots.map(function (t, i) { return '<button type="button"' + (i === 1 ? ' class="lp-on"' : '') + '>' + t + '</button>'; }).join('') + '</div><a class="lp-btn" href="#start">' + esc(fill(raw(s, 'cta'), b)) + '</a></div></section>';
    },
    compare: function (s, b) {
      var rows = [['National median, with a viewing', '$8,300', '$6,280'], ['Families choosing it, 2025', '31.6%', '63.4%'], ['Families choosing it, 2045 (projected)', '15.1%', '82.3%'], ['Viewing and service possible', 'Yes', 'Yes'], ['Where remains go', 'Cemetery plot or mausoleum', 'Urn, niche, scattering or burial']];
      return '<section class="lp-sec"><div class="lp-w"><h2>' + T(s, 'h', b) + '</h2><p class="lp-lede">' + T(s, 'sub', b) + '</p><table class="lp-table"><thead><tr><th></th><th>Burial</th><th>Cremation</th></tr></thead><tbody>' + rows.map(function (r) { return '<tr><th scope="row">' + r[0] + '</th><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>'; }).join('') + '</tbody></table><p class="lp-fine">Sources: NFDA 2023 General Price List Study medians (burial excludes cemetery costs); NFDA 2025 Cremation and Burial Report.</p></div></section>';
    },
    faq: function (s, b) {
      return '<section class="lp-sec lp-soft"><div class="lp-w"><h2>' + T(s, 'h', b) + '</h2><p class="lp-lede">' + T(s, 'sub', b) + '</p><div class="lp-faq">' + FB.FAQ.map(function (q, i) { return '<details' + (i === 0 ? ' open' : '') + '><summary>' + esc(q[0]) + '</summary><p>' + esc(q[1]).replace(/\[([^\]]+)\]/g, '<mark class="lp-need">$1</mark>') + '</p></details>'; }).join('') + '</div><p class="lp-fine">Questions from the <a href="' + FB.FAQ_SRC[1] + '">' + FB.FAQ_SRC[0] + '</a>.</p></div></section>';
    },
    vets: function (s, b) {
      var items = [['Burial in a national cemetery', 'Where space is available, at no cost to the family.'], ['Headstone or marker', 'Provided free, set in any cemetery.'], ['Burial flag and honors', 'A flag for the family, and military funeral honors on request.'], ['Burial allowance', 'May apply, depending on the circumstances of death.']];
      return '<section class="lp-sec"><div class="lp-w"><h2>' + T(s, 'h', b) + '</h2><p class="lp-lede">' + T(s, 'sub', b) + '</p><div class="lp-vets">' + items.map(function (it) { return '<div><b>' + it[0] + '</b><p>' + it[1] + '</p></div>'; }).join('') + '</div><p class="lp-fine">Source: U.S. Department of Veterans Affairs burial benefits. Eligibility applies.</p></div></section>';
    },
    reviews: function (s, b) {
      return '<section class="lp-sec"><div class="lp-w"><h2>' + T(s, 'h', b) + '</h2><div class="lp-revs">' + [1, 2, 3].map(function () { return '<figure><div class="lp-stars" aria-hidden="true">&#9733;&#9733;&#9733;&#9733;&#9733;</div><blockquote><mark class="lp-need">A real review from Google, shown with permission</mark></blockquote><figcaption>Reviewer\'s first name · Google</figcaption></figure>'; }).join('') + '</div><p class="lp-fine">Only real reviews, unedited, from families who agreed to be quoted.</p></div></section>';
    },
    area: function (s, b) {
      return '<section class="lp-sec lp-soft"><div class="lp-w lp-two"><div><h2>' + T(s, 'h', b) + '</h2><p class="lp-lede">' + T(s, 'sub', b) + '</p><a class="lp-phone" href="' + telHref(b.phone) + '">' + esc(b.phone) + '</a></div><svg class="lp-map" viewBox="0 0 300 200" aria-hidden="true"><rect width="300" height="200" rx="20" fill="var(--bg)" stroke="var(--line)"/><path d="M20 150c40-30 70-10 110-40s80-40 150-20" fill="none" stroke="var(--line)" stroke-width="10" stroke-linecap="round"/><path d="M40 60c50 10 90 50 120 110M180 20c-10 50 20 100 90 140" fill="none" stroke="var(--line)" stroke-width="6" stroke-linecap="round"/><circle cx="150" cy="100" r="60" fill="var(--accent)" opacity=".12"/><circle cx="150" cy="100" r="34" fill="var(--accent)" opacity=".18" class="lp-pulse"/><path d="M150 112s-16-15-16-27a16 16 0 0 1 32 0c0 12-16 27-16 27z" fill="var(--accent)"/><circle cx="150" cy="85" r="5" fill="var(--bg)"/></svg></div></section>';
    },
    cta: function (s, b) {
      return '<section class="lp-cta"><div class="lp-w"><h2>' + T(s, 'h', b) + '</h2><p>' + T(s, 'sub', b) + '</p>' + btn(s, b, 'cta', 'lp-btn-l') + '</div></section>';
    }
  };

  R.costtool = function (s, b) {
    var total = FB.COST_ITEMS.reduce(function (a, it) { return a + it[1]; }, 0);
    return '<section class="lp-sec lp-soft"><div class="lp-w"><h2>' + T(s, 'h', b) + '</h2><p class="lp-lede">' + T(s, 'sub', b) + '</p><div class="lp-tool lp-two" data-lp-tool="cost"><ul class="lp-lines">' + FB.COST_ITEMS.map(function (it, i) { return '<li><label><input type="checkbox" checked data-v="' + it[1] + '"><span>' + esc(it[0]) + '</span><em>$' + it[1].toLocaleString('en-US') + '</em></label></li>'; }).join('') + '</ul><div class="lp-total"><small>Your total</small><b data-out>$' + total.toLocaleString('en-US') + '</b><div class="lp-bar"><i data-bar style="width:100%"></i></div><p class="lp-fine">National median with burial and vault: $9,995. With cremation: $6,280. The lines do not add exactly to the published median.</p><a class="lp-btn" href="#price-list">See our prices</a></div></div></div></section>';
  };
  R.paytool = function (s, b) {
    return '<section class="lp-sec"><div class="lp-w"><h2>' + T(s, 'h', b) + '</h2><p class="lp-lede">' + T(s, 'sub', b) + '</p><div class="lp-tool lp-pay" data-lp-tool="pay"><label class="lp-pl">Plan price<input type="number" inputmode="numeric" min="500" step="100" value="6280" data-price></label><label class="lp-pl">Pay over <b data-yrs>3 years</b><input type="range" min="1" max="10" value="3" data-years></label><div class="lp-total"><small>About</small><b data-out>$174</b><span>a month</span></div></div></div></section>';
  };
  /* Runs in the preview (called from the builder) and in the downloaded page (inlined), so it must not use closures. */
  FB.lpTools = function lpTools(d) {
    var fmt = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
    Array.prototype.forEach.call(d.querySelectorAll('[data-lp-tool="cost"]'), function (el) {
      if (el.dataset.on) return; el.dataset.on = '1';
      var boxes = el.querySelectorAll('input[type=checkbox]'), max = 0;
      Array.prototype.forEach.call(boxes, function (x) { max += +x.dataset.v; });
      var upd = function () { var t = 0; Array.prototype.forEach.call(boxes, function (x) { if (x.checked) t += +x.dataset.v; }); el.querySelector('[data-out]').textContent = fmt(t); el.querySelector('[data-bar]').style.width = (t / max * 100) + '%'; };
      el.addEventListener('change', upd); upd();
    });
    Array.prototype.forEach.call(d.querySelectorAll('[data-lp-tool="pay"]'), function (el) {
      if (el.dataset.on) return; el.dataset.on = '1';
      var p = el.querySelector('[data-price]'), y = el.querySelector('[data-years]');
      var upd = function () { var yrs = +y.value; el.querySelector('[data-yrs]').textContent = yrs + (yrs === 1 ? ' year' : ' years'); el.querySelector('[data-out]').textContent = fmt((+p.value || 0) / (yrs * 12)); };
      el.addEventListener('input', upd); upd();
    });
  };

  FB.css = function (b) {
    var p = FB.PALETTES[b.palette] || FB.PALETTES.lantern, f = FB.FONTS[b.font] || FB.FONTS.modern;
    return ':root{--bg:' + p.bg + ';--soft:' + p.soft + ';--ink:' + p.ink + ';--ink2:' + p.ink2 + ';--line:' + p.line + ';--accent:' + p.accent + ';--on:' + p.on + ';--deep:' + p.deep + ';--head:' + f.head + ';--body:' + f.body + ';--hw:' + f.hw + ';--track:' + f.track + '}' +
    '*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--ink);font:400 17px/1.6 var(--body);-webkit-font-smoothing:antialiased}' +
    'h1,h2{font-family:var(--head);font-weight:var(--hw);letter-spacing:var(--track);line-height:1.08;margin:0;text-wrap:balance}h1{font-size:clamp(36px,5.2vw,60px)}h2{font-size:clamp(28px,3.4vw,40px)}p{margin:0}a{color:inherit}' +
    '.lp-w{max-width:1080px;margin:0 auto;padding:0 22px}.lp-sec{padding:72px 0}.lp-soft{background:var(--soft)}.lp-lede{margin-top:12px;color:var(--ink2);max-width:40em;font-size:18px}' +
    '.lp-top{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--bg) 90%,transparent);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}.lp-top .lp-w{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:64px}.lp-logo{display:flex;align-items:center;gap:10px;font-family:var(--head);font-weight:var(--hw);font-size:21px;letter-spacing:var(--track)}.lp-logo svg{width:26px;height:26px}.lp-top a.lp-tel{font-weight:600;text-decoration:none;font-size:15px}' +
    '.lp-hero{padding:72px 0 64px}.lp-split .lp-w{display:grid;grid-template-columns:1.05fr .95fr;gap:48px;align-items:center}.lp-center{text-align:center}.lp-center .lp-sub{margin-left:auto;margin-right:auto}.lp-center .lp-ctas{justify-content:center}.lp-band{background:var(--ink);color:var(--bg);text-align:center}.lp-band .lp-sub,.lp-band .lp-note{color:color-mix(in srgb,var(--bg) 75%,var(--ink))}.lp-band .lp-ctas{justify-content:center}.lp-band .lp-sub{margin-left:auto;margin-right:auto}.lp-band .lp-eyebrow{color:var(--accent)}' +
    '.lp-eyebrow{font-size:13px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--deep);margin-bottom:14px}.lp-sub{margin-top:18px;font-size:19px;color:var(--ink2);max-width:34em}.lp-ctas{display:flex;flex-wrap:wrap;align-items:center;gap:14px 20px;margin-top:28px}.lp-note{margin-top:12px;font-size:14px;color:var(--ink2)}.lp-link{font-weight:600;font-size:15px}' +
    '.lp-btn{display:inline-flex;align-items:center;justify-content:center;min-height:54px;padding:0 26px;border-radius:14px;border:0;background:var(--accent);color:var(--on);font:600 17px var(--body);text-decoration:none;cursor:pointer;box-shadow:0 12px 26px -14px var(--accent);transition:transform .15s,box-shadow .2s}.lp-btn:hover{transform:translateY(-1px);box-shadow:0 16px 30px -12px var(--accent)}.lp-btn-s{min-height:46px;font-size:15px;padding:0 18px}.lp-btn-l{min-height:60px;padding:0 34px;font-size:18px}' +
    '.lp-art svg{display:block;width:100%;height:auto;border-radius:24px}' +
    '.lp-pick-g{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:24px}.lp-pick-g a{display:block;padding:22px;border-radius:18px;border:1.5px solid var(--line);background:var(--bg);text-decoration:none;transition:border-color .2s,transform .2s}.lp-pick-g a:hover{border-color:var(--accent);transform:translateY(-2px)}.lp-pick-g b{display:block;font-size:19px}.lp-pick-g span{display:block;margin-top:6px;color:var(--ink2);font-size:15px}' +
    '.lp-trust{border-block:1px solid var(--line)}.lp-trust ul{list-style:none;margin:0;padding:18px 0;display:flex;flex-wrap:wrap;justify-content:center;gap:12px 36px}.lp-trust li{display:flex;align-items:center;gap:9px;font-weight:600;font-size:15.5px}.lp-trust svg{width:18px;height:18px;fill:none;stroke:var(--accent);stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}' +
    '.lp-steps{list-style:none;margin:28px 0 0;padding:0;display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.lp-steps li{padding:24px;border-radius:18px;background:var(--soft);border:1px solid var(--line)}.lp-steps span{display:grid;place-items:center;width:36px;height:36px;border-radius:50%;background:var(--accent);color:var(--on);font-weight:700}.lp-steps b{display:block;margin-top:14px;font-size:19px}.lp-steps p{margin-top:6px;color:var(--ink2);font-size:15.5px}' +
    '.lp-plans{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:28px}.lp-plans article{display:flex;flex-direction:column;gap:10px;padding:26px;border-radius:20px;background:var(--bg);border:1.5px solid var(--line)}.lp-plans .lp-feat{border-color:var(--accent);box-shadow:0 20px 40px -26px var(--accent)}.lp-plans b{font-size:19px}.lp-price{font-family:var(--head);font-size:32px;font-weight:var(--hw)}.lp-plans p:not(.lp-price){color:var(--ink2);font-size:15.5px;flex:1}' +
    '.lp-two{display:grid;grid-template-columns:1fr 1fr;gap:44px;align-items:center}.lp-checks{list-style:none;margin:20px 0 0;padding:0;display:grid;gap:12px}.lp-checks li{position:relative;padding-left:32px;font-size:17px}.lp-checks li::before{content:"";position:absolute;left:0;top:3px;width:22px;height:22px;border-radius:50%;background:var(--accent) url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27%3E%3Cpath d=%27M5 10.5l3.4 3.2L15 7%27 fill=%27none%27 stroke=%27white%27 stroke-width=%272.6%27 stroke-linecap=%27round%27/%3E%3C/svg%3E") center/14px no-repeat}' +
    '.lp-form{display:grid;gap:14px;padding:28px;border-radius:22px;background:var(--bg);border:1px solid var(--line);box-shadow:0 24px 50px -32px rgba(0,0,0,.35)}.lp-form label{display:grid;gap:6px;font-weight:600;font-size:15px}.lp-form input,.lp-inline input{width:100%;min-height:50px;padding:0 14px;border-radius:12px;border:1.5px solid var(--line);background:var(--bg);color:var(--ink);font:16px var(--body)}.lp-form .lp-btn{width:100%}.lp-fine{margin-top:12px;font-size:13.5px;color:var(--ink2)}' +
    '.lp-event{display:grid;grid-template-columns:140px 1fr;gap:32px;align-items:start;padding:32px;border-radius:24px;background:var(--soft);border:1px solid var(--line)}.lp-cal{display:grid;place-items:center;aspect-ratio:1;border-radius:20px;background:var(--accent);color:var(--on);text-align:center;line-height:1.1}.lp-cal small{font-size:13px;text-transform:uppercase;letter-spacing:.12em}.lp-cal b{font-family:var(--head);font-size:32px}.lp-meta{margin-top:10px}.lp-meta b{display:inline-block;min-width:64px;color:var(--deep)}.lp-inline{display:grid;grid-template-columns:1fr 1fr auto;gap:10px;margin-top:20px}' +
    '.lp-phone{display:inline-block;margin-top:18px;font-family:var(--head);font-size:clamp(30px,4vw,42px);font-weight:var(--hw);letter-spacing:var(--track);text-decoration:none;color:var(--deep)}' +
    '.lp-slots{display:flex;flex-wrap:wrap;gap:10px;margin:24px 0}.lp-slots button{min-height:48px;padding:0 18px;border-radius:12px;border:1.5px solid var(--line);background:var(--bg);color:var(--ink);font:600 15px var(--body)}.lp-slots .lp-on{border-color:var(--accent);background:var(--accent);color:var(--on)}' +
    '.lp-table{width:100%;margin-top:24px;border-collapse:collapse;font-size:16px}.lp-table th,.lp-table td{padding:14px 12px;border-bottom:1px solid var(--line);text-align:left}.lp-table thead th{font-size:14px;text-transform:uppercase;letter-spacing:.1em;color:var(--ink2)}.lp-table td{font-weight:600}' +
    '.lp-faq{margin-top:22px;display:grid;gap:10px}.lp-faq details{padding:16px 20px;border-radius:16px;background:var(--bg);border:1px solid var(--line)}.lp-faq summary{cursor:pointer;font-weight:600;font-size:17px}.lp-faq p{margin-top:10px;color:var(--ink2)}' +
    '.lp-vets{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-top:24px}.lp-vets div{padding:22px;border-radius:18px;border:1px solid var(--line);border-left:4px solid var(--accent)}.lp-vets p{margin-top:4px;color:var(--ink2);font-size:15.5px}' +
    '.lp-revs{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:24px}.lp-revs figure{margin:0;padding:22px;border-radius:18px;background:var(--soft);border:1px solid var(--line)}.lp-stars{color:var(--accent);letter-spacing:2px}.lp-revs blockquote{margin:10px 0}.lp-revs figcaption{font-size:14px;color:var(--ink2)}' +
    '.lp-map{width:100%;height:auto}' +
    '.lp-tool{margin-top:24px;align-items:start}.lp-lines{list-style:none;margin:0;padding:0;display:grid;gap:6px}.lp-lines label{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;background:var(--bg);border:1px solid var(--line);cursor:pointer;font-size:15.5px}.lp-lines input{width:18px;height:18px;accent-color:var(--accent)}.lp-lines span{flex:1}.lp-lines em{font-style:normal;font-weight:600}.lp-total{position:sticky;top:84px;padding:24px;border-radius:20px;background:var(--bg);border:1px solid var(--line)}.lp-total small{display:block;color:var(--ink2);font-size:14px}.lp-total b{display:block;font-family:var(--head);font-size:44px;font-weight:var(--hw);letter-spacing:var(--track)}.lp-total span{color:var(--ink2)}.lp-bar{height:10px;border-radius:99px;background:var(--soft);overflow:hidden;margin:12px 0}.lp-bar i{display:block;height:100%;background:var(--accent);transition:width .35s}.lp-total .lp-btn{margin-top:16px;width:100%}.lp-pay{display:grid;grid-template-columns:1fr 1.2fr 1fr;gap:20px;align-items:end;padding:28px;border-radius:22px;background:var(--soft);border:1px solid var(--line)}.lp-pl{display:grid;gap:8px;font-weight:600}.lp-pl input[type=number]{min-height:50px;padding:0 14px;border-radius:12px;border:1.5px solid var(--line);background:var(--bg);color:var(--ink);font:16px var(--body)}.lp-pl input[type=range]{accent-color:var(--accent);width:100%}.lp-pay .lp-total{position:static}' +
    '.lp-cta{padding:80px 0;background:var(--ink);color:var(--bg);text-align:center}.lp-cta p{margin:14px auto 28px;max-width:34em;color:color-mix(in srgb,var(--bg) 75%,var(--ink));font-size:18px}' +
    '.lp-foot{padding:32px 0;font-size:14px;color:var(--ink2);border-top:1px solid var(--line)}.lp-foot .lp-w{display:flex;flex-wrap:wrap;gap:8px 22px;justify-content:space-between}' +
    '.lp-need{background:color-mix(in srgb,var(--accent) 22%,transparent);color:inherit;padding:0 4px;border-radius:4px;outline:1px dashed color-mix(in srgb,var(--accent) 70%,transparent)}' +
    '.lp-pulse{animation:lpP 4s ease-in-out infinite;transform-origin:center;transform-box:fill-box}@keyframes lpP{50%{opacity:.6;transform:scale(1.06)}}.lp-flame{transform-box:fill-box;transform-origin:50% 100%;animation:lpF 2.4s ease-in-out infinite}@keyframes lpF{40%{transform:scaleY(1.1) rotate(-3deg)}70%{transform:scaleY(.95) rotate(2deg)}}.lp-float{animation:lpU 5s ease-in-out infinite}@keyframes lpU{50%{transform:translateY(-8px)}}.lp-wave{transform-box:fill-box;transform-origin:0 50%;animation:lpW 3s ease-in-out infinite}@keyframes lpW{50%{transform:skewY(-3deg)}}.lp-draw{stroke-dasharray:120;stroke-dashoffset:120;animation:lpD 1.2s .3s ease forwards}@keyframes lpD{to{stroke-dashoffset:0}}' +
    '@media (prefers-reduced-motion:reduce){*{animation:none!important}.lp-draw{stroke-dashoffset:0}}' +
    '@media (max-width:760px){.lp-sec{padding:52px 0}.lp-hero{padding:48px 0}.lp-split .lp-w,.lp-two{grid-template-columns:1fr;gap:28px}.lp-pick-g,.lp-steps,.lp-plans,.lp-revs,.lp-vets{grid-template-columns:1fr}.lp-event{grid-template-columns:1fr}.lp-cal{width:110px}.lp-pay{grid-template-columns:1fr}.lp-total{position:static}.lp-inline{grid-template-columns:1fr}.lp-btn{width:100%}.lp-ctas{flex-direction:column;align-items:stretch;text-align:center}.lp-table{font-size:14.5px}.lp-table th,.lp-table td{padding:10px 6px}}';
  };

  FB.renderBody = function (state) {
    var b = state.brand;
    var top = '<header class="lp-top"><div class="lp-w"><span class="lp-logo"><svg viewBox="0 0 26 26" aria-hidden="true"><path d="M13 3v3M8 8h10l-1.5 3h-7z" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"/><path d="M7 11h12v10a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3z" fill="none" stroke="var(--ink)" stroke-width="2"/><path d="M13 14c2.5 2.8 2.5 5.5 0 7.5-2.5-2-2.5-4.7 0-7.5z" fill="var(--accent)"/></svg>' + esc(b.name) + '</span><a class="lp-tel" href="' + telHref(b.phone) + '">' + esc(b.phone) + '</a></div></header>';
    var body = state.sections.map(function (s) { var fn = R[s.type]; return fn ? '<div class="lp-s" data-sid="' + esc(s.id) + '">' + fn(s, b) + '</div>' : ''; }).join('');
    var foot = '<footer class="lp-foot"><div class="lp-w"><span>' + esc(b.name) + ' · ' + esc(b.area) + ' · License ' + esc(b.license) + '</span><span><a id="price-list" href="#price-list">General price list</a> · <a href="' + telHref(b.phone) + '">' + esc(b.phone) + '</a></span></div></footer>';
    return top + '<main>' + body + '</main>' + foot;
  };

  FB.renderDoc = function (state, extraHead) {
    var f = FB.FONTS[state.brand.font] || FB.FONTS.modern;
    return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(state.brand.name) + '</title>' + (f.url ? '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="' + f.url + '">' : '') + '<style id="lp-css">' + FB.css(state.brand) + '</style>' + (extraHead || '') + '</head><body><div id="lp-root">' + FB.renderBody(state) + '</div>' + (extraHead ? '' : '<script>(' + FB.lpTools.toString() + ')(document)</script>') + '</body></html>';
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
