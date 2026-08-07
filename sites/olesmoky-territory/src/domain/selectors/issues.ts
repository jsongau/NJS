import type { PlanState } from "@/state/PlanProvider";
import type { SentMessage } from "@/state/OutboxProvider";
import { ACCOUNTS, ACCOUNT_BY_ID } from "@/data/accounts";
import { STATUS_BY_ACCOUNT } from "@/data/accountSkuStatus";
import { SKU_BY_ID } from "@/data/skus";
import { PACKAGE_BY_ID } from "@/data/packageFormats";
import { DELIVERY_WINDOW } from "@/lib/email/deliveryWindow";
import { weeklyRate } from "@/domain/rate";

/**
 * The issue register.
 *
 * WHY THIS IS DERIVED AND NOT A LIST. Every other tool of this kind ships
 * a table you type problems into, and every one of them goes stale inside
 * a fortnight, because keeping it current is somebody's least favourite
 * job. This register has no input. Each issue is computed from state the
 * app already holds — the plan, the outbox, the account fact table — so
 * an issue cannot be forgotten and cannot be quietly deleted. It stops
 * appearing when the underlying condition stops being true, which is the
 * only definition of "resolved" worth having.
 *
 * WHAT COUNTS AS AN ISSUE. Four things a Distributor Sales Executive
 * actually chases, in the order they cost money:
 *
 *   1. An unfunded promise. Retail was promised more cases than Southern Glazer's
 *      agreed to buy. This is the worst one in the list, because the
 *      store has been told something that is now not true, and the app
 *      caused it rather than observed it.
 *   2. A message with no answer past the load cutoff. The order did not
 *      fail; it was never decided, and nobody notices a non-decision.
 *   3. A cut line. The store said yes to most of it, and the part they
 *      cut is still a gap on their shelf.
 *   4. A door earning nothing. Authorized, not stocked, with real modeled
 *      movement behind it — the cheapest volume in the territory and the
 *      easiest to leave sitting.
 *
 * Severity is cases at risk per week, not a colour someone picked.
 */

export type IssueKind =
  | "unfunded"
  | "no-answer"
  | "cut-line"
  | "empty-door";

export type IssueSeverity = "high" | "medium" | "low";

export interface Issue {
  /** Stable across recomputes, so a disposition sticks to its issue. */
  id: string;
  kind: IssueKind;
  severity: IssueSeverity;
  title: string;
  detail: string;
  accountId?: string;
  skuId?: string;
  /**
   * Cases at stake, and the UNIT differs by kind — a void leaks cases
   * every week, an unanswered order is a one-time number. Summing them
   * under a single "cases a week" heading was a units error of exactly
   * the kind this app exists to avoid, so the unit travels with the
   * figure and the summary reports them separately.
   */
  casesAtRisk: number;
  casesUnit: "per week" | "one order";
  /** Days since the thing went wrong, where a date is knowable. */
  ageDays?: number;
  /** Whose problem it is. Naming an owner is most of resolution. */
  owner: string;
  /** The next physical action, not a status. */
  nextAction: string;
}

export const ISSUE_KIND: Record<
  IssueKind,
  { label: string; glyph: string; cssVar: string; why: string }
> = {
  unfunded: {
    label: "Unfunded promise",
    glyph: "▲",
    cssVar: "var(--risk)",
    why: "A store was promised cases the distributor did not buy.",
  },
  "no-answer": {
    label: "No answer",
    glyph: "○",
    cssVar: "var(--warn)",
    why: "Sent, past the load cutoff, never decided either way.",
  },
  "cut-line": {
    label: "Cut line",
    glyph: "◐",
    cssVar: "var(--warn)",
    why: "They took most of it. The part they cut is still a gap.",
  },
  "empty-door": {
    label: "Door earning nothing",
    glyph: "◆",
    cssVar: "var(--accent)",
    why: "Authorized, not stocked, with real movement behind it.",
  },
};

/** Whole days between two ISO dates, floored at zero. */
function daysBetween(fromIso: string, toMs: number): number {
  const from = Date.parse(`${fromIso}T00:00:00Z`);
  if (Number.isNaN(from)) return 0;
  return Math.max(0, Math.round((toMs - from) / 86_400_000));
}

function severityFor(casesAtRisk: number, kind: IssueKind): IssueSeverity {
  // An unfunded promise is high regardless of size, because the damage is
  // to a person's trust rather than to a case count.
  if (kind === "unfunded") return "high";
  if (casesAtRisk >= 20) return "high";
  if (casesAtRisk >= 8) return "medium";
  return "low";
}

export interface IssueInputs {
  plan: PlanState;
  sent: SentMessage[];
  /** Today, passed in rather than read, so this stays a pure function. */
  nowMs: number;
}

export function openIssues({ plan, sent, nowMs }: IssueInputs): Issue[] {
  const issues: Issue[] = [];

  // --- 1. Unfunded promises -------------------------------------------
  // Cases promised at retail against cases Southern Glazer's actually agreed to buy,
  // per SKU. The plan already tracks both ledgers; this is the gap.
  const promisedBySku = new Map<string, number>();
  for (const l of plan.retail) {
    promisedBySku.set(l.skuId, (promisedBySku.get(l.skuId) ?? 0) + l.cases);
  }
  const boughtBySku = new Map<string, number>();
  for (const l of plan.sellIn) {
    const r = plan.distributorResponses[l.id];
    const accepted =
      r?.disposition === "declined" ? 0 : (r?.acceptedCases ?? l.cases);
    boughtBySku.set(l.skuId, (boughtBySku.get(l.skuId) ?? 0) + accepted);
  }
  for (const [skuId, promised] of promisedBySku) {
    // Only a gap once something has been bought at all. A plan with no
    // sell-in yet is unwritten, not broken, and flagging it would train
    // people to ignore the register.
    if (plan.sellIn.length === 0) break;
    const bought = boughtBySku.get(skuId) ?? 0;
    const gap = promised - bought;
    if (gap <= 0) continue;
    const accounts = plan.retail
      .filter((l) => l.skuId === skuId)
      .map((l) => ACCOUNT_BY_ID[l.accountId]?.chainName)
      .filter(Boolean);
    issues.push({
      id: `unfunded:${skuId}`,
      kind: "unfunded",
      severity: severityFor(gap, "unfunded"),
      title: `${SKU_BY_ID[skuId]?.label ?? skuId} is short ${gap} cases`,
      detail: `Promised ${promised} cases at retail, Southern Glazer's bought ${bought}. ${accounts.length} store${accounts.length === 1 ? "" : "s"} affected: ${[...new Set(accounts)].join(", ")}.`,
      skuId,
      casesAtRisk: gap,
      casesUnit: "one order",
      owner: "Me, before the store finds out",
      nextAction:
        "Either get Southern Glazer's to take the balance or call the store and revise the number down. Do not let them discover it on the truck.",
    });
  }

  // --- 2. No answer ----------------------------------------------------
  for (const m of sent) {
    if (m.outcome !== "no-reply" && m.outcome !== "awaiting") continue;
    const age = daysBetween(m.sentAt, nowMs);
    // Inside the delivery week it is not yet a problem, it is a wait.
    if (age < 3) continue;
    issues.push({
      id: `no-answer:${m.id}`,
      kind: "no-answer",
      severity: severityFor(m.totalCases, "no-answer"),
      title: `${m.storeName} has not answered`,
      detail: `${m.totalCases} cases across ${m.lineCount} lines, sent ${age} days ago on the "${m.draftLabel}" opener. ${DELIVERY_WINDOW.cutoffLabel} has passed at least once since.`,
      accountId: m.accountId,
      casesAtRisk: m.totalCases,
      casesUnit: "one order",
      ageDays: age,
      owner: "Me",
      nextAction:
        "One operational nudge, not a second pitch: the cutoff is Thursday, still good? Then let it go and rebuild it next pass.",
    });
  }

  // --- 3. Cut lines ----------------------------------------------------
  for (const m of sent) {
    if (m.outcome !== "cut") continue;
    issues.push({
      id: `cut:${m.id}`,
      kind: "cut-line",
      severity: "low",
      title: `${m.storeName} cut part of the order`,
      detail:
        m.reply ??
        "They took most of it and removed at least one line. The reason usually names the real constraint.",
      accountId: m.accountId,
      casesAtRisk: 0,
      casesUnit: "one order",
      ageDays: daysBetween(m.sentAt, nowMs),
      owner: "Me, on the next pass",
      nextAction:
        "Find out whether the cut was space, cash, or the item. Space is solvable by me; the other two are not, and knowing which saves the next three visits.",
    });
  }

  // --- 4. Doors earning nothing ---------------------------------------
  // Authorized, not stocked, with meaningful modeled movement. Ranked and
  // capped, because a register of forty voids is a register nobody opens.
  const voids: Issue[] = [];
  for (const account of ACCOUNTS) {
    for (const row of STATUS_BY_ACCOUNT[account.id] ?? []) {
      if (row.status !== "void") continue;
      if (row.baseWeeklyCases < 4) continue;
      const sku = SKU_BY_ID[row.skuId];
      const pkg = PACKAGE_BY_ID[sku?.packageFormatId ?? ""];
      voids.push({
        id: `void:${account.id}:${row.skuId}`,
        kind: "empty-door",
        severity: severityFor(row.baseWeeklyCases, "empty-door"),
        title: `${sku?.label ?? row.skuId} is not on the shelf at ${account.chainName}`,
        detail: `Available to this account and modelled at ${weeklyRate(ACCOUNT_BY_ID[row.accountId], row.baseWeeklyCases, pkg?.unitsPerCase ?? 12).text} here. ${pkg?.shortLabel ?? ""} — no listing to chase and no paperwork, it is simply not stocked.`,
        accountId: account.id,
        skuId: row.skuId,
        casesAtRisk: row.baseWeeklyCases,
        casesUnit: "per week",
        owner: "Southern Glazer's rep, with me on the first call",
        nextAction: `Open it on the next visit to ${account.city}. It is already available through the wholesaler, so this is a space conversation, not a listing one.`,
      });
    }
  }
  voids.sort((a, b) => b.casesAtRisk - a.casesAtRisk);
  issues.push(...voids.slice(0, 8));

  /**
   * Ranked by what it costs, then by how long it has been costing it.
   * Severity ordering first so an unfunded promise never sits below a
   * void, however large the void is.
   */
  /**
   * KIND outranks size. An unfunded promise is a person who has been told
   * something untrue, and it belongs above a bigger number that is merely
   * a missed opportunity — sorting on cases alone put a 64-case silence
   * above a 23-case broken promise, which is the wrong instruction to
   * give somebody at nine on a Monday.
   */
  const kindRank: Record<IssueKind, number> = {
    unfunded: 0,
    "no-answer": 1,
    "cut-line": 2,
    "empty-door": 3,
  };
  const sevRank: Record<IssueSeverity, number> = { high: 0, medium: 1, low: 2 };
  return issues.sort(
    (a, b) =>
      kindRank[a.kind] - kindRank[b.kind] ||
      sevRank[a.severity] - sevRank[b.severity] ||
      b.casesAtRisk - a.casesAtRisk ||
      (b.ageDays ?? 0) - (a.ageDays ?? 0),
  );
}
