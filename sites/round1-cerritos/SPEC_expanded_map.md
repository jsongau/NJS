# SPEC: the expanded trade area map

Rebuild `/map` as a full three pane working screen, modelled on the Ole Smoky
distribution maps screen, expressed entirely in the vocabulary of The Opening
Book.

The route stays `/map`. The file stays `src/pages/TradeAreaPage.tsx`. The
MegaNav entry stays "Trade area", stage two of five. Nothing in
`src/app/` changes except the one reducer action named in section 3.

## House rules this document carries forward

These are binding on every file the build agent writes, including comments.

1. No em dashes. No en dashes. No arrow characters of any kind in text a
   human reads, which includes JSDoc, inline comments, aria labels, button
   labels and alt text. Arrow functions in code are code, not text.
2. Colour is never the only signal. Every state carries a shape or a glyph
   and a word. The owner is colourblind. Run the screen with a greyscale
   filter and nothing may become ambiguous.
3. Every commercial number carries a provenance badge, through
   `Figure` or `ProvenanceBadge` from
   `src/components/primitives/ProvenanceBadge.tsx`. A number without a
   stated origin does not render.
4. Invent nothing about Main Event. No opening date. No price for a gated
   package. No attraction that is not in `VENUE.attractions`.
5. Roles, never people's names. `decisionMakerTitle` is the buyer.
6. British-ish spelling in prose. "Organisation", "modelled" in prose,
   but the union member stays `"modeled"` because it is a type value.
7. No new npm dependencies. Clustering is written in this repo.

---

## 1. The pane architecture

### 1.1 The grid

The page is full bleed inside `AppShell`'s `<main>`. It does not use the
`.inner` max width wrapper that the current `TradeAreaPage` uses, because a
three pane board with a centred 1440px column wastes the two things this
screen is short of, which are map area and list height.

`src/pages/TradeAreaPage.module.css`:

```css
.page {
  /* The board fills the viewport below the nav. The stat bar is a row
     inside the grid rather than a sibling, so the three panes and the
     stat bar scroll as one thing and the panes get an honest height. */
  --stat-h: 76px;
  --board-h: calc(100vh - var(--nav-h) - var(--stat-h));

  display: grid;
  grid-template-rows: var(--stat-h) minmax(0, 1fr);
  height: calc(100vh - var(--nav-h));
  background: var(--surface-0);
}

.board {
  display: grid;
  grid-template-columns:
    var(--col-list)
    minmax(0, 1fr)
    var(--col-drawer);
  min-height: 0;
  transition: grid-template-columns var(--dur-2) var(--ease-out);
}

/* The list is collapsed. The column goes to zero rather than the pane
   going to display none, so the collapse animates and the pane's scroll
   position survives being reopened. */
.board[data-list="off"] {
  grid-template-columns: 0 minmax(0, 1fr) var(--col-drawer);
}

/* Nothing is selected. The detail column closes the same way. */
.board[data-detail="off"] {
  grid-template-columns: var(--col-list) minmax(0, 1fr) 0;
}

.board[data-list="off"][data-detail="off"] {
  grid-template-columns: 0 minmax(0, 1fr) 0;
}

.listPane,
.detailPane {
  min-width: 0;
  overflow: hidden auto;
  border-right: 1px solid var(--line);
  background: var(--surface-1);
}

.detailPane { border-right: 0; border-left: 1px solid var(--line); }

.mapPane { position: relative; min-width: 0; }
```

Token use is fixed. `--col-list: 328px` and `--col-drawer: 432px` already
exist in `src/styles/tokens.css` and are the single source of truth. No
component sets a pane width by any other means. If a pane needs to be
wider, the token changes.

`@media (prefers-reduced-motion: reduce)` already zeroes `--dur-2`, so the
collapse transition disappears for free.

### 1.2 The hide list control

A button floating over the top left of the map pane, exactly as the
reference does it.

- Label alternates between "Hide list" and "Show list". The label is the
  state, in words. It also carries a glyph, `"◧"` when the list is showing
  and `"◫"` when it is hidden, marked `aria-hidden="true"`.
- `aria-expanded` is set to the boolean, `aria-controls` points at the
  list pane's `id`.
- Position: `position: absolute; top: var(--space-3); left: var(--space-3);
  z-index: var(--z-map-overlay);` inside `.mapPane`.
- After toggling, call `map.invalidateSize()` on the Leaflet instance once
  the transition has settled. Leaflet caches container dimensions and a
  pane that grew without being told renders grey tiles down one edge. Use
  a `transitionend` listener on `.board` rather than a `setTimeout`, and
  fall back to a single `requestAnimationFrame` when reduced motion has
  zeroed the duration and no `transitionend` will fire.

### 1.3 Degradation

**1024px and below.** The detail pane leaves the grid. It becomes an
overlay anchored right, `width: min(var(--col-drawer), 92vw)`, full board
height, `box-shadow: var(--shadow-3)`, with a scrim over the map and list.
It gets `role="dialog"`, `aria-modal="true"`, Escape closes it and focus
returns to the list card that opened it. The board becomes two columns:

```css
@media (max-width: 1024px) {
  .board { grid-template-columns: var(--col-list) minmax(0, 1fr); }
  .board[data-list="off"] { grid-template-columns: 0 minmax(0, 1fr); }
}
```

**768px and below.** The list pane also leaves the grid. The map is the
whole board. The list becomes a sheet that slides up from the bottom to
`85vh`, opened by the same "Show list" button, which now sits bottom left
and reads "Show the list of 69". The sheet is a dialog on the same terms as
the detail overlay. Only one of the two overlays is open at a time: opening
a prospect from the list closes the list sheet.

**380px and below.** There is one pane and a switcher. Three panes never
coexist on a phone. A segmented control pinned under the stat bar offers
"List", "Map" and "Detail". "Detail" is `disabled` with
`aria-disabled="true"` and the title "Choose an organisation first" until
something is selected, and selecting a prospect from the list switches the
pane to "Detail" automatically, because a tap that appears to do nothing is
worse than a pane change. The stat bar itself becomes a horizontally
scrollable strip with `scroll-snap-type: x proximity` and the seven figures
keep their labels. It does not collapse into a summary sentence: the
figures are the point.

The existing breakpoints on `DeskPage.module.css` are 1280, 1000, 720, 520
and 380. This page deliberately uses 1024 and 768 instead of 1000 and 720
because the panes here are fixed pixel columns rather than a fluid table,
and 328 plus 432 plus a usable map does not survive past 1024.

---

## 2. Components to create

All new map components live in `src/components/map/`. Each gets a
`.module.css` beside it. No component in this list reaches into another's
CSS Module classes.

### 2.1 `src/components/map/MapBoard.tsx`

Owns the grid, the collapse state plumbing and the responsive mode
switching, and nothing else.

```ts
export type BoardMode = "three-pane" | "detail-overlay" | "list-sheet" | "single";

export interface MapBoardProps {
  /** Rendered into column one. */
  list: ReactNode;
  /** Rendered into column two. Always mounted, never unmounted. */
  map: ReactNode;
  /** Rendered into column three. Null when nothing is selected. */
  detail: ReactNode | null;
  listHidden: boolean;
  onToggleList: () => void;
  onCloseDetail: () => void;
  /** Which single pane is showing at 380px and below. */
  singlePane: "list" | "map" | "detail";
  onSinglePaneChange: (pane: "list" | "map" | "detail") => void;
}
```

The map child is mounted once and never unmounted across mode changes.
Unmounting a Leaflet container loses the zoom, the pan and every marker,
and a reader who rotates a phone should not lose their place.

### 2.2 `src/components/map/MapStatBar.tsx`

Owns the segmented board filter on the left and the seven figure strip on
the right. See section 4 for the figures.

```ts
export type BoardSegment = "all" | "untouched" | "live";

export interface MapStatBarProps {
  segment: BoardSegment;
  onSegmentChange: (segment: BoardSegment) => void;
  /** The rows currently plotted, after every filter. */
  rows: DeskLine[];
}
```

### 2.3 `src/components/map/OccasionSegment.tsx`

The two way toggle at the top of the list, carrying counts and glyphs,
drawn from `OCCASION_CLASS_META` in `src/domain/lanes.ts`.

```ts
export interface OccasionSegmentProps {
  /** Null means both classes are showing. */
  value: OccasionClass | null;
  onChange: (value: OccasionClass | null) => void;
  counts: Record<OccasionClass, number>;
}
```

Three positions, not two: "Calendar" with glyph `"▲"`, "Chosen" with glyph
`"■"`, and "Both". The reference has two because retail and bars are
exhaustive and exclusive there. Here a reader must be able to get back to
all sixty-nine without hunting for a clear control. Use `OCCASION_CLASS_META[c].short`
for the label, `.glyph` for the glyph and `.label` for the `title` and
`aria-label`, so the narrow tab reads "Chosen" and the accessible name
reads "Discretionary buyers", which is what that meta block was written
for.

### 2.4 `src/components/map/ProspectListPane.tsx`

Owns the occasion segment, the search box, the count line and the scrolling
list. Owns nothing about an individual card.

```ts
export interface ProspectListPaneProps {
  id: string;
  rows: DeskLine[];
  totalInTradeArea: number;
  selectedId: string | null;
  onSelect: (prospectId: string) => void;
  occasion: OccasionClass | null;
  onOccasionChange: (value: OccasionClass | null) => void;
  occasionCounts: Record<OccasionClass, number>;
}
```

The scrolling list is a `<ol>`. The selected card is scrolled into view with
`scrollIntoView({ block: "nearest" })` when selection changes from the map
rather than from the list, so choosing a marker finds its row.

### 2.5 `src/components/map/ProspectListCard.tsx`

One organisation, as a row in the left list. Field by field in section 5.

```ts
export interface ProspectListCardProps {
  line: DeskLine;
  rank: number;
  selected: boolean;
  onSelect: () => void;
}
```

### 2.6 `src/components/map/MapCanvas.tsx`

Owns the Leaflet container, the tile layer, the rings and their labels, the
venue mark, the hull outline, the fit behaviour and the floating children.
It does not own clustering arithmetic.

```ts
export interface MapCanvasProps {
  rows: DeskLine[];
  selectedId: string | null;
  onSelect: (prospectId: string | null) => void;
  /** Changes to this string refit the view. Nothing else does. */
  fitSignature: string;
  showOutline: boolean;
  /** Floating cards, rendered over the map by the page. */
  children?: ReactNode;
}
```

### 2.7 `src/components/map/ClusterLayer.tsx`

Renders either cluster bubbles or individual prospect marks, depending on
zoom, from the output of `src/lib/map/cluster.ts`.

```ts
export interface ClusterLayerProps {
  rows: DeskLine[];
  selectedId: string | null;
  onSelectProspect: (prospectId: string) => void;
  onZoomToCluster: (bounds: [[number, number], [number, number]]) => void;
}
```

### 2.8 `src/lib/map/cluster.ts`

Grid clustering, written here because this repo takes no new dependency and
`leaflet.markercluster` is not installed. See section 7.3.

```ts
export interface ClusterPoint {
  id: string;
  lat: number;
  lng: number;
}

export interface Cluster {
  /** Stable across renders at a given zoom, for a React key. */
  key: string;
  lat: number;
  lng: number;
  count: number;
  ids: string[];
  bounds: [[number, number], [number, number]];
}

export interface ClusterResult {
  clusters: Cluster[];
  /** Points that are alone in their cell and render as themselves. */
  singles: ClusterPoint[];
}

export function clusterPoints(
  points: ClusterPoint[],
  zoom: number,
  /** Cell size in screen pixels. 64 is the default and is tuned. */
  cellPx?: number,
): ClusterResult;
```

### 2.9 `src/components/map/MapLegend.tsx`

The floating key, top right, collapsible.

```ts
export interface MapLegendProps {
  open: boolean;
  onToggle: () => void;
}
```

Takes no data. The legend is a contract about the drawing, not a summary of
what is currently on screen, and a key that changes as you filter is a key
a reader stops trusting.

### 2.10 `src/components/map/OffersCard.tsx`

The Main Event equivalent of the launch support panel. Bottom left,
dark headed. See section 8.

```ts
export interface OffersCardProps {
  index: number;
  onIndexChange: (index: number) => void;
  /** From PERIOD_BY_ID[pipeline.periodId]. Drives the countdown. */
  weeksToOpen: number;
  /** Lanes currently filtered, so the card can say when an offer does not apply. */
  laneFilter: Lane[];
}
```

### 2.11 `src/components/map/ProspectMapPopup.tsx`

The popup body. Extracted from the page so the popup and the detail pane
cannot drift about what a prospect is.

```ts
export interface ProspectMapPopupProps {
  line: DeskLine;
  onOpenDetail: () => void;
}
```

### 2.12 `src/components/map/ProspectDetailPane.tsx`

The right hand pane. Section by section in section 6.

```ts
export type DetailTab = "packages" | "messages" | "why";
export type DetailSubTab = "fit" | "offers" | "score";
export type PackageFilter = "best" | "priced" | "all";

export interface ProspectDetailPaneProps {
  line: DeskLine;
  onClose: () => void;
  onCompose: () => void;
  tab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
  subTab: DetailSubTab;
  onSubTabChange: (tab: DetailSubTab) => void;
  packageFilter: PackageFilter;
  onPackageFilterChange: (filter: PackageFilter) => void;
  /** True when the pane is an overlay rather than a grid column. */
  asOverlay: boolean;
}
```

`ProspectDrawer` is not reused and is not deleted. It stays as the desk's
modal, because the desk's job is one organisation at a time over a list,
and this pane's job is one organisation beside a map. They share
primitives, not markup. Do not refactor `ProspectDrawer` as part of this
work.

### 2.13 `src/components/email/EmailComposeModal.tsx`

Section 9.

### 2.14 `src/domain/selectors/mapBoard.ts`

The one place the map's derived numbers are computed, so the stat bar, the
list count line and the accessible summary paragraph cannot disagree.

```ts
export interface MapBoardTotals {
  /** Rows currently plotted. */
  plotted: number;
  /** Every organisation in the trade area, filtered or not. */
  inTradeArea: number;
  /** Rows with emailConfidence "verified_public". */
  writtenDoor: number;
  /** Rows with emailConfidence "none". */
  noWrittenDoor: number;
  /** Rows inside three straight-line miles. */
  insideThreeMiles: number;
  /** Sum of midpoint headcount across plotted rows. */
  guestsInPlay: number;
  /** Sum of lanesAtMidpoint across plotted rows. */
  lanesAtMidpoint: number;
  /** Plotted rows whose furthest status is unworked. */
  neverTouched: number;
  /** Plotted rows at conversation or soft-hold. */
  liveConversations: number;
}

export function mapBoardTotals(
  rows: DeskLine[],
  state: PipelineState,
): MapBoardTotals;

export function occasionCounts(): Record<OccasionClass, number>;

export function applyBoardSegment(
  rows: DeskLine[],
  segment: BoardSegment,
): DeskLine[];
```

---

## 3. The state

### 3.1 What already exists and is reused unchanged

From `src/state/PipelineProvider.tsx`:

| Field | Reused for |
| --- | --- |
| `periodId` | The offers card countdown, and the `nowMonth` the desk selector scores against |
| `laneFilter` | The lane chips and the occasion segment. Shared with the desk |
| `query` | The "Find an organisation" box in the left pane. Shared with the desk |
| `emailableOnly` | The written door filter. Shared with the desk |
| `statuses` | Touches, furthest status, everything the cards and the detail pane show |

From `src/state/OutboxProvider.tsx`: `sent`, `sentTo`, `touchCount`,
`OUTCOME_META`, `KIND_META`. From `src/state/BookProvider.tsx`: nothing.
The map does not touch money.

Selectors reused as they stand, from `src/domain/selectors/desk.ts`:
`deskLines`, `milesFromVenue`, `laneCounts`, `unworkedCount`,
`liveConversationCount`, `emailableCount`, `doorOnlyCount`.

### 3.2 The one addition to PipelineProvider

Add a single action so the occasion segment can set a whole class of lanes
without dispatching four times and rendering four times:

```ts
| { type: "SET_LANES"; lanes: Lane[] }
```

Reducer case: `return { ...state, laneFilter: action.lanes };`

Nothing else in `PipelineProvider` changes. Do not move the map's local
state into it.

### 3.3 Lane filters stay shared, and so does the occasion segment

This is not negotiable and it is the reason the two screens can be trusted
together.

The eight lane chips write `TOGGLE_LANE` and `CLEAR_LANES` to
`PipelineProvider`, exactly as the current `TradeAreaPage` does. Filter to
schools on the map and the desk is filtered to schools when the reader
gets back to it.

The two way occasion segment is **derived from the same shared field**, not
a second parallel filter. That was the open question and this is the
answer, because a class segment that filtered locally would let the map
show three lanes while the desk showed eight, which is the exact failure
the shared filter exists to prevent.

```ts
const CALENDAR_LANES = LANE_ORDER.filter(
  (l) => LANE_META[l].occasionClass === "calendar-locked",
);
const CHOSEN_LANES = LANE_ORDER.filter(
  (l) => LANE_META[l].occasionClass === "discretionary",
);

// Pressed when the shared filter is exactly this class's lane set.
function segmentValue(laneFilter: Lane[]): OccasionClass | null {
  const set = new Set(laneFilter);
  if (set.size === CALENDAR_LANES.length &&
      CALENDAR_LANES.every((l) => set.has(l))) return "calendar-locked";
  if (set.size === CHOSEN_LANES.length &&
      CHOSEN_LANES.every((l) => set.has(l))) return "discretionary";
  return null;
}
```

Choosing "Calendar" dispatches `SET_LANES` with `CALENDAR_LANES`. Choosing
"Both" dispatches `SET_LANES` with `[]`. Ticking an individual lane chip
afterwards drops the segment out of its pressed state naturally, which is
correct: the reader has narrowed past a whole class and the control should
stop claiming otherwise.

### 3.4 What is local to the page

Local `useState` in `TradeAreaPage`. None of it belongs in a provider,
because none of it is a fact about the pipeline. It is a fact about what a
reader is currently looking at on one screen.

```ts
interface MapPageLocalState {
  /** The one selected organisation, by id. Null is the empty pane. */
  selectedId: string | null;
  /** Where the selection came from. Decides whether the list auto scrolls. */
  selectionSource: "list" | "map" | "none";
  listHidden: boolean;
  segment: BoardSegment;            // all | untouched | live
  singlePane: "list" | "map" | "detail";
  legendOpen: boolean;
  offerIndex: number;
  showOutline: boolean;
  detailTab: DetailTab;
  detailSubTab: DetailSubTab;
  packageFilter: PackageFilter;
  /** Prospect id the compose modal is open for. Null is closed. */
  composeFor: string | null;
}
```

### 3.5 The selected prospect

Selection is stored as an id, never as a `Prospect` object.

```ts
const selectedLine = useMemo(
  () => (selectedId ? rows.find((r) => r.prospect.id === selectedId) ?? null : null),
  [rows, selectedId],
);
```

Storing the object would freeze a `DeskLine` at the moment of selection, so
recording a touch from the detail pane would leave the pane showing the old
touch count while the list card beside it showed the new one. Deriving it
means one status change moves every figure on the screen at once, which is
the property this whole application is built to demonstrate.

**When the filter removes the selected row**, the detail pane does not
close. It keeps rendering the prospect and shows a line above the tabs
reading "Not in the current filter." with a button "Clear the filters".
Closing a panel because a reader ticked a lane chip loses their place for a
reason they did not ask for. Look the prospect up from
`PROSPECT_BY_ID` in `src/data/prospects.ts` when it is missing from `rows`,
and compute its `DeskLine` fields from the same selectors.

**Deep link.** `/map?prospect=<id>` selects on mount. This mirrors the
existing `/?prospect=<id>` link that the current popup already writes.

---

## 4. The stat bar

Left: the segmented board filter, three positions.

| Label | Value | Definition |
| --- | --- | --- |
| All organisations | `"all"` | Every row after the shared filters |
| Never touched | `"untouched"` | `furthestStatus === "unworked"` |
| Live conversations | `"live"` | `furthestStatus` is `"conversation"` or `"soft-hold"` |

Implemented in `applyBoardSegment`. It is page local, unlike the lane
filter, and the reason is worth a comment in the code: a lane is a
permanent property of an organisation and a reader expects it to persist
across screens, whereas "show me only the untouched ones" is a way of
looking at this board and the desk has its own ordering that already
answers the same question.

Right: seven figures, small uppercase labels, mono values, each with a
provenance badge.

| # | Label | Value | Source | Provenance |
| --- | --- | --- | --- | --- |
| 1 | ORGANISATIONS | `totals.plotted` of `totals.inTradeArea` | `mapBoardTotals`, over `deskLines` | `public` |
| 2 | WRITTEN DOOR | `totals.writtenDoor` | `emailConfidence === "verified_public"` on plotted rows | `public` |
| 3 | NO WRITTEN DOOR | `totals.noWrittenDoor` | `emailConfidence === "none"` on plotted rows | `public` |
| 4 | INSIDE 3 MILES | `totals.insideThreeMiles` | `DeskLine.miles`, from `milesFromVenue` | `modeled` |
| 5 | GUESTS IN PLAY | `totals.guestsInPlay` | Sum of `(headcountLow + headcountHigh) / 2` rounded | `modeled` |
| 6 | NEVER TOUCHED | `totals.neverTouched` | `furthestStatus` over `pipeline.statuses` | `illustrative` |
| 7 | LIVE CONVERSATIONS | `totals.liveConversations` | `furthestStatus` over `pipeline.statuses` | `illustrative` |

Notes the build agent must honour:

- Figures 1, 2 and 3 are counts of published facts and carry `public`.
- Figure 4 is `modeled` because the distance is this app's haversine, not a
  published number. The label reads "INSIDE 3 MILES" and the tooltip and
  the badge title say "straight line, not drive time".
- Figure 5 is `modeled` and its tooltip carries the reason: every headcount
  in the data set is a range with a stated basis, so the sum of midpoints
  is an order of magnitude and not a forecast. It is never rendered with a
  currency symbol and there is no revenue figure on this bar.
- Figures 6 and 7 are `illustrative` because the seeded status table is
  invented for the prototype. That is exactly how `DeskPage` already badges
  `unworkedCount` and `liveConversationCount`, and the two screens must
  agree.
- There is no percentage on this bar. The reference has DISTRIBUTION 70%
  and there is no honest equivalent here, because a share needs a
  denominator that means something and Main Event publishes no target, no
  capacity plan and no budget. Do not invent one.

Each figure is a `<div>` with `<span class="num">` for the value, an
uppercase label, and `<ProvenanceBadge provenance={...} />`. Reuse the
`Kpi` shape from `DeskPage.tsx` as a pattern but do not import it; it is
page local there and lifting it is a bigger change than this work needs.

---

## 5. The left list card

One `<li>` per organisation, a `<button>` for the whole hit area with the
name as its accessible label, following the `nameBtn` idiom already used in
`DeskPage.tsx`.

Layout, top to bottom and left to right:

1. **Initials tile.** `<ProspectPlate name={p.name} lane={p.lane} />` from
   `src/components/primitives/Wordmark.tsx`. The tile is coloured by lane
   and the lane is also named in the chips below, so the colour is never
   alone.
2. **Name.** `p.name`, as the button's text.
3. **Chips.** `<LaneChip lane={p.lane} size="sm" />`,
   `<OccasionClassChip lane={p.lane} />`, and
   `<StatusChip status={line.status} size="sm" short />`.
4. **The big right aligned figure.** `line.score`, set in mono at
   `--step-3`, with the word **SCORE** underneath in small uppercase, and a
   `modeled` provenance badge. This is the equivalent of the reference's
   OPP number.
   It is the desk score from `scoreProspect` in
   `src/domain/selectors/desk.ts`, not a new number. Its `title` is the top
   scoring component's `label` and `why`, so hovering says why this one is
   high without opening anything. It is never a dollar figure. There is no
   revenue until there is a signature and the signature lives in
   `BookProvider`.
5. **City and distance.** `{p.city}` then `{line.miles.toFixed(1)} mi
   straight line`. The words "straight line" are in the card, not only in
   the legend.
6. **The four cell metric strip.** Label above in small uppercase, figure
   below in mono. These replace PODS, VOIDS, VOID CASES and SHELF GAP.

| Cell | Label | Value | Source | Provenance |
| --- | --- | --- | --- | --- |
| 1 | TOUCHES | `line.touches` | `touchesFor(pipeline, p.id)` via `DeskLine` | `illustrative` |
| 2 | GUESTS | `{p.headcountLow} to {p.headcountHigh}` | `Prospect` | `p.provenance.headcount ?? "modeled"` |
| 3 | LANES | `line.lanesAtMidpoint` | `lanesForGuests(midpoint)` | `modeled` |
| 4 | WINDOW | `"Open"` or `"Later"` | `windowOpensWithin(p.buyingWindow, nowMonth, 4)` | `modeled` |

The WINDOW cell carries a glyph as well as the word, `"◑"` for open and
`"○"` for later, and its `title` is `p.buyingWindow` verbatim, so the
research sentence is one hover away.

Provenance badges on a dense card use `compact`. Four badges on one strip
would be noise, so render a single badge on the strip as a whole with the
weakest provenance present across the four cells, and put the per cell
provenance in each cell's `title`. State that rule in a comment.

**The count line** above the list reads, for example, "12 of 69
organisations plotted". When a filter is on it appends " that match the
filter". It is the `plotted` and `inTradeArea` fields of `mapBoardTotals`,
so it cannot disagree with figure 1 on the stat bar.

**The search box** is labelled "Find an organisation", `type="search"`, and
writes `SET_QUERY` to `PipelineProvider`. It searches name, city and
decision maker title, because that is what `deskLines` already does and the
placeholder must say so: "Name, city or job title".

**Empty state.** "Nothing on the board matches that. The filter is doing
its job. Widen it, or clear it and start from all sixty-nine." with a
"Clear every filter" button that dispatches `CLEAR_LANES`, `SET_QUERY` with
an empty string, and `TOGGLE_EMAILABLE_ONLY` when it is on.

---

## 6. The right detail panel

Scrolls independently. Close button top right, `aria-label="Close this
organisation"`, glyph `"✕"` marked `aria-hidden`.

### 6.1 Head

- `<ProspectPlate name={p.name} lane={p.lane} size="lg" />`
- `<h2>` the name, `tabIndex={-1}`, focused when the pane opens as an
  overlay. When the pane is a grid column it does not steal focus, because
  it did not take over the screen.
- Address line: `p.address`, then `p.phone` as a `tel:` link when present.
- **The sourced line.** `p.emailSourceUrl` when the confidence is
  `verified_public`, otherwise `p.contactFormUrl`, otherwise `p.website`.
  Rendered as "Read off " plus a link showing host and path, exactly as
  `ProspectDrawer` does with its `hostOf` helper, `target="_blank"`
  `rel="noreferrer noopener"`. Beside it, the distance:
  `{line.miles.toFixed(1)} mi straight line` with a `modeled` badge.
- Chips row: `<LaneChip>`, `<OccasionClassChip>`, a priority chip built
  from `p.priority` with a glyph and the word ("anchor", "high", "medium",
  "low"), `<EmailConfidenceChip confidence={p.emailConfidence} />`, and a
  distance chip.

The email address itself is printed as text and is **never** a `mailto:`
link. These are real school administrators. That rule is already stated at
length in `ProspectDrawer.tsx` and it applies here identically.

### 6.2 The six cell KPI row

| Cell | Label | Value | Source | Provenance |
| --- | --- | --- | --- | --- |
| 1 | TOUCHES | `line.touches` | `touchesFor` | `illustrative` |
| 2 | WRITTEN TOUCHES | `touchCount(outbox, p.id)` | `OutboxProvider` | `illustrative` |
| 3 | GUESTS | `{low} to {high}` | `Prospect` | `p.provenance.headcount ?? "modeled"` |
| 4 | BOWLING LANES | `line.lanesAtMidpoint` | `lanesForGuests` | `modeled` |
| 5 | DISTANCE | `{miles} mi` | `milesFromVenue` | `modeled` |
| 6 | DESK SCORE | `line.score` | `scoreProspect` | `modeled` |

Cell 4's `title` states the arithmetic: Main Event publishes one bowling
lane per twenty guests, and this app computes against the published floor
of `VENUE.bowlingLanesPublishedFloor`, so the figure can only understate
the building.

### 6.3 Last touch line

`"Last touch "` plus the most recent `lastTouchAt` across the prospect's
rows in `pipeline.statuses`, or `"No touch recorded this period."` when
there is none. Then, when the outbox has anything for this prospect, the
subject and date of the newest `sentTo(outbox, p.id)` row with its
`OUTCOME_META` glyph and label.

### 6.4 The two big CTAs

Side by side, full width of the pane, equal widths.

**Filled, dark.** "Open their group quote". A `react-router` `<Link>` to
`/quote/${p.id}`. Use `quoteLink` from `src/lib/links.ts` so the reference
and any package or guest parameters are built in one place, passing
`packageId: p.leadPackageId` and
`guests: Math.round((p.headcountLow + p.headcountHigh) / 2)`. It opens the
prospect facing page, which sits outside `AppShell` on purpose. Under the
button, the note "Their side of it. No internal chrome, no score, no
pipeline."

**Outlined.** "Write the message". Sets `composeFor` to the prospect id and
opens `EmailComposeModal`. When `p.emailConfidence !== "verified_public"`
the label changes to "Draft the approach" and the note under it reads
"They publish no address, so the draft is a reception script and it cannot
be sent." The button is still enabled: the script is the useful thing.

Use `<Button variant="primary">` and `<Button variant="secondary">` from
`src/components/primitives/Button.tsx`.

### 6.5 The tab row

Three tabs, each carrying a count, implemented as a real
`role="tablist"` with `role="tab"`, `aria-selected`, `aria-controls` and
arrow key navigation, panels as `role="tabpanel"`.

| Tab | Count | Source |
| --- | --- | --- |
| Packages | number of packages that fit | `PACKAGES.filter((k) => k.laneFit.includes(p.lane)).length` |
| Messages | `sentTo(outbox, p.id).length` | `OutboxProvider` |
| Why them | no count | |

### 6.6 The sub tab row

Only under "Why them", because that is the tab with three genuinely
different readings of the same organisation. Three sub tabs:

- **Fit.** `p.whyTheyFit` with its provenance badge, `p.buyingWindow` with
  the occasion class explanation from `LANE_META[p.lane]`, `p.headcountBasis`,
  and `LANE_META[p.lane].preOpeningProblem` under the heading "Hardest
  thing about this lane".
- **Offers.** The subset of `OFFERS` from `src/data/venue.ts` whose
  `eligibleLanes` includes `p.lane`. Each with `name`, `what`, `rationale`,
  `costToVenue` and `costNote`, and its own provenance badge. Note that
  `spirit-night-first-quarter` carries `public` and the rest carry
  `illustrative`, and the card must show that difference rather than
  flattening it.
- **Score.** The `line.components` breakdown table, the same shape as the
  one already in `DeskPage.tsx`: component label, signed points, and the
  `why` sentence. Bars drawn against a fixed ceiling of 40 points, never
  normalised per row, and marked `aria-hidden` because the signed number
  beside them carries the value.

### 6.7 The third filter row and the item list

Only under "Packages". Three positions, matching the reference's Needs
action / Voids / All carried.

| Position | Shows |
| --- | --- |
| Best fit | Packages whose `laneFit` includes `p.lane`, with `p.leadPackageId` pinned first and marked "Lead with this" |
| Priced | Of those, the ones where `pricePerGuest !== null` |
| All published | Every row in `PACKAGES` |

Above the list, a summary line in the shape of the reference's "18 on
shelf, 11 void, 0 not authorized":

> "{n} fit this lane, {m} of them priced, {k} gated behind a sales manager."

where the gated count is `PACKAGES.filter((k) => k.pricePerGuest === null)`
intersected with the fit set. That last clause is the most interesting
sentence on the pane and it is a real finding, so it is stated as prose and
not as a bare number.

Each package row: `<PackageGlyph family={pack.family} />`, the name,
`<FamilyChip family={pack.family} size="sm" />`, guest minimum and maximum,
day parts, and the price rendered through
`<Figure value={...} provenance={...} />` with `provenance="withheld"`
whenever `pricePerGuest === null`, so it renders the sentence "Main Event
does not publish this" rather than a number. Never a fallback estimate.

Under "Messages": the `sentTo` rows, newest first, each with
`KIND_META[m.kind].glyph` and label, the subject, `OUTCOME_META[m.outcome]`
glyph and label, the date and the reply text where there is one. Empty
state: "Nothing has gone out to this organisation yet."

---

## 7. The map layer

### 7.1 Marker shape

Unchanged from `src/lib/map/markerIcons.ts`. Do not write new marker SVG.
`prospectMarkerHtml` already encodes three independent channels and the
comment at the top of that file is the contract:

- **Shape** carries the occasion class. Pointed body for calendar-locked,
  square body for discretionary. That is the biggest distinction in the
  application and it survives greyscale.
- **Glyph** carries the lane, from `LANE_META[lane].glyph`, so all eight
  lanes stay separable and not only the two classes.
- **Colour** is third, always, from the Okabe-Ito lane tokens.

Selection is a halo, through the existing `selected` flag, plus a heavier
stroke. Not a colour change.

Do not add a per lane shape. Eight shapes are not distinguishable at 34
pixels and the glyph already does that job.

The venue mark stays `venueIcon(VENUE.name)`, the broken ring with the
words "Not open yet" under it, forced to `zIndexOffset={1000}`.

Keep the Leaflet div icon reset. Any page mounting these icons must carry:

```css
.mapPane :global(.ob-marker) { background: none; border: 0; }
```

### 7.2 What is dropped from the current page

The go-see route numbering, the route mode switch and the run size control
move off this screen. The go-see run has its own home at `/field` and
duplicating it here is two panels to keep in step. `routeStep` and `muted`
stay in `ProspectMarkerVisual` because `/field` uses them; this page simply
never passes them.

### 7.3 Clustering

Written in `src/lib/map/cluster.ts`, no dependency.

- Project each point to Web Mercator pixel space at the current integer
  zoom using `map.project([lat, lng], zoom)`.
- Bucket into a square grid of `cellPx` pixels, default 64.
- A cell with one point yields a single. A cell with two or more yields a
  `Cluster` whose `lat` and `lng` are the mean of its members and whose
  `bounds` are the min and max of its members.
- `key` is `` `${zoom}:${cellX}:${cellY}` ``, stable across renders.
- Clustering is **off** at zoom 15 and above. Sixty-nine points over a six
  and a half mile trade area separate completely by then and a cluster
  bubble at street level hides a decision rather than tidying one.
- Recompute in a `useMemo` keyed on rows, zoom and cell size. Read zoom via
  a small `useMapEvent("zoomend")` child. Do not recompute on `move`.

Cluster bubble mark, drawn as an SVG div icon alongside the others in
`markerIcons.ts` as a new export `clusterMarkerHtml`:

- A circle. Circles are not otherwise used by a prospect mark, so a bubble
  is never confused with an organisation. Both prospect bodies are a
  pointed cap or a square.
- Radius scales in three fixed steps by count: 16px for 2 to 4, 20px for 5
  to 9, 24px for 10 and above. Three steps, not a continuous scale,
  because a reader cannot compare radii and can compare three sizes.
- The count is printed inside in mono. The number is the signal. The size
  is reinforcement.
- Fill is `var(--surface-1)`, stroke is `var(--text-1)`. **Neutral, not a
  lane colour.** A cluster spans lanes and colouring it by the majority
  lane would be a claim the data does not support.
- `aria-label` reads "{n} organisations, zoom in to separate them".
- Clicking calls `onZoomToCluster` with the cluster bounds and the map
  calls `fitBounds(bounds, { padding: [40, 40], maxZoom: 16 })`.

The selected prospect is **always drawn individually**, never folded into a
cluster, whatever the zoom. Remove it from the clustering input. A reader
who chose a row and cannot see its pin has lost the connection between the
two panes.

### 7.4 The rings

Unchanged in behaviour from the current page. One, three and five straight
line miles, dashed, from `VENUE.lat` and `VENUE.lng`, with
`ringLabelIcon` labels placed south west by `ringLabelPoint`, each reading
"{n} mi straight line". Keep the existing comment explaining why the label
sits south west, because it is a fact about Brea rather than a rule about
maps.

Move the three ring notes ("Walkable from the building", and so on) into
the legend's expanded body. There is no rail on this layout to hold the
"straight line, not drive time" panel, so its argument moves to the legend
and to the `title` on each ring label. The claim must survive the layout
change: nothing on this screen may imply a ring is a drive time.

The convex hull outline from `src/lib/map/hull.ts` stays, behind
`showOutline`, drawn faint and `interactive={false}`, and the legend keeps
saying it is cosmetic.

### 7.5 Fit behaviour

Keep `FitToFilter`, keyed on a signature string. The signature is

```ts
`${pipeline.laneFilter.slice().sort().join("|")}::${pipeline.emailableOnly}` +
`::${pipeline.query.trim()}::${segment}::${listHidden}`
```

`VENUE_POINT` is forced into the bounds whatever is filtered. Refit on
filter changes only, never on a status change, never on selection. Keep
`FocusOn` for selection: it pans to the selected prospect at
`Math.max(map.getZoom(), 14)` without refitting.

### 7.6 The legend contract

Floating card, top right, `position: absolute`, `z-index: var(--z-map-overlay)`,
collapsible with a header button carrying `aria-expanded`. It collapses to
a single row reading "Key" plus a glyph. It starts **open** on screens
above 1024px and **collapsed** below, because a legend covering a third of
a phone map is worse than no legend.

Every entry carries **shape, glyph, word and description**, in that order.
Never colour alone, and never colour as the first thing read. Swatches are
rendered by calling the same builders the map calls, through
`dangerouslySetInnerHTML`, exactly as the current page does, so a swatch
cannot drift from a mark.

| Entry | Swatch | Word | Description |
| --- | --- | --- | --- |
| 1 | `venueMarkerHtml(VENUE.name)` | The venue, not open yet | A broken ring, because a solid pin would say there is a business here. There is an address, a phone number and no published opening date. |
| 2 | `prospectMarkerHtml({ lane: "schools", label: "..." })` | Pointed, calendar-locked | Their event happens whether or not anybody calls. A graduating class graduates, a season ends, a term finishes. |
| 3 | `prospectMarkerHtml({ lane: "corporate", label: "..." })` | Square, discretionary | Somebody has to decide there will be an event at all. Real budget, no date until a person picks one. |
| 4 | `prospectMarkerHtml({ lane: "healthcare", label: "...", selected: true })` | Halo, selected | The organisation open in the panel on the right. |
| 5 | `clusterMarkerHtml(7)` | A numeral in a circle, several organisations | They are too close together at this zoom to draw separately. The numeral is the count. Click it to zoom in. |
| 6 | A dashed circle, inline SVG | Broken circles, straight line miles | One, three and five miles as the crow flies from Birch Street. Not drive times. A mile is walkable. Three miles is a twenty minute round trip. Five miles is a half day unless it is run with two or three others. |
| 7 | The faint polygon, inline SVG | The outline, cosmetic | The convex hull of whatever is currently plotted. It is where these organisations happen to sit, and it is not a claim about where custom comes from. |

Then the eight lane glyphs in a compact grid, each as
`<LaneChip lane={lane} size="sm" />` with its count from `laneCounts`, so
the legend also says which glyph is which lane. These are labels, not
filters. The lane **filter** chips live in the left pane above the search
box, and the legend says so in one line so a reader is not hunting for a
control the key appears to be offering.

### 7.7 The popup

Rendered by `ProspectMapPopup`. Short, because the right pane exists.

- Name as `<h3>`.
- `<LaneChip>`, `<OccasionClassChip>`, `<StatusChip short>`.
- Decision maker title.
- Written door: `<EmailConfidenceChip>` and the address as text, or the
  contact form link, or "Nothing published" plus the phone.
- Distance, through `<Figure provenance="modeled" compact />`.
- One action: a button "Open the full panel" that selects the prospect,
  sets `selectionSource` to `"map"` and, at 380px and below, switches the
  single pane to `"detail"`. Not a link to the desk. The panel is on this
  screen now.

Marker `eventHandlers` set `popupopen` to select and `popupclose` to
deselect only when the deselected id matches the current selection, so
closing a stale popup cannot clear a newer selection.

### 7.8 The accessible summary

A `visually-hidden` paragraph inside the map pane, updated with the rows,
because a map is a graphic and a screen reader gets nothing from it:

> "{n} organisations plotted around Main Event Brea, which is not open.
> {m} of them are inside three straight line miles, {k} publish an email
> address, and {j} publish no written door at all. The list beside the map
> carries the same organisations as text."

---

## 8. The offers card

The Main Event equivalent of the reference's launch support panel. Floating
bottom left of the map pane, dark headed, `width: 320px`,
`max-height: 46%`, `overflow: auto`, `z-index: var(--z-map-overlay)`. It
collapses to its header on a tap, and starts collapsed below 1024px.

Data: `OFFERS` from `src/data/venue.ts`. Four offers. Do not add a fifth.

Structure, top to bottom, matching the reference beat for beat:

1. **Dark header** using `--surface-inverse` and `--text-inverse`. Reads
   "What you can put on the table". Beside it, the position, "{index + 1}
   of {OFFERS.length}", in mono.
2. **Previous and next controls.** Two buttons, glyphs `"‹"` and `"›"`,
   `aria-label` "Previous offer" and "Next offer". No arrow characters.
   They wrap around.
3. **The offer name.** `offer.name`, for example "First fifty on the
   calendar".
4. **The countdown.** `weeksToOpen` from
   `PERIOD_BY_ID[pipeline.periodId]`, rendered as "{n} weeks to open" with
   a progress bar. The bar's fill is `1 - weeksToOpen / 16`, where 16 is
   the largest `weeksToOpen` in `PERIODS`. Mark the bar `aria-hidden` and
   put the figure in text beside it. Provenance `illustrative`, because
   `PERIODS` carries `illustrative` and Main Event has published no opening
   date. The card must never render a date.
5. **Two figures side by side.**
   - COST TO THE VENUE: `offer.costToVenue`, rendered as "Zero" when it is
     0 and as "{n}% of sales" for `spirit-night-first-quarter`. Provenance
     is `offer.provenance`, which is `public` for the Spirit Night row and
     `illustrative` for the others. That difference is the point of the
     card and must be visible.
   - LANES IT APPLIES TO: `offer.eligibleLanes.length` of 8.
6. **The eligible lanes line.** The lane glyphs for `offer.eligibleLanes`
   as `<LaneChip size="sm" glyphOnly />` with the full labels in the
   `title`. When the current `pipeline.laneFilter` is non empty and shares
   nothing with `offer.eligibleLanes`, show a line reading "Does not apply
   to the lanes you are looking at." rather than hiding the offer.
7. **"What we can hand over".** `offer.what` as a paragraph, then
   `offer.rationale` under a smaller heading "Why it is credible before the
   doors open".
8. **The footnote.** `offer.costNote`, then a fixed compliance line:

> "Only the Spirit Night terms are Main Event's own published figures. The
> rest are pre-opening positions this prototype proposes, and every one of
> them is priority or certainty rather than a discount. You cannot discount
> a price that has never been published."

That sentence is the honest equivalent of the reference's compliance
footnote and it is not optional.

---

## 9. The email compose modal

`src/components/email/EmailComposeModal.tsx`. Read
`src/state/OutboxProvider.tsx` and `src/lib/email/templates.ts` before
writing a line of it. Their real shapes are used below.

### 9.1 Props

```ts
export interface EmailComposeModalProps {
  prospect: Prospect;
  /** Preselects a draft. Defaults to the first from templatesFor. */
  initialTemplateId?: string;
  /** Called on close for any reason, including after a successful send. */
  onClose: () => void;
  /** Fired with the new SentMessage id once the outbox has the row. */
  onSent?: (messageId: string) => void;
}
```

### 9.2 Drafts

```ts
const drafts = useMemo(
  () =>
    templatesFor(prospect, {
      openingStatus: VENUE.openingStatus,
      weeksToOpen: PERIOD_BY_ID[pipeline.periodId]?.weeksToOpen,
      touches: touchCount(outbox, prospect.id),
    }),
  [prospect, pipeline.periodId, outbox],
);
```

A picker lists every draft by `label` with its `blurb` underneath and its
`why` sentence beside the selected one. When the selected draft has a
`guardrail`, render it in a bordered block beside the body, never collapsed
and never in a tooltip. The file's own comment is explicit that a rule a
person can read at the moment of sending is a control and a rule in a
document is a hope.

Subject and body are editable `<input>` and `<textarea>`, seeded from the
draft and reseeded when the draft changes. If the reader has edited the
body, changing drafts asks first: "Replace what you have written?" with
"Replace" and "Keep mine".

### 9.3 States

```ts
type ComposeState = "composing" | "sending" | "sent" | "failed";
```

- **composing.** The default. Send is enabled when
  `isSendable(template)` is true and the trimmed subject and body are both
  non empty.
- **sending.** Entered on send. A simulated delay of 600ms so the state is
  observable, reduced to 0ms under `prefers-reduced-motion: reduce`. Every
  control is `disabled`. A `role="status"` region announces "Sending".
  Escape does nothing in this state.
- **sent.** The outbox row exists. The modal switches to a confirmation
  showing the reference from the new row, the recipient
  (`DEMO_RECIPIENT`), the subject, and the line "Nothing left this tab.
  This wrote a row to the outbox." with a link to `/sent` and a button
  "Close". `onSent` fires with the message id.
- **failed.** Reachable for two honest reasons and no others: the selected
  draft is `go-see-script`, for which `isSendable` returns false, or the
  subject or body is empty. The message names which. There is no network,
  so there is no network failure to simulate, and simulating one would be
  theatre. Recovery returns to `composing` with everything intact.

`go-see-script` never reaches `sending`. Its send button is replaced by a
button labelled "Record this as a go-see" which dispatches `RECORD_TOUCH`
to `PipelineProvider` and closes, and a line explaining that a message with
nowhere to go is not a message.

### 9.4 What it dispatches

On send, to `useOutboxDispatch()`:

```ts
outboxDispatch({
  type: "SEND",
  message: {
    sentAt: new Date().toISOString().slice(0, 10),
    kind: "outreach",
    prospectId: prospect.id,
    prospectName: prospect.name,
    lane: prospect.lane,
    recipientRole: prospect.decisionMakerTitle,
    subject,
    templateLabel: template.label,
    body,
  },
});
```

The `SEND` action's payload type is
`Omit<SentMessage, "id" | "to" | "reference" | "outcome"> &
Partial<Pick<SentMessage, "outcome">>`. Do not pass `to`, `id`,
`reference` or `outcome`. The reducer forces `to` to `DEMO_RECIPIENT`,
mints the reference and defaults the outcome to `"awaiting"`. That forcing
is the no transport guarantee and the modal must not route around it.

`kind` is `"outreach"` from this screen. Quotes are written on
`/quote/:prospectId`, which is where a headcount and a package have
actually been agreed. Do not add a `kind` picker here.

Then, to `usePipelineDispatch()`:

```ts
pipelineDispatch({
  type: "RECORD_TOUCH",
  prospectId: prospect.id,
  packageId: prospect.leadPackageId,
  at: new Date().toISOString().slice(0, 10),
});
```

Because a sent message is a touch, and the desk's ranking penalises a
prospect at three or more touches. If the modal did not record it, the desk
would keep recommending an organisation that has already had four emails.

### 9.5 Focus, Escape and return

- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing at the
  `<h2>`, which carries `tabIndex={-1}`.
- On mount, store `document.activeElement` as the opener and focus the
  heading.
- **A real focus trap.** On `keydown` for `Tab`, query focusable
  descendants with
  `'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'`,
  and wrap from last to first and first to last. Requery on every keypress
  rather than caching, because the picker and the state changes add and
  remove controls. `ProspectDrawer` does not currently trap and that is a
  known gap; this modal must, because it contains a form.
- **Escape.** Closes in `composing`, `sent` and `failed`. Ignored in
  `sending`. When the body has been edited in `composing`, Escape asks for
  confirmation first through an inline two button row, not a `window.confirm`.
- **Return.** On unmount, focus the stored opener with an optional call,
  `opener?.focus?.()`. The opener is the "Write the message" button in the
  detail pane. If the detail pane has since closed, fall back to the
  detail pane's close button, and if that is gone, to the map pane's
  container. A keyboard reader must never be returned to the top of the
  document.
- A scrim at `z-index: var(--z-modal)` minus one, `aria-hidden="true"`,
  click closes on the same terms as Escape. The modal sits at
  `var(--z-modal)`.
- Lock body scroll while open by setting `overflow: hidden` on
  `document.body` and restoring the previous value on unmount.

---

## 10. What NOT to do

Things in the reference that would be wrong here, and why.

1. **No SKUs, no distributors, no shelf, no PODs, no voids, no cases, no
   "distribution %".** There is no product, no wholesaler and nothing on a
   shelf. Main Event Brea is not open. Carrying that vocabulary across
   would describe a business that does not exist.
2. **No opportunity figure in currency on the list card.** The reference's
   big OPP number is a modelled revenue opportunity. Here the big number is
   the desk score, which is a ranking, and it says SCORE. Revenue in this
   application lives in `BookProvider` behind a signature and a deposit,
   and putting a dollar figure on a prospect card would be exactly the
   confusion the two ledger model exists to prevent.
3. **No colour only legend, ever.** Every entry carries shape, glyph and
   word. The lane colours are Okabe-Ito and are still the third channel,
   never the first. Test the finished screen under a greyscale filter and
   under a deuteranopia simulation.
4. **Do not colour cluster bubbles by lane.** A cluster spans lanes. A
   majority lane colour is a claim about a group that the group does not
   support.
5. **Do not imply the rings are drive times.** No isochrones, no "15 min"
   labels, no route totals. There is no routing engine in this dependency
   tree and there will not be one. The words "straight line" appear on the
   ring label, on the card, in the panel and in the legend.
6. **Never render an opening date.** The countdown is in weeks to open,
   from `PERIODS`, badged `illustrative`. Main Event has published no date
   and inventing one is the single mistake there is no recovering from.
7. **No price for a gated package.** `pricePerGuest === null` renders
   through `Figure` with `provenance="withheld"`, which prints the sentence
   "Main Event does not publish this". No fallback, no estimate, no
   average.
8. **No `mailto:` links on prospect email addresses.** These are real
   administrators at real schools. The address is printed as text to be
   read and copied by whoever is actually doing the outreach.
9. **No invented human names.** The buyer is `decisionMakerTitle`. Not one
   name appears anywhere in this application, including in seeded outbox
   replies.
10. **Do not add a sixth nav tab and do not renumber the five.** The
    reference's numbered tabs with count badges already exist in `MegaNav`
    and this screen is stage two of five. This work adds no route, no nav
    entry and no secondary link.
11. **Do not add a marker clustering dependency.** `package.json` carries
    `leaflet` and `react-leaflet` and nothing else for the map. The grid
    clusterer in `src/lib/map/cluster.ts` is about sixty lines and it is
    reviewable, which a transitive dependency tree is not.
12. **Do not change the tile layer.** CARTO light, with the existing
    OpenStreetMap and CARTO attribution string, `subdomains="abcd"`. The
    attribution is a licence condition, not decoration.
13. **Do not delete or refactor `ProspectDrawer`.** The desk still uses it.
14. **Do not move the go-see run onto this screen.** It lives at `/field`.
    Two panels computing the same run is two panels to keep in step and one
    of them will be wrong.
15. **Do not make the occasion segment a second, page local filter.** It is
    a derived control over the shared `laneFilter`. A map showing three
    lanes while the desk shows eight is the exact incoherence
    `src/domain/lanes.ts` was written to prevent.
16. **Do not unmount the Leaflet container on a breakpoint change.** The
    zoom, the pan and every marker go with it.
17. **Do not put three panes on a phone.** One pane and a switcher at 380px
    and below. A 328px list beside a map beside a 432px panel on a 375px
    screen is three unusable things instead of one usable one.
18. **Do not simulate a network failure in the compose modal.** There is no
    network. The only honest failures are an unsendable draft and an empty
    field.
