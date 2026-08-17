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
 * That ratio is the honest one for cold outreach into a trade area where
 * most of these organisations have never been written to before, and a
 * demonstration where every message gets a yes is a demonstration nobody
 * believes. The five also cover four lanes and two kinds of message, so
 * the log reads as a week of work rather than as a fixture list.
 *
 * NOT ONE OF THEM QUOTES A PRICE, AND THAT IS THE FINDING RATHER THAN A
 * GAP. Round1 publishes the contents of the All Inclusive Party and no
 * figure to go with it, publishes no lane count for any location and no
 * minimum spend, and tells the reader to contact the venue. So the seeds
 * do what the role does: they carry what is published, name what is not,
 * and put the conversation where the number actually lives.
 */
const SEEDED: SentMessage[] = [
  {
    id: "sent-0005",
    sentAt: "2026-09-18",
    kind: "quote",
    prospectId: "abc-unified-school-district",
    prospectName: "ABC Unified School District",
    lane: "schools",
    to: DEMO_RECIPIENT,
    recipientRole: "Superintendent's office",
    subject: "ABC Unified: what the All Inclusive Party includes, in writing",
    templateLabel: "Contents first, price named as unpublished",
    body: "You asked what a group of about eighty gets. Round1 publishes the contents of the All Inclusive Party and I have set them out in full: arcade time-play, bowling with shoe rental, karaoke or a party room, billiards and ping pong, pizza and soda, and a group photo, with a VIP Immersive Lane available at a separate fee. What Round1 does not publish anywhere is the price, for this or any package, and I would rather say that plainly than send you a range I would have to correct later. Changes to a booking need three or more days notice, which is worth knowing before a date is set rather than after.",
    packageId: "all-inclusive-party",
    guests: 80,
    attachmentName: "abc-unified-all-inclusive-contents.pdf",
    outcome: "asked-for-info",
    reply:
      "Useful. Get me the figure and the earliest June dates in writing so I have something to take to the board.",
    reference: "R1-DEMO-0005",
  },
  {
    id: "sent-0004",
    sentAt: "2026-09-15",
    kind: "outreach",
    prospectId: "perfect-rares-card-center",
    prospectName: "Perfect Rares Card Center",
    lane: "local-retail-food",
    to: DEMO_RECIPIENT,
    recipientRole: "Store manager",
    subject: "Your collectors and our arcade floor, one evening",
    templateLabel: "Audience overlap, go-see first",
    body: "You are about a mile from our office and you sell to the same people our arcade floor is built for. That is the whole of the reason I am writing. Two things are worth twenty minutes: what your trading nights would want from a prize wall, and which licensed properties your customers actually chase this year rather than the ones a catalogue says they should. I would rather walk in and look at your shelves than describe any of this over email. Tell me a quiet hour and I will come to you.",
    outcome: "meeting-set",
    reply:
      "Thursday afternoons are dead, come then. Bring what you can actually get hold of, not a catalogue.",
    reference: "R1-DEMO-0004",
  },
  {
    id: "sent-0003",
    sentAt: "2026-09-14",
    kind: "outreach",
    prospectId: "norwalk-chamber-of-commerce",
    prospectName: "Norwalk Chamber of Commerce",
    lane: "faith-nonprofit",
    to: DEMO_RECIPIENT,
    recipientRole: "Membership director",
    subject: "Your member directory, and a room for a mixer",
    templateLabel: "Referral partner",
    body: "A chamber is not really one conversation, it is the shortest route to every printer, decorator and packaging supplier inside this trade area, and finding those is half of what I do. So the ask is small and it goes both ways: which of your members decorate merchandise or run print, and whether the chamber wants a mixer somewhere with bowling and karaoke in it rather than a hotel function room. Our nearest store is at Lakewood Center and it is open until midnight on a weeknight.",
    outcome: "asked-for-info",
    reply:
      "I can send you the supplier side of the directory. For a mixer, tell me what a room of sixty would run and who signs it off.",
    reference: "R1-DEMO-0003",
  },
  {
    id: "sent-0002",
    sentAt: "2026-09-08",
    kind: "outreach",
    prospectId: "manhattan-stitching-company",
    prospectName: "Manhattan Stitching Company",
    lane: "corporate",
    to: DEMO_RECIPIENT,
    recipientRole: "Sales manager",
    subject: "Decorated merchandise, short runs, licensed artwork",
    templateLabel: "Vendor scouting, capability first",
    body: "I am mapping the screen print and embroidery capacity inside this trade area before I place anything, which means I am asking the same three questions of everybody: your minimum run, your lead time in the fourth quarter when everyone else is queuing, and whether you will decorate artwork that comes with a licence attached and the paperwork that goes with it. If the answer to the third one is no, say so now and neither of us wastes a quarter finding out.",
    outcome: "declined",
    reply:
      "We do not take third party licensed artwork without the licensor's written release, and we are not set up to chase that. Plain stock, yes.",
    reference: "R1-DEMO-0002",
  },
  {
    id: "sent-0001",
    sentAt: "2026-09-03",
    kind: "outreach",
    prospectId: "cerritos-high-school",
    prospectName: "Cerritos High School",
    lane: "schools",
    to: DEMO_RECIPIENT,
    recipientRole: "Principal's office",
    subject: "Grad night 2027, and the half mile between us",
    templateLabel: "Calendar-locked, date first",
    body: "Your seniors graduate in June whatever anybody decides, and the venue gets chosen months before the night arrives, which is why this is a September letter rather than an April one. We are half a mile from your campus and the nearest store is at Lakewood Center, open until one in the morning on a Friday. I am not going to quote you a figure in a cold email, because Round1 does not publish one and I would only be guessing at it. What I can do is get the date question settled first, which is the part that runs out.",
    outcome: "no-reply",
    reference: "R1-DEMO-0001",
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
  return `R1-DEMO-${String(seq).padStart(4, "0")}`;
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
    reference: str(raw.reference) ?? "R1-DEMO-RESTORED",
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
      quote carries R1-DEMO-0006 for the second time, and two different
      messages with the same reference on a page whose entire job is to
      be a reliable record is the one bug this log cannot survive.
    */
    for (const m of sent) {
      const n = Number.parseInt(m.reference.replace("R1-DEMO-", ""), 10);
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
