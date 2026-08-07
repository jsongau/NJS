/**
 * Coordinates, kept in their own file on purpose.
 *
 * ── CURRENT STATE: APPROXIMATE, NOT GEOCODED ──────────────────────
 * These are street-corridor approximations, not verified geocoder
 * output. Every entry is stamped `accuracy: "approximate"`, the app
 * surfaces that on the account record, and a banner names it. They put
 * each account on the right road in the right city, which is enough to
 * judge territory shape and route logic, and they are deliberately not
 * precise enough to assert a specific storefront.
 *
 * The addresses themselves are a different matter, and a much stronger
 * one: they are published by Ole Smoky's own store locator, so the
 * account roster is checkable against the brand's website rather than
 * modelled. See accounts.ts.
 *
 * WHY THEY WERE NOT GEOCODED THIS TIME. The intended run was the Census
 * geocoder, the same one this file was built around. It is unreachable
 * from the environment this was built in — the outbound proxy refuses
 * the CONNECT — so the choice was a hand placement stamped
 * "approximate", or a fabricated coordinate stamped "verified". The
 * whole point of carrying an accuracy field is that it stays true when
 * it is inconvenient.
 *
 * To replace them with verified coordinates: open
 * scripts/geocode-tool.html in a browser, click Run, paste the resulting
 * JSON over the map below, and switch accuracy to "verified".
 *
 * ── WHY THIS FILE IS SEPARATE ─────────────────────────────────────
 * The map has no runtime geocoding dependency: no API key, no rate limit,
 * no network call that can fail in front of a viewer. And an account
 * missing from this map is dropped from ACCOUNTS entirely and reported by
 * verify-data rather than rendered at a default position. That matters:
 * an earlier geocoding attempt in this project returned a single canned
 * record for EVERY address queried, and had it been trusted, all twenty
 * pins would have been confidently wrong and identical. Failing loudly is
 * the fix for that class of bug.
 */

export interface GeocodedPoint {
  lat: number;
  lng: number;
  matchedAddress: string;
  accuracy: "verified" | "approximate";
}

const APPROX = "approximate" as const;

export const COORDINATES: Record<string, GeocodedPoint> = {
  // ================================================================
  // OFF-PREMISE — retail locations
  // ================================================================

  // --- West Covina 91792, Valley Blvd / Amar Rd corridor ------------
  "seven-eleven-valley-west-covina": { lat: 34.0197, lng: -117.8972, matchedAddress: "2887 E Valley Blvd, West Covina, CA 91792", accuracy: APPROX },
  "canyon-liquor-west-covina": { lat: 34.0148, lng: -117.8968, matchedAddress: "19058 La Puente Rd, West Covina, CA 91792", accuracy: APPROX },
  "chantrys-pantry-west-covina": { lat: 34.0248, lng: -117.8920, matchedAddress: "1005 E Amar Rd, West Covina, CA 91792", accuracy: APPROX },

  // --- La Puente 91744 ---------------------------------------------
  "mexim-liquor-la-puente": { lat: 34.0222, lng: -117.9180, matchedAddress: "18061 E Valley Blvd, La Puente, CA 91744", accuracy: APPROX },
  "k-and-b-liquor-la-puente": { lat: 34.0268, lng: -117.9078, matchedAddress: "443 S Azusa Ave, La Puente, CA 91744", accuracy: APPROX },

  // --- Walnut 91789 -------------------------------------------------
  "valley-market-walnut": { lat: 34.0158, lng: -117.8680, matchedAddress: "20311 E Valley Blvd Ste D, Walnut, CA 91789", accuracy: APPROX },
  "mobil-brea-canyon-walnut": { lat: 34.0095, lng: -117.8428, matchedAddress: "1024 S Brea Canyon Rd, Walnut, CA 91789", accuracy: APPROX },
  "renees-liquor-walnut": { lat: 34.0110, lng: -117.8790, matchedAddress: "800 Nogales Ave, Walnut, CA 91789", accuracy: APPROX },
  "bevmo-walnut": { lat: 34.0140, lng: -117.8555, matchedAddress: "21660 Valley Blvd, Walnut, CA 91789", accuracy: APPROX },

  // --- La Habra 90631 -----------------------------------------------
  "georges-liquor-la-habra": { lat: 33.9318, lng: -117.9210, matchedAddress: "1931 E La Habra Blvd, La Habra, CA 90631", accuracy: APPROX },
  "harbor-mart-liquors-la-habra": { lat: 33.9345, lng: -117.9520, matchedAddress: "320 Harbor N, La Habra, CA 90631", accuracy: APPROX },
  "liquor-town-la-habra": { lat: 33.9318, lng: -117.9420, matchedAddress: "409 E La Habra Blvd, La Habra, CA 90631", accuracy: APPROX },

  // ================================================================
  // ON-PREMISE — bars and restaurants
  // ================================================================

  // --- Puente Hills, S Azusa Ave (Rowland Heights 91748) ------------
  "applebees-rowland-heights": { lat: 33.9968, lng: -117.9165, matchedAddress: "1590 S Azusa Ave, Rowland Heights, CA 91748", accuracy: APPROX },
  "bww-rowland-heights": { lat: 33.9962, lng: -117.9172, matchedAddress: "1576 S Azusa Ave, Rowland Heights, CA 91748", accuracy: APPROX },

  // --- Walnut / Diamond Bar ------------------------------------------
  "applebees-walnut": { lat: 34.0142, lng: -117.8560, matchedAddress: "21625 E Valley Blvd, Walnut, CA 91789", accuracy: APPROX },

  // --- La Habra 90631 -------------------------------------------------
  "la-habra-300-bowl": { lat: 33.9330, lng: -117.9420, matchedAddress: "370 E Whittier Blvd, La Habra, CA 90631", accuracy: APPROX },
  "hedz-or-tales-la-habra": { lat: 33.9175, lng: -117.9430, matchedAddress: "211 E Imperial Hwy, La Habra, CA 90631", accuracy: APPROX },
  "applebees-la-habra": { lat: 33.9172, lng: -117.9700, matchedAddress: "1238 W Imperial Hwy, La Habra, CA 90631", accuracy: APPROX },

  // --- West Covina 91791 ----------------------------------------------
  "bww-west-covina": { lat: 34.0790, lng: -117.8880, matchedAddress: "2548 E Workman Ave, West Covina, CA 91791", accuracy: APPROX },

  // --- Whittier 90603 / 90601 ------------------------------------------
  "black-angus-whittier": { lat: 33.9455, lng: -118.0075, matchedAddress: "15500 Whittier Blvd, Whittier, CA 90603", accuracy: APPROX },
  "bww-whittier": { lat: 33.9440, lng: -118.0130, matchedAddress: "10033 Whittwood Dr, Whittier, CA 90603", accuracy: APPROX },
  "california-grill-whittier": { lat: 33.9790, lng: -118.0330, matchedAddress: "6751 Painter Ave, Whittier, CA 90601", accuracy: APPROX },

  // --- Covina 91723 / 91722 ---------------------------------------------
  "lincoln-house-covina": { lat: 34.0895, lng: -117.8940, matchedAddress: "144 W Badillo St, Covina, CA 91723", accuracy: APPROX },
  "outback-covina": { lat: 34.1030, lng: -117.9060, matchedAddress: "1476 N Azusa Ave, Covina, CA 91722", accuracy: APPROX },

  // --- La Puente 91746 ---------------------------------------------------
  "tepeyac-la-puente": { lat: 34.0130, lng: -117.9640, matchedAddress: "13131 Crossroads Pkwy S Ste C, La Puente, CA 91746", accuracy: APPROX },

  // --- Chino Hills 91709 --------------------------------------------------
  "bww-chino-hills": { lat: 33.9930, lng: -117.7290, matchedAddress: "3160 Chino Ave, Chino Hills, CA 91709", accuracy: APPROX },

  // --- Pomona 91766 --------------------------------------------------------
  "odonovans-pomona": { lat: 34.0555, lng: -117.7495, matchedAddress: "101 E 3rd St, Pomona, CA 91766", accuracy: APPROX },
};

export const COORDINATES_LOADED = Object.keys(COORDINATES).length > 0;

/** True while any coordinate is still unverified. Drives the banner. */
export const COORDINATES_APPROXIMATE = Object.values(COORDINATES).some(
  (p) => p.accuracy === "approximate",
);
