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
