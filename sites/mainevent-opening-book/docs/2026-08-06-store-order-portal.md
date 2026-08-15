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
