import { formatValue } from "./chartUtils";

interface KpiFiguresProps {
  items: { label: string; value: number }[];
}

/** One hero number, or a row of stat tiles when the answer has several figures. */
export default function KpiFigures({ items }: KpiFiguresProps) {
  const hero = items.length === 1;
  return (
    <div className="kpi-grid">
      {items.map((item) => (
        <div key={item.label}>
          <div className="kpi-label">{item.label}</div>
          <div className={hero ? "kpi-value kpi-value--hero" : "kpi-value"}>{formatValue(item.value)}</div>
        </div>
      ))}
    </div>
  );
}
