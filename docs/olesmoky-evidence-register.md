# Ole Smoky evidence register

Every fact behind the Golden Jar model at `nathanjsong.com/olesmoky`, with
a grade and a source. Researched 8 August 2026 across four agent passes.

**Read this before changing any number on that page.** It exists so a
future session does not re-research, and so nothing unsourced creeps in.

Grades: **A** peer reviewed, government, or controlled experiment.
**B** large sample vendor benchmark with published methodology.
**C** self reported company or trade press. **D** assumption or untraceable.

---

## Corrections to earlier drafts

Three things that were wrong or stale and are now fixed. Do not
reintroduce them.

1. **Constellation Brands has no ownership in Ole Smoky.** The 2022
   majority acquirer was **Apax Partners**. The confusion comes from CEO
   Michael Novy being a Constellation alumnus.
2. **There are five venues, not four.** Myrtle Beach SC opened 20 May 2026,
   the first outside Tennessee.
3. **Visitors are declining, not flat.** 5.7M in 2021, 5.3M in 2022, 5.0M+
   in 2023, and the company stopped publishing after April 2024. Trend is
   roughly minus 6% per year. All self reported via on premise traffic
   counters, so it is footfall and not unique visitors.

---

## Media benchmarks

| Figure | Value | Source | Grade |
|---|---|---|---|
| US median Meta CPM | $23.42 | Superads, $3B spend, 2025 to 2026 | B |
| Wine and spirits median CPM | $15.95 avg over 13 months | Superads | B |
| Planning CPM, TN, 21+ gated, conversion objective | **$25.00** | Derived from the two above plus restricted category haircut | C |
| CTR (all), wine and spirits | 2.82% median | Superads | B |
| CTR (all), leads objective, Arts and Entertainment | 3.92% | LocaliQ / WordStream 2025 | B |
| **Link CTR planning figure** | **1.2%** | Derived. Nobody publishes the all-to-link ratio | **D** |
| Restaurants and Food cost per lead | $3.16 | LocaliQ 2025 | B |
| Median Meta ROAS | 1.93x | Triple Whale, 20,000+ DTC accounts | B |
| Median Meta **incremental** ROAS | 2.16x | Measured, 10,000+ campaigns, geo test vs control | B |
| Share of Meta incremental conversions from new or reactivated customers | 64% | Measured, 2025 | B |

**No alcohol specific CPM premium is published anywhere.** Every article
asserting restricted categories cost more states it qualitatively. The
premium is real in practice (you lose eleven years of the adult audience
and cannot use Advantage Plus expansion) but any specific multiplier is
grade D.

**No public Meta CPM dataset exists by US state or DMA.** Confirmed across
Superads, Triple Whale, Gupta, Varos, WordStream, Revealbot, Statista.
Meta also **retired Nielsen DMA targeting**: blocked for new campaigns
20 April 2026, stopped delivering 22 June 2026, replaced by Comscore
Markets. Building a cost model on DMA boundaries would be building on a
retired primitive. Hold CPM flat across markets and say so.

---

## The 47.5% trap

**The single most consequential finding. Do not undo this.**

Unbounce's 2024 Conversion Benchmark Report gives a sweepstakes median of
**47.5%** across 41,000+ landing pages. The figure is real and correctly
quoted. It is also the wrong number for a paid social funnel, for two
reasons Unbounce states themselves:

1. **Conversion definition.** Their taxonomy counts a click on an
   "Enter Now" button as a conversion. An account is not required.
2. **Traffic source.** The 47.5% is blended across channels and the
   entertainment lift is attributed largely to **email** (46.2% median).

Their **paid Facebook** median for the same vertical is **14.3%**
(25th percentile floor 5.6%, ceiling 48.2%). Paid Instagram is 11.1%.

Building a model on 47.5% off Meta traffic **overstates volume by about
3.3x**. Use 14.3% as the B graded conservative floor.

There is no 2025 or 2026 edition of the report. Verified absence.

---

## Entry to account: no benchmark exists

Searched Gleam, ViralSweep, Woobox, KickoffLabs, VYPER, ShortStack, Zuko,
Klaviyo, Attentive, and the age verification vendor category. **No public
dataset segments sweepstakes entry to account creation with dual email and
SMS consent plus age verification.** Not paywalled, nonexistent.

Say this plainly on the page. It is a credibility asset, not a gap.

Components that do exist, all Zuko 2025, grade B:
- Password field carries **10.5% abandonment, the highest of any field**
- Email field 6.4%, phone 6.3%
- Start to completion 66%, view to completion 45%
- **Field count is not correlated with completion rate.** Zuko's trend line
  is flat, which directly contradicts the widely circulated
  "field count cliff" numbers

Three design conclusions that follow:
1. Make SMS an unchecked checkbox, never a required field
2. Kill the password, use magic link or email verified entry
3. Age gate inline in step one, not as a modal

---

## Revenue lines, verified against olesmoky.com

**Tastings are a rebated entry fee, not revenue.**
- Gatlinburg and Pigeon Forge: Regular $5, Premium $8, **includes a $5 off
  coupon**
- Nashville 6th & Peabody: Regular $10, Premium $13, **includes a $10 off
  coupon**

Five dollars in, five dollars back. The economics are retail conversion,
not admissions. **The model books tasting revenue at zero and must keep
doing so.**

**Guided tour price is unverified.** Ole Smoky publishes it nowhere on
their own site. The only figure available ($37.95) is single sourced,
undated, and its companion tasting prices are demonstrably stale. **No
tour revenue appears in the model.** To close: load FareHarbor items
180360 (Gatlinburg) or 353619 (Nashville) in a real browser, or call
(865) 436-6995.

**Merchandise AOV, derived from 368 real product prices** pulled from the
live Shopify `/products.json` endpoints:
- Simple unweighted mean $20.42, **median $14.99**
- 42% of products under $11, 57% at $14.99 or less
- Derived basket: **$48** base, $31 low, $67 high
- Coolers: 6 jar $19.99, 3 jar $14.99, can coolies $4.99

**olesmoky.com does not sell spirits.** It is a merchandise store. Spirits
product pages have no add to cart and no price. **ReserveBar is the entire
owned DTC spirits business.**

Live channels verified: **Instacart** (86 products), **DoorDash**,
**Uber Eats**, **ReserveBar**, Total Wine (43 SKUs), Caskers, Flaviar.
**Drizly is dead**, shut down by Uber end of March 2024. Drizly held 41.2%
of alcohol purchase intent clicks in 2023, so **Instacart is now the single
most important marketplace** for a brand like this.

---

## Compliance, the part that carries real risk

**Tennessee is the hardest state in the plan, not the easiest.**

- **No spirits DTC shipping.** TABC's licence list contains exactly one
  direct shipper licence: Winery Direct Shipper. There is no distilled
  spirits DTC licence in Tennessee. Nationally only about 11 states plus DC
  allow distillers to ship direct.
- **Alcohol cannot be a prize.** TABC Rule 0100-01-.03(14)(c).
- **21+ gating is mandatory by rule**, not just by industry code.
  TABC Rule 0100-06-.03(14)(f).
- **TCA 47-18-120(c)(3)(C): you cannot condition prize receipt on a
  publicity release.** Standard "acceptance constitutes consent to use of
  name and likeness" language is unlawful as applied to Tennessee. This
  single line is why national official rules carve Tennessee out.
- Delivery is legal in state via a licensed delivery service, fee capped
  at 10%, but sections 57-3-224 and 57-3-406(k)(3) **conflict on the
  radius**, 50 miles versus 100. Model 50 conservatively.
- **TN loyalty position reversed in July 2026** per a law firm's account of
  an informal TABC conversation. **No published memo exists.** Get written
  confirmation before building on it.

**Loyalty points on alcohol purchases, by state:**

| State | Position | Cite |
|---|---|---|
| Georgia | **PROHIBITED** | Ga. Comp. R. & Regs. 560-2-2-.14(1) |
| Alabama | **PROHIBITED** | Ala. Admin. Code 20-X-6-.12 |
| Kentucky | PERMITTED | KRS 244.461(4), retailer issued only |
| North Carolina | PERMITTED | 14B NCAC 15B .1004, beer and wine, 35% cap, spirits excluded |
| Tennessee, Virginia, Mississippi, Arkansas, Missouri, South Carolina | RESTRICTED | see doc |

**Georgia and Alabama are where a clean rollout stops.** That is a real
finding and belongs on the page.

**The one architecture that clears all ten states: earn on alcohol, redeem
on non alcohol.** Georgia's subsection (3) expressly allows coupons
redeemed "for the purchase of merchandise other than Alcoholic Beverages",
and the pattern generalises. It is what Total Wine already does.

**27 CFR Part 6 scope point most people miss:** section 6.3(a) says Part 6
"applies only to transactions between industry members and retailers."
A brand direct consumer promotion sits largely outside it. Section 6.96(b)
is the federal green light for direct consumer contest prizes.

**Registration:** Florida and New York above $5,000, Rhode Island above
$500. **Capping total announced prize value at or below $5,000 removes
Florida and New York entirely.** None of the ten southeastern states adds
a requirement. Note Ole Smoky's own National Moonshine Day sweepstakes runs
at $11,620 ARV, so they already register.

**North Carolina 14-306.4 is a design risk:** bans sweepstakes conducted
through an "entertaining display", expressly including a video game not
dependent on skill played while revealing a prize. A plain web form is
fine. **Spin the wheel, scratch to reveal, or animated instant win is
squarely inside the banned language**, escalating to a Class G felony on a
third offence.

---

## Census data

All 95 Tennessee counties, population and percent 18 and over, from Census
QuickFacts V2025. Grade A.

**Two integrity checks, both clean:**
- The 95 county populations sum to **exactly 7,315,076**, the published
  state total. Zero discrepancy.
- Population weighted under 18 comes to **21.53%** against a published
  statewide 21.5%.

**The 21+ denominator is derived, not measured.** QuickFacts publishes 18
and over per county and nothing finer. Ages 18 to 20 are roughly three
single year cohorts, about 4% of population, so 21+ lands near **95% of
18+**. This is a labelled deflator in the interface, grade D.

**To replace it with real data**, one call:
`https://api.census.gov/data/2024/acs/acs5/subject?get=NAME,S0101_C01_026E,S0101_C01_027E&for=county:*&in=state:47&key=YOURKEY`
where `S0101_C01_026E` is 18 and over and `S0101_C01_027E` is 21 and over.
Free key at `https://api.census.gov/data/key_signup.html`.

An alcohol model running on an 18+ denominator overstates addressable
audience by roughly 4 to 5%.

---

## The business finding worth leading with

**Ole Smoky has no loyalty infrastructure at all.**

Their "Loyalty Program" page reads, in full: "Join our Loyalty Program.
Get updates on Moonshine, Whiskey and Canned Cocktails," plus one email
field. No points, no tiers, no rewards, no member account. **It is not
linked from the main navigation.** The hero asset dates to March 2022.

Site wide email capture offers **no incentive at all**: no discount, no
free shipping, no sweepstakes entry, no welcome offer.

The Hooch Hop passport is real and live since October 2022, three East
Tennessee venues, free to join, complimentary t shirt. It is **a paper
passport with rubber stamps. No app, no account, no data capture.**

Five million annual visits. Zero records captured.

No loyalty app is present in their stack (no Smile.io, no LoyaltyLion).
Confirmed Shopify, Google Tag Manager, FareHarbor for tours.

That is the pitch: not fixing a programme, building the first one.

---

## Still unverified

| Item | How to close |
|---|---|
| California spirits DTC shipping | Very likely closed to out of state distillers. Verify before modelling CA as a shipping market |
| Guided tour price | FareHarbor in a browser, or (865) 436-6995 |
| ReserveBar shipping state list | Address gated per SKU; only Ole Smoky list is from 2015 |
| 2024 and 2025 visitor figures | Company stopped publishing after April 2024 |
| Any Ole Smoky revenue figure | Private company. Vendor estimates disagree by 25% and must not be used |
| ESP identity, Klaviyo vs Attentive | Browser devtools or Wappalyzer |
| TN July 2026 loyalty reversal | Written TABC confirmation |
| Exact 21+ population per county | The Census API call above |
