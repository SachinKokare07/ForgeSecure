import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function HeatmapChart({ logs }) {
  // Get unique devices with their latest metrics
  const deviceMap = new Map()
  
  logs.forEach((log) => {
    if (!deviceMap.has(log.device)) {
      deviceMap.set(log.device, log)
    }
  })

  const devices = Array.from(deviceMap.values()).slice(0, 10)

  // Normalize values for color intensity (0-100)
  const normalizeMetric = (value, max) => {
    return Math.min(100, (value / max) * 100)
  }

  // Get max values across all devices
  const maxDuration = logs.length ? Math.max(...logs.map((l) => l.duration || 0)) : 100
  const maxSrcBytes = logs.length ? Math.max(...logs.map((l) => l.src_bytes || 0)) : 10000
  const maxDstBytes = logs.length ? Math.max(...logs.map((l) => l.dst_bytes || 0)) : 10000

  // Prepare heatmap data
  const heatmapData = devices.map((device, idx) => ({
    deviceIndex: idx,
    deviceName: device.device,
    duration: normalizeMetric(device.duration, maxDuration),
    src_bytes: normalizeMetric(device.src_bytes, maxSrcBytes),
    dst_bytes: normalizeMetric(device.dst_bytes, maxDstBytes),
  }))

  // Get color based on intensity
  const getHeatColor = (value) => {
    if (value < 25) return '#10b981' // green
    if (value < 50) return '#f59e0b' // amber
    if (value < 75) return '#f97316' // orange
    return '#ef4444' // red
  }

  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.35)] sm:p-5 h-48 sm:h-56 md:h-64 lg:h-full">
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.10),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(239,68,68,0.08),transparent_24%)]" />
      </div>

      <div className="relative mb-4 flex items-start justify-between gap-4 sm:mb-5">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.45)]">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-70" />
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-emerald-300">Network Telemetry</p>
          </div>
          <h3 className="text-lg font-semibold text-white sm:text-xl">Flow Metrics Heatmap</h3>
          <p className="mt-1 text-sm text-slate-400">Network telemetry intensity visualization (Green: Healthy → Red: Critical)</p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-right text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded bg-cyan-400" />
            <span>Duration</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded bg-orange-400" />
            <span>Src Bytes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded bg-purple-400" />
            <span>Dst Bytes</span>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-hidden">
        {heatmapData.map((device) => (
          <div key={device.deviceName} className="group">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300 truncate max-w-24">{device.deviceName}</span>
              <span className="text-[10px] text-slate-500">
                Duration: {Math.round(device.duration)}% | Src Bytes: {Math.round(device.src_bytes)}% | Dst Bytes: {Math.round(device.dst_bytes)}%
              </span>
            </div>

            <div className="flex gap-1.5 overflow-hidden rounded-lg bg-slate-900/20 p-1.5">
              <div
                className="flex-1 rounded h-6 transition-all duration-300 group-hover:h-7"
                style={{
                  backgroundColor: getHeatColor(device.duration),
                  opacity: 0.6,
                  boxShadow: `0 0 12px ${getHeatColor(device.duration)}40`,
                }}
                title={`Duration: ${Math.round(device.duration)}%`}
              />
              <div
                className="flex-1 rounded h-6 transition-all duration-300 group-hover:h-7"
                style={{
                  backgroundColor: getHeatColor(device.src_bytes),
                  opacity: 0.6,
                  boxShadow: `0 0 12px ${getHeatColor(device.src_bytes)}40`,
                }}
                title={`Src Bytes: ${Math.round(device.src_bytes)}%`}
              />
              <div
                className="flex-1 rounded h-6 transition-all duration-300 group-hover:h-7"
                style={{
                  backgroundColor: getHeatColor(device.dst_bytes),
                  opacity: 0.6,
                  boxShadow: `0 0 12px ${getHeatColor(device.dst_bytes)}40`,
                }}
                title={`Dst Bytes: ${Math.round(device.dst_bytes)}%`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
        <span className="text-xs text-slate-400">Intensity Scale</span>
        <div className="flex gap-2">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded bg-green-500" />
            <span className="text-[10px] text-slate-500">Healthy</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded bg-amber-500" />
            <span className="text-[10px] text-slate-500">Moderate</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded bg-red-500" />
            <span className="text-[10px] text-slate-500">Critical</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeatmapChart
