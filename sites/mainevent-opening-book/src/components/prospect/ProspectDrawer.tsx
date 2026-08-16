import { useEffect, useRef } from "react";
import type { DayPart, Prospect } from "@/domain/types";
import { LANE_META, lanesForGuests, GUESTS_PER_BOWLING_LANE } from "@/domain/lanes";
import { PACKAGE_BY_ID, STANDARD_TERMS } from "@/data/packages";
import { VENUE } from "@/data/venue";
import { milesFromVenue } from "@/domain/selectors/desk";
import {
  furthestStatus,
  touchesFor,
  usePipeline,
} from "@/state/PipelineProvider";
import { sentTo, useOutbox, OUTCOME_META, KIND_META } from "@/state/OutboxProvider";
import { useOpenQuotePreview } from "@/state/QuotePreviewProvider";
import { ProspectPlate } from "@/components/primitives/Wordmark";
import { LaneChip, OccasionClassChip } from "@/components/primitives/LaneChip";
import {
  StatusChip,
  EmailConfidenceChip,
} from "@/components/primitives/StatusChip";
import { FamilyChip } from "@/components/primitives/FamilyChip";
import { PackageGlyph } from "@/components/primitives/PackageGlyph";
import { Figure, ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { RecordName } from "@/components/record/RecordName";
import styles from "./ProspectDrawer.module.css";

/**
 * EVERYTHING KNOWN ABOUT ONE ORGANISATION, ON ONE SURFACE.
 *
 * The desk answers "who do I contact today". This answers the question a
 * reader asks about four seconds later, which is "how do you know any of
 * that", and it answers it by showing the working rather than by
 * asserting confidence.
 *
 * ── THE SOURCE LINK ON THE EMAIL IS THE POINT OF THIS COMPONENT ────
 * Ninety-three of the two hundred and eleven organisations in this data
 * set publish an email address on their own website. Every one of those
 * ninety-three carries the URL of the page it was read off, and this
 * drawer prints that URL as a link a reader can click and check in about
 * fifteen seconds. Nothing in the set was pattern-guessed from a domain
 * name.
 *
 * That is a small feature and it is doing an enormous amount of work,
 * because the alternative is indistinguishable from the thing every
 * scraped prospecting deck does: a plausible info@ address, invented from
 * a domain, presented with the same confidence as a verified one. One
 * invented address is enough to make a hiring manager reasonably
 * distrust every other figure on the screen, and there are a lot of other
 * figures on this screen.
 *
 * ── THE EMAIL IS NOT A MAILTO LINK, DELIBERATELY ───────────────────
 * These are real addresses belonging to real school administrators and
 * real practice managers. A mailto on a portfolio page invites a stranger
 * to open a compose window addressed to one of them, and a work sample
 * that generates unsolicited mail to the organisations it profiles has
 * done the one unforgivable thing. The address is printed as text to be
 * read and copied by the person who is actually doing the outreach.
 * Sending inside this prototype writes a row to the outbox and nothing
 * leaves the tab.
 *
 * ── WHAT IS NOT HERE ───────────────────────────────────────────────
 * No contact name. Not one invented human name appears anywhere in this
 * application: the buyer is a ROLE, published on a staff directory, and a
 * role is also the thing that survives the person leaving.
 *
 * No price for a gated package. Where Main Event publishes no figure this
 * renders the sentence rather than a number, through the same primitive
 * every other screen uses, so the rule cannot be broken here by accident.
 */

/**
 * Published day-part eligibility, in words.
 *
 * Kept local rather than lifted into the vocabulary because this is the
 * only surface that renders a day part as prose. If a second screen needs
 * it, it belongs in domain/vocabulary.ts and this map should go, rather
 * than a second copy appearing beside it.
 */
const DAY_PART_LABEL: Record<DayPart, string> = {
  "weekday-daytime": "Weekday daytime",
  "weekday-evening": "Weekday evening",
  weekend: "Weekend",
  "after-close": "After close",
  any: "Any day part",
};

/** The domain, for a link that has to read as a place rather than a URL. */
function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function ProspectDrawer({
  prospect,
  onClose,
}: {
  prospect: Prospect;
  onClose: () => void;
}) {
  const pipeline = usePipeline();
  const outbox = useOutbox();
  const openQuotePreview = useOpenQuotePreview();
  const headingRef = useRef<HTMLHeadingElement>(null);

  /**
   * Focus moves into the panel on open and Escape closes it.
   *
   * The element that opened the drawer is remembered and focused again on
   * close. Without that, a keyboard reader who opens the fourteenth row
   * and closes it is returned to the top of the document and has to walk
   * the whole list again, which is the difference between a dialog that
   * is technically accessible and one that is usable.
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

  const p = prospect;
  const lane = LANE_META[p.lane];
  const status = furthestStatus(pipeline, p.id);
  const touches = touchesFor(pipeline, p.id);
  const miles = milesFromVenue(p.lat, p.lng);
  const midpoint = Math.round((p.headcountLow + p.headcountHigh) / 2);
  const lanesNeeded = lanesForGuests(midpoint);
  const pack = PACKAGE_BY_ID[p.leadPackageId];
  const sent = sentTo(outbox, p.id);

  return (
    <>
      {/* The scrim carries no controls and no meaning, so it is hidden
          from assistive technology entirely. Escape and the close button
          are the two routes out that a keyboard reader is offered. */}
      <div className={styles.scrim} onClick={onClose} aria-hidden="true" />

      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-heading"
      >
        <header className={styles.head}>
          <div className={styles.headTop}>
            <ProspectPlate name={p.name} lane={p.lane} size="lg" />
            <div className={styles.headText}>
              {/*
                The heading still owns the id the dialog is labelled by
                and still takes focus when the drawer opens; the words
                inside it are the control. A drawer is a plain box, so
                nothing above this line is interactive and the button is
                not nested inside another one.
              */}
              <h2 className={styles.name} id="drawer-heading" tabIndex={-1} ref={headingRef}>
                <RecordName prospectId={p.id} name={p.name} />
              </h2>
              <div className={styles.headChips}>
                <LaneChip lane={p.lane} size="sm" />
                <StatusChip status={status} size="sm" />
                <EmailConfidenceChip confidence={p.emailConfidence} size="sm" />
              </div>
            </div>
            <button
              type="button"
              className={styles.close}
              onClick={onClose}
              aria-label="Close this prospect"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
          <p className={styles.doorLine}>
            {lane.label}. The way in is the {lane.doorNoun}, and the buyer
            is a {p.decisionMakerTitle.toLowerCase()}.
          </p>
        </header>

        <div className={styles.body}>
          {/* ---------------------------------------------------------
              WHERE THEY ARE. Every field in this block came out of the
              Google Places API on 11 August 2026 and carries the place
              id it came from, so any row can be checked at source.
              --------------------------------------------------------- */}
          <section className={styles.section} aria-labelledby="sec-where">
            <h3 className={styles.sectionTitle} id="sec-where">
              Where they are
            </h3>

            <dl className={styles.facts}>
              <div className={styles.fact}>
                <dt>Address</dt>
                <dd>
                  {p.address}
                  <ProvenanceBadge
                    provenance={p.provenance.address ?? "public"}
                    compact
                  />
                </dd>
              </div>

              <div className={styles.fact}>
                <dt>Straight-line distance</dt>
                <dd>
                  <span className="num">{miles.toFixed(1)}</span> miles from 245 W
                  Birch Street
                  <ProvenanceBadge provenance="modeled" compact />
                  <span className={styles.hint}>
                    Straight line, not drive time. Drive time depends on the
                    hour and this app does not pretend to know it.
                  </span>
                </dd>
              </div>

              {p.phone ? (
                <div className={styles.fact}>
                  <dt>Phone</dt>
                  <dd>
                    <a className="num" href={`tel:${p.phone.replace(/[^0-9+]/g, "")}`}>
                      {p.phone}
                    </a>
                    <ProvenanceBadge provenance="public" compact />
                  </dd>
                </div>
              ) : null}

              {p.website ? (
                <div className={styles.fact}>
                  <dt>Website</dt>
                  <dd>
                    <a href={p.website} target="_blank" rel="noreferrer noopener">
                      {hostOf(p.website)}
                    </a>
                    <ProvenanceBadge provenance="public" compact />
                  </dd>
                </div>
              ) : null}

              {p.rating !== undefined ? (
                <div className={styles.fact}>
                  <dt>Google rating</dt>
                  <dd>
                    <span className="num">{p.rating.toFixed(1)}</span> from{" "}
                    <span className="num">{p.reviewCount ?? 0}</span>{" "}
                    {p.reviewCount === 1 ? "review" : "reviews"}
                    <ProvenanceBadge provenance="public" compact />
                    <span className={styles.hint}>
                      A traffic proxy and nothing more. Five reviews on a
                      school district office says something about the office,
                      not about the district.
                    </span>
                  </dd>
                </div>
              ) : null}

              {p.placeId ? (
                <div className={styles.fact}>
                  <dt>Google place id</dt>
                  <dd>
                    <code className={styles.code}>{p.placeId}</code>
                    <span className={styles.hint}>
                      Carried so the address, the coordinates and the rating
                      above can all be checked against one source.
                    </span>
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>

          {/* ---------------------------------------------------------
              THE WRITTEN DOOR. The most credibility-earning block in the
              application, which is why it gets its own frame.
              --------------------------------------------------------- */}
          <section
            className={`${styles.section} ${styles.doorSection}`}
            aria-labelledby="sec-door"
          >
            <h3 className={styles.sectionTitle} id="sec-door">
              The written door
            </h3>

            {p.emailConfidence === "verified_public" && p.email ? (
              <>
                <p className={styles.email}>
                  <span className={`${styles.emailValue} num`}>{p.email}</span>
                  <ProvenanceBadge provenance={p.provenance.email ?? "public"} />
                </p>
                {p.emailSourceUrl ? (
                  <p className={styles.sourceLine}>
                    <span className={styles.sourceLabel}>Read off</span>{" "}
                    <a
                      href={p.emailSourceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={styles.sourceLink}
                    >
                      {hostOf(p.emailSourceUrl)}
                      <span className={styles.sourcePath}>
                        {p.emailSourceUrl.replace(/^https?:\/\/[^/]+/, "") || "/"}
                      </span>
                    </a>
                  </p>
                ) : null}
                <p className={styles.doorNote}>
                  Open that page and the address is on it. Nothing in this data
                  set was guessed from a domain name, and a written touch here
                  costs two minutes rather than a forty minute round trip.
                </p>
              </>
            ) : null}

            {p.emailConfidence === "form_only" ? (
              <>
                <p className={styles.email}>
                  <span className={styles.emailValue}>Contact form only</span>
                </p>
                {p.contactFormUrl ? (
                  <p className={styles.sourceLine}>
                    <span className={styles.sourceLabel}>The form is at</span>{" "}
                    <a
                      href={p.contactFormUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={styles.sourceLink}
                    >
                      {hostOf(p.contactFormUrl)}
                    </a>
                  </p>
                ) : null}
                <p className={styles.doorNote}>
                  They publish no address. A form is a written door and it
                  lands in a queue somebody may or may not read, so the honest
                  sequence here is form first, then the phone, then the door.
                </p>
              </>
            ) : null}

            {p.emailConfidence === "none" ? (
              <>
                <p className={styles.email}>
                  <span className={styles.emailValue}>No written door</span>
                </p>
                <p className={styles.doorNote}>
                  Phone or a visit, and nothing else. That is not a gap in the
                  research. An organisation with a front desk and no inbox is a
                  go-see, which is the first activity the job posting names.
                </p>
              </>
            ) : null}

            <p className={styles.touchLine}>
              <span className="num">{touches}</span>{" "}
              {touches === 1 ? "touch" : "touches"} recorded this period.
              {touches >= 2
                ? " Two written touches and then a visit is the sequence. A fourth email is a spam complaint."
                : ""}
            </p>
          </section>

          {/* --------------------------------------------------------- */}
          <section className={styles.section} aria-labelledby="sec-why">
            <h3 className={styles.sectionTitle} id="sec-why">
              Why them
            </h3>

            <dl className={styles.facts}>
              <div className={styles.fact}>
                <dt>Decision maker</dt>
                <dd>
                  {p.decisionMakerTitle}
                  <span className={styles.hint}>
                    A title, never a name. The title is what survives the
                    person leaving, and there is not one invented human name
                    anywhere in this application.
                  </span>
                </dd>
              </div>

              <div className={styles.fact}>
                <dt>The fit</dt>
                <dd>
                  {p.whyTheyFit}
                  <ProvenanceBadge
                    provenance={p.provenance.whyTheyFit ?? "modeled"}
                    compact
                  />
                </dd>
              </div>

              <div className={styles.fact}>
                <dt>Buying window</dt>
                <dd>
                  <strong className={styles.windowValue}>{p.buyingWindow}</strong>
                  <ProvenanceBadge
                    provenance={p.provenance.buyingWindow ?? "modeled"}
                    compact
                  />
                  <span className={styles.windowChips}>
                    <OccasionClassChip lane={p.lane} />
                  </span>
                  <span className={styles.hint}>
                    {lane.occasionClass === "calendar-locked"
                      ? "Their event happens whether or not anybody calls it, so this window is worked backwards from a fixed date. Miss it and there is no second chance this year."
                      : "Somebody has to decide there will be an event at all, so the work is on the decision maker rather than on the date."}
                  </span>
                </dd>
              </div>

              <div className={styles.fact}>
                <dt>Hardest thing about this lane</dt>
                <dd>{lane.preOpeningProblem}</dd>
              </div>
            </dl>
          </section>

          {/* ---------------------------------------------------------
              HOW MANY, AND WHAT THAT COSTS THE BUILDING.
              --------------------------------------------------------- */}
          <section className={styles.section} aria-labelledby="sec-size">
            <h3 className={styles.sectionTitle} id="sec-size">
              How many, and what it costs the building
            </h3>

            <p className={styles.headcount}>
              <span className={`${styles.headcountValue} num`}>
                {p.headcountLow} to {p.headcountHigh}
              </span>
              <span className={styles.headcountUnit}>guests</span>
              <ProvenanceBadge provenance={p.provenance.headcount ?? "modeled"} />
            </p>
            <p className={styles.basis}>{p.headcountBasis}</p>
            <p className={styles.doorNote}>
              Never a single number. A headcount is the input to every figure
              downstream, and a range with its basis attached is honest in a
              way that one confident number is not.
            </p>

            <div className={styles.lanesBox}>
              <p className={styles.lanesLead}>
                At the midpoint of <span className="num">{midpoint}</span>{" "}
                guests, this booking consumes{" "}
                <strong className="num">{lanesNeeded}</strong> bowling{" "}
                {lanesNeeded === 1 ? "lane" : "lanes"} of the more than{" "}
                <span className="num">{VENUE.bowlingLanesPublishedFloor}</span>{" "}
                Main Event publishes for Brea.
              </p>
              <p className={styles.lanesNote}>
                Main Event publishes the rule itself, at one lane per{" "}
                <span className="num">{GUESTS_PER_BOWLING_LANE}</span> guests,
                on the All Access Pass, MVP and Level Up pages. The only
                judgement made here is to compute against the published floor
                of {VENUE.bowlingLanesPublishedFloor} rather than a guess at the
                true count, so the figure can only understate the venue.
              </p>
              <ProvenanceBadge provenance="modeled" />
            </div>
          </section>

          {/* ---------------------------------------------------------
              WHAT TO LEAD WITH.
              --------------------------------------------------------- */}
          {pack ? (
            <section className={styles.section} aria-labelledby="sec-pack">
              <h3 className={styles.sectionTitle} id="sec-pack">
                What to lead with
              </h3>

              <div className={styles.packHead}>
                <PackageGlyph family={pack.family} size={30} />
                <div className={styles.packHeadText}>
                  <strong className={styles.packName}>{pack.name}</strong>
                  <FamilyChip family={pack.family} size="sm" />
                </div>
              </div>

              <p className={styles.price}>
                <span className={styles.priceLabel}>Per guest</span>
                <Figure
                  value={
                    pack.pricePerGuest === null
                      ? null
                      : `$${pack.pricePerGuest.toFixed(2)}`
                  }
                  provenance={
                    pack.pricePerGuest === null
                      ? "withheld"
                      : pack.provenance.pricePerGuest ?? "public"
                  }
                />
              </p>
              {pack.priceNote ? (
                <p className={styles.basis}>{pack.priceNote}</p>
              ) : null}

              <h4 className={styles.subTitle}>What the guest actually gets</h4>
              <ul className={styles.inclusions}>
                {pack.inclusions.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>

              <dl className={styles.facts}>
                <div className={styles.fact}>
                  <dt>Guest minimum</dt>
                  <dd>
                    {pack.minGuests === null ? (
                      "None published"
                    ) : (
                      <>
                        <span className="num">{pack.minGuests}</span> guests
                      </>
                    )}
                    {pack.maxGuests !== null ? (
                      <>
                        {", capped at "}
                        <span className="num">{pack.maxGuests}</span>
                      </>
                    ) : null}
                    <ProvenanceBadge provenance="public" compact />
                  </dd>
                </div>

                <div className={styles.fact}>
                  <dt>Day parts</dt>
                  <dd>
                    {pack.dayParts.map((d) => DAY_PART_LABEL[d]).join(", ")}
                    <ProvenanceBadge provenance="public" compact />
                    {pack.dayPartNote ? (
                      <span className={styles.hint}>{pack.dayPartNote}</span>
                    ) : null}
                  </dd>
                </div>

                <div className={styles.fact}>
                  <dt>Booking terms</dt>
                  <dd>
                    <span className="num">
                      {pack.bookingNoticeDays ?? STANDARD_TERMS.bookingNoticeDays}
                    </span>{" "}
                    days notice, {" "}
                    <span className="num">
                      {pack.depositPercent ?? STANDARD_TERMS.depositPercent}%
                    </span>{" "}
                    deposit
                    <ProvenanceBadge provenance="public" compact />
                  </dd>
                </div>
              </dl>

              <p className={styles.sourceLine}>
                <span className={styles.sourceLabel}>Read off</span>{" "}
                <a
                  href={pack.source}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={styles.sourceLink}
                >
                  {hostOf(pack.source)}
                  <span className={styles.sourcePath}>
                    {pack.source.replace(/^https?:\/\/[^/]+/, "") || "/"}
                  </span>
                </a>
              </p>
            </section>
          ) : null}

          {/* ---------------------------------------------------------
              PRIOR CORRESPONDENCE. Shown only where there is any, because
              an empty log on two hundred and eleven drawers is two
              hundred and eleven empty boxes teaching nobody anything.
              --------------------------------------------------------- */}
          {sent.length > 0 ? (
            <section className={styles.section} aria-labelledby="sec-sent">
              <h3 className={styles.sectionTitle} id="sec-sent">
                What has already gone out
              </h3>
              <ul className={styles.sentList}>
                {sent.map((m) => {
                  const outcome = OUTCOME_META[m.outcome];
                  const kind = KIND_META[m.kind];
                  return (
                    <li key={m.id} className={styles.sentRow}>
                      <span className={styles.sentKind}>
                        <span aria-hidden="true">{kind.glyph}</span> {kind.label}
                      </span>
                      <span className={styles.sentSubject}>{m.subject}</span>
                      <span
                        className={styles.sentOutcome}
                        style={{ ["--tone" as string]: outcome.cssVar }}
                      >
                        <span aria-hidden="true">{outcome.glyph}</span>{" "}
                        {outcome.label}
                      </span>
                      <span className={`${styles.sentDate} num`}>{m.sentAt}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {p.note ? (
            <section className={styles.section} aria-labelledby="sec-note">
              <h3 className={styles.sectionTitle} id="sec-note">
                Worth saying out loud
              </h3>
              <p className={styles.basis}>{p.note}</p>
            </section>
          ) : null}
        </div>

        <footer className={styles.foot}>
          {/*
            The quote route sits outside the app shell on purpose. An
            activities director arrives there from an email and has no
            business seeing the desk, the score that ranked them, or the
            capacity chart showing which dates are nearly gone. A rep is
            not that reader, so this control opens the same letter in a
            dialog and leaves the board where it is.
          */}
          <button
            type="button"
            className={styles.quoteLink}
            onClick={() =>
              openQuotePreview(p.id, { packageId: p.leadPackageId })
            }
          >
            Preview their group quote
          </button>
          <span className={styles.footNote}>
            Their side of it. No internal chrome, no score, no pipeline.
          </span>
        </footer>
      </aside>
    </>
  );
}
