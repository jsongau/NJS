/**
 * CSV export, hand-rolled and RFC 4180 correct.
 *
 * The bug that bites every hand-rolled CSV is an unescaped comma or
 * quote in a field, and this dataset contains "Stater Bros., Rowland
 * Heights" and "Salty Caramel Bolder 7.5oz (12% ABV)" — exactly the
 * fields that break a naive join(","). Escaping is done once, here, and
 * every column goes through it.
 */

export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  // Quote if the field contains a comma, a quote, a newline, or leading
  // or trailing whitespace that would otherwise be eaten.
  if (/[",\r\n]/.test(s) || s !== s.trim()) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [
    headers.map(csvCell).join(","),
    ...rows.map((r) => r.map(csvCell).join(",")),
  ];
  // CRLF per RFC 4180. Excel is happier and nothing else minds.
  return lines.join("\r\n");
}

/**
 * Download a CSV in the browser.
 *
 * The BOM is not decoration: without it Excel decodes UTF-8 as its local
 * codepage and mangles anything non-ASCII in a store or product name.
 */
export function downloadCsv(filename: string, content: string): void {
  const BOM = "﻿";
  const blob = new Blob([BOM + content], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke on the next tick; revoking synchronously can cancel the
  // download in some browsers.
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
