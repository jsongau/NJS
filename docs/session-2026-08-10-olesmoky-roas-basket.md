# Ole Smoky / The Jar Club, 10 Aug 2026

v128 through v130. The return arithmetic, the purchase breakdown, the audience
comparison rebuilt out of the sticky bar, and the prize wall clipping fixed for
good with a build check behind it.
**731 assertions across 32 jsdom suites, all passing.**

---

## The bug Jay caught by eye, and it was two bugs

He looked at the readout and asked why the return said 0.40x when contribution
was $1,013 against $750 of media. Both halves of that sentence were wrong.

### 1. A one month numerator over a twelve month denominator

`roas` divided by `costTotal`, which is media plus the prize, kits, counsel,
creative, registration, twelve months of platform fees and the full points
liability. When the projection drag sat at one month, the contribution followed
the drag and the cost did not. Month one was being charged for the whole build.

Cost is now read over the same window as the value beside it:

```js
const inWindow = SPEND + moderation + ptsLiab;
const overYear = PRIZE + KITS + LEGAL + CREATIVE + REG + platform;
const costAt   = hz => inWindow + overYear*(hz/12);
const costTotal = costAt(12);   // unchanged, so every verified number holds
const costHz    = costAt(HZ);
```

Media, receipt moderation and the points granted at entry land inside the
thirty days. Everything else is a programme year. Sevier at $750 went from
**0.40x to 0.73x** at one month, and the payback curve now divides each month
by the cost accrued by that month rather than by the annual total.

**The twelve month figure is byte for byte identical.** `costAt(12)` is the old
expression. That was deliberate: nothing already audited was allowed to move.

### 2. Incrementality applied to a period that cannot contain a counterfactual

```js
const revFull=(CURVE[0]?rev/CURVE[0]:rev*7.7)*A.inc;   // OLD
const rev12=revFull*CURVE[HZ-1];
```

`A.inc` is 1.18 on broad. Multiplying the whole line meant that at HZ=1,
`rev12 = rev * 1.18`. The strip said **Contribution, 1 month $1,013** while the
money that actually landed in the window was **$859**. Two numbers for one
month, side by side, differing by a factor nobody could see.

```js
const yrRaw   = CURVE[0] ? rev/CURVE[0] : rev*7.7;      // NEW
const revFull = rev + Math.max(0,yrRaw-rev)*A.inc;
const rev12   = HZ===1 ? rev
              : rev + (revFull-rev)*(CURVE[HZ-1]-CURVE[0])/(1-CURVE[0]);
```

Month one is what was observed and gets no adjustment. There is no
counterfactual inside thirty days. Incrementality scales the tail, which is
what the comment above the old line already claimed it did.

**Lesson.** A comment that describes the intended behaviour is not a test of it.
This one had been sitting directly above code that did the opposite.

---

## Month one on media, and why it is not forced positive

Jay asked for ROAS positive in two months, then positive immediately. The
arithmetic was run before any code was written:

| Market | Month one, on media |
|---|---|
| Sevier | **1.15x** |
| Tennessee statewide | 0.73x |
| Knox | 0.46x |
| Shelby (Memphis) | 0.39x |

It is genuinely positive in the home county, because the only revenue that can
land inside a thirty day media window is a tour booking, and Sevier is twelve
minutes from The Barn. It is not positive anywhere else, and the page says so
in the market's own words.

Forcing all four above 1.0x was declined. A first-ever loyalty programme showing
month-one positive in every market is exactly the shape `model-board-audit.md`
warns about, and once one number reads manufactured the rest stop counting.
The spread is the media plan: weight the buy where the venue is, prove the
number, then travel.

---

## What they actually bought

The readout said "20 commercial actions" and stopped. The panel now opens the
receipt: four headline numbers, a stacked contribution bar in inline SVG, and a
table where every line carries units, price each, gross, deductions and what is
kept.

**The fact it surfaces, which nothing on the page had ever shown:** a booking is
not a ticket. At Sevier, 101 bookings sell **414 tickets**, because a booking is
4.1 seats within thirty minutes of a venue and 2.6 seats beyond ninety. That
single ratio is the entire reason the home county pays back inside the month.

Merchandise loses the $15 code at 100%, 45% goods and $8 fulfilment before
anything is kept. Delivery keeps only supplier margin. Both are stated on the
row rather than in a footnote.

---

## Who we buy, moved and rebuilt

The three-way audience switch came out of the sticky bar. One word buttons
reading Broad, Whiskey and Lookalike asked a reader to hold three media
definitions in their head before a number meant anything, and nobody outside a
media team can.

It now lives on Segments as a full comparison, and it is the strongest table in
the model: **the cheapest member is the least incremental one.** Retargeting
wins on cost per member and loses badly on cost per household that was not
already buying. Both winners are marked separately so the reversal is visible,
and the page says in words that ranking on CAC buys the people Ole Smoky
already has.

Each row needs its own evaluation of `C()`, so `AUD` is set, `C()` is called and
`AUD` is restored. One source of truth, three reads of it, no second copy of the
funnel maths.

---

## Smaller fixes

- Every one of the ten readout labels now has a hover definition. Ad spend had
  none, which was the one a non-marketer would reach for first.
- `FIRST COMMERCIAL...` was clipping. It is now **First purchases**, and instead
  of one opaque total it reads "3 bookings, 6 merch, 11 delivery".
- Four new glossary terms: Media spend, Commercial action, Booking, Seats.
- The strip is ten cells, so `.strip` moved from `repeat(9,...)` to
  `repeat(10,...)`. Four suites asserted the count and were updated rather than
  loosened.

---

## The job description, re-read against the build

The live posting was found on Indeed. Three findings that change what gets built
next, all of them cheap to check and expensive to miss:

1. **No CRM or CDP platform is named anywhere in 11,000 lines.** No Klaviyo,
   Salesforce, Braze, Segment. The JD's second responsibility is selecting and
   implementing the platform, the role is titled CRM Director, and three of the
   seven Indeed screening questions are platform questions. Ten second check.

2. **"tastings, tours, gift shop" and "POS data capture" appear three times in
   the JD. Gift shop appears zero times in the build.** It is the best capture
   point in the business: the guest is at a register Ole Smoky owns, with staff
   Ole Smoky employs, mid-transaction.

3. **"Data capture rate" is the first KPI the JD names, and the model has no
   capture rate metric.** The headline acquisition number is cost per lead from
   Meta, which inverts the posting's priority.

Also worth correcting: `model-board-audit.md` recommends cutting the Journeys
tab. Against the JD that is now wrong. "Design lifecycle and segmentation
strategies (welcome flows, visit-driven journeys, loyalty/rewards, win-back,
VIP/trade programs)" is a named core responsibility. Compress and retitle it
Lifecycle, do not delete it.

**Vocabulary trap.** "On-premise partners" in the JD means licensed bars and
restaurants, not Ole Smoky's own venues. Calling the distilleries on-premise in
an interview reads as a category error to Matthew Keith. Use "owned venues".

---

## The prize wall, second pass, and the check that should have caught it

### A scroll container inside a clipping container does not scroll

`.tools` was one nowrap row with `overflow-x:auto`. It sits inside `.pnl`, and
`.pnl` carries `overflow:hidden` from a declaration 500 lines earlier. The
result is that Sort and the last category were **cut off, not scrolled off**,
with no scrollbar to indicate anything was missing.

Several earlier fixes aimed at width and all of them missed, because the width
was never wrong. Two wrapping rows now, nothing scrolling sideways.

**Lesson.** Before adding `overflow:auto`, check every ancestor for
`overflow:hidden`. Scrolling only works if the chain above it lets it.

### Six across was self inflicted

Splitting `.grid` into `.sgrid` last session stopped the rails being squashed to
four, and overshot: `auto-fill` at `minmax(168px,1fr)` lands on six or seven.
Two card sizes on one page reads as a bug even when it is a decision. Both grids
are `repeat(4,minmax(0,1fr))` and step down together.

### tdup.js

The duplicate selector build check, owed since 8 Aug and finally written. It
parses both shadow stylesheets and fails when a selector sets the **same
property** to two different values at equal specificity, which is the only case
that can silently undo a fix. It does not ban duplicate selectors, because some
are deliberate.

First run caught two: `.srch` and `.lbfig` each declaring `max-width` twice.
Both dead code from earlier passes, both removed rather than the check loosened.

**Run it before any CSS edit is called done.** This is the class of bug behind
roughly ten "still broken" reports across two sessions.

### Inventory counts, all of them, gone

`256 of 444 in reach`, the count on every category chip, the count on In reach,
`N rewards and N within reach`, and `1 to 24 of 447`. A large catalogue number
sitting next to a member's balance only makes the balance look small, and how
much stock the shop holds is not the member's business.

The header now names the next reward and the gap to it. The member's own
redemption count stays, because that one is about them.

Kept: the `N matches` readout, which only appears while a filter is active. A
filter with no feedback is worse than a number.

## Traps for the next session

1. `grep` patterns that match the stylesheet will dump the entire 40KB CSS line
   8659 into the terminal. Anchor to a line range or a more specific token.
2. Hiding a control with `hidden` does not remove it from `textContent`. If a
   thing is meant to be gone, stop rendering it.
3. `#audsw` no longer exists. `paintAud()` early-returns and is effectively
   dead; the live comparison is `audCompare()` on the Segments panel.
4. Still true from the last session: CSS inside JS strings needs escaped
   newlines, and `esc()` will eat glossary markup.
5. **Run `tdup.js` after any CSS edit.** Duplicate selectors are now checked,
   but only for the properties in its WATCH list. Add to that list rather than
   assuming it covers everything.
6. `.pnl` carries `overflow:hidden`. Nothing inside the prize wall may be wider
   than its column, and no descendant can scroll horizontally.

## Next

1. **The venue capture screen.** Five million visits a year through doors Ole
   Smoky owns, against $9.91 paid to Meta for one member. Closes the platform
   gap and the gift shop gap in one build.
2. The console nav is still ten tabs.
3. ~~A duplicate-selector build check.~~ Written, `tdup.js`, green.
