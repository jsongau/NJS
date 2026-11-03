# 2026-11-03: NJS Studio becomes the homepage

## What changed
- `/` is now the NJS Studio page. The CV that lived at `/` moved, unchanged, to `/resume`.
- `/studio` redirects to `/` (temporary redirect, so it can become its own page later).
- New code: `assets/studio/` (modules, CSS, public catalog, projects, brand SVGs), `tools/`
  (catalog build and one-file preview), `tests/studio/` (engine and catalog tests).
- Footer links to the CV at `/resume`.

## Decisions
- Light theme, pink palette (Jay rejected dark and lime-first). Geist and Geist Mono only.
- Hero is a fill-in-the-blank sentence instead of pills; industries then kinds, plus type-your-own.
- Plans: Basic (site, hosted), Premium (portal and payments), Partner (dashboard and agents).
- Prices hidden on the page. The priced catalog source stays out of git (`docs/nathan-j-song/`
  is ignored, because this repo is public).
- Logo: solid N, hollow pink S behind it, the N's last stroke drops into a J with a pink dot.
  Dot hops once on load; hovering the header logo snaps the S straight.

## Rejected
- Dark "Night Studio" theme, highlighter marker on the headline, pill rows, the period mark.

## Traps
- The lead form posts to the Supabase `lead-intake` function, whose origin allowlist includes
  nathanjsong.com and www. A new domain needs adding there first.
- `call_url_todo` is true in the catalog, so call buttons open the form. Set a real Cal.com link
  and flip the flag to make them link out.
- Tests and the preview tool read the page from `index.html` at the repo root.
- The CV's own links and Agent NS widget are unchanged; check `/resume` after deploy.

## Next steps
1. Cal.com link for "Book a call".
2. Analytics events table (needs a migration OK).
3. Trademark search before printing "NJS Studio".
4. Vercel plan: Hobby does not allow commercial use; move this project to Pro.

## Afternoon round
- Ribbon content moved out of the catalog into `assets/studio/marquee.js` (62 entries, own marks). The catalog is rebuilt from the private source on the Mac, so page copy added to the public catalog would be wiped.
- Ribbon speed is pixels per second (38 wide, 28 narrow), set from the row width, so adding entries never speeds it up. Hover pauses it.
- `madlib.js` `reveal()` scrolls an opened picker panel fully into view under the sticky bar.
- `projects.json` takes an optional `logo`. Boba Night (jsongau/niteboba favicon) and PM Countdown (local repo favicon) are in `assets/studio/brand/delivered/`.
- Next: CoverCapy and BoxVacay logos (their local repos are outside ~/Projects; the GitHub copies have no logo files). Then test the lead pipeline end to end and replace the cal.com TODO link.
