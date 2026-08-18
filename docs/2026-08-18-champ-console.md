# 2026-08-18 The Territory Book, nathanjsong.com/champ

A local marketing and market prospecting console for the Champions Group
Holdings posting: Marketing Manager, West Division, Brea, temp to hire,
120,000 to 125,000 dollars, reporting to the Director of Marketing for
the West Division. Built by copying the Main Event console at /me and
replacing its data and every rendered string.

Source: `sites/champions-territory-book`. Built output: `champ/`.
Base is `/champ/` in `vite.config.ts` and `basename="/champ"` in
`main.tsx`. Those two are a pair and neither moves without the other.

## What changed

**The data.** 329 organisations, up from 211. The 211 inherited rows were
remapped to partner lanes and 118 real home services businesses were
added across Los Angeles, Orange, Riverside, San Bernardino and San Diego
counties, classified as CHAMPIONS BRAND, COMPETITOR, POTENTIAL PARTNER,
BENCHMARK or OTHER. The anchor is Service Champions Brea, 625 Columbia
St, geocoded through the US Census Bureau.

**The research.** Five agents scraped the published Champions surface on
18 August 2026 and the results are in `/home/claude/champ/facts/` in the
build session, consolidated into BRIEF.md. Every fact carries a URL and a
read date. Nothing in the console asserts anything the brief does not
support.

**The copy.** Two waves of nine and eight agents rewrote every rendered
string across disjoint file groups, then 138 prospect records were
rewritten as JSON chunks and spliced back deterministically, so no two
agents ever wrote the same file.

**The demolition.** 58 files deleted rather than hidden: the leagues,
cup, packages, pay, partners, accounts, book and sell-through
subsystems, computed as the transitive closure of what `src/main.tsx`
can no longer reach. The bundle went from 2.14 MB to 1.79 MB. The
rationale registries are emptied rather than deleted, with the argument
for that written at the top of each of the six files.

## Decisions made

**The countdown is computed, not stored.** It was a number on each
period, and it produced the worst defect this build had: a rail reading
"14 days to expiry" on a board dated three weeks after the date it was
counting to. There is now one published date, `PUBLISHED_OFFER_EXPIRY`
in `data/venue.ts`, one clock in `selectors/record.ts`, and the figure is
the subtraction. It cannot disagree with itself.

**52 personal email addresses were withheld.** The prospect data carried
93 real addresses scraped from public pages, 52 of which belonged to
named individuals at schools, districts and small businesses, and the
map panel rendered them as clickable mailto links. The rows now carry
the domain and withhold the local part, with a withheld provenance badge
and no link. The count, the ratio and the source URL on every row are
unchanged, because the finding is that a written door exists, not what
is written on it. 41 role addresses are printed in full.
NOTE: /me still carries all 93 in full and is live. Same fix applies.

**Lead offers were remapped.** Every one of the 211 partner rows carried
a `leadPackageId` pointing into a package shelf that had been repurposed
into the market's offer shelf, so 146 rows recommended leading with a
competitor's membership plan. All partner rows now lead with a Champions
offer, chosen by the brand that serves that address.

**The multifamily rebate is flagged, not asserted.** The CEC says HEEHRA
Phase I is taking multifamily applications at up to 14,000 a unit and
TECH Clean California says new Stage 1 is paused. The outreach draft
names the disagreement and asks for the property list rather than
quoting a figure.

## Rejected

**Rewriting the rationale mode.** Twenty eight screens of argument about
a company this desk has no inside knowledge of would have read as
confident and been invented. The registries are empty and the door
redirects.

**A spend dashboard.** Champions Group publishes no marketing budget, no
cost per lead, no close rate and no agency roster. The screen is a
framework a manager fills in, and every absent figure says withheld and
says why.

**Moving the seeded world to 18 August.** Every thread, lead and reply is
dated against 23 September 2026. Shifting 400 timestamps to make the
countdown positive would have been a large migration to hide a smaller
truth. The countdown counts up instead.

## Traps found

- CSS Modules hash class names per file. A selector written across two
  files compiles to a class no element carries and fails silently.
- Static hosts redirect `/report` to `/report/`, and React Router hands
  the trailing slash straight through. `SCREENS["/report/"]` is
  undefined and every breadcrumb degrades to "This screen". Normalise
  before looking up.
- `find -newermt` with an `%TH:%TM` sort is a lexical sort. 23:57 sorts
  after 05:00. Use epoch.
- A regex over `buyingWindow: "..."` matches the provenance block's
  entry as well as the field's. Anchor on indentation.
- The route stub emitter's guards failed the build when the derived
  league and rationale counts dropped below their floors, which is
  exactly right: it stopped rather than shipping dead links.

## Next steps

1. Push. `champ/` and `sites/champions-territory-book/` are committed and
   not pushed. Remote is `https://github.com/jsongau/NJS.git`.
2. Add `/champ` to `vercel.json` headers if it should carry the same
   noindex treatment `/tawa` has. It currently does not.
3. Apply the email withholding to `/me`, which is live with 93 full
   addresses.
4. The resume for this role is at v1 and still has four `[CONFIRM]`
   items open. The posted band is 120,000 to 125,000, not the 125,000 to
   140,000 the first pass assumed.
