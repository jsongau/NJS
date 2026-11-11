# NJS — how to work on this repo

Read this first. It is the handbook for any Claude session (any account) that opens this folder.
Owner: Jay (Nathan J. Song). Live site: https://nathanjsong.com, served by Vercel from
GitHub `jsongau/NJS`, branch `main`. **Anything pushed to `main` is live within a minute.**
This repo is **public**: never commit Studio prices, secrets, keys or private notes. (Fitness prices are
public on purpose: see the 12-pack in `partials/fitness/nf-packs.html`.)

## What lives here

| URL | What it is | Built from |
|---|---|---|
| `/` | NJS Studio homepage (AI agents, websites, plans) | `partials/studio/pages/home.html` |
| `/plans` `/build` `/work` `/care` `/crew` | Studio pages | `partials/studio/pages/<name>.html` |
| `/fitness` | NJS Fitness home: hit-the-bag hero, focus picker, packs, Thursday calendar | `partials/studio/pages/fitness.html` + `partials/fitness/` |
| `/fitness/<page>` | 15 fitness pages: hubs (personal-training, striking, clubs-and-maces, yoga-and-pilates), one page per focus (muscle-building, fat-loss, conditioning, shoulder-strength, mobility-and-yoga, reformer-pilates, boxing, kickboxing, muay-thai), coach, book | `partials/studio/pages/fit-*.html`, styles in `assets/studio/fitness.css`, behaviour in `assets/studio/fitness.js` |
| `/resume` | Jay's interactive CV (the old homepage) | `resume/index.html`, hand edited |
| `/galaxy` `/olesmoky` `/molsoncoors` `/btc` … | Portfolio demos, each self-contained | their own folder, hand edited |

The Studio and Fitness pages are **generated**. Never edit `index.html`, `plans/index.html`,
`fitness/index.html` and so on by hand: edit the partial, then rebuild.

## How to edit the info

| To change… | Edit this | Then |
|---|---|---|
| Any Studio or Fitness copy (headlines, sections) | the section file in `partials/studio/` or `partials/fitness/` | rebuild pages |
| Page titles, descriptions, SEO, JSON-LD, which sections a page has | `PAGES` in `tools/build-pages.mjs` and `partials/studio/pages/*.html` | rebuild pages |
| Header, Business \| Fitness switch | `header-top.html`, `nav-biz.html` (mega nav), `nav-fit.html` | rebuild pages |
| Mega nav panel contents | `assets/studio/meganav.js` + `nav-biz.html` | rebuild pages |
| Footer | `partials/studio/footer.html` | rebuild pages |
| FAQ | `partials/studio/faq.json` (`[question, answer]` pairs) | rebuild pages |
| Fitness goals (5K, fight, Pilates…) | `partials/fitness/goals.json` (`[id, name, how, tags, who]`) | rebuild pages |
| Fitness focus cards and where each links | `partials/fitness/focus.json` (`[id, name, line, page link]`); every focus needs its own page | rebuild pages |
| The five pillars, and each focus page's wheel, health notes (with source links), ladder levels and questions | `partials/fitness/path.json` | rebuild pages |
| Coach's notes (sourced articles: warm-up, band workouts, AC joint) | `partials/studio/pages/fit-note-*.html`, hub `fit-notes.html`. Every health claim needs a source link that was read, and no claim that a treatment heals an injury | rebuild pages |
| The path hub `/fitness/path` | `partials/studio/pages/fit-path.html` + `path.json` | rebuild pages |
| Gear links (hidden while empty) | `partials/fitness/gear.json` (`[id, name, brand, why, link, [focus ids]]`); only gear Jay uses; the disclosure line renders with the row | rebuild pages |
| The fitness offer and its prices (one pack: the 12-pack; no trial pack) | `partials/fitness/nf-packs.html`, the Where choices in `fit-book.html` (`data-price`), `nf-where.html`, the pay question in `fitness.html` | rebuild pages |
| A new fitness page | copy a `fit-*.html` page, add a `fitPage(...)` line to `PAGES` in `tools/build-pages.mjs`, link it from `focus.json` or the footer | rebuild pages |
| Delivered projects, proof, logos | `assets/studio/data/projects.json`, logos in `assets/studio/brand/delivered/` | none |
| Industries, kinds, plans, care tiers, links (booking URL, lead form) | `docs/nathan-j-song/studio-catalog.source.json` (**private, gitignored, only on Jay's Mac**) | `node tools/build-studio-catalog.mjs` |
| Styles | `assets/studio/studio.css` (tokens on `:root`; fitness colors under `body[data-mode="fitness"]`) | none |
| Behaviour | `assets/studio/*.js` (ES modules; `main.js` mounts everything) | add new modules to `ORDER` in `tools/build-preview.mjs` |

Placeholders in partials: `<!--@name-->` includes `partials/…/name.html`; `{{var}}` is filled per page.

## Commands (run from the repo root)

```
node tools/build-pages.mjs
node tools/build-pages.mjs --check
node tools/build-studio-catalog.mjs --check
node --test tests/studio/*.test.mjs
node tools/build-preview.mjs /tmp/njs-preview.html
python3 -m http.server 8765
node tools/check-headlines.mjs http://localhost:8765/ http://localhost:8765/fitness/
```

Rebuild pages, check none are stale, check the catalog, run the tests (expect 44 pass, 8 skipped,
0 fail), build a one-file preview, serve locally at http://localhost:8765, then audit headline line
breaks (needs the local server and Playwright; pass every page you touched, and any preview file).
Run the tests before every commit, and the headline audit before any preview goes to Jay. The
copy-lint test fails on any `$` followed by a digit on Studio pages: no Studio prices on the site. Fitness
pages are exempt.

## Backend (Supabase project `cedunmyttprzgslthuyk`)

- `leads`: form submissions through the edge function `lead-intake` (doors: plan, call, `train` for fitness).
- `studio_events`: funnel events through `event-intake` (`supabase/functions/event-intake/`). No personal
  data, ever. Event names must match in three places, and a test enforces it: `assets/studio/track.js`,
  the edge function, and the latest migration in `supabase/migrations/`.
- Schema changes go in a new dated file in `supabase/migrations/`. Never edit an applied one.
- Secrets (`ANTHROPIC_API_KEY`, Resend keys) are set by Jay in the Supabase dashboard. Never ask for
  them in chat and never commit them.

## Jay's rules (non-negotiable)

1. **Deploy:** before any push, show `git remote -v` and confirm the target is `jsongau/NJS` `main`.
   Commit means saved; push means live. Always `git fetch` and rebase onto `origin/main` first, because
   other sessions push here too. Never force-push or overwrite someone else's commit.
2. **Plan first** for anything touching the database, an API, or more than one page: architecture, files,
   schema, trade-offs, success. Wait for Jay's OK. Backend before UI.
3. **No version-numbered files in the repo** (`-v2.html` and so on are gitignored). Previews go to chat,
   named -v2/-v3, each with proof (screenshot or test output).
4. **Honest copy:** no made-up scarcity, stats or testimonials. Gym names and logos stay off `/fitness`
   until each gym manager OKs in writing; use "I teach at…" wording and regions (North OC, South OC,
   Inland Empire).
5. **UX rules from Mary** (`docs/MARY-MEMORY.md`, read it before UI work): no layout shift on click,
   drawers open inward, auto-play yields to the visitor, jump links land on headings.
6. **Paste-safe Terminal commands for Jay:** one per line, full absolute paths
   (`/Users/kytlegacy/Projects/NJS`), no comment lines, no parentheses.
7. **Log the day:** one line per working day in `CHANGELOG.md`; a `docs/session-YYYY-MM-DD-*.md`
   for sessions with real decisions.
8. **Agent personas:** Agent Smith (architect, plans), Jane (builder), Mary (UX), Goldsmith (SVG and icons).

## If you cannot push

Cloud sessions sometimes get 403 from GitHub. Then bundle the commits and have Jay push from his Mac:

```
git bundle create /path/out.bundle origin/main..mybranch
```

Copy the bundle to `/Users/kytlegacy/Projects/NJS/docs/nathan-j-song/`, then Jay runs:

```
cd /Users/kytlegacy/Projects/NJS
git fetch origin main
git fetch /Users/kytlegacy/Projects/NJS/docs/nathan-j-song/NAME.bundle mybranch:mybranch
git push origin mybranch:main
git branch -D mybranch
git pull origin main
```

Use a fresh bundle filename every time. A reused name has delivered a stale file before.

## Where the plans live

Private plans (gitignored, on Jay's Mac): `docs/nathan-j-song/plan-2026-11-03-studio-pages.md`,
`plan-2026-11-03-studio-agent.md` (the AI guide agent, waiting on Jay), and
`plan-2026-11-03-fitness-mode.md` (Fitness waves 2 to 5). A session that cloned from GitHub instead of
opening the Mac folder will not have these; ask Jay to attach them.

## Open items (as of 2026-11-06)

- Booking link: `call_url` is still `cal.com/TODO…` in the catalog source.
- `leads` has never received a row. Submit one test request and confirm it lands.
- Fitness waves 2 to 5 need Jay's input first: class schedule per gym, which goals he coaches himself,
  gym manager approvals, session pricing, photos. The fitness footer still shows Business links.
- AI guide agent: waiting on Jay's go plus model choice. He sets `ANTHROPIC_API_KEY` himself.
- Delivered logos still missing for CoverCapy and BoxVacay.
