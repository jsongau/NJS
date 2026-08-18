import { useMemo } from "react";
import { EXHIBITION_LABEL, HANDLE_NOTE, formatCupDate } from "@/domain/cup";
import { MATCH_STATE } from "@/domain/cup";
import type { TapeRow } from "@/domain/selectors/cup";
import {
  currentCup,
  fixtureView,
  taleOfTheTape,
} from "@/domain/selectors/cup";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { TokenMark } from "@/components/licensing/Panels";
import { TeamName } from "@/components/cup/board/CupNames";
import {
  CupBlock,
  CupDialog,
  SimulatedMark,
} from "@/components/cup/profile/CupDialog";
import { FormStrip } from "@/components/cup/profile/FormStrip";
import styles from "./TaleOfTheTape.module.css";

/**
 * THE TALE OF THE TAPE. TWO TEAMS, SIDE BY SIDE, BEFORE A FIXTURE.
 *
 * ── HOW STRENGTH IS ENCODED, AND WHY IT IS NOT A RADAR ────────────
 * PAIRED HORIZONTAL BARS GROWING OUTWARD FROM A CENTRE LINE, with the
 * favoured value in bold and the direction of good printed in words on
 * every numeric row.
 *
 * Length is the encoding human vision reads most accurately, and the two
 * sides are told apart by DIRECTION, which is geometry rather than
 * colour. The card therefore carries its whole meaning with no colour at
 * all: the length, the printed number, the bold weight, the mark and the
 * word all say the same thing, so it survives greyscale, a printout on a
 * general manager's desk and a colourblind reader.
 *
 * There is no radar chart here and there is not going to be one. It is
 * the single most tempting graphic for a panel called "strength" and it
 * is the one the literature is most united against: the shape depends on
 * the arbitrary order of the axes, the lines joining unrelated
 * categories mean nothing, and comparing across axes asks a reader to
 * mentally rotate an arc, which human vision handles badly. Bars, small
 * multiples and tables are the recommendation every time.
 *
 * ── AND WHAT IS DELIBERATELY NOT ON IT ────────────────────────────
 * No body measurement of any kind. The classic tale of the tape is
 * fourteen anthropometric rows and it begins at a weigh in, and a family
 * entertainment centre selling league nights to schools, church groups
 * and office teams cannot put a customer's body on a screen. Ball weight
 * is the substitute and it lives on the bowler profile, because it is a
 * fun field and a useless predictor, which is exactly what a decorative
 * tape row is.
 *
 * No betting odds. No win probability. No trash talk, no callout, no
 * staredown. The fight card is the costume; bowling is the body
 * underneath, and every row on this card is a bowling row.
 *
 * ── THE DECIDER ───────────────────────────────────────────────────
 * One named row, promoted to the top, chosen by the selector as the row
 * where the two teams are furthest apart in proportion to the numbers
 * involved. A card with six numbers on it has told a reader nothing
 * about which one matters tonight.
 */

export function TaleOfTheTapeModal({
  fixtureId,
  active,
  onClose,
}: {
  fixtureId: string;
  active: boolean;
  onClose: () => void;
}) {
  const cup = useMemo(() => currentCup(), []);
  const fixture = useMemo(() => fixtureView(fixtureId), [fixtureId]);

  const aId = fixture?.sides[0].team?.id ?? null;
  const bId = fixture?.sides[1].team?.id ?? null;

  const tape = useMemo(
    () => (aId && bId ? taleOfTheTape(cup.id, aId, bId) : null),
    [cup.id, aId, bId],
  );

  if (!fixture) return null;

  const token = MATCH_STATE[fixture.state];
  const aName = fixture.sides[0].team?.name ?? "Not known yet";
  const bName = fixture.sides[1].team?.name ?? "Not known yet";

  const subject = `${fixture.round.name}, night ${fixture.night}, lanes ${fixture.lanes[0]} and ${fixture.lanes[1]}, ${formatCupDate(fixture.date)}`;

  return (
    <CupDialog
      idBase="cup-tape"
      eyebrow="Tale of the tape"
      title={
        /* The spaces between these three are real text nodes rather than
           only a flex gap, because the accessible name is computed from
           the text content and a gap is not text. */
        <span className={styles.title}>
          <span className={styles.titleTeam}>{aName}</span>{" "}
          <span className={styles.titleAgainst}>against</span>{" "}
          <span className={styles.titleTeam}>{bName}</span>
        </span>
      }
      subject={subject}
      active={active}
      onClose={onClose}
      closeLabel={`Close the tale of the tape for ${aName} against ${bName}`}
      dataAttr={{ "data-cup-tape-card": fixtureId }}
      meta={
        <>
          <TokenMark token={token} small />
          {fixture.label ? <SimulatedMark label={fixture.label} /> : null}
          <ProvenanceBadge provenance={fixture.provenance} compact />
        </>
      }
      foot={
        <>
          <span aria-hidden="true">◇</span>
          <span>{HANDLE_NOTE}</span>
        </>
      }
    >
      {tape ? (
        <>
          {/* =====================================================
              1. THE STAT THAT DECIDES IT
              ===================================================== */}
          <CupBlock
            title="The stat that decides it"
            meta={
              <>
                <SimulatedMark label={EXHIBITION_LABEL} />
                <ProvenanceBadge provenance="illustrative" compact />
              </>
            }
            lede="One row, chosen as the row where these two are furthest apart. A card with six numbers on it has not told anybody which one matters tonight."
          >
            <div className={styles.decider}>
              <TapeRowView
                row={tape.decider}
                aName={aName}
                bName={bName}
                emphasis
              />
            </div>
            {tape.decider.note ? (
              <p className={styles.deciderNote}>{tape.decider.note}</p>
            ) : null}
          </CupBlock>

          {/* =====================================================
              2. HOW TO READ THE CARD
              ===================================================== */}
          <CupBlock title="How to read this card">
            <p className={styles.key}>
              Both teams are drawn as paired bars against the same scale,
              growing outward from the centre line on a wide screen and
              stacked under the row name on a narrow one. Longer is more.
              The direction of good is printed on every numeric row, the
              favoured value is set in bold and carries the mark and the
              word, and nothing on this card is told apart by colour alone.
            </p>
            <p className={styles.key}>
              There is no win probability here and there is not going to be
              one. Nothing has been bowled in this building, a model fitted
              to a simulation is a number about a simulation, and the seed
              difference does the same job honestly.
            </p>
          </CupBlock>

          {/* =====================================================
              3. HEAD TO HEAD
              ===================================================== */}
          <CupBlock title="Head to head">
            <p className={styles.h2h}>{tape.headToHead.sentence}</p>
            <div className={styles.forms}>
              <div className={styles.formSide}>
                <span className={styles.formName}>
                  <TeamName teamId={tape.a.team.id} name={aName} />
                </span>
                <FormStrip form={tape.a.form} label="Last five" />
              </div>
              <div className={styles.formSide}>
                <span className={styles.formName}>
                  <TeamName teamId={tape.b.team.id} name={bName} />
                </span>
                <FormStrip form={tape.b.form} label="Last five" />
              </div>
            </div>
            <p className={styles.formNote}>
              Oldest on the left, reading into tonight. The letter is the
              signal and the colour is second.
            </p>
          </CupBlock>

          {/* =====================================================
              4. THE TAPE
              ===================================================== */}
          <CupBlock
            title="The tape"
            meta={
              <>
                <SimulatedMark label={tape.label} />
                <ProvenanceBadge provenance="illustrative" compact />
              </>
            }
            lede="The first seven rows are true today with the building shut. The rest come out of the declared exhibition and every one of them carries its label."
          >
            {/* The two names, once, above the rows. Each row carries
                them too, clipped on a desk and visible on a phone where
                the three columns become a stack and there is no column
                head to read from. */}
            <div className={styles.rowsHead} aria-hidden="true">
              <span className={styles.rowsHeadA}>{aName}</span>
              <span className={styles.rowsHeadSpine}>Row</span>
              <span className={styles.rowsHeadB}>{bName}</span>
            </div>

            <div className={styles.rows}>
              {tape.rows.map((row) => (
                <TapeRowView
                  key={row.key}
                  row={row}
                  aName={aName}
                  bName={bName}
                />
              ))}
            </div>
          </CupBlock>
        </>
      ) : (
        /* =======================================================
           A FIXTURE WITH ONE SIDE STILL BEING BOWLED FOR
           ======================================================= */
        <CupBlock
          title="One side is still being bowled for"
          lede="A tale of the tape needs two teams. This fixture has one, and the rule that fills the other is printed rather than implied."
        >
          <ul className={styles.pending}>
            {fixture.sides.map((side, i) => (
              <li key={i} className={styles.pendingSide}>
                <span className={styles.pendingLabel}>
                  Side <span className="num">{i + 1}</span>
                </span>
                {side.team ? (
                  <TeamName teamId={side.team.id} name={side.team.name} />
                ) : (
                  <span className={styles.pendingRule}>
                    {side.rule ?? "Not known yet"}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </CupBlock>
      )}
    </CupDialog>
  );
}

/* ---------------------------------------------------------------
   One row of the tape
   --------------------------------------------------------------- */

/**
 * A row, as paired bars or as paired words.
 *
 * A row gets bars only where both sides carry a comparable number that
 * a bar can honestly draw. Identity rows have no number, and the claimed
 * date is ordered on a negative timestamp so that earlier ranks higher,
 * which is a correct ordering key and a nonsense bar length. Both fall
 * back to paired words with the same bold weight and the same mark, so
 * the edge is stated the same way on every row of the card.
 */
function TapeRowView({
  row,
  aName,
  bName,
  emphasis = false,
}: {
  row: TapeRow;
  aName: string;
  bName: string;
  emphasis?: boolean;
}) {
  /* The one row whose printed value is a raw date. The selector hands
     it over as the stored string because it orders that row on a
     timestamp, and every other date on this application is written the
     same way, so it is written that way here too. Formatting is not
     arithmetic and the card still computes nothing. */
  const aText = row.key === "claimed" ? formatCupDate(row.a) : row.a;
  const bText = row.key === "claimed" ? formatCupDate(row.b) : row.b;

  const drawable =
    row.aValue !== null &&
    row.bValue !== null &&
    row.aValue >= 0 &&
    row.bValue >= 0 &&
    row.direction !== "none";

  const scale = drawable
    ? Math.max(row.aValue as number, row.bValue as number, 1)
    : 1;
  const aPct = drawable ? ((row.aValue as number) / scale) * 100 : 0;
  const bPct = drawable ? ((row.bValue as number) / scale) * 100 : 0;

  const direction =
    row.direction === "none"
      ? null
      : row.direction === "lower"
        ? `${row.directionLabel}, so the shorter bar holds it`
        : `${row.directionLabel}, so the longer bar holds it`;

  return (
    <div
      className={[
        styles.row,
        emphasis ? styles.rowEmphasis : "",
        drawable ? "" : styles.rowText,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Side A. The value sits at the outer edge and the bar grows in
          towards the spine from it, which is what "outward from the
          centre" looks like on the left hand side. */}
      <div className={`${styles.side} ${styles.sideA}`}>
        <span className={styles.sideName}>{aName}</span>
        <span
          className={
            row.edge === "a" ? `${styles.value} ${styles.valueEdge}` : styles.value
          }
        >
          {aText}
          {row.edge === "a" ? (
            <span className={styles.edgeMark}>
              <span aria-hidden="true">★</span> Edge
              <span className="visually-hidden">
                , holds the {row.label} row
              </span>
            </span>
          ) : null}
        </span>
        {drawable ? (
          <span className={styles.track} aria-hidden="true">
            <span
              className={
                row.edge === "a" ? `${styles.fill} ${styles.fillEdge}` : styles.fill
              }
              style={{ width: `${aPct}%` }}
            />
          </span>
        ) : null}
      </div>

      {/* The spine, carrying the row name and the direction of good. */}
      <div className={styles.spine}>
        <span className={styles.rowLabel}>{row.label}</span>
        {direction ? (
          <span className={styles.direction}>{direction}</span>
        ) : (
          <span className={styles.direction}>Neither is better</span>
        )}
        {row.simulated ? (
          <span className={styles.rowSimulated}>
            <span aria-hidden="true">◍</span> Simulated
          </span>
        ) : null}
      </div>

      <div className={`${styles.side} ${styles.sideB}`}>
        <span className={styles.sideName}>{bName}</span>
        <span
          className={
            row.edge === "b" ? `${styles.value} ${styles.valueEdge}` : styles.value
          }
        >
          {bText}
          {row.edge === "b" ? (
            <span className={styles.edgeMark}>
              <span aria-hidden="true">★</span> Edge
              <span className="visually-hidden">
                , holds the {row.label} row
              </span>
            </span>
          ) : null}
        </span>
        {drawable ? (
          <span className={styles.track} aria-hidden="true">
            <span
              className={
                row.edge === "b" ? `${styles.fill} ${styles.fillEdge}` : styles.fill
              }
              style={{ width: `${bPct}%` }}
            />
          </span>
        ) : null}
      </div>

      {row.note && !emphasis ? (
        <p className={styles.rowNote}>{row.note}</p>
      ) : null}
    </div>
  );
}
