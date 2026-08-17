/**
 * Where links are shaped.
 *
 * Three surfaces build a link to a group quote: the desk row, the compose
 * window and the outbox log. In the build this was forked from those three
 * had drifted apart within a day of each other, which is how a link ends
 * up working from one screen and landing on a 404 from another. One
 * function, one shape, one place to change it.
 *
 * `import.meta.env.BASE_URL` IS THE LOAD-BEARING PART. This app is served
 * from nathanjsong.com/me, so a URL built from the route alone would
 * drop the prefix and land on the portfolio site's 404 rather than on the
 * quote. It also has to survive the preview build, which is opened from a
 * Downloads folder over file:// with a hash router and no base at all.
 * Reading the base at runtime is what makes one function correct in both.
 */

/**
 * The reference that rides along on a quote link.
 *
 * It says DEMO in the middle of it deliberately. This string ends up in a
 * URL a reader may well copy, and anybody who sees it should be told what
 * it is without having to find the badge in the chrome.
 */
export const DEMO_QUOTE_REF = "MEB-DEMO-QUOTE";

function origin(): string {
  return typeof window !== "undefined"
    ? `${window.location.origin}${import.meta.env.BASE_URL}`
    : "/";
}

export interface QuoteLinkOptions {
  /** The package the quote is written against. */
  packageId?: string;
  /** Guests actually discussed. Never a hoped-for number. */
  guests?: number;
  /** ISO date being held or proposed. */
  date?: string;
  ref?: string;
}

/**
 * The prospect-facing group quote.
 *
 * This route sits OUTSIDE the app shell on purpose. A school activities
 * director arrives here from an email and has no business seeing the
 * venue's internal navigation: the desk, the score that ranked them, the
 * capacity chart showing which dates are nearly gone. Showing it would be
 * the digital equivalent of handing a customer your call sheet.
 *
 * The parameters are all optional because the bare link is a valid thing
 * to send. A quote with no headcount in it is an invitation to supply
 * one, and that is often the entire purpose of the first message.
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
 * Round1's own published pages, so a screen can cite its source.
 *
 * These are the real URLs every figure in data/packages.ts and
 * data/venue.ts was read from. Kept here so a citation link and the
 * provenance badge beside it can never disagree about where a number
 * came from.
 *
 * FOUR PAGES IS THE WHOLE OF IT, and that is the finding rather than a
 * shortage of effort. The corporate profile, the party booking page, the
 * party room page and the nearest store page are every page this
 * application takes a fact from. Between them they publish one package,
 * one booking term, one support number, one set of store hours and no
 * price of any kind.
 */
export const SOURCE_LINKS = {
  profile: "https://www.round1usa.com/profile",
  bookAParty: "https://www.round1usa.com/book-a-party",
  partyRoom: "https://www.round1usa.com/activities-list/partyroom",
  nearestStore: "https://www.round1usa.com/locations/lakewood-center-mall",
} as const;
