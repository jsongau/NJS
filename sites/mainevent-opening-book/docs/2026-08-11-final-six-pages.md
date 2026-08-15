# 2026-08-11 — The last six pages of The Opening Book

Continuation of the Main Event Brea work sample. Picked up from `CONTINUE_HERE.md`
with eight pages finished and six rendering a "Specified, not yet built"
placeholder. All six are now built. The application is complete and has not been
deployed.

## What changed

Six page components and six CSS modules, and nothing else. No data file, no
domain type, no provider, no primitive, no token and no route was touched, which
is worth recording because it is the actual finding of the session: the
foundation laid in the first pass was correct enough that six screens could be
rendered over it without a single change underneath.

| Route | Page | What it argues |
| --- | --- | --- |
| `/calendar` | CapacityPage | 1 lane per 20 guests against a published floor of 26. The 300-guest Corporate All Access Pass takes 58% of the floor. A fit checker that answers in a sentence. |
| `/objections` | ObjectionsPage | Seven objections in the buyer's own voice, with the answer, what the answer costs, and a disposition the user can set. |
| `/sent` | SentPage | The outbox, and the structural reason nothing can be sent. |
| `/coaching` | CoachingPage | The ramp, the two call frames, what gets coached against what gets managed, the weekly one-to-one. |
| `/method` | MethodPage | Every formula, every source, and the row that was removed. |
| `/quote/:prospectId` | QuotePage | One organisation, one event, one action, outside the shell. |

## Decisions worth carrying forward

**The capacity page reads the live book, not the seed file.** `dayLoads()` is fed
from `useBook()`, so a guest count edited on the Book page moves utilisation here
immediately. A capacity chart computed off a frozen file is a capacity chart that
lies the first time somebody uses the application.

**Soft holds are listed separately from utilisation.** A date somebody is sitting
on with nothing countersigned does not consume a lane in any figure, and in the
building it absolutely blocks the evening. Both are true, so both are on screen,
in two places rather than one averaged one.

**Blocking counts on the objection register are derived and labelled.** The
"organisations it can block" figure is exposure across the objection's lanes and
is badged modeled; replies that actually named the objection are badged
illustrative and counted separately. The page says out loud that the first is
exposure and the second is evidence.

**The outbox splits seeded rows from live ones.** Rows written this session sit
above the five that arrived with the build, so the log never takes credit for
work the reader did not do. The empty state is the first thing most readers meet,
so it was designed as the main problem of the page rather than as a fallback.

**The method page derives every count at render.** Nothing on it is typed. It
reads `PROSPECTS`, `EMAILABLE`, `DOOR_ONLY`, the package lists, the seeds and the
venue floor, so the page cannot go stale against its own data.

## Traps found

**Full-page screenshots capture one viewport.** `AppShell` is `height: 100dvh`
with `overflow: hidden` and an inner scroll region, so Playwright's `fullPage`
flag returns the first screen and a lot of empty ground. `scripts/shot-all-routes.mjs`
measures the real scroller, grows the viewport to it and takes an ordinary shot.
Anyone screenshotting this app later needs that, or they will proof a blank page
and believe it.

**Playwright resolves a browser this container does not have.** Launch with
`executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"`. Do not run
`npx playwright install`.

**A naive horizontal-overflow check flags every page.** Elements clipping with
`text-overflow: ellipsis` have `scrollWidth > clientWidth` by design. Only the
document scrolling sideways is a defect; check `documentElement`, not `*`.

## Verification actually run

- `npx tsc -b --force` clean from a cleared build info.
- `npm run build` passes; 81 route stubs emitted.
- All 14 routes plus the unknown-quote-id case rendered at 1440 and at 380, with
  page errors and console errors collected. Zero problems, zero placeholders,
  zero horizontal overflow.
- Em dash, en dash and arrow scan across the six new files: zero.

## Known, and deliberately not fixed

`fitCheck()` in `domain/selectors/capacity.ts` prints the raw ISO date inside its
sentence ("free on 2026-12-12") while the rest of the screen formats dates as
"12 Dec 2026". It is a shared selector owned by the first pass and changing it
was out of scope for a rendering session. One line, worth doing next time
somebody is in that file.

Six inherited files carry em dashes in their code comments (`types.ts`,
`capacity.ts`, `book.ts`, `prospectStatus.ts`, `tokens.css`, `base.css`). None
reaches a rendered string. Left alone rather than swept mid-session.

## Next steps

1. Read the preview. The six new pages are the ones to judge.
2. If approved: `npm run build`, copy `dist/` to `njs-site/me/scout/`, push.
   Repo `jsongau/NJS`, Vercel project `njs`, path `/me/scout`. Confirm the git
   remote before pushing. Nothing has touched the site repo yet.
3. The `/me/scout` path must exist before the link goes anywhere. A 404 on a
   work sample link is worse than no link.
