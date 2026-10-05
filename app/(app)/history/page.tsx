"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import type { HistoryEntry } from "@/lib/api";
import { usePlan } from "@/lib/entitlements";
import { exportHistoryCsv, exportHistoryPdf } from "@/lib/historyExport";
import { useConnectionStore, useQueryStore } from "@/lib/store";
import { useHistory } from "@/hooks/useHistory";
import HistoryList from "@/components/history/HistoryList";
import HistoryToolbar, { type HistoryScope } from "@/components/history/HistoryToolbar";
import { UpgradeModal } from "@/components/billing/UpgradePrompt";

const PAGE_SIZE = 20;

export default function HistoryPage() {
  const router = useRouter();
  const selectedId = useConnectionStore((s) => s.selectedId);
  const connections = useConnectionStore((s) => s.connections);
  const connectionsLoading = useConnectionStore((s) => s.connectionsLoading);
  const { canCsv, canPdf } = usePlan();

  const [scope, setScope] = useState<HistoryScope>("connection");
  const [gate, setGate] = useState<"csv" | "pdf" | null>(null);
  const showAll = scope === "all" || !selectedId;
  const connectionId = showAll ? null : selectedId;

  // The page number belongs to one list; switching database or scope starts again at page 1.
  const listKey = connectionId ?? "all";
  const [paging, setPaging] = useState({ listKey, page: 1 });
  const page = paging.listKey === listKey ? paging.page : 1;
  const goToPage = (next: number) => setPaging({ listKey, page: next });

  const { entries, total, loading, error, retry } = useHistory(connectionId, page, PAGE_SIZE, !connectionsLoading);

  const names = useMemo(() => new Map(connections.map((c) => [c.id, c.name])), [connections]);
  const connectionName = selectedId ? (names.get(selectedId) ?? null) : null;
  const connectionNameOf = useCallback(
    (entry: HistoryEntry) => (showAll ? (names.get(entry.connection_id) ?? null) : null),
    [showAll, names],
  );

  // Back to the dashboard with the question in the input, on the database it was asked of.
  const askAgain = useCallback(
    (entry: HistoryEntry) => {
      const store = useConnectionStore.getState();
      if (entry.connection_id !== store.selectedId && names.has(entry.connection_id)) {
        store.selectConnection(entry.connection_id);
      }
      const query = useQueryStore.getState();
      query.reset();
      query.setNlQuery(entry.nl_query);
      router.push("/dashboard");
    },
    [names, router],
  );

  const exportPage = (format: "csv" | "pdf") => {
    if (format === "csv") {
      if (canCsv) exportHistoryCsv(entries);
      else setGate("csv");
      return;
    }
    if (!canPdf) {
      setGate("pdf");
      return;
    }
    exportHistoryPdf(entries).catch(() => toast.error("We couldn't create the PDF. Please try again."));
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const first = (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="history-page">
      <HistoryToolbar
        scope={showAll ? "all" : "connection"}
        onScopeChange={setScope}
        connectionName={connectionName}
        total={total}
        loading={loading}
        canCsv={canCsv}
        canPdf={canPdf}
        canExport={!loading && entries.length > 0}
        onExport={exportPage}
      />

      <HistoryList
        entries={entries}
        loading={loading}
        error={error}
        onRetry={retry}
        connectionNameOf={connectionNameOf}
        onAskAgain={askAgain}
      />

      {!loading && totalPages > 1 && (
        <nav className="history-pagination" aria-label="History pages">
          <span className="history-range">
            {first}–{last} of {total.toLocaleString()}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => goToPage(page - 1)} disabled={page === 1}>
              <ChevronLeft size={14} aria-hidden /> Newer
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
            >
              Older <ChevronRight size={14} aria-hidden />
            </button>
          </div>
        </nav>
      )}

      {gate === "csv" && (
        <UpgradeModal
          requiredPlan="pro"
          title="CSV export is a Pro feature"
          description="Export your question history as a spreadsheet-ready CSV file."
          onClose={() => setGate(null)}
        />
      )}
      {gate === "pdf" && (
        <UpgradeModal
          requiredPlan="team"
          title="PDF export is a Team feature"
          description="Export a formatted PDF report of your question history."
          onClose={() => setGate(null)}
        />
      )}
    </div>
  );
}
