import { create } from "zustand";
import type { Connection, HistoryEntry } from "@/lib/api";

// ─── Connection Store ────────────────────────────────────────────────────────
interface ConnectionStore {
  connections: Connection[];
  selectedId: string | null;
  setConnections: (c: Connection[]) => void;
  selectConnection: (id: string) => void;
  addConnection: (c: Connection) => void;
  removeConnection: (id: string) => void;
}

export const useConnectionStore = create<ConnectionStore>((set) => ({
  connections: [],
  selectedId: null,
  setConnections: (connections) =>
    set({ connections, selectedId: connections[0]?.id ?? null }),
  selectConnection: (selectedId) => set({ selectedId }),
  addConnection: (c) =>
    set((s) => ({
      connections: [...s.connections, c],
      selectedId: s.selectedId ?? c.id,
    })),
  removeConnection: (id) =>
    set((s) => {
      const rest = s.connections.filter((c) => c.id !== id);
      return {
        connections: rest,
        selectedId: s.selectedId === id ? (rest[0]?.id ?? null) : s.selectedId,
      };
    }),
}));

// ─── Query Store ─────────────────────────────────────────────────────────────
interface QueryResult {
  sql: string;
  rows: Record<string, unknown>[];
  columns: string[];
  rowCount: number;
  execTimeMs: number;
}

interface QueryStore {
  nlQuery: string;
  streamingSql: string;
  isStreaming: boolean;
  result: QueryResult | null;
  error: string | null;
  setNlQuery: (q: string) => void;
  startStream: () => void;
  appendSqlChunk: (chunk: string) => void;
  setResult: (r: QueryResult) => void;
  setError: (e: string) => void;
  reset: () => void;
}

export const useQueryStore = create<QueryStore>((set) => ({
  nlQuery: "",
  streamingSql: "",
  isStreaming: false,
  result: null,
  error: null,
  setNlQuery: (nlQuery) => set({ nlQuery }),
  startStream: () =>
    set({ isStreaming: true, streamingSql: "", result: null, error: null }),
  appendSqlChunk: (chunk) =>
    set((s) => ({ streamingSql: s.streamingSql + chunk })),
  setResult: (result) => set({ isStreaming: false, result }),
  setError: (error) => set({ isStreaming: false, error }),
  reset: () =>
    set({
      nlQuery: "",
      streamingSql: "",
      isStreaming: false,
      result: null,
      error: null,
    }),
}));

// ─── History Store ───────────────────────────────────────────────────────────
interface HistoryStore {
  entries: HistoryEntry[];
  total: number;
  page: number;
  setEntries: (entries: HistoryEntry[], total: number) => void;
  setPage: (page: number) => void;
}

export const useHistoryStore = create<HistoryStore>((set) => ({
  entries: [],
  total: 0,
  page: 0,
  setEntries: (entries, total) => set({ entries, total }),
  setPage: (page) => set({ page }),
}));
