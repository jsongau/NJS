# Ole Smoky — the gamification layer and the model

**8 August 2026.** `nathanjsong.com/olesmoky` — the Golden Jar funnel grew a member
program and a financial model. Second writeup for this artifact; the first is
`session-2026-08-07-olesmoky-funnel.md`.

---

## What shipped

Eleven versions in one session, v25 through v36.

**The receipt tab.** `accept="image/*" capture="environment"` opens the rear camera on
a phone and degrades to a file picker on desktop. Photo, submit, then a green stamp
and a hold: **100 points, pending 30 days**, with the clearing date and a reference
number on screen. Nothing leaves the device.

**The member dashboard, rebuilt as panels.** A sticky sub-nav switches between
Overview, Quests, Streak, Prize wall, Badges and Activity. One panel mounted at a
time, because a body you scroll past four things you did not come for is not a
dashboard.

**Thirty quests**, grouped by effort rather than theme: Easy wins, Every week, Every
month, The big ones, Right now. Easy first, deliberately. Each card names the business
metric it moves and the published monthly ceiling of 6,000 points.

**Forty prizes** across sixteen categories, priced at retail value times two hundred
so a point is worth exactly half a cent everywhere on the wall.

**Three levels** — Mash, Hearts, Angel's Share — shown as a tag beside the member
name with a progress rail. The full benefit detail lives in account settings.

**The model.** A new top-level view. Twelve sliders, fifteen graded sources, three
incrementality scenarios and a verdict that recalculates.

---

## The research, and what it changed

Six agents, 452k tokens, 252 tool calls, across compliance, marketplace ranking,
gamification mechanics, prize wall economics and tier design. Two findings moved the
build more than anything either of us assumed going in.

**Instacart has no consumer review module on the product detail page.** The brief
opened with a request to reward reviews there to lift product ranking. That mechanic
has no surface to happen on, which settled the argument faster than the law did.

**27 CFR Part 6 only reaches industry-member-to-retailer transactions.** The federal
tied-house rule is not the binding constraint on a consumer loyalty program. The real
limits are state ABC statutes, and they are specific and citable: California BPC
25600.2(c), Utah R82-1-104(6)(n), Texas 16 TAC 45.101, Georgia 560-2-2-.14, Oregon
ORS 471.408, Massachusetts 204 CMR 4.03.

Knowing which rule actually binds is the difference between a program that ships and
one that gets lawyered into nothing.

---

## The compliance line the whole thing rests on

Rewarding reviews on a third-party marketplace is prohibited by **FTC 16 CFR Part
465**, in force since October 2024, which bans compensation conditioned on a review.
Every marketplace bans it separately in seller terms, where the penalty is delisting.

The receipt mechanic replaces it and is legal, because it rewards proof of a
transaction and the first-party data it carries rather than an opinion. Four
conditions keep it that way: flat rather than proportional, capped at three a month,
the free path stays equally fast, and it ships with a state exclusion list.

The 30-day hold is doing three jobs at once. It matches the return window so a
refunded order never pays out. It is the fraud control, because a program that pays
instantly on an uploaded image gets farmed inside a week. And a pending balance with
a visible clearing date is an open loop that brings people back.

---

## The model, and why it concludes against itself

The obvious move is a dashboard of green numbers. Every candidate does that, and a
CRM Director reading it knows they were invented.

So the model grades every input **A** to **D** for how much it deserves to be
trusted, and shows the answer at three levels of incrementality instead of asserting
one.

At the honest settings it returns **negative $880,473**. Break-even needs $187 of
incremental revenue per active member against $89 of gross profit they generate in
total, which is 210 percent of everything they are worth. Liu (*Journal of Marketing*,
2007) found no measurable effect on heavy buyers at all.

The verdict panel then says what the finding actually means: the case is not
incremental spend, it is roughly 11,000 consented, age-verified first-party records
against five million annual visits that currently produce almost none, plus a
measurable route back to four owned venues. Pretending the spend lift carries it is
how a program gets cut in year two.

**The number worth knowing:** the famous "members spend 12 to 18 percent more" is an
Accenture 2016 survey of 106 loyalty executives describing their own programs. Self
reported and correlational. Leenheer et al. (*IJRM*, 2007) corrected for
self-selection into membership and found roughly one seventh of the naive effect
survived. That is why incrementality is a switch in this model rather than a claim.

---

## Bugs worth remembering

**A class name is a global namespace with no import statement.** Putting
`class="acct"` on `<body>` to position the delivery nav collided with the sign-in
pill's existing `.acct`, which carries `background: rgba(255,255,255,.10)`. On a 46px
pill that is a tint. On `<body>` it is a white sheet over the entire page. This build
has now shipped that bug twice; `.scan` was the first.

**The main header was never sticky.** `header.hd` had `position: sticky` on line 63
and appeared again in a `position: relative` rule further down. Same specificity,
later in the file, so it won silently. The nav had been unreachable on scroll for the
whole build.

**`hidden` is a suggestion, not a guarantee.** `.rcstamp { display:flex }` beat the
`hidden` attribute, so the Submitted stamp rendered before anything was submitted.
`[hidden] { display: none !important }` is in every CSS reset for exactly this reason
and this file did not have one.

**`will-change` on a node created this frame delays its animation by a full
compositing pass.** The cork-pop particles sat play-pending for about 600ms. It is a
promise about the future, not a performance sprinkle.

**A custom property is a name, not a value.** `--cream` stopped meaning cream and
became the near-black page ground. `footer.ft b` kept pointing at it, so the line
naming the author was black on black. Semantic tokens survive a palette change;
descriptive ones lie.

**`scroll-margin-top` resolves once at the start of a smooth scroll.** With two
stacked sticky bars whose heights both move, it aims at where the bar used to be.
The sub-nav computes an explicit target and corrects once after layout settles.

---

## Verified before this commit

Zero console errors. Zero external requests of any kind. Zero horizontal overflow at
360, 390, 768, 1024 and 1512. Cursor stands down on touch and under reduced motion.
Settings panes measure 648px each so the modal cannot jump. Quest tabs filter, prize
wall redeems and debits, receipt capture posts a pending row, entering the draw lands
at 250 points with a clean two-line feed.

---

## Next

1. Streaks with the freeze mechanic, and the badge wall. Both specified, neither built.
2. The reconciliation pass: a harness that reads the rendered DOM and asserts every
   number on every surface agrees.
3. The real next build is a backend. Everything here fakes persistence in memory. An
   append-only ledger table, an entries table, and a referrals table with a pending
   state a server clears when the referee confirms 21.
