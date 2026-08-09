# Ole Smoky / The Jar Club — 8 Aug 2026 (third session)

Quest board rebuild, badge codex, premium tier, featured coupon. All in
`olesmoky/index.html`. Shipped as `olesmoky-jarclub-v87.html`.

Specs written this session: `docs/quest-board-spec.md`, `docs/quest-language.md`.

---

## The board

Six filter tabs over thirty identical cards became three zones by time horizon.
The Run (Today, 3), The Batch (This week, 4), The Barrel (This season, 3 plus one
locked). Ten or eleven cards visible, the other twenty in a collapsed ledger rendered
as rows, not cards.

Filtering is a librarian's tool. Nobody arrives wanting to browse thirty items by
effort. Every major F2P game shows 1 to 4 quests at a time; none show thirty.

**Claim to collect** is the change that makes it feel like a game. `S.quests[name]` is
now `0 | 1 | 2`; points post on the 1 to 2 transition, never on 0 to 1. A finished
quest parks with a gold border and the point value growing, and needs a second press.
Zeigarnik: an interrupted task holds attention that a completed one releases.

Set bonuses at three horizons, 150 / 400 / 1,000. The daily three are drawn
deterministically from the date so the board is stable across a refresh.

### The daily pool is a compliance control

`DAILY_POOL` is a hard-coded allowlist, not a filter over `QUESTS`. A daily-resetting
slot creates an implied daily cadence, so nothing that resets daily may be tied to
consumption, purchase or presence at a bar. It is written as a named constant with
that comment, because the next person to touch it will otherwise point it at
everything.

---

## Naming

Quest names now state the action. Flavour is a bonus, never a prerequisite. If a
member has to read the line underneath to learn what the name means, the name does
zero work and the card gets read twice.

The one that mattered most: **Set Your Holler** was a fatal collision, because The
Holler is also a venue name, so it read as "select The Holler." Now Pick Your Home
Spot. Full table in `quest-language.md`.

**Ridge Runner survives as the badge you earn**; the quest is Hit Every Location.
Quest states the action, reward keeps the romance.

**Cut on compliance: Sittin' a Spell**, 300 points for staying 90 minutes or more at a
drinking venue. Replaced with **Name Your Driver**, log a designated driver or a
rideshare at check-in, same points, same slot.

Claim copy: `Jar the 400` on the button, `Done. Your 400 is sitting on the card` when
unbanked, `400 in. You are 220 from your $15` on claim. Points mean nothing alone.

---

## The badge codex

28 badges down to 12 in four chapters. Before this, `S.badges` was written once by a
seeder and never again, so all 28 were painted on and none were earnable. A
`syncBadges()` now derives the book from real state on every paint and is hooked into
the Hooch Hop stamps, the streak, referrals and redemptions.

Cut: three that paid for time at a bar or for turning up in a weather advisory, and
two carrying competitor trademarks. Devil's Cut is Jim Beam's, Whistle Pig is
WhistlePig Rye, and the latter was hiding in the quest list too.

---

## Premium Codex, 3,000 points

Not per-slot reward tiers. Two numbers change: referrals pay 1,000 instead of 500, and
three quests open that nobody else can claim. Upload Your Receipt pays 3,000, so the
unlock returns in a single claim.

The offer is stated as an arithmetic identity, not a benefit list: *you have 4,220,
unlock and you are at 1,220, claim the receipt and you are back to 4,220 with three
quests nobody else can see*. Loss aversion is why one-time unlocks fail; the round trip
ending on the starting number defuses it before it is felt.

Locked cards render visibly with a Codex tag. Hiding them removes the only reason to
buy it.

The receipt quest is the strongest item in the work sample: three-tier law means Ole
Smoky never sees who bought a bottle through Instacart, so a member uploading that
receipt hands over off-premise purchase proof the category cannot buy.

---

## Prize wall

Featured 20% coupon at 2,500, stacking with the $15 credit, applied to the subtotal
first. Drawn ticket with a real perforation; on hover the $15 card fans out from
behind it, the stub tears away with a torn-tooth edge, and the jar on the stub fills.
The animation is the proposition.

Also: pagination at 24 a page, the product count hidden until filtered, hover-zoom with
a drawn brass loupe on the lightbox rather than the thumbnail, and the sheets now
measure the sticky chrome once on open and lock the page behind them.

---

## Root causes worth keeping

**`:root` does nothing inside a shadow root.** The console and Prize Wall declared
their palette on `:root`, so every token was undefined and `color` fell back to
inherit, which on a `<button>` is the UA's near-black. That was the black-on-black.
`:host` fixed both at once.

**Class-name collisions, four of them.** `.stm` was a smoke wisp and a streak
milestone. `.slot` was a referral pip and a badge card. `.qc` and `.aline` had stale
duplicates. In every case the later declaration won and edits to the earlier one did
nothing, which is why several fixes appeared not to take.

**A later duplicate selector silently beats an earlier one, and this file has 45.**
After any CSS edit, assert the *last* declaration of the touched selector holds the new
value.

**Renaming quests touches five lists that match by name string** — `QUESTS[].n`,
`DAILY_POOL`, `WEEK_SET`, `QLINE`, and a hardcoded name in `qZone()`. Both lookups end
in `.filter(Boolean)`, so a stale name does not throw; the card just stops existing.
One name had an escaped apostrophe and slipped the first pass. There are now tests
asserting every key resolves.

**Write atomically, and validate every anchor before applying any edit.** A python
`open(p,'w')` killed mid-write truncated this file by 350KB once. A patch script that
exits on a missed anchor after applying earlier edits discards them silently; that
happened twice before the `subs()` helper was added.

---

## Verification

Seven jsdom suites, 201 assertions, all passing. Still no browser in the sandbox, so
everything is structural.

---

## Next

1. Ecommerce copy pass, to pair with the gamification one already done.
2. Prize wall: dead space beside Search, and a hottest-right-now rail.
3. Check-in modal: compact, easier to tap, reorder push when somebody is out.
4. The Hooch Hop section still needs replacing with something that moves the funnel.
5. Duplicate-selector build check, which would have caught four bugs this session.
