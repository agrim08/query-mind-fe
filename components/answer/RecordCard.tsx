interface RecordCardProps {
  columns: string[];
  row: Record<string, unknown>;
}

function display(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/** A single matching row, shown as label: value pairs (easier to read than a one-row table). */
export default function RecordCard({ columns, row }: RecordCardProps) {
  return (
    <dl className="record-list">
      {columns.map((column) => (
        <div key={column} style={{ display: "contents" }}>
          <dt>{column.replace(/_/g, " ")}</dt>
          <dd>{display(row[column])}</dd>
        </div>
      ))}
    </dl>
  );
}
