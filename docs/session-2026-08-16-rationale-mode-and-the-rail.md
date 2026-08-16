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

---

# 2026-08-16, part two — the fact-check, and what it cost

## What happened

Six checkers read every claim in the twenty seven explanation screens
against the code and data each one describes. **Forty six findings: 28
wrong, 18 unsupported.** All forty six fixed. Then a sweep of the rest of
the codebase found **128 more** stale or false figures across 70 files,
including copy a reader sees on screen.

## The rule that was applied, and it is the one worth keeping

**An unsupported claim about the real world is deleted, not reworded.** No
substitute figure from memory, no going to the web to find something that
fits the sentence already written. A shorter true paragraph beats a longer
plausible one, every time.

A wrong number is corrected to whatever the code actually produces,
**verified by running it**. A matching code comment is not verification:
this codebase had roughly eighty comments confidently repeating a figure
that had been wrong for days.

## The worst of what was in there

- **Chuck E. Cheese at $9.99 a child, and Topgolf publishing a per head
  figure.** Neither company appears anywhere in the research. The claim
  also contradicted the competitor register's own headline finding, which
  is that six of six publish no group price.
- **A fundraiser rate table**: Urban Air 20, Sky Zone 20, Stars and
  Strikes 15, Chuck E. Cheese 25 above $2,500 through a local Field
  Marketing Specialist. Four real competitors, four invented rates, one
  invented job title at a named company. Only the Main Event 20 per cent
  was ever sourced.
- **Main Event's Brea page running Tempe, Arizona body copy.** No record.
- **A Dave and Buster's 10-K**, special events at 9.8 per cent of FY2018
  revenue. No record.
- **A thirty eight item could-not-verify list**, asserted twice. The real
  list has nine items.
- **Booking pace of 36 days and October as the highest inquiry month.** No
  record, and the research file says close to the opposite.

## The pattern, and it is the lesson

Every one of the eighteen unsupported claims was **plausible, specific and
confidently phrased**. That is what made them dangerous. None of them
looked like a guess. They looked like research.

The wrong-number findings share one cause: **the dataset grew from 102
organisations to 211 mid-build**, and prose written against the old size
was never revisited. Nothing failed. Nothing warned. The number simply
stopped being true and every sentence around it kept its confident tone.

## Method was the worst place for it

`/method` is the screen whose entire subject is where the numbers came
from, and it said the board was gathered in two research passes. It was
three. Behind the copy, `censusPass` was defined as every row with no
place id, which silently merged the real 33-row second pass with the
109-row third, so the second-pass email ratio it printed described a
cohort that does not exist.

Fixed by splitting on the retrieval date each row already carries: 69
Places rows on 11 August, 33 hand-researched rows on 11 August, 109
industry rows on 14 August. The page now prints `69 and 33 and 109 is
211` against a board counted independently at 211, so a future divergence
shows up on screen rather than hiding.

## Also shipped

- **`/start`**, a door. Outside the shell on the same precedent as the
  quote letter: addressed to a visitor rather than to somebody working a
  desk. This is the URL that goes in an application.
- **Open Graph tags and a preview card.** This address travels by being
  pasted, not by being searched, so the noindex directive and the preview
  tags are not in tension. The disclaimer is printed on the image as well
  as in the description, because a description truncates and an image does
  not.
- **Two build checks** in `scripts/`: `check-build-is-committed.mjs`
  asserts the committed `me/` is this source built, byte for byte, and
  `check-post-build.mjs` asserts no product photography returned, that
  every route has a real file, and that the preview card exists. Both are
  run by hand for now.

## The workflow file that blocked the push

CI is written, at `.github/workflows/opening-book.yml`, and is
**deliberately untracked**. GitHub refuses a push from a Personal Access
Token that creates or updates anything under `.github/workflows/` unless
the token carries the `workflow` scope. The first push attempt uploaded
every object and was then rejected at the ref update, all or nothing, for
that one file.

The site going live was worth more than the automation, so the workflow
came out of the commits and stays on disk. To land it: add the `workflow`
scope to the token at github.com/settings/tokens, then
`git add .github && git commit && git push`. Nothing else is waiting on
it. Worth remembering as a general rule: a workflow file is the one kind
of file that can reject an otherwise clean push, so it belongs in its own
commit.

## Traps discovered

**A comment is not a source.** Eighty-odd comments in this repo agreed
with each other and were all wrong together. Only the data and the
executing code count.

**Prose goes stale silently, and code does not.** A renamed function
breaks the build. A sentence describing 102 organisations when there are
211 breaks nothing and reads exactly as well as it did when it was true.
The only defence is deriving figures at render time, which is now what
`/start` and the corrected screens do.

**Set comparison hid a change that multiset comparison found.** The first
screen diff reported "only additions" on a screen whose word count had
gone down by five. A line appearing three times in one build and twice in
the other is invisible to a set.

**A check that lies in your favour is worse than no check.** The first
version of the two-mode walk selected `aside a, nav[aria-label] a` as
"the rail", swept up in-page links, and reported sixty rows on Today
against forty nine on its explanation. It failed screens that were fine
and would have passed screens that were not.

## Still open

1. `/segments` renders 17 em and en dashes, all inside two sourced UCI
   Health organisation names. The no-dash rule and the never-alter-a-
   sourced-fact rule collide, and the call is Jay's.
2. The Nature's Mark row carries a `public` badge on the row while its
   lead time and minimum order quantity, both invented, print underneath
   with no badge of their own. The prose now says so. The real fix is
   per-field provenance rather than per-row.
3. `vercel.json` has an `X-Robots-Tag` for `/tawa` and none for `/me`.
4. `GEOCODED_NOTES.md` records an unresolved anchor conflict: wave-2
   distances were computed against 33.9168 / -117.9000 while `venue.ts`
   carries 33.9190296 / -117.9009311, so stored `milesFromVenue` values
   can differ from a recomputation by up to about 0.2 miles.
5. The Grain source is still committed nowhere. Agreed destination is its
   own public repo, `jsongau/samyang-grain`.

---

# 2026-08-16, part three — mobile

Every screen at 320, 360 and 390, in both modes. `scripts/audit-mobile.mjs`.

## The defect no overflow check could have found

The mega nav does not scroll. It **clips**. Content 621px wide inside a
390px bar, and `document.scrollWidth` reads a clean 390 the whole time,
because an element can overflow its container without the document
overflowing.

| Viewport | Of the Rationale control's 112px |
|---|---|
| 320 | 18px on screen |
| 360 | 58px on screen |
| 390 | 88px on screen |

Today, Inbox, Requests, Leagues and Maps were gone outright from x=437.
The Console/Rationale pair is the only control in the application that
moves a reader between the console and the argument behind it, so on a
phone half the work sat behind a button nobody could press.

**Fixed by the bar's own rule**: the bar is what is waiting for you, the
rail is where things are. Every queue key is also a rail row with the same
live figure, one tap behind Menu. The mode switch is not. Keys off, switch
stays.

**The breakpoint was measured.** First attempt hid the keys below 560,
which fixed the phone and left 561 to 840 clipping exactly as before: at
768 the Maps key still ended at 796. The strip needs 888px. Breakpoint
899, which is a number this codebase already turns on.

## The type scale lives in two places

`tokens.css` has eight steps. Fourteen page stylesheets **re-declare a
denser scale at the page root**, which shadows anything `:root` does. So
the phone lift had to be written twice, once globally and once per page.
A scoped override has to be undone in the same scope that made it.

Separately, 240 micro labels were typed straight into stylesheets as 9px,
9.5px, 10px and 10.5px. Four sizes within a pixel and a half of each
other, all doing the same job. They are one token, `--step--3`, now.

Desktop verified unchanged: smallest text on eight screens at 1440 is
10px before and after.

## The iOS focus zoom, and losing a specificity tie

Safari zooms the viewport when a control under 16px takes focus and does
not zoom back. Ten offenders, worst the rail's period selector at 11.1px
on 165 of 171 pairs.

`:root select` is 0,1,1. That beats a lone class but only **ties**
`.page textarea`, and a tie is decided by source order, which CSS modules
win because they load after the token sheet. Two controls stayed broken
through a full rebuild. `html:root` is 0,1,2 and wins outright, and unlike
`!important` it still leaves a deliberate future override a way past.

## Touch targets without moving the layout

Five links under 44px got `padding-block` and an equal negative
`margin-block`. The hit box grows, the layout box does not change, nothing
beside them moves. `inline-block` is required: vertical padding on an
inline element paints outside the line box and is not counted in the hit
area at all, which would have looked fixed and changed nothing.

## What was deliberately not fixed

**Map pins stay at 36 and 38px.** Clears WCAG 2.5.8 at AA (24px), misses
Apple's 44, which is written for controls that stand alone. A pin does
not: 211 of them over six miles, colliding ones already clustered under a
label reading "zoom in to separate", and enlarging them makes a tap meant
for one land on its neighbour, worst where they are most crowded. Exempted
**by name** in the audit rather than by size, so a real control that
happens to be 38px still fails.

## The audit lied twice before it was right

First run: 168 screens with "clipped text", 64 undersized tap targets.

- **Visually hidden text is supposed to be clipped.** The 1px overflow
  hidden box is how a screen reader hears "twelve late or due today" where
  a sighted reader sees 12 beside an icon. All 168 were this.
- **An inline link in a sentence is not a tap target.** WCAG 2.5.8 exempts
  links sized by the line they sit in; the alternative is 44px line height
  on every paragraph containing a link. 64 to zero.

Both exemptions are written into the file with the reasoning. A check that
reports defects the code does not have is worse than no check, because it
trains you to skim past it.

## Standing checks

`scripts/audit-mobile.mjs` now also asserts that no control on the
navigation bar is clipped off screen, which is the check that would have
caught the defect at the top of this note.
