import type { PackageFormat } from "@/domain/types";

/**
 * Package formats.
 *
 * WHAT A SPIRITS FORMAT IS FOR, WHICH IS NOT WHAT A BEER FORMAT IS FOR.
 * A beer pack size is about the occasion — a 24-pack is a party, a
 * 19.2oz single is a commute. A spirits format is about COMMITMENT. A
 * 50ml mini is a trial device that costs a shopper two dollars to say
 * yes to; a 1.75L is a declaration that this is the house bottle. The
 * gap between them is the whole ladder a rep is trying to walk an
 * account up, which is why the model keeps them as distinct formats
 * rather than as sizes of one thing.
 *
 * `unitsPerCase` VERSUS `packUnits`, KEPT FROM THE BEER MODEL BECAUSE
 * THE TRAP IS THE SAME. `unitsPerCase` is how many vessels ship in a
 * shipper. `packUnits` is how many the shopper picks up. For a 750ml jar
 * those are twelve and one; for the 8-pack variety they are three and
 * eight. Conflating them is how an order for six cases of minis arrives
 * as seventy-two bottles nobody has room for.
 *
 * `casesPerPallet` exists so pallets are always CALCULATED, never typed
 * — a plan cannot end up with a case count and a pallet count that
 * disagree with each other.
 *
 * `channelFit` and `placementFit` are what let the app recommend a
 * package rather than only a brand. A 1.75L handle belongs on a
 * specialist bottom shelf and in a sports bar's speed rail, not on a
 * fuel-forecourt counter, and the model knows it.
 *
 * ON-PREMISE CHANGED THESE LISTS, and it should have. A bar does not
 * stock a 50ml mini and a forecourt does not stock a 1.75L handle, so
 * the same field that stopped the app recommending kegs to a pharmacy
 * now stops it recommending minis to a steakhouse. The interesting entry
 * is the 750ml MASON JAR: it is the only package here whose placement
 * list includes `back-bar`, because the jar is the one Ole Smoky format
 * a guest can identify from across a room. A brand whose bottle is
 * recognisable at eight feet has a distribution advantage on a back bar
 * that it does not have on a shelf, and the model should say so.
 *
 * Case and pallet configurations are ordinary industry ones and are
 * marked illustrative rather than presented as an Ole Smoky spec.
 */
export const PACKAGE_FORMATS: PackageFormat[] = [
  {
    id: "jar-750",
    label: "750ml mason jar",
    shortLabel: "750ml jar",
    container: "bottle",
    unitSizeOz: 25.4,
    unitsPerCase: 12,
    packUnits: 1,
    casesPerPallet: 60,
    channelFit: [
      "liquor-store",
      "beverage-specialty",
      "neighborhood-market",
      "convenience",
      "casual-dining",
      "sports-bar",
      "steakhouse",
      "bowling-entertainment",
      "pub",
    ],
    placementFit: ["shelf", "endcap", "floor-stack", "secondary-display", "back-bar"],
    provenance: "illustrative",
  },
  {
    id: "bottle-750",
    label: "750ml bottle",
    shortLabel: "750ml",
    container: "bottle",
    unitSizeOz: 25.4,
    unitsPerCase: 12,
    packUnits: 1,
    casesPerPallet: 60,
    channelFit: [
      "liquor-store",
      "beverage-specialty",
      "neighborhood-market",
      "casual-dining",
      "sports-bar",
      "steakhouse",
      "pub",
      "bowling-entertainment",
    ],
    placementFit: ["shelf", "endcap", "secondary-display", "back-bar", "menu-feature"],
    provenance: "illustrative",
  },
  {
    id: "bottle-1l",
    label: "1 litre bottle",
    shortLabel: "1L",
    container: "bottle",
    unitSizeOz: 33.8,
    unitsPerCase: 12,
    packUnits: 1,
    casesPerPallet: 48,
    channelFit: [
      "liquor-store",
      "beverage-specialty",
      "neighborhood-market",
      "sports-bar",
      "bowling-entertainment",
      "casual-dining",
      "pub",
    ],
    placementFit: ["shelf", "floor-stack", "endcap", "well", "back-bar"],
    provenance: "illustrative",
  },
  {
    id: "bottle-1750",
    label: "1.75 litre handle",
    shortLabel: "1.75L",
    container: "bottle",
    unitSizeOz: 59.2,
    unitsPerCase: 6,
    packUnits: 1,
    casesPerPallet: 42,
    channelFit: [
      "beverage-specialty",
      "liquor-store",
      "sports-bar",
      "bowling-entertainment",
      "pub",
    ],
    placementFit: ["floor-stack", "shelf", "well"],
    provenance: "illustrative",
  },
  {
    id: "bottle-375",
    label: "375ml bottle",
    shortLabel: "375ml",
    container: "bottle",
    unitSizeOz: 12.7,
    unitsPerCase: 12,
    packUnits: 1,
    casesPerPallet: 84,
    channelFit: [
      "convenience",
      "fuel-convenience",
      "liquor-store",
      "beverage-specialty",
      "neighborhood-market",
    ],
    placementFit: ["shelf", "secondary-display", "endcap", "checkout"],
    provenance: "illustrative",
  },
  {
    id: "mini-50",
    label: "50ml mini",
    shortLabel: "50ml mini",
    container: "bottle",
    unitSizeOz: 1.7,
    unitsPerCase: 60,
    packUnits: 1,
    casesPerPallet: 120,
    channelFit: [
      "convenience",
      "fuel-convenience",
      "liquor-store",
      "beverage-specialty",
      "neighborhood-market",
    ],
    placementFit: ["checkout", "secondary-display", "shelf"],
    provenance: "illustrative",
  },
  {
    id: "rtd-8pk-can",
    label: "8-pack 355ml cans",
    shortLabel: "8pk cans",
    container: "can",
    unitSizeOz: 12,
    unitsPerCase: 3,
    packUnits: 8,
    casesPerPallet: 70,
    channelFit: [
      "liquor-store",
      "neighborhood-market",
      "convenience",
      "beverage-specialty",
      "bowling-entertainment",
      "sports-bar",
    ],
    placementFit: ["floor-stack", "endcap", "shelf", "secondary-display", "menu-feature"],
    provenance: "illustrative",
  },
  {
    id: "rtd-4pk-can",
    label: "4-pack 355ml cans",
    shortLabel: "4pk cans",
    container: "can",
    unitSizeOz: 12,
    unitsPerCase: 6,
    packUnits: 4,
    casesPerPallet: 88,
    channelFit: [
      "convenience",
      "fuel-convenience",
      "liquor-store",
      "neighborhood-market",
      "beverage-specialty",
      "bowling-entertainment",
    ],
    placementFit: ["shelf", "secondary-display", "endcap", "checkout"],
    provenance: "illustrative",
  },
];

export const PACKAGE_BY_ID = Object.fromEntries(
  PACKAGE_FORMATS.map((p) => [p.id, p]),
) as Record<string, PackageFormat>;
