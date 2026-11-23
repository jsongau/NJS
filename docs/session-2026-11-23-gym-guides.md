# Session 2026-11-23: gym guides and gym profile pages

## What changed
- Guides at `/fitness/guides` now read as an editorial ranking table: masthead, region filter, hairline rows. Rank numerals appear only when every gym on a guide has a `rank` in `partials/fitness/guides.json`.
- 25 gym profile pages at `/fitness/guides/gyms/<slug>`, one template (`partials/studio/pages/fit-gym.html`, `tpl` on the PAGES entry), body from `gymBody()` in `tools/build-pages.mjs`. JSON-LD: SportsActivityLocation, WebPage with dateModified, BreadcrumbList.
- Counts in titles and copy come from the data.

## Decisions
- Jay's picks, Claude's research. No rank is shown until Jay ranks. No copied star ratings.
- A gym gets a page only with three or more sourced facts. Thin pages were rejected: they can drag the whole site down in search.
- Gyms that could not be confirmed open were dropped (five boxing, two kickboxing). Orange County boxing is empty until Jay names gyms to verify.
- The gyms Jay coaches at stay off the lists and are disclosed in the method section.

## Traps
- `esc` is declared after PAGES in build-pages.mjs, so page bodies that use it must be built inside `renderPage`, not at module top level.
- A balanced h1 can leave a lone first word on phones; gym names use plain wrapping at a smaller clamp.
- WebFetch could not read wildcardbc.com, westsideboxing.com, gloveworx.com, muaythaiamerica.net, muaythaiacademy.net, adrenalinefc.com or several ClassPass pages on this date. Those profiles lean on news and directory sources; re-check from the gyms' own sites.
- City fixes found from addresses: Lobos is on Melrose, Dynamix is in West LA, Brickhouse is in North Hollywood.

## Next steps
1. Jay ranks the gyms and writes one line each in the candidates sheet; copy into `rank` and `note`.
2. Profiles for the eight gyms without a page: Brickhouse, Santa Monica Striking, Southpaw, Left Hand, GKG, The Den, Adrenaline FC, Black Beard.
3. Verify Instagram handles for the gyms that have none.
4. Search Console: verify the domain, submit the sitemap, watch impressions on gym-name queries.
5. Backend: outbound-click event per gym through `event-intake` (plan first).

## Later the same day: reformer Pilates guide
- Third guide at `/fitness/guides/reformer-pilates-studios-socal`: 23 studios, 10 with profiles. `unit: "studio"` in guides.json switches the wording from gyms to studios.
- Left out on purpose: Lagree and megaformer studios (PlankHaus, Breeze Lagree, Lagree Ology, KV Lagree) and Core Movement Studios (mat Pilates only). Lagree is a different method from reformer Pilates.
- Most rows come from ClassPass regional lists (reviews collected January 2025 to February 2026). The `known` lines restate facts only, never ClassPass's ranking or ratings.
- Trap: a spelled-out count over twenty ("Twenty-three worth knowing.") overflows the h1 on phones, so counts above twenty show as numerals in the headline.
- Next: official sites and Instagram for the 13 studios without a profile; more Inland Empire studios (only three confirmed).

## Near-me finder
- `/fitness/guides/near-me`: one list of every guide place, kind filters, distance sort from browser geolocation or a picked area. Yoga gets a Hot / Not hot row once yoga data exists (`heat` per studio).
- Decision: no maps or geocoding service. Distances are straight-line from approximate hand-typed coordinates, labelled as approximate, with a Google Maps directions link per row. The shell and the Mac bridge had no network for geocoding.
- Privacy: position stays in the page; events record only that a filter or the locate button was used.
- Trap: the status line changes length, so it has a fixed min-height or the list jumps on phones.
- Next: exact coordinates (Jay can paste from Google Maps), `visited` and `partner` fields for the influencer plan, and a labelled-partner rule before any gym pays.

## Research fan-out, yoga guide and graphics
- Six research agents ran in parallel (boxing gaps, kickboxing gaps, Pilates gaps, yoga LA, yoga OC, yoga IE). Their JSON was edited by hand before it went into `guides.json`: nothing was pasted in unread.
- Yoga guide: 27 studios (LA 8, OC 9, IE 10), all with profiles. `heat` is `hot`, `none` (no heated classes listed in its sources) or `both`.
- Dropped as unconfirmed or wrong kind: Gloveworx (site dead twice), Santa Monica Striking, Left Hand Muay Thai, Black Beard Kickboxing, The Body Collective, The Beachouse Studio (Lagree), Class 46, CirKel Fitness, FIT with LIT, The Pilates Co., Speir Pilates Newport Beach, Pure Studio, Yoga Loft LA.
- Kept with weak 2026 evidence, Jay to verify: Wild Card (last dated source May 2025), Westside Boxing Club (2023), Ten Goose, Trinity, Robert Garcia Boxing Academy, Boxing Lab, Bobby's Boxing, The Den, Muay Thai America Gym, Muay Thai Academy of America, Evoken, Yoga Shakti. Carrie's Pilates and SweatLogic need a check that their machines count as reformers.
- Totals: boxing 21, kickboxing 18, reformer Pilates 18, yoga 27. 84 places, 82 profile pages.
- Graphics: `GICON` stroke icons and `artRank` / `artNear` in `tools/build-pages.mjs`. The list art draws its bars from the guide's real region counts.
- Traps: `.nf-ic` was already a class (icon tile), so guide icons use `.nf-gi`. The build never deletes a page folder, so a dropped gym's folder under `fitness/guides/gyms/` must be removed by hand. An ampersand in a place name trips the heading test (`&amp;` reads as a phrase break), so names use "and".
- Still open: the partner and visited fields for the influencer plan, exact coordinates, Jay's ranks.

## Interactive map
- `/fitness/guides/near-me` is now list plus map. Filter tree: Striking and MMA (boxing, kickboxing and Muay Thai, jiu-jitsu, MMA), Pilates (reformer, mat), Yoga (hot, not hot). Kinds are derived at build time from each place's `offers`, so a kickboxing gym that lists jiu-jitsu shows under both.
- Decision: Leaflet 1.9.4, vendored (no CDN), with OpenStreetMap raster tiles and no API key. Rejected: Google Maps and Mapbox (keys, billing), and a hand-drawn SVG map (no streets, so no use when driving).
- A rough coastline polygon and region names sit under the tile layer, so the map still reads when tiles are slow or blocked. The sandbox blocks tile hosts, so every screenshot from this session shows that fallback: the live street tiles were NOT seen rendering here and need a check on the real site.
- Privacy wording changed: the old line said the location never leaves the phone. With map tiles that is too strong, because tile requests show the tile host which area is viewed. The page now says the position is never sent to Jay or stored.
- Pins use the hand-typed neighborhood coordinates, which is visible on a street map. `tools/geocode-guides.mjs` replaces them from the US Census Geocoder; it was written but could not be run here (no network to that host).
- Traps: the site's global `svg { max-width: 100% }` collapses Leaflet vector layers in custom panes (fixed with `.nf-nr-map .leaflet-pane > svg`); Leaflet adds 17px margins to popup paragraphs; a vector layer in a custom pane needs its own renderer.
- CoverCapy review (agent): its finder uses geolocation with a typed fallback, a map with "search this area", and a mobile Filters / Map / Sort bar. The agent could not see its scripts or SVGs, so the map library and animations there are unknown.

## Map, second pass
- Jay asked for no more scraping, so the two running research agents (map and tile research, jiu-jitsu and MMA gyms) were stopped. No phone numbers were collected. Tile licensing for a commercial site is therefore still unresearched: read the OpenStreetMap tile usage policy before traffic grows.
- Added: flyTo and flyToBounds moves, rings at 2, 5 and 10 miles around the visitor, a dashed route line to the selected place, tooltips, a map button bar (Me, All, LA, OC, IE, Surprise me), an on-screen count, and Navigate links (`dir_action=navigate`) on the address, the row and the popup.
- Phone: filter rows scroll sideways (so the reserved sub-row is one line), the List / Map switch floats at the bottom with `position: sticky`, zoom buttons and the popup close button are 40px, links are 44px.
- Traps: `startMap` must hand back the same promise every time, or a tap during loading runs before the map exists; Leaflet's touch styles beat single-class overrides, so size overrides use `.nf-nr-map.leaflet-container ...`.
- A one-file preview of the map page can be built by inlining Leaflet next to the usual CSS and modules; `loadLeaflet` returns early when `window.L` already exists so that works.

## Map, third pass: the filter
- Jay called the pill rows a bad filter. Replaced with: four branch tiles with animated art, a panel (Kind multi-select, Region multi-select, Distance slider with steps Any, 25, 10, 5, 2 miles), a sort select, an active-filter count on the phone Filters button, and Clear all. On phones the panel is a bottom sheet with a "Show N places" button.
- Decided: "highest ratings" is not built from other sites' stars (the no-copied-ratings rule stands, and there is no rating data). Sort offers Closest, A to Z and Longest running (from `p.since`). A My rating option appears on its own once any gym has a `score` Jay set. Rejected: scraping Google or Yelp stars.
- Phone map: popups are off; a swipe strip of cards sits under the map. Swiping flies the map to that pin, tapping a pin scrolls the strip. The strip sits below the map, not over it, so the OpenStreetMap credit stays visible.
- Haptics use `navigator.vibrate`. Android browsers honor it; iPhone Safari ignores it. Nothing breaks either way.
- Crawl links: every row links to its guide and region anchor, the page ends with a section linking all four guides, guide pages link to the map filtered to that sport, profile pages link to the map focused on that gym.
- Traps: a default custom property on `.nf-tile` overrode the per-branch color (same specificity, later rule), so the default lives on `.nf-top-all` only; the floating List / Map switch covered the card buttons until the map box got bottom padding.
- Next: Jay's own scores and visit notes per gym (the `visited` and `partner` fields are still waiting on his go), run the geocode script on the Mac, check real tiles on the live page.
