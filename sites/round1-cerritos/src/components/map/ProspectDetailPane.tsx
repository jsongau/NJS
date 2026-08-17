import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useSearchParams } from "react-router-dom";
import type { OfferState, PitchStatus, Prospect } from "@/domain/types";
import type { StatusToken } from "@/domain/vocabulary";
import {
  EMAIL_CONFIDENCE,
  PITCH_STATUS,
  PITCH_STATUS_ORDER,
} from "@/domain/vocabulary";
import { GUESTS_PER_BOWLING_LANE, LANE_META } from "@/domain/lanes";
import { PACKAGES, PACKAGE_BY_ID } from "@/data/packages";
import { OFFERS, VENUE } from "@/data/venue";
import type { DeskLine } from "@/domain/selectors/desk";
import { runSentence, type GoSeeRun } from "@/domain/selectors/goSeeRuns";
import {
  INTENT_META,
  ORG_TYPE_META,
  RECORD_AS_OF,
  prospectRecord,
  type ProspectRecord,
} from "@/domain/selectors/record";
import { usePipeline, usePipelineDispatch } from "@/state/PipelineProvider";
import { useBook } from "@/state/BookProvider";
import { KIND_META, OUTCOME_META, sentTo, useOutbox } from "@/state/OutboxProvider";
import { useOpenQuotePreview } from "@/state/QuotePreviewProvider";
import type { ComposeIntent } from "@/components/email/EmailComposeModal";
import { ProspectPlate } from "@/components/primitives/Wordmark";
import { LaneChip } from "@/components/primitives/LaneChip";
import {
  EmailConfidenceChip,
  StatusChip,
  TokenChip,
} from "@/components/primitives/StatusChip";
import { FamilyChip } from "@/components/primitives/FamilyChip";
import { Button } from "@/components/primitives/Button";
import {
  Figure,
  ProvenanceBadge,
  WithheldFigure,
} from "@/components/primitives/ProvenanceBadge";
import { RecordName } from "@/components/record/RecordName";
import { REQUEUE_META, Timeline, formatDay } from "@/components/record/Timeline";
import styles from "./ProspectDetailPane.module.css";

/**
 * ONE ORGANISATION, BESIDE THE MAP, PERMANENTLY.
 *
 * The record modal is a takeover: it fills the screen, a reader deals
 * with one organisation and it goes away. This pane is a third column
 * that never goes away. A reader walks a row of pins with the arrow keys
 * and the pane keeps answering the same questions about whichever pin
 * they landed on. Different reading motion, therefore different shape:
 * no scrim, no takeover, and four tabs under a header that does not
 * move.
 *
 * ── WHY THESE FIVE TABS ────────────────────────────────────────────
 * The pane used to carry Packages, Messages and Why them. Those are
 * three readings of an organisation and none of them is a question
 * somebody closing a sale asks. The five here are the five decisions in
 * front of a rep holding a phone:
 *
 *   Place         who and where they are, and every route to them. The
 *                 address set as an address, the phone as a phone, the
 *                 written door with the page it was read off, the role
 *                 that signs, and the facts that make the row checkable.
 *   Status        where it stands, how long it has sat there, whether
 *                 the silence is now longer than this stage allows, what
 *                 moves it, and the controls that move it.
 *   Potential     what it is worth pursuing: the intent reading with the
 *                 named evidence behind it, the modelled headcount, the
 *                 lanes it consumes, the packages that fit and the value
 *                 if it lands.
 *   Last activity the thread, newest first, with channel, role and what
 *                 each message changed.
 *   Offers        what has been put on the table, to which role, when,
 *                 whether it still stands and what it costs the venue.
 *
 * Packages did not disappear; it is the part of Potential that answers
 * "what do I lead with". The score breakdown moved to the desk, which is
 * where the ranking is made and argued.
 *
 * ── PLACE IS FIRST AND PLACE IS THE DEFAULT ────────────────────────
 * The marker popup over the map used to carry the address, the role,
 * the door and the two figures. It stood 584 pixels tall over a 762
 * pixel map pane, so it was cut to 238 and the facts had to land
 * somewhere. This is that somewhere, and it is the right home for them:
 * a popup floats over the thing it annotates and disappears on the next
 * click, while this column stays open for as long as the reader is
 * working the territory.
 *
 * It opens by default because it is the tab a rep wants when they have
 * just pressed a pin: what is this place, where is it, and how do I get
 * hold of somebody. Status, which used to be the default, answers the
 * second question a reader asks rather than the first, and it is one
 * press away. A link that already names a tab still wins over this
 * default, so nothing anybody has bookmarked lands somewhere new.
 *
 * ── THE TAB BAR IS STICKY AND THE HEADER IS SHORT ──────────────────
 * The owner asked to be able to scroll to the tabs. He should not have
 * to. The header is flex-none and carries six facts and two actions; the
 * tab bar is the first thing in the scrolling region and sticks to its
 * top, so it is on screen at first paint at 900px tall and stays there
 * however far the panel under it scrolls.
 *
 * ── EVERY FIGURE COMES OUT OF ONE SELECTOR ─────────────────────────
 * `prospectRecord` returns the status, the thread, the day counts, the
 * intent reading, the offers, the decay test and the next action in one
 * object. Not one of them is recomputed here. Four surfaces show these
 * numbers and a fifth version of "days since last contact" is how two
 * screens end up disagreeing in front of the person who has to trust
 * both.
 *
 * ── WHAT THIS COMPONENT REFUSES TO OWN ─────────────────────────────
 * It does not open the email modal; it raises `onCompose` and the board
 * owns the modal. It does not own its width; the board's grid sets that.
 * It does not invent a discount: Round1 publishes no price for any party
 * package, so there is nothing to take a percentage off, and the only
 * leverage this desk has is the published contents of the package and the
 * published booking terms.
 */

/**
 * The tab ids, canonical first.
 *
 * The three legacy ids are still in the union because the board holds
 * this value in its own state and that file belongs to another pass this
 * week. They are accepted, mapped onto the tab that replaced them and
 * never written back out, so a stale link or a stale piece of state
 * lands somewhere sensible instead of on a blank panel.
 */
export type DetailTab =
  | "place"
  | "status"
  | "potential"
  | "activity"
  | "offers"
  | "packages"
  | "messages"
  | "why";

/** What the pane actually renders. */
type PaneTab = "place" | "status" | "potential" | "activity" | "offers";

export type DetailSubTab = "fit" | "offers" | "score";
export type PackageFilter = "best" | "priced" | "all";

/**
 * The query parameter the open tab lives in.
 *
 * Deliberately not "tab": the board's URL already carries `prospect`,
 * and other surfaces on this route may want a tab of their own. `rtab`
 * is the record's tab and nothing else's.
 */
const TAB_PARAM = "rtab";

function normaliseTab(raw: string | null | undefined): PaneTab | null {
  switch (raw) {
    case "place":
      return "place";
    case "status":
    case "why":
      return "status";
    case "potential":
    case "packages":
      return "potential";
    case "activity":
    case "messages":
      return "activity";
    case "offers":
      return "offers";
    default:
      return null;
  }
}

/**
 * The same test, refusing the three legacy ids.
 *
 * A legacy id has to keep working when it arrives in a link, and it
 * must NOT be treated as a preference when the board is simply holding
 * its own initial value. The board's initial state is "packages", and
 * without this distinction every reader would land on Potential
 * because of a default that predates these tabs.
 */
function heldTab(raw: DetailTab): PaneTab | null {
  switch (raw) {
    case "place":
    case "status":
    case "potential":
    case "activity":
    case "offers":
      return raw;
    default:
      return null;
  }
}

export interface ProspectDetailPaneProps {
  /**
   * The selected organisation.
   *
   * NULL IS A REAL STATE AND IT IS RENDERED, not skipped. This pane is a
   * permanent column, so null is what a reader sees before they have
   * clicked anything, and a blank third of the screen would read as a
   * broken page rather than as an invitation.
   */
  line: DeskLine | null;
  onClose: () => void;
  /** The board owns the compose modal. This pane only asks for it. */
  onCompose: (prospect: Prospect, intent: ComposeIntent) => void;
  tab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
  /** Held by the board and no longer rendered. Kept so its state type compiles. */
  subTab?: DetailSubTab;
  onSubTabChange?: (tab: DetailSubTab) => void;
  packageFilter: PackageFilter;
  onPackageFilterChange: (filter: PackageFilter) => void;
  /** True when the pane is an overlay rather than a grid column. */
  asOverlay: boolean;
  /**
   * The selected organisation has been filtered out of the board.
   *
   * The pane keeps rendering it rather than closing, because closing a
   * panel because somebody ticked a lane chip loses their place for a
   * reason they did not ask for.
   */
  outOfFilter?: boolean;
  onClearFilters?: () => void;
  /** The top of the ranked board, used by the empty state and nothing else. */
  topLine?: DeskLine | null;
  /**
   * ── THE ARRIVAL STATE, AND WHY IT IS A RUN ───────────────────────
   *
   * Nothing is selected when a reader lands on this board, so on the
   * widest layout a third of the screen was a heading reading "No
   * organisation selected" over one suggestion. A pane that spends its
   * largest type saying it has nothing to say teaches a person, in about
   * four visits, that the screen is not worth opening.
   *
   * What stands there now is the best go-see run the current board
   * supports: three to six organisations that publish no email address
   * and sit within four tenths of a mile of each other, in the order
   * somebody would walk them. That is the one answer this screen can give
   * that the ranked list on `/today` cannot, because it is a fact about
   * where these organisations are in relation to EACH OTHER rather than
   * about any one of them.
   *
   * The pane draws it and decides nothing about it. It does not build
   * runs, does not choose which one is offered and does not hold whether
   * one is on the board; all of that is the board's, exactly as the
   * selection is.
   */
  run?: GoSeeRun | null;
  /** True when this run is currently narrowing the board. */
  runIsOnBoard?: boolean;
  /** How many runs the board supports, for the cycle control. */
  runCount?: number;
  onTakeRun?: (runId: string) => void;
  onClearRun?: () => void;
  onNextRun?: () => void;
  /** Selects an organisation. Used by the run's stops and nothing else. */
  onSelect?: (prospectId: string) => void;
}

/**
 * The date stamped on a touch recorded here.
 *
 * Read once at module load rather than per click, so a board left open
 * for an afternoon does not stamp two touches in two different ways.
 */
const TODAY = new Date().toISOString().slice(0, 10);

/**
 * WHERE AN OFFER STANDS.
 *
 * This map belongs in domain/vocabulary.ts beside the other token maps
 * and it is not there yet, exactly as ORG_TYPE_META sits temporarily in
 * the record selector and CHANNEL_META in the timeline. This pass does
 * not own that file, and a second copy of a token map is a worse outcome
 * than a temporarily misplaced one. When it moves, delete it here rather
 * than leaving a copy behind.
 */
const OFFER_STATE_META: Record<OfferState, StatusToken> = {
  open: {
    glyph: "○",
    label: "Open",
    cssVar: "var(--info)",
    note: "On the table and unanswered. An offer nobody replied to is not a soft yes.",
  },
  accepted: {
    glyph: "●",
    label: "Accepted",
    cssVar: "var(--ok)",
    note: "They took it.",
  },
  declined: {
    glyph: "✕",
    label: "Declined",
    cssVar: "var(--risk)",
    note: "They said no to the offer, which is not always a no to the venue.",
  },
  lapsed: {
    glyph: "◌",
    label: "Lapsed",
    cssVar: "var(--warn)",
    note: "Time ran out on it. Recorded rather than quietly reopened.",
  },
  withdrawn: {
    glyph: "◍",
    label: "Withdrawn",
    cssVar: "var(--neutral)",
    note: "The venue pulled it, and the reason sits beside it.",
  },
};

/** "1 day" and "2 days". Nothing on a working screen should say "1 days". */
function dayWord(n: number): string {
  return n === 1 ? "1 day" : `${n} days`;
}

/** The domain, for a link that has to read as a place rather than a URL. */
function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * The path a source URL points at, so a link can show the page rather
 * than only the domain.
 *
 * "bousd.us" is a claim that an address came off a school district
 * somewhere. "bousd.us/staff" is a claim a reader can check in fifteen
 * seconds, which is the entire point of carrying the field.
 */
function pathOf(url: string): string {
  return url.replace(/^https?:\/\/[^/]+/, "") || "/";
}

/**
 * The organisation's address split into the two lines an envelope has.
 *
 * The seeded rows all carry a single-line address that ends in the same
 * city, state and postal code held in their own fields, so the tail is
 * removed rather than repeated. A row that does not match that shape,
 * which is the case for anything typed in from a pavement later, keeps
 * its whole address on one line instead of being cut in a place nobody
 * checked.
 */
function addressLines(p: Prospect): { street: string; locality: string | null } {
  const tail = `, ${p.city}, ${p.state} ${p.postalCode}`;
  if (!p.address.endsWith(tail)) return { street: p.address, locality: null };
  return {
    street: p.address.slice(0, -tail.length),
    locality: `${p.city}, ${p.state} ${p.postalCode}`,
  };
}

/**
 * The address as something a maps application will accept.
 *
 * WHY A SEARCH URL AND NOT A COORDINATE PAIR. Every row here carries a
 * latitude and a longitude, and handing those to a maps application
 * drops a pin on a point with no name on it, which is useless to
 * somebody who has arrived outside a business park and needs to know
 * which unit. A search on the written address resolves to the
 * organisation's own listing, with its name, its hours where it
 * publishes any and its own directions button.
 *
 * The `api=1` form is Google's documented universal link: a handset with
 * the app installed opens the app, and everything else opens the same
 * place in a browser tab. Where the row came back from the Places API it
 * also carries the place id, which pins the search to exactly the
 * listing this record was built from rather than to whatever the text
 * search decides is the best match today.
 */
function mapsHref(p: Prospect): string {
  const base = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address)}`;
  return p.placeId
    ? `${base}&query_place_id=${encodeURIComponent(p.placeId)}`
    : base;
}

/**
 * The next status a row can be advanced to from this pane.
 *
 * IT STOPS AT "DATE HELD" ON PURPOSE. The step from a held date to a
 * booking is a signature and a deposit, and the money lives in
 * BookProvider where a booking cannot exist without a line to carry it.
 * Letting a map pane mark something booked would put a contract in the
 * pipeline with no revenue attached, which is the single failure the two
 * ledger model exists to prevent.
 */
function nextStatus(status: PitchStatus): PitchStatus | null {
  if (status === "lost") return null;
  const i = PITCH_STATUS_ORDER.indexOf(status);
  const next = PITCH_STATUS_ORDER[i + 1];
  if (!next || next === "booked" || next === "lost") return null;
  return next;
}

// ---------------------------------------------------------------
// The tab bar
// ---------------------------------------------------------------

interface TabDef {
  id: PaneTab;
  glyph: string;
  label: string;
  /** The state or the count that makes the bar itself informative. */
  badge: string;
  /** The same value, unformatted, for anything reading the DOM. */
  data: string;
  /** Read after the visible words, never instead of them. */
  detail: string;
  /** True where the badge is a warning rather than a count. */
  alert?: boolean;
}

/**
 * A real tab list: `role="tablist"`, arrow keys, Home and End, a roving
 * tab stop and exactly one focusable tab.
 *
 * The alternative, four styled buttons that swap a div, looks identical
 * and behaves nothing like a tab set. A keyboard reader lands in it and
 * has to tab through every tab to reach the panel, and a screen reader
 * is told there are four buttons rather than four views of one
 * organisation.
 *
 * THE BADGE IS PART OF THE INFORMATION. A bar that reads "Status stale,
 * Potential signalled, Last activity 5, Offers 2 open" has answered
 * three of the four questions before anybody has pressed anything, which
 * is the entire argument for putting counts on tabs.
 */
function TabBar({
  tabs,
  value,
  onSelect,
  label,
}: {
  tabs: TabDef[];
  value: PaneTab;
  onSelect: (id: PaneTab) => void;
  label: string;
}) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const i = tabs.findIndex((t) => t.id === value);
    let target = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown")
      target = (i + 1) % tabs.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
      target = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") target = 0;
    else if (e.key === "End") target = tabs.length - 1;
    if (target === -1) return;
    e.preventDefault();
    const id = tabs[target].id;
    onSelect(id);
    refs.current[id]?.focus();
  }

  return (
    <div
      className={styles.tabBar}
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      data-tabbar="detail"
    >
      {tabs.map((t) => {
        const selected = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`detail-tab-${t.id}`}
            aria-selected={selected}
            aria-controls={`detail-panel-${t.id}`}
            tabIndex={selected ? 0 : -1}
            ref={(el) => {
              refs.current[t.id] = el;
            }}
            className={styles.tab}
            data-tab={t.id}
            data-count={t.data}
            data-alert={t.alert ? "true" : "false"}
            onClick={() => onSelect(t.id)}
          >
            <span className={styles.tabTop}>
              <span className={styles.tabGlyph} aria-hidden="true">
                {t.glyph}
              </span>
              <span className={styles.tabLabel}>{t.label}</span>
            </span>
            <span className={styles.tabBadge}>{t.badge}</span>
            {/* Visible words first, expansion after, so the accessible
                name still begins with what the eye reads. */}
            <span className="visually-hidden">{`. ${t.detail}`}</span>
          </button>
        );
      })}
    </div>
  );
}

function Panel({
  id,
  active,
  children,
}: {
  id: PaneTab;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={styles.panel}
      role="tabpanel"
      id={`detail-panel-${id}`}
      aria-labelledby={`detail-tab-${id}`}
      hidden={!active}
      tabIndex={0}
      data-panel={id}
    >
      {/* Mounted only while it is the open tab. The panel element itself
          stays in the document so the tab's `aria-controls` always
          points at something real. */}
      {active ? children : null}
    </div>
  );
}

/** A labelled fact with the origin it is obliged to carry. */
function Fact({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.fact}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/**
 * A fact that stacks its label over its value so two of them can sit
 * side by side.
 *
 * The pane is 432 pixels wide in its grid state, which is enough for two
 * short facts across and nothing like enough for two label-and-value
 * pairs in the eleven character gutter `Fact` uses. Below the pane's
 * narrow breakpoint the grid collapses to one column and these read as
 * an ordinary list, which is why the markup is the same definition list
 * either way.
 */
function Cell({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.cell}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/** A value the research does not have, said as a fact rather than left blank. */
function Absent({ children, what }: { children: ReactNode; what?: string }) {
  return (
    <span className={styles.absent} data-absent={what}>
      <span aria-hidden="true">◻</span> {children}
    </span>
  );
}

// ---------------------------------------------------------------
// The pane
// ---------------------------------------------------------------

export const ProspectDetailPane = memo(function ProspectDetailPane({
  line,
  onClose,
  onCompose,
  tab,
  onTabChange,
  packageFilter,
  onPackageFilterChange,
  asOverlay,
  outOfFilter = false,
  onClearFilters,
  topLine = null,
  run = null,
  runIsOnBoard = false,
  runCount = 0,
  onTakeRun,
  onClearRun,
  onNextRun,
  onSelect,
}: ProspectDetailPaneProps) {
  const pipeline = usePipeline();
  const dispatch = usePipelineDispatch();
  const { book } = useBook();
  const outbox = useOutbox();
  /* The customer's letter opens over this pane rather than instead of
     it. The route it previews is prospect facing and carries no rail, so
     navigating there from in here used to take the whole board away. */
  const openQuotePreview = useOpenQuotePreview();

  const scrollRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [worked, setWorked] = useState("");
  /** What the copy control last did. Reported in place, politely. */
  const [copied, setCopied] = useState("");

  const selectedId = line?.prospect.id ?? null;

  /**
   * The whole record, derived once per state change.
   *
   * The pipeline object identity changes only when somebody dispatches,
   * so recording a touch recomputes and pressing a tab does not. The
   * pane is remounted with a new selection on every pin click, which is
   * the reason this is memoised at all.
   */
  const record = useMemo<ProspectRecord | null>(
    () => (selectedId ? prospectRecord(selectedId, { pipeline, book }) : null),
    [selectedId, pipeline, book],
  );

  // --- The open tab, which lives in the URL ------------------------

  const [search, setSearchParams] = useSearchParams();
  const urlTab = normaliseTab(search.get(TAB_PARAM));
  const propTab = heldTab(tab);
  /* A link wins, then whatever the board is holding, then Place, which
     is what a rep wants in the second after they press a pin: what is
     this, where is it, and how do I get hold of somebody. An existing
     deep link naming any other tab still lands on that tab, because the
     URL is read before this fallback is ever reached. */
  const active: PaneTab = urlTab ?? propTab ?? "place";

  /**
   * The scroll position at the moment a tab was pressed.
   *
   * Panels differ in height, and a browser clamps `scrollTop` to the new
   * content the instant it swaps. Without this, switching from a long
   * panel to a short one and back leaves the reader somewhere they never
   * scrolled to. Restored in a layout effect, before paint, so nothing
   * moves on screen at all.
   */
  const keepScroll = useRef<number | null>(null);

  const selectTab = useCallback(
    (id: PaneTab) => {
      keepScroll.current = scrollRef.current?.scrollTop ?? 0;
      onTabChange(id);
      /* Replace rather than push. A tab is a view of the same record,
         and putting a history entry behind every press turns the back
         button into an undo nobody asked for. */
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(TAB_PARAM, id);
          return next;
        },
        { replace: true },
      );
    },
    [onTabChange, setSearchParams],
  );

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || keepScroll.current === null) return;
    el.scrollTop = keepScroll.current;
    keepScroll.current = null;
  }, [active]);

  /**
   * The board is told once, on arrival, which tab is actually open.
   *
   * Two cases need it: a link arrived carrying a tab, and the board is
   * holding a legacy id from its own initial state. After this the two
   * agree, because every press writes to both.
   */
  useEffect(() => {
    if (active !== propTab) onTabChange(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Whatever opened the pane is remembered so closing can put the eye
   * back where it was. Without it, a keyboard reader who opens the
   * fourteenth card and closes it is returned to the top of the document
   * and has to walk the list again.
   */
  useEffect(() => {
    if (!selectedId) return;
    openerRef.current = document.activeElement as HTMLElement | null;
  }, [selectedId]);

  /**
   * Two things happen when the selection changes, and both of them are
   * bugs when they are missing. The pane resets its scroll, because a
   * reader deep in one organisation's thread should not land mid-panel
   * on a different organisation. And the new organisation is announced
   * politely, because a panel that silently swaps its entire contents
   * under a screen reader has changed everything and said nothing.
   */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    setWorked("");
    setCopied("");
    if (!line) {
      /* The pane is not empty when nothing is selected any more, so it no
         longer says it is. What is standing there is the run, and that is
         what a screen reader is told is standing there. */
      setAnnouncement("");
      return;
    }
    const p = line.prospect;
    setAnnouncement(
      `${p.name} selected. ${LANE_META[p.lane].label}, ${PITCH_STATUS[
        line.status
      ].label.toLowerCase()}, ${line.miles.toFixed(1)} straight line miles out.`,
    );
    /* Keyed on the id alone. The line object is rebuilt by the selectors
       on every status change, so depending on it would re-announce the
       same organisation every time somebody recorded a touch, which
       turns a helpful live region into noise. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  /**
   * The run is announced when it changes, and only while it is the thing
   * standing in the pane.
   *
   * "Next run" and "Put the run on the board" both replace the entire
   * contents of this pane with a different six organisations, silently. A
   * panel that swaps everything and says nothing has changed everything
   * and told nobody, which is the same defect the selection announcement
   * two blocks up exists to fix.
   *
   * Keyed on the run's identity rather than on the run object, which the
   * selector rebuilds whenever anybody records a touch.
   */
  const runId = run?.id ?? null;
  useEffect(() => {
    if (selectedId) return;
    if (!runId || !run) {
      setAnnouncement("");
      return;
    }
    setAnnouncement(
      `Go-see run${runIsOnBoard ? ", on the board" : ""}. ${runSentence(run)}`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId, runIsOnBoard, selectedId]);

  /** Focus moves in only when the pane took over the screen. */
  useEffect(() => {
    if (selectedId && asOverlay) headingRef.current?.focus();
  }, [selectedId, asOverlay]);

  const handleClose = useCallback(() => {
    const opener = openerRef.current;
    onClose();
    /* After the board has processed the close, so nothing takes the
       focus back on the same frame. */
    window.requestAnimationFrame(() => opener?.focus?.());
  }, [onClose]);

  /* Escape belongs to the overlay only. As a grid column this pane took
     nothing over, and swallowing Escape there would take it away from
     the map, which has its own use for it. */
  useEffect(() => {
    if (!asOverlay || !selectedId) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [asOverlay, selectedId, handleClose]);

  const live = (
    <div className="visually-hidden" aria-live="polite" role="status">
      {announcement}
    </div>
  );

  // --- Nothing selected -------------------------------------------

  if (!line || !record) {
    return (
      <aside
        className={styles.pane}
        /*
          It was hardcoded false, because this state could only ever be
          seen as the permanent third column. It can now be reached on a
          phone, where the pane is drawn over the map, so it has to tell
          the stylesheet which of the two it is. It is deliberately NOT
          given `role="dialog"`: there is nothing to close and nothing has
          been taken over, and a dialog a reader cannot dismiss is a trap.
        */
        data-overlay={asOverlay ? "true" : "false"}
        aria-labelledby="detail-empty-heading"
      >
        {live}
        {/*
          A WAY OUT, AND ONLY WHERE THERE IS SOMETHING TO GET OUT OF.

          As the permanent third column this pane has taken nothing over
          and a close control would be a button that removes a column
          nobody asked it to. On a handset the same state is drawn fixed
          at the full width of the viewport, over the board's chrome band
          and over the pane switcher, so without this the run would be a
          screen with no exit on it. The switcher underneath is the other
          way back and this returns the reader to it.
        */}
        {asOverlay ? (
          <button
            type="button"
            className={`${styles.close} ${styles.emptyClose}`}
            onClick={handleClose}
            aria-label="Close this panel"
          >
            <span aria-hidden="true">✕</span>
          </button>
        ) : null}
        <div className={styles.scroller} ref={scrollRef}>
          <div className={styles.empty}>
            {/* ---------------------------------------------------------
                THE RUN. Three to six doors that can be walked in one
                afternoon, in the order somebody would walk them.

                It is an ordered list because the order is the content.
                Each stop is one control that selects the organisation, so
                the map pans to its pin and the whole pane fills with the
                record; the run is therefore a way INTO the board rather
                than a card sitting beside it.
                --------------------------------------------------------- */}
            {run ? (
              <section className={styles.run} aria-labelledby="detail-empty-heading">
                <p className={styles.runKicker}>
                  <span aria-hidden="true">◈</span>
                  <span>Go-see run</span>
                  {runIsOnBoard ? (
                    <strong className={styles.runOn}>On the board</strong>
                  ) : null}
                </p>

                <h2 className={styles.emptyHeading} id="detail-empty-heading">
                  <span className="num">{run.stops.length}</span> stops within{" "}
                  <span className="num">{run.spanMiles.toFixed(1)}</span> miles
                </h2>

                <dl className={styles.runFigures}>
                  <div className={styles.runFigure}>
                    <dt>Nearest stop</dt>
                    <dd>
                      <span className="num">
                        {run.fromVenueMiles.toFixed(1)}
                      </span>{" "}
                      mi
                      <ProvenanceBadge provenance="modeled" compact />
                    </dd>
                  </div>
                  <div className={styles.runFigure}>
                    <dt>Whole walk</dt>
                    <dd>
                      <span className="num">{run.walkMiles.toFixed(1)}</span> mi
                      <ProvenanceBadge provenance="modeled" compact />
                    </dd>
                  </div>
                  <div className={styles.runFigure}>
                    <dt>Guests</dt>
                    <dd>
                      <span className="num">
                        {run.guests.toLocaleString("en-GB")}
                      </span>
                      <ProvenanceBadge provenance="modeled" compact />
                    </dd>
                  </div>
                </dl>

                <ol className={styles.runStops}>
                  {run.stops.map((stop, i) => {
                    const sp = stop.line.prospect;
                    const sdoor = EMAIL_CONFIDENCE[sp.emailConfidence];
                    return (
                      <li key={sp.id}>
                        <button
                          type="button"
                          className={styles.runStop}
                          data-run-stop={sp.id}
                          onClick={() => onSelect?.(sp.id)}
                          aria-label={`Stop ${i + 1}, ${sp.name}. ${sdoor.label}. ${stop.line.miles.toFixed(1)} straight line miles from the building.`}
                        >
                          <span className={`${styles.runStopRank} num`} aria-hidden="true">
                            {i + 1}
                          </span>
                          <span className={styles.runStopText}>
                            <span className={styles.runStopName}>{sp.name}</span>
                            <span className={styles.runStopMeta}>
                              <span aria-hidden="true">{sdoor.glyph}</span>{" "}
                              {sdoor.label}
                            </span>
                          </span>
                          <span className={`${styles.runStopMiles} num`}>
                            {stop.line.miles.toFixed(1)} mi
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>

                <div className={styles.runActions}>
                  {runIsOnBoard ? (
                    <Button
                      size="sm"
                      glyph="✕"
                      className={styles.runAction}
                      onClick={onClearRun}
                    >
                      Clear the run
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="primary"
                      glyph="◈"
                      className={styles.runAction}
                      onClick={() => onTakeRun?.(run.id)}
                    >
                      Put the run on the board
                    </Button>
                  )}
                  {runCount > 1 && !runIsOnBoard ? (
                    <Button
                      size="sm"
                      glyph="›"
                      className={styles.runAction}
                      onClick={onNextRun}
                      aria-label={`Offer the next of ${runCount} go-see runs`}
                    >
                      Next run
                    </Button>
                  ) : null}
                </div>

                {/* The one line a figure on this card would be misread
                    without. It is the same claim the rings on the map
                    make, because it is the same arithmetic. */}
                <p className={styles.runProv}>
                  <ProvenanceBadge provenance="modeled" />
                  <span>
                    Grouped from published coordinates by straight line
                    distance. Not drive times.
                  </span>
                </p>
              </section>
            ) : (
              <h2 className={styles.emptyHeading} id="detail-empty-heading">
                No go-see run on this board
              </h2>
            )}

            {topLine ? (
              <div className={styles.emptyDo}>
                <p className={styles.emptyDoLead}>
                  Ranked first this month,{" "}
                  <strong>
                    <RecordName
                      prospectId={topLine.prospect.id}
                      name={topLine.prospect.name}
                    />
                  </strong>{" "}
                  on a score of <span className="num">{topLine.score}</span>.{" "}
                  <ProvenanceBadge provenance="modeled" compact />
                </p>
                <p className={styles.emptyDoNext}>{topLine.nextAction}</p>
                <div className={styles.headActions}>
                  <button
                    type="button"
                    className={`${styles.headAction} ${styles.headWrite}`}
                    data-compose="write"
                    aria-label={`Write to ${topLine.prospect.name}`}
                    onClick={() => onCompose(topLine.prospect, "outreach")}
                  >
                    <span aria-hidden="true">▭</span>
                    <span>Write to them</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.headAction} ${styles.headQuote}`}
                    aria-label={`Preview the group quote for ${topLine.prospect.name}`}
                    onClick={() => openQuotePreview(topLine.prospect.id)}
                  >
                    <span aria-hidden="true">▣</span>
                    <span>Group quote</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className={styles.emptyDoNote}>
                Nothing on the board under the current filters.
                {onClearFilters ? (
                  <>
                    {" "}
                    <Button size="sm" variant="ghost" onClick={onClearFilters}>
                      Clear the filters
                    </Button>
                  </>
                ) : null}
              </p>
            )}
            <p className={styles.emptyFoot}>
              Demo mode. Sending writes a row to the outbox and nothing
              leaves this tab.
            </p>
          </div>
        </div>
      </aside>
    );
  }

  // --- One organisation --------------------------------------------

  const p = line.prospect;
  const lane = LANE_META[p.lane];
  const status = record.status;
  const stale = record.staleness;
  const intent = INTENT_META[record.intent.level];
  const orgType = ORG_TYPE_META[record.orgType];
  const midpoint = Math.round((p.headcountLow + p.headcountHigh) / 2);
  const sent = sentTo(outbox, p.id);
  const advance = nextStatus(status);
  const verified = p.emailConfidence === "verified_public" && Boolean(p.email);
  const sourceUrl = verified
    ? p.emailSourceUrl ?? p.contactFormUrl ?? p.website
    : p.contactFormUrl ?? p.website;
  const door = EMAIL_CONFIDENCE[p.emailConfidence];
  const { street, locality } = addressLines(p);
  /* The number the phone actually dials. Everything that is not a digit
     or a leading plus comes out, so a formatted number on the paper and
     a dialable one in the href are the same fact in two shapes. */
  const tel = p.phone ? `tel:${p.phone.replace(/[^0-9+]/g, "")}` : null;

  const fit = PACKAGES.filter((k) => k.laneFit.includes(p.lane));
  const fitPriced = fit.filter((k) => k.pricePerGuest !== null);
  const bestFit = [...fit].sort((a, b) =>
    a.id === p.leadPackageId ? -1 : b.id === p.leadPackageId ? 1 : 0,
  );
  const shownPackages =
    packageFilter === "best"
      ? bestFit
      : packageFilter === "priced"
        ? fitPriced
        : PACKAGES;

  const leadPackage = PACKAGE_BY_ID[p.leadPackageId];
  /* The value if it lands, and its arithmetic printed beside it. A
     published per guest price multiplied by a modelled headcount is a
     modelled figure, and it is badged as one. Where the lead package is
     one of the gated ones, there is no price to multiply and the row
     says so in the sentence the provenance system reserves for it. */
  const leadValue =
    leadPackage && leadPackage.pricePerGuest !== null
      ? leadPackage.pricePerGuest * midpoint
      : null;
  const bookedValue = record.bookLines.reduce(
    (n, l) => n + l.guests * l.pricePerGuest,
    0,
  );

  const extendedOfferIds = new Set(record.offers.map((o) => o.offer.id));
  const eligibleOffers = OFFERS.filter(
    (o) => o.eligibleLanes.includes(p.lane) && !extendedOfferIds.has(o.id),
  );

  const clockWord =
    stale.daysSinceActivity === null
      ? "Never touched"
      : `${dayWord(stale.daysSinceActivity)} quiet`;

  const tabs: TabDef[] = [
    {
      id: "place",
      glyph: "◎",
      label: "Place",
      /* The distance is the badge because it is the fact that decides
         whether this organisation is a phone call or a morning, and it
         is the one number on this tab a rep weighs before any other. */
      badge: `${line.miles.toFixed(1)} mi`,
      data: line.miles.toFixed(1),
      detail: `${p.address}. ${door.label}`,
    },
    {
      id: "status",
      glyph: "◑",
      label: "Status",
      badge: stale.stale
        ? "Stale"
        : stale.daysSinceActivity === null
          ? "New"
          : `${stale.daysSinceActivity}d`,
      data: stale.stale ? "stale" : String(stale.daysSinceActivity ?? "new"),
      detail: `${PITCH_STATUS[status].label}, ${clockWord.toLowerCase()}`,
      alert: stale.stale,
    },
    {
      id: "potential",
      glyph: intent.glyph,
      label: "Potential",
      badge: intent.label === "No intent recorded" ? "No signal" : intent.label,
      data: record.intent.level,
      detail: `Intent reading, ${record.intent.evidence.length} pieces of evidence`,
      alert: record.intent.level === "cooling",
    },
    {
      id: "activity",
      glyph: "▭",
      /*
        "Activity" rather than "Last activity". A fifth tab took each
        track from about 108 pixels to about 86, and "Last activity" is
        the only one of the five labels that will not set on one line in
        that width. A bar that wraps to two rows costs more height than
        this tab bar is allowed, and a bar that scrolls sideways hides
        tabs from the reader entirely, so the word goes instead. The
        panel heading inside still reads "The thread", and the accessible
        name below still says what the count is of.
      */
      label: "Activity",
      badge: record.messageCount === 0 ? "None" : String(record.messageCount),
      data: String(record.messageCount),
      detail:
        record.messageCount === 0
          ? "Last activity. No thread recorded"
          : `Last activity. ${record.inboundCount} received, ${record.outboundCount} sent`,
      alert: record.awaitingReply,
    },
    {
      id: "offers",
      glyph: "◆",
      label: "Offers",
      badge:
        record.offers.length === 0
          ? "None"
          : `${record.openOffers.length} open`,
      data: String(record.openOffers.length),
      detail:
        record.offers.length === 0
          ? "Nothing extended"
          : `${record.offers.length} extended, ${record.openOffers.length} still open`,
      alert: record.openOffers.length > 0,
    },
  ];

  /**
   * The address onto the clipboard, in one line, ready to paste into a
   * maps app or a calendar invitation.
   *
   * The failure branch is not decoration. `navigator.clipboard` is
   * undefined on an insecure origin and rejects outright when a browser
   * decides the gesture was not user-initiated, and a control that
   * silently does nothing is worse than one that says it could not. The
   * address is selectable text either way, so the fallback is a sentence
   * telling the reader to select it rather than a second mechanism.
   */
  async function copyAddress() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("no clipboard");
      await navigator.clipboard.writeText(p.address);
      setCopied("Address copied.");
    } catch {
      setCopied("The browser refused clipboard access. Select the address and copy it yourself.");
    }
  }

  function recordTouch() {
    dispatch({
      type: "RECORD_TOUCH",
      prospectId: p.id,
      packageId: p.leadPackageId,
      at: TODAY,
    });
    setWorked(`Touch recorded against ${p.name} today. The clock resets.`);
    setAnnouncement(`Touch recorded against ${p.name}.`);
  }

  function advanceStatus() {
    if (!advance) return;
    dispatch({
      type: "SET_STATUS",
      prospectId: p.id,
      packageId: p.leadPackageId,
      status: advance,
      at: TODAY,
    });
    setWorked(`Moved to ${PITCH_STATUS[advance].label.toLowerCase()}.`);
    setAnnouncement(
      `${p.name} moved to ${PITCH_STATUS[advance].label.toLowerCase()}.`,
    );
  }

  return (
    <>
      {asOverlay ? (
        <div className={styles.scrim} onClick={handleClose} aria-hidden="true" />
      ) : null}

      <aside
        className={styles.pane}
        data-overlay={asOverlay ? "true" : "false"}
        role={asOverlay ? "dialog" : undefined}
        aria-modal={asOverlay ? true : undefined}
        aria-labelledby="detail-heading"
      >
        {live}

        {/* ---------------------------------------------------------
            THE HEADER DOES NOT SCROLL AND IT DOES NOT SPRAWL. Six
            facts and two actions. Everything else is a tab.
            --------------------------------------------------------- */}
        <header className={styles.head}>
          <div className={styles.headTop}>
            <ProspectPlate name={p.name} lane={p.lane} size="md" />
            <div className={styles.headText}>
              <h2
                className={styles.name}
                id="detail-heading"
                tabIndex={-1}
                ref={headingRef}
              >
                <RecordName prospectId={p.id} name={p.name} />
              </h2>
              {/*
                THE ADDRESS SITS UNDER THE NAME AND NOT ONLY ON A TAB.
                The owner asked for the address in the right hand column,
                and a rep about to drive should not have to remember which
                tab it is on. It costs one line here because it is set on
                one line; the two line postal form, the copy control and
                the source it was read off are on the Place tab, where
                there is room for them to be facts rather than a header.
              */}
              <p
                className={styles.headAddress}
                data-head="address"
                title={p.address}
              >
                <span aria-hidden="true">◎</span>{" "}
                <span className="visually-hidden">Address: </span>
                {p.address}
              </p>
              <p className={styles.headMeta}>
                <span className={styles.headRole}>{p.decisionMakerTitle}</span>
                <span aria-hidden="true">.</span>{" "}
                <span className="num">{line.miles.toFixed(1)}</span> mi
                {tel ? (
                  <>
                    {". "}
                    <a className={`${styles.phone} num`} href={tel}>
                      {p.phone}
                    </a>
                  </>
                ) : null}
              </p>
            </div>
            <button
              type="button"
              className={styles.close}
              onClick={handleClose}
              aria-label="Close this organisation"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>

          <div className={styles.headChips}>
            <TokenChip token={orgType} size="sm" />
            <LaneChip lane={p.lane} size="sm" />
            <StatusChip status={status} size="sm" short />
            <span
              className={styles.clock}
              data-stale={stale.stale ? "true" : "false"}
              title={stale.note}
            >
              <span aria-hidden="true">{stale.stale ? "▲" : "◷"}</span>
              <span>{clockWord}</span>
              {stale.stale ? (
                <strong className={styles.clockFlag}>Stale</strong>
              ) : null}
            </span>
          </div>

          <div className={styles.headActions}>
            <button
              type="button"
              className={`${styles.headAction} ${styles.headWrite}`}
              data-compose="write"
              aria-label={`Write to ${p.name}`}
              title={
                verified
                  ? "Opens on a template chosen for this lane and this buying window."
                  : "They publish no address, so the draft is a reception script. The script is still the useful thing."
              }
              onClick={() => onCompose(p, "outreach")}
            >
              <span aria-hidden="true">▭</span>
              <span>{verified ? "Write to them" : "Draft the approach"}</span>
            </button>
            <button
              type="button"
              className={`${styles.headAction} ${styles.headQuote}`}
              aria-label={`Preview the group quote for ${p.name}`}
              title="Their side of it, over the board. No internal chrome, no score, no pipeline."
              onClick={() =>
                openQuotePreview(p.id, {
                  packageId: p.leadPackageId,
                  guests: midpoint,
                })
              }
            >
              <span aria-hidden="true">▣</span>
              <span>Group quote</span>
            </button>
          </div>

          {outOfFilter ? (
            <p className={styles.outOfFilter}>
              <span aria-hidden="true">◔</span> Not in the current filter.
              {onClearFilters ? (
                <>
                  {" "}
                  <Button size="sm" variant="ghost" onClick={onClearFilters}>
                    Clear the filters
                  </Button>
                </>
              ) : null}
            </p>
          ) : null}
        </header>

        <div className={styles.scroller} ref={scrollRef}>
          <TabBar
            tabs={tabs}
            value={active}
            onSelect={selectTab}
            label={`Everything known about ${p.name}`}
          />

          {/* -------------------------------------------------------
              PLACE. Who and where they are, and every way to reach
              them. This is the tab that is open when somebody presses a
              pin, so it answers the questions asked in that order: what
              is this place, where is it, who picks up, and how do I know
              any of this is true.

              IT IS A REFERENCE TAB AND NOT A FORM. The marker popup was
              cut from 584 pixels to 238 by deleting uppercase labels
              that repeated their own contents, and rebuilding that
              mistake at full size here would be the worse half of the
              trade. The labels that survive are the ones a value cannot
              say on its own: a range of guests is not self-evidently a
              headcount and a string of characters is not self-evidently
              a place id, while an address set on two lines and a phone
              number in mono are recognisable without being announced.
              ------------------------------------------------------- */}
          <Panel id="place" active={active === "place"}>
            {/*
              An `address` element, set the way an envelope is set. The
              alternative, a field labelled ADDRESS with the string beside
              it, tells a reader what they are looking at in a way the
              shape of the thing already does.
            */}
            <div className={styles.placeTop}>
              <address className={styles.address}>
                <span className={styles.addressStreet}>{street}</span>
                {/* The badge rides on the second line of the address
                    rather than off to one side, so it can never be read
                    as a mark on the control beside it. */}
                <span className={styles.addressLocality}>
                  {locality ? `${locality} ` : null}
                  <ProvenanceBadge
                    provenance={p.provenance.address ?? "public"}
                    compact
                  />
                </span>
              </address>
            </div>
            {/*
              THE TWO THINGS DONE WITH AN ADDRESS, SIDE BY SIDE. He is
              planning go-see runs, so an address is either being
              navigated to now or pasted into a route being built
              somewhere else. Both are full height targets on their own
              row rather than a pair of links inside the address, because
              an address is a thing to read and these are things to press.
            */}
            <div className={styles.placeActions}>
              <a
                className={styles.placeAction}
                data-place-action="maps"
                href={mapsHref(p)}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`Open the address of ${p.name} in a maps application`}
              >
                <span aria-hidden="true">◎</span>
                <span>Open in maps</span>
              </a>
              <button
                type="button"
                className={styles.placeAction}
                data-copy="address"
                onClick={copyAddress}
                aria-label={`Copy the address of ${p.name}`}
              >
                <span aria-hidden="true">▤</span>
                <span>Copy address</span>
              </button>
            </div>
            <p className={styles.copied} role="status" aria-live="polite">
              {copied}
            </p>

            <dl className={styles.grid}>
              <Cell label="From the venue">
                <Figure
                  value={`${line.miles.toFixed(1)} mi`}
                  provenance="modeled"
                  compact
                />
                <span className={styles.cellHint}>
                  Straight line from {VENUE.address}, not drive time.
                </span>
              </Cell>
              <Cell label="Organisation">
                <TokenChip token={orgType} size="sm" />
                <span className={styles.cellHint}>
                  {record.orgTypeBasis || orgType.note}
                </span>
              </Cell>
            </dl>

            {/* ---- Reaching them ---- */}
            <h3 className={styles.blockTitle}>Reaching them</h3>

            {tel ? (
              <a className={styles.call} href={tel}>
                <span aria-hidden="true">◔</span>
                <span className={`${styles.callNumber} num`}>{p.phone}</span>
                <ProvenanceBadge provenance="public" compact />
              </a>
            ) : (
              <p className={styles.callAbsent}>
                <Absent>No phone published. The door is the route.</Absent>
              </p>
            )}

            {/*
              THE WRITTEN DOOR IS A ROUTE, SO IT IS BUILT LIKE ONE.

              It sits directly under the phone and in the same shape,
              because these are the two ways into an organisation and a
              reader is choosing between them rather than reading a
              field. The phone keeps the amber edge: it is published on
              two hundred and three of the two hundred and eleven, which
              is more than any written door, and it is the route he asked
              for by name.

              THREE STATES AND ALL THREE ARE SAID OUT LOUD. Ninety three
              publish an address, fifty publish only a form, and sixty
              eight publish neither. The published address is the largest
              of the three and it is still short of half the board: a
              hundred and eighteen organisations have no address to write
              to at all. So neither the form branch nor the empty branch
              is an edge case to be guarded against. Between them they
              are the majority of the board, and each one says what it is
              with the reason attached rather than rendering as a blank.
            */}
            {verified && p.email ? (
              <a
                className={`${styles.call} ${styles.door}`}
                data-door="mailto"
                href={`mailto:${p.email}`}
              >
                <span aria-hidden="true">◆</span>
                <span className={`${styles.doorValue} num`}>{p.email}</span>
                <ProvenanceBadge
                  provenance={p.provenance.email ?? "public"}
                  compact
                />
              </a>
            ) : p.contactFormUrl ? (
              <a
                className={`${styles.call} ${styles.door}`}
                data-door="form"
                href={p.contactFormUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                <span aria-hidden="true">◇</span>
                <span className={`${styles.doorValue} num`}>
                  {hostOf(p.contactFormUrl)}
                  <span className={styles.sourcePath}>
                    {pathOf(p.contactFormUrl)}
                  </span>
                </span>
              </a>
            ) : (
              <p className={styles.callAbsent} data-door="none">
                {/* The fact only. The confidence note directly below
                    already carries what follows from it, and saying it
                    twice in four lines is the register this pass exists
                    to keep out. */}
                <Absent what="written-door">
                  No published address and no contact form
                </Absent>
              </p>
            )}
            <p className={styles.doorNote}>
              <EmailConfidenceChip confidence={p.emailConfidence} size="sm" />{" "}
              {door.note}
            </p>

            <dl className={styles.facts}>
              {/*
                THE SINGLE MOST CHECKABLE FACT IN THE APPLICATION, AND IT
                GETS ITS OWN ROW. Every email in this data set was read
                off the organisation's own page and carries the URL it
                was read from, so a reader who doubts one address can open
                the page and see it. Nothing was pattern-guessed from a
                domain name. That claim is worth nothing without the link
                beside it, which is why the link is a row of its own here
                rather than a footnote on the row above.
              */}
              {p.emailSourceUrl ? (
                <Fact label="Read off">
                  <a
                    className={styles.sourceLink}
                    data-source="email"
                    href={p.emailSourceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {hostOf(p.emailSourceUrl)}
                    <span className={styles.sourcePath}>
                      {pathOf(p.emailSourceUrl)}
                    </span>
                  </a>
                  <span className={styles.hint}>
                    Open that page and the address is on it.
                  </span>
                </Fact>
              ) : null}

              <Fact label="Website">
                {p.website ? (
                  <a
                    className={styles.sourceLink}
                    href={p.website}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {hostOf(p.website)}
                  </a>
                ) : (
                  <Absent>None published</Absent>
                )}
              </Fact>
            </dl>

            {/* ---- Who decides, and what they buy ---- */}
            <h3 className={styles.blockTitle}>Who decides</h3>
            <dl className={styles.facts}>
              <Fact label="Signs off">
                <strong>{p.decisionMakerTitle}</strong>
                <span className={styles.hint}>
                  A role, never a name. The role survives the person
                  leaving, and there is not one invented human name in
                  this application.
                </span>
              </Fact>
              <Fact label="Lane">
                <LaneChip lane={p.lane} size="sm" />
                <span className={styles.hint}>
                  The way in is the {lane.doorNoun}.
                </span>
              </Fact>
              <Fact label="Guests">
                <Figure
                  value={`${p.headcountLow} to ${p.headcountHigh}`}
                  provenance={p.provenance.headcount ?? "modeled"}
                  compact
                />
                <span className={styles.hint}>{p.headcountBasis}</span>
              </Fact>
              <Fact label="Buying window">
                <strong>{p.buyingWindow}</strong>
                <ProvenanceBadge
                  provenance={p.provenance.buyingWindow ?? "modeled"}
                  compact
                />
              </Fact>
              <Fact label="Why them">
                {p.whyTheyFit}
                <ProvenanceBadge
                  provenance={p.provenance.whyTheyFit ?? "modeled"}
                  compact
                />
              </Fact>
            </dl>

            {/* ---- Checkable at source ---- */}
            <h3 className={styles.blockTitle}>Checkable at source</h3>
            <dl className={styles.grid}>
              <Cell label="Google rating">
                {p.rating === undefined ? (
                  <Absent>Not published</Absent>
                ) : (
                  <>
                    <span className="num">{p.rating.toFixed(1)}</span>
                    <ProvenanceBadge provenance="public" compact />
                    <span className={styles.cellHint}>
                      from <span className="num">{p.reviewCount ?? 0}</span>{" "}
                      {p.reviewCount === 1 ? "review" : "reviews"}. A traffic
                      proxy and nothing more.
                    </span>
                  </>
                )}
              </Cell>
              <Cell label="Read as of">
                <span className="num">{formatDay(RECORD_AS_OF)}</span>
                <span className={styles.cellHint}>
                  The clock every figure on this record is measured from.
                </span>
              </Cell>
            </dl>

            <dl className={styles.facts}>
              <Fact label="Place id">
                {p.placeId ? (
                  <>
                    <code className={styles.code}>{p.placeId}</code>
                    <span className={styles.hint}>
                      Carried so the address, the coordinates and the
                      rating can all be checked against one source.
                    </span>
                  </>
                ) : (
                  <>
                    <Absent>None, and that is a fact about this row</Absent>
                    <span className={styles.hint}>
                      A place id comes back from the Places API and from
                      nowhere else. The second research pass had no Places
                      call available, so its rows carry a Census
                      coordinate and no id rather than something shaped
                      like one.
                    </span>
                  </>
                )}
              </Fact>
              <Fact label="Position">
                {p.addressSource}
                <span className={styles.hint}>
                  Pin accuracy recorded as {p.locationAccuracy}.
                </span>
              </Fact>
            </dl>
          </Panel>

          {/* -------------------------------------------------------
              STATUS. Where it stands, how long it has stood there,
              and the controls that move it.
              ------------------------------------------------------- */}
          <Panel id="status" active={active === "status"}>
            <div className={styles.stageRow}>
              <StatusChip status={status} />
              <span className={styles.stageClock} data-stale={stale.stale ? "true" : "false"}>
                <span aria-hidden="true">{stale.stale ? "▲" : "◷"}</span>{" "}
                {clockWord}
              </span>
            </div>
            <p className={styles.note}>{stale.note}</p>

            {record.awaitingReply ? (
              <p className={styles.alert} data-alert="awaiting">
                <span aria-hidden="true">◀</span>{" "}
                <strong>They wrote last.</strong> Nothing has gone back
                {record.daysSinceInbound === null
                  ? "."
                  : ` in ${dayWord(record.daysSinceInbound)}.`}
              </p>
            ) : null}

            {record.requeue ? (
              <p className={styles.alert} data-alert="requeue">
                <TokenChip token={REQUEUE_META[record.requeue]} size="sm" />{" "}
                {REQUEUE_META[record.requeue].note}
              </p>
            ) : null}

            <h3 className={styles.blockTitle}>Next</h3>
            <p className={styles.nextLabel}>
              <span aria-hidden="true">◆</span> {record.nextAction.label}
            </p>
            <p className={styles.note}>{record.nextAction.why}</p>

            <div className={styles.controls}>
              <Button
                size="sm"
                glyph="◔"
                className={styles.control}
                onClick={recordTouch}
              >
                Record a touch
              </Button>
              <Button
                size="sm"
                variant="primary"
                glyph="◑"
                className={styles.control}
                disabled={advance === null}
                title={
                  advance === null
                    ? "The step from a held date to a booking is a signature and a deposit, so it happens on the Book page where the money lives."
                    : `Move to ${PITCH_STATUS[advance].label.toLowerCase()}`
                }
                onClick={advanceStatus}
              >
                {advance === null
                  ? "Advance on the Book"
                  : `Advance to ${PITCH_STATUS[advance].label.toLowerCase()}`}
              </Button>
              <Button
                size="sm"
                glyph="▣"
                className={styles.control}
                onClick={() => onCompose(p, "reserve-party")}
              >
                Hold a date
              </Button>
            </div>
            <p className={styles.worked} role="status" aria-live="polite">
              {worked}
            </p>

            <dl className={styles.facts}>
              <Fact label="Touches">
                <span className="num">{record.touches}</span>
                <ProvenanceBadge provenance="illustrative" compact />
              </Fact>
              <Fact label="Written">
                <span className="num">{record.outboundCount + sent.length}</span>
                <span className={styles.hint}>
                  {record.outboundCount} in the thread, {sent.length} in the
                  outbox this session.
                </span>
              </Fact>
              <Fact label="Last received">
                {record.lastInbound ? (
                  <>
                    <span className="num">
                      {formatDay(record.lastInbound.at)}
                    </span>
                    <span className={styles.hint}>
                      {record.lastInbound.counterpartyRole}
                    </span>
                  </>
                ) : (
                  "Nothing received"
                )}
              </Fact>
              <Fact label="Last sent">
                {record.lastOutbound ? (
                  <span className="num">
                    {formatDay(record.lastOutbound.at)}
                  </span>
                ) : (
                  "Nothing sent"
                )}
              </Fact>
              <Fact label="Buying window">
                <strong>{p.buyingWindow}</strong>
                <ProvenanceBadge
                  provenance={p.provenance.buyingWindow ?? "modeled"}
                  compact
                />
                <span className={styles.hint}>
                  {lane.occasionClass === "calendar-locked"
                    ? "Their event happens whether or not anybody calls it, so this window is worked backwards from a fixed date."
                    : "Somebody has to decide there will be an event at all, so the work is on the decision maker rather than on the date."}
                </span>
              </Fact>
              <Fact label="Written door">
                {verified ? (
                  <>
                    <span className={`${styles.email} num`}>{p.email}</span>
                    <ProvenanceBadge
                      provenance={p.provenance.email ?? "public"}
                      compact
                    />
                  </>
                ) : p.emailConfidence === "form_only" ? (
                  "Contact form only"
                ) : (
                  "None published. Phone or a visit."
                )}
                {sourceUrl ? (
                  <span className={styles.hint}>
                    Read off{" "}
                    <a
                      className={styles.sourceLink}
                      href={sourceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {hostOf(sourceUrl)}
                    </a>
                  </span>
                ) : null}
              </Fact>
            </dl>
          </Panel>

          {/* -------------------------------------------------------
              POTENTIAL. What it is worth pursuing, with every figure
              carrying where it came from.
              ------------------------------------------------------- */}
          <Panel id="potential" active={active === "potential"}>
            <div className={styles.stageRow}>
              <TokenChip token={intent} />
              <span className={styles.score}>
                Signal score <span className="num">{record.intent.score}</span>
              </span>
            </div>
            <p className={styles.note}>{record.intent.headline}</p>

            {record.intent.evidence.length === 0 ? (
              <p className={styles.emptyBlock}>
                <span aria-hidden="true">◻</span> No signal recorded.
              </p>
            ) : (
              <ul className={styles.evidence}>
                {record.intent.evidence.map((e, i) => (
                  <li
                    key={`${e.signal}-${e.messageId ?? i}`}
                    className={styles.evidenceRow}
                    data-sign={e.weight >= 0 ? "plus" : "minus"}
                  >
                    <span className={styles.evidenceLabel}>
                      <span aria-hidden="true">
                        {e.weight >= 0 ? "▲" : "▼"}
                      </span>{" "}
                      {e.label}
                    </span>
                    <span className={`${styles.evidenceWeight} num`}>
                      {e.weight >= 0 ? `+${e.weight}` : e.weight}
                    </span>
                    <span className={`${styles.evidenceWhen} num`}>
                      {formatDay(e.at)}
                    </span>
                    <span className={styles.evidenceQuote}>{e.quote}</span>
                  </li>
                ))}
              </ul>
            )}

            <h3 className={styles.blockTitle}>The size of it</h3>
            <dl className={styles.facts}>
              <Fact label="Guests">
                <Figure
                  value={`${p.headcountLow} to ${p.headcountHigh}`}
                  provenance={p.provenance.headcount ?? "modeled"}
                  compact
                />
                <span className={styles.hint}>{p.headcountBasis}</span>
              </Fact>
              <Fact label="Bowling lanes">
                <Figure
                  value={line.lanesAtMidpoint}
                  provenance="modeled"
                  compact
                />
                {/*
                  The hint used to close on a denominator, taken from a
                  lane count the forked operator published for its own
                  building. Round1 publishes no lane count for any
                  location, so the share cannot be stated and the withheld
                  sentence stands in its place rather than a softened
                  number.
                */}
                <span className={styles.hint}>
                  At the midpoint of{" "}
                  <span className="num">{midpoint}</span> this consumes{" "}
                  <span className="num">{line.lanesAtMidpoint}</span> lanes, at
                  this application's planning rate of one lane per{" "}
                  <span className="num">{GUESTS_PER_BOWLING_LANE}</span>{" "}
                  guests. What share of {VENUE.name} that is has no answer:{" "}
                  <WithheldFigure reason="Round1 publishes no lane count for any location, so there is no total to take a share of. The nearest store, Lakewood Center, publishes an amenity list and no lane count either." />
                </span>
              </Fact>
              <Fact label={record.bookLines.length > 0 ? "Signed" : "If it lands"}>
                {record.bookLines.length > 0 ? (
                  <>
                    <Figure
                      value={`$${bookedValue.toLocaleString("en-US")}`}
                      provenance="illustrative"
                      compact
                    />
                    <span className={styles.hint}>
                      {record.bookLines.length === 1
                        ? "One signed line"
                        : `${record.bookLines.length} signed lines`}{" "}
                      in the book. Booked revenue, never summed with
                      activity.
                    </span>
                  </>
                ) : (
                  <>
                    <Figure
                      value={
                        leadValue === null
                          ? null
                          : `$${leadValue.toLocaleString("en-US")}`
                      }
                      provenance={leadValue === null ? "withheld" : "modeled"}
                      withheldReason={`Round1 publishes no price for ${leadPackage ? leadPackage.name : "the lead package"}, or for any other party package. Its booking page says to contact the venue, which is the reason this role exists.`}
                      compact
                    />
                    {leadValue === null ? null : (
                      <span className={styles.hint}>
                        {leadPackage?.name} at its published{" "}
                        <span className="num">
                          ${leadPackage?.pricePerGuest?.toFixed(2)}
                        </span>{" "}
                        per guest, times a modelled midpoint of{" "}
                        <span className="num">{midpoint}</span> guests. Not a
                        forecast and not in any ledger.
                      </span>
                    )}
                  </>
                )}
              </Fact>
              <Fact label="Why them">
                {p.whyTheyFit}
                <ProvenanceBadge
                  provenance={p.provenance.whyTheyFit ?? "modeled"}
                  compact
                />
              </Fact>
            </dl>

            <h3 className={styles.blockTitle}>What to lead with</h3>
            <div
              className={styles.filterRow}
              role="group"
              aria-label="Which packages to show"
            >
              {(
                [
                  { id: "best", label: "Best fit", count: fit.length },
                  { id: "priced", label: "Priced", count: fitPriced.length },
                  { id: "all", label: "All published", count: PACKAGES.length },
                ] as { id: PackageFilter; label: string; count: number }[]
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={styles.filterBtn}
                  aria-pressed={packageFilter === f.id}
                  onClick={() => onPackageFilterChange(f.id)}
                >
                  <span aria-hidden="true">
                    {packageFilter === f.id ? "●" : "○"}
                  </span>{" "}
                  {f.label} <span className="num">{f.count}</span>
                </button>
              ))}
            </div>

            <ul className={styles.packList}>
              {shownPackages.map((k) => (
                <li
                  key={k.id}
                  className={styles.packRow}
                  data-lead={k.id === p.leadPackageId ? "true" : "false"}
                >
                  <div className={styles.packHead}>
                    <strong className={styles.packName}>{k.name}</strong>
                    <FamilyChip family={k.family} size="sm" />
                    {k.id === p.leadPackageId ? (
                      <span className={styles.leadFlag}>
                        <span aria-hidden="true">◆</span> Lead
                      </span>
                    ) : null}
                  </div>
                  <p className={styles.packMeta}>
                    <span className={styles.packMetaLabel}>Per guest</span>
                    <Figure
                      value={
                        k.pricePerGuest === null
                          ? null
                          : `$${k.pricePerGuest.toFixed(2)}`
                      }
                      provenance={
                        k.pricePerGuest === null
                          ? "withheld"
                          : k.provenance.pricePerGuest ?? "public"
                      }
                      compact
                    />
                    <span className={styles.packMetaLabel}>Guests</span>
                    {k.minGuests === null ? (
                      "No published minimum"
                    ) : (
                      <>
                        <span className="num">{k.minGuests}</span> minimum
                      </>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          </Panel>

          {/* -------------------------------------------------------
              LAST ACTIVITY. The thread, newest first, collapsed to two
              lines until asked, with what each message changed.
              ------------------------------------------------------- */}
          <Panel id="activity" active={active === "activity"}>
            <h3 className={styles.blockTitle} id="detail-activity-title">
              The thread
            </h3>
            {record.messageCount === 0 ? (
              <div className={styles.emptyBlock}>
                <p>Nothing recorded either way.</p>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onCompose(p, "outreach")}
                >
                  {verified ? "Write the first one" : "Draft the approach"}
                </Button>
              </div>
            ) : (
              <Timeline
                messages={record.thread}
                labelledBy="detail-activity-title"
              />
            )}

            {sent.length > 0 ? (
              <>
                <h3 className={styles.blockTitle}>Sent from this session</h3>
                <ul className={styles.sentList}>
                  {sent.map((m) => (
                    <li key={m.id} className={styles.sentRow}>
                      <span className={styles.sentKind}>
                        <span aria-hidden="true">{KIND_META[m.kind].glyph}</span>{" "}
                        {KIND_META[m.kind].label}
                      </span>
                      <span className={`${styles.sentDate} num`}>
                        {m.sentAt}
                      </span>
                      <span className={styles.sentSubject}>{m.subject}</span>
                      <span
                        className={styles.outcome}
                        style={{
                          ["--tone" as string]: OUTCOME_META[m.outcome].cssVar,
                        }}
                      >
                        <span aria-hidden="true">
                          {OUTCOME_META[m.outcome].glyph}
                        </span>{" "}
                        {OUTCOME_META[m.outcome].label}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </Panel>

          {/* -------------------------------------------------------
              OFFERS. What is on the table, to whom, and what it costs
              the venue. Never a discount: Round1 publishes no party
              package price to take a percentage off, and the leverage is
              the published contents and the published booking terms.
              ------------------------------------------------------- */}
          <Panel id="offers" active={active === "offers"}>
            <h3 className={styles.blockTitle}>Extended</h3>
            {record.offers.length === 0 ? (
              <p className={styles.emptyBlock} data-record-empty="offers">
                <span aria-hidden="true">◻</span> Nothing extended.
              </p>
            ) : (
              <ul className={styles.offerList}>
                {record.offers.map(({ extension, offer }) => (
                  <li
                    key={extension.id}
                    className={styles.offerRow}
                    data-offer={extension.id}
                    data-state={extension.state}
                  >
                    <div className={styles.offerHead}>
                      <strong className={styles.offerName}>{offer.name}</strong>
                      <TokenChip
                        token={OFFER_STATE_META[extension.state]}
                        size="sm"
                      />
                    </div>
                    <p className={styles.offerMeta}>
                      <span className={styles.packMetaLabel}>To</span>
                      {extension.toRole}
                      <span className={styles.packMetaLabel}>Extended</span>
                      <span className="num">
                        {formatDay(extension.extendedAt)}
                      </span>
                      {extension.expiresAt ? (
                        <>
                          <span className={styles.packMetaLabel}>Expires</span>
                          <span className="num">
                            {formatDay(extension.expiresAt)}
                          </span>
                        </>
                      ) : null}
                    </p>
                    <p className={styles.note}>{offer.what}</p>
                    <p className={styles.note}>{extension.stateNote}</p>
                    <p className={styles.offerCost}>
                      <span className={styles.packMetaLabel}>
                        Cost to the venue
                      </span>
                      {offer.costToVenue === 0 ? (
                        <span className={styles.offerFree}>
                          <span aria-hidden="true">○</span> No cash cost
                        </span>
                      ) : null}
                      {offer.costNote}
                      <ProvenanceBadge provenance={offer.provenance} compact />
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <h3 className={styles.blockTitle}>Eligible, not extended</h3>
            {eligibleOffers.length === 0 ? (
              <p className={styles.emptyBlock}>
                <span aria-hidden="true">◻</span> Every offer written for this
                lane is already out.
              </p>
            ) : (
              <ul className={styles.offerList}>
                {eligibleOffers.map((o) => (
                  <li key={o.id} className={styles.offerRow} data-eligible={o.id}>
                    <div className={styles.offerHead}>
                      <strong className={styles.offerName}>{o.name}</strong>
                      <ProvenanceBadge provenance={o.provenance} compact />
                    </div>
                    <p className={styles.note}>{o.what}</p>
                    <p className={styles.offerCost}>
                      <span className={styles.packMetaLabel}>
                        Cost to the venue
                      </span>
                      {o.costNote}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <div className={styles.controls}>
              <Button
                size="sm"
                variant="primary"
                glyph="▣"
                className={styles.control}
                onClick={() => onCompose(p, "featured-promo")}
              >
                Extend an offer
              </Button>
            </div>
            <p className={styles.note}>
              Priority and certainty, never money off a published price. Main
              Event publishes no corporate price to discount.
            </p>
          </Panel>
        </div>
      </aside>
    </>
  );
});
