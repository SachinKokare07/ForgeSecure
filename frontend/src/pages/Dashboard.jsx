import { useEffect, useMemo, useRef, useState } from "react";
import { getLogs, updateIncidentStatus } from "../services/api";
import socket from "../socket/socket";
import { formatTimestamp, formatClock } from "../utils/format";
import { mergeLogs, normalizeLogs } from "../utils/dashboard";
import Navbar from "../components/Navbar";
import StatsCard from "../components/StatsCard";
import AlertCard from "../components/AlertCard";
import TrafficChart from "../components/TrafficChart";
import RiskChart from "../components/RiskChart";
import HeatmapChart from "../components/HeatmapChart";
import DeviceTable from "../components/DeviceTable";
import FilterBar from "../components/FilterBar";
import ExportSection from "../components/ExportSection";

const POLL_INTERVAL = 3000;
const FLASH_DURATION = 1800;
const MAX_CHART_POINTS = 20;
const MAX_FEED_ITEMS = 5;
const TELEMETRY_FRESH_MS = 12000;

function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("--");
  const [socketStatus, setSocketStatus] = useState("connecting");
  const [flashIds, setFlashIds] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(0);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [selectedFilter, setSelectedFilter] = useState("all");

  const pollRef = useRef(null);
  const flashTimersRef = useRef(new Map());
  const soundEnabledRef = useRef(false);

  const handleAcknowledge = async (id) => {
    try {
      const updatedLog = await updateIncidentStatus(id, "ACKNOWLEDGED");
      setLogs((prev) => prev.map((log) => (log._id === id ? updatedLog : log)));
    } catch (err) {
      console.error("Failed to acknowledge:", err);
    }
  };

  const handleResolve = async (id) => {
    try {
      const updatedLog = await updateIncidentStatus(id, "RESOLVED");
      setLogs((prev) => prev.map((log) => (log._id === id ? updatedLog : log)));
    } catch (err) {
      console.error("Failed to resolve:", err);
    }
  };

  useEffect(() => {
    let mounted = true;

    const fetchLogs = async () => {
      try {
        const data = await getLogs();
        if (!mounted) return;
        setLogs((current) => mergeLogs(normalizeLogs(data), current));
        setError("");
        setLastUpdated(formatClock(new Date()));
        setLastUpdatedAt(Date.now());
      } catch (err) {
        if (mounted) {
          setError("Unable to fetch logs");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchLogs();

    const startPolling = () => {
      if (pollRef.current) return;
      pollRef.current = window.setInterval(fetchLogs, POLL_INTERVAL);
    };

    const stopPolling = () => {
      if (!pollRef.current) return;
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    };

    const handleConnect = () => {
      if (!mounted) return;
      setSocketStatus("connected");
      stopPolling();
      setError("");
    };

    const handleDisconnect = () => {
      if (!mounted) return;
      setSocketStatus("disconnected");
      setError("Socket disconnected. Polling fallback active.");
      startPolling();
    };

    const upsertLog = (payload) => {
      const nextLogs = normalizeLogs(Array.isArray(payload) ? payload : [payload]);
      if (!nextLogs.length || !mounted) return;

      const incomingIds = nextLogs.map((log) => log._id).filter(Boolean);
      setLogs((current) => mergeLogs(nextLogs, current));

      setFlashIds((current) => {
        const updated = Array.from(new Set([...incomingIds, ...current]));
        incomingIds.forEach((id) => {
          const timer = flashTimersRef.current.get(id);
          if (timer) clearTimeout(timer);

          const newTimer = window.setTimeout(() => {
            setFlashIds((ids) => ids.filter((fid) => fid !== id));
            flashTimersRef.current.delete(id);
          }, FLASH_DURATION);

          flashTimersRef.current.set(id, newTimer);
        });
        return updated;
      });

      setLastUpdated(formatClock(new Date()));
      setLastUpdatedAt(Date.now());

      const hasCritical = nextLogs.some((log) => log.severity === "CRITICAL");
      if (hasCritical && soundEnabledRef.current) {
        const critical = nextLogs.find((log) => log.severity === "CRITICAL");
        if (critical?._id) {
          window.dispatchEvent(new CustomEvent("forgesecure-critical-alert", { detail: critical }));
        }
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("new-log", upsertLog);
    socket.on("anomaly-detected", (payload) => {
      upsertLog(Array.isArray(payload) ? payload : { ...payload, status: "ANOMALY", severity: payload?.severity || "CRITICAL" });
    });
    socket.on("incident-updated", (updated) => {
      setLogs((prev) => prev.map((log) => (log._id === updated._id ? updated : log)));
    });

    if (socket.connected) handleConnect();

    return () => {
      mounted = false;
      stopPolling();
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("new-log", upsertLog);
      socket.off("anomaly-detected");
      socket.off("incident-updated");
      flashTimersRef.current.forEach((timer) => clearTimeout(timer));
      flashTimersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    const tick = window.setInterval(() => setCurrentTime(Date.now()), 5000);
    return () => window.clearInterval(tick);
  }, []);

  const sortedLogs = useMemo(() => logs.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [logs]);

  const chartLogs = useMemo(() => sortedLogs.slice(0, MAX_CHART_POINTS).reverse(), [sortedLogs]);

  const filteredLogs = useMemo(() => {
    if (selectedFilter === "all") return sortedLogs;
    return sortedLogs.filter((log) => {
      switch (selectedFilter) {
        case "normal":
          return log.status === "NORMAL";
        case "anomaly":
          return log.status === "ANOMALY";
        case "critical":
          return log.severity === "CRITICAL";
        case "active":
          return log.incidentStatus === "ACTIVE";
        case "acknowledged":
          return log.incidentStatus === "ACKNOWLEDGED";
        case "resolved":
          return log.incidentStatus === "RESOLVED";
        default:
          return true;
      }
    });
  }, [sortedLogs, selectedFilter]);

  const anomalyLogs = useMemo(() => filteredLogs.filter((log) => log.status === "ANOMALY" || log.severity === "CRITICAL"), [filteredLogs]);
  const liveFeed = useMemo(() => filteredLogs.slice(0, MAX_FEED_ITEMS), [filteredLogs]);
  const totalLogs = sortedLogs.length;
  const totalAnomalies = sortedLogs.filter((log) => log.status === "ANOMALY").length;
  const criticalThreats = sortedLogs.filter((log) => log.severity === "CRITICAL").length;
  const activeDevices = new Set(sortedLogs.map((log) => log.device).filter(Boolean)).size;

  const topBanner = sortedLogs.find((log) => {
    const age = Date.now() - new Date(log.createdAt).getTime();
    return log.severity === "CRITICAL" && age < 60000;
  });

  const telemetryFresh = lastUpdatedAt ? currentTime - lastUpdatedAt < TELEMETRY_FRESH_MS : false;

  const health = {
    backend: error ? "degraded" : loading ? "checking" : "online",
    ai: totalLogs ? "active" : "standby",
    simulator: telemetryFresh ? "live" : totalLogs ? "idle" : "waiting",
    socket: socketStatus === "connected" ? "connected" : socketStatus === "disconnected" ? "fallback" : "connecting",
  };

  const exportStats = {
    totalLogs: filteredLogs.length,
    totalAnomalies: filteredLogs.filter((log) => log.status === "ANOMALY").length,
    criticalThreats: filteredLogs.filter((log) => log.severity === "CRITICAL").length,
    activeDevices: new Set(filteredLogs.map((log) => log.device).filter(Boolean)).size,
  };

  return (
    <div className="min-h-screen text-slate-100 overflow-x-hidden">
      {topBanner && (
        <div className="critical-banner border-b border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-50 shadow-[0_0_40px_rgba(239,68,68,0.18)] backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <span className="critical-pulse relative inline-flex h-3 w-3 rounded-full bg-red-400" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-red-100">Critical Network Threat Detected</span>
              <span className="hidden text-red-50/85 sm:inline">{topBanner.device} escalated to {topBanner.severity}</span>
            </div>
          </div>
        </div>
      )}

      <Navbar
        lastUpdated={lastUpdated}
        totalLogs={totalLogs}
        connectionLabel={socketStatus === "connected" ? "Socket Live" : "Polling Fallback"}
        health={health}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((s) => !s)}
      />

      <main className="mx-auto w-full max-w-full px-4 py-5 sm:px-6 lg:px-8 overflow-x-hidden">
        <FilterBar selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />
        <ExportSection logs={filteredLogs} stats={exportStats} />

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatsCard title="Total Logs" value={totalLogs} subtitle="Network telemetry events." tone="cyan" accentLabel="Live" />
          <StatsCard title="Total Anomalies" value={totalAnomalies} subtitle="AI-detected suspicious activity." tone="red" accentLabel="Threats" />
          <StatsCard title="Critical Threats" value={criticalThreats} subtitle="Highest severity incidents." tone="amber" accentLabel="Urgent" />
          <StatsCard title="Active Devices" value={activeDevices} subtitle="Devices reporting telemetry." tone="green" accentLabel="Online" />
        </section>

        <section className="mt-4 grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-[2fr_1fr] xl:items-stretch">
          <div className="grid h-full min-h-0 grid-rows-3 gap-4 auto-rows-fr">
            <TrafficChart logs={chartLogs} />
            <RiskChart logs={chartLogs} />
            <HeatmapChart logs={chartLogs} />
          </div>

          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 p-5 self-stretch">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Live Threat Feed</h3>
                <p className="mt-1 text-sm text-slate-400">Latest network telemetry.</p>
              </div>
            </div>
            <div className="mt-3 min-h-0 flex-1 space-y-2.5 overflow-auto pr-1">
              {liveFeed.length ? (
                liveFeed.map((log) => (
                  <AlertCard
                    key={log._id}
                    id={log._id}
                    device={log.device}
                    duration={log.duration}
                    src_bytes={log.src_bytes}
                    dst_bytes={log.dst_bytes}
                    src_pkts={log.src_pkts}
                    dst_pkts={log.dst_pkts}
                    severity={log.severity}
                    status={log.status}
                    confidence={log.confidence}
                    incidentStatus={log.incidentStatus}
                    timestamp={formatTimestamp(log.createdAt)}
                    compact
                    animated={flashIds.includes(log._id)}
                    onAcknowledge={handleAcknowledge}
                    onResolve={handleResolve}
                  />
                ))
              ) : (
                <EmptyState message="No telemetry received yet." />
              )}
            </div>
          </div>
        </section>

        <section className="-mt-4 grid gap-3 grid-cols-1 lg:grid-cols-2 xl:grid-cols-[2fr_1fr] items-stretch">
          <DeviceTable logs={filteredLogs} />
          <div className="relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 shadow-[0_20px_80px_rgba(2,6,23,0.35)]" style={{ maxHeight: 550 }}>
            <div className="border-b border-white/10 bg-linear-to-r from-slate-950/40 to-slate-950/20 px-4 py-3 backdrop-blur sm:px-5 sm:py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-white">Recent Anomalies</h3>
                  <p className="mt-0.5 text-xs text-slate-400">Escalated events requiring attention.</p>
                </div>
                <span className="shrink-0 rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.26em] text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.06)]">
                  {anomalyLogs.length}
                </span>
              </div>
            </div>
            <div className="mt-2 space-y-2.5 overflow-auto flex-1">
              {anomalyLogs.length ? (
                anomalyLogs.slice(0, 5).map((log) => (
                  <AlertCard
                    key={log._id}
                    id={log._id}
                    device={log.device}
                    duration={log.duration}
                    src_bytes={log.src_bytes}
                    dst_bytes={log.dst_bytes}
                    src_pkts={log.src_pkts}
                    dst_pkts={log.dst_pkts}
                    severity={log.severity}
                    status={log.status}
                    confidence={log.confidence}
                    incidentStatus={log.incidentStatus}
                    timestamp={formatTimestamp(log.createdAt)}
                    animated={flashIds.includes(log._id)}
                    onAcknowledge={handleAcknowledge}
                    onResolve={handleResolve}
                  />
                ))
              ) : (
                <EmptyState message="No anomalies detected." />
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-5 text-sm text-slate-400">
      {message}
    </div>
  );
}

export default Dashboard;
