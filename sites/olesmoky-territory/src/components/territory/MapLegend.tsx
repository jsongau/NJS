import { useState } from "react";
import { MARKER_LEGEND, accountIcon } from "@/lib/map/markerIcons";
import { DISTRIBUTOR_BY_ID } from "@/data/trade";
import { useTerritory } from "@/state/TerritoryProvider";
import {
  JarIcon,
  EmptyJarIcon,
  BarrelIcon,
  StillIcon,
  ProofIcon,
  RocksGlassIcon,
  BackBarIcon,
} from "./DistilleryIcons";
import styles from "./MapLegend.module.css";

/**
 * The legend states every marker condition in words.
 *
 * A map whose meaning lives only in the pins is a map that has to be
 * explained out loud. Since state here is carried by shape and glyph
 * rather than hue, the legend is also the proof that the encoding works:
 * read it in greyscale and nothing is lost.
 *
 * TWO COLUMNS OF ICON, ON PURPOSE. The left column is the ACTUAL MARKER,
 * rendered by the same function the map renders — not a redrawing of it,
 * so the legend cannot drift from the thing it describes. The right is a
 * drawn distillery icon that says what the marker MEANS: a full jar for a
 * stocked account, an empty dashed one for a void, a char barrel for the
 * wholesaler's facility. The marker is the syntax; the icon is the
 * translation.
 *
 * Every icon in that second column was drawn for this app. An icon set
 * off the shelf would have given me a shopping trolley and a warehouse
 * box, and a legend built from those looks like every other legend built
 * from those. See DistilleryIcons.tsx for the grid, stroke and
 * silhouette rules they all follow.
 */

/** Which drawn icon translates which marker state. */
const MEANING: Record<string, { Icon: typeof JarIcon; gloss: string }> = {
  "Retail location": { Icon: JarIcon, gloss: "A sealed bottle, sold to be opened elsewhere" },
  "Bar or restaurant": { Icon: RocksGlassIcon, gloss: "A pour, sold to be drunk here" },
  "Open voids": { Icon: EmptyJarIcon, gloss: "Available, not on the shelf or the menu" },
  "In the plan": { Icon: ProofIcon, gloss: "Committed this period" },
  "Open issues": { Icon: ProofIcon, gloss: "Something needs a call" },
};

export function MapLegend() {
  const [open, setOpen] = useState(true);
  const territory = useTerritory();

  /*
    Read from the record, never typed twice.

    This row used to be the literal string "Harbor, Santa Fe Springs".
    When the portfolio moved to spirits the wholesaler changed, a
    find-and-replace caught the NAME and left the CITY behind, and the
    legend confidently placed a real company at a competitor's address.
    Two facts about one entity, typed in two places, will eventually
    disagree.
  */
  const house = DISTRIBUTOR_BY_ID[territory.distributorId];

  return (
    <div className={styles.legend}>
      <button
        type="button"
        className={styles.head}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className={styles.headMark} aria-hidden="true">
          <StillIcon size={18} />
        </span>
        <span>Legend</span>
        <span aria-hidden="true" className={styles.chev}>
          {open ? "−" : "+"}
        </span>
      </button>

      {open ? (
        <ul className={styles.items}>
          {MARKER_LEGEND.map((entry) => {
            const m = MEANING[entry.label];
            return (
              <li key={entry.label}>
                <span
                  className={styles.swatch}
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{
                    __html: accountIcon(entry.visual).options.html as string,
                  }}
                />
                {m ? (
                  <span className={styles.meaning} aria-hidden="true">
                    <m.Icon size={22} />
                  </span>
                ) : (
                  <span className={styles.meaning} />
                )}
                <span className={styles.text}>
                  <strong>{entry.label}</strong>
                  <span>{m ? m.gloss : entry.description}</span>
                </span>
              </li>
            );
          })}

          {/*
            The negotiated space, named on both sides of the territory.

            A legend that stops at the marker states leaves the reader to
            assume the ask is the same everywhere. It is not: on one side
            a rep is asking for facings in a shelf run, on the other for a
            face on a lit back bar and a line on a menu, and those are
            different conversations with different people.
          */}
          <li>
            <span className={styles.swatch} aria-hidden="true">
              <BackBarIcon size={22} />
            </span>
            <span className={styles.meaning} aria-hidden="true">
              <RocksGlassIcon size={22} />
            </span>
            <span className={styles.text}>
              <strong>What is being asked for</strong>
              <span>
                Off-premise, facings in the spirits set. On-premise, a
                back-bar face and a line on the drinks menu.
              </span>
            </span>
          </li>

          <li>
            <span className={styles.swatch} aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 26 26">
                <rect
                  x="5"
                  y="5"
                  width="16"
                  height="16"
                  rx="2"
                  fill="#fff"
                  stroke="currentColor"
                  strokeWidth="2.2"
                />
              </svg>
            </span>
            <span className={styles.meaning} aria-hidden="true">
              <BarrelIcon size={22} />
            </span>
            <span className={styles.text}>
              <strong>{house?.name ?? "The wholesaler"}</strong>
              <span>
                {house
                  ? `Tier two, ${house.city} — Ole Smoky's longtime US partner`
                  : "Tier two"}
              </span>
            </span>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
