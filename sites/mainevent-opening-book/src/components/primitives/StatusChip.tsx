import type { EmailConfidence, PitchStatus } from "@/domain/types";
import {
  EMAIL_CONFIDENCE,
  PITCH_STATUS,
  PITCH_STATUS_SHORT,
  type StatusToken,
} from "@/domain/vocabulary";
import styles from "./StatusChip.module.css";

/**
 * Status, rendered the only way this app allows: GLYPH plus WORD plus
 * COLOUR, always all three, in that order of importance.
 *
 * The rule is absolute and it has no compact mode that drops the word.
 * There is a `short` variant, and what it does is swap the label for a
 * shorter label rather than remove it, because "◑" alone is a shape a
 * reader has to be taught and "Live" is a word they already know. A chip
 * that keeps the dot and loses the text has kept the decoration and
 * thrown away the meaning.
 *
 * The owner of this site is colourblind. That is the stated reason, and
 * it is also the smaller half of the argument: a status that survives
 * greyscale also survives a screenshot pasted into a deck, a printout on
 * a GM's desk, and a phone in bright sun. Designing for the one reader
 * who needs it produces a better chip for everybody else.
 */

function Chip({
  token,
  size,
  ariaPrefix,
}: {
  token: StatusToken;
  size: "sm" | "md";
  ariaPrefix: string;
}) {
  return (
    <span
      className={[styles.chip, styles[size]].join(" ")}
      style={{ ["--tone" as string]: token.cssVar }}
      title={token.note ? `${token.label}. ${token.note}` : token.label}
    >
      <span className={styles.glyph} aria-hidden="true">
        {token.glyph}
      </span>
      <span className={styles.label}>{token.label}</span>
      <span className="visually-hidden">{ariaPrefix}</span>
    </span>
  );
}

/**
 * Where a prospect stands on a package.
 *
 * `short` is for a table cell or a map popup where the full phrase will
 * not fit. It is not a density preference to be applied globally: the
 * desk shows the full words, because the desk is where a reader is
 * learning what the six states mean.
 */
export function StatusChip({
  status,
  size = "md",
  short = false,
}: {
  status: PitchStatus;
  size?: "sm" | "md";
  short?: boolean;
}) {
  const token = short ? PITCH_STATUS_SHORT[status] : PITCH_STATUS[status];
  return <Chip token={token} size={size} ariaPrefix="pitch status" />;
}

/**
 * Whether this organisation can be reached in writing at all.
 *
 * THIS IS THE HIGHEST-WEIGHTED CRITERION ON THE DESK and the least
 * romantic one. An organisation that publishes the decision maker's
 * address costs two minutes a touch. An organisation that publishes
 * neither an address nor a form costs a forty minute round trip, and
 * there are sixty-eight of them and one person. So the chip is loud
 * enough to be scanned down a column.
 *
 * Every "Published email" chip in this app is backed by a URL on the
 * prospect row, which a reader can click and check. Nothing here was
 * pattern-guessed from a domain name, because one invented address is
 * enough to make a reader reasonably distrust every other figure on the
 * screen.
 */
export function EmailConfidenceChip({
  confidence,
  size = "md",
}: {
  confidence: EmailConfidence;
  size?: "sm" | "md";
}) {
  return (
    <Chip
      token={EMAIL_CONFIDENCE[confidence]}
      size={size}
      ariaPrefix="written contact route"
    />
  );
}

/**
 * A generic chip for the other vocabularies, so a page that needs to
 * render an ACTIVITY_TYPE or a REPLY_DISPOSITION does not invent a fourth
 * chip component with slightly different padding.
 *
 * It takes a token rather than a union, which is the one place this file
 * trades type safety for reach. The trade is fine because every token in
 * the vocabulary has the same three fields by construction, and the
 * alternative was four near-identical components.
 */
export function TokenChip({
  token,
  size = "md",
  label,
}: {
  token: StatusToken;
  size?: "sm" | "md";
  /** Overrides the token's own word. Used where context already says it. */
  label?: string;
}) {
  return (
    <Chip
      token={label ? { ...token, label } : token}
      size={size}
      ariaPrefix=""
    />
  );
}
