# Session 2026-11-24: movement labs (Swing Lab and Combo Lab)

## What changed and why
Jay wanted the fitness pages to show the movements, not describe them, and to lead visitors to the 12-pack.
Two interactive sections now ship on four pages:

| Page | Section | Content |
|---|---|---|
| `/fitness/clubs-and-maces` | Swing Lab (`#swing-lab`) | 18 club and mace movements, front view |
| `/fitness/boxing` | Combo Lab (`#combo-lab`), hands only, no switch | 31 combinations |
| `/fitness/kickboxing` | Combo Lab, Boxing only / Kickboxing switch | 37 combinations |
| `/fitness/muay-thai` | Combo Lab, Muay Thai set, no switch | 26 combinations |

## Files
- `partials/fitness/nf-swing-lab.html`, `nf-combo-lab.html`: markup. Included from `fit-clubs.html`,
  `fit-boxing.html`, `fit-kickboxing.html`, `fit-muaythai.html`.
- `assets/studio/swinglab.js`: front-view rig. A movement is keyframes for the grip (x, y) and the weight's
  angle, joined by a closed Catmull-Rom spline; elbows are solved from the hands (two-bone IK). Data lives in
  `MOVES` and `META` (grip group and level) at the top.
- `assets/studio/combolab.js`: side-view rig. Poses are joint positions (`POSE`), shots are pose steps (`SHOT`),
  combinations are the `C` table (`[id, type, level, name, shots, why]`). `MODE_TYPES` says which types each
  discipline shows; the page (`body[data-page]`) picks the discipline.
- `assets/studio/labsfx.js`: sounds synthesized with Web Audio, no audio files. Mute is stored in
  `localStorage['njs-sfx-muted']`.
- `assets/studio/fitness.css`: one block at the end, every class prefixed `xl-`, ids prefixed `sl-` or `cl-`.

## Decisions
- All classes and ids are namespaced because the first drafts used names the site already owns (`.mode`,
  `#stage`, `.btn`).
- No gym names in the copy (rule 4). The combinations are standard boxing, kickboxing and Muay Thai teaching,
  written by Claude; 9Round's daily combos are not published and are not claimed here.
- The sign-up prompt appears after 5 finished combos or 6 reps, once, and ignores taps for 0.8s so a visitor
  mid-combo cannot hit its button by accident.
- Impact effects (short freeze on contact, ink splash, speed lines, hit counter) are original; nothing is taken
  from a game.
- Reduced motion: no animation loop. A tap shows the strike or the next phase as a still pose.

## For Jay to check (he coaches these, Claude does not)
- Swing paths, especially the mill and reverse mill (the reverse is the mill played backwards).
- Inside circle and outside circle: built from general knowledge, no written source was read for them.
- Breathing: in as the weight drops behind, out on the pull or press; sharp exhale on every strike.
- Levels (Foundation, Build, Advanced) are a starting order.
- Hooks and inside or outside slips read poorly from a side view.
- Nobody has listened to the sounds. They are confirmed to play at a safe level, not judged by ear.

## Traps
- `/fitness/boxing` already overflows sideways at 320 to 390px before this change (36px at 320), and
  `tools/check-headlines.mjs` reports 20 problems on these four pages before and after. Both predate this
  session and are not fixed here.
- The preview sources are outside the repo. The repo files were generated from them by a script that
  prefixes classes and ids; edit the repo files directly from now on.

## Sources read
- https://fitnessvolt.com/steel-club-exercises/
- https://www.onnit.com/academy/steel-club-fundamentals-workout-2/
- https://www.dangerouslyfit.com.au/adjustable-club/try-these-7-club-mill-variations/

## Next steps
1. Jay reviews the movements on the pages and lists corrections.
2. Events for the labs (movement picked, rep or combo finished, prompt shown, prompt clicked). Needs a new
   migration plus the three-place event list (`track.js`, `event-intake`, migration): plan first.
3. A HIIT lab on `/fitness/conditioning` (asked for 2026-11-24).
4. Fix the existing phone overflow on `/fitness/boxing`.
