# Session 2026-08-03 - /galaxy (LA Galaxy sweepstakes funnel)

Work sample for the LA Galaxy "Senior Manager, Paid Media" role (Greenhouse 8582940002, Carson, $106,382 to $130,000). Reskin of the /pilates funnel into an LA Galaxy season-ticket sweepstakes, deployed to nathanjsong.com/galaxy.

## What shipped
- galaxy/index.html: the funnel. Page 1 enters to win the prize pair; Page 2 sells the season with a "skip the drawing, from $833" path. LA Galaxy navy/gold, real crest, dark theme default, four matchday videos wired to branded posters.
- galaxy/ava/index.html: "Ava's Matchday Edit", ivory and navy editorial creator store, code AVA10.
- galaxy/lex/index.html: "The Section with Lex", dark supporters-end store, code LEX10, $735 supporters season pass.
- All three self-contained single-file HTML/CSS/vanilla-JS, 0 console errors, concept disclaimers (not affiliated with or endorsed by LA Galaxy or AEG).

## Decisions made and rejected
- Prize is the highest tier (prime West Sideline pair), not the cheapest seat. Framed as two 2027-28 memberships worth $4,516, the $2,258 seats, one for you and one for a friend. Rejected the earlier "one winner, two seats" line: it read as confusing and buried the value.
- Pricing reconciled to live AXS: Standard seats $833 to $2,258; buy floor "from $833". Fieldside ($6,260) treated as a separate premium product outside this membership range, so excluded.
- Value calculator compares only single West Sideline tickets vs the West Sideline season, using a researched approx $120/match single estimate (prime sideline runs approx $75 to $200). Best value flips to the season at the approx 19-match crossover (25 x $120 is more than $2,258). Rejected the 3-card version (single / South Endline / West Sideline): it made the cheap seat the winner and undercut the prize.
- Kept v1 a clean client-side funnel. Measurement (Supabase capture + GA4/Meta pixel + UTM) deferred to a backend phase.

## Traps discovered
- device_bash cannot unlink files, so git write ops over the bridge leave a stale .git/index.lock it cannot remove. Fix: place files with device_commit_files, write docs via device_bash heredoc, run add/commit/push in the native macOS terminal, and mv any stale lock out of .git (rename works, delete does not).
- YouTube thumbnails fail with ERR_TUNNEL in the sandbox; matchday tiles use self-contained data-URI SVG posters that still open the real videos on click.
- The terminal was sitting in the wrestle repo during deploy; every git command uses git -C with the absolute njs-site path to avoid a cross-project push.

## Next steps
- Backend phase (the real leverage for a Paid Media sample): Supabase entries table, GA4 + Meta pixel on enter and calc_use, UTM passthrough for paid attribution. Approve schema and event map before building.
- Optional polish: force the hero H1 onto one visual line if wanted (currently one sentence, wraps on wide screens by design).

## Stack and approach
- One self-contained static HTML page per project under the njs-site repo root; Vercel git-integration deploy (push to main on jsongau/NJS); cleanUrls on; docs/ is vercelignored so notes never deploy as public pages.
