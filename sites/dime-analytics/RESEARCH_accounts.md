# The customer after the signature

Research for `/book/accounts`. Everything below was read on **14 August 2026** unless a different date is
stated on the line. Every non-obvious claim carries the URL it came from. Where a source asserts something
without evidence I say so rather than laundering it.

Read first, so the argument is anchored: `JD_BREA.md`, `ANALYSIS_jd_coverage.md`, `src/data/book.ts`,
`src/domain/vocabulary.ts`, `src/domain/selectors/partners.ts`, plus `src/domain/types.ts` lines 150 to 300
and the two contracted rows in `src/data/prospects.ts`.

## The finding that reorganised this document

I went looking for the annual rebooking anniversary, because that is what "year over year business" (W4)
sounds like it means. It is not what this venue's two accounts do.

- **Heights Christian Schools, Brea Campus.** `buyingWindow` reads
  `"Dec (Christmas program week), May-Jun (end of year), Jun-Aug (summer program)"`. Three occasions a year.
  Contracted event 20 November 2026.
- **Team Kwon Taekwondo Center, HQ.** `buyingWindow` reads `"Jun + Dec"`. Two occasions a year. Contracted
  event 12 December 2026.

Neither is annual. A rebooking model built on "the same date next year" would be wrong for **both** of the
only two customers this venue has, on day one, before it has made a single mistake. And the seed data is
independently corroborated: California School of Martial Arts publishes that colour belt and black belt rank
tests run "every two months" and black belt Dan tests "every 6 months", approximately June and December
(https://calsma.com/belt-test-day-information/, read 14 August 2026). Team Kwon's `"Jun + Dec"` is not a
guess somebody typed. It is what a taekwondo school's calendar actually looks like.

So the mechanic is not an anniversary. **It is the next named occasion**, and the window opens a segment
specific lead time before that occasion rather than a fixed number of days after the last event. The rest of
this document is mostly the consequences of that sentence.

---

# 1. The products event venue sales teams actually use

I went inside support documentation and API reference rather than marketing pages, because the marketing
pages of all eight of these products say the same six adjectives.

## 1.1 The object model they all converge on

Every serious product in this category has **three levels**, and the prospecting CRM in this repository has
one and a half.

**Tripleseat** is the clearest statement of it.

- Account versus Contact: "a contact is the guest or point of contact for an event in Tripleseat" and an
  account is "the organization or company to which that contact belongs". Their worked example is Sonjali
  Gurung of Pfizer hosting a holiday party. She is the contact, Pfizer is the account. Critically: "a contact
  cannot exist without an associated account", and for a purely personal booking "the account should be set
  to match the contact's name", so the account is mandatory even when it is degenerate.
  (https://support.tripleseat.com/hc/en-us/articles/1500008969882-What-is-the-difference-between-a-Contact-and-an-Account)
- Booking versus Event: "Bookings are the 'umbrella' of what you are hosting. They allow you to have multiple
  Events to be tied together." and "Events are used to book an event for a specific Date for a length of time.
  Every Event will automatically be put into a Booking." Their example is a wedding: one booking, three events
  (rehearsal dinner, ceremony, reception) on different dates.
  (https://support.tripleseat.com/hc/en-us/articles/360020582174-What-is-the-difference-between-a-Booking-and-an-Event)

So the stack is **Account, then Booking, then Event**. Organisation, then occasion, then date.

This application currently has Prospect and BookLine. A `BookLine` is an Event. There is no Account and no
Booking. That is precisely the level at which retention lives: retention is a property of the account, and a
recurring occasion is a property of the booking. Both of the missing levels are the ones the job posting asks
about.

## 1.2 What an account record actually holds

Oracle OPERA Cloud Sales and Event Management publishes its Sales Account field list in full, and it is the
most complete public inventory I found. The **Sales Information** panel of an account profile carries
(all verbatim, https://docs.oracle.com/en/industries/hospitality/opera-cloud/24.2/ocsuh/t_managing_profiles_editing_sales_information.htm):

| Field | Oracle's own description |
| --- | --- |
| Territory | "the sales territory to which the account is assigned" |
| Priority | "the business importance of the profile or contact" |
| Business Potential | "the importance of the account in drawing accommodations business" |
| Account Type | "the type of sales account" |
| Business Segments | "the business segments this profile represents for your property" |
| Industry | "the industry classifications of the account" |
| Account Source | "the origins of the account, such as media ad, website, and so on" |
| Mail Action | mailing action codes, for building lists |
| Influence | "the influence the Contact has in the decision-making process" |
| Competition | "your properties competition for this account" |
| Scope | "the broad geographical areas where the profile or account generates business" |
| Scope City | headquarters city, or the property this account frequently uses |

And the account profile's panel list, which is more revealing than the fields
(https://docs.oracle.com/en/industries/hospitality/opera-cloud/26.3/ocsuh/t_viewing_editing_sales_account_profile.htm):

> Profile: Contacts, Communications, Channel Negotiated Rates, Delivery Types, Dynamic Fields, **Forecast**,
> Keywords, Owner Referrals, Owner Records, Sales Information, Subscriptions, Notifications, Attachments,
> Notes, Emails. Billing: Accounts Receivable, **Negotiated Rates**, Financials, Commission.
> Stays: **Future and Past Stays, Future and Past Blocks**.

Two of those are the whole difference between a prospecting CRM and an account CRM.

**"Future and Past Blocks" on one panel.** The account record shows what this organisation has bought and
what it is about to buy, in the same place. A prospecting CRM shows only what is about to be bought, because
by construction nothing has been. `ProspectRecordModal.tsx` proves the point: its "Signed" section at lines
802 to 828 is the last thing the application has to say, and it says it in the future tense.

**Forecast.** OPERA lets you store, per account, per period: Room Nights, Average Rate, Room Revenue, F and B,
Other Revenue, over "calendar months or fiscal periods", described as "the expected revenue and room nights on
sales account profiles for specific periods of time"
(https://docs.oracle.com/en/industries/hospitality/opera-cloud/24.2/ocsuh/t_profile_managing_sales_account_forecast.htm).
This is an **expectation stored against a customer**. A prospecting CRM has no such field, because a prospect
has no expectation, it has a probability. The distinction matters: a forecast is what you will chase them for.
A probability is what you will discount them by.

Note the honest limitation, which Oracle's own documentation does not hide: the Forecast panel is
"a forward-looking forecasting tool only", with no built-in comparison to actuals or prior year. The comparison
lives in reports instead.

Also worth recording: OPERA supports **parent and subsidiary accounts**, aggregating "room night and revenue
production from subsidiary accounts on a parent sales account" when the Relationship control is active. For
Brea this is not theoretical. Brea Olinda High School, the district office and the athletics booster club are
three accounts with one parent, and grad night, staff appreciation and the banquets are three different
occasions with three different signatories inside it.

## 1.3 How a repeat booking is actually created from a past one

This is thinner in every product than you would expect, and the thinness is the opportunity.

**Tripleseat.** From the event's Actions menu, "Copy this Event". "You will be prompted to choose a date and
time for the second event, rename it, and also have the ability to copy over documents from the initial event."
For anything genuinely recurring they push you off events and onto bookings: "adjust the booking date range"
then "use the Events tab within the Booking to copy events multiple times as needed", and "you can copy the
initial event as many times as you wish"
(https://support.tripleseat.com/hc/en-us/articles/217151248-How-do-I-repeat-my-Events-).
So: manual copy, with a date picker. No occasion. No prompt. No clock.

**Perfect Venue.** Recurring events exist and are explicitly weekly or monthly:
"Recurring events on the calendar are helpful if you host special events on a weekly or monthly basis", with
Name, Date, Time, Frequency, Venue and Space. And a stated limitation: "the system does not allow users to edit
or delete one recurring event within a group, without changing all"
(https://help.perfectvenue.com/knowledge/notes-recurring-events).
**There is no annual option.** A weekly quiz night is recurrence. A December holiday party is not, in this
model, and it is the higher value booking of the two.

**Caterease.** Copying exists (the help centre has a video titled "Copying Events and Making Events Recur",
https://help.caterease.com/copying-events-and-making-events-recur/, which is a Wistia embed with no text, so
I cannot quote its options). Its Advanced Event Manager training guide does confirm the account/prospect
split exists as a first-class concept: "you can make fields required for your accounts (or 'customers'), your
prospective leads, your events"
(https://www.caterease.com/wp-content/uploads/2015/09/GB_Advanced_Event_Manager_Tools.pdf). Three record types,
named separately: customers, leads, events.

**Event Temple.** Hotel Tech Report's feature inventory lists Pipeline CRM, Contact Management, Lead Scoring,
Workflow Automations, BEO Management, Room Blocks, and "Pace, Sales Activity, and GRC Reporting", and notes
the platform "emphasizes repeatability through 'cloning' for recurring client arrangements"
(https://hoteltechreport.com/meetings-and-events/hotel-sales-software/event-temple-sales-crm).
Cloning again. Manual again.

**The honest summary:** across the four leading products, creating next year's booking from last year's is a
**copy button plus a human remembering to press it**. Nobody has built the clock. The one place I found the
clock described as a product capability is a vendor blog, not a support doc, and it names exactly the mechanic
this application should build: "Rebooking reminders: messages tied to past event anniversaries to encourage
repeat bookings" and "Anniversary tracking: system remembers client dates without manual recall"
(https://www.eventbookingengines.com/blog/best-event-booking-crm-features). That article provides no evidence
for its claims and I am citing it as a description of an intent, not as a finding.

## 1.4 The one product that has genuinely built the clock

Oracle OPERA. Not as a rebooking feature, as a generic scheduling primitive, which is better.

**Sales Activities** are appointments, sales calls and to-dos, and they can be assigned to "Accounts, Contacts,
and Business Blocks", created "manually or automatically", assigned to multiple owners each receiving their own
copy, and closed with a mandatory **Activity Result code**
(https://docs.oracle.com/en/industries/hospitality/opera-cloud/23.5/ocsuh/c_osem_activities_concept.htm).

**Auto Traces** generate those activities from rules: "Use auto-traces to configure rules for the automatic
creation of activities based on the creation, update or deletion of a Sales Account, Contact, Block or Activity"
(https://docs.oracle.com/en/industries/hospitality/opera-cloud/24.3/ocsuh/c_admin_inventory_configuring_sales_activities_auto_traces.htm).

And the **Activity Trace Definition** is the schema worth stealing, verbatim
(https://docs.oracle.com/en/industries/hospitality/opera-cloud/23.4/ocsuh/t_osem_admin_managing_trace_definitions.htm):

> **Date Calculation:** Select a date field from the list.
> **+/- Days:** Define the date offset logic: select whether to go forward (plus) or backward (minus) from the
> date selected in Date Calculation; enter the number of days. Leaving this field blank generates the activity
> with a start date equal to the date in the Date Calculation field.
> **Activity Class:** Appointment or To Do. **Purpose:** text shown on the activity.
> **For Owner:** Current, Primary, or Custom.
> **Based On:** Manage Expressions, with and/or, attribute, operator, first value, second value.

That is the entire rebooking mechanic expressed generically: **an anchor date, a signed day offset, a purpose,
an owner, and a condition.** Five fields. Everything in section 2 below is an instance of it.

## 1.5 What the entertainment and bowling stack does not have

Worth stating plainly, because it is the wedge argued in `ANALYSIS_jd_coverage.md`.

**CenterEdge Advantage Events** (the FEC event booking product) lists flexible event bookings, customisable
event packages, F and B integration, capacity management that prevents double booking, add-ons, real-time
upgrades, and recurring series options
(https://centeredgesoftware.com/products/advantage-events/event-bookings/). No customer record, no past
booking history, no follow-up, no retention reporting on that page.

**QubicaAMF Conqueror X**, the dominant bowling centre management system, lists Lane Management, League and
Tournament Management, POS, Conqueror QPad, bowling modes, QPortal, and a Business Dashboard with "key
performance indicators, historical analysis and comparisons, operational statistics"
(https://www.qubicaamfbowling.com/products/management-operations/conqueror-x). It calls itself a "bowling
management, POS, and marketing system" and the page does not elaborate the marketing half at all. The league
module is the closest thing to a retention product in the bowling stack, and it retains *individual bowlers*,
not group accounts.

So the venue this application is written for will, in real life, have a POS that knows about lanes and a
scoring system that knows about leagues, and **nothing at all that knows that Heights Christian bought
something in November**. That is the gap `/book/accounts` fills, and it is a real gap rather than a
work-sample gap.

## 1.6 Fields an account carries that a pure prospecting CRM does not

Distilled from the above, this is the list to design against.

1. **Last delivered date** and **next expected occasion date**. Prospects have neither.
2. **Cycle**, meaning expected days between occasions. Not a field any of these products has explicitly; all
   of them imply it and none of them stores it. This is the field I am going to argue for hardest.
3. **Lifetime figures**: events delivered, total value, average headcount. OPERA's Account Statistics report
   carries Stays, Total Nights (individual, blocked, total) and Net Revenue by Room, F and B, Miscellaneous
   and Total, per account, with Priority, Owner, Business Segment and Territory as dimensions
   (https://docs.oracle.com/en/industries/hospitality/opera-cloud/22.5/ocsuh/c_osem_account_statistics_report_rep_acc_stats_rep_with_rep_acc_stats_fmx.htm).
   Note honestly: that report "does not show prior year comparisons", it is a single date range.
4. **Forecast** for the coming periods. An expectation, stored.
5. **Negotiated rate**. The rate this account has been promised, distinct from the published price. The
   application already owns one of these and does not know it: `midweek-daytime-lock` in `src/data/venue.ts`
   is a rate agreed now and honoured for a year, which is an account-level term with no account to live on.
6. **Owner**, plus owner mapping. Retention is somebody's job and the field says whose.
7. **Influence and decision structure.** A prospect has a `decisionMakerTitle`. An account has a person who
   left, a successor who did not sign the last contract, and a committee that rotates. More on this in 6.1.
8. **Parent and subsidiary.** School district, campus, booster club.
9. **Post event outcome.** Nothing in a prospecting CRM records whether the thing that was sold went well,
   and it is the single strongest predictor of whether it sells again.

---

# 2. The rebooking mechanic

## 2.1 What the industry actually believes about timing

There are three separate timing claims worth separating, because they are usually mashed together.

**Claim one: the ask lands best while the buyer is still inside the experience.** This is the trade show and
exhibition industry's entire commercial model, and it is the most developed practice I found. Map Your Show,
which builds floor plan and rebooking software for shows, describes the standard motion: "the typical rebooking
process starts about 8-10 weeks before the event" with rates, collateral and floor plans prepared in advance;
account managers work "manageable groups of around 10-15 exhibitors per account manager/representative, per day
of the event"; the live floor plan creates visible scarcity; onsite incentives include "discounted rates, better
stand placements, bundled marketing offers"; and they recommend "a 14-day cooling-off period so exhibitors can
rebook confidently"
(https://blog.mapyourshow.com/blog/rebooking-and-booth-sales-strategies-that-drive-results).
Their onsite product page adds that applications are "prepopulated from the previous year"
(https://www.mapyourshow.com/onsite-rebooking). Neither page publishes a conversion figure, which I note
because I looked for one specifically and it is not there.

The same instinct exists in the appointment based service world with a number attached, though a weakly
sourced one: "clients who rebook on the day of their service make an average of 30% to 50% more visits per
year" (https://www.yocale.com/blog/5-tips-for-rebooking). Yocale cites nothing for it. Treat it as a
practitioner belief with a plausible mechanism, not as evidence.

**Claim two: the second purchase is the dangerous one, and it decays fast.** This one has numbers from two
unrelated industries that agree with each other, which is why I trust the shape.

- Exhibitions: "Industry exhibitor retention sits at ~62%, and only 44% of first-time exhibitors return"
  (https://snoball.events/exhibitor-retention-for-events/). First-timers convert at roughly seven tenths the
  rate of the established base.
- Salons: repeat client retention around 75% and stronger operators "past 85%", against a new client
  conversion (first visit to second) of "around 35%" industry average, 50% as a target and roughly 70% for top
  performers. Plus the decay claim: "if a first-timer hasn't rebooked within about 30 days" the probability of
  return drops "to roughly one in five"
  (https://www.callpad.ai/post/salon-client-retention-rate-benchmarks-improve).

Both of these are other industries and I am not going to pretend they are venue benchmarks. What transfers is
the **shape**: a first-time buyer returns at roughly half to seven tenths the rate of an established one, and
the gap opens early. Main Event Brea's entire book, forever, until 21 November 2026, consists of first-time
buyers. Every account on this board is in the highest-risk state a retention model has.

**Claim three: for discretionary annual occasions the ask has to land in the buyer's planning month, not on
the event's anniversary.** This is where the corporate holiday party evidence is unusually specific.

Catering Funnels lays out the season month by month: "July-August: Large companies begin vendor research.
Event coordinators send RFPs or informal requests to caterers"; "September-early October: Shortlists are
finalized. Proposals are evaluated"; "October-November: Contracts are signed and logistics confirmed";
"December: Execution." They state the conclusion directly: holiday decisions occur "between August and early
October, not during the holiday season itself", and what is left in October and November is "smaller,
last-minute bookings" or vendor replacements. Their recontact advice is the useful part: "A follow-up in
January that says 'how did the holiday event go?' opens the conversation for the next cycle"
(https://cateringfunnels.com/blog/corporate-holiday-party-catering-playbook).

Releventful, from the venue side, puts the same cycle a quarter earlier: "Their events team is researching
options in Q2, presenting recommendations internally in Q3, and confirming bookings well before the calendar
flips to fall", with June and July as the shortlist months
(https://www.releventful.com/blog/when-corporate-clients-start-looking-for-venues). Neither source cites
research. They agree with each other and they are written by people who sell into the cycle, which is the best
evidence available on this question and I am not going to overclaim it.

The same source also says the thing a venue does not want to hear, and it is the reason the whole board exists:
vendor relationships are "less sticky than most operators assume" because of decision-maker role changes, new
event coordinators, and mediocre prior experiences.

## 2.2 The four candidate mechanics, judged

**(a) The anniversary of last year's event.** Simple, and wrong for both of Brea's accounts, per the finding
at the top. It is also wrong in a subtler way for schools: a grad night that fell on 12 June 2026 does not
recur on 12 June 2027, it recurs on the Thursday after the last day of the school year, which moves. An
anniversary model produces a date nobody's calendar contains.

**(b) A hold placed for next year at the end of this year's.** This is the trade show model and it is the
strongest of the four when the occasion genuinely repeats on a known date. Its cost is inventory: a hold blocks
a date, and the application already has a strong opinion about that. `PITCH_STATUS["soft-hold"]` is amber with
the note "a hold is worth nothing until it converts, and it blocks the date meanwhile". Any hold this mechanic
places has to inherit that discipline, including a release date.

**(c) A standing annual slot.** A negotiated recurring term. Real, and the application already owns one in
`midweek-daytime-lock`. Best suited to the accounts with the least date sensitivity, which for Brea is the
weekday daytime business: staff appreciation, senior communities, school programme days.

**(d) A post event thank you carrying next year's date.** Cheap, low commitment, and the only one of the four
that works when the occasion's date is not yet knowable. It is a placeholder, not a hold.

## 2.3 The mechanic I recommend, and its timing

**Anchor on the occasion, not on the event.** Then everything is an OPERA style trace: an anchor date, a
signed offset, a purpose.

Five dated obligations per account per cycle. The first three are anchored on the **delivered event**. The
last two are anchored on the **next occasion**.

| Trace | Anchor | Offset | Purpose |
| --- | --- | --- | --- |
| Confirm | delivered event | minus 1 day | Last operational check. Belongs to operations, listed here so the account timeline is complete. |
| **Debrief** | delivered event | **plus 1 day** | The thank you, and one recorded sentence on how it went. This is the field that predicts everything downstream. |
| **Place the next one** | delivered event | **plus 14 days** | Late enough that the debrief has landed, early enough that the event is still vivid. Names the next occasion in the buyer's own words and either takes a hold or records a placeholder. |
| **Window opens** | next occasion | **minus planning lead** | The board starts asking for this account by name. |
| **Window closes** | next occasion | **minus commit lead** | After this the decision is made, with or without us. A window that closes with no signature is a **missed window**, which is the churn event. See section 3. |

**Why plus 14 and not plus 1 for the ask.** Two reasons, both defensible out loud. Trade show practice puts
the ask inside the event because the buyer is physically present and the floor plan is scarce; a bowling venue
has neither of those levers at the moment a school group is filing onto a coach. And the debrief has to come
back first, because asking for the next booking before you know whether the last one went well is how you find
out in the worst possible way. Fourteen days is also inside the 30 day decay window the salon data describes,
for whatever that analogy is worth.

**Where the planning lead comes from.** Not from a constant. From the segment, and the segment numbers I have
sources for are in section 6. As a summary:

| Segment | Planning lead to use | Source |
| --- | --- | --- |
| Corporate holiday party | 120 days open, 60 days close | research July to August, decisions by early October, for December (Catering Funnels) |
| School programme event | 70 days open, 30 days close | 8 to 10 week committee formation, by analogy with banquet planning |
| Youth sports banquet | 70 days open, 30 days close | "8-10 weeks before the banquet date" includes reserving the venue (Digital Record Board) |
| Grad night | 365 days open, 120 days close | annual committee handover, section 6.2 |
| Church youth ministry major event | 180 days open, 60 days close | "Major events (retreat, mission trip, service day): three to six months" (Ori) |
| Martial arts belt test celebration | 90 days open, 21 days close | test cycle every 2 to 6 months (CalSMA) |

These are this application's own numbers, derived from the sources named, and they should be printed on the
screen next to the bar the way `STALENESS_DAYS` already is on `/partners`. A boundary the reader cannot see is
a boundary they have to trust.

## 2.4 The industry's own name for the year over year read

Worth adopting, because it is what a District Sales Manager will already have in their head.

Amadeus Delphi's **Guestroom and Catering Pace report** compares definite bookings against budget and against
"same-time-last-year", and defines STLY precisely: "'Same Time Last Year.' This is the number of definite
guestrooms, guestroom revenue, and event revenue compared to the same activity date range for last year". Its
columns are New Definite, Lost/Downgrade, Reval, Slippage, Net Change, Definite, Budget, Variance, % Variance,
Actual Last Year, STLY, Variance to STLY, Variance to STLY %, Prospect, Tentative. And it separates two date
axes: **Activity Date** (when the booking was created or modified) and **Consumption Date** (when the revenue
is generated)
(https://help.amadeus-hospitality.com/sales-and-event-management/advanced/content/pace-report.html).

Three things to take from this.

1. **The status vocabulary is Prospect, Tentative, Definite, Actual, with Lost and Slippage as exits.** That
   maps almost exactly onto `PitchStatus` up to `booked`, and it extends past it in the direction this
   application needs. Slippage in particular has no equivalent here: a booking that moved rather than died.
2. **Two clocks, always.** When it was sold and when it is consumed. This application has one, `eventDate`.
   A rebooking board needs both, because "signed in March for a June occasion" and "signed in May for a June
   occasion" are the same revenue and completely different sales performance.
3. **Year over year is measured at equal elapsed time, not at year end.** STLY compares like activity ranges.
   That is the correct discipline, and it is the reason a pre-opening venue can measure something on day one:
   pace is defined at every point on the curve, not only at the end of it.

---

# 3. Account health and churn when the signal is an absence

## 3.1 Read of `src/domain/selectors/partners.ts`

The file is right about the thing it is for and it says so better than most production code. Its header states
the failure mode exactly: a supplier relationship "does not fail loudly... four months pass, the person who
knew you leaves, and the next quote comes back at list price from a stranger". The arithmetic is:

```ts
const days = Math.max(0, daysBetween(partner.lastWorked, asOf));
staleness = stalenessOf(days);
// STALENESS_DAYS = { cooling: 30, cold: 60, goneQuiet: 120 }
```

Four buckets on one absolute day count, computed at render against an injected `asOf`, sorted coldest first,
thresholds printed on screen.

## 3.2 Does it transfer? Partly, and the part that does not is the important part.

**There are two different absences and the file conflates them because for suppliers they are the same thing.**

- **Contact staleness.** Days since anybody spoke to them. For a supplier, this is the whole story: you talk
  to a supplier when you need something, so days since contact and days since order are the same number.
- **Purchase staleness.** Days since they last bought. For a customer on an annual cycle these two numbers
  come apart completely, and a model that only has one of them will be wrong about one of them.

**Contact staleness transfers verbatim.** Port `Staleness`, `stalenessOf`, `STALENESS_META` and the sort
order onto the account with no change at all. A customer you have not spoken to in 120 days is in exactly the
condition the partners file describes, and the Releventful finding gives the mechanism: the coordinator
changed and the new one has never heard of you. If anything the thresholds should be *tighter* for accounts
than for suppliers, because a supplier who forgets you sends a worse quote and a customer who forgets you
sends nothing.

**Purchase staleness does not transfer, and here is the arithmetic showing why.**

Take Heights Christian. Suppose the 20 November 2026 event delivers. Their next occasion under
`buyingWindow` is the Christmas programme week, roughly three weeks later. Their occasion after that is
May to June. Run `stalenessOf` on days since last purchase across a year:

| Date | Days since last event | `stalenessOf` says | Truth |
| --- | --- | --- | --- |
| 20 Dec 2026 | 30 | Cooling | On cycle. A December occasion is live right now. |
| 20 Feb 2027 | 92 | Cold | Perfectly healthy. Their next occasion is May. |
| 20 Mar 2027 | 120 | **Gone quiet** | Perfectly healthy. Nothing is due for two months. |
| 20 Jul 2027 | 242 | Gone quiet | Now genuinely in trouble. Two occasions missed. |

The bucket is red for eight months of a healthy relationship and then it is still red when the relationship
actually breaks. A signal that is on all the time is not a signal, and it is *worse* than no signal because it
trains the reader to ignore the column.

**The fix is one division.** The partners file already contains a cycle assumption, it just does not name it.
Its boundaries at 30, 60 and 120 days are the boundaries of a relationship whose natural working rhythm is
about 40 days: 30/40 = 0.75, 60/40 = 1.5, 120/40 = 3.0. Suppliers can share one unstated cycle because a print
run and a prize reorder are roughly the same tempo. Customers cannot, because Team Kwon is on 180 days and a
holiday party is on 365 and a chamber mixer host is on 90.

**So: normalise recency by the account's own cycle.**

```ts
/** Expected days between occasions for THIS account. Never a constant. */
cycleDays      = expectedCycleDays(account)
daysSinceLast  = daysBetween(account.lastDeliveredDate, asOf)
overdueRatio   = daysSinceLast / cycleDays
```

Buckets on the ratio, not on the days:

| Ratio | Bucket | Meaning |
| --- | --- | --- |
| below 0.75 | **On cycle** | Nothing is due. Generates no work and no colour. |
| 0.75 to 1.00 | **Window open** | The next occasion is inside its planning lead. The only bucket that generates work. |
| 1.00 to 1.25 | **Overdue** | The month they normally buy has passed with nothing signed. |
| above 1.25 | **Lapsed** | A quarter cycle past due, with a window closed behind it. |

Set against a 40 day cycle these boundaries land at 30, 40 and 50 days, so **the partners model is the special
case of this model where every counterparty happens to share a cycle**. That is the right thing to say in the
code comment: this is a generalisation of `partners.ts`, not a replacement for it, and `partners.ts` was never
wrong, it was correct about a population with one tempo.

## 3.3 The absence signal proper: missed windows

Ratios are a smooth reading and churn in this business is a discrete event. When the purchase happens once or
twice a year, the churn event is not "N days elapsed", it is **a window opened and closed with nothing in it**.

```ts
missedWindows = count of rebooking windows whose closeDate < asOf
                since the last delivered event, with no BookLine created
                against that occasion
```

- 0 missed windows: the account is fine, whatever the day count says.
- 1 missed window: **at risk**. This is the answer to "what does at risk mean when a purchase happens once a
  year". It means they had an occasion, we knew about it, the window shut, and they spent the money somewhere.
- 2 missed windows: **lapsed**. Move to win-back, which is a different motion with different copy.

This is scale-free, it works identically for Team Kwon on 180 days and a grad night on 365, and it is
falsifiable: every missed window has a date on it and a reason field that somebody has to fill in.

It also produces the honest reading for Brea today. Zero windows have closed, so no account can be at risk,
and the board should say that rather than showing four green ticks it has not earned.

## 3.4 The other two health signals, and what to do with them at n=1

**Shrinking headcount.** `BookLine.guests` exists. The delta between consecutive delivered events on the same
occasion is the single most predictive account signal in a per-head business, because it moves before the
account leaves: a corporate party that goes from 120 to 70 has had a budget conversation, and the year after
that it goes to zero. Field: `headcountDelta`, `valueDelta`. At n=1 both read "no prior event" and the screen
says so. They are not zero. Zero would be a lie.

**A lengthening gap.** `observedCycleDays` = median of gaps between consecutive delivered events on the same
occasion. Needs three events to be a median and two to be a number at all. Until then the account runs on the
**declared** cycle, and the two must be visually distinguished, exactly the way this application already
distinguishes `pricePerGuestProvenance: "public"` from `"user_input"`. A cycle read off `buyingWindow` is
modelled. A cycle measured off two delivered events is observed. The badge already exists in the design
system.

## 3.5 What the statistical literature says, and why not to use it here

The standard tool for exactly this problem, non-contractual repeat purchase with no cancellation signal, is
the BG/NBD family. It estimates a probability the customer is still "alive" from three inputs: **x**, the
number of repeat transactions, **t_x**, the time of the last one, and **T**, the length of the observation
period, plus fitted population parameters r, a, b and alpha
(https://arxiv.org/html/2502.12912v1). The intuition is the one section 3.2 arrives at arithmetically: the
same 200 day silence means something different for a frequent buyer than for an infrequent one, and the model
gets that by inferring each customer's own rate from their own history.

**Do not implement it, and say why.** With x = 0 repeat transactions the posterior is the prior: the model
returns the population average and learns nothing from the customer. Brea has two accounts, zero delivered
events and zero repeats. A fitted model here would be a number generator with a Greek letter on it, which is
the exact failure this codebase has spent 216 files refusing. The declared cycle from `buyingWindow` is a
**stated prior**, it is honest about being one, and it is the right structure to swap for observed data later.
That swap is a one-line change in `expectedCycleDays` and the comment should say so.

The practitioner version of the same idea is RFM, where recency, frequency and monetary are scored into
quartiles or quintiles and combined into named segments: Champions, Loyal, Potential loyalists, New customers,
Promising, Needs attention, About to sleep, At risk, Can't lose them, Hibernating. "About to sleep" is
"below average recency and frequency. Will lose them if not reactivated"; "At risk" is "some time since
they've purchased. Need to bring them back!"
(https://www.futurice.com/blog/know-your-customers-with-rfm). Quartile scoring needs a population to cut into
quartiles. Two accounts do not have quartiles. Same verdict, same reason.

The commercial version, for comparison, is cruder still and worth knowing as the floor: a typical win-back
automation runs on a daily scheduled selection over contacts who have made "at least one purchase" but "have
not purchased within the last six months", entering "once every six months", with three messages at 0, plus 3
days, and plus 5 days (https://help.engage.voyado.com/hc/en-gb/articles/26205519206428-Creating-a-win-back-automation).
A flat six month threshold. For Team Kwon on a June and December cycle, that automation fires at the exact
moment the account is healthiest.

---

# 4. The metrics a venue sales manager is measured on for retention

## 4.1 Definitions I can source

**Repeat Client Rate.** "(Bookings from previous clients / Total bookings) x 100". Listed as one of seven
essential venue KPIs alongside space occupancy, revenue per square metre, average revenue per event,
inquiry-to-booking conversion, average response time and margin per event. No benchmark given for the repeat
rate itself; the conversion benchmark on the same page is "a high-performing venue converts between 15 and 30
percent of its inquiries. Below 10 percent, there is likely a problem", and the response time target is
"under two hours during business hours"
(https://joinways.app/blog/7-essential-kpis-event-venue-profitability).

**Repeat Customer Rate, general form.** "(Number of Returning Customers / Total Number of Customers) x 100",
with the explicit warning that the trap is "counting jobs instead of customers", so one customer with three
services is one repeat customer, not three
(https://www.servicemonster.com/blog/the-science-behind-your-real-repeat-rate). That source is a home services
software vendor and its benchmark, "40-60% is typically considered a healthy benchmark" with below 30%
signalling a problem, is stated for cleaning businesses only. Not a venue benchmark. I am citing it for the
formula and the counting trap, not the number.

**Prime-Date Booking Rate.** "Booked prime dates / available prime dates", benchmarked at "60%-80%+ for
mature wedding-season Saturdays". Same source gives Contribution Margin at "55%-65% for full-service" and
Average Revenue Per Event as "total event revenue / paid events"
(https://startupfinancialprojection.com/blogs/kpis/banquet-hall). This is a business-plan template site and
its numbers should be read as conventional wisdom rather than measured data, but the prime-date framing is
genuinely useful for a bowling venue where Friday and Saturday evening are the scarce inventory and the
retention question is which accounts get to hold them.

**Net Revenue Retention.** "NRR = MRR today from paying customers one year ago / MRR from the same group of
customers a year ago", conventionally measured over 12 months because that "allows for the full customer
lifecycle" and "nullifies any impact from seasonality". Gross Revenue Retention is the same figure with
expansion stripped out, so NRR is always greater than or equal to GRR. Benchmarks quoted: 79% for early stage,
94% top quartile at 1 to 3M ARR, 99% at 3 to 15M, over 105% at 15 to 30M
(https://chartmogul.com/saas-metrics/nrr/). These are SaaS subscription benchmarks and do not transfer to a
venue. **The formula does.** Replace MRR with trailing twelve month event revenue per account and you have a
usable retention figure for a booking business, and the 12 month window is not a convention here, it is
forced: with an annual purchase cycle any shorter window measures seasonality.

**The profitability claim.** "Increasing customer retention rates by 5% increases profits by 25% to 95%",
attributed by HBR to Frederick Reichheld of Bain, alongside "acquiring a new customer is anywhere from five to
25 times more expensive than retaining an existing one", which HBR itself hedges as "depending on which study
you believe, and what industry you're in"
(https://hbr.org/2014/10/the-value-of-keeping-the-right-customers, article dated October 2014). If this
appears anywhere in the application it should carry the hedge, because the second half of it is folklore with
a citation stapled on.

**Tripleseat's own benchmark list** for event venues names: Revenue per Event and Total Event Revenue,
average spend per guest, Booking Pace and Lead Time, Cost per Cover and Revenue per Square Foot, Conversion
Rates and Sales Efficiency, and "Customer Satisfaction & Repeat Business". It advises collecting "at least 12
months of event records" before comparing, and supplies no numeric benchmarks at all
(https://tripleseat.com/blog/benchmarking-understanding-the-power-of-event-data-to-impact-growth/). The
absence is itself the finding: the category leader publishes no repeat-rate benchmark, which is why section 7
recommends the application state its own thresholds on screen rather than implying an industry standard exists.

**Retention benchmarks that do exist, in adjacent industries.** Restated from section 2.1 because this is
where they belong as metrics: exhibitor retention ~62% overall, 44% for first-timers
(https://snoball.events/exhibitor-retention-for-events/); salon retention 60 to 70% overall, ~75% for repeat
clients, past 85% for strong operators, ~35% new-client conversion against a 50% target and ~70% for top
performers (https://www.callpad.ai/post/salon-client-retention-rate-benchmarks-improve). Use these as shape,
label them as other industries, never as "the benchmark".

## 4.2 The metric that is missing from every list and matters most here

None of the sources above measures **the sales manager's behaviour**. They all measure the outcome. Repeat
client rate goes up when the food is good and down when a coordinator leaves, and a sales manager controls
neither directly.

`/coaching` in this repository already makes exactly this argument for acquisition, splitting the verbs:
activity is coached, revenue is managed. The retention board needs the same split, and the leading indicator
is:

**Rebooking rate = windows closed with a signature / windows closed.**

It has a denominator the manager creates by identifying occasions, a numerator they create by working the
window, and it is defined the moment the first window closes rather than after a year of trading. It is also
the figure the quarterly bonus in P2 should be gated on, for the reason `/coaching` already gives: a bonus
paid on a school district's budget cycle is a lottery, and a bonus paid on windows worked is a job.

---

# 5. Post event

## 5.1 The sequence, and where each part belongs

The published sequences are all written for conference organisers rather than venues, and they show it. The
best structured one runs: thank you within 24 hours with the resources attached, more value on day 3 to 5,
educational content in week 1 to 2, soft offer in week 2 to 3
(https://www.thezulumethod.com/blog/post-event-email-guide). That is a B2B nurture sequence aimed at
attendees, not at the person who signed the contract, and copying it into a venue tool would be a category
error.

Here is the venue sequence, with the ownership question answered for each step, because the brief asks
specifically which parts belong in a sales tool.

| When | Step | Owner | In the sales tool? |
| --- | --- | --- | --- |
| minus 1 day | Final confirm: headcount, arrival, allergies, lane allocation | Operations | **Reference only.** The account timeline should show it happened. It must not be actionable here or two systems own one task. |
| Day of | Host present at arrival | Sales, in person | **Yes, as a completed activity.** D1's go-see with a *current* customer. |
| plus 1 day | **Thank you, and the debrief** | Sales | **Yes. This is the core of the build.** Two fields: a message sent, and one recorded sentence on how it went. |
| plus 1 to 3 days | Final invoice or balance settlement | Finance | **No.** Reference the state, do not own it. An unpaid balance blocks a rebooking ask and the board needs to know that, which is not the same as processing it. |
| plus 3 to 7 days | Photos delivered | Marketing or operations | **No, but link it.** Photographs are the single most effective rebooking artefact a venue has and the sales tool should know whether they went out, because "here are your photos" is the best-performing pretext for the plus 14 contact. |
| plus 5 to 10 days | Survey | Operations or marketing | **No. Consume the result.** The satisfaction score belongs on the account record as a health input. Running the survey does not. |
| plus 7 to 14 days | **Review request** | Sales or marketing | **Yes, as a prompt.** Evidence: 78% of consumers were asked for feedback in the past 12 months and "83% of people asked to leave a review went on to leave one this year", with 28% saying they will "always" write a review if asked, up from 16% in 2025 (BrightLocal Local Consumer Review Survey 2026, n = 1,002 US adults, https://www.brightlocal.com/research/local-consumer-review-survey/). The same survey is why the timing is tight: "74% seek reviews written in the last three months", "32% look for reviews written in the last two weeks", up from 20% in 2025. A review harvested six weeks late is worth materially less. |
| plus 14 days | **Place the next one** | Sales | **Yes. The whole point.** |
| plus 14 to 21 days | Referral ask | Sales | **Yes, folded into the plus 14 contact.** Not a separate touch. The venue's referral value is highest inside a segment: one PE teacher tells another PE teacher. This is the same mechanism as the Embassy Suites go-see already seeded in `book.ts`, which the note there correctly calls "a referral relationship, not a booking, and it is worth more than most bookings". |
| Window open | Named ask for the next occasion | Sales | **Yes.** |
| Window close | Outcome recorded, win or missed | Sales | **Yes.** The missed window is the churn event and it needs a reason. |

## 5.2 The one field that carries the most weight

The **debrief sentence** at plus 1 day. Not a rating out of five. One line of prose from the person who was
there, in the buyer's words where possible.

Justification: Releventful's explanation for why vendor relationships are less sticky than operators assume is
a three item list and one of the three is "mediocre prior experiences"
(https://www.releventful.com/blog/when-corporate-clients-start-looking-for-venues). A five means nothing
eleven months later. "The 6pm arrival was chaos because two coaches turned up at once and there was nobody at
the door" is a sentence that tells the next sales manager exactly what to fix and exactly what to say when
they ring in March.

This application is already unusually good at this. `data/conversations.ts` carries 156 threaded messages and
`Reply.summary` is prose rather than a code. The debrief is the same design applied to the other side of the
signature.

---

# 6. Segment specifics: six cycles, six triggers

The differences are the point. Each of these gets a different cycle, a different anchor and a different lead
time, and the lane model in `domain/lanes.ts` plus the `OccasionClass` split in `types.ts` already gives the
right axis: **calendar-locked buyers work backwards from a fixed date, discretionary buyers have to be reached
during a decision window.** Rebooking inherits that split exactly.

## 6.1 Corporate holiday party. Discretionary. Cycle 365. Trigger: the buyer's planning month.

- 64% of companies planned a holiday celebration in 2024, level with 2023, with 6% never holding one (down
  from 8%), 4.5% virtual (up from 3.9%), 17% planning to cut spend (up from 8%), and 2% skipping on economic
  grounds. Survey of 173 HR and business leaders, November and December 2024
  (https://www.challengergray.com/blog/2024-rate-of-parties-on-par-with-2023-but-with-lower-budgets-companies-optimistic-on-hiring-business-conditions-heading-into-new-year/).
  Two thirds of the corporate lane holds an annual occasion. The occasion is highly likely to exist. What is
  not likely is that it exists **at your venue**.
- The cycle: research July to August, shortlists September to early October, contracts October to November,
  execution December (Catering Funnels, cited above). Releventful puts research a quarter earlier, in Q2.
- **Window opens 120 days before the occasion, closes 60 days before.** For a December occasion that is August
  to October, which is the researched window with a margin on each side.
- The trigger that actually works is not the anniversary, it is **January**. "A follow-up in January that says
  'how did the holiday event go?' opens the conversation for the next cycle" (Catering Funnels). It is a
  debrief eleven months early rather than a sales call, and it is the one contact in the year that is
  guaranteed not to be competing with six other venues.
- **The risk unique to this segment is personnel.** The account survives, the buyer does not. `Influence` and
  a named successor matter more here than anywhere else, and a missed window in this segment should prompt
  "is the coordinator still there" before it prompts "did they go elsewhere".
- Brea already has the shape of this in the loss data: Fairway Ford in `SEED_REPLIES` said their holiday party
  "is already contracted at a hotel and has been for three years" and to "come back in February if we want the
  summer sales push". That is a competitor's retained account described in the incumbent's own terms, and the
  February diary entry is a window opening on a *different* occasion.

## 6.2 Schools, grad night. Calendar-locked. Cycle 365. Trigger: committee handover.

- Grad night is the one genuinely annual occasion in this trade area and it is the largest, at Brea Olinda's
  "roughly 380 seniors" per `SEED_REPLIES`.
- The mechanic that makes it different is that **the buyer is replaced every year by design**. GradNight.org's
  manual states that "each year the Grad Night committee needs to re-evaluate the past decisions, rules and
  policies", and on surplus funds recommends "use the money for the following year's party. Early cash is
  always needed for deposits and supplies before next year donations or ticket money becomes available"
  (https://www.gradnight.org/grad_night_manual.php?c=11). Parent volunteer committees turn over as their
  children graduate. There is a treasury that carries forward and a chair who does not.
- **This is a handover account, not a relationship account.** The retention asset is not the person, it is the
  institutional record: the deposit that carried over, the school's own file, the standing date. The account
  field that matters is a **named institutional anchor** who does not turn over, which in Brea's data is
  already identified: `SEED_ACTIVITY` act-seed-3 says of Brea Olinda High School, "The Assistant Principal for
  Activities and Athletics owns grad night and every team banquet. One person, one visit, an entire school
  year of occasions." That is the parent account. The committee is the subsidiary.
- **Window opens 365 days before, closes 120 days before.** The ask goes to the outgoing committee at the
  event and to the incoming committee in September. This is the one segment where the trade show mechanic
  transfers cleanly, because the outgoing committee's last useful act is to hand a booked venue to the next
  one, and they know it.
- I looked hard for a published grad night booking lead time and did not find one in a citable form. Venue
  marketing says only "Grad Night venues book up fast, especially at popular destinations across the Inland
  Empire" (https://bullwinkles.com/upland/blog/grad-night-party-ideas-inland-empire-high-school), which is an
  interested party asserting scarcity. The 365 and 120 figures above are this application's proposal, reasoned
  from the committee handover mechanic, and should be badged as such.

## 6.3 Schools, everything else. Calendar-locked. Cycle 120 to 180. Trigger: the school year.

- Heights Christian's `buyingWindow` names three occasions: December programme week, May to June end of year,
  June to August summer programme. Brea Olinda's names two seasons of banquets plus grad. The Brea Olinda
  Unified district office row names "Apr-May (Teacher/Staff Appreciation Week), Aug (back-to-school kickoff)".
- **This is the segment where the account model earns its keep**, because one organisation holds several
  occasions on different clocks and a per-event model cannot see that. It is also where "average events per
  account per year" as a metric does real work: a school that buys grad night is worth one event, and a school
  that buys grad night plus two banquets plus a staff appreciation day is worth four, from the same
  relationship and the same single go-see.
- **Window opens 70 days before, closes 30 days before**, by analogy with banquet committee formation. Anchor
  on the school calendar, not on the anniversary, because the school year moves.

## 6.4 Youth sports banquets. Calendar-locked. Cycle 180 or 365. Trigger: end of season.

- Planning starts "8-10 weeks before the banquet date" and reserving the venue is in that first phase: "select
  date, establish budget, form committee, reserve venue", then 6 to 8 weeks for catering and awards, 4 to 6
  for headcount and programme, 2 to 3 for speakers and seating, and the week of for final numbers. The
  committee is "coaching staff, parent representatives, booster club members, and athletic department
  personnel" (https://digitalrecordboard.com/blog/sports-banquet-planning-complete-guide/).
- **The trigger is the season ending, and the season is published.** This is the most predictable occasion in
  the trade area and the least worked, because the buyer is a booster club with no procurement process.
- Two occasions a year for a school with fall and spring sports, which is why several `buyingWindow` values in
  `prospects.ts` read like `"Nov (fall sports), May-Jun (spring sports + grad)"`. Cycle 180, not 365.
- **Window opens 70 days before, closes 30 days before.** Reserving the venue is step one of the checklist, so
  the window closes early and hard: at 30 days out the venue is chosen.
- The referral mechanic is strongest here. Booster clubs talk to booster clubs and coaches move between
  programmes.

## 6.5 Faith groups. Mixed. Cycle 90 to 365. Trigger: the annual calendar planning day.

- The youth ministry year has a published shape: August back-to-school kickoff, September fall series and small
  group launch, October service project, November gratitude series, December Advent and a worship night,
  January spring launch and winter retreat, February outreach, March to April Lent and Easter, May senior
  sendoff, June to July mission trip and light summer programming
  (https://blog.oriapp.co/youth-ministry-annual-calendar-plan-the-full-year-2026/).
- The lead times from the same source: "Teaching series: six to eight weeks in advance. Major events (retreat,
  mission trip, service day): three to six months. Annual calendar overview: twelve months." And the planning
  trigger: start "in May or June for the following fall", with a planning day blocked "every August" to review
  the whole year and pick "six to eight highest-stakes moments".
- **This is the only segment with a single dated moment when the entire year is decided.** That is a gift. The
  correct account action is not a rebooking window at all, it is being in the room, or at least in the inbox,
  during the May to June planning window, with a proposal covering multiple occasions at once.
- **Window opens 180 days before the occasion, closes 60 before**, but the *account* trigger is a fixed annual
  date in May, not an offset from any one event.
- Also note: a faith group's occasions are among the few that fill weekday and daytime inventory, which is
  what `midweek-daytime-lock` exists for. This is the segment to attach a standing negotiated rate to.

## 6.6 Martial arts and similar programmes. Calendar-locked. Cycle 60 to 180. Trigger: the test cycle.

- Team Kwon's `buyingWindow` is `"Jun + Dec"`, cycle 180. Externally corroborated: colour belt and black belt
  rank tests "are held every two months", black belt Dan tests "every 6 months", approximately June and
  December (https://calsma.com/belt-test-day-information/).
- **The most frequent buyer in the book, and the one an annual model would serve worst.** At cycle 180 with a
  12 December 2026 event, Team Kwon's next occasion is June 2027 and their window opens in March 2027. Under
  `stalenessOf` they read "gone quiet" from 11 April 2027, one month after their window opened and two months
  before they were ever going to buy.
- **Window opens 90 days before, closes 21 days before.** A studio owner is a single decision maker with no
  committee, so the commit lead is short. The `SEED_ACTIVITY` note already says this about the lane: the phone
  works here because "a gym owner at the front desk" is standing next to it.
- The upside case is a standing slot: same Saturday morning after every Dan test, twice a year, agreed once.
  That is mechanic (c) from section 2.2 and this is the account to try it on.

## 6.7 The segment table, for implementation

| Segment | Occasion class | Cycle days | Window opens | Window closes | Anchor |
| --- | --- | --- | --- | --- | --- |
| Corporate holiday party | discretionary | 365 | 120 | 60 | occasion date, plus a fixed January debrief contact |
| Corporate, other (offsite, kickoff, appreciation) | discretionary | 180 to 365 | 90 | 45 | occasion date |
| Grad night | calendar-locked | 365 | 365 | 120 | school year end, plus committee handover at the event |
| School programme and staff events | calendar-locked | 120 to 180 | 70 | 30 | school calendar |
| Youth sports banquet | calendar-locked | 180 to 365 | 70 | 30 | season end |
| Faith group | mixed | 90 to 365 | 180 | 60 | annual planning day in May to June |
| Martial arts, dance, cheer test or recital | calendar-locked | 60 to 180 | 90 | 21 | test or recital cycle |
| Senior living staff appreciation | discretionary | 90 to 180 | 60 | 21 | rolling, tied to shift patterns |

The last row is drawn from `SEED_REPLIES` reply-seed-4, Silverado Brea, which asked for "a weekday daytime
staff appreciation for about 40, split across two shifts". Two smaller weekday events rather than one, on a
rolling cycle, is a retention shape rather than an acquisition shape and the reply already spotted it.

---

# 7. Recommended data model

## 7.1 The rule that governs everything else

**Do not extend `PitchStatus` past `booked`.** `ANALYSIS_jd_coverage.md` reaches this conclusion and it is
right for a reason worth restating in the code: the six pitch statuses are drawn as a filling circle, empty
ring to solid disc, and the glyph set *is* the semantics. Progress is a quantity, the circle fills, and `lost`
breaks the sequence deliberately because the sequence stopped. Adding `delivered` and `rebooked` to that ladder
would make the disc keep filling after it is full, and would silently redefine `booked` from "signed with a
deposit" to "not yet delivered" on every screen that renders it.

So: a **separate `AccountState`**, keyed off the `BookLine`, with its own glyph family. `vocabulary.ts` already
establishes that the three signal families are deliberately different shapes: filling circles for pitch status,
pointed and square marks for lanes, patterned squares for package family. Account state should be a **fourth
shape**. I would suggest an arc or bracket family, because the reading is cyclical rather than progressive, and
whatever is chosen it must survive greyscale.

## 7.2 `Account`

```ts
export interface Account {
  id: string;
  /** The organisation. Never duplicated, always resolved through the prospect. */
  prospectId: string;

  /* -------- identity, all resolved rather than copied -------- */
  /** Inherited: name, address, decisionMakerTitle, lane, orgType, geocode. */

  /* -------- the occasions this organisation holds -------- */
  occasions: Occasion[];

  /* -------- delivered history. Empty on day one, and that is the point. -------- */
  /** BookLine ids whose eventDate has passed. Derived, never stored. */
  // deliveredLineIds: computed at render from CONTRACTS and asOf

  /* -------- relationship -------- */
  ownerRole: string;          // "Sales Manager". A role, never a person.
  lastContactAt: string;      // drives contact staleness, ported from partners.ts
  /** The institutional anchor who outlives the committee. A title. */
  anchorTitle?: string;
  /** An agreed term that survives a single booking. midweek-daytime-lock etc. */
  standingTermId?: string;
  /** Where the balance sits. Referenced, never owned by this tool. */
  balanceState?: "settled" | "outstanding" | "not-applicable";
}
```

## 7.3 `Occasion`, the object this application is actually missing

This is Tripleseat's Booking, and it is the level at which rebooking happens.

```ts
export interface Occasion {
  id: string;
  accountId: string;

  /** The buyer's own words. "Christmas program week", not "Q4 event". */
  label: string;
  /** Inherited from the lane. Decides which clock applies. */
  occasionClass: OccasionClass;   // calendar-locked | discretionary

  /** Expected days between instances. NEVER a constant. */
  cycleDays: number;
  /** Where cycleDays came from. Same discipline as pricePerGuestProvenance. */
  cycleProvenance: "declared" | "observed";
  /** The string it was read from, so a reader can check it. */
  cycleBasis: string;             // e.g. 'buyingWindow: "Jun + Dec"'

  /** Days before the occasion when the window opens and closes. Segment. */
  planningLeadDays: number;
  commitLeadDays: number;

  /** The next instance. A date this application computes and shows its working for. */
  nextOccasionDate: string;
  nextOccasionProvenance: "declared" | "observed" | "confirmed-by-buyer";

  /** BookLine ids, oldest first. One per delivered instance. */
  lineIds: string[];

  /** Windows that closed with nothing signed. The churn event. */
  missedWindows: MissedWindow[];
}

export interface MissedWindow {
  closedOn: string;
  reason: string | null;   // null is honest: sometimes you do not know
  competitorNote?: string; // the write-in line from the week sheet, structured
}
```

`cycleProvenance` is the single most important field in this model. It is the reason the board can exist on day
one without lying: every cycle currently reads `"declared"` and every screen says so.

## 7.4 `AccountState`

Five states, keyed off the `BookLine` and the clock, never stored:

| State | Definition | Brea today |
| --- | --- | --- |
| `awaiting-delivery` | A signed line whose `eventDate` is in the future. | **Both accounts.** |
| `delivered` | An event has happened. Debrief may or may not be recorded. | From 21 Nov 2026. |
| `window-open` | `overdueRatio` between 0.75 and 1.00, or today is between window open and close. | 0 today. |
| `at-risk` | Exactly one missed window, or contact staleness past the cold boundary. | 0 today, and cannot be reached before mid-2027. |
| `lapsed` | Two or more missed windows. | 0, and cannot be reached before 2028. |

The table above, rendered on the screen with the right-hand column live, is a better argument for the
candidate than any populated board would be, because it demonstrates that the model has states it has honestly
not reached yet.

## 7.5 The arithmetic, in full

```ts
// ---------- the rebooking window ----------
windowOpensOn  = addDays(nextOccasionDate, -planningLeadDays)
windowClosesOn = addDays(nextOccasionDate, -commitLeadDays)

daysToWindowOpen  = daysBetween(asOf, windowOpensOn)     // negative once open
daysLeftInWindow  = daysBetween(asOf, windowClosesOn)

isWindowOpen = asOf >= windowOpensOn && asOf <= windowClosesOn

// ---------- the post event traces, OPERA style ----------
// anchor + signed offset, five of them, all derived
confirmOn   = addDays(eventDate, -1)
debriefOn   = addDays(eventDate, +1)
reviewAskOn = addDays(eventDate, +7)
nextAskOn   = addDays(eventDate, +14)
// then windowOpensOn and windowClosesOn, anchored on the occasion instead

// ---------- account health, two independent readings ----------
// A. contact staleness. Ported verbatim from partners.ts.
contactDays  = daysBetween(lastContactAt, asOf)
contactState = stalenessOf(contactDays)   // worked | cooling | cold | gone-quiet

// B. purchase staleness. Normalised by the account's OWN cycle.
daysSinceLast = lastDeliveredDate ? daysBetween(lastDeliveredDate, asOf) : null
overdueRatio  = daysSinceLast === null ? null : daysSinceLast / cycleDays

cycleState =
  overdueRatio === null   ? "not-yet-delivered" :
  overdueRatio <  0.75    ? "on-cycle"          :
  overdueRatio <= 1.00    ? "window-open"       :
  overdueRatio <= 1.25    ? "overdue"           :
                            "lapsed"

// C. the discrete churn event, which overrides B
riskState =
  missedWindows.length >= 2 ? "lapsed"  :
  missedWindows.length === 1 ? "at-risk" :
                               cycleState

// ---------- trend, null at n=1 and rendered as null ----------
headcountDelta = prior ? current.guests - prior.guests : null
valueDelta     = prior ? lineValue(current) - lineValue(prior) : null
observedCycle  = gaps.length >= 2 ? median(gaps) : null
```

**Every one of these is computed at render against an injected `asOf`, nothing is stored.** That is not a
stylistic preference, it is what makes the board honest: a screenshot taken in November shows the arithmetic
that was true in November, exactly as `partnerRows(asOf)` already does.

## 7.6 The metrics, defined

Four, with formulas, matching section 4.

```ts
// 1. Rebooking rate. The leading indicator. The manager's own scoreboard.
rebookingRate = windowsClosedWithSignature / windowsClosed

// 2. Accounts on cycle. The health count.
onCycleShare = accounts.filter(a => a.riskState === "on-cycle").length / liveAccounts

// 3. Revenue retained. GRR shape, ChartMogul formula, event revenue for MRR.
//    Denominator: what accounts that delivered in the prior 12 months spent then.
//    Numerator:   what those same accounts have spent in the trailing 12.
revenueRetained = trailing12FromPriorYearAccounts / priorYearFromSameAccounts

// 4. Events per account per year. The expansion metric.
eventsPerAccount = deliveredEventsTrailing12 / accountsDeliveringTrailing12
```

Metric 1 is the one to gate a quarterly bonus on, per section 4.2. Metrics 3 and 4 are the ones a District
Sales Manager will ask for.

---

# 8. Recommended screen: `/book/accounts`

Placement: a child of `/book`, exactly as `/book/week` already is. Not a twenty-first top level entry. The book
owns contracts and this is what happens to a contract afterwards.

## 8.1 The top of the screen

Four tiles. Each prints **its formula, its reading today, and the date it becomes measurable.** That third line
is what makes the header honest rather than embarrassing.

```
REBOOKING RATE            ACCOUNTS ON CYCLE        REVENUE RETAINED        EVENTS PER ACCOUNT
windows closed with       accounts inside their    trailing 12 from        delivered events / 12
a signature / windows     own cycle / live         last year's accounts    accounts delivering
closed                    accounts                 / what they spent

not yet measurable        2 of 2                   not yet measurable      not yet measurable
0 windows have closed     both awaiting delivery   no prior 12 months      no event delivered
first closes 14 Nov 2026  first delivery in 98 d   first reads 21 Nov 27   first reads 21 Nov 26
```

Then one line of state, in the same voice `venue.ts` and `book.ts` already use:

> No event has been delivered. The first is Heights Christian Schools on 20 November 2026, in 98 days. This
> board reads `delivered` from 21 November 2026. Its first rebooking window is already dated: Heights
> Christian's Christmas programme week opens on 5 October 2026 and closes on 14 November 2026, six days
> before the event they have already signed.

## 8.2 The middle: the twelve month clock

**This is the element that makes the page non-empty on day one, and it is the one to build first.**

A horizontal month axis, August 2026 through August 2027, with one row per occasion. Each row carries a bar
from `windowOpensOn` to `windowClosesOn`, a mark at `nextOccasionDate`, and a marker for the delivered event
where one exists. A vertical line at `asOf`.

Two accounts produce more rows than you would expect, because an account holds several occasions:

| Row | Occasion | Delivered | Window opens | Window closes | Occasion |
| --- | --- | --- | --- | --- | --- |
| Heights Christian | Christmas programme week | 20 Nov 2026 | 5 Oct 2026 | 14 Nov 2026 | mid Dec 2026 |
| Heights Christian | End of year | | 22 Mar 2027 | 1 May 2027 | end May 2027 |
| Heights Christian | Summer programme | | 21 Apr 2027 | 31 May 2027 | end Jun 2027 |
| Team Kwon | Test cycle, June | 12 Dec 2026 | 3 Mar 2027 | 11 May 2027 | Jun 2027 |
| Team Kwon | Test cycle, December | | 2 Sep 2027 | 10 Nov 2027 | Dec 2027 |

Five bars, two contracts, no invented facts: every occasion label above is read straight out of the two
`buyingWindow` strings and every date is arithmetic from the segment leads in section 6.7. The screen has a
year of dated work on it before anything has happened, which is the answer to the day one problem.

And it produces the useful reading immediately: **the nearest window opens on 5 October 2026, 52 days from
now, and it closes six days before the first event is even delivered.** Heights Christian's December
programme has to be sold before their November voucher block runs. A board organised around anniversaries
would not have found that. A board organised around occasions finds it on the first render.

## 8.3 The account cards

One per account, below the clock. Each carries:

- **Name**, as a live button into `ProspectRecordModal`, as every organisation name in this application already
  is.
- **State chip**, from `AccountState`, in the new glyph family. Both read `Awaiting delivery` today.
- **Two staleness readings, side by side and clearly separate.** Days since last contact with its ported
  partners bucket, and days since last delivered event with its cycle ratio. The second reads "no event
  delivered" today and must not read zero.
- **The occasion list**, each with its cycle in days, its provenance badge (`declared`, from
  `buyingWindow: "Jun + Dec"`), and its next window dates.
- **The delivered event**, when there is one: date, guests, lanes, value, and the debrief sentence. Before
  there is one, the contracted line with a countdown.
- **The five traces as dated rows**, not prose. For Heights Christian today: confirm 19 Nov, debrief 21 Nov,
  review ask 27 Nov, place the next one 4 Dec. Four dated obligations from one contract.
- **Two actions.** "Debrief" writes an activity line against the account. "Ask for the next one" opens
  `EmailComposeModal` on a new intent. Both must be disabled before the event with the reason stated, because
  a button that does nothing is worse than a button that explains itself.

## 8.4 Below the cards

- **The state table from 7.4**, with the live count against each row. This is where the honesty lives: five
  states, two of them occupied, three of them unreachable until a specific stated date.
- **The leagues link.** `domain/leagues.ts` opens by calling leagues "the only recurring product this building
  sells" and it is the second retention path. Sixteen teams claiming the same two lanes for sixteen weeks is
  the retention motion already modelled. The accounts board should point at it rather than duplicate it.
- **The thresholds, printed.** `planningLeadDays` and `commitLeadDays` per segment, and the four ratio
  boundaries, stated on screen with their sources, the way `STALENESS_DAYS` already is. No source publishes
  these numbers for bowling venues and the page should say so in one line rather than implying a standard.

## 8.5 Two new email templates, and no more

`lib/email/templates.ts` has thirteen drafts and not one addressed to somebody who has already bought. Two
close that.

1. **The debrief and thank you**, sent at plus 1 day. Asks one question and does not sell. Its subject line
   should not contain the word "booking".
2. **Place the next one**, sent at plus 14 days. Names the next occasion in the buyer's own words off the
   `Occasion.label`, offers a date, and states what the hold costs, which is nothing, exactly as the Brea
   Olinda reply in `SEED_REPLIES` already promises in writing.

A third, the January debrief for the corporate holiday lane, is worth adding when the corporate lane has an
account in it. It does not today and should not be written speculatively.

---

# 9. Why the screen earns its place on day one

The honest constraint: nothing has been delivered, and inventing a back catalogue is forbidden. Five reasons
the board is still the right thing to build first.

**One. A clock has content and a history does not, yet.** Two contracts and two `buyingWindow` strings produce
five dated windows, four dated post event traces per contract, and a nearest actionable date 52 days out. That
is a full screen of work derived from facts already in `src/data/`, with nothing added. The board is not
waiting for data; it is generating the schedule the data implies.

**Two. It finds something true on the first render.** The Heights Christian December programme window opens on
5 October and closes on 14 November, which is before the 20 November event that account has already signed.
A sales manager who only looks at the book sees one contract in November. A sales manager who looks at this
board sees a second occasion at the same organisation that has to be closed first. That finding exists today,
it is checkable against the `buyingWindow` string, and it is the sort of thing a hiring manager can be shown
in fifteen seconds.

**Three. The empty states are the argument.** Three of the five account states cannot be reached before 2027
and the screen says so with dates. A board full of green ticks it has not earned would be less impressive and
more suspicious. `ANALYSIS_jd_coverage.md` is right that this is the one item on the build list where the
honest version beats the dishonest one, and the reason is specific: Main Event Brea is publicly not open, so
any populated retention board is a lie an interviewer can catch by opening a browser.

**Four. Every account on it is a first-time buyer, which is the state the evidence says is most dangerous.**
Exhibitor retention runs ~62% overall and 44% for first-timers; salon retention runs ~75% for repeat clients
and ~35% for first visits. Different industries, same shape: a first purchase converts to a second at roughly
half to seven tenths the rate of an established relationship. A venue whose entire book is first purchases has
the highest churn exposure it will ever have, on the day it opens, and building the retention machinery before
the first event is not premature. It is the only time it can be built without a backlog already leaking.

**Five. It answers the posting's most repeated idea with a mechanism rather than a list.** Retention is named
five times in the first six lines of `JD_BREA.md`, plus W4, W5, D1 and D7. A logo wall says the candidate can
fill a table. A board that says "nothing has been delivered, the first event is in 98 days, here are the four
dated things that happen the fortnight after it, and here is the window in which each of these five occasions
either rebooks or is missed" says the candidate designed the retention process before there was anybody to
retain. That is what W5 literally asks for: "develop a sales campaign focused on communicating and nurturing
customer relationships and driving repeat sales". Develop. Before, not after.

---

# Sources

All read 14 August 2026.

**Products and data models**
- Tripleseat, Contact vs Account: https://support.tripleseat.com/hc/en-us/articles/1500008969882-What-is-the-difference-between-a-Contact-and-an-Account
- Tripleseat, Booking vs Event: https://support.tripleseat.com/hc/en-us/articles/360020582174-What-is-the-difference-between-a-Booking-and-an-Event
- Tripleseat, repeating events: https://support.tripleseat.com/hc/en-us/articles/217151248-How-do-I-repeat-my-Events-
- Tripleseat, event benchmarking: https://tripleseat.com/blog/benchmarking-understanding-the-power-of-event-data-to-impact-growth/
- Perfect Venue features: https://www.perfectvenue.com/features
- Perfect Venue, recurring events and notes: https://help.perfectvenue.com/knowledge/notes-recurring-events
- Event Temple feature inventory, Hotel Tech Report: https://hoteltechreport.com/meetings-and-events/hotel-sales-software/event-temple-sales-crm
- Caterease, Advanced Event Manager Tools (PDF): https://www.caterease.com/wp-content/uploads/2015/09/GB_Advanced_Event_Manager_Tools.pdf
- Caterease, copying and recurring events (video only): https://help.caterease.com/copying-events-and-making-events-recur/
- Amadeus Delphi, Guestroom and Catering Pace report: https://help.amadeus-hospitality.com/sales-and-event-management/advanced/content/pace-report.html
- Oracle OPERA Cloud, Sales Activities: https://docs.oracle.com/en/industries/hospitality/opera-cloud/23.5/ocsuh/c_osem_activities_concept.htm
- Oracle OPERA Cloud, Sales Activities Auto Traces: https://docs.oracle.com/en/industries/hospitality/opera-cloud/24.3/ocsuh/c_admin_inventory_configuring_sales_activities_auto_traces.htm
- Oracle OPERA Cloud, Activity Trace Definitions: https://docs.oracle.com/en/industries/hospitality/opera-cloud/23.4/ocsuh/t_osem_admin_managing_trace_definitions.htm
- Oracle OPERA Cloud, Sales Information panel: https://docs.oracle.com/en/industries/hospitality/opera-cloud/24.2/ocsuh/t_managing_profiles_editing_sales_information.htm
- Oracle OPERA Cloud, Sales Account Forecast: https://docs.oracle.com/en/industries/hospitality/opera-cloud/24.2/ocsuh/t_profile_managing_sales_account_forecast.htm
- Oracle OPERA Cloud, Sales Account Profile panels: https://docs.oracle.com/en/industries/hospitality/opera-cloud/26.3/ocsuh/t_viewing_editing_sales_account_profile.htm
- Oracle OPERA Cloud, Account Statistics Report: https://docs.oracle.com/en/industries/hospitality/opera-cloud/22.5/ocsuh/c_osem_account_statistics_report_rep_acc_stats_rep_with_rep_acc_stats_fmx.htm
- CenterEdge Advantage Events, event bookings: https://centeredgesoftware.com/products/advantage-events/event-bookings/
- QubicaAMF Conqueror X: https://www.qubicaamfbowling.com/products/management-operations/conqueror-x
- Momentus, event CRM: https://gomomentus.com/blog/everything-you-need-to-know-about-event-crm
- Event Booking Engines, CRM features for repeat clients (vendor blog, unsourced claims): https://www.eventbookingengines.com/blog/best-event-booking-crm-features

**Rebooking and timing**
- Map Your Show, rebooking and booth sales strategies: https://blog.mapyourshow.com/blog/rebooking-and-booth-sales-strategies-that-drive-results
- Map Your Show, onsite rebooking: https://www.mapyourshow.com/onsite-rebooking
- Snoball, exhibitor retention: https://snoball.events/exhibitor-retention-for-events/
- Catering Funnels, corporate holiday party playbook: https://cateringfunnels.com/blog/corporate-holiday-party-catering-playbook
- Releventful, when corporate clients start looking for venues: https://www.releventful.com/blog/when-corporate-clients-start-looking-for-venues
- Yocale, rebooking tips (unsourced statistics): https://www.yocale.com/blog/5-tips-for-rebooking

**Health, churn and metrics**
- Futurice, RFM segmentation: https://www.futurice.com/blog/know-your-customers-with-rfm
- BG/NBD churn model, arXiv 2502.12912: https://arxiv.org/html/2502.12912v1
- Voyado Engage, win-back automation: https://help.engage.voyado.com/hc/en-gb/articles/26205519206428-Creating-a-win-back-automation
- ServiceMonster, repeat rate arithmetic: https://www.servicemonster.com/blog/the-science-behind-your-real-repeat-rate
- Ways, seven venue KPIs: https://joinways.app/blog/7-essential-kpis-event-venue-profitability
- Banquet hall KPIs: https://startupfinancialprojection.com/blogs/kpis/banquet-hall
- ChartMogul, net revenue retention: https://chartmogul.com/saas-metrics/nrr/
- Harvard Business Review, The Value of Keeping the Right Customers (October 2014): https://hbr.org/2014/10/the-value-of-keeping-the-right-customers
- Callpad, salon client retention benchmarks: https://www.callpad.ai/post/salon-client-retention-rate-benchmarks-improve

**Post event**
- BrightLocal, Local Consumer Review Survey 2026 (n = 1,002 US adults): https://www.brightlocal.com/research/local-consumer-review-survey/
- The Zulu Method, post-event email guide: https://www.thezulumethod.com/blog/post-event-email-guide

**Segments**
- Challenger, Gray & Christmas, 2024 holiday party survey (n = 173, Nov to Dec 2024): https://www.challengergray.com/blog/2024-rate-of-parties-on-par-with-2023-but-with-lower-budgets-companies-optimistic-on-hiring-business-conditions-heading-into-new-year/
- GradNight.org, Grad Night manual: https://www.gradnight.org/grad_night_manual.php?c=11
- Bullwinkle's Upland, grad night guide (venue marketing): https://bullwinkles.com/upland/blog/grad-night-party-ideas-inland-empire-high-school
- Digital Record Board, sports banquet planning guide: https://digitalrecordboard.com/blog/sports-banquet-planning-complete-guide/
- Ori, youth ministry annual calendar: https://blog.oriapp.co/youth-ministry-annual-calendar-plan-the-full-year-2026/
- California School of Martial Arts, belt test days: https://calsma.com/belt-test-day-information/
