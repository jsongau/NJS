# Quest language pack

Naming, button verbs and claim-state copy for The Jar Club board. From a live-ops
quest designer pass, 8 Aug 2026.

## The principle

A quest name must state the action or the payoff. Flavour is a bonus, never a
prerequisite. If a member has to read the line underneath to know what the name means,
the name is doing zero work and the card gets read twice.

Appalachian dialect stays only where the word is self-evident in context. "Read the
Bead" is judging proof by the bubbles. Gorgeous, opaque, and it references alcohol
strength on a card that resets daily.

## Renames

| Was | Now | Button | Why |
|---|---|---|---|
| Peckin' the Cap | Walk In, Get Paid | Check in now | Payoff is the name. Bottle-opening imagery is also the wrong daily signal for a spirits brand. |
| First Light | First One In | Be first in | Same poetry, but now the race is legible. |
| Read the Bead | Scan a Jar Lid | Scan the lid | Opaque, and it references proof. |
| Mash Bill | How Shine Is Made | Take the quiz | Trade jargon. "Shine" is the flavour word that survives. |
| Cut School | Learn the Cuts | Start part one | "Cut School" reads as skipping class. Backwards for a four-part lesson. |
| Found It, Not Found It | Shelf Check | Shoot the shelf | Two verbs and a negation in one title. |
| Stump Hole | Find the Hidden Mark | Hunt it down | A stash spot nobody outside the hollow knows. The hunt is the fun part. |
| Keep the Fire | Keep the Fire Lit | Keep it lit | One word makes it unmistakably a streak. Best original on the board. |
| Set Your Holler | Pick Your Home Spot | Pick your spot | **Fatal collision:** The Holler is also a venue name, so this read as "select The Holler." |
| Cut a Shine | Catch the Live Set | Catch a set | "Cut a shine" means to dance. |
| Boards and Bags | Cornhole Bracket | Enter the bracket | The game name does the work. |
| Pass the Jar | Bring a Friend In | Send your link | Literally means share the moonshine around. Wrong verb twice over. |
| Ridge Runner | Hit Every Location | Start the run | **Keep Ridge Runner as the badge you earn.** Quest states the action, reward keeps the romance. |
| Redd Up | Join a Cleanup Day | Find a cleanup | Means tidy up, and it is more Pittsburgh than Tennessee. |
| Airish | Winter Check In | Brave the cold | Means chilly. Total opacity on a 300 point card. |
| Delivery Receipt | Upload Your Receipt | Upload receipt | Noun with no verb. |
| Second Shelf | Show Your Home Bar | Shoot the jar | Bartender shorthand for mid placement. Members read it as an insult. |
| Bring the Round | Bring Three Friends | Send three links | Means buy everyone a drink. Hard no on an alcohol program. |

**Kept unchanged:** Tasting Note, Flavor Profile, Fill the Jar, Your Batch Day, Hooch
Hop, Behind the Stills. Each is the literal artifact, pre-taught by the page, or a
proper noun with real-world equity.

## Zones

Keep The Run / The Batch / The Barrel. Real production stages, they escalate the way
the time horizons do, and the wax seal is the right metaphor for locking a set.

| Zone | Unsealed | Sealed |
|---|---|---|
| The Run | Seal the run for 150 more. | Run sealed. 150 went in. |
| The Batch | Seal the batch for 400 more. | Batch sealed. 400 went in. |
| The Barrel | Fill the barrel for 1,000 more. | Barrel filled. 1,000 went in. |

Never show a bonus without showing how many are left.

## Claim state

The highest-emotion moment on the page, and it was whispering.

- **Claimable button:** `Jar the 400`. "Jar" is the brand's own word, appears nowhere
  else in the UI, and carries the number.
- **On completion, unbanked:** `Done. Your 400 is sitting on the card.` The old line
  gave permission to leave. This one says the money is exposed.
- **On claim:** `400 in. You are 220 from your $15.` Points mean nothing alone. Every
  claim ends with distance to redemption. On crossing: `400 in. Your $15 is ready.`
- **Capped:** `That tips you over 6,000`, not `Over your 6,000`, which blamed the member.

## Compliance

**Cut Sittin' a Spell.** 300 points for staying 90 minutes or longer at a drinking
venue. The description tries to inoculate itself with "dwell is measured by taps, not
by anything you order," which does not help. You are paying people to stay in a bar
longer.

**Replacement, same slot, same 300:** **Name Your Driver**, button `Log your ride`. Log
a designated driver or a rideshare at check-in. On brand, fills the hole, and it is the
one quest a state regulator would enjoy reading.

Still open: Upload Your Receipt at 3,000 repeatable is half the monthly ceiling for
proof of an alcohol purchase. First One In rewards racing to a bar door daily.

## The trap

Five lists match quests by name string: `QUESTS[].n`, `DAILY_POOL`, `WEEK_SET`,
`QLINE`, and a hardcoded `'Delivery Receipt'` in `qZone()`. Both `qToday()` and
`qZone()` end in `.filter(Boolean)`, so a stale name does not throw. **The card just
quietly stops existing.** Rename in one place and the quest vanishes with no error.

Button verbs also needed a per-quest map. `QVERB` was keyed by category, which is why
nine different quests all said "Go look."
