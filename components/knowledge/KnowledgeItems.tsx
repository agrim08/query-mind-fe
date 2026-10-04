"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  type KnowledgeItem,
  type KnowledgeKind,
  addKnowledgeItem,
  deleteKnowledgeItem,
  updateKnowledgeItem,
} from "@/lib/api";

interface KnowledgeItemsProps {
  connectionId: string;
  items: KnowledgeItem[];
  onChange: (items: KnowledgeItem[]) => void;
}

const KIND_LABELS: Record<KnowledgeKind, string> = {
  metric: "Metric",
  term: "Term",
  filter: "Default filter",
  convention: "Convention",
  table_note: "Table",
  clarification: "Your earlier answer",
};
const EDITABLE_KINDS: KnowledgeKind[] = ["metric", "term", "filter", "convention", "table_note"];
const SOURCE_LABELS: Record<KnowledgeItem["source"], string> = {
  ai: "AI",
  user: "You",
  clarification: "Remembered",
};
const PLACEHOLDERS: Record<KnowledgeKind, string> = {
  metric: "e.g. SUM(orders.total) for orders with status 'paid'",
  term: "e.g. logged in within the last 30 days (users.last_login_at)",
  filter: "e.g. exclude test accounts: email not like '%@example.com'",
  convention: "e.g. our fiscal year starts on 1 April",
  table_note: "e.g. one row per subscription change",
  clarification: "",
};

interface Draft {
  kind: KnowledgeKind;
  name: string;
  definition: string;
}

function ItemForm({ initial, onSave, onCancel }: { initial: Draft; onSave: (d: Draft) => Promise<void>; onCancel: () => void }) {
  const [draft, setDraft] = useState(initial);
  const [saving, setSaving] = useState(false);
  const valid = draft.name.trim() && draft.definition.trim();
  return (
    <form
      className="card"
      style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}
      onSubmit={async (e) => {
        e.preventDefault();
        if (!valid) return;
        setSaving(true);
        try {
          await onSave({ ...draft, name: draft.name.trim(), definition: draft.definition.trim() });
        } finally {
          setSaving(false);
        }
      }}
    >
      <div style={{ display: "flex", gap: 8 }}>
        <label className="sr-only" htmlFor="knowledge-kind">Type</label>
        <select
          id="knowledge-kind"
          className="input"
          style={{ width: 170 }}
          value={draft.kind}
          onChange={(e) => setDraft({ ...draft, kind: e.target.value as KnowledgeKind })}
        >
          {(initial.kind === "clarification" ? ["clarification" as KnowledgeKind] : EDITABLE_KINDS).map((k) => (
            <option key={k} value={k}>{KIND_LABELS[k]}</option>
          ))}
        </select>
        <label className="sr-only" htmlFor="knowledge-name">Name</label>
        <input
          id="knowledge-name"
          className="input"
          placeholder={draft.kind === "table_note" ? "Table name" : "Name, e.g. revenue"}
          maxLength={200}
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          style={{ flex: 1 }}
        />
      </div>
      <label className="sr-only" htmlFor="knowledge-definition">Definition</label>
      <textarea
        id="knowledge-definition"
        className="textarea"
        rows={2}
        maxLength={1000}
        placeholder={PLACEHOLDERS[draft.kind]}
        value={draft.definition}
        onChange={(e) => setDraft({ ...draft, definition: e.target.value })}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary btn-sm" disabled={!valid || saving}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

/** The definitions QueryMind follows for this connection: add, edit, remove. */
export default function KnowledgeItems({ connectionId, items, onChange }: KnowledgeItemsProps) {
  const [editing, setEditing] = useState<string | "new" | null>(null);

  const report = (err: unknown) =>
    toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");

  const add = async (draft: Draft) => {
    try {
      onChange([...items, await addKnowledgeItem(connectionId, draft)]);
      setEditing(null);
    } catch (err) {
      report(err);
    }
  };

  const update = async (id: string, draft: Draft) => {
    try {
      const saved = await updateKnowledgeItem(connectionId, id, draft);
      onChange(items.map((i) => (i.id === id ? saved : i)));
      setEditing(null);
    } catch (err) {
      report(err);
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteKnowledgeItem(connectionId, id);
      onChange(items.filter((i) => i.id !== id));
    } catch (err) {
      report(err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 className="answer-headline">Definitions</h2>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing("new")} style={{ gap: 4 }}>
          <Plus size={13} />
          Add definition
        </button>
      </div>
      {editing === "new" && (
        <ItemForm initial={{ kind: "metric", name: "", definition: "" }} onSave={add} onCancel={() => setEditing(null)} />
      )}
      {items.length === 0 && editing !== "new" && (
        <p className="answer-understood">
          No definitions yet. Save a business description and extract them, or add your own.
        </p>
      )}
      {items.map((item) =>
        editing === item.id ? (
          <ItemForm
            key={item.id}
            initial={{ kind: item.kind, name: item.name, definition: item.definition }}
            onSave={(d) => update(item.id, d)}
            onCancel={() => setEditing(null)}
          />
        ) : (
          <div key={item.id} className="card" style={{ padding: "10px 14px", display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <strong style={{ color: "var(--text-primary)", fontSize: 14 }}>{item.name}</strong>
                <span className="badge badge-default">{KIND_LABELS[item.kind]}</span>
                <span className="text-mono-xs" style={{ color: "var(--text-tertiary)" }}>{SOURCE_LABELS[item.source]}</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4, overflowWrap: "anywhere" }}>
                {item.definition}
              </p>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" aria-label={`Edit ${item.name}`} onClick={() => setEditing(item.id)}>
              <Pencil size={13} />
            </button>
            <button type="button" className="btn btn-ghost btn-sm" aria-label={`Remove ${item.name}`} onClick={() => remove(item.id)}>
              <Trash2 size={13} />
            </button>
          </div>
        ),
      )}
    </div>
  );
}
