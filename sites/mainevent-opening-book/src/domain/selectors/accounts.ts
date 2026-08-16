import type { BookLine, Prospect } from "@/domain/types";
import type {
  Account,
  AccountFigure,
  AccountMetric,
  AccountSegment,
  AccountState,
  AccountTrace,
  BuyingWindowParse,
  MissedWindow,
  Occasion,
  ParsedOccasion,
  PurchaseReading,
  RebookingWindow,
  TraceKind,
} from "@/domain/accounts";
import {
  ACCOUNT_STATE_ORDER,
  MID_MONTH_DAY,
  SEGMENT_PROFILE,
  TRACE_META,
  TRACE_OFFSET_DAYS,
  TRACE_ORDER,
  addDays,
  cycleStateOf,
  declaredCycleDays,
  figureOf,
  isoOf,
  parseBuyingWindow,
  partsOf,
} from "@/domain/accounts";
import { daysBetween } from "@/domain/licensing";
import { ACCOUNTS } from "@/data/accounts";
import { SEED_BOOK } from "@/data/book";
import { MESSAGES_BY_PROSPECT } from "@/data/conversations";
import { PROSPECTS, PROSPECT_BY_ID } from "@/data/prospects";
import { SEED_STATUSES } from "@/data/prospectStatus";
import { type Staleness, stalenessOf } from "@/domain/selectors/partners";

/**
 * THE ACCOUNT BOARD, DERIVED.
 *
 * `partners.ts` is the file this one is written against, and the debt is
 * worth stating out loud. That file found the one figure a supplier
 * register needs, days since last worked, computed it at render against
 * an injected clock rather than storing it, and printed its own
 * thresholds on screen. Everything below is the same discipline pointed
 * at the other end of the business.
 *
 * IT IS A PORT IN ONE HALF AND A GENERALISATION IN THE OTHER, and the
 * half that is not a port is the interesting one. Contact staleness
 * comes across untouched: `stalenessOf` is imported from that file
 * rather than copied, because a second copy of four bucket boundaries is
 * how a legend and a table start disagreeing. Purchase staleness cannot
 * come across at all. Run `stalenessOf` on days since last purchase and
 * a school on a perfectly healthy three occasion year reads GONE QUIET
 * for eight months running, and then reads gone quiet again on the day
 * the relationship actually dies. The fix is a division by the account's
 * own cycle, and it is written up on `OVERDUE_RATIO` in
 * `domain/accounts.ts`.
 *
 * WHAT THIS FILE MAY NOT DO. It may not invent an event, a person or a
 * past. Two contracts exist, both are in the future, and the only reason
 * this board is not empty is that five dated windows and eight dated
 * obligations fall out of two `buyingWindow` strings and two event dates
 * by arithmetic. Every one of them is checkable against the seed.
 */

// ---------------------------------------------------------------
// Small shared readings
// ---------------------------------------------------------------

/**
 * Contract value on one line.
 *
 * THE SAME `BookLine` MONEY, SEEN DOWN A DIFFERENT AXIS. This is not a
 * third ledger and the board must never let it look like one. Booked
 * revenue and outbound hours are the two ledgers, merchandise is its own
 * thing and cup entry money is its own thing; an account viewed from the
 * side does not create a fifth pile. Retained revenue answers "how much
 * of last year's money came back from the same organisations", and every
 * dollar in that answer is already counted once on `/book`.
 */
function lineValue(line: BookLine): number {
  return line.guests * line.pricePerGuest;
}

function byDate<T>(pick: (item: T) => string) {
  return (a: T, b: T) => (pick(a) < pick(b) ? -1 : pick(a) > pick(b) ? 1 : 0);
}

/** Signed lines for one account, oldest event first. */
function linesFor(account: Account): BookLine[] {
  return SEED_BOOK.filter((l) => l.prospectId === account.prospectId).sort(
    byDate((l: BookLine) => l.eventDate),
  );
}

/**
 * The date the contract was signed, read off the correspondence.
 *
 * `data/conversations.ts` already carries the message that moved each of
 * these two organisations to `booked`, with its date and a `signed`
 * signal on it. Reading it here rather than seeding a second copy on the
 * account is the same rule the seed file states: two files with an
 * opinion about one date is how they end up disagreeing.
 */
function signedOnFor(account: Account): string | null {
  const messages = MESSAGES_BY_PROSPECT[account.prospectId] ?? [];
  const signed = messages
    .filter(
      (m) =>
        m.effect.movedStatusTo === "booked" ||
        (m.effect.signals ?? []).includes("signed"),
    )
    .map((m) => m.at.slice(0, 10))
    .sort();
  return signed[0] ?? null;
}

/**
 * The last time anybody spoke to them, in either direction.
 *
 * Derived from the threaded correspondence, with the desk's own last
 * touch date as a fallback so an organisation that was telephoned rather
 * than emailed is not read as silent.
 */
function lastContactFor(account: Account): string | null {
  const messages = MESSAGES_BY_PROSPECT[account.prospectId] ?? [];
  const dates = messages.map((m) => m.at.slice(0, 10));
  for (const status of SEED_STATUSES) {
    if (status.prospectId !== account.prospectId) continue;
    if (status.lastTouchAt) dates.push(status.lastTouchAt.slice(0, 10));
  }
  dates.sort();
  return dates.length > 0 ? (dates[dates.length - 1] ?? null) : null;
}

// ---------------------------------------------------------------
// Occasions, read out of the buying window
// ---------------------------------------------------------------

/**
 * The segment an occasion buys on.
 *
 * Almost always the account's, and grad night is the exception that
 * proves why an occasion carries one at all. A high school holds grad
 * night and three banquets. Grad night is decided a year out by a
 * committee that is replaced every year by design, and a banquet is
 * decided eight weeks out by whoever is holding the season. One
 * organisation, one lane, two entirely different clocks.
 */
export function segmentForOccasion(
  account: Account,
  label: string,
): AccountSegment {
  if (/\bgrad(uation)?\b/i.test(label)) return "grad-night";
  return account.segment;
}

/** Every calendar month this instance of the occasion covers. */
function instanceMonths(
  parsed: ParsedOccasion,
  year: number,
): Array<{ year: number; month: number }> {
  const first = parsed.months[0] ?? parsed.anchorMonth;
  const last = parsed.months[parsed.months.length - 1] ?? first;
  const out: Array<{ year: number; month: number }> = [];
  let month = first;
  let cursor = year;
  for (let guard = 0; guard < 13; guard += 1) {
    out.push({ year: cursor, month });
    if (month === last) break;
    month += 1;
    if (month > 12) {
      month = 1;
      cursor += 1;
    }
  }
  return out;
}

/** Whether a signed line falls inside this instance of the occasion. */
function claims(line: BookLine, parsed: ParsedOccasion, year: number): boolean {
  const at = partsOf(line.eventDate);
  if (!at) return false;
  return instanceMonths(parsed, year).some(
    (m) => m.year === at.year && m.month === at.month,
  );
}

function instanceDate(parsed: ParsedOccasion, year: number): string {
  return isoOf(year, parsed.anchorMonth, parsed.anchorDay);
}

/**
 * The next instance of an occasion, skipping the ones already sold.
 *
 * THE SKIP IS THE WHOLE REASON THIS IS NOT ONE LINE. Team Kwon buys in
 * June and December and has signed 12 December 2026. Their next December
 * occasion is not December 2026, it is December 2027, and a board that
 * opened a window on an occasion the customer has already bought would
 * be sending a rep to sell something that is sitting in the book two
 * screens away. Heights Christian shows the other side of the same rule:
 * their signed event is 20 November, November is in none of their three
 * buying windows, so it claims nothing and their December occasion is
 * still live and still unsold. That asymmetry is the finding the board
 * exists to surface.
 */
function nextInstanceYear(
  parsed: ParsedOccasion,
  asOf: string,
  lines: BookLine[],
): number {
  const now = partsOf(asOf);
  let year = now ? now.year : new Date().getUTCFullYear();
  if (instanceDate(parsed, year) < asOf) year += 1;
  for (let guard = 0; guard < 8; guard += 1) {
    if (!lines.some((l) => claims(l, parsed, year))) break;
    year += 1;
  }
  return year;
}

export interface OccasionsRead {
  occasions: Occasion[];
  parse: BuyingWindowParse;
  /** Set where the buying window could not be read at all. */
  because: string | null;
}

/**
 * An account's occasions, read at render out of its prospect row.
 *
 * The cycle that comes back is DECLARED, and it says so on every surface
 * that renders it. It is read off a string somebody wrote about how an
 * organisation buys, which is a stated prior and honest about being one.
 * The moment two events have been delivered against the same occasion,
 * the median gap between them is an observed cycle, and swapping one for
 * the other is a change to `declaredCycleDays` and a provenance badge.
 * This application already draws exactly that distinction between a
 * price Main Event publishes and a price a person typed.
 */
export function occasionsFor(account: Account, asOf: string): OccasionsRead {
  const prospect = PROSPECT_BY_ID[account.prospectId];
  const profile = SEGMENT_PROFILE[account.segment];
  const parse = parseBuyingWindow(prospect?.buyingWindow ?? "", {
    occasionNoun: profile.occasionNoun,
  });

  if (parse.kind === "no-cycle-recorded") {
    return { occasions: [], parse, because: parse.because };
  }

  const lines = linesFor(account);
  const cycleDays = declaredCycleDays(parse.occasions.length);

  const occasions = parse.occasions.map<Occasion>((parsed) => {
    const segment = segmentForOccasion(account, parsed.label);
    const leads = SEGMENT_PROFILE[segment];
    const year = nextInstanceYear(parsed, asOf, lines);
    const date = instanceDate(parsed, year);
    return {
      id: `${account.id}:${String(parsed.anchorMonth).padStart(2, "0")}`,
      accountId: account.id,
      label: parsed.label,
      occasionClass: prospect?.occasionClass ?? "calendar-locked",
      cycleDays,
      cycleProvenance: "declared",
      cycleBasis: `buyingWindow: "${parse.source}"`,
      segment,
      planningLeadDays: leads.planningLeadDays,
      commitLeadDays: leads.commitLeadDays,
      nextOccasionDate: date,
      nextOccasionProvenance: "declared",
      anchorBasis:
        parsed.shape === "month-range"
          ? `Read from "${parsed.basisClause}". A range anchors on the last day of the first month it names.`
          : `Read from "${parsed.basisClause}". A single month anchors on day ${MID_MONTH_DAY}, the middle of it.`,
      lineIds: lines.filter((l) => claims(l, parsed, year)).map((l) => l.id),
    };
  });

  return { occasions, parse, because: null };
}

// ---------------------------------------------------------------
// Windows and traces
// ---------------------------------------------------------------

export function windowFor(
  occasion: Occasion,
  asOf: string,
  signedLineId: string | null,
): RebookingWindow {
  const opensOn = addDays(occasion.nextOccasionDate, -occasion.planningLeadDays);
  const closesOn = addDays(occasion.nextOccasionDate, -occasion.commitLeadDays);
  return {
    occasionId: occasion.id,
    accountId: occasion.accountId,
    occasionDate: occasion.nextOccasionDate,
    opensOn,
    closesOn,
    open: asOf >= opensOn && asOf <= closesOn,
    daysToOpen: daysBetween(asOf, opensOn),
    daysToClose: daysBetween(asOf, closesOn),
    signedLineId,
  };
}

/**
 * The five dated obligations around one anchor.
 *
 * OPERA's trace definition with the numbers filled in: a date field, a
 * signed offset, a purpose, an owner. Five rows come back for every
 * anchor, always, whether the anchor is a contract with a signature on
 * it or an occasion this application has projected out of a buying
 * window, and the `basis` field is what tells those two apart on screen.
 * A projected trace is arithmetic. A contracted one is a commitment.
 */
export function tracesFrom(
  anchorDate: string,
  asOf: string,
  meta: {
    accountId: string;
    basis: AccountTrace["basis"];
    anchorId: string;
    occasionLabel: string | null;
  },
): AccountTrace[] {
  return TRACE_ORDER.map<AccountTrace>((kind: TraceKind) => {
    const offsetDays = TRACE_OFFSET_DAYS[kind];
    const on = addDays(anchorDate, offsetDays);
    return {
      id: `${meta.anchorId}:${kind}`,
      accountId: meta.accountId,
      kind,
      on,
      anchorDate,
      offsetDays,
      basis: meta.basis,
      anchorId: meta.anchorId,
      occasionLabel: meta.occasionLabel,
      daysAway: daysBetween(asOf, on),
      due: on <= asOf,
    };
  });
}

// ---------------------------------------------------------------
// Window history: what closed, and what closed empty
// ---------------------------------------------------------------

export interface ClosedWindow {
  accountId: string;
  occasionId: string;
  occasionLabel: string;
  occasionDate: string;
  opensOn: string;
  closesOn: string;
  /** The signed line that closed it, where there was one. */
  signedLineId: string | null;
}

/**
 * Every window that opened and closed between two dates.
 *
 * Windows are not stored, so the history is reconstructed the same way
 * the future is: walk the years either side, place each instance, take
 * the two lead times off it. The board only counts windows from the date
 * the account existed, because a window that closed before this venue
 * had a customer is not a window anybody failed to work.
 */
function closedWindows(
  account: Account,
  from: string,
  to: string,
): ClosedWindow[] {
  const prospect = PROSPECT_BY_ID[account.prospectId];
  const profile = SEGMENT_PROFILE[account.segment];
  const parse = parseBuyingWindow(prospect?.buyingWindow ?? "", {
    occasionNoun: profile.occasionNoun,
  });
  if (parse.kind === "no-cycle-recorded") return [];

  const lines = linesFor(account);
  const fromYear = (partsOf(from)?.year ?? 2026) - 1;
  const toYear = (partsOf(to)?.year ?? 2026) + 1;

  const out: ClosedWindow[] = [];
  for (const parsed of parse.occasions) {
    const segment = segmentForOccasion(account, parsed.label);
    const leads = SEGMENT_PROFILE[segment];
    for (let year = fromYear; year <= toYear; year += 1) {
      const occasionDate = instanceDate(parsed, year);
      const closesOn = addDays(occasionDate, -leads.commitLeadDays);
      if (closesOn < from || closesOn > to) continue;
      const signed = lines.find((l) => claims(l, parsed, year));
      out.push({
        accountId: account.id,
        occasionId: `${account.id}:${String(parsed.anchorMonth).padStart(2, "0")}`,
        occasionLabel: parsed.label,
        occasionDate,
        opensOn: addDays(occasionDate, -leads.planningLeadDays),
        closesOn,
        signedLineId: signed?.id ?? null,
      });
    }
  }
  out.sort(byDate((w: ClosedWindow) => w.closesOn));
  return out;
}

/**
 * Windows that closed empty since the last delivered event.
 *
 * THIS IS THE CHURN EVENT AND IT IS DELIBERATELY DISCRETE. When a
 * customer buys once or twice a year, "N days have elapsed" is a reading
 * and not an event. What actually happened is that an occasion came
 * round, a window opened, it shut, and they spent the money somewhere
 * else. One of those is at risk. Two is lapsed. It is scale free, so it
 * works identically for a studio on a six month cycle and a grad night
 * on a twelve month one, and every count is falsifiable because every
 * missed window has a date on it.
 *
 * SINCE THE LAST DELIVERED EVENT, which is what makes the reading honest
 * on this board today. Nothing has been delivered, so no window can have
 * closed against a delivery, so no account can be at risk. The board
 * says exactly that rather than showing two green ticks it has not
 * earned.
 */
export function missedWindowsFor(
  account: Account,
  asOf: string,
  lastDeliveredOn: string | null,
): MissedWindow[] {
  if (!lastDeliveredOn) return [];
  return closedWindows(account, lastDeliveredOn, asOf)
    .filter((w) => w.signedLineId === null)
    .map<MissedWindow>((w) => ({
      accountId: w.accountId,
      occasionId: w.occasionId,
      occasionLabel: w.occasionLabel,
      closedOn: w.closesOn,
      occasionDate: w.occasionDate,
      /* Null rather than a guess. Sometimes nobody knows why, and a
         reason field that invents one is worse than an empty one. */
      reason: null,
    }));
}

// ---------------------------------------------------------------
// The conflict the board exists to find
// ---------------------------------------------------------------

export interface WindowConflict {
  accountId: string;
  accountName: string;
  occasionId: string;
  occasionLabel: string;
  opensOn: string;
  closesOn: string;
  eventLineId: string;
  eventDate: string;
  /** Days between the window shutting and the signed event running. */
  daysBefore: number;
  note: string;
}

/**
 * A window that shuts before an event the account has already signed.
 *
 * A SALES MANAGER LOOKING AT THE BOOK SEES ONE CONTRACT IN NOVEMBER. On
 * this board the same organisation has a second occasion whose window
 * closes six days before that contract is even delivered, which means
 * the sequence a person would naturally follow, run the event and then
 * ask for the next one, has already lost the December programme by the
 * time it starts. Nothing invented, no clever heuristic: two dates and a
 * subtraction. It is the sort of thing an anniversary model cannot find
 * because an anniversary model does not know the organisation holds
 * three occasions.
 */
export function windowConflicts(asOf: string): WindowConflict[] {
  const out: WindowConflict[] = [];
  for (const account of ACCOUNTS) {
    const prospect = PROSPECT_BY_ID[account.prospectId];
    const lines = linesFor(account);
    const { occasions } = occasionsFor(account, asOf);
    for (const occasion of occasions) {
      const signedLineId = occasion.lineIds[0] ?? null;
      const window = windowFor(occasion, asOf, signedLineId);
      if (window.closesOn < asOf) continue;
      for (const line of lines) {
        if (occasion.lineIds.includes(line.id)) continue;
        if (line.eventDate <= window.closesOn) continue;
        const daysBefore = daysBetween(window.closesOn, line.eventDate);
        out.push({
          accountId: account.id,
          accountName: prospect?.name ?? account.id,
          occasionId: occasion.id,
          occasionLabel: occasion.label,
          opensOn: window.opensOn,
          closesOn: window.closesOn,
          eventLineId: line.id,
          eventDate: line.eventDate,
          daysBefore,
          note: `Window closes ${daysBefore} days before the signed event on the same account.`,
        });
      }
    }
  }
  out.sort(byDate((c: WindowConflict) => c.closesOn));
  return out;
}

// ---------------------------------------------------------------
// The rows
// ---------------------------------------------------------------

export interface ContactReading {
  lastContactAt: string | null;
  /** Null where nobody has ever spoken to them. Never zero for that case. */
  days: number | null;
  staleness: Staleness | null;
  because: string | null;
}

export interface OccasionRow {
  occasion: Occasion;
  window: RebookingWindow;
  /** Exactly five, every time. */
  traces: AccountTrace[];
  signedLine: BookLine | null;
  conflicts: WindowConflict[];
}

export interface NextAction {
  label: string;
  on: string;
  daysAway: number;
  /** What the date came from, so the row can be clicked through. */
  kind: "trace" | "window-opens" | "window-closes" | "event";
  occasionLabel: string | null;
}

export interface AccountRow {
  account: Account;
  prospect: Prospect | null;
  /** Every signed line, oldest event first. */
  lines: BookLine[];
  /** Lines whose event date has passed. Empty until 21 November 2026. */
  deliveredLines: BookLine[];
  lastDeliveredOn: string | null;
  /** Signed value across the account's lines. The book's money, not new money. */
  contractedValue: number;
  signedOn: string | null;
  occasions: OccasionRow[];
  /** Five per contracted line. Four of them are obligations after the event. */
  traces: AccountTrace[];
  contact: ContactReading;
  purchase: PurchaseReading;
  missedWindows: MissedWindow[];
  state: AccountState;
  /** Why the state reads what it reads, in one line. */
  stateBecause: string;
  /** Set where the buying window could not be read. Null where it could. */
  noCycleBecause: string | null;
  nextAction: NextAction | null;
}

function purchaseReadingFor(
  lastDeliveredOn: string | null,
  cycleDays: number,
  asOf: string,
  firstEventDate: string | null,
): PurchaseReading {
  if (!lastDeliveredOn) {
    return {
      kind: "not-yet-delivered",
      because:
        "no event has been delivered, so there is no purchase recency to read",
      firstReadsOn: firstEventDate ? addDays(firstEventDate, 1) : null,
      cycleDays,
      cycleProvenance: "declared",
      cycleState: "not-yet-delivered",
    };
  }
  const daysSinceLast = Math.max(0, daysBetween(lastDeliveredOn, asOf));
  const overdueRatio = cycleDays > 0 ? daysSinceLast / cycleDays : 0;
  return {
    kind: "measured",
    lastDeliveredOn,
    daysSinceLast,
    cycleDays,
    cycleProvenance: "declared",
    overdueRatio,
    cycleState: cycleStateOf(overdueRatio),
  };
}

/**
 * The account state, which is NOT contact staleness folded in.
 *
 * The two readings stay two. `partners.ts` can put days since contact
 * straight into its one bucket because for a supplier the two absences
 * are the same absence; for a customer they come apart, and a board that
 * blends them produces the worst of both. There is also a concrete
 * failure behind the rule: Heights Christian's last recorded contact is
 * mid September, so a blended state would have read AT RISK on the
 * clock alone from mid November, and the first event this venue ever
 * delivers, on 20 November, would have arrived on a board already
 * painted amber for a reason that has nothing to do with delivery. The
 * two readings sit side by side on the card instead, and the reader
 * combines them, which is a thing a reader is good at.
 */
function stateOf(
  missed: number,
  windowOpen: boolean,
  delivered: boolean,
): { state: AccountState; because: string } {
  if (missed >= 2) {
    return {
      state: "lapsed",
      because: `${missed} windows closed with nothing signed`,
    };
  }
  if (missed === 1) {
    return { state: "at-risk", because: "one window closed with nothing signed" };
  }
  if (windowOpen) {
    return { state: "window-open", because: "a rebooking window is open today" };
  }
  if (delivered) {
    return { state: "delivered", because: "an event has been delivered" };
  }
  return {
    state: "awaiting-delivery",
    because: "signed, and the event has not run yet",
  };
}

function nextActionFor(
  rows: OccasionRow[],
  traces: AccountTrace[],
  lines: BookLine[],
  asOf: string,
): NextAction | null {
  const candidates: NextAction[] = [];
  for (const trace of traces) {
    candidates.push({
      label: TRACE_META[trace.kind].label,
      on: trace.on,
      daysAway: trace.daysAway,
      kind: "trace",
      occasionLabel: trace.occasionLabel,
    });
  }
  for (const row of rows) {
    candidates.push({
      label: "Window opens",
      on: row.window.opensOn,
      daysAway: row.window.daysToOpen,
      kind: "window-opens",
      occasionLabel: row.occasion.label,
    });
    candidates.push({
      label: "Window closes",
      on: row.window.closesOn,
      daysAway: row.window.daysToClose,
      kind: "window-closes",
      occasionLabel: row.occasion.label,
    });
  }
  for (const line of lines) {
    candidates.push({
      label: "Event",
      on: line.eventDate,
      daysAway: daysBetween(asOf, line.eventDate),
      kind: "event",
      occasionLabel: null,
    });
  }
  const ahead = candidates
    .filter((c) => c.on >= asOf)
    .sort(byDate((c: NextAction) => c.on));
  return ahead[0] ?? null;
}

/**
 * Every account as a row, most exposed first.
 *
 * The order is not alphabetical and it is not by value. It is by state,
 * worst first, and then by the date of the next thing that has to
 * happen. A register sorted by name looks like a directory and hides the
 * row that needs a phone call, which is the argument `partners.ts`
 * already makes and wins.
 */
export function accountRows(asOf: string): AccountRow[] {
  const firstEventDate = firstDeliveryDate();

  const rows = ACCOUNTS.map<AccountRow>((account) => {
    const prospect = PROSPECT_BY_ID[account.prospectId] ?? null;
    const lines = linesFor(account);
    const deliveredLines = lines.filter((l) => l.eventDate < asOf);
    const lastDeliveredOn =
      deliveredLines.length > 0
        ? (deliveredLines[deliveredLines.length - 1]?.eventDate ?? null)
        : null;

    const read = occasionsFor(account, asOf);
    const conflicts = windowConflicts(asOf).filter(
      (c) => c.accountId === account.id,
    );

    const occasionRows = read.occasions.map<OccasionRow>((occasion) => {
      const signedLineId = occasion.lineIds[0] ?? null;
      const signedLine = signedLineId
        ? (lines.find((l) => l.id === signedLineId) ?? null)
        : null;
      const window = windowFor(occasion, asOf, signedLineId);
      return {
        occasion,
        window,
        traces: tracesFrom(signedLine?.eventDate ?? occasion.nextOccasionDate, asOf, {
          accountId: account.id,
          basis: signedLine ? "contracted-event" : "projected-occasion",
          anchorId: signedLine ? signedLine.id : occasion.id,
          occasionLabel: occasion.label,
        }),
        signedLine,
        conflicts: conflicts.filter((c) => c.occasionId === occasion.id),
      };
    });

    const traces = lines.flatMap((line) =>
      tracesFrom(line.eventDate, asOf, {
        accountId: account.id,
        basis: "contracted-event",
        anchorId: line.id,
        occasionLabel: null,
      }),
    );

    const lastContactAt = lastContactFor(account);
    /* Clamped at zero exactly as partnerRows does. The seed's
       correspondence is dated a few weeks ahead of the wall clock, and a
       negative day count would render as a relationship worked in the
       future, which is nonsense a reader would have to unpick. */
    const contactDays =
      lastContactAt === null
        ? null
        : Math.max(0, daysBetween(lastContactAt, asOf));

    const cycleDays =
      read.occasions[0]?.cycleDays ?? declaredCycleDays(read.occasions.length);
    const purchase = purchaseReadingFor(
      lastDeliveredOn,
      cycleDays,
      asOf,
      firstEventDate,
    );
    const missedWindows = missedWindowsFor(account, asOf, lastDeliveredOn);
    const { state, because } = stateOf(
      missedWindows.length,
      occasionRows.some((r) => r.window.open),
      deliveredLines.length > 0,
    );

    return {
      account,
      prospect,
      lines,
      deliveredLines,
      lastDeliveredOn,
      contractedValue: lines.reduce((sum, l) => sum + lineValue(l), 0),
      signedOn: signedOnFor(account),
      occasions: occasionRows,
      traces,
      contact: {
        lastContactAt,
        days: contactDays,
        staleness: contactDays === null ? null : stalenessOf(contactDays),
        because:
          lastContactAt === null
            ? "no correspondence is recorded against this organisation"
            : null,
      },
      purchase,
      missedWindows,
      state,
      stateBecause: because,
      noCycleBecause: read.because,
      nextAction: nextActionFor(occasionRows, traces, lines, asOf),
    };
  });

  rows.sort((a, b) => {
    const bySeverity =
      ACCOUNT_STATE_ORDER.indexOf(a.state) - ACCOUNT_STATE_ORDER.indexOf(b.state);
    if (bySeverity !== 0) return bySeverity;
    const aOn = a.nextAction?.on ?? "9999-12-31";
    const bOn = b.nextAction?.on ?? "9999-12-31";
    return aOn < bOn ? -1 : aOn > bOn ? 1 : 0;
  });
  return rows;
}

// ---------------------------------------------------------------
// The twelve month clock
// ---------------------------------------------------------------

export interface ClockRow {
  accountId: string;
  accountName: string;
  occasionId: string;
  occasionLabel: string;
  segment: AccountSegment;
  window: RebookingWindow;
  /** The delivered or contracted event on this occasion, where there is one. */
  eventDate: string | null;
  eventLineId: string | null;
  planningLeadDays: number;
  commitLeadDays: number;
  cycleDays: number;
  cycleProvenance: "declared" | "observed";
  conflicts: WindowConflict[];
}

/**
 * One row per occasion, dated, for the month axis at the middle of the
 * screen.
 *
 * THIS IS THE ELEMENT THAT MAKES THE PAGE NON EMPTY ON DAY ONE. Two
 * organisations produce five rows, because an account holds occasions
 * and a book holds events, and the whole argument for the account level
 * is that one organisation buys several different things on several
 * different clocks. Every label on it is read out of a `buyingWindow`
 * string and every date on it is arithmetic from a stated lead time.
 * Nothing on this clock was typed by anybody.
 */
export function clockRows(asOf: string): ClockRow[] {
  const out: ClockRow[] = [];
  for (const row of accountRows(asOf)) {
    for (const occasionRow of row.occasions) {
      out.push({
        accountId: row.account.id,
        accountName: row.prospect?.name ?? row.account.id,
        occasionId: occasionRow.occasion.id,
        occasionLabel: occasionRow.occasion.label,
        segment: occasionRow.occasion.segment,
        window: occasionRow.window,
        eventDate: occasionRow.signedLine?.eventDate ?? null,
        eventLineId: occasionRow.signedLine?.id ?? null,
        planningLeadDays: occasionRow.occasion.planningLeadDays,
        commitLeadDays: occasionRow.occasion.commitLeadDays,
        cycleDays: occasionRow.occasion.cycleDays,
        cycleProvenance: occasionRow.occasion.cycleProvenance,
        conflicts: occasionRow.conflicts,
      });
    }
  }
  out.sort(byDate((r: ClockRow) => r.window.opensOn));
  return out;
}

// ---------------------------------------------------------------
// The four figures
// ---------------------------------------------------------------

/** The earliest contracted event across the whole book. */
export function firstDeliveryDate(): string | null {
  const dates = SEED_BOOK.map((l) => l.eventDate).sort();
  return dates[0] ?? null;
}

/** Every window that has closed since each account signed. */
function allClosedWindows(asOf: string): ClosedWindow[] {
  const out: ClosedWindow[] = [];
  for (const account of ACCOUNTS) {
    const from = signedOnFor(account);
    if (!from) continue;
    out.push(...closedWindows(account, from, asOf));
  }
  return out.sort(byDate((w: ClosedWindow) => w.closesOn));
}

/** The next window due to close, whether or not any has closed yet. */
function nextWindowClose(asOf: string): string | null {
  const dates: string[] = [];
  for (const row of clockRows(asOf)) {
    if (row.window.closesOn >= asOf) dates.push(row.window.closesOn);
  }
  dates.sort();
  return dates[0] ?? null;
}

/**
 * Rebooking rate. The one figure on this board a manager controls.
 *
 * Windows closed with a signature over windows closed. Every other
 * retention number here is an outcome: repeat client rate moves when the
 * food is good and when a coordinator leaves, and a sales manager
 * controls neither directly. This one has a denominator they create by
 * identifying occasions and a numerator they create by working the
 * window, which is exactly the split `/coaching` already argues for
 * between activity, which is coached, and revenue, which is managed.
 *
 * On day one the denominator is zero and the tile says so with a date
 * on it. A zero denominator is not nought per cent. Nought per cent
 * would mean every window was missed.
 */
export function rebookingRate(asOf: string): AccountMetric {
  const closed = allClosedWindows(asOf);
  const signed = closed.filter((w) => w.signedLineId !== null).length;
  const firstClose = nextWindowClose(asOf);
  return {
    id: "rebooking-rate",
    label: "Rebooking rate",
    formula: "windows closed with a signature / windows closed",
    figure: figureOf(signed, closed.length, "no window has closed yet"),
    unit: "share",
    firstReadsOn: closed.length > 0 ? null : firstClose,
    firstReadsNote:
      closed.length > 0
        ? "Reading now."
        : "First window closes on this date, which is when this figure gets a denominator.",
    provenance: "modeled",
    source:
      "This application's own definition, argued in the retention research. No source publishes a rebooking rate benchmark for event venues; Tripleseat's own benchmarking guide names repeat business as a metric and supplies no number for it.",
  };
}

/**
 * Accounts inside their own cycle, over live accounts.
 *
 * The one tile with a denominator today, and it reads two of two, which
 * is true and unimpressive and exactly what a board with two accounts
 * and no deliveries should say. An account awaiting its first delivery
 * is on cycle because nothing is due from it yet.
 */
export function accountsOnCycle(asOf: string): AccountMetric {
  const rows = accountRows(asOf);
  const live = rows.filter((r) => r.state !== "lapsed");
  const onCycle = live.filter(
    (r) =>
      r.state !== "at-risk" &&
      r.purchase.cycleState !== "overdue" &&
      r.purchase.cycleState !== "lapsed",
  ).length;
  return {
    id: "accounts-on-cycle",
    label: "Accounts on cycle",
    formula: "accounts inside their own cycle / live accounts",
    figure: figureOf(onCycle, live.length, "there are no live accounts"),
    unit: "count",
    firstReadsOn: null,
    firstReadsNote: "Reading now.",
    provenance: "modeled",
    source:
      "Cycle boundaries at 0.75, 1.00 and 1.25 of each account's own declared cycle. This application's own thresholds, printed on screen beside the figure.",
  };
}

/**
 * Revenue retained. ChartMogul's gross retention formula, event revenue
 * standing in for monthly recurring revenue.
 *
 * SAY IT ON THE TILE: THIS IS NOT NEW MONEY. It is the same `BookLine`
 * revenue `/book` already counts, viewed down a second axis, and it
 * answers one question: of the money organisations spent with us last
 * year, how much came back from those same organisations this year. The
 * twelve month window is not a convention here, it is forced. With an
 * annual purchase cycle any shorter window measures seasonality.
 */
export function revenueRetained(asOf: string): AccountMetric {
  const priorFrom = addDays(asOf, -730);
  const priorTo = addDays(asOf, -365);
  const rows = accountRows(asOf);

  let priorYear = 0;
  let trailing = 0;
  for (const row of rows) {
    const prior = row.lines.filter(
      (l) => l.eventDate >= priorFrom && l.eventDate < priorTo,
    );
    if (prior.length === 0) continue;
    priorYear += prior.reduce((sum, l) => sum + lineValue(l), 0);
    trailing += row.lines
      .filter((l) => l.eventDate >= priorTo && l.eventDate < asOf)
      .reduce((sum, l) => sum + lineValue(l), 0);
  }

  const first = firstDeliveryDate();
  return {
    id: "revenue-retained",
    label: "Revenue retained",
    formula:
      "trailing twelve months from last year's accounts / what those same accounts spent then",
    figure: figureOf(
      trailing,
      priorYear,
      "no account has a prior twelve months to be compared against",
    ),
    unit: "share",
    firstReadsOn: first ? addDays(first, 366) : null,
    firstReadsNote:
      "A full year after the first delivery, which is the first day a prior twelve months exists at all.",
    provenance: "modeled",
    source:
      "ChartMogul's gross revenue retention formula with trailing twelve month event revenue in place of monthly recurring revenue. The SaaS benchmarks on that page do not transfer to a venue and are not quoted here.",
  };
}

/**
 * Events per account per year. The expansion figure.
 *
 * The one that makes the account level pay for itself: a school that
 * buys grad night is worth one event and a school that buys grad night,
 * two banquets and a staff appreciation day is worth four, off the same
 * relationship and the same single go-see.
 */
export function eventsPerAccountPerYear(asOf: string): AccountMetric {
  const from = addDays(asOf, -365);
  const rows = accountRows(asOf);
  let events = 0;
  let accounts = 0;
  for (const row of rows) {
    const delivered = row.lines.filter(
      (l) => l.eventDate >= from && l.eventDate < asOf,
    );
    if (delivered.length === 0) continue;
    events += delivered.length;
    accounts += 1;
  }
  const first = firstDeliveryDate();
  return {
    id: "events-per-account",
    label: "Events per account",
    formula:
      "events delivered in the trailing twelve months / accounts delivering in them",
    figure: figureOf(events, accounts, "no event has been delivered"),
    unit: "count",
    firstReadsOn: first ? addDays(first, 1) : null,
    firstReadsNote:
      "The day after the first event is delivered, which is the first day this figure has a numerator.",
    provenance: "modeled",
    source:
      "This application's own definition. Tripleseat's benchmarking guide advises at least twelve months of event records before comparing anything, which is a fair description of where this venue stands.",
  };
}

export function accountMetrics(asOf: string): AccountMetric[] {
  return [
    rebookingRate(asOf),
    accountsOnCycle(asOf),
    revenueRetained(asOf),
    eventsPerAccountPerYear(asOf),
  ];
}

/** Live count against every state, including the ones nothing is in. */
export function accountStateCounts(asOf: string): Record<AccountState, number> {
  const out: Record<AccountState, number> = {
    "awaiting-delivery": 0,
    delivered: 0,
    "window-open": 0,
    "at-risk": 0,
    lapsed: 0,
  };
  for (const row of accountRows(asOf)) out[row.state] += 1;
  return out;
}

// ---------------------------------------------------------------
// The parse, audited across the whole trade area
// ---------------------------------------------------------------

export interface BuyingWindowAuditRow {
  prospectId: string;
  name: string;
  source: string;
  parse: BuyingWindowParse;
  occasionCount: number;
  /** Set where the string could not be read into a cycle. */
  because: string | null;
}

/**
 * Every `buyingWindow` in the trade area, read and reported.
 *
 * Two hundred and eleven rows carry one of these strings and the board
 * only uses two of them today. The audit exists because the other two
 * hundred and nine are the moment this model meets data it was not
 * designed against, and the right time to find out that a string does not
 * parse is now, in a script, rather than on the day somebody signs a boba
 * franchise. Every row comes back either as occasions or as a stated
 * reason, and nothing throws.
 */
export function buyingWindowAudit(): BuyingWindowAuditRow[] {
  return PROSPECTS.map<BuyingWindowAuditRow>((prospect: Prospect) => {
    const parse = parseBuyingWindow(prospect.buyingWindow, {
      occasionNoun: "Occasion",
    });
    return {
      prospectId: prospect.id,
      name: prospect.name,
      source: prospect.buyingWindow,
      parse,
      occasionCount: parse.kind === "parsed" ? parse.occasions.length : 0,
      because: parse.kind === "no-cycle-recorded" ? parse.because : null,
    };
  });
}

// ---------------------------------------------------------------
// One entry point for the screen
// ---------------------------------------------------------------

export interface AccountBoard {
  asOf: string;
  rows: AccountRow[];
  clock: ClockRow[];
  conflicts: WindowConflict[];
  metrics: AccountMetric[];
  stateCounts: Record<AccountState, number>;
  /** The first contracted event, which is the date this board comes alive. */
  firstDeliveryOn: string | null;
  /** Days until that event. Negative once it has run. */
  daysToFirstDelivery: number | null;
  /** Dated obligations from contracts, excluding the day of the event itself. */
  postEventObligations: AccountTrace[];
}

/**
 * The whole board in one call, computed against one clock.
 *
 * Every figure on the screen has to be arithmetic against the same
 * `asOf` or two tiles will disagree by a day and a reader will be right
 * not to trust either.
 */
export function accountBoard(asOf: string): AccountBoard {
  const rows = accountRows(asOf);
  const first = firstDeliveryDate();
  return {
    asOf,
    rows,
    clock: clockRows(asOf),
    conflicts: windowConflicts(asOf),
    metrics: accountMetrics(asOf),
    stateCounts: accountStateCounts(asOf),
    firstDeliveryOn: first,
    daysToFirstDelivery: first ? daysBetween(asOf, first) : null,
    postEventObligations: rows
      .flatMap((r) => r.traces)
      .filter((t) => t.offsetDays !== 0)
      .sort(byDate((t: AccountTrace) => t.on)),
  };
}

/** Re-exported so a screen has one import for the whole reading. */
export type { AccountFigure, AccountState, AccountTrace, MissedWindow };
