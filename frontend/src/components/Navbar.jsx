function Navbar({ lastUpdated, totalLogs, connectionLabel = 'Polling backend every 3s', health = {}, soundEnabled = false, onToggleSound }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/78 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-375 flex-col gap-3 px-3 py-3 sm:px-4 lg:px-6">
        <div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <img src="/image.png" alt="ForgeSecure Logo" className="h-11 w-11 object-contain" />
              <div>
                <p className="text-lg font-semibold uppercase tracking-[0.18em] text-white">ForgeSecure</p>
                <p className="text-sm text-slate-400">AI-Powered Network Anomaly Detection Platform</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="green">{connectionLabel}</Pill>
              <Pill tone={health.backend === 'online' ? 'green' : health.backend === 'degraded' ? 'red' : 'amber'}>Backend {labelForHealth(health.backend)}</Pill>
              <Pill tone={health.ai === 'active' ? 'green' : 'amber'}>AI {labelForHealth(health.ai)}</Pill>
              <Pill tone={health.simulator === 'live' ? 'green' : health.simulator === 'idle' ? 'amber' : 'slate'}>Simulator {labelForHealth(health.simulator)}</Pill>
              <Pill tone={health.socket === 'connected' ? 'green' : health.socket === 'fallback' ? 'amber' : 'slate'}>Socket {labelForHealth(health.socket)}</Pill>
              <button
                type="button"
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
                onClick={onToggleSound}
              >
                Alert sound {soundEnabled ? 'armed' : 'placeholder'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <Pill tone="cyan">Logs: {totalLogs}</Pill>
          <Pill tone="slate">Updated: {lastUpdated}</Pill>
          <Pill tone="cyan">Live network telemetry scan</Pill>
        </div>
      </div>
    </header>
  )
}

function labelForHealth(value) {
  const labels = {
    online: 'online',
    degraded: 'degraded',
    checking: 'checking',
    active: 'active',
    standby: 'standby',
    live: 'live',
    idle: 'idle',
    waiting: 'waiting',
    connected: 'connected',
    fallback: 'fallback',
    connecting: 'connecting',
  }

  return labels[value] || 'status'
}

function Pill({ tone, children }) {
  const toneClasses = {
    green: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200',
    cyan: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
    slate: 'border-white/10 bg-white/5 text-slate-300',
  }

  return (
    <div className={`rounded-full border px-4 py-2 text-xs font-medium ${toneClasses[tone] || toneClasses.slate}`}>
      {children}
    </div>
  )
}

export default Navbar