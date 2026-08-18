# Licensors, suppliers and promotional spend: what the second posting asks for and what is actually published

Research date: **13 August 2026**. Every claim below carries the URL it was read from.
Where a page does not say something, that is recorded as "not published" rather than filled in.

Read alongside `src/data/partners.ts`, `src/data/promo.ts` and `src/data/spend.ts`, which hold
the seeded layer, and `/method`, which carries the formulas.

---

## WHY THIS FILE EXISTS

The Opening Book was built for a **Sales Manager** application at Main Event Brea. Jay is also
applying to **Round1, Cerritos**, for a role called **New Business Development Promotion Planner
Manager / Senior Manager**. That posting is a different job in a related trade: it buys licensed
promotional product, reports its sell-through to the licensor, and controls the money.

Nothing about that job was in this application. Three surfaces now carry it: `/partners`,
`/promo` and `/spend`.

---

## SOURCE 1. THE ROUND1 POSTING

**Source:** the PDF supplied by the owner, an Indeed print of
`https://www.indeed.com/viewjob?jk=dbb0d1134b6065d9`, printed 12 August 2026, 6:27 PM.

Facts on the posting, verbatim where quoted:

- Title: **New Business Development Promotion Planner Manager/ Senior Manager**
- Employer: **Round1**, rated 2.8 on 398 reviews
- Address: **12900 Park Plaza Dr Ste 200, Cerritos, CA 90703**
- Pay: **$76,960 to $91,520 a year**, Full-time
- Application question: **"Are you fluent in both Japanese and English?"**
- Work environment: "Office-based role with occasional travel for supplier visits, trade shows,
  asset inspections (average once a month)"

### Every responsibility, verbatim, and where it now lands

Verbatim bullets are in quotes. "Covered by" names the surface. "Not covered" is stated plainly.

**New Business Execution & Timeline Support**

| # | Verbatim bullet | Covered by |
| --- | --- | --- |
| 1 | "Support the execution of multiple concurrent new business initiatives." | `/partners`, `/promo` and `/spend` run concurrently against one period selector |
| 2 | "Track project timelines, deliverables, and dependencies." | `/spend`, purchase order state plus expected date; `/partners`, lead time and next action |
| 3 | "Follow up with internal teams, vendors, and licensors on assigned tasks and deadlines." | `/partners`, last worked date plus next action per row, sorted by days since |
| 4 | "Escalate delays, risks, or execution issues to management." | `/spend`, the three exception counters at the top: over budget, past due, renews next |

**Merchandise Selection & Purchasing**

| # | Verbatim bullet | Covered by |
| --- | --- | --- |
| 5 | "Identify and source promotional products that fit brand image, campaign themes, licensing requirements, and trends." | `/partners`, each row carries what it supplies and which licences it can carry |
| 6 | "Evaluate product quality, pricing, and supplier reliability before purchase." | `/partners`, lead time, minimum order quantity and relationship state on every row |
| 7 | "Negotiate costs, terms, and delivery schedules with vendors and licensors to maximize profit margins and ensure brand alignment." | `/spend`, contract terms per agreement; `/promo`, margin per line |

**Promotion Coordination & Communication**

| # | Verbatim bullet | Covered by |
| --- | --- | --- |
| 8 | "Act as the primary liaison, clearly relaying all relevant promotion details, updates, and requirements to every internal department involved." | Partly. `/partners` holds the register; there is no internal department model in this app and none was invented |
| 9 | "Collaborate with marketing to develop promotional calendars and timelines, while keeping operations, logistics, finance, and store teams fully informed." | Partly. Periods exist and lead times exist; a marketing calendar does not |
| 10 | "Ensure all purchased items align with promotional themes, seasonal trends, target audience preferences, and licensor approval processes." | `/partners`, approval state per licence row |
| 11 | "Incorporate culturally relevant and trending anime/game properties into product offerings." | **Not covered.** No anime or game licence is published by any source read here, so none is claimed. See the gap note below |

**Vendor, Licensor & Budget Management** (the three the owner named)

| # | Verbatim bullet | Covered by |
| --- | --- | --- |
| 12 | "Maintain strong relationships with suppliers and licensors while scouting new vendor opportunities." | `/partners` in full. Status glyph plus word, last worked date, next action, and a prospect state for vendors not yet engaged |
| 13 | "Track sales performance of promotional products and create detailed internal and external sales reports for licensors." | `/promo` in full. Sell-through per line, and a generated per licence report on the page with the royalty-relevant figures called out |
| 14 | "Manage budgets, purchase orders, and invoices to ensure cost control and compliance with contract terms." | `/spend` in full. Budget against committed against actual, PO state, invoice ageing, contract terms per agreement |

**Analysis & Reporting**

| # | Verbatim bullet | Covered by |
| --- | --- | --- |
| 15 | "Monitor and analyze sales performance of promotional items to assess success and ROI." | `/promo`, margin and weeks of cover per line, ranked |
| 16 | "Use sales data to guide purchasing strategies and negotiate future promotional agreements." | `/promo`, the reorder read on each line derived from weeks of cover against lead time |
| 17 | "Provide accurate and timely reports to both internal stakeholders and external licensors." | `/promo`, the licensor report artefact |

**Administrative & Team Support**

| # | Verbatim bullet | Covered by |
| --- | --- | --- |
| 18 | "Maintain organized records, trackers, and documentation." | All three surfaces are exactly that |
| 19 | "Support meeting preparation, notes, and follow-up actions." | Partly. Next action per partner row; no meeting notes model |
| 20 | "Assist the team with daily operational needs and special projects." | **Not covered.** Nothing to model |
| 21 | "Perform additional duties related to New Business Development as assigned." | Not a testable requirement |

### Every qualification, verbatim, and whether the app can speak to it

| Verbatim requirement | Does the app show it |
| --- | --- |
| "Bachelor's degree" | No. A CV fact, not a software fact |
| "2+ years of experience in buying, merchandising, or procurement, preferably in retail or entertainment." | No. CV fact |
| "Strong negotiation skills, especially in working with licensors and licensed merchandise." | Indirectly. `/spend` shows the terms a negotiation produces: minimum guarantee, royalty rate, payment terms, notice period |
| "Proficiency in Microsoft Excel and other inventory/purchasing software." | Yes, by substitution. This is the purchasing software, and every figure is derived rather than typed into a cell |
| "Exceptional attention to detail to ensure promotional accuracy, product quality, and reporting precision." | Yes. The provenance rule is the demonstration: every figure states its origin |
| "Outstanding communication skills to effectively coordinate between multiple departments and external partners." | Partly. The licensor report is the artefact an external partner receives |
| "Excellent organizational and time-management abilities." | Yes. Lead times, ageing buckets, renewal ordering |
| "Ability to work under tight deadlines and handle multiple projects simultaneously." | Yes, by the exception counters |
| "In-depth knowledge of Japanese culture, including niche anime titles and mobile, PC, and console games." | **No, and it is not faked.** See below |

### The two honest gaps

1. **Anime and game properties.** Bullet 11 and the last qualification both ask for them. No source
   read for this file publishes an anime or game licence held by anyone Jay has a connection to. So
   no anime licence appears in the seed, and `/partners` says on screen that the register holds only
   the licences a source names. An invented Japanese licence sitting beside nine real published ones
   is exactly how a reader stops believing the nine.
2. **Japanese and English fluency.** The posting's only application question. Not a software fact.

---

## SOURCE 2. NATURE'S MARK

**The page loaded.** Fetched 13 August 2026 with the WebFetch tool. A direct `curl` from this
container was refused by the outbound proxy, which is a container fact and not a fact about the site.

### `https://natures-mark.com/partners/`

The page carries four headings: **Our Partners**, **Retail Partners**, **License Partners**,
**Have a Question?**

**License Partners, exactly as named, all nine:**

1. Disney
2. Peanuts
3. Sanrio
4. Warner Bros.
5. Rudolph
6. Paramount
7. Coca-Cola
8. Precious Moments
9. Sesame Street

The owner's prior reading listed the same nine. It is confirmed rather than assumed, and the
spelling "Warner Bros." carries its full stop as the page prints it.

**Retail Partners, exactly as named, all twenty four:**

Costco, Sam's Club, BJ's, PriceSmart, The Home Depot, Lowe's, Menards, Rona, Canadian Tire,
Kroger, Aldi, Walgreens, CVS, TJX, Target, Walmart, Dollar General, Five Below, Hobby Lobby,
Michaels, Macy's, Amazon, Wayfair, Cracker Barrel.

**What the page says about the company:**

> "At Nature's Mark, we deliver beautifully designed seasonal and home décor to leading retailers
> across the world."

> "our family-run team creates products that brighten everyday spaces"

**What the page does NOT say, and this matters:**

- **No factory location is named. China is not mentioned. No country of manufacture is mentioned.**
- No sourcing method, no OEM or ODM language, no bulk production statement.
- No minimum order quantity, no lead time, no price, no unit cost.
- No mention of Round1, of Main Event, or of any family entertainment centre.
- No mention of an anime or game licence.

### `https://natures-mark.com/` (the site root, read for context)

> "Nature's Mark is a trusted partner to top North American retailers, delivering joyful,
> high-quality seasonal and home décor"

> "Our portfolio spans indoor and outdoor seasonal décor, home décor, candles, housewares,
> health & beauty, and more."

The root page names the collaborations slightly differently from `/partners/`: it says they
collaborate with "Disney, Peanuts, Sanrio, Harry Potter, and Coca-Cola". **Harry Potter appears on
the root and not on `/partners/`.** Both readings are recorded; the register uses the `/partners/`
list, because that is the page that presents itself as the licence list, and it flags Harry Potter
as named on the root only.

The root also does not name a factory, a country of manufacture or a sourcing route.

---

## THE FRAMING RULE, WHICH IS THE WHOLE POINT

What is true and demonstrable:

- Nature's Mark publishes those nine licences and those twenty four retail partners.
- Jay has a connection to Nature's Mark.

What is **not** demonstrable and is therefore never claimed anywhere in the application:

- That Main Event has any agreement with any of those licensors.
- That Round1 has any agreement with any of those licensors.
- That Nature's Mark manufactures in China, or in any named country. **The page does not say so.**
- Any unit cost, minimum order quantity, lead time or royalty rate involving any of them.

So `/partners` frames Nature's Mark as **reachable manufacturing capability with a published licence
list**, and says so in one line on the page itself. Every commercial figure attached to it, meaning
every lead time, minimum order quantity, unit cost, unit count and dollar amount, is seeded
`illustrative` and carries the badge that says so. The licence names and the retail partner names
are the only `public` facts in this cohort, and they cite `https://natures-mark.com/partners/`.

---

## WHAT WAS SEEDED, AND ON WHAT BASIS

| Cohort | Count | Provenance | Basis |
| --- | --- | --- | --- |
| Licences in the register | 10 | 9 `public`, 1 `public` root only | `natures-mark.com/partners/` plus the root reading for Harry Potter |
| Retail partners quoted on the Nature's Mark card | 24 | `public` | Same page |
| Partners in the register | 12 | Names `illustrative` except Nature's Mark; every figure `illustrative` | Local supplier categories a venue genuinely needs: print, signage, prize and redemption stock, catering, apparel, freight |
| Promotional product lines | 20 | `illustrative` | Categories a bowling and arcade venue actually sells or gives away |
| Purchase orders | 20 | `illustrative` | |
| Invoices | 20 | `illustrative` | |
| Contracts | 7 | `illustrative` | Terms are the shape a real licence agreement takes: term dates, minimum guarantee, royalty rate, payment terms, notice period, renewal |
| Budget lines | 8 | `illustrative` | |

**No supplier other than Nature's Mark is a real named company.** The local suppliers carry
descriptive trade names rather than the names of real Brea businesses, because a real local printer
appearing in a work sample with an invented invoice against it would be a claim about that business.
`prospects.ts` is where real local organisations live, and they are on that file because they are
prospects rather than because they are owed money.

**No person is named anywhere.** Roles and titles only, which is the standing rule.

---

## THE THIRD LEDGER

`BookProvider` carries two ledgers and the rule is that they are never summed: booked revenue is
money, outbound activity is hours. Promotional product revenue is a **third** thing. It is money,
which makes it tempting to add to the book, and adding it would be wrong twice over: the book is
event revenue sold by a sales manager against a venue calendar, and promo revenue is merchandise
sell-through against a purchase order. A total combining them would answer no question anybody asks
and would inflate the one number a hiring manager actually reads.

So `/promo` keeps its own totals, states on screen that they are separate, and no selector in
`src/domain/selectors/promo.ts` imports from `BookProvider`.

---

## SOURCES, IN FULL

| What | URL | Read |
| --- | --- | --- |
| Round1 posting | `https://www.indeed.com/viewjob?jk=dbb0d1134b6065d9` (PDF print supplied by the owner) | 12 August 2026 |
| Nature's Mark partners | `https://natures-mark.com/partners/` | 13 August 2026 |
| Nature's Mark root | `https://natures-mark.com/` | 13 August 2026 |
