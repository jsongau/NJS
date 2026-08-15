# 15 Aug 2026: the Opening Book gets its source back, and a Rationale page

## What changed

Four commits on `main`, none pushed at time of writing.

| Commit | What |
| --- | --- |
| `6218b8c` | Removed 28 Ole Smoky product photographs from `me/` and `sam/` |
| `d7ec5ef` | Put `docs/mainevent/` under version control, 1,713 lines, previously untracked |
| `1c37350` | Committed the Opening Book source, 355 files, at `sites/mainevent-opening-book/` |
| `5aff888` | Added `/me/rationale` and rebuilt the site |

## The finding that started it

`njs-site` had been serving `nathanjsong.com/me` since the first commit and
had never held the code that produced it. Only the compiled bundle was in the
repository. The same was true of `/sam`. The research behind `/me`,
`docs/mainevent/`, was sitting untracked on one laptop with no history and no
copy: three files, 201 KB, including 1,001 lines of Brea trade-area business
intelligence with a 38 item could-not-verify section.

Before the source turned up, the fallback was to parse the production bundle
and recover the ten datasets out of it, which worked: Vite inlines a static
dataset rather than fetching it, so 211 prospect records were sitting in
`me/assets/index-*.js` as plain object literals. That folder has since been
deleted. Reading data out of a build artefact was the right answer while the
source was missing and the wrong one the moment it was not, and leaving it in
the repo would have made it look like a supported path.

## The source is verified, not assumed

Recovered intact from the container it was written in. Before committing:

```
npm ci && npm run build
```

reproduced `assets/index-CLfv25EY.js`, `assets/index-Cq-zq4tx.css`,
`assets/leaflet-DSdzSHQu.js` and `index.html` matching the deployed bytes by
**sha256**, with the same 268 route stubs and 211 quote pages. That is the
only acceptable proof that a recovered tree is the tree that built what is
live. Two copies existed in that container and only one was canonical: the
stale one has an older board, and the way to tell them apart is **211 prospect
rows plus `src/pages/SegmentsPage.tsx` present**.

Archived zips: `Resume and CV/_incoming/opening-book-SOURCE.zip` and
`the-grain-SOURCE.zip`.

## The trap, which fired twice

The fourteen whiskey photographs lived in `public/assets/products/` in the
source, not only in the build output. Removing them from `me/` alone would
have been undone by the next build.

It then actually happened. The rebuild for `/rationale` ran from a working
copy whose `public/` had not been cleaned, and put all fourteen back into
`me/assets/products`. Two commits after removing them, and after writing down
that fixing an artefact instead of its source is how the fix gets undone. A
file count check caught it, which is the argument for asserting counts after
a build rather than eyeballing a directory.

**Rule: after any `/me` rebuild, `find me -name '*.webp' | wc -l` must be 0
and `find me -name index.html | wc -l` must equal stubs plus one.**

## /rationale, and why it is shaped the way it is

Method already answers "is this figure right" and carries every formula and
source. Nothing answered "why is the thing shaped like this at all": why the
desk ranks on reachability before size, why the two ledgers never add
together, why a fundraiser night is the opening move. Those are decisions
rather than calculations and burying them in a reference page hides an
argument inside a lookup table.

**Decisions made:**

- **Outside `AppShell`**, beside the customer facing quote. It is read rather
  than operated, and Jay's constraint was that the dashboard does not change.
  The entire diff against the application is one route in `App.tsx` and one
  string in `emit-route-stubs.mjs`. No rail row, no strip key, no section
  token, no count, no existing screen touched.
- **`data-sec="method"`** rather than a hue of its own, on the standing
  precedent that puts Segments under Lanes, the cup under Leagues, and pay and
  the district report under the floor. `theme_cabinet.py` solves section hues
  around one wheel and the adjacency floor does not survive another entry.
- **Two named modes, not a back link.** A back link says the page is a detour
  off the console. It is not; the console is what the job produces and this is
  why it was produced that way.
- **Every figure computed from `src/data`.** Nothing typed as a literal. A
  page arguing for provenance discipline that hardcodes its own totals is
  arguing against itself, and the counts would drift the first time a prospect
  was added.

**Rejected:** a standalone static page at `me/rationale/index.html`. It was
built first, as `mainevent-rationale-preview-v1.html`, because without the
source a route could not be added. It works and Vercel would serve it, but the
toggle would exist on one page only and the styling would be a copy of the
app's tokens rather than the app's actual CSS. Superseded the moment the
source arrived.

## Verified before commit

`tsc -b` clean, 268 stubs emitted, `/me/rationale` resolves cold, both mode
controls exactly 44 px, no horizontal overflow at 360 px, ground resolves
correctly in dark and light, `data-sec` applied, nine lane rows rendered from
the seed, figures reading 211 / 9 / 93 / 210, deployed checksums matching the
build.

## Exact next steps

1. **Push.** Four commits waiting. `git push origin main` from Terminal; the
   device bridge has no network and the cloud has no credentials.
2. **The Grain.** `the-grain-SOURCE.zip`, 479 files including the full dbt
   Core project, 58 models, 72 SQL files, 26 CSV seeds, is on disk and
   committed nowhere. Agreed destination is its own public repo,
   `jsongau/samyang-grain`, so a data-architect reviewer can clone and run it.
   Confirm the remote before creating anything.
3. **`X-Robots-Tag` for `/me`** in `vercel.json`, matching the block `/tawa`
   already has. The meta noindex covers it; the header is belt and braces.
4. **The resume still does not link to any of this.**
   `mainevent-sales-resume-preview-v17.html` has zero mentions of Main Event,
   Brea, or nathanjsong.com/me. Highest-leverage ten minutes in the project.

## Repository hygiene note

Git in the mounted folder leaves `.git/index.lock` and `.git/HEAD.lock`
behind after every operation because the device bridge cannot unlink. The
operation itself succeeds. Move both locks into `_to_delete/locks/` before and
after each git command. There are currently 112 `tmp_obj_*` files reported as
garbage by `git count-objects -v`; harmless, and they clear with a `git gc`
run from a real Terminal.
