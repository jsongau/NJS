# 2026-08-17. The ground switch is redrawn as a cap in a slot

## What was asked

> "make the color toggle button design better"

## The finding, before any drawing

The switch was not wrong. It was drawn as two painted ends with a hollow two
pixel ring over the live one, and every signal it was designed to carry was
present and measurable. It read badly anyway, and at the size it actually
ships the reason is plain: the ring is the rule ink, on a plate of the same
ink, with the same corner radius as the plate around it and as the six
destination keys beside it. Nothing about it had a silhouette. The eye did not
pick out the piece that moves, which is the only test a state indicator has to
pass. A signal that measures correctly and is not seen has failed.

## The constraint that shaped the answer

The obvious fix is a bigger track and more room per glyph. That is the one
thing this control cannot have. `audit-strip-fit.mjs` records the strip
needing 888px against a breakpoint of 899, so eleven pixels is the whole of
the margin, and widening the switch by twelve would have broken the mega nav
at exactly one width and nowhere else. Every candidate was therefore held to
the same footprint, and the shipped one measures 99.05px by 44px, which is
what it measured before.

Three were drawn and shown at both grounds, at one to one and at three times,
in greyscale, and with the word dropped as it is below 400px:

- **The lever.** The same parts, made properly: a pill slot and a ring held
  two pixels clear of the walls. Smallest change, still a frame.
- **The cap.** One surface fewer. Chosen.
- **The rocker.** No knob at all, the live half pressed into the housing. The
  state signal becomes a shadow, which is the one thing greyscale, a
  projector and a photograph can flatten. Rejected on that.

## What shipped

The slot is painted `--surface-inverse` end to end, which is the ground the
reader is NOT on. Both glyphs are cut into it. A solid cap of `--surface-0`,
the page's own paint, sits over the ground they are on and travels to the
other end on a press over `--dur-1`.

The glyphs sit ABOVE the cap rather than under it, and that is the whole
reason nothing is drawn twice. The live glyph is `--text-0` on `--surface-0`
and the dead glyph is `--text-inverse` on `--surface-inverse`, which are
exactly the two pairs the contrast tables in `tokens.css` are already written
against: 16.97 and 13.86 on dark, 16.24 and 15.47 on light. There is no
`[data-theme]` rule in `MegaNav.module.css` and the control has no colour of
its own, in either ground.

The four signals that are not colour all survive and one of them is stronger:

| Signal | Where it lives now |
| --- | --- |
| Position | the cap is at the moon end or the sun end |
| Fill | cap against slot, measured at 220 and 222 of 255 apart in greyscale |
| Glyph | a solid crescent against a radiating disc, unchanged |
| Word | printed beside the switch, unchanged, dropped below 400px |

## The trap this session found, which is the reusable part

Moving the cap to the front of the markup broke two measurements without
breaking the application, and both would have reported a working control as
defective:

1. `proof-ground.mjs` took the cap as `track.lastElementChild`. True only
   while the cap happened to be last. It is now first, so that read would have
   measured the sun glyph and reported the switch as stuck at the dark end.
2. The same file measured the value distance as the background colours of the
   two ends. The ends now carry ink and no fill, so it would have compared two
   transparent boxes and called a 220 of 255 separation a failure.

Both are the same error the project has now hit six times: **the measurement
was written against an implementation detail rather than against the thing it
claims to prove.** The fix is the same each time. The cap carries `data-cap`,
the proof finds it by that name, and the value distance is now read from the
cap against the slot, which is where the value distance actually is. A hook a
proof depends on is part of the component, so it is written into the markup
with the reason beside it.

## Proof

- `proof-ground.mjs`, 37 checks, all pass. Includes the greyscale separation
  at both grounds, the cap position at both ends, no flash on a cold load in
  either ground, keyboard reach, the 44px target at 380 and reduced motion.
- `contrast-walk.mjs`, 0 failures of 97,432 text nodes on dark and 0 of 97,432
  on light.
- `audit-strip-fit.mjs`, every width from 1440 down to 360, no overlaps and no
  document overflow.
- `check-post-build.mjs dist 297`, 298 index.html files, no product
  photography.
- `check-build-is-committed.mjs`, 302 files, byte for byte. The copy onto the
  Mac was verified again by sha256 manifest, all 302 matching.

## Next

Unchanged and still the highest value thing on the list: the 211 prospects out
of the compiled bundle and into a real database, with a table recording
outreach so the daily queue reflects what happened rather than a static sort.
Schema and API before any UI.
