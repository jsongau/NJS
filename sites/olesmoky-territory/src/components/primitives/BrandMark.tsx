import { useState } from "react";
import { BRAND_BY_ID } from "@/data/brands";
import styles from "./BrandMark.module.css";

/**
 * A brand mark.
 *
 * The supplied assets are official brand logos on white, not package
 * shots, so they are used as marks in rows and selectors rather than
 * dressed up as product photography.
 *
 * Every brand in the portfolio now has a supplied mark. The typographic
 * plate below stays as the fallback, because a missing or failed image
 * should degrade into something deliberate rather than a grey hole, and
 * because the alternative anyone reaches for first is worse: scraping a
 * pack shot off the web is a trademark problem, and generating a
 * plausible-looking one is worse still. The whole argument this app makes
 * is that every figure on screen is sourced or labelled as modeled, and a
 * fabricated pack shot is the one detail a spirits person spots instantly.
 *
 * Blue Flame's mark is silver-grey ink drawn for a dark ground and vanishes
 * on white, so it gets `markGround: "dark"` and the tile inverts. Recolour
 * the tile, never the logo.
 */
export function BrandMark({
  brandId,
  size = "md",
}: {
  brandId: string;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const brand = BRAND_BY_ID[brandId];
  const [failed, setFailed] = useState(false);

  if (!brand) return null;

  const showImage = brand.assetPath && !failed;

  /** Family colour, so a plate reads as part of the portfolio system. */
  const famVar = `var(--fam-${brand.family})`;
  const famTint = `var(--fam-${brand.family}-tint)`;

  /**
   * Only a relative path gets the base prefix. A data URI or an absolute
   * URL is already complete, and prefixing one produces
   * "./data:image/png;base64,..." which the browser tries to fetch as a
   * file and cannot find. That is exactly what broke the single-file
   * preview build, where the images are inlined as data URIs.
   */
  const src =
    brand.assetPath && /^(data:|https?:|\/)/.test(brand.assetPath)
      ? brand.assetPath
      : `${import.meta.env.BASE_URL}${brand.assetPath}`;

  return (
    <span
      className={[
        styles.mark,
        styles[size],
        showImage ? "" : styles.fallback,
        showImage && brand.markGround === "dark" ? styles.darkGround : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        showImage
          ? undefined
          : ({ ["--fam"]: famVar, ["--famTint"]: famTint } as React.CSSProperties)
      }
      title={brand.name}
    >
      {showImage ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className={styles.text}>{brand.name}</span>
      )}
    </span>
  );
}
