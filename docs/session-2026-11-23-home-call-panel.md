# Session 2026-11-23: lighter homepage top and the on-page call panel

## What changed and why
- Jay: the homepage was "too heavy", the way to start was unclear, and booking a call should not send the
  visitor off the site.
- Sub nav removed from `/` (it repeated the header menus). The industry ticker moved under the hero.
- Hero has two paths: **Book a 20-minute call** (solid) and **Build my plan first** (outline), plus one line
  saying which is for whom. On phones and tablets both buttons sit before the preview and the lede.
- New call panel: `partials/studio/call-dlg.html` (included from `build.html`, so `/` and `/build` have it)
  and `assets/studio/callbook.js`. Next eight weekdays, hours 9, 10, 11 AM and 1 to 4 PM Pacific, name,
  email, optional business. Posts to `lead-intake` with the time in `message` ("Call request: ...").
- Every call button opens it: hero (`data-call`), `#call-btn`, `#final-call`, and `/build?call=1` links.
  The plan summary call button no longer needs a plan.

## Decisions
- Built-in request over a Cal.com embed: no account, no third-party script, no backend change. Trade-off:
  it does not read a calendar or send an invite. Copy says "I confirm by email" and never "open".
- Time goes in `message`, because `lead-intake` keeps `meta` only for the `train` door. No migration.
- Reused events `call_click` and `lead_sent` (detail `call`); no new event names.
- Rejected: turning the header "Build your project" button into the call button (left for Jay to decide).

## Traps
- `.final` is the closing section's class. `blueprint.js` also put `final` on the hero when a visitor
  touched the page during the intro, so `.final p` margins and centering leaked in: the hero jumped about
  50px and a first click on a hero button missed. The hero state class is now `settled`. Do not reuse
  `final` on anything else.
- `[data-call]` clicks are handled in the capture phase on `document`.
- The call hours are a guess. Jay has not confirmed them.

## Next steps
1. Jay sends one real call request after the push and confirms a row lands in `leads` (never had one).
2. Jay confirms call hours; edit `HOURS` in `callbook.js`.
3. Real availability: plan a calendar connection (Cal.com or Google Calendar API) so the panel shows only
   open times and sends an invite. Plan first: it touches an API.
4. Unused now: `partials/studio/subnav.html`, `subNav()` in `main.js`, `.subnav` styles. Safe to delete later.
