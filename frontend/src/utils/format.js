export const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
};

export const formatCompactBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0B';
  if (bytes < 1024) return bytes + 'B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + 'GB';
};

export const formatCount = (value) => {
  if (!value) return '0';
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
  if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
  return value.toString();
};

export const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '0s';
  if (seconds < 60) return seconds.toFixed(1) + 's';
  return (seconds / 60).toFixed(1) + 'm';
};

export const formatDurationLevel = (seconds) => {
  if (seconds < 5) return 'Low';
  if (seconds < 30) return 'Medium';
  if (seconds < 300) return 'High';
  return 'Critical';
};

export const formatBytesLevel = (bytes) => {
  if (bytes < 1000) return 'Low';
  if (bytes < 100000) return 'Medium';
  if (bytes < 10000000) return 'High';
  return 'Critical';
};

export const formatPacketLevel = (packets) => {
  if (packets < 50) return 'Low';
  if (packets < 500) return 'Medium';
  if (packets < 5000) return 'High';
  return 'Critical';
};

export const formatTimeCompact = (isoString) => {
  if (!isoString) return '--';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return diffMins + 'm';
  if (diffHours < 24) return diffHours + 'h';
  if (diffDays < 7) return diffDays + 'd';
  return date.toLocaleDateString();
};

export const formatTimestamp = (isoString) => {
  if (!isoString) return '--:--';
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

export const formatClock = (isoString) => {
  if (!isoString) return '--:--:--';
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

export const getSeverityColor = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return 'text-rose-300 bg-rose-500/10 border-rose-400/20';
    case 'high':
      return 'text-orange-300 bg-orange-500/10 border-orange-400/20';
    case 'medium':
      return 'text-amber-300 bg-amber-500/10 border-amber-400/20';
    case 'low':
      return 'text-emerald-300 bg-emerald-500/10 border-emerald-400/20';
    default:
      return 'text-slate-300 bg-slate-500/10 border-slate-400/20';
  }
};

export const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
      return 'text-rose-300 bg-rose-500/10';
    case 'ACKNOWLEDGED':
      return 'text-amber-300 bg-amber-500/10';
    case 'RESOLVED':
      return 'text-emerald-300 bg-emerald-500/10';
    default:
      return 'text-slate-300 bg-slate-500/10';
  }
};

export const normalizeMetric = (value, min, max) => {
  if (value <= min) return 0;
  if (value >= max) return 100;
  return ((value - min) / (max - min)) * 100;
};

export const getHeatColor = (value) => {
  if (value < 0.3) return 'from-emerald-600 to-emerald-400';
  if (value < 0.6) return 'from-amber-600 to-amber-400';
  return 'from-rose-600 to-rose-400';
};
