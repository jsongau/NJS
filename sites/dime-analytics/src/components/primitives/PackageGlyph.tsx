import type { ReactElement } from "react";
import type { PackageFamily } from "@/domain/types";
import { PACKAGE_BY_ID } from "@/data/packages";
import { PACKAGE_FAMILY } from "@/domain/vocabulary";
import styles from "./PackageGlyph.module.css";

/**
 * The package family, drawn.
 *
 * ── WHAT THIS REPLACED AND WHY ────────────────────────────────────
 * The forked version of this file drew VESSELS: a jar, a handle, a keg, a
 * six pack. That was right there, because in spirits the vessel is the
 * proposition and a rep reads the pack shape before they read the words.
 *
 * There is no vessel here. What DIME sells a group is a block of time
 * in a building, and the thing that actually differentiates one package
 * from another is not what it looks like, it is WHO HAS TO BE INVOLVED TO
 * BUY IT. So the marks below draw that instead, and each one is a single
 * commercial fact rendered in about six shapes:
 *
 *   CORPORATE    a gate. DIME itemises the All Inclusive Party in
 *                public, publishes no price for it, and tells the reader
 *                to contact the venue. The mark is the gate, and the role
 *                this app was built for is the person standing at it.
 *   YOUTH GROUP  three stacked bars. Volume, in the daytime, at low
 *                margin, arriving by the coach load.
 *   SELF-SERVE   a price tag. This family publishes its number and books
 *                itself on a phone at night without anybody's help.
 *   BUYOUT       every square filled. The whole building, and the reason
 *                a capacity screen exists.
 *   FUNDRAISER   a ring with a segment given away. DIME publishes no
 *                fundraiser rate, so the segment is a fifth chosen to be
 *                legible at sixteen pixels rather than a figure read off
 *                a page. It says "a share goes back" and nothing more
 *                precise than that, which is all a decorative mark is
 *                entitled to say.
 *
 * Decorative, always. Every family is spelled out in words beside this
 * mark wherever it appears, so nothing here is the only carrier of
 * anything.
 */

/** Gated. Two posts, a bar across, and a gap you cannot walk through. */
function GateMark() {
  return (
    <g>
      <rect x="3" y="5" width="3.4" height="14" rx="1" className={styles.solid} />
      <rect x="17.6" y="5" width="3.4" height="14" rx="1" className={styles.solid} />
      <rect x="6.4" y="8" width="11.2" height="2.6" className={styles.solid} />
      <rect x="6.4" y="13.4" width="11.2" height="2.6" className={styles.soft} />
    </g>
  );
}

/** Volume. Three loads, stacked, all the same size. */
function StackMark() {
  return (
    <g>
      <rect x="3.5" y="5" width="17" height="3.6" rx="1.4" className={styles.solid} />
      <rect x="3.5" y="10.2" width="17" height="3.6" rx="1.4" className={styles.solid} />
      <rect x="3.5" y="15.4" width="17" height="3.6" rx="1.4" className={styles.soft} />
    </g>
  );
}

/** A published price. A tag with the eyelet punched through it. */
function TagMark() {
  return (
    <g>
      <path
        d="M12.4 2.6h7.2a1.8 1.8 0 0 1 1.8 1.8v7.2L11.6 21.4 2.6 12.4Z"
        className={styles.solid}
      />
      <circle cx="17.6" cy="6.4" r="1.7" className={styles.punch} />
    </g>
  );
}

/** The whole building. Every square, and nothing left over. */
function FullMark() {
  const xs = [3.4, 9.8, 16.2];
  return (
    <g>
      {xs.map((x) =>
        xs.map((y) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y - 1}
            width="4.4"
            height="4.4"
            rx="1"
            className={styles.solid}
          />
        )),
      )}
    </g>
  );
}

/**
 * A share, given back.
 *
 * THE FIFTH IS A SHAPE, NOT A RATE. DIME publishes no fundraiser
 * percentage anywhere, so there is no figure for this arc to be drawn to
 * scale from, and the one it inherited belonged to another operator. A
 * fifth is what reads as an obvious slice at sixteen pixels and it is
 * held at exactly a fifth so that the drawing and the word "a fifth"
 * cannot disagree. No screen quotes a number off this mark; every screen
 * that has a rate to state states it in words with its provenance beside
 * it.
 */
function ShareMark() {
  const r = 8;
  const c = 2 * Math.PI * r;
  return (
    <g transform="rotate(-90 12 12)">
      <circle
        cx="12"
        cy="12"
        r={r}
        fill="none"
        className={styles.ring}
        strokeWidth="4.6"
      />
      <circle
        cx="12"
        cy="12"
        r={r}
        fill="none"
        className={styles.ringGiven}
        strokeWidth="4.6"
        strokeDasharray={`${c * 0.2} ${c}`}
      />
    </g>
  );
}

const MARKS: Record<PackageFamily, () => ReactElement> = {
  corporate: GateMark,
  "youth-group": StackMark,
  "self-serve": TagMark,
  buyout: FullMark,
  fundraiser: ShareMark,
};

/**
 * Takes a family directly, or a package id and resolves it.
 *
 * Both, because half the call sites hold a package row and half hold a
 * family filter, and forcing either one to reach into PACKAGE_BY_ID at
 * the call site is how a lookup ends up written eleven times.
 */
export function PackageGlyph({
  family,
  packageId,
  size = 24,
}: {
  family?: PackageFamily;
  packageId?: string;
  size?: number;
}) {
  const resolved =
    family ?? (packageId ? PACKAGE_BY_ID[packageId]?.family : undefined);
  if (!resolved) return null;

  const meta = PACKAGE_FAMILY[resolved];
  const Mark = MARKS[resolved];

  return (
    <svg
      className={styles.glyph}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      style={{
        ["--fam" as string]: meta.cssVar,
        ["--famTint" as string]: meta.tintVar,
      }}
    >
      <Mark />
    </svg>
  );
}
