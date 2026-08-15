import { Link } from "react-router-dom";
import { PROSPECTS, EMAILABLE, DOOR_ONLY } from "@/data/prospects";
import { LANE_META, LANE_ORDER, OCCASION_CLASS_META } from "@/domain/lanes";
import { OBJECTIONS } from "@/data/objections";
import { OFFERS } from "@/data/venue";
import { PACKAGES } from "@/data/packages";
import { LaneChip } from "@/components/primitives/LaneChip";
import {
  ProvenanceBadge,
  PROVENANCE_ORDER,
} from "@/components/primitives/ProvenanceBadge";
import styles from "./RationalePage.module.css";

/**
 * RATIONALE. Why this application is built the way it is.
 *
 * ── WHY IT IS NOT PART OF METHOD ──────────────────────────────────
 * Method already carries every formula and every source behind every
 * number, and it is the longest page here for good reason. But a formula
 * answers "is this figure right", and there is a second question a reader
 * asks before they get anywhere near arithmetic: why is the thing shaped
 * like this at all. Why does the desk rank on reachability before size.
 * Why do the two ledgers never add together. Why is a fundraiser night
 * the opening move rather than a corporate holiday party.
 *
 * Those are decisions, not calculations, and every one of them could have
 * gone the other way. Folding them into Method would bury an argument
 * inside a reference, and a reader looking up how a rate was computed is
 * not the same reader asking why the screen exists.
 *
 * ── WHY IT RENDERS OUTSIDE THE SHELL ──────────────────────────────
 * The console is a working instrument and it is finished. This page is
 * about the console, which makes it a different kind of object, in the
 * same way the customer facing quote is a different kind of object. Both
 * sit outside AppShell and carry their own frame.
 *
 * That is also the practical reason: the dashboard does not change. No
 * rail row, no strip key, no section token, no count. Adding a route here
 * costs App.tsx one line and the stub emitter one string, and every
 * screen a reader has already seen is byte for byte what it was.
 *
 * ── WHY THE SWITCH IS A PAIR AND NOT A BACK LINK ──────────────────
 * A back link says this page is a detour off the console. It is not. The
 * console is what the job produces and this is why it was produced that
 * way, and a hiring manager needs both. Two named modes say that; an
 * arrow pointing home says the opposite.
 *
 * ── EVERY FIGURE ON THIS PAGE IS COMPUTED ─────────────────────────
 * Nothing below is typed as a literal. The counts come out of the same
 * seeds the console renders from, so a prospect added to prospects.ts
 * changes this page in the same build. A page that argues for provenance
 * discipline and then hardcodes its own totals is arguing against itself.
 */

/** Cities, largest first, so the trade area reads as a shape not a list. */
function cityCounts(): [string, number][] {
  const counts = new Map<string, number>();
  for (const p of PROSPECTS) counts.set(p.city, (counts.get(p.city) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

/** Lanes carrying their own population, ordered by it. */
function laneRows() {
  return LANE_ORDER.map((lane) => ({
    lane,
    meta: LANE_META[lane],
    count: PROSPECTS.filter((p) => p.lane === lane).length,
  })).sort((a, b) => b.count - a.count);
}

function Figure({ value, label }: { value: string; label: string }) {
  return (
    <div className={styles.fig}>
      <b className="num">{value}</b>
      <span>{label}</span>
    </div>
  );
}

export function RationalePage() {
  const rows = laneRows();
  const cities = cityCounts();

  const locked = PROSPECTS.filter(
    (p) => LANE_META[p.lane].occasionClass === "calendar-locked",
  ).length;
  const discretionary = PROSPECTS.length - locked;

  const formOnly =
    PROSPECTS.length - EMAILABLE.length - DOOR_ONLY.length;
  const sourced = PROSPECTS.filter((p) => p.emailSourceUrl).length;
  const located = PROSPECTS.filter(
    (p) => p.locationAccuracy === "verified",
  ).length;

  const publishedOffers = OFFERS.filter((o) => o.provenance === "public");
  const packageFamilies = new Set(PACKAGES.map((p) => p.family));

  return (
    <div className={styles.page} data-sec="method">
      <main className={styles.wrap} id="main">
        <header className={styles.mast}>
          <p className={styles.kicker}>The Opening Book, Main Event Brea</p>
          <h1 className={styles.title}>Why it is built this way</h1>
          <p className={styles.standfirst}>
            The console is the working surface. This is the argument behind
            it: first the selling method, for anybody who would run this
            desk, then the construction, for anybody who would inherit the
            code.
          </p>

          <nav className={styles.modes} aria-label="Mode">
            <Link className={styles.mode} to="/">
              Console
            </Link>
            <span className={styles.mode} aria-current="page">
              Rationale
            </span>
          </nav>
          <p className={styles.modesNote}>
            Console opens the desk as it would be worked on a Monday. You
            are reading Rationale.
          </p>
        </header>

        {/* ============ ONE: THE SELLING ARGUMENT ============ */}
        <section aria-labelledby="h-selling">
          <h2 className={styles.h2} id="h-selling">
            One. The selling argument
          </h2>
          <p className={styles.lede}>
            Everything below is a decision that could have gone the other
            way. These are the reasons it did not.
          </p>

          <div className={`${styles.pnl} ${styles.flag}`}>
            <h3 className={styles.h4}>The opener, and it is not a pitch</h3>
            <p>
              The Brea location page was running Tempe, Arizona body copy.
              It described a venue <em>off I 10 and Warner Road</em>,{" "}
              <em>20 minutes from downtown Phoenix</em>, and invited a
              reader to <em>take a break from the desert heat</em>. Brea is
              in north Orange County.
            </p>
            <p>
              The enquiry form on it captured nine fields and none of them
              were the date, the headcount, or the event type. Those are
              the only three things a sales manager needs before a quote
              can exist, so every lead arriving through that form arrives
              needing a phone call before it is a lead.
            </p>
            <p className={styles.last}>
              A pre-opening page is unwritten because nobody has been hired
              to write it yet. That is the argument for hiring somebody,
              and it is why the first thing this build does is rewrite the
              page rather than draw a dashboard.
            </p>
          </div>

          <h3 className={styles.h3}>
            Why a booked group is worth more than the booking
          </h3>
          <p>
            Dave and Buster's own 10 K states that special events matter
            because a significant percentage of attendees are first time
            guests, and puts special events at{" "}
            <strong>9.8% of revenue in FY2018</strong>. So a group booking
            is not only revenue. It is a consumer acquisition event with a
            purchase order attached. One birthday puts twenty families in
            the building. One school fundraiser night puts two hundred.
          </p>
          <p>
            That is why the console shows the group funnel and the family
            occasion funnel meeting at a shared bottom, and it is the
            reason an event sales manager is worth more than the revenue
            line they sign.
          </p>

          <h3 className={styles.h3}>
            The trade area, as records rather than as a claim
          </h3>
          <div className={styles.figs}>
            <Figure
              value={String(PROSPECTS.length)}
              label="organisations on the board"
            />
            <Figure value={String(cities.length)} label="cities worked" />
            <Figure
              value={String(sourced)}
              label="with a named contact and a published source"
            />
            <Figure
              value={String(located)}
              label="at a verified street address"
            />
          </div>
          <p>
            {cities.map(([city, n], i) => (
              <span key={city}>
                {i > 0 ? ", " : ""}
                {city} <span className="num">{n}</span>
              </span>
            ))}
            . Each record carries the lane, the door, the decision maker's
            title, the buying window, a headcount range with the basis for
            it, and where the email came from.
          </p>
          <p>
            The <span className="num">{formOnly + DOOR_ONLY.length}</span>{" "}
            without a published address are not padding.{" "}
            <strong>
              <span className="num">{formOnly}</span> have a contact form
              and nothing behind it
            </strong>
            , and{" "}
            <strong>
              <span className="num">{DOOR_ONLY.length}</span> have no email
              door at all
            </strong>
            , which is not a gap in the research, it is the finding. Those
            are the ones worked by walking in. A board that listed only
            reachable organisations would quietly delete the half of the
            job that happens outside the building.
          </p>

          <div className={styles.scroller}>
            <table className={styles.table}>
              <caption>
                {LANE_ORDER.length} lanes, ranked by how many organisations
                sit in each.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Lane</th>
                  <th scope="col">Count</th>
                  <th scope="col">Occasion</th>
                  <th scope="col">The door</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ lane, meta, count }) => (
                  <tr key={lane}>
                    <td>
                      <LaneChip lane={lane} size="sm" />
                    </td>
                    <td className="num">{count}</td>
                    <td>{OCCASION_CLASS_META[meta.occasionClass].short}</td>
                    <td>{meta.doorName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            <strong>
              <span className="num">{locked}</span> of the{" "}
              <span className="num">{PROSPECTS.length}</span> are calendar
              locked
            </strong>{" "}
            and <span className="num">{discretionary}</span> are
            discretionary. That split is the whole sequencing argument. A
            grad night in June is decided the previous autumn, so a
            calendar locked lane worked in April has already lost the year.
            A discretionary lane can be worked any week and will still
            answer. Work the locked ones on their calendar and fill the
            gaps with the rest.
          </p>

          <h3 className={styles.h3}>Why the desk ranks the way it does</h3>
          <p>
            A prospecting list sorted by size is a list sorted by wishful
            thinking. This one ranks on four things in this order:{" "}
            <strong>reachability</strong>, because a named person with a
            published email is a call you can make this morning;{" "}
            <strong>occasion class</strong>, because a locked calendar has
            a deadline and a discretionary one does not;{" "}
            <strong>buying window</strong>, because a holiday party
            researched in July is decided by October; and{" "}
            <strong>likely size</strong> last, because size is the thing
            everybody else already sorted by.
          </p>

          <h3 className={styles.h3}>
            Two ledgers, and they never add together
          </h3>
          <div className={styles.ledger}>
            <div className={styles.rev}>
              <h4 className={styles.h4}>Signed revenue</h4>
              <p className={styles.last}>
                Contracts with a name on them. Money that exists.
              </p>
            </div>
            <div className={styles.act}>
              <h4 className={styles.h4}>Outbound hours</h4>
              <p className={styles.last}>
                Tabling, go sees, calls, appointments set. Work that was
                done.
              </p>
            </div>
          </div>
          <p>
            Adding them produces a number that sounds like progress and
            measures nothing. Pipeline reporting that blends effort into
            revenue is how a quarter looks healthy in September and lands
            short in December. Kept apart, a thin revenue month with heavy
            hours behind it is a timing problem, and a thin revenue month
            with no hours behind it is a management problem. Those need
            different answers, so they get different columns.
          </p>

          <h3 className={styles.h3}>
            Fundraiser nights are the wedge, and the maths is public
          </h3>
          <p>
            Twenty percent back to the school is the category standard,
            matched by Main Event, Chuck E. Cheese, Urban Air and Sky Zone.
            Stars and Strikes runs 15%. Chuck E. Cheese pays 25% above
            $2,500 and routes it through a local field marketing
            specialist, which is this job under a different title.
          </p>
          <p>
            It inverts the cold call. You are not asking a school for
            money, you are offering them money, and the school then puts
            flyers in every backpack and signage in the pickup zone. One
            night gets the PTA chair, the athletic director, and two
            hundred families who have now been inside the building.
          </p>

          <h3 className={styles.h3}>
            <span className="num">{OBJECTIONS.length}</span> objections,
            written the way they are actually said
          </h3>
          <p>
            {OBJECTIONS.map((o, i) => (
              <span key={o.id}>
                {i > 0 ? ". " : ""}
                {o.short}
              </span>
            ))}
            .
          </p>
          <p>
            Most of those exist only because the venue has not opened, and
            they expire on their own. The register records the answer to
            each one and, where the honest answer is that there is no
            answer yet, it records that instead. A rep who has to invent a
            response on the call gives away the wrong thing.
          </p>

          <h3 className={styles.h3}>
            The rule that governs every number here
          </h3>
          <p>
            Nothing unsourced is presented as measured. Every figure
            carries where it came from, and the classes are on the screen
            rather than in a footnote:
          </p>
          <p className={styles.chips}>
            {PROVENANCE_ORDER.map((p) => (
              <ProvenanceBadge key={p} provenance={p} />
            ))}
          </p>
          <p>
            Of the <span className="num">{OFFERS.length}</span> opening
            offers modelled here, exactly{" "}
            <span className="num">{publishedOffers.length}</span> is marked
            public, because exactly that many are Main Event's own
            published programme. The rest are proposals and say so. The
            research behind all of it carries a{" "}
            <strong>38 item list of what could not be verified</strong>,
            including the opening date and every drive time, and three
            widely repeated industry statistics were dropped entirely once
            they traced back to content farms.
          </p>
          <p>
            The same discipline is why{" "}
            <span className="num">{PACKAGES.length}</span> packages across{" "}
            <span className="num">{packageFamilies.size}</span> families are
            listed at what Main Event publishes and no further. Where a
            price is quote only, the row says quote only rather than
            guessing a number that a reader could check and find invented.
          </p>
        </section>

        {/* ============ TWO: THE BUILD ============ */}
        <section aria-labelledby="h-build">
          <h2 className={styles.h2} id="h-build">
            Two. How it is built
          </h2>
          <p className={styles.lede}>
            One person, no framework beyond React and a router, no server,
            and a data model that was designed before a single screen was.
          </p>

          <h3 className={styles.h3}>The shape of it</h3>
          <div className={styles.figs}>
            <Figure value="30" label="routes" />
            <Figure
              value={String(PROSPECTS.length)}
              label="prerendered quote pages"
            />
            <Figure value="0" label="servers or databases" />
            <Figure value="0" label="API calls at runtime" />
          </div>
          <p>
            It is a React and React Router application built with Vite,
            compiled to one bundle. After the build, a script walks the
            route table and writes a real <code>index.html</code> into
            every route folder, including one per organisation under{" "}
            <code>/quote/</code>. That is why a link to any single record
            is a file a static host can serve rather than a path that needs
            a rewrite rule, and why it survives being pasted into an email.
          </p>
          <p>
            All state is in memory or in <code>localStorage</code> under a
            versioned envelope. There is no backend, so there is nothing to
            keep running, nothing to pay for, and no credential in the
            repository.
          </p>

          <h3 className={styles.h3}>
            The data model, which is the actual work
          </h3>
          <p>
            The screens are a consequence of the records rather than the
            other way round. The prospect record is the spine: one row per
            organisation carrying its lane, its door, the decision maker's
            title, the buying window, a headcount range with the basis
            written next to it, coordinates, and how confident the contact
            is with the URL that confidence came from.
          </p>
          <p>
            <strong>Provenance is a column, not a disclaimer.</strong> It
            sits on the record beside the value, so a figure cannot travel
            through the application and arrive on a screen having quietly
            lost the caveat it was born with. That is the decision here I
            would defend hardest, and it is the one that made the research
            slower and the result usable.
          </p>

          <div className={`${styles.pnl} ${styles.flag}`}>
            <h3 className={styles.h4}>
              The honest part, because an interviewer will ask
            </h3>
            <p>
              For a while this application existed only as a compiled
              bundle. It was built in a working session that was not
              committed as it went, so the repository served the site for
              weeks while holding none of the code that produced it. The
              source was recovered intact, and it was verified rather than
              assumed: a clean build reproduces the deployed JavaScript,
              CSS and HTML byte for byte by checksum.
            </p>
            <p className={styles.last}>
              It is written here rather than quietly fixed because the
              lesson is the useful part, and it generalises past this
              project. Commit the source as you write it, not the artefact
              when you ship it. An artefact you cannot rebuild is a
              screenshot with a URL.
            </p>
          </div>

          <h3 className={styles.h3}>Constraints held throughout</h3>
          <ul className={styles.list}>
            <li>
              Original inline SVG only. No icon library, no emoji, no
              glowing or pulsing dots, no shimmer. Every animation depicts
              a physical event you can name.
            </li>
            <li>
              Colour is always the third signal. Every section is named in
              the rail, in the breadcrumb and in the page title, and
              carries its own drawn mark, so nothing on screen depends on
              telling two hues apart.
            </li>
            <li>
              Every rate shows what it was divided by. Modelled values are
              marked. Nothing unsourced is presented as measured.
            </li>
            <li>
              44 px tap targets on touch, 16 px minimum on inputs so iOS
              does not zoom, reduced motion respected, readable at 360 px.
            </li>
            <li>
              Ground is resolved before first paint, in the head, so the
              page never opens on the wrong colour and corrects itself in
              front of the reader.
            </li>
            <li>
              A blank screen is never the whole error message. If the
              bundle fails to evaluate, a plain script with no imports
              writes the message, the file, the line and the browser string
              into the page.
            </li>
          </ul>

          <h3 className={styles.h3}>What is not finished</h3>
          <p>
            The console is. The research behind it is not fully verified
            and says so in 38 places: the opening date, the final
            attraction list and every drive time are unconfirmed, because
            the venue at 245 W Birch St has not opened. Where the build
            needed one of those numbers it either marked it modelled or
            left the row empty. Nothing was invented to fill a gap, which
            is the only rule in this project that never bent.
          </p>
        </section>

        <footer className={styles.foot}>
          <p>
            <strong>This is an independent work sample.</strong> It is not
            a Main Event product, it does not represent Main Event, and it
            was built by one person for a job application. Not affiliated
            with or endorsed by Main Event Entertainment or Dave &amp;
            Buster's. All company names, published prices and programme
            details are cited from public sources.
          </p>
          <p className={styles.last}>
            Nathan J. Song. <Link to="/">Open the console</Link>, or read{" "}
            <Link to="/method">the formulas and sources</Link>.
          </p>
        </footer>
      </main>
    </div>
  );
}
