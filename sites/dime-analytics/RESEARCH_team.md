# The team, the quota, the report upward, and the competition

Research for the five gaps `ANALYSIS_jd_coverage.md` left open: D3 (a rep as data), D8 (District and
Regional Sales Managers), D6 (weekly and monthly), P1, P2 and W7 (commission, quarterly bonus,
quota), and D5 (competition and market trends).

Every non-obvious claim below carries a source URL and the date it was read. Everything was read on
**14 August 2026** unless stated otherwise. No figure is attributed to Main Event or to Dave and
Buster's unless they published it themselves.

---

## 0. What I read in the codebase first, and the two things that changed my recommendations

`src/pages/CoachingPage.tsx` is 1,060 lines and it is better than a gap analysis implies. It carries
a seven step ramp where each step states why it sits at that number, a two column call frame split by
`OccasionClass`, a measurement section that splits coached from managed and enforces it with three
stated rules, and a thirty minute one-to-one agenda where every item links to the route it is run
from and names what a bad answer sounds like. Its figures at lines 419 to 434 and 398 to 403 are
computed live off `PROSPECTS`, `touchesFor(pipeline)` and `BookProvider`. It is not an essay.

Two things I found in the code changed what I would recommend, and both are worth stating before the
research rather than after it.

**One. `src/domain/selectors/daily.ts` has already solved the partial period problem, at the day and
week level, and nobody has noticed.** `isWorkingDay` excludes weekends from the denominator with the
reason written out at lines 94 to 104: "a target that counted Saturday would manufacture two failures
a week out of nothing, which is exactly the mechanic that teaches somebody to ignore the strip".
`TOUCH_TARGET.minDays = 3` refuses to compute an average until there is enough history and returns a
`starting-figure` source with an honest basis sentence instead. `weekReading` forgives one working
day in five. `staleThisMorning` measures the backlog as it stood at `${day}T00:00:00-07:00` rather
than now, so clearing a record does not shrink the denominator underneath the person clearing it.
Every one of those is the correct answer to "a monthly number that looks like a miss on the second of
the month", already written, already argued, at a smaller scale. Section 6 recommends promoting them
rather than inventing a method.

**Two. The loss data says the competition is not the problem, and that is the honest headline of any
competitive surface here.** `src/data/objections.ts` has seven rows. Six are structural: no published
price, no opening date, nothing to tour, no track record, budget is next fiscal, already contracted
elsewhere. Exactly one names a competitor (`we-use-dave-and-busters`) and its own answer says the
instinct to attack the competitor "is a bad idea in general and a strange idea here in particular",
because the two brands have shared a parent since 2022. `src/data/prospectStatus.ts` carries three
losses: Fairway Ford, Sell My Home Real Estate and The Phoenix Club. The Fairway Ford loss is to a
three year hotel contract, recorded in `data/book.ts` on 10 September 2026, not to a bowling
competitor. A competitor register built as the headline of D5 would be leading with the thing that is
not killing deals. Section 5 argues the spine is win and loss.

---

## 1. How venue and hospitality sales teams are actually structured and measured

### The reporting line, confirmed from the employer

The Brea posting itself is the primary source and it is unambiguous in both directions: the role
"will report directly to the General Manager" and is asked to "Partner closely with your District
Sales/Regional Sales Managers". A Dave and Buster's Sales Manager listing repeats the same two
sentences and the same compensation phrases.
([builtin.com/job/sales-manager/4062748](https://builtin.com/job/sales-manager/4062748), read 14
August 2026.)

So the shape is a **matrix, and the application currently models neither arm of it**. Solid line to
the General Manager, who owns the building. Dotted line to a District Sales Manager, who owns the
selling across several buildings and owns nothing inside any of them. That District Sales Manager
role is real and staffed at Dave and Buster's, not a phrase in a template: a public LinkedIn profile
carries the title "District Sales Manager at Dave & Buster's Inc."
([linkedin.com/in/tony-coello-1a9a301a](https://www.linkedin.com/in/tony-coello-1a9a301a/), title
read from search results 14 August 2026; the profile itself was not opened).

The consequence for the build is specific. A General Manager wants the building's numbers. A District
Sales Manager wants **the same numbers in the same shape as four other venues**, and cares most about
the things that are invisible in a revenue total: held dates, commitments made, exceptions needing a
decision. That is why section 4 recommends a printable artefact with fixed fields rather than a
dashboard.

Generic District Sales Manager descriptions are thin but consistent on the verbs: implement strategy
to hit revenue targets, "lead, motivate and manage a team of sales representatives", "provide sales
training and coaching", and "track and report on sales performance, market trends and customer
feedback to upper management"
([careercenter.mafsi.org](https://careercenter.mafsi.org/career/district-sales-manager/job-descriptions),
read 14 August 2026). Note that last clause. It is D5 and D8 in one sentence, and it means the
District Sales Manager is the person the market trend requirement is actually written for.

### The real reporting rhythm

The best documented cadence in this industry is the hotel revenue and sales meeting, and HSMAI
publishes a sample agenda that is more concrete than anything on the sales blogs.

**HSMAI Revenue Management Meeting, sample agenda** (led by the Director of Revenue Management,
twice monthly; attendees include the General Manager, Director of Sales and Marketing, Catering
Director, Business Development Managers, Front Office, Reservations and E-Commerce). The horizons
reviewed are next 7 days, next 30 days, next 90 days, year end, and 24 to 36 months for contracted
commitments. The agenda splits into: **historical** (prior action items, strategy critique,
performance against last year, budget and projection), **future** (group sales strategy, competitive
intelligence from call arounds, reader boards and shopping results, restrictions, high demand date
strategy, what ifs, promotion tracking), **long range** (STR, Demand360, Hotelligence and RateView
competitor reports, quarterly pricing philosophy, trend analysis, catering availability, segment P&L)
and **miscellaneous** (training topics, year to date recap, issues and opportunities).
([academy.hsmai.org sample agenda PDF](https://academy.hsmai.org/wp-content/uploads/sites/11/2018/09/hsmai-revenue-meeting-agenda-sample_dec2016-update.pdf),
read 14 August 2026.)

Three things are worth lifting out of that.

- **The horizons are nested and named.** 7, 30, 90, year end. Not "this month". A venue sells forward,
  so a period report that only describes the period that just ended is describing the least useful
  thing it knows.
- **Competitive intelligence has a fixed slot on a recurring agenda**, and it is gathered by
  call arounds, reader boards and shopping, which are all manual first party methods. Nobody in that
  agenda is looking up a competitor's group rate on a website, because it is not there. Section 5.
- **Prior action items are item one.** The meeting opens by checking what was promised last time.
  That is the carry forward mechanic `/coaching`'s one-to-one is missing.

The weekly layer is the pipeline and pace review. Group pace is defined as group revenue currently on
the books for a future date range compared against the same point in a prior period, typically the
same week last year, or against a pace target built into the budget, and it is expressed as a
percentage above or below prior year: "+12% pace means group is tracking 12 points ahead". The
recommendation is that it is reviewed jointly in a weekly revenue strategy meeting with both the
sales director and the revenue manager present, "where it becomes an action trigger rather than a
reporting artifact".
([m1intel.com/blog/hotel-group-pace-revenue-management](https://m1intel.com/blog/hotel-group-pace-revenue-management),
read 14 August 2026.)

The forecast layer is monthly or bi-weekly and is built on leads by stage with win probability, by
market segment, with weighted revenue estimates, confidence scores and pace comparisons against prior
years or quarters. Event Temple specifically warns against "not factoring in tentative business or
lost leads that could have been won with better follow-up".
([eventtemple.com hotel sales forecasting](https://www.eventtemple.com/blog/hotel-sales-forecasting-strategies-tools-to-maximize-accuracy),
read 14 August 2026.)

**The rhythm, then, in the form this venue could run it:**

| Cadence | Who | What is on it |
| --- | --- | --- |
| Daily | The seat, alone | The three rings. Already built. |
| Weekly, 30 min per seat | Sales Manager with each seat | The one-to-one agenda already in `/coaching`, plus last week's carry forward and one scored call. |
| Weekly, one page | Sales Manager to District Sales Manager | The two ledgers, board movement, held dates with release dates, losses with reasons, exceptions needing a decision. Section 4. |
| Monthly or per period | Sales Manager, General Manager, District Sales Manager | Pace against the previous period, attainment against quota, coverage of the in-window population, ramp state of each seat, win and loss distribution, commitments outstanding. |
| Quarterly | District Sales Manager and above | Bonus determination, quota reset, competitive set review, ramp curve versus actual. |

The pre-opening venue breaks one of these and it is worth naming rather than papering over: **there
is no "same week last year"**. Every pace figure in the hospitality literature is defined against a
prior year the building does not have. Section 6 says what to do instead, and the answer is not to
draw a straight line.

---

## 2. Quota, commission and the quarterly bonus

### What Main Event and Dave and Buster's actually publish

Two phrases, and that is the complete set. "Competitive salary + sales commission potential" and
"Quarterly bonus program", with a base band of **$75,662.29 to $89,014.40**, all from the posting
itself and repeated in a parallel Dave and Buster's listing
([builtin.com/job/sales-manager/4062748](https://builtin.com/job/sales-manager/4062748), read 14
August 2026).

**No commission rate, no bonus mechanic, no quota, no threshold and no accelerator is published by
either company anywhere I could find.** Glassdoor and Comparably carry self reported total
compensation aggregates for Dave and Buster's Event Sales Manager and Sales Manager roles, but they
report pay levels, not plan design, and they are unverifiable individual submissions. Nothing in this
application may cite them as a plan. **Any arithmetic below is this application's own proposal and
must be badged exactly as `illustrative` in the same way the league fee and the response commitment
already are.**

### What the industry benchmark actually is, and this is the useful find

HSMAI publishes a special report on hotel management company sales incentive plans with real
distributional data. The figures below are quoted from it.
([HSMAI Special Report, Hotel Management Company Sales Incentive Plans](https://global.hsmai.org/wp-content/uploads/2019/09/HSMAI-Special-Report_HMC-Sales-Incentive-Plans.pdf),
read 14 August 2026.)

- **Payout frequency: quarterly is the norm.** 79% of Sales Managers and 68% of Directors of Sales are
  paid quarterly. Quarterly payments tend to be based on revenue metrics; annual payments tend to be
  based on GOP or guest satisfaction. **The Brea posting's "quarterly bonus program" is therefore not
  a perk, it is the standard structure of the job**, which is a useful thing to be able to say.
- **Thresholds cluster at 95% to 100% of goal.** Below the threshold, nothing pays.
- **Caps run from 100% to 140% of goal attainment.** 84% of Sales Manager plans and 88% of Director
  plans have a cap.
- **Maximum incentive has converged at 30% of base salary** for both roles, with a range of 10% to 50%
  and an average of 30%.
- **Three or fewer metrics** in the majority of plans, and 97% of companies use goal based structures.
- **66% of Sales Manager plans pay on individual contribution revenue** (versus 81% of Director plans
  paying on total hotel contribution). Sales Managers are measured individually far more often than
  Directors are.

For the catering and restaurant end of the same market, the commonly cited shape is **75% base and
25% commission**, with a new catering sales professional taking **60 to 90 days to start delivering
results**
([ezcater.com](https://www.ezcater.com/lunchrush/restaurant/off-premises-how-to-build-sales-team-catering/),
read 14 August 2026). That is a looser source than HSMAI and I would weight it accordingly, but the
ramp figure agrees with the sales onboarding literature in section 3.

### What a realistic attainment curve looks like

The best public dataset on actual attainment across many plans reports, for December 2025: **median
attainment 74.3%, mean 81.5%, 90th percentile 139.0%, 31.3% of reps below 50% of quota, and 28.7% of
observations at or above 100%.** In roughly 45% of plan years observed, the entire enrolled
population fell short of target.
([blog.salescookie.com, quota attainment from 1000+ commission plans](https://blog.salescookie.com/2026/06/08/quota-attainment-real-data-from-1000-commission-plans/),
read 14 August 2026.)

Two implications, and the second one matters more than the first.

First, **a plan whose threshold sits at 95% of quota pays nothing to the median performer.** Combine
the HSMAI threshold band with that attainment distribution and most sellers on most plans earn zero
bonus. That is a defensible design when quotas are set from a long history. It is an indefensible
design at a venue that has never opened, because the quota itself would be a guess, and the person
being asked to carry it is described in the posting's own words as "driven by your bonus".

Second, **a quarterly cadence on a lumpy event book amplifies the problem.** One 300 guest booking
slipping from the last week of a quarter into the first week of the next moves attainment across the
threshold in both quarters at once. Any plan for this venue needs either a lower threshold or a
carry forward, and I recommend the lower threshold because carry forward is unauditable in a
prototype.

### Revenue or event count

The venue metrics literature names both and treats them as complements: revenue per event and total
event revenue as the pricing power reading, booking pace and lead time, inquiry to booking conversion
and individual salesperson performance, average spend per guest, and average event size
([tripleseat.com benchmarking](https://tripleseat.com/blog/benchmarking-understanding-the-power-of-event-data-to-impact-growth/),
read 14 August 2026; the article names the metrics but publishes no benchmark numbers, which is worth
saying because it is typical of this space).

The failure modes are symmetrical and both are real. **Revenue alone rewards chasing one whale** and
leaves forty schools untouched inside their buying windows, which is the exact behaviour
`CoachingPage.tsx` already argues against at lines 405 to 434. **Event count alone rewards splitting**,
and this application has a live example of how: the Heights Christian contract is a Play It Forward
voucher block of 60 guests at $19.95, and there is nothing to stop a person booking it as three
blocks of twenty.

So: quota on collected contract value, with a **floor on event count** as a gate rather than as a
second scored metric. Two metrics, inside HSMAI's "three or fewer".

---

## 3. Ramping and coaching a rep, as data

### The standard ramp curve, and why this venue's is different

The 30/60/90 convention: day 30 is competence (articulate the value proposition, describe the target
customer, navigate the CRM), days 31 to 60 carry weekly activity quotas and **25% to 50% of full ramp
quota**, days 61 to 90 carry **75% to 100% of standard quota** with the rep running the full cycle
independently. Leading indicators recommended over closed revenue during ramp: calls made, meetings
booked, pipeline generated, call quality scores, CRM usage
([hyperbound.ai 30/60/90 ramp plan](https://www.hyperbound.ai/blog/30-60-90-day-ramp-plan), read 14
August 2026). ezCater's 60 to 90 days to first results agrees.

`/coaching`'s ramp is **two weeks, not ninety days**, and that is correct rather than a shortfall. It
is a competence ramp for a territory of 102 organisations and 18 packages, not a productivity ramp
for an enterprise patch. The two are different objects and conflating them is why most ramp plans
fail: a person signed off as competent on day 14 is not expected to be productive on day 14.
**Recommendation: keep the two week ramp exactly as it is and add a separate ninety day productivity
curve expressed in the leading indicator**, because there is no revenue quota to express it in before
the doors open.

### What a manager needs on top of `/coaching` to run a person rather than describe a method

This is the specific answer to the brief's question, and there are six items. The first two are the
ones that convert prose into a system.

**1. A clock on the ramp.** The seven steps have `when` strings ("Day one", "Week two") and no start
date, so the application cannot say "this seat is on day 12 and has not been signed off on step 5".
A ramp without a clock is a curriculum. Give the seat a `startedOn` and derive `rampDay` against the
injected clock, exactly as `stalenessOf` already derives days quiet in `selectors/record.ts`.

**2. Sign off, and one real permission derived from it.** Step 5 of the ramp is explicitly gated in
its own `when` field: "Week one, and specifically before anybody is allowed to hold a date", and its
`why` says a held date that cannot be delivered "becomes a refund, an apology from a general manager,
and a school that tells every other school in the district". That gate is stated in prose and
enforced nowhere. **Make it real: a seat not signed off on step 5 cannot set a status to `soft-hold`.**
That single change turns the training page into a control, and it is the most impressive item on this
list per line of code, because it is the difference between a manager who wrote a curriculum and a
manager who wired it into the tool.

**3. A record of the one-to-one, with carry forward.** The agenda exists; the artefact does not. HSMAI's
own meeting agenda opens with prior action items for exactly this reason. Each one-to-one needs a
date, a seat, and one commitment carried into the next, so the meeting opens with "you said you would
be in the Kraemer Boulevard lobby at noon on Tuesday" rather than with "how was the week". Without
carry forward, a weekly one-to-one is five separate conversations.

**4. A call scorecard, and a deliberately small one.** The benchmark rubrics are weighted and long:
opening and qualification 15%, value communication 25%, objection handling 30%, closing 25%, process
adherence 5%, with a recommended 4 to 6 week pilot before rollout
([muchbetter.ai 25 point rubric](https://muchbetter.ai/blog/sales-call-coaching-scorecard-a-25-point-rubric-for-managers),
read 14 August 2026). **I would reject that shape here and say why in the page.** Weighted rubrics
assume call recording, a QA function and volume; this floor has one manager, a phone and no recording
stack. The `CallFrame` interface already publishes the rubric in a usable form: five fields, both
columns. Score five binaries in ninety seconds while listening.

  - Did they run the frame for the right `OccasionClass`?
  - Did they open with the frame's question, or a real version of it?
  - Did they name what they are competing against, out loud, to themselves?
  - Did the call end with a date in writing that day, which both frames require?
  - Did they avoid the named `failure` mode for that column?

  Five yes or no answers derived from a page that already exists, with no new vocabulary.

**5. A second leading indicator, and not 3x pipeline coverage.** The application already has the best
one, at `CoachingPage.tsx` lines 419 to 434: calendar-locked organisations touched inside their
buying window, over the count whose window is open. Its denominator is set by other organisations'
calendars, so it cannot be inflated by working the easy names, and that property is rare and worth
protecting. For a second, the temptation is pipeline coverage at 3x. The standard critique is that 3x
ignores stage and quality, applies a blanket 33% weighting rather than per opportunity probability,
and invites "waterlogging", where sellers stuff the pipeline with dormant deals to hit the coverage
number
([gspsolutions.com](https://gspsolutions.com/3x-pipeline-coverage/), read 14 August 2026). The
honest local version: count organisations at `conversation` or `soft-hold` whose buying window opens
inside the horizon, against contracts needed. And state plainly that **a board with three closed
losses and two wins has no win rate**, so any coverage multiple here is a guess until roughly the
tenth closed decision.

**6. A ramp expectation curve in the leading indicator.** 40% of the window coverage target in month
one, 70% in month two, 100% from month three. Badged as this application's proposal, shaped after the
25 to 50 and 75 to 100 convention, expressed in the unit that exists before the venue opens.

---

## 4. The reporting pack that goes up the line

D8 is currently zero and it is the cheapest genuine gap on the list, because every figure already
exists. What is missing is a shape and an addressee.

**Format argument first.** Make it printable, one page, in the same shape as `/book/week`, and
addressed upward. The point of D8 is that this is a document a District Sales Manager reads, often on
a phone between two venues, and often at the same time as four other venues' versions of it. A
dashboard they must log into and configure is a worse artefact than a page they can print, and the
application already has `styles/print.css` and the week sheet to model it on. The differentiator no
competitor product has is that every figure on it can carry its provenance badge, so the District
Sales Manager can see at a glance which numbers are published, which are modelled and which rest on a
price a person typed.

### The weekly page, field by field

1. **Header block.** Venue, period id and weeks to open, week commencing, the seat that wrote it, and
   the as-of timestamp. The weeks to open figure is the single most important piece of context for a
   reader comparing five venues, four of which are open.
2. **The two ledgers, side by side, never summed.** Booked revenue: contracts, guests, contract value,
   deposits collected, and the share of contract value resting on a price a person typed
   (`userPricedRevenue / revenue`, already computed in `BookProvider`). Outbound activity: shifts
   planned, hours, hours outside the building, hours completed. The ratio `hoursPerThousandBooked` is
   the only place they touch and it goes at the foot with its existing caveat.
3. **Board movement in the week.** Counts by `PitchStatus` at the start and at the end, with the net.
   This is the only trend the application can honestly carry today, because it is a delta between two
   observed states rather than a fitted line, and it answers D5's "monitor key performance metrics"
   without pretending to a time series.
4. **Held dates with nothing signed, each with its release date.** This is the field a District Sales
   Manager needs most and the one that is invisible in every revenue total. A hold is inventory taken
   off the market by our own side. `/coaching`'s one-to-one already asks the question ("Which dates are
   we holding that nobody has signed, and what is the release date on each one?") and there is
   nowhere for the answer to go upward. The `first-fifty` offer in `data/venue.ts` makes this the
   venue's principal pre-opening currency, so the outstanding balance of it is a real liability.
5. **Losses in the week.** Organisation, lane, the objection id that killed it, whether a competitor
   was named by the buyer, and the month named inside the refusal. Three rows exist today. Event
   Temple's warning about not tracking lost leads is exactly this field.
6. **Inbound requests outstanding**, with the response commitment against each and whether it was met.
7. **Commitments the district inherits.** Rate locks agreed (`midweek-daytime-lock` is a rate honoured
   for a year), holds without deposits, Spirit Night nights promised. These are obligations made at
   venue level that outlive the person who made them, and a District Sales Manager who discovers one
   at handover has been badly served.
8. **Competitive intelligence heard this week**, structured: competitor, what was heard, where it was
   heard, and whether it is published and checkable or reported by a buyer. Section 5.
9. **Exceptions, and the decision wanted.** Named, with the decision being asked for and the date it is
   wanted by. This is the actual purpose of D8. A weekly report with no ask in it is a status update,
   and a District Sales Manager receiving five of those a week reads none of them.
10. **One line: what changed that the district did not already know.**

### What the monthly or per period version adds

- **Pace against the previous period**, per lane, with the explicit note that there is no prior year to
  pace against and therefore no year over year figure. Section 6.
- **Attainment to date against quota**, with the pro rata mark labelled as a straight line rather than
  as a target, and the required run rate for the remaining working days. Never a projected finish.
- **Coverage of the calendar-locked in-window population**, per seat and for the team, because this is
  the gate the quarterly bonus turns on and it should never be a surprise at quarter end.
- **Ramp state of each seat**: day number, steps signed off, steps outstanding, and any permission
  currently withheld.
- **Closed decision distribution**: won, lost, and the reason distribution over the objection register.
  With five closed decisions today, the honest rendering is the five rows and an explicit sentence
  that no rate can be computed from them.
- **The competitive set review**, quarterly rather than monthly, per section 5.

---

## 5. Competitive tracking for a venue

### The finding that decides the whole design: nobody publishes a group price

This is checkable and I checked it across the category on 14 August 2026.

- **Main Event.** 14 of 18 packages in `data/packages.ts` are gated behind "contact the local sales
  manager", already recorded in the codebase with its source.
- **Lucky Strike Fullerton**, 1501 S. Lemon St, Fullerton CA 92832, **40 lanes**. Publishes four event
  package families (Kids Party, Teen Party, Adult Social Event, Corporate Events and Team Builders)
  and **no per person group price**, routing to "Contact an Event Planner" and an RFP form.
  ([luckystrikeent.com/location/lucky-strike-fullerton](https://www.luckystrikeent.com/location/lucky-strike-fullerton),
  read 14 August 2026. Note the old `bowlero.com/location/bowlero-fullerton` URL now 302s to the
  Lucky Strike host, which is itself a checkable rebranding fact.)
- **Lucky Strike Orange**, 20 City Blvd West Ste G-2, Orange CA 92868, **24 lanes**. Same four package
  families, same absence of a group price, same routing.
  ([luckystrikeent.com/location/lucky-strike-orange](https://www.luckystrikeent.com/location/lucky-strike-orange),
  read 14 August 2026.)
- **Round1.** Publishes the inclusion list for its All Inclusive Party Package (arcade time play,
  bowling and shoe rental, karaoke or party room, billiards and ping pong, pizza and soda, group
  photo, VIP immersive lane add on at select locations for an additional fee) and **no price**,
  routing to a booking form.
  ([round1usa.com/book-a-party](https://www.round1usa.com/book-a-party), read 14 August 2026.)

**Therefore rate shopping the group segment is fantasy, and any competitive surface built on rate
comparison would be built on numbers nobody can source.** The hotel practice of shopping the comp set
works because transient rates are published daily; for *group* business even hotels resort to call
arounds, reader boards and paid intelligence products, which is precisely what the HSMAI agenda lists
and what Knowland sells. Knowland's own guidance is about "looking at accounts that are meeting at
competing hotels and reaching out"
([knowland.com](https://www.knowland.com/2024/01/playing-to-win-in-group-sales-what-can-we-do/), read
14 August 2026), which is account level intelligence bought from a vendor, not a price scraped from a
page. No equivalent product exists for family entertainment centre parties in a four mile trade area,
and pretending otherwise in a work sample would be inventing a data source.

### What is honest and doable

Published and checkable, therefore admissible with a URL and a date read:

- **Addresses, lane counts and attractions.** Lucky Strike Fullerton's 40 lanes against Main Event
  Brea's published floor of "more than 26" is a real competitive fact with a direct consequence for a
  300 guest booking, which at Main Event's published one lane per twenty guests consumes 15 lanes.
  The register should carry it rather than hide it.
- **Retail and walk in pricing, which they do publish in detail.** Lucky Strike Orange publishes
  "Bowl unlimited games for just $24.99 per person, shoes included" Sunday to Thursday 6 to 7pm,
  "Unlimited bowling, shoes included, for only $22.99" Saturday and Sunday 11am to 3pm, and buy two
  games get the third half off, daily, walk ins only (read 14 August 2026). This is not group pricing
  but it is the price anchor a buyer arrives with, and it is the only number in the category anyone
  can quote.
- **Dated promotions.** Lucky Strike is running "Use code PARTY15 for 15% off parties & events", valid
  through 8/31 for events held by 9/30, published on both the Fullerton and Orange location pages
  (read 14 August 2026). A dated, published, expiring competitor promotion aimed squarely at the
  event segment is the single most useful competitive row available, and it is completely honest.
- **Openings, closings and rebrandings.** The Bowlero to Lucky Strike rename is visible in a live 302.
  These come from press and permits and are checkable.
- **Comp set boundary discipline.** Cvent's criteria are proximity, similar size, similar amenities,
  similar pricing, same segment
  ([cvent.com comp set guide](https://www.cvent.com/en/blog/hospitality/comp-set), read 14 August
  2026). Applied here, **Round1 is a category competitor and not a trade area one**: its California
  locations are Burbank, City of Industry, Concord, Hayward, Lakewood, Mission Viejo, Moreno Valley,
  National City, Roseville, Salinas, San Francisco, San Jose, Santa Ana and Temecula, with Palmdale,
  Escondido and Ventura coming soon, and **there is none in Brea or at Brea Mall**
  ([round1usa.com/locations](https://www.round1usa.com/locations), read 14 August 2026). That
  independently vindicates the `EXCLUDED_FROM_BOARD` decision recorded in `prospects.ts` and
  `MethodPage.tsx`, and it is worth saying on the page, because getting a comp set boundary right is
  the discipline itself.

### What is fantasy, and should be named as such on the page

- **Share of local group business.** No data source exists for FEC party bookings in a four mile trade
  area. Knowland covers hotel meetings. A share figure here would be invented.
- **Competitor booking pace or competitor win rates.** Not obtainable by any honest means.
- **Competitor group pricing.** Established above.
- **A "market trend" time series.** The application has no history and neither does the building. The
  honest substitute is period over period movement in the board's own status distribution, which is
  observed rather than fitted.

### Why win and loss is the spine

The only competitive fact this venue can obtain reliably and first hand is **the reason a specific
buyer chose somebody else**, and it arrives free with every loss. The machinery is already half
built: `ObjectionDisposition` in `data/objections.ts` carries `lost-to-it` with the comment "a
register that only logs wins teaches nothing", `state/ObjectionProvider.tsx` already lets a session
set it and counts by disposition, and `ReplyDisposition` in `domain/vocabulary.ts` already carries
`no` alongside `not-now` and `wrong-person`.

The best practice literature is clear on the two things that make win and loss honest, and both cut
against the easy implementation. **The reason should not be collected by the person who lost the
deal**, because sales introduces bias when leading the interview, and it should be collected **within
three months**, because after that the memory of the evaluation is overwritten
([pragmaticinstitute.com, eight win loss best practices](https://www.pragmaticinstitute.com/resources/articles/product/eight-win-loss-analysis-best-practices/),
read 14 August 2026). In a venue with one manager and two seats, an independent interviewer is not
available, and the honest response is not to pretend otherwise: **record who reported the reason on
the row**, and let the surface distinguish a reason the buyer wrote down in an email from a reason
the seat inferred. The application already makes exactly this distinction everywhere else through
`signalSource` and `provenance`, so it is a port rather than a design.

And the finding this surface produces today is not flattering, which is why it is worth building. Six
of seven objections are structural and one is competitive, and its own recommended answer is not to
compete on brand at all. **The honest headline is that this venue loses to structure and to
incumbency, not to a competitor's price**, and a sales manager who can show that with the rows behind
it is making a much better argument than one who produces a competitor grid.

---

## 6. Daily, weekly, monthly, and the honest partial period

The brief's framing is correct and it is the design risk: a monthly number that reads as a miss on
the second of the month is how a tool loses a person's trust, and once lost it is not recovered by a
tooltip.

The run rate literature is blunt about why extrapolation fails: it ignores seasonal variation, it is
trivially manipulated by choosing a favourable partial period, it is "based on incomplete data", and
it "lacks credibility under scrutiny" because experts know how deceiving it is
([leadgibbon.com](https://www.leadgibbon.com/blog/run-rate/), read 14 August 2026). The hospitality
answer to the same problem is pace, which compares like for like against the same point in a prior
period rather than against a fraction of a target (M1 Intel, above).

### The rule that makes it work here, and it falls straight out of the two ledger discipline

**Pro rata the leading ledger. Pace the lagging one. Never pro rata a contract figure.**

Touches, hours outside the building and window coverage genuinely are meant to be uniform across
working days, so a straight line across elapsed working days is an honest expectation and a
shortfall against it is real information a person can act on this afternoon. Contract value is not
uniform and never will be: a December holiday party book and a June grad night book are lumpy by
construction, and drawing a straight line through a quarter's revenue target produces a red number in
week one of every quarter, forever. That is a two ledger rule, it is consistent with the three rules
already printed on `/coaching`, and it is the recommendation.

### The five mechanics, four of which already exist in `daily.ts`

1. **Elapsed working days, never calendar days.** `isWorkingDay` already exists and already carries the
   argument. On the 3rd of a month with 22 working days, the mark sits at 2/22, and on the 2nd of a
   month that opened on a Saturday the mark is still at zero, which is correct.
2. **Three numbers, never one.** Done, the straight line mark, and the full period target. The mark is
   labelled "where a straight line would put you today", not "target", and it is drawn as a tick on a
   bar rather than as a percentage in a warning colour. The colour rule already in force (colour is
   never the sole carrier) does the rest.
3. **Suppress any projection until there is enough period to project from.** `TOUCH_TARGET.minDays = 3`
   already implements exactly this idea for the daily target, returning a `starting-figure` source and
   the basis sentence "There is no history to average yet". Apply the same guard upward: no run rate
   and no projected finish until the later of 5 elapsed working days or 25% of the period, and until
   then print the sentence instead of the number. A tool that says "too early to say" on the second
   of the month earns more trust than any figure it could have shown.
4. **Express the gap as a required run rate, not as a projected miss.** "6 organisations a working day
   for the remaining 13 days" is true and actionable. "Projected to finish at 61% of goal" is a
   prediction wearing the clothes of a fact, and it is the specific number that costs a tool its
   reader.
5. **For revenue, refuse to compute rather than compute something misleading.** Pace requires a prior
   period. Where the previous four week period in `data/venue.ts` exists, pace against the equivalent
   elapsed working day of it and state the comparison in words. Where it does not, which is true of
   `t-minus-16`, print "no prior period to pace against" and show the absolute figure alone. This is
   the one place I would have the application decline, and declining is the strongest available
   demonstration that the rest of its numbers are trustworthy.

### The quarter

`P2` needs a quarter and `PERIODS` has none: the four periods are four week pre-opening bands. Do not
add a fifth period type. **Derive the quarter as a grouping over the existing periods** so nothing in
the period model changes: four consecutive four week periods are sixteen weeks, and the four periods
in `venue.ts` span 17 August to 6 December 2026, which is one bonus quarter of pre-opening work with
its boundaries already in the data. Say so on the page. A quarter that is a derived grouping cannot
disagree with the period selector, and a quarter that is a fifth enum value eventually will.

---

## 7. The honest constraint: a team screen with no people in it

The venue has not opened, there is no team, the codebase has no human names anywhere, and the leagues
use handles. So the team surface has to work with roles.

**The strongest move available is to make two of the three seats OPEN.** A team screen whose rows read
"Sales Manager, filled, day 1 of ramp, carries all 102 organisations" and "Event Sales Representative,
seat 2, open, not yet hired, here is the ramp that starts on their first day, here is the goal they
carry from week nine, here is the slice of the board that moves to them" is **completely true on the
day it is built**, requires no invented person, and is a better answer to D3 than a fake roster would
be. It also demonstrates the thing the posting is actually asking for, which is not "manage three
people" but "build a team", and building starts before anyone is hired.

The titles must come from published sources, exactly as buyer titles do. `prospects.ts` only carries
`decisionMakerTitle` values found on published staff directories; team seat titles should carry only
titles found on published Dave and Buster's or Main Event job listings. "Sales Manager" and "General
Manager" are in the Brea posting itself. "District Sales Manager" and "Regional Sales Manager" are in
the Brea posting's D8. "Event Sales Manager" appears as a listed Dave and Buster's title. That is
enough vocabulary and it means no title is invented either.

Any quota, rate, threshold or accelerator carries the `illustrative` badge and a sentence naming it
as this application's proposal, in the same words the league fee already uses in `data/cup.ts` line
137: "The venue's own, invented for this prototype, and not a claim about how Main Event operates."

---

## Recommendations

### 1. The quota and bonus model, and its arithmetic

**Express the whole plan as percentages of base salary, and let the reader pick a point inside the
published band.** The band is sourced ($75,662.29 to $89,014.40, from the posting). The percentages
are this application's proposal, badged, with the HSMAI benchmark printed beside each one. Nothing is
hardcoded that cannot be sourced, and the arithmetic below is base independent, which is the point.

**Two components, two metrics, inside HSMAI's "three or fewer".**

**Component A, commission. 2.0% of collected contract value, from the first dollar, no threshold.**
Paid on the deposit landing, not on the signature. Three arguments. `BookProvider.revenueTotals`
already distinguishes `revenue` from `deposits` at each line's own percentage, so the mechanic is
free. A signature with no deposit is not cash and paying on it rewards signing a soft hold. And a
threshold on commission means the person who books the first two contracts in an unopened trade area
is paid nothing for the two hardest sales the building will ever make, which is precisely backwards.
This is a deliberate departure from the 97% of plans that are goal based; the bonus carries all the
gating instead.

**Component B, the quarterly bonus.** Quarterly, per HSMAI's 79%. Two gates.

- **Gate one, entry, on the leading indicator.** 80% of calendar-locked organisations whose buying
  window opened during the quarter must have been touched inside it. This is the figure
  `CoachingPage.tsx` already computes at lines 419 to 434. Fail this gate and the bonus is zero
  regardless of revenue. Reason: its denominator is set by other organisations' calendars, so it
  cannot be gamed, and it is the only mechanic that stops one whale being booked while forty schools
  go untouched into their windows and the list is burned for a year.
- **Gate two, the payout curve on collected contract value against quota.** Nothing below **90%**.
  At 90% the bonus pays **50% of target**. Linear to **100% of target at 100% attainment**. Then an
  accelerator of **1.5x on every point above 100%**, capped at **140% attainment**.

**The plan levels.** Target variable at 100% attainment is **20% of base**, split 10% commission and
10% bonus. Cap is **30% of base**, which is exactly HSMAI's converged maximum.

Check the arithmetic, and note it holds at any base inside the band:

| Attainment | Commission | Bonus | Total variable |
| --- | --- | --- | --- |
| 50% | 5% of base | zero | **5% of base** |
| 90%, threshold | 9% of base | 5% of base | **14% of base** |
| 100%, plan | 10% of base | 10% of base | **20% of base** |
| 120% | 12% of base | 13% of base | **25% of base** |
| 140%, cap | 14% of base | 16% of base | **30% of base** |

At the cap: commission scales linearly, so 1.4 x 10% = 14%. Bonus is 100% + (40 x 1.5) = 160% of
target, so 1.6 x 10% = 16%. Total 30% of base, landing exactly on the HSMAI benchmark. That is why
the accelerator is 1.5 and not 2.

**The quota is not invented, it is implied, and the page shows the implication.** Fix the rate at 2%
and the commission at plan at 10% of base, and the quarterly quota falls out:

> quarterly quota = (10% of base / 4) / 2%

At the band midpoint of about $82,338, that is ($8,233.80 / 4) / 0.02 = **$102,922.50 of collected
contract value per quarter**, or about $411,690 a year. Render it as a derived figure with the
formula printed beside it, so a General Manager can argue with the rate rather than with a number
that arrived from nowhere. This inversion is the single best honesty move in the whole plan: **the
application never asserts a quota, it asserts a rate and shows what quota that rate implies.**

**The event count floor**, as a gate and not a scored metric: no bonus in a quarter with fewer than
eight contracts, whatever the revenue. Reason given above, with the Heights Christian voucher block
as the worked example of what splitting looks like.

**The threshold is 90%, not HSMAI's 95% to 100%, and the page says so and says why.** With median
attainment at 74.3% and 31.3% of sellers below half of quota, a 95% threshold is a bonus designed not
to pay. On a quota nobody has a history to set, on a book lumpy enough that one 300 guest party moves
a quarter, against a posting that says in its own words "you like to surpass targets and are driven
by your bonus", a threshold the median performer cannot reach is a plan that produces the opposite of
what it was written for. Naming the departure and its reason is stronger than quietly copying the
benchmark.

**Pre-opening quarters are different and must be, and this is where the model earns its keep.** There
is no revenue quota before there is a venue, and `/coaching`'s own "What this meeting is not" box
already argues that asking for a number twelve weeks before a building opens produces a figure that
is "wrong in whichever direction makes the next twenty minutes more comfortable". So in any quarter
ending before the published opening date, the quarterly bonus pays on **the two leading gates only**,
half each, all or nothing: window coverage at 80%, and hours outside the building at or above the
planned share. Commission runs normally on anything that signs. This is the one place the plan pays
for activity rather than revenue, the page should say so out loud, and the reason is that the
alternative is a person carrying a zero bonus for four consecutive quarters, which is how you lose
the person the posting describes.

### 2. The fields on the district report

Build `/book/district` as a child of the book, exactly as `/book/week` already is, printable, one
page, addressed upward. Weekly fields, in order: header with weeks to open and as-of stamp; the two
ledgers side by side and never summed, with the typed price share; board movement as a start and end
delta by `PitchStatus`; **held dates with nothing signed, each with its release date**; losses with
their objection id and whether a competitor was named; inbound requests outstanding against the
response commitment; **commitments the district inherits** (rate locks, holds, Spirit Nights);
competitive intelligence heard, structured; **exceptions with the decision wanted and the date wanted
by**; and one line on what changed.

Monthly adds pace against the previous period, attainment with the straight line mark and the required
run rate, window coverage per seat, ramp state per seat, and the closed decision distribution with an
explicit sentence that five decisions do not make a rate.

The argument for the two unusual fields. **Held dates** because a hold is inventory removed from sale
by our own side, it is invisible in every revenue total, `first-fifty` makes it this venue's principal
currency, and a District Sales Manager who finds out about it at handover has been failed. **Exceptions
with a decision wanted** because a weekly report with no ask in it is a status update, and a District
Sales Manager reading five status updates a week reads none of them. That field is the difference
between partnering with a District Sales Manager and reporting to one, and D8 uses the word "partner".

### 3. The shape of a rep record, given that no rep has a name

A **seat**, not a person. Stored fields, deliberately few:

- `id`, a slug such as `seat-1`.
- `title`, drawn only from a published Main Event or Dave and Buster's job listing, cited, exactly as
  `decisionMakerTitle` is drawn only from published staff directories.
- `seatNumber`, an ordinal, so two identical titles are distinguishable without a name.
- `state`: `filled`, `ramping` or `open`. **Seat 1 filled, seats 2 and 3 open.**
- `startedOn`, null when open, which drives the ramp clock.
- `lanes`, which of the nine `Lane` values this seat carries. Territory by lane, not by geography,
  because the trade area is four miles across and the whole model is lanes.
- `rampSignoffs`, a list of ramp step ids with dates.

No name, no initials, no avatar, no photograph. Everything else is **derived**, which is the
codebase's existing rule: the seat's slice of the 102 from its lanes, its window coverage from
`PROSPECTS` and `touchesFor`, its outside hours from activity. Promote `ActivityLine.ownerRole`
(currently a string, commented "A role, never a person", set to "Sales Manager" on every seed row) to
a `seatId` and keep the comment. Add the same field to the status row. Every per seat figure in the
application then exists for free and the team roll up is a group by.

**Individual and team goals, per D3's own words.** The individual goal is the leading indicator until
the venue opens and collected contract value after. **The team goal is the sum of the leading
indicators and is never a sum of dollars**, which is `/coaching`'s rule one applied upward, and which
is legitimately a team goal rather than an arithmetic convenience: coverage of the in-window
population has a shared denominator, so two seats covering 80% of it between them is an outcome
neither owns alone.

And wire one permission to the ramp: **a seat not signed off on ramp step 5 cannot set a status to
`soft-hold`**. That is the recommendation on this list with the highest ratio of argument to code.

### 4. The pro rata method for a period in progress

**Pro rata the leading ledger across elapsed working days. Pace the lagging ledger against the
previous period. Never pro rata a contract figure.**

Concretely: reuse `isWorkingDay`; show done, the straight line mark and the full period target
together and label the mark as a straight line rather than as a target; suppress every projection
until the later of 5 elapsed working days or 25% of the period, printing the sentence instead, on the
same principle `TOUCH_TARGET.minDays` already establishes; express any gap as a required run rate over
remaining working days and never as a projected finish; and where there is no prior period to pace
revenue against, print "no prior period to pace against" and show the absolute figure alone. Add the
quarter as a derived grouping over the four existing periods rather than as a fifth period type.

The argument for the split: touches are meant to be uniform across working days and contracts are
not, so a straight line is honest information in one ledger and manufactured failure in the other.
This is the two ledger discipline extended into time, which means it needs no new vocabulary and can
be defended in one sentence in an interview.

### 5. The spine of the competitive surface

**Win and loss, with a thin competitor register attached, and the fantasy items named on the page.**

The spine is the loss row: organisation, lane, the objection id that killed it, whether a competitor
was named **by the buyer**, who reported the reason, and the month named inside the refusal.
`ObjectionDisposition` already has `lost-to-it`, `ObjectionProvider` already sets and counts it, and
`provenance` and `signalSource` already exist to distinguish a reason a buyer wrote down from a reason
a seat inferred, which is the specific bias the win and loss literature warns about and which a venue
with one manager cannot solve with an independent interviewer.

Attached to it, a **competitor register restricted to published facts with a URL and a date read**,
which is the application's existing provenance rule applied to a new entity: Lucky Strike Fullerton
(40 lanes, 1501 S. Lemon St), Lucky Strike Orange (24 lanes, 20 City Blvd West), their four published
event package families with no group price, their published walk in prices, and their dated PARTY15
promotion. Plus Round1 as a **category** competitor explicitly excluded from the trade area set, with
the locations list as the evidence, which vindicates and extends the `EXCLUDED_FROM_BOARD` reasoning
already in the codebase.

And promote the week sheet's write in line, "Anything heard about a competitor or a date", into a
structured capture on the record, so intelligence gathered at a door lands somewhere with its source
attached instead of on a piece of paper.

State the fantasies on the page and refuse them: share of local group business, competitor pace,
competitor win rates, competitor group pricing, and any market trend time series. Then state the
finding the surface actually produces today, which is that six of seven objections are structural,
one is competitive, and its own answer says not to compete on it. **This venue is losing to structure
and to incumbency, not to a competitor's price**, and being able to show that with the rows behind it
is a better competitive argument than any grid.

---

## Sources

All read 14 August 2026.

- [builtin.com, Sales Manager, Dave & Buster's](https://builtin.com/job/sales-manager/4062748)
- [HSMAI, Hotel Management Company Sales Incentive Plans, special report (PDF)](https://global.hsmai.org/wp-content/uploads/2019/09/HSMAI-Special-Report_HMC-Sales-Incentive-Plans.pdf)
- [HSMAI Academy, revenue management meeting sample agenda (PDF)](https://academy.hsmai.org/wp-content/uploads/sites/11/2018/09/hsmai-revenue-meeting-agenda-sample_dec2016-update.pdf)
- [Sales Cookie, quota attainment from 1000+ commission plans](https://blog.salescookie.com/2026/06/08/quota-attainment-real-data-from-1000-commission-plans/)
- [M1 Intel, hotel group pace](https://m1intel.com/blog/hotel-group-pace-revenue-management)
- [Event Temple, hotel sales forecasting](https://www.eventtemple.com/blog/hotel-sales-forecasting-strategies-tools-to-maximize-accuracy)
- [Tripleseat, benchmarking event data](https://tripleseat.com/blog/benchmarking-understanding-the-power-of-event-data-to-impact-growth/)
- [ezCater, building a catering sales team](https://www.ezcater.com/lunchrush/restaurant/off-premises-how-to-build-sales-team-catering/)
- [Hyperbound, 30/60/90 ramp plan](https://www.hyperbound.ai/blog/30-60-90-day-ramp-plan)
- [MuchBetter, sales call coaching scorecard rubric](https://muchbetter.ai/blog/sales-call-coaching-scorecard-a-25-point-rubric-for-managers)
- [Gary Smith Partnership, the truth about 3x pipeline coverage](https://gspsolutions.com/3x-pipeline-coverage/)
- [Pragmatic Institute, eight win loss analysis best practices](https://www.pragmaticinstitute.com/resources/articles/product/eight-win-loss-analysis-best-practices/)
- [LeadGibbon, five reasons not to rely on run rate](https://www.leadgibbon.com/blog/run-rate/)
- [Cvent, hotel competitive set guide](https://www.cvent.com/en/blog/hospitality/comp-set)
- [Knowland, playing to win in group sales](https://www.knowland.com/2024/01/playing-to-win-in-group-sales-what-can-we-do/)
- [Lucky Strike Fullerton](https://www.luckystrikeent.com/location/lucky-strike-fullerton)
- [Lucky Strike Orange](https://www.luckystrikeent.com/location/lucky-strike-orange)
- [Round1, book a party](https://www.round1usa.com/book-a-party)
- [Round1, locations](https://www.round1usa.com/locations)
- [MAFSI career centre, District Sales Manager job description](https://careercenter.mafsi.org/career/district-sales-manager/job-descriptions)

**Not found, and stated as not found:** no commission rate, quota, threshold, accelerator or bonus
mechanic is published by Main Event or Dave and Buster's anywhere I could reach. Glassdoor and
Comparably carry self reported total pay aggregates only, which are pay levels rather than plan
design and are not citable as a plan. No revenue disaggregation for events as a share of total
revenue was obtainable from the Bowlero fiscal 2024 Form 10-K text I could retrieve, and none is
published by Main Event for Brea. No published benchmark exists for FEC group event quotas or for
share of local group business in a trade area of this size.
