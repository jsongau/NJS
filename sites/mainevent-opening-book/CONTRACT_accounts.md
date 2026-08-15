# THE ACCOUNT. Read this in full before anything else.

Agents are working in sequence and then in parallel. This file sits on top of `CONTRACT_arcade.md`,
`CONTRACT_two_grounds.md` and `CONTRACT_saas.md`, which all still bind.

## Why this exists

The Brea posting is transcribed verbatim in `JD_BREA.md`. It names retention three times in its
first six lines, before it names anything else:

> "drives event revenue through consultative selling, outbound prospecting, and **retaining an
> existing client base** ... strategic in **customer acquisition and retention** ... strong **client
> nurturing** skills"

W4 is year over year business. W5 is nurturing relationships and driving repeat sales. D1 says
go-sees happen with **current** customers as well as prospective ones. D7 is regular communication
with the client base.

`ANALYSIS_jd_coverage.md` scored all twenty four requirements against the code and found this is the
largest gap in the application. The code says so out loud: `types.ts` line 9 and `venue.ts` line 18
both declare there is no client base, and `PitchStatus` in `vocabulary.ts` terminates at `booked`.
The record modal's signed section prints an event date and a contract value and stops.

**Everything in this application happens before somebody buys. Nothing happens after.**

## THE HONEST CONSTRAINT, AND THE RESOLUTION

The venue has not opened. There are exactly two signed contracts, **both still in the future**, on
20 November and 12 December 2026. There is no back catalogue and inventing one is forbidden.

**So this is a clock, not a history.** The screen does not show what customers did last year. It
shows what is coming, when each window opens, and what has to happen the day after each event. That
is genuinely the job on day one of a venue that has not opened, and it is more honest and more
interesting than a fake archive.

`RESEARCH_accounts.md` establishes that the seed already carries what is needed: the two contracts
plus the `buyingWindow` field that 102 rows already have generate **five dated windows and eight
dated traces across twelve months**. The screen is not empty.

## THE MODEL, ALREADY RESEARCHED AND DECIDED

Read `RESEARCH_accounts.md` in full before implementing. The load bearing decisions:

**1. Anchor on the next named occasion, not on an anniversary.** This is the finding that overturns
the obvious design. Heights Christian's `buyingWindow` is "Dec, May-Jun, Jun-Aug" and Team Kwon's is
"Jun + Dec". **Neither of Brea's two accounts is annual.** An anniversary model would be wrong for
both of them on day one. Team Kwon's cycle is externally corroborated: CalSMA publishes belt tests
roughly every two months and dan tests every six.

**2. Five traces per occasion**, an anchor date plus a signed offset: confirm at minus 1, debrief at
plus 1, review ask at plus 7, place the next one at plus 14, then the window opens and closes
anchored on the occasion at segment specific leads. Corporate holiday 120 and 60. Banquets 70 and
30. Grad night 365 and 120. Belt tests 90 and 21.

**3. Health is two independent readings, not one score.** Contact staleness ports from
`selectors/partners.ts` verbatim. **Purchase staleness does not**: `stalenessOf` would read "gone
quiet" for eight months of a perfectly healthy annual account. The fix is one division,
`overdueRatio = daysSinceLast / cycleDays`, bucketed at 0.75, 1.00 and 1.25. The discrete churn
event is **missed windows**: one is at risk, two is lapsed. That is scale free and works for a two
month cycle and a twelve month cycle alike.

**4. A separate `AccountState`.** Do not extend `PitchStatus`; it is an acquisition ladder and it
should stay one. An account is a different object with a different life.

**5. The four figures at the top:** rebooking rate (windows closed with a signature over windows
closed), accounts on cycle, revenue retained, events per account per year.

## WHAT MUST NOT BE LOST

- **Two ledgers, revenue and activity, never summed.** Merchandise money is a third thing and cup
  money is a fourth. An account does not become a fifth: retained revenue is the same `BookLine`
  money seen down a different axis, and the screen must say so rather than implying new money.
- Every commercial figure carries a `ProvenanceBadge`. Nothing about Main Event is invented.
- **No invented people.** Roles and titles only. No invented past events, no fake repeat history.
- Colour is never the only signal. The owner is colourblind.
- Both grounds. No `[data-theme]` selector outside `tokens.css`.
- Keyboard, visible focus, 44px on a coarse pointer, `aria-live` on changing counts, 380px as a real
  layout, `prefers-reduced-motion` honoured.
- **No em dashes, no en dashes, no arrows** in any human readable text including code comments.
- No raw hex outside `tokens.css`. British-ish spelling. Labels, verbs and numbers, no instructional
  prose.

## THE NAV BUDGET

The marquee is full: six queue keys plus the featured Maps plate, standing down at measured widths.
**Do not add to it.** Accounts belongs under `/book` in the rail, beside the week sheet and capacity,
because it is the other half of the book.

## THE TEST

Open it and ask: **does a rep know what to do on Monday about somebody who has already signed?** If
the screen only reports the state of the world and does not produce a dated action against a named
organisation, it has failed. The one finding the research says the screen surfaces on first render
is a good example of the bar: Heights Christian's December window opens on 5 October and closes on
14 November, **six days before the event they have already signed**. That is a real conflict, found
by arithmetic, that a person would otherwise miss.
