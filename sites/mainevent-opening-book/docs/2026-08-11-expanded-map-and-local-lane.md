# 2026-08-11. The expanded map board, the ninth lane and the local cohort

Second session of the day, and a wider one than the last. The owner read the
fourteen finished routes and came back with six things. All six are built. The
board grew from 69 organisations to 102, the `Lane` union grew from eight members
to nine, `/map` was replaced by a three pane board, the compose modal was rebuilt
around four intents, and the whole application was audited in a browser rather
than read. The application is still not deployed.

## What the owner asked for, and where it landed

| Asked for | Where it is |
| --- | --- |
| A way to separate the schools from the employers | The occasion class segment on the left pane of `/map`, driving the shared lane filter |
| Local businesses: boba, Firestone and tire shops, Samyang | 33 new rows in `src/data/prospects.ts` and the ninth lane `local-retail-food` |
| A better email sending modal | `EmailComposeModal` with four intents and an attachable group quote link |
| The app's own PinMark as the brand mark | `PinMark` redrawn at size, still carrying no Main Event trade dress |
| The expanded map view | `/map`, three panes, modelled on the Ole Smoky distribution screen |
| Accessible, easy to use, good to browse | `AUDIT_ux_accessibility.md`, measured in Chromium across all fourteen routes |

## What changed

**The data.** `src/data/prospects.ts` now holds 102 rows. The original 69 are
unchanged and still carry Google Places coordinates and place ids. The 33 new
rows came out of `RESEARCH_local_businesses.md` and were geocoded through the US
Census Bureau geocoder, so they carry a coordinate and **no place id at all**.
The field is absent rather than filled with a plausible looking string, and the
file's header comment says why. Nine further organisations were researched,
verified as real, and kept off the board; they are exported as
`EXCLUDED_FROM_BOARD` and render in full on `/method`.

**The domain.** `local-retail-food` joined the `Lane` union with occasion class
`discretionary`, sitting last in `LANE_ORDER`. Last is not a demotion and
`lanes.ts` argues the point in place: it is the smallest ticket on the board and
the only lane worked as a walking route rather than as a list of accounts, so a
rep reaches it after the calendar-locked work is out of the door.

**The state.** One action was added to `PipelineProvider`, `SET_LANES`, which
replaces the whole lane filter in a single dispatch. Nothing else in the provider
moved.

**The screens.** `/map` is now `TradeAreaPage` wrapping `MapBoard`, which owns the
three panes, every piece of reader-changeable state and the one compose modal.
The page itself is thin and sets the voice.

## New components

| File | What it is |
| --- | --- |
| `components/map/MapBoard.tsx` | The board. Owns pane layout, selection, the deep link `?prospect=`, and the single compose modal |
| `components/map/MapStatBar.tsx` | The seven figure strip and the three position board segment |
| `components/map/OccasionSegment.tsx` | Calendar, Chosen, Both. Writes `SET_LANES` to the shared filter |
| `components/map/ProspectListPane.tsx` | The ranked left list, its search box, its lane chips and its empty state |
| `components/map/ProspectListCard.tsx` | One organisation as a row, with rank, score, lane and touches |
| `components/map/MapCanvas.tsx` | Leaflet, the rings, the broken venue mark, the markers |
| `components/map/ClusterLayer.tsx` | Cluster bubbles, deliberately grey |
| `components/map/MapLegend.tsx` | The floating legend, keyed by shape and word |
| `components/map/OffersCard.tsx` | The floating offers carousel |
| `components/map/ProspectMapPopup.tsx` | The marker popup |
| `components/map/ProspectDetailPane.tsx` | The right pane, tabbed, and the thing that opens the modal |
| `components/email/EmailComposeModal.tsx` | Four intents, drafts, guardrails, send states, focus trap |
| `lib/email/templates.ts` | Seven new templates on top of the existing set |
| `lib/map/cluster.ts` | The clustering arithmetic |
| `domain/selectors/mapBoard.ts` | Every figure the board shows, derived at render |

## Decisions worth carrying forward

**The occasion segment drives the shared filter, not a second parallel one.**
This was the open question in the spec and it is the most consequential decision
of the session. A local filter on the map would have been easier: one `useState`,
no provider change, no risk of surprising a reader on another screen. It would
also have let the map show three lanes while the desk showed eight, and the first
time somebody filtered to schools on the map and found the desk unfiltered
underneath, the application would have stopped being one model of one trade area
and started being five screens that happen to share a stylesheet. The segment
reads its pressed state back out of `laneFilter` rather than holding its own, so
ticking an individual lane chip drops the segment out of its pressed state
naturally, which is correct: the reader has narrowed past a whole class and the
control should stop claiming otherwise.

**The email ratio is the commercial finding of the research pass, not a hole in
it.** The original 69 organisations are schools, colleges, churches and
professional practices, and 30 of them publish an email address on their own
site. Of the 42 local retail, food and auto organisations researched, 5 do, and
33 of the 42 landed on the board. Across all 102 rows the board now holds 35
published emails, 22 organisations reachable only through a contact form, and 45
with no written door at all. Franchise retail and chain auto service do not
publish a store level email at all: a Crumbl franchisee routes everything through
a corporate form and a Firestone store number has no inbox behind it. So the
whole cohort is a go-see cohort, by the way those businesses are run rather than
by anybody's preference, and go-sees are the job posting's own first
responsibility. The route sheet is the deliverable.

**Nine organisations were found, verified and kept off the board.** Seven because
the Census geocoder returned nothing on any form of their address, two because
Census returned a different street from the one the business publishes. THE ALLEY
at Brea Mall has no street number confirmed by any second source, and CJ Foods
matched the north segment of State College Boulevard when the research says
south, onto the same block as a boba cafe. That is the same standard that removed
Round One Entertainment in the first pass. Publishing the list of what was thrown
away is the only thing that makes the rest worth anything, so `EXCLUDED_FROM_BOARD`
renders in full on `/method` with the reason on every row.

**Two coordinate sources now coexist and the file says which is which.** Every
row carries an `addressSource` naming either the Google Places API or the US
Census Bureau geocoder, both dated 11 August 2026. All 102 rows on the board are
`locationAccuracy: "verified"`, because the nine that could not be verified are
the nine that came off. No row on the board carries a null coordinate and no row
carries an invented place id.

**Samyang was already in the data set.** It came in with the first 69 at 140 S
State College Blvd. It was re-verified independently in this pass rather than
re-added, and the finding is worth keeping: its contact page publishes no
address, no phone and no email at all. Westways Insurance was the other
duplicate, caught the same way.

**Suite level precision is absent from the Census rows and the map is allowed to
look it.** Census matches by address range interpolation, so five Brea
Marketplace tenants share one coordinate, two more share another, and three
tenants at 715 E Birch share a third. Those are not copied values, they are the
geocoder returning the same building for the same street address. The pins stack.
Jittering them apart would have been two lines of code and a fiction.

## Decisions rejected

**A second, map-local lane filter.** Covered above. Easier, and wrong.

**Filling the seven unmatched rows from a nearby pin.** An unmatched row is a
fact the owner can act on. A nudged pin is the thing that would discredit the
other 33.

**Colouring the cluster bubble by majority lane.** It is grey, with a written
justification in the component, because a bubble holding four schools and three
boba counters that renders as a school is making a claim the data does not
support.

**Holding the five PARTIAL rows back.** The research file offered a cautious call:
ship 37 and hold Charlie's Auto Tech, American Tire Depot, 7 Leaves Fullerton, CJ
Foods and THE ALLEY until Places confirms them. Two of those five came off for
geocoding reasons anyway. The remaining three are on the board with their
second-party sourcing named on the row rather than hidden.

## Traps found

**`line-height: 0` on the desk's lane filter buttons was collapsing every lane
chip label to zero height.** This is the finding of the session and it is the
best argument in this repository for testing in a browser rather than reading
code. `DeskPage.module.css:148` sets `line-height: 0` on `.laneBtn`, presumably
to kill an inline-block descender gap that `display: inline-flex` had already
killed. `LaneChip.module.css` sets `overflow: hidden` on `.label`. The label
inherits the zero line height, the overflow clips the zero height line to
nothing, and the word disappears. The glyph survives at 8 by 10 pixels only
because it sets its own `line-height: 1`. The measured result was nine coloured
pills on the landing page, each containing two tiny marks and no word, in an
application whose entire design system exists because the owner is colourblind,
on the first control he would touch. The glyph set includes a pair of triangles
differing only in which half is filled and three squares differing only in
internal division, so at that size the fallback was not a fallback. `LaneChip.tsx`
documents the rule in its own header comment and `DeskPage.tsx` passes no
`glyphOnly` flag. The intent was right and the paint was wrong, and no amount of
source review would have found it. The robust fix is `line-height: 1` on `.chip`
in the primitive, so the component is immune to whatever a host page does to it.

**Playwright must be launched with an explicit executable path.** Use
`executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"`. Do not
run `npx playwright install`.

**`fullPage` screenshots capture one viewport.** `AppShell` is
`height: 100dvh; overflow: hidden` with an inner scroll region, so the flag
returns the first screen and a lot of empty ground. Measure the real scroller and
grow the viewport instead, as `scripts/shot-all-routes.mjs` does.

**A throwaway script must live under `scripts/`.** A script at `/tmp` cannot
resolve `playwright`, because module resolution walks up from the script's own
directory and `/tmp` is not under the project. Put the throwaway in `scripts/`
and delete it afterwards.

**`tokens.css` carries an `!important` on `.leaflet-pane` that will flatten any
custom Leaflet pane.** Anyone adding a pane with its own `z-index` will find the
declaration ignored and spend an hour on the wrong file.

**A naive horizontal overflow check flags every page.** Elements clipping with
`text-overflow: ellipsis` have `scrollWidth > clientWidth` by design. Check
`documentElement`, not `*`.

## What the audit caught, and what is still open

`AUDIT_ux_accessibility.md` is an independent pass, measured in Chromium against
the production build at 1440x900, at 380x820, and again at 380x820 with touch
emulation so the coarse pointer rules were actually in effect. Contrast ratios
were computed from rendered colours; accessible names were read from Chromium's
own accessibility tree. It confirmed eight findings and suspected three. A fix
pass was running in `src/` as this note was written, so **confirm each of these
in a browser before believing it is done**:

1. The zero height lane labels, above. Critical.
2. `--text-3` `#8a929c` is used as small text on thirteen of fourteen routes and
   fails 4.5:1 everywhere it appears, worst case 2.53:1 on `--surface-3`. 78 of
   the 83 failing pairs have this one token as the foreground and not one of them
   is large text, which is the only use `tokens.css` reserves it for. The audit
   suggests darkening the token rather than chasing 88 call sites, and asks the
   fair question of whether a fourth grey earns its place at all.
3. The coarse pointer rule in `base.css` grants 44px to `button`, `[role=button]`,
   `a.tap`, checkboxes and `select`, and to nothing else. The five main nav links
   render 29.2px tall on a phone on every route, the footer link 17.2px, and the
   `/packages` checkbox got its height from the rule and kept a 13px width.
4. The desk contradicted itself above the fold: an h1 subtitle reading "sixty-nine
   real organisations" over a stat card reading 102, a filter button reading "All
   eight lanes" against nine lanes, and a result sentence carrying a computed 102
   and a hardcoded "sixty-nine" in the same breath. The ninth lane and the 33 new
   rows landed and the prose did not follow them. Interpolating `PROSPECTS.length`
   and `LANE_ORDER.length` removes the class of bug and not just the instance.
5. Only two of fourteen routes have live regions. `/map` announces its filtered
   count correctly and `/` does not announce anything at all.
6. The map stat strip shows "WRITTEN DOOR 35" beside "NO WRITTEN DOOR 45" over a
   total of 102, and the 22 organisations reachable only through a contact form
   are never shown. Two figures presented as an opposition have to be one.
7. The demo mode toast sits over the footer, and the footer disclaimer clamps to
   two lines at 380px, which truncates the sentence saying this is unaffiliated.
8. `/` renders exactly one heading on the whole page.

Suspected and not proven: the nine lane glyphs may be too close to each other to
carry the load alone on a 12px map marker; the left pane spends about 660px on
controls before the first card at 1440x900, so a list of 102 opens showing one
and a half; and the mobile nav clips its fifth item mid-word with no affordance
saying more exists.

The audit is also worth reading for what it found clean, because that is evidence
too: no positive tabindex anywhere, no focus stop off screen, one h1 and no
skipped heading levels on all fourteen routes, zero page errors across 28 route
and width combinations, nothing scrolling sideways, nothing animating under
reduced motion, and a compose modal whose focus trap held through 40 consecutive
Tab presses and returned focus to the exact button that opened it.

## Known, and deliberately not fixed

`GEOCODED_NOTES.md` records that the geocoding pass computed its quoted distances
from an anchor about 0.16 miles south of the `lat`/`lng` in `src/data/venue.ts`.
Nothing shipped is affected, because no row stores a distance: `milesFromVenue`
computes it from `VENUE` at render, so the application is internally consistent.
The figures quoted inside `GEOCODED_NOTES.md` are the ones that differ, by up to
roughly 0.2 miles. Do not copy a distance out of that document into anything.

The seven organisations the Census geocoder could not match are shippable without
coordinates and are not shipped at all, which is a stricter call than necessary.
The right next step is to run those seven, and only those seven, through the same
Google Places call that produced the first 69 rows, which would also supply the
place id the whole Census cohort lacks.

`fitCheck()` in `domain/selectors/capacity.ts` still prints a raw ISO date inside
its sentence while the rest of the app formats dates as "12 Dec 2026". Carried
over from the last session and still one line.

Six inherited files carry em dashes in code comments only, never in a rendered
string: `types.ts`, `capacity.ts`, `book.ts`, `prospectStatus.ts`, `tokens.css`,
`base.css`.

## Next steps

1. Confirm the audit fixes in a browser, not in the source. Findings 1 to 4 are
   the ones that change what a hiring manager sees in the first ten seconds.
2. Run the greyscale test once per screen. It would have caught the lane chips in
   about four seconds.
3. Decide the `--text-3` question properly: darken it, or collapse it into
   `--text-2` and leave a three step grey ramp that is AA at every size.
4. Retry TAPS Fish House, Green Tomato Grill and the Fullerton America's Tire
   store, all of which are real, all of which were rejected for a source problem
   rather than a fit problem, and all of which are named in the final section of
   `RESEARCH_local_businesses.md`.
5. Deploy. Repo `jsongau/NJS`, Vercel project `njs`, path `/me/scout`. Confirm the
   git remote before pushing. Nothing has touched the site repo yet.
