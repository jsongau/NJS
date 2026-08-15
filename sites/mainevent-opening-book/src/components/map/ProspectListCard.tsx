import type { CSSProperties } from "react";
import type { DeskLine } from "@/domain/selectors/desk";
import { LaneChip } from "@/components/primitives/LaneChip";
import { StatusChip } from "@/components/primitives/StatusChip";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { RecordName } from "@/components/record/RecordName";
import styles from "./ProspectListCard.module.css";

/**
 * One organisation, as a line in the left ledger.
 *
 * ---------------------------------------------------------------
 * THIS CARD USED TO BE A DOSSIER, THEN IT WAS A ROW, AND NOW IT IS
 * A LINE IN A BOOK
 * ---------------------------------------------------------------
 *
 * The build before last carried, on every one of a hundred and two
 * rows: an initials plate, a rank, a name, three chips, a city, a
 * straight line distance, a four cell figure grid with its own
 * provenance badge, a "Showing" flag on the chosen row, and two compose
 * buttons. Three hundred and forty seven pixels a card. On a 1440 by 900
 * screen that is ONE organisation fully visible in a list whose entire
 * argument is the comparison down the page.
 *
 * The density pass fixed that and took it to ten. What it left behind
 * was a hundred and two identical white pills, each one repeating the
 * word "SCORE" beside an amber triangle, with nothing happening under
 * the cursor until a click had already been committed. Correct, dense,
 * and completely inert. The owner read it in one sentence: it looks
 * plain and it does not invite a press.
 *
 * So the box went. The list is now a ruled ledger rather than a stack of
 * cards, which is where the last visible organisation came from: a row
 * separated by a hairline costs a hairline, and a card separated by a
 * gap costs six pixels a hundred and two times.
 *
 * ---------------------------------------------------------------
 * THE FIVE THINGS, AND WHY THE NUMBER IS THE DESK SCORE
 * ---------------------------------------------------------------
 *
 * THE RANK, because the list is ordered and an ordered list that does
 * not number itself makes a reader count.
 *
 * THE LANE MARK, because it is the shape of the sales call. A school
 * grad night and a corporate holiday party are two different
 * conversations, and the mark says which before the name is read.
 *
 * THE NAME, because it is what the row is, and because it is the
 * control that opens the record.
 *
 * THE STATUS, because a live conversation and a cold name are not the
 * same row however well either of them scores.
 *
 * THE DESK SCORE, and this is the one that had to be argued.
 *
 * The candidates were the score, the guest range and the distance, and
 * each of them decides something. Distance decides the route. Guests
 * decide the size of the prize. The score decides whether he goes at
 * all, and it is the only one of the three that already contains the
 * other information rather than competing with it: `scoreProspect`
 * folds in reachability, occasion class, whether the buying window is
 * open, likely size, and how much work has already gone in. Four of the
 * five things the figure grid used to spell out are inside it.
 *
 * It also does something the rank cannot. Rank is ordinal: it says this
 * organisation sits twelfth. The score is cardinal: it says twelfth is
 * an 84 and eighth was an 86, so the board has not fallen off a cliff
 * yet and the morning is still worth spending.
 *
 * AND IT IS NEVER MONEY. Nothing in this application shows revenue
 * before a signature. A dollar figure against an organisation nobody
 * has emailed would be a forecast wearing the clothes of a fact, on the
 * one screen where a reader decides who to spend the morning on.
 *
 * ---------------------------------------------------------------
 * THE SCORE IS NOW A LENGTH AS WELL AS A FIGURE
 * ---------------------------------------------------------------
 *
 * It used to sit as a bare numeral under the shouted word "SCORE",
 * which meant that reading the column meant reading digits, one row at
 * a time, a hundred and two times. Two channels replaced the word.
 *
 * A METER. `scoreProspect` is bounded by construction: forty points of
 * reachability, twenty five of occasion class, twenty of buying window
 * and fifteen of likely size, so a hundred is the ceiling and the
 * figure is already a percentage of something real. The bar under the
 * numeral is that percentage, drawn at a fixed track width so the fills
 * line up down the column and the eye reads the profile of the board
 * without reading a single digit.
 *
 * A WEIGHT RAMP. Seventy and over is set in the darkest ink at the
 * heaviest weight, forty five to sixty nine a step lighter, and under
 * forty five lighter again. Weight and length are both legible with
 * every drop of colour removed, which matters here more than most
 * places: the owner of this site is colourblind.
 *
 * The word "SCORE" is gone from the card and printed once, in the
 * pane's caption, over the column it labels.
 *
 * ---------------------------------------------------------------
 * A CONSTANT ROW HEIGHT IS A FEATURE, NOT A SIDE EFFECT
 * ---------------------------------------------------------------
 *
 * Every line in this list is the same height and every column inside it
 * starts at the same offset, so the eye runs down the ranks in one
 * line, down the names in another and down the scores in a third. That
 * is what makes a hundred rows comparable rather than merely listed,
 * and it is why the name is held to one line with an ellipsis instead
 * of being allowed to wrap: one long name would push its neighbours out
 * of alignment for the entire scroll.
 *
 * Nothing about being chosen, hovered or pressed changes the height, so
 * a reader who is halfway down the board never loses their place.
 *
 * ---------------------------------------------------------------
 * TWO CONTROLS, NEITHER INSIDE THE OTHER
 * ---------------------------------------------------------------
 *
 * The card is a plain box. A stretched button drawn BEHIND the content
 * fills it, selects the organisation, and carries the accessible name
 * and the focus ring. The organisation's NAME is a separate button that
 * opens the record. `RecordName` is never nested inside another
 * interactive element, because a button inside a button is markup a
 * browser silently rearranges.
 *
 * The stretched button is behind rather than over so the content keeps
 * its pointer events and the `title` on the score still appears. The
 * box catches a click on anything drawn; the button catches the
 * padding, the Enter key and the screen reader; the name stops its own
 * event before either of them.
 */

/**
 * The two intents a card can raise, kept here because the pane's own
 * props are typed against it and the board passes a handler down.
 *
 * Nothing on the card raises one any more. The union stays exported
 * rather than being pushed up into the pane because putting an action
 * back on a row, which is a decision the owner has already reversed
 * once in each direction, should be a change in this file.
 */
export type CardComposeIntent = "outreach" | "featured-promo";

/**
 * The ceiling `scoreProspect` can reach: forty for a published email
 * address, twenty five for a calendar-locked occasion, twenty for a
 * buying window inside the period and fifteen for likely size. It is
 * declared here rather than inferred from the visible rows because a
 * meter whose full length depends on whichever organisations survived
 * the filter would redraw the whole column every time somebody typed a
 * letter into the search box, and a bar that moves when its own number
 * has not is worse than no bar.
 */
const SCORE_CEILING = 100;

/**
 * Three bands, set where the board actually divides rather than at
 * tidy thirds. The hundred and two organisations run from twenty one to
 * ninety: seventy and over is the morning's work, forty five to sixty
 * nine is the rest of the week, and under forty five is the part of the
 * book that is on it for completeness. The band drives weight, never
 * hue, so it survives greyscale and it survives the owner's eyes.
 */
function scoreBand(score: number): "high" | "mid" | "low" {
  if (score >= 70) return "high";
  if (score >= 45) return "mid";
  return "low";
}

export interface ProspectListCardProps {
  line: DeskLine;
  /** Position in the ranked list. The list is an ordered list because of it. */
  rank: number;
  selected: boolean;
  onSelect: () => void;
  /**
   * 0 to 11. ACCEPTED AND NOT READ, and it stays on the interface for
   * one reason: the buying window moved to the detail pane with the
   * rest of the figure grid, but the desk, the map and this list are
   * all supposed to be looking at the same month, and the day one of
   * them starts reading the system clock instead is the day they
   * disagree about which rows are urgent.
   */
  nowMonth?: number;
  /** The list runs a roving tab order, so it decides which card is tabbable. */
  tabIndex?: number;
}

export function ProspectListCard({
  line,
  rank,
  selected,
  onSelect,
  tabIndex = 0,
}: ProspectListCardProps) {
  const p = line.prospect;

  const top = line.components.reduce(
    (best, c) => (c.points > best.points ? c : best),
    line.components[0],
  );

  const band = scoreBand(line.score);
  const fill = Math.max(
    0,
    Math.min(100, Math.round((line.score / SCORE_CEILING) * 100)),
  );

  return (
    <li
      className={styles.item}
      data-selected={selected || undefined}
      /*
        RHYTHM, AND IT COSTS NOTHING IN HEIGHT. A hundred and two
        identical lines is a wall, and the usual fixes for that are
        stripes, which are a second ground fighting the selected one,
        or extra padding, which is the density this list already spent
        four hundred pixels buying back.

        So the rhythm is put in the rank column instead, where the eye
        is already travelling. Every fifth rank is set in a darker ink
        and every tenth line closes with a slightly stronger rule, so
        the column reads in tens the way a ruler does, and a reader
        who has scrolled to somewhere around sixty knows it without
        stopping to read a numeral.
      */
      data-tick={rank % 5 === 0 || undefined}
      data-decade={rank % 10 === 0 || undefined}
      data-prospect-row={p.id}
    >
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
      <div className={styles.card} onClick={onSelect}>
        <button
          type="button"
          className={styles.select}
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
          }}
          tabIndex={tabIndex}
          data-prospect-id={p.id}
          aria-current={selected ? "true" : undefined}
          aria-label={`${p.name}, ${p.city}. Ranked ${rank} on this list, desk score ${line.score}.${
            selected ? " Showing in the detail pane." : ""
          }`}
        />

        {/*
          THE RANK IS THE SELECTION MARK. There is no separate flag and
          no rule down the left edge, which is the move the owner named
          and which every generated dashboard makes.

          The numeral sits in a block that is exactly the same size on
          every line in the list. Choosing an organisation stamps that
          block: the ground fills with ink and the digits reverse out
          of it. Nothing moves, nothing is added, and the thing that
          changes is the one glyph a reader is already using to keep
          their place. The word "Showing" is on the control's own
          accessible name and `aria-current` says the same thing to a
          screen reader, so the stamp is the third channel rather than
          the only one.
        */}
        <span className={styles.rankSlot} aria-hidden="true">
          <span className={`${styles.rank} num`}>{rank}</span>
        </span>

        <span className={styles.ident}>
          {/*
            Wrapped rather than given the class directly. `RecordName`
            declares `font: inherit` so that one component can be a
            table cell, a card title and a popup heading; handing it
            this card's own type rules as a second class of equal
            specificity would make which of the two wins depend on the
            order the bundler happened to emit them in.
          */}
          <span className={styles.name}>
            <RecordName prospectId={p.id} name={p.name} />
          </span>

          <span className={styles.chips}>
            <LaneChip lane={p.lane} size="sm" />
            <StatusChip status={line.status} size="sm" short />
          </span>
        </span>

        <span
          className={styles.scoreBlock}
          data-band={band}
          title={`Desk score ${line.score} out of ${SCORE_CEILING}. ${top?.label ?? "Desk score"}. ${top?.why ?? "The desk ranks on reachability, occasion class, buying window and likely size."}`}
        >
          <span className="visually-hidden">Desk score </span>
          <span className={`${styles.score} num`}>{line.score}</span>
          <span className={styles.scoreFoot}>
            {/*
              The meter is the figure again as a length, so it carries
              no information the numeral does not and needs no label of
              its own. It is hidden from the accessibility tree for
              exactly that reason: a screen reader reading "eighty
              nine, eighty nine per cent" twice a row down a hundred
              and two rows is noise, not access.
            */}
            <span
              className={styles.meter}
              style={{ ["--fill" as string]: `${fill}%` } as CSSProperties}
              aria-hidden="true"
            />
            <ProvenanceBadge provenance="modeled" compact />
          </span>
        </span>
      </div>
    </li>
  );
}
