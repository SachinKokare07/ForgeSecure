import { useEffect, useRef, useState } from 'react'

function StatsCard({ title, value, subtitle, tone = 'cyan', accentLabel }) {
  const toneClasses = {
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-400/20 text-cyan-200',
    green: 'from-emerald-500/20 to-emerald-500/5 border-emerald-400/20 text-emerald-200',
    red: 'from-rose-500/20 to-rose-500/5 border-rose-400/20 text-rose-200',
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-400/20 text-amber-200',
  }

  const numericValue = Number(value)
  const isNumeric = Number.isFinite(numericValue)
  const [displayValue, setDisplayValue] = useState(isNumeric ? numericValue : value)
  const previousValueRef = useRef(isNumeric ? numericValue : value)

  useEffect(() => {
    if (!isNumeric) {
      previousValueRef.current = value
      return
    }

    const fromValue = Number(previousValueRef.current) || 0
    const toValue = numericValue

    if (fromValue === toValue) {
      previousValueRef.current = toValue
      return
    }

    let frameId = 0
    const startTime = performance.now()
    const duration = 420

    const animate = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1)
      const easedProgress = 1 - Math.pow(1 - progress, 3)
      const animatedValue = Math.round(fromValue + (toValue - fromValue) * easedProgress)

      setDisplayValue(animatedValue)

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate)
      } else {
        previousValueRef.current = toValue
      }
    }

    frameId = window.requestAnimationFrame(animate)

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [numericValue, isNumeric, value])

  return (
    <div
      className={`group relative rounded-xl border bg-linear-to-br p-4 shadow-[0_20px_80px_rgba(2,6,23,0.35)] backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_100px_rgba(2,6,23,0.42)] sm:p-5 ${toneClasses[tone] || toneClasses.cyan}`}
    >
      <div className={`absolute inset-0 rounded-xl opacity-40 blur-xl transition duration-300 group-hover:opacity-60 ${tone === 'red' ? 'bg-red-500/10' : tone === 'amber' ? 'bg-amber-500/10' : tone === 'green' ? 'bg-emerald-500/10' : 'bg-cyan-500/10'}`} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${tone === 'red' ? 'bg-red-400' : tone === 'amber' ? 'bg-amber-400' : tone === 'green' ? 'bg-emerald-400' : 'bg-cyan-400'} shadow-[0_0_12px_rgba(34,211,238,0.45)]`}>
              <span className="absolute inset-0 rounded-full animate-ping bg-current opacity-70" />
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-slate-400">
              Live Metric
            </p>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-semibold text-white sm:mt-3">{displayValue}</p>
          <p className="mt-2 text-xs leading-5 text-slate-300 sm:text-sm">{subtitle}</p>
        </div>

        {accentLabel ? (
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
            {accentLabel}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default StatsCard