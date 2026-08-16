import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Prospect } from "@/domain/types";
import type {
  League,
  LeagueAction,
  LeagueTeam,
} from "@/domain/leagues";
import {
  LEAGUE_ACTION,
  LEAGUE_ACTION_ORDER,
  LEAGUE_OPENNESS,
  LEAGUE_OPENNESS_ORDER,
  POSITION_LABEL,
  ROSTER_STATE,
  SLOT_STATE,
  SLOT_STATE_ORDER,
  formatLeagueDate,
  positionsOpen,
  rosterStateOf,
  seatsOpen,
} from "@/domain/leagues";
import type { Bowler } from "@/domain/cup";
import { HANDLE_NOTE } from "@/domain/cup";
import type { LadderRow, LeagueView } from "@/domain/selectors/leagues";
import {
  affiliatedOrganisations,
  allInterest,
  boardTotals,
  leagueViews,
  rosterFor,
  unansweredInterest,
} from "@/domain/selectors/leagues";
import {
  BowlerHandle,
  TeamName,
} from "@/components/cup/board/CupNames";
import { BRAND_LEAGUES_PAGE, LEAGUES_AS_OF } from "@/data/leagues";
import { OPEN_LANE_SOCIALS } from "@/data/requests";
import { VENUE } from "@/data/venue";
import { formatDate } from "@/domain/licensing";
import { ProvenanceBadge, WithheldFigure } from "@/components/primitives/ProvenanceBadge";
import { LaneChip } from "@/components/primitives/LaneChip";
import { Button } from "@/components/primitives/Button";
import { RecordName } from "@/components/record/RecordName";
import {
  Bar,
  SectionHead,
  Stat,
  StatStrip,
  TokenMark,
} from "@/components/licensing/Panels";
import {
  EmailComposeModal,
  useComposeModal,
} from "@/components/email/EmailComposeModal";
import styles from "./LeaguesPage.module.css";

/**
 * THE LEAGUE BOARD.
 *
 * ── WHY THIS SCREEN EXISTS AT ALL ─────────────────────────────────
 * Every other surface in this application sells one night. This one sells
 * sixteen. A league books the same pair of lanes at the same hour every
 * week for a season, from people who recruit each other, and it fills the
 * two midweek evenings a venue finds hardest to sell. It is the only
 * recurring product in the building and until now nothing here modelled
 * it, which made the whole application an argument about transactions.
 *
 * ── THE JUDGEMENT CALL, MADE IN PUBLIC ────────────────────────────
 * MAIN EVENT BREA HAS NOT OPENED. Nothing has bowled a frame. So there
 * are no standings on this page, because standings would be a season that
 * did not happen, rendered next to two hundred and eleven real organisations
 * and a licence table that is scrupulous about what it does and does not
 * claim. One invented scoreboard would cost more credibility than the
 * whole leagues surface is worth.
 *
 * What is here instead is the field of sixteen, ranked by how ready each
 * team is to play: slot state, then bodies on the roster, then the date
 * the slot was claimed. Three keys, all three of them columns on the
 * table, and the reader can check the order by eye. `standingsBasis` on
 * the league record says "form-up" and the ladder head says so in words.
 *
 * ── AND THE PROGRAMME IS NOT MAIN EVENT'S ─────────────────────────
 * Main Event publishes a real brand-wide league product, Open Lane
 * Socials, and it runs at select locations, none of which is in
 * California. The two leagues on this board are this application's own
 * proposal for the opening season and the page says so above the fold,
 * with the published programme reproduced in full at the bottom so a
 * reader can see exactly where the line between them sits.
 *
 * ── LEAGUE MONEY IS NOT ON THIS PAGE ──────────────────────────────
 * Main Event publishes no league price anywhere and neither does either
 * competitor with a comparable programme. So the price renders as the
 * withheld sentence, and what this board reports instead is LANE NIGHTS,
 * which is inventory rather than money and therefore cannot be added to
 * either ledger by accident.
 */

const NOW = LEAGUES_AS_OF;

export function LeaguesPage() {
  const views = useMemo(() => leagueViews(), []);
  const totals = useMemo(() => boardTotals(), []);
  const orgs = useMemo(() => affiliatedOrganisations(), []);
  const interest = useMemo(() => allInterest(), []);
  const unanswered = useMemo(() => unansweredInterest(), []);

  /** Which league the ladder and the team list are showing. */
  const [focusId, setFocusId] = useState(views[0]?.league.id ?? "");
  const focus = views.find((v) => v.league.id === focusId) ?? views[0];

  const compose = useLeagueCompose();

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Recurring, as at {formatDate(NOW)}</p>
          <h1 className={styles.h1}>Leagues</h1>

          {/* The one line that says why a leagues board belongs in a
              prospecting tool. Labels, verbs and numbers. */}
          <p className={styles.thesis}>
            <span aria-hidden="true" className={styles.thesisGlyph}>
              ◈
            </span>
            <span>
              Every other board here sells one night. A league sells{" "}
              <strong className="num">{totals.lanesPerWeek}</strong> lanes a
              week for <strong className="num">16</strong> weeks, to people who
              recruit each other.
            </span>
          </p>

          {/* The framing line. A fact about the data, not a lesson. */}
          <p className={styles.framing}>
            <span aria-hidden="true" className={styles.framingGlyph}>
              ◆
            </span>
            <span>
              A proposal, not an announcement. Main Event publishes{" "}
              <a
                className={styles.link}
                href={BRAND_LEAGUES_PAGE}
                target="_blank"
                rel="noreferrer"
              >
                Open Lane Socials
              </a>{" "}
              at select locations and names no California venue.
            </span>
          </p>
        </header>

        <StatStrip label="Both leagues at a glance">
          <Stat
            value={totals.leagues}
            label="Leagues forming"
            note="Two nights, both taking registrations for a first season that starts after the doors open."
            provenance="illustrative"
          />
          <Stat
            value={`${totals.claimed}/${totals.field}`}
            label="Slots claimed"
            note="Teams holding a place in the two fields of sixteen, confirmed and held together."
            provenance="illustrative"
            live
          />
          <Stat
            value={totals.bowlers}
            label="Bowlers committed"
            note="People signed up across every roster in both leagues. Counted as bodies, never named."
            provenance="illustrative"
            live
          />
          <Stat
            value={totals.seats}
            label="Seats open"
            note="Places a single bowler with no team could take today, across every short roster."
            provenance="illustrative"
            tone="var(--warn)"
            live
          />
          <Stat
            value={totals.lanesPerWeek}
            label="Lanes held per week"
            note="Two nights, eight matches each, two lanes per match. Inventory committed, not money."
            provenance="modeled"
          />
          <Stat
            value={totals.laneNights}
            label="Lane nights per season"
            note="Lanes multiplied by weeks, both leagues. The size of the recurring commitment in inventory terms."
            provenance="modeled"
          />
          <Stat
            value={totals.affiliatedOrganisations}
            label="Organisations off the board"
            note="Organisations in the prospecting data fielding at least one team. A league team is a booking that came off the board."
            provenance="illustrative"
          />
        </StatStrip>

        <p className={styles.priceLine}>
          <WithheldFigure
            reason={
              <>
                No dollar amount for a league appears on Main Event's leagues
                page, and neither Bowlero nor Lucky Strike publishes one
                either. A season price here would be a number nobody could
                check.
              </>
            }
          />
        </p>

        {/* ===========================================================
            1. THE TWO LEAGUES
            =========================================================== */}
        <section className={styles.section} aria-labelledby="lg-two">
          <SectionHead
            eyebrow="One"
            id="lg-two"
            title="Two leagues forming"
            lede="Night, format, field, and who each one is open to."
            meta={
              <>
                <ProvenanceBadge provenance="illustrative" compact />
                <span>
                  Both are this application's own proposal. The play nights
                  are the nights the published brand-wide programme runs.
                </span>
              </>
            }
          />

          <div className={styles.leagueGrid}>
            {views.map((v) => (
              <LeagueCard
                key={v.league.id}
                view={v}
                onAction={(action) => compose.act(action, v)}
              />
            ))}
          </div>

          <div className={styles.boardActions}>
            <ActionButton
              action="propose-league"
              onClick={() => compose.act("propose-league", views[0])}
            />
            <span className={styles.boardActionsNote}>
              A night that is not running yet, put to the house on behalf of
              an organisation on the board.
            </span>
          </div>

          <OpennessLegend />
        </section>

        {/* ===========================================================
            2. THE FIELD OF SIXTEEN
            =========================================================== */}
        <section className={styles.section} aria-labelledby="lg-ladder">
          <SectionHead
            eyebrow="Two"
            id="lg-ladder"
            title="The field of sixteen"
            lede="Ranked by readiness to play. Nothing has bowled a frame."
            meta={
              <>
                <ProvenanceBadge provenance="modeled" compact />
                <span>
                  Slot state first, then bowlers on the roster, then the date
                  the slot was claimed. All three are columns.
                </span>
              </>
            }
          />

          <LeagueSwitch
            views={views}
            value={focus.league.id}
            onChange={setFocusId}
          />

          {focus ? <Ladder view={focus} /> : null}
        </section>

        {/* ===========================================================
            3. TEAMS AND ROSTERS
            =========================================================== */}
        <section className={styles.section} aria-labelledby="lg-teams">
          <SectionHead
            eyebrow="Three"
            id="lg-teams"
            title={`Teams in ${focus.league.name}`}
            lede="A roster is a count, a set of positions, the captain's job title and five handles. Press a team name or a handle to open it."
            meta={
              <>
                <ProvenanceBadge provenance="illustrative" compact />
                <span>
                  No invented people, on either side. Same rule as every other
                  screen here.
                </span>
              </>
            }
          />

          {/* Said once, where a roster first appears, and it is the whole
              disclosure because it is the whole truth. */}
          <p className={styles.handleNote}>
            <span aria-hidden="true">◇</span> {HANDLE_NOTE}
          </p>

          <p className={styles.countLine} aria-live="polite">
            <strong className="num">{focus.teams.length}</strong> teams,{" "}
            <strong className="num">{focus.slots.bowlers}</strong> bowlers,{" "}
            <strong className="num">{focus.slots.seats}</strong> seats open
          </p>

          <ul className={styles.teamGrid}>
            {focus.teams.map((t) => (
              <li key={t.id}>
                <TeamCard
                  team={t}
                  league={focus.league}
                  onJoin={() => compose.act("join-as-individual", focus, t)}
                />
              </li>
            ))}
          </ul>
        </section>

        {/* ===========================================================
            4. WHERE THE LEAGUES MEET THE BOARD
            =========================================================== */}
        <section className={styles.section} aria-labelledby="lg-orgs">
          <SectionHead
            eyebrow="Four"
            id="lg-orgs"
            title="Teams that came off the prospecting board"
            lede={`${totals.affiliatedTeams} of ${totals.claimed} teams are crews from an organisation already in the trade area data.`}
          />

          <ul className={styles.orgList}>
            {orgs.map(({ prospect, teams }) => (
              <li key={prospect.id} className={styles.orgRow}>
                <div className={styles.orgHead}>
                  <span className={styles.orgName}>
                    <RecordName prospectId={prospect.id} />
                  </span>
                  <LaneChip lane={prospect.lane} size="sm" />
                  {teams.length > 1 ? (
                    <span className={styles.orgTwo}>
                      <span aria-hidden="true">◈</span> Two nights
                    </span>
                  ) : null}
                </div>
                <p className={styles.orgTeams}>
                  {teams
                    .map((t) => `${t.name} (${nightOf(views, t.leagueId)})`)
                    .join(", ")}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ===========================================================
            5. THE ASKS THAT CAME IN
            =========================================================== */}
        <section className={styles.section} aria-labelledby="lg-interest">
          <SectionHead
            eyebrow="Five"
            id="lg-interest"
            title="League asks already on the queue"
            lede="Recorded on the requests board against the same response commitment as any other enquiry."
            meta={
              <>
                <ProvenanceBadge provenance="illustrative" compact />
                <span>
                  <strong className="num">{unanswered.length}</strong> of{" "}
                  <span className="num">{interest.length}</span> still without
                  an answer.
                </span>
              </>
            }
          />

          <ul className={styles.askList}>
            {interest.map((i) => (
              <li key={i.id} className={styles.ask}>
                <div className={styles.askHead}>
                  <span className={styles.askRole}>{i.contactRole}</span>
                  <span className={styles.askOrg}>
                    {i.prospectId ? (
                      <RecordName prospectId={i.prospectId} />
                    ) : (
                      i.organisationName
                    )}
                  </span>
                  <LaneChip lane={i.lane} size="sm" />
                  <span
                    className={
                      i.answeredAt ? styles.askDone : styles.askOpen
                    }
                  >
                    <span aria-hidden="true">{i.answeredAt ? "●" : "○"}</span>{" "}
                    {i.answeredAt ? "Answered" : "Unanswered"}
                  </span>
                </div>
                <p className={styles.askNote}>{i.note}</p>
                <p className={styles.askFacts}>
                  <span>
                    Nights asked for:{" "}
                    <strong>{i.preferredNights.join(", ")}</strong>
                  </span>
                  <span>
                    Bowlers:{" "}
                    {i.bowlersExpected === null ? (
                      <strong>not given</strong>
                    ) : (
                      <strong className="num">{i.bowlersExpected}</strong>
                    )}
                  </span>
                </p>
              </li>
            ))}
          </ul>

          <p className={styles.sectionFoot}>
            The queue and its response clock are on{" "}
            <Link to="/requests">requests</Link>.
          </p>
        </section>

        {/* ===========================================================
            6. WHAT MAIN EVENT ACTUALLY PUBLISHES
            =========================================================== */}
        <section className={styles.section} aria-labelledby="lg-published">
          <SectionHead
            eyebrow="Six"
            id="lg-published"
            title="What Main Event publishes about leagues"
            lede="The real programme, and the five things its own page does not say."
            meta={
              <>
                <ProvenanceBadge provenance="public" compact />
                <span>
                  Read off{" "}
                  <a
                    className={styles.link}
                    href={OPEN_LANE_SOCIALS.source}
                    target="_blank"
                    rel="noreferrer"
                  >
                    mainevent.com/the-leagues
                  </a>{" "}
                  on 11 August 2026.
                </span>
              </>
            }
          />

          <div className={styles.pubGrid}>
            <div className={styles.pubCard}>
              <h3 className={styles.pubTitle}>{OPEN_LANE_SOCIALS.name}</h3>
              <p className={styles.pubBanner}>
                {OPEN_LANE_SOCIALS.bannerName}
              </p>
              <dl className={styles.pubFacts}>
                <div>
                  <dt>Status</dt>
                  <dd>{OPEN_LANE_SOCIALS.registrationStatus}</dd>
                </div>
                <div>
                  <dt>Play nights</dt>
                  <dd>{OPEN_LANE_SOCIALS.playNights.join(", ")}</dd>
                </div>
                <div>
                  <dt>Perks</dt>
                  <dd>{OPEN_LANE_SOCIALS.perks.join(", ")}</dd>
                </div>
                <div>
                  <dt>Locations named</dt>
                  <dd>{OPEN_LANE_SOCIALS.namedLocations.join(", ")}</dd>
                </div>
              </dl>
              <p className={styles.pubBrea}>
                <span aria-hidden="true">◆</span> {OPEN_LANE_SOCIALS.breaNote}
              </p>
            </div>

            <div className={styles.pubCard}>
              <h3 className={styles.pubTitle}>
                What the page does not publish{" "}
                <span className={`${styles.pubCount} num`}>
                  {OPEN_LANE_SOCIALS.unpublished.length}
                </span>
              </h3>
              <ul className={styles.unpubList}>
                {OPEN_LANE_SOCIALS.unpublished.map((u) => (
                  <li key={u.field} className={styles.unpub}>
                    <div className={styles.unpubTop}>
                      <span className={styles.unpubField}>{u.field}</span>
                      <ProvenanceBadge provenance={u.provenance} compact />
                    </div>
                    <p className={styles.unpubNote}>{u.note}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className={styles.sectionFoot}>
            Lane arithmetic against the published floor of{" "}
            <span className="num">{VENUE.bowlingLanesPublishedFloor}</span>{" "}
            lanes is on <Link to="/calendar">capacity</Link>. Every formula and
            source is on <Link to="/method">method</Link>.
          </p>
        </section>
      </div>

      {/*
        =============================================================
        THE SINGLE COMPOSE CALL SITE FOR THE WHOLE LEAGUES SURFACE.
        =============================================================
        Both league routes raise their four actions through
        `useLeagueCompose` below, which is the only thing in this folder
        that knows the compose window exists. One page, one modal
        instance, one owner, exactly as the map board and the requests
        queue already do it: two copies would trap focus in whichever the
        browser reached first.
      */}
      <LeagueComposeMount compose={compose} />
    </div>
  );
}

/**
 * The one place in this folder that renders the compose window.
 *
 * Both league routes mount this rather than the modal itself, so there is
 * exactly one `EmailComposeModal` element in the whole leagues surface
 * and rewiring it is a one line change in one file.
 */
export function LeagueComposeMount({
  compose,
}: {
  compose: ReturnType<typeof useLeagueCompose>;
}) {
  return <EmailComposeModal {...compose.props} />;
}

// ---------------------------------------------------------------
// The compose bridge
// ---------------------------------------------------------------

/**
 * The four league actions, translated into one compose request.
 *
 * THIS IS THE ONLY PLACE ON THE LEAGUES SURFACE THAT KNOWS ABOUT EMAIL.
 * Every button on both routes calls `act` with an action, a league and
 * optionally a team, and this function decides which draft the window
 * opens on and which organisation it is addressed to. Rewiring the
 * leagues surface to a different compose API is therefore a change to one
 * function rather than to nine call sites.
 *
 * WHICH ORGANISATION IT WRITES TO. The compose window is addressed to an
 * organisation, because every draft it writes is a message to a buyer. A
 * team action addresses the team's own organisation where it has one. A
 * league action addresses the league's anchor, which is the organisation
 * the night grew out of and which is a real row in `data/prospects.ts`.
 * A team of five friends with no employer between them falls back to the
 * anchor rather than to nothing, because the message still has to go
 * somewhere and the anchor is the one relationship the house actually
 * has.
 */
const ACTION_INTENT = {
  enquire: "league-enquiry",
  "join-as-individual": "league-join",
  "register-team": "league-team",
  "propose-league": "league-new",
} as const;

function useLeagueCompose() {
  const compose = useComposeModal();

  function act(action: LeagueAction, view: LeagueView, team?: LeagueTeam) {
    const prospect: Prospect | null =
      (team?.prospectId ? teamProspect(view, team) : null) ?? view.anchor;
    if (!prospect) return;

    compose.open({
      prospect,
      intent: ACTION_INTENT[action],
      league: {
        leagueName: view.league.name,
        night: view.league.night,
        weeks: view.league.seasonWeeks,
        /* TEAM PLACES, never seats on a roster. The compose window writes
           the phrase "team places still open" around this number, and a
           league whose field is claimed but whose rosters are short has
           eleven of the second and none of the first. Handing it the seat
           count would put a sentence in a rep's mail that is wrong in the
           one way a reader could check. Zero is falsy and the draft says
           "welcoming joiners" instead, which is the accurate sentence. */
        spotsOpen: view.slots.free,
        teamName: team?.name,
        teamSize: view.league.teamSize,
        leaguePath: `/leagues/${view.league.id}`,
      },
    });
  }

  return { act, props: compose.props };
}

function teamProspect(view: LeagueView, team: LeagueTeam): Prospect | null {
  const row = view.ladder.find((r) => r.team?.id === team.id);
  return row?.prospect ?? null;
}

// ---------------------------------------------------------------
// Pieces, shared with the detail route
// ---------------------------------------------------------------

export function ActionButton({
  action,
  onClick,
  primary = false,
}: {
  action: LeagueAction;
  onClick: () => void;
  primary?: boolean;
}) {
  const meta = LEAGUE_ACTION[action];
  return (
    <Button
      className={styles.action}
      variant={primary ? "primary" : "secondary"}
      glyph={meta.glyph}
      onClick={onClick}
      title={meta.what}
    >
      {meta.label}
    </Button>
  );
}

/** The three actions a single league offers, in one row. */
export function LeagueActions({
  view,
  onAction,
}: {
  view: LeagueView;
  onAction: (action: LeagueAction) => void;
}) {
  return (
    <div className={styles.actionRow}>
      {LEAGUE_ACTION_ORDER.filter((a) => a !== "propose-league").map((a) => (
        <ActionButton
          key={a}
          action={a}
          primary={a === joinRouteFor(view)}
          onClick={() => onAction(a)}
        />
      ))}
    </div>
  );
}

/**
 * Which of the three actions is the one this league actually wants.
 *
 * A league with slots free wants whole teams. A league whose field is
 * claimed but whose rosters are short wants individuals. Painting both as
 * equal weight would make the reader guess, and the guess would be wrong
 * half the time.
 */
function joinRouteFor(view: LeagueView): LeagueAction {
  if (view.league.openness === "welcoming-teams") return "register-team";
  if (view.league.openness === "welcoming-individuals")
    return "join-as-individual";
  return "enquire";
}

export function LeagueCard({
  view,
  onAction,
}: {
  view: LeagueView;
  onAction: (action: LeagueAction) => void;
}) {
  const { league, shape } = view;
  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <h3 className={styles.cardName}>
          <Link className={styles.cardLink} to={`/leagues/${league.id}`}>
            {league.name}
          </Link>
        </h3>
        <TokenMark token={LEAGUE_OPENNESS[league.openness]} />
      </div>

      <p className={styles.cardTagline}>{league.tagline}</p>

      <dl className={styles.cardFacts}>
        <div className={styles.cardFact}>
          <dt>Night</dt>
          <dd>
            {league.night}
            <span className={styles.factSub}>{league.startTime}</span>
          </dd>
        </div>
        <div className={styles.cardFact}>
          <dt>Format</dt>
          <dd>
            <span className="num">{league.gamesPerNight}</span> games
            <span className={styles.factSub}>handicap scored</span>
          </dd>
        </div>
        <div className={styles.cardFact}>
          <dt>Team size</dt>
          <dd>
            <span className="num">{league.teamSize}</span> bowlers
            <span className={styles.factSub}>this proposal's own</span>
          </dd>
        </div>
        <div className={styles.cardFact}>
          <dt>Season</dt>
          <dd>
            <span className="num">{shape.seasonWeeks}</span> weeks
            <span className={styles.factSub}>
              <span className="num">{shape.roundRobinWeeks}</span> round robin
              plus <span className="num">{shape.positionNights}</span> position
            </span>
          </dd>
        </div>
        <div className={styles.cardFact}>
          <dt>Lanes on the night</dt>
          <dd>
            <span className="num">{shape.lanesPerNight}</span>
            <span className={styles.factSub}>
              <span className="num">{view.laneSharePct}</span>% of the
              published floor
            </span>
          </dd>
        </div>
        <div className={styles.cardFact}>
          <dt>Season price</dt>
          <dd>
            <WithheldFigure compact />
          </dd>
        </div>
      </dl>

      <SlotStrip view={view} />

      <p className={styles.cardOpenness}>
        <span aria-hidden="true">
          {LEAGUE_OPENNESS[league.openness].glyph}
        </span>{" "}
        {league.opennessNote}
      </p>

      <p className={styles.cardWho}>
        <span className={styles.cardWhoLabel}>Who</span>
        <span>{league.who}</span>
      </p>

      {view.anchor ? (
        <p className={styles.cardAnchor}>
          <span className={styles.cardWhoLabel}>Came from</span>
          <span>
            <span className={styles.anchorName}>
              <RecordName prospectId={view.anchor.id} />
            </span>
            <span className={styles.anchorBasis}>{league.anchorBasis}</span>
          </span>
        </p>
      ) : null}

      <LeagueActions view={view} onAction={onAction} />

      <p className={styles.cardMore}>
        <Link to={`/leagues/${league.id}`}>
          Full ladder, schedule and rosters
        </Link>
      </p>
    </article>
  );
}

/** The field of sixteen as three counts and one bar that prints them. */
export function SlotStrip({ view }: { view: LeagueView }) {
  const { slots } = view;
  const pct = (n: number) => (n / Math.max(1, slots.field)) * 100;
  return (
    <div className={styles.slots}>
      <div className={styles.slotCounts}>
        {SLOT_STATE_ORDER.map((s) => (
          <span key={s} className={styles.slotCount}>
            <TokenMark token={SLOT_STATE[s]} small />
            <strong className="num">
              {s === "confirmed"
                ? slots.confirmed
                : s === "held"
                  ? slots.held
                  : slots.free}
            </strong>
          </span>
        ))}
      </div>
      <div className={styles.slotBars}>
        <Bar
          pct={pct(slots.confirmed)}
          value={`${slots.confirmed} of ${slots.field}`}
          label={`Slots confirmed in ${view.league.name}`}
          tone="var(--ok)"
        />
        <Bar
          pct={pct(slots.claimed)}
          value={`${slots.claimed} of ${slots.field}`}
          label={`Slots claimed in ${view.league.name}, confirmed and held`}
          tone="var(--warn)"
        />
      </div>
    </div>
  );
}

/** Which league the ladder and the roster list are showing. */
export function LeagueSwitch({
  views,
  value,
  onChange,
}: {
  views: LeagueView[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className={styles.switch} role="group" aria-label="Choose a league">
      {views.map((v) => (
        <button
          key={v.league.id}
          type="button"
          className={
            v.league.id === value
              ? `${styles.switchBtn} ${styles.switchOn}`
              : styles.switchBtn
          }
          aria-pressed={v.league.id === value}
          onClick={() => onChange(v.league.id)}
        >
          <span className={styles.switchNight}>{v.league.night}</span>
          <span className={styles.switchName}>{v.league.name}</span>
          <span className={`${styles.switchCount} num`}>
            {v.slots.claimed}/{v.slots.field}
          </span>
        </button>
      ))}
    </div>
  );
}

/**
 * The ladder. Sixteen rows, always, including the empty slots.
 *
 * The top of the table is the top and it is said three ways: the rank
 * number is largest and heaviest at the top, the leading row carries a
 * rule in the section colour and the word "Top of the field", and the
 * rows are in order. None of those three is a colour on its own.
 */
export function Ladder({ view }: { view: LeagueView }) {
  return (
    <div className={styles.ladderWrap}>
      <p className={styles.ladderBasis}>
        <span aria-hidden="true">◇</span> No games bowled. Ranked on slot
        state, then bowlers committed, then the date the slot was claimed.{" "}
        <ProvenanceBadge provenance="modeled" compact />
      </p>

      <table className={styles.ladder}>
        <caption className="visually-hidden">
          The field of sixteen in {view.league.name}, ranked by readiness to
          play. Rank one is the top of the field.
        </caption>
        <thead>
          <tr>
            <th scope="col" className={styles.colRank}>
              Rank
            </th>
            <th scope="col">Team</th>
            <th scope="col">Slot</th>
            <th scope="col">Roster</th>
            <th scope="col">Seats</th>
            <th scope="col">Claimed</th>
          </tr>
        </thead>
        <tbody>
          {view.ladder.map((row) => (
            <LadderRowView key={`${row.rank}`} row={row} view={view} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LadderRowView({ row, view }: { row: LadderRow; view: LeagueView }) {
  const lead = row.rank === 1;
  return (
    <tr
      className={[
        styles.ladderRow,
        lead ? styles.ladderLead : "",
        row.team ? "" : styles.ladderEmpty,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <th scope="row" className={styles.colRank}>
        <span className={`${styles.rankNum} num`}>{row.rank}</span>
        {lead ? (
          <span className={styles.rankLead}>
            <span aria-hidden="true">★</span> Top of the field
          </span>
        ) : null}
      </th>
      <td data-label="Team">
        {row.team ? (
          <>
            {/* The name is the control, here as on the cup board. It
                opens the team surface: the roster by handle, how the
                team formed, and its run in the cup. */}
            <span className={styles.ladderTeam}>
              <TeamName teamId={row.team.id} name={row.team.name} />
            </span>
            <span className={styles.ladderOrg}>
              {row.prospect ? (
                <RecordName prospectId={row.prospect.id} />
              ) : (
                "No employer behind it"
              )}
            </span>
          </>
        ) : (
          <span className={styles.ladderTeam}>Slot free</span>
        )}
      </td>
      <td data-label="Slot">
        <TokenMark token={SLOT_STATE[row.slotState]} small />
      </td>
      <td data-label="Roster">
        {row.team ? (
          <span className={styles.rosterCell}>
            <span className="num">{row.bowlersCommitted}</span>
            <span className={styles.rosterOf}>
              of <span className="num">{view.league.teamSize}</span>
            </span>
            {row.rosterState ? (
              <TokenMark token={ROSTER_STATE[row.rosterState]} small />
            ) : null}
          </span>
        ) : (
          <span className={styles.rosterCell}>
            <span aria-hidden="true">○</span> Nobody yet
          </span>
        )}
      </td>
      <td data-label="Seats">
        <span className="num">{row.seatsOpen}</span>
      </td>
      <td data-label="Claimed">
        {row.team ? formatLeagueDate(row.team.claimedAt) : "Not claimed"}
      </td>
    </tr>
  );
}

export function TeamCard({
  team,
  league,
  onJoin,
}: {
  team: LeagueTeam;
  league: League;
  onJoin: () => void;
}) {
  const open = seatsOpen(team, league);
  const rosterState = rosterStateOf(team, league);
  const openPositions = positionsOpen(team, league);
  /* The roster in bowling order, lead off through anchor. Read here
     rather than passed in, because both pages that draw this card
     already hold the team and neither holds the handles. */
  const roster = rosterFor(team.id);

  return (
    <article className={styles.team}>
      <div className={styles.teamTop}>
        <h4 className={styles.teamName}>
          <TeamName teamId={team.id} name={team.name} />
        </h4>
        <TokenMark token={SLOT_STATE[team.slotState]} small />
        <TokenMark token={ROSTER_STATE[rosterState]} small />
      </div>

      <Bar
        pct={(team.bowlersCommitted / Math.max(1, league.teamSize)) * 100}
        value={`${team.bowlersCommitted} of ${league.teamSize}`}
        label={`Bowlers committed to ${team.name}`}
        tone={open === 0 ? "var(--ok)" : "var(--warn)"}
      />

      {/* The roster, by handle and position. Every handle opens the
          bowler profile and the team name above opens the team. A handle
          is not a person's name and the line under this list says so
          once for the whole page. */}
      {roster.length > 0 ? (
        <ul className={styles.teamRoster}>
          {roster.map((b) => (
            <li key={b.handle} className={styles.teamRosterRow}>
              <span className={styles.teamRosterHandle}>
                <BowlerHandle handle={b.handle} />
              </span>
              <span className={styles.teamRosterPosition}>
                {POSITION_LABEL[b.position]}
                {b.isCaptain ? (
                  <span className={styles.teamRosterCaptain}>
                    <span aria-hidden="true">◆</span> Captain
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <dl className={styles.teamFacts}>
        <div>
          <dt>Captain</dt>
          <dd>
            {roster.find((b) => b.isCaptain) ? (
              <>
                <BowlerHandle
                  handle={(roster.find((b) => b.isCaptain) as Bowler).handle}
                />
                <span className={styles.teamCaptainRole}>
                  {team.captainRole}
                </span>
              </>
            ) : (
              team.captainRole
            )}
          </dd>
        </div>
        <div>
          <dt>Positions filled</dt>
          <dd>
            {team.positionsFilled.map((p) => POSITION_LABEL[p]).join(", ")}
          </dd>
        </div>
        {openPositions.length > 0 ? (
          <div>
            <dt>Open</dt>
            <dd className={styles.teamOpen}>
              {openPositions.map((p) => POSITION_LABEL[p]).join(", ")}
            </dd>
          </div>
        ) : null}
        <div>
          <dt>Claimed</dt>
          <dd>{formatLeagueDate(team.claimedAt)}</dd>
        </div>
      </dl>

      {team.prospectId ? (
        <p className={styles.teamOrg}>
          <span className={styles.orgName}>
            <RecordName prospectId={team.prospectId} />
          </span>
          {team.affiliationBasis ? (
            <span className={styles.teamBasis}>{team.affiliationBasis}</span>
          ) : null}
        </p>
      ) : (
        <p className={styles.teamOrg}>
          <span className={styles.orgNone}>
            <span aria-hidden="true">○</span> No organisation behind it
          </span>
        </p>
      )}

      {team.note ? (
        <p className={styles.teamNote}>
          <span aria-hidden="true">◆</span> {team.note}
        </p>
      ) : null}

      {open > 0 ? (
        <Button
          className={styles.action}
          variant="secondary"
          glyph={LEAGUE_ACTION["join-as-individual"].glyph}
          onClick={onJoin}
          title={`Write to the organisation behind ${team.name} about the ${open} open seat${open === 1 ? "" : "s"}.`}
        >
          Fill {open} seat{open === 1 ? "" : "s"}
        </Button>
      ) : null}
    </article>
  );
}

/** The three openness states, spelled out once for a reader. */
export function OpennessLegend() {
  return (
    <ul className={styles.legend}>
      {LEAGUE_OPENNESS_ORDER.map((o) => (
        <li key={o} className={styles.legendItem}>
          <TokenMark token={LEAGUE_OPENNESS[o]} small />
          <span className={styles.legendNote}>{LEAGUE_OPENNESS[o].note}</span>
        </li>
      ))}
    </ul>
  );
}

function nightOf(views: LeagueView[], leagueId: string): string {
  return views.find((v) => v.league.id === leagueId)?.league.night ?? "";
}

export { useLeagueCompose, styles as leagueStyles };
