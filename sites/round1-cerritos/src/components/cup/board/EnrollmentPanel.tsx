import type { CupTeamView, EnrollmentView } from "@/domain/selectors/cup";
import { CUP_STATE, LANES_PER_CUP_MATCH, formatCupDate } from "@/domain/cup";
import type { TeamFormation } from "@/domain/leagues";
import { POSITION_LABEL } from "@/domain/leagues";
import { VENUE } from "@/data/venue";
import {
  ProvenanceBadge,
  WithheldFigure,
} from "@/components/primitives/ProvenanceBadge";
import { Bar, TokenMark } from "@/components/licensing/Panels";
import { RecordName } from "@/components/record/RecordName";
import { BowlerHandle, TeamName } from "./CupNames";
import styles from "./EnrollmentPanel.module.css";

/**
 * THE NEXT CUP, AND ENROLLING IS REAL PRODUCT.
 *
 * ── WHY THIS IS PRESENTED AS PRODUCT AND NOT AS A PREVIEW ─────────
 * Round1 publishes no league or cup programme at any location, so the cup
 * running now is a declared exhibition and every score in it is labelled.
 * Enrolling is different in kind. Putting a team down for January is a
 * thing a person can genuinely do against a programme that does not exist
 * yet, and it is the entire premise of this application, so the panel is
 * built like something you would actually
 * press: the field, the free slots, the deadline, the fee, what a team
 * gets for six nights, and who is already in.
 *
 * ── EVERY SCARCITY CLAIM HERE IS PHYSICALLY TRUE ──────────────────
 * The dishonest urgency patterns are named and documented and there is
 * not one of them on this panel. The countdown counts to a fixed date
 * that genuinely arrives and genuinely passes, and there is no version of
 * it that resets. "Five of sixteen free" is honest because the field is
 * sixteen for a reason that is arithmetic rather than copy: two lanes to
 * a match, eight matches on a pair each. It is not a marketing number and
 * it cannot be quietly raised.
 *
 * WHAT THE FIELD IS NO LONGER TIED TO IS A PUBLISHED LANE COUNT. Round1
 * publishes none, for any location, so the sixteen is this board's own
 * figure and the panel says so rather than borrowing authority from a
 * number nobody published.
 *
 * There is no viewer count, no "popular right now", no social proof of
 * any kind that cannot be checked, and no price claim beyond the one
 * labelled figure below.
 *
 * ── THE FEE IS THIS APPLICATION'S OWN AND IT SAYS SO ──────────────
 * Round1 publishes nothing at all about leagues, a fee included, and
 * neither does either competitor with a comparable programme. So the
 * figure carries the illustrative badge, the sentence that names it as
 * this prototype's proposal, and it is not added to any ledger on any
 * board in this application. What a cup commits is LANE NIGHTS, which is
 * inventory rather than money.
 *
 * ── AND HOW A TEAM CAME TO EXIST IS ON EVERY ROW ──────────────────
 * The venue formed it, a captain brought a roster, or an organisation off
 * the prospecting board fielded it. Those are three genuinely different
 * products with three different conversations behind them, and a rep
 * reading this list needs to know which one a row is before pressing
 * anything.
 */

const FORMATION: Record<TeamFormation, { glyph: string; label: string; note: string }> = {
  "venue-formed": {
    glyph: "◍",
    label: "Venue formed",
    note: "The house put the team together and the public joined it. The easiest slot to fill and the one with no relationship behind it.",
  },
  "captain-formed": {
    glyph: "◆",
    label: "Captain formed",
    note: "A captain brought a roster. One conversation reaches five bowlers, and the captain is the person to have it with.",
  },
  "organisation-formed": {
    glyph: "◈",
    label: "Organisation formed",
    note: "A crew from an organisation already on the prospecting board. The team is a booking that came off the board.",
  },
};

export const FORMATION_ORDER: TeamFormation[] = [
  "organisation-formed",
  "captain-formed",
  "venue-formed",
];

export function formationToken(formation: TeamFormation) {
  const f = FORMATION[formation];
  return { glyph: f.glyph, label: f.label, cssVar: "var(--neutral)", note: f.note };
}

function EntryRow({
  entry,
  teamSize,
  slotState,
  onFillSeat,
}: {
  entry: CupTeamView;
  teamSize: number;
  /**
   * The CUP entry's state, and it is passed in rather than read off the
   * team.
   *
   * A team also carries a slot state in `data/leagues.ts`, and that one is
   * about its place in a LEAGUE field. The two are different facts about
   * different products and they do not have to agree, so drawing the
   * league's answer on a cup row would put a word on screen that
   * contradicts the count above it the first time somebody confirms one
   * and not the other.
   */
  slotState: "confirmed" | "held";
  onFillSeat: (entry: CupTeamView) => void;
}) {
  const short = teamSize - entry.team.bowlersCommitted;

  return (
    <li className={styles.entry} data-short={short > 0 ? "yes" : "no"}>
      <div className={styles.entryTop}>
        <span className={styles.entryName}>
          <TeamName teamId={entry.team.id} name={entry.team.name} />
        </span>
        <TokenMark token={formationToken(entry.formation)} small />
        <span className={styles.entrySlot}>
          <span aria-hidden="true">
            {slotState === "confirmed" ? "●" : "◐"}
          </span>{" "}
          {slotState === "confirmed" ? "Confirmed" : "Held"}
        </span>
      </div>

      <div className={styles.entryFacts}>
        <span className={styles.entryRoster}>
          <span className="num">{entry.team.bowlersCommitted}</span> of{" "}
          <span className="num">{teamSize}</span> bowlers
        </span>
        {entry.captain ? (
          <span className={styles.entryCaptain}>
            Captain <BowlerHandle handle={entry.captain.handle} />,{" "}
            {POSITION_LABEL[entry.captain.position]}
          </span>
        ) : null}
        {entry.prospect ? (
          <span className={styles.entryOrg}>
            <RecordName prospectId={entry.prospect.id} />
          </span>
        ) : (
          <span className={styles.entryOrgNone}>
            <span aria-hidden="true">○</span> No organisation behind it
          </span>
        )}
      </div>

      {short > 0 ? (
        <div className={styles.entryShort}>
          <span className={styles.entryShortWord}>
            <span aria-hidden="true">◐</span>{" "}
            <strong className="num">{short}</strong> seat
            {short === 1 ? "" : "s"} short
          </span>
          <button
            type="button"
            className={styles.entryAct}
            onClick={() => onFillSeat(entry)}
          >
            <span aria-hidden="true">✎</span>
            <span>Fill the seat</span>
            <span className="visually-hidden"> on {entry.team.name}</span>
          </button>
        </div>
      ) : null}
    </li>
  );
}

export function EnrollmentPanel({
  enrollment,
  slotStates,
  onTakeSlot,
  onFillSeat,
}: {
  enrollment: EnrollmentView;
  /** Cup entry state per team id. See the note on EntryRow. */
  slotStates: Record<string, "confirmed" | "held">;
  onTakeSlot: () => void;
  onFillSeat: (entry: CupTeamView) => void;
}) {
  const { cup } = enrollment;
  const teamSize = cup.teamSize;
  const pct = (n: number) => (n / Math.max(1, enrollment.field)) * 100;
  const closes = enrollment.closesAt;
  const days = enrollment.daysToClose;

  return (
    <div className={styles.panel}>
      <div className={styles.head}>
        <div className={styles.headTop}>
          <p className={styles.kicker}>
            {cup.quarter} {cup.year}, taking teams
          </p>
          <TokenMark token={CUP_STATE[cup.state]} />
        </div>
        <h3 className={styles.name}>{cup.name}</h3>
        <p className={styles.strapline}>{cup.strapline}</p>
      </div>

      <div className={styles.body}>
        {/* ---------------------------------------------------------
            The offer
            --------------------------------------------------------- */}
        <div className={styles.offer}>
          <div className={styles.slots}>
            <p className={styles.slotsLine} aria-live="polite">
              <strong className={`${styles.slotsFree} num`}>
                {enrollment.free}
              </strong>{" "}
              of <span className="num">{enrollment.field}</span> slots free
            </p>
            <Bar
              pct={pct(enrollment.confirmed)}
              value={`${enrollment.confirmed} of ${enrollment.field}`}
              label={`Slots confirmed in ${cup.name}`}
              tone="var(--ok)"
            />
            <Bar
              pct={pct(enrollment.claimed)}
              value={`${enrollment.claimed} of ${enrollment.field}`}
              label={`Slots claimed in ${cup.name}, confirmed and held together`}
              tone="var(--warn)"
            />
            <p className={styles.slotsWhy}>
              <span aria-hidden="true">◇</span>
              <span>
                The field is <span className="num">{enrollment.field}</span>{" "}
                because a match is bowled across{" "}
                <span className="num">{LANES_PER_CUP_MATCH}</span> lanes. How
                many lanes {VENUE.name} actually has is a different question,
                and it has no published answer:{" "}
                <WithheldFigure
                  reason="Round1 publishes no lane count for any location, including Lakewood Center, the nearest store to this office. The field above is this board's own figure and the scarcity in it is arithmetic, not a claim about the building."
                />
              </span>
            </p>
          </div>

          <dl className={styles.terms}>
            <div className={styles.term}>
              <dt>Enrollment closes</dt>
              <dd>
                {closes ? formatCupDate(closes) : "Not open yet"}
                {days !== null && days > 0 ? (
                  <span className={styles.termSub}>
                    <span className="num">{days}</span> days left, and it closes
                  </span>
                ) : null}
              </dd>
            </div>
            <div className={styles.term}>
              <dt>First ball</dt>
              <dd>
                {formatCupDate(cup.nightDates[0])}
                <span className={styles.termSub}>
                  {cup.night}, {cup.startTime}
                </span>
              </dd>
            </div>
            <div className={styles.term}>
              <dt>What a team bowls</dt>
              <dd>
                <span className="num">{cup.nightDates.length}</span> nights
                <span className={styles.termSub}>
                  every team on the lanes on all{" "}
                  <span className="num">{cup.nightDates.length}</span>, including
                  the finals
                </span>
              </dd>
            </div>
            <div className={styles.term}>
              <dt>Team</dt>
              <dd>
                <span className="num">{teamSize}</span> bowlers
                <span className={styles.termSub}>
                  Baker scored, five sharing one ten frame game
                </span>
              </dd>
            </div>
            <div className={styles.term}>
              <dt>Proposed entry</dt>
              <dd>
                <span className="num">${enrollment.fee}</span> a team
                <span className={styles.termSub}>
                  <span className="num">${enrollment.feePerBowler}</span> a
                  bowler
                </span>
                <span className={styles.termBadge}>
                  <ProvenanceBadge provenance={enrollment.feeProvenance} compact />
                </span>
              </dd>
            </div>
            <div className={styles.term}>
              <dt>Handicap</dt>
              <dd>
                Declared as a rule
                <span className={styles.termSub}>
                  <span className="num">{cup.handicapFactorPct}</span>% of{" "}
                  <span className="num">{cup.handicapBasis}</span>, once there
                  are averages to compute one from
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <p className={styles.feeNote}>
          <span aria-hidden="true">◆</span> {enrollment.feeNote}
        </p>

        <div className={styles.act}>
          <button type="button" className={styles.actPrimary} onClick={onTakeSlot}>
            <span aria-hidden="true">✎</span>
            <span>Put a team down for {cup.name}</span>
          </button>
          <span className={styles.actNote}>
            Nothing is charged and nothing is committed. It is a registration of
            interest against a field that has{" "}
            <span className="num">{enrollment.free}</span> places in it.
          </span>
        </div>

        {/* ---------------------------------------------------------
            Who is in
            --------------------------------------------------------- */}
        <div className={styles.field}>
          <h4 className={styles.fieldTitle}>
            In the field so far{" "}
            <span className={`${styles.fieldCount} num`} aria-live="polite">
              {enrollment.claimed}
            </span>
          </h4>
          <p className={styles.fieldLede}>
            <span className="num">{enrollment.confirmed}</span> confirmed,{" "}
            <span className="num">{enrollment.held}</span> holding a place, and{" "}
            <span className="num">{enrollment.bowlers}</span> bowlers already
            committed across them.
          </p>

          <ul className={styles.entries}>
            {enrollment.entries.map((entry) => (
              <EntryRow
                key={entry.team.id}
                entry={entry}
                teamSize={teamSize}
                slotState={slotStates[entry.team.id] ?? "held"}
                onFillSeat={onFillSeat}
              />
            ))}
            {Array.from({ length: enrollment.free }).map((_, i) => (
              <li key={`free-${i}`} className={styles.free}>
                <span className={styles.freeMark} aria-hidden="true">
                  ○
                </span>
                <span className={styles.freeWord}>Slot free</span>
                <button
                  type="button"
                  className={styles.entryAct}
                  onClick={onTakeSlot}
                >
                  <span aria-hidden="true">✎</span>
                  <span>Take it</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
