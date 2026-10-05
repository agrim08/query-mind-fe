"use client";

import { useState } from "react";
import { useSavedAnswer } from "@/hooks/useSavedAnswer";
import ChartView, { drawableChart } from "@/components/answer/ChartView";
import ResultsTable from "@/components/answer/ResultsTable";

/**
 * The answer as it was shown when the question was asked: headline, assumptions, chart, and the
 * first saved rows. Loaded only when the History row is opened.
 */
export default function SavedAnswerView({ questionId }: { questionId: string }) {
  const { saved, error, loading } = useSavedAnswer(questionId, true);
  const [showTable, setShowTable] = useState(false);

  if (loading) return <div className="skeleton" style={{ height: 120, borderRadius: "var(--radius-card)" }} />;
  if (error || !saved) return <p className="history-note">{error ?? "There's no saved answer for this question."}</p>;

  const { answer, columns, rows } = saved;
  const chart = drawableChart(answer.chart);
  const hasChart = chart.kind !== "table" && rows.length > 0;
  const shownRows = rows.length < saved.row_count ? `the first ${rows.length} of ${saved.row_count}${saved.truncated ? "+" : ""} rows` : null;

  return (
    <section className="saved-answer" aria-label="Answer when asked">
      <div className="saved-answer-head">
        <span className="history-label">Answer when asked</span>
        {hasChart && (
          <div className="view-toggle" role="group" aria-label="Answer view">
            <button type="button" aria-pressed={!showTable} onClick={() => setShowTable(false)}>
              Chart
            </button>
            <button type="button" aria-pressed={showTable} onClick={() => setShowTable(true)}>
              Table
            </button>
          </div>
        )}
      </div>

      {answer.headline && <p className="saved-answer-headline">{answer.headline}</p>}
      {answer.assumptions?.length > 0 && (
        <div className="answer-assumptions">
          {answer.assumptions.map((a) => (
            <span key={a}>Assumed: {a}</span>
          ))}
        </div>
      )}

      {hasChart && !showTable && <ChartView chart={chart} columns={columns} rows={rows} />}
      {(!hasChart || showTable) && rows.length > 0 && <ResultsTable columns={columns} rows={rows} />}
      {rows.length === 0 && <p className="history-note">No rows matched this question.</p>}

      {(!hasChart || showTable) && shownRows && (
        <p className="history-note">Saved with this question: {shownRows}. Use Ask again for the full, current result.</p>
      )}
    </section>
  );
}
