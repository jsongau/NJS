# Session 2026-11-26: Breath Lab and the Play and practice menu

## What changed
- Two breath games moved from preview files into the site, on top of the Combo Lab and Swing Lab (9927f71, de66b6f).
  - `/fitness/reformer-pilates#breath-lab`: six reformer moves, teal.
  - `/fitness/mobility-and-yoga#breath-lab`: sixteen poses (eight standing, eight on the floor), violet.
- One engine, two figure sets: `assets/studio/breathlab.js` runs any `section[data-bl]`; `assets/studio/breathrigs.js`
  holds the reformer and yoga figures, moves and breath cues. Partials `nf-breath-reformer.html`, `nf-breath-yoga.html`.
- Styles `.bl-*` appended to `fitness.css`, every rule scoped under `.bl-sec`. Kind colours: teal Pilates, violet yoga.
- Mega nav, Train on your own: a Play and practice column (three Combo Labs, Swing Lab, both breath games).
  `OWN_LAYOUT` in `meganav.js`: Jay picked three columns (notes left to About); 'four' keeps two notes beside the labs.
- Phone drawer: the duplicate Business | Fitness switch is gone; the header keeps the only one.

## Decisions
- Shared engine over two copies: scoring, input, sound and the booking card live in one file. A third discipline is
  a new figure set in `breathrigs.js` plus a partial.
- The space bar works only while focus is inside the lab, so it never takes over page scrolling.
- The animation loop pauses while the lab is off screen (IntersectionObserver).
- The picture uses `touch-action: pan-y`: a finger can still scroll the page across it; holding still exhales.
- Under 1024px the sticky hold button rides 82px up, above the fixed 12-pack bar.

## Rejected
- Copying each game's script into its page: two places to fix every bug.
- The four-location booking grid from the preview files: replaced by one 12-pack link with the page's focus.

## Traps
- `build-preview.mjs` only accepts `import { x } from './name.js'` and `export const|function`. New modules go in `ORDER`.
- A pipe inside a CLAUDE.md table cell must be escaped as `\|`.
- Layout rules for the desktop panel must be scoped to `.mn-panel`, or they also hit the phone drawer, which reuses
  the same markup inside `.mm-body`.

## Not verified (Jay to check)
- The breath cue on every move: which half is the exhale. Jay corrects these as the coach in `breathrigs.js`.
- The breath sound and iPhone vibration, on a real device.
- On a short phone screen the sticky hold button covers the rep pips and stats while held.

## Next
- Jay corrects the breath cues in breathrigs.js.
- Track "move completed" and "booking card tapped" through `event-intake` (plan first: names in three places).
