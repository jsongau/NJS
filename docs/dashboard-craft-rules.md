# Dashboard craft rules

A checklist to build against and audit against. Researched 8 August 2026
from the W3C ARIA Authoring Practices Guide, Nielsen Norman Group, IBM
Carbon, Amplitude and Mixpanel funnel documentation, and Tufte on
sparklines.

Every rule is an imperative. If a build in this repo fails one, either fix
it or write down why the exception is correct.

---

## Tabs

1. **Underlined tabs switch content. Segmented controls re express the same
   content.** Daily/Weekly/Monthly and Table/Chart are segmented controls.
   Different metric sets are tabs. Pill tabs read as consumer app; skip
   them on an analytics surface.

2. **Signal the active tab with three quiet cues:** +100 font weight, full
   strength text colour against 60% for the rest, and a 2px indicator bar
   flush to the tab list's bottom border. Do not fill the active tab with
   a solid accent block. Never rely on colour alone, that fails WCAG 1.4.1.

3. **Implement the tablist per APG or use plain buttons with no ARIA.**
   Container `role="tablist"` with `aria-label`. Each tab `role="tab"`,
   `aria-controls`, `aria-selected`. Each panel `role="tabpanel"`,
   `aria-labelledby`. Roving tabindex: active tab `0`, others `-1`. Left
   and Right arrows move and wrap, Home and End jump to first and last,
   Tab moves out of the list into the panel. Half implemented ARIA is
   worse than none.

4. **Activate on focus when panels are preloaded client side.** APG
   recommends automatic activation where there is no latency. Practitioners
   disagree and prefer manual activation; automatic is correct for a
   single file dashboard with all data in memory. Be ready to say why.

5. **Cap at 5 tabs, 7 is the hard ceiling.** Beyond that it is a menu
   problem. Write the active tab to `location.hash` so state is linkable
   and survives reload. A reviewer who reloads and loses state reads it
   as a demo.

---

## Sortable columns

6. **Wrap each sortable header's text in a `<button>` and set `aria-sort`
   on the `<th>`.** Only the sorted column carries it. Make the button
   fill the whole header cell.

7. **If unsorted columns show an idle glyph, make it a different shape,
   not a faded version.** APG uses a diamond for sortable-unsorted and
   solid triangles for active, because shape must carry the difference for
   low vision users. Use character entities so glyphs survive Windows
   High Contrast.

8. **Set a meaningful default sort.** First click on numeric or date sorts
   descending, first click on text sorts ascending. Sort must be stable
   with a documented tiebreaker so ties never reshuffle between renders.

9. **Skip multi column sort.** Rarely used, hard to discover, expensive to
   do correctly. If built, require Shift click, show ordinal badges, and
   ship a visible "Clear sort".

10. **Announce sort and filter changes in an `aria-live="polite"` region.**
    One short string: "Sorted by conversion rate, descending. Showing 12
    of 240 rows."

11. **Only offer column visibility control above roughly 8 columns**, as a
    single "Columns" button at top right showing the hidden count. Below
    that it is decoration that adds state you must persist and explain.

12. **Drill down by payload size.** Expand in place for detail under one
    screen, non modal side panel for a full record, never navigate away.
    Allow one expanded row at a time, mark it with a 2px accent left
    border, set `aria-expanded`.

---

## Trend and comparison

13. **Size sparklines as word sized graphics:** roughly 20 to 24px tall by
    80 to 120px wide, 1.5px stroke, no axes, no gridlines, no labels
    inside. Mark only the final point with a 2.5px dot and print the
    current value beside it.

14. **Scale every sparkline in a column to a shared y range, or say in the
    header that each is scaled independently.** This is the single biggest
    way sparklines lie. Either choice is defensible; doing one silently
    while the reader assumes the other is not.

15. **Suppress the sparkline below 8 data points and never interpolate
    across gaps.** Fewer than 8 points is a shape you invented. Render
    missing periods as a break, not a straight segment.

16. **Format deltas as shape, explicit sign, value, labelled baseline:**
    `▲ +12.4% vs prior 28d`. Filled triangle, not an arrow glyph, which
    also honours the no arrows rule in this repo. Give both forms when the
    base is small: `+312 (+12.4%)`. One decimal maximum. Tabular figures.

17. **Drive delta colour from a per metric `goodDirection` field, never
    from the sign.** Churn rising is red even though it went up. Cost per
    acquisition falling is green even though it went down. One extra field
    in the metric config is the difference between a dashboard that
    understands its metrics and one that just renders them.

18. **Suppress the percentage delta entirely when the prior period base is
    below 30 and show raw counts instead.** "+400%" on 1 to 5 is noise
    wearing a suit. This rule does more for perceived rigour than any
    visual treatment.

19. **Prefer small multiples above 4 series.** Identical size and y scale,
    sorted by magnitude not alphabetically, capped around 12 panels, each
    with a text label rather than a shared legend.

20. **Draw a target as a 1px dashed rule with the label at the right end,
    inside the plot, 60% opacity, never filled underneath.** Show the gap
    as an annotated number, for example "4.2 points to target", rather
    than asking the reader to measure pixels.

---

## Funnels

21. **Do not draw a funnel shape where the product does not enforce
    sequence.** A taper claims ordering, exclusivity and monotonic decline
    at once.

22. **Split into a linear spine and a branch panel.** Stepped bars for the
    genuinely ordered part. At the branch node, stop and open a block whose
    header states the shared denominator in words, for example
    `Of 96 verified accounts, within 30 days:`. One row per parallel
    action with count, percent of that denominator, and a bar scaled to
    that same denominator. Sort by count descending.

23. **Do not use a Sankey for overlapping actions.** A Sankey encodes a
    partition. If one person can do three of the actions, it double counts
    or forces invented buckets.

24. **Print the denominator in text beside every rate and name which
    denominator it is.** Amplitude and Mixpanel genuinely disagree on
    which denominator a funnel step uses, so an unlabelled percentage is
    ambiguous to an expert.

25. **State the conversion window and the counting unit, and use non causal
    language.** Write "of users who reached step X", never "drove",
    "caused" or "lifted". Say "unique users" or "events" explicitly.

---

## Credibility

26. **Publish an explicit small n policy in a legend and follow it.**
    Suggested: below 30 shows counts only with a muted marker, 30 to 99
    shows the percentage with a low confidence marker, 100 and above shows
    normally. Arbitrary but stated beats unstated.

27. **Mark every modelled or assumed value with a persistent visible glyph
    plus a footnote, not a tooltip alone.** A superscript dagger or a
    dotted underline, a legend line reading `† modelled, not measured`,
    and a one sentence method note. Tooltip only flagging fails on touch,
    on print, and on screenshot, which is how the work actually gets seen.

28. **Put provenance in the frame, not the footer.** Source, as of
    timestamp, refresh cadence, visible without scrolling.

29. **Audit against the distrust list.** Remove any hit: truncated or
    unlabelled y axes, percentages to 2 decimals on tiny samples, totals
    that do not reconcile with their parts, conversion rates above 100%,
    pie charts over 5 slices, 3D or gradients that encode nothing, a
    missing or stale "last updated", rounded numbers that change when you
    sort, legend colour order not matching stacking order.

---

## Visual craft

30. **`font-variant-numeric: tabular-nums` on every numeric cell.** Right
    align numbers, left align text, fix decimal places per column so
    decimal points stack. Consistency within the column beats accuracy per
    cell: if one row needs one decimal, every row gets one decimal.

31. **Abbreviate only above 10,000, only where space is constrained, never
    in a column being compared across.** `1.2K` versus `1,200` costs
    precision to save two characters. Full numbers read as the more senior
    choice.

32. **One accent hue plus two semantic hues, categorical series capped at
    6.** Beyond 6, colour stops identifying and starts decorating. Never
    encode meaning in red and green alone, roughly 8% of men have a red
    green deficiency. Pair colour with shape, sign or position.

33. **Row height 36 to 40px, cell padding 12px horizontal and 8px
    vertical, body type 13px at 1.4 line height, 1px dividers at 8 to 12%
    foreground opacity.** That reads as an analytics tool. 56px rows with
    16px type and per row shadows read as a consumer app. Hover highlight
    instead of zebra striping under 40px rows, and never both.

34. **Freeze the header row and the identifier column once the table
    exceeds the viewport.** First column is a human readable identifier,
    never a generated ID. Order columns by importance with related columns
    adjacent.

35. **Dark theme: no pure black background, no pure white text.** Around
    `#0F1115` to `#14171C` for background, body text near `#E4E7EB` at
    roughly 87% rather than pure white. Desaturate accents, bright
    saturated hues bloom against dark. Treat 3:1 as the floor for
    graphical objects. Add 0.5px to line weights and 1px to sparkline
    strokes. Avoid `rgba()` greys for dividers since they compose
    differently over cards than over the page; use solid tokens. In a dark
    sequential ramp the lightest colour denotes the largest value, the
    reverse of light theme.

---

## The three things most likely to be wrong in any build

1. **The branching funnel.** Rules 21 to 25. This is the part a numerate
   reviewer actually judges. A Sankey looks more impressive in a
   screenshot and is wrong, and the wrongness is legible to anyone who has
   run funnel analysis for a living.
2. **Independently scaled sparklines.** Rule 14. Almost every hand rolled
   dashboard does this and almost none label it.
3. **Delta colour driven by sign instead of by goodness.** Rule 17.

---

## Concept to remember

**Denominator transparency.** Every rate is a fraction and the bottom half
is where dashboards lie, usually by omission. Printing "412 of 1,240"
beside "33.2%" costs twelve characters and buys the reader's trust in
every other number on the page. Look it up under base rate transparency,
and for the trap it prevents, Simpson's paradox.
