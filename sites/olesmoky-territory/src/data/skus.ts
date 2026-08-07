import type { Sku } from "@/domain/types";

/**
 * The sellable set for this period.
 *
 * Two things worth noticing, because both are the point:
 *
 * 1. THE MINIS AND THE 375s ARE NOT AN AFTERTHOUGHT. Ole Smoky launched
 *    50ml minis across five whiskies in 2021 and added 375ml in 2023.
 *    Small formats are how a spirits brand buys trial in a convenience
 *    and drug channel that will never give a 750ml jar a facing, so the
 *    territory's three convenience accounts and two drug accounts can
 *    be planned against a stated company direction rather than a guess.
 *
 * 2. THE 9% CANNED COCKTAIL IS PRESENT AND SWITCHED OFF. Ole Smoky
 *    launched four canned cocktails at 9% ABV in 2020; the live
 *    collection now shows one, and the new Sparkling Lemonade line
 *    launched at 4.5% in June 2026. Rather than delete the older line or
 *    plan against it, it stays in the record with `active: false`. A
 *    portfolio that quietly loses its own history is a portfolio nobody
 *    can audit.
 *
 * ABV and container size for every item come from Ole Smoky's own
 * serving-facts page, not from a retailer listing.
 */
export const SKUS: Sku[] = [
  // --- Original Moonshine -----------------------------------------
  { id: "white-lightnin-jar", brandId: "original-shine", packageFormatId: "jar-750", label: "White Lightnin' 750ml jar (100 proof)", active: true, provenance: "public" },
  { id: "white-lightnin-1l", brandId: "original-shine", packageFormatId: "bottle-1l", label: "White Lightnin' 1L (100 proof)", active: true, provenance: "public" },
  { id: "white-lightnin-mini", brandId: "original-shine", packageFormatId: "mini-50", label: "White Lightnin' 50ml mini", active: true, provenance: "public" },

  // --- Apple Pie ---------------------------------------------------
  { id: "apple-pie-jar", brandId: "apple-pie", packageFormatId: "jar-750", label: "Apple Pie 750ml jar (70 proof)", active: true, provenance: "public" },
  { id: "apple-pie-1l", brandId: "apple-pie", packageFormatId: "bottle-1l", label: "Apple Pie 1L (70 proof)", active: true, provenance: "public" },
  { id: "apple-pie-mini", brandId: "apple-pie", packageFormatId: "mini-50", label: "Apple Pie 50ml mini", active: true, provenance: "public" },
  { id: "apple-pie-250", brandId: "apple-pie", packageFormatId: "jar-750", label: "Apple Pie 250th Birthday Edition 750ml (100 proof)", active: true, innovation2026: true, provenance: "public" },

  // --- Moonshine Cherries ------------------------------------------
  { id: "cherries-jar", brandId: "moonshine-cherries", packageFormatId: "jar-750", label: "Moonshine Cherries 750ml jar (100 proof)", active: true, provenance: "public" },

  // --- Blackberry ---------------------------------------------------
  { id: "blackberry-jar", brandId: "blackberry", packageFormatId: "jar-750", label: "Blackberry 750ml jar (40 proof)", active: true, provenance: "public" },
  { id: "blackberry-mini", brandId: "blackberry", packageFormatId: "mini-50", label: "Blackberry 50ml mini", active: true, provenance: "public" },

  // --- Strawberry ---------------------------------------------------
  { id: "strawberry-jar", brandId: "strawberry", packageFormatId: "jar-750", label: "Strawberry 750ml jar (65 proof)", active: true, provenance: "public" },
  { id: "strawberry-1l", brandId: "strawberry", packageFormatId: "bottle-1l", label: "Strawberry 1L (65 proof)", active: true, provenance: "public" },

  // --- Hunch Punch ---------------------------------------------------
  { id: "hunch-punch-jar", brandId: "hunch-punch", packageFormatId: "jar-750", label: "Hunch Punch Lightnin' 750ml jar (80 proof)", active: true, provenance: "public" },
  { id: "hunch-punch-1l", brandId: "hunch-punch", packageFormatId: "bottle-1l", label: "Hunch Punch Lightnin' 1L (80 proof)", active: true, provenance: "public" },

  // --- Blue Flame ----------------------------------------------------
  { id: "blue-flame-jar", brandId: "blue-flame", packageFormatId: "jar-750", label: "Blue Flame 750ml jar (128 proof)", active: true, provenance: "public" },
  { id: "blue-flame-mini", brandId: "blue-flame", packageFormatId: "mini-50", label: "Blue Flame 50ml mini", active: true, provenance: "public" },

  // --- Tennessee Straight Bourbon -------------------------------------
  { id: "tn-bourbon-750", brandId: "tn-bourbon", packageFormatId: "bottle-750", label: "Tennessee Straight Bourbon 750ml (80 proof)", active: true, provenance: "public" },

  // --- Salty Caramel Whiskey ------------------------------------------
  { id: "salty-caramel-750", brandId: "salty-caramel", packageFormatId: "bottle-750", label: "Salty Caramel Whiskey 750ml (60 proof)", active: true, provenance: "public" },
  { id: "salty-caramel-375", brandId: "salty-caramel", packageFormatId: "bottle-375", label: "Salty Caramel Whiskey 375ml", active: true, provenance: "public" },
  { id: "salty-caramel-1750", brandId: "salty-caramel", packageFormatId: "bottle-1750", label: "Salty Caramel Whiskey 1.75L handle", active: true, provenance: "public" },
  { id: "salty-caramel-mini", brandId: "salty-caramel", packageFormatId: "mini-50", label: "Salty Caramel Whiskey 50ml mini", active: true, provenance: "public" },

  // --- Salty Watermelon Whiskey ----------------------------------------
  { id: "salty-watermelon-750", brandId: "salty-watermelon", packageFormatId: "bottle-750", label: "Salty Watermelon Whiskey 750ml (60 proof)", active: true, provenance: "public" },
  { id: "salty-watermelon-375", brandId: "salty-watermelon", packageFormatId: "bottle-375", label: "Salty Watermelon Whiskey 375ml", active: true, provenance: "public" },

  // --- Mango Habanero Whiskey ------------------------------------------
  { id: "mango-habanero-750", brandId: "mango-habanero", packageFormatId: "bottle-750", label: "Mango Habanero Whiskey 750ml (70 proof)", active: true, provenance: "public" },
  { id: "mango-habanero-375", brandId: "mango-habanero", packageFormatId: "bottle-375", label: "Mango Habanero Whiskey 375ml", active: true, provenance: "public" },

  // --- Blackberry Whiskey -----------------------------------------------
  { id: "blackberry-whiskey-750", brandId: "blackberry-whiskey", packageFormatId: "bottle-750", label: "Blackberry Whiskey 750ml (60 proof)", active: true, provenance: "public" },

  // --- Cookies & Cream --------------------------------------------------
  { id: "cookies-cream-750", brandId: "cookies-cream", packageFormatId: "bottle-750", label: "Cookies & Cream Whiskey 750ml (35 proof)", active: true, provenance: "public" },
  { id: "cookies-cream-mini", brandId: "cookies-cream", packageFormatId: "mini-50", label: "Cookies & Cream Whiskey 50ml mini", active: true, provenance: "public" },

  // --- Ready to drink ---------------------------------------------------
  { id: "sparkling-lemonade-8pk", brandId: "sparkling-lemonade", packageFormatId: "rtd-8pk-can", label: "Sparkling Lemonade variety 8pk cans (4.5%)", active: true, innovation2026: true, provenance: "public" },
  { id: "sparkling-blackberry-4pk", brandId: "sparkling-lemonade", packageFormatId: "rtd-4pk-can", label: "Sparkling Blackberry Lemonade 4pk cans (4.5%)", active: true, innovation2026: true, provenance: "public" },

  // --- The 9% canned cocktail line: held, not offered ---------------------
  { id: "canned-cocktail-4pk", brandId: "sparkling-lemonade", packageFormatId: "rtd-4pk-can", label: "Canned Cocktails variety 4pk (9% ABV)", active: false, provenance: "illustrative" },
];

export const ACTIVE_SKUS = SKUS.filter((s) => s.active);

export const SKU_BY_ID = Object.fromEntries(
  SKUS.map((s) => [s.id, s]),
) as Record<string, Sku>;
