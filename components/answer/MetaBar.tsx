"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { downloadCsv } from "@/lib/csv";
import { usePlan } from "@/lib/entitlements";
import { UpgradeModal } from "@/components/billing/UpgradePrompt";
import PlanLock from "@/components/billing/PlanLock";

interface MetaBarProps {
  rowCount: number;
  execTimeMs: number;
  truncated: boolean;
  columns: string[];
  rows: Record<string, unknown>[];
}

export default function MetaBar({ rowCount, execTimeMs, truncated, columns, rows }: MetaBarProps) {
  const { canCsv } = usePlan();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const exportCsv = () => {
    if (!canCsv) {
      setShowUpgrade(true);
      return;
    }
    downloadCsv("querymind_results.csv", columns, rows.map((row) => columns.map((column) => row[column])));
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
      <span className="badge badge-success">{rowCount} rows</span>
      {truncated && (
        <span
          className="badge badge-warning"
          title="Results are capped at 500 rows. Add a filter or ask for a summary to see everything."
        >
          showing first {rowCount}
        </span>
      )}
      <span className="badge badge-default">
        {execTimeMs < 1000 ? `${execTimeMs}ms` : `${(execTimeMs / 1000).toFixed(2)}s`}
      </span>
      <span className="badge badge-default">{columns.length} columns</span>
      <div style={{ flex: 1 }} />
      <button className="btn btn-ghost btn-sm" onClick={exportCsv} style={{ gap: 4 }} title={canCsv ? "Download as CSV" : "CSV export is on Pro"}>
        <Download size={12} />
        CSV
        {!canCsv && <PlanLock plan="pro" />}
      </button>
      {showUpgrade && (
        <UpgradeModal
          requiredPlan="pro"
          title="CSV export is a Pro feature"
          description="Download any answer as a spreadsheet-ready CSV file."
          onClose={() => setShowUpgrade(false)}
        />
      )}
    </div>
  );
}
