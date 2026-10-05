import type { HistoryEntry } from "@/lib/api";
import { downloadCsv } from "@/lib/csv";
import { statusLabel } from "@/lib/historyStatus";

const fileDate = () => new Date().toISOString().slice(0, 10);

/** The history page as a CSV file (Pro). */
export function exportHistoryCsv(entries: HistoryEntry[]): void {
  downloadCsv(
    `querymind-history-${fileDate()}.csv`,
    ["Date", "Question", "SQL", "Status", "Rows", "Time (ms)"],
    entries.map((e) => [
      new Date(e.created_at).toISOString(),
      e.nl_query,
      e.sql ?? "",
      statusLabel(e.status),
      e.row_count ?? "",
      e.exec_time_ms ?? "",
    ]),
  );
}

/** The history page as a PDF report (Team). jsPDF is loaded only when used. */
export async function exportHistoryPdf(entries: HistoryEntry[]): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "landscape" });
  const clip = (text: string, length: number) => (text.length > length ? `${text.slice(0, length)}…` : text);

  doc.setFontSize(16);
  doc.text("QueryMind — Question history", 14, 16);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Exported ${new Date().toLocaleString()} · ${entries.length} questions`, 14, 22);

  const columns = [14, 60, 140, 200, 230, 255];
  let y = 30;
  doc.setTextColor(0);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  ["Date", "Question", "SQL (preview)", "Status", "Rows", "Time"].forEach((h, i) => doc.text(h, columns[i], y));
  y += 6;
  doc.setDrawColor(200);
  doc.line(14, y, 283, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  for (const e of entries) {
    if (y > 190) {
      doc.addPage();
      y = 14;
    }
    [
      new Date(e.created_at).toLocaleString(),
      clip(e.nl_query, 48),
      clip(e.sql ?? "—", 34),
      statusLabel(e.status),
      String(e.row_count ?? "—"),
      e.exec_time_ms !== null ? `${e.exec_time_ms} ms` : "—",
    ].forEach((cell, i) => doc.text(cell, columns[i], y));
    y += 6;
  }

  doc.save(`querymind-history-${fileDate()}.pdf`);
}
