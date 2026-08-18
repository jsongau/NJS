import { Link } from "react-router-dom";
import { PROSPECTS } from "@/data/prospects";
import { RATIONALE_AVAILABLE, SCREEN_RATIONALE } from "@/data/rationale";
import { VENUE } from "@/data/venue";
import styles from "./StartPage.module.css";

/**
 * START. The door, and the only screen here written for somebody who has
 * never seen this application before.
 *
 * ── THE PROBLEM IT SOLVES ─────────────────────────────────────────
 * This address travels by being pasted into a job application. The
 * person who opens it is a hiring manager who runs local marketing for
 * home services in Southern California, with a stack of other tabs and
 * something like ninety seconds of patience. Until this file existed the
 * link put them straight onto the desk: a rail of twenty odd
 * destinations, a board of a couple of hundred organisations, and no
 * sentence anywhere saying what they were looking at or why a division
 * that already has agencies needs any of it. The work was doing the
 * arguing and the work is dense. Dense is correct for the eighth day and
 * wrong for the first ninety seconds.
 *
 * ── WHY IT IS OUTSIDE THE SHELL ───────────────────────────────────
 * On the same precedent as the proposal letter. The console is a room
 * for one person doing a job, and everything in it, the rail, the
 * counts, the period selector, is addressed to that person. This page is
 * addressed to a visitor. Putting a visitor's letter inside the
 * operator's room means the first thing they read is surrounded by
 * twenty destinations telling them they are late to something.
 *
 * It is also why there is no rail row for it. The rail is every screen
 * somebody working the desk uses, and a door is not one of those. A
 * reader arrives here because the URL they were given ends in /start,
 * and they leave through the one control at the bottom.
 *
 * ── EVERY FIGURE ON IT IS DERIVED ─────────────────────────────────
 * The organisation count and the screen count are read off the data and
 * the explanation set, not typed. This page exists to make a claim about
 * rigour and the fastest way to lose that argument is a hardcoded number
 * on the first screen that goes stale the way every other hardcoded
 * number in this codebase already did once.
 *
 * ── WHAT IT DELIBERATELY DOES NOT DO ──────────────────────────────
 * It does not sell. There is no headline about a passion for home
 * services and no list of competencies. It says what the thing is, who
 * built it, what is real in it, what is not, and where to press. A
 * reader who wants the pitch can read the cover letter; a reader who
 * opened a link marked work sample wants the work.
 */
export function StartPage() {
  /* Derived, for the reason in the head comment. */
  const organisations = PROSPECTS.length;
  const explained = SCREEN_RATIONALE.length;

  return (
    /*
      data-sec="none" IS NOT DECORATION, IT IS WHAT MAKES THE COLOURS
      EXIST. sections.css scopes --sec, --sec-ink and --sec-glow to the
      [data-sec] attribute selector, so a page outside the shell has none
      of them and every rule declared as var(--sec) renders as nothing:
      the heading rules vanish and the one button on the page loses its
      background. It shipped that way for exactly one screenshot.

      "none" rather than borrowing a screen's hue, and the shell writes
      the same word on an unmatched path. A door is not one of the twenty
      three places in this product, and the base block answers with the
      editorial signal colour, which is the right ink for the one control
      a visitor is meant to press.
    */
    <div className={styles.page} data-sec="none">
      <main className={styles.wrap}>
        <header className={styles.mast}>
          <p className={styles.kicker}>An independent work sample</p>
          <h1 className={styles.title}>The Territory Book</h1>
          <p className={styles.standfirst}>
            A working local marketing console for the West Division
            brands of Champions Group Holdings, built by one person as
            part of an application for Marketing Manager, West Division,
            based in Brea. The brand it is pointed at is {VENUE.name}.
          </p>
        </header>

        {/*
          THE DISCLOSURE IS ABOVE THE FOLD AND NOT IN A FOOTER.

          This application deliberately resembles internal software. A
          reader who scrolls past a resemblance and finds the disclosure
          at the bottom has already spent a minute with the wrong idea in
          their head, and the correction reads as a retraction rather
          than as a frame. It costs four lines here and it buys the
          reader's trust for everything under it.
        */}
        <p className={styles.flag}>
          Built by Nathan J. Song as an unaffiliated work sample for the
          Champions Group Holdings posting for a Marketing Manager, West
          Division. It is not affiliated with, endorsed by, commissioned
          by or connected to Champions Group Holdings or any of its
          brands, and no part of it was built with access to their
          systems, their data or their people. Everything in it was
          assembled from published pages by one person from outside the
          company. Brand names appear only to identify whose published
          page a figure was read from. Every published figure carries a
          source and a date; every seeded row is illustrative and says so
          on screen.
        </p>

        <section className={styles.block}>
          <h2 className={styles.h2}>What the problem actually is</h2>
          <p>
            The posting asks for local marketing initiatives across an
            assigned brand: demand generation, campaign execution,
            agency work on paid search and local service ads, weekly
            reporting to the division, and a budget framed in its own
            words as driving incremental phone calls and web leads. Five
            brands, five counties, and a division that deliberately sits
            behind them, because not one of the five brand sites mentions
            Champions Group anywhere.
          </p>
          <p>
            So this is not a CRM with sample data in it. It is an answer
            to one question asked every Monday morning, which is where the
            next call comes from and why that and not something else.
          </p>
        </section>

        <section className={styles.block}>
          <h2 className={styles.h2}>What is real in it, and what is not</h2>
          <p>
            The {organisations} organisations are real, and each one was
            found by opening its own published page and reading what was
            there. Where an email address is on the board, the row carries
            the URL it was read off. Nothing was guessed from a domain
            name. Every offer price on the shelf, every membership figure,
            every rebate amount and every expiry date was read off the
            brand's or the utility's own page on 18 August 2026 and
            carries that page as a link.
          </p>
          <p>
            The week itself is not real. No conversation in it happened,
            no counterparty in it is a person, every address ends in
            .invalid so that it can never reach anybody, and every seeded
            row is drawn as illustrative. Every figure in the application
            carries one of six labels saying where it came from, from{" "}
            <strong>public</strong> at one end to{" "}
            <strong>illustrative</strong> and <strong>withheld</strong> at
            the other, and a number a brand has not published is drawn as
            withheld rather than filled in with a plausible one.
          </p>
          <p className={styles.last}>
            That rule is the actual argument of this piece. Anybody can
            build a screen. The harder discipline is a screen that says
            out loud which of its own numbers you should not rely on.
          </p>
        </section>

        <section className={styles.block}>
          <h2 className={styles.h2}>Three places worth ninety seconds</h2>
          <p className={styles.lede}>
            If you only open one, open the first.
          </p>

          <ol className={styles.doors}>
            <li>
              <Link className={styles.door} to="/today">
                <span className={styles.doorLabel}>Today</span>
                <span className={styles.doorNote}>
                  The screen that answers what to do next, ranked, with the
                  reason on every line. A queue that says call a property
                  manager is a list; a queue that says call this one
                  because the summer campaign expires on 31 August and
                  nothing has been published to replace it is a briefing.
                </span>
              </Link>
            </li>
            <li>
              <Link className={styles.door} to="/map">
                <span className={styles.doorLabel}>Maps</span>
                <span className={styles.doorNote}>
                  Every organisation in the book, plotted from its own
                  published coordinates, with what each one costs in hours
                  rather than in dollars. The rings are straight line
                  distance and say so, because they are not drive times and
                  a reader planning a morning deserves to know that.
                </span>
              </Link>
            </li>
            <li>
              <Link className={styles.door} to="/method">
                <span className={styles.doorLabel}>Method</span>
                <span className={styles.doorNote}>
                  Every formula and every source, including the things the
                  research could not stand behind and left out. This is the
                  screen to open if you want to know whether the rest of it
                  is honest.
                </span>
              </Link>
            </li>
          </ol>
        </section>

        {/* Only while the second reading is open. This section is the
            only place on the front door that promises it, and a promise
            the application will not keep is the one thing a work sample
            cannot afford. */}
        {RATIONALE_AVAILABLE && (
        <section className={styles.block}>
          <h2 className={styles.h2}>There are two ways to read it</h2>
          <p>
            Every screen has a second address with{" "}
            <code className={styles.code}>/rationale</code> in front of it,
            and there is a switch on the bar. Console shows you the
            instrument. Rationale shows you the argument for why that
            instrument is shaped that way: what it is for, what was tried
            first, what was thrown away and what it still cannot do.
          </p>
          <p className={styles.last}>
            {explained} screens are written up that way. The navigation is
            identical in both, so pressing the switch never loses your
            place. If you are assessing judgement rather than output, that
            is the half to read.
          </p>
        </section>
        )}

        <section className={styles.block}>
          <h2 className={styles.h2}>The one finding to argue with</h2>
          <p className={styles.last}>
            Thirteen competing brands were read across the five counties
            on 18 August 2026. Not one of them publishes what its
            membership costs. Eight name a club and hide the number,
            forcing a phone call to learn the price of their own plan,
            and five publish no plan at all. Two brands in the whole
            reading publish a monthly figure openly and both of them are
            Champions brands, ASI Hastings at 19.95 a month and Timo's at
            15 a month or 189 a year. A household can compare six drain
            prices in ninety seconds and cannot compare a single
            maintenance plan. Most of the screens here end up pointing at
            that gap, and the offer shelf says so in as many words.
          </p>
        </section>

        <section className={styles.block}>
          <h2 className={styles.h2}>It has a sound, and one press turns
            it off</h2>
          <p className={styles.last}>
            The console answers when you press things. Nothing plays while
            you are reading this, nothing plays on load and nothing loops,
            because the first sound is the first press and never before
            it. The map has its own two voices, which is the fastest way
            to hear that it is a different kind of screen. If you are
            somewhere this is unwelcome, the control at the foot of the
            rail on the left silences the whole thing in one press and
            remembers that you did.
          </p>
        </section>

        <section className={styles.block}>
          <h2 className={styles.h2}>What it is not</h2>
          <ul className={styles.list}>
            <li>
              Not a proposal. Nothing here recommends that Champions Group
              or any of its brands do anything, and no plan in it has been
              agreed with anybody.
            </li>
            <li>
              Not a claim of access. No internal figure, system, document
              or conversation is behind any part of it.
            </li>
            <li>
              Not a set of live prices. Offers move. Every figure carries
              the date it was read, and anything read on 18 August 2026
              should be checked before it is spent against.
            </li>
            <li>
              Not finished. It has gaps, and where a screen cannot answer
              something it says so on the screen rather than filling the
              space.
            </li>
          </ul>
        </section>

        <div className={styles.go}>
          <Link className={styles.cta} to="/">
            Open the console
          </Link>
          <p className={styles.goNote}>
            It opens on the desk, which is the list of every organisation
            in the territory. Everything else is one press away in the
            column on the left.
          </p>
        </div>

        <footer className={styles.foot}>
          <p>
            Built by Nathan J. Song. The source is published, and the
            reasoning for most decisions is in the file that makes them
            rather than in a document beside it.
          </p>
        </footer>
      </main>
    </div>
  );
}
