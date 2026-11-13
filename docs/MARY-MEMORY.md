# Mary (UX agent) memory: NJS Studio

Mary owns layout, motion and accessibility on nathanjsong.com. Read this before touching any
interactive part of the studio pages. Newest rules first.

## Rules

- 2026-11-13 · **Animated figures are rigs, never one swinging path.** (Jay: "the head is falling off".) Head and
  torso are one piece. Each moving limb sits in its own group whose origin is the joint (hip, knee, shoulder),
  and only that group rotates. Do not rotate a multi-part path around its bounding box. Use classes outside the
  `ar-` prefix (which forces `transform-box: fill-box`) so rotation happens around the joint. Check by freezing the
  animation at several times and looking at the frames, not by watching it once.
- 2026-11-13 · **A two-way choice is a sliding toggle with stacked panels.** Two real radio inputs, a thumb that
  slides behind the labels, and both text versions stacked in one grid cell so the card never changes height.

- 2026-11-09 · **Headlines break between phrases, never inside one, and never strand a word.** (Jay, after "Pick
  a time. Pick a pack. Start / training." on a big phone.) Enforced by code, not by remembering:
  - `tools/build-pages.mjs` wraps every phrase of a multi-phrase h1–h3 in `<span class="ph">` (inline-block), so
    the browser breaks between "Pick a pack." and "Start training.", not inside them. Plain `<span>` lines inside a
    heading get the same treatment. `studio.css` adds `text-wrap: balance` on h1–h3 and `pretty` inside `.ph`.
  - Hand-built previews do the same by hand: each phrase in `<span class="ph">` (or `.nw` if it surely fits).
  - Size big headlines to their column: from 390px up, every phrase of an h1/h2 fits on one line. If one doesn't,
    shrink the font or widen the column (the section header grid is 1.2fr to 1fr); never let it wrap inside.
  - Proof before any preview goes to Jay: `node tools/check-headlines.mjs <pages>` at 320, 360, 375, 390, 393,
    412, 430, 768, 1024, 1280 and 1440 must say "All headlines break cleanly". Checking only 390 is how this slipped.
  - Small card titles (h3 under 28px) may wrap onto two even lines.
- 2026-11-09 · **Place search is one combobox: "ZIP code or city".** (Jay liked it on booking v15.) Never two
  fields (ZIP plus a city dropdown). How it works:
  - One text input with `role="combobox"`, `aria-controls` the list, `aria-expanded`, `aria-autocomplete="list"`,
    `autocomplete="off"`, 16px text (iPhone won't zoom), a clear (×) button once it has text.
  - Suggestions are a `role="listbox"` of `role="option"` rows, max 8, each 46px+ tall: the ZIP or city in bold,
    "City · Area" or "Area" in small grey on the right. Digits match ZIPs by prefix; letters match city names,
    starts-with first, then contains.
  - Keys: arrows move `aria-activedescendant`, Enter picks, Esc closes. Taps use `pointerdown` with
    `preventDefault` so the input's blur doesn't close the list before the pick lands.
  - A full 5-digit ZIP with one city fills itself ("92688 · Rancho Santa Margarita"); a ZIP shared by two cities
    lists both. A ZIP outside the area never dead-ends: say so, let them send anyway, or offer Online.
  - Confirm the pick in a status line ("Corona, Inland Empire. I train clients there.") with `aria-live="polite"`.
  - Data ships as a small static file built from CoverCapy's `search_locations` (city, area, ZIPs), not a live
    database call per keystroke: instant, works offline, no keys on the page.
- 2026-11-09 · **Phone checkout keeps the next step in reach.** A fixed bottom bar shows the current pick
  ("Thu Nov 12 · 9:00 AM / UFC Gym Brea · 12-pack") beside the one main button; short labels on phones
  ("Checkout", "‹" for back). The first screen shows the place and time picker, not a summary card; a review
  card with "Change" sits above the payment form.

- 2026-11-09 · **Fitness is coral on warm paper, never yellow.** Coral `#FF8A6B` is a fill (buttons, highlight
  marker, badges) with ink text on it (8.0:1). Text accents are `#A63A1E` (6.02:1 on `#FAF6F2`). Coral never
  carries text on paper (2.15:1).
- 2026-11-09 · **Video embeds load on tap.** A fixed 16:9 frame with a thumbnail button; the iframe
  (youtube-nocookie) replaces the button only when the visitor asks, so no layout shift and no player on load.

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
