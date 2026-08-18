# UX and accessibility audit

Independent audit against section 3 of `CONTRACT_wave2.md`. Measured in Chromium against the
production build (`npm run build`, snapshot taken 11 August 2026, 20:13 UTC), across all fourteen
routes at 1440x900 and 380x820, plus a third pass at 380x820 with touch emulation so that the
`@media (pointer: coarse)` rules in `base.css` were actually in effect. Contrast ratios were computed
from rendered colours against the first opaque ancestor background. Accessible names were read from
Chromium's own accessibility tree, not inferred from markup.

---

## Verdict

This is a good application with a small number of genuinely serious defects, and the defects are
concentrated rather than spread. The parts the contract flags as hardest are the parts that were done
best: the compose modal's focus management is textbook, the map legend is keyed by shape and word
rather than by swatch, the `/map` empty state is the best-designed empty state I have seen in a work
sample, headings are clean on all fourteen routes, nothing animates under reduced motion, and no route
scrolls sideways at 380px. But three things undercut that. The lane filter labels on the landing page
render at **zero pixels high** because of a one-line CSS inheritance bug, leaving the owner's own
colourblind rule broken on the first control he will touch. The `--text-3` grey is used as
body-size text on thirteen of the fourteen routes and fails 4.5:1 everywhere it appears, worst case
2.53:1, which is the exact class of defect a colourblind owner cannot self-check. And the touch-target
rule in `base.css` exempts `a` and text `input`, so the primary navigation is 29px tall on a phone on
every route. None of these is architectural; all three are small, surgical fixes. Fix them and this
clears the bar comfortably.

**Confirmed findings: 8** (2 critical, 3 high, 2 medium, 1 low). **Suspected: 3.**

---

## CONFIRMED findings, worst first

### 1. CRITICAL. The lane filter names on `/` render at zero height, leaving colour as the only signal

**Route:** `/` (the desk, the landing page)
**Selector:** `section._filters_ > div._laneFilter_ > button._laneBtn_ > span._chip_ > span._label_`
**Source:** `src/pages/DeskPage.module.css:148` (`.laneBtn { line-height: 0; }`) interacting with
`src/components/primitives/LaneChip.module.css:61-65` (`.label { overflow: hidden; }`)

**Measured evidence.** The nine lane filter chips each contain a `.label` span whose text is present
in the DOM but whose rendered box has zero height:

| chip | label text | rendered box | computed line-height |
| --- | --- | --- | --- |
| Schools | "Schools" | **42 x 0 px** | `0px` |
| Colleges | "Colleges" | **46 x 0 px** | `0px` |
| Youth sports | "Youth sports" | **69 x 0 px** | `0px` |

The sibling `.glyph` survives at 8 x 10 px because `LaneChip.module.css:56-59` sets its own
`line-height: 1`. The `.cap` survives because it is a fixed 8 x 8 px box. The label inherits
`line-height: 0` from `.laneBtn`, and `overflow: hidden` on `.label` clips the resulting zero-height
line to nothing. A cropped screenshot at native resolution confirms it: nine coloured pills each
containing two small marks and no word, next to a tenth pill that reads "All eight lanes".

The same `LaneChip` renders correctly everywhere else, including the desk's own rows and the `/map`
lane filters, which read "Schools", "Colleges", "Corporate" and so on. Only the desk's filter buttons
are affected, because only `.laneBtn` zeroes the line-height.

**Why it matters.** This is precisely the failure the standing rule exists to prevent, on the primary
control of the first screen. What is left to distinguish nine filters is the pill's fill colour plus
an 8 x 10 px glyph, and the glyph set includes `◭` against `◮` (a triangle differing only in which
half is filled) and `■` against `◧` against `◫` (three squares differing only in internal division).
At that size, on a colourblind reader, those nine chips are close to indistinguishable. The
`title` tooltip is the only fallback and it is unavailable on touch and unreliable from the keyboard.
The irony is that `LaneChip.tsx` documents the rule in its own header comment ("this component still
refuses to let colour carry anything alone") and `DeskPage.tsx:472` correctly passes no `glyphOnly`
flag. The intent is right; the paint is wrong. Reading the source would never find this.

**Suggested fix.** Delete `line-height: 0` from `.laneBtn`. It was presumably added to kill the
inline-block descender gap; `display: inline-flex` on the button already does that. If it must stay,
set `line-height: 1` on `.chip` in `LaneChip.module.css` so the primitive is immune to whatever a host
page does to it, which is the more robust of the two.

---

### 2. CRITICAL. `--text-3` is used as small text across the app and fails contrast on 13 of 14 routes

**Routes:** all except `/quote/:id`
**Token:** `src/styles/tokens.css:56` (`--text-3: #8a929c`)
**Scale:** 88 declarations of `var(--text-3)` across 22 CSS module files

**Measured evidence.** 83 unique failing (foreground, background, selector) pairs were measured. 78 of
them have `#8a929c` as the foreground. Not one of them is large text.

| background | token | measured ratio | required |
| --- | --- | --- | --- |
| `--surface-3` `#e2e7ee` | `#8a929c` | **2.53:1** | 4.5:1 |
| `#e9eef5` (group head) | `#8a929c` | **2.70:1** | 4.5:1 |
| `--brand-gold-tint` `#fbeee4` | `#8a929c` | **2.77:1** | 4.5:1 |
| `--surface-2` `#f7f9fb` | `#8a929c` | **2.98:1** | 4.5:1 |
| `--surface-0` `#ffffff` | `#8a929c` | **3.15:1** | 4.5:1 |

Rendered font sizes at which it appears: 9, 9.5, 10, 11.1 and 13.3 px. Representative instances:
`/packages` `span._priceLabel_` "Per guest" at 9.5px/700 on `#e2e7ee`, 2.53:1;
`/coaching` `span._microLabel_` "How it is worked" at 9.5px/700 on `#e9eef5`, 2.70:1;
`/` `span._colLabel_` "Written door" at 9.5px/700 on white, 3.15:1;
`/map` `span._kpiLabel_` "Organisations" at 10px/700 on white, 3.15:1;
`/method` `table thead th` "Criterion" at 9.5px/700 on white, 3.15:1;
the app footer paragraph at 11.1px/400 on white, 3.15:1, on every route.

`tokens.css:52` states the rule the code is breaking, in the codebase's own words: *"All four clear
4.5:1 on surface-0 except `--text-3`, which is reserved for large text only."* Zero of the 78 failing
instances is large text.

Two smaller pairs also fail: `--text-2` `#5f6975` on `--surface-3` `#e2e7ee` at **4.49:1** (`/map`
`._word_` "Calendar", `/packages` `._tallyNote_`) and `--neutral` `#6b7684` on `--surface-2` at
**4.37:1** (`/replies` and `/field` status chip labels "Wrong person", "No written door").

**Why it matters.** These are the column headers, unit labels, provenance notes and micro-labels that
tell the reader what each number means. They are the layer that makes a dense screen legible, and they
are the layer that disappears first for anyone with reduced contrast sensitivity, on a laptop screen
in a bright room, or on a projector in an interview. The owner cannot check this himself, which is
exactly why it was called out.

**Suggested fix.** Darken the token rather than chase 88 call sites. `#61666d` clears 4.5:1 on every
background the token is currently used against (white 5.79, `--surface-2` 5.48, `--surface-3` 4.66,
`--brand-gold-tint` 5.08). That lands close enough to `--text-2` `#5f6975` that the honest question is
whether a fourth grey earns its place at all; collapsing `--text-3` into `--text-2` and nudging
`--text-2` to about `#5a626e` would fix both this and the two `--text-2` failures in one move, and
leave a three-step ramp that is all AA at every size.

---

### 3. HIGH. Primary navigation is 29px tall on a phone, on all fourteen routes

**Routes:** all fourteen
**Selectors:** `header._nav_ nav a._link_` (5 per route), `a._brandLink_`, `footer a._footerLink_`
**Source:** `src/styles/base.css:124-128`

**Measured evidence.** Measured at 380 x 820 with touch emulation, so `(pointer: coarse)` matched
(verified: `matchMedia("(pointer: coarse)").matches === true` on every route). The coarse-pointer rule
grants `min-height: 44px` to `button, [role="button"], a.tap, input[type="checkbox"], select`. It does
not cover `a` without the `.tap` class, nor text inputs, nor `min-width`. Every `button` in the app
does reach 44px; these do not:

| control | route(s) | rendered box |
| --- | --- | --- |
| `a._link_` main nav, 5 per page | all 14 | **73.8 x 29.2** |
| `a._brandLink_` home | all 14 | **141.1 x 25.6** |
| `a._footerLink_` "How every number here works" | all 14 | **191.6 x 17.2** |
| `input#desk-search` | `/` | **330 x 34.6** |
| `input#act-where`, `#act-hours`, `#act-targets` | `/field` | **322 x 38.6** |
| `input._guestInput_` | `/book` | **88 x 30.6** |
| `a._railLink_` in-page nav, 9 of them | `/method` | **126.5 x 30** |
| `a._src_` source links, 14 of them | `/method` | **330 x 17.2** |
| `input[type=checkbox]` | `/packages` | **13 x 44** (13px wide) |

**Why it matters.** The five nav links are the most-used controls in the whole application and they
are 15px under the minimum on the device where the minimum matters. The 17.2px footer and source
links are barely half. The `/packages` checkbox got its height from the rule and kept a 13px width,
which is the narrowest target in the app. The contract's phrasing, "44px minimum on anything tappable,
`base.css` already sets a `min-height: 44px` rule, do not fight it", reads as though the rule is
comprehensive. It is not, and nobody downstream would know.

**Suggested fix.** Widen the coarse-pointer rule in `base.css` to cover the cases it misses and add a
width dimension:

```css
@media (pointer: coarse) {
  button, [role="button"], a.tap, select,
  input:not([type="hidden"]), textarea { min-height: 44px; }
  input[type="checkbox"], input[type="radio"] { min-width: 44px; min-height: 44px; }
  nav a, footer a { min-height: 44px; display: inline-flex; align-items: center; }
}
```

Genuinely inline links inside a sentence are correctly exempt from the rule and should stay exempt;
the ones listed above are all standalone controls.

---

### 4. HIGH. The desk contradicts itself in its own opening sentence

**Route:** `/`
**Source:** `src/pages/DeskPage.tsx` intro paragraph, line 462, line 514

**Measured evidence.** Three stale counts, all visible above the fold at both widths:

- The h1 subtitle reads *"Sixty-nine real organisations sit within 6.6 miles of a building that has
  not opened"*, directly above a stat card that reads **"102 / Organisations on the board"**.
- `DeskPage.tsx:462`: the first filter button reads **"All eight lanes"**. `LANE_ORDER` now has nine,
  the nav badge reads "Lanes 9", and `/lanes` has the h1 "The nine lanes".
- `DeskPage.tsx:514`, rendered in `.resultCount`, measured verbatim from the DOM:
  *"0 of 102 on the board match the filter. 45 of the sixty-nine publish no written door at all,
  which is what the go-see runs are for."* The 102 and the 45 are computed; the "sixty-nine" is a
  string literal. One sentence, two different totals.
- The same `<p>` is the empty state's neighbour: *"clear it above and start from all sixty-nine."*

**Why it matters.** This application's entire argument is that its numbers are trustworthy and
derived. A hiring manager who reads the first sentence, looks at the card beneath it, and finds two
different totals has been given a reason to doubt every other figure on the site, and that doubt is
cheap to acquire and expensive to undo. It is the most damaging finding here in proportion to how
trivial it is to fix.

**Suggested fix.** Interpolate: `{PROSPECTS.length}` in the intro and the result line,
`All {LANE_ORDER.length} lanes` on the filter button. The ninth lane landed and the prose did not
follow it; deriving these removes the class of bug rather than this instance.

---

### 5. MEDIUM. The desk's result count changes silently; only 2 of 14 routes have live regions

**Routes:** `/` (worst), `/objections`, `/replies`, `/book`, `/sent`, `/field`
**Source:** `src/pages/DeskPage.tsx:509-515` (`.resultBar > .resultCount`)

**Measured evidence.** Live-region inventory per route: `/map` has 5 (`aria-live="polite"` on the
count, the map summary, the offers carousel and the selection announcement), `/calendar` has 2. Every
other route has exactly one, and it is the static demo-mode banner. On `/`, typing `zzzzqqqq` into
`#desk-search` changed `.resultCount` from "102 of 102 on the board." to "0 of 102 on the board match
the filter." with **no** `aria-live` or `role="status"` element on the page. `/map` handled the
identical interaction correctly, announcing "0 of 102 organisations that match the filter".

The same gap covers `/objections` (changing a disposition, saving a note), `/replies` and `/book`.
`/field` and `/sent` do have a `role="status"` on their form-completion and copy-confirmation strings,
which is right; the pattern just was not carried to the counts.

**Why it matters.** The contract names this case explicitly: *"Live regions (`aria-live="polite"`) on
anything that changes without a navigation, such as a result count or a send confirmation."* A
screen-reader user filtering the desk gets no feedback that anything happened. `/map` proves the team
knows how to do this; the landing page just did not get it.

**Suggested fix.** Wrap `.resultCount` in `aria-live="polite"` and add `role="status"` to the
objection disposition and note-saved confirmations. The `/map` implementation is the model.

---

### 6. MEDIUM. The map's two "written door" figures do not add up to its own total

**Route:** `/map`
**Selector:** `div._strip_ > div._scroller_ > div._kpi_`
**Source:** `src/domain/selectors/mapBoard.ts:387-388, 467-476`

**Measured evidence.** The stat strip presents, left to right: "ORGANISATIONS 102 of 102",
"WRITTEN DOOR 35", "NO WRITTEN DOOR 45", "INSIDE 3 MILES 90", "GUESTS IN PLAY 5,932", "NEVER TOUCHED
86", "LIVE CONVERSATIONS 7". 35 + 45 = 80, not 102. The selector counts `writtenDoor` where
`emailConfidence === "verified_public"` and `noWrittenDoor` where `emailConfidence === "none"`.
`EmailConfidence` has a third member, `"form_only"` (`domain/types.ts:230`), which accounts for the
missing 22 organisations and is never shown.

**Why it matters.** Two figures presented adjacently, one named as the negation of the other, read as
complementary. A reader who does the arithmetic concludes the numbers are wrong; a reader who does
not concludes 45 organisations have no written door when the true figure for "cannot be reached in
writing" is 45 and the figure for "reachable but only through a form" is a separate 22 that the board
never mentions. Either way the strip misleads, and the strip is the first thing on the screen.

**Suggested fix.** Show the third figure ("CONTACT FORM ONLY 22"), or relabel the pair as "PUBLISHED
EMAIL 35" and "NO WRITTEN DOOR 45" so they no longer read as a partition, and say what the remainder
is in the map's `aria-live` summary sentence, which currently has the same gap.

---

### 7. LOW. The demo-mode toast covers the footer, and the footer clamps to two lines at 380px

**Routes:** all fourteen at 380px, all fourteen at 1440px for the overlap
**Selectors:** `footer._footer_ > p` (line clamp), the demo-mode `role="status"` pill (overlap)

**Measured evidence.** At 380px, `footer p` computes `-webkit-line-clamp: 2` with
`scrollHeight > clientHeight`, so the sentence is cut: *"An independent work sample by Nathan J. Song,
built for a Main Event Brea Sales..."* ends in an ellipsis on 13 of 14 routes. Separately, the
demo-mode pill is positioned over the footer at both widths; in the 380px screenshots it sits on top
of the footer paragraph and partially over the "How every number here works" link, which is the
footer's only control.

**Why it matters.** The clamped sentence is the disclaimer that says this is not affiliated with Main
Event, which is the one piece of footer text that has a reason to be read in full. The overlapped link
is the route to the methodology page.

**Suggested fix.** Drop the clamp at 380px and let the disclaimer wrap; give the shell a bottom
padding equal to the toast's height, or make the toast dismissible, so it never lands on the footer.

---

### 8. LOW. The desk is a single flat heading with no sections

**Route:** `/`
**Measured evidence.** `/` renders exactly one heading on the entire page: the h1 "The desk".
Comparable pages render 10 to 56. The stat strip, the filter block, the result bar and the ranked list
are all unheadinged `section` and `div` elements.

**Why it matters.** Heading navigation is how a screen-reader user skims a page, and the busiest,
most-visited screen in the application offers exactly one landmark to jump to. Everything else is
reached by tabbing through it linearly.

**Suggested fix.** Add visually-hidden h2s for the four blocks ("What the board holds", "Filter the
board", "The ranked board"), or make them visible; `/map` and `/field` already do the equivalent.

---

## SUSPECTED

**S1. The lane glyphs are too similar to carry the load alone.** Once finding 1 is fixed, the desk
chips get their words back and this stops mattering there. But the same glyph set is the primary
non-colour signal on 102 map markers, where it renders inside an SVG at `font-size: 12`. The nine
glyphs are `▲ ◭ ◮ ■ ◧ ◍ ◇ ◈ ◫`; three pairs differ only in interior fill (`◭`/`◮`), interior division
(`◧`/`◫`) or a centre dot (`◇`/`◈`). I did not test this with a colourblind reader, so I am not
claiming it fails; I am flagging that the glyph tier is thinner than the design intends. The markers
themselves are fine for screen-reader users because each carries a full sentence as its accessible
name. Worth a look at whether the two triangles and the three squares can be pushed further apart.

**S2. The `/map` left pane shows one and a half organisations at 1440x900.** The occasion segment, the
search box and the nine lane chips consume roughly 660px of vertical space before the first list card,
so on a 900px laptop the ranked list of 102 opens with the first card half below the fold. The pane
scrolls, so nothing is unreachable, but the screen's most important list arrives looking almost empty.
Consider collapsing the lane chips behind a disclosure at short viewport heights, or moving the
occasion segment into the stat strip.

**S3. The mobile nav clips its fifth item mid-word.** At 380px the nav row renders "Desk 86 | Trade
area 90 | Lanes 9 | Book 2 | R" with "Replies" cut at the viewport edge. The document itself does not
scroll sideways, so this is an internal horizontal scroller, which is a reasonable pattern, but there
is no fade, chevron or partial-item framing to signal that more exists. A first-time reader on a phone
may not discover Replies, Field, Calendar, Objections, Sent, Coaching or Method at all.

---

## Checked and CLEAN

Evidence that nothing was found, which is evidence too.

- **Keyboard reach and order.** 45 Tab stops walked on every route at both widths (fewer where the
  page runs out of controls first). Sensible source order everywhere, skip link first on all fourteen
  routes. **No positive `tabindex`** anywhere. **No stop landed off screen** (every focused rect was
  inside the viewport) and **no stop had a zero-size box**. **No focus trap** outside the modal, which
  is meant to have one.
- **Focus indicators.** Every stop measured had a drawn indicator. The global treatment is
  `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }`, and `--accent` `#1e3a5f`
  is 11.5:1 against white. `base.css:87` correctly re-asserts a 3px ring inside `.leaflet-container`,
  where Leaflet resets outlines. The header `select#period-select` opts out of the outline in favour
  of a border change to `#a8501a` (5.49:1 against white) plus a 3px `--brand-gold-tint` halo; it
  passes SC 1.4.11 but is the one control that does not match the app's own standard. *(An earlier
  reading of this control as having no focus ring at all was a measurement artefact: the computed
  `box-shadow` is sampled mid-transition and returns the transparent start value. It resolves to
  `rgb(251,238,228) 0 0 0 3px` once the transition settles.)*
- **The compose modal.** Opening it moves focus to the dialog's `h2`. **40 consecutive Tab presses
  never left the dialog; 12 consecutive Shift+Tab presses never left it either.** Escape closes it and
  returns focus to the exact button that opened it (`button._ctaSecondary_` "▭ Write the message"),
  verified by comparing the pre-open and post-close active elements. `role="dialog"`,
  `aria-modal="true"`, `aria-labelledby="compose-heading"` resolving to "Write to Brea Olinda High
  School". The scrim is a real 1440x900 fixed layer at `rgba(17,21,27,0.42)`, z-index 49 under the
  sheet's 50, and `elementFromPoint` confirms it intercepts clicks on the page behind. This is the
  best-implemented part of the application.
- **Detail pane focus return.** Closing the detail pane returns focus to the list card that opened it.
- **Accessible names.** Every `button` and `a` on every route has a non-empty accessible name.
  Chromium's accessibility tree reports **0 of 125 buttons on `/map` with a glyph-only or number-only
  name**. Map markers name themselves properly through `role="img"` plus `aria-label` on the inner SVG
  ("Biola University. Colleges and universities, calendar locked. 6.6 straight line miles from the
  building."), so the visible `◭` is decoration and is not what gets announced. List cards announce
  "Brea Olinda High School, Brea. Ranked 1 on this list, desk score 90."
- **Semantics.** Exactly **one `h1` on all fourteen routes at both widths**, and **no skipped heading
  levels on any route**. **No orphan `li`** outside a list container anywhere. **No `div` or `span`
  with a pointer cursor lacking both a role and a tabindex** on any route. **Zero page errors and zero
  console errors** across all 28 route-width combinations. The detail pane uses a real
  `role="tablist"` with `aria-selected`, `aria-controls` and a roving tabindex.
- **Colour independence, everywhere except finding 1.** The map legend keys every mark by shape and
  word, never by swatch: "Pointed, calendar-locked", "Square, discretionary", "Halo, selected",
  "A numeral in a circle, several organisations", "Broken circles, straight line miles", "The faint
  outline, cosmetic", and every swatch in it is `aria-hidden`. Desk score bars are decorative and
  marked so, with the signed number carrying the value and a **hatched** fill distinguishing penalties
  rather than a hue. Selection on the map list is a "◆ SHOWING" badge, a word. The occasion fork cards
  on `/lanes` carry glyph plus label. The cluster bubble is deliberately grey with a reasoned comment
  explaining why colouring it by majority lane would be a claim the data cannot support. This
  discipline is real and it is unusual.
- **Motion.** Under `prefers-reduced-motion: reduce`, **zero** elements on `/`, `/map`, `/book`,
  `/field` or `/objections` had a running animation or a transition above 120ms. `base.css:130` does
  the work.
- **Horizontal overflow.** `documentElement.scrollWidth` never exceeded `clientWidth` on any of the
  28 route-width combinations. Nothing scrolls sideways.
- **Truncation.** No element on any route at 1440px clips its own text to an ellipsis. (An earlier
  build in this session did: `ProspectListCard.module.css` `.cellLabel` was rendering "Touches" in
  50px of a needed 59 and "Window" in 48 of 56, on all 102 cards. That is fixed in the current build.
  The only remaining truncation is the mobile footer clamp in finding 7.)
- **The `/map` empty state.** Filtering to zero results produces: *"Nothing on the board matches
  that. The filter is doing its job. Widen it, or clear it and start again from all 102
  organisations."* plus a removable "✕ Search: zzzzqqqq" chip **and** a "Clear every filter" button,
  and it announces "0 of 102 organisations that match the filter" politely. It names what is narrowing
  the board, offers removal of each filter individually and all of them at once, and tells you what
  you would get back. This is exactly what the contract asked for.
- **The `/` empty state is not a dead end**, though it is weaker. The paragraph itself carries no
  control, and the copy says "clear it above", relying on spatial language. But a "Clear every filter"
  button *is* rendered and visible at y=658 when the list is empty, along with the global "Reset". It
  works; it is just not as well designed as the map's.
- **Provenance discipline.** Every commercial figure carries a `ProvenanceBadge` ("Public",
  "Illustrative") on the stat cards I checked.

---

## The browsing experience, judged

I walked this as somebody who has never seen it, which is the position the hiring manager will be in.

**The first ten seconds are the strongest thing here and they are also where the damage is done.**
`/` opens with a real sentence that tells you what the screen is for and what it ranks on, and that is
rarer than it should be. Then the sentence says sixty-nine and the card beneath it says 102, and I
stopped and read it twice. That is the only time in the whole application that I doubted a number, and
it happened in the first paragraph, on a site whose entire argument is that its numbers are derived
rather than asserted. Everything downstream has to climb back out of that hole. It is a five-minute
fix and it is worth more than any other five minutes available here.

**The navigation is numbered, which is a good decision that is half-finished.** "1 Desk, 2 Trade area,
3 Lanes, 4 Book, 5 Replies" reads as a sequence, and the pages genuinely are one: find them, place
them, understand why they buy, book them, see what came back. That is a story, and the numbers tell
you there is a story. But five numbered items sit in the top bar and there are fourteen routes. The
other nine live in a mega-menu that opens on hover or focus, and the first time I found `/method`,
`/coaching` and `/objections` was by tabbing into that panel by accident. On a phone the numbered five
become a horizontal scroller whose fifth item is cut mid-word, so the story reads "Desk, Trade area,
Lanes, Book, R". If the sequence is the argument, the sequence should be the thing that survives at
380px, and the nine supporting pages should be reachable from somewhere that announces itself.

**The map board is the best screen and it asks the most of you.** Three panes, a stat strip, an
occasion segment, a lane filter, a search box, a floating legend, a floating offers carousel and a
detail panel, all live at once. It earns that density: click any card and the list, the map, the strip
and the panel all move together, which is the thing the application exists to demonstrate, and the
right-hand pane's empty state is the single best piece of writing on the site. "Pick an organisation
and this pane does the arguing", followed by five bullets naming exactly what you will get, is a
designed empty state rather than a blank one, and it told me what to do next without my having to
guess. That is the standard the rest of the app should be measured against.

What the board costs you is orientation. At 1440x900 the left pane spends about 660px on controls
before the first organisation appears, so the ranked list of 102 opens showing one and a half cards.
The screen's headline is "102 of 102" and the screen shows you one. I understood the board only after
scrolling the left pane, and a first-time reader may conclude the list is short. The floating offers
card, meanwhile, sits over the middle of the map and covers a cluster and two ring labels; the legend
in the top right is careful to stay off Leaflet's own controls and the offers card is not as careful
about the map's content.

**The stat strip is where I had to read twice for the second time.** "WRITTEN DOOR 35" next to "NO
WRITTEN DOOR 45" over a total of 102. I did the arithmetic, got 80, and spent a minute deciding
whether the numbers were wrong or I was. They are not wrong; twenty-two organisations are reachable
only through a contact form and the strip does not have a column for them. But a pair of figures
presented as an opposition has to actually be one, or it has to say what the remainder is.

**Where I got lost was between the desk and everything else.** `/` ranks organisations. `/lanes`
explains the categories. `/packages` is titled "The pattern in the nulls". `/calendar` is titled "What
26 lanes will actually hold". Those are good titles for essays and confusing labels for destinations,
because the nav says "Packages" and the page says something else, and I could not predict from the nav
what I would land on. `/method` and `/coaching` I found late and they turned out to be the two pages
that would most reassure a hiring manager, which is an argument for surfacing them rather than filing
them behind a hover panel. The pattern across the app is that the writing is consistently better than
the wayfinding: every page, once you are on it, explains itself well; getting to the right page is the
part that takes guessing.

**Where the app asks you to understand it before it has told you anything** is the lane filter on the
desk, and that is finding 1 rather than a matter of taste. Nine coloured pills with two tiny marks
each, no words, sitting directly under a heading that says "All eight lanes" when there are nine. A
reader's first instinct on a ranked list is to filter it, and the first control they reach is
unlabelled and miscounted. Fix the line-height and the count and that whole first impression changes.

**What I would tell the owner.** The instincts here are genuinely good and unusually principled. The
hatched bars instead of a second hue, the legend keyed by shape, the cluster bubble deliberately left
grey with a written justification, the modal that returns focus to the button that opened it, the map
empty state that offers to undo each filter individually: these are things most production
applications do not do, and they are all correct. The defects are not failures of care, they are three
small mechanical gaps in an otherwise careful system, and two of them (the zero-height labels, the
grey that is too light) are exactly the kind that only a browser and a contrast calculator will find,
which is why they survived. The greyscale test the contract recommends would have caught the lane
chips in about four seconds. It is worth running it once per screen before this goes in front of
anybody.
