import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useSearchParams } from "react-router-dom";
import { RECORD_AS_OF } from "@/domain/selectors/record";

/**
 * THE SCENARIO CLOCK.
 *
 * ── WHAT IT IS FOR ────────────────────────────────────────────────
 * Several screens in this application are a clock rather than a
 * history. The accounts board is the clearest case: nothing has been
 * delivered yet, the first event is on 20 November 2026, and the whole
 * point of the screen is what happens the morning after it. A reader
 * looking at that board on 23 September sees one state out of maybe ten
 * that the same code produces across a year.
 *
 * The obvious way to show the other nine is to seed nine sets of fake
 * records. That is the wrong way and it is wrong for a reason this
 * codebase already cares about: every one of those records would be a
 * booking nobody made, invented for a company that publishes almost
 * nothing about what a booking costs, and the credibility of every other
 * figure rests on there being none of those.
 *
 * ── WHY THIS COSTS ALMOST NOTHING ─────────────────────────────────
 * The selectors were already written to take the date as an argument.
 * `accountBoard(asOf)`, `dailyRings({ now })` and `prospectRecord(id,
 * { now })` all derive from a clock rather than reading one. So moving
 * the clock produces every one of those states out of the SAME two
 * signed contracts and the SAME two hundred and eleven rows. Nothing is
 * injected, nothing is invented, and a reader can check any state
 * against the seed by hand.
 *
 * ── THE HARD INVARIANT ────────────────────────────────────────────
 * THIS PROVIDER CHANGES THE CLOCK AND NOTHING ELSE. It never injects a
 * record, never fabricates a figure, never swaps a data module. If a
 * future scenario needs a fact that is not in the seed, that scenario
 * does not get built. The moment this becomes a fixture loader it stops
 * being a demonstration that the model is correct and becomes a
 * slideshow, and a slideshow proves nothing.
 *
 * ── IT LIVES IN THE URL ───────────────────────────────────────────
 * One search parameter, `as-of`. A scenario is therefore a link: it can
 * be sent, bookmarked, reloaded, and opened by the proof scripts, which
 * cannot press a control. Eleven files in this codebase already keep
 * state in the URL for exactly that reason.
 *
 * The parameter is absent by default, which means the frozen board date
 * and a screenshot that survives six months in an inbox.
 *
 * ── ONE SHAPE, AND IT IS A PLAIN DATE ─────────────────────────────
 * `RECORD_AS_OF` is a full timestamp, "2026-09-23T09:00:00-07:00",
 * because the requests queue measures against a working hours clock and
 * needs the offset. Most clock driven selectors want a plain
 * "YYYY-MM-DD" and do arithmetic on it directly, so handing them the
 * timestamp yields NaN, silently, in a figure rather than in a throw.
 *
 * The first screen built on this provider hit exactly that and worked
 * around it locally. One workaround is a fix; five would be a
 * convention, and the sixth person would not know about it. So the
 * provider narrows to a plain date once, here, and `useAsOf()` is
 * documented as returning one. Anything wanting the working hours
 * timestamp should keep importing `RECORD_AS_OF` directly and say why.
 */

/** The calendar day out of a date or a full timestamp. */
function dayOf(value: string): string {
  return value.slice(0, 10);
}

/**
 * The frozen board date, as a plain day.
 *
 * Declared above SCENARIOS because that array reads it. A const in a
 * module is not hoisted, and the version of this file that declared it
 * below the array compiled to a temporal dead zone error rather than to
 * anything subtle, which is the good outcome.
 */
export const BOARD_DAY = dayOf(RECORD_AS_OF);

/** A named point on the clock, and what a reader is meant to see there. */
export interface Scenario {
  id: string;
  /** ISO date the whole application reads as today. */
  asOf: string;
  /** Two or three words for the control. */
  label: string;
  /** One clause on what this date shows that the default does not. */
  because: string;
}

/**
 * The scenarios worth naming, in order along the clock.
 *
 * Each one is a date at which the SEEDED data crosses a threshold on its
 * own. None of them adds anything. The dates come from the two signed
 * contracts in `data/book.ts` and from the rebooking windows that
 * `selectors/accounts.ts` derives from the buying windows already on the
 * prospect rows, which is why this list is short: these are the only
 * moments that actually exist.
 */
export const SCENARIOS: Scenario[] = [
  {
    id: "today",
    asOf: BOARD_DAY,
    label: "Today",
    because: "The board as it stands, twelve weeks out and nothing delivered",
  },
  {
    id: "window-open",
    asOf: "2026-10-05",
    label: "First window opens",
    because:
      "The first December rebooking window opens, six days before the event that organisation has already signed",
  },
  {
    id: "window-closing",
    asOf: "2026-11-14",
    label: "First window closes",
    because: "The first rebooking decision reaches its last day",
  },
  {
    id: "first-delivered",
    asOf: "2026-11-21",
    label: "Day after the first",
    because:
      "The first event is delivered, so the debrief and the review ask fall due",
  },
  {
    id: "both-delivered",
    asOf: "2026-12-27",
    label: "After both",
    because: "Both contracts are behind the venue and both accounts are on the clock",
  },
  {
    id: "next-year",
    asOf: "2027-06-01",
    label: "Into next year",
    because: "Far enough out that a missed window has become a real reading",
  },
];

const SCENARIO_BY_DATE = new Map(SCENARIOS.map((s) => [s.asOf, s]));

interface ScenarioShell {
  /** The date every clock driven selector should be handed. */
  asOf: string;
  /** The named scenario, when the current date is one. */
  current: Scenario | null;
  /** Whether the reader has moved the clock off its default. */
  moved: boolean;
  /** Move the clock. Passing null returns it to the default. */
  setAsOf: (asOf: string | null) => void;
}

const ScenarioContext = createContext<ScenarioShell | null>(null);

/** Sound enough to be a date, rather than merely truthy. */
function readableDate(value: string | null): string | null {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = Date.parse(`${value}T12:00:00Z`);
  return Number.isFinite(parsed) ? value : null;
}

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useSearchParams();

  /* A malformed parameter falls back to the default rather than
     throwing. A hand edited URL is a thing that happens, and a work
     sample that white screens on one is worse than one that ignores
     it. */
  const asOf = readableDate(params.get("as-of")) ?? BOARD_DAY;

  const setAsOf = useCallback(
    (next: string | null) => {
      const clean = readableDate(next);
      setParams(
        (prev) => {
          const out = new URLSearchParams(prev);
          if (!clean || clean === BOARD_DAY) out.delete("as-of");
          else out.set("as-of", clean);
          return out;
        },
        /* Replace rather than push. Stepping along six scenarios should
           not put six entries between a reader and the screen they came
           from. */
        { replace: true },
      );
    },
    [setParams],
  );

  const value = useMemo<ScenarioShell>(
    () => ({
      asOf,
      current: SCENARIO_BY_DATE.get(asOf) ?? null,
      moved: asOf !== BOARD_DAY,
      setAsOf,
    }),
    [asOf, setAsOf],
  );

  return (
    <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>
  );
}

/**
 * The date this render should treat as today, as a plain "YYYY-MM-DD".
 *
 * Outside the provider it returns the frozen board date, so a component
 * rendered on the prospect facing quote page, which has no shell at all,
 * still gets a sound answer instead of throwing.
 */
export function useAsOf(): string {
  return useContext(ScenarioContext)?.asOf ?? BOARD_DAY;
}

/** The full shell, for the control itself. */
export function useScenario(): ScenarioShell {
  const shell = useContext(ScenarioContext);
  return (
    shell ?? {
      asOf: BOARD_DAY,
      current: SCENARIO_BY_DATE.get(BOARD_DAY) ?? null,
      moved: false,
      setAsOf: () => {},
    }
  );
}
