import {
  createContext,
  useContext,
  useMemo,
  type Dispatch,
  type ReactNode,
} from "react";
import type {
  ActivityLine,
  ActivityType,
  BookLine,
  Lane,
  Provenance,
  Reply,
  ReplyDisposition,
} from "@/domain/types";
import { SEED_BOOK, SEED_ACTIVITY, SEED_REPLIES } from "@/data/book";
import { LANE_META, LANE_ORDER } from "@/domain/lanes";
import { ACTIVITY_TYPE, REPLY_DISPOSITION } from "@/domain/vocabulary";
import { PACKAGE_BY_ID } from "@/data/packages";
import { OBJECTION_BY_ID } from "@/data/objections";
import { PROSPECT_BY_ID } from "@/data/prospects";
import { SEAT_BY_ID } from "@/data/seats";
import {
  arr,
  diffRows,
  enumKey,
  enumKeys,
  highestIdSuffix,
  isRecord,
  mergeRows,
  num,
  optionalStr,
  signatureOf,
  str,
  usePersistedReducer,
  type RowDelta,
  type SliceCodec,
} from "./persist";

/**
 * THE TWO LEDGERS.
 *
 * `book` is signed contracts with deposits against them. It carries
 * money.
 *
 * `activity` is tabling shifts, go-sees, networking events and call
 * blocks. It carries hours, and it carries NO money. There is no
 * revenue field on ActivityLine and that is the entire point.
 *
 * Early in a territory, activity is the only thing there is to report,
 * which is exactly when the temptation to report it AS progress is
 * strongest. Every weekly division update in the world says "we made
 * 400 calls" because 400 is a bigger number than 3. So the two live in
 * separate arrays, with separate types, separate totals functions and
 * separate colours, and no function that takes one can be handed the
 * other. A general "PlanLine" with an optional revenue field would have
 * been less code and would have quietly permitted the one lie this tool
 * exists to prevent.
 *
 * The relationship between them is a RATIO, not a sum, and the Book page
 * shows it as one: hours out of the office per thousand dollars
 * signed. That number gets better as the pipeline matures and it is the
 * honest way to make activity legible.
 */

export interface BookState {
  book: BookLine[];
  activity: ActivityLine[];
  replies: Reply[];
  /** Set once a quote has been sent for a prospect. Feeds the outbox. */
  quotedProspectIds: string[];
}

export type BookAction =
  | {
      type: "ADD_BOOKING";
      line: Omit<BookLine, "id" | "ledger" | "sortOrder">;
    }
  | { type: "REMOVE_BOOKING"; id: string }
  | { type: "SET_GUESTS"; id: string; guests: number }
  | {
      type: "SET_PRICE";
      id: string;
      pricePerGuest: number;
      provenance: Provenance;
    }
  | {
      type: "ADD_ACTIVITY";
      line: Omit<ActivityLine, "id" | "ledger" | "sortOrder">;
    }
  | { type: "REMOVE_ACTIVITY"; id: string }
  | { type: "COMPLETE_ACTIVITY"; id: string; at: string }
  | { type: "ADD_REPLY"; reply: Omit<Reply, "id"> }
  | { type: "MARK_QUOTED"; prospectId: string }
  | { type: "RESET" };

const initial: BookState = {
  book: SEED_BOOK,
  activity: SEED_ACTIVITY,
  replies: SEED_REPLIES,
  quotedProspectIds: [],
};

let seq = 0;
const nextId = (prefix: string) => `${prefix}-${++seq}`;

function reducer(state: BookState, action: BookAction): BookState {
  switch (action.type) {
    case "ADD_BOOKING": {
      /**
       * A revised booking for the same prospect and package SUPERSEDES
       * the first rather than stacking a second beside it.
       *
       * Somebody who re-sends a corrected proposal has not sold the
       * account twice. Getting this wrong is how a pipeline report ends
       * up double counting the only three signed lines it has, which is
       * a very visible way to be wrong in front of a general manager.
       */
      const superseded = state.book.filter(
        (l) =>
          !(
            l.prospectId === action.line.prospectId &&
            l.packageId === action.line.packageId
          ),
      );
      return {
        ...state,
        book: [
          ...superseded,
          {
            ...action.line,
            id: nextId("book"),
            ledger: "booked-revenue",
            sortOrder: superseded.length,
          },
        ],
      };
    }

    case "REMOVE_BOOKING":
      return { ...state, book: state.book.filter((l) => l.id !== action.id) };

    case "SET_GUESTS":
      return {
        ...state,
        book: state.book.map((l) =>
          l.id === action.id
            ? {
                ...l,
                guests: Math.max(1, action.guests),
                /* Crew slots are derived from the door count, never
                   typed. A line whose door count changes and whose crew
                   slot count does not is a capacity chart that lies. */
                lanesHeld: Math.ceil(Math.max(1, action.guests) / 20),
              }
            : l,
        ),
      };

    case "SET_PRICE":
      return {
        ...state,
        book: state.book.map((l) =>
          l.id === action.id
            ? {
                ...l,
                pricePerGuest: Math.max(0, action.pricePerGuest),
                pricePerGuestProvenance: action.provenance,
              }
            : l,
        ),
      };

    case "ADD_ACTIVITY":
      return {
        ...state,
        activity: [
          ...state.activity,
          {
            ...action.line,
            id: nextId("act"),
            ledger: "outbound-activity",
            sortOrder: state.activity.length,
          },
        ],
      };

    case "REMOVE_ACTIVITY":
      return {
        ...state,
        activity: state.activity.filter((l) => l.id !== action.id),
      };

    case "COMPLETE_ACTIVITY":
      return {
        ...state,
        activity: state.activity.map((l) =>
          l.id === action.id ? { ...l, completedAt: action.at } : l,
        ),
      };

    case "ADD_REPLY":
      return {
        ...state,
        replies: [...state.replies, { ...action.reply, id: nextId("reply") }],
      };

    case "MARK_QUOTED":
      return state.quotedProspectIds.includes(action.prospectId)
        ? state
        : {
            ...state,
            quotedProspectIds: [...state.quotedProspectIds, action.prospectId],
          };

    case "RESET":
      return initial;

    default:
      return state;
  }
}

// ---------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------

/**
 * BOTH LEDGERS SURVIVE A RELOAD, AS DELTAS AGAINST THE SEED.
 *
 * What goes to storage is the difference between what is on screen and
 * what shipped in data/book.ts: lines added, lines edited, lines
 * removed, shifts ticked off, replies logged, quotes marked as sent. The
 * two seeded contracts and the seeded activity plan are not copied out.
 * A reader who never touches them holds no copy of them, so when a
 * seeded price or a seeded note is corrected in a later build, the
 * correction reaches them.
 *
 * A door count typed on a seeded line is a different case, and it is the
 * one the delta shape is really for: that line is written out in full,
 * because from the moment somebody changes a number on it the line is
 * theirs rather than the seed's, and half a line cannot be stored.
 */
interface BookPayload {
  book: RowDelta<BookLine> | null;
  activity: RowDelta<ActivityLine> | null;
  replies: RowDelta<Reply> | null;
  quoted: string[];
}

const PROVENANCE: Record<Provenance, true> = {
  public: true,
  illustrative: true,
  modeled: true,
  observed: true,
  user_input: true,
  withheld: true,
};

const idOf = (row: { id: string }) => row.id;

function reviveBookLine(raw: unknown): BookLine | null {
  if (!isRecord(raw)) return null;
  const id = str(raw.id);
  const prospectId = str(raw.prospectId);
  const packageId = str(raw.packageId);
  const guests = num(raw.guests);
  const pricePerGuest = num(raw.pricePerGuest);
  const pricePerGuestProvenance = enumKey(raw.pricePerGuestProvenance, PROVENANCE);
  const depositPercent = num(raw.depositPercent);
  const eventDate = str(raw.eventDate);
  const lanesHeld = num(raw.lanesHeld);
  if (
    !id ||
    !prospectId ||
    !packageId ||
    !eventDate ||
    !pricePerGuestProvenance ||
    guests === null ||
    pricePerGuest === null ||
    depositPercent === null ||
    lanesHeld === null
  ) {
    return null;
  }
  /* An organisation or a package dropped from the seed in a later build
     must not walk back in through storage. Every screen that renders a
     book line looks its prospect and its package up by id, and a line
     pointing at neither is a crash waiting for whoever opens the Book. */
  if (!PROSPECT_BY_ID[prospectId] || !PACKAGE_BY_ID[packageId]) return null;
  return {
    id,
    /* Forced, not read. There is exactly one ledger a book line can be
       on, and a payload claiming otherwise would put hours into a
       revenue total, which is the one lie this file exists to prevent. */
    ledger: "booked-revenue",
    source: optionalStr(raw.source),
    prospectId,
    packageId,
    guests: Math.max(1, Math.round(guests)),
    pricePerGuest: Math.max(0, pricePerGuest),
    pricePerGuestProvenance,
    depositPercent: Math.min(100, Math.max(0, depositPercent)),
    eventDate,
    lanesHeld: Math.max(0, Math.round(lanesHeld)),
    offerId: optionalStr(raw.offerId),
    notes: optionalStr(raw.notes),
    sortOrder: num(raw.sortOrder) ?? 0,
  };
}

function reviveActivityLine(raw: unknown): ActivityLine | null {
  if (!isRecord(raw)) return null;
  const id = str(raw.id);
  const type = enumKey(raw.type, ACTIVITY_TYPE);
  const locationLabel = str(raw.locationLabel);
  const week = str(raw.week);
  /* Checked against the seat table rather than accepted as a string, for
     the same reason the prospect id is checked against the trade area: a
     saved row naming a seat that no longer exists would put hours
     against nobody and quietly drop them out of every per-seat figure on
     the floor screen. */
  const seatId = enumKey(raw.seatId, SEAT_BY_ID);
  const hours = num(raw.hours);
  const targetConversations = num(raw.targetConversations);
  if (
    !id ||
    !type ||
    !locationLabel ||
    !week ||
    !seatId ||
    hours === null ||
    targetConversations === null
  ) {
    return null;
  }
  const prospectId = optionalStr(raw.prospectId);
  return {
    id,
    ledger: "outbound-activity",
    type,
    prospectId: prospectId && PROSPECT_BY_ID[prospectId] ? prospectId : undefined,
    locationLabel,
    week,
    hours: Math.max(0, hours),
    targetConversations: Math.max(0, Math.round(targetConversations)),
    seatId,
    laneFocus: enumKeys(raw.laneFocus, LANE_META),
    notes: optionalStr(raw.notes),
    completedAt: optionalStr(raw.completedAt),
    sortOrder: num(raw.sortOrder) ?? 0,
  };
}

function reviveReply(raw: unknown): Reply | null {
  if (!isRecord(raw)) return null;
  const id = str(raw.id);
  const prospectId = str(raw.prospectId);
  const disposition: ReplyDisposition | null = enumKey(
    raw.disposition,
    REPLY_DISPOSITION,
  );
  const receivedAt = str(raw.receivedAt);
  const summary = str(raw.summary);
  if (!id || !prospectId || !disposition || !receivedAt || summary === null) {
    return null;
  }
  if (!PROSPECT_BY_ID[prospectId]) return null;
  const objectionId = optionalStr(raw.objectionId);
  return {
    id,
    prospectId,
    disposition,
    receivedAt,
    summary,
    objectionId: objectionId && OBJECTION_BY_ID[objectionId] ? objectionId : undefined,
    nextStep: optionalStr(raw.nextStep),
    nextStepDue: optionalStr(raw.nextStepDue),
  };
}

function reviveDelta<T>(
  raw: unknown,
  revive: (row: unknown) => T | null,
): RowDelta<T> {
  if (!isRecord(raw)) return { changed: [], removed: [] };
  return {
    changed: arr(raw.changed)
      .map(revive)
      .filter((row): row is T => row !== null),
    removed: arr(raw.removed).filter((id): id is string => typeof id === "string"),
  };
}

const bookCodec: SliceCodec<BookState> = {
  slice: "book",
  signature: signatureOf(SEED_BOOK, SEED_ACTIVITY, SEED_REPLIES),
  encode: (state) => {
    const payload: BookPayload = {
      book: diffRows(SEED_BOOK, state.book, idOf),
      activity: diffRows(SEED_ACTIVITY, state.activity, idOf),
      replies: diffRows(SEED_REPLIES, state.replies, idOf),
      quoted: state.quotedProspectIds,
    };
    const untouched =
      payload.book === null &&
      payload.activity === null &&
      payload.replies === null &&
      payload.quoted.length === 0;
    return untouched ? null : payload;
  },
  decode: (raw, seed) => {
    if (!isRecord(raw)) return seed;
    const book = reviveDelta(raw.book, reviveBookLine);
    const activity = reviveDelta(raw.activity, reviveActivityLine);
    const replies = reviveDelta(raw.replies, reviveReply);

    const nextBook = mergeRows(seed.book, book.changed, book.removed, idOf);
    const nextActivity = mergeRows(
      seed.activity,
      activity.changed,
      activity.removed,
      idOf,
    );
    const nextReplies = mergeRows(seed.replies, replies.changed, replies.removed, idOf);

    /*
      RESTART THE ID COUNTER ABOVE WHAT CAME BACK.

      `seq` is a module counter and it resets to zero on every page load,
      while the ids it minted last session return from storage. Without
      this line a returning reader's next booking is handed "book-1",
      which a saved line is already using, and one click on remove then
      deletes both of them. It is the sharpest edge in this whole
      mechanism and it is invisible until somebody actually comes back to
      a saved session, which is the only case persistence exists for.
    */
    const ids = [
      ...nextBook.map(idOf),
      ...nextActivity.map(idOf),
      ...nextReplies.map(idOf),
    ];
    seq = Math.max(
      seq,
      highestIdSuffix(ids, "book"),
      highestIdSuffix(ids, "act"),
      highestIdSuffix(ids, "reply"),
    );

    return {
      book: nextBook,
      activity: nextActivity,
      replies: nextReplies,
      quotedProspectIds: arr(raw.quoted).filter(
        (id): id is string => typeof id === "string" && Boolean(PROSPECT_BY_ID[id]),
      ),
    };
  },
};

const StateCtx = createContext<BookState>(initial);
const DispatchCtx = createContext<Dispatch<BookAction>>(() => undefined);

export function BookProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = usePersistedReducer(reducer, initial, bookCodec);
  const value = useMemo(() => state, [state]);
  return (
    <StateCtx.Provider value={value}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

export function useBook() {
  return useContext(StateCtx);
}

export function useBookDispatch() {
  return useContext(DispatchCtx);
}

// ---------------------------------------------------------------
// Totals. Two functions, deliberately, and neither returns the other's
// unit.
// ---------------------------------------------------------------

export interface RevenueTotals {
  contracts: number;
  guests: number;
  /** Contract value at the per-door price on each line. */
  revenue: number;
  /** Cash actually collected, at each line's own deposit percentage. */
  deposits: number;
  /** How much of the revenue rests on a price a person typed. */
  userPricedRevenue: number;
}

export function revenueTotals(book: BookLine[]): RevenueTotals {
  return book.reduce<RevenueTotals>(
    (t, l) => {
      const value = l.guests * l.pricePerGuest;
      return {
        contracts: t.contracts + 1,
        guests: t.guests + l.guests,
        revenue: t.revenue + value,
        deposits: t.deposits + (value * l.depositPercent) / 100,
        userPricedRevenue:
          t.userPricedRevenue +
          (l.pricePerGuestProvenance === "user_input" ? value : 0),
      };
    },
    {
      contracts: 0,
      guests: 0,
      revenue: 0,
      deposits: 0,
      userPricedRevenue: 0,
    },
  );
}

export interface ActivityTotals {
  shifts: number;
  hours: number;
  targetConversations: number;
  completed: number;
  byType: Record<ActivityType, number>;
  /** Hours committed out of the office, specifically. */
  outsideHours: number;
}

/**
 * OUTSIDE HOURS is separated from total hours on purpose.
 *
 * The posting asks for local marketing initiatives, campaign execution
 * and partnership with the general managers who run the branches, and
 * none of that happens at a desk. A call block is outbound work and it
 * is counted, but it is not the thing the posting asked for, and a plan
 * that quietly meets its hours target from a chair has not met it.
 */
const OUTSIDE: ActivityType[] = ["tabling", "networking-event", "go-see"];

export function activityTotals(activity: ActivityLine[]): ActivityTotals {
  const byType = {
    tabling: 0,
    "networking-event": 0,
    "go-see": 0,
    "call-block": 0,
    "email-sequence": 0,
    "venue-tour": 0,
  } as Record<ActivityType, number>;

  let hours = 0;
  let outsideHours = 0;
  let targetConversations = 0;
  let completed = 0;

  for (const l of activity) {
    byType[l.type] += 1;
    hours += l.hours;
    if (OUTSIDE.includes(l.type)) outsideHours += l.hours;
    targetConversations += l.targetConversations;
    if (l.completedAt) completed += 1;
  }

  return {
    shifts: activity.length,
    hours,
    targetConversations,
    completed,
    byType,
    outsideHours,
  };
}

/**
 * Hours out of the office per thousand dollars signed.
 *
 * The one number that makes activity legible without letting it pretend
 * to be revenue. It starts terrible, as every cold territory does,
 * because the first signed lines cost the most work, and it improves as
 * referral partners start sending work. Returns null rather than
 * Infinity when nothing is booked yet, because a chart that renders
 * Infinity has told the reader nothing except that it is broken.
 */
export function hoursPerThousandBooked(
  activity: ActivityLine[],
  book: BookLine[],
): number | null {
  const revenue = revenueTotals(book).revenue;
  if (revenue <= 0) return null;
  return (activityTotals(activity).outsideHours / revenue) * 1000;
}

export function activityByWeek(
  activity: ActivityLine[],
): { week: string; lines: ActivityLine[]; hours: number }[] {
  const weeks = new Map<string, ActivityLine[]>();
  for (const l of activity) {
    const bucket = weeks.get(l.week) ?? [];
    bucket.push(l);
    weeks.set(l.week, bucket);
  }
  return [...weeks.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, lines]) => ({
      week,
      lines,
      hours: lines.reduce((n, l) => n + l.hours, 0),
    }));
}

export function laneCoverage(activity: ActivityLine[]): Record<Lane, number> {
  /* Seeded from LANE_ORDER, not from a literal list of lane keys. A
     hand-written literal asserted with `as` accepts a missing lane at
     compile time and then adds hours to `undefined` at run time, which
     is the one failure mode a Record<Lane, T> is supposed to prevent. */
  const out = Object.fromEntries(LANE_ORDER.map((lane) => [lane, 0])) as Record<
    Lane,
    number
  >;
  for (const l of activity) {
    for (const lane of l.laneFocus) out[lane] += l.hours;
  }
  return out;
}
