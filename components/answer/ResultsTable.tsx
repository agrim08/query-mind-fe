interface ResultsTableProps {
  columns: string[];
  rows: Record<string, unknown>[];
}

/**
 * One table in one scroll container, so header and body always share column widths;
 * the header row stays visible while scrolling (sticky `th` in globals.css).
 */
export default function ResultsTable({ columns, rows }: ResultsTableProps) {
  return (
    <div className="card" style={{ overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
      <div style={{ maxHeight: 420, overflow: "auto" }}>
        <table className="results-table">
          <thead>
            <tr>
              {columns.map((col, c) => (
                <th key={c}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {columns.map((col, c) => (
                  <td key={c} title={String(row[col] ?? "")}>
                    {row[col] === null || row[col] === undefined ? (
                      <span style={{ color: "var(--text-tertiary)", fontStyle: "italic" }}>NULL</span>
                    ) : (
                      String(row[col])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
