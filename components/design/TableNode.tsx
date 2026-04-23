import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Key } from 'lucide-react';

interface Column {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
}

export const TableNode = memo(({ data, selected }: any) => {
  return (
    <div
      className={`card ${selected ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]' : ''}`}
      style={{
        width: 250,
        backgroundColor: "var(--bg-panel)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {/* Top Handle for Target Links */}
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      
      <div
        className="font-heading"
        style={{
          padding: "10px 14px",
          background: "var(--bg-overlay)",
          borderBottom: "1px solid var(--border-subtle)",
          color: "var(--text-primary)",
          fontSize: 16,
          fontWeight: 600,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        {data.name}
      </div>

      <div style={{ padding: "8px 0" }}>
        {data.columns?.map((col: Column, i: number) => (
          <div
            key={i}
            style={{
              padding: "6px 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 12,
              color: "var(--text-secondary)",
              borderBottom: i === data.columns.length - 1 ? 'none' : '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {col.isPrimary && (
                <span title="Primary Key">
                  <Key size={12} className="text-yellow-500" />
                </span>
              )}
              {col.isForeign && (
                <span title="Foreign Key">
                  <Key size={12} className="text-blue-400" />
                </span>
              )}
              <span style={{ fontWeight: col.isPrimary ? 600 : 400, color: col.isPrimary ? "var(--text-primary)" : undefined }}>
                {col.name}
              </span>
            </div>
            <span className="text-mono-xs" style={{ color: "var(--text-tertiary)" }}>
              {col.type}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom Handle for Source Links */}
      <Handle type="source" position={Position.Bottom} style={{ background: '#a1a1aa' }} />
    </div>
  );
});

TableNode.displayName = "TableNode";
