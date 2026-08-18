import type { ReactElement } from "react";
import type { PackageFamily } from "@/domain/types";
import { PACKAGE_BY_ID } from "@/data/packages";
import { PACKAGE_FAMILY } from "@/domain/vocabulary";
import styles from "./PackageGlyph.module.css";

/**
 * The offer family, drawn.
 *
 * ── WHAT THIS REPLACED AND WHY ────────────────────────────────────
 * The forked version of this file drew VESSELS: a jar, a handle, a keg, a
 * six pack. That was right there, because in spirits the vessel is the
 * proposition and a rep reads the pack shape before they read the words.
 *
 * There is no vessel here. What these brands sell is a job in a house,
 * and the thing that actually separates one offer from another is not
 * what it looks like, it is WHETHER A HOUSEHOLD CAN LEARN THE PRICE
 * WITHOUT PHONING SOMEBODY. So the marks below draw that instead, and
 * each one is a single commercial fact rendered in about six shapes:
 *
 *   GATED        a gate. Named plan, itemised benefits, no number on the
 *                page, phone us. Not one of the fourteen rival brands profiled
 *                sit here, and so does our own CHAMP-Rewards.
 *   MEMBERSHIP   three stacked bars. Small, recurring, repeated, and
 *                loyal for as long as the household stays in the house.
 *   PUBLISHED    a price tag. The number is on the landing page, so the
 *                offer converts at two in the afternoon without anybody
 *                picking up a phone.
 *   REPLACEMENT  every square filled. The whole system, the install day
 *                it consumes, and the ticket that pays for the month.
 *   GIVEN AWAY   a ring with a segment given back. Free camera checks,
 *                free water tests, free safety inspections, sponsorship.
 *                Worth something to the household and nothing to the
 *                click, because four brands give the same thing away.
 *
 * Decorative, always. Every family is spelled out in words beside this
 * mark wherever it appears, so nothing here is the only carrier of
 * anything, and nobody has to separate two hues to read a shelf.
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

/** Recurring. Three visits a year, stacked, all the same size. */
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

/** The whole system. Every square, and nothing left over. */
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
 * A fifth, given back.
 *
 * The segment is drawn at twenty per cent because a ring needs a number
 * and this one is honest about not having one: NOT A SINGLE BRAND IN THE
 * SCRAPE PUBLISHES WHAT ITS FREE INSPECTION IS WORTH, and the only
 * community figure anybody prints is a cumulative 160,000 dollars raised
 * since 2014, which is not a rate. So the fifth is an illustration
 * rather than a measurement, it is said so here, and the mark is
 * decorative in a family whose word carries the meaning anyway. A mark
 * that said "a fifth" while claiming to be a fact would be a small lie a
 * careful reader catches and a careless one absorbs.
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
