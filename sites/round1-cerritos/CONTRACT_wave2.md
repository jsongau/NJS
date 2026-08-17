# WAVE 2 CONTRACT — read this, then `AGENT_BRIEF.md`, then your section of `SPEC_expanded_map.md`.

Seven agents are working in this tree at the same time. This file is what keeps you out of
each other's way and what keeps the result feeling like one product rather than seven.

## 1. FILE OWNERSHIP IS ABSOLUTE

You write ONLY the files listed in your own task. If you need something changed in a file you do
not own, **do not change it**. Use what exists, and say so in your summary. A silent edit to a
shared file will be overwritten by whoever owns it and your work will vanish.

Ownership map:

| Agent | Owns |
| --- | --- |
| foundation | `domain/types.ts`, `domain/lanes.ts`, `domain/vocabulary.ts`, `styles/tokens.css`, `data/prospects.ts`, `data/prospectStatus.ts`, `data/venue.ts`, `data/objections.ts`, `state/PipelineProvider.tsx`, `state/BookProvider.tsx`, `domain/selectors/desk.ts` |
| map-logic | `lib/map/cluster.ts`, `domain/selectors/mapBoard.ts` |
| email | `lib/email/templates.ts`, `components/email/EmailComposeModal.tsx` + `.module.css` |
| floating-cards | `components/map/MapLegend.tsx`, `MapLegend.module.css`, `OffersCard.tsx`, `OffersCard.module.css`, `ProspectMapPopup.tsx`, `ProspectMapPopup.module.css` |
| left-pane | `components/map/ProspectListPane.tsx`, `ProspectListPane.module.css`, `ProspectListCard.tsx`, `ProspectListCard.module.css`, `OccasionSegment.tsx`, `OccasionSegment.module.css` |
| right-pane | `components/map/ProspectDetailPane.tsx`, `ProspectDetailPane.module.css` |
| map-canvas | `components/map/MapCanvas.tsx`, `MapCanvas.module.css`, `ClusterLayer.tsx`, `ClusterLayer.module.css` |

Nobody owns `src/app/App.tsx`, `src/app/AppShell.*`, `src/components/primitives/*`, or any finished
page. Do not touch them.

## 2. THERE IS A NINTH LANE

`local-retail-food` is being added to the `Lane` union by the foundation agent, in parallel with
your work. Its occasion class is `discretionary`. It covers boba counters, small food franchises,
mall tenants and independent retail: businesses of 8 to 60 staff whose owner-operator is the entire
approval chain and who buy a staff appreciation night rather than a scheduled banquet.

**The rule that makes this a non-event for you: NEVER HARDCODE A LIST OF LANES.**

- Iterate `LANE_ORDER` from `@/domain/lanes`. Never write your own array of lane keys.
- Read labels, glyphs, colours and occasion class from `LANE_META[lane]`. Never write your own.
- Colours come from `LANE_META[lane].cssVar`, applied as `var(${meta.cssVar})`. Never a raw hex,
  never a hand-written `--lane-schools`.
- If you genuinely need a `Record<Lane, T>` of your own, build it with
  `Object.fromEntries(LANE_ORDER.map(...))` and type it, so a tenth lane cannot break you either.

If you follow that rule your files will compile before, during and after the lane lands.

## 3. THE UX BAR, WHICH THE OWNER RAISED EXPLICITLY

He asked for accessibility, ease of use, and a good browsing experience. Treat these as acceptance
criteria, not aspirations. Every one of them is checkable and will be checked.

**Colour is never the only signal.** The owner is colourblind. Every status, every lane, every
marker, every bar carries a GLYPH and a WORD as well as a colour. A legend keyed by swatch is a bug.
Two states that differ only in hue is a bug. Test your own work by imagining it in greyscale.

**Keyboard, fully.** Every interactive thing reachable by Tab in a sensible order. Visible focus
rings that are not the browser default washed out to nothing; use a real `:focus-visible` treatment
against `--accent`. No positive `tabindex`. No `div` with an `onClick` and no role. Lists of
selectable things get arrow-key movement where the spec asks for it.

**Screen reader honesty.** Semantic HTML first: `button`, `nav`, `ul`, `li`, `table` where it is a
table. `aria-label` on every icon-only control, saying what it does, not what it looks like. Live
regions (`aria-live="polite"`) on anything that changes without a navigation, such as a result count
or a send confirmation. Decorative glyphs get `aria-hidden="true"` so they are not read aloud as
punctuation soup.

**Hit targets.** 44px minimum on anything tappable. `base.css` already sets a `min-height: 44px`
rule; do not fight it.

**Motion.** `prefers-reduced-motion` is already wired into the duration tokens. Use the tokens and
you inherit it. No animation that moves more than a few pixels, no parallax, no autoplay.

**Browsing experience.** This is the part he is asking for that is not a checklist item, so think
about it properly:
- Nothing should ever be a dead end. A filtered list with no results explains what to clear and
  offers a control that clears it.
- Loading and empty states are designed, not left blank.
- Counts everywhere, so a person always knows how much they are looking at and how much they filtered
  away. "12 of 102" beats "12".
- The selected thing stays visibly selected in every pane it appears in.
- Nothing that scrolls should lose its position when an unrelated filter changes.
- Long lists get sticky headers so the reader never loses the column meaning.
- Responsive down to 380px, and the phone layout must be a real design decision, not three panes
  crushed. Read section 1.3 of the spec.

**Performance is a UX property.** There are now roughly 100 prospects. Memoise derived lists with
`useMemo`, key list items by a stable id, and do not rebuild a Leaflet layer on every render.

## 4. HOUSE RULES, UNCHANGED AND NON-NEGOTIABLE

No em dashes, no en dashes, no arrows in any human-readable text INCLUDING code comments. Every
commercial number carries a `ProvenanceBadge`. Invent nothing about Main Event. Roles, never
people's names. British-ish spelling in prose. CSS custom properties only, never a raw hex. CSS
Modules, one per component.

File block comments explain WHY the file exists and what failure it prevents, in confident plain
prose. Read `domain/types.ts` for the register. This comment culture is the most distinctive thing
about the codebase.

## 5. THE EMAIL COMPOSE MODAL CONTRACT

The `email` agent builds it. The `right-pane` and `map-canvas` agents must NOT build their own; they
raise a callback and let the board open it. The board wires it up in wave 3.

Exported from `@/components/email/EmailComposeModal`:

```ts
export type ComposeIntent = "outreach" | "featured-promo" | "reserve-party" | "free";

export interface EmailComposeModalProps {
  /** The organisation being written to. The modal closes when this is null. */
  prospect: Prospect | null;
  /** What the rep set out to do. Chooses the opening draft. */
  intent?: ComposeIntent;
  /** Optional package to anchor a promo or a hold against. */
  packageId?: string;
  onClose: () => void;
}

export function EmailComposeModal(props: EmailComposeModalProps): JSX.Element | null;
```

Anyone who needs to open it holds `const [compose, setCompose] = useState<{prospect: Prospect;
intent: ComposeIntent} | null>(null)` and renders the modal from the board. Components deeper down
receive and call `onCompose(prospect, intent)`.

## 6. WHAT THE OWNER ASKED FOR, IN HIS WORDS

So nobody optimises the wrong thing:

1. A way to separate the schools from the employers. That is the occasion segment on the left pane.
2. Local businesses: boba shops, Firestone and tire shops, Samyang. That is the ninth lane and the
   new rows, all researched and real.
3. **A better email sending modal.** Four intents, all four asked for: featured promo templates,
   reserve a party or hold a date, free compose starting from a template, and the ability to attach
   that organisation's own `/quote/:id` link.
4. The app's own PinMark as the main brand mark. Not Main Event's logo. Already done.
5. **The expanded map view**, three panes, modelled on his Ole Smoky distribution screen, where
   clicking through opens the email modal.
6. Accessible, easy to use, good to browse.

## 7. BEFORE YOU FINISH

1. `cd /tmp/work/me-prospecting && npx tsc -b --pretty`. Fix every error in the files YOU own.
   Errors in another agent's in-flight file are expected and are not yours.
2. Grep your own files for em dash, en dash and `->`. Zero.
3. Grep your own CSS for `#` followed by a hex digit. Zero, other than inside a `url()` data URI.
4. Re-read section 3 above and check your work against it item by item.

Return a summary under 150 words: what you created, the exact export names other agents can rely on,
anything you could not do, and any assumption you made. Do not paste file contents back.
