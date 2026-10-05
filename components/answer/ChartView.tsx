import type { AnswerChart } from "@/lib/api";
import BarChart from "./BarChart";
import KpiFigures from "./KpiFigures";
import LineChart from "./LineChart";
import RecordCard from "./RecordCard";

/**
 * The chart, if its data has the shape this version draws; otherwise the table. An answer must
 * never crash the page, e.g. when the backend and frontend are briefly on different versions,
 * or when a saved answer is older than the current chart format.
 */
export function drawableChart(chart: AnswerChart | undefined): AnswerChart {
  if (!chart) return { kind: "table" };
  switch (chart.kind) {
    case "kpi":
      return Array.isArray(chart.items) && chart.items.length > 0 ? chart : { kind: "table" };
    case "line":
    case "bar":
      return Array.isArray(chart.labels) && Array.isArray(chart.series) && chart.series.length > 0
        ? chart
        : { kind: "table" };
    case "record":
      return chart;
    default:
      return { kind: "table" };
  }
}

interface ChartViewProps {
  /** Already checked with `drawableChart`, and not a table. */
  chart: AnswerChart;
  columns: string[];
  rows: Record<string, unknown>[];
}

/** Draws an answer's chart, as chosen on the backend (answer_presentation.py). */
export default function ChartView({ chart, columns, rows }: ChartViewProps) {
  switch (chart.kind) {
    case "kpi":
      return <KpiFigures items={chart.items} />;
    case "line":
      if (chart.shared_axis) return <LineChart labels={chart.labels} series={chart.series} xLabel={chart.x_label} />;
      // Different measures (e.g. revenue and order count) get a panel each: never one axis.
      return (
        <div className="chart-panels">
          {chart.series.map((s) => (
            <figure key={s.name}>
              <figcaption className="chart-panel-title">{s.name}</figcaption>
              <LineChart labels={chart.labels} series={[s]} xLabel={chart.x_label} />
            </figure>
          ))}
        </div>
      );
    case "bar":
      return (
        <div className="chart-panels">
          {chart.series.map((s) => (
            <figure key={s.name}>
              {chart.series.length > 1 && <figcaption className="chart-panel-title">{s.name}</figcaption>}
              <BarChart labels={chart.labels} values={s.values} valueLabel={s.name} />
            </figure>
          ))}
        </div>
      );
    case "record":
      return rows[0] ? <RecordCard columns={columns} row={rows[0]} /> : null;
    default:
      return null;
  }
}
