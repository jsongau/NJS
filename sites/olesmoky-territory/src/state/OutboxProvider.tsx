import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

/**
 * The outbox.
 *
 * A rep's real question at nine on a Monday is not "what should I send" —
 * it is "what did I already send, to whom, and did anyone answer." An
 * order tool with no record of what went out asks the user to hold that
 * in their head, which is exactly the thing software is for.
 *
 * It also does something for the demo that nothing else does: it makes
 * the send button MEAN something. Before this, sending produced a
 * confirmation card and then the evidence evaporated. Now every send
 * lands in a log you can open, read back, and compare.
 *
 * Separate provider from the plan on purpose. The plan is the commercial
 * commitment — cases the territory is standing behind. The outbox is
 * correspondence. They have different lifetimes and different meanings,
 * and merging them would put a communications record inside a ledger.
 */

export interface SentMessage {
  id: string;
  /** ISO date. Seeded entries are dated; live ones stamp at send. */
  sentAt: string;
  accountId: string;
  storeName: string;
  to: string;
  recipientRole: string;
  subject: string;
  /** The draft that was picked, by label, so a pattern is visible. */
  draftLabel: string;
  lineCount: number;
  totalCases: number;
  body: string;
  attachmentName?: string;
  /** Where the conversation got to. Seeded history has answers. */
  outcome: "awaiting" | "confirmed" | "cut" | "no-reply";
  /** What came back, when anything did. */
  reply?: string;
  reference: string;
}

/**
 * Prior correspondence.
 *
 * Seeded rather than empty, because an empty log teaches nothing and
 * because the interesting thing about a log is the PATTERN across it:
 * which openers got answered, which got cut, which got silence. Three
 * outcomes, three different lessons, and one of them is a loss — a demo
 * where every message gets a yes is a demo nobody believes.
 *
 * Illustrative. No message here was sent and no reply here was written by
 * anyone; the addresses are unroutable `.local` mailboxes.
 */
const SEEDED: SentMessage[] = [
  /*
    FOUR SEEDS, NOT THREE, AND ONE OF THEM IS A BAR.

    The log used to be three grocery messages, which was fine when the
    territory was grocery. Against this roster it would have been a
    record of correspondence with stores that are not in the app — and
    worse, it would have shown every message in the same voice, which is
    precisely the thing the roster change was supposed to fix. A log is
    read for the PATTERN across it, so the pattern here is deliberate:
    two retail, two on-premise, and four different outcomes including a
    silence and a partial cut. A demo where every message gets a yes is
    a demo nobody believes.
  */
  {
    id: "sent-0004",
    sentAt: "2026-08-04",
    accountId: "bww-rowland-heights",
    storeName: "Buffalo Wild Wings, Rowland Heights",
    to: "bar@demo-buffalo-wild-wings-rowland-heights.local",
    recipientRole: "Buffalo Wild Wings Rowland Heights, Bar manager",
    subject: "Buffalo Wild Wings Rowland Heights: 6 cases before the 15th — reply YES?",
    draftLabel: "UFC 330 — Saturday night",
    lineCount: 3,
    totalCases: 6,
    body: "UFC 330 is on Saturday 15 August — Makhachev vs Machado Garry. Your bar will be full and the well will get hammered, so the ask is small: make sure you are not thin on Blackberry and Apple Pie before doors. I can bring table tents and put someone behind the bar with your team. No cost to you either way.",
    attachmentName: "suggested-order-bww-rowland-heights-os-demo-store-0038.pdf",
    outcome: "confirmed",
    reply: "Yes to all three. Bring the tents Thursday, we set up Friday afternoon.",
    reference: "OS-DEMO-STORE-0038",
  },
  {
    id: "sent-0003",
    sentAt: "2026-08-03",
    accountId: "canyon-liquor-west-covina",
    storeName: "Canyon Liquor, West Covina",
    to: "owner@demo-canyon-liquor.local",
    recipientRole: "Canyon Liquor West Covina, Owner",
    subject: "Canyon Liquor West Covina: 16 cases on Friday — reply YES?",
    draftLabel: "Owner to owner",
    lineCount: 5,
    totalCases: 16,
    body: "You are likely out of Moonshine Cherries — that is the fastest-moving thing we have in this corridor and it does not sit long anywhere. Same shelf space, no new facings, just what has already sold.",
    attachmentName: "suggested-order-canyon-liquor-west-covina-os-demo-store-0036.pdf",
    outcome: "cut",
    reply:
      "YES MINUS the Tennessee Straight Bourbon, I still have most of a case of that. Rest is fine.",
    reference: "OS-DEMO-STORE-0036",
  },
  {
    id: "sent-0002",
    sentAt: "2026-07-31",
    accountId: "black-angus-whittier",
    storeName: "Black Angus Steakhouse, Whittier",
    to: "bar@demo-black-angus-steakhouse.local",
    recipientRole: "Black Angus Steakhouse Whittier, Bar manager",
    subject: "Black Angus Steakhouse Whittier: 2 cases on Friday — reply YES?",
    draftLabel: "Get the staff behind it",
    lineCount: 2,
    totalCases: 2,
    body: "Worth twenty minutes before a shift: I can walk your bar team through the Tennessee Straight Bourbon so they have something to say when somebody asks what it is. That is what moves it here — a bottle nobody can describe does not get recommended.",
    attachmentName: "suggested-order-black-angus-whittier-os-demo-store-0031.pdf",
    outcome: "no-reply",
    reference: "OS-DEMO-STORE-0031",
  },
  {
    id: "sent-0001",
    sentAt: "2026-07-28",
    accountId: "bevmo-walnut",
    storeName: "BevMo!, Walnut",
    to: "manager@demo-bevmo.local",
    recipientRole: "BevMo! Walnut, Store manager",
    subject: "BevMo! Walnut: 28 cases on Friday — reply YES?",
    draftLabel: "Space you are not using",
    lineCount: 4,
    totalCases: 28,
    body: "One thing worth two minutes. The 50ml minis are not on your counter yet and there is no paperwork on them — it is a case, not a listing. I kept the opening quantity small so you can find out without giving up space you need.",
    attachmentName: "suggested-order-bevmo-walnut-os-demo-store-0027.pdf",
    outcome: "confirmed",
    reply: "Send them. Put them on the counter unit by register 3.",
    reference: "OS-DEMO-STORE-0027",
  },
];
interface OutboxState {
  sent: SentMessage[];
}

type OutboxAction =
  | { type: "RECORD"; message: SentMessage }
  | { type: "RESET" };

const STORAGE_KEY = "ntp:outbox:v1";

function initial(): OutboxState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as OutboxState;
  } catch {
    /* Private browsing throws on read. A demo should not die for it. */
  }
  return { sent: SEEDED };
}

function reducer(state: OutboxState, action: OutboxAction): OutboxState {
  switch (action.type) {
    case "RECORD":
      // Newest first, which is the order anyone reads a log in.
      return { sent: [action.message, ...state.sent] };
    case "RESET":
      return { sent: SEEDED };
    default:
      return state;
  }
}

const StateCtx = createContext<OutboxState>({ sent: SEEDED });
const DispatchCtx = createContext<React.Dispatch<OutboxAction>>(() => {});

export function OutboxProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* Quota or private mode. Losing the log is survivable. */
    }
  }, [state]);

  const value = useMemo(() => state, [state]);
  return (
    <StateCtx.Provider value={value}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

export const useOutbox = () => useContext(StateCtx);
export const useOutboxDispatch = () => useContext(DispatchCtx);

export const OUTCOME_LABEL: Record<
  SentMessage["outcome"],
  { label: string; glyph: string; cssVar: string }
> = {
  confirmed: { label: "Confirmed", glyph: "✓", cssVar: "var(--ok)" },
  cut: { label: "Confirmed with cuts", glyph: "◐", cssVar: "var(--warn)" },
  awaiting: { label: "Waiting on a reply", glyph: "○", cssVar: "var(--text-3)" },
  "no-reply": { label: "No reply", glyph: "—", cssVar: "var(--risk)" },
};
