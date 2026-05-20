function AlertCard({
  id,
  device,
  duration,
  src_bytes,
  dst_bytes,
  src_pkts,
  dst_pkts,
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

      <div className="flex items-start justify-between gap-4 w-full box-border">

        <div className="flex-1 min-w-0">

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

            <h4 className="truncate text-sm font-semibold text-white" title={device}>
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
              ? "Network anomaly activity detected."
              : "Network telemetry is operating within expected thresholds."}
          </p>

        </div>

        <div className="text-right flex-shrink-0">

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

      <div className="mt-3 flex flex-wrap gap-3 text-sm sm:mt-4" style={{ width: '100%', boxSizing: 'border-box' }}>

        <Metric label="Duration" value={formatDuration(duration)} unit=" s" />

        <Metric label="Src Bytes" value={formatBytes(src_bytes)} unit="" />

        <Metric label="Dst Bytes" value={formatBytes(dst_bytes)} unit="" />

        <Metric label="Src Packets" value={formatCount(src_pkts)} unit="" />

        <Metric label="Dst Packets" value={formatCount(dst_pkts)} unit="" />

        <Metric label="Confidence" value={confidence} unit="%" highlight />

      </div>

      <div className="mt-4 flex items-center justify-between flex-wrap gap-3">

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

          <div className="flex gap-2 flex-wrap">

            {incidentStatus === "ACTIVE" && (

              <button
                onClick={() => onAcknowledge(id)}
                className="px-3 py-1 text-xs rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition-all flex-shrink-0"
              >
                Acknowledge
              </button>

            )}

            {incidentStatus !== "RESOLVED" && (

              <button
                onClick={() => onResolve(id)}
                className="px-3 py-1 text-xs rounded-lg bg-green-500 text-white font-semibold hover:bg-green-400 transition-all flex-shrink-0"
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
    <div className={`w-full sm:w-1/2 md:w-1/3 lg:w-1/6 box-border px-1`}>
      <div className="w-full text-center px-1">
        <p className="text-[9px] text-slate-400 uppercase font-semibold leading-tight truncate">{label}</p>
        <p className={`mt-1 text-sm sm:text-base font-semibold leading-tight ${highlight ? 'text-cyan-300' : 'text-white'}`}>{value}{unit}</p>
      </div>
    </div>
  )
}

function formatDuration(value) {
  const num = Number(value) || 0;

  return num.toFixed(num >= 10 || Number.isInteger(num) ? 0 : 1);
}

function formatCount(value) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatBytes(value) {
  const num = Number(value) || 0;

  if (num >= 1024 * 1024 * 1024) {
    return `${(num / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  if (num >= 1024 * 1024) {
    return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (num >= 1024) {
    return `${(num / 1024).toFixed(1)} KB`;
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(num);
}

export default AlertCard;