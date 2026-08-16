# 2026-08-16 — Rationale as a mode, and the three defects a two-mode walk found

`me` / The Opening Book. Continues `docs/session-2026-08-15-opening-book-source.md`.

## What changed

The console is unchanged. What is new is that every screen now has an
explanation at its own address with `/rationale` in front of it, and the rail
is the same rail in both readings: same groups, same order, same labels, same
counts, same section colours. The only thing the mode changes is where a row
points.

Twenty seven screens, two hundred and five sections. Plus `/sellthrough` (48
movement records), `/spend` extended with fifteen orders under control, nine
mechanical term checks and eight matters of judgement, and the anime gap
written onto `/partners`.

## Decisions made

**The lookup key is the console path, not a slug of its own.** A screen and its
explanation are one destination addressed twice, so they share one key. A second
naming scheme would be a second thing to keep in step with the rail, and the
rail is what changes most often.

**The explanation wears the screen's colour.** `sectionFor` strips the mode
prefix before resolving, so the explanation of Lanes is drawn in Lanes' identity
rather than in one hue for all twenty seven. Rationale is a second reading of
the same places, not a place of its own.

**A missing entry says so.** A rationale address with nothing written renders a
panel naming the gap rather than an empty page or a redirect. A mode that
quietly sends you somewhere else when it has nothing to say is a mode you cannot
trust when it does.

**Desk and Book left the mega nav.** The rule now is: the bar is what is waiting
for you, the rail is where things are, and nothing appears in both. Both are one
press away in the rail. This is the one visible change to chrome that was
already approved, so it is written down here rather than buried in a diff.

## Decisions rejected

**One essay at one address.** Three attempts went that way. A reader looking at
the capacity chart and wondering why it counts bowling lanes had to leave and
then search. An explanation not attached to the thing it explains is a document,
and there was already a document.

**Rendering the explanation outside the shell.** Shipped once as `5aff888` and
rejected on sight. A bare column of prose reads as a different website rather
than as this one explaining itself. The reader here is a hiring manager looking
at the instrument and asking why it is built like this, so the instrument stays
around them.

**A general purpose mode switch on the Maps takeover.** Only the console side of
Maps is a takeover; `/rationale/map` is an ordinary railed document. The traffic
is one way, so a bidirectional switch would be machinery for a case that cannot
occur.

## Traps discovered

**A rail claim you do not measure is a rail claim you do not have.** Walking all
twenty eight screens twice and comparing the two rails row by row found three
things eyes had not:

1. The rail's second level, the five queue buckets under Requests, keyed on the
   raw `location.pathname`, so it appeared in Console and vanished in Rationale.
   `sectionFor` already solved exactly this one file over. Fixed by computing
   the console path once at the top of the component.
2. Those bucket links were the only rail rows not passing through `railHref`,
   so pressing one from Rationale dropped the reader back into Console.
3. `/map` renders `FullBleedRoute`, which unmounts the bar carrying the mode
   switch, making it the one screen whose explanation could not be reached from
   it. It now carries the link in its own chrome band beside Back.

**A shadowed variable inside a `.map`.** The row loop recomputed `here` from the
raw pathname, shadowing the mode-aware one above it. The reading at the top can
be correct and the row still be wrong.

**The check that lied in my favour.** The first harness selected `aside a,
nav[aria-label] a` as "the rail" and swept up in-page links, reporting sixty
rows on Today against forty nine on its explanation. It reported failures on
screens that were fine and would have reported passes on screens that were not.
Address the real element; do not pattern-match at what a rail looks like.

**A route listed twice.** `rationale` was both typed into `ROUTES` and derived
by `rationalePaths()`, so the emitted count disagreed with `find dist -name
index.html` by one for no visible reason. The emitter now fails the build on a
duplicate.

**git in the bridged folder cannot unlink.** Every git command that writes the
index leaves `.git/index.lock` behind, and the next command refuses to run. The
working pattern is one git command per shell, with the stale lock moved aside
first. Worth knowing before debugging a phantom "another git process".

## Standing checks, still in force

- `find me -name '*.webp' | wc -l` must be `0`. The whiskey images have come
  back twice from `public/assets/products/` in the source.
- `find me -name index.html | wc -l` must equal the emitted stub count plus one.
  Currently 296 + 1 = 297.

## Next steps

1. Push. Nothing in this repo has reached `origin/main` yet; the resume still
   does not link to the artefact, which is the actual constraint on the
   application rather than anything in the build.
2. `/segments` renders 17 em and en dashes, all inside two sourced organisation
   names. The no-dash rule and the never-alter-a-sourced-fact rule conflict, and
   the call is Jay's.
3. `vercel.json` has an `X-Robots-Tag` for `/tawa` and none for `/me`.
4. The Grain source is still committed nowhere. Agreed destination is its own
   public repo, `jsongau/samyang-grain`.
5. The 27 rationale screens have not been fact-checked line by line against the
   source they describe.
