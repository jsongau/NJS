# Session 2026-07-20 — Mira (David Joseph growth-funnel work sample)

## What shipped
Reskinned the entire Ritual growth funnel into a fictional generic prenatal brand, "Mira", published at /davidjoseph as a work sample for the David Joseph & Company Growth Lead application.

New folder `davidjoseph/` (mirrors `ritual/`):
- index.html — giveaway / sweepstakes funnel
- partners/index.html — Partner Circle hub
- partners/{ava,lex,maya}/index.html — three creator storefronts
- assets/ — 9 original SVGs (logo, favicon, bottle-prenatal, bottle-womens, bottle-glow, capsules, sample-pack, og.svg) + og.png

## How
- Idempotent codemod (reskin.py, kept in the working session, not the repo) transformed pristine copies of the ritual pages. Brand name is a single variable.
- Design-token palette: aubergine #4A2E4D, rose #E07A9F, blush #F3D9DE, cream #FBF7F4; sage/gold retained.
- Removed ALL ritual.com dependencies: 6 hot-linked product photos -> original SVGs; store links -> internal anchors; wordmark + wax-seal R -> M; "Made Traceable(R)" -> "Fully Traceable"; Essential* product names -> Mira*; NIH citations kept.
- Added OG/Twitter cards (none existed), canonical, favicon, theme-color per page.
- Creator-store catalog engine rerouted from ritual.com/Shopify CDNs to inline Mira SVGs (no network, no broken images).
- Fictional-brand disclaimers replace "not affiliated with Ritual"; footer credits reframed from the earlier Ritual application to the David Joseph Growth Lead role.

## Decisions
- Prenatal reskin (not an AI-image rebuild) per Jay: fast, trademark-safe; domain bridge carried by framing + AI-assisted build speed. AI-vertical funnel logged as deferred alternative.
- Kept each creator's own accent (Ava coral, etc.) as intentional "in their own voice" branding.
- Brand "Mira" chosen by Jay. NOTE: Mira Fertility is a real company; this is a clearly-disclaimed fictional concept. For maximum originality, rename via the single BRAND variable in reskin.py.

## Traps discovered
- Yellow hid in THREE encodings: #hex, rgba(245,197,24 / 255,214,1), and URL-encoded %23F5C518 inside SVG marker data-URIs. Miss any and the highlight/glow stays yellow.
- Ritual wordmark is a vector PATH (M28.9111...), invisible to text search, and also appears HTML-escaped inside a serialized concept-nav template. Both needed explicit handling.
- Store nav logos are <svg class="mn-logo" viewBox=...> (class before viewBox) — regex must be attribute-order agnostic.
- Verified: 10/10 headless renders (5 pages x desktop/mobile), zero console errors, zero broken images, zero Ritual leftovers.

## Exact next steps
1. BACKEND (highest leverage): Supabase table mira_entries + edge fn capture-entry (email, source, ab_variant, quiz answers, ts, ip-hash) + minimal entries view. Turns the demo into a data-producing growth system.
2. Build /davidjoseph/strategy (the concept bar's "Read my growth strategy" link is currently inert) — strongest single asset for this application.

## Stack
Static single-file HTML/CSS/JS, no build; Vercel (git-connected jsongau/NJS); Supabase for backend; design-token theming; inline SVG over raster.
