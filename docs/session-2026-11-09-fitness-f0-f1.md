# 2026-11-09 · Fitness F0 and F1

## What changed and why
- **F0 (front end):** `/fitness` moves to a light theme (paper, ink, volt as a fill only, `#4D6B00` for accent text).
  The hero headline sits on two lines (the old one left "needs" alone on a line). A "Your first session" card
  (Kickboxing / Yoga / Reformer Pilates tabs, region choice, "Request this session") prefills the request form.
  The full-screen color wipe on the Business | Fitness switch is gone (Jay: "get rid of that fancy animation").
- **F1 (backend):** `public.leads.meta jsonb` (default `{}`, must be an object) holds allow-listed fitness fields:
  `discipline`, `goal`, `times`, `entry`. New events `fit_tab`, `fit_region`, `book_step` in `track.js`,
  `event-intake` and `supabase/migrations/20261109140000_fitness_f1.sql`. `lead-intake` now lives in the repo
  (`supabase/functions/lead-intake/`) as v2: validates `meta`, sends Jay a notify email with the request on top,
  and sends the visitor a confirmation for `train` requests. The reply-time promise comes from the
  `REPLY_PROMISE` secret; without it, no time is promised.

## State at end of session
- Migration **applied** to Supabase. Old functions ignore the new column, so nothing broke.
- `lead-intake` v2 and `event-intake` (3 new names) are **written but not deployed**. Until they are, `meta` is
  dropped and the new events are ignored (204), both silently.
- `leads` still has **0 rows**. A test request could not be sent from the cloud session (network blocked).
- Front-end commits are local; nothing is pushed.

## Decisions
- Approved: light theme, first-session card, multi-page plan (`docs/nathan-j-song/plan-2026-11-09-fitness-rebuild.md`).
- Rejected: city pages for every OC town (doorway risk); copying celebrity sites' app-first hero.

## Traps
- `studio.css` line ~905 redefines `:root` with Business pink (`--signal: #FF4F9A`). Fitness must set its own
  tokens on `body[data-mode="fitness"]`, or it inherits pink.
- `tests/studio/track.test.mjs` now reads the newest migration that redefines the event check, not a fixed file.

## Next steps
1. Deploy `lead-intake` and `event-intake` from `supabase/functions/`.
2. Send one real request from the live `/fitness` form; confirm the row, `meta`, both emails, and the events.
3. Jay: set `REPLY_PROMISE` if he wants a reply time in the confirmation email.
4. F2: the seven-page tree.

## Later the same day: the v3 rebuild (wave F2, pages)
- Jay: "I don't like yellow" -> soft coral `#FF8A6B` as a fill only, accent text `#A63A1E`, warm paper `#FAF6F2`.
- Main sellers: the 12-pack (2 sessions a week for 6 weeks, the habit pitch) and the 2-pack. Prices are not
  on the site; the packs say "Confirmed by email" until checkout ships.
- Seven pages under `/fitness`, each from `partials/studio/pages/fit-*.html`, styled by `assets/studio/fitness.css`
  (`nf-` classes, loaded only on fitness pages through `{{extra_css}}`).
- Thursday at Brea: classes 6 AM and 6 PM, booked 7, 10, 1 and 5 (from Jay), every other hour 6 AM to 7 PM open.
  Hours live in `assets/studio/fitness.js` until live availability ships.
- Clubs and maces page: movement definitions and six YouTube demos (loaded only on tap, youtube-nocookie).
  Research: grip and short-term shoulder mobility have small studies behind them; tendon and ligament
  "bulletproofing" has none, so the page frames it as Jay's own approach, not a proven effect.
- Reformer Pilates is bookable and always labeled "in certification".
- `lead-intake` (not yet deployed) accepts `pack`, `slot`, `first`, the new disciplines and `in-home`.
  **Deploy the function before the pages**: the live v1 rejects `in-home` with `invalid_location`.

## Traps
- `.nf-pack p` outranked `.nf-n` and shrank the big pack numbers; the rule is now `.nf-pack .nf-n`.
- `.nf-pack` set a white background after `.nf-dark`; the dark pack needs `.nf-pack.nf-dark`.

## Open
- SHRED: confirm it is UFC GYM's SHRED challenge and which years, before the name or years go on the page.
- Gym names stay off until each manager OKs in writing; the calendar reads "Brea · North OC".
- Where reformer sessions happen (which gym has reformers).
- Prices and Stripe for checkout (wave F3), then live availability (wave F4).

## Later still: focus picker and striking pages
- Jay: the 12-pack must not read as "you'll learn maces"; clients pick their focus. A "Your 12 sessions,
  your choice" picker (one or two of nine areas, `partials/fitness/focus.json`) with animated Goldsmith icons
  carries `?focus=a,b` into the booking form and `meta.focus`.
- New pages: `/fitness/boxing` (mitts, speed paddles, footwork, setups, defense), `/fitness/kickboxing`
  (Thai pads, front teep, round kick, switch kick, setups), `/fitness/muay-thai` (teep, knees, elbows, clinch),
  and `/fitness/striking` as their hub. All share the Orthodox / Southpaw / Switch stance switch.
- Technique tiles come from `partials/fitness/techniques.json`; icons in `TECH_ICONS` in `tools/build-pages.mjs`.
- Motion: cards reveal once (`.in`), icons loop only while on screen (`.live`), nothing moves under reduced motion.
- Trap: a stance panel with longer text grew the card by 23px on phones; the panels now stack in one grid cell.
