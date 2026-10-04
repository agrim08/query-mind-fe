"use client";

import Link from "next/link";
import { useConnectionStore } from "@/lib/store";
import { useKnowledge } from "@/hooks/useKnowledge";
import BusinessContextEditor from "@/components/knowledge/BusinessContextEditor";
import KnowledgeItems from "@/components/knowledge/KnowledgeItems";
import VerifiedQueries from "@/components/knowledge/VerifiedQueries";

/**
 * What QueryMind knows about the selected connection's business: the description, the
 * definitions it follows when writing SQL, and answers you verified.
 */
export default function KnowledgePage() {
  const selectedId = useConnectionStore((s) => s.selectedId);
  const connection = useConnectionStore((s) => s.connections.find((c) => c.id === s.selectedId));
  const { knowledge, setKnowledge, loading, error } = useKnowledge(selectedId);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 className="font-heading" style={{ fontSize: 28, color: "var(--text-primary)", marginBottom: 6 }}>
          Knowledge
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
          Teach QueryMind your business{connection ? ` for ${connection.name}` : ""}: what your numbers mean and the words
          your team uses. Answers follow these definitions.
        </p>
      </div>

      {!selectedId && (
        <div className="card" style={{ padding: 24, color: "var(--text-secondary)", fontSize: 14 }}>
          Select a connection above, or <Link href="/connections" style={{ color: "var(--accent)" }}>add one</Link>.
        </div>
      )}
      {selectedId && connection && !connection.indexed_at && (
        <div className="card" style={{ padding: 24, color: "var(--text-secondary)", fontSize: 14 }}>
          Still mapping your database. Index it on the <Link href="/connections" style={{ color: "var(--accent)" }}>Connections</Link>{" "}
          page first.
        </div>
      )}
      {error && (
        <div className="card" style={{ padding: 16, background: "var(--error-dim)", color: "var(--text-primary)", fontSize: 14 }}>
          {error}
        </div>
      )}
      {loading && !knowledge && <div className="skeleton" style={{ height: 220 }} />}

      {selectedId && knowledge && (
        <>
          <BusinessContextEditor
            connectionId={selectedId}
            knowledge={knowledge}
            onChange={setKnowledge}
            schemaReady={Boolean(connection?.indexed_at)}
          />
          {knowledge.starter_questions.length > 0 && (
            <div className="card answer-card">
              <h2 className="answer-headline">Starter questions</h2>
              <ul style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14, color: "var(--text-secondary)" }}>
                {knowledge.starter_questions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
              <p className="answer-understood">They appear on the dashboard as one-click questions.</p>
            </div>
          )}
          <KnowledgeItems
            connectionId={selectedId}
            items={knowledge.items}
            onChange={(items) => setKnowledge({ ...knowledge, items })}
          />
          <VerifiedQueries
            connectionId={selectedId}
            queries={knowledge.verified_queries}
            onChange={(verified_queries) => setKnowledge({ ...knowledge, verified_queries })}
          />
        </>
      )}
    </div>
  );
}
