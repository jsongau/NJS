import { useEffect, useRef, type ReactNode } from "react";
import styles from "./CupDialog.module.css";

/**
 * THE DIALOG THE THREE CUP SURFACES SHARE.
 *
 * ── IT IS THE QUOTE PREVIEW'S DIALOG, ON PURPOSE ──────────────────
 * The scrim, the centred sheet, the head that never moves, the scrolling
 * body, the 44px close control and the phone layout that becomes the
 * whole screen are all `QuotePreviewModal`'s, down to the scrollbar
 * compensation living in the provider. A rep who has learned one dialog
 * in this application has learned all of them, and a second answer to
 * focus, Escape and the back button is a second thing to keep correct.
 *
 * ── ONE LAYER OWNS THE KEYBOARD ───────────────────────────────────
 * A team surface leads to a bowler and a fixture leads to a tape, so
 * these dialogs genuinely stack. `active` is how they stay sane: the
 * topmost dialog binds Escape and the Tab cycle and every dialog under
 * it stands its own trap down, which is exactly what the record modal
 * already does while the compose window or the quote preview is over it.
 * Two traps fighting over one Tab press is how a keyboard reader ends up
 * unable to reach a close button.
 *
 * The body scroll lock is NOT here. It belongs to the provider, once,
 * because three dialogs each saving and restoring `body.style.overflow`
 * would restore each other's saved value in the wrong order.
 *
 * ── NOTHING ANIMATES ──────────────────────────────────────────────
 * There is no transition to kill under reduced motion, because a dialog
 * that fades in is a dialog a reader waits for.
 */

export interface CupDialogProps {
  /** Distinct per surface, so two stacked dialogs cannot share an id. */
  idBase: string;
  /** The kind of thing this is. One or two words above the name. */
  eyebrow: string;
  /** The name. The accessible name of the dialog starts here. */
  title: ReactNode;
  /** The second half of the accessible name. A team, a position, a date. */
  subject?: ReactNode;
  /** Chips and badges under the head. */
  meta?: ReactNode;
  /** True on the topmost dialog only. Binds Escape and the Tab cycle. */
  active: boolean;
  onClose: () => void;
  /** What the close control says it closes. */
  closeLabel: string;
  /** Marks the sheet so a proof pass can find it by address. */
  dataAttr?: Record<string, string>;
  children: ReactNode;
  /** The line that sits under everything. Usually a disclosure. */
  foot?: ReactNode;
}

export function CupDialog({
  idBase,
  eyebrow,
  title,
  subject,
  meta,
  active,
  onClose,
  closeLabel,
  dataAttr,
  children,
  foot,
}: CupDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  /** Focus lands on the name. The provider takes it back on close. */
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  /**
   * The trap, and Escape, bound in the capture phase and stopped there.
   *
   * Stood down entirely when this dialog is not the topmost one, so the
   * layer above owns every press without this one seeing it first.
   */
  useEffect(() => {
    if (!active) return undefined;

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
      const focused = document.activeElement as HTMLElement | null;
      if (!focused || !root.contains(focused)) {
        e.preventDefault();
        list[0].focus();
        return;
      }
      const i = list.indexOf(focused);
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
  }, [active, onClose]);

  const headingId = `${idBase}-heading`;
  const subjectId = `${idBase}-subject`;

  return (
    <>
      {/* The scrim takes the press. Nothing underneath can be reached
          while this is open, including the name it was opened from. */}
      <div className={styles.scrim} onClick={onClose} aria-hidden="true" />

      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby={subject ? `${headingId} ${subjectId}` : headingId}
        ref={dialogRef}
        {...dataAttr}
      >
        <header className={styles.head}>
          <div className={styles.headText}>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h2
              className={styles.title}
              id={headingId}
              tabIndex={-1}
              ref={headingRef}
            >
              {title}
            </h2>
            {subject ? (
              <p className={styles.subject} id={subjectId}>
                {subject}
              </p>
            ) : null}
            {meta ? <div className={styles.meta}>{meta}</div> : null}
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label={closeLabel}
          >
            <span aria-hidden="true">✕</span>
          </button>
        </header>

        <div className={styles.body}>{children}</div>

        {foot ? <div className={styles.foot}>{foot}</div> : null}
      </div>
    </>
  );
}

/* ---------------------------------------------------------------
   The furniture the three surfaces share inside the body.
   --------------------------------------------------------------- */

export function CupBlock({
  title,
  lede,
  meta,
  children,
}: {
  title: string;
  lede?: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={styles.block}>
      <div className={styles.blockHead}>
        <h3 className={styles.blockTitle}>{title}</h3>
        {meta ? <div className={styles.blockMeta}>{meta}</div> : null}
      </div>
      {lede ? <p className={styles.blockLede}>{lede}</p> : null}
      {children}
    </section>
  );
}

/** A label and a value, in the shape every fact list here takes. */
export function CupFact({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? `${styles.fact} ${styles.factWide}` : styles.fact}>
      <dt className={styles.factLabel}>{label}</dt>
      <dd className={styles.factValue}>{children}</dd>
    </div>
  );
}

export function CupFacts({ children }: { children: ReactNode }) {
  return <dl className={styles.facts}>{children}</dl>;
}

/**
 * The word that travels with a simulated figure, drawn once.
 *
 * `domain/cup.ts` makes the label a required field on every exhibition
 * figure so the word cannot be separated from the number in the type
 * system. This is the other half of that: the word is visible next to
 * the figure on the screen, not folded into a footnote.
 */
export function SimulatedMark({ label }: { label: string }) {
  return (
    <span className={styles.simulated}>
      <span aria-hidden="true">◍</span> {label}
    </span>
  );
}

export const cupDialogStyles = styles;
