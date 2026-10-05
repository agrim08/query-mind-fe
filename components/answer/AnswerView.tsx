"use client";

import { useState } from "react";
import type { QueryResult } from "@/lib/store";
import ChartView, { drawableChart } from "./ChartView";
import MetaBar from "./MetaBar";
import ResultsTable from "./ResultsTable";
import SuggestionChips from "./SuggestionChips";
import VerifyButton from "./VerifyButton";

interface AnswerViewProps {
  result: QueryResult;
  onPick: (question: string) => void;
  /** Ask the model again when the answer reused an earlier one. */
  onAskFresh?: () => void;
  busy?: boolean;
}

/**
 * An answer as an analyst would present it: what was understood, a one-line headline, the
 * assumptions made, the right chart for the data, and one-click next questions. Charts are
 * chosen on the backend (answer_presentation.py); the table is always one click away, so no
 * value is reachable only through the chart.
 */
export default function AnswerView({ result, onPick, onAskFresh, busy }: AnswerViewProps) {
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
        {result.reused && (
          <div className="answer-assumptions">
            <span>
              Same query as when you asked this before, run on today&rsquo;s data.{" "}
              {onAskFresh && (
                <button type="button" className="answer-inline-action" onClick={onAskFresh} disabled={busy}>
                  Write a new query
                </button>
              )}
            </span>
          </div>
        )}
        {result.verifiedMatch && (
          <div className="answer-assumptions">
            <span>Based on your verified answer to &ldquo;{result.verifiedMatch}&rdquo;.</span>
          </div>
        )}

        {(hasVisual || result.questionId) && (
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
            {result.questionId && <VerifyButton questionId={result.questionId} />}
            {hasVisual && <div className="view-toggle" role="group" aria-label="Answer view">
              <button type="button" aria-pressed={!showTable} onClick={() => setShowTable(false)}>
                Chart
              </button>
              <button type="button" aria-pressed={showTable} onClick={() => setShowTable(true)}>
                Table
              </button>
            </div>}
          </div>
        )}

        {hasVisual && !showTable && <ChartView chart={chart} columns={result.columns} rows={result.rows} />}

        {answer && (
          <>
            <SuggestionChips label="Instead:" questions={answer.alternatives} onPick={onPick} disabled={busy} />
            <SuggestionChips label="Next:" questions={answer.follow_ups} onPick={onPick} disabled={busy} />
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
