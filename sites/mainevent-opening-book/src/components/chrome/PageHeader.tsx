import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { RAIL_DESTINATIONS } from "@/app/SideRail";
import { sectionFor } from "@/app/sections";
import { SectionMark } from "@/components/play/SectionMark";
import styles from "./PageHeader.module.css";

/**
 * THE BAND ABOVE A QUEUE. Where you are, what is narrowing it, where you
 * are inside it, and what you can take away.
 *
 * ── THE SEAM THIS FILE EXISTS TO CLOSE ────────────────────────────
 * A rail answers "what else is there". It cannot answer "where am I",
 * because the answer to that is only ever true of one screen and a rail
 * is drawn once for all of them. Before this component the answer lived
 * in exactly one place, an h1 four hundred pixels down a scrolling
 * column, so a reader who had scrolled into the middle of the queue had
 * nothing on screen telling them which queue it was or which filter was
 * hiding two thirds of it. That is the moment a person stops trusting a
 * count, and it is the moment every CRM answers with a header band.
 *
 * So this band carries four things and nothing else. A breadcrumb. A
 * context control. A record pager. A place for the verbs that act on the
 * whole filtered set, which in practice is the export. It is deliberately
 * not a second navigation: everything that goes to another screen goes
 * in the rail, and the two must never offer competing answers.
 *
 * ── WHY THE BREADCRUMB IS NOT TYPED INTO THIS FILE ────────────────
 * A breadcrumb that says "Outreach" while the rail files the same screen
 * under "The board" is worse than no breadcrumb, because both of them
 * look authoritative and only one of them can be right. The rail's
 * grouping is therefore the source of the trail, and the set of screens
 * is checked against the rail's own exported list at module load rather
 * than trusted.
 *
 * What is checked is the SET OF DESTINATIONS, which is the part that
 * actually drifts: a screen gets added, or moved, or quietly removed,
 * and a hand-written table goes stale within a week. The group headings
 * are mirrored here rather than imported, for one uncomfortable reason
 * worth writing down: the rail does not export its grouping, and this
 * agent does not own that file. If SideRail ever exports GROUPS, this
 * table should be deleted and derived from it in one line. Until then
 * the check below is the thing standing between the two.
 *
 * ── A GROUP IS A HEADING, NOT A ROUTE ─────────────────────────────
 * "The board" is five screens. It has no page of its own and inventing
 * one would be a destination built to make a breadcrumb look complete.
 * So the group crumb points at the first screen the rail lists under
 * that heading, which is the same row a reader's eye lands on when they
 * open the group in the rail. Every crumb in this trail is therefore a
 * real link to a real screen, except the last, which is where you are
 * standing and carries aria-current instead.
 *
 * ── WHAT IS DELIBERATELY NOT HERE ─────────────────────────────────
 * A page title. Every screen in this application opens with an eyebrow,
 * an h1 and a lede that were written for it, and a band that repeated
 * the title above them would be chrome arguing with the page. The band
 * says where you are; the page says what it is.
 *
 * A search box. Search belongs beside the rows it filters, where the
 * count that answers it can sit under it.
 *
 * A "new record" button. There is no record to create. This tool works a
 * trade area that already exists.
 *
 * ── WHICH SCREENS GET THIS BAND, AND WHICH DO NOT ─────────────────
 * It goes on the four queue screens: the desk, the inbound queue, today
 * and the replies. Each of those is a set of records with a filter over
 * it, which is exactly what a breadcrumb, a context control and a pager
 * are for.
 *
 * IT IS DELIBERATELY NOT ON /method AND /coaching. Those two are
 * documents. They are read from the top, they have no rows, no filter
 * and no record to be on, and a pager offering to step through a piece
 * of prose would be a control with nothing behind it. A breadcrumb alone
 * would be honest but it would also be the thin end of putting queue
 * chrome on a page that is not a queue, and the first thing anybody
 * would ask for next is a filter. The method page already carries its
 * own in-page contents rail, which is the correct navigation for a long
 * document and a different instrument entirely.
 */

// ---------------------------------------------------------------
// The trail, and the check that keeps it honest
// ---------------------------------------------------------------

interface ScreenNode {
  /** The rail heading this screen sits under, spelled as the rail spells it. */
  group: string;
  /** The screen's own name, spelled as the rail spells it. */
  label: string;
  /** The first screen the rail lists under that heading. */
  groupTo: string;
}

const SCREENS: Record<string, ScreenNode> = {
  "/today": { group: "Today", label: "Today", groupTo: "/today" },
  "/requests": { group: "Today", label: "Requests", groupTo: "/today" },
  "/": { group: "The board", label: "Desk", groupTo: "/" },
  /* The screen is called Maps everywhere a person reads it. The route
     stays /map, because a deployed URL, every deep link into the board
     and the route stub emitter all name it, and renaming a path to match
     a label is how a work sample link 404s in front of the one reader it
     was built for. */
  "/map": { group: "The board", label: "Maps", groupTo: "/" },
  "/lanes": { group: "The board", label: "Lanes", groupTo: "/" },
  "/field": { group: "The board", label: "Field", groupTo: "/" },
  /* The rail files the inbox on its own under "The working set", and it
     is the only screen in that group, so the group crumb and the screen
     crumb both point at it. The trail collapses the repetition itself. */
  "/inbox": { group: "The working set", label: "Inbox", groupTo: "/inbox" },
  "/sent": { group: "Outreach", label: "Sent", groupTo: "/sent" },
  "/replies": { group: "Outreach", label: "Replies", groupTo: "/sent" },
  "/objections": { group: "Outreach", label: "Objections", groupTo: "/sent" },
  "/book": { group: "The book", label: "Book", groupTo: "/book" },
  "/book/week": { group: "The book", label: "Week sheet", groupTo: "/book" },
  "/calendar": { group: "The book", label: "Capacity", groupTo: "/book" },
  "/packages": { group: "Reference", label: "Packages", groupTo: "/packages" },
  "/coaching": { group: "Reference", label: "Coaching", groupTo: "/packages" },
  "/method": { group: "Reference", label: "Method", groupTo: "/packages" },
  "/partners": {
    group: "Spend and support",
    label: "Partners",
    groupTo: "/partners",
  },
  "/promo": {
    group: "Spend and support",
    label: "Promo stock",
    groupTo: "/partners",
  },
  "/spend": { group: "Spend and support", label: "Budget", groupTo: "/partners" },
  /* The cup is filed under the book beside the leagues it is played for,
     which is where the rail files it. The drift check below is why this
     row exists at all: the rail and the trail have to agree about which
     screens there are. */
  "/cup": { group: "The book", label: "Cup", groupTo: "/book" },
  "/book/accounts": { group: "The book", label: "Accounts", groupTo: "/book" },
  "/team": { group: "The floor", label: "The floor", groupTo: "/team" },
  "/pay": { group: "The floor", label: "Pay", groupTo: "/team" },
  "/report": { group: "The floor", label: "District report", groupTo: "/team" },
  "/rivals": { group: "The board", label: "Rivals", groupTo: "/" },
  "/segments": { group: "The board", label: "Segments", groupTo: "/" },
};

/**
 * The drift check, run once when this module is first pulled in.
 *
 * It is a warning rather than a thrown error on purpose. A breadcrumb
 * that has fallen a screen behind the rail is a defect worth shouting
 * about; it is not worth taking the whole application down over, and a
 * page that refuses to render because its chrome is out of date would
 * turn a labelling bug into an outage.
 */
const DRIFT: string[] = [
  ...RAIL_DESTINATIONS.filter((to) => !(to in SCREENS)).map(
    (to) => `${to} is in the rail and missing from the breadcrumb table`,
  ),
  ...Object.keys(SCREENS)
    .filter((to) => !RAIL_DESTINATIONS.includes(to))
    .map((to) => `${to} is in the breadcrumb table and missing from the rail`),
];

if (DRIFT.length > 0) {
  console.warn(
    `The breadcrumb and the rail disagree about which screens exist. ${DRIFT.join(
      ". ",
    )}.`,
  );
}

export interface Crumb {
  label: string;
  /** Absent on the last crumb, which is the screen you are standing on. */
  to?: string;
}

/**
 * The trail for a path, with the filter appended when one is on.
 *
 * Two collapses, and both of them stop the trail repeating itself. The
 * group crumb is dropped when its heading is the same word as the screen
 * ("Today" under "Today"), and the root crumb is dropped on the desk,
 * which is the route the root points at.
 */
export function crumbsFor(pathname: string, filter?: string): Crumb[] {
  const node = SCREENS[pathname];
  const out: Crumb[] = [];

  if (pathname !== "/") out.push({ label: "The Opening Book", to: "/" });

  if (!node) {
    /* An unknown path still gets an honest trail rather than a guess at
       a name. This should be unreachable while the check above is quiet. */
    out.push({ label: "This screen" });
    return out;
  }

  if (node.group !== node.label && node.groupTo !== pathname) {
    out.push({ label: node.group, to: node.groupTo });
  }
  out.push({ label: node.label, to: pathname });
  if (filter) out.push({ label: filter });

  /* The last crumb is where you are, so it loses its link wherever it
     landed in the list above. */
  const last = out[out.length - 1];
  if (last) delete last.to;
  return out;
}

// ---------------------------------------------------------------
// The context control
// ---------------------------------------------------------------

export interface ContextOption {
  value: string;
  label: string;
  /** Appended to the label in brackets. Never the only signal. */
  count?: number;
}

/**
 * The one select this band draws, so four screens cannot each invent a
 * different looking one.
 *
 * The label is visible rather than a placeholder. A bare dropdown reading
 * "Past a deadline" tells a reader what is selected and never what the
 * dropdown is FOR, which is the single most common way a filter gets
 * left on by accident.
 */
export function ContextSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: ContextOption[];
  onChange: (value: string) => void;
}) {
  return (
    <span className={styles.context}>
      <label className={styles.contextLabel} htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.count === undefined ? o.label : `${o.label} (${o.count})`}
          </option>
        ))}
      </select>
    </span>
  );
}

// ---------------------------------------------------------------
// The band
// ---------------------------------------------------------------

export interface PageHeaderProps {
  /**
   * The filter narrowing this screen, as the last crumb. Left out when
   * nothing is narrowing it, so the trail never claims a filter that is
   * not on.
   */
  filterCrumb?: string;
  /** The context control, usually a ContextSelect. */
  context?: ReactNode;
  /** A RecordPager, on the screens that have a record to step through. */
  pager?: ReactNode;
  /** Verbs that act on the whole filtered set. The export, in practice. */
  actions?: ReactNode;
}

export function PageHeader({
  filterCrumb,
  context,
  pager,
  actions,
}: PageHeaderProps) {
  const { pathname } = useLocation();
  const crumbs = crumbsFor(pathname, filterCrumb);
  const section = sectionFor(pathname);

  return (
    <div className={styles.header}>
      <div className={styles.top}>
        <nav className={styles.trail} aria-label="Where you are">
          {/*
            THE SECTION'S OWN MARK, AT THE HEAD OF THE TRAIL.

            The band already inherits the section's colour from the shell
            root, so the rule under it and the crumb you are standing on
            change with the screen without this file knowing which screen
            that is. The mark is the part that could not be inherited: it
            is a drawing, and the whole point of the set is that a screen
            is recognisable as a shape before it is read as a word.

            It is aria-hidden and it sits outside the list, so a screen
            reader still hears a clean trail of places. The same mark is
            on the rail row and on the strip key that led here, which is
            what makes arriving somewhere feel like arriving rather than
            like a page swap.
          */}
          {section ? (
            <span className={styles.mark}>
              <SectionMark section={section} size={20} />
            </span>
          ) : null}
          <ol className={styles.crumbs}>
            {crumbs.map((crumb, i) => (
              <li key={`${crumb.label}-${i}`} className={styles.crumb}>
                {/*
                  The separator is a glyph inside the list item and it is
                  hidden from the accessible name, because a screen
                  reader announcing "slash" between every crumb reads the
                  punctuation of a path rather than a place.
                */}
                {i > 0 ? (
                  <span className={styles.sep} aria-hidden="true">
                    /
                  </span>
                ) : null}
                {crumb.to ? (
                  <Link className={styles.crumbLink} to={crumb.to}>
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={styles.crumbHere} aria-current="page">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {context ? <div className={styles.contextSlot}>{context}</div> : null}
      </div>

      {/*
        THE SECOND ROW EXISTS ONLY WHEN THERE IS SOMETHING IN IT, and it
        is one row rather than two so the pager and the export sit on the
        same baseline at every width. Below 560px it stacks, pager first,
        because stepping the queue is the thing a person came to do and
        the export is the thing they do once.
      */}
      {pager || actions ? (
        <div className={styles.bottom}>
          <div className={styles.pagerSlot}>{pager}</div>
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
