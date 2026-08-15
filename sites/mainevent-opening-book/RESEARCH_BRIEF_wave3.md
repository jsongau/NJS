# Wave 3 research brief — 100 more prospects, organised by industry

You are adding real organisations to a prospecting board for a **Main Event
Brea** Sales Manager work sample. The venue is at **245 W Birch St, Brea CA
92821** and has **not opened yet**.

The board already carries 102 real organisations. You are adding more. The
whole value of this artefact is that **every row holds up when a hiring
manager clicks it**. One invented email address or one nudged pin discredits
the other two hundred.

---

## THE RULES. Read them twice.

1. **Every organisation must be real and currently trading.** Verify it
   against its own website, or against a landlord/district/association
   directory that publishes it. A single third-party aggregator listing
   (Yelp, Manta, a scraped business directory) is **not** enough on its own
   for an address.

2. **Never pattern-guess an email.** `info@theirdomain.com` is forbidden
   unless you have actually loaded a page that prints that address. If you
   record an email you MUST record `emailSourceUrl` — the exact URL of the
   page you read it off. No source URL, no email.

3. **No email is a finding, not a failure.** If the only written door is a
   contact form, set `emailConfidence: "form_only"` and record
   `contactFormUrl`. If there is no written door at all, set
   `emailConfidence: "none"` and leave both out. That row becomes a go-see,
   which is the activity the job posting names first.

4. **Geocode every address yourself** (see below). If the geocoder returns
   nothing, or returns a *different street*, do **not** invent or borrow a
   coordinate. Set `geocodeStatus` accordingly and fill `excludeReason`.

5. **Distance.** Anything beyond roughly **7 miles** of the venue is out of
   the trade area. Compute the haversine distance with R = 3958.8 miles from
   **lat 33.9190296, lng -117.9009311** and record `milesFromVenue`.

6. **No duplicates.** Read `/tmp/work/me-prospecting/src/data/prospects.ts`
   first and skip anything already on it. Also read the
   `EXCLUDED_FROM_BOARD` array at the foot of that file — those nine were
   deliberately removed and must not come back without new evidence.

7. **Judgements are labelled as judgements.** Headcount ranges, buying
   windows and the fit sentence are modeled. State the basis. Never a single
   confident number where a range with its reasoning would be honest.

---

## HOW TO GEOCODE

Use the **WebFetch** tool against the US Census Bureau one-line endpoint.
Direct `curl` does not work from this container; WebFetch does.

```
https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=<URL+ENCODED+ADDRESS>&benchmark=2020&format=json
```

Ask it to return the raw JSON. Read `addressMatches[0].coordinates` — `y` is
latitude, `x` is longitude — and `addressMatches[0].matchedAddress`.

- Match, and the street number and street name agree with what you
  researched → `geocodeStatus: "matched"`, `locationAccuracy: "verified"`.
- Empty `addressMatches`, after one simplified retry with the suite/unit
  stripped → `geocodeStatus: "unmatched"`, `lat`/`lng` null,
  `excludeReason` filled.
- A match on a **different street or a different directional** →
  `geocodeStatus: "address_disagreement"`, `lat`/`lng` null,
  `excludeReason` filled. This is the disagreement that took Round One
  Entertainment off this board. Treat it the same way.
- Suites are dropped by the geocoder, so several tenants of one building
  legitimately share one coordinate. That is not a copied value. Note it on
  the row and let the map stack the pins.

---

## THE ROW SHAPE

Write a JSON array to the output path you were given. Nothing else in the
file. Every field below, in this order, with `null` where absent.

```jsonc
{
  "name": "Full legal or trading name, as the organisation writes it",
  "lane": "schools | colleges | fitness-youth-sports | corporate | auto-finance | hospitality-civic | faith-nonprofit | healthcare | local-retail-food",
  "naics": "61",                    // two-digit NAICS sector, see table
  "orgType": "school | independent | chain | unknown",
  "orgTypeBasis": "One sentence naming the evidence that put it there.",
  "address": "1 Civic Center Cir, Brea, CA 92821",
  "city": "Brea",
  "postalCode": "92821",
  "phone": "(714) 990-7800",        // or null
  "website": "https://...",         // or null
  "email": null,
  "emailSourceUrl": null,           // REQUIRED whenever email is set
  "emailConfidence": "verified_public | form_only | none",
  "contactFormUrl": null,
  "decisionMakerTitle": "A ROLE, never a person's name",
  "priority": "anchor | high | medium | low",
  "whyTheyFit": "One concrete sentence about THIS organisation. Not a category. Name the thing on their own page that makes a group night obvious.",
  "leadPackageId": "one of the published ids below",
  "buyingWindow": "Nov-Dec  |  May-Jun (grad night), Nov + Mar (banquets)  | ...",
  "headcountLow": 40,
  "headcountHigh": 80,
  "headcountBasis": "Why that range. Say 'estimate only' where it is one.",
  "note": null,                     // optional, only if worth saying aloud
  "addressSource": "Where the ADDRESS came from, with the date you read it",
  "lat": 33.917066,
  "lng": -117.888923,
  "matchedAddress": "1 CIVIC CENTER CIR, BREA, CA, 92821",
  "milesFromVenue": 1.1,
  "locationAccuracy": "verified | approximate",
  "geocodeStatus": "matched | unmatched | address_disagreement",
  "excludeReason": null             // set ONLY when the row must stay off the board
}
```

### Published package ids — use one, do not invent one

`all-access-grad-pack`, `mvp-grad-pack`, `play-it-forward`, `spirit-night`,
`the-main-event-birthday`, `school-all-access-pass`, `bowl-n-fun`,
`project-graduation`, `school-lock-in`, `corporate-all-access-pass`, `mvp`,
`level-up`, `fun-101`, `all-day-meeting`, `happy-hour`, `corporate-buyout`,
`relay-rush`, `collab-for-a-cause`.

Schools lead with a grad or school package. Corporate leads with `mvp`,
`level-up`, `corporate-all-access-pass` or `all-day-meeting`. Small teams and
counters lead with `fun-101` or `happy-hour`. Nonprofits lead with
`spirit-night` or `collab-for-a-cause`.

### NAICS sectors in play

| Code | Sector |
|---|---|
| 22 | Utilities |
| 23 | Construction |
| 31 | Manufacturing |
| 42 | Wholesale Trade |
| 44 | Retail Trade |
| 48 | Transportation and Warehousing |
| 51 | Information |
| 52 | Finance and Insurance |
| 53 | Real Estate and Rental and Leasing |
| 54 | Professional, Scientific, and Technical Services |
| 56 | Administrative and Support Services |
| 61 | Educational Services |
| 62 | Health Care and Social Assistance |
| 71 | Arts, Entertainment, and Recreation |
| 72 | Accommodation and Food Services |
| 81 | Other Services |
| 92 | Public Administration |

### Lane meanings — the lane is the MOTION, not the industry

- `schools` — buys on a published calendar and a purchase order.
- `colleges` — the door is a student life office; one campus is many buyers.
- `fitness-youth-sports` — a season ends and everybody goes somewhere.
- `corporate` — HR or an office manager; highest value, slowest to reach.
  **Manufacturers, distributors and large employers belong here.**
- `auto-finance` — commission floors. They buy twice: team reward and client
  appreciation.
- `hospitality-civic` — hotels, chambers, cities, referral multipliers.
- `faith-nonprofit` — youth groups and the Spirit Night fundraiser mechanic.
- `healthcare` — the practice manager is the buyer and is the hardest person
  in the building to reach. A go-see lane.
- `local-retail-food` — the owner is behind the counter. A walking route.

### Priority

`anchor` is reserved and rare — an organisation that would change the
opening quarter on its own. `high` = large headcount or a certain occasion.
`medium` = a real prospect with a normal cycle. `low` = small or slow.

---

## WHAT GOOD LOOKS LIKE

Bad: *"A local manufacturer that may want a holiday party."*

Good: *"Bonded Motors runs a single-site engine remanufacturing plant on
Kraemer with a production floor that works two shifts, so a plant-wide
recognition night has to be bought as two smaller weekday events rather than
one Friday, which is the exact midweek daytime inventory a venue struggles to
fill."*

The second sentence could only have been written about that organisation. The
first could have been written about anything. Write the second kind.

---

## OUTPUT

Write the JSON array to the path in your task. Then reply with **only** a
short tally: how many rows, how many matched, how many unmatched, how many
carry a verified public email, and the names of anything you had to exclude
and why. Do not paste the rows back.
