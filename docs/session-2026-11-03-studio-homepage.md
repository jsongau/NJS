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

## Waves 0 to 2 (pages plan)
- Wave 0: `studio_events` table and `event-intake` edge function are live in Supabase project cedunmyttprzgslthuyk. `assets/studio/track.js` beacons page view, picker, business and plan picks, configurator steps, plan seen, form open, lead sent and call clicks. No personal data; a test keeps the page, function and table event lists identical.
- Pages: sections live once in `partials/studio/*.html`; page templates in `partials/studio/pages/`. Run `node tools/build-pages.mjs` after editing a partial; `--check` (and the pages test) fails on stale output. Never edit the generated `index.html` or `*/index.html` by hand.
- Each tab page promotes its first section's h2 to the page's h1. Tab pages end with `final-route` (plain links to `/build` and `/build?call=1`), so their buttons always work without a plan.
- `main.js` mounts a view only where its root exists, redirects old `/#build` style links, and carries the selection hash on `data-carry` links.
- Decided: Waves 1 and 2 shipped together so no empty pages go live. Home keeps every section until Wave 3.
- Phone menu shipped (the header hid every tab link under 860px). Trap: `.top nav a:not(.btn)` hides links inside any nav in the header, so menu rules are scoped `.top .m-menu`.
- Next: Wave 3 (slim home, always-on final buttons) after a week of funnel data; CoverCapy and BoxVacay logos; cal.com link; Vercel Analytics.
- Home sub-menu (`partials/studio/subnav.html`): jumps scroll to the section heading without changing the hash (the hash holds the plan selection). Trap: `html { scroll-padding-top: 84px }` already existed and adds to any scroll-margin; home now sets scroll-padding to header plus sub-menu instead.
- Trap: a `<button>` is always an atomic inline box, so `display: inline` on `.slot` cannot let it wrap like text. The last slot and its period sit in `.ml-end` (nowrap), and on phones the sentence scales with the viewport so the longest pick fits on one line.
- Draft card v2: `assets/studio/widgets.js` holds one widget per feature id, written from the business scene (brand, cta, tiles). Sized in container query units (`cqw`) on `.bp-phone`, so it reads at any width. The card is a flex column now (was absolute layers that collided at mid widths). Tabs rotate every 4.2s while visible and stop for good once the visitor touches the card. Widgets never show money figures (copy test).
- Fitness mode W1: header is now `header-top` + `nav-biz` / `nav-fit` partials; `mode: 'fitness'` on a page entry switches the brand, tabs, switch state and `body[data-mode]` theme. Fitness partials live in `partials/fitness/` (the builder reads both folders); goals render from `partials/fitness/goals.json`. Plan: `docs/nathan-j-song/plan-2026-11-03-fitness-mode.md` (private). Gym names stay off until each manager OKs it in writing.

