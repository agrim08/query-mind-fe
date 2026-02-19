"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { setTokenGetter } from "@/lib/api";

import {
  getConnections,
  createConnection,
  deleteConnection,
  testConnection,
  indexSchema,
  type Connection,
} from "@/lib/api";
import { useConnectionStore } from "@/lib/store";
import {
  Plus,
  Database,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Add Connection Modal ─────────────────────────────────────────────────────
function AddConnectionModal({ onClose, onAdded }: { onClose: () => void; onAdded: (c: Connection) => void }) {
  const [displayName, setDisplayName] = useState("");
  const [connString, setConnString] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const handleTest = async () => {
    if (!connString.trim()) return;
    setTesting(true);
    setTestResult(null);
    const result = await testConnection(connString.trim());
    setTestResult(result);
    setTesting(false);
  };

  const handleSave = async () => {
    if (!displayName.trim() || !connString.trim()) {
      toast.error("Name and connection string are required");
      return;
    }
    setSaving(true);
    try {
      const conn = await createConnection({ name: displayName.trim(), connection_string: connString.trim() });
      toast.success("Connection added!");
      onAdded(conn);
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save connection");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-fade-up">
        <div style={{ padding: "24px 24px 0" }}>
          <h2 className="font-heading" style={{ fontSize: 22, color: "var(--text-primary)", marginBottom: 4 }}>
            Add Connection
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20 }}>
            Connect a PostgreSQL database. Your credentials are encrypted at rest.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, fontWeight: 500 }}>
                Connection Name
              </label>
              <input
                className="input"
                placeholder="e.g. Production DB"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, fontWeight: 500 }}>
                PostgreSQL Connection String
              </label>
              <input
                className="input"
                placeholder="postgresql://user:password@host:5432/dbname"
                value={connString}
                onChange={(e) => {
                  setConnString(e.target.value);
                  setTestResult(null);
                }}
                type="password"
              />
            </div>

            {/* Test feedback */}
            {testResult && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: testResult.ok ? "var(--success-dim)" : "var(--error-dim)",
                  border: `1px solid ${testResult.ok ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                }}
              >
                {testResult.ok ? (
                  <CheckCircle size={14} style={{ color: "var(--success)", flexShrink: 0 }} />
                ) : (
                  <XCircle size={14} style={{ color: "var(--error)", flexShrink: 0 }} />
                )}
                <span style={{ fontSize: 12, color: testResult.ok ? "var(--success)" : "var(--error)" }}>
                  {testResult.ok ? "Connection successful" : (testResult.error ?? "Connection failed")}
                </span>
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            padding: 24,
            justifyContent: "flex-end",
            borderTop: "1px solid var(--border-subtle)",
            marginTop: 24,
          }}
        >
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-secondary"
            onClick={handleTest}
            disabled={testing || !connString.trim()}
            style={{ gap: 6 }}
          >
            {testing ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
            Test
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || !displayName.trim() || !connString.trim()}
          >
            {saving ? <Loader2 size={12} /> : "Save Connection"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Index Progress ───────────────────────────────────────────────────────────
function IndexingProgress({
  connectionId,
  onDone,
}: {
  connectionId: string;
  onDone: () => void;
}) {
  const [status, setStatus] = useState("Starting indexing…");
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    indexSchema(
      connectionId,
      (event) => {
        if (event.type === "status") setStatus(event.message ?? "");
        if (event.type === "progress") {
          setProgress(event.current ?? 0);
          setTotal(event.total ?? 0);
        }
        if (event.type === "done") {
          setDone(true);
          setStatus(`Indexed ${event.table_count} tables`);
          setTimeout(onDone, 1500);
        }
        if (event.type === "error") {
          setError(true);
          setStatus(event.message ?? "Error");
        }
      },
      ac.signal
    ).catch(() => {});
    return () => ac.abort();
  }, [connectionId, onDone]);

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: error ? "var(--error)" : done ? "var(--success)" : "var(--text-secondary)" }}>
          {status}
        </span>
        {total > 0 && (
          <span className="text-mono-xs" style={{ color: "var(--text-tertiary)" }}>
            {progress}/{total}
          </span>
        )}
      </div>
      <div className="progress-bar">
        {done || error ? (
          <div
            className="progress-bar-fill"
            style={{
              width: "100%",
              background: error ? "var(--error)" : "var(--accent)",
            }}
          />
        ) : total > 0 ? (
          <div className="progress-bar-fill" style={{ width: `${(progress / total) * 100}%` }} />
        ) : (
          <div className="progress-bar-indeterminate" />
        )}
      </div>
    </div>
  );
}

// ─── Connection Card ──────────────────────────────────────────────────────────
function ConnectionCard({
  conn,
  onDeleted,
}: {
  conn: Connection;
  onDeleted: () => void;
}) {
  const [indexing, setIndexing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${conn.name}"?`)) return;
    setDeleting(true);
    try {
      await deleteConnection(conn.id);
      onDeleted();
      toast.success("Connection deleted");
    } catch {
      toast.error("Failed to delete connection");
      setDeleting(false);
    }
  };

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "var(--bg-overlay)",
            border: "1px solid var(--border-default)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Database size={18} style={{ color: "var(--accent)" }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
              {conn.name}
            </h3>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-tertiary)", fontFamily: "Geist Mono, monospace" }}>
            Added {new Date(conn.created_at).toLocaleDateString()}
          </p>

          {indexing && (
            <IndexingProgress
              connectionId={conn.id}
              onDone={() => setIndexing(false)}
            />
          )}
        </div>

        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setIndexing(true)}
            disabled={indexing}
            style={{ gap: 4 }}
            data-tooltip="Re-index schema"
          >
            <RefreshCw size={12} style={{ animation: indexing ? "spin 1s linear infinite" : "none" }} />
            {indexing ? "Indexing…" : "Re-index"}
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={handleDelete}
            disabled={deleting}
            data-tooltip="Delete connection"
          >
            {deleting ? <Loader2 size={12} /> : <Trash2 size={12} />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ConnectionSkeleton() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ width: 140, height: 16, marginBottom: 6 }} />
          <div className="skeleton" style={{ width: 80, height: 11 }} />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { isSignedIn, getToken } = useAuth();
  const { addConnection, removeConnection, setConnections: storeSet } = useConnectionStore();

  const load = useCallback(async () => {
    // Ensure the token getter is registered before the first authenticated fetch
    setTokenGetter(() => getToken());
    setLoading(true);
    try {
      const conns = await getConnections();
      setConnections(conns);
      storeSet(conns);
    } finally {
      setLoading(false);
    }
  }, [storeSet, getToken]);

  useEffect(() => { if (isSignedIn) load(); }, [load, isSignedIn]);

  const handleAdded = (conn: Connection) => {
    setConnections((prev) => [...prev, conn]);
    addConnection(conn);
  };

  const handleDeleted = (id: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== id));
    removeConnection(id);
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 className="font-heading" style={{ fontSize: 28, marginBottom: 6 }}>
            Connections
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
            Manage PostgreSQL database connections. Credentials are encrypted end-to-end.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          style={{ gap: 6, flexShrink: 0 }}
        >
          <Plus size={14} />
          Add Connection
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {loading ? (
          <>
            <ConnectionSkeleton />
            <ConnectionSkeleton />
          </>
        ) : connections.length === 0 ? (
          <div
            className="card"
            style={{
              padding: "48px 24px",
              textAlign: "center",
            }}
          >
            <Database size={32} style={{ color: "var(--text-tertiary)", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 15, color: "var(--text-secondary)", marginBottom: 4 }}>
              No connections yet
            </p>
            <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginBottom: 20 }}>
              Add your first PostgreSQL database to get started.
            </p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ gap: 6 }}>
              <Plus size={13} />
              Add First Connection
            </button>
          </div>
        ) : (
          connections.map((conn) => (
            <ConnectionCard
              key={conn.id}
              conn={conn}
              onDeleted={() => handleDeleted(conn.id)}
            />
          ))
        )}
      </div>

      {showModal && (
        <AddConnectionModal
          onClose={() => setShowModal(false)}
          onAdded={handleAdded}
        />
      )}
    </div>
  );
}
