import type { EventPackage, Lane, Prospect } from "@/domain/types";
import { deskLines, type DeskLine } from "@/domain/selectors/desk";
import { OFFER_EXTENSIONS_BY_PROSPECT } from "@/data/conversations";
import { OFFER_BY_ID } from "@/data/venue";
import type { PipelineState } from "@/state/PipelineProvider";
import { sentTo, type OutboxState } from "@/state/OutboxProvider";

/**
 * WHO THIS PACKAGE IS FOR, IN THE ORDER THE DESK WOULD WORK THEM.
 *
 * Everywhere else in this application a rep starts from an organisation
 * and chooses what to say. On the packages screen the direction is
 * reversed: the package is in hand and the question is who gets it. A
 * picker that answered that with two hundred and eleven organisations in
 * alphabetical order would be a contact list, and a contact list is
 * exactly the thing this whole prototype exists to be better than.
 *
 * THE PACKAGE ALREADY KNOWS WHO IT SUITS. Every row in data/packages.ts
 * carries `laneFit`, which is Main Event's own published answer to which
 * kinds of buyer the package is written for. The All-Access Grad Pack
 * opens schools and colleges. The Main Event birthday opens youth sports
 * and faith and nonprofit. That is the narrowing, it is published rather
 * than invented, and it costs the reader nothing to check.
 *
 * THE ORDER IS THE DESK'S, NOT A SECOND OPINION. `deskLines` already
 * ranks the trade area, weights reachability heaviest, and shows its own
 * arithmetic on every row of /desk. Writing a second scoring function
 * here would mean two screens disagreeing about who to call first, which
 * is the fastest way to make a reader stop believing either. So this
 * calls the selector and filters what comes back.
 *
 * ── WHY THE BOARD FILTERS ARE SET ASIDE IN HERE ────────────────────
 * The lane filter, the search box and the emailable-only switch narrow
 * the DESK's working set. A reader arrived at this dialog from a package
 * card, not from the desk, and a picker that silently hid forty
 * candidates behind a switch somebody flipped on another screen is a
 * picker nobody can trust. The package's published lanes are the only
 * narrowing, and the dialog names them on screen.
 */

/** What has already been put in front of an organisation, and when. */
export type ReachKind = "promo-sent" | "offer-extended";

export interface PromoReach {
  kind: ReachKind;
  /** Glyph, word and figure. Never colour on its own. */
  glyph: string;
  label: string;
  /** What was put in front of them, named. */
  what: string;
  /** ISO stamp, as recorded. */
  at: string;
}

/**
 * Whether the modelled headcount clears the package's published minimum.
 *
 * "spans" is the honest middle case and it is the reason this is four
 * states rather than a boolean. A clinic modelled at 40 to 80 guests
 * against a minimum of 50 is neither in nor out; it is a question to ask
 * on the call, and rounding it to either answer would be this app
 * inventing a headcount it does not have.
 */
export type MinimumFit = "unstated" | "clears" | "spans" | "under";

export interface PromoCandidate {
  line: DeskLine;
  prospect: Prospect;
  /** Empty where this package has never been put to them. */
  reach: PromoReach[];
  minimum: MinimumFit;
  /** The published minimum, carried so the row can print the figure. */
  minGuests: number | null;
}

export interface PromoCandidateSet {
  /** The lanes this package opens, in the package's own order. */
  lanes: Lane[];
  /** Never had this package put in front of them. The answer to the question. */
  untold: PromoCandidate[];
  /** Already had it, or an offer covering it. Kept, ranked, and shown below. */
  told: PromoCandidate[];
}

function minimumFit(pkg: EventPackage, p: Prospect): MinimumFit {
  if (pkg.minGuests === null) return "unstated";
  if (p.headcountHigh < pkg.minGuests) return "under";
  if (p.headcountLow < pkg.minGuests) return "spans";
  return "clears";
}

/**
 * WHAT COUNTS AS HAVING BEEN TOLD, AND WHY IT IS TWO DIFFERENT FACTS.
 *
 * The strong signal is an outbox row carrying this exact package id.
 * That is a letter this desk actually sent about this exact product, and
 * there is nothing to interpret.
 *
 * The weaker signal is an offer extension. Those point at an id in
 * OFFERS rather than at a package, and each offer publishes the package
 * families it is eligible for. An organisation that has already been
 * given the midweek daytime rate lock has had a corporate conversation
 * about corporate hours, and sending them a corporate promo as though
 * the subject were new is how a rep repeats himself in writing. It is a
 * softer fact than the first, so it is labelled as what it is rather
 * than merged into one count.
 */
function reachFor(
  pkg: EventPackage,
  prospectId: string,
  outbox: OutboxState,
): PromoReach[] {
  const out: PromoReach[] = [];

  for (const row of sentTo(outbox, prospectId)) {
    if (row.packageId !== pkg.id) continue;
    out.push({
      kind: "promo-sent",
      glyph: "▤",
      label: "Sent",
      what: pkg.name,
      at: row.sentAt,
    });
  }

  for (const ext of OFFER_EXTENSIONS_BY_PROSPECT[prospectId] ?? []) {
    const offer = OFFER_BY_ID[ext.offerId];
    if (!offer) continue;
    if (!offer.eligiblePackageFamilies.includes(pkg.family)) continue;
    out.push({
      kind: "offer-extended",
      glyph: "◈",
      label: `Offer ${ext.state}`,
      what: offer.name,
      at: ext.extendedAt,
    });
  }

  return out;
}

export function promoCandidates(
  pkg: EventPackage,
  pipeline: PipelineState,
  outbox: OutboxState,
  nowMonth: number,
): PromoCandidateSet {
  const lanes = pkg.laneFit;

  const ranked = deskLines(
    { ...pipeline, laneFilter: [], query: "", emailableOnly: false },
    { nowMonth },
  ).filter((line) => lanes.includes(line.prospect.lane));

  const untold: PromoCandidate[] = [];
  const told: PromoCandidate[] = [];

  for (const line of ranked) {
    const reach = reachFor(pkg, line.prospect.id, outbox);
    const candidate: PromoCandidate = {
      line,
      prospect: line.prospect,
      reach,
      minimum: minimumFit(pkg, line.prospect),
      minGuests: pkg.minGuests,
    };
    (reach.length === 0 ? untold : told).push(candidate);
  }

  return { lanes, untold, told };
}
