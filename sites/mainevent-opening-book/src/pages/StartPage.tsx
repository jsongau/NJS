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
 * person who opens it is a hiring manager with a stack of other tabs and
 * something like ninety seconds of patience, and until this file existed
 * the link put them straight onto the desk: a rail of twenty odd
 * destinations, a board of two hundred and eleven organisations, and no
 * sentence anywhere saying what they were looking at or why a venue that
 * has not opened needs any of it. The work was doing the arguing and the
 * work is dense. Dense is correct for the eighth day and wrong for the
 * first ninety seconds.
 *
 * ── WHY IT IS OUTSIDE THE SHELL ───────────────────────────────────
 * On the same precedent as the quote letter. The console is a room for
 * one person doing a job, and everything in it, the rail, the counts,
 * the period selector, is addressed to that person. This page is
 * addressed to a visitor. Putting a visitor's letter inside the operator's
 * room means the first thing they read is surrounded by twenty
 * destinations telling them they are late to something.
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
 * It does not sell. There is no headline about passion for hospitality
 * and no list of competencies. It says what the thing is, what is real
 * in it, what is not, and where to press. A reader who wants the pitch
 * can read the cover letter; a reader who opened a link marked work
 * sample wants the work.
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
          <h1 className={styles.title}>The Opening Book</h1>
          <p className={styles.standfirst}>
            A working sales console for {VENUE.name}, a venue that has not
            opened yet, built by one person as part of an application for
            the sales manager job there.
          </p>
        </header>

        {/*
          THE DISCLAIMER IS ABOVE THE FOLD AND NOT IN A FOOTER.

          This application deliberately resembles internal software. A
          reader who scrolls past a resemblance and finds the disclaimer
          at the bottom has already spent a minute with the wrong idea in
          their head, and the correction reads as a retraction rather
          than as a frame. It costs four lines here and it buys the
          reader's trust for everything under it.
        */}
        <p className={styles.flag}>
          This is not a Main Event product. It is not affiliated with,
          endorsed by, or connected to Main Event Entertainment, and no
          part of it was built with access to their systems, their data or
          their people. Everything in it was assembled from published
          sources by one person from outside the company. The Main Event
          name and logo are their trademarks and appear here only to
          identify the venue this was built for.
        </p>

        <section className={styles.block}>
          <h2 className={styles.h2}>What the problem actually is</h2>
          <p>
            A venue that has not opened has no customers, no booking
            history, no repeat business and no pipeline. It also has a
            date, and on that date somebody is expected to have a calendar
            with events already on it. The whole job in the months before
            an opening is turning a map of a trade area into a book of
            signed dates, working entirely from organisations who have
            never heard of the place.
          </p>
          <p>
            So this is not a CRM with sample data in it. It is an answer to
            one question asked every morning for a year before the doors
            open, which is what to do next and why that and not something
            else.
          </p>
        </section>

        <section className={styles.block}>
          <h2 className={styles.h2}>What is real in it, and what is not</h2>
          <p>
            The {organisations} organisations are real, and each one was
            found by opening its own published page and reading what was
            there. Where an email address is on the board, the row carries
            the URL it was read off. Nothing was guessed from a domain
            name. Twenty five researched organisations are not on the
            board at all, because their address could not be confirmed,
            and they are listed as removed rather than quietly dropped.
          </p>
          <p>
            Nothing about the venue's performance is real, because none of
            it exists yet. Every figure in the application carries one of
            six labels saying where it came from, from{" "}
            <strong>public</strong> at one end to{" "}
            <strong>illustrative</strong> and <strong>withheld</strong> at
            the other, and a figure Main Event has not published is drawn
            as withheld rather than filled in with a plausible number.
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
                  reason on every line. A queue that says call a school is
                  a list; a queue that says call this school because its
                  grad night window opened this month and nobody has
                  written to them is a briefing.
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
                  Every formula and every source, including the nine things
                  the research could not stand behind and left out. This is
                  the screen to open if you want to know whether the rest
                  of it is honest.
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
          <h2 className={styles.h2}>It has a sound, and it is off</h2>
          <p className={styles.last}>
            The console makes a noise when you press things, and it makes
            none until you ask it to. The control is at the foot of the
            rail on the left and it reads "Sound off" until it does not.
            Nothing plays on load, nothing loops, and nothing plays while
            you are typing, because you may be reading this somewhere that
            a page making a noise at you would be unwelcome.
          </p>
        </section>

        <section className={styles.block}>
          <h2 className={styles.h2}>What it is not</h2>
          <ul className={styles.list}>
            <li>
              Not a proposal. Nothing here recommends that Main Event do
              anything, and no plan in it has been agreed with anybody.
            </li>
            <li>
              Not a claim of access. No internal figure, system, document or
              conversation is behind any part of it.
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
            in the trade area. Everything else is one press away in the
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
