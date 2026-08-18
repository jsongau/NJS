# TWO GROUNDS. Read this in full before anything else.

Four agents are working at once. This file is the shared brief for this wave and it sits on top of
`CONTRACT_arcade.md` and `CONTRACT_saas.md`, which still bind.

## What the owner asked for

> "can i get a light version too so create a toggle to change between light and dark"

## What this actually is, and why it is worth doing properly

The palette is generated. `scripts/theme_cabinet.py` states every colour as `C(lightness, chroma,
hue)` in CIELAB, solves the twenty section hues for dichromatic separation, and emits both the CSS
and the contrast tables in the comments. Nothing in `tokens.css` was typed by hand.

That is what makes a second theme a half day rather than a rewrite, and it is the point worth
making on `/method`: **a toggle is evidence that the design system is real.** A codebase with
hardcoded colours cannot grow a second theme without a thousand edits. This one changes a table of
lightness values.

**The hues carry the identity. The lightness carries the ground.** The light theme keeps hue 300
for the violet ink, 205 for the electric cyan, 336 for the magenta signal, 62 for the feature
orange, and the twenty section hues at their solved 18 degree spacing. Only the lightness values
move. Get that right and both themes are obviously the same product; get it wrong and the light
theme is a different application wearing the same layout.

## THE CONTRACT, which every agent builds against

1. **`<html data-theme="dark">` or `<html data-theme="light">`.** Nothing else selects a theme.
2. **Dark is the default and the fallback.** It is what renders if JavaScript never runs, if
   storage is unavailable, or if the attribute is missing or misspelt.
3. **Every token keeps its name in both themes.** This is a value level change. Sixty odd CSS
   modules reference these names; a rename is an API change disguised as a paint job.
4. **No component may know which theme is active.** No `[data-theme="light"] .thing` rules outside
   `tokens.css`. If a component needs to differ, that difference is a token.

### The one that will catch somebody out

`--surface-inverse` and `--text-inverse` do NOT mean "dark surface" and "light ink". They mean
**"the inverted panel"** and **"the ink that sits on it, and on any bright fill"**. On the dark
theme the inverted panel is a lit cream and `--text-inverse` is a dark ink. On the light theme both
flip back. A component that assumes either direction is broken in one of the two themes, and it
will look fine to whoever wrote it.

## What must survive, in BOTH themes, measured in BOTH

- `node scripts/contrast-walk.mjs` reports **zero failures**, currently zero of 30,044 nodes on
  dark. It must report zero on light as well, which means the walk has to learn to run both.
- The nine lane ramp holds its dichromatic CIEDE2000 floor. It is **10.00** on dark under simulated
  protanopia, deuteranopia and tritanopia. Light may differ but must not drop below 8.
- The twenty section triples stay separable, adjacent pairs especially.
- `--line-strong` clears 3:1 against the hardest surface it is painted on. On dark that is 3.26.
- Colour is never the only signal. Nathan is colourblind. Glyph plus word plus colour, in both.
- Greyscale: the nine lanes still resolve into three value bands.

## House rules, unchanged

**No em dashes, no en dashes, no arrows** in any human readable text including code comments. No
raw hex outside `tokens.css`. British-ish spelling. No instructional prose: labels, verbs and
numbers. Keyboard, visible focus, 44px on a coarse pointer, `prefers-reduced-motion` honoured.
Nothing about Main Event invented. No invented people. Comments explain WHY in confident plain
prose.

## The test

Open every route in both themes and ask the same two questions. **Could a competent rep use this
all day without reading anything?** And **does it still look like the same product?** A light theme
that is merely legible is a failure; it has to be the same application with the lights on.
