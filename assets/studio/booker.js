// NJS Fitness booking: pick a day, the day opens the places, pick a time, then the 12-pack focus and
// details. One pack only. Sends a request to lead-intake; nothing is charged on the site. Place prices
// live on the place buttons in nf-booker.html (data-price, data-total), never in this script.
// Day rules: Thursday = UFC Gym Brea schedule; Mon, Tue, Wed, Fri = every place; weekends = Brea or
// private in person. Markup: partials/fitness/nf-booker.html. Styles: booker.css (scoped to .bk).
import { track } from './track.js';

const ENDPOINT = 'https://cedunmyttprzgslthuyk.supabase.co/functions/v1/lead-intake';
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function mountBooker() {
  const root = document.querySelector('[data-booker]');
  if (!root) return;
  const PLACES = {
    rsm: { name: '9Round RSM', days: [1, 2, 3, 5], member: '9Round', hours: [7, 7.5, 8, 9, 10, 10.5, 11, 12, 13, 13.5], gym: true,
      blocks: { 8: ['class', '8:00 to 10:00 AM · My classes', 2], 11: ['class', '11:00 AM to 1:00 PM · My classes', 2] }, booked: new Set(), open: new Set([7, 7.5, 10, 10.5, 13, 13.5]),
      note: 'Open half hours before, between and after my classes at 9Round.' },
    brea: { name: 'UFC Gym Brea', days: [0, 1, 2, 3, 4, 5, 6], member: 'UFC Gym Brea', hours: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
      blocks: { 6: ['class', '6:00 AM · My class', 1], 18: ['class', '6:00 PM · My class', 1] }, booked: new Set([7, 10, 13, 17]), open: new Set([8, 9, 11, 12, 14, 15, 16, 19]),
      note: 'Classes at 6 AM and 6 PM. Open hours in between.' },
  };
  PLACES.home = { name: 'Private, in person', days: [0, 1, 2, 3, 5, 6], parts: true, note: 'Your home, garage gym or a park near you. Pick a day and a part of the day; I reply with an exact time. A travel fee may apply.' };
  PLACES.online = { name: 'Online', days: [1, 2, 3, 5], parts: true, note: 'Pick a day and a part of the day. I reply with an exact time and a video link.' };
  const PARTS = [['Morning', '7 to 11 AM'], ['Midday', '11 AM to 3 PM'], ['Evening', '3 to 8 PM']];
  const FOCUS = ['Muscle building', 'Fat loss', 'Shoulder strength', 'Boxing', 'Kickboxing', 'Muay Thai', 'Conditioning', 'Mobility and yoga', 'Reformer Pilates'];
  const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const fmt = (h) => (Math.floor(h) % 12 || 12) + ':' + (h % 1 ? '30' : '00') + ' ' + (h < 12 ? 'AM' : 'PM');
  const st = { city: null, loc: 'brea', date: 0, hour: null, pack: '12', focus: [], step: 0 };
  const SOON = { 4: 'Not on Thursdays', 0: 'Weekdays only', 6: 'Weekdays only' };
  const avail = (loc, dow) => (PLACES[loc].days.includes(dow) ? (loc === 'brea' && dow !== 4 ? 'parts' : PLACES[loc].parts ? 'parts' : 'sched') : null);
  // 9Round runs in 30-minute chunks: every 9Round slot is a half hour. Other places book by the hour.
  const slotLen = (p) => (p.gym ? 0.5 : 1);
  const isParts = () => avail(st.loc, dates[st.date].getDay()) === 'parts';
  const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
  let dates = [];
  function buildDates() {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 1); dates = [];
    while (dates.length < 14) { dates.push(new Date(d)); d.setDate(d.getDate() + 1); }
    const tag = (w) => (w === 4 ? 'Brea only' : w === 0 || w === 6 ? '2 places' : 'All places');
    $('#dates').innerHTML = dates.map((x, i) => '<button type="button" class="date' + (x.getDay() === 4 ? ' thu' : '') + '" data-i="' + i + '" aria-pressed="' + (i === st.date) + '"><b><span>' + DOW[x.getDay()] + '</span> ' + MON[x.getMonth()] + ' ' + x.getDate() + '</b><small>' + tag(x.getDay()) + '</small></button>').join('');
  }
  function setLocs() {
    const w = dates[st.date].getDay();
    $$('.locs button.loc').forEach((b) => {
      const ok = !!avail(b.dataset.loc, w);
      b.disabled = !ok; b.classList.toggle('na', !ok);
      const small = b.querySelector('[data-s]');
      small.textContent = !ok ? (SOON[w] || 'Not this day') : b.dataset.loc === 'brea' ? (w === 4 ? 'Thursday schedule' : 'Request a time') : b.dataset.loc === 'rsm' ? 'Half hours' : b.dataset.loc === 'home' ? 'I come to you' : 'Live video';
    });
    if (!avail(st.loc, w)) { const first = $$('.locs button.loc').find((b) => !b.disabled); st.loc = first.dataset.loc; }
    $$('.locs button.loc').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.loc === st.loc)));
    $('#day-avail').textContent = w === 4 ? 'Thursdays: UFC Gym Brea' : w === 0 || w === 6 ? 'Weekends: Brea or your place' : 'Every place is open';
  }
  function buildDay() {
    const p = PLACES[st.loc], x = dates[st.date];
    $('#dayname').innerHTML = '<span class="nw">' + DOW[x.getDay()] + ', ' + MON[x.getMonth()] + ' ' + x.getDate() + ' ·</span> <span class="nw">' + p.name + '</span>';
    $('#daynote').textContent = isParts() ? (st.loc === 'brea' ? 'I\'m at UFC Gym Brea by request on ' + DOW[x.getDay()] + 's. Pick a part of the day; I reply with an exact time.' : p.note) : p.note;
    if (isParts()) {
      $('#rows').innerHTML = PARTS.map(([k, t]) => '<li class="row part"><time>' + k.toUpperCase().slice(0, 3) + '</time><div class="cell"><button type="button" class="blk bk-open" data-part="' + k + '" aria-pressed="' + (st.hour === k) + '">' + k + ' · ' + t + '<em>Request</em></button></div></li>').join('');
      $('#tiles').innerHTML = PARTS.map(([k, t]) => '<button type="button" class="tile bk-open" data-part="' + k + '" aria-pressed="' + (st.hour === k) + '"><b>' + k + '</b><small>' + t + '</small></button>').join('');
      return;
    }
    $('#tiles').innerHTML = p.hours.filter((h) => !Object.values(p.blocks).some((b, i) => { const s0 = +Object.keys(p.blocks)[i]; return h > s0 && h < s0 + b[2]; })).map((h) => {
      const b = p.blocks[h];
      if (b) return '<div class="tile class' + (b[2] > 1 ? ' bk-wide' : '') + '"><b>' + (b[2] > 1 ? fmt(h).replace(':00', '') + ' to ' + fmt(h + b[2]).replace(':00', '') : fmt(h)) + '</b><small>My class</small></div>';
      if (p.booked.has(h)) return '<div class="tile booked"><b>' + fmt(h) + '</b><small>Booked</small></div>';
      if (p.open.has(h)) return '<button type="button" class="tile bk-open' + (p.gym ? ' gym' : '') + '" data-h="' + h + '" aria-pressed="' + (h === st.hour) + '"' + (p.gym ? ' aria-haspopup="dialog"' : '') + '><b>' + fmt(h) + '</b><small>' + (p.gym ? '9Round · ' + (slotLen(p) < 1 ? '30' : '60') + ' min' : 'Open') + '</small></button>';
      return '<div class="tile bk-off"><b>' + fmt(h) + '</b><small>Not available</small></div>';
    }).join('');
    let skip = 0; const out = [];
    p.hours.forEach((h) => {
      if (skip) { skip--; return; }
      const b = p.blocks[h];
      let cell;
      if (b) { cell = '<div class="blk class" style="min-height:' + (b[2] * 44 - 8) + 'px">' + b[1] + '<em>Class</em></div>'; skip = b[2] - 1; }
      else if (p.booked.has(h)) cell = '<div class="blk booked">' + fmt(h) + '<em>Booked</em></div>';
      else if (p.open.has(h)) cell = '<button type="button" class="blk bk-open' + (p.gym ? ' gym' : '') + '" data-h="' + h + '" aria-pressed="' + (h === st.hour) + '"' + (p.gym ? ' aria-haspopup="dialog"' : '') + '>' + fmt(h) + ' to ' + fmt(h + slotLen(p)) + '<em>' + (p.gym ? '9Round · ' + (slotLen(p) < 1 ? '30' : '60') + ' min' : 'Open') + '</em></button>';
      else cell = '<div class="blk bk-off">Not available</div>';
      out.push('<li class="row"' + (b ? ' style="min-height:' + b[2] * 44 + 'px"' : '') + '><time>' + fmt(h) + '</time><div class="cell">' + cell + '</div></li>');
    });
    $('#rows').innerHTML = out.join('');
  }
  function summary() {
    const p = PLACES[st.loc], x = dates[st.date];
    const set = (id, v, empty) => { const e = $(id); e.textContent = v || empty; e.classList.toggle('bk-empty', !v); };
    set('#s-where', st.loc === 'home' && st.city ? 'Private · ' + st.city : p.name, 'Choose a gym');
    set('#s-when', st.hour !== null ? DOW[x.getDay()] + ' ' + MON[x.getMonth()] + ' ' + x.getDate() + ', ' + (typeof st.hour === 'string' ? st.hour.toLowerCase() : fmt(st.hour)) : '', 'Choose a time');
    const placeBtn = $('.locs button[data-loc="' + st.loc + '"]');
    st.pack = '12';
    const packName = 'The 12-pack';
    set('#s-pack', packName, '');
    set('#s-focus', st.focus.join(' + '), 'Pick in step 2');
    $('#s-total').textContent = (placeBtn && placeBtn.dataset.total) || 'By email';
    $('#bk-price').textContent = (placeBtn && placeBtn.dataset.price) || '';
    set('#s-bonus', 'AI session, 30 min', '');
    $('#bonus-pick').hidden = false;
    $('#s-title').textContent = st.hour !== null ? packName : 'Nothing picked yet';
    $('#held').textContent = st.hour === null ? '' : typeof st.hour === 'string' ? 'Requested: ' + DOW[x.getDay()] + ' ' + MON[x.getMonth()] + ' ' + x.getDate() + ', ' + st.hour.toLowerCase() + ', ' + p.name + '. I reply with an exact time.' : 'Held for you: ' + DOW[x.getDay()] + ' ' + MON[x.getMonth()] + ' ' + x.getDate() + ' at ' + fmt(st.hour) + ' in ' + p.name + '.';
    $('#bk-where').hidden = st.loc !== 'home';
    $('#next').disabled = st.step === 0 ? (st.hour === null || (st.loc === 'home' && !st.city)) : false;
    const phone = matchMedia('(max-width:760px)').matches;
    $('#next').textContent = st.step === 2 ? (phone ? 'Send request' : 'Send my request') : 'Continue';
    $('#back').textContent = phone ? '‹' : 'Back';
    $('#next').className = 'bk-btn ' + (st.step === 2 ? 'coral' : 'ink');
    $('#back').hidden = st.step === 0;
    $('#navnote').textContent = st.step === 0 ? (st.hour === null ? 'Pick a day, a place and a time.' : 'Next: your focus.') : st.step === 1 ? 'You can change your focus later.' : 'I confirm by email. Nothing is charged here.';
    $$('.bk-steps button').forEach((b, i) => { b.toggleAttribute('aria-current', false); if (i === st.step) b.setAttribute('aria-current', 'step'); b.classList.toggle('bk-done', i < st.step); b.disabled = i > 0 && st.hour === null; });
    $$('.pane').forEach((p, i) => p.classList.toggle('bk-on', i === st.step));
    const when = st.hour === null ? '' : DOW[x.getDay()] + ' ' + MON[x.getMonth()] + ' ' + x.getDate() + ' · ' + (typeof st.hour === 'string' ? st.hour : fmt(st.hour));
    $('#barline').innerHTML = st.hour === null ? (st.loc === 'home' && !st.city ? '<b>Add your ZIP</b> or city' : '<b>Pick a time</b> to start') : '<b>' + when + '</b><span>' + (st.loc === 'home' ? (st.city || 'Add your ZIP') : p.name) + ' · ' + '12-pack' + (st.step && st.focus.length ? ' · ' + st.focus.join(' + ') : '') + '</span>';
    $('#review').innerHTML = st.hour === null ? '' : '<dl><div><dt>When</dt><dd>' + when + '</dd></div><div><dt>Where</dt><dd>' + (st.loc === 'home' ? 'Private, in person · ' + (st.city || '') : p.name) + '</dd></div><div><dt>Session</dt><dd>' + 'The 12-pack + AI session' + '</dd></div><div><dt>Focus</dt><dd>' + (st.focus.join(' + ') || 'We pick together') + '</dd></div></dl><button type="button" class="linkish" data-edit>Change</button>';
    root.dataset.step = st.step;
    $$('[data-pin]').forEach((a) => a.classList.toggle('bk-on', a.dataset.pin === st.loc));
  }
  document.addEventListener('click', (e) => { if (e.target.closest('[data-edit]')) { st.step = 0; summary(); $('.bk-panel').scrollIntoView({ block: 'start' }); } });
  $('.area svg').addEventListener('click', (e) => { const a = e.target.closest('[data-pin]'); if (!a) return; e.preventDefault(); { let i = st.date; while (!avail(a.dataset.pin, dates[i].getDay())) i = (i + 1) % dates.length; if (i !== st.date) { st.date = i; buildDates(); setLocs(); } } st.loc = a.dataset.pin; st.hour = null; setLocs(); $$('.locs button.loc').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.loc === st.loc))); buildDay(); summary(); if (a.dataset.city) setCity(a.dataset.city, a.dataset.city); const land = a.dataset.pin === 'home' ? $('#bk-where') : $('.cal'); land.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); });
  $('.locs').addEventListener('click', (e) => { const b = e.target.closest('button.loc'); if (!b) return; st.loc = b.dataset.loc; st.hour = null; $$('.locs button.loc').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); buildDay(); summary(); });
  $('#dates').addEventListener('click', (e) => { const b = e.target.closest('.date'); if (!b) return; st.date = +b.dataset.i; st.hour = null; buildDates(); setLocs(); buildDay(); summary(); const c = $('#dates .date[aria-pressed="true"]'); if (c) c.scrollIntoView({ block: 'nearest', inline: 'nearest' }); });
  let opener = null;
  function slotClick(e) {
    const b = e.target.closest('button.bk-open'); if (!b) return;
    st.hour = b.dataset.part || +b.dataset.h; buildDay(); summary();
  }
  $('#rows').addEventListener('click', slotClick);
  $('#tiles').addEventListener('click', slotClick);

  const SOCAL = "Central OC|Costa Mesa|92626,92627,92628;Central OC|Fountain Valley|92708,92728;Central OC|Garden Grove|92840,92841,92842,92843,92844,92845,92846;Central OC|Huntington Beach|92605,92615,92646,92647,92648,92649;Central OC|Newport Beach|92657,92658,92659,92660,92661,92662,92663;Central OC|Orange|92856,92857,92859,92862,92863,92864,92865,92866,92867,92868,92869;Central OC|Santa Ana|92701,92702,92703,92704,92705,92706,92707,92711,92712,92735,92799;Central OC|Tustin|92780,92781,92782;Central OC|Westminster|92683,92684,92685;East LA|Alhambra|91801,91802,91803,91804,91841,91896,91899;East LA|Arcadia|91006,91007,91066,91077;East LA|Artesia|90701,90702;East LA|Azusa|91702;East LA|Baldwin Park|91706;East LA|Bell|90201;East LA|Bell Gardens|90201,90202;East LA|Bellflower|90706,90707;East LA|Bradbury|91010;East LA|Cerritos|90623,90701,90703;East LA|City of Industry|90601,91744,91745,91746,91748;East LA|Claremont|91711;East LA|Commerce|90022,90023,90040,90091;East LA|Compton|90220,90221,90222,90223,90224;East LA|Covina|91722,91723,91724;East LA|Cudahy|90201;East LA|Diamond Bar|91765,91789;East LA|Downey|90239,90240,90241,90242;East LA|Duarte|91009,91010;East LA|El Monte|91731,91732,91734,91735;East LA|Glendora|91740,91741;East LA|Hacienda Heights|91745;East LA|Hawaiian Gardens|90716;East LA|Huntington Park|90255;East LA|Irwindale|91706;East LA|La Canada Flintridge|91011,91012;East LA|La Habra Heights|90631;East LA|La Mirada|90637,90638,90639;East LA|La Puente|91744,91746;East LA|La Verne|91750;East LA|Lakewood|90711,90712,90713,90714,90715;East LA|Long Beach|90801,90802,90803,90804,90805,90806,90807,90808,90809,90810,90813,90814,90815,90822,90831,90832,90833,90834,90835,90840,90842,90844,90845,90846,90847,90848,90853,90888,90899;East LA|Lynwood|90262;East LA|Maywood|90270;East LA|Monrovia|91016,91017;East LA|Montebello|90640;East LA|Monterey Park|91754,91755,91756;East LA|Norwalk|90650,90651,90652,90659;East LA|Paramount|90723;East LA|Pasadena|91050,91051,91101,91102,91103,91104,91105,91106,91107,91109,91110,91114,91115,91116,91117,91121,91123,91124,91125,91126,91129,91131,91175,91182,91184,91185,91186,91187,91188,91189,91191;East LA|Pico Rivera|90660,90661,90662,90665;East LA|Pomona|91766,91767,91768,91769,91797,91799;East LA|Rosemead|91770,91771,91772;East LA|Rowland Heights|91748;East LA|San Dimas|91773;East LA|San Gabriel|91775,91776,91778;East LA|San Marino|91108,91118;East LA|Santa Fe Springs|90670,90671;East LA|Sierra Madre|91024,91025;East LA|Signal Hill|90804,90806,90807;East LA|South El Monte|91733;East LA|South Gate|90280;East LA|South Pasadena|91030,91031;East LA|Temple City|91780;East LA|Vernon|90058;East LA|Walnut|91788,91789,91795;East LA|West Covina|91790,91791,91792,91793;East LA|Whittier|90601,90602,90603,90604,90605,90606,90607,90608,90609,90610,90612;Inland Empire|Banning|92220;Inland Empire|Beaumont|92223;Inland Empire|Calimesa|92320;Inland Empire|Canyon Lake|92587;Inland Empire|Chino|91708,91710;Inland Empire|Chino Hills|91709;Inland Empire|Colton|92324;Inland Empire|Corona|91719,92877,92878,92879,92880,92881,92882,92883;Inland Empire|Eastvale|91752,92880;Inland Empire|Fontana|92334,92335,92336,92337;Inland Empire|Grand Terrace|92313,92324;Inland Empire|Hemet|92543,92544,92545,92546;Inland Empire|Highland|92346;Inland Empire|Jurupa Valley|91752,92509,92519;Inland Empire|Lake Elsinore|92530,92531,92532;Inland Empire|Loma Linda|92350,92354,92357;Inland Empire|Menifee|92584;Inland Empire|Montclair|91763;Inland Empire|Moreno Valley|92551,92552,92553,92554,92555,92556,92557;Inland Empire|Murrieta|92562,92563,92564;Inland Empire|Norco|92860;Inland Empire|Ontario|91758,91761,91762,91764,91798;Inland Empire|Perris|92570,92571,92572,92599;Inland Empire|Rancho Cucamonga|91701,91729,91730,91737,91739;Inland Empire|Redlands|92373,92374,92375;Inland Empire|Rialto|92376,92377;Inland Empire|Riverside|92501,92502,92503,92504,92505,92506,92507,92508,92509,92513,92514,92515,92516,92517,92519,92521,92522;Inland Empire|San Bernardino|92401,92402,92403,92404,92405,92406,92407,92408,92410,92411,92412,92413,92414,92415,92418,92420,92423,92424,92427;Inland Empire|San Jacinto|92581,92582,92583;Inland Empire|Temecula|92589,92590,92591,92592,92593;Inland Empire|Upland|91784,91785,91786;Inland Empire|Wildomar|92595;Inland Empire|Yucaipa|92399;North OC|Anaheim|92801,92802,92803,92804,92805,92806,92807,92808,92809,92812,92814,92815,92816,92817,92821,92823,92825,92850,92899;North OC|Anaheim Hills|92807,92808;North OC|Brea|92821,92822,92823;North OC|Buena Park|90620,90621;North OC|Cypress|90630;North OC|Fullerton|92831,92832,92833,92834,92835,92836,92837,92838;North OC|La Habra|90631,90632,90633;North OC|La Palma|90623;North OC|Los Alamitos|90720;North OC|Placentia|92870;North OC|Seal Beach|90740;North OC|Stanton|90680;North OC|Villa Park|92861;North OC|Yorba Linda|92885,92886,92887;South OC|Aliso Viejo|92656;South OC|Coto de Caza|92679;South OC|Dana Point|92624,92629;South OC|Foothill Ranch|92610;South OC|Irvine|92602,92603,92604,92606,92612,92614,92616,92618,92619,92620,92623,92697,92709,92710;South OC|Laguna Beach|92651,92652;South OC|Laguna Hills|92653;South OC|Laguna Niguel|92607,92651,92677;South OC|Laguna Woods|92637;South OC|Lake Forest|92630;South OC|Mission Viejo|92675,92690,92691,92692;South OC|Rancho Santa Margarita|92688;South OC|San Clemente|92672,92673,92674;South OC|San Juan Capistrano|92675".split(';').map((r) => { const [area, name, z] = r.split('|'); return { area, name, zips: z ? z.split(',') : [] }; });
  const AREAS = ['North OC', 'Central OC', 'South OC', 'East LA', 'Inland Empire'];
  const IDX = [];
  SOCAL.forEach((c) => { IDX.push({ k: 'city', city: c.name, area: c.area, text: c.name }); c.zips.forEach((z) => IDX.push({ k: 'zip', city: c.name, area: c.area, text: z })); });
  IDX.sort((x, y) => x.text.localeCompare(y.text));
  let hits = [], act = -1;
  const esc = (t) => t.replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
  function setCity(name, shown) {
    const c = SOCAL.find((x) => x.name === name);
    st.city = c ? c.name : null;
    if (shown !== undefined) $('#q').value = shown;
    $('#qx').hidden = !$('#q').value;
    $('#zipmsg').innerHTML = c ? '<b>' + c.name + ', ' + c.area + '.</b> I train clients there.' : '';
    $('#zipmsg').className = 'zipmsg' + (c ? ' bk-ok' : '');
    summary();
  }
  function closeSug() { $('#sug').hidden = true; $('#q').setAttribute('aria-expanded', 'false'); $('#q').removeAttribute('aria-activedescendant'); act = -1; }
  function paintSug() {
    $('#sug').innerHTML = hits.map((h, i) => '<li role="option" id="sg' + i + '" aria-selected="' + (i === act) + '" data-i="' + i + '"><b>' + esc(h.text) + '</b><span>' + (h.k === 'zip' ? esc(h.city) + ' · ' : '') + esc(h.area) + '</span></li>').join('');
    if (act > -1) { $('#q').setAttribute('aria-activedescendant', 'sg' + act); $('#sg' + act).scrollIntoView({ block: 'nearest' }); } else $('#q').removeAttribute('aria-activedescendant');
  }
  function pick(h) { setCity(h.city, h.k === 'zip' ? h.text + ' · ' + h.city : h.city); closeSug(); }
  $('#q').addEventListener('input', (e) => {
    const v = e.target.value.trim(), low = v.toLowerCase();
    $('#qx').hidden = !v;
    if (st.city) { st.city = null; $('#zipmsg').textContent = ''; summary(); }
    if (!v) { closeSug(); return; }
    if (/^\d+$/.test(v)) hits = IDX.filter((h) => h.k === 'zip' && h.text.startsWith(v)).slice(0, 8);
    else hits = [...IDX.filter((h) => h.k === 'city' && h.text.toLowerCase().startsWith(low)), ...IDX.filter((h) => h.k === 'city' && !h.text.toLowerCase().startsWith(low) && h.text.toLowerCase().includes(low))].slice(0, 8);
    act = hits.length ? 0 : -1;
    if (!hits.length) {
      closeSug();
      if (/^\d{5}$/.test(v)) { $('#zipmsg').className = 'zipmsg out'; $('#zipmsg').innerHTML = '<b>' + v + ' is outside my usual area.</b> Send the request anyway and I\'ll tell you if I can get there, or pick Online.'; st.city = 'ZIP ' + v; summary(); }
      else $('#zipmsg').innerHTML = /^\d/.test(v) ? '' : 'No match in my area yet. Try your ZIP code.';
      return;
    }
    if (hits.length === 1 && hits[0].k === 'zip' && v.length === 5) { pick(hits[0]); return; }
    paintSug(); $('#sug').hidden = false; $('#q').setAttribute('aria-expanded', 'true');
  });
  $('#q').addEventListener('keydown', (e) => {
    if ($('#sug').hidden) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); act = (act + 1) % hits.length; paintSug(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); act = (act - 1 + hits.length) % hits.length; paintSug(); }
    else if (e.key === 'Enter') { e.preventDefault(); if (act > -1) pick(hits[act]); }
    else if (e.key === 'Escape') closeSug();
  });
  $('#sug').addEventListener('pointerdown', (e) => { const li = e.target.closest('li'); if (!li) return; e.preventDefault(); pick(hits[+li.dataset.i]); });
  $('#q').addEventListener('blur', () => setTimeout(closeSug, 120));
  $('#qx').addEventListener('click', () => { setCity(null, ''); closeSug(); $('#q').focus(); });
  $('#chips').innerHTML = FOCUS.map((f) => '<label><input type="checkbox" value="' + f + '"><span>' + f + '</span></label>').join('');
  $('#chips').addEventListener('change', (e) => { const v = e.target.value; if (e.target.checked) { st.focus.push(v); if (st.focus.length > 2) { const old = st.focus.shift(); $$('#chips input').find((i) => i.value === old).checked = false; } } else st.focus = st.focus.filter((x) => x !== v); summary(); });
  $('#next').addEventListener('click', () => { if (st.step === 2) { send(); return; } if (st.step < 2) { track('book_step', { detail: 'step' + (st.step + 2) }); st.step++; summary(); $('.bk-panel').scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); } });
  $('#back').addEventListener('click', () => { if (st.step > 0) { st.step--; summary(); } });
  $('.bk-steps').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b || b.disabled) return; st.step = +b.dataset.go; summary(); });
  buildDates(); setLocs(); buildDay(); summary();
  matchMedia('(max-width:760px)').addEventListener('change', summary);

  // URL entry: ?focus=muscle,boxing (and ?slot= from the home calendar) from the CTAs on every fitness page.
  const q = new URLSearchParams(location.search);
  // A Thursday hour from the calendar on the Fitness home (?slot=2026-11-12T08) is picked on arrival.
  const slot = /^(\d{4})-(\d{2})-(\d{2})T(\d{2})$/.exec(q.get('slot') || '');
  if (slot) {
    const i = dates.findIndex((x) => x.getFullYear() === +slot[1] && x.getMonth() + 1 === +slot[2] && x.getDate() === +slot[3]);
    if (i > -1 && PLACES.brea.open.has(+slot[4]) && dates[i].getDay() === 4) { st.date = i; st.loc = 'brea'; st.hour = +slot[4]; buildDates(); setLocs(); buildDay(); }
  }
  const SLUG = { muscle: 'Muscle building', 'fat-loss': 'Fat loss', shoulders: 'Shoulder strength', boxing: 'Boxing', kickboxing: 'Kickboxing', 'muay-thai': 'Muay Thai', conditioning: 'Conditioning', mobility: 'Mobility and yoga', pilates: 'Reformer Pilates' };
  (q.get('focus') || '').split(',').slice(0, 2).forEach((id) => { const f = SLUG[id]; const box = f && $$('#chips input').find((i) => i.value === f); if (box) { box.checked = true; st.focus.push(f); } });
  summary();

  async function post(body) {
    try {
      const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ page: location.pathname, referrer: document.referrer || null, ...body }) });
      if (r.ok) return { ok: true };
      let code = ''; try { code = (await r.json()).error || ''; } catch (_) { /* no body */ }
      return { ok: false, msg: r.status === 429 ? 'Too many requests from here. Try again in a few minutes.' : code === 'invalid_email' ? 'That email doesn\'t look right.' : 'Something went wrong on my side. Try again in a minute.' };
    } catch (_) { return { ok: false, msg: 'No connection. Check your signal and try again.' }; }
  }
  async function send() {
    const name = $('#bk-name').value.trim(), email = $('#bk-email').value.trim(), msg = $('#bk-msg');
    msg.className = 'bk-msg';
    if (!name) { msg.textContent = 'Add your name.'; $('#bk-name').focus(); return; }
    if (!EMAIL.test(email)) { msg.textContent = 'Add an email I can reply to.'; $('#bk-email').focus(); return; }
    const x = dates[st.date], day = x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
    const hour = typeof st.hour === 'number' ? day + 'T' + String(Math.floor(st.hour)).padStart(2, '0') + (st.hour % 1 ? ':30' : '') : undefined;
    const part = typeof st.hour === 'string' ? day + ':' + st.hour.toLowerCase() : undefined;
    const city = SOCAL.find((c) => c.name === st.city);
    const ai = root.querySelector('input[name="ai"]:checked');
    const body = {
      door: 'train', name, email, phone: $('#bk-phone').value.trim() || null, message: $('#bk-note').value.trim() || null,
      location: { brea: 'brea', rsm: 'rancho-santa-margarita', home: 'in-home', online: 'online' }[st.loc],
      city: st.loc === 'home' ? st.city : null, company_website: $('#bk-hp').value,
      meta: { entry: 'booker', pack: '12-pack', slot: hour, part,
        focus: st.focus.map((f) => Object.keys(SLUG).find((k) => SLUG[k] === f)), area: city ? city.area : undefined,
        first: $('#bk-first').checked || undefined, ai: ai ? ai.value : undefined },
    };
    $('#next').disabled = true; $('#next').textContent = 'Sending';
    const r = await post(body);
    if (r.ok) {
      track('lead_sent', { business_type: 'train', detail: body.meta.pack + ':' + body.location });
      msg.classList.add('bk-ok');
      msg.textContent = 'Got it, ' + name.split(/\s+/)[0] + '. Your 12-pack request is in. Look for an email from me to confirm your time. If it doesn\'t show up, check spam.';
      $('#next').textContent = 'Sent'; root.dataset.sent = '1';
    } else { msg.textContent = r.msg; summary(); }
  }
}
