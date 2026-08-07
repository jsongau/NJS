import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { openIssues, ISSUE_KIND, type IssueKind } from "@/domain/selectors/issues";
import { usePlan } from "@/state/PlanProvider";
import { useOutbox } from "@/state/OutboxProvider";
import {
  useIssueState,
  useIssueDispatch,
  STATUS_LABEL,
  type IssueStatus,
} from "@/state/IssueProvider";
import { ACCOUNT_BY_ID } from "@/data/accounts";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import styles from "./IssuesPage.module.css";

/**
 * Problem resolution, and the whole trick is that nothing here is typed.
 *
 * Every issue is derived from the plan, the outbox and the account fact
 * table, so the register cannot go stale and nobody has to maintain it.
 * An issue stops appearing when the condition causing it stops being
 * true, which is the only honest definition of resolved. What a person
 * CAN record is what they are doing about it, and that lives in a
 * separate store, so a problem cannot be marked closed while it is still
 * happening.
 *
 * The columns are chosen from what a rep actually needs at nine on a
 * Monday: what it costs, how long it has been costing it, who owns it,
 * and the physical next action. A status alone is not a plan.
 */

const TODAY = "2026-08-07";

export function IssuesPage() {
  const plan = usePlan();
  const { sent } = useOutbox();
  const dispositions = useIssueState();
  const dispatch = useIssueDispatch();
  const [filter, setFilter] = useState<IssueKind | "all">("all");
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const nowMs = Date.parse(`${TODAY}T00:00:00Z`);
  const issues = useMemo(
    () => openIssues({ plan, sent, nowMs }),
    [plan, sent, nowMs],
  );

  const shown =
    filter === "all" ? issues : issues.filter((i) => i.kind === filter);

  const counts = issues.reduce<Record<string, number>>((acc, i) => {
    acc[i.kind] = (acc[i.kind] ?? 0) + 1;
    return acc;
  }, {});

  /**
   * Two totals, not one. A void leaks cases every week; an unanswered
   * order is a single number. Adding them would produce a figure with no
   * unit, which is the sort of thing that quietly discredits a whole page.
   */
  const weeklyAtRisk = issues
    .filter((i) => i.casesUnit === "per week")
    .reduce((n, i) => n + i.casesAtRisk, 0);
  const orderAtRisk = issues
    .filter((i) => i.casesUnit === "one order")
    .reduce((n, i) => n + i.casesAtRisk, 0);
  const untouched = issues.filter(
    (i) => (dispositions.byIssueId[i.id]?.status ?? "open") === "open",
  ).length;
  const oldest = issues.reduce((n, i) => Math.max(n, i.ageDays ?? 0), 0);

  const setStatus = (issueId: string, status: IssueStatus) =>
    dispatch({ type: "SET", issueId, status, at: TODAY });

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <p className={styles.eyebrow}>Problem resolution</p>
        <h1>What is broken right now</h1>
        <p className={styles.lede}>
          Nothing on this page was typed in. Every issue is computed from the
          plan, the sent log and the account record, so it cannot go stale
          and it cannot be quietly deleted — an issue disappears when the
          thing causing it stops being true.{" "}
          <ProvenanceBadge provenance="modeled" />
        </p>
      </header>

      <section className={styles.stats} aria-label="Register summary">
        <div className={styles.stat}>
          <span className={styles.statLabel}>Open</span>
          <span className={`${styles.statValue} num`}>{issues.length}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Leaking every week</span>
          <span className={`${styles.statValue} num`}>{weeklyAtRisk}</span>
          <span className={styles.statSub}>cases, from doors not stocked</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>At stake right now</span>
          <span className={`${styles.statValue} num`}>{orderAtRisk}</span>
          <span className={styles.statSub}>cases, on orders already out</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Nobody has touched</span>
          <span className={`${styles.statValue} num`}>{untouched}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Oldest</span>
          <span className={`${styles.statValue} num`}>
            {oldest > 0 ? `${oldest}d` : "—"}
          </span>
        </div>
      </section>

      <div className={styles.filters} role="group" aria-label="Filter by kind">
        <button
          type="button"
          className={[styles.fBtn, filter === "all" ? styles.fOn : ""]
            .filter(Boolean)
            .join(" ")}
          aria-pressed={filter === "all"}
          onClick={() => setFilter("all")}
        >
          Everything <span className="num">{issues.length}</span>
        </button>
        {(Object.keys(ISSUE_KIND) as IssueKind[]).map((k) => (
          <button
            key={k}
            type="button"
            className={[styles.fBtn, filter === k ? styles.fOn : ""]
              .filter(Boolean)
              .join(" ")}
            aria-pressed={filter === k}
            onClick={() => setFilter(k)}
            disabled={!counts[k]}
            style={{ ["--kind" as string]: ISSUE_KIND[k].cssVar }}
          >
            <span aria-hidden="true">{ISSUE_KIND[k].glyph}</span>{" "}
            {ISSUE_KIND[k].label} <span className="num">{counts[k] ?? 0}</span>
          </button>
        ))}
      </div>

      {filter !== "all" ? (
        <p className={styles.kindWhy}>{ISSUE_KIND[filter].why}</p>
      ) : null}

      {shown.length === 0 ? (
        <p className={styles.clear}>
          <span aria-hidden="true">✓</span> Nothing open in this category.
          Because the register is derived, that is a fact rather than a
          reporting gap.
        </p>
      ) : (
        <ul className={styles.list}>
          {shown.map((i) => {
            const kind = ISSUE_KIND[i.kind];
            const d = dispositions.byIssueId[i.id];
            const status: IssueStatus = d?.status ?? "open";
            const account = i.accountId
              ? ACCOUNT_BY_ID[i.accountId]
              : undefined;

            return (
              <li
                key={i.id}
                className={[
                  styles.issue,
                  styles[`sev-${i.severity}`],
                  status !== "open" ? styles.touched : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className={styles.issueTop}>
                  <span
                    className={styles.kindTag}
                    style={{ color: kind.cssVar }}
                  >
                    <span aria-hidden="true">{kind.glyph}</span> {kind.label}
                  </span>
                  <h2 className={styles.issueTitle}>{i.title}</h2>
                  <span className={styles.metrics}>
                    {i.casesAtRisk > 0 ? (
                      <span className={`${styles.metric} num`}>
                        {i.casesAtRisk}
                        <span className={styles.metricUnit}>
                          {i.casesUnit === "per week" ? "cs / wk" : "cases"}
                        </span>
                      </span>
                    ) : null}
                    {i.ageDays ? (
                      <span className={`${styles.metric} num`}>
                        {i.ageDays}
                        <span className={styles.metricUnit}>days</span>
                      </span>
                    ) : null}
                  </span>
                </div>

                <p className={styles.detail}>{i.detail}</p>

                <dl className={styles.meta}>
                  <div>
                    <dt>Owner</dt>
                    <dd>{i.owner}</dd>
                  </div>
                  <div className={styles.next}>
                    <dt>Next action</dt>
                    <dd>{i.nextAction}</dd>
                  </div>
                </dl>

                {d?.note ? (
                  <p className={styles.note}>
                    <span className={styles.noteLabel}>
                      Noted {d.touchedAt}
                    </span>
                    {d.note}
                  </p>
                ) : null}

                <div className={styles.actions}>
                  <div
                    className={styles.statusPick}
                    role="group"
                    aria-label="Status"
                  >
                    {(Object.keys(STATUS_LABEL) as IssueStatus[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={[
                          styles.sBtn,
                          status === s ? styles.sOn : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        aria-pressed={status === s}
                        onClick={() => setStatus(i.id, s)}
                        style={{ ["--st" as string]: STATUS_LABEL[s].cssVar }}
                      >
                        <span aria-hidden="true">{STATUS_LABEL[s].glyph}</span>{" "}
                        {STATUS_LABEL[s].label}
                      </button>
                    ))}
                  </div>

                  {noteFor === i.id ? (
                    <form
                      className={styles.noteForm}
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (draft.trim()) {
                          dispatch({
                            type: "NOTE",
                            issueId: i.id,
                            note: draft.trim(),
                            at: TODAY,
                          });
                        }
                        setNoteFor(null);
                        setDraft("");
                      }}
                    >
                      <input
                        autoFocus
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="What did you do about it?"
                        aria-label="Note"
                      />
                      <button type="submit" className={styles.saveNote}>
                        Save
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      className={styles.addNote}
                      onClick={() => {
                        setNoteFor(i.id);
                        setDraft(d?.note ?? "");
                      }}
                    >
                      {d?.note ? "Edit the note" : "Add a note"}
                    </button>
                  )}



                  {account ? (
                    <Link
                      className={styles.go}
                      to={`/?account=${account.id}`}
                    >
                      Build {account.chainName} an order
                    </Link>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className={styles.footnote}>
        There is deliberately no &ldquo;resolved&rdquo; button. A status you
        can set by hand is a status that will eventually disagree with
        reality, and an issue register that disagrees with reality is worse
        than none. Fix the condition and the row leaves on its own.
      </p>

      <div className={styles.links}>
        <Link className={styles.primary} to="/">
          The order desk
        </Link>
        <Link className={styles.ghost} to="/distributor">
          Southern Glazer's&rsquo;s review board
        </Link>
        <Link className={styles.ghost} to="/sent">
          What went out
        </Link>
      </div>
    </div>
  );
}
