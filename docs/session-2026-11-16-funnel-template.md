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
