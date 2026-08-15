import type { MouseEvent, ReactNode } from "react";
import { PROSPECT_BY_ID } from "@/data/prospects";
import { useOpenRecord } from "@/state/RecordProvider";
import styles from "./RecordName.module.css";

/**
 * A BUSINESS NAME THAT OPENS ITS RECORD.
 *
 * The owner asked for exactly this: "profiles need pages that are
 * clickable by clicking on the text of the business name to open modal
 * of their profile". So the name itself is the control, everywhere it
 * appears, and there is no second "open" button beside it competing for
 * the same press.
 *
 * IT IS A REAL BUTTON. Not a div with a click handler, not a span with a
 * role. A button is focusable, is announced as a button, fires on Enter
 * and on Space, appears in the tab order in the right place, and gets
 * the focus ring the rest of the app already defines. Everything an
 * imitation would have to be given back one property at a time, badly.
 *
 * IT LOOKS LIKE TEXT UNTIL IT IS TOUCHED. A table of a hundred and two
 * rows where every name is painted as a link is a page of blue, and the
 * colour stops meaning anything. So the name inherits the type, the
 * weight and the colour of whatever cell, card title or popup heading it
 * sits in, and earns an underline on hover and on focus. The affordance
 * is the underline plus the pointer plus the accessible name, and none
 * of those is a colour.
 *
 * IT MUST NOT BE NESTED INSIDE ANOTHER BUTTON. A button inside a button
 * is invalid HTML and browsers resolve it unpredictably. Where a card is
 * currently one large button, the card becomes a container and the name
 * inside it becomes this. That is the shape every product in the
 * research ships, for this reason.
 */

export interface RecordNameProps {
  /** A row in prospects.ts. */
  prospectId: string;
  /**
   * The words to show. Defaults to the organisation's own name, which is
   * what every caller wants; passing it explicitly saves a lookup where
   * the caller already has the prospect in hand.
   */
  name?: string;
  /** Passed through so a caller keeps its own type scale and truncation. */
  className?: string;
  /** Replaces the label entirely, for a caller that renders a plate beside it. */
  children?: ReactNode;
}

export function RecordName({
  prospectId,
  name,
  className,
  children,
}: RecordNameProps) {
  const openRecord = useOpenRecord();
  const label = name ?? PROSPECT_BY_ID[prospectId]?.name ?? prospectId;

  function open(e: MouseEvent<HTMLButtonElement>) {
    /* The name very often sits inside something else that reacts to a
       click: a map marker's popup, a list card that selects a row, a
       table row that highlights. Opening the record is the whole of what
       this press means, so it stops there. */
    e.preventDefault();
    e.stopPropagation();
    openRecord(prospectId);
  }

  return (
    <button
      type="button"
      className={[styles.name, className].filter(Boolean).join(" ")}
      onClick={open}
      /* Announced as opening a dialog, so a screen reader user knows a
         press moves them somewhere rather than navigating away. */
      aria-haspopup="dialog"
      data-record-name={prospectId}
      title={`${label}. Opens the record.`}
    >
      <span className={styles.label}>{children ?? label}</span>
      <span className="visually-hidden">, open record</span>
    </button>
  );
}
