# THE SAAS TURN. Read this in full before anything else.

Several agents are working at once. This file is the shared brief. It supersedes the voice guidance
in `AGENT_BRIEF.md` wherever the two disagree; everything else in that file still binds.

## WHAT THE OWNER SAID, AND HE IS RIGHT

> "the entire thing feels more like a thing to build rather than an actual dashboard ... why does it
> feel more like an editorial than an actual SAAS"

He is right, and the cause is known. The original brief told every agent to write prose "a hiring
manager would stop and read". So every screen now explains itself, teaches itself, and justifies
itself, in the middle of the working surface. That is an essay about a tool, not a tool.

He quoted this as the kind of thing to kill:

> "Start with the one at the top, or pick any of them. Every card in the list carries its own write
> button, so a message to any of them is one press. The card and the pins are buttons too, so Enter
> works as well as a click and the arrow keys move between them."

That is a manual printed on the wall of the room it describes.

## WHAT THIS PRODUCT ACTUALLY IS

> "this platform needs to function like i am scouting for businesses around brea to serve main event
> to ensure bookings. this platform is supposed to help me prospect clients and easily track what
> they have said and when to book them."

**It is a prospecting CRM for one person.** He works a territory around Brea, contacts schools,
local businesses and chains, tracks what each said and when to go back, and books group events.
Every screen should serve that loop and nothing else.

It is also a work sample a hiring manager will open. That tension resolves in exactly one way: **the
argument lives in one place and the rest is a tool.** `/method` keeps every formula and source.
Today gains a short "why I built this" panel, collapsed by default, that says what the tool is for
and what it proves. Everywhere else, the prose goes.

## THE VOICE RULES, WHICH REPLACE THE OLD ONES

**DELETE, everywhere:**
- Instructions for using the interface. "Start with the one at the top." "Every card carries its own
  write button." "Click a row to open it." If a control needs a sentence explaining it, the control
  is wrong; fix the control.
- Paragraphs justifying a design decision on a working screen. Move them to `/method` or delete.
- Second person coaching. "You will see", "you can", "this lets you".
- Sentences that restate what is visibly on screen.
- Any explanatory paragraph longer than two lines on a screen that is a list, a map or a queue.

**KEEP, because it is data and not decoration:**
- Provenance badges and the withheld sentence. These are facts about the figures.
- A one line note where a number would otherwise be misread, tucked as a tooltip, a footnote or a
  disclosure, not a paragraph.
- The honest labels: "modeled", "illustrative", "no response time is published".
- `/method` in full. That page is the argument and it stays long.

**THE NEW REGISTER:** labels, verbs and numbers. A SaaS screen says "Overdue 12", not "Twelve
enquiries are past the response commitment, which is a service target this venue set for itself."
The second sentence belongs on `/method`. Where a term genuinely needs defining, use a small info
affordance that reveals on demand, never a block of standing text.

Code comments are exempt. Keep writing those well; nobody sees them but the reader of the source,
and they are part of why this codebase is good.

## THE PRODUCT MOVES HE ASKED FOR

1. **Prospect status filters in the rail.** Contacted, in conversation, held, booked, lost, never
   touched. Clicking one filters the working set. The rail's job is to change what is on screen.
2. **An inbox.** Messages received and sent, threaded per organisation, auto categorised. A real
   two-way surface, not just an outbox.
3. **Add a prospect.** He is scouting; he will find businesses that are not on the board.
4. **Type filter with icons.** School, local business, chain business. This is a different cut from
   the nine lanes: it is about who owns the decision, and a chain is different from an independent
   because the decision is not in the building.
5. **A profile modal, opened by clicking the business name.** Last conversation, current status,
   whether they have shown intent to commit, and what discount or offer has been extended. This is
   the record a rep actually opens twenty times a day, so it has to be fast and complete.
6. **Rich mock data.** Enough conversations, statuses and offers across the 102 organisations that
   the tool can be judged in use rather than imagined.
7. **The floating cards must minimise and close.** He named the offers card specifically.
8. **The map must feel smooth and legitimate.**
9. **Make it satisfying to use.** He said "fun to use like u want to use it with daily quests etc".
   Read that as: the daily loop should have a shape, visible progress and a reason to come back.
   Points for their own sake would be a toy. Progress against real work is a product.

## WHAT MUST NOT BE LOST

- Every figure keeps its provenance. The withheld sentence never becomes a number.
- Nothing about Main Event is invented. The research files are the boundary.
- Colour is never the only signal. The owner is colourblind. Glyph plus word plus colour, always.
- No invented people. Roles and titles only.
- Two ledgers, revenue and activity, never summed.
- Keyboard, focus, 44px targets, `aria-live` on changing counts, 380px as a real layout.
- No em dashes, no en dashes, no arrows in any human-readable text including comments.
- No raw hex. Tokens only.

## HOW TO KNOW YOU ARE DONE

Open your screen and ask: **could a competent rep use this without reading anything?** If any
sentence on it exists to teach rather than to inform a decision, delete the sentence and fix the
control it was apologising for.
