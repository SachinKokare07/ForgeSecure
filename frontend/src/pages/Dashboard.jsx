import { useEffect, useMemo, useRef, useState } from "react";

import { getLogs, updateIncidentStatus } from "../services/api";

import socket from "../socket/socket";

import Navbar from "../components/Navbar";
import StatsCard from "../components/StatsCard";
import AlertCard from "../components/AlertCard";
import TrafficChart from "../components/TrafficChart";
import RiskChart from "../components/RiskChart";
import HeatmapChart from "../components/HeatmapChart";
import DeviceTable from "../components/DeviceTable";

const FALLBACK_POLL_INTERVAL_MS = 3000;
const NEW_ITEM_FLASH_MS = 1800;
const MAX_CHART_POINTS = 20;
const MAX_FEED_ITEMS = 5;
const SIMULATOR_FRESHNESS_MS = 12000;

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

  const fallbackPollRef = useRef(null);
  const flashTimersRef = useRef(new Map());
  const soundEnabledRef = useRef(false);

  const handleAcknowledge = async (id) => {
    try {
      const updatedLog = await updateIncidentStatus(id, "ACKNOWLEDGED");

      setLogs((prevLogs) =>
        prevLogs.map((log) => (log._id === id ? updatedLog : log)),
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleResolve = async (id) => {
    try {
      const updatedLog = await updateIncidentStatus(id, "RESOLVED");

      setLogs((prevLogs) =>
        prevLogs.map((log) => (log._id === id ? updatedLog : log)),
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const refreshLogs = async () => {
      try {
        const backendLogs = await getLogs();

        if (!mounted) return;

        const normalizedLogs = normalizeLogs(backendLogs);

        setLogs((currentLogs) => mergeLogs(normalizedLogs, currentLogs));

        setError("");

        setLastUpdated(formatClock(new Date()));

        setLastUpdatedAt(Date.now());
      } catch (error) {
        console.log(error);

        if (!mounted) return;

        setError("Unable to refresh logs from backend.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    refreshLogs();

    const startFallbackPolling = () => {
      if (fallbackPollRef.current) return;

      fallbackPollRef.current = window.setInterval(
        refreshLogs,
        FALLBACK_POLL_INTERVAL_MS,
      );
    };

    const stopFallbackPolling = () => {
      if (!fallbackPollRef.current) return;

      window.clearInterval(fallbackPollRef.current);

      fallbackPollRef.current = null;
    };

    const handleConnection = () => {
      if (!mounted) return;

      setSocketStatus("connected");

      stopFallbackPolling();

      setError("");
    };

    const handleDisconnect = () => {
      if (!mounted) return;

      setSocketStatus("disconnected");

      setError("Socket disconnected. Using polling fallback.");

      startFallbackPolling();
    };

    const upsertLiveLog = (payload) => {
      const nextLogs = normalizeLogs(
        Array.isArray(payload) ? payload : [payload],
      );

      if (!nextLogs.length || !mounted) return;

      const incomingIds = nextLogs.map((log) => log._id).filter(Boolean);

      setLogs((currentLogs) => mergeLogs(nextLogs, currentLogs));

      setFlashIds((currentIds) => {
        const nextIds = Array.from(new Set([...incomingIds, ...currentIds]));

        incomingIds.forEach((incomingId) => {
          const existingTimer = flashTimersRef.current.get(incomingId);

          if (existingTimer) {
            window.clearTimeout(existingTimer);
          }

          const timerId = window.setTimeout(() => {
            setFlashIds((ids) => ids.filter((id) => id !== incomingId));

            flashTimersRef.current.delete(incomingId);
          }, NEW_ITEM_FLASH_MS);

          flashTimersRef.current.set(incomingId, timerId);
        });

        return nextIds;
      });

      setLastUpdated(formatClock(new Date()));

      setLastUpdatedAt(Date.now());

      const hasCritical = nextLogs.some((log) => log.severity === "CRITICAL");

      const primaryCritical = nextLogs.find(
        (log) => log.severity === "CRITICAL",
      );

      if (hasCritical && primaryCritical?._id && soundEnabledRef.current) {
        window.dispatchEvent(
          new CustomEvent("forgesecure-critical-alert", {
            detail: primaryCritical,
          }),
        );
      }
    };

    const handleNewLog = (payload) => {
      upsertLiveLog(payload);
    };

    const handleAnomalyDetected = (payload) => {
      if (Array.isArray(payload)) {
        upsertLiveLog(payload);

        return;
      }

      upsertLiveLog({
        ...payload,
        status: "ANOMALY",
        severity: payload?.severity || "CRITICAL",
      });
    };

    socket.on("connect", handleConnection);

    socket.on("disconnect", handleDisconnect);

    socket.on("new-log", handleNewLog);

    socket.on("anomaly-detected", handleAnomalyDetected);

    socket.on("incident-updated", (updatedLog) => {
      setLogs((prevLogs) =>
        prevLogs.map((log) => (log._id === updatedLog._id ? updatedLog : log)),
      );
    });

    if (socket.connected) {
      handleConnection();
    }

    return () => {
      mounted = false;

      stopFallbackPolling();

      socket.off("connect", handleConnection);

      socket.off("disconnect", handleDisconnect);

      socket.off("new-log", handleNewLog);

      socket.off("anomaly-detected", handleAnomalyDetected);

      socket.off("incident-updated");

      flashTimersRef.current.forEach((timerId) => {
        clearTimeout(timerId);
      });

      flashTimersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    const tickId = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 5000);

    return () => {
      window.clearInterval(tickId);
    };
  }, []);

  const sortedLogs = useMemo(() => {
    return logs
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [logs]);

  const chartLogs = useMemo(() => {
    return sortedLogs.slice(0, MAX_CHART_POINTS).reverse();
  }, [sortedLogs]);

  const anomalyLogs = useMemo(() => {
    return sortedLogs.filter(
      (log) => log.status === "ANOMALY" || log.severity === "CRITICAL",
    );
  }, [sortedLogs]);

  const liveFeed = useMemo(() => {
    return sortedLogs.slice(0, MAX_FEED_ITEMS);
  }, [sortedLogs]);

  const totalLogs = sortedLogs.length;

  const totalAnomalies = sortedLogs.filter(
    (log) => log.status === "ANOMALY",
  ).length;

  const criticalThreats = sortedLogs.filter(
    (log) => log.severity === "CRITICAL",
  ).length;

  const activeDevices = new Set(
    sortedLogs.map((log) => log.device).filter(Boolean),
  ).size;

  const topBanner = sortedLogs.find((log) => {
    const age = Date.now() - new Date(log.createdAt).getTime();

    return log.severity === "CRITICAL" && age < 60000;
  });

  const telemetryFresh = lastUpdatedAt
    ? currentTime - lastUpdatedAt < SIMULATOR_FRESHNESS_MS
    : false;

  const health = {
    backend: error ? "degraded" : loading ? "checking" : "online",

    ai: totalLogs ? "active" : "standby",

    simulator: telemetryFresh ? "live" : totalLogs ? "idle" : "waiting",

    socket:
      socketStatus === "connected"
        ? "connected"
        : socketStatus === "disconnected"
          ? "fallback"
          : "connecting",
  };

  return (
    <div className="min-h-screen text-slate-100">
      {topBanner ? (
        <div className="critical-banner border-b border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-50 shadow-[0_0_40px_rgba(239,68,68,0.18)] backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <span className="critical-pulse relative inline-flex h-3 w-3 rounded-full bg-red-400" />

              <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-red-100">
                Critical Industrial Threat Detected
              </span>

              <span className="hidden text-red-50/85 sm:inline">
                {topBanner.device} escalated to {topBanner.severity}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      <Navbar
        lastUpdated={lastUpdated}
        totalLogs={totalLogs}
        connectionLabel={
          socketStatus === "connected" ? "Socket Live" : "Polling Fallback"
        }
        health={health}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((value) => !value)}
      />

      <main className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 lg:px-6 lg:py-5">
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            title="Total Logs"
            value={totalLogs}
            subtitle="Industrial telemetry events."
            tone="cyan"
            accentLabel="Live"
          />

          <StatsCard
            title="Total Anomalies"
            value={totalAnomalies}
            subtitle="AI-detected suspicious activity."
            tone="red"
            accentLabel="Threats"
          />

          <StatsCard
            title="Critical Threats"
            value={criticalThreats}
            subtitle="Highest severity incidents."
            tone="amber"
            accentLabel="Urgent"
          />

          <StatsCard
            title="Active Devices"
            value={activeDevices}
            subtitle="Devices reporting telemetry."
            tone="green"
            accentLabel="Online"
          />
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_0.9fr]">
          <div className="space-y-4">
            <TrafficChart logs={chartLogs} />

            <RiskChart logs={chartLogs} />

            <HeatmapChart logs={chartLogs} />
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Live Threat Feed
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Latest OT telemetry.
                </p>
              </div>
            </div>

            <div className="mt-3 space-y-2.5">
              {liveFeed.length ? (
                liveFeed.map((log) => (
                  <AlertCard
                    key={log._id}
                    id={log._id}
                    device={log.device}
                    traffic={log.traffic}
                    cpu={log.cpu}
                    temperature={log.temperature}
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

        <section className="-mt-4 grid gap-3 xl:grid-cols-[1.55fr_0.95fr]">
          <DeviceTable logs={sortedLogs} />

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 flex flex-col overflow-hidden max-h-[550px]">
            <div className="flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Recent Anomalies
                </h3>

                <p className="mt-0.5 text-xs text-slate-400">
                  Escalated events requiring attention.
                </p>
              </div>
            </div>

            <div className="mt-2 space-y-2.5 overflow-auto flex-1">
              {anomalyLogs.length ? (
                anomalyLogs
                  .slice(0, 5)
                  .map((log) => (
                    <AlertCard
                      key={log._id}
                      id={log._id}
                      device={log.device}
                      traffic={log.traffic}
                      cpu={log.cpu}
                      temperature={log.temperature}
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

function mergeLogs(incomingLogs, currentLogs) {
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
}

function normalizeLogs(data) {
  if (!Array.isArray(data)) return [];

  return data.map((log) => ({
    ...log,

    device: log.device || "UNKNOWN_DEVICE",

    traffic: Number(log.traffic) || 0,

    cpu: Number(log.cpu) || 0,

    temperature: Number(log.temperature) || 0,

    confidence: Number(log.confidence) || 0,

    incidentStatus: log.incidentStatus || "ACTIVE",

    status: log.status || "NORMAL",

    severity: log.severity || "LOW",

    createdAt: log.createdAt || new Date().toISOString(),
  }));
}

function formatTimestamp(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatClock(value) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(value);
}

export default Dashboard;
