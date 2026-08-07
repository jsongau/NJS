import { PACKAGE_BY_ID } from "@/data/packageFormats";
import { SKU_BY_ID } from "@/data/skus";
import { BRAND_BY_ID } from "@/data/brands";
import { FAMILY } from "@/domain/vocabulary";
import styles from "./PackageGlyph.module.css";

/**
 * The package, drawn.
 *
 * This app names a package on nearly every row and never showed one. In
 * spirits the vessel IS the proposition: a jar, a handle, a 50ml mini and
 * a half barrel move through different channels at different velocities
 * to different shoppers, and a rep reads the pack shape before they read
 * the words. So the shape is drawn.
 *
 * The vessels are adapted from the Moonshine Cherries illustrations Nathan
 * drew for the DoorDash concept: flat fills, one label band, a peak on
 * the label, no gradients at this size because gradients turn to mud
 * under 30px. Each one takes the brand-family colour, so the portfolio
 * palette and the pack shapes are one system rather than two.
 *
 * Decorative, always. Every package is spelled out in text beside it, so
 * nothing here is the only carrier of anything.
 */

/**
 * The mark inside a label panel.
 *
 * Was a mountain peak, for a distiller whose whole identity is a mountain.
 * Ole Smoky's is a jar with a threaded neck, so the mark is a lid band —
 * two strokes and a rim, readable at eleven pixels, which is the only
 * size that matters here.
 */
function LidMark({ x, y, w }: { x: number; y: number; w: number }) {
  const h = w * 0.42;
  return (
    <g fill="currentColor" opacity="0.9">
      <rect x={x} y={y - h} width={w} height={h * 0.5} rx={h * 0.2} />
      <rect x={x + w * 0.12} y={y - h * 0.36} width={w * 0.76} height={h * 0.22} />
      <rect x={x + w * 0.2} y={y - h * 0.02} width={w * 0.6} height={h * 0.2} rx={h * 0.08} />
    </g>
  );
}

/** A shouldered 750ml bottle. The whiskey silhouette. */
function Stubby() {
  return (
    <g>
      <rect x="10" y="2" width="8" height="5" rx="1.6" className={styles.cap} />
      <path
        d="M10.5 6.5h7l2.5 6.5V32a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 8 32V13l2.5-6.5Z"
        className={styles.body}
      />
      <rect x="8" y="18" width="12" height="9" className={styles.label} />
      <g className={styles.mark}>
        <LidMark x={10} y={25} w={8} />
      </g>
    </g>
  );
}

/** Standard 12oz can. Straight walls, tapered neck, seamed lid. */
function Can() {
  return (
    <g>
      <rect x="8.5" y="3" width="11" height="2.4" rx="1.1" className={styles.cap} />
      <path
        d="M9 5h10l1 3v24a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 8 32V8l1-3Z"
        className={styles.body}
      />
      <rect x="8" y="16" width="12" height="9" className={styles.label} />
      <g className={styles.mark}>
        <LidMark x={10} y={23} w={8} />
      </g>
    </g>
  );
}

/** 19.2 and 24oz singles. The convenience vessel: taller, same width. */
function TallCan() {
  return (
    <g>
      <rect x="9" y="0.5" width="10" height="2.2" rx="1" className={styles.cap} />
      <path
        d="M9.5 2.4h9l1 3v27a2.5 2.5 0 0 1-2.5 2.5h-6A2.5 2.5 0 0 1 8.5 32.4V5.4l1-3Z"
        className={styles.body}
      />
      <rect x="8.5" y="14" width="11" height="11" className={styles.label} />
      <g className={styles.mark}>
        <LidMark x={10} y={23} w={7.5} />
      </g>
    </g>
  );
}

/** 7.5oz. High ABV in a small vessel, so it reads short and stout. */
function Stubcan() {
  return (
    <g>
      <rect x="8.5" y="10" width="11" height="2.2" rx="1" className={styles.cap} />
      <path
        d="M9 12h10l1 2.6v17.8a2.4 2.4 0 0 1-2.4 2.4h-7.2A2.4 2.4 0 0 1 8 32.4V14.6L9 12Z"
        className={styles.body}
      />
      <rect x="8" y="21" width="12" height="8" className={styles.label} />
      <g className={styles.mark}>
        <LidMark x={10} y={27} w={8} />
      </g>
    </g>
  );
}

/** Half barrel. Chimes top and bottom, the shape you roll off a truck. */
function Keg() {
  return (
    <g>
      <rect x="7" y="4" width="14" height="3" rx="1.4" className={styles.body} />
      <path
        d="M8 7h12v21c0 1.6-.6 2.4-1.6 2.4H9.6C8.6 30.4 8 29.6 8 28V7Z"
        className={styles.body}
      />
      <rect x="7" y="30" width="14" height="3" rx="1.4" className={styles.body} />
      <rect x="6.4" y="13" width="15.2" height="8" className={styles.label} />
      <g className={styles.mark}>
        <LidMark x={9} y={19.5} w={9} />
      </g>
    </g>
  );
}

/**
 * Closed multipack carton. A twelve or a twenty four ships as a printed
 * box, so it is drawn as a box: a lid seam, the label band, and a die-cut
 * handle slot punched through it. The slot is the detail — an arch drawn
 * ON a box reads as a toolbox, a slot cut THROUGH a box reads as a carrier.
 */
function Carton({ tall }: { tall: boolean }) {
  const top = tall ? 6 : 11;
  return (
    <g>
      <path
        d={`M4 ${top}h20a1.6 1.6 0 0 1 1.6 1.6V33a2 2 0 0 1-2 2H4.4a2 2 0 0 1-2-2V${top + 1.6}A1.6 1.6 0 0 1 4 ${top}Z`}
        className={styles.body}
      />
      {/* Lid seam. One line, and the box gains a top. */}
      <path
        d={`M2.6 ${top + 4.6}h22.8`}
        className={styles.seam}
      />
      {/* Die-cut handle, punched through the lid panel. */}
      <rect
        x="10.4"
        y={top + 1.4}
        width="7.2"
        height="2.4"
        rx="1.2"
        className={styles.cut}
      />
      <rect
        x="2.6"
        y={tall ? 20 : 23}
        width="22.8"
        height={tall ? 9 : 7.5}
        className={styles.label}
      />
      <g className={styles.mark}>
        <LidMark x={7} y={tall ? 27 : 29.5} w={14} />
      </g>
    </g>
  );
}

/**
 * Open carrier. Four and six packs sell in a basket with the tops showing,
 * which is exactly how a shopper identifies one across an aisle, so the
 * necks are drawn above the rim.
 */
function Carrier({ bottles, count }: { bottles: boolean; count: number }) {
  const n = Math.min(count, 3);
  const necks = Array.from({ length: n }, (_, i) => 5.5 + i * 8.5);
  return (
    <g>
      {necks.map((x) =>
        bottles ? (
          <path
            key={x}
            d={`M${x + 1.6} 7h4.4l1 4.6h-6.4L${x + 1.6} 7Z`}
            className={styles.body}
          />
        ) : (
          <rect
            key={x}
            x={x + 1.2}
            y="7.4"
            width="5.2"
            height="4.6"
            rx="0.8"
            className={styles.body}
          />
        ),
      )}
      {necks.map((x) => (
        <rect
          key={`c${x}`}
          x={x + 1.4}
          y="5.6"
          width="4.8"
          height="1.8"
          rx="0.8"
          className={styles.cap}
        />
      ))}
      <path
        d="M3.4 12h21.2a1.6 1.6 0 0 1 1.6 1.6V33a2 2 0 0 1-2 2H3.8a2 2 0 0 1-2-2V13.6A1.6 1.6 0 0 1 3.4 12Z"
        className={styles.body}
      />
      <rect x="1.8" y="21" width="24.4" height="8" className={styles.label} />
      <g className={styles.mark}>
        <LidMark x={6} y={27.5} w={16} />
      </g>
    </g>
  );
}


/**
 * The 750ml mason jar. The single most recognisable object Ole Smoky
 * owns, and the reason this whole glyph set exists: a shopper does not
 * pick up "a 750ml unit", they pick up a jar with a lid band on it.
 *
 * Shoulders are square rather than sloped, because that is what
 * separates a jar silhouette from a bottle one at this size — the
 * difference has to survive being drawn twenty-eight pixels wide in a
 * table cell.
 */
function Jar() {
  return (
    <g>
      <rect x="8.5" y="2" width="11" height="4.6" rx="1" className={styles.cap} />
      <path d="M9.5 6.2h9v2.2h-9z" className={styles.cap} opacity="0.7" />
      <path
        d="M9 8.4h10a2 2 0 0 1 2 2v21a3 3 0 0 1-3 3h-8a3 3 0 0 1-3-3v-21a2 2 0 0 1 2-2Z"
        className={styles.body}
      />
      <rect x="7" y="17" width="14" height="10" className={styles.label} />
      <g className={styles.mark}>
        <LidMark x={9.5} y={24.5} w={9} />
      </g>
    </g>
  );
}

/**
 * The 1.75L handle. Same body, wider, with the loop that gives the
 * format its name — which is also the only thing that distinguishes it
 * from a 750 at a glance, so it is drawn rather than implied.
 */
function Handle() {
  return (
    <g>
      <rect x="11" y="2" width="6" height="3.4" rx="1" className={styles.cap} />
      <path d="M12 5.2h4v3h-4z" className={styles.cap} opacity="0.7" />
      <path
        d="M6.5 8.2h15a1.8 1.8 0 0 1 1.8 1.8v22a2.6 2.6 0 0 1-2.6 2.6H7.3A2.6 2.6 0 0 1 4.7 32V10a1.8 1.8 0 0 1 1.8-1.8Z"
        className={styles.body}
      />
      <path
        d="M18.6 11.5c2.6 0 3.9 1.4 3.9 3.4s-1.3 3.4-3.9 3.4"
        className={styles.body}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <rect x="4" y="19" width="18" height="9" className={styles.label} />
      <g className={styles.mark}>
        <LidMark x={7} y={26} w={9} />
      </g>
    </g>
  );
}

/**
 * The 50ml mini. Drawn small ON PURPOSE — it occupies about a third of
 * the box the other vessels fill, because the entire commercial point of
 * a mini is that it is a two dollar yes rather than a twenty dollar one,
 * and a glyph that drew it the same size as a handle would erase the one
 * thing worth knowing about it.
 */
function Mini() {
  return (
    <g>
      <rect x="12" y="14" width="4" height="2.6" rx="0.8" className={styles.cap} />
      <path d="M12.4 16.2h3.2v2h-3.2z" className={styles.cap} opacity="0.7" />
      <path
        d="M11.6 18h4.8a1.2 1.2 0 0 1 1.2 1.2v13a1.8 1.8 0 0 1-1.8 1.8h-3.6a1.8 1.8 0 0 1-1.8-1.8v-13a1.2 1.2 0 0 1 1.2-1.2Z"
        className={styles.body}
      />
      <rect x="10.2" y="24" width="7.6" height="5.4" className={styles.label} />
    </g>
  );
}

export function PackageGlyph({
  skuId,
  size = 28,
}: {
  skuId: string;
  size?: number;
}) {
  const sku = SKU_BY_ID[skuId];
  if (!sku) return null;
  const pkg = PACKAGE_BY_ID[sku.packageFormatId];
  const brand = BRAND_BY_ID[sku.brandId];
  if (!pkg || !brand) return null;

  const fam = FAMILY[brand.family];

  /**
   * Which vessel. Package identity first, then pack size: a six of
   * bottles is drawn as bottles, a twelve or a twenty four is drawn as
   * the carton it actually ships in.
   */
  /**
   * Which vessel.
   *
   * The rule is the SELLING unit, not the shipper. A 19.2oz single ships
   * twelve to a case, and drawing that case as a twelve pack was the bug:
   * a shopper buys one tall can, and the tall can is the thing a rep
   * points at in a back shelf. `packUnits` is the number that answers this;
   * `unitsPerCase` answers a pallet question and nothing else.
   */
  /**
   * SPIRITS SELECTION ORDER. Multi-unit packs first, because an 8-pack
   * of cans is a carton whatever is in it. Then the single vessel, and
   * for spirits the discriminator is SIZE rather than material: a 50ml
   * mini, a 750ml jar, a 375ml flask and a 1.75L handle are all "a
   * bottle" to the container field and four completely different
   * commercial objects to a buyer.
   *
   * The jar is checked by package id rather than by size, because the
   * mason jar and the 750ml bottle hold the same liquid and are not the
   * same thing to anybody who has seen the shelf.
   */
  const shape =
    pkg.container === "keg" ? (
      <Keg />
    ) : pkg.packUnits >= 8 ? (
      <Carton tall={pkg.packUnits >= 24} />
    ) : pkg.packUnits > 1 ? (
      <Carrier bottles={pkg.container === "bottle"} count={pkg.packUnits} />
    ) : pkg.id === "jar-750" ? (
      <Jar />
    ) : pkg.unitSizeOz >= 50 ? (
      <Handle />
    ) : pkg.unitSizeOz <= 3 ? (
      <Mini />
    ) : pkg.container === "can" && pkg.unitSizeOz <= 8 ? (
      <Stubcan />
    ) : pkg.container === "bottle" ? (
      <Stubby />
    ) : pkg.unitSizeOz >= 19 ? (
      <TallCan />
    ) : (
      <Can />
    );

  return (
    <svg
      className={styles.glyph}
      viewBox="0 0 28 38"
      width={size}
      height={size * (38 / 28)}
      fill="none"
      aria-hidden="true"
      style={{ ["--fam" as string]: fam.cssVar, ["--famTint" as string]: fam.tintVar }}
    >
      {shape}
    </svg>
  );
}
