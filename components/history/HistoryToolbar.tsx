"use client";

import { Download, FileText } from "lucide-react";
import PlanLock from "@/components/billing/PlanLock";

export type HistoryScope = "connection" | "all";

interface HistoryToolbarProps {
  scope: HistoryScope;
  onScopeChange: (scope: HistoryScope) => void;
  connectionName: string | null;
  total: number;
  loading: boolean;
  canCsv: boolean;
  canPdf: boolean;
  canExport: boolean;
  onExport: (format: "csv" | "pdf") => void;
}

/** Page title, which questions are shown, and exports (locked ones open the upgrade prompt). */
export default function HistoryToolbar({
  scope,
  onScopeChange,
  connectionName,
  total,
  loading,
  canCsv,
  canPdf,
  canExport,
  onExport,
}: HistoryToolbarProps) {
  const where = scope === "all" || !connectionName ? "across all your databases" : `on ${connectionName}`;
  const count = total === 1 ? "1 question" : `${total.toLocaleString()} questions`;

  return (
    <header className="history-header">
      <div>
        <h1 className="font-heading history-title">History</h1>
        <p className="history-subtitle">{loading ? "Loading your questions…" : `${count} ${where}`}</p>
      </div>

      <div className="history-controls">
        <div className="view-toggle" role="group" aria-label="Which questions to show">
          <button
            type="button"
            aria-pressed={scope === "connection"}
            onClick={() => onScopeChange("connection")}
            disabled={!connectionName}
          >
            {connectionName ?? "This database"}
          </button>
          <button type="button" aria-pressed={scope === "all"} onClick={() => onScopeChange("all")}>
            All databases
          </button>
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => onExport("csv")}
          disabled={!canExport}
          title={canCsv ? "Download this page as CSV" : "CSV export is on Pro"}
          style={{ gap: 5 }}
        >
          <Download size={13} aria-hidden />
          CSV
          {!canCsv && <PlanLock plan="pro" />}
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => onExport("pdf")}
          disabled={!canExport}
          title={canPdf ? "Download this page as a PDF report" : "PDF export is on Team"}
          style={{ gap: 5 }}
        >
          <FileText size={13} aria-hidden />
          PDF
          {!canPdf && <PlanLock plan="team" />}
        </button>
      </div>
    </header>
  );
}
