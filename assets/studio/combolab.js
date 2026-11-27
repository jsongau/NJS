// Combo Lab (2026-11-24): a side-view fighter that throws boxing and kickboxing combinations one shot per
// tap. Poses are joint positions tweened between keyframes. /fitness/boxing shows hands only; /fitness/kickboxing
// starts with kicks included.
import { SFX } from './labsfx.js';

export function mountComboLab() {
  if (!document.getElementById('cl-stage')) return;
  const el = (id) => document.getElementById('cl-' + id);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // ---- poses: joint positions, orthodox stance, facing right ----
  const G = { hd: [152, 60], nk: [149, 84], sr: [130, 102], sl: [170, 100], er: [126, 142], hr: [160, 92], el: [184, 138], hl: [194, 96],
    pr: [136, 192], pl: [160, 192], kr: [122, 254], ar: [102, 310], tr: [124, 320], kl: [184, 250], al: [190, 312], tl: [214, 320] };
  const P = (o) => Object.assign({}, G, o);
  const POSE = {
    guard: G,
    jab: P({ hd: [158, 62], nk: [154, 85], sl: [184, 98], el: [224, 98], hl: [268, 95], sr: [128, 104], kl: [190, 250], hr: [162, 90] }),
    feint: P({ hd: [156, 62], sl: [178, 99], el: [206, 112], hl: [230, 98], kl: [188, 250] }),
    cross: P({ hd: [170, 66], nk: [164, 88], sr: [190, 100], er: [228, 99], hr: [270, 97], sl: [150, 104], el: [158, 140], hl: [172, 92], pr: [156, 192], pl: [152, 194], kr: [152, 256], ar: [114, 304], tr: [130, 320], kl: [190, 248] }),
    load3: P({ hd: [158, 64], sl: [178, 104], el: [198, 134], hl: [204, 106], sr: [126, 104], pl: [164, 192], kl: [190, 250] }),
    hook3: P({ hd: [152, 62], nk: [150, 85], sl: [164, 98], el: [214, 90], hl: [260, 99], sr: [144, 106], er: [140, 144], hr: [164, 94], pl: [150, 192], pr: [146, 194], kl: [176, 250], tl: [206, 322] }),
    hook4: P({ hd: [170, 66], nk: [164, 88], sr: [188, 100], er: [216, 88], hr: [262, 99], sl: [150, 104], el: [158, 140], hl: [172, 92], pr: [156, 192], pl: [152, 194], kr: [152, 256], ar: [114, 304], tr: [130, 320], kl: [190, 248] }),
    dip: P({ hd: [158, 82], nk: [154, 104], sr: [140, 122], sl: [176, 118], er: [150, 166], hr: [176, 150], el: [186, 154], hl: [196, 114], pr: [138, 206], pl: [160, 206], kr: [134, 262], kl: [192, 258] }),
    dipL: P({ hd: [160, 80], nk: [156, 102], sr: [134, 120], sl: [178, 118], er: [134, 158], hr: [164, 110], el: [190, 160], hl: [204, 146], pr: [138, 206], pl: [162, 206], kr: [134, 262], kl: [194, 258] }),
    upper5: P({ hd: [156, 58], nk: [153, 82], sl: [180, 100], el: [202, 130], hl: [226, 76], sr: [130, 104], pl: [162, 190], kl: [186, 248] }),
    upper6: P({ hd: [160, 56], nk: [156, 80], sr: [176, 98], er: [196, 128], hr: [216, 76], sl: [146, 100], el: [156, 138], hl: [168, 90], pr: [150, 190], pl: [154, 190], kr: [146, 252], ar: [112, 304], tr: [128, 320] }),
    bjab: P({ hd: [166, 92], nk: [160, 112], sl: [186, 128], el: [226, 132], hl: [270, 138], sr: [136, 132], er: [140, 168], hr: [168, 118], pr: [138, 208], pl: [162, 208], kr: [130, 264], kl: [196, 258] }),
    bcross: P({ hd: [176, 96], nk: [168, 116], sr: [192, 128], er: [230, 134], hr: [272, 140], sl: [156, 132], el: [166, 166], hl: [180, 120], pr: [158, 206], pl: [154, 208], kr: [154, 262], ar: [114, 304], tr: [130, 320], kl: [196, 256] }),
    slip: P({ hd: [172, 84], nk: [163, 104], sr: [138, 120], sl: [178, 114], er: [136, 156], hr: [168, 110], el: [192, 150], hl: [200, 110], pr: [138, 200], pl: [160, 200] }),
    roll: P({ hd: [168, 112], nk: [160, 130], sr: [138, 142], sl: [178, 138], er: [142, 178], hr: [172, 136], el: [194, 174], hl: [202, 134], pr: [136, 216], pl: [160, 216], kr: [128, 268], kl: [194, 264] }),
    pull: P({ hd: [130, 62], nk: [133, 86], sr: [118, 106], sl: [156, 100], er: [118, 146], hr: [146, 96], el: [170, 138], hl: [178, 96], pr: [134, 192], pl: [158, 192], kr: [118, 258] }),
    slipIn: P({ hd: [138, 78], nk: [138, 100], sr: [118, 116], sl: [158, 110], er: [116, 154], hr: [146, 104], el: [172, 146], hl: [180, 104], pr: [132, 198], pl: [156, 198], kr: [116, 258], kl: [182, 254] }),
    block: P({ hd: [152, 68], nk: [149, 90], sr: [132, 106], sl: [168, 104], er: [136, 134], hr: [152, 76], el: [182, 130], hl: [176, 74], pr: [136, 196], pl: [160, 196], kr: [124, 258], kl: [186, 254] }),
    parry: P({ hd: [150, 62], sr: [136, 102], er: [160, 126], hr: [196, 100], el: [184, 138], hl: [190, 92] }),
    chamber: P({ hd: [136, 64], nk: [136, 88], sr: [120, 108], sl: [156, 102], er: [112, 146], hr: [136, 106], el: [170, 138], hl: [176, 96], pr: [146, 190], pl: [150, 192], kr: [196, 178], ar: [176, 222], tr: [186, 240], kl: [160, 252], al: [158, 312], tl: [138, 320] }),
    kick: P({ hd: [116, 74], nk: [120, 96], sr: [106, 118], sl: [142, 106], er: [96, 150], hr: [84, 178], el: [158, 136], hl: [156, 94], pr: [150, 186], pl: [146, 192], kr: [208, 166], ar: [264, 150], tr: [286, 146], kl: [154, 252], al: [156, 312], tl: [134, 320] }),
    lowkick: P({ hd: [130, 68], nk: [132, 92], sr: [116, 112], sl: [152, 104], er: [104, 146], hr: [94, 172], el: [166, 136], hl: [162, 94], pr: [150, 188], pl: [146, 192], kr: [206, 214], ar: [260, 236], tr: [284, 234], kl: [154, 252], al: [156, 312], tl: [134, 320] }),
    teepC: P({ hd: [140, 62], nk: [140, 86], sr: [124, 106], sl: [160, 100], kl: [206, 190], al: [200, 244], tl: [220, 250], kr: [128, 254], ar: [118, 312], tr: [140, 320], pl: [158, 190] }),
    teep: P({ hd: [128, 66], nk: [130, 90], sr: [114, 110], sl: [150, 102], er: [110, 150], hr: [136, 110], el: [164, 140], hl: [166, 98], kl: [214, 188], al: [264, 180], tl: [284, 164], kr: [130, 254], ar: [120, 312], tr: [142, 320], pr: [140, 190], pl: [162, 188] }),
    knee: P({ hd: [140, 62], nk: [142, 86], sr: [128, 104], sl: [164, 100], er: [158, 128], hr: [196, 138], el: [190, 122], hl: [206, 132], pr: [150, 190], pl: [148, 194], kr: [214, 176], ar: [198, 232], tr: [206, 250], kl: [156, 254], al: [154, 312], tl: [136, 320] }),
  };
  // Close-range Muay Thai poses step the whole body in toward the bag.
  const shift = (p, dx) => { const o = {}; Object.keys(p).forEach((k) => { o[k] = [p[k][0] + dx, p[k][1]]; }); return o; };
  Object.assign(POSE, {
    knee: shift(POSE.knee, 52),
    elbowL: shift(P({ hd: [156, 62], nk: [152, 85], sl: [176, 98], el: [216, 94], hl: [192, 82], sr: [134, 104], hr: [158, 90], pl: [154, 192], pr: [142, 194], kl: [182, 250] }), 56),
    elbowR: shift(P({ hd: [168, 66], nk: [163, 88], sr: [184, 100], er: [224, 94], hr: [200, 84], sl: [150, 104], el: [158, 140], hl: [170, 90], pr: [156, 192], pl: [152, 194], kr: [152, 256], ar: [114, 304], tr: [130, 320], kl: [190, 248] }), 54),
    elbowUp: shift(P({ hd: [162, 58], nk: [157, 81], sr: [178, 100], er: [212, 70], hr: [190, 92], sl: [146, 102], el: [156, 138], hl: [168, 90], pr: [150, 190], pl: [154, 190], kr: [146, 252], ar: [112, 304], tr: [128, 320] }), 56),
    clinch: shift(P({ hd: [160, 64], nk: [156, 87], sl: [176, 100], el: [208, 110], hl: [238, 84], sr: [146, 104], er: [196, 118], hr: [234, 92], pl: [160, 192], pr: [140, 192], kl: [188, 250] }), 44),
    kneeC: shift(P({ hd: [146, 64], nk: [146, 88], sr: [132, 106], sl: [166, 102], er: [170, 124], hr: [206, 112], el: [196, 118], hl: [214, 106], pr: [150, 190], pl: [148, 194], kr: [218, 170], ar: [202, 228], tr: [210, 246], kl: [156, 254], al: [154, 312], tl: [136, 320] }), 52),
    check: P({ hd: [146, 60], nk: [145, 84], sr: [128, 102], sl: [166, 100], hl: [190, 96], kl: [198, 196], al: [190, 252], tl: [208, 262], kr: [126, 254], ar: [116, 312], tr: [138, 320], pr: [136, 190], pl: [160, 188] }),
    switchK: P({ hd: [120, 72], nk: [124, 95], sr: [108, 116], sl: [146, 106], er: [112, 152], hr: [138, 104], el: [164, 140], hl: [178, 168], pr: [140, 190], pl: [152, 186], kl: [210, 168], al: [264, 152], tl: [286, 148], kr: [140, 254], ar: [138, 312], tr: [118, 320] }),
  });
  const KEYS = Object.keys(G);
  // ---- the shots: [pose, ms, ease, hit kind] steps, plus label, cue and sound ----
  const SHOT = {
    '1': { n: '1', s: 'Jab', st: [['jab', 95, 'snap', 'head'], ['guard', 210, 'out']], cue: 'Jab. Snap it out and straight back to your chin.', sfx: 'jab' },
    '2': { n: '2', s: 'Cross', st: [['cross', 130, 'snap', 'head'], ['guard', 260, 'out']], cue: 'Cross. Back foot pivots, hip and shoulder turn through.', sfx: 'cross' },
    '3': { n: '3', s: 'Hook', st: [['load3', 110, 'io'], ['hook3', 120, 'snap', 'head'], ['guard', 250, 'out']], cue: 'Lead hook. Elbow up, turn on the front foot.', sfx: 'cross' },
    '4': { n: '4', s: 'Hook', st: [['hook4', 140, 'snap', 'head'], ['guard', 270, 'out']], cue: 'Rear hook. Whole right side turns into it.', sfx: 'cross' },
    '5': { n: '5', s: 'Upper', st: [['dipL', 130, 'io'], ['upper5', 115, 'snap', 'upper'], ['guard', 260, 'out']], cue: 'Lead uppercut. Dip, then drive up from the legs.', sfx: 'upper' },
    '6': { n: '6', s: 'Upper', st: [['dip', 140, 'io'], ['upper6', 120, 'snap', 'upper'], ['guard', 280, 'out']], cue: 'Rear uppercut. It starts in your legs, not your arm.', sfx: 'upper' },
    '1b': { n: '1', s: 'Body', st: [['bjab', 130, 'snap', 'body'], ['guard', 260, 'out']], cue: 'Jab to the body. Bend your knees, don\'t bow.', sfx: 'jab' },
    '2b': { n: '2', s: 'Body', st: [['bcross', 150, 'snap', 'body'], ['guard', 290, 'out']], cue: 'Cross to the body. Change level first, then throw.', sfx: 'cross' },
    F: { n: 'F', s: 'Feint', st: [['feint', 90, 'out'], ['guard', 130, 'io']], cue: 'Feint. Show the jab, don\'t throw it.', sfx: 'whoosh' },
    S: { n: 'S', s: 'Slip out', def: 92, st: [['slip', 140, 'out'], ['guard', 180, 'io']], cue: 'Slip. Head off the center line, eyes up.', sfx: 'whoosh' },
    R: { n: 'R', s: 'Roll', def: 88, st: [['roll', 170, 'io'], ['guard', 200, 'io']], cue: 'Roll under. Bend your legs, come up on the other side.', sfx: 'whoosh' },
    Si: { n: 'S', s: 'Slip in', def: 96, st: [['slipIn', 140, 'out'], ['guard', 180, 'io']], cue: 'Slip inside. Weight to the back leg, their shot passes your lead shoulder.', sfx: 'whoosh' },
    B: { n: 'B', s: 'Block', def: 84, hitMe: true, st: [['block', 110, 'out'], ['block', 120, 'io'], ['guard', 150, 'io']], cue: 'Block. Gloves tight to your temples, elbows in, chin down. Take it on the gloves.', sfx: 'knee' },
    Pa: { n: 'Pa', s: 'Parry', def: 98, hitMe: true, st: [['parry', 100, 'snap'], ['guard', 140, 'io']], cue: 'Parry. A small pat with the rear glove, just enough to steer their jab past you.', sfx: 'jab' },
    P: { n: 'P', s: 'Pull', def: 96, st: [['pull', 130, 'out'], ['guard', 160, 'io']], cue: 'Pull. Lean back just out of range, weight on the back foot.', sfx: 'whoosh' },
    T: { n: 'T', s: 'Teep', st: [['teepC', 150, 'io'], ['teep', 120, 'snap', 'kick'], ['teepC', 140, 'out'], ['guard', 220, 'io']], cue: 'Teep. Knee up, push through with the ball of the foot.', sfx: 'kick' },
    RK: { n: 'RK', s: 'Kick', st: [['chamber', 180, 'io'], ['kick', 130, 'snap', 'kick'], ['chamber', 160, 'out'], ['guard', 250, 'io']], cue: 'Rear roundhouse. Pivot the standing foot, swing the hip through.', sfx: 'kick' },
    LK: { n: 'LK', s: 'Low', st: [['chamber', 150, 'io'], ['lowkick', 130, 'snap', 'low'], ['guard', 300, 'io']], cue: 'Low kick. Step out, chop down through the thigh.', sfx: 'kick' },
    SK: { n: 'SK', s: 'Switch', st: [['check', 130, 'io'], ['switchK', 130, 'snap', 'kick'], ['check', 150, 'out'], ['guard', 240, 'io']], cue: 'Switch kick. Quick switch of the feet, then the lead leg whips through.', sfx: 'kick' },
    EL: { n: 'E', s: 'Elbow', st: [['load3', 100, 'io'], ['elbowL', 120, 'snap', 'elbow'], ['guard', 280, 'out']], cue: 'Lead elbow. Step in, fold the arm, cut across with the point.', sfx: 'cross' },
    ER: { n: 'E', s: 'Elbow', st: [['elbowR', 140, 'snap', 'elbow'], ['guard', 300, 'out']], cue: 'Rear elbow. Same turn as a cross, but you finish close.', sfx: 'cross' },
    EU: { n: 'E', s: 'Up', st: [['dip', 130, 'io'], ['elbowUp', 120, 'snap', 'upel'], ['guard', 300, 'out']], cue: 'Up elbow. Drive it straight up the middle, hand brushing past your ear.', sfx: 'upper' },
    CL: { n: 'CL', s: 'Clinch', st: [['clinch', 180, 'out'], ['clinch', 90, 'io']], cue: 'Clinch. Both hands behind the head, elbows tight, pull them onto you.', sfx: 'rep' },
    CK: { n: 'Kn', s: 'Knee', st: [['clinch', 90, 'io'], ['kneeC', 150, 'snap', 'kneeC'], ['clinch', 170, 'out']], cue: 'Clinch knee. Pull the head down as your hips drive the knee up.', sfx: 'knee' },
    CH: { n: 'CH', s: 'Check', def: 236, hitMe: true, st: [['check', 120, 'out'], ['check', 110, 'io'], ['guard', 160, 'io']], cue: 'Check. Lift the lead leg and take the kick on your shin.', sfx: 'knee' },
    KN: { n: 'Kn', s: 'Knee', st: [['knee', 170, 'snap', 'knee'], ['guard', 290, 'out']], cue: 'Knee. Pull down with your hands, drive the hips in.', sfx: 'knee' },
  };
  // ---- the library: [id, type, level 1-3, name, shots, why it works] ----
  const C = [
    ['j', 'basic', 1, 'The jab', '1', 'It finds your range, keeps them busy and hides everything that follows. Most combinations start here.'],
    ['jj', 'basic', 1, 'Double jab', '1 1', 'The first jab measures the distance. The second one lands while they are still reacting to the first.'],
    ['12', 'basic', 1, 'Jab, cross', '1 2', 'The jab lines them up and covers their eyes. The cross follows straight down the same line with your body weight behind it.'],
    ['112', 'basic', 1, 'Double jab, cross', '1 1 2', 'Two jabs close the distance and get the guard moving. The cross arrives when their hands are out of place.'],
    ['123', 'basic', 1, 'Jab, cross, hook', '1 2 3', 'Two straight shots pull the guard to the middle. The hook comes around the outside, where the hands just left.'],
    ['1232', 'punch', 2, 'Jab, cross, hook, cross', '1 2 3 2', 'The hook turns your hips one way and loads the cross the other way. Each shot winds up the next.'],
    ['232', 'punch', 2, 'Cross, hook, cross', '2 3 2', 'Leads with power. Useful when they expect a jab first, and your weight rocks side to side with no wasted reset.'],
    ['1632', 'punch', 2, 'Jab, rear uppercut, hook, cross', '1 6 3 2', 'The jab lifts their guard high and tight. The uppercut comes up the middle underneath it, then the hook and cross finish.'],
    ['1252', 'punch', 2, 'Jab, cross, lead uppercut, cross', '1 2 5 2', 'After the straight shots they shell up behind their gloves. The lead uppercut splits the guard and stands them up for the cross.'],
    ['1234', 'punch', 2, 'Jab, cross, hook, rear hook', '1 2 3 4', 'Straight down the middle, then around both sides. It teaches you to keep turning your hips through four shots.'],
    ['5632', 'punch', 3, 'Uppercut, uppercut, hook, cross', '5 6 3 2', 'Close-range work. Two uppercuts lift the chin, then the hook and cross land on a head that is already up.'],
    ['1b2', 'setup', 2, 'Jab the body, cross upstairs', '1b 2', 'A jab to the body pulls their elbows down and their eyes with it. The cross goes over the top of the lowered guard.'],
    ['11b2', 'setup', 2, 'High, low, high', '1 1b 2', 'Head, body, head. Changing the level every shot keeps the guard guessing a beat behind you.'],
    ['12b3', 'setup', 3, 'Cross the body, hook upstairs', '1 2b 3', 'The body cross folds them forward and drops their hands. Your lead hook is already loaded as you come back up.'],
    ['f2', 'setup', 2, 'Feint, cross', 'F 2', 'Show the jab without throwing it. When they reach to block or parry, the cross lands in the gap they opened.'],
    ['114', 'setup', 3, 'Double jab, rear hook', '1 1 4', 'Two straight shots teach them to guard the center. The rear hook swings around the side they stopped watching.'],
    ['1s2', 'evade', 2, 'Jab, slip, cross', '1 S 2', 'Your jab draws their jab back. Slip it, and your cross lands while their arm is still out.'],
    ['s23', 'evade', 2, 'Slip, cross, hook', 'S 2 3', 'Slipping loads your weight onto one side, like a spring. The cross and hook release it.'],
    ['p2', 'evade', 2, 'Pull, cross', 'P 2', 'Lean just out of reach so their shot falls short, then fire the cross as they are stretched out.'],
    ['12r32', 'evade', 3, 'Jab, cross, roll, hook, cross', '1 2 R 3 2', 'You throw, they swing back, you roll under it. You come up on their open side with the hook already loaded.'],
    ['s2', 'evade', 1, 'Slip outside, cross', 'S 2', 'The simplest counter in boxing. Their jab goes over your shoulder and your cross travels the short way to their chin.'],
    ['si3', 'evade', 2, 'Slip inside, lead hook', 'Si 3', 'Slipping inside puts your weight on the back leg and winds up the lead side. The hook comes back around their extended arm.'],
    ['ssi23', 'evade', 3, 'Slip, slip, cross, hook', 'S Si 2 3', 'They throw a one-two, you slip both. Now both of their hands are out and neither is guarding.'],
    ['r32', 'evade', 2, 'Roll, hook, cross', 'R 3 2', 'Roll under a wide hook and you come up outside their arm, on the side they cannot see, with the hook loaded.'],
    ['s63', 'evade', 3, 'Slip, rear uppercut, hook', 'S 6 3', 'A deep slip outside drops your rear shoulder. The uppercut rises from exactly where the slip left you.'],
    ['pa1', 'guard', 1, 'Parry, jab', 'Pa 1', 'Pat their jab down with your rear glove and send yours back along the same line while their hand is still out.'],
    ['pa2', 'guard', 2, 'Parry, cross', 'Pa 2', 'The parry turns their jab aside and opens the center. The same hand that parried fires the cross.'],
    ['1pa2', 'guard', 2, 'Jab, parry, cross', '1 Pa 2', 'Your jab invites their jab back. Parry it and the cross lands before they recover.'],
    ['b32', 'guard', 2, 'Block, hook, cross', 'B 3 2', 'Take the shot on your gloves, then answer straight away. They are closest and most open in the instant after they punch.'],
    ['b23', 'guard', 2, 'Block, cross, hook', 'B 2 3', 'Catch their cross on a tight guard and return yours down the middle, then hook around the hands they pull back.'],
    ['bb632', 'guard', 3, 'Block, block, uppercut, hook, cross', 'B B 6 3 2', 'Cover up through a flurry, then come up the middle with the uppercut when they pause to breathe.'],
    ['12k', 'kick', 2, 'Jab, cross, rear kick', '1 2 RK', 'Punches bring their hands up to the head. The cross has already turned your hips, so the kick follows the same rotation into the body.'],
    ['1lk', 'kick', 2, 'Jab, low kick', '1 LK', 'The jab makes them plant their front foot to block. A planted leg cannot check the kick.'],
    ['123lk', 'kick', 3, 'Jab, cross, hook, low kick', '1 2 3 LK', 'The lead hook shifts their weight onto the front leg and turns your hips. The low kick lands on a leg that cannot lift.'],
    ['t23', 'kick', 2, 'Teep, cross, hook', 'T 2 3', 'The teep stops them and folds them forward at the waist. Their head comes to you, right into the cross.'],
    ['12kn', 'kick', 2, 'Jab, cross, knee', '1 2 KN', 'The punches close the distance until you are too near to kick. The knee is the weapon for that range.'],
    ['23k', 'kick', 3, 'Cross, hook, rear kick', '2 3 RK', 'The hook winds your hips all the way to one side. The rear kick unwinds them with everything behind it.'],
    ['mt-t', 'mt', 1, 'The teep', 'T', 'The jab of Muay Thai. It keeps them at the end of your leg, breaks their rhythm and sets up everything else.'],
    ['mt-rk', 'mt', 1, 'Rear roundhouse', 'RK', 'The main weapon. The standing foot pivots, the hip turns over and the shin lands, not the foot.'],
    ['mt-sk', 'mt', 2, 'Switch kick', 'SK', 'A quick switch of the feet loads the lead leg so it can kick with rear-leg power from the side they are not guarding.'],
    ['mt-kn', 'mt', 1, 'Straight knee', 'KN', 'When they walk onto you, the knee meets them. Hips forward, shoulders back.'],
    ['mt-12k', 'mt', 1, 'Jab, cross, rear kick', '1 2 RK', 'Hands bring their guard up high. The cross has already turned your hips, so the kick follows into the open body.'],
    ['mt-1t', 'mt', 1, 'Jab, teep', '1 T', 'The jab hides the knee lifting. The teep pushes them back to where your kick lands best.'],
    ['el-1e', 'elbow', 2, 'Jab, rear elbow', '1 ER', 'The jab closes the distance. A cross would be jammed at that range, so the elbow takes its place.'],
    ['el-ee', 'elbow', 2, 'Lead elbow, rear elbow', 'EL ER', 'Left side, right side. The first elbow turns their head, the second meets it coming back.'],
    ['el-12e', 'elbow', 2, 'Jab, cross, lead elbow', '1 2 EL', 'The cross carries you inside punching range. The lead elbow is already loaded as your weight comes back.'],
    ['el-3u', 'elbow', 3, 'Hook, up elbow', '3 EU', 'The hook pulls their guard out wide. The up elbow splits it straight up the middle.'],
    ['el-2ee', 'elbow', 3, 'Cross, elbow, elbow', '2 EL ER', 'Three shots as you walk them down. Each one is shorter than the last, so there is no room to answer.'],
    ['cl-k', 'clinch', 1, 'Clinch, knee', 'CL CK', 'Control the head and the body follows. Pull down as the knee comes up, so they meet in the middle.'],
    ['cl-kk', 'clinch', 2, 'Clinch, knee, knee', 'CL CK CK', 'The first knee folds them forward. That brings the target lower and closer for the second.'],
    ['cl-12k', 'clinch', 2, 'Jab, cross, clinch, knee', '1 2 CL CK', 'They cover up from the punches. Hands that are covering cannot stop you taking the head.'],
    ['cl-ke', 'clinch', 3, 'Clinch, knee, rear elbow', 'CL CK ER', 'The knee makes them push away. The elbow lands in the gap they open as they leave.'],
    ['cl-tk', 'clinch', 2, 'Teep, knee', 'T KN', 'The teep folds them at the waist and brings them back toward you. The knee is waiting.'],
    ['ms-trk', 'mtset', 2, 'Teep, rear kick', 'T RK', 'The teep stops them and squares their hips. The kick lands while they are still resetting their feet.'],
    ['ms-lk2', 'mtset', 2, 'Low kick, cross', 'LK 2', 'A low kick drags their eyes and hands down. The cross goes over the top.'],
    ['ms-12sk', 'mtset', 2, 'Jab, cross, switch kick', '1 2 SK', 'Two punches from one side, then a kick from the other. They are still turned toward your right hand.'],
    ['ms-23lk', 'mtset', 3, 'Cross, hook, low kick', '2 3 LK', 'The hook loads their weight onto the front leg and winds up your hips. The low kick lands on a leg that cannot lift.'],
    ['ms-1kn', 'mtset', 2, 'Jab, knee', '1 KN', 'The jab lifts their guard and covers your step in. The knee goes underneath it.'],
    ['md-chrk', 'mtdef', 2, 'Check, rear kick', 'CH RK', 'Block their kick on your shin and send yours back before their foot has landed.'],
    ['md-ch2', 'mtdef', 2, 'Check, cross', 'CH 2', 'After a checked kick they are on one leg and square. Put your foot down and the cross is right there.'],
    ['md-prk', 'mtdef', 2, 'Lean back, rear kick', 'P RK', 'Sway just out of reach. Their miss turns them side-on and leaves the ribs open for your kick.'],
    ['md-be', 'mtdef', 3, 'Block, rear elbow', 'B ER', 'Cover up and stay close. Anyone near enough to punch you is near enough to elbow.'],
    ['md-palk', 'mtdef', 2, 'Parry, low kick', 'Pa LK', 'Their jab puts their weight on the front leg. Parry it and kick that leg while it is planted.'],
  ].map(([id, type, level, name, seq, why]) => ({ id, type, level, name, seq: seq.split(' '), why }));
  const TYPES = [['all', 'All'], ['basic', 'Basics'], ['punch', 'Punch combos'], ['setup', 'Setups'], ['evade', 'Slips and rolls'], ['guard', 'Blocks and parries'], ['kick', 'Punch and kick'], ['mt', 'Basics'], ['elbow', 'Elbows'], ['clinch', 'Knees and clinch'], ['mtset', 'Setups'], ['mtdef', 'Defense to counter']];
  const MODE_TYPES = { box: ['basic', 'punch', 'setup', 'evade', 'guard'], kick: ['basic', 'punch', 'setup', 'evade', 'guard', 'kick'], muay: ['mt', 'elbow', 'clinch', 'mtset', 'mtdef'] };
  const MODE_FIRST = { box: '12', kick: '12', muay: 'mt-12k' };
  const TNAME = Object.fromEntries(TYPES); const TORD = { basic: 0, punch: 1, setup: 2, evade: 3, guard: 4, kick: 5, mt: 0, elbow: 1, clinch: 2, mtset: 3, mtdef: 4 }; const LVL = ['', 'Foundation', 'Build', 'Advanced'];

  // ---- drawing ----
  const cap = (a, b, r1, r2) => { const dx = b[0] - a[0], dy = b[1] - a[1]; const L = Math.hypot(dx, dy) || 1; const nx = -dy / L, ny = dx / L;
    const c = (p, r) => 'M' + (p[0] - r).toFixed(1) + ' ' + p[1].toFixed(1) + 'a' + r + ' ' + r + ' 0 1 0 ' + 2 * r + ' 0a' + r + ' ' + r + ' 0 1 0 ' + -2 * r + ' 0Z';
    return 'M' + (a[0] + nx * r1).toFixed(1) + ' ' + (a[1] + ny * r1).toFixed(1) + 'L' + (b[0] + nx * r2).toFixed(1) + ' ' + (b[1] + ny * r2).toFixed(1) + 'L' + (b[0] - nx * r2).toFixed(1) + ' ' + (b[1] - ny * r2).toFixed(1) + 'L' + (a[0] - nx * r1).toFixed(1) + ' ' + (a[1] - ny * r1).toFixed(1) + 'Z' + c(a, r1) + c(b, r2); };
  const mid = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  let cur = JSON.parse(JSON.stringify(G)), bagA = 0, bagV = 0, breathLvl = 0;
  const trail = [0, 1, 2].map(() => ({ last: [0, 0], ghost: [] }));
  function draw(p) {
    el('f-far').setAttribute('d', cap(p.sr, p.er, 12, 9.5) + cap(p.er, p.hr, 9.5, 7.5) + cap(p.pr, mid(p.pr, p.kr, .5), 18, 16) + cap(mid(p.pr, p.kr, .5), p.kr, 16, 12) + cap(p.kr, p.ar, 12.5, 7.5));
    el('f-fshoe').setAttribute('d', cap(mid(p.kr, p.ar, .82), p.ar, 8, 8.5) + cap(p.ar, p.tr, 8.5, 6));
    const wl = mid(p.sl, p.pl, .62), wr = mid(p.sr, p.pr, .62), cx = (wl[0] + wr[0]) / 2;
    el('f-torso').setAttribute('d', 'M' + p.sr + 'L' + p.sl + 'L' + [wl[0] + (cx - wl[0]) * .22, wl[1]] + 'L' + p.pl + 'L' + p.pr + 'L' + [wr[0] + (cx - wr[0]) * .22, wr[1]] + 'Z');
    el('f-torso').setAttribute('stroke-width', (29 + breathLvl * 3).toFixed(1));
    { const top = mid(p.sr, p.sl, .62), bot = mid(p.pr, p.pl, .6), m1 = mid(top, bot, .3), m2 = mid(top, bot, .55), m3 = mid(top, bot, .75), fw = p.sl[0] >= p.sr[0] ? 1 : -1;
      el('f-lines').setAttribute('d', 'M' + mid(top, bot, .12) + 'L' + mid(top, bot, .86) + 'M' + [m1[0] - 14 * fw, m1[1] + 1] + 'Q' + [m1[0], m1[1] + 7] + ' ' + [m1[0] + 15 * fw, m1[1] - 2] + 'M' + [m2[0] - 9 * fw, m2[1]] + 'L' + [m2[0] + 10 * fw, m2[1]] + 'M' + [m3[0] - 8 * fw, m3[1]] + 'L' + [m3[0] + 9 * fw, m3[1]]); }
    const h = p.hd, up = [h[0] - p.nk[0], h[1] - p.nk[1]], UL = Math.hypot(up[0], up[1]) || 1, ux = up[0] / UL, uy = up[1] / UL, fx = -uy, fy = ux, at = (f, u) => [h[0] + fx * f + ux * u, h[1] + fy * f + uy * u];
    el('f-head').setAttribute('d', cap(p.nk, h, 10, 9) + cap(h, at(7, -9), 18.5, 11) + cap(mid(p.sr, p.sl, .5), p.nk, 15, 10) + cap(at(15, 3), at(21, -1), 4.2, 3));
    el('f-band').setAttribute('d', 'M' + at(-17, 5) + 'Q' + at(0, 9) + ' ' + at(17.5, 6));
    el('f-shorts').setAttribute('d', 'M' + p.pr + 'L' + p.pl + 'Z' + cap(p.pr, mid(p.pr, p.kr, .44), 13, 11.5) + cap(p.pl, mid(p.pl, p.kl, .44), 13, 11.5));
    const calfB = mid(p.kl, p.al, .3), quadB = mid(p.pl, p.kl, .55), biB = mid(p.sl, p.el, .5), foB = mid(p.el, p.hl, .3);
    el('f-near').setAttribute('d', cap(mid(p.pl, p.kl, .42), quadB, 16.5, 16) + cap(quadB, p.kl, 16, 12) + cap(p.kl, calfB, 11.5, 12.5) + cap(calfB, p.al, 12.5, 7) + cap(p.sl, biB, 14.5, 12.5) + cap(biB, p.el, 12.5, 9.5) + cap(p.el, foB, 9.5, 10.5) + cap(foB, p.hl, 10.5, 7.5) + cap(mid(p.sl, p.sr, .12), p.sl, 13, 15.5));
    const hi = (a, b, r) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; let nx = -dy / L, ny = dx / L; if (ny > 0) { nx = -nx; ny = -ny; } const o1 = [a[0] + nx * r * .5, a[1] + ny * r * .5], o2 = [b[0] + nx * r * .5, b[1] + ny * r * .5]; return cap(mid(o1, o2, .2), mid(o1, o2, .75), 1.6, 1.2); };
    el('f-hi').setAttribute('d', hi(p.sl, p.el, 13) + hi(p.el, p.hl, 9.5) + hi(mid(p.pl, p.kl, .45), p.kl, 15) + hi(p.kl, p.al, 11));
    el('f-shoe').setAttribute('d', cap(mid(p.kl, p.al, .82), p.al, 8.5, 9) + cap(p.al, p.tl, 9, 6.5));
    const glove = (hh, e2) => { const d = [hh[0] - e2[0], hh[1] - e2[1]], L = Math.hypot(d[0], d[1]) || 1, tt = [hh[0] + d[0] / L * 6, hh[1] + d[1] / L * 6]; return cap(hh, tt, 13, 14.5) + cap(mid(e2, hh, .78), hh, 9.5, 11); };
    el('f-gr').setAttribute('d', glove(p.hr, p.er)); el('f-gl').setAttribute('d', glove(p.hl, p.el));
    el('f-bag').setAttribute('transform', 'rotate(' + bagA.toFixed(2) + ' 316 0)');
    el('f-shadow').setAttribute('cx', ((p.pr[0] + p.pl[0]) / 2).toFixed(1));
    el('b-ring').setAttribute('r', (13 + breathLvl * 11).toFixed(1));
  }
  // ---- animation engine ----
  const ease = { out: (t) => 1 - Math.pow(1 - t, 3), io: (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), snap: (t) => 1 - Math.pow(1 - t, 5) };
  let queue = [], seg = null, last = 0, M = C[2], idx = 0, done = 0, asked = false, touched = false, userAt = 0, autoT = 0, fType = 'all', fSort = 'easy', mode = 'box', breathing = 'in', frozen = false;
  function frame(now) {
    const dt = Math.min(50, now - last || 16); last = now;
    if (!seg && queue.length) { const s = queue.shift(); if (s.begin) s.begin(); seg = { from: JSON.parse(JSON.stringify(cur)), to: POSE[s.pose], dur: s.dur, e: ease[s.ease || 'io'], hit: s.hit, end: s.end, last: s.last, t: 0 }; }
    if (hitStop > 0) { hitStop -= dt; } else
    if (seg) { seg.t += dt; const u = Math.min(1, seg.t / seg.dur), k = seg.e(u); KEYS.forEach((key) => { cur[key] = [seg.from[key][0] + (seg.to[key][0] - seg.from[key][0]) * k, seg.from[key][1] + (seg.to[key][1] - seg.from[key][1]) * k]; });
      if (u >= 1) { if (seg.hit) impact(seg.hit, seg.last); const e2 = seg.end; seg = null; if (e2) e2(); if (!queue.length) idle(); } }
    const pts = [cur.hl, cur.hr, cur.tr]; trail.forEach((tr0, i) => { const d = Math.hypot(pts[i][0] - tr0.last[0], pts[i][1] - tr0.last[1]); if (d > 7) tr0.ghost.unshift({ p: tr0.last.slice(), a: Math.min(.45, d / 40) }); tr0.ghost.forEach((g) => { g.a *= .78; }); tr0.ghost = tr0.ghost.filter((g) => g.a > .03).slice(0, 5); tr0.last = pts[i].slice(); });
    el('f-trail').innerHTML = trail.map((tr0, i) => tr0.ghost.map((g) => '<circle cx="' + g.p[0].toFixed(1) + '" cy="' + g.p[1].toFixed(1) + '" r="' + (i === 2 ? 8 : 13) + '" fill="#FF8A6B" opacity="' + g.a.toFixed(2) + '"/>').join('')).join('');
    ink = ink.filter((d) => d.life > 0); if (hitStop <= 0) ink.forEach((d) => { d.x += d.vx; d.y += d.vy; d.vy += .45; d.vx *= .96; d.life -= .035; });
    el('fx-ink').innerHTML = ink.map((d) => '<circle cx="' + d.x.toFixed(1) + '" cy="' + d.y.toFixed(1) + '" r="' + Math.max(0, d.r * Math.min(1, d.life * 1.6)).toFixed(1) + '" fill="' + d.c + '" opacity="' + Math.max(0, Math.min(1, d.life * 2)).toFixed(2) + '"/>').join('');
    if (hitStop <= 0) { bagV += (-bagA * 0.02 - bagV * 0.045) * (dt / 16); bagA += bagV * (dt / 16); }
    breathLvl += ((breathing === 'in' ? 1 : 0) - breathLvl) * .08;
    draw(cur); requestAnimationFrame(frame);
  }
  const HIT = { head: [288, 96, -.9], body: [288, 138, -.9], upper: [240, 78, -.5], kick: [288, 150, -1.6], low: [286, 236, -1.1], knee: [288, 180, -1.2], elbow: [288, 94, -1.1], upel: [286, 72, -.9], kneeC: [288, 176, -1.4] };
  const HEAVY = { kick: 1, low: 1, knee: 1, elbow: 1, upel: 1, kneeC: 1, upper: 1 };
  let hitStop = 0, ink = [], chain = 0, chainT = 0;
  function impact(kind, lastOne) { const [x, y, v] = HIT[kind]; bagV += v * (lastOne ? 1.4 : 1);
    // Fighting-game feel: a short freeze on contact, an ink splash, speed lines, and a hit counter.
    const heavy = HEAVY[kind] || lastOne; hitStop = lastOne ? 150 : heavy ? 90 : 45;
    const cols = ['#FF8A6B', '#7FD3C8', '#121416', '#FFD166'];
    for (let i = 0; i < (heavy ? 12 : 6); i++) { const a = Math.PI * (.55 + Math.random() * .9), sp = 2 + Math.random() * (heavy ? 9 : 5); ink.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.5, r: 3 + Math.random() * (heavy ? 9 : 5), c: cols[i % cols.length], life: 1 }); }
    const ln = el('fx-lines'); ln.setAttribute('transform', 'translate(' + x + ' ' + y + ')'); ln.classList.remove('go'); void ln.getBoundingClientRect(); ln.classList.add('go');
    if (heavy) { const fl = el('fx-flash'); fl.classList.remove('go'); void fl.getBoundingClientRect(); fl.classList.add('go'); }
    chain += 1; clearTimeout(chainT); chainT = setTimeout(() => { chain = 0; el('hits').classList.remove('on'); }, 1500);
    const hb = el('hits'); el('hitn').textContent = chain; el('hitw').textContent = chain === 1 ? 'hit' : 'hits'; hb.classList.remove('on', 'big'); void hb.offsetWidth; hb.classList.add('on'); if (lastOne && chain > 1) hb.classList.add('big');
    const stg = el('stage'); stg.classList.remove('quake', 'quake2'); void stg.offsetWidth; stg.classList.add(heavy ? 'quake2' : 'quake'); const sp = el('fx-spark'); sp.setAttribute('transform', 'translate(' + x + ' ' + y + ')'); sp.classList.remove('go'); void sp.getBoundingClientRect(); sp.classList.add('go'); const f = el('fig'); f.classList.remove('shake'); void f.getBoundingClientRect(); f.classList.add('shake'); }
  // A defense needs something to defend: a ghost glove comes in from the bag side.
  function incoming(y, lands) { const g = el('fx-in'); g.setAttribute('transform', 'translate(0 ' + y + ')'); g.classList.remove('go', 'land'); void g.getBoundingClientRect(); g.classList.add(lands ? 'land' : 'go'); }
  function setBreath(b) { breathing = b; el('breath').dataset.b = b; el('b-word').textContent = b === 'in' ? 'Inhale' : 'Exhale'; el('b-how').textContent = b === 'in' ? 'through the nose, reset' : 'sharp, on every shot'; }
  function paintSeq() { [...el('seq').children].forEach((b, i) => { b.className = i < idx ? 'done' : i === idx ? 'now' : ''; }); [...el('steps').children].forEach((li, i) => li.classList.toggle('on', i === idx)); }
  // Throw the next shot in the combination. byUser = a tap; otherwise it is the demo loop.
  function throwNext(byUser) {
    if (idx >= M.seq.length) idx = 0;
    const code = M.seq[idx], sh = SHOT[code]; const myIdx = idx; const lastOne = idx === M.seq.length - 1;
    el('cue').textContent = sh.cue;
    const steps = sh.st.map(([pose, dur, e, hit], i) => ({ pose, dur, ease: e, hit, last: !!hit && lastOne,
      begin: i === 0 ? () => { setBreath('out'); if (sh.def) incoming(sh.def, sh.hitMe); if (SFX && touched && !sh.def) SFX.play('exhale', { dur: .2, intensity: .55 }); } : null,
      end: hit ? () => { if (SFX && touched) SFX.play(sh.sfx, { intensity: .75 }); if (byUser && navigator.vibrate) navigator.vibrate(12); if (lastOne) complete(byUser); }
        : (!sh.st.some((x) => x[3]) && i === 0 ? () => { if (SFX && touched) SFX.play(sh.sfx, { intensity: .35 }); } : null) }));
    // A user tap cuts the recovery short so fast taps chain like a real combination.
    if (byUser && (seg || queue.length)) { queue = queue.filter((q) => q.hit); }
    steps.forEach((s) => queue.push(s));
    idx += 1; paintSeq();
    void myIdx;
  }
  function complete(byUser) {
    if (!queue.some((q) => q.pose === 'guard')) queue.push({ pose: 'guard', dur: 260, ease: 'io' });
    setTimeout(() => { setBreath('in'); if (SFX && touched) SFX.play('inhale', { dur: .9, intensity: .6 }); }, 260);
    setTimeout(() => { chain = 0; }, 1000);
    if (!byUser) return;
    done += 1; el('repn').textContent = done; const r = el('reps'); r.classList.remove('tk'); void r.offsetWidth; r.classList.add('tk'); if (SFX && touched) SFX.play('bell', { intensity: .35 });
    if (done >= 5 && !asked) { asked = true; setTimeout(() => { el('r-n').textContent = done; el('ready').classList.add('on'); setTimeout(() => el('ready').classList.add('armed'), 800); el('r-go').focus({ preventScroll: true }); if (SFX) SFX.play('pop'); }, 700); }
  }
  function idle() { if (frozen) return; clearTimeout(autoT); const gap = idx === 0 ? 1500 : 230; autoT = setTimeout(() => { if (Date.now() - userAt > 2200 && !seg && !queue.length) throwNext(false); else idle(); }, gap); }
  function setCombo(i, byUser) {
    M = C[i]; idx = 0; queue = []; seg = null; queue.push({ pose: 'guard', dur: 260, ease: 'io' });
    [...el('tabs').children].forEach((b) => b.setAttribute('aria-pressed', b.dataset.id === 'cl-' + M.id));
    el('m-kind').textContent = TNAME[M.type]; el('m-level').textContent = LVL[M.level]; el('m-name').textContent = M.name; el('m-why').textContent = M.why;
    el('seq').innerHTML = M.seq.map((c) => '<b><span>' + SHOT[c].n + '<small>' + SHOT[c].s + '</small></span></b>').join('');
    el('steps').innerHTML = M.seq.map((c) => '<li><span>' + SHOT[c].cue + '</span></li>').join('');
    el('cue').textContent = 'Tap the fighter to throw the first shot.'; paintSeq(); setBreath('in');
    if (byUser && SFX) { SFX.unlock(); SFX.play('tick'); }
    if (reduce) { cur = JSON.parse(JSON.stringify(G)); draw(cur); }
  }
  const code = (m) => m.seq.map((c) => SHOT[c].n + (c.length > 1 && /b$/.test(c) ? 'b' : '')).join('-');
  function library() {
    const pool = C.filter((m) => MODE_TYPES[mode].includes(m.type));
    let list = pool.filter((m) => fType === 'all' || m.type === fType);
    const by = { easy: (x, y) => x.level - y.level || TORD[x.type] - TORD[y.type] || x.seq.length - y.seq.length, hard: (x, y) => y.level - x.level || TORD[x.type] - TORD[y.type] || y.seq.length - x.seq.length, short: (x, y) => x.seq.length - y.seq.length || x.level - y.level, group: (x, y) => TORD[x.type] - TORD[y.type] || x.level - y.level || x.seq.length - y.seq.length };
    list = list.slice().sort(by[fSort]);
    el('tabs').innerHTML = list.map((m) => '<button type="button" class="xl-tab" data-id="cl-' + m.id + '" aria-pressed="' + (m.id === M.id) + '"><small>' + TNAME[m.type] + '</small>' + m.name + '<span class="xl-code">' + code(m) + '</span><span class="xl-lv" data-l="' + m.level + '"><i></i><i></i><i></i>' + LVL[m.level] + '</span></button>').join('');
    el('lib-n').textContent = list.length + ' combinations';
    el('grips').innerHTML = TYPES.filter(([id]) => id === 'all' || MODE_TYPES[mode].includes(id)).map(([id, name]) => '<button type="button" class="xl-gchip" data-g="' + id + '" aria-pressed="' + (id === fType) + '">' + name + ' <b>' + (id === 'all' ? pool.length : pool.filter((m) => m.type === id).length) + '</b></button>').join('');
  }
  el('tabs').addEventListener('click', (e) => { const b = e.target.closest('.xl-tab'); if (b) { userAt = 0; setCombo(C.findIndex((m) => 'cl-' + m.id === b.dataset.id), true); } });
  el('grips').addEventListener('click', (e) => { const b = e.target.closest('.xl-gchip'); if (!b) return; fType = b.dataset.g; library(); if (SFX) { SFX.unlock(); SFX.play('tick'); } });
  el('mode').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; mode = b.dataset.m; [...el('mode').children].forEach((x) => x.setAttribute('aria-pressed', x === b));
    fType = 'all'; applyMode(); library(); if (!MODE_TYPES[mode].includes(M.type)) setCombo(C.findIndex((m) => m.id === MODE_FIRST[mode])); if (SFX) { SFX.unlock(); SFX.play('tick'); } });
  function applyMode() { el('key-k').hidden = mode !== 'kick'; el('key-m').hidden = mode !== 'muay'; el('key-n').hidden = mode === 'muay'; el('key-d').hidden = mode === 'muay'; el('stage').dataset.mode = mode; }
  el('sort').addEventListener('change', (e) => { fSort = e.target.value; library(); });
  const tap = () => { touched = true; userAt = Date.now(); if (SFX) SFX.unlock(); clearTimeout(autoT);
    if (reduce) { const sh = SHOT[M.seq[idx]]; const hp = (sh.st.find((x) => x[3]) || sh.st[0])[0]; cur = JSON.parse(JSON.stringify(POSE[hp])); draw(cur); el('cue').textContent = sh.cue; idx += 1; if (idx >= M.seq.length) { idx = 0; done += 1; el('repn').textContent = done; } paintSeq(); return; }
    throwNext(true); };
  el('stage').addEventListener('click', (e) => { if (!e.target.closest('.xl-mute')) tap(); });
  el('stage').addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(); } });
  const mute = el('mute'); const pm = () => { const m = SFX ? SFX.isMuted() : true; mute.textContent = m ? '🔇' : '🔊'; mute.setAttribute('aria-pressed', m); mute.setAttribute('aria-label', m ? 'Sound off' : 'Sound on'); };
  mute.addEventListener('click', (e) => { e.stopPropagation(); if (!SFX) return; SFX.setMuted(!SFX.isMuted()); pm(); }); pm();
  el('r-no').addEventListener('click', () => { el('ready').classList.remove('on', 'armed'); el('stage').focus({ preventScroll: true }); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') el('ready').classList.remove('on', 'armed'); });
  // The page decides the discipline: boxing shows hands only, Muay Thai its own set, kickboxing both striking sets.
  const page = document.body.dataset.page; const sw = el('mode');
  if (page === 'fit-boxing') sw.hidden = true;
  else if (page === 'fit-muaythai') { mode = 'muay'; sw.hidden = true; M = C.find((m) => m.id === MODE_FIRST.muay); }
  else { mode = 'kick'; [...sw.children].forEach((x) => { x.setAttribute('aria-pressed', x.dataset.m === 'kick'); if (x.dataset.m === 'muay') x.hidden = true; }); sw.style.gridTemplateColumns = '1fr 1fr'; }
  const cta = document.querySelector('.nf-hero .nf-ctas a.nf-ink'); if (cta) document.querySelectorAll('#combo-lab a.nf-btn, #cl-ready a.nf-btn').forEach((a) => { a.href = cta.getAttribute('href'); });
  applyMode(); library(); setCombo(C.indexOf(M)); draw(cur);
  if (!reduce) requestAnimationFrame(frame);
}
