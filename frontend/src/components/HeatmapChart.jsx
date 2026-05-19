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
  const maxCpu = logs.length ? Math.max(...logs.map((l) => l.cpu || 0)) : 100
  const maxTemp = logs.length ? Math.max(...logs.map((l) => l.temperature || 0)) : 100
  const maxTraffic = logs.length ? Math.max(...logs.map((l) => l.traffic || 0)) : 10000

  // Prepare heatmap data
  const heatmapData = devices.map((device, idx) => ({
    deviceIndex: idx,
    deviceName: device.device,
    cpu: normalizeMetric(device.cpu, maxCpu),
    temperature: normalizeMetric(device.temperature, maxTemp),
    traffic: normalizeMetric(device.traffic, maxTraffic),
  }))

  // Get color based on intensity
  const getHeatColor = (value) => {
    if (value < 25) return '#10b981' // green
    if (value < 50) return '#f59e0b' // amber
    if (value < 75) return '#f97316' // orange
    return '#ef4444' // red
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.35)] sm:p-5">
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.10),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(239,68,68,0.08),transparent_24%)]" />
      </div>

      <div className="relative mb-4 flex items-start justify-between gap-4 sm:mb-5">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.45)]">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-70" />
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-emerald-300">Device Health</p>
          </div>
          <h3 className="text-lg font-semibold text-white sm:text-xl">Metrics Heatmap</h3>
          <p className="mt-1 text-sm text-slate-400">Device metrics intensity visualization (Green: Healthy → Red: Critical)</p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-right text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded bg-cyan-400" />
            <span>CPU</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded bg-orange-400" />
            <span>Temp</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded bg-purple-400" />
            <span>Traffic</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {heatmapData.map((device) => (
          <div key={device.deviceName} className="group">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300 truncate max-w-24">{device.deviceName}</span>
              <span className="text-[10px] text-slate-500">
                CPU: {Math.round(device.cpu)}% | Temp: {Math.round(device.temperature)}% | Traffic: {Math.round(device.traffic)}%
              </span>
            </div>

            <div className="flex gap-1.5 overflow-hidden rounded-lg bg-slate-900/20 p-1.5">
              <div
                className="flex-1 rounded h-6 transition-all duration-300 group-hover:h-7"
                style={{
                  backgroundColor: getHeatColor(device.cpu),
                  opacity: 0.6,
                  boxShadow: `0 0 12px ${getHeatColor(device.cpu)}40`,
                }}
                title={`CPU: ${Math.round(device.cpu)}%`}
              />
              <div
                className="flex-1 rounded h-6 transition-all duration-300 group-hover:h-7"
                style={{
                  backgroundColor: getHeatColor(device.temperature),
                  opacity: 0.6,
                  boxShadow: `0 0 12px ${getHeatColor(device.temperature)}40`,
                }}
                title={`Temperature: ${Math.round(device.temperature)}%`}
              />
              <div
                className="flex-1 rounded h-6 transition-all duration-300 group-hover:h-7"
                style={{
                  backgroundColor: getHeatColor(device.traffic),
                  opacity: 0.6,
                  boxShadow: `0 0 12px ${getHeatColor(device.traffic)}40`,
                }}
                title={`Traffic: ${Math.round(device.traffic)}%`}
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
