import { Download } from "lucide-react";

interface MetaBarProps {
  rowCount: number;
  execTimeMs: number;
  truncated: boolean;
  columns: string[];
  rows: Record<string, unknown>[];
}

/** RFC 4180 field: always quoted, quotes doubled; cells a spreadsheet would run as a formula are neutralised. */
function csvField(value: unknown): string {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCsv(columns: string[], rows: Record<string, unknown>[]) {
  const lines = [columns.map(csvField).join(","), ...rows.map((r) => columns.map((c) => csvField(r[c])).join(","))];
  const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "querymind_results.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function MetaBar({ rowCount, execTimeMs, truncated, columns, rows }: MetaBarProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
      <span className="badge badge-success">{rowCount} rows</span>
      {truncated && (
        <span
          className="badge badge-warning"
          title="Results are capped at 500 rows. Add a filter or ask for a summary to see everything."
        >
          showing first {rowCount}
        </span>
      )}
      <span className="badge badge-default">
        {execTimeMs < 1000 ? `${execTimeMs}ms` : `${(execTimeMs / 1000).toFixed(2)}s`}
      </span>
      <span className="badge badge-default">{columns.length} columns</span>
      <div style={{ flex: 1 }} />
      <button className="btn btn-ghost btn-sm" onClick={() => downloadCsv(columns, rows)} style={{ gap: 4 }}>
        <Download size={12} />
        CSV
      </button>
    </div>
  );
}
