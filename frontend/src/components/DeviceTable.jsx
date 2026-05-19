function DeviceTable({ logs }) {
  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 shadow-[0_20px_80px_rgba(2,6,23,0.35)]"
      style={{ maxHeight: 550 }}
    >
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
                <tr
                  key={log._id}
                  className={`transition-colors duration-150 ${
                    idx % 2 === 0 ? 'bg-slate-950/30' : 'bg-slate-900/20'
                  } ${getRowHighlight(log.status, log.severity)}`}
                >
                  <td className="px-4 py-2.5 sm:px-5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`shrink-0 h-2 w-2 rounded-full shadow-[0_0_6px_rgba(34,211,238,0.3)] ${getDeviceIndicator(log.severity)}`} />
                      <span className="truncate font-medium text-white text-xs sm:text-sm" title={log.device}>
                        {log.device}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-center sm:px-4">
                    <span className={`inline-block px-2 py-1 rounded text-[10px] font-semibold whitespace-nowrap ${formatDurationLevel(log.duration)}`}>
                      {formatDurationValue(log.duration)}s
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-center sm:px-3">
                    <span className={`inline-block px-1.5 py-1 rounded text-[10px] font-semibold ${formatBytesLevel(log.src_bytes)}`}>
                      {formatCompactBytes(log.src_bytes)}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-center sm:px-3">
                    <span className={`inline-block px-1.5 py-1 rounded text-[10px] font-semibold ${formatBytesLevel(log.dst_bytes)}`}>
                      {formatCompactBytes(log.dst_bytes)}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-center sm:px-3">
                    <span className={`inline-block px-1.5 py-1 rounded text-[10px] font-semibold ${formatPacketLevel(log.src_pkts)}`}>
                      {formatCount(log.src_pkts)}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-center sm:px-3">
                    <span className={`inline-block px-1.5 py-1 rounded text-[10px] font-semibold ${formatPacketLevel(log.dst_pkts)}`}>
                      {formatCount(log.dst_pkts)}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-center sm:px-4">
                    <CompactBadge value={log.status} tone={log.status === 'ANOMALY' ? 'red' : 'green'} />
                  </td>
                  <td className="px-2 py-2.5 text-center sm:px-4">
                    <CompactBadge value={log.severity} tone={severityTone(log.severity)} />
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
  )
}

function getDeviceIndicator(severity) {
  if (severity === 'CRITICAL') return 'bg-red-400'
  if (severity === 'MEDIUM') return 'bg-amber-400'
  return 'bg-emerald-400'
}

function getRowHighlight(status, severity) {
  if (severity === 'CRITICAL') {
    return 'hover:bg-red-500/[0.12] border-l-2 border-l-red-500/40'
  }
  if (status === 'ANOMALY') {
    return 'hover:bg-rose-500/[0.1] border-l-2 border-l-rose-500/30'
  }
  return 'hover:bg-cyan-500/[0.05] border-l-2 border-l-transparent'
}

function CompactBadge({ value, tone }) {
  const toneClasses = {
    green: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-100',
    amber: 'border-amber-500/40 bg-amber-500/15 text-amber-100',
    red: 'border-red-500/40 bg-red-500/15 text-red-100',
  }

  const dotColors = {
    red: 'bg-red-400',
    amber: 'bg-amber-400',
    green: 'bg-emerald-400',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 border rounded px-2 py-1 text-[9px] font-bold uppercase tracking-[0.15em] ${toneClasses[tone] || toneClasses.green}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColors[tone]}`} />
      {value.slice(0, 3)}
    </span>
  )
}

function formatDurationLevel(duration) {
  const num = Number(duration) || 0
  if (num > 60) return 'bg-red-500/20 text-red-100 border border-red-500/30'
  if (num > 20) return 'bg-amber-500/20 text-amber-100 border border-amber-500/30'
  return 'bg-cyan-500/15 text-cyan-100 border border-cyan-500/25'
}

function formatBytesLevel(bytes) {
  const num = Number(bytes) || 0
  if (num > 1000000) return 'bg-red-500/20 text-red-100 border border-red-500/30'
  if (num > 100000) return 'bg-amber-500/20 text-amber-100 border border-amber-500/30'
  return 'bg-cyan-500/15 text-cyan-100 border border-cyan-500/25'
}

function formatPacketLevel(packets) {
  const num = Number(packets) || 0
  if (num > 250) return 'bg-red-500/20 text-red-100 border border-red-500/30'
  if (num > 100) return 'bg-amber-500/20 text-amber-100 border border-amber-500/30'
  return 'bg-emerald-500/15 text-emerald-100 border border-emerald-500/25'
}

function formatDurationValue(duration) {
  const num = Number(duration) || 0
  return num >= 10 || Number.isInteger(num) ? Math.round(num) : num.toFixed(1)
}

function formatCompactBytes(bytes) {
  const num = Number(bytes) || 0
  if (num >= 1024 * 1024) return `${(num / (1024 * 1024)).toFixed(1)}M`
  if (num >= 1024) return `${(num / 1024).toFixed(1)}K`
  return `${Math.round(num)}`
}

function formatCount(value) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(value) || 0)
}

function severityTone(severity) {
  if (severity === 'CRITICAL') return 'red'
  if (severity === 'MEDIUM') return 'amber'
  return 'green'
}

function formatTimeCompact(value) {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export default DeviceTable