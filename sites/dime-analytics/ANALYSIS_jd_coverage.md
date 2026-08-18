# The Brea posting against the application, item by item

Twenty four requirements from `JD_BREA.md`, scored against what the code actually does on
14 August 2026. Every score names files and routes or says plainly that nothing covers it.
Read only pass over `src/`. No application code was changed.

## The scale

| Mark | Meaning |
| --- | --- |
| **A** | Covered and would demo well. A surface exists, it is built on real data, and a hiring manager could be walked through it in ninety seconds. |
| **B** | Covered but thin. The surface exists and one named half of the requirement is missing or is prose rather than a working thing. |
| **C** | Partly covered. Something in the app touches it, usually by adjacency rather than by design, and the requirement's own words are not answered. |
| **D** | Not covered at all, or not a thing software can carry. |

The scale is deliberately harsh at C. A page that argues for a capability in prose is not the same
as a page that performs it, and the whole credibility of this application rests on that distinction
being made elsewhere, so it is made here too.

## Coverage table

| Id | Requirement, short | Mark | Where it lives |
| --- | --- | --- | --- |
| W1 | Loves selling for a restaurant and entertainment scene | **A** | `/packages`, `/calendar`, `/leagues`, `/cup`, `data/venue.ts` |
| W2 | Prospecting, presentation, closing | **A** | `/` desk, `/map`, `/quote/:id`, `/objections` |
| W3 | Leadership, relationship selling, new business development | **C** | `/inbox` and record modal are strong; leadership is `/coaching` prose only |
| W4 | Maintaining relationships to earn year over year business | **C** | Nothing models a customer after the signature. Adjacent only |
| W5 | A campaign that nurtures relationships and drives repeat sales | **C** | `lib/email/templates.ts` is entirely acquisition |
| W6 | Goal oriented, self motivated, self directed | **A** | `components/rings/DailyRings.tsx`, `/today`, `/book/week` |
| W7 | Surpasses targets, driven by bonus | **C** | Targets yes. The word bonus appears nowhere in the app |
| R1 | 21 or over | **D** | Not a software fact. Belongs on the CV |
| R2 | Five or more years of related sales experience | **D** | Not a software fact. Belongs on the CV |
| R3 | Outgoing, excellent verbal and written communication | **A** | `data/conversations.ts` (156 messages), `lib/email/templates.ts`, `/quote/:id` |
| R4 | Travel 10% in the community, tradeshows, conferences | **B** | `/field` runs and tabling. No tradeshow or conference anywhere |
| R5 | Excel, Word, Office, CRM applications | **A** | The app is the CRM. `lib/export/csv.ts` with a UTF-8 BOM, `styles/print.css` |
| R6 | Presentation and negotiation | **A** | `/quote/:id`, `/objections` with the cost of every answer, `OFFERS` with `costToVenue` |
| R7 | Outbound prospecting and new business development | **A** | The whole application. 102 organisations, ranked |
| D1 | Outbound outside the building, prospective **and current** customers | **B** | `/field` is excellent on prospective. Nothing at all on current |
| D2 | Local and outbound strategy, high potential segments and industries | **A** | `domain/lanes.ts` nine lanes, `/lanes`, `domain/selectors/desk.ts` |
| D3 | Build and manage a sales team, mentorship, training, goals | **C** | `/coaching` covers training well. No rep exists as data |
| D4 | Full sales cycle: prospecting, calls, appointments | **B** | Desk to compose to outbox to inbox to book. Appointments are due dates, not a diary |
| D5 | KPIs, **market trends**, staying ahead of the **competition** | **C** | KPIs strong. No trend anywhere. Competition is one write-in line on a printed sheet |
| D6 | Daily, weekly and monthly reporting in the CRM | **B** | Daily and weekly are built. There is no month in this application |
| D7 | Data warehouse, regular communication with the **client base** | **B** | Correspondence tracking is a highlight. There is no client base to communicate with |
| D8 | Partner with District and Regional Sales Managers | **D** | Nothing. No upward report, no above-venue surface |
| P1 | Sales commission potential | **D** | Nothing. Zero occurrences in `src/` |
| P2 | Quarterly bonus programme | **D** | Nothing, and there is no quarter in the period model either |

**Tally: eight A, five B, six C, five D.** Two of the five Ds (R1, R2) are facts about a person that
no application can carry, so the real product gap is three Ds and six Cs.

## Your two hunches, tested

### Hunch one, no client or account management: CONFIRMED, and the code says so out loud

This is not an inference. `src/domain/types.ts` line 9 and `src/data/venue.ts` line 18 both state it
as a design decision: "There is no client base to retain, no walk-in traffic to convert, and no CRM
history to mine." The model was built around that sentence and it holds all the way down.

The proof is in the status ladder. `PitchStatus` in `src/domain/vocabulary.ts` runs
`unworked, reached-out, conversation, soft-hold, booked, lost`. It **terminates at the signature**.
There is no delivered, no repeat, no lapsed, no won-back. `src/data/prospectStatus.ts` distributes
102 rows across those six and the two booked ones are the end of their own road.

I went and checked the two places you told me to check.

**`/book` does no retention work.** `src/pages/BookPage.tsx` is two ledgers side by side, booked
revenue and outbound hours, with three honesty figures over them: the share of the book resting on a
price a person typed, hours outside the building per thousand dollars booked, and hours planned per
lane. Every one of those is about acquisition cost. The two seed contracts in `src/data/book.ts`
have event dates of 20 November and 12 December 2026, and after those dates the application has
nothing to say about either organisation. `/calendar` treats the same two dates as lane consumption
and then stops.

**The record modal does not either.** `src/components/record/ProspectRecordModal.tsx` renders six
chips (status, intent, days quiet, offers open, inbound requests, what is signed) and five sections.
Its "Signed" section, at lines 802 to 828, prints the event date, the guest count, the lanes held and
the contract value. That is the last word the application has about a customer. There is no
next-event field, no rebooking date, no debrief, and `lib/email/templates.ts` carries thirteen
drafts of which not one is addressed to somebody who has already bought.

Three things came closer than I expected and are worth naming, because they are the honest raw
material for a fix rather than excuses:

- **`/leagues` and `/cup` are genuinely a retention product.** `src/domain/leagues.ts` opens with
  "the only recurring product this building sells" and argues explicitly that a transactional book
  is what a pre-opening venue is most tempted to build. Sixteen teams claiming the same two lanes for
  sixteen weeks is repeat business modelled before anybody has repeated. This is the strongest
  retention artefact in the codebase and it is filed under product rather than under account.
- **`midweek-daytime-lock` in `src/data/venue.ts`** is a rate agreed now and honoured for a year.
  That is a year-over-year mechanic, and `src/data/conversations.ts` line 2206 has a rep using it in
  a thread. One offer, no surface.
- **`/partners` already contains the exact decay engine an account board needs.**
  `src/domain/selectors/partners.ts` computes days since last worked at render, against an injected
  clock, and buckets it as `worked, cooling, cold, gone-quiet` with the thresholds printed on screen.
  Its own comment says a supplier relationship "does not fail loudly. Four months pass, the person
  who knew you leaves, and the next quote comes back at list price." That sentence is true of a
  customer, word for word. **The retention machinery exists and is pointed at the wrong entity.**

So: hunch confirmed, and the fix is cheaper than it looks, because it is mostly a port.

### Hunch two, D3 is almost entirely absent: HALF DESTROYED

I will argue with you on this one, because `/coaching` is stronger than "an essay about how a floor
should be run", and the distinction matters for what you build next.

`src/pages/CoachingPage.tsx` is 1,060 lines and carries four things. A seven step ramp where each
step states **why it sits at that number and not one lower**, which is a real training design and not
a curriculum. A two column call frame splitting calendar-locked from discretionary buyers, with the
opening question verbatim, what you are competing against, what closes it and the failure mode,
which is the single most transferable piece of sales management on the site. A measurement section
that splits the verbs, activity is coached and revenue is managed, and enforces it with three stated
rules. And a thirty minute one-to-one agenda where every item links to the screen it is run from and
names what a bad answer sounds like.

Critically, its figures are **live**, not typed. Lines 419 to 434 compute calendar-locked
organisations touched inside their buying window off `PROSPECTS` and `touchesFor(pipeline)`, and the
lagging column reads `revenueTotals` and `hoursPerThousandBooked` out of `BookProvider`. Advance a
prospect on the desk and this page moves. That is not an essay.

What it genuinely lacks is the other half of D3, and the lack is total: **a rep does not exist as
data anywhere in this codebase.** There is no seller type, no assignee on a prospect, no per-person
board, no individual or team goal, and no roll-up. The closest thing is `ActivityLine.ownerRole` in
`src/domain/types.ts` line 752, a string field commented "A role, never a person", which every seed
row in `src/data/book.ts` sets to "Sales Manager". So the posting's "ensure they achieve their
individual and team goals" has nothing behind it, and `/coaching` describes managing a floor that the
application cannot represent.

Verdict: D3 is a C rather than the D you expected. The training and mentorship half is done well.
The management half has no data model at all, and that is the buildable gap.

## The rest of the detail, where a mark needs defending

**W1, A.** Domain fluency is the thing this application is least short of. `src/data/packages.ts`
holds eighteen packages read off mainevent.com with their day-part fences, `/calendar` computes
everything from Main Event's own published one lane per twenty guests against a published floor of 26
lanes, `src/data/cup.ts` gets Baker scoring and the USBC twenty-one game benchmark right, and
`NOT_PUBLISHED_FOR_BREA` in `venue.ts` lists the six attractions the venue has not announced so that
nobody promises an escape room.

**W2, A, with one caveat.** Prospecting is `domain/selectors/desk.ts`, which weights reachability
heaviest and opens its own score on every row. Presentation is `/quote/:prospectId`, rendered outside
the shell so a customer never sees the call sheet. Closing is `/objections`, where every answer
carries what it costs the venue. The caveat is that the closed business is two contracts, which is
honest but means "The Closer" is argued rather than evidenced.

**W3, C.** Relationship selling is genuinely strong: 156 threaded messages in
`src/data/conversations.ts`, both directions, with out-of-office and wrong-person treated as requeues
rather than rejections, and `/inbox` categorising every thread off the last message rather than off a
stored flag. New business development is the entire board. Leadership is prose only, per D3.

**W4 and W5, C.** Covered above. W5 deserves one extra line: the campaign machinery is real, four
compose intents in `EmailComposeModal.tsx`, thirteen templates, an outbox that cannot send by
construction, a per-lane ask on the week sheet. It is aimed exclusively at people who have never
bought. The nearest thing to nurture is the second-touch template and the February diary entry
against the Fairway Ford loss.

**W6, A.** `components/rings/DailyRings.tsx` over `domain/selectors/daily.ts`: three rings, touches
made, replies handled, stale cleared, with targets that adapt off the reader's own recent working
days, floored and capped, and weekends excluded from the denominator so the tool does not
manufacture two failures a week. Nothing is stored. That is a self-directed operator's screen.

**W7, C.** The first half is covered by the rings and the week sheet. The second half, "driven by
your bonus", has no representation at all. There is no commission rate, no accelerator, no gate, and
no quarter.

**R3, A.** Worth saying what makes this strong rather than merely present: the `go-see-script`
template in `lib/email/templates.ts` has the subject "Not for sending. Say this at the desk", which
is written verbal communication, and every counterparty in the threads is a role on a `.invalid`
address so no human being is invented.

**R4, B.** `/field` builds go-see runs sorted by straight-line distance from 245 W Birch Street
because that is the order somebody drives them, and the tabling argument for the Kraemer Boulevard
block is the best geographic reasoning on the site. `ActivityType` has `networking-event`, which the
seeds spend on chamber mixers in three cities. There is no tradeshow, no conference and no travel
budget anywhere, so the second clause of R4 is untouched.

**R5, A.** The application is a CRM, which answers the clause that matters. `lib/export/csv.ts` does
RFC 4180 quoting and writes a UTF-8 BOM specifically so Excel on Windows does not mangle accented
characters, and it is wired into `/`, `/today`, `/replies` and `/requests`. `styles/print.css` and
`/book/week` produce the Word-shaped artefact, a document that leaves the building.

**D1, B.** The strongest single alignment in the application and also one of the clearest gaps. The
posting's sentence is quoted verbatim in the header comment of `src/pages/FieldPage.tsx`, and the
three sections are argued from necessity, geography and scarcity. But "go-sees with prospective
**and current** customers" is half a requirement here: `domain/selectors/goSeeRuns.ts` builds its
runs from organisations that publish no email at all, which is a prospecting filter.

**D4, B.** The cycle is complete in one direction: desk ranks, status advances (and stops at date
held on purpose, because booking requires a `BookLine` with money on it), compose writes, outbox
logs, inbox threads the reply, replies carry dispositions with dated next steps, book carries the
signature. Appointment setting exists as `nextStepDue` plus record snooze options of 3, 7 and 14
days. There is no calendar object and no meeting, so an appointment is a date on a row.

**D5, C.** The KPI half is done properly. The market trend half does not exist: there is not one
time series in the codebase, nothing compares a period against the one before it, and the four
periods are pre-opening countdown bands rather than a history. Competition is thinner still. Round
One Entertainment is discussed at length on `/method` but as a **data quality exclusion**, a business
whose address could not be confirmed, not as a competitor. The only place a competitor is captured is
a ruled blank line on the printed week sheet reading "Anything heard about a competitor or a date",
and the only competitive argument is the Dave and Buster's objection in `src/data/objections.ts`.

**D6, B.** Daily is `daily.ts` and the rings. Weekly is `/book/week` plus `activityByWeek`. Monthly
is missing and the reason is structural: the application's unit above the week is the four-week
period in `src/data/venue.ts` (`t-minus-16`, `t-minus-12`, `t-minus-8`, `t-minus-4`), which is the
right unit for a pre-opening venue and is not a month. `/coaching` says lagging figures are "managed
monthly" and there is no monthly surface to manage them on.

**D7, B.** "Track all correspondence and communications" is one of the best-served lines in the
posting: `conversations.ts`, `/inbox`, `/sent`, `components/record/Timeline.tsx`, all threaded per
organisation with the channel on every row, all derived rather than stored. "Leverage regular
communication with the client base" is the same hole as W4.

**D8, D.** There is no District or Regional Sales Manager anywhere in `src/`. The regional and
district roles that appear in `conversations.ts` are inside the **buyers'** org charts, describing
who signs at a chain. Nothing in the application reports upward, and `/coaching` mentions the General
Manager only in prose.

**P1 and P2, D.** Zero occurrences of commission or bonus as a product concept in `src/`; the only
hits are a lane note about commission businesses as buyers and a `SEVERITY_BONUS` scoring constant on
the week sheet. There is no quarter in the period model, so P2 has no unit to be expressed in.

## The honest resolution for retention

The constraint is real: there are no existing clients, and an accounts section populated with a back
catalogue would be the one invented fact this application has spent 216 files avoiding. It would also
be the easiest lie for an interviewer to catch, because Main Event Brea is publicly not open.

**Do not model a back catalogue. Model the day after the first event, and let the count be two.**

The two contracts in `src/data/book.ts` are the only real forward-looking relationships that exist,
and they are dated 20 November and 12 December 2026, which is to say **both are still ahead**. So the
honest retention surface is not a history, it is a **clock**. Its correct state today is "no event
has happened yet, here is the day the first one does, here is exactly what happens the day after, and
here is the window in which each of these two either rebooks or lapses." That is a screen that is
completely true on the day it is built, becomes more useful every week, and demonstrates that the
candidate understands retention as a mechanic rather than as a list of logos.

Four properties make it honest and cheap:

1. **The recurrence data already exists.** Every row in `src/data/prospects.ts` carries
   `buyingWindow`, a string like "Nov-Dec (holiday party); Jan (annual kickoff)". That field already
   encodes annual recurrence for 102 organisations. A rebooking window is the same field read from
   the other end: the event happened, the next occasion is named, and the window opens a fixed lead
   time before it.
2. **The two contracts have different recurrence shapes, which is the interesting part.** Heights
   Christian is a Play It Forward voucher block whose next occasion is a school-year event, so it
   recurs annually against a published calendar. Team Kwon is a belt-test celebration, which recurs
   every testing cycle rather than every year. Two contracts, two clocks, no invention.
3. **The decay model is already written.** Port `Staleness` and `daysBetween` out of
   `domain/selectors/partners.ts` onto the account. Same four buckets, same injected clock, same
   thresholds printed on screen. This is a port, not a design.
4. **Nothing is added to a ledger.** An account has an event date, a debrief and a rebooking window.
   It carries no second revenue figure, so the two-ledger rule survives untouched.

The one modelling decision worth stating: **do not extend `PitchStatus` past `booked`.** That ladder
is an acquisition ladder and its filling-circle glyph set depends on it. Add a separate `AccountState`
(`awaiting-delivery, delivered, rebooking-window-open, rebooked, lapsed`) keyed off the `BookLine`,
so the acquisition board and the retention board never disagree about what a word means. Today both
accounts read `awaiting-delivery`, and the page says so in words rather than rendering an empty table.

## What to build, ranked by JD surface closed per unit of work

### 1. The account, and the day after the event

**Closes:** W4, W5, the current-customer half of D1, the client-base half of D7, part of W3.
**Size:** medium. One new type, one selector ported from `partners.ts`, one page, two email templates.
**Where:** `/book/accounts`, as a child of the book exactly as `/book/week` already is. Not a
twenty-first top level section; the book already owns contracts, and the nav is at twenty.

**On screen:** two account cards, one per contract. Each carries the organisation name (a live button
into the record modal, as every name in the app already is), the event date with a countdown, the
guest count and lanes off the existing `BookLine`, a **rebooking window bar** showing when the next
decision opens and closes read off `buyingWindow`, the next occasion named in the buyer's own terms,
and a days-since-last-worked reading with its bucket. Two actions: "Debrief" writes an activity line
against the account, and "Ask for the next one" opens the compose window on a new template. Above
both cards, a single honest sentence: no event has been delivered yet, the first is on 20 November
2026, and this board will read `delivered` from 21 November onwards. Below them, the leagues link,
because a league seat is the second retention path and the application already models it.

**Why first:** retention is named five times in six lines of the posting and it is currently the
largest hole in a 216 file application. It is also the cheapest to close, because the decay engine,
the recurrence data and the contract records all already exist.

### 2. The floor: make a rep a thing

**Closes:** D3 properly, the leadership half of W3.
**Size:** medium. Promote `ActivityLine.ownerRole` to a `seatId` over a three row seat table (Sales
Manager, Event Sales Representative 1, Event Sales Representative 2, roles rather than names, keeping
the no-invented-people rule), add the same field to the status table, and add a live section to
`/coaching`.

**On screen:** a three seat strip above the existing ramp. Each seat gets its slice of the 102, its
outside hours against its planned hours, and the window-work ratio that `CoachingPage.tsx` already
computes at lines 419 to 434, now per seat instead of for the whole board. Under the strip, one team
row that is the sum of the leading indicators and explicitly not a sum of anything in dollars. The
ramp, the call frame and the one-to-one stay exactly where they are, and now they describe people the
application can point at.

### 3. Commission and the quarter

**Closes:** P1, P2, the bonus half of W7.
**Size:** small, if the quarter is added as a derived grouping over the existing periods rather than
as a fifth period type.
**On screen:** a block beneath the booked-revenue ledger on `/book`. An illustrative commission rate
applied to contract value, badged illustrative and stated as this application's own proposal because
Main Event publishes no comp plan, plus a quarterly gate expressed in the **leading** indicators, so
the bonus is earned on work a person controls rather than on a school district's budget cycle. That
framing is already the argument of `/coaching`, so this is that argument made payable.

### 4. The district report

**Closes:** D8, the monthly half of D6.
**Size:** small to medium. Every figure already exists; this is a layout and a period roll-up.
**On screen:** one printable page in the same shape as `/book/week`, addressed upward: the period's
two ledgers, the board's status distribution, the held dates with their release dates, the losses with
their reasons, and the exceptions the venue wants a decision on. Printable matters, because the point
of D8 is that this is the document a District Sales Manager reads.

### 5. The competitive set and the market clock

**Closes:** D5.
**Size:** medium and research heavy, which is why it is last despite being a full C.
**On screen:** a small competitor register of published, checkable facts only (the venues already
named in `data/leagues.ts` as routing league pricing to a form are the honest starting set), plus
promotion of the week sheet's "anything heard about a competitor or a date" write-in line into a
capture field on the record so competitive intelligence lands somewhere structured. Restrict it hard
to published facts. This is the one addition on this list that invites invention.

### If only one thing could be built

**Build the account and the day after the event.** Retention is the most repeated idea in the
posting, it is the largest gap in the application, and it is the only item on this list where the
honest version is more impressive than the dishonest one. A board full of invented customers says the
candidate can fill a table. A board that says "nothing has been delivered yet, the first event is in
thirteen weeks, and here is precisely what happens the morning after it" says the candidate
understands that retention is a process you design before you have anybody to retain. That is the
argument the posting is actually asking for.

## As a sellable SaaS

**What is generic.** Roughly two thirds of the model. The two ledger separation that refuses to let
activity wear revenue's clothes. The provenance system, where a figure cannot render without stating
where it came from. The lane model with its calendar-locked versus discretionary split, which is true
of any venue selling group occasions. The desk ranking that weights reachability first. The record
plus thread plus inbox categories, including out-of-office and wrong-person as requeues. The capacity
arithmetic derived from a published guests-per-unit ratio. The printable week sheet. CSV and print.
The objection register with a cost against every answer. The supplier and spend register.

**What is Main Event Brea.** The 102 rows in `data/prospects.ts` and their geocoding, the eighteen
packages in `data/packages.ts`, the venue record, the pre-opening period model counted in weeks to
open, the licensor data, and the leagues and cup proposal. All of it is in `src/data/`, compiled into
the bundle. That is a clean boundary and it is the single most valuable structural fact about this
codebase commercially.

**What the product would be.** A group and event sales CRM for entertainment venues, wedged
specifically at the pre-opening and new-site window. That wedge is the interesting part: Tripleseat,
Perfect Venue and a Salesforce instance all assume an open venue with a booking diary and inbound
enquiries. A venue that has not opened has none of those and therefore has no CRM at all, which is
exactly when the trade area is being built. Buyers: FEC, bowling, trampoline, axe-throwing and
competitive-socialising chains opening new sites, where a regional team repeats the same pre-opening
motion four to twelve times a year, plus independents with one event sales person.

**What is missing before venue two.** More than the surface suggests. There is no backend, no auth,
no user model and no multi-tenancy; every fact is a static TypeScript module and the only persistence
is `state/persist.ts` over localStorage. There is deliberately no email transport, which is the right
call for a work sample and a blocker for a product. Nothing is configurable per venue: the lanes, the
packages, the guests-per-lane ratio and the offer catalogue are all hardcoded in `data/`, so venue two
is currently a fork. There is no import path for a prospect list, and the 102 rows here took a
research pass and a Census geocoding run to produce, so a product needs a territory builder (the
groundwork exists in `GEOCODED.json` and `scripts/`). And there is no integration with the booking
system, the POS or the venue's event diary, which is where a real venue's data actually lives.

**Honest read.** This is a domain model and a design system with a genuinely good spine sitting on a
static data layer. Single-tenant hosted, with auth and a real database, is a two to three month job
for one person. Multi-tenant with per-venue configuration and one integration is more. The defensible
part is the model, particularly the two-ledger discipline and the provenance system, and neither of
those is hard to copy once seen, so the moat is the judgement rather than the code. Which is fine,
because the immediate job of this application is to get one person hired, and the SaaS story only has
to be credible enough to answer "could this be built out". On that test it passes, and the boundary
between `src/data/` and everything else is the specific answer to give.
