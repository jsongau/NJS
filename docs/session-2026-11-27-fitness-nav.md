# Session 2026-11-27: the fitness menu, rebuilt around Jay

## What changed
- Tabs: Personal training, What I teach, Nathan's guide, Practice free, About. Striking and Clubs and maces no
  longer have tabs of their own; "Train on your own" is gone.
- What I teach: three hub picks (striking, clubs and maces, yoga and Pilates). A pick swaps in that hub's pages and
  a scene (bag and glove, mace and club, the yoga figure from the Breath Lab).
- Nathan's guide: "What is your week missing?" (mobility, control, engine, skill). A pick swaps in map links near
  each home gym plus the matching gym guides, and recolours the three-gym mini map.
- Practice free: six lab cards whose thumbnails play on hover or focus, plus coach's notes.
- About: the coach, where he trains, and a short true bio card.
- Phone drawer: same links as plain lists (no picks, scenes or thumbnails).
- Earlier the same night: Combo Lab and Swing Lab lookup bug fixed (df8f2dd).

## Decisions
- "Nathan's guide", not rankings or recommendations: no guide is ranked yet, and "I recommend" waits until Jay has
  been to a place. One word changes when the lists are ranked.
- "Glorify" inside the honest-copy rule: true facts only, and generosity as the differentiator.
- Picks are buttons (hover, focus or tap), not links, so touch and keyboard get the same panel. Each pane ends with
  a link to its hub.
- Scenes are plain SVG with CSS keyframes; the two breath figures reuse `breathrigs.js`. Nothing moves unless its
  panel is open, and nothing moves for reduced motion.

## Rejected
- A sixth tab for the labs: the five-tab rule stands.
- Hover-only hubs as links: unusable on touch at tablet widths.

## Traps
- `.top .wrap` is a flex row: a new `.mn-in` variant needs `flex: 1 1 auto; width: 100%` or it shrink-wraps.
- In tests, hover a tab's link to open its panel. Clicking the caret right after the hover closes it again.
- `breathrigs` must come before `meganav` in `ORDER` in `tools/build-preview.mjs`.

## Not done
- Practice free has no page of its own; the tab's own link goes to `/fitness/notes`. A `/fitness/practice` hub
  listing all six labs is the natural next page.
- The three hub pages themselves are unchanged.
- Side-card lines are drafts for Jay to edit.

## Next
- Jay approves or edits tab names and the three side-card lines.
- Plan: `/fitness/practice` hub page; then lab events in `studio_events`.

## Later the same night: the offer, the voice and the coach card

- 12-pack: one price at every place and in-home (in-home also shown per session). Corona includes 3 months of
  access to any Club Studio with every class. Jay must confirm that promise with Club Studio.
- Place cards: equal heights, price and link on one row, an animated emblem each (title belt, round timer, lanyard
  pass, house and kettlebell), each linking to its card in Where I train.
- Voice rules from Jay, now in `docs/MOJO-MEMORY.md` and the philosophy doc: never talk him down, never compare him
  to other trainers, names shown as plain names (Nathan J. Song, Nathan Song, Jiaming Song), decisive wording.
- Focus picker: tried uncapped, reverted the same night. Two goals for the first twelve weeks; more dilutes.
- SHRED: off the hero, the home coach card text and the menu. It sits behind "My record" with a hover note, and
  stays on the coach page.
- Home coach card: new scene `partials/fitness/art/art-coach.html` (a jab then a cross, timed like a fighting-game
  hit). The thumb is a tapered sleeve from the wrist; a webbing strap at its tip was tried and removed.
- Traps: the pack cards also render on pages with no Where I train section, so their links must be
  `/fitness#where-…`, not `#where-…`; a meta description over about 165 characters fails the title test.
- Open: 5 or 7 days a week coaching (home says 5, coach page says 7). Waves 2 to 5: the NJS Studio · Fitness
  rename, name-led titles and descriptions, the three gym pages (need manager OKs), section-by-section copy.
