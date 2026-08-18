import type {
  DatedLossRow,
  LossCause,
  LossEvidence,
  LossFilter,
  LossRow,
  PromotionStanding,
  RecallStanding,
  RivalPromotion,
} from "@/domain/rivals";
import { RECALL_WINDOW_DAYS } from "@/domain/rivals";
import { CAUSE_BY_OBJECTION, LOSS_NOTES } from "@/data/rivals";
import { CONVERSATIONS, MESSAGES_BY_PROSPECT } from "@/data/conversations";
import { PROSPECT_BY_ID } from "@/data/prospects";
import { SEED_REPLIES } from "@/data/book";
import { OBJECTIONS } from "@/data/objections";
import { daysBetween } from "@/domain/licensing";

/**
 * WIN AND LOSS, DERIVED FROM THE RECORD RATHER THAN TYPED BESIDE IT.
 *
 * ── WHY THE LOSS REGISTER IS BUILT OUT OF MESSAGES ────────────────
 * A loss row could have been a seed file: organisation, date, reason,
 * done. It is derived from `data/conversations.ts` instead, and the
 * difference matters more here than anywhere else in the application.
 *
 * A typed loss reason is a claim. A derived one is a reading of a
 * thread somebody can open and check, and the check is the whole
 * point: the register says a site was lost to a maintenance agreement
 * already in place with another contractor, and a sceptical reader can
 * go and find the message that says so, in the account's own words,
 * with a date on it. Nothing on this screen asks to be believed.
 *
 * It also means the register cannot drift. Change the thread and the
 * loss row changes with it. Add a fourth loss to the record and it
 * appears here without anybody remembering to add it twice.
 *
 * ── THE ONE THING A ONE PERSON DESK CANNOT FIX, MEASURED ANYWAY ───
 * Win and loss practice says the seller should not collect the reason,
 * because a seller leading the interview hears what they want. A
 * division marketer working a territory alone has no independent
 * interviewer and never will. So the selector grades the evidence
 * instead: a reason that arrived inbound and unsummarised is the
 * account's own words, and a reason summarised after a phone call is
 * the desk's recollection. Both are kept, both are labelled, and the
 * page never adds them together as though they were the same kind of
 * fact.
 *
 * ── THE CLOCK IS AN ARGUMENT, NOT AN ORNAMENT ─────────────────────
 * The same practice says a reason should be collected inside three
 * months, because after that the buyer's memory of the evaluation has
 * been overwritten by everything that happened since. That makes every
 * loss on this page a thing with a deadline, and it is the reason this
 * screen genuinely reads differently on different days rather than
 * merely printing a different date at the top. On the board day all
 * three losses are still worth ringing about. By the end of December
 * none of them is, and the page says so plainly instead of showing the
 * same three rows for ever.
 */

// ---------------------------------------------------------------
// The losses on record
// ---------------------------------------------------------------

/** The signals that mean somebody said no. */
const NO_SIGNALS = new Set(["said-no", "booked-elsewhere"]);

/** Everything the record can prove about the deals that died. */
export function lossRows(): LossRow[] {
  const out: LossRow[] = [];

  for (const message of CONVERSATIONS) {
    if (message.effect.movedStatusTo !== "lost") continue;

    const prospect = PROSPECT_BY_ID[message.prospectId];
    if (!prospect) continue;

    const lostOn = message.at.slice(0, 10);
    const thread = MESSAGES_BY_PROSPECT[message.prospectId] ?? [];

    /*
      The reason is the last inbound message carrying a no signal. It is
      searched for separately from the message that moved the status,
      because those are two different events and in this record they are
      genuinely different messages: the desk closed one account as lost
      at eleven in the morning and the account's own sentence arrived at
      half past four the same afternoon.
    */
    const reasonMessage =
      [...thread]
        .filter(
          (m) =>
            m.direction === "inbound" &&
            (m.effect.signals ?? []).some((s) => NO_SIGNALS.has(s)),
        )
        .sort((a, b) => (a.at < b.at ? 1 : -1))[0] ?? null;

    const evidence: LossEvidence = !reasonMessage
      ? "no-reason-on-file"
      : reasonMessage.summarised
        ? "seat-wrote-it"
        : "buyer-wrote-it";

    /* The objection the reply file already pinned to this organisation,
       where one did. Only one of the three losses has one, the other two
       having no reply on file at all, and the row says so rather than
       borrowing one. */
    const objectionId = SEED_REPLIES.find(
      (r) => r.prospectId === message.prospectId && r.objectionId,
    )?.objectionId;

    /* The classification comes from the annotated note, which carries
       its own sentence of reasoning. Where a note is missing the row
       falls back to the objection's own class, and where there is
       neither it is left as this brand's own gap rather than credited
       to a competitor nobody named. */
    const note = LOSS_NOTES[message.prospectId];
    const cause: LossCause =
      note?.cause ??
      (objectionId ? CAUSE_BY_OBJECTION[objectionId]?.cause : undefined) ??
      "our-own-gap";

    out.push({
      prospectId: message.prospectId,
      name: prospect.name,
      lane: prospect.lane,
      lostOn,
      objectionId,
      cause,
      because: note?.because,
      evidence,
      reason:
        reasonMessage?.body ??
        "Nothing inbound on this thread carries a reason. The record shows the gap rather than filling it.",
      channel: reasonMessage?.channel ?? message.channel,
      namedCompetitor: note?.namedCompetitor ?? null,
      messageId: reasonMessage?.id,
    });
  }

  return out.sort((a, b) => (a.lostOn < b.lostOn ? -1 : 1));
}

// ---------------------------------------------------------------
// The recall window
// ---------------------------------------------------------------

/** Where one loss sits against the ninety day window on a given day. */
export function recallStandingOf(lostOn: string, asOf: string): RecallStanding {
  const days = daysBetween(lostOn, asOf);
  if (days < 0) return "not-yet";
  return days <= RECALL_WINDOW_DAYS ? "askable" : "cold";
}

/** Every loss, read against the date the reader is standing on. */
export function datedLossRows(asOf: string): DatedLossRow[] {
  return lossRows().map((row) => {
    const daysSince = daysBetween(row.lostOn, asOf);
    const standing = recallStandingOf(row.lostOn, asOf);
    return {
      ...row,
      standing,
      daysSince,
      daysLeft:
        standing === "askable" ? Math.max(0, RECALL_WINDOW_DAYS - daysSince) : 0,
    };
  });
}

/** The rows one filter shows. Cold rows are kept, never dropped. */
export function filteredLosses(
  rows: DatedLossRow[],
  filter: LossFilter,
): DatedLossRow[] {
  if (filter === "askable") return rows.filter((r) => r.standing === "askable");
  if (filter === "cold") return rows.filter((r) => r.standing === "cold");
  return rows;
}

// ---------------------------------------------------------------
// The shape of the loss book
// ---------------------------------------------------------------

export interface LossReading {
  total: number;
  /** Losses where the account named another contractor at all. */
  namedAnyone: number;
  /** Losses to a competing home services brand. The point of the reading. */
  toACategoryRival: number;
  /** Reasons that are on file in the account's own words. */
  buyerWroteIt: number;
  /** Reasons the desk wrote down afterwards. */
  seatWroteIt: number;
  /** Still inside the ninety day window on the day being read. */
  askable: number;
  /** Past it. */
  cold: number;
}

/**
 * The count that decides the screen.
 *
 * `toACategoryRival` is zero and it is computed rather than asserted,
 * which is the only reason it is worth printing. Not one of the losses
 * on record went to a competing contractor on price. One went to a
 * maintenance agreement already in place that renews without going out
 * to bid, one to an account that keeps maintenance staff of its own,
 * and one to a replacement signed in July at the top of the cooling
 * season, months before this desk had anybody to ask. Three losses,
 * three calendars, and not a coupon among them.
 */
export function lossReading(rows: DatedLossRow[]): LossReading {
  return {
    total: rows.length,
    namedAnyone: rows.filter((r) => r.namedCompetitor !== null).length,
    toACategoryRival: rows.filter((r) => r.cause === "a-named-competitor")
      .length,
    buyerWroteIt: rows.filter((r) => r.evidence === "buyer-wrote-it").length,
    seatWroteIt: rows.filter((r) => r.evidence === "seat-wrote-it").length,
    askable: rows.filter((r) => r.standing === "askable").length,
    cold: rows.filter((r) => r.standing === "cold").length,
  };
}

// ---------------------------------------------------------------
// The objection register, classified
// ---------------------------------------------------------------

export interface CauseTally {
  cause: LossCause;
  count: number;
  /** The objections in this class, by their short handle. */
  shorts: string[];
}

/**
 * The seven objections sorted into what actually beats this brand.
 *
 * Walks OBJECTIONS rather than the classification table, so an
 * objection added to the register without a classification shows up as
 * an unclassified row instead of silently disappearing out of a total
 * that still claims to be seven.
 */
export function causeTallies(): { tallies: CauseTally[]; unclassified: string[] } {
  const order: LossCause[] = [
    "our-own-gap",
    "their-calendar",
    "a-named-competitor",
  ];
  const buckets = new Map<LossCause, string[]>(order.map((c) => [c, []]));
  const unclassified: string[] = [];

  for (const objection of OBJECTIONS) {
    const entry = CAUSE_BY_OBJECTION[objection.id];
    if (!entry) {
      unclassified.push(objection.short);
      continue;
    }
    buckets.get(entry.cause)?.push(objection.short);
  }

  return {
    tallies: order.map((cause) => ({
      cause,
      count: buckets.get(cause)?.length ?? 0,
      shorts: buckets.get(cause) ?? [],
    })),
    unclassified,
  };
}

/** Objections that are not somebody else winning. Four plus two. */
export function structuralCount(): number {
  const { tallies } = causeTallies();
  return tallies
    .filter((t) => t.cause !== "a-named-competitor")
    .reduce((sum, t) => sum + t.count, 0);
}

// ---------------------------------------------------------------
// A published promotion, read against the clock
// ---------------------------------------------------------------

/**
 * Where a competitor's dated promotion stands today.
 *
 * Three states rather than two, because the two deadlines are genuinely
 * different and a marketer needs to know which has passed. Once the
 * claim date is gone the coupon cannot be redeemed, but every job
 * already booked under it still gets done, which is a month in which a
 * rival is running discounted work and anyone quoting in the same week
 * is competing with the memory of that price.
 */
export function promotionStanding(
  promotion: RivalPromotion,
  asOf: string,
): PromotionStanding {
  if (daysBetween(asOf, promotion.booksBy) >= 0) return "live";
  if (daysBetween(asOf, promotion.heldBy) >= 0) return "booking-closed";
  return "expired";
}

export const PROMOTION_STANDING_META: Record<
  PromotionStanding,
  { label: string; glyph: string; cssVar: string; note: string }
> = {
  live: {
    label: "Claimable",
    glyph: "●",
    cssVar: "var(--warn)",
    note: "The coupon can still be claimed on the date being read. A household ringing two contractors has a printed discount in hand at one of them.",
  },
  "booking-closed": {
    label: "Closed to new claims",
    glyph: "◑",
    cssVar: "var(--neutral)",
    note: "Too late to claim it, and the jobs booked under it are still being done. Worth knowing before asking anybody to compare quotes.",
  },
  expired: {
    label: "Expired",
    glyph: "○",
    cssVar: "var(--neutral)",
    note: "Both dates are past. Kept on the register with its dates rather than deleted, because a promotion that ran is a fact about how a rival sells.",
  },
};
