export type CsvValue = string | number | null | undefined;

/** Byte order mark: makes Excel read the file as UTF-8, so Kurdish names come out right. */
const BOM = String.fromCharCode(0xfeff);
const CRLF = '\r\n';

/**
 * Spreadsheet apps treat a cell that starts with one of these as a formula,
 * so a user named "=HYPERLINK(...)" could run something on the admin's
 * computer (CSV injection). Such text gets a leading apostrophe.
 */
const FORMULA_START = /^[=+\-@\t\r]/;

export function csvCell(value: CsvValue): string {
  if (value === null || value === undefined) return '';
  let text = String(value);
  if (typeof value === 'string' && FORMULA_START.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** RFC 4180 CSV: comma-separated, quoted where needed, CRLF line endings. */
export function toCsv(header: string[], rows: CsvValue[][]): string {
  const lines = [header, ...rows].map((row) => row.map(csvCell).join(','));
  return BOM + lines.join(CRLF) + CRLF;
}
