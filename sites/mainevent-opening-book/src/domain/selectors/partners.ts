import type {
  Contract,
  Licence,
  Partner,
  PartnerKind,
  RelationshipState,
} from "@/domain/licensing";
import { daysBetween } from "@/domain/licensing";
import type { StatusToken } from "@/domain/vocabulary";
import { LICENCES, LICENCE_BY_ID, PARTNERS } from "@/data/partners";
import { CONTRACTS } from "@/data/spend";

/**
 * THE RELATIONSHIP REGISTER, DERIVED.
 *
 * The posting asks for one thing here and asks for it first: "Maintain
 * strong relationships with suppliers and licensors while scouting new
 * vendor opportunities." A register that only lists suppliers answers
 * half of that. The half it misses is the half that decays.
 *
 * A supplier relationship does not fail loudly. Nobody sends a letter
 * saying the relationship has lapsed. What happens is that four months
 * pass, the person who knew you leaves, and the next quote comes back at
 * list price from a stranger. So the figure this file exists to produce
 * is DAYS SINCE LAST WORKED, computed rather than stored, and every row
 * in the register carries it whether or not anybody wants to see it.
 *
 * Nothing here is stored. The seed carries a date; this file turns the
 * date into a number of days and a word, at render, against an injected
 * "today" so a screenshot taken in November still shows the arithmetic
 * that was true when it was taken.
 */

/**
 * How cold a relationship has gone.
 *
 * The thresholds are this application's own and no source publishes
 * anything like them. They are stated on screen next to the figure rather
 * than buried, because a bucket boundary a reader cannot see is a bucket
 * boundary they have to trust.
 */
export type Staleness = "worked" | "cooling" | "cold" | "gone-quiet";

export const STALENESS_META: Record<Staleness, StatusToken> = {
  worked: {
    glyph: "●",
    label: "Worked",
    cssVar: "var(--ok)",
    note: "Touched inside thirty days. The relationship is current.",
  },
  cooling: {
    glyph: "◐",
    label: "Cooling",
    cssVar: "var(--info)",
    note: "Thirty to sixty days. Still warm and worth a note before it is worth a call.",
  },
  cold: {
    glyph: "◔",
    label: "Cold",
    cssVar: "var(--warn)",
    note: "Sixty to a hundred and twenty days. Long enough that the next quote comes back at list price.",
  },
  "gone-quiet": {
    glyph: "✕",
    label: "Gone quiet",
    cssVar: "var(--risk)",
    note: "Over a hundred and twenty days. This is a relationship being rebuilt rather than maintained.",
  },
};

export const STALENESS_ORDER: Staleness[] = [
  "gone-quiet",
  "cold",
  "cooling",
  "worked",
];

/** The two boundaries a reader is shown, in days. */
export const STALENESS_DAYS = { cooling: 30, cold: 60, goneQuiet: 120 };

export function stalenessOf(days: number): Staleness {
  if (days >= STALENESS_DAYS.goneQuiet) return "gone-quiet";
  if (days >= STALENESS_DAYS.cold) return "cold";
  if (days >= STALENESS_DAYS.cooling) return "cooling";
  return "worked";
}

export interface PartnerRow {
  partner: Partner;
  /** Resolved from ids, so a row cannot display a licence that was deleted. */
  licences: Licence[];
  daysSinceWorked: number;
  staleness: Staleness;
  /** The agreement behind this relationship, where one exists at all. */
  contract: Contract | null;
  /** Working days, converted once so the reorder read has a denominator. */
  leadTimeWeeks: number;
}

/**
 * Every partner as a row, coldest first.
 *
 * The default order is deliberate and it is not alphabetical. This is a
 * maintenance register, and the thing it is for is finding the
 * relationship nobody has touched. Sorting by name produces a list that
 * looks like a directory and hides the one row that needs a phone call.
 */
export function partnerRows(asOf: string): PartnerRow[] {
  const rows = PARTNERS.map<PartnerRow>((partner) => {
    const days = Math.max(0, daysBetween(partner.lastWorked, asOf));
    return {
      partner,
      licences: partner.licenceIds
        .map((id) => LICENCE_BY_ID[id])
        .filter((l): l is Licence => Boolean(l)),
      daysSinceWorked: days,
      staleness: stalenessOf(days),
      contract: CONTRACTS.find((c) => c.partnerId === partner.id) ?? null,
      /* Five working days to the week, because lead times are quoted in
         working days and weeks of cover on the promo page are calendar
         weeks. Comparing the two without this conversion overstates every
         cover reading by two sevenths, which is exactly enough to leave a
         prize wall empty. */
      leadTimeWeeks: Math.round((partner.leadTimeDays / 5) * 10) / 10,
    };
  });

  rows.sort((a, b) => b.daysSinceWorked - a.daysSinceWorked);
  return rows;
}

export function partnerCountsByState(
  rows: PartnerRow[],
): Record<RelationshipState, number> {
  const out = {
    prospect: 0,
    "in-talks": 0,
    sampling: 0,
    contracted: 0,
    active: 0,
    "on-hold": 0,
    lapsed: 0,
  } satisfies Record<RelationshipState, number>;
  for (const r of rows) out[r.partner.state] += 1;
  return out;
}

export function partnerCountsByKind(
  rows: PartnerRow[],
): Record<PartnerKind, number> {
  const out = {
    manufacturing: 0,
    print: 0,
    signage: 0,
    "prize-redemption": 0,
    catering: 0,
    apparel: 0,
    logistics: 0,
  } satisfies Record<PartnerKind, number>;
  for (const r of rows) out[r.partner.kind] += 1;
  return out;
}

/** Rows past the cold boundary. The count the header shouts about. */
export function coldRows(rows: PartnerRow[]): PartnerRow[] {
  return rows.filter(
    (r) => r.staleness === "cold" || r.staleness === "gone-quiet",
  );
}

/** Rows with an agreement signed and nothing ordered against it. */
export function idleAgreements(rows: PartnerRow[]): PartnerRow[] {
  return rows.filter((r) => r.partner.state === "contracted");
}

export interface LicenceCoverage {
  licence: Licence;
  /** Partners who could carry it. Not partners who have been asked to. */
  partners: Partner[];
}

/**
 * Which partners can carry which property.
 *
 * THIS IS A CAPABILITY MAP AND NOT A DEAL LIST, and the distinction is
 * the single most important thing on the partners screen. Nature's Mark
 * publishes a list of properties it is licensed for. That is a fact about
 * Nature's Mark. It is not a fact about Main Event, about this
 * application, or about any promotion, and the page says so in one line
 * rather than leaving a reader to infer it from a table that looks like a
 * contract schedule.
 */
export function licenceCoverage(): LicenceCoverage[] {
  return LICENCES.map((licence) => ({
    licence,
    partners: PARTNERS.filter((p) => p.licenceIds.includes(licence.id)),
  }));
}
