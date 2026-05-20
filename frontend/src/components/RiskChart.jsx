import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function RiskChart({ logs }) {
  const chartData = logs
    .slice(0, 20)
    .reverse()
    .map((log) => {
      const riskScore = calculateRiskScore(log)

      return {
        ...log,
        label: new Intl.DateTimeFormat('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(new Date(log.createdAt)),
        riskScore,
        anomalyFlag: log.status === 'ANOMALY' || log.severity === 'CRITICAL' ? riskScore : null,
      }
    })

  const highestRisk = chartData.length ? Math.max(...chartData.map((item) => item.riskScore)) : 0
  const averageRisk = chartData.length
    ? Math.round(chartData.reduce((sum, item) => sum + item.riskScore, 0) / chartData.length)
    : 0

  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.35)] sm:p-5 h-56 sm:h-64 md:h-72 lg:h-full">
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.10),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.08),transparent_25%)]" />
      </div>

      <div className="relative mb-4 flex items-start justify-between gap-4 sm:mb-5">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-400 shadow-[0_0_18px_rgba(244,63,94,0.45)]">
              <span className="absolute inset-0 animate-ping rounded-full bg-rose-400 opacity-70" />
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-rose-300">Risk Exposure</p>
          </div>
          <h3 className="text-lg font-semibold text-white sm:text-xl">Threat Risk Analysis</h3>
          <p className="mt-1 text-sm text-slate-400">Live risk score derived from duration, bytes, packets, and anomaly state.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-right text-xs text-slate-300">
          <Metric label="Peak" value={highestRisk} tone="red" />
          <Metric label="Average" value={averageRisk} tone="amber" />
        </div>
      </div>

      <div className="relative min-h-0 flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.42} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="riskLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
              <linearGradient id="riskBars" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fb7185" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.35} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.10)" strokeDasharray="4 4" />
            <XAxis dataKey="label" minTickGap={22} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<RiskTooltip />} />
            <Area type="monotone" dataKey="riskScore" stroke="url(#riskLine)" fill="url(#riskFill)" strokeWidth={2} isAnimationActive animationDuration={700} />
            <Bar dataKey="anomalyFlag" fill="url(#riskBars)" radius={[6, 6, 0, 0]} barSize={10} isAnimationActive animationDuration={700} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function calculateRiskScore(log) {
  const durationComponent = Math.min(25, Math.round((Number(log.duration) || 0) * 2))
  const byteComponent = Math.min(35, Math.round(((Number(log.src_bytes) || 0) + (Number(log.dst_bytes) || 0)) / 5000))
  const packetComponent = Math.min(20, Math.round(((Number(log.src_pkts) || 0) + (Number(log.dst_pkts) || 0)) / 10))
  const anomalyComponent = log.status === 'ANOMALY' ? 20 : 0
  const criticalComponent = log.severity === 'CRITICAL' ? 15 : 0

  return Math.min(100, durationComponent + byteComponent + packetComponent + anomalyComponent + criticalComponent)
}

function Metric({ label, value, tone }) {
  const toneClasses = {
    red: 'border-red-500/20 bg-red-500/10 text-red-100',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-100',
  }
  return (
    <div className="w-full sm:w-auto max-w-full min-w-0 px-1 text-center">
      <p className="text-[9px] text-slate-400 uppercase font-semibold leading-tight truncate">{label}</p>
      <p className={`mt-1 text-sm sm:text-base font-semibold leading-tight ${tone === 'red' ? 'text-red-300' : tone === 'amber' ? 'text-amber-300' : 'text-white'}`}>{value}</p>
    </div>
  )
}

function RiskTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  const { riskScore, duration, src_bytes, dst_bytes, src_pkts, dst_pkts, status, severity } = payload[0].payload

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/95 px-4 py-3 shadow-2xl backdrop-blur">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">Risk score: {riskScore}</p>
      <div className="mt-2 space-y-1 text-sm text-slate-300">
        <p>Duration: {duration}</p>
        <p>Src Bytes: {src_bytes}</p>
        <p>Dst Bytes: {dst_bytes}</p>
        <p>Src Packets: {src_pkts}</p>
        <p>Dst Packets: {dst_pkts}</p>
        <p>Status: {status}</p>
        <p>Severity: {severity}</p>
      </div>
    </div>
  )
}

export default RiskChart