import {
  createContext,
  useContext,
  useMemo,
  type Dispatch,
  type ReactNode,
} from "react";
import type { Lane } from "@/domain/types";
import { DEMO_RECIPIENT } from "@/data/venue";
import { LANE_META } from "@/domain/lanes";
import { PROSPECT_BY_ID } from "@/data/prospects";
import { PACKAGE_BY_ID } from "@/data/packages";
import {
  arr,
  diffRows,
  enumKey,
  isRecord,
  mergeRows,
  optionalNum,
  optionalStr,
  signatureOf,
  str,
  usePersistedReducer,
  type SliceCodec,
} from "./persist";

/**
 * THE OUTBOX.
 *
 * A rep's real question at nine on a Monday is not "what should I send".
 * It is "what did I already send, to whom, and did anybody answer". A
 * prospecting tool with no record of what went out asks the user to hold
 * that in their head, which is precisely the thing software is for.
 *
 * It also does something for the demonstration that nothing else does: it
 * makes the Send button MEAN something. Without it, sending produces a
 * confirmation card and then the evidence evaporates. With it, every send
 * lands in a log a reader can open, read back and compare.
 *
 * ── THE NO-TRANSPORT GUARANTEE IS STRUCTURAL, NOT A SETTING ───────
 * There is no email transport anywhere in this dependency tree. Not a
 * disabled one, not one behind a flag, not an API client with a missing
 * key. This provider is the entire send path: SEND writes a row to the
 * array below and the row never leaves the browser tab.
 *
 * That is a deliberate choice rather than an unfinished feature. This app
 * is static files served from a public URL, so any API key capable of
 * sending mail would ship inside the JavaScript bundle where anybody
 * viewing source could read it and send mail as the owner until it was
 * rotated. There is no safe client-side way to hold that secret. Real
 * sending would need a server function, and this app has no server.
 *
 * Every recipient is DEMO_RECIPIENT from data/venue.ts, which resolves to
 * a .invalid address. RFC 2606 reserves .invalid so it can never route
 * anywhere, which means a Send action has a real address to put in a To:
 * field and no possible path to a human being. That is why the Demo Mode
 * badge sits in the chrome rather than on individual screens: it is
 * describing a property of the build, not a mode somebody could leave.
 *
 * ── WHAT CHANGED FROM THE BUILD THIS WAS FORKED FROM ──────────────
 * The outbox used to hold ORDERS TO A DISTRIBUTOR: cases, SKUs, a
 * wholesaler reference. Nothing in this app is an order. What goes out
 * here is outreach to an ORGANISATION that has never heard of the venue,
 * and group quotes to the handful that replied. So the row carries a
 * prospect, a lane, a headcount discussed and a package, and it carries
 * no case count and no dollar total, because a quote is not revenue. The
 * money lives in BookProvider, behind a signature.
 */

export type OutboxKind =
  /** Cold or follow-up outreach. No numbers in it, by design. */
  | "outreach"
  /** A written group quote against a real headcount. */
  | "quote"
  /** A confirmation of a held date, sent after a conversation. */
  | "hold-confirmation";

export type OutboxOutcome =
  | "awaiting"
  | "meeting-set"
  | "asked-for-info"
  | "declined"
  | "no-reply";

export interface SentMessage {
  id: string;
  /** ISO date. Seeded entries are dated; live ones stamp at send. */
  sentAt: string;
  kind: OutboxKind;
  prospectId: string;
  prospectName: string;
  lane: Lane;
  /** Always the demo recipient. Shown, so the guarantee is visible. */
  to: string;
  /** The ROLE the message was addressed to. Never an invented name. */
  recipientRole: string;
  subject: string;
  /** Which template was used, by label, so a pattern is visible. */
  templateLabel: string;
  body: string;
  /** Present on a quote. The package it was written against. */
  packageId?: string;
  /** Present on a quote. Guests discussed, not guests hoped for. */
  guests?: number;
  attachmentName?: string;
  outcome: OutboxOutcome;
  /** What came back, where anything did. */
  reply?: string;
  reference: string;
}

/**
 * Prior correspondence.
 *
 * Seeded rather than empty, because an empty log teaches nothing and the
 * interesting thing about a log is the PATTERN across it: which openers
 * got answered, which got a wrong-person bounce, which got silence.
 *
 * FIVE SEEDS, FOUR DIFFERENT OUTCOMES, AND ONLY ONE OF THEM IS GOOD.
 * That ratio is the honest one for cold outreach from a building nobody
 * has heard of, and a demonstration where every message gets a yes is a
 * demonstration nobody believes. The five also cover four lanes and two
 * kinds of message, so the log reads as a week of work rather than as a
 * fixture list.
 *
 * These correspond to the replies seeded in data/book.ts, deliberately.
 * The reply page and the outbox describing different weeks would be the
 * fastest way to show that neither is real.
 */
const SEEDED: SentMessage[] = [
  {
    id: "sent-0005",
    sentAt: "2026-09-18",
    kind: "quote",
    prospectId: "silverado-brea-memory-care-community",
    prospectName: "Silverado Brea Memory Care Community",
    lane: "healthcare",
    to: DEMO_RECIPIENT,
    recipientRole: "Administrator",
    subject: "Silverado Brea: two weekday staff nights rather than one",
    templateLabel: "Two smaller weekdays",
    body: "You said forty people and that the community can never be uncovered, so one party does not work. Two weekday afternoons does. Same total headcount, half the room each time, and nobody has to find cover for everybody at once. I have written it up both ways so you can see the difference before you take it to anyone.",
    packageId: "fun-101",
    guests: 40,
    attachmentName: "silverado-brea-two-weekday-options.pdf",
    outcome: "asked-for-info",
    reply:
      "Send me the second option in writing with the dates. I need something to show the executive director.",
    reference: "MEB-DEMO-0005",
  },
  {
    id: "sent-0004",
    sentAt: "2026-09-15",
    kind: "outreach",
    prospectId: "brea-olinda-high-school",
    prospectName: "Brea Olinda High School",
    lane: "schools",
    to: DEMO_RECIPIENT,
    recipientRole: "Assistant Principal for Activities",
    subject: "Grad night 2027, and a date held at no cost",
    templateLabel: "Calendar-locked, date first",
    body: "Your seniors graduate in June whatever anybody decides, which is why I am writing in September: the venue gets chosen months before the night arrives. Main Event is opening on Birch Street, 1.8 miles from campus. The opening date is not public yet, which is the part working in your favour, because the calendar behind it is empty. Nothing is booked. You would take the June date you actually want rather than what is left, in a building none of your seniors has been inside. It costs nothing to hold, and it releases on its own if the timing stops working. Give me a day and I will put it in writing this week.",
    outcome: "meeting-set",
    reply:
      "What would a June date cost for roughly 380 seniors, and will you definitely be open by then? Quote the athletics banquets separately.",
    reference: "MEB-DEMO-0004",
  },
  {
    id: "sent-0003",
    sentAt: "2026-09-14",
    kind: "outreach",
    prospectId: "brea-chamber-of-commerce",
    prospectName: "Brea Chamber of Commerce",
    lane: "hospitality-civic",
    to: DEMO_RECIPIENT,
    recipientRole: "Membership Director",
    subject: "A new Birch Street member, and a room for a mixer",
    templateLabel: "Referral partner",
    body: "Main Event is building at 245 W Birch Street and has not opened yet. Before it does, the useful thing is probably not a membership pitch, it is a room. If the chamber wants a mixer in the opening quarter, the venue is empty on the nights you would want and I can put the space aside now.",
    outcome: "asked-for-info",
    reply:
      "Happy to look at a member spotlight once there is something to show. A mixer in the opening quarter is interesting; send details.",
    reference: "MEB-DEMO-0003",
  },
  {
    id: "sent-0002",
    sentAt: "2026-09-08",
    kind: "outreach",
    prospectId: "fairway-ford",
    prospectName: "Fairway Ford",
    lane: "auto-finance",
    to: DEMO_RECIPIENT,
    recipientRole: "General Manager",
    subject: "December, for sales, service, parts and finance in one room",
    templateLabel: "Discretionary, occasion first",
    body: "Four departments that share a building and almost never share an evening. A bowling and laser tag night puts them in one room without the seating plan that makes a hotel ballroom feel like a meeting. Main Event Brea has not opened yet, so the calendar behind it is empty and you would have first pick of whatever date suits the four of them. It costs nothing to hold and it releases on its own if the timing stops working.",
    outcome: "declined",
    reply:
      "Holiday party is contracted at a hotel and has been for three years. Come back in February if you want the summer sales push.",
    reference: "MEB-DEMO-0002",
  },
  {
    id: "sent-0001",
    sentAt: "2026-09-03",
    kind: "outreach",
    prospectId: "troy-high-school",
    prospectName: "Troy High School",
    lane: "schools",
    to: DEMO_RECIPIENT,
    recipientRole: "Activities Director",
    subject: "Grad night 2027, and a date held at no cost",
    templateLabel: "Calendar-locked, date first",
    body: "Your seniors graduate in June whatever anybody decides, and the venue gets chosen long before the night. Main Event is opening on Birch Street. The opening date is not public yet, so the calendar behind it is empty and the June dates are all still there. First pick, held at no cost, no deposit. Give me a day and I will put it in writing.",
    outcome: "no-reply",
    reference: "MEB-DEMO-0001",
  },
];

export interface OutboxState {
  sent: SentMessage[];
}

export type OutboxAction =
  | {
      type: "SEND";
      message: Omit<SentMessage, "id" | "to" | "reference" | "outcome"> &
        Partial<Pick<SentMessage, "outcome">>;
    }
  | { type: "SET_OUTCOME"; id: string; outcome: OutboxOutcome; reply?: string }
  | { type: "RESET" };

const initial: OutboxState = { sent: SEEDED };

let seq = SEEDED.length;

/**
 * The reference on a sent row.
 *
 * It says DEMO in the middle of it on purpose. This string ends up in a
 * subject line, on a quote page and in a log, and a reader who sees it
 * anywhere should be told what it is without having to find the badge in
 * the chrome.
 */
function nextReference(): string {
  seq += 1;
  return `MEB-DEMO-${String(seq).padStart(4, "0")}`;
}

function reducer(state: OutboxState, action: OutboxAction): OutboxState {
  switch (action.type) {
    case "SEND": {
      /*
        THE ENTIRE SEND PATH IS THESE FOUR LINES.

        No fetch, no client, no queue, no retry. The recipient is not
        taken from the caller either: it is forced to DEMO_RECIPIENT here,
        so a page that tried to address a real organisation could not do
        it even by accident.
      */
      const message: SentMessage = {
        ...action.message,
        id: `sent-${Date.now()}`,
        to: DEMO_RECIPIENT,
        reference: nextReference(),
        outcome: action.message.outcome ?? "awaiting",
      };
      // Newest first, which is the order anybody reads a log in.
      return { sent: [message, ...state.sent] };
    }

    case "SET_OUTCOME":
      return {
        sent: state.sent.map((m) =>
          m.id === action.id
            ? {
                ...m,
                outcome: action.outcome,
                reply: action.reply ?? m.reply,
              }
            : m,
        ),
      };

    case "RESET":
      return { sent: SEEDED };

    default:
      return state;
  }
}

// ---------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------

/**
 * THE OUTBOX WAS THE ONLY THING IN THIS APP THAT REMEMBERED ANYTHING,
 * AND IT REMEMBERED IT BADLY.
 *
 * It used to write its whole state, seeded rows included, to a key of
 * its own, parse whatever came back with a bare `as OutboxState` and
 * trust it. Three problems, and they are the three this rewrite is
 * about. The five seeded messages were copied into every reader's
 * browser, so a corrected subject line or a reworded seed would never
 * have reached anybody who had opened the app once. A truncated or
 * hand-edited payload was cast rather than checked, so a row with an
 * outcome of "maybe" reached OUTCOME_META["maybe"].label and took the
 * Sent page down with it. And it was one of four providers, three of
 * which remembered nothing at all, which is the sort of inconsistency
 * that reads as an accident rather than a design.
 *
 * ── THE NO-TRANSPORT GUARANTEE SURVIVES HYDRATION ─────────────────
 * The reducer forces every recipient to DEMO_RECIPIENT, and so does the
 * reviver below. That is not belt and braces, it is the same guarantee
 * arriving by a second door: a payload in local storage is user-writable,
 * so without the second forcing anybody could type a real school's
 * address into their own storage and watch this app render it in a To:
 * field as though the message had been addressed there. It never left
 * the tab either way, but a screenshot of that would be indefensible.
 */
const messageKey = (m: SentMessage) => m.id;

function reviveMessage(raw: unknown): SentMessage | null {
  if (!isRecord(raw)) return null;
  const id = str(raw.id);
  const sentAt = str(raw.sentAt);
  const kind = enumKey(raw.kind, KIND_META);
  const outcome = enumKey(raw.outcome, OUTCOME_META);
  const lane = enumKey(raw.lane, LANE_META);
  const prospectId = str(raw.prospectId);
  const subject = str(raw.subject);
  const body = str(raw.body);
  if (!id || !sentAt || !kind || !outcome || !lane || !prospectId) return null;
  if (subject === null || body === null) return null;
  if (!PROSPECT_BY_ID[prospectId]) return null;
  const packageId = optionalStr(raw.packageId);
  return {
    id,
    sentAt,
    kind,
    prospectId,
    prospectName: str(raw.prospectName) ?? PROSPECT_BY_ID[prospectId].name,
    lane,
    /* Forced here exactly as it is forced in the reducer. */
    to: DEMO_RECIPIENT,
    recipientRole: str(raw.recipientRole) ?? "",
    subject,
    templateLabel: str(raw.templateLabel) ?? "",
    body,
    packageId: packageId && PACKAGE_BY_ID[packageId] ? packageId : undefined,
    guests: optionalNum(raw.guests),
    attachmentName: optionalStr(raw.attachmentName),
    outcome,
    reply: optionalStr(raw.reply),
    reference: str(raw.reference) ?? "MEB-DEMO-RESTORED",
  };
}

const outboxCodec: SliceCodec<OutboxState> = {
  slice: "outbox",
  signature: signatureOf(SEEDED),
  encode: (state) => {
    const delta = diffRows(SEEDED, state.sent, messageKey);
    return delta === null ? null : { sent: delta };
  },
  decode: (raw, seed) => {
    if (!isRecord(raw) || !isRecord(raw.sent)) return seed;
    const changed = arr(raw.sent.changed)
      .map(reviveMessage)
      .filter((m): m is SentMessage => m !== null);
    const removed = arr(raw.sent.removed).filter(
      (id): id is string => typeof id === "string",
    );
    const sent = mergeRows(seed.sent, changed, removed, messageKey);

    /*
      THE REFERENCE COUNTER RESTARTS ABOVE THE HIGHEST ONE SAVED.

      References are minted by incrementing a module counter, and the
      counter resets to zero on every load while the references it minted
      come back from storage. Without this, a returning reader's next
      quote carries MEB-DEMO-0006 for the second time, and two different
      messages with the same reference on a page whose entire job is to
      be a reliable record is the one bug this log cannot survive.
    */
    for (const m of sent) {
      const n = Number.parseInt(m.reference.replace("MEB-DEMO-", ""), 10);
      if (Number.isFinite(n) && n > seq) seq = n;
    }

    return { sent };
  },
};

const StateCtx = createContext<OutboxState>(initial);
const DispatchCtx = createContext<Dispatch<OutboxAction>>(() => undefined);

export function OutboxProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = usePersistedReducer(reducer, initial, outboxCodec);

  const value = useMemo(() => state, [state]);
  return (
    <StateCtx.Provider value={value}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

export const useOutbox = () => useContext(StateCtx);
export const useOutboxDispatch = () => useContext(DispatchCtx);

/** Everything sent to one organisation, newest first. */
export function sentTo(state: OutboxState, prospectId: string): SentMessage[] {
  return state.sent.filter((m) => m.prospectId === prospectId);
}

/**
 * How many written touches an organisation has had.
 *
 * Worth a function rather than a length check, because the desk uses it
 * to stop a fourth email being suggested. Two emails and then a visit is
 * the sequence; four emails is a spam complaint.
 */
export function touchCount(state: OutboxState, prospectId: string): number {
  return sentTo(state, prospectId).length;
}

export const OUTCOME_META: Record<
  OutboxOutcome,
  { label: string; glyph: string; cssVar: string }
> = {
  "meeting-set": { label: "Meeting set", glyph: "●", cssVar: "var(--ok)" },
  "asked-for-info": {
    label: "Asked for information",
    glyph: "◑",
    cssVar: "var(--info)",
  },
  awaiting: { label: "Waiting on a reply", glyph: "◔", cssVar: "var(--warn)" },
  declined: { label: "Declined", glyph: "✕", cssVar: "var(--risk)" },
  "no-reply": { label: "No reply", glyph: "○", cssVar: "var(--text-3)" },
};

export const KIND_META: Record<
  OutboxKind,
  { label: string; glyph: string; note: string }
> = {
  outreach: {
    label: "Outreach",
    glyph: "▭",
    note: "A first or second written touch. Carries no price, because there is nothing to price yet.",
  },
  quote: {
    label: "Group quote",
    glyph: "▣",
    note: "A written quote against a headcount that was actually discussed. Still not revenue: revenue is a signature.",
  },
  "hold-confirmation": {
    label: "Hold confirmed",
    glyph: "◕",
    note: "Confirming in writing that a date is held and that the hold costs them nothing.",
  },
};
