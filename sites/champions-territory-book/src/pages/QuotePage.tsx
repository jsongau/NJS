import { groupProfile } from "@/domain/booking";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import type { DayPart, EventPackage, Offer, Prospect } from "@/domain/types";
import { PROSPECT_BY_ID } from "@/data/prospects";
import { PACKAGE_BY_ID } from "@/data/packages";
import { DEMO_RECIPIENT, OFFERS, VENUE } from "@/data/venue";
import { DOORS_PER_CREW_SLOT, crewSlotsForDoors } from "@/domain/lanes";
import { PACKAGE_FAMILY } from "@/domain/vocabulary";
import {
  Figure,
  ProvenanceBadge,
  WithheldFigure,
} from "@/components/primitives/ProvenanceBadge";
import { PackageGlyph } from "@/components/primitives/PackageGlyph";
import { Button } from "@/components/primitives/Button";
import { useOutbox, useOutboxDispatch } from "@/state/OutboxProvider";
import { SOURCE_LINKS } from "@/lib/links";
import styles from "./QuotePage.module.css";

/**
 * THE ONE PAGE IN THIS APPLICATION A CUSTOMER EVER SEES.
 *
 * It renders at /quote/:prospectId and it renders OUTSIDE the app shell,
 * which is the most important decision in this file and the one worth
 * explaining before anything else. A property manager opens this link
 * from an email on a phone between two site visits. They have no
 * business seeing the division's internal navigation, the desk that
 * ranked them, the score that put them where they are on it, or the
 * capacity chart showing which install days are nearly gone. Showing any
 * of that would be the digital equivalent of handing a customer your
 * call sheet: it tells them they are a row, it tells them what leverage
 * you think you have, and it invites them to argue with an arithmetic
 * that was never built for their eyes.
 *
 * So App.tsx mounts this route above the shell rather than inside it, and
 * this page carries its own frame, its own footer, its own disclosure and
 * its own demo badge. Do not wrap it. The absence of chrome IS the
 * feature.
 *
 * ----- WHAT THE DOCUMENT ACTUALLY IS ---------------------------------
 *
 * A PROPOSAL FOR A PORTFOLIO OR FOR A CO-MARKETING ARRANGEMENT, which is
 * what the property management, multifamily, employer and community rows
 * on this board actually need. Nobody on those rows is buying one job.
 * They are deciding whether to route every job in a set of buildings, or
 * a set of staff, to one operator, and the question they are answering
 * is what that is worth and what it commits them to.
 *
 * Which is why the arithmetic on this page is modelled rather than
 * quoted, and says which of its assumptions it is standing on in the
 * same panel as the number. A per-door figure multiplied by a door count
 * is a ceiling, never a forecast, and a proposal that hides that
 * distinction is one the reader stops trusting the first time it misses.
 *
 * ----- ONE DOCUMENT, TWO FRAMES --------------------------------------
 *
 * `QuoteDocument` is the letter itself and it holds every word, figure
 * and provenance badge on it. Two frames render it and neither owns a
 * copy:
 *
 *   /quote/:prospectId            the frame below, customer facing
 *   QuotePreviewModal             a dialog over the console, for the desk
 *
 * The split is a component boundary rather than a duplicated page for
 * the obvious reason and for a less obvious one. The obvious one is that
 * a preview which drifts from the page it previews is worse than no
 * preview. The less obvious one is provenance: every badge, every
 * withheld price and every published source link is written once, so
 * there is no second copy for somebody to quietly simplify.
 *
 * The dialog passes `interactive={false}`, which is the ONLY difference
 * between the two renderings. The button on the customer's page writes a
 * row against their name, and somebody pressing it inside a preview
 * would be filing a request the organisation never made.
 *
 * ----- WHAT IS DELIBERATELY NOT ON THIS PAGE --------------------------
 *
 * No pitch status, because "reached out" is a fact about us. No service
 * line chip, because the reader is not a category. No LaneChip and no
 * FamilyChip either, and the second one is the interesting refusal: the
 * family chip is a fine component whose tooltip explains that a family
 * is gated behind a phone call and why that is an opening for us. True,
 * useful on the offer shelf, and exactly the sentence you do not want a
 * customer to hover into. The family is still named here, in plain
 * words, beside its decorative mark.
 *
 * There is also no second call to action. One page, one organisation, one
 * decision, one button. A proposal with a "download the brochure" beside
 * a "talk to a specialist" beside a "reserve these terms" is a page that
 * has not decided what it wants, and the reader resolves that ambiguity
 * by closing the tab.
 *
 * ----- THE REGISTER -------------------------------------------------
 *
 * Warmer and simpler than every internal screen: one column, bigger type,
 * the display serif at a larger step, generous space, no dense tables and
 * no charts. This is the only page in the application allowed to be
 * persuasive rather than analytical.
 *
 * It is NOT allowed to be less honest for it. Every commercial figure
 * still carries its provenance, the withheld prices still render as the
 * sentence rather than as a number, and the page says out loud, near the
 * top, where each published figure was read and when. A reader finds
 * that out within one search either way, and hearing it from us first is
 * the entire relationship.
 *
 * ----- WHY THE UNKNOWN ID GETS A REAL PAGE ---------------------------
 *
 * Links get truncated by mail clients, forwarded with a character
 * missing, and pasted into group chats that eat the last few letters. A
 * blank screen or a stack trace at that moment reads as a broken company
 * rather than a broken link, and the person holding the phone is a buyer
 * we have already spent a visit on. So an unrecognised id renders a
 * short, warm, non-technical page with a way forward on it.
 */

// ---------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Dates are split rather than parsed, for the same reason they are
 * everywhere else in this application. `new Date("2026-09-24")` is
 * midnight UTC, and rendering that through a locale formatter in
 * California prints the twenty third. A confirmation that shows a
 * customer the wrong day is a support call.
 */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

function todayIso(): string {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${m}-${d}`;
}

/**
 * Day parts in the words a customer would use.
 *
 * Declared here rather than in domain/vocabulary.ts on purpose. The
 * vocabulary file earns its authority by holding only the values several
 * screens have to agree on, and nothing else in the application renders a
 * day part as a customer-facing phrase. Whatever the offer itself says
 * about when it runs is never paraphrased: it comes through verbatim
 * from the offer's own `dayPartNote` and `priceNote` underneath, which
 * is also where a note says whether the timing is published or is this
 * console's own scheduling judgement.
 */
const DAY_PART_LABEL: Record<DayPart, string> = {
  "weekday-daytime": "Weekdays, during the day",
  "weekday-evening": "Weekday evenings",
  weekend: "Weekends",
  "after-close": "Out of hours, nights and weekends",
  any: "Any day of the week",
};

// ---------------------------------------------------------------
// Choosing the offer
// ---------------------------------------------------------------

/**
 * The standing offer to put in front of this organisation.
 *
 * Matched on both axes first: the offer has to be eligible for their
 * service line AND for the family of the shelf row they are being led
 * with. Where nothing satisfies both, the lane match alone is taken
 * rather than showing nothing, because every offer in the file is a
 * genuine thing the division can do for that lane and a page that
 * silently drops the only ask it had is worse than a page that makes a
 * slightly broader one.
 *
 * THE ORDER IN data/venue.ts IS DOING THE RANKING. Sorting here as well
 * would be a second opinion about priority, living in a page, quietly
 * disagreeing with the data the day somebody reorders it.
 */
function offerFor(prospect: Prospect, pkg: EventPackage | undefined): Offer | undefined {
  const both = OFFERS.find(
    (o) =>
      o.eligibleLanes.includes(prospect.lane) &&
      (pkg ? o.eligiblePackageFamilies.includes(pkg.family) : true),
  );
  return both ?? OFFERS.find((o) => o.eligibleLanes.includes(prospect.lane));
}

// ---------------------------------------------------------------
// The two frames
// ---------------------------------------------------------------

/**
 * What the frame around the letter gets to decide.
 *
 * The tag, because the standalone route is the whole document and its
 * sheet is a `main`, while the dialog is rendered over a console that
 * already has one and a second landmark would give a screen reader two
 * mains on one page. The class, because the dialog sizes the sheet to
 * itself and the route lets it float on the ground.
 */
interface SheetShape {
  sheetTag?: "main" | "div";
  sheetClassName?: string;
}

export interface QuoteDocumentProps extends SheetShape {
  /** A row in prospects.ts. An unknown id renders the broken link sheet. */
  prospectId: string;
  /** The package quoted. Falls back to the organisation's lead package. */
  packageId?: string | null;
  /** The door count to open on. Falls back to the modeled midpoint. */
  guests?: number | null;
  /**
   * Whether the hold button writes. False inside a preview, where the
   * press would file a request against an organisation that made none.
   */
  interactive?: boolean;
}

// ---------------------------------------------------------------
// The link is broken
// ---------------------------------------------------------------

/**
 * Short, warm, and with nothing technical in it. No id, no route, no
 * "404", and no apology longer than the fix.
 */
function LinkNotFound({ sheetTag: Sheet = "main", sheetClassName }: SheetShape) {
  return (
    <Sheet className={[styles.sheet, sheetClassName].filter(Boolean).join(" ")}>
      <p className={styles.eyebrow}>{VENUE.name}, partner accounts</p>
      <h1 className={styles.h1}>This link has stopped working</h1>
      <p className={styles.lede}>
        It was written for one organisation and one proposal, and it
        either expired or lost a character somewhere between the email and
        the browser. Nothing has gone wrong at your end.
      </p>
      <p className={styles.body}>
        The quickest way back is to reply to the message this link came in
        on and ask for a fresh one. It takes a minute to reissue and the
        new one will open on your properties rather than on this page.
      </p>
      <section className={styles.section}>
        <h2 className={styles.h2}>Where we are</h2>
        <p className={styles.body}>
          {VENUE.name} is at {VENUE.address}, {VENUE.city} {VENUE.state}{" "}
          {VENUE.postalCode}, and publishes {VENUE.phone} as the number for
          this branch.
        </p>
        <p className={styles.sourceLine}>
          <ProvenanceBadge provenance={VENUE.provenance} />
          <a
            className="tap"
            href={SOURCE_LINKS.breaLocation}
            target="_blank"
            rel="noreferrer"
          >
            The page those details were read from
          </a>
        </p>
      </section>
    </Sheet>
  );
}

// ---------------------------------------------------------------
// The footer this page carries for itself
// ---------------------------------------------------------------

/**
 * The shell's footer and the shell's demo badge do not reach this route,
 * so it carries its own. Both matter more here than anywhere else in the
 * application: this is the only page a person outside the division ever
 * sees, so it is the only page where somebody could mistake a work sample
 * for a communication from a company.
 */
export function QuoteFooter() {
  return (
    <footer className={styles.footer}>
      <p className={styles.demoBadge}>
        <span aria-hidden="true">◈</span>
        <span>
          Demonstration only. Every action on this page writes a row to a
          log inside this browser tab. There is no email transport in this
          build, so nothing is sent to anybody.
        </span>
      </p>
      <p className={styles.disclaimer}>
        An independent work sample by Nathan J. Song, built for an
        application to the Champions Group Holdings posting for a Marketing
        Manager, West Division. Not affiliated with, endorsed by,
        commissioned by or connected to Champions Group Holdings or any of
        its brands. No brand logo, wordmark or trade dress appears anywhere
        in it. Every published figure carries the page it was read from on
        18 August 2026; everything else is labelled as modeled,
        illustrative or entered.
      </p>
    </footer>
  );
}

// ---------------------------------------------------------------
// The letter
// ---------------------------------------------------------------

/**
 * The document, and the whole of it. Both frames render this and neither
 * holds a word of it.
 */
export function QuoteDocument({
  prospectId,
  packageId = null,
  guests: guestsProp = null,
  interactive = true,
  sheetTag: Sheet = "main",
  sheetClassName,
}: QuoteDocumentProps) {
  const outbox = useOutbox();
  const dispatch = useOutboxDispatch();

  const prospect = prospectId ? PROSPECT_BY_ID[prospectId] : undefined;

  /**
   * The package this quote is written against.
   *
   * lib/links.ts writes a `package` parameter onto every proposal link
   * it builds, so a marketer who led with the membership rather than
   * with the account's usual offer has already made that decision.
   * Ignoring the parameter would mean the link they copied out of the
   * compose window and the page the customer opened disagree about what
   * is being discussed, which is a conversation that starts with an
   * apology. The account's own leadPackageId is the fallback and the
   * normal case.
   */
  const pkg = useMemo(() => {
    if (packageId && PACKAGE_BY_ID[packageId]) return PACKAGE_BY_ID[packageId];
    return prospect ? (prospect.leadPackageId ? PACKAGE_BY_ID[prospect.leadPackageId] : undefined) : undefined;
  }, [packageId, prospect]);

  /**
   * The starting door count.
   *
   * The midpoint of the modeled range, or whatever the marketer put in
   * the link. It is a starting point rather than an answer, which is why
   * the field is editable and why the number carries "entered" the
   * moment anybody touches it. A proposal that opens on a blank field
   * asks the reader to do arithmetic before it has told them anything.
   */
  const midpoint = prospect
    ? (groupProfile(prospect)?.mid ?? 0)
    : 0;

  const initialGuests = (() => {
    const fromLink = Number(guestsProp);
    if (Number.isFinite(fromLink) && fromLink > 0) return String(Math.round(fromLink));
    return String(midpoint);
  })();

  const [guestField, setGuestField] = useState(initialGuests);
  const [requested, setRequested] = useState(false);
  const confirmRef = useRef<HTMLElement | null>(null);

  const parsed = Number(guestField);
  const guests =
    Number.isFinite(parsed) && parsed > 0 ? Math.min(Math.round(parsed), 5000) : null;

  const lanes = guests === null ? null : crewSlotsForDoors(guests);
  const total =
    guests !== null && pkg?.pricePerGuest != null ? guests * pkg.pricePerGuest : null;

  /**
   * The row this page wrote, read back out of the outbox.
   *
   * The reducer mints the reference and the id, so the only way to show
   * the customer the reference they were just given is to read the row
   * back. The outbox is newest first and this route dispatches exactly
   * once, so the match is unambiguous.
   */
  const confirmation = requested
    ? outbox.sent.find(
        (m) => m.prospectId === prospect?.id && m.kind === "hold-confirmation",
      )
    : undefined;

  /*
    Focus moves to the confirmation when it appears, because the button
    that had focus is gone by then and a keyboard reader would otherwise
    be dropped at the top of the document with no idea anything happened.
    The panel also carries role="status" so the same news reaches a screen
    reader that is not following focus.
  */
  useEffect(() => {
    if (confirmation) confirmRef.current?.focus();
  }, [confirmation]);

  if (!prospect)
    return <LinkNotFound sheetTag={Sheet} sheetClassName={sheetClassName} />;

  const offer = offerFor(prospect, pkg);
  const family = pkg ? PACKAGE_FAMILY[pkg.family] : undefined;
  const belowMinimum =
    guests !== null && pkg?.minGuests != null && guests < pkg.minGuests;
  const aboveMaximum =
    guests !== null && pkg?.maxGuests != null && guests > pkg.maxGuests;

  function requestHold() {
    if (!prospect || !pkg || guests === null) return;

    /*
      NO SOUND HERE, AND THAT IS A DECISION RATHER THAN AN OVERSIGHT.

      The compose modal plays the send cue when a message leaves, and this
      dispatches the same SEND. The difference is who is holding the
      mouse. Every other screen in this application is the operator's
      console; this page is the letter the PROSPECT reads, rendered at
      their own address, outside the shell, with no rail and no strip.
      There is no sound control on it because there is no chrome on it,
      so a cue fired here would be a noise a stranger cannot switch off.

      If a sound is ever wanted on this page, the control has to arrive
      first.
    */
    dispatch({
      type: "SEND",
      message: {
        sentAt: todayIso(),
        kind: "hold-confirmation",
        prospectId: prospect.id,
        prospectName: prospect.name,
        lane: prospect.lane,
        recipientRole: prospect.decisionMakerTitle,
        subject: `${prospect.name}: terms reserved across ${guests} doors`,
        templateLabel: "Partner proposal page, terms reserved by the organisation",
        body: `${prospect.name} asked for the terms on ${pkg.name} to be held across ${guests} doors, which the console models at ${crewSlotsForDoors(guests)} crew slots on its own ratio of one slot per ${DOORS_PER_CREW_SLOT} doors. That ratio is modelled here and is not published by any brand. They asked off their own page, before anything was signed and before any deposit was taken. Their buying window is ${prospect.buyingWindow}.`,
        packageId: pkg.id,
        guests,
      },
    });
    setRequested(true);
  }

  return (
    <Sheet className={[styles.sheet, sheetClassName].filter(Boolean).join(" ")}>
      {/* -------------------------------------------------------
          WHO THIS IS FOR. Their name, big, and nobody else's.
          ------------------------------------------------------- */}
      <header className={styles.head}>
        <p className={styles.eyebrow}>
          Written for the {prospect.decisionMakerTitle}
        </p>
        <h1 className={styles.h1}>{prospect.name}</h1>
        <p className={styles.lede}>
          {prospect.occasionClass === "calendar-locked"
            ? "Your season is fixed and your operator is not, which is why this arrives now. The contracts worth having are decided in that gap, before the first hot week makes the decision for everybody."
            : "Nothing forces the timing on this one. Somebody at your organisation decides when to move, which means the terms below can be agreed while nothing is broken and nobody is standing in a hot corridor."}
        </p>
      </header>

      {/* -------------------------------------------------------
          WHY THEM. The one sentence that proves this was not a
          mail merge, with the badge that says it is our read.
          ------------------------------------------------------- */}
      <section className={styles.section} aria-labelledby="why-h">
        <h2 className={styles.h2} id="why-h">
          Why we wrote to you and not to a list
        </h2>
        <p className={styles.quote}>{prospect.whyTheyFit}</p>
        <p className={styles.aside}>
          <ProvenanceBadge provenance="modeled" />
          <span>
            That is our reading of your organisation, taken off your own
            published pages rather than from anything you have told us, and
            we would rather show you the working than pretend we knew. If
            it is wrong, say so and we will start from what is actually
            true.
          </span>
        </p>
        <p className={styles.body}>
          We have you down as deciding around{" "}
          <strong>{prospect.buyingWindow}</strong>. If your year runs
          differently, yours is the calendar that matters, not ours.
        </p>
      </section>

      {/* -------------------------------------------------------
          WHO WE ARE AND WHAT IS DATED ABOUT THIS.
          The expiry state is stated before the service list, not
          after it, because burying a deadline under a list of good
          news is how a customer decides you were hoping they would
          not notice.
          ------------------------------------------------------- */}
      <section className={styles.section} aria-labelledby="venue-h">
        <h2 className={styles.h2} id="venue-h">
          Who you would be dealing with
        </h2>

        <div className={styles.notice}>
          <p className={styles.noticeHead}>
            <span aria-hidden="true">◔</span>
            <span>
              {VENUE.openingStatus === "announced"
                ? "Some of the prices below are dated, and the dates are printed with them"
                : "The season has turned and a new campaign is published"}
            </span>
          </p>
          <p className={styles.noticeBody}>
            {VENUE.openingStatus === "announced" ? (
              <>
                We work out of {VENUE.address} in {VENUE.city}. Every price
                on this page was read off our own published page on 18
                August 2026, and where that page prints an expiry it is
                reproduced below rather than left off. You would find that
                out in one search, so you are hearing it here first. It is
                also why this is worth reading now: a campaign price can
                lapse in a fortnight, and what is being proposed to you is
                not a coupon. It is a set of terms across your properties
                that outlasts whatever is on the offers page this month.
              </>
            ) : (
              <>
                We work out of {VENUE.address} in {VENUE.city}, and the
                campaign behind these prices has been renewed, so the
                figures below carry the new dates rather than the old ones.
              </>
            )}
          </p>
          <p className={styles.sourceLine}>
            <ProvenanceBadge provenance={VENUE.provenance} />
            <a
            className="tap"
            href={SOURCE_LINKS.breaLocation}
            target="_blank"
            rel="noreferrer"
          >
              The page these details were read from
            </a>
          </p>
        </div>

        <p className={styles.body}>
          Everything below is published for this branch specifically. The
          division runs services in other territories that this branch does
          not cover, and none of those are on this page.
        </p>

        <ul className={styles.attractions}>
          {VENUE.attractions
            .filter((a) => a.breaSpecific)
            .map((a) => (
              <li key={a.id} className={styles.attraction}>
                <span className={styles.attractionLabel}>{a.label}</span>
                {a.note ? (
                  <span className={styles.attractionNote}>{a.note}</span>
                ) : null}
              </li>
            ))}
        </ul>
      </section>

      {/* -------------------------------------------------------
          THE OFFER. Published inclusions, published terms, and the
          price or the honest absence of one.
          ------------------------------------------------------- */}
      {pkg ? (
        <section className={styles.section} aria-labelledby="pkg-h">
          <h2 className={styles.h2} id="pkg-h">
            The offer we would put you on
          </h2>

          <div className={styles.pkgHead}>
            <PackageGlyph packageId={pkg.id} size={34} />
            <span className={styles.pkgNames}>
              <span className={styles.pkgName}>{pkg.name}</span>
              {family ? (
                <span className={styles.pkgFamily}>
                  {family.label} offer
                </span>
              ) : null}
            </span>
          </div>

          <p className={styles.body}>
            This is what is published as being in it, reproduced rather
            than summarised, with nothing added.
          </p>

          <ul className={styles.inclusions}>
            {pkg.inclusions.map((line) => (
              <li key={line} className={styles.inclusion}>
                <span aria-hidden="true" className={styles.tick}>
                  ◆
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>

          <dl className={styles.terms}>
            <div className={styles.term}>
              <dt className={styles.termLabel}>Smallest portfolio</dt>
              <dd className={styles.termValue}>
                {pkg.minGuests != null ? (
                  <Figure
                    value={`${pkg.minGuests} doors`}
                    provenance={pkg.provenance.minGuests ?? "public"}
                  />
                ) : (
                  <span className={styles.plain}>
                    No minimum is published for this one
                  </span>
                )}
              </dd>
            </div>

            <div className={styles.term}>
              <dt className={styles.termLabel}>Largest portfolio</dt>
              <dd className={styles.termValue}>
                {pkg.maxGuests != null ? (
                  <Figure
                    value={`${pkg.maxGuests} doors`}
                    provenance={pkg.provenance.maxGuests ?? "public"}
                  />
                ) : (
                  <span className={styles.plain}>
                    No maximum is published for this one
                  </span>
                )}
              </dd>
            </div>

            <div className={styles.term}>
              <dt className={styles.termLabel}>When it runs</dt>
              <dd className={styles.termValue}>
                <span className={styles.plain}>
                  {pkg.dayParts.map((d) => DAY_PART_LABEL[d]).join(". ")}
                </span>
              </dd>
            </div>

            {pkg.bookingNoticeDays != null ? (
              <div className={styles.term}>
                <dt className={styles.termLabel}>Notice to schedule</dt>
                <dd className={styles.termValue}>
                  <Figure
                    value={`${pkg.bookingNoticeDays} days`}
                    provenance="modeled"
                  />
                </dd>
              </div>
            ) : null}

            {pkg.depositPercent != null ? (
              <div className={styles.term}>
                <dt className={styles.termLabel}>Deposit on an install</dt>
                <dd className={styles.termValue}>
                  <Figure
                    value={`${pkg.depositPercent}%`}
                    provenance="modeled"
                  />
                </dd>
              </div>
            ) : null}
          </dl>

          {pkg.dayPartNote ? (
            <p className={styles.smallPrint}>{pkg.dayPartNote}</p>
          ) : null}
          {pkg.priceNote ? (
            <p className={styles.smallPrint}>{pkg.priceNote}</p>
          ) : null}

          <p className={styles.sourceLine}>
            <ProvenanceBadge provenance="public" />
            <a
              className="tap"
              href={pkg.source}
              target="_blank"
              rel="noreferrer"
            >
              The page this offer was read from
            </a>
          </p>
        </section>
      ) : null}

      {/* -------------------------------------------------------
          YOUR NUMBERS. One input, and everything that follows
          from it, with the assumption under each line rather than
          in a footnote. Where there is no published price this
          panel says so in a sentence and does not print a total,
          ever.
          ------------------------------------------------------- */}
      <section className={styles.section} aria-labelledby="numbers-h">
        <h2 className={styles.h2} id="numbers-h">
          Your numbers
        </h2>

        <div className={styles.calc}>
          <label className={styles.calcLabel} htmlFor="guests">
            How many doors would this cover?
          </label>
          <input
            id="guests"
            className={`${styles.calcInput} num`}
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={guestField}
            onChange={(e) => setGuestField(e.target.value)}
            aria-describedby="guests-help"
          />
          <p className={styles.calcHelp} id="guests-help">
            It opens on {midpoint}, which is the middle of what we modelled
            for an organisation your size from your own published pages.
            Change it. The estimate is ours and the number is yours.
          </p>

          {guests === null ? (
            <p className={styles.calcEmpty}>
              <span aria-hidden="true">○</span>
              <span>
                Put a number in the box and the rest of this fills in.
              </span>
            </p>
          ) : (
            <div className={styles.calcRows}>
              <div className={styles.calcRow}>
                <span className={styles.calcRowLabel}>Your portfolio</span>
                <span className={styles.calcRowValue}>
                  <Figure value={`${guests} doors`} provenance="user_input" />
                </span>
              </div>

              <div className={styles.calcRow}>
                <span className={styles.calcRowLabel}>Crew slots a season</span>
                <span className={styles.calcRowValue}>
                  <Figure value={`${lanes} slots`} provenance="modeled" />
                </span>
                <span className={styles.calcRowNote}>
                  Modelled at one crew slot for every{" "}
                  {DOORS_PER_CREW_SLOT} doors, rounded up, because
                  nobody can send part of a truck. That ratio is ours and is
                  not published by anybody; the only crew figure published
                  anywhere in the group is more than 1,800 field technicians
                  across all brands. If your buildings run older equipment
                  than most, the real number is higher and we would rather
                  find that out on a walk than on a spreadsheet.
                </span>
              </div>

              <div className={styles.calcRow}>
                <span className={styles.calcRowLabel}>
                  {pkg?.pricePerGuest != null ? "Per door" : "The price"}
                </span>
                <span className={styles.calcRowValue}>
                  {pkg?.pricePerGuest != null ? (
                    <Figure
                      value={usd.format(pkg.pricePerGuest)}
                      provenance={pkg.provenance.pricePerGuest ?? "public"}
                    />
                  ) : (
                    <WithheldFigure
                      reason={
                        <>
                          The page this offer sits on gives a phone number
                          where the price should be. So there is no figure
                          here and there is not going to be an invented one.
                          What a person needs from you to give you a real
                          one is below, and it is short.
                        </>
                      }
                    />
                  )}
                </span>
              </div>

              {total !== null ? (
                <div className={styles.calcRow} data-lead="true">
                  <span className={styles.calcRowLabel}>
                    {guests} doors, at full take-up, before tax
                  </span>
                  <span className={styles.calcRowValue}>
                    <Figure value={usd.format(total)} provenance="modeled" />
                  </span>
                  <span className={styles.calcRowNote}>
                    Your door count multiplied by the published price of the
                    offer above. It carries "modeled" because the
                    multiplication is ours even though both numbers in it
                    are real, and because it stands on one assumption worth
                    saying out loud: that every door takes it up. No
                    campaign ever achieves that, so read this as a ceiling
                    rather than as a forecast. Tax is not in it.
                  </span>
                </div>
              ) : (
                <div className={styles.calcRow} data-lead="true">
                  <span className={styles.calcRowLabel}>
                    {guests} doors, in total
                  </span>
                  <span className={styles.calcRowValue}>
                    <span className={styles.plain}>
                      This total comes from a conversation, not from a page
                    </span>
                  </span>
                  <span className={styles.calcRowNote}>
                    We could put a plausible number here and you would find
                    out it was invented at the worst possible moment. To
                    price this properly a person needs four things: how many
                    doors, roughly how old the equipment in them is, whether
                    out-of-hours cover is in or out, and what the budget has
                    to land under. That is the whole list, and it is one
                    short call.
                  </span>
                </div>
              )}
            </div>
          )}

          {belowMinimum && pkg?.minGuests != null ? (
            <p className={styles.flag}>
              <span aria-hidden="true">▲</span>
              <span>
                <strong>Under the published minimum.</strong> The published
                minimum on {pkg.name} is {pkg.minGuests} doors. A smaller
                portfolio is not a closed door, it is a different offer, and
                there are several.
              </span>
            </p>
          ) : null}

          {aboveMaximum && pkg?.maxGuests != null ? (
            <p className={styles.flag}>
              <span aria-hidden="true">▲</span>
              <span>
                <strong>Over the published maximum.</strong> The published
                maximum on {pkg.name} is {pkg.maxGuests} doors. At your size
                the conversation is about a portfolio agreement rather than
                about an offer, and that is a better conversation to have
                early.
              </span>
            </p>
          ) : null}
        </div>
      </section>

      {/* -------------------------------------------------------
          THE ASK. What can honestly be put on the table before
          anything is signed: priority, a written response window,
          and terms that do not lapse with a campaign. The
          division's internal reasoning about why that is good for
          the division stays on the internal screens.
          ------------------------------------------------------- */}
      {offer ? (
        <section className={styles.section} aria-labelledby="offer-h">
          <h2 className={styles.h2} id="offer-h">
            What we can do for you now
          </h2>
          <div className={styles.offer}>
            <p className={styles.offerName}>{offer.name}</p>
            <p className={styles.offerWhat}>{offer.what}</p>
            {offer.costToVenue === 0 ? (
              <p className={styles.offerCost}>
                <span aria-hidden="true">◆</span>
                <span>
                  There is no deposit and no fee attached to this. Agreeing
                  it costs you nothing and commits you to no work at all.
                  What it buys is the boring version of a bad week: a
                  written response window, a named route in, and a price
                  that does not move when the campaign on our offers page
                  lapses.
                  {pkg?.depositPercent != null ? (
                    <>
                      {" "}
                      The {pkg.depositPercent}% deposit modelled above
                      belongs to a scheduled installation, and nothing here
                      is one yet.
                    </>
                  ) : null}
                </span>
              </p>
            ) : null}
            <p className={styles.sourceLine}>
              <ProvenanceBadge provenance={offer.provenance} />
              <span className={styles.sourceNote}>
                {offer.provenance === "public"
                  ? "The terms in this offer are published on the brand's own page."
                  : "This offer was written for a work sample. It is not a published programme of any brand and nobody has agreed to it."}
              </span>
            </p>
          </div>
        </section>
      ) : (
        <section className={styles.section} aria-labelledby="offer-h">
          <h2 className={styles.h2} id="offer-h">
            What we can do for you now
          </h2>
          <p className={styles.body}>
            There is no standing programme written for an organisation like
            yours, so rather than dress one up, here is the plain version:
            the terms above can be put in writing for your properties, they
            cost nothing to agree, and the fastest way to test them is one
            out-of-hours call before anything is signed.
          </p>
        </section>
      )}

      {/* -------------------------------------------------------
          ONE ACTION. It changes the page rather than opening an
          alert, and the confirmation says what actually happened
          rather than what a real system would have done.
          ------------------------------------------------------- */}
      <section className={styles.section} aria-labelledby="action-h">
        <h2 className={styles.h2} id="action-h">
          {confirmation ? "What just happened" : "The one thing to do next"}
        </h2>

        {confirmation ? (
          <section
            className={styles.confirm}
            role="status"
            tabIndex={-1}
            ref={confirmRef}
            aria-labelledby="confirm-h"
          >
            <p className={styles.confirmHead} id="confirm-h">
              <span aria-hidden="true">●</span>
              <span>Written down and nothing sent</span>
            </p>
            <p className={styles.confirmBody}>
              A row was added to a demonstration outbox that lives inside
              this browser tab. No email left this page, because this build
              has no way to send one. In a live version of this, the
              marketing manager for the division would see the request
              against your name the same morning.
            </p>
            <dl className={styles.confirmRows}>
              <div className={styles.confirmRow}>
                <dt>Reference</dt>
                <dd className="num">{confirmation.reference}</dd>
              </div>
              <div className={styles.confirmRow}>
                <dt>Written</dt>
                <dd className="num">{formatDate(confirmation.sentAt)}</dd>
              </div>
              <div className={styles.confirmRow}>
                <dt>Held across</dt>
                <dd>
                  <span className="num">{confirmation.guests}</span> doors on{" "}
                  {pkg ? pkg.name : "the offer above"}
                </dd>
              </div>
              <div className={styles.confirmRow}>
                <dt>Addressed to</dt>
                <dd className="num">{DEMO_RECIPIENT}</dd>
              </div>
            </dl>
            <p className={styles.confirmFoot}>
              That address ends in .invalid, which is reserved so that it can
              never reach anybody. It is there so the demonstration has a real
              recipient to show you and no possible route to a person.
            </p>
          </section>
        ) : (
          <>
            <p className={styles.body}>
              Ask us to hold these terms for your properties. It takes one
              press, it commits you to no work and no money, and it fixes
              the numbers above while the campaign they came from is still
              running.
            </p>
            <Button
              variant="primary"
              glyph="◕"
              className={styles.cta}
              onClick={requestHold}
              disabled={!interactive || guests === null || !pkg}
            >
              Hold these terms for{" "}
              {guests === null ? "our properties" : `${guests} doors`}
            </Button>
            <p className={styles.ctaNote}>
              {interactive
                ? "Pressing this writes a row to a demonstration outbox inside this browser tab. Nothing is emailed to anybody, here or anywhere else."
                : "Theirs to press. Held back in a preview so the outbox carries no request they did not make."}
            </p>
          </>
        )}
      </section>
    </Sheet>
  );
}

// ---------------------------------------------------------------
// The customer facing frame
// ---------------------------------------------------------------

/**
 * The route. A ground, the letter on it, and the brand's own footer under
 * it. No shell, no rail, no strip, and nothing here that would let a
 * reader step sideways into the console.
 */
export function QuotePage() {
  const { prospectId } = useParams();
  const [search] = useSearchParams();

  const fromLink = Number(search.get("guests"));

  return (
    <div className={styles.page}>
      <QuoteDocument
        prospectId={prospectId ?? ""}
        packageId={search.get("package")}
        guests={Number.isFinite(fromLink) && fromLink > 0 ? fromLink : null}
      />
      <QuoteFooter />
    </div>
  );
}
