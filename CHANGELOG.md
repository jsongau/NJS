# Changelog

One line per working day. Detail lives in `docs/session-YYYY-MM-DD-*.md`.

## 2026-08-08

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
