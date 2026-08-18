# SHARED BRIEF — read this in full before writing a line.

You are working in a React 18 + TypeScript + Vite app at `/tmp/work/me-prospecting`.
Deps are installed. `npx tsc -b --pretty` is currently CLEAN. `npm run build` currently passes.

## WHAT THIS APP IS

It is called THE OPENING BOOK. It is an independent work sample built by Nathan J. Song (Jay) for a
Sales Manager application at MAIN EVENT BREA, and it will be published at nathanjsong.com/me/scout.

THE CENTRAL FACT: Main Event Brea IS NOT OPEN YET. mainevent.com publishes an address
(245 W Birch Street, Brea CA 92821), a phone number ((657) 530-1177), "more than 26 lanes",
laser tag, Gravity Ropes, over 100 games, private party rooms and dedicated meeting space, and a
"Coming soon" banner with an opening-interest form. It publishes NO hours and NO opening date.

So there is no client base, no walk-in traffic, no CRM history. The job posting's first daily
responsibility is "Perform outbound lead-generating activities outside the building, including
tabling, networking events, and go-sees with prospective and current customers." This app is the
tool for exactly that: build the book before the doors open.

## READ THESE FIRST. All of them. They set the register you must match.

- `src/domain/types.ts` — the domain model, heavily commented. Read all of it.
- `src/domain/lanes.ts` — the eight prospecting lanes, LANE_META, OCCASION_CLASS_META, lanesForGuests
- `src/domain/vocabulary.ts` — the ONE vocabulary. StatusTokens with glyph + label + cssVar.
- `src/data/venue.ts` — VENUE, PERIODS, OFFERS, NOT_PUBLISHED_FOR_BREA, DEMO_RECIPIENT, INBOUND_ROUTES
- `src/data/packages.ts` — PACKAGES, PACKAGE_BY_ID, PRICED_PACKAGES, GATED_PACKAGES, STANDARD_TERMS,
  BANQUET_FLOOR_PER_GUEST
- `src/styles/tokens.css` — the design tokens. Use the CSS variables, never a raw hex.
- `src/styles/base.css`

**AND READ AT LEAST TWO FINISHED PAGES PLUS THEIR CSS MODULES BEFORE YOU WRITE ANYTHING.**
`src/pages/LaneBoardPage.tsx` + `.module.css` and `src/pages/RepliesPage.tsx` + `.module.css` are the
best models. These eight pages are already finished and polished and the hiring manager will read
your page in the same sitting as theirs. Match their section rhythm, their heading scale, their
eyebrow/lead/body pattern, their table and card idioms, their comment register. Do not invent a new
layout language.

Finished pages you can study: DeskPage, TradeAreaPage, LaneBoardPage, PackagesPage, BookPage,
WeekSheetPage, RepliesPage, FieldPage.

## NON-NEGOTIABLE RULES

1. **NO EM DASHES, NO EN DASHES, NO ARROWS (`->` or `=>`) IN ANY HUMAN-READABLE TEXT.** Not in UI
   copy, not in code comments. Use a comma, a full stop, or a semicolon. This is a standing rule from
   the owner of this site and it is checked with a grep. (`=>` in actual TypeScript arrow functions
   is fine, obviously.)
2. **COLOUR IS NEVER THE ONLY SIGNAL.** The owner is colourblind. Every status carries a GLYPH and a
   WORD alongside any colour. A legend keyed only by swatch is a bug. Every bar carries its number.
3. **EVERY COMMERCIAL NUMBER CARRIES PROVENANCE.** Use the `ProvenanceBadge` / `Figure` /
   `WithheldFigure` primitives from `src/components/primitives/ProvenanceBadge.tsx`. The provenance
   values are: public, illustrative, modeled, observed, user_input, withheld. "withheld" is special
   and important: it means Main Event deliberately does not publish that figure. A withheld price
   renders as the SENTENCE "Main Event does not publish this", never as a number.
4. **INVENT NOTHING ABOUT MAIN EVENT.** Every package name, price, guest minimum, day-part
   restriction and attraction in `data/packages.ts` and `data/venue.ts` came off mainevent.com on
   11 August 2026 and carries a source URL. Do not add a price, a lane count, a room capacity or an
   attraction that is not already in those files. If you need a figure that is not there, say
   plainly on screen that it is not published.
5. **NO INVENTED PEOPLE.** Roles and titles only ("Assistant Principal for Activities", "Sales
   Manager"). Never a made-up human name.
6. **BRITISH-ISH SPELLING IN PROSE**, matching the inherited codebase: colour, behaviour,
   organisation, neighbourhood, recognised, utilisation. ("modeled" stays American only because it is
   the type literal.)
7. **DEMO MODE IS STRUCTURAL.** There is no email transport anywhere in the dependency tree. Sending
   writes a row to the outbox. The demo recipient is `DEMO_RECIPIENT` from `data/venue.ts`.
8. **DISCLAIMER.** This is an unaffiliated work sample. No Main Event logo, wordmark or trade dress.

## THE CODE COMMENT CULTURE (the single most distinctive thing about this codebase)

Files open with a block comment that explains WHY the file exists and what failure it prevents, in
confident plain prose, often several paragraphs. Non-obvious decisions get their own comment
explaining the alternative that was rejected and why. Read `domain/types.ts` and `domain/lanes.ts`
and match that register precisely. Do not write `// set the state` comments. Write comments a hiring
manager would stop and read.

## STYLE / CSS

- CSS Modules, one `.module.css` per component, same filename. Import as `styles`.
- Use the CSS custom properties in `tokens.css`: `--surface-0..3`, `--text-0..3`, `--accent`,
  `--brand-gold`, `--ok/--warn/--risk/--info/--neutral` and their `-tint` variants, the `--lane-*`
  and `--fam-*` families (each with a `-tint`), `--ledger-revenue`, `--ledger-activity`, `--prov-*`
  including `--prov-withheld`, `--line`, `--line-2`, `--line-strong`, `--radius-*`, `--shadow-*`,
  `--space-1..8`, `--step--2..--step-5`, `--font-ui`, `--font-mono`, `--font-operator`,
  `--font-display`, `--z-*`.
- Register: enterprise software, cool paper ground, hairline rules, one hot amber doing the
  editorial work. Restrained. No gradients, no glows, no pulsing dots, no drop shadows doing
  structural work. Hairlines and type hierarchy carry it.
- Responsive down to 380px. Real focus states. Semantic HTML. `aria-label` on icon-only controls.
- Path alias `@/` maps to `src/`.

## THE FOUNDATION CONTRACT (already on disk, import from these; do not invent new primitives)

`@/components/primitives/ProvenanceBadge` — `ProvenanceBadge`, `WithheldFigure`, `Figure`,
`PROVENANCE_META`, `PROVENANCE_ORDER`, `ProvenanceMeta`
`@/components/primitives/LaneChip` — `LaneChip`, `OccasionClassChip`
`@/components/primitives/StatusChip` — `StatusChip`, `EmailConfidenceChip`, `TokenChip`
`@/components/primitives/FamilyChip` — `FamilyChip`
`@/components/primitives/PackageGlyph` — `PackageGlyph`
`@/components/primitives/PinMark` — `PinMark`
`@/components/primitives/Wordmark` — `Wordmark`, `ProspectPlate`, `initials`
`@/components/primitives/Button` — `Button`
`@/domain/vocabulary` — `StatusToken`, `PITCH_STATUS`, `PITCH_STATUS_SHORT`, `PITCH_STATUS_ORDER`,
  `EMAIL_CONFIDENCE`, `ACTIVITY_TYPE`, `ACTIVITY_TYPE_ORDER`, `REPLY_DISPOSITION`, `FamilyToken`,
  `PACKAGE_FAMILY`, `PACKAGE_FAMILY_ORDER`, `LEDGER`
`@/domain/lanes` — `LaneMeta`, `LANE_META`, `OCCASION_CLASS_META`, `occasionClassOf`,
  `isCalendarLocked`, `LANE_ORDER`, `GUESTS_PER_BOWLING_LANE`, `lanesForGuests`
`@/domain/selectors/desk` — `ScoreComponent`, `DeskLine`, `milesFromVenue`, `windowMonths`,
  `windowOpensWithin`, `scoreProspect`, `DeskOptions`, `deskLines`, `laneCounts`, `unworkedCount`,
  `liveConversationCount`, `emailableCount`, `doorOnlyCount`
`@/domain/selectors/capacity` — `DayLoad`, `dayLoads`, `fitCheck`, `MAX_SIMULTANEOUS_BOWLERS`,
  `PackagePressure`, `packagePressure`, `pipelinePressure`
`@/data/prospects` — `PROSPECTS`, `PROSPECT_BY_ID`, `EMAILABLE`, `DOOR_ONLY`
`@/data/packages` — `PACKAGES`, `PACKAGE_BY_ID`, `PRICED_PACKAGES`, `GATED_PACKAGES`,
  `STANDARD_TERMS`, `BANQUET_FLOOR_PER_GUEST`
`@/data/venue` — `VENUE`, `NOT_PUBLISHED_FOR_BREA`, `PERIODS`, `DEFAULT_PERIOD_ID`, `PERIOD_BY_ID`,
  `OFFERS`, `OFFER_BY_ID`, `DEMO_RECIPIENT`, `INBOUND_ROUTES`
`@/data/objections` — `ObjectionDisposition`, `Objection`, `OBJECTIONS`, `OBJECTION_BY_ID`,
  `objectionsForLane`, `SEVERITY_META`
`@/data/book` — `SEED_BOOK`, `SEED_ACTIVITY`, `SEED_REPLIES`
`@/data/prospectStatus` — `SEED_STATUSES`
`@/state/PipelineProvider` — `PipelineState`, `PipelineAction`, `PipelineProvider`, `usePipeline`,
  `usePipelineDispatch`, `statusFor`, `furthestStatus`, `touchesFor`
`@/state/BookProvider` — `BookState`, `BookAction`, `BookProvider`, `useBook`, `useBookDispatch`,
  `RevenueTotals`, `revenueTotals`, `ActivityTotals`, `activityTotals`, `hoursPerThousandBooked`,
  `activityByWeek`, `laneCoverage`
`@/state/ObjectionProvider` — `ObjectionEntry`, `ObjectionState`, `ObjectionAction`,
  `ObjectionProvider`, `useObjections`, `useObjectionDispatch`, `entryFor`, `ObjectionRow`,
  `objectionRows`, `objectionCounts`, `DISPOSITION_META`
`@/state/OutboxProvider` — `OutboxKind`, `OutboxOutcome`, `SentMessage`, `OutboxState`,
  `OutboxAction`, `OutboxProvider`, `useOutbox`, `useOutboxDispatch`, `sentTo`, `touchCount`,
  `OUTCOME_META`, `KIND_META`
`@/lib/email/templates` — `EmailTemplate`, `TemplateContext`, `templatesFor`, `subjectFor`,
  `isSendable`
`@/lib/links` — `DEMO_QUOTE_REF`, `QuoteLinkOptions`, `quoteLink`, `appLink`, `SOURCE_LINKS`

Open each of these files and read the actual signatures before you call anything. Do not guess a
prop name.

## SCOPE DISCIPLINE

- You own EXACTLY the files named in your task. Write those and nothing else.
- **Do not edit** `src/app/App.tsx`, any `src/data/*`, any `src/domain/*`, any `src/state/*`, any
  other page, any primitive, or `tokens.css`. Other agents are working in this tree at the same time.
  If you truly need a change in a shared file, DO NOT make it; say so in your summary instead.
- The route for your page is already wired in `App.tsx`. Just replace the placeholder file.
- Export the same component name the placeholder exports.

## BEFORE YOU FINISH

1. Run `cd /tmp/work/me-prospecting && npx tsc -b --pretty`. Fix every error **in the files you
   wrote**. Errors in another agent's in-flight page are not yours; leave them.
2. Grep your own two files for em dash, en dash and `->`. Fix any in prose or comments.
3. Confirm every number you render carries a provenance badge or is plainly non-commercial.

## YOUR OUTPUT

Write real files with the Write tool. Return a SHORT summary (under 150 words) of what you created,
anything you could not do, and any assumption you made. Do not paste file contents back.
