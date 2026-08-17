# The Opening Book. Main Event Brea. Continuation brief.

This is a job-application work sample for a **Sales Manager** role at **Main Event Brea**
(245 W Birch St, Brea CA). It is a fork of Jay's Ole Smoky territory app. Target deploy URL:
**nathanjsong.com/me/scout**.

## THE ONE INSIGHT THE WHOLE THING IS BUILT ON

Main Event Brea IS NOT OPEN YET (mainevent.com lists it "coming soon", no hours, no date).
So the job is not "grow a book", it is "BUILD a book before the doors open" which is exactly
the job posting's first bullet: outbound tabling, networking, go-sees. The app is "The Opening
Book": a 90-day pre-opening pipeline for the Brea trade area.

## STATUS: THE APPLICATION IS COMPLETE AND NOT DEPLOYED

All 14 routes are built. There are no placeholders left. An independent accessibility and UX
audit was run in a browser against the production build and is in `AUDIT_ux_accessibility.md`;
it confirmed eight findings and a fix pass was in flight when this brief was last written, so
**check the audit against a browser before assuming any of it is done.**

**Data layer (all real, all sourced 11 Aug 2026):**
- `src/data/prospects.ts`: **102 real Brea-area organisations**, from two sources, labelled row
  by row. The first 69 came from the Google Places API and each carries its place id. The next
  33 are local retail, food, auto service and small employers, researched by reading each
  organisation's own page or its landlord's tenant directory, then geocoded through the US
  Census Bureau geocoder. **Those 33 carry no place id and the field is absent, not invented.**
  35 of the 102 publish an email, 22 are reachable only through a contact form, 45 have no
  written door at all.
- The same file exports **`EXCLUDED_FROM_BOARD`**: nine organisations found, verified as real,
  and deliberately kept off the board. Seven the Census geocoder could not match to a street,
  two where Census returned a different street from the one the business publishes. Same rule
  that removed Round One Entertainment in the first pass. They render in full on `/method`.
- `src/data/packages.ts`: real Main Event packages, priced ones vs gated-behind-sales-manager
  ones. "withheld" provenance = Main Event deliberately doesn't publish it = the job.
- `src/data/venue.ts`: the venue, pre-opening periods (weeks-to-open), offers, contact routes.
- `src/data/prospectStatus.ts`: seeded fact table. 86 of the 102 have never been touched, which
  is the honest pre-opening reality; 7 are live conversations.
- `src/data/book.ts`: 2 seed contracts, 10 activity lines, 6 replies (incl. losses/silence).
- `src/data/objections.ts`: objection register.
- `src/domain/types.ts`, `lanes.ts`, `vocabulary.ts`: domain model + **the nine lanes**. The
  ninth is `local-retail-food`, occasion class `discretionary`, and it sits last in `LANE_ORDER`
  on purpose. **Never hardcode a list of lanes.** Iterate `LANE_ORDER`, read `LANE_META[lane]`.
- `src/domain/selectors/desk.ts` (ranking), `capacity.ts` (1-lane-per-20-guests arithmetic),
  `mapBoard.ts` (every figure the map board shows, all derived at render).
- State: `PipelineProvider` (carries `SET_LANES`, which replaces the whole lane filter in one
  dispatch), `BookProvider` (TWO LEDGERS: revenue vs activity, never summed), `ObjectionProvider`,
  `OutboxProvider`.
- Primitives: `ProvenanceBadge`, `LaneChip`, `StatusChip`, `PinMark`, `FamilyChip`, `PackageGlyph`,
  `Wordmark`. `PinMark` is the brand mark, redrawn to hold up at 38px, and it carries no Main
  Event logo, wordmark or trade dress and never will. Tokens are cool-paper + amber in
  `styles/tokens.css`.

**All 14 pages built:**

| Route | Page |
| --- | --- |
| `/` | DeskPage, the ranked call list plus the prospect drawer |
| `/map` | TradeAreaPage, a thin wrapper over `MapBoard`: a three pane board with a seven figure stat strip, a ranked left list of all 102 with search and lane chips, a Leaflet map with rings, clusters and a broken venue mark, a floating legend and offers card, and a tabbed right detail pane that opens the compose modal. The occasion segment on the left pane writes `SET_LANES` to `PipelineProvider`, so filtering here also filters the desk. Deep links as `/map?prospect=<id>` |
| `/lanes` | LaneBoardPage, the nine lanes split by occasion class |
| `/packages` | PackagesPage, the pattern in the nulls |
| `/book` | BookPage, the two ledgers |
| `/book/week` | WeekSheetPage, the printable outbound sheet |
| `/replies` | RepliesPage, including the silence and the losses |
| `/field` | FieldPage, outside the building |
| `/calendar` | CapacityPage, the fit checker and the lane arithmetic |
| `/objections` | ObjectionsPage, the objection register |
| `/sent` | SentPage, the outbox |
| `/coaching` | CoachingPage, how the floor gets run |
| `/method` | MethodPage, every formula, every source, and both exclusion lists |
| `/quote/:prospectId` | QuotePage, prospect-facing, outside the shell |

The compose modal is `src/components/email/EmailComposeModal.tsx`, opened from the map board and
nowhere else. Four intents: first touch, featured promo, hold a date, write it yourself. It can
attach the organisation's own `/quote/:id` link. Seven new templates live in
`src/lib/email/templates.ts`. It cannot send anything: the outbox reducer forces every recipient
to `DEMO_RECIPIENT`, and that forcing is the no-transport guarantee.

Session notes, in order, and each one worth reading before changing the code it covers:
`docs/2026-08-11-final-six-pages.md` for the last six pages, and
`docs/2026-08-11-expanded-map-and-local-lane.md` for the map board, the ninth lane, the 33 new
organisations and the audit.

## BUILD / PREVIEW / PROOF

```
npm install
npx tsc -b                                                   # must be clean
npm run build                                                # dist/ plus route stubs
node scripts/shot-all-routes.mjs                             # every route, 1440 and 380, errors collected
VITE_PREVIEW=1 npx vite build --outDir dist-preview
node scripts/build-preview.mjs dist-preview preview.html      # single-file preview for Downloads
```

Four things about proofing this app that will each waste an hour if rediscovered the hard way:

- Playwright must be launched with
  `executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"`. Do not run
  `npx playwright install`.
- `fullPage` screenshots capture one viewport, because `AppShell` is `height: 100dvh; overflow:
  hidden` with an inner scroll region. Measure the real scroller and grow the viewport instead.
- A throwaway proof script must live under `scripts/`. One at `/tmp` cannot resolve `playwright`,
  because resolution walks up from the script's own directory.
- `tokens.css` has an `!important` on `.leaflet-pane`, which will flatten any custom Leaflet pane
  you add with its own z-index.

## DEPLOY (NOT DONE)

Deploy target: repo `jsongau/NJS`, Vercel project `njs`, path `/me/scout`. Build base is set to
`/me/scout/` in `vite.config.ts` and `main.tsx` basename. `scripts/emit-route-stubs.mjs` writes an
`index.html` per route (including `/quote/:id` per prospect) because njs-site is a zero-build
static repo.

**NOTHING HAS BEEN DEPLOYED. Nothing has touched the njs-site repo or `/me/scout`.** Confirm the
git remote before any push. The `/me/scout` path must exist before the link goes anywhere; a 404
on a work sample link is worse than no link.

## SMALL THINGS LEFT

- **Read `AUDIT_ux_accessibility.md` first.** Its four highest findings are the `line-height: 0`
  that collapses the desk's lane chip labels to zero height, the `--text-3` grey that fails 4.5:1
  as small text on thirteen routes, the coarse-pointer rule in `base.css` that leaves the main nav
  29px tall on a phone, and the stale counts in the desk's opening sentence ("sixty-nine" over a
  card reading 102, "All eight lanes" against nine). A fix pass was running when this was written.
  Verify in a browser.
- Run the greyscale test once per screen before this goes in front of anybody.
- The seven organisations the Census geocoder could not match are off the board entirely. Running
  those seven through the same Google Places call that produced the first 69 rows would put them
  back and would give the whole Census cohort the place id it lacks.
- `fitCheck()` in `domain/selectors/capacity.ts` prints a raw ISO date inside its sentence while
  the rest of the app formats dates as "12 Dec 2026". One line.
- Six inherited files carry em dashes in code comments only, never in rendered strings:
  `types.ts`, `capacity.ts`, `book.ts`, `prospectStatus.ts`, `tokens.css`, `base.css`.
- The JS bundle is large before gzip. Leaflet is already split out; the map route could be lazily
  imported if that ever matters.
