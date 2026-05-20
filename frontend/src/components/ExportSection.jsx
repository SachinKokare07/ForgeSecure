import { useState } from 'react';
import { exportPDF, exportCSV } from '../utils/exportUtils';

function ExportSection({ logs, stats }) {
  const [exporting, setExporting] = useState(false);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      exportPDF(logs, stats);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      exportCSV(logs);
    } catch (error) {
      console.error('CSV export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mb-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.35)]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">
        Export Reports
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleExportPDF}
          disabled={exporting || !logs.length}
          className={`px-4 py-2 text-xs rounded-lg font-semibold uppercase tracking-[0.15em] transition-all duration-200 flex items-center gap-2 ${
            exporting || !logs.length
              ? 'border border-slate-600 bg-slate-900/40 text-slate-500 cursor-not-allowed'
              : 'border border-cyan-400/40 bg-cyan-400/15 text-cyan-300 hover:border-cyan-400/60 hover:bg-cyan-400/25 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]'
          }`}
        >
          <span>📄</span>
          {exporting ? 'Exporting...' : 'Export PDF'}
        </button>

        <button
          onClick={handleExportCSV}
          disabled={exporting || !logs.length}
          className={`px-4 py-2 text-xs rounded-lg font-semibold uppercase tracking-[0.15em] transition-all duration-200 flex items-center gap-2 ${
            exporting || !logs.length
              ? 'border border-slate-600 bg-slate-900/40 text-slate-500 cursor-not-allowed'
              : 'border border-emerald-400/40 bg-emerald-400/15 text-emerald-300 hover:border-emerald-400/60 hover:bg-emerald-400/25 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]'
          }`}
        >
          <span>📊</span>
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>

        <div className="ml-auto flex items-center text-xs text-slate-400">
          <span>{logs.length} entries to export</span>
        </div>
      </div>
    </div>
  );
}

export default ExportSection;
