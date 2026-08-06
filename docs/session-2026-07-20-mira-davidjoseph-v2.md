# Session 2026-07-20 (v2) — Mira /davidjoseph: reskin + commentary + 4th store (started)

Supersedes session-2026-07-20-mira-davidjoseph.md (v1 covered the reskin only).

## Summary
Reskinned the entire Ritual growth funnel into a fictional prenatal brand **Mira** and set it up at **/davidjoseph** as a work sample for the **David Joseph & Company Growth Lead** application. Then upgraded the creator-store commentary and began a 4th creator store (Priya Rao, RD). The 4th store is **not finished** — state captured below.

## What changed
1. **Mira reskin (5 pages)** — new `davidjoseph/` folder mirroring `ritual/`: giveaway funnel, Partner Circle hub, ava/lex/maya creator stores, + 9 original SVG assets (logo, favicon, bottle-prenatal/womens/glow, capsules, sample-pack, og.svg/png). All ritual.com dependencies removed; navy/yellow -> aubergine #4A2E4D / rose #E07A9F; wordmark + wax-seal R->M; Made Traceable(R) -> Fully Traceable; Essential* -> Mira*; OG/canonical/favicon/theme-color added. Reskin driven by an idempotent codemod `reskin.py` (cloud session).
2. **Bug fix** — "Essential for Men" had leaked through the reskin on all pages -> now "Mira Daily for Men" (verified 0 left).
3. **Store commentary upgrade** — the 3 creator stores' "Nathan's commentary" (the round "N" avatar) was a paged deck; upgraded to the funnel's **scroll-synced, section-anchored** system with a rose **spotlight ring**. Notes anchored to hero/edit/routine/reviews/works via data-note, + two meta notes (model, build); Prev/Next; a throttled scroll listener with nLock (so manual step doesn't fight scroll-sync). Driven by `augment_commentary.py`. Verified: natural-scroll tracking exact on all 3, cart/PDP intact, 0 console errors, 10/10 renders (5 pages x desktop/mobile) clean, 0 broken images.
4. **4th store: Priya Rao, RD (STARTED, NOT FINISHED)** — a prenatal **dietitian / expert** store (adds the authority/trust angle beyond the 3 lifestyle creators). Content generated and salvaged to cloud `/root/render/priya_content.json`: full copy pack (title/meta/hero/why/honest/footer/own-product "The Prenatal Nutrition Guide"), a nutrient-timing routine ("How I time my day" — morning prenatal+choline / midday iron+vitC away from calcium / evening DHA+magnesium), and 3 expert-voice patient reviews. Voice: calm, evidence-led, humble (RD). Code PRIYA10. Planned theme: sage/slate (clinical-calm).
   - **NOT done for Priya:** theme CSS tokens, Nathan commentary notes, product rationales, the Nutrition Guide SVG, assembly onto Maya's engine (clone maya build + inject via a priya.py transform), wiring `/davidjoseph/partners/priya/` into the concept-switcher nav on all 6 pages + a card in the Partner Circle hub, render/verify.

## Deploy state (IMPORTANT)
- Repo **jsongau/NJS** (main, remote confirmed https://github.com/jsongau/NJS.git) -> Vercel -> nathanjsong.com/davidjoseph (vercel.json cleanUrls).
- The reskinned `davidjoseph/` + v1 session doc were extracted into the repo working tree and `git add`ed, but the **bridge git commit was BLOCKED** by a stale `.git/index.lock` the bridge VM cannot delete. Paste-safe Mac push commands were provided (rm the two .git locks; git add davidjoseph docs; commit; push origin main). **Push status: run by Jay on his Mac (unconfirmed here).**
- **The repo copy PRE-DATES the commentary upgrade + the Essential-for-Men fix.** Those live only in the cloud build `/root/build/davidjoseph`. **Re-sync required before the live push** (also delivered as a zip this session).

## Decisions (made / rejected)
- Prenatal reskin, NOT an AI-image-tool rebuild — fast + trademark-safe; domain bridge via framing + AI-assisted build speed. (AI-vertical funnel = full rebuild, deferred.)
- Brand "Mira" (Jay's pick). NOTE: **Mira Fertility is a real company**; this is a clearly-disclaimed fictional concept. Rename via the single BRAND var in reskin.py for max originality.
- Commentary = scroll-synced per-section (funnel parity), not a new pattern.
- 4th store = expert (RD) for range/authority, not another lifestyle creator (Jay's pick).
- Kept each creator's own accent (Ava coral, Lex dark-lime, Maya terracotta) as intentional "in their own voice" branding.

## Traps discovered
- Yellow hides in THREE encodings: #hex, rgba(245,197,24 / 255,214,1), and URL-encoded %23F5C518 in SVG marker data-URIs. Miss one -> a highlight/glow stays yellow.
- Ritual wordmark is a vector PATH (d="M28.9111..."), invisible to text search; also appears HTML-escaped inside a serialized concept-nav template. Store nav logos put class BEFORE viewBox (regex must be attribute-order agnostic). Wax-seal monogram is a <text>R</text>.
- Store commentary scroll-sync: the stores lazy-reveal content, so a single big programmatic scrollTo gets capped by the not-yet-expanded page height (a TEST artifact). Natural incremental scrolling tracks correctly.
- Bridge git: can stage but leaves an undeletable `.git/index.lock` + `tmp_obj_*` files; **commit + push must run from Jay's Mac** after `rm -f .git/index.lock .git/HEAD.lock`.

## Exact next steps
1. **Re-sync** the cloud build (`/root/build/davidjoseph`, which has the commentary + Essential-for-Men fix) into the repo, then push (Mac).
2. **Finish Priya**: write theme (sage/slate) + Nathan commentary (7 notes) + product rationales + the Nutrition Guide SVG; assemble onto Maya's engine; wire the nav switcher (6 pages) + hub roster card; render/verify. Salvaged content is in `/root/render/priya_content.json`.
3. **Backend (highest leverage):** Supabase `mira_entries` table + `capture-entry` edge fn (email, source, ab_variant, quiz, ts, ip-hash) so the funnel produces real data.
4. **/davidjoseph/strategy page** — the funnel concept bar's "Read my growth strategy" link is currently inert; a one-page strategy writeup is the strongest single asset for this application.

## Stack
Static single-file HTML/CSS/JS, no build step; Vercel (git jsongau/NJS); Supabase for backend; design-token theming; inline SVG over raster.

## Build artifacts (cloud session, not in repo)
`reskin.py`, `augment_commentary.py`, `priya_content.json`, render/click-test harness — under the working session `/root/render`. Regenerate the build with reskin.py (per-page) + augment_commentary.py (per store).
