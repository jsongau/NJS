import { useCallback, useMemo, useRef, useState } from "react";
import type { CupBranch } from "@/domain/cup";
import { CUP_BRANCH, MATCH_STATE, formatCupDate } from "@/domain/cup";
import type {
  CupTeamView,
  CupView,
  FixtureSideView,
  FixtureView,
  RoundView,
} from "@/domain/selectors/cup";
import { TokenMark } from "@/components/licensing/Panels";
import { MatchupPress, TeamName } from "@/components/cup/board/CupNames";
import styles from "./BracketView.module.css";

/**
 * THE TREE, AND IT IS THE SECOND VIEW ON PURPOSE.
 *
 * ── WHAT THIS IS NOT ──────────────────────────────────────────────
 * It is not the front door of this board and it is not an accessible
 * alternative to one. The fixtures list is the primary view for reasons
 * written at the head of `board/FixtureList.tsx`, and this is a second
 * drawing of exactly the same fixtures for readers who think in shapes.
 * Everything reachable here is reachable there, and nothing on this board
 * requires a reader to touch this tree at all.
 *
 * ── THE PHONE, WHICH IS WHERE EVERY BRACKET PRODUCT FAILS ─────────
 * The two documented answers in the field are both failures. One platform
 * offers a scale multiplier from 0.3 up and an option to fit the whole
 * bracket to its container, which at 380 pixels is four pixel type sold
 * as responsive design. The other platform's own mobile client ships
 * WITHOUT A BRACKET VIEW AT ALL, on a product whose core object is a
 * bracket. That is not laziness; it is how hard this is.
 *
 * So nothing here is ever scaled. Below the breakpoint the columns become
 * a horizontal scroll snap track: ONE ROUND IN FOCUS at full type size
 * with its neighbours compressed to a peek at either edge, the round
 * named again on every cell so a reader always knows where they are, and
 * a rail of round buttons above the track so the same movement exists for
 * a keyboard and for a screen reader. The connectors are dropped at that
 * width, because a line drawn to a column nobody can see is decoration,
 * and every unresolved side prints the rule that will fill it instead.
 * Words survive a narrow screen. Lines do not.
 *
 * ── THE ONE INTERACTION WORTH HAVING ──────────────────────────────
 * Pinning a team's path. The single best bracket interaction found in a
 * comparison of the big consumer products was highlighting one team's
 * whole route through the draw, and it is cheap here because the
 * selectors already derive it: `pathToFinal` walks winner edges only from
 * the fixtures a team has left, which is the honest answer to "who would
 * you have to beat". Following loser edges as well would light up the
 * whole Plate for a team that has not lost, which is a route it is not
 * on.
 *
 * It is a select rather than a hover, and that is deliberate. Hover has
 * no touch equivalent and no keyboard equivalent worth the name, and the
 * team name in a cell is already a button that opens the team, so it
 * cannot also be the pin without one press meaning two things. A select
 * is one control, it works with a finger, it works with a keyboard, it
 * announces itself, and Escape over the tree clears it.
 *
 * ── CONNECTORS ARE DRAWN, NOT MARKED UP ───────────────────────────
 * Alternating content and connector columns, and every connector is two
 * pseudo-elements on one empty div: a bracket shape from the two feeding
 * cells to the midpoint, and a stub out to the cell it feeds. No extra
 * DOM, nothing to keep in step, and the two columns cannot drift apart
 * because both are laid out as equal fractions of the same height.
 */

export type BracketLadder = "cup" | "plate";

const LADDERS: Record<
  BracketLadder,
  { label: string; branches: CupBranch[]; note: string }
> = {
  cup: {
    label: "The Cup",
    branches: ["cup", "stepladder"],
    note: "The main bracket, from the round of sixteen to the stepladder that ends the quarter. The top seed bowls once, last.",
  },
  plate: {
    label: "The Plate",
    branches: ["plate"],
    note: "The second competition, with its own final and its own trophy. A first loss in the Cup lands here rather than out of the building.",
  },
};

export const BRACKET_LADDER_ORDER: BracketLadder[] = ["cup", "plate"];

export function bracketLadderLabel(ladder: BracketLadder): string {
  return LADDERS[ladder].label;
}

/**
 * The rounds not drawn here, named rather than quietly dropped.
 *
 * The seeding nights are two rounds of eight simultaneous matches with no
 * tree above them, the wildcard is one fixture that reaches sideways into
 * the Cup, the Long Game is banked pinfall and the sweeper is a squad. A
 * tree cannot draw any of them without lying about the shape, so it does
 * not try, and this sentence says where they are instead.
 */
export const BRACKET_NOT_DRAWN =
  "The two seeding nights, the wildcard bout, the Long Game and the finals night sweeper are not tree shaped and are not drawn here. Every one of them is in the fixtures view.";

interface Column {
  round: RoundView;
  fixtures: FixtureView[];
  /** True where this column feeds the next one two into one. */
  feedsNext: boolean;
}

function columnsFor(view: CupView, ladder: BracketLadder): Column[] {
  const keep = new Set<CupBranch>(LADDERS[ladder].branches);
  const rounds: RoundView[] = [];
  for (const night of view.nights) {
    for (const round of night.rounds) {
      if (keep.has(round.round.branch)) rounds.push(round);
    }
  }
  return rounds.map((round, i) => {
    const next = rounds[i + 1];
    return {
      round,
      fixtures: round.fixtures,
      feedsNext:
        next !== undefined && next.fixtures.length * 2 === round.fixtures.length,
    };
  });
}

// ---------------------------------------------------------------
// A cell
// ---------------------------------------------------------------

function CellSide({
  side,
  settled,
}: {
  side: FixtureSideView;
  settled: boolean;
}) {
  if (!side.team) {
    return (
      <div className={styles.cellSide} data-open="yes">
        <span className={styles.cellSeed} aria-hidden="true">
          ??
        </span>
        {/* THE RULE, PRINTED. A bracket that draws a line and leaves the
            reader to work out what the line means is the failure this
            whole surface is built against, and a phone has no line at
            all. Every empty side says what fills it, in a sentence a
            captain can read. */}
        <span className={styles.cellRule}>{side.rule ?? "Not decided yet."}</span>
      </div>
    );
  }

  return (
    <div className={styles.cellSide} data-won={side.won ? "yes" : "no"}>
      <span className={`${styles.cellSeed} num`}>
        {side.seed === null ? "" : side.seed}
        <span className="visually-hidden">
          {side.seed === null ? "Not seeded yet." : ` Seed ${side.seed} of 16.`}
        </span>
      </span>
      <span className={styles.cellName}>
        <TeamName teamId={side.team.id} name={side.team.name} />
      </span>
      <span className={`${styles.cellScore} num`}>
        {settled ? (
          side.gamesWon
        ) : (
          <span className="visually-hidden">No score yet.</span>
        )}
      </span>
      {side.won ? (
        <span className={styles.cellWon}>
          <span aria-hidden="true">■</span>
          <span className="visually-hidden">Won</span>
        </span>
      ) : null}
    </div>
  );
}

function Cell({
  fixture,
  roundName,
  pinnedTeam,
  onPath,
}: {
  fixture: FixtureView;
  roundName: string;
  pinnedTeam: string | null;
  onPath: boolean;
}) {
  const token = MATCH_STATE[fixture.state];
  const carries =
    pinnedTeam !== null && fixture.sides.some((s) => s.team?.id === pinnedTeam);
  const a = fixture.sides[0].team?.name ?? "an undecided side";
  const b = fixture.sides[1].team?.name ?? "an undecided side";

  return (
    <li
      className={styles.cell}
      data-state={fixture.state}
      data-path={onPath || carries ? "yes" : "no"}
    >
      <p className={styles.cellRound}>{roundName}</p>

      <div className={styles.cellTop}>
        <TokenMark token={token} small />
        {onPath || carries ? (
          <span className={styles.pathMark}>
            <span aria-hidden="true">◈</span>{" "}
            {carries ? "Pinned team" : "Would have to win"}
          </span>
        ) : null}
      </div>

      <CellSide side={fixture.sides[0]} settled={fixture.settled} />
      <CellSide side={fixture.sides[1]} settled={fixture.settled} />

      <div className={styles.cellFoot}>
        <span className={styles.cellLanes}>
          Lanes <span className="num">{fixture.lanes[0]}</span> and{" "}
          <span className="num">{fixture.lanes[1]}</span>
        </span>
        {fixture.isUpset ? (
          <span className={styles.cellUpset}>
            <span aria-hidden="true">✦</span> Upset
          </span>
        ) : null}
        <MatchupPress
          fixtureId={fixture.fixture.id}
          accessibleName={`${a} against ${b}`}
        />
      </div>

      {fixture.label ? (
        <p className={styles.cellLabel}>
          <span aria-hidden="true">◍</span> {fixture.label}
        </p>
      ) : null}
    </li>
  );
}

// ---------------------------------------------------------------
// The view
// ---------------------------------------------------------------

export function BracketView({
  view,
  teams,
  ladder,
}: {
  view: CupView;
  teams: CupTeamView[];
  ladder: BracketLadder;
}) {
  const columns = useMemo(() => columnsFor(view, ladder), [view, ladder]);
  const [pinned, setPinned] = useState<string>("");
  const columnRefs = useRef<Record<string, HTMLElement | null>>({});

  const pinnedTeam = teams.find((t) => t.team.id === pinned) ?? null;
  const pathIds = useMemo(
    () => new Set(pinnedTeam ? pinnedTeam.path : []),
    [pinnedTeam],
  );

  /* Escape clears the pin from anywhere inside the tree, which is what a
     reader already has for every other transient state in this
     application. */
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Escape") return;
    setPinned("");
  }, []);

  const goToRound = useCallback((id: string) => {
    const el = columnRefs.current[id];
    if (!el) return;
    /* No behaviour argument, so it lands rather than glides. There is
       nothing here for prefers-reduced-motion to switch off, because
       nothing here moves over time. */
    el.scrollIntoView({ inline: "center", block: "nearest" });
    el.focus({ preventScroll: true });
  }, []);

  const announcement = pinnedTeam
    ? `${pinnedTeam.team.name} pinned, seed ${pinnedTeam.seed ?? 0} of ${view.shape.fieldSize}, ${pinnedTeam.path.length} fixtures left to win.`
    : "No path pinned.";

  return (
    <div className={styles.wrap} onKeyDown={onKeyDown}>
      <div className={styles.controls}>
        <div className={styles.pin}>
          <label className={styles.pinLabel} htmlFor="bracket-pin">
            Pin a path
          </label>
          <select
            id="bracket-pin"
            className={styles.pinSelect}
            value={pinned}
            onChange={(e) => setPinned(e.target.value)}
          >
            <option value="">No team pinned</option>
            {teams.map((t) => (
              <option key={t.team.id} value={t.team.id}>
                {t.seed === null ? "Unseeded" : `Seed ${t.seed}`}. {t.team.name}
              </option>
            ))}
          </select>
        </div>

        {/* The round rail. It is the keyboard and screen reader equivalent
            of dragging the track sideways, and it is on screen at every
            width, because a reader on a wide screen also wants the semi
            finals without walking past thirty two cells. */}
        <div
          className={styles.roundRail}
          role="group"
          aria-label="Jump to a round"
        >
          {columns.map((c) => (
            <button
              key={c.round.round.id}
              type="button"
              className={styles.roundJump}
              onClick={() => goToRound(c.round.round.id)}
            >
              <span aria-hidden="true">
                {CUP_BRANCH[c.round.round.branch].glyph}
              </span>
              <span>{c.round.round.name}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </p>

      {pinnedTeam ? (
        <p className={styles.pinned}>
          <span aria-hidden="true">◈</span>
          <span>
            <strong>{pinnedTeam.team.name}</strong>, seed{" "}
            <span className="num">{pinnedTeam.seed ?? 0}</span>, has{" "}
            <strong className="num">{pinnedTeam.path.length}</strong> fixtures
            left to win in this cup.{" "}
            {pinnedTeam.path.length === 0
              ? "Its bracket run is over and it bowls the handicap sweeper on finals night."
              : "They are marked below."}
          </span>
        </p>
      ) : null}

      <div className={styles.track}>
        {columns.map((c, i) => (
          <div key={c.round.round.id} className={styles.pair}>
            <header className={styles.columnHead}>
              <h4
                className={styles.columnName}
                id={`bracket-${c.round.round.id}`}
              >
                {c.round.round.name}
              </h4>
              <p className={styles.columnFacts}>
                Night <span className="num">{c.round.round.night}</span>,{" "}
                {formatCupDate(c.round.round.date)},{" "}
                <span className="num">{c.fixtures.length}</span>{" "}
                {c.fixtures.length === 1 ? "match" : "matches"}
              </p>
            </header>

            <ul
              className={styles.cells}
              tabIndex={-1}
              ref={(el) => {
                columnRefs.current[c.round.round.id] = el;
              }}
              aria-labelledby={`bracket-${c.round.round.id}`}
            >
              {c.fixtures.map((f) => (
                <Cell
                  key={f.fixture.id}
                  fixture={f}
                  roundName={c.round.round.name}
                  pinnedTeam={pinned || null}
                  onPath={pathIds.has(f.fixture.id)}
                />
              ))}
            </ul>

            {/* The connector column. One empty div per fixture in the NEXT
                round, each drawing the bracket from its two feeders to the
                midpoint and the stub out of it. Both columns are equal
                fractions of the same height, so the lines meet the cells
                without a measurement anywhere. */}
            {c.feedsNext && columns[i + 1] ? (
              <div className={styles.connectors} aria-hidden="true">
                {columns[i + 1].fixtures.map((f) => (
                  <div key={f.fixture.id} className={styles.connector} />
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <p className={styles.notDrawn}>
        <span aria-hidden="true">◇</span> {LADDERS[ladder].note}
      </p>
      <p className={styles.notDrawn}>
        <span aria-hidden="true">◇</span> {BRACKET_NOT_DRAWN}
      </p>
    </div>
  );
}
