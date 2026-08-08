# CRM dashboard patterns: how the real products do it

Researched 8 August 2026 for the Ole Smoky CRM Director work sample at
`nathanjsong.com/olesmoky`. Sources are HubSpot, Salesforce (Sales Cloud,
CRM Analytics, Marketing Cloud Intelligence), Klaviyo and GoHighLevel
product documentation, plus G2, Capterra, PeerSpot and the vendors' own
community and idea boards.

Read this before building or revising any analytics surface in this repo.
It exists so a future session does not rebuild a dashboard from taste.

---

## The one-line synthesis

Almost none of the pain in these products is "we need more chart types."
It is **filter provenance** (which filter is on this tile right now, and
does it match the tile beside it), **comparison as a first class thing**
rather than a mode you lose, **relative time** instead of hardcoded dates,
and **reconcilability**. The praise is all about speed, clean defaults,
and one click drill to records.

Klaviyo's problem is credibility, a beautiful number nobody trusts.
GoHighLevel's problem is capability, a shallow number nobody can extend.
The unclaimed position between them is a dashboard that **shows its own
working**: window, denominator, timezone, what was excluded, and what
changed since the last calculation.

That gap is the thing worth building into. It is also the whole thesis of
the Ole Smoky page, so the two reinforce each other.

---

## Exact tab and section labels, by product

Use real labels. Invented ones read as invented.

### HubSpot
- Web traffic analysis sub tabs: `Sources`, `Pages`, `UTM parameters`,
  `Device types`, `Countries`, `Browsers`, `Topic clusters`
- Campaign analytics chart tabs: `Influenced contacts` (default),
  `Other metrics`
- Individual campaign top level: `Performance`, `Attribution`
- Ads tool top level: `Manage`, `Analyze`

### Klaviyo
- Flow message analytics: `Overview`, `Recipient Activity`, `Conversions`,
  `Link Activity`, `Deliverability`
- Campaign analytics: `Overview`, `Recipient activity`,
  `Audience and segment breakdown`, `Link activity`, `Conversions`,
  `Deliverability`, `Watch live`
- Benchmarks: `Overview`, `Business performance`, `Campaigns`, `Flows`,
  `Sign-up forms`

### GoHighLevel
- No asset tabs. A single select dropdown: `Funnels`, `Websites`, `Blogs`,
  `Webinars`, `Forms`, `Surveys`, `QR Codes`, `External Tracking`
- Real sub tabs exist only inside `Acquisition Data`: `Traffic Channel`,
  `Source/Medium`

### Salesforce Marketing Cloud Intelligence
- Preconfigured dashboards: `Overview`, `Deliveries`, `Engagement`,
  `Performance`, `Journey Performance`

### Control labels worth copying verbatim
| Control | Label | Product |
|---|---|---|
| Column picker | `Edit columns` / `Manage columns` | HubSpot |
| Chart metric switcher | `Chart metrics` | HubSpot |
| Dimension switcher | `Break down by` | HubSpot |
| Chart type switcher | `Style` | HubSpot |
| Time controls | `Date range` + `Frequency`, two separate dropdowns | HubSpot |
| Attribution preview | `Compare model` | HubSpot and Klaviyo |
| Filter stack | `+ Add filter`, `Advanced filters` | HubSpot |

---

## The five metric groupings that recur everywhere

Across HubSpot's column pickers and MCI's widget grouping, the same five
buckets appear. Use these as tab names when a dashboard needs metric sets.

1. **Volume and reach**: impressions, sessions, page views, new visitors, clicks
2. **Engagement**: bounce rate, average session length, CTA rate, CTR
3. **Conversion**: submissions, new contacts, session to contact rate
4. **Pipeline and lifecycle**: leads, MQL, SQL, opportunities, customers
5. **Cost and revenue**: amount spent, cost per lead, cost per MQL, ROI

---

## Layout: what goes above the fold

All three products converge on the same stack, in this order.

1. **Scope bar.** `Date range` and `Frequency` as two separate controls.
   State that rolling ranges exclude today, because HubSpot documents this
   on every surface and it is why nobody argues about their numbers.
2. **KPI row.** Three to five numbers in one visually distinct band.
   Salesforce teaches this as the "highlights panel". Each carries an
   absolute value and a delta versus the same period last cycle.
3. **Hero chart.** One primary time series with its own `Style` and
   `Chart metrics` switchers in its header, not in a settings modal.
4. **Summarised table**, whose row checkboxes drive the hero chart above.

Behind a click: column picker, attribution model switching, second level
breakdown, per record drill down, export.

---

## Interaction patterns worth stealing

**KPI cards double as the tab bar.** GoHighLevel's best idea, stated in
their own docs: "Selecting a KPI card updates the charts and breakdowns
below to explore that metric in depth." The summary row and the segmented
control are the same object. This is the pattern the Ole Smoky dashboard
should use.

**The table drives the chart.** HubSpot uses this identically on Sources,
Pages and Campaign Analytics: tick a row, that series appears in the chart
above. Replaces a legend picker and a filter panel with one mechanic.

**Faceting.** Salesforce CRM Analytics: clicking a bar, list row or toggle
filters every other tile bound to the same dataset, and each tile can opt
out with `All` / `Include` / off. HubSpot's inability to exempt a tile
from a global filter is its single most complained about defect.

**Pre-sorted best and worst panels instead of a sortable table.** HubSpot
Ads ships four fixed panels: high CPC, low CPC, high cost per contact, low
cost per contact. Zero interaction required to see the outlier.

**Cost twins.** Every volume metric gets its cost metric in the adjacent
column. HubSpot pairs `Contact lifecycle count` directly above
`Contact lifecycle cost`, same stage order, same widths.

**Model comparison as columns, not modes.** HubSpot's attribution summary
shows `Sum first interaction`, `Sum last interaction`, `Sum full path`,
`Sum U-shaped`, `Sum W-shaped`, `Sum time decay` side by side. Nobody has
to switch modes and remember.

**Preview before commit.** Klaviyo's `Compare model` shows
`Current settings` versus `Preview settings` with the revenue effect,
then `Apply settings`.

---

## The benchmark pattern (Klaviyo, the most reusable thing found)

Table columns: `Metric`, `Your Performance`, `Your Value`, `Median (Peers)`.
A `Detailed View` toggle adds `Your Percentile`, `25th Percentile`,
`75th Percentile`.

Four status labels tied to published percentile bands:
`Poor` below 25th, `Fair` 25th to 50th, `Good` 50th to 75th,
`Excellent` above 75th.

Chart encoding: grouped bars, three per period. Blue is you, green is peer
median, yellow is industry median, and a **dashed blue horizontal line is
the guidance or target**. Not a distribution curve, not a bullet chart.

A `How we chose your peer group` disclosure sits at the bottom listing the
matching characteristics **with your value next to the range peers fall
between**. That range-plus-your-value row is excellent and underused.

Deliverability uses a different pattern worth having in the toolkit: a
table headed `Deliverability performance targets` with columns
`Metric`, `Needs attention`, `Room for improvement`, `Healthy`, worst to
best left to right, with published numeric bands.

---

## Branching funnels: the settled answer

**Do not draw a funnel shape where the product does not enforce sequence.**
A tapering funnel makes three claims at once: ordering, exclusivity, and
monotonic decline. Parallel post-signup actions satisfy none of them.

GoHighLevel's own documentation demonstrates the failure: a "NO SHOW"
stage in a funnel chart shows 40% when the true answer is 20%, because the
chart assumes strict sequence.

**Klaviyo does not draw flows as funnels at all.** After a decade they
landed on: the graph is the report. A vertical node canvas, analytics
overlaid on nodes, and:

- Splits named `Split #1`, paths named `Path #1`, catch all always present
  and always named **`Everyone else`**, undeletable
- Edges labelled with evaluation order: `Check first`, `Check second`,
  `Otherwise`
- Branch volume shown as count **and** percent of the split's entrants,
  never of total entrants
- **Revenue never attributed to a branch.** Rates live on steps, money
  lives on messages. A split routes people, it does not earn

**Do not use a Sankey for overlapping actions.** A Sankey encodes a
partition: flows out of a node are mutually exclusive and sum to the
inflow. If one person can do three of the parallel actions, a Sankey either
double counts or forces invented exclusive buckets. Reserve it for the
genuinely exclusive case.

**The build rule for this repo:** linear stepped bars for the ordered
spine, then a branch table with one explicit shared denominator stated in
the header, for example `Of 96 verified accounts, within 30 days:`.

---

## Denominator transparency

The most important rule in this document.

Amplitude computes funnel conversion as users who triggered every event
divided by users who triggered the **first** event. Mixpanel offers both
"from previous step" and "from first step". The two dominant tools
genuinely disagree, which means **an unlabelled conversion percentage is
ambiguous even to an expert reader**.

Always print the denominator in words next to the rate:
`412 of 1,240 completed signups (33.2%)`.

Costs twelve characters. Buys trust in every other number on the page.

---

## Small sample handling

Klaviyo publishes real thresholds. Use them as precedent rather than
inventing your own.

| Surface | Gate | Behaviour below |
|---|---|---|
| Campaign 30 day performance | 3 campaigns, 100 recipients, 10 per campaign | Section does not render |
| Benchmarks | 25 sends in 6 months | No benchmarks |
| Predictive CLV | 500 ordering customers, 180 days history | Section renders **blank** with an explanation |
| Deliverability flag | 2+ failing metrics AND segment is 5%+ of volume | No flag |
| Campaign A/B | 50 per variation, 90% win probability | See taxonomy below |

Klaviyo's four state A/B taxonomy is the model:
`Statistically significant` gets a green tag. `Promising` gets **no tag**
plus an alert to rerun. `Not statistically significant` gets a gray tag.
`Inconclusive` gets **no tag** plus prose.

Three of the four states are communicated by the **absence** of a tag.
Colour and badges are earned by sample size.

Three behaviours to implement together:
1. Show the count, suppress the rate. A rate on n=5 is a lie with a decimal point.
2. Keep the container, blank the value, explain why. A hidden row reads as zero.
3. Never award a badge, colour, delta or benchmark to a sub threshold value.

Also: GoHighLevel's survey table shows `N/A` in the drop off column for
slide 1, because there is no prior step. Explicit `N/A` for a structurally
undefined value beats a blank or a zero.

---

## Complaints to design against

Named, sourced, and each one is a trap this repo should not fall into.

**HubSpot**
- Reports built with different report types show different totals for the
  same thing on one dashboard. Users read it as a data error and stop
  trusting the whole surface.
- Period comparison works on one KPI at a time and is lost when boolean
  filters are used.
- No rolling relative date ranges in the custom builder, only hardcoded
  dates, so teams edit reports weekly and introduce human error.
- Dashboard date filters silently do not apply to cross object tiles. Open
  since 2018.
- Filters are all or nothing. Users leave notes on tiles telling colleagues
  which filters to remove.
- `Too many data points requested` hard error above 100 breakdown values.
  The tile just fails.
- Same object on two date properties gives two defensible different
  numbers with no warning.

**Salesforce**
- 20 component ceiling per dashboard.
- Dashboard filters single select, capped at 5 filters and 50 values.
- Filters dropped entirely from emailed dashboards.
- Refresh fails silently and `Last Refresh Date` does not update.
- Silent truncation at 2,000 rows and 1,000 groupings. Matrix reports over
  2,000 rows: clicking Show Details does nothing.
- Datorama ease of use scores 3.9 against 4.3 overall, its weakest score.
  One Capterra review: eight months and tens of thousands of dollars and
  it could not produce impressions by media source.

**Klaviyo**
- Revenue massively inflated versus GA4 and Shopify. Causes: the window
  starts at delivery not engagement, a delivered SMS claims revenue with
  zero clicks at 12 hours, Apple MPP opens count by default, refunds are
  never subtracted.
- Attribution changes rewrite all history within 36 hours with no frozen
  record of what was previously reported.
- The same metric disagrees with itself: 25.7% flow open rate on the
  dashboard versus 30.85% in a custom report, same period, same sends.
- Deleting a flow branch destroys its analytics.

**GoHighLevel**
- "The reporting UI looks like it's from 2008." 350 vote idea, status
  "planned" since July 2022.
- Click rates silently wrong: an email with no CTA reported a 5% click rate.
- Revenue booked on created date, not won date. 507 votes.
- The top voted dashboard request is for a **basic math widget** so
  agencies can compute a conversion rate.
- Advanced filters do not survive a page refresh.
- New widgets default to `All Time`, which is meaningless.

---

## Period comparison conventions

- Compare like period to like period. Q3 against Q3 last year, not against
  the previous 90 days. HubSpot's KPI `Compare by` does this.
- Percent change versus the immediately prior equal length period is the
  default everywhere. GoHighLevel states it explicitly in their FAQ.
- Klaviyo's compact notation is worth stealing: `30d (Δ)` meaning the total
  over 30 days with the delta versus the prior 30 in parentheses.
- Auto switch chart granularity by range: daily under 30 days, weekly to
  90, monthly beyond. Klaviyo does this.
- Neither HubSpot nor Salesforce uses sparklines in KPI tiles. They use a
  number plus a delta and a separate full size chart. Sparklines are a
  Klaviyo and Geckoboard convention. Using one puts you ahead of HubSpot,
  not level with it.
- Default every widget to a rolling window, never "All time", and state
  the comparison basis in the interface.

---

## Related docs

- `dashboard-craft-rules.md` for the buildable visual and interaction checklist
- `crm-metric-dictionary.md` for exact metric names and definitions
- `olesmoky-evidence-register.md` for the graded sources behind the model
