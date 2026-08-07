import type { Brand } from "@/domain/types";

/**
 * The Ole Smoky brands modeled in this prototype.
 *
 * `strategicRole` is not flavour text. It is the commercial posture the
 * brand actually occupies, and it is what lets the app argue a
 * recommendation ("put Tennessee Straight Bourbon into Total Wine
 * because it is the credibility item and that is where a bourbon shopper
 * browses") rather than just listing SKUs.
 *
 * WHAT CHANGED FROM THE BEER MODEL, AND WHY THE STRUCTURE DID NOT.
 * A distributor sales executive selling spirits does the same job as one
 * selling beer: build a plan by account, get the wholesaler to buy it,
 * get the retailer to take it, and chase the gap between the two. So the
 * engine is unchanged. What changes is the portfolio — and the portfolio
 * changes the recommendations, because a 750ml jar is not merchandised
 * where a 24-pack is.
 *
 * THE FAMILY SLOTS ARE REUSED, NOT RENAMED. `core`, `above-premium`,
 * `economy` and `flavor` carry different meanings here than they did for
 * beer, and the labels on screen say so. Renaming the union across
 * a hundred and sixty call sites to gain nothing a label could not is
 * the kind of churn that introduces bugs in exchange for tidiness.
 * `non-alc` WAS renamed to `rtd`, because "non-alcoholic" applied to a
 * ready-to-drink cocktail is not a loose label, it is a wrong one.
 *
 * All product photography is Ole Smoky's own, from the company CDN, used
 * for reference in an unaffiliated prototype. See the footer disclaimer.
 */
export const BRANDS: Brand[] = [
  {
    id: "original-shine",
    name: "Original Moonshine",
    family: "core",
    assetPath: "assets/products/white_lightnin.webp",
    strategicRole:
      "The unflavoured 100 proof original, in the 750ml mason jar the whole brand is built around. Buying this is a statement of allegiance rather than curiosity, which makes it the anchor of the set and the item a serious account cannot be out of.",
    provenance: "public",
  },
  {
    id: "apple-pie",
    name: "Apple Pie",
    family: "core",
    assetPath: "assets/products/apple_pie.webp",
    strategicRole:
      "The gateway, and the flavour most first-time tasters name. Sold at 70 and 40 proof so an account can carry an approachable version without giving up the shelf tag. The highest-velocity single item in the portfolio.",
    provenance: "public",
  },
  {
    id: "blackberry",
    name: "Blackberry",
    family: "flavor",
    assetPath: "assets/products/blackberry.webp",
    strategicRole:
      "Forty proof and fruit-forward. Low ABV means broad appeal and the shortest distance to the ready-to-drink line, which makes it the natural bridge SKU in any account carrying both.",
    provenance: "public",
  },
  {
    id: "strawberry",
    name: "Strawberry",
    family: "flavor",
    assetPath: "assets/products/strawberry.webp",
    strategicRole:
      "Sixty-five proof, and the most seasonal item in the range. Sells through a summer set and drags in an autumn one, so it is a placement to win in April and defend rather than reset in October.",
    provenance: "public",
  },
  {
    id: "hunch-punch",
    name: "Hunch Punch Lightnin'",
    family: "flavor",
    assetPath: "assets/products/hunch_punch.webp",
    strategicRole:
      "Eighty proof and named after a party. Skews to group occasions, which means multi-unit baskets rather than single jars — the item that most rewards a floor stack.",
    provenance: "public",
  },
  {
    id: "blue-flame",
    name: "Blue Flame",
    family: "flavor",
    assetPath: "assets/products/blue_flame.webp",
    strategicRole:
      "128 proof, the strongest thing in the range and the smallest audience. It earns its facing by being the reason a certain kind of shopper walks past three other brands to reach this shelf.",
    provenance: "public",
  },
  {
    id: "moonshine-cherries",
    name: "Moonshine Cherries",
    family: "core",
    assetPath: "assets/products/moonshine_cherries.webp",
    strategicRole:
      "Maraschino cherries steeped in 100 proof White Lightnin'. The most photographed item in the portfolio and the single best impulse and gifting piece — which is why it belongs at the register, not in the set.",
    provenance: "public",
  },
  {
    id: "tn-bourbon",
    name: "Tennessee Straight Bourbon",
    family: "above-premium",
    assetPath: "assets/products/tennessee_straight_bourbon.webp",
    strategicRole:
      "Four years in barrel. The credibility item: it is what lets a moonshine brand hold a conversation with a bourbon shopper without changing its voice, and the reason a specialist account will take the rest of the range seriously.",
    provenance: "public",
  },
  {
    id: "salty-caramel",
    name: "Salty Caramel Whiskey",
    family: "above-premium",
    assetPath: "assets/products/salty_caramel_whiskey.webp",
    strategicRole:
      "Sixty proof, and the only item sold in five formats including a 1.75L. That format breadth is a repeat-purchase signal — nobody buys a handle of something they tried once — so it is the item to lead a distribution conversation with.",
    provenance: "public",
  },
  {
    id: "salty-watermelon",
    name: "Salty Watermelon Whiskey",
    family: "above-premium",
    assetPath: "assets/products/salty_watermelon_whiskey.webp",
    strategicRole:
      "Warm weather, and the natural partner to the ready-to-drink line in a summer flight. Available in 375ml, which is the format that gets a trial into a basket that would not take a 750.",
    provenance: "public",
  },
  {
    id: "mango-habanero",
    name: "Mango Habanero Whiskey",
    family: "above-premium",
    assetPath: "assets/products/mango_habanero_whiskey.webp",
    strategicRole:
      "Heat, and the most polarising item on the shelf. Small velocity and unusually loyal repeat — the sort of item a specialist account uses to prove it carries things the corner store does not.",
    provenance: "public",
  },
  {
    id: "blackberry-whiskey",
    name: "Blackberry Whiskey",
    family: "above-premium",
    assetPath: "assets/products/blackberry_whiskey.webp",
    strategicRole:
      "The bridge between the two halves of the portfolio. A Blackberry moonshine buyer who moves to Blackberry whiskey has traded up without leaving the flavour, which is the cleanest upsell path in the range.",
    provenance: "public",
  },
  {
    id: "cookies-cream",
    name: "Cookies & Cream Whiskey",
    family: "economy",
    assetPath: "assets/products/cookies_cream_whiskey.webp",
    strategicRole:
      "A cream liqueur at 35 proof. Heavily seasonal and heavily gifted, which makes it the anchor of the fourth-quarter set and close to dead weight in July. Plan it as a placement with a date on it.",
    provenance: "public",
  },
  {
    id: "sparkling-lemonade",
    name: "Sparkling Lemonade",
    family: "rtd",
    assetPath: "assets/products/sparkling_lemonade_variety_8_pack.webp",
    strategicRole:
      "Launched June 2026 at 4.5% — a deliberate step down from the 9% canned cocktails. Low ABV reads as a broader-channel play, though the channel rights for a SPIRITS-based can are state by state and are not the same as for a malt-based one. Treated here as a strategic signal rather than a settled fact.",
    provenance: "public",
  },
];

export const BRAND_BY_ID = Object.fromEntries(
  BRANDS.map((b) => [b.id, b]),
) as Record<string, Brand>;
