"use client";

import { useState } from "react";
import { ChevronDown, CornerDownLeft } from "lucide-react";
import type { HistoryEntry } from "@/lib/api";
import { statusLabel, statusTone } from "@/lib/historyStatus";
import VerifyButton from "@/components/answer/VerifyButton";
import SqlBlock from "@/components/sql/SqlBlock";
import SavedAnswerView from "./SavedAnswerView";

interface HistoryItemProps {
  entry: HistoryEntry;
  /** Shown when the list mixes connections. */
  connectionName: string | null;
  onAskAgain: (entry: HistoryEntry) => void;
}

const formatDuration = (ms: number) => (ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`);
const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

/** One asked question: the question first, quiet metadata under it, details on demand. */
export default function HistoryItem({ entry, connectionName, onAskAgain }: HistoryItemProps) {
  const [open, setOpen] = useState(false);
  const tone = statusTone(entry.status);
  const answered = entry.status === "success";
  const detailId = `history-detail-${entry.id}`;

  return (
    <li className="history-item" data-open={open || undefined}>
      <div className="history-row">
        <button
          type="button"
          className="history-toggle"
          aria-expanded={open}
          aria-controls={detailId}
          onClick={() => setOpen((o) => !o)}
        >
          <span className={`history-dot tone-${tone}`} aria-hidden />
          <span className="history-main">
            <span className="history-question">{entry.nl_query}</span>
            <span className="history-meta">
              <span className={`history-status tone-${tone}`}>{statusLabel(entry.status)}</span>
              {connectionName && <span>{connectionName}</span>}
              {entry.row_count !== null && <span>{entry.row_count === 1 ? "1 row" : `${entry.row_count} rows`}</span>}
              {entry.exec_time_ms !== null && <span>{formatDuration(entry.exec_time_ms)}</span>}
              <time dateTime={entry.created_at}>{formatTime(entry.created_at)}</time>
            </span>
          </span>
        </button>

        <div className="history-actions">
          {answered && entry.sql && <VerifyButton questionId={entry.id} verified={entry.verified} />}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onAskAgain(entry)}
            title="Put this question in the input on the dashboard"
            style={{ gap: 4 }}
          >
            <CornerDownLeft size={13} aria-hidden />
            Ask again
          </button>
          {/* A mouse shortcut in line with the actions; keyboard users open the row with the question. */}
          <button
            type="button"
            className="history-chevron-btn"
            tabIndex={-1}
            aria-hidden
            onClick={() => setOpen((o) => !o)}
          >
            <ChevronDown size={16} className="history-chevron" />
          </button>
        </div>
      </div>

      {open && (
        <div className="history-detail" id={detailId}>
          {entry.understood && (
            <p className="history-understood">
              <span className="history-label">Understood as</span>
              {entry.understood}
            </p>
          )}
          {answered && entry.sql && <SavedAnswerView questionId={entry.id} />}
          {entry.sql && <SqlBlock sql={entry.sql} streaming={false} />}
          {answered && !entry.sql && (
            <p className="history-note">Answered from your database&rsquo;s structure. No query was needed.</p>
          )}
          {entry.error_message && <p className="history-error">{entry.error_message}</p>}
        </div>
      )}
    </li>
  );
}
