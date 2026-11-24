// Sound effects for the movement labs, synthesized with the Web Audio API (no audio files).
// SFX: tiny synthesized sound kit (Web Audio only, no files, no network).
// Usage: SFX.unlock() inside a user gesture, then SFX.play('jab', { intensity: 0.8 }).
export const SFX = (() => {
  const KEY = 'njs-sfx-muted', MASTER = 0.5;
  let ctx = null, comp = null, out = null, noiseBuf = null, muted = false;
  try { muted = localStorage.getItem(KEY) === '1'; } catch (e) { /* storage blocked */ }

  // Build the context and master chain lazily (browsers need a user gesture first).
  function init() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    comp = ctx.createDynamicsCompressor(); // keeps rapid taps from clipping
    comp.threshold.value = -18; comp.knee.value = 10; comp.ratio.value = 12;
    comp.attack.value = 0.002; comp.release.value = 0.15;
    out = ctx.createGain(); // master volume, after the compressor
    out.gain.value = muted ? 0 : MASTER;
    comp.connect(out); out.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); // 1s of white noise
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }

  // Percussive envelope: fast attack, exponential decay to silence.
  function envelope(t, vol, attack, dur) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(Math.max(vol, 0.0002), t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(comp);
    return g;
  }

  // Pitched voice. o: { f, f2 (glide target), type, dur, vol, attack }
  function tone(t, o) {
    const osc = ctx.createOscillator();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f, t);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t + o.dur);
    osc.connect(envelope(t, o.vol, o.attack || 0.004, o.dur));
    osc.start(t); osc.stop(t + o.dur + 0.03);
  }

  // Filtered noise voice. o: { f, f2 (sweep target), q, filter, dur, vol, attack }
  function noise(t, o) {
    const src = ctx.createBufferSource(), flt = ctx.createBiquadFilter();
    src.buffer = noiseBuf;
    flt.type = o.filter || 'bandpass';
    flt.Q.value = o.q || 0.8;
    flt.frequency.setValueAtTime(o.f, t);
    if (o.f2) flt.frequency.exponentialRampToValueAtTime(o.f2, t + o.dur);
    src.connect(flt); flt.connect(envelope(t, o.vol, o.attack || 0.003, o.dur));
    src.start(t, Math.random() * 0.5); src.stop(t + o.dur + 0.03);
  }

  // Each sound: (t = start time, v = volume 0..1, p = pitch factor).
  const SOUNDS = {
    // Quick light glove-on-bag snap.
    jab(t, v, p) {
      noise(t, { f: 2200 * p, q: 0.7, dur: 0.05, vol: 0.45 * v });
      tone(t, { f: 180 * p, f2: 95 * p, dur: 0.09, vol: 0.8 * v });
    },
    // Heavier rear-hand thud with more body.
    cross(t, v, p) {
      noise(t, { f: 1300 * p, filter: 'lowpass', dur: 0.07, vol: 0.5 * v });
      tone(t, { f: 110 * p, f2: 55 * p, type: 'triangle', dur: 0.14, vol: 0.95 * v });
    },
    // Uppercut: short rising whoosh of the arm, then the thud landing.
    upper(t, v, p) {
      noise(t, { f: 500 * p, f2: 2000 * p, q: 1.5, dur: 0.09, vol: 0.28 * v, attack: 0.05 });
      noise(t + 0.08, { f: 1600 * p, q: 0.7, dur: 0.05, vol: 0.4 * v });
      tone(t + 0.08, { f: 135 * p, f2: 65 * p, type: 'triangle', dur: 0.13, vol: 0.9 * v });
    },
    // Deep heavy-bag thump with a shin slap on top.
    kick(t, v, p) {
      noise(t, { f: 1800 * p, q: 0.6, dur: 0.07, vol: 0.5 * v });
      tone(t, { f: 70 * p, f2: 42 * p, type: 'triangle', dur: 0.22, vol: 1.0 * v });
      tone(t, { f: 140 * p, f2: 80 * p, dur: 0.12, vol: 0.4 * v }); // octave so phones can voice it
    },
    // Dull mid thud, no snap.
    knee(t, v, p) {
      noise(t, { f: 600 * p, filter: 'lowpass', dur: 0.05, vol: 0.3 * v });
      tone(t, { f: 150 * p, f2: 85 * p, dur: 0.12, vol: 0.85 * v });
    },
    // Air swish for a miss or slip.
    whoosh(t, v, p) {
      noise(t, { f: 450 * p, f2: 2600 * p, q: 1.8, dur: 0.24, vol: 0.9 * v, attack: 0.09 });
    },
    // Jump rope ticking the floor.
    rope(t, v) {
      noise(t, { f: 5200, filter: 'highpass', dur: 0.02, vol: 0.25 * v, attack: 0.001 });
      tone(t, { f: 2600, dur: 0.018, vol: 0.12 * v, attack: 0.001 });
    },
    // Soft kettlebell / effort clunk.
    rep(t, v, p) {
      tone(t, { f: 240 * p, f2: 185 * p, type: 'triangle', dur: 0.1, vol: 0.4 * v });
      tone(t, { f: 96 * p, dur: 0.13, vol: 0.5 * v });
      tone(t, { f: 640 * p, dur: 0.06, vol: 0.08 * v });
    },
    // Boxing ring bell: one ding, inharmonic partials, long ring-out.
    bell(t, v) {
      noise(t, { f: 3200, q: 1, dur: 0.02, vol: 0.15 * v, attack: 0.001 }); // hammer strike
      [[620, 0.5, 1.2], [930, 0.3, 1.0], [1480, 0.2, 0.7], [2100, 0.12, 0.45]].forEach((b) =>
        tone(t, { f: b[0], dur: b[2], vol: b[1] * v, attack: 0.002 }));
    },
    // Subtle UI tick for picking a chip or time slot.
    tick(t, v) { tone(t, { f: 1500, f2: 1100, dur: 0.03, vol: 0.2 * v, attack: 0.001 }); },
    // Rising two-note confirm: step done, keep going.
    next(t, v) {
      tone(t, { f: 660, type: 'triangle', dur: 0.12, vol: 0.3 * v });
      tone(t + 0.09, { f: 880, type: 'triangle', dur: 0.18, vol: 0.3 * v });
    },
    // Bright three-note arpeggio: the reward opening up.
    unlock(t, v) {
      [1047, 1319, 1568].forEach((f, i) =>
        tone(t + i * 0.07, { f, type: 'triangle', dur: i === 2 ? 0.4 : 0.2, vol: 0.28 * v }));
    },
    // Celebration: ring bell, then a rising major arpeggio that lands and holds.
    win(t, v) {
      SOUNDS.bell(t, v * 0.7);
      [523, 659, 784, 1047].forEach((f, i) =>
        tone(t + 0.14 + i * 0.11, { f, type: 'triangle', dur: i === 3 ? 0.55 : 0.2, vol: 0.3 * v }));
      tone(t + 0.47, { f: 1568, dur: 0.5, vol: 0.1 * v }); // shimmer on the top note
    },
    // Soft pop for a dialog appearing.
    // Inhale through the nose: thin air swelling upward. d = seconds.
    inhale(t, v, p, d) {
      noise(t, { f: 700, f2: 1900, q: 1.1, dur: d, vol: 0.5 * v, attack: d * 0.6 });
      noise(t, { f: 2600, f2: 3600, q: 0.6, filter: 'highpass', dur: d * 0.9, vol: 0.1 * v, attack: d * 0.6 });
    },
    // Exhale through the mouth: a fuller "haa" that falls away.
    exhale(t, v, p, d) {
      noise(t, { f: 1300, f2: 420, q: 0.9, dur: d, vol: 0.7 * v, attack: Math.min(0.22, d * 0.25) });
      noise(t, { f: 380, f2: 240, q: 0.7, filter: 'lowpass', dur: d * 0.8, vol: 0.28 * v, attack: 0.12 });
    },
    pop(t, v) { tone(t, { f: 520, f2: 190, dur: 0.07, vol: 0.4 * v, attack: 0.002 }); },
  };
  const STRIKES = { jab: 1, cross: 1, upper: 1, kick: 1, knee: 1, whoosh: 1, rep: 1 };

  function play(name, opts) {
    try {
      if (muted || !Object.prototype.hasOwnProperty.call(SOUNDS, name) || !init()) return;
      const raw = opts && typeof opts.intensity === 'number' ? opts.intensity : 0.7;
      const v = Math.min(1, Math.max(0, raw));
      const p = STRIKES[name] ? 1 + (Math.random() * 2 - 1) * 0.04 : 1; // +/-4% so taps vary
      const fire = () => { try { SOUNDS[name](ctx.currentTime + 0.005, v, p, Math.min(4, Math.max(0.3, (opts && opts.dur) || 1))); } catch (e) { /* no-op */ } };
      if (ctx.state === 'running') { fire(); return; }
      // Suspended: try to resume. Drop the sound if that takes too long, so
      // nothing queued before the first gesture fires late and out of sync.
      const asked = Date.now(), r = ctx.resume && ctx.resume();
      if (r && r.then) {
        r.then(() => { if (!muted && ctx.state === 'running' && Date.now() - asked < 250) fire(); })
          .catch(() => {});
      }
    } catch (e) { /* audio must never break the page */ }
  }

  // Call from a tap/click handler to wake the audio context.
  function unlock() {
    try {
      if (!init() || ctx.state === 'running') return;
      const r = ctx.resume && ctx.resume();
      if (r && r.catch) r.catch(() => {});
    } catch (e) { /* no-op */ }
  }

  function setMuted(m) {
    muted = !!m;
    try { localStorage.setItem(KEY, muted ? '1' : '0'); } catch (e) { /* storage blocked */ }
    try { if (ctx) out.gain.setTargetAtTime(muted ? 0 : MASTER, ctx.currentTime, 0.015); } catch (e) { /* no-op */ }
  }

  return { play, unlock, setMuted, isMuted: () => muted };
})();
