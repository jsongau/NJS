import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type FocusEvent,
  type MouseEvent,
} from "react";
import type { Lane, OrgType, PitchStatus, Prospect } from "@/domain/types";
import { LANE_META, LANE_ORDER } from "@/domain/lanes";
import { PITCH_STATUS, PITCH_STATUS_SHORT } from "@/domain/vocabulary";
import { ORG_TYPE_META, orgTypeOf } from "@/domain/selectors/record";
import { milesFromVenue } from "@/domain/selectors/desk";
import { PROSPECTS } from "@/data/prospects";
import { furthestStatus, usePipeline } from "@/state/PipelineProvider";
import { LaneGlyph } from "@/components/map/LaneGlyph";
import styles from "./ProspectSearch.module.css";

/**
 * TYPE A FEW LETTERS, GET THE ORGANISATION.
 *
 * ---------------------------------------------------------------
 * THE DEFECT THIS REPLACES
 * ---------------------------------------------------------------
 *
 * The box on the left of the board used to be a filter and nothing else.
 * Two letters went in, the board dropped from two hundred and eleven rows
 * to two, and neither of the survivors had those letters anywhere a reader
 * could see, because the predicate also searched the city and the job
 * title of the decision maker. A control that removes two hundred and nine
 * things without saying which rule it applied is not a search. It is a
 * trapdoor, and the reasonable response to it is to stop typing.
 *
 * So the box does the opposite thing now. It offers, and the reader
 * chooses. Every suggestion prints the field the letters were found in,
 * with the letters emphasised inside that field's own value, so a row
 * can never be mysterious. Choosing one SELECTS the organisation on the
 * board rather than filtering the board down to it, which is the whole
 * difference between a search box and a jump. The board still narrows
 * when somebody asks it to, but asking is now a named row in the list
 * with a count attached to it rather than a side effect of pressing a
 * letter.
 *
 * ---------------------------------------------------------------
 * WHAT IS SEARCHED, AND HOW IT IS RANKED
 * ---------------------------------------------------------------
 *
 * Six fields, because a person scouting a territory does not only
 * arrive with a name. They remember the street they parked on, the town,
 * the kind of place it was, or the role they spoke to.
 *
 *   name      the organisation
 *   city      the town it sits in
 *   lane      the prospecting lane, by its full label or its short one
 *   type      who owns the decision: school, independent, chain
 *   role      the decision maker's title, never a person
 *   address   the street line
 *
 * The ranking is one number per row, and it is a TIER rather than a
 * score, because a fuzzy relevance number is exactly the kind of thing
 * nobody can check. A hit at the start of the name beats a hit at the
 * start of a word inside the name, which beats a hit anywhere else in
 * the name, which beats the city, then the lane, the type, the role and
 * finally the street. Inside a tier the nearer organisation comes first,
 * because this is a driving territory and eleven miles is a different
 * afternoon from two. Distance is on every row, so the tie break is
 * visible rather than asserted.
 *
 * ---------------------------------------------------------------
 * THE SECOND GROUP EXISTS BECAUSE OF WHAT PEOPLE ACTUALLY TYPE
 * ---------------------------------------------------------------
 *
 * Somebody typing "school" almost never wants one school. They want the
 * lane. Offering nine schools and nothing else would be technically
 * correct and useless, so lanes whose name contains the letters come
 * back under their own heading with their count, and choosing one sets
 * the shared lane filter. Under the same heading sits the old behaviour,
 * named and counted: filter the board to everything matching these
 * letters. Its count is computed with the SAME predicate the board runs
 * rather than with the wider one above it, because a row promising
 * fourteen and delivering nine would be the original defect wearing a
 * better coat.
 *
 * ---------------------------------------------------------------
 * THE COMBOBOX PATTERN, WHICH IS EASY TO GET WRONG
 * ---------------------------------------------------------------
 *
 * `role="combobox"` on the input with `aria-expanded`, `aria-controls`
 * and `aria-activedescendant`; a listbox of options beneath it; arrows
 * move the active option and FOCUS NEVER LEAVES THE INPUT, which is the
 * part most implementations get wrong and the part that decides whether
 * the thing can be driven at all. Options carry no tab stop, and their
 * mousedown is cancelled so a click cannot steal focus either. Escape
 * closes, a second Escape empties the box. Tab closes and moves on
 * without selecting, because a person leaving a field has not chosen
 * anything. Nothing here traps focus.
 *
 * A `datalist` would have given most of this for nothing and was
 * rejected: it renders a bare string per row, so the lane mark, the
 * type, the distance, the status and the matched field would all have
 * had to go, and those five are the reason a reader can pick the right
 * one of four organisations with similar names.
 *
 * THE COUNT IS ANNOUNCED. A dropdown that silently changes length under
 * somebody's fingers is the same failure as a board that silently drops
 * to two rows, so the live region says how many there are and names the
 * top one.
 *
 * THE FILTERING IS DEBOUNCED AND THE LETTERS ARE NOT. The value on
 * screen is the state, updated on the keystroke; the suggestion list is
 * computed from a copy that settles a frame or two later. Two hundred and
 * eleven records is small enough that this is about steadiness rather than
 * speed: without it the list reorders under the reader between the
 * pressing of two keys.
 */

/** How long typing settles before the suggestions are rebuilt. */
const SUGGEST_DEBOUNCE_MS = 110;

/** Organisations offered at once. Enough to choose from, few enough to read. */
const MAX_ORGS = 7;

/** Lanes offered at once. */
const MAX_LANES = 3;

/** Below this the letters match half the board and the list is noise. */
const MIN_TERM = 2;

// ---------------------------------------------------------------
// Matching
// ---------------------------------------------------------------

export type MatchField = "name" | "city" | "lane" | "type" | "role" | "address";

/** The word printed on the row, so a match always states its own basis. */
const FIELD_LABEL: Record<MatchField, string> = {
  name: "Name",
  city: "City",
  lane: "Lane",
  type: "Type",
  role: "Decision maker",
  address: "Address",
};

/**
 * The tiers, written out rather than computed, because the ranking of a
 * search is a product decision and it should be readable as one.
 */
const TIER = {
  nameStart: 0,
  nameWord: 1,
  nameIn: 2,
  cityStart: 3,
  cityIn: 4,
  lane: 5,
  type: 6,
  role: 7,
  address: 8,
} as const;

interface FieldHit {
  field: MatchField;
  /** The whole value, so the row can print it with the letters marked. */
  value: string;
  /** Where the typed letters start inside it. */
  at: number;
  /** How many letters were found there. Carried so a row needs nothing else. */
  len: number;
  tier: number;
}

/** A word boundary a reader would recognise, including a hyphen or a slash. */
function startsWord(value: string, at: number): boolean {
  if (at === 0) return true;
  return /[\s(['"./,-]/.test(value.charAt(at - 1));
}

function indexOfTerm(value: string, term: string): number {
  return value.toLowerCase().indexOf(term);
}

/**
 * The best hit on one organisation, or null.
 *
 * Every field is tried and the strongest is kept, rather than stopping
 * at the first, so an organisation with the letters in both its name and
 * its city is ranked on the name and not on whichever line this function
 * happened to read first.
 */
function bestHit(p: Prospect, term: string): FieldHit | null {
  const hits: FieldHit[] = [];

  const nameAt = indexOfTerm(p.name, term);
  if (nameAt >= 0) {
    hits.push({
      field: "name",
      value: p.name,
      at: nameAt,
      len: term.length,
      tier:
        nameAt === 0
          ? TIER.nameStart
          : startsWord(p.name, nameAt)
            ? TIER.nameWord
            : TIER.nameIn,
    });
  }

  const cityAt = indexOfTerm(p.city, term);
  if (cityAt >= 0) {
    hits.push({
      field: "city",
      value: p.city,
      at: cityAt,
      len: term.length,
      tier: cityAt === 0 ? TIER.cityStart : TIER.cityIn,
    });
  }

  /* The lane is offered under both its names. A reader who types "youth"
     means the lane whose short form is "Youth sports", and its full
     label says "Fitness and youth sports". Either should land. */
  const laneMeta = LANE_META[p.lane];
  const laneLabelAt = indexOfTerm(laneMeta.label, term);
  const laneShortAt = indexOfTerm(laneMeta.short, term);
  if (laneLabelAt >= 0)
    hits.push({
      field: "lane",
      value: laneMeta.label,
      at: laneLabelAt,
      len: term.length,
      tier: TIER.lane,
    });
  else if (laneShortAt >= 0)
    hits.push({
      field: "lane",
      value: laneMeta.short,
      at: laneShortAt,
      len: term.length,
      tier: TIER.lane,
    });

  const typeLabel = ORG_TYPE_META[orgTypeOf(p)].label;
  const typeAt = indexOfTerm(typeLabel, term);
  if (typeAt >= 0)
    hits.push({
      field: "type",
      value: typeLabel,
      at: typeAt,
      len: term.length,
      tier: TIER.type,
    });

  const roleAt = indexOfTerm(p.decisionMakerTitle, term);
  if (roleAt >= 0)
    hits.push({
      field: "role",
      value: p.decisionMakerTitle,
      at: roleAt,
      len: term.length,
      tier: TIER.role,
    });

  const addressAt = indexOfTerm(p.address, term);
  if (addressAt >= 0)
    hits.push({
      field: "address",
      value: p.address,
      at: addressAt,
      len: term.length,
      tier: TIER.address,
    });

  if (hits.length === 0) return null;
  return hits.reduce((best, h) => (h.tier < best.tier ? h : best));
}

/**
 * The predicate the BOARD runs, repeated here on purpose.
 *
 * `deskLines` narrows on name, city and decision maker title. The
 * suggestion list above searches three more fields than that, which is
 * the right behaviour for a jump and the wrong number to print beside a
 * control that applies the board's filter. So the "filter the board" row
 * counts with this, and the count it shows is the count the reader will
 * get.
 */
function matchesBoardFilter(p: Prospect, term: string): boolean {
  return `${p.name} ${p.city} ${p.decisionMakerTitle}`
    .toLowerCase()
    .includes(term);
}

// ---------------------------------------------------------------
// The suggestions
// ---------------------------------------------------------------

interface OrgSuggestion {
  kind: "prospect";
  key: string;
  prospect: Prospect;
  hit: FieldHit;
  miles: number;
  status: PitchStatus;
  orgType: OrgType;
  /** False when the board's current filters have this row hidden. */
  onBoard: boolean;
}

interface LaneSuggestion {
  kind: "lane";
  key: string;
  lane: Lane;
  hit: FieldHit;
  count: number;
}

interface QuerySuggestion {
  kind: "query";
  key: string;
  term: string;
  count: number;
}

interface ClearSuggestion {
  kind: "clear";
  key: string;
  total: number;
}

type Suggestion =
  | OrgSuggestion
  | LaneSuggestion
  | QuerySuggestion
  | ClearSuggestion;

export interface ProspectSearchProps {
  /** The input's own id. The label points at it and so do the tests. */
  id: string;
  /** Everything searchable. Defaults to the whole trade area. */
  prospects?: Prospect[];
  /**
   * The organisations the board is currently drawing.
   *
   * A jump reaches every organisation, including one a lane chip has
   * hidden, because a reader who typed a name wants that name. The
   * rows it cannot currently see say so on their face rather than
   * selecting something that appears to do nothing.
   */
  onBoardIds?: Set<string>;
  /** Choosing an organisation. The board selects it; it does not filter to it. */
  onSelectProspect: (prospectId: string) => void;
  /** Choosing a lane. Sets the shared lane filter. */
  onSelectLane?: (lane: Lane) => void;
  /** Choosing to narrow the board to the typed letters after all. */
  onFilterByText?: (term: string) => void;
  /** The way back out of an empty result. */
  onClearAll?: () => void;
  label?: string;
  placeholder?: string;
  /** Total organisations, for the empty state's offer. */
  total?: number;
  /**
   * THE TEXT IS OWNED BY THE CALLER, and that is not ceremony.
   *
   * The letters in this box and the filter on the board are two views
   * of one thing. A reader who drops the search from the filter bar
   * above the list has to see the box empty as well, and a component
   * holding its own private copy of the string cannot be told that.
   * The debounce stays in here, where it belongs, because it is about
   * this list settling rather than about anything the caller owns.
   */
  value: string;
  onValueChange: (value: string) => void;
}

export function ProspectSearch({
  id,
  prospects = PROSPECTS,
  onBoardIds,
  onSelectProspect,
  onSelectLane,
  onFilterByText,
  onClearAll,
  label = "Find an organisation",
  placeholder = "Name, city, lane, type or role",
  total,
  value: text,
  onValueChange: setText,
}: ProspectSearchProps) {
  const pipeline = usePipeline();

  /** The settled copy the list is built from. See the debounce note. */
  const [settled, setSettled] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const listboxId = `${id}-listbox`;
  const optionId = (i: number) => `${id}-option-${i}`;

  /*
    The echo is the state itself, so the letters never lag. Only the
    rebuild waits.
  */
  useEffect(() => {
    if (text === settled) return;
    const timer = window.setTimeout(
      () => setSettled(text),
      SUGGEST_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [text, settled]);

  const term = settled.trim().toLowerCase();
  const enough = term.length >= MIN_TERM;

  const orgs = useMemo<OrgSuggestion[]>(() => {
    if (!enough) return [];
    const found: OrgSuggestion[] = [];
    for (const p of prospects) {
      const hit = bestHit(p, term);
      if (!hit) continue;
      found.push({
        kind: "prospect",
        key: `p:${p.id}`,
        prospect: p,
        hit,
        miles: milesFromVenue(p.lat, p.lng),
        status: furthestStatus(pipeline, p.id),
        orgType: orgTypeOf(p),
        onBoard: onBoardIds ? onBoardIds.has(p.id) : true,
      });
    }
    found.sort(
      (a, b) =>
        a.hit.tier - b.hit.tier ||
        a.miles - b.miles ||
        a.prospect.name.localeCompare(b.prospect.name),
    );
    return found;
  }, [prospects, term, enough, pipeline, onBoardIds]);

  const lanes = useMemo<LaneSuggestion[]>(() => {
    if (!enough || !onSelectLane) return [];
    const out: LaneSuggestion[] = [];
    for (const lane of LANE_ORDER) {
      const meta = LANE_META[lane];
      const at = indexOfTerm(meta.label, term);
      const shortAt = indexOfTerm(meta.short, term);
      if (at < 0 && shortAt < 0) continue;
      const count = prospects.filter((p) => p.lane === lane).length;
      if (count === 0) continue;
      out.push({
        kind: "lane",
        key: `l:${lane}`,
        lane,
        hit:
          at >= 0
            ? {
                field: "lane",
                value: meta.label,
                at,
                len: term.length,
                tier: TIER.lane,
              }
            : {
                field: "lane",
                value: meta.short,
                at: shortAt,
                len: term.length,
                tier: TIER.lane,
              },
        count,
      });
    }
    return out.slice(0, MAX_LANES);
  }, [prospects, term, enough, onSelectLane]);

  const boardCount = useMemo(
    () =>
      enough
        ? prospects.filter((p) => matchesBoardFilter(p, term)).length
        : 0,
    [prospects, term, enough],
  );

  const visibleOrgs = orgs.slice(0, MAX_ORGS);

  const narrow = useMemo<Suggestion[]>(() => {
    const out: Suggestion[] = [...lanes];
    if (onFilterByText && boardCount > 0)
      out.push({
        kind: "query",
        key: "q",
        term: settled.trim(),
        count: boardCount,
      });
    return out;
  }, [lanes, onFilterByText, boardCount, settled]);

  const empty = enough && orgs.length === 0 && narrow.length === 0;

  /*
    THE FLAT LIST IS THE KEYBOARD'S VIEW OF THE GROUPS.

    Arrow keys run down every option regardless of which heading it sits
    under, because a reader pressing Down twice does not think in groups
    and should not have to. The headings are for the eye and for a
    screen reader's group announcement; they are not stops.
  */
  const options = useMemo<Suggestion[]>(() => {
    if (empty)
      return [{ kind: "clear", key: "clear", total: total ?? prospects.length }];
    return [...visibleOrgs, ...narrow];
  }, [empty, visibleOrgs, narrow, total, prospects.length]);

  /* A rebuilt list always offers its best row first, so Enter is a
     decision and not a gamble. */
  useEffect(() => {
    setActiveIndex(0);
  }, [settled]);

  const canOpen = text.trim().length >= MIN_TERM;
  const expanded = open && canOpen;

  /* Keeps the active row inside the scroll region without touching focus. */
  useEffect(() => {
    if (!expanded) return;
    const node = listRef.current?.querySelector<HTMLElement>(
      "[data-active='true']",
    );
    node?.scrollIntoView({ block: "nearest" });
  }, [expanded, activeIndex, options]);

  const close = useCallback(() => setOpen(false), []);

  const clearBox = useCallback(() => {
    setText("");
    setSettled("");
    setOpen(false);
    onClearAll?.();
    inputRef.current?.focus();
  }, [onClearAll]);

  const choose = useCallback(
    (s: Suggestion) => {
      switch (s.kind) {
        case "prospect":
          /*
            THE BOX EMPTIES ITSELF ON A JUMP, and that is the point of
            the whole component. The reader asked for one organisation,
            not for a board with two hundred and nine rows removed from it,
            so the selection lands and the board stays whole around it.
          */
          setText("");
          setSettled("");
          setOpen(false);
          onSelectProspect(s.prospect.id);
          break;
        case "lane":
          setText("");
          setSettled("");
          setOpen(false);
          onSelectLane?.(s.lane);
          break;
        case "query":
          /* The letters stay in the box here, because they are now the
             filter and a box that emptied itself would leave the reader
             looking at a narrowed board with nothing naming why. */
          setOpen(false);
          onFilterByText?.(s.term);
          break;
        case "clear":
          clearBox();
          break;
      }
      inputRef.current?.focus();
    },
    [onSelectProspect, onSelectLane, onFilterByText, clearBox],
  );

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!expanded) {
          if (canOpen) setOpen(true);
          return;
        }
        if (options.length > 0)
          setActiveIndex((i) => (i + 1) % options.length);
        return;

      case "ArrowUp":
        event.preventDefault();
        if (!expanded) {
          if (canOpen) setOpen(true);
          return;
        }
        if (options.length > 0)
          setActiveIndex((i) => (i - 1 + options.length) % options.length);
        return;

      case "Enter": {
        if (!expanded) return;
        const picked = options[activeIndex];
        if (!picked) return;
        event.preventDefault();
        choose(picked);
        return;
      }

      case "Escape":
        /*
          Two presses, two meanings, and the order matters. The first
          takes the list off the screen and leaves the letters alone, so
          somebody who opened it by accident does not lose what they
          typed. The second empties the box, which is the only way out
          of a search from the keyboard that does not involve hunting
          for a cross with the mouse.
        */
        event.preventDefault();
        if (expanded) {
          close();
          return;
        }
        if (text !== "") clearBox();
        return;

      case "Tab":
        /* No preventDefault. Leaving a field is not choosing a row. */
        close();
        return;

      default:
        return;
    }
  }

  function onBlur(event: FocusEvent<HTMLDivElement>) {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    close();
  }

  /* Cancelling mousedown is what keeps focus in the input through a
     click, which is what keeps `aria-activedescendant` meaningful. */
  function holdFocus(event: MouseEvent) {
    event.preventDefault();
  }

  const announcement = !enough
    ? ""
    : empty
      ? `No matches for ${settled.trim()}. One suggestion offers to clear the search.`
      : `${options.length} ${options.length === 1 ? "suggestion" : "suggestions"} for ${settled.trim()}.` +
        (visibleOrgs.length > 0
          ? ` Top match, ${visibleOrgs[0].prospect.name}.`
          : "");

  let index = -1;

  return (
    <div className={styles.wrap} onBlur={onBlur}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>

      <div className={styles.field}>
        <span className={styles.fieldGlyph} aria-hidden="true">
          ⌕
        </span>
        <input
          ref={inputRef}
          id={id}
          className={styles.input}
          type="text"
          role="combobox"
          aria-expanded={expanded}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            expanded && options[activeIndex] ? optionId(activeIndex) : undefined
          }
          aria-describedby={`${id}-hint`}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          placeholder={placeholder}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(e.target.value.trim().length >= MIN_TERM);
          }}
          onKeyDown={onKeyDown}
          onFocus={() => {
            if (canOpen) setOpen(true);
          }}
        />
        {text !== "" ? (
          <button
            type="button"
            className={styles.clear}
            onClick={clearBox}
            aria-label="Clear the search box"
            title="Clear the search box"
          >
            <span aria-hidden="true">✕</span>
          </button>
        ) : null}
      </div>

      <p id={`${id}-hint`} className="visually-hidden">
        Suggestions appear below as you type. Use the up and down arrow keys
        to move through them and Enter to select one.
      </p>

      <div className={styles.popup} hidden={!expanded}>
        {empty ? (
          <p className={styles.emptyLead}>
            Nothing matches <strong>{settled.trim()}</strong> in a name, city,
            lane, type, decision maker or street.
          </p>
        ) : null}

        <div
          ref={listRef}
          id={listboxId}
          role="listbox"
          className={styles.listbox}
          aria-label="Search suggestions"
        >
          {visibleOrgs.length > 0 ? (
            <div role="group" aria-label="Organisations">
              <p className={styles.groupHead} aria-hidden="true">
                Organisations
                {/* "7 of 80" rather than "80", because a heading that
                    counts the matches while the list shows seven of them
                    is a heading a reader has to reconcile. */}
                <span className={`${styles.groupCount} num`}>
                  {orgs.length > visibleOrgs.length
                    ? `${visibleOrgs.length} of ${orgs.length}`
                    : orgs.length}
                </span>
              </p>
              {visibleOrgs.map((s) => {
                index += 1;
                return (
                  <OrgRow
                    key={s.key}
                    id={optionId(index)}
                    suggestion={s}
                    active={index === activeIndex}
                    onHold={holdFocus}
                    onPick={() => choose(s)}
                  />
                );
              })}
              {orgs.length > visibleOrgs.length ? (
                <p className={styles.more} aria-hidden="true">
                  <span className="num">
                    {orgs.length - visibleOrgs.length}
                  </span>{" "}
                  more match. Type another letter, or narrow the board below.
                </p>
              ) : null}
            </div>
          ) : null}

          {narrow.length > 0 ? (
            <div role="group" aria-label="Filter by this instead">
              <p className={styles.groupHead} aria-hidden="true">
                Filter by this instead
              </p>
              {narrow.map((s) => {
                index += 1;
                if (s.kind === "lane")
                  return (
                    <LaneRow
                      key={s.key}
                      id={optionId(index)}
                      suggestion={s}
                      active={index === activeIndex}
                      onHold={holdFocus}
                      onPick={() => choose(s)}
                    />
                  );
                if (s.kind === "query")
                  return (
                    <QueryRow
                      key={s.key}
                      id={optionId(index)}
                      suggestion={s}
                      active={index === activeIndex}
                      onHold={holdFocus}
                      onPick={() => choose(s)}
                    />
                  );
                return null;
              })}
            </div>
          ) : null}

          {empty
            ? options.map((s) => {
                index += 1;
                if (s.kind !== "clear") return null;
                return (
                  <div
                    key={s.key}
                    id={optionId(index)}
                    role="option"
                    className={`${styles.option} ${styles.clearOption}`}
                    aria-selected={index === activeIndex}
                    data-active={index === activeIndex}
                    data-testid="search-clear-option"
                    onMouseDown={holdFocus}
                    onClick={() => choose(s)}
                  >
                    <span className={styles.clearGlyph} aria-hidden="true">
                      ✕
                    </span>
                    <span className={styles.clearText}>
                      Clear the search and show all{" "}
                      <span className="num">{s.total}</span> organisations
                    </span>
                  </div>
                );
              })
            : null}
        </div>
      </div>

      <p className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------
// The rows
// ---------------------------------------------------------------

/**
 * The typed letters, emphasised where they were found.
 *
 * `<mark>` rather than a span, because the meaning is exactly what the
 * element is for and it survives a stylesheet failing to load.
 */
function Marked({ value, at, len }: { value: string; at: number; len: number }) {
  if (at < 0) return <>{value}</>;
  return (
    <>
      {value.slice(0, at)}
      <mark className={styles.mark}>{value.slice(at, at + len)}</mark>
      {value.slice(at + len)}
    </>
  );
}

function miles(n: number): string {
  return n < 10 ? n.toFixed(1) : Math.round(n).toString();
}

function OrgRow({
  id,
  suggestion,
  active,
  onHold,
  onPick,
}: {
  id: string;
  suggestion: OrgSuggestion;
  active: boolean;
  onHold: (e: MouseEvent) => void;
  onPick: () => void;
}) {
  const { prospect, hit, status, orgType, onBoard } = suggestion;
  const type = ORG_TYPE_META[orgType];
  const statusToken = PITCH_STATUS_SHORT[status];
  const laneMeta = LANE_META[prospect.lane];

  /*
    ONE SENTENCE FOR THE WHOLE ROW. A screen reader reading the parts
    would say a lane, a name, a glyph, a word, a number and a fragment of
    a street, in the order the grid happens to place them. The row is
    named as a whole instead, in the order a person would say it, and
    every visual inside it is hidden from the tree.
  */
  const name =
    `${prospect.name}. ${laneMeta.label}. ${type.label}. ` +
    `${miles(suggestion.miles)} miles. ${PITCH_STATUS[status].label}. ` +
    `Matched on ${FIELD_LABEL[hit.field].toLowerCase()}, ${hit.value}.` +
    (onBoard ? "" : " Currently hidden by the board filter.");

  return (
    <div
      id={id}
      role="option"
      className={styles.option}
      aria-selected={active}
      aria-label={name}
      data-active={active}
      data-prospect-id={prospect.id}
      onMouseDown={onHold}
      onClick={onPick}
    >
      <span className={styles.lane} aria-hidden="true">
        <LaneGlyph lane={prospect.lane} size={22} decorative />
      </span>

      <span className={styles.body} aria-hidden="true">
        <span className={styles.name}>
          {hit.field === "name" ? (
            <Marked value={prospect.name} at={hit.at} len={hit.len} />
          ) : (
            prospect.name
          )}
        </span>

        <span className={styles.meta}>
          <span className={styles.type} style={{ color: type.cssVar }}>
            <span className={styles.metaGlyph}>{type.glyph}</span>
            {type.label}
          </span>

          <span
            className={styles.status}
            style={{ color: statusToken.cssVar }}
          >
            <span className={styles.metaGlyph}>{statusToken.glyph}</span>
            {statusToken.label}
          </span>

          <span className={styles.matched} data-field={hit.field}>
            {FIELD_LABEL[hit.field]}
            {hit.field === "name" ? null : (
              <>
                {": "}
                <Marked value={hit.value} at={hit.at} len={hit.len} />
              </>
            )}
          </span>

          {onBoard ? null : (
            <span className={styles.hidden}>Hidden by the filter</span>
          )}
        </span>
      </span>

      <span className={styles.distance} aria-hidden="true">
        <span className="num">{miles(suggestion.miles)}</span>
        <span className={styles.unit}>mi</span>
      </span>
    </div>
  );
}

function LaneRow({
  id,
  suggestion,
  active,
  onHold,
  onPick,
}: {
  id: string;
  suggestion: LaneSuggestion;
  active: boolean;
  onHold: (e: MouseEvent) => void;
  onPick: () => void;
}) {
  const meta = LANE_META[suggestion.lane];
  return (
    <div
      id={id}
      role="option"
      className={`${styles.option} ${styles.filterOption}`}
      aria-selected={active}
      aria-label={`Filter the board to the ${meta.label} lane. ${suggestion.count} organisations.`}
      data-active={active}
      data-lane={suggestion.lane}
      onMouseDown={onHold}
      onClick={onPick}
    >
      <span className={styles.lane} aria-hidden="true">
        <LaneGlyph lane={suggestion.lane} size={22} decorative />
      </span>
      <span className={styles.body} aria-hidden="true">
        <span className={styles.name}>
          <Marked
            value={suggestion.hit.value}
            at={suggestion.hit.at}
            len={suggestion.hit.len}
          />
        </span>
        <span className={styles.meta}>
          <span className={styles.matched}>Lane</span>
          <span className={styles.action}>Narrows the whole board</span>
        </span>
      </span>
      <span className={styles.distance} aria-hidden="true">
        <span className="num">{suggestion.count}</span>
      </span>
    </div>
  );
}

function QueryRow({
  id,
  suggestion,
  active,
  onHold,
  onPick,
}: {
  id: string;
  suggestion: QuerySuggestion;
  active: boolean;
  onHold: (e: MouseEvent) => void;
  onPick: () => void;
}) {
  return (
    <div
      id={id}
      role="option"
      className={`${styles.option} ${styles.filterOption}`}
      aria-selected={active}
      aria-label={`Filter the board to organisations matching ${suggestion.term} by name, city or decision maker. ${suggestion.count} organisations.`}
      data-active={active}
      data-testid="search-query-option"
      onMouseDown={onHold}
      onClick={onPick}
    >
      <span className={styles.lane} aria-hidden="true">
        <span className={styles.filterGlyph}>≡</span>
      </span>
      <span className={styles.body} aria-hidden="true">
        <span className={styles.name}>Keep only matches of {suggestion.term}</span>
        <span className={styles.meta}>
          <span className={styles.matched}>Name, city or decision maker</span>
          <span className={styles.action}>Narrows the whole board</span>
        </span>
      </span>
      <span className={styles.distance} aria-hidden="true">
        <span className="num">{suggestion.count}</span>
      </span>
    </div>
  );
}
