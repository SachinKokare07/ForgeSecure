export const THRESHOLD_CONFIG = {
  duration: { low: 5, medium: 30, high: 300 },
  bytes: { low: 1000, medium: 100000, high: 10000000 },
  packets: { low: 50, medium: 500, high: 5000 },
};

export const SEVERITY_COLORS = {
  CRITICAL: 'text-red-300 bg-red-500/10 border-red-400/30',
  HIGH: 'text-orange-300 bg-orange-500/10 border-orange-400/30',
  MEDIUM: 'text-amber-300 bg-amber-500/10 border-amber-400/30',
  LOW: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30',
  UNKNOWN: 'text-slate-300 bg-slate-500/10 border-slate-400/30',
};

export const STATUS_COLORS = {
  NORMAL: 'bg-emerald-500/10 border-emerald-400/20 text-emerald-200',
  ANOMALY: 'bg-rose-500/10 border-rose-400/20 text-rose-200',
  ERROR: 'bg-red-500/10 border-red-400/20 text-red-200',
};

export const INCIDENT_COLORS = {
  ACTIVE: 'bg-red-500/10 border-red-400/20 text-red-200',
  ACKNOWLEDGED: 'bg-amber-500/10 border-amber-400/20 text-amber-200',
  RESOLVED: 'bg-emerald-500/10 border-emerald-400/20 text-emerald-200',
};

export const COLUMNS = [
  { key: 'device', label: 'Device', width: 'w-[28%]' },
  { key: 'severity', label: 'Severity', width: 'w-[10%]' },
  { key: 'status', label: 'Status', width: 'w-[12%]' },
  { key: 'duration', label: 'Duration', width: 'w-[10%]' },
  { key: 'src_bytes', label: 'Src Bytes', width: 'w-[10%]' },
  { key: 'dst_bytes', label: 'Dst Bytes', width: 'w-[10%]' },
  { key: 'src_pkts', label: 'Src Pkts', width: 'w-[8%]' },
  { key: 'dst_pkts', label: 'Dst Pkts', width: 'w-[8%]' },
  { key: 'incidentStatus', label: 'Incident', width: 'w-[12%]' },
];

export const TABLE_MAX_HEIGHT = 550;

export const getLevelColor = (value, config) => {
  if (value >= config.high) return 'text-red-300';
  if (value >= config.medium) return 'text-amber-300';
  if (value >= config.low) return 'text-yellow-300';
  return 'text-emerald-300';
};

export const getRowHighlight = (severity, status) => {
  if (severity === 'CRITICAL') return 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10';
  if (status === 'ANOMALY') return 'border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/8';
  return 'border-white/5 bg-slate-900/20 hover:bg-slate-900/30';
};
