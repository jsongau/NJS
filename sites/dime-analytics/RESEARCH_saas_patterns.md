# RESEARCH: SaaS patterns for a one person prospecting CRM

Research only. No application code. Every substantive claim below carries a URL. Where a product's
interface is not publicly documented, that is stated rather than guessed.

House rules observed in this file: no em dashes, no en dashes, no arrows.

---

## VERDICT

Four patterns, in priority order. Everything else in this document is detail underneath these.

**1. The home screen is a prioritised queue of records that need a touch today, not a dashboard of
numbers.** Pipedrive does not sort its pipeline by value or by name. It sorts by next activity, in
four tiers: overdue activity first, activity due today second, **no activity scheduled third**,
future activity last
([Pipedrive](https://support.pipedrive.com/en/article/how-are-deals-ordered-in-the-pipeline-view)).
That single ordering rule is the difference between a screen that tells you how you are doing and a
screen that tells you what to do. Close builds its entire home surface the same way, as an Inbox
with Done and Future siblings ([Close](https://help.close.com/docs/inbox)). This app currently opens
on explanation. It should open on a work queue of roughly 10 to 20 organisations with a reason
attached to each.

**2. Time since last touch must be a first class, visible, filterable property, and it must have a
name.** Pipedrive calls it Rotting, configures it per stage in days, paints the card red, and resets
the clock when an activity is completed or a note, file or email is added
([Pipedrive](https://support.pipedrive.com/en/article/the-rotting-feature)). "No reply" is not a
stage, it is a decay timer running inside a stage. This is the single highest leverage mechanic for
a 102 record territory worked by one person, because the failure mode of a solo rep is not losing
deals, it is forgetting them.

**3. The record drawer is a fixed six slot summary above a filterable timeline, not a form.** Attio
puts up to six attributes as highlight widgets at the top of the record, then tabs for Overview,
Activity, Notes, Tasks, Emails and Files, with editable fields pushed into a left sidebar
([Attio](https://attio.com/help/reference/managing-your-data/records/configure-record-pages)). The
owner's four requested facts (last conversation, status, intent to commit, offer extended) are
exactly a highlights row. They go above the fold as chips. Everything else is a tab.

**4. Status vocabulary should be borrowed wholesale from Tripleseat and Instantly, not invented.**
Tripleseat ships Prospect, Tentative, Definite, Lost, Closed, with Tentative explicitly meaning "holds
space" ([Tripleseat](https://support.tripleseat.com/hc/en-us/articles/15865184047127-Converting-Leads-into-Bookings)).
Instantly ships Interested, Meeting Booked, Meeting Completed, Won, Out of Office, Wrong Person, Not
Interested, Lost ([Instantly](https://help.instantly.ai/en/articles/7251329-subsequences)). Between
them they cover the entire loop from cold organisation to held date, and they are the vocabulary real
users already read fluently.

---

## 1. VENUE AND EVENT BOOKING PLATFORMS: HOW AN ENQUIRY BECOMES A BOOKING

### Tripleseat, screen by screen

The documented conversion path is short and explicit, which is the point.

1. A lead arrives via an embedded, segment specific lead form (separate forms for weddings versus
   corporate), with custom fields such as "How did you hear about us?". Submission fires an instant
   auto response
   ([Tripleseat](https://tripleseat.com/articles/everything-you-need-to-know-about-the-tripleseat-lead-form/)).
2. On the lead record there is a single primary button, **"Convert this Lead"**.
3. That opens a choice, **"Convert to Booking"**.
4. Lead fields auto populate the booking fields. The rep tops up what is missing.
5. The rep picks a **booking status** from a fixed list.
6. The rep fills booking financials and optionally creates a guest room block.
7. The rep configures events. "An Event space or area is required for each Event." Food and beverage
   minimums or rental fees are set at event level.
8. **"Create"**.
   ([Tripleseat](https://support.tripleseat.com/hc/en-us/articles/15865184047127-Converting-Leads-into-Bookings))

The Tripleseat booking statuses, verbatim:

| Status | Meaning |
|---|---|
| Prospect | "Light inquiry, next step up from a Lead, can double book or overlap Prospective Bookings" |
| Tentative | Contracting stage; holds space |
| Definite | Contract signed and deposit paid |
| Lost | Business is lost (note reason for follow up) |
| Closed | Booking completed; financials updated |

Two design facts worth stealing. First, **Prospect explicitly permits double booking and overlap**,
Tentative holds space. The system encodes the difference between interest and a hold at the data
layer, so the calendar can show soft and hard differently. Second, **Lost demands a reason at the
moment of loss**, not later.

Proposals in Tripleseat are "live web based documents" rather than PDF attachments, with "Automated
Nudges" firing if a proposal stays unsigned, and a self service path (TripleseatDirect) where a
planner can "view live availability, select menu packages, and pay deposits in a single sitting"
([Tripleseat](https://tripleseat.com/articles/everything-you-need-to-know-about-the-tripleseat-lead-form/)).

### Perfect Venue

Seven shipped statuses
([Perfect Venue](https://help.perfectvenue.com/knowledge/event-statuses-explained)):

- **Lead**: "a brand new inquiry from a guest, and likely something you don't know will turn into an
  event yet"
- **Qualified**: "an inquiry that has great potential, but hasn't confirmed they will have their
  event with you yet"
- **Proposal Sent**: automatic, triggered when a proposal is sent
- **Confirmed**: automatic, "once the guest signs the proposal and/or pays the deposit"
- **Balance Due**: manual
- **Completed**: manual, also automatic if the remaining balance is paid after the event date
- **Lost**: requires a cancellation reason

Three things to note. **Two of the seven statuses set themselves** from a real event (proposal sent,
deposit paid), which means the rep never lies to the pipeline about where a deal is. **Lost forces a
cancellation reason.** And **Lost is hidden from the homepage** but reachable via a calendar toggle
or the Reports section. Lost is not deleted, it is demoted out of the working set. Statuses render
as colour coded bubbles and are not grouped into categories.

### HoneyBook

Pipeline stages are fully user defined: add, rename, reorder, delete, up to 20 custom stages
([HoneyBook](https://help.honeybook.com/en/articles/2463528-customize-your-pipeline-in-honeybook)).
HoneyBook's default stage names and card layout are not listed in that article, so they are **not
verified here**.

### Event Temple, Priava, Momentus

Their public marketing describes pipelines and lead intake forms, but I could not find public
documentation describing the actual screens, stage names or record layouts for any of the three.
**Not verified. Do not describe their interfaces from memory.**

### What this category teaches this app

The venue loop is: enquiry, qualify, propose, hold, deposit, book. Two of those transitions are
worth automating from evidence rather than asking the rep to self report (proposal sent, deposit
paid). Two need friction on purpose (moving to a hold, and marking lost with a reason).

---

## 2. SALES CRMS WITH A STRONG PIPELINE SURFACE

### Pipedrive: the pipeline is the home screen, and the sort order is the product

The deal card shows "title, contact, value, label and owner", plus an activity icon that reveals
upcoming tasks. A pipeline selection dropdown sits at the top. Deals move by drag and drop between
stage columns, and can be dragged onto a Delete target. There is a **Sort by** dropdown (value,
expected close date, owner) and **Filter > Filters**, where filters can be added to favourites for
quick access. Won and Lost remove a deal from the active pipeline view; they remain reachable by
filter ([Pipedrive](https://support.pipedrive.com/en/article/pipeline-view)).

The default ordering is the thing to copy exactly
([Pipedrive](https://support.pipedrive.com/en/article/how-are-deals-ordered-in-the-pipeline-view)):

| Priority | Indicator | Meaning |
|---|---|---|
| Very high | Red arrow | Overdue activity |
| High | Green arrow | Activity due today |
| Medium | Yellow warning | **No activities added** |
| Low | Grey arrow | Future activities added |

"Deals that require immediate attention, like overdue or activities due today, are shown at the top.
Deals without activities come next, while deals with future activities appear lower in the pipeline."

Read that third row again. **A record with nothing scheduled ranks above a record that is under
control.** That is the entire philosophy of activity based selling compressed into a sort comparator,
and it is free to implement.

Note also that Pipedrive uses a shape plus a colour for each tier (arrow direction, warning glyph),
not colour alone. That is already required by this project's colourblind constraint and it happens to
be what the market leader does.

### Pipedrive Rotting

Enabled per pipeline by clicking a pencil icon, then a **"Rotting in (days)"** toggle, with a
different day threshold configurable per stage. Rotten deals show "the red color on the deal tile in
your pipeline view". The clock measures time since the deal's last updated time, and resets when the
user marks an activity done, adds a note or file, or sends, receives, unlinks or deletes an email.
Restoring a rotten deal means scheduling a new activity or editing deal details
([Pipedrive](https://support.pipedrive.com/en/article/the-rotting-feature)).

Per stage thresholds matter for a venue: a Prospect can sit 21 days without alarm, a held date at 3
days without contact is an emergency.

### Close: the inbox is the home screen

Close splits into three siblings: **Inbox**, **Done**, **Future**. Tabs across the top filter by
activity type (emails, calls, SMS, tasks, opportunities). What surfaces there:

- Emails from addresses linked to an existing lead
- Missed calls and voicemails
- Inbound SMS with inline reply
- Tasks that are due or past due (upcoming ones live in **Inbox > Future**)
- Opportunity reminders: expected close date, and follow up alerts for stalled deals
- **Potential Contacts**: messages from unsaved contacts, expiring after 30 days, "private to you"

Hovering a lead reveals status, opportunity value and the contact's **Estimated local time**. Items
can be marked done, snoozed, or handled in bulk per lead via "mark all as done or snooze all"
([Close](https://help.close.com/docs/inbox)).

Two ideas worth taking. **Snooze as a first class verb** is how a queue stays honest without lying:
you are not marking something done, you are pushing it to Future. And **Potential Contacts** solves
exactly the owner's problem of a reply arriving from an organisation not yet on the board.

### Attio: the record page anatomy

The Overview tab carries "up to six attributes as highlight widgets" at the top, shown "at a glance".
Below them sit configurable tabs: **Overview, Activity, Notes, Tasks, Emails, Files**, extended by
**+ Add tab**. The left hand sidebar holds sections, including a mandatory **Record Details** section
and a non removable **Lists** section showing the first three list attributes. Action icons live in
the upper left and can be reordered; **Configure page** hides behind a ⋮ menu in the upper right
([Attio](https://attio.com/help/reference/managing-your-data/records/configure-record-pages)).

The number six is the useful constraint. Six facts above the fold, everything else one tab away.

### Streak and Folk

Both position themselves as pipelines living inside or beside an email client, but I could not
retrieve official documentation describing their record or pipeline screens in enough detail to
describe them accurately. **Not verified.**

---

## 3. LEAD AND TERRITORY PROSPECTING TOOLS: LIST TO SEQUENCE TO CATEGORISED REPLY

### Apollo: the Tasks screen is the daily work surface

Four task types: **calls, manual emails, action items, LinkedIn tasks**. Default sort is by **due
date**. Additional sorts stack via **"Add Sort"** (Priority, Company, ascending or descending). A
**"Group by"** control groups by Due date, Priority, Status or Type. **"Show filters"** reveals search
filters.

Once a user accumulates 30 or more tasks, Apollo surfaces a **"Recommended"** set, prioritised by
engagement signals, multiple opens, positive call activity, decision maker involvement, or overdue
status; hovering the **"Recommendation"** label explains why that task was chosen.

Completion has two modes: a **one by one mode** where the rep opens a task, acts, clicks **"Mark as
Complete"**, and uses navigation arrows to move sequentially through the queue; and **bulk actions**
via checkboxes for completing, reassigning or archiving
([Apollo](https://knowledge.apollo.io/hc/en-us/articles/45138622305549-Organize-and-Complete-Tasks)).

The one by one mode with next and previous controls is the correct shape for the owner's daily loop.
It is a queue you can burn down without ever returning to a list.

The "explain why this is recommended on hover" pattern is important. It converts a black box ranking
into a defensible one, and this app has an existing habit of provenance badges that this fits.

### Apollo: reply classification

Apollo runs inbound replies through a classifier with "predefined classes" including **Out of
Office**, **Unsubscribe**, **Willing to meet** and **Follow up question**, with more classes implied.
Reported performance: over 99 percent precision on Out of Office, over 90 percent recall on Willing to
Meet ([Apollo](https://www.apollo.io/tech-blog/email-reply-classification-done-right)). The article
does not describe how the classifications are surfaced in the interface, so **that part is not
verified**.

The asymmetry in those two metrics is a design instruction. Out of Office is optimised for precision
because a false positive there wrongly suppresses a real human. Willing to Meet is optimised for
recall because a missed one is a lost booking. If this app auto categorises, it should be aggressive
about surfacing possible interest and conservative about auto filing anything as noise.

### Instantly: the reply taxonomy to copy

Eight default lead statuses, with custom statuses supported, usable as triggers for automatic
subsequences ([Instantly](https://help.instantly.ai/en/articles/7251329-subsequences)):

**Interested, Meeting Booked, Meeting Completed, Won, Out of Office, Wrong Person, Not Interested,
Lost.**

Note what is in there that a textbook pipeline omits: **Out of Office** (a reply that is not a
signal) and **Wrong Person** (a reply that is a signal, but a routing one). For a territory of
schools and chains, Wrong Person is arguably the most valuable status in the list, because at a chain
the decision is not in the building.

### lemlist: automatic versus manual, and where "no reply" lives

lemlist's statuses split cleanly by who sets them
([lemlist](https://help.lemlist.com/en/articles/8000399-understanding-lead-statuses-a-comprehensive-guide)):

- **Automatic**: Bounced, Clicked, Completed, Enriching, Failed, In progress, Opened, Ready to send,
  Replied, Sent
- **Manual**: Interested, Not interested, Skipped
- **Either**: Paused, Unsubscribed
- **Awaiting the user**: To launch

And the answer to the question most pipelines dodge: a lead that finishes a whole sequence without
replying gets status **Completed**, and lemlist's own guidance is to then run a re engagement campaign
or manually mark them Not interested.

That is the honest structural answer. **"No reply" is not a stage, it is the absence of an event
plus elapsed time.** Model it as a computed property, name it, and let it drive both a filter and the
sort. Pipedrive names it Rotting; lemlist lets it fall out as Completed. Rotting is the better model
for this app because it works inside every stage, not just at the end of one.

### Clay

Clay's public documentation covers enrichment waterfalls and table based workflows, but I could not
verify its list to sequence screens in detail. **Not verified.**

---

## 4. SHARED INBOX PRODUCTS: TYING A THREAD TO A RECORD

### Front Views

Front's Views are the strongest documented model for saved working sets. Two kinds: **private views**
(personal work queues) and **shared views**. Creating one configures:

- Name plus a colour or emoji identifier
- Workspace (one per view)
- Inboxes (up to 50)
- Tags (up to 50, include or exclude)
- Topics (focus on or omit conversation categories)
- Assignees (up to 50, track or exclude)
- Custom fields

Filter logic is hybrid and explicit: "filters within the same category will use OR logic" while
"filters from different categories use AND logic". Views appear as discrete sidebar entries with a
colour or emoji, up to 50 combined, and can be hidden and reordered
([Front](https://help.front.com/en/articles/2243)).

The OR within category, AND across category rule is the correct default for this app's rail. Clicking
School and Chain should show both. Clicking School and Overdue should show the intersection. Users
expect this without being told, and it is the rule that makes a multi select rail feel intelligent
rather than broken.

### Close, again, for thread to record binding

Close only raises an email into the Inbox if the address is "linked to an existing lead" or the
message was forwarded to a secret Close email address. Anything else lands in **Potential Contacts**,
private to the user and expiring after 30 days
([Close](https://help.close.com/docs/inbox)).

That is a clean three way model for an inbox that receives and sends:

1. Matched to an organisation, threaded on the record.
2. Unmatched but plausible, held in a triage lane with a one tap "attach to organisation" or "create
   organisation" action.
3. Expired or dismissed.

### Help Scout and Missive

Not verified in detail. Both are documented shared inboxes, but I did not retrieve screen level
documentation for either, and their patterns are adequately covered by Front and Close above.

---

## 5. WHAT IS ON THE HOME SCREEN OF A GOOD CRM, AND WHY

The owner's complaint, "feels more like a thing to build rather than an actual dashboard", has a
precise diagnosis: **a working screen is a queue with a sort order and a reason per row. An essay is a
screen that describes the queue.**

What the researched products actually put on the landing surface:

- **Pipedrive**: the pipeline itself, stage columns, deal cards showing title, contact, value, label,
  owner, sorted by activity urgency
  ([Pipedrive](https://support.pipedrive.com/en/article/pipeline-view)).
- **Close**: the Inbox, split Inbox / Done / Future, tabbed by channel, with per item snooze
  ([Close](https://help.close.com/docs/inbox)).
- **Apollo**: the Tasks queue, grouped by due date, with a Recommended subset and a one by one runner
  ([Apollo](https://knowledge.apollo.io/hc/en-us/articles/45138622305549-Organize-and-Complete-Tasks)).
- **Perfect Venue**: the working set, with Lost hidden from the homepage
  ([Perfect Venue](https://help.perfectvenue.com/knowledge/event-statuses-explained)).

The four properties they share:

1. **Every row is actionable from the row.** Pipedrive drags, Close snoozes and replies inline, Apollo
   completes.
2. **The order is opinionated and the reason is legible.** Not alphabetical, not by value. By
   urgency, with a glyph explaining which tier a row is in.
3. **Counts are labels, not paragraphs.** "Overdue 12". Perfect Venue renders status as a coloured
   bubble, nothing more.
4. **Completed and dead work is removed from the default view but not deleted.** Pipedrive removes
   Won and Lost from the active pipeline; Perfect Venue hides Lost from the homepage but keeps it in
   the calendar toggle and Reports.

**Concrete recommendation for the home screen of this app.** Three bands, top to bottom, no prose
between them:

- A single row of five to seven counters, each a filter button: Overdue, Today, No next step, Held,
  Booked this month. Numbers large, labels small, each one clickable and each one changing the queue
  below.
- **Today's queue**: 10 to 20 organisation rows, sorted by the Pipedrive tier rule, each row carrying
  organisation name, type glyph, status chip, days since last touch, next step or the yellow "no next
  step" warning, and one primary action button.
- One collapsed strip at the bottom for the "why I built this" panel the contract permits, collapsed
  by default.

Nothing else. No hero. No explanatory paragraph. The screen should be usable with the sound off and
the manual burned.

---

## 6. THE RECORD MODAL OR DRAWER

### The best documented version: Attio

Six highlight widgets at the top of Overview, tabs below (Overview, Activity, Notes, Tasks, Emails,
Files), editable attribute sections in a left sidebar, action icons upper left, configure menu upper
right
([Attio](https://attio.com/help/reference/managing-your-data/records/configure-record-pages)).

### Close's hover card

Even on hover, before opening anything, Close shows status, opportunity value and the contact's
**Estimated local time** ([Close](https://help.close.com/docs/inbox)). Three facts, chosen because
each one changes what you do next. Local time is there because it tells you whether to call now.

### What goes above the fold in this app

The owner named four things. Make them the highlight row, as chips, in this order:

1. **Status** (word plus glyph plus colour, per the colourblind rule)
2. **Last contact**: the actual last inbound or outbound line, truncated to one line, with relative
   age. This is the single most valuable fact and it is a quote, not a label.
3. **Intent to commit**: a three state chip, not a percentage. Something like None, Signalled, Held.
4. **Offer extended**: the specific offer or the word None. Never a blank.

Add two the research says he will want and has not asked for:

5. **Days since last touch**, the Rotting number, because it is the number that drives every decision
   ([Pipedrive](https://support.pipedrive.com/en/article/the-rotting-feature)).
6. **Next step**, with date, or a conspicuous empty state that is itself the button to schedule one.

Below the highlights: tabs for Conversation, Notes, Offers, Details. Primary action button pinned and
always visible.

### What is never in a record drawer

- Explanatory prose about what the drawer is.
- Every field the schema has. Attio pushes attributes into a sidebar section precisely so the top of
  the record is not a form.
- System metadata (created date, record ID, import source) anywhere above the fold.
- A read only wall. If a fact is displayed, it should be editable in place.
- Anything that requires a scroll before the rep knows what to say on the phone.

---

## 7. STATUS AND STAGE VOCABULARIES, AS SHIPPED

Side by side, verbatim from the docs:

| Tripleseat (booking) | Perfect Venue (event) | Instantly (lead) | Pipedrive |
|---|---|---|---|
| Prospect | Lead | Interested | user defined stages |
| Tentative | Qualified | Meeting Booked | plus Won |
| Definite | Proposal Sent (auto) | Meeting Completed | plus Lost |
| Lost | Confirmed (auto) | Won | plus Rotting as an overlay |
| Closed | Balance Due | Out of Office | |
| | Completed | Wrong Person | |
| | Lost | Not Interested | |
| | | Lost | |

Sources: [Tripleseat](https://support.tripleseat.com/hc/en-us/articles/15865184047127-Converting-Leads-into-Bookings),
[Perfect Venue](https://help.perfectvenue.com/knowledge/event-statuses-explained),
[Instantly](https://help.instantly.ai/en/articles/7251329-subsequences),
[Pipedrive](https://support.pipedrive.com/en/article/the-rotting-feature).

### Where "no reply" and "lost" actually live

**No reply.** No product in this research ships a stage called "No reply". Three real treatments:

- Pipedrive: a **decay timer inside every stage**, per stage thresholds, red tile, resets on any real
  activity.
- lemlist: falls out as **Completed** at the end of a sequence, with guidance to re engage or manually
  mark Not interested.
- Pipedrive again: **"No activities added"** is its own priority tier in the sort, ranked above deals
  with future activities.

**Lost.** Universally present, universally demoted rather than deleted, and usually gated behind a
reason:

- Tripleseat: Lost, "note reason for follow up".
- Perfect Venue: Lost requires a cancellation reason, is **hidden from the homepage**, and is
  reachable via a calendar toggle or Reports.
- Pipedrive: Lost removes the deal from the active pipeline, still filterable.

### Recommended vocabulary for this app

The contract already names six rail filters: Contacted, in conversation, held, booked, lost, never
touched. That is close to correct. Refined against the research:

**Never touched. Contacted. In conversation. Qualified. Offer out. Held. Booked. Lost.**

Plus two overlays that are not stages and must not be modelled as stages:

- **Stale** (the Rotting timer, per stage threshold, glyph plus red)
- **No next step** (the Pipedrive yellow warning tier)

Plus two reply outcomes borrowed from Instantly that are not stages either, but flags on the last
message: **Out of Office** and **Wrong Person**. Both are common in schools (summer) and chains
(regional approval), and both mean "this is not a rejection, requeue it".

Auto set what can be evidenced, following Perfect Venue: **Offer out** sets itself when an offer is
sent, **Booked** sets itself when a deposit or confirmation is recorded. **Lost** requires a reason,
one tap from a short fixed list (price, date unavailable, went elsewhere, no budget, no response,
wrong fit).

---

## 8. CONVERSATION HISTORY WITHOUT A WALL OF TEXT

Attio's answer is **filter the timeline by event type, and remember the filter per object type**. The
timeline carries record history plus all task events, overdue, upcoming and completed, and the user
tunes what appears ([Attio](https://attio.com/changelog/2026/new-activity-timeline)).

Close's answer is **channel tabs** across the Inbox (emails, calls, SMS, tasks, opportunities) plus
snooze and bulk "mark all as done" per lead ([Close](https://help.close.com/docs/inbox)).

Apollo's answer is **Group by** (due date, priority, status, type)
([Apollo](https://knowledge.apollo.io/hc/en-us/articles/45138622305549-Organize-and-Complete-Tasks)).

Concrete rules for this app's Conversation tab:

1. **Reverse chronological, newest at top.** A rep opening a record needs the last thing said, not the
   first.
2. **Collapse every message to two lines by default**: direction glyph, counterparty or channel, the
   first line of body, relative timestamp. Expand on click. This is the single biggest defence against
   a wall of text and no product in this research shows full bodies stacked by default.
3. **Day dividers**, and collapse runs of automated or system events into one summary line ("3 status
   changes").
4. **A filter chip row** above the timeline: All, Messages, Calls, Notes, Offers, Status changes.
   Persist the choice.
5. **Pin the last inbound message** to the top of the record as the highlight quote, separate from the
   timeline. That is the fact the rep needs in the first half second.
6. **Never paginate silently.** Show "42 earlier events" as a button.

---

## 9. FILTERING AT 100 TO 5,000 RECORDS

At 102 records this app is at the low end, which changes the answer. Below roughly 500 records, saved
views are overhead and quick filters win. The research supports building the cheap thing well.

What the products ship:

- **Front**: named views with colour or emoji, up to 50, sidebar resident, hideable and reorderable.
  Filters are OR within a category and AND across categories
  ([Front](https://help.front.com/en/articles/2243)).
- **Attio**: filters and sorts are **saved per view and shared**, with unsaved changes reverting on
  reload. Filter operators include "is, is not, contains", nested and/or groups, multi sort with drag
  to reorder, and a **"Current user"** dynamic value
  ([Attio](https://attio.com/help/reference/managing-your-data/views/filter-and-sort-views)).
- **Pipedrive**: **Filter > Filters**, and favourited filters for quicker access
  ([Pipedrive](https://support.pipedrive.com/en/article/pipeline-view)).
- **Apollo**: sort, multi sort via "Add Sort", "Group by", "Show filters"
  ([Apollo](https://knowledge.apollo.io/hc/en-us/articles/45138622305549-Organize-and-Complete-Tasks)).

**What survives daily use**, based on what every one of them keeps and none of them drops:

1. A **persistent left rail of one click filters with live counts**. This is the contract's requested
   status rail, and it is the correct primitive.
2. **Multi select within a facet, intersect across facets.** Front's rule. School plus Chain is a
   union; School plus Overdue is an intersection.
3. **Filter state in the URL**, so a view is a link and back works.
4. **A visible, dismissable filter summary bar** showing active filters as removable chips, with a
   "Clear all". At 102 records the most common failure is not finding nothing, it is not realising a
   filter is on.
5. **Favouriting or pinning a filter combination**, Pipedrive style, rather than a full saved view
   builder. Three to five pins is enough at this scale.
6. **One search box that matches organisation name, contact name and notes**, always focusable with
   a slash or Command K.

What to skip at 102 records: nested and/or filter groups, shared views (there is no team), bulk
reassignment (there is nobody to reassign to), and pagination.

---

## 10. ADDING A RECORD FAST, ON A PHONE, OUTSIDE THE BUSINESS

The best documented mobile add flow is HoneyBook's: from the bottom navigation, **"Create"** then
**"Project"**, enter details, **"Next: add client to project"**, pick an existing client or create a
new one, land in the workspace. Projects created in the app are placed in the **Inquiry** stage, and
the guidance is explicit: "If you don't know all of the details now, you can add them later"
([HoneyBook](https://help.honeybook.com/en/articles/2209203-start-or-edit-projects-with-the-app)).

The field sales equivalent is Badger Maps' **Check In**, which logs a customer interaction "as soon as
they happen" with interaction type, notes and photos, syncing to the CRM. Badger also ships a **Lead
Generation tool** to search nearby "by business category, view their location, contact information"
([Badger Maps](https://www.badgermapping.com/knowledgebase/google-maps-vs-badger-maps-feature-comparison/)).

**Design rules that follow:**

1. **One required field: the organisation name.** Everything else optional. A record with a name and
   a pin is a valid record.
2. **The new record lands in a default stage automatically** (Never touched), the way HoneyBook lands
   mobile projects in Inquiry. No stage picker on the add screen.
3. **Capture position by default** when added in the field, so the pin exists without a form.
4. **Type is the only other tap**: School, Local, Chain. Three large targets, glyph plus word,
   satisfying the 44px rule already in the contract.
5. **A notes field that accepts voice dictation** and does not block save.
6. **Photo optional**, following Badger's check in model. A photo of a sign is faster than typing an
   address.
7. **Save returns to where you were**, and shows an undo affordance, not a confirmation dialog.
8. **Duplicate detection on the name field**, inline, because a solo rep re adding a business he
   contacted in March is the most likely data error in a 102 record territory.

Target: name, type, save. Three interactions, under ten seconds, one handed, at 380px.

---

## 11. EMPTY AND FIRST RUN STATES

Nielsen Norman Group's three guidelines for empty states in complex applications
([NN/g](https://www.nngroup.com/articles/empty-state-interface-design/)):

1. **Use empty states to communicate system status.** A blank panel makes users unsure whether the
   system is loading or broken. Say "There are no records to display for the selected date range".
2. **Use empty states to provide learning cues.** Their example: "Star your favorites to list them
   here". Contextual, in the moment, more effective than a forced tutorial.
3. **Use empty states to provide direct pathways for key tasks.** An empty alerts panel should carry a
   **Create** button and a **Learn more** link.

This is the one place in this app where a teaching sentence is legitimate, because there is no data on
screen to compete with it and NN/g's guideline 2 exists precisely for it. It is also the escape valve
for the contract's ban on instructional prose: the explanation the owner deleted from the working
screens belongs here, where it appears only when there is nothing else to look at, and disappears the
moment there is.

Concrete empty states this app needs, each one line plus one button:

- **Filtered queue with no matches**: "No organisations match these filters." Button: Clear filters.
- **Conversation tab, no messages**: "No messages yet." Button: Write first message.
- **Offers tab, none**: "No offer extended." Button: Extend offer.
- **Today's queue, cleared**: this is not an empty state, it is a completion state. See section 13.
- **First run**: the 102 organisations are seeded, so the true first run is not empty. The first run
  state should be the queue itself with the top row visibly highlighted, not a welcome modal.

---

## 12. WHERE THE MAP GOES, AND WHAT IT IS FOR

The only product in this research whose map is a documented working surface rather than decoration is
Badger Maps, and it is worth reading closely because it is exactly the owner's job
([Badger Maps](https://www.badgermapping.com/knowledgebase/google-maps-vs-badger-maps-feature-comparison/)):

- **Colorize and filter accounts** on the map "to organize and effortlessly plan your days", by
  priority, type, revenue and custom fields.
- **Lasso**: "circle and select the accounts that you want to visit" and get an optimised route back.
- **Check Ins**: log interaction type, notes and photos in the field, syncing to the CRM.
- **Routing to up to 120 stops** with automatic reordering, against Google Maps' 10 stop manual limit.
- **Lead Generation**: find nearby businesses by category.

None of the CRMs or venue platforms researched here document a map as a primary surface.

**What a map is actually for in a territory tool.** Not visualisation. Three jobs, all of them
answerable only spatially:

1. **What is near me right now that I have not touched?** This is the map's only unique value.
2. **What can I string into one drive?** Route building, the lasso.
3. **Where are the holes in the territory?** Density gaps are visible on a map and invisible in a
   list.

**Recommendation for this app.** The map is a **view of the same filtered set**, not a separate
section. Same rail, same filters, same counts, toggled between List and Map. Pins carry the same
status glyph and colour as the list rows, colourblind safe. Tapping a pin opens the same record
drawer. Add a proximity sort ("near me") to the list, which delivers most of the map's value without
requiring the map to be good. Do not build routing.

---

## 13. DENSITY AND TYPOGRAPHY

The measured conventions.

**IBM Carbon data table row heights**
([Carbon](https://carbondesignsystem.com/components/data-table/style/)):

| Size | Height |
|---|---|
| Extra small (xs) | 24px |
| Small (sm) | 32px |
| Medium (md) | 40px |
| Large (lg) | 48px |
| Extra large (xl) | 64px |

Type in the same spec: table header 20px regular 400; column header 14px semibold 600; row text 14px
regular 400. Column padding 16px left and right; sort icon padding 8px. Header and row text is
vertically centred in the row at all sizes except extra large.

**Salesforce Comfy versus Compact**
([Salesforce](https://developer.salesforce.com/blogs/2018/08/new-density-settings-for-the-lightning-experience-ui-in-winter-19)):
Comfy is "a spacious view with labels on the top of fields and more space between page elements";
Compact is "a denser view with labels to the left of fields and less space between page elements".
Compact reduces padding, margins and line height, moves record detail labels from top aligned to left
aligned, and reduces title font sizes. The measured result: **30 percent more information density on
record details, 20 percent more vertical density on related list cards**, reaching parity with the
older Salesforce Classic interface. It is a per user setting.

**What this app is probably violating.** An interface that "reads like an essay" almost always fails
on the same four axes:

1. **Row height.** A prospect list row should be 40px to 48px on desktop. If rows are 72px or taller
   with stacked description text, the screen shows 8 organisations where it should show 18.
2. **Line height on data.** Body copy line height (1.5 to 1.6) applied to table rows is the single
   most common cause of an essay feel. Data rows want 1.2 to 1.35.
3. **Type scale range.** A working tool needs roughly four sizes total: a page title, a section or
   column header, a body or row size (14px), and a meta size (12px). If the app has six or more sizes
   with 16px or 18px body text in list contexts, it reads as a document. Carbon's tables run 14px for
   both column headers and row text, distinguished by weight (600 versus 400), not size.
4. **Label to field ratio.** Salesforce's Compact mode moves labels beside fields rather than above
   them. Stacked label over value in a record drawer doubles vertical cost per fact. At six highlight
   facts that is the difference between one screen and two.

Additional conventions worth holding to:

- **Tabular numerals** for all counts, currencies and day counts, so columns of numbers align.
- **One weight change carries hierarchy**, not a size change, inside dense regions.
- **Status as a chip at 12px** with a glyph, not a full width coloured band.
- Keep the 44px touch target rule from the contract for **interactive targets on touch**, while
  allowing 40px desktop rows. These are not in conflict: the row is 40px, the tap target on mobile
  expands.
- **Zebra striping is not needed** below about 8 columns; a 1px divider is enough and is quieter.

---

## WHAT TO STEAL

Each item names its source and why it fits a one person territory tool.

1. **Sort the home queue by activity urgency in four tiers, ranking "no next step" above "scheduled
   for later".** From [Pipedrive](https://support.pipedrive.com/en/article/how-are-deals-ordered-in-the-pipeline-view).
   A solo rep's only real enemy is forgetting, and this ordering puts the forgotten records at eye
   level for free.

2. **A named decay timer, per stage, with a red tile and a documented reset rule.** From
   [Pipedrive Rotting](https://support.pipedrive.com/en/article/the-rotting-feature). It answers "when
   to book them" without the rep maintaining anything, and per stage thresholds let a held date be
   urgent at 3 days while a cold prospect is fine at 21.

3. **Six highlight widgets above the fold on the record, everything else behind tabs.** From
   [Attio](https://attio.com/help/reference/managing-your-data/records/configure-record-pages). The
   owner asked for four facts; six is the researched ceiling before a record becomes a form.

4. **Statuses that set themselves from evidence.** Perfect Venue's Proposal Sent and Confirmed fire
   automatically on send and on signature or deposit
   ([Perfect Venue](https://help.perfectvenue.com/knowledge/event-statuses-explained)). One person
   with no manager will not maintain a pipeline by hand; the pipeline must maintain itself where it
   can.

5. **Lost demands a reason, then leaves the working set without being deleted.** From
   [Tripleseat](https://support.tripleseat.com/hc/en-us/articles/15865184047127-Converting-Leads-into-Bookings)
   and [Perfect Venue](https://help.perfectvenue.com/knowledge/event-statuses-explained). A territory
   of 102 is small enough that every loss is a lesson, and losing them silently makes the board lie.

6. **The Instantly reply taxonomy, especially Out of Office and Wrong Person.** From
   [Instantly](https://help.instantly.ai/en/articles/7251329-subsequences). Schools go dark in summer
   and chains route decisions off site; both need a flag that means requeue, not reject.

7. **Snooze as a first class verb, with a Future lane.** From [Close](https://help.close.com/docs/inbox).
   It is the only honest way to clear a queue without pretending work is done.

8. **A triage lane for messages from unknown senders, with attach or create.** Close's Potential
   Contacts ([Close](https://help.close.com/docs/inbox)). The owner is scouting, so replies will
   arrive from organisations not yet on the board.

9. **Tentative means holds space; Prospect may overlap.** From
   [Tripleseat](https://support.tripleseat.com/hc/en-us/articles/15865184047127-Converting-Leads-into-Bookings).
   Encoding soft versus hard at the data layer lets a date hold be shown honestly rather than as
   another colour.

10. **One by one task mode with next and previous, and a Mark as Complete button.** From
    [Apollo](https://knowledge.apollo.io/hc/en-us/articles/45138622305549-Organize-and-Complete-Tasks).
    A runner beats a list for a daily burndown, and it makes the loop feel like a tool with a rhythm.

11. **Explain the ranking on hover.** Apollo's "Recommendation" hover explains why a task was
    prioritised
    ([Apollo](https://knowledge.apollo.io/hc/en-us/articles/45138622305549-Organize-and-Complete-Tasks)).
    This app already has a provenance habit; extending it to the sort turns an opaque list into a
    defensible one, and it belongs in a work sample.

12. **OR within a facet, AND across facets.** From [Front](https://help.front.com/en/articles/2243).
    Makes the multi select rail behave the way people already expect without a word of explanation.

13. **Filter state in the URL and a removable chip summary bar.** Composite of Front and Attio
    ([Attio](https://attio.com/help/reference/managing-your-data/views/filter-and-sort-views)). At 102
    records, an unnoticed active filter is the most likely confusion.

14. **Favourite a filter combination rather than build saved views.** From
    [Pipedrive](https://support.pipedrive.com/en/article/pipeline-view). Right sized for a single
    user; three to five pins covers the territory.

15. **Colour plus glyph plus direction on every status indicator.** Pipedrive uses a red arrow, a
    green arrow, a yellow warning and a grey arrow
    ([Pipedrive](https://support.pipedrive.com/en/article/how-are-deals-ordered-in-the-pipeline-view)).
    Required by the owner's colourblindness and already the market convention.

16. **One required field on add, default stage assigned automatically.** From
    [HoneyBook](https://help.honeybook.com/en/articles/2209203-start-or-edit-projects-with-the-app),
    whose mobile projects land in Inquiry with "you can add them later" as explicit policy. He is
    standing on a sidewalk.

17. **Field check in with type, note and photo.** From
    [Badger Maps](https://www.badgermapping.com/knowledgebase/google-maps-vs-badger-maps-feature-comparison/).
    Turns a drive past a bowling league sponsor into a logged touch.

18. **Colorize and filter pins by the same fields as the list; one lasso to select a set.** From
    [Badger Maps](https://www.badgermapping.com/knowledgebase/google-maps-vs-badger-maps-feature-comparison/).
    Makes the map a view of the working set instead of a decoration, which is what the contract's
    "must feel legitimate" actually requires.

19. **Timeline filtered by event type, filter remembered.** From
    [Attio](https://attio.com/changelog/2026/new-activity-timeline). Keeps a two year conversation
    history readable.

20. **40px rows, 14px row text, 14px semibold column headers, 16px column padding.** From
    [Carbon](https://carbondesignsystem.com/components/data-table/style/). Concrete numbers that fix
    the essay feel with no design debate.

21. **Empty states that state system status, teach one thing, and carry the button.** From
    [NN/g](https://www.nngroup.com/articles/empty-state-interface-design/). This is where the deleted
    instructional prose is allowed to live.

---

## WHAT NOT TO COPY

These products are built for teams with managers and quota rollups. This is one person with a
territory. Deliberately omit:

1. **Owner and assignee everywhere.** Pipedrive's card shows owner
   ([Pipedrive](https://support.pipedrive.com/en/article/pipeline-view)); Front views filter by up to
   50 assignees ([Front](https://help.front.com/en/articles/2243)). There is one person. Every
   assignee control is a dead pixel.

2. **Shared versus private views.** Front and Attio both distinguish them
   ([Attio](https://attio.com/help/reference/managing-your-data/views/filter-and-sort-views)). There is
   nobody to share with. Every view is his.

3. **Multiple pipelines and a pipeline selector dropdown.** Pipedrive needs it for teams selling
   different products. One venue, one loop.

4. **Weighted forecast, probability per stage, expected close value rollups.** These exist to let a
   manager predict a quarter. He needs to know who to call, not what the quarter will be. The
   contract's two ledger rule already resists this.

5. **Leaderboards and team activity feeds.** A leaderboard with one person on it is a mirror.

6. **Deep stage counts.** Tripleseat's five booking statuses and Perfect Venue's seven are for
   venues with multiple event types, room blocks and F and B minimums
   ([Tripleseat](https://support.tripleseat.com/hc/en-us/articles/15865184047127-Converting-Leads-into-Bookings)).
   Eight stages plus two overlays is already the ceiling here. Do not add "Contract Sent" and
   "Awaiting Signature" as separate stages.

7. **Guest room blocks, F and B minimums per event, banquet event orders.** Documented Tripleseat
   features that belong to hotels. Out of scope.

8. **Nested and/or filter groups.** Attio's nesting is for thousands of records across a data model.
   At 102, it is a feature nobody will open twice.

9. **Bulk reassign and bulk archive as primary actions.** Apollo offers both
   ([Apollo](https://knowledge.apollo.io/hc/en-us/articles/45138622305549-Organize-and-Complete-Tasks)).
   Bulk complete is useful; bulk reassign is meaningless.

10. **A separate mobile information architecture.** The contract already commits to 380px as a real
    layout. One responsive tool, not a phone app with fewer features.

11. **Route optimisation.** Badger's 120 stop optimiser is a real engineering product. Building a bad
    version is worse than not having one; proximity sort delivers most of the value.

12. **Sequence automation that sends on its own.** Instantly and lemlist automate at volume. At 102
    organisations in one town where he will meet these people at chamber events, every message should
    be reviewed. Draft assistance yes; autonomous sending no.

13. **A welcome modal or product tour on first run.** The data is seeded, so there is nothing to
    onboard past.

---

## THE DAILY LOOP: PROGRESS WITHOUT A TOY

The owner said "fun to use like u want to use it with daily quests etc". The contract already reads
that correctly: "Points for their own sake would be a toy. Progress against real work is a product."
The research supports that reading precisely, and sharpens it.

### The evidence

**Duolingo streaks work through loss aversion and identity, and they need mercy.** The four rules from
Yukai Chou's analysis: streaks convert effort into identity so "breaking it feels like breaking the
self"; users are motivated more by protection than progression, "users aren't pushing the streak
forward, they're protecting it from collapse"; rewards should ramp up; and there must be a gentle ramp
down rather than a reset to zero. Repair mechanics (streak freeze, weekend amulet, recovery windows)
are described as "mercy infrastructure". The warning is explicit: streaks are Black Hat gamification
that "can leave users feeling trapped rather than empowered", and they fail when "the streak becomes
the point and the learning fades"
([Yukai Chou](https://yukaichou.com/gamification-study/master-the-art-of-streak-design-for-short-term-engagement-and-long-term-success/)).

**Apple's rings are three, they reset daily, and one of them is user adjustable.** Move (active
calories), Exercise (30 minutes at or above a brisk walk), Stand (moving at least 1 minute during 12
different hours). Move is adjustable in the Activity app via Change Move Goal, and the watch
"recommends a new Move goal specifically tailored to your activity" each week
([Apple](https://www.apple.com/watch/close-your-rings/)).

Three things make rings work: **they are not a score, they are a shape that completes**; **they are
absolute and daily, so today is winnable regardless of yesterday**; and **the goal adapts to the
person**, which means the target is never insulting in either direction.

**Todoist Karma shows both the right and the wrong instincts.** Right: it has a **vacation mode** that
keeps "Karma and streaks intact" when goals are missed, and it can be **turned off entirely** in
Settings > Productivity. Wrong, for this app: you earn Karma for **adding tasks** and for **using
labels, recurring dates and reminders**, and you **lose points for tasks four or more days overdue**,
across eight levels from Beginner (0 to 499) to Enlightened (50,000 plus)
([Todoist](https://www.todoist.com/help/articles/introduction-to-karma-OgWkWy)).

Rewarding a user for adding tasks and for using features rewards the appearance of work. Punishing
overdue tasks punishes an honest backlog. Both are exactly the failure this app must avoid.

**Superhuman is the best model for a professional tool's reward moment.** It shows a full bleed
photograph at Inbox Zero, on the reasoning that "fun can be defined as 'pleasant surprise'" and that
imagery can "alter your mood, transform your product experience, and even reinforce habits and
workflows" ([Superhuman](https://blog.superhuman.com/how-superhuman-chooses-inbox-zero-images/)).

The critical detail: the reward is **aesthetic, not numeric**. There is no score. There is a moment.
It arrives only when the real work is genuinely finished, and it costs the user nothing.

**Apollo already ships a professional daily loop with no game layer at all**: a Tasks queue grouped by
due date, a Recommended subset explained on hover, a one by one runner with Mark as Complete and
navigation arrows
([Apollo](https://knowledge.apollo.io/hc/en-us/articles/45138622305549-Organize-and-Complete-Tasks)).
That is the same loop as a daily quest with none of the costume.

**And the canonical objection.** Ian Bogost's argument is that points, badges, levels and leaderboards
are "mere gestures that provide structure", that gamification's promise is "Just add badges! Just add
leaderboards!", and that what organisations actually offer are "shams, counterfeit incentives that
neither provide value nor require investment". His replacement term is **exploitationware**
([Bogost](https://www.gamedeveloper.com/design/persuasive-games-exploitationware)).

That is the line. A mechanic is legitimate when the thing being counted is the thing the user came to
do. It is exploitationware when the count is a proxy invented to drive sessions.

### The recommendation

**Build three daily rings, not points, not badges, not levels, not a streak counter as the primary
mechanic.**

Three rings, because Apple proved three is legible at a glance and each is a different kind of effort.
Rings, because a ring completes; a score never does, and a score invites comparison to nothing.

The three rings, each measuring real prospecting work:

1. **Touches.** Organisations contacted today. Default target 8, adjustable, and auto suggested weekly
   from his own trailing average, following Apple's adaptive Move goal.
2. **Replies handled.** Inbound messages triaged to a status today. Target is not fixed; it is
   whatever arrived. This ring is **conditional**: if nothing came in, the ring is closed by default,
   not empty. Never punish him for a quiet inbox.
3. **Stale cleared.** Records that were over their Rotting threshold this morning and are not now.
   Target 3. This is the ring that does the actual product work, because it converts the decay timer
   into a daily objective.

Placement: a compact strip in the top right of the home screen, roughly 120px tall, three small rings
plus a number each. Never a full width hero. Clicking a ring filters the queue below to exactly the
records that would close it. That is the whole trick, and it is what separates a progress mechanic
from a scoreboard: **the mechanic is a filter, so engaging with it does work.**

Around the rings:

- **A day is always winnable.** Rings reset at local midnight. Yesterday is never a debt.
- **A completion moment when all three close.** Superhuman's model: one quiet full width visual state
  in the queue area where the list used to be, plus the day's real numbers in plain figures. No
  confetti, no sound, no character. Then the strip collapses to a single closed indicator.
- **Weekends and closures do not count.** The territory is schools and businesses; Saturday touches
  are not expected. Follow Todoist's vacation mode and the streak freeze principle: a missed Saturday
  is not a miss.
- **A weekly streak of completed weeks, not days**, shown as a small secondary number, with an
  explicit repair: one missed day per week is forgiven automatically. Chou's "mercy infrastructure".
- **The whole strip has an off switch**, exactly as Todoist Karma does. A professional tool that
  cannot be told to stop keeping score is not a professional tool.
- **The targets are stated in work units, never in points.** "8 touches", not "80 XP".

Two things worth adding because they are real work and read as quests without costume:

- **A weekly territory sweep**: "12 organisations in Brea untouched for 30 days." That is a genuine
  prospecting objective and it is a saved filter with a count.
- **A held date watch**: "2 holds expiring this week." Nothing in a bowling venue's pipeline is more
  urgent, and surfacing it daily is worth more than any streak.

### The failure modes, named

1. **Pointsification.** A currency with no referent. Bogost's "counterfeit incentives that neither
   provide value nor require investment"
   ([Bogost](https://www.gamedeveloper.com/design/persuasive-games-exploitationware)). If the number
   has a unit like "points" or "XP", it has already failed. Count touches, replies, holds.

2. **Rewarding input instead of outcome.** Todoist grants Karma for **adding** tasks and for using
   labels and reminders
   ([Todoist](https://www.todoist.com/help/articles/introduction-to-karma-OgWkWy)). Ported here, that
   would reward adding prospects and typing notes: an app that pays him to inflate his own board.
   Only count contact made, replies handled, and stale cleared.

3. **Punishment for honesty.** Todoist deducts Karma for tasks four or more days overdue. In a
   prospecting CRM that creates a direct incentive to delete or falsely close records that are not
   moving, which corrupts the only dataset he has. Never subtract. Stale records are surfaced, never
   penalised.

4. **The unlosable streak becoming the product.** Chou's warning: "the streak becomes the point and
   the learning fades", and streaks that "leave users feeling trapped rather than empowered". A
   400 day streak on a prospecting tool is a hostage situation. Weekly streaks with automatic repair,
   capped visual prominence, and no notification that says the streak is at risk.

5. **Insulting targets.** A fixed 8 touches per day is wrong on the week he is running a tasting
   event and wrong on a slow Tuesday. Apple recalculates the Move goal weekly from actual behaviour
   ([Apple](https://www.apple.com/watch/close-your-rings/)). Do the same, and always let him set it
   manually.

6. **Toy vocabulary in a business tool.** "Quests", "levels", "badges", "achievements", "streak
   saver", mascots, celebratory characters, sound. He will open this in front of a general manager.
   The words on screen are "Today", "Touches", "Replies", "Stale cleared". The mechanic can be
   playful; the language cannot be childish.

7. **Celebration that interrupts.** A modal on completion blocks the next action. Superhuman's reward
   occupies the space the work vacated
   ([Superhuman](https://blog.superhuman.com/how-superhuman-chooses-inbox-zero-images/)). It is
   passive and dismissible by doing anything else.

8. **Gamifying a metric he does not control.** Bookings are the outcome; touches are the input he
   controls. A ring for "bookings today" would be zero on almost every day and would train him to
   ignore the strip. Rings measure effort. The ledger measures results, and per the contract they are
   never summed.

9. **No off switch.** Any mechanic that cannot be disabled reads as manipulation the first time it
   asks for something at a bad moment.

10. **Colour only progress.** Rings are the classic offender. Each ring needs its number and its label
    beside it, per the contract's colourblind rule. A ring at 100 percent must also read "8 of 8" and
    carry a closed glyph.

---

## SOURCES

- Tripleseat, Converting Leads into Bookings: https://support.tripleseat.com/hc/en-us/articles/15865184047127-Converting-Leads-into-Bookings
- Tripleseat, lead form and lead management ecosystem: https://tripleseat.com/articles/everything-you-need-to-know-about-the-tripleseat-lead-form/
- Perfect Venue, Event Statuses Explained: https://help.perfectvenue.com/knowledge/event-statuses-explained
- HoneyBook, Customize your pipeline: https://help.honeybook.com/en/articles/2463528-customize-your-pipeline-in-honeybook
- HoneyBook, Start or edit projects with the app: https://help.honeybook.com/en/articles/2209203-start-or-edit-projects-with-the-app
- Pipedrive, Pipeline view: https://support.pipedrive.com/en/article/pipeline-view
- Pipedrive, Pipeline view: how to prioritize deals: https://support.pipedrive.com/en/article/how-are-deals-ordered-in-the-pipeline-view
- Pipedrive, The Rotting feature: https://support.pipedrive.com/en/article/the-rotting-feature
- Close, Inbox: https://help.close.com/docs/inbox
- Attio, Configure record pages: https://attio.com/help/reference/managing-your-data/records/configure-record-pages
- Attio, Filter and sort views: https://attio.com/help/reference/managing-your-data/views/filter-and-sort-views
- Attio, New activity timeline: https://attio.com/changelog/2026/new-activity-timeline
- Apollo, Organize and Complete Tasks: https://knowledge.apollo.io/hc/en-us/articles/45138622305549-Organize-and-Complete-Tasks
- Apollo, Email Reply Classification Done Right: https://www.apollo.io/tech-blog/email-reply-classification-done-right
- Instantly, Subsequences (lead statuses): https://help.instantly.ai/en/articles/7251329-subsequences
- lemlist, Understanding lead statuses: https://help.lemlist.com/en/articles/8000399-understanding-lead-statuses-a-comprehensive-guide
- Front, Views: https://help.front.com/en/articles/2243
- Badger Maps, Google Maps versus Badger Maps: https://www.badgermapping.com/knowledgebase/google-maps-vs-badger-maps-feature-comparison/
- IBM Carbon, Data table style: https://carbondesignsystem.com/components/data-table/style/
- Salesforce, New Density Settings for Lightning Experience: https://developer.salesforce.com/blogs/2018/08/new-density-settings-for-the-lightning-experience-ui-in-winter-19
- Nielsen Norman Group, Designing Empty States in Complex Applications: https://www.nngroup.com/articles/empty-state-interface-design/
- Todoist, Introduction to Karma: https://www.todoist.com/help/articles/introduction-to-karma-OgWkWy
- Yukai Chou, Streak design: https://yukaichou.com/gamification-study/master-the-art-of-streak-design-for-short-term-engagement-and-long-term-success/
- Apple, Close Your Rings: https://www.apple.com/watch/close-your-rings/
- Superhuman, How Superhuman chooses Inbox Zero images: https://blog.superhuman.com/how-superhuman-chooses-inbox-zero-images/
- Ian Bogost, Persuasive Games: Exploitationware: https://www.gamedeveloper.com/design/persuasive-games-exploitationware

**Explicitly not verified**, and therefore not described: Event Temple, Priava and Momentus screen
level interfaces; Streak and Folk record and pipeline layouts; Clay's list to sequence screens;
HoneyBook's default stage names and card layout; Help Scout and Missive screen detail; Apollo's user
facing presentation of reply classifications; Salesforce Lightning's exact pixel values for Comfy
versus Compact.
