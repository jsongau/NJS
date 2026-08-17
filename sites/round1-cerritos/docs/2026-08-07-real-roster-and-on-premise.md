# 2026-08-07 — The real roster, the on-premise half, and the event draft

## What changed and why

The account list was twenty modelled grocery banners. It is now **27 accounts
published by Ole Smoky's own store locator** (`olesmoky.com/pages/find-a-jar`,
search "City of Industry, CA 91748"): 12 retail locations and 15 bars and
restaurants, with name, address, city, ZIP, phone and the locator's own quoted
distance all carried as `public` provenance.

That is the whole point. Every other number in this app is modelled and says so.
The roster is now the one thing a reader can check against the brand's website in
thirty seconds — and the account drawer links to the search so they can.

It also corrected a category error. Ole Smoky in this corridor does not live in
supermarkets. It lives in independent bottle shops, a couple of convenience
counters, one specialist, and fifteen bars — a half of the business the old
roster had no representation of at all.

## Decisions made

**`VenueClass` is a type, not a tag.** Off-premise sells a sealed bottle; on-
premise sells a pour. Different buyer, different unit, different ask, different
legal footing. A function taking a `VenueClass` cannot silently be handed the
wrong kind of account.

**`domain/channels.ts` is the one home for what a channel means** — label, glyph,
venue class, the name of the negotiated space, and how it trades. Label and glyph
used to live in `Wordmark`, velocity behaviour in a ternary chain in
`accountSkuStatus`, and "is this a bar" was re-derived at every call site. The
union type means adding a channel now breaks the build everywhere that has to
decide something about it.

**The stored case rate went fractional.** This was the largest change and the one
that produced the most downstream work. A 750ml bottle is ~16 pours at 1.5oz, so
a case is ~200 drinks. The old `Math.max(1, …)` floor meant the model could not
represent a bar's real rate, and the smallest number it could say — one case a
week — was about three times what a neighbourhood pub actually pours. That was
not a rounding problem; it was the app telling a bar to triple its order.

**`domain/rate.ts` is the only place allowed to turn that number into words.**
Cases at a shop, bottles and pours at a bar. One stored fact, the reader's unit.
The email needs it, the issue detail needs it, the order-line reason needs it — a
formatter that lives in a component gets copied into the next one, and then the
email says cases while the screen says bottles about the same row.

**The opportunity score is normalised per venue class.** The anchors (90 void
cases = 100, 220 base weekly = 100) were calibrated on grocery. Against this
roster a busy sports bar carries ~5 cases a week total, so all fifteen bars
scored ~2 and the on-premise ranking carried no information. Each lane is now
scored against its own ceiling, because "which account do I work next" is only
meaningful within a lane.

**Order increments are lane-aware.** Four cases is a normal minimum at a bottle
shop and forty-eight bottles into a pub's back bar. On-premise and fuel
forecourt order in ones.

## Decisions rejected

**One shared opportunity scale across both lanes.** It would correctly conclude
every bar is worth less than every shop — true of one week's cases, useless as a
plan.

**Making the locator distance the app's distance.** The locator does not document
whether it reports straight-line or driving distance, and these coordinates do
not reproduce its figures, which is itself evidence it is a road distance. So
`locatorMiles` is quoted from the source and never recomputed; the app's own
haversine mileage from the wholesaler is a separate, separately-named number.
Two distances, two names, two sources.

**Fabricating verified coordinates.** The Census geocoder is unreachable from
this container (the outbound proxy refuses CONNECT). The choice was a hand
placement stamped `approximate` or an invented one stamped `verified`. The point
of carrying an accuracy field is that it stays true when it is inconvenient.

## Traps discovered

- **`DEFAULT_STORE = "ranch99-nogales"`** — a hardcoded account id that no longer
  existed. Nothing threw. The order desk opened on a store the app had never
  heard of and rendered its own header as "undefined, undefined". Now derived
  from the roster.
- **Seven accounts sharing one mailbox.** Three Applebee's and four Buffalo Wild
  Wings, and the old "one mailbox per banner" rule gave all seven the same
  address. Repeated banners now get the city appended, computed from the roster.
- **`39.76000000000001` in the largest numerals on the page.** Fractional rates
  plus a naive sum. Rounding each account did not fix it — the *total* has to be
  rounded too. `roundCases()` at every aggregation site.
- **"About 1 case a week move through here."** Verb agreement has to follow the
  reader's unit, not the stored one.
- **`FAMILY.rtd.label` still said "Non-alc"** — a false claim about a 4.5% ABV
  canned cocktail. The family *id* was renamed in the reskin; the label was
  missed, because a label is not an identifier and nothing breaks when it is
  wrong.
- **"proposed by Molson Ole Smoky"** on the distributor page — a find-and-replace
  that inserted the new name and left the old one.
- **"most of the week's beer volume"** in an email draft. It survived a
  brand-name grep because it never named a brand.

## The event draft, and the rule it holds

`src/data/events.ts` carries UFC 330 (15 August 2026, Makhachev vs. Machado
Garry) as a **public fact about a date** — no sponsorship claim, no mark, no
relationship asserted. The draft is generated from that record, so the lead time
recalculates daily ("eight days out" becomes "three days, this needs to be on
Thursday's load") rather than a hardcoded paragraph still saying "two weeks" on
the morning of the fight.

The sentence it refuses to write is "we will fund your fight-night promo". A
supplier may **furnish** point-of-sale material (27 CFR 6.84) and may not pay a
retailer, buy its advertising or cover its costs (California B&P 25500, 25502).
The guardrail renders directly under the message box in the compose window,
because the one draft somebody would edit into "and we'll cover it" is exactly
this one. A rule in a training deck is a hope; a rule at the moment of sending is
a control.

## Verification

- `npm run typecheck` and `npm run build` clean.
- `scripts/proof-phase9.mjs` — tabs read `All 27 / Retail 12 / On-premise 15`,
  the retail tab reports "12 of 12 retail locations", the UFC draft is present on
  a sports bar, zero page errors. Screenshots in `docs/p9-*.png`.
- Modelled rates spot-checked by lane: BevMo 13 cases/wk on the lead jar, Canyon
  Liquor 4, Mobil 2 on minis, Buffalo Wild Wings 14 bottles (~232 pours),
  O'Donovan's Pub 2 bottles (~36 pours), Black Angus 4 bottles.

## Next steps

1. **Repoint the outbox at the wholesaler.** Add `counterparty: "retail" |
   "wholesaler"` to `SentMessage`, seed 3–4 Southern Glazer's threads, two-way
   filter on `/sent`. ~1 hour.
2. **The instructional tasting desk**, where California §25503.56 *is* the input
   validation rather than a note beside it.
3. **Supabase**: `orders` + `order_lines`, with the tied-house rule as a CHECK
   constraint so an illegal row cannot be written rather than merely not being
   rendered.
