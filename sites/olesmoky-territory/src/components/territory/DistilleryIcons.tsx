import { useId } from "react";

/**
 * ============================================================
 * Distillery iconography — drawn for this app, not licensed.
 * ============================================================
 *
 * WHY BESPOKE AND NOT AN ICON SET. Every icon library ships the same
 * shopping trolley, the same map pin, the same warehouse box, and a
 * screen built from them looks like every other screen built from them.
 * The territory map is the first thing a reader looks at, and a legend
 * assembled from Feather icons says "I picked a library." A legend drawn
 * from the objects the business actually contains — a mason jar, a char
 * barrel, a copper still, a stencilled crate — says something else.
 *
 * THE RULES THESE FOLLOW, so they read as one family rather than eight
 * separate drawings:
 *
 *   GRID      every icon is drawn in a 26x26 box with a 2px safe margin,
 *             so they optically align in a column without nudging.
 *   STROKE    1.7px, round joins, single weight. No hairlines that
 *             disappear at 100% zoom and no chunky strokes that read as
 *             a different set.
 *   FILL      one flat fill per icon at most, always the currentColor
 *             family, so an icon inherits whatever colour the legend row
 *             gives it and none of them carry meaning by hue.
 *   SILHOUETTE each shape has to be identifiable at 16px with the fill
 *             removed. That is the test. A jar is a jar because of its
 *             lid band and square shoulders, not because it is amber.
 *
 * ACCESSIBILITY. Every icon is aria-hidden by default and the legend
 * states its meaning in words beside it. Nothing here is the only
 * carrier of anything — the map itself encodes state through marker
 * SHAPE and GLYPH, and this set exists to name those states, not to
 * replace the naming.
 */

const S = {
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
};

type IconProps = { size?: number; title?: string; className?: string };

function Frame({
  size = 26,
  title,
  className,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 26 26"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/**
 * THE MASON JAR — a stocked account.
 *
 * Square shoulders and a lid band. Those two features are the entire
 * difference between reading as a jar and reading as a bottle at this
 * size, so both survive when the fill is stripped.
 */
export function JarIcon(p: IconProps) {
  return (
    <Frame {...p}>
      <path d="M8.6 4.2h8.8v2.1H8.6z" {...S} />
      <path d="M9.4 6.3h7.2" {...S} />
      <path
        d="M8.2 8.4h9.6a1.6 1.6 0 0 1 1.6 1.6v9.6a2.4 2.4 0 0 1-2.4 2.4H9a2.4 2.4 0 0 1-2.4-2.4V10a1.6 1.6 0 0 1 1.6-1.6Z"
        {...S}
      />
      {/* The liquid line. Fill, not stroke, so a full jar reads as full. */}
      <path
        d="M6.6 13.4h12.8v6.2a2.4 2.4 0 0 1-2.4 2.4H9a2.4 2.4 0 0 1-2.4-2.4Z"
        fill="currentColor"
        opacity="0.18"
      />
      <path d="M6.6 13.4h12.8" {...S} />
    </Frame>
  );
}

/**
 * THE EMPTY JAR — an authorized account not stocked. A void.
 *
 * Same silhouette, no liquid, and a broken base line. The break is what
 * carries "missing" without needing red: a dashed floor reads as absence
 * in greyscale, on a projector, and to a colourblind reader.
 */
export function EmptyJarIcon(p: IconProps) {
  return (
    <Frame {...p}>
      <path d="M8.6 4.2h8.8v2.1H8.6z" {...S} />
      <path d="M9.4 6.3h7.2" {...S} />
      <path
        d="M8.2 8.4h9.6a1.6 1.6 0 0 1 1.6 1.6v9.6a2.4 2.4 0 0 1-2.4 2.4H9a2.4 2.4 0 0 1-2.4-2.4V10a1.6 1.6 0 0 1 1.6-1.6Z"
        {...S}
        strokeDasharray="3 2.4"
      />
    </Frame>
  );
}

/**
 * THE CHAR BARREL — the wholesaler's facility.
 *
 * A cask on its side with two hoops. Chosen over the usual warehouse box
 * because a barrel is the one storage object that belongs to this trade
 * and to no other, and because it is unmistakable in silhouette.
 */
export function BarrelIcon(p: IconProps) {
  return (
    <Frame {...p}>
      <path
        d="M4.4 9.6c0-2 3.8-3.4 8.6-3.4s8.6 1.4 8.6 3.4v6.8c0 2-3.8 3.4-8.6 3.4s-8.6-1.4-8.6-3.4Z"
        {...S}
      />
      <path d="M4.4 9.6c0 2 3.8 3.4 8.6 3.4s8.6-1.4 8.6-3.4" {...S} />
      <path d="M7.4 7.1v11.8M18.6 7.1v11.8" {...S} strokeWidth="1.2" opacity="0.55" />
    </Frame>
  );
}

/**
 * THE COPPER POT STILL — the distillery, and the origin of everything.
 *
 * The onion body and swan neck. This is the shape on every distillery
 * sign in Tennessee and it needs no legend entry to be understood, which
 * is the highest compliment an icon can earn.
 */
export function StillIcon(p: IconProps) {
  return (
    <Frame {...p}>
      <path
        d="M6.2 20.4c0-4.4 1.8-6.6 4.6-7.8V9.2h3.2v3.4c2.8 1.2 4.6 3.4 4.6 7.8Z"
        {...S}
      />
      <path d="M9.4 6.4h5.4v2.8H9.4z" {...S} />
      <path d="M14.8 8.2c3.4 0 5 1.6 5 4.6v7.6" {...S} />
      <path d="M5.2 20.4h15.6" {...S} />
    </Frame>
  );
}

/**
 * THE STENCILLED CRATE — a shipment, a case, a load.
 *
 * A slot cut THROUGH the box rather than a handle drawn ON it. A handle
 * on a box reads as a toolbox; a cut-out slot reads as a case of liquor,
 * because that is how the real ones are made.
 */
export function CrateIcon(p: IconProps) {
  return (
    <Frame {...p}>
      <path d="M4.4 7.6h17.2v13.2H4.4z" {...S} />
      <path d="M4.4 12.2h17.2" {...S} strokeWidth="1.2" opacity="0.55" />
      <path d="M10.4 9.4h5.2v1.6h-5.2z" {...S} strokeWidth="1.3" />
      <path d="M4.4 7.6 6.8 4.6h12.4l2.4 3" {...S} />
    </Frame>
  );
}

/**
 * THE HANG TAG — point-of-sale material.
 *
 * A neck tag with its punched hole. It is the physical object 27 CFR
 * 6.84 is about, so the programme surfaces use it rather than a generic
 * price label.
 */
export function TagIcon(p: IconProps) {
  const uid = useId().replace(/:/g, "");
  return (
    <Frame {...p}>
      <path
        d="M13.6 4.4 21 11.8a1.8 1.8 0 0 1 0 2.6l-6.6 6.6a1.8 1.8 0 0 1-2.6 0L4.4 13.6V6.2a1.8 1.8 0 0 1 1.8-1.8Z"
        {...S}
      />
      <circle cx="9.1" cy="9.1" r="1.9" {...S} key={uid} />
    </Frame>
  );
}

/**
 * THE ROUTE PIN — a call on the day's route.
 *
 * A pin whose head is a jar lid rather than a circle. Small joke, and it
 * means the map's own vocabulary is consistent from the legend down to
 * the marker.
 */
export function RoutePinIcon(p: IconProps) {
  return (
    <Frame {...p}>
      <path d="M13 22.2c4.2-5 6.3-8.4 6.3-10.8a6.3 6.3 0 1 0-12.6 0c0 2.4 2.1 5.8 6.3 10.8Z" {...S} />
      <path d="M9.8 9.4h6.4v2.6H9.8z" {...S} strokeWidth="1.3" />
      <path d="M10.6 12h4.8" {...S} strokeWidth="1.2" opacity="0.6" />
    </Frame>
  );
}

/**
 * THE PROOF HYDROMETER — velocity, rate, how fast a thing moves.
 *
 * A floating hydrometer with its graduated stem. Used wherever the app
 * shows a run rate, because "how strong is this" and "how fast does this
 * move" are the two numbers this trade actually argues about, and the
 * instrument for the first is a better metaphor for the second than yet
 * another upward arrow.
 */
export function ProofIcon(p: IconProps) {
  return (
    <Frame {...p}>
      <path d="M13 3.6v9.2" {...S} />
      <path d="M11.4 5.6h3.2M11.4 8h3.2M11.4 10.4h3.2" {...S} strokeWidth="1.2" opacity="0.7" />
      <circle cx="13" cy="16.6" r="3.8" {...S} />
      <path d="M4.6 20.6c1.8 0 1.8-1.4 3.6-1.4s1.8 1.4 3.6 1.4 1.8-1.4 3.6-1.4 1.8 1.4 3.6 1.4 1.8-1.4 2.4-1.4" {...S} strokeWidth="1.3" />
    </Frame>
  );
}

export const DISTILLERY_ICONS = {
  jar: JarIcon,
  emptyJar: EmptyJarIcon,
  barrel: BarrelIcon,
  still: StillIcon,
  crate: CrateIcon,
  tag: TagIcon,
  pin: RoutePinIcon,
  proof: ProofIcon,
};

/**
 * THE ROCKS GLASS — an on-premise account.
 *
 * A tapered tumbler with a heavy base and a fill line about a third of
 * the way up, which is roughly where a 1.5oz pour actually sits in one.
 * The fill line is the whole point of the drawing: a glass with no
 * liquid in it is a glass, and a glass with a measured pour in it is a
 * SERVE — the unit the entire on-premise half of this app counts in.
 *
 * Chosen over a cocktail coupe, which is the icon every bar app uses and
 * which is wrong for this brand twice over: nothing Ole Smoky makes is
 * served up, and a coupe reads cocktail bar rather than the sports bars
 * and neighbourhood pubs that are actually on this list.
 */
export function RocksGlassIcon(p: IconProps) {
  return (
    <Frame {...p}>
      <path d="M7.6 6.4h10.8l-1.5 13.1a1.8 1.8 0 0 1-1.8 1.6h-4.2a1.8 1.8 0 0 1-1.8-1.6Z" {...S} />
      <path d="M8.9 14.6h8.2" {...S} strokeWidth="1.2" opacity="0.6" />
      <path
        d="M8.9 14.6h8.2l-0.85 5a1.8 1.8 0 0 1-1.8 1.5h-2.9a1.8 1.8 0 0 1-1.8-1.5Z"
        stroke="none"
        fill="currentColor"
        opacity="0.2"
      />
    </Frame>
  );
}

/**
 * THE BACK BAR — the on-premise equivalent of a shelf run.
 *
 * Three bottles on a lit tier with a rail beneath them. It exists so the
 * legend can say "this account's negotiated space is a back bar" without
 * borrowing the shelf icon, because a rep who thinks a back bar is a
 * shelf will ask a bar manager for facings and get nowhere.
 *
 * The middle bottle is drawn as a JAR — square shoulders and a lid band
 * — because the whole on-premise argument for this brand is that its
 * bottle is legible from a table. An icon that draws all three the same
 * would be quietly making the opposite argument.
 */
export function BackBarIcon(p: IconProps) {
  return (
    <Frame {...p}>
      <path d="M4.2 19.4h17.6" {...S} />
      <path d="M6.4 10.2v7.4M6.4 10.2c0-1 .5-1.4.5-2.2V6.6h1.6v1.4c0 .8.5 1.2.5 2.2v7.4" {...S} strokeWidth="1.4" />
      <path d="M11.1 7.9h3.8v9.7h-3.8Z" {...S} />
      <path d="M11.1 9.9h3.8" {...S} strokeWidth="1.2" opacity="0.6" />
      <path d="M18.2 10.2v7.4M18.2 10.2c0-1 .5-1.4.5-2.2V6.6h1.6v1.4c0 .8.5 1.2.5 2.2v7.4" {...S} strokeWidth="1.4" />
    </Frame>
  );
}
