import type { ReactNode } from "react";
import type { CupView, FixtureView } from "@/domain/selectors/cup";
import {
  CUP_STATE,
  EXHIBITION_NOTE,
  MATCH_STATE,
  formatCupDate,
} from "@/domain/cup";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { TokenMark } from "@/components/licensing/Panels";
import { MatchupPress, TeamName } from "./CupNames";
import styles from "./CupLead.module.css";

/**
 * WHAT IS HAPPENING NOW, AND WHAT TO DO ABOUT IT ON MONDAY.
 *
 * ── WHY THIS IS THE TOP OF THE BOARD ──────────────────────────────
 * A bracket is the easiest thing in software to make look impressive and
 * the hardest to make useful. The test this board is held to is whether a
 * rep can open it and know what to do, so the two answers sit side by
 * side above everything else: the cup that is on the lanes tonight, and
 * the three counts that are actually actionable, every one of them
 * attached to a verb.
 *
 * The tree is nowhere near this block, and that is the whole argument.
 *
 * ── AND THE DECLARATION IS NOT IN A FOOTNOTE ──────────────────────
 * The cup running now is a DECLARED EXHIBITION: a simulated run of the
 * format, generated so the bracket, the advancement and the matchup build
 * up can be judged in use before a lane exists. That sentence is in the
 * first block of the board, at full size, next to the state token that
 * says the same thing in a word. Nobody has bowled a frame in this
 * building and no figure on this board claims otherwise.
 */

export interface MondayItem {
  id: string;
  glyph: string;
  /** The count, which is the whole point of the row. */
  count: number;
  label: string;
  /** One clause on what the count is and why it is worth a press. */
  note: string;
  tone: string;
  actLabel: string;
  onAct: () => void;
}

function NextFixture({ fixture }: { fixture: FixtureView }) {
  const a = fixture.sides[0];
  const b = fixture.sides[1];
  return (
    <div className={styles.next}>
      <div className={styles.nextHead}>
        <TokenMark token={MATCH_STATE[fixture.state]} small />
        <span className={styles.nextRound}>{fixture.round.name}</span>
        <span className={styles.nextWhen}>{formatCupDate(fixture.date)}</span>
      </div>
      <p className={styles.nextTeams}>
        <span className={styles.nextSide}>
          {a.team ? (
            <>
              <span className={`${styles.nextSeed} num`}>{a.seed ?? 0}</span>
              <TeamName teamId={a.team.id} name={a.team.name} />
            </>
          ) : (
            <span className={styles.nextRule}>{a.rule}</span>
          )}
        </span>
        <span className={styles.nextV} aria-hidden="true">
          v
        </span>
        <span className={styles.nextSide}>
          {b.team ? (
            <>
              <span className={`${styles.nextSeed} num`}>{b.seed ?? 0}</span>
              <TeamName teamId={b.team.id} name={b.team.name} />
            </>
          ) : (
            <span className={styles.nextRule}>{b.rule}</span>
          )}
        </span>
      </p>
      <div className={styles.nextFoot}>
        <span className={styles.nextLanes}>
          Lanes <span className="num">{fixture.lanes[0]}</span> and{" "}
          <span className="num">{fixture.lanes[1]}</span>
          {fixture.seedGap === null ? null : (
            <>
              , <span className="num">{fixture.seedGap}</span> seeds apart
            </>
          )}
        </span>
        <MatchupPress
          fixtureId={fixture.fixture.id}
          label="Matchup card"
          accessibleName={`${a.team?.name ?? "an undecided side"} against ${b.team?.name ?? "an undecided side"}`}
        />
      </div>
    </div>
  );
}

export function CupLead({
  view,
  liveCount,
  tonight,
  monday,
  mondayLede,
}: {
  view: CupView;
  liveCount: number;
  /** The night on the lanes now, or the next one that has not been bowled. */
  tonight: { night: number; date: string; daysAway: number } | null;
  monday: MondayItem[];
  mondayLede: ReactNode;
}) {
  const { cup, shape } = view;

  return (
    <div className={styles.lead}>
      {/* ------------------------------------------------------------
          The cup on the lanes
          ------------------------------------------------------------ */}
      <section className={styles.now} aria-labelledby="cup-now">
        <div className={styles.nowTop}>
          <p className={styles.kicker}>
            {cup.quarter} {cup.year}, running now
          </p>
          <TokenMark token={CUP_STATE[cup.state]} />
        </div>

        <h2 className={styles.name} id="cup-now">
          {cup.name}
        </h2>
        <p className={styles.strapline}>{cup.strapline}</p>

        <p className={styles.declaration}>
          <span aria-hidden="true" className={styles.declarationGlyph}>
            ◍
          </span>
          <span>
            {EXHIBITION_NOTE} <ProvenanceBadge provenance="illustrative" compact />
          </span>
        </p>

        <dl className={styles.facts}>
          <div className={styles.fact}>
            <dt>Night</dt>
            <dd>
              {cup.night}
              <span className={styles.factSub}>{cup.startTime}</span>
            </dd>
          </div>
          <div className={styles.fact}>
            <dt>Where the cup is</dt>
            <dd>
              {tonight ? (
                <>
                  Night <span className="num">{tonight.night}</span> of{" "}
                  <span className="num">{shape.nights}</span>
                  <span className={styles.factSub}>
                    {tonight.daysAway === 0
                      ? `Tonight, ${formatCupDate(tonight.date)}`
                      : tonight.daysAway > 0
                        ? `${formatCupDate(tonight.date)}, in ${tonight.daysAway} days`
                        : `${formatCupDate(tonight.date)}, bowled`}
                  </span>
                </>
              ) : (
                "Finished"
              )}
            </dd>
          </div>
          <div className={styles.fact}>
            <dt>On the lanes now</dt>
            <dd>
              <span className="num" aria-live="polite">
                {liveCount}
              </span>
              <span className={styles.factSub}>
                {liveCount === 1 ? "match live" : "matches live"}
              </span>
            </dd>
          </div>
          <div className={styles.fact}>
            <dt>Lanes a cup night takes</dt>
            <dd>
              <span className="num">{shape.peakLanes}</span>
              <span className={styles.factSub}>
                <span className="num">{view.laneSharePct}</span>% of the
                published floor
              </span>
            </dd>
          </div>
          <div className={styles.fact}>
            <dt>Field</dt>
            <dd>
              <span className="num">{shape.fieldSize}</span> teams
              <span className={styles.factSub}>
                <span className="num">{shape.bowlers}</span> bowlers in the
                building
              </span>
            </dd>
          </div>
          <div className={styles.fact}>
            <dt>Lane nights a cup commits</dt>
            <dd>
              <span className="num">{shape.laneNights}</span>
              <span className={styles.factSub}>
                inventory, never money
              </span>
            </dd>
          </div>
        </dl>

        {view.headline ? (
          <>
            <h3 className={styles.nextHeading}>Worth promoting</h3>
            <NextFixture fixture={view.headline} />
          </>
        ) : null}
      </section>

      {/* ------------------------------------------------------------
          What to do about it
          ------------------------------------------------------------ */}
      <section className={styles.monday} aria-labelledby="cup-monday">
        <p className={styles.kicker}>Verbs, not a summary</p>
        <h2 className={styles.mondayTitle} id="cup-monday">
          On Monday
        </h2>
        <p className={styles.mondayLede}>{mondayLede}</p>

        <ul className={styles.mondayList}>
          {monday.map((item) => (
            <li
              key={item.id}
              className={styles.mondayItem}
              style={{ ["--tone" as string]: item.tone }}
            >
              <span className={styles.mondayGlyph} aria-hidden="true">
                {item.glyph}
              </span>
              <span className={`${styles.mondayCount} num`} aria-live="polite">
                {item.count}
              </span>
              <span className={styles.mondayLabel}>{item.label}</span>
              <span className={styles.mondayNote}>{item.note}</span>
              <button
                type="button"
                className={styles.mondayAct}
                onClick={item.onAct}
              >
                <span aria-hidden="true">✎</span>
                <span>{item.actLabel}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
