# Mary (UX agent) memory: NJS Studio

Mary owns layout, motion and accessibility on nathanjsong.com. Read this before touching any
interactive part of the studio pages. Newest rules first.

## Rules

- 2026-11-03 · **Expanding cards open inward.** "Show more" on a card is a drawer that slides up
  inside the card's own frame (the plan cards), never a section that grows and pushes the page.
  Measure with `offsetTop`/`offsetHeight`, not `getBoundingClientRect`, when a hover lift
  (`transform`) is active, or the check reports a fake 3px shift.
- 2026-11-03 · **FOMO stays honest.** No invented scarcity or counts ("2 spots left", "12 people
  started today"). Use real, computed urgency: the plan cards show "Start this week, live around
  <date>" from today plus the audit week plus the plan's longest build time. A real capacity
  number can be shown only when Jay supplies it.
- 2026-11-03 · **A click never moves the layout.** (Jay, after the Draft card jumped when
  switching features.) Anything a visitor can click, and anything that changes because of a
  click, keeps its size and position:
  - Content that swaps (widgets, tab panels, descriptions) lives in a fixed-size frame. Swap
    what's inside with transform and opacity only, never by changing height or width.
  - Text that varies in length gets a fixed box: clamp to a set number of lines and reserve
    the height (the Draft detail strip is 92px tall on desktop, 132px on phones, always).
  - Carousels move a track with `transform: translateX`, never by re-rendering slides. Build
    every slide once so each keeps its own state.
  - A tab row that scrolls glides the active tab to its center; the page itself never scrolls
    on a tab click.
  - Proof before shipping: measure the bounding boxes of the card and its parts on every
    state at 1440, 1000 and 390 wide; they must be identical (done for the Draft card v3:
    0 shifts across 10 slides and a widget tap at all three widths).
- 2026-11-03 · **Clicks should feel good.** Every tappable thing in a live preview gets press
  feedback (scale .96 on `:active`) and a ripple from the touch point. Motion respects
  `prefers-reduced-motion`.
- 2026-11-03 · **Previews that move on their own must yield.** Auto-play only while in view;
  pause on hover and on any touch; resume after 8 seconds of quiet. Show progress (the
  line under the active tab) so the visitor knows it will move.
- 2026-11-03 · **Inherited alignment is a trap.** The home hero centers its text at some widths;
  components inside it (the Draft card) set `text-align: left` and reset `p` margins and
  max-widths themselves.
- 2026-11-03 · **Jump links land on the heading, not the padding.** The home sub-menu scrolls
  to the section's `.sec-h`; `scroll-padding-top` covers the sticky header plus sub-menu.

## Where things live

- Draft card: `assets/studio/blueprint.js` (slider, tabs, detail strip),
  `assets/studio/widgets.js` (one widget per feature), styles under "Draft card v3" in
  `assets/studio/studio.css`.
- Pages are built from `partials/studio/`; run `node tools/build-pages.mjs` after edits.
