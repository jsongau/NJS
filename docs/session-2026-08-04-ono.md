# Session 2026-08-04 - /ono launch

Built the Ono Hawaiian BBQ Marketing Manager work sample end to end (v1 through v18) and shipped it at `/ono`. Single self-contained file, `ono/index.html`, no external assets.

## What shipped
- **1 · Enter.** $200 gift-card sweepstakes in real Ono teal/gold pulled from the live site (not the black meta tag). One question per screen (favorite plate, location, email, name, optional phone), auto-advance, recruiter prefill that visibly clicks through the flow. Hero: three-act animated raffle scene (entries drop into a koa bowl, three names drawn with gold rings, seven-dish feast), four check-off pills, urgent countdown, gift-card design picker with the three uploaded card designs, real Ono wordmark in the nav.
- **A/B prize test**, toggle in the nav: A = three equal $200 cards; B = tiered $400/$150/$50. Same $600/month face value, so the test isolates structure psychology from budget. One `PRIZE` object rewrites headline, hero copy, tickets in the animation, rules modal, and share messages.
- **2 · Convert.** Menu match with animated Uber Eats delivery scene ("as early as 10 minutes"), unique `ONO30-` codes toward a gift-card purchase on shop.onohawaiianbbq.com, referral modal capped at 3, group calculator whose CTA opens Ono's real catering page (48-hour lead time quoted from that page), and a game-day events rail: LA Kings home opener Oct 6, LA Galaxy's seven remaining home dates, LAFC Oct 10, WWE Raw at Honda Center Sep 14, UFC 331 at Crypto.com Arena Sep 19 — all verified against published schedules, each with an animated scene and a viewer modal that lands on the catering CTA.
- **3 · Measure.** Prepaid growth intelligence dashboard. Centralized `assumptions → calculateModel → render` pipeline, 30+ sliders, draggable redemption curve (capped so total redemption never exceeds the redemption rate), rollout scale, reinvestment allocation dial. Investment band shows ad spend ($1,000/store/month × stores × months, derived not slider), CTA performance, prize programme ($600 cards + $200 fulfilment = $800/mo), and CAC with LTV ratio. Accounting kept honest: cash ≠ revenue, deferred revenue rollforward balances, breakage modeled not assured, CA Civil Code 1749.5 (no expiry, sub-$15 cash-out) reflected, bonus face value never double-counted against fulfilment cost. Scenario compare, sensitivity, break-even solver, risk register, guided demo, CSV export.

## Decisions
- Media spend is derived from per-store radius buy, never a lump-sum slider, so budget scales with the rollout selection.
- Prize reconciles the requested $800/month as $600 face + $200 fulfilment/admin; economic cost modeled at food cost, not face.
- Variant toggle is a demo control; a live test needs server-side sticky assignment. Stated plainly in the page and pitch.
- Events rail uses custom animated SVG scenes instead of YouTube embeds: no inventable video IDs, no external requests, still reads as video.
- $30 code copy standardized everywhere to "toward a gift card purchase" (not a free $30 card); modeled as bonusFace obligation.

## Traps
- Page `.sec` class collided with the countdown's seconds cell (`.cd-c.sec` caught section padding, 122px-tall cell on mobile). Renamed to `.csec`. Namespace component classes.
- CSS mobile overrides must come after base rules: `.dgrid2` collapse silently lost until moved to the end of the second stylesheet block.
- Grid tracks would not shrink below the cohort table's min-content; `min-width:0` on grid items fixed 826px-wide mobile dashboard.
- CSS `transform` overrides SVG `transform` attributes — every animated sprite is a static-wrapper + animated-child pair.
- Pareidolia at small sizes: three separate icons read as faces until symmetry was broken. Lay proteins flat, one rice scoop not two, delete texture dashes.
- Cloud push is read-only on this repo; deploy runs as native git on the Mac.

## Follow-up shipped same day, v19 to v20
- A/B toggle moved beside the wordmark as a sliding two-letter control; variant B card designs now read $400/$150/$50 with place tags, and the hero badge follows the selected design.
- Group order rebuilt as a 1 to 12 slider: per-plate price falls $16.50 to $10.85 with savings chip and meter; CTA opens Ono's catering page.
- Sticky game-day floater on Convert cycling the five verified events, hidden while the events band is on screen.
- Share CTA rebuilt with animated friends-and-entries SVG art and balanced text.
- Site-wide spatula cursor as real CSS cursors, two rendered 32px PNGs, tilted variant on interactive elements, fried-egg flip on real clicks.
- Fixed live: dashboard money formatter was shadowing the group calculator, collapsing $11.30 and $10.85 both to $11.

## Next
- `scenarios` table (Supabase): persist dashboard assumption sets to shareable URLs (`/ono?s=id`) and log recruiter slider interaction; same schema doubles as A/B assignment store. Schema + API first, then UI.
- Saturation curve so CAC rises with spend density in a fixed radius (base funnel is linear in media today).
- Non-holiday gift-card designs when Ono publishes them (all three current are Christmas).
