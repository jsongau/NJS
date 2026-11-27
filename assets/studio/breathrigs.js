// Breath Lab figures (2026-11-26): the reformer and the yoga mat, each a side-on figure built from a few joints.
// A move has a rest pose (end of the inhale) and an effort pose (end of the exhale); the engine in breathlab.js
// blends between them as the visitor breathes. Knees and elbows are solved (two-bone IK), not drawn by hand.
// The breath cue on each move (ex = exhale, inh = inhale) is Jay's to correct as the coach.

function reformerRig() {
  const L = { thigh: 46, shin: 46, torso: 58, arm: 28, fore: 28 };
  const MOVES = [
    { id: 'footwork', name: 'Footwork', line: 'Feet on the bar, press the carriage away and bring it back without letting the springs win.', ex: ['Exhale', 'Press out'], inh: ['Inhale', 'Return with control'], secs: [3.2, 3.2], knee: 'up', elbow: 'up',
      rest: { car: 0, sh: [206, 129, 1], hip: [262, 129, 1], foot: [300, 107, 0], hand: [260, 131, 1] }, effort: { car: -50, sh: [206, 129, 1], hip: [262, 129, 1], foot: [300, 107, 0], hand: [260, 131, 1] } },
    { id: 'hundred', name: 'The Hundred', line: 'Head and shoulders curled up, legs long, arms pumping. Five pumps breathing in, five breathing out.', ex: ['Exhale', 'Five pumps, legs long'], inh: ['Inhale', 'Five pumps, hold the curl'], secs: [2.6, 2.6], knee: 'up', elbow: 'down', strap: 'hand', pump: 1, head: [-9, -13],
      rest: { car: -26, sh: [208, 126, 1], hip: [262, 129, 1], foot: [306, 86, 1], hand: [262, 121, 1] }, effort: { car: -26, sh: [208, 126, 1], hip: [262, 129, 1], foot: [326, 68, 1], hand: [262, 121, 1] } },
    { id: 'frog', name: 'Frog', line: 'Feet in the straps. Press the legs long on a diagonal, then bend and resist the pull home.', ex: ['Exhale', 'Press the legs long'], inh: ['Inhale', 'Bend and resist'], secs: [3, 3], knee: 'up', elbow: 'up', strap: 'foot',
      rest: { car: -8, sh: [206, 129, 1], hip: [262, 129, 1], foot: [290, 98, 1], hand: [260, 131, 1] }, effort: { car: -44, sh: [206, 129, 1], hip: [262, 129, 1], foot: [325, 68, 1], hand: [260, 131, 1] } },
    { id: 'bridge', name: 'Bridge', line: 'Feet on the bar, carriage still. Peel the hips up one bone at a time and roll back down.', ex: ['Exhale', 'Peel the hips up'], inh: ['Inhale', 'Roll down slowly'], secs: [3.4, 3.4], knee: 'up', elbow: 'up',
      rest: { car: 0, sh: [206, 129, 1], hip: [258, 129, 1], foot: [300, 107, 0], hand: [260, 131, 1] }, effort: { car: 0, sh: [206, 129, 1], hip: [255, 101, 1], foot: [300, 107, 0], hand: [260, 131, 1] } },
    { id: 'elephant', name: 'Elephant', line: 'Standing on the carriage, hands on the bar, hips high. Pull the carriage home from your middle.', ex: ['Exhale', 'Pull the carriage home'], inh: ['Inhale', 'Press back, heels heavy'], secs: [3, 3], knee: 'front', elbow: 'up', autoSh: 'up',
      rest: { car: -40, sh: [262, 94, 0], hip: [200, 52, 0], foot: [215, 137, 1], hand: [300, 107, 0] }, effort: { car: 0, sh: [272, 98, 0], hip: [222, 46, 0], foot: [215, 137, 1], hand: [300, 107, 0] } },
    { id: 'longstretch', name: 'Long stretch', line: 'A plank over the bar. Send the carriage back in one long line and bring it home without sagging.', ex: ['Exhale', 'Bring it home, one line'], inh: ['Inhale', 'Press back, stay long'], secs: [3.2, 3.2], knee: 'up', elbow: 'back', autoHip: 1,
      rest: { car: -36, sh: [286, 55, 0], foot: [192, 131, 1], hand: [300, 107, 0] }, effort: { car: -19, sh: [299, 51, 0], foot: [192, 131, 1], hand: [300, 107, 0] } },
  ];
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => t * t * (3 - 2 * t);
  const bend = (a, b, l1, l2, pick) => {            // two-bone joint: where the knee or elbow sits between a and b
    const dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.min(l1 + l2 - 0.5, Math.max(Math.abs(l1 - l2) + 0.5, Math.hypot(dx, dy)));
    const base = Math.atan2(dy, dx); const off = Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d));
    const c = [1, -1].map((s) => [a[0] + l1 * Math.cos(base + s * off), a[1] + l1 * Math.sin(base + s * off)]);
    const better = { up: (p, q) => p[1] < q[1], down: (p, q) => p[1] > q[1], front: (p, q) => p[0] > q[0], back: (p, q) => p[0] < q[0] }[pick];
    return better(c[0], c[1]) ? c[0] : c[1];
  };
  const pose = (m, u, time) => {
    const t = ease(u); const car = lerp(m.rest.car, m.effort.car, t);
    const at = (k) => { const a = m.rest[k], b = m.effort[k]; return [lerp(a[0], b[0], t) + a[2] * car, lerp(a[1], b[1], t)]; };
    let sh = at('sh'); const foot = at('foot'); let hand = at('hand'); let hip;
    if (m.autoHip) { const d = Math.hypot(foot[0] - sh[0], foot[1] - sh[1]); hip = [sh[0] + (foot[0] - sh[0]) / d * L.torso, sh[1] + (foot[1] - sh[1]) / d * L.torso]; } else hip = at('hip');
    if (m.autoSh) sh = bend(hip, hand, L.torso, L.arm + L.fore, m.autoSh);
    if (m.pump) hand = [hand[0], hand[1] + Math.sin(time * Math.PI * 2 * 5 / m.secs[0]) * 5];
    const sd = Math.hypot(sh[0] - hip[0], sh[1] - hip[1]) || 1; const head = m.head ? [sh[0] + m.head[0], sh[1] + m.head[1]] : [sh[0] + (sh[0] - hip[0]) / sd * 16, sh[1] + (sh[1] - hip[1]) / sd * 16];
    return { car, sh, hip, foot, hand, head, knee: bend(hip, foot, L.thigh, L.shin, m.knee), elbow: bend(sh, hand, L.arm, L.fore, m.elbow) };
  };
  const n = (v) => v.toFixed(1);
  const draw = (m, u, time, mini) => {
    const p = pose(m, u, time || 0); const cx = 170 + p.car; const sw = mini ? 1.4 : 1;
    let spring = 'M' + n(cx + 120) + ' 146'; const span = 304 - (cx + 120); for (let i = 1; i <= 10; i++) spring += 'L' + n(cx + 120 + span * i / 10) + ' ' + (i === 10 ? 146 : i % 2 ? 142 : 150);
    const strap = m.strap === 'hand' ? p.hand : m.strap === 'foot' ? p.foot : null;
    return '<path d="M0 176h360v24H0z" fill="#E6DCD0"/>' +
      '<path d="M40 152h280M52 152v24M308 152v24" stroke="#121416" stroke-width="' + 4 * sw + '"/><path d="M40 158h280" stroke="#121416" stroke-width="1.500" opacity=".35"/>' +
      '<path d="M304 152V110a6 6 0 0 0-6-6" stroke="#121416" stroke-width="' + 4.5 * sw + '"/><circle cx="299" cy="105" r="4.500" fill="#E9B93A" stroke="#121416" stroke-width="1.500"/>' +
      '<path d="M54 152V98" stroke="#121416" stroke-width="' + 3.5 * sw + '"/><circle cx="54" cy="96" r="4" fill="#fff" stroke="#121416" stroke-width="2"/>' +
      '<path d="' + spring + '" stroke="#FF8A6B" stroke-width="' + 2.2 * sw + '"/>' +
      (strap ? '<path d="M54 96L' + n(strap[0]) + ' ' + n(strap[1]) + '" stroke="#4A4744" stroke-width="' + 1.6 * sw + '" stroke-dasharray="1 0"/>' : '') +
      '<g transform="translate(' + n(p.car) + ' 0)"><rect x="170" y="138" width="120" height="13" rx="5" fill="#1F8A7D" stroke="#121416" stroke-width="' + 2.5 * sw + '"/><rect x="172" y="131" width="26" height="8" rx="4" fill="#136257" stroke="#121416" stroke-width="2"/><rect x="200" y="124" width="7" height="15" rx="3" fill="#121416"/><circle cx="184" cy="154" r="4" fill="#121416"/><circle cx="276" cy="154" r="4" fill="#121416"/></g>' +
      '<path d="M' + n(p.hip[0]) + ' ' + n(p.hip[1]) + 'L' + n(p.knee[0]) + ' ' + n(p.knee[1]) + 'L' + n(p.foot[0]) + ' ' + n(p.foot[1]) + '" stroke="#121416" stroke-width="' + 11 * sw + '"/>' +
      '<circle cx="' + n(p.foot[0]) + '" cy="' + n(p.foot[1]) + '" r="' + 4.5 * sw + '" fill="#F5C7A5" stroke="#121416" stroke-width="2"/>' +
      '<path d="M' + n(p.sh[0]) + ' ' + n(p.sh[1]) + 'L' + n(p.hip[0]) + ' ' + n(p.hip[1]) + '" stroke="#121416" stroke-width="' + 16 * sw + '"/><path d="M' + n(p.sh[0]) + ' ' + n(p.sh[1]) + 'L' + n(p.hip[0]) + ' ' + n(p.hip[1]) + '" stroke="#1F8A7D" stroke-width="' + 11 * sw + '"/>' +
      '<circle cx="' + n(p.head[0]) + '" cy="' + n(p.head[1]) + '" r="' + 10 * sw + '" fill="#F5C7A5" stroke="#121416" stroke-width="' + 2.5 * sw + '"/>' +
      '<path d="M' + n(p.sh[0]) + ' ' + n(p.sh[1]) + 'L' + n(p.elbow[0]) + ' ' + n(p.elbow[1]) + 'L' + n(p.hand[0]) + ' ' + n(p.hand[1]) + '" stroke="#121416" stroke-width="' + 9.5 * sw + '"/><path d="M' + n(p.sh[0]) + ' ' + n(p.sh[1]) + 'L' + n(p.elbow[0]) + ' ' + n(p.elbow[1]) + 'L' + n(p.hand[0]) + ' ' + n(p.hand[1]) + '" stroke="#F5C7A5" stroke-width="' + 6 * sw + '"/>';
  };
  return { moves: MOVES, draw, pose };
}

function yogaRig() {
  const L = { thigh: 46, shin: 46, arm: 28, fore: 28 };
  const FEET = { footF: [184, 168], footB: [177, 168] };
  const TALL = { sh: [180, 23], hip: [180, 76], ...FEET, handF: [189, -32.3], handB: [183, -33], kneeF: 'front', kneeB: 'front', elbowF: 'back', elbowB: 'back' };
  const FOLD = { sh: [200, 120], hip: [168, 78], ...FEET, handF: [214, 168], handB: [206, 168], kneeF: 'front', kneeB: 'front', elbowF: 'front', elbowB: 'front' };
  const WIDE = { footF: [218, 168], footB: [112, 168], kneeF: 'front', kneeB: 'front', elbowF: 'up', elbowB: 'up' };
  const LUNGE = { hip: [190, 138], footF: [236, 168], footB: [106, 168], kneeF: 'up', kneeB: 'down' };
  const DOG = { footF: [127, 168], footB: [122, 168], handF: [263, 168], handB: [259, 168], kneeF: 'front', kneeB: 'front', elbowF: 'back', elbowB: 'back' };
  const MOVES = [
    { id: 'mountain-fold', name: 'Mountain to fold', line: 'Stand tall with your arms overhead, then hinge at the hips and fold over your legs.', ex: ['Exhale', 'Fold from the hips'], inh: ['Inhale', 'Reach up tall'], secs: [3.4, 3.4],
      rest: TALL, effort: FOLD },
    { id: 'half-lift', name: 'Half lift', line: 'From a fold, lengthen to a flat back with your hands on your shins, then fold again.', ex: ['Exhale', 'Let the head hang'], inh: ['Inhale', 'Long, flat back'], secs: [3.2, 3.2],
      rest: { ...FOLD, sh: [222, 77], hip: [168, 79], handF: [188, 122], handB: [184, 123] }, effort: FOLD },
    { id: 'chair', name: 'Chair', line: 'Stand tall, then sit back as if into a chair and keep your arms reaching up.', ex: ['Exhale', 'Sit back and down'], inh: ['Inhale', 'Stand up tall'], secs: [3.4, 3.4],
      rest: TALL, effort: { ...TALL, sh: [172, 58], hip: [150, 108], handF: [195, 7], handB: [190, 5] } },
    { id: 'warrior-one', name: 'Warrior one', line: 'A long stance, arms reaching up. Bend the front knee deep, then straighten it.', ex: ['Exhale', 'Sink into the knee'], inh: ['Inhale', 'Straighten, reach'], secs: [3.4, 3.4],
      rest: { ...WIDE, sh: [165, 39], hip: [165, 93], handF: [172, -17], handB: [166, -17], elbowF: 'back', elbowB: 'back' }, effort: { ...WIDE, sh: [178, 50], hip: [178, 104], handF: [185, -6], handB: [179, -6], elbowF: 'back', elbowB: 'back' } },
    { id: 'warrior-two', name: 'Warrior two', line: 'A wide stance with the front knee bent. Arms out level, then tip back and reach the front arm up.', ex: ['Exhale', 'Arms out level'], inh: ['Inhale', 'Reach up and back'], secs: [3.4, 3.4],
      rest: { ...WIDE, sh: [160, 53], hip: [178, 104], handF: [136, 2], handB: [150, 108], elbowF: 'back', elbowB: 'back' }, effort: { ...WIDE, sh: [178, 50], hip: [178, 104], handF: [234, 51], handB: [122, 51] } },
    { id: 'triangle', name: 'Triangle', line: 'Legs wide and straight. Tip over the front leg with one hand to the shin and one arm up.', ex: ['Exhale', 'Tip over front leg'], inh: ['Inhale', 'Rise, arms wide'], secs: [3.4, 3.4],
      rest: { ...WIDE, footF: [214, 168], footB: [118, 168], sh: [166, 35.5], hip: [166, 89.5], handF: [222, 36.5], handB: [110, 36.5] }, effort: { ...WIDE, footF: [214, 168], footB: [118, 168], sh: [218, 88], hip: [166, 89.5], handF: [206, 143], handB: [218, 32], elbowF: 'front', elbowB: 'front' } },
    { id: 'low-lunge', name: 'Low lunge', line: 'Back knee down, front knee over the ankle. Sweep the arms up, then bring the hands down.', ex: ['Exhale', 'Hands to the mat'], inh: ['Inhale', 'Sweep the arms up'], secs: [3.4, 3.4],
      rest: { ...LUNGE, sh: [192, 84], handF: [198, 28], handB: [192, 28], elbowF: 'back', elbowB: 'back' }, effort: { ...LUNGE, sh: [236, 116], handF: [245, 168], handB: [226, 168], elbowF: 'front', elbowB: 'front' } },
    { id: 'down-dog', name: 'Down dog', line: 'From a plank, push the floor away and send your hips up and back, then come forward again.', ex: ['Exhale', 'Hips up and back'], inh: ['Inhale', 'Forward to plank'], secs: [3.4, 3.4], arc: [-3, -7],
      rest: { ...DOG, sh: [262, 112], hip: [212, 133] }, effort: { ...DOG, sh: [221, 131], hip: [182, 95] } },
{ id: 'cat-and-cow', name: 'Cat and cow', line: 'On hands and knees, lift the chest and tail as you breathe in, then round the back up as you breathe out.',
  ex: ['Exhale', 'Round the back up'], inh: ['Inhale', 'Chest forward, tail up'], secs: [3.4, 3.4],
  rest:   { sh: [201, 115], hip: [143, 120], footF: [94, 168], footB: [90, 168], handF: [201, 168], handB: [205, 168], kneeF: 'down', kneeB: 'down', elbowF: 'back', elbowB: 'back', head: [15, -9], spine: [0, 9] },
  effort: { sh: [197, 113], hip: [139, 121], footF: [94, 168], footB: [90, 168], handF: [201, 168], handB: [205, 168], kneeF: 'down', kneeB: 'down', elbowF: 'back', elbowB: 'back', head: [10, 15], spine: [0, -13] } },
{ id: 'childs-pose-to-tabletop', name: "Child's pose to tabletop", line: 'From hands and knees, sit the hips back to the heels with the arms long, then come forward again.',
  ex: ['Exhale', 'Hips back to the heels'], inh: ['Inhale', 'Come forward to hands and knees'], secs: [3.4, 3.4],
  rest:   { sh: [198, 113], hip: [140, 118], footF: [94, 168], footB: [91, 168], handF: [204, 168], handB: [202, 168], kneeF: 'down', kneeB: 'down', elbowF: 'up', elbowB: 'up', head: [16, 0] },
  effort: { sh: [156, 154], hip: [100, 139], footF: [94, 168], footB: [91, 168], handF: [204, 168], handB: [202, 168], kneeF: 'down', kneeB: 'down', elbowF: 'up', elbowB: 'up', head: [16, 3] } },
{ id: 'cobra', name: 'Cobra', line: 'Lying face down with the legs long, lift the chest with the elbows bent, then lower it back to the mat.',
  ex: ['Exhale', 'Lower the chest down'], inh: ['Inhale', 'Lift the chest'], secs: [3.4, 3.4],
  rest:   { sh: [216, 127], hip: [170, 162], footF: [79, 167], footB: [81, 167], handF: [226, 168], handB: [224, 168], kneeF: 'up', kneeB: 'up', elbowF: 'back', elbowB: 'back', head: [9, -14] },
  effort: { sh: [228, 160], hip: [170, 162], footF: [79, 167], footB: [81, 167], handF: [226, 168], handB: [224, 168], kneeF: 'up', kneeB: 'up', elbowF: 'back', elbowB: 'back', head: [16, 0] } },
{ id: 'bridge', name: 'Bridge', line: 'Lying on the back with the feet on the mat, peel the hips up, then roll back down.',
  ex: ['Exhale', 'Peel the hips up'], inh: ['Inhale', 'Roll down slowly'], secs: [3.4, 3.4],
  rest:   { sh: [110, 162], hip: [168, 162], footF: [222, 168], footB: [214, 168], handF: [165, 167], handB: [162, 167], kneeF: 'up', kneeB: 'up', elbowF: 'up', elbowB: 'up', head: [-16, -2] },
  effort: { sh: [110, 162], hip: [160, 133], footF: [222, 168], footB: [214, 168], handF: [165, 167], handB: [162, 167], kneeF: 'up', kneeB: 'up', elbowF: 'up', elbowB: 'up', head: [-16, -2] } },
{ id: 'seated-forward-fold', name: 'Seated forward fold', line: 'Sitting with the legs long, reach up tall, then fold forward over the legs with the hands to the feet.',
  ex: ['Exhale', 'Fold forward over the legs'], inh: ['Inhale', 'Sit tall, arms up'], secs: [3.4, 3.4],
  rest:   { sh: [130, 102], hip: [130, 160], footF: [221, 164], footB: [219, 163], handF: [136, 47], handB: [140, 48], kneeF: 'up', kneeB: 'up', elbowF: 'down', elbowB: 'down', head: [0, -16] },
  effort: { sh: [180, 130], hip: [130, 160], footF: [221, 164], footB: [219, 163], handF: [219, 158], handB: [217, 156], kneeF: 'up', kneeB: 'up', elbowF: 'down', elbowB: 'down', head: [15, 6] } },
{ id: 'boat', name: 'Boat', line: 'Balance on the seat with the knees bent and shins level, then straighten the legs into a V.',
  ex: ['Exhale', 'Straighten the legs to a V'], inh: ['Inhale', 'Bend the knees, shins level'], secs: [3.4, 3.4],
  rest:   { sh: [118, 112], hip: [150, 160], footF: [234, 134], footB: [230, 131], handF: [172, 122], handB: [170, 119], kneeF: 'up', kneeB: 'up', elbowF: 'down', elbowB: 'down', head: [-4, -17] },
  effort: { sh: [116, 113], hip: [150, 160], footF: [216, 98], footB: [212, 96], handF: [171, 120], handB: [169, 117], kneeF: 'up', kneeB: 'up', elbowF: 'down', elbowB: 'down', head: [-4, -17] } },
{ id: 'knees-to-chest', name: 'Knees to chest', line: 'Lying on the back, reach long with the arms overhead, then hug both knees in to the chest.',
  ex: ['Exhale', 'Hug the knees in'], inh: ['Inhale', 'Reach long, arms overhead'], secs: [3.4, 3.4],
  rest:   { sh: [120, 162], hip: [178, 162], footF: [269, 165], footB: [267, 164], handF: [66, 166], handB: [68, 164], kneeF: 'up', kneeB: 'up', elbowF: 'up', elbowB: 'up', head: [-16, -2] },
  effort: { sh: [120, 162], hip: [178, 162], footF: [192, 118], footB: [188, 114], handF: [160, 126], handB: [157, 122], kneeF: 'up', kneeB: 'up', elbowF: 'up', elbowB: 'up', head: [-16, -2] } },
{ id: 'kneeling-crescent', name: 'Kneeling crescent', line: 'In a kneeling lunge with the back knee down, sweep the arms up, then bring the hands to the hips and sink the hips forward.',
  ex: ['Exhale', 'Hands to hips, sink forward'], inh: ['Inhale', 'Sweep the arms up, lift the chest'], secs: [3.4, 3.4],
  rest:   { sh: [182, 68], hip: [182, 126], footF: [232, 168], footB: [114, 168], handF: [186, 13], handB: [190, 14], kneeF: 'up', kneeB: 'down', elbowF: 'back', elbowB: 'back', head: [0, -16] },
  effort: { sh: [196, 77], hip: [194, 135], footF: [232, 168], footB: [114, 168], handF: [202, 129], handB: [206, 128], kneeF: 'up', kneeB: 'down', elbowF: 'back', elbowB: 'back', head: [1, -16] } },
  ];
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => t * t * (3 - 2 * t);
  const fork = (a, b, l1, l2) => {                  // two-bone joint: the two places a knee or elbow can sit between a and b
    const dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.min(l1 + l2 - 0.1, Math.max(Math.abs(l1 - l2) + 0.5, Math.hypot(dx, dy)));
    const base = Math.atan2(dy, dx); const off = Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d));
    return [1, -1].map((s) => [a[0] + l1 * Math.cos(base + s * off), a[1] + l1 * Math.sin(base + s * off)]);
  };
  const BETTER = { up: (p, q) => p[1] < q[1], down: (p, q) => p[1] > q[1], front: (p, q) => p[0] > q[0], back: (p, q) => p[0] < q[0] };
  const side = (a, b, l1, l2, pick) => { const c = fork(a, b, l1, l2); return (BETTER[pick] || BETTER.up)(c[0], c[1]) ? 0 : 1; };
  const bend = (a, b, l1, l2, pick) => fork(a, b, l1, l2)[typeof pick === 'number' ? pick : side(a, b, l1, l2, pick)];
  const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
  // A joint that swings (a shoulder round the hip, a free hand round the shoulder) is blended as an angle and a
  // length about its parent, so the torso keeps its length and an arm sweeps an arc instead of cutting through the body.
  const swing = (pa, a, pb, b, pn, t) => {
    const ax = a[0] - pa[0], ay = a[1] - pa[1], bx = b[0] - pb[0], by = b[1] - pb[1]; const ra = Math.hypot(ax, ay), rb = Math.hypot(bx, by);
    if (ra < 1 || rb < 1) { const p = mix([ax, ay], [bx, by], t); return [pn[0] + p[0], pn[1] + p[1]]; }
    const a0 = Math.atan2(ay, ax); let da = Math.atan2(by, bx) - a0; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2;
    const r = lerp(ra, rb, t), ang = a0 + da * t; return [pn[0] + r * Math.cos(ang), pn[1] + r * Math.sin(ang)];
  };
  // A hand or foot that stays on the mat (or barely moves) is blended in a straight line so it stays planted.
  const planted = (a, b) => (a[1] >= 166 && b[1] >= 166) || Math.hypot(a[0] - b[0], a[1] - b[1]) < 3;
  const pose = (m, u) => {
    const t = ease(Math.min(1, Math.max(0, u))); const R = m.rest, E = m.effort;
    // Which way a joint folds is read from the picks at each end. If both ends fold the same way it never flips
    // on the way; if they differ, it changes over at the halfway point.
    const way = (par, k, l1, l2, pk) => { const r = side(R[par], R[k], l1, l2, R[pk]), e = side(E[par], E[k], l1, l2, E[pk]); return t >= 0.5 ? e : r; };
    const hip = mix(R.hip, E.hip, t); if (m.arc) { const w = 4 * t * (1 - t); hip[0] += m.arc[0] * w; hip[1] += m.arc[1] * w; } const sh = swing(R.hip, R.sh, E.hip, E.sh, hip, t);
    const tip = (k, par, pn) => planted(R[k], E[k]) ? mix(R[k], E[k], t) : swing(R[par], R[k], E[par], E[k], pn, t);
    const footF = tip('footF', 'hip', hip), footB = tip('footB', 'hip', hip), handF = tip('handF', 'sh', sh), handB = tip('handB', 'sh', sh);
    const sd = Math.hypot(sh[0] - hip[0], sh[1] - hip[1]) || 1; const auto = [(sh[0] - hip[0]) / sd * 16, (sh[1] - hip[1]) / sd * 16];
    const ho = mix(R.head || auto, E.head || auto, t);
    return { spine: mix(R.spine || [0, 0], E.spine || [0, 0], t), sh, hip, footF, footB, handF, handB, head: [sh[0] + ho[0], sh[1] + ho[1]],
      kneeF: bend(hip, footF, L.thigh, L.shin, way('hip', 'footF', L.thigh, L.shin, 'kneeF')), kneeB: bend(hip, footB, L.thigh, L.shin, way('hip', 'footB', L.thigh, L.shin, 'kneeB')),
      elbowF: bend(sh, handF, L.arm, L.fore, way('sh', 'handF', L.arm, L.fore, 'elbowF')), elbowB: bend(sh, handB, L.arm, L.fore, way('sh', 'handB', L.arm, L.fore, 'elbowB')) };
  };
  const n = (v) => v.toFixed(1);
  const INK = '#121416', SKIN = '#F5C7A5', TOP = '#7A5BD0';
  const draw = (m, u, time, mini) => {
    const p = pose(m, u); const sw = mini ? 1.4 : 1;
    const d3 = (a, b, c) => 'M' + n(a[0]) + ' ' + n(a[1]) + 'L' + n(b[0]) + ' ' + n(b[1]) + (c ? 'L' + n(c[0]) + ' ' + n(c[1]) : '');
    const dot = (c, r, w) => '<circle cx="' + n(c[0]) + '" cy="' + n(c[1]) + '" r="' + r * sw + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="' + w + '"/>';
    const leg = (k, f) => '<path d="' + d3(p.hip, k, f) + '" stroke="' + INK + '" stroke-width="' + 11 * sw + '"/>' + dot(f, 4.5, 2);
    const arm = (e, h) => '<path d="' + d3(p.sh, e, h) + '" stroke="' + INK + '" stroke-width="' + 9.5 * sw + '"/><path d="' + d3(p.sh, e, h) + '" stroke="' + SKIN + '" stroke-width="' + 6 * sw + '"/>' + dot(h, 3.6, 1.6);
    const back = 'M' + n(p.sh[0]) + ' ' + n(p.sh[1]) + 'Q' + n((p.sh[0] + p.hip[0]) / 2 + p.spine[0] * 2) + ' ' + n((p.sh[1] + p.hip[1]) / 2 + p.spine[1] * 2) + ' ' + n(p.hip[0]) + ' ' + n(p.hip[1]);
    return '' + (mini ? '<path d="M0 176h360v24H0z" fill="#E6DCD0"/>' : '<path d="M-900 176h2160v24H-900z" fill="#E6DCD0"/>') + '' +
      '<g transform="translate(180 176) scale(.8) translate(-180 -176)">' +
      '<rect x="40" y="170" width="280" height="6.500" rx="3.200" fill="' + TOP + '" stroke="' + INK + '" stroke-width="' + 2 * sw + '"/>' +
      '<g opacity=".55">' + arm(p.elbowB, p.handB) + leg(p.kneeB, p.footB) + '</g>' +
      leg(p.kneeF, p.footF) +
      '<path d="' + back + '" stroke="' + INK + '" stroke-width="' + 16 * sw + '"/><path d="' + back + '" stroke="' + TOP + '" stroke-width="' + 11 * sw + '"/>' +
      '<circle cx="' + n(p.head[0]) + '" cy="' + n(p.head[1]) + '" r="' + 10 * sw + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="' + 2.5 * sw + '"/>' +
      arm(p.elbowF, p.handF) + '</g>';
  };
  return { moves: MOVES, draw, pose };
}

export const RIGS = { reformer: reformerRig, yoga: yogaRig };
