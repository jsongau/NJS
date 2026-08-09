# The model, read by the people who would judge it

Ole Smoky / The Jar Club, 9 Aug 2026. Audited against the researched profiles in
`docs/olesmoky-people/`. Reference figures from `C()` at page defaults: Sevier County,
$2,000 media, 191 records, CPL $10.48, rev12 $4,167, 2.08x, payback month 4.

---

## The five things that break it

### 1. Every tab reports the same fake trend

`paintTabs()` sets `const prev = v*0.82`, so `delta()` returns **"+22.0% vs previous" on
all nine tabs, always, under every input**. The sparklines are one fixed ramp rescaled,
so all nine curves are identical.

Hartman's file names this exact failure: *an unlabelled assumption presented as measured
data*. It is on screen nine times at once and takes one glance to spot.

> "All nine of your tiles say plus twenty two percent versus previous. Previous what?
> Nothing has run. If the trend indicators are decorative, what else on this page is
> decorative?"

### 2. Year-one revenue is a literal

`const rev12 = e*21.83;` No derivation, no grade, no source row, and **it does not
respond to any rate a scenario changes**. Set the Conservative floor and value per
record stays $21.83. The conservative case is defeated by a constant, and that constant
drives both the 2.08x and the payback month.

Related: `CURVE[0]=0.13` says month one is 13% of the year. `rev/rev12` says 23.5%. The
two disagree and nothing reconciles them.

### 3. Merchandise contributes $3.35 an order, not $48

The numerator sums gross retail on merch with net supplier margin on spirits, then
divides by media. Two units added together.

```
Gross merch                    $733
less the $15 code             -$229    58% copy it, $48 AOV clears $40 without trying
less COGS at 45%              -$330
less fulfilment at $8         -$122
= Contribution                  $51
```

**The $733 on screen is $51.** That single correction is the most important in this
document, because once merchandise stops carrying the case, only depletions can.

### 4. Points liability is claimed in prose and absent from the model

`pts:2500` plus `join:1500` plus `profile:1000` means **every entry issues 5,000 points
before the entrant does anything**. Your own reward wall prices 5,000 points at $15.00.
That is $10.97 at cost, $7.90 after breakage, and **42% of the media budget at scale**.

The Day 30 email says breakage is "costed into the model as a real liability rather than
a footnote." There is no breakage variable. A claim is worse than an omission.

Use **28%**, the COLLOQUY figure already graded A in your own source table. Not the
vendor 5-to-30% range you correctly graded D.

There is also no expiry policy, so breakage can only ever be a guess. **State 24 months
of account inactivity** and the assumption becomes an accounting position.

### 5. Nothing connects to cases

Every revenue line is merch, coupons and delivery margin. The number Novy is measured on
is nine-litre cases: 1.2M shipped in 2024, down 6%, and that decline removed his
predecessor.

---

## The fix: solve for the lift, do not assume it

```
gapPerRec  = fully loaded cost per record  -  12-month contribution per record
bottlesReq = gapPerRec / (bottle FOB x supplier GM)
```

At the $150,000 statewide stop, 14,321 records:

| | |
|---|---|
| Fully loaded cost per record | **$18.89** (on screen: $10.47) |
| 12-month contribution per record | **$7.85** |
| The gap | **$11.04** |
| Breaks even at | **1.7 more bottles per member per year** |
| In cases | **2,065 nine-litre** |
| Of 2024 volume | **0.17%** |

**Say the last line out loud: this programme does not reverse a 6% decline.** Closing
76,600 cases would need roughly 530,000 members. Being the person who says that first is
worth more than the bigger number, and the geo holdout already in the Plan tab settles
it in ninety days.

At the $2,000 pilot the fully loaded cost per record is **$47.16**, for one reason: a
$5,000 fixed prize over 191 records is $16.75 each. That is a design finding, not an
arithmetic one.

---

## What each person looks for first

| Person | Their three numbers | The one they challenge |
|---|---|---|
| **Novy**, CEO | Incremental cases · new-household share · fully loaded cost per record | *"Two point oh eight times what? Show me where this lands in depletions, and how many of those 191 were already buying us."* |
| **Hartman**, Apax | Cost to stand up vs cost to run · payback inside the hold · the grade on the most sensitive assumption | *"All nine tiles say plus twenty two percent versus previous. Previous what?"* |
| **Keith**, SVP Sales | Receipts resolved to account and SKU · repeat rate by market · does this route around the wholesaler | *"Eleven receipts. What does that get me in an SGWS review?"* |
| **Baker**, founder | Visitors captured · Hooch Hop completions · legal exposure with cites | *"Three percent. My passport is the last bar on your chart. Are you extending it or replacing it?"* |
| **CFO director** | Contribution not revenue · the liability roll-forward · fully loaded CPA | *"That $48 is a catalog price. Where is the points liability? You issue 5,000 points the moment somebody enters."* |

**What makes each of them stop reading:** Novy, the Journeys tab, ten email bodies
sitting as a peer to the P&L. Hartman, length before conclusion. Keith, a Plan tab with
no distributor line anywhere. Baker, three different thresholds for one code on three
different tabs.

---

## Contradictions on screen right now

- `R.mord=8`% place a merch order against `BEH_BASE.coupon=34`% use the code. A code
  cannot be used by more people than order.
- `R.aov=48` against `BEH_BASE.aov=46`. Two AOVs on two tabs.
- `PTS.join=1500` on Members against the 2,500 welcome in the footer, the rules and the
  Fill the Jar quest.
- `$15 off $40` on Convert, `$15 off $30` in the Day 0 email, `$15 off $40` on Plan.
- `$25.00 CPM` and `$60.00 per 1k` adjacent, both labelled "per 1k", one per thousand
  impressions and one per thousand people.
- `c.cpa` labelled "Cost per lead", "Cost to acquire" and "Cost per record" in three
  places, one of which implies a fully loaded figure it is not.

## A live bug nobody has seen

In the Segments block, `P('p-aud').innerHTML=` is **assigned** by the AUDIENCE block and
then **reassigned, not appended**, by the SEGMENTS block below it. The age-band table,
the flavour-by-occasion cross tab and the "what a record contains" card are computed and
discarded on every paint. Either restore with `+=` or delete the dead code.

## Why the Plan tab runs off the edge

Not the Plan panel. The tab strip. Nine tabs in a `repeat(9,1fr)` grid inside a ~990px
column, each carrying a **fixed 104px sparkline**, so min-content is 129px per track and
nine tracks need 1,161px with no `overflow-x`. It overflows by ~170px and Plan, being
ninth, falls off.

**Deleting the fake deltas and sparklines fixes the credibility problem and the layout
problem in one commit.**

---

## Nine tabs become seven

| Current | Verdict | Change |
|---|---|---|
| Overview | rebuild as **The case** | five numbers: fully loaded cost per record, 12-month contribution, the gap, cases required, points outstanding. Kill `roas30`. |
| Media | keep, trim | move the state matrix and cites to Risk. Dagger the grade D 21+ deflator. |
| Enter + Convert | merge into **Funnel** | revenue table rebuilt as a contribution table, every row showing its denominator |
| Members + Segments | merge into **The member** | add the liability roll-forward. Fix the 1,500 vs 2,500 contradiction. Fix the overwrite bug. |
| Journeys | **cut** from the console | good work in the wrong room. One link, not a tab. |
| Evidence | keep, expand as **Risk and evidence** | gains the compliance architecture diagram: earn on alcohol, redeem on non alcohol, with GA, AL, TABC, TCA and NC 14-306.4 named on one screen |
| Plan | keep, fix | promote the geo holdout to the first screen. The budget chart recomputes the funnel inline instead of calling `C()`, so it is a second copy that will diverge. |
| **Trade** | **add** | receipts to account and SKU, repeat by market, a distributor one-pager, and one line on 27 CFR 6.3(a) and 6.96(b) |

---

## The one chart that answers the most questions at once

A horizontal waterfall, media dollar to case, every bar labelled with what it divides by:

```
Media                                          150,000
+ prize, kits, registration, legal, creative     +5,213
+ platform, SMS, moderation                      +2,176
+ points accrued, net of 28% breakage          +113,136
= total programme cost                          270,525   ÷ 14,321 = $18.89

merch gross                                     +55,000
  less the code                                 -17,190
  less COGS                                     -24,750
  less fulfilment                                -9,168
delivery supplier margin                        +10,730
= contribution, 12 months                       112,477   ÷ 14,321 = $7.85

gap                                             158,048   ÷ 14,321 = $11.04
÷ $6.38 per incremental bottle
= 1.7 bottles per member per year
= 2,065 nine-litre cases  =  0.17% of 2024
```

It answers Hartman's payback, the CFO's margin and liability, Novy's cases and Baker's
"what does this cost" in the order each would ask.

---

## Two design decisions that fall out of the numbers

**Drop the $5,000 prize from the pilot, run kits only.** At $2,000 of media the prize is
$16.75 per record, which is the entire reason pilot cost per record is $47 against $19
at scale. Kits-only puts total announced ARV near $180, under the Rhode Island $500
threshold and far under the FL and NY $5,000 thresholds, removing registration, bonding
and their 30-day and 7-day lead times from the launch calendar.

**Test the welcome grant at 2,500 versus 1,000.** The endowed-progress argument is
sound and I would not cut it on instinct, but it costs $2.27 per record in accrued
liability, $32,500 at statewide scale. It should be a line item with a test behind it,
not a default nobody priced.
