"use client";

import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { type VerifiedQuery, deleteVerifiedQuery } from "@/lib/api";

interface VerifiedQueriesProps {
  connectionId: string;
  queries: VerifiedQuery[];
  onChange: (queries: VerifiedQuery[]) => void;
}

/** Answers you marked as right (👍). Similar questions reuse them as worked examples. */
export default function VerifiedQueries({ connectionId, queries, onChange }: VerifiedQueriesProps) {
  const remove = async (id: string) => {
    try {
      await deleteVerifiedQuery(connectionId, id);
      onChange(queries.filter((q) => q.id !== id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <h2 className="answer-headline">Verified answers</h2>
        <p className="answer-understood" style={{ marginTop: 4 }}>
          Mark a good answer with 👍 on the dashboard. Similar questions will reuse its logic.
        </p>
      </div>
      {queries.length === 0 && <p className="answer-understood">None yet.</p>}
      {queries.map((q) => (
        <details key={q.id} className="card" style={{ padding: "10px 14px" }}>
          <summary style={{ cursor: "pointer", display: "flex", gap: 12, alignItems: "center", listStyle: "none" }}>
            <span style={{ flex: 1, fontSize: 14, color: "var(--text-primary)" }}>{q.question}</span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              aria-label={`Remove verified answer: ${q.question}`}
              onClick={(e) => {
                e.preventDefault();
                void remove(q.id);
              }}
            >
              <Trash2 size={13} />
            </button>
          </summary>
          <pre className="text-mono-xs" style={{ marginTop: 8, whiteSpace: "pre-wrap", color: "var(--text-secondary)" }}>
            {q.sql}
          </pre>
        </details>
      ))}
    </div>
  );
}
