import { useMemo } from "react";
import {
  CORE_LABEL,
  COVERSTOCK_LABEL,
  ESTABLISHED_AVERAGE_GAMES,
  HAND_LABEL,
  HANDLE_NOTE,
  OWNERSHIP_LABEL,
  SURFACE_LABEL,
  formatCupDate,
} from "@/domain/cup";
import { POSITION_LABEL, TEAM_FORMATION } from "@/domain/leagues";
import {
  bowlerViewBySlug,
  currentCup,
  enrollingCup,
  formFor,
  seedOf,
} from "@/domain/selectors/cup";
import { CUP_ENTRIES } from "@/data/cup";
import { LEAGUE_BY_ID } from "@/data/leagues";
import { PROSPECT_BY_ID } from "@/data/prospects";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { TokenMark } from "@/components/licensing/Panels";
import { RecordName } from "@/components/record/RecordName";
import { TeamName } from "@/components/cup/board/CupNames";
import {
  CupBlock,
  CupDialog,
  CupFact,
  CupFacts,
  SimulatedMark,
} from "./CupDialog";
import { EstablishedFigure, NotEstablishedLine } from "./NotEstablished";
import { FormStrip } from "./FormStrip";
import styles from "./BowlerProfile.module.css";

/**
 * ONE BOWLER, AS A HANDLE.
 *
 * ── THE FIELD LIST IS THE RESEARCH'S, NOT AN INVENTION ────────────
 * Identity, then the debut that stands where a record would be, then the
 * exhibition figures with the word "simulated" on the same line as every
 * number, then the ball, then the voice. That order is deliberate: the
 * things that are TRUE TODAY come first and the generated ones come
 * after, so a reader who stops halfway has read only facts.
 *
 * ── THE PART THAT IS NOT A GAP ────────────────────────────────────
 * The record, the average and the handicap are all "not yet
 * established", and that is the whole point of the profile rather than a
 * hole in it. Nobody has bowled a competitive frame in this building.
 * Bowling's own governing body handles this exact case by declaring the
 * average not established, using the first night's actual pins, and re
 * rating once there is enough evidence; its guidance calls assigned flat
 * averages inaccurate. So the counter reads zero of twenty one with the
 * distance printed, and the rule that will produce the figure is printed
 * under it. See `NotEstablished.tsx` for the argument in full.
 *
 * ── THE BALL, AND WHY THERE IS NO BODY ANYWHERE HERE ──────────────
 * The tale of the tape this surface borrows its grammar from began at a
 * boxing weigh in and its classic form is fourteen body measurements.
 * Not one of them crosses over. A family entertainment centre selling
 * league nights to schools, church groups and office teams cannot put a
 * customer's body on a screen, as a joke or otherwise. BALL WEIGHT IS
 * THE SUBSTITUTE and it is a better field anyway: "I throw a fourteen"
 * is a thing somebody says about themselves without being asked, and it
 * is a fact about equipment rather than about a person.
 *
 * ── AND NOBODY IS NAMED ───────────────────────────────────────────
 * There is no name field on `Bowler` and there is nowhere to put one.
 * The disclosure is one line in the foot and it is the whole disclosure.
 */

export function BowlerProfile({
  slug,
  active,
  onClose,
}: {
  slug: string;
  active: boolean;
  onClose: () => void;
}) {
  const cup = useMemo(() => currentCup(), []);
  const next = useMemo(() => enrollingCup(), []);
  const view = useMemo(() => bowlerViewBySlug(slug), [slug]);

  if (!view) return null;

  const b = view.bowler;
  const team = view.team;
  const league = team ? (LEAGUE_BY_ID[team.leagueId] ?? null) : null;
  const prospect = team?.prospectId
    ? (PROSPECT_BY_ID[team.prospectId] ?? null)
    : null;

  const entered = team
    ? CUP_ENTRIES.some((e) => e.cupId === cup.id && e.teamId === team.id)
    : false;
  const seed = team ? seedOf(cup.id, team.id) : null;
  const form = team && entered ? formFor(cup.id, team.id) : [];
  const ex = view.exhibition;
  const ball = view.ball;

  return (
    <CupDialog
      idBase="cup-bowler"
      eyebrow="Bowler"
      title={<span className={styles.handle}>{b.handle}</span>}
      subject={
        team
          ? `${POSITION_LABEL[b.position]} for ${team.name}`
          : POSITION_LABEL[b.position]
      }
      active={active}
      onClose={onClose}
      closeLabel={`Close the bowler profile for ${b.handle}`}
      dataAttr={{ "data-cup-bowler-profile": slug }}
      meta={
        <>
          <span className={styles.position}>
            {POSITION_LABEL[b.position]}
          </span>
          {b.isCaptain ? (
            <span className={styles.captain}>
              <span aria-hidden="true">◆</span> Captain
            </span>
          ) : null}
          {seed !== null ? (
            <span className={styles.seed}>
              Seed <span className="num">{seed}</span> of{" "}
              <span className="num">{cup.fieldSize}</span>
            </span>
          ) : null}
          <ProvenanceBadge provenance={b.provenance} compact />
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
          1. WHO THIS IS, WHICH IS A HANDLE AND A ROUTE IN
          ========================================================= */}
      <CupBlock
        title="Identity"
        lede="A handle, a position and the team it belongs to. Nothing here is a person's name."
      >
        <CupFacts>
          <CupFact label="Handle">
            <span className={styles.handleInline}>{b.handle}</span>
          </CupFact>
          <CupFact label="Positions played">
            {POSITION_LABEL[b.position]}
            {b.isCaptain ? ", Captain" : ""}
          </CupFact>
          <CupFact label="Team">
            {team ? (
              <>
                <TeamName teamId={team.id} name={team.name} />
                {league ? (
                  <span className={styles.sub}>
                    {league.name}, {league.night} night
                  </span>
                ) : null}
              </>
            ) : (
              "Not rostered"
            )}
          </CupFact>
          <CupFact label="Route in">
            {team ? (
              <>
                <TokenMark token={TEAM_FORMATION[team.formation]} small />
                <span className={styles.sub}>
                  {TEAM_FORMATION[team.formation].note}
                </span>
              </>
            ) : (
              "Not known"
            )}
          </CupFact>
          <CupFact label="Off the board" wide>
            {prospect ? (
              <>
                <RecordName prospectId={prospect.id} />
                {team?.affiliationBasis ? (
                  <span className={styles.sub}>{team.affiliationBasis}</span>
                ) : null}
              </>
            ) : (
              <span className={styles.none}>
                <span aria-hidden="true">○</span> No organisation behind this
                team
              </span>
            )}
          </CupFact>
        </CupFacts>
      </CupBlock>

      {/* =========================================================
          2. THE DEBUT, WHICH STANDS WHERE A RECORD WOULD
          ========================================================= */}
      <CupBlock
        title="The debut"
        lede="Every bowler in this cup is a debutant. Combat sports sells a debut as a debut rather than hiding an empty record, and bowling declares an average not yet established rather than assigning a flat one. Both of those are the honest move and both of them are this."
      >
        <CupFacts>
          <CupFact label="Enrolled on">{formatCupDate(b.joinedAt)}</CupFact>
          <CupFact label="Cup debut">
            {entered ? (
              <>
                {formatCupDate(cup.nightDates[0])}
                <span className={styles.sub}>
                  First night of {cup.name}
                </span>
              </>
            ) : (
              <>
                Not yet
                <span className={styles.sub}>
                  {next
                    ? `${next.name} takes teams now.`
                    : "The next cup takes teams now."}
                </span>
              </>
            )}
          </CupFact>
        </CupFacts>

        <NotEstablishedLine
          label="Record"
          because="Nobody has bowled a competitive game in this building. A record here would be a season that did not happen, printed next to two hundred and eleven verified organisations, and it would cost more than it is worth."
        />

        <EstablishedFigure
          label="Average"
          figure={view.average}
          starts="The counter starts on the first league night, and the first bowler through the door on that night is the first name on the sheet."
          rule={`Twenty one games is the United States Bowling Congress benchmark for a usable prior average, quoted rather than invented, and it is the denominator printed above.`}
        />

        <EstablishedFigure
          label="Handicap"
          figure={{
            kind: "not-established",
            gamesBowled: 0,
            gamesRequired: ESTABLISHED_AVERAGE_GAMES,
            because:
              "Handicap is computed from an average, so it cannot exist before one does. The basis also has to exceed the highest average in the field, which is a second reason it cannot be fixed yet.",
          }}
          rule={`Handicap will be (${cup.handicapBasis} minus the average) times ${cup.handicapFactorPct} per cent, truncated to a whole number. That basis and that factor are this proposal's own. Round1 publishes no handicap system.`}
        />
      </CupBlock>

      {/* =========================================================
          3. THE EXHIBITION FIGURES, EVERY ONE LABELLED
          ========================================================= */}
      {ex ? (
        <CupBlock
          title="Exhibition figures"
          meta={
            <>
              <SimulatedMark label={ex.label} />
              <ProvenanceBadge provenance={ex.provenance} compact />
            </>
          }
          lede="Generated so the format could be judged in use. Nobody has bowled a frame in this building and no figure below is a claim that they have."
        >
          <FormStrip
            form={form}
            label="Team form, last five"
            note="The team's results, not this bowler's. In a Baker game the score belongs to the five of them."
          />

          <ul className={styles.rates}>
            <Rate
              label="Frames bowled"
              value={String(ex.framesBowled)}
              note="Two frames per Baker game the team bowled, which is what a Baker game gives one bowler."
              simulatedLabel={ex.label}
            />
            <Rate
              label="Strikes"
              value={String(ex.strikes)}
              note="First balls that took all ten pins down."
              simulatedLabel={ex.label}
            />
            <Rate
              label="Strike rate"
              value={`${ex.strikeRatePct}%`}
              note={ex.strikeRateDefinition}
              simulatedLabel={ex.label}
            />
            <Rate
              label="Spares converted"
              value={String(ex.sparesConverted)}
              note={`Out of ${ex.spareChances} frames left standing after the first ball.`}
              simulatedLabel={ex.label}
            />
            <Rate
              label="Spare conversion"
              value={`${ex.spareConversionPct}%`}
              note="The stat that decides more league matches than striking does, and the one a first timer can move fastest."
              simulatedLabel={ex.label}
            />
            <Rate
              label="Marked frames"
              value={`${ex.markedFramePct}%`}
              note={`${ex.markedFrames} frames with a strike or a spare. A clean game is a mark in all ten and it needs no strike at all.`}
              simulatedLabel={ex.label}
            />
            <Rate
              label="Open frames"
              value={String(ex.openFrames)}
              note="Neither a strike nor a spare. Lower is better and it is the number that moves an average fastest."
              simulatedLabel={ex.label}
            />
          </ul>
        </CupBlock>
      ) : (
        <CupBlock
          title="Exhibition figures"
          lede={`This bowler's team is not in the field for ${cup.name}, so there is nothing generated to show. That is not a judgement about the team: a Baker game needs five bodies because the five share the ten frames between them.`}
        >
          <p className={styles.blank}>No figures.</p>
        </CupBlock>
      )}

      {/* =========================================================
          4. THE BALL. EQUIPMENT, NEVER A BODY.
          ========================================================= */}
      <CupBlock
        title="Ball preferences"
        lede="Every field here is a fact about a piece of equipment. There is no height, no reach and no weigh in on this profile, and there is nowhere to put one."
      >
        <CupFacts>
          <CupFact label="Ball weight">
            {ball.weightLb ? (
              <>
                <span className="num">{ball.weightLb}</span> pound
                <span className={styles.sub}>
                  Sixteen is the sanctioned maximum and there is no minimum.
                </span>
              </>
            ) : (
              "Not given"
            )}
          </CupFact>
          <CupFact label="Own ball or house ball">
            <TokenMark token={OWNERSHIP_LABEL[ball.ownership]} small />
          </CupFact>
          <CupFact label="Hand">{HAND_LABEL[ball.hand]}</CupFact>
          <CupFact label="Carries a spare ball">
            {ball.carriesSpareBall ? (
              <span className={styles.yes}>
                <span aria-hidden="true">●</span> Yes
                <span className={styles.sub}>
                  A plastic ball thrown straight at corner pins.
                </span>
              </span>
            ) : (
              <span className={styles.no}>
                <span aria-hidden="true">○</span> No
              </span>
            )}
          </CupFact>
          {ball.nickname ? (
            <CupFact label="What they call it">
              <span className={styles.nickname}>{ball.nickname}</span>
            </CupFact>
          ) : null}
          {ball.coverstock ? (
            <CupFact label="Coverstock">
              <TokenMark token={COVERSTOCK_LABEL[ball.coverstock]} small />
              <span className={styles.sub}>
                {COVERSTOCK_LABEL[ball.coverstock].note}
              </span>
            </CupFact>
          ) : null}
          {ball.surface ? (
            <CupFact label="Surface">
              <TokenMark token={SURFACE_LABEL[ball.surface]} small />
              <span className={styles.sub}>
                {SURFACE_LABEL[ball.surface].note}
              </span>
            </CupFact>
          ) : null}
          {ball.gritNumber ? (
            <CupFact label="Grit">
              <span className="num">{ball.gritNumber}</span>
              <span className={styles.sub}>
                Lower grit hooks earlier, which surprises everybody. Up to
                seventy per cent of how much a ball hooks comes from the
                surface.
              </span>
            </CupFact>
          ) : null}
          {ball.core ? (
            <CupFact label="Core">
              {CORE_LABEL[ball.core]}
              <span className={styles.sub}>
                Symmetric is forgiving. Asymmetric turns harder.
              </span>
            </CupFact>
          ) : null}
        </CupFacts>
      </CupBlock>

      {/* =========================================================
          5. VOICE
          ========================================================= */}
      {b.walkUp || b.whyHere ? (
        <CupBlock
          title="Voice"
          lede="One line each, and they cost nothing. This is the part of an enrollment form people enjoy filling in."
        >
          <CupFacts>
            {b.walkUp ? (
              <CupFact label="Walk up line" wide>
                <span className={styles.quote}>{b.walkUp}</span>
              </CupFact>
            ) : null}
            {b.whyHere ? (
              <CupFact label="Why they are here" wide>
                <span className={styles.quote}>{b.whyHere}</span>
              </CupFact>
            ) : null}
          </CupFacts>
        </CupBlock>
      ) : null}
    </CupDialog>
  );
}

/**
 * One exhibition figure with its label on the same line as the number.
 *
 * The label is not optional and there is no compact mode that drops it,
 * for the same reason the status chips have none: a figure that has lost
 * the word "simulated" is a figure that has kept the decoration and
 * thrown away the meaning.
 */
function Rate({
  label,
  value,
  note,
  simulatedLabel,
}: {
  label: string;
  value: string;
  note: string;
  /** Comes off the figure itself, so it cannot be separated from it. */
  simulatedLabel: string;
}) {
  return (
    <li className={styles.rate} title={note}>
      <span className={styles.rateValue}>
        <span className="num">{value}</span>
      </span>
      <span className={styles.rateLabel}>{label}</span>
      <span className={styles.rateNote}>{note}</span>
      <span className={styles.rateMark}>
        <SimulatedMark label={simulatedLabel} />
      </span>
    </li>
  );
}
