import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { Link } from "react-router-dom";
import type { Prospect } from "@/domain/types";
import { LANE_META, lanesForGuests, GUESTS_PER_BOWLING_LANE } from "@/domain/lanes";
import { PACKAGE_BY_ID } from "@/data/packages";
import { DEMO_RECIPIENT, PERIOD_BY_ID, VENUE, OFFER_BY_ID } from "@/data/venue";
import { useSound } from "@/state/SoundProvider";
import { quoteLink } from "@/lib/links";
import {
  isSendable,
  leagueTemplatesFor,
  packagesForProspect,
  promoTemplatesFor,
  quoteLinkPostscript,
  reservePartyTemplate,
  templatesFor,
  withQuoteLink,
  type EmailTemplate,
  type LeagueContext,
  type LeagueIntent,
} from "@/lib/email/templates";
import {
  copyText,
  letterAsText,
  mailtoPlan,
  MAILTO_SAFE_LIMIT,
  resendRequest,
  resendRequestPreview,
} from "@/lib/email/send";
import { usePipeline, usePipelineDispatch } from "@/state/PipelineProvider";
import { touchCount, useOutbox, useOutboxDispatch, type OutboxState } from "@/state/OutboxProvider";
import { LaneChip } from "@/components/primitives/LaneChip";
import { FamilyChip } from "@/components/primitives/FamilyChip";
import { PackageGlyph } from "@/components/primitives/PackageGlyph";
import { EmailConfidenceChip } from "@/components/primitives/StatusChip";
import { Figure, ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { Button } from "@/components/primitives/Button";
import styles from "./EmailComposeModal.module.css";

/**
 * THE COMPOSE WINDOW. THE ONE SCREEN IN THIS APP WHERE A REP ACTUALLY
 * DOES THE JOB.
 *
 * Everything else here is preparation. The desk decides who to write to,
 * the map decides where they are, the lane board decides why they buy.
 * This is where somebody writes the words, and it is therefore the screen
 * that has to survive the most contact with reality.
 *
 * ── A SPLIT, BECAUSE THE LETTER IS THE POINT ───────────────────────
 * This used to be one column: a picker, a recipient block, four lines of
 * prose about a reserved domain, and then, below the fold, the draft.
 * The single most important object in the window was the one thing a
 * reader could not see, so the intent was chosen on faith and the words
 * were discovered afterwards by scrolling. That is backwards.
 *
 * So: controls on the left, the letter on the right, and the letter is
 * already written the moment the window opens. Every control on the left
 * rewrites the right in place with no submit step, which is what makes
 * the picker legible. A reader does not have to know what "featured
 * promo" means, because pressing it shows them.
 *
 * The letter is drawn as a letter rather than as a form field: a lit
 * cream panel with dark ink on it, a subject line set as a subject line,
 * and a body in a comfortable measure. It is fully editable, and that is
 * where the old "write it yourself" intent went. Typing in the letter IS
 * writing it yourself; a mode for it was a mode for using a text box.
 *
 * ── THREE ACTIONS, AND ONLY ONE OF THEM IS A LIE IF IT IS FAKED ────
 * Open to send hands the letter to the reader's own mail client through a
 * `mailto:`, which is the one route in a static build where a real
 * published address is safe, because a person reads the message before
 * anything goes. Copy puts it on the clipboard and says so out loud.
 * Send via Resend is present, disabled, and explains itself: there is no
 * server here to hold an API key, the request it would post is on the
 * disclosure beside it, and a fake success toast would be worth less than
 * the truth.
 *
 * ── WHAT CANNOT BE CHANGED, AND WHY THAT IS THE POINT ──────────────
 * Send to the outbox writes a row whose recipient is forced to
 * DEMO_RECIPIENT inside the outbox reducer, not chosen here. That forcing
 * is the no transport guarantee and nothing in this rewrite weakens it.
 * The `mailto:` is the single exception and it is safe for the opposite
 * reason: it sends nothing at all, it opens a window a human then presses
 * send in. Where an organisation publishes no address, it is not offered.
 */

// ---------------------------------------------------------------
// The contract other agents build against
// ---------------------------------------------------------------

/**
 * The intents a caller can arrive with.
 *
 * "free" is kept because pages outside this folder still pass it, and it
 * now resolves to the lane's own drafts with the letter open for editing,
 * which is what it always meant. It is not offered in the picker, because
 * a mode whose only behaviour is "the text box works" is not a mode.
 */
export type ComposeIntent =
  | "outreach"
  | "featured-promo"
  | "reserve-party"
  | "free"
  | LeagueIntent;

export interface EmailComposeModalProps {
  /** The organisation being written to. The modal closes when this is null. */
  prospect: Prospect | null;
  /**
   * What the rep set out to do. Left undefined, the window picks per
   * organisation rather than opening on an arbitrary default.
   */
  intent?: ComposeIntent;
  /** Optional package to anchor a promo or a hold against. */
  packageId?: string;
  /** Optional draft to open on, by id, where a caller knows which one. */
  templateId?: string;
  /** Set by the leagues surface. Turns the fourth intent group on. */
  league?: LeagueContext;
  onClose: () => void;
}

/** Everything a caller needs to open this window. */
export interface ComposeRequest {
  prospect: Prospect;
  intent?: ComposeIntent;
  packageId?: string;
  templateId?: string;
  league?: LeagueContext;
}

/**
 * THE WAY TO OPEN THIS WINDOW FROM ANYWHERE.
 *
 * One modal, one instance, one owner is the rule every surface in this
 * app already follows: a page holds the state and renders exactly one
 * copy, and the rows inside it raise a request rather than rendering
 * their own. Two copies trap focus in whichever one the browser reaches
 * first, and a copy rendered inside a popup is unmounted the moment the
 * popup closes underneath it.
 *
 * This hook is that pattern with the boilerplate removed. A page calls
 * it once, spreads `props` onto a single `EmailComposeModal`, and every
 * button on the page calls `open` with an organisation and whatever
 * context it has.
 */
export function useComposeModal(): {
  open: (request: ComposeRequest) => void;
  close: () => void;
  props: EmailComposeModalProps;
} {
  const [request, setRequest] = useState<ComposeRequest | null>(null);
  const close = useCallback(() => setRequest(null), []);
  const open = useCallback((next: ComposeRequest) => setRequest(next), []);

  return useMemo(
    () => ({
      open,
      close,
      props: {
        prospect: request?.prospect ?? null,
        intent: request?.intent,
        packageId: request?.packageId,
        templateId: request?.templateId,
        league: request?.league,
        onClose: close,
      },
    }),
    [request, open, close],
  );
}

type ComposeState = "composing" | "sending" | "sent" | "failed";

/**
 * The intents offered in the picker, each with a glyph, a word and a
 * sentence.
 *
 * Never colour alone, and here not even colour first. The cards are
 * distinguishable in greyscale by their mark and their label, and the one
 * line under each says what the intent DOES rather than what it is
 * called, because "featured promo" means nothing to somebody reading it
 * for the first time on a Monday.
 */
const INTENT_META: Record<
  Exclude<ComposeIntent, "free">,
  { glyph: string; label: string; what: string }
> = {
  outreach: {
    glyph: "▭",
    label: "First touch",
    what: "The opening letter, written the way this lane buys.",
  },
  "featured-promo": {
    glyph: "◆",
    label: "Featured promo",
    what: "One published package and the offer behind it.",
  },
  "reserve-party": {
    glyph: "◕",
    label: "Hold a date",
    what: "First pick of the opening calendar, in writing, at no cost.",
  },
  "league-enquiry": {
    glyph: "◇",
    label: "League enquiry",
    what: "What is published about leagues, and what is not.",
  },
  "league-join": {
    glyph: "◈",
    label: "Join a league",
    what: "Ask for a place in one that is welcoming joiners.",
  },
  "league-team": {
    glyph: "▤",
    label: "Register a team",
    what: "A named team and its bowlers, put down in writing.",
  },
  "league-new": {
    glyph: "◉",
    label: "Start a league",
    what: "Form one around this organisation rather than join one.",
  },
};

const CORE_INTENTS: ComposeIntent[] = ["outreach", "featured-promo", "reserve-party"];
const LEAGUE_INTENTS: LeagueIntent[] = [
  "league-enquiry",
  "league-join",
  "league-team",
  "league-new",
];

function isLeagueIntent(intent: ComposeIntent): intent is LeagueIntent {
  return (LEAGUE_INTENTS as string[]).includes(intent);
}

/**
 * WHICH INTENT THE WINDOW OPENS ON WHEN NOBODY SAID.
 *
 * The old default was "outreach" for everybody, which is right about
 * three quarters of the time and wrong in the one case that matters most:
 * an organisation already mid conversation, where a first touch draft is
 * the message they have already had.
 *
 * The rule reads only facts this window already holds, so there is no new
 * source of truth to keep in step. A caller carrying a package meant a
 * package, which is a promo. An organisation with written touches behind
 * it is past the opening and into arranging something, which is a hold.
 * Everything else is a first touch, including every organisation with no
 * written door, because the reception script lives under that intent and
 * is the honest opening for a go-see.
 */
export function defaultIntentFor(
  prospect: Prospect,
  outbox: OutboxState,
  packageId?: string,
): ComposeIntent {
  if (packageId) return "featured-promo";
  if (prospect.emailConfidence !== "verified_public") return "outreach";
  return touchCount(outbox, prospect.id) >= 1 ? "reserve-party" : "outreach";
}

/**
 * The focus trap's idea of what can be focused.
 *
 * Requeried on every Tab rather than cached on open, because the intent
 * picker, the package list and the state changes all add and remove
 * controls while the window is open. A cached list is a trap that leaks
 * the moment the reader changes anything.
 */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

function focusablesIn(root: HTMLElement): HTMLElement[] {
  const all = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
  const radios = all.filter(
    (el): el is HTMLInputElement =>
      el instanceof HTMLInputElement && el.type === "radio",
  );

  return all.filter((el) => {
    if (el.getAttribute("aria-hidden") === "true") return false;
    /* offsetParent is null only for a display:none subtree here, which
       is the cheapest reliable visibility test in a dialog that never
       positions a control fixed. */
    if (el.offsetParent === null) return false;

    /*
      A radio group is ONE tab stop, not five. The browser already knows
      this and moves between the members with the arrow keys; a trap that
      treated every radio as a stop would wrap the reader onto an
      unchecked option and silently change their intent on the way past.
    */
    if (el instanceof HTMLInputElement && el.type === "radio") {
      const group = radios.filter((r) => r.name === el.name);
      const checked = group.find((r) => r.checked);
      return checked ? checked === el : group[0] === el;
    }
    return true;
  });
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function words(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

/** Today, as an ISO calendar day, for the earliest date a hold can name. */
function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------
// The outer component. Hooks live one level down, deliberately.
// ---------------------------------------------------------------

/**
 * Null prospect means no window, and that is the whole of this function.
 *
 * The hooks all sit in the inner component so that closing genuinely
 * UNMOUNTS the dialog. That is not a tidiness point: the focus return,
 * the body scroll restore and the send timer are all cleanup, and
 * cleanup that only runs when a boolean flips is cleanup that eventually
 * does not run. The key remounts the whole thing when the reader opens a
 * different organisation or arrives with a different intent, so a draft
 * for one school can never be shown under another school's name.
 */
export function EmailComposeModal({
  prospect,
  intent,
  packageId,
  templateId,
  league,
  onClose,
}: EmailComposeModalProps): JSX.Element | null {
  if (!prospect) return null;
  return (
    <ComposeDialog
      key={`${prospect.id}:${intent ?? "auto"}:${league?.leagueName ?? ""}`}
      prospect={prospect}
      requestedIntent={intent}
      initialPackageId={packageId}
      initialTemplateId={templateId}
      league={league}
      onClose={onClose}
    />
  );
}

// ---------------------------------------------------------------
// The dialog
// ---------------------------------------------------------------

function ComposeDialog({
  prospect,
  requestedIntent,
  initialPackageId,
  initialTemplateId,
  league,
  onClose,
}: {
  prospect: Prospect;
  requestedIntent?: ComposeIntent;
  initialPackageId?: string;
  initialTemplateId?: string;
  league?: LeagueContext;
  onClose: () => void;
}) {
  const pipeline = usePipeline();
  const pipelineDispatch = usePipelineDispatch();
  const outbox = useOutbox();
  const outboxDispatch = useOutboxDispatch();
  const { play } = useSound();

  const dialogRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const announceTimer = useRef<number | undefined>(undefined);
  const noticeTimer = useRef<number | undefined>(undefined);
  const announcedOnce = useRef(false);

  /*
    Resolved once, on mount, and never recomputed. The rule reads the
    outbox, and sending writes to the outbox, so a live default would
    change the reader's intent underneath them at the exact moment they
    pressed send.
  */
  const [intent, setIntent] = useState<ComposeIntent>(() => {
    /* "free" is a caller's word for "open the lane's own draft and let me
       type", which is what First touch already does now that the letter
       is editable. Normalising it here means the picker always has a card
       lit rather than showing an intent nobody can select. */
    if (requestedIntent && requestedIntent !== "free") return requestedIntent;
    if (requestedIntent === "free") return "outreach";
    return defaultIntentFor(prospect, outbox, initialPackageId);
  });
  const [templateId, setTemplateId] = useState<string | null>(initialTemplateId ?? null);
  const [packageId, setPackageId] = useState<string | undefined>(
    initialPackageId ?? prospect.leadPackageId,
  );
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [dirty, setDirty] = useState(false);
  const [attachQuote, setAttachQuote] = useState(false);
  const [holdDate, setHoldDate] = useState("");
  const [guests, setGuests] = useState(
    Math.round((prospect.headcountLow + prospect.headcountHigh) / 2),
  );
  const [state, setState] = useState<ComposeState>("composing");
  const [failure, setFailure] = useState<string | null>(null);
  /** The one aria-live line the letter's actions speak through. */
  const [notice, setNotice] = useState("");
  /** The debounced announcement of a rewritten letter. Separate on purpose. */
  const [draftAnnounce, setDraftAnnounce] = useState("");
  const [pending, setPending] = useState<
    | null
    | { kind: "switch"; intent: ComposeIntent; templateId: string | null; packageId?: string }
    | { kind: "close" }
  >(null);

  const lane = LANE_META[prospect.lane];
  const hasWrittenDoor = prospect.emailConfidence === "verified_public" && !!prospect.email;

  // -------------------------------------------------------------
  // The drafts for the current intent
  // -------------------------------------------------------------

  const ctx = useMemo(
    () => ({
      openingStatus: VENUE.openingStatus,
      weeksToOpen: PERIOD_BY_ID[pipeline.periodId]?.weeksToOpen,
      touches: touchCount(outbox, prospect.id),
    }),
    [pipeline.periodId, outbox, prospect.id],
  );

  const drafts: EmailTemplate[] = useMemo(() => {
    if (isLeagueIntent(intent)) {
      return league ? leagueTemplatesFor(prospect, intent, league) : [];
    }
    if (intent === "reserve-party") {
      return [
        reservePartyTemplate(prospect, {
          ...ctx,
          date: holdDate || undefined,
          guests,
          packageId,
        }),
      ];
    }
    if (intent === "featured-promo") return promoTemplatesFor(prospect, ctx);
    return templatesFor(prospect, ctx);
  }, [intent, prospect, ctx, holdDate, guests, packageId, league]);

  const template =
    drafts.find((d) => d.id === templateId) ?? (drafts.length > 0 ? drafts[0] : null);

  const fit = useMemo(() => packagesForProspect(prospect), [prospect]);
  const needsPackage = intent === "featured-promo" || intent === "reserve-party";
  const chosenPackage = packageId ? PACKAGE_BY_ID[packageId] : undefined;
  const offer = template?.offerId ? OFFER_BY_ID[template.offerId] : undefined;

  /**
   * Seeding, and the one rule that keeps it from eating anybody's work.
   *
   * The draft flows into the two fields whenever the draft changes AND
   * the reader has not typed anything. The moment they have, this stops
   * entirely and the only way to overwrite their words is a button they
   * press themselves. A composer that silently replaces a paragraph
   * somebody wrote is a composer people stop trusting after exactly one
   * occurrence.
   */
  useEffect(() => {
    if (!template || dirty) return;
    setSubject(template.subject);
    setBody(template.body);
  }, [template?.subject, template?.body, dirty]);

  /**
   * THE LETTER REWRITES ITSELF, AND SAYS SO ONCE.
   *
   * A live region wired straight to the letter would speak on every
   * keystroke, which is not an announcement, it is a barrier. So this
   * fires on the DRAFT changing rather than on the text changing, it is
   * debounced past the run of state updates that a single click through
   * the picker produces, and it says which draft landed rather than
   * reading the letter out. The letter itself is a labelled text box the
   * reader can go and read whenever they want.
   */
  useEffect(() => {
    if (!template || dirty) return;
    window.clearTimeout(announceTimer.current);
    const label = template.label;
    /* The first draft is not a rewrite, it is the window opening, and the
       dialog's own name is already being read at that moment. */
    const first = !announcedOnce.current;
    announcedOnce.current = true;
    announceTimer.current = window.setTimeout(() => {
      setDraftAnnounce(first ? "" : `Letter rewritten. ${label}.`);
    }, 500);
    return () => window.clearTimeout(announceTimer.current);
  }, [template?.id, template?.label, dirty]);

  useEffect(
    () => () => {
      window.clearTimeout(timerRef.current);
      window.clearTimeout(announceTimer.current);
      window.clearTimeout(noticeTimer.current);
    },
    [],
  );

  /**
   * A question that appears on screen takes the focus with it.
   *
   * Asking "replace what you have written?" and leaving focus in the
   * picker means a keyboard reader has to go looking for the answer, and
   * a screen reader announces the question through the live region with
   * no obvious way to act on it.
   */
  useEffect(() => {
    if (!pending) return;
    confirmRef.current?.querySelector("button")?.focus();
  }, [pending]);

  // -------------------------------------------------------------
  // The quote link
  // -------------------------------------------------------------

  /**
   * The organisation's own group quote, addressed to them.
   *
   * Built through quoteLink rather than assembled here, so the desk, this
   * window and the outbox log can never disagree about the shape of a
   * URL. It carries whatever the reader has actually chosen: the package,
   * the headcount on a hold, the date. A bare link is still a valid thing
   * to send, and often the entire purpose of a first message is to invite
   * somebody to supply the number themselves.
   */
  const quoteUrl = useMemo(
    () =>
      quoteLink(prospect.id, {
        packageId,
        guests: intent === "reserve-party" ? guests : undefined,
        date: intent === "reserve-party" && holdDate ? holdDate : undefined,
      }),
    [prospect.id, packageId, guests, holdDate, intent],
  );

  const composedBody = attachQuote ? withQuoteLink(body, quoteUrl) : body;

  // -------------------------------------------------------------
  // What can actually happen to this letter
  // -------------------------------------------------------------

  const sendable = template ? isSendable(template) : false;

  const mail = useMemo(
    () =>
      mailtoPlan(
        hasWrittenDoor && sendable ? prospect.email : null,
        subject,
        composedBody,
      ),
    [hasWrittenDoor, sendable, prospect.email, subject, composedBody],
  );

  const resend = useMemo(
    () => resendRequest(subject, composedBody, prospect.email ?? DEMO_RECIPIENT),
    [subject, composedBody, prospect.email],
  );

  /** One live line for every letter action, cleared after a beat. */
  const say = useCallback((line: string) => {
    setNotice(line);
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(""), 6000);
  }, []);

  const copyLetter = useCallback(
    async (why?: string) => {
      const ok = await copyText(letterAsText(subject, composedBody));
      if (ok) {
        say(
          why
            ? `${why} Subject and message copied instead.`
            : "Subject and message copied to the clipboard.",
        );
        return;
      }
      say("The browser refused clipboard access. Select the letter and copy it yourself.");
    },
    [subject, composedBody, say],
  );

  /**
   * The fallback, for a letter too long to survive a mail link.
   *
   * Past the safe length a `mailto:` is not a worse link, it is a broken
   * one: several clients cut the body without saying so, and a letter
   * that arrives ending mid sentence is worse than one that never
   * arrived. So the control changes job rather than changing colour, and
   * it copies instead.
   */
  const openTooLong = useCallback(() => {
    void copyLetter(
      `That letter is ${mail.length} characters encoded, past the ${MAILTO_SAFE_LIMIT} a mail link carries safely, so it was not opened.`,
    );
  }, [mail.length, copyLetter]);

  // -------------------------------------------------------------
  // Closing, switching, and the two questions worth asking
  // -------------------------------------------------------------

  const requestClose = useCallback(() => {
    if (state === "sending") return;
    /* A question is already on screen, so the first Escape answers that
       question rather than closing the window underneath it. */
    if (pending) {
      setPending(null);
      return;
    }
    if (state === "composing" && dirty) {
      setPending({ kind: "close" });
      return;
    }
    onClose();
  }, [state, dirty, pending, onClose]);

  function requestSwitch(next: {
    intent?: ComposeIntent;
    templateId?: string | null;
    packageId?: string;
  }) {
    const target = {
      kind: "switch" as const,
      intent: next.intent ?? intent,
      templateId: next.templateId === undefined ? null : next.templateId,
      packageId: next.packageId ?? packageId,
    };
    if (dirty) {
      setPending(target);
      return;
    }
    applySwitch(target);
  }

  function applySwitch(target: {
    intent: ComposeIntent;
    templateId: string | null;
    packageId?: string;
  }) {
    setIntent(target.intent);
    setTemplateId(target.templateId);
    setPackageId(target.packageId);
    setDirty(false);
    setPending(null);
    setState("composing");
    setFailure(null);
  }

  /** Pulls the draft back over the reader's edits, only ever on request. */
  function rewriteFromDraft() {
    if (!template) return;
    setSubject(template.subject);
    setBody(template.body);
    setDirty(false);
  }

  // -------------------------------------------------------------
  // Focus, Escape, and the body behind
  // -------------------------------------------------------------

  /**
   * Focus goes to the heading on open and comes back to the opener on
   * close.
   *
   * The heading rather than the close button, because the close button is
   * the one control in here nobody opened this window to press, and
   * rather than the letter, because landing inside a text box skips the
   * dialog's own name and the reader never learns which organisation they
   * are writing to.
   *
   * Getting the return wrong is the failure that matters. A keyboard
   * reader who opens this from the fortieth row of a list and is dropped
   * at the top of the document has to walk the whole list again, and
   * after the second time they stop using the feature. Where the opener
   * has gone away, which happens when the pane behind closed while this
   * was open, focus lands on whatever the board marked as its return
   * point and then on the main region, so it is never nowhere.
   */
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    headingRef.current?.focus();
    return () => {
      if (opener && opener.isConnected && typeof opener.focus === "function") {
        opener.focus();
        return;
      }
      const fallback =
        document.querySelector<HTMLElement>("[data-compose-return]") ??
        document.querySelector<HTMLElement>("main");
      if (!fallback) return;
      if (!fallback.hasAttribute("tabindex")) fallback.setAttribute("tabindex", "-1");
      fallback.focus?.();
    };
  }, []);

  /**
   * The page behind does not scroll, and does not jump when it stops.
   *
   * Hiding the body's overflow removes the scrollbar, and on a desktop
   * with classic scrollbars that shifts the entire layout left by
   * fifteen pixels and back again on close. The padding compensates for
   * exactly the width that disappeared, so opening this window moves
   * nothing behind it.
   */
  useEffect(() => {
    const el = document.body;
    const prevOverflow = el.style.overflow;
    const prevPadding = el.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    el.style.overflow = "hidden";
    if (gap > 0) el.style.paddingRight = `${gap}px`;
    return () => {
      el.style.overflow = prevOverflow;
      el.style.paddingRight = prevPadding;
    };
  }, []);

  /**
   * The trap, and Escape.
   *
   * Both are bound in the CAPTURE phase so that an Escape press closes
   * the topmost layer and only the topmost layer. Without that, a modal
   * opened from a panel that also listens for Escape closes both at once
   * and the reader loses a place they did not ask to leave.
   */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (state === "sending") {
          /* Sending is the one state Escape does nothing in, because the
             outbox row is mid-write and a half-cancelled send is a lie
             in a log. */
          e.stopImmediatePropagation();
          return;
        }
        e.stopImmediatePropagation();
        e.preventDefault();
        requestClose();
        return;
      }

      if (e.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;
      const list = focusablesIn(root);
      if (list.length === 0) {
        e.preventDefault();
        return;
      }
      const active = document.activeElement as HTMLElement | null;
      if (!active || !root.contains(active)) {
        e.preventDefault();
        list[0].focus();
        return;
      }
      const i = list.indexOf(active);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        list[list.length - 1].focus();
      } else if (!e.shiftKey && i === list.length - 1) {
        e.preventDefault();
        list[0].focus();
      }
    }

    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [state, requestClose]);

  // -------------------------------------------------------------
  // Sending
  // -------------------------------------------------------------

  /**
   * Every refusal in this modal goes through here, which is why the
   * refuse cue is wired here and not at the five call sites. One function
   * is one sound; five call sites is four chances to forget.
   *
   * The cue exists because a refusal in this modal is deliberately NOT a
   * disabled button: the reader presses, and the application answers with
   * a sentence about their draft or about this organisation. A quiet
   * downward thud under that sentence is the difference between a
   * refusal that was heard and one that scrolled past.
   */
  function fail(reason: string) {
    play("refuse");
    setFailure(reason);
    setState("failed");
  }

  /**
   * SEND. Four honest refusals, then a row in the outbox.
   *
   * The button is never disabled on the grounds that the message is not
   * ready, and that is deliberate. A greyed out control with no
   * explanation makes a person guess what they did wrong; a control that
   * answers when pressed tells them. The refusals below are the only
   * ones there are, and every one of them is a fact about this
   * organisation or this draft rather than an invented failure.
   */
  function send() {
    if (state === "sending") return;
    setNotice("");

    if (!template) {
      fail("There is no draft loaded, so there is nothing to send. Pick an intent on the left.");
      return;
    }
    if (!isSendable(template)) {
      fail(
        `"${template.label}" is a script for a visit rather than a message. There is nowhere to send it, which is the point of it.`,
      );
      return;
    }
    if (!hasWrittenDoor) {
      fail(
        `${prospect.name} publishes no email address that was actually read off a page, so this app will not pretend to have one. This organisation is a go-see, and the ${lane.doorNoun} is the door.`,
      );
      return;
    }
    const s = subject.trim();
    const b = composedBody.trim();
    if (!s && !b) {
      fail("The subject and the message are both empty. There is nothing to send.");
      return;
    }
    if (!s) {
      fail("The subject line is empty. A message with no subject is a message nobody opens.");
      return;
    }
    if (!b) {
      fail("The message is empty. Write something, or pick a draft on the left.");
      return;
    }

    setState("sending");
    setFailure(null);

    /*
      The delay exists so the state is observable, and it is zero for
      anybody who has asked their system for less motion. There is no
      request behind it: OutboxProvider's SEND case appends to an array
      and that is the entire send path in this application.
    */
    timerRef.current = window.setTimeout(
      () => {
        /* The one cue in the palette that reports something LEAVING. It
           fires here, on the dispatch, rather than on the button, because
           the button press is the request and this is the event: a send
           that was refused by one of the four guards above never reaches
           this line and must not make the sound of a send. */
        play("send");
        outboxDispatch({
          type: "SEND",
          message: {
            sentAt: todayISO(),
            kind: intent === "reserve-party" ? "hold-confirmation" : "outreach",
            prospectId: prospect.id,
            prospectName: prospect.name,
            lane: prospect.lane,
            recipientRole: prospect.decisionMakerTitle,
            subject: s,
            templateLabel: template.label,
            body: b,
            /*
              A package and a headcount ride along ONLY where the message
              actually named them. An outreach row carrying a package the
              reader never mentioned would put a number in the log that
              was never put in front of the customer.
            */
            ...(intent === "reserve-party" ? { packageId, guests } : {}),
            ...(intent === "featured-promo" && template.packageId
              ? { packageId: template.packageId }
              : {}),
          },
        });

        /*
          A sent message is a touch, and the desk's ranking penalises an
          organisation at three or more of them. Without this the desk
          would keep recommending somebody who has already had four
          emails, which is how a prospecting tool generates a spam
          complaint on its owner's behalf.
        */
        pipelineDispatch({
          type: "RECORD_TOUCH",
          prospectId: prospect.id,
          packageId: packageId ?? prospect.leadPackageId,
          at: todayISO(),
        });

        setState("sent");
      },
      prefersReducedMotion() ? 0 : 600,
    );
  }

  /** The only thing a go-see can honestly produce: a recorded visit. */
  function recordGoSee() {
    pipelineDispatch({
      type: "RECORD_TOUCH",
      prospectId: prospect.id,
      packageId: packageId ?? prospect.leadPackageId,
      at: todayISO(),
    });
    onClose();
  }

  // -------------------------------------------------------------
  // Derived text
  // -------------------------------------------------------------

  const lanesHeld = lanesForGuests(guests);
  const floor = VENUE.bowlingLanesPublishedFloor;
  const overFloor = lanesHeld > floor;
  const overPackageMax =
    chosenPackage?.maxGuests != null && guests > chosenPackage.maxGuests;
  const underPackageMin =
    chosenPackage?.minGuests != null && guests < chosenPackage.minGuests;

  const justSent = state === "sent" ? outbox.sent[0] : undefined;
  const headingId = "compose-heading";
  const shownIntents: ComposeIntent[] = league
    ? [...CORE_INTENTS, ...LEAGUE_INTENTS]
    : CORE_INTENTS;

  return (
    <>
      {/* The scrim carries no controls and no meaning, so assistive
          technology is not told about it at all. Escape and the close
          button are the two routes out a keyboard reader is offered, and
          a click here goes through exactly the same path as both. */}
      <div className={styles.scrim} aria-hidden="true" onClick={requestClose} />

      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        data-compose-dialog
        ref={dialogRef}
      >
        {/* ---------------------------------------------------------
            HEAD
            --------------------------------------------------------- */}
        <header className={styles.head}>
          <div className={styles.headText}>
            <p className={styles.eyebrow}>Compose, demo mode</p>
            <h2 className={styles.heading} id={headingId} tabIndex={-1} ref={headingRef}>
              Write to {prospect.name}
            </h2>
            <div className={styles.headChips}>
              <LaneChip lane={prospect.lane} size="sm" />
              <EmailConfidenceChip confidence={prospect.emailConfidence} size="sm" />
              <span className={styles.headMeta}>
                {lane.label}. Buyer, {prospect.decisionMakerTitle.toLowerCase()}.
              </span>
            </div>
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={requestClose}
            aria-label="Close the compose window"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </header>

        {/* ---------------------------------------------------------
            SENT. The whole window is replaced, because the question
            has changed from "what shall I write" to "what happened".
            --------------------------------------------------------- */}
        {state === "sent" ? (
          <div className={styles.sentWrap}>
            <section className={styles.sentPanel} aria-live="polite">
              <p className={styles.sentMark}>
                <span aria-hidden="true" className={styles.sentGlyph}>
                  ●
                </span>
                <span className={styles.sentWord}>Written to the outbox</span>
              </p>
              <p className={styles.sentLead}>
                Nothing left this tab. No mail was sent to anybody.
              </p>

              <dl className={styles.sentFacts}>
                <div className={styles.sentFact}>
                  <dt>Reference</dt>
                  <dd className="num">{justSent?.reference ?? "Pending"}</dd>
                </div>
                <div className={styles.sentFact}>
                  <dt>To</dt>
                  <dd className="num">{DEMO_RECIPIENT}</dd>
                </div>
                <div className={styles.sentFact}>
                  <dt>Subject</dt>
                  <dd>{justSent?.subject ?? subject}</dd>
                </div>
                <div className={styles.sentFact}>
                  <dt>Recorded as</dt>
                  <dd>A touch on {prospect.name}.</dd>
                </div>
              </dl>

              <div className={styles.sentActions}>
                <Link className={styles.sentLink} to="/sent" onClick={onClose}>
                  Open the outbox and read it back
                </Link>
                <Button variant="primary" onClick={onClose}>
                  Close
                </Button>
              </div>
            </section>
          </div>
        ) : (
          /* -----------------------------------------------------
             THE SPLIT. Controls left, letter right.

             AT 380 THIS BECOMES A STACK WITH THE LETTER FIRST,
             not a pair of tabs, and that is a decision rather than
             the easier option. Tabs would put the letter behind a
             default and the controls behind a tap, which reads as
             two screens and hides the fact that the left rewrites
             the right; the whole point of this window is that the
             relationship between the two is visible. A stack keeps
             one scroll, one reading order, and puts the object the
             reader came for at the top of it. The controls are
             three radio groups and a checkbox, which is a short
             scroll rather than a second screen.
             ----------------------------------------------------- */
          <div className={styles.split}>
            {/* -------------------- LEFT: CONTROLS -------------------- */}
            <div className={styles.controls}>
              {state === "failed" && failure ? (
                <div className={styles.failPanel} role="alert">
                  <p className={styles.failHead}>
                    <span aria-hidden="true" className={styles.failGlyph}>
                      ✕
                    </span>
                    <span>Not sent</span>
                  </p>
                  <p className={styles.failWhy}>{failure}</p>
                  <div className={styles.failActions}>
                    <Button
                      onClick={() => {
                        setState("composing");
                        setFailure(null);
                      }}
                    >
                      Back to the draft
                    </Button>
                    {!hasWrittenDoor ? (
                      <Button variant="primary" glyph="◎" onClick={recordGoSee}>
                        Record this as a go-see
                      </Button>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {/* Two buttons inline rather than a window.confirm, which
                  cannot be styled, cannot be read properly by a screen
                  reader inside a dialog and drops the reader out of the
                  app's own surface. */}
              {pending ? (
                <div className={styles.confirm} role="alert" ref={confirmRef}>
                  <p className={styles.confirmText}>
                    {pending.kind === "close"
                      ? "You have written something here. Close and lose it?"
                      : "Replace what you have written with the other draft?"}
                  </p>
                  <div className={styles.confirmActions}>
                    <Button
                      variant="primary"
                      onClick={() =>
                        pending.kind === "close" ? onClose() : applySwitch(pending)
                      }
                    >
                      {pending.kind === "close" ? "Close and lose it" : "Replace"}
                    </Button>
                    <Button onClick={() => setPending(null)}>Keep mine</Button>
                  </div>
                </div>
              ) : null}

              {/* 1. INTENT */}
              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>What this message is for</legend>
                <div className={styles.intentGrid}>
                  {shownIntents.map((key) => {
                    const meta = INTENT_META[key as Exclude<ComposeIntent, "free">];
                    const active = key === intent;
                    return (
                      <label
                        key={key}
                        className={`${styles.intentCard} ${active ? styles.intentOn : ""}`}
                        data-intent={key}
                      >
                        <input
                          type="radio"
                          name="compose-intent"
                          className={styles.radio}
                          value={key}
                          checked={active}
                          onChange={() => requestSwitch({ intent: key, templateId: null })}
                          disabled={state === "sending"}
                        />
                        <span aria-hidden="true" className={styles.intentGlyph}>
                          {meta.glyph}
                        </span>
                        <span className={styles.intentLabel}>{meta.label}</span>
                        <span className={styles.intentWhat}>{meta.what}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {/* 2. THE DRAFT VARIANT */}
              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>
                  Draft{" "}
                  <span className={styles.count}>
                    <span className="num">{drafts.length}</span> for this organisation
                  </span>
                </legend>

                {drafts.length === 0 ? (
                  <p className={styles.empty}>
                    Nothing in this set was written for this kind of organisation.
                    First touch always has one.
                  </p>
                ) : (
                  <ul className={styles.draftList}>
                    {drafts.map((d) => {
                      const active = d.id === template?.id;
                      return (
                        <li key={d.id}>
                          <label
                            className={`${styles.draftRow} ${active ? styles.draftOn : ""}`}
                          >
                            <input
                              type="radio"
                              name="compose-draft"
                              className={styles.radio}
                              value={d.id}
                              checked={active}
                              onChange={() =>
                                requestSwitch({
                                  templateId: d.id,
                                  packageId: d.packageId ?? packageId,
                                })
                              }
                              disabled={state === "sending"}
                            />
                            <span aria-hidden="true" className={styles.draftMark}>
                              {active ? "●" : "○"}
                            </span>
                            <span className={styles.draftText}>
                              <span className={styles.draftLabel}>{d.label}</span>
                              <span className={styles.draftBlurb}>{d.blurb}</span>
                              {!isSendable(d) ? (
                                <span className={styles.draftFlag}>
                                  <span aria-hidden="true">▲</span> Not sendable. A
                                  script for the front desk.
                                </span>
                              ) : null}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {template ? (
                  <p className={styles.why}>
                    <span className={styles.whyLabel}>Why this one</span>{" "}
                    {template.why}
                  </p>
                ) : null}

                {offer ? (
                  <p className={styles.why}>
                    <span className={styles.whyLabel}>Offer behind it</span>{" "}
                    {offer.name}. {offer.what}
                    <ProvenanceBadge provenance={offer.provenance} compact />
                  </p>
                ) : null}

                {/* A rule a person can read at the moment of sending is a
                    control. A rule in a document is a hope. So it is never
                    collapsed and never a tooltip. */}
                {template?.guardrail ? (
                  <div className={styles.guardrail}>
                    <p className={styles.guardrailHead}>
                      <span aria-hidden="true">▲</span> Hold this while you send
                    </p>
                    <p className={styles.guardrailText}>{template.guardrail}</p>
                  </div>
                ) : null}
              </fieldset>

              {/* 3. THE PACKAGE */}
              {needsPackage ? (
                <fieldset className={styles.fieldset}>
                  <legend className={styles.legend}>
                    Anchored to a package{" "}
                    <span className={styles.count}>
                      <span className="num">{fit.packages.length}</span> that fit
                    </span>
                  </legend>

                  {!fit.matchedLane ? (
                    <p className={styles.hint}>
                      No published page names this kind of organisation, so the list
                      is not narrowed.
                    </p>
                  ) : null}

                  <ul className={styles.packList}>
                    {fit.packages.map((p) => {
                      const active = p.id === packageId;
                      return (
                        <li key={p.id}>
                          <label
                            className={`${styles.packRow} ${active ? styles.packOn : ""}`}
                          >
                            <input
                              type="radio"
                              name="compose-package"
                              className={styles.radio}
                              value={p.id}
                              checked={active}
                              onChange={() => {
                                const anchored = drafts.find((d) => d.packageId === p.id);
                                requestSwitch({
                                  packageId: p.id,
                                  templateId: anchored ? anchored.id : template?.id ?? null,
                                });
                              }}
                              disabled={state === "sending"}
                            />
                            <PackageGlyph family={p.family} size={24} />
                            <span className={styles.packText}>
                              <span className={styles.packName}>{p.name}</span>
                              <FamilyChip family={p.family} size="sm" />
                              <span className={styles.packPrice}>
                                <Figure
                                  value={
                                    p.pricePerGuest === null
                                      ? null
                                      : `$${p.pricePerGuest.toFixed(2)} per guest`
                                  }
                                  provenance={
                                    p.pricePerGuest === null
                                      ? "withheld"
                                      : p.provenance.pricePerGuest ?? "public"
                                  }
                                  compact
                                />
                              </span>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>

                  {chosenPackage && template?.packageId &&
                  template.packageId !== chosenPackage.id ? (
                    <p className={styles.mismatch}>
                      <span aria-hidden="true">▲</span> This draft was written
                      against {PACKAGE_BY_ID[template.packageId]?.name}. The link now
                      points at {chosenPackage.name}.
                    </p>
                  ) : null}
                </fieldset>
              ) : null}

              {/* 4. THE HOLD */}
              {intent === "reserve-party" ? (
                <fieldset className={styles.fieldset}>
                  <legend className={styles.legend}>What is being held</legend>

                  <div className={styles.holdGrid}>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel} htmlFor="compose-date">
                        Date being held
                      </label>
                      <input
                        id="compose-date"
                        type="date"
                        className={styles.input}
                        value={holdDate}
                        min={todayISO()}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setHoldDate(e.target.value)
                        }
                        disabled={state === "sending"}
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles.fieldLabel} htmlFor="compose-guests">
                        Guests discussed
                      </label>
                      <input
                        id="compose-guests"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={2000}
                        className={`${styles.input} num`}
                        value={guests}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setGuests(Math.max(1, Number(e.target.value) || 1))
                        }
                        disabled={state === "sending"}
                      />
                    </div>
                  </div>

                  <div className={styles.lanesBox}>
                    <p className={styles.lanesLead}>
                      <span className="num">{guests}</span> guests holds{" "}
                      <strong className="num">{lanesHeld}</strong>{" "}
                      {lanesHeld === 1 ? "lane" : "lanes"} of the more than{" "}
                      <span className="num">{floor}</span> published for Brea, at one
                      lane per <span className="num">{GUESTS_PER_BOWLING_LANE}</span>{" "}
                      guests.
                    </p>
                    <ProvenanceBadge provenance="modeled" />

                    {overFloor ? (
                      <p className={styles.lanesWarn}>
                        <span aria-hidden="true">▲</span> Over the published lane
                        floor. A full facility conversation or two sittings.
                      </p>
                    ) : null}
                    {overPackageMax ? (
                      <p className={styles.lanesWarn}>
                        <span aria-hidden="true">▲</span> Over {chosenPackage?.name}'s
                        published maximum of{" "}
                        <span className="num">{chosenPackage?.maxGuests}</span>.
                      </p>
                    ) : null}
                    {underPackageMin ? (
                      <p className={styles.lanesWarn}>
                        <span aria-hidden="true">▲</span> Under{" "}
                        {chosenPackage?.name}'s published minimum of{" "}
                        <span className="num">{chosenPackage?.minGuests}</span>.
                      </p>
                    ) : null}
                  </div>

                  {dirty ? (
                    <p className={styles.hint}>
                      Edited, so these numbers no longer flow into the letter.{" "}
                      <button
                        type="button"
                        className={styles.linkButton}
                        onClick={rewriteFromDraft}
                      >
                        Rewrite the letter from them
                      </button>
                    </p>
                  ) : null}
                </fieldset>
              ) : null}

              {/* 5. THE QUOTE LINK */}
              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>Their own group quote</legend>

                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={attachQuote}
                    onChange={() => setAttachQuote((v) => !v)}
                    disabled={state === "sending"}
                  />
                  <span className={styles.toggleText}>
                    <span className={styles.toggleLabel}>
                      Attach {prospect.name}'s quote link
                    </span>
                    <span className={`${styles.url} num`}>{quoteUrl}</span>
                  </span>
                </label>

                {attachQuote ? (
                  <p className={styles.postscript}>{quoteLinkPostscript(quoteUrl)}</p>
                ) : null}
              </fieldset>

              {/* 6. THE ONE LINE ABOUT WHERE A SEND GOES.
                  This used to be four lines of prose in the middle of the
                  working surface, which is the exact thing the SaaS
                  contract forbids. The fact is good and it stays; the
                  essay is behind a disclosure nobody has to open. */}
              <details className={styles.disclosure}>
                <summary className={styles.disclosureHead}>
                  Outbox rows go to{" "}
                  <span className={`${styles.disclosureAddress} num`}>
                    {DEMO_RECIPIENT}
                  </span>
                </summary>
                <p className={styles.disclosureBody}>
                  RFC 2606 reserves .invalid so it can never resolve anywhere, and the
                  outbox reducer forces that address rather than reading it from this
                  window. Open to send is the one route out of here, it uses the real
                  published address, and it opens your own mail client rather than
                  sending anything itself.
                </p>
              </details>
            </div>

            {/* -------------------- RIGHT: THE LETTER -------------------- */}
            <div className={styles.letter} data-compose-letter>
              <div className={styles.letterHead}>
                <span className={styles.letterToLabel}>To</span>
                {hasWrittenDoor ? (
                  <span className={`${styles.letterTo} num`}>{prospect.email}</span>
                ) : (
                  <span className={styles.letterToNone}>
                    <span aria-hidden="true">▲</span> No published address. This one is
                    a visit.
                  </span>
                )}
              </div>

              <label className={styles.letterFieldLabel} htmlFor="compose-subject">
                Subject
              </label>
              <input
                id="compose-subject"
                type="text"
                className={styles.letterSubject}
                value={subject}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setSubject(e.target.value);
                  setDirty(true);
                }}
                disabled={state === "sending"}
              />

              <label className={styles.letterFieldLabel} htmlFor="compose-body">
                Message
              </label>
              <textarea
                id="compose-body"
                className={styles.letterBody}
                value={body}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                  setBody(e.target.value);
                  setDirty(true);
                }}
                disabled={state === "sending"}
              />

              {attachQuote ? (
                <p className={styles.letterPostscript}>
                  {quoteLinkPostscript(quoteUrl)}
                </p>
              ) : null}

              <div className={styles.letterFoot}>
                <p className={styles.letterMeta}>
                  <span className="num">{words(composedBody)}</span> words,{" "}
                  <span className="num">{composedBody.length}</span> characters,
                  subject <span className="num">{subject.trim().length}</span>.
                  {dirty ? " Edited." : ""}
                </p>

                <div className={styles.letterActions}>
                  {/* AN ANCHOR, NOT A BUTTON, WHERE THE LINK IS REAL.
                      A mailto is a link and the browser already knows what
                      to do with one: open the handler, offer it to a right
                      click, show it in the status bar. Scripting
                      window.location for it would take all three away and
                      buy nothing. Over the safe length there is no href to
                      give, so it becomes a button that copies. */}
                  {mail.href && mail.withinLimit ? (
                    <a
                      className={styles.letterAction}
                      href={mail.href}
                      data-mailto
                      onClick={() =>
                        say(
                          `Opened in your mail client, addressed to ${mail.address}. Nothing was sent from here.`,
                        )
                      }
                    >
                      <span aria-hidden="true">▸</span>
                      <span>Open to send</span>
                    </a>
                  ) : mail.href ? (
                    <button
                      type="button"
                      className={styles.letterAction}
                      onClick={openTooLong}
                      disabled={state === "sending"}
                    >
                      <span aria-hidden="true">⧉</span>
                      <span>Too long to open, copy</span>
                    </button>
                  ) : (
                    <span className={styles.letterActionOff}>
                      <span aria-hidden="true">▲</span>
                      <span>
                        {sendable
                          ? "No published address to open"
                          : "A script, not a message"}
                      </span>
                    </span>
                  )}

                  <button
                    type="button"
                    className={styles.letterAction}
                    data-copy-letter
                    onClick={() => void copyLetter()}
                    disabled={state === "sending"}
                  >
                    <span aria-hidden="true">⧉</span>
                    <span>Copy</span>
                  </button>

                  {/* THE RESEND CONTROL.
                      Present, disabled, and honest about why. A demo build
                      is static files, so the only place to keep an API key
                      is the bundle, and a key in a bundle is a key anybody
                      can read and use. The disclosure carries the exact
                      request this would post, which is worth more than a
                      success toast that did nothing. */}
                  <button
                    type="button"
                    className={styles.letterAction}
                    disabled
                    aria-describedby="resend-why"
                    title="No Resend API key is configured in a demo build. A static site has nowhere safe to keep one."
                  >
                    <span aria-hidden="true">◍</span>
                    <span>Send via Resend</span>
                  </button>
                </div>

                <p className={styles.resendWhy} id="resend-why">
                  Resend is off: no API key in a demo build.
                </p>

                <details className={styles.resendShape}>
                  <summary className={styles.disclosureHead}>
                    The request it would post
                  </summary>
                  <pre className={styles.resendPre}>
                    {resendRequestPreview(resend)}
                  </pre>
                </details>

                {/* Two live regions rather than one, because they answer
                    different questions and a shared one would let a copy
                    confirmation overwrite a draft announcement mid speech.
                    They share a row so the pair costs the letter one line
                    rather than two. */}
                <div className={styles.liveRow}>
                  <p className={styles.live} role="status" aria-live="polite">
                    {notice}
                  </p>
                  <p className={styles.liveQuiet} aria-live="polite" data-draft-live>
                    {draftAnnounce}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------
            FOOT
            --------------------------------------------------------- */}
        {state === "sent" ? null : (
          <footer className={styles.foot}>
            <p className={styles.footStatus} role="status">
              {state === "sending"
                ? "Sending. Writing a row to the demo outbox."
                : mail.href && !mail.withinLimit
                  ? `Letter is ${mail.length} characters encoded. Over ${MAILTO_SAFE_LIMIT}, so Open to send copies instead.`
                  : "Nothing is emailed from here."}
            </p>
            <div className={styles.footActions}>
              <Button onClick={requestClose} disabled={state === "sending"}>
                Cancel
              </Button>
              {template && !isSendable(template) ? (
                <Button
                  variant="primary"
                  glyph="◎"
                  onClick={recordGoSee}
                  disabled={state === "sending"}
                >
                  Record this as a go-see
                </Button>
              ) : (
                <Button
                  variant="primary"
                  glyph="▸"
                  onClick={send}
                  disabled={state === "sending"}
                >
                  {state === "sending" ? "Sending" : "Send to the outbox"}
                </Button>
              )}
            </div>
          </footer>
        )}
      </div>
    </>
  );
}
