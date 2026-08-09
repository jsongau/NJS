# The account and profile surface: what the research says

Ole Smoky / The Jar Club, 9 Aug 2026. Three research passes: consumer loyalty
portals, premium SaaS settings, and game/gamified profile building. Everything
below carries a source. Where a claim could not be verified it says so, because
half the value of this document is knowing which numbers survive a hiring panel.

---

## The five findings that should decide the design

**1. There is no spirits loyalty program with a real preference center.** Jack
Daniel's Tennessee Squire Association is invitation-only and offline. Miller
Lite's Taste Points was code entry. Yuengling runs rebate submission. The only
real analogs in the category are **Flaviar, Firstleaf and Winc**, none of them
distillery-owned. That is the opening line of the interview: *nobody in this
category has built one, and here is why the ones outside it work.*
Sources: [The Whiskey Wash](https://thewhiskeywash.com/whiskey-articles/inside-jack-daniels-secret-whiskey-room-that-tour-guides-cant-even-mention/),
[Marketing Dive](https://www.marketingdive.com/ex/mobilemarketer/cms/news/advertising/9772.html)

**2. Diageo already built the thing we are building, for whisky.** "What's Your
Whisky" asks plain-language questions about sweet, fruity, spicy and smoky using
visual cues, and outputs a personal **flavour print** that recommends bottles. It
runs at Johnnie Walker Princes Street and in airport retail. A CRM Director will
recognise the lineage in one glance.
Source: [TRBusiness](https://www.trbusiness.com/regional-news/europe/diageo-global-travel-unveils-whats-your-whisky-digital-discovery-tool/238509),
[Diageo FlavorprintConnect](https://www.diageo.com/en/news-and-media/press-releases/2024/diageo-brings-consumers-industry-first-experience-with-flavorprintconnect-technology)

**3. The single best-evidenced argument against a pill grid is Firstleaf's.**
Their quiz had questions with nine items and three ratings each. Users found them
overwhelming and **skipped them**, which degraded the data feeding the
recommendation model. They could not cut the items, so they replaced the grid
with one item at a time, auto-advancing. Zero scrolling even on the smallest
phone. This is a measured failure of the exact pattern currently in the build.
Source: [theeddiejones.com Firstleaf case study](https://www.theeddiejones.com/projects/firstleaf-club-onboarding-quiz)

**4. Name the bands, never show the number.** Firstleaf originally displayed a
match confidence percentage. Users read it like a school grade and treated
anything under 70% as failure, which suppressed exploration. Replacing it with
five named "Exploration Zones" removed the pass/fail framing and became the
centerpiece of the app. Starbucks does the same thing: named redemption rungs
with value caps (25/60/100/200/300/400 Stars), never a bare balance.
Sources: same Firstleaf study,
[Starbucks press release 29 Jan 2026](https://about.starbucks.com/press/2026/starbucks-unveils-reimagined-loyalty-program-to-deliver-more-meaningful-value-personalization-and-engagement-to-members/)

**5. The profile has to visibly change something, or it is a data grab.**
Sephora's Beauty Traits (eye colour, hair colour, hair type, skin tone, skin
type) filter product reviews down to reviewers who share your traits, on the
product page. Firstleaf echoes quiz answers back verbatim on the results screen,
mapped to tasting notes, because users "didn't feel confident that the results
were tied to the answers they selected."
Sources: [Sephora Beauty Matches](https://community.sephora.com/t5/Customer-Support/Introducing-Beauty-Matches/m-p/2933902),
[sephora.com/beauty/beauty-insider-account](https://www.sephora.com/beauty/beauty-insider-account)

---

## What is actually wrong with the pill grid

No source says pill grids look cheap. That is taste. The defensible critique is
narrower and much more useful:

- **Material 3 classes chips as the compact, dynamic, lower-emphasis component**,
  coloured with the secondary key colour reserved for "less prominent components
  in the UI." We borrowed a low-emphasis filtering control to carry the most
  emotionally important screen in the product.
  [m3.material.io/components/chips/guidelines](https://m3.material.io/components/chips/guidelines)
- **Chip selected state is routinely not announced to screen readers.** Filter
  pills get read as ordinary unselected buttons.
  [Skyscanner chip accessibility](https://www.skyscanner.design/latest/components/chip/accessibility-ZZ80gAW3)
- **PatternFly deprecated its Chip component outright.** "The chip component has
  been deprecated. Our new recommendation is to use the label component instead."
  [patternfly.org/components/chip/accessibility](https://www.patternfly.org/components/chip/accessibility/)
- **Density causes skipping**, measured, at Firstleaf.
- **Everything looks identical**, so nothing feels chosen. That is the visual
  problem, and it is why Flaviar commissioned an artist to draw 252 individual
  flavour components rather than shipping a text list.
  [Flaviar Flavor Spiral](https://flaviar.com/blogs/flaviar-times/flavour-spiral)

### The alternatives, and when each is right

| Pattern | Right when | Watch out for |
|---|---|---|
| **Selectable cards with a real checkbox** | 4 to 12 options, each deserves a subtitle or icon | 72 to 88px each, expensive vertically. Two-up at 228px only without descriptions |
| **Full-width list rows, leading checkbox** | 8 to 25 options, labels vary in length | ~32px per row, no filtering. This is the boring correct default |
| **Image or illustration cards** | The option is sensory, unfamiliar, or hard to name. Flavour, region, occasion | Needs real art. Stock icons are worse than text |
| **Segmented control** | 2 to 5 mutually exclusive ordered values | Single-select only. Apple caps at 5 on iPhone |
| **One at a time, three-state, auto-advance** | Long list of specific things where a grid produces skipping | The Firstleaf pattern. Best evidence of any option here |
| **Slider with live illustrated feedback** | Genuinely continuous values | The illustration must react on drag or it is just a form control |
| **Filterable select panel / command palette** | 20 to 500 options, power users | Hides the option set. Bad when the user does not know the vocabulary |
| **Top-N ranked pick** | You want priority, not just membership | Cap at 3. Drag-ranking is bad on mobile |

Sources: [Carbon selectable tile](https://carbondesignsystem.com/components/tile/usage/),
[GOV.UK checkboxes](https://design-system.service.gov.uk/components/checkboxes),
[Apple HIG segmented controls](https://developer.apple.com/design/human-interface-guidelines/segmented-controls),
[Primer SelectPanel](https://primer.style/product/components/select-panel/)

---

## Structure: what shape should the account be

The documented split, and it is clean:

- **Wizard, one question per screen** for first-time acquisition profiling where
  completion quality is the metric. Firstleaf, Winc, Flaviar onboarding.
- **Several short quizzes entered from context** for ongoing enrichment. Ulta
  runs four separate routes: `/vba/foundation/`, `/vba/skincare/`,
  `/vba/haircare/`, plus a shade matcher. Not one wizard.
  [ulta.com/company/app](https://www.ulta.com/company/app)
- **Side nav plus per-section Edit** for the logged-in desktop account. Sephora's
  left nav with a second entry at the bottom of the page; Marriott's read-only
  summary rows each with their own Edit.
  [help.marriott.com](https://help.marriott.com/s/article/update-marriott-account-profile)
- **Accordion only for many short sections on mobile.** NN/g: accordions "increase
  the interaction cost by requiring people to decide on topic headings" and
  "diminish content visibility."
  [nngroup.com/articles/mobile-accordions](https://www.nngroup.com/articles/mobile-accordions/)

**In premium SaaS, left rail wins decisively.** 11 of 17 products surveyed use a
sidebar. Top tabs survive only in native windows or modals. Nobody premium uses
accordions for top-level settings nav.

| Product | Nav model | Save model |
|---|---|---|
| Linear | Left rail, routed `/settings/*` | Autosave |
| Stripe | Hub of category cards into sub-pages | Explicit |
| Vercel | Left nav, stacked cards | Explicit per card |
| Notion | Left rail inside an overlay | Mixed |
| Figma | Personal is a modal with top tabs | Mixed |
| Raycast | Left sidebar, native window | Autosave |
| Tally | Single scroll with anchored sections | Explicit |

**The save rule is consistent everywhere:** toggles, dropdowns and theme apply
instantly; identity, financial and destructive fields require explicit
confirmation.
Sources: [Linear docs](https://linear.app/docs/account-preferences),
[Stripe dashboard basics](https://docs.stripe.com/dashboard/basics),
[Vercel accounts](https://vercel.com/docs/accounts),
[Tally account settings](https://tally.so/help/account-settings)

---

## Spacing, with real numbers

Every major system converges on the same three gaps. This is not a coincidence,
it is three teams reaching the same answer independently.

| Gap | Value | Systems that agree |
|---|---|---|
| Label to its input | **8px** | shadcn `FormItem gap-2`, Primer `controlStack-gap-condensed`, Atlassian "0 to 8px for title to description" |
| Field to next field | **16px** | Primer `stack-gap-normal`, Polaris `space-card-gap` |
| Group to group | **24px** | Primer `stack-gap-spacious`, Atlassian 12 to 24 band |
| Section to section | **32px** | Atlassian 32 to 80 page band |
| Modal padding | **24px** | shadcn `DialogContent p-6`, Material dialog 24dp |
| Input height | **40px** | Primer `control-large-size`. 36px reads thin on dark |
| Touch target | **44px** iOS, **48dp** Material, **24px** WCAG 2.5.8 floor | Apple HIG, Material metrics |
| Target separation | **8px minimum** | Material metrics |

Sources: [Primer size primitives](https://primer.style/product/primitives/size/),
[Atlassian spacing](https://atlassian.design/foundations/spacing),
[Polaris space tokens](https://github.com/Shopify/polaris/blob/main/polaris-tokens/src/themes/base/space.ts),
[shadcn form.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/form.tsx),
[Carbon spacing](https://carbondesignsystem.com/elements/spacing/overview/),
[Radix spacing](https://www.radix-ui.com/themes/docs/theme/spacing)

**Keep the ratio at 2x between adjacent semantic levels.** A 1.5x delta (12 to
18) does not read as hierarchy on a dark background, because there is no shadow
helping you.

**One placement finding worth copying:** Firstleaf moved "skip" far from the
question to discourage skipping, and it *hurt* conversion on large screens until
corrected. De-emphasise with weight and colour, never with distance.

---

## Dark mode: the part everyone gets wrong

**On dark, elevation is a lighter surface, not a shadow.** A drop shadow on
`#0F0B08` is invisible, there is nothing left to darken. Carbon stacks four named
layers and steps a field one rung lighter for each nesting level. Radix encodes
the same thing positionally: 1 to 2 background, 3 component, 4 hover, **5
selected**, 6 subtle borders, **7 interactive borders**, 8 focus rings, 9 to 10
solid fills, 11 low-contrast text, 12 high-contrast text.
Sources: [Carbon colour usage](https://carbondesignsystem.com/elements/color/usage/),
[Radix scale](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale/)

**A 1px border on an input is a WCAG 1.4.11 target and needs 3:1 against its
surface.** This is the most-failed rule in dark UI, because the 1.2:1 hairlines
that look tasteful are legally invisible. Our `--line:#2C231B` against
`--surf:#171310` is roughly **1.2:1**. It is fine as a decorative separator and
**fails as an input border**.

**The selected state is the hard part.** The instinct is to fill the selected
item with the brand accent. On dark that produces a wall of saturated gold, kills
text contrast, and makes five selected items scream louder than three unselected
ones. Do the opposite:

```
Unselected   surface,      1px border at decorative weight
Hover        +one step,    1px border one step brighter
Selected     whisper fill (about 1.3:1), 1px border at 3.5:1, plus a glyph
Focus        as selected, plus a 2px ring at 2px offset
```

Three supporting rules: never rely on fill alone, always add a non-colour cue;
desaturate accents in dark mode; prefer alpha fills to opaque ones so they
composite correctly over any layer. shadcn's dark input is `bg-input/30`, a
30%-alpha fill, not a hex.

---

## Progress meters: what the evidence supports

**Endowed progress.** Nunes and Drèze (2006), *JCR* 32(4). Car wash cards: 8
stamps from zero versus 10 stamps with 2 given free. Identical real effort.
Completion over nine months: **19% versus 34%**, and the endowed group finished
faster. **Never start the meter at zero.**
[SSRN 991962](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=991962)

**Goal gradient.** Kivetz, Urminsky and Zheng (2006), *JMR* 43(1). Effort
accelerates near the goal, and *illusionary* progress produces the same
acceleration. **State the remainder, not the total.**
[Full PDF](https://home.uchicago.edu/ourminsky/Goal-Gradient_Illusionary_Goal_Progress.pdf)

**IKEA effect.** Norton, Mochon and Ariely (2012), *JCP* 22(3). Self-built things
are overvalued. **Critical boundary condition: the effect disappears if the task
is not completed.** A half-finished profile is worth less than no profile, which
is the argument for five sections and not fifteen.
[Wiley](https://myscp.onlinelibrary.wiley.com/doi/abs/10.1016/j.jcps.2011.08.002)

**Do not cite Zeigarnik.** A 2025 meta-analysis in *Humanities and Social
Sciences Communications* found no memory advantage for unfinished tasks and
concluded the effect "lacks universal validity." The *Ovsiankina* effect, a
general tendency to resume interrupted tasks, held up. If a panel member knows
the literature, cite Ovsiankina.
[Nature HSSC](https://www.nature.com/articles/s41599-025-05000-w)

**NN/g on progress indicators:** "Instead of showing a percentage number,
consider showing the number of steps," and for surveys, indicators that "start
fast and end slow" reduce drop-off.
[nngroup.com/articles/progress-indicators](https://www.nngroup.com/articles/progress-indicators/)

**LinkedIn's meter removes itself at All-Star.** Beginner, Intermediate at 4
sections, All-Star at 7, and then the meter stops being displayed. A permanent
nagging gauge on an adult's account page reads as pestering.
[LinkedIn help a594698](https://www.linkedin.com/help/linkedin/answer/a594698)

**Net finding: percentage completion meters are a consumer and social pattern.
Premium B2B ships a named-task checklist.** Stripe's checklists are documentation
pages with browser-cached checkboxes and no bar at all. Notion has no documented
setup checklist. Duolingo's progress representation is the streak, not a profile
meter.

---

## Premium gamification: the rules

Adults read overly playful design critically; an arXiv study on age-aware
gamification reports adult learners want tools that feel purposeful and that
repeated non-dismissing animations raise cognitive load
([arXiv 2512.15630](https://arxiv.org/pdf/2512.15630)). Robinhood's confetti was
named by Massachusetts regulators as a gamification tactic used to manipulate
customers, and was removed
([CNBC](https://www.cnbc.com/2021/03/31/robinhood-gets-rid-of-confetti-feature-amid-scrutiny-over-gamification.html)).

1. **Ledger, not scoreboard.** Every number is a fact about the member. Bottles
   logged, states visited, flavours declared. Never an abstract score invented to
   make a bar move.
2. **One accent colour, used only for earned state.** If gold is also the button,
   the border and the heading, gold stops meaning anything.
3. **No mascot, no exclamation marks, no confetti.**
4. **Motion under 400ms, ease-out, in place.** The number lands *on the thing it
   changed*. A number in a modal over dimmed content is a slot machine. A number
   incrementing in the header balance is a ledger.
5. **Show the ceiling.** Genshin exposes the weekly EXP cap so the player knows
   when to stop. Telling an adult where the ceiling is is the cheapest trust
   signal available.
   [gamewith.net](https://gamewith.net/genshin-impact/article/show/22390)
6. **Reward with access, not points.** Early allocation, a distillery slot, a
   barrel pick. Points read as a coupon; access reads as membership.
   [Antavo luxury loyalty](https://antavo.com/blog/luxury-fashion-loyalty-programs/)
7. **Name the artifact.** WinePrint (Firstleaf), Flavour Print (Diageo), Beauty
   Profile (Sephora). The thing the guest built has a proper noun. That is what
   makes the IKEA effect fire.
8. **Rarity as data.** Steam shows a real global unlock percentage. If we say a
   flavour is rare, show the actual number of members who share it.
9. **Retire the meter at 100%.**
10. **Plain language.** NN/g: backend terms drive support contacts.

**Failure modes to name in the panel deck:** points substituting for real value
(Bogost's *exploitationware*), animation outweighing the reward it celebrates
(Robinhood), playful visuals adults read as condescending, and a completion meter
that never goes away.

---

## Mechanics worth stealing, with the source

- **Destiny 2's free battle pass track renders empty slots where premium rewards
  sit.** Absence is visible rather than hidden.
  [Game Developer](https://www.gamedeveloper.com/game-platforms/let-s-talk-battle-passes-part-1)
- **Pokédex silhouettes.** Uncaught entries adjacent to caught ones render as
  silhouettes, not blanks. The gap is *shaped*, not empty.
  [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9dex)
- **Genshin groups achievements into named categories with a completion
  percentage each, and finishing a category awards a profile Namecard.** The
  reward for completing a set is a cosmetic identity item, not currency.
  [Fandom](https://genshin-impact.fandom.com/wiki/Achievement)
- **Fortnite Milestone Quests: 20 stages, fixed cost per stage.** The bar never
  gets steeper. Escalating requirements are what make adults quit.
  [GameRant](https://gamerant.com/fortnite-milestone-quests-complete-guide/)
- **Duolingo's lesson bar advances even on a wrong answer.** Nothing ever fully
  stalls.
  [Trophy case study](https://trophy.so/blog/duolingo-gamification-case-study)
- **Delta splits status into four rings plus a "Pending & Upcoming" projection
  from booked flights.** The projection is the premium move: it tells you where
  you will land, not just where you are.
  [AwardWallet](https://awardwallet.com/news/delta-skymiles/medallion-status-dashboard/)
- **Stitch Fix Style Shuffle: one image, thumbs up or down.** 10 billion
  interactions since March 2018, about 4.5M a day, feeding a latent style model
  in real time. The highest-volume taste capture in retail, and it is not a grid.
  [Stitch Fix newsroom](https://newsroom.stitchfix.com/blog/10-billion-interactions-and-counting-on-style-shuffle-the-data-powering-your-personalized-shopping-experience/)
- **Spotify's picker is photographic tiles with a soft floor** ("choose 3 or
  more") and a list that repopulates so it never bottoms out. The photo creates
  the attachment; a text pill would not.
- **Firstleaf uses its own logo, six dots, as the progress meter.** Testers said
  the empty dots encouraged them to keep going. A branded progress object beats a
  generic bar.

---

## The three directions this produced

Built as previews. All three carry the same data model, the same five sections,
the same 100-points-per-section economy and the same consent rules. They differ
in structure, input primitive and how progress is expressed.

### A. The Ledger
Left rail nav in the modal, one section per pane, full-width checkbox rows and
40px inputs. Progress is a **five-segment row where filled segments carry the
member's own answer** and empty ones carry the name of what is missing. Reads
like a Delta status tracker. Zero game vocabulary.
Draws on: Marriott sectioned profile, Delta rings, Primer/Atlassian spacing,
discrete steppers over continuous bars.

### B. The Tasting Card
One question per screen, auto-advancing, ending in a named artifact: the member's
**Mash Profile**, a drawn card with their declared flavours on it. Progress is the
card filling in. The closest to what Diageo, Firstleaf and Winc actually ship,
and the strongest evidence base of the three.
Draws on: Firstleaf's one-at-a-time fix, Winc's plain-language proxies, Diageo's
flavour print, Flaviar's Flavor Spiral, the IKEA effect's completion condition.

### C. The Passport
Extends the Hooch Hop paper passport metaphor. Sections are **stamps**; an
unearned stamp renders as a debossed outline of the stamp you would get, not as
an empty box. Selection is a card grid with real illustration. Progress is how
many stamps are on the page.
Draws on: Pokédex silhouettes, Destiny 2's visible empty slots, Genshin's set
completion awarding a cosmetic identity item, Joe Baker's paper passport that
already exists and already works.

**My recommendation is B**, with C's stamp art as the completion artifact. B has
the only measured evidence behind it, it is the pattern a spirits company already
shipped, and the named artifact is what makes the profile feel owned rather than
extracted. A is the safest and the least memorable.

---

## Unverified, stated plainly

- Live screenshots of Sephora's Beauty Traits editor and Ulta's Beauty Profile
  editor. Both are behind login and JavaScript. The layout claims come from
  Sephora's own support copy, not from seeing the screen.
- Material 3 and Base Web spacing numbers. Both sites are JS-gated and returned
  nothing to a server-side fetch. No number in this doc is sourced to either.
- Whether LinkedIn removed the profile strength meter in 2023. The official help
  article still describes it; third parties say it is gone.
- Honor of Kings Honor Pass UI layout. Only its structure is documented.
- Amex Membership Rewards as a gamification interface. No published analysis
  found. Use Amex for reward *type* (access, credits, transfer partners), not
  screen design, or drop it.
- Baymard's multi-column form research URL could not be fetched this session.
- The Sked Social 3x and Ghost conversion figures are vendor marketing, not
  controlled experiments. Do not put them in front of a hiring panel.

---

## Built: Direction C, the Passport (v112, 9 Aug 2026)

Chosen over B. Shipped into `olesmoky/index.html` replacing the accordion and the
pill grid. 42 assertions cover it in `tpass.js`.

What landed:

- **Five stamps on a passport page**, perforated rule under the header, count in
  the top right. An unearned stamp is a **dashed outline of the mark you would
  get**, drawn in `pfStamp()`: a house, a jar, a pin, a speaker, three linked
  nodes. Pokedex silhouette, not an empty slot.
- **Selection is cards, not pills.** `.pfcard`, 56px minimum, real checkbox, room
  for a subtitle. The flavour set carries a drawn leaf mark per option and a
  tasting note ("Peach, apple pie, butter pecan").
- **The stamp switches the pane and never closes it**, because a detail area that
  can be empty just looks broken.
- **Selected state is a whisper fill plus a bright border plus a tick.** No
  saturated gold fills, so five selected cards do not shout over three unselected
  ones.
- **Input borders moved to `#5E4E3B`** to clear WCAG 1.4.11 at roughly 3:1. The
  decorative `--line` was about 1.2:1 and was never legal as a control border.
- Spacing on the researched scale: 8 label to control, 16 field to field, 24
  group, 32 section. Inputs 44px.
- Board card now speaks the same language: **Stamp your Jar Passport, N of 5
  stamped, Open my passport.**

Unchanged and still asserted: 100 a stamp posted once, editing never claws back,
consent worth zero, birth month with no year, handles optional inside a section
that pays in full without them.

### The bottom-of-screen black line, and why it survived three fixes

`.cbar` is the sticky bottom rail. It was hidden with
`transform:translateY(112%)` while keeping `box-shadow:0 -18px 50px
rgba(0,0,0,.66)`.

**A transform relocates a box. It does not stop the box painting, and a shadow is
drawn relative to the box's own edges, not clipped to the viewport.** At 112% the
bar's top edge sat only 12% of its height below the fold, while the shadow reached
68px upward. Roughly 56px of black haze was pinned to the bottom of every view,
including the views where the bar is deliberately off.

The small light capsule at the bottom centre of every screenshot was the same bug
in the minimised state: `translate(-50%,190%)` still painted the pill's 1px gold
rim and its border radius.

Fixed by making hidden mean genuinely not painted:
`.cbar:not(.on){box-shadow:none;border-color:transparent;opacity:0;visibility:hidden}`
with `visibility` delayed by the slide duration so the animation still reads.

**The lesson worth keeping: when hiding a fixed element, check its shadow and its
border, not just its position.** I fixed the progress track twice believing that
was the line, because both artifacts sit at the same end of the screen.
