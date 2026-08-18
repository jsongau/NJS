# THE ARCADE TURN. Read this in full before anything else.

Four agents are working at once. This file is the shared brief for this wave. It sits on top of
`AGENT_BRIEF.md` and `CONTRACT_saas.md`, which still bind. Where this file disagrees with either,
this file wins.

## WHAT THE OWNER SAID

> "the color pallete is still the boring AI style. gimme more cyberpunk main event in the arcade
> feel like cooking mama spatoon fused goodness like actually fun play section. every navigation
> section can be a section of play."

He has now asked twice. The first attempt moved a cool paper ground to a warm paper ground, which
is a better paper and still a paper. **This wave commits.** Nobody hedges, nobody proposes a
"tasteful nod to arcade", nobody keeps a safe fallback theme in the file.

He also asked for:

> "make the email modal better where you can see the draft on open so design it maybe like split
> screen style where selecting something will change the email on the right side and the email has
> open to send or copied like as if a resend is built connected to it"

> "we also need the bowling tournament elements to see ranking of best of 16 bowling leagues and
> there can be 2 leagues going right now and teams and sign up options and team formation etc. that
> sends us email to inquire and new league forming and request to join etc. and if leagues are
> welcoming joining and have funny cool names for each they are cool and awesome and from themes of
> different games or tv shows and relevant pop culture right now."

## THE REFERENCE, DECODED

Three sources, and what each actually contributes:

- **Splatoon.** Ink. High chroma acid green, hot magenta and electric orange thrown at a near black
  ground in shapes with edges that are not rectangles. Chunky angled display type. Colour used at
  full strength and never apologised for.
- **Cooking Mama.** Warmth and chunk. Thick outlines, rounded corners, oversized friendly numerals,
  a sticker quality, feedback that celebrates. It is bright and it is kind.
- **Cyberpunk.** A dark ground with light that appears to emit rather than reflect. Rules that glow.
  A monospaced numeral that reads as a readout rather than as a figure in a report.

The synthesis is **an arcade cabinet**: a dark housing, a bright screen, marquee type, and colour
that is the point rather than the decoration.

## THE ONE THING THAT CANNOT BE TRADED AWAY

**The owner is colourblind.** Every status, state, lane and result carries a glyph AND a word AND a
colour, in that order of importance. A neon palette makes this harder and more important at once,
because saturated hues collapse toward each other under dichromacy far more than muted ones do.

The previous wave measured this properly and the tooling exists: `scripts/colorlab.py` implements
WCAG 2.x relative luminance, CIELAB, CIEDE2000 and the Vienot, Brettel and Mollon (1999) dichromacy
simulation, and `scripts/contrast-walk.mjs` walks every rendered text node in a real browser at two
widths, alpha compositing down the ancestor chain, size and weight aware. **Both must exit clean.
Loud is not an excuse; it is the constraint that makes the work worth showing.**

## WHAT IS STILL TRUE

- Nothing about Main Event is invented. The research files are the boundary.
- No Main Event logo, wordmark, trade dress or sampled brand colour. Every colour is constructed.
- Two ledgers, revenue and activity, never summed. Merchandise money is a third thing.
- Every commercial figure carries a ProvenanceBadge. The withheld sentence never becomes a number.
- No invented people. Roles and titles only.
- Keyboard, focus, 44px targets, aria-live on changing counts, 380px as a real layout,
  prefers-reduced-motion honoured by every single animation added this wave.
- **No em dashes, no en dashes, no arrows** in any human readable text, including code comments.
- No raw hex outside `tokens.css`. Tokens only.
- No instructional prose on a working surface. Labels, verbs and numbers.

## THE TEST

Open your screen and ask two questions. **Would a competent rep use this all day without reading
anything?** And **does it look like somewhere you would want to spend a Friday night?** The first
question has been passing for a week. This wave is about the second one, without losing the first.
