import { useMemo, useState } from "react";
import { ACCOUNTS } from "@/data/accounts";
import { RETAIL_CONTACT_BY_ACCOUNT } from "@/data/retailContacts";
import { retailPriorityLines } from "@/domain/selectors/retailOrder";
import { Wordmark, ChannelLabel } from "@/components/primitives/Wordmark";
import { Button } from "@/components/primitives/Button";
import { storeOrderLink } from "@/lib/links";
import styles from "./StoreLinkList.module.css";

/**
 * Every store's order link in one place.
 *
 * The links already existed on each account, but they were one click deep
 * behind selecting a store, which meant a rep planning a morning of calls
 * had no way to see the whole set. This is the index: who is empty, who is
 * thin, and the link to send them, sorted by how bad it is.
 *
 * Sorting by empty facings rather than by name is the point. A list in
 * alphabetical order makes you read all of it; a list in trouble order
 * tells you where to start.
 */
export function StoreLinkList() {
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<"trouble" | "all">("trouble");

  const rows = useMemo(() => {
    return ACCOUNTS.map((account) => {
      const lines = retailPriorityLines(account.id);
      const out = lines.filter((l) => l.kind === "out");
      const low = lines.filter((l) => l.kind === "low");
      const news = lines.filter((l) => l.kind === "new");
      const send = [...out, ...low];
      const link = storeOrderLink(account.id, send);
      return {
        account,
        out: out.length,
        low: low.length,
        news: news.length,
        cases: send.reduce((n, l) => n + l.suggestedCases, 0),
        link,
      };
    }).sort((a, b) => b.out * 10 + b.low - (a.out * 10 + a.low));
  }, []);

  const visible = filter === "all" ? rows : rows.filter((r) => r.out + r.low > 0);

  const copy = (link: string, name: string) => {
    navigator.clipboard?.writeText(link);
    setCopied(name);
    window.setTimeout(() => setCopied(null), 2200);
  };

  return (
    <section className={styles.wrap} aria-label="Store order links">
      <div className={styles.head}>
        <div>
          <h2>Send a store its own link</h2>
          <p>
            Each store gets a page showing only what its shelf is missing. The
            buyer adjusts the quantities and sends it back, and the order goes
            to Southern Glazer's for delivery.
          </p>
        </div>
        <div className={styles.filter} role="group" aria-label="Which stores">
          {(["trouble", "all"] as const).map((f) => (
            <button
              key={f}
              type="button"
              className={[styles.fBtn, filter === f ? styles.fOn : ""]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f === "trouble" ? "Needs an order" : `All ${rows.length} stores`}
            </button>
          ))}
        </div>
      </div>

      <ul className={styles.list}>
        {visible.map((r) => (
          <li key={r.account.id} className={styles.row}>
            <Wordmark
              name={r.account.chainName}
              channel={r.account.channel}
              size="sm"
            />

            <div className={styles.body}>
              <div className={styles.nameRow}>
                <span className={styles.name}>{r.account.chainName}</span>
                <span className={styles.city}>{r.account.city}</span>
                <ChannelLabel channel={r.account.channel} />
              </div>

              <div className={styles.signals}>
                {r.out > 0 ? (
                  <span className={`${styles.sig} ${styles.sOut}`}>
                    <span aria-hidden="true">▲</span> {r.out} off the shelf
                  </span>
                ) : null}
                {r.low > 0 ? (
                  <span className={`${styles.sig} ${styles.sLow}`}>
                    <span aria-hidden="true">◆</span> {r.low} running low
                  </span>
                ) : null}
                {r.out + r.low === 0 ? (
                  <span className={`${styles.sig} ${styles.sOk}`}>
                    <span aria-hidden="true">○</span> shelf is where it should be
                  </span>
                ) : null}
                {r.news > 0 ? (
                  <span className={`${styles.sig} ${styles.sNew}`}>
                    <span aria-hidden="true">＋</span> {r.news} approved, not
                    stocked
                  </span>
                ) : null}
              </div>

              <code className={styles.link}>{r.link}</code>
            </div>

            <div className={styles.actions}>
              {r.cases > 0 ? (
                <span className={styles.cases}>
                  <strong className="num">{r.cases}</strong> cases
                </span>
              ) : null}
              <a
                className={styles.openBtn}
                href={r.link}
                target="_blank"
                rel="noreferrer"
              >
                Open the order page
              </a>
              <Button size="sm" onClick={() => copy(r.link, r.account.chainName)}>
                Copy link
              </Button>
              <span className={styles.to}>
                {RETAIL_CONTACT_BY_ACCOUNT[r.account.id]?.email}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {copied ? (
        <p className={styles.toast} role="status">
          {copied} link copied
        </p>
      ) : null}

      <p className={styles.note}>
        Every store mailbox on this page ends in .local, which is reserved and
        cannot resolve on the public internet. Sending is recorded and not
        transmitted. To write the message as well as the link, open the store
        on the Maps tab and use the Order tab.
      </p>
    </section>
  );
}
