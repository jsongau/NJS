import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import type { OfferState, PitchStatus, Provenance } from "@/domain/types";
import type { StatusToken } from "@/domain/vocabulary";
import { PITCH_STATUS, PITCH_STATUS_ORDER } from "@/domain/vocabulary";
import { LANE_META } from "@/domain/lanes";
import { PROSPECT_BY_ID } from "@/data/prospects";
import { venueDate } from "@/domain/requests";
import {
  INTENT_META,
  ORG_TYPE_META,
  RECORD_AS_OF,
  prospectRecord,
} from "@/domain/selectors/record";
import { usePipeline, usePipelineDispatch } from "@/state/PipelineProvider";
import { useBook } from "@/state/BookProvider";
import { useQuotePreview } from "@/state/QuotePreviewProvider";
import { LaneChip } from "@/components/primitives/LaneChip";
import { TokenChip } from "@/components/primitives/StatusChip";
import { ProspectPlate } from "@/components/primitives/Wordmark";
import { Figure, ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { Button } from "@/components/primitives/Button";
import {
  EmailComposeModal,
  type ComposeIntent,
} from "@/components/email/EmailComposeModal";
import {
  CHANNEL_META,
  DIRECTION_META,
  REQUEUE_META,
  Timeline,
  formatDay,
} from "./Timeline";
import styles from "./ProspectRecordModal.module.css";

/**
 * THE RECORD. THE SCREEN A REP OPENS TWENTY TIMES A DAY.
 *
 * The owner asked for this in one sentence: click the business name and
 * get the profile, the last conversation, the status, whether they have
 * shown intent to commit, and what has been offered. Everything below is
 * that sentence, arranged so that all five answers are on screen before
 * anybody scrolls.
 *
 * ── WHY SIX CHIPS AND NOT A FORM ───────────────────────────────────
 * Attio's record page leads with six highlight widgets and pushes every
 * remaining attribute into a sidebar, precisely so the top of a record
 * is not a form. Six is the researched ceiling: the owner named four
 * facts, the decay timer and the next action are the two a solo rep
 * needs and did not ask for, and a seventh turns a glance into a read.
 * The chips here are status, intent, days quiet against this status's
 * threshold, offers open, inbound requests, and what is signed.
 *
 * ── THE QUOTE IS THE FIRST THING AFTER THE NAME ────────────────────
 * "Showcase last convo" was the first thing he said, so the last message
 * is quoted rather than summarised, with the role it was with, the day,
 * the channel, and the one clause saying what it changed. A status chip
 * with nothing behind it is a rep's memory written down badly.
 *
 * ── THE INTENT READING SHOWS ITS WORKING ───────────────────────────
 * A confidence reading nobody can argue with is worthless, so the level
 * is followed by the named signals it was read off, each with its
 * weight, its date and the words behind it. A reader who disagrees can
 * point at the line they disagree with. That is the difference between a
 * judgement and a number.
 *
 * ── NOTHING HERE IS COMPUTED TWICE ─────────────────────────────────
 * Every figure on this surface comes out of `prospectRecord`. Not one
 * day count, staleness test or intent level is worked out in this file.
 * Four surfaces read that selector and they cannot disagree, which is
 * the whole reason it exists.
 *
 * ── THE OFFERS BLOCK NEVER INVENTS A DISCOUNT ──────────────────────
 * DIME publishes no group price at all, so a percentage off one would
 * be a discount off a secret. What is extended is certainty: the
 * contents of the one package DIME itemises in public, and the one
 * booking term it states. The cost to the venue is read from the offer
 * catalogue in the words the catalogue uses, rather than restated as a
 * number whose unit a reader would have to guess.
 */

export interface ProspectRecordModalProps {
  /** A row in prospects.ts. */
  prospectId: string;
  onClose: () => void;
  /** Venue-local day this record is held until, from RecordProvider. */
  snoozedUntil?: string | null;
  onSnooze?: (prospectId: string, days: number) => void;
  onClearSnooze?: (prospectId: string) => void;
  snoozeOptions?: number[];
}

/**
 * Where each offer stands, in a word and a shape.
 *
 * Lapsed and withdrawn are kept apart from declined on purpose. "They
 * said no" and "we ran out of time" and "we pulled it" are three
 * different lessons, and a board that files all three as declined has
 * thrown two of them away.
 */
const OFFER_STATE_META: Record<OfferState, StatusToken> = {
  open: {
    glyph: "○",
    label: "Open",
    cssVar: "var(--info)",
    note: "On the table and unanswered. An offer nobody replied to is not a soft yes.",
  },
  accepted: {
    glyph: "●",
    label: "Accepted",
    cssVar: "var(--ok)",
    note: "They took it.",
  },
  declined: {
    glyph: "✕",
    label: "Declined",
    cssVar: "var(--risk)",
    note: "They said no to the offer, which is not always a no to the venue.",
  },
  lapsed: {
    glyph: "◌",
    label: "Lapsed",
    cssVar: "var(--warn)",
    note: "Time ran out on it. Recorded rather than quietly reopened.",
  },
  withdrawn: {
    glyph: "◍",
    label: "Withdrawn",
    cssVar: "var(--neutral)",
    note: "The venue pulled it, and the reason sits beside it.",
  },
};

const DEFAULT_SNOOZE_OPTIONS = [3, 7, 14];

const MS_PER_DAY = 86_400_000;

/**
 * The calendar day a hold runs to.
 *
 * Measured from `RECORD_AS_OF` rather than from the machine's clock, for
 * the same reason every other date in this application is: a work sample
 * opened on somebody else's computer in another state has to show the
 * same numbers it showed the day it was built. A hold that lands two
 * hundred days before the board it belongs to would be the loudest
 * possible way to break that.
 *
 * It lives here rather than in the provider because the provider renders
 * this file, and one direction of import is worth more than one
 * perfectly placed function.
 */
export function snoozeUntilDay(days: number): string {
  const base = Date.parse(`${venueDate(RECORD_AS_OF)}T00:00:00-07:00`);
  return venueDate(new Date(base + days * MS_PER_DAY).toISOString());
}

/** The domain, for a link that has to read as a place rather than a URL. */
function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function dayWord(n: number): string {
  return n === 1 ? "1 day" : `${n} days`;
}

/**
 * Null prospect means no dialog, and that is the whole of this function.
 *
 * The hooks sit one level down so that closing genuinely unmounts the
 * dialog: the focus return, the scroll restore and the key handler are
 * all cleanup, and cleanup that only runs when a boolean flips is
 * cleanup that eventually does not run.
 */
export function ProspectRecordModal(props: ProspectRecordModalProps) {
  const prospect = PROSPECT_BY_ID[props.prospectId];
  if (!prospect) return <UnknownRecord id={props.prospectId} onClose={props.onClose} />;
  return <RecordDialog {...props} />;
}

/**
 * A deep link to an organisation that is not on the board.
 *
 * A pasted URL with a typo in it should say so rather than render
 * nothing, which is indistinguishable from a broken application.
 */
function UnknownRecord({ id, onClose }: { id: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return (
    <>
      <div className={styles.scrim} onClick={onClose} aria-hidden="true" />
      <div
        className={`${styles.sheet} ${styles.sheetSmall}`}
        role="dialog"
        aria-modal="true"
        aria-label="Record not found"
      >
        <div className={styles.notFound}>
          <p className={styles.notFoundLead}>
            No organisation on this board carries the id{" "}
            <code className={styles.code}>{id}</code>.
          </p>
          <Button variant="primary" onClick={onClose} autoFocus>
            Close
          </Button>
        </div>
      </div>
    </>
  );
}

function RecordDialog({
  prospectId,
  onClose,
  snoozedUntil = null,
  onSnooze,
  onClearSnooze,
  snoozeOptions = DEFAULT_SNOOZE_OPTIONS,
}: ProspectRecordModalProps) {
  const pipeline = usePipeline();
  const dispatch = usePipelineDispatch();
  const { book } = useBook();
  const navigate = useNavigate();
  /* The preview is a dialog of its own, mounted above this one by
     QuotePreviewProvider. Reading the controller here is what lets this
     sheet stand its keyboard down while the letter is over it. */
  const quotePreview = useQuotePreview();
  const quoteOver = quotePreview.openId !== null;

  const dialogRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const [compose, setCompose] = useState<ComposeIntent | null>(null);
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  /* Used only where the provider has not supplied a snooze store, which
     is the standalone case. The provider's copy outlives the dialog. */
  const [localSnooze, setLocalSnooze] = useState<string | null>(null);

  /**
   * The whole record, derived once per state change.
   *
   * The pipeline object identity changes only when somebody dispatches,
   * so advancing a status recomputes and pressing a filter chip in the
   * timeline does not. This modal opens constantly and a hundred and
   * fifty-six message data set is small; the discipline still matters,
   * because the habit of deriving in the render body is what makes the
   * twentieth open of the day feel slower than the first.
   */
  const record = useMemo(
    () => prospectRecord(prospectId, { pipeline, book }),
    [prospectId, pipeline, book],
  );

  const requestClose = useCallback(() => {
    if (compose !== null || quoteOver) return;
    onClose();
  }, [compose, quoteOver, onClose]);

  /** Focus lands on the name. The provider takes it back on close. */
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  /**
   * The page behind does not scroll, and does not jump when it stops.
   *
   * Hiding the body overflow removes the scrollbar, and on a desktop
   * with classic scrollbars that shifts the layout fifteen pixels left
   * and back again. The padding compensates for exactly the width that
   * disappeared, so opening a record moves nothing behind it.
   */
  useEffect(() => {
    const el = document.body;
    const prevOverflow = el.style.overflow;
    const prevPadding = el.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    el.style.overflow = "hidden";
    if (gap > 0) el.style.paddingRight = `${gap}px`;
    return () => {
      el.style.overflow = prevOverflow;
      el.style.paddingRight = prevPadding;
    };
  }, []);

  /**
   * The trap, and Escape.
   *
   * Bound in the capture phase, and stood down entirely while the
   * compose window or the quote preview is open. Each of those is a
   * dialog of its own with its own trap and its own Escape, and two
   * traps fighting over the same Tab press is how a keyboard reader ends
   * up unable to reach a Send button. One layer owns the keyboard at a
   * time, and it is always the topmost one.
   */
  useEffect(() => {
    if (compose !== null || quoteOver) return undefined;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const root = dialogRef.current;
      if (!root) return;
      const list = Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null || el === headingRef.current);

      if (list.length === 0) {
        e.preventDefault();
        return;
      }
      const active = document.activeElement as HTMLElement | null;
      if (!active || !root.contains(active)) {
        e.preventDefault();
        list[0].focus();
        return;
      }
      const i = list.indexOf(active);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        list[list.length - 1].focus();
      } else if (!e.shiftKey && i === list.length - 1) {
        e.preventDefault();
        list[0].focus();
      }
    }

    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [compose, quoteOver, onClose]);

  if (!record) return null;

  const p = record.prospect;
  const orgType = ORG_TYPE_META[record.orgType];
  const intent = INTENT_META[record.intent.level];
  const held = snoozedUntil ?? localSnooze;
  const sourceUrl = p.emailSourceUrl ?? p.contactFormUrl ?? p.website;

  const last = record.lastMessage;
  const lastDays =
    last === undefined
      ? null
      : last.direction === "inbound"
        ? record.daysSinceInbound
        : record.daysSinceOutbound;
  /* Shown only where the last word was this desk's, because then the
     most recent thing THEY said is a different message and it is the one
     the rep has to answer. */
  const theirLast =
    last && last.direction === "outbound" ? record.lastInbound : undefined;

  function advance(e: ChangeEvent<HTMLSelectElement>) {
    const status = e.target.value as PitchStatus;
    dispatch({
      type: "SET_STATUS",
      prospectId,
      packageId: p.leadPackageId,
      status,
      at: new Date().toISOString(),
    });
    setAnnouncement(`Status set to ${PITCH_STATUS[status].label}.`);
  }

  function snoozeFor(days: number) {
    setSnoozeOpen(false);
    if (onSnooze) onSnooze(prospectId, days);
    else setLocalSnooze(snoozeUntilDay(days));
    setAnnouncement(`Held until ${formatDay(snoozeUntilDay(days))}.`);
  }

  function releaseSnooze() {
    setSnoozeOpen(false);
    if (onClearSnooze) onClearSnooze(prospectId);
    else setLocalSnooze(null);
    setAnnouncement("Hold released. Back in the working set.");
  }

  /**
   * WHAT THE PRIMARY BUTTON DOES, BY WHAT THE SELECTOR SAYS TO DO.
   *
   * The label and the reasoning are the selector's; only the destination
   * is decided here, and every destination is a surface this app already
   * has. A button that says "Go and see them" and opens a compose window
   * would be a lie in the loudest place on the screen.
   */
  function runNextAction() {
    switch (record!.nextAction.kind) {
      case "visit":
        navigate("/field");
        return;
      case "diary":
        setSnoozeOpen(true);
        return;
      case "convert":
        if (record!.status === "booked") {
          navigate("/book/week");
          return;
        }
        setCompose("reserve-party");
        return;
      case "chase":
        setCompose(record!.openOffers.length > 0 ? "featured-promo" : "outreach");
        return;
      default:
        setCompose("outreach");
    }
  }

  return (
    <>
      {/* The scrim carries no controls and no meaning, so assistive
          technology is not told about it. It also covers whatever the
          record was opened from, including a map popup, which is why
          nothing underneath can take a press while this is open. */}
      <div className={styles.scrim} onClick={requestClose} aria-hidden="true" />

      <div
        className={[styles.sheet, compose !== null || quoteOver ? styles.behind : ""]
          .filter(Boolean)
          .join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-heading"
        ref={dialogRef}
        data-record-modal={p.id}
      >
        {/* -----------------------------------------------------------
            HEAD. Name, what kind of organisation, where, and the page
            the row was read off.
            ----------------------------------------------------------- */}
        <header className={styles.head}>
          <div className={styles.headTop}>
            <ProspectPlate name={p.name} lane={p.lane} size="lg" />
            <div className={styles.headText}>
              <h2
                className={styles.name}
                id="record-heading"
                tabIndex={-1}
                ref={headingRef}
              >
                {p.name}
              </h2>
              <div className={styles.headChips}>
                <TokenChip token={orgType} size="sm" />
                <LaneChip lane={p.lane} size="sm" />
                <span className={styles.headBuyer}>
                  {LANE_META[p.lane].doorNoun}, {p.decisionMakerTitle.toLowerCase()}
                </span>
              </div>
            </div>
            <button
              type="button"
              className={styles.close}
              onClick={requestClose}
              aria-label="Close this record"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>

          <ul className={styles.headFacts}>
            <li>
              <span className={styles.factLabel}>Address</span>
              {p.address}
              <ProvenanceBadge provenance={p.provenance.address ?? "public"} compact />
            </li>
            <li>
              <span className={styles.factLabel}>Phone</span>
              {p.phone ? (
                <a className="num" href={`tel:${p.phone.replace(/[^0-9+]/g, "")}`}>
                  {p.phone}
                </a>
              ) : (
                <span className={styles.absent}>None published</span>
              )}
            </li>
            <li>
              {/* The clock every figure below is measured from. It sits
                  with the sources rather than under the buttons because
                  it is a fact about the numbers, not an action. */}
              <span className={styles.factLabel}>Read as of</span>
              <span className="num">{formatDay(RECORD_AS_OF)}</span>
            </li>
            <li>
              <span className={styles.factLabel}>Read off</span>
              {sourceUrl ? (
                <a href={sourceUrl} target="_blank" rel="noreferrer noopener">
                  {hostOf(sourceUrl)}
                  <span className={styles.sourcePath}>
                    {sourceUrl.replace(/^https?:\/\/[^/]+/, "") || "/"}
                  </span>
                </a>
              ) : (
                <span className={styles.absent}>{p.addressSource}</span>
              )}
            </li>
          </ul>
        </header>

        <div className={styles.body}>
          {/* ---------------------------------------------------------
              THE SIX. Every one of them a fact that changes what the
              rep does next, and every one read straight off the record.
              --------------------------------------------------------- */}
          <ul className={styles.highlights} aria-label="Highlights">
            <Highlight
              id="status"
              label="Status"
              value={record.status}
              token={PITCH_STATUS[record.status]}
              note={`${record.touches} ${record.touches === 1 ? "touch" : "touches"} this period`}
            />
            <Highlight
              id="intent"
              label="Intent to commit"
              value={record.intent.level}
              token={intent}
              note={`Signal score ${record.intent.score}`}
              extraData={{ "data-score": String(record.intent.score) }}
            />
            <Highlight
              id="quiet"
              label="Quiet for"
              value={String(record.daysSinceActivity ?? "")}
              glyph={record.staleness.stale ? "▲" : "◷"}
              tone={record.staleness.stale ? "var(--risk)" : "var(--text-0)"}
              headline={
                record.daysSinceActivity === null
                  ? "Never touched"
                  : dayWord(record.daysSinceActivity)
              }
              note={
                record.staleness.threshold === null
                  ? "No threshold at this status"
                  : record.staleness.stale
                    ? `Past the ${record.staleness.threshold} day threshold by ${dayWord(record.staleness.overdueBy)}`
                    : `Inside the ${record.staleness.threshold} day threshold`
              }
              extraData={{ "data-stale": String(record.staleness.stale) }}
            />
            <Highlight
              id="offers"
              label="Offers open"
              value={String(record.openOffers.length)}
              glyph={record.openOffers.length > 0 ? "◑" : "○"}
              tone={record.openOffers.length > 0 ? "var(--info)" : "var(--neutral)"}
              headline={`${record.openOffers.length} open`}
              note={`${record.offers.length} extended in total`}
              extraData={{ "data-total": String(record.offers.length) }}
            />
            <Highlight
              id="requests"
              label="Their enquiries"
              value={String(record.requests.length)}
              glyph={record.requests.length > 0 ? "◆" : "◇"}
              tone={record.requests.length > 0 ? "var(--ok)" : "var(--neutral)"}
              headline={`${record.requests.length} inbound`}
              note={record.awaitingReply ? "Waiting on an answer" : "Nothing waiting"}
            />
            <Highlight
              id="signed"
              label="Signed"
              value={String(record.bookLines.length)}
              glyph={record.bookLines.length > 0 ? "◼" : "◻"}
              tone={record.bookLines.length > 0 ? "var(--ledger-revenue)" : "var(--neutral)"}
              headline={
                record.bookLines.length === 0
                  ? "Nothing signed"
                  : `${record.bookLines.length} in the book`
              }
              note={
                record.bookLines.length === 0
                  ? "No line in the book"
                  : `${record.bookLines.reduce((n, l) => n + l.guests, 0)} guests contracted`
              }
            />
          </ul>

          {/* ---------------------------------------------------------
              LAST CONVERSATION. The first thing he asked for, and the
              first thing the eye lands on after the name.
              --------------------------------------------------------- */}
          <section className={styles.section} aria-labelledby="rec-last">
            <h3 className={styles.sectionTitle} id="rec-last">
              Last conversation
            </h3>

            {last === undefined ? (
              <p className={styles.emptyBlock} data-record-empty="conversation">
                <span aria-hidden="true" className={styles.emptyGlyph}>◻</span>
                Nothing said either way. {record.nextAction.why}
              </p>
            ) : (
              <>
                <Quote
                  role={last.counterpartyRole}
                  direction={last.direction}
                  channel={last.channel}
                  at={last.at}
                  days={lastDays}
                  subject={last.subject}
                  body={last.body}
                  summarised={last.summarised}
                  effect={last.effect.note}
                  requeue={last.effect.requeue}
                  open={quoteOpen}
                  onToggle={() => setQuoteOpen((v) => !v)}
                  provenance={last.provenance}
                />
                {theirLast ? (
                  <p className={styles.theirLast}>
                    <span className={styles.factLabel}>Last from them</span>
                    <span className={styles.theirLastWhen}>
                      {formatDay(theirLast.at)}
                      {record.daysSinceInbound !== null
                        ? `, ${dayWord(record.daysSinceInbound)} ago`
                        : ""}
                    </span>
                    <span className={styles.theirLastBody}>{theirLast.body}</span>
                  </p>
                ) : null}
              </>
            )}
          </section>

          {/* ---------------------------------------------------------
              INTENT, INTERROGABLE. The level, then the evidence it was
              read off, exactly as the desk shows its score breakdown.
              --------------------------------------------------------- */}
          <section className={styles.section} aria-labelledby="rec-intent">
            <h3 className={styles.sectionTitle} id="rec-intent">
              Intent to commit
            </h3>

            <div className={styles.intentHead}>
              <TokenChip token={intent} />
              <p className={styles.intentHeadline}>{record.intent.headline}</p>
              <p className={styles.intentScore}>
                <span className={styles.factLabel}>Signal score</span>
                <span className="num">{record.intent.score}</span>
              </p>
            </div>

            {record.intent.evidence.length === 0 ? (
              <p className={styles.emptyBlock}>
                <span aria-hidden="true" className={styles.emptyGlyph}>◻</span>
                No signal recorded. Nothing has been said that points at a
                commitment.
              </p>
            ) : (
              <ul className={styles.evidence}>
                {record.intent.evidence.map((e, i) => (
                  <li key={`${e.signal}-${e.messageId ?? i}`} className={styles.evidenceRow}>
                    <span
                      className={styles.evidenceLabel}
                      style={{
                        ["--tone" as string]:
                          e.weight >= 0 ? "var(--ok)" : "var(--risk)",
                      }}
                    >
                      <span aria-hidden="true">{e.weight >= 0 ? "▲" : "▼"}</span>
                      {e.label}
                    </span>
                    <span className={`${styles.evidenceWeight} num`}>
                      {e.weight >= 0 ? `+${e.weight}` : e.weight}
                    </span>
                    <span className={`${styles.evidenceWhen} num`}>
                      {formatDay(e.at)}
                    </span>
                    <span className={styles.evidenceQuote}>{e.quote}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ---------------------------------------------------------
              OFFERS EXTENDED. What was put on the table, to which role,
              when, whether it still stands, and what it costs the venue.
              --------------------------------------------------------- */}
          <section className={styles.section} aria-labelledby="rec-offers">
            <h3 className={styles.sectionTitle} id="rec-offers">
              Offers extended
            </h3>
            <p className={styles.sectionNote}>
              Certainty, never money off a published price. DIME publishes
              no group price to discount.
            </p>

            {record.offers.length === 0 ? (
              <p className={styles.emptyBlock} data-record-empty="offers">
                <span aria-hidden="true" className={styles.emptyGlyph}>◻</span>
                No offer extended.
              </p>
            ) : (
              <ul className={styles.offers}>
                {record.offers.map(({ extension, offer }) => {
                  const state = OFFER_STATE_META[extension.state];
                  return (
                    <li key={extension.id} className={styles.offer} data-offer={extension.id}>
                      <div className={styles.offerHead}>
                        <strong className={styles.offerName}>{offer.name}</strong>
                        <TokenChip token={state} size="sm" />
                      </div>
                      <p className={styles.offerMeta}>
                        <span className={styles.factLabel}>To</span>
                        {extension.toRole}
                        <span className={styles.factLabel}>Extended</span>
                        <span className="num">{formatDay(extension.extendedAt)}</span>
                        {extension.expiresAt ? (
                          <>
                            <span className={styles.factLabel}>Expires</span>
                            <span className="num">{formatDay(extension.expiresAt)}</span>
                          </>
                        ) : null}
                      </p>
                      <p className={styles.offerWhat}>{offer.what}</p>
                      <p className={styles.offerState}>{extension.stateNote}</p>
                      <p className={styles.offerCost}>
                        <span className={styles.factLabel}>Cost to the venue</span>
                        {offer.costToVenue === 0 ? (
                          <span className={styles.offerFree}>
                            <span aria-hidden="true">○</span> No cash cost
                          </span>
                        ) : null}
                        {offer.costNote}
                        <ProvenanceBadge provenance={offer.provenance} compact />
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* ---------------------------------------------------------
              WHAT THEY ASKED FOR, where they wrote in themselves, and
              what is signed. Both are short blocks that only appear
              when there is something in them.
              --------------------------------------------------------- */}
          {record.requests.length > 0 ? (
            <section className={styles.section} aria-labelledby="rec-requests">
              <h3 className={styles.sectionTitle} id="rec-requests">
                Their enquiries
              </h3>
              <ul className={styles.requests}>
                {record.requests.map((r) => (
                  <li key={r.id} className={styles.request}>
                    <span className={`${styles.requestWhen} num`}>
                      {formatDay(r.receivedAt)}
                    </span>
                    <span className={styles.requestAsk}>{r.askSummary}</span>
                    <span className={styles.requestFields}>
                      {r.headcount === null ? (
                        <span className={styles.absent}>No headcount given</span>
                      ) : (
                        <>
                          <span className="num">{r.headcount}</span> guests
                        </>
                      )}
                      {r.desiredDate === null ? (
                        <span className={styles.absent}>No date given</span>
                      ) : (
                        <span className="num">{formatDay(r.desiredDate)}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {record.bookLines.length > 0 ? (
            <section className={styles.section} aria-labelledby="rec-signed">
              <h3 className={styles.sectionTitle} id="rec-signed">
                Signed
              </h3>
              <ul className={styles.requests}>
                {record.bookLines.map((l) => (
                  <li key={l.id} className={styles.request}>
                    <span className={`${styles.requestWhen} num`}>
                      {formatDay(l.eventDate)}
                    </span>
                    <span className={styles.requestAsk}>
                      <span className="num">{l.guests}</span> guests,{" "}
                      <span className="num">{l.lanesHeld}</span>{" "}
                      {l.lanesHeld === 1 ? "lane" : "lanes"}
                    </span>
                    <span className={styles.requestFields}>
                      <Figure
                        value={`$${(l.guests * l.pricePerGuest).toLocaleString("en-US")}`}
                        provenance={l.pricePerGuestProvenance}
                        compact
                      />
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* ---------------------------------------------------------
              THE THREAD.
              --------------------------------------------------------- */}
          <section className={styles.section} aria-labelledby="rec-thread">
            <h3 className={styles.sectionTitle} id="rec-thread">
              The thread
            </h3>
            <Timeline messages={record.thread} labelledBy="rec-thread" />
          </section>
        </div>

        {/* -----------------------------------------------------------
            THE ACTION BAR. Pinned, so the thing to do next is on screen
            whether the reader is at the quote or at the bottom of a two
            year thread.
            ----------------------------------------------------------- */}
        <footer className={styles.foot}>
          <div className={styles.footPrimary}>
            <Button variant="primary" onClick={runNextAction}>
              {record.nextAction.label}
            </Button>
            <p className={styles.why}>{record.nextAction.why}</p>
          </div>

          <div className={styles.footActions}>
            <Button onClick={() => setCompose("outreach")}>Write to them</Button>

            <label className={styles.advance}>
              <span className={styles.factLabel}>Status</span>
              <select value={record.status} onChange={advance} aria-label="Advance the status">
                {PITCH_STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {PITCH_STATUS[s].glyph} {PITCH_STATUS[s].label}
                  </option>
                ))}
              </select>
            </label>

            <Button
              onClick={() => setSnoozeOpen((v) => !v)}
              aria-expanded={snoozeOpen}
            >
              {held ? "Held" : "Snooze"}
            </Button>

            <Button
              onClick={() =>
                quotePreview.openQuotePreview(p.id, {
                  packageId: p.leadPackageId,
                })
              }
            >
              Their group quote
            </Button>
          </div>

          {snoozeOpen ? (
            <div className={styles.snooze} role="group" aria-label="Hold this record">
              {snoozeOptions.map((d) => (
                <Button key={d} size="sm" onClick={() => snoozeFor(d)}>
                  {dayWord(d)}
                </Button>
              ))}
              {held ? (
                <Button size="sm" variant="ghost" onClick={releaseSnooze}>
                  Release
                </Button>
              ) : null}
            </div>
          ) : null}

          {/* Everything that changes in place says so out loud: the
              status select, the hold, and nothing else. */}
          <p className={styles.announce} role="status" data-record-announce>
            {held && !announcement ? `Held until ${formatDay(held)}.` : announcement}
          </p>

        </footer>
      </div>

      {/* Rendered after the sheet so it paints above it, and the sheet
          drops behind the compose scrim while it is open. Closing it
          returns focus to the button in here that opened it. */}
      {compose !== null ? (
        <EmailComposeModal
          prospect={p}
          intent={compose}
          onClose={() => setCompose(null)}
        />
      ) : null}
    </>
  );
}

/* ---------------------------------------------------------------
   The highlight chip
   --------------------------------------------------------------- */

function Highlight({
  id,
  label,
  value,
  token,
  glyph,
  tone,
  headline,
  note,
  extraData,
}: {
  id: string;
  label: string;
  /** The raw selector value, carried so a test can compare it exactly. */
  value: string;
  token?: StatusToken;
  glyph?: string;
  tone?: string;
  headline?: string;
  note: ReactNode;
  extraData?: Record<string, string>;
}) {
  return (
    <li
      className={styles.highlight}
      data-highlight={id}
      data-value={value}
      {...extraData}
    >
      <span className={styles.highlightLabel}>{label}</span>
      <span
        className={styles.highlightValue}
        style={{ ["--tone" as string]: token?.cssVar ?? tone ?? "var(--text-0)" }}
      >
        <span className={styles.highlightGlyph} aria-hidden="true">
          {token?.glyph ?? glyph}
        </span>
        {token?.label ?? headline}
      </span>
      <span className={styles.highlightNote}>{note}</span>
    </li>
  );
}

/* ---------------------------------------------------------------
   The quoted message
   --------------------------------------------------------------- */

function Quote({
  role,
  direction,
  channel,
  at,
  days,
  subject,
  body,
  summarised,
  effect,
  requeue,
  open,
  onToggle,
  provenance,
}: {
  role: string;
  direction: keyof typeof DIRECTION_META;
  channel: keyof typeof CHANNEL_META;
  at: string;
  days: number | null;
  subject?: string;
  body: string;
  summarised: boolean;
  effect: string;
  requeue?: keyof typeof REQUEUE_META;
  open: boolean;
  onToggle: () => void;
  provenance: Provenance;
}) {
  const dir = DIRECTION_META[direction];
  const chan = CHANNEL_META[channel];
  const long = body.length > 260;

  return (
    <figure className={styles.quote} data-record-quote>
      <figcaption className={styles.quoteHead}>
        <span
          className={styles.quoteDir}
          style={{ ["--tone" as string]: dir.cssVar }}
        >
          <span aria-hidden="true">{dir.glyph}</span> {dir.label}
        </span>
        <span className={styles.quoteChan} title={chan.note}>
          <span aria-hidden="true">{chan.glyph}</span> {chan.label}
        </span>
        <span className={styles.quoteRole}>{role}</span>
        <span className={`${styles.quoteWhen} num`}>
          {formatDay(at)}
          {days !== null ? `, ${dayWord(days)} ago` : ""}
        </span>
      </figcaption>

      {subject ? <p className={styles.quoteSubject}>{subject}</p> : null}

      <blockquote
        className={[styles.quoteBody, open || !long ? "" : styles.quoteClamped]
          .filter(Boolean)
          .join(" ")}
      >
        {summarised ? (
          <span className={styles.quoteSummarised}>
            A call written up afterwards, not their words verbatim.
          </span>
        ) : null}
        {body}
      </blockquote>

      {long ? (
        <button type="button" className={styles.quoteMore} onClick={onToggle} aria-expanded={open}>
          {open ? "Collapse" : "Read the whole message"}
        </button>
      ) : null}

      <p className={styles.quoteEffect}>
        <span className={styles.factLabel}>Changed</span>
        {effect}
        {requeue ? (
          <span
            className={styles.quoteRequeue}
            style={{ ["--tone" as string]: REQUEUE_META[requeue].cssVar }}
            title={REQUEUE_META[requeue].note}
          >
            <span aria-hidden="true">{REQUEUE_META[requeue].glyph}</span>
            {REQUEUE_META[requeue].label}
          </span>
        ) : null}
        <ProvenanceBadge provenance={provenance} compact />
      </p>
    </figure>
  );
}
