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
 * That ratio is the honest one for partnership outreach from a brand
 * that runs local and does not put its holding company's name on
 * anything, and a demonstration where every message gets a yes is a
 * demonstration nobody believes. The five cover four service lines and
 * two kinds of message, so the log reads as a week of work rather than
 * as a fixture list.
 *
 * NONE OF THESE IS A CONSUMER MESSAGE, and that is the point of the
 * screen. Homeowner demand in this market is bought through paid search,
 * Local Services Ads and the map pack, and none of that is an outbox. It
 * is a budget, a bid and a phone that has to be answered inside a minute.
 * What an outbox is for in a division marketing job is the other half:
 * the property manager with four hundred doors, the HOA that meets once
 * a month, the chamber that will put a brand in front of its members,
 * and the employer running a benefits fair. Those are worked one at a
 * time, by a person, and they are the only leads in this market that
 * cannot be outbid.
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
    prospectId: "amerige-pointe-apartments-greystar",
    prospectName: "Amerige Pointe Apartments (Greystar)",
    lane: "partner-property",
    to: DEMO_RECIPIENT,
    recipientRole: "Regional Property Manager",
    subject: "Amerige Pointe: staged replacement rather than one capital ask",
    templateLabel: "Portfolio, staged",
    body: "You said the board will not sign one capital number this year, so a single portfolio agreement does not work. Staging it does. The same doors covered, split across two budget years, with the oldest units first because those are the ones generating the after hours calls you are already paying emergency rates on. I have written it up both ways so you can see the difference before you take it to anyone. One thing to flag before you read it: the federal credit that was worth up to two thousand dollars a unit ended for anything placed in service after the end of last year, so if a plan you were shown earlier leaned on it, the number in it is no longer real.",
    packageId: "rival-mr-rooter-advantage",
    guests: 40,
    attachmentName: "amerige-pointe-staged-options.pdf",
    outcome: "asked-for-info",
    reply:
      "Send me the staged version in writing with the unit counts. I need something to show ownership.",
    reference: "SCB-DEMO-0005",
  },
  {
    id: "sent-0004",
    sentAt: "2026-09-15",
    kind: "outreach",
    prospectId: "brea-olinda-unified-school-district",
    prospectName: "Brea Olinda Unified School District",
    lane: "hvac",
    to: DEMO_RECIPIENT,
    recipientRole: "Director of Maintenance and Operations",
    subject: "Pre-season maintenance, and why I am writing in August",
    templateLabel: "Seasonal, calendar first",
    body: "Your heating comes on in November whatever anybody decides, which is why I am writing in August: the contractors get chosen months before the first cold morning arrives. Right now is the tail of cooling season, which is the part working in your favour, because September and October are the only weeks of the year when this crew has room and you are not competing with an emergency. A pre-season walkthrough across your sites costs nothing and it produces a written condition list you can take to a board meeting rather than a quote you have to defend. Give me a week in September and I will put it in writing.",
    outcome: "meeting-set",
    reply:
      "What would a walkthrough cover across eleven sites, and can you do it before the October board meeting? Price the two oldest campuses separately.",
    reference: "SCB-DEMO-0004",
  },
  {
    id: "sent-0003",
    sentAt: "2026-09-14",
    kind: "outreach",
    prospectId: "brea-chamber-of-commerce",
    prospectName: "Brea Chamber of Commerce",
    lane: "partner-employer",
    to: DEMO_RECIPIENT,
    recipientRole: "Membership Director",
    subject: "A member business on Columbia Street, and a session for your members",
    templateLabel: "Referral partner",
    body: "This brand has been on Columbia Street for twenty five years and almost nobody in the chamber knows it is here, which is a fair criticism of us rather than of the chamber. Before any membership pitch, the useful thing is probably a session: thirty minutes for member businesses on what the rebates actually are this year, because two of the big ones ended in January and the utility pages are still advertising them. No pitch in it. If that is worth a slot, I will build it and bring the sources.",
    outcome: "asked-for-info",
    reply:
      "Happy to look at a member spotlight. The rebate session is more interesting; send an outline and we will find a morning.",
    reference: "SCB-DEMO-0003",
  },
  {
    id: "sent-0002",
    sentAt: "2026-09-08",
    kind: "outreach",
    prospectId: "fairway-ford",
    prospectName: "Fairway Ford",
    lane: "drain-sewer",
    to: DEMO_RECIPIENT,
    recipientRole: "General Manager",
    subject: "The service bay drains, before the first November storm",
    templateLabel: "Discretionary, occasion first",
    body: "A service department with a wash bay and four floor drains is a plumbing problem that only announces itself on the first heavy morning of the season, and by then everybody in the county is calling on the same day. A camera survey now costs nothing and it tells you which of the four is actually the problem rather than which one flooded last. If nothing needs doing, that is a useful thing to know in writing before the rain.",
    outcome: "declined",
    reply:
      "Facilities is contracted through the dealer group and has been for three years. Come back in February if you want the fleet vehicle work.",
    reference: "SCB-DEMO-0002",
  },
  {
    id: "sent-0001",
    sentAt: "2026-09-03",
    kind: "outreach",
    prospectId: "the-pointe-apartments-olen-living",
    prospectName: "The Pointe Apartments (Olen Living)",
    lane: "hvac",
    to: DEMO_RECIPIENT,
    recipientRole: "Community Manager",
    subject: "Your after hours calls, and the two weeks a year they can be prevented",
    templateLabel: "Calendar-locked, date first",
    body: "Every after hours HVAC call at a property this size costs more than the repair does, and almost all of them arrive in the same fortnight. Right now is the only window in the year when a crew can walk a property without an emergency pulling them off it. A condition survey across the units costs nothing and produces a list you can budget against rather than a quote. Give me a week in September and I will put it in writing.",
    outcome: "no-reply",
    reference: "SCB-DEMO-0001",
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
