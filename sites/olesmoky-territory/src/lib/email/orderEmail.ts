import type { Distributor, Period } from "@/domain/types";
import type { SupplySignal } from "@/domain/selectors/supply";
import { accountsOutOf, accountsLowOn } from "@/domain/selectors/supply";

/**
 * The replenishment email, built from whatever is selected on the supply
 * desk. Both an HTML part and a plain-text part, because a distributor
 * order desk may be reading in Outlook, in a webmail client that strips
 * styles, or on a phone.
 *
 * Every line is itemized: SKU, package, cases, pallets, and the reason it
 * is short. The reason matters. An order recommendation without a reason
 * reads as a supplier pushing inventory, and an order desk that thinks
 * that will discount everything you send them afterwards.
 */

export interface OrderEmailInput {
  distributor: Distributor;
  period: Period | undefined;
  territoryName: string;
  signals: SupplySignal[];
  quantities: Record<string, number>;
  portalLink: string;
  reference: string;
  preparedBy: string;
  /** Typed by the rep in the send modal. Goes into BOTH parts. */
  note?: string;
  subjectOverride?: string;
}

export interface BuiltEmail {
  to: string;
  subject: string;
  /** The EMAIL BODY. What actually gets sent in the message. */
  text: string;
  /**
   * The ATTACHMENT, not a prettier version of the body.
   *
   * These used to be two renderings of the same message, which made the
   * compose window look like it was showing two different emails and left
   * a real question about which one was going out. They are now two
   * different artifacts: `text` is the note, `html` is the one-page order
   * sheet that rides along with it.
   */
  html: string;
  /** Filename the body refers to and the compose window shows. */
  attachmentName?: string;
  totalCases: number;
  totalPallets: number;
  lineCount: number;
}

function reasonFor(s: SupplySignal): string {
  const out = accountsOutOf(s.skuId);
  const low = accountsLowOn(s.skuId);
  const bits: string[] = [];
  if (out.length) {
    bits.push(
      `out at ${out.slice(0, 3).join(", ")}${out.length > 3 ? ` and ${out.length - 3} more` : ""}`,
    );
  }
  if (low.length) bits.push(`low at ${low.slice(0, 2).join(", ")}`);
  bits.push(`${s.weeklyDepletion} cases a week across ${s.accountsCarrying} accounts`);
  return bits.join("; ");
}

const esc = (v: string) =>
  v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function buildOrderEmail(input: OrderEmailInput): BuiltEmail {
  const { distributor, period, territoryName, signals, quantities, portalLink, reference, preparedBy, note, subjectOverride } = input;

  const rows = signals.map((s) => {
    const cases = quantities[s.skuId] ?? s.recommendedCases;
    const pallets = s.casesPerPallet ? cases / s.casesPerPallet : 0;
    return { s, cases, pallets, reason: reasonFor(s) };
  });

  const totalCases = rows.reduce((n, r) => n + r.cases, 0);
  const totalPallets = rows.reduce((n, r) => n + r.pallets, 0);

  const subject =
    subjectOverride?.trim() ||
    `Replenishment for ${territoryName}, ${rows.length} SKU${rows.length === 1 ? "" : "s"} running short`;

  // --- plain text ------------------------------------------------
  const textLines = rows.map(
    (r) =>
      `  ${r.s.label}\n` +
      `    ${r.cases} cases (${r.pallets.toFixed(2)} pallets, ${r.s.packageLabel})\n` +
      `    ${r.reason}`,
  );

  const text = `Hello,
${note?.trim() ? `\n${note.trim()}\n` : ""}
Walking ${territoryName} this week, ${rows.length} SKU${rows.length === 1 ? " is" : "s are"} running short and a few accounts are already empty. Suggested quantities below, ${totalCases} cases in total.

${textLines.join("\n\n")}

Total: ${totalCases} cases, ${totalPallets.toFixed(2)} pallets.

This is the order we would cut for you. Do you want us to fulfill it as written? The quantities are already filled in, and can be changed first:
${portalLink}

Anything that does not fit the warehouse this period, change it on that page and I will work around it. Nothing ships until you confirm.

Thank you,
${preparedBy}
Reference ${reference}`;

  // --- html ------------------------------------------------------
  const htmlRows = rows
    .map(
      (r) => `
        <tr>
          <td style="padding:10px 8px;border-bottom:1px solid #e3e7ec;vertical-align:top;">
            <div style="font-weight:600;color:#14181f;">${esc(r.s.label)}</div>
            <div style="font-size:12px;color:#6b7684;margin-top:2px;">${esc(r.reason)}</div>
          </td>
          <td style="padding:10px 8px;border-bottom:1px solid #e3e7ec;text-align:right;white-space:nowrap;vertical-align:top;">
            <div style="font-weight:700;font-size:16px;color:#14181f;">${r.cases}</div>
            <div style="font-size:11px;color:#8f99a6;">cases</div>
          </td>
          <td style="padding:10px 8px;border-bottom:1px solid #e3e7ec;text-align:right;white-space:nowrap;vertical-align:top;color:#6b7684;font-size:13px;">
            ${r.pallets.toFixed(2)}<br><span style="font-size:11px;color:#8f99a6;">pallets</span>
          </td>
        </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f7f8fa;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8fa;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e3e7ec;border-radius:10px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif;">

  <tr><td style="padding:20px 22px 0;">
    <div style="display:inline-block;padding:4px 10px;border:1px solid #8a5a00;border-radius:999px;background:#fdf3e0;color:#8a5a00;font-size:11px;font-weight:700;">
      Demo workflow. Nothing is ordered and nothing is sent.
    </div>
  </td></tr>

  <tr><td style="padding:16px 22px 0;">
    <div style="font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#8f99a6;font-weight:700;">Replenishment recommendation</div>
    <h1 style="margin:6px 0 8px;font-size:21px;color:#14181f;">${esc(distributor.name)}, ${esc(period?.label ?? "current period")}</h1>
    ${note?.trim() ? `<p style="margin:0 0 10px;padding:10px 12px;border-left:3px solid #14181f;background:#f7f7f4;font-size:14px;line-height:1.55;color:#14181f;">${esc(note.trim()).replace(/\n/g, "<br>")}</p>` : ""}
    <p style="margin:0;font-size:14px;line-height:1.55;color:#4a5461;">
      Walking ${esc(territoryName)} this week, ${rows.length} SKU${rows.length === 1 ? " is" : "s are"} running short and a few accounts are already empty. Suggested quantities below.
    </p>
  </td></tr>

  <tr><td style="padding:18px 22px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <thead>
        <tr>
          <th align="left" style="padding:0 8px 6px;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#8f99a6;border-bottom:1px solid #b6bfca;">Item and why</th>
          <th align="right" style="padding:0 8px 6px;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#8f99a6;border-bottom:1px solid #b6bfca;">Cases</th>
          <th align="right" style="padding:0 8px 6px;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#8f99a6;border-bottom:1px solid #b6bfca;">Pallets</th>
        </tr>
      </thead>
      <tbody>${htmlRows}</tbody>
      <tfoot>
        <tr>
          <td style="padding:12px 8px 0;font-weight:700;color:#14181f;">Total</td>
          <td align="right" style="padding:12px 8px 0;font-weight:700;color:#14181f;">${totalCases}</td>
          <td align="right" style="padding:12px 8px 0;font-weight:700;color:#14181f;">${totalPallets.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
  </td></tr>

  <tr><td style="padding:22px 22px 0;" align="center">
    <a href="${esc(portalLink)}" style="display:inline-block;padding:12px 22px;background:#1f5fd0;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;">
      Yes, fulfill this order
    </a>
    <p style="margin:10px 0 0;font-size:12px;color:#6b7684;">
      Or change the quantities on that page first. Nothing ships until you confirm.
    </p>
  </td></tr>

  <tr><td style="padding:20px 22px 22px;">
    <p style="margin:0 0 4px;font-size:13px;color:#4a5461;">Thank you,<br>${esc(preparedBy)}</p>
    <p style="margin:12px 0 0;padding-top:12px;border-top:1px solid #e3e7ec;font-size:11px;line-height:1.5;color:#8f99a6;">
      Reference ${esc(reference)}. Independent portfolio prototype by Nathan J. Song. Not affiliated with, commissioned by, or endorsed by Ole Smoky Distillery, Southern Glazer's Wine & Spirits, or Southern Glazer's. Depletion, inventory and account figures are modeled.
    </p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`;

  return {
    to: distributor.contactEmail,
    subject,
    text,
    html,
    totalCases,
    totalPallets,
    lineCount: rows.length,
  };
}
