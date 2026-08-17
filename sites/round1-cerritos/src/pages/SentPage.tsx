import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  useOutbox,
  KIND_META,
  OUTCOME_META,
  type OutboxKind,
  type OutboxOutcome,
  type SentMessage,
} from "@/state/OutboxProvider";
import { useOpenQuotePreview } from "@/state/QuotePreviewProvider";
import { PROSPECTS } from "@/data/prospects";
import { PACKAGE_BY_ID } from "@/data/packages";
import { DEMO_RECIPIENT } from "@/data/venue";
import { LaneChip } from "@/components/primitives/LaneChip";
import { ProspectPlate } from "@/components/primitives/Wordmark";
import { RecordName } from "@/components/record/RecordName";
import { Figure, ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { Button } from "@/components/primitives/Button";
import styles from "./SentPage.module.css";

/**
 * THE OUTBOX. WHAT WENT OUT, AND THE REASON NOTHING ACTUALLY WENT ANYWHERE.
 *
 * Two jobs, and the second one is the reason this screen leads with a
 * paragraph rather than a table.
 *
 * The first job is the ordinary one. A rep at nine on a Monday does not
 * ask what to send, they ask what they already sent, to whom, in which
 * words, and whether anybody answered. Software that cannot answer that
 * has asked a person to carry a week of correspondence in their head,
 * which is precisely the thing software is for. So every row here carries
 * the organisation with its lane, the template that wrote it, the
 * recipient, the subject, the whole body, the timestamp and a reference.
 *
 * ── THE SECOND JOB, AND WHY IT IS AT THE TOP ──────────────────────
 * The first question any careful reader has about a prototype with a Send
 * button in it is whether the button sends. Most demonstrations answer
 * that with a promise: a banner saying nothing will really be emailed, a
 * disabled switch, a mode you could presumably leave. A promise is only
 * as good as the code behind it, and the reader cannot see the code.
 *
 * This build answers it with a property instead. There is no email
 * transport anywhere in the dependency tree. Not a disabled one, not one
 * behind a flag, not an API client waiting on a key. OutboxProvider's
 * SEND case is the entire send path and it appends to an array. Every
 * recipient is forced to DEMO_RECIPIENT inside the reducer rather than
 * taken from the caller, and that address sits on .invalid, which RFC
 * 2606 reserves so that it can never resolve anywhere.
 *
 * A demo that promises not to send is trusting itself. A demo that cannot
 * send is a fact about its dependency tree, checkable by anybody who opens
 * package.json. That distinction is worth a section of its own, because a
 * hiring manager evaluating somebody who will hold a real prospect list
 * has a legitimate interest in how that person handles the difference
 * between a policy and a guarantee.
 *
 * ── WHY THIS PAGE HAS TWO LISTS ───────────────────────────────────
 * Five messages are seeded so the log has a pattern in it: four lanes,
 * two kinds of message, four different outcomes and only one of them
 * good, which is the honest ratio for cold outreach from a building
 * nobody has heard of. But a seeded log and a log the reader wrote are
 * not the same evidence, and merging them would quietly take credit for
 * work the reader did not do.
 *
 * So they are separated. Everything sent from this browser sits above,
 * everything that arrived with the build sits below, and the top section
 * is empty on first load. That empty state is therefore the state most
 * readers see first, which is why it is the most designed thing on the
 * page rather than a grey line saying "no data".
 */

// ---------------------------------------------------------------
// Seeded against live
// ---------------------------------------------------------------

/**
 * Seeded rows are "sent-0001" through "sent-0005". Live rows are stamped
 * with Date.now(), so they carry thirteen digits rather than four, and
 * one regular expression separates them for good.
 *
 * The alternative was a boolean on the row, which would have meant
 * editing the state file to add a field only this page reads. The id
 * shape is already load-bearing elsewhere for exactly this reason, and
 * two places agreeing on one rule beats two places carrying two.
 */
const SEEDED_ID = /^sent-\d{4}$/;

function isSeeded(m: SentMessage): boolean {
  return SEEDED_ID.test(m.id);
}

// ---------------------------------------------------------------
// Dates
// ---------------------------------------------------------------

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Dates are split rather than parsed, for the same reason they are on the
 * Book page and the replies page. `new Date("2026-09-18")` is midnight
 * UTC, and rendering that through a locale formatter in California prints
 * the seventeenth. A send that shows a day early on a screen somebody is
 * working from is not a rounding error, it is a wrong answer.
 *
 * A live send may stamp a full ISO instant rather than a calendar day, so
 * the time half is kept when it is there and dropped when it is not. A
 * seeded row inventing a plausible 09:14 would be a fact nobody put in
 * the data.
 */
function formatStamp(iso: string): string {
  const [datePart, timePart] = iso.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const day = `${d} ${MONTHS[m - 1]} ${y}`;
  if (!timePart) return day;
  const hhmm = timePart.slice(0, 5);
  return /^\d{2}:\d{2}$/.test(hhmm) ? `${day}, ${hhmm}` : day;
}

// ---------------------------------------------------------------
// Reading orders
// ---------------------------------------------------------------

/**
 * The order outcomes are tallied in: best news to worst, ending on
 * silence. Declared here rather than in the provider because nothing else
 * in the application has an opinion about it, and a reading order one
 * page uses is that page's business.
 */
const OUTCOME_ORDER: OutboxOutcome[] = [
  "meeting-set",
  "asked-for-info",
  "awaiting",
  "declined",
  "no-reply",
];

/** The three things a row can be, in the order they happen in a deal. */
const KIND_ORDER: OutboxKind[] = ["outreach", "quote", "hold-confirmation"];

/**
 * The organisation the sample quote link points at.
 *
 * Looked up in PROSPECTS rather than typed as a string, and falling back
 * to the first row if that id ever moves, because a dead link inside an
 * empty state is worse than no link at all: it is the one control on the
 * screen a reader is invited to press.
 */
const SAMPLE = PROSPECTS.find((p) => p.id === "brea-olinda-high-school") ?? PROSPECTS[0];

/*
  The sample link carries a package and a headcount because a bare quote
  link is a different page from a filled one, and the empty state is
  arguing that these rows have somewhere to land. The headcount is the
  one in the seeded school reply on the desk, so the two screens agree.
  The package is the only one Round1 publishes.
*/
const SAMPLE_PACKAGE_ID = "all-inclusive-party";
const SAMPLE_GUESTS = 380;

// ---------------------------------------------------------------
// Small parts
// ---------------------------------------------------------------

function KindChip({ kind }: { kind: OutboxKind }) {
  const meta = KIND_META[kind];
  return (
    <span className={styles.kindChip} title={meta.note}>
      <span aria-hidden="true" className={styles.chipGlyph}>
        {meta.glyph}
      </span>
      <span>{meta.label}</span>
    </span>
  );
}

/* Glyph, word, then tone. Colour is never carrying this on its own. */
function OutcomeChip({ outcome }: { outcome: OutboxOutcome }) {
  const meta = OUTCOME_META[outcome];
  return (
    <span
      className={styles.outcomeChip}
      style={{ ["--tone" as string]: meta.cssVar }}
    >
      <span aria-hidden="true" className={styles.chipGlyph}>
        {meta.glyph}
      </span>
      <span>{meta.label}</span>
    </span>
  );
}

// ---------------------------------------------------------------
// One sent message
// ---------------------------------------------------------------

type CopyState = "idle" | "copied" | "failed";

function SentCard({
  message,
  open,
  onToggle,
}: {
  message: SentMessage;
  open: boolean;
  onToggle: () => void;
}) {
  const [copy, setCopy] = useState<CopyState>("idle");
  const openQuotePreview = useOpenQuotePreview();
  const bodyRef = useRef<HTMLPreElement | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const pkg = message.packageId ? PACKAGE_BY_ID[message.packageId] : undefined;
  const seeded = isSeeded(message);
  const bodyId = `body-${message.id}`;

  /**
   * COPY THE BODY, BECAUSE THAT IS WHAT A PERSON ACTUALLY DOES WITH ONE.
   *
   * The genuinely useful thing to do with a drafted email in a tool that
   * cannot send email is to paste it into the mail client that can. So
   * the control exists, and it has to survive the case where it cannot
   * work: navigator.clipboard is undefined on an insecure origin and
   * writeText rejects outright when the document does not have focus or
   * the user has denied the permission.
   *
   * The failure branch is not a shrug. It selects the whole body so the
   * reader's own copy shortcut finishes the job, and it says so in words.
   * A button that silently does nothing teaches a reader that the rest of
   * the application is probably lying to them too.
   *
   * The feedback is a WORD CHANGE, not a colour change. "Copy the body"
   * becomes "Copied", which is legible in greyscale, at distance, and to
   * the colourblind owner of this site.
   */
  async function copyBody() {
    window.clearTimeout(timer.current);
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable in this context");
      }
      await navigator.clipboard.writeText(message.body);
      setCopy("copied");
    } catch {
      setCopy("failed");
      if (!open) onToggle();
      /* Selection is deferred a frame so the body is in the document
         before a range is drawn across it. */
      window.requestAnimationFrame(() => {
        const node = bodyRef.current;
        const selection = window.getSelection?.();
        if (!node || !selection) return;
        const range = document.createRange();
        range.selectNodeContents(node);
        selection.removeAllRanges();
        selection.addRange(range);
      });
    }
    timer.current = window.setTimeout(() => setCopy("idle"), 4000);
  }

  const copyLabel =
    copy === "copied"
      ? "Copied"
      : copy === "failed"
        ? "Could not copy"
        : "Copy the body";
  const copyGlyph = copy === "copied" ? "✓" : copy === "failed" ? "✕" : "▤";

  return (
    <li className={styles.card}>
      <div className={styles.cardHead}>
        {/*
          The lane chip moves out of the wordmark and joins the other two
          marks, so the three things a reader sorts a log by sit together
          on one line: which lane, what kind of message, what came back.
          Left where it was by default it would be reading as part of the
          organisation's name rather than as a filter.
        */}
        <span className={styles.ident}>
          <ProspectPlate name={message.prospectName} lane={message.lane} />
          <span className={styles.identText}>
            <span className={styles.identName}>
              <RecordName
                prospectId={message.prospectId}
                name={message.prospectName}
              />
            </span>
            <span className={styles.identMeta}>
              <span className={styles.identSub}>
                Addressed to the {message.recipientRole}
              </span>
            </span>
          </span>
        </span>
        <div className={styles.marks}>
          <LaneChip lane={message.lane} size="sm" />
          <KindChip kind={message.kind} />
          <OutcomeChip outcome={message.outcome} />
        </div>
      </div>

      <p className={styles.subject}>{message.subject}</p>

      {/*
        The recipient is printed in full rather than shortened to a name.
        It is the single most checkable fact on the card: a reader who
        knows what .invalid means has the guarantee confirmed in the row
        itself, and a reader who does not has the sentence under the head
        of the page.
      */}
      <dl className={styles.fields}>
        <div className={styles.field}>
          <dt className={styles.fieldLabel}>To</dt>
          <dd className={styles.fieldValue}>
            <span className={styles.mono}>{message.to}</span>
            <span className={styles.fieldNote}>
              reserved by RFC 2606, cannot resolve
            </span>
          </dd>
        </div>
        <div className={styles.field}>
          <dt className={styles.fieldLabel}>Template</dt>
          <dd className={styles.fieldValue}>{message.templateLabel}</dd>
        </div>
        <div className={styles.field}>
          <dt className={styles.fieldLabel}>Sent</dt>
          <dd className={styles.fieldValue}>
            <span className="num">{formatStamp(message.sentAt)}</span>
          </dd>
        </div>
        <div className={styles.field}>
          <dt className={styles.fieldLabel}>Reference</dt>
          <dd className={styles.fieldValue}>
            <span className={`${styles.mono} num`}>{message.reference}</span>
          </dd>
        </div>
      </dl>

      {message.guests || pkg || message.attachmentName ? (
        <div className={styles.quoteFacts}>
          {pkg ? (
            <span className={styles.quoteFact}>
              <span className={styles.fieldLabel}>Written against</span>
              <span className={styles.fieldValue}>{pkg.name}</span>
            </span>
          ) : null}
          {message.guests ? (
            <span className={styles.quoteFact}>
              <span className={styles.fieldLabel}>Guests discussed</span>
              <Figure
                value={message.guests}
                provenance={seeded ? "illustrative" : "user_input"}
                compact
              />
            </span>
          ) : null}
          {message.attachmentName ? (
            <span className={styles.quoteFact}>
              <span className={styles.fieldLabel}>Attached</span>
              <span className={`${styles.fieldValue} ${styles.mono}`}>
                {message.attachmentName}
              </span>
            </span>
          ) : null}
        </div>
      ) : null}

      {/* ---- The body -------------------------------------------- */}
      <div className={styles.bodyBlock}>
        <div className={styles.bodyBar}>
          <button
            type="button"
            className={styles.bodyToggle}
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={bodyId}
          >
            <span aria-hidden="true" className={styles.caret}>
              {open ? "▾" : "▸"}
            </span>
            <span>{open ? "Hide the message" : "Read the message"}</span>
          </button>
          <div className={styles.copyRow}>
            <Button
              size="sm"
              variant={copy === "copied" ? "primary" : "secondary"}
              glyph={copyGlyph}
              onClick={copyBody}
              aria-label={`${copyLabel}, ${message.subject}`}
            >
              {copyLabel}
            </Button>
          </div>
        </div>

        {!open ? (
          <p className={styles.preview}>
            {message.body.slice(0, 118).trimEnd()}
            {message.body.length > 118 ? "..." : ""}
          </p>
        ) : null}

        {/*
          A <pre> rather than a paragraph, and monospace at a measure of
          about seventy characters. The template wrote real line breaks
          into some of these bodies and a paragraph would eat them, which
          would show the reader a message the sender never wrote. The
          measure is capped because monospace at full page width is
          genuinely hard to read back, and reading it back is the entire
          point of keeping it.
        */}
        <pre id={bodyId} ref={bodyRef} className={styles.body} hidden={!open}>
          {message.body}
        </pre>

        <p className={styles.copyStatus} role="status">
          {copy === "copied"
            ? "Copied to the clipboard. Paste it into your own mail client."
            : copy === "failed"
              ? "The clipboard is not available in this context, so the message has been selected instead. Use your own copy shortcut."
              : ""}
        </p>
      </div>

      {message.reply ? (
        <blockquote className={styles.reply}>
          <p className={styles.replyLabel}>
            <span aria-hidden="true">{OUTCOME_META[message.outcome].glyph}</span>
            <span>What came back</span>
            <ProvenanceBadge provenance="illustrative" compact />
          </p>
          <p className={styles.replyText}>{message.reply}</p>
        </blockquote>
      ) : (
        <p className={styles.noReply}>
          <span aria-hidden="true">○</span>
          <span>
            Nothing has come back against this one.
          </span>
        </p>
      )}

      <p className={styles.cardFoot}>
        {/* The letter opens over the log. Following it to its own route
            would take the strip, the rail and this log off the screen,
            and the log is the reason the reader is here. */}
        <button
          type="button"
          className={styles.quoteButton}
          onClick={() =>
            openQuotePreview(message.prospectId, {
              packageId: message.packageId ?? undefined,
              guests: message.guests ?? undefined,
            })
          }
        >
          The group quote page this organisation would land on
        </button>
      </p>
    </li>
  );
}

// ---------------------------------------------------------------
// The empty state
// ---------------------------------------------------------------

/**
 * THE STATE MOST READERS SEE FIRST, SO IT IS TREATED AS THE PAGE.
 *
 * Nobody arrives here having sent anything. If this were a grey line
 * reading "no messages" then the first impression of the outbox would be
 * an absence, and a reader would have no way of knowing whether the
 * feature works, what it produces, or how to make it produce something.
 *
 * So it does three things a placeholder cannot. It shows the SHAPE of a
 * row that is not there yet, field by field, so the reader knows what
 * they are being offered. It names the exact TWO PLACES in the
 * application that write to this log, because "send an email somewhere"
 * is not an instruction. And it carries two working links, one to each of
 * them, so the way out of the empty state is on the screen that describes
 * it rather than three clicks away in a navigation menu.
 */
function EmptyOutbox() {
  const openQuotePreview = useOpenQuotePreview();

  return (
    <div className={styles.empty}>
      <p className={styles.emptyEyebrow}>
        <span aria-hidden="true">○</span> Nothing sent from this browser yet
      </p>
      <h3 className={styles.emptyTitle}>No sends from this browser yet</h3>
      <p className={styles.emptyLede}>
        The rows further down arrived with the build.
      </p>

      <div className={styles.emptyGrid}>
        <div className={styles.emptyCol}>
          <h4 className={styles.emptyColTitle}>What a row holds</h4>
          <ul className={styles.emptyFields}>
            <li>
              <strong>The organisation</strong>, with its prospecting lane.
            </li>
            <li>
              <strong>The role it was addressed to.</strong> A title, never an
              invented person.
            </li>
            <li>
              <strong>The template that wrote it</strong>, by name.
            </li>
            <li>
              <strong>The recipient in full</strong>, always{" "}
              <span className={styles.mono}>{DEMO_RECIPIENT}</span>.
            </li>
            <li>
              <strong>The subject and the whole body</strong>, character for
              character, with a copy control.
            </li>
            <li>
              <strong>The timestamp and a reference</strong> marked DEMO.
            </li>
          </ul>
        </div>

        <div className={styles.emptyCol}>
          <h4 className={styles.emptyColTitle}>The two things that write here</h4>

          <div className={styles.door}>
            <p className={styles.doorHead}>
              <span aria-hidden="true" className={styles.doorGlyph}>
                {KIND_META.outreach.glyph}
              </span>
              <span>Outreach, from the drawer on the desk</span>
            </p>
            <p className={styles.doorText}>
              The template forks on the lane and on the absent price.
            </p>
            <p className={styles.doorLink}>
              <Link className="tap" to="/">
                Open the desk
              </Link>
            </p>
          </div>

          <div className={styles.door}>
            <p className={styles.doorHead}>
              <span aria-hidden="true" className={styles.doorGlyph}>
                {KIND_META["hold-confirmation"].glyph}
              </span>
              <span>A hold request, from a group quote page</span>
            </p>
            <p className={styles.doorText}>
              The prospect-facing page. A hold request writes a row from the
              buyer's direction.
            </p>
            <p className={styles.doorLink}>
              <button
                type="button"
                className={styles.quoteButton}
                onClick={() =>
                  openQuotePreview(SAMPLE.id, {
                    packageId: SAMPLE_PACKAGE_ID,
                    guests: SAMPLE_GUESTS,
                  })
                }
              >
                Open a sample quote for {SAMPLE.name}
              </button>
              <span className={styles.doorLinkNote}>
                Written against the{" "}
                {PACKAGE_BY_ID[SAMPLE_PACKAGE_ID]?.name ?? "school package"} and
                the headcount in their reply.{" "}
                <ProvenanceBadge provenance="illustrative" compact />
              </span>
            </p>
          </div>
        </div>
      </div>

      <p className={styles.emptyFoot}>Nothing leaves this browser tab.</p>
    </div>
  );
}

// ---------------------------------------------------------------
// The page
// ---------------------------------------------------------------

export function SentPage() {
  const { sent } = useOutbox();

  /**
   * Open by default when the section is short, and the newest row is
   * always open.
   *
   * Bodies are the reason to be here, so hiding all of them behind a
   * click would be a strange thing for an outbox to do. Showing forty at
   * full length would be worse. The compromise is that a section of three
   * or fewer reads in full, a longer one opens its newest row and previews
   * the rest, and an explicit override wins over both. A reader who has
   * just sent something finds it open, because they have.
   */
  const [override, setOverride] = useState<Record<string, boolean>>({});

  const { live, seeded } = useMemo(() => {
    const byNewest = (a: SentMessage, b: SentMessage) =>
      b.sentAt.localeCompare(a.sentAt) || b.id.localeCompare(a.id);
    return {
      live: sent.filter((m) => !isSeeded(m)).sort(byNewest),
      seeded: sent.filter(isSeeded).sort(byNewest),
    };
  }, [sent]);

  const tally = useMemo(() => {
    const outcomes = new Map<OutboxOutcome, number>();
    const kinds = new Map<OutboxKind, number>();
    for (const m of sent) {
      outcomes.set(m.outcome, (outcomes.get(m.outcome) ?? 0) + 1);
      kinds.set(m.kind, (kinds.get(m.kind) ?? 0) + 1);
    }
    return {
      outcomes,
      kinds,
      organisations: new Set(sent.map((m) => m.prospectId)).size,
    };
  }, [sent]);

  const defaultOpen = (index: number, total: number) =>
    index === 0 || total <= 3;

  const isOpen = (m: SentMessage, index: number, total: number) =>
    override[m.id] ?? defaultOpen(index, total);

  const setSection = (rows: SentMessage[], value: boolean) =>
    setOverride((prev) => {
      const next = { ...prev };
      for (const m of rows) next[m.id] = value;
      return next;
    });

  const renderList = (rows: SentMessage[]) => (
    <ul className={styles.list}>
      {rows.map((m, i) => (
        <SentCard
          key={m.id}
          message={m}
          open={isOpen(m, i, rows.length)}
          onToggle={() =>
            setOverride((prev) => ({
              ...prev,
              [m.id]: !isOpen(m, i, rows.length),
            }))
          }
        />
      ))}
    </ul>
  );

  const sectionTools = (rows: SentMessage[]) =>
    rows.length > 1 ? (
      <div className={styles.sectionTools}>
        <Button size="sm" variant="ghost" onClick={() => setSection(rows, true)}>
          Open every message
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setSection(rows, false)}>
          Collapse them
        </Button>
      </div>
    ) : null;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Stage four, what went out</p>
          <h1 className={styles.h1}>The outbox</h1>
          {/* A property of the build rather than a promise about behaviour.
              A demo that cannot send is checkable; one that promises not to
              is not. */}
          <p className={styles.subLede}>
            No email transport in this dependency tree. Every recipient sits on
            a .invalid domain, which RFC 2606 reserves so it can never resolve.
          </p>
        </header>

        {/* ---------------------------------------------------------
            THE GUARANTEE, STATED IN THE THREE PARTS THAT MAKE IT ONE.
            --------------------------------------------------------- */}
        <section className={styles.guarantee} aria-labelledby="guarantee-h">
          <h2 className={styles.h2} id="guarantee-h">
            Why nothing here can be sent by accident
          </h2>

          <ol className={styles.facts}>
            <li className={styles.fact}>
              <span aria-hidden="true" className={styles.factGlyph}>
                ▣
              </span>
              <span className={styles.factText}>
                <strong className={styles.factLead}>
                  No transport exists to disable.
                </strong>{" "}
                No mail client, no API key, no server function, no queue. The
                send path appends an object to an array.
              </span>
            </li>
            <li className={styles.fact}>
              <span aria-hidden="true" className={styles.factGlyph}>
                ◈
              </span>
              <span className={styles.factText}>
                <strong className={styles.factLead}>
                  The address cannot route.
                </strong>{" "}
                Every recipient is{" "}
                <span className={styles.mono}>{DEMO_RECIPIENT}</span>, forced
                inside the reducer rather than taken from the calling screen.
              </span>
            </li>
            <li className={styles.fact}>
              <span aria-hidden="true" className={styles.factGlyph}>
                ◕
              </span>
              <span className={styles.factText}>
                <strong className={styles.factLead}>
                  A send is a row, and the row stays here.
                </strong>{" "}
                Kept in this browser's local storage. Nothing is transmitted,
                and the reset control in the chrome removes all of it.
              </span>
            </li>
          </ol>

          {/* Static files from a public URL: any key capable of sending mail
              would ship inside the bundle. Real sending needs a server and
              this has none. */}
          <p className={styles.guaranteeWhy}>
            Demo mode is not a mode anybody can leave.
          </p>
        </section>

        {/* ---------------------------------------------------------
            WHAT IS IN THE LOG. Counts only, and they are counts of
            rows rather than commercial figures.
            --------------------------------------------------------- */}
        <section className={styles.tally} aria-labelledby="tally-h">
          <div className={styles.tallyHead}>
            <h2 className={styles.h2} id="tally-h">
              What is in the log
            </h2>
            <p className={styles.tallyNote}>Row counts, not money.</p>
          </div>

          <div className={styles.figures}>
            <div className={styles.figure}>
              <span className={`${styles.figureValue} num`}>{live.length}</span>
              <span className={styles.figureLabel}>Sent from this browser</span>
            </div>
            <div className={styles.figure}>
              <span className={`${styles.figureValue} num`}>{seeded.length}</span>
              <span className={styles.figureLabel}>
                Arrived with the build
                <ProvenanceBadge provenance="illustrative" compact />
              </span>
            </div>
            <div className={styles.figure}>
              <span className={`${styles.figureValue} num`}>
                {tally.organisations}
              </span>
              <span className={styles.figureLabel}>
                Organisations written to
              </span>
            </div>
          </div>

          <div className={styles.legends}>
            <div className={styles.legend}>
              <h3 className={styles.legendTitle}>By what the message was</h3>
              <ul className={styles.legendList}>
                {KIND_ORDER.map((kind) => (
                  <li key={kind} className={styles.legendRow}>
                    <span className={styles.legendMark}>
                      <span aria-hidden="true" className={styles.chipGlyph}>
                        {KIND_META[kind].glyph}
                      </span>
                      <span className={styles.legendLabel}>
                        {KIND_META[kind].label}
                      </span>
                    </span>
                    <span className={`${styles.legendCount} num`}>
                      {tally.kinds.get(kind) ?? 0}
                    </span>
                    <span className={styles.legendNote}>
                      {KIND_META[kind].note}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.legend}>
              <h3 className={styles.legendTitle}>By what came back</h3>
              <ul className={styles.legendList}>
                {OUTCOME_ORDER.map((outcome) => (
                  <li key={outcome} className={styles.legendRow}>
                    <span
                      className={styles.legendMark}
                      style={{
                        ["--tone" as string]: OUTCOME_META[outcome].cssVar,
                      }}
                    >
                      <span aria-hidden="true" className={styles.toneGlyph}>
                        {OUTCOME_META[outcome].glyph}
                      </span>
                      <span className={styles.legendLabel}>
                        {OUTCOME_META[outcome].label}
                      </span>
                    </span>
                    <span className={`${styles.legendCount} num`}>
                      {tally.outcomes.get(outcome) ?? 0}
                    </span>
                  </li>
                ))}
              </ul>
              <p className={styles.legendFoot}>
                <Link to="/replies">Their side of it, in full</Link>.
              </p>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------
            SENT IN THIS BROWSER. Empty on first load, by design.
            --------------------------------------------------------- */}
        <section className={styles.section} aria-labelledby="live-h">
          <div className={styles.sectionHead}>
            <h2 className={styles.h2} id="live-h">
              Sent from this browser
            </h2>
            {sectionTools(live)}
          </div>
          <p className={styles.sectionNote}>
            Newest first, kept apart from the seeded rows.
          </p>

          {live.length === 0 ? <EmptyOutbox /> : renderList(live)}
        </section>

        {/* ---------------------------------------------------------
            THE SEEDED LOG.
            --------------------------------------------------------- */}
        <section className={styles.section} aria-labelledby="seeded-h">
          <div className={styles.sectionHead}>
            <h2 className={styles.h2} id="seeded-h">
              Before this session
            </h2>
            {sectionTools(seeded)}
          </div>
          <p
            className={styles.sectionNote}
            title="The organisations, their lanes and the decision maker titles are real and sourced. The words are not, and no organisation is described as having said anything it did not say."
          >
            <ProvenanceBadge provenance="illustrative" />
            <span>Five messages written for this work sample.</span>
          </p>

          {seeded.length === 0 ? (
            <p className={styles.plainEmpty}>
              <span aria-hidden="true">○</span>
              <span>
                The seeded log has been cleared. Reset in the chrome puts it
                back.
              </span>
            </p>
          ) : (
            renderList(seeded)
          )}
        </section>

        {/* Two written touches and then a visit, so a fourth row against the
            same organisation is a finding rather than a milestone. */}
        <p className={styles.foot}>
          <Link to="/">Back to the desk</Link>
          <span aria-hidden="true" className={styles.dot}>
            ·
          </span>
          <Link to="/replies">What came back</Link>
          <span aria-hidden="true" className={styles.dot}>
            ·
          </span>
          <Link to="/method">Formulas and sources</Link>
        </p>
      </div>
    </div>
  );
}
