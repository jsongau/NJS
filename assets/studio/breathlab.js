// Breath Lab (2026-11-26): a hold-to-exhale breath game on /fitness/reformer-pilates and /fitness/mobility-and-yoga.
// Hold the pad (or the picture, or the space bar while the lab has focus) through the exhale, let go through the
// inhale. A ring is the guide; the dark outline is the visitor. Six reps on the breath complete a move; after two
// moves a booking card appears. The figures and the moves live in breathrigs.js.
// Classes are prefixed bl- and every element is found inside its own section, so nothing else on the page is touched.
import { RIGS } from './breathrigs.js';

export function mountBreathLab() {
  document.querySelectorAll('section[data-bl]').forEach((root) => {
    const make = RIGS[root.dataset.bl];
    if (make && !root.dataset.blOn) { root.dataset.blOn = '1'; run(root, make()); }
  });
}

function run(root, rig) {
  const $ = (c) => root.querySelector('.bl-' + c);
  const MOVES = rig.moves, draw = rig.draw, KEY = root.dataset.blKey;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let saved = {}; try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { /* storage blocked */ }
  const st = { i: 0, u: 0, hold: false, running: false, t: 0, phase: 0, acc: 0, frames: 0, moved: false, reps: [], streak: 0,
    done: new Set((saved.done || []).filter((id) => MOVES.some((m) => m.id === id))), watch: false, sound: false, verdictAt: 0 };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify({ done: [...st.done] })); } catch (e) { /* fine */ } };
  const mv = () => MOVES[st.i];

  // Haptics: Android vibrates; iOS Safari 17.4+ ticks when a hidden switch is toggled.
  let tick = null;
  const buzz = (ms) => { if (calm) return; try { if (navigator.vibrate) { navigator.vibrate(ms); return; }
    if (!tick) { tick = document.createElement('label'); tick.setAttribute('aria-hidden', 'true'); tick.style.cssText = 'position:fixed;left:-99px;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none'; tick.innerHTML = '<input type="checkbox" switch tabindex="-1">'; document.body.appendChild(tick); }
    tick.click(); } catch (e) { /* not supported */ } };

  // Breath sound: soft filtered noise that falls on the exhale and rises on the inhale. Off until asked for.
  let audio = null;
  const soundOn = () => { if (audio) return; try { const AC = window.AudioContext || window.webkitAudioContext; const ctx = new AC(); const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.9; const g = ctx.createGain(); g.gain.value = 0; src.connect(f); f.connect(g); g.connect(ctx.destination); src.start(); audio = { ctx, f, g }; } catch (e) { audio = null; } };
  const soundSet = (phase, k) => { if (!audio) return; const on = st.sound && st.running && seen; const env = on ? Math.sin(Math.PI * k) * 0.16 : 0; audio.g.gain.setTargetAtTime(env, audio.ctx.currentTime, 0.05); audio.f.frequency.setTargetAtTime(phase === 0 ? 900 - 480 * k : 700 + 900 * k, audio.ctx.currentTime, 0.05); };

  // ---- Screen
  const svg = (inner) => '<svg viewBox="0 0 360 200" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
  const rigEl = $('rig'), scene = $('scene'), pad = $('pad'), list = $('moves'), pips = $('pips');
  list.innerHTML = MOVES.map((m, i) => '<li><button type="button" data-i="' + i + '" aria-pressed="false">' + svg(draw(m, 1, 0, true)) + '<b>' + m.name + '</b></button></li>').join('');
  pips.innerHTML = '<i></i><i></i><i></i><i></i><i></i><i></i>';
  const paintMove = (scroll) => {
    const m = mv(); $('mv-h').textContent = m.name; $('mv-p').textContent = m.line;
    list.querySelectorAll('button').forEach((b, i) => { b.setAttribute('aria-pressed', String(i === st.i)); b.classList.toggle('bl-done', st.done.has(MOVES[i].id)); });
    $('s-moves').textContent = st.done.size + ' / ' + MOVES.length; $('book').hidden = st.done.size < 2;
    const li = list.children[st.i]; if (scroll && li && list.scrollWidth > list.clientWidth + 1) list.scrollTo({ left: li.offsetLeft - (list.clientWidth - li.offsetWidth) / 2, behavior: calm ? 'auto' : 'smooth' });
  };
  const paintReps = () => { [...pips.children].forEach((p, i) => { p.className = st.reps[i] ? 'bl-' + st.reps[i] : ''; }); pips.setAttribute('aria-label', 'Reps on the breath: ' + st.reps.length + ' of 6'); $('s-streak').textContent = st.streak; };
  const say = (text, cls) => { const v = $('verdict'); v.textContent = text; v.className = 'bl-verdict bl-show' + (cls ? ' bl-' + cls : ''); st.verdictAt = performance.now(); };
  const reset = (keepCue) => { st.u = 0; st.running = false; st.t = 0; st.phase = 0; st.acc = 0; st.frames = 0; st.moved = false; st.reps = []; st.streak = 0; paintReps(); $('s-sync').textContent = '0%';
    if (!keepCue) { $('cue-b').textContent = 'Ready'; $('cue-s').textContent = st.watch ? 'Watch one, then try it' : 'Press and hold to breathe out'; } };

  const endRep = () => {
    const sync = st.frames ? st.acc / st.frames : 0; $('s-sync').textContent = Math.round(sync * 100) + '%';
    if (st.watch) { st.acc = 0; st.frames = 0; return; }
    if (!st.moved) { say('Hold on the exhale, let go on the inhale'); st.acc = 0; st.frames = 0; return; }
    const q = sync >= 0.84 ? 'perfect' : sync >= 0.62 ? 'good' : '';
    if (q) { st.reps.push(q); st.streak++; say(q === 'perfect' ? 'On the breath' : 'Good. Stay with the ring', q); buzz(q === 'perfect' ? [10, 40, 14] : 10); } else { st.streak = 0; say('Off the breath. Follow the ring'); buzz(4); }
    st.acc = 0; st.frames = 0; st.moved = false; paintReps();
    if (st.reps.length >= 6) {
      st.done.add(mv().id); save(); buzz([16, 50, 16, 50, 30]); $('live').textContent = mv().name + ' complete. ' + st.done.size + ' of ' + MOVES.length + ' moves done.';
      const next = MOVES.findIndex((m) => !st.done.has(m.id)); say(next < 0 ? 'Every move done. Beautiful work' : 'Done. Next: ' + MOVES[next].name, 'perfect');
      st.running = false; setHold(false);
      setTimeout(() => { if (next >= 0) st.i = next; reset(); paintMove(true); }, 1500);
    }
  };

  const setHold = (on) => { st.hold = on; pad.classList.toggle('bl-holding', on); scene.classList.toggle('bl-holding', on); $('pad-b').textContent = on ? 'Exhaling' : 'Hold to exhale'; };
  const press = (e) => { if (e && e.cancelable) e.preventDefault(); if (st.watch || st.hold) return; if (!st.running) { st.running = true; st.t = 0; st.phase = 0; st.acc = 0; st.frames = 0; if (st.sound) soundOn(); } st.moved = true; setHold(true); buzz(6); };
  const release = () => { if (!st.hold) return; setHold(false); buzz(4); };
  for (const el of [pad, scene]) {
    el.addEventListener('pointerdown', (e) => { if (e.button > 0) return; if (el === pad) { try { el.setPointerCapture(e.pointerId); } catch (x) { /* fine */ } } press(el === pad ? e : null); });
    el.addEventListener('pointerup', release); el.addEventListener('pointercancel', release); el.addEventListener('pointerleave', (e) => { if (el === scene) release(e); });
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  window.addEventListener('blur', release);
  // The space bar works only while focus is inside the lab, so it never takes over page scrolling.
  root.addEventListener('keydown', (e) => { if (e.code !== 'Space' && e.key !== ' ') return; if (e.target.closest('.bl-moves, .bl-tog, a')) return; e.preventDefault(); if (!e.repeat) press(); });
  root.addEventListener('keyup', (e) => { if (e.code === 'Space' || e.key === ' ') release(); });
  list.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; st.i = Number(b.dataset.i); buzz(8); setHold(false); reset(); paintMove(true); });
  $('t-watch').addEventListener('click', (e) => { st.watch = !st.watch; e.currentTarget.setAttribute('aria-pressed', String(st.watch)); buzz(8); setHold(false); reset(); if (st.watch) { st.running = true; if (st.sound) soundOn(); } pad.hidden = st.watch; });
  $('t-sound').addEventListener('click', (e) => { st.sound = !st.sound; e.currentTarget.setAttribute('aria-pressed', String(st.sound)); buzz(8); if (st.sound) { soundOn(); if (audio && audio.ctx.state === 'suspended') audio.ctx.resume(); } else soundSet(0, 0); });

  // ---- The loop. The guide (g) is the breath; u is the visitor. It runs only while the lab is on screen.
  let seen = false, rafId = 0, last = 0;
  const ringG = $('ring-g'), ringU = $('ring-u');
  const frame = (now) => {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now; const m = mv(); const E = m.secs[0], I = m.secs[1];
    let g = 0, k = 0;
    if (st.running) {
      st.t += dt; const dur = st.phase === 0 ? E : I;
      if (st.t >= dur) { st.t -= dur; st.phase = 1 - st.phase; buzz(5); if (st.phase === 0) endRep(); }
      k = Math.min(1, st.t / (st.phase === 0 ? E : I)); g = st.phase === 0 ? k : 1 - k;
      if (st.watch) st.u = g; else st.u = Math.min(1, Math.max(0, st.u + (st.hold ? dt / E : -dt / I)));
      st.acc += 1 - Math.abs(st.u - g); st.frames++;
      const cue = st.phase === 0 ? m.ex : m.inh; $('cue-b').textContent = cue[0]; $('cue-s').textContent = cue[1];
      $('ring-b').textContent = cue[0]; $('ring-t').textContent = Math.max(0, (st.phase === 0 ? E : I) - st.t).toFixed(1);
    } else if (!st.hold) { st.u = Math.max(0, st.u - dt / I); $('ring-b').textContent = 'Exhale'; $('ring-t').textContent = E.toFixed(1); }
    ringG.style.setProperty('--bl-s', (1 - 0.58 * g).toFixed(3)); ringU.style.setProperty('--bl-us', (1 - 0.58 * st.u).toFixed(3));
    rigEl.innerHTML = draw(m, st.u, st.t);
    soundSet(st.phase, k);
    if (st.verdictAt && now - st.verdictAt > 1600) { $('verdict').classList.remove('bl-show'); st.verdictAt = 0; }
    rafId = seen ? requestAnimationFrame(frame) : 0;
  };
  const wake = () => { if (!rafId && seen) { last = 0; rafId = requestAnimationFrame(frame); } };
  paintMove(false); reset(); rigEl.innerHTML = draw(mv(), 0, 0);
  if ('IntersectionObserver' in window) new IntersectionObserver((es) => { seen = es[0].isIntersecting; if (!seen) { release(); soundSet(0, 0); } wake(); }).observe(root);
  else { seen = true; wake(); }
  root.__bl = { st, MOVES, press, release };
}
