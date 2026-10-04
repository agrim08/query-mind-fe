import { create } from "zustand";
import type { AnswerPresentation, Connection, HistoryEntry } from "@/lib/api";

// ─── Connection Store ────────────────────────────────────────────────────────
interface ConnectionStore {
  connections: Connection[];
  selectedId: string | null;
  connectionsLoading: boolean;
  setConnections: (c: Connection[]) => void;
  setConnectionsLoading: (loading: boolean) => void;
  selectConnection: (id: string) => void;
  addConnection: (c: Connection) => void;
  removeConnection: (id: string) => void;
}

export const useConnectionStore = create<ConnectionStore>((set) => ({
  connections: [],
  selectedId: null,
  connectionsLoading: true,
  setConnections: (connections) =>
    set({ connections, selectedId: connections[0]?.id ?? null, connectionsLoading: false }),
  setConnectionsLoading: (connectionsLoading) => set({ connectionsLoading }),
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
export interface QueryResult {
  sql: string;
  rows: Record<string, unknown>[];
  columns: string[];
  rowCount: number;
  execTimeMs: number;
  truncated: boolean;
  answer: AnswerPresentation | null;
}

/** A clarifying question waiting for the user's choice. */
export interface PendingClarification {
  questionId: string;
  question: string;
  options: string[];
  understood: string | null;
}

interface QueryStore {
  nlQuery: string;
  streamingSql: string;
  isStreaming: boolean;
  result: QueryResult | null;
  clarification: PendingClarification | null;
  /** A plain-text answer (questions about the database itself). */
  message: string | null;
  error: string | null;
  setNlQuery: (q: string) => void;
  startStream: () => void;
  appendSqlChunk: (chunk: string) => void;
  restartSql: () => void;
  setResult: (r: QueryResult) => void;
  setClarification: (c: PendingClarification) => void;
  setMessage: (m: string) => void;
  setError: (e: string) => void;
  endStream: () => void;
  reset: () => void;
}

const EMPTY_ANSWER = { streamingSql: "", result: null, clarification: null, message: null, error: null };

export const useQueryStore = create<QueryStore>((set) => ({
  nlQuery: "",
  isStreaming: false,
  ...EMPTY_ANSWER,
  setNlQuery: (nlQuery) => set({ nlQuery }),
  startStream: () => set({ isStreaming: true, ...EMPTY_ANSWER }),
  appendSqlChunk: (chunk) =>
    set((s) => ({ streamingSql: s.streamingSql + chunk })),
  restartSql: () => set({ streamingSql: "" }),
  setResult: (result) => set({ isStreaming: false, result }),
  setClarification: (clarification) => set({ isStreaming: false, clarification }),
  setMessage: (message) => set({ isStreaming: false, message }),
  setError: (error) => set({ isStreaming: false, error }),
  endStream: () => set({ isStreaming: false }),
  reset: () => set({ nlQuery: "", isStreaming: false, ...EMPTY_ANSWER }),
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
