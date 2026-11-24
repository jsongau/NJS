// Swing Lab (2026-11-24): a front-view athlete swinging a steel club or mace. Each movement is a set of
// keyframes for the grip and the weight's angle; the elbows are solved from the hands (two-bone IK). Drag
// scrubs the swing, a tap throws one rep, and a breathing guide follows the phase.
import { SFX } from './labsfx.js';

export function mountSwingLab() {
  if (!document.getElementById('sl-stage')) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // ---- geometry helpers ----
  const cap = (a, b, r1, r2) => { const dx = b[0] - a[0], dy = b[1] - a[1]; const L = Math.hypot(dx, dy) || 1; const nx = -dy / L, ny = dx / L;
    const c = (p, r) => 'M' + (p[0] - r).toFixed(1) + ' ' + p[1].toFixed(1) + 'a' + r + ' ' + r + ' 0 1 0 ' + 2 * r + ' 0a' + r + ' ' + r + ' 0 1 0 ' + -2 * r + ' 0Z';
    return 'M' + (a[0] + nx * r1).toFixed(1) + ' ' + (a[1] + ny * r1).toFixed(1) + 'L' + (b[0] + nx * r2).toFixed(1) + ' ' + (b[1] + ny * r2).toFixed(1) + 'L' + (b[0] - nx * r2).toFixed(1) + ' ' + (b[1] - ny * r2).toFixed(1) + 'L' + (a[0] - nx * r1).toFixed(1) + ' ' + (a[1] - ny * r1).toFixed(1) + 'Z' + c(a, r1) + c(b, r2); };
  const mid = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  // Two-bone arm: find the elbow for a shoulder and a hand, bending outward (side = -1 left, 1 right).
  function elbow(S, H, side, L1 = 47, L2 = 45) {
    let dx = H[0] - S[0], dy = H[1] - S[1]; let d = Math.hypot(dx, dy); d = Math.max(8, Math.min(L1 + L2 - 1, d));
    const base = Math.atan2(dy, dx); const a = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
    const e1 = [S[0] + L1 * Math.cos(base + a), S[1] + L1 * Math.sin(base + a)], e2 = [S[0] + L1 * Math.cos(base - a), S[1] + L1 * Math.sin(base - a)];
    return (e1[0] - S[0]) * side >= (e2[0] - S[0]) * side ? e1 : e2;
  }
  // Smooth keyframe track: values at times, eased between (cosine), wraps at 1.
  const track = (ts, vs) => (t) => { t = ((t % 1) + 1) % 1; let i = 0; while (i < ts.length - 2 && t > ts[i + 1]) i++; const u = (t - ts[i]) / (ts[i + 1] - ts[i]); const k = (1 - Math.cos(Math.PI * Math.max(0, Math.min(1, u)))) / 2; return vs[i] + (vs[i + 1] - vs[i]) * k; };

  // Smooth closed curve through many keyframes (Catmull-Rom). The end value may differ from the
  // start by a full turn (an angle), so the wrap carries that difference across the seam.
  const spline = (ts, vs) => { const n = ts.length - 1, delta = vs[n] - vs[0]; const V = (i) => (i < 0 ? vs[n + i] - delta : i > n ? vs[i - n] + delta : vs[i]);
    return (t) => { t = ((t % 1) + 1) % 1; let i = 0; while (i < n - 1 && t > ts[i + 1]) i++; const u = (t - ts[i]) / (ts[i + 1] - ts[i]); const p0 = V(i - 1), p1 = V(i), p2 = V(i + 1), p3 = V(i + 2);
      return .5 * ((2 * p1) + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u); }; };
  const rev = (f, turn) => (t) => f(1 - (((t % 1) + 1) % 1)) + (turn || 0);
  // Keyframes (11 per swing). Times, then angle of the weight, then the grip's x and y.
  const K = [0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1];
  const A360 = spline([0, .08, .18, .28, .4, .5, .6, .72, .84, .93, 1], [-90, -60, 10, 62, 88, 100, 122, 170, 235, 262, 270]);
  const X360 = spline([0, .08, .18, .28, .4, .5, .6, .72, .84, .93, 1], [180, 186, 202, 204, 186, 174, 158, 156, 168, 176, 180]);
  const Y360 = spline([0, .08, .18, .28, .4, .5, .6, .72, .84, .93, 1], [176, 150, 116, 100, 84, 84, 98, 112, 138, 162, 176]);
  const ACAST = spline(K, [-90, -72, -10, 62, 92, 112, 122, 96, 44, -58, -90]), XCAST = spline(K, [206, 212, 217, 213, 200, 188, 182, 196, 214, 213, 206]), YCAST = spline(K, [170, 142, 110, 98, 89, 86, 86, 90, 104, 138, 170]);
  const AMILL = spline(K, [-90, -125, -180, -235, -270, -300, -330, -360, -395, -430, -450]), XMILL = spline(K, [206, 202, 190, 174, 164, 160, 176, 204, 224, 216, 206]), YMILL = spline(K, [168, 128, 98, 94, 116, 160, 206, 214, 184, 160, 168]);

  // ---- the movements ----
  // ang: direction from the grip to the weight, in degrees (-90 = straight up, 90 = straight down).
  // back(t): true while the weight is behind the body. two: both hands on the handle.
  const cst = (v) => () => v;
  const ASPI = spline(K, [90, 92, 95, 98, 95, 90, 86, 84, 86, 88, 90]), XSPI = spline(K, [228, 220, 208, 198, 186, 180, 196, 216, 228, 230, 228]), YSPI = spline(K, [214, 180, 140, 104, 84, 76, 80, 104, 150, 190, 214]);
  const APUL = spline(K, [-90, -80, -40, 30, 80, 95, 80, 30, -40, -80, -90]), XPUL = spline(K, [206, 208, 212, 214, 210, 206, 210, 214, 212, 208, 206]), YPUL = spline(K, [168, 146, 118, 98, 88, 84, 88, 98, 120, 148, 168]);
  const YPRESS = spline(K, [168, 160, 140, 118, 100, 92, 100, 118, 140, 160, 168]);
  const ACIR = spline(K, [90, 126, 162, 198, 234, 270, 306, 342, 378, 414, 450]), XCIR = spline(K, [226, 206, 186, 174, 178, 196, 216, 236, 244, 238, 226]), YCIR = spline(K, [212, 218, 206, 178, 140, 108, 100, 116, 150, 188, 212]);
  const XLAT = spline(K, [206, 212, 226, 244, 258, 264, 258, 244, 226, 212, 206]), YLAT = spline(K, [196, 188, 168, 144, 128, 122, 128, 144, 168, 188, 196]);
  const YSW = spline(K, [226, 222, 200, 160, 118, 100, 118, 160, 200, 222, 226]), LSW = spline(K, [70, 50, 20, 50, 84, 96, 84, 50, 20, 50, 70]);
  const IN = (a, b) => (t) => (t > a && t < b ? 'in' : 'out');

  // breath(t): 'in' or 'out'. The common coaching cue: breathe in as the weight drops behind you and
  // the ribs open, breathe out as you pull it back to the front and brace.
  const MOVES = [
    { id: 'm360', kind: 'Steel mace', name: 'Mace 360', two: true, len: 132, head: 15, period: 3800,
      desc: 'Both hands on the handle. The ball tips over one shoulder, hangs behind your back like a pendulum, and comes over the other shoulder back to the front. Hips stay braced while your shoulders, lats and core steer it.',
      ang: A360, hx: X360, hy: Y360, back: (t) => t > .15 && t < .74, sway: track([0, .28, .5, .72, 1], [0, 5, 0, -5, 0]), breath: (t) => (t > .06 && t < .5 ? 'in' : 'out'),
      steps: [[0, 'Stack it', 'Hands at your chest, ball straight up, ribs down.'], [.08, 'Tip it over', 'Let the ball fall past your shoulder. Elbows stay close.'], [.3, 'Let it hang', 'Hands behind your head. Feel your lats stretch long.'], [.6, 'Pull it home', 'Drive the top elbow down and bring it back to center.']],
      musc: { Shoulders: [.08, .3, .6, .86], Lats: [.3, .66], Grip: [0, 1], Core: [.1, .9] } },
    { id: 'm102', kind: 'Steel mace', name: '10-to-2', two: true, len: 132, head: 15, period: 3000,
      desc: 'The first half of the 360, on repeat. The ball swings behind your back from ten o\'clock to two o\'clock. It opens tight shoulders and teaches the pendulum before you add the pull-over.',
      ang: track([0, .5, 1], [58, 122, 58]), hx: track([0, .5, 1], [204, 156, 204]), hy: track([0, .25, .5, .75, 1], [100, 80, 100, 80, 100]),
      back: () => true, sway: track([0, .5, 1], [5, -5, 5]), breath: (t) => (t < .5 ? 'in' : 'out'),
      steps: [[0, 'Two o\'clock', 'Hands by your right ear, ball hanging behind you.'], [.2, 'Swing through', 'Hands pass behind your head. Stay tall, don\'t arch.'], [.5, 'Ten o\'clock', 'Hands by your left ear. Lats long, grip relaxed.'], [.7, 'And back', 'Same path, other way. Smooth, like a clock.']],
      musc: { Shoulders: [0, 1], Lats: [.15, .4, .65, .9], Grip: [0, 1], Core: [0, 1] } },
    { id: 'cast', kind: 'Steel club · one arm', name: 'Shield cast', two: false, len: 96, head: 0, period: 3600,
      desc: 'One arm. The club starts upright at your chest, drops behind the same shoulder and swings like a pendulum across your back, then you pull it back up through the elbow. Same shoulder for the whole set.',
      ang: ACAST, hx: XCAST, hy: YCAST, back: (t) => t > .19 && t < .86, sway: track([0, .55, 1], [0, -4, 0]), breath: (t) => (t > .08 && t < .58 ? 'in' : 'out'),
      steps: [[0, 'Order', 'Club upright at your chest, elbow tucked, free hand on your ribs.'], [.1, 'Cast', 'Lift the elbow and let the club tip over your shoulder.'], [.32, 'Pendulum', 'It swings across your back. Elbow points to the sky.'], [.62, 'Pull', 'Lead with the elbow and bring it back to order.']],
      musc: { Shoulders: [.1, .9], Triceps: [.3, .72], Grip: [0, 1], Core: [.1, .9] } },
    { id: 'mill', kind: 'Steel club · one arm', name: 'Windmill (mill)', two: false, len: 96, head: 0, period: 3800,
      desc: 'Two circles in one: a small one near your head, driven by the elbow, and a big cast across the front of your body. The elbow circles inward.',
      ang: AMILL, hx: XMILL, hy: YMILL, back: (t) => t > .13 && t < .43, sway: track([0, .3, .6, .8, 1], [0, 3, -5, 4, 0]), breath: (t) => (t > .05 && t < .43 ? 'in' : 'out'),
      steps: [[0, 'Order', 'Club upright by your shoulder.'], [.08, 'Small circle', 'The elbow circles in. The club passes behind your head.'], [.43, 'Big cast', 'Arm long. Sweep it down and across the front of your body.'], [.8, 'Catch', 'Let it rise and settle back into order.']],
      musc: { Shoulders: [0, 1], Lats: [.2, .5], Obliques: [.43, .85], Grip: [0, 1] } },
    { id: 'rmill', kind: 'Steel club · one arm', name: 'Reverse windmill', two: false, len: 96, head: 0, period: 3800,
      desc: 'The same pattern run the other way. The elbow circles outward, like a jab, and the cast goes out to the side. It loads the shoulder in the opposite direction.',
      ang: rev(AMILL, -540), hx: rev(XMILL), hy: rev(YMILL), back: (t) => t > .57 && t < .87, sway: track([0, .2, .4, .7, 1], [0, 4, -5, 3, 0]), breath: (t) => (t > .57 && t < .95 ? 'in' : 'out'),
      steps: [[0, 'Order', 'Club upright by your shoulder.'], [.05, 'Cast out', 'Punch the hand out to the side and let the club sweep down.'], [.57, 'Small circle', 'The elbow circles out. The club passes behind your head.'], [.9, 'Catch', 'It drops back into order.']],
      musc: { Shoulders: [0, 1], Lats: [.5, .85], Obliques: [.1, .57], Grip: [0, 1] } },
    // ---- one arm ----
    { id: 'spiral', kind: 'Steel club · one arm', name: 'Spiral lift-around', two: false, len: 96, head: 0, period: 3800,
      desc: 'A warm-up for shoulders, elbows and wrists. The club points at the floor the whole time: lift it up the front of your body, carry it around the back of your head, and lower it down your side.',
      ang: ASPI, hx: XSPI, hy: YSPI, back: (t) => t > .38 && t < .72, sway: cst(0), breath: IN(0, .5),
      steps: [[0, 'Hang', 'Club at your side, pointing down.'], [.08, 'Lift', 'Pull from the elbow and raise it up the front, close to your body.'], [.4, 'Around', 'Carry it behind your head. The club still points down.'], [.7, 'Lower', 'Bring it around the shoulder and down to your side.']],
      musc: { Shoulders: [.1, .9], Triceps: [.35, .75], Grip: [0, 1], Core: [.2, .8] } },
    { id: 'pull1', kind: 'Steel club · one arm', name: 'One-arm pullover', two: false, len: 96, head: 0, period: 3400,
      desc: 'From order, reach the club over your shoulder and behind your head as if winding up to strike, then drive the elbow forward and down until the club is upright again.',
      ang: APUL, hx: XPUL, hy: YPUL, back: (t) => t > .28 && t < .72, sway: cst(0), breath: IN(.05, .52),
      steps: [[0, 'Order', 'Club upright, elbow bent 90 degrees by your ribs.'], [.1, 'Reach over', 'Lift the elbow and take the club over your shoulder.'], [.4, 'Behind', 'It hangs behind your head. Don\'t lean back.'], [.6, 'Drive', 'Elbow forward and down. Stop with the club upright.']],
      musc: { Shoulders: [.1, .9], Lats: [.4, .8], Triceps: [.3, .7], Core: [.1, .9] } },
    { id: 'torch', kind: 'Steel club · one arm', name: 'Torch press', two: false, len: 96, head: 0, period: 3000,
      desc: 'Press the club forward and up as if you were lifting a torch, keeping it upright the whole way, then bring it back to your ribs.',
      ang: cst(-90), hx: cst(206), hy: YPRESS, back: () => false, sway: cst(0), breath: IN(.5, 1),
      steps: [[0, 'Order', 'Club upright, elbow tucked.'], [.1, 'Press', 'Push it forward and up. Keep the club vertical.'], [.45, 'Hold', 'Arm long, shoulder down, wrist straight.'], [.6, 'Return', 'Bring it back to your ribs under control.']],
      musc: { Shoulders: [.05, .95], Triceps: [.1, .6], Grip: [0, 1], Core: [0, 1] } },
    { id: 'incirc', kind: 'Steel club · one arm', name: 'Inside circle', two: false, len: 96, head: 0, period: 3200,
      desc: 'Arm long. The club swings across the front of your body toward your midline, up and over, and back down the outside, drawing one big circle in front of you.',
      ang: ACIR, hx: XCIR, hy: YCIR, back: () => false, sway: track([0, .3, .7, 1], [0, -5, 4, 0]), breath: IN(.35, .85),
      steps: [[0, 'Hang', 'Club at your side, arm long.'], [.08, 'Across', 'Let it swing in toward your midline.'], [.4, 'Up and over', 'The circle rises past your face. Stay tall.'], [.75, 'Down', 'It falls down the outside and you catch the swing.']],
      musc: { Shoulders: [0, 1], Obliques: [.1, .6], Grip: [0, 1], Core: [0, 1] } },
    { id: 'outcirc', kind: 'Steel club · one arm', name: 'Outside circle', two: false, len: 96, head: 0, period: 3200,
      desc: 'The inside circle run the other way. The club swings out away from your body first, up and over, then down across your front.',
      ang: rev(ACIR, -360), hx: rev(XCIR), hy: rev(YCIR), back: () => false, sway: track([0, .3, .7, 1], [0, 4, -5, 0]), breath: IN(.15, .65),
      steps: [[0, 'Hang', 'Club at your side, arm long.'], [.08, 'Out', 'Let it swing out to the side.'], [.4, 'Up and over', 'The circle rises past your face. Stay tall.'], [.75, 'Across', 'It falls across your front and you catch the swing.']],
      musc: { Shoulders: [0, 1], Obliques: [.4, .9], Grip: [0, 1], Core: [0, 1] } },
    // ---- two hands, one club ----
    { id: 'cast2', kind: 'Steel club · two hands', name: 'Two-hand shield cast', two: true, len: 104, head: 0, period: 3600,
      desc: 'Both hands on one club. Raise your hands up and across to one shoulder, swing the club around your head, and return to the front. Pause upright before each rep.',
      ang: A360, hx: X360, hy: Y360, back: (t) => t > .15 && t < .74, sway: track([0, .28, .5, .72, 1], [0, 5, 0, -5, 0]), breath: IN(.06, .5),
      steps: [[0, 'Order', 'Club upright in front, elbows bent 90 degrees.'], [.08, 'Up and across', 'Hands rise to one shoulder.'], [.3, 'Around', 'The club swings behind your head.'], [.6, 'Return', 'Pull it back to the front and pause.']],
      musc: { Shoulders: [.08, .9], Lats: [.3, .66], Grip: [0, 1], Core: [.1, .9] } },
    { id: 'pull2', kind: 'Steel club · two hands', name: 'Two-hand pullover', two: true, len: 104, head: 0, period: 3200,
      desc: 'Both hands. Take the club straight up and over until it hangs behind your head, then pull it back to upright in front of your chest.',
      ang: APUL, hx: cst(180), hy: YPUL, back: (t) => t > .28 && t < .72, sway: cst(0), breath: IN(.05, .52),
      steps: [[0, 'Order', 'Club upright at your chest, both hands.'], [.1, 'Up', 'Lift your elbows and take it overhead.'], [.4, 'Behind', 'It hangs down your back. Ribs stay down.'], [.6, 'Pull', 'Elbows drive forward. Back to upright.']],
      musc: { Shoulders: [.1, .9], Lats: [.4, .8], Triceps: [.3, .7], Core: [.1, .9] } },
    { id: 'press2', kind: 'Steel club · two hands', name: 'Two-hand front press', two: true, len: 104, head: 0, period: 3000,
      desc: 'Both hands on the handle, one above the other. Press the club straight out in front of your chest until your hands reach eye level, then bring it back.',
      ang: cst(-90), hx: cst(184), hy: YPRESS, back: () => false, sway: cst(0), breath: IN(.5, 1),
      steps: [[0, 'Set', 'Club upright at your side of the chest, shoulders square.'], [.1, 'Press', 'Straight out until your hands reach eye level.'], [.45, 'Lock', 'Elbows long, chest proud, hips level.'], [.6, 'Return', 'Back to the chest under control.']],
      musc: { Shoulders: [.05, .95], Triceps: [.1, .6], Grip: [0, 1], Core: [0, 1] } },
    { id: 'lat2', kind: 'Steel club · two hands', name: 'Two-hand lateral swing', two: true, len: 104, head: 0, period: 2800,
      desc: 'Hinge slightly, arms long and relaxed. Swing the club side to side through a half circle in front of you, turning your hips and shoulders into each swing.',
      ang: track([0, .5, 1], [168, 12, 168]), hx: track([0, .5, 1], [156, 204, 156]), hy: track([0, .25, .5, .75, 1], [196, 216, 196, 216, 196]), back: () => false, sway: track([0, .5, 1], [-8, 8, -8]), breath: IN(0, .5),
      steps: [[0, 'Left', 'Club out to one side, hips turned with it.'], [.2, 'Through', 'It passes low in front of your legs.'], [.5, 'Right', 'Hips and shoulders turn to follow it.'], [.7, 'Back', 'Same arc the other way. Arms stay long.']],
      musc: { Obliques: [0, 1], Shoulders: [0, 1], Grip: [0, 1], Core: [0, 1] } },
    { id: 'mill2', kind: 'Steel club · two hands', name: 'Two-hand mill', two: true, len: 104, head: 0, period: 3800,
      desc: 'The mill with both hands on a longer club. Cast it out and across, turn through your hips, and bring it around behind your head.',
      ang: AMILL, hx: (t) => XMILL(t) - 14, hy: YMILL, back: (t) => t > .13 && t < .43, sway: track([0, .3, .6, .8, 1], [0, 4, -7, 5, 0]), breath: IN(.05, .43),
      steps: [[0, 'Order', 'Club upright, both hands.'], [.08, 'Behind', 'It circles behind your head.'], [.43, 'Cast', 'Arms long. Sweep down and across, hips turning.'], [.8, 'Catch', 'Let it rise back into order.']],
      musc: { Shoulders: [0, 1], Lats: [.2, .5], Obliques: [.43, .85], Grip: [0, 1] } },
    // ---- two clubs ----
    { id: 'dpull', kind: 'Two clubs', name: 'Double pullover', two: false, pair: true, len: 90, head: 0, period: 3400,
      desc: 'A club in each hand. Raise both past your ears, lower them behind your shoulders without leaning back, then swing them forward and down to the start.',
      ang: APUL, hx: (t) => XPUL(t) + 4, hy: YPUL, back: (t) => t > .28 && t < .72, sway: cst(0), breath: IN(.05, .52),
      steps: [[0, 'Order', 'Both clubs upright, elbows by your ribs.'], [.1, 'Raise', 'Both hands travel up past your ears.'], [.4, 'Behind', 'Clubs hang behind your shoulders. No arching.'], [.6, 'Swing', 'Forward and down to the start, together.']],
      musc: { Shoulders: [.1, .9], Lats: [.4, .8], Triceps: [.3, .7], Core: [.1, .9] } },
    { id: 'latp', kind: 'Two clubs', name: 'Lateral press', two: false, pair: true, len: 90, head: 0, period: 3000,
      desc: 'A club in each hand, palms forward. Press both out and up to shoulder height, keeping the clubs upright, then pull your arms back to your sides.',
      ang: cst(-90), hx: XLAT, hy: YLAT, back: () => false, sway: cst(0), breath: IN(.5, 1),
      steps: [[0, 'Set', 'Elbows bent, hands near your hips, clubs upright.'], [.1, 'Press out', 'Out and up until your arms are level.'], [.45, 'Level', 'Clubs still vertical. Shoulders down.'], [.6, 'Pull in', 'Back to your sides.']],
      musc: { Shoulders: [.05, .95], Grip: [0, 1], Core: [0, 1], Triceps: [.1, .6] } },
    { id: 'dswing', kind: 'Two clubs', name: 'Double front swing', two: false, pair: true, len: 90, head: 0, period: 2600, lenF: LSW, dip: spline(K, [26, 22, 8, 0, 0, 0, 0, 0, 8, 22, 26]),
      desc: 'Hinge at the hips with the clubs hanging back behind you. Snap your hips to stand tall and let that drive swing both clubs up to eye level, then control them back into the hinge.',
      ang: (t) => (t > .2 && t < .8 ? -90 : 90), hx: cst(204), hy: YSW, back: () => false, sway: cst(0), breath: IN(.55, 1),
      steps: [[0, 'Hinge', 'Hips back, spine long, clubs behind you.'], [.15, 'Snap', 'Stand tall fast. The hips throw the clubs.'], [.4, 'Eye level', 'Clubs float up in front of you.'], [.6, 'Control', 'Guide them back down into the hinge.']],
      musc: { Glutes: [.1, .45], Shoulders: [.3, .7], Grip: [0, 1], Core: [0, 1] } },
  ];

  // Grip group and level (1 foundation, 2 build, 3 advanced) for sorting. Levels are a starting
  // order for the coach to adjust.
  const META = { m102: ['mace', 1], m360: ['mace', 2], spiral: ['one', 1], torch: ['one', 1], pull1: ['one', 2], incirc: ['one', 2], outcirc: ['one', 2], cast: ['one', 3], mill: ['one', 3], rmill: ['one', 3],
    press2: ['two', 1], pull2: ['two', 1], lat2: ['two', 1], cast2: ['two', 2], mill2: ['two', 2], latp: ['pair', 1], dpull: ['pair', 2], dswing: ['pair', 2] };
  const GRIPS = [['all', 'All'], ['one', 'One arm'], ['two', 'Two hands'], ['pair', 'Two clubs'], ['mace', 'Mace']];
  const GORD = { one: 0, two: 1, pair: 2, mace: 3 }; const LVL = ['', 'Foundation', 'Build', 'Advanced'];
  MOVES.forEach((m) => { m.grip = META[m.id][0]; m.level = META[m.id][1]; });
  let fGrip = 'all', fSort = 'easy';
  const el = (id) => document.getElementById('sl-' + id);
  let breathNow = '', breathLvl = 0, lastBreathAt = 0, touched = false;
  let M = MOVES[0], t = 0, speed = 1, reps = 0, userReps = 0, asked = false, dragging = false, dragX = 0, lastUser = 0, tapBoost = 0, trail = [], lastStep = -1, lastBack = false;
  const inRanges = (r, tt) => { for (let i = 0; i < r.length; i += 2) if (tt >= r[i] && tt <= r[i + 1]) return true; return false; };

  function draw() {
    const a = M.ang(t) * Math.PI / 180, sw = M.sway(t), back = M.back(t);
    const grip = [M.hx(t), M.hy(t)]; const dir = [Math.cos(a), Math.sin(a)]; const dp = M.dip ? M.dip(t) : 0; const LEN = M.lenF ? M.lenF(t) : M.len;
    // Body (front view). The hips shift a little against the weight; the chest follows less.
    const hipL = [164 - sw, 214 + dp * .35], hipR = [196 - sw, 214 + dp * .35], shL = [146 + sw * .6, 118 + dp], shR = [214 + sw * .6, 118 + dp];
    const nk = [180 + sw * .7, 104 + dp], hd = [180 + sw * .9, 76 + dp * 1.05];
    const kL = [156 - sw * .4 - dp * .2, 276], kR = [204 - sw * .4 + dp * .2, 276], aL = [150, 336], aR = [210, 336];
    el('a-legs').setAttribute('d', cap(hipL, mid(hipL, kL, .55), 17, 16.5) + cap(mid(hipL, kL, .55), kL, 16.5, 12) + cap(kL, mid(kL, aL, .3), 11.5, 12.5) + cap(mid(kL, aL, .3), aL, 12.5, 7.5)
      + cap(hipR, mid(hipR, kR, .55), 17, 16.5) + cap(mid(hipR, kR, .55), kR, 16.5, 12) + cap(kR, mid(kR, aR, .3), 11.5, 12.5) + cap(mid(kR, aR, .3), aR, 12.5, 7.5));
    el('a-shoes').setAttribute('d', cap(aL, [aL[0] - 14, 344], 9, 7) + cap(aR, [aR[0] + 14, 344], 9, 7));
    const wL = mid(shL, hipL, .62), wR = mid(shR, hipR, .62);
    el('a-torso').setAttribute('d', 'M' + shL + 'L' + shR + 'L' + [wR[0] - 8, wR[1]] + 'L' + hipR + 'L' + hipL + 'L' + [wL[0] + 8, wL[1]] + 'Z');
    el('a-shorts').setAttribute('d', 'M' + [hipL[0] - 6, 206] + 'L' + [hipR[0] + 6, 206] + 'L' + mid(hipR, kR, .32).map((v, i) => v + (i ? 0 : 8)) + 'L' + [180 - sw, 232] + 'L' + mid(hipL, kL, .32).map((v, i) => v - (i ? 0 : 8)) + 'Z');
    const cx = (shL[0] + shR[0]) / 2, hx = (hipL[0] + hipR[0]) / 2;
    el('a-lines').setAttribute('d', 'M' + [cx, 132] + 'L' + [hx, 196] + 'M' + [cx - 24, 146] + 'Q' + [cx - 10, 156] + ' ' + [cx, 148] + 'Q' + [cx + 10, 156] + ' ' + [cx + 24, 146] + 'M' + [cx - 11, 168] + 'h22M' + [(cx + hx) / 2 - 10, 182] + 'h20');
    el('a-head').setAttribute('d', cap(nk, hd, 10, 9) + cap(hd, [hd[0], hd[1] + 6], 19, 15.5) + cap(mid(shL, shR, .3), mid(shL, shR, .7), 15, 15));
    el('a-band').setAttribute('d', 'M' + [hd[0] - 18.5, hd[1] - 4] + 'Q' + [hd[0], hd[1] - 9] + ' ' + [hd[0] + 18.5, hd[1] - 4]);
    // Arms
    let hR, hL;
    if (M.two) { hR = [grip[0] + dir[0] * 9, grip[1] + dir[1] * 9]; hL = [grip[0] - dir[0] * 9, grip[1] - dir[1] * 9]; if (hL[0] > hR[0]) { const x = hL; hL = hR; hR = x; } }
    else if (M.pair) { hR = grip; hL = [360 - grip[0], grip[1]]; }
    else { hR = grip; hL = [158 - sw, 196 + dp * .4]; }
    const eR = elbow(shR, hR, 1), eL = elbow(shL, hL, -1);
    const arm = (S, E, H) => cap(S, mid(S, E, .5), 14.5, 13) + cap(mid(S, E, .5), E, 13, 9.5) + cap(E, mid(E, H, .3), 9.5, 10.5) + cap(mid(E, H, .3), H, 10.5, 7);
    el('a-arms').setAttribute('d', arm(shR, eR, hR) + arm(shL, eL, hL) + cap(shL, shL, 15.5, 15.5) + cap(shR, shR, 15.5, 15.5));
    el('a-armhi').setAttribute('d', cap(mid(shR, eR, .2), mid(shR, eR, .7), 2, 1.5) + cap(mid(shL, eL, .2), mid(shL, eL, .7), 2, 1.5));
    el('a-hands').setAttribute('d', cap(hR, hR, 8.5, 8.5) + cap(hL, hL, 8.5, 8.5));
    // The tool: a mace (handle + ball) or a club (tapered).
    const mk = (g, d2) => { const butt = [g[0] - d2[0] * (M.two ? 22 : 10), g[1] - d2[1] * (M.two ? 22 : 10)], tip = [g[0] + d2[0] * LEN, g[1] + d2[1] * LEN];
      return [tip, M.head ? '<path d="' + cap(butt, tip, 3.6, 3.6) + '" fill="url(#sl-steel)"/><circle cx="' + tip[0].toFixed(1) + '" cy="' + tip[1].toFixed(1) + '" r="' + M.head + '" fill="url(#sl-ball)"/><circle cx="' + butt[0].toFixed(1) + '" cy="' + butt[1].toFixed(1) + '" r="5" fill="#5E6368"/>'
        : '<path d="' + cap(butt, mid(g, tip, .35), 4.2, 5) + cap(mid(g, tip, .35), tip, 5, 11) + '" fill="url(#sl-steel)"/><circle cx="' + butt[0].toFixed(1) + '" cy="' + butt[1].toFixed(1) + '" r="6" fill="#5E6368"/>']; };
    const T1 = mk(grip, dir); const tip = T1[0]; let tool = T1[1]; if (M.pair) tool += mk([360 - grip[0], grip[1]], [-dir[0], dir[1]])[1];
    el('a-tool-back').innerHTML = back ? '<g opacity=".8">' + tool + '</g>' : ''; el('a-tool-front').innerHTML = back ? '' : tool;
    // Trail of the weight
    trail.unshift(tip.slice()); trail = trail.slice(0, 14);
    el('a-trail').innerHTML = trail.map((p, i) => i % 2 ? '' : '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + ((M.head || 9) * (1 - i / 16)).toFixed(1) + '" fill="#FF8A6B" opacity="' + (.34 * (1 - i / 14)).toFixed(2) + '"/>').join('');
    // Working muscles: chips light up, and the shoulders or core glow on the body.
    let glow = '';
    [...el('musc').children].forEach((li) => { const on = inRanges(M.musc[li.dataset.m], t); li.classList.toggle('on', on); if (on && li.dataset.m === 'Shoulders') glow += cap(shL, shL, 17, 17) + cap(shR, shR, 17, 17); if (on && (li.dataset.m === 'Core' || li.dataset.m === 'Obliques')) glow += cap([cx, 158], [hx, 194], 15, 13); if (on && li.dataset.m === 'Glutes') glow += cap(hipL, hipR, 14, 14); if (on && li.dataset.m === 'Lats') glow += cap([shL[0] + 6, 136], [wL[0] + 10, wL[1]], 9, 6) + cap([shR[0] - 6, 136], [wR[0] - 10, wR[1]], 9, 6); });
    el('a-glow').setAttribute('d', glow); el('a-glow').setAttribute('opacity', glow ? .55 : 0);
    // Cue and steps follow the phase
    let si = 0; M.steps.forEach((s, i) => { if (t >= s[0]) si = i; });
    if (si !== lastStep) { lastStep = si; el('cue').textContent = M.steps[si][2]; [...el('steps').children].forEach((li, i) => li.classList.toggle('on', i === si)); }
    if (back !== lastBack) { lastBack = back; if (SFX && touched) SFX.play('whoosh', { intensity: .28 }); }
    // Breathing: ring, label, chest and sound follow the phase.
    const br = M.breath(t); breathLvl += ((br === 'in' ? 1 : 0) - breathLvl) * .06;
    el('a-torso').setAttribute('stroke-width', (25 + breathLvl * 4).toFixed(1));
    el('b-ring').setAttribute('r', (13 + breathLvl * 11).toFixed(1));
    if (br !== breathNow) {
      breathNow = br; const bx = el('breath'); bx.dataset.b = br; el('b-word').textContent = br === 'in' ? 'Inhale' : 'Exhale'; el('b-how').textContent = br === 'in' ? 'through the nose' : 'through the mouth';
      if (SFX && touched && Date.now() - lastBreathAt > 450) { lastBreathAt = Date.now(); let k = 0; for (let i = 1; i <= 100; i++) { if (M.breath((t + i / 100) % 1) !== br) break; k = i; }
        const secs = dragging ? .7 : (k / 100) * M.period / 1000 / (tapBoost > 0 ? 2.3 : 1); SFX.play(br === 'in' ? 'inhale' : 'exhale', { dur: secs, intensity: .8 }); }
    }
    el('scrub').style.left = (t * 100).toFixed(1) + '%';
  }
  function rep(byUser) {
    reps += 1; if (!byUser) return; userReps += 1; el('repn').textContent = userReps; const r = el('reps'); r.classList.remove('tk'); void r.offsetWidth; r.classList.add('tk');
    if (SFX) SFX.play('rep', { intensity: .6 }); if (navigator.vibrate) navigator.vibrate(14);
    if (userReps >= 6 && !asked) { asked = true; setTimeout(() => { el('r-n').textContent = userReps; el('ready').classList.add('on'); setTimeout(() => el('ready').classList.add('armed'), 800); el('r-go').focus({ preventScroll: true }); if (SFX) SFX.play('pop'); }, 500); }
  }
  let last = 0;
  function frame(now) {
    const dt = Math.min(50, now - last || 16); last = now;
    if (!dragging) {
      const user = tapBoost > 0; const rate = (user ? 2.3 : 1) * speed; const nt = t + dt / M.period * rate;
      if (user) tapBoost -= dt / M.period * rate;
      if (nt >= 1) { rep(user || Date.now() - lastUser < 600); }
      t = nt % 1;
    }
    draw(); requestAnimationFrame(frame);
  }
  function setMove(i, byUser) {
    M = MOVES[i]; t = 0; trail = []; lastStep = -1; tapBoost = 0;
    [...el('tabs').children].forEach((b) => b.setAttribute('aria-pressed', b.dataset.id === M.id)); el('m-level').textContent = LVL[M.level]; el('m-level').dataset.l = M.level;
    el('m-kind').textContent = M.kind; el('m-name').textContent = M.name; el('m-desc').textContent = M.desc;
    el('musc').innerHTML = Object.keys(M.musc).map((m) => '<li data-m="' + m + '"><i></i>' + m + '</li>').join('');
    el('steps').innerHTML = M.steps.map((s) => '<li><span><b>' + s[1] + '.</b> ' + s[2] + '</span></li>').join('');
    // Dotted path of the weight for this move
    let d = ''; for (let k = 0; k <= 60; k++) { const tt = k / 60, a = M.ang(tt) * Math.PI / 180; const L2 = M.lenF ? M.lenF(tt) : M.len; d += (k ? 'L' : 'M') + (M.hx(tt) + Math.cos(a) * L2).toFixed(1) + ' ' + (M.hy(tt) + Math.sin(a) * L2).toFixed(1); }
    el('a-arc').setAttribute('d', d);
    // Breath timeline: teal where you breathe in, coral where you breathe out.
    let segs = ''; let st = 0, cur0 = M.breath(0); for (let k = 1; k <= 100; k++) { const b2 = k === 100 ? null : M.breath(k / 100); if (b2 !== cur0) { segs += '<i class="' + cur0 + '" style="left:' + st + '%;width:' + (k - st) + '%"><em>' + (k - st > 14 ? (cur0 === 'in' ? 'Inhale' : 'Exhale') : '') + '</em></i>'; st = k; cur0 = b2; } }
    el('btrack').innerHTML = segs + '<b id="sl-scrub"></b>'; breathNow = '';
    if (byUser && SFX) { SFX.unlock(); SFX.play('tick'); }
    draw();
  }
  function library() {
    let list = MOVES.filter((m) => fGrip === 'all' || m.grip === fGrip);
    const by = { easy: (x, y) => x.level - y.level || GORD[x.grip] - GORD[y.grip] || x.name.localeCompare(y.name), hard: (x, y) => y.level - x.level || GORD[x.grip] - GORD[y.grip] || x.name.localeCompare(y.name),
      az: (x, y) => x.name.localeCompare(y.name), grip: (x, y) => GORD[x.grip] - GORD[y.grip] || x.level - y.level || x.name.localeCompare(y.name) };
    list = list.slice().sort(by[fSort]);
    el('tabs').innerHTML = list.map((m) => '<button type="button" class="xl-tab" data-id="sl-' + m.id + '" aria-pressed="' + (m.id === M.id) + '"><small>' + m.kind + '</small>' + m.name + '<span class="xl-lv" data-l="' + m.level + '"><i></i><i></i><i></i>' + LVL[m.level] + '</span></button>').join('');
    el('lib-n').textContent = list.length + (list.length === 1 ? ' movement' : ' movements');
    el('grips').innerHTML = GRIPS.map(([id, name]) => '<button type="button" class="xl-gchip" data-g="' + id + '" aria-pressed="' + (id === fGrip) + '">' + name + ' <b>' + (id === 'all' ? MOVES.length : MOVES.filter((m) => m.grip === id).length) + '</b></button>').join('');
  }
  el('tabs').addEventListener('click', (e) => { const b = e.target.closest('.xl-tab'); if (b) setMove(MOVES.findIndex((m) => m.id === b.dataset.id), true); });
  el('grips').addEventListener('click', (e) => { const b = e.target.closest('.xl-gchip'); if (!b) return; fGrip = b.dataset.g; library(); if (SFX) { SFX.unlock(); SFX.play('tick'); } });
  el('sort').addEventListener('change', (e) => { fSort = e.target.value; library(); });
  // Drag to move the weight yourself; a tap (no drag) throws one quick rep.
  const stage = el('stage'); let moved = 0, downT = 0;
  stage.addEventListener('pointerdown', (e) => { if (e.target.closest('.xl-mute')) return; dragging = true; moved = 0; dragX = e.clientX; downT = t; stage.classList.add('drag'); stage.setPointerCapture(e.pointerId); touched = true; if (SFX) SFX.unlock(); });
  stage.addEventListener('pointermove', (e) => { if (!dragging) return; const dx = e.clientX - dragX; moved = Math.max(moved, Math.abs(dx)); if (moved < 6) return; const w = stage.getBoundingClientRect().width; let nt = downT + dx / (w * .9); if (nt >= 1) { rep(true); downT -= 1; nt -= 1; } if (nt < 0) { downT += 1; nt += 1; } t = nt; lastUser = Date.now(); });
  const up = () => { if (!dragging) return; dragging = false; stage.classList.remove('drag'); if (moved < 6) { tapBoost = 1 - t + .0001; lastUser = Date.now(); if (reduce) { t = M.steps[(lastStep + 1) % M.steps.length][0] + .02; if (lastStep === M.steps.length - 1) rep(true); draw(); } } };
  stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
  stage.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); touched = true; if (SFX) SFX.unlock(); tapBoost = 1 - t + .0001; lastUser = Date.now(); } if (e.key === 'ArrowRight') { t = (t + .04) % 1; lastUser = Date.now(); draw(); } if (e.key === 'ArrowLeft') { t = (t + .96) % 1; draw(); } });
  const mute = el('mute'); const pm = () => { const m = SFX ? SFX.isMuted() : true; mute.textContent = m ? '🔇' : '🔊'; mute.setAttribute('aria-pressed', m); mute.setAttribute('aria-label', m ? 'Sound off' : 'Sound on'); };
  mute.addEventListener('click', (e) => { e.stopPropagation(); if (!SFX) return; SFX.setMuted(!SFX.isMuted()); pm(); }); mute.addEventListener('pointerdown', (e) => e.stopPropagation()); pm();
  el('r-no').addEventListener('click', () => { el('ready').classList.remove('on', 'armed'); stage.focus({ preventScroll: true }); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') el('ready').classList.remove('on', 'armed'); });
  M = MOVES.find((m) => m.id === 'cast'); library(); setMove(MOVES.indexOf(M));
  if (!reduce) requestAnimationFrame(frame);
}
