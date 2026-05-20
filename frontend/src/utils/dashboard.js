export const mergeLogs = (incomingLogs, currentLogs) => {
  const logMap = new Map();
  currentLogs.forEach((log) => {
    if (log?._id) {
      logMap.set(log._id, log);
    }
  });
  incomingLogs.forEach((log) => {
    if (log?._id) {
      logMap.set(log._id, log);
    }
  });
  return Array.from(logMap.values());
};

export const normalizeLogs = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map((log) => ({
    ...log,
    device: log.device || "UNKNOWN_DEVICE",
    duration: Number(log.duration) || 0,
    src_bytes: Number(log.src_bytes) || 0,
    dst_bytes: Number(log.dst_bytes) || 0,
    src_pkts: Number(log.src_pkts) || 0,
    dst_pkts: Number(log.dst_pkts) || 0,
    confidence: Number(log.confidence) || 0,
    incidentStatus: log.incidentStatus || "ACTIVE",
    status: log.status || "NORMAL",
    severity: log.severity || "LOW",
    createdAt: log.createdAt || new Date().toISOString(),
  }));
};
