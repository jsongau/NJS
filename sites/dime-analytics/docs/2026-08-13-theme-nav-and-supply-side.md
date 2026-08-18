# 13 August 2026. The retheme, the mega nav, and the supply side.

Three streams ran in parallel against one working copy, with file ownership
fixed in advance so nobody wrote over anybody. What follows is what changed,
what was decided, what was rejected, and what the next session should pick up.

---

## ONE. The theme

### What was asked

> "let's also theme up the play to be fun to match the main event venue. this
> theme is so depression."

He was right. The palette was cool paper, hairlines and a single amber, chosen
to read as restrained enterprise software. The product is a prospecting console
for a bowling, arcade, laser tag and Gravity Ropes family entertainment centre,
and it read as a bank.

### What was decided, and what was rejected

Three directions were fully specified in `RESEARCH_theme_directions.md`, every
one of the 76 tokens constructed in CIELAB at a chosen lightness rather than
typed as a hex, with the contrast of every pair computed before a line of CSS
was written.

- **The Approach**, lane maple ground, pin white cards, brass rule, deep house
  blue for anything pressable. **Chosen.**
- **Ticket Stock**, redemption counter cream and skee ball lacquer with a
  vermillion accent. Rejected: the accent has to appear on data surfaces to
  earn its place, and vermillion next to a red risk token is the one collision
  a colourblind reader cannot resolve.
- **Blacklight House**, arena black with CRT phosphor. Rejected: 102 rows read
  all day on a dark ground is a legibility bill nobody wanted to pay, and the
  provenance badges lose their quietness entirely.

The reasoning that settled it: the complaint was never "not enough colour". It
was a **cool ground**, and a cool ground is what reads as a bank. Warming four
surface tokens fixes the temperature of all twenty routes at once, which is by
a wide margin the highest leverage change available.

### The two defects found while measuring, not while looking

1. **`--line-strong` was `#a3aebc`, 1.99:1 on the page and 2.25:1 on a card,
   across 65 declarations.** The resting boundary of every secondary control in
   the application was carried by nothing that clears WCAG 1.4.11. It is now
   `#837a72`, 3.06:1 against the darkest paper in the theme. `--line-2` went
   with it, 1.57:1 to 2.09:1.

2. **The nine lane ramp had a dichromatic CIEDE2000 floor of 1.32.** Two of the
   nine, colleges and faith, sat 0.07 L\* apart. For the owner, who is
   colourblind, the ramp was doing nothing at all; only the glyph was working.
   Rebuilt as **three hue families crossed with three value bands about 11 L\*
   apart**, which takes the floor across all 36 pairs to **8.85** and resolves
   in greyscale to three flat bands 1.54:1 and 1.47:1 apart.

The ramp lives entirely in `tokens.css`, so `lanes.ts` did not have to move.
Never hardcode a lane list; iterate `LANE_ORDER` and read `LANE_META`.

### The trap

The theme was applied as a **value level change only**. Every token kept its
name, because sixty-odd CSS module files reference them and a rename would have
been an API change disguised as a paint job. Four raw hex values that had been
typed straight into component modules survived the old theme and read as
leftovers the moment the ground turned warm: three in `FieldPage.module.css` and
one in `Button.module.css`. Two new tokens were added for the inverted panel,
`--text-inverse-2` at 9.75:1 and `--line-inverse`, and the hexes were replaced.
The only raw hex left in the codebase is inside a `@media print` block on the
week sheet, where black on white is the correct answer.

### The argument, published

`/method` gained section 09, "The theme and its proof": the theme named, the
statement that nothing was sampled from Main Event and every colour was
constructed in CIELAB, the text ramp measured against three named papers plus
the worst of fourteen backgrounds, the `--line-strong` figures before and after,
and the nine lane table with each lane's nearest neighbour separation before and
after. The accessibility work is the flex, not the palette.

---

## TWO. The mega nav and the mobile drawer

### What was asked

> "Let's have a mega nav too so that important things like trade area and inbox
> and things you suspect i will need to click on most will be there. also rename
> it to maps."
>
> "optimize it for mobile too so menu with hamburger menu for the mega nav."

### What was rejected

The horizontal bar with hover panels that the side rail replaced. That bar was
drawn on a good argument, that a tight navigation budget stops an information
architecture eroding, and it was defeated by a fact: this application has
twenty screens inside the shell and ten of them could only be reached by
hovering. A screen was specified, built, and then lost inside those panels for
long enough to be asked for a second time.

So the rail stays and the mega nav is a **different thing**: a slim persistent
strip carrying six destinations, always visible, no hover reveal, no second
level. **Today, Inbox, Requests, Desk, Maps, Book.** That is the daily loop:
plan, read replies, answer inbound, work outbound, plan a go see run, count what
is signed. Lanes, Packages, Method and Coaching are reference. Sent, Replies and
Objections are the record behind Inbox. Week sheet and Capacity open from Book.
Partners, Promo stock and Budget are resources rather than queues.

### The one decision worth remembering

The counts in the strip and the counts in the rail come from **one exported
hook**, `useShellFigures()` in `SideRail.tsx`, keyed by route. Two navigations
showing two different numbers for the same queue is the kind of defect nobody
files and everybody stops trusting, and the only reliable fix is that there is
one place the number can come from.

### The rename

Five human readable occurrences of "Trade area" became "Maps", plus one aria
label on the map canvas found afterwards. **The route stays `/map`.** Renaming
it would have broken `emit-route-stubs.mjs`, the deployed URL and every deep
link of the form `/map?prospect=<id>`.

### Mobile

Below 900px the 252 pixel rail is not affordable, so it folds into a drawer
behind a hamburger. Measured at 390 by 844 with touch emulation: the hamburger
is a real button with `aria-expanded` and `aria-controls` at 82.6 by 44.0,
focus enters the drawer on open and leaked on 0 of 40 forward tabs and 0 of 12
backward tabs, Escape closes it and returns focus to the hamburger, following a
link inside it does the same, `main` takes `inert` and `aria-hidden` while it is
open, the page scroller is frozen and its offset restored on close, and all 41
targets inside clear 44 pixels.

Six items fit at 900px and above. Below that the strip carries the top three and
the drawer carries the rest. Dropping to three at 780 instead was tried and
clipped Maps and Book between 780 and 860, so the drop shares the 900
breakpoint.

The map takeover stays a takeover: it unmounts the rail, and the mega nav goes
with it. Its own exit control was checked on a phone, since there is no Escape
key there, and sits at 75.4 by 44 above the fold.

---

## THREE. The supply side

### What was asked

He is also applying to a comparable role at Round1 Cerritos and wanted the tool
to demonstrate what that posting names, in particular supplier and licensor
relationships, sell through reporting for licensors, and budgets, purchase
orders, invoices and contract terms.

### What the sources actually say

All 21 responsibility bullets and all nine qualifications from the Round1
posting are transcribed verbatim in `RESEARCH_licensors.md` with a covered
column. Fully covered: 1 to 7, 10, 12 to 18. Partly covered: 8, 9, 19.

**Bullet 11 and the last qualification, both anime and game properties, are
deliberately not covered.** No source read publishes an anime or game licence
Jay can reach, so none was seeded. Faking one would have been the only real
risk in this whole build.

`natures-mark.com/partners/` was read on 13 August 2026 and names exactly nine
licence partners: Disney, Peanuts, Sanrio, Warner Bros., Rudolph, Paramount,
Coca-Cola, Precious Moments and Sesame Street, plus 24 retailers. Two things it
does **not** say, both recorded as absences rather than quietly filled in:

- **Harry Potter appears on the root page only, not on the partners page.** It
  is flagged as such on screen rather than merged into the list.
- **Neither page names a factory, a country of manufacture, or any sourcing
  route. China is not mentioned anywhere.** No such claim appears in the app.

The framing line on `/partners` reads **"Capability, not a venue deal."** There
is no partnership between Main Event and any licensor, and the page says so
before it says anything else.

### The three surfaces

| Route | Label | Carries |
| --- | --- | --- |
| `/partners` | Partners | Supplier and licensor relationships, lead time, minimum order, state, last worked, next action |
| `/promo` | Promo stock | Sell through by line, and the statement a licensor actually receives, with the royalty position and the minimum guarantee |
| `/spend` | Budget | Budget against committed against actual, purchase orders, invoice ageing, contract terms and the notice by date |

### The data model

| Domain | Data | Selector | Rows |
| --- | --- | --- | --- |
| `licensing.ts`: Licence, Partner, PromoLine, Contract, BudgetLine, PurchaseOrder, Invoice | `partners.ts` | `selectors/partners.ts` | 10 licences, 24 retailers, 13 partners |
| | `promo.ts` | `selectors/promo.ts` | 20 lines across 2 periods |
| | `spend.ts` | `selectors/spend.ts` | 8 budgets, 21 purchase orders, 20 invoices, 8 contracts |

Nothing derived is stored. Sell through, margin, weeks of cover, days since
worked, committed, ageing and the notice by date are all computed at render.

### The third ledger

The Book keeps two ledgers, revenue and activity, and never sums them.
Merchandise money is a **third** thing. `selectors/promo.ts` imports nothing
from `BookProvider`, the rule is stated in three code comments, and it is stated
on screen as well so a reader cannot add the two figures by eye either.

---

## Proof

- `npx tsc -b` clean under strict mode.
- `npm run build` clean, 120 route stubs emitted.
- `scripts/shot-all-routes.mjs`, 22 routes at 1440 and at 380: zero page errors,
  zero console errors, zero horizontal document overflow.
- `scripts/contrast-walk.mjs`, every rendered text node on 20 routes at both
  widths, alpha composited down the ancestor chain, size and weight aware:
  **0 failures of 26,629 nodes.**
- `scripts/proof-meganav.mjs`, the drawer assertions above: exit 0, no problems.
- `scripts/proof-supply.mjs`, the three new routes: zero errors, zero overflow,
  zero block controls under 44 pixels at either width.

One trap worth writing down. The stub tile the proof scripts substitute for the
CARTO basemap, which is unreachable from the build container, was a 50 percent
transparent **pure yellow** pixel while its own comment called it neutral grey.
Every map screenshot taken for two days showed a highlighter coloured trade
area that nobody could find in the CSS, because it was never in the CSS. It is
now an actual neutral.

---

## Next steps, in order

1. **Deploy.** Repo `jsongau/NJS`, Vercel project `njs`, path `/me`. Wipe `me/`
   in the site repo before extracting, or orphaned asset bundles accumulate.
   Confirm the remote before any push, and verify HEAD moved afterwards: a push
   has silently shipped nothing on this repo before.
2. The shared `ContextSelect` was raised to 44 pixels under a coarse pointer
   only. If the desk ever gains a touch first layout, revisit.
3. Round1 bullets 8, 9 and 19 are partly covered. Covering them needs an
   internal department model and a meeting notes model, neither of which should
   be invented without a source.
4. The JS bundle is 1.27 MB before gzip. Leaflet is already split out. The three
   new routes are static enough to lazily import if that ever matters.
