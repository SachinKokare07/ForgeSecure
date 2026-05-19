function AlertCard({
  id,
  device,
  traffic,
  cpu,
  temperature,
  severity,
  status,
  confidence,
  incidentStatus,
  timestamp,
  compact = false,
  animated = false,
  onAcknowledge,
  onResolve,
}) {

  const isCritical = severity === "CRITICAL";

  const isAnomaly = status === "ANOMALY";

  const badgeClasses = isCritical
    ? "border-red-500/50 bg-red-500/15 text-red-100 shadow-[0_0_18px_rgba(239,68,68,0.2)]"
    : isAnomaly
    ? "border-rose-500/40 bg-rose-500/15 text-rose-200"
    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";

  const containerClasses = compact
    ? "rounded-xl border border-white/10 bg-slate-950/60 p-3.5 sm:p-4"
    : "rounded-xl border border-white/10 bg-slate-950/60 p-4 sm:p-5";

  const animationClasses = animated
    ? isCritical
      ? "animate-critical-card border-red-500/50 shadow-[0_0_0_1px_rgba(239,68,68,0.28),0_0_50px_rgba(239,68,68,0.34)]"
      : isAnomaly
      ? "animate-live-card border-rose-500/30 shadow-[0_0_0_1px_rgba(244,63,94,0.2),0_0_30px_rgba(244,63,94,0.15)]"
      : "animate-live-card"
    : "";

  return (

    <div
      className={`${containerClasses} ${animationClasses} ${
        isCritical ? "ring-1 ring-red-500/20" : ""
      }`}
    >

      <div className="flex items-start justify-between gap-4">

        <div>

          <div className="flex items-center gap-2">

            <span
              className={`inline-flex h-2 w-2 rounded-full ${
                isCritical
                  ? "bg-red-400"
                  : isAnomaly
                  ? "bg-rose-400"
                  : "bg-emerald-400"
              } shadow-[0_0_12px_rgba(34,211,238,0.35)]`}
            />

            <h4 className="max-w-56 truncate text-sm font-semibold text-white sm:max-w-none">
              {device}
            </h4>

            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.24em] ${badgeClasses}`}
            >
              {severity}
            </span>

          </div>

          <p
            className={`mt-2 text-xs sm:text-sm ${
              isCritical
                ? "text-red-100"
                : "text-slate-300"
            }`}
          >
            {status === "ANOMALY"
              ? "Suspicious industrial activity detected."
              : "Device is operating within expected thresholds."}
          </p>

        </div>

        <div className="text-right">

          <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">
            {timestamp}
          </p>

          <p
            className={`mt-1 text-[10px] font-medium uppercase tracking-[0.22em] ${
              isCritical
                ? "text-red-200"
                : "text-slate-400"
            }`}
          >
            {isCritical ? "Critical" : status}
          </p>

        </div>

      </div>

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm sm:mt-4 sm:gap-3">

        <Metric
          label="Traffic"
          value={traffic}
          unit=" Mbps"
        />

        <Metric
          label="CPU"
          value={cpu}
          unit="%"
        />

        <Metric
          label="Temp"
          value={temperature}
          unit="°C"
        />

        <Metric
          label="Confidence"
          value={confidence}
          unit="%"
          highlight
        />

      </div>

      <div className="mt-4 flex items-center justify-between">

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            incidentStatus === "ACTIVE"
              ? "bg-red-500 text-white"
              : incidentStatus === "ACKNOWLEDGED"
              ? "bg-yellow-500 text-black"
              : "bg-green-500 text-white"
          }`}
        >
          {incidentStatus}
        </span>

        {status === "ANOMALY" && (

          <div className="flex gap-2">

            {incidentStatus === "ACTIVE" && (

              <button
                onClick={() => onAcknowledge(id)}
                className="px-3 py-1 text-xs rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition-all"
              >
                Acknowledge
              </button>

            )}

            {incidentStatus !== "RESOLVED" && (

              <button
                onClick={() => onResolve(id)}
                className="px-3 py-1 text-xs rounded-lg bg-green-500 text-white font-semibold hover:bg-green-400 transition-all"
              >
                Resolve
              </button>

            )}

          </div>

        )}

      </div>

    </div>

  );
}

function Metric({
  label,
  value,
  unit,
  highlight = false,
}) {

  return (

    <div
      className={`rounded-lg border px-2.5 py-2 sm:px-3 ${
        highlight
          ? "border-cyan-400/20 bg-cyan-400/10"
          : "border-white/5 bg-white/5"
      }`}
    >

      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>

      <p
        className={`mt-1 font-semibold ${
          highlight
            ? "text-cyan-300"
            : "text-white"
        }`}
      >
        {value}
        {unit}
      </p>

    </div>

  );
}

export default AlertCard;