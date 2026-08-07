import type { Account, Channel, AccountPriority } from "@/domain/types";
import { CHANNEL_META } from "@/domain/channels";
import { COORDINATES } from "./coordinates";

/**
 * The account roster: 27 places that actually sell Ole Smoky.
 *
 * ── WHERE THIS LIST CAME FROM, WHICH IS THE POINT ─────────────────
 * Every name, street address and phone number below is published by Ole
 * Smoky's own store locator at olesmoky.com/pages/find-a-jar, for the
 * search "City of Industry, CA 91748". Not a plausible retail dataset.
 * Not a build pack. The brand's own answer to "where can I buy this".
 *
 * That changes what this app is. The previous roster was twenty grocery
 * banners chosen because they exist in the corridor — a reasonable
 * territory, and a modelled one. This roster is falsifiable: anyone
 * reading it can run the same search and check. An account list a
 * hiring manager can verify against their employer's website in thirty
 * seconds is worth more than one they have to take on trust.
 *
 * It also corrects a real error of category. Ole Smoky in this territory
 * does not live in supermarkets. It lives in independent liquor stores,
 * a couple of convenience counters, one specialist, and — this is the
 * half the old roster had no representation of at all — fifteen bars and
 * restaurants. A CRM strategy built on the grocery list would have been
 * built for a shelf the brand is largely not on.
 *
 * ── WHAT IS PUBLISHED VERSUS WHAT IS MODELLED ─────────────────────
 * Published, and marked `public`: name, address, city, ZIP, phone, and
 * the locator's own distance from the 91748 search.
 *
 * Modelled, and marked `illustrative` everywhere it appears on screen:
 * priority, traffic tier, shelf sections, last visit date. Nobody has
 * walked these stores. Channel assignment is a judgment call from the
 * banner and the trade name, and it is the one piece of reasoning worth
 * defending: it drives which package formats the app recommends and
 * which email voice it writes in, and nothing else.
 *
 * Coordinates are approximate street-corridor placements, stamped as
 * such. See coordinates.ts for why they are not geocoded.
 */

interface AccountSeed {
  id: string;
  chainName: string;
  channel: Channel;
  chainType: "chain" | "independent";
  address: string;
  city: string;
  postalCode: string;
  phone?: string;
  /** Miles as published by the locator. Quoted, never recomputed. */
  locatorMiles?: number;
  priority: AccountPriority;
  trafficTier: 1 | 2 | 3;
  shelfSectionsTotal?: number;
  lastVisitDate?: string;
}

/**
 * The published set, in the locator's own order.
 *
 * Names are title-cased from the locator's all-caps listing and
 * apostrophes are restored where the trade name obviously carries one —
 * "Renee's", "George's", "Chantry's", "O'Donovan's". That is a
 * typographic correction to a rendering, not a change of fact, and it is
 * the only edit made to any published field.
 */
const SEED: AccountSeed[] = [
  // ================================================================
  // OFF-PREMISE — retail locations
  // ================================================================
  { id: "seven-eleven-valley-west-covina", chainName: "7-Eleven", channel: "convenience", chainType: "chain", address: "2887 E Valley Blvd", city: "West Covina", postalCode: "91792", phone: "(626) 965-9565", locatorMiles: 1.5, priority: "medium", trafficTier: 2, shelfSectionsTotal: 2, lastVisitDate: "2026-07-25" },
  { id: "canyon-liquor-west-covina", chainName: "Canyon Liquor", channel: "liquor-store", chainType: "independent", address: "19058 La Puente Rd", city: "West Covina", postalCode: "91792", phone: "(626) 965-9998", locatorMiles: 2.0, priority: "high", trafficTier: 2, shelfSectionsTotal: 5, lastVisitDate: "2026-07-22" },
  { id: "mexim-liquor-la-puente", chainName: "Mexim Liquor", channel: "liquor-store", chainType: "independent", address: "18061 E Valley Blvd", city: "La Puente", postalCode: "91744", phone: "(626) 956-0440", locatorMiles: 2.1, priority: "high", trafficTier: 2, shelfSectionsTotal: 4, lastVisitDate: "2026-07-18" },
  { id: "valley-market-walnut", chainName: "Valley Market", channel: "neighborhood-market", chainType: "independent", address: "20311 E Valley Blvd Ste D", city: "Walnut", postalCode: "91789", phone: "(909) 594-6322", priority: "medium", trafficTier: 2, shelfSectionsTotal: 3, lastVisitDate: "2026-07-09" },
  { id: "k-and-b-liquor-la-puente", chainName: "K & B Liquor", channel: "liquor-store", chainType: "independent", address: "443 S Azusa Ave", city: "La Puente", postalCode: "91744", phone: "(626) 913-8739", locatorMiles: 2.9, priority: "high", trafficTier: 2, shelfSectionsTotal: 4, lastVisitDate: "2026-07-24" },
  { id: "mobil-brea-canyon-walnut", chainName: "Mobil", channel: "fuel-convenience", chainType: "chain", address: "1024 S Brea Canyon Rd", city: "Walnut", postalCode: "91789", phone: "(909) 468-2225", locatorMiles: 2.9, priority: "low", trafficTier: 3, shelfSectionsTotal: 1, lastVisitDate: "2026-06-12" },
  { id: "renees-liquor-walnut", chainName: "Renee's Liquor & Market", channel: "liquor-store", chainType: "independent", address: "800 Nogales Ave", city: "Walnut", postalCode: "91789", phone: "(626) 667-7811", locatorMiles: 3.1, priority: "high", trafficTier: 2, shelfSectionsTotal: 5, lastVisitDate: "2026-07-21" },
  { id: "georges-liquor-la-habra", chainName: "George's Liquor", channel: "liquor-store", chainType: "independent", address: "1931 E La Habra Blvd", city: "La Habra", postalCode: "90631", priority: "medium", trafficTier: 3, shelfSectionsTotal: 3, lastVisitDate: "2026-06-24" },
  { id: "harbor-mart-liquors-la-habra", chainName: "Harbor Mart Liquors", channel: "liquor-store", chainType: "independent", address: "320 Harbor N", city: "La Habra", postalCode: "90631", phone: "(562) 691-5030", locatorMiles: 4.1, priority: "medium", trafficTier: 2, shelfSectionsTotal: 4, lastVisitDate: "2026-07-06" },
  { id: "chantrys-pantry-west-covina", chainName: "Chantry's Pantry Liquor", channel: "liquor-store", chainType: "independent", address: "1005 E Amar Rd", city: "West Covina", postalCode: "91792", phone: "(626) 961-2223", locatorMiles: 4.4, priority: "medium", trafficTier: 3, shelfSectionsTotal: 3, lastVisitDate: "2026-06-30" },
  { id: "liquor-town-la-habra", chainName: "Liquor Town", channel: "liquor-store", chainType: "independent", address: "409 E La Habra Blvd", city: "La Habra", postalCode: "90631", phone: "(562) 691-5337", locatorMiles: 4.5, priority: "medium", trafficTier: 3, shelfSectionsTotal: 4, lastVisitDate: "2026-07-02" },
  { id: "bevmo-walnut", chainName: "BevMo!", channel: "beverage-specialty", chainType: "chain", address: "21660 Valley Blvd", city: "Walnut", postalCode: "91789", phone: "(909) 859-2067", priority: "high", trafficTier: 1, shelfSectionsTotal: 9, lastVisitDate: "2026-07-28" },

  // ================================================================
  // ON-PREMISE — bars and restaurants
  // ================================================================
  { id: "applebees-rowland-heights", chainName: "Applebee's", channel: "casual-dining", chainType: "chain", address: "1590 S Azusa Ave", city: "Rowland Heights", postalCode: "91748", phone: "(626) 965-6940", locatorMiles: 2.5, priority: "high", trafficTier: 1, shelfSectionsTotal: 3, lastVisitDate: "2026-07-29" },
  { id: "bww-rowland-heights", chainName: "Buffalo Wild Wings", channel: "sports-bar", chainType: "chain", address: "1576 S Azusa Ave", city: "Rowland Heights", postalCode: "91748", phone: "(626) 810-6479", locatorMiles: 2.5, priority: "high", trafficTier: 1, shelfSectionsTotal: 4, lastVisitDate: "2026-07-29" },
  { id: "la-habra-300-bowl", chainName: "La Habra 300 Bowl", channel: "bowling-entertainment", chainType: "independent", address: "370 E Whittier Blvd", city: "La Habra", postalCode: "90631", phone: "(714) 526-2058", locatorMiles: 4.2, priority: "medium", trafficTier: 2, shelfSectionsTotal: 3, lastVisitDate: "2026-07-11" },
  { id: "applebees-walnut", chainName: "Applebee's", channel: "casual-dining", chainType: "chain", address: "21625 E Valley Blvd", city: "Walnut", postalCode: "91789", phone: "(909) 594-1140", locatorMiles: 4.5, priority: "high", trafficTier: 1, shelfSectionsTotal: 3, lastVisitDate: "2026-07-15" },
  { id: "hedz-or-tales-la-habra", chainName: "Hedz or Tales", channel: "pub", chainType: "independent", address: "211 E Imperial Hwy", city: "La Habra", postalCode: "90631", phone: "(714) 526-3132", locatorMiles: 5.4, priority: "medium", trafficTier: 3, shelfSectionsTotal: 3, lastVisitDate: "2026-06-17" },
  { id: "applebees-la-habra", chainName: "Applebee's", channel: "casual-dining", chainType: "chain", address: "1238 W Imperial Hwy", city: "La Habra", postalCode: "90631", phone: "(562) 690-0779", locatorMiles: 6.0, priority: "medium", trafficTier: 2, shelfSectionsTotal: 3, lastVisitDate: "2026-07-08" },
  { id: "bww-west-covina", chainName: "Buffalo Wild Wings", channel: "sports-bar", chainType: "chain", address: "2548 E Workman Ave", city: "West Covina", postalCode: "91791", phone: "(626) 967-9888", locatorMiles: 6.5, priority: "high", trafficTier: 1, shelfSectionsTotal: 4, lastVisitDate: "2026-07-20" },
  { id: "black-angus-whittier", chainName: "Black Angus Steakhouse", channel: "steakhouse", chainType: "chain", address: "15500 Whittier Blvd", city: "Whittier", postalCode: "90603", phone: "(562) 947-2200", locatorMiles: 6.6, priority: "high", trafficTier: 2, shelfSectionsTotal: 5, lastVisitDate: "2026-07-17" },
  { id: "bww-whittier", chainName: "Buffalo Wild Wings", channel: "sports-bar", chainType: "chain", address: "10033 Whittwood Dr", city: "Whittier", postalCode: "90603", phone: "(562) 943-2813", locatorMiles: 6.7, priority: "high", trafficTier: 2, shelfSectionsTotal: 4, lastVisitDate: "2026-07-13" },
  { id: "lincoln-house-covina", chainName: "Lincoln House", channel: "pub", chainType: "independent", address: "144 W Badillo St", city: "Covina", postalCode: "91723", phone: "(626) 732-9827", locatorMiles: 7.2, priority: "medium", trafficTier: 3, shelfSectionsTotal: 4, lastVisitDate: "2026-06-03" },
  { id: "tepeyac-la-puente", chainName: "Tepeyac Restaurant & Sports Bar", channel: "sports-bar", chainType: "independent", address: "13131 Crossroads Pkwy S Ste C", city: "La Puente", postalCode: "91746", phone: "(626) 222-6092", locatorMiles: 7.9, priority: "high", trafficTier: 2, shelfSectionsTotal: 4, lastVisitDate: "2026-07-23" },
  { id: "california-grill-whittier", chainName: "California Grill", channel: "casual-dining", chainType: "independent", address: "6751 Painter Ave", city: "Whittier", postalCode: "90601", phone: "(562) 907-7017", locatorMiles: 8.2, priority: "medium", trafficTier: 3, shelfSectionsTotal: 3, lastVisitDate: "2026-05-28" },
  { id: "outback-covina", chainName: "Outback Steakhouse", channel: "steakhouse", chainType: "chain", address: "1476 N Azusa Ave", city: "Covina", postalCode: "91722", phone: "(626) 812-0488", locatorMiles: 8.7, priority: "medium", trafficTier: 2, shelfSectionsTotal: 4, lastVisitDate: "2026-07-01" },
  { id: "bww-chino-hills", chainName: "Buffalo Wild Wings", channel: "sports-bar", chainType: "chain", address: "3160 Chino Ave", city: "Chino Hills", postalCode: "91709", phone: "(909) 591-9035", locatorMiles: 9.0, priority: "high", trafficTier: 2, shelfSectionsTotal: 4, lastVisitDate: "2026-07-06" },
  { id: "odonovans-pomona", chainName: "O'Donovan's Pub", channel: "pub", chainType: "independent", address: "101 E 3rd St", city: "Pomona", postalCode: "91766", phone: "(909) 203-9325", locatorMiles: 9.6, priority: "medium", trafficTier: 3, shelfSectionsTotal: 4, lastVisitDate: "2026-06-11" },
];

const slugify = (id: string) => id;

/**
 * The locator search this roster came from. Named once, here, so the
 * provenance line on screen and the comment in the code cannot drift.
 */
export const LOCATOR_SOURCE = {
  url: "https://olesmoky.com/pages/find-a-jar?q=City%20of%20Industry%2C%20CA%2091748%2C%20USA&locationFilter=off",
  label: "Ole Smoky store locator",
  query: "City of Industry, CA 91748",
} as const;

/**
 * Accounts are built by joining the seed against the frozen coordinate
 * map. An account whose coordinate is missing is dropped from this list
 * and reported by verify-data, rather than being rendered at a default
 * or interpolated position.
 */
export const ACCOUNTS: Account[] = SEED.flatMap((s): Account[] => {
  const point = COORDINATES[s.id];
  if (!point) return [];
  return [
    {
      id: s.id,
      slug: slugify(s.id),
      chainName: s.chainName,
      channel: s.channel,
      chainType: s.chainType,
      address: s.address,
      city: s.city,
      state: "CA",
      postalCode: s.postalCode,
      phone: s.phone,
      lat: point.lat,
      lng: point.lng,
      locationAccuracy: point.accuracy,
      territoryId: "east-la",
      priority: s.priority,
      trafficTier: s.trafficTier,
      shelfSectionsTotal: s.shelfSectionsTotal,
      lastVisitDate: s.lastVisitDate,
      locatorMiles: s.locatorMiles,
      addressSource: `${LOCATOR_SOURCE.label}, search "${LOCATOR_SOURCE.query}"`,
      provenance: {
        address: "public",
        phone: "public",
        locatorMiles: "public",
        coordinates: "modeled",
        priority: "illustrative",
        trafficTier: "illustrative",
        shelfSectionsTotal: "illustrative",
        lastVisitDate: "illustrative",
      },
    },
  ];
});

/** Ids in the seed that have no coordinate yet. */
export const ACCOUNTS_MISSING_COORDINATES = SEED.filter(
  (s) => !COORDINATES[s.id],
).map((s) => s.id);

export const ACCOUNT_SEED_IDS = SEED.map((s) => s.id);

export const ACCOUNT_BY_ID = Object.fromEntries(
  ACCOUNTS.map((a) => [a.id, a]),
) as Record<string, Account>;

/**
 * The two halves of the territory, precomputed.
 *
 * Derived from CHANNEL_META rather than from a second list of account
 * ids, so an account cannot end up in both tabs or in neither. Adding a
 * channel makes the compiler demand a venue class for it, and the tabs
 * pick it up with no further edit.
 */
export const OFF_PREMISE_ACCOUNTS = ACCOUNTS.filter(
  (a) => CHANNEL_META[a.channel].venueClass === "off-premise",
);

export const ON_PREMISE_ACCOUNTS = ACCOUNTS.filter(
  (a) => CHANNEL_META[a.channel].venueClass === "on-premise",
);
