/**
 * CSV, for the one thing a spreadsheet is genuinely better at.
 *
 * A sales manager who wants to hand a week's go-see run to somebody else,
 * or drop the book into a GM's own workbook, should not be asked to
 * retype it. That is the whole scope of this file. It is not an
 * integration and it does not pretend to be one.
 *
 * QUOTING IS THE ONLY INTERESTING PART. Half the fields in this app are
 * prose written by a research pass, and prose contains commas, quotation
 * marks and the occasional newline. A naive join produces a file that
 * opens with the columns shifted from row nine onwards, which is worse
 * than no export at all because it looks like it worked.
 *
 * The BOM is deliberate. Excel on Windows reads a UTF-8 file without one
 * as Windows-1252 and turns every accented character into mojibake, and
 * "quinceanera" arriving mangled in a GM's spreadsheet is exactly the
 * kind of small wrongness that costs credibility for no reason.
 */

export type CsvValue = string | number | boolean | null | undefined;

/** RFC 4180 quoting. Double the quotes, wrap anything that needs it. */
function cell(value: CsvValue): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv(
  headers: string[],
  rows: CsvValue[][],
): string {
  return [headers.map(cell).join(","), ...rows.map((r) => r.map(cell).join(","))]
    .join("\r\n");
}

/**
 * Hands the browser a file. No network, no server, no dependency.
 *
 * The object URL is revoked on a timeout rather than immediately,
 * because Safari has historically cancelled the download if the URL dies
 * in the same tick the click fires.
 */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(["﻿", csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}
