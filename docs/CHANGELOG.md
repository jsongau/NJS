# Changelog

## 2026-07-20
- Added **Boba Night** as project No. III with a "Midnight Pour" dessert reveal: the cup fills with brown-sugar tea, colorful tapioca pearls stack into a pile, a tinted lid drops on, then a candy-striped straw punches in. Synthesized open sequence (swell, pour, pearl plops, lid thunk, straw pop, sparkle). Copy points to finding good boba in a city you're in.
- Gave **CoverCapy** its own "coverage concierge" reveal (`theme:'cc'`): a clean cyan high-tech slate with a tech grid, the shield mark drawing itself, a scan line sweep, and a verified badge with a pulse ring. Rewrote the copy to the verification angle — verify your insurance with a dentist so you find the right one without guesswork. "Clearer coverage is better care."
- Reworked the shared project modal for clearer separation between sections: a small accent divider marks where the intro ends and the features begin, the selected feature's description sits in its own quiet panel tied to the chips, spacing groups each zone, and the CTA is set apart.
- Made the period after "J" in the top nav pink (with glow), matching the hero.
- Architecture: the baroque salon, boba, and cc reveals all run off one shared modal via a per-project `theme` flag (theme-as-data), so a fourth is trivial.

## 2026-07-18
- Shipped v80 to production (commit d52f4f3): Agent NS interactive "core brain" (press-and-hold NS seal → charge + burst + spoken affirmation), 40 sayings across 4 hold-duration tiers, tap-to-play element sounds with PDF opening in a new tab, luxury gallery theme-toggle chimes, mobile layout polish, clickable email + phone (mailto/tel), and the finalized pink-strike NS favicons.
- 2026-07-20 - /davidjoseph published: full Ritual->Mira reskin (fictional prenatal brand) as a David Joseph Growth Lead work sample; new davidjoseph/ folder (funnel + Partner Circle + 3 creator stores) with 9 original SVGs; all ritual.com deps removed; OG/canonical/favicon added.

## 2026-07-23
- Portfolio dock v2: "Personal Portfolio" tab, two-line chips with Est. dates, chips in a scroll lane with the NS mark and Get in touch pinned so the CTA can't clip, safe-area insets.
- BoxVacay shipped as project four with the recovered "Sundown Round" theme (kick-pad strike scene, strike audio, Explore Camps CTA) — ported from an uncommitted 2026-07-20 preview found in Downloads.
- Modal plates now read "Est. <month year>" only; Ask Agent NS button clears the dock lane under 1080px; salon tassels hidden on phones (blurb overlap); light-mode chip contrast and Boba icon color fixed.

## 2026-07-30
- Added **Wrestle Lore** (wrestlelore.com) as project five with a "Title Night" championship reveal (`theme:'wl'`): arena spotlights sweep in, a hand-drawn vector championship belt drops and settles (crowned center plate, deco sunburst, faceted star, ruby gem links, riveted rim, engraved banner, hex side plates on a long stitched strap with snap studs), five rating stars pop in one by one, a glint sweeps the plate, gold sparks fly, and the ring ropes draw in. Synthesized ring-bell open sequence (crowd swell, three bell strikes, brass fanfare), Web Audio only.
- Copy sells discovery and the live feed: "Your next favorite match is already out there," the connected-archive blurb, pills for Match Discovery / The Lore Feed / Star Ratings / Go Deeper, closing line "Relive the classics. Discover new favorites."
- Dock: fifth chip with a gold belt icon, Est. July 2026, hooked into the shared theme-as-data modal.
- Belt v2 after review: red enamel plate fields (center + hexes), center art swapped from crown/star/sunburst to a gold globe with graticule flanked by laurel branches and a ruby bezel crest set into the rim (original art in the classic international-title spirit). Modal blurb shortened to two paragraphs (white-space pre-line), redundancy cut.
- Modal height fix: blurb trimmed to two short beats, top padding tightened, ending line moved into the Match Discovery detail panel so the CTA stays above the fold on shorter screens.
- Wrestle Lore tag now "The ultimate fan site to discover wrestling". BoxVacay marked under construction: trust line removed, CTA greyed to Coming soon with navigation disabled.
