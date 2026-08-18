# 2026-08-14 — A hundred and nine more organisations, and the industry cut

## What was asked

> "let's get 100 more potentials clients to focus on 'Develop and execute a
> local and outbound sales strategy to identify high-potential target customer
> segments and industries that would benefit from our services'"

That quote is requirement **D2** in `JD_BREA.md`. It has two halves and the
second one is the one that is easy to skip: *segments and industries*. A
hundred more rows on the same board answers "more prospects". It does not
answer "which industries", and a hiring manager reading a board of two hundred
undifferentiated organisations learns nothing they could not have got from a
list of two hundred.

## What changed

**The board went from 102 to 211 organisations.** 109 added, 16 more
researched and deliberately held off.

**Every row now carries a `segment`** — a two-digit NAICS sector. That is the
third cut across the same data: `lane` says how you reach somebody, `orgType`
says where the yes lives, `segment` says what they do for a living.

**A new screen at `/segments`** ranks the sixteen occupied sectors and exposes
the weighting as a control.

## The decisions, and what the alternatives cost

### Nine industries were named BEFORE anything was searched for

The first two research passes swept the trade area and took what was there.
That is why the original board came out **80 of 102 in Brea** and heavy on the
two things a sweep always finds: shopfronts and clinics. It is a good route
sheet. It is not a segmentation, because nothing about it was chosen.

So this pass ran the other way. Nine sectors were named first — K-12 beyond
Brea Olinda, the industrial belt along Kraemer and Orangethorpe, the five
neighbouring city halls, youth enrichment, senior care, the referral trade,
commission floors, professional services, the congregations — each chosen
because the board was thin there and the occasion was real. Then each sector
was searched for organisations that actually exist in it.

The result is visible in the geography: **Fullerton 40, Brea 32, Placentia 13,
La Habra 8, Buena Park 6, Yorba Linda 5, Anaheim 4.** The new rows are less
Brea-centric than the old ones on purpose, because industries do not stop at a
city line and the venue's seven-mile trade area does not either.

### NAICS rather than categories invented for this board

Inventing fifteen labels — "industrial", "youth", "professional" — would have
taken ten minutes and would have been unfalsifiable. Nobody can check
"industrial" against anything, so the segmentation would have been an opinion
wearing the clothes of an analysis.

NAICS is the federal industry classification and it is what the Census
Bureau's County Business Patterns is published in. The moment somebody wants
to know how many sector 31 establishments exist in ZIP 92821 — rather than how
many this board happens to carry — the answer is a public download away and it
joins to these codes exactly. **A segmentation you can join to a government
data set is worth more than one you cannot, and it costs the same.**

Two-digit sectors only. NAICS goes six deep and six deep would split two
hundred organisations into groups of one.

**The one place this board bends it, recorded rather than hidden:** veterinary
hospitals are 541940 in NAICS, which files them next to law firms. Here they
sit in 62 with the clinics, because the thing that makes an animal hospital a
prospect is the clinic pattern, not the law-firm one.

### The ranking has a rule, and the rule is a control

`/segments` scores each sector as a weighted sum of three normalised
components:

- **Volume** — guests a sector could plausibly put in the building, summed
  from the midpoint of every row's headcount range. The closest thing to
  revenue computable without inventing a price, and group prices are the one
  thing Main Event deliberately does not publish.
- **Certainty** — the share whose occasion happens whether or not anybody
  calls them. A graduating class graduates. A holiday party is a decision
  somebody can simply not make.
- **Reach** — the share with any written door at all.

Default weights are 50/30/20. **They are a judgement and the screen says so.**
What is not a judgement is the three inputs: every one is a count over rows a
reader can click.

Rather than defend the weighting, the screen hands it over. Four presets —
`balanced`, `pre-opening` (20/60/20), `volume` (80/10/10), `reach` (20/20/60)
— re-rank the board live, and rows that move say how far they moved and in
which direction. `pre-opening` moves 13 of the 16 sectors. That movement is
the argument: the right industries to work depend on what you are optimising
for, and a board that hides that behind one number is selling a conclusion.

The preset lives in the URL (`?weights=pre-opening`), as does the expanded row
(`?open=61`), because eleven other files in this codebase already keep state
there so the proof scripts — which cannot press a control — can reach every
state.

### The empty sector is rendered

NAICS 51, Information, has no organisation on the board. Three candidates were
researched and every one rested on a single directory line with a generic
switchboard number, so none shipped. The sector is carried anyway and
rendered as a gap. **A segmentation that only lists what was found cannot tell
you where to look next.**

## The gate, and what it caught

`scripts/wave3-validate.mjs` reads the nine research files and refuses
anything that would put a bad row on the board. It does not repair — a script
that quietly fixes a bad row is how a bad row ships. It caught:

- **Six rows where a population had been recorded as a headcount.** Four
  school districts, a city and a hospital carried figures like `14000`, which
  is district enrolment wearing a headcount's clothes. Every revenue figure
  downstream would have inherited it. The floor is 600 guests, because the
  venue publishes 26+ lanes at one lane per 20. Each was rewritten as a group
  size with the population moved into the basis sentence where it is useful
  and harmless.
- **A length rule of my own that was wrong.** The gate rejected
  `decisionMakerTitle: "Owner"` as a stub at eight characters. "Owner" is five
  characters and is the correct answer for half the local retail lane. The
  floor for that field is now four, separate from the floor for sentences.

## The adversarial audit, and what it changed

Fourteen rows were then audited by a separate agent whose brief was to **break
them**, chosen adversarially rather than randomly: every row whose email came
from a state or third-party directory rather than the organisation's own
domain, every row whose address came from a chamber listing, and the largest
headcounts.

**All nine email-bearing rows in the sample rendered the exact address string
in plain text on the cited page.** Zero fabrications. The California
Department of Education school directory turned out to be the unlock for the
whole education segment: it publishes named administrator emails for public
*and* private schools, and several district sites serve a robots block that
makes their own directories unreadable.

Two rows failed on something else and both came off the board:

- **Crane Architectural Group** — no resolvable web presence at all. Neither
  candidate domain resolves and the only source is a chamber directory that is
  itself robots-blocked. A prospect a hiring manager cannot click is worse
  than no prospect.
- **Cargill's Fullerton plant** — three sources give three street numbers on
  the same block of N Gilbert: the chamber says 600, the NLRB filing the row
  cited for its own headcount says 566, and the EPA Toxics Release Inventory
  says 550. The block is almost certainly right and the number is contested,
  so there is nothing to pin. Same standard that took Round One Entertainment
  off this board months ago.

One row was **upgraded**: Safran Passenger Innovations (RAVE Aerospace)
publishes plain-text addresses on a page the research pass had recorded as a
contact form, which makes it the most reachable large manufacturer on the
board.

**Four decision-maker titles were corrected.** The email was real and public
in every case, but the title attached to it described a different person from
the one who owns the mailbox — a district superintendent labelled as an
assistant superintendent, a principal labelled as an ASB advisor. Any merge
field would have opened with the wrong job. That is the class of error that
survives a hundred spot checks because nothing about it looks wrong.

## Two defects in the existing build, found on the way

**A sentence that had stopped deriving from anything.** `Timeline.tsx` printed
"Forty-two of the hundred and two organisations on this board are in the same
state" as literal JSX. It was true when it was typed. The board went to 211
and the sentence carried on claiming 102. It now derives from
`PROSPECTS.length - CONVERSED_PROSPECT_IDS.length`.

**A classifier that inferred a property from a name.** The Method page grouped
removed organisations into "the geocoder disagreed" and "the geocoder had
nothing" by matching the organisation's NAME against a hard-coded list of two
strings. Correct for nine rows, silently wrong for six of the sixteen added.
Rows now carry an `ExclusionKind` and the page reads it.

Both are the same failure: a figure that was derived once, by hand, and then
became a decoration.

## Why `/segments` shares the lanes colour

Adding a twenty-fourth section would mean re-solving the section hue wheel in
`theme_cabinet.py`, and at twenty-four the 7.5 adjacency floor fails on both
grounds — it barely cleared at twenty-three (7.54 dark / 7.79 light).

It is also the right answer regardless. Lanes and Segments are two cuts of one
board. Drawing them in two colours would say they were two places. Same
precedent as `/cup` under leagues and `/pay` under the floor. The screen is
still named in the rail, the breadcrumb and the page title, which is where a
section is actually told apart.

## Proofs

- `tsc -b` clean, `npm run build` clean, **267 route stubs** (was 157 — the
  jump is 211 quote stubs, one per organisation, because those URLs go in
  emails and must resolve cold).
- Contrast walked on **both grounds** at 1440 and 380 across every route
  including four `/segments` addresses. Zero failures.
- No horizontal overflow at 380.

## Next

The board is now 211 rows and the source is still not in version control —
only the compiled output goes to `jsongau/NJS`. That is the single largest
risk carried by this project and it has been carried for three sessions.
