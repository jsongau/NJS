import { useCallback, useEffect, useRef, useState } from "react";
import { PROSPECT_BY_ID } from "@/data/prospects";
import { QuoteDocument, QuoteFooter } from "@/pages/QuotePage";
import { Button } from "@/components/primitives/Button";
import { quoteLink } from "@/lib/links";
import styles from "./QuotePreviewModal.module.css";

/**
 * THE PROSPECT'S PAGE, OVER THE CONSOLE RATHER THAN INSTEAD OF IT.
 *
 * Pressing "Group quote" on the map used to leave the application. The
 * quote route renders outside the shell for a good reason, so the whole
 * console went with it: no strip, no rail, no service line filter, and
 * the back button as the only way home. This dialog is the fix. The
 * letter is the same letter, rendered from the same component the route
 * renders, and the board stays on screen behind it.
 *
 * ── THE TWO CONTROLS A PREVIEW ACTUALLY NEEDS ─────────────────────
 * Copy the link, and open the real page in a new tab. Nothing else. The
 * first is what a marketer does ninety times out of a hundred: the URL
 * goes into a message they are already writing. The second is for the
 * tenth, where they want to stand exactly where the property manager
 * stands, with no dialog around it. The link is shown as well as copied,
 * because a copy button that reports success and copied nothing is a lie
 * the sender only finds out about after they press send.
 *
 * ── WHY THE REQUEST BUTTON IS HELD DOWN IN HERE ───────────────────
 * `interactive={false}` reaches the document and disables one control:
 * the request control. On the prospect's own page that press writes a
 * row saying the organisation asked to be called. Pressed from inside a
 * preview it would write the same row, and an outbox carrying inbound
 * leads nobody raised is worse than no preview at all. The calculator
 * stays live because trying a door count writes nothing.
 *
 * ── ONE LAYER OWNS THE KEYBOARD ───────────────────────────────────
 * The trap, the Escape handler and the body scroll lock are the record
 * modal's, deliberately, down to the scrollbar compensation. Where this
 * opens over the record, the record stands its own trap down and drops
 * behind this scrim, which is exactly what it already does for the
 * compose window.
 */

export interface QuotePreviewModalProps {
  /** A row in prospects.ts. */
  prospectId: string;
  /** The package quoted, or null for the organisation's lead package. */
  packageId?: string | null;
  /** The doors quoted, or null for the modeled midpoint. */
  guests?: number | null;
  onClose: () => void;
}

export function QuotePreviewModal({
  prospectId,
  packageId = null,
  guests = null,
  onClose,
}: QuotePreviewModalProps) {
  const prospect = PROSPECT_BY_ID[prospectId];

  const dialogRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [said, setSaid] = useState("");

  /** The URL that goes in the email, built by the one function that builds them. */
  const url = quoteLink(prospectId, {
    packageId: packageId ?? undefined,
    guests: guests ?? undefined,
  });

  /** Focus lands on the heading. The provider takes it back on close. */
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  /**
   * The page behind does not scroll, and does not jump when it stops.
   *
   * Hiding the body overflow removes the scrollbar, and on a desktop
   * with classic scrollbars that shifts the layout fifteen pixels left
   * and back again. The padding compensates for exactly the width that
   * disappeared, so opening a preview moves nothing behind it.
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
   * Bound in the capture phase and stopped there, so a record modal
   * underneath never sees the same press. Tab cycles the controls in
   * this dialog and nothing else, including every link inside the
   * letter, because the letter is part of what is being previewed.
   */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const root = dialogRef.current;
      if (!root) return;
      const list = Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null || el === headingRef.current);

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
  }, [onClose]);

  /**
   * The link onto the clipboard.
   *
   * The failure branch is not decoration. `navigator.clipboard` is
   * undefined on an insecure origin and rejects outright when a browser
   * decides the gesture was not user initiated. The URL is on screen and
   * selectable either way, so the fallback is a sentence pointing at it
   * rather than a second mechanism.
   */
  const copy = useCallback(async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("no clipboard");
      await navigator.clipboard.writeText(url);
      setSaid("Link copied.");
    } catch {
      setSaid("The browser refused clipboard access. Select the link above and copy it.");
    }
  }, [url]);

  const name = prospect ? prospect.name : "This link";

  return (
    <>
      {/* The scrim takes the press. Nothing underneath can be reached
          while this is open, including the control it was opened from. */}
      <div className={styles.scrim} onClick={onClose} aria-hidden="true" />

      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-preview-heading quote-preview-subject"
        ref={dialogRef}
        data-quote-preview={prospectId}
      >
        <header className={styles.head}>
          <div className={styles.headText}>
            <h2
              className={styles.title}
              id="quote-preview-heading"
              tabIndex={-1}
              ref={headingRef}
            >
              Group quote preview
            </h2>
            <p className={styles.subject} id="quote-preview-subject">
              {name}
            </p>
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close the quote preview"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </header>

        <div className={styles.linkBar}>
          <span className={styles.url} title={url}>
            {url}
          </span>
          <div className={styles.linkActions}>
            <Button size="sm" glyph="▤" onClick={copy}>
              Copy link
            </Button>
            <a
              className={styles.openLink}
              href={url}
              target="_blank"
              rel="noreferrer"
            >
              <span aria-hidden="true">◱</span>
              <span>Open in a new tab</span>
            </a>
          </div>
        </div>

        {/* -----------------------------------------------------------
            THE LETTER. The same component the route renders, on the
            same ground, scrolling inside the dialog rather than moving
            the board behind it.
            ----------------------------------------------------------- */}
        <div className={styles.doc}>
          <QuoteDocument
            prospectId={prospectId}
            packageId={packageId}
            guests={guests}
            interactive={false}
            sheetTag="div"
            sheetClassName={styles.docSheet}
          />
          <QuoteFooter />
        </div>

        <p className={styles.announce} role="status">
          {said}
        </p>
      </div>
    </>
  );
}
