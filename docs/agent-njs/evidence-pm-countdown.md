# PM Countdown: what it proves Nathan can build

Studied by Agent NJS on 2026-11-01 from the local repo `/Users/kytlegacy/Projects/pm-countdown` (GitHub
`jsongau/pm-countdown`, private; site https://pmcountdown.com). Read-only study; repo figures as of its last commit,
2026-10-31. Agent records move constantly: the live numbers are in PM Countdown's Supabase.

## The one-paragraph version

In 40 working days (first commit 2026-09-19), Nathan designed and shipped a live prediction-market platform where
more than a dozen rule-based AI trading agents read Kalshi markets every 5 to 30 seconds, trade on paper and with real
money, grade themselves in public, and feed a nightly review ("the Brain") that finds what is losing money and proposes
tested fixes for his approval. He built it by directing AI coding agents with a persistent memory system so work carries
across sessions and accounts: 1,771 commits, 170 database migrations, 142 test files, 179 design and session docs.

## Scale at a glance

| Measure | Figure | Where to verify |
|---|---|---|
| Commits / working days | 1,771 / 40 (2026-09-19 to 2026-10-31) | `git log` |
| Database migrations | 170 | `supabase/migrations/` |
| Scheduled jobs in the database | 39 migrations define `pg_cron` schedules; agent ticks every 5, 15 or 30 s | `grep cron.schedule supabase/migrations` |
| Server endpoints | 52 Vercel functions | `api/` |
| Build and data tools | 245 Python scripts | `tools/` |
| Supabase edge functions | 7 (study, replay, backtest, history archive, nightly export) | `supabase/functions/` |
| Tests | 142 test files, plus CI site checks | `tests/`, `.github/workflows/site-checks.yml` |
| GitHub Actions schedules | 9 workflows (picks, settlement, archive, hubs, whale tracker, checks) | `.github/workflows/` |
| Agent and persona memory files | 14 in the repo root | `*-MEMORY.md` |
| Design, decision and session docs | 179 | `docs/` |

## Capabilities, with evidence

### 1. Autonomous agents that run on a schedule and trade through an API
- Agents cover Bitcoin, Ethereum, XRP, Dogecoin, BNB, Solana, copper, FX, NFL player props and UFC. Each one is a
  scheduled job that reads the market, decides, places or skips an order, and logs every read.
- The schedule lives in Postgres (`pg_cron` calling `net.http_post` into the site's `/api/lolo/*` endpoints), so the
  agents keep running with no laptop open. Example: `cron.schedule('lolo-tick', '30 seconds', …)`.
- Real orders go through Kalshi's signed API (`api/lolo/_kalshi.js`, `api/lolo/tick.js`).
- **Consulting translation:** any business process that needs "watch this feed, decide, act, log it" on a timer, such as
  inventory reorders, lead routing, price monitoring or claim follow-ups.

### 2. Models that are tested honestly before they are trusted
- LoLo's core rule is a transparent probability model: with T minutes left and price `gap` dollars from the line,
  p(Up) = Phi(gap / (sigma * sqrt(T))). Source: header of `api/lolo/_brain.js`.
- A study of 2,886 fifteen-minute windows showed that adding a drift term and the usual indicators (MACD, RSI, EMAs, VWAP,
  Bollinger) made calls worse out of sample, so they were dropped from the decision. They are still logged for review.
  Source: `docs/lolo/2026-09-27-decision-rule-v2.md`, `supabase/functions/lolo-study/` (logistic fit trained on the
  older 70% of days, tested on the newest 30%).
- Every call is scored against the market's own price at the same second (Brier score), and a public calibration view
  compares "what he said" with "what happened" by confidence band: `supabase/migrations/20260927_lolo_calibration.sql`.
- **Consulting translation:** knowing when a model is better than a simple baseline and proving it on data it never saw,
  which is the skill most "AI" vendors skip.

### 3. A learning loop with a human approval gate ("the Brain")
- Every morning a database job grades each agent's last 14 days against everything the chart showed at each buy. A
  setting is flagged a LEAK or an EDGE only when it holds in both weeks with enough tickets (15+, 5+ per week).
  Source: `supabase/migrations/20261022k_brain.sql`.
- Wave 2 runs what-if studies on every agent's real tickets (take half profit at +10/15/20c, wait for a 3c pullback).
  Source: `20261022l_brain_wave2.sql`.
- Wave 3 turns findings into rule proposals, replays each on real tickets with a significance bar that is stricter for
  adding risk than for cutting it, shelves proposals that fail two nights running, and rechecks shipped rules afterwards.
  A proposal only ships when Jay says "approve". Source: `20261022m_brain_wave3.sql`, `docs/2026-10-22-agent-brain.md`.
- Every change is a versioned patch with notes (LoLo went from 1.0 to 1.09x): `api/lolo/_version.js`,
  `data/lolo/patches.json`.
- **Consulting translation:** this is the answer to "can your AI get smarter over time?" Yes, through a measured,
  auditable loop where a human signs off on every change. Most clients need exactly that.

### 4. Risk controls on real money
- Bankrolls, size caps, stops, a "protect the day" mode once a profit level is reached, a price floor on protective sells,
  and per-agent switches. Gru (XRP) and Mark (BNB) were switched off real money on 2026-10-20 after losses, while their
  paper records kept running. Sources: `api/lolo/_brain.js` version notes, `GRU-MEMORY.md`, `MARK-MEMORY.md`.

### 5. Data engineering and security on Supabase
- 170 migrations: append-only trade ledgers, a nightly Kalshi market-history archive with a queue and pause/resume
  (`kalshi-history-*` jobs), nightly hub snapshots, read-only public views with `security_invoker`, and row-level
  security with public access revoked from writable tables (`20261007_revoke_public_view_writes.sql`).
- Secrets stay in Supabase Vault; edge functions check a shared secret, not a browser key (`lolo-study/README.md`).
- Intellectual-property protection: the trading rule lives in `api/`, which Vercel never serves as a file, and the
  detailed patch notes sit in a table that opens only for a bcrypt-hashed password with rate limiting
  (`20260928_lolo_dev_notes.sql`).

### 6. Running AI coding agents like a team
- A named build team (Ross the architect, Mary on UX, Gordon on revenue, Igor and Mojo on SEO, Jason on data checks)
  plus trading agents, each with a memory file that every session reads first and updates after.
- A handoff kit lets any new Claude session, on any account, pick up the work: `START-HERE.md`, `CLAUDE.md`,
  `docs/handoff/` (how Jay works, open work, shipping steps, team roster, memory rules).
- Hard rules every agent must follow before a page ships: no fake data, a copy lint, accessibility minimums, and
  responsible-gambling, 21+ and FTC disclosure requirements (`ROSS-ARCHITECTURE.md` section 2).
- **Consulting translation:** setting up a small company's AI agents so they keep context, follow house rules and hand
  work to each other, which is the problem most teams hit in their first month of using AI seriously.

### 7. Product and business
- Memberships and checkout through Whop, an email list, sponsor inquiries and pricing pages; a stated revenue order of
  sponsorships first, memberships second, disclosed referral links third (`ROSS-ARCHITECTURE.md` section 1).
- Trust is treated as the product: picks lock before the event and are graded in public, misses included.

## Honest limits (say these when asked, and before anyone asks about returns)

- **The trading is not proven profitable.** Agent Blend #1 (PM1) was −$657.40 after fees from 2026-10-18 to
  2026-11-01 9 AM PT (+$324 before fees), from PM Countdown's own feed. Gru lost $58 and Mark $16 of real money before
  being switched off. The engineering is the credential, not the P&L.
- **Some decisions were lessons.** On 2026-10-02 LoLo's sizing was raised three times in one day to "get back in the
  green" (versions 1.09 to 1.09b). Raising size to recover losses is a known mistake; the later "protect the day" rule
  and the Brain's stricter bar for adding risk are the correction.
- **Process scars.** On 2026-10-22 a commit from one session rolled back other sessions' work and had to be restored;
  the local repo and GitHub later drifted apart (28 ahead, 47 behind on 2026-11-01). Two sessions on the same files is
  the cause, and the handoff kit's shipping rules are the fix still being tightened.
- **Not everything shipped.** Nelly (copper) was built on 2026-10-09 but never applied. Parlay auto-grading broke on a
  missing `market_ticker` field and is graded by hand until fixed.
- **AI wrote most of the code.** Nathan designed, directed, reviewed and approved it. Say so plainly.

## Answers for prospects

**"Can you build us an automated trading bot?"**
Nathan has built and run more than a dozen, on paper and with real money, through Kalshi's API, with schedules, risk
limits, kill switches and a public ledger. He will build the system and the testing around it. He will not promise
returns, and his own agents show why: a well-engineered bot can still lose money, so the controls matter as much as the
strategy.

**"Do your agents learn?"**
Yes, in the way you can audit. Every morning a review grades each agent's trades, finds settings that lose or win money
consistently across two weeks, replays a proposed fix on real past trades, and puts it in front of a human to approve.
Each approved change ships as a numbered version with notes. Nothing changes a live order without that sign-off.

**"Why not just use machine learning?"**
He tested it. A logistic model and the standard indicators did not beat a simple, explainable probability rule on data
they had not seen, so the simple rule stayed. He uses the most complex tool the data justifies, and no more.

**"Did you write all this yourself?"**
He designed the system, set the rules, made every product and risk decision, and approved every change. AI coding agents
wrote most of the code under that direction, organized as a team with memory files and a handoff kit so the work stays
consistent. Clients get the same setup.

**"What would you do for a business like ours?"**
Three things he has already done here: put a recurring decision on a schedule with logging and limits; add a review loop
that measures results and proposes improvements for a human to approve; and set up the company's AI agents with shared
memory and house rules so they stay reliable over months, not days.

**"How much did it make?"**
Give the dated figures above, real money and paper separately, and the point that the platform, not the P&L, is what he
offers clients.
