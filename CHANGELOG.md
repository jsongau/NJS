# Changelog

One line per working day. Detail lives in `docs/session-YYYY-MM-DD-*.md`.

## 2026-08-18

- `r1` — the same portal fix as `me`, same file, same reasoning. `/r1` is
  the same codebase and carried the same shape: zero portals anywhere and
  nine components with fixed-position overlays. The add-a-prospect dialog
  mounts inside the side rail, so it is the one genuinely exposed to an
  ancestor transform; the other eight mount from providers or page roots.
  Verified after the fix at 1300x844: full-viewport scrim and a 560px
  dialog both with and without a transform injected on the rail's own
  scroll container.

- `me` — the add-a-prospect dialog is portalled to `document.body`. It
  rendered inside the side rail, where `position: fixed; inset: 0` on the
  scrim is only true while no ancestor carries a transform. Measured on
  the shipped build: put a transform on one rail ancestor and the scrim
  collapses from 1300x844 to 251x451 and the panel is squeezed to 219px
  and clipped, which on screen is the page going grey with no dialog and
  nothing in the console. The rail is full of transforms already, all of
  them on sibling rows rather than ancestors, so the defect was one
  refactor away rather than live. The portal removes the class: verified
  1300x844 scrim and a 560px dialog with and without an ancestor
  transform, where the old build fails the second case.

- `champ` — new. The Territory Book at `nathanjsong.com/champ`, a local
  marketing and market prospecting console for the Champions Group
  Holdings Marketing Manager, West Division posting. Copied from `me`,
  then rebuilt from the inside: 329 organisations against 211, the
  anchor moved to Service Champions Brea, and every rendered string in
  the application rewritten from venue vocabulary to home services
  marketing. Five agents scraped the published Champions surface on
  18 August and every fact in the console traces to one of them with a
  URL and a read date. 58 files deleted rather than hidden, being the
  transitive closure of what the entry point can no longer reach, and
  the bundle fell from 2.14 MB to 1.79 MB. Three things worth naming:
  the offer countdown is now computed from one published date and one
  clock rather than stored, after it printed "14 days to expiry" on a
  board dated three weeks past that date; 146 partner rows were
  recommending a competitor's membership plan because the package shelf
  had been repurposed underneath them; and 52 named individuals' work
  email addresses now carry the domain with the local part withheld,
  where the map panel had been rendering them as live mailto links.
  Source in `sites/champions-territory-book`. Detail in
  `docs/2026-08-18-champ-console.md`.
- `me` — the same 52 addresses are still live at `/me` in full. Fix
  pending a decision.

## 2026-08-16 (3)

- `me` — mobile, measured at 320/360/390 in both modes. The mega nav was
  not scrolling on a phone, it was clipping: content 621px wide in a 390px
  bar, so the Rationale control had 88 of its 112 pixels on screen and at
  320 it had 18, while the document width read a clean 390 the whole time.
  Queue keys come off the bar below 899px (measured: the full strip needs
  888) and the mode switch stays, because every key is also a rail row and
  the switch is not. Type scale lifted at the small end below 560px in both
  places it is declared, root and the fourteen page stylesheets that shadow
  it; 240 hardcoded micro sizes collapsed to one named token. iOS focus
  zoom fixed globally. Desktop unchanged, verified at 1440. Details in
  `docs/session-2026-08-16-rationale-mode-and-the-rail.md`.

## 2026-08-16 (2)

- `me` — fact-checked all 27 explanation screens against the code and data
  they describe. 46 findings: 28 wrong, 18 unsupported. Every unsupported
  claim about a real company deleted rather than reworded, including
  invented prices for Chuck E. Cheese and Topgolf and a fundraiser rate
  table naming four competitors and a job title, none of it sourced. 128
  further corrections across 70 files, including on-screen copy: Desk and
  Lanes claimed all 211 organisations carried a Google place id when 69 do.
  Method rebuilt to describe three research passes rather than two, with
  the second-pass cohort no longer silently merged with the third. Added
  `/start` as a door for cold arrivals, Open Graph tags and a preview card,
  and two build checks: one asserting the committed site is this source
  built byte for byte, one asserting no product photography returned and
  every route has a real file behind it. Details in
  `docs/session-2026-08-16-rationale-mode-and-the-rail.md`.

## 2026-08-16

- `me` — Rationale shipped as a mode rather than a page: every screen explained
  at its own address with a `/rationale` prefix, one rail in both readings. A
  walk of all 28 screens in both modes found three real defects (the rail's
  queue buckets keyed on the raw path and vanished in Rationale; those bucket
  links jumped back to Console; the Maps takeover could not reach its own
  explanation) and one lying measurement. Added `/sellthrough`, extended
  `/spend` with order control and term checks, wrote the anime gap onto
  `/partners`. Deployed build and new build served side by side and walked
  screen for screen: nothing lost, nothing broken. Details in
  `docs/session-2026-08-16-rationale-mode-and-the-rail.md`.

## 2026-08-09

- `olesmoky` — mobile audit and repair. An unterminated `padding:8px 13` in the
  prize wall stylesheet was swallowing twenty rules including the whole toolbar
  layout and its 900px block. Prize wall overlays were trapped behind the site
  header by `isolation:isolate` on the host plus `z-index:5` on main, so the
  lightbox close button sat under the chrome. A model-dashboard rule was leaking
  onto every My Jar panel, killing the sticky filter bar. All inputs to 16px on
  phones, 44px hit areas on the view switcher and streak arrows, redemption confirm
  scrolls instead of clipping, touch fallbacks for hover-only product cues.
- `olesmoky` — Today and This week became tabs. Quest names rewritten to state the
  action; Set Your Holler collided with the venue name. Heraldic shield sigils for
  all nine categories. Claim-to-collect language: "Jar the 400", and every claim
  ends with the distance to the $15. Hidden-marker quest replaced with Confirm Your
  Address; the driver quest retargeted to the delivery with an Instacart CTA.
- `olesmoky` — prize wall: 20% coupon stacking on the subtotal, pagination with a
  page jump, two shuffleable eight-item rails one per category, quick filters in
  one row with In reach set apart, $9.99 or 3,350 points shipping at redemption.
- `olesmoky` — My Jar opens on 2,500 and counts up to it. Streak check-in moved
  above the calendar with drawn wax-seal and spent-match day marks. Badge codex
  cut 28 to 12 and made earnable. Premium Codex at 3,000 doubles referrals and
  opens three quests. Convert columns hold one height and greet by name.
  330 jsdom assertions passing. See `docs/session-2026-08-08-olesmoky-board.md`.

## 2026-08-08

- `olesmoky` — the model view now opens with a pilot scorecard: $1,000 of Meta
  ads, Tennessee only, 21+, thirty days. Thirteen tiles computed forward from
  cited benchmarks (Gupta Media and Triple Whale CPMs, WordStream 2025 CPC and
  CTR, Formstack contest-form conversion) so they cannot disagree: 83,333
  impressions, 1,425 clicks at $0.70, 447 entries at $2.24, 246 accounts at
  $4.07, 19 merch orders, 14 distillery visits, 11 Instacart first orders,
  $2,980 attributed and 3.0x ROAS. The national-scale stress test stays below
  it, reframed as the version that tries to kill it rather than the verdict.
  Research by a paid-social agent with source URLs in the footnote.

- `olesmoky` — quest board rebuilt. Six filter tabs over thirty cards became three
  zones by time horizon with claim-to-collect, set bonuses and a ledger for the rest.
  Quest names rewritten to state the action; Set Your Holler collided with the venue
  name. Sittin' a Spell cut on compliance, replaced with Name Your Driver. Badges cut
  28 to 12 and made earnable for the first time. Premium Codex at 3,000 points that
  doubles referrals and opens three quests, priced so one delivery receipt pays it
  back. Featured 20% coupon on the prize wall with a drawn ticket that tears open on
  hover. 2,500 point count-up on My Jar. Four class-name collisions found and fixed.
  201 jsdom assertions passing. See `docs/session-2026-08-08-olesmoky-board.md`.
- `olesmoky` — the black-on-black text was `:root` used inside two shadow roots,
  where it matches nothing, so every palette token was undefined and `color`
  fell back to inherit, i.e. the UA button colour. `:host` fixes the console and
  the Prize Wall at once. Streak rebuilt on real date keys with month paging, a
  derived streak and a seeded history; milestone bars, the member-card collapse
  and its floating strip removed; Prize wall is now the default My Jar tab;
  Activity writes a row on signup and has an empty state; coupon bar scoped to
  Convert; mini-nav copy rewritten for action. 60 jsdom assertions passing.
  See `docs/session-2026-08-08-olesmoky-shadow-tokens.md`.
- `olesmoky` — the delivery locator drops the product dropdown and the radius
  picker for one place field, backed by 8,771 real towns and 13,439 ZIPs pulled
  from the project's own Postgres and baked into the file. Typeahead with
  keyboard nav and a real listbox, ranked so Austin, Texas beats Austin, Nevada.
  Encoded as text rather than JSON, 168KB, and the page still makes zero
  external requests. Official rules chip removed from the hero, rules still
  reachable from the Convert fine print and the footer. Five stale copies of the
  old 250 point entry figure corrected to 2,500.

- `olesmoky` — the entry form cut from five questions to three. Retail channel
  removed, name and email merged onto one row, and every "why we ask" explainer
  deleted. Headlines rewritten by a brand pass so each one points at the next
  step, ending on "Last part, then you're in the jar." Age bands sit on one line
  with a "Rather not" opt out. Occasion question gains a sixth "Somewhere else"
  tile. The draw is weekly now, closing Friday 9pm Eastern, computed through Intl
  so the offset is right on both sides of daylight saving, and 52 draws a year
  instead of 12 flows through to the model.

- `olesmoky` — My Jar was rendering as a flex row instead of a two column grid,
  so the sticky rail blew out to 423px and the panels stacked underneath it.
  Cause: `.dsh` meant the dashboard shell since v33 and the delivery strip header
  since v42, and the later rule won. Fourth class name collision in this build
  after `.scan`, `.acct` and `.opt`, so there is now a check that fails the
  build on any top level class defined twice with conflicting layout. Dashboard
  frame widened to 1300 with a 286px rail, and on a phone the sub-nav pill you
  press now scrolls itself into view. The Enter page is untouched.

- `olesmoky` — question one is a drawn slip that writes itself. Type a name and
  it appears on the paper, the rule inks in left to right, the seal stamps, the
  pen lifts off the page and the whole thing tilts. Three slips drift up past it
  on a loop. The rose glow is now bound to the button path only: it answers
  "I pressed that, where did it go?", so somebody who walks straight into the
  form never sees it, and it clears the moment either of them starts typing.
  Right column settled at jar, countdown, buttons.

- `olesmoky` — the draw goes weekly. It closes Friday 9pm Pacific, computed from
  the real zone through Intl rather than a hardcoded offset, and it rolls over
  on its own without a reload. The clock and the entry button are now one
  component leading the right column, with two heat states read off the real
  remaining time. Name is question one again and the retail channel question is
  cut, so entering is type a word and press; the button then glides the page
  down to the field over 820ms and shakes it. Real delivery marks in the mini
  nav, borrowed from the copies already inlined in Convert. Cadence swept
  through every surface that claimed monthly, including the jar label and the
  financial model, where 52 draws a year instead of 12 moves contribution to
  -$902k.

- `olesmoky` — hero trust chip row removed. The three promises it carried are
  down to two useful ones and they moved onto the button that needs them, and
  the official rules link moved into the fine print under it so the entry offer
  keeps a compliant disclosure without a row of its own. Both hero columns now
  end within 6px of each other. Caught while in there: five copies of the old
  250 point entry figure, three versions after the economy moved to 2,500. A
  reordered funnel and a three column hero were tried and reverted before push.

- `olesmoky` — the countdown moved out from under the form and up above the jar,
  where the prize and the deadline read as one glance. Every tile question is now
  exactly six fixed size options: five answers and a sixth "Something else" in
  cyan, shaped like a real flavour record so the eight lookups downstream keep
  working instead of being special cased. The one-at-a-time "This one?" nudge is
  retired for a lit rim on all six at once, and hover and select change colour
  only, never size.

- `olesmoky` — the whole entry form moved into the hero card beside the jar.
  All five questions render in one slot instead of starting above the fold and
  finishing in a separate full width section, so the page stops changing shape
  halfway through being answered. The standalone quiz section is gone and there
  is one renderer for every step. After you enter the draw the demo pointer
  walks from the button to the first tile and knocks on it. Trap found: the
  tiles borrowed the retired quiz component's class name and inherited a
  `display:block` from it, which forced the nudge badge visible on every tile at
  once. Third class name collision in this build.

- `olesmoky` — gamification finished and the economy retuned. A real month calendar
  streak with one check in a day, a check in survey whose "no" routes to Instacart with
  the member's flavour prefilled, 28 badges in five sets with unearned ones visible.
  Entry now pays 2,500 and the $15 credit sits at 5,000, so the easy quests plus four
  check ins land exactly on the first reward. Referral that converts pays 500. The
  distillery section rewritten without prices and given animated marks and per card
  sound, delivery rebuilt as three steps. Delivery logos rebuilt from clean sources:
  two of the three had a transparency checkerboard baked into pixel data, and one
  shared size cap was rendering a 5:1 wordmark at 13px next to a 30px symbol.

- `olesmoky` — the Golden Jar funnel grew a member program and a financial model.
  Receipt capture that opens the phone camera and holds 100 points pending for 30
  days. A tabbed member dashboard: 30 quests grouped by effort, a 40 item prize wall
  across 16 categories, three levels, an account settings panel. New top level view,
  The model: twelve sliders, fifteen graded sources, three incrementality scenarios,
  and a verdict that concludes the program does not pay for itself on spend lift and
  explains why that is the right answer. Research behind it ran six agents over
  compliance, marketplace ranking, gamification mechanics and prize wall economics.
  See `docs/session-2026-08-08-olesmoky-gamification.md`.

## 2026-08-07

- `olesmoky` — the Golden Jar consumer sweepstakes funnel shipped at
  `/olesmoky`, which used to 404. One self-contained 1.3 MB page, zero
  external requests, three views: enter, find a jar, member dashboard.
  Two ledgers so no points ever attach to alcohol spend. Back office and
  Measure cut. `noindex`, same as distribution. See
  `docs/session-2026-08-07-olesmoky-funnel.md`.
- `olesmoky/distribution` — the territory planner reskinned to the Ole
  Smoky portfolio: 14 brands, 30 SKUs, jar/handle/mini package glyphs,
  and the wholesaler flipped from Harbor to Southern Glazer's because
  spirits do not move through a beer house. Every interaction unchanged.
  Replaces an earlier CRM-console build the same day, kept in history at
  `33f8762`. See `docs/session-2026-08-07-olesmoky.md`.
- `molsoncoors` — issue register, programme calendar and training pages
  committed; they had been built but never reached origin, so three
  routes were 404 on the live site.

## 2026-08-06

- `molsoncoors` — email rebuilt as body plus attached order sheet, sent
  log added at `/sent`, surveillance-flavoured openers replaced with
  forecast-based ones. See `docs/session-2026-08-06-molsoncoors.md`.
