"use client";

import { useEffect, useState } from "react";
import { getHistory, type HistoryEntry } from "@/lib/api";
import { ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";
import SqlHighlighter from "@/components/sql/SqlHighlighter";


const PAGE_SIZE = 20;

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    success: { cls: "badge-success", label: "SUCCESS" },
    error:   { cls: "badge-error",   label: "ERROR" },
    pending: { cls: "badge-warning", label: "PENDING" },
  };
  const { cls, label } = map[status] ?? { cls: "badge-default", label: status.toUpperCase() };
  return <span className={`badge ${cls}`}>{label}</span>;
}

// ─── Row ──────────────────────────────────────────────────────────────────────
function HistoryRow({ entry }: { entry: HistoryEntry }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        onClick={() => setExpanded((e) => !e)}
        style={{ cursor: "pointer" }}
      >
        <td>
          {expanded
            ? <ChevronDown size={12} style={{ color: "var(--text-tertiary)" }} />
            : <ChevronRight size={12} style={{ color: "var(--text-tertiary)" }} />
          }
        </td>
        <td style={{ maxWidth: 240 }}>
          <span style={{ color: "var(--text-primary)", fontSize: 13 }}>
            {entry.nl_query.length > 60 ? entry.nl_query.slice(0, 60) + "…" : entry.nl_query}
          </span>
        </td>
        <td style={{ maxWidth: 180 }}>
          <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 11, color: "var(--text-secondary)" }}>
            {entry.generated_sql
              ? (entry.generated_sql.length > 40 ? entry.generated_sql.slice(0, 40) + "…" : entry.generated_sql)
              : "—"}
          </span>
        </td>

        <td><StatusBadge status={entry.status} /></td>
        <td>
          {entry.row_count !== null ? (
            <span className="badge badge-default">{entry.row_count} rows</span>
          ) : "—"}
        </td>
        <td>
          {entry.exec_time_ms !== null ? (
            <span className="text-mono-xs" style={{ color: "var(--text-tertiary)" }}>
              {entry.exec_time_ms}ms
            </span>
          ) : "—"}
        </td>
        <td>
          <span className="text-mono-xs" style={{ color: "var(--text-tertiary)" }}>
            {new Date(entry.created_at).toLocaleString()}
          </span>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7} style={{ padding: 0, background: "var(--bg-raised)" }}>
            <div style={{ padding: "12px 16px 16px" }}>
              {/* Full NL query */}
              <p style={{ fontSize: 13, color: "var(--text-primary)", marginBottom: 10 }}>
                {entry.nl_query}
              </p>
              {/* SQL */}
              {entry.generated_sql && (
                <div className="sql-block">
                  <div className="sql-block-header">
                    <span className="text-mono-xs" style={{ color: "var(--text-tertiary)" }}>sql query</span>
                  </div>
                  <SqlHighlighter sql={entry.generated_sql} />
                </div>
              )}

              {/* Error */}
              {entry.error_message && (
                <div style={{
                  marginTop: 8,
                  padding: "8px 12px",
                  background: "var(--error-dim)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "var(--error)",
                  fontFamily: "Geist Mono, monospace",
                }}>
                  {entry.error_message}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function HistorySkeleton() {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <tr key={i}>
          <td><div className="skeleton" style={{ width: 12, height: 12 }} /></td>
          <td><div className="skeleton" style={{ width: 200, height: 13 }} /></td>
          <td><div className="skeleton" style={{ width: 140, height: 11 }} /></td>
          <td><div className="skeleton" style={{ width: 60, height: 20 }} /></td>
          <td><div className="skeleton" style={{ width: 52, height: 20 }} /></td>
          <td><div className="skeleton" style={{ width: 40, height: 11 }} /></td>
          <td><div className="skeleton" style={{ width: 110, height: 11 }} /></td>
        </tr>
      ))}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { items, total: t } = await getHistory(page + 1, PAGE_SIZE);
        setEntries(items);
        setTotal(t);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="font-heading" style={{ fontSize: 28, marginBottom: 6 }}>Query History</h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
          {total} total queries — click any row to expand.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="results-table" style={{ minWidth: 800 }}>
            <thead>
              <tr>
                <th style={{ width: 32 }} />
                <th>Natural Language Query</th>
                <th>SQL Preview</th>
                <th>Status</th>
                <th>Rows</th>
                <th>Time</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <HistorySkeleton />
              ) : entries.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: "40px 0",
                      color: "var(--text-tertiary)",
                      fontSize: 14,
                    }}
                  >
                    No queries yet. Run your first query from the Dashboard.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => <HistoryRow key={entry.id} entry={entry} />)
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            marginTop: 20,
          }}
        >
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{ gap: 4 }}
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span className="text-mono-xs" style={{ color: "var(--text-tertiary)" }}>
            {page + 1} / {totalPages}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            style={{ gap: 4 }}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
