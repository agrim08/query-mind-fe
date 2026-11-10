"use client";

import { ArrowUpRight, Database, Info, Sparkles, Table2 } from "lucide-react";

interface MessageViewProps {
  message: string;
  onPick?: (question: string) => void;
}

/**
 * Parses messages from the schema/AI.
 * When the user asks "What tables do I have?", the backend returns:
 * "Your database has 10 tables and views: _prisma_migrations, GitCommit, ... Ask about any of them..."
 * Instead of displaying plain text, we parse the tables into an interactive, clickable grid.
 */
function parseTableListing(message: string): { tables: string[]; count: number; promptText?: string } | null {
  // Matches "Your database has 10 tables and views: table1, table2... [Ask about any of them...]"
  const match = message.match(/Your database has (\d+)\s+tables?(?:\s+and\s+views)?:\s*([^.]+)\.(.*)?/i);
  if (!match) return null;

  const count = parseInt(match[1], 10);
  const rawList = match[2];
  const promptText = match[3]?.trim();

  const tables = rawList
    .split(",")
    .map((t) => t.trim().replace(/^and\s+/i, ""))
    .filter(Boolean);

  return { tables, count, promptText };
}

export default function MessageView({ message, onPick }: MessageViewProps) {
  const listing = parseTableListing(message);

  if (listing && listing.tables.length > 0) {
    return (
      <div className="card answer-card animate-fade-up" style={{ marginBottom: 16 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "var(--radius-md)",
                background: "rgba(200, 240, 77, 0.12)",
                border: "1px solid rgba(200, 240, 77, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent)",
                flexShrink: 0,
              }}
            >
              <Table2 size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                Database Schema Tables
              </h3>
              <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                {listing.count || listing.tables.length} tables and views indexed
              </span>
            </div>
          </div>
          <span className="badge badge-accent" style={{ fontSize: 11, fontWeight: 500, padding: "3px 8px" }}>
            {listing.count || listing.tables.length} Available
          </span>
        </div>

        {/* Interactive Grid of Tables */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 10,
            marginTop: 4,
          }}
        >
          {listing.tables.map((table) => (
            <button
              key={table}
              type="button"
              onClick={() => onPick?.(`Show 5 rows from "${table}"`)}
              className="starter-card"
              style={{
                padding: "10px 14px",
                background: "var(--bg-raised)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
              title={`Click to query: Show 5 rows from "${table}"`}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden", minWidth: 0 }}>
                <Database size={14} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
                <span
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text-primary)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {table}
                </span>
              </div>
              <ArrowUpRight size={14} className="starter-card-arrow" style={{ flexShrink: 0 }} />
            </button>
          ))}
        </div>

        {/* Footer Hint / Call to Action */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            paddingTop: 10,
            borderTop: "1px solid var(--border-subtle)",
            fontSize: 12,
            color: "var(--text-secondary)",
          }}
        >
          <Sparkles size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
          <span>Click any table to preview its rows, or ask a question in plain English.</span>
        </div>
      </div>
    );
  }

  // Fallback for general plain-text messages
  return (
    <div className="card answer-card animate-fade-up" style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Info size={16} style={{ color: "var(--accent)", flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
          Database Overview
        </span>
      </div>
      <p className="answer-message" style={{ margin: 0, lineHeight: 1.6 }}>
        {message}
      </p>
    </div>
  );
}
