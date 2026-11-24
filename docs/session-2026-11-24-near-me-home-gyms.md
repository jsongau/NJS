# Session 2026-11-24: near-me review, three home gyms, map-first layout

## Review findings (live site, before this change)
- 14 days of traffic: 11 distinct visitors, 3 on Fitness, the map page viewed once, one visit from Google
  (the first search visit on record). `leads` still has no rows.
- The map listed 188 places and left out the gyms Jay coaches at; 5 of 983 links went to booking.
- 72 of 104 chain pins were placed by hand and the 84 guide pins use neighbourhood coordinates.
  `tools/geocode-guides.mjs` has never been run.
- Desktop: the map started about 1,150px down. Phone: the Map button switched the view without scrolling to it.
- All 188 rows rendered at once (39,000px tall on desktop). At 1440px the Run by filter slid under Region.

## What changed
- `assets/studio/places.js`: each gym has `at: [lat, lng]` and `city`. **These are city centres**, not street
  addresses; Jay needs to supply the three addresses.
- Home gyms band (`renderNear` in `tools/build-pages.mjs`): three cards built from `GYMS`, each with the
  coach avatar, days, a Book link (`/fitness/book?loc=<slug>`) and counts within 10 miles computed at build
  time. Each row and tile now says what the place adds: mobility (yoga), control (Pilates), engine (running
  and HIIT), skill (striking), matching the five pillars on `/fitness/path`.
- `mountNear` in `assets/studio/fitness.js`: `setHome` makes a gym the centre (distance from it, 10 mile
  default, spokes coloured by branch, summary sentence). Sharing a location or picking an area leaves home
  mode and marks the closest home gym. Avatar pins and a dashed triangle are always on the map.
- Layout: on desktop `.nf-nr` is a two-column grid (`.nf-nr-split` uses `display: contents`), so the map is
  beside the controls from the top. Filters open as an absolutely placed card. The list shows 20 rows and a
  Show more button; hidden rows stay in the page and on the map (class `nf-nr-cut`, not `hidden`).

## Later the same session: emblems, and spot, distance, kind
- Jay rejected the human avatar. Each gym now has its own emblem in `HOME_ART` (`tools/build-pages.mjs`): a
  ring and heavy bag (Brea, coral), a nine-station round clock with a glove (9Round, teal), studio lights over a
  dumbbell (Corona, violet). Drawn for this site: no gym logos. They idle gently and run on hover or when chosen.
- The filter is now three numbered steps. 1 Spot: a home gym, Use my location, an area, a typed address, or
  Drop a pin (click the map; the pin can be dragged). 2 Distance: `NEAR_MILES` is any, 1 to 5, then 10 to 30
  by fives; a slider and tap stops share one state (`syncDist`). 3 Kind: the tiles.
- Three examples are computed at build time (the smallest radius around each gym that finds two places), for
  instance "Yoga within 4 miles of UFC Gym Brea".
- Expand: on desktop `.nf-nr.full` becomes a fixed two-column screen (controls and list beside the map); on
  phones the map box goes full screen and the distance control is moved into it, then put back on close.
- Address search calls OpenStreetMap's Nominatim from the browser, bounded to Southern California. **It could
  not be reached from this workspace**: the success path was tested with a mocked answer and the failure path
  for real. Check it on the live page, and read Nominatim's usage policy before traffic grows.
- The avatar pin popup has "Measure from here"; the ring on the map follows the chosen distance.

## Third pass: ruler, chain marks, map-only expand
- Jay rejected the row of mile buttons. The distance is now a drawn ruler (`.nf-nr-ruler`): an invisible native
  range input sits over it, so dragging, tapping the track, touch and the keyboard all work; the numbers under
  it are plain buttons. `syncDist` sets `--p` on the ruler and the bubble text.
- Chains are marked apart from independents everywhere: a rounded-square pin with initials (`CHAIN_MONO`, letters
  only, never a company logo) and the branch icon as a badge; a "Chain" tag on list rows; a legend on the map.
- Run by left the Filters panel. It is a one-row strip of brand cards under the tiles (`.nf-nr-by`), filtered to
  the branch: Yoga shows Independent, CorePower Yoga and YogaSix.
- Expand now shows only the map. The ruler and the tiles are moved into `.nf-nr-fullbar` over the map and put
  back on close (comment nodes hold their places). Pins open popups in this mode on phones too.
- Trap: the base pin has a drop animation that ends rotated 45 degrees, so a non-teardrop pin must set
  `animation: none` as well as `transform: none`.
- Trap: Playwright's `boundingBox` is in viewport coordinates; scroll the ruler into view before a mouse drag.

## Decisions
- The places around a home gym are described as "close by" and by what they add. They are not called
  recommendations: Jay has not ranked or visited-tagged them yet, and chains are map only.
- The earlier rule that left Jay's gyms off the map is replaced: they are on it, labelled "Home gym · I coach
  here", and still not ranked in the guides.
- Rejected: starting the map on phones when a home gym is picked (Leaflet started in a hidden box throws
  NaN errors); it starts on the Map tab as before.

## Traps
- `.nf-pin > span svg` is rotated 45 degrees for the teardrop pins; the avatar pin has to undo it.
- Three inline copies of one SVG need three clipPath ids (the unique-id test caught it).
- Text that changes on click (the band summary, the distance line) needs a fixed min-height per breakpoint.

## Next steps
1. Jay: the street addresses of the three gyms, and a photo if the avatar should be his face.
2. Run the geocode script on the Mac and extend it to `chains.json`.
3. City pages from the same data (plan first): only cities with three or more places.
4. `visited` and `score` per place, so "close by" can become "I recommend".
5. Tile hosting: the map still uses OpenStreetMap's public tile server.
