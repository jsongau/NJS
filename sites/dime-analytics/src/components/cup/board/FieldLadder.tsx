import type { CupLadderRow } from "@/domain/selectors/cup";
import { CUP_STANDING_LABEL, CUP_STANDING_NOTE } from "@/domain/selectors/cup";
import { EXHIBITION_LABEL } from "@/domain/cup";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { TokenMark } from "@/components/licensing/Panels";
import { RecordName } from "@/components/record/RecordName";
import { formationToken } from "./EnrollmentPanel";
import { TeamName } from "./CupNames";
import styles from "./FieldLadder.module.css";

/**
 * THE FIELD OF SIXTEEN, RANKED ON WHAT HAS BEEN BOWLED.
 *
 * ── THE ANSWER TO THE QUESTION THE BOARD EXISTS FOR ───────────────
 * A rep does not open a cup board to admire a tree. The three things
 * worth knowing are who is in it, who is one conversation away from
 * bringing four more people into the building, and which team a message
 * should go to. So the row carries the team, the organisation behind it
 * where there is one, how it came to exist, and where it stands, and
 * every one of those is a press.
 *
 * ── THERE IS NO VALUE FOR "OUT" AND THAT IS THE FORMAT ────────────
 * A team beaten in the Cup moves into the Plate, a team beaten in the
 * Plate bowls the Long Game for banked pins, and all sixteen are on a
 * lane on finals night in the stepladder, the Plate final or the handicap
 * sweeper. `CupStanding` has three values and none of them is a
 * euphemism, because losing changes which competition tonight's pins
 * count towards rather than whether there is one.
 *
 * ── TWO SORT KEYS AND BOTH ARE COLUMNS ────────────────────────────
 * Matches won, then pins per Baker game. A rate rather than a total,
 * because a best of five is three, four or five games depending on how
 * one sided it was, so ranking on total pins would put a team that needed
 * five games to win above a team that won in three. Both keys are on the
 * table so the order can be checked by eye, and there is no composite
 * score with a weighting a reader would have to take on trust.
 *
 * ── EVERY FIGURE HERE IS SIMULATED AND SAYS SO ────────────────────
 * The label and the badge sit on the table caption line rather than being
 * repeated sixteen times, and every row carries the badge in its last
 * cell so a printed page cannot lose it.
 */

function Form({ form }: { form: string[] }) {
  if (form.length === 0) {
    return <span className={styles.formNone}>No matches yet</span>;
  }
  return (
    <span className={styles.form}>
      {form.map((letter, i) => (
        <span
          key={`${letter}-${i}`}
          className={styles.formLetter}
          data-result={letter === "W" ? "won" : "lost"}
        >
          {letter}
        </span>
      ))}
      <span className="visually-hidden">
        , oldest first, {form.filter((f) => f === "W").length} won of{" "}
        {form.length}
      </span>
    </span>
  );
}

export function FieldLadder({ rows }: { rows: CupLadderRow[] }) {
  return (
    <div className={styles.wrap}>
      <p className={styles.basis}>
        <span aria-hidden="true">◍</span> {EXHIBITION_LABEL}. Ranked on matches
        won, then pins per Baker game. Both are columns.{" "}
        <ProvenanceBadge provenance="illustrative" compact />
      </p>

      <table className={styles.table}>
        <caption className="visually-hidden">
          The field of sixteen in the cup running now, ranked on matches won
          then pins per Baker game. Every figure is from the declared
          exhibition.
        </caption>
        <thead>
          <tr>
            <th scope="col" className={styles.colRank}>
              Rank
            </th>
            <th scope="col">Team</th>
            <th scope="col">Seed</th>
            <th scope="col">Standing</th>
            <th scope="col">Record</th>
            <th scope="col">Pins per game</th>
            <th scope="col">Form</th>
            <th scope="col">Opponent seed</th>
            <th scope="col">Formed</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.team.id} className={styles.row} data-standing={row.standing}>
              <th scope="row" className={styles.colRank}>
                <span className={`${styles.rank} num`}>{row.rank}</span>
              </th>
              <td data-label="Team">
                <span className={styles.team}>
                  <TeamName teamId={row.team.id} name={row.team.name} />
                </span>
                <span className={styles.org}>
                  {row.prospect ? (
                    <RecordName prospectId={row.prospect.id} />
                  ) : (
                    "No organisation behind it"
                  )}
                </span>
              </td>
              <td data-label="Seed">
                <span className="num">{row.seed ?? 0}</span>
                <span className={styles.of}> of {rows.length}</span>
              </td>
              <td data-label="Standing">
                <span
                  className={styles.standing}
                  title={CUP_STANDING_NOTE[row.standing]}
                >
                  <span aria-hidden="true">
                    {row.standing === "in-the-cup"
                      ? "★"
                      : row.standing === "in-the-plate"
                        ? "✧"
                        : "▦"}
                  </span>{" "}
                  {CUP_STANDING_LABEL[row.standing]}
                </span>
              </td>
              <td data-label="Record">
                <span className="num">{row.won}</span> won,{" "}
                <span className="num">{row.lost}</span> lost
              </td>
              <td data-label="Pins per game">
                <span className="num">{row.pinsPerGame.toFixed(1)}</span>
              </td>
              <td data-label="Form">
                <Form form={row.form} />
              </td>
              <td data-label="Opponent seed">
                {row.averageOpponentSeed === null ? (
                  <span className={styles.formNone}>No matches yet</span>
                ) : (
                  <span className="num">
                    {row.averageOpponentSeed.toFixed(1)}
                  </span>
                )}
              </td>
              <td data-label="Formed">
                <TokenMark token={formationToken(row.formation)} small />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className={styles.foot}>
        <span aria-hidden="true">◇</span> Average opponent seed is quality of
        opposition, which is the one idea worth taking from a boxing record. A
        three and nothing means nothing without the seeds it was won against,
        and lower is harder.
      </p>
    </div>
  );
}
