import { useCallback, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';

/** usePdfExport — pixel-perfect client-side PDF from the preview node. */
export function usePdfExport() {
  const [busy, setBusy] = useState(false);
  const exportPdf = useCallback(async (nodeId: string, filename: string) => {
    const el = document.getElementById(nodeId);
    if (!el) return;
    setBusy(true);
    try {
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageW / canvas.width, pageH / canvas.height);
      const w = canvas.width * ratio;
      const h = canvas.height * ratio;
      pdf.addImage(img, 'PNG', (pageW - w) / 2, 24, w, h);
      pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    } finally {
      setBusy(false);
    }
  }, []);
  return { exportPdf, busy };
}
