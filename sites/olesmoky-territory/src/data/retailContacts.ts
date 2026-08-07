import type { Account, Channel, RetailContact } from "@/domain/types";
import { ACCOUNTS } from "./accounts";

/**
 * The desk on file at each account.
 *
 * Two rules govern this file, and both come straight from the brief.
 *
 * No person is named. A store's spirits buyer is a real human being with a
 * real job, and inventing one to make a prototype look populated is the
 * kind of detail that reads as careless the moment a real buyer sees it.
 * The app addresses a ROLE, which is also how a rep would write to a
 * store they had not met yet.
 *
 * No address is routable. Every mailbox lands on a `demo-*.local`
 * hostname, and `.local` is reserved by RFC 6762 for local network
 * naming. It cannot resolve on the public internet, so even a mistake in
 * the transport layer has nowhere to deliver.
 *
 * The addresses are derived from the account rather than typed in, so
 * adding a store to accounts.ts cannot leave it without a desk, and no
 * one has to remember to keep two lists in step.
 */

/**
 * The manager, at a store that has one.
 *
 * An earlier version routed each channel to its own title — category
 * buyer at mass, beverage buyer at grocery, spirits buyer at a bottle shop.
 * Accurate for a CHAIN conversation, and wrong for this one. Every page
 * in this app is about a single address: what is empty on that store's
 * shelf, this week. The person who decides what lands on that store's
 * next truck is the manager standing in it, and writing over their head
 * to a buyer at head office is how a rep loses the store.
 *
 * Still no person is named. A store manager is a real human being with a
 * real job, and inventing one to make a prototype look populated is the
 * detail that reads as careless the moment a real manager sees it.
 */
const MANAGER = { role: "Store manager", mailbox: "manager" };

/**
 * The owner, at a store where the owner is the buyer.
 *
 * Ten of the twelve retail accounts here are independent bottle shops.
 * Writing "Store manager" to a shop the owner stands in every day is the
 * mail-merge tell — there is no manager, there is Renee. The role is
 * still not a name, because inventing one is worse, but "Owner" is the
 * correct role and it is the one a rep would actually address.
 */
const OWNER = { role: "Owner", mailbox: "owner" };

/**
 * On-premise, and this is where the role genuinely changes the message.
 *
 * A BAR MANAGER decides what is behind the bar and what the staff pours.
 * A GENERAL MANAGER at a chain casual-dining room does not — the back
 * bar is set at head office and the local decision is which of the
 * approved brands gets the feature, the menu line and the event. Writing
 * a distribution ask to a chain GM asks them for something they cannot
 * give; writing a promotion ask to an independent bar manager is exactly
 * right. Getting this fork wrong is the fastest way to be ignored by
 * both.
 */
const BAR_MANAGER = { role: "Bar manager", mailbox: "bar" };
const GENERAL_MANAGER = { role: "General manager", mailbox: "gm" };

const ROLE_BY_CHANNEL: Record<Channel, { role: string; mailbox: string }> = {
  // Off-premise
  "liquor-store": OWNER,
  "neighborhood-market": OWNER,
  convenience: MANAGER,
  "fuel-convenience": MANAGER,
  "beverage-specialty": MANAGER,
  // On-premise
  "casual-dining": GENERAL_MANAGER,
  "sports-bar": BAR_MANAGER,
  steakhouse: BAR_MANAGER,
  "bowling-entertainment": GENERAL_MANAGER,
  pub: BAR_MANAGER,
};

/**
 * Banner name to a demo hostname.
 *
 * Apostrophes are deleted rather than replaced, which is the difference
 * between demo-sams-club and demo-sam-s-club. Small, but a rep pasting
 * the second one into a message would notice, and so would a hiring
 * manager reading over their shoulder.
 */
function bannerSlug(chainName: string): string {
  return chainName
    .toLowerCase()
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Banners that appear at more than one address in this territory.
 *
 * THIS SET IS THE FIX FOR A BUG THIS ROSTER INTRODUCED. There are three
 * Applebee's and four Buffalo Wild Wings on the locator listing, and the
 * old rule — one mailbox per banner — gave all seven the same address.
 * A rep would have sent the Walnut order to the same inbox as the La
 * Habra order, twice, and the app would have shown both as delivered.
 *
 * The site is appended only where the banner is genuinely repeated, so
 * the single-site independents keep the short, readable address. Computed
 * from the roster rather than listed by hand, so opening a fourth
 * Applebee's cannot reintroduce the collision.
 */
const REPEATED_BANNERS = new Set(
  Object.entries(
    ACCOUNTS.reduce<Record<string, number>>((n, a) => {
      const k = bannerSlug(a.chainName);
      n[k] = (n[k] ?? 0) + 1;
      return n;
    }, {}),
  )
    .filter(([, n]) => n > 1)
    .map(([k]) => k),
);

export function retailContactFor(account: Account): RetailContact {
  const { role, mailbox } = ROLE_BY_CHANNEL[account.channel];
  const banner = bannerSlug(account.chainName);
  const host = REPEATED_BANNERS.has(banner)
    ? `demo-${banner}-${bannerSlug(account.city)}`
    : `demo-${banner}`;
  return { email: `${mailbox}@${host}.local` as RetailContact["email"], role };
}

export const RETAIL_CONTACT_BY_ACCOUNT: Record<string, RetailContact> =
  Object.fromEntries(ACCOUNTS.map((a) => [a.id, retailContactFor(a)]));
