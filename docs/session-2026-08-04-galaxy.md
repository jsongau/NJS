# Session 2026-08-04 - /galaxy confirmation-page pass

Follow-up to the 2026-08-03 launch. Changes are on the post-entry confirmation screen plus the store cross-nav.

## What shipped
- Store cross-nav fixed to absolute /galaxy paths (relative ../ links broke under cleanUrls + trailingSlash:false). Commit 62a8b9b.
- Buy/upsell panel and modal: single season seat from $833 (prize stays the two-seat pair). Kept the two-free-friend-tickets perk.
- Winners floater draw date computed from the same "next Sunday 20:00" logic as the hero, so the two never diverge.
- Referral: one friend, both double entries. Removed scarf, free-ticket tiers, two-friend ladder. Featured share buttons and link. Visible gold Copied state + high-contrast toast.
- Gift modal: purchase-verification flow (name + season-ticket number) ending in a glitter-pop celebration on a custom animated LA Galaxy ticket; friend's free single-match ticket redeemable any home match this season, no expiration.

## Decisions
- Single seat applies only to buy/upsell context; prize context (the pair you win) intentionally stays two seats.
- Draw date derived, not duplicated (single source of truth) to prevent the Aug 20 vs Aug 9 drift recurring.
- Referral reward simplified from tiered free tickets/scarf to one double-entries incentive (cleaner, two-sided, no dark pattern).
- Gift verification doubles as a fraud gate (only verified buyers gift) and first-party data capture (buyer name + ticket number).

## Traps
- Cloud push does not work here (sandbox GitHub token is read-only on the repo). Deploys go out via native git on the Mac. device_bash cannot unlink, so git writes over the bridge leave stale locks; place files with device_commit_files, author docs via device_bash heredoc, commit + push natively. Always fetch origin before building a deploy (the bridge git view can read stale).

## Next
- Measurement layer: Supabase table for entries + gift-sends, GA4 + Meta pixel on enter / calc_use / referral_join / gift_verify_submit, UTM passthrough. Schema + event map to approve before building.
