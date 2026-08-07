import type { Account, RetailContact } from "@/domain/types";
import type { RetailOrderLine } from "@/domain/selectors/retailOrder";
import type { BuiltEmail } from "./orderEmail";
import { DELIVERY_WINDOW } from "./deliveryWindow";

/**
 * The message that goes to a store.
 *
 * Two-part construction, because a store manager may be reading in
 * Outlook on a back-office machine that strips styles, so the plain text
 * has to carry the whole order on its own.
 *
 * THE STRUCTURE IS THE ARGUMENT. This was rebuilt against the research
 * rather than against taste, and four findings drove every decision:
 *
 *  1. A phone reply runs a MEDIAN OF TWENTY WORDS. Kooti and colleagues
 *     measured it across 16 billion messages: phone 20 words, desktop 60.
 *     Roughly 90% of email opens are Apple Mail or Gmail. So if approving
 *     this order takes more than a few words of typing, the manager waits
 *     until they are at a desk — and waiting until later is how the order
 *     dies. Approval here is one word. Cutting a line is three.
 *
 *  2. Average attention on an email is about eleven seconds, and a fifth
 *     of opens are under two. So the ask goes in the subject line and the
 *     first two lines. The item list sits BELOW it, because the list is
 *     what a manager checks after deciding, not what they read to decide.
 *
 *  3. A short, real deadline moves behaviour hard, and the pull is
 *     strongest on people who feel busy. See deliveryWindow.ts. The
 *     deadline is a load cutoff, not a manufactured one.
 *
 *  4. Urgency piled on an undecided buyer makes them freeze — that is the
 *     finding out of 2.5 million recorded sales conversations, where most
 *     lost deals go to no-decision rather than to a competitor. So the
 *     close DE-RISKS instead of pushing: anything that does not move gets
 *     pulled on the next pass. The manager's downside is capped, out loud.
 *
 * What is deliberately NOT here: invented scarcity, an assumed opt-out
 * ("I will send it unless I hear otherwise" is unordered merchandise, and
 * a negative-option practice), flattery, and any second ask. One question,
 * closed, answerable with one word.
 *
 * Every line still says what the shelf looks like and how that was
 * learned. A manager who is told their White Lightnin' is empty will walk over
 * and check, and the message has to survive that walk.
 */

export interface RetailEmailInput {
  account: Account;
  contact: RetailContact;
  lines: RetailOrderLine[];
  quantities: Record<string, number>;
  portalLink: string;
  reference: string;
  preparedBy: string;
  distributorName: string;
  note?: string;
  subjectOverride?: string;
}

const esc = (v: string) =>
  v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** "A", "A and B", "A, B and C". Small, and it is the difference between
 *  a sentence a person wrote and a string a program concatenated. */
function listOf(items: string[], limit = 3): string {
  const uniq = [...new Set(items)];
  if (uniq.length === 0) return "";
  if (uniq.length === 1) return uniq[0];
  const head = uniq.slice(0, limit);
  const rest = uniq.length - head.length;
  if (rest > 0) return `${head.join(", ")} and ${rest} more`;
  return `${head.slice(0, -1).join(", ")} and ${head[head.length - 1]}`;
}

/**
 * What a line is called on a page a RETAILER reads.
 *
 * "Out of stock" and "Running low" assert a fact about the manager's own
 * shelf, which a supplier does not actually know and which the manager
 * can disprove by walking twenty feet. "May be out" is the honest form of
 * the same claim, and an honest hedge costs nothing next to a confident
 * statement that turns out to be wrong.
 */
const KIND_LABEL: Record<RetailOrderLine["kind"], string> = {
  out: "May be out",
  low: "May be low",
  new: "Not carried yet",
  steady: "Top up",
};

export function buildRetailerEmail(input: RetailEmailInput): BuiltEmail {
  const {
    account,
    contact,
    lines,
    quantities,
    portalLink,
    reference,
    preparedBy,
    distributorName,
    note,
    subjectOverride,
  } = input;

  const rows = lines.map((l) => ({
    l,
    cases: quantities[l.skuId] ?? l.suggestedCases,
  }));

  const totalCases = rows.reduce((n, r) => n + r.cases, 0);

  /**
   * The attachment's filename.
   *
   * It appears in the email body, on the chip in the compose window, and
   * over the sheet itself, so it is computed once. Three places quoting a
   * filename that three different string literals produce is how a demo
   * ends up saying "see attached" about a file that is not there.
   */
  const attachmentName = `suggested-order-${account.slug}-${reference.toLowerCase()}.pdf`;
  const emptyCount = rows.filter((r) => r.l.kind === "out").length;
  const newCount = rows.filter((r) => r.l.kind === "new").length;

  /**
   * The evidence sentence. One clause on the work already done, which is
   * the reciprocity and the data authority in the same breath, then what
   * the shelf actually looked like.
   */
  const emptyNames = rows
    .filter((r) => r.l.kind === "out")
    .map((r) => r.l.label);
  const lowNames = rows.filter((r) => r.l.kind === "low").map((r) => r.l.label);

  /**
   * The opening claim, and it is about the CATEGORY, not about their
   * shelf.
   *
   * Two earlier versions both got this wrong. The first said "I was
   * through your store and counted your back shelf", which reads like a
   * supplier walking a manager's aisles taking notes. The second said
   * "your movement has this at zero on the last read", which is the same
   * surveillance wearing a spreadsheet.
   *
   * A supplier does not know what is on a store's shelf today, and
   * pretending otherwise is both creepy and fragile: the manager can walk
   * twenty feet and disprove it, and then every other number here is
   * suspect. So the sentence offers a run rate and lands on "you may be
   * low" — a suggestion the manager is free to check, which is the only
   * version of this claim that survives contact.
   *
   * IT NAMES THE STORE RATHER THAN A CATEGORY. "Trending across stores
   * like yours" hedged a number that is modeled per account anyway, and
   * the hedge did real damage: it told a manager they were a comparable.
   * A rep who knows the account writes to the account.
   */
  const shelfSentence =
    emptyCount > 0
      ? `Going on how fast these turn at ${account.chainName} on ${account.address.replace(/^[0-9]+ /, "")}, you are out of ${listOf(emptyNames)} by now${lowNames.length ? `, and getting low on ${listOf(lowNames)}` : ""}.`
      : `Going on how fast these turn at ${account.chainName} on ${account.address.replace(/^[0-9]+ /, "")}, you are getting low on ${listOf(lowNames)}.`;

  /**
   * Subject line. Concrete and operational: a number, a day, and the ask.
   * Yesware's half-million-email set found operational words far
   * outperform soft scheduling words, and length had no measurable
   * effect — so this optimises for what is IN it, not how short it is.
   */
  const subject =
    subjectOverride?.trim() ||
    `${account.chainName} ${account.city}: ${totalCases} cases on ${DELIVERY_WINDOW.deliveryLabel} — reply YES?`;

  // --- plain text ------------------------------------------------

  /**
   * The order, bulleted and aligned.
   *
   * Plain-text mail renders in a monospaced face in nearly every client,
   * so a dot leader actually lines the numbers up into a column instead
   * of leaving them ragged. That matters more than it sounds: a manager
   * scanning on a phone reads DOWN the case column, and a ragged right
   * edge makes them read every line instead of one.
   *
   * Padded to a fixed width rather than the longest label, so the column
   * sits in the same place whether the order has two lines or nine.
   */
  /**
   * One geometry for every line, so the case column lands in the same
   * place on all of them.
   *
   * The first cut padded to a fixed right EDGE, which lined up the word
   * "cases" and left the numbers ragged: a 24 and a 6 do not start in the
   * same column. So the count is right-aligned in a field as wide as the
   * widest count, and the whole line is then padded to a fixed width.
   * Both the digits and the unit line up.
   *
   * Plain-text mail renders in a monospaced face in nearly every client,
   * which is what makes a dot leader work at all. A manager scanning on a
   * phone reads DOWN the case column; a ragged column makes them read
   * every line instead of one.
   */
  /**
   * The label is the SKU name only. It already carries its pack — "Salty
   * Lite 12pk 12oz cans" — so appending the package a second time gave
   * "Sparkling Lemonade Hard Seltzer variety 12pk, 12pk cans", which said the
   * same thing twice and pushed the line past the column, collapsing the
   * leader to a single dot. The attached sheet carries the package on its
   * own row for anyone who wants it spelled out.
   */
  const labels = rows.map((r) => r.l.label);

  const countWidth = Math.max(
    ...rows.map((r) => String(r.cases).length),
    String(totalCases).length,
  );

  /**
   * Width is DERIVED, not chosen. A fixed 58 looked fine until a long
   * SKU name arrived and there was no room left for the dots. Measuring
   * the longest label means the column always has at least three dots
   * leading into it, whatever is in the order.
   */
  const MIN_DOTS = 3;
  const LINE_WIDTH =
    4 +
    Math.max(...labels.map((l) => l.length), "TOTAL".length) +
    1 +
    MIN_DOTS +
    1 +
    countWidth +
    6;

  const leaderLine = (
    indent: string,
    label: string,
    cases: number,
    fill: string,
  ): string => {
    const head = `${indent}${label} `;
    const tail = ` ${String(cases).padStart(countWidth)} cases`;
    const room = Math.max(1, LINE_WIDTH - head.length - tail.length);
    return head + fill.repeat(room) + tail;
  };

  const textLines = rows.map((r) => leaderLine("  - ", r.l.label, r.cases, "."));

  /** The total sits in the same column, on a heavier rule. */
  const totalLine = leaderLine("    ", "TOTAL", totalCases, "=");

  const text = `Hi,

Reply YES and I will put ${totalCases} cases on your ${DELIVERY_WINDOW.deliveryLabel} delivery. ${distributorName} cuts that load ${DELIVERY_WINDOW.cutoffLabel}.

${note?.trim() ? note.trim() : shelfSentence}${newCount > 0 ? ` There ${newCount === 1 ? "is also one item" : `are also ${newCount} items`} you are already approved for that you are not stocking yet.` : ""}

The full sheet is attached. Here it is in short:

${textLines.join("\n")}

${totalLine}

If something does not fit, reply YES MINUS and the item and I will take it off. And if a line does not move, I will pull it myself on my next pass, so you are not left sitting on it.

Prefer to change the numbers yourself? The same sheet is live here:
${portalLink}

Thanks,
${preparedBy}
Ole Smoky
Reference ${reference}

Attached: ${attachmentName}

Ole Smoky does not sell or deliver spirits to stores in California. Whatever you confirm goes to ${distributorName}, who handles your delivery.

Demonstration message. Nothing was ordered and nothing was transmitted.`;

  // --- html ------------------------------------------------------
  const htmlRows = rows
    .map(
      (r) => `
        <tr>
          <td style="padding:10px 8px;border-bottom:1px solid #e3e7ec;vertical-align:top;">
            <div style="font-weight:600;color:#14181f;">${esc(r.l.label)}</div>
            <div style="font-size:11px;color:#8f99a6;margin-top:1px;">${esc(r.l.packageLabel)} · ${esc(KIND_LABEL[r.l.kind])}</div>
            <div style="font-size:12px;color:#6b7684;margin-top:3px;">${esc(r.l.reason)}</div>
          </td>
          <td style="padding:10px 8px;border-bottom:1px solid #e3e7ec;text-align:right;white-space:nowrap;vertical-align:top;">
            <div style="font-weight:700;font-size:16px;color:#14181f;">${r.cases}</div>
            <div style="font-size:11px;color:#8f99a6;">cases</div>
          </td>
        </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f7f8fa;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8fa;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e3e7ec;border-radius:10px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif;">

  <!-- This document is the ATTACHMENT, not the email. So it opens like a
       sheet: a filename across the top, no greeting, no sign-off. The
       greeting and the sign-off belong to the message that carries it,
       and having both wear the same clothes is what made it unclear which
       of the two was actually being sent. -->
  <tr><td style="padding:16px 22px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="font-size:11px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#6b7684;">
          &#9636; ${esc(attachmentName)}
        </td>
        <td align="right" style="font-size:10px;color:#8a5a00;font-weight:700;">
          DEMO &middot; NOTHING IS ORDERED
        </td>
      </tr>
    </table>
    <div style="height:1px;background:#e3e7ec;margin:10px 0 16px;"></div>
    <div style="font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#8f99a6;font-weight:700;">Suggested order</div>
    <h1 style="margin:6px 0 4px;font-size:21px;color:#14181f;">${esc(account.chainName)}, ${esc(account.city)}</h1>
    <div style="font-size:12px;color:#8f99a6;">${esc(account.address)} &middot; for the ${esc(contact.role.toLowerCase())} &middot; prepared ${esc(DELIVERY_WINDOW.cutoffLabel)} cutoff</div>
  </td></tr>

  <!-- THE ASK, above everything.
       Eleven seconds of attention and a fifth of opens under two, so what
       is being asked has to be legible before any scrolling and before the
       item list. The list is what a manager checks after deciding. -->
  <tr><td style="padding:16px 22px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #14181f;border-radius:10px;background:#f7f7f4;">
      <tr><td style="padding:16px 18px;">
        <p style="margin:0;font-size:17px;line-height:1.45;color:#14181f;">
          Reply <strong>YES</strong> and I will put
          <strong>${totalCases} cases</strong> on your
          <strong>${esc(DELIVERY_WINDOW.deliveryLabel)} delivery</strong>.
        </p>
        <p style="margin:8px 0 0;font-size:13px;line-height:1.5;color:#4a5461;">
          ${esc(distributorName)} cuts that load ${esc(DELIVERY_WINDOW.cutoffLabel)}. One word is all I need.
        </p>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:18px 22px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <thead>
        <tr>
          <th align="left" style="padding:0 8px 6px;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#8f99a6;border-bottom:1px solid #b6bfca;">Item and why</th>
          <th align="right" style="padding:0 8px 6px;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#8f99a6;border-bottom:1px solid #b6bfca;">Cases</th>
        </tr>
      </thead>
      <tbody>${htmlRows}</tbody>
      <tfoot>
        <tr>
          <td style="padding:12px 8px 0;font-weight:700;color:#14181f;">Total</td>
          <td align="right" style="padding:12px 8px 0;font-weight:700;color:#14181f;">${totalCases}</td>
        </tr>
      </tfoot>
    </table>
  </td></tr>

  <!-- De-risk, do not urge. Piling urgency on an undecided buyer makes
       them freeze; capping their downside out loud is what moves them. -->
  <tr><td style="padding:20px 22px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e3e7ec;border-radius:8px;background:#ffffff;">
      <tr><td style="padding:14px 16px;font-size:13px;line-height:1.6;color:#4a5461;">
        If something does not fit, reply <strong style="color:#14181f;">YES MINUS</strong>
        and the item and I will take it off. And if a line does not move,
        I will pull it myself on my next pass, so you are not left sitting on it.
      </td></tr>
    </table>
    <p style="margin:14px 0 0;font-size:13px;color:#6b7684;">
      Want to change the numbers first?
      <a href="${esc(portalLink)}" style="color:#0a4f8f;font-weight:600;">Open the order</a>
      &mdash; everything is already filled in.
    </p>
  </td></tr>

  <tr><td style="padding:20px 22px 0;">
    <div style="padding:12px 14px;border:1px solid #e3e7ec;border-radius:8px;background:#f7f8fa;font-size:12px;line-height:1.55;color:#4a5461;">
      <strong style="color:#14181f;">Where this goes.</strong> Ole Smoky does not sell or deliver spirits to stores in California. Whatever you confirm is passed to ${esc(distributorName)}, who handles your delivery and will schedule it the usual way.
    </div>
  </td></tr>

  <tr><td style="padding:18px 22px 22px;">
    <p style="margin:0;padding-top:12px;border-top:1px solid #e3e7ec;font-size:11px;line-height:1.5;color:#8f99a6;">
      Prepared by ${esc(preparedBy)}, Ole Smoky.
    </p>
    <p style="margin:8px 0 0;font-size:11px;line-height:1.5;color:#8f99a6;">
      Reference ${esc(reference)}. Independent portfolio prototype by Nathan J. Song. Not affiliated with, commissioned by, or endorsed by Ole Smoky Distillery, Southern Glazer's Wine & Spirits, or ${esc(account.chainName)}. Inventory, depletion and account figures are modeled.
    </p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`;

  return {
    to: contact.email,
    subject,
    text,
    html,
    attachmentName,
    totalCases,
    totalPallets: 0,
    lineCount: rows.length,
  };
}
