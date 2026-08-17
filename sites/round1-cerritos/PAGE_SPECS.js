export const meta = {
  name: 'me-scout-build',
  description: 'Build The Opening Book app for Main Event Brea by reskinning the Ole Smoky territory app',
  phases: [
    { title: 'Foundation' },
    { title: 'Pages' },
  ],
}

const ROOT = '/tmp/work/me-prospecting'

const BRIEF = `
You are working in a React 18 + TypeScript + Vite app at ${ROOT}.

## WHAT THIS APP IS

It is called THE OPENING BOOK. It is an independent work sample built by Nathan J. Song (Jay) for a
Sales Manager application at MAIN EVENT BREA, and it will be published at nathanjsong.com/me/scout.

THE CENTRAL FACT: Main Event Brea IS NOT OPEN YET. mainevent.com publishes an address
(245 W Birch Street, Brea CA 92821), a phone number ((657) 530-1177), "more than 26 lanes",
laser tag, Gravity Ropes, over 100 games, private party rooms and dedicated meeting space, and a
"Coming soon" banner with an opening-interest form. It publishes NO hours and NO opening date.

So there is no client base, no walk-in traffic, no CRM history. The job posting's first daily
responsibility is "Perform outbound lead-generating activities outside the building, including
tabling, networking events, and go-sees with prospective and current customers." This app is the
tool for exactly that: build the book before the doors open.

## THE CODEBASE

This was FORKED from a previous, extremely well-regarded work sample (an Ole Smoky Distillery
territory planning app). The design system, CSS tokens and code-comment culture are inherited and
must be honoured. Read these files FIRST and match them exactly:

- ${ROOT}/src/domain/types.ts        the domain model, heavily commented. Read all of it.
- ${ROOT}/src/domain/lanes.ts        the eight prospecting lanes
- ${ROOT}/src/data/packages.ts       real Main Event packages, sourced
- ${ROOT}/src/data/venue.ts          the venue, periods, offers
- ${ROOT}/src/data/prospects.ts      69 real Brea-area organisations (read the header + a few rows)
- ${ROOT}/src/data/prospectStatus.ts the fact table
- ${ROOT}/src/data/book.ts           seed book lines, activity lines, replies
- ${ROOT}/src/state/PipelineProvider.tsx
- ${ROOT}/src/state/BookProvider.tsx
- ${ROOT}/src/domain/selectors/desk.ts
- ${ROOT}/src/domain/selectors/capacity.ts
- ${ROOT}/src/styles/tokens.css      the design tokens. Use the CSS variables, never raw hex.
- ${ROOT}/src/styles/base.css
- ${ROOT}/src/app/App.tsx            the route table

## NON-NEGOTIABLE RULES

1. **NO EM DASHES, NO EN DASHES, NO ARROWS (-> or =>) IN ANY HUMAN-READABLE TEXT.** Not in UI copy,
   not in code comments. Use a comma, a full stop, or a semicolon. This is a standing rule from the
   owner of this site and it is checked. (=> in actual TypeScript arrow functions is fine, obviously.)
2. **COLOUR IS NEVER THE ONLY SIGNAL.** The owner is colourblind. Every status carries a GLYPH and a
   WORD alongside any colour. A legend keyed only by swatch is a bug.
3. **EVERY COMMERCIAL NUMBER CARRIES PROVENANCE.** Use the ProvenanceBadge primitive. The provenance
   values are: public, illustrative, modeled, observed, user_input, withheld. "withheld" is special
   and important: it means Main Event deliberately does not publish that figure. A withheld price
   renders as the SENTENCE "Main Event does not publish this", never as a number.
4. **INVENT NOTHING ABOUT MAIN EVENT.** Every package name, price, guest minimum, day-part
   restriction and attraction in data/packages.ts and data/venue.ts came off mainevent.com on
   11 August 2026 and carries a source URL. Do not add a price, a lane count, a room capacity or an
   attraction that is not already in those files. If you need a figure that is not there, say
   plainly on screen that it is not published.
5. **NO INVENTED PEOPLE.** Roles and titles only ("Assistant Principal for Activities", "Sales
   Manager"). Never a made-up human name.
6. **BRITISH-ISH SPELLING IN PROSE**, matching the inherited codebase: colour, behaviour,
   organisation, neighbourhood, recognised, modelled is written "modeled" only as the type literal.
7. **DEMO MODE IS STRUCTURAL.** There is no email transport anywhere in the dependency tree. Sending
   writes a row to the outbox. The demo recipient is DEMO_RECIPIENT from data/venue.ts.
8. **DISCLAIMER.** This is an unaffiliated work sample. No Main Event logo, wordmark or trade dress.

## THE CODE COMMENT CULTURE (this is the single most distinctive thing about this codebase)

Files open with a block comment that explains WHY the file exists and what failure it prevents, in
confident plain prose, often several paragraphs. Non-obvious decisions get their own comment
explaining the alternative that was rejected and why. Read domain/types.ts and domain/lanes.ts and
match that register precisely. Do not write "// set the state" comments. Write comments a hiring
manager would stop and read.

## STYLE / CSS

- CSS Modules, one .module.css per component, same filename.
- Use the CSS custom properties in tokens.css: --surface-0..3, --text-0..3, --accent, --brand-gold,
  --ok/--warn/--risk/--info/--neutral and their -tint variants, --lane-schools, --lane-colleges,
  --lane-fitness, --lane-corporate, --lane-auto, --lane-hospitality, --lane-faith, --lane-healthcare
  (each with a -tint), --fam-corporate/--fam-youth-group/--fam-self-serve/--fam-buyout/
  --fam-fundraiser (each with -tint), --ledger-revenue, --ledger-activity, --prov-* including
  --prov-withheld, --line, --line-2, --line-strong, --radius-*, --shadow-*, --space-1..8,
  --step--2..--step-5, --font-ui, --font-mono, --font-operator, --z-*.
- Register: enterprise software, cool paper ground, hairline rules, one hot amber doing the
  editorial work. Restrained. No gradients, no glows, no pulsing dots, no drop shadows doing
  structural work. Hairlines and type hierarchy carry it.
- Responsive down to 380px. Real focus states. Semantic HTML. aria-labels on icon-only controls.

## TYPESCRIPT

Strict mode is on. Run \`npx tsc -b --pretty\` in ${ROOT} before you finish and fix every error in
the files YOU wrote. Do not fix errors in files owned by other agents (other pages may not exist
yet, that is expected and fine).

## YOUR OUTPUT

Write real files with the Write tool. Return a SHORT summary (under 150 words) of what you created
and any contract you expect other agents to honour. Do not paste file contents back.
`

phase('Foundation')

const foundation = await agent(
  `${BRIEF}

## YOUR TASK: THE FOUNDATION. Every page agent depends on you, so be exact.

Create or rewrite these files:

### 1. ${ROOT}/src/components/primitives/ProvenanceBadge.tsx (+ .module.css)
Rewrite the existing one to handle the SIX provenance values in domain/types.ts, including the new
"withheld". Export both a small inline badge and a helper that renders a withheld FIGURE as the
sentence "Main Event does not publish this". Colours from --prov-*.

### 2. ${ROOT}/src/components/primitives/LaneChip.tsx (+ .module.css)
A chip showing a lane: its glyph, its short label, its colour. Calendar-locked lanes get a POINTED
cap, discretionary lanes get a SQUARE one, so the two classes survive greyscale. Size variants sm/md.

### 3. ${ROOT}/src/components/primitives/StatusChip.tsx (+ .module.css)
For PitchStatus (unworked, reached-out, conversation, soft-hold, booked, lost) and for
EmailConfidence (verified_public, form_only, none). Glyph plus word plus colour, always all three.

### 4. ${ROOT}/src/domain/vocabulary.ts
ONE vocabulary for the whole app, modelled on the file it replaces. Export StatusToken
{glyph,label,cssVar} records for: PITCH_STATUS, PITCH_STATUS_SHORT, EMAIL_CONFIDENCE,
ACTIVITY_TYPE (with a label and glyph for each of tabling, networking-event, go-see, call-block,
email-sequence, venue-tour), REPLY_DISPOSITION, and PACKAGE_FAMILY (label, cssVar, tintVar, note)
plus PACKAGE_FAMILY_ORDER. Open with a block comment explaining why one vocabulary file exists (the
same fact must never have four names across four screens a reader walks through in one session).

### 5. ${ROOT}/src/components/primitives/PinMark.tsx (+ .module.css)
Replace JarMark. A small hand-drawn SVG mark for the app: a bowling pin with a countdown ring
around it, drawn in CSS-variable colours, \`fill\` prop 0..1 showing how full the opening book is.
It must be an ORIGINAL simple geometric mark, not a Main Event logo. Keep JarMark's prop signature
(size, fill) so the shell can swap it in. DELETE JarMark.tsx and JarMark.module.css.

### 6. ${ROOT}/src/components/primitives/Wordmark.tsx and FamilyChip.tsx and PackageGlyph.tsx
Rewrite or delete these as appropriate. Wordmark should render a prospect name with its lane chip.
FamilyChip should render a PackageFamily. PackageGlyph should render a package family glyph. If a
file no longer earns its place, delete it and say so.

### 7. ${ROOT}/src/state/ObjectionProvider.tsx
Replaces IssueProvider. Holds an OBJECTION REGISTER: the objections a pre-opening venue actually
hits, each with a disposition the user can set. Seed it from a new file
${ROOT}/src/data/objections.ts that you also write, containing at least these real ones, each with
id, the objection in the buyer's own voice, which lanes raise it, the answer that works, and what
it costs the venue to answer that way:
  - "no-opening-date" ("you do not have an opening date, how can I book a June grad night")
  - "already-committed" (Fairway Ford's real answer: contracted at a hotel for three years)
  - "cannot-tour" ("I am not signing for a venue I have not walked")
  - "no-published-price" ("your website will not tell me what it costs") <- this one is the most
    important; it is Main Event's own deliberate gating, and the honest answer is that the price
    comes from a person and here is that person
  - "unproven-venue" ("no reviews, no photos, nobody has been")
  - "budget-next-fiscal"
  - "we-use-dave-and-busters" (same parent company; the honest answer is interesting)
Provide the provider with actions to set a disposition (open / answered / lost-to-it) and a note.

### 8. ${ROOT}/src/state/OutboxProvider.tsx
Adapt the existing one to the new domain: outbox entries are outreach emails and group quotes to
PROSPECTS, not orders to distributors. Keep the structural no-transport guarantee and say so in the
file comment.

### 9. ${ROOT}/src/lib/email/templates.ts and ${ROOT}/src/lib/links.ts
Rewrite for the new domain. links.ts exports quoteLink(prospectId) built off import.meta.env.BASE_URL.
templates.ts builds the actual outreach email bodies, and it must branch on the LANE and on the
OPENING STATUS: the email to a school activities director whose grad night is locked to a date reads
completely differently from the one to an HR manager who has not decided to have a party at all.
Write four to six real templates. They must sound like a person wrote them: direct, specific, short,
no "I hope this email finds you well", no "excited to announce", no exclamation marks.

### 10. ${ROOT}/src/app/AppShell.tsx (+ .module.css) and ${ROOT}/src/app/MegaNav.tsx (+ .module.css)
The shell: brand mark (PinMark) plus "The Opening Book" plus a sub-line reading
"Main Event Brea, 245 W Birch St", a context strip with the PERIOD selector (PERIODS from data/venue),
a COUNTDOWN reading "12 weeks to open" derived from the selected period's weeksToOpen, the MegaNav,
and the ResetControl. Keep the fixed Demo Mode badge and the footer disclaimer.

THE MEGANAV IS FIVE TABS AND MUST STAY FIVE. Model it on the inherited MegaNav: five stages of one
motion, in order, each panel carrying a live number for that stage so the nav doubles as the status
of the week. Opens on hover AND focus, closes on Escape and blur out, with a short grace period.
  1. "/"        Desk      stage 1  "Who do I contact today?"    live number: unworked prospects
  2. "/map"     Trade area stage 2 "Where are they?"            live number: prospects within 3 miles
  3. "/lanes"   Lanes     stage 3  "What do we sell into each?" live number: 8 lanes / packages gated
  4. "/book"    Book      stage 4  "What is actually signed?"   live number: contracts, and hours out
  5. "/replies" Replies   stage 5  "What did they say back?"    live number: replies received
Each panel also lists its secondary destinations as small links:
  Desk panel -> /sent, /objections
  Trade area panel -> /field
  Lanes panel -> /packages
  Book panel -> /book/week, /calendar, /coaching
  Replies panel -> /method
Use the selectors in domain/selectors/desk.ts for the live numbers (unworkedCount,
liveConversationCount, emailableCount, doorOnlyCount) and BookProvider's revenueTotals and
activityTotals.

Also update ResetControl and StartOver to talk about the pipeline rather than the plan.

Return the exact export names of everything you created so the page agents can import correctly.`,
  { label: 'foundation', phase: 'Foundation' }
)

phase('Pages')

const PAGES = [
  {
    key: 'DeskPage',
    label: 'desk',
    spec: `${ROOT}/src/pages/DeskPage.tsx (+ .module.css) and ${ROOT}/src/components/prospect/ProspectDrawer.tsx (+ .module.css).

THE DESK IS THE FRONT DOOR of the whole app and the first thing a hiring manager sees. It answers
"who do I contact today, and why that one".

Use deskLines() from domain/selectors/desk.ts. Layout:
- A short header: what this screen is, in two sentences, in the voice of the codebase.
- A KPI strip: prospects on the board (69), publishing an email we actually read (30), never touched,
  live conversations, contracts signed. Each with a ProvenanceBadge.
- Filter row: the eight lanes as LaneChips (toggle), a search box, and an "publishes an email" toggle.
  Wire to PipelineProvider (TOGGLE_LANE, SET_QUERY, TOGGLE_EMAILABLE_ONLY, CLEAR_LANES).
- The ranked list. Each row: rank number, prospect name, LaneChip, StatusChip, decision maker title,
  the email or "contact form only" or "no written door", distance in straight-line miles, the
  modeled headcount range, and THE NEXT ACTION in plain words. Clicking a row opens the drawer.
- Each row must be able to EXPAND to show its SCORE BREAKDOWN: the components array from the
  selector, each with label, points and the "why" sentence. A ranking a reader cannot interrogate is
  a ranking they are being asked to take on faith. Make this genuinely good; it is the most
  persuasive thing on the page.
- Row actions: "Record touch" (RECORD_TOUCH) and "Advance" (SET_STATUS).

THE DRAWER: everything known about one prospect. Name, address, phone, website, Google rating and
review count with provenance, place id, the email with a CLICKABLE LINK TO THE PAGE IT WAS READ OFF
(emailSourceUrl) which is the single most credibility-earning detail in the app, the decision maker
title, why they fit, the buying window, the modeled headcount range WITH ITS BASIS, the lead package
with its real inclusions and its price or the withheld sentence, how many bowling lanes their event
would consume at the 1-per-20 rule, and a link to their group quote at /quote/:id.`,
  },
  {
    key: 'TradeAreaPage',
    label: 'map',
    spec: `${ROOT}/src/pages/TradeAreaPage.tsx (+ .module.css).

The map. react-leaflet is already a dependency and ${ROOT}/src/lib/map/markerIcons.ts and hull.ts
exist; read them and adapt rather than rewriting from scratch.

Centre on the venue (VENUE.lat, VENUE.lng from data/venue.ts) with a distinct venue marker that
reads as NOT YET OPEN (a dashed ring, a "coming soon" label). Plot all 69 prospects, coloured and
glyphed by lane. Calendar-locked lanes get a pointed marker, discretionary ones a square, so the
split survives greyscale.

Add DRIVE-TIME-ISH RINGS at 1, 3 and 5 straight-line miles, labelled honestly as straight-line and
not driving distance, with a sentence explaining why the distinction matters for planning a go-see
run.

A legend keyed by glyph AND colour AND word. Lane filter chips that drive the same PipelineProvider
state as the desk, so filtering here filters there. Clicking a marker opens a small popup with the
prospect name, lane, decision maker title, whether there is a published email, and a link into the
desk drawer.

Include a "go-see run" panel: the nearest N prospects with NO published email, sorted by distance,
because that is literally the route a rep would drive. Use milesFromVenue and DOOR_ONLY.`,
  },
  {
    key: 'LaneBoardPage',
    label: 'lanes',
    spec: `${ROOT}/src/pages/LaneBoardPage.tsx (+ .module.css).

The eight lanes, as a board. For each lane, using LANE_META from domain/lanes.ts:
its glyph, label, occasion class, the "note" (how it trades), the doorName, and crucially the
preOpeningProblem, which is the single hardest thing about that lane before the doors open.

For each lane show: how many prospects, how many publish an email, how many are untouched, the
modeled total headcount range across the lane, and which PACKAGES fit it (PACKAGES from
data/packages.ts filtered on laneFit) with each package's price or the withheld sentence.

Group the board by occasion class with the two classes visually distinct (cool for calendar-locked,
warm for discretionary) and a short explainer of why that distinction is the app's biggest fork.
Use OCCASION_CLASS_META.

Clicking a lane filters the desk and navigates there.`,
  },
  {
    key: 'PackagesPage',
    label: 'packages',
    spec: `${ROOT}/src/pages/PackagesPage.tsx (+ .module.css).

Everything Main Event actually publishes, and the shape of what it does not.

THE HEADLINE OF THIS PAGE IS THE PATTERN IN THE NULLS. Open with it: Main Event publishes a price
for every product a parent buys alone on a phone at night (birthdays, the $29.99 All-Access Grad
Pack, the $52 MVP Grad Pack, the $19.95 Play It Forward voucher) and publishes NO price for any
corporate or group package, deferring every one of them to "call your local Sales Manager". Brea has
no local sales manager yet. That gap IS the job.

Show PRICED_PACKAGES and GATED_PACKAGES from data/packages.ts as two clearly separated groups with a
count of each. For every package: name, family chip, inclusions, min/max guests, price or the
withheld sentence, day-part eligibility (this is the real weekday lever and deserves emphasis),
booking notice, deposit, lanes per 20 guests, which lanes it fits, and a link to its source URL on
mainevent.com. Every figure carries provenance.

Also surface: STANDARD_TERMS, BANQUET_FLOOR_PER_GUEST ($14, the only F&B figure on the entire site),
the team-building decimal rendering fault (mainevent.com prints "$1995 / Person" which is almost
certainly $19.95 with a stripped decimal, and this app refuses to quote a price it cannot read
cleanly), and the two distinct fundraiser mechanics (Spirit Night at 20% of sales donated back,
versus Play It Forward as a margin-based voucher resale).

Also show NOT_PUBLISHED_FOR_BREA from data/venue.ts with a sentence on why a sales manager who
promises a group an escape room Brea has not announced has created a refund.`,
  },
  {
    key: 'BookPage',
    label: 'book',
    spec: `${ROOT}/src/pages/BookPage.tsx (+ .module.css).

THE TWO LEDGERS. This is the most important conceptual page in the app and the one a GM will judge.

Two ledgers side by side, visually distinct (--ledger-revenue ink treatment versus --ledger-activity
lighter treatment), with a toggle on narrow screens:

LEFT, BOOKED REVENUE: the BookLines. Contract count, guests, revenue, deposits collected. Each line:
prospect, package, guests (editable, SET_GUESTS), price per guest WITH ITS PROVENANCE BADGE, deposit
percent, event date, lanes held. Use revenueTotals from BookProvider.

State prominently, in words, HOW MUCH OF THE TOTAL RESTS ON A PRICE SOMEBODY TYPED
(userPricedRevenue). This is the single most honest number in the application and no pipeline report
ever shows it. Explain why it is there.

RIGHT, OUTBOUND ACTIVITY: the ActivityLines. Shifts, hours, hours OUTSIDE the building specifically,
target conversations, completed. Grouped by week (activityByWeek). Each line: type with its glyph,
location, week, hours, target conversations, lane focus chips, the note. Use activityTotals.

Then the thing that ties them: hoursPerThousandBooked(). Show it, explain that it starts terrible
because the first bookings cost the most work, and that it is the honest way to make activity
legible without letting it pretend to be revenue. Handle the null case properly (nothing booked yet
renders a sentence, never Infinity).

Add a LANE COVERAGE bar from laneCoverage(): hours planned per lane, so a reader can see instantly
that a plan with zero hours against healthcare has a hole in it.

A prominent link to /book/week (the printable week sheet) and to /calendar.`,
  },
  {
    key: 'WeekSheetPage',
    label: 'week sheet',
    spec: `${ROOT}/src/pages/WeekSheetPage.tsx (+ .module.css).

THE ONE PAGE THAT GETS PRINTED AND CARRIED. A single week's outbound sheet, designed to be printed
on one side of A4 and taken out of the building, because that is where this job happens.

Pick the current period's weeks from activityByWeek. For the selected week show:
- The week, the countdown to open, and the hours committed outside the building.
- Each activity: type, location, hours, target conversations, lane focus, and the note.
- The named prospects to hit on each go-see run, with address, phone, decision maker title, and a
  blank line to write what happened. A form a person fills in with a pen.
- The three objections most likely to come up that week (from data/objections.ts) with their answers,
  because a rep standing in a lobby cannot look them up.
- A short "what I am asking for" line per lane, taken from the lane's preOpeningProblem.

There is a print stylesheet at ${ROOT}/src/styles/print.css. Read it and make this page print
beautifully: hide the nav and chrome, black on white, no background fills that waste toner, real
page breaks. Include a visible Print button.`,
  },
  {
    key: 'RepliesPage',
    label: 'replies',
    spec: `${ROOT}/src/pages/RepliesPage.tsx (+ .module.css).

What came back, INCLUDING THE SILENCE AND THE LOSSES. Use SEED_REPLIES via BookProvider.

Group by disposition using the REPLY_DISPOSITION vocabulary: meeting-set, asked-for-info, not-now,
wrong-person, no, no-reply. Each reply: the prospect (with lane chip), what they actually said, when,
the linked objection if any, the next step and when it is due.

Open the page with the argument: a pipeline that records only its wins teaches nobody anything, and
a hiring manager who has run a sales floor looks for the losses first. Fairway Ford is on this page
saying no in their own words, and the reason they gave (contracted at a hotel for three years, come
back in February for the summer push) is the most useful sentence in the file, because a shut
December door and an open June one is a different answer from no.

Add a small "response rate" panel computed honestly from touches versus replies, with provenance,
and a sentence about why a low early response rate is expected for a venue nobody has seen.

Sort next steps by due date into a "this week" list.`,
  },
  {
    key: 'FieldPage',
    label: 'field',
    spec: `${ROOT}/src/pages/FieldPage.tsx (+ .module.css).

OUTSIDE THE BUILDING. This page is named after the job posting's own first bullet and should say so.

Three sections:
1. THE GO-SEE RUN. The prospects with no published email (DOOR_ONLY from data/prospects.ts), sorted
   by straight-line distance from the venue, with address, phone, decision maker title, and lane.
   These organisations cannot be reached any other way, which is the entire argument for the activity.
   Let the user mark a visit as made (COMPLETE_ACTIVITY or RECORD_TOUCH) and record what they found.
2. TABLING. The tabling and networking activity lines, with the reasoning for each location. Make the
   Kraemer Boulevard shift argument explicit: two of Brea's largest single-site employers on the same
   street, one table, one lunch hour, both HR contacts walk past it.
3. THE HOURS LEDGER. Hours outside the building versus hours at a desk, this period, with the point
   that a plan meeting its hours target from a chair has not met it.

Add a form to log a new field activity (ADD_ACTIVITY) with type, location, week, hours, target
conversations and lane focus.`,
  },
  {
    key: 'CapacityPage',
    label: 'capacity',
    spec: `${ROOT}/src/pages/CapacityPage.tsx (+ .module.css).

THE SCREEN THAT STOPS A SALES MANAGER PROMISING THE SAME FRIDAY TO THREE PEOPLE.

Use domain/selectors/capacity.ts. Open by showing the arithmetic and whose it is: Main Event
publishes "1 lane per 20 guests"; Brea publishes "more than 26 lanes"; this app computes against the
published FLOOR of 26 so every figure understates the building and none can oversell it.

Show:
- MAX_SIMULTANEOUS_BOWLERS (520) alongside the published 800+ buyout maximum, and explain plainly
  that both are true and they describe different things.
- packagePressure(): the table of how much of the lane floor each package eats AT ITS OWN PUBLISHED
  MAXIMUM. The 300-guest Corporate All Access Pass taking 15 of 26 lanes, 58% of the floor, is the
  line that makes the point. Render it as a proper horizontal bar per package plus the numbers.
- dayLoads(): the dates that currently have holds against them, lanes held, lanes free, utilisation,
  and whether the date is effectively full.
- A FIT CHECKER: two inputs, a date and a guest count, calling fitCheck() and rendering its sentence.
  Make this genuinely usable; it is the thing a sales manager would actually open mid-call.
- pipelinePressure() over the live conversations as a labelled STRESS TEST, not a forecast, with the
  reading that it is N full evenings of bowling rather than a problem on one night.

Bars must carry numbers and labels, never colour alone.`,
  },
  {
    key: 'ObjectionsPage',
    label: 'objections',
    spec: `${ROOT}/src/pages/ObjectionsPage.tsx (+ .module.css).

THE OBJECTION REGISTER. Read ${ROOT}/src/data/objections.ts and ${ROOT}/src/state/ObjectionProvider.tsx
(written by the foundation agent) and build the page over them.

For each objection: the objection IN THE BUYER'S OWN VOICE as a pull quote, which lanes raise it,
how many prospects it currently blocks, the answer that works, what that answer costs the venue, and
a disposition the user can set with a note.

The one to give the most room is "your website will not tell me what it costs". That objection is
created by Main Event's own deliberate gating of every corporate price, and the honest answer is
that the price comes from a person, and the whole reason this role is open is that Brea does not
have that person yet. Say it that plainly.

Also give real room to "we already use Dave and Buster's", where the honest answer is interesting
because it is the same parent company.

Open the page with why an objection register exists at all: an objection heard three times is a
product problem, and one heard once is a conversation.`,
  },
  {
    key: 'SentPage',
    label: 'sent',
    spec: `${ROOT}/src/pages/SentPage.tsx (+ .module.css).

The outbox. Read ${ROOT}/src/state/OutboxProvider.tsx (written by the foundation agent) and build
over it. Every outreach email and group quote "sent" this session, newest first: the prospect, the
template used, the recipient (the .invalid demo address), the subject, the body, and the timestamp.

Open with the structural guarantee stated plainly: there is no email transport anywhere in this
dependency tree, the recipient domain is reserved by RFC 2606 and can never resolve, and sending
writes a row here and nothing leaves the browser. That is a property of the build, not a promise.

Empty state must be good: explain what would appear here and offer a link back to the desk.

Include a copy-to-clipboard on each body, because the genuinely useful thing a person does with a
drafted email is paste it into their real mail client.`,
  },
  {
    key: 'CoachingPage',
    label: 'coaching',
    spec: `${ROOT}/src/pages/CoachingPage.tsx (+ .module.css).

The job posting says the Sales Manager will "Build and manage a high-performing sales team,
providing mentorship, training, and support". This page is the answer to that bullet and it is the
one page that is about PEOPLE rather than prospects.

Build:
- THE RAMP. What a new event sales rep at a pre-opening venue is taught, in order, with a reason for
  the order. Lead with the thing most sales training gets wrong here: the packages that are priced
  are the ones the website already sells, so a rep's entire value is in the gated ones.
- THE CALL FRAME per occasion class. A calendar-locked buyer already has the event; you are competing
  for the venue. A discretionary buyer has no event; you are competing against doing nothing. Those
  are different conversations and a rep who runs the wrong one loses.
- WHAT GETS MEASURED. Explicitly two ledgers again: activity is coached, revenue is managed. Name
  the leading indicators (touches on calendar-locked prospects inside their window, hours outside the
  building, tours given) and the lagging ones (contracts, deposits, guests).
- THE ONE-TO-ONE. A short weekly agenda a manager would actually run, built off this app's own
  screens.
- NO INVENTED PEOPLE. Roles only.

Keep it to real, opinionated content. This page is prose-heavy and that is correct; make the
typography carry it (use --font-operator for pull quotes) and keep it scannable.`,
  },
  {
    key: 'MethodPage',
    label: 'method',
    spec: `${ROOT}/src/pages/MethodPage.tsx (+ .module.css).

THE PAGE THAT MAKES EVERY OTHER PAGE CREDIBLE. Every formula, every source, every assumption.

Sections:
1. WHAT IS REAL. The 69 organisations came from the Google Places API on 11 August 2026 and each
   carries its place id. Thirty publish an email that was read off their own site and each carries
   the URL of the page it was read from. Nothing was pattern-guessed from a domain name, and the
   reason is stated: one invented info@ address makes a reader reasonably distrust every other figure
   on the screen.
2. WHAT WAS DELIBERATELY LEFT OUT. Round One Entertainment appeared in an early pass as a
   Brea-headquartered corporate prospect on the strength of a business directory listing. Google
   Places puts Round One Entertainment, Inc. at 12900 Park Plaza Drive in Cerritos, thirteen miles
   away and outside the trade area. Two sources disagreed so the row came out. It would have been the
   most entertaining prospect on the board and it is not on the board.
3. THE PROVENANCE SYSTEM. All six values, what each means, and the "withheld" one explained at
   length: it is not a gap in the research, it is a finding, and the pattern in which figures Main
   Event withholds is the shape of the job.
4. THE SCORE. The full desk ranking formula from domain/selectors/desk.ts with every weight and the
   reasoning for the ordering, including why headcount is weighted last and capped.
5. THE CAPACITY ARITHMETIC. 1 lane per 20 guests, 26 lanes as a published floor, and why computing
   against the floor is the only safe direction to be wrong in.
6. THE TWO LEDGERS. Why activity and revenue are separate types with separate totals functions, and
   the specific lie that prevents.
7. WHAT IS ILLUSTRATIVE. The periods, the offers, the seeded statuses and the seeded book. Say
   plainly which parts are invented and why inventing them was necessary to show the model working.
8. WHAT WOULD CHANGE ON DAY ONE with real access: the actual opening date, the venue's real lane
   count and room capacities, real pricing authority, and a real CRM to write to.
9. THE DISCLAIMER. Unaffiliated work sample, no logo or trade dress, built for a job application.

This page is long prose. Use --font-operator for the section leads. Make it beautiful and readable
at a 68 character measure. It is the page a careful hiring manager reads last and remembers.`,
  },
  {
    key: 'QuotePage',
    label: 'quote portal',
    spec: `${ROOT}/src/pages/QuotePage.tsx (+ .module.css).

THE PROSPECT-FACING PAGE. It renders OUTSIDE the app shell at /quote/:prospectId, and that is a
deliberate architectural decision you should honour and explain in the file comment: a school
activities director arrives here from an email and has no business seeing the venue's internal
navigation, the desk, the score that ranked them, or the capacity chart showing which dates are
nearly gone. Showing it would be the digital equivalent of handing a customer your call sheet.

Read :prospectId from the route (useParams) and look it up in PROSPECT_BY_ID. Handle the unknown-id
case with a real page, not a crash.

The page is ONE organisation's event, addressed to them:
- Their name and the occasion, in their words, not the venue's.
- What Main Event Brea actually is, using ONLY the Brea-specific attractions from VENUE.attractions:
  more than 26 lanes, multi-level laser tag, Gravity Ropes, over 100 games, full-service restaurant
  and bar, private party rooms and dedicated meeting space. Say clearly that it opens soon and that
  no opening date has been published, because they will find that out anyway and hearing it from you
  first is the whole relationship.
- Their lead package with its REAL published inclusions, its guest minimum, its day-part
  eligibility, its booking notice and deposit, and either its published price or, honestly, that the
  price for this package comes from a person and here is what that person needs to know to give it.
- A guest-count input defaulting to their modeled midpoint, showing the lanes their group would hold
  at the published 1-per-20 rule, and the total where a published price exists.
- The relevant pre-opening OFFER from data/venue.ts, most often "first fifty on the calendar":
  a date held now, costing nothing, converting or releasing when the opening date is published.
- ONE primary action: request the hold. It writes to the outbox via OutboxProvider and shows a
  confirmation. No second competing call to action.
- Its own footer with the demo badge and the unaffiliated disclaimer.

This page must look like something a venue would actually send a customer: warmer and simpler than
the internal screens, bigger type, less chrome, no dense tables. It is the only page in the app
allowed to be persuasive rather than analytical.`,
  },
]

const results = await pipeline(
  PAGES,
  (p) => agent(
    `${BRIEF}

## FOUNDATION CONTRACT (written by another agent, already on disk, read these files before you start)

${foundation}

## YOUR TASK

Build ${p.spec}

Import primitives from the foundation. If an export you need does not exist, use what does rather
than inventing a new primitive, and note it in your summary.`,
    { label: `page:${p.label}`, phase: 'Pages' }
  ),
)

return { foundation, pages: results.filter(Boolean).length }
