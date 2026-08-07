import type { ShelfMark } from "@/domain/selectors/orderDesk";
import styles from "./ShelfStrip.module.css";

/**
 * The shelf strip.
 *
 * One mark per authorized door, trouble first. Read across and you are
 * reading the territory for that item: how many stores carry it, how many
 * are empty tonight, how many are approved and never stocked it.
 *
 * This replaced a coloured bar down the left edge of the card. The bar
 * was legible and completely generic, the kind of thing every dashboard
 * template ships. It also encoded exactly one bit of information in a
 * space that could hold twenty five.
 *
 * The marks are shapes before they are colours, which is the same
 * contract as everything else here:
 *
 *   ▮ full height, filled   in stock
 *   ▬ half height           running low
 *   ▯ hollow, gapped        empty
 *   ┆ dotted                authorized, never stocked
 *
 * Turn the screen greyscale and the strip still reads, because height
 * and fill are doing the work.
 */
export function ShelfStrip({ shelf }: { shelf: ShelfMark[] }) {
  if (shelf.length === 0) return null;

  const counts = {
    out: shelf.filter((m) => m.state === "out").length,
    low: shelf.filter((m) => m.state === "low").length,
    void: shelf.filter((m) => m.state === "void").length,
    in: shelf.filter((m) => m.state === "in").length,
  };

  const summary = [
    counts.out ? `${counts.out} empty` : "",
    counts.low ? `${counts.low} low` : "",
    counts.in ? `${counts.in} stocked` : "",
    counts.void ? `${counts.void} not carried` : "",
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className={styles.wrap}>
      <div
        className={styles.strip}
        role="img"
        aria-label={`Shelf across ${shelf.length} authorised facings: ${summary}`}
      >
        {shelf.map((m) => (
          <span
            key={m.accountId}
            className={[styles.mark, styles[m.state]].join(" ")}
            title={`${m.name}: ${
              m.state === "out"
                ? "empty"
                : m.state === "low"
                  ? "running low"
                  : m.state === "in"
                    ? "in stock"
                    : "authorized, not stocked"
            }`}
          />
        ))}
      </div>
      <span className={styles.caption} aria-hidden="true">
        {shelf.length} facings · {summary}
      </span>
    </div>
  );
}
