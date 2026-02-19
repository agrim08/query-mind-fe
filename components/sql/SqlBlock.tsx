"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import SqlHighlighter from "./SqlHighlighter";

interface SqlBlockProps {
  sql: string;
  streaming?: boolean;
}

export default function SqlBlock({ sql, streaming = false }: SqlBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [sql]);

  return (
    <div className="sql-block">
      <div className="sql-block-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {streaming && <span className="streaming-dot" />}
          <span className="text-mono-xs" style={{ color: "var(--text-tertiary)" }}>
            {streaming ? "generating sql" : "sql query"}
          </span>
        </div>
        {!streaming && sql && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleCopy}
            style={{ gap: 4, padding: "2px 8px" }}
            data-tooltip={copied ? "Copied!" : "Copy SQL"}
          >
            {copied ? (
              <Check size={12} style={{ color: "var(--success)" }} />
            ) : (
              <Copy size={12} />
            )}
            <span style={{ fontSize: 11 }}>{copied ? "Copied" : "Copy"}</span>
          </button>
        )}
      </div>

      {sql || streaming ? (
        <SqlHighlighter sql={sql} streaming={streaming} />
      ) : (
        <div className="sql-content" style={{ color: "var(--text-tertiary)", fontStyle: "italic" }}>
          -- No query generated yet
        </div>
      )}
    </div>
  );
}
