/**
 * Where links are shaped.
 *
 * Three surfaces build a link to a proposal: the desk row, the compose
 * window and the outbox log. In the build this was forked from those
 * three had drifted apart within a day of each other, which is how a
 * link ends up working from one screen and landing on a 404 from
 * another. One function, one shape, one place to change it.
 *
 * `import.meta.env.BASE_URL` IS THE LOAD-BEARING PART. This app is served
 * from nathanjsong.com/me, so a URL built from the route alone would
 * drop the prefix and land on the portfolio site's 404 rather than on the
 * proposal. It also has to survive the preview build, which is opened
 * from a Downloads folder over file:// with a hash router and no base at
 * all. Reading the base at runtime is what makes one function correct in
 * both.
 */

/**
 * The reference that rides along on a proposal link.
 *
 * It says DEMO in the middle of it deliberately. This string ends up in a
 * URL a reader may well copy, and anybody who sees it should be told what
 * it is without having to find the badge in the chrome.
 */
export const DEMO_QUOTE_REF = "WEST-DEMO-QUOTE";

function origin(): string {
  return typeof window !== "undefined"
    ? `${window.location.origin}${import.meta.env.BASE_URL}`
    : "/";
}

export interface QuoteLinkOptions {
  /** The offer or plan the proposal is written against. */
  packageId?: string;
  /** Doors actually discussed. Never a hoped-for number. */
  guests?: number;
  /** ISO date being proposed for the work. */
  date?: string;
  ref?: string;
}

/**
 * The customer-facing proposal.
 *
 * This route sits OUTSIDE the app shell on purpose. A property manager
 * arrives here from an email and has no business seeing the division's
 * internal navigation: the desk, the score that ranked them, the
 * capacity chart showing which crew days are nearly gone. Showing it
 * would be the digital equivalent of handing a customer your call sheet.
 *
 * The parameters are all optional because the bare link is a valid thing
 * to send. A proposal with no door count in it is an invitation to
 * supply one, and that is often the entire purpose of the first message.
 */
export function quoteLink(
  prospectId: string,
  options: QuoteLinkOptions = {},
): string {
  const base = `${origin()}quote/${prospectId}`;
  const params = new URLSearchParams();
  if (options.packageId) params.set("package", options.packageId);
  if (options.guests) params.set("guests", String(options.guests));
  if (options.date) params.set("date", options.date);
  params.set("ref", options.ref ?? DEMO_QUOTE_REF);
  return `${base}?${params.toString()}`;
}

/**
 * A route inside the shell, absolute.
 *
 * For the few places that need a full URL to an internal screen, such as
 * a copy-link control. Everything else should use react-router's own
 * <Link>, which already knows the basename.
 */
export function appLink(path: string): string {
  return `${origin()}${path.replace(/^\//, "")}`;
}

/**
 * Service Champions' own published pages, so a screen can cite its
 * source.
 *
 * These are the real URLs every figure in data/packages.ts and
 * data/venue.ts was read from on 18 August 2026. Kept here so a citation
 * link and the provenance badge beside it can never disagree about where
 * a number came from.
 *
 * WHAT THIS SET GETS WRONG, and it is worth saying rather than hiding.
 * The key names are inherited from the console this one was forked from
 * and they no longer describe what they point at: `corporateEvents` is
 * the live summer campaign, `schoolEvents` is the membership programme,
 * `bookEvent` is the financing page. An identifier is a join key that
 * half a dozen files import, and renaming it across a codebase other
 * people are editing this week would cost more than the confusion of
 * reading it here. The URLs are right, the labels beside them on screen
 * are right, and the keys are on the list of things to rename in one
 * pass rather than six.
 *
 * The four offer index pages render their coupon grids client-side and
 * returned no pricing to the fetcher, so /summer-savings/ is the only
 * page in this set that exposed concrete figures. Everything priced in
 * this console for the anchor brand came off that one URL.
 */
export const SOURCE_LINKS = {
  breaLocation: "https://servicechampions.com/contact-us/",
  corporateEvents: "https://servicechampions.com/summer-savings/",
  schoolEvents: "https://servicechampions.com/champ-rewards/",
  groupEvents: "https://servicechampions.com/service-area/",
  bookEvent: "https://servicechampions.com/financing/",
  contact: "https://servicechampions.com/all-offers/",
} as const;
