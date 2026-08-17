import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import type { GroupRequest, LeagueInterest, DerivedTask } from "@/domain/requests";
import {
  MISSING_REASON_LABEL,
  NOTE_CHARACTER_LIMIT,
  QUALIFYING_FIELD_LABEL,
  QUALIFYING_FIELD_ORDER,
  REQUEST_CHANNEL_META,
  REQUEST_STATUS_META,
  RESPONSE_COMMITMENT,
  missingQualifiers,
  unaskedQualifiers,
  venueDate,
} from "@/domain/requests";
import { GUESTS_PER_BOWLING_LANE, LANE_META, lanesForGuests } from "@/domain/lanes";
import { PACKAGES, PACKAGE_BY_ID, STANDARD_TERMS } from "@/data/packages";
import { OPEN_LANE_SOCIALS } from "@/data/requests";
import { PROSPECT_BY_ID } from "@/data/prospects";
import { useOpenQuotePreview } from "@/state/QuotePreviewProvider";
import { TASK_KIND_META } from "@/domain/requests";
import type { ComposeIntent } from "@/components/email/EmailComposeModal";
import { ProspectPlate } from "@/components/primitives/Wordmark";
import { LaneChip, OccasionClassChip } from "@/components/primitives/LaneChip";
import { EmailConfidenceChip, TokenChip } from "@/components/primitives/StatusChip";
import { FamilyChip } from "@/components/primitives/FamilyChip";
import { PackageGlyph } from "@/components/primitives/PackageGlyph";
import {
  Figure,
  ProvenanceBadge,
  WithheldFigure,
} from "@/components/primitives/ProvenanceBadge";
import { Button } from "@/components/primitives/Button";
import { RecordName } from "@/components/record/RecordName";
import styles from "./RequestDrawer.module.css";

/**
 * ONE INBOUND ENQUIRY, AND EVERYTHING IT IS SHORT OF.
 *
 * The queue behind this panel answers "what has to be answered first".
 * This answers the question a person asks about four seconds later,
 * standing with a phone in their hand: what did they actually say, what
 * do I still not know, what can I honestly quote them, and what is the
 * one thing I should do about it now.
 *
 * ── THE MISSING FIELDS ARE THE POINT OF THE PANEL ──────────────────
 * Every request carries three qualifying fields and a reason for each,
 * and this drawer renders the reason as loudly as the value. A blank
 * headcount that a person skipped and a blank headcount that the
 * enquiry route never asked for look identical in every CRM ever built,
 * and they are two completely different problems. The first is
 * recovered with a phone call. The second is recovered by changing a
 * form, and until somebody does, every single enquiry through that route
 * arrives in exactly the same condition. Saying which is which on the
 * one surface where a person is about to pick up the phone is the whole
 * argument for this screen.
 *
 * ── WHY THE REPLY IS NOT WRITTEN HERE ──────────────────────────────
 * There is one compose window in this application and this panel does
 * not build a second one. A drawer with its own little message box would
 * be a second place where a draft can be typed, a second set of rules
 * about what may be named, and a second thing to keep in step with the
 * outbox. The primary action raises an intent and the page owns the one
 * modal, exactly as the map board does.
 *
 * ── A REQUEST WITH NO PROSPECT IS NOT AN ERROR ─────────────────────
 * Seven of the seeded enquiries map to a row in prospects.ts and inherit
 * a hundred sourced facts. The rest are walk-ins, recorded as
 * descriptors rather than as invented businesses, and this panel says so
 * plainly and then offers what it can: the packages that fit the lane,
 * the lane arithmetic on their own stated headcount, and a call list
 * line to copy. An interface that renders a blank panel, or worse
 * crashes, for the honest half of its own data has decided that only the
 * tidy rows count.
 */

// ---------------------------------------------------------------
// Dates
// ---------------------------------------------------------------

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * The venue-local day, formatted.
 *
 * `venueDate` is used rather than the browser's own parse for the reason
 * it exists: Date.parse reads a bare "2026-12-11" as UTC midnight, and a
 * held date rendered one day early on the screen somebody is working
 * from is not a rounding error, it is a wrong answer.
 */
export function formatDay(iso: string): string {
  const [y, m, d] = venueDate(iso).split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/**
 * The wall clock reading off a stamped instant, or null for a bare date.
 *
 * Every timestamp in this data set is written in the venue's own offset
 * and every derived one is formatted back into it, so the characters
 * after the T are already venue-local and are read rather than
 * recomputed. A second timezone conversion here would be a chance to
 * disagree with the queue's arithmetic for no gain.
 */
export function wallTime(iso: string): string | null {
  if (!/T\d{2}:\d{2}/.test(iso)) return null;
  return iso.slice(11, 16);
}

export function formatWhen(iso: string): string {
  const time = wallTime(iso);
  return time ? `${formatDay(iso)} at ${time}` : formatDay(iso);
}

// ---------------------------------------------------------------
// The subject
// ---------------------------------------------------------------

/**
 * What the drawer is looking at.
 *
 * A union rather than one optional-heavy object, because a league ask is
 * genuinely not a request: it has no channel, no pipeline status and
 * nothing to quote, and giving it those fields as nulls would invite
 * every branch below to forget which one it is holding.
 */
export type RequestSubject =
  | { kind: "request"; request: GroupRequest; task: DerivedTask | null }
  | { kind: "league"; interest: LeagueInterest; task: DerivedTask | null };

export interface ComposePlan {
  prospectId: string;
  intent: ComposeIntent;
  packageId?: string;
}

/**
 * The one obvious thing to do, decided from the state rather than from a
 * dropdown.
 *
 * Two of the nine statuses do not produce a message at all, and the
 * drawer says so rather than offering a compose button that would write
 * to somebody who has already said no. A tool that offers the same
 * primary action on every row has not read the row.
 */
interface PrimaryAction {
  label: string;
  why: string;
  compose?: ComposePlan;
  to?: string;
}

function primaryFor(r: GroupRequest): PrimaryAction {
  const prospectId = r.prospectId;
  const missing = missingQualifiers(r).length;

  if (r.status === "won") {
    return {
      label: "Open the book and write the line",
      why: "Marked won. The reply is not the work here; the missing line in the revenue ledger is.",
      to: "/book",
    };
  }
  if (r.status === "lost") {
    return {
      label: "Read the answer to what they raised",
      why: "They said no and said why. There is no message to send today; there is a reason worth keeping, and the register is where it earns its living.",
      to: "/objections",
    };
  }
  if (!prospectId) {
    return {
      label: "No prospect record to write from",
      why: "This enquiry is a walk-in rather than a row in the trade area file, so there is no published email, no decision maker title and no lane research behind it. Copy the call list line and phone them.",
    };
  }
  if (r.status === "held") {
    return {
      label: "Confirm the hold in writing",
      why: "A date held against no deposit is a date nobody else can be offered. The reserve draft names the date, the lanes and the published terms in one message.",
      compose: {
        prospectId,
        intent: "reserve-party",
        packageId: r.suggestedPackageId ?? undefined,
      },
    };
  }
  return {
    label:
      missing > 0
        ? `Reply, and ask for the ${missing === 1 ? "missing field" : `${missing} missing fields`}`
        : "Reply to them",
    why:
      missing > 0
        ? "The compose window opens on the blank draft on purpose. Every written template in this application is an outbound opening, and an answer to somebody who has already written to you starts from their own words rather than from a pitch."
        : "Everything a quote needs is on the record, so this reply can carry the answer rather than a question.",
    compose: { prospectId, intent: "free" },
  };
}

// ---------------------------------------------------------------
// The panel
// ---------------------------------------------------------------

export function RequestDrawer({
  subject,
  onClose,
  onCompose,
  onCopy,
}: {
  subject: RequestSubject;
  onClose: () => void;
  onCompose: (plan: ComposePlan) => void;
  /** The page owns the clipboard and the one live region that reports it. */
  onCopy: (text: string, what: string) => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  /**
   * Focus enters the panel, Escape leaves it, and the control that
   * opened it gets focus back.
   *
   * The listener is bound in the bubble phase deliberately. The compose
   * modal binds its own in the capture phase and stops the event dead,
   * so an Escape pressed with the modal open closes the modal and leaves
   * this panel exactly where it was, which is the place the reader asked
   * to be.
   */
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    headingRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [onClose]);

  const lane = subject.kind === "request" ? subject.request.lane : subject.interest.lane;
  const prospectId =
    subject.kind === "request" ? subject.request.prospectId : subject.interest.prospectId;
  const prospect = prospectId ? PROSPECT_BY_ID[prospectId] : undefined;
  const organisation =
    prospect?.name ??
    (subject.kind === "request"
      ? subject.request.organisationName
      : subject.interest.organisationName) ??
    "Organisation not recorded";

  /** Packages whose own published pages name this lane, in family order. */
  const fitted = useMemo(
    () => PACKAGES.filter((p) => p.laneFit.includes(lane)),
    [lane],
  );

  const task = subject.task;

  return (
    <>
      {/* The scrim carries no controls and no meaning, so assistive
          technology is not told about it. Escape and the close button are
          the two routes out a keyboard reader is offered. */}
      <div className={styles.scrim} onClick={onClose} aria-hidden="true" />

      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-drawer-heading"
      >
        <header className={styles.head}>
          <div className={styles.headTop}>
            <ProspectPlate name={organisation} lane={lane} size="lg" />
            <div className={styles.headText}>
              {/*
                A request can arrive from a walk-in with no row in the
                trade area file, and there is no record to open for one.
                So the name is a control only when there is something
                behind it, and plain words when there is not, rather than
                a button that would apologise after the press.
              */}
              <h2
                className={styles.name}
                id="request-drawer-heading"
                tabIndex={-1}
                ref={headingRef}
              >
                {prospect ? (
                  <RecordName prospectId={prospect.id} name={organisation} />
                ) : (
                  organisation
                )}
              </h2>
              <div className={styles.headChips}>
                <LaneChip lane={lane} size="sm" />
                <OccasionClassChip lane={lane} />
                {subject.kind === "request" ? (
                  <TokenChip
                    token={REQUEST_STATUS_META[subject.request.status]}
                    size="sm"
                  />
                ) : (
                  <TokenChip
                    token={{
                      glyph: subject.interest.answeredAt ? "●" : "○",
                      label: subject.interest.answeredAt
                        ? "Answered"
                        : "Awaiting an answer",
                      cssVar: subject.interest.answeredAt
                        ? "var(--ok)"
                        : "var(--info)",
                      note: "A league ask is not a pipeline row. It is a question with an honest answer owed inside the same commitment as any other enquiry.",
                    }}
                    size="sm"
                  />
                )}
              </div>
            </div>
            <button
              type="button"
              className={styles.close}
              onClick={onClose}
              aria-label="Close this request"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>

          <p className={styles.headLine}>
            {subject.kind === "request" ? (
              <>
                {REQUEST_CHANNEL_META[subject.request.channel].label}, from a{" "}
                {subject.request.contactRole.toLowerCase()}. Received{" "}
                <span className="num">
                  {formatWhen(subject.request.receivedAt)}
                </span>
                .
              </>
            ) : (
              <>
                A league ask from a {subject.interest.contactRole.toLowerCase()}.
                Received{" "}
                <span className="num">
                  {formatWhen(subject.interest.receivedAt)}
                </span>
                .
              </>
            )}
          </p>
        </header>

        <div className={styles.body}>
          {subject.kind === "request" ? (
            <RequestBody
              request={subject.request}
              task={task}
              fitted={fitted}
              onCopy={onCopy}
            />
          ) : (
            <LeagueBody interest={subject.interest} task={task} onCopy={onCopy} />
          )}
        </div>

        {/* ---------------------------------------------------------
            ONE PRIMARY ACTION, PINNED, AND THE SENTENCE THAT EARNED IT.
            --------------------------------------------------------- */}
        <footer className={styles.foot}>
          {subject.kind === "request" ? (
            <RequestFoot
              request={subject.request}
              onCompose={onCompose}
              onCopy={onCopy}
            />
          ) : (
            <LeagueFoot
              interest={subject.interest}
              onCompose={onCompose}
              onCopy={onCopy}
            />
          )}
        </footer>
      </aside>
    </>
  );
}

// ---------------------------------------------------------------
// A request
// ---------------------------------------------------------------

function RequestBody({
  request: r,
  task,
  fitted,
  onCopy,
}: {
  request: GroupRequest;
  task: DerivedTask | null;
  fitted: typeof PACKAGES;
  onCopy: (text: string, what: string) => void;
}) {
  const prospect = r.prospectId ? PROSPECT_BY_ID[r.prospectId] : undefined;
  const openQuotePreview = useOpenQuotePreview();
  const missing = missingQualifiers(r);
  const unasked = unaskedQualifiers(r);
  const channel = REQUEST_CHANNEL_META[r.channel];
  const status = REQUEST_STATUS_META[r.status];
  const pack = r.suggestedPackageId
    ? PACKAGE_BY_ID[r.suggestedPackageId]
    : undefined;

  return (
    <>
      {/* --- WHAT THEY SENT ---------------------------------------- */}
      <section className={styles.section} aria-labelledby="rd-sent">
        <h3 className={styles.sectionTitle} id="rd-sent">
          What they sent
        </h3>

        <blockquote className={styles.said}>
          <p className={styles.saidText}>{r.note}</p>
          <footer className={styles.saidFoot}>
            <span>
              <span className="num">{r.note.length}</span> of{" "}
              <span className="num">{NOTE_CHARACTER_LIMIT}</span> characters,
              which is the limit both published forms put on this field
            </span>
            <ProvenanceBadge provenance="public" compact />
          </footer>
        </blockquote>

        <p className={styles.ask}>
          <span className={styles.askLabel}>What they are asking for</span>
          <span className={styles.askText}>{r.askSummary}</span>
        </p>

        <dl className={styles.facts}>
          <div className={styles.fact}>
            <dt>Route</dt>
            <dd>
              {channel.label}
              <ProvenanceBadge provenance={channel.provenance} compact />
            </dd>
          </div>
          <div className={styles.fact}>
            <dt>Their role</dt>
            <dd>{r.contactRole}</dd>
          </div>
          <div className={styles.fact}>
            <dt>Written door</dt>
            <dd>
              {r.email ? (
                <>
                  <span className={styles.mono}>{r.email}</span>
                  <span
                    className={styles.hint}
                    title="Printed rather than linked, so nothing in this work sample opens a compose window addressed to a real person."
                  >
                    Reserved unroutable address, per RFC 2606.
                  </span>
                </>
              ) : (
                "No address on the enquiry. Phone or a go-see is the route."
              )}
            </dd>
          </div>
          {r.phone ? (
            <div className={styles.fact}>
              <dt>Phone</dt>
              <dd>{r.phone}</dd>
            </div>
          ) : null}
          {r.freeTourRequested !== null ? (
            <div className={styles.fact}>
              <dt>Free tour</dt>
              <dd>
                {r.freeTourRequested
                  ? "Ticked. Offered by the brand-wide form rather than by a form belonging to one store."
                  : "Not ticked, on a form that offered it."}
                <ProvenanceBadge provenance="public" compact />
              </dd>
            </div>
          ) : null}
          {r.closeReason ? (
            <div className={styles.fact}>
              <dt>How it closed</dt>
              <dd>{r.closeReason}</dd>
            </div>
          ) : null}
        </dl>

        <p className={styles.statusNote}>
          <span
            className={styles.toneGlyph}
            aria-hidden="true"
            style={{ ["--tone" as string]: status.cssVar }}
          >
            {status.glyph}
          </span>
          <span>
            <strong>{status.label}.</strong> {status.note}
          </span>
        </p>
      </section>

      {/* --- THE CLOCK --------------------------------------------- */}
      <section className={styles.section} aria-labelledby="rd-clock">
        <h3 className={styles.sectionTitle} id="rd-clock">
          The clock on it
        </h3>

        <dl className={styles.facts}>
          <div className={styles.fact}>
            <dt>Arrived</dt>
            <dd className="num">{formatWhen(r.receivedAt)}</dd>
          </div>
          <div className={styles.fact}>
            <dt>Reply was due</dt>
            <dd>
              <span className="num">{formatWhen(r.responseDueAt)}</span>
              <ProvenanceBadge provenance="illustrative" compact />
            </dd>
          </div>
          <div className={styles.fact}>
            <dt>First reply</dt>
            <dd className="num">
              {r.firstRespondedAt
                ? formatWhen(r.firstRespondedAt)
                : "None sent"}
            </dd>
          </div>
          {r.lastContactAt ? (
            <div className={styles.fact}>
              <dt>Last contact</dt>
              <dd className="num">{formatWhen(r.lastContactAt)}</dd>
            </div>
          ) : null}
          {r.agreedNextStepAt ? (
            <div className={styles.fact}>
              <dt>They asked for</dt>
              <dd>
                <span className="num">{formatDay(r.agreedNextStepAt)}</span>
                <span className={styles.hint}>
                  Pushes the follow-up out, never pulls one in.
                </span>
              </dd>
            </div>
          ) : null}
        </dl>

        <p className={styles.disclosure}>
          <ProvenanceBadge provenance={RESPONSE_COMMITMENT.provenance} />
          <span>{RESPONSE_COMMITMENT.disclosure}</span>
        </p>
      </section>

      {/* --- WHAT IS MISSING AND WHY ------------------------------- */}
      <section className={styles.section} aria-labelledby="rd-missing">
        <h3 className={styles.sectionTitle} id="rd-missing">
          What is missing
        </h3>

        <ul className={styles.qualifiers}>
          {QUALIFYING_FIELD_ORDER.map((field) => {
            const reason = r.fieldReasons[field];
            const value =
              field === "desiredDate"
                ? r.desiredDate
                  ? formatDay(r.desiredDate)
                  : null
                : field === "headcount"
                  ? r.headcount !== null
                    ? `${r.headcount} guests`
                    : null
                  : r.eventType;
            const held = value !== null && value !== undefined;
            return (
              <li key={field} className={styles.qualifier} data-held={held}>
                <span
                  className={styles.qualifierGlyph}
                  aria-hidden="true"
                  style={{
                    ["--tone" as string]: held
                      ? "var(--ok)"
                      : reason === "not-asked-by-route"
                        ? "var(--risk)"
                        : "var(--warn)",
                  }}
                >
                  {held ? "●" : reason === "not-asked-by-route" ? "⊘" : "○"}
                </span>
                <span className={styles.qualifierBody}>
                  <span className={styles.qualifierHead}>
                    <span className={styles.qualifierLabel}>
                      {QUALIFYING_FIELD_LABEL[field]}
                    </span>
                    <span className={styles.qualifierValue}>
                      {held ? value : MISSING_REASON_LABEL[reason]}
                    </span>
                  </span>
                  <span className={styles.qualifierWhy}>
                    {held
                      ? "On the record, in their own words."
                      : reason === "not-asked-by-route"
                        ? `The ${channel.label.toLowerCase()} does not ask for this.`
                        : reason === "asked-and-left-blank"
                          ? "Asked for, left empty. One call recovers it."
                          : "Answered: they do not know yet."}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>

        <p className={styles.gapLine} aria-live="polite">
          {missing.length === 0 ? (
            <>
              <span aria-hidden="true">●</span> All three qualifying fields on
              the record.
            </>
          ) : (
            <>
              <span aria-hidden="true">◑</span>{" "}
              <span className="num">{missing.length}</span> of{" "}
              <span className="num">3</span> qualifying fields are missing, and{" "}
              <span className="num">{unasked.length}</span> of those the route
              never asked for.
            </>
          )}
        </p>
      </section>

      {/* --- THE ORGANISATION -------------------------------------- */}
      <section className={styles.section} aria-labelledby="rd-org">
        <h3 className={styles.sectionTitle} id="rd-org">
          The organisation behind it
        </h3>

        {prospect ? (
          <>
            <dl className={styles.facts}>
              <div className={styles.fact}>
                <dt>Address</dt>
                <dd>
                  {prospect.address}
                  <ProvenanceBadge
                    provenance={prospect.provenance.address ?? "public"}
                    compact
                  />
                </dd>
              </div>
              <div className={styles.fact}>
                <dt>Who signs off</dt>
                <dd>{prospect.decisionMakerTitle}</dd>
              </div>
              <div className={styles.fact}>
                <dt>Written door</dt>
                <dd>
                  <EmailConfidenceChip
                    confidence={prospect.emailConfidence}
                    size="sm"
                  />
                </dd>
              </div>
              <div className={styles.fact}>
                <dt>Likely group size</dt>
                <dd>
                  <Figure
                    value={`${prospect.headcountLow} to ${prospect.headcountHigh}`}
                    provenance="modeled"
                    compact
                  />
                  <span className={styles.hint}>{prospect.headcountBasis}</span>
                </dd>
              </div>
              <div className={styles.fact}>
                <dt>When they buy</dt>
                <dd>{prospect.buyingWindow}</dd>
              </div>
            </dl>
            <p className={styles.whyFit}>{prospect.whyTheyFit}</p>
            <p className={styles.links}>
              {/* Over this drawer, not instead of it. The route the
                  letter lives at is prospect facing and carries no rail,
                  so a rep who followed it lost the queue they were
                  working. */}
              <button
                type="button"
                className={styles.quoteButton}
                onClick={() =>
                  openQuotePreview(prospect.id, {
                    packageId: prospect.leadPackageId,
                  })
                }
              >
                The group quote page they would be sent
              </button>
            </p>
          </>
        ) : (
          <p className={styles.walkIn}>
            <span aria-hidden="true">○</span>
            <span>
              <strong>No prospect record.</strong> Not one of the
              organisations in the trade area file, so it is recorded as a
              descriptor rather than an invented business:{" "}
              <em>{r.organisationName ?? "organisation not recorded"}</em>.
            </span>
          </p>
        )}
      </section>

      {/* --- WHAT WOULD FIT ---------------------------------------- */}
      <section className={styles.section} aria-labelledby="rd-fit">
        <h3 className={styles.sectionTitle} id="rd-fit">
          What fits their lane
        </h3>

        {pack ? (
          <p className={styles.leadPack}>
            <span aria-hidden="true">◆</span>
            <span>
              This desk would open on <strong>{pack.name}</strong>.
            </span>
          </p>
        ) : null}

        {fitted.length === 0 ? (
          <p className={styles.walkIn}>
            <span aria-hidden="true">○</span>
            <span>
              No published package names this lane on its own page.
            </span>
          </p>
        ) : (
          <ul className={styles.packs}>
            {fitted.map((p) => (
              <li key={p.id} className={styles.pack}>
                <span className={styles.packHead}>
                  <PackageGlyph family={p.family} />
                  <span className={styles.packName}>{p.name}</span>
                  <FamilyChip family={p.family} size="sm" />
                </span>
                <span className={styles.packPrice}>
                  <Figure
                    value={
                      p.pricePerGuest === null
                        ? null
                        : `$${p.pricePerGuest.toFixed(2)} per guest`
                    }
                    provenance={
                      p.pricePerGuest === null
                        ? "withheld"
                        : (p.provenance.pricePerGuest ?? "public")
                    }
                    withheldReason={p.priceNote}
                  />
                </span>
                <span className={styles.packMeta}>
                  {p.minGuests !== null ? (
                    <>
                      <span className="num">{p.minGuests}</span> guest minimum
                    </>
                  ) : (
                    "No published minimum"
                  )}
                  {p.maxGuests !== null ? (
                    <>
                      {", up to "}
                      <span className="num">{p.maxGuests}</span>
                    </>
                  ) : null}
                  <span className={styles.dot} aria-hidden="true">
                    ·
                  </span>
                  <a
                    className="tap"
                    href={p.source}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Their page
                  </a>
                </span>
              </li>
            ))}
          </ul>
        )}

        <p className={styles.terms}>
          <ProvenanceBadge provenance="public" compact />
          <span>
            Published terms on all of these: minimum{" "}
            <span className="num">{STANDARD_TERMS.bookingNoticeDays}</span> day
            booking notice, {" "}
            <span className="num">{STANDARD_TERMS.depositPercent}%</span>{" "}
            deposit.
          </span>
        </p>
      </section>

      {/* --- THE LANE ARITHMETIC ----------------------------------- */}
      <section className={styles.section} aria-labelledby="rd-lanes">
        <h3 className={styles.sectionTitle} id="rd-lanes">
          What their headcount would hold
        </h3>

        {r.headcount !== null ? (
          <>
            <p className={styles.laneMaths}>
              <span className={`${styles.laneFigure} num`}>
                {lanesForGuests(r.headcount)}
              </span>
              <span className={styles.laneWords}>
                bowling lanes for{" "}
                <span className="num">{r.headcount}</span> guests, at this
                application's planning rate of one lane per{" "}
                <span className="num">{GUESTS_PER_BOWLING_LANE}</span> guests.
                <ProvenanceBadge provenance="modeled" compact />
              </span>
            </p>
            {/*
              THE WARNING THAT USED TO SIT HERE HAS NOTHING LEFT TO FIRE
              AGAINST. It compared the lanes a headcount needs against a
              published floor the fork read off another operator's page.
              Round1 publishes no lane count anywhere, so there is no
              threshold to cross and no honest way to tell a rep that a
              group is too big for one sitting. Saying that out loud is
              the useful thing, because the rep can then ask the store.
            */}
            <p className={styles.laneWarn}>
              <span aria-hidden="true">◉</span>
              <WithheldFigure reason="Round1 publishes no lane count for any location, so whether this headcount fits in one sitting cannot be answered off a page. Lakewood Center is the nearest store and its page carries an amenity list, no lane count and no phone number, so this question goes to the store in person." />
            </p>
          </>
        ) : (
          <p className={styles.walkIn}>
            <span aria-hidden="true">⊘</span>
            <span>
              No headcount, so there is no lane arithmetic.{" "}
              {r.fieldReasons.headcount === "not-asked-by-route"
                ? `The ${channel.label.toLowerCase()} does not ask for one.`
                : "The route asked and it came back empty."}
            </span>
          </p>
        )}
      </section>

      {/* --- THE WORK IT IS GENERATING ----------------------------- */}
      <section className={styles.section} aria-labelledby="rd-task">
        <h3 className={styles.sectionTitle} id="rd-task">
          Work generated
        </h3>
        {/* Closed rows stay on the board: a queue that deletes its own
            losses is marking its own homework. */}
        <TaskBlock task={task} emptyNote="Closed. Nothing is asking for work." />
      </section>

      <div className={styles.copyRow}>
        <Button
          variant="ghost"
          size="sm"
          glyph="▤"
          onClick={() =>
            onCopy(callListLine(r), `the call list line for ${organisationOf(r)}`)
          }
        >
          Copy the call list line
        </Button>
      </div>
    </>
  );
}

// ---------------------------------------------------------------
// A league ask
// ---------------------------------------------------------------

function LeagueBody({
  interest: l,
  task,
  onCopy,
}: {
  interest: LeagueInterest;
  task: DerivedTask | null;
  onCopy: (text: string, what: string) => void;
}) {
  const programme = OPEN_LANE_SOCIALS;

  return (
    <>
      <section className={styles.section} aria-labelledby="rd-league-ask">
        <h3 className={styles.sectionTitle} id="rd-league-ask">
          What they asked
        </h3>
        <blockquote className={styles.said}>
          <p className={styles.saidText}>{l.note}</p>
          <footer className={styles.saidFoot}>
            <span>
              Received <span className="num">{formatWhen(l.receivedAt)}</span>
            </span>
            <ProvenanceBadge provenance="illustrative" compact />
          </footer>
        </blockquote>

        <dl className={styles.facts}>
          <div className={styles.fact}>
            <dt>Nights that suit them</dt>
            <dd>{l.preferredNights.join(" or ")}</dd>
          </div>
          <div className={styles.fact}>
            <dt>Bowlers they expect</dt>
            <dd>
              {l.bowlersExpected !== null ? (
                <>
                  <Figure
                    value={`${l.bowlersExpected} bowlers`}
                    provenance="illustrative"
                    compact
                  />
                  <span className={styles.hint}>
                    Their figure, not a modelled one. It is{" "}
                    {lanesForGuests(l.bowlersExpected)} lanes a week at the
                    published one per {GUESTS_PER_BOWLING_LANE}.
                  </span>
                </>
              ) : (
                "No number given."
              )}
            </dd>
          </div>
          <div className={styles.fact}>
            <dt>Written door</dt>
            <dd className={styles.mono}>{l.email ?? "None on the ask"}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.section} aria-labelledby="rd-league-real">
        <h3 className={styles.sectionTitle} id="rd-league-real">
          What the operator opposite actually publishes
        </h3>

        <p className={styles.leagueLead}>
          <strong>{programme.name}</strong>, under {programme.bannerName}, is a
          real brand-wide programme and it is marked{" "}
          <em>{programme.registrationStatus}</em> on that operator's own
          leagues page.
          <ProvenanceBadge provenance="public" compact />
        </p>

        <dl className={styles.facts}>
          <div className={styles.fact}>
            <dt>Play nights</dt>
            <dd>
              {programme.playNights.join(", ")}, participant's choice
              <ProvenanceBadge provenance="public" compact />
            </dd>
          </div>
          <div className={styles.fact}>
            <dt>Perks</dt>
            <dd>{programme.perks.join(". ")}.</dd>
          </div>
          <div className={styles.fact}>
            <dt>Where it runs</dt>
            <dd>
              Select locations. The page names{" "}
              {programme.namedLocations.join(", ")}, all in Colorado.
              <ProvenanceBadge provenance="public" compact />
            </dd>
          </div>
          <div className={styles.fact}>
            <dt>This trade area</dt>
            <dd>{programme.localNote}</dd>
          </div>
        </dl>

        <h4 className={styles.subTitle}>What that page does not publish</h4>
        <ul className={styles.unpublished}>
          {programme.unpublished.map((u) => (
            <li key={u.field} className={styles.unpublishedItem}>
              <span className={styles.unpublishedField}>
                <ProvenanceBadge provenance={u.provenance} compact />
                {u.field}
              </span>
              <span className={styles.unpublishedNote}>{u.note}</span>
            </li>
          ))}
        </ul>

        <p className={styles.links}>
          <a
            className="tap"
            href={programme.source}
            target="_blank"
            rel="noreferrer noopener"
          >
            That operator's leagues page
          </a>
        </p>
      </section>

      <section className={styles.section} aria-labelledby="rd-league-answer">
        <h3 className={styles.sectionTitle} id="rd-league-answer">
          The standing answer
        </h3>
        <p className={styles.standing}>{l.standingAnswer}</p>
        {l.answeredAt ? (
          <p className={styles.gapLine}>
            <span aria-hidden="true">●</span> Answered{" "}
            <span className="num">{formatWhen(l.answeredAt)}</span>.
          </p>
        ) : (
          <p className={styles.gapLine}>
            <span aria-hidden="true">○</span> Not yet answered. On the same
            four working hour commitment as any other enquiry.
          </p>
        )}
        <div className={styles.copyRow}>
          <Button
            variant="ghost"
            size="sm"
            glyph="▤"
            onClick={() => onCopy(l.standingAnswer, "the standing answer")}
          >
            Copy the standing answer
          </Button>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="rd-league-task">
        <h3 className={styles.sectionTitle} id="rd-league-task">
          Work generated
        </h3>
        <TaskBlock
          task={task}
          emptyNote="Answered. It stays on the board as recorded midweek demand."
        />
      </section>
    </>
  );
}

// ---------------------------------------------------------------
// The derived task, and its score
// ---------------------------------------------------------------

function TaskBlock({
  task,
  emptyNote,
}: {
  task: DerivedTask | null;
  emptyNote: string;
}) {
  if (!task) {
    return (
      <p className={styles.walkIn}>
        <span aria-hidden="true">○</span>
        <span>{emptyNote}</span>
      </p>
    );
  }
  const meta = TASK_KIND_META[task.kind];
  return (
    <>
      <p className={styles.taskHead}>
        <span
          className={styles.toneGlyph}
          aria-hidden="true"
          style={{ ["--tone" as string]: meta.cssVar }}
        >
          {meta.glyph}
        </span>
        <span className={styles.taskLabel}>{meta.label}</span>
        <span className={styles.taskDue}>
          due <span className="num">{formatWhen(task.dueAt)}</span>
          {task.hoursLate !== null ? (
            <>
              {", "}
              <span className="num">{task.hoursLate}</span> working hours past
              it
            </>
          ) : null}
        </span>
      </p>
      <p className={styles.taskBecause}>{task.because}</p>
      <p className={styles.taskAction}>
        <span className={styles.taskActionLabel}>Do this</span>
        {task.action}
      </p>

      <h4 className={styles.subTitle}>
        Why it ranks where it does, <span className="num">{task.score}</span>{" "}
        points
      </h4>
      <ul className={styles.reasons}>
        {task.reasons.map((reason) => (
          <li key={reason.label} className={styles.reason}>
            <span className={styles.reasonHead}>
              <span className={styles.reasonLabel}>{reason.label}</span>
              <span className={`${styles.reasonPoints} num`}>
                {reason.points}
              </span>
            </span>
            <span className={styles.reasonWhy}>{reason.why}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

// ---------------------------------------------------------------
// The footers, which carry the one primary action
// ---------------------------------------------------------------

function RequestFoot({
  request: r,
  onCompose,
  onCopy,
}: {
  request: GroupRequest;
  onCompose: (plan: ComposePlan) => void;
  onCopy: (text: string, what: string) => void;
}) {
  const primary = primaryFor(r);
  return (
    <>
      <div className={styles.footActions}>
        {primary.compose ? (
          <Button
            variant="primary"
            glyph="✉"
            onClick={() => onCompose(primary.compose as ComposePlan)}
          >
            {primary.label}
          </Button>
        ) : primary.to ? (
          <Link className={styles.footLink} to={primary.to}>
            <span aria-hidden="true">◆</span>
            <span>{primary.label}</span>
          </Link>
        ) : (
          <Button
            variant="secondary"
            glyph="▤"
            onClick={() =>
              onCopy(callListLine(r), `the call list line for ${organisationOf(r)}`)
            }
          >
            Copy the call list line
          </Button>
        )}
      </div>
      <p className={styles.footWhy}>{primary.why}</p>
    </>
  );
}

function LeagueFoot({
  interest: l,
  onCompose,
  onCopy,
}: {
  interest: LeagueInterest;
  onCompose: (plan: ComposePlan) => void;
  onCopy: (text: string, what: string) => void;
}) {
  return (
    <>
      <div className={styles.footActions}>
        {l.prospectId ? (
          <Button
            variant="primary"
            glyph="✉"
            onClick={() =>
              onCompose({ prospectId: l.prospectId as string, intent: "free" })
            }
          >
            Answer the league ask
          </Button>
        ) : (
          <Button
            variant="secondary"
            glyph="▤"
            onClick={() => onCopy(l.standingAnswer, "the standing answer")}
          >
            Copy the standing answer
          </Button>
        )}
      </div>
      <p className={styles.footWhy}>
        {l.prospectId
          ? "This trade area is not one of the named locations, so the draft opens blank."
          : "Walk-in with no prospect record, so there is nothing to compose from."}
      </p>
    </>
  );
}

// ---------------------------------------------------------------
// The call list line
// ---------------------------------------------------------------

function organisationOf(r: GroupRequest): string {
  if (r.prospectId) return PROSPECT_BY_ID[r.prospectId]?.name ?? r.prospectId;
  return r.organisationName ?? "Organisation not recorded";
}

/**
 * One request, as a line somebody can read off a phone.
 *
 * This is the escape hatch that makes the checkboxes on the queue mean
 * something for the rows that cannot be emailed. Half of the enquiries
 * here have no published written door, and the honest verb for those is
 * a call, so the tool hands over the four things a caller needs: who,
 * what they asked, what is missing, and what to do about it.
 */
export function callListLine(r: GroupRequest): string {
  const missing = missingQualifiers(r);
  const missingText =
    missing.length === 0
      ? "Nothing missing"
      : `Missing: ${missing.map((f) => QUALIFYING_FIELD_LABEL[f].toLowerCase()).join(", ")}`;
  return [
    organisationOf(r),
    `${r.contactRole}, ${LANE_META[r.lane].label}`,
    `Asked: ${r.askSummary}`,
    `Arrived ${formatWhen(r.receivedAt)} through the ${REQUEST_CHANNEL_META[r.channel].short.toLowerCase()}`,
    `Status: ${REQUEST_STATUS_META[r.status].label}. ${missingText}`,
  ].join("\n");
}
