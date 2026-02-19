"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryStore, useConnectionStore } from "@/lib/store";
import { streamQuery } from "@/lib/api";
import { Send, RotateCcw, Download } from "lucide-react";
import SqlBlock from "@/components/sql/SqlBlock";
import { VirtuosoGrid } from "react-virtuoso";
import toast from "react-hot-toast";

// ─── Meta Bar ─────────────────────────────────────────────────────────────────
function MetaBar({
  rowCount,
  execTimeMs,
  columns,
  rows,
}: {
  rowCount: number;
  execTimeMs: number;
  columns: string[];
  rows: Record<string, unknown>[];
}) {
  const downloadCsv = () => {
    const header = columns.join(",");
    const csvRows = rows.map((r) =>
      columns.map((c) => JSON.stringify(r[c] ?? "")).join(",")
    );
    const csv = [header, ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "querymind_results.csv";
    a.click();
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 0",
      }}
    >
      <span className="badge badge-success">{rowCount} rows</span>
      <span className="badge badge-default">
        {execTimeMs < 1000 ? `${execTimeMs}ms` : `${(execTimeMs / 1000).toFixed(2)}s`}
      </span>
      <span className="badge badge-default">{columns.length} columns</span>
      <div style={{ flex: 1 }} />
      <button className="btn btn-ghost btn-sm" onClick={downloadCsv} style={{ gap: 4 }}>
        <Download size={12} />
        CSV
      </button>
    </div>
  );
}

// ─── Results Table with react-virtuoso ──────────────────────────────────────
function ResultsTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: Record<string, unknown>[];
}) {
  return (
    <div
      className="card"
      style={{ overflow: "hidden", border: "1px solid var(--border-subtle)" }}
    >
      <div style={{ overflowX: "auto" }}>
        <table className="results-table" style={{ minWidth: "100%" }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
        </table>
      </div>
      <div style={{ height: Math.min(rows.length * 35 + 1, 400), overflowY: "auto" }}>
        <table className="results-table" style={{ minWidth: "100%" }}>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col} title={String(row[col] ?? "")}>
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* SQL block skeleton */}
      <div className="sql-block" style={{ height: 140 }}>
        <div className="sql-block-header">
          <div className="skeleton" style={{ width: 80, height: 14 }} />
        </div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {[100, 140, 60].map((w, i) => (
            <div key={i} className="skeleton" style={{ width: w, height: 14 }} />
          ))}
        </div>
      </div>
      {/* Meta bar skeleton */}
      <div style={{ display: "flex", gap: 8 }}>
        {[60, 50, 80].map((w, i) => (
          <div key={i} className="skeleton" style={{ width: w, height: 22 }} />
        ))}
      </div>
      {/* Table skeleton */}
      <div className="card" style={{ overflow: "hidden", height: 200 }}>
        <div style={{ padding: "8px 12px", background: "var(--bg-raised)", display: "flex", gap: 20 }}>
          {[80, 100, 120, 90].map((w, i) => (
            <div key={i} className="skeleton" style={{ width: w, height: 12 }} />
          ))}
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ padding: "9px 12px", display: "flex", gap: 20, borderTop: "1px solid var(--border-subtle)" }}>
            {[80, 100, 120, 90].map((w, j) => (
              <div key={j} className="skeleton" style={{ width: w, height: 12 }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const {
    nlQuery, streamingSql, isStreaming, result, error,
    setNlQuery, startStream, appendSqlChunk, setResult, setError, reset,
  } = useQueryStore();
  const { selectedId } = useConnectionStore();
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(async () => {
    if (!nlQuery.trim()) return;
    if (!selectedId) {
      toast.error("Please select a connection first");
      return;
    }
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    startStream();

    try {
      await streamQuery(
        { nl_query: nlQuery, connection_id: selectedId },
        (event) => {
          if (event.type === "sql_chunk" && event.chunk) appendSqlChunk(event.chunk);
          if (event.type === "results") {
            setResult({
              sql: streamingSql,
              rows: event.rows ?? [],
              columns: event.columns ?? [],
              rowCount: event.row_count ?? 0,
              execTimeMs: event.exec_time_ms ?? 0,
            });
          }
          if (event.type === "error") setError(event.message ?? "Unknown error");
        },
        abortRef.current.signal
      );
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message);
      }
    }
  }, [nlQuery, selectedId, startStream, appendSqlChunk, setResult, setError, streamingSql]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

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
      <div
        className="card-raised"
        style={{ padding: 16, marginBottom: 20 }}
      >
        <textarea
          ref={textareaRef}
          className="textarea"
          placeholder="Ask your database anything… e.g. &quot;Show me the top 10 users by order count this month&quot;"
          value={nlQuery}
          onChange={(e) => setNlQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          disabled={isStreaming}
          style={{ marginBottom: 12 }}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            className="text-mono-xs"
            style={{ color: "var(--text-tertiary)" }}
          >
            ⌘ + Enter to run
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            {(result || error || streamingSql) && !isStreaming && (
              <button className="btn btn-ghost btn-sm" onClick={reset} style={{ gap: 4 }}>
                <RotateCcw size={12} />
                Reset
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
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
            background: "rgba(200, 240, 77, 0.05)",
            border: "1px solid rgba(200, 240, 77, 0.15)",
            borderRadius: 8,
            marginBottom: 16,
          }}
          className="animate-fade-in"
        >
          <span className="streaming-dot" />
          <span style={{ fontSize: 13, color: "var(--accent)" }}>
            {streamingSql ? "Receiving SQL…" : "Connecting to Gemini…"}
          </span>
        </div>
      )}

      {/* SQL block — show while streaming or done */}
      {(streamingSql || isStreaming) && (
        <div style={{ marginBottom: 16 }} className="animate-fade-up">
          <SqlBlock sql={streamingSql} streaming={isStreaming} />
        </div>
      )}

      {/* Results */}
      {isStreaming && !result && streamingSql && <DashboardSkeleton />}

      {result && (
        <div className="animate-fade-up" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <MetaBar
            rowCount={result.rowCount}
            execTimeMs={result.execTimeMs}
            columns={result.columns}
            rows={result.rows}
          />
          {result.rows.length > 0 ? (
            <ResultsTable columns={result.columns} rows={result.rows} />
          ) : (
            <div
              className="card"
              style={{
                padding: 40,
                textAlign: "center",
                color: "var(--text-secondary)",
                fontSize: 14,
              }}
            >
              Query returned 0 rows.
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="card animate-fade-up"
          style={{
            padding: 16,
            border: "1px solid rgba(239,68,68,0.2)",
            background: "var(--error-dim)",
          }}
        >
          <p style={{ fontSize: 13, color: "var(--error)", fontFamily: "Geist Mono, monospace" }}>
            {error}
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isStreaming && !result && !error && !streamingSql && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--text-tertiary)",
          }}
        >
          <div
            style={{
              fontSize: 40,
              marginBottom: 12,
              opacity: 0.3,
            }}
          >
            ⌗
          </div>
          <p style={{ fontSize: 14 }}>Your query results will appear here.</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>
            Select a connection above, then type a question.
          </p>
        </div>
      )}
    </div>
  );
}
