import { groupProfile, NO_GROUP_PROFILE } from "@/domain/booking";
import type { Prospect } from "@/domain/types";
import type { DeskLine } from "@/domain/selectors/desk";
import { LaneChip } from "@/components/primitives/LaneChip";
import {
  EmailConfidenceChip,
  StatusChip,
} from "@/components/primitives/StatusChip";
import { Figure } from "@/components/primitives/ProvenanceBadge";
import { RecordName } from "@/components/record/RecordName";
import styles from "./ProspectMapPopup.module.css";

/**
 * The card inside a marker popup.
 *
 * WHY IT IS A COMPONENT AND NOT MARKUP IN THE MAP. The popup and the
 * detail pane describe the same organisation, and when they are written
 * in two places they drift: one says "Published email" and the other
 * shows an address with no chip, one rounds the distance and the other
 * does not, and a reader who opens both notices before they notice
 * anything else. Extracting it means there is exactly one opinion in this
 * codebase about what a prospect looks like when it is small.
 *
 * ── IT IS A PLACE CARD, NOT A PANEL WITH A ROOF ON IT ──────────────
 * It used to be a form pinned to a map: a name, three chips, four
 * uppercase field labels each with its value underneath, a paragraph
 * explaining where the door count came from, and three buttons. Measured
 * in a browser it stood 584 pixels tall over a 762 pixel map pane, which
 * is a popup that has eaten the thing it is annotating.
 *
 * Almost all of that height was the labelling rather than the facts. A
 * published email is recognisable as an email, a distance in miles is
 * recognisable as a distance, and a job title is recognisable as a
 * person, so WRITTEN DOOR, FROM THE BREA BRANCH and WHO SIGNS were each
 * costing a line to say what the line below them already said. They are
 * gone from the paint and kept for the screen reader, which cannot see
 * the difference between a mono figure and a role and does need telling.
 *
 * The door count basis went with them, whole. It is a sentence and a half
 * about where a range came from, it is on the record modal and in the
 * detail pane, and a card floating over a moving map is the worst place
 * in the application to read it.
 *
 * ── THE OCCASION CLASS IS STILL HERE, AS A SHAPE ───────────────────
 * The third chip, "Calendar-locked" or "Discretionary", was dropped so
 * that the chip row is one row at every lane, including the long ones
 * like "Faith and nonprofit". Nothing is lost that this card was the only
 * carrier of: the class is a fixed function of the lane, `LaneChip` draws
 * a pointed cap for calendar-locked and a flat one for discretionary and
 * names the class in words in its own tooltip, and the pane on the right,
 * which the same click has already filled, spells it out. Colour is not
 * doing this alone and never was.
 *
 * ── THERE ARE NO BUTTONS ON THIS CARD, AND IT IS NOT A DEAD END ────
 * Both facts were checked in a browser before the buttons came off.
 *
 * The organisation's name is a `RecordName`, so pressing it opens the
 * full record modal, which is where the conversation, the status, the
 * offer and the write controls live. And `ClusterLayer` raises
 * `onSelectProspect` on `popupopen`, so the click that opened this card
 * has already filled the detail pane beside the map with the same
 * organisation. Every action the three buttons reached is therefore one
 * press away on a surface that is already open, and the map gets its
 * pixels back.
 *
 * The name carries a small mark of its own for that reason. On a map,
 * where a marker, a tile, a ring and a card are all pressable, an
 * underline that only appears under the pointer is not an affordance; it
 * is a reward for having already guessed. The mark is inside the button,
 * so it cannot be mistaken for a control of its own, and it is a shape
 * rather than a colour.
 *
 * ── ONE THING THAT COULD NOT BE VERIFIED HERE ─────────────────────
 * A Leaflet popup is attached to the map's own overlay pane rather than
 * to the React subtree that appears to contain it. React Leaflet bridges
 * that with a portal, so the handler on the name is an ordinary React
 * handler and does fire, but the popup's DOM is created and destroyed by
 * Leaflet outside React's control. What could not be checked without a
 * browser in front of it is the TAB ORDER once the popup opens, since
 * Leaflet moves focus to the popup's close control at its own discretion.
 * Nothing in this file traps focus or sets a tabindex, so whatever the
 * map does, a reader can always tab out of it.
 */

export interface ProspectMapPopupProps {
  line: DeskLine;
  /**
   * Kept on the interface, and no longer drawn.
   *
   * The card carried a button that called this, and the owner asked for
   * every button on the popup to come off. Opening a marker already
   * selects the organisation, which is the same state this raised, so
   * removing the prop as well would have been a signature change for a
   * caller that has nothing left to pass. It stays, unused, until the map
   * pane stops passing it.
   */
  onOpenDetail?: () => void;
  /**
   * Kept on the interface for the same reason, and also no longer drawn.
   *
   * The compose modal is reached from the record the name opens and from
   * the pane the marker click has already filled, so a write control on a
   * 268 pixel card over a map was the third route to the same window.
   */
  onCompose?: (prospect: Prospect, intent: "outreach") => void;
}

/**
 * The mark that says the name opens something.
 *
 * A record card rather than an arrow: this app has a standing rule
 * against arrows in anything a person reads, and an arrow would in any
 * case promise a navigation away from the map, which is not what happens.
 */
const RECORD_MARK = "▤";

export function ProspectMapPopup({ line }: ProspectMapPopupProps) {
  const p = line.prospect;

  return (
    <div className={styles.popup}>
      {/*
        The heading is the way into the record, which is the thing the
        owner asked for by name: press the organisation and the profile
        opens. It is safe here in a way it is not everywhere, because a
        popup card is a plain box and nothing above this line is
        interactive, so the name is a button inside a heading rather than
        a button inside a button.

        The mark is passed as a child rather than drawn beside the name,
        so it sits inside the one hit area instead of next to it, and so
        the name and the mark can never be pressed apart.
      */}
      <h3 className={styles.name}>
        <RecordName prospectId={p.id}>
          {p.name}
          <span className={styles.recordMark} aria-hidden="true">
            {RECORD_MARK}
          </span>
        </RecordName>
      </h3>

      <p className={styles.chips}>
        <LaneChip lane={p.lane} size="sm" />
        <StatusChip status={line.status} size="sm" short />
      </p>

      {/*
        The four facts, unlabelled on the paper and labelled in the
        accessibility tree. A screen reader reads this card as a list of
        four items with no visual hierarchy to lean on, so each one says
        what it is; a sighted reader gets the same distinction from type,
        from a chip and from a mono figure, which costs no height at all.
      */}
      <ul className={styles.facts}>
        <li className={styles.role}>
          <span className="visually-hidden">Who signs: </span>
          {p.decisionMakerTitle}
        </li>

        <li className={styles.door}>
          <span className="visually-hidden">Written door: </span>
          <EmailConfidenceChip confidence={p.emailConfidence} size="sm" />
          {p.emailConfidence === "verified_public" && p.email ? (
            <span className={styles.mono}>{p.email}</span>
          ) : null}
          {/*
            A phone number is the only other written thing an
            organisation with no address publishes, and it is recognisable
            on sight, so it stands in for the sentence that used to
            explain the absence.
          */}
          {p.emailConfidence === "none" && p.phone ? (
            <span className={styles.mono}>{p.phone}</span>
          ) : null}
        </li>

        {/*
          Both figures on one line, because they are the two numbers a
          marketer weighs against each other: how far to drive and how many
          doors are at the end of it. "Straight line" stays in the visible words
          rather than moving to a tooltip, since a distance that is not a
          drive is a distance somebody will otherwise plan a morning
          around.
        */}
        <li className={styles.figures}>
          <span className={styles.figure}>
            <span className="visually-hidden">From the Brea branch: </span>
            <Figure
              value={`${line.miles.toFixed(1)} mi straight line`}
              provenance="modeled"
              compact
            />
          </span>
          <span className={styles.figure}>
            <span className="visually-hidden">Likely doors: </span>
            {/*
              A range, never a midpoint. The door count is the input to
              every revenue figure downstream, and "40 to 80" is honest in
              a way that "62" is not. What the range is based on is on the
              record and in the pane on the right, both of which this card
              now leads to rather than duplicates.
            */}
            <Figure
              value={(groupProfile(p) ? `${groupProfile(p)!.low} to ${groupProfile(p)!.high} doors` : NO_GROUP_PROFILE)}
              provenance={p.provenance.headcount ?? "modeled"}
              compact
            />
          </span>
        </li>
      </ul>
    </div>
  );
}
