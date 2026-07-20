# Changelog

## 2026-07-20
- Added **Boba Night** as project No. III with a "Midnight Pour" dessert reveal: the cup fills with brown-sugar tea, colorful tapioca pearls stack into a pile, a tinted lid drops on, then a candy-striped straw punches in. Synthesized open sequence (swell, pour, pearl plops, lid thunk, straw pop, sparkle). Copy points to finding good boba in a city you're in.
- Gave **CoverCapy** its own "coverage concierge" reveal (`theme:'cc'`): a clean cyan high-tech slate with a tech grid, the shield mark drawing itself, a scan line sweep, and a verified badge with a pulse ring. Rewrote the copy to the verification angle — verify your insurance with a dentist so you find the right one without guesswork. "Clearer coverage is better care."
- Reworked the shared project modal for clearer separation between sections: a small accent divider marks where the intro ends and the features begin, the selected feature's description sits in its own quiet panel tied to the chips, spacing groups each zone, and the CTA is set apart.
- Made the period after "J" in the top nav pink (with glow), matching the hero.
- Architecture: the baroque salon, boba, and cc reveals all run off one shared modal via a per-project `theme` flag (theme-as-data), so a fourth is trivial.

## 2026-07-18
- Shipped v80 to production (commit d52f4f3): Agent NS interactive "core brain" (press-and-hold NS seal → charge + burst + spoken affirmation), 40 sayings across 4 hold-duration tiers, tap-to-play element sounds with PDF opening in a new tab, luxury gallery theme-toggle chimes, mobile layout polish, clickable email + phone (mailto/tel), and the finalized pink-strike NS favicons.
