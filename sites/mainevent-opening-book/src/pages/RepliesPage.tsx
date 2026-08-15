import { useCallback, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { PitchStatus, Reply, ReplyDisposition } from "@/domain/types";
import { PROSPECTS, PROSPECT_BY_ID } from "@/data/prospects";
import { OBJECTION_BY_ID, SEVERITY_META } from "@/data/objections";
import { PERIOD_BY_ID } from "@/data/venue";
import { REPLY_DISPOSITION } from "@/domain/vocabulary";
import { furthestStatus, usePipeline } from "@/state/PipelineProvider";
import { useBook } from "@/state/BookProvider";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { StatusChip, TokenChip } from "@/components/primitives/StatusChip";
import { LaneChip } from "@/components/primitives/LaneChip";
import { ProspectPlate } from "@/components/primitives/Wordmark";
import { RecordName } from "@/components/record/RecordName";
import { Button } from "@/components/primitives/Button";
import { ClearedBoard } from "@/components/play/ClearedBoard";
import { ContextSelect, PageHeader } from "@/components/chrome/PageHeader";
import { SegmentedFilter } from "@/components/queue/SegmentedFilter";
import { WorkingSetLead } from "@/components/queue/WorkingSetLead";
import { RecordPager, useRecordFocus } from "@/components/chrome/RecordPager";
import { downloadCsv, toCsv } from "@/lib/export/csv";
import styles from "./RepliesPage.module.css";

/**
 * WHAT CAME BACK, INCLUDING THE SILENCE AND THE LOSSES.
 *
 * A pipeline that records only its wins teaches nobody anything. A
 * hiring manager who has actually run a sales floor knows that, which is
 * why the first thing they look for is the losses, and why a replies
 * screen showing four warm conversations and nothing else tells them
 * only that somebody edited the screenshot.
 *
 * So the six dispositions on this page are the six from the vocabulary,
 * shown in full, including the two that most tools quietly drop. "No" is
 * a group with organisations in it. "No reply" is a group at all, which
 * it usually is not, because silence is the most common outcome of any
 * cold outreach anywhere and a page that hides it is flattering the
 * sender rather than informing the reader.
 *
 * ----- THE MOST USEFUL ROW ON THIS PAGE IS A LOSS ---------------------
 *
 * Fairway Ford is here saying no in its own words: the holiday party is
 * contracted at a hotel and has been for three years, and come back in
 * February for the summer sales push. That sentence is worth more than
 * any of the yeses above it, because it does two things a bare "no"
 * cannot. It tells you the December door is shut and roughly for how
 * long, and it tells you a second door was left open by the buyer
 * themselves, with a month on it. A shut December and an open June is a
 * different answer from no, and the follow-up it earns is a diary entry
 * rather than another email about the holiday party.
 *
 * A rep who files that as "lost" and moves on has thrown away the one
 * piece of intelligence the conversation produced. The row keeps it, the
 * objection register keeps it, and the next step against it is dated
 * February 2027 rather than next Tuesday.
 *
 * ----- WHAT IS REAL ON THIS PAGE AND WHAT IS NOT ----------------------
 *
 * Every reply here is illustrative. The words were written for this work
 * sample and no organisation is described as having said anything it did
 * not say; the lanes, the addresses and the decision maker titles behind
 * each row are the sourced part. That split is stated on the page rather
 * than in this comment, because a reader deciding how much to trust the
 * numbers should not have to read the source to find out.
 *
 * ----- WHY THIS PAGE DOES NOT USE THE WALL CLOCK ----------------------
 *
 * The desk stamps live actions with the real date, which is correct
 * there: the reader just did the thing, so the thing happened today. A
 * dated seed read through a live clock is a different problem. Six weeks
 * after this is published, every next step on the page would be overdue,
 * and a year after that the whole screen would read as abandoned work.
 *
 * So the "today" this page sorts against is derived from the data: it is
 * the day of the most recent thing that came back. It is named on screen
 * as the desk date so nobody has to guess which clock is running, and it
 * moves on its own the moment a reply is added.
 */

// ---------------------------------------------------------------
// Dates
// ---------------------------------------------------------------

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Dates are split rather than parsed, for the same reason they are on
 * the Book page. `new Date("2026-09-24")` is midnight UTC, and rendering
 * that through a locale formatter in California prints the twenty third.
 * A follow-up that is one day early on a screen somebody is working from
 * is not a rounding error, it is a wrong answer.
 */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** Whole days between two calendar dates, sign carried, no timezone. */
function dayDiff(fromIso: string, toIso: string): number {
  const [fy, fm, fd] = fromIso.split("-").map(Number);
  const [ty, tm, td] = toIso.split("-").map(Number);
  if (!fy || !fm || !fd || !ty || !tm || !td) return 0;
  return Math.round(
    (Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86_400_000,
  );
}

function days(n: number): string {
  const abs = Math.abs(n);
  return abs === 1 ? "1 day" : `${abs} days`;
}

// ---------------------------------------------------------------
// The desk date
// ---------------------------------------------------------------

/**
 * The day this page treats as today.
 *
 * The latest reply received, because that is the last moment the desk
 * demonstrably knew something. Falling back to the latest recorded touch
 * covers the case where every reply has been cleared out, and falling
 * back to the start of the selected period covers the case where nothing
 * has happened at all, which is a perfectly reasonable state for a venue
 * that has not opened.
 */
function deskDate(replies: Reply[], latestTouch: string | undefined, periodStart: string): string {
  const latestReply = replies.reduce<string | undefined>(
    (best, r) => (best === undefined || r.receivedAt > best ? r.receivedAt : best),
    undefined,
  );
  return latestReply ?? latestTouch ?? periodStart;
}

// ---------------------------------------------------------------
// Next step buckets
// ---------------------------------------------------------------

/**
 * When a next step is due, relative to the desk date.
 *
 * FOUR BUCKETS AND NOT THREE. The obvious design is overdue, this week,
 * later, and it loses the single most interesting entry on the page:
 * Fairway Ford's February. A follow-up diarised four months out is not
 * "later", it is a deliberate decision to stop selling into a closed
 * door and come back when the buyer said to, and burying it under the
 * same heading as a call due next Thursday would hide the judgement that
 * produced it.
 *
 * Every bucket carries a glyph and a word as well as a tone, because
 * colour is never the only signal in this application.
 */
type Bucket = "overdue" | "this-week" | "later" | "beyond" | "undated";

const BUCKET_META: Record<
  Bucket,
  { label: string; glyph: string; cssVar: string; note: string }
> = {
  overdue: {
    label: "Overdue",
    glyph: "✕",
    cssVar: "var(--risk)",
    note: "The date on it has passed. A next step that goes overdue quietly is how a warm reply becomes a cold one.",
  },
  "this-week": {
    label: "Due this week",
    glyph: "●",
    cssVar: "var(--ok)",
    note: "Due within seven days of the desk date. This is the list the week is actually built around.",
  },
  later: {
    label: "Later this period",
    glyph: "◑",
    cssVar: "var(--info)",
    note: "Dated, real, and not this week's problem. It stays on the board so it cannot be forgotten and off the week so it cannot crowd it.",
  },
  beyond: {
    label: "Diarised beyond this period",
    glyph: "◔",
    cssVar: "var(--warn)",
    note: "A door that opens later, on a date the buyer named themselves. The discipline is to leave it alone until then.",
  },
  undated: {
    label: "No date on it",
    glyph: "○",
    cssVar: "var(--neutral)",
    note: "A next step with no date on it is a wish. Every one of these should be given a day or dropped.",
  },
};

const BUCKET_ORDER: Bucket[] = [
  "overdue",
  "this-week",
  "later",
  "beyond",
  "undated",
];

/**
 * The order the six dispositions are read in.
 *
 * Best news to worst, ending on silence, and it is declared here rather
 * than in domain/vocabulary.ts because nothing else in the application
 * has an opinion about it. The vocabulary file earns its authority by
 * holding only the values several screens must agree on; a reading order
 * one page uses is that page's business. If a second screen ever groups
 * replies, this moves there and stops being local.
 */
const DISPOSITION_ORDER: ReplyDisposition[] = [
  "meeting-set",
  "asked-for-info",
  "not-now",
  "wrong-person",
  "no",
  "no-reply",
];

/**
 * THE DISPOSITION FILTER LIVES IN THE URL, AND IT IS THE SAME DECISION
 * THE QUEUE MADE.
 *
 * Nothing in the rail links into this screen with a filter on it today,
 * so this is not a defect being repaired; it is the same rule applied
 * before it is needed. "Show me the losses" is the single most useful
 * link anybody will ever send from this page, and a filter kept in
 * component state cannot be sent to anybody. Writing it in the URL costs
 * four lines here and means the link exists the first time somebody
 * wants it, rather than after somebody notices it does not.
 *
 * An unrecognised value shows every group, which is the honest reading
 * of a disposition this vocabulary does not have.
 */
function readDisposition(
  params: URLSearchParams,
  allowed: readonly ReplyDisposition[],
): ReplyDisposition | "all" {
  const raw = params.get("disposition");
  if (!raw) return "all";
  return (allowed as readonly string[]).includes(raw)
    ? (raw as ReplyDisposition)
    : "all";
}

function bucketFor(
  due: string | undefined,
  desk: string,
  periodEnd: string | undefined,
): Bucket {
  if (!due) return "undated";
  const delta = dayDiff(desk, due);
  if (delta < 0) return "overdue";
  if (delta <= 7) return "this-week";
  if (periodEnd && dayDiff(due, periodEnd) < 0) return "beyond";
  return "later";
}

// ---------------------------------------------------------------
// One reply
// ---------------------------------------------------------------

function ReplyCard({
  reply,
  desk,
  current,
}: {
  reply: Reply;
  desk: string;
  /** The card the pager is standing on. Marked, never merely tinted. */
  current: boolean;
}) {
  const prospect = PROSPECT_BY_ID[reply.prospectId];
  const objection = reply.objectionId
    ? OBJECTION_BY_ID[reply.objectionId]
    : undefined;
  const token = REPLY_DISPOSITION[reply.disposition];
  const age = dayDiff(reply.receivedAt, desk);
  const dueDelta = reply.nextStepDue
    ? dayDiff(desk, reply.nextStepDue)
    : undefined;

  return (
    <li
      className={styles.card}
      data-record-id={reply.id}
      data-current={current ? "true" : undefined}
      aria-current={current ? "true" : undefined}
      tabIndex={-1}
    >
      {current ? (
        <p className={styles.hereMark}>
          <span aria-hidden="true">▸</span> You are here
        </p>
      ) : null}
      <div className={styles.cardHead}>
        {prospect ? (
<span className={styles.ident}>
            <ProspectPlate name={prospect.name} lane={prospect.lane} />
            <span className={styles.identText}>
              <span className={styles.identName}>
                <RecordName prospectId={prospect.id} name={prospect.name} />
              </span>
              <span className={styles.identMeta}>
                <LaneChip lane={prospect.lane} size="sm" />
                <span className={styles.identSub}>
                  {prospect.decisionMakerTitle}
                </span>
              </span>
            </span>
          </span>
        ) : (
          <strong>{reply.prospectId}</strong>
        )}
        <TokenChip token={token} size="sm" />
      </div>

      {/*
        THE REPLY IS SET AS A QUOTATION AND MARKED UP AS ONE.

        A blockquote with a cite is not decoration here. The whole page
        turns on the difference between what the venue said and what the
        buyer said back, and the one sentence on this card that did not
        come from the venue is the one worth reading twice.
      */}
      <blockquote className={styles.said}>
        <p className={styles.saidText}>{reply.summary}</p>
        <footer className={styles.saidFoot}>
          <span className={styles.when}>
            Received <span className="num">{formatDate(reply.receivedAt)}</span>
            {age > 0 ? <>, {days(age)} before the desk date</> : null}
          </span>
          <ProvenanceBadge provenance="illustrative" compact />
        </footer>
      </blockquote>

      {/*
        The objection is linked rather than restated. A reply that raised
        one is the evidence the register exists on, and a reader who
        wants the answer to it should land on the page that carries the
        answer and what the answer costs, not on a paraphrase of it here.
      */}
      {objection ? (
        <div className={styles.objection}>
          <p className={styles.objectionHead}>
            <span
              className={styles.objectionGlyph}
              aria-hidden="true"
              style={{ ["--tone" as string]: SEVERITY_META[objection.severity].cssVar }}
            >
              {SEVERITY_META[objection.severity].glyph}
            </span>
            <span className={styles.objectionLabel}>
              Objection raised: {objection.short}
            </span>
            <span className={styles.objectionSeverity}>
              {SEVERITY_META[objection.severity].label}
            </span>
          </p>
          <p className={styles.objectionVoice}>{objection.voice}</p>
          <p className={styles.objectionLink}>
            <Link className="tap" to="/objections">
              The answer, and what it costs
            </Link>
          </p>
        </div>
      ) : null}

      {reply.nextStep ? (
        <div className={styles.next}>
          <p className={styles.nextLabel}>Next step</p>
          <p className={styles.nextText}>{reply.nextStep}</p>
          <p className={styles.nextDue}>
            {reply.nextStepDue ? (
              <>
                <span aria-hidden="true">
                  {dueDelta !== undefined && dueDelta < 0 ? "✕" : "◆"}
                </span>
                <span>
                  Due <span className="num">{formatDate(reply.nextStepDue)}</span>
                  {dueDelta === undefined
                    ? null
                    : dueDelta < 0
                      ? `, overdue by ${days(dueDelta)}`
                      : dueDelta === 0
                        ? ", today"
                        : `, in ${days(dueDelta)}`}
                </span>
              </>
            ) : (
              <>
                <span aria-hidden="true">○</span>
                <span>No date on it</span>
              </>
            )}
          </p>
        </div>
      ) : (
        <p className={styles.noNext}>
          <span aria-hidden="true">○</span>
          <span>No next step recorded</span>
        </p>
      )}
    </li>
  );
}

// ---------------------------------------------------------------
// The page
// ---------------------------------------------------------------

export function RepliesPage() {
  const { replies } = useBook();
  const pipeline = usePipeline();

  const period = PERIOD_BY_ID[pipeline.periodId];

  /**
   * Everything the fact table knows about who has been touched in the
   * selected period, collapsed to one row per organisation.
   *
   * ONE ROW PER ORGANISATION IS THE WHOLE POINT OF DOING THIS HERE. The
   * status table is per prospect, per package, per period, so a school
   * pitched two packages has two rows and four touches. Counting rows
   * would say two organisations were approached when one was, which
   * would understate the response rate below by exactly the amount that
   * makes it look better.
   */
  const touched = useMemo(() => {
    const byProspect = new Map<
      string,
      { prospectId: string; touches: number; lastTouchAt?: string }
    >();
    for (const row of pipeline.statuses) {
      if (row.periodId !== pipeline.periodId || row.touches <= 0) continue;
      const found = byProspect.get(row.prospectId);
      if (found) {
        found.touches += row.touches;
        if (row.lastTouchAt && (!found.lastTouchAt || row.lastTouchAt > found.lastTouchAt)) {
          found.lastTouchAt = row.lastTouchAt;
        }
      } else {
        byProspect.set(row.prospectId, {
          prospectId: row.prospectId,
          touches: row.touches,
          lastTouchAt: row.lastTouchAt,
        });
      }
    }
    return [...byProspect.values()];
  }, [pipeline.statuses, pipeline.periodId]);

  const latestTouch = useMemo(
    () =>
      touched.reduce<string | undefined>(
        (best, t) =>
          t.lastTouchAt && (best === undefined || t.lastTouchAt > best)
            ? t.lastTouchAt
            : best,
        undefined,
      ),
    [touched],
  );

  const desk = deskDate(replies, latestTouch, period?.startDate ?? "2026-09-14");

  /**
   * The response rate, computed the boring way and stated in full.
   *
   * NUMERATOR: organisations that came back with words in the message.
   * A recorded "no reply" is not a response, which sounds obvious and is
   * the exact place these figures usually go wrong.
   *
   * DENOMINATOR: organisations touched at least once in this period.
   * NOT every organisation in the trade area. Dividing by the whole list
   * would produce a much smaller and completely meaningless number,
   * because an organisation nobody has written to has not declined to
   * answer anything.
   *
   * The numerator is intersected with the touched set on purpose. The
   * replies array is not scoped to a period and the status table is, so
   * a reader who switches to a period with no work in it would otherwise
   * see a response rate above one hundred percent, which is the sort of
   * thing that ends a demonstration.
   */
  const rate = useMemo(() => {
    const touchedIds = new Set(touched.map((t) => t.prospectId));
    const answered = replies.filter(
      (r) => r.disposition !== "no-reply" && touchedIds.has(r.prospectId),
    );
    const written = replies.filter((r) => touchedIds.has(r.prospectId));
    const touches = touched.reduce((n, t) => n + t.touches, 0);
    return {
      organisations: touched.length,
      touches,
      answered: answered.length,
      /** Rows on file, answered or explicitly silent. */
      recorded: written.length,
      offPeriod: replies.length - written.length,
      perOrganisation: touched.length > 0 ? answered.length / touched.length : null,
      perTouch: touches > 0 ? answered.length / touches : null,
    };
  }, [replies, touched]);

  /**
   * The silence, computed rather than seeded.
   *
   * Any organisation that has been written to and has no reply row is
   * unanswered, and the page would be lying if it only showed the one
   * silence somebody remembered to record. But there are two kinds of
   * quiet in that set and they are not the same fact at all.
   *
   * An organisation still sitting at "reached out" with nothing back is
   * SILENT. An organisation sitting at "in conversation" or "date held"
   * with no reply row answered somewhere this page cannot see: on a
   * phone, at a front desk, across a table at a mixer. Counting those as
   * silence would overstate how badly the outreach is going, and folding
   * them into the response rate would overstate how well. So they are
   * separated, named, and left out of the rate entirely.
   */
  const silence = useMemo(() => {
    const answeredIds = new Set(replies.map((r) => r.prospectId));
    const quiet: { prospectId: string; touches: number; lastTouchAt?: string; status: PitchStatus }[] = [];
    const offPage: typeof quiet = [];
    for (const t of touched) {
      if (answeredIds.has(t.prospectId)) continue;
      const status = furthestStatus(pipeline, t.prospectId);
      const row = { ...t, status };
      if (status === "unworked" || status === "reached-out") quiet.push(row);
      else offPage.push(row);
    }
    const bySize = (a: (typeof quiet)[number], b: (typeof quiet)[number]) =>
      b.touches - a.touches;
    return { quiet: quiet.sort(bySize), offPage: offPage.sort(bySize) };
  }, [replies, touched, pipeline]);

  /** Every next step that has one, in the order the days fall. */
  const steps = useMemo(() => {
    const withStep = replies.filter((r) => r.nextStep);
    const sorted = [...withStep].sort((a, b) =>
      (a.nextStepDue ?? "9999-99-99").localeCompare(b.nextStepDue ?? "9999-99-99"),
    );
    const out = new Map<Bucket, Reply[]>();
    for (const r of sorted) {
      const b = bucketFor(r.nextStepDue, desk, period?.endDate);
      out.set(b, [...(out.get(b) ?? []), r]);
    }
    return out;
  }, [replies, desk, period]);

  const grouped = useMemo(() => {
    const out = new Map<ReplyDisposition, Reply[]>();
    for (const r of replies) {
      out.set(r.disposition, [...(out.get(r.disposition) ?? []), r]);
    }
    for (const [, rows] of out) {
      rows.sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
    }
    return out;
  }, [replies]);

  const pct = (n: number) => `${Math.round(n * 100)}%`;

  // -------------------------------------------------------------
  // The band above the groups
  // -------------------------------------------------------------

  const [params, setParams] = useSearchParams();
  const disposition = readDisposition(params, DISPOSITION_ORDER);

  /**
   * Every reply in the order this page draws them, narrowed to the
   * disposition on the URL.
   *
   * Built off `grouped` rather than off `replies` so the pager walks the
   * cards in the sequence a reader's eye meets them. A pager whose
   * "next" is the next row in the underlying array while the screen is
   * grouped by something else jumps around the page, and the reader
   * concludes the control is broken rather than that the order is.
   */
  const walk = useMemo(
    () =>
      DISPOSITION_ORDER.filter(
        (d) => disposition === "all" || d === disposition,
      ).flatMap((d) => grouped.get(d) ?? []),
    [grouped, disposition],
  );
  const walkIds = useMemo(() => walk.map((r) => r.id), [walk]);

  const [pickedId, setPickedId] = useState<string | null>(null);
  const currentId =
    pickedId !== null && walkIds.includes(pickedId) ? pickedId : null;
  useRecordFocus(currentId);

  /**
   * The two or three figures that are true of the answer on screen and
   * of no other answer.
   *
   * Deliberately not the response rate. The rate is a fact about the
   * whole board, it is the same figure under every disposition, and it
   * held the top of this page for exactly that reason. What belongs here
   * is what a reader has just selected: how many, when the next one is
   * owed, and how many of them actually carry a next step, which is the
   * difference between a group of answers and a group of commitments.
   */
  const readingFacts = useMemo(() => {
    if (walk.length === 0) return [];
    const out: { label: string; value: string }[] = [];

    const newest = walk.reduce(
      (best, r) => (r.receivedAt > best.receivedAt ? r : best),
      walk[0],
    );
    out.push({
      label: "Most recent",
      value: `${formatDate(newest.receivedAt)}, ${
        PROSPECT_BY_ID[newest.prospectId]?.name ?? newest.prospectId
      }`,
    });

    const dated = walk.filter((r) => r.nextStepDue);
    if (dated.length > 0) {
      const soonest = dated.reduce(
        (best, r) =>
          (r.nextStepDue as string) < (best.nextStepDue as string) ? r : best,
        dated[0],
      );
      out.push({
        label: "Next step due soonest",
        value: `${formatDate(soonest.nextStepDue as string)}, ${
          PROSPECT_BY_ID[soonest.prospectId]?.name ?? soonest.prospectId
        }`,
      });
    }

    out.push({
      label: "Carrying a next step",
      value: `${walk.filter((r) => r.nextStep).length} of ${walk.length}`,
    });

    return out;
  }, [walk]);

  /** What the live region says when the answer on screen changes. */
  const announcement = useMemo(() => {
    const label =
      disposition === "all"
        ? "Every answer"
        : REPLY_DISPOSITION[disposition].label;
    const parts = [`${label}.`, `${walk.length} of ${replies.length} replies.`];
    if (readingFacts[0]) {
      parts.push(`${readingFacts[0].label}: ${readingFacts[0].value}.`);
    }
    if (walk[0]) {
      parts.push(
        `First is ${PROSPECT_BY_ID[walk[0].prospectId]?.name ?? walk[0].prospectId}.`,
      );
    }
    return parts.join(" ");
  }, [disposition, walk, replies, readingFacts]);

  const exportCsv = useCallback(() => {
    const csv = toCsv(
      [
        "Organisation",
        "Lane",
        "Disposition",
        "Received",
        "What they said",
        "Next step",
        "Next step due",
      ],
      walk.map((r) => {
        const prospect = PROSPECT_BY_ID[r.prospectId];
        return [
          prospect?.name ?? r.prospectId,
          prospect ? prospect.lane : "",
          REPLY_DISPOSITION[r.disposition].label,
          r.receivedAt,
          r.summary,
          r.nextStep ?? "",
          r.nextStepDue ?? "",
        ];
      }),
    );
    downloadCsv(
      disposition === "all" ? "replies" : `replies-${disposition}`,
      csv,
    );
  }, [walk, disposition]);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/*
          The band. The context control is the disposition, which is the
          axis this whole page is organised on, and the pager walks the
          cards inside whichever disposition is showing.
        */}
        <PageHeader
          filterCrumb={
            disposition === "all"
              ? undefined
              : REPLY_DISPOSITION[disposition].label
          }
          context={
            <ContextSelect
              id="replies-disposition"
              label="Answer"
              value={disposition}
              options={[
                { value: "all", label: "Every answer", count: replies.length },
                ...DISPOSITION_ORDER.map((d) => ({
                  value: d,
                  label: REPLY_DISPOSITION[d].label,
                  count: (grouped.get(d) ?? []).length,
                })),
              ]}
              onChange={(value) => {
                setParams(
                  (previous) => {
                    const next = new URLSearchParams(previous);
                    if (value === "all") next.delete("disposition");
                    else next.set("disposition", value);
                    return next;
                  },
                  { replace: false },
                );
                setPickedId(null);
              }}
            />
          }
          pager={
            <RecordPager
              ids={walkIds}
              currentId={currentId}
              onChange={setPickedId}
              noun={["reply", "replies"]}
              setLabel="in this set"
            />
          }
          actions={
            <Button size="sm" glyph="▤" onClick={exportCsv}>
              Export {walk.length} as CSV
            </Button>
          }
        />

        <header className={styles.head}>
          <p className={styles.eyebrow}>Stage five, their side of it</p>
          <h1 className={styles.h1}>Replies</h1>
          {/* Every disposition is a group here, including the two most tools
              drop: said no, and said nothing. */}
          <p
            className={styles.provenanceNote}
            title="The organisations, their lanes and the decision maker titles are real and sourced. The words are not, and no organisation is described as having said anything it did not say."
          >
            <ProvenanceBadge provenance="illustrative" />
            <span>Replies written for this work sample.</span>
          </p>
        </header>

        {/* ---------------------------------------------------------
            THE ANSWER FILTER, AND DIRECTLY UNDER IT WHAT IT SELECTED.

            THE SAME DEFECT THE REQUESTS QUEUE HAD, AND THE SAME REPAIR.
            This page opened with the response rate, five figures wide,
            and then a week of next steps, and both are true of the whole
            board rather than of the answer somebody just pressed. So
            choosing "Said no" changed a breadcrumb word and a number in
            a select, and left roughly nine hundred pixels of identical
            screen above the first row that had changed. Measured, two
            tenths of one per cent of the pixels moved.

            The rate and the week did not stop being true, so they moved
            under the groups they describe, with every figure and every
            badge intact. The disposition, its size and its first three
            organisations took the space.
            --------------------------------------------------------- */}
        <SegmentedFilter
          label="Answer"
          value={disposition}
          countLabel="replies"
          segments={[
            {
              value: "all",
              label: "Every answer",
              glyph: "Σ",
              count: replies.length,
              tone: "var(--brand-gold)",
            },
            ...DISPOSITION_ORDER.map((d) => ({
              value: d,
              label: REPLY_DISPOSITION[d].label,
              glyph: REPLY_DISPOSITION[d].glyph,
              count: (grouped.get(d) ?? []).length,
              tone: REPLY_DISPOSITION[d].cssVar,
            })),
          ]}
          onChange={(value) => {
            setParams(
              (previous) => {
                const next = new URLSearchParams(previous);
                if (value === "all") next.delete("disposition");
                else next.set("disposition", value);
                return next;
              },
              { replace: false },
            );
            setPickedId(null);
          }}
        />

        <WorkingSetLead
          headingId="replies-working-set-h"
          changeKey={disposition}
          kicker="On screen now"
          glyph={
            disposition === "all" ? "Σ" : REPLY_DISPOSITION[disposition].glyph
          }
          label={
            disposition === "all"
              ? "Every answer"
              : REPLY_DISPOSITION[disposition].label
          }
          tone={
            disposition === "all"
              ? "var(--brand-gold)"
              : REPLY_DISPOSITION[disposition].cssVar
          }
          count={walk.length}
          total={replies.length}
          noun={["reply", "replies"]}
          facts={readingFacts.map((f, i) => ({
            label: f.label,
            value: f.value,
            qualifier:
              i === 0 ? (
                <ProvenanceBadge provenance="illustrative" compact />
              ) : undefined,
          }))}
          rows={walk.slice(0, 3).map((r) => ({
            id: r.id,
            name: PROSPECT_BY_ID[r.prospectId]?.name ?? r.prospectId,
            kind: REPLY_DISPOSITION[r.disposition].label,
            when: r.nextStepDue ? (
              <>
                next step <span className="num">{formatDate(r.nextStepDue)}</span>
              </>
            ) : (
              <>
                came back <span className="num">{formatDate(r.receivedAt)}</span>
              </>
            ),
          }))}
          emptyLine={
            disposition === "all"
              ? "No reply is on file."
              : "No organisation has given this answer."
          }
          announcement={announcement}
          actions={
            disposition === "all" ? undefined : (
              <Button
                size="sm"
                glyph="✕"
                onClick={() => {
                  setParams(
                    (previous) => {
                      const next = new URLSearchParams(previous);
                      next.delete("disposition");
                      return next;
                    },
                    { replace: false },
                  );
                  setPickedId(null);
                }}
              >
                Show every answer, all {replies.length}
              </Button>
            )
          }
        />

        {/* ---------------------------------------------------------
            THE SIX DISPOSITIONS, ALL OF THEM, EMPTY ONES INCLUDED.
            --------------------------------------------------------- */}
        <section className={styles.groups} aria-labelledby="groups-h">
          <h2 className={styles.h2} id="groups-h">
            By disposition
          </h2>
          {/*
            ALL SIX ARE SHOWN WHEN NOTHING IS NARROWING THEM, empty ones
            included, because an empty group says which answer this trade
            area is not producing.

            When a disposition IS on, the line that used to sit here
            saying which one and offering the way out has gone: the lead
            block above says both, one screenful earlier, and it carries
            the verb. Two paragraphs telling a reader the same thing about
            the same filter is how a working screen turns back into an
            essay.
          */}
          {DISPOSITION_ORDER.filter(
            (d) => disposition === "all" || d === disposition,
          ).map((d) => {
            const rows = grouped.get(d) ?? [];
            const token = REPLY_DISPOSITION[d];
            return (
              <section
                key={d}
                className={styles.group}
                data-empty={rows.length === 0}
                aria-labelledby={`group-${d}`}
              >
                <div className={styles.groupHead}>
                  <h3 className={styles.groupTitle} id={`group-${d}`}>
                    <span
                      className={styles.groupGlyph}
                      aria-hidden="true"
                      style={{ ["--tone" as string]: token.cssVar }}
                    >
                      {token.glyph}
                    </span>
                    {token.label}
                  </h3>
                  <span className={`${styles.groupCount} num`}>
                    {rows.length}
                  </span>
                </div>
                {token.note ? (
                  <p className={styles.groupNote}>{token.note}</p>
                ) : null}

                {rows.length === 0 ? (
                  <p className={styles.groupEmpty}>
                    <span aria-hidden="true">○</span>
                    <span>
                      {d === "not-now"
                        ? "No dated not now yet."
                        : "Nothing in this group yet."}
                    </span>
                  </p>
                ) : (
                  <ul className={styles.cards}>
                    {rows.map((r) => (
                      <ReplyCard
                        key={r.id}
                        reply={r}
                        desk={desk}
                        current={r.id === currentId}
                      />
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </section>

        {/* ---------------------------------------------------------
            RESPONSE RATE. Named numerator, named denominator, and the
            sentence that explains why the figure is low.
            --------------------------------------------------------- */}
        <section className={styles.rate} aria-labelledby="rate-h">
          <div className={styles.rateHead}>
            <h2 className={styles.h2} id="rate-h">
              Response rate
            </h2>
            <ProvenanceBadge provenance="modeled" />
          </div>

          <div className={styles.rateFigures}>
            <div className={styles.figure}>
              <span className={`${styles.figureValue} num`}>
                {rate.perOrganisation === null ? "No rate" : pct(rate.perOrganisation)}
              </span>
              <span className={styles.figureLabel}>
                Of organisations written to, answered
              </span>
            </div>
            <div className={styles.figure}>
              <span className={`${styles.figureValue} num`}>
                {rate.perTouch === null ? "No rate" : pct(rate.perTouch)}
              </span>
              <span className={styles.figureLabel}>Of individual touches, answered</span>
            </div>
            <div className={styles.figure}>
              <span className={`${styles.figureValue} num`}>{rate.organisations}</span>
              <span className={styles.figureLabel}>
                Organisations touched
                <ProvenanceBadge provenance="illustrative" compact />
              </span>
            </div>
            <div className={styles.figure}>
              <span className={`${styles.figureValue} num`}>{rate.touches}</span>
              <span className={styles.figureLabel}>
                Touches recorded
                <ProvenanceBadge provenance="illustrative" compact />
              </span>
            </div>
            <div className={styles.figure}>
              <span className={`${styles.figureValue} num`}>{rate.answered}</span>
              <span className={styles.figureLabel}>
                Came back with words
                <ProvenanceBadge provenance="illustrative" compact />
              </span>
            </div>
          </div>

          <div className={styles.rateBody}>
            {/* Numerator and denominator are named so the figure can be
                argued with. A recorded silence is not a response. */}
            <p className={styles.rateText}>
              Answered over organisations written to at least once in{" "}
              {period ? period.label : "the selected period"}, not the{" "}
              {PROSPECTS.length} in the trade area.
            </p>
            <p className={styles.rateText}>
              {rate.answered > 0 && rate.touches > 0 ? (
                <>
                  One answer per{" "}
                  <span className="num">
                    {Math.round(rate.touches / rate.answered)}
                  </span>{" "}
                  written touches.
                </>
              ) : (
                "Nothing has come back yet in this period, so there is no rate."
              )}
            </p>
            {/* Left out of the rate above: a numerator that reaches outside
                its denominator is how a rate exceeds 100%. */}
            {rate.offPeriod > 0 ? (
              <p
                className={styles.rateText}
                title="These rows are shown below and left out of the rate above, because a numerator that reaches outside its own denominator is how a response rate ends up above one hundred percent."
              >
                <span aria-hidden="true">▲</span> {rate.offPeriod} reply
                {rate.offPeriod === 1 ? " is" : " rows are"} on file with no
                recorded touch in this period, and out of the rate above.
              </p>
            ) : null}
            <p className={styles.rateFoot}>
              <Link className="tap" to="/method">
                Formulas and sources
              </Link>
              <span aria-hidden="true" className={styles.dot}>
                ·
              </span>
              <Link className="tap" to="/sent">
                What has already gone out
              </Link>
            </p>
          </div>
        </section>

        {/* ---------------------------------------------------------
            THIS WEEK. Next steps, sorted by the day they fall.
            --------------------------------------------------------- */}
        <section className={styles.week} aria-labelledby="week-h">
          <div className={styles.weekHead}>
            <h2 className={styles.h2} id="week-h">
              Next steps, by the day they fall
            </h2>
            <p className={styles.weekDesk}>
              Desk date <span className="num">{formatDate(desk)}</span>
            </p>
          </div>

          {/* The desk date is the day of the most recent reply, not the
              clock on the machine, so the overdue counts hold in any month. */}
          <p className={styles.weekNote}>
            Measured from the most recent reply, not from a live clock.
          </p>

          {BUCKET_ORDER.every((b) => (steps.get(b) ?? []).length === 0) ? (
            <p className={styles.empty}>
              <span aria-hidden="true">○</span> No next steps are recorded.
            </p>
          ) : (
            BUCKET_ORDER.map((bucket) => {
              const rows = steps.get(bucket) ?? [];
              if (rows.length === 0) return null;
              const meta = BUCKET_META[bucket];
              return (
                <div key={bucket} className={styles.bucket}>
                  <h3 className={styles.bucketHead}>
                    <span
                      className={styles.bucketGlyph}
                      aria-hidden="true"
                      style={{ ["--tone" as string]: meta.cssVar }}
                    >
                      {meta.glyph}
                    </span>
                    <span className={styles.bucketLabel}>{meta.label}</span>
                    <span className={`${styles.bucketCount} num`}>
                      {rows.length}
                    </span>
                  </h3>
                  <p className={styles.bucketNote}>{meta.note}</p>
                  <ul className={styles.stepList}>
                    {rows.map((r) => {
                      const prospect = PROSPECT_BY_ID[r.prospectId];
                      return (
                        <li key={r.id} className={styles.step}>
                          <span className={styles.stepWhen}>
                            <span className="num">
                              {r.nextStepDue ? formatDate(r.nextStepDue) : "No date"}
                            </span>
                          </span>
                          <span className={styles.stepWho}>
                            <span className={styles.stepName}>
                              {prospect?.name ?? r.prospectId}
                            </span>
                            {prospect ? (
                              <LaneChip lane={prospect.lane} size="sm" />
                            ) : null}
                            <TokenChip
                              token={REPLY_DISPOSITION[r.disposition]}
                              size="sm"
                            />
                          </span>
                          <span className={styles.stepWhat}>{r.nextStep}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })
          )}
        </section>

        {/* ---------------------------------------------------------
            THE SILENCE, COMPUTED FROM THE FACT TABLE.
            --------------------------------------------------------- */}
        <section className={styles.silence} aria-labelledby="silence-h">
          <div className={styles.silenceHead}>
            <h2 className={styles.h2} id="silence-h">
              Written to, nothing back
            </h2>
            <ProvenanceBadge provenance="modeled" />
          </div>

          <p className={styles.silenceNote}>
            Not seeded. Every organisation touched in this period with no
            reply row against it.
          </p>

          {silence.quiet.length === 0 ? (
            /* THE SILENCE LIST, WORKED TO NOTHING.
               This section is the one on the page that can actually be
               emptied by doing the job: it holds every organisation still
               sitting at reached out with nothing back, and it goes to
               zero only when every one of them has answered. That is a
               result, so it is drawn as one rather than as a row that
               failed to load. The six disposition groups above are left
               alone on purpose, because an empty group there is a shape
               of the answers coming back and not a queue anybody
               cleared. */
            <ClearedBoard
              headline="Every one answered"
              figure={`${touched.length} written to`}
            />
          ) : (
            <ul className={styles.silenceList}>
              {silence.quiet.map((row) => {
                const prospect = PROSPECT_BY_ID[row.prospectId];
                return (
                  <li key={row.prospectId} className={styles.silenceRow}>
                    <span className={styles.silenceWho}>
                      <span className={styles.stepName}>
                        {prospect?.name ?? row.prospectId}
                      </span>
                      {prospect ? (
                        <LaneChip lane={prospect.lane} size="sm" />
                      ) : null}
                    </span>
                    <span className={styles.silenceStatus}>
                      <StatusChip status={row.status} size="sm" short />
                    </span>
                    <span className={`${styles.silenceTouches} num`}>
                      {row.touches} {row.touches === 1 ? "touch" : "touches"}
                    </span>
                    <span className={styles.silenceWhen}>
                      {row.lastTouchAt ? (
                        <>
                          last <span className="num">{formatDate(row.lastTouchAt)}</span>
                        </>
                      ) : (
                        "no date recorded"
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {silence.offPage.length > 0 ? (
            <div className={styles.offPage}>
              <h3 className={styles.offPageTitle}>
                Moved without a written reply on file
              </h3>
              {/* Answered somewhere this page cannot see, so counted as
                  neither silence nor response. */}
              <p className={styles.offPageNote}>
                Status moved with no written reply on file. Counted in neither
                figure above.
              </p>
              <ul className={styles.silenceList}>
                {silence.offPage.map((row) => {
                  const prospect = PROSPECT_BY_ID[row.prospectId];
                  return (
                    <li key={row.prospectId} className={styles.silenceRow}>
                      <span className={styles.silenceWho}>
                        <span className={styles.stepName}>
                          {prospect?.name ?? row.prospectId}
                        </span>
                        {prospect ? (
                          <LaneChip lane={prospect.lane} size="sm" />
                        ) : null}
                      </span>
                      <span className={styles.silenceStatus}>
                        <StatusChip status={row.status} size="sm" short />
                      </span>
                      <span className={`${styles.silenceTouches} num`}>
                        {row.touches} {row.touches === 1 ? "touch" : "touches"}
                      </span>
                      <span className={styles.silenceWhen}>
                        {row.lastTouchAt ? (
                          <>
                            last{" "}
                            <span className="num">{formatDate(row.lastTouchAt)}</span>
                          </>
                        ) : (
                          "no date recorded"
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          {/* The rule in the vocabulary: two written touches, then a visit.
              A third email is a spam folder. */}
          <p className={styles.silenceFoot}>
            Two written touches and then a visit.{" "}
            <Link to="/field">The tabling and go-see runs</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
