import {
  Area,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  ReferenceLine,
} from 'recharts'

function TrafficChart({ logs }) {
  const chartData = logs
    .slice(0, 20)
    .reverse()
    .map((log) => ({
      ...log,
      label: new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date(log.createdAt)),
      anomalyTraffic: log.status === 'ANOMALY' || log.severity === 'CRITICAL' ? log.traffic : null,
    }))

  const trafficValues = chartData.map((item) => item.traffic)
  const maxTraffic = trafficValues.length ? Math.max(...trafficValues) : 0
  const minTraffic = trafficValues.length ? Math.min(...trafficValues) : 0
  const yMin = trafficValues.length ? Math.max(0, Math.floor(minTraffic * 0.85)) : 0
  const yMax = trafficValues.length ? Math.ceil(maxTraffic * 1.15) : 10

  const highestTraffic = chartData.length ? Math.max(...chartData.map((item) => item.traffic)) : 0
  const averageTraffic = chartData.length
    ? Math.round(chartData.reduce((sum, item) => sum + item.traffic, 0) / chartData.length)
    : 0

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.35)] sm:p-5">
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.10),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(239,68,68,0.08),transparent_24%)]" />
        <div className="telemetry-sweep absolute inset-y-0 left-0 w-1/2 bg-linear-to-r from-transparent via-cyan-400/10 to-transparent" />
      </div>

      <div className="relative mb-4 flex items-start justify-between gap-4 sm:mb-5">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.45)]">
              <span className="absolute inset-0 animate-ping rounded-full bg-cyan-400 opacity-70" />
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-cyan-300">Live Telemetry</p>
          </div>
          <h3 className="text-lg font-semibold text-white sm:text-xl">Traffic Monitoring</h3>
          <p className="mt-1 text-sm text-slate-400">Latest 20 logs with anomaly spikes emphasized in red.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-right text-xs text-slate-300">
          <Metric label="Peak" value={highestTraffic} />
          <Metric label="Average" value={averageTraffic} />
        </div>
      </div>

      <div className="relative h-64 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="trafficFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.48} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="trafficLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
              <linearGradient id="anomalyLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f87171" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
              <filter id="trafficGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.2" result="blur" />
                <feColorMatrix
                  in="blur"
                  type="matrix"
                  values="1 0 0 0 0
                          0 1 0 0 0
                          0 0 1 0 0
                          0 0 0 0.6 0"
                />
              </filter>
            </defs>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.10)" strokeDasharray="4 4" />
            <XAxis dataKey="label" minTickGap={22} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[yMin, yMax]} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} />
            <ReferenceLine y={averageTraffic} stroke="#f59e0b" strokeDasharray="6 6" label={{ value: 'Avg', fill: '#fbbf24', fontSize: 11 }} />
            <Area type="monotone" dataKey="traffic" stroke="url(#trafficLine)" fill="url(#trafficFill)" strokeWidth={2} isAnimationActive animationDuration={700} />
            <Line type="monotone" dataKey="traffic" stroke="rgba(34,211,238,0.18)" strokeWidth={6} dot={false} isAnimationActive animationDuration={700} />
            <Line type="monotone" dataKey="anomalyTraffic" connectNulls={false} stroke="url(#anomalyLine)" strokeWidth={3.2} dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }} activeDot={{ r: 7 }} isAnimationActive animationDuration={700} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  )
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  const { traffic, device, severity, status, cpu, temperature } = payload[0].payload

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/95 px-4 py-3 shadow-2xl backdrop-blur">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{device}</p>
      <div className="mt-2 space-y-1 text-sm text-slate-300">
        <p>Traffic: {traffic}</p>
        <p>CPU: {cpu}%</p>
        <p>Temperature: {temperature}°C</p>
        <p>Status: {status}</p>
        <p>Severity: {severity}</p>
      </div>
    </div>
  )
}

export default TrafficChart