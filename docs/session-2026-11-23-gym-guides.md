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
