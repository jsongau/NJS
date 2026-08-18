import { useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  LEAGUE_OPENNESS,
  POSITION_LABEL,
  POSITION_ORDER,
} from "@/domain/leagues";
import { HANDLE_NOTE } from "@/domain/cup";
import { interestFor, leagueView } from "@/domain/selectors/leagues";
import { LEAGUE_BY_ID, LEAGUES_AS_OF } from "@/data/leagues";
import { OPEN_LANE_SOCIALS } from "@/data/requests";
import { formatDate } from "@/domain/licensing";
import { ProvenanceBadge, WithheldFigure } from "@/components/primitives/ProvenanceBadge";
import { LaneChip } from "@/components/primitives/LaneChip";
import { RecordName } from "@/components/record/RecordName";
import { SectionHead, Stat, StatStrip, TokenMark } from "@/components/licensing/Panels";
import {
  Ladder,
  LeagueActions,
  LeagueComposeMount,
  SlotStrip,
  TeamCard,
  leagueStyles as shared,
  useLeagueCompose,
} from "./LeaguesPage";
import styles from "./LeagueDetailPage.module.css";

/**
 * ONE LEAGUE.
 *
 * The board answers "what is running and can I get in". This answers the
 * three questions a person who has decided asks next: what does the
 * season actually look like, who is already in it, and what happens if I
 * put my name down.
 *
 * ── THE SCHEDULE IS ARITHMETIC AND NOT A PICTURE ──────────────────
 * Sixteen teams is eight matches. A match is bowled across a pair of
 * lanes, so eight matches is sixteen lanes. Whether sixteen lanes is
 * most of the house or a corner of it is not stated anywhere on this
 * page, because DIME publishes no bowling lane count for any location
 * and the fork's answer was a different operator's figure for a
 * different building. The demand is ours to compute and the house is the
 * operator's to publish.
 * Sixteen teams also play a complete round robin in fifteen weeks, which
 * is why a sixteen week season closes cleanly with a position night
 * rather than stopping in the middle of a rotation.
 *
 * Every one of those figures is derived in `selectors/leagues.ts` from
 * two numbers in the seed. Change the field size and all of them move
 * together, which is the difference between a model and a diagram.
 *
 * ── AND THERE ARE STILL NO SCORES ─────────────────────────────────
 * The ladder here is the same ladder as the board, at full height, and it
 * ranks readiness rather than results, because nothing here has bowled a
 * frame and no league is announced. Every figure carries its provenance and
 * the seeded ones say illustrative.
 */

export function LeagueDetailPage() {
  const { leagueId = "" } = useParams();
  const league = LEAGUE_BY_ID[leagueId];

  /* An unknown id is a link somebody typed or a league that was renamed.
     Either way the board is the right place to land, and a dead end with
     an apology on it would be worse than a redirect that works. */
  const view = useMemo(
    () => (league ? leagueView(league) : null),
    [league],
  );
  const asks = useMemo(() => (league ? interestFor(league) : []), [league]);
  const compose = useLeagueCompose();

  if (!league || !view) return <Navigate to="/leagues" replace />;

  const { shape, slots } = view;

  return (
    <div className={shared.page}>
      <div className={shared.inner}>
        <header className={shared.head}>
          <p className={styles.crumb}>
            <Link to="/leagues">Leagues</Link>
            <span className={styles.crumbSep} aria-hidden="true">
              /
            </span>
            <span>{league.night} night</span>
          </p>

          <div className={styles.titleRow}>
            <h1 className={shared.h1}>{league.name}</h1>
            <TokenMark token={LEAGUE_OPENNESS[league.openness]} />
            <ProvenanceBadge provenance={league.provenance} />
          </div>

          <p className={styles.tagline}>{league.tagline}</p>

          <p className={shared.framing}>
            <span aria-hidden="true" className={shared.framingGlyph}>
              ◆
            </span>
            <span>
              A proposal, not an announcement. DIME publishes no league
              at any location. A competitor publishes{" "}
              <a
                className={shared.link}
                href={OPEN_LANE_SOCIALS.source}
                target="_blank"
                rel="noreferrer"
              >
                Open Lane Socials
              </a>{" "}
              at select locations and names no California venue, so this
              night is a proposal rather than an announced programme.
            </span>
          </p>
        </header>

        <StatStrip label={`${league.name} at a glance`}>
          <Stat
            value={`${slots.claimed}/${slots.field}`}
            label="Slots claimed"
            note="Teams holding a place in the field of sixteen, confirmed and held together."
            provenance="illustrative"
            live
          />
          <Stat
            value={slots.bowlers}
            label="Bowlers committed"
            note="Bodies signed up across every roster in this league. Counted, never named."
            provenance="illustrative"
            live
          />
          <Stat
            value={slots.seats}
            label="Seats open"
            note="Places a bowler with no team could take today, across every short roster."
            provenance="illustrative"
            tone="var(--warn)"
            live
          />
          <Stat
            value={shape.lanesPerNight}
            label="Lanes on the night"
            note="Eight matches, two lanes per match. Ordinary league practice, and it is the figure a general manager wants first."
            provenance="modeled"
          />
          {/*
            A percentage became a sentence. `view.laneSharePct` is null,
            because DIME publishes no bowling lane count for any
            location and the fork's denominator was another operator's
            figure for another building. The tile keeps its place in the
            strip and carries
            the word "Not published" rather than a dash, so it reads the
            same in greyscale and on a printout.
          */}
          <Stat
            value="Not published"
            label="Lane count for the house"
            note="A league night holds its lanes and that figure is beside this one. What share of the house it is cannot be given, because DIME publishes no bowling lane count for any location, including Lakewood Center."
            provenance="withheld"
          />
          <Stat
            value={shape.laneNights}
            label="Lane nights this season"
            note="Lanes multiplied by weeks. Inventory committed, and it is never added to either money ledger."
            provenance="modeled"
          />
        </StatStrip>

        {/* ===========================================================
            1. THE SEASON
            =========================================================== */}
        <section className={shared.section} aria-labelledby="ld-shape">
          <SectionHead
            eyebrow="One"
            id="ld-shape"
            title="The season, and why it is sixteen"
            lede="A field of sixteen meets every opponent once in fifteen weeks, which leaves the sixteenth for position night."
            meta={
              <>
                <ProvenanceBadge provenance="modeled" compact />
                <span>
                  Every figure below is derived from the field size and the
                  season length. Nothing here is stored.
                </span>
              </>
            }
          />

          <dl className={styles.shape}>
            <div className={styles.shapeItem}>
              <dt>Teams in the field</dt>
              <dd className="num">{shape.fieldSize}</dd>
            </div>
            <div className={styles.shapeItem}>
              <dt>Matches per night</dt>
              <dd className="num">{shape.matchesPerNight}</dd>
            </div>
            <div className={styles.shapeItem}>
              <dt>Lanes per match</dt>
              <dd className="num">2</dd>
            </div>
            <div className={styles.shapeItem}>
              <dt>Lanes on the night</dt>
              <dd className="num">{shape.lanesPerNight}</dd>
            </div>
            <div className={styles.shapeItem}>
              <dt>Round robin weeks</dt>
              <dd className="num">{shape.roundRobinWeeks}</dd>
            </div>
            <div className={styles.shapeItem}>
              <dt>Position nights</dt>
              <dd className="num">{shape.positionNights}</dd>
            </div>
            <div className={styles.shapeItem}>
              <dt>Weeks in the season</dt>
              <dd className="num">{shape.seasonWeeks}</dd>
            </div>
            <div className={styles.shapeItem}>
              <dt>Games per night</dt>
              <dd className="num">{league.gamesPerNight}</dd>
            </div>
          </dl>

          <p className={styles.shapeNote}>
            <span aria-hidden="true">◆</span> {league.handicapNote}
          </p>

          <div className={styles.priceBlock}>
            <WithheldFigure
              reason={
                <>
                  DIME publishes no league and therefore no league price.
                  Bowlero, Lucky Strike and every comparable operator
                  withhold league pricing the same way, so the missing
                  figure is a category habit rather than a gap in the
                  research.
                </>
              }
            />
          </div>
        </section>

        {/* ===========================================================
            2. SLOTS AND THE WAY IN
            =========================================================== */}
        <section className={shared.section} aria-labelledby="ld-slots">
          <SectionHead
            eyebrow="Two"
            id="ld-slots"
            title="Slots, and the way in"
            lede={league.opennessNote}
            meta={
              <>
                <TokenMark token={LEAGUE_OPENNESS[league.openness]} small />
                <ProvenanceBadge provenance="illustrative" compact />
              </>
            }
          />

          <div className={styles.joinGrid}>
            <div className={styles.joinPanel}>
              <SlotStrip view={view} />
            </div>

            <div className={styles.joinPanel}>
              <h3 className={styles.joinTitle}>The three doors</h3>
              <LeagueActions
                view={view}
                onAction={(action) => compose.act(action, view)}
              />
              <p className={styles.joinNote}>
                Every message goes to{" "}
                {view.anchor ? (
                  <span className={styles.joinOrg}>
                    <RecordName prospectId={view.anchor.id} />
                  </span>
                ) : (
                  "the league anchor"
                )}{" "}
                and lands in the outbox. Nothing leaves the browser.
              </p>
              {view.anchor ? (
                <p className={styles.joinBasis}>
                  <LaneChip lane={view.anchor.lane} size="sm" />{" "}
                  {league.anchorBasis}
                </p>
              ) : null}
            </div>
          </div>

          <div className={styles.positions}>
            <h3 className={styles.joinTitle}>
              Positions on a team of{" "}
              <span className="num">{league.teamSize}</span>
            </h3>
            <ul className={styles.positionList}>
              {POSITION_ORDER.map((p) => (
                <li key={p} className={styles.position}>
                  {POSITION_LABEL[p]}
                </li>
              ))}
            </ul>
            <p className={styles.positionNote}>
              DIME publishes no team size and no format for anything.
              Five bowlers and three games are this proposal's own, and the
              line about teams of three to five that turns up in bowling
              explainers is generic education rather than anybody's rule.
            </p>
          </div>
        </section>

        {/* ===========================================================
            3. THE LADDER IN FULL
            =========================================================== */}
        <section className={shared.section} aria-labelledby="ld-ladder">
          <SectionHead
            eyebrow="Three"
            id="ld-ladder"
            title="The field of sixteen, in full"
            lede="Ranked by readiness to play. Nothing has bowled a frame."
          />
          <Ladder view={view} />
        </section>

        {/* ===========================================================
            4. TEAMS
            =========================================================== */}
        <section className={shared.section} aria-labelledby="ld-teams">
          <SectionHead
            eyebrow="Four"
            id="ld-teams"
            title="Teams and rosters"
            lede="A count, a set of positions, the captain's job title and five handles. Press a team name or a handle to open it. No invented people."
            meta={
              <>
                <ProvenanceBadge provenance="illustrative" compact />
                <span>
                  <strong className="num">{view.teams.length}</strong> teams,{" "}
                  <strong className="num">{slots.shortRosters}</strong> of them
                  a body short.
                </span>
              </>
            }
          />

          {/* Said once on this page, where the rosters are. */}
          <p className={styles.handleNote}>
            <span aria-hidden="true">◇</span> {HANDLE_NOTE}
          </p>

          <ul className={shared.teamGrid}>
            {view.teams.map((t) => (
              <li key={t.id}>
                <TeamCard
                  team={t}
                  league={league}
                  onJoin={() => compose.act("join-as-individual", view, t)}
                />
              </li>
            ))}
          </ul>
        </section>

        {/* ===========================================================
            5. THE ASKS FOR THIS NIGHT
            =========================================================== */}
        {asks.length > 0 ? (
          <section className={shared.section} aria-labelledby="ld-asks">
            <SectionHead
              eyebrow="Five"
              id="ld-asks"
              title={`Asked for a ${league.night}`}
              lede="Inbound league enquiries that named this night. Worked on the requests queue."
            />
            <ul className={styles.askList}>
              {asks.map((a) => (
                <li key={a.id} className={styles.ask}>
                  <div className={styles.askHead}>
                    <span className={styles.askRole}>{a.contactRole}</span>
                    <span>
                      {a.prospectId ? (
                        <RecordName prospectId={a.prospectId} />
                      ) : (
                        a.organisationName
                      )}
                    </span>
                    <LaneChip lane={a.lane} size="sm" />
                  </div>
                  <p className={styles.askNote}>{a.standingAnswer}</p>
                </li>
              ))}
            </ul>
            <p className={shared.sectionFoot}>
              The response clock on these is on{" "}
              <Link to="/requests">requests</Link>. Both boards read the same
              rows.
            </p>
          </section>
        ) : null}

        <p className={styles.asAt}>
          Read as at {formatDate(LEAGUES_AS_OF)}. Every formula and source is
          on <Link to="/method">method</Link>.
        </p>
      </div>

      {/* The compose window, mounted once, exactly as on the board. */}
      <LeagueComposeMount compose={compose} />
    </div>
  );
}
