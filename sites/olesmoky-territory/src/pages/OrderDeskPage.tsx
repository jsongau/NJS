import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import type { OrderLane } from "@/data/tradeTerms";
import type { DeskLine } from "@/domain/selectors/orderDesk";
import { linesForLane } from "@/domain/selectors/orderDesk";
import { ACCOUNTS, ACCOUNT_BY_ID } from "@/data/accounts";
import { RETAIL_CONTACT_BY_ACCOUNT } from "@/data/retailContacts";
import { DISTRIBUTOR_BY_ID, TERRITORY_BY_ID, PERIOD_BY_ID, PROMOTIONS } from "@/data/trade";
import { useTerritory } from "@/state/TerritoryProvider";
import { usePlanDispatch } from "@/state/PlanProvider";
import { useOutboxDispatch } from "@/state/OutboxProvider";
import { recommendedPlacement } from "@/domain/selectors/volume";
import { caseTerms } from "@/data/tradeTerms";
import { OrderBuilder } from "@/components/order/OrderBuilder";
import { OrderSummary } from "@/components/order/OrderSummary";
import { SellInLadder } from "@/components/order/SellInLadder";
import { SendModal } from "@/components/order/SendModal";
import { templatesFor } from "@/lib/email/templates";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import type { SendRecord } from "@/lib/email/transport";
import { buildRetailerEmail } from "@/lib/email/retailerEmail";
import { retailOrderLines } from "@/domain/selectors/retailOrder";
import { storeOrderLink } from "@/lib/links";
import styles from "./OrderDeskPage.module.css";

/**
 * The order desk. The front door.
 *
 * This used to be the territory map, and that was the wrong call. The job
 * of a Distributor Sales Executive ends in an order, and a visitor who
 * lands on a map has to work out what the map is for before they can see
 * the point. Now the order is the first thing on screen and the map is
 * one click away as the evidence behind any line.
 *
 * ONE LANE: a store. The desk used to offer a second lane that ordered
 * for the whole territory from Southern Glazer's, and it split the visitor's
 * attention before they had understood either one. Southern Glazer's has not gone
 * anywhere — the territory sell-in is what /plan and /distributor are —
 * but the thing you DO on the front page is walk into a store and write
 * its order.
 *
 * The tied-house rule still governs this screen and now governs all of
 * it: no price, no discount, no allowance, because in California a
 * supplier may price to a wholesaler and may not price to a retailer.
 * `tradeTerms.ts` enforces it in the data rather than in the markup.
 */

/** 99 Ranch, Rowland Heights. Tier-1 traffic and the clearest story on
 *  the route: a chinese-focus banner where domestic light competes with
 *  Asahi and Sapporo on the same back-shelf door. */
/**
 * The store this page opens on when no `?account=` is supplied.
 *
 * DERIVED, NOT TYPED, and the reason is that it was typed once and the
 * roster changed underneath it. The literal was "ranch99-nogales" — an
 * account that no longer exists — so the desk opened on a store the app
 * had never heard of and rendered its own header as
 * "undefined, undefined". Nothing threw. The page just quietly lied
 * about which store it was cutting an order for, which is the worst
 * possible failure for this particular screen.
 *
 * The first account on the roster is not a clever default, and it does
 * not need to be. It needs to EXIST, which the literal did not, and it
 * needs to keep existing when the roster changes again — which reading
 * it out of the roster guarantees and typing it never can.
 */
const DEFAULT_STORE = ACCOUNTS[0]?.id ?? "";

export function OrderDeskPage() {
  const territory = useTerritory();
  const planDispatch = usePlanDispatch();
  const outboxDispatch = useOutboxDispatch();
  const [params, setParams] = useSearchParams();

  /** Retained as a constant rather than deleted: every selector, every
   *  price guard and the plan ledger all key off it, and hard-coding
   *  "store" in twelve call sites would scatter the rule. */
  const lane: OrderLane = "store";
  const accountId = params.get("account") ?? DEFAULT_STORE;

  const distributor = DISTRIBUTOR_BY_ID[territory.distributorId];
  const terr = TERRITORY_BY_ID[territory.territoryId];
  const period = PERIOD_BY_ID[territory.periodId];
  const account = ACCOUNT_BY_ID[accountId];
  const contact = RETAIL_CONTACT_BY_ACCOUNT[accountId];

  const lines = useMemo(
    () => linesForLane(lane, accountId),
    [lane, accountId],
  );

  /**
   * Opens with an order already on the page, not an empty one, because a
   * blank builder makes the visitor do the work of deciding what matters.
   *
   * Capped at the four most urgent lines. Pre-selecting every short SKU
   * produced a twelve-line, five-thousand-case opening order, which is
   * not a number any real rep walks in with, and an opening screen that
   * looks invented undoes everything the reason lines are doing.
   */
  const suggested = useMemo(() => {
    const q: Record<string, number> = {};
    const urgent = lines
      .filter((l) => l.urgency === "critical" || l.urgency === "high")
      .slice(0, 4);
    for (const l of urgent) q[l.skuId] = l.suggestedCases;
    return q;
  }, [lines]);

  const [overrides, setOverrides] = useState<Record<string, number | null>>({});
  const [sent, setSent] = useState<SendRecord | null>(null);
  const [composing, setComposing] = useState(false);

  /**
   * Reset reaches this screen's own state too.
   *
   * The quantity diff lives here rather than in a provider because it is
   * meaningless anywhere else. That is the right call and it has a cost:
   * a global "reset everything" cannot see it. So the reset bumps a
   * counter and this screen watches the counter and clears itself, which
   * keeps the state local without letting the button lie about what it
   * did.
   */
  useEffect(() => {
    if (territory.resetNonce === 0) return;
    setOverrides({});
    setSent(null);
    setComposing(false);
  }, [territory.resetNonce]);

  /**
   * Quantities are the suggestion plus whatever the user changed. Storing
   * only the diff means switching lanes or stores re-suggests correctly
   * instead of carrying another store's numbers across.
   */
  const quantities = useMemo(() => {
    const q: Record<string, number> = { ...suggested };
    for (const [skuId, v] of Object.entries(overrides)) {
      if (v === null) delete q[skuId];
      else q[skuId] = v;
    }
    return q;
  }, [suggested, overrides]);

  const setAccount = (id: string) => {
    const p = new URLSearchParams(params);
    p.set("lane", "store");
    p.set("account", id);
    setParams(p, { replace: true });
    setOverrides({});
    setSent(null);
  };

  const onAdd = useCallback((line: DeskLine, cases: number) => {
    setOverrides((o) => ({ ...o, [line.skuId]: cases }));
  }, []);

  const onSet = useCallback((skuId: string, cases: number) => {
    setOverrides((o) => ({ ...o, [skuId]: cases }));
  }, []);

  const onRemove = useCallback((skuId: string) => {
    setOverrides((o) => ({ ...o, [skuId]: null }));
  }, []);

  const chosen = lines.filter((l) => quantities[l.skuId] !== undefined);

  /** The Labor Day allowance is the one attached to a territory sell-in. */
  const allowancePerCase =
    PROMOTIONS.find((p) => p.id === "labor-day-2026")?.distributorAllowancePerCase ?? 0;

  const link = useMemo(() => {
    const rl = retailOrderLines(accountId).filter((l) =>
      chosen.some((c) => c.skuId === l.skuId),
    );
    return storeOrderLink(accountId, rl);
  }, [accountId, chosen]);

  /**
   * Builds the message from the current order plus whatever the rep typed
   * in the compose window. A function rather than a value because the
   * modal rebuilds on every keystroke to keep the preview honest.
   */
  const buildEmail = (note: string, subjectOverride: string) => {
    if (chosen.length === 0) return null;
    if (account && contact) {
      return buildRetailerEmail({
        account,
        contact,
        lines: retailOrderLines(accountId).filter((l) =>
          chosen.some((c) => c.skuId === l.skuId),
        ),
        quantities,
        portalLink: link,
        reference: "OS-DEMO-STORE-0042",
        preparedBy: "Nathan J. Song",
        distributorName: distributor?.name ?? "the wholesaler",
        note,
        subjectOverride,
      });
    }
    return null;
  };

  const defaultSubject = buildEmail("", "")?.subject ?? "";

  /** Drafts written from the selected lines, rebuilt when they change. */
  const templates = useMemo(
    () =>
      templatesFor(chosen, lane, quantities, {
        territoryName: terr?.name ?? "the territory",
        storeName: account ? `${account.chainName}, ${account.city}` : undefined,
        totalCases: chosen.reduce((n, l) => n + (quantities[l.skuId] ?? 0), 0),
        // The account is what picks the voice. Passing the store NAME but
        // not the store was the bug that made every draft read like a
        // supermarket letter regardless of who it was going to.
        account,
      }),
    [chosen, lane, quantities, terr, account],
  );

  /**
   * Sending commits the order to the period plan.
   *
   * A store order writes RETAIL EXECUTION, not sell-in: a shelf promise
   * is not a purchase and carries no money. It is tagged with one source,
   * so revising the order and sending again supersedes the earlier
   * commitment instead of stacking a second copy.
   */
  const commitSource = `order-desk:store:${accountId}`;

  const commitToPlan = () => {
    if (chosen.length === 0) return;
    planDispatch({
      type: "COMMIT_ORDER",
      source: commitSource,
      lane,
      accountId,
      deliveryWeek: "Week 1",
      lines: chosen.map((l) => ({
        skuId: l.skuId,
        cases: quantities[l.skuId] ?? l.suggestedCases,
        pricePerCase: caseTerms(l.skuId)?.listPerCase,
        promotionId: "labor-day-2026",
        closesVoid: l.urgency === "new",
        commitment: (() => {
          const pl = recommendedPlacement(accountId, l.skuId);
          return {
            placement: pl.placement as never,
            recommendedLocation: pl.location,
            posMaterials: ["Shelf talker"],
            ownerRole: "Distributor account rep",
            executionNotes: pl.rationale,
          };
        })(),
      })),
    });
  };

  const recipient = contact?.email ?? "no desk on file";
  const recipientRole = `${account?.chainName} ${account?.city}, ${contact?.role}`;

  return (
    <div
      className={styles.page}
      style={{
        ["--lane" as string]: "var(--lane-store)",
        ["--laneTint" as string]: "var(--lane-store-tint)",
      }}
    >
      {/* Context bar. Who is buying, for where, in which period. */}
      <div className={styles.contextBar}>
        <div className={styles.who}>
          <span className={styles.whoMark} aria-hidden="true">
            {(account?.chainName ?? "").slice(0, 2).toUpperCase()}
          </span>
          <span className={styles.whoText}>
            <strong>{`${account?.chainName}, ${account?.city}`}</strong>
            <span className={styles.whoSub}>
              {account?.address} · delivered by {distributor?.name} ·{" "}
              {period?.label}
            </span>
          </span>
        </div>

        <label className={styles.storePick}>
          <span className={styles.laneLabel}>Which store</span>
          <select
            value={accountId}
            onChange={(e) => setAccount(e.target.value)}
            aria-label="Store"
          >
            {ACCOUNTS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.chainName}, {a.city}
              </option>
            ))}
          </select>
        </label>

        <div className={styles.contextLinks}>
          <Link className={styles.mapLink} to="/sent">
            Sent log
          </Link>
          <Link className={styles.mapLink} to="/supply">
            All {ACCOUNTS.length} accounts
          </Link>
          <Link className={styles.mapLink} to="/maps">
            Open the territory map
          </Link>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.main}>
          <header className={styles.head}>
            <p className={styles.eyebrow}>Order and buy</p>
            <h1>Build the order</h1>
            <p className={styles.lede}>
              What this store is short of, cut into an order, with the reason
              every line is here. Cases and timing only, no prices, because a
              supplier may not price a retailer in California.{" "}
              <ProvenanceBadge provenance="modeled" />
            </p>
          </header>

          {sent ? (
            <div className={styles.sentCard} role="status">
              <p className={styles.sentTitle}>
                <span aria-hidden="true">✓</span> {sent.lineCount} lines,{" "}
                {sent.totalCases} cases, addressed to {sent.to}
              </p>
              <p className={styles.sentBody}>
                The message asks whether they want us to fulfill it as written.
                Their answer lands on the distributor review board.{" "}
                {sent.message} Reference{" "}
                <strong className="num">{sent.reference}</strong>.
              </p>
              <div className={styles.sentActions}>
                <Link className={styles.sentLink} to="/sent">
                  Open the sent log
                </Link>
                <Link className={styles.sentLink} to="/distributor">
                  See the review board
                </Link>
                <button
                  type="button"
                  className={styles.sentAgain}
                  onClick={() => setSent(null)}
                >
                  Back to the order
                </button>
              </div>
            </div>
          ) : null}

          {/* The ladder sits ABOVE the builder, not below it.
              A visitor who lands here and scrolls no further should still
              leave knowing this is a distributor job, not a retail one.
              Putting the answer after twelve product cards means the
              people who most need it never reach it. */}
          <SellInLadder
            accountId={accountId}
            storeName={`${account?.chainName}, ${account?.city}`}
            storeLines={chosen.length}
            storeCases={chosen.reduce((n, l) => n + (quantities[l.skuId] ?? 0), 0)}
            storeValue={chosen.reduce(
              (n, l) =>
                n +
                (quantities[l.skuId] ?? 0) *
                  (caseTerms(l.skuId)?.listPerCase ?? 0),
              0,
            )}
          />

          <OrderBuilder
            lines={lines}
            lane={lane}
            quantities={quantities}
            onAdd={onAdd}
            onSet={onSet}
            onRemove={onRemove}
          />
        </div>

        <div className={styles.side}>
          <OrderSummary
            lines={lines}
            lane={lane}
            quantities={quantities}
            allowancePerCase={allowancePerCase}
            onRemove={onRemove}
            onSend={() => setComposing(true)}
            onClear={() => setOverrides({})}
            recipient={recipient}
            recipientRole={recipientRole}
            portalLink={link}
          />
        </div>
      </div>

      <SendModal
        open={composing}
        onClose={() => setComposing(false)}
        build={buildEmail}
        defaultSubject={defaultSubject}
        recipientRole={recipientRole}
        laneLabel={`${account?.chainName}, ${account?.city}`}
        templates={templates}
        commitNote={`Sending also commits ${chosen.length} line${chosen.length === 1 ? "" : "s"} to the period plan as retail execution. No money, by law.`}
        onSent={(r) => {
          commitToPlan();
          /* The send lands in the log as well as in the plan. The plan is
             the commercial commitment; this is the correspondence. */
          outboxDispatch({
            type: "RECORD",
            message: {
              id: r.reference,
              /* Today, not the period start. A log sorted newest-first
                 whose newest row is dated before the row under it is a
                 log nobody trusts. */
              sentAt: new Date().toISOString().slice(0, 10),
              accountId,
              storeName: `${account?.chainName}, ${account?.city}`,
              to: r.to,
              recipientRole,
              subject: r.subject,
              draftLabel: r.draftLabel ?? "Custom",
              lineCount: r.lineCount,
              totalCases: r.totalCases,
              body: (r.body ?? "").split("\n\n").slice(0, 2).join("\n\n"),
              attachmentName: r.attachmentName,
              outcome: "awaiting",
              reference: r.reference,
            },
          });
          setSent(r);
        }}
      />
    </div>
  );
}
