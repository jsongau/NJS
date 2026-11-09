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
