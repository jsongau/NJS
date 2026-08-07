import { useState } from "react";
import { Link } from "react-router-dom";
import { useOutbox, OUTCOME_LABEL } from "@/state/OutboxProvider";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import styles from "./SentPage.module.css";

/**
 * The sent log.
 *
 * Two things it does that no other screen does.
 *
 * It closes the loop. Every other surface here is about deciding what to
 * send; this is the only one about what happened after. A sales tool that
 * cannot answer "did they say yes" is a drafting tool.
 *
 * And it makes the openers comparable. Each row records which draft was
 * used and what came back, so the question stops being "which of these
 * sounds better" and starts being "which of these got answered." That is
 * the difference between writing copy and running a channel, and it is
 * the more interesting thing to be able to do.
 *
 * The reply rate at the top is deliberately computed over messages that
 * have had a chance to be answered — counting today's unanswered send
 * against you would make the number drift down every time you used the
 * app, which is a metric that punishes work.
 */
export function SentPage() {
  const { sent } = useOutbox();
  const [open, setOpen] = useState<string | null>(null);

  const answered = sent.filter(
    (m) => m.outcome === "confirmed" || m.outcome === "cut",
  );
  const settled = sent.filter((m) => m.outcome !== "awaiting");
  const rate = settled.length
    ? Math.round((answered.length / settled.length) * 100)
    : 0;
  const casesAgreed = answered.reduce((n, m) => n + m.totalCases, 0);

  /** Openers ranked by how often they came back agreed. */
  const byDraft = Object.entries(
    settled.reduce<Record<string, { sent: number; won: number }>>((acc, m) => {
      const row = (acc[m.draftLabel] ||= { sent: 0, won: 0 });
      row.sent += 1;
      if (m.outcome === "confirmed" || m.outcome === "cut") row.won += 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1].sent - a[1].sent);

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <p className={styles.eyebrow}>Sent</p>
        <h1>What went out</h1>
        <p className={styles.lede}>
          Every order message, who it went to, which opener it used, and what
          came back. The point is not the archive, it is the last column:
          openers you can compare on outcome rather than on taste.{" "}
          <ProvenanceBadge provenance="illustrative" />
        </p>
      </header>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Messages</span>
          <span className={`${styles.statValue} num`}>{sent.length}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Came back agreed</span>
          <span className={`${styles.statValue} num`}>{rate}%</span>
          <span className={styles.statSub}>
            {answered.length} of {settled.length} settled
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Cases agreed</span>
          <span className={`${styles.statValue} num`}>{casesAgreed}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Waiting</span>
          <span className={`${styles.statValue} num`}>
            {sent.filter((m) => m.outcome === "awaiting").length}
          </span>
        </div>
      </div>

      {byDraft.length > 0 ? (
        <section className={styles.openers}>
          <h2 className={styles.h2}>Which opener gets answered</h2>
          <ul className={styles.openerList}>
            {byDraft.map(([label, r]) => (
              <li key={label} className={styles.opener}>
                <span className={styles.openerName}>{label}</span>
                <span className={styles.openerBar} aria-hidden="true">
                  <span
                    className={styles.openerFill}
                    style={{ width: `${(r.won / r.sent) * 100}%` }}
                  />
                </span>
                <span className={`${styles.openerNum} num`}>
                  {r.won}/{r.sent}
                </span>
              </li>
            ))}
          </ul>
          <p className={styles.openerNote}>
            Three messages is not a finding. It is the shape of the question
            worth asking once the numbers are real.
          </p>
        </section>
      ) : null}

      <ul className={styles.log}>
        {sent.map((m) => {
          const o = OUTCOME_LABEL[m.outcome];
          const isOpen = open === m.id;
          return (
            <li key={m.id} className={styles.row}>
              <button
                type="button"
                className={styles.rowHead}
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : m.id)}
              >
                <span className={`${styles.date} num`}>{m.sentAt}</span>
                <span className={styles.rowMain}>
                  <span className={styles.store}>{m.storeName}</span>
                  <span className={styles.subject}>{m.subject}</span>
                </span>
                <span className={styles.draftTag}>{m.draftLabel}</span>
                <span className={`${styles.cases} num`}>{m.totalCases} cs</span>
                <span className={styles.outcome} style={{ color: o.cssVar }}>
                  <span aria-hidden="true">{o.glyph}</span> {o.label}
                </span>
              </button>

              {isOpen ? (
                <div className={styles.detail}>
                  <dl className={styles.meta}>
                    <div>
                      <dt>To</dt>
                      <dd className="num">{m.to}</dd>
                    </div>
                    <div>
                      <dt>Attention</dt>
                      <dd>{m.recipientRole}</dd>
                    </div>
                    <div>
                      <dt>Lines</dt>
                      <dd className="num">{m.lineCount}</dd>
                    </div>
                    <div>
                      <dt>Reference</dt>
                      <dd className="num">{m.reference}</dd>
                    </div>
                  </dl>

                  <p className={styles.body}>{m.body}</p>

                  {m.attachmentName ? (
                    <p className={styles.attach}>
                      <span aria-hidden="true">▤</span> {m.attachmentName}
                    </p>
                  ) : null}

                  {m.reply ? (
                    <blockquote className={styles.reply}>
                      <span className={styles.replyLabel}>They replied</span>
                      {m.reply}
                    </blockquote>
                  ) : (
                    <p className={styles.noReply}>
                      Nothing back yet. Worth one operational nudge before the
                      cutoff, not a second pitch.
                    </p>
                  )}

                  <Link
                    className={styles.again}
                    to={`/?account=${m.accountId}`}
                  >
                    Build this store another order
                  </Link>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <p className={styles.footnote}>
        Demo workflow. No message here was transmitted and no reply was
        written by a person; every address is an unroutable{" "}
        <span className="num">.local</span> mailbox.
      </p>
    </div>
  );
}
