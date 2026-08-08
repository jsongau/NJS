# CRM metric dictionary

Exact metric names as the products actually ship them, with definitions.
Researched 8 August 2026. Use these strings verbatim. Invented metric names
are the fastest way to look like someone who has read about CRM rather than
run one.

Flagged below: several commonly assumed metric names **do not exist**.

---

## Klaviyo

| Label as shipped | Definition |
|---|---|
| `Revenue per recipient` | Revenue attributed to a message over a timeframe divided by people who received it |
| `Rev/rec` | Short column form on dashboard cards |
| `Open rate` | Unique individuals who opened divided by recipients |
| `Click rate` | Unique individuals who clicked divided by recipients |
| `Click through rate` | Clicked divided by **opened**. This is Klaviyo's click to open |
| `Placed order rate` | Orders within the attribution window divided by unique recipients |
| `Recipients` | Messages sent, includes bounces |
| `Delivered` / `Delivery rate` | Successfully delivered; rate is delivered over sent |
| `Successful deliveries` | Count and percent delivered, excluding bounces |
| `Bounce rate` | Bounced addresses over total recipients |
| `Unsubscribe rate` | Unsubscribed over total recipients |
| `Spam complaint rate` | Complaints over total recipients |
| `Skipped` | Recipients skipped at send: suppressed, failed filters, smart sending |
| `Waiting` | Queued, will send in future |
| `Attributed revenue` | Revenue attributable to Klaviyo email, SMS or push |
| `Attributed conversions` | Shown instead when the conversion metric has no monetary value |
| `30d (Δ)` | Total over 30 days with the delta versus prior 30 in parentheses |

**Does not exist in Klaviyo:** "Deliveries" as a metric name, "Conversion
value" outside cohort analysis, "click to open rate", "revenue per click".

**Attribution windows**, default cooperative last touch:
email clicks 5 days, email opens 5 days, SMS clicks 5 days,
SMS opens 1 day, **SMS deliveries 12 hours**, push opens 24 hours,
active on site 1 day. Max 90 days or 720 hours.

The SMS delivery window is why Klaviyo revenue looks inflated versus GA4:
a delivered SMS with zero engagement can claim an order.

---

## HubSpot

**Traffic analytics**
| Label | Definition |
|---|---|
| `Sessions` | Series of activities by a visitor, expires after 30 minutes idle |
| `Session to contact rate` | Form submissions over unique visitors for the period |
| `New contacts` | Contacts created in the period |
| `Contact to customer rate` | Percent of new contacts in the period that became customers |
| `Bounce rate` | Percent who leave after one page |
| `Page view to submission rate` | Submissions over page views |

**Campaign metrics**
| Label | Definition |
|---|---|
| `New contacts (first touch)` and `New contacts (last touch)` | Shipped as two separately named metrics, not one metric with a hidden setting |
| `Influenced contacts` | Unique contacts that engaged with one or more campaign assets, new and existing |
| `Unique marketing influences` | Unique assets that influenced a contact; can exceed influenced contacts |
| `Attributed revenue` | Closed won revenue per the selected attribution model |
| `Average cost per contact` | Average cost of all influenced contacts across lifecycle stages |
| ROI, shown in product | `((revenue - campaign spend) / campaign spend) * 100` |

**Ads**
Network sourced: `Impressions`, `Clicks`, `Amount Spent`, `Engagements`,
`Network conversions`.
HubSpot calculated: `Click-Through Rate (CTR)`, `Total Contacts`,
`Cost per Contact`, `Cost per session`, `Sessions`, `Deals`,
`Revenue from deals`, `ROI`.
Lifecycle: `Leads`, `Marketing Qualified Leads`,
`Sales Qualified Leads`, `Opportunities`, `Customers`.
Cost twins: `Cost per lead`, `Cost per MQL`, `Cost per SQL`,
`Cost per opportunity`, `Cost per deal`.

**Journey analytics summary**, four metrics:
`Total conversion`, `Cumulative conversion`,
`Average time to complete journey`, `Average time between steps`.

Note: HubSpot's answer to time in stage is not a column. It is those last
two summary numbers.

**Attribution models with weights:**
`First interaction` 100% first, `Last interaction` 100% last,
`Linear` equal, `U-shaped` 40/40/20,
`W-shaped` 30/30/30/10, `Full path` 22.5% x4 plus 10% middle,
`Time decay` 7 day half life, `J-shaped` 20/60/20,
`Inverse J-shaped` 60/20/20.

---

## GoHighLevel

KPI cards: `Page Views`, `Page Views by Step`, `Opt-in`, `Time on Page`,
`Sales`, `Opt-in Conversion Rate`, `Average Time`, `Exit Before 30s`.

| Label | Definition |
|---|---|
| `Opt-in` | Any conversion: purchase OR form OR survey OR appointment booked |
| `Opt-in Conversion Rate` | Opt ins over unique page views |
| `Sales` | Revenue |
| `Exit Before 30s` | Visits ending within 30 seconds, visits under 2 seconds excluded as noise |
| `Average Cart Value` | GHL says this, not AOV |
| `Conversion Rate` | Leads in WON status over all leads opted in |

**No `Sessions` card and no `Revenue` card.** Default date range is
Last 14 days.

Funnel step table columns: `Page`, `Views (All/Uniques)`,
`Opt-ins (Count/Rate)`, `Sales (Count/Rate/Value)`, `Earnings/Page View`.

Survey slide table: `Slide`, `Views`, `Drop-Off` shown as both a count and
a percent, with `N/A` on slide 1 because there is no prior step.

**Semantic trap:** the `Funnel` widget and `Stages Distribution` widget use
opposite semantics. Funnel counts current stage through last stage
including WON, cumulative. Stage Distribution counts OPEN opportunities in
that stage only, point in time.

---

## Salesforce

Dashboard component types, 11: `Horizontal Bar Chart`, `Vertical Bar
Chart`, `Stacked Bar`, `Line Chart`, `Donut Chart`, `Funnel Chart`,
`Scatter Chart`, `Metric`, `Gauge`, `Table`, `Lightning Table`.

Report formats: `Tabular`, `Summary` up to 3 groupings, `Matrix` 4
groupings, `Joined` up to 5 blocks.

CRM Analytics widgets, 14: `Chart`, `Table`, `Number`, `Text`, `Image`,
`Container`, `Filter`, `Date`, `List`, `Range`, `Toggle`, `Link`,
`Repeater`, `Component`.

Marketing Cloud Intelligence object model: `Collections` contain `Pages`
contain `Widgets`. Data splits into `Dimensions` (non numeric) and
`Measurements` (numeric). Saved filter states are `Interactive FilterSets`.

**Hard limits worth knowing:** 25 widgets per dashboard, max 20 charts and
tables, 5 dashboard filters, 50 values per filter, single select only.
Widgets calculate up to 1,000 groupings. Reports display max 2,000 rows.
Only 5 metrics display in the Lightning report header.

---

## Meta Ads Manager

Relevant to any paid social model in this repo.

| Label | Definition |
|---|---|
| `CTR (all)` | Any click: reactions, profile taps, see more, photo expands |
| `CTR (link click-through rate)` | Clicks on the link destination, including in platform |
| `Outbound CTR` | Clicks that actually leave Meta |
| `Cost per result` | Full amount spent divided by results. Not incremental |
| `Frequency` | Impressions divided by reach |
| `Reach` | People, not impressions |

**The most conflated pair in the category.** Published sweepstakes and
vertical CTR figures are almost always CTR (all). Link CTR runs roughly
half. Nobody publishes the ratio, so any conversion between them is an
assumption and must be graded as one.

---

## Rules for using this dictionary

1. Use the shipped string, including its casing, when imitating a product.
2. If a metric is not in this file, either find the real name or invent one
   and label it clearly as your own definition.
3. Every rate needs its denominator stated in words next to it.
4. Cost per X is always full spend divided by that row unless stated
   otherwise. It is not incremental and the same dollar appears on every
   line. Say so once, near the table.
