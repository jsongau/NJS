# Ole Smoky — Known Consumer Programme

**7 August 2026.** New work sample at `nathanjsong.com/olesmoky/distribution`,
built for the Ole Smoky Distillery **CRM Director** application.

---

## The decision that shaped everything

Jay's ask was to reskin the Molson Coors territory planner to Ole Smoky.
I pushed back before writing any code, and it was the right call.

The Molson Coors app is about three-tier distributor selling: order desks,
sell-in ladders, wholesaler review boards. The Ole Smoky role is a CRM
Director — first-party data, CDP selection, lifecycle and segmentation,
loyalty, consent governance, LTV and retention. Of the job description's
eleven responsibilities, exactly **one** mentions distributors, and it is
about building CRM touchpoints *for* trade partners rather than planning
territory.

A straight reskin would have taken two hours and handed a hiring manager a
distributor order desk with moonshine jars on it. They would have read it as
an application for a different job.

What DID transfer was the engine, almost completely:

| Territory app | Here |
|---|---|
| Derived issue register (`issues.ts`) | Derived consent and hygiene register |
| Sent log with opener comparison | Journey step performance |
| Programme calendar | Lifecycle flows with legal gates |
| `priceForLane` returning null on retail | `AnonymousPurchase` with no `contactId` field |
| Provenance badges on every figure | Same, trimmed to three states |
| Vite + CSS Modules + tokens + route stubs | Same, rethemed |

So: keep the architecture, replace the domain. Jay approved that, chose the
capture map as the landing page, and asked for the Hooch Hop built in full.

He also overrode my URL recommendation. I suggested `/olesmoky` on the
grounds that "distribution" signals the wrong job before the page loads; he
asked for `/olesmoky/distribution` and that is what shipped.

---

## What the research turned up

Two findings did most of the work, and neither was in the job description.

**Ole Smoky does not sell its own spirits.** olesmoky.com routes every jar to
ReserveBar, Drizly or Minibar. Merchandise — 325 items — is first-party. So
the only purchase records the company owns are for t-shirts and bar mats.
The JD's line about "the restrictions the three-tier system places on
direct-to-consumer data at the bottom of the funnel" is much sharper than it
lets on, and putting an actual number on it became the whole identity page.

**Over five million people a year walk through their own doors** and almost
none become a contact. The last venue-level split published was 2023: Holler
2.2M, Barn 1.3M, Barrelhouse 1.1M, 6th & Peabody 700k+ — self-reported door
counters, and the app says so everywhere the figure appears. Myrtle Beach
opened May 2026 and appears in no published count at all.

And the gift: **the East Tennessee Hooch Hop already exists as a paper stamp
card.** Collect stamps across venues, earn merchandise. The mechanic is
built, the brand is built, the customer already understands it, and it
captures nothing. Digitising it is not inventing a loyalty programme — it is
putting a database behind one that has been running for years without one.

---

## The three type-system moves

This is the part worth carrying to the next build.

**1. The blind spot is a shape, not a warning.**

```ts
interface KnownPurchase     { contactId: ContactId; channel: OwnedChannel; ... }
interface AnonymousPurchase { channel: ThreeTierChannel; ... }
```

No `contactId?: string`. The field is ABSENT, not optional. An optional field
invites `if (p.contactId)` and a quiet assumption that the happy path exists
somewhere. An absent field makes it a compile error the first time anybody
reaches for it. Same move as `priceForLane` returning null on the retail lane
in the territory app.

**2. Consent is constructed from an affirmation, not annotated with one.**

The DISCUS Code (2025) §2D.B.6 requires the age affirmation to happen BEFORE
collection, and §2D.B.2 defines it as full month/day/year. So `Consent` takes
`basis: AgeAffirmation` as a required field rather than carrying a nullable
`dob` on the contact. The forbidden state — a consent with no affirmation
behind it — cannot be represented.

**3. SMS consent carries its own number.**

47 CFR §64.1200(f) ties prior express written consent to "the telephone number
to which the signatory authorizes" messages. Consent attaches to a NUMBER, not
a person. The union member for `channel: "sms"` therefore holds `number`, and
a contact who changes phones has not consented on the new one.

---

## Traps found and fixed

**Horizontal overflow on every page at 390px, 260px of it.** The nav looked
like the culprit — its link row is `flex-wrap: nowrap` with `overflow-x: auto`
— and adding `min-width: 0` to the nav did nothing. The actual cause was the
shell's grid: a grid item has `min-width: auto`, so the implicit `auto` column
track sized itself to the nav's max-content and every page inherited it.
`grid-template-columns: minmax(0, 1fr)` fixed all seven at once.

**Images broke silently in the single-file preview.** Vite compiles a `?url`
glob import to `new URL("x-hash.webp", import.meta.url).href`. Inside an
inlined `<script type="module">`, `import.meta.url` is the DOCUMENT url, so
every path resolved next to the html file and rendered as a broken icon. The
preview looked finished, which is the worst way to fail. `build-preview.mjs`
now rewrites that form to a data URI and **fails the build** if any survive.

Related: the images had to move from `public/` to `src/assets/` first. A path
built at runtime from `import.meta.env.BASE_URL` never produces a literal for
the inliner to find. One code path that works in both builds beats two that
each work in one.

**Product imagery was 1,457 KB for 72-pixel thumbnails.** Resized to 220px on
the long edge: 272 KB. The deployed bundle got smaller too.

**The 0.8% band vanished.** On the identity page the marketplace lane is 0.8%
of volume, which at that width is under a pixel — the bar was disappearing the
exact lane the page is arguing about. Now it has a 10px floor, the percentage
label is suppressed under 5% so it cannot overflow into its neighbour, and a
line underneath says the band is drawn to a minimum.

**A word typeset as a quantity.** The segments page put "One touch, never
returned" in the same mono display size as "1,400" and it shouted louder than
every number beside it. Added a `.statWord` variant.

---

## What is deliberately absent

Nothing in the journeys triggers on where somebody is standing or what they
were looking at. Every trigger is either something the person actively did —
scanned a stamp, booked a tour, bought a shirt — or the plain passage of
time. This is the same lesson from the Molson Coors email work, where "I was
through your store this week and counted your cold box" read as surveillance
and Jay had to say so twice. Location and browse triggers are technically
easy and read, to the person receiving them, as being watched.

There is also no acknowledge button on the consent register, and no resolved
button. A status somebody can set by hand will eventually disagree with the
data, and a governance register that disagrees with the data is worse than
none — it turns a known problem into an invisible one.

---

## Verification

- `tsc -b` clean; the route-stub emitter now fails the build if a `<Route>` in
  `App.tsx` has no matching stub, because a deep link is exactly how somebody
  arrives from a job application.
- Seven pages screenshotted at 1440px and checked at 390px: **zero horizontal
  overflow** on all seven.
- Preview file opened over `file://` and every route walked: no page errors,
  no broken images after lazy-load.
- Deployed bundle: 96 KB gzipped JS, 8 KB gzipped CSS, 272 KB imagery.

---

## Next

1. **The backend, still unbuilt and still the highest-leverage thing.** For
   this app the schema is `contacts`, `consents`, `age_affirmations`,
   `capture_events` — with the three type-level rules enforced as database
   constraints rather than only in TypeScript: a NOT NULL foreign key from
   `consents` to `age_affirmations`, and a CHECK that an SMS consent row
   carries both a number and the disclosure flag.
2. Identity resolution is a described match strategy, not a running one.
3. No incrementality design. Named as a gap on the measure page rather than
   quietly omitted.
