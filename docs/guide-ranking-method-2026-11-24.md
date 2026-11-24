# Guide ranking method and research queue (draft, 2026-11-24)

Status: draft for Jay's approval. Nothing here is live. The ranked preview (yoga guide v4) uses a placeholder order.

## Decisions proposed
- The list cannot be bought. A sponsor is labeled and sits outside the list. Replaces "no paid placements".
- Chains join the ranking as one entry each. One room per chain carries the rank ("my pick"); the others show "Same membership". Reverses the current rule in CLAUDE.md (chains map only, never ranked). Needs Jay's yes.
- Honorable mentions: studios applied or visited but not yet in the list. Applications go through `lead-intake` with a new `studio` door (plan first).
- Taxonomy: Striking > Boxing, Kickboxing, Muay Thai, held in one file read by nav, map, guides, focus list and Combo Lab. URLs do not move.

## Score, 100 points
Coach score, 60, from Jay's own visit:
- Teaching, 20: cues you can follow, hands-on help when asked.
- Safe progress, 15: easier and harder versions offered unprompted.
- First-timer welcome, 10.
- Room and equipment, 10 (Pilates: reformer upkeep, class size).
- Straight pricing, 5: posted prices, no desk pressure.

Desk score, 40, from published facts with a source link:
- Teacher credentials listed, 10.
- Beginner class on the schedule, 8.
- Years open, 6.
- Prices posted, 6.
- Schedule breadth, 5.
- Intro offer, 5.

Rules: no studio enters a ranked list without at least one visit. Desk score only orders the visit queue. Chains are scored on the picked room. Gyms Jay coaches at stay off. Any free class is disclosed on the row. Re-scored yearly; the edition year shows on the seal.

## Launch size
Twenty studios at one visit each is twenty classes. Recommended: launch "The OC 10" first, grow to the SoCal 20.

## Candidates to check (not verified open, not in guides.json)
Yoga: Y7 (Melrose), Black Dog Yoga (Sherman Oaks), Yoga Nest Venice, In Yoga Center (San Fernando Valley), Yogaraj (West LA), Kinship Yoga (Los Angeles), Veda Yoga (La Cienega), Caffe Yoga (Tustin), The Sanctuary Wellness Center and Yoga Studio (Tustin), Fit Rituals Studio (Claremont), Pure Studio (Canyon Lake).
Reformer Pilates: Speir Pilates (Newport Beach), The Body Collective (Costa Mesa), The Beachouse Studio (Newport Beach), PlankHaus (Santa Monica), CirKel Fitness (Tustin), FIT with LIT (Newport Beach).
Megaformer, not reformer, keep separate: Lagree Ology (Arcadia), Breeze Lagree (Costa Mesa), KV Lagree (Porter Ranch), Core Precision (Yorba Linda).
Pilates chains: none in chains.json yet.

Found on: Time Out Los Angeles (article dated 2016, so open status must be checked) and ClassPass member-review lists for LA, OC and the Inland Empire (reviews Jan 2025 to Feb 2026). Names only were taken; no ratings copied.

## Chain facts read 2026-11-24
- CorePower: free week for new students, unlimited studio classes, valid in all studios, one per person (corepoweryoga.com/free-week). All Access: any studio, price varies by studio (membership-benefits page).
- YogaSix: six signature classes listed; no single intro offer or cross-studio rule on its first-timers page.

## Traps
- A nowrap chip row inside a CSS grid cell blows the cell wider than the phone. Fix: `min-width:0` on the grid children.
- The site has a `.top` class; do not reuse it for state.
- `.nf-rk.ranked .nf-rk-row` is three classes deep; overrides need the same depth.
