# Copy audit and four-reader stress test

Ole Smoky / The Jar Club, 9 Aug 2026. Findings from a wording audit plus a stress test
against four real readers. Fixed items are marked. The rest is the open list.

---

## The register leak nobody had noticed

**The page was written in British English.** For a Gatlinburg moonshine brand this was
the loudest tell on the site, and it was in customer-facing strings: favour, honour,
autumn, flavour, personalised, modelled, catalogue, behavioural. Twenty-four instances.
"Flavour" sat three lines below nine instances of American "flavor" in the same object,
so the file was not even consistently British. **Fixed.**

---

## The worst lines, and why

### The brand explaining its own manipulation to the person being manipulated

**"Four runners-up still get the kit, so the odds feel real."** This told the reader the
odds were a sensation the brand engineered. No brand says this out loud. **Fixed.**

**"A gap you can see is the thing that pulls you across it, and a set with one missing
is worth more than five unrelated ones."** The designer's behavioral rationale, printed
where the member reads it.

**"whether we send you a reorder nudge or leave you alone."** CRM jargon spoken to a
customer. Nobody says nudge in a bar.

**"Blackberry is the only one we sell in all three formats, which means we can reach you
in three different aisles."** Reframes the customer's taste as targeting surface.

**"Gift buyers place the biggest merch orders on the whole list, about a hundred dollars
across three items."** Reads a customer their own segment file.

**"Blue Flame is the jar people buy to prove something. We are not going to send you a
discount on it. That would be insulting to both of us."** Tells the customer what their
purchase says about them, then scolds a discount they never asked for.

### Sentence shapes only a model writes

"That is not a tease, it is the cap." · "Gatlinburg is where you sleep. Ole Smoky is
where you spend the days." · "A prize you can picture beats a prize you can price." ·
"Cold in an hour beats a shirt in a week." · "A list that never suppresses is a list
that eventually cannot reach anyone." · "A one tap question produces the only thing this
program cannot buy, which is a reason."

The template is always the same: a chiasmus, an "it is not X it is Y", or an
"A that never Y is a A that Z". Twenty-plus instances.

### One idea said six times

The central insight, that five million visits produce no identity, appears six times in
six different sentences. Keep one: **"Almost none of them come back with a name
attached."** Cut the rest.

### Fake regional voice

"Pour one for a friend." Nobody says this. It is what a model thinks a distillery says.
"Holler" is used fourteen times as a generic noun for any location, including a form
field labeled **Home holler**, applied to Nashville and Myrtle Beach. The costume shows.

### A broken string in production

**"Somebody kitchen, late"** — the apostrophe had been deleted to stop the JavaScript
literal breaking, and the ungrammatical string shipped. **Fixed.**

---

## Contradictions that kill credibility

| Claim | Said as | Also said as |
|---|---|---|
| Draw cadence | Weekly, five places | Monthly, three places |
| Draw hour | 9pm Eastern in the hero countdown | 8pm Eastern in the email and SMS |

A reader deciding whether to trust the drawing reads the rules, hits "Entry period:
Monthly" against a hero that says every Friday, and stops. **Both fixed.** The hour is
now 9pm everywhere and the cadence weekly everywhere.

---

## The four readers

### A, the buyer

Landed from an ad, wants a bottle. **The retailer list is not clickable** — 7-Eleven,
Kroger and Total Wine are plain list items with no links. You name three stores that
carry it and give them nowhere to go. The buy path is also split across three views and
only a third of it is reachable from the landing view, behind a tab labeled **Convert**.
A person who wants a bottle will not click a tab called Convert.

**Their one change:** make the three retailer names real links, and put Instacart and
DoorDash in the header lid beside Uber Eats.

### B, the returning visitor

Wants the $5,000 weekend. The itemized prize table works — seven lines summing to
exactly $5,000, every one a place they recognize. The rules summary is more honest than
most brand sweepstakes. They lose interest at the badge codex: somebody who wants a
weekend in Gatlinburg is being asked to complete a distilling curriculum.

The points read as a genuine second path, which is the strongest strategic idea here.
It is undercut by opening with the loss: "most people don't win" before offering the
alternative. Lead with the door, not the loss.

### C, the hiring manager

**What proves the candidate:** they understand three-tier and built the whole strategy
on it. They found the Hooch Hop and proposed instrumenting an existing working program
rather than inventing one. The compliance instincts are real and unprompted — alcohol
excluded from prizing, trade-tie exclusions enforced at the draw rather than on an honor
checkbox, NY and FL registration thresholds with bonding lead times on the calendar.

**What makes them wince:** the nav says **Convert**. A CRM Director labeled a
customer-facing tab with a funnel stage. And the operator voice leaks into consumer copy
throughout, which in a live campaign is a brand safety problem.

**What a spirits operator finds naive:** weekly $5,000 prizing is $260,000 a year plus
208 runner-up kits, with NY and FL registration at every weekly period. No operator runs
that. Monthly is the norm.

### D, the board

**What works:** they refused the free lunch on delivery, booking supplier margin near
$11 rather than the $22 shelf price and saying so. Tasting revenue set to zero
deliberately. The source table grades its own inputs, including marking a vendor
breakage stat as "a glossary entry with no underlying source, listed here so it does not
get quoted at you."

**What fails, and this is the serious one:** the ROAS numerator adds gross retail
revenue to net supplier margin and divides by media. The $15 code is never netted off
the revenue it generates, despite 58% of entrants copying it. Prize cost and points
liability sit outside the denominator entirely, so payback is computed as though prizing
is free — at the $2,000 pilot, weekly prizing alone is 2.5x the media.

Points liability is claimed in prose twice and has no variable in the model. That gap is
worse than not mentioning it.

**The question the page cannot answer:** what does this do to nine-litre case volume?
Every revenue line is merch, coupons and delivery margin. Nothing connects to depletions
or the case number the sponsor actually reports.

---

## Where the readers conflict

The sweepstakes is the whole page for B, C and D, and pure friction for A. Do not
simplify it. Duplicate the buy path into the persistent header lid so A never has to
enter the funnel.

Weekly draws serve B and offend C and D. **Monthly $5,000 grand prize, weekly runner-up
kits** gives B a Friday event and gives C and D a $60,000 annual line and twelve filings
instead of fifty-two.

---

## The one change that serves all four

**A global operator-view toggle, default off**, moving every strategic, explanatory and
mechanism sentence out of consumer copy into a marked annotation layer.

The pattern already exists in the file: the email flow separates the customer message
from the operator rationale, and `.ill` marks illustrative content in 150 places.

Off, it is a moonshine sweepstakes and nobody is told their odds were engineered. On,
every one of those sentences comes back, marked, in the operator's voice, where the
strongest writing on this page belongs. It resolves the fourth wall, the AI voice and
the audience conflict in one move, using a pattern the file already contains.

---

## Fixed in v98

- 24 British spellings
- "so the odds feel real"
- Draw cadence weekly in all eight places, hour 9pm in all three
- "Somebody kitchen, late"
- "ultimate" removed from the hero and the prize card

## Open, ranked

1. The model's numerator mismatch, the un-netted $15 code, and prize and points
   liability outside the denominator
2. The operator-view toggle
3. Clickable retailers and a complete buy path in the header lid
4. Rename Convert
5. The twenty-plus AI sentence shapes listed above
6. Cut five of the six restatements of the central insight
7. "Home holler" and the fourteen uses of holler as a generic noun
