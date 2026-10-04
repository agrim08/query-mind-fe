"use client";

import { useCallback, useEffect, useRef } from "react";
import { Send, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { type ClarificationAnswer, streamQuery } from "@/lib/api";
import { useConnectionStore, useQueryStore } from "@/lib/store";
import AnswerView from "@/components/answer/AnswerView";
import ClarifyPanel from "@/components/answer/ClarifyPanel";
import SqlBlock from "@/components/sql/SqlBlock";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="skeleton" style={{ width: 180, height: 12 }} />
        <div className="skeleton" style={{ width: "70%", height: 18 }} />
        <div className="skeleton" style={{ width: "100%", height: 160 }} />
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const nlQuery = useQueryStore((s) => s.nlQuery);
  const streamingSql = useQueryStore((s) => s.streamingSql);
  const isStreaming = useQueryStore((s) => s.isStreaming);
  const result = useQueryStore((s) => s.result);
  const clarification = useQueryStore((s) => s.clarification);
  const message = useQueryStore((s) => s.message);
  const error = useQueryStore((s) => s.error);
  const selectedId = useConnectionStore((s) => s.selectedId);
  const abortRef = useRef<AbortController | null>(null);
  const askedRef = useRef("");

  useEffect(() => () => abortRef.current?.abort(), []);

  const ask = useCallback(
    async (question: string, answer?: ClarificationAnswer) => {
      const store = useQueryStore.getState();
      if (!question.trim()) return;
      if (!selectedId) {
        toast.error("Please select a connection first");
        return;
      }
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      askedRef.current = question;
      store.startStream();

      try {
        await streamQuery(
          { nl_query: question, connection_id: selectedId, clarification: answer },
          (event) => {
            const s = useQueryStore.getState();
            switch (event.type) {
              case "retry":
                s.restartSql();
                break;
              case "sql_chunk":
                if (event.chunk) s.appendSqlChunk(event.chunk);
                break;
              case "results":
                s.setResult({
                  sql: event.sql ?? s.streamingSql,
                  rows: event.rows ?? [],
                  columns: event.columns ?? [],
                  rowCount: event.row_count ?? 0,
                  execTimeMs: event.exec_time_ms ?? 0,
                  truncated: event.truncated ?? false,
                  answer: event.answer ?? null,
                });
                break;
              case "clarify":
                if (event.question_id && event.question && event.options) {
                  s.setClarification({
                    questionId: event.question_id,
                    question: event.question,
                    options: event.options,
                    understood: event.understood ?? null,
                  });
                }
                break;
              case "message":
                s.setMessage(event.text ?? "");
                break;
              case "error":
                s.setError(event.message ?? "Something went wrong. Please try again.");
                break;
              case "done":
                s.endStream();
                break;
            }
          },
          controller.signal,
        );
        useQueryStore.getState().endStream();
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          useQueryStore.getState().setError(err.message);
        }
      }
    },
    [selectedId],
  );

  const askSuggestion = useCallback(
    (question: string) => {
      useQueryStore.getState().setNlQuery(question);
      void ask(question);
    },
    [ask],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      void ask(nlQuery);
    }
  };

  const hasAnswer = Boolean(result || error || streamingSql || clarification || message);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Page heading */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="font-heading" style={{ fontSize: 28, color: "var(--text-primary)", marginBottom: 6 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
          Ask anything about your database in plain English.
        </p>
      </div>

      {/* Query input */}
      <div className="card-raised" style={{ padding: 16, marginBottom: 20 }}>
        <label htmlFor="question" className="sr-only">
          Your question
        </label>
        <textarea
          id="question"
          className="textarea"
          placeholder="Ask your database anything… e.g. &quot;Show me the top 10 users by order count this month&quot;"
          value={nlQuery}
          onChange={(e) => useQueryStore.getState().setNlQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          disabled={isStreaming}
          style={{ marginBottom: 12 }}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="text-mono-xs" style={{ color: "var(--text-tertiary)" }}>
            ⌘ + Enter to run
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            {hasAnswer && !isStreaming && (
              <button className="btn btn-ghost btn-sm" onClick={() => useQueryStore.getState().reset()} style={{ gap: 4 }}>
                <RotateCcw size={12} />
                Reset
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={() => void ask(nlQuery)}
              disabled={isStreaming || !nlQuery.trim()}
              style={{ gap: 6 }}
            >
              {isStreaming ? (
                <>
                  <span className="streaming-dot" style={{ width: 6, height: 6 }} />
                  Running…
                </>
              ) : (
                <>
                  <Send size={13} />
                  Run Query
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Streaming status */}
      {isStreaming && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 12px",
            background: "var(--accent-glow)",
            border: "1px solid var(--border-default)",
            borderRadius: 8,
            marginBottom: 16,
          }}
          className="animate-fade-in"
        >
          <span className="streaming-dot" />
          <span style={{ fontSize: 13, color: "var(--accent)" }}>
            {streamingSql ? "Receiving SQL…" : "Thinking about your question…"}
          </span>
        </div>
      )}

      {/* Clarifying question */}
      {clarification && !isStreaming && (
        <div style={{ marginBottom: 16 }}>
          <ClarifyPanel
            clarification={clarification}
            disabled={isStreaming}
            onAnswer={(answer) => void ask(askedRef.current || nlQuery, { question_id: clarification.questionId, answer })}
          />
        </div>
      )}

      {/* Plain answer (questions about the database itself) */}
      {message && (
        <div className="card answer-card animate-fade-up" style={{ marginBottom: 16 }}>
          <p className="answer-message">{message}</p>
        </div>
      )}

      {/* Answer: headline, chart, suggestions */}
      {isStreaming && !result && streamingSql && <DashboardSkeleton />}
      {result && (
        <div style={{ marginBottom: 16 }}>
          <AnswerView result={result} onAsk={askSuggestion} busy={isStreaming} />
        </div>
      )}

      {/* SQL — shown while streaming and under the answer, for transparency */}
      {(streamingSql || (isStreaming && !clarification)) && (
        <div style={{ marginBottom: 16 }} className="animate-fade-up">
          <SqlBlock sql={result?.sql ?? streamingSql} streaming={isStreaming} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="card animate-fade-up"
          style={{ padding: 16, border: "1px solid var(--error-dim)", background: "var(--error-dim)" }}
        >
          <p style={{ fontSize: 14, color: "var(--text-primary)" }}>{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!isStreaming && !hasAnswer && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-tertiary)" }}>
          <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>⌗</div>
          <p style={{ fontSize: 14 }}>Your answers will appear here.</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>
            Select a connection above, then ask a question — or try &ldquo;What tables do I have?&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
