"use client";

import Link from "next/link";
import type { HistoryEntry } from "@/lib/api";
import HistoryItem from "./HistoryItem";

interface HistoryListProps {
  entries: HistoryEntry[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  /** The connection name for each entry, or null when the list shows one connection. */
  connectionNameOf: (entry: HistoryEntry) => string | null;
  onAskAgain: (entry: HistoryEntry) => void;
}

const DAY = 24 * 60 * 60 * 1000;

/** "Today", "Yesterday", or the date in the user's locale. */
function dayLabel(date: Date): string {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const diff = startOfToday.getTime() - new Date(date).setHours(0, 0, 0, 0);
  if (diff === 0) return "Today";
  if (diff === DAY) return "Yesterday";
  const sameYear = date.getFullYear() === startOfToday.getFullYear();
  return date.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short", year: sameYear ? undefined : "numeric" });
}

/** Entries are newest first, so consecutive runs of one day form a group. */
function groupByDay(entries: HistoryEntry[]): { label: string; entries: HistoryEntry[] }[] {
  const groups: { label: string; entries: HistoryEntry[] }[] = [];
  for (const entry of entries) {
    const label = dayLabel(new Date(entry.created_at));
    const last = groups[groups.length - 1];
    if (last?.label === label) last.entries.push(entry);
    else groups.push({ label, entries: [entry] });
  }
  return groups;
}

function HistorySkeleton() {
  return (
    <div className="history-group" aria-busy="true" aria-label="Loading your history">
      <div className="skeleton" style={{ width: 72, height: 10, marginBottom: 12 }} />
      <div className="card history-card">
        {[72, 54, 64, 46, 58].map((width) => (
          <div key={width} className="history-skeleton-row">
            <div className="skeleton" style={{ width: 8, height: 8, borderRadius: 999 }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="skeleton" style={{ width: `${width}%`, height: 13 }} />
              <div className="skeleton" style={{ width: 180, height: 10 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HistoryList({ entries, loading, error, onRetry, connectionNameOf, onAskAgain }: HistoryListProps) {
  if (loading) return <HistorySkeleton />;

  if (error) {
    return (
      <div className="card history-state">
        <p className="history-state-title">We couldn&rsquo;t load your history.</p>
        <p className="history-state-text">{error}</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="card history-state">
        <p className="history-state-title">No questions yet.</p>
        <p className="history-state-text">Everything you ask shows up here, with the SQL that answered it.</p>
        <Link href="/dashboard" className="btn btn-primary btn-sm">
          Ask your first question
        </Link>
      </div>
    );
  }

  return (
    <>
      {groupByDay(entries).map((group) => (
        <section key={group.label} className="history-group" aria-label={group.label}>
          <h2 className="history-day">{group.label}</h2>
          <ul className="card history-card">
            {group.entries.map((entry) => (
              <HistoryItem
                key={entry.id}
                entry={entry}
                connectionName={connectionNameOf(entry)}
                onAskAgain={onAskAgain}
              />
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
