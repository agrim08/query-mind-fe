import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

// Export Canvas to PDF
export async function exportCanvasToPDF(elementId: string) {
  const canvasElement = document.getElementById(elementId);
  if (!canvasElement) return;

  try {
    const dataUrl = await toPng(canvasElement, {
      backgroundColor: '#0a0a0a', // Assuming dark mode based on QueryMind vibe
      style: {
        transform: 'scale(1)', // Fix scale rendering issues if canvas is zoomed
      }
    });

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvasElement.offsetWidth, canvasElement.offsetHeight],
    });

    pdf.addImage(dataUrl, 'PNG', 0, 0, canvasElement.offsetWidth, canvasElement.offsetHeight);
    pdf.save('db-schema-design.pdf');
  } catch (error) {
    console.error('Failed to export PDF', error);
  }
}
