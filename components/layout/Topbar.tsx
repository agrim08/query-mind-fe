"use client";

import { useConnectionStore } from "@/lib/store";
import { useUiStore } from "@/lib/uiStore";
import { ChevronDown, Zap, Menu } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Topbar() {
  const { connections, selectedId, selectConnection } = useConnectionStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = connections.find((c) => c.id === selectedId);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="topbar">
      {/* Logo — hidden on app pages (sidebar has it), but page title would go here */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
        <button 
          className="btn btn-ghost btn-sm mobile-toggle" 
          onClick={useUiStore.getState().toggleMobileMenu}
          style={{ padding: 8 }}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Connection Selector */}
      <div className="dropdown" ref={ref}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setOpen((o) => !o)}
          style={{ gap: "6px", minWidth: 160 }}
        >
          <Zap size={12} style={{ color: "var(--accent)" }} />
          <span
            style={{
              flex: 1,
              textAlign: "left",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 120,
            }}
          >
            {selected?.name ?? "Select connection"}
          </span>
          <ChevronDown
            size={12}
            style={{
              color: "var(--text-tertiary)",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.15s",
            }}
          />
        </button>

        {open && connections.length > 0 && (
          <div className="dropdown-menu">
            {connections.map((c) => (
              <div
                key={c.id}
                className={`dropdown-item${c.id === selectedId ? " selected" : ""}`}
                onClick={() => {
                  selectConnection(c.id);
                  setOpen(false);
                }}
              >
                <Zap
                  size={11}
                  style={{ color: c.id === selectedId ? "var(--accent)" : "var(--text-tertiary)" }}
                />
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.name}
                </span>
              </div>
            ))}
          </div>
        )}

        {open && connections.length === 0 && (
          <div className="dropdown-menu" style={{ padding: "16px", textAlign: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
              No connections yet
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
