# The Jar Club: three mega nav directions

Written 2026-08-10. Companion previews live at `njs-site/previews/meganav-v1-proofline.html`, `meganav-v2-lid.html`, `meganav-v3-rickhouse.html`.

**Label note.** The second consumer destination is labelled **Convert** in the previews and in this document. In the markup its view id is `view-confirm`. If the label ships as Convert, rename the view id at the same time so the hash, the id and the label agree.

---

## 0. What the code actually says, which changes the diagnosis

Before the research, one correction that matters, from `/Users/kytlegacy/Documents/Resume and CV/njs-site/olesmoky/index.html`:

- There are **four** top-level views, not three: `view-enter` (3541), `view-confirm` (3832), `view-me` (4058), `view-model` (4293).
- The numbered pill group `.vsw` is declared `role="tablist" aria-label="Views"` (3496). It is not a wizard in the markup. It is a **view switcher across peer destinations**, and three of the four peers were put in it while the fourth, the model, was exiled to a `.distb` button beside an external link and a sound toggle.
- The second row `.jnav` (4059) lives **inside `view-me` only**. It is not a global row. It sticks at `top:var(--hdh,58px)` (line 1275) and is 48px tall (1321). So desktop chrome is 58 + 48 = 106px, and it is only 106px on one of four views.
- At mobile the rule at line 1022 sets `.vsw{order:9;flex:1 0 100%}`, so the switcher **wraps to its own full-width row**. Mobile is three rows, not two. That is where the 130px comes from.

So the precise defect is: **four peers, one of which is the artefact a hiring manager should open first, distributed across three visual classes (numbered pills, outline buttons, an exiled button) with a sound toggle at equal weight.** The nav does not have a hierarchy problem. It has a **set membership** problem.

---

## 1. Research: what recurs, with sources

### Finding 1. The single most repeated solve is a separately named, deliberately un-matching professional entry point at the far right.

Not a smaller button. A **different species of label**, positioned outside the consumer set.

- **Resident Advisor** ships `RA | Events | Music | Magazine | 2000-25` then, past the search and account affordances, a link literally labelled **`/pro`** ([ra.co](https://ra.co/), links to [ra.co/pro](https://ra.co/pro)). It is written as a URL path. It cannot be mistaken for a fifth consumer tab because it is not written in the same language as the other four. RA also duplicates the professional entry in the footer as a question, `Are you a promoter?` with `Submit event`, rather than as a nav item.
- **DICE** ships `Browse events | Get help | Create events | Log in / Sign up` plus a filled `Get the app`. `Create events` is the professional surface and resolves to `/partners` ([dice.fm](https://dice.fm/)). The consumer items are nouns. The professional item is a verb. Same trick as RA, different mechanism.
- **Eventbrite** goes further: `Find Events` is a plain link, `Create Events` is a mega panel with four columns (Solutions, Industry, Event Types, Blog), and there is a second, separate `Organizer Resource Hub` ([eventbrite.com](https://www.eventbrite.com/)). The consumer side gets one word. The professional side gets an entire panel. Panel size is the hierarchy signal.

**Read across for The Jar Club:** the model is the `/pro`. It should be labelled and typeset unlike the consumer tabs, positioned outside their group, and given more visual apparatus than any consumer tab, not less.

### Finding 2. Loyalty products do not put the member surface in the marketing nav. They put it behind the account chip.

- **Marriott Bonvoy** runs a marketing nav (`Find & Reserve`, `Special Offers`, `Vacations`, `Our Brands`, `Our Credit Cards`, `About Marriott Bonvoy`, `Meetings & Events`) and a **completely separate account dropdown** carrying the member surface: `Overview`, `Activity`, `My Trips`, `Favorites`, `Promotions`, `Profile`, `Member Benefits`, with the points balance at the top of the panel ([marriott.com/loyalty.mi](https://www.marriott.com/loyalty.mi)). Seven member sections, zero of them in the top bar.
- **Delta** does the same and is worse to reach: the SkyMiles dashboard is behind your name in the upper right, then `My SkyMiles` at the bottom of the account panel, with `My SkyMiles`, `My Trips`, `My Profile`, `Receipts` as the subcategories ([AwardWallet](https://awardwallet.com/news/delta-skymiles/medallion-status-dashboard/)). The Delta redesign's headline feature is that the status tracker fits on **one page**, with circles replacing bar graphs, and a lifetime figure below.
- The pattern is consistent with `account-profile-ux.md` in this repo: 11 of 17 premium products surveyed use a sidebar or a panel for the account, and top tabs survive only inside native windows or modals.

**Read across:** the six section tabs (Overview, Quests, Streak, Prize wall, Badges, Activity) are Marriott's seven account items. Nobody puts those in the site chrome.

### Finding 3. Spirits brands have essentially no owned membership nav, and the one loyalty link they carry is a quiet outlier at the end.

- **Jack Daniel's**: `Shop`, `Cocktail Recipes`, `Our Story`, `Distillery Tours`, `News & Events`, then **`Subscribe`** last, resolving to `/become-a-friend` ([jackdaniels.com](https://www.jackdaniels.com/en-us)). The actual membership, Tennessee Squire, is not in the nav at all. It is a footer link.
- **Bulleit** (Diageo): `Shop Now`, `Merchandise`, `The History`, `The Whiskey` (a three-item dropdown), `Cocktail Recipes`, `Food & Cocktail Pairings`, `Visit Us`, then **`Sign Up`** last ([bulleit.com](https://www.bulleit.com/)).
- **Aviation** (Diageo): a campaign item, `PRODUCTION`, `COCKTAILS`, `ENTERTAINMENT`, `BUY`, then **`join-us`** last ([aviationgin.com](https://aviationgin.com/)).
- **Ole Smoky's own site**: `Find a Jar`, `Our Products`, `Recipes`, `Distilleries`, `Merchandise`, `About` (with `Sweepstakes` buried inside About), plus a bare `/account` and cart at top right ([olesmoky.com](https://olesmoky.com/)). Their sweepstakes is a sixth-level item inside a dropdown.

Three of three Diageo/Brown-Forman brands terminate the nav with a single membership verb. None of them carry a member dashboard. `account-profile-ux.md` already establishes there is no real spirits preference centre in the category. **The nav evidence corroborates it: the category has never had to solve this, which is the argument for solving it visibly.**

### Finding 4. Where the analytics and consumer surfaces genuinely coexist, the resolution is a context switch, not a shared row.

Spotify's own engineering write-up on Spotify for Artists describes a `MastheadHeader` and `MastheadFooter` as components "presented within every Spotify for Artists surface" ([Spotify Engineering](https://engineering.atspotify.com/2024/02/applying-the-facade-pattern-on-spotify-for-artists)). The professional surface has its own chrome, not a slot inside consumer chrome. Shopify's equivalent is the **store switcher in the top bar**, with navigation in a left sidebar on desktop and a dropdown from the title bar on mobile ([Shopify Help](https://help.shopify.com/en/manual/shopify-admin/shopify-admin-overview), [shopify.dev navigation](https://shopify.dev/docs/apps/design/navigation)). Shopify's app nav guidance: labels 1 to 2 words, nouns describing the destination.

**Read across:** if you want the model to live in the same bar, you either make it a different species of control (Finding 1) or you make the bar explicitly two-surface (Direction B below).

### Finding 5. NN/g's sticky header numbers, which set the budget.

Page Laubheimer, [Sticky Headers: 5 Ways to Make Them Better](https://www.nngroup.com/articles/sticky-headers/):

- Maximise the content to chrome ratio. The New Yorker at **13:1** on an iPhone 11 Pro is "a reasonable space tradeoff." Lollar Pickups at **2:1** is "miserly," and its second sticky bar is called out as "an unnecessary duplicative tab bar."
- The sticky header **must be opaque**, distinct from the content background. Translucent headers were specifically criticised.
- "In general, it's best to not use animation at all." Two exceptions only: shrinking a large header, and partially persistent headers.
- Partially persistent headers should slide in over **300 to 400ms** and be triggered by a scroll of more than a few pixels so an unsteady hand does not fire them.
- Tap targets minimum 1cm by 1cm, header text about 16pt.

Current state: 130px of chrome on a 390 by 844 viewport is roughly **5.5:1** before the browser URL bar. That is closer to Lollar than to The New Yorker, and the second row is close to literally the "unnecessary duplicative tab bar" NN/g names.

### Finding 6. This repo's own rules already forbid most of the current bar.

From `docs/dashboard-craft-rules.md`:

- Rule 1: "Different metric sets are tabs. **Pill tabs read as consumer app; skip them on an analytics surface.**"
- Rule 2: signal active with three quiet cues, weight +100, full strength colour against 60%, and a 2px indicator flush to the list's bottom border. **Do not fill the active tab with a solid accent block.**
- Rule 5: **cap at 5 tabs, 7 is the hard ceiling.** Write the active tab to `location.hash`. "A reviewer who reloads and loses state reads it as a demo."
- Rule 35: dark theme, no pure black, treat 3:1 as the floor for graphical objects, add 0.5px to line weights.

From `docs/account-profile-ux.md`: spacing converges at **8 label to control, 16 field to field, 24 group, 32 section**, inputs 40 to 44px, touch target 44px iOS. Motion under 400ms, ease-out, in place. No confetti, no mascot. Selected state is a whisper fill plus a bright border plus a non-colour glyph, never a saturated accent fill. Input-grade borders need 3:1; the repo's `--line:#2C231B` on `--surf:#171310` is about 1.2:1 and is decorative only.

**Six sources agree the current bar is wrong in the same way.** It uses a consumer, low-emphasis primitive (numbered pills) to carry a four-way peer switch, and it spends two rows doing it.

---

## 2. Should the second row survive?

**No. Kill it as chrome. Keep it as a page-level section index inside My Jar, and move the counts onto the section headings.**

Five reasons, in order of how hard they are to argue with:

1. **It only exists on one view of four.** It is declared inside `view-me` at line 4059. A sticky row that reserves permanent mental space in the chrome but renders on 25% of routes is the worst of both worlds: it costs the reader a model of the navigation everywhere and pays them back nowhere else.
2. **It breaks the repo's own tab cap.** Six items with numeric chips against a stated cap of 5 and a hard ceiling of 7 (`dashboard-craft-rules.md` rule 5). At 360px, six pills plus five chips is a horizontal scroller, and the first thing a horizontal scroller clips is the chips, which are the only reason the tabs are worth looking at.
3. **It is the wrong primitive by the repo's own rule.** Rule 1: pill tabs read as consumer app, skip them on an analytics surface. These are pills with numeric badges, which is the single most consumer-app pattern available.
4. **NN/g names this exact object.** A second sticky bar duplicating in-page structure is what got Lollar Pickups its 2:1 ratio critique.
5. **Every comparable loyalty product puts these items in an account panel, not the bar.** Marriott's seven (`Overview`, `Activity`, `My Trips`, `Favorites`, `Promotions`, `Profile`, `Member Benefits`) map almost one to one onto ours and none of them are in Marriott's top bar.

**What replaces it.** The six sections become anchored `<section>`s. A single **section index** appears once, inline, at the top of the My Jar page body, in normal document flow. It pins to the underside of the header only after the first section's heading scrolls past it, and unpins when the last section's bottom passes. At rest it costs zero chrome. The counts (30 quests, 0 streak, 40 prizes, 0 of 28 badges) move onto the section `<h2>`s as tabular-num suffixes, where they are read once by a screen reader in the right context instead of six times in a tablist.

Direction C absorbs it best, because a vertical rail has room for a second tier and a horizontal bar does not.

---

# Direction A. The Proof Line

Preview: `njs-site/previews/meganav-v1-proofline.html`

### 1. The idea

**One 56px row, and the model is not a button, it is an instrument: a live five bar funnel drawn from the actual model numbers, so the analytical surface announces itself by looking like a reading rather than a link.**

### 2. The structural decision

- **One row. 56px. Persistent. Opaque `#0F0B08`.** Never a second row.
- **Rows:** 1. **Persistent:** everything. **Collapses on scroll:** nothing disappears; instead past 120px of scroll the row drops from 56px to 48px over 180ms `cubic-bezier(.22,1,.36,1)`, the eyebrow line hides, and the wordmark drops from 15px to 13.5px. NN/g permits exactly this (shrinking a large header) and forbids the disappear-and-reappear jump.
- **Analytical surface:** far right, past a 1px vertical rule at 24px of clearance, in a bordered mono-typeset instrument slot. It is the widest single element in the bar at 168px, wider than any consumer tab.
- **Consumer surface:** centre-left, three underline tabs, no numbers, no pills.
- **Second row:** absorbed. My Jar sections become an in-page index.
- **Cold landing:** the model slot is the only element in the bar with a border, a monospace label, and a graphic. On first visit it plays its pour animation once when it enters the viewport, and carries a 9.5px `--muted` sub-label reading `Start here` for the first session only (`sessionStorage`), which fades out after the first click on anything.

### 3. Exact anatomy

Grid: `display:grid; grid-template-columns:auto 1fr auto; align-items:center; height:56px; padding:0 24px; gap:24px`.

**Zone 1, left. The Bead mark plus wordmark.** Total 214px.

| Element | Spec |
|---|---|
| Mark | 32 by 32 SVG, `viewBox="0 0 24 24"`. See section 4. |
| Gap | 12px |
| Wordmark | `The Jar Club`, 15px / 700 / -0.1px tracking / `--ink`. Line 1. |
| Eyebrow | `AN OLE SMOKY MOONSHINE PROMOTION`, 9.5px / 700 / 1.6px tracking / uppercase / `--muted`. Line 2, 2px below. Hidden below 56px row height and below 640px viewport. |
| Hit area | The whole 214px is one `<a href="#top">`, 44px tall min. |
| Rest | `--ink` on wordmark, `--muted` on eyebrow. |
| Hover | Wordmark to `--gold` over 120ms `ease-out`. The Bead plays its shake and read once, then a 1200ms idle guard before it can replay. |
| Focus | 2px `--volt` ring, 3px offset, 8px radius, around the 214 by 44 box. |
| Active (page top) | No treatment. The logo is never a selected state. |

**Zone 2, centre. Three underline tabs.** `role="tablist"`, `aria-label="Views"`.

| Element | Spec |
|---|---|
| Labels | `Enter`, `Convert`, `My Jar`. Numbers deleted. Nouns and one verb, all 1 to 2 words per Shopify's rule. |
| Type | 13.5px / 600 at rest, **14px / 700 when active** (the +100 weight cue from rule 2) |
| Colour | rest `#B0A28C` (`--muted`), active `#FBF3E4` (`--ink`) |
| Box | height 44px, padding 0 14px, no background, no radius, no border |
| Gap | 4px between tabs (they read as one list), 24px from zone 1 |
| Active indicator | 2px bar, `--gold`, flush to the bottom of the 56px row (`bottom:0`), width = the label's text width not the padded box width, so it reads as an underline of the word. Slides between tabs with `transform:translateX` plus `scaleX` over 220ms `cubic-bezier(.22,1,.36,1)`. |
| Hover | colour to `#D8C9AF`, 100ms `ease-out`, plus a 1px `--muted` at 30% underline at `bottom:0`. No background fill ever. |
| Focus | 2px `--volt` ring, 2px offset, 6px radius. Roving tabindex per APG: active 0, others -1, Left and Right keys wrap, Home and End jump. |
| Reload | active view written to `location.hash` (rule 5) |

**Zone 3, right.** Reading left to right: instrument slot, 1px rule, account chip, overflow.

| Element | Spec |
|---|---|
| **Instrument slot** | 168 by 40px `<button>`. Border 1px `#5E4E3B` (3:1 against `--surf`, the audited legal border from the passport build). Radius 6px. Background `#141009`. Padding 0 12px. `display:grid;grid-template-columns:auto 1fr;gap:10px`. |
| Slot label | `THE MODEL`, 11.5px / 600 / 0.4px tracking / uppercase / `ui-monospace, SFMono-Regular, Menlo, monospace` / `--ink`. Monospace is the whole point: nothing else in the bar is monospace. |
| Slot sub-label | `Funnel, cost, sources`, 9.5px / 500 / `--muted`, second line. Hidden below 900px. |
| Slot graphic | 26 by 16 sparkbar, right-aligned in the slot. See section 4. |
| Slot hover | border to `--gold-deep`, background to `#191308`, 120ms `ease-out`. The pour plays once, guarded 400ms so a cursor passing through does not fire it. |
| Slot focus | 2px `--volt`, 3px offset, 8px radius. Pour plays. |
| Slot active (on `view-model`) | border 1px `--gold`, background `rgba(255,210,74,.07)` (a whisper fill, about 1.3:1, per the repo's selected-state rule), and the sparkbar's fifth bar stays `--moss` instead of reverting. Non-colour cue: a 2px `--gold` bar at the slot's `bottom:-1px` matching the tab indicator, so "selected" is the same grammar everywhere. |
| **Divider** | 1px by 24px, `#2C231B`, 24px margin left, 16px right. Decorative only, so 1.2:1 is legal here. |
| **Account chip** | 40px circle when signed out, 40 by 40 avatar when signed in. Signed out shows the letter-free Bead mark at 18px in `--muted`. Signed in shows the initial, 15px / 700, `--gold` on `#1C1610`. Hit area 44 by 44. Opens a panel, not a page. |
| **Account panel** | 280px wide, anchored right, 8px below the bar, `#141009`, 1px `#2C231B`, radius 10px, 24px padding, `box-shadow:0 18px 50px rgba(0,0,0,.66)`. Rows 44px, 13.5px / 500. Contents in order: `Sign in` or the member's name plus point balance in tabular-nums, a 1px rule, `Distribution model` (opens the external `/olesmoky/distribution/`, marked with a 9.5px `--muted` `Opens a new tab`), a 1px rule, `Sound` as a switch, `Reduced motion` as a switch. **The sound toggle and the model are now in different tiers, which was the brief's complaint.** |
| Panel open | scale 0.97 to 1 with origin top right plus opacity 0 to 1, 160ms `cubic-bezier(.16,1,.3,1)`. Close 120ms `cubic-bezier(.4,0,1,1)`. `Escape` closes and returns focus to the chip. Focus trapped while open. |

**Total desktop chrome: 56px, dropping to 48px on scroll.** Content to chrome at 390 by 844 goes from about 5.5:1 to about **14:1**, past The New Yorker's 13:1.

### 4. The custom animated SVG

#### Mark 1. The Bead

Moonshiners proof a jar by shaking it and reading the **bead**, the ring of bubbles that forms at the surface. Big bubbles that hang mean high proof. It is a real Appalachian measurement ritual, which is exactly the bridge between the brand and the analytical claim this page is making.

**Geometry, `viewBox="0 0 24 24"`:**

- Jar shoulder: one path, `M5.4 6.2 C5.4 4.6 7.2 3.6 12 3.6 C16.8 3.6 18.6 4.6 18.6 6.2 L18.6 19.4 C18.6 20.6 17.4 21 12 21 C6.6 21 5.4 20.6 5.4 19.4 Z`, stroke 1.4px `--gold` at 85%, fill none. Straight-sided with a slight shoulder, which is what a real Ball jar is, not a rounded bottle.
- Liquid surface: `M6.1 13 Q12 13.9 17.9 13`, stroke 1px `--gold-deep` at 70%.
- Fill below the surface: the same path closed to `y=20.4`, fill `--amber-mid` at 0.18 alpha.
- Seven bubbles, all `cy=11.4`, riding the surface, radii and centres:
  `r 2.6 cx 7.2`, `r 2.2 cx 9.6`, `r 1.8 cx 11.6`, `r 1.5 cx 13.3`, `r 1.2 cx 14.8`, `r 1.0 cx 16.0`, `r 0.8 cx 17.0`.
  Fill `--gold-deep` at 0.9. Each carries a meniscus highlight: a 0.5px `#FBF3E4` arc at 55% alpha across the upper-left quadrant only, from 200 to 290 degrees.

**Legibility at 20px:** at 20px the four smallest bubbles are under 1px and alias into a smear. Ship a second `<symbol id="beadSm">` with only the first four bubbles (r 2.6, 2.2, 1.8, 1.5) and no meniscus highlights, swapped by CSS at `width < 28px`. The four-bubble version still reads unambiguously as beading because the taper is the information, not the count.

**Legibility at 64px:** add the surface hairline at 0.5px, add the meniscus arcs, and add a 0.75px `#FBF3E4` at 20% vertical highlight down the jar's left wall from y=5 to y=19. At 64px the seven bubbles resolve individually and the taper reads as a measurement, not a decoration.

**Animation: the shake and the read.** Four beats, total 1860ms, plays once on first paint and once per hover with a 1200ms guard. Never loops.

| Beat | What physically happens | Spec |
|---|---|---|
| 1. Shake, 0 to 240ms | You shake the jar | Whole `<g>` translates x through -1.5, +1.5, -0.9, +0.5, 0 at keyframes 0/22/46/72/100%, `cubic-bezier(.36,.07,.19,.97)` |
| 2. Bead forms, 200 to 620ms | Bubbles surface largest first | Each circle `transform:scale(0)` to `scale(1)` about its own centre via `transform-box:fill-box;transform-origin:center`, 180ms each, `cubic-bezier(.16,1,.3,1)`, staggered **40ms** in size order descending |
| 3. Hold, 620 to 1520ms | You read it | No change. This is the point of the whole animation and it needs to be still. |
| 4. Bead collapses, 1520 to 1840ms | Bubbles pop, smallest first | `r` to 0 over 140ms each, staggered **30ms**, ascending size order, `cubic-bezier(.7,0,.84,0)`. Ease-in-quart makes them pop rather than fade, which is what surface tension actually does. |
| 4b. Surface settles, 1540 to 1840ms | The liquid stills | The `Q` control point's y animates 13.9 to 13.1, 300ms `cubic-bezier(.22,1,.36,1)` |

`prefers-reduced-motion: reduce`: render the four-bubble static state at full scale. No shake, no scale, no collapse, no settle. The mark still says what it says.

#### Mark 2. The Funnel Sparkbar

Not a chart glyph. Five graduated cylinders being filled by one pour.

**Geometry, `viewBox="0 0 26 16"`:** five bars, width 3px, x at `0, 5.75, 11.5, 17.25, 23`, all flat-bottomed on `y=16`, top corners `rx=1`. Heights from a real 100 / 70 / 46 / 27 / 13 funnel: **16, 11.2, 7.4, 4.3, 2.1**. Baseline: a 0.75px rule across the full 26px at `y=16`, `--muted` at 35%. Fills: bar 1 `--amber-mid`, bars 2 to 4 `--gold-deep` at 70%, bar 5 `--moss`.

**Legibility at 20px:** 5 bars at 3px with 2.75px gaps is 26px of art; scaled to 20px the gaps drop to 2.1px, which still separates. Below 20px, ship a three bar variant at heights 16, 8.4, 2.6.

**Legibility at 64px:** reveal a 0.5px dotted `--muted` horizontal rule at bar 3's height, spanning the full width, as a target line. Per craft rule 20, a target is a dashed rule with no fill underneath.

**Animation: the pour.** Physically, a stream falls and each cylinder fills.

| Beat | Spec |
|---|---|
| 1. Stream, 0 to 160ms | A 1.4px `--amber-mid` open path from `(1.5,-3)` to `(1.5,0)` revealed by `stroke-dashoffset`, **160ms `linear`**. Linear is physically correct; a falling stream is at constant velocity over this distance. |
| 2. Bar 1 fills, 130 to 390ms | `clip-path:inset(100% 0 0 0)` to `inset(0 0 0 0)`, 260ms `cubic-bezier(.33,1,.68,1)` |
| 3 to 6. Bars 2 to 5 | Stream re-anchors to each bar's x, then the bar fills. Stagger **110ms**. Durations shorten with volume: 240, 210, 180, 150ms. Same curve. |
| 7. Conversion, final 120ms | Bar 5's fill transitions `--gold-deep` to `--moss` over 120ms `ease-out`. That colour change is the only moment in the bar that uses `--moss`, so it earns it. |

Total **860ms**, under the repo's 400ms per-step and in-place motion rule (no single step exceeds 260ms and nothing moves out of the box). Plays once on first `IntersectionObserver` entry, once per hover with a 400ms idle guard.

`prefers-reduced-motion: reduce`: all five bars at final height, final fills, no stream, no clip sweep.

### 5. Mobile at 390px (and 360px)

- Row stays **one row**, height 56px, padding `0 16px`.
- The eyebrow line hides below 640px. Wordmark alone at 15px.
- The three tabs move to **`flex:1` equal thirds** across the full width of the centre zone, 44px tall, label 13.5px centred. At 360px that is 3 by 96px minus gaps, which fits `My Jar` at 13.5px with 7px of side room.
- The instrument slot **loses its label** and becomes a 44 by 44 square carrying only the sparkbar at 26 by 16, centred, with the 1px `#5E4E3B` border kept and `aria-label="The model. Funnel, cost and sources."`. It stays to the left of the account chip and keeps the border, which is the whole hierarchy signal, so it survives.
- **Dropped on mobile:** eyebrow, slot sub-label, the divider rule.
- **Moved:** sound, distribution, reduced motion, sign in, all inside the account panel, which on mobile becomes a bottom sheet, `100vw`, `max-height:70vh`, rows 48px, with `padding-bottom:env(safe-area-inset-bottom)`.
- Tap targets: tabs 44 by 116 at 390px, slot 44 by 44, chip 44 by 44, gaps 8px minimum (Material's target separation floor).
- At 360px: tab padding drops from 14px to 10px. Nothing else changes. Nothing wraps.

### 6. Best at, and the sacrifice

**Best at:** cheapness and honesty. It is the smallest possible change that fixes all four stated defects, it halves the chrome, and it makes the model unmistakable without any new mental model for the reader. The sparkbar is genuinely persuasive; a hiring manager sees a real funnel shape in the chrome before they click anything, which is a claim the page can then back up.

**Sacrifices:** it is conservative. The bar looks like a good bar, not like an idea. It also **puts the second-most-important consumer destination, Distribution, inside a menu**, where a cold visitor will probably never find it. And the instrument slot's persuasiveness depends entirely on the sparkbar's numbers matching the model's real numbers; if they drift, it becomes the thing rule 29 calls a distrust hit.

### 7. Build cost

**9 to 13 hours.** Bar layout and the three-tab indicator 3h. The Bead symbol, two size variants, four-beat animation 2.5h. Sparkbar plus pour, wired to the real model constants 2.5h. Account panel with focus trap, Escape, and the four moved controls 2h. Mobile, 360px, reduced motion, APG roving tabindex, hash state 2h. Rewiring the existing `.vsw` handlers 1h.

---

# Direction B. The Lid

Preview: `njs-site/previews/meganav-v2-lid.html`

### 1. The idea

**The bar has two surfaces and says so: a physical two-position lid ring turns to switch the whole nav between THE CLUB and THE WORK, so the analytical destinations are not squeezed in beside the consumer ones, they replace them.**

This is the RA `/pro` and Shopify store-switcher pattern taken literally, and it is the only one of the three directions that engages the actual structural problem in the brief rather than routing around it.

### 2. The structural decision

- **One row. 60px. Persistent. Opaque `#0F0B08`.**
- **Persistent across both surfaces:** the mark, the wordmark, the lid switch, the account chip. Four elements, always in the same pixels.
- **Swapped by the switch:** the middle of the bar. In **CLUB** it carries `Enter`, `Convert`, `My Jar`. In **THE WORK** it carries `The model`, `Distribution`, `Method notes`. Same geometry, same tab grammar, different set, different typeface (CLUB uses the display face, THE WORK uses monospace at 12.5px with 0.4px tracking).
- **Collapses on scroll:** past 140px of scroll the row goes 60px to 48px, 180ms `cubic-bezier(.22,1,.36,1)`, and the wordmark drops to just the mark. The lid never shrinks below 28px because it is the state indicator.
- **The surface is in the URL**: `#club/me` and `#work/model`. Back button works. Reload preserves.
- **Cold landing:** on a first-ever visit the lid sits in CLUB but plays a **single 82 degree half-turn and return** at 900ms after paint (a 620ms round trip), which is a physical hint that the thing turns, and a 9.5px `--muted` label under it reads `Turn for the analysis`. Both suppressed after the first turn, stored in `localStorage`. This is the single strongest cold-landing signal of the three directions, because it moves.

### 3. Exact anatomy

Grid: `grid-template-columns:auto auto 1fr auto; height:60px; padding:0 24px; gap:20px`.

| Element | Spec |
|---|---|
| **Mark** | 32 by 32 Bead (reuse from A, or the jar silhouette alone). `--gold` at 85%. |
| **Wordmark** | `The Jar Club` 15px / 700 `--ink`. Eyebrow `AN OLE SMOKY MOONSHINE PROMOTION` 9.5px / 700 / 1.6px `--muted`, hidden below 720px and on the collapsed row. |
| **The lid switch** | The centrepiece. A 44 by 44 hit area containing a 28 by 28 SVG. `role="switch"`, `aria-checked` false in CLUB and true in THE WORK, `aria-label="Surface. The Jar Club or The Work."` Sits immediately right of the wordmark with **24px** of clearance, which is a group-level gap, so it visibly does not belong to the wordmark. |
| Lid label | To the right of the ring, 12px: `THE CLUB` or `THE WORK`, 10.5px / 700 / 1.4px tracking / uppercase / mono. Colour `--muted` in CLUB, `--gold` in THE WORK. The label **crossfades over 140ms** at the animation's midpoint, so the word changes while the ring is turning, not before or after. |
| Lid rest | ring stroke `--gold` at 70% |
| Lid hover | ring stroke to `--gold` at 100%, plus a 4 degree pre-turn on the ring only, 140ms `cubic-bezier(.34,1.3,.64,1)`, which is the thread taking up slack. Returns on mouseleave in 180ms `ease-out`. |
| Lid focus | 2px `--volt` ring, 3px offset, **around the 44px hit area, not around the 28px art**, radius 10px |
| Lid active (mousedown) | ring scales 0.96, 80ms `ease-out` |
| **The tab set** | Three tabs, identical box and indicator grammar to Direction A: 44px tall, 14px padding, 2px `--gold` bottom indicator at the row's `bottom:0` sliding 220ms `cubic-bezier(.22,1,.36,1)`, active +100 weight, `--ink` against `--muted`. |
| CLUB set type | 13.5px / 600, display face. Labels `Enter`, `Convert`, `My Jar`. |
| WORK set type | **12.5px / 600, monospace, 0.4px tracking, uppercase.** Labels `THE MODEL`, `DISTRIBUTION`, `METHOD NOTES`. The typeface change is the surface cue and it does not rely on colour. |
| Set swap | The outgoing set: `opacity` 1 to 0 plus `translateY(0)` to `translateY(-4px)`, 140ms `cubic-bezier(.4,0,1,1)`. The incoming set: `opacity` 0 to 1 plus `translateY(4px)` to 0, 200ms `cubic-bezier(.16,1,.3,1)`, starting at 120ms. Total 320ms, matching the lid's 420ms turn so the lid lands slightly after the labels settle, which reads as the mechanism causing the change rather than accompanying it. |
| **Surface tint** | In THE WORK the row's background shifts `#0F0B08` to `#0C0A09` and a 1px `--gold` at 22% appears along the row's bottom edge, 200ms `ease-out`. Very quiet. Enough that a screenshot of the two states is distinguishable without the labels. |
| **Account chip** | Identical to Direction A. 40px, panel 280px, `Sign in`, rule, `Sound` switch, `Reduced motion` switch. **Distribution is no longer in the panel**, because it is now a first-class tab in THE WORK, which is where it belongs. |

**Total desktop chrome: 60px, dropping to 48px.**

### 4. The custom animated SVG: the Two Turn Lid Ring

A mason jar band. The consumer surface is the lid on. The analytical surface is the lid off, so you can see into the jar.

**Geometry, `viewBox="0 0 28 28"`, centre (14,14):**

- **Outer ring:** `circle r=12.6`, stroke 1.6px, fill none.
- **Knurling:** 24 ticks, each a 1px wide `<line>` running radially from `r=11.2` to `r=13.6`, at 15 degree intervals. Stroke `--gold` at 60%. **The knurling is the load-bearing element**: a rotating circle is invisible, but a rotating high-frequency radial pattern reads unambiguously as rotation, even in peripheral vision, even at small sizes.
- **Inner disc (the lid insert):** `circle r=9.2`, fill `#171310`, stroke 0.75px `#2C231B`.
- **The vent gap:** a `circle r=7.4`, stroke 1px `--gold-deep`, `stroke-dasharray` computed so there is a **2.2px gap centred at 12 o'clock**. Circumference is `2 pi 7.4 = 46.5`, so `stroke-dasharray:44.3 2.2` with `stroke-dashoffset` set to place the gap at the top. This gap is the state indicator and it is a **shape**, not a colour, which satisfies WCAG 1.4.1.
- **Underneath the disc:** the five bar funnel sparkbar from Direction A, scaled to fit inside `r=8`, initially hidden by the disc.

**Legibility at 20px:** 24 ticks around a 20px circle puts adjacent ticks 2.6px apart at the outer radius, which is fine, but their 1px stroke at 0.71 scale aliases to grey. Ship a **12 tick variant** (`<symbol id="lid12">`) at `width < 32px`, ticks at 30 degree intervals, stroke 1.2px. At 20px the vent gap is 1.6px of arc, still a visible break. The inner disc at 20px is 6.6px, big enough to read as a filled centre versus an open one.

**Legibility at 64px:** add a second concentric 0.75px arc at `r=8.3` at 30% alpha (the inner lip where the band meets the insert), and give each knurl tick a 0.5px `#FBF3E4` at 25% highlight on its clockwise edge, so the ring reads as machined metal rather than a dial. At 64px the funnel underneath resolves to five distinct bars.

**Animation: the quarter turn.** A real band resists, releases, then stops short on the thread. It does not spin freely and it does not land on a round number.

**CLUB to THE WORK, total 480ms:**

| Element | Spec |
|---|---|
| Ring plus knurling | `rotate(0)` to `rotate(-82deg)` about (14,14), **420ms `cubic-bezier(.34,1.3,.64,1)`**. The 1.3 overshoot is the thread releasing; the curve settles back. **82 degrees, not 90**, because a real band stops just short of the quarter and the asymmetry is what makes it read as a mechanism instead of a UI toggle. |
| Inner disc | Does **not** rotate. The insert stays put while the band turns; that is how a two piece lid works. It scales 1 to 0.86 and fill-opacity 1 to 0, **260ms `cubic-bezier(.4,0,1,1)`** starting at 0ms. Ease-in, because it is being lifted away. |
| Vent gap | Travels with the ring. Ends at roughly 8 o'clock. |
| Funnel underneath | Revealed by the disc's fade. Runs its own pour from 220ms, 860ms as specified in Direction A. |
| Label crossfade | at 210ms, the turn's midpoint, 140ms |

**THE WORK to CLUB, total 440ms:**

| Element | Spec |
|---|---|
| Ring | `-82deg` to `0`, **380ms `cubic-bezier(.4,0,.2,1)`**. No overshoot on the way back, because tightening a band has no release. |
| Disc | scale 0.86 to 1, fill-opacity 0 to 1, 220ms `cubic-bezier(.16,1,.3,1)`, **delayed 60ms** so the ring visibly lands before the lid seals. That 60ms is the whole difference between "a switch flipped" and "a lid closed." |
| Funnel | fades out under the disc, 160ms `linear` |

**`prefers-reduced-motion: reduce`:** no rotation, no scale, no fade. Two static frames swapped instantly. Frame CLUB: vent gap at 12 o'clock, disc opaque. Frame WORK: vent gap at 8 o'clock, disc absent, funnel visible. The vent gap position and the presence of the funnel carry the entire state, without motion and without colour.

### 5. Mobile at 390px

This is where Direction B costs the most and needs the most care.

- Row **58px**, padding `0 16px`. Wordmark hidden below 480px, mark only at 28px.
- The lid switch **stays**, at full 44 by 44, immediately right of the mark. It is the most important control in the bar and it never shrinks. Its text label hides below 480px; the vent gap position and the ring rotation carry the state alone, which is exactly what the reduced-motion frames already prove is sufficient.
- The three tabs go `flex:1` across the remaining width, 44px tall. In THE WORK, the mono labels shorten: `MODEL`, `DIST.`, `METHOD`. At 360px, `DISTRIBUTION` at 12.5px mono is 96px and does not fit; `DIST.` is 38px and does. Full labels stay in the `aria-label`.
- **Dropped on mobile:** eyebrow, lid text label, the row's surface tint (it is invisible against a phone's ambient contrast anyway; the vent gap does the work).
- Account chip 40px, panel becomes a bottom sheet with safe-area inset.
- **The risk to name:** a switch that changes the meaning of the three tabs beneath it is a mode, and modes are the most reliably confusing thing in mobile UI. Mitigations, all required: the mono typeface change, the vent gap position, the URL hash, and a **one time 2400ms toast on the first turn** reading `You are on The Work. Turn the lid to go back to the Club.` No toast after that.

### 6. Best at, and the sacrifice

**Best at:** this is the only direction that is an *idea* rather than a tidy-up, and it is the only one that structurally answers the brief's actual question about two surfaces behind one nav. It also gives Distribution and a future Method notes page real homes instead of menu exile, and it scales: THE WORK can grow to five tabs without touching the CLUB side. For a work sample being read by a CRM Director, a nav that demonstrates you understand the consumer-surface versus analytics-surface split is itself an argument for the candidate.

**Sacrifices:** it introduces a **mode**, which is the single most expensive thing you can add to a navigation. A cold visitor who turns the lid and does not understand what happened is worse off than they were with the current bar. It is also the highest risk on mobile, where the mode cue is smallest. And it is the most expensive to build correctly, because the state machine touches the URL, the back button, focus management, and every deep link on the page. If you build this and skimp on the hash and history handling, it will read as a demo, which is precisely rule 5's warning.

### 7. Build cost

**14 to 19 hours.** The lid SVG with two tick variants, the dasharray vent maths, and the two directional animations 4h. The surface state machine including `hashchange`, `popstate`, deep links, and focus restoration after a swap 4h. Tab set swap with the two typefaces and the staggered crossfade 2.5h. Row collapse plus surface tint 1.5h. Account panel 2h. Mobile, 360px, label shortening, the mode toast, reduced-motion frames 3h. Rewiring existing handlers 1.5h.

---

# Direction C. The Rickhouse Rail

Preview: `njs-site/previews/meganav-v3-rickhouse.html`

### 1. The idea

**Take navigation off the top of the page entirely: a vertical rail on the left on desktop, a bottom bar on mobile, built as a rickhouse elevation where each destination is a barrel on a timber rick and the analytical surface is a whiskey thief hanging below the rule.**

### 2. The structural decision

- **Zero rows.** Top chrome is **0px**. Content to chrome vertically becomes effectively infinite, which is the maximum possible answer to NN/g's ratio guidance.
- **Desktop (900px and up):** a fixed left rail, **64px collapsed, 224px expanded**. Expands on hover after a **220ms intent delay**, on `:focus-within` immediately, and stays expanded if the user pins it (a 24px pin control at the rail's foot, persisted to `localStorage`). Content gets `margin-left:64px` and the rail overlays when expanded, so the page never reflows.
- **Mobile (under 900px):** the rail becomes a **fixed bottom bar**, 56px plus `env(safe-area-inset-bottom)`, five slots.
- **Persistent:** everything. Nothing collapses on scroll, because there is nothing above the content to collapse.
- **The analytical surface** sits at the **foot of the rail**, below a 1px full-width rule and 24px of clearance, in its own group, with its own mark (the thief) and its own type treatment (mono). Physically separated, not just visually.
- **The second row is absorbed properly here.** When `My Jar` is the active rail item, the rail grows a **second tier**: the six sections indented 16px under it, 36px rows, 12.5px labels, counts right-aligned in tabular-nums. This is Marriott's account panel and Shopify's sidebar, and it is the only one of the three directions with somewhere natural to put them.
- **Cold landing:** the rail auto-expands to 224px on first-ever load and stays expanded for 3000ms before collapsing, with a 380ms collapse. Every label is readable during that window. The thief item at the foot carries the label `The model` plus a 10.5px `--muted` line `The analysis behind this` and is the only rail item with a `--gold` left border at rest.

### 3. Exact anatomy

**Desktop rail.** `position:fixed;left:0;top:0;bottom:0;width:64px;background:#0C0A08;border-right:1px solid #2C231B;z-index:80`. Transition `width 260ms cubic-bezier(.22,1,.36,1)`.

| Element | Position | Spec |
|---|---|---|
| **Mark** | top, 20px from top, centred | 32 by 32 Bead. Expanded, the wordmark fades in to its right at 15px / 700 with the eyebrow beneath at 9.5px, `opacity` 0 to 1 over 160ms delayed 100ms. |
| **Rule** | 24px below the mark block | 1px, `#2C231B`, inset 12px each side |
| **Group 1: the promotion** | starts 24px below the rule | Three items |
| Item box | | 48px tall (56 collapsed on touch), full rail width, `display:grid;grid-template-columns:64px 1fr` |
| Item mark | centred in the 64px column | 24 by 24 barrel. See section 4. |
| Item label | 16px from the mark column | 13.5px / 600, `--muted` at rest, `--ink` active, `opacity` 0 collapsed to 1 expanded over 160ms delayed 100ms |
| Item gap | | 4px between items |
| **Active indicator** | | The **rick timber**: a 1px horizontal line at the item's baseline (`bottom:6px`), spanning `left:12px` to `right:12px`, `--gold`, `transform:scaleX(0)` to `scaleX(1)` with `transform-origin:left`. See section 4. |
| Item hover | | Label to `#D8C9AF`, barrel rotates 2 degrees and translates 1px, 140ms `ease-out`. **No background fill.** |
| Item focus | | 2px `--volt` ring inset 6px, radius 8px |
| Item active | | Label `--ink` at 700, barrel stroke `--gold`, timber at full width, plus a whisper fill `rgba(255,210,74,.05)` on the row. Three cues, one of them non-colour. |
| **Second tier** | under `My Jar` when active | Six rows, 36px, indented so the label starts at 80px. Labels 12.5px / 500. Counts right-aligned at `right:16px`, 10.5px / 700, `font-variant-numeric:tabular-nums`, `--muted`. Only rendered when the rail is expanded **or** pinned; collapsed, the parent item carries a single 6px `--gold` dot at its top-right corner if any section has an unseen change. Tier expands with a `grid-template-rows:0fr` to `1fr` transition, 240ms `cubic-bezier(.22,1,.36,1)`, which animates height without a hardcoded pixel value. |
| **Rule 2** | 24px above group 2 | 1px, `#2C231B`, inset 12px |
| **Group 2: the work** | | Two items: `The model` (thief mark), `Distribution` (a second mark, or reuse the existing `#dxMap`). Same box geometry. `The model` carries a persistent 2px `--gold` left border at `left:0`, the only rail item that does, and a second line at 10.5px `--muted`: `The analysis behind this`. |
| Group 2 type | | Labels in **monospace 12.5px / 600 / 0.4px tracking**, matching Direction B's convention. |
| **Foot** | `bottom:16px` | Account chip 40px, then a 40px `Sound` switch, then a 24px pin control. All three at 44px hit areas, stacked, 8px apart. Expanded, each gains its label. |

**Total top chrome: 0px. Left chrome: 64px, which on a 1440px viewport is 4.4% of the width and 0% of the vertical.**

### 4. The custom animated SVG

#### Mark 1. The Barrel on the Rick

A rickhouse is a barrel warehouse; barrels rest on horizontal timber ricks in tiers. The rail is a rickhouse elevation, and choosing a destination is pulling a barrel.

**Geometry, `viewBox="0 0 24 24"`:**

- Body: two vertical arcs bulging outward. Left: `M7 5 C4.8 9, 4.8 15, 7 19`. Right: `M17 5 C19.2 9, 19.2 15, 17 19`. Stroke 1.4px.
- Top ellipse: `cx=12 cy=5 rx=5 ry=1.4`, stroke 1.2px.
- Bottom ellipse: `cx=12 cy=19 rx=5 ry=1.4`, stroke 1.2px.
- **Hoops:** two shallow arcs, **not straight lines**, following the bulge. At `y=9`: `M5.6 9 Q12 9.9 18.4 9`. At `y=15`: `M5.6 15 Q12 15.9 18.4 15`. Sagitta **0.9px**. Stroke 1px. The sag is what makes a flat drawing read as a cylinder; straight hoops read as a box.
- **Staves:** three 0.75px verticals at `x=9, 12, 15`, from `y=5.6` to `y=18.4`, at 30% alpha.

**Legibility at 20px:** the bulge and the two hoops survive; the three staves at 0.75px scaled to 0.83 become a uniform grey wash that reads as noise. **Hide the `.staves` group below 24px.** The hoops must stay, because at 20px the hoops are the only thing distinguishing a barrel from an oval.

**Legibility at 64px:** add the bung, a 2.2px `--gold-deep` filled circle at `(12, 11)` on the front face, and two concentric 0.5px `--muted` at 30% arcs inside the top ellipse as end-grain rings. At 64px it stops being a pictogram and becomes an object.

**Animation: pulling the barrel.** You do not click a barrel. You roll it forward out of the rack, and the timber it was resting on is what stays behind.

| Beat | What physically happens | Spec |
|---|---|---|
| 1. Roll out, 0 to 220ms | The new barrel rolls forward | `translateX(0)` to `translateX(3px)` **and** `rotate(0)` to `rotate(4deg)` about `(12,19)`, the barrel's contact point with the timber, so it pivots on its base like a real barrel. 220ms `cubic-bezier(.22,1,.36,1)`. |
| 2. Timber extends, 0 to 260ms | The rick is exposed | The 1px indicator line `scaleX(0)` to `scaleX(1)`, `transform-origin:left`, 260ms `cubic-bezier(.16,1,.3,1)` |
| 3. Old barrel returns, 0 to 180ms | The previous one rolls back into the rack | `translateX(3px)` to `0`, `rotate(4deg)` to `0`, 180ms `cubic-bezier(.4,0,1,1)`. Ease-in, because gravity is doing it. |
| 4. Old timber retracts, 0 to 200ms | | `scaleX(1)` to `scaleX(0)`, `transform-origin:` **right**, 200ms `cubic-bezier(.4,0,1,1)`. Origin right, not left, so the two timbers do not appear to be the same line sliding; they are two different pieces of wood. |
| Hover only | A nudge, not a pull | `rotate(2deg)` plus `translateX(1px)`, 140ms `ease-out`. **No timber.** The timber is reserved for the active state and never fires on hover, so hover and active are never confusable. |

Total on switch: **260ms**, comfortably inside the repo's 400ms motion budget.

`prefers-reduced-motion: reduce`: no rotation, no translation. The timber appears at full width with no transition. The barrel's stroke goes `--muted` to `--gold` instantly. Both cues survive, one of them non-colour.

#### Mark 2. The Whiskey Thief

A copper tube used to draw a sample out of a barrel through the bunghole. It is the exact right mark for an analytical surface: the thing that takes a sample out of the thing the consumer surface is made of.

**Geometry, `viewBox="0 0 24 24"`:**

- Tube: a `<rect x="10.7" y="3" width="2.6" height="14" rx="1.3">`, stroke 1.2px `--gold-deep`, fill none.
- Bulb: `circle cx="12" cy="18.4" r="3.4"`, stroke 1.2px, fill none. The bulb overlaps the tube's foot by 1px so it reads as one continuous vessel.
- Cap ring: a 1px `<line>` from `(9.4,3.6)` to `(14.6,3.6)`.
- Liquid: a clipped `<rect>` inside the tube and bulb, fill `--amber-mid` at 0.5 alpha. At rest it fills only the bulb, to about `y=18.4` (70% of the bulb).
- Meniscus: a 0.75px `--gold` horizontal line at the top of the liquid, 2.6px wide in the tube and 5.4px wide in the bulb.

**Legibility at 20px:** the tube at 2.6px scaled to 0.83 is 2.2px, and the bulb is 5.7px. Both hold. **Drop the cap ring below 22px**, it becomes a 1px smudge on top of a 2px tube. The silhouette (a long thin thing with a ball at the bottom) is unmistakable at 20px and does not resemble any generic icon-library shape.

**Legibility at 64px:** add a 0.5px `#FBF3E4` at 30% specular highlight running the tube's left edge from `y=4` to `y=16`, and a matching crescent on the bulb's upper left, so it reads as polished copper. Add a 0.5px seam line where the bulb meets the tube.

**Animation: the draw.** You cap the top of a thief with your thumb, lift, and the liquid rises with it. It is slow at both ends because you are lifting by hand, not by spring.

| Beat | Spec |
|---|---|
| 1. Rise, 0 to 380ms | The liquid clip's top edge animates from `y=18.4` to `y=6`. **380ms `cubic-bezier(.45,0,.55,1)`**, a symmetrical ease-in-out. Slow start and slow end is physically right for a hand lifting; an ease-out would read as a spring, which is wrong. |
| 2. Meniscus | Travels with the liquid top, same timing. It narrows from 5.4px to 2.6px as it passes from bulb to tube at about 120ms, which is a **width change over 60ms `linear`** and it is the detail that sells the whole thing. |
| 3. Settle, 380 to 500ms | The fill alpha steps 0.5 to 0.9 over 120ms `ease-out`. The sample is drawn and now reads dark. |

Total **500ms**, once on hover with a 400ms guard, once on focus, and once on the cold-landing auto-expand.

`prefers-reduced-motion: reduce`: the liquid renders at the drawn state (`y=6`, alpha 0.9) permanently. No rise, no narrow, no settle. A full thief is still a thief.

### 5. Mobile at 390px

The rail becomes a **bottom bar**. This is a genuine second layout, not a squeeze.

- `position:fixed;left:0;right:0;bottom:0;height:56px;padding-bottom:env(safe-area-inset-bottom);background:#0C0A08;border-top:1px solid #2C231B`.
- **Five slots**, `flex:1` each, 78px wide at 390px, 72px at 360px. Each slot: 24px mark centred at `top:8px`, label 10px / 600 centred at `top:36px`, hit area the full 78 by 56.
- Slot order: `Enter` (barrel), `Convert` (barrel), `My Jar` (barrel), **a 1px vertical rule at 40% height**, `The model` (thief), `You` (account chip).
- **The rule between slot 3 and slot 4 is the whole hierarchy** on mobile, and it is 1px by 22px, `#2C231B`, absolutely positioned, occupying no flex width. It says the last two are a different kind of thing.
- Active indicator: the timber line, now at the slot's `top:0` rather than under the barrel, 2px, `--gold`, spanning `left:14px` to `right:14px`, same scaleX animation. Top rather than bottom because on a bottom bar the top edge is the one adjacent to content.
- **Dropped on mobile:** the wordmark, the eyebrow, `Distribution`, `Sound`, the pin, the second tier, the model's sub-label. `Distribution` and `Sound` move into the account sheet behind the `You` slot.
- **The second tier on mobile** becomes the in-page section index inside My Jar, exactly as recommended in section 2: inline in document flow, pinning to `top:0` only after the first section heading passes, since there is no top chrome to pin under.
- Content gets `padding-bottom:calc(56px + env(safe-area-inset-bottom) + 16px)` so the bar never covers the last row.
- Tap targets 78 by 56 at 390px and 72 by 56 at 360px, both far past 44px. This is the most touch-generous of the three directions by a wide margin.

### 6. Best at, and the sacrifice

**Best at:** the numbers. Zero top chrome, 56px of bottom chrome on mobile, five 78px tap targets, and the only structure with genuine room for the six My Jar sections without inventing a place to put them. It is also the most durable: adding a seventh section or a third analytical page costs nothing, whereas both horizontal directions are already near their width budget. And the barrel and thief are the two strongest marks of the three, because they are the only ones where the metaphor and the function are the same action.

**Sacrifices:** it does not look like a promotional microsite. A left rail is the visual grammar of a tool, and this page is a sweepstakes with a distillery brand on it, so you are spending brand warmth to buy structural clarity. It is also **two layouts, which is two things to maintain and two things to break**, and the desktop rail's hover-to-expand has a real usability tax: it needs the 220ms intent delay, a `focus-within` path, a pin, and a keyboard story, and if any of the four is missing it feels flickery. Finally, a bottom bar on a page that also has a sticky bottom CTA rail (`.cbar` already exists in this build, per the passport session notes) is a collision that must be resolved before you start, not after.

### 7. Build cost

**16 to 22 hours.** Desktop rail with collapse, expand, intent delay, focus-within, and the pin 5h. Mobile bottom bar as a separate layout with safe-area handling and the `.cbar` collision resolved 4h. Barrel mark, hoop arcs, two size variants, roll animation with correct pivot 2.5h. Thief mark, clip-path liquid, meniscus width change 2h. The second tier with `grid-template-rows` animation and the unseen-change dot 2.5h. Account sheet 2h. Reduced motion, 360px, APG, hash state, rewiring 3h.

---

## 5. Which one, and why

**Direction A if the page ships this week. Direction C if the page is going to keep growing. Direction B if the interview is the point.**

The honest read: **B is the one that makes the argument.** A CRM Director reading this work sample is being asked to believe the candidate understands that a consumer surface and an analytical surface are different products with different readers. The lid switch is that thesis rendered as a control, and it is the only one of the three where the nav itself is evidence. It is also the riskiest and the most expensive, and if the hash and history handling are half-built it will read as a demo, which is worse than the current bar.

**A is the correct default.** It fixes all four stated defects for 9 to 13 hours, halves the chrome, and the funnel sparkbar in the header does most of B's persuasive work at a fraction of B's risk. Its real weakness is putting Distribution in a menu.

**The strongest combination is A's structure with C's marks.** Take Direction A's one-row bar, swap the generic bar-chart glyph currently at line 3503 for the thief, and use the barrel as the active-tab mark on the three consumer tabs. You get A's cost and risk profile with C's craft, and you keep Distribution visible by putting it in the bar as a fourth item beyond the rule rather than in the account menu.

**On the second row, the recommendation is unambiguous regardless of direction: delete it as chrome.** It renders on one view of four, it exceeds the repo's own tab cap, it uses the primitive the repo's own rule 1 forbids on an analytics surface, and it is the object NN/g named as "an unnecessary duplicative tab bar" when it cost Lollar Pickups its 2:1 ratio. The six sections become anchored sections with a single in-flow index that pins only after the first heading passes, and the counts move onto the section headings where a screen reader reads each one once, in context, instead of six times in a tablist.

---

## Sources

- [ra.co](https://ra.co/) and [ra.co/pro](https://ra.co/pro) (fetched, live nav)
- [dice.fm](https://dice.fm/) (fetched, live nav)
- [eventbrite.com](https://www.eventbrite.com/) (fetched, live nav and mega panel structure)
- [marriott.com/loyalty.mi](https://www.marriott.com/loyalty.mi) (fetched, marketing nav plus account panel)
- [jackdaniels.com/en-us](https://www.jackdaniels.com/en-us) (fetched, live nav)
- [bulleit.com](https://www.bulleit.com/) (fetched, live nav)
- [aviationgin.com](https://aviationgin.com/) (fetched, live nav)
- [olesmoky.com](https://olesmoky.com/) (fetched, live nav)
- [AwardWallet, Delta SkyMiles Medallion status dashboard](https://awardwallet.com/news/delta-skymiles/medallion-status-dashboard/)
- [NN/g, Sticky Headers: 5 Ways to Make Them Better](https://www.nngroup.com/articles/sticky-headers/)
- [Spotify Engineering, Applying the Facade Pattern on Spotify for Artists](https://engineering.atspotify.com/2024/02/applying-the-facade-pattern-on-spotify-for-artists)
- [Shopify Help Center, Navigating the Shopify admin](https://help.shopify.com/en/manual/shopify-admin/shopify-admin-overview)
- [shopify.dev, App design navigation](https://shopify.dev/docs/apps/design/navigation)
- [Medium, Dice FM UX case study, Zacharie Metcalfe](https://medium.com/@zachariemetcalfe/dice-a-ux-case-study-c69e4d8f7e3) (source for the finding that users misread `Discover` in the nav bar)
- [ra.co/news/74129, RA launches new website](https://ra.co/news/74129)
- Repo docs: `njs-site/docs/dashboard-craft-rules.md`, `njs-site/docs/account-profile-ux.md`, `njs-site/docs/crm-dashboard-patterns.md`

**Note on doc access:** `dashboard-craft-rules.md` and `crm-dashboard-patterns.md` returned `EPERM` to the Read tool and were read instead through the workspace mount at `/sessions/amazing-vibrant-lamport/mnt/Resume and CV/njs-site/docs/`. All three were read in full.
