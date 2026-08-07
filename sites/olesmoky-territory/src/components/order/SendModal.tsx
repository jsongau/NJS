import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { BuiltEmail } from "@/lib/email/orderEmail";
import type { EmailTemplate } from "@/lib/email/templates";
import type { SendRecord } from "@/lib/email/transport";
import { activeTransport, TRANSPORT_MODE } from "@/lib/email/transport";
import styles from "./SendModal.module.css";

/**
 * The compose window.
 *
 * Firing an email off a single button with no preview is the kind of
 * thing that is fine in a demo and unforgivable in a tool someone uses on
 * a Tuesday. Nobody sends a message to a distributor's order desk without
 * reading it first.
 *
 * The layout is the one every mail client converged on because it works:
 * addressing and composition on the left, a live rendering of what the
 * recipient actually receives on the right. The preview is a real iframe
 * of the real HTML, scaled to fit rather than reflowed, because a preview
 * that lies about the layout is worse than no preview.
 *
 * The recipient is a locked chip, not a field. Nothing in this prototype
 * can address a stranger, and showing the address as furniture rather
 * than as an input is how that guarantee becomes visible.
 */

interface Props {
  open: boolean;
  onClose: () => void;
  /** Rebuilt on every keystroke from the note and subject below. */
  build: (note: string, subject: string) => BuiltEmail | null;
  defaultSubject: string;
  recipientRole: string;
  laneLabel: string;
  /** Drafts written from the order. The first one is loaded on open. */
  templates: EmailTemplate[];
  /** What sending does beyond sending. Disclosed, never silent. */
  commitNote: string;
  onSent: (record: SendRecord) => void;
}

export function SendModal({
  open,
  onClose,
  build,
  defaultSubject,
  recipientRole,
  laneLabel,
  templates,
  commitNote,
  onSent,
}: Props) {
  const [subject, setSubject] = useState(defaultSubject);
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [note, setNote] = useState(templates[0]?.note ?? "");
  const [edited, setEdited] = useState(false);
  /** Opens on the SHEET. It is the thing worth looking at, and the
   *  "The email" tab is one click away and labelled. */
  const [view, setView] = useState<"formatted" | "plain">("formatted");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<SendRecord | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const openerRef = useRef<Element | null>(null);

  const built = build(note, subject);

  /** Reset per opening, remember what to give focus back to, trap focus. */
  useEffect(() => {
    if (!open) return;
    openerRef.current = document.activeElement;
    setSubject(defaultSubject);
    setTemplateId(templates[0]?.id ?? "");
    setNote(templates[0]?.note ?? "");
    setEdited(false);
    setSent(null);
    setView("formatted");
    const t = window.setTimeout(() => noteRef.current?.focus(), 60);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      // The send shortcut every mail client has. Muscle memory is a feature.
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        void doSend();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
      (openerRef.current as HTMLElement | null)?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultSubject]);

  if (!open || !built) return null;

  async function doSend() {
    const current = build(note, subject);
    if (!current) return;
    setSending(true);
    const result = await activeTransport(current);
    setSending(false);
    const record: SendRecord = {
      ...result,
      to: current.to,
      subject: current.subject,
      lineCount: current.lineCount,
      totalCases: current.totalCases,
      at: "just now",
      body: current.text,
      attachmentName: current.attachmentName,
      draftLabel: templates.find((t) => t.id === templateId)?.label,
    };
    setSent(record);
    onSent(record);
  }

  const copy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 2000);
  };

  const initials = built.to.slice(0, 2).toUpperCase();

  return (
    <div className={styles.backdrop} onMouseDown={onClose}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="send-modal-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className={styles.head}>
          <div className={styles.headLeft}>
            <h2 id="send-modal-title">New message</h2>
            <span className={styles.laneTag}>{laneLabel}</span>
          </div>
          <span className={styles.demoTag}>
            <span aria-hidden="true">●</span> Demo. Nothing leaves this page.
          </span>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close the message"
          >
            ×
          </button>
        </header>

        {sent ? (
          <div className={styles.sentPane} role="status">
            <span className={styles.sentCheck} aria-hidden="true">✓</span>
            <h3>Recorded</h3>
            <p className={styles.sentLead}>
              {sent.lineCount} lines, {sent.totalCases} cases, addressed to{" "}
              <strong>{sent.to}</strong>.
            </p>
            <p className={styles.sentBody}>
              {sent.message} Reference{" "}
              <strong className="num">{sent.reference}</strong>.
            </p>
            <p className={styles.sentBody}>{commitNote}</p>
            <p className={styles.sentBody}>
              It is also in the sent log now, with the opener it used, so it
              can be compared against everything else that went out.
            </p>
            <div className={styles.sentActions}>
              <Link
                className={styles.primary}
                to="/sent"
                onClick={onClose}
              >
                Open the sent log
              </Link>
              <button type="button" className={styles.ghost} onClick={onClose}>
                Done
              </button>
              <button
                type="button"
                className={styles.ghost}
                onClick={() => setSent(null)}
              >
                Back to the message
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.body}>
              {/* --- compose ------------------------------------- */}
              <div className={styles.compose}>
                <div className={styles.composeScroll}>
                {/* Drafts written from the order, not from a blank page.
                    Which one you pick is a real decision: the same order
                    can be a heads-up or an escalation. */}
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>
                    Draft
                    {edited ? <span className={styles.editedTag}>edited</span> : null}
                  </span>
                  <div className={styles.templates} role="group" aria-label="Draft">
                    {templates.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className={[styles.tplBtn, templateId === t.id ? styles.tplOn : ""]
                          .filter(Boolean)
                          .join(" ")}
                        aria-pressed={templateId === t.id}
                        title={t.blurb}
                        onClick={() => {
                          setTemplateId(t.id);
                          setNote(t.note);
                          setEdited(false);
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <p className={styles.tplBlurb}>
                    {templates.find((t) => t.id === templateId)?.blurb}
                  </p>
                  {/*
                    THE GUARDRAIL RENDERS AT THE MOMENT OF SENDING, which
                    is the only moment it can do any work.

                    Trade-practice rules are normally taught once a year
                    and broken in an email on a Tuesday, because the rule
                    is in a deck and the temptation is in the compose
                    window. The one draft in this app that offers to help
                    a bar run a fight night is the one draft somebody
                    will edit into "and we will cover it" — so the line
                    saying that is unlawful sits directly under the box
                    they would type it in.

                    It is not a tooltip and not a hover. A control that
                    has to be discovered is not a control.
                  */}
                  {templates.find((t) => t.id === templateId)?.guardrail ? (
                    <p className={styles.guardrail}>
                      <span aria-hidden="true" className={styles.guardrailMark}>
                        §
                      </span>
                      <span>
                        {templates.find((t) => t.id === templateId)?.guardrail}
                      </span>
                    </p>
                  ) : null}
                </div>

                <div className={styles.field}>
                  <span className={styles.fieldLabel}>To</span>
                  {/* A chip, not an input. The address is on file and
                      cannot be typed, which is what makes Send safe. */}
                  <div className={styles.recipient}>
                    <span className={styles.avatar} aria-hidden="true">
                      {initials}
                    </span>
                    <span className={styles.recipientText}>
                      <span className={styles.recipientAddr}>{built.to}</span>
                      <span className={styles.recipientRole}>{recipientRole}</span>
                    </span>
                    <span className={styles.locked}>On file</span>
                  </div>
                </div>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Subject</span>
                  <input
                    className={styles.subject}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    spellCheck
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>
                    The message
                    <span className={styles.optional}>edit anything</span>
                  </span>
                  <textarea
                    ref={noteRef}
                    className={styles.note}
                    value={note}
                    rows={13}
                    placeholder="Anything you would say on the phone."
                    onChange={(e) => {
                      setNote(e.target.value);
                      setEdited(true);
                    }}
                    spellCheck
                  />
                </label>

                {/* The attachment, named. The body says "see attached" and
                    this is the thing it means, shown as a file rather than
                    described in prose. Clicking it puts the sheet in the
                    preview beside it, so "which one is going out" has an
                    answer you can point at. */}
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Attached</span>
                  <button
                    type="button"
                    className={[
                      styles.attachment,
                      view === "formatted" ? styles.attachmentOn : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => setView("formatted")}
                    aria-pressed={view === "formatted"}
                  >
                    <span className={styles.attachIcon} aria-hidden="true">▤</span>
                    <span className={styles.attachText}>
                      <strong>{built.attachmentName ?? "The order sheet"}</strong>
                      <span>
                        {built.lineCount} items · {built.totalCases} cases ·
                        one page
                      </span>
                    </span>
                    <span className={styles.attachLink}>
                      {view === "formatted" ? "Shown" : "Show it"}
                    </span>
                  </button>
                </div>
                </div>

                {/* SEND LIVES HERE, not in a bar across the bottom of a
                    1140px dialog.

                    It was in a full-width footer, which put it at the far
                    right of the window while the person's eye and cursor
                    were in the compose column on the left — and on a
                    shorter window it was the first thing to fall out of
                    view. Every mail client worth copying anchors Send to
                    the bottom of the pane you are typing in. This is that.
                    Sticky, so it holds position while the fields above it
                    scroll. */}
                <div className={styles.composeFoot}>
                  <p className={styles.commitNote}>
                    <span aria-hidden="true">▤</span> {commitNote}
                  </p>
                  <div className={styles.composeActions}>
                    <button
                      type="button"
                      className={styles.primary}
                      onClick={doSend}
                      disabled={sending}
                    >
                      {sending
                        ? "Sending"
                        : TRANSPORT_MODE === "demo"
                          ? "Send it"
                          : "Send"}
                    </button>
                    <button
                      type="button"
                      className={styles.ghost}
                      onClick={() => copy(built.text, "Message copied")}
                    >
                      Copy message
                    </button>
                    {copied ? (
                      <span className={styles.copied} role="status">
                        <span aria-hidden="true">✓</span> {copied}
                      </span>
                    ) : (
                      <span className={styles.hint}>
                        <kbd>⌘</kbd>
                        <kbd>↵</kbd> to send
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* --- preview -------------------------------------- */}
              <div className={styles.previewPane}>
                {/* Two artifacts, not two skins on one.
                    The toggle used to read Formatted / Plain text, which
                    implied both panes were the same message dressed
                    differently — and left a fair question about which one
                    was actually going out. It names them now: the email
                    that gets sent, and the sheet attached to it. */}
                <div className={styles.previewHead}>
                  <span className={styles.fieldLabel}>
                    {view === "plain" ? "This is what gets sent" : "This rides along as the attachment"}
                  </span>
                  <div className={styles.toggle} role="group" aria-label="Preview">
                    {(["plain", "formatted"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        className={[styles.tBtn, view === m ? styles.tOn : ""]
                          .filter(Boolean)
                          .join(" ")}
                        aria-pressed={view === m}
                        onClick={() => setView(m)}
                      >
                        {m === "plain" ? "The email" : "The attached sheet"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.previewFrame}>
                  {view === "formatted" ? (
                    /* The real HTML at its real width, scaled rather than
                       reflowed, so the preview cannot flatter the layout. */
                    <iframe
                      className={styles.previewHtml}
                      title="Formatted preview"
                      srcDoc={built.html}
                      sandbox=""
                    />
                  ) : (
                    <pre className={styles.previewText}>{built.text}</pre>
                  )}
                </div>
              </div>
            </div>


          </>
        )}
      </div>
    </div>
  );
}
