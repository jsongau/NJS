import { useMemo } from "react";
import type { Cup } from "@/domain/cup";
import type { TeamFormation } from "@/domain/leagues";
import {
  EXHIBITION_LABEL,
  HANDLE_NOTE,
  formatCupDate,
  MATCH_STATE,
} from "@/domain/cup";
import {
  POSITION_LABEL,
  ROSTER_STATE,
  SLOT_STATE,
  TEAM_FORMATION,
} from "@/domain/leagues";
import type { CupTeamView, RunStep } from "@/domain/selectors/cup";
import {
  CUP_STANDING_LABEL,
  CUP_STANDING_NOTE,
  cupTeam,
  currentCup,
  enrollingCup,
  teamView,
} from "@/domain/selectors/cup";
import { CUP_ENTRIES } from "@/data/cup";
import { LEAGUE_TEAM_BY_ID } from "@/data/leagues";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { TokenMark } from "@/components/licensing/Panels";
import { RecordName } from "@/components/record/RecordName";
import {
  BowlerHandle,
  MatchupPress,
  TeamName,
} from "@/components/cup/board/CupNames";
import {
  CupBlock,
  CupDialog,
  CupFact,
  CupFacts,
  SimulatedMark,
} from "./CupDialog";
import { EstablishedFigure } from "./NotEstablished";
import { FormStrip } from "./FormStrip";
import styles from "./TeamSurface.module.css";

/**
 * THE TEAM.
 *
 * ── WHAT IS ON IT, AND WHY IN THIS ORDER ──────────────────────────
 * One. HOW IT FORMED, above everything. The owner asked for teams to be
 * clickable and for it to be visible whether the venue formed the league
 * and the public joined, whether a captain brought a roster, or whether
 * an organisation fielded it. Those are not three labels on one product,
 * they are THREE DIFFERENT PRODUCTS with three different next moves: a
 * venue formed team is proof the house can build a team out of strangers
 * and it needs the most support to survive a first season; a captain
 * formed team is five customers who arrived together and the captain is
 * the whole relationship; an organisation formed team came off the
 * prospecting board and the employer behind it can usually field a
 * second one. So each route gets its own sentence about what to do
 * about it, and the organisation is a live name that opens its record.
 *
 * Two. THE ROSTER, by handle and position, with the captain marked.
 *
 * Three. THE RUN IN THE CUP, every fixture in night order, with the
 * matchup card one press away from each one.
 *
 * Four. THE REGISTRATION FEE, badged illustrative, described as this
 * application's own proposal and never as a Round1 price. Round1
 * publishes no dollar amount for a league anywhere and neither does
 * Bowlero or Lucky Strike; all three route the question to a person.
 * That is why the fee here says whose it is.
 *
 * ── NOBODY IS NAMED ───────────────────────────────────────────────
 * Every bowler is a handle and a position. The disclosure sits in the
 * foot of this dialog where a roster first appears, and it is one line
 * because one line is the whole truth.
 */

/** What each route means for the person reading this on a Monday. */
const FORMATION_MOVE: Record<TeamFormation, string> = {
  "venue-formed":
    "The house put this team together out of individual sign ups. Nobody arrived with four friends, so this is the team that needs the most support to reach a second season, and it is the proof that the venue can build a team from nothing.",
  "captain-formed":
    "A captain walked in with a whole roster. Five customers who arrived together, at almost no cost to the venue, and the captain is the relationship. There is nobody else on this team to ring.",
  "organisation-formed":
    "This team came off the prospecting board. An employer that fielded one team can usually field a second, which is worth more than either booking on its own.",
};

export function TeamSurface({
  teamId,
  active,
  onClose,
}: {
  teamId: string;
  active: boolean;
  onClose: () => void;
}) {
  const cup = useMemo(() => currentCup(), []);
  const next = useMemo(() => enrollingCup(), []);

  /* A team in the field reads its run out of the cup. A team that is
     not in the field is not a lesser team, it is a team that did not
     have five bodies in August, and it gets the same surface without a
     seed and without a bracket. */
  const entered = useMemo(
    () =>
      CUP_ENTRIES.some((e) => e.cupId === cup.id && e.teamId === teamId),
    [cup.id, teamId],
  );

  const view = useMemo<CupTeamView | null>(
    () => (entered ? cupTeam(cup.id, teamId) : teamView(teamId)),
    [entered, cup.id, teamId],
  );

  if (!view) return null;

  /* The fee is a forward looking proposal, so it is the fee of the cup
     this team is actually in: the one it is bowling if it is in the
     field, and the one taking teams if it is not. */
  const feeCup: Cup = entered ? cup : (next ?? cup);
  const team = view.team;
  const rosterState = ROSTER_STATE[
    view.roster.length >= (view.league?.teamSize ?? 5) ? "full" : "short"
  ];
  const seats = Math.max(
    0,
    (view.league?.teamSize ?? 5) - team.bowlersCommitted,
  );

  return (
    <CupDialog
      idBase="cup-team"
      eyebrow="Team"
      title={team.name}
      subject={
        view.league
          ? `${view.league.name}, ${view.league.night} night`
          : "Cup team"
      }
      active={active}
      onClose={onClose}
      closeLabel={`Close the team surface for ${team.name}`}
      dataAttr={{ "data-cup-team-surface": teamId }}
      meta={
        <>
          <TokenMark token={TEAM_FORMATION[view.formation]} small />
          <TokenMark token={SLOT_STATE[team.slotState]} small />
          <TokenMark token={rosterState} small />
          {view.seed !== null ? (
            <span className={styles.seed}>
              Seed <span className="num">{view.seed}</span> of{" "}
              <span className="num">{cup.fieldSize}</span>
            </span>
          ) : null}
          <ProvenanceBadge provenance={team.provenance} compact />
        </>
      }
      foot={
        <>
          <span aria-hidden="true">◇</span>
          <span>{HANDLE_NOTE}</span>
        </>
      }
    >
      {/* =========================================================
          1. HOW IT FORMED
          ========================================================= */}
      <CupBlock
        title="How this team formed"
        meta={<TokenMark token={TEAM_FORMATION[view.formation]} small />}
        lede={TEAM_FORMATION[view.formation].note}
      >
        <p className={styles.move}>{FORMATION_MOVE[view.formation]}</p>

        <CupFacts>
          <CupFact label="Route in">
            {TEAM_FORMATION[view.formation].label}
          </CupFact>
          <CupFact label="Captain">
            {view.captain ? (
              <>
                <BowlerHandle handle={view.captain.handle} />
                <span className={styles.captainRole}>{team.captainRole}</span>
              </>
            ) : (
              team.captainRole
            )}
          </CupFact>
          <CupFact label="Claimed the slot">
            {formatCupDate(team.claimedAt)}
          </CupFact>
          <CupFact label="Off the board" wide>
            {view.prospect ? (
              <>
                <RecordName prospectId={view.prospect.id} />
                {team.affiliationBasis ? (
                  <span className={styles.basis}>{team.affiliationBasis}</span>
                ) : null}
              </>
            ) : (
              <span className={styles.none}>
                <span aria-hidden="true">○</span> No organisation behind it.
                This one is the venue's own to keep.
              </span>
            )}
          </CupFact>
        </CupFacts>

        {team.note ? (
          <p className={styles.teamNote}>
            <span aria-hidden="true">◆</span> {team.note}
          </p>
        ) : null}
      </CupBlock>

      {/* =========================================================
          2. THE ROSTER
          ========================================================= */}
      <CupBlock
        title="Roster"
        meta={
          <>
            <span>
              <span className="num">{team.bowlersCommitted}</span> of{" "}
              <span className="num">{view.league?.teamSize ?? 5}</span> bowlers
            </span>
            {seats > 0 ? (
              <span className={styles.seats}>
                <span aria-hidden="true">▱</span>{" "}
                <span className="num">{seats}</span> seat
                {seats === 1 ? "" : "s"} open
              </span>
            ) : null}
          </>
        }
        lede="Every bowler is a handle and a position. Press one to open the profile."
      >
        <ul className={styles.roster}>
          {view.roster.map((b) => (
            <li key={b.bowler.handle} className={styles.rosterRow}>
              <span className={styles.rosterHandle}>
                <BowlerHandle handle={b.bowler.handle} />
              </span>
              <span className={styles.rosterPosition}>
                {POSITION_LABEL[b.bowler.position]}
              </span>
              {b.bowler.isCaptain ? (
                <span className={styles.captainMark}>
                  <span aria-hidden="true">◆</span> Captain
                </span>
              ) : (
                <span className={styles.captainMark} />
              )}
              <span className={styles.rosterBall}>
                {b.ball.weightLb ? (
                  <>
                    <span className="num">{b.ball.weightLb}</span> pound
                  </>
                ) : (
                  "Weight not given"
                )}
                {b.ball.ownership === "own-ball" ? ", own ball" : ", house ball"}
              </span>
            </li>
          ))}
        </ul>
      </CupBlock>

      {/* =========================================================
          3. THE RUN
          ========================================================= */}
      <CupBlock
        title={entered ? `Run in ${cup.name}` : "Not in the current field"}
        meta={
          entered ? (
            <>
              <span className={styles.standing}>
                {CUP_STANDING_LABEL[view.standing]}
              </span>
              <SimulatedMark label={EXHIBITION_LABEL} />
              <ProvenanceBadge provenance="illustrative" compact />
            </>
          ) : null
        }
        lede={
          entered
            ? CUP_STANDING_NOTE[view.standing]
            : "This team did not have five bowlers in August, and a Baker game needs five because the five share the ten frames between them. It can enter the next cup."
        }
      >
        {entered ? (
          <>
            <FormStrip
              form={view.form}
              label="Form, last five"
              note="Oldest on the left, reading into tonight. The letter is the signal and the colour is second."
            />
            <ol className={styles.run}>
              {view.run.map((step) => (
                <RunRow key={step.fixture.fixture.id} step={step} />
              ))}
            </ol>
          </>
        ) : (
          <p className={styles.blank}>
            No fixtures. The next cup takes teams now.
          </p>
        )}
      </CupBlock>

      {/* =========================================================
          4. THE FEE
          ========================================================= */}
      <CupBlock
        title="Registration"
        meta={<ProvenanceBadge provenance={feeCup.registrationFeeProvenance} />}
        lede={`For a team of ${feeCup.teamSize} in ${feeCup.name}.`}
      >
        <div className={styles.fee}>
          <p className={styles.feeValue}>
            <span className="num">${feeCup.registrationFee}</span>
            <span className={styles.feeUnit}>a team</span>
          </p>
          <p className={styles.feeSplit}>
            <span className="num">
              ${Math.round(feeCup.registrationFee / feeCup.teamSize)}
            </span>{" "}
            a bowler across {feeCup.teamSize}
          </p>
        </div>
        <p className={styles.feeNote}>{feeCup.registrationFeeNote}</p>
      </CupBlock>

      {/* =========================================================
          5. THE TEAM AVERAGE, WHICH DOES NOT EXIST
          ========================================================= */}
      <CupBlock title="Team average">
        <EstablishedFigure
          label="Team average"
          figure={view.average}
          starts="The counter starts on the first league night, which is the first time five bowlers each bowl a game of their own."
          rule={`Handicap will be ${cup.handicapFactorPct} per cent of ${cup.handicapBasis} once there are averages to compute one from. That basis is this proposal's own and Round1 publishes no handicap system.`}
        />
      </CupBlock>
    </CupDialog>
  );
}

/* ---------------------------------------------------------------
   One fixture in a team's run
   --------------------------------------------------------------- */

function RunRow({ step }: { step: RunStep }) {
  const f = step.fixture;
  const me = f.sides[step.index];
  const them = f.sides[step.index === 0 ? 1 : 0];
  const token = MATCH_STATE[f.state];
  const opponentName =
    step.opponent?.name ??
    LEAGUE_TEAM_BY_ID[them.team?.id ?? ""]?.name ??
    null;

  return (
    <li className={styles.runRow}>
      <div className={styles.runHead}>
        <span className={styles.runNight}>
          Night <span className="num">{f.night}</span>
        </span>
        <span className={styles.runRound}>{f.round.name}</span>
        <TokenMark token={token} small />
      </div>

      <div className={styles.runBody}>
        <span className={styles.runOpponent}>
          {opponentName && them.team ? (
            <>
              Against <TeamName teamId={them.team.id} name={opponentName} />
            </>
          ) : (
            <span className={styles.runRule}>
              {step.opponentRule ?? "Opponent not known yet"}
            </span>
          )}
        </span>

        {step.outcome === "pending" ? (
          <span className={styles.runPending}>Not bowled</span>
        ) : (
          <span className={styles.runScore}>
            <span
              className={
                step.outcome === "won" ? styles.runWon : styles.runLost
              }
            >
              <span aria-hidden="true">
                {step.outcome === "won" ? "■" : "□"}
              </span>{" "}
              {step.outcome === "won" ? "Won" : "Lost"}
            </span>{" "}
            <span className="num">{me.gamesWon}</span>
            <span className={styles.runDash}> to </span>
            <span className="num">{them.gamesWon}</span>
            <span className={styles.runPins}>
              , <span className="num">{me.pinfall}</span> pins
            </span>
          </span>
        )}
      </div>

      <div className={styles.runFoot}>
        <MatchupPress
          fixtureId={f.fixture.id}
          label="Tale of the tape"
          accessibleName={`${me.team?.name ?? "This team"} against ${opponentName ?? "an opponent not known yet"}`}
        />
        <span className={styles.runWhen}>
          Lanes <span className="num">{f.lanes[0]}</span> and{" "}
          <span className="num">{f.lanes[1]}</span>, {formatCupDate(f.date)}
        </span>
        {f.label ? <SimulatedMark label={f.label} /> : null}
      </div>
    </li>
  );
}
