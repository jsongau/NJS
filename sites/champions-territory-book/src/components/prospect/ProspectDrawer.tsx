import { groupProfile, leadPackage as leadPackageOf, NO_GROUP_PROFILE } from "@/domain/booking";
import { useEffect, useRef } from "react";
import type { DayPart, Prospect } from "@/domain/types";
import { LANE_META, crewSlotsForDoors, DOORS_PER_CREW_SLOT } from "@/domain/lanes";
import { isWithheldEmail } from "@/domain/contactDoor";
import { STANDARD_TERMS } from "@/data/packages";
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
 * The desk answers "who do I look at today". This answers the question a
 * reader asks about four seconds later, which is "how do you know any of
 * that", and it answers it by showing the working rather than by
 * asserting confidence.
 *
 * ── THE ORDER OF THE SECTIONS IS THE ORDER THE QUESTIONS GET ASKED ─
 * Who they are, where they stand against this division, what they
 * publish, why it matters, and what we can see them betting on. That is
 * how a marketing manager actually reads a rival: the service lines and
 * the territory first, because they decide whether this row is even in
 * the same market, and the published offer last, because an offer only
 * means something once you know who is making it.
 *
 * ── AN EMPTY ROW IS A FINDING AND IS DRAWN AS ONE ──────────────────
 * Nothing in the published block is hidden when it is absent. A
 * membership plan with no price beside it is the single most repeated
 * pattern in this whole data set: eight of the fourteen brands profiled name a plan and hide the number, five publish none at all, and not one of the fourteen
 * name a plan and route the price question to a phone number. Hide the
 * blank and the pattern disappears, and the pattern is the argument.
 *
 * ── THE SOURCE LINK ON THE EMAIL IS THE POINT OF THIS COMPONENT ────
 * Ninety-three of the three hundred and twenty nine organisations in
 * this data set publish an email address on their own website. Every one
 * of those ninety-three carries the URL of the page it was read off, and
 * this drawer prints that URL as a link a reader can click and check in
 * about fifteen seconds. Nothing in the set was pattern-guessed from a
 * domain name.
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
 * These are real addresses belonging to real front offices and real
 * practice managers. A mailto on a portfolio page invites a stranger to
 * open a compose window addressed to one of them, and a work sample that
 * generates unsolicited mail to the organisations it profiles has done
 * the one unforgivable thing. The address is printed as text to be read
 * and copied by the person who is actually doing the outreach. Sending
 * inside this prototype writes a row to the outbox and nothing leaves
 * the tab.
 *
 * ── WHAT IS NOT HERE ───────────────────────────────────────────────
 * No contact name. Not one invented human name appears anywhere in this
 * application: the buyer is a ROLE, published on a staff directory, and a
 * role is also the thing that survives the person leaving.
 *
 * No price for a plan whose owner withholds it. Where a brand publishes
 * no figure this renders the sentence rather than a number, through the
 * same primitive every other screen uses, so the rule cannot be broken
 * here by accident.
 */

/**
 * What this row is to the division, in a word a reader can act on.
 *
 * It is kept local rather than lifted into domain/vocabulary.ts for the
 * same reason ORG_TYPE_META sits in the record selector: this pass does
 * not own that file, and a second copy of a token map is a worse outcome
 * than a temporarily misplaced one. When it moves, delete it from here.
 *
 * The absent case is spelled out rather than left blank, because a row
 * whose position nobody has decided and a row deliberately marked as
 * none of the four are different states.
 */
const MARKET_ROLE_LABEL: Record<string, string> = {
  champions: "A Champions Group brand",
  competitor: "A competitor in this territory",
  partner: "A potential local partner",
  benchmark: "A benchmark from outside the territory",
  other: "None of the four, recorded honestly",
};

/**
 * When an offer can be redeemed, in words.
 *
 * Kept local rather than lifted into the vocabulary because this is the
 * only surface that renders it as prose. If a second screen needs it, it
 * belongs in domain/vocabulary.ts and this map should go, rather than a
 * second copy appearing beside it.
 *
 * "Outside published hours" is the interesting one. Rooter Hero, Mr
 * Rooter and Roto-Rooter all lead on never charging for nights, weekends
 * or holidays, which means no-overtime pricing is commoditised in this
 * market and is worth nothing as a differentiator.
 */
const DAY_PART_LABEL: Record<DayPart, string> = {
  "weekday-daytime": "Weekday daytime",
  "weekday-evening": "Weekday evening",
  weekend: "Weekend",
  "after-close": "Outside published hours",
  any: "Any time",
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
  const group = groupProfile(p);
  const midpoint = group?.mid ?? null;
  const lanesNeeded = midpoint === null ? null : crewSlotsForDoors(midpoint);
  const pack = leadPackageOf(p);
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
              WHERE THEY ARE. Most fields in this block came out of the
              Google Places API and carry the place id they came from, so
              the row can be checked at source in about fifteen seconds.
              The rows added in later research passes carry a Census
              coordinate and no id, and say so rather than carrying
              something shaped like one.
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
                  <span className="num">{miles.toFixed(1)}</span> miles from the
                  Brea branch at {VENUE.address}
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
                      A reputation proxy and nothing more. A star rating with
                      no volume behind it says very little, which is exactly
                      the problem with the anchor brand's own 4.9: no review
                      count is published beside it anywhere.
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
                  {/*
                    A withheld local part carries the withheld value
                    rather than public, because what is on screen is no
                    longer the published thing. The domain and the
                    source link both survive, so a reader who needs the
                    address can open the page it was read off.
                    domain/contactDoor.ts has the argument.
                  */}
                  <ProvenanceBadge
                    provenance={
                      isWithheldEmail(p.email)
                        ? "withheld"
                        : (p.provenance.email ?? "public")
                    }
                  />
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
                  go-see, and a go-see is the only route into it.
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

          {/* ---------------------------------------------------------
              WHO THEY ARE. The five facts that decide whether this row is
              even in the same market: what they sell, where they sell it,
              how many sites they run, how long they have been at it, and
              which role signs off spend.
              --------------------------------------------------------- */}
          <section className={styles.section} aria-labelledby="sec-who">
            <h3 className={styles.sectionTitle} id="sec-who">
              Who they are
            </h3>

            <dl className={styles.facts}>
              <div className={styles.fact}>
                <dt>Service lines</dt>
                <dd>
                  {p.services && p.services.length > 0
                    ? p.services.join(", ")
                    : "Not published"}
                  <ProvenanceBadge provenance="public" compact />
                </dd>
              </div>

              <div className={styles.fact}>
                <dt>Service area</dt>
                <dd>
                  {p.serviceArea ?? "Not published"}
                  <ProvenanceBadge provenance="public" compact />
                  <span className={styles.hint}>
                    Their own claim about where they work, not a boundary
                    anybody has verified. Two brands in this set claim three
                    counties from one address.
                  </span>
                </dd>
              </div>

              <div className={styles.fact}>
                <dt>Locations</dt>
                <dd>
                  {p.locationCount === undefined
                    ? "Not published"
                    : `${p.locationCount} published`}
                  <ProvenanceBadge provenance="public" compact />
                </dd>
              </div>

              <div className={styles.fact}>
                <dt>Founded</dt>
                <dd>
                  {p.foundedYear === undefined ? "Not published" : p.foundedYear}
                  <ProvenanceBadge provenance="public" compact />
                  <span className={styles.hint}>
                    Longevity is a local marketing asset and it is free to
                    print. A brand that has it and does not say so is leaving
                    a proof point on the floor.
                  </span>
                </dd>
              </div>

              <div className={styles.fact}>
                <dt>Signs off spend</dt>
                <dd>
                  {p.decisionMakerTitle}
                  <span className={styles.hint}>
                    A title, never a name. The title is what survives the
                    person leaving, and there is not one invented human name
                    anywhere in this application.
                  </span>
                </dd>
              </div>
            </dl>
          </section>

          {/* ---------------------------------------------------------
              WHERE THEY STAND. One field, and it changes what every
              other screen does with the row.
              --------------------------------------------------------- */}
          <section className={styles.section} aria-labelledby="sec-stand">
            <h3 className={styles.sectionTitle} id="sec-stand">
              Where they stand
            </h3>

            <dl className={styles.facts}>
              <div className={styles.fact}>
                <dt>In this market</dt>
                <dd>
                  <strong className={styles.windowValue}>
                    {MARKET_ROLE_LABEL[p.role ?? ""] ?? "Not decided yet"}
                  </strong>
                  <span className={styles.hint}>
                    A brand the division operates exists here so the board can
                    say where its own coverage already is. A competitor exists
                    to be watched. A partner is not in this trade at all.
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
                      ? "The season or the failure buys, not the buyer, so this window is worked backwards from a date the weather sets. Miss it and the leads are bought at the worst price of the year."
                      : "Somebody has to decide there is a job at all, so the work is on the decision rather than on the date."}
                  </span>
                </dd>
              </div>

              <div className={styles.fact}>
                <dt>Hardest thing about this service line</dt>
                <dd>{lane.preOpeningProblem}</dd>
              </div>
            </dl>
          </section>

          {/* ---------------------------------------------------------
              WHAT THEY PUBLISH. Four rows, none of them hidden when
              empty, because an absent membership price is the finding
              rather than a gap. Every value here was read off the
              organisation's own site.
              --------------------------------------------------------- */}
          <section className={styles.section} aria-labelledby="sec-publish">
            <h3 className={styles.sectionTitle} id="sec-publish">
              What they publish
            </h3>

            <dl className={styles.facts}>
              <div className={styles.fact}>
                <dt>Current offer</dt>
                <dd>
                  {p.offer ?? "Nothing published"}
                  <ProvenanceBadge provenance="public" compact />
                </dd>
              </div>

              <div className={styles.fact}>
                <dt>Membership plan</dt>
                <dd>
                  {p.membership ?? "None published"}
                  <ProvenanceBadge provenance="public" compact />
                  <span className={styles.hint}>
                    Read the plan name and then look for a number beside it.
                    Eight of the fourteen brands profiled name a plan and
                    hide the number, five publish no plan at all, and not
                    one of the fourteen publishes a price. That is the
                    single largest piece of unoccupied ground in this
                    market.
                  </span>
                </dd>
              </div>

              <div className={styles.fact}>
                <dt>Financing</dt>
                <dd>
                  {p.financing ?? "No lender named"}
                  <ProvenanceBadge provenance="public" compact />
                  <span className={styles.hint}>
                    Nobody in this market publishes an APR. One brand
                    publishes a term.
                  </span>
                </dd>
              </div>

              <div className={styles.fact}>
                <dt>Online booking</dt>
                <dd>
                  {p.onlineBooking === undefined
                    ? "Not checked"
                    : p.onlineBooking === "yes"
                      ? "Yes, on their own site"
                      : "No, phone or a form only"}
                  <ProvenanceBadge provenance="public" compact />
                </dd>
              </div>
            </dl>
          </section>

          {/* ---------------------------------------------------------
              WHY IT MATTERS, and WHAT WE SEE. One line each, because a
              paragraph here is a paragraph nobody reads twice.
              --------------------------------------------------------- */}
          <section className={styles.section} aria-labelledby="sec-angle">
            <h3 className={styles.sectionTitle} id="sec-angle">
              Why it matters
            </h3>
            <p className={styles.basis}>
              {p.marketingAngle ??
                "No angle written for this row yet. That is a gap in the work rather than a fact about the organisation."}
            </p>
            <ProvenanceBadge provenance="modeled" />
          </section>

          <section className={styles.section} aria-labelledby="sec-signal">
            <h3 className={styles.sectionTitle} id="sec-signal">
              What we can see
            </h3>
            <p className={styles.basis}>
              {p.competitiveSignal ??
                "Nothing read off their published marketing yet."}
            </p>
            <p className={styles.doorNote}>
              What their own published marketing says they are betting on.
              It is a reading of a website, not of a strategy, and a brand
              can be doing something clever that its site never mentions.
            </p>
            <ProvenanceBadge provenance="modeled" />
          </section>

          {/* ---------------------------------------------------------
              HOW MANY DOORS, AND WHAT THAT COSTS THE CREW.
              --------------------------------------------------------- */}
          <section className={styles.section} aria-labelledby="sec-size">
            <h3 className={styles.sectionTitle} id="sec-size">
              How many doors, and what it costs the crew
            </h3>

            <p className={styles.headcount}>
              <span className={`${styles.headcountValue} num`}>
                {group ? `${group.low} to ${group.high}` : NO_GROUP_PROFILE}
              </span>
              <span className={styles.headcountUnit}>doors</span>
              <ProvenanceBadge provenance={p.provenance.headcount ?? "modeled"} />
            </p>
            <p className={styles.basis}>{p.headcountBasis}</p>
            <p className={styles.doorNote}>
              Never a single number. Reach is the input to every figure
              downstream, and a range with its basis attached is honest in a
              way that one confident number is not.
            </p>

            <div className={styles.lanesBox}>
              <p className={styles.lanesLead}>
                At the midpoint of <span className="num">{midpoint}</span>{" "}
                doors, this consumes{" "}
                <strong className="num">{lanesNeeded}</strong> crew{" "}
                {lanesNeeded === 1 ? "slot" : "slots"} of the{" "}
                <span className="num">{VENUE.crewSlotsModelledFloor}</span>{" "}
                this console assumes the Brea branch can run in a day.
              </p>
              <p className={styles.lanesNote}>
                BOTH NUMBERS ARE OURS. No brand in this market publishes a
                jobs-per-truck figure and none of the five West Division sites
                publishes a technician count by branch, so the rate of one
                slot per <span className="num">{DOORS_PER_CREW_SLOT}</span>{" "}
                doors and the daily ceiling of{" "}
                {VENUE.crewSlotsModelledFloor} are planning assumptions
                rather than observations. A reader who works in the business
                will have better ones and should substitute them. The argument
                does not depend on the values being right, only on capacity
                being expressed at all, because a campaign that lands more
                calls than the crew can run buys a competitor a customer.
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
                <span className={styles.priceLabel}>Per door</span>
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

              <h4 className={styles.subTitle}>What the customer actually gets</h4>
              <ul className={styles.inclusions}>
                {pack.inclusions.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>

              <dl className={styles.facts}>
                <div className={styles.fact}>
                  <dt>Minimum doors</dt>
                  <dd>
                    {pack.minGuests === null ? (
                      "None published"
                    ) : (
                      <>
                        <span className="num">{pack.minGuests}</span> doors
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
                  <dt>When it can be redeemed</dt>
                  <dd>
                    {pack.dayParts.map((d) => DAY_PART_LABEL[d]).join(", ")}
                    <ProvenanceBadge provenance="public" compact />
                    {pack.dayPartNote ? (
                      <span className={styles.hint}>{pack.dayPartNote}</span>
                    ) : null}
                  </dd>
                </div>

                <div className={styles.fact}>
                  <dt>Terms</dt>
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
              an empty log on three hundred and twenty nine drawers is
              three hundred and twenty nine empty boxes teaching nobody
              anything. This is the one block in the drawer that is hidden
              when it is empty, and the reason is that its emptiness says
              nothing about the organisation, only about this desk.
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
            The proposal route sits outside the app shell on purpose. A
            property manager arrives there from an email and has no
            business seeing the desk, the score that ranked them, or the
            capacity chart showing which crew days are nearly gone. A
            marketer is not that reader, so this control opens the same
            letter in a dialog and leaves the board where it is.
          */}
          <button
            type="button"
            className={styles.quoteLink}
            onClick={() =>
              openQuotePreview(p.id, { packageId: p.leadPackageId })
            }
          >
            Preview their proposal
          </button>
          <span className={styles.footNote}>
            Their side of it. No internal chrome, no score, no pipeline.
          </span>
        </footer>
      </aside>
    </>
  );
}
