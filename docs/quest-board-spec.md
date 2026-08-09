# The Board — quest page rebuild spec

For `olesmoky/index.html`, the My Jar > Quests panel. Written 8 Aug 2026.

The old page was six filter tabs over a flat grid of thirty identical cards. Filtering
is a librarian's tool. A member does not arrive wanting to browse thirty items by
effort, they arrive wanting to be told what to do.

---

## 1. Architecture

**No tabs.** Four stacked zones in one scroll, grouped by time horizon, which is how
every F2P quest board that works is built. The labels come from the distillery process,
so the structure teaches the brand while it organises the page.

| Zone | Eyebrow | Heading | Cards | Reset |
|---|---|---|---|---|
| A | THE RUN | Today | 3 | daily |
| B | THE BATCH | This week | 4 | Monday |
| C | THE BARREL | This season | 3 | month end |
| D | THE LEDGER | Everything else | 0 until opened | never |

A still run produces a batch, a batch fills a barrel. Ten cards visible. The other
twenty live in a collapsed Ledger rendered as compact rows, not cards. **No search in
the Ledger** — adding one would re-import the browsing problem we just deleted.

### The daily pool is a compliance control

The three daily slots are drawn deterministically from a **hard-coded allowlist**, not
a filter over the whole array. A daily-resetting slot creates an implied daily cadence,
so nothing that resets daily may be linked to consumption, purchase, or presence at a
bar. Written as a named constant with that comment, because the next person to touch
this file will otherwise "improve" it by pointing the pool at everything.

---

## 2. Card anatomy

Four visual weights, not six competing elements.

- **Art tile** 44px, line-drawn mark per category. The mark carries the category so no
  text has to.
- **Points** the largest number on the card, 20px gold, top right. The old design had a
  12px bordered chip smaller than the title, which is backwards: points are the
  decision variable.
- **Title** 16px.
- **Instruction** one line, hard capped at 62 characters. Not truncated — rewritten.
- **Meta** cadence glyph plus word, and the draw entry where one is paid.
- **Step pips** only on multi-step quests. **No progress bar on single-step quests.** A
  bar that is always 0 or 100 percent is a lie about the mechanic.

### Cut

The description paragraph (25 to 40 words times thirty cards is why it read as a wall),
the bordered repeat pill, the generic "Do it" label, and the hover lift. Thirty cards
that all rise when touched is the template effect the client rejected.

### Relocate, do not delete

The CRM objective line moves behind a header toggle, **default off**. This is a work
sample for a CRM Director, so "Off premise purchase proof, the one thing three tier law
hides from the distillery" is the strongest hiring signal on the page. It is also
clutter to a member. A hiring manager finds it in one click. A member never sees it.

---

## 3. States

Six, and each one looks different.

| State | Treatment | Button |
|---|---|---|
| Available | default | verb-specific label |
| In progress | 3px inset bar, pips partly filled | Keep going |
| **Ready to claim** | the loud one: 1.5px gold border, warm wash, points grow 20 to 23px | Claim 400, solid gold, taller than every other button |
| Claimed | 50 percent, moss border, stamp impression stays printed | Claimed |
| Locked | darkest ground, dashed copper border, points not gold, CODEX tag | Opens with the Codex, whole card scrolls to the module |
| Capped | 50 percent, points struck | Over your 6,000 |

**Locked cards are visible from first paint.** Hiding them removes the only reason to
buy the Codex.

---

## 4. Gamification

1. **Scarcity of choice.** Ten visible, not thirty. Hick's Law: decision time scales
   with the log of the option count. Thirty equally weighted cards is a tax.
2. **Claim to collect.** Nothing auto-credits. Completion parks in `ready to claim` and
   needs a second deliberate press. Zeigarnik effect: an interrupted task holds
   attention a completed one releases. It also gives the animations a real trigger,
   which is the difference between motion that means something and motion that
   decorates. `S.quests[name]` becomes `0 | 1 | 2`; points post on 1 to 2, never 0 to 1.
3. **Set bonuses at three horizons.** 150 for the run, 400 for the batch, 1,000 for the
   barrel. Endowed progress: a three-slot set with two filled pulls far harder than two
   unrelated completions worth the same.
4. **Two scoreboards, no third currency.** Jar Points and Draw Entries, both already in
   the data. Do not add an XP bar. 5,000 points equals $15 is the clearest thing about
   this program and a parallel ladder muddies it.
5. **The on-deck hook.** After every claim, name one quest with the arithmetic to the
   nearest prize the member cannot yet afford. Goal gradient only fires when the
   distance is stated as a number. "See ways to earn" is not a number.

---

## 5. Motion

Diegetic only. Every animation depicts something real about the brand or the mechanic.

| Where | What | Trigger |
|---|---|---|
| Jar meter | liquid rises by the claimed share of 6,000, surface tilts against the fill, overshoots, settles | claim |
| Condenser mark | a droplet forms at a worm coil outlet and falls | runs only while a Today card is unclaimed, stops on completion |
| Stamp press | head descends, compresses, lifts, leaves a broken-edged impression | claim |
| Wax seal | pips fill, wax pours, die presses | final pip of a set |
| Barrel staves | one stave chars per seasonal claim, spreading upward | seasonal claim |
| Receipt feed | thermal paper ratchets down in seven steps | hover on the Delivery Receipt card |
| Lid unscrew | mason lid rotates, lifts, tilts off the rim | Codex purchase |
| Card intake | the three Codex quests slide out from behind the module | after the lid |
| Points transfer | the value detaches and arcs to the jar meter | claim |

### Do not animate

No glowing dots. No pulsing anything. No sheen or shimmer sweeps — a gradient sliding
across a button depicts nothing. No confetti or particles. No hover lift. No count-up
on load, because animating a number that did not change is a lie. **Nothing animates on
a locked or capped card** — motion is a reward signal and spending it on a state that
means "no" inverts it. Only one loop exists and it has a state condition that stops it.

---

## 6. The Codex module

Sits between This week and This season. That position is deliberate: above it the
member has just seen two zones of points they can reach, below it sit the three biggest
payouts, one of which is the Codex quest. The offer lands in the gap between "I can do
this" and "I want the big one."

**Not gold.** Gold on this page means points you can get. The Codex is what you spend
gold on and must not camouflage as a reward. Copper on the darkest ground.

The offer is stated as an **arithmetic identity, not a benefit list**:

> You have 4,220. Unlock and you are at 1,220. Claim Delivery Receipt and you are back
> to 4,220, with three quests nobody else can see.

Loss aversion is why one-time unlocks fail: 3,000 leaving is felt harder than 3,000
arriving. Showing the round trip in one sentence, ending on the number they started
with, neutralises the loss before it is felt. The referral doubling and the remaining
2,700 are then framed as what you keep after breaking even.

Disabled state never dead-ends. Below the disabled button: "Show me how to get there",
which scrolls to Today and flashes the highest-value card.

After purchase the module collapses to a 64px bar. It never disappears — a member who
paid 3,000 points should see the thing they bought every time they open the board.

---

## 7. Traps in this file

- `[hidden]` loses to any `display` rule. Claim states must be class-driven.
- `will-change` on a node created in the current frame delays its animation by a full
  compositing pass. The stamp impression and the on-deck strip are both created at
  claim time. Do not put `will-change` on either.
- A later duplicate selector silently beats an earlier one. This file has 45 of them.
  After any CSS edit, assert the **last** declaration of the touched selector holds the
  new value.
- Never delete CSS by line. Delete by rule boundary, then check brace balance.
- Write atomically. A python `open(p,'w')` killed mid-write truncated this file by
  350KB once already.
