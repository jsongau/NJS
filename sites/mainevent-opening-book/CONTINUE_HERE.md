# The Opening Book. Continuation brief.

**This file is the current state of the project. It replaces every earlier version of itself.
If another document in this folder disagrees with this one, this one is right.**

Last verified against the source and against the live site on 17 August 2026.

---

## WHAT THIS IS

An independent work sample built by Nathan J. Song for a **Sales Manager** application at
**Main Event Brea**, 245 W Birch Street, Brea CA 92821. A Dave and Buster's company.

The central fact the whole thing is built on: **Main Event Brea is not open yet.** mainevent.com
publishes the address, the phone number, "more than 26 lanes", laser tag, Gravity Ropes, over 100
games, private party rooms and dedicated meeting space, and a coming soon banner. It publishes no
hours and no opening date.

So there is no client base, no walk-in traffic, no CRM history. The job posting's first daily
responsibility is outbound lead generating activity outside the building: tabling, networking
events, go-sees. This application is the tool for exactly that. Build the book before the doors
open.

It is unaffiliated. No Main Event logo, wordmark or trade dress appears anywhere in it and none
ever will.

---

## STATUS: LIVE, FACT CHECKED, MOBILE OPTIMISED

- Published at **https://nathanjsong.com/me**
- The door, which is the address that goes in a job application, is **https://nathanjsong.com/me/start**
- Every screen has a written explanation at the same address with a `/rationale` prefix
- 46 false or unsupported claims were found in the rationale text by a fact check pass and every
  one of them was deleted or corrected. Do not reintroduce a competitor price, a market rate, a
  job title or an industry statistic without a source you can name in the same sentence.

---

## WHERE THE CODE LIVES, AND THE ONE RELATIONSHIP THAT MATTERS

| Thing | Path |
| --- | --- |
| Source | `/Users/kytlegacy/Documents/Resume and CV/njs-site/sites/mainevent-opening-book` |
| Built output, committed and served | `/Users/kytlegacy/Documents/Resume and CV/njs-site/me` |
| GitHub | `https://github.com/jsongau/NJS.git`, branch `main` |
| Vercel project | `njs` |

`njs-site` is a **zero build static repo**. Vercel serves whatever HTML and CSS is committed under
`me/`. It does not run the Vite build. That means:

**Editing the source changes nothing on the live site until you build it and copy the output
across.** Nothing in the repo enforces the relationship. A person can edit the source, commit it,
push, and ship a site built from a different version of it, and every other check passes. The
failure is silent and it looks exactly like the code being right.

`scripts/check-build-is-committed.mjs` exists because of that. It rebuilds the source and compares
the result against `me/` file by file and byte for byte. Vite hashes asset filenames off content,
so identical source produces identical filenames and any difference in either direction is a real
difference. **Run it before every push.**

### The build and ship sequence

```
cd "/Users/kytlegacy/Documents/Resume and CV/njs-site/sites/mainevent-opening-book"
npm run build
node scripts/check-post-build.mjs dist 297
rm -rf ../../me
cp -R dist ../../me
node scripts/check-build-is-committed.mjs dist ../../me
```

Then, and only then:

```
cd "/Users/kytlegacy/Documents/Resume and CV/njs-site"
git status --short me sites/mainevent-opening-book
git add me sites/mainevent-opening-book
git commit -m "me: describe the change"
git push origin main
```

**Never run `git add -A` in this repo.** Other projects live in it, `samyang/` in particular, and
they routinely carry uncommitted in-progress work from other sessions. Scope every add to `me` and
`sites/mainevent-opening-book`.

`base` in `vite.config.ts` is `/me/` and `basename` in `main.tsx` is `/me`. **They are a pair.**
Changing one without the other breaks every asset URL or every route, depending which one you
changed.

---

## THE NUMBERS OF RECORD, AS OF TODAY

Every one of these is derived from the source, not typed by hand. If you change the data, these
change, and the build guards will tell you.

| Count | Value | Where it comes from |
| --- | --- | --- |
| Organisations in the trade area | **211** | `id:` lines in `src/data/prospects.ts` |
| Rationale screens | **28** | `path:` entries across `src/data/rationale/*.ts` |
| Typed console routes | **28** | the `ROUTES` array in `scripts/emit-route-stubs.mjs` |
| Leagues | **30** | the `LEAGUES` block in `src/data/leagues.ts` |
| Route stubs emitted | **297** | 28 console + 28 rationale + 211 quote + 30 league |
| `index.html` files in `me/` | **298** | the 297 stubs plus the root |

The three research passes behind the 211 are described on `/method` and computed in
`src/pages/MethodPage.tsx`. Pass one is the Google Places API, 69 organisations, each carrying its
place id. Pass two is hand research dated 11 August 2026. Pass three is industry segmentation
dated 14 August 2026. The page derives each set with a date regex over the source rather than
storing a count that can drift.

---

## THE ARCHITECTURE, IN THE FOUR IDEAS THAT EXPLAIN IT

**1. Rationale is a mode, not a page.** A console screen at `/lanes` is explained at
`/rationale/lanes`, and the desk at `/` is explained at `/rationale`. Four pure string functions in
`src/data/rationale/index.ts` do all of it: `toRationale`, `toConsole`, `isRationalePath`,
`normalisePath`. There is no lookup table to fall out of step. The side rail builds every link by
running its own unchanged `to` value through `toRationale` when the mode is on, which is why the
rail is provably the same rail in both modes.

There is a real bug fixed here worth understanding before you touch `SideRail.tsx`. The rail reads
the current path to decide which second-level filters to show. In rationale mode the path starts
with `/rationale`, so a naive read matched nothing and the entire second level silently vanished.
The fix is to normalise to the console path first and key every comparison off that:

```ts
const onRationale = isRationalePath(normalisePath(location.pathname));
const railHref = (to: string) => (onRationale ? toRationale(to) : to);
const consoleHere = toConsole(normalisePath(location.pathname));
```

**2. Route stubs, because `cleanUrls` fights SPA rewrites.** Vercel normalises a rewrite
destination of `/me/index.html` back to `/me`, so the rewrite never resolves and every deep link
404s. Verified in production, not assumed. Rather than fight the platform,
`scripts/emit-route-stubs.mjs` writes a real `index.html` at every route. The filesystem answers
the request and the router takes over on load. **Adding a route to `App.tsx` means adding it to
`ROUTES` in that script.** That coupling is the cost of the approach. The script fails the build on
a duplicate route rather than writing the same file twice and reporting a count nobody can
reconcile.

**3. `data-sec`, one attribute, 23 section identities.** `src/styles/sections.css` scopes `--sec`,
`--sec-ink` and `--sec-glow` to `[data-sec]`. A component rendered outside the shell, `StartPage`
and `QuotePage` both are, gets **no section tokens at all** unless you give it one. `StartPage`
carries `data-sec="none"` for precisely that reason. Its call to action background rendered as
literally nothing until that attribute went on.

**4. Provenance is a column, not a footnote.** Every commercial number renders through
`ProvenanceBadge` / `Figure` / `WithheldFigure`. The six values are `public`, `observed`,
`modeled`, `user_input`, `illustrative`, `withheld`. **`withheld` is the load bearing one**: it
means Main Event deliberately does not publish that figure, and it renders as the sentence "Main
Event does not publish this", never as a number. The whole competitor register argument rests on
it. Six of six local venues publish no group price. That is the finding.

---

## NON-NEGOTIABLE RULES

1. **No em dashes, no en dashes, no arrows in any human readable text.** Not in UI copy, not in
   code comments. Use a comma, a full stop or a semicolon. Date ranges use the word "to". This is
   checked with a grep. Arrow functions in actual TypeScript are obviously fine.
2. **Colour is never the only signal.** Jay is colourblind. Every status carries a glyph and a word
   alongside any colour. A legend keyed only by swatch is a bug. Every bar carries its number.
3. **Every commercial number carries provenance.** See idea four above.
4. **Invent nothing about Main Event.** Every package name, price, guest minimum, day part
   restriction and attraction in `data/packages.ts` and `data/venue.ts` came off mainevent.com on
   11 August 2026 and carries a source URL. If you need a figure that is not there, say plainly on
   screen that it is not published.
5. **No invented people.** Roles and titles only. Never a made up human name.
6. **British-ish spelling in prose**, matching the codebase: colour, behaviour, organisation,
   neighbourhood, recognised, utilisation. `modeled` stays American only because it is a type
   literal.
7. **Demo mode is structural.** There is no email transport anywhere in the dependency tree. The
   outbox reducer forces every recipient to `DEMO_RECIPIENT`. That forcing is the guarantee, not a
   setting.
8. **Never hardcode a list of lanes.** Iterate `LANE_ORDER`, read `LANE_META[lane]`.
9. **Use the CSS custom properties in `tokens.css`, never a raw hex.**

`AGENT_BRIEF.md` in this folder carries the fuller version of the rules above plus the complete
import contract, and all of that still stands. Its **paths, its URL and its counts are historical**
and should be ignored: it predates the move out of `/tmp/work`, it says eight lanes when there are
nine, and it says the target URL is `/me/scout` when it is `/me`.

---

## THE CODE COMMENT CULTURE

This is the single most distinctive thing about the codebase and it is deliberate, because the
hiring manager may read the source. Files open with a block comment explaining **why the file
exists and what failure it prevents**, in confident plain prose, often several paragraphs.
Non-obvious decisions get their own comment naming the alternative that was rejected and why. Read
`domain/types.ts`, `domain/lanes.ts` and `scripts/emit-route-stubs.mjs` and match that register
precisely. Never write `// set the state`. Write comments a hiring manager would stop and read.

---

## VERIFICATION. THE HARD LESSON OF THIS PROJECT.

Playwright is available. **Launch with `executablePath: '/opt/pw-browsers/chromium'`. Never run
`npx playwright install`.**

| Script | What it proves |
| --- | --- |
| `check-post-build.mjs` | every route has a real file, and no whiskey images came back |
| `check-build-is-committed.mjs` | the committed site is this source, built, byte for byte |
| `proof-both-modes.mjs` | the rail is identical in console mode and rationale mode |
| `proof-against-live.mjs` | the new build is not a regression against what is deployed |
| `audit-mobile.mjs` | tap targets, overflow, font size at 320, 390 and 768 |
| `diff-screen-text.mjs` | what text changed between two builds |

**Serve the built output at `/me`, not at the filesystem root.** The first proof harness mounted
`dist` at `/` and every asset 404ed, which the harness cheerfully reported as the page being
broken.

**Now the lesson, because it cost more time than any bug in the code.** Five separate times a
check reported a defect the application did not have:

- A rail selector of `aside a, nav[aria-label] a` matched 60 links on one page. The real selector
  is `nav[aria-label="Every screen in The Opening Book"]`.
- A set based diff of screen text reported changes that were only reorderings, because a set
  cannot see a multiset.
- 168 "clipped text" findings were `visually-hidden` spans, which are supposed to be clipped.
- 64 "too small" tap targets were inline prose links, which WCAG 2.5.8 explicitly exempts.
- A two column PDF extraction reported a phrase missing that was plainly on the page, because
  `pdfplumber` reads across columns and interleaved the sidebar into the main column.

The cause was identical every time. **The measurement was built without asking what it could not
see.** Before you trust a check that reports a defect, ask what class of correct thing it would
also flag, and write the exemption into the script with the reasoning beside it. A check you do not
trust is worse than no check, because you will start ignoring it.

Two real defects the mobile pass did find, both invisible to inspection and both caught by
measuring:

- The mega nav was **clipping, not scrolling**. 621px of content in a 390px bar. Rationale mode had
  18 visible pixels at 320. The strip needs 888px, so the breakpoint is 899, not the 560 it was
  first set to.
- The iOS zoom fix **lost a CSS specificity tie**. `:root select` is (0,1,1) and only ties
  `.page textarea`; ties resolve by source order and CSS modules load after `tokens.css`.
  `html:root select` is (0,1,2) and wins.

---

## OPEN ITEMS

1. **CI is written and not landed.** `.github/workflows/opening-book.yml` sits **untracked** in the
   repo root. Pushing it failed: GitHub refuses to let a Personal Access Token create or update a
   workflow file without the `workflow` scope. Either mint a PAT with that scope or add the file
   through the GitHub web UI.
2. **`/segments` renders 17 em and en dashes** inside two sourced UCI Health organisation names.
   They are inside real names, so correcting them would misquote a source. Jay's call: leave them
   or rename with a footnote.
3. **`vercel.json` sets `X-Robots-Tag` for `/tawa` but not for `/me`.** Decide whether the work
   sample should be indexed. It is a job application link, so probably yes, but it is currently
   indexable by omission rather than by decision.
4. **`_to_delete/` in the repo root** needs deleting by Jay from his own machine.

---

## SESSION NOTES, IN ORDER

Each is worth reading before changing the code it covers.

- `docs/2026-08-06-store-order-portal.md`
- `docs/2026-08-07-real-roster-and-on-premise.md`
- `docs/2026-08-11-expanded-map-and-local-lane.md`
- `docs/2026-08-11-final-six-pages.md`
- `docs/2026-08-13-theme-nav-and-supply-side.md`
- `docs/2026-08-14-industry-segmentation.md`

Write a new dated file in `docs/` for any session with real decisions, debugging or new
architecture, and commit it with the work.
