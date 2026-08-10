# Meta funnel benchmarks for the Jar Club flight

Ole Smoky / The Jar Club, 9 Aug 2026. Sourced benchmarks for a Meta paid social
flight driving entries to a sweepstakes landing page, adults 21+, Tennessee.
Every figure carries a source and a confidence grade. Where no benchmark exists
this document says so rather than substituting a proxy.

---

## The finding that changes the model

**The 47.5% sweepstakes conversion figure is real, correctly attributed, and
being misapplied by 3.3x.**

Unbounce's 47.5% is the median for the **Sweepstakes subcategory inside
Entertainment**, measured across **all traffic sources**, in a window that closed
23 July 2024. Unbounce says in writing that the number is driven by email-list
traffic: Entertainment email traffic converts at 46.2% in the same report.

The same report, same category, same window gives the paid social number:
**paid Facebook 14.3%**, paid social overall 14.6%.

47.5 ÷ 14.3 = **3.32x**. Using 47.5% for a cold paid social flight overstates
entry volume by 3.3x and understates cost per entry by the same factor.

There is a second problem a PE board will care about more:
**Unbounce excludes every page that converted nobody.** Verbatim methodology:
*"Pages with fewer than 50 visitors or no conversions were excluded."* Zero
converting pages are dropped from the denominator before the median is taken.
That inflates every figure in the report, including the 14.3%.

Source: [unbounce.com/conversion-benchmark-report/entertainment-conversion-rate](https://unbounce.com/conversion-benchmark-report/entertainment-conversion-rate/),
[methodology](https://unbounce.com/conversion-benchmark-report/methodology/)

**Model input: 12%, range 8% to 18%.** Grade Modeled. Anchored on 14.3%, haircut
for exclusion bias and for a 21+ age gate whose conversion impact has never been
published.

---

## The legal finding that outranks every media question

> "The state of Tennessee, residents are prohibited by a policy of the Tennessee
> Alcoholic Beverage Commission, and not a state law, from entering sweepstakes
> online sponsored by manufacturers of wines and liquors; however, Tennessee
> residents may enter many of these same sweepstakes promotions by entries
> delivered by the US Postal Service."

Tennessee also prohibits requiring winners to submit to in-perpetuity publicity
releases.

Source: [alliancesweeps.com Tennessee sweepstakes law](https://alliancesweeps.com/sweepstakes-contest-laws/tennessee-sweepstakes-law/),
undated, accessed Aug 2026.

**Ole Smoky is a distiller.** If this holds, driving Tennessee residents to an
online entry form for a spirits sweepstakes may be unlawful, and the programme
needs a mail-in alternate method of entry for TN residents plus rules that do not
demand a perpetual publicity release.

This rests on a sweepstakes administrator's secondary source. Primary sources
located but not read: TN ABC Rules
[0100-03, rev. May 2024](https://publications.tnsosfiles.com/rules/0100/0100-03.20240509.pdf)
and [0100-06](https://publications.tnsosfiles.com/rules/0100/0100-06.20220831.pdf).

**This goes to counsel before any media money is committed.** It is the highest
priority open item, ahead of every CPM question. It is also, said out loud in an
interview, the single most convincing thing on the list: the candidate who found
the state regulator's position on his own is not the candidate who ran a CPM
query.

---

## The benchmark table

Grades: **Known** (platform or primary publisher, methodology stated) /
**Observed** (multi-source primary panel, dated) / **Partner data** (single
vendor panel, self-selected) / **Modeled** (derived) / **Needs pilot** (no
credible benchmark exists).

### CPM

| Metric | Value | Source | Grade |
|---|---|---|---|
| Meta CPM, US multi-vertical, Oct 2025 | $8.17 | [Gupta Media](https://www.guptamedia.com/social-media-ads-cost) | Observed |
| Meta CPM, US all industries, 13-month median | $23.42 | [Superads](https://www.superads.ai/facebook-ads-costs/cpm-cost-per-mille/united-states) | Partner data |
| Meta CPM, **Wine and Spirits** | $15.95 avg, $5.61 to $24.88 | [Superads](https://www.superads.ai/facebook-ads-costs/cpm-cost-per-mille/wine-and-spirits) | Partner data |
| Wine and Spirits vs global baseline | **22.5% BELOW** | Same | Partner data |
| Q4 premium | Dec 2024 $10.83 vs 2024 avg $7.43, **+46%** | Gupta | Observed |

**Reconciling the two panels.** Gupta's panel runs reach and traffic objectives;
Superads' runs conversion objectives, which bid into a more expensive slice of
the auction. Plan against **$8 to $12 for traffic objectives** and **$18 to $25
for conversion objectives**. A sweepstakes entry flight optimises for the entry
event, so it lives in the second band.

**There is no measured restricted-category CPM premium.** No study, no Meta
document, no credible dataset isolates the cost of 21+ age gating, and the only
category data points the other way. If the deck needs a claim here it has to be
mechanism, not measurement: a 21+ floor removes about a quarter of the US
population from the pool, and thin audiences are volatile. **Do not put a
"restricted category premium of X%" on a slide. It does not exist.**

### Link CTR, and why the distinction matters

Meta reports at least three click-through rates and they are not interchangeable.
**CTR (all)** counts photo expands, reactions, comments and profile clicks.
**Link CTR** counts clicks to advertiser destinations. **Unique outbound CTR**
counts only clicks that leave Meta.
([Meta Business Help Center](https://www.facebook.com/business/help/1458994390807018))

Using CTR (all) in a media model inflates modeled sessions by a factor that
varies with creative format and cannot be corrected for after the fact.

| Metric | Value | Source | Grade |
|---|---|---|---|
| Meta link CTR, monthly mean Jan to Sep 2025 | **1.15%**, range 0.90% to 1.59% | Gupta | Observed |
| Meta CTR, traffic objective, all industries median | **1.71%** | [WordStream 2025](https://www.wordstream.com/blog/facebook-ads-benchmarks-2025), n=554 US campaigns | Observed |
| Restaurants and Food | 1.67% | Same | Observed |
| Arts and Entertainment | 2.10% | Same | Observed |
| Travel | 2.76% | Same | Observed |

**Model input: 1.2%, range 1.0% to 1.7%.**

### CPC

| Metric | Value | Source | Grade |
|---|---|---|---|
| Meta cost per link click, Jan to Sep 2025 | **$0.73** | Gupta | Observed |
| Meta CPC, traffic objective median | **$0.70** | WordStream | Observed |
| Meta CPC, leads objective median | $1.92 | WordStream | Observed |

Two independent panels land at $0.70 and $0.73. This is the highest confidence
number available.

**Modeling discipline.** CPM, CTR and CPC are algebraically linked:
`CPC = CPM ÷ (CTR × 1000)`. Set any two and derive the third. **Setting all three
independently is the most common way a media model dies in board Q&A.**

### Click to landing session

Meta publishes the metric, Landing Page Views Rate Per Link Clicks, and publishes
no benchmark for it.

| Metric | Value | Source | Grade |
|---|---|---|---|
| Invalid traffic rate, Meta | **8.20%** | [Lunio 2026 Global IVT Report](https://www.lunio.ai/blog/click-fraud-meta-ads), 2.7bn clicks | Partner data |
| IVT uplift for lead-gen advertisers | +32%, implying ~10.8% | Same | Partner data |
| Normal Meta to GA4 discrepancy | **10% to 20%**, "completely normal" | [Ruler Analytics](https://www.ruleranalytics.com/blog/analytics/facebook-ads-google-analytics-discrepancy/) | Partner data |

**The finding worth acting on.** Jon Loomer's controlled split test found that
optimising for Link Clicks sent **99% of link clicks from Audience Network**, and
only 3 of 607 Audience Network visitors became a quality visit. Optimising for a
custom quality event spent zero on Audience Network.
([jonloomer.com](https://www.jonloomer.com/split-test-which-optimization-leads-to-the-most-high-quality-traffic/))

**Do not optimise a sweepstakes flight for Link Clicks.** You would buy a 50%
cheaper CPM and a near-zero conversion rate. The expensive CPM is the correct one.

**Model input: 75% of link clicks become sessions, range 65% to 80%.**

### Consent capture

**There is no published aggregate opt-in benchmark for sweepstakes entrants.**
Second Street, the most likely source, publishes no benchmark report at all.

| Metric | Value | Source | Grade |
|---|---|---|---|
| Emails typed into forms that are valid | **87.82%** | [SafetyMails](https://www.safetymails.com/email-list-quality-report/), ~1bn addresses | Observed |
| Risky at capture, disposables and fakes | 4.57% | Same | Observed |
| Emails submitted that were valid | 62% | [ZeroBounce](https://www.zerobounce.net/email-list-decay) | Observed |
| Annual list decay | 23% | Same | Observed |
| Opt in to comms **or** loyalty on gamified promos | 55% | [Merkle](https://www.merkle.com/en/merkle-now/articles-blogs/2025/gamification-secret-weapon-recession-resistant-customer.html) | Partner data, **no methodology stated** |

SafetyMails and ZeroBounce disagree materially on invalid rate, 7.6% versus 23%.
**Present both. Never average them.**

**Model input: 60% of entries yield a usable opted-in email, range 50% to 75%.
Grade: Needs pilot.**

### Entrant to loyalty activation

**This benchmark does not exist.** Antavo, Bond, Merkle, Marigold, Snipp,
Formation.ai and Comperemedia publish nothing on it. A loyalty platform vendor
concedes the point in writing: *"This article does not present a universal
percentage benchmark for enrollment, redemption, or spend premium, because no
single verified figure applies."*
([Clutch](https://www.clutch.com/blog/learn-loyalty-kpi-benchmarks), July 2026)

The useful proxy is the one that argues **against** us, which is why it should be
said first: US consumers hold **17.9 loyalty memberships and only about half are
active**
([Bond via eMarketer](https://www.emarketer.com/content/consumers-use-half-of-loyalty-programs-they-belong)).
That is the number explaining why a sweepstakes-sourced member is worth less than
an organically acquired one.

### Meta alcohol policy

| Item | Finding | Grade |
|---|---|---|
| US minimum age | **21** (global floor 18) | Known |
| Is alcohol a Special Ad Category? | **No.** There are exactly four: credit, employment, housing, social issues | Known |
| Detailed targeting exclusions | **Removed.** Announced 21 Jan 2025, delivery stopped 31 Jan 2025 | Known |
| Instagram Teen Accounts | Alcohol search terms blocked, alcohol content hidden from teens by default | Known |
| AI age assurance | Places suspected teens into Teen protections even when they claim to be adults, shrinking the pool further | Known |
| Promotions policy | **Must not require or incentivise sharing, reposting or tagging** | Known |
| DISCUS Code | Models 25+; **73.8%** adult-demographic placement standard | Known |

Sources: [Meta alcohol policy](https://transparency.meta.com/policies/ad-standards/restricted-goods-services/alcohol/),
[Special Ad Categories](https://www.facebook.com/business/help/298000447747885),
[Promotions](https://www.facebook.com/help/179379842258600),
[DISCUS Code](https://distilledspirits.org/code-of-responsible-practices/)

---

## Recommended inputs

| Input | Low | **Base** | High | Grade |
|---|---|---|---|---|
| CPM, county flight | $25 | **$18** | $12 | Modeled |
| CPM, statewide | $22 | **$15** | $10 | Modeled |
| Link CTR | 1.0% | **1.2%** | 1.7% | Observed |
| Click to session | 65% | **75%** | 80% | Modeled |
| Session to entry | 8% | **12%** | 18% | Modeled |
| Entry to opted-in email | 50% | **60%** | 75% | Needs pilot |

CPC is derived, never set. County base: $18 ÷ 12 = **$1.50**. Statewide base:
$15 ÷ 12 = **$1.25**. Both above WordStream's $0.70 traffic median, correctly,
because this buys a conversion objective.

### Flight A, $2,000, 30 days, Sevier County

```
$2,000 ÷ $18 CPM × 1,000  =  111,111 impressions
× 1.2% link CTR           =    1,333 link clicks   implied CPC $1.50
× 75% session rate        =    1,000 sessions
× 12% entry rate          =      120 entries
× 60% consent             =       72 opted-in members

cost per entry            =   $16.67
cost per opted-in member  =   $27.78
```

Low case 42 entries and 21 members. High case 408 entries and 306 members.
**Cost per opted-in member ranges $6.54 to $95.24, a 14.6x spread.**

**Say this out loud: at $2,000 the answer is not knowable in advance.** This is a
pilot with a learning objective, not a forecast. A flight producing 42 entries
cannot establish statistical confidence in its own conversion rate. Its job is to
retire uncertainty on three inputs.

**Reach does not bind.** Sevier County 21+ is roughly 77,000; 111,111 impressions
against a 75% addressable share is 1.9x frequency over 30 days.

**The tourist caveat, and it is material.** Sevierville, Pigeon Forge and
Gatlinburg gate the most visited national park in the United States. If the geo
is left on Meta's default "people living in or recently in this location," the
pool is many multiples of residents, CPM behaves differently, and entrant quality
changes what the list is worth. **Set it deliberately and report it as a campaign
parameter, not a default.**

### Flight B, $150,000, statewide Tennessee

```
$150,000 ÷ $15 CPM × 1,000 = 10,000,000 impressions
× 1.2% link CTR            =    120,000 link clicks   implied CPC $1.25
× 75% session rate         =     90,000 sessions
× 12% entry rate           =     10,800 entries
× 60% consent              =      6,480 opted-in members

cost per entry             =    $13.89
cost per opted-in member   =    $23.15
```

Low case 3,545 entries. High case 36,720. **$5.45 to $84.62 per member, a 15.5x
spread.**

**Base case $23.15 sits just below WordStream's all-industry Meta CPL median of
$27.66.** Useful sanity check and a good line for the room: the model produces
something slightly better than the platform median, which is what a sweepstakes
with a high perceived-value prize should do.

**Seasonality.** Q4 costs 40% to 55% more per impression. On $150,000 that is
$45,000 to $65,000 of avoidable inefficiency, or 2,000 to 3,000 additional
opted-in members at base rates.

---

## Which input most changes the answer

The funnel is purely multiplicative, so every input moves the output
one-for-one. The dominant input is the one with the widest credible range.

| Input | Range | High ÷ low | Rank |
|---|---|---|---|
| **Landing page CVR, if 47.5% is used** | 8% to 47.5% | **5.94x** | **1** |
| CPM | $10 to $25 | 2.50x | 2 |
| Landing page CVR, correctly bounded | 8% to 18% | 2.25x | 3 |
| Link CTR | 1.0% to 1.7% | 1.70x | 4 |
| Consent rate | 50% to 75% | 1.50x | 5 |
| Session rate | 65% to 80% | 1.23x | 6 |

**The answer is landing page conversion rate, and specifically the single
decision of whether to use 47.5% or 14.3%.**

CPM varies 2.5x because auctions genuinely vary. Conversion appears to vary 5.9x
only because two numbers from the same page of the same report get used
interchangeably. **That is not uncertainty, it is a mistake with a 3.32x price
tag, correctable today at zero cost.**

It is also the input nobody in the room will instinctively challenge. Everyone
has an opinion about CPM. Nobody has an intuition for sweepstakes landing page
conversion, so 47.5% passes unchallenged and then compounds through entries,
members, cost per member, payback and LTV. **CPM being wrong by 50% costs money.
Conversion being wrong by 3.3x costs credibility, and credibility does not come
back inside a fiscal year.**

---

## What could not be verified

**Does not exist, searched and confirmed absent:**

1. Any measured CPM premium for restricted-category or age-gated targeting.
2. Any Meta benchmark for Landing Page Views Rate Per Link Clicks.
3. Sweepstakes entrant to loyalty member conversion rate, from any vendor.
4. Cost per identified member for spirits loyalty, in any form.
5. Any Second Street benchmark report.
6. Aggregate benchmarks from Woobox, ViralSweep, Gleam, RafflePress, Vyper,
   Sweeppea, Brandmovers or HelloWorld.
7. Fake and disposable email rates specific to sweepstakes-sourced lists.
8. Any referral or viral coefficient benchmark from any promotions platform.
9. Meta CPL or CVR for retail, CPG, beverage or events.
10. A 2025 or 2026 Unbounce report. **The live report's window ends 23 Jul 2024,
    so every Unbounce figure here is roughly two years stale.**
11. Unbounce traffic-mix composition. Never disclosed.
12. Conversion impact of a 21+ age gate on a landing page.
13. Whether WordStream's CTR is link-based or all-clicks. Never stated.

**Seen but not defensible. Do not cite:**

14. **Snipp's "34% of customers acquired through contests."** Traces to a dead
    CDN image of a Kontestapp infographic. No survey, no n, no date. **This is
    the number that gets a deck torn apart. Kill it.**
15. **Varos is dead.** Its benchmark URLs now serve an unrelated landing page.
16. **Revealbot is now Bïrch**, charts are JS-rendered with no readable values.
17. **Socialinsider publishes organic engagement only.** No paid CPM, CPC or CTR.
18. **Statista's Meta CPM series is paywalled.**
19. **Gupta Media contradicts itself on the same page**, prose versus table, both
    labelled October 2025. Use the monthly table series.
20. **WordStream's year-over-year comparisons are irreproducible.** Three of six
    do not reconcile against their own prior report. **Cite levels, never
    trends.** Sample fell 57% YoY and some cells rest on 2 campaigns.
21. **WordStream's Restaurants and Food CPL of $3.16.** Absent from the 2024
    table entirely, with untraceable +341% and -93% swings. An extreme outlier
    that will not survive scrutiny.
22. **A cluster of sites asserting a 2025 "Meta alcohol policy overhaul"**
    mandating 21+ verification on every landing page and 25+ influencers. None
    appears in any Meta source. These read as AI-generated SEO content. The 25+
    figure is real but it is DISCUS, not Meta.
23. Whether Meta has ever prohibited alcohol ads in specific US states.
24. **Whether Advantage+ can serve past a 21+ minimum.** Highest-value item to
    verify inside a live Ads Manager account before launch.

---

## Four things to do before this goes in front of anyone

1. **Legal, not media, first.** Counsel on the TN ABC position. If it holds, the
   programme needs a mail-in alternate entry route for TN residents.
2. **Change 47.5% to 12% everywhere**, with a footnote explaining what 47.5%
   actually measures. Presenting the correction is far stronger than having it
   found.
3. **Confirm in a live account** that the 21+ minimum holds as a hard control
   under Advantage+ audience.
4. **Run the $2,000 Sevier flight as an explicit measurement pilot** with three
   named learning objectives: real CPM at a 21+ county geo, real landing page
   view rate per link click, and real consent rate. Those three collapse the 15x
   uncertainty band on the $150,000 flight into something a board can approve.
