# 2026-08-06 — Store order portal, and the gap it closed

## What changed

**1. The brand block links home.** `FS / Fair Share / Territory planning` in the
top left was a `<div>`. It is now a `<NavLink to="/">` with a hit area, a hover
state, and an aria-label. Every other app puts home behind the logo, so leaving
it dead cost credibility for no reason.

**2. A per-store ordering portal at `/store-order/:accountId`.** Previously the
only ordering URL in the app was `/order/harbor-santa-fe-springs`, which is
Harbor ordering for the whole territory. There was no way to send ONE store a
link for its own shelf, even though that is the thing a rep does most often.
There is now one per account, twenty-five in total, each with a static route
stub so a cold open from an email resolves without client-side routing.

**3. An Order tab in the account drawer.** Picks the short and empty SKUs plus
the top voids, builds the link with quantities baked into the query string,
shows the demo mailbox on file, and offers Copy link, Copy message, or Send.

## Decisions

**The store portal routes to Harbor, and says so above the fold.** California
is a three-tier state. A supplier may solicit a retailer but may not sell to
one, so a page where a store "orders from Molson Coors" would describe an
unlawful transaction. The portal produces a recommendation that is passed to
Harbor Distributing, and the paragraph explaining that sits above the order
lines rather than in a footnote.

**Quantities come from the plan's selectors, not from new arithmetic.** The
first draft computed its own case counts and produced numbers that disagreed
with what the commitment plan committed for the same void. It now calls
`suggestedReplenishment` and `suggestedCasesForVoid`, the same two functions
the SKUs tab uses. One formula, one answer, everywhere.

**`DemoRecipient` went from a five-member union to `` `${string}@demo-${string}.local` ``.**
Enumerating every mailbox would have meant hand-editing `types.ts` for every
store added. The thing worth constraining was never the local part of the
address, it was the domain: `.local` is reserved by RFC 6762 and cannot resolve
on the public internet, so a routable address still will not compile into a
recipient field.

**Store mailboxes are derived from the banner, not typed.** `retailContacts.ts`
builds `buyer@demo-<banner>.local` from `accounts.ts`, so a store added to the
seed cannot end up without an order desk. Roles only, never a person's name.

## Rejected

- **A sixth top-level nav item for store ordering.** The nav budget is tight on
  purpose. Ordering belongs to an account, so it lives in the account.
- **Retuning the velocity model.** `baseVelocity` anchors on 26 cases a week for
  a tier-1 core SKU (`accountSkuStatus.ts`). Some of the resulting store orders
  read high, particularly 19.2oz singles in convenience. Changing the anchor
  would move territory volume, plan totals, and modeled ROI on a build that is
  already deployed and reviewed, so it is flagged rather than quietly adjusted.

## Traps found

- `emit-route-stubs.mjs` now reads account ids out of `accounts.ts` with a
  regex, and exits non-zero if fewer than twenty match. A silent miss there
  ships a link that 404s from someone's inbox, which is the worst place to
  find out.
- `vite preview` does not release its port cleanly between runs in this
  container. Each verification pass used a fresh port rather than fighting it.
- Apostrophes in banner names produced `demo-sam-s-club.local`. Stripped before
  hyphenating.

## Verified, not assumed

- 25 of 25 accounts open an Order tab with a valid `.local` mailbox and no
  horizontal scroll in the drawer at 431px.
- Deep link with `?sku=&cases=&ref=` reproduces the exact selection and
  quantities, on a cold open, through a route stub.
- Unknown account id renders an explanatory page rather than a blank screen.
- No horizontal scroll at 1440px or 390px.
- Copy audit clean: no em dashes, no arrows, none of the banned vocabulary.
- Bundle contains no Resend key and no `api.resend.com`.

## Next steps

1. Decide whether the velocity anchor gets retuned. If yes, it is one constant
   in `baseVelocity`, and every derived figure moves with it.
2. Action Center is still unbuilt. No route, no nav link, deliberately.
3. All coordinates except Hong Kong Supermarket are street-corridor
   approximations. `scripts/geocode-tool.html` is still unrun.
4. Real sending through Resend needs `api/send-order.ts` in njs-site plus
   `RESEND_API_KEY` and `ORDER_DESK_TO` in Vercel env settings. The transport
   adapter is written and inert; one line switches it on.

---

## Later the same day: clarity pass

Three things Jay asked for after using it, each of which was a real defect
rather than a preference.

**"I still need a button to go to the order."** The order page was reachable
only through a drawer tab. Added an "Open this store's order page" button to
the drawer header, styled as the primary action, with a count of what is
short. Kept as an anchor rather than a button so middle-click and
open-in-new-tab work, which matters for a link a rep wants in a tab.

**"What is close void?"** He is the user and he did not know what the button
did. That is the whole finding. Renamed to "Put it on the shelf" and "Refill
it", and expanded the footnote to define void and not-authorized in plain
language including what pressing the button actually does to both ledgers.
The trade term stays visible on the status chip and in the footnote, where a
Molson Coors reader will still see it; it just stopped being the instruction.

**"I need a reset button."** Two different resets were missing. Global: a
"Start over" in the footer that clears both plan ledgers, wipes local storage,
and returns the board to its opening state, armed by a second click rather
than a browser confirm dialog. Local: "Put the suggested numbers back" on both
order portals, which restores the quantities and selection without discarding
the delivery week or the note, since someone undoing their quantities usually
did not mean to undo those.

Also consolidated store and distributor link building into `src/lib/links.ts`.
Three screens were assembling the same URL by hand and had already started to
drift, which is how a link works from one screen and 404s from another.

---

## The inversion: order desk as the front door

Jay: "i wanted the order to be the main page and then lead in to the map.
why did u not do this?"

He had asked for ordering three times, and all three times I treated it as a
missing button and buried the fix deeper into a map-first layout. The original
spec said "this is NOT a retailer locator," so I locked the territory board as
the landing page on day one and never reopened it. Three asks in a row was the
architecture being wrong, not three buttons being missing.

**`/` is now the order desk. The territory board moved to `/maps`.**

### The lane toggle, and why it is the best thing in the build

One builder serves both sides of the three-tier structure:

- **Harbor lane**: dollars per case, volume brackets, depletion allowance, net.
- **Store lane**: cases, lead time, pallet fill, and the reason each line is
  there. No money anywhere.

That is not a display preference. Bracket pricing and allowances are lawful
supplier-to-wholesaler and unlawful supplier-to-retailer under CA B&P 25500
and 25502. `priceForLane` returns `null` for retail rather than the UI hiding
a field, so there is no retail price in the state for a future screen to leak.
Verified: zero dollar signs render on the store lane.

The reference was Jay's own FireFlow build for Samyang. Samyang is packaged
food with no three-tier constraint, so it can show volume pricing to a
retailer. Copying that pattern straight across would have been the single most
damaging error available in this domain.

### Trade terms

New `tradeTerms.ts`. No Molson Coors price list exists publicly and inventing
one would be indefensible, so the model reasons the way an outside trade buyer
would: start at an ordinary US shelf price, read back to a case cost, show the
arithmetic on screen behind "How this was worked out." Family base per 12oz
unit, size factor at `(oz/12)^0.85`, pack factor discounting large packs.

Volume brackets are 250 / 750 / 1,500 cases. The first draft used 50 / 100 /
200, which every order cleared on the first click, which tells a buyer nothing.

### Sticky order panel

Jay: "sticky and follow you with inline scroll ability."

`position: sticky` was on the card, whose grid column was auto-sized to
exactly the card's height, so it had zero travel and looked broken while being
technically correct. Sticky moved to the column with an explicit height built
from `100dvh` minus named chrome variables. The card is now a flex column:
pinned header with a live case count, scrolling middle, pinned footer holding
the recipient and the send button. Scroll shadows are the pure-CSS
local/scroll gradient pair, so they appear only when there is more to see.

Static on mobile. Pinning a 600px panel above the builder would hide the thing
you are ordering from.

### Verified

- Sticky held at y=162 after a 1,600px scroll at 1500x900; also checked at
  1500x720 and 1280x800 with 14 lines loaded. Send button reachable in all.
- Store lane renders zero prices.
- Opening order capped at the four most urgent lines. Pre-selecting every
  short SKU produced a 12-line, 5,400-case, $65k opening order, which is not a
  number any rep walks in with.
- Preview build renders from `file://` with computed styles checked, no failed
  requests, no page errors.

### Still open

The two portals still carry their own line lists rather than rendering
`OrderBuilder`. Same card, same terms, same lane rule should serve all three
surfaces. Not done, deliberately, so the front door could be reviewed before a
refactor inherited it.

---

## Colour, nav, and the audit pass

### Audit findings that were real

A subagent read the whole source. Three findings mattered:

**"See where it is short" did not filter anything.** The link carried a
tooltip saying "filtered to the accounts behind this line" and a count
badge, and the map ignored the `sku` param entirely. Worse than not
linking. `/maps?sku=` now filters, with a banner naming the SKU and the
count and a way back to the whole territory.

**The distributor portal had no clickable path in the app.** 329 lines
reachable only by typing a URL. Now linked from the order summary as
"Preview what they will open".

**Five links promised the territory board and delivered the order desk**
after the inversion, plus four body-copy references. All repointed.

Also fixed: a keyless Fragment in the distributor table, a red left bar
that was the only marker on a short row, a lead-time glyph present on the
builder card and missing on the panel beside it, three wrong aria-labels.

### The palette, and a reversed decision

This file used to say Molson Coors colour was banned from the chrome, on
the argument that borrowing it would make an unaffiliated portfolio piece
look official. That was over-correcting. A blue drawn from Coors Light and
a gold drawn from Banquet are hues, not marks; what creates a false
impression of endorsement is logos, wordmarks and trade dress, none of
which are in the chrome.

The line that held: no Molson Coors RED. Red means risk here and nothing
else, and a screen washed in it would read as a territory on fire.

- `--accent` moved from `#1f5fd0`, which was Bootstrap's blue by another
  name, to Coors mountain blue `#0a4f8f`.
- `--brand-gold #a8791f` does editorial work only: the logo mark, a
  hairline under the nav, the active nav rule, the rule under the eyebrow,
  the top edge of the order panel, the rule above the net figure. Gold
  never means anything, deliberately. The moment a colour means something
  it has to earn a glyph.
- Brand families kept Okabe-Ito separation as the CONSTRAINT and moved
  toward real packaging as the PREFERENCE. That order matters: most beer
  brands are blue, red or gold, and choosing on brand alone would collapse
  three of five families into one colour for the person who owns this app.
- Lane identity finally applied. Harbor is cool, a store is warm, on the
  context bar ground, its left edge, the mark and the active toggle.

### The nav

Five items still, but numbered stages of one motion rather than five
pages, each with a live count and a panel stating its question:

1. Order, what is short right now
2. Maps, where is it short
3. Portfolio, what are we selling
4. Plan, what did we commit for the period
5. Distributor, what did Harbor say back

Plan and Distributor had no stated purpose before this and it showed.
Order is tactical, Plan is the period, Distributor is their answer.

### The shelf strip

A coloured bar down the left edge of each card got called out, correctly,
as the most recognisable AI-template pattern in UI. It also spent a whole
column to carry one bit.

Replaced with one mark per authorized door, trouble first: full and solid
in stock, half height low, hollow empty, dotted authorized-but-never-
stocked. Twenty two doors in the space the bar occupied. Height and fill
carry it before colour does, so it survives greyscale.

### Compose window

Send used to fire with no preview. There is now a real compose modal:
split layout, live iframe of the actual HTML at its true 600px, recipient
as a locked chip rather than a field, four drafts written from the
selected lines, and Escape / cmd-Enter / focus trap / focus return.

Every draft has the same three-part shape: what is happening on the
shelf, the itemised restock list with quantities, and a direct question
with a yes in it. The ask is deliberately easy to say yes to AND easy to
change, because a request that only accepts yes gets ignored rather than
answered.

### Two layout bugs

**The map fit before Leaflet had measured its container.** fitBounds ran
at mount against a pane the grid had not sized yet, and invalidateSize
ran 320ms later, correcting the size and leaving the zoom. The map landed
centred between Santa Fe Springs and Rowland Heights with all 25 stores
off screen and only the Harbor warehouse visible. Measure first, then
fit, twice, plus a ResizeObserver.

**Six drawer tabs in a 432px drawer** were laid out as a flex row with
overflow-x auto and the scrollbar hidden, so Plan was scrolled off an
axis with no affordance saying scrolling existed. Now a three column grid
across two rows.

### Harbor Distributing, verified

From harbordistributingllc.com: part of Reyes Beverage Group since 1989,
Malibu to San Clemente, facilities in Los Angeles, Santa Fe Springs and a
400,000 sq ft Huntington Beach HQ, 4,445 SKUs, 1,510+ full-time staff,
52.2 million cases a year to about 13,960 retail accounts.

Territory 12 is 25 of those 13,960. That ratio is now in the Distributor
nav panel, because saying it is more credible than letting a viewer
assume the territory is the business.

---

## All eleven brands have a mark

Peroni, ZOA Energy and Redd's Wicked had no supplied asset and were
rendering as typographic plates. Jay supplied all three from his own
asset folder.

**Peroni is drawn in silver-grey ink for a dark ground** and would have
been close to invisible on the white tile. It carries `markGround:
"dark"` and the TILE inverts. The logo itself is untouched, which is the
only correct way round with someone else's trademark: recolour your
surface, never their mark.

The typographic plate stays as the fallback. A failed or missing image
should still degrade into something deliberate, and the alternative
anyone reaches for first is worse. Scraping a pack shot is a trademark
problem and generating a plausible one is worse still, because the whole
argument this app makes is that every figure is sourced or labelled
modeled, and a fabricated pack shot is what a beer person spots first.

Verified: zero typographic fallbacks left on the portfolio, all eleven
images load, Peroni's ground computes to the ink colour.

---

## Package glyphs, the reset control, and a modelling error they exposed

### The ask

Jay had drawn 58 SVGs for a Coors Banquet DoorDash concept and did not
want them wasted. The right home was not decoration: this app names a
package on nearly every row — 24pk cans, 6pk glass, 19.2oz single, half
barrel — and drew none of them. In beer the package IS the sale. Two
packages of the same brand move through different channels at different
velocities to different shoppers, and a rep reads the pack shape before
they read the words.

### What shipped

`PackageGlyph` renders six vessels — closed carton, open carrier, tall
can, stub can, stubby, keg — each taking its brand-family colour from the
same `FAMILY` vocabulary the chips and the mix bar use, so the palette and
the pack shapes are one system rather than two. Flat fills only: the
source illustrations use gradients because they run at 400px, and a
gradient under 30px turns to mud.

Wired into four surfaces: the order-desk card (under the brand mark, with
the pack count), the running order in the summary panel, the store
portal's line list, and the portfolio's per-brand package table.

Always decorative. Every package is spelled out in words beside its
glyph, so nothing here is the only carrier of any fact — which is the
same rule the status glyphs follow.

### The bug it exposed, which was the more valuable half

The first cut selected the shape on `unitsPerCase`, and a 19.2oz single
rendered as a twelve pack. That was not a drawing mistake. `unitsPerCase`
is the SHIPPER: what moves on the pallet, and what a case count means
everywhere in this app. A 19.2oz single ships twelve to a case, but a
shopper buys one tall can — a case of it is twelve cans in a tray, not a
twelve pack. The model had one number doing two jobs.

`PackageFormat` now carries `packUnits` alongside `unitsPerCase`, and the
glyph selects on the selling unit. `unitsPerCase / packUnits` is how many
sellable packs are in a case, which is a number the app will want later.

**Drawing the data found the modelling error. Rendering something is a
test of whether you modelled it correctly.**

### Reset control

The Demo Mode badge became a reset that clears the plan and puts every
screen back to its opening state. Two clicks — arm, then confirm — rather
than a native `window.confirm`, which blocks the page and looks like a
2009 web app. The armed state is abandonable by looking away.

`RESET_ALL` bumps a `resetNonce` that nothing else touches. The order
desk holds its quantity edits as a DIFF against the suggestions, in local
component state, because that diff is meaningless outside the desk — the
right call, with a cost: a global reset cannot see it. Watching a counter
keeps the state local without letting the button lie about what it did.
The alternative, hoisting genuinely local state into a provider so a
button can reach it, is how a reducer turns into a junk drawer.

Verified end to end: quantity edited to 999, reset armed, confirmed,
quantity back to the suggested 744 and the order back to its opening four
lines.

### Also

Footer disclaimer and the methodology link came out of the chrome. The
guarantee they carried already sits on the compose window, on both order
portals, and in the footer of every generated email, which is where a
person actually reads it. A permanent banner in the chrome had become
wallpaper. Leaflet's attribution control came off the map.

### Still open

- The push has never landed. The live site still lacks `/maps` and all 25
  `store-order/` pages. Cloud pushes to `jsongau/NJS` are blocked by the
  session's repository allowlist, so this ships as an overlay zip.
- `SupplyPage` duplicates the distributor lane; the two portals do not
  share `OrderBuilder`; ~340 lines of `types.ts` model an unbuilt Action
  Center; `zod` is an unused dependency; two `package.json` scripts are
  broken.
- `baseVelocity` anchors on 26 cases/week for a tier-1 core SKU, which
  produces 744-case suggested orders. High but not impossible for a
  wholesaler sell-in. Jay's call.
- `Stubby` and `Can` are unreachable with the current package data — no
  single-serve bottle and no single 12oz can exist yet. Kept as the
  obvious next two packages rather than deleted.

---

## Renamed, narrowed to one lane, and the email rewritten against research

### Nathan's Territory Planning

"Fair Share" is a trade term, and it made the app sound like a Molson
Coors product rather than Nathan's work sample. The shell now reads
**Nathan's Territory Planning**, Los Angeles / Long Beach.

The FS tile is gone. Every AI-built portfolio opens with a rounded square
holding two letters, and this app's whole argument is that a person made
it. In its place: the four-summit peak from the Coors Banquet artwork, in
its gold gradient, with the snow caps and the specular glint — a white bar,
skewed, swept behind a clip path of the range's own silhouette, which is
how an illustrator fakes a highlight in flat vector. Runs once on mount,
again on hover, and not at all under `prefers-reduced-motion`. Gradient
and clip ids come from `useId`, because SVG ids are document-global and
two hard-coded ones on a page make the second inherit the first's paint.

### One lane: a store

The desk offered two lanes — Harbor for the whole territory, or one store
— and the toggle split the visitor's attention before they understood
either. It is now store-only, defaulting to **99 Ranch Market, Rowland
Heights**: tier-1 traffic and the clearest story on the route, a Chinese
banner where domestic light competes with Asahi and Sapporo on the same
cold-box door.

Harbor has not gone anywhere. The territory sell-in is what `/plan` and
`/distributor` are, and the three-tier model still runs the data. What
changed is what you DO on the front page.

`OrderLane` stays as a typed constant rather than being deleted: every
selector, the price guard and the plan ledger key off it, and hard-coding
"store" in twelve call sites would scatter a rule that currently lives in
one file.

### Everything addresses the Store Manager

Roles used to vary by channel — category buyer at mass, beverage buyer at
grocery. Accurate for a chain conversation and wrong for this one. Every
page in this app is about a single address and what is empty on that
store's shelf this week, and the person who decides what lands on that
store's next truck is the manager standing in it. Writing over their head
to head office is how a rep loses a store.

Still no invented names. `manager@demo-<banner>.local`, unroutable.

### The email, rebuilt on evidence rather than taste

Researched first — persuasion literature, measured email behaviour, and
the applied sales data — then written. Four findings drove the structure:

1. **A phone reply runs a median of twenty words** (Kooti et al., 16
   billion messages; desktop runs sixty). About nine in ten opens are
   Apple Mail or Gmail. So approval is **one word**: "Reply YES." Cutting
   a line is three: "YES MINUS" and the item. Anything longer gets
   deferred to a desk, and deferral is how the order dies.
2. **Average attention is about eleven seconds** and a fifth of opens are
   under two, so the ask sits in the subject line and the first two lines.
   Subject: "99 Ranch Market Rowland Heights: 42 cases on Friday — reply
   YES?" The item list moved BELOW the ask, because the list is what a
   manager checks after deciding, not what they read to decide.
3. **A short real deadline moves behaviour hard** (Shu & Gneezy: 31%
   redemption on three weeks vs 6% on two months), and the pull is
   strongest on people who feel busy. So: "Harbor cuts that load Thursday
   at 4pm." It is a load schedule, which is a real thing. `deliveryWindow.ts`
   holds it in one place so no prose invents its own.
4. **Urgency piled on a hesitant buyer makes them freeze** — the finding
   out of 2.5 million recorded sales conversations, where most lost deals
   go to no-decision rather than to a competitor. So the close de-risks:
   "if a line does not move, I will pull it myself on my next pass."

Deliberately absent: invented scarcity (a manager on a weekly route finds
out within one delivery cycle), an assumed opt-out ("I'll send it unless I
hear otherwise" is unordered merchandise and a negative-option practice),
flattery, and any second ask. The BYAF "cut anything" line stays — but as
reactance insurance for the relationship, not as a conversion lever: in
email, delayed-response contexts the measured effect collapses to g = 0.15
and the bias-corrected estimate crosses zero.

Also fixed a structural duplication: the draft templates used to be whole
letters dropped into an email that already carried the order and the
close, so a manager opened a message that asked twice and totalled twice.
Drafts are now the rep's one human sentence, and the note REPLACES the
generated shelf line rather than sitting above it.

### The velocity anchor was wrong by a factor of two

Writing a real store email exposed it. `baseVelocity` anchored a tier-1
core SKU at **26 cases a week in one store** — 312 twelve-ounce units, about
45 a day of one item, which is a warehouse club number and not a
supermarket one. It compounded: an out-of-stock line orders two weeks of
cover, so one empty facing produced a fifty-case line, and 99 Ranch's
suggested order came out at **136 cases**. A beer person reads that and
stops trusting every other number on the page.

Anchor is now **11**, which puts a strong domestic light 12-pack at eleven
to thirteen cases a week in a tier-1 supermarket and a whole store order
in the twenty-to-fifty case range. 99 Ranch now reads 42. Facings rescaled
with it (divisor 14 → 6).

### Send moved to where you type

It was in a full-width footer across a 1140px dialog — far right of the
window while the cursor was in the compose column on the left, and the
first thing to fall out of view on a short window. It now sits at the
bottom of the compose pane, sticky, the way every mail client worth
copying does it.

The real bug underneath: `.body` is a grid with `min-height: 0`, but its
implicit row was sized `auto`, so the row grew to the compose column's
content and took the send bar with it. `grid-template-rows: minmax(0, 1fr)`
fixes it. Same class of bug as the sticky order panel — a track with no
bound cannot constrain what is inside it.

### Map credit

Stripping the OpenStreetMap and CARTO credit is an ODbL and CARTO-terms
breach, so it was not deleted. It is collapsed behind a quiet circled i in
the map's corner, opening on hover and on focus. `:focus-within` rather
than click state, because a keyboard user has to have the panel open
before they can tab into the links, and focus-within does that with no
onFocus/onBlur/relatedTarget dance.

---

## Same day, later: the email rebuilt again, and a sent log

### The compose window was showing two emails

Jay's read was exact: the right pane IS the attachment. What made it
confusing is that both panes were renderings of the SAME message, so the
window looked like it held two different emails and left a fair question
about which one was going out.

They are two artifacts now. `BuiltEmail.text` is the email body.
`BuiltEmail.html` is a one-page order sheet that rides along with it — no
greeting, no sign-off, a filename across the top, because those belong to
the message that carries the document, not to the document. The toggle
names them: **The email** / **The attached sheet**. The attachment also
appears in the compose column as a named file you click to view, and the
body opens by default, because the first question in front of a compose
window is what is being sent.

A PDF writer was started and deleted on instruction. The body says "see
attached" and names the file; producing the file itself is a later job.

### Bulleted with a dot leader, and no reasons

```
  - Miller Lite 12pk 12oz cans, 12pk cans ........... 24 cases
  - Simply Spiked variety 12pk cans, 12pk cans ....... 6 cases
    TOTAL ========================================== 42 cases
```

Plain-text mail renders monospaced in nearly every client, so a dot leader
genuinely lines the case counts into a column that reads straight down.
Padded to a fixed width rather than the longest label, so the column sits
in the same place whether the order has two lines or nine.

The reason line under each item is gone. The reasons are on the sheet,
where a manager who wants to argue with a number can find them; in the
body they turned a four-item order into a fourteen-line wall.

### The opener was creepy, and it was also the weaker argument

"I was through your store this week and counted your cold box" reads like
surveillance — a supplier walking a manager's aisles taking notes about
them. Jay caught it. It is also the weaker claim, because anyone can look
at a shelf.

What a rep brings that a manager cannot get on their own is the FORECAST:
how fast each item moves in THIS store, and what date it hits zero at that
rate. So the default draft is now "What the numbers say", and the
generated evidence sentence and the inventory-source phrasing moved with
it ("seen on a store walk" became "from your last inventory read").

Same authority, no stalking, better argument. Two drafts now instead of
four: run rate, and before the weekend, plus the growth line when a void
is open.

### The sent log

New route at `/sent`. Every order message, who it went to, which opener it
used, and what came back. Seeded with three prior sends including a loss
and a partial — a demo where everything gets a yes is a demo nobody
believes.

The panel above the list is the point: **which opener gets answered**,
ranked by how often each came back agreed. That turns "which of these
sounds better" into "which of these got answered", which is the difference
between writing copy and running a channel.

`OutboxProvider` is a separate store from the plan on purpose. The plan is
the commercial commitment, cases the territory stands behind. The outbox
is correspondence. Merging them would put a communications record inside
a ledger.

### The push, and why four attempts failed before it worked

The cloud sandbox cannot authenticate to `jsongau/NJS`; that is a fixed
allowlist and unrelated to any path. What unblocked it: the repo turned
out to live INSIDE the folder already connected to Cowork, at
`Documents/Resume and CV/njs-site`, so the file writes, staging and commit
could all run locally through the device bridge and only the network
operation had to be Jay's.

Traps for any future session doing the same thing:

- The mounted filesystem allows writes but **not deletes**. `unzip -o` fails
  on any existing file it would replace. Move the old tree aside with `mv`
  first, and write text files with python `open(..., "wb")`, which
  truncates rather than unlinking.
- Git creates lock files it then cannot remove, so `.git/index.lock`,
  `.git/HEAD.lock` and stray `tmp_obj_*` are left behind and block the
  NEXT git command. Set `GIT_INDEX_FILE` to a path outside the mount to
  get a commit through, and hand the user `rm -f` lines for the leftovers.
- `git -C <path>` beats `cd` in handed-over commands: every line is
  standalone, nothing carries between them, no wrong-directory accidents.

Shipped as `486d7ec`, deployed on `662314f`.
