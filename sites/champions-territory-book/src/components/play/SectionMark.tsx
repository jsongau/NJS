import type { SectionId } from "@/app/sections";
import styles from "./SectionMark.module.css";

/**
 * TWENTY MARKS, ONE STROKE LANGUAGE.
 *
 * ── WHAT WAS HERE BEFORE AND WHY IT HAD TO GO ─────────────────────
 * Nineteen line marks at sixteen pixels on a single 1.4 unit stroke,
 * described in their own file as "deliberately crude geometry". That was
 * the right answer for a rail on paper: a shape recognised in peripheral
 * vision, drawn quietly enough that nineteen of them down a column read
 * as one column. On a cabinet it is nineteen shrugs. Every one of them
 * is the same weight, the same colour and the same amount of interest,
 * which is precisely the reading the owner objected to.
 *
 * ── THE RULE, AND IT IS ONE RULE ──────────────────────────────────
 * Every mark below is drawn on a twenty four unit field with a two unit
 * round stroke, and every mark has EXACTLY ONE SOLID SHAPE in it. The
 * stroke is currentColor, so a mark takes the ink of whatever row it
 * sits in. The solid shape is var(--sec), so it takes the identity of
 * the section it names, resolved by the attribute mechanism described in
 * sections.ts. A mark is therefore two colours: where you are, and what
 * this is.
 *
 * That constraint is what makes twenty drawings look like one family.
 * The solid shape is also the part that carries the meaning: the sun
 * clearing the horizon on Today, the lead already landed in the tray on
 * Requests, the top row on the ranked desk, the claimed cell in the
 * week, the coin on top of the stack. Read only the solid shapes down
 * the rail and the product still makes sense.
 *
 * ── THE SAME PRIMITIVE FAMILY AS EVERYTHING ELSE ──────────────────
 * PinMark draws its dial from its own path constants, LaneChip encodes
 * the demand class in the SHAPE of its cap, PackageGlyph draws its
 * families rather than importing them. Nothing in this application
 * ships an icon font and nothing ever will, because a font is a set of
 * shapes somebody else drew at a size they chose. These are drawn at the
 * size they are used: eighteen units of a twenty four unit field, which
 * lands the stroke on a whole pixel at both 18px and 24px.
 *
 * COLOUR IS NEVER THE ONLY SIGNAL. Every one of these sits beside the
 * section's name, in the rail, on the strip and in the breadcrumb. Take
 * every colour out and the marks still differ in silhouette, which is
 * the reading that survives dichromacy and a photograph of a screen.
 */

interface Mark {
  /** The one solid shape, painted in the section colour. */
  lit: JSX.Element;
  /** Everything else, at two units in the row's own ink. */
  line?: JSX.Element;
}

const MARKS: Record<SectionId, Mark> = {
  /* The morning. A sun clearing the horizon, because Today is a screen
     about the hours in front of you rather than a clock face. */
  today: {
    lit: <circle cx="12" cy="10" r="4.2" />,
    line: (
      <>
        <path d="M12 2.6v1.8M4.8 5 6.1 6.3M19.2 5l-1.3 1.3" />
        <path d="M3 19.4h18" />
      </>
    ),
  },

  /* Inbound. A tray with something already landed in it. */
  requests: {
    lit: <rect x="8.6" y="2.6" width="6.8" height="6.8" rx="2" />,
    line: (
      <path d="M3 12.6h4.6l1.6 2.8h5.6l1.6-2.8H21v6.8H3z" />
    ),
  },

  /* Ranked rows, and the one at the top is the one being worked. */
  desk: {
    lit: <rect x="3" y="4.6" width="15" height="3.6" rx="1.8" />,
    line: <path d="M3 12.6h13M3 17.8h8.5" />,
  },

  /* A pin dropped on a territory. */
  maps: {
    lit: <circle cx="12" cy="9.6" r="3.1" />,
    line: <path d="M12 21.4s7-6.4 7-11.4a7 7 0 1 0-14 0c0 5 7 11.4 7 11.4z" />,
  },

  /* Three lanes side by side with the middle one lit. A rack of pins in
     perspective was drawn first and it was better at 40px and unreadable
     at 18, where the three pins merged into one triangle and the whole
     mark read as a tent. Nine channels of outbound work is a set of
     parallel runs, and parallel runs is what this says at any size. */
  lanes: {
    lit: <rect x="9.4" y="3" width="5.2" height="18" rx="1.8" />,
    line: (
      <>
        <rect x="3.2" y="3" width="5.2" height="18" rx="1.8" />
        <rect x="15.6" y="3" width="5.2" height="18" rx="1.8" />
      </>
    ),
  },

  /* Outside the branch. A flag planted somewhere nobody has driven yet. */
  field: {
    lit: <path d="M8.4 3.4h9l-2.6 3.6 2.6 3.6h-9z" />,
    line: <path d="M8.4 3v17.4M4 20.4h16" />,
  },

  /* Both directions in one place: one message in, one going back. */
  inbox: {
    lit: (
      <>
        <rect x="11" y="11.8" width="11" height="7.4" rx="2.4" />
        <path d="M13.6 19h4.6l-4.6 3.8z" />
      </>
    ),
    line: <path d="M2.6 5.6A2.4 2.4 0 0 1 5 3.2h9.4a2.4 2.4 0 0 1 2.4 2.4v3.6a2.4 2.4 0 0 1-2.4 2.4H7.4l-4.8 3.2z" />,
  },

  /* Away. The solid half is the part that has left. */
  sent: {
    lit: <path d="M21.2 3 3 10.4l7.2 2.6z" />,
    line: <path d="M21.2 3 13.8 21.2l-3.6-8.2z" />,
  },

  /* Something came back, and three dots is what waiting looks like. */
  replies: {
    lit: (
      <>
        <circle cx="8" cy="9.6" r="1.6" />
        <circle cx="12" cy="9.6" r="1.6" />
        <circle cx="16" cy="9.6" r="1.6" />
      </>
    ),
    line: <path d="M3 5.4A2.4 2.4 0 0 1 5.4 3h13.2A2.4 2.4 0 0 1 21 5.4v8.4a2.4 2.4 0 0 1-2.4 2.4H9l-6 4.4z" />,
  },

  /* What gets said back, and the half of the shield that holds. */
  objections: {
    lit: <path d="M12 2.4 4.4 5.4v6.2c0 4.5 3.3 7.9 7.6 9z" />,
    line: <path d="M12 2.4 4.4 5.4v6.2c0 4.5 3.3 7.9 7.6 9 4.3-1.1 7.6-4.5 7.6-9V5.4z" />,
  },

  /* The ledger, and the spine is the lit part because the spine is what
     you see when it is shut. */
  book: {
    lit: <rect x="2.8" y="3.2" width="3.6" height="17.6" rx="1.4" />,
    line: (
      <>
        <path d="M6.4 3.2h11.4A1.8 1.8 0 0 1 19.6 5v14a1.8 1.8 0 0 1-1.8 1.8H6.4z" />
        <path d="M10 8.8h6M10 13h6" />
      </>
    ),
  },

  /* A week, with one hour of it claimed. */
  week: {
    lit: <rect x="7" y="13" width="4.4" height="3.6" rx="1.2" />,
    line: (
      <>
        <path d="M4 6h16v14.4H4z" />
        <path d="M4 10.4h16M8 3.2V6M16 3.2V6" />
      </>
    ),
  },

  /* What will fit. Two bars standing, one still to fill. */
  capacity: {
    lit: (
      <>
        <rect x="3.6" y="12" width="4.4" height="7.4" rx="1.4" />
        <rect x="9.8" y="8" width="4.4" height="11.4" rx="1.4" />
      </>
    ),
    line: (
      <>
        <rect x="16" y="4.2" width="4.4" height="15.2" rx="1.4" />
        <path d="M2.6 20.8h18.8" />
      </>
    ),
  },

  /* A crate seen from the corner, with the lid lit. */
  packages: {
    lit: <path d="M12 2.8 20.8 7.4 12 12 3.2 7.4z" />,
    line: <path d="M3.2 7.4 12 12l8.8-4.6v9.2L12 21.2 3.2 16.6zM12 12v9.2" />,
  },

  /* How the week would be run. */
  coaching: {
    lit: <circle cx="9" cy="14" r="2.4" />,
    line: (
      <>
        <circle cx="9" cy="14" r="5.4" />
        <path d="M14.4 14h6.2V9.2H10.6" />
      </>
    ),
  },

  /* The set square. Every formula on one page, and the right angle is
     the part that cannot be argued with. */
  method: {
    lit: <rect x="4.8" y="15.6" width="3.6" height="3.6" rx="0.8" />,
    line: (
      <>
        <path d="M4 20.4V3.6l16.8 16.8z" />
        <path d="M4 8h2.8M4 12h2.8" />
      </>
    ),
  },

  /* Two audiences, and the lit part is the bit they share. */
  partners: {
    lit: <path d="M12 7.27a5.6 5.6 0 0 1 0 9.46 5.6 5.6 0 0 1 0-9.46z" />,
    line: (
      <>
        <circle cx="9" cy="12" r="5.6" />
        <circle cx="15" cy="12" r="5.6" />
      </>
    ),
  },

  /* Stock carried to a go-see. */
  promo: {
    lit: <circle cx="7.2" cy="12" r="2.1" />,
    line: <path d="M3 4.6h11.4l6 7.4-6 7.4H3z" />,
  },

  /* What the work costs. A stack, top coin lit. */
  spend: {
    lit: <ellipse cx="12" cy="6.6" rx="8" ry="3.2" />,
    line: (
      <>
        <path d="M4 6.6v10.8c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2V6.6" />
        <path d="M4 12c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2" />
      </>
    ),
  },

  /* The mark further down under the `leagues` key belongs to the only
     recurring product the division sells, the membership programme, and
     it is the only mark in the set drawn as a prize on a plinth. The
     plinth is lit because a membership base is a thing built up to over
     months rather than won in one call. The key keeps its old name
     because sections.ts and the router both join on it. */
  /*
    ACCOUNTS. A handshake reduced to two cuffs meeting, with the solid
    shape at the join. Every other mark in this set says "find" or
    "count"; this one has to say "keep", and a grip is the only gesture
    that reads at 24 units without a face in it.
  */
  accounts: {
    lit: <circle cx="12" cy="12" r="2.6" />,
    line: (
      <>
        <path d="M3.4 8.2h4.2l3 3M20.6 8.2h-4.2l-3 3" />
        <path d="M3.4 15.8h4.2l3-3M20.6 15.8h-4.2l-3-3" />
      </>
    ),
  },
  /*
    THE FIELD. Three seats on the division marketing bench, the first
    one filled. The solid shape is deliberately the leftmost of three
    rather than a whole row, because two of the three seats are open and
    the mark should say that before the page does.
  */
  team: {
    lit: <circle cx="6.4" cy="8.4" r="2.6" />,
    line: (
      <>
        <circle cx="12" cy="8.4" r="2.6" />
        <circle cx="17.6" cy="8.4" r="2.6" />
        <path d="M3.4 20.6v-1.8a3 3 0 0 1 3-3h11.2a3 3 0 0 1 3 3v1.8" />
      </>
    ),
  },
  /*
    RIVALS. Two markers standing on the same line, one of them ours. Not
    a crosshair and not a target: this register holds published facts
    read off other contractors' own websites, and a mark that reads as
    aiming at somebody would overstate what the screen actually does.
  */
  rivals: {
    lit: <path d="M8.2 4.2a2.4 2.4 0 0 1 3.2 0c1.2 1.2.6 2.6 0 3.6 1.4 1.6 1.8 3.4 1.8 5a3.4 3.4 0 0 1-6.8 0c0-1.6.4-3.4 1.8-5-.6-1-1.2-2.4 0-3.6z" />,
    line: (
      <>
        <path d="M16.6 7.4a1.8 1.8 0 0 1 2.4 0c.9.9.5 2 0 2.7 1 1.2 1.4 2.6 1.4 3.8a2.6 2.6 0 0 1-5.2 0c0-1.2.3-2.6 1.4-3.8-.5-.7-.9-1.8 0-2.7z" />
        <path d="M3.4 20.6h17.2" />
      </>
    ),
  },
  plans: {
    lit: <rect x="6.8" y="16.6" width="10.4" height="3.6" rx="1.4" />,
    line: (
      <>
        <path d="M7 3.4h10v5.2a5 5 0 0 1-10 0z" />
        <path d="M7 5.2H4.4a2.4 2.4 0 0 0 2.6 3.6M17 5.2h2.6a2.4 2.4 0 0 1-2.6 3.6" />
        <path d="M12 13.6v3" />
      </>
    ),
  },
};

export function SectionMark({
  section,
  size = 18,
}: {
  section: SectionId;
  /** Drawn at the size it is used. 18 in the rail, 20 on the strip. */
  size?: number;
}) {
  const mark = MARKS[section];
  return (
    <svg
      className={styles.mark}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      {mark.line ? <g className={styles.line}>{mark.line}</g> : null}
      <g className={styles.lit}>{mark.lit}</g>
    </svg>
  );
}
