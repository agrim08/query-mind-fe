import type { HistoryEntry } from "@/lib/api";

export type HistoryStatus = HistoryEntry["status"];

/** How each question status reads in history: plain words, and the tone of its dot. */
const STATUS: Record<HistoryStatus, { label: string; tone: "success" | "warning" | "error" | "info" | "muted" }> = {
  success: { label: "Answered", tone: "success" },
  clarify: { label: "Asked you", tone: "info" },
  validation_error: { label: "Not run", tone: "warning" },
  error: { label: "Failed", tone: "error" },
  pending: { label: "Running", tone: "muted" },
};

export const statusLabel = (status: HistoryStatus): string => STATUS[status]?.label ?? status;
export const statusTone = (status: HistoryStatus) => STATUS[status]?.tone ?? "muted";
