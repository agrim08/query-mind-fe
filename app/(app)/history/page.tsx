"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getHistory, type HistoryEntry } from "@/lib/api";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Download,
  FileText,
  Lock,
} from "lucide-react";
import SqlHighlighter from "@/components/sql/SqlHighlighter";
import { useConnectionStore } from "@/lib/store";
import { UpgradeModal } from "@/components/billing/UpgradePrompt";

const PAGE_SIZE = 20;

// ─── Export helpers ───────────────────────────────────────────────────────────

function exportCSV(entries: HistoryEntry[]) {
  const header = ["Date", "Natural Language Query", "SQL", "Status", "Rows", "Time (ms)"];
  const rows = entries.map((e) => [
    new Date(e.created_at).toISOString(),
    `"${e.nl_query.replace(/"/g, '""')}"`,
    `"${(e.generated_sql ?? "").replace(/"/g, '""')}"`,
    e.status,
    e.row_count ?? "",
    e.exec_time_ms ?? "",
  ]);
  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `querymind-history-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function exportPDF(entries: HistoryEntry[]) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(16);
  doc.text("QueryMind — Query History", 14, 16);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Exported ${new Date().toLocaleString()} · ${entries.length} entries`, 14, 22);

  let y = 30;
  const col = [14, 60, 130, 185, 215, 250];

  doc.setTextColor(0);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  ["Date", "Natural Language", "SQL (preview)", "Status", "Rows", "Time"].forEach(
    (h, i) => doc.text(h, col[i], y)
  );
  y += 6;
  doc.setDrawColor(200);
  doc.line(14, y, 283, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  for (const e of entries) {
    if (y > 190) { doc.addPage(); y = 14; }
    const row = [
      new Date(e.created_at).toLocaleString(),
      e.nl_query.slice(0, 40) + (e.nl_query.length > 40 ? "…" : ""),
      (e.generated_sql ?? "—").slice(0, 40) + ((e.generated_sql?.length ?? 0) > 40 ? "…" : ""),
      e.status,
      String(e.row_count ?? "—"),
      e.exec_time_ms ? `${e.exec_time_ms}ms` : "—",
    ];
    row.forEach((cell, i) => doc.text(cell, col[i], y));
    y += 6;
  }

  doc.save(`querymind-history-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    success: { cls: "badge-success", label: "SUCCESS" },
    error:   { cls: "badge-error",   label: "ERROR" },
    pending: { cls: "badge-warning", label: "PENDING" },
  };
  const { cls, label } = map[status] ?? { cls: "badge-default", label: status.toUpperCase() };
  return <span className={`badge ${cls}`}>{label}</span>;
}

// ─── Export buttons (no state here — parent owns the gate state) ──────────────

function ExportButtons({
  entries,
  canCsv,
  canPdf,
  onCsvClick,
  onPdfClick,
}: {
  entries: HistoryEntry[];
  canCsv: boolean;
  canPdf: boolean;
  onCsvClick: () => void;
  onPdfClick: () => void;
}) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      <button
        className="btn btn-ghost btn-sm"
        style={{ gap: 5 }}
        onClick={() => (canCsv ? exportCSV(entries) : onCsvClick())}
        title={canCsv ? "Export as CSV" : "Pro required"}
      >
        <Download size={12} />
        CSV
        {!canCsv && (
          <span style={{
            fontSize: 9, fontFamily: "Geist Mono, monospace",
            color: "#c8f04d", background: "rgba(200,240,77,0.08)",
            border: "1px solid rgba(200,240,77,0.2)",
            padding: "1px 5px", borderRadius: 3,
            display: "flex", alignItems: "center", gap: 3,
          }}>
            <Lock size={8} />PRO
          </span>
        )}
      </button>

      <button
        className="btn btn-ghost btn-sm"
        style={{ gap: 5 }}
        onClick={() => (canPdf ? exportPDF(entries) : onPdfClick())}
        title={canPdf ? "Export as PDF" : "Team required"}
      >
        <FileText size={12} />
        PDF
        {!canPdf && (
          <span style={{
            fontSize: 9, fontFamily: "Geist Mono, monospace",
            color: "#60a5fa", background: "rgba(96,165,250,0.08)",
            border: "1px solid rgba(96,165,250,0.2)",
            padding: "1px 5px", borderRadius: 3,
            display: "flex", alignItems: "center", gap: 3,
          }}>
            <Lock size={8} />TEAM
          </span>
        )}
      </button>
    </div>
  );
}


// ─── Table row ────────────────────────────────────────────────────────────────

function HistoryRow({ entry }: { entry: HistoryEntry }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <tr onClick={() => setExpanded((e) => !e)} style={{ cursor: "pointer" }}>
        <td>
          {expanded
            ? <ChevronDown size={12} style={{ color: "var(--text-tertiary)" }} />
            : <ChevronRight size={12} style={{ color: "var(--text-tertiary)" }} />}
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
          {entry.row_count !== null
            ? <span className="badge badge-default">{entry.row_count} rows</span>
            : "—"}
        </td>
        <td>
          {entry.exec_time_ms !== null
            ? <span className="text-mono-xs" style={{ color: "var(--text-tertiary)" }}>{entry.exec_time_ms}ms</span>
            : "—"}
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
              <p style={{ fontSize: 13, color: "var(--text-primary)", marginBottom: 10 }}>{entry.nl_query}</p>
              {entry.generated_sql && (
                <div className="sql-block">
                  <div className="sql-block-header">
                    <span className="text-mono-xs" style={{ color: "var(--text-tertiary)" }}>sql query</span>
                  </div>
                  <SqlHighlighter sql={entry.generated_sql} />
                </div>
              )}
              {entry.error_message && (
                <div style={{
                  marginTop: 8, padding: "8px 12px",
                  background: "var(--error-dim)", border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: 8, fontSize: 12, color: "var(--error)",
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
  const { selectedId } = useConnectionStore();
  const { has } = useAuth();

  const [showAll, setShowAll]     = useState(false);
  const [entries, setEntries]     = useState<HistoryEntry[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(0);
  const [loading, setLoading]     = useState(true);
  // Gate state lifted to page level so UpgradePrompt renders OUTSIDE the header row
  const [activeGate, setActiveGate] = useState<"csv" | "pdf" | null>(null);

  const canCsv = !!has?.({ feature: "csv_export" });
  const canPdf = !!has?.({ feature: "pdf_export" });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const connId = showAll ? null : selectedId;
        const { items, total: t } = await getHistory(page + 1, PAGE_SIZE, connId);
        setEntries(items);
        setTotal(t);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, showAll, selectedId]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>

      {/* ── Header row — always stays a single clean row ── */}
      <div style={{
        marginBottom: 20,
        display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: 12,
      }}>
        <div>
          <h1 className="font-heading" style={{ fontSize: 28, marginBottom: 6 }}>Query History</h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
            {total} total queries — click any row to expand.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {!loading && entries.length > 0 && (
            <ExportButtons
              entries={entries}
              canCsv={canCsv}
              canPdf={canPdf}
              onCsvClick={() => setActiveGate((g) => g === "csv" ? null : "csv")}
              onPdfClick={() => setActiveGate((g) => g === "pdf" ? null : "pdf")}
            />
          )}

          {/* Filter toggle */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "7px 14px",
            background: "var(--bg-raised)", borderRadius: 10,
            border: "1px solid var(--border-default)",
          }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
              <input
                type="checkbox"
                checked={showAll}
                onChange={(e) => { setShowAll(e.target.checked); setPage(0); }}
                style={{ width: 15, height: 15, accentColor: "var(--accent)", cursor: "pointer" }}
              />
              <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>
                Show all queries
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
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
                  <td colSpan={7} style={{
                    textAlign: "center", padding: "40px 0",
                    color: "var(--text-tertiary)", fontSize: 14,
                  }}>
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

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 12, marginTop: 20,
        }}>
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

      {/* ── Upgrade modal — centered overlay with backdrop blur ── */}
      {activeGate === "csv" && (
        <UpgradeModal
          requiredPlan="pro"
          title="CSV export is a Pro feature"
          description="Export your full query history as a spreadsheet-ready CSV file."
          onClose={() => setActiveGate(null)}
        />
      )}
      {activeGate === "pdf" && (
        <UpgradeModal
          requiredPlan="team"
          title="PDF export is a Team feature"
          description="Export a beautifully formatted PDF report of your query history."
          onClose={() => setActiveGate(null)}
        />
      )}
    </div>
  );
}
