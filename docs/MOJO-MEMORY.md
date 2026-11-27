# Mojo (conversion copy agent) memory: nathanjsong.com

Mojo owns headlines, buttons and the words around a decision on nathanjsong.com. Read this before writing
any headline, button label or checkout line. Newest rules first. Honest-copy rules in `CLAUDE.md` always
win: no made-up scarcity, stats or testimonials.

## Rules

- 2026-11-27 · **Never talk Jay down.** (Jay: get rid of stuff that downplays me.) No "one coach cannot cover",
  no "point you to the rest", no "without me". He is the head coach who sets the plan and assigns the rest. The
  one exception is a required disclosure: reformer Pilates stays "in certification" until he is certified.
- 2026-11-27 · **Head coach voice: send them out, call them back.** (Jay: glorify me better, so they still check
  in with me every week.) Any line that points to another studio or a free tool is signed "From your head coach"
  and ends on the weekly session: "Train with me every week, add what your week is missing, and bring back what
  you learn." The button says the ritual: "Check in with me weekly". Proof is only what the coach page states.
- 2026-11-23 · **The headline says the offer; the next line removes the biggest worry.** (Jay: the booking
  headline needed stronger conversion language.) `/fitness/book` went from "Pick a day. Pick a place. Train."
  (the steps) to "Book your first session. Pay nothing today." (the offer, then the reassurance). The steps
  moved to three short facts under the lede.
- 2026-11-23 · **Clear beats clever.** A visitor should be able to say what the page offers after five
  seconds. If the subhead is the only line that explains the page, it should be the headline.
- 2026-11-23 · **Two lines, each a whole thought.** No three-line staircase with one highlighted word. Each
  line fits its column at every width (`tools/check-headlines.mjs` proves it). The highlight goes on the
  reassurance line.
- 2026-11-23 · **Buttons say where they go.** "Continue to your focus", "Continue to your details", "Send my
  request", "Book this time". Never a bare "Continue" or "Book" where there is room; phones may shorten.
- 2026-11-23 · **Say the cost truth early.** Surprise cost is the top reason people quit a checkout, so the
  page says "Pay nothing today" and "No card needed" at the top, and the total stays visible in the panel.
  Only true statements: nothing is charged on the site, Jay confirms by email, the client pays him directly.
- 2026-11-23 · **The next step travels with the visitor.** The booking panel carries the same button as the
  step footer, in the same place on every step.
- 2026-11-23 · **A pack card sells the pack.** No class times, no per-session maths for Brea or 9Round, no
  chatty asides ("to fit how 9Round runs"). Premium, short, offer only. (Jay: "make it elite".)
- 2026-11-23 · **Name the service.** "In-home training", not "I come to you". See
  `docs/research/2026-11-23-pt-professional-language.md`.

## Research behind the rules (read 2026-11-23)

| Finding | Source |
|---|---|
| A generic headline with the product explained only in the subhead: 6% of five-second-test respondents could say what the product does. With the subhead as the headline: 20%. Illustrative, no sample size given. The subhead should "add Clarity, not be the sole holder of it". | [Unbounce, Oli Gardner: clarity of the value proposition](https://unbounce.com/landing-pages/increase-conversions-by-improving-the-clarity-of-your-value-proposition/) |
| Reasons shoppers abandon a checkout: 40% unexpected charges, 18% forced account creation, 17% process too long or complex, 12% could not see the total up front. Average checkout has 19.9 form elements; an optimized one can have 12. | [Baymard Institute: checkout flow](https://baymard.com/blog/checkout-flow-ux-optimization) |
| Replace generic "Continue" with a descriptive label to reduce hesitation. A progress indicator must be "a 1:1 map of the checkout process", and past steps should be clickable. | [Baymard Institute: checkout flow](https://baymard.com/blog/checkout-flow-ux-optimization) |
| Booking flows: keep day, time and place on one page; make the call to action prominent and in the same place on every step; 16px or larger for primary text. Of nearly 2,000,000 booking sessions sampled, 60% were on mobile (Xola's own data). | [Xola: checkout usability mistakes](https://www.xola.com/articles/checkout-usability-mistakes) |

Do not reuse the numbers above on the site as claims about NJS. They are other companies' research about
other audiences; they justify a choice, they are not proof of a result here.

## Where the rules are applied

- `/fitness/book`: headline, lede, three facts, button labels, booking panel button (2026-11-23).
- `/fitness` home calendar: "Book this time" (2026-11-23).
- `/`: two hero paths with one line saying which is for whom (2026-11-23, see
  `docs/session-2026-11-23-home-call-panel.md`).

## Not tested yet

None of this has been measured on nathanjsong.com. The next step is to count booking-step starts and sends
in `studio_events` (`book_step`, `lead_sent`) before and after, then test one headline against another.
