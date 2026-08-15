# Main Event Brea, Event Sales Manager: the build brief

**Written 11 Aug 2026. This is the handoff document. Read it first.**

Target role: **Sales Manager (Event Sales Manager), Main Event Entertainment,
Brea CA. $75,662 to $89,014.** Reports to the General Manager. Drives event
revenue through consultative selling, outbound prospecting, cold calling and
retaining an existing client base.

Companion research, both written and sourced:

- `01-business-intel.md` — the company, the Brea site, every published price, the
  competitive set, the real buyers in the trade area
- `02-event-sales-funnel.md` — how FEC group sales actually works, the outbound
  motion, seasonality, fundraisers, tools, and what good looks like

---

## The one finding that decides the whole build

**Main Event's Brea location page is unlocalised Tempe, Arizona boilerplate.**

The body copy on the Brea page says *"off I-10 and Warner Road,"* *"20 minutes
from downtown Phoenix,"* and *"take a break from the desert heat."* Brea is in
north Orange County. The page is pre-opening and nobody has written it.

Its enquiry form captures **no date, no headcount and no event type.**

That is the work sample. A candidate for an event sales job who opens with
*"your Brea page is selling Phoenix, and your enquiry form does not ask when the
event is"* has already done the job in the first sentence. Verify it is still
live before using it, and screenshot it, because they may fix it.

---

## The thesis, and it is filing sourced rather than opinion

Dave and Buster's own 10-K states that special events matter **because a
significant percentage of attendees are first time guests**, and that special
events were **9.8% of revenue in FY2018**.

So a booked group event is not just a booking. **It is a mass consumer
acquisition event.** One birthday party puts twenty families in the building.
One school fundraiser night puts two hundred.

**The build should show the B2B group funnel and the consumer family funnel
meeting at a shared bottom: the guest database.** That is the argument, and it
is the reason an event sales manager is worth more than their booking revenue.

---

## The three facts that shape the funnel

**1. Fundraiser nights are the outbound wedge, and every number is public.**
20% back to the school is the category standard, matched by Main Event, Chuck E.
Cheese, Urban Air and Sky Zone. Stars and Strikes is 15%. Chuck E. Cheese pays
25% above $2,500 and routes it through a local Field Marketing Specialist, which
is this exact job.

It inverts the cold call. You are not asking a school for money, you are offering
them money. The school then distributes flyers, pickup zone signage and day of
stickers to every family. **One night gets you the PTA chair, the athletic
director, and two hundred families.**

**2. Sequence the year around July and August, not November.** Executive
assistants and HR start researching holiday venues in July and August. Decisions
land August to early October. October is the highest inquiry month. Meanwhile
median booking to event is 36 days and 48% lock within 30 days, which means a
thin month four weeks out is already written, but a thin quarter is still
winnable.

**A timeline that shows booked versus held is the most credible widget in the
sample**, because it is the thing a sales manager actually lives inside.

**3. Main Event publishes no group price anywhere.** Birthdays are published at
$17.99 to $29.99 and team building at $19.95 to $42.95 plus a 20% facilitator
fee, but every corporate package is quote only. Chuck E. Cheese leads with
$9.99 a child. Topgolf publishes per head by location.

That is a conversion gap, and a candidate proposing a transparent package
comparison is proposing revenue, not decoration.

---

## What to build

Reskin the existing Jar Club architecture at `nathanjsong.com/olesmoky` into a
Main Event Brea event sales showcase. The bones transfer better than they did
for any other target, because a family entertainment centre is the venue,
events, loyalty and repeat visit business the Jar Club already models.

### Proposed surfaces

**1. The Brea page, rewritten.** Side by side: what is live today with the
Phoenix copy called out, and what it should say. Real surrounding cities, real
drive times, real attractions. This is the opener.

**2. The enquiry form, rebuilt.** The live form asks nine fields and none of them
are date, headcount or event type. Rebuild it as a qualifying form that routes
by event type, captures the three things a sales manager needs to quote, and
gives instant indicative pricing where a price exists. Show what lands in the
CRM record.

**3. The group funnel console.** Reskin of the model tab. Pipeline stages, lead
sources, close rates, average event value, booked versus held revenue by month.
The Ole Smoky console's honesty discipline carries over unchanged: every rate
shows its denominator, nothing unsourced is presented as measured, and modelled
values are daggered.

**4. The fundraiser engine.** The outbound wedge as a working surface. Pick a
school, model the night, show the 20% back, show what the venue keeps, and show
how many new families enter the database. This is the strongest single screen.

**5. The family occasion side.** The consumer funnel that makes a parent bring
the whole family: multi generational visits, cousin groups, team parties, school
break programming. This is where the guest side and the group side visibly meet.

**6. The prospecting board.** The daily reality of the job: tabling, networking,
go sees, cold calls, appointments set, all tracked. Real employers, school
districts and youth sports organisations near Brea, La Habra, Fullerton,
Placentia, Yorba Linda, Diamond Bar and Anaheim, from `01-business-intel.md`.

### The seasonal calendar

Runs across the whole thing. July and August prospecting for a November and
December holiday season, with the booked versus held distinction visible.

---

## Engineering brief

**Base.** `njs-site/olesmoky/index.html`, roughly 2.4MB, single file, no
libraries, no CDN except one logo image. Shadow DOM for the console and the prize
wall. All state in memory, nothing persisted.

**Conventions that must carry over:**

- Single file. No libraries, no build step, no framework.
- Only original inline SVG. No emoji, no icon libraries, no glowing or pulsing
  dots, no shimmer sweeps. Every animation depicts a physical event you can name.
- **No em dashes, no en dashes, no arrow characters anywhere in copy.**
- 44px tap targets on touch, 16px minimum on inputs to stop iOS zoom, respect
  `prefers-reduced-motion`, works at 360px.
- Every rate shows what it was divided by. Modelled values carry a dagger.
  Nothing unsourced is presented as measured.

**Traps, all of which have bitten before:**

1. The shadow DOM stylesheets are JS string literals with escaped `\n`. **A real
   newline terminates the string and kills every script on the page.**
2. Roughly 45 top level selectors are declared twice and **the last declaration
   wins.** After any CSS edit, confirm yours is final. `tdup.js` checks this.
3. `esc()` will escape glossary markup into visible HTML. Only escape plain
   strings.
4. `.pnl` carries `overflow:hidden`. Nothing inside may be wider than its column,
   and no descendant can scroll horizontally.
5. A global `prefers-reduced-motion` rule kills all transitions, so
   `transitionend` never fires. Drive sequences from timers.
6. Write atomically. A killed write truncated this file by 350KB once.

**Test suites** live in the session outputs folder, 35 of them, roughly 770
assertions. `tdup.js` is the duplicate selector build check. Any reskin should
keep the pattern: assert behaviour, not markup.

**Versioning.** Previews are numbered `-v2`, `-v3`, `-v4` and **live outside the
repo**, delivered as files in chat. `previews/` is gitignored. The repo holds one
live file. Every edit gets a new number so any state can be recovered.

**Deploy.** Repo `github.com/jsongau/NJS.git`, branch `main`, Vercel project
`njs`. Confirm the target before pushing. Commit means saved, push means live.
`push-njs.sh` in the workspace root handles the lock files.

---

## What is verified and what is not

`01-business-intel.md` carries a 38 item "could not verify" section. The
important ones:

- **Brea's opening date and its real attraction list are unconfirmed.** The page
  is pre-opening.
- **All drive times are unverified.**
- **No public close rate, birthday spend, or holiday party per head benchmark
  exists.** Three widely circulated FEC statistics trace back to content farms
  and must not be used.

Verified and safe: founded Lewisville TX 1998; Dave and Buster's acquired Main
Event from Ardent Leisure and RedBird for **$835M**, closed 29 June 2022; **64
centres across 22 states** per the FY2025 10-K; Darin Harper became CEO on
3 August 2026; Brea is **245 W Birch St**, the former Regal cinema, approved
May 2025.

**The rule that has held all the way through this project: if a number cannot be
sourced, it does not go on the page.** A fabricated benchmark in a work sample
is the thing that ends an interview when somebody checks it.

---

## Honest note on strategy

This is the fourth target this artefact has been aimed at. The Jar Club is
genuinely strong work, and Main Event is by far the best fit of the four, because
the venue, events, loyalty and repeat visit model is the same shape.

But the constraint on the last three applications was never the artefact. It was
that a recruiter screens on title and platform before any link gets opened. For
this role the screen is **5+ years of sales experience, outbound prospecting, and
CRM.** Worth checking that the resume clears that gate before another forty hours
goes into the build.

The Brea Phoenix copy is a genuinely excellent cold outreach opener on its own,
and it costs one email rather than one weekend.
