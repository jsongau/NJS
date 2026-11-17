# Session 2026-11-16: funnel build template (memorial and senior care)

## What changed
- `funnels/memorial/index.html`: hand-built, self-contained page (like `/ritual`). Concept brand
  "Lanternhill". Three doors (planning ahead, a death just happened, care for a parent), veteran
  mode, A/B headlines, Daylight/Evening look, Nathan's commentary with spotlight, demo-only
  confirmations, and a "Behind the funnel" section (funnel map, Meta ad sets, GoHighLevel pipelines,
  automations, reporting). Deep links: `?door=need|care`, `?vet=1`, `?ab=b`, `?notes=1`, `?look=evening`.
- `/funnels` hub (generated: `partials/studio/pages/funnels.html`, `assets/studio/funnels.css`,
  `PAGES.funnels`), listing this template and the Ritual growth funnel.
- Mega nav Build panel gets a "Funnel build templates" block; phone menu, footer and sitemap link it.

## Decisions
- Concept brand instead of Refuge Memorial's name or branding. A page with a real funeral company's
  name and a working intake form could pass as theirs and take grieving families' details. The
  application email can link the template and say it was built for the role.
- Nothing is sent or stored. Forms validate and show a confirmation marked "Demo".
- The Ritual mechanics (countdown, sweepstakes, demo "just entered" toasts, group buy) were not
  carried over: fake urgency is wrong for this category and against the honest-copy rule. The
  architecture was kept: audience switcher, toggles, multi-step email-first intake, commentary,
  confirmation with next steps.
- The at-need door has no funnel: a phone number, a three-field callback, first-hour guidance.
- Review requests: same link for every family (Google prohibits selective asking).

## Facts used, with sources read
- California B&P Code 7685: a funeral establishment website must post its general price list goods
  and services, linked from the homepage.
- VA burial benefits (AARP summary): national cemetery burial where space is available, headstone or
  marker, burial flag, Presidential Memorial Certificate, at no cost depending on eligibility;
  a burial allowance may apply.

## Next steps
- Jay: if he wants the page to say who it was prepared for, add one text line to the Template menu
  (no logo).
- Optional wave: wire the page's step events to `studio_events` (needs names in track.js, the edge
  function and a new migration, per CLAUDE.md).

## Wave 4 (same day): research and the planning toolkit
- Research: `docs/research/2026-11-16-memorial-preneed-industry.md`. Key finding: Refuge Memorial is a
  virtual, nationwide pre-planning company (not a funeral home), selling plans plus funding, with
  veteran help and simple cremation plans. If its ads mention insurance or payment plans, Meta's
  Financial products and services category applies: no age, gender or ZIP targeting, no lookalikes.
- Toolkit on `/funnels/memorial`: ten tools, each with a sourced figure, a commentary note and a
  tracking event. Medians shown as published; the cost lines add to 9,959 against NFDA's 9,995 and
  the page says so.
- Not built yet (in the research backlog): the seven Bureau questions as an FAQ, a Spanish planning
  door, a Medi-Cal July 2027 explainer once DHCS rules are confirmed, live GoHighLevel capture.
- Items marked **verify** in the research must be checked before reuse on a client page.

## Wave 5 (same day): stack showcase, GoHighLevel add-ons, copy pass, phone and haptics

- The stack, wired: one example lead stepped through Meta ad, page, Zapier, GoHighLevel and back to Meta by the
  Conversions API, with an event log. Auto-play only on screen, pauses on hover or focus, final state under
  reduced motion. No vendor logos; names only, with a not-affiliated line.
- GoHighLevel add-ons: 20 cards from HighLevel's integrations page and SupplyGem's guide, each labelled Built in,
  Connects or Premium, each with a funeral home or care use. Filters dim instead of hiding (no layout shift).
  "Pick what I'd start with" adds six. Picks are copied to the clipboard; they are **not** sent with the lead form
  yet. Sending them is a lead-intake change (plan first). No prices on the page (Studio rule).
- Copy pass (kill-ai-tells): rewrote the toolkit lede, "Prices rise" (now NFDA's real 5.8% figure, slower than
  inflation), the cremation line, the 30-days line, the price list line, the behind-the-funnel headline and the CTA
  band. Rejected fake-scarcity FOMO; honest-urgency lines live in the research doc, section 9.
- Phone: three-column door picker (no sideways scroll), left-aligned toggles, 44px targets, a floating next-step
  bar that appears only when the intake card is off screen (call link on the help-now door), banner no longer
  sticky on phones.
- Haptics: `assets/funnels/haptics.js`. Android uses the Vibration API, iOS 18 and later gets the switch-input
  tick. Touch screens only, off with reduced motion. Pick, done and warn patterns; submit buttons let the form
  decide (done on success, warn on a missing field).

## Wave 6 (same day): landing page builder, waves 1 and 2 of its plan

- `/funnels/memorial/builder`. Jay approved the plan ("Go"). Data, renderer and UI are separate files in
  `assets/funnels/builder/`: `data.js` (angles with sources, sections, nine templates, palettes, fonts, the Bureau's
  seven pre-need questions), `render.js` (pure: state to a complete HTML page, used by the preview, the tests and
  the coming download), `app.js` (UI). Plain scripts on `globalThis.FB` so Node tests can load them.
- Preview is a same-origin iframe; updates replace the body and style in place so scroll is kept. Desktop is a
  1240px page scaled to the stage (positioned by margin, since grid centering pushed an oversized box right).
- Honesty built in: square brackets mark text the business must supply (prices, dates, carrier facts) and show
  highlighted; reviews are slots for real reviews only; every template links the general price list; no fear
  hooks or urgency words (a test enforces it). No real brand's name or look on any template.
- Tests: `tests/studio/builder.test.mjs` (7). Suite is now 51 pass, 8 skipped.
- Not built yet (plan waves 3 to 6): the ten toolkit tools as blocks, the matching Meta ad preview and compliance
  check, download HTML and share link, phone bottom sheets, then saving and "send to Nathan" (backend, separate OK).

## Wave 7 (same day): builder waves 4 and 5, first tool blocks

- Right panel is now tabs: Edit, Meta ad, Check (keyboard arrows move between tabs; the Check tab shows a count).
- Meta ad: `FB.ADS` per angle (original copy, Meta button types), a mockup in the brand's colors, message match
  out of 3 (same angle, button fits the page's action, shared words with the headline), and who-sees-it notes,
  including the financial products and housing special ad categories. The help-now page gets no ad, on purpose.
- Check: `FB.RULES` (fear, urgency, impossible claims, personal attributes, each sourced) plus structural checks.
  "Show me" jumps to the section. A test proves each rule catches its example and no shipped wording trips it.
- Download: `FB.renderDoc` with the tools script inlined, so the file works offline. Share: slimmed state,
  deflate-raw compressed, base64url in `#p=` (about 340 characters for an eight-section page). No backend.
- Tool blocks: cost builder (NFDA lines, same as the toolkit, total 9,959) and payment plan. `FB.lpTools` must stay
  free of closures because it is inlined into downloads with `toString()`.
- Bug found and fixed: selecting a section re-rendered the preview and reset tool inputs; selection now only moves
  the highlight.
- Tests: 54 pass, 8 skipped. Remaining toolkit tools as blocks and saving or sending builds stay for later waves.

## Wave 8 (same day, pushed 2026-11-17): behind the page gets its own page

- Jay: the behind-the-page material belongs on a separate page that the funnel links to. `/funnels/memorial`
  is now only the family's experience; `/funnels/memorial/behind` holds the stack, the add-ons and the tabs,
  and opens with who is speaking (Nathan, to the business owner).
- Misread logged: "that should be like a bottom center rail" was about the behind-the-page intro, not the
  demo controls. The controls briefly became a bottom dock (live in d824455); this commit puts them back on top.
- Old links forward with `location.replace` before render; `behind.js` opens a tab from `#map`/`#ads`/`#crm`.
- Test added: the funnel has no stack, add-ons or tabs and links to the behind page, which links back.
