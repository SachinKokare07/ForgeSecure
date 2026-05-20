import { formatDuration, formatBytes, formatCompactBytes, formatCount, formatTimeCompact } from "../utils/format";
import { THRESHOLD_CONFIG, getRowHighlight, TABLE_MAX_HEIGHT } from "../utils/tableConfig";

function DeviceTable({ logs }) {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 shadow-[0_20px_80px_rgba(2,6,23,0.35)]" style={{ maxHeight: TABLE_MAX_HEIGHT }}>
      <div className="border-b border-white/10 bg-linear-to-r from-slate-950/40 to-slate-950/20 px-4 py-3 backdrop-blur sm:px-5 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.45)]">
                <span className="absolute inset-0 animate-ping rounded-full bg-cyan-400 opacity-70" />
              </span>
              <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-cyan-300">Network Telemetry</p>
            </div>
            <h3 className="text-base font-semibold text-white sm:text-lg">Device Activity Table</h3>
            <p className="mt-0.5 text-[11px] text-slate-400">Real-time monitoring from {logs.length} devices</p>
          </div>
          <span className="shrink-0 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.26em] text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
            {logs.length}
          </span>
        </div>
      </div>

      <div className="overflow-auto flex-1">
        {logs.length ? (
          <table className="min-w-full table-auto text-left text-sm">
            <thead className="sticky top-0 z-10 bg-linear-to-r from-slate-950/95 to-slate-900/90 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-300 backdrop-blur-sm">
              <tr className="border-b border-white/10">
                <th className="w-[28%] px-4 py-3 sm:px-5">Device</th>
                <th className="w-[10%] px-2 py-3 text-center sm:px-3">Duration</th>
                <th className="w-[12%] px-2 py-3 text-center sm:px-4">Src Bytes</th>
                <th className="w-[12%] px-2 py-3 text-center sm:px-4">Dst Bytes</th>
                <th className="w-[11%] px-2 py-3 text-center sm:px-3">Src Packets</th>
                <th className="w-[11%] px-2 py-3 text-center sm:px-3">Dst Packets</th>
                <th className="w-[11%] px-2 py-3 text-center sm:px-4">Status</th>
                <th className="w-[11%] px-2 py-3 text-center sm:px-4">Severity</th>
                <th className="w-[14%] px-3 py-3 text-right sm:px-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log, idx) => (
                <tr key={log._id} className={`transition-colors duration-150 ${idx % 2 === 0 ? 'bg-slate-950/30' : 'bg-slate-900/20'} ${getRowHighlight(log.severity, log.status)}`}>
                  <td className="px-4 py-2.5 sm:px-5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`shrink-0 h-2 w-2 rounded-full shadow-[0_0_6px_rgba(34,211,238,0.3)] ${getDeviceIndicator(log.severity)}`} />
                      <span className="truncate font-medium text-white text-xs sm:text-sm" title={log.device}>{log.device}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-center sm:px-4">
                    <Metric value={log.duration} format={formatDuration} />
                  </td>
                  <td className="px-2 py-2.5 text-center sm:px-3">
                    <Metric value={log.src_bytes} format={formatCompactBytes} config={THRESHOLD_CONFIG.bytes} />
                  </td>
                  <td className="px-2 py-2.5 text-center sm:px-3">
                    <Metric value={log.dst_bytes} format={formatCompactBytes} config={THRESHOLD_CONFIG.bytes} />
                  </td>
                  <td className="px-2 py-2.5 text-center sm:px-3">
                    <Metric value={log.src_pkts} format={formatCount} config={THRESHOLD_CONFIG.packets} />
                  </td>
                  <td className="px-2 py-2.5 text-center sm:px-3">
                    <Metric value={log.dst_pkts} format={formatCount} config={THRESHOLD_CONFIG.packets} />
                  </td>
                  <td className="px-2 py-2.5 text-center sm:px-4">
                    <CompactBadge value={log.status} tone={log.status === 'ANOMALY' ? 'red' : 'green'} />
                  </td>
                  <td className="px-2 py-2.5 text-center sm:px-4">
                    <CompactBadge value={log.severity} tone={getSeverityTone(log.severity)} />
                  </td>
                  <td className="px-3 py-2.5 text-right sm:px-4">
                    <span className="inline-block text-slate-400 text-[10px] sm:text-xs whitespace-nowrap">
                      {formatTimeCompact(log.createdAt)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex items-center justify-center px-4 py-12 text-center">
            <div>
              <p className="text-sm text-slate-400">No device logs available yet</p>
              <p className="text-xs text-slate-500 mt-1">Waiting for network telemetry data...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ value, format, config }) {
  const formatted = format(value);
  const color = config ? getMetricColor(Number(value) || 0, config) : 'text-slate-300';
  return (
    <span className={`inline-block px-1.5 py-1 rounded text-[10px] font-semibold ${color}`}>
      {formatted}
    </span>
  );
}

function getMetricColor(value, config) {
  if (value >= config.high) return 'text-red-100';
  if (value >= config.medium) return 'text-amber-100';
  if (value >= config.low) return 'text-yellow-100';
  return 'text-emerald-100';
}

function getDeviceIndicator(severity) {
  switch (severity) {
    case 'CRITICAL':
      return 'bg-red-400';
    case 'MEDIUM':
      return 'bg-amber-400';
    default:
      return 'bg-emerald-400';
  }
}

function getSeverityTone(severity) {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL':
      return 'red';
    case 'MEDIUM':
      return 'amber';
    default:
      return 'green';
  }
}

function CompactBadge({ value, tone }) {
  const toneClasses = {
    green: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-100',
    amber: 'border-amber-500/40 bg-amber-500/15 text-amber-100',
    red: 'border-red-500/40 bg-red-500/15 text-red-100',
  };

  const dotColors = {
    red: 'bg-red-400',
    amber: 'bg-amber-400',
    green: 'bg-emerald-400',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 border rounded px-2 py-1 text-[9px] font-bold uppercase tracking-[0.15em] ${toneClasses[tone] || toneClasses.green}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColors[tone]}`} />
      {value.slice(0, 3)}
    </span>
  );
}

export default DeviceTable;