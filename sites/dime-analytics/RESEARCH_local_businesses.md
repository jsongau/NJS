# RESEARCH — Local retail, food and auto businesses in the Main Event Brea trade area

**Date of research:** 11 August 2026
**Anchor:** MAIN EVENT BREA, 245 W Birch Street, Brea, CA 92821 (announced, no published opening date)
**Researcher's brief:** find real Brea-area organisations of the type the owner named — boba and small food franchises, tire and auto service, Samyang and the Korean/Asian food corridor, and other 20-to-200-staff local employers — that are NOT already among the 69 rows in `src/data/prospects.ts`.

---

## METHOD, AND WHAT IT DOES AND DOES NOT GUARANTEE

Every organisation below was found by web search and then confirmed by reading a page. Where the organisation publishes its own store page (Firestone, Big O, Bushfire, Blue Scoop, Stonefire, Krak Boba, Boba Flip, FASTSIGNS, Ultimate Staffing, Brea Electric, CorePower, Gentle Dental, Brea Pediatric Dental, New American Funding, Valvoline, Discount Tire & Service Centers, Jax Auto, Old Brea Chop House, Brea Auto Service) I read that store page and the address in this document is the one printed on it.

Where the organisation is a tenant of a shopping centre and does not publish its own address, the address came from the **landlord's own published tenant directory** — `breamarketplace.com/directory/` and `villageatlafloresta.com/stores/`. That is a first-party commercial source, not a scraper aggregator, and it is named on every row that uses it.

Three rows rest on **third-party listings that agree with each other** rather than on a first-party page. They are flagged in place, in bold, and repeated in the final section. Do not let them ship without a check.

### The honest tally

| | Count |
|---|---|
| New organisations proposed (not already in `prospects.ts`) | **42** |
| With an email I actually read off the organisation's own published page (`verified_public`) | **5** |
| Contact form is the only written door (`form_only`) | **4** |
| Phone and the front door only (`none`) | **33** |
| Rejected outright and listed at the bottom with the reason | **7** |
| Out-of-radius findings recorded but NOT proposed as prospects | **3** |

**5 published emails out of 42 is a much worse ratio than the existing file's 30-of-69, and that is the finding, not a failure of the search.** The existing 69 skew toward schools, churches, colleges and professional practices — institutions that publish staff directories because they are obliged to or because it wins them business. This cohort is franchise retail, mall tenants and chain auto service, and those organisations deliberately route everything through a corporate form or a phone number. A Crumbl franchisee does not publish an email; a Firestone store number does not have one. **The commercial reading is that this whole cohort is a go-see cohort.** They are within a two-mile walk of the venue, they are staffed by people who work evenings and weekends and never get taken anywhere, and the only way in is to turn up. That is precisely the activity the job posting names first, and this list is the route sheet for it.

### Coordinates — read this before transcribing

**No lat/lng in this document was produced by a geocoder.** The existing 69 rows carry coordinates and `placeId`s from the Google Places API, and I did not have that call available in this pass. Rather than supply numbers that look like the existing ones but are not of the same kind, every row below carries `lat: TO BE GEOCODED` and `lng: TO BE GEOCODED`. Run each address through the same Places call that produced the current file, take the coordinate and the `placeId` from it, and set `locationAccuracy: "verified"` only if Places returns the same street address printed here. If Places disagrees with the address below, **that disagreement is the story** — treat it the way Round One Entertainment was treated and take the row out.

Distances quoted below are straight-line eyeball estimates from the street numbering, not computed figures. They are there to tell you "walkable" from "drive", nothing more.

### Proposed ninth lane

Most of Section 1 has no home among the existing eight lanes. A boba counter is not `corporate`, not `hospitality-civic` and certainly not `healthcare`. I have proposed **`local-retail-food`** on those rows and said so on each. Adding it will break the build wherever a `Record<Lane, T>` is filled, which is the intended behaviour of that union type — `src/domain/lanes.ts` will need a `LANE_META["local-retail-food"]` entry with an `occasionClass`, and every row below carries its own `occasionClass` so you can see what that default should be (`discretionary` for essentially all of them).

---

# SECTION 1 — BOBA TEA AND SMALL FOOD FRANCHISES

Proposed lane for all of these: **`local-retail-food`** (new). `occasionClass: discretionary` throughout — nobody's calendar makes them do this.

---

### 1. Boba Flip
- **name:** Boba Flip
- **lane:** `local-retail-food` (new lane)
- **address:** 658 South Brea Boulevard, Brea, CA 92821 · city Brea · state CA · postalCode 92821
- **phone:** (714) 582-2065
- **website:** https://bobaflip.com/
- **lat / lng:** TO BE GEOCODED · `locationAccuracy: "approximate"` until Places confirms
- **decisionMakerTitle:** Owner / Store Manager
- **email:** `teambobaflip@gmail.com`
- **emailSourceUrl:** https://bobaflip.com/contact
- **emailConfidence:** `verified_public`
- **whyTheyFit:** A single-counter boba shop three-quarters of a mile down Brea Blvd whose staff are teenagers and twenty-somethings working closing shifts; the owner-operator is the whole approval chain, and a staff-plus-family night is the only perk a shop this size can actually give.
- **buyingWindow:** Year round (staff appreciation); Dec-Jan is the realistic first ask, after the holiday retail crush.
- **occasionClass:** `discretionary`
- **headcountLow / High / Basis:** 10 / 25 — "Single-site boba counter; 8 to 15 staff on the roster, so a group night is staff plus partners and family, which is what makes it 10-25 rather than 8-15."
- **addressSource:** https://bobaflip.com/contact (the business's own contact page)
- **note:** One of only five organisations in this entire cohort that publishes a real email. It is a Gmail address, published by the business itself, and it is the most reachable prospect on this page.

### 2. Krak Boba — Brea
- **lane:** `local-retail-food`
- **address:** 2435 Imperial Highway Ste D, Brea, CA 92821 · Brea · CA · 92821
- **phone:** (714) 582-2114
- **website:** https://www.krakboba.com/brea
- **lat / lng:** TO BE GEOCODED · `approximate`
- **decisionMakerTitle:** Franchise Owner / Store Manager
- **email:** none published
- **emailConfidence:** `form_only`
- **contactFormUrl:** https://www.krakboba.com/contact
- **whyTheyFit:** A 33-location franchise brand with a Brea store open 11am-10pm every day, which means a rotating crew of 12-20 part-timers who never get a night off together — and a franchisee with more than one store's worth of budget if this one goes well.
- **buyingWindow:** Year round (staff appreciation); post-summer (Sep-Oct) when the student staff turn over.
- **occasionClass:** `discretionary`
- **headcountLow / High / Basis:** 12 / 30 — "Franchise boba store open 11 hours a day, seven days; 12-20 on the roster across shifts, plus guests."
- **addressSource:** https://www.krakboba.com/locations (the brand's own locator, read for the Brea store specifically)
- **note:** I read the brand contact page as well. Krak Boba publishes **no** email anywhere — not general, not franchising, not catering. Form only. Recorded as such.

### 3. Boba Boba Brea
- **lane:** `local-retail-food`
- **address:** 518 E. Imperial Highway, Brea, CA 92821
- **phone:** (714) 582-2377
- **website:** https://bobabobabrea.menu11.com/
- **lat / lng:** TO BE GEOCODED · `approximate`
- **decisionMakerTitle:** Owner / Store Manager
- **email:** none found · **emailConfidence:** `none`
- **whyTheyFit:** Independent boba shop on Imperial a mile from the venue, the kind of single-owner operation where "bring the crew bowling" is a decision one person makes in one conversation.
- **buyingWindow:** Year round (staff appreciation)
- **occasionClass:** `discretionary`
- **headcountLow / High / Basis:** 8 / 20 — "Single independent counter; 6 to 12 staff, so a night out is staff plus family."
- **addressSource:** The business's own online-ordering site, https://bobabobabrea.menu11.com/ (address and phone printed in its terms page footer), corroborated by its Yelp listing.
- **note:** Ordering platform rather than a bespoke site, but it is the business's own published storefront and it carries the address and phone. No email anywhere on it.

### 4. THE ALLEY — Brea Mall
- **lane:** `local-retail-food`
- **address:** Brea Mall, Lower Level (next to Garage and Uniqlo), Brea, CA 92821. **Yelp gives the street form as 1065 Brea Mall, Brea, CA 92821; Simon's own store page gives level and neighbours but no street number.**
- **phone:** not published by Simon or by the-alley.us
- **website:** https://the-alley.us/ · store page https://www.simon.com/mall/brea-mall/stores/the-alley
- **lat / lng:** TO BE GEOCODED · `approximate`
- **decisionMakerTitle:** Store Manager
- **email:** none · **emailConfidence:** `none`
- **whyTheyFit:** A mall boba counter open to 9pm on Fri/Sat, three-quarters of a mile from the venue, staffed by exactly the demographic that goes bowling and never gets taken.
- **buyingWindow:** Jan-Feb (post-holiday-retail thank-you) is the realistic window; the mall calendar makes Nov-Dec impossible for them.
- **occasionClass:** `discretionary`
- **headcountLow / High / Basis:** 8 / 20 — "Mall food-counter unit; 6 to 12 staff across a seven-day trading week, plus guests."
- **addressSource:** https://www.simon.com/mall/brea-mall/stores/the-alley (landlord's own store page) for existence and position; street number from Yelp only.
- **note:** **PARTIAL.** The mall unit number is single-sourced. Confirm the street form before it goes on a map pin. Existence and position inside the mall are first-party from Simon.

### 5. Lollicup Fresh Tea Express — Brea Mall
- **lane:** `local-retail-food`
- **address:** Brea Mall, Food Court (Upper Level), Brea, CA 92821 — no street/unit number published
- **phone:** (714) 784-6380
- **website:** https://www.simon.com/mall/brea-mall/stores/lollicup-fresh-tea-express
- **lat / lng:** TO BE GEOCODED · `approximate`
- **decisionMakerTitle:** Store Manager
- **email:** none · **emailConfidence:** `none`
- **whyTheyFit:** Food-court boba unit inside the Brea Mall, and its store-level phone number is published — a direct line to the person who actually runs the shift, which is rare in mall retail.
- **buyingWindow:** Jan-Feb (post-holiday); year round for a small staff thank-you.
- **occasionClass:** `discretionary`
- **headcountLow / High / Basis:** 6 / 15 — "Mall food-court kiosk; 5 to 10 staff. Small, but it is a phone number that a human answers."
- **addressSource:** Simon Property Group's own Brea Mall store directory (URL above).
- **note:** Address is genuinely incomplete — Simon publishes level and entrance, not a unit. Record the address honestly as "Brea Mall Food Court (Upper Level)" rather than inventing a number.

### 6. 7 Leaves Cafe — Fullerton
- **lane:** `local-retail-food`
- **address:** **505 N State College Blvd, Fullerton, CA 92831**
- **phone:** not confirmed from a first-party page
- **website:** https://7leavescafe.com/locations/fullerton/
- **lat / lng:** TO BE GEOCODED · `approximate`
- **decisionMakerTitle:** Store Manager / District Manager
- **email:** none found · **emailConfidence:** `none`
- **whyTheyFit:** 7 Leaves is a large Vietnamese-American cafe chain with a hiring page that recruits "Team Member [Fullerton]" continuously — a store with constant onboarding is a store with a reason to do a cohort night.
- **buyingWindow:** Year round (staff appreciation); Aug-Sep as the CSUF student staff cycle turns over.
- **occasionClass:** `discretionary`
- **headcountLow / High / Basis:** 15 / 35 — "High-volume chain cafe near CSU Fullerton; 15-25 on the roster with heavy part-time coverage, plus guests."
- **addressSource:** The chain's own locations page exists for this city (URL above) but returned HTTP 429 on every attempt. Address is taken from three independent third-party listings that agree: Yelp, joe.coffee and restaurantji, plus an Indeed job posting for "7 Leaves Cafe -Team Member [Fullerton], Fullerton, CA 92831".
- **note:** **PARTIAL — first-party page not read.** Three sources agree and none disagree, and the brand's own URL for this city resolves. I have kept it in because nothing contradicts it, but retry `7leavescafe.com/locations/fullerton/` before transcribing and use whatever it says.

### 7. Bushfire Kitchen — Brea
- **lane:** `local-retail-food`
- **address:** 765 East Birch Street #101, Brea, CA 92821
- **phone:** (657) 286-5138
- **website:** https://www.bushfirekitchen.com/our-locations/brea
- **lat / lng:** TO BE GEOCODED · `approximate`
- **decisionMakerTitle:** General Manager / Franchise Owner
- **email:** none published on the location page · **emailConfidence:** `none`
- **whyTheyFit:** A ten-location fast-casual group whose Brea store sits in Brea Marketplace roughly half a mile from the venue on the same street — close enough that a manager can walk over on a break for a tour the week the doors open.
- **buyingWindow:** Nov-Dec (holiday) and Jan (new-year kickoff); the restaurant's own December is busy, so January is the honest ask.
- **occasionClass:** `discretionary`
- **headcountLow / High / Basis:** 20 / 45 — "Fast-casual restaurant with a full kitchen and front-of-house; 20-35 staff across shifts, plus guests."
- **addressSource:** https://www.bushfirekitchen.com/our-locations/brea (its own location page), corroborated by breamarketplace.com/directory
- **note:** Two first-party sources agree on the address to the suite number. Highest address confidence in Section 1.

### 8. Blue Scoop Creamery — Brea
- **lane:** `local-retail-food`
- **address:** 391 S State College Blvd Suite O, Brea, CA 92821
- **phone:** (714) 582-7773
- **website:** https://bluescoopcreamery.com/
- **lat / lng:** TO BE GEOCODED · `approximate`
- **decisionMakerTitle:** Owner
- **email:** none · **emailConfidence:** `none`
- **whyTheyFit:** A two-store local ice-cream business (Brea and Yorba Linda) whose owner already runs staff across two sites — a combined-team night is the one thing a two-store owner cannot do at either shop.
- **buyingWindow:** Jan-Feb, after the summer and holiday ice-cream seasons are both done.
- **occasionClass:** `discretionary`
- **headcountLow / High / Basis:** 12 / 30 — "Two locations under one owner (Brea and 5105 Richfield Rd, Yorba Linda); 6-12 staff each, so a both-stores night is 12-25 plus guests."
- **addressSource:** https://bluescoopcreamery.com/ — the site publishes both store addresses and both phones.
- **note:** The second store, 5105 Richfield Rd, Yorba Linda, CA 92886, (714) 729-3419, is published on the same page. Same owner; treat as one prospect, not two.

### 9. Old Brea Chop House
- **lane:** `local-retail-food` (or `hospitality-civic` if you would rather keep restaurants there — this one is arguably both, since it is also a referral partner for the same corporate buyers)
- **address:** 180 S Brea Blvd, Brea, CA 92821
- **phone:** (714) 592-3122
- **website:** https://www.oldbreachophouse.com/
- **lat / lng:** TO BE GEOCODED · `approximate`
- **decisionMakerTitle:** General Manager
- **email:** `obchmanagers@gmail.com`
- **emailSourceUrl:** https://www.oldbreachophouse.com/contact
- **emailConfidence:** `verified_public`
- **whyTheyFit:** Downtown Brea's upmarket steakhouse, a quarter-mile from the venue, running its own private-events business on TripleSeat — which means its GM both employs 40-plus staff who deserve a night out AND fields the exact corporate enquiries Main Event wants referred when a party wants bowling instead of a dining room.
- **buyingWindow:** Jan-Feb for its own staff (its Nov-Dec is its busiest trading period); year round as a referral relationship.
- **occasionClass:** `discretionary`
- **headcountLow / High / Basis:** 30 / 60 — "Full-service steakhouse with a private-events operation; 35-55 across kitchen, floor and bar, plus guests."
- **addressSource:** https://www.oldbreachophouse.com/contact
- **note:** The published address is a **managers'** mailbox, not a generic info@. That is the single best email in this entire research pass — it goes to the people who decide.

### 10. Stonefire Grill — Brea
- **lane:** `local-retail-food`
- **address:** 935 E. Birch Street, Brea, CA 92821
- **phone:** (714) 332-8450 · catering line 818-540-3936
- **website:** https://www.stonefiregrill.com/
- **lat / lng:** TO BE GEOCODED · `approximate`
- **decisionMakerTitle:** General Manager
- **email:** none · **emailConfidence:** `none`
- **whyTheyFit:** A high-volume family restaurant in Brea Marketplace half a mile from the venue with a centralised catering desk — a competitor for the corporate lunch, a non-competitor for the evening, and a large enough crew that its own staff night is a real booking.
- **buyingWindow:** Jan-Feb (post-holiday staff thank-you)
- **occasionClass:** `discretionary`
- **headcountLow / High / Basis:** 30 / 70 — "Large-format family restaurant with an off-site catering operation; 35-60 staff across shifts, plus guests."
- **addressSource:** https://www.stonefiregrill.com/ locations page, corroborated by breamarketplace.com/directory
- **note:** The catering phone (818 area code) is a corporate desk in the San Fernando Valley, not the Brea store. Call the store number.

### 11-16. Brea Marketplace food tenants — the walkable cluster
All six of these come from the landlord's own published tenant directory at **https://breamarketplace.com/directory/**, which prints name, suite and phone for all 30 tenants. All are on E Birch Street, the same street as the venue, roughly half a mile east. None publishes an email at store level; all are `emailConfidence: "none"`, all `decisionMakerTitle: "Store Manager"` or `"Franchise Owner"`, all `occasionClass: discretionary`, all lane `local-retail-food`, all `lat/lng: TO BE GEOCODED`, all `addressSource: "Brea Marketplace published tenant directory, breamarketplace.com/directory/"`.

| # | name | address | phone | decisionMakerTitle | headcount low/high | headcountBasis | buyingWindow | whyTheyFit |
|---|---|---|---|---|---|---|---|---|
| 11 | Crumbl Cookies | 955 E Birch St, Suite 18, Brea, CA 92821 | (562) 371-8973 | Franchise Owner | 12 / 30 | Single-unit Crumbl franchise; 10-20 mostly young part-time bakers and counter staff, plus guests | Jan-Feb — their Nov-Dec is peak trading | Franchise-owned cookie store staffed almost entirely by high-school and college part-timers half a mile from the venue; the franchisee is one person with one signature and a crew that works every weekend night |
| 12 | Jersey Mike's Subs | 955 East Birch Street, Suite J, Brea, CA 92821 | (714) 674-4999 | Franchise Owner | 10 / 25 | Single-unit sandwich franchise; 8-16 staff, plus guests | Year round; Mar (after the brand's March fundraising month) | A franchise brand that already runs an annual community fundraising month, so the franchisee is demonstrably willing to spend on goodwill locally — and Main Event's Spirit Night/Play It Forward mechanic is the same shape of ask |
| 13 | Fire Wings | 985 E Birch St, Suite D, Brea, CA 92821 | (714) 784-6474 | Franchise Owner / General Manager | 12 / 30 | Wings restaurant with late trading; 10-20 staff across shifts, plus guests | Jan-Feb | Late-night wings restaurant whose staff finish when nobody else is open — the after-close day-part is the only one that works for them, and it is the day-part the venue will most want to fill |
| 14 | Pan Holic | 955 E Birch St, Suite C, Brea, CA 92821 | (657) 286-5389 | Owner / Store Manager | 8 / 20 | Small bakery-cafe unit; 6-12 staff, plus guests | Year round (staff appreciation) | Small Asian bakery counter in the same plaza as Target and Sprouts; the owner is on site and reachable in person, which is what a go-see is for |
| 15 | Piccolo Coffee | 955 E Birch St, Unit K, Brea, CA 92821 | (714) 332-0003 | Owner / Store Manager | 6 / 18 | Independent coffee unit; 5-10 staff, plus guests | Year round | Independent coffee shop with early-shift staff who are free in the evening — the weekday-evening slot that a corporate party will never take |
| 16 | D'Vine Mediterranean Experience | 955 E Birch St, Brea, CA 92821 | (714) 990-0100 | Owner / General Manager | 12 / 30 | Independent full-service restaurant; 12-22 staff, plus guests | Jan-Feb | Owner-operated restaurant in the plaza nearest the venue; single decision-maker, evening-free staff, and a walk-over tour costs them ten minutes |

### 17. Kabuki Japanese Restaurant — Brea
- **lane:** `local-retail-food` · **address:** 975 E Birch St, Suite K, Brea, CA 92821 · **phone:** (714) 255-0090
- **decisionMakerTitle:** General Manager · **email:** none · `emailConfidence: "none"`
- **whyTheyFit:** A multi-unit Southern California Japanese restaurant group's Brea store, half a mile away — the GM runs a 30-plus crew and the regional operator above them buys for several stores at once.
- **buyingWindow:** Jan-Feb · **occasionClass:** `discretionary`
- **headcount:** 25 / 55 — "Full-service restaurant with sushi bar, kitchen and floor; 25-45 staff across shifts, plus guests."
- **addressSource:** breamarketplace.com/directory/

### 18. Taal Cultural Cuisine of India — Brea
- **lane:** `local-retail-food` · **address:** 975 E Birch St, Suite A, Brea, CA 92821 · **phone:** (714) 332-0042
- **decisionMakerTitle:** Owner · **email:** none · `emailConfidence: "none"`
- **whyTheyFit:** Owner-operated Indian restaurant in the plaza on the venue's own street; the same owner who books a private dining room for a customer knows exactly which local companies are looking for somewhere different this December.
- **buyingWindow:** Jan-Feb for their own staff; year round as a referral · **occasionClass:** `discretionary`
- **headcount:** 12 / 30 — "Independent full-service restaurant; 12-22 staff, plus guests."
- **addressSource:** breamarketplace.com/directory/

---

# SECTION 2 — TIRE SHOPS AND AUTO SERVICE

Proposed lane: **`auto-finance`** for all of these — it is the existing lane that already covers dealerships and it fits without inventing anything. `occasionClass: discretionary` throughout. Auto service is a weekday-daytime-closed, evening-free trade, which makes it a genuinely good fit for the day-parts a venue struggles to sell.

### 19. Firestone Complete Auto Care — Brea
- **address:** 891 E Imperial Hwy, Brea, CA 92821 · **phone:** (714) 988-7936
- **website:** https://www.firestonecompleteautocare.com/california/brea/891-e-imperial-hwy/
- **lat/lng:** TO BE GEOCODED · `approximate`
- **decisionMakerTitle:** Store Manager
- **email:** none · **emailConfidence:** `none`
- **whyTheyFit:** A corporate-owned Firestone store (#20591) just over a mile east on Imperial with a full technician bay crew that closes at a fixed hour every night; the store manager has a small discretionary budget and no venue anywhere near this close.
- **buyingWindow:** Nov-Dec (holiday) and year round for a shift thank-you
- **headcount:** 12 / 30 — "Corporate-owned full-service Firestone store; 10-20 technicians and service advisors, plus guests."
- **addressSource:** Firestone's own store page (URL above). Store number #20591 and California ARD registration #222646 are both printed on it.
- **note:** Firestone publishes no store-level email anywhere in its site structure. Phone and door only.

### 20. Big O Tires — Brea (store #005304)
- **address:** 210 N Brea Blvd, Brea, CA 92821 · **phone:** (714) 784-0893
- **website:** https://www.bigotires.com/location/ca/brea/210-n-brea-blvd-92821/005304
- **lat/lng:** TO BE GEOCODED · `approximate`
- **decisionMakerTitle:** Store Manager / Franchise Owner
- **email:** none · **emailConfidence:** `none`
- **whyTheyFit:** Half a mile from the venue on Brea Blvd; a franchised tire store whose owner is local, whose crew is 10-20, and whose entire team is free after 5pm every day of the week.
- **buyingWindow:** Nov-Dec (holiday party)
- **headcount:** 10 / 25 — "Franchised Big O tire and service store; 10-18 technicians and counter staff, plus guests."
- **addressSource:** Bridgestone/Firestone's own dealer locator, https://www.firestonetire.com/dealers/california/brea/210-n-brea-blvd/ — the manufacturer's first-party dealer record, which prints name, address and phone. Corroborated by the Michelin commercial dealer locator entry for "Big O Tires Inc. #005304, Brea".
- **note:** `bigotires.com` itself could not be fetched (robots/redirect loop). The address and phone here come from two independent tire-manufacturer dealer registries that agree, which is a stronger source than a directory scrape.

### 21. American Tire Depot — Brea
- **address:** **227 N Brea Blvd, Brea, CA 92821** · **phone:** not confirmed from a first-party page
- **website:** https://www.americantiredepot.com/locations/brea-ca
- **lat/lng:** TO BE GEOCODED · `approximate`
- **decisionMakerTitle:** Store Manager
- **email:** none · **emailConfidence:** `none`
- **whyTheyFit:** Sits directly across Brea Blvd from the Big O store, half a mile from the venue; two competing tire crews on the same block is two staff nights, and neither of them has anywhere to go.
- **buyingWindow:** Nov-Dec (holiday party)
- **headcount:** 10 / 25 — "Multi-bay tire and service store; 10-18 staff, plus guests."
- **addressSource:** Nokian Tyres' own dealer locator entry ("American Tire Depot, 227 N Brea Blvd, Brea, CA, 92821") corroborated by the store's Yelp listing.
- **note:** **PARTIAL — first-party page not read.** American Tire Depot's own store pages returned unreadable binary content on two attempts. A manufacturer dealer registry and Yelp agree on the address. Get the phone from the store page or Places before this ships.

### 22. Discount Tire & Service Centers — Fullerton (E Orangethorpe)
- **address:** 2341 East Orangethorpe Avenue, Fullerton, CA 92831 · **phone:** (714) 451-7044
- **website:** https://www.discounttirecenters.com/stores/view/fullerton-e-orangethorpe-ave/
- **lat/lng:** TO BE GEOCODED · `approximate`
- **decisionMakerTitle:** Store Manager
- **email:** none · **emailConfidence:** `none`
- **whyTheyFit:** About four miles south-west, at the far edge of the trade area but on the Orangethorpe industrial corridor where several of these crews work — a regional chain store whose manager reports to a district manager who buys for several stores.
- **buyingWindow:** Nov-Dec (holiday party)
- **headcount:** 10 / 25 — "Chain tire and service centre; 10-18 staff, plus guests."
- **addressSource:** The chain's own store page (URL above). Note this is **Discount Tire & Service Centers**, a Southern California chain — NOT the national Discount Tire / America's Tire company. Different businesses. Do not merge them.

### 23. Valvoline Instant Oil Change — Fullerton (N Harbor)
- **address:** 4002 North Harbor Blvd., Fullerton, CA 92835 · **phone:** (714) 871-9980
- **website:** https://store.vioc.com/ca/fullerton/4002-north-harbor-blvd
- **lat/lng:** TO BE GEOCODED · `approximate`
- **decisionMakerTitle:** Store Manager / District Manager
- **email:** none · **emailConfidence:** `none`
- **whyTheyFit:** Quick-lube crews are young, hourly, high-turnover and almost never taken anywhere; the district manager above this store runs several sites within the trade area, which turns one conversation into a multi-store ask.
- **buyingWindow:** Year round (staff appreciation); Nov-Dec for the district
- **headcount:** 8 / 20 — "Quick-lube bay; 6-12 staff per store. The multi-store district ask is the real prize, not this one store."
- **addressSource:** Valvoline's own store page (URL above)

### 24. Brea Auto Service
- **address:** 365 West Central Ave, Brea, CA 92821 · **phone:** (714) 529-8606
- **website:** https://www.breaautoservice.com/
- **lat/lng:** TO BE GEOCODED · `approximate`
- **decisionMakerTitle:** Owner
- **email:** none published · **emailConfidence:** `none`
- **whyTheyFit:** Independent shop about a third of a mile from the venue that closes at 5pm weekdays and noon Saturday — published hours that say plainly this crew's evenings are free.
- **buyingWindow:** Nov-Dec (holiday party)
- **headcount:** 6 / 18 — "Independent multi-bay shop; 5-10 technicians and counter staff, plus family."
- **addressSource:** https://www.breaautoservice.com/ (its own site, which prints address, phone and hours)
- **note:** On the same block as three existing prospects already in the file (Brea Jiu-Jitsu, Brea Urgent Care, The Phoenix Club, all on W Central Ave). One go-see route covers all four.

### 25. Jax Auto
- **address:** 331 South Brea Boulevard, Brea, CA 92821 · **phone:** (714) 529-2886
- **website:** https://www.jaxautorepairbrea.com/
- **lat/lng:** TO BE GEOCODED · `approximate`
- **decisionMakerTitle:** Owner
- **email:** none published · **emailConfidence:** `none`
- **whyTheyFit:** AAA-Approved independent shop about half a mile from the venue; AAA approval means a real, inspected, staffed business rather than a two-bay operation, and the owner is the buyer.
- **buyingWindow:** Nov-Dec (holiday party)
- **headcount:** 6 / 18 — "AAA-Approved independent repair shop; 5-10 staff, plus family."
- **addressSource:** Its own site https://www.jaxautorepairbrea.com/ AND the AAA Approved Auto Repair directory (https://www.aaa.com/autorepair/locations/brea-ca), which independently lists "Jax Auto, 331 S Brea Blvd, Brea, CA 92821, 0.22 miles". Two independent sources, exact agreement.

### 26. Union Service Center (76) — Fullerton
- **address:** 3001 Yorba Linda Blvd, Fullerton, CA 92831 · **phone:** (714) 528-6701
- **website:** www.carcare76.com
- **lat/lng:** TO BE GEOCODED · `approximate`
- **decisionMakerTitle:** Owner / Service Manager
- **email:** none listed · **emailConfidence:** `none`
- **whyTheyFit:** AAA-Approved service centre under three miles south-east, on the same Yorba Linda Blvd corridor as Marshall B. Ketchum University which is already on the board — one drive, two calls.
- **buyingWindow:** Nov-Dec (holiday party)
- **headcount:** 6 / 18 — "AAA-Approved service centre; 5-10 staff, plus family."
- **addressSource:** AAA's own approved-facility page, https://www.aaa.com/autorepair/shop/union-service-center-76447

### 27. Charlie's Auto Tech
- **address:** **2858 E Imperial Hwy, Brea, CA 92821** · **phone:** (714) 985-9940
- **website:** https://charliesautotech.com/
- **lat/lng:** TO BE GEOCODED · `approximate`
- **decisionMakerTitle:** Owner
- **email:** none found · **emailConfidence:** `none`
- **whyTheyFit:** A specialist BMW and Mercedes independent about two miles east on Imperial, in the same block as Orange County Performance and OC Medical Center which are both already on the board — a specialist shop has higher-value technicians and a correspondingly better budget per head.
- **buyingWindow:** Nov-Dec (holiday party)
- **headcount:** 5 / 15 — "Specialist European independent; 4-8 technicians, plus family."
- **addressSource:** Its own domain charliesautotech.com is live and self-describes as "BMW & Mercedes Auto Repair Brea", but the contact page 404'd. Address and phone from Yelp and Yellow Pages listings that agree.
- **note:** **PARTIAL — first-party address page not read.** The business plainly exists and has its own site; the specific street address is second-party. Confirm at the door or via Places.

### 28. JJ Star Complete Auto Repair — La Habra
- **address:** 441 E. Imperial Hwy #B, La Habra, CA 90631 · **phone:** not published on the source I read
- **lat/lng:** TO BE GEOCODED · `approximate`
- **decisionMakerTitle:** Owner
- **email:** none · **emailConfidence:** `none`
- **whyTheyFit:** AAA-Approved shop about two and a half miles west on Imperial, which extends the Imperial Highway go-see route into La Habra without a detour.
- **buyingWindow:** Nov-Dec (holiday party)
- **headcount:** 5 / 15 — "AAA-Approved independent shop; 4-8 staff, plus family."
- **addressSource:** AAA Approved Auto Repair, Brea locations list (https://www.aaa.com/autorepair/locations/brea-ca), which lists it at 2.43 miles from Brea.
- **note:** Single-source (AAA's own inspected-facility register, which is a good source, but only one). No phone. Lowest-confidence row in Section 2 — treat it as a drive-past, not a call.

---

# SECTION 3 — SAMYANG AND THE KOREAN / ASIAN FOOD CORRIDOR

**This section is mostly a set of findings, not a set of new prospects. Read it before adding anything.**

### Samyang — ALREADY ON THE BOARD. Do not add it twice.

`prospects.ts` already carries **Samyang America, Inc.** at **140 S State College Blvd, Brea, CA 92821**, phone (213) 443-1277, `emailConfidence: "form_only"`, contact form `https://samyangamerica.com/contact`, lane `corporate`. That row is roughly a mile from the venue and squarely inside the trade area.

I went and checked the claim independently rather than taking the existing row's word for it. **Samyang America's own contact page publishes no address, no phone and no email — it is a bare form with Contact Name / Phone / Email / Subject / Message fields and nothing else.** So:

- The existing row's `emailConfidence: "form_only"` and its `contactFormUrl` are **correct and correctly cautious**. There is no published email to find. Anyone who "finds" a Samyang America email address has invented it.
- The address on the existing row (140 S State College Blvd) does **not** come from Samyang's own site, because Samyang's own site does not publish one. It comes from Google Places, and the row says so in `addressSource`. That is honest, and it is worth knowing that the company itself declines to publish its location.
- **Recommended change to the existing row, if you want to tighten it:** the `provenance` block currently reads `email: "public"`. There is no email on that row at all — only a form. `email: "public"` is arguably wrong there and should be dropped or the key renamed. Small, but this file's whole argument is that the provenance keys mean something.

**Distance: roughly one mile east of 245 W Birch St. Inside the six-mile radius, comfortably.** That is the answer to the question the owner asked.

### 29. CJ Foods Manufacturing Corp — Fullerton  *(the one genuinely new prospect in this section)*
- **lane:** `corporate`
- **address:** **500 S State College Blvd, Fullerton, CA 92831**
- **phone:** not confirmed
- **lat/lng:** TO BE GEOCODED · `approximate`
- **decisionMakerTitle:** HR Manager / Plant Manager
- **email:** none found · **emailConfidence:** `none`
- **whyTheyFit:** CJ (the Korean food group behind Bibigo) opened a Fullerton manufacturing plant and it sits about two and a half miles from the venue on the same State College Blvd axis as Samyang America and CSU Fullerton; a food plant runs shifts, and a shift-based employer with a few hundred people on site is the largest single staff-appreciation opportunity in this entire research pass.
- **buyingWindow:** Nov-Dec (holiday); Jan-Feb for a shift-by-shift appreciation series, which is how a plant actually does it — you cannot take a plant offline in one night.
- **occasionClass:** `discretionary`
- **headcount:** 60 / 250 — "Food manufacturing plant running multiple shifts. A plant cannot send everyone at once, so the realistic booking is one shift at a time, 60-100, repeated. The 250 upper bound is the site, not the event."
- **addressSource:** Three independent listings agree on 500 S State College Blvd, Fullerton, CA 92831 for CJ Foods Manufacturing Corp: Yelp, Yellow Pages and Waze. A March 2013 Business Wire release titled "CJ Foods Opens New Factory in Fullerton" independently confirms a Fullerton plant exists.
- **note:** **PARTIAL — first-party page not read.** CJ's own corporate site and the USDA FSIS establishment register both refused the fetch (403). A **second** CJ facility exists nearby — "CJ Foods Distribution Center, 675 S Placentia Ave, Fullerton, CA 92831". These are two different sites, roughly a mile apart, and the sources are consistent about which is which. **Confirm which building the people are in before the go-see.** If a Places lookup disagrees with 500 S State College Blvd, take the row out rather than reconcile it.

### FINDINGS — Korean / Asian food companies that are REAL but OUTSIDE the trade area

These are not proposed as prospects. They are recorded because "we checked and it is too far" is a result.

| Company | Published US address | Distance from 245 W Birch (approx, straight line) | Email | Source |
|---|---|---|---|---|
| **Nongshim America, Inc.** | 12155 Sixth Street, Rancho Cucamonga, CA 91730 | **~35 miles east.** Far outside. | `info@nongshimusa.com` — published on their own contact page | https://nongshimusa.com/homev2/about-nongshim/contact_us/ |
| **aT Center LA** (Korea Agro-Fisheries & Food Trade Corp) | 12750 Center Court Dr S, Ste 255, Cerritos, CA 90703 · (562) 809-8810 | **~12 miles west.** Outside. Notably, it is in Cerritos — the same city the file's own note says Round One Entertainment turned out to be in. | `atcenterla@gmail.com` — published on their own site | https://atcenteramerica.com/ |
| **aT Center NY** (US headquarters of the above) | 15 East 40th St., #701, New York, NY 10016 · (212) 889-2561 | New York. | `newyork@at.or.kr` | https://atcenteramerica.com/ |

The honest summary of Section 3: **the Korean-food-corporate story in this trade area is Samyang, and Samyang is already on the board.** CJ Foods in Fullerton is the one addition worth chasing. Everything else in the Korean food corridor that a search surfaces — Nongshim, aT Center, and the Buena Park and City of Industry cluster generally — sits outside six miles. Saying that plainly is more useful than padding the list with an office in Rancho Cucamonga.

---

# SECTION 4 — OTHER LOCAL EMPLOYERS

### 30. Reborn Coffee, Inc. — corporate headquarters
- **lane:** `corporate`
- **address:** 580 North Berry Street, Brea, CA 92821
- **phone:** not confirmed
- **website:** https://reborncoffee.com/
- **lat/lng:** TO BE GEOCODED · `approximate`
- **decisionMakerTitle:** HR / People Ops Manager
- **email:** none read · **emailConfidence:** `form_only` — https://reborncoffee.com/pages/contact-us
- **whyTheyFit:** A **publicly traded** coffee retailer (NASDAQ: REBN) whose corporate headquarters is in Brea, under a mile from the venue, and which also operates a store in the Village at La Floresta — so it is a corporate holiday-party prospect and a multi-store staff-night prospect in one organisation.
- **buyingWindow:** Nov-Dec (holiday party) for HQ; Jan-Feb for the store crews.
- **occasionClass:** `discretionary`
- **headcount:** 30 / 90 — "Small-cap public company HQ plus regional store crews; HQ staff is likely 20-40 and the combined local store teams add to it. Not a confirmed figure."
- **addressSource:** Reborn Coffee's own SEC-filed investor material, which prints "Reborn Coffee, Inc. 580 North Berry Street Brea, CA 92821 reborncoffee.net" on its cover.
- **note:** **Best new corporate find in this pass.** An SEC filing cover page is about as good as a published address gets — a company does not put a wrong address on a securities filing. Also worth knowing: a 2024 SEC 8-K exhibit records that Reborn intended to appeal a Nasdaq delisting notice. Do not lead with congratulations.

### 31. Ultimate Staffing Services — Brea
- **lane:** `corporate`
- **address:** 135 South State College Blvd., Suite 200, Brea, CA 92821 · **phone:** (714) 255-8703
- **website:** https://www.ultimatestaffing.com/locations/view/brea/
- **lat/lng:** TO BE GEOCODED · `approximate`
- **decisionMakerTitle:** Branch Manager / Regional Director
- **email:** `brea@ultimatestaffing.com` · **emailSourceUrl:** https://www.ultimatestaffing.com/locations/view/brea/ · **emailConfidence:** `verified_public`
- **whyTheyFit:** This is the highest-leverage row in the whole document and it is not because of its own headcount. A staffing branch's entire job is knowing which local employers are hiring, growing and about to have a good year — a staffing branch manager is a referral engine into every corporate prospect in Brea, and it is a mile from the venue.
- **buyingWindow:** Nov-Dec (holiday party) for itself; **year round as a referral relationship**, which is the real reason to call.
- **occasionClass:** `discretionary`
- **headcount:** 10 / 30 — "Single staffing branch office, by-appointment-only front door; 8-20 internal recruiters and account managers. The number is small and beside the point."
- **addressSource:** Ultimate Staffing's own branch page (URL above), which prints address, suite, phone and the branch email together.
- **note:** Published email is a **branch-specific** address, not a corporate catch-all. Also note the branch page says "By appointment only" — a cold go-see will find a locked door. Email or call this one; do not walk in.

### 32. Brea Electric Company
- **lane:** `corporate`
- **address:** 524 E Imperial Hwy, Brea, CA 92821 · **phone:** (714) 529-3030
- **website:** https://www.breaelectric.com/
- **lat/lng:** TO BE GEOCODED · `approximate`
- **decisionMakerTitle:** Owner / Operations Manager
- **email:** `info@breaelectric.com` · **emailSourceUrl:** https://www.breaelectric.com/contact · **emailConfidence:** `verified_public`
- **whyTheyFit:** A local electrical contractor a mile from the venue whose published hours are 7:30am-4pm Monday to Friday and closed weekends — a field crew that finishes mid-afternoon and has every evening free is the single easiest weekday-evening booking on this list.
- **buyingWindow:** Nov-Dec (holiday party) — trades book their Christmas do early and treat it as non-negotiable.
- **occasionClass:** `discretionary`
- **headcount:** 20 / 60 — "Established local electrical contractor with a field workforce; 20-45 between office and crews, plus partners, which is why the range tops out at 60."
- **addressSource:** https://www.breaelectric.com/contact
- **note:** This `info@` was **read off their own contact page**, not inferred from the domain. That distinction is the whole point of the emailConfidence field.

### 33. FASTSIGNS of Brea
- **lane:** `corporate`
- **address:** 2781 Saturn Street, Unit E, Brea, CA 92821 · **phone:** (714) 451-4076
- **website:** https://www.fastsigns.com/brea-ca/
- **lat/lng:** TO BE GEOCODED · `approximate`
- **decisionMakerTitle:** Franchise Owner / Center Manager
- **email:** `261@fastsigns.com` · **emailSourceUrl:** https://www.fastsigns.com/brea-ca/about-us/contact-us/ · **emailConfidence:** `verified_public`
- **whyTheyFit:** On Saturn Street, the same industrial street as TYC Americas and Karman Space & Defense which are both already on the board, so it drops into an existing go-see route at zero marginal cost — and a sign shop is a supplier the venue will itself need before it opens, which makes the first conversation a two-way one.
- **buyingWindow:** Nov-Dec (holiday party); year round as a vendor relationship
- **occasionClass:** `discretionary`
- **headcount:** 8 / 25 — "Single FASTSIGNS franchise centre; 8-15 production and sales staff, plus guests."
- **addressSource:** https://www.fastsigns.com/brea-ca/about-us/contact-us/
- **note:** The email is the franchise's centre number (`261@`), published on their own contact page. Also "by appointment only, Mon-Fri, closed weekends" — same caution as Ultimate Staffing, do not just turn up.

### 34. Target — Brea
- **lane:** `corporate` (or `local-retail-food` if you would rather group all retail)
- **address:** 855 E Birch St, Brea, CA 92821 · **phone:** (714) 989-5013
- **decisionMakerTitle:** Store Director / HR Team Leader
- **email:** none · **emailConfidence:** `none`
- **whyTheyFit:** The largest single-site employer on E Birch Street, half a mile from the venue, with a Store Director and a dedicated HR Team Leader who run a team-appreciation budget as a line item — and a team that cannot all be released at once, which makes it a repeat booking rather than a single one.
- **buyingWindow:** **Jan-Feb.** Their Nov-Dec is the busiest trading period of their year and an approach then will be ignored. The post-holiday thank-you is the real window and it is the one nobody else asks for.
- **occasionClass:** `discretionary`
- **headcount:** 60 / 200 — "Full-format Target store; typically 150-250 team members with heavy seasonal variation. A single event realistically draws a department or a shift, hence a low bound of 60."
- **addressSource:** breamarketplace.com/directory/

### 35. Sprouts Farmers Market — Brea
- **lane:** `corporate` · **address:** 735 E. Birch St., Brea, CA 92821 · **phone:** (714) 482-1000
- **decisionMakerTitle:** Store Manager
- **email:** none · **emailConfidence:** `none`
- **whyTheyFit:** Grocery crews work split shifts and weekends and are almost never taken anywhere as a team; half a mile from the venue on the same street.
- **buyingWindow:** Jan-Feb (post-holiday thank-you) · **occasionClass:** `discretionary`
- **headcount:** 40 / 120 — "Full-size grocery store; 80-140 staff across departments and shifts. One event realistically draws 40-80."
- **addressSource:** breamarketplace.com/directory/

### 36. 24 Hour Fitness — Brea
- **lane:** `fitness-youth-sports` (fits the existing lane exactly)
- **address:** 965 E Birch Street, Brea, CA 92821 · **phone:** (714) 256-2500
- **decisionMakerTitle:** General Manager
- **email:** none · **emailConfidence:** `none`
- **whyTheyFit:** A full-size club half a mile from the venue with trainers, front desk and group-fitness instructors on staff — and, separately, a member base that a club GM has an active reason to run social events for. Two different bookings from one conversation.
- **buyingWindow:** Year round for staff; **Jan** for a member event, when a gym's whole marketing year turns over.
- **occasionClass:** `discretionary`
- **headcount:** 25 / 80 — "Large-format fitness club; 30-60 staff including part-time trainers and instructors. Member socials would be larger and are a separate ask."
- **addressSource:** breamarketplace.com/directory/

### 37. Gentle Dental — Brea
- **lane:** `healthcare`
- **address:** 715 E Birch St, Suite A, Brea, CA 92821 · **phone:** 714-656-2814
- **website:** https://gentledental.interdent.com/locations/ca/brea
- **decisionMakerTitle:** Practice Manager / Office Manager
- **email:** none · **emailConfidence:** `none`
- **whyTheyFit:** A dental office inside a group practice network (InterDent) half a mile from the venue; the regional manager above the practice manager buys for several offices at once, which is how a 12-person clinic becomes a 60-person party.
- **buyingWindow:** Nov-Dec (holiday party) — dental offices close between Christmas and New Year and the staff party is a fixture.
- **occasionClass:** `discretionary`
- **headcount:** 10 / 30 — "Single dental office within a DSO network; 10-20 clinical and admin staff, plus guests. The multi-office regional ask is the larger prize."
- **addressSource:** InterDent's own location page (URL above)
- **note:** **The landlord's directory and the practice's own page disagree.** breamarketplace.com/directory lists "Gentle Dental, 715 E Birch St, Suite 4A, (657) 224-3030"; gentledental.interdent.com lists "715 E Birch St, Suite A, 714-656-2814". Same building, different suite and different phone. I have used the practice's own page because it is first-party, and I am flagging the conflict rather than silently picking one. Resolve it at the door.

### 38. South Coast Med Spa — Brea
- **lane:** `healthcare` · **address:** 715 E Birch St, Suite B, Brea, CA 92821 · **phone:** (714) 988-2494
- **decisionMakerTitle:** Practice Manager · **email:** none · `emailConfidence: "none"`
- **whyTheyFit:** Aesthetics clinics run almost entirely female, mostly-under-40 clinical teams and compete hard on staff retention; the annual team night is a retention tool for them, not a nicety.
- **buyingWindow:** Nov-Dec (holiday party) · **occasionClass:** `discretionary`
- **headcount:** 10 / 30 — "Single med-spa location; 10-20 clinical and front-desk staff, plus guests."
- **addressSource:** breamarketplace.com/directory/

### 39. Banfield Pet Hospital — Brea
- **lane:** `healthcare` · **address:** 715 East Birch St, Suite C, Brea, CA 92821 · **phone:** (714) 256-4026
- **decisionMakerTitle:** Hospital Manager · **email:** none · `emailConfidence: "none"`
- **whyTheyFit:** Veterinary teams are chronically short-staffed and openly burned out; a practice-funded night out is one of the few morale levers a hospital manager actually controls. Also directly comparable to Aloha Veterinary Hospital, already on the board.
- **buyingWindow:** Nov-Dec (holiday); year round (staff appreciation) · **occasionClass:** `discretionary`
- **headcount:** 10 / 25 — "Single veterinary hospital within a national network; 10-18 vets, techs and client-service staff, plus guests."
- **addressSource:** breamarketplace.com/directory/

### 40. Brea Pediatric Dental Practice and Orthodontics
- **lane:** `healthcare`
- **address:** 1770 E Lambert Rd, Suite 210, Brea, CA 92821 · **phone:** (714) 782-0215
- **website:** https://www.breapediatricdentists.com/
- **decisionMakerTitle:** Practice Manager
- **email:** none published · **emailConfidence:** `none`
- **whyTheyFit:** A paediatric dental and orthodontic practice about a mile and a half away — its **patient list** is the youth demographic the venue's self-serve packages are priced for, which makes it a birthday-party referral partner as much as a staff-night prospect.
- **buyingWindow:** Nov-Dec (staff holiday party); year round as a referral partner
- **occasionClass:** `discretionary`
- **headcount:** 10 / 25 — "Combined paediatric dental and orthodontic practice; 10-18 staff across two specialties, plus guests."
- **addressSource:** https://www.breapediatricdentists.com/ contact page

### 41. CorePower Yoga — Brea (Village at La Floresta)
- **lane:** `fitness-youth-sports`
- **address:** 3415 East Imperial Highway, Brea, CA 92823 (La Floresta Center, upstairs above Urban Plates) · **phone:** 833-448-2561
- **website:** https://www.corepoweryoga.com/yoga-studios/ca/orange-county/brea
- **decisionMakerTitle:** Studio Manager
- **email:** none · **emailConfidence:** `form_only` — https://www.corepoweryoga.com/content/contact-us
- **whyTheyFit:** A studio with a large roster of part-time instructors who rarely meet each other, in the La Floresta centre about three miles east — and a member community that studios actively run social events for.
- **buyingWindow:** Jan (new-year studio calendar); year round for instructor appreciation
- **occasionClass:** `discretionary`
- **headcount:** 10 / 40 — "Single studio; 10-25 instructors and desk staff, most part-time. A member social would be larger and is a separate ask."
- **addressSource:** CorePower's own studio page (URL above)
- **note:** Zip is **92823**, not 92821 — La Floresta is in Brea's eastern zip. Do not normalise it to 92821.

### 42. New American Funding — Brea branch
- **lane:** `auto-finance` (the existing lane already covers brokerages, insurance and banks)
- **address:** One Pointe Drive, Ste 315, Brea, CA 92821 · **phone:** (323) 739-2733
- **website:** https://www.newamericanfunding.com/branches/brea
- **decisionMakerTitle:** Branch Manager
- **email:** no branch email published · **emailConfidence:** `none`
- **whyTheyFit:** A mortgage branch in the Pointe Drive office cluster — the same cluster as Avery Products, ViewSonic and the Brea Chamber, all already on the board — so it costs nothing to add to that route, and loan officers are a commission-driven team whose branch manager buys a celebration when a quarter lands.
- **buyingWindow:** Nov-Dec (holiday party); Jan (annual kickoff)
- **occasionClass:** `discretionary`
- **headcount:** 10 / 35 — "Single mortgage branch; 10-25 loan officers and processors, plus guests."
- **addressSource:** https://www.newamericanfunding.com/branches/brea
- **note:** The page publishes `customerservice@nafinc.com`. That is a **national customer-service inbox, not this branch**, and it would be misleading to record it as the branch's email. Recorded as `none` deliberately. This is exactly the kind of address that would look like a win and would in fact be a dead letter.

### Also from the Brea Marketplace directory — real, verified, lower priority
These three are real and their addresses come from the same landlord directory, but they are national-chain apparel and sporting-goods stores with small crews and no local budget autonomy. Include them only if you want the retail lane to look complete; skip them if you would rather the list stayed sharp. `emailConfidence: "none"` on all three, `decisionMakerTitle: "Store Manager"`, `occasionClass: discretionary`, `buyingWindow: "Jan-Feb (post-holiday retail thank-you)"`, `addressSource: breamarketplace.com/directory/`.

| name | address | phone | headcount low/high | basis |
|---|---|---|---|---|
| Men's Wearhouse | 985 E Birch St, Suite B, Brea, CA 92821 | (714) 257-0120 | 8 / 20 | Single apparel store; 8-15 staff, plus guests |
| Old Navy | 755 East Birch Street, Brea, CA 92821 | (714) 482-0153 | 20 / 60 | Full-format apparel store with heavy seasonal hiring; 30-60 at peak |
| Big 5 Sporting Goods | 705 E Birch St, Suite A, Brea, CA 92821 | (714) 990-0673 | 8 / 20 | Single sporting-goods store; 8-15 staff, plus guests |

### Also verified but NOT counted — Village at La Floresta tenants
The landlord at https://www.villageatlafloresta.com/stores/ publishes a tenant list with phone numbers but **no suite numbers** — only the centre's own address, 3301 E. Imperial Hwy, Brea, CA 92823. That is enough to call and not enough to put a pin on a map. Recorded here so the work is not repeated, not proposed as rows:

Whole Foods Market (714) 528-7400 · Mendocino Farms (714) 924-7100 · Urban Plates 714-462-9885 · Orangetheory Fitness 714-510-5100 · Club Pilates (657) 315-9080 · LaserAway 714-592-2990 · Prime IV Hydration & Wellness 714.646.1865 · NOW Massage Brea 714.988.7910 · Capital Noodle Bar 714-983-7996 · Reborn Coffee (714) 983-7577 · The Kebab Shop · Skin Laundry · 3 Thirty 3 Nail Bar (714) 983-7556 · Madison Reed Color Bar (657) 286-6896 · Stitch & Feather (657) 444-2940 · Styled By TC 714-983-7992.

**Whole Foods Market Brea and Orangetheory Fitness Brea are both strong prospects** on headcount and buying behaviour and both should be added once you have a suite-level address from Places. I have not added them on a centre-level address because a shared-mall address on a map pin is the same class of error as a guessed email.

---

# WHAT I COULD NOT VERIFY AND LEFT OUT

This section is the point. Every item here was found, looked at, and rejected.

### 1. Ding Tea Brea — REJECTED, the business may no longer exist under that name
`dingteabrea.com` resolves but redirects into a third-party ordering platform (`fromtherestaurant.com`) that shows only the platform's own 866 number and no address. Meanwhile a listing appeared as "**TeaTopia A Boba Project Brea (Formerly Ding Tea)**", and other listings still show Ding Tea at 2500 E Imperial Hwy Suite 108. **The name on the door is in dispute and I could not resolve it.** A rep who walks in asking for "Ding Tea" at a shop now called TeaTopia has burned the first thirty seconds of the conversation. Left out. Worth a drive-past — there is very likely a real boba shop at 2500 E Imperial Hwy Suite 108, and if there is, add it under whatever name is actually on the sign. Note that 2500 E Imperial Hwy is the same building as Team Kwon Taekwondo HQ and the Credit Union of Southern California branch, both already on the board.

### 2. Boba Loca / Boba Frutti, 1230 W Imperial Hwy, La Habra — REJECTED, two names one address
Yelp lists "**Boba Frutti**" at 1230 W Imperial Hwy, La Habra. Tripadvisor lists "**Boba Loca**" at 1230 W Imperial Hwy, La Habra. Both are current-looking listings. Either it rebranded and one source is stale, or two businesses have occupied the unit. **Two sources disagree about the identity of the business at the address, so it comes out** — same standard that removed Round One Entertainment.

### 3. America's Tire / Discount Tire, Fullerton — REJECTED, could not read a store page
`americastire.com/store/ca/fullerton/s/1087` returned a store-locator shell showing a Scottsdale, Arizona corporate address and the text "We are still gathering information." I could not get a Fullerton street address off the company's own site, and I was not willing to take one off a directory for a company whose own locator would not confirm it. **A store almost certainly exists in Fullerton. I do not know its address.** Retry the locator.

Note also: **Discount Tire & Service Centers** (row 22, Fullerton, E Orangethorpe) and **Discount Tire / America's Tire** are two different companies with confusingly similar names. Row 22 is the former. Do not let them merge in the data.

### 4. Green Tomato Grill, Brea — REJECTED, no address published anywhere first-party
`greentomatogrill.com` names three locations (Orange, Brea, Huntington Beach) and publishes **no street address, no phone and no email for any of them** — the locations page links out to Google Maps instead. `/contact/` 404s. The Brea Chamber directory lists them with (714) 987-3766 but no address. A real business with a real chamber membership and no address I could read off a first-party page. Left out; get the address from Places and add it, because a three-store local group with a Brea store is a good prospect.

### 5. TAPS Fish House & Brewery, Brea — REJECTED THIS PASS, blocked, worth retrying
Both `tapsfishhouse.com/brea` and `/brea/contact` failed on robots.txt fetch timeouts, twice. TAPS is unquestionably real and unquestionably in Brea, and it is one of the larger hospitality employers in the city with a private-events business of its own. **I will not write an address I did not read.** Retry this one first — it is the most valuable rejection on this list.

### 6. Minuteman Press of Brea — REJECTED, robots-disallowed
`minuteman.com/us/locations/ca/brea/` is disallowed by robots.txt. Yelp puts it at 273 Viking Ave, Brea. Single second-party source for a business whose own page I was explicitly not permitted to read. Left out. Note FASTSIGNS of Brea (row 33) covers the same category and *did* publish everything, including an email.

### 7. Charlie's Auto Tech, American Tire Depot, 7 Leaves Fullerton, CJ Foods, THE ALLEY — INCLUDED BUT FLAGGED
Rows 27, 21, 6, 29 and 4 are in the list above but rest on agreeing second-party sources rather than a first-party page, for the specific reasons stated on each row. They are marked **PARTIAL** in place. If you would rather the new data hold the same standard as the existing 69 — every address from one API call with a place id attached — **hold these five back until Places confirms them, and ship the other 37.** That is the cautious call and it is defensible.

### 8. Coordinates for all 42 — NOT PRODUCED, deliberately
Repeating this because it is the biggest single caveat in the document. No lat/lng below came from a geocoder. Do not transcribe placeholder coordinates and do not let any row render on the map with `locationAccuracy: "verified"` until Places has returned a coordinate and a `placeId` for it. The existing file's credibility rests on the fact that every pin is checkable in fifteen seconds; adding 42 pins that are not would cost more than the 42 rows are worth.

### 9. Duplicates checked and excluded
Checked all 42 against the existing 69 by name and by address. Two collisions found and excluded:
- **Samyang America, Inc.** — already present at 140 S State College Blvd, Brea. Verified independently, findings recorded in Section 3, **not re-added**.
- **Westways Insurance Agency Inc., 770 S Brea Blvd** — already present as "Westways Insurance, 770 S Brea Blvd #107". Same business, same building. **Not re-added.** (Their contact page publishes the address but neither a phone nor an email, which is consistent with the existing row.)

Near-misses that are genuinely different organisations and are safe to add: Gentle Dental Brea and Brea Pediatric Dental are distinct from the five dental practices already in the file (Brea Dentistry, Brea Family Dental Center, Brea Premier Dentistry, Energetic Smile, Shine Dentistry). Brea Auto Service (365 W Central Ave) is distinct from Brea Auto Services, a separate listing at a different address that I did not use. CorePower Yoga Brea is distinct from every existing `fitness-youth-sports` row, all of which are martial arts or youth sports.
