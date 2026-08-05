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
- Customer journey reframe, v21: section retitled Winning isn't the campaign. What happens next is. Five lifecycle stages: Welcome and bonus offer, Best seller spotlight, Limited time reminder, Personalized next offer, Win them back.
- Group calculator pays from the gift card, v21: $200 card plus $30 bonus equals a $230 stack, teal and gold balance bar splits tonight vs left on card, caption counts plate lunches remaining.
- Gift-card pay became an opt-in toggle, v22: off shows a one-line tease with the extra saving; on shows the balance bar, effective cash cost, $9.43 a plate at 12 people, stacked $84.78 total saved, and a Buy the $200 gift card CTA. Offer-card buy button shortened to one line.

## Programme economics, v25 to v26
- Root cause of the negative conservative case: a single flight charged the entire media budget against one cohort and stopped. Real programmes relaunch to the list they built.
- Added launch cadence: N launches, configurable gap, owned-list re-engagement rate, owned value multiplier, list retention. Each launch buys the same paid reach; the owned list is incremental and free.
- Anti-double-count: returning list members are credited only the incremental card purchase and overspend, never repeat or catering value already counted at first entry. Re-engagement decays 18% per launch; owned entries capped at 70% of list.
- Conservative recalibrated to defensible local-restaurant Meta rates ($1.55 CPC, 2.9% entrant-to-card, was $1.85 and 2.4%). Turns positive at launch 2, $50k across 4 launches.
- Verdict now reads "Commit to the programme, not one flight" when a single flight is negative but the programme is positive; the contribution card shows both reads.
- Preset cards render each views own model run: stores, CPC, entry conversion, entrant-to-card, and programme outcome with crossover launch.
- Sticky bar rebuilt as spend -> generates -> returns, all programme-wide, with new-revenue top line (cards, overspend, repeat, catering).
- v27: ads run one flight only. campaignMonths default 2, new mediaLaunches lever (default 1) controls how many launches buy media; later launches have zero media, zero paid entries, zero impressions and market only to the owned list. Conservative: $24k media over 2 months, positive at launch 2, $22.1k programme contribution.
- Sticky bar shows stores x per-store = monthly burn so total spend is verifiable on screen. Delta pills moved into a flex row beside the value (they were absolutely positioned over the labels).

## Channels, referrals and Ono markers, v28
- Delivery channel added: entrants who take the Uber Eats CTA, orders per customer, average basket, and a marketplace commission that is deducted. A dollar of delivery revenue is worth materially less than a dollar in store and the model says so.
- Catering carries a game-day calendar lift tied to the events rail.
- Referrals modelled as real virality: share rate x friends per sharer gives a viral coefficient (0.20 default). Referred entries run the same funnel at zero media and pull blended cost per entry from $3.67 to $3.07. Capped at three per sharer to match the entry page.
- New Where the money comes from panel breaks one flight into five contribution bars so each channel can be challenged separately.
- Programme CAC fixed: it divided whole-programme media by launch-one buyers only, reading $177 with LTV:CAC 0.94. Now counts buyers from the free relaunches: $40 per buyer, $2 per contact, about 4:1 against $166 LTV.
- revPerStoreMonth added so a 9x ROAS reads as $860 per store per month, roughly a sub-1% lift, instead of looking like fantasy.
- Status dots replaced with animated SVG Ono markers: three-layer grill flame with flickering core and rising spark for live/urgent, breathing plumeria for status. Both glow via drop-shadow and freeze under reduced motion.

## Incrementality and honest defaults, v29
- Conservative floor is the default preset on load and the reset target. It is the case worth defending in an interview.
- Regional scale-up was compounding six independent optimistic assumptions (3x stores x 1.63 clicks x 1.43 entry x 2.0 card x 1.33 organic x 5x referral k) into 24x buyers and 31x revenue. Rebased so scaling means wider footprint at conversion the test already proved plus a modest creative gain: now 10.8x.
- Incrementality added: incrCard 65, incrRepeat 50, incrDelivery 60, incrCatering 70 as sliders. New True incremental contribution card reports the honest number and what would have happened anyway. Programme incremental computed per launch, not scaled by a near-zero single-flight ratio.
- Two stale single-flight metrics were contradicting the programme model on the same screen. Risk register divided programme media by launch-one buyers only. Break-even said contribution never turns positive while the programme crossed at launch 2, now split into One flight pays back and Programme turns positive.
- revPerStoreMonth referenced R.programMonths before assignment and read $0. Moved after.
- Four-lens exec panel (CEO/COO/CFO/CMO) run as a subagent review. Built their unanimous number one (incrementality). Not yet built: Monte Carlo P10/P50/P90 downside band, a real holdout test design with MDE and weeks to significance, redemption load expressed as tickets at peak daypart rather than dollars, and the POS work three card types require.

## Ad fatigue cap and scale saturation, v30
- Flight hard-capped at 3 months. campaignMonths slider max lowered to 3; FATIGUE_STEP 0.16 raises effective CPC 16% per extra month and dulls entry conversion (0.35 coupling). effCplv and lastMonthCplv drive the media panel, which turns amber at the cap. Justifies the cap with math instead of asserting it: past 3 months you pay more for a worse audience, which is why the programme relaunches to the owned list.
- Scale saturation: SCALE_CPC [0.94,1.00,1.13,1.24,1.34] and SCALE_CONV [1.03,1.00,0.94,0.90,0.86] indexed to scaleIdx. Wider rollouts buy worse inventory. Directly answers the CEO-lens gap about linear scaling.
- Regional return was 10x purely from linear scaling. With saturation plus rebased assumptions it lands at 6.03x. The real tell is incremental revenue per store per month: 367 / 774 / 925, so Regional is only modestly better per location than the test, which is what scaling a proven campaign looks like.
- Three leading-comma artifacts fixed in the media panel copy.

## Next
- `scenarios` table (Supabase): persist dashboard assumption sets to shareable URLs (`/ono?s=id`) and log recruiter slider interaction; same schema doubles as A/B assignment store. Schema + API first, then UI.
- Saturation curve so CAC rises with spend density in a fixed radius (base funnel is linear in media today).
- Non-holiday gift-card designs when Ono publishes them (all three current are Christmas).
