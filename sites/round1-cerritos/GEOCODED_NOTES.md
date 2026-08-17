# GEOCODED — notes on the pass

**Source:** US Census Bureau geocoder, `benchmark=2020` (Public Address Ranges — Census 2020), one-line address endpoint. Nothing else. No Google Places call was made in this pass, so none of these rows carry a `placeId`.

**Distance:** haversine, earth radius **R = 3958.8 miles**, copied from `milesFromVenue` in `src/domain/selectors/desk.ts` so the figures agree with the app's own. Anchor used: **lat 33.9168, lng -117.9000** (245 W Birch Street, Brea CA), as specified in the brief.

> **One thing to settle before these ship.** `src/data/venue.ts` carries `lat: 33.9190296, lng: -117.9009311`, which is about 0.16 miles north of the anchor this pass was told to use. Every `milesFromVenue` figure below will therefore differ from what the running application computes for the same row, by up to roughly 0.2 miles. Either re-run the arithmetic against `VENUE`, or change `VENUE`. Do not ship both numbers.

---

## Tally

| | Count |
|---|---|
| Organisations in | **42** |
| **Matched** — Census returned a coordinate and agreed on street number and street name | **33** |
| **Unmatched** — no coordinate, after a simplified retry | **7** |
| **Address disagreement** — Census matched a *different* street, coordinate withheld | **2** |
| **Out of range** — a match outside lat 33.5–34.3 / lng −117.3 to −118.4 | **0** |
| `locationAccuracy: "verified"` | **33** |
| `locationAccuracy: "approximate"` | **9** |

Every recorded coordinate falls inside the trade-area envelope; the range assertion was run as code over all 42 rows, not by eye. Recorded distances run from **0.1 mi** (Old Brea Chop House, Jax Auto) to **3.0 mi** (7 Leaves Cafe, Fullerton).

---

## Flagged rows — the ones the owner should decide individually

### 1. THE ALLEY — Brea Mall — `address_disagreement`, coordinate withheld
Sent `1065 Brea Mall, Brea, CA 92821`. Census returned **`1065 N BREA BLVD, BREA, CA, 92821`** — a different street, about 1.3 miles north of the mall. "Brea Mall" and "N Brea Blvd" are not the same road; Census simply found the number 1065 on the road whose name it recognised. A bare `Brea Mall, Brea, CA 92821` retry returned nothing. The research file already marked this street number as single-sourced from Yelp, and Simon publishes level and neighbours but no street number. **This row currently has no street address confirmed by any second source.** Coordinates left null rather than pin a boba counter onto Brea Boulevard.

### 2. CJ Foods Manufacturing Corp — Fullerton — `address_disagreement`, coordinate withheld
Sent `500 S State College Blvd, Fullerton, CA 92831`. Census returned **`500 N STATE COLLEGE BLVD, FULLERTON, CA, 92831`** — the *north* segment, at 33.874288, −117.889555. That is the same block, to four decimal places, as 7 Leaves Cafe at 505 N State College Blvd. A 250-person food plant and a boba cafe do not share a lot. North and South State College Blvd are different segments of road. The research file left its own instruction on this row: *"If a Places lookup disagrees with 500 S State College Blvd, take the row out rather than reconcile it."* Census disagrees. Also still unresolved: the research file records a second CJ site at 675 S Placentia Ave, about a mile away. Decide which building the people are in.

### 3. Discount Tire & Service Centers — Fullerton — `unmatched`, and a near-miss worth naming
`2341 East Orangethorpe Avenue` and the simplified `2341 E Orangethorpe Ave` both returned zero matches. A third probe dropping the directional returned **`2341 W ORANGETHORPE AVE, FULLERTON, CA, 92833`** at 33.859204, −117.969119 — *west* Orangethorpe, a different ZIP, roughly five miles from the research address. **That coordinate has not been recorded and must not be.** It is noted here only so nobody repeats the probe and mistakes it for a find.

### 4. Reborn Coffee, Inc. — matched, minor normalisation noted
Sent `580 North Berry Street`; Census returned `580 BERRY ST`. Street number and street name agree and Census holds no directional prefix for Berry St in Brea, so this is recorded as `verified`. Raised here only so the dropped "North" is not later mistaken for a silent edit.

### 5. New American Funding — matched, minor normalisation noted
Sent `One Pointe Drive, Ste 315`; Census returned `1 POINTE DR`. Same street number, same street, spelled-out numeral normalised. Recorded as `verified`.

### 6. Gentle Dental — Brea — matched, but the research file's conflict survives
Census confirms the building at `715 E BIRCH ST` and can say nothing about the suite. The landlord's directory says Suite 4A with one phone; the practice's own page says Suite A with another. Geocoding did not settle it and was never going to. Resolve it at the door, as the research file said.

### 7. Suite-level precision is absent throughout
Census matches by address-range interpolation, so a suite is dropped and every unit in a building resolves to one point. Five Brea Marketplace tenants (Crumbl, Jersey Mike's, Pan Holic, Piccolo Coffee, D'Vine) share the single coordinate for 955 E Birch St; Kabuki and Taal share 975 E Birch St; Gentle Dental, South Coast Med Spa and Banfield share 715 E Birch St. **These are not copied values** — they are the geocoder returning the same building for the same street address, and each is noted as such on its row. A map will stack those pins. That is honest and it should be allowed to look stacked rather than be jittered apart into fiction.

---

## The seven unmatched rows, and what to do about them

**Unmatched:** Krak Boba — Brea; Lollicup Fresh Tea Express — Brea Mall; Discount Tire & Service Centers — Fullerton; Brea Auto Service; JJ Star Complete Auto Repair — La Habra; Brea Pediatric Dental Practice and Orthodontics; CorePower Yoga — Brea (Village at La Floresta).

Each of these was tried twice — once as printed in the research file, once with the suite, unit letter and punctuation stripped — and each returned an empty `addressMatches`. **An empty result from the Census geocoder is a statement about the Census address file, not about the business.** Its ranges lag new construction badly, which is exactly why the two La Floresta-era addresses (CorePower at 3415 E Imperial Hwy in ZIP 92823, and Krak Boba at 2435 Imperial Hwy) failed while every older Brea Boulevard and Birch Street address matched on the first try. Lollicup is a different problem and not a fixable one here: the research file is explicit that Simon publishes no street or unit number for it, so there is no address to geocode and the honest record is a null. The right next step is to run these seven — and only these seven — through the Google Places call that produced the coordinates for the existing 69 rows in `src/data/prospects.ts`, which will also supply the `placeId` this whole file lacks; if Places also declines, or if it returns a street that disagrees with the research file, treat that the way THE ALLEY and CJ Foods have been treated here. In the meantime these rows are perfectly shippable **without** coordinates: they are a go-see cohort with phone numbers and street addresses, and a prospect with a null `lat` drops off the map view while remaining on the desk. What must not happen is a developer filling the gap by nudging a nearby pin — an unmatched row is a fact the owner can act on, and a fabricated pin is the thing that would discredit the other 33.
