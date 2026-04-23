import React, { useState } from 'react';
import { Send, Plus, Trash2, DatabaseZap } from 'lucide-react';

export function DesignSidebar({
  selectedNode,
  onGenerate,
  onUpdateTable,
  onNewDesign,
  isGenerating,
  hasNodes
}: {
  selectedNode: any;
  onGenerate: (prompt: string) => void;
  onUpdateTable: (nodeId: string, data: any) => void;
  onNewDesign: () => void;
  isGenerating: boolean;
  hasNodes: boolean;
}) {
  const [prompt, setPrompt] = useState("");

  const handleCreateColumn = () => {
    if (!selectedNode) return;
    const newCols = [...(selectedNode.data.columns || []), { name: "new_column", type: "VARCHAR(255)" }];
    onUpdateTable(selectedNode.id, { ...selectedNode.data, columns: newCols });
  };

  const handleUpdateColumn = (index: number, field: string, value: any) => {
    if (!selectedNode) return;
    const newCols = [...selectedNode.data.columns];
    newCols[index] = { ...newCols[index], [field]: value };
    onUpdateTable(selectedNode.id, { ...selectedNode.data, columns: newCols });
  };

  const handleDeleteColumn = (index: number) => {
    if (!selectedNode) return;
    const newCols = selectedNode.data.columns.filter((_: any, i: number) => i !== index);
    onUpdateTable(selectedNode.id, { ...selectedNode.data, columns: newCols });
  };

  return (
    <div
      style={{
        width: 320,
        backgroundColor: "var(--bg-panel)",
        borderLeft: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "16px",
        overflowY: "auto"
      }}
    >
      {!selectedNode ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 className="font-heading" style={{ fontSize: 18, marginBottom: 4 }}>AI Generator</h2>
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Describe the database schema you want to build.</p>
            </div>
            {hasNodes && (
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={onNewDesign}
                style={{ color: 'var(--accent)', border: '1px solid var(--accent-glow)' }}
              >
                <Plus size={14} style={{ marginRight: 4 }} /> New
              </button>
            )}
          </div>
          <textarea
            className="textarea"
            placeholder="e.g. An e-commerce system with users, orders, and products."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            disabled={isGenerating}
          />
          <button
            className="btn btn-primary"
            onClick={() => onGenerate(prompt)}
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? "Generating..." : <><DatabaseZap size={14} /> Generate Schema</>}
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <h2 className="font-heading" style={{ fontSize: 18, marginBottom: 4 }}>Edit Table</h2>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Table Name</label>
            <input
              className="input"
              value={selectedNode.data.name}
              onChange={(e) => onUpdateTable(selectedNode.id, { ...selectedNode.data, name: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600 }}>Columns</h3>
            <button className="btn btn-sm btn-ghost" onClick={handleCreateColumn}>
              <Plus size={14} /> Add
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {selectedNode.data.columns?.map((col: any, i: number) => (
              <div key={i} style={{ border: "1px solid var(--border-subtle)", padding: "10px", borderRadius: 6, display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    className="input"
                    style={{ flex: 1, padding: "4px 8px", fontSize: 13 }}
                    value={col.name}
                    onChange={(e) => handleUpdateColumn(i, "name", e.target.value)}
                    placeholder="Column name"
                  />
                  <input
                    className="input"
                    style={{ width: "100px", padding: "4px 8px", fontSize: 13, fontFamily: "monospace" }}
                    value={col.type}
                    onChange={(e) => handleUpdateColumn(i, "type", e.target.value)}
                    placeholder="Type"
                  />
                  <button className="btn btn-sm" onClick={() => handleDeleteColumn(i)} style={{ padding: "0 6px", color: "var(--error)" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <input type="checkbox" checked={col.isPrimary} onChange={(e) => handleUpdateColumn(i, "isPrimary", e.target.checked)} />
                    PK
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <input type="checkbox" checked={col.isForeign} onChange={(e) => handleUpdateColumn(i, "isForeign", e.target.checked)} />
                    FK
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
