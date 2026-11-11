# Session 2026-11-10: Fitness interactions, compact focus cards, six focus pages

## What changed and why
- Review first: in 8 days the site had about 7 distinct visitors on Business and 1 on Fitness (Jay), all
  direct, and `leads` had 0 rows. Polish is not the constraint; proof, distribution and a working form are.
- Hero art replaced by a boxer and heavy bag (`partials/fitness/art/art-hero.html`, `h2-` classes). A tap
  throws a jab or a cross and lights one of 12 pips; at 12 the Start button pulses. One number (0 to 12)
  drives every visual. Taps send `fit_tab` with `hero_combo` (first tap) and `hero_12` (finished).
- FX layer appended to `assets/studio/fitness.css`: button ripple, focus card pointer light and pick burst,
  plan bar seats, conic light around the 12-pack, calendar pops. All transform, opacity, colour or shadow.
- Open-hours line under the hero buttons and a count on each Thursday, from the same `HOURS`, `CLASS`
  and `BOOKED` lists as the calendar (`openHours` in `fitness.js`).
- Focus cards are one compact row each (104px desktop, 92px phone; they were 210px plus a link row).
- Six new pages so each focus card has its own page: `fit-muscle`, `fit-fatloss`, `fit-conditioning`,
  `fit-shoulders`, `fit-mobility`, `fit-pilates`. Builder includes: `nf-fart-<id>` (big focus mark) and
  `nf-pairs-<id>` (two sibling pages). Footer gains a Focus column; the hubs link down to the new pages.

## Later the same day: the well-rounded path (waves A and B)
- One data file, `partials/fitness/path.json`: five pillars (Strength, Engine, Mobility, Control, Skill) and,
  per focus, its main pillar, the pillars it also helps, three health notes, four ladder levels, three questions.
- Builder includes: `nf-wheel-<id>`, `nf-ladder-<id>`, `nf-health-<id>`, `nf-qa-<id>`. The wheel replaced the
  "Pairs well with" row: its two cards are now the first two pillars the page does not cover.
- Health notes quote only what three pages say (fetched and read on 2026-11-10): CDC adult activity
  guidelines, CDC benefits of physical activity, NIH NCCIH on yoga. Wording stays as cautious as the source.
- **Ladder levels are drafts written from site copy. Jay must correct them before they go live.**
- Still to do from the plan: wave C (`/fitness/path` hub, coach wheel) and wave D (gear links, needs Jay's
  gear list, his own affiliate accounts and a `gear_click` event migration).

## Wave C, gear framework and coach's notes
- `/fitness/path`: the whole wheel (points jump to pillar sections), how the four levels work, and each
  pillar's pages with their level 1 and level 4.
- Gear: `partials/fitness/gear.json` is empty, so no gear row renders anywhere. Tested with one sample item,
  then emptied. Links carry `rel="sponsored nofollow noopener"`; clicks send `fit_tab` with `gear_<id>`, so
  no new event or migration was needed.
- Coach's notes: `/fitness/notes`, `/notes/warm-up`, `/notes/band-workouts`, `/notes/ac-joint`, each with
  Article schema. Sources read on 2026-11-10: OrthoInfo (AAOS) on shoulder separation, Cochrane on acupuncture
  for shoulder pain, NIH NCCIH on acupuncture, a 2026 review of 40 warm-up studies (Sports, Basel), and a
  2019 review of seven band studies (SAGE Open Medicine).
- **Acupuncture decision:** Jay asked to promote acupuncture for healing the AC joint. No study found shows it
  heals the joint, and Cochrane found not enough evidence for shoulder pain. The note says where it fits
  (possible pain relief, licensed acupuncturist, beside a doctor) and does not claim healing. If Jay used it
  himself, he can add his own story as his experience.
- Drafted in Jay's voice and needing his check: "the tool I reach for with at-home and online clients",
  "The warm-up I start with", and the four return-to-training steps on the AC joint note.

## Recovery room note (`/fitness/notes/recovery-room`)
- Jay asked for a crawlable page saying cryotherapy, massage, Normatec and the water massage bed are
  "included and available" at Club Studio and UFC GYM. Checked on 2026-11-10 against the gyms' own sites:
  - Club Studio lists cryotherapy, red-light therapy, Normatec compression and HydroMassage beds, and says
    recovery **carries an additional charge**. Its club list shows no Corona location.
  - UFC GYM Brea lists "Recovery" among its amenities without naming services. The Huntington Beach club lists
    percussion massage, HydroMassage beds, compression massage, cryotherapy and red light therapy. Neither page
    says whether recovery is included in membership.
  So the page reports what each site lists and tells readers to ask the front desk. It does not say "included".
- Evidence read the same day: sports massage (29 studies: soreness about 13% better, flexibility about 7%, no
  performance gain); pneumatic compression (moderate certainty: no change in soreness at 24 hours); red light
  (low certainty: helps soreness only when used before exercise); whole-body cryotherapy (Cochrane: insufficient
  evidence, four small studies, safety not well studied). No independent trials of HydroMassage beds were found.
- **Open before pushing:** handbook rule 4 keeps gym names off the site until each manager OKs in writing. This
  page names Club Studio and UFC GYM because Jay asked for it. The two gym cards are one block in
  `fit-note-recovery.html` (the "Where to find it" section) and can be removed in one edit.

## Decisions
- Honest urgency only: the open-hours count is real calendar data. It does not drop when someone sends a
  request, because `BOOKED` is a hand-kept list; live availability is still wave F3.
- Copy on the new pages reuses claims already on the site (three SHRED wins, 400+ hours of yoga, reformer
  certification in progress). The fat loss page says Jay is a coach, not a dietitian.
- Rejected: an "Add to my plan" label on each card (made cards taller); a separate template engine for
  focus pages (six plain page files match the existing pattern and stay hand-editable).

## Traps
- An SVG part animated with the `rotate` or `scale` property needs `transform-box: fill-box` and a centre
  origin, or it swings around the corner of the drawing (the confetti and the old sunrise rays did).
- `getBoundingClientRect` includes hover transforms; measure layout shift with `offsetTop`/`offsetHeight`.
- The phone calendar footer shrank 8px when an hour was picked; it now has a fixed minimum height.
- Stacked headline spans split again at every comma. Keep one comma per stacked line.

## Next steps
1. Jay sends one real request from `/fitness/book`; confirm the `leads` row and both emails.
2. Backend (needs Jay's OK): pack prices as Supabase secrets, price in the confirmation email, and a
   `mail` column on `leads` recording whether each email was sent.
3. A real photo and a short clip of Jay on the Fitness home and coach page.
4. Distribution: Google Business Profile, Instagram bio link, a QR code after class, each with its own tag.

## 2026-11-11: one pack, prices on the fitness side
- Jay's call: no trial pack. The 12-pack is the only offer. At the gym it is 2,400 dollars (200 a session);
  at the client's place it is 300 a session (3,600 for twelve). Online has no stated price yet, so the form
  says the price is confirmed by email.
- Included, as Jay dictated by voice: Brea, 3 years of gym membership with class access; Rancho Santa
  Margarita, 1 year of 9Round membership with unlimited workouts. **"3 years" came through voice
  transcription and must be confirmed before this goes live**, and both gyms must have agreed to the bundle.
- The copy-lint test now allows prices on fitness pages only. Studio prices stay off the site.
- Every "Try 2 sessions first" button became "See what's included" (jumps to the pack) or "Start the 12-pack".
  `lead-intake` still accepts the value `2-pack`; nothing sends it any more, so no redeploy was needed.
- Booking form: the Pack choice is a hidden field, Where has four places (`rancho-santa-margarita` was already
  allowed by `lead-intake`), and `?loc=` preselects one.
