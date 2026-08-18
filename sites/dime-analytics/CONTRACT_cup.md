# THE CUP. Read this in full before anything else.

Several agents are working at once. This file is the shared brief for this wave and it sits on top
of `CONTRACT_arcade.md`, `CONTRACT_two_grounds.md` and `CONTRACT_saas.md`, which still bind.

## What the owner asked for

> "scrape the internet for tournament setups and ufc ultimate fighter displays and how to advance
> and schedule team style advancements and tournament style buildout and display and to showcase the
> strength of the players ... have like team captain setups and allow teams to be clickable with team
> captain having individual profiles and how much they paid to register the team and/or if they
> created the team of if the league was created by main event with allowance for other public members
> to join. the league needs to be setup really cool so we have 1 special cup per quarter so hype it
> up and allow enrollment for next cup in January actualy and mock playing right now and advancement
> and showcase setup for excitement and build up of match ups. scrape for all boxing stuff and allow
> boxing stats to be recorded and record and ball preferences in profile and stuff to make it unique
> and fun to enroll which may eventually lead to message boards and forums and talks in the main
> event brea portal for league creation."

## THE THREE CONSTRAINTS THAT SHAPE EVERYTHING, AND HOW EACH IS RESOLVED

These are not obstacles to route around. Each one has a resolution that is better than the naive
version, and the resolutions are already decided. Do not relitigate them.

### 1. NO INVENTED PEOPLE. The resolution is HANDLES.

This application has never invented a person and it is not starting now. Every organisation on the
board is real, every contact is a role and a title, and nine organisations were excluded rather than
guessed at. That discipline is the reason a hiring manager believes any of the other numbers.

A captain profile and a player card look like they need a name. **They need a handle.**

Bowling leagues, darts leagues, pool leagues and every fantasy sport on earth run on handles, and a
handle is not a claim about a person: nobody reads "Gutterball Supreme" and believes a specific
human is being described. It is also better for this product, because the arcade register wants a
handle far more than it wants "David M."

So: **every bowler is a handle plus a role.** "Anchor", "Lead", "Second", "Third" are positions and
they are already in `data/leagues.ts`. A captain is a handle plus the position "Captain". Where a
team came off the prospecting board, the organisation is real and named and the bowlers are still
handles.

**A handle is never presented as a person's real name and no screen implies otherwise.** One line
somewhere sensible says bowlers appear as handles. That is the whole disclosure and it is true.

### 2. THE BUILDING IS NOT OPEN. The resolution is a DECLARED EXHIBITION.

He wants "mock playing right now and advancement". Nobody has bowled a frame in a building that has
not opened, and inventing a played season would be the single most damaging thing this wave could do.

So the live cup is **a declared exhibition**: a simulated run of the format, generated so the bracket,
the advancement and the matchup build up can all be judged in use, and labelled as simulated
everywhere a score appears. Not hidden in a footnote. On the bracket, on the card, on the figure.
`illustrative` provenance, and the word "simulated" or "exhibition" in the visible label.

**The enrollment for the next cup is real product and is presented as real product**, because
enrolling is a thing a person can genuinely do before a building opens. That is the whole premise of
the application.

### 3. MAIN EVENT PUBLISHES NO LEAGUE PRICE. The resolution is a PROPOSED FEE, labelled.

He asked for "how much they paid to register the team". `data/leagues.ts` already establishes that no
dollar amount for a league appears on Main Event's leagues page, and that neither Bowlero nor Lucky
Strike publishes one either. That finding stands and the existing withheld block stays.

A registration fee may therefore appear **only** as this application's own proposal, badged
`illustrative`, in the same voice the response commitment already uses: "the venue's own, invented
for this prototype, and not a claim about how Main Event operates." Never as a Main Event price.

Same rule for the January enrollment window and the quarterly cup calendar. **Main Event has not
announced a cup.** This is a proposed programme and it says so.

## WHAT TO BUILD

**One special cup per quarter.** A named cup, a format, a field, a bracket, and a build up. The one
currently running is the declared exhibition. The next one takes enrollment now.

**Teams are clickable and have their own surface.** Roster by handle and position, captain, the
organisation it came from where there is one, how it formed, and its run in the cup.

**Bowler profiles.** A handle, positions played, a record in the exhibition, and the personal detail
he asked for: **ball preferences.** Weight, coverstock, surface, whether they carry a spare ball.
This is real bowling texture, it is cheap, and it is the thing that makes a profile feel like a
person rather than a row.

**How a team came to exist matters and must be visible.** Three routes, and they are genuinely
different products:
- the venue formed the league and the public joins it
- a captain formed a team and brought a roster
- an organisation off the prospecting board formed a team

**The matchup build up.** This is the UFC and boxing part of the ask, and the research agents are
finding the real conventions. A tale of the tape between two teams, seeds, form, the stat that
decides it, and a next-match card that makes a person want to be there.

**Message boards are NOT in scope for this wave.** He said "may eventually lead to". Leave a place
for it in the information architecture and do not build a forum.

## WHAT MUST NOT BE LOST

- Two ledgers, revenue and activity, never summed. League money is its own thing again and merchandise
  money is a third. Do not add a cup fee to any of them.
- Every commercial figure carries a `ProvenanceBadge`.
- Colour is never the only signal. The owner is colourblind. Glyph plus word plus colour, always.
- Both grounds, light and dark. No `[data-theme]` selector outside `tokens.css`.
- Keyboard, visible focus, 44px on a coarse pointer, `aria-live` on changing counts, 380px as a real
  layout, `prefers-reduced-motion` honoured by every animation.
- **No em dashes, no en dashes, no arrows** in any human readable text including code comments.
- No raw hex outside `tokens.css`. British-ish spelling. No instructional prose: labels, verbs and
  numbers.

## THE TEST

A bracket is the easiest thing in software to make look impressive and the hardest to make useful.
Open it and ask: **does this tell a rep what to do on Monday?** Who is enrolled, who is not, which
matchup is worth promoting, and which team is one conversation away from bringing four more people
into the building. If it is only a pretty tree, it has failed.
