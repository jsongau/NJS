# Ole Smoky — The Golden Jar, consumer sweepstakes funnel

**7 August 2026.** `nathanjsong.com/olesmoky` — a single self-contained
HTML page, built for the Ole Smoky Distillery CRM Director application.
Second artifact of the same day; the first is the territory planner at
`/olesmoky/distribution`, written up in `session-2026-08-07-olesmoky.md`.

---

## What this is

A consumer-facing sweepstakes funnel adapted from the `/ono` template:
one question at a time, custom SVG throughout, no stock photography. The
audience is the person buying the jar, not the recruiter reading the
resume. The recruiter is supposed to watch a real consumer flow work and
draw his own conclusion.

Three views behind a segmented control in the header:

1. **Enter** — hero, the jar, the five-step picker, the prize ladder,
   the Gatlinburg weekend, the rules summary.
2. **Convert** — find-a-jar: the chosen product, delivery through Uber
   Eats and DoorDash with a location search, four retailers, distillery
   ticket booking, and a sticky bottom floater carrying the $15 code.
3. **My Jar** — the member dashboard: balance, the two ledgers, the
   activity feed, referrals with pending points, the share card.

## The decision that shaped everything: two ledgers, not one

The obvious build is points for buying bottles. That is illegal in a
meaningful chunk of the country. California ABC prohibits it outright,
and 27 CFR 6 treats a thing of value given to a retailer or conditioned
on purchase as an inducement.

So the model splits in two and neither half is a function of alcohol
spend:

- **Jar Points** — earned for actions (joining, scanning a code,
  checking in at a distillery, referring a friend, snapping a receipt).
  They redeem for merchandise that sits inside 27 CFR 6.84's permitted
  consumer advertising specialties. **Never** for alcohol.
- **Draw Entries** — the sweepstakes. Free alternate method of entry
  first and with equal dignity, per the standard AMOE requirement.

Alcohol is never a prize. That is the line the whole thing is built
around, and it is the part a CRM Director actually gets paid to know.

## Rejected, and why

- **900-point alcohol coupon.** Was in the reward wall. Broke the
  compliance promise four separate ways at once. Cut entirely. This was
  the single worst thing in the build and an audit agent found it, not
  me.
- **Back office and Measure views.** Two full admin surfaces with a
  login. Jay killed them: a work sample should show the consumer
  experience and imply the operator competence, not make a hiring
  manager click through a fake admin panel. What is left is a discreet
  demo sign-in. Cutting them also removed the forecast model, the queue,
  the levers and the log — about 400 lines.
- **Direct olesmoky.com product URLs.** I guessed nine of them. Eight
  404'd. Replaced with verified collection pages; only Original has a
  confirmed direct product page.
- **The mini-nav-as-whiskey-jar-lid, first attempt.** Brass plank lid
  that read as a crate slat, and an in-flow panel that pushed the page
  down when it opened. Rebuilt as a dark pill with one brass hairline
  and an absolutely positioned panel. Zero layout shift, measured.

## Traps found the hard way

- **A CSS class collision ghosted an entire section.** `.scan` was used
  by both the Scan module and a full-screen scanline atmosphere overlay
  at `position:fixed; opacity:.15`. The overlay won. The whole module
  turned translucent and stopped taking clicks. Renamed to `.scanln`.
  Lesson: an atmosphere layer should never share a namespace with a
  content module.
- **`body{overflow-x:hidden}` silently killed `position:sticky`.**
  Setting `overflow` on `body` makes it a scroll container, so
  `window.scrollY` stops moving and every sticky element freezes. The
  fix is `html{overflow-x:clip}`, which clips without creating a scroll
  container. This cost an hour.
- **`.btn-p` was white text on gold at 1.83:1.** Shipped that way in
  every earlier version. Now `#160F03` at 10.4:1. The kraft label was
  3.98:1, now 6.12:1.
- **`textContent` prints HTML entities literally.** `&middot;` rendered
  as the six characters. `String.fromCharCode(183)` instead.
- **The countdown was a trick clock** that reset on reload. It now
  targets the actual first of next month.
- **The ledger did not reconcile.** The balance said 0 while the feed
  listed 920 points of earnings. Seed data now sums exactly:
  250 join + 120 scan + 250 check-in + 200 referral + 100 receipt = 920.

## Voice

Two audit agents swept the full 29,800 characters of visible copy
against tourism, bartender, restaurant and delivery-driver registers.
Findings that stuck: 861 lines contained zero contractions, which is the
single loudest tell that a machine wrote something. Now 22. Also
removed: every decorative arrow glyph, every em dash, seventeen British
spellings, and the claim that three referrals give "four times the odds"
which was wrong by roughly 25x.

## Known and unfixed

Disclosed rather than hidden, because these are the kind of thing an
interviewer might catch:

1. Scan values disagree — the ledger says 250, the scanner pays
   120/180/400 by container size.
2. The $15 code needs a $75 basket; the model's average order is $68.
3. Code expiry reads 14 days in one place and 60 in another.
4. "Checked in at The Holler" earns 250 but appears in no published
   earn table.
5. The prize breakdown puts $2,250 of the $5,000 into travel plus a
   rented cabin, which slightly undercuts the "nobody copies this by
   renting a cabin" line.

## Facts verified before use

- The Hooch Hop is real, live since October 2022, three East Tennessee
  locations, physical passport, complimentary t-shirt.
- 2023 visitor counts: The Holler 2.2M, The Barn 1.3M, The Barrelhouse
  1.1M, 6th & Peabody 700K+.
- "Most visited distillery" is **self-reported** via the company's own
  traffic counters. Worth knowing before repeating it in an interview.
- Uber Eats carries Ole Smoky; dedicated product pages exist.
- Original is 50% ABV, 100 proof.
- The 7-Eleven claim was scoped down to the single store the locator
  actually returned. My earlier "~9,000 stores" was unverified and wrong
  to state.

## Build notes

- One file, 1.3 MB, every image inlined as a base64 WebP data URI. Zero
  external requests, verified: a headless load issues no network calls
  at all. A recruiter on hotel wifi sees the whole thing or nothing.
- `noindex, nofollow`, same as `/olesmoky/distribution`, and for the
  same reason: a sweepstakes-shaped page under a real distillery's
  trademarks should be opened from an application link, not found in
  search.
- Audio is synthesized with the Web Audio API, no files. Glass uses
  inharmonic partials at 1, 2.83, 5.4, 8.93, 13.34. The pour is a rising
  bandpass with glugs. Reverb is six mutually prime delays. The rising
  pitch was verified by rendering through an `OfflineAudioContext` and
  measuring zero-crossing rate rather than by listening.
- Render from state, never patch the DOM: `paintConfirm()`, `paintMe()`,
  `paintNext()`.
- One constant, `DIST_URL`, owns the handoff to
  `/olesmoky/distribution`, so the route lives in exactly one place.

## Verified before this commit

Zero console errors. Zero external requests. Zero horizontal overflow at
360, 390, 768, 1024 and 1512. Nav resolves to Enter, Convert, My Jar,
Distribution, sign-in, sound.

## Next steps

1. Close the five known copy inconsistencies above, scan values first.
2. `/olesmoky` has no OG-shareable summary of the two artifacts
   together. A recruiter given one link should be able to reach both.
3. The real next build is backend: this funnel fakes persistence
   entirely in memory. Entries, points and referrals want a Postgres
   schema with a proper ledger table, and the referral flow wants a
   server to hold pending credit until the referee confirms. That is the
   thing that turns a work sample into a product.
