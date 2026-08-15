# Request intake and tournament registration: what Main Event actually publishes

Research date: **11 August 2026**. Every claim below carries the URL it was read from.
Where a page could not be read, that is stated rather than filled in.

Read alongside `src/data/venue.ts` and `src/data/packages.ts`, which already hold
the package, price and terms layer. This file covers only what those two do not:
leagues, tournaments, inbound enquiry routes, and booking policy outside the
package pages.

---

## VERDICT

**A request intake surface can be built almost entirely on published fact. A tournament
registration surface cannot be built on published fact at all, and a league registration
surface can only be built as illustrative.**

Three separate findings drive that:

1. **Tournaments: nothing.** Main Event publishes no tournament programme anywhere on
   mainevent.com. Not brand wide, not for Brea, not on the bowling experience page, not
   on the leagues page. There is no tournament finder, no bracket, no entry fee, no
   format. A "register for a bowling tournament" screen has **zero** published basis.

2. **Leagues: a real brand-wide programme, explicitly not for Brea.** Main Event does
   publish a league product — **Open Lane Socials**, under the banner **Main Event Social
   Leagues**, at <https://www.mainevent.com/the-leagues/>. It is a genuine, currently
   open programme with a registration link. But the page says leagues run at **select
   locations** and names only **Colorado Springs, Windsor and Thornton**. It publishes
   **no price, no season length, no number of weeks, no team size and no start date**.
   Registration is handed off to a third party, `leaguepals.com/mainevent`. Brea is not
   mentioned, and neither is any California venue — Montclair, an **open** California
   Main Event, does not mention leagues on its location page either
   (<https://www.mainevent.com/locations/california/montclair/>).

3. **Request intake: two real forms with known field sets.** The Brea page carries an
   opening-interest form, and every events page and open location page carries a fuller
   event enquiry form. Both field sets are recorded below and can be reproduced as fact.

So: **build the intake. Label the leagues. Do not build the tournament.**

The sharpest thing this research turns up is not the absence — it is a **contradiction
already sitting in the app**. `venue.ts` lists Brea's attractions and inbound routes but
carries no note that `/the-leagues/` exists in Main Event's own primary navigation, which
is linked from the Brea page itself. A league programme exists brand-wide, is being
actively marketed ("Now Open For Registration!"), and has not been extended to Brea. That
is a better fact for a sales manager than "Main Event does not do leagues", because it is
an actual, dated, sourced gap the candidate can point at.

---

## 1. LEAGUES AND TOURNAMENTS

### 1a. The league programme that does exist (published BRAND WIDE)

Source: <https://www.mainevent.com/the-leagues/>

| Item | Published? | Value |
|---|---|---|
| Programme name | Yes | **Open Lane Socials**, under **Main Event Social Leagues** |
| Status | Yes | "Now Open For Registration!" |
| Nights of play | Yes | Tuesday, Wednesday or Thursday — participant picks |
| Season naming | Partial | "Winter-Spring Season" appears in page imagery; no dates given |
| Perks | Yes | "An exclusive menu, 15% off next season, and nightly prizes" |
| Competitive structure | Partial | A "national leaderboard" across centres |
| **Price** | **No** | No dollar amount anywhere on the page |
| **Season length / weeks** | **No** | Not published |
| **Team size** | **No** | Not published |
| **Start date** | **No** | Not published |
| **Which locations** | **Select only** | Names "Colorado Springs, Windsor, and Thornton" |
| How to register | Yes | "REGISTER TODAY" → <https://www.leaguepals.com/mainevent> |

Verbatim copy from that page:

> "Unmissable. Unskippable. Unstoppable. Open Lane Socials are rolling to a lane near you"

> "HAVE THE BEST WEEK, EVERY WEEK — The best routine your squad's ever had is about to get
> rolling. With Tuesday, Wednesday, and Thursday play, you pick with your night and do it
> your way."

> "UNLOCK EXCLUSIVE LEAGUE PERKS — An exclusive menu, 15% off next season, and nightly prizes?!"

> "EXPERIENCE LEGENDARY LANESIDE VIBES — Pins fall, spirits rise! Grab friends and see your
> name in lights on our national leaderboard."

**Could not read:** <https://www.leaguepals.com/mainevent> is disallowed by that site's
robots.txt, so the list of participating centres, the registration field set and any price
behind that link **could not be verified**. It is titled "Main Event Lobby" in search
results. Whether Brea will ever appear there is unknown and unpublished.

### 1b. The Colorado exception (published, but NOT Main Event corporate)

The three Colorado venues run their leagues off a separate site,
<https://playatthesummit.com/bowling-league-sign-up/>, which is far more forthcoming and
is worth reading as the closest thing to a template for what a real Main Event league page
looks like.

It publishes **named leagues by venue**, e.g. Windsor: Monday Adult/Youth, Monday
Have-A-Ball, Bowling N' Brews, Club 50+, Jack & Jill, Wednesday Have-A-Ball, Thursday
Classic, Football League, Ladies Night Out, Friday Fun League, Saturday Youth League,
Brunch & Bowl, Sunday Strike Pot. Colorado Springs and Thornton have their own named lists
(Hump Day Mixers, Strikers Youth, Bloody Mary League, Sun HAB 9 Pin No Tap, and others).

Its sign-up form asks for: contact name, email, phone; preferred contact method; location;
league preference; **skill level (Beginner / Intermediate / Advanced)**; team status
(existing team, request placement, or forming a new league); up to three additional team
member details; optional comments.

**It still publishes no price, no season length and no team size.**
Source: <https://playatthesummit.com/bowling-league-sign-up/>

Also relevant: <https://playatthesummit.com/bowling-club-faq/> exists as a league FAQ. Not
read in full.

### 1c. The one place Main Event corporate discusses leagues in prose

<https://www.mainevent.com/stories/bowling-leagues/> is a **blog post**, not a programme
page. It explains how bowling leagues work in general (it describes teams of "three to
five players who meet up a few times a month to bowl" with "about three games per match" —
this is generic league education, **not a Main Event rule**) and closes with an invitation:

> "If you're looking for a local hotspot that is perfect for a bowling league, Main Event
> is the place to be!"

and tells readers to "ask about our leagues, or see if we can host a league that you're
starting." No enrolment route, no names, no prices, no list of participating centres. Its
sign-up advice is generic: "Check with the front desk to find out who the league manager
is." No publication date is shown.

**This page is the only published basis for the claim that Main Event will host a league
you bring to them.** It is soft, it is a blog, and it does not say it for Brea. It is
quotable in an email; it is not quotable as a product.

### 1d. Tournaments — NOT PUBLISHED AT ALL

- No tournament page exists on mainevent.com. A domain-restricted search for tournament
  content on mainevent.com returned only the leagues page, the leagues blog post, the
  bowling experience page and general events pages — none of which mention tournaments.
- <https://www.mainevent.com/experiences/bowling/> mentions leagues only as a nav link and
  says nothing about tournaments or competitive play.
- The Brea page carries no mention of leagues, tournaments or competitive bowling
  (<https://www.mainevent.com/locations/california/brea/>).

**Finding: Main Event publishes no tournament programme. Anything a tournament screen
would need — format, entry fee, bracket, handicap, prize, eligibility — is invented.**

### 1e. Published FOR BREA specifically: nothing

Nothing about leagues, tournaments or recurring competitive bowling appears on the Brea
page. The nav on that page links to `/the-leagues/`, as it does site-wide, but the Brea
page itself makes no league claim.

---

## 2. HOW A GROUP ACTUALLY ENQUIRES TODAY

There are **two distinct forms**, and the difference between them is the finding.

### 2a. The Brea opening-interest form (published FOR BREA)

Source: <https://www.mainevent.com/locations/california/brea/>
Heading: **"Want More Information About The Opening? Inquire Below!"**

Fields:

- First Name *(required)*
- Last Name *(required)*
- Email *(required)*
- Phone
- Company / Organization / Group
- Additional Information *(required, 256 character limit)*
- Consent checkbox (contact / privacy policy)

### 2b. The standard event enquiry form (published BRAND WIDE)

Source: <https://www.mainevent.com/events/>, repeated on
<https://www.mainevent.com/events/corporate-events/> and on open location pages such as
<https://www.mainevent.com/locations/california/montclair/>
Heading: **"Want Help Planning Your Party?"**

Fields:

- First Name
- Last Name
- Email
- Phone
- Preferred Location
- Desired Date
- "I'd like to book…" (event type)
- Estimated Number of Attendees
- Additional Information (256 character limit)
- Checkbox: "I'd need information on a multi-location event"
- Checkbox: "I'd like to receive a free tour of the center"
- Consent checkboxes for email / SMS updates

### 2c. Why the difference matters

**The Brea form does not ask for a date, a headcount, an event type or a location.** The
standard events form asks for all four. Brea gets a thinner form because there is nothing
to book against.

That is the single most useful intake fact in this document. A prospect who fills in the
Brea form gives Main Event a name, an email and 256 characters. **No date. No headcount.
No event type.** Which means the inbound Brea lead arrives with none of the three fields
a sales manager needs to qualify it — and every one of those three has to be recovered by
the first phone call. A request intake surface in this app that captures date, headcount
and event type is not embellishment; it is closing a gap that is demonstrably open on
Main Event's own published Brea page today.

Note also that the "free tour of the center" checkbox exists brand wide on the standard
form and is **absent** from the Brea form — reasonable, since there is no centre to tour,
and directly relevant to the app's existing `founding-partner-tour` offer, which is
currently marked `illustrative` in `venue.ts`. It remains correctly illustrative: Main
Event publishes a tour checkbox for open venues, not a hard-hat tour for unopened ones.

### 2d. What happens after you submit — NOT PUBLISHED

**No response time is published anywhere.** Not on the Brea page, not on `/events/`, not
on `/events/corporate-events/`, not on `/contact-us/`. Main Event does not say who
replies, how, or when. Any SLA, "we'll get back to you within X hours", or queue position
shown in this app is invented.

### 2e. Other routes

- **National guest services phone: 877-624-6298, "Mon-Sun 8am-7pm CST"** —
  <https://www.mainevent.com/contact-us/>. Already in `venue.ts`.
- **Brea phone: (657) 530-1177** — Brea page. Already in `venue.ts`.
- **media@mainevent.com** — press/PR only, and still the **only** published email address
  on the site. Already in `venue.ts` and still true.
- **Donation and sponsorship requests** are routed to the local store via the locations
  page — <https://www.mainevent.com/contact-us/>. Not currently in `venue.ts`; relevant to
  the `faith-nonprofit` lane.
- **"Book an Event"** → <https://www.mainevent.com/book/events/>. **Field set could not be
  read: the entire `/book/` path is disallowed by mainevent.com's robots.txt.** That is
  itself worth recording — Main Event's transactional booking funnel is deliberately not
  crawlable, so no agent and no search engine can see what it asks for.
- **"Change Reservation"** → `https://www.mainevent.com/contact-us/change-reservation`
  and **"Reach Out" / general questions** → `https://www.mainevent.com/contact-us/general-questions`.
  Both are linked from <https://www.mainevent.com/contact-us/>, but **both returned 404 on
  fetch, with and without a trailing slash.** Their field sets could not be verified. Do
  not model them.

---

## 3. WHAT A BOOKING ACTUALLY REQUIRES

### 3a. Already captured in `packages.ts` — re-confirmed, no change

- **5-day minimum booking notice** and **50% deposit**, published verbatim on the All
  Access Pass, Fun 101, Level Up, MVP and Happy Hour pages (`STANDARD_TERMS`).
- **Banquet / minimum food spend starting at $14 per person** (`BANQUET_FLOOR_PER_GUEST`).
- Per-package guest minimums, maximums and day-part restrictions — all present.
- Play It Forward: 10 voucher minimum, 3 business days ahead, through the sales office.
- Birthdays: **$100 deposit** to confirm.
- Team building: **20% FUN-cilitator host fee**.
- "Room rental fees and revenue minimums may apply" on the gated packages.

Nothing in this re-check contradicts any of it.

### 3b. Genuinely NEW — from house policies, not currently in either data file

Source: <https://www.mainevent.com/house-policies/>

- **Outside food and drink, verbatim:** "Food and beverage not prepared and/or served by
  Main Event are strictly prohibited." This is a hard published rule and it is not
  currently recorded anywhere in the app. It matters for the schools and faith/nonprofit
  lanes, where a group's default assumption is that they bring their own cake.
- **Guardian rule, verbatim:** "Persons under the age of 18 or 21 (varies by location) may
  only enter the premises with a guardian who is at least 25 years of age. Each guardian
  may bring no more than 6 underage persons into the premises." **The 6-per-guardian cap
  is a chaperone ratio**, and it is directly load-bearing for any youth-group intake form:
  a 60-student field trip implies at least 10 qualifying adults, each 25 or older. Note
  the "varies by location" hedge — the exact age threshold for Brea is **not published**.
- **Curfew:** some locations require guests under 21 to leave by 11pm on Fridays and
  Saturdays. Whether Brea does is **not published**.
- **Dress code:** "Shoes and shirts required"; hats, ripped clothing, sunglasses,
  gang-affiliated attire and clothing exposing underwear or excessive skin are prohibited;
  torn or soiled clothing admitted at management discretion. **"NO OPEN CARRY of firearms
  permitted except by sworn law enforcement personnel."**

### 3c. NOT PUBLISHED — checked and absent

- **Cancellation terms.** Not on the house policies page, not on any package page read.
- **Refund terms.** Not published.
- **Rescheduling terms.** A "Change Reservation" route exists (linked from `/contact-us/`)
  but its page 404s and no terms are published.
- **How long a date can be held.** Not published. The app's `first-fifty` offer is
  correctly marked `illustrative`.
- **Height minimums** are not on the house policies page; the 48-inch laser tag and gravity
  ropes minimum is published on the package pages and is already in `packages.ts`.

---

## 4. COMPETITOR COMPARISON

**Bowlero and Lucky Strike (same parent, Lucky Strike Entertainment) publish league
*structure* that Main Event does not, but they withhold price exactly as Main Event does.**
Both run a per-location leagues page and a searchable finder covering Traditional Leagues
("16–36 Weeks"), Short-Season Leagues ("5–15 Weeks") and **Tournaments**, with skill bands
(Novice / Experienced / Advanced), filterable by city, state or zip within a 5–100 mile
radius — <https://www.bowlero.com/leagues>, <https://www.bowlero.com/league-finder>,
<https://www.luckystrikeent.com/location/lucky-strike-ladera-ranch/leagues>. But neither
publishes a dollar amount: both route you to "Submit your inquiry and a league
representative will follow up with registration info and season details", and their league
FAQs list the question "How much does it cost to join a league?" without a readable answer
(<https://www.bowlero.com/league-faqs>, <https://www.luckystrikeent.com/league-faqs>).
**Round1 publishes no leagues or tournaments at all** — its bowling page covers cosmic
bowling, Moonlight Strike and VIP lanes only, with no competitive play and no sign-up route
(<https://www.round1usa.com/activities-list/bowling>).

**What this sharpens for the app's argument:** league pricing is a *category-wide*
withholding, not a Main Event quirk — so the app should not claim Main Event is uniquely
secretive about league cost. But **league discoverability is a Main Event weakness
specifically**. Lucky Strike Ladera Ranch, roughly 25 miles from Brea, publishes a
per-location leagues page with a tournament category; Main Event Brea publishes none, and
neither does Main Event Montclair, the nearest open Main Event. A Brea sales manager
prospecting a corporate league has a competitor within the trade area whose league and
tournament offer is findable on a location page, against a Main Event offer that is not.

---

## 5. THE BREA PAGE, RE-CHECKED

Source: <https://www.mainevent.com/locations/california/brea/>, read 11 August 2026.

This re-check is **same-day** with the original capture in `venue.ts`, so no drift is
observable. What the page shows today:

| Field | Today | Matches `venue.ts`? |
|---|---|---|
| Status label | "Coming soon" | Yes — `openingStatus: "announced"` |
| **Opening date** | **Still none published** | Yes |
| **Hours** | **Still none published** | Yes |
| Address | 245 West Birch Street, Brea, CA 92821 | Yes |
| Phone | (657) 530-1177 | Yes |
| Lanes | "26+ state-of-the-art bowling lanes" | Yes — floor of 26 holds |
| Dragon ramps | Present | Yes |
| Laser tag | "Multi-story laser tag arena" | Yes |
| Arcade | "Over 100 arcade games" | Yes |
| Gravity ropes | Present | Yes |
| Restaurant / bar / giant screen | Present | Yes |
| Meeting room space | Present, still no room count or capacity | Yes |
| Form heading | "Want More Information About The Opening? Inquire Below!" | Yes |
| Leagues / tournaments | **No mention** | Not previously recorded either way |

**Changes worth recording:**

1. **No opening date, no hours.** The core premise of the work sample is intact.
2. **The Brea page links to `/the-leagues/` in its primary navigation.** `venue.ts` does
   not record that a league programme exists brand-wide. This is not a contradiction of
   anything already captured, but it is a gap: the app currently has no data point for
   leagues at all, and there is now a sourced one.
3. **Confirmed contrast with an open California venue.** Montclair publishes full daily
   hours ("MON 11 am - 1 am", "Open Today from 11 am - 12 am") and the standard "Want Help
   Planning Your Party?" form; Brea publishes neither. This makes the "no hours" finding
   provably a Brea condition rather than a Main Event site-wide omission — a stronger claim
   than the app currently makes.
   Source: <https://www.mainevent.com/locations/california/montclair/>
4. **Trade press remains the only opening timeline**, and it is over a year old: whatnow.com
   reported on **23 May 2025** that the venue takes the former Regal Edwards West cinema
   (vacant since 2019) following unanimous Brea Planning Commission approval, "expected in
   2026", with Main Event declining to comment.
   Source: <https://whatnow.com/orange-county/restaurants/vacant-movie-theater-to-become-main-event/>

---

## INBOUND ROUTE TABLE

| # | Route | URL | Fields / what it asks | Scope |
|---|---|---|---|---|
| 1 | Brea opening-interest form | <https://www.mainevent.com/locations/california/brea/> | First Name*, Last Name*, Email*, Phone, Company/Organization/Group, Additional Information* (256 char), consent checkbox | **Brea specific** |
| 2 | Event enquiry form ("Want Help Planning Your Party?") | <https://www.mainevent.com/events/> · <https://www.mainevent.com/events/corporate-events/> · open location pages | First Name, Last Name, Email, Phone, Preferred Location, Desired Date, "I'd like to book…" (event type), Estimated Number of Attendees, Additional Information (256 char), multi-location checkbox, free-tour checkbox, email/SMS consent | Brand wide |
| 3 | Brea phone | tel: (657) 530-1177 | Voice. No published hours for this number | **Brea specific** |
| 4 | National guest services phone | <https://www.mainevent.com/contact-us/> · tel: 877-624-6298 | Voice. "Mon-Sun 8am-7pm CST" | Brand wide |
| 5 | Book an Event | <https://www.mainevent.com/book/events/> | **Unknown — `/book/` is robots-disallowed and could not be read** | Brand wide |
| 6 | Change Reservation | `https://www.mainevent.com/contact-us/change-reservation` | **Unknown — linked from /contact-us/ but returns 404 on fetch** | Brand wide |
| 7 | General questions / "Reach Out" | `https://www.mainevent.com/contact-us/general-questions` | **Unknown — linked from /contact-us/ but returns 404 on fetch** | Brand wide |
| 8 | Press email | media@mainevent.com | Email. Press only. Only published address on the site | Brand wide |
| 9 | Donation / sponsorship | <https://www.mainevent.com/contact-us/> → locations page | Directed to the local store; no form published | Brand wide |
| 10 | League registration | <https://www.leaguepals.com/mainevent> | **Unknown — third-party site, robots-disallowed** | Select locations only (CO named) |
| 11 | Colorado league sign-up (reference only) | <https://playatthesummit.com/bowling-league-sign-up/> | Name, email, phone, preferred contact method, location, league preference, skill level (Beginner/Intermediate/Advanced), team status, up to 3 team-mate details, comments | Colorado venues only — **not Brea** |

Routes 5, 6 and 7 are published-but-unreadable. They should be linked, never modelled.

---

## WHAT WOULD HAVE TO BE INVENTED

For the build agents. Anything in the **INVENTED** column must be marked
`provenance: "illustrative"` and must render with the app's illustrative treatment. Anything
in the **FACT** column may be stated plainly with its source URL.

### Request intake — mostly buildable on fact

| Element | Status |
|---|---|
| Field set: first name, last name, email, phone, company/organisation/group, free-text notes | **FACT** — Brea page, exactly these fields |
| Field set: preferred location, desired date, event type, estimated attendee count, multi-location flag, tour request | **FACT** — brand-wide events form, exactly these fields |
| 256-character limit on the notes field | **FACT** — both forms |
| Consent / privacy checkbox | **FACT** — both forms |
| "Main Event's own Brea form does not ask for a date, headcount or event type" | **FACT** — verified against both forms same day |
| **Response time / SLA of any kind** | **INVENTED** — no response time published anywhere |
| **Who replies (a named sales manager, an events team, a queue)** | **INVENTED** — Brea has no published sales contact; the only published email is media@mainevent.com |
| **Lead statuses, stages, scoring, routing rules** | **INVENTED** — Main Event publishes no pipeline |
| **Confirmation emails, reference numbers, ticket IDs** | **INVENTED** |
| **Anything modelled on routes 5, 6, 7** | **INVENTED** — those pages could not be read |

### League registration — buildable only as illustrative

| Element | Status |
|---|---|
| Programme name "Open Lane Socials" / "Main Event Social Leagues" | **FACT** — /the-leagues/ |
| "Now Open For Registration!" | **FACT** — /the-leagues/ |
| Play nights are Tuesday, Wednesday or Thursday, participant's choice | **FACT** — /the-leagues/ |
| Perks: exclusive menu, 15% off next season, nightly prizes | **FACT** — /the-leagues/ |
| A national leaderboard across centres | **FACT** — /the-leagues/ |
| Registration is via leaguepals.com/mainevent | **FACT** — /the-leagues/ |
| Leagues run at **select locations**; only Colorado Springs, Windsor, Thornton are named | **FACT** — /the-leagues/ |
| Main Event will "see if we can host a league that you're starting" | **FACT**, but it is blog copy — quote it as such, from /stories/bowling-leagues/ |
| **Any league price, entry fee, dues or deposit** | **INVENTED** — no dollar amount on the leagues page; competitors withhold it too |
| **Season length, number of weeks, start or end dates** | **INVENTED** |
| **Team size / players per team** | **INVENTED** — the "three to five players" line is generic blog education, **not a Main Event rule**. Do not quote it as one. |
| **Skill levels / divisions / handicap** | **INVENTED** for Main Event — those bands are Bowlero and Lucky Strike vocabulary |
| **That Brea will have a league at all** | **INVENTED** — no California Main Event, open or otherwise, publishes leagues |
| **A league registration form's field set** | **INVENTED** — leaguepals could not be read. The Colorado form's fields belong to a different site and must not be presented as Main Event's |
| **Lane assignment, standings, averages, scoring** | **INVENTED** |

### Tournament registration — no published basis whatsoever

| Element | Status |
|---|---|
| **That Main Event runs tournaments** | **INVENTED** — no tournament content exists on mainevent.com |
| **Format, bracket, rounds, games per match** | **INVENTED** |
| **Entry fee, prize fund, payout** | **INVENTED** |
| **Eligibility, age bands, handicap** | **INVENTED** |
| **Dates, capacity, team counts** | **INVENTED** |
| **A tournament finder or search** | **INVENTED** — Bowlero and Lucky Strike have one; Main Event does not |

**Recommendation for the build:** ship the request intake as a real, factual surface, and
treat any tournament screen as the harder call. If it is built, it cannot be labelled
merely "illustrative" alongside a real product — it should be framed explicitly as *a
programme Main Event does not currently run*, which is a legitimate and defensible thing
for a prospecting prototype to propose, and an indefensible thing for it to imply already
exists.

### Booking terms — mostly already fact

| Element | Status |
|---|---|
| 5-day notice, 50% deposit, $14/person food floor, guest min/max, day parts | **FACT** — already in `packages.ts` |
| Outside food and beverage "strictly prohibited" | **FACT, NEW** — /house-policies/ |
| Guardian must be 25+; max 6 underage persons per guardian | **FACT, NEW** — /house-policies/ |
| Under-21 11pm curfew Fri/Sat | **FACT, NEW**, but "some locations" — **not published for Brea** |
| Exact under-18/21 age threshold at Brea | **NOT PUBLISHED** — "varies by location" |
| **Cancellation, refund, rescheduling terms** | **INVENTED** — none published |
| **How long a date can be held without deposit** | **INVENTED** — the `first-fifty` offer is correctly illustrative already |
