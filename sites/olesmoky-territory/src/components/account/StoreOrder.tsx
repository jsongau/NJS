import { useMemo, useState } from "react";
import type { Account } from "@/domain/types";
import { RETAIL_CONTACT_BY_ACCOUNT } from "@/data/retailContacts";
import { DISTRIBUTOR_BY_ID } from "@/data/trade";
import { retailOrderLines } from "@/domain/selectors/retailOrder";
import { buildRetailerEmail } from "@/lib/email/retailerEmail";
import { activeTransport, TRANSPORT_MODE, type SendRecord } from "@/lib/email/transport";
import { Button } from "@/components/primitives/Button";
import { storeOrderLink } from "@/lib/links";
import styles from "./StoreOrder.module.css";

/**
 * Send this store its own order link.
 *
 * The supply desk sends one link to Southern Glazer's for the whole territory. This
 * sends one link to ONE store for its own shelf, which is the other half
 * of the same motion and the half a rep does far more often: stand in an
 * aisle, see three empty facings, send the buyer a page they can approve
 * from their phone before you have left the parking lot.
 *
 * The recipient is the order desk on file for the banner, shown and not
 * typed, so nothing here can address a stranger.
 */
export function StoreOrder({ account }: { account: Account }) {
  const contact = RETAIL_CONTACT_BY_ACCOUNT[account.id];
  const distributor = DISTRIBUTOR_BY_ID["southern-glazers-cerritos"];

  const lines = useMemo(() => retailOrderLines(account.id), [account.id]);
  const priority = useMemo(
    () => lines.filter((l) => l.kind !== "steady"),
    [lines],
  );

  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(priority.filter((l) => l.kind !== "new").map((l) => l.skuId)),
  );
  const [copied, setCopied] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<SendRecord | null>(null);

  const chosen = priority.filter((l) => selected.has(l.skuId));

  const link = useMemo(
    () => storeOrderLink(account.id, chosen),
    [chosen, account.id],
  );

  const built = useMemo(() => {
    if (chosen.length === 0 || !contact) return null;
    const quantities: Record<string, number> = {};
    for (const l of chosen) quantities[l.skuId] = l.suggestedCases;
    return buildRetailerEmail({
      account,
      contact,
      lines: chosen,
      quantities,
      portalLink: link,
      reference: "OS-DEMO-STORE-0042",
      preparedBy: "Nathan J. Song",
      distributorName: distributor?.name ?? "the wholesaler",
    });
  }, [chosen, account, contact, link, distributor]);

  const copy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 2200);
  };

  const send = async () => {
    if (!built) return;
    setSending(true);
    const result = await activeTransport(built);
    setSending(false);
    setSent({
      ...result,
      to: built.to,
      subject: built.subject,
      lineCount: built.lineCount,
      totalCases: built.totalCases,
      at: "just now",
    });
  };

  if (priority.length === 0) {
    return (
      <p className={styles.empty}>
        Nothing is short at this store and there are no open voids to pitch.
        The shelf is where it should be, so there is no order to send.
      </p>
    );
  }

  return (
    <section className={styles.wrap} aria-label="Store order">
      <div className={styles.toRow}>
        <span className={styles.fieldLabel}>To, on file</span>
        <span className={styles.toAddress}>{contact?.email}</span>
        <span className={styles.toRole}>
          {account.chainName} {account.city}, {contact?.role}
        </span>
      </div>

      <div className={styles.pickList}>
        {priority.map((l) => {
          const on = selected.has(l.skuId);
          return (
            <label
              key={l.skuId}
              className={[styles.pickRow, on ? styles.pickOn : ""]
                .filter(Boolean)
                .join(" ")}
            >
              <input
                type="checkbox"
                checked={on}
                onChange={() =>
                  setSelected((prev) => {
                    const next = new Set(prev);
                    if (next.has(l.skuId)) next.delete(l.skuId);
                    else next.add(l.skuId);
                    return next;
                  })
                }
              />
              <span className={styles.pickBody}>
                <span className={styles.pickName}>
                  {l.label}
                  <span
                    className={[
                      styles.kind,
                      l.kind === "out"
                        ? styles.kOut
                        : l.kind === "low"
                          ? styles.kLow
                          : styles.kNew,
                    ].join(" ")}
                  >
                    <span aria-hidden="true">
                      {l.kind === "out" ? "▲" : l.kind === "low" ? "◆" : "＋"}
                    </span>
                    {l.kind === "out" ? "empty" : l.kind === "low" ? "low" : "not carried"}
                  </span>
                </span>
                <span className={styles.pickWhy}>{l.reason}</span>
              </span>
              <span className={`${styles.pickCases} num`}>{l.suggestedCases}</span>
            </label>
          );
        })}
      </div>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Store order link</span>
        <code className={styles.link}>{link}</code>
        <div className={styles.actions}>
          <a
            className={styles.openBtn}
            href={link}
            target="_blank"
            rel="noreferrer"
          >
            Open the order page
          </a>
          <Button size="sm" onClick={() => copy(link, "Link copied")}>
            Copy link
          </Button>
        </div>
      </div>

      {built ? (
        <>
          <p className={styles.itemised}>
            <strong className="num">{built.lineCount}</strong> items ·{" "}
            <strong className="num">{built.totalCases}</strong> cases · goes to{" "}
            {distributor?.name} for delivery
          </p>
          <div className={styles.sendRow}>
            <button
              type="button"
              className={styles.sendBtn}
              onClick={send}
              disabled={sending}
            >
              {sending ? "Sending" : `Send to ${contact?.role.toLowerCase()}`}
            </button>
            <Button size="sm" onClick={() => copy(built.text, "Message copied")}>
              Copy message
            </Button>
          </div>
        </>
      ) : (
        <p className={styles.note}>
          Tick at least one item and the message builds itself.
        </p>
      )}

      {sent ? (
        <div className={styles.sentCard} role="status">
          <p className={styles.sentTitle}>
            <span aria-hidden="true">✓</span> {sent.lineCount} items,{" "}
            {sent.totalCases} cases
          </p>
          <p className={styles.sentBody}>
            {sent.message} Reference{" "}
            <strong className="num">{sent.reference}</strong>.
          </p>
          <button
            type="button"
            className={styles.sentAgain}
            onClick={() => setSent(null)}
          >
            Back to the message
          </button>
        </div>
      ) : null}

      {copied ? <p className={styles.toast}>{copied}</p> : null}

      <p className={styles.note}>
        {TRANSPORT_MODE === "demo"
          ? "Send records the message against the demo address on file and does not transmit it. Every store mailbox in this app ends in .local, which cannot resolve on the public internet."
          : "Send delivers through Resend to the address on file."}
      </p>
    </section>
  );
}
