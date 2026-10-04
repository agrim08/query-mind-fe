"use client";

import { useState } from "react";
import type { AnswerChart } from "@/lib/api";
import type { QueryResult } from "@/lib/store";
import BarChart from "./BarChart";
import KpiFigures from "./KpiFigures";
import LineChart from "./LineChart";
import MetaBar from "./MetaBar";
import RecordCard from "./RecordCard";
import ResultsTable from "./ResultsTable";
import SuggestionChips from "./SuggestionChips";

interface AnswerViewProps {
  result: QueryResult;
  onAsk: (question: string) => void;
  busy?: boolean;
}

/**
 * An answer as an analyst would present it: what was understood, a one-line headline, the
 * assumptions made, the right chart for the data, and one-click next questions. Charts are
 * chosen on the backend (answer_presentation.py); the table is always one click away, so no
 * value is reachable only through the chart.
 */
/**
 * The chart, if its data has the shape this version draws; otherwise the table. An answer must
 * never crash the page, e.g. when the backend and frontend are briefly on different versions.
 */
function drawableChart(chart: AnswerChart | undefined): AnswerChart {
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

export default function AnswerView({ result, onAsk, busy }: AnswerViewProps) {
  const answer = result.answer;
  const chart = drawableChart(answer?.chart);
  const hasVisual = chart.kind !== "table" && result.rows.length > 0;
  const [showTable, setShowTable] = useState(false);

  return (
    <div className="animate-fade-up" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="card answer-card">
        {answer?.understood && <div className="answer-understood">{answer.understood}</div>}
        {answer?.headline && <div className="answer-headline">{answer.headline}</div>}
        {answer && answer.assumptions.length > 0 && (
          <div className="answer-assumptions">
            {answer.assumptions.map((a) => (
              <span key={a}>Assumed: {a}</span>
            ))}
          </div>
        )}

        {hasVisual && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div className="view-toggle" role="group" aria-label="Answer view">
              <button type="button" aria-pressed={!showTable} onClick={() => setShowTable(false)}>
                Chart
              </button>
              <button type="button" aria-pressed={showTable} onClick={() => setShowTable(true)}>
                Table
              </button>
            </div>
          </div>
        )}

        {hasVisual && !showTable && chart.kind === "kpi" && <KpiFigures items={chart.items} />}
        {hasVisual && !showTable && chart.kind === "line" && chart.shared_axis && (
          <LineChart labels={chart.labels} series={chart.series} xLabel={chart.x_label} />
        )}
        {hasVisual && !showTable && chart.kind === "line" && !chart.shared_axis && (
          // Different measures (e.g. revenue and order count) get a panel each: never one axis.
          <div className="chart-panels">
            {chart.series.map((s) => (
              <figure key={s.name}>
                <figcaption className="chart-panel-title">{s.name}</figcaption>
                <LineChart labels={chart.labels} series={[s]} xLabel={chart.x_label} />
              </figure>
            ))}
          </div>
        )}
        {hasVisual && !showTable && chart.kind === "bar" && (
          <div className="chart-panels">
            {chart.series.map((s) => (
              <figure key={s.name}>
                {chart.series.length > 1 && <figcaption className="chart-panel-title">{s.name}</figcaption>}
                <BarChart labels={chart.labels} values={s.values} valueLabel={s.name} />
              </figure>
            ))}
          </div>
        )}
        {hasVisual && !showTable && chart.kind === "record" && (
          <RecordCard columns={result.columns} row={result.rows[0]} />
        )}

        {answer && (
          <>
            <SuggestionChips label="Instead:" questions={answer.alternatives} onAsk={onAsk} disabled={busy} />
            <SuggestionChips label="Next:" questions={answer.follow_ups} onAsk={onAsk} disabled={busy} />
          </>
        )}
      </div>

      <MetaBar
        rowCount={result.rowCount}
        execTimeMs={result.execTimeMs}
        truncated={result.truncated}
        columns={result.columns}
        rows={result.rows}
      />
      {(!hasVisual || showTable) && result.rows.length > 0 && (
        <ResultsTable columns={result.columns} rows={result.rows} />
      )}
      {result.rows.length === 0 && (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)", fontSize: 14 }}>
          No rows matched your question.
        </div>
      )}
    </div>
  );
}
