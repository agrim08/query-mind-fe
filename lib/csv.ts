/** RFC 4180 field: always quoted, quotes doubled; cells a spreadsheet would run as a formula are neutralised. */
function csvField(value: unknown): string {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

/** Download a CSV file built from a header row and data rows. */
export function downloadCsv(filename: string, header: string[], rows: unknown[][]): void {
  const lines = [header, ...rows].map((row) => row.map(csvField).join(","));
  const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
