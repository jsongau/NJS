# Ole Smoky / The Jar Club, 9 Aug 2026

v111 through v118. Passport account surface, Trade tab, the Model rebuilt in
place, market and audience variation, glossary, Shopify Checkout.
**501 assertions across 19 jsdom suites, all passing.**

New docs this session: `meta-funnel-benchmarks.md`, `market-variation-research.md`,
`account-profile-ux.md`, `shopify-integration.md`, `interview-coaching.md`.

---

## The four bugs worth remembering

### 1. MKT had no name, so no market ever varied

`upd()` built `MKT = {pop, a, venue}`. No `n`. Every reader of `MKT.n` got
`undefined`, so `geoOf()` fell through to its default and all sixteen counties
returned identical numbers.

Worse: the Tennessee ticket weighting shipped in v108 tests
`/Sevier|Blount|Knox/` against `MKT.n`. **It had been matching nothing since the
day it was written.** Every market was silently getting the out-of-state 0.6%
booking rate.

**Lesson.** A model that is supposed to vary and does not is not a display bug.
Assert that two different inputs produce two different outputs, or the whole
thing is a mock-up with a slider on it.

### 2. The black line, three attempts, beaten by source order

`.cbar` is the sticky bottom rail. The hidden-state rule sat at byte 26541.
`.cbar.min` sits at 27686. **Both are specificity 0,2,0, so the later one wins**,
and `.cbar.min` re-applies `box-shadow: 0 14px 40px rgba(0,0,0,.7), 0 0 0 1px
rgba(0,0,0,.5)`. That second layer has no blur and no offset: a hard, pure-black
1px ring around a pill that is supposed to be off screen.

Fixed by scoping `.cbar.min:not(.on)` at 0,3,0, which outranks `.cbar.min`
wherever anybody appends a rule later.

**This was the ninth duplicate-selector shadowing bug in this file.** There are
roughly 45 top-level selectors declared twice. A build check for it is still not
written and should be.

### 3. Real newlines inside a JS-string stylesheet

Both the console and the prize wall keep their CSS inside a JS string with
escaped newlines. Twice this session an inserted rule used a real newline, which
terminated the string literal and killed every script on the page.

The wall stylesheet now carries a comment saying so, right where the next edit
lands.

### 4. Distance counted twice

`NEAR/INTN` is a distance heuristic. `G.b` is a distance elasticity. Multiplying
them gave Sevier `9.0 x 3.16 = 28.4%` of members booking a distillery tour, and
returns of 12x and 18x on the scenario cards.

`G.b` now replaces the heuristic instead of scaling it, off a 3% base, capped at
12%. Sevier lands at 9.5%, the launch flight at 3.05x.

**Lesson.** When two terms encode the same real-world thing, one of them has to
go. Numbers that look too good are usually two corrections stacked.

---

## Decisions made

**Direction C, the Passport, over the Tasting Card.** Three account designs were
built and compared. B had the strongest evidence (Firstleaf's measured fix,
Diageo's flavour print) but C extends the Hooch Hop, which is real, live since
Oct 2022, and captures nothing today. Keeping the stamp is free credibility with
both founders.

**Profile tab shows the record, Passport tab does the asking.** Sephora's traits
filter reviews on the product page; Firstleaf echoes answers back verbatim. A
preference screen that changes nothing visible is a data grab.

**Points are never paid for consent.** Email and SMS opt-in are worth zero, with
a test asserting it. Birth month only, no year.

**Four scenario cards became three.** Delivery-led only overrode `dord` and
`bpo`, neither of which touches the acquisition funnel, so it rendered every row
identical to the launch flight. Its argument is folded in.

**Spend ladders resized to the real brief.** County 500 / 750 / 1000, state
3,000 / 10,000 / 15,000. The top county stop is named **Saturation** and says
what it is: the extra money shows the same people the same ad again.

**The state ladder is weight, not more states.** Five thousand a state is the
brief, so two states at 5,000 each would produce identical per-state numbers and
a dead slider position. The higher stops put more into the selected state.

**Retargeting is on the page and argued against.** It has the best cost per
member and 11% new households against broad's 74%. Gordon 2019 across fifteen
Facebook RCTs found observational estimates off by roughly a factor of three.
The circulating "retargeting gets 4.2x ROAS" numbers are unsourced SEO content
and are deliberately unused.

---

## Corrections that would have embarrassed the candidate

**Ole Smoky is not a four-venue company.** A Myrtle Beach venue opened in 2026.
Say "four Tennessee venues plus Myrtle Beach."

**The 47.5% sweepstakes conversion figure is being misapplied by 3.3x.** It is
Unbounce's all-traffic median and Unbounce says it is driven by email lists. The
paid Facebook cell in the same report is 14.3%. The page now names this itself.

**Tennessee may prohibit online sweepstakes entry for spirits manufacturers.**
A TN ABC policy, not a statute, per a sweepstakes administrator's secondary
source. If it holds, the programme needs a mail-in alternate entry route for TN
residents. **This goes to counsel before any media money.** Primary sources are
linked in `meta-funnel-benchmarks.md`.

**Never cite:** Snipp's "34% of customers acquired through contests" (traces to
a dead CDN image), WordStream's $3.16 Restaurants CPL, or any Varos, Revealbot
or Socialinsider paid figure.

---

## Shopify checkout

Built to Shopify's shipped production stylesheet and open-sourced token file,
not to screenshots. 750px breakpoint, 45px inputs, 5px radius, #D9D9D9 borders,
#1878B9 focus ring, #FAFAFA summary, 38x24 card tiles, system font stack.

**The line that makes it worth showing:** points are not a tender type in
Shopify checkout. A loyalty app converts them to a discount on the pre-tax
subtotal or to a gift card. Only gift cards and store credit split natively, and
store credit cannot go partial. Full matrix in `shopify-integration.md`.

The mock never takes a payment and says so on every screen.

---

## Traps for the next session

1. **Check `MKT.n` exists before writing anything that reads it.**
2. **After any CSS edit, confirm the LAST declaration of that selector wins.**
   45 duplicates in this file.
3. **CSS inside a JS string needs escaped newlines.** Two scripts died on this.
4. **`esc()` will escape glossary markup into visible HTML.** Only escape fields
   that are plain strings.
5. **Validate every patch anchor before applying any of them.** `subs()` does it.
6. **Write atomically.** A killed write truncated this file by 350KB once.

## Next

1. The console nav is still ten tabs. It needs to be fewer.
2. No new charts yet. Both were asked for and both are outstanding.
3. A duplicate-selector build check, which would have caught nine bugs.
4. The 1 to 12 month drag on the model, still not built.
