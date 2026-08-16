import { useLocation, Link } from "react-router-dom";
import { normalisePath } from "@/app/sections";
import { RATIONALE_BY_PATH, toConsole } from "@/data/rationale";
import styles from "./RationalePage.module.css";

/**
 * RATIONALE. The same application, read a second way.
 *
 * ── IT IS NOT A PAGE, IT IS A MODE ────────────────────────────────
 * Every console screen has an explanation at its own address with
 * /rationale in front of it. The rail is IDENTICAL in both modes: same
 * groups, same order, same labels, same counts, same section colours.
 * The only thing the switch changes is whether a destination shows you
 * the instrument or the argument for why that instrument is shaped that
 * way. Standing on Lanes and pressing Rationale gets you how Lanes was
 * built. Pressing Console again puts you back on Lanes.
 *
 * The first three attempts at this were all one essay at one address,
 * which meant a reader looking at the capacity chart and wondering why
 * it counts bowling lanes had to go somewhere else and then search. An
 * explanation that is not attached to the thing it explains is a
 * document, and there was already a document.
 *
 * ── WHY THE LOOKUP KEY IS THE CONSOLE PATH ────────────────────────
 * A screen and its explanation are one destination addressed twice, so
 * they share one key. Giving the explanations slugs of their own would
 * have been a second naming scheme to keep in step with the rail, and
 * the rail is the thing that changes most often.
 *
 * ── WHY IT WEARS THE SCREEN'S COLOUR ──────────────────────────────
 * sectionFor strips the /rationale prefix before resolving, so the
 * explanation of Lanes is drawn in Lanes' identity rather than in one
 * colour for all twenty seven. Rationale is a second reading of the
 * same places, not a place of its own, and a single hue across the mode
 * would have said the opposite.
 *
 * ── A MISSING ENTRY SAYS SO ───────────────────────────────────────
 * Twenty seven screens have an explanation written against the source.
 * Anything reached without one renders a panel naming the gap rather
 * than an empty page or a redirect, which is the same rule the console
 * follows for a queue that has not been built.
 */
export function RationalePage() {
  const { pathname } = useLocation();
  const consolePath = toConsole(normalisePath(pathname));
  const entry = RATIONALE_BY_PATH[consolePath];

  if (!entry) {
    return (
      <div className={styles.page}>
        <div className={styles.wrap}>
          <header className={styles.mast}>
            <p className={styles.kicker}>Rationale</p>
            <h1 className={styles.title}>Not written yet</h1>
          </header>
          <div className={`${styles.pnl} ${styles.flag}`}>
            <p className={styles.last}>
              There is no explanation on file for{" "}
              <code>{consolePath}</code>. That is a gap rather than a
              redirect, because a mode that quietly sends you somewhere
              else when it has nothing to say is a mode you cannot trust
              when it does.{" "}
              <Link to={consolePath}>Open the screen itself</Link>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <header className={styles.mast}>
          <p className={styles.kicker}>
            Rationale. How {entry.label} was built
          </p>
          <h1 className={styles.title}>{entry.label}</h1>
          <p className={styles.standfirst}>{entry.standfirst}</p>
          <p className={styles.modesNote}>
            You are reading the argument behind this screen.{" "}
            <Link to={consolePath}>Open {entry.label} itself</Link>, or
            press Console on the bar to go back to it with the rail
            where you left it.
          </p>
        </header>

        {entry.sections.map((section) => (
          <section key={section.heading}>
            <h2 className={styles.h2}>{section.heading}</h2>
            {section.body.map((para, i) => (
              <p
                key={i}
                className={i === section.body.length - 1 ? styles.last : undefined}
              >
                {para}
              </p>
            ))}
          </section>
        ))}

        <footer className={styles.foot}>
          <p className={styles.last}>
            <strong>This is an independent work sample.</strong> It is not
            a Main Event product, it does not represent Main Event, and it
            was built by one person for a job application. Every figure on
            the screen this explains carries where it came from, and{" "}
            <Link to="/method">Method</Link> carries the formula behind
            each one.
          </p>
        </footer>
      </div>
    </div>
  );
}
