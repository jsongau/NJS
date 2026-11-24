# Map UX: what the research says, and what we do about it

Written 2026-11-24 for the near-me map (`/fitness/guides/near-me`). Read before changing the map, its place card,
its pins or its search. Each rule names where it came from. Sources were read on that date.

## Sources

1. Nielsen Norman Group, "Mobile maps and locations": https://www.nngroup.com/articles/mobile-maps-locations/
2. Apple Human Interface Guidelines, "Maps" (place cards added December 2024):
   https://developer.apple.com/design/human-interface-guidelines/maps
3. Google Maps Platform, "Build an interactive store finder with Places UI Kit":
   https://developers.google.com/maps/architecture/ui-kit-store-finder

## The rules

| Rule | From | How the map follows it |
|---|---|---|
| Show the distance from the searched spot on every result, so people can choose without the map | 1 | Every list card and the place card lead with miles from the chosen spot. With no spot chosen, the card gives miles from the nearest home gym |
| On phones the list comes first; the map is a choice | 1 | Phones open on the list. Map is a tab, and Expand is a further choice |
| A map must not trap page scrolling | 1 | The map zooms with the wheel only after a click; phones get the map only in its own view |
| Pins need finger-sized targets and must not crowd | 1 | Pins are 34 to 36px with a larger hit area; the search frames only what was asked for |
| Give directions on the detail view | 1 | Navigate is the one filled button on the place card |
| Clearly mark what is selected | 2 | The picked pin grows, gets a white ring and a pulse in its kind colour; its list card gets the same colour border |
| Keep the place visible while its card is open | 2 | `keepSeen` slides the map so the card never covers the pin; the deck folds or hides to make room |
| Full card on wide screens, a sheet on phones | 2 | Side card on the right when expanded, a bottom sheet on phones |
| Do not repeat what the screen already says | 2 | Beside the list the card is short (the row next to it has the rest); the deck drops its duplicate distance line |
| Controls need contrast against the map | 2 | Search, dock, deck and card carry a dark edge and a gold hairline; a soft vignette darkens the map behind them |
| Offer search together with category filters | 2 | One search box reads kind, distance and spot; the kind tiles sit in the deck |
| Colour plus icon to tell kinds apart | 2 | One colour and one emblem per kind on pins, cards, key and place card |
| A "near me" action matters most on phones | 3 | Me is in the From dock and in the search ("boxing near me") |
| Choosing a search suggestion should centre the map and refresh results | 3 | Every suggestion applies its filters and reframes the map |

## Where we chose differently, and why

- **No pin clusters.** Source 1 found numbered clusters confuse people; source 2 recommends them for legibility.
  We have 188 places, so we do not cluster: the search and the distance ring cut the pins down instead.
- **No ratings or photos on the place card**, though both Apple's and Google's cards show them. We do not copy
  other sites' stars, and we have no photos we own. The card shows a sourced "known for" line instead.
- **Straight-line miles, said plainly.** We have no routing service, so the card says "Straight line, not drive
  time" under the number.

## Our own additions (not from the sources)

- The place card ends with "Pair it with a session" and the nearest home gym: the map exists to round out
  training with Jay, not to send people away.
- "Measure from here instead" turns any place into the new centre.
- Previous and next on the card step through the results in list order, flying the map each time.

## Still to test with real people

- Whether visitors type in the search box or go straight to the tiles.
- Whether "Measure from here instead" is understood.
- Whether the deck folding on drag feels helpful or surprising.
