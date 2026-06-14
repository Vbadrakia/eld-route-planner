import React, { useRef, useCallback } from 'react';
import LogSheetCanvas from './LogSheetCanvas';
import jsPDF from 'jspdf';

/**
 * LogSheetViewer — renders all daily ELD log sheets and provides
 * Print, Download SVG, and Download PDF actions.
 */
export default function LogSheetViewer({ dailyLogs }) {
  const containerRef = useRef(null);

  // ── Download SVG ──────────────────────────────────────────
  const downloadSVG = useCallback((dayIndex) => {
    const svgs = containerRef.current?.querySelectorAll('svg');
    if (!svgs || !svgs[dayIndex]) return;
    const svgEl = svgs[dayIndex];
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgEl);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eld-log-day-${dayIndex + 1}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // ── Download PDF (all sheets) ─────────────────────────────
  const downloadPDF = useCallback(async () => {
    const svgs = containerRef.current?.querySelectorAll('svg');
    if (!svgs || svgs.length === 0) return;

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [820, 340] });

    for (let i = 0; i < svgs.length; i++) {
      if (i > 0) pdf.addPage([820, 340], 'landscape');
      const svgEl = svgs[i];
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgEl);
      const canvas = document.createElement('canvas');
      canvas.width = 1640;
      canvas.height = 680;
      const ctx = canvas.getContext('2d');
      const img = new Image();

      await new Promise((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, 1640, 680);
          const imgData = canvas.toDataURL('image/png');
          pdf.addImage(imgData, 'PNG', 0, 0, 820, 340);
          resolve();
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
      });
    }

    pdf.save('eld-daily-logs.pdf');
  }, []);

  // ── Print ─────────────────────────────────────────────────
  const printLogs = useCallback(() => {
    window.print();
  }, []);

  if (!dailyLogs || dailyLogs.length === 0) return null;

  return (
    <div id="log-sheet-viewer" className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          ELD Daily Log Sheets ({dailyLogs.length} {dailyLogs.length === 1 ? 'day' : 'days'})
        </h2>

        <div className="flex gap-2 no-print">
          <button
            onClick={printLogs}
            className="px-4 py-2 text-sm font-semibold rounded-xl
                       bg-surface-200 dark:bg-surface-700 text-surface-900 dark:text-white
                       hover:bg-surface-300 dark:hover:bg-surface-600 transition-all duration-150
                       flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.75 3.75H5.25" />
            </svg>
            Print
          </button>
          <button
            onClick={downloadPDF}
            className="px-4 py-2 text-sm font-semibold rounded-xl text-white
                       bg-brand-500 hover:bg-brand-600 transition-all duration-150
                       flex items-center gap-1.5 shadow-md"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download PDF
          </button>
        </div>
      </div>

      {/* Log sheets */}
      <div ref={containerRef} className="space-y-4">
        {dailyLogs.map((log, i) => (
          <div
            key={i}
            className="bg-white dark:bg-surface-800 rounded-2xl p-4 shadow-card transition-theme"
          >
            <div className="flex items-center justify-between mb-2 no-print">
              <span className="text-sm font-semibold text-surface-700 dark:text-surface-200">
                Day {log.day} — {log.date}
              </span>
              <button
                onClick={() => downloadSVG(i)}
                className="text-xs text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                SVG
              </button>
            </div>
            <LogSheetCanvas
              log={log}
              carrierName="Spotter Logistics"
              vehicleNumber="TRK-4521"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
