import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import type { DayPart, EventPackage, Offer, Prospect } from "@/domain/types";
import { PROSPECT_BY_ID } from "@/data/prospects";
import { PACKAGE_BY_ID } from "@/data/packages";
import { DEMO_RECIPIENT, OFFERS, VENUE } from "@/data/venue";
import { GUESTS_PER_BOWLING_LANE, lanesForGuests } from "@/domain/lanes";
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
 * explaining before anything else. An activities director opens this link
 * from an email on a phone between two class periods. They have no
 * business seeing the venue's internal navigation, the desk that ranked
 * them, the score that put them where they are on it, or the capacity
 * chart showing which December dates are nearly gone. Showing any of that
 * would be the digital equivalent of handing a customer your call sheet:
 * it tells them they are a row, it tells them what leverage you think you
 * have, and it invites them to argue with an arithmetic that was never
 * built for their eyes.
 *
 * So App.tsx mounts this route above the shell rather than inside it, and
 * this page carries its own frame, its own footer, its own disclaimer and
 * its own demo badge. Do not wrap it. The absence of chrome IS the
 * feature.
 *
 * ----- ONE DOCUMENT, TWO FRAMES --------------------------------------
 *
 * `QuoteDocument` is the letter itself and it holds every word, figure
 * and provenance badge on it. Two frames render it and neither owns a
 * copy:
 *
 *   /quote/:prospectId            the frame below, prospect facing
 *   QuotePreviewModal             a dialog over the console, for a rep
 *
 * The split is a component boundary rather than a duplicated page for
 * the obvious reason and for a less obvious one. The obvious one is that
 * a preview which drifts from the page it previews is worse than no
 * preview. The less obvious one is provenance: every badge, every
 * withheld price and every published source link is written once, so
 * there is no second copy for somebody to quietly simplify.
 *
 * The dialog passes `interactive={false}`, which is the ONLY difference
 * between the two renderings. The hold button on the prospect's page
 * writes a row against their name, and a rep pressing it inside a
 * preview would be filing a request the organisation never made.
 *
 * ----- WHAT IS DELIBERATELY NOT ON THIS PAGE --------------------------
 *
 * No pitch status, because "reached out" is a fact about us. No lane
 * chip, because the reader is not a category. No LaneChip and no
 * FamilyChip either, and the second one is the interesting refusal: the
 * family chip is a fine component whose tooltip reads "gated behind a
 * local sales manager, this family is the reason the role exists". True,
 * useful on the packages board, and exactly the sentence you do not want
 * a customer to hover into. The package family is still named here, in
 * plain words, beside its decorative mark.
 *
 * There is also no second call to action. One page, one organisation, one
 * decision, one button. A quote with a "download the brochure" beside a
 * "talk to a specialist" beside a "hold a date" is a page that has not
 * decided what it wants, and the reader resolves that ambiguity by
 * closing the tab.
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
 * top, that Main Event has published no opening date. A prospect finds
 * that out within one search either way, and hearing it from us first is
 * the entire relationship.
 *
 * ----- WHY THE UNKNOWN ID GETS A REAL PAGE ---------------------------
 *
 * Links get truncated by mail clients, forwarded with a character
 * missing, and pasted into group chats that eat the last few letters. A
 * blank screen or a stack trace at that moment reads as a broken company
 * rather than a broken link, and the person holding the phone is a buyer
 * we have already spent a go-see on. So an unrecognised id renders a
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
 * day part as a customer-facing phrase. The published restriction itself
 * is never paraphrased: it comes through verbatim from the package's own
 * `dayPartNote` and `priceNote` underneath.
 */
const DAY_PART_LABEL: Record<DayPart, string> = {
  "weekday-daytime": "Weekdays, during the day",
  "weekday-evening": "Weekday evenings",
  weekend: "Weekends",
  "after-close": "After the building closes for the night",
  any: "Any day of the week",
};

// ---------------------------------------------------------------
// Choosing the offer
// ---------------------------------------------------------------

/**
 * The pre-opening offer to put in front of this organisation.
 *
 * Matched on both axes first: the offer has to be eligible for their lane
 * AND for the family of the package they are being led with. Where
 * nothing satisfies both, the lane match alone is taken rather than
 * showing nothing, because every offer in the file is a genuine thing the
 * venue can do for that lane and a page that silently drops the only ask
 * it had is worse than a page that makes a slightly broader one.
 *
 * THE ORDER IN data/venue.ts IS DOING THE RANKING, which is why "first
 * fifty on the calendar" comes out for almost everybody. It is first in
 * that file because it is the offer that answers the objection nobody
 * gets past before a venue opens: no one will pay a deposit against a
 * date that does not exist. Sorting here as well would be a second
 * opinion about priority, living in a page, quietly disagreeing with the
 * data the day somebody reorders it.
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
  /** The headcount to open on. Falls back to the modeled midpoint. */
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
      <p className={styles.eyebrow}>Main Event Brea, group events</p>
      <h1 className={styles.h1}>This link has stopped working</h1>
      <p className={styles.lede}>
        It was written for one organisation and one event, and it either
        expired or lost a character somewhere between the email and the
        browser. Nothing has gone wrong at your end.
      </p>
      <p className={styles.body}>
        The quickest way back is to reply to the message this link came in on
        and ask for a fresh one. It takes a minute to reissue and the new one
        will open on your event rather than on this page.
      </p>
      <section className={styles.section}>
        <h2 className={styles.h2}>Where the building is</h2>
        <p className={styles.body}>
          {VENUE.name} is at {VENUE.address}, {VENUE.city} {VENUE.state}{" "}
          {VENUE.postalCode}. Main Event publishes {VENUE.phone} for this
          location.
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
 * application: this is the only page a person outside the venue ever
 * sees, so it is the only page where somebody could mistake a work sample
 * for a communication from a company.
 */
export function QuoteFooter() {
  return (
    <footer className={styles.footer}>
      <p className={styles.demoBadge}>
        <span aria-hidden="true">◈</span>
        <span>
          Demo mode. Every action on this page writes a row to a log inside
          this browser tab. There is no email transport in this build, so
          nothing is sent to anybody.
        </span>
      </p>
      <p className={styles.disclaimer}>
        An independent work sample by Nathan J. Song, built for a Main Event
        Brea Sales Manager application. Not affiliated with, endorsed by or
        connected to Main Event Entertainment. No Main Event logo, wordmark or
        trade dress appears anywhere in it. Every published figure carries the
        page it was read from on 11 August 2026; everything else is labelled as
        modeled, illustrative or entered.
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
   * lib/links.ts writes a `package` parameter onto every quote link it
   * builds, so a rep who quoted the meeting package rather than the lead
   * package has already made that decision. Ignoring the parameter would
   * mean the link they copied out of the compose window and the page the
   * customer opened disagree about what is being discussed, which is a
   * conversation that starts with an apology. The prospect's own
   * leadPackageId is the fallback and the normal case.
   */
  const pkg = useMemo(() => {
    if (packageId && PACKAGE_BY_ID[packageId]) return PACKAGE_BY_ID[packageId];
    return prospect ? PACKAGE_BY_ID[prospect.leadPackageId] : undefined;
  }, [packageId, prospect]);

  /**
   * The starting headcount.
   *
   * The midpoint of the modeled range, or whatever the rep put in the
   * link. It is a starting point rather than an answer, which is why the
   * field is editable and why the number carries "entered" the moment
   * anybody touches it. A quote page that opens on a blank field asks the
   * reader to do arithmetic before it has told them anything.
   */
  const midpoint = prospect
    ? Math.round((prospect.headcountLow + prospect.headcountHigh) / 2)
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

  const lanes = guests === null ? null : lanesForGuests(guests);
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

    dispatch({
      type: "SEND",
      message: {
        sentAt: todayIso(),
        kind: "hold-confirmation",
        prospectId: prospect.id,
        prospectName: prospect.name,
        lane: prospect.lane,
        recipientRole: prospect.decisionMakerTitle,
        subject: `${prospect.name}: a date held for ${guests} guests`,
        templateLabel: "Group quote page, hold requested by the organisation",
        body: `${prospect.name} asked for a date to be held on the ${pkg.name} for ${guests} guests, which is ${lanesForGuests(guests)} bowling lanes at Main Event's published one lane per twenty guests. They asked off their own page, before there is an opening date to book against, which is the earliest anybody can ask. No deposit is taken and no day is named yet; the hold converts or releases the day the date is published. Their window is ${prospect.buyingWindow}.`,
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
            ? "Your date is fixed and the venue is not, which is why this arrives now. The venues worth having are chosen in that gap, and this one has an empty calendar in it."
            : "No calendar decides this one. Somebody at your organisation picks the night, which means you can pick from every night there is, because nothing here is booked yet."}
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
            That is our reading of your organisation rather than something
            you have told us, and we would rather show you the working than
            pretend we knew. If it is wrong, say so and we will start from
            what is actually true.
          </span>
        </p>
        <p className={styles.body}>
          We have you down as buying around{" "}
          <strong>{prospect.buyingWindow}</strong>. If your year runs
          differently, yours is the calendar that matters, not ours.
        </p>
      </section>

      {/* -------------------------------------------------------
          WHAT THE BUILDING IS, AND WHAT IT IS NOT YET.
          The opening state is stated before the attractions, not
          after them, because burying it under a list of good news
          is how a customer decides you were hoping they would not
          notice.
          ------------------------------------------------------- */}
      <section className={styles.section} aria-labelledby="venue-h">
        <h2 className={styles.h2} id="venue-h">
          What Main Event Brea is
        </h2>

        <div className={styles.notice}>
          <p className={styles.noticeHead}>
            <span aria-hidden="true">◔</span>
            <span>
              {VENUE.openingStatus === "announced"
                ? "The opening date is not public yet, and the calendar behind it is empty"
                : "An opening date has been published"}
            </span>
          </p>
          <p className={styles.noticeBody}>
            {VENUE.openingStatus === "announced" ? (
              <>
                The building is at {VENUE.address} in {VENUE.city}. Main
                Event has published the address, the phone number and the
                attractions below. It has not published hours and it has not
                published a day it opens, and you would find that out in one
                search, so you are hearing it here first. It is also the
                reason this is worth reading now: nothing in the opening
                months is booked, so the date is yours to choose rather than
                whatever is left, and nothing on this page asks you for money
                against a date nobody can name.
              </>
            ) : (
              <>
                The building is at {VENUE.address} in {VENUE.city}, and a
                public opening date now exists, which means a date can be
                held against it properly.
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
              Main Event's own page for Brea
            </a>
          </p>
        </div>

        <p className={styles.body}>
          Everything below is published for Brea specifically. Main Event
          runs attractions at other venues that this one has not announced,
          and none of those are on this page.
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
          THE PACKAGE. Published inclusions, published terms, and
          the price or the honest absence of one.
          ------------------------------------------------------- */}
      {pkg ? (
        <section className={styles.section} aria-labelledby="pkg-h">
          <h2 className={styles.h2} id="pkg-h">
            The package we would put you on
          </h2>

          <div className={styles.pkgHead}>
            <PackageGlyph packageId={pkg.id} size={34} />
            <span className={styles.pkgNames}>
              <span className={styles.pkgName}>{pkg.name}</span>
              {family ? (
                <span className={styles.pkgFamily}>
                  {family.label} package
                </span>
              ) : null}
            </span>
          </div>

          <p className={styles.body}>
            This is what Main Event publishes as being in it. Not a summary
            of it, and nothing added to it.
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
              <dt className={styles.termLabel}>Smallest group</dt>
              <dd className={styles.termValue}>
                {pkg.minGuests != null ? (
                  <Figure
                    value={`${pkg.minGuests} guests`}
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
              <dt className={styles.termLabel}>Largest group</dt>
              <dd className={styles.termValue}>
                {pkg.maxGuests != null ? (
                  <Figure
                    value={`${pkg.maxGuests} guests`}
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
                <dt className={styles.termLabel}>Notice to book</dt>
                <dd className={styles.termValue}>
                  <Figure
                    value={`${pkg.bookingNoticeDays} days`}
                    provenance="public"
                  />
                </dd>
              </div>
            ) : null}

            {pkg.depositPercent != null ? (
              <div className={styles.term}>
                <dt className={styles.termLabel}>Deposit to reserve</dt>
                <dd className={styles.termValue}>
                  <Figure
                    value={`${pkg.depositPercent}%`}
                    provenance="public"
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
              The page this package was read from
            </a>
          </p>
        </section>
      ) : null}

      {/* -------------------------------------------------------
          YOUR NUMBERS. One input, and everything that follows
          from it. Where there is no published price this panel
          says so in a sentence and does not print a total, ever.
          ------------------------------------------------------- */}
      <section className={styles.section} aria-labelledby="numbers-h">
        <h2 className={styles.h2} id="numbers-h">
          Your numbers
        </h2>

        <div className={styles.calc}>
          <label className={styles.calcLabel} htmlFor="guests">
            How many people are you bringing?
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
            It opens on {midpoint}, which is the middle of what we guessed
            for an organisation your size. Change it. The guess is ours and
            the number is yours.
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
                <span className={styles.calcRowLabel}>Your group</span>
                <span className={styles.calcRowValue}>
                  <Figure value={`${guests} guests`} provenance="user_input" />
                </span>
              </div>

              <div className={styles.calcRow}>
                <span className={styles.calcRowLabel}>Bowling lanes held</span>
                <span className={styles.calcRowValue}>
                  <Figure value={`${lanes} lanes`} provenance="modeled" />
                </span>
                <span className={styles.calcRowNote}>
                  Main Event publishes one lane for every{" "}
                  {GUESTS_PER_BOWLING_LANE} guests, and publishes more than 26
                  lanes for Brea. The arithmetic is theirs; we have only
                  rounded up, because nobody can hold part of a lane.
                </span>
              </div>

              <div className={styles.calcRow}>
                <span className={styles.calcRowLabel}>
                  {pkg?.pricePerGuest != null ? "Per guest" : "The price"}
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
                          Main Event's page for this package tells you to
                          speak to the sales manager at the venue. So there
                          is no number here and there is not going to be an
                          invented one. What that person needs from you is
                          below, and it is short.
                        </>
                      }
                    />
                  )}
                </span>
              </div>

              {total !== null ? (
                <div className={styles.calcRow} data-lead="true">
                  <span className={styles.calcRowLabel}>
                    {guests} guests, before tax and fees
                  </span>
                  <span className={styles.calcRowValue}>
                    <Figure value={usd.format(total)} provenance="modeled" />
                  </span>
                  <span className={styles.calcRowNote}>
                    Your number multiplied by Main Event's published
                    per-guest price. It carries "modeled" because the
                    multiplication is ours even though both numbers in it are
                    real, and because tax and service fees are not in it.
                  </span>
                </div>
              ) : (
                <div className={styles.calcRow} data-lead="true">
                  <span className={styles.calcRowLabel}>
                    {guests} guests, in total
                  </span>
                  <span className={styles.calcRowValue}>
                    <span className={styles.plain}>
                      This total comes from a conversation, not from a page
                    </span>
                  </span>
                  <span className={styles.calcRowNote}>
                    We could put a plausible number here and you would find
                    out it was invented at the worst possible moment. To
                    quote this properly a person needs four things: your
                    headcount, whether you want a weekday or an evening,
                    whether food is in or out, and roughly what the budget
                    has to land under. That is the whole list, and it is one
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
                <strong>Under the published minimum.</strong> Main Event
                publishes {pkg.minGuests} guests as the smallest group for the{" "}
                {pkg.name}. A smaller group is not a closed door, it is a
                different package, and there are several.
              </span>
            </p>
          ) : null}

          {aboveMaximum && pkg?.maxGuests != null ? (
            <p className={styles.flag}>
              <span aria-hidden="true">▲</span>
              <span>
                <strong>Over the published maximum.</strong> Main Event
                publishes {pkg.maxGuests} guests as the largest group for the{" "}
                {pkg.name}. At your size the conversation is about more of
                the building rather than more of the package, and that is a
                better conversation to have early.
              </span>
            </p>
          ) : null}
        </div>
      </section>

      {/* -------------------------------------------------------
          THE OFFER. What can honestly be put on the table by a
          venue that has not opened: priority and certainty, both
          of which cost nothing precisely because the calendar is
          empty. The venue's internal reasoning about WHY that is
          good for the venue stays on the internal screens.
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
                  There is no deposit and no fee attached to this. Holding a
                  date costs you nothing, and until Main Event publishes an
                  opening day there is nothing here for you to be committed
                  to. What it does buy is position: every date held is one
                  nobody else can take.
                  {pkg?.depositPercent != null ? (
                    <>
                      {" "}
                      The {pkg.depositPercent}% deposit published above
                      belongs to a confirmed booking, and a held date is not
                      one yet.
                    </>
                  ) : null}
                </span>
              </p>
            ) : null}
            <p className={styles.sourceLine}>
              <ProvenanceBadge provenance={offer.provenance} />
              <span className={styles.sourceNote}>
                {offer.provenance === "public"
                  ? "The terms in this offer are published by Main Event."
                  : "This offer was written for a work sample and is not a published Main Event programme."}
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
            There is no standing pre-opening programme written for an
            organisation like yours, so rather than dress one up, here is the
            plain version: the calendar is empty, you can have first pick of
            it, and it costs nothing to ask.
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
              has no way to send one. In a live version of this, the sales
              manager at Brea would see the request against your name the
              same morning.
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
                <dt>Held for</dt>
                <dd>
                  <span className="num">{confirmation.guests}</span> guests on
                  the {pkg ? pkg.name : "package above"}
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
              Ask us to hold a date. Nothing in the opening months is taken,
              so first pick is real right now. It takes one press and commits
              you to nothing until there is an opening date to commit to.
            </p>
            <Button
              variant="primary"
              glyph="◕"
              className={styles.cta}
              onClick={requestHold}
              disabled={!interactive || guests === null || !pkg}
            >
              Hold a date for {guests === null ? "our group" : `${guests} guests`}
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
// The prospect facing frame
// ---------------------------------------------------------------

/**
 * The route. A ground, the letter on it, and the venue's own footer
 * under it. No shell, no rail, no strip, and nothing here that would let
 * a reader step sideways into the console.
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
